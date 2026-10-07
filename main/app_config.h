/* SPDX-License-Identifier: LicenseRef-FNCL-1.1
 * Copyright (c) 2026 Cpt_Kirk
 */
#pragma once

#include "sdkconfig.h"

/* ---- Panel-variant-dependent geometry & identity ----------------------
 * Selected via CONFIG_APP_PANEL_VARIANT_* (see main/Kconfig.projbuild).
 * Defaults fall back to the 4" 720x720 baseline so an older sdkconfig
 * (pre-variant) still builds the smart86 target unchanged. */
#if defined(CONFIG_APP_PANEL_VARIANT_10INCH_1280)
#  define APP_NAME               "betta-ha-panel-10.1"
#  define APP_SCREEN_WIDTH       1280
#  define APP_SCREEN_HEIGHT      800
#  define APP_CONTENT_BOX_WIDTH  1280
#  define APP_CONTENT_BOX_HEIGHT 680
#elif defined(CONFIG_APP_PANEL_VARIANT_S3_480)
#  define APP_NAME               "betta-ha-panel-s3"
#  define APP_SCREEN_WIDTH       480
#  define APP_SCREEN_HEIGHT      480
#  define APP_CONTENT_BOX_WIDTH  480
#  define APP_CONTENT_BOX_HEIGHT 360
#else /* CONFIG_APP_PANEL_VARIANT_4INCH_720 (default) */
#  define APP_NAME               "betta-ha-panel"
#  define APP_SCREEN_WIDTH       720
#  define APP_SCREEN_HEIGHT      720
#  define APP_CONTENT_BOX_WIDTH  720
#  define APP_CONTENT_BOX_HEIGHT 600
#endif
#define APP_CONTENT_BOX_X 0
#define APP_CONTENT_BOX_Y 60
#define APP_NAV_BUTTON_COUNT 5
#define APP_LVGL_ANTIALIASING 0
#define APP_UI_REWORK_V2 1
#define APP_UI_TEST_WEATHER_ICON_OVERLAY 0

#define APP_DISPLAY_ACTIVE_BRIGHTNESS_PERCENT 100
#define APP_DISPLAY_DIM_BRIGHTNESS_PERCENT 10
/* Backlight level used while the screensaver clock is on screen: dark enough
 * not to light up the room, bright enough to read the time. */
#define APP_DISPLAY_SAVER_BRIGHTNESS_PERCENT 20
#define APP_DISPLAY_DIM_TIMEOUT_MS (3 * 60 * 1000)
#define APP_DISPLAY_SCREENSAVER_TIMEOUT_SEC 120
#define APP_DISPLAY_SCREEN_OFF_TIMEOUT_SEC 300
/* Auto screen-off stays off until it is switched on by hand (web UI, on-panel
 * settings or MQTT). A panel with fresh/reset settings must never blank itself. */
#define APP_DISPLAY_SCREEN_OFF_ENABLED 0
#define APP_DISPLAY_CLOCK_24H 1
#define APP_DISPLAY_SAVER_SHOW_SECONDS 0
#define APP_DISPLAY_SAVER_SHOW_DATE 1
#define APP_DISPLAY_SAVER_CLOCK_COLOR 0xFFFFFF
#define APP_DISPLAY_SAVER_DATE_COLOR 0xC8C8C8
/* Night schedule: inside the window the backlight is forced to
 * APP_DISPLAY_NIGHT_BRIGHTNESS_PERCENT (0 = off) and a touch only wakes the
 * panel for APP_DISPLAY_NIGHT_WAKE_SEC seconds. Defaults 22:00 - 06:00. */
#define APP_DISPLAY_NIGHT_MODE_ENABLED 0
#define APP_DISPLAY_NIGHT_START_MIN (22 * 60)
#define APP_DISPLAY_NIGHT_END_MIN (6 * 60)
#define APP_DISPLAY_NIGHT_BRIGHTNESS_PERCENT 0
#define APP_DISPLAY_NIGHT_WAKE_SEC 20
/* Gap between the clock baseline block and the bottom screen edge, and the gap
 * between the date caption and the clock above it. */
#define APP_DISPLAY_SAVER_CLOCK_BOTTOM_GAP 26
#define APP_DISPLAY_SAVER_DATE_GAP 8
/* Screensaver clock style. CLASSIC draws the plain digital clock, FLIP draws
 * four flip-clock cards whose digits fold over a centre seam whenever the time
 * changes. */
#define APP_DISPLAY_SAVER_CLOCK_STYLE_CLASSIC 0
#define APP_DISPLAY_SAVER_CLOCK_STYLE_FLIP 1
#define APP_DISPLAY_SAVER_CLOCK_STYLE_DEFAULT APP_DISPLAY_SAVER_CLOCK_STYLE_CLASSIC
/* Flip card geometry in pixels (panel is 480x480: 4 * 74 + 3 * 14 = 338) and
 * the length of one half of the digit fold animation. */
#define APP_DISPLAY_SAVER_FLIP_CARD_W 74
#define APP_DISPLAY_SAVER_FLIP_CARD_H 100
#define APP_DISPLAY_SAVER_FLIP_CARD_GAP 14
#define APP_DISPLAY_SAVER_FLIP_CARD_RADIUS 16
#define APP_DISPLAY_SAVER_FLIP_CARD_COLOR 0x1A1D24
/* Distance of the digit line box from the top of a card. The line box is 65 px
 * tall (APP_FONT_CLOCK_84) and the fold seam sits at CARD_H / 2, so 18 px puts
 * the digit ink exactly on the seam. */
#define APP_DISPLAY_SAVER_FLIP_LABEL_Y 18
#define APP_DISPLAY_SAVER_FLIP_ANIM_MS 150
/* 12 hour format badge ("AM"/"PM") that sits to the right of the clock like on
 * any digital clock. Poppins ships without a bold cut here and LVGL only
 * thickens outlines of vector fonts, so the badge is drawn WEIGHT times, one
 * pixel apart, which gives the letters a bold weight. It gets a black plate of
 * its own so it stays readable over wallpapers: GAP is the space between the
 * digits and the badge, PAD/RADIUS shape that plate. */
#define APP_DISPLAY_SAVER_AMPM_GAP 10
#define APP_DISPLAY_SAVER_AMPM_WEIGHT 1
#define APP_DISPLAY_SAVER_AMPM_PAD 4
#define APP_DISPLAY_SAVER_AMPM_RADIUS 8
/* Page transition: animation used when the active page changes.
 * One of "none", "fade", "slide", "slide_up", "fade_slide"; a duration of
 * 0 ms disables the animation as well. */
#define APP_DISPLAY_PAGE_TRANSITION_MAX_LEN 16
#define APP_DISPLAY_PAGE_TRANSITION_DEFAULT "fade"
#define APP_DISPLAY_PAGE_TRANSITION_DEFAULT_MS 220
#define APP_DISPLAY_PAGE_TRANSITION_MAX_MS 1200
/* Tap feedback: short visual reaction of an interactive tile while it is held
 * down. APP_TILE_PRESS_FX is one of "none", "dim", "scale", "both"; _DIM is how
 * much the whole tile fades out while pressed (percent, 0 = no fade) and
 * _SCALE_PCT is the size the tile shrinks to (percent of its normal size,
 * 100 = no shrink). */
#define APP_TILE_PRESS_FX_MAX_LEN 8
#define APP_TILE_PRESS_FX_DEFAULT "both"
#define APP_TILE_PRESS_FX_DIM_DEFAULT 15
#define APP_TILE_PRESS_FX_DIM_MAX 60
#define APP_TILE_PRESS_FX_SCALE_DEFAULT 97
#define APP_TILE_PRESS_FX_SCALE_MIN 90
#define APP_TILE_PRESS_FX_SCALE_MAX 100
/* Value animation: how a tile readout reacts when the entity state changes.
 * APP_DISPLAY_VALUE_ANIM is one of "none", "fade", "slide", "count", where
 * "count" steps the number from the old to the new value and falls back to
 * "fade" for texts that hold no single number; _MS is the duration and 0
 * disables the animation as well. */
#define APP_DISPLAY_VALUE_ANIM_MAX_LEN 8
#define APP_DISPLAY_VALUE_ANIM_DEFAULT "count"
#define APP_DISPLAY_VALUE_ANIM_DEFAULT_MS 320
#define APP_DISPLAY_VALUE_ANIM_MAX_MS 1500
/* Top bar: which elements are visible, whether the status icons use the
 * original logos or plain text, and the optional own colour set. The colours
 * below are only used when APP_DISPLAY_TOPBAR_CUSTOM_COLORS is enabled -
 * otherwise the active theme keeps owning the top bar look. The literals match
 * the default theme palette so the first switch to custom colours does not
 * change anything on screen. */
#define APP_DISPLAY_TOPBAR_SHOW_CLOCK 1
#define APP_DISPLAY_TOPBAR_SHOW_DATE 1
#define APP_DISPLAY_TOPBAR_SHOW_GEAR 1
#define APP_DISPLAY_TOPBAR_SHOW_STATUS 1
#define APP_DISPLAY_TOPBAR_ICON_TEXT 0
#define APP_DISPLAY_TOPBAR_CUSTOM_COLORS 0
#define APP_DISPLAY_TOPBAR_BG_COLOR 0x0D1723
#define APP_DISPLAY_TOPBAR_CLOCK_COLOR 0xEAF2FA
#define APP_DISPLAY_TOPBAR_DATE_COLOR 0xA1B1C1
#define APP_DISPLAY_TOPBAR_GEAR_COLOR 0xA1B1C1
#define APP_DISPLAY_TOPBAR_HA_COLOR 0xC7D1DB
#define APP_DISPLAY_TOPBAR_WIFI_COLOR 0xC7D1DB
/* Fonts the top bar clock falls back to when the free space next to the date
 * and the status chips is too narrow for the default size. */
#define APP_DISPLAY_TOPBAR_CLOCK_MIN_FONT 22

/* Bottom bar (page tabs) own colours, same idea as the top bar above. The
 * literals are the dark_v2 palette values the bar already uses, so flipping
 * APP_DISPLAY_NAV_CUSTOM_COLORS on does not change anything on screen. */
#define APP_DISPLAY_NAV_CUSTOM_COLORS 0
#define APP_DISPLAY_NAV_BAR_BG_COLOR 0x0D1723
#define APP_DISPLAY_NAV_BAR_BORDER_COLOR 0x2A3D50
#define APP_DISPLAY_NAV_BUTTON_BG_COLOR 0x1B2A3A
#define APP_DISPLAY_NAV_BUTTON_BORDER_COLOR 0x385064
#define APP_DISPLAY_NAV_TAB_IDLE_COLOR 0xA9C3D0
#define APP_DISPLAY_NAV_TAB_ACTIVE_COLOR 0x6FE8FF
#define APP_DISPLAY_NAV_HOME_IDLE_COLOR 0x9EB8C7
#define APP_DISPLAY_NAV_HOME_ACTIVE_COLOR 0x53E5FF

#if defined(CONFIG_APP_PANEL_VARIANT_S3_480)
#define APP_EVENT_QUEUE_LENGTH 64
#else
#define APP_EVENT_QUEUE_LENGTH 96
#endif
#define APP_EVENT_QUEUE_WAIT_MS 50

#define APP_LAYOUT_PATH "/littlefs/layout.json"
#define APP_LAYOUT_MAX_JSON_LEN 16384
#define APP_LAYOUT_MAX_ERRORS 16

#define APP_SETTINGS_PATH "/littlefs/settings.json"
#define APP_SETTINGS_MAX_JSON_LEN 4096

/* Full backup download (layout + public settings + custom themes) and the
 * upload limit for /api/backup/restore. */
#define APP_BACKUP_MAX_JSON_LEN 32768

/* UI task watchdog: the system log task restarts the panel when the UI heartbeat
 * stops advancing for this long (the UI task is stuck holding the LVGL lock and
 * can never drain the event queue). */
#define APP_UI_WATCHDOG_TIMEOUT_MS 60000

/* OTA rollback guard: a freshly updated image must prove itself (Wi-Fi joined,
 * or this much uptime) before the bootloader retires the rollback option. */
#define APP_BOOT_CONFIRM_TIMEOUT_MS (30 * 60 * 1000)

/* Persistent system/diagnostic log (auto-rotating, bounded on LittleFS). */
#define APP_LOG_DIR "/littlefs/logs"
#define APP_LOG_FILE "/littlefs/logs/system.log"
#define APP_LOG_MAX_FILE_BYTES (96 * 1024)
#define APP_LOG_MAX_ROTATED 3
#define APP_LOG_RING_BYTES 8192
#define APP_LOG_HEARTBEAT_MS 30000

/* Screensaver wallpaper: raw RGB565 frame at native panel resolution.  While a
 * card is mounted the frame is kept on the card only (see
 * ui_screen_saver_wallpaper_path()); LittleFS holds the fallback copy used when
 * no card is in the socket. */
#define APP_WALLPAPER_PATH "/littlefs/wallpaper.bin"
#define APP_WALLPAPER_TMP_PATH "/littlefs/wallpaper.tmp"
#define APP_WALLPAPER_BYTES ((APP_SCREEN_WIDTH) * (APP_SCREEN_HEIGHT) * 2)
#define APP_SD_WALLPAPER_PATH APP_SD_MOUNT_POINT "/" APP_SD_PHOTO_DIR "/wallpaper.bin"
#define APP_SD_WALLPAPER_TMP_PATH APP_SD_MOUNT_POINT "/" APP_SD_PHOTO_DIR "/wallpaper.tmp"

#define APP_WIFI_SSID_MAX_LEN 33
#define APP_WIFI_PASSWORD_MAX_LEN 65
#define APP_WIFI_COUNTRY_CODE_MAX_LEN 3
#define APP_WIFI_BSSID_MAX_LEN 18
#define APP_WIFI_IPV4_MAX_LEN 16
#define APP_HA_WS_URL_MAX_LEN 256
#define APP_HA_ACCESS_TOKEN_MAX_LEN 512
#define APP_NTP_SERVER_MAX_LEN 128
#define APP_TIME_TZ_MAX_LEN 128
#define APP_UI_LANGUAGE_MAX_LEN 16
#define APP_MQTT_HOST_MAX_LEN 129
#define APP_MQTT_USERNAME_MAX_LEN 65
#define APP_MQTT_PASSWORD_MAX_LEN 65
#define APP_MQTT_DISCOVERY_PREFIX_MAX_LEN 65

#define APP_UI_DEFAULT_LANGUAGE "en"

#define APP_MQTT_ENABLED_DEFAULT 1
#define APP_MQTT_PORT_DEFAULT 1883
#define APP_MQTT_TLS_PORT_DEFAULT 8883
#define APP_MQTT_DISCOVERY_PREFIX_DEFAULT "homeassistant"

#define APP_I18N_DIR "/littlefs/i18n"
#define APP_I18N_MAX_JSON_LEN 32768

#define APP_THEME_DIR "/littlefs/themes"
#define APP_THEME_ACTIVE_PATH "/littlefs/themes/active.id"

#define APP_SETUP_AP_SSID_PREFIX "BETTA-Setup"
#define APP_SETUP_AP_PASSWORD ""
#define APP_SETUP_AP_CHANNEL 1
#define APP_SETUP_AP_MAX_CONNECTIONS 4

#define APP_MAX_PAGES 5
#define APP_MAX_WIDGETS_PER_PAGE 32
#define APP_MAX_WIDGETS_TOTAL (APP_MAX_PAGES * APP_MAX_WIDGETS_PER_PAGE)

#define APP_MAX_ENTITY_ID_LEN 96
#define APP_MAX_WIDGET_ID_LEN 32
#define APP_MAX_PAGE_ID_LEN 32
#define APP_MAX_STATE_LEN 64
#define APP_MAX_NAME_LEN 64
#define APP_MAX_UNIT_LEN 24
#define APP_MAX_ICON_LEN 64
#define APP_MAX_UI_OPTION_LEN 24
#define APP_MAX_COLOR_STR_LEN 16
#define APP_MAX_ALARM_CODE_LEN 24
#define APP_MAX_ALARM_MODES_LEN 48

/* ---- microSD / TF card --------------------------------------------------
 * The 4" board wires the TF socket to the SPI bus (manufacturer demo
 * `switch86_lvgl_music/HAL.h`: SD_CS 42, SPI_MOSI 47, SPI_MISO 41, SPI_SCK 48;
 * the pin spreadsheet lists the same pins as TF(SCK)/TF(SDA)/TF(D1)/TF(D3)).
 * IO47/IO48 are shared with the bit-banged ST7701 init sequence, so the card
 * is mounted only once display_init() has returned and the RGB panel has
 * released those pins (enable_io_multiplex=1).  The other panel variants have
 * no socket, so the feature is compiled out there. */
#if defined(CONFIG_APP_PANEL_VARIANT_S3_480)
#define APP_SD_SUPPORTED 1
#else
#define APP_SD_SUPPORTED 0
#endif
#define APP_SD_PIN_SCK 48
#define APP_SD_PIN_MOSI 47
#define APP_SD_PIN_MISO 41
#define APP_SD_PIN_CS 42
#define APP_SD_MOUNT_POINT "/sd"
/* The socket is only wired for SPI mode (DAT0 is not connected), so the card
 * is always driven at this clock.  10 MHz is the fastest rate that proved
 * reliable on the 4" board. */
#define APP_SD_SPI_HOST 2
#define APP_SD_FREQ_HZ (10 * 1000 * 1000)
/* Filesystem written by the formatter, and the folder layout created on a
 * freshly formatted card. */
#define APP_SD_MAX_FILES 64
#define APP_SD_MAX_PATH_LEN 128
#define APP_SD_MAX_NAME_LEN 64
/* Name shown for the card in the web UI and the diagnostics page. */
#define APP_SD_CARD_NAME_LEN 16
/* Filesystem found on a card the panel cannot mount ("exFAT", "NTFS", ...). */
#define APP_SD_FS_NAME_LEN 12
/* Rotated logs live here.  The exporter keeps at most MAX_FILES exports and at
 * most MAX_BYTES in total; a single export is roughly the whole internal log
 * history (~380 kB today), so the file count is normally the binding limit and
 * the byte budget only guards against a runaway log. */
#define APP_SD_LOG_DIR "logs"
#define APP_SD_PHOTO_DIR "photos"
#define APP_SD_LOG_MAX_FILES 8
#define APP_SD_LOG_MAX_BYTES (4 * 1024 * 1024)
/* Automatic log export interval (0 disables the periodic export). */
#define APP_SD_LOG_EXPORT_PERIOD_SEC (6 * 60 * 60)

#define APP_HA_MAX_ENTITIES 256
#define APP_HA_MAX_STATES 256
/* Must fit weather entity attributes incl. the compact forecast array
 * plus temperature/humidity/units.  The S3 variant keeps fewer forecast
 * rows, but 1024 leaves comfortable headroom for both panel classes. */
#define APP_HA_ATTRS_MAX_LEN 1024
/* Full RGBIC/Govee effect lists can exceed 3.8 KB (300+ names). They are kept
 * out of ha_state_t (which stays compact) in a dedicated per-light cache. */
#define APP_HA_LIGHT_EFFECTS_MAX_LEN 8192
#define APP_HA_LIGHT_DISCOVERY_MAX_ITEMS 256
#define APP_HA_LIGHT_DISCOVERY_MAX_AREAS 96
#define APP_HA_LIGHT_DISCOVERY_MAX_DEVICES 256
#define APP_HA_DISCOVERY_ID_MAX_LEN 48
/* Must fit the longest supported domain: "alarm_control_panel" (19 chars + NUL). */
#define APP_HA_DISCOVERY_DOMAIN_MAX_LEN 24
#define APP_HA_DISCOVERY_SEARCH_MAX_LEN 64
/* Disable only the raw HA registry WS discovery by default; the light picker stays enabled via template pages. */
#define APP_HA_LIGHT_DISCOVERY_REGISTRY_ENABLED 0
/* Default discovery path: HA renders compact light pages server-side; the panel fetches them one by one. */
#define APP_HA_LIGHT_DISCOVERY_TEMPLATE_ENABLED 1
#if defined(CONFIG_APP_PANEL_VARIANT_S3_480)
#define APP_HA_LIGHT_DISCOVERY_PAGE_SIZE 16
#else
#define APP_HA_LIGHT_DISCOVERY_PAGE_SIZE 24
#endif

#if defined(CONFIG_APP_PANEL_VARIANT_S3_480)
#define APP_HA_QUEUE_LENGTH 48
#else
#define APP_HA_QUEUE_LENGTH 96
#endif
#define APP_HA_TASK_STACK 12288
#define APP_HA_TASK_PRIO 8
#if defined(CONFIG_APP_PANEL_VARIANT_S3_480)
#define APP_HA_COVER_TASK_STACK 20480
#else
#define APP_HA_COVER_TASK_STACK 8192
#endif
#define APP_HA_COVER_TASK_PRIO 3

/* Keep pre-language behavior for light commands (explicit no-fade). */
#define APP_HA_LIGHT_USE_TRANSITION_ZERO 1

/* Optional A/B: use light.toggle for panel power actions (with desired-state guard). */
#define APP_HA_LIGHT_POWER_USE_TOGGLE 0

/* Keep pre-language WS subscription path enabled. */
#define APP_HA_USE_WS_ENTITIES_SUBSCRIPTION 1

/* Route tracing for state flow: WS -> panel model -> UI (verbose, keep off by default). */
#define APP_HA_ROUTE_TRACE_LOG 0

#define APP_UI_TASK_STACK 24576
#define APP_UI_TASK_PRIO 4

#if defined(CONFIG_APP_PANEL_VARIANT_S3_480)
#define APP_LVGL_TASK_STACK 16384
#else
#define APP_LVGL_TASK_STACK 24576
#endif

#define APP_HTTP_PORT 80
#if defined(CONFIG_APP_PANEL_VARIANT_S3_480)
#define APP_HTTP_TASK_STACK 8192
#else
#define APP_HTTP_TASK_STACK 12288
#endif

#define APP_OTA_URL_MAX_LEN 512
#define APP_OTA_JSON_MAX_LEN 768
#define APP_OTA_CHUNK_SIZE 4096
#define APP_OTA_TASK_STACK 8192
#define APP_OTA_TASK_PRIO 5

#ifndef APP_HAVE_HOSTED_C6_FW_IMAGE
#define APP_HAVE_HOSTED_C6_FW_IMAGE 0
#endif

#ifdef CONFIG_APP_WIFI_SSID
#define APP_WIFI_SSID CONFIG_APP_WIFI_SSID
#else
#define APP_WIFI_SSID "YOUR_WIFI_SSID"
#endif

#ifdef CONFIG_APP_WIFI_PASSWORD
#define APP_WIFI_PASSWORD CONFIG_APP_WIFI_PASSWORD
#else
#define APP_WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#endif

#ifdef CONFIG_APP_WIFI_COUNTRY_CODE
#define APP_WIFI_COUNTRY_CODE CONFIG_APP_WIFI_COUNTRY_CODE
#else
#define APP_WIFI_COUNTRY_CODE "DE"
#endif

#ifdef CONFIG_APP_WIFI_WAIT_FOR_IP
#define APP_WIFI_WAIT_FOR_IP CONFIG_APP_WIFI_WAIT_FOR_IP
#else
#define APP_WIFI_WAIT_FOR_IP 1
#endif

#ifdef CONFIG_APP_WIFI_CONNECT_TIMEOUT_MS
#define APP_WIFI_CONNECT_TIMEOUT_MS CONFIG_APP_WIFI_CONNECT_TIMEOUT_MS
#else
#define APP_WIFI_CONNECT_TIMEOUT_MS 15000
#endif

#ifdef CONFIG_APP_WIFI_MAX_RETRIES
#define APP_WIFI_MAX_RETRIES CONFIG_APP_WIFI_MAX_RETRIES
#else
#define APP_WIFI_MAX_RETRIES 8
#endif

#ifdef CONFIG_APP_WIFI_DISABLE_POWER_SAVE
#define APP_WIFI_DISABLE_POWER_SAVE CONFIG_APP_WIFI_DISABLE_POWER_SAVE
#else
#define APP_WIFI_DISABLE_POWER_SAVE 1
#endif

#ifdef CONFIG_APP_HOSTED_AUTO_UPDATE_C6_FW
#define APP_HOSTED_AUTO_UPDATE_C6_FW CONFIG_APP_HOSTED_AUTO_UPDATE_C6_FW
#else
#define APP_HOSTED_AUTO_UPDATE_C6_FW 1
#endif

/* Expert override: allow bundled C6 FW version different from host ESP-Hosted stack version. */
#define APP_HOSTED_ALLOW_BUNDLED_C6_VERSION_MISMATCH 0

#ifdef CONFIG_APP_HA_WS_URL
#define APP_HA_WS_URL CONFIG_APP_HA_WS_URL
#else
#define APP_HA_WS_URL "YOUR_HA_WS_URL"
#endif

#ifdef CONFIG_APP_HA_ACCESS_TOKEN
#define APP_HA_ACCESS_TOKEN CONFIG_APP_HA_ACCESS_TOKEN
#else
#define APP_HA_ACCESS_TOKEN "YOUR_HA_ACCESS_TOKEN"
#endif

#ifdef CONFIG_APP_HA_FETCH_INITIAL_STATES
#define APP_HA_FETCH_INITIAL_STATES CONFIG_APP_HA_FETCH_INITIAL_STATES
#else
#define APP_HA_FETCH_INITIAL_STATES 1
#endif

#ifdef CONFIG_APP_HA_SUBSCRIBE_STATE_CHANGED
#define APP_HA_SUBSCRIBE_STATE_CHANGED CONFIG_APP_HA_SUBSCRIBE_STATE_CHANGED
#else
#define APP_HA_SUBSCRIBE_STATE_CHANGED 1
#endif

#ifdef CONFIG_APP_HA_PING_INTERVAL_MS
#define APP_HA_PING_INTERVAL_MS CONFIG_APP_HA_PING_INTERVAL_MS
#else
#define APP_HA_PING_INTERVAL_MS 8000
#endif

#ifdef CONFIG_APP_NTP_SERVER
#define APP_NTP_SERVER CONFIG_APP_NTP_SERVER
#else
#define APP_NTP_SERVER "pool.ntp.org"
#endif

#ifdef CONFIG_APP_TIME_TZ
#define APP_TIME_TZ CONFIG_APP_TIME_TZ
#else
#define APP_TIME_TZ "Europe/Berlin"
#endif
