/* SPDX-License-Identifier: LicenseRef-FNCL-1.1 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

// Source contract regression: ESP-IDF 5.5 completes an upgrade without calling
// the ordinary URI handler. Browser-only mocks cannot catch this integration bug.
test('WebSocket hello is registered as a post-handshake callback', () => {
  const source = read('main/api/api_remote_display.c');
  assert.match(source, /\.ws_post_handshake_cb\s*=\s*post_handshake/);
  const callback = source.split('static esp_err_t post_handshake(')[1].split('static esp_err_t ws_handler(')[0];
  assert.ok(callback.includes('\\"hello\\"'));
  assert.match(callback, /return text_frame\(req, json\)/);
  const handler = source.split('static esp_err_t ws_handler(')[1];
  assert.doesNotMatch(handler, /req->method\s*==\s*HTTP_GET/);
  assert.match(read('main/Kconfig.projbuild'), /select HTTPD_WS_POST_HANDSHAKE_CB_SUPPORT/);
});
