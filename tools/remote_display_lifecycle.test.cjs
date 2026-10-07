/* SPDX-License-Identifier: LicenseRef-FNCL-1.1 */
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../components/webui/www/remote_display.js'), 'utf8');

function harness(fetchImpl = async () => ({ok: true, json: async () => ({token: 'example'})})) {
  const elements = new Map(), timers = new Map(), windows = {}, documents = {}, sockets = [];
  let nextTimer = 0, downloads = 0;
  function element(id) {
    if (!elements.has(id)) {
      const classes = new Set(), listeners = {}, captured = new Set();
      elements.set(id, {id, listeners, disabled: false, checked: false,
        classList: {toggle(k, value) { if (value) classes.add(k); else classes.delete(k); }, contains: k => classes.has(k)},
        getContext: () => ({putImageData() {}}), getBoundingClientRect: () => ({left: 0, top: 0, width: 480, height: 480}),
        addEventListener(k, fn) { listeners[k] = fn; },
        setPointerCapture(k) { captured.add(k); }, hasPointerCapture: k => captured.has(k),
        releasePointerCapture(k) { captured.delete(k); listeners.lostpointercapture?.(); },
        toBlob(fn) { fn({}); }, click() { downloads++; },
      });
    }
    return elements.get(id);
  }
  class Socket {
    static OPEN = 1;
    constructor() { this.readyState = 1; this.bufferedAmount = 0; this.sent = []; sockets.push(this); }
    send(text) { this.sent.push(JSON.parse(text)); }
    close() { this.readyState = 3; }
    receive(message) { this.onmessage({data: message instanceof ArrayBuffer ? message : JSON.stringify(message)}); }
  }
  const document = {hidden: false, documentElement: {lang: 'en'}, getElementById: element,
    createElement: () => element('download'), addEventListener(k, fn) { documents[k] = fn; }};
  const context = {document, fetch: fetchImpl, WebSocket: Socket, ArrayBuffer, DataView, Uint8ClampedArray,
    location: {protocol: 'http:', host: 'panel.local'}, performance: {now: () => 1000},
    ImageData: class {constructor(data) { this.data = data; }}, MutationObserver: class {observe() {}},
    URL: {createObjectURL: () => 'blob:test', revokeObjectURL() {}},
    setTimeout(fn, ms) { timers.set(++nextTimer, {fn, ms}); return nextTimer; }, clearTimeout(id) { timers.delete(id); },
    setInterval(fn, ms) { timers.set(++nextTimer, {fn, ms, interval: true}); return nextTimer; }, clearInterval(id) { timers.delete(id); },
    addEventListener(k, fn) { windows[k] = fn; },
  };
  context.window = context;
  vm.runInNewContext(source, context);
  return {context, element, sockets, timers, windows, documents, downloads: () => downloads};
}
const settle = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
function hello(socket) { socket.receive({type: 'hello', version: 1, epoch: 42, width: 480, height: 480, format: 'rgb565le'}); }

test('missing server hello times out; post-handshake hello starts frame requests', async () => {
  const h = harness(); h.context.RemoteDisplay.setVisible(true); await settle();
  const first = h.sockets[0];
  assert.equal(first.sent.length, 0);
  const deadline = [...h.timers.values()].find(t => t.ms === 5000);
  assert.ok(deadline);
  deadline.fn();
  assert.equal(first.readyState, 3);
  const retry = [...h.timers.values()].find(t => t.ms === 500);
  assert.ok(retry);
  retry.fn(); await settle();
  const second = h.sockets[1]; hello(second);
  assert.equal([...h.timers.values()].some(t => t.ms === 5000), false);
  const request = [...h.timers.values()].find(t => t.ms === 0);
  assert.ok(request); request.fn();
  assert.equal(second.sent.at(-1).type, 'frame');
  assert.equal(second.sent.at(-1).epoch, 42);
});

function paint(socket) {
  socket.receive({type: 'begin', epoch: 42, seq: 1, base: 0, key: true, count: 225});
  for (let index = 0; index < 225; ++index) {
    const b = new ArrayBuffer(2078), v = new DataView(b);
    v.setUint32(0, 0x31524442, true); v.setUint8(4, 1); v.setUint16(6, 30, true);
    v.setUint32(8, 42, true); v.setUint32(12, 1, true); v.setUint16(16, index, true);
    v.setUint16(18, index % 15 * 32, true); v.setUint16(20, Math.floor(index / 15) * 32, true);
    v.setUint16(22, 32, true); v.setUint16(24, 32, true); v.setUint32(26, 2048, true);
    socket.receive(b);
  }
  socket.receive({type: 'end', seq: 1});
}

test('leaving the pane cancels control, closes its socket and clears its timers', async () => {
  const h = harness();
  h.context.RemoteDisplay.setVisible(true); await settle();
  const ws = h.sockets[0]; hello(ws); paint(ws);
  h.element('remoteControl').onchange({target: {checked: true}});
  ws.receive({type: 'control', enabled: true});
  h.element('remoteCanvas').listeners.pointerdown({isPrimary: true, button: 0, pointerId: 1, clientX: 120, clientY: 80, preventDefault() {}});
  assert.equal(ws.sent.at(-1).kind, 0);
  h.context.RemoteDisplay.setVisible(false);
  assert.ok(ws.sent.some(m => m.type === 'pointer' && m.kind === 3));
  assert.equal(ws.sent.at(-1).enabled, false);
  assert.equal(ws.readyState, 3);
  assert.equal(h.timers.size, 0);
  assert.equal(h.element('remoteControl').disabled, true);
  assert.equal(h.element('remoteScreenshot').disabled, true);
});

test('hiding and showing the page reconnects with control disabled and no stale screenshot', async () => {
  const h = harness(); h.context.RemoteDisplay.setVisible(true); await settle();
  hello(h.sockets[0]); paint(h.sockets[0]);
  h.element('remoteScreenshot').onclick(); assert.equal(h.downloads(), 1);
  h.context.document.hidden = true; h.documents.visibilitychange();
  assert.equal(h.sockets[0].readyState, 3);
  h.context.document.hidden = false; h.documents.visibilitychange(); await settle();
  assert.equal(h.sockets.length, 2);
  assert.equal(h.element('remoteScreenshot').disabled, true);
  assert.equal(h.element('remoteControl').checked, false);
});

test('a late token response cannot reconnect a pane that was closed', async () => {
  let resolve;
  const h = harness(() => new Promise(r => { resolve = r; }));
  h.context.RemoteDisplay.setVisible(true);
  h.context.RemoteDisplay.setVisible(false);
  resolve({ok: true, json: async () => ({token: 'late'})}); await settle();
  assert.equal(h.sockets.length, 0); assert.equal(h.timers.size, 0);
});

test('incomplete frame never enables controls or screenshot download', async () => {
  const h = harness(); h.context.RemoteDisplay.setVisible(true); await settle();
  const ws = h.sockets[0]; hello(ws);
  ws.receive({type: 'begin', epoch: 42, seq: 1, base: 0, key: true, count: 225});
  ws.receive({type: 'end', seq: 1});
  assert.equal(ws.readyState, 3);
  assert.equal(h.element('remoteControl').disabled, true);
  assert.equal(h.element('remoteScreenshot').disabled, true);
});

test('window blur cancels a held remote pointer and revokes control', async () => {
  const h = harness(); h.context.RemoteDisplay.setVisible(true); await settle();
  const ws = h.sockets[0]; hello(ws); paint(ws); ws.receive({type: 'control', enabled: true});
  h.element('remoteCanvas').listeners.pointerdown({isPrimary: true, button: 0, pointerId: 7, clientX: 479, clientY: 479, preventDefault() {}});
  h.windows.blur();
  assert.equal(ws.sent.at(-2).kind, 3); assert.equal(ws.sent.at(-1).enabled, false);
  assert.equal(h.element('remoteControl').checked, false);
});
