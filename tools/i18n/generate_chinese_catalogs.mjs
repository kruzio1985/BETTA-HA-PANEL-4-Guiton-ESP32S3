// SPDX-License-Identifier: LicenseRef-FNCL-1.1
// Copyright (c) 2026 Cpt_Kirk
// Regenerates the built-in zh-CN and zh-TW catalogs from the English sources.
import fs from "node:fs";
import path from "node:path";
import { LANGUAGE_OPTION_LABELS, readWebCatalogs } from "./catalog_utils.mjs";
import { protect, restore } from "./translation_placeholders.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const webPath = path.join(root, "components/webui/www/app.js");
const storePath = path.join(root, "main/settings/i18n_store.c");
const outputDir = path.join(root, "main/i18n");
const sourceDir = path.join(root, "tools/i18n/catalogs");
const cachePath = path.join(root, "tools/i18n/.translation-cache.json");
const cacheTempPath = `${cachePath}.tmp`;
const requestIntervalMs = Number(process.env.TRANSLATE_INTERVAL_MS || 750);
const workerCount = Number(process.env.TRANSLATE_CONCURRENCY || 2);
const maxAttempts = Number(process.env.TRANSLATE_MAX_ATTEMPTS || 8);

function readJson(filePath, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    if (filePath === cachePath && error instanceof SyntaxError) {
      process.stderr.write(`Ignoring invalid translation cache: ${error.message}\n`);
      return fallback;
    }
    throw error;
  }
}

const translationCache = readJson(cachePath);
let cacheWritePending = false;

function saveTranslationCache() {
  fs.writeFileSync(cacheTempPath, `${JSON.stringify(translationCache, null, 2)}\n`);
  fs.renameSync(cacheTempPath, cachePath);
  cacheWritePending = false;
}

function cacheTranslation(target, source, translated) {
  (translationCache[target] ||= {})[source] = translated;
  cacheWritePending = true;
}

function cacheExistingTranslations(current, previous, translated, target) {
  for (const [key, source] of Object.entries(current)) {
    if (previous[key] === source && typeof translated[key] === "string") {
      cacheTranslation(target, source, translated[key]);
    }
  }
}

function flatten(object, prefix = "", output = {}) {
  for (const [key, value] of Object.entries(object || {})) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) flatten(value, fullKey, output);
    else output[fullKey] = value;
  }
  return output;
}

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
let requestQueue = Promise.resolve();
let nextRequestAt = 0;
let rateLimitedUntil = 0;

async function waitForRequestSlot() {
  const previous = requestQueue;
  let release;
  requestQueue = new Promise((resolve) => { release = resolve; });
  await previous;
  try {
    while (true) {
      const waitMs = Math.max(nextRequestAt, rateLimitedUntil) - Date.now();
      if (waitMs <= 0) break;
      await sleep(waitMs);
    }
    nextRequestAt = Date.now() + requestIntervalMs;
  } finally {
    release();
  }
}

function retryAfterMs(response) {
  const value = response.headers.get("retry-after");
  if (!value) return 0;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(value);
  return Number.isNaN(date) ? 0 : Math.max(0, date - Date.now());
}

function decodeCString(text) {
  return JSON.parse(`"${text}"`);
}

function readEmbeddedEnglishLcd() {
  const source = fs.readFileSync(storePath, "utf8");
  const start = source.indexOf("static const char *I18N_BUILTIN_EN =");
  const end = source.indexOf("static const char *I18N_BUILTIN_ES =", start);
  if (start < 0 || end < 0) throw new Error("Cannot locate the embedded English LCD catalog");
  const strings = [...source.slice(start, end).matchAll(/^\s*"((?:\\.|[^"\\])*)";?\s*$/gm)];
  return JSON.parse(strings.map((match) => decodeCString(match[1])).join(""));
}

function scanLcdFallbacks() {
  const result = {};
  const functions = "(?:ui_i18n_get|alarm_i18n|clock_i18n|cover_i18n|person_i18n|scene_i18n|timer_i18n)";
  const pattern = new RegExp(`${functions}\\(\\s*"([^"]+)"\\s*,\\s*"((?:\\\\.|[^"\\\\])*)"`, "g");
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(fullPath);
      else if (entry.name.endsWith(".c")) {
        const source = fs.readFileSync(fullPath, "utf8");
        for (const match of source.matchAll(pattern)) result[match[1]] = decodeCString(match[2]);
      }
    }
  };
  visit(path.join(root, "main"));
  return result;
}

function setPath(target, dottedPath, value) {
  const parts = dottedPath.split(".");
  let node = target;
  for (const part of parts.slice(0, -1)) node = node[part] ||= {};
  node[parts.at(-1)] = value;
}

async function translateText(text, target) {
  if (!text || !/[A-Za-z]/.test(text)) return text;
  const cached = translationCache[target]?.[text];
  if (typeof cached === "string") return cached;
  const { protectedText, values } = protect(text);
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  for (const [key, value] of Object.entries({ client: "gtx", sl: "en", tl: target, dt: "t", q: protectedText })) {
    url.searchParams.set(key, value);
  }
  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      await waitForRequestSlot();
      const response = await fetch(url);
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        error.retryAfterMs = retryAfterMs(response);
        throw error;
      }
      const payload = await response.json();
      const translated = restore(payload[0].map((part) => part[0]).join(""), values);
      cacheTranslation(target, text, translated);
      saveTranslationCache();
      return translated;
    } catch (error) {
      lastError = error;
      const canRetry = error.status === 429 || error.status >= 500 || error.status === undefined;
      if (!canRetry || attempt + 1 === maxAttempts) break;
      const baseDelay = error.status === 429 ? 5000 : 1000;
      const delayMs = Math.max(error.retryAfterMs || 0, Math.min(60000, baseDelay * (2 ** attempt)));
      const jitteredDelayMs = delayMs + Math.floor(Math.random() * 1000);
      if (error.status === 429) {
        rateLimitedUntil = Math.max(rateLimitedUntil, Date.now() + jitteredDelayMs);
        process.stderr.write(`${target}: rate limited; retrying in ${(jitteredDelayMs / 1000).toFixed(1)}s\n`);
      } else {
        await sleep(jitteredDelayMs);
      }
    }
  }
  throw new Error(`Translation failed for ${target}: ${JSON.stringify(text)}: ${lastError.message}`, { cause: lastError });
}

async function translateMap(english, target) {
  const entries = Object.entries(english);
  const translated = {};
  let cursor = 0;
  async function worker() {
    while (cursor < entries.length) {
      const index = cursor++;
      const [key, value] = entries[index];
      translated[key] = await translateText(value, target);
      if ((index + 1) % 50 === 0) process.stdout.write(`${target}: ${index + 1}/${entries.length}\n`);
    }
  }
  await Promise.all(Array.from({ length: workerCount }, worker));
  return Object.fromEntries(entries.map(([key]) => [key, translated[key]]));
}

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(sourceDir, { recursive: true });

const webEnglish = readWebCatalogs(webPath).en;
const lcdRoot = readEmbeddedEnglishLcd();
const lcdEnglish = {};
for (const [key, value] of Object.entries(scanLcdFallbacks())) setPath(lcdEnglish, key, value);
for (const [section, values] of Object.entries(lcdRoot.lvgl || {})) lcdEnglish[section] = { ...(lcdEnglish[section] || {}), ...values };
const lcdFlat = flatten(lcdEnglish);

const previousWebEnglish = readJson(path.join(sourceDir, "web-en.json"));
const previousLcdEnglish = flatten(readJson(path.join(outputDir, "en.json")).lvgl);
for (const [code, target] of [["zh-cn", "zh-CN"], ["zh-tw", "zh-TW"]]) {
  cacheExistingTranslations(
    webEnglish,
    previousWebEnglish,
    readJson(path.join(sourceDir, `web-${code}.json`)),
    target,
  );
  cacheExistingTranslations(
    lcdFlat,
    previousLcdEnglish,
    flatten(readJson(path.join(outputDir, `${code}.json`)).lvgl),
    target,
  );
}
if (cacheWritePending) saveTranslationCache();

fs.writeFileSync(path.join(sourceDir, "web-en.json"), `${JSON.stringify(webEnglish, null, 2)}\n`);
fs.writeFileSync(path.join(outputDir, "en.json"), `${JSON.stringify({ lvgl: lcdEnglish }, null, 2)}\n`);

for (const [code, target] of [["zh-cn", "zh-CN"], ["zh-tw", "zh-TW"]]) {
  const web = await translateMap(webEnglish, target);
  Object.assign(web, LANGUAGE_OPTION_LABELS);
  const translatedLcd = await translateMap(lcdFlat, target);
  const lcd = {};
  for (const [key, value] of Object.entries(translatedLcd)) setPath(lcd, key, value);
  fs.writeFileSync(path.join(sourceDir, `web-${code}.json`), `${JSON.stringify(web, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, `${code}.json`), `${JSON.stringify({ lvgl: lcd }, null, 2)}\n`);
}
