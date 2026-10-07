# Live LCD mirror and remote touch: implementation plan

Date: 2026-09-23. Reviewed repository HEAD: `4c8e40e`.
Status: research and planning only; no firmware or web behavior changed.

## 1. Scope and intended result

Add a **Live Display** tab beside **Layout** and **Settings** in the existing web editor. Show the pixels rendered by the device's existing LVGL display on a browser canvas, and optionally send browser pointer events back through a **second LVGL pointer input device** attached to that same display.

This is a small application-specific remote display protocol over WebSocket, not VNC/RFB. The physical LCD remains authoritative. Existing widgets, Home Assistant actions, page transitions, themes, editor layout, touch driver, brightness, screensaver, and display timing retain their behavior. No duplicate browser implementation of the panel widgets is needed.

The immediate implementation target is the Guition ESP32-S3 480×480 board. Other board variants must still build and behave as before; enabling their remote capture requires separate stride/rotation and memory validation.

“Synchronized” means the browser converges to the same rendered pixel content with bounded network latency. It does not mean identical LCD scan timing or brightness: the backlight is hardware state, not framebuffer pixels. A view-only connection must not wake the panel or suppress its screensaver. Accepted remote presses should follow the existing physical-touch activity behavior.

## 2. Current codebase findings

| Area | Evidence in this repository | Implementation consequence |
| --- | --- | --- |
| Dependencies | `dependencies.lock`: ESP-IDF 5.5.5, LVGL 9.6.0, esp_lvgl_port 2.9.0. S3 manifest permits IDF >=5.5 and LVGL ^9. | Use the installed LVGL 9 API, not LVGL 6/8 examples. Revalidate capture when dependencies change. |
| Display | `main/drivers/display_init_panels3.c`, `lvgl_display_add()`: RGB565, `direct_mode=false`, `full_refresh=true`, RGB `avoid_tearing=true`, `bb_mode=true`; two physical PSRAM framebuffers. | Preserve these flags. Comments explicitly associate direct mode with stale bright columns. |
| Display completion | `managed_components/espressif__esp_lvgl_port/src/lvgl9/esp_lvgl_port_disp.c`, `lvgl_port_flush_callback()`: submits RGB framebuffer, waits on transfer semaphore, calls flush-ready. | The original callback must remain the sole owner of LCD submission and completion. |
| LVGL invalidation | `managed_components/lvgl__lvgl/src/core/lv_refr.c`, around lines 320–328: FULL mode expands to the whole screen and returns **before** `LV_EVENT_INVALIDATE_AREA`. | An INVALIDATE_AREA listener alone cannot obtain original dirty rectangles on this board. |
| Capture APIs | Installed `lv_display.c` exposes `lv_display_get_flush_cb()`, `lv_display_set_flush_cb()`, and `lv_display_get_buf_active()`. | A project-owned flush wrapper can preserve the existing callback and inspect the active draw buffer's stride without private structure access. |
| Physical input | `main/drivers/touch_init_panels3.c`: GT911 through `lvgl_port_add_touch()`, timer polling, pressed event calls `display_note_activity()`. | Add a separate software indev; retain GT911 reads and settings. |
| Threading | `display_lock()` / `display_unlock()` wrap esp_lvgl_port locking. `main/ui/ui_runtime.c` owns runtime UI work. | Network callbacks enqueue input; LVGL reads and UI changes execute under its existing serialization. |
| Startup | `main/app_main.c`: display starts before HTTP; touch/runtime initialization occurs later. | Endpoint needs a not-ready state; attach capture/input only after the real UI is ready. |
| Existing screenshot | `main/api/api_screenshot.c`: `lv_snapshot_take(lv_screen_active(), RGB888)`, then BMP transfer. | Keep API unchanged. It is an object snapshot, not the final flushed display including every overlay; do not poll it for live mirroring. |
| HTTP resources | `main/api/http_server.c`: 48 URI slots; S3 has four client sockets, LRU purge enabled, ten-second send/receive timeouts. | Account for a persistent socket and ensure a slow viewer cannot stall normal editor requests. |
| WebSocket support | Checked-in `sdkconfig` has `CONFIG_HTTPD_WS_SUPPORT` disabled. | Enable deliberately in the relevant defaults and actual target config; changing defaults alone may not update existing configs. |
| Request guard | `main/api/http_guard.c` provides concurrency and rate limits, not user authentication. Existing APIs use permissive CORS headers. | Guard handshake separately from high-frequency WS input. Do not mistake CORS or the rate guard for access control. |
| Editor | `components/webui/www/app.js`, `setActivePane()`, assumes two panes; Layout uses a design canvas. | Add an explicit third pane and an independent live canvas without changing layout editing state. |
| Asset pipeline | `components/webui/CMakeLists.txt` gzips and embeds exactly index.html, app.js, styles.css. | Keep initial implementation within these assets, or explicitly extend embedding and HTTP routes for any new asset. |
| Variants | `main/CMakeLists.txt` selects one display/touch pair; `CMakePresets.json` has panels3, panel4, panel10. | Feature code must compile out cleanly and not force S3 assumptions into other drivers. |

Review focus was the display/input/rendering path, startup, HTTP infrastructure, editor integration, and build configuration. This is not a claim that every widget or all existing code has received an exhaustive correctness audit. No device measurements were performed.

## 3. Three relevant GitHub reference projects

These are the top three selected **by architectural relevance**, not a claim of the three highest GitHub star counts. Research used repository documentation and, where available, implementation source. They were not built or benchmarked here.

| Project | Verified approach | What to adopt | What does not fit |
| --- | --- | --- | --- |
| [danjulio/lv_port_esp32_web](https://github.com/danjulio/lv_port_esp32_web) | LVGL refresh regions travel over WebSocket to a browser canvas; browser touch/mouse coordinates return to the device. Reinitializes a new viewer by invalidating the screen. | Browser canvas, binary region messages, explicit initial refresh. | Based on LVGL 6 and older IDF; its modified WebSocket implementation and multi-controller behavior should not be transplanted. |
| [CubeCoders/LVGLRemoteServer](https://github.com/CubeCoders/LVGLRemoteServer), [RemoteDisplay.cpp](https://github.com/CubeCoders/LVGLRemoteServer/blob/main/RemoteDisplay.cpp) | LVGL 9 remote display using RGB565, UDP and RLE, with simulated touch. Documents a fixed-memory design and desktop client. | Compact RGB565, bounded memory, optional RLE and a capture seam alongside physical flush. | UDP and Windows client do not meet the embedded browser requirement. Direct transmission in a flush example is not an acceptable latency model here. |
| [strange-v/RemoteWebViewServer](https://github.com/strange-v/RemoteWebViewServer) | Streams changed image tiles over WebSocket, merges tiles, throttles frames, supports full refresh and down/move/up input. | Change detection, message limits, resynchronization, and no encoding work without viewers. | Rendering direction is reversed: Chromium renders for an ESP32 client. Do not add Chromium, Docker, JPEG loss, or a separate server to this firmware. |

The combined recommendation is the browser transport from the first project, compact/bounded representation from the second, and recovery/backpressure principles from the third. These are design references, not dependencies. Any copied code requires checking that specific file's license and preserving its notices; this repository retains its existing license.

Supporting primary reference: [ESP-IDF 5.5 HTTP server documentation](https://docs.espressif.com/projects/esp-idf/en/v5.5/esp32s3/api-reference/protocols/esp_http_server.html) documents enabling WebSockets, session contexts and server lifecycle. Exact LVGL behavior above was checked against the locally installed dependency source, which is more specific than current online examples.

## 4. Resolve the dirty-region constraint before coding

There are two meanings of dirty regions that must remain explicit:

1. **LVGL flush regions:** these are available through the existing flush callback, but on this S3 configuration they cover the full screen.
2. **Original LVGL object invalidation regions:** FULL mode discards their specificity before emitting the usual invalidation event.

### Recommended baseline: flush-driven capture plus exact pixel differencing

Keep FULL rendering. Capture completed rendered pixels at the flush boundary, then compare 32×32 tiles with the last acknowledged browser image. Send only changed tiles, optionally merged into rectangles. This uses LVGL's actual flush output and produces dirty-region transmission without changing physical rendering. It is **not** direct access to the original LVGL invalidation list.

For partial-rendering variants, the flush area naturally bounds the candidate changes. For S3, compare the full captured image off the LVGL task. Use byte comparison for correctness; hashes may be an accelerator only if equal hashes are also verified or periodic recovery is explicitly accepted. Do not silently rely on hash collisions never happening.

### Exact LVGL invalidation tracking, if required literally

If acceptance requires the original LVGL dirty rectangles rather than derived pixel-difference rectangles, add a separately maintained, version-pinned LVGL observer extension before FULL-mode expansion. It must report the clipped original rectangle through a new read-only callback/event, preserve all original invalidation and full-refresh behavior, and accumulate dirty regions until successfully captured. Existing INVALIDATE_AREA semantics must not be moved or changed for other listeners.

Package that extension as a reproducible dependency override/patch with an application check and tests; never hand-edit generated `managed_components` as the delivery mechanism. Region overflow becomes whole-screen dirty. Force whole-screen capture on initial connection, resync, resolution/rotation change, and uncertain coverage. Check transitions, top/system layers, shadows and screen replacement for full coverage.

This extension increases dependency maintenance and must be identified as such in the implementation PR. The baseline is recommended for the user's preservation constraint; it must not be described as exact LVGL invalidation tracking. Both options share the transport/input architecture below.

## 5. Proposed architecture

```text
Existing LVGL widgets -> existing display flush wrapper -> original port callback -> LCD
                                  |
                          owned RGB565 capture
                                  |
                    worker: compare / encode / throttle
                                  |
                       bounded WebSocket delivery
                                  |
                        Live Display canvas

Browser pointer -> validated session input queue -> second LVGL pointer indev
                                                     |
                                              existing widgets
GT911 physical indev ---------------------------------+
```

### Capture and lifetime

- Attach under `display_lock()` after runtime initialization. Store the existing callback using the installed public getter; do not overwrite driver/user data owned by esp_lvgl_port.
- Wrapper performs only a bounded copy to an owned, preallocated slot and then calls the original callback exactly once. Never call flush-ready itself. Never allocate, compress, send network data, or wait for a worker inside the wrapper.
- Copy before delegation, while the source pixels belong to this flush. Do not enqueue pointers to LVGL draw buffers or LCD DMA buffers: they will be reused. Read actual stride and render mode; FULL uses framebuffer coordinates, PARTIAL uses the supplied region's buffer layout.
- Publish a capture to the worker only after the original S3 callback returns, because that path waits for physical transfer completion. Verify this assumption separately on other drivers; `FLUSH_FINISH` in general is not a universal hardware-present signal.
- Use slot states such as FREE, COPYING, READY, SENDING. A worker must never read a slot being written. The capture hook skips when no free slot exists and records a pending refresh obligation.
- Initial implementation permits one immutable pending capture plus one acknowledged baseline. While a capture is in flight, skip later captures without blocking LCD rendering. Once ACK arrives, schedule one full invalidation on the LVGL side if anything was skipped, so the last change cannot be lost merely because the UI became idle.
- Request initial/resync redraw through LVGL, including full screen and overlay coverage. Do not continuously force redraws while disconnected. On detach, serialize hook removal and drain outstanding references before freeing memory.

### Transport and flow control

Proposed endpoint: `/api/display/remote`, upgraded to WebSocket on the existing HTTP server. Start with one connected viewer/controller total to respect the four-socket S3 budget. Additional connections receive an explicit busy response.

Enable `CONFIG_HTTPD_WS_SUPPORT`. Review actual registered URI count and leave headroom; do not merely assume one extra route fits. Ensure the new persistent connection does not consume the request guard's active-request slot for its whole lifetime.

Use a dedicated encoder worker with priority below LVGL. Serialize all WebSocket sends for a session using the IDF-supported mechanism. `httpd_ws_send_frame_async` must not be assumed to be a nonblocking queue simply because of its name: verify the installed implementation, payload lifetime and send context. Queue at most one small send work item at a time; yield to ordinary HTTP requests between chunks. Apply a bounded send timeout to this session, and close a slow client instead of blocking the server for the existing ten seconds. Do not change unrelated endpoints' timeout behavior.

A session identity consists of a generation token plus socket; validate both before every queued operation to prevent file-descriptor reuse from targeting a different client. Server stop, Wi-Fi loss, LRU purge and OTA release control and cancel queued work before freeing payloads.

### Version 1 protocol contract

Use small JSON control messages and binary pixel rectangles. Define all integer fields explicitly; do not send native C structs with padding.

| Message | Required fields / behavior |
| --- | --- |
| `hello` | Protocol version, session epoch, logical width/height, rotation, RGB565 little-endian format, max payload, control capability. |
| `frame_begin` | Epoch, monotonic sequence, base sequence, keyframe flag, rectangle count. Only one unacknowledged frame. |
| Binary rectangle | Fixed header: magic (u32), version (u8), encoding (u8), header length (u16), epoch (u32), frame sequence (u32), rectangle index (u16), x/y/w/h (four u16 fields), payload length (u32). |
| `frame_end` / `ack` | End identifies complete sequence; browser ACKs only after validating and applying the whole frame. |
| `resync` | Discard partial frame, reset baseline and send a complete keyframe. |
| `control_acquire/release` | Explicit per-session ownership, separate from view subscription. |
| `pointer` | Epoch, input sequence, type (down/move/up/cancel), pointer id and logical integer x/y. |
| heartbeat / status | Keepalive, control state, paused/not-ready/busy/error; no fabricated frames. |

The binary header is 30 bytes, with all multibyte fields little-endian. Finalize this into shared fixtures before implementation. Raw payload is exactly `w*h*2`; validate with overflow-safe arithmetic, nonzero sizes and screen bounds. LVGL inclusive endpoints convert to width=`x2-x1+1`, height=`y2-y1+1`.

Start with RAW RGB565, 8 KiB maximum pixel payload per rectangle message, and split large rectangles into stripes. Optionally negotiate RLE later; use raw whenever RLE is larger. No JPEG is needed for faithful UI text/colors. Do not enable WebSocket compression without a measured memory justification.

Browser stages patches in an offscreen canvas and commits after a valid frame_end. It rejects unknown versions, epochs, bad lengths, missing rectangles or incorrect base sequence and requests resync. ACKed baseline advances only after the entire frame is committed. A socket failure drops the baseline. TCP ordering does not eliminate application queue loss or partial frame handling.

Start with a configurable 5 Hz capture ceiling and measure before increasing it. No image traffic for identical pixels; heartbeat traffic is separate. A slow viewer reduces the remote frame rate while the LCD continues normally. ACK timeout should terminate/resync the session rather than retain memory indefinitely.

## 6. Remote touch as a second LVGL input device

Create with `lv_indev_create()`, set `LV_INDEV_TYPE_POINTER`, bind to the existing display using `lv_indev_set_display()`, and install a software read callback. Keep its lifetime within the LVGL lock/context. Leave the GT911 device registered and unchanged.

Network callbacks validate messages and enqueue bounded events only. Preserve down/up ordering, including fast taps between two polling ticks. A latest-state-only mailbox would lose these taps. Coalesce only consecutive moves of the same active pointer; never overwrite an edge. Drain through the LVGL read callback with `continue_reading` as appropriate, with a bounded amount of work per cycle. Queue overflow cancels/releases remote input and requires a new down.

Use browser Pointer Events and `setPointerCapture()`. Set `touch-action:none` only on the live surface. Handle pointerup, pointercancel, lost capture, window blur, tab hide, tab exit and socket close. Reject extra simultaneous pointers; version 1 supports one pointer. Throttle moves around 30 Hz and preserve the final position before up.

Map the actual displayed image rectangle, excluding letterboxing:

```text
x = floor((clientX - imageLeft) * logicalWidth / imageCSSWidth)
y = floor((clientY - imageTop)  * logicalHeight / imageCSSHeight)
```

Clamp an already captured drag at the image boundary; reject initial down outside it. CSS zoom, devicePixelRatio and optional fullscreen must not alter logical coordinates. Use advertised logical orientation once; do not reapply GT911's hardware transform to browser coordinates.

Attach the same pressed-activity behavior used by physical touch (`display_note_activity()`). Mirror viewing/heartbeats do not count as activity. Verify wake and screensaver first-press behavior on hardware rather than implementing a separate browser wake action that may double-trigger a widget.

Physical input has priority during a collision: cancel/reset the remote indev when physical interaction begins, reject remote down while physical contact persists, and require a fresh remote down after release. Observe physical input state/events without changing its read callback or calibration. Test LVGL reset/release ordering to avoid a canceled remote press becoming an unintended click.

A periodic session heartbeat maintains a held remote press, including a stationary long press. On connection loss, control release or a missed-heartbeat lease (initial target: one second), reset/release only the remote indev. Remote pointer events must go through widgets and existing HA services; do not duplicate service calls in the HTTP handler.

## 7. Web editor integration

- Add Live Display navigation using the existing tab style, spacing and responsive structure. Preserve initial Layout selection and unsaved editor data.
- Refactor `setActivePane()` from its current layout-vs-settings boolean into explicit layout/settings/live branches. Retain settings loading, diagnostic/log/OTA polling and layout redraw behavior in their respective branches.
- Give the live view its own canvas and controller state. Controls: Connect/Disconnect, Enable control, Fit/Actual size, and connection/status text. Control defaults off on every connection.
- Entering the tab may connect for viewing; leaving or hiding the document sends cancel/release and disconnects. Returning requires a new keyframe. Reconnect with capped exponential backoff only while visible.
- Render RGB565 to opaque RGBA with explicitly tested byte order and channel expansion. Maintain native canvas resolution, scale through CSS, and preserve aspect ratio.
- Add translations through the existing catalog workflow, including the repository's Chinese catalogs and established fallback behavior; verify all currently supported languages. No change to existing Layout preview rendering.
- Show unsupported/not-ready/low-memory/OTA-paused states within the new pane. Failure must not prevent Layout or Settings from working.

## 8. Resource and access boundaries

At 480×480, one RGB565 frame is 460,800 bytes (450 KiB). Two additional owned buffers total 921,600 bytes (900 KiB) beyond the existing LCD buffers. A 32×32 grid is 15×15=225 tiles. Two 8 KiB transfer buffers add 16 KiB, plus bounded metadata, task stack and socket overhead. These are calculations, not measured availability.

Allocate large captures from PSRAM on first subscription; check largest free block as well as total free memory and retain a safety reserve established from real layout/wallpaper/HA/OTA workloads. Keep large buffers off the stack. On allocation failure, disable the live session cleanly; never steal LCD buffers or force a reboot. Free after session teardown. Do not allocate any capture buffers or run an encoder when there are no viewers.

Uncompressed full-frame traffic is 2,304,000 bytes/s at 5 Hz, approximately 18.4 Mbit/s before network overhead. Dirty rectangles are essential for mostly static dashboards, but animations can approach that worst case. Raw 32×32 tiles are 2,048 bytes each. Measure capture-copy time and PSRAM contention; remote streaming is expendable when it harms LCD behavior.

Keep the endpoint in the same local-network trust context as the editor. Require an exact allowed Origin/Host relationship and a short-lived unpredictable session token obtained through same-origin interaction; apply size/rate limits to input and reject unauthorized control. Validate the HTTP upgrade before accepting it. These measures limit cross-site misuse but **do not authenticate users** on a LAN, and tokens on plain HTTP do not provide encryption. Do not silently claim existing HTTP guard protection is authentication or expand this feature into a global authentication redesign.

Start with runtime-inactive streaming and control opt-in, plus a build-time disable option. Do not persist control ownership or add backup/config schema changes unless later explicitly needed. Suspend capture/control before OTA or destructive actions; preserve the existing OTA screens and behavior.

## 9. Proposed changes and sequence

| Phase | Files / work | Exit condition |
| --- | --- | --- |
| 0: baseline and spike | Record panel build configuration, heap/PSRAM, display timing and physical touch latency. Prototype wrapper locally with measured copy cost. Decide derived rectangles vs literal invalidation extension. | Full-refresh flags preserved; no callback ownership ambiguity; memory budget feasible. |
| 1: capture core | New `main/ui/ui_remote_display.c/.h`; small lifecycle calls in `app_main.c`; add sources in `main/CMakeLists.txt`. Add adapter hooks in display code only as required. | Correct full-frame capture, known stride/order, safe attach/detach, zero capture allocation while inactive. |
| 2: transport | New `main/api/api_remote_display.c/.h`, route registration and server-stop cleanup; new Kconfig option and appropriate sdkconfig defaults. | One viewer, bounded sends, protocol fixtures, keyframe/delta/ACK/resync, normal API responsiveness. |
| 3: view tab | Existing index.html/app.js/styles.css and translation catalogs. | Pixel-accurate live view, independent canvas, lifecycle cleanup, existing panes unchanged. |
| 4: software input | New `main/drivers/touch_remote.c/.h`; physical-activity observation where necessary. | Second indev verified; taps, drags, long presses, cancel, priority and wake behavior tested. |
| 5: hardening | Diagnostics counters, OTA/Wi-Fi cleanup, bounded resource tuning, optional RLE only after measurements. | Regression/performance checks below pass; faults affect only remote feature. |
| 6: release documentation | README feature/API notes, configuration switch and limitations. | Build-off path and target variants validated; measured results recorded. |

Useful counters: connected/control state, frames captured/sent/skipped, bytes, changed rectangles, capture time maximum/p95, queue high-water mark, ACK age, resync count, input cancellation and minimum heap/PSRAM. Do not log every pixel or pointer event in normal operation.

## 10. Verification and acceptance

### Host-side tests

1. Protocol fixtures: dimensions, RGB565 red/green/blue/white/black, endian conversion, padded source stride, inclusive endpoints and clipped edge rectangles. Malformed lengths and integer-overflow inputs are rejected.
2. Compare browser reconstructed frames against known reference buffers after overlapping patches, multiple chunks, missing chunk, wrong base, reconnect and resync. Compare complete frames, not merely the most recent tile.
3. Exercise slot ownership and ACK baseline transitions. Skip a final LCD update while network is busy, then leave the UI idle: the browser must still converge after the pending redraw.
4. Input tests: down/up within one polling period, move coalescing, queue overflow, multiple pointers, stale session, lease timeout and cancellation with no accidental click.
5. Web lifecycle tests: pane switching retains unsaved layout/settings state, clears remote listeners/socket, and preserves existing polling logic. Test coordinate mapping with letterboxing, scroll, CSS scaling and devicePixelRatio.

### Builds and hardware

- Build panels3 with the feature on and off using the existing preset/defaults workflow. Build panel4/panel10 with the feature off; enable their adapter only after separate hardware validation. Check firmware/app partition size and static/dynamic RAM changes.
- Test text, gradients, wallpaper, transparency, shadows, top bar, popups, Alarmo keypad, sliders, page transitions, clock/flip-clock, screensaver and OTA overlay. Compare actual flushed RGB565 against reconstructed browser frames; physical inspection catches LCD artifacts that a framebuffer comparison cannot.
- Verify physical touch with no viewer, view-only, active remote control and deliberate collisions. Exactly one normal HA action should result from one accepted gesture.
- Disconnect Wi-Fi mid-drag, close the browser mid-press, sleep the mobile browser, repeatedly reconnect, force slow reads, exhaust allocations, exercise LRU socket eviction, restart HTTP, and run OTA. No stuck press, use-after-free, permanent stale image, watchdog reset or blocked editor requests.
- Run at least a one-hour active soak and repeated connect/disconnect cycles with HA updates. Watch largest free blocks and fragmentation, not just total heap.

Initial engineering targets, to be confirmed or tuned from measured S3 results: at most 5 Hz remote capture; p95 accepted remote press-to-visible response below 250 ms on a healthy LAN; keyframe below 2 seconds on that LAN; no sustained heap loss; bounded remote release within the one-second lease; under 5% regression in measured physical UI/touch performance. Allocation/rendering overhead while inactive should be negligible. If active streaming misses the physical-performance budget, reduce capture rate or disable streaming rather than change LCD rendering flags.

This planning pass did not build firmware, flash a device, run these tests, or prove the targets. The only intended workspace change is this plan.

## 11. Decisions carried into implementation

Recommended first version: preserve the S3 full-refresh path, wrap its existing flush callback, derive exact changed tiles from owned RGB565 captures, send bounded WebSocket rectangles to a new Live Display tab, and receive browser pointer events through a second LVGL indev. Start with one viewer, explicit control, raw lossless pixels and no new persistent settings.

The unresolved requirement interpretation is narrow but material: **derived dirty rectangles satisfy efficient pixel mirroring, whereas exact pre-expansion LVGL dirty rectangles require the maintained LVGL observer extension described in section 4.** Do not switch to direct/partial rendering to hide this distinction. Settle that implementation choice before claiming literal dirty-list support.
