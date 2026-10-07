# Live Display

The Guition ESP32-S3 web editor now has a **Live Display** tab alongside Layout and Settings.

1. Open the device's existing HTTP web editor and select **Live Display**.
2. Wait for the first complete image. The default connection is view-only.
3. Check **Enable control** to click or drag the actual panel UI. Touch on a phone/tablet works through the same pointer path.
4. Select **Download PNG** to save the last completely received frame at the native 480×480 resolution. The timestamp identifies when that frame reached the browser. Hardware backlight dimming is not part of the image.
5. Leaving the tab, hiding the browser, or selecting **Disconnect** releases remote control and closes the session. Reconnecting starts with a full image and control disabled.

Only one browser session is supported. Physical touch takes priority and cancels any overlapping remote gesture. Viewing does not wake the screen; accepted remote presses use the existing touch activity callback. Existing Home Assistant widget actions run through LVGL, without a second browser-side implementation.

## Known limitations observed on hardware

After flashing the firmware with the handshake fix, the user confirmed that **Live Display and remote control work with one web client**. The following limitations were reported during that hardware test:

- **Large display changes can take several seconds to synchronize.** The browser can lag behind the physical LCD when a large portion of the screen changes. The 5 Hz capture cap does not guarantee a 5 fps browser update rate.
- **Enable control can become unchecked during large display updates.** Remote control must then be enabled again after the browser view synchronizes. The cause of this observed control-state loss has not yet been diagnosed; it should not be assumed to be normal physical-touch arbitration.
- **Live Display may fail when multiple web clients are open simultaneously.** Only one active Live Display session is supported; an additional session can receive HTTP 409. The broader behavior with multiple editor clients open has not been isolated or validated. For now, use a single web client when viewing or controlling the display.

These findings document current behavior, not resolved issues or a latency guarantee.

## Build option

`CONFIG_APP_REMOTE_DISPLAY` is enabled by default for `APP_PANEL_VARIANT_S3_480`. It selects IDF WebSocket support and the pre-handshake validation callback. Disable **Example Configuration → Browser live display and remote touch (development)** in menuconfig for a production build. The feature is unavailable on other board variants until their capture adapters are validated.

With the option disabled, the capture/input implementation compiles to stubs: there is no flush hook, remote input device, capture allocation, or remote session route. `/api/version` advertises `remote_display:false`, and the editor retains its two original tabs. The small browser asset remains embedded.

## Implementation

- `main/ui/ui_remote_display.c`: LVGL synchronization, full-refresh capture, second pointer input device and physical-touch arbitration.
- `main/api/api_remote_display.c`: same-origin session creation, WebSocket protocol, tile comparison and acknowledged baseline.
- `components/webui/www/remote_display.js`: validated frame reconstruction, pointer capture, connection lifecycle, localization and PNG export.

The S3 display continues using its existing full-refresh, double-framebuffer RGB path, tear avoidance and bounce-buffer configuration. A wrapper copies RGB565 rows before the original port callback runs and publishes them after that callback completes. It never sends network data, compresses, allocates memory or calls flush-ready. The original callback still owns physical submission and completion.

Because LVGL 9.6 bypasses INVALIDATE_AREA in full-refresh mode, this implementation derives changed 32×32 regions by comparing actual flushed pixels. It does **not** patch LVGL or claim to retrieve pre-expansion object dirty rectangles. Both physical and browser UI use the same rendered output, including overlays.

The browser requests batches over WebSocket; each response is at most 16 KiB and the HTTP server returns to its loop between batches. This replaces the plan's optional encoder worker with bounded work on the existing HTTP task. Raw lossless RGB565 needs no compression worker or new task stack. One immutable capture is kept until a complete frame is acknowledged. Only acknowledged tiles update the baseline. A disconnect discards the baseline and the next connection receives a keyframe.

Capture is capped at 5 Hz. The actual browser frame rate depends on changed area and network round trips; full-screen animations cost more than small widget changes. When a frame is in flight, later changes are remembered and recaptured, including when the display becomes idle. No identical pixel rectangles are transmitted. A static connected view still exchanges small polling/heartbeat messages.

Connected memory cost: two 450 KiB RGB565 buffers plus a 16 KiB packet buffer in PSRAM, bounded session/input metadata, and IDF socket overhead. A 512 KiB PSRAM reserve is required in addition to these buffers. Allocations may still fail because of fragmentation; the feature then refuses the session without affecting the LCD. Disconnect frees the frame buffers and pauses the software input timer. No capture buffers or new FreeRTOS tasks exist without a viewer.

Input uses a 24-entry queue, preserves down/up edges, coalesces consecutive moves, and cancels on overflow. Physical input resets only the remote indev. Canceled controls receive PRESS_LOST rather than RELEASED/CLICKED, so existing sliders clear dragging state without a release action. A one-second heartbeat lease prevents a stuck remote press. OTA suspends capture/control; sessions close on their next message, and a failed OTA permits reconnecting.

## Protocol and access

`POST /api/display/remote/session` returns a one-use, 30-second random token after checking Origin against Host. `GET /api/display/remote?token=…` upgrades to WebSocket only after validating the token, Origin, availability and memory. Requests require direct same-origin HTTP access; HTTPS reverse-proxy origin rewriting is not configured by this feature.

Control messages use JSON: hello, frame, idle, begin, next, end, ack, control, pointer, ping/pong. Every browser message carries the connection epoch. Pointer messages also have a monotonically increasing input sequence. Raw pixel records have the plan's 30-byte little-endian header (`BDR1`, version, encoding, header length, epoch, sequence, rectangle index, x/y/w/h, payload length); a batch concatenates records. Reconnection is the version-1 resync mechanism.

Browser frames become visible only after all rectangles validate and end is received. An invalid frame, stale epoch or failed send closes/reconnects the session. A single session's socket send/receive timeout is 250 ms; other API timeouts are unchanged. Control and message rates are bounded. This remains a local-network developer feature: the existing editor has no user authentication, and same-origin tokens are not encryption or LAN user authentication.

The existing `/api/screenshot.bmp` endpoint is preserved. Live Display's PNG export uses the fully reconstructed flush image, so it also includes the display layers that an active-object snapshot may omit.

## Verification

Run browser unit/lifecycle checks without a device:

```sh
node tools/remote_display.test.cjs
node tools/remote_display_lifecycle.test.cjs
node tools/remote_display_handshake.test.cjs
node tools/timezone_web.test.mjs
node tools/i18n/translation_placeholders.test.mjs
```

Build the S3 firmware using the repository's normal ESP-IDF workflow. Once `compile_commands.json` exists, check disabled C paths without changing the active configuration:

```sh
python tools/check_remote_disabled.py build-panels3
```

The disabled-path check is a compiler syntax check of the six touched integration units with the feature and HTTP WebSocket macros undefined, not a full build for another board.

### Connection setup and HTTP 409

ESP-IDF 5.5 completes the WebSocket upgrade without invoking the ordinary URI handler. The protocol's initial `hello` must be sent from `ws_post_handshake_cb`; `APP_REMOTE_DISPLAY` selects `HTTPD_WS_POST_HANDSHAKE_CB_SUPPORT` for this purpose. The handshake regression test checks this source/configuration contract; it does not replace an on-device connection test.

An earlier implementation sent `hello` from an unreachable HTTP GET branch in the ordinary handler. The browser therefore timed out waiting for initialization, and reconnect attempts could receive HTTP 409 while the previous connection still owned the single viewer session. Rebuild with regenerated configuration (`idf.py -B build-panels3 reconfigure build`) and flash the corrected firmware. HTTP 409 remains intentional when another browser legitimately owns the live display session; close that viewer before reconnecting.

Verified during implementation: S3 firmware compilation/linking and app-partition fit; browser decoder and lifecycle tests; existing timezone/translation tests; browser integration against a local simulated WebSocket device, including pointer-generated image changes, native PNG download and state retention across Layout/Settings/Live Display.

User hardware testing after flashing the handshake fix confirmed basic single-client viewing and remote control, with the limitations recorded above. Further hardware validation remains required before treating this as production-tested: confirm LCD colors and overlay parity, physical/remote touch collisions, slider cancellation, long press, screensaver wake, Wi-Fi loss, OTA, slow clients, memory reserve under wallpaper/HA load and extended soak. The 5 Hz cap is not a measured throughput guarantee.
