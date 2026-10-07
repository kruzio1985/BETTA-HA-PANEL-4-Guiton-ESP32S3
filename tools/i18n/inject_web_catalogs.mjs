// SPDX-License-Identifier: LicenseRef-FNCL-1.1
// Copyright (c) 2026 Cpt_Kirk
import fs from "node:fs";
import path from "node:path";
import { LANGUAGE_OPTION_LABELS } from "./catalog_utils.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const appPath = path.join(root, "components/webui/www/app.js");
const catalogDir = path.join(root, "tools/i18n/catalogs");
const begin = "  // BEGIN GENERATED CHINESE CATALOGS";
const end = "  // END GENERATED CHINESE CATALOGS";

let source = fs.readFileSync(appPath, "utf8");
const beginAt = source.indexOf(begin);
const endAt = source.indexOf(end, beginAt);
if (beginAt < 0 || endAt < 0) throw new Error("Chinese catalog markers are missing from app.js");

const lines = [begin];
for (const code of ["zh-cn", "zh-tw"]) {
  const catalog = JSON.parse(fs.readFileSync(path.join(catalogDir, `web-${code}.json`), "utf8"));
  Object.assign(catalog, LANGUAGE_OPTION_LABELS);
  lines.push(`  ${JSON.stringify(code)}: ${JSON.stringify(catalog, null, 2).replaceAll("\n", "\n  ")},`);
}
lines.push(end);

source = `${source.slice(0, beginAt)}${lines.join("\n")}${source.slice(endAt + end.length)}`;
fs.writeFileSync(appPath, source);
