// SPDX-License-Identifier: LicenseRef-FNCL-1.1
// Copyright (c) 2026 Cpt_Kirk
import assert from "node:assert/strict";
import test from "node:test";
import { protect, restore } from "./translation_placeholders.mjs";

test("restores the setup AP URL next to Chinese prose", () => {
  const { values } = protect("Setup AP active: {ssid}\nOpen http://192.168.4.1 while connected to this AP.");
  assert.equal(
    restore("设置 AP 已启用：ZXQPH0QXZ\n连接此 AP 时打开ZXQPH1QXZ。", values),
    "设置 AP 已启用：{ssid}\n连接此 AP 时打开http://192.168.4.1。",
  );
});

test("protects repeated and overlapping printf placeholders independently", () => {
  const source = "{ssid} {ssid} %s %s %02d https://example.com https://example.com/path";
  const { protectedText, values } = protect(source);
  assert.equal(new Set(protectedText.split(" ")).size, values.length);
  assert.equal(restore(protectedText, values), source);
});

test("allows reordering, case changes, and spaces in markers", () => {
  assert.equal(restore("zxqph 1 qxz：ZXQPH 0 QXZ", ["{name}", "%d"]), "%d：{name}");
});

test("rejects missing, duplicated, or unknown markers", () => {
  assert.throws(() => restore("已启用", ["{ssid}"]), /Missing placeholder/);
  assert.throws(() => restore("ZXQPH0QXZ ZXQPH0QXZ", ["{ssid}"]), /repeated placeholder/);
  assert.throws(() => restore("ZXQPH1QXZ", ["{ssid}"]), /Unexpected/);
});
