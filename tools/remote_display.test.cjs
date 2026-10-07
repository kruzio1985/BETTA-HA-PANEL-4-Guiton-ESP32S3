/* SPDX-License-Identifier: LicenseRef-FNCL-1.1 */
const test = require('node:test');
const assert = require('node:assert/strict');
const {RemoteFrameDecoder, mapPointer, labels} = require('../components/webui/www/remote_display.js');
const hello = {version: 1, epoch: 42, width: 480, height: 480, format: 'rgb565le'};

function rect(tile, index, seq, color = 0xf800) {
  const buffer = new ArrayBuffer(2078), v = new DataView(buffer);
  v.setUint32(0, 0x31524442, true); v.setUint8(4, 1); v.setUint16(6, 30, true);
  v.setUint32(8, 42, true); v.setUint32(12, seq, true); v.setUint16(16, index, true);
  v.setUint16(18, (tile % 15) * 32, true); v.setUint16(20, Math.floor(tile / 15) * 32, true);
  v.setUint16(22, 32, true); v.setUint16(24, 32, true); v.setUint32(26, 2048, true);
  for (let i = 30; i < buffer.byteLength; i += 2) v.setUint16(i, color, true);
  return buffer;
}
function keyframe() {
  const d = new RemoteFrameDecoder(hello);
  d.begin({epoch: 42, seq: 1, base: 0, key: true, count: 225});
  for (let i = 0; i < 225; ++i) d.batch(rect(i, i, 1));
  d.end({seq: 1}); return d;
}

test('full keyframe and delta produce the expected complete framebuffer', () => {
  const d = keyframe();
  for (let i = 0; i < d.pixels.length; i += 4) assert.deepEqual([...d.pixels.slice(i, i + 4)], [255, 0, 0, 255]);
  d.begin({epoch: 42, seq: 2, base: 1, key: false, count: 1});
  d.batch(rect(224, 0, 2, 0x07e0));
  assert.deepEqual([...d.pixels.slice(-4)], [255, 0, 0, 255], 'partial frames stay invisible');
  d.end({seq: 2});
  for (let y = 0; y < 480; ++y) for (let x = 0; x < 480; ++x) {
    const index = (y * 480 + x) * 4;
    assert.deepEqual([...d.pixels.slice(index, index + 4)], x >= 448 && y >= 448 ? [0, 255, 0, 255] : [255, 0, 0, 255]);
  }
});

test('batched rectangles decode RGB565 primary colors and boundaries', () => {
  const d = keyframe();
  const colors = [0x001f, 0xffff, 0, 0x07e0, 0xf800];
  d.begin({epoch: 42, seq: 2, base: 1, key: false, count: colors.length});
  const bytes = new Uint8Array(2078 * colors.length);
  colors.forEach((color, i) => bytes.set(new Uint8Array(rect(i, i, 2, color)), i * 2078));
  d.batch(bytes.buffer); d.end({seq: 2});
  [[0, 0, 255, 255], [255, 255, 255, 255], [0, 0, 0, 255], [0, 255, 0, 255], [255, 0, 0, 255]].forEach((color, i) => {
    assert.deepEqual([...d.pixels.slice(i * 32 * 4, i * 32 * 4 + 4)], color);
  });
});

test('incomplete frames, stale epochs, wrong baselines and duplicate tiles fail closed', () => {
  const d = new RemoteFrameDecoder(hello);
  assert.throws(() => d.begin({epoch: 42, seq: 1, base: 0, key: false, count: 1}));
  d.begin({epoch: 42, seq: 1, base: 0, key: true, count: 225});
  d.batch(rect(0, 0, 1));
  assert.throws(() => d.end({seq: 1}));
  assert.throws(() => d.batch(rect(0, 1, 1)));
  assert.equal(d.sequence, 0);
  const ready = keyframe();
  assert.throws(() => ready.begin({epoch: 41, seq: 2, base: 1, key: false, count: 1}));
  assert.throws(() => ready.begin({epoch: 42, seq: 2, base: 0, key: false, count: 1}));
});

test('malformed pixel headers, coordinates and lengths never commit', () => {
  for (const mutate of [
    v => v.setUint32(0, 0, true), v => v.setUint8(5, 1), v => v.setUint16(6, 29, true),
    v => v.setUint32(8, 43, true), v => v.setUint32(12, 2, true), v => v.setUint16(16, 1, true),
    v => v.setUint16(18, 480, true), v => v.setUint16(20, 1, true), v => v.setUint16(22, 0, true),
    v => v.setUint32(26, 0xffffffff, true),
  ]) {
    const d = new RemoteFrameDecoder(hello), b = rect(0, 0, 1);
    d.begin({epoch: 42, seq: 1, base: 0, key: true, count: 225}); mutate(new DataView(b));
    assert.throws(() => d.batch(b)); assert.equal(d.sequence, 0);
  }
});

test('pointer mapping uses the displayed canvas bounds, clamps drags, rejects margins', () => {
  const r = {left: 100, top: 200, width: 240, height: 240};
  assert.deepEqual(mapPointer(r, 480, 480, 220, 320), {x: 240, y: 240});
  assert.equal(mapPointer(r, 480, 480, 99, 320), null);
  assert.equal(mapPointer(r, 480, 480, 340, 440), null);
  assert.deepEqual(mapPointer(r, 480, 480, 340, 440, true), {x: 479, y: 479});
  assert.deepEqual(mapPointer(r, 480, 480, 0, 0, true), {x: 0, y: 0});
  assert.equal(mapPointer({...r, width: 0}, 480, 480, 220, 320), null);
});

test('every supported locale has a complete live display catalog', () => {
  for (const language of ['en', 'de', 'es', 'fr', 'pl', 'zh-cn', 'zh-tw']) {
    assert.equal(labels[language].length, labels.en.length);
    assert.ok(labels[language].every(s => typeof s === 'string' && s.length > 0));
  }
});
