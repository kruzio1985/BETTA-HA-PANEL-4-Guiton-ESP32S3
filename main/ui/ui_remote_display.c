/* SPDX-License-Identifier: LicenseRef-FNCL-1.1 */
#include "ui/ui_remote_display.h"
#if CONFIG_APP_REMOTE_DISPLAY
#include <string.h>
#include "drivers/display_init.h"
#include "esp_heap_caps.h"
#include "esp_timer.h"
#include "lvgl.h"

#define INPUT_COUNT 24
#define LEASE_US 1000000LL
#define FRAME_US 200000LL
typedef struct { unsigned kind; int16_t x, y; } input_t;
static lv_display_t *s_display;
static lv_display_flush_cb_t s_flush;
static lv_indev_t *s_remote;
static uint8_t *s_pixels;
static uint16_t s_width, s_height;
static bool s_open, s_ready, s_want, s_dirty, s_control, s_down, s_queued_down, s_suspended;
static int64_t s_heartbeat, s_last_capture;
static lv_point_t s_point;
static input_t s_inputs[INPUT_COUNT];
static unsigned s_head, s_count;
static bool s_cancel_reset;

/* All module state is accessed from the LVGL task or under display_lock. */
static void cancel_input(void)
{
    s_count = s_head = 0;
    s_down = s_queued_down = false;
    if (s_remote) {
        s_cancel_reset = true;
        lv_indev_reset(s_remote, NULL); /* Cancel, never synthesize RELEASED/CLICKED. */
        s_cancel_reset = false;
    }
}

static bool physical_pressed(void)
{
    for (lv_indev_t *i = lv_indev_get_next(NULL); i; i = lv_indev_get_next(i)) {
        if (i != s_remote && lv_indev_get_type(i) == LV_INDEV_TYPE_POINTER &&
            lv_indev_get_display(i) == s_display && lv_indev_get_state(i) == LV_INDEV_STATE_PRESSED) return true;
    }
    return false;
}

static void physical_event(lv_event_t *event)
{
    (void)event;
    cancel_input();
}

static void remote_read(lv_indev_t *indev, lv_indev_data_t *data)
{
    (void)indev;
    if ((s_control && esp_timer_get_time() - s_heartbeat > LEASE_US) || physical_pressed()) {
        cancel_input();
        if (esp_timer_get_time() - s_heartbeat > LEASE_US) s_control = false;
    }
    if (s_control && s_count) {
        input_t p = s_inputs[s_head];
        s_head = (s_head + 1) % INPUT_COUNT;
        --s_count;
        s_point = (lv_point_t){p.x, p.y};
        s_down = p.kind != 2;
    }
    data->point = s_point;
    data->state = s_down ? LV_INDEV_STATE_PRESSED : LV_INDEV_STATE_RELEASED;
    data->continue_reading = s_count > 0;
}

static void remote_activity(lv_event_t *event)
{
    if (lv_event_get_code(event) == LV_EVENT_PRESSED) display_note_activity();
    else if (lv_event_get_code(event) == LV_EVENT_INDEV_RESET && s_cancel_reset) {
        /* LVGL reset clears pressed styling, but custom sliders also need PRESS_LOST
         * to clear their dragging flag. The reset event supplies the old active object.
         * Do not send RELEASED: that would commit a canceled slider value to HA. */
        lv_obj_t *obj = lv_event_get_param(event);
        if (obj && lv_obj_is_valid(obj)) lv_obj_send_event(obj, LV_EVENT_PRESS_LOST, s_remote);
    }
}

static void mirror_flush(lv_display_t *display, const lv_area_t *area, uint8_t *pixels)
{
    bool copied = false;
    s_dirty = true;
    if (s_open && !s_ready && !s_suspended &&
        esp_timer_get_time() - s_last_capture >= FRAME_US &&
        lv_display_get_render_mode(display) == LV_DISPLAY_RENDER_MODE_FULL &&
        lv_display_get_rotation(display) == LV_DISPLAY_ROTATION_0 &&
        area->x1 == 0 && area->y1 == 0 && area->x2 == s_width - 1 && area->y2 == s_height - 1) {
        lv_draw_buf_t *buf = lv_display_get_buf_active(display);
        if (buf && buf->header.stride >= s_width * 2U) {
            for (unsigned y = 0; y < s_height; ++y)
                memcpy(s_pixels + y * s_width * 2U, pixels + y * buf->header.stride, s_width * 2U);
            copied = true;
        }
    }
    /* esp_lvgl_port remains the only owner of submission, VSYNC wait and flush-ready. */
    s_flush(display, area, pixels);
    if (copied) {
        s_ready = true;
        s_want = s_dirty = false;
        s_last_capture = esp_timer_get_time();
    }
}

esp_err_t ui_remote_display_init(void)
{
    if (!display_lock(1000)) return ESP_ERR_TIMEOUT;
    if (s_display) { display_unlock(); return ESP_OK; }
    lv_display_t *d = lv_display_get_default();
    if (!d || lv_display_get_color_format(d) != LV_COLOR_FORMAT_RGB565 ||
        lv_display_get_render_mode(d) != LV_DISPLAY_RENDER_MODE_FULL ||
        lv_display_get_rotation(d) != LV_DISPLAY_ROTATION_0 ||
        lv_display_get_horizontal_resolution(d) != 480 || lv_display_get_vertical_resolution(d) != 480) {
        display_unlock(); return ESP_ERR_NOT_SUPPORTED;
    }
    s_flush = lv_display_get_flush_cb(d);
    if (!s_flush) { display_unlock(); return ESP_ERR_INVALID_STATE; }
    s_remote = lv_indev_create();
    if (!s_remote) { display_unlock(); return ESP_ERR_NO_MEM; }
    s_display = d;
    s_width = lv_display_get_horizontal_resolution(d);
    s_height = lv_display_get_vertical_resolution(d);
    lv_indev_set_type(s_remote, LV_INDEV_TYPE_POINTER);
    lv_indev_set_display(s_remote, d);
    lv_indev_set_read_cb(s_remote, remote_read);
    lv_indev_add_event_cb(s_remote, remote_activity, LV_EVENT_ALL, NULL);
    lv_timer_set_period(lv_indev_get_read_timer(s_remote), 10);
    lv_indev_enable(s_remote, false);
    lv_timer_pause(lv_indev_get_read_timer(s_remote));
    for (lv_indev_t *i = lv_indev_get_next(NULL); i; i = lv_indev_get_next(i)) {
        if (i != s_remote && lv_indev_get_type(i) == LV_INDEV_TYPE_POINTER)
            lv_indev_add_event_cb(i, physical_event, LV_EVENT_PRESSED, NULL);
    }
    lv_display_set_flush_cb(d, mirror_flush);
    display_unlock();
    return ESP_OK;
}

esp_err_t ui_remote_display_open(void)
{
    if (!display_lock(1000)) return ESP_ERR_TIMEOUT;
    esp_err_t err = ESP_ERR_INVALID_STATE;
    if (s_display && !s_open && !s_suspended) {
        size_t bytes = (size_t)s_width * s_height * 2;
        /* Leave reserve for the UI, wallpaper and networking; no internal-RAM fallback. */
        if (heap_caps_get_free_size(MALLOC_CAP_SPIRAM) > bytes + 512 * 1024U)
            s_pixels = heap_caps_malloc(bytes, MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT);
        err = s_pixels ? ESP_OK : ESP_ERR_NO_MEM;
        if (s_pixels) {
            lv_indev_enable(s_remote, true);
            lv_timer_resume(lv_indev_get_read_timer(s_remote));
            s_open = s_dirty = true;
            s_ready = s_want = s_control = false;
            s_last_capture = 0;
        }
    }
    display_unlock();
    return err;
}

void ui_remote_display_close(void)
{
    if (!display_lock(0)) return; /* Port timeout 0 means wait indefinitely. */
    s_open = s_ready = s_want = s_control = false;
    cancel_input();
    if (s_remote) {
        lv_indev_enable(s_remote, false);
        lv_timer_pause(lv_indev_get_read_timer(s_remote));
    }
    heap_caps_free(s_pixels);
    s_pixels = NULL;
    display_unlock();
}

bool ui_remote_display_capture(const uint8_t **pixels, uint16_t *width, uint16_t *height, unsigned *retry_ms)
{
    *retry_ms = 200;
    if (!display_lock(100)) return false;
    bool ready = s_open && s_ready && !s_suspended;
    if (ready) { *pixels = s_pixels; *width = s_width; *height = s_height; }
    else if (s_open && !s_suspended && s_dirty && !s_want &&
             esp_timer_get_time() - s_last_capture >= FRAME_US) {
        s_want = true;
        /* Capture the latest idle UI too, after changes skipped during an in-flight frame. */
        lv_obj_invalidate(lv_display_get_screen_active(s_display));
        lv_obj_invalidate(lv_display_get_layer_top(s_display));
        lv_obj_invalidate(lv_display_get_layer_sys(s_display));
    }
    if (s_want) *retry_ms = 20;
    display_unlock();
    return ready;
}

void ui_remote_display_ack(void)
{
    if (!display_lock(0)) return;
    s_ready = false;
    display_unlock();
}

bool ui_remote_display_control(bool enabled)
{
    if (!display_lock(100)) return false;
    cancel_input();
    s_control = enabled && s_open && !s_suspended && !physical_pressed();
    s_heartbeat = esp_timer_get_time();
    bool result = s_control;
    display_unlock();
    return result;
}

bool ui_remote_display_pointer(unsigned kind, int x, int y)
{
    if (!display_lock(100)) return false;
    bool ok = false;
    if (kind == 3) { cancel_input(); ok = true; }
    else if (s_control && !s_suspended && !physical_pressed() &&
             x >= 0 && y >= 0 && x < s_width && y < s_height &&
             ((kind == 0 && !s_queued_down) || ((kind == 1 || kind == 2) && s_queued_down))) {
        if (s_count && kind == 1 && s_inputs[(s_head + s_count - 1) % INPUT_COUNT].kind == 1) --s_count;
        if (s_count == INPUT_COUNT) cancel_input();
        else {
            s_inputs[(s_head + s_count++) % INPUT_COUNT] = (input_t){kind, x, y};
            s_queued_down = kind != 2;
            s_heartbeat = esp_timer_get_time();
            ok = true;
        }
    }
    display_unlock();
    return ok;
}

bool ui_remote_display_heartbeat(void)
{
    if (!display_lock(100)) return false;
    s_heartbeat = esp_timer_get_time();
    bool control = s_control;
    display_unlock();
    return control;
}

void ui_remote_display_suspend(bool suspended)
{
    if (!display_lock(0)) return;
    s_suspended = suspended;
    s_dirty = true;
    s_control = false;
    cancel_input();
    display_unlock();
}

bool ui_remote_display_available(void)
{
    if (!display_lock(100)) return false;
    bool available = s_display && !s_suspended;
    display_unlock();
    return available;
}
#else
esp_err_t ui_remote_display_init(void) { return ESP_ERR_NOT_SUPPORTED; }
esp_err_t ui_remote_display_open(void) { return ESP_ERR_NOT_SUPPORTED; }
void ui_remote_display_close(void) {}
bool ui_remote_display_capture(const uint8_t **p, uint16_t *w, uint16_t *h, unsigned *retry_ms) { *retry_ms = 200; return false; }
void ui_remote_display_ack(void) {}
bool ui_remote_display_control(bool enabled) { return false; }
bool ui_remote_display_pointer(unsigned k, int x, int y) { return false; }
bool ui_remote_display_heartbeat(void) { return false; }
void ui_remote_display_suspend(bool suspended) {}
bool ui_remote_display_available(void) { return false; }
#endif
