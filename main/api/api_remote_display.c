/* SPDX-License-Identifier: LicenseRef-FNCL-1.1 */
#include "api/api_remote_display.h"
#include "sdkconfig.h"
#if CONFIG_APP_REMOTE_DISPLAY
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include "cJSON.h"
#include "esp_heap_caps.h"
#include "esp_random.h"
#include "esp_timer.h"
#include "lwip/sockets.h"
#include "lwip/tcp.h"
#include "ui/ui_remote_display.h"
#include "api/http_guard.h"

#define TILE 32U
#define PACKET_BYTES 16384U
#define MAX_TILES 225U
#define MAGIC 0x31524442U /* BDR1 */
typedef struct {
    uint8_t *baseline, *packet;
    const uint8_t *capture;
    uint16_t width, height, tiles[MAX_TILES], count, cursor;
    uint32_t epoch, sequence, base, input_sequence;
    bool baseline_valid, in_frame, ended;
    int64_t frame_started, rate_start;
    unsigned input_rate, message_rate;
} session_t;
/* All transport state is owned by the HTTP server task, including free_ctx. */
static session_t *s_session;
static char s_token[33];
static int64_t s_token_expires;

static bool same_origin(httpd_req_t *req)
{
    char origin[160], host[128], expected[160];
    if (httpd_req_get_hdr_value_str(req, "Origin", origin, sizeof(origin)) != ESP_OK ||
        httpd_req_get_hdr_value_str(req, "Host", host, sizeof(host)) != ESP_OK) return false;
    snprintf(expected, sizeof(expected), "http://%s", host);
    return strcmp(origin, expected) == 0;
}

static esp_err_t error(httpd_req_t *req, const char *status, const char *message)
{
    httpd_resp_set_status(req, status);
    httpd_resp_set_hdr(req, "Cache-Control", "no-store");
    return httpd_resp_sendstr(req, message);
}

static esp_err_t token_handler(httpd_req_t *req)
{
    if (!same_origin(req)) return error(req, "403 Forbidden", "Same-origin access required");
    if (!ui_remote_display_available()) return error(req, "503 Service Unavailable", "Live display not ready or paused for OTA");
    if (s_session) return error(req, "409 Conflict", "Live display already connected");
    uint8_t bytes[16];
    esp_fill_random(bytes, sizeof(bytes));
    for (unsigned i = 0; i < sizeof(bytes); ++i) snprintf(s_token + i * 2, 3, "%02x", bytes[i]);
    s_token_expires = esp_timer_get_time() + 30000000;
    char json[80];
    snprintf(json, sizeof(json), "{\"token\":\"%s\",\"version\":1}", s_token);
    httpd_resp_set_type(req, "application/json");
    httpd_resp_set_hdr(req, "Cache-Control", "no-store");
    return httpd_resp_sendstr(req, json);
}

static void session_free(void *ctx)
{
    session_t *s = ctx;
    if (s_session == s) {
        ui_remote_display_close();
        s_session = NULL;
    }
    heap_caps_free(s->baseline);
    heap_caps_free(s->packet);
    free(s);
}

static esp_err_t guarded_token_handler(httpd_req_t *req)
{
    return http_guard_handle(req, token_handler);
}

static esp_err_t pre_handshake(httpd_req_t *req)
{
    char query[64], token[40];
    if (!same_origin(req) || !s_token[0] || esp_timer_get_time() > s_token_expires ||
        httpd_req_get_url_query_str(req, query, sizeof(query)) != ESP_OK ||
        httpd_query_key_value(query, "token", token, sizeof(token)) != ESP_OK || strcmp(token, s_token)) {
        error(req, "403 Forbidden", "Invalid live display session"); return ESP_FAIL;
    }
    s_token[0] = 0;
    if (s_session) { error(req, "409 Conflict", "Live display busy"); return ESP_FAIL; }
    session_t *s = calloc(1, sizeof(*s));
    if (!s) return ESP_ERR_NO_MEM;
    /* S3-only adapter: checked again by the capture module at initialization. */
    size_t bytes = 480U * 480U * 2U;
    if (heap_caps_get_free_size(MALLOC_CAP_SPIRAM) > bytes * 2 + PACKET_BYTES + 512 * 1024U)
        s->baseline = heap_caps_malloc(bytes, MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT);
    s->packet = heap_caps_malloc(PACKET_BYTES, MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT);
    if (!s->baseline || !s->packet || ui_remote_display_open() != ESP_OK) {
        session_free(s);
        error(req, "503 Service Unavailable", "Live display not ready, suspended, or insufficient memory");
        return ESP_FAIL;
    }
    s->epoch = esp_random();
    s_session = s;
    req->sess_ctx = s;
    req->free_ctx = session_free;
    /* Bound this socket's sends/receives without changing existing API timeouts. */
    struct timeval timeout = {.tv_sec = 0, .tv_usec = 250000};
    int fd = httpd_req_to_sockfd(req);
    setsockopt(fd, SOL_SOCKET, SO_SNDTIMEO, &timeout, sizeof(timeout));
    setsockopt(fd, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout));
    int yes = 1, idle = 5, interval = 5, probes = 3;
    setsockopt(fd, SOL_SOCKET, SO_KEEPALIVE, &yes, sizeof(yes));
    setsockopt(fd, IPPROTO_TCP, TCP_KEEPIDLE, &idle, sizeof(idle));
    setsockopt(fd, IPPROTO_TCP, TCP_KEEPINTVL, &interval, sizeof(interval));
    setsockopt(fd, IPPROTO_TCP, TCP_KEEPCNT, &probes, sizeof(probes));
    return ESP_OK;
}

static esp_err_t text_frame(httpd_req_t *req, const char *text)
{
    httpd_ws_frame_t f = {.type = HTTPD_WS_TYPE_TEXT, .payload = (uint8_t *)text, .len = strlen(text)};
    return httpd_ws_send_frame(req, &f);
}
static void u16(uint8_t *p, unsigned v) { p[0] = v; p[1] = v >> 8; }
static void u32(uint8_t *p, uint32_t v) { u16(p, v); u16(p + 2, v >> 16); }

static void tile_area(session_t *s, unsigned tile, unsigned *x, unsigned *y, unsigned *w, unsigned *h)
{
    unsigned cols = (s->width + TILE - 1) / TILE;
    *x = (tile % cols) * TILE; *y = (tile / cols) * TILE;
    *w = s->width - *x < TILE ? s->width - *x : TILE;
    *h = s->height - *y < TILE ? s->height - *y : TILE;
}

static esp_err_t begin_frame(httpd_req_t *req, session_t *s)
{
    if (s->in_frame) return ESP_FAIL;
    unsigned retry_ms;
    if (!ui_remote_display_capture(&s->capture, &s->width, &s->height, &retry_ms)) {
        return text_frame(req, retry_ms == 20 ? "{\"type\":\"idle\",\"retry\":20}" : "{\"type\":\"idle\",\"retry\":200}");
    }
    if (s->width != 480 || s->height != 480) return ESP_FAIL;
    s->count = s->cursor = 0;
    for (unsigned i = 0; i < MAX_TILES; ++i) {
        unsigned x, y, w, h;
        tile_area(s, i, &x, &y, &w, &h);
        bool changed = !s->baseline_valid;
        for (unsigned row = 0; !changed && row < h; ++row) {
            size_t offset = ((y + row) * s->width + x) * 2;
            changed = memcmp(s->baseline + offset, s->capture + offset, w * 2) != 0;
        }
        if (changed) s->tiles[s->count++] = i;
    }
    if (!s->count) {
        ui_remote_display_ack();
        return text_frame(req, "{\"type\":\"idle\"}");
    }
    s->in_frame = true; s->ended = false;
    ++s->sequence;
    s->frame_started = esp_timer_get_time();
    char json[192];
    snprintf(json, sizeof(json), "{\"type\":\"begin\",\"epoch\":%lu,\"seq\":%lu,\"base\":%lu,\"key\":%s,\"count\":%u}",
             (unsigned long)s->epoch, (unsigned long)s->sequence, (unsigned long)s->base,
             s->baseline_valid ? "false" : "true", s->count);
    return text_frame(req, json);
}

static esp_err_t next_batch(httpd_req_t *req, session_t *s)
{
    if (!s->in_frame || s->ended) return ESP_FAIL;
    if (s->cursor == s->count) {
        s->ended = true;
        char json[80];
        snprintf(json, sizeof(json), "{\"type\":\"end\",\"seq\":%lu}", (unsigned long)s->sequence);
        return text_frame(req, json);
    }
    size_t used = 0;
    while (s->cursor < s->count) {
        unsigned x, y, w, h;
        tile_area(s, s->tiles[s->cursor], &x, &y, &w, &h);
        size_t bytes = w * h * 2;
        if (used + 30 + bytes > PACKET_BYTES) break;
        uint8_t *p = s->packet + used;
        u32(p, MAGIC); p[4] = 1; p[5] = 0; u16(p + 6, 30);
        u32(p + 8, s->epoch); u32(p + 12, s->sequence); u16(p + 16, s->cursor);
        u16(p + 18, x); u16(p + 20, y); u16(p + 22, w); u16(p + 24, h); u32(p + 26, bytes);
        for (unsigned row = 0; row < h; ++row)
            memcpy(p + 30 + row * w * 2, s->capture + ((y + row) * s->width + x) * 2, w * 2);
        used += 30 + bytes;
        ++s->cursor;
    }
    httpd_ws_frame_t frame = {.type = HTTPD_WS_TYPE_BINARY, .payload = s->packet, .len = used};
    return httpd_ws_send_frame(req, &frame);
}

static bool integer(const cJSON *root, const char *name, uint32_t maximum, uint32_t *out)
{
    const cJSON *v = cJSON_GetObjectItemCaseSensitive(root, name);
    if (!cJSON_IsNumber(v) || !isfinite(v->valuedouble) || v->valuedouble < 0 ||
        v->valuedouble > maximum || floor(v->valuedouble) != v->valuedouble) return false;
    *out = (uint32_t)v->valuedouble;
    return true;
}

/* ESP-IDF 5.5 dispatches the upgrade only to handshake callbacks, not ws_handler. */
static esp_err_t post_handshake(httpd_req_t *req)
{
    session_t *s = req->sess_ctx;
    if (!s || s != s_session || !ui_remote_display_available()) return ESP_FAIL;
    char json[180];
    snprintf(json, sizeof(json), "{\"type\":\"hello\",\"version\":1,\"epoch\":%lu,\"width\":480,\"height\":480,\"format\":\"rgb565le\",\"maxPayload\":16384}", (unsigned long)s->epoch);
    return text_frame(req, json);
}

static esp_err_t ws_handler(httpd_req_t *req)
{
    session_t *s = req->sess_ctx;
    if (!s || s != s_session || !ui_remote_display_available()) return ESP_FAIL;
    uint8_t buffer[256];
    httpd_ws_frame_t frame = {0};
    if (httpd_ws_recv_frame(req, &frame, 0) != ESP_OK || frame.len == 0 ||
        frame.len >= sizeof(buffer) || frame.type != HTTPD_WS_TYPE_TEXT || !frame.final) return ESP_FAIL;
    frame.payload = buffer;
    if (httpd_ws_recv_frame(req, &frame, frame.len) != ESP_OK) return ESP_FAIL;
    buffer[frame.len] = 0;
    cJSON *json = cJSON_ParseWithLength((char *)buffer, frame.len + 1);
    if (!json) return ESP_FAIL;
    cJSON *type = cJSON_GetObjectItemCaseSensitive(json, "type");
    uint32_t epoch;
    esp_err_t result = ESP_FAIL;
    if (!cJSON_IsString(type) || !integer(json, "epoch", UINT32_MAX, &epoch) || epoch != s->epoch) goto done;
    int64_t now = esp_timer_get_time();
    if (now - s->rate_start >= 1000000) { s->rate_start = now; s->input_rate = s->message_rate = 0; }
    if (++s->message_rate > 300) goto done;
    if (s->in_frame && now - s->frame_started > 10000000) goto done;
    if (!strcmp(type->valuestring, "frame")) result = begin_frame(req, s);
    else if (!strcmp(type->valuestring, "next")) result = next_batch(req, s);
    else if (!strcmp(type->valuestring, "ack")) {
        uint32_t seq;
        if (!s->ended || !integer(json, "seq", UINT32_MAX, &seq) || seq != s->sequence) goto done;
        /* Only acknowledged changes advance the baseline; avoid a full copy for a tiny update. */
        for (unsigned i = 0; i < s->count; ++i) {
            unsigned x, y, w, h;
            tile_area(s, s->tiles[i], &x, &y, &w, &h);
            for (unsigned row = 0; row < h; ++row) {
                size_t offset = ((y + row) * s->width + x) * 2;
                memcpy(s->baseline + offset, s->capture + offset, w * 2);
            }
        }
        s->baseline_valid = true; s->base = seq; s->in_frame = s->ended = false;
        ui_remote_display_ack();
        result = ESP_OK;
    } else if (!strcmp(type->valuestring, "control")) {
        cJSON *enabled = cJSON_GetObjectItemCaseSensitive(json, "enabled");
        if (!cJSON_IsBool(enabled)) goto done;
        bool allowed = ui_remote_display_control(cJSON_IsTrue(enabled));
        result = text_frame(req, allowed ? "{\"type\":\"control\",\"enabled\":true}" : "{\"type\":\"control\",\"enabled\":false}");
    } else if (!strcmp(type->valuestring, "ping")) {
        bool control = ui_remote_display_heartbeat();
        result = text_frame(req, control ? "{\"type\":\"pong\",\"control\":true}" : "{\"type\":\"pong\",\"control\":false}");
    } else if (!strcmp(type->valuestring, "pointer")) {
        uint32_t kind, x, y, seq;
        if (!integer(json, "kind", 3, &kind) || !integer(json, "x", 479, &x) ||
            !integer(json, "y", 479, &y) || !integer(json, "seq", UINT32_MAX, &seq) || seq <= s->input_sequence) goto done;
        if (++s->input_rate > 100) goto done;
        s->input_sequence = seq;
        bool accepted = ui_remote_display_pointer(kind, x, y);
        result = accepted ? ESP_OK : text_frame(req, "{\"type\":\"cancel\"}");
    }
done:
    cJSON_Delete(json);
    return result;
}

esp_err_t api_remote_display_register(httpd_handle_t server)
{
    httpd_uri_t token = {.uri = "/api/display/remote/session", .method = HTTP_POST, .handler = guarded_token_handler};
    httpd_uri_t ws = {.uri = "/api/display/remote", .method = HTTP_GET, .handler = ws_handler,
                     .is_websocket = true, .ws_pre_handshake_cb = pre_handshake,
                     .ws_post_handshake_cb = post_handshake};
    esp_err_t err = httpd_register_uri_handler(server, &token);
    if (err != ESP_OK) return err;
    err = httpd_register_uri_handler(server, &ws);
    if (err != ESP_OK) httpd_unregister_uri_handler(server, token.uri, HTTP_POST);
    return err;
}
#else
esp_err_t api_remote_display_register(httpd_handle_t server) { return ESP_OK; }
#endif
