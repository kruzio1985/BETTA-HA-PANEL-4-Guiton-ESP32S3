<!-- SPDX-License-Identifier: LicenseRef-FNCL-1.1 | Copyright (c) 2026 Cpt_Kirk -->
<img src="images/BETTAOS.jpg" alt="BETTA OS Logo" width="10%" />

# Guition 4 Wall Panel (BETTA HA Panel fork, `panels3`)

**Runtime-configurable Home Assistant wall panel for the Guition ESP32-S3-4848S040
(4.8" 480×480 touchscreen).** Build your dashboard directly on the device — no YAML
edits, no firmware rebuilds.

This repository is a **fork of [BETTA HA Panel v0.8.2]([https://github.com/cptkirki/BETTA-HA-Panel](https://github.com/cptkirki/BETTA-HA-PANEL?utm_source=chatgpt.com](https://github.com/cptkirki/BETTA-HA-PANEL))**
by **Cpt_Kirk**, extended with a large set of custom features: a much richer
tile/page appearance engine, seven built-in themes with automatic day/night switching,
a flip-clock screensaver, six new tile types, deep Home Assistant **Alarmo**
integration, production-grade diagnostics and backup/restore, microSD support,
a substantially smaller and faster firmware, and full Polish localisation.

> 🇵🇱 **Polska wersja dokumentacji:** [README.pl.md](README.pl.md)

---

## Table of contents

- [License & attribution (please read)](#license--attribution-please-read)
- [Highlights](#highlights)
- [Detailed list of improvements](#detailed-list-of-improvements)
  - [A. Touch, responsiveness, fluidity](#a-touch-responsiveness-fluidity)
  - [B. Tile look (`tile_*`)](#b-tile-look-tile_)
  - [C. Page look (`page_*`)](#c-page-look-page_)
  - [D. Themes](#d-themes)
  - [E. Screensaver and clock](#e-screensaver-and-clock)
  - [F. New tiles and Alarmo integration](#f-new-tiles-and-alarmo-integration)
  - [G. Network, stability, diagnostics](#g-network-stability-diagnostics)
  - [H. Web editor](#h-web-editor)
  - [I. Firmware size and speed](#i-firmware-size-and-speed)
  - [J. microSD card](#j-microsd-card)
  - [K. Variant synchronisation, backups, documentation](#k-variant-synchronisation-backups-documentation)
  - [Intentionally out of scope](#intentionally-out-of-scope)
- [Screenshots — on the panel](#screenshots--on-the-panel)
- [Screenshots — web editor](#screenshots--web-editor)
- [Supported hardware](#supported-hardware)
- [Main features (inherited from upstream)](#main-features-inherited-from-upstream)
- [Getting started](#getting-started)
- [Building from source](#building-from-source)
- [Flash and performance budget](#flash-and-performance-budget)
- [Web editor sections](#web-editor-sections)
- [Tile (widget) library](#tile-widget-library)
- [HTTP API](#http-api)
- [MQTT command keys](#mqtt-command-keys)
- [Notes and gotchas](#notes-and-gotchas)
- [Project structure](#project-structure)
- [Privacy — no personal data in this repository](#privacy--no-personal-data-in-this-repository)
- [License](#license)

---

## License & attribution (please read)

- Original project: **BETTA HA Panel v0.8.2** — Copyright (c) 2026 **Cpt_Kirk**.
- License: **[LicenseRef-FNCL-1.1](LICENSE)** (Federation Non-Commercial License v1.1) —
  **non-commercial**. Any commercial use requires a separate written license from the
  copyright holder (see §11 of the license).
- **This fork modifies the original software.** Per §3 of the license, the changes are
  clearly marked and described in
  [Detailed list of improvements](#detailed-list-of-improvements) and in
  [release-notes.md](release-notes.md).
- This fork is a personal project and is **not** an official release of the upstream
  BETTA HA Panel; the upstream version number is deliberately kept.

---

## Highlights

| Feature | Description |
|---|---|
| 🎨 **Tile appearance engine** | Per-tile background, gradient, border, radius, corner shape, opacity, shadow, font scale and five independent text colours (title / entity label / value / icon / whole tile). Seven ready-made looks, four "copy look" actions and a reset. |
| 🖼 **Per-page look** | Background colour, gradient, wallpaper use, wallpaper dim, per-page theme override and eight page presets. |
| 🌗 **7 built-in themes + day/night** | `dark_v2`, `classic_v1`, `light`, `ocean`, `contrast`, `oled`, `retro`, plus custom themes, per-page themes and automatic day/night switching on a configurable time window. |
| ⏰ **Flip-clock screensaver** | Classic or flip (per-card rolling digits) clock, 12 h / 24 h, optional AM/PM badge, date, seconds, own colours, dimming, night mode and custom wallpaper. |
| 🧱 **6 new tile types** | `cover_tile`, `scene_tile`, `person_tile`, `timer_tile`, `alarm_tile` and a plain clock tile (`clock_alarm`), on top of the upstream library. |
| 🚨 **Alarmo integration** | Five arm modes, Alarmo services, PIN pad, auto-PIN from entity attributes, open/bypassed sensor lists, skip-delay, force-arm confirmation, arming-delay countdown, arm-ready masks and rejection reasons straight from Alarmo events. |
| 📊 **Diagnostics** | Per-pool memory statistics, Wi-Fi/HA link counters, disconnect reasons, missing entities, UI and boot guards, ring-buffer system log readable in the browser. |
| 💾 **Backup / restore** | The whole configuration in one JSON file — layout, public settings and custom themes. **Secrets are never exported.** |
| 🗂 **microSD card** | Mount/format/browse/delete, screensaver wallpaper stored on the card, periodic log export, path-traversal protection. |
| ⚡ **Smaller and faster** | `-O2` build, gzip-compressed web UI: web assets −501 kB, firmware −483 kB (≈23 % free on the app partition), faster API responses and faster layout rebuilds. |
| 🇵🇱 **Polish language** | Full Polish localisation of the editor and the panel, Poppins fonts with diacritics, PL/EN texts for every new feature. |
| 📡 **MQTT** | HA auto-discovery plus a long list of new command keys (pages, screensaver, clock, bars, brightness, animations). |
| 🌐 **Static IP** | Optional fixed IP / netmask / gateway / DNS. |
| 🔁 **Auto-restart + logs** | Scheduled restart every N hours (1–168) with a persistent system log — cured the graphics artefacts that appeared after many hours of uptime. |
| 👆 **Touch comfort** | Whole-track slider touch, press feedback, animated value changes and animated page transitions. |

---

## Detailed list of improvements

Everything below was added on top of upstream v0.8.2 between **15 and 17 September 2026**
on a live `panels3` panel. The list contains **225 individual changes**, grouped
thematically. File paths are relative to the firmware root.

### A. Touch, responsiveness, fluidity

1. **New module `main/ui/ui_slider_touch.c/.h`** — a wide touch band for sliders: `ui_slider_touch_enable_padded(slider, pad_along, pad_cross)`.
2. **Tapping anywhere on the track now sets the value** — previously only grabbing the knob (a ~44 px band) worked.
3. **`w_slider.c`** — the generic slider moved to the new touch band (it used to be one of the most stubborn widgets).
4. **`w_light_tile.c`** — light brightness and colour slider on the new touch band.
5. **`w_media_player.c`** — player volume slider on the new touch band.
6. **`ui_screen_settings.c/.h`** — on-screen brightness slider on the new touch band.
7. **New module `main/ui/ui_press_feedback.c/.h`** — visual tile response on press (shrink + dim) so the panel no longer feels laggy.
8. **Press-effect settings** — `tile_press_fx`, `tile_press_fx_dim`, `tile_press_fx_scale` (also read from MQTT and `/api/settings`).
9. **New module `main/ui/ui_value_anim.c/.h`** — `ui_value_anim_set_text()` instead of `lv_label_set_text()`; values "count up" instead of jumping.
10. **Value-animation settings** — `value_anim`, `value_anim_ms` (default `count`, 320 ms, max 1500 ms).
11. **New module `main/ui/ui_page_transition.c/.h`** — animated page entry; default `fade`, 220 ms, max 1200 ms (only the incoming page animates).
12. **Page-transition settings** — `page_transition`, `page_transition_ms`, an "Apply" button in the web editor and a `page_trans` log tag.
13. **`ui_runtime.c` — UI watchdog with heartbeat feed** — long layout rebuilds report progress, so "slow but healthy" no longer ends in a restart.
14. **Fixed invisible text in the alarm tile** — `theme_default_style_card()` does not set `text_color`, and labels without an explicit colour inherited `#212121`; five `lv_obj_set_style_text_color()` calls were added (title, zone, state, info line, sensor list).
15. **Rule for the future:** every new tile label **must** set an explicit colour and carry the `LV_OBJ_FLAG_USER_1/2/3` flag so the web-editor overrides work.
16. **Tile style applied in the older widgets** — `w_button.c`, `w_binary_sensor.c`, `w_empty_tile.c`, `w_heating_tile.c`, `w_roborock.c`, `w_todo.c` (some tiles previously ignored the appearance settings entirely).
17. **Panel init corrections** — `main/drivers/display_init_panels3.c` (480×480).

### B. Tile look (`tile_*`)

18. **`tile_bg_color`** — tile background colour.
19. **`tile_bg_grad_color`** — second gradient colour.
20. **`tile_bg_grad_dir`** — gradient direction (`none` / `hor` / `ver`).
21. **`tile_border_color`** — border colour.
22. **`tile_border_width`** — border width in px.
23. **`tile_radius`** — corner radius in px.
24. **`tile_opacity`** — background opacity in %.
25. **`tile_shadow`** — drop shadow (0/1).
26. **`tile_font_scale`** — font size: `auto` / `s` / `m` / `l` / `xl`.
27. **`tile_text_color`** — colour of the whole tile text (master switch).
28. **`tile_title_color`** — separate colour for the tile **title**.
29. **`tile_label_color`** — separate colour for the **entity description**.
30. **`tile_value_color`** — separate colour for the **value / status** (temperature, humidity, power in W, …).
31. **`tile_icon_color`** — icon colour.
32. **`LV_OBJ_FLAG_USER_1/2/3` flag mechanism + `ui_widget_factory_apply_tile_style()`** — makes the split title/label/value colours work in **every** tile type, not just a few.
33. **Theme inheritance** — an empty field means "use the theme colour", `-1` means "none" (nothing is hard-coded).
34. **Tile corner shape presets** — `custom`, `square` (0 px), `soft` (10 px), `rounded` (16 px), `pill` (40 px), `circle` (maximum radius; a square tile becomes a circle).
35. **Seven appearance presets** — `auto`, `graphite`, `emerald`, `amber`, `violet`, `sky`, `glass`.
36. **"Copy look from"** — `layout.tile_look.copy_source` picks the source tile.
37. **"Copy look"** — `layout.tile_look.copy_apply` copies onto the selected tile.
38. **"Apply to all tiles"** — `layout.tile_look.copy_apply_page` copies onto the whole page.
39. **Only the look is copied** — background, border, colours and font scale; entity, title and geometry stay untouched.
40. **"Reset tile look"** — `layout.tile_look.reset` clears every `tile_*` field (back to the theme).
41. **`main/ui/ui_tile_style.h/.c`** — one consistent tile-appearance model used by all widgets.
42. **Value colours in data tiles** — `w_sensor.c`, `w_weather_tile.c`, `w_graph.c`.
43. **18 tile types in the registry** — `sensor`, `button`, `slider`, `graph`, `empty_tile`, `light_tile`, `heating_tile`, `weather_tile`/`weather_3day`, `todo_list`, `media_player`, `roborock_tile`, `binary_sensor`, `alarm_tile`, `clock_alarm`, `cover_tile`, `scene_tile`, `person_tile`, `timer_tile` (`ui_widget_factory.c`).

### C. Page look (`page_*`)

44. **`page_bg_color`** — page background colour.
45. **`page_bg_grad_color`** — second background gradient colour.
46. **`page_bg_grad_dir`** — gradient direction (`none` / `hor` / `ver`).
47. **`page_wallpaper`** — use the uploaded wallpaper as the page background.
48. **`page_dim`** — wallpaper dimming, 0–90 %.
49. **`page_theme`** — a theme id valid **for this page only** (empty = global / day-night theme).
50. **Eight page presets** — `auto`, `midnight`, `deep_sea`, `forest`, `sunset`, `plum`, `wallpaper`, `wallpaper_dim`.
51. **Page-look reset** — `layout.page_look.reset` → `ui_page_style_reset`.
52. **`main/ui/ui_page_style.h/.c`** — the page-appearance model.
53. **Page style validation in `layout_validate.c`** — including `page_theme` length and type.
54. **The wallpaper image is never destroyed** — a page theme/background only overlays or dims it.

### D. Themes

55. **`oled` theme (OLED Black)** — `#000000` background, new built-in.
56. **`retro` theme (Retro Amber)** — amber "CRT" look, second new built-in.
57. **Seven built-in themes in total** — `dark_v2` (default), `classic_v1`, `light`, `ocean`, `contrast`, `oled`, `retro` (confirmed by `GET /api/themes`).
58. **Per-page theme** — the `page_theme` field in the page layout plus preview in the web editor ("Themes → Page").
59. **New module `main/ui/ui_theme_router.c/.h`** — resolution order: page `page_theme` → day/night theme by time → global theme.
60. **Automatic day/night theme by clock time** — new settings `theme_auto_enabled`, `theme_day_id`, `theme_night_id`.
61. **Own night window** — taken from `display_night_start_min` / `display_night_end_min` (the same hours as the brightness schedule) but working **even when the night-brightness schedule is disabled**.
62. **Without a synced clock (SNTP) the day theme is used** — no flashing in the wrong theme right after boot.
63. **Manual theme selection overrides the current half of the day** — until the window boundary changes or the panel restarts.
64. **Applied live, no restart** — `PUT /api/settings` answers `reboot:false`.
65. **The theme changes without rebuilding the layout** — colours without `tile_*`/`page_*` overrides come from the theme.
66. **Custom themes** — `theme_store` plus the theme editor.
67. **Theme API for C** — `theme_palette_active()`, `theme_palette_active_id()`, `theme_palette_active_name()`, `theme_palette_find_builtin()`, `theme_palette_builtin_list()`, `theme_palette_set_active()`, `theme_palette_activate_by_id()`, `theme_palette_to_json()`, `theme_palette_from_json()`.
68. **Bad theme id is cleaned up** — `api_theme.c` never leaves the panel with an empty palette.
69. **An empty/invalid theme name cannot break the UI** — validated before activation.
70. **Verified on hardware** — a page with `page_theme=retro` switched the palette on activation, and returning to another page restored the global theme.

### E. Screensaver and clock

71. **Clock aligned to the bottom of the screen** (`LV_ALIGN_BOTTOM_MID`) with an `APP_DISPLAY_SAVER_CLOCK_BOTTOM_GAP` margin of 26 px — the time is no longer centred.
72. **Date 8 px under the clock** — like Tuya-style panels.
73. **`classic` clock style** — the original flat clock.
74. **`flip` clock style** — digits built from individual cards (black plates with a digit) that roll vertically when the minute changes.
75. **Flip-card geometry in `app_config.h`** — card size, spacing, radius and thickness (`APP_DISPLAY_SAVER_FLIP_*`).
76. **Roll animation time `APP_DISPLAY_SAVER_FLIP_ANIM_MS` = 150 ms** (temporary 3000 ms test value reverted to production).
77. **Flip implementation** — `flip_build()`, `flip_tick()`, rebuild in `destroy_overlay()` / `ensure_overlay()` in `ui_screen_saver.c`.
78. **12 h / 24 h clock format** — new `clock_24h` setting (default 24 h), selectable in the web editor as "Clock format" and in `/api/settings`.
79. **No leading zero in 12 h mode** — e.g. "7:05" instead of "07:05".
80. **AM/PM badge** — next to the digits, on a 50×46 px black plate, `APP_FONT_DISPLAY_28`, spacing `APP_DISPLAY_SAVER_AMPM_GAP`.
81. **The badge works in BOTH clock styles** — classic and flip.
82. **Genuinely bold AM/PM text** — five stacked copies of the same `lv_label` (`AMPM_COPY_COUNT` 5, offsets 0,0 / +1,0 / −1,0 / 0,+1 / 0,−1 px), giving an ≈3 px stroke.
83. **Why the copy trick** — `lv_draw_sw_letter.c` honours `outline_stroke_*` **only** for vector fonts (`LV_FONT_GLYPH_FORMAT_VECTOR`, requires `LV_USE_FREETYPE` + `LV_USE_VECTOR_GRAPHIC` + `LV_USE_THORVG`), and every font in this panel is a bitmap A1..A8 — the outline was silently ignored.
84. **Card row shifted by 31 px in 12 h mode** — the flip style has one card fewer, so the row moves by (50+2+10)/2 to stay centred.
85. **In 24 h mode there is no badge** and the clock returns to full centring.
86. **Measured geometry, classic + 12 h** — digits 124..295 px, badge 308..357 px.
87. **Measured geometry, flip + 12 h** — cards 41..378 px, badge 389..438 px.
88. **Pixel verification of all four combinations** — clock style × format, from `/api/screenshot.bmp` frames.
89. **Screensaver toggles** — 24 h clock, show seconds, show date.
90. **Screensaver colours** — clock `0xFFFFFF`, date `0xC8C8C8`.
91. **Screensaver brightness 20 %, entry after 120 s**, screen-off threshold 300 s (as configured on the live panel).
92. **Automatic screen-off is OFF by default** — `APP_DISPLAY_SCREEN_OFF_ENABLED 0` in `main/app_config.h`; the web-editor switch still allows enabling it.
93. **The default comes from a single `#define`** — `runtime_settings.c` reads `APP_DISPLAY_SCREEN_OFF_ENABLED`, so one change applies to the whole firmware.
94. **Screensaver night mode** — 22:00–06:00, brightness 0, 20 s wake window.
95. **Screensaver wallpaper** — upload, delete and reload (`ui_screen_saver_reload_wallpaper`, `/api/display/wallpaper`).
96. **`ui_screen_saver_wake()` / `ui_screen_saver_handle_screen_clean()`** — the API used by HA/MQTT events.
97. **Memory control after the clock changes** — two `/api/diagnostics` readings, after ~1 min and after 8.8 min (529 501 ms): `heap_free` 78 779 B, `heap_free_min` 39 828 B, `lvgl.live_blocks` 1324 — **identical**, `fail_count` 0, `alloc_count − free_count = 1324` → no leak.
98. **Links after a long session** — Wi-Fi 0 disconnects, HA 0, MQTT connected, CPU 46 °C, `rollback_pending false`, `image_state new`.

### F. New tiles and Alarmo integration

99. **`cover_tile`** — blinds and shutters control.
100. **Click = open/close, second click = STOP** — exactly as requested.
101. **Open / Stop / Close row** — available from a tile size of 170×150 px.
102. **Draggable position bar in %** — `cover.set_cover_position`, i.e. "open/close to N percent".
103. **`scene_tile`** — run Home Assistant scenes.
104. **`person_tile`** — people presence (states, who is at home).
105. **`timer_tile`** — countdown timer.
106. **`alarm_tile`** — alarm tile (state + arming).
107. **`alarm_backend` selection** — `auto` (detects Alarmo from the `open_sensors` / `bypassed_sensors` / `arm_mode` / `ready_to_arm` attributes), `alarmo`, `builtin`.
108. **Five arm modes** — `away`, `home`, `night`, `vacation`, `custom_bypass`, the list configurable per tile (`alarm_modes`).
109. **`builtin` services** — `alarm_control_panel.alarm_arm_*` / `alarm_disarm`.
110. **Alarmo services** — `alarmo.arm {entity_id, mode, force, skip_delay, code}` and `alarmo.disarm {entity_id, code}`.
111. **Colours, icons and PL/EN texts for every state** — `armed_home`, `armed_away`, `armed_night`, `armed_vacation`, `armed_custom_bypass`, `pending`, `triggered`.
112. **PIN code `alarm_code` + `alarm_ask_code`** — an on-panel keypad, the code masked, capped by `APP_MAX_ALARM_CODE_LEN`.
113. **Auto-PIN with no extra configuration** — the panel reads the `code_format` attribute (non-empty = the entity wants a code) and `code_arm_required` (defaults to yes when the attribute is missing); disarming always asks, arming only when HA requires it.
114. **Web-editor checkbox renamed** to "Always ask for PIN (auto: when HA requires it)".
115. **`changed_by` is read** — "armed by …" on the tile.
116. **Double-tap protection** — `W_ALARM_BUSY_TIMEOUT_MS` 8000; after a failed action the panel returns to the HA state instead of staying in "waiting".
117. **New module `main/ha/ha_alarm_events.c/.h`** — the last Alarmo event in a single static slot (critical section via `portMUX`, 512 B payload through `cJSON_PrintPreallocated`, **no heap allocation**, sequence number `seq`).
118. **Subscription to 3 Alarmo events** — `alarmo_failed_to_arm`, `alarmo_command_success`, `alarmo_ready_to_arm_modes_updated`; sent once per connected and authenticated WebSocket (`ws_connect_count` as session identity → self-healing without restarting the UI).
119. **Startup log line `Subscribed to 3 Alarmo events`** — confirmed over the serial console.
120. **Open-sensor list** — the `open_sensors` attribute parsed into names ("Door: Terrace, Window: Kitchen"), name from `friendly_name`, otherwise a prettified `entity_id`, plus an `open_count` counter.
121. **Bypassed-sensor counter** — `bypassed_sensors` → "Bypassed: N" on the info line.
122. **Arming with sensors bypassed** — `alarmo.arm` with `force: true`; a confirmation overlay lists the sensors with "Arm anyway" / "Cancel" buttons (when `alarm_force_arm`).
123. **`skip_delay`** — a switch that skips the exit delay.
124. **Vacation mode** — `armed_vacation` + an "Arm for vacation" button.
125. **Exit-delay countdown** — the `delay` attribute → an "N s" suffix on the tile, refreshed every 500 ms and re-anchored on every value change from HA.
126. **Zone label** — the `alarm_zone_label` field in the top-right corner of the header (shown when the tile is ≥ 200 px wide), truncated with an ellipsis.
127. **Sensor type from `device_class`** — `door` / `window` / `motion` / `smoke` / `water` / `tamper`, translated PL/EN.
128. **Fixed the English "(open)" inside Polish text** — `open_sensors` carries the sensor **state**, not its type; the type now comes from `device_class`.
129. **Reason for a refused arm on the tile** — the `alarmo_failed_to_arm` event → a red info line: `open_sensors` with the sensor list, `invalid_code` ("invalid code"), `not_allowed` ("not allowed now"); the state returns to the previous one after 10 s (`W_ALARM_EVENT_TEXT_MS`).
130. **Command confirmation** — `alarmo_command_success` ends the "waiting" state immediately (without waiting for the 8 s timeout) and clears the readiness masks.
131. **Arm-mode readiness** — `alarmo_ready_to_arm_modes_updated` → per-mode bitmasks; a mode that is not ready is dimmed (`LV_OPA_60` + greyed text) but **still clickable** (arming with `force` makes sense); masks are cleared after an accepted command and on `unavailable`.
132. **Alarm tile bottom stack layout** — buttons → info line → sensor line; the state text gets space first, then the info line and the sensors disappear in order; sensors wrap to at most two lines.
133. **Fixed the web editor for alarms** — 9 inspector fields (`fAlarmCode`, `fAlarmAskCode`, `fAlarmBackend`, `fAlarmZoneLabel`, `fAlarmShowSensors`, `fAlarmShowBypassed`, `fAlarmForceArm`, `fAlarmSkipDelay` + the mode checkboxes) **were not wired into `bindInspectorAutoApply()`** — edits silently reverted; 9 calls were added and the whole save → `GET /api/layout` flow was verified.
134. **Tiles mapped live on hardware** — 3 `alarm_control_panel` entities and **107 `binary_sensor` entities** visible in discovery.
135. **`w_clock_alarm.c` → plain clock** — ringing, snooze, tone, actions and overlays removed; only time and date remain (`show_seconds`, `show_date`).
136. **`binary_sensor`** — binary-sensor tiles with ON/OFF colours are now part of this fork's tile set.

### G. Network, stability, diagnostics

137. **Per-pool memory statistics** — `regions{internal, internal_dma, internal_32bit, psram, default}` in `/api/diagnostics`, each with `total`, `free`, `largest_block`, `free_min`, `allocated`, `alloc_blocks`, `free_blocks`, `fragmentation_pct` → you can see **which** pool is running out, not just the total.
138. **Extended 30 s heartbeat line** — besides `heap_free`/`psram_free` also `int_free`, `int_largest`, `dma_free`, `dma_largest`, `iram_free` (the history in `/api/logs` shows trends).
139. **Wi-Fi link statistics** — successful connections, disconnects, scheduled reconnects, hard driver recoveries, last disconnect reason, session duration (`wifi_mgr_link_stats_t`).
140. **HA link statistics** — `connect_count`, `disconnect_count`, `recover_count`, `error_streak`, `short_session_strikes`, `last_connected_uptime_ms`, `last_session_ms`, `session_healthy` → half-open connection detection.
141. **Heavy-request gate for HA** — `ha_client_heavy_gate_is_busy()`: energy and large lists no longer block the UI loop.
142. **`ha_client_is_initial_sync_done()`** — the UI knows when data is complete (no more empty tiles flashing after boot).
143. **Missing-entity diagnostics** — `missing_entities` in `/api/diagnostics` plus a web-editor warning "these entities do not exist in HA".
144. **Recovery API** — `wifi_mgr_force_reconnect()`, `wifi_mgr_force_transport_recover()`.
145. **Disconnect reason logging** — "why did it disconnect?" is now answered by diagnostics instead of guesswork.
146. **Boot guard** — boot counter, reset reason (`boot_guard_reset_reason_str`), OTA image state (`boot_guard_ota_state_str`), `rollback_pending`, `confirmed`.
147. **Image confirmed only when healthy** — the confirmation task starts when Wi-Fi is connected or after `APP_BOOT_CONFIRM_TIMEOUT_MS`, so a failed boot rolls back to the previous version instead of bricking the panel.
148. **UI watchdog `APP_UI_WATCHDOG_TIMEOUT_MS` = 60 s** — controlled restart with the reason written to the log, plus `ui_runtime_is_running()`, `ui_runtime_get_heartbeat()`, `ui_runtime_kick_heartbeat()`.
149. **System log** — `main/diag/system_log.c` (ring buffer) + `GET /api/logs`, `DELETE /api/logs` — read the logs without a USB cable.
150. **OTA by URL and by upload** — `GET /api/ota/status`, `POST /api/ota/url`, `POST /api/ota/upload`, rollback confirmed by the boot guard.
151. **Auto-restart (firmware)** — `system.auto_restart_enabled` + `system.auto_restart_hours` in `runtime_settings` and `/api/settings` (clamped), plus a periodic task in `app_main` calling `esp_restart()` after N hours of uptime.
152. **Auto-restart (web UI)** — a switch and an hours field in `index.html`/`app.js` with validation, EN + PL.
153. **Backup / restore** — `GET /api/backup` (JSON: `backup_version`, `layout`, `settings`, `themes`), `POST /api/backup/restore` with restore counters; **secrets are never exported** (HA token, MQTT password, Wi-Fi credentials).
154. **Static IP** — IP / netmask / gateway / DNS fields in `runtime_settings`, `GET`/`PUT /api/settings` and a form in the web editor.
155. **MQTT section in the web editor** — enabled, TLS, host, port, username, password, discovery prefix; full `app.js` support (nav, refs, render, save/apply) + EN/PL i18n.
156. **New MQTT command keys** — `wake`, `page`, `screensaver_enabled`, `screen_off_enabled`, `clock_24h`, `saver_show_seconds`, `saver_show_date`, `topbar_show_clock|date|gear|status`, `topbar_icon_text`, `topbar_custom_colors`, `brightness`, `saver_brightness`, `screensaver_timeout_sec`, `screen_off_timeout_sec`, `page_transition`, `page_transition_ms`, `tile_press_fx`, `tile_press_fx_dim`, `tile_press_fx_scale`, `value_anim`, `value_anim_ms`.
157. **Fixed missing `nav_*` handling in `api_settings.c`** — `GET`/`PUT` have their own builder and parser, so the 9 bottom-bar keys had to be added separately (otherwise the changes never arrived).
158. **Bottom navigation-bar colours** — 9 `nav_*` fields, applied live without a restart, verified pixel-by-pixel.
159. **Top-bar colours** — background `0x0D1723`, clock `0xEAF2FA`, date/gear `0xA1B1C1`, HA/Wi-Fi `0xC7D1DB`, minimum clock font 22 px.
160. **Task stacks moved to PSRAM** (`app_task.h`) and **a custom LVGL allocator backed by PSRAM** (`ui/ui_lvgl_mem.c`) — `heap_free` 23 595 → 96 571 B, `largest` 10 752 → 47 104 B, `lvgl.fail_count` 0.

### H. Web editor

161. **Two tabs: Layout and Settings** (+ a first-run wizard).
162. **"Tile look (this tile)" section** in the inspector — preset, background, gradient, border, radius, shape, opacity, font, shadow, text colour.
163. **Separate colour pickers**: title / entity label / value / icon.
164. **Reset-look button** and **copy-look** (three variants) in the inspector.
165. **"Page look (this page)" section** — preset, background, gradient, wallpaper, dim, reset.
166. **`entity_picker`** — search by name, `entity_id` and room, loading progress, handling of a missing HA connection and a note when the list is truncated by the firmware limit.
167. **Button styles** — switch, power switch, power status, plug icon, lamp icon, backlight, status text.
168. **Binary-sensor column set** — ON/OFF colour and text, sensor value colour.
169. **Layout JSON paste field** — drop a complete layout in one go.
170. **Warning about entities absent from HA** and a **backup hint** ("the backup contains the layout, public settings and custom themes").
171. **"Themes → Page" section** — lists `page_theme` in the page inspector.
172. **"Themes depend on time of day" switch** + day and night theme lists, texts in 5 languages.
173. **"Clock format"** (`settingsClockFormat`) and **"Clock style"** (`settingsClockStyle`) controls.
174. **Build-time gzip compression** — `components/webui/tools/gzip_asset.py` (level 9, `mtime=0` → reproducible builds) and `target_add_binary_data(... BINARY)`.
175. **Serving with `Content-Encoding: gzip` and `Vary: Accept-Encoding`**.
176. **A text message for clients without gzip support** — so a browser never saves the `.gz` payload as JavaScript.
177. **`Cache-Control: no-store` is kept** — asset URLs have no version suffix, so the browser must fetch fresh files after an OTA.
178. **gzip verification** — the `SHA256` of the files downloaded from the panel matches `components/webui/www/` (they unpack bit-for-bit identically).
179. **i18n keys for every new feature** — `settings.display.clock_format`, `clock_format_h24`, `clock_format_h12`, `clock_format_hint`, `clock_style`, `clock_style_classic`, `clock_style_flip` (EN + PL) and the remaining new-section texts.
180. **Lesson: a new setting must exist in two places** — `runtime_settings.c` (NVS) and `api_settings.c` (`GET`/`PUT`); additionally `ui_screen_saver_apply_settings()` is called from `api_settings.c`, `api_backup.c` (restore) and `panel_mqtt.c`.

### I. Firmware size and speed

181. **Web UI compressed in the build** — 623 152 B → **121 750 B** (−501 402 B).
182. **`-O2` instead of `-Og`** — `CONFIG_COMPILER_OPTIMIZATION_PERF=y` in `sdkconfig.panels3` and `sdkconfig.defaults.panels3`, assertions kept.
183. **`-Werror=stringop-overread` fixed** — `safe_copy_cstr()` in `ha_client.c` without `strnlen()` (with `-O2` the function was inlined and GCC emitted the warning).
184. **`-Werror=format-truncation` fixed** — the validation messages in `layout_validate.c` quote the identifier through `%.*s` with a `LAYOUT_MSG_VALUE_MAX` cap.
185. **Warnings fixed in code, not globally disabled** — `-Werror` is still enforced.
186. **Firmware image** — 3 718 688 B → **3 235 984 B** (−482 704 B).
187. **Free space on the app partition** — 475 616 B (11.3 %) → **958 320 B (22.9 %)**.
188. **`GET /api/diagnostics`** — 53.9 ms → **34.9 ms**.
189. **`GET /api/entities`** — 43.3 ms → **30.6 ms**.
190. **`GET /api/layout`** — 69.1 ms → **31.2 ms**.
191. **Layout rebuild in the UI** — 628–660 ms → **401 ms**.
192. **`/app.js` transfer in the browser** — 623 kB → **103 kB**.
193. **The screensaver image takes no space in the firmware** — it lives in LittleFS and is loaded into PSRAM (480×480×2 = 460 800 B), so replacing the picture does not change the image size.
194. **A reference `-Og` image kept for comparison** so the change can be measured and reverted.
195. **Post-flash verification** — the editor opens and shows the pages and tiles, `/api/logs` has no watchdog entries and no panic, `lvgl.fail_count` 0.

### J. microSD card

196. **SDMMC 1-bit mounting only after `display_init()`** — the panel shares IO47/IO48 with the card's SPI bus.
197. **`GET|PUT /api/sd` + `/api/sd/format`, `/api/sd/files`, `/api/sd/file` (+`DELETE`)** — enable/disable (remembered in NVS), mount, unmount, format, directory listing, file deletion.
198. **Path protection in `sd_card_build_path()`** — rejects absolute paths and `..` (no escape from the directory).
199. **Screensaver wallpaper on the card only** (when one is inserted) — `APP_SD_WALLPAPER_PATH=/sd/photos/wallpaper.bin` + `APP_SD_WALLPAPER_TMP_PATH`; without a card it falls back to LittleFS.
200. **A single copy enforced in three places** — card events `MOUNTED`/`RELEASING`/`UNMOUNTED`, upload `POST /api/display/wallpaper`, delete `DELETE /api/display/wallpaper`.
201. **`ui_screen_saver_wallpaper_sync()`** — copies the frame from PSRAM to the card when it is inserted and **back to LittleFS before unmounting** (`RELEASING`), so removing the card never loses the picture.
202. **`wallpaper_store` in `GET /api/sd`** (`sd`/`flash`/`none`) + a note about it in the web editor's microSD section.
203. **Removing `photos/wallpaper.bin` from the file list also clears the RAM copy.**
204. **Log export to the card** — `POST /api/sd/logs/export`, `GET /api/sd/files?dir=logs`; pop the card out and read the logs without a cable.
205. **Fixed log rotation (`sd_logs_prune()`)** — the directory was listed into an array of `APP_SD_LOG_MAX_FILES` entries and then trimmed to 8, so the "too many files" branch **never ran**; the scan now reserves one spare slot (`MAX_FILES + 1`) and is capped at `2 * (MAX_FILES + 1)` passes.
206. **Log budget 512 kB → 4 MB** (`APP_SD_LOG_MAX_BYTES`) — a single export is ~380 kB, so the previous value left room for one file only; up to 8 recent exports are kept now.
207. **Periodic export every 6 h** (`APP_SD_LOG_EXPORT_PERIOD_SEC`), the first one 30 s after boot.
208. **Verified on hardware** — `wallpaper_store:sd`, `photos/wallpaper.bin` = 460 800 B on the card, image `SHA256` unchanged, card `used_bytes` +460 800 B.
209. **Fixed directory layout on the card** — folders created automatically on mount.

### K. Variant synchronisation, backups, documentation

210. **Full source backup before this round of work** — a complete copy of the project (sources, components, managed components, tools, images, partition tables, `sdkconfig*`, ready binaries) so any change can be reverted.
211. **The sibling variant had drifted far behind** — 7 missing files (`app_task.h`, `ha/ha_alarm_events.{c,h}`, `ui/ui_lvgl_mem.{c,h}`, `ui/ui_theme_router.{c,h}`) and 29 differing files (the biggest: `w_alarm_tile.c` 1001 lines, `ui_screen_saver.c` 528, `sd_card.c` 246, `theme_palette.c` 117).
212. **A safety backup was taken before synchronising** the second variant.
213. **Sources, components and build configs moved across**, and the stale per-variant `sdkconfig` deleted (it is regenerated from the `defaults`) with the variant-specific display timeout re-entered.
214. **Verified equality of the two variants** — `main` differs **only** in `app_config.h` (intentional), `components` identical, `managed_components` 1:1.
215. **Pitfall: `robocopy /E` does not delete files** — a stale, full LVGL copy stayed behind in the second variant, leaving **740 redundant files**.
216. **Symptom** — `implicit declaration of function 'lv_image_header_cache_init'` from a dead `managed_components/lvgl__lvgl/src/draw/lv_image_decoder.c` (the new LVGL does not contain that file; `env_support/cmake/esp.cmake` globs `src/*.c` recursively, so the stale file was still compiled).
217. **Fix** — delete the whole `managed_components` tree of the second variant, copy it from scratch (6967 = 6967 files) and delete the stale build directory (whose CMake cache pointed at the old source set).
218. **Clean build of the second variant succeeded** — `betta-ha-panel-s3.bin` 3 247 040 B, 23 % of the partition free, MD5/SHA256 recorded.
219. **Build configuration verified identical** — `CONFIG_COMPILER_OPTIMIZATION_PERF=y`, `CONFIG_SPIRAM_TRY_ALLOCATE_WIFI_LWIP=y`, `CONFIG_LV_USE_CUSTOM_MALLOC=y`, `CONFIG_FREERTOS_HZ=1000`, PCLK 9 MHz, bounce buffer 16 lines.
220. **Lesson for the future** — when moving a fork, delete the target directory or use `robocopy /MIR`; never `/E`.
221. **A "features to port" catalogue** — 11 sections covering performance/build, LVGL appearance, screensaver and clock, tiles, HA/Alarmo, network, microSD, the web editor, a porting checklist, pitfalls and what is still open.
222. **Session history** — the work stages, change waves, on-hardware verification and artefacts recorded in a single chronological document.
223. **Session archive** — checkpoints, task database, workspace metadata and a copy of the documents kept together.
224. **Task status updated** — 150 done, 0 pending, 2 blocked (152 total).
225. **Second variant confirmed flash-ready** — the same build command with the variant's own `SDKCONFIG_DEFAULTS`, ready to flash over USB.
226. **Alarmo events were being truncated** — `HA_ALARM_EVENT_TYPE_LEN` was 32, so the literal `"ready to arm modes updated"` could reach the copy already cut off, the `strcmp` against the expected event type missed, and the alarm tile **never refreshed** the arm-ready mask, the blocking-sensor list or the rejection reason. The buffer is now 48 chars and a `_Static_assert` keeps a future shortening from sliding through unnoticed.
227. **`format-truncation` compile error in the alarm tile** — the `"Arming failed: …"` status line was built in a single `snprintf`, and GCC turns that warning into an error in debug builds (`-Og`, `-Werror`). The text is now assembled with `snprintf(..., "%s", title)` plus `alarm_text_appendf(..., ": %s", detail)`, which keeps the format analyser from summing the arguments. Debug and release builds are clean.
228. **Build-config parity** — `sdkconfig.defaults.panels3` now carries the options that used to live only in the maintainer's local `sdkconfig`, so a clone builds firmware that is **functionally identical** to the panel on the wall instead of merely similar: FATFS long file names (`HEAP`, 255, UTF-8, codepage **852**) — without these the screensaver cannot read its microSD images, Wi-Fi RX block-ack window `6` and the TCP out-of-order queue `4` — stability while the HA WebSocket, MQTT and the web editor overlap, RGB565 blend rounding (`128`), the LVGL object style cache off, the mono theme off, and LVGL assertions on (a misuse aborts with a backtrace instead of painting into the framebuffer). Note: `CONFIG_FATFS_CODEPAGE` is a Kconfig **choice**, so only `CONFIG_FATFS_CODEPAGE_852=y` works — a `CONFIG_FATFS_CODEPAGE=852` line is silently ignored.
229. **Published binaries rebuilt with the fixes** — app `betta-ha-panel-s3.bin` **3 251 328 B**, merged `guition-4-esp32s3.factory.bin` **3 382 400 B**, plus a refreshed `bootloader.bin`; `SHA256` sums are recorded in `firmware/README.md`. Build: **0 errors**, warnings only from deprecated LVGL APIs (400), and the noisy deprecation notice for `LV_ASSERT_HANDLER_INCLUDE` (942 occurrences) is silenced. The published tree contains no private data (SSID, IP addresses, MQTT credentials) — verified including gunzip of the three embedded WebUI gzip streams.

### Intentionally out of scope

- **Page swipe gestures** — rejected (CPU/DMA load risk); page switching is done from the bottom bar, MQTT or the API.
- **Home Assistant notifications on the panel** — out of scope (they would add load for little gain).
- **Music Assistant and the MQTT plumbing** — working; deliberately left untouched.
- **An artificial version bump** (e.g. "BETTA 9.0") — not done; this fork is not presented as an official upstream release.
- **Still on the wish list:** pre-rendered (image-based) icons, a fully configurable top bar, and keeping all images on the microSD card only.

---

## Screenshots — on the panel

| Main page | Second page | Music Assistant |
|---|---|---|
| ![Kitchen main page](images/screenshots/panel-01-kuchnia.png) | ![Second page](images/screenshots/panel-02-kuchnia-gn.png) | ![Music Assistant page](images/screenshots/panel-03-music.png) |
| **Alarm tile (Alarmo)** | **Screensaver — flip clock, 24 h** | **Screensaver — 12 h with AM/PM badge** |
| ![Alarm tile](images/screenshots/panel-04-alarm.png) | ![Screensaver flip clock 24h](images/screenshots/panel-05-screensaver-clock.png) | ![Screensaver 12h AM/PM](images/screenshots/panel-07-screensaver-ampm.png) |

### New tile types

![Cover, scene, person and timer tiles](images/screenshots/panel-06-new-tiles.png)

*Cover / scene / person / timer tiles, shown on a demo page built for this documentation.
The screensaver clock, the alarm tile, the tile appearance engine and the theme router
are all visible above.*

### On the wall

![Guition 4 panel mounted and working](images/panel-on-wall.jpg)

*Guition 4 panel (ESP32-S3-4848S040) running the `panels3` firmware — mounted on the wall and working.*

---

## Screenshots — web editor

The editor is served by the panel itself (`http://<panel-ip>`), so it always matches the
running firmware. Every screenshot below was taken with Wi-Fi credentials, IP addresses,
hostnames and tokens masked out.

| | |
|---|---|
| **Layout tab** — pages, widgets, inspector with the tile-appearance engine<br>![Editor layout](images/screenshots/editor-01-layout.png) | **"+ Add" widget menu** — the new tile types (cover, scene, person, timer, alarm panel, clock)<br>![Widget types](images/screenshots/editor-02-widget-types.png) |
| **Settings → Time** — 12 h / 24 h clock format, clock style (classic / flip)<br>![Time settings](images/screenshots/editor-03-time.png) | **Settings → Display & screensaver** — page transition, press feedback, value animation, screensaver, wallpaper<br>![Display settings](images/screenshots/editor-04-display.png) |
| **Settings → Pages** — page look, wallpaper, per-page theme, presets<br>![Page settings](images/screenshots/editor-05-pages.png) | **Settings → UI** — top bar and bottom navigation-bar colours<br>![UI settings](images/screenshots/editor-06-ui.png) |
| **Settings → Theme** — day/night automatic themes, custom themes<br>![Theme settings](images/screenshots/editor-07-theme.png) | **Settings → microSD card** — mount, format, files, wallpaper store, log export<br>![microSD settings](images/screenshots/editor-08-sd-card.png) |
| **Settings → Backup & restore** — everything in one JSON file, no secrets<br>![Backup settings](images/screenshots/editor-09-backup.png) | **Settings → Diagnostics** — memory pools, link counters, missing entities<br>![Diagnostics](images/screenshots/editor-10-diagnostics.png) |
| **Settings → Logs** — ring-buffer system log, download, clear<br>![Logs](images/screenshots/editor-11-logs.png) | **Settings → System** — auto-restart, boot guard<br>![System settings](images/screenshots/editor-12-system.png) |
| **Settings → Firmware update** — OTA by URL or upload, with rollback<br>![Firmware update](images/screenshots/editor-13-firmware.png) | |

---

## Supported hardware

| Variant   | Device                          | Resolution | Flash | Firmware                                                                 |
|-----------|---------------------------------|------------|-------|---------------------------------------------------------------------------|
| `panels3` | Guition **ESP32-S3-4848S040** (4") | 480 × 480 (ST7701S RGB, GT911 touch) | 16 MB + 8 MB PSRAM | [firmware/](firmware/) |

Audio on this board can be wired through an **NS4168 I²S amplifier**:

| Signal | GPIO |
|---|---|
| BCLK — bit clock | GPIO 1 |
| LRCLK / WS — channel select | GPIO 2 |
| DIN / SDATA — audio data | GPIO 40 |

The source tree also still supports the upstream `panel4` and `panel10` variants
(see [release-notes.md](release-notes.md)), but this fork's custom features and the
ready-built binaries target `panels3`.

---

## Main features (inherited from upstream)

- **Live Home Assistant link** — WebSocket connection with REST fallback for forecasts and long-poll states.
- **On-device editor** — BETTA Editor in the browser at `http://<panel-ip>`; drag-and-drop widgets, multi-page layouts, room-grouped entity picker.
- **Widget library** — sensor, button, slider, graph, light, heating, weather, up to 5-day forecast, media player, todo list, Roborock, energy dashboard, empty tile.
- **Advanced light control** — brightness, color temperature, RGB — exposed only when Home Assistant reports the capability.
- **Energy dashboard** — automatic grid / solar / battery / gas / water visualization from the HA energy model.
- **Graphs** — line, smoothed line, or bar-chart modes; event-rate sampling up to 4096 points.
- **First-run provisioning** — `BETTA-Setup` Wi-Fi AP, guided Wi-Fi + Home Assistant setup, Quick Setup starter dashboard.
- **OTA updates** — upload an `.ota.bin` or an OTA URL from the web editor.
- **Multilingual** — built-in languages plus custom translation JSON upload/download.
- **Touch-friendly UX** — auto-dimming backlight after idle, pointer-capture drag/resize, stable GT911 touch startup.

---

## Getting started

1. **Flash** the factory image — see [firmware/README.md](firmware/README.md) for full
   instructions (single-file or four-file method).
2. **Reboot** the device. It opens a Wi-Fi AP called `BETTA-Setup`.
3. Connect to `BETTA-Setup`, open `http://192.168.4.1`, pick your country, scan for
   your network and save.
4. After reboot the panel joins your LAN. Open its IP in a browser, link Home Assistant
   via a long-lived access token, and build your first page with **Quick Setup**.

> ⚠️ **No personal data is compiled into the firmware.** Wi-Fi credentials, Home Assistant
> URL/token and MQTT credentials are entered only through the web UI and stored on the
> device (NVS / LittleFS). Do not publish your own `sdkconfig` overlays.

Future updates install via OTA from the editor — no cable needed.

---

## Building from source

Prerequisites:

- **ESP-IDF v5.5** (tested with v5.5.5), Python 3.11+
- Internet access on first build (the component manager downloads `lvgl`, `esp_lvgl_port`,
  `esp_lcd_st7701`, `esp_lcd_touch_gt911`, `littlefs`, `esp_websocket_client`, etc.)

```powershell
# Guition ESP32-S3-4848S040 (panels3) — the variant this fork targets:
idf.py -B build-panels3 -DSDKCONFIG_DEFAULTS="sdkconfig.defaults.s3;sdkconfig.defaults.panels3" build
```

> The top-level `CMakeLists.txt` infers the panel variant from `SDKCONFIG_DEFAULTS` and
> materialises `main/idf_component.yml` from `main/idf_component.panels3.yml` on every
> configure — you never edit `main/idf_component.yml` by hand.

Other upstream variants (unchanged from BETTA v0.8.2):

```powershell
idf.py -B build-panel4  -DSDKCONFIG_DEFAULTS="sdkconfig.defaults;sdkconfig.defaults.panel4"  build
idf.py -B build-panel10 -DSDKCONFIG_DEFAULTS="sdkconfig.defaults;sdkconfig.defaults.panel10" build
```

Build artifacts for `panels3` land in `build-panels3/` (`betta-ha-panel-s3.bin` +
bootloader / partition table / OTA data). To repackage the merged factory image, see
[tools/make_factory_bin.ps1](tools/make_factory_bin.ps1).

The web UI is gzipped by the build itself
([components/webui/tools/gzip_asset.py](components/webui/tools/gzip_asset.py), level 9,
`mtime=0` for reproducible output) and embedded as a binary blob — no manual step needed.

---

## Flash and performance budget

| Item | Before | After |
|---|---|---|
| Web UI assets (uncompressed) | 623 152 B | 121 750 B (gzip, −501 402 B) |
| Application image | 3 718 688 B | 3 235 984 B (−482 704 B) |
| Free space on the app partition | 475 616 B (11.3 %) | 958 320 B (22.9 %) |
| Compiler optimisation | `-Og` | `-O2` (`CONFIG_COMPILER_OPTIMIZATION_PERF=y`) |
| `GET /api/diagnostics` | 53.9 ms | 34.9 ms |
| `GET /api/entities` | 43.3 ms | 30.6 ms |
| `GET /api/layout` | 69.1 ms | 31.2 ms |
| Layout rebuild in the UI | 628–660 ms | 401 ms |
| `/app.js` over the network | 623 kB | 103 kB |

Memory, after the task stacks and the LVGL allocator were moved to PSRAM:

| Metric | Before | After |
|---|---|---|
| `heap_free` (internal) | 23 595 B | 96 571 B |
| Largest free block | 10 752 B | 47 104 B |
| `lvgl.fail_count` | 0 | 0 |

---

## Web editor sections

On the Guition S3 build, **Live Display** mirrors the actual LCD pixels and provides optional
remote mouse/touch control and native-resolution PNG download. Physical touch has priority.
The feature is modular and can be disabled with `CONFIG_APP_REMOTE_DISPLAY`.
See [Live Display usage, architecture and validation](REMOTE_DISPLAY.md).

The editor has a **Layout** tab and a **Settings** tab with 15 sections:

Wi-Fi · Home Assistant · Time (clock format & style) · Display & screensaver ·
microSD card · Pages (page look, wallpaper, per-page theme) · MQTT · UI (top/bottom bar) ·
Theme (day/night, custom themes) · Setup AP · Firmware update · System (auto-restart) ·
Backup & restore · Diagnostics · Logs.

Every new control is available in **English and Polish**.

---

## Tile (widget) library

| Type | Purpose |
|---|---|
| `sensor` | numeric/text sensor value |
| `button` | switch / button / power status with icon styles |
| `slider` | generic slider (light, media player, cover, …) |
| `graph` | line / smoothed / bar history graph |
| `light_tile` | light with brightness, colour temperature, RGB |
| `heating_tile` | climate / heating |
| `weather_tile`, `weather_3day` | current weather and forecast |
| `media_player` | player with cover art and volume |
| `binary_sensor` | door / window / motion / smoke / water |
| `todo_list` | to-do list |
| `roborock_tile` | vacuum |
| `empty_tile` | spacer / decoration |
| `alarm_tile` | alarm panel, Alarmo-aware |
| `clock_alarm` | plain clock (time + date) |
| `cover_tile` | blinds / shutters: open, stop, close, position in % |
| `scene_tile` | Home Assistant scenes |
| `person_tile` | people presence |
| `timer_tile` | countdown timer |

---

## HTTP API

Beyond the upstream endpoints, this fork adds:

| Method | URI | Purpose |
|---|---|---|
| `GET`/`PUT` | `/api/settings` | all settings (send `"reboot": false` to apply live) |
| `GET`/`PUT` | `/api/layout` | full layout read/write |
| `GET` | `/api/version` | firmware/version info |
| `GET` | `/api/screenshot.bmp` | 480×480 frame of the current screen |
| `POST` | `/api/display/activity` | wake the display / reset the idle timer |
| `POST`/`DELETE` | `/api/display/wallpaper` | upload or delete the screensaver wallpaper |
| `GET` | `/api/pages`, `POST /api/pages/activate` | list pages / activate one |
| `GET` | `/api/themes`, `/api/themes/active`, `/api/themes/get`, `/api/themes/custom` | built-in, active and custom themes |
| `GET` | `/api/backup`, `POST /api/backup/restore` | full configuration export/import (no secrets) |
| `GET` | `/api/diagnostics` | memory pools, link stats, boot guard, missing entities |
| `GET`/`DELETE` | `/api/logs` | ring-buffer system log |
| `GET` | `/api/ota/status`, `POST /api/ota/url`, `POST /api/ota/upload` | OTA by URL or upload, with rollback |
| `GET`/`PUT` | `/api/sd`, `POST /api/sd/format`, `GET /api/sd/files`, `GET|DELETE /api/sd/file`, `POST /api/sd/logs/export` | microSD management and log export |
| `GET` | `/api/state`, `/api/entities`, `/api/ha/energy`, `/api/ha/diagnostics`, `/api/ha/light_entities` | Home Assistant data |
| `GET` | `/api/wifi/scan` | Wi-Fi scan |
| `GET`/`POST` | `/api/i18n/languages`, `/api/i18n/effective`, `/api/i18n/custom` | translations |

---

## MQTT command keys

The MQTT client keeps Home Assistant auto-discovery and adds these command keys:

`wake`, `page`, `screensaver_enabled`, `screen_off_enabled`, `clock_24h`,
`saver_show_seconds`, `saver_show_date`, `topbar_show_clock`, `topbar_show_date`,
`topbar_show_gear`, `topbar_show_status`, `topbar_icon_text`, `topbar_custom_colors`,
`brightness`, `saver_brightness`, `screensaver_timeout_sec`, `screen_off_timeout_sec`,
`page_transition`, `page_transition_ms`, `tile_press_fx`, `tile_press_fx_dim`,
`tile_press_fx_scale`, `value_anim`, `value_anim_ms`.

---

## Notes and gotchas

- **`PUT /api/settings` reboots by default.** The handler's `reboot` argument defaults to
  `true`; pass `"reboot": false` to apply display/page/animation/bar/theme/MQTT changes
  immediately. Useful to know when scripting the panel.
- **`/api/screenshot.bmp`** returns a frame only while the display is awake; there is no
  endpoint that forces the screensaver on, so take a frame after the screensaver timeout
  has elapsed.
- **Asset URLs carry no version suffix** and are served with `Cache-Control: no-store`, so
  a browser reload always picks up the new web UI after an OTA.
- **gzip**: the panel serves pre-compressed assets; browsers must send
  `Accept-Encoding: gzip` (all modern ones do).
- **Parallel-page rendering** is not used: only the incoming page animates during a page
  transition, which keeps CPU load flat.
- The panel shares IO47/IO48 between the display bus and the microSD card, therefore the
  card is mounted only **after** `display_init()`.

---

## Project structure

```
.
├── main/                  # Panel application (C, LVGL)
│   ├── api/               #   HTTP API: settings, layout, backup, diagnostics, sd, ota, themes
│   ├── diag/              #   system log, boot guard
│   ├── drivers/           #   display (panels3) + touch init
│   ├── ha/                #   Home Assistant client, Alarmo events
│   ├── layout/            #   layout model + validation
│   ├── mqtt/              #   MQTT client + HA discovery
│   ├── net/               #   Wi-Fi manager (stats, reconnect, static IP)
│   ├── sd/                #   microSD card + log export
│   ├── settings/          #   runtime settings (NVS), i18n store
│   └── ui/                #   LVGL screens, widgets, themes, animations, fonts
│       ├── theme/         #     theme palettes, theme router
│       └── widgets/       #     tile implementations (w_*.c)
├── components/webui/      # Web editor (BETTA Editor) served by the panel
│   ├── www/               #   index.html, app.js, styles.css
│   └── tools/             #   gzip_asset.py (build-time compression)
├── firmware/              # Ready-to-flash .bin files (panels3) + flash instructions
├── images/screenshots/    # Panel and web-editor screenshots
├── partitions.s3.csv      # Partition table for the 16 MB S3 flash
├── sdkconfig.defaults.s3  # } Clean, credential-free build configs
├── sdkconfig.defaults.panels3
└── LICENSE                # FNCL v1.1 (Copyright (c) 2026 Cpt_Kirk)
```

---

## Privacy — no personal data in this repository

- Wi-Fi SSID/password, the Home Assistant URL and token, the MQTT broker address and
  credentials are **configuration only**; nothing is compiled in and nothing is stored in
  this repository.
- All Wi-Fi/MQTT/HA fields in the web editor show generic placeholders
  (`homeassistant.local`, `192.168.1.50`, …).
- The backups produced by `GET /api/backup` **never contain secrets**.
- Screenshots published here were taken with credentials, IP addresses, hostnames and
  tokens masked out.

---

## License

- Source released under [LicenseRef-FNCL-1.1](LICENSE) — **Copyright (c) 2026 Cpt_Kirk**.
- **Non-commercial only.** Commercial use requires a separate written license from the
  copyright holder (see §4 and §11 of the license).
- This is a **modified version** of BETTA HA Panel v0.8.2; changes are marked and
  described above. See [release-notes.md](release-notes.md) for upstream per-version
  history.
