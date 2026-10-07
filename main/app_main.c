/* SPDX-License-Identifier: LicenseRef-FNCL-1.1
 * Copyright (c) 2026 Cpt_Kirk
 */
#include <stdio.h>
#include <string.h>

#include "esp_err.h"
#include "esp_event.h"
#include "esp_app_desc.h"
#include "esp_log.h"
#include "esp_littlefs.h"
#include "esp_netif.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "nvs_flash.h"
#include "soc/soc_caps.h"

#include "api/http_server.h"
#include "app_config.h"
#include "app_events.h"
#include "diag/boot_guard.h"
#include "diag/system_log.h"
#include "drivers/display_init.h"
#include "drivers/touch_init.h"
#include "ha/ha_client.h"
#include "ha/ha_cover_fetcher.h"
#include "ha/ha_energy_model.h"
#include "ha/ha_model.h"
#include "layout/layout_store.h"
#include "mqtt/panel_mqtt.h"
#include "net/time_sync.h"
#include "net/wifi_mgr.h"
#include "sd/sd_card.h"
#include "settings/runtime_settings.h"
#include "ui/ui_boot_splash.h"
#include "ui/ui_i18n.h"
#include "ui/ui_runtime.h"
#include "ui/ui_remote_display.h"
#include "ui/ui_screen_saver.h"
#include "ui/ui_theme_router.h"
#include "ui/theme/theme_store.h"
#include "util/log_tags.h"

#if CONFIG_IDF_TARGET_ESP32P4 && CONFIG_ESP32P4_SELECTS_REV_LESS_V3 && (CONFIG_ESP_DEFAULT_CPU_FREQ_MHZ > 360)
#error "ESP32-P4 rev<3 supports up to 360 MHz in this IDF; lower CONFIG_ESP_DEFAULT_CPU_FREQ_MHZ."
#endif

static runtime_settings_t s_runtime_settings = {0};

typedef enum {
    BOOT_SCREEN_DASHBOARD = 0,
    BOOT_SCREEN_WIFI_SETUP = 1,
    BOOT_SCREEN_HA_SETUP = 2,
} boot_screen_mode_t;

static void app_show_wifi_setup_screen(bool had_wifi_credentials)
{
    char ap_ip[16] = "192.168.4.1";
    if (wifi_mgr_get_ap_ip(ap_ip, sizeof(ap_ip)) != ESP_OK) {
        strlcpy(ap_ip, "192.168.4.1", sizeof(ap_ip));
    }

    const char *ap_ssid = wifi_mgr_get_setup_ap_ssid();
    if (ap_ssid == NULL || ap_ssid[0] == '\0') {
        ap_ssid = APP_SETUP_AP_SSID_PREFIX;
    }

    char ssid_line[64] = {0};
    char url_line[64] = {0};
    snprintf(ssid_line, sizeof(ssid_line), "%s: %s", ui_i18n_get("topbar.ap", "AP"), ap_ssid);
    snprintf(url_line, sizeof(url_line), "http://%s", ap_ip);

    ui_boot_splash_set_title(ui_i18n_get("boot.wifi_setup_title", "Wi-Fi Setup"));
    ui_boot_splash_set_status_layout(true, 520, 0);
    ui_boot_splash_clear_status();
    ui_boot_splash_set_progress(100);
    ui_boot_splash_set_status(
        had_wifi_credentials ? ui_i18n_get("boot.wifi_connect_failed", "Wi-Fi connect failed")
                             : ui_i18n_get("boot.wifi_credentials_missing", "Wi-Fi credentials missing"));
    ui_boot_splash_set_status(ssid_line);
    ui_boot_splash_set_status(ui_i18n_get("boot.open_editor", "Open BETTA Editor:"));
    ui_boot_splash_set_status(url_line);
}

static void app_show_ha_setup_screen(void)
{
    char sta_ip[16] = {0};
    char url_line[64] = {0};
    if (wifi_mgr_get_sta_ip(sta_ip, sizeof(sta_ip)) == ESP_OK && sta_ip[0] != '\0') {
        snprintf(url_line, sizeof(url_line), "http://%s", sta_ip);
    } else {
        snprintf(url_line, sizeof(url_line), "http://<panel-ip>");
    }

    ui_boot_splash_set_title(ui_i18n_get("boot.ha_setup_title", "Home Assistant Setup"));
    ui_boot_splash_set_status_layout(true, 520, 0);
    ui_boot_splash_clear_status();
    ui_boot_splash_set_progress(100);
    ui_boot_splash_set_status(ui_i18n_get("boot.wifi_connected", "Wi-Fi connected"));
    ui_boot_splash_set_status(ui_i18n_get("boot.ha_credentials_missing", "HA credentials missing"));
    ui_boot_splash_set_status(ui_i18n_get("boot.open_editor", "Open BETTA Editor:"));
    ui_boot_splash_set_status(url_line);
    ui_boot_splash_set_status(ui_i18n_get("boot.set_ha_url_token", "Set HA URL and token"));
}

static esp_err_t init_nvs(void)
{
    esp_err_t err = nvs_flash_init();
    if (err == ESP_ERR_NVS_NO_FREE_PAGES || err == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        err = nvs_flash_init();
    }
    return err;
}

static esp_err_t init_littlefs(void)
{
    esp_vfs_littlefs_conf_t conf = {
        .base_path = "/littlefs",
        .partition_label = NULL,
        .format_if_mount_failed = true,
        .dont_mount = false,
    };
    return esp_vfs_littlefs_register(&conf);
}

static esp_err_t init_net_stack(void)
{
    esp_err_t err = esp_netif_init();
    if (err != ESP_OK && err != ESP_ERR_INVALID_STATE) {
        return err;
    }

    err = esp_event_loop_create_default();
    if (err != ESP_OK && err != ESP_ERR_INVALID_STATE) {
        return err;
    }
    return ESP_OK;
}

static void auto_restart_task(void *arg)
{
    (void)arg;

    for (;;) {
        vTaskDelay(pdMS_TO_TICKS(60U * 1000U));

        if (!s_runtime_settings.system_auto_restart_enabled) {
            continue;
        }

        uint32_t hours = s_runtime_settings.system_auto_restart_hours;
        if (hours < 1U) {
            hours = 1U;
        } else if (hours > 168U) {
            hours = 168U;
        }

        const uint64_t interval_us = (uint64_t)hours * 3600ULL * 1000000ULL;
        if ((uint64_t)esp_timer_get_time() >= interval_us) {
            ESP_LOGW(TAG_APP, "Auto-restart interval reached (%u h), restarting", (unsigned)hours);
            esp_restart();
        }
    }
}

void app_main(void)
{
    const esp_app_desc_t *app_desc = esp_app_get_description();
    const char *app_version = (app_desc != NULL && app_desc->version[0] != '\0') ? app_desc->version : "unknown";

    boot_guard_init();

    ESP_LOGI(TAG_APP, "Booting %s", APP_NAME);
    ESP_LOGI("app_init", "App version: %s", app_version);

    ESP_ERROR_CHECK(init_nvs());
    ESP_ERROR_CHECK(init_littlefs());
    (void)system_log_init();
    boot_guard_report_boot();
    ESP_ERROR_CHECK(init_net_stack());
    ESP_ERROR_CHECK(app_events_init());
    ESP_ERROR_CHECK(ha_model_init());
    ESP_ERROR_CHECK(ha_energy_model_init());
    ESP_ERROR_CHECK(runtime_settings_init());

    esp_err_t settings_err = runtime_settings_load(&s_runtime_settings);
    if (settings_err != ESP_OK) {
        ESP_LOGW(TAG_APP, "Failed to load runtime settings (%s), continuing with defaults", esp_err_to_name(settings_err));
        runtime_settings_set_defaults(&s_runtime_settings);
    }
    (void)ui_i18n_init(s_runtime_settings.ui_language);
    (void)time_sync_set_timezone(s_runtime_settings.time_tz);
    ESP_ERROR_CHECK(display_init());
    (void)ui_boot_splash_show();

    /* IO47/IO48 are shared with the panel init sequence, so the card can only
     * be brought up once display_init() released them. */
    if (s_runtime_settings.sd_enabled) {
        ui_boot_splash_set_status(ui_i18n_get("boot.mounting_sd", "Mounting microSD card"));
        (void)sd_card_init();
    }

    ui_boot_splash_set_status(ui_i18n_get("boot.initializing_wifi", "Initializing Wi-Fi"));

    bool has_wifi_credentials = false;
    bool wifi_ready = false;

#if SOC_WIFI_SUPPORTED || CONFIG_ESP_HOSTED_ENABLED
    has_wifi_credentials = runtime_settings_has_wifi(&s_runtime_settings);
    if (has_wifi_credentials) {
        wifi_mgr_config_t wifi_cfg = {
            .ssid = s_runtime_settings.wifi_ssid,
            .password = s_runtime_settings.wifi_password,
            .country_code = s_runtime_settings.wifi_country_code,
            .bssid = s_runtime_settings.wifi_bssid,
            .static_enabled = s_runtime_settings.wifi_static_enabled,
            .static_ip = s_runtime_settings.wifi_static_ip,
            .static_netmask = s_runtime_settings.wifi_static_netmask,
            .static_gateway = s_runtime_settings.wifi_static_gateway,
            .static_dns = s_runtime_settings.wifi_static_dns,
            .wait_for_ip = APP_WIFI_WAIT_FOR_IP,
            .connect_timeout_ms = APP_WIFI_CONNECT_TIMEOUT_MS,
            .max_retries = APP_WIFI_MAX_RETRIES,
        };
        esp_err_t wifi_err = wifi_mgr_init(&wifi_cfg);
        if (wifi_err != ESP_OK) {
            ESP_LOGW(TAG_WIFI, "Wi-Fi init failed: %s", esp_err_to_name(wifi_err));
            ui_boot_splash_set_status(ui_i18n_get("boot.wifi_connect_failed", "Wi-Fi connect failed"));
        } else {
            wifi_ready = true;
            time_sync_start(s_runtime_settings.ntp_server);
            time_sync_wait_for_sync(8000);
            ui_boot_splash_set_status(ui_i18n_get("boot.wifi_connected", "Wi-Fi connected"));
        }
    } else {
        ESP_LOGW(TAG_WIFI, "No Wi-Fi credentials configured, starting setup AP");
    }

    if (!wifi_ready) {
        wifi_mgr_ap_config_t ap_cfg = {
            .ssid = NULL,
            .password = APP_SETUP_AP_PASSWORD,
            .country_code = s_runtime_settings.wifi_country_code,
            .channel = APP_SETUP_AP_CHANNEL,
            .max_connection = APP_SETUP_AP_MAX_CONNECTIONS,
        };
        esp_err_t ap_err = wifi_mgr_start_setup_ap(&ap_cfg);
        if (ap_err == ESP_OK) {
            char ap_status[64] = {0};
            snprintf(
                ap_status,
                sizeof(ap_status),
                "%s: %s",
                ui_i18n_get("boot.setup_ap_prefix", "Setup AP"),
                wifi_mgr_get_setup_ap_ssid());
            ui_boot_splash_set_status(ap_status);
            ESP_LOGW(TAG_WIFI, "Setup AP started: %s", wifi_mgr_get_setup_ap_ssid());
        } else {
            ESP_LOGW(TAG_WIFI, "Failed to start setup AP: %s", esp_err_to_name(ap_err));
            ui_boot_splash_set_status(ui_i18n_get("boot.offline_mode", "Offline mode"));
        }
    }
#else
    ESP_LOGW(TAG_WIFI, "No Wi-Fi backend enabled for target %s", CONFIG_IDF_TARGET);
    ui_boot_splash_set_status("No Wi-Fi backend");
#endif

    boot_screen_mode_t boot_screen_mode = BOOT_SCREEN_DASHBOARD;
    if (!wifi_ready) {
        boot_screen_mode = BOOT_SCREEN_WIFI_SETUP;
    } else if (!runtime_settings_has_ha(&s_runtime_settings)) {
        boot_screen_mode = BOOT_SCREEN_HA_SETUP;
    }

    ESP_ERROR_CHECK(layout_store_init());
    ESP_ERROR_CHECK(theme_store_init());
    /* theme_store_init() has just re-activated the persisted theme: that is the
     * global theme the per-page overrides and the day/night schedule build on. */
    ui_theme_router_init();
    ui_theme_router_apply_settings(&s_runtime_settings);
    ESP_ERROR_CHECK(http_server_start());

    panel_mqtt_init();
    if (wifi_ready && runtime_settings_has_ha(&s_runtime_settings)) {
        panel_mqtt_apply_settings(&s_runtime_settings);
    }

    if (boot_screen_mode == BOOT_SCREEN_DASHBOARD) {
        ui_boot_splash_set_status(ui_i18n_get("boot.initializing_touch", "Initializing touch"));
        esp_err_t touch_err = touch_init();
        if (touch_err != ESP_OK) {
            ESP_LOGW(TAG_TOUCH, "Touch init failed, continuing without touch input: %s", esp_err_to_name(touch_err));
        }

        ui_boot_splash_set_status(ui_i18n_get("boot.loading_dashboard", "Loading dashboard"));
        ESP_ERROR_CHECK(ui_runtime_init());
        ESP_ERROR_CHECK(ui_runtime_reload_layout());
        ESP_ERROR_CHECK(ui_runtime_start());
        ui_boot_splash_hide();
#if CONFIG_APP_REMOTE_DISPLAY
        esp_err_t remote_err = ui_remote_display_init();
        if (remote_err != ESP_OK) {
            ESP_LOGW(TAG_DISPLAY, "Live display unavailable: %s", esp_err_to_name(remote_err));
        }
#endif

        /* From here on the screensaver frame follows the microSD card: it is
         * moved onto a card that is inserted and copied back to internal flash
         * when the card is pulled, so the picture is never lost.  Registered
         * only once the UI is up, because the sync needs the loaded frame. */
        sd_card_set_event_callback(ui_screen_saver_wallpaper_sync);
        ui_screen_saver_wallpaper_sync(SD_CARD_EVENT_MOUNTED);

        ha_client_config_t ha_cfg = {
            .ws_url = s_runtime_settings.ha_ws_url,
            .access_token = s_runtime_settings.ha_access_token,
            .rest_enabled = s_runtime_settings.ha_rest_enabled,
        };
        esp_err_t ha_err = ha_client_start(&ha_cfg);
        if (ha_err != ESP_OK) {
            ESP_LOGW(TAG_HA_CLIENT, "HA client start failed: %s", esp_err_to_name(ha_err));
        }
        esp_err_t cover_err = ha_cover_fetcher_init();
        if (cover_err != ESP_OK) {
            ESP_LOGW(TAG_HA_CLIENT, "HA cover fetcher init failed: %s", esp_err_to_name(cover_err));
        }
    } else if (boot_screen_mode == BOOT_SCREEN_WIFI_SETUP) {
        app_show_wifi_setup_screen(has_wifi_credentials);
        ESP_LOGW(TAG_APP, "Provisioning screen active: Wi-Fi setup required");
    } else {
        app_show_ha_setup_screen();
        ESP_LOGW(TAG_HA_CLIENT, "HA settings missing, showing setup screen with web editor URL");
    }

    if (xTaskCreate(auto_restart_task, "auto_restart", 3072, NULL, 5, NULL) != pdPASS) {
        ESP_LOGW(TAG_APP, "Failed to create auto-restart task");
    }

    /* Confirms a pending OTA image once the panel is healthy (no-op when the
     * running image is not awaiting rollback verification). */
    boot_guard_start_confirm_task();
}
