// SPDX-License-Identifier: LicenseRef-FNCL-1.1
// Copyright (c) 2026 Cpt_Kirk
// Generates compact LVGL fallback fonts containing the glyphs used by the
// built-in Simplified and Traditional Chinese display catalogs.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const converter = process.env.LV_FONT_CONV || process.argv[2] || "lv_font_conv";
const sourceFont = path.join(
  root,
  "managed_components/lvgl__lvgl/scripts/generators/built_in_font/SourceHanSansSC-Normal.otf",
);
const outputDir = path.join(root, "main/ui/fonts");

function visitStrings(value, callback) {
  if (typeof value === "string") callback(value);
  else if (value && typeof value === "object") Object.values(value).forEach((child) => visitStrings(child, callback));
}

const glyphs = new Set();
for (const code of ["zh-cn", "zh-tw"]) {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, `main/i18n/${code}.json`), "utf8"));
  visitStrings(catalog, (text) => {
    for (const character of text) {
      // The primary Poppins fonts already contain Basic Latin, Latin-1, and
      // Latin Extended-A. Include everything else used by the catalogs.
      if (character.codePointAt(0) > 0x017f && !/\s/u.test(character)) glyphs.add(character);
    }
  });
}

const symbols = [...glyphs].sort((a, b) => a.codePointAt(0) - b.codePointAt(0)).join("");
if (!symbols) throw new Error("No CJK glyphs found in the Chinese display catalogs");

for (const size of [14, 20, 22, 28]) {
  const converterArgs = [
    "--bpp", "4",
    "--format", "lvgl",
    "--lv-include", "lvgl.h",
    "--lv-font-name", `app_cjk_${size}`,
    "--size", String(size),
    "--font", sourceFont,
    "--symbols", symbols,
    "--no-kerning",
    "-o", path.join(outputDir, `app_cjk_${size}.c`),
  ];
  const converterIsScript = converter.toLowerCase().endsWith(".js");
  const result = spawnSync(
    converterIsScript ? process.execPath : converter,
    converterIsScript ? [converter, ...converterArgs] : converterArgs,
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    process.stderr.write(result.stdout || "");
    process.stderr.write(result.stderr || "");
    if (result.error) process.stderr.write(`${result.error.message}\n`);
    throw new Error(`lv_font_conv failed for ${size}px (exit ${result.status ?? "unknown"})`);
  }
}

process.stdout.write(`Generated four CJK fallback fonts with ${glyphs.size} glyphs.\n`);
