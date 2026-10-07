# Timezone database

Source: https://github.com/nayarsystems/posix_tz_db/blob/master/zones.json

Downloaded 2026-09-23 together with the upstream MIT LICENSE.
SHA-256 of zones.json:
`b95662f059d0bf1408962272cb98da4820fa0e20c7582e0aca1d0613e33986ef`

`zones.json` is the source of truth; run `python tools/generate_timezones.py`
after updating it. Commit both JSON and generated `zones.inc`. Firmware uses
the const table directly without parsing JSON or fetching external resources.
The existing settings API supplies the same names to the web editor.

These are recurring POSIX rules, not a full historical IANA database. Update
the snapshot when regional rules change. Multiple names intentionally share
rules; the selected name must never be inferred from the rules alone.
