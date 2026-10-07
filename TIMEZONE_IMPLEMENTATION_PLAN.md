# Human-readable timezone implementation

## Review

`runtime_settings.c` persists `time.timezone` (128-byte buffer) in `/littlefs/settings.json`.
`api_settings.c` reads/writes this field; `app.js` loads `/api/settings` and fills
the Time form. `app_main.c` applies the saved value at boot using
`time_sync_set_timezone`, which currently passes it directly to `setenv`/`tzset`.
The normal web save reboots. ESP libc still needs POSIX rules internally.

## Plan

1. Vendor the requested nayarsystems zones.json, its license and provenance.
   Generate a checked-in const C lookup table with a reproducible Python tool;
   avoid runtime JSON parsing, heap allocation and network dependencies.
2. Add strict `time_sync_set_tz(name)`, `time_sync_get_tz()` and lookup/list APIs.
   Preserve the old setter as a boot compatibility wrapper for saved POSIX values.
   Keep the exact selected geographical identifier; never reverse-map ambiguous
   legacy rules. Use Europe/Berlin for new build defaults.
3. Keep the settings schema unchanged. Return saved timezone, active timezone,
   and supported names through the existing settings GET. Reject changed unknown
   names before saving, but allow an unchanged legacy POSIX value. Apply a named
   timezone on successful non-reboot saves too. Normal Save + Reboot is unchanged.
4. Offer timezone name suggestions in the web editor with Africa/Ceuta as the
   example; populate from firmware on settings load and preserve legacy values.
   Update all bundled timezone labels and translation source catalogs.
5. Verify database/table consistency, representative DST/fixed-offset mappings,
   invalid-name behavior and setter/getter round trips, JS syntax and translations.
   Build ESP32-S3 firmware if the installed ESP-IDF toolchain is usable.

## Compatibility and limits

Old configured POSIX defaults and saved custom rules remain valid at boot and
can be kept unchanged. Once a named zone is selected, the exact name survives
save/reload/reboot. The database contains recurring POSIX rules, not historical
IANA transitions; future legal changes require updating the snapshot and firmware.
Device smoke test: select Africa/Ceuta, save/reboot, reopen Time, verify the name
and local clock; repeat with Asia/Shanghai and check rejection of an unknown name.

## Implementation and verification

Implemented the steps above. The firmware embeds the generated const table;
no CMake asset embedding or runtime filesystem dependency is needed. GET
`/api/settings` now includes `time.timezones` and `time.active_timezone` in
addition to the existing persisted `time.timezone`. PUT keeps the existing
schema and accepts names for changed timezone values, including the legacy
`time_tz` request field. Empty and unknown replacement values return HTTP 400.
Existing sdkconfig choices remain untouched; new Kconfig defaults use Europe/Berlin.

The standard editor Save + Reboot workflow remains in place. API clients using
`reboot: false` apply changed named timezones immediately after saving. The
setter itself applies only runtime state; persistence belongs to settings.

Passed: database/table consistency and representative zone checks (2 tests),
web timezone reload and legacy-value preservation (1 test), translation
placeholder regression suite (4 tests), and JavaScript syntax checking.
Commands:

```text
python tools/test_timezones.py
node --check components/webui/www/app.js
node --test --test-isolation=none tools/timezone_web.test.mjs tools/i18n/translation_placeholders.test.mjs
```

Device acceptance checks still needed: setter/getter round trips on the device,
HTTP rejection without changing saved state, reboot persistence, and local clock
behavior across DST transitions. No device was flashed by this implementation.

ESP-IDF 5.5.5 ESP32-S3 build passed using:

```text
idf.py -B build-panels3 -D "SDKCONFIG_DEFAULTS=sdkconfig.defaults.s3;sdkconfig.defaults.panels3" build
```

Output: `build-panels3/betta-ha-panel-s3.bin`, size `0x34fd80` bytes, with
17% free in the 4 MiB app partition. Existing LVGL deprecation warnings remain.

## Follow-up: searchable Time page and device clock

The initial native datalist still looked like a plain text field and exposed
legacy POSIX text. It has been replaced with an explicit searchable combobox,
dropdown arrow, case-insensitive substring matching, pointer selection,
Arrow Up/Down + Enter selection, Escape dismissal and no-results feedback.
Typing `shang` returns `Asia/Shanghai`. The selected identifier is kept separate
from the search query, so a partial search cannot be saved as a timezone.
Legacy values stay in the saved field until a location is selected; the visible
picker shows a preservation hint instead of editable POSIX text.

The Time page now displays Current local time and the active timezone. Settings
GET includes `clock_valid` and a local civil timestamp from device `localtime_r`.
`GET /api/settings?time_only=1` provides just clock status without loading the
settings file or allocating the full timezone list. The visible page polls this
every five seconds, ticks between samples using a monotonic browser timer, times
requests out after four seconds, and marks samples older than 15 seconds as
unavailable. The display uses device rules even for legacy POSIX settings and
does not substitute the browser's timezone. Selecting a new zone does not alter
the active device clock until settings are saved.

Verification: 5 timezone frontend tests, 4 translation regression tests and
2 database tests pass. Browser verification against the actual Time section,
CSS and picker functions with simulated device responses confirmed dropdown
opening, `shang` filtering, mouse/keyboard selection and clock ticking. Hardware
save/reboot and real SNTP checks remain pending. Web assets are embedded in the
firmware, so this update requires installing the rebuilt firmware, not merely
updating settings JSON.

Final follow-up firmware build passed: `build-panels3/betta-ha-panel-s3.bin`,
size `0x350a50` bytes, with 17% app partition space free. No device was flashed.
