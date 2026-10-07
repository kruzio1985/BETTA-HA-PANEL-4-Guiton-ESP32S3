"""Compile-check the remote feature's disabled paths using an existing IDF build.

Usage: python tools/check_remote_disabled.py build-panels3
Does not modify sdkconfig, firmware objects, or the linked image.
"""
import json
import os
from pathlib import Path
import shlex
import subprocess
import sys

build = Path(sys.argv[1] if len(sys.argv) > 1 else "build-panels3").resolve()
header = build / "remote_disabled_check.h"
header.write_text('#include "sdkconfig.h"\n#undef CONFIG_APP_REMOTE_DISPLAY\n'
                  '#undef CONFIG_HTTPD_WS_SUPPORT\n#undef CONFIG_HTTPD_WS_PRE_HANDSHAKE_CB_SUPPORT\n'
                  '#undef CONFIG_HTTPD_WS_POST_HANDSHAKE_CB_SUPPORT\n')
names = {"ui_remote_display.c", "api_remote_display.c", "api_version.c", "http_server.c", "api_ota.c", "app_main.c"}
checked = set()
for entry in json.loads((build / "compile_commands.json").read_text()):
    name = Path(entry["file"]).name
    if name not in names:
        continue
    command = entry["command"]
    if os.name == "nt":
        command += ' -include "' + str(header) + '" -fsyntax-only'
    else:
        command = shlex.split(command) + ["-include", str(header), "-fsyntax-only"]
    result = subprocess.run(command, cwd=entry["directory"], capture_output=True, text=True)
    print(name + ": " + ("PASS" if result.returncode == 0 else "FAIL"))
    if result.returncode:
        print(result.stderr)
        raise SystemExit(result.returncode)
    checked.add(name)
if checked != names:
    raise SystemExit("Missing compile commands for: " + ", ".join(sorted(names - checked)))
