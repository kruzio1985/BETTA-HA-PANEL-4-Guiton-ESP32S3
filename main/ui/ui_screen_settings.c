/* SPDX-License-Identifier: LicenseRef-FNCL-1.1
 * Copyright (c) 2026 Cpt_Kirk
 */
#include "ui/ui_screen_settings.h"

#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>

#include "lvgl.h"

#include "app_config.h"
#include "drivers/display_init.h"
#include "settings/runtime_settings.h"
#include "ui/fonts/app_text_fonts.h"
#include "ui/ui_i18n.h"
#include "ui/ui_screen_saver.h"
#include "ui/ui_slider_touch.h"

#define SETTINGS_BG lv_color_hex(0x1B1E23)
#define SETTINGS_ROW_BG lv_color_hex(0x24282F)
#define SETTINGS_ACCENT lv_color_hex(0x2F6FED)
#define SETTINGS_TEXT lv_color_hex(0xE6E8EC)
#define SETTINGS_TEXT_DIM lv_color_hex(0x8A929C)

#if LV_FONT_MONTSERRAT_20
#define SETTINGS_ICON_FONT (&lv_font_montserrat_20)
#else
#define SETTINGS_ICON_FONT LV_FONT_DEFAULT
#endif

static void ui_screen_settings_close_cb(lv_event_t *e);

static const uint32_t SCREENSAVER_TIMEOUTS[] = {15, 30, 60, 120, 300};
static const uint32_t SCREEN_OFF_TIMEOUTS[] = {30, 60, 120, 300, 600};

#define SETTINGS_PAGE_PAD 8
#define SETTINGS_ROW_PAD_X 14
#define SETTINGS_ROW_PAD_Y 8
#define SETTINGS_GAP 8
#define SETTINGS_CARD_GAP 4
#define SETTINGS_TITLE_FONT APP_FONT_TEXT_22 /* Existing 20px Poppins + CJK fallback. */
#define SETTINGS_DESCRIPTION_FONT APP_FONT_TEXT_16
#define SETTINGS_VALUE_FONT APP_FONT_TEXT_18
#define SETTINGS_ICON_WIDTH 28

static runtime_settings_t s_cfg;
static lv_obj_t *s_page = NULL;
static lv_obj_t *s_brightness_value = NULL;
static lv_obj_t *s_saver_brightness_value = NULL;
static lv_obj_t *s_saver_timeout_label = NULL;
static lv_obj_t *s_off_timeout_label = NULL;

static void ui_screen_settings_format_timeout(uint32_t seconds, char *buf, size_t len)
{
    if (seconds % 60 == 0) {
        snprintf(buf, len, "%u min", (unsigned)(seconds / 60));
    } else {
        snprintf(buf, len, "%u s", (unsigned)seconds);
    }
}

static void ui_screen_settings_style_chip(lv_obj_t *obj)
{
    lv_obj_remove_style_all(obj);
    lv_obj_set_style_bg_color(obj, SETTINGS_ROW_BG, LV_PART_MAIN);
    lv_obj_set_style_bg_opa(obj, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_set_style_radius(obj, 8, LV_PART_MAIN);
    lv_obj_set_style_pad_left(obj, 8, LV_PART_MAIN);
    lv_obj_set_style_pad_right(obj, 8, LV_PART_MAIN);
    lv_obj_set_style_pad_top(obj, 6, LV_PART_MAIN);
    lv_obj_set_style_pad_bottom(obj, 6, LV_PART_MAIN);
    lv_obj_set_style_text_color(obj, SETTINGS_TEXT, LV_PART_MAIN);
    lv_obj_set_style_text_font(obj, APP_FONT_TEXT_22, LV_PART_MAIN);
    lv_obj_set_style_border_width(obj, 0, LV_PART_MAIN);
    lv_obj_set_style_bg_color(obj, SETTINGS_ACCENT, LV_PART_MAIN | LV_STATE_PRESSED);
    lv_obj_set_style_text_color(obj, lv_color_hex(0xFFFFFF), LV_PART_MAIN | LV_STATE_PRESSED);
    lv_obj_set_clickable(obj, true);
    lv_obj_set_ext_click_area(obj, 8);
}

static void ui_screen_settings_update_timeout_labels(void)
{
    char buf[24] = {0};

    if (s_saver_timeout_label != NULL) {
        ui_screen_settings_format_timeout(s_cfg.display_screensaver_timeout_sec, buf, sizeof(buf));
        lv_label_set_text(s_saver_timeout_label, buf);
    }

    if (s_off_timeout_label != NULL) {
        ui_screen_settings_format_timeout(s_cfg.display_screen_off_timeout_sec, buf, sizeof(buf));
        lv_label_set_text(s_off_timeout_label, buf);
    }
}

static void ui_screen_settings_apply(void)
{
    /* ui_screen_saver_* owns the backlight: it re-applies the menu level while
     * the panel is awake and the dimmed level while the clock is on screen, so
     * the settings page must not force a value on top of that. */
    ui_screen_saver_apply_settings(&s_cfg);
}

static uint32_t ui_screen_settings_next_timeout(const uint32_t *values, size_t count, uint32_t current)
{
    for (size_t i = 0; i < count; i++) {
        if (values[i] == current) {
            return values[(i + 1) % count];
        }
    }
    return values[0];
}

static void ui_screen_settings_brightness_cb(lv_event_t *e)
{
    lv_obj_t *slider = lv_event_get_target_obj(e);
    uint8_t value = (uint8_t)lv_slider_get_value(slider);

    s_cfg.display_brightness = value;
    char buf[8] = {0};
    snprintf(buf, sizeof(buf), "%u%%", (unsigned)value);
    lv_label_set_text(s_brightness_value, buf);
    ui_screen_settings_apply();
}

static void ui_screen_settings_saver_brightness_cb(lv_event_t *e)
{
    lv_obj_t *slider = lv_event_get_target_obj(e);
    uint8_t value = (uint8_t)lv_slider_get_value(slider);

    s_cfg.display_saver_brightness = value;
    char buf[8] = {0};
    snprintf(buf, sizeof(buf), "%u%%", (unsigned)value);
    if (s_saver_brightness_value != NULL) {
        lv_label_set_text(s_saver_brightness_value, buf);
    }

    ui_screen_settings_apply();

    /* Dim the panel live while dragging so the level can be judged without
     * waiting for the screensaver. Released restores the menu level. */
    (void)display_set_brightness_percent((int)s_cfg.display_saver_brightness);
}

static void ui_screen_settings_saver_brightness_released_cb(lv_event_t *e)
{
    (void)e;
    ui_screen_settings_apply();
}

static void ui_screen_settings_saver_toggle_cb(lv_event_t *e)
{
    lv_obj_t *sw = lv_event_get_target_obj(e);
    s_cfg.display_screensaver_enabled = lv_obj_has_state(sw, LV_STATE_CHECKED);
    ui_screen_settings_apply();
}

static void ui_screen_settings_saver_timeout_cb(lv_event_t *e)
{
    (void)e;
    s_cfg.display_screensaver_timeout_sec = ui_screen_settings_next_timeout(
        SCREENSAVER_TIMEOUTS,
        sizeof(SCREENSAVER_TIMEOUTS) / sizeof(SCREENSAVER_TIMEOUTS[0]),
        s_cfg.display_screensaver_timeout_sec);
    ui_screen_settings_update_timeout_labels();
    ui_screen_settings_apply();
}

static void ui_screen_settings_off_toggle_cb(lv_event_t *e)
{
    lv_obj_t *sw = lv_event_get_target_obj(e);
    s_cfg.display_screen_off_enabled = lv_obj_has_state(sw, LV_STATE_CHECKED);
    ui_screen_settings_apply();
}

static void ui_screen_settings_off_timeout_cb(lv_event_t *e)
{
    (void)e;
    s_cfg.display_screen_off_timeout_sec = ui_screen_settings_next_timeout(
        SCREEN_OFF_TIMEOUTS,
        sizeof(SCREEN_OFF_TIMEOUTS) / sizeof(SCREEN_OFF_TIMEOUTS[0]),
        s_cfg.display_screen_off_timeout_sec);
    ui_screen_settings_update_timeout_labels();
    ui_screen_settings_apply();
}

static void ui_screen_settings_clock_24h_cb(lv_event_t *e)
{
    lv_obj_t *sw = lv_event_get_target_obj(e);
    s_cfg.display_clock_24h = lv_obj_has_state(sw, LV_STATE_CHECKED);
    ui_screen_settings_apply();
}

static void ui_screen_settings_seconds_cb(lv_event_t *e)
{
    lv_obj_t *sw = lv_event_get_target_obj(e);
    s_cfg.display_saver_show_seconds = lv_obj_has_state(sw, LV_STATE_CHECKED);
    ui_screen_settings_apply();
}

static void ui_screen_settings_date_cb(lv_event_t *e)
{
    lv_obj_t *sw = lv_event_get_target_obj(e);
    s_cfg.display_saver_show_date = lv_obj_has_state(sw, LV_STATE_CHECKED);
    ui_screen_settings_apply();
}

/* Layout containers are transparent and never own scrolling. Only the content
 * viewport created in open() scrolls; flex measures wrapped labels for us. */
static lv_obj_t *ui_screen_settings_make_container(lv_obj_t *parent, lv_flex_flow_t flow)
{
    lv_obj_t *obj = lv_obj_create(parent);
    lv_obj_remove_style_all(obj);
    lv_obj_set_size(obj, lv_pct(100), LV_SIZE_CONTENT);
    lv_obj_set_scrollable(obj, false);
    lv_obj_set_flex_flow(obj, flow);
    lv_obj_set_style_pad_gap(obj, SETTINGS_GAP, LV_PART_MAIN);
    return obj;
}

static lv_obj_t *ui_screen_settings_make_label(lv_obj_t *parent, const char *text,
                                               const lv_font_t *font, lv_color_t color)
{
    lv_obj_t *label = lv_label_create(parent);
    lv_label_set_text(label, text);
    lv_obj_set_style_text_font(label, font, LV_PART_MAIN);
    lv_obj_set_style_text_color(label, color, LV_PART_MAIN);
    return label;
}

static void ui_screen_settings_make_text(lv_obj_t *parent, const char *title,
                                         const char *description, const lv_font_t *title_font)
{
    lv_obj_t *text = ui_screen_settings_make_container(parent, LV_FLEX_FLOW_COLUMN);
    /* A zero basis lets flex reserve the controls' actual width before wrapping
     * text, including longer translations and three-digit percentages. */
    lv_obj_set_width(text, 0);
    lv_obj_set_flex_grow(text, 1);
    lv_obj_set_style_pad_gap(text, 3, LV_PART_MAIN);
    lv_obj_t *label = ui_screen_settings_make_label(text, title, title_font, SETTINGS_TEXT);
    lv_obj_set_width(label, lv_pct(100));
    lv_label_set_long_mode(label, LV_LABEL_LONG_WRAP);
    if (description != NULL) {
        label = ui_screen_settings_make_label(text, description, SETTINGS_DESCRIPTION_FONT, SETTINGS_TEXT_DIM);
        lv_obj_set_width(label, lv_pct(100));
        lv_label_set_long_mode(label, LV_LABEL_LONG_WRAP);
    }
}

/* Return the shared heading so each row builder can append its own controls. */
static lv_obj_t *ui_screen_settings_make_row(lv_obj_t *parent, const char *icon,
                                            const char *title, const char *description,
                                            lv_obj_t **heading_out)
{
    lv_obj_t *row = ui_screen_settings_make_container(parent, LV_FLEX_FLOW_COLUMN);
    lv_obj_set_style_bg_color(row, SETTINGS_ROW_BG, LV_PART_MAIN);
    lv_obj_set_style_bg_opa(row, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_set_style_radius(row, 12, LV_PART_MAIN);
    lv_obj_set_style_pad_hor(row, SETTINGS_ROW_PAD_X, LV_PART_MAIN);
    lv_obj_set_style_pad_ver(row, SETTINGS_ROW_PAD_Y, LV_PART_MAIN);
    lv_obj_set_style_pad_gap(row, 2, LV_PART_MAIN);
    lv_obj_set_snappable(row, false);

    /* Anchor the icon to the whole card, including a slider/timeout line.
     * Reserve its original column in the heading so text does not move. */
    lv_obj_t *symbol = ui_screen_settings_make_label(row, icon, SETTINGS_ICON_FONT, SETTINGS_TEXT_DIM);
    lv_obj_set_ignore_layout(symbol, true);
    lv_obj_set_width(symbol, SETTINGS_ICON_WIDTH);
    lv_obj_set_style_text_align(symbol, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN);
    lv_obj_align(symbol, LV_ALIGN_LEFT_MID, 0, 0);

    lv_obj_t *heading = ui_screen_settings_make_container(row, LV_FLEX_FLOW_ROW);
    lv_obj_set_style_pad_left(heading, SETTINGS_ICON_WIDTH + SETTINGS_GAP, LV_PART_MAIN);
    ui_screen_settings_make_text(heading, title, description, SETTINGS_TITLE_FONT);
    *heading_out = heading;
    return row;
}

static lv_obj_t *ui_screen_settings_make_switch(lv_obj_t *parent, bool checked, lv_event_cb_t cb)
{
    lv_obj_t *sw = lv_switch_create(parent);
    /* Touch focus must not move the viewport beneath the user's finger. */
    lv_obj_set_scroll_on_focus(sw, false);
    lv_obj_set_size(sw, 52, 30);
    /* The surrounding row padding keeps the larger touch target inside it. */
    lv_obj_set_ext_click_area(sw, 7);
    if (checked) {
        lv_obj_add_state(sw, LV_STATE_CHECKED);
    }
    lv_obj_add_event_cb(sw, cb, LV_EVENT_VALUE_CHANGED, NULL);
    return sw;
}

static lv_obj_t *ui_screen_settings_make_brightness_row(lv_obj_t *parent, const char *icon,
                                                       const char *title, const char *description,
                                                       uint8_t value, lv_event_cb_t changed_cb,
                                                       lv_event_cb_t released_cb, lv_obj_t **value_out)
{
    lv_obj_t *heading;
    lv_obj_t *row = ui_screen_settings_make_row(parent, icon, title, description, &heading);
    char buf[8];
    snprintf(buf, sizeof(buf), "%u%%", (unsigned)value);
    *value_out = ui_screen_settings_make_label(heading, buf, SETTINGS_VALUE_FONT, SETTINGS_TEXT_DIM);
    /* Reserve the widest value so dragging never reflows the description. */
    lv_point_t value_size;
    lv_text_get_size(&value_size, "100%", SETTINGS_VALUE_FONT, 0, 0, LV_COORD_MAX, LV_TEXT_FLAG_NONE);
    lv_obj_set_width(*value_out, value_size.x);
    lv_obj_set_style_text_align(*value_out, LV_TEXT_ALIGN_RIGHT, LV_PART_MAIN);

    /* Always a separate line, with space for knob overhang and touch padding. */
    lv_obj_t *track = ui_screen_settings_make_container(row, LV_FLEX_FLOW_ROW);
    lv_obj_set_height(track, 44);
    lv_obj_set_style_pad_left(track, SETTINGS_ICON_WIDTH + SETTINGS_GAP, LV_PART_MAIN);
    /* Reserve the knob radius at the trailing edge so the track container
     * does not clip it at 100%; the knob edge follows the controls' grid. */
    lv_obj_set_style_pad_right(track, 12, LV_PART_MAIN);
    lv_obj_set_flex_align(track, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_t *slider = lv_slider_create(track);
    lv_obj_set_scroll_on_focus(slider, false);
    lv_obj_set_size(slider, lv_pct(100), 10);
    lv_obj_set_style_pad_all(slider, 7, LV_PART_KNOB); /* 24px knob. */
    lv_slider_set_range(slider, 1, 100);
    lv_slider_set_value(slider, value, LV_ANIM_OFF);
    lv_obj_add_event_cb(slider, changed_cb, LV_EVENT_VALUE_CHANGED, NULL);
    if (released_cb != NULL) {
        lv_obj_add_event_cb(slider, released_cb, LV_EVENT_RELEASED, NULL);
    }
    /* A 10px track needs 17px per side for a 44px touch band. */
    ui_slider_touch_enable_padded(slider, 8, 17);
    return slider;
}

static lv_obj_t *ui_screen_settings_make_timeout_row(lv_obj_t *parent, const char *icon,
                                                    const char *title, const char *description,
                                                    bool enabled, uint32_t timeout,
                                                    lv_event_cb_t enabled_cb, lv_event_cb_t timeout_cb,
                                                    lv_obj_t **timeout_out)
{
    lv_obj_t *heading;
    lv_obj_t *row = ui_screen_settings_make_row(parent, icon, title, NULL, &heading);
    lv_obj_set_style_pad_gap(row, 10, LV_PART_MAIN);
    lv_obj_set_style_min_height(row, 100, LV_PART_MAIN);
    lv_obj_t *sw = ui_screen_settings_make_switch(heading, enabled, enabled_cb);

    /* Row 1 pairs the title with its switch; row 2 pairs the description with
     * its timeout. Both controls share the card's trailing edge. */
    lv_obj_t *details = ui_screen_settings_make_container(row, LV_FLEX_FLOW_ROW);
    lv_obj_set_style_pad_left(details, SETTINGS_ICON_WIDTH + SETTINGS_GAP, LV_PART_MAIN);
    lv_obj_set_flex_align(details, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_t *label = ui_screen_settings_make_label(details, description,
                                                   SETTINGS_DESCRIPTION_FONT, SETTINGS_TEXT_DIM);
    lv_obj_set_width(label, 0);
    lv_obj_set_flex_grow(label, 1);
    lv_label_set_long_mode(label, LV_LABEL_LONG_WRAP);

    char buf[24];
    ui_screen_settings_format_timeout(timeout, buf, sizeof(buf));
    *timeout_out = lv_label_create(details);
    ui_screen_settings_style_chip(*timeout_out);
    lv_label_set_text(*timeout_out, buf);
    lv_obj_set_style_text_font(*timeout_out, SETTINGS_DESCRIPTION_FONT, LV_PART_MAIN);
    lv_obj_set_style_pad_hor(*timeout_out, 8, LV_PART_MAIN);
    lv_obj_set_style_pad_ver(*timeout_out, 8, LV_PART_MAIN);
    lv_obj_set_style_min_width(*timeout_out, 62, LV_PART_MAIN);
    lv_obj_set_style_min_height(*timeout_out, 40, LV_PART_MAIN);
    lv_obj_set_style_text_align(*timeout_out, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN);
    /* 40px visual + 2px each side = 44px touch height. The 10px row gap
     * separates it from the switch's 7px extended hit area. */
    lv_obj_set_ext_click_area(*timeout_out, 2);
    lv_obj_set_style_border_width(*timeout_out, 1, LV_PART_MAIN);
    lv_obj_set_style_border_color(*timeout_out, SETTINGS_TEXT_DIM, LV_PART_MAIN);
    lv_obj_set_style_border_opa(*timeout_out, LV_OPA_30, LV_PART_MAIN);
    lv_obj_add_event_cb(*timeout_out, timeout_cb, LV_EVENT_CLICKED, NULL);
    return sw;
}

static lv_obj_t *ui_screen_settings_make_toggle_row(lv_obj_t *parent, const char *icon,
                                                   const char *title, const char *description,
                                                   bool checked, lv_event_cb_t cb)
{
    lv_obj_t *heading;
    lv_obj_t *row = ui_screen_settings_make_row(parent, icon, title, description, &heading);
    lv_obj_set_style_min_height(row, 72, LV_PART_MAIN);
    /* Only simple toggles are centered against the entire card. Timeout
     * switches remain on their title line, above the timeout control. */
    lv_obj_t *sw = ui_screen_settings_make_switch(row, checked, cb);
    lv_obj_set_ignore_layout(sw, true);
    lv_obj_align(sw, LV_ALIGN_RIGHT_MID, 0, 0);
    lv_obj_set_style_pad_right(heading, 52 + SETTINGS_GAP, LV_PART_MAIN);
    return sw;
}

static void ui_screen_settings_close_cb(lv_event_t *e)
{
    (void)e;

    if (runtime_settings_save(&s_cfg) != ESP_OK) {
        /* Keep going: the panel keeps the in-memory values either way. */
    }

    if (s_page != NULL) {
        lv_obj_del(s_page);
    }
    ui_screen_settings_handle_screen_clean();
}

void ui_screen_settings_handle_screen_clean(void)
{
    /* The active screen owns all layout containers and controls. */
    s_page = NULL;
    s_brightness_value = NULL;
    s_saver_brightness_value = NULL;
    s_saver_timeout_label = NULL;
    s_off_timeout_label = NULL;
}

static void ui_screen_settings_deleted_cb(lv_event_t *e)
{
    (void)e;
    ui_screen_settings_handle_screen_clean();
}

static void ui_screen_settings_make_header(lv_obj_t *parent)
{
    lv_obj_t *header = ui_screen_settings_make_container(parent, LV_FLEX_FLOW_ROW);
    lv_obj_set_style_pad_hor(header, 12, LV_PART_MAIN);
    lv_obj_set_style_pad_top(header, 8, LV_PART_MAIN);
    lv_obj_set_style_pad_bottom(header, 6, LV_PART_MAIN);
    lv_obj_set_style_min_height(header, 82, LV_PART_MAIN);
    lv_obj_set_flex_align(header, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);

    /* A small display outline uses the existing accent without new assets. */
    lv_obj_t *icon = ui_screen_settings_make_container(header, LV_FLEX_FLOW_COLUMN);
    lv_obj_set_size(icon, 24, 24);
    lv_obj_set_layout(icon, LV_LAYOUT_NONE);
    lv_obj_t *monitor = lv_obj_create(icon);
    lv_obj_remove_style_all(monitor);
    lv_obj_set_scrollable(monitor, false);
    lv_obj_set_size(monitor, 24, 17);
    lv_obj_set_style_border_width(monitor, 2, LV_PART_MAIN);
    lv_obj_set_style_border_color(monitor, SETTINGS_ACCENT, LV_PART_MAIN);
    lv_obj_set_style_radius(monitor, 4, LV_PART_MAIN);
    lv_obj_t *stand = lv_obj_create(icon);
    lv_obj_remove_style_all(stand);
    lv_obj_set_scrollable(stand, false);
    lv_obj_set_size(stand, 4, 5);
    lv_obj_set_pos(stand, 10, 17);
    lv_obj_set_style_bg_color(stand, SETTINGS_ACCENT, LV_PART_MAIN);
    lv_obj_set_style_bg_opa(stand, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_t *base = lv_obj_create(icon);
    lv_obj_remove_style_all(base);
    lv_obj_set_scrollable(base, false);
    lv_obj_set_size(base, 14, 2);
    lv_obj_set_pos(base, 5, 22);
    lv_obj_set_style_bg_color(base, SETTINGS_ACCENT, LV_PART_MAIN);
    lv_obj_set_style_bg_opa(base, LV_OPA_COVER, LV_PART_MAIN);

    ui_screen_settings_make_text(header,
        ui_i18n_get("screen.title", "Screen settings"),
        ui_i18n_get("screen.description", "Adjust display and power settings"), APP_FONT_DISPLAY_24);
    lv_obj_t *close_btn = lv_obj_create(header);
    ui_screen_settings_style_chip(close_btn);
    lv_obj_set_scrollable(close_btn, false);
    lv_obj_set_size(close_btn, 44, 44);
    lv_obj_set_style_pad_all(close_btn, 0, LV_PART_MAIN);
    lv_obj_set_style_radius(close_btn, LV_RADIUS_CIRCLE, LV_PART_MAIN);
    lv_obj_t *close_icon = lv_label_create(close_btn);
    lv_label_set_text(close_icon, LV_SYMBOL_CLOSE);
    lv_obj_set_style_text_font(close_icon, SETTINGS_ICON_FONT, LV_PART_MAIN);
    lv_obj_center(close_icon);
    lv_obj_add_event_cb(close_btn, ui_screen_settings_close_cb, LV_EVENT_CLICKED, NULL);
}

void ui_screen_settings_open(void)
{
    runtime_settings_set_defaults(&s_cfg);
    if (runtime_settings_load(&s_cfg) != ESP_OK) {
        runtime_settings_set_defaults(&s_cfg);
    }

    lv_obj_t *screen = lv_scr_act();
    if (screen == NULL) {
        return;
    }

    if (s_page != NULL) {
        lv_obj_del(s_page);
    }
    ui_screen_settings_handle_screen_clean();

    s_page = ui_screen_settings_make_container(screen, LV_FLEX_FLOW_COLUMN);
    lv_obj_set_size(s_page, APP_SCREEN_WIDTH, APP_SCREEN_HEIGHT);
    lv_obj_set_pos(s_page, 0, 0);
    lv_obj_set_style_bg_color(s_page, SETTINGS_BG, LV_PART_MAIN);
    lv_obj_set_style_bg_opa(s_page, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_set_style_pad_gap(s_page, 0, LV_PART_MAIN);
    lv_obj_add_event_cb(s_page, ui_screen_settings_deleted_cb, LV_EVENT_DELETE, NULL);
    ui_screen_settings_make_header(s_page);

    /* Flex assigns the remaining height after the wrapped header is measured.
     * The root/header stay fixed; only this sibling viewport can scroll. */
    lv_obj_t *content = ui_screen_settings_make_container(s_page, LV_FLEX_FLOW_COLUMN);
    lv_obj_set_height(content, 0);
    lv_obj_set_flex_grow(content, 1);
    lv_obj_set_style_pad_hor(content, SETTINGS_PAGE_PAD, LV_PART_MAIN);
    lv_obj_set_style_pad_top(content, 8, LV_PART_MAIN);
    lv_obj_set_style_pad_bottom(content, SETTINGS_PAGE_PAD, LV_PART_MAIN);
    lv_obj_set_style_pad_gap(content, SETTINGS_CARD_GAP, LV_PART_MAIN);
    lv_obj_set_scrollable(content, true);
    lv_obj_set_scroll_dir(content, LV_DIR_VER);
    /* Snapping also affects LVGL's recursive scroll-to-view on control focus:
     * it pulls an already-visible card to the top when its control is touched.
     * Keep free vertical scrolling and never reposition cards on focus/release. */
    lv_obj_set_scroll_snap_y(content, LV_SCROLL_SNAP_NONE);
    lv_obj_set_scrollbar_mode(content, LV_SCROLLBAR_MODE_AUTO);
    lv_obj_set_scroll_elastic(content, false);
    lv_obj_set_scroll_chain(content, false);
    lv_obj_set_style_bg_color(content, SETTINGS_TEXT_DIM, LV_PART_SCROLLBAR);
    lv_obj_set_style_bg_opa(content, LV_OPA_50, LV_PART_SCROLLBAR);
    lv_obj_set_style_width(content, 3, LV_PART_SCROLLBAR);
    lv_obj_set_style_radius(content, LV_RADIUS_CIRCLE, LV_PART_SCROLLBAR);

    (void)ui_screen_settings_make_brightness_row(content, LV_SYMBOL_EYE_OPEN,
        ui_i18n_get("screen.brightness", "Brightness"),
        ui_i18n_get("screen.brightness_description", "Adjust screen brightness"),
        s_cfg.display_brightness, ui_screen_settings_brightness_cb, NULL, &s_brightness_value);

    (void)ui_screen_settings_make_timeout_row(content, LV_SYMBOL_IMAGE,
        ui_i18n_get("screen.screensaver", "Screensaver"),
        ui_i18n_get("screen.screensaver_description", "Turn on screensaver after"),
        s_cfg.display_screensaver_enabled, s_cfg.display_screensaver_timeout_sec,
        ui_screen_settings_saver_toggle_cb, ui_screen_settings_saver_timeout_cb, &s_saver_timeout_label);

    (void)ui_screen_settings_make_brightness_row(content, LV_SYMBOL_REFRESH,
        ui_i18n_get("screen.saver_brightness", "Clock brightness"),
        ui_i18n_get("screen.saver_brightness_description", "Adjust clock display brightness"),
        s_cfg.display_saver_brightness, ui_screen_settings_saver_brightness_cb,
        ui_screen_settings_saver_brightness_released_cb, &s_saver_brightness_value);

    (void)ui_screen_settings_make_timeout_row(content, LV_SYMBOL_POWER,
        ui_i18n_get("screen.screen_off", "Screen off"),
        ui_i18n_get("screen.screen_off_description", "Turn off screen after"),
        s_cfg.display_screen_off_enabled, s_cfg.display_screen_off_timeout_sec,
        ui_screen_settings_off_toggle_cb, ui_screen_settings_off_timeout_cb, &s_off_timeout_label);

    (void)ui_screen_settings_make_toggle_row(content, LV_SYMBOL_LOOP,
        ui_i18n_get("screen.clock_24h", "24h clock"),
        ui_i18n_get("screen.clock_24h_description", "Use 24-hour time format"),
        s_cfg.display_clock_24h, ui_screen_settings_clock_24h_cb);
    (void)ui_screen_settings_make_toggle_row(content, LV_SYMBOL_REFRESH,
        ui_i18n_get("screen.show_seconds", "Seconds"),
        ui_i18n_get("screen.show_seconds_description", "Show seconds in clock"),
        s_cfg.display_saver_show_seconds, ui_screen_settings_seconds_cb);
    (void)ui_screen_settings_make_toggle_row(content, LV_SYMBOL_LIST,
        ui_i18n_get("screen.show_date", "Date"),
        ui_i18n_get("screen.show_date_description", "Show date on screen"),
        s_cfg.display_saver_show_date, ui_screen_settings_date_cb);

    lv_obj_update_layout(s_page);
    lv_obj_move_foreground(s_page);
}
