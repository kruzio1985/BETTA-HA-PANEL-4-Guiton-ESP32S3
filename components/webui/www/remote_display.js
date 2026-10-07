/* SPDX-License-Identifier: LicenseRef-FNCL-1.1 */
/* No dependencies on the layout editor's canvas or application state. */
(function (root) {
  "use strict";
  const isUInt = n => Number.isInteger(n) && n >= 0 && n <= 0xffffffff;

  class RemoteFrameDecoder {
    constructor(hello) {
      if (hello.version !== 1 || hello.format !== "rgb565le" || hello.width !== 480 ||
          hello.height !== 480 || !isUInt(hello.epoch)) throw new Error("Unsupported display protocol");
      this.width = hello.width; this.height = hello.height; this.epoch = hello.epoch;
      this.sequence = 0; this.frame = null;
      this.pixels = new Uint8ClampedArray(this.width * this.height * 4);
    }
    begin(message) {
      if (this.frame || message.epoch !== this.epoch || !isUInt(message.seq) || message.seq <= this.sequence ||
          message.base !== this.sequence || typeof message.key !== "boolean" ||
          !Number.isInteger(message.count) || message.count < 1 || message.count > 225 ||
          (this.sequence === 0 && !message.key) || (message.key && message.count !== 225))
        throw new Error("Invalid display frame");
      this.frame = {seq: message.seq, count: message.count, received: 0, seen: new Set(),
        pixels: message.key ? new Uint8ClampedArray(this.pixels.length) : this.pixels.slice()};
    }
    batch(buffer) {
      if (!this.frame || !(buffer instanceof ArrayBuffer) || !buffer.byteLength || buffer.byteLength > 16384)
        throw new Error("Invalid pixel batch");
      const view = new DataView(buffer), f = this.frame;
      let offset = 0;
      while (offset < view.byteLength) {
        if (offset + 30 > view.byteLength) throw new Error("Truncated rectangle");
        const u16 = n => view.getUint16(offset + n, true), u32 = n => view.getUint32(offset + n, true);
        const x = u16(18), y = u16(20), w = u16(22), h = u16(24), length = u32(26);
        const tile = (y / 32) * 15 + x / 32;
        if (u32(0) !== 0x31524442 || view.getUint8(offset + 4) !== 1 || view.getUint8(offset + 5) !== 0 ||
            u16(6) !== 30 || u32(8) !== this.epoch || u32(12) !== f.seq || u16(16) !== f.received ||
            f.received >= f.count || x % 32 || y % 32 || w !== 32 || h !== 32 ||
            x + w > this.width || y + h > this.height || length !== w * h * 2 ||
            offset + 30 + length > view.byteLength || f.seen.has(tile)) throw new Error("Invalid rectangle");
        f.seen.add(tile);
        let src = offset + 30;
        for (let row = 0; row < h; ++row) {
          let dst = ((y + row) * this.width + x) * 4;
          for (let col = 0; col < w; ++col) {
            const color = view.getUint16(src, true); src += 2;
            const r = color >> 11, g = (color >> 5) & 63, b = color & 31;
            f.pixels[dst++] = (r << 3) | (r >> 2);
            f.pixels[dst++] = (g << 2) | (g >> 4);
            f.pixels[dst++] = (b << 3) | (b >> 2);
            f.pixels[dst++] = 255;
          }
        }
        f.received++;
        offset += 30 + length;
      }
    }
    end(message) {
      const f = this.frame;
      if (!f || message.seq !== f.seq || f.received !== f.count) throw new Error("Incomplete display frame");
      this.sequence = f.seq; this.pixels = f.pixels; this.frame = null;
      return this.pixels;
    }
  }

  function mapPointer(rect, width, height, clientX, clientY, clamp = false) {
    if (rect.width <= 0 || rect.height <= 0) return null;
    const x = Math.floor((clientX - rect.left) * width / rect.width);
    const y = Math.floor((clientY - rect.top) * height / rect.height);
    if (!clamp && (x < 0 || y < 0 || x >= width || y >= height)) return null;
    return {x: Math.max(0, Math.min(width - 1, x)), y: Math.max(0, Math.min(height - 1, y))};
  }

  // Kept with the independent live-view module; all editor languages have labels.
  const labels = {
    en: ["Live Display", "Connect", "Disconnect", "Enable control", "Download PNG", "Actual size", "Disconnected", "Connecting…", "Viewing", "Remote control", "Unavailable or busy", "Local touch has priority. Viewing does not wake the display.", "Waiting for display…"],
    pl: ["Ekran na żywo", "Połącz", "Rozłącz", "Włącz sterowanie", "Pobierz PNG", "Rozmiar rzeczywisty", "Rozłączono", "Łączenie…", "Podgląd", "Sterowanie zdalne", "Niedostępny lub zajęty", "Dotyk lokalny ma pierwszeństwo. Podgląd nie wybudza ekranu.", "Oczekiwanie na ekran…"],
    de: ["Live-Anzeige", "Verbinden", "Trennen", "Steuerung aktivieren", "PNG herunterladen", "Originalgröße", "Getrennt", "Verbinden…", "Ansicht", "Fernsteuerung", "Nicht verfügbar oder belegt", "Lokale Berührung hat Vorrang. Die Ansicht weckt das Display nicht.", "Warten auf Anzeige…"],
    es: ["Pantalla en vivo", "Conectar", "Desconectar", "Activar control", "Descargar PNG", "Tamaño real", "Desconectado", "Conectando…", "Vista", "Control remoto", "No disponible u ocupado", "El toque local tiene prioridad. La vista no activa la pantalla.", "Esperando pantalla…"],
    fr: ["Écran en direct", "Connecter", "Déconnecter", "Activer le contrôle", "Télécharger PNG", "Taille réelle", "Déconnecté", "Connexion…", "Affichage", "Contrôle à distance", "Indisponible ou occupé", "Le toucher local est prioritaire. La vue ne réveille pas l’écran.", "En attente de l’écran…"],
    "zh-cn": ["实时屏幕", "连接", "断开", "启用控制", "下载 PNG", "实际大小", "已断开", "正在连接…", "查看中", "远程控制", "不可用或忙碌", "本地触摸优先。仅查看不会唤醒屏幕。", "等待屏幕…"],
    "zh-tw": ["即時螢幕", "連線", "中斷連線", "啟用控制", "下載 PNG", "實際大小", "已中斷", "正在連線…", "檢視中", "遠端控制", "無法使用或忙碌", "本機觸控優先。僅檢視不會喚醒螢幕。", "等待螢幕…"],
  };

  function createController() {
    const el = id => document.getElementById(id);
    const canvas = el("remoteCanvas"), ctx = canvas.getContext("2d", {alpha: false});
    let visible = false, wanted = false, socket = null, decoder = null, generation = 0;
    let timer = 0, heartbeat = 0, reconnect = 0, retries = 0, lastReply = 0;
    let controlled = false, pointer = null, inputSequence = 0, lastMove = 0, hasFrame = false;
    let statusIndex = 6;
    const words = () => labels[document.documentElement.lang.toLowerCase()] || labels.en;
    function status(index) { statusIndex = index; el("remoteStatus").textContent = words()[index]; }
    function localize() {
      const w = words();
      ["remoteTabBtn", "remoteConnect", "remoteDisconnect", "remoteControlLabel", "remoteScreenshot", "remoteActualLabel"].forEach((id, i) => { el(id).textContent = w[i]; });
      el("remoteHint").textContent = w[11]; status(statusIndex);
      if (visible) el("canvasTitle").textContent = w[0];
    }
    function send(type, fields = {}) {
      if (!decoder || socket?.readyState !== WebSocket.OPEN || socket.bufferedAmount > 16384) return false;
      socket.send(JSON.stringify({type, epoch: decoder.epoch, ...fields}));
      return true;
    }
    function release() {
      if (pointer !== null) send("pointer", {kind: 3, x: 0, y: 0, seq: ++inputSequence});
      const previous = pointer; pointer = null;
      if (previous !== null && canvas.hasPointerCapture(previous)) canvas.releasePointerCapture(previous);
    }
    function controlOff() {
      release(); controlled = false; el("remoteControl").checked = false;
      send("control", {enabled: false});
    }
    function teardown() {
      ++generation;
      clearTimeout(timer); clearTimeout(reconnect); clearInterval(heartbeat);
      controlOff();
      const old = socket; socket = null; decoder = null;
      if (old) { old.onclose = old.onmessage = old.onerror = null; old.close(); }
      el("remoteControl").disabled = true;
      el("remoteScreenshot").disabled = true;
      hasFrame = false;
    }
    function scheduleFrame(delay = 200) {
      clearTimeout(timer);
      timer = setTimeout(() => { if (!send("frame")) fail(); }, delay);
    }
    function fail() {
      teardown(); status(10);
      if (visible && wanted && !document.hidden)
        reconnect = setTimeout(connect, Math.min(10000, 500 * 2 ** Math.min(retries++, 5)));
    }
    async function connect() {
      teardown();
      if (!visible || document.hidden) return;
      wanted = true; status(7);
      const current = generation;
      try {
        const response = await fetch("/api/display/remote/session", {method: "POST", cache: "no-store"});
        if (current !== generation) return;
        if (!response.ok) {
          // Missing build-time feature or provisioning state: let the user retry explicitly.
          if (response.status === 404 || response.status === 501) wanted = false;
          throw new Error("Display unavailable");
        }
        const session = await response.json();
        if (current !== generation) return;
        const ws = new WebSocket(`${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/api/display/remote?token=${encodeURIComponent(session.token)}`);
        socket = ws; ws.binaryType = "arraybuffer";
        timer = setTimeout(fail, 5000);
        ws.onclose = () => { if (socket === ws) fail(); };
        ws.onerror = () => { if (socket === ws) fail(); };
        ws.onmessage = event => {
          if (socket !== ws) return;
          lastReply = Date.now();
          try {
            if (event.data instanceof ArrayBuffer) {
              decoder.batch(event.data);
              if (!send("next")) throw new Error("Send failed");
              return;
            }
            const message = JSON.parse(event.data);
            switch (message.type) {
              case "hello":
                if (decoder) throw new Error("Duplicate hello");
                clearTimeout(timer); decoder = new RemoteFrameDecoder(message);
                canvas.width = decoder.width; canvas.height = decoder.height;
                inputSequence = 0; retries = 0; status(12);
                heartbeat = setInterval(() => {
                  if (Date.now() - lastReply > 5000 || !send("ping")) fail();
                }, 300);
                scheduleFrame(0); break;
              case "idle": scheduleFrame(message.retry === 20 ? 20 : 200); break;
              case "begin": decoder.begin(message); if (!send("next")) throw new Error("Send failed"); break;
              case "end": {
                const pixels = decoder.end(message);
                ctx.putImageData(new ImageData(pixels, decoder.width, decoder.height), 0, 0);
                hasFrame = true; el("remoteScreenshot").disabled = false;
                el("remoteControl").disabled = false;
                el("remoteFrameTime").textContent = new Date().toLocaleTimeString();
                status(controlled ? 9 : 8);
                if (!send("ack", {seq: decoder.sequence})) throw new Error("Send failed");
                scheduleFrame(); break;
              }
              case "control":
                controlled = message.enabled === true;
                el("remoteControl").checked = controlled;
                if (!controlled) release();
                status(controlled ? 9 : hasFrame ? 8 : 12); break;
              case "cancel": controlOff(); break;
              case "pong":
                if (controlled && message.control === false) { controlOff(); status(hasFrame ? 8 : 12); }
                break;
              default: throw new Error("Unknown display message");
            }
          } catch (_) { fail(); } // Reconnect always starts with a complete keyframe.
        };
      } catch (_) { if (current === generation) fail(); }
    }
    function pointerEvent(event, kind) {
      if (!controlled || !hasFrame || (kind === 0 ? pointer !== null || !event.isPrimary || event.button !== 0 : pointer !== event.pointerId)) return;
      const point = mapPointer(canvas.getBoundingClientRect(), canvas.width, canvas.height, event.clientX, event.clientY, kind !== 0);
      if (!point) return;
      event.preventDefault();
      if (kind === 1 && performance.now() - lastMove < 33) return;
      lastMove = performance.now();
      if (kind === 0) { pointer = event.pointerId; canvas.setPointerCapture(pointer); }
      if (!send("pointer", {kind, ...point, seq: ++inputSequence})) { fail(); return; }
      if (kind === 2) {
        const previous = pointer; pointer = null;
        if (canvas.hasPointerCapture(previous)) canvas.releasePointerCapture(previous);
      }
    }
    canvas.addEventListener("pointerdown", e => pointerEvent(e, 0));
    canvas.addEventListener("pointermove", e => pointerEvent(e, 1));
    canvas.addEventListener("pointerup", e => pointerEvent(e, 2));
    canvas.addEventListener("pointercancel", release);
    canvas.addEventListener("lostpointercapture", release);
    canvas.addEventListener("contextmenu", e => e.preventDefault());
    window.addEventListener("blur", controlOff);
    window.addEventListener("pagehide", teardown);
    el("remoteConnect").onclick = connect;
    el("remoteDisconnect").onclick = () => { wanted = false; teardown(); status(6); };
    el("remoteControl").onchange = e => {
      release();
      if (!send("control", {enabled: e.target.checked})) controlOff();
    };
    el("remoteActual").onchange = e => canvas.classList.toggle("actual-size", e.target.checked);
    el("remoteScreenshot").onclick = () => {
      if (!hasFrame) return;
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob), link = document.createElement("a");
        link.href = url; link.download = `lcd-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
        link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, "image/png");
    };
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { teardown(); status(6); }
      else if (visible && wanted) connect();
    });
    new MutationObserver(localize).observe(document.documentElement, {attributes: true, attributeFilter: ["lang"]});
    localize();
    return {setVisible(value) {
      visible = value;
      el("remotePane").classList.toggle("hidden", !value);
      el("remoteTabBtn").classList.toggle("active", value);
      if (value) { wanted = true; connect(); }
      else { wanted = false; teardown(); status(6); }
    }};
  }
  if (typeof module !== "undefined" && module.exports) module.exports = {RemoteFrameDecoder, mapPointer, labels};
  else {
    root.RemoteDisplay = createController();
  }
})(typeof window !== "undefined" ? window : globalThis);
