// SPDX-License-Identifier: LicenseRef-FNCL-1.1
// Copyright (c) 2026 Cpt_Kirk
import fs from "node:fs";
import vm from "node:vm";

export const LANGUAGE_OPTION_LABELS = Object.freeze({
  "settings.language.option_de": "Deutsch",
  "settings.language.option_en": "English",
  "settings.language.option_es": "Espanol",
  "settings.language.option_fr": "Francais",
  "settings.language.option_pl": "Polski",
  "settings.language.option_zh-cn": "简体中文",
  "settings.language.option_zh-tw": "繁體中文",
});

export function readWebCatalogs(path) {
  const source = fs.readFileSync(path, "utf8");
  const marker = "const WEB_I18N_BUILTIN =";
  const markerAt = source.indexOf(marker);
  if (markerAt < 0) throw new Error(`Missing ${marker} in ${path}`);
  const start = source.indexOf("{", markerAt + marker.length);
  if (start < 0) throw new Error(`Missing catalog object in ${path}`);

  let depth = 0;
  let quote = "";
  let escaped = false;
  let end = -1;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "{") depth += 1;
    else if (ch === "}" && --depth === 0) {
      end = i + 1;
      break;
    }
  }
  if (end < 0) throw new Error(`Unterminated catalog object in ${path}`);
  return vm.runInNewContext(`(${source.slice(start, end)})`, Object.create(null));
}

export function flattenStrings(value, prefix = "", output = {}) {
  for (const [key, child] of Object.entries(value || {})) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) flattenStrings(child, path, output);
    else if (typeof child === "string") output[path] = child;
  }
  return output;
}
