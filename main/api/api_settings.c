/* SPDX-License-Identifier: LicenseRef-FNCL-1.1
 * Copyright (c) 2026 Cpt_Kirk
 */
#include "api/api_routes.h"

#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#include "cJSON.h"
#include "esp_heap_caps.h"
#include "esp_system.h"
#include "esp_timer.h"
#include "lwip/inet.h"
#include "lwip/netdb.h"

#include "app_config.h"
#include "bsp/display.h"
#include "drivers/display_init.h"
#include "ha/ha_client.h"
#include "mqtt/panel_mqtt.h"
#include "net/wifi_mgr.h"
#include "net/time_sync.h"
#include "settings/i18n_store.h"
#include "settings/runtime_settings.h"
#include "ui/ui_page_transition.h"
#include "ui/ui_pages.h"
#include "ui/ui_press_feedback.h"
#include "ui/ui_screen_saver.h"
#include "ui/ui_theme_router.h"
#include "ui/ui_value_anim.h"

static esp_timer_handle_t s_restart_timer = NULL;

static int clamp_int(int value, int lo, int hi)
{
    if (value < lo) {
        return lo;
    }
    if (value > hi) {
        return hi;
    }
    return value;
}

static void set_json_headers(httpd_req_t *req)
{
    httpd_resp_set_type(req, "application/json");
    httpd_resp_set_hdr(req, "Cache-Control", "no-store");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
}

static esp_err_t send_json_error(httpd_req_t *req, const char *status, const char *message)
{
    cJSON *root = cJSON_CreateObject();
    if (root == NULL) {
        return httpd_resp_send_500(req);
    }
    cJSON_AddBoolToObject(root, "ok", false);
    cJSON_AddStringToObject(root, "error", (message != NULL) ? message : "Invalid request");
    char *payload = cJSON_PrintUnformatted(root);
    cJSON_Delete(root);
    if (payload == NULL) {
        return httpd_resp_send_500(req);
    }

    set_json_headers(req);
    if (status != NULL) {
        httpd_resp_set_status(req, status);
    }
    esp_err_t err = httpd_resp_sendstr(req, payload);
    cJSON_free(payload);
    return err;
}

static bool has_ws_scheme(const char *url)
{
    if (url == NULL || url[0] == '\0') {
        return true;
    }
    return strncmp(url, "ws://", 5) == 0 || strncmp(url, "wss://", 6) == 0;
}

static bool validate_ipv4(const char *ip)
{
    if (ip == NULL || ip[0] == '\0') {
        return false;
    }
    struct in_addr addr4;
    return inet_pton(AF_INET, ip, &addr4) == 1;
}

static bool normalize_country_code(char *country_code, size_t country_code_len)
{
    if (country_code == NULL || country_code_len < APP_WIFI_COUNTRY_CODE_MAX_LEN) {
        return false;
    }
    if (country_code[0] == '\0') {
        strlcpy(country_code, APP_WIFI_COUNTRY_CODE, country_code_len);
        return true;
    }
    if (strlen(country_code) != 2) {
        return false;
    }
    if (!isalpha((unsigned char)country_code[0]) || !isalpha((unsigned char)country_code[1])) {
        return false;
    }

    country_code[0] = (char)toupper((unsigned char)country_code[0]);
    country_code[1] = (char)toupper((unsigned char)country_code[1]);
    country_code[2] = '\0';
    return true;
}

static int hex_nibble(char c)
{
    if (c >= '0' && c <= '9') {
        return c - '0';
    }
    if (c >= 'a' && c <= 'f') {
        return 10 + (c - 'a');
    }
    if (c >= 'A' && c <= 'F') {
        return 10 + (c - 'A');
    }
    return -1;
}

static bool normalize_bssid(char *bssid, size_t bssid_len)
{
    if (bssid == NULL || bssid_len < APP_WIFI_BSSID_MAX_LEN) {
        return false;
    }
    if (bssid[0] == '\0') {
        return true;
    }
    if (strlen(bssid) != 17U) {
        return false;
    }

    char sep = bssid[2];
    if (sep != ':' && sep != '-') {
        return false;
    }

    for (size_t i = 0; i < 6; i++) {
        size_t idx = i * 3;
        int hi = hex_nibble(bssid[idx]);
        int lo = hex_nibble(bssid[idx + 1]);
        if (hi < 0 || lo < 0) {
            return false;
        }
        bssid[idx] = (char)toupper((unsigned char)bssid[idx]);
        bssid[idx + 1] = (char)toupper((unsigned char)bssid[idx + 1]);
        if (i < 5) {
            if (bssid[idx + 2] != sep) {
                return false;
            }
            bssid[idx + 2] = ':';
        }
    }
    bssid[17] = '\0';
    return true;
}

static bool normalize_ui_language(char *language, size_t language_len)
{
    if (language == NULL || language_len == 0) {
        return false;
    }
    if (language[0] == '\0') {
        strlcpy(language, APP_UI_DEFAULT_LANGUAGE, language_len);
        return true;
    }

    char normalized[APP_UI_LANGUAGE_MAX_LEN] = {0};
    if (!i18n_store_normalize_language_code(language, normalized, sizeof(normalized))) {
        return false;
    }
    strlcpy(language, normalized, language_len);
    return true;
}

static void restart_timer_cb(void *arg)
{
    (void)arg;
    /* Avoid random panel colors during software reset. */
    (void)bsp_display_backlight_off();
    esp_restart();
}

static void schedule_restart(void)
{
    if (s_restart_timer == NULL) {
        const esp_timer_create_args_t timer_args = {
            .callback = &restart_timer_cb,
            .arg = NULL,
            .dispatch_method = ESP_TIMER_TASK,
            .name = "settings_restart",
            .skip_unhandled_events = true,
        };
        if (esp_timer_create(&timer_args, &s_restart_timer) != ESP_OK) {
            esp_restart();
            return;
        }
    }

    if (esp_timer_is_active(s_restart_timer)) {
        (void)esp_timer_stop(s_restart_timer);
    }
    if (esp_timer_start_once(s_restart_timer, 1500ULL * 1000ULL) != ESP_OK) {
        esp_restart();
    }
}

static void add_clock_status(cJSON *obj)
{
    time_t now = time(NULL);
    struct tm local = {0};
    char local_time[32] = {0};
    bool valid = localtime_r(&now, &local) != NULL && local.tm_year > (2016 - 1900);
    if (valid) strftime(local_time, sizeof(local_time), "%Y-%m-%dT%H:%M:%S", &local);
    cJSON_AddStringToObject(obj, "active_timezone", time_sync_get_tz());
    cJSON_AddBoolToObject(obj, "clock_valid", valid);
    cJSON_AddStringToObject(obj, "local_time", local_time);
}

esp_err_t api_settings_get_handler(httpd_req_t *req)
{
    /* Small polling response: no settings file read or timezone list allocation. */
    char query[48] = {0};
    char clock_only[4] = {0};
    if (httpd_req_get_url_query_str(req, query, sizeof(query)) == ESP_OK &&
        httpd_query_key_value(query, "time_only", clock_only, sizeof(clock_only)) == ESP_OK &&
        strcmp(clock_only, "1") == 0) {
        cJSON *clock = cJSON_CreateObject();
        if (clock == NULL) return httpd_resp_send_500(req);
        add_clock_status(clock);
        char *payload = cJSON_PrintUnformatted(clock);
        cJSON_Delete(clock);
        if (payload == NULL) return httpd_resp_send_500(req);
        set_json_headers(req);
        esp_err_t err = httpd_resp_sendstr(req, payload);
        cJSON_free(payload);
        return err;
    }
    runtime_settings_t *settings = calloc(1, sizeof(runtime_settings_t));
    if (settings == NULL) {
        return httpd_resp_send_500(req);
    }

    esp_err_t settings_err = runtime_settings_load(settings);
    if (settings_err != ESP_OK) {
        runtime_settings_set_defaults(settings);
    }

    cJSON *root = cJSON_CreateObject();
    cJSON *wifi = cJSON_CreateObject();
    cJSON *ha = cJSON_CreateObject();
    cJSON *time_cfg = cJSON_CreateObject();
    cJSON *ui = cJSON_CreateObject();
    cJSON *display = cJSON_CreateObject();
    cJSON *mqtt = cJSON_CreateObject();
    cJSON *system = cJSON_CreateObject();
    if (root == NULL || wifi == NULL || ha == NULL || time_cfg == NULL || ui == NULL || display == NULL || mqtt == NULL ||
        system == NULL) {
        cJSON_Delete(root);
        cJSON_Delete(wifi);
        cJSON_Delete(ha);
        cJSON_Delete(time_cfg);
        cJSON_Delete(ui);
        cJSON_Delete(display);
        cJSON_Delete(mqtt);
        cJSON_Delete(system);
        free(settings);
        return httpd_resp_send_500(req);
    }

    cJSON_AddStringToObject(wifi, "ssid", settings->wifi_ssid);
    cJSON_AddStringToObject(wifi, "country_code", settings->wifi_country_code);
    cJSON_AddStringToObject(wifi, "bssid", settings->wifi_bssid);
    cJSON_AddBoolToObject(wifi, "static_enabled", settings->wifi_static_enabled);
    cJSON_AddStringToObject(wifi, "static_ip", settings->wifi_static_ip);
    cJSON_AddStringToObject(wifi, "static_netmask", settings->wifi_static_netmask);
    cJSON_AddStringToObject(wifi, "static_gateway", settings->wifi_static_gateway);
    cJSON_AddStringToObject(wifi, "static_dns", settings->wifi_static_dns);
    cJSON_AddBoolToObject(wifi, "password_set", settings->wifi_password[0] != '\0');
    cJSON_AddBoolToObject(wifi, "configured", runtime_settings_has_wifi(settings));
    cJSON_AddBoolToObject(wifi, "connected", wifi_mgr_is_connected());
    cJSON_AddBoolToObject(wifi, "setup_ap_active", wifi_mgr_is_setup_ap_active());
    cJSON_AddStringToObject(wifi, "setup_ap_ssid", wifi_mgr_get_setup_ap_ssid());
    wifi_mgr_sta_ap_info_t sta_ap = {0};
    if (wifi_mgr_get_sta_ap_info(&sta_ap) == ESP_OK) {
        char connected_bssid[APP_WIFI_BSSID_MAX_LEN] = {0};
        snprintf(
            connected_bssid,
            sizeof(connected_bssid),
            "%02X:%02X:%02X:%02X:%02X:%02X",
            sta_ap.bssid[0],
            sta_ap.bssid[1],
            sta_ap.bssid[2],
            sta_ap.bssid[3],
            sta_ap.bssid[4],
            sta_ap.bssid[5]);
        cJSON_AddNumberToObject(wifi, "rssi_dbm", (double)sta_ap.rssi);
        cJSON_AddStringToObject(wifi, "connected_bssid", connected_bssid);
        cJSON_AddNumberToObject(wifi, "connected_channel", (double)sta_ap.channel);
    } else {
        cJSON_AddNullToObject(wifi, "rssi_dbm");
        cJSON_AddNullToObject(wifi, "connected_bssid");
        cJSON_AddNullToObject(wifi, "connected_channel");
    }
    cJSON_AddBoolToObject(wifi, "scan_supported", true);
    cJSON_AddItemToObject(root, "wifi", wifi);

    cJSON_AddStringToObject(ha, "ws_url", settings->ha_ws_url);
    cJSON_AddBoolToObject(ha, "access_token_set", settings->ha_access_token[0] != '\0');
    cJSON_AddBoolToObject(ha, "rest_enabled", settings->ha_rest_enabled);
    cJSON_AddBoolToObject(ha, "configured", runtime_settings_has_ha(settings));
    cJSON_AddBoolToObject(ha, "connected", ha_client_is_connected());
    cJSON_AddItemToObject(root, "ha", ha);

    cJSON_AddStringToObject(time_cfg, "ntp_server", settings->ntp_server);
    cJSON_AddStringToObject(time_cfg, "timezone", settings->time_tz);
    add_clock_status(time_cfg);
    cJSON *zones = cJSON_AddArrayToObject(time_cfg, "timezones");
    for (size_t i = 0; zones != NULL && time_sync_tz_name(i) != NULL; ++i) {
        cJSON_AddItemToArray(zones, cJSON_CreateString(time_sync_tz_name(i)));
    }
    cJSON_AddItemToObject(root, "time", time_cfg);

    cJSON_AddStringToObject(ui, "language", settings->ui_language);
    cJSON_AddItemToObject(root, "ui", ui);

    cJSON_AddNumberToObject(display, "brightness", settings->display_brightness);
    cJSON_AddNumberToObject(display, "saver_brightness", settings->display_saver_brightness);
    cJSON_AddBoolToObject(display, "screensaver_enabled", settings->display_screensaver_enabled);
    cJSON_AddNumberToObject(display, "screensaver_timeout_sec", (double)settings->display_screensaver_timeout_sec);
    cJSON_AddBoolToObject(display, "screen_off_enabled", settings->display_screen_off_enabled);
    cJSON_AddNumberToObject(display, "screen_off_timeout_sec", (double)settings->display_screen_off_timeout_sec);
    cJSON_AddBoolToObject(display, "clock_24h", settings->display_clock_24h);
    cJSON_AddBoolToObject(display, "saver_show_seconds", settings->display_saver_show_seconds);
    cJSON_AddBoolToObject(display, "saver_show_date", settings->display_saver_show_date);
    cJSON_AddNumberToObject(display, "saver_clock_style", (double)settings->display_saver_clock_style);
    cJSON_AddNumberToObject(display, "saver_clock_color", (double)(settings->display_saver_clock_color & 0xFFFFFF));
    cJSON_AddNumberToObject(display, "saver_date_color", (double)(settings->display_saver_date_color & 0xFFFFFF));
    cJSON_AddBoolToObject(display, "night_mode_enabled", settings->display_night_mode_enabled);
    cJSON_AddNumberToObject(display, "night_start_min", (double)settings->display_night_start_min);
    cJSON_AddNumberToObject(display, "night_end_min", (double)settings->display_night_end_min);
    cJSON_AddNumberToObject(display, "night_brightness", (double)settings->display_night_brightness);
    cJSON_AddNumberToObject(display, "night_wake_sec", (double)settings->display_night_wake_sec);
    cJSON_AddBoolToObject(display, "theme_auto_enabled", settings->display_theme_auto_enabled);
    cJSON_AddStringToObject(display, "theme_day_id", settings->display_theme_day_id);
    cJSON_AddStringToObject(display, "theme_night_id", settings->display_theme_night_id);
    cJSON_AddStringToObject(display, "page_transition", settings->display_page_transition);
    cJSON_AddNumberToObject(display, "page_transition_ms", (double)settings->display_page_transition_ms);
    cJSON_AddStringToObject(display, "tile_press_fx", settings->display_tile_press_fx);
    cJSON_AddNumberToObject(display, "tile_press_fx_dim", (double)settings->display_tile_press_fx_dim);
    cJSON_AddNumberToObject(display, "tile_press_fx_scale", (double)settings->display_tile_press_fx_scale);
    cJSON_AddStringToObject(display, "value_anim", settings->display_value_anim);
    cJSON_AddNumberToObject(display, "value_anim_ms", (double)settings->display_value_anim_ms);
    cJSON_AddBoolToObject(display, "topbar_show_clock", settings->display_topbar_show_clock);
    cJSON_AddBoolToObject(display, "topbar_show_date", settings->display_topbar_show_date);
    cJSON_AddBoolToObject(display, "topbar_show_gear", settings->display_topbar_show_gear);
    cJSON_AddBoolToObject(display, "topbar_show_status", settings->display_topbar_show_status);
    cJSON_AddBoolToObject(display, "topbar_icon_text", settings->display_topbar_icon_text);
    cJSON_AddBoolToObject(display, "topbar_custom_colors", settings->display_topbar_custom_colors);
    cJSON_AddNumberToObject(display, "topbar_bg_color", (double)(settings->display_topbar_bg_color & 0xFFFFFF));
    cJSON_AddNumberToObject(display, "topbar_clock_color", (double)(settings->display_topbar_clock_color & 0xFFFFFF));
    cJSON_AddNumberToObject(display, "topbar_date_color", (double)(settings->display_topbar_date_color & 0xFFFFFF));
    cJSON_AddNumberToObject(display, "topbar_gear_color", (double)(settings->display_topbar_gear_color & 0xFFFFFF));
    cJSON_AddNumberToObject(display, "topbar_ha_color", (double)(settings->display_topbar_ha_color & 0xFFFFFF));
    cJSON_AddNumberToObject(display, "topbar_wifi_color", (double)(settings->display_topbar_wifi_color & 0xFFFFFF));
    cJSON_AddBoolToObject(display, "nav_custom_colors", settings->display_nav_custom_colors);
    cJSON_AddNumberToObject(display, "nav_bar_bg_color", (double)(settings->display_nav_bar_bg_color & 0xFFFFFF));
    cJSON_AddNumberToObject(display, "nav_bar_border_color", (double)(settings->display_nav_bar_border_color & 0xFFFFFF));
    cJSON_AddNumberToObject(display, "nav_button_bg_color", (double)(settings->display_nav_button_bg_color & 0xFFFFFF));
    cJSON_AddNumberToObject(
        display, "nav_button_border_color", (double)(settings->display_nav_button_border_color & 0xFFFFFF));
    cJSON_AddNumberToObject(display, "nav_tab_idle_color", (double)(settings->display_nav_tab_idle_color & 0xFFFFFF));
    cJSON_AddNumberToObject(display, "nav_tab_active_color", (double)(settings->display_nav_tab_active_color & 0xFFFFFF));
    cJSON_AddNumberToObject(display, "nav_home_idle_color", (double)(settings->display_nav_home_idle_color & 0xFFFFFF));
    cJSON_AddNumberToObject(
        display, "nav_home_active_color", (double)(settings->display_nav_home_active_color & 0xFFFFFF));
    cJSON_AddBoolToObject(display, "night_active", ui_screen_saver_night_active());
    cJSON_AddItemToObject(root, "display", display);

    cJSON_AddBoolToObject(mqtt, "enabled", settings->mqtt_enabled);
    cJSON_AddBoolToObject(mqtt, "use_tls", settings->mqtt_use_tls);
    cJSON_AddStringToObject(mqtt, "host", settings->mqtt_host);
    cJSON_AddNumberToObject(mqtt, "port", (double)settings->mqtt_port);
    cJSON_AddStringToObject(mqtt, "username", settings->mqtt_username);
    cJSON_AddBoolToObject(mqtt, "password_set", settings->mqtt_password[0] != '\0');
    cJSON_AddStringToObject(mqtt, "discovery_prefix", settings->mqtt_discovery_prefix);
    cJSON_AddBoolToObject(mqtt, "connected", panel_mqtt_is_connected());
    cJSON_AddItemToObject(root, "mqtt", mqtt);

    cJSON_AddBoolToObject(system, "auto_restart_enabled", settings->system_auto_restart_enabled);
    cJSON_AddNumberToObject(system, "auto_restart_hours", (double)settings->system_auto_restart_hours);
    cJSON_AddItemToObject(root, "system", system);

    cJSON_AddBoolToObject(root, "ok", true);

    char *payload = cJSON_PrintUnformatted(root);
    cJSON_Delete(root);
    free(settings);
    if (payload == NULL) {
        return httpd_resp_send_500(req);
    }

    set_json_headers(req);
    esp_err_t err = httpd_resp_sendstr(req, payload);
    cJSON_free(payload);
    return err;
}

static bool update_string_setting(
    cJSON *obj,
    const char *key,
    char *dst,
    size_t dst_len,
    bool *out_invalid_type,
    bool *out_too_long)
{
    cJSON *item = cJSON_GetObjectItemCaseSensitive(obj, key);
    if (item == NULL) {
        return false;
    }

    if (cJSON_IsString(item) && item->valuestring != NULL) {
        if (strlen(item->valuestring) >= dst_len) {
            if (out_too_long != NULL) {
                *out_too_long = true;
            }
            return false;
        }
        strlcpy(dst, item->valuestring, dst_len);
        return true;
    }
    if (cJSON_IsNull(item)) {
        dst[0] = '\0';
        return true;
    }

    if (out_invalid_type != NULL) {
        *out_invalid_type = true;
    }
    return false;
}

static bool update_bool_setting(cJSON *obj, const char *key, bool *dst, bool *out_invalid_type)
{
    cJSON *item = cJSON_GetObjectItemCaseSensitive(obj, key);
    if (item == NULL) {
        return false;
    }

    if (cJSON_IsBool(item)) {
        *dst = cJSON_IsTrue(item);
        return true;
    }

    if (out_invalid_type != NULL) {
        *out_invalid_type = true;
    }
    return false;
}

static bool update_color_setting(cJSON *obj, const char *key, uint32_t *dst, bool *out_invalid_type)
{
    cJSON *item = cJSON_GetObjectItemCaseSensitive(obj, key);
    if (item == NULL) {
        return false;
    }

    if (cJSON_IsNumber(item)) {
        uint32_t value = (uint32_t)item->valuedouble;
        if (value > 0xFFFFFF) {
            value = 0xFFFFFF;
        }
        *dst = value;
        return true;
    }

    if (out_invalid_type != NULL) {
        *out_invalid_type = true;
    }
    return false;
}

esp_err_t api_settings_put_handler(httpd_req_t *req)
{
    if (req->content_len <= 0 || req->content_len > APP_SETTINGS_MAX_JSON_LEN) {
        return send_json_error(req, "400 Bad Request", "Invalid payload size");
    }

    char *buf = calloc((size_t)req->content_len + 1U, sizeof(char));
    if (buf == NULL) {
        return httpd_resp_send_500(req);
    }

    int received = 0;
    while (received < req->content_len) {
        int r = httpd_req_recv(req, buf + received, req->content_len - received);
        if (r <= 0) {
            free(buf);
            return send_json_error(req, "400 Bad Request", "Failed to read request body");
        }
        received += r;
    }

    cJSON *root = cJSON_Parse(buf);
    free(buf);
    if (!cJSON_IsObject(root)) {
        cJSON_Delete(root);
        return send_json_error(req, "400 Bad Request", "Invalid JSON");
    }

    runtime_settings_t *settings = calloc(1, sizeof(runtime_settings_t));
    if (settings == NULL) {
        cJSON_Delete(root);
        return httpd_resp_send_500(req);
    }

    esp_err_t load_err = runtime_settings_load(settings);
    if (load_err != ESP_OK) {
        runtime_settings_set_defaults(settings);
    }

    char previous_timezone[APP_TIME_TZ_MAX_LEN];
    strlcpy(previous_timezone, settings->time_tz, sizeof(previous_timezone));

    cJSON *wifi = cJSON_GetObjectItemCaseSensitive(root, "wifi");
    cJSON *ha = cJSON_GetObjectItemCaseSensitive(root, "ha");
    cJSON *time_cfg = cJSON_GetObjectItemCaseSensitive(root, "time");
    cJSON *ui = cJSON_GetObjectItemCaseSensitive(root, "ui");
    cJSON *display = cJSON_GetObjectItemCaseSensitive(root, "display");
    cJSON *mqtt = cJSON_GetObjectItemCaseSensitive(root, "mqtt");
    cJSON *system = cJSON_GetObjectItemCaseSensitive(root, "system");
    if (wifi != NULL && !cJSON_IsObject(wifi)) {
        cJSON_Delete(root);
        free(settings);
        return send_json_error(req, "400 Bad Request", "wifi must be an object");
    }
    if (ha != NULL && !cJSON_IsObject(ha)) {
        cJSON_Delete(root);
        free(settings);
        return send_json_error(req, "400 Bad Request", "ha must be an object");
    }
    if (time_cfg != NULL && !cJSON_IsObject(time_cfg)) {
        cJSON_Delete(root);
        free(settings);
        return send_json_error(req, "400 Bad Request", "time must be an object");
    }
    if (ui != NULL && !cJSON_IsObject(ui)) {
        cJSON_Delete(root);
        free(settings);
        return send_json_error(req, "400 Bad Request", "ui must be an object");
    }
    if (display != NULL && !cJSON_IsObject(display)) {
        cJSON_Delete(root);
        free(settings);
        return send_json_error(req, "400 Bad Request", "display must be an object");
    }
    if (mqtt != NULL && !cJSON_IsObject(mqtt)) {
        cJSON_Delete(root);
        free(settings);
        return send_json_error(req, "400 Bad Request", "mqtt must be an object");
    }
    if (system != NULL && !cJSON_IsObject(system)) {
        cJSON_Delete(root);
        free(settings);
        return send_json_error(req, "400 Bad Request", "system must be an object");
    }

    bool invalid_type = false;
    bool too_long = false;
    if (cJSON_IsObject(wifi)) {
        (void)update_string_setting(
            wifi, "ssid", settings->wifi_ssid, sizeof(settings->wifi_ssid), &invalid_type, &too_long);
        (void)update_string_setting(
            wifi, "password", settings->wifi_password, sizeof(settings->wifi_password), &invalid_type, &too_long);
        (void)update_string_setting(
            wifi, "country_code", settings->wifi_country_code, sizeof(settings->wifi_country_code), &invalid_type, &too_long);
        (void)update_string_setting(
            wifi, "bssid", settings->wifi_bssid, sizeof(settings->wifi_bssid), &invalid_type, &too_long);
        (void)update_bool_setting(wifi, "static_enabled", &settings->wifi_static_enabled, &invalid_type);
        (void)update_string_setting(
            wifi, "static_ip", settings->wifi_static_ip, sizeof(settings->wifi_static_ip), &invalid_type, &too_long);
        (void)update_string_setting(
            wifi, "static_netmask", settings->wifi_static_netmask, sizeof(settings->wifi_static_netmask), &invalid_type, &too_long);
        (void)update_string_setting(
            wifi, "static_gateway", settings->wifi_static_gateway, sizeof(settings->wifi_static_gateway), &invalid_type, &too_long);
        (void)update_string_setting(
            wifi, "static_dns", settings->wifi_static_dns, sizeof(settings->wifi_static_dns), &invalid_type, &too_long);
    }
    if (cJSON_IsObject(ha)) {
        (void)update_string_setting(
            ha, "ws_url", settings->ha_ws_url, sizeof(settings->ha_ws_url), &invalid_type, &too_long);
        (void)update_string_setting(
            ha, "access_token", settings->ha_access_token, sizeof(settings->ha_access_token), &invalid_type, &too_long);
        (void)update_bool_setting(ha, "rest_enabled", &settings->ha_rest_enabled, &invalid_type);
    }
    if (cJSON_IsObject(time_cfg)) {
        (void)update_string_setting(
            time_cfg, "ntp_server", settings->ntp_server, sizeof(settings->ntp_server), &invalid_type, &too_long);
        (void)update_string_setting(
            time_cfg, "timezone", settings->time_tz, sizeof(settings->time_tz), &invalid_type, &too_long);
    }
    if (cJSON_IsObject(ui)) {
        (void)update_string_setting(
            ui, "language", settings->ui_language, sizeof(settings->ui_language), &invalid_type, &too_long);
    }
    if (cJSON_IsObject(display)) {
        cJSON *brightness = cJSON_GetObjectItemCaseSensitive(display, "brightness");
        if (brightness != NULL) {
            if (cJSON_IsNumber(brightness)) {
                int value = (int)brightness->valuedouble;
                if (value < 1) {
                    value = 1;
                } else if (value > 100) {
                    value = 100;
                }
                settings->display_brightness = (uint8_t)value;
            } else {
                invalid_type = true;
            }
        }

        cJSON *saver_brightness = cJSON_GetObjectItemCaseSensitive(display, "saver_brightness");
        if (saver_brightness != NULL) {
            if (cJSON_IsNumber(saver_brightness)) {
                int value = (int)saver_brightness->valuedouble;
                if (value < 1) {
                    value = 1;
                } else if (value > 100) {
                    value = 100;
                }
                settings->display_saver_brightness = (uint8_t)value;
            } else {
                invalid_type = true;
            }
        }

        cJSON *saver_timeout = cJSON_GetObjectItemCaseSensitive(display, "screensaver_timeout_sec");
        if (saver_timeout != NULL) {
            if (cJSON_IsNumber(saver_timeout)) {
                uint32_t value = (uint32_t)saver_timeout->valuedouble;
                if (value < 5) {
                    value = 5;
                } else if (value > 3600) {
                    value = 3600;
                }
                settings->display_screensaver_timeout_sec = value;
            } else {
                invalid_type = true;
            }
        }

        cJSON *off_timeout = cJSON_GetObjectItemCaseSensitive(display, "screen_off_timeout_sec");
        if (off_timeout != NULL) {
            if (cJSON_IsNumber(off_timeout)) {
                uint32_t value = (uint32_t)off_timeout->valuedouble;
                if (value < 5) {
                    value = 5;
                } else if (value > 7200) {
                    value = 7200;
                }
                settings->display_screen_off_timeout_sec = value;
            } else {
                invalid_type = true;
            }
        }

        (void)update_bool_setting(display, "screensaver_enabled", &settings->display_screensaver_enabled, &invalid_type);
        (void)update_bool_setting(display, "screen_off_enabled", &settings->display_screen_off_enabled, &invalid_type);
        (void)update_bool_setting(display, "clock_24h", &settings->display_clock_24h, &invalid_type);
        (void)update_bool_setting(display, "saver_show_seconds", &settings->display_saver_show_seconds, &invalid_type);
        (void)update_bool_setting(display, "saver_show_date", &settings->display_saver_show_date, &invalid_type);

        cJSON *saver_clock_style = cJSON_GetObjectItemCaseSensitive(display, "saver_clock_style");
        if (saver_clock_style != NULL) {
            if (cJSON_IsNumber(saver_clock_style)) {
                settings->display_saver_clock_style = (uint8_t)clamp_int(
                    (int)saver_clock_style->valuedouble, APP_DISPLAY_SAVER_CLOCK_STYLE_CLASSIC,
                    APP_DISPLAY_SAVER_CLOCK_STYLE_FLIP);
            } else {
                invalid_type = true;
            }
        }
        (void)update_color_setting(display, "saver_clock_color", &settings->display_saver_clock_color, &invalid_type);
        (void)update_color_setting(display, "saver_date_color", &settings->display_saver_date_color, &invalid_type);
        (void)update_bool_setting(display, "night_mode_enabled", &settings->display_night_mode_enabled, &invalid_type);

        cJSON *night_start = cJSON_GetObjectItemCaseSensitive(display, "night_start_min");
        if (night_start != NULL) {
            if (cJSON_IsNumber(night_start)) {
                int value = (int)night_start->valuedouble;
                settings->display_night_start_min = (uint16_t)clamp_int(value, 0, 1439);
            } else {
                invalid_type = true;
            }
        }

        cJSON *night_end = cJSON_GetObjectItemCaseSensitive(display, "night_end_min");
        if (night_end != NULL) {
            if (cJSON_IsNumber(night_end)) {
                int value = (int)night_end->valuedouble;
                settings->display_night_end_min = (uint16_t)clamp_int(value, 0, 1439);
            } else {
                invalid_type = true;
            }
        }

        cJSON *night_brightness = cJSON_GetObjectItemCaseSensitive(display, "night_brightness");
        if (night_brightness != NULL) {
            if (cJSON_IsNumber(night_brightness)) {
                int value = (int)night_brightness->valuedouble;
                settings->display_night_brightness = (uint8_t)clamp_int(value, 0, 100);
            } else {
                invalid_type = true;
            }
        }

        cJSON *night_wake = cJSON_GetObjectItemCaseSensitive(display, "night_wake_sec");
        if (night_wake != NULL) {
            if (cJSON_IsNumber(night_wake)) {
                int value = (int)night_wake->valuedouble;
                settings->display_night_wake_sec = (uint16_t)clamp_int(value, 0, 3600);
            } else {
                invalid_type = true;
            }
        }

        cJSON *theme_auto = cJSON_GetObjectItemCaseSensitive(display, "theme_auto_enabled");
        if (theme_auto != NULL) {
            if (cJSON_IsBool(theme_auto)) {
                settings->display_theme_auto_enabled = cJSON_IsTrue(theme_auto);
            } else {
                invalid_type = true;
            }
        }

        cJSON *theme_day = cJSON_GetObjectItemCaseSensitive(display, "theme_day_id");
        if (theme_day != NULL) {
            if (cJSON_IsString(theme_day) && theme_day->valuestring != NULL &&
                strlen(theme_day->valuestring) < sizeof(settings->display_theme_day_id)) {
                snprintf(settings->display_theme_day_id, sizeof(settings->display_theme_day_id), "%s",
                         theme_day->valuestring);
            } else {
                invalid_type = true;
            }
        }

        cJSON *theme_night = cJSON_GetObjectItemCaseSensitive(display, "theme_night_id");
        if (theme_night != NULL) {
            if (cJSON_IsString(theme_night) && theme_night->valuestring != NULL &&
                strlen(theme_night->valuestring) < sizeof(settings->display_theme_night_id)) {
                snprintf(settings->display_theme_night_id, sizeof(settings->display_theme_night_id), "%s",
                         theme_night->valuestring);
            } else {
                invalid_type = true;
            }
        }

        (void)update_string_setting(display, "page_transition", settings->display_page_transition,
                                    sizeof(settings->display_page_transition), &invalid_type, &too_long);

        cJSON *transition_ms = cJSON_GetObjectItemCaseSensitive(display, "page_transition_ms");
        if (transition_ms != NULL) {
            if (cJSON_IsNumber(transition_ms)) {
                int value = (int)transition_ms->valuedouble;
                settings->display_page_transition_ms =
                    (uint16_t)clamp_int(value, 0, APP_DISPLAY_PAGE_TRANSITION_MAX_MS);
            } else {
                invalid_type = true;
            }
        }

        (void)update_string_setting(display, "tile_press_fx", settings->display_tile_press_fx,
                                    sizeof(settings->display_tile_press_fx), &invalid_type, &too_long);

        cJSON *press_fx_dim = cJSON_GetObjectItemCaseSensitive(display, "tile_press_fx_dim");
        if (press_fx_dim != NULL) {
            if (cJSON_IsNumber(press_fx_dim)) {
                int value = (int)press_fx_dim->valuedouble;
                settings->display_tile_press_fx_dim = (uint8_t)clamp_int(value, 0, APP_TILE_PRESS_FX_DIM_MAX);
            } else {
                invalid_type = true;
            }
        }

        cJSON *press_fx_scale = cJSON_GetObjectItemCaseSensitive(display, "tile_press_fx_scale");
        if (press_fx_scale != NULL) {
            if (cJSON_IsNumber(press_fx_scale)) {
                int value = (int)press_fx_scale->valuedouble;
                settings->display_tile_press_fx_scale =
                    (uint8_t)clamp_int(value, APP_TILE_PRESS_FX_SCALE_MIN, APP_TILE_PRESS_FX_SCALE_MAX);
            } else {
                invalid_type = true;
            }
        }

        (void)update_string_setting(display, "value_anim", settings->display_value_anim,
                                    sizeof(settings->display_value_anim), &invalid_type, &too_long);

        cJSON *value_anim_ms = cJSON_GetObjectItemCaseSensitive(display, "value_anim_ms");
        if (value_anim_ms != NULL) {
            if (cJSON_IsNumber(value_anim_ms)) {
                int value = (int)value_anim_ms->valuedouble;
                settings->display_value_anim_ms =
                    (uint16_t)clamp_int(value, 0, APP_DISPLAY_VALUE_ANIM_MAX_MS);
            } else {
                invalid_type = true;
            }
        }

        (void)update_bool_setting(display, "topbar_show_clock", &settings->display_topbar_show_clock, &invalid_type);
        (void)update_bool_setting(display, "topbar_show_date", &settings->display_topbar_show_date, &invalid_type);
        (void)update_bool_setting(display, "topbar_show_gear", &settings->display_topbar_show_gear, &invalid_type);
        (void)update_bool_setting(display, "topbar_show_status", &settings->display_topbar_show_status, &invalid_type);
        (void)update_bool_setting(display, "topbar_icon_text", &settings->display_topbar_icon_text, &invalid_type);
        (void)update_bool_setting(
            display, "topbar_custom_colors", &settings->display_topbar_custom_colors, &invalid_type);
        (void)update_color_setting(display, "topbar_bg_color", &settings->display_topbar_bg_color, &invalid_type);
        (void)update_color_setting(display, "topbar_clock_color", &settings->display_topbar_clock_color, &invalid_type);
        (void)update_color_setting(display, "topbar_date_color", &settings->display_topbar_date_color, &invalid_type);
        (void)update_color_setting(display, "topbar_gear_color", &settings->display_topbar_gear_color, &invalid_type);
        (void)update_color_setting(display, "topbar_ha_color", &settings->display_topbar_ha_color, &invalid_type);
        (void)update_color_setting(display, "topbar_wifi_color", &settings->display_topbar_wifi_color, &invalid_type);
        (void)update_bool_setting(display, "nav_custom_colors", &settings->display_nav_custom_colors, &invalid_type);
        (void)update_color_setting(display, "nav_bar_bg_color", &settings->display_nav_bar_bg_color, &invalid_type);
        (void)update_color_setting(
            display, "nav_bar_border_color", &settings->display_nav_bar_border_color, &invalid_type);
        (void)update_color_setting(display, "nav_button_bg_color", &settings->display_nav_button_bg_color, &invalid_type);
        (void)update_color_setting(
            display, "nav_button_border_color", &settings->display_nav_button_border_color, &invalid_type);
        (void)update_color_setting(display, "nav_tab_idle_color", &settings->display_nav_tab_idle_color, &invalid_type);
        (void)update_color_setting(
            display, "nav_tab_active_color", &settings->display_nav_tab_active_color, &invalid_type);
        (void)update_color_setting(display, "nav_home_idle_color", &settings->display_nav_home_idle_color, &invalid_type);
        (void)update_color_setting(
            display, "nav_home_active_color", &settings->display_nav_home_active_color, &invalid_type);
    }
    if (cJSON_IsObject(mqtt)) {
        (void)update_bool_setting(mqtt, "enabled", &settings->mqtt_enabled, &invalid_type);
        (void)update_bool_setting(mqtt, "use_tls", &settings->mqtt_use_tls, &invalid_type);
        (void)update_string_setting(
            mqtt, "host", settings->mqtt_host, sizeof(settings->mqtt_host), &invalid_type, &too_long);
        (void)update_string_setting(
            mqtt, "username", settings->mqtt_username, sizeof(settings->mqtt_username), &invalid_type, &too_long);
        (void)update_string_setting(
            mqtt,
            "discovery_prefix",
            settings->mqtt_discovery_prefix,
            sizeof(settings->mqtt_discovery_prefix),
            &invalid_type,
            &too_long);

        cJSON *port = cJSON_GetObjectItemCaseSensitive(mqtt, "port");
        if (port != NULL) {
            if (cJSON_IsNumber(port)) {
                int value = (int)port->valuedouble;
                if (value < 1) {
                    value = 1;
                } else if (value > 65535) {
                    value = 65535;
                }
                settings->mqtt_port = (uint16_t)value;
            } else {
                invalid_type = true;
            }
        }

        /* Empty/omitted password keeps the previously stored value. */
        cJSON *password = cJSON_GetObjectItemCaseSensitive(mqtt, "password");
        if (password != NULL) {
            if (cJSON_IsString(password) && password->valuestring != NULL) {
                if (password->valuestring[0] != '\0') {
                    size_t len = strlen(password->valuestring);
                    if (len >= sizeof(settings->mqtt_password)) {
                        too_long = true;
                    } else {
                        strlcpy(settings->mqtt_password, password->valuestring, sizeof(settings->mqtt_password));
                    }
                }
            } else {
                invalid_type = true;
            }
        }
    }

    if (cJSON_IsObject(system)) {
        (void)update_bool_setting(system, "auto_restart_enabled", &settings->system_auto_restart_enabled, &invalid_type);

        cJSON *auto_restart_hours = cJSON_GetObjectItemCaseSensitive(system, "auto_restart_hours");
        if (auto_restart_hours != NULL) {
            if (cJSON_IsNumber(auto_restart_hours)) {
                int value = (int)auto_restart_hours->valuedouble;
                if (value < 1) {
                    value = 1;
                } else if (value > 168) {
                    value = 168;
                }
                settings->system_auto_restart_hours = (uint32_t)value;
            } else {
                invalid_type = true;
            }
        }
    }

    (void)update_string_setting(
        root, "wifi_ssid", settings->wifi_ssid, sizeof(settings->wifi_ssid), &invalid_type, &too_long);
    (void)update_string_setting(
        root, "wifi_password", settings->wifi_password, sizeof(settings->wifi_password), &invalid_type, &too_long);
    (void)update_string_setting(
        root, "wifi_country_code", settings->wifi_country_code, sizeof(settings->wifi_country_code), &invalid_type, &too_long);
    (void)update_string_setting(
        root, "wifi_bssid", settings->wifi_bssid, sizeof(settings->wifi_bssid), &invalid_type, &too_long);
    (void)update_string_setting(
        root, "ha_ws_url", settings->ha_ws_url, sizeof(settings->ha_ws_url), &invalid_type, &too_long);
    (void)update_string_setting(
        root, "ha_access_token", settings->ha_access_token, sizeof(settings->ha_access_token), &invalid_type, &too_long);
    (void)update_bool_setting(root, "ha_rest_enabled", &settings->ha_rest_enabled, &invalid_type);
    (void)update_string_setting(
        root, "ntp_server", settings->ntp_server, sizeof(settings->ntp_server), &invalid_type, &too_long);
    (void)update_string_setting(
        root, "time_tz", settings->time_tz, sizeof(settings->time_tz), &invalid_type, &too_long);
    (void)update_string_setting(
        root, "language", settings->ui_language, sizeof(settings->ui_language), &invalid_type, &too_long);

    bool reboot = true;
    cJSON *reboot_item = cJSON_GetObjectItemCaseSensitive(root, "reboot");
    if (reboot_item != NULL) {
        if (cJSON_IsBool(reboot_item)) {
            reboot = cJSON_IsTrue(reboot_item);
        } else {
            cJSON_Delete(root);
            free(settings);
            return send_json_error(req, "400 Bad Request", "reboot must be boolean");
        }
    }

    cJSON_Delete(root);

    if (invalid_type) {
        free(settings);
        return send_json_error(req, "400 Bad Request", "One or more settings fields have invalid type");
    }
    if (too_long) {
        free(settings);
        return send_json_error(
            req,
            "400 Bad Request",
            "One or more settings values are too long (ssid<=32, wifi_password<=64, country_code<=2, bssid<=17, static_ip/netmask/gateway/dns<=15, ws_url<=255, token<=511, ntp<=127, timezone<=127, language<=15, mqtt_host<=128, mqtt_username<=64, mqtt_password<=64, mqtt_discovery_prefix<=64)");
    }
    if (!has_ws_scheme(settings->ha_ws_url)) {
        free(settings);
        return send_json_error(req, "400 Bad Request", "ha.ws_url must start with ws:// or wss://");
    }
    if (!normalize_country_code(settings->wifi_country_code, sizeof(settings->wifi_country_code))) {
        free(settings);
        return send_json_error(req, "400 Bad Request", "wifi.country_code must be a 2-letter ISO code (e.g. US, DE)");
    }
    if (!normalize_bssid(settings->wifi_bssid, sizeof(settings->wifi_bssid))) {
        free(settings);
        return send_json_error(req, "400 Bad Request", "wifi.bssid must be empty or MAC format AA:BB:CC:DD:EE:FF");
    }
    if (settings->wifi_static_enabled) {
        if (!validate_ipv4(settings->wifi_static_ip) ||
            !validate_ipv4(settings->wifi_static_netmask) ||
            !validate_ipv4(settings->wifi_static_gateway)) {
            free(settings);
            return send_json_error(
                req,
                "400 Bad Request",
                "wifi.static_ip, wifi.static_netmask and wifi.static_gateway must be valid IPv4 addresses when static IP is enabled");
        }
    } else {
        settings->wifi_static_ip[0] = '\0';
        settings->wifi_static_netmask[0] = '\0';
        settings->wifi_static_gateway[0] = '\0';
        settings->wifi_static_dns[0] = '\0';
    }
    if (settings->wifi_static_dns[0] != '\0' && !validate_ipv4(settings->wifi_static_dns)) {
        free(settings);
        return send_json_error(req, "400 Bad Request", "wifi.static_dns must be a valid IPv4 address or empty");
    }
    if (settings->wifi_ssid[0] == '\0') {
        settings->wifi_password[0] = '\0';
        settings->wifi_bssid[0] = '\0';
    }
    if (settings->ntp_server[0] == '\0') {
        strlcpy(settings->ntp_server, APP_NTP_SERVER, sizeof(settings->ntp_server));
    }
    if (strcmp(settings->time_tz, previous_timezone) != 0 &&
        time_sync_tz_rules(settings->time_tz) == NULL) {
        free(settings);
        return send_json_error(req, "400 Bad Request", "Unknown timezone; select a supported name such as Africa/Ceuta");
    }
    if (!normalize_ui_language(settings->ui_language, sizeof(settings->ui_language))) {
        free(settings);
        return send_json_error(req, "400 Bad Request", "ui.language must use [a-z0-9_-] and be 2-15 chars");
    }
    {
        char transition[APP_DISPLAY_PAGE_TRANSITION_MAX_LEN] = {0};
        if (!runtime_settings_page_transition_from_string(settings->display_page_transition, transition,
                                                          sizeof(transition))) {
            free(settings);
            return send_json_error(req, "400 Bad Request",
                                   "display.page_transition must be one of none, fade, slide, slide_up, fade_slide");
        }
        strlcpy(settings->display_page_transition, transition, sizeof(settings->display_page_transition));
        settings->display_page_transition_ms =
            (uint16_t)clamp_int(settings->display_page_transition_ms, 0, APP_DISPLAY_PAGE_TRANSITION_MAX_MS);
    }
    {
        char press_fx[APP_TILE_PRESS_FX_MAX_LEN] = {0};
        if (!runtime_settings_tile_press_fx_from_string(settings->display_tile_press_fx, press_fx,
                                                       sizeof(press_fx))) {
            free(settings);
            return send_json_error(req, "400 Bad Request",
                                   "display.tile_press_fx must be one of none, dim, scale, both");
        }
        strlcpy(settings->display_tile_press_fx, press_fx, sizeof(settings->display_tile_press_fx));
        settings->display_tile_press_fx_dim =
            (uint8_t)clamp_int(settings->display_tile_press_fx_dim, 0, APP_TILE_PRESS_FX_DIM_MAX);
        settings->display_tile_press_fx_scale =
            (uint8_t)clamp_int(settings->display_tile_press_fx_scale, APP_TILE_PRESS_FX_SCALE_MIN,
                               APP_TILE_PRESS_FX_SCALE_MAX);
    }
    {
        char value_anim[APP_DISPLAY_VALUE_ANIM_MAX_LEN] = {0};
        if (!runtime_settings_value_anim_from_string(settings->display_value_anim, value_anim,
                                                     sizeof(value_anim))) {
            free(settings);
            return send_json_error(req, "400 Bad Request",
                                   "display.value_anim must be one of none, fade, slide, count");
        }
        strlcpy(settings->display_value_anim, value_anim, sizeof(settings->display_value_anim));
        settings->display_value_anim_ms =
            (uint16_t)clamp_int(settings->display_value_anim_ms, 0, APP_DISPLAY_VALUE_ANIM_MAX_MS);
    }

    esp_err_t save_err = runtime_settings_save(settings);
    if (save_err == ESP_OK && !reboot && strcmp(settings->time_tz, previous_timezone) != 0) {
        if (time_sync_set_tz(settings->time_tz) != ESP_OK) {
            free(settings);
            return send_json_error(req, "500 Internal Server Error", "Timezone saved but could not be applied; reboot to retry");
        }
    }
    if (save_err == ESP_OK && !reboot) {
        /* Apply display settings immediately without a reboot. */
        ui_screen_saver_apply_settings(settings);
        ui_page_transition_apply_settings(settings);
        ui_press_feedback_apply_settings(settings);
        ui_value_anim_apply_settings(settings);
        ui_pages_apply_topbar_settings(settings);
        ui_pages_apply_bottom_bar_settings(settings);
        ui_theme_router_apply_settings(settings);
        /* (Re)configure native MQTT + HA discovery without a reboot. */
        panel_mqtt_notify_settings_changed();
    }
    free(settings);
    if (save_err != ESP_OK) {
        return httpd_resp_send_500(req);
    }

    cJSON *resp = cJSON_CreateObject();
    if (resp == NULL) {
        return httpd_resp_send_500(req);
    }
    cJSON_AddBoolToObject(resp, "ok", true);
    cJSON_AddBoolToObject(resp, "rebooting", reboot);
    char *payload = cJSON_PrintUnformatted(resp);
    cJSON_Delete(resp);
    if (payload == NULL) {
        return httpd_resp_send_500(req);
    }

    set_json_headers(req);
    esp_err_t send_err = httpd_resp_sendstr(req, payload);
    cJSON_free(payload);

    if (send_err == ESP_OK && reboot) {
        schedule_restart();
    }
    return send_err;
}

esp_err_t api_display_activity_post_handler(httpd_req_t *req)
{
    /* Wake the display: HA automations (e.g. a PIR motion sensor) POST here. */
    display_note_activity();

    cJSON *resp = cJSON_CreateObject();
    if (resp == NULL) {
        return httpd_resp_send_500(req);
    }
    cJSON_AddBoolToObject(resp, "ok", true);
    char *payload = cJSON_PrintUnformatted(resp);
    cJSON_Delete(resp);
    if (payload == NULL) {
        return httpd_resp_send_500(req);
    }

    set_json_headers(req);
    esp_err_t err = httpd_resp_sendstr(req, payload);
    cJSON_free(payload);
    return err;
}

#define WALLPAPER_UPLOAD_CHUNK 4096

esp_err_t api_display_wallpaper_post_handler(httpd_req_t *req)
{
    if (req->content_len != (int)APP_WALLPAPER_BYTES) {
        char msg[96] = {0};
        snprintf(msg, sizeof(msg), "Expected exactly %u bytes of RGB565 data", (unsigned)APP_WALLPAPER_BYTES);
        return send_json_error(req, "400 Bad Request", msg);
    }

    /* Uploads always land in the store that is active right now: the card while
     * one is mounted, internal flash otherwise. */
    const char *tmp_path = ui_screen_saver_wallpaper_tmp_path();
    const char *dst_path = ui_screen_saver_wallpaper_path();
    const bool dst_on_card = ui_screen_saver_wallpaper_on_card();

    FILE *f = fopen(tmp_path, "wb");
    if (f == NULL) {
        return send_json_error(req, "500 Internal Server Error", "Failed to open wallpaper file");
    }

    uint8_t *buf = (uint8_t *)heap_caps_malloc(WALLPAPER_UPLOAD_CHUNK, MALLOC_CAP_8BIT);
    if (buf == NULL) {
        fclose(f);
        remove(tmp_path);
        return httpd_resp_send_500(req);
    }

    int received = 0;
    bool ok = true;
    while (received < req->content_len) {
        int remaining = req->content_len - received;
        int to_read = remaining > WALLPAPER_UPLOAD_CHUNK ? WALLPAPER_UPLOAD_CHUNK : remaining;
        int r = httpd_req_recv(req, (char *)buf, to_read);
        if (r == HTTPD_SOCK_ERR_TIMEOUT) {
            continue;
        }
        if (r <= 0) {
            ok = false;
            break;
        }
        if (fwrite(buf, 1, (size_t)r, f) != (size_t)r) {
            ok = false;
            break;
        }
        received += r;
    }
    heap_caps_free(buf);
    fclose(f);

    if (!ok || received != req->content_len) {
        remove(tmp_path);
        return send_json_error(req, "400 Bad Request", "Wallpaper upload aborted");
    }

    if (rename(tmp_path, dst_path) != 0) {
        remove(tmp_path);
        return send_json_error(req, "500 Internal Server Error", "Failed to store wallpaper");
    }

    /* One copy only: a leftover copy in the other store would come back the
     * moment the card is pulled or inserted. */
    remove(dst_on_card ? APP_WALLPAPER_PATH : APP_SD_WALLPAPER_PATH);

    ui_screen_saver_reload_wallpaper();
    display_note_activity();

    cJSON *resp = cJSON_CreateObject();
    if (resp == NULL) {
        return httpd_resp_send_500(req);
    }
    cJSON_AddBoolToObject(resp, "ok", true);
    char *payload = cJSON_PrintUnformatted(resp);
    cJSON_Delete(resp);
    if (payload == NULL) {
        return httpd_resp_send_500(req);
    }

    set_json_headers(req);
    esp_err_t err = httpd_resp_sendstr(req, payload);
    cJSON_free(payload);
    return err;
}

esp_err_t api_display_wallpaper_get_handler(httpd_req_t *req)
{
    /* The frame normally sits on the card, but a card inserted a moment ago may
     * not hold it yet, so the other store is tried before giving up. */
    FILE *f = fopen(ui_screen_saver_wallpaper_path(), "rb");
    if (f == NULL) {
        f = fopen(ui_screen_saver_wallpaper_on_card() ? APP_WALLPAPER_PATH : APP_SD_WALLPAPER_PATH, "rb");
    }
    if (f == NULL) {
        return send_json_error(req, "404 Not Found", "No wallpaper stored");
    }

    char *buf = (char *)heap_caps_malloc(WALLPAPER_UPLOAD_CHUNK, MALLOC_CAP_8BIT);
    if (buf == NULL) {
        fclose(f);
        return httpd_resp_send_500(req);
    }

    /* Raw RGB565, little endian, row major: exactly what the panel stores, so
     * the web editor can render a preview without any conversion. */
    httpd_resp_set_type(req, "application/octet-stream");
    httpd_resp_set_hdr(req, "Cache-Control", "no-store");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Content-Disposition", "inline; filename=\"wallpaper.bin\"");

    esp_err_t err = ESP_OK;
    size_t read_bytes = 0;
    while ((read_bytes = fread(buf, 1, WALLPAPER_UPLOAD_CHUNK, f)) > 0U) {
        err = httpd_resp_send_chunk(req, buf, (ssize_t)read_bytes);
        if (err != ESP_OK) {
            break;
        }
    }
    heap_caps_free(buf);
    fclose(f);

    if (err != ESP_OK) {
        return err;
    }
    return httpd_resp_send_chunk(req, NULL, 0);
}

esp_err_t api_display_wallpaper_delete_handler(httpd_req_t *req)
{
    /* Both stores are cleared, otherwise a card change would bring the deleted
     * picture back. */
    remove(APP_WALLPAPER_PATH);
    remove(APP_SD_WALLPAPER_PATH);
    ui_screen_saver_reload_wallpaper();

    cJSON *resp = cJSON_CreateObject();
    if (resp == NULL) {
        return httpd_resp_send_500(req);
    }
    cJSON_AddBoolToObject(resp, "ok", true);
    char *payload = cJSON_PrintUnformatted(resp);
    cJSON_Delete(resp);
    if (payload == NULL) {
        return httpd_resp_send_500(req);
    }

    set_json_headers(req);
    esp_err_t err = httpd_resp_sendstr(req, payload);
    cJSON_free(payload);
    return err;
}
