/* SPDX-License-Identifier: LicenseRef-FNCL-1.1
 * Copyright (c) 2026 Cpt_Kirk
 */
#include "api/http_server.h"
#include "api/http_guard.h"
#include "api/api_remote_display.h"

#include <stdbool.h>
#include <stdint.h>
#include <string.h>

#include "esp_check.h"
#include "esp_log.h"

#include "api/api_routes.h"
#include "app_config.h"
#include "util/log_tags.h"

/* The WebUI assets are embedded gzipped (see components/webui/CMakeLists.txt). */
extern const uint8_t _binary_index_html_gz_start[] asm("_binary_index_html_gz_start");
extern const uint8_t _binary_index_html_gz_end[] asm("_binary_index_html_gz_end");
extern const uint8_t _binary_app_js_gz_start[] asm("_binary_app_js_gz_start");
extern const uint8_t _binary_app_js_gz_end[] asm("_binary_app_js_gz_end");
extern const uint8_t _binary_styles_css_gz_start[] asm("_binary_styles_css_gz_start");
extern const uint8_t _binary_styles_css_gz_end[] asm("_binary_styles_css_gz_end");
extern const uint8_t _binary_remote_display_js_gz_start[] asm("_binary_remote_display_js_gz_start");
extern const uint8_t _binary_remote_display_js_gz_end[] asm("_binary_remote_display_js_gz_end");

static const char *s_plain_client_index_html =
    "<!doctype html><html><head><meta charset=\"utf-8\"><title>BETTA Editor</title>"
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head>"
    "<body><h1>BETTA Editor</h1><p>The editor is served gzip-compressed. Use a browser, "
    "or a client that sends Accept-Encoding: gzip.</p></body></html>";
static const char *s_plain_client_app_js = "console.log('BETTA WebUI requires Accept-Encoding: gzip');";
static const char *s_plain_client_styles_css = "body{font-family:sans-serif;padding:20px}";

static httpd_handle_t s_server = NULL;

static bool client_accepts_gzip(httpd_req_t *req)
{
    char value[128];
    size_t len = httpd_req_get_hdr_value_len(req, "Accept-Encoding");
    if (len == 0) {
        return false;
    }
    if (len >= sizeof(value)) {
        /* Only browsers send a header list long enough to be truncated here, and those
         * always advertise gzip. */
        return true;
    }
    if (httpd_req_get_hdr_value_str(req, "Accept-Encoding", value, sizeof(value)) != ESP_OK) {
        return false;
    }
    return strstr(value, "gzip") != NULL;
}

/* index.html loads /app.js and /styles.css without a cache-busting query, so the assets
 * stay "no-store": a stale copy in the browser after an OTA would look like a broken UI. */
static esp_err_t send_gzip_asset(
    httpd_req_t *req, const uint8_t *start, const uint8_t *end, const char *content_type, bool cache_assets)
{
    httpd_resp_set_type(req, content_type);
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Cache-Control", cache_assets ? "public, max-age=3600" : "no-store");
    httpd_resp_set_hdr(req, "Content-Encoding", "gzip");
    httpd_resp_set_hdr(req, "Vary", "Accept-Encoding");
    return httpd_resp_send(req, (const char *)start, (ssize_t)(end - start));
}

static esp_err_t index_get_handler_impl(httpd_req_t *req)
{
    if (!client_accepts_gzip(req)) {
        httpd_resp_set_type(req, "text/html");
        return httpd_resp_sendstr(req, s_plain_client_index_html);
    }
    return send_gzip_asset(req, _binary_index_html_gz_start, _binary_index_html_gz_end, "text/html", false);
}

static esp_err_t app_js_get_handler_impl(httpd_req_t *req)
{
    if (!client_accepts_gzip(req)) {
        httpd_resp_set_type(req, "application/javascript");
        return httpd_resp_sendstr(req, s_plain_client_app_js);
    }
    return send_gzip_asset(req, _binary_app_js_gz_start, _binary_app_js_gz_end, "application/javascript", false);
}

static esp_err_t styles_css_get_handler_impl(httpd_req_t *req)
{
    if (!client_accepts_gzip(req)) {
        httpd_resp_set_type(req, "text/css");
        return httpd_resp_sendstr(req, s_plain_client_styles_css);
    }
    return send_gzip_asset(req, _binary_styles_css_gz_start, _binary_styles_css_gz_end, "text/css", false);
}

static esp_err_t remote_js_get_handler(httpd_req_t *req)
{
    return send_gzip_asset(req, _binary_remote_display_js_gz_start, _binary_remote_display_js_gz_end,
                           "application/javascript", false);
}

static esp_err_t favicon_get_handler_impl(httpd_req_t *req)
{
    httpd_resp_set_type(req, "image/x-icon");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Cache-Control", "public, max-age=86400");
    httpd_resp_set_status(req, "204 No Content");
    return httpd_resp_send(req, NULL, 0);
}

static esp_err_t guarded_index_get_handler(httpd_req_t *req)
{
    return http_guard_handle(req, index_get_handler_impl);
}

static esp_err_t guarded_app_js_get_handler(httpd_req_t *req)
{
    return http_guard_handle(req, app_js_get_handler_impl);
}

static esp_err_t guarded_styles_css_get_handler(httpd_req_t *req)
{
    return http_guard_handle(req, styles_css_get_handler_impl);
}

static esp_err_t guarded_favicon_get_handler(httpd_req_t *req)
{
    return http_guard_handle(req, favicon_get_handler_impl);
}

esp_err_t http_server_start(void)
{
    if (s_server != NULL) {
        return ESP_OK;
    }
    ESP_RETURN_ON_ERROR(http_guard_init(), TAG_HTTP, "init http guard");

    httpd_config_t cfg = HTTPD_DEFAULT_CONFIG();
    cfg.server_port = APP_HTTP_PORT;
    cfg.stack_size = APP_HTTP_TASK_STACK;
    int http_task_prio = APP_UI_TASK_PRIO + 1;
    if (http_task_prio >= APP_HA_TASK_PRIO) {
        http_task_prio = APP_HA_TASK_PRIO - 1;
    }
    if (http_task_prio < 1) {
        http_task_prio = 1;
    }
    cfg.task_priority = http_task_prio;
    /* Must cover every route registered in api_routes.c plus the static/index handlers below. */
    cfg.max_uri_handlers = 56;
#if defined(CONFIG_APP_PANEL_VARIANT_S3_480)
    cfg.max_open_sockets = 4;
#else
    cfg.max_open_sockets = 12;
#endif
    cfg.lru_purge_enable = true;
    cfg.recv_wait_timeout = 10;
    cfg.send_wait_timeout = 10;
#if defined(CONFIG_APP_PANEL_VARIANT_S3_480)
    cfg.backlog_conn = 4;
#else
    cfg.backlog_conn = 8;
#endif
#if CONFIG_FREERTOS_NUMBER_OF_CORES > 1
    cfg.core_id = 1;
#endif

    esp_err_t err = httpd_start(&s_server, &cfg);
    if (err != ESP_OK) {
        ESP_LOGE(TAG_HTTP, "Failed to start HTTP server");
        return err;
    }

    httpd_uri_t index_uri = {
        .uri = "/",
        .method = HTTP_GET,
        .handler = guarded_index_get_handler,
        .user_ctx = NULL,
    };
    httpd_uri_t app_js_uri = {
        .uri = "/app.js",
        .method = HTTP_GET,
        .handler = guarded_app_js_get_handler,
        .user_ctx = NULL,
    };
    httpd_uri_t styles_css_uri = {
        .uri = "/styles.css",
        .method = HTTP_GET,
        .handler = guarded_styles_css_get_handler,
        .user_ctx = NULL,
    };
    httpd_uri_t favicon_uri = {
        .uri = "/favicon.ico",
        .method = HTTP_GET,
        .handler = guarded_favicon_get_handler,
        .user_ctx = NULL,
    };

    ESP_RETURN_ON_ERROR(httpd_register_uri_handler(s_server, &index_uri), TAG_HTTP, "register /");
    ESP_RETURN_ON_ERROR(httpd_register_uri_handler(s_server, &app_js_uri), TAG_HTTP, "register /app.js");
    ESP_RETURN_ON_ERROR(httpd_register_uri_handler(s_server, &styles_css_uri), TAG_HTTP, "register /styles.css");
    ESP_RETURN_ON_ERROR(httpd_register_uri_handler(s_server, &favicon_uri), TAG_HTTP, "register /favicon.ico");
    ESP_RETURN_ON_ERROR(api_routes_register(s_server), TAG_HTTP, "register api routes");
    httpd_uri_t remote_js = {.uri = "/remote_display.js", .method = HTTP_GET, .handler = remote_js_get_handler};
    esp_err_t remote_err = httpd_register_uri_handler(s_server, &remote_js);
    if (remote_err == ESP_OK) remote_err = api_remote_display_register(s_server);
    if (remote_err != ESP_OK) ESP_LOGW(TAG_HTTP, "Live display routes unavailable: %s", esp_err_to_name(remote_err));

    ESP_LOGI(TAG_HTTP, "HTTP server listening on port %d", APP_HTTP_PORT);
    return ESP_OK;
}

void http_server_stop(void)
{
    if (s_server == NULL) {
        return;
    }
    httpd_stop(s_server);
    s_server = NULL;
}

httpd_handle_t http_server_get_handle(void)
{
    return s_server;
}
