/* Gate 1 · Hello Run — GREETINGS. The runner jogs along the track and meets five friends, each in a little scene that
   shows the situation without words: a friend waving at a garden gate (Hello!), sunrise with a rooster and an alarm
   clock (Good morning!), a friend holding out a present (Thank you!), a bump that sends a pile of books flying (Sorry!)
   and a sleepy friend in pyjamas by the bed under the moon (Good night!). The teacher asks "What do you say?", the child
   says the greeting, presses the giant button and the runner waves / hugs the present / bows and picks the books up,
   the friend hops with hearts and a flag goes up. At the finish: "Are you happy?" → "Yes!", and all five friends cheer
   around the podium with the trophy. (Engine "obby"; passport L25 good morning / good night, L6 thank, L24 sorry) */
(function () {
  "use strict";
  TC.games = TC.games || {};

  /* ---------- the five situation cards (glossy chibi kids like the pose-* pictures in art.js) ---------- */
  const SKIN = "#ffd3a8", SHIRT = "#4cc9ff", PANTS = "#3d4a8a", HAIR = "#5a3518", INK = "#1b1d33";
  const R = (v) => Math.round(v * 10) / 10;
  const limb = (pts, col, w = 13) => `<path d="M${pts.map((p) => p.join(" ")).join(" L")}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const hand = (c, x, y, r = 8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.g(SKIN)}"/>`;
  /** a kid's head, centre 100,66, radius 32. o: hair, girl (bunches), eyes "shut", mouth "open" | "o" | "sad", worry */
  function head(c, o) {
    const hair = o.hair || HAIR;
    let s = (o.girl ? c.sphere(63, 76, 11, hair, 0.4) + c.sphere(137, 76, 11, hair, 0.4) : "") + c.sphere(100, 66, 32, SKIN, 0.6);
    s += c.path("M68 62 Q70 30 100 30 Q132 30 132 62 Q120 46 100 50 Q80 46 68 62Z", hair);
    s += o.eyes === "shut" ? `<path d="M83 68 q6 6 12 0 M105 68 q6 6 12 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>` : c.eyes(100, 68, 11, 5);
    s += o.mouth === "open" ? `<path d="M92 78 Q100 93 108 78Z" fill="#c2334d"/>` : o.mouth === "o" ? `<ellipse cx="100" cy="84" rx="4.5" ry="5.5" fill="#7a2a3a"/>`
      : o.mouth === "sad" ? `<path d="M93 87 Q100 80 107 87" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>` : c.smile(100, 80, 6);
    if (o.worry) s += `<path d="M82 58 l11 -4 M118 58 l-11 -4" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><path d="M130 38 q7 10 0 15 q-7 -5 0 -15z" fill="#7fd3ff"/>`;
    return s + c.blush(100, 78, 20);
  }
  /** a standing kid, drawn 200 units tall and placed with its feet at (cx, fy), scaled by k. aL / aR: the arms as point lists */
  function kid(c, o) {
    const shirt = o.shirt || SHIRT, k = o.k || 0.8, aL = o.aL || [[80, 104], [68, 124], [70, 146]], aR = o.aR || [[120, 104], [132, 124], [130, 146]];
    let b = limb([[92, 150], [90, 184]], PANTS, 15) + limb([[108, 150], [110, 184]], PANTS, 15);
    b += `<ellipse cx="87" cy="188" rx="11" ry="6.5" fill="${c.g("#ff4b55")}"/><ellipse cx="113" cy="188" rx="11" ry="6.5" fill="${c.g("#ff4b55")}"/>`;
    b += `<rect x="74" y="96" width="52" height="58" rx="18" fill="${c.g(shirt)}"/>`;
    b += limb(aL, shirt) + hand(c, aL[aL.length - 1][0], aL[aL.length - 1][1]) + limb(aR, shirt) + hand(c, aR[aR.length - 1][0], aR[aR.length - 1][1]);
    return `<g transform="translate(${R(o.cx - 100 * k)} ${R(o.fy - 195 * k)}) scale(${k})${o.rot ? ` rotate(${o.rot} 100 195)` : ""}">${b + head(c, o)}</g>`;
  }
  /** the rounded glossy backdrop of a card; "inner" is clipped to it (hills, grass, sun rays …) */
  const panel = (c, top, bottom, inner = "") => `<clipPath id="pc"><rect x="4" y="4" width="192" height="192" rx="30"/></clipPath><rect x="4" y="4" width="192" height="192" rx="30" fill="${c.v(top, bottom)}"/>` +
    `<g clip-path="url(#pc)">${inner}</g>` + c.hl(62, 18, 46, 8, 0, 0.5);
  const spark = (x, y, s, col = "#fff6c2") => `<path d="M${x} ${y - s} L${R(x + s * 0.28)} ${R(y - s * 0.28)} L${x + s} ${y} L${R(x + s * 0.28)} ${R(y + s * 0.28)} L${x} ${y + s} L${R(x - s * 0.28)} ${R(y + s * 0.28)} L${x - s} ${y} L${R(x - s * 0.28)} ${R(y - s * 0.28)}Z" fill="${col}"/>`;
  const heartSvg = (c, x, y, s, col = "#ff5fa2") => `<path d="M${x} ${R(y + s * 0.9)} C${R(x - s * 1.7)} ${R(y - s * 0.2)} ${R(x - s * 0.7)} ${R(y - s * 1.4)} ${x} ${R(y - s * 0.4)} C${R(x + s * 0.7)} ${R(y - s * 1.4)} ${R(x + s * 1.7)} ${R(y - s * 0.2)} ${x} ${R(y + s * 0.9)}Z" fill="${c.g(col)}"/>`;
  const bookSvg = (c, x, y, rot, col) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-18" y="-6" width="36" height="12" rx="2.5" fill="${c.g(col)}"/><rect x="-15" y="-3.5" width="31" height="4" rx="1" fill="#fff" opacity=".9"/></g>`;
  const waveMarks = (x, y) => `<path d="M${R(x - 10)} ${R(y - 9)} l-5 -7 M${x} ${R(y - 12)} v-9 M${R(x + 10)} ${R(y - 9)} l5 -7" stroke="#ff9a2e" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
  const NEW_ART = {
    /* Hello! — two friends meet in the sunshine and wave to each other */
    "greet-hello"() {
      const c = TC.ArtCtx();
      let s = panel(c, "#7fd4ff", "#e9f9ff", `<ellipse cx="100" cy="200" rx="140" ry="36" fill="${c.v("#8ff27a", "#2fbf50")}"/>`);
      for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; s += `<path d="M${R(100 + Math.cos(a) * 17)} ${R(30 + Math.sin(a) * 17)} L${R(100 + Math.cos(a) * 23)} ${R(30 + Math.sin(a) * 23)}" stroke="#ffb020" stroke-width="4" stroke-linecap="round"/>`; }
      s += c.sphere(100, 30, 12.5, "#ffd21f") + c.shadow(58, 187, 34, 6) + c.shadow(142, 187, 34, 6);
      s += kid(c, { cx: 58, fy: 188, aL: [[80, 104], [62, 88], [56, 60]], mouth: "open" });
      s += kid(c, { cx: 142, fy: 188, shirt: "#ff7ab0", hair: "#3a2530", girl: 1, aR: [[120, 104], [138, 88], [144, 60]], mouth: "open" });
      return c.out(s + waveMarks(22.8, 80) + waveMarks(177.2, 80));
    },
    /* Good morning! — the sun comes up, the rooster crows, a big stretch */
    "greet-morning"() {
      const c = TC.ArtCtx();
      let bg = "";
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; bg += `<path d="M114 136 L${R(114 + Math.cos(a - 0.1) * 170)} ${R(136 + Math.sin(a - 0.1) * 170)} L${R(114 + Math.cos(a + 0.1) * 170)} ${R(136 + Math.sin(a + 0.1) * 170)}Z" fill="#fff6c2" opacity=".7"/>`; }
      bg += c.sphere(114, 136, 44, "#ffc21f") + `<path d="M0 152 Q52 126 104 146 Q150 164 200 138 V200 H0Z" fill="${c.v("#8ff27a", "#2fa84a")}"/>`;
      let s = panel(c, "#ffab66", "#fff0b0", bg);
      // the rooster on its post
      s += `<rect x="151" y="132" width="12" height="60" rx="4" fill="${c.g("#9a6236")}"/><g transform="translate(156 114) scale(1.02)">` +
        c.path("M-14 0 Q-40 -8 -34 -34 Q-22 -16 -6 -10Z", "#26547c") + c.path("M-14 4 Q-44 6 -44 -16 Q-28 -4 -8 -4Z", "#2a9d8f") +
        `<path d="M-5 14 v10 M6 14 v10" stroke="#ffb020" stroke-width="3.5" stroke-linecap="round"/>` + c.ell(0, 0, 20, 16, "#e8683a", 0, 0.5) + c.sphere(13, -19, 11, "#f07a48", 0.5) +
        c.path("M6 -27 q1 -10 7 -4 q3 -8 7 0 q6 -3 3 7z", "#ff3b3b") + c.path("M22 -24 l14 -1 l-12 7z", "#ffb020") + c.path("M22 -16 l11 3 l-11 2z", "#ffb020") +
        `<circle cx="16" cy="-21" r="2.3" fill="${INK}"/>` + c.path("M17 -11 q6 9 -2 9z", "#ff3b3b") + `</g>`;
      s += `<path d="M192 80 q5 7 0 15 M185 84 q3 4 0 8" stroke="#ff5a2e" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
      s += c.shadow(60, 189, 34, 6) + kid(c, { cx: 60, fy: 190, aL: [[80, 104], [62, 84], [52, 56]], aR: [[120, 104], [138, 84], [148, 56]], eyes: "shut", mouth: "open" });
      return c.out(s);
    },
    /* Good night! — tucked up in bed with teddy, the moon and the stars outside */
    "greet-night"() {
      const c = TC.ArtCtx();
      let s = panel(c, "#141c5c", "#3d348b");
      [[30, 28, 5], [66, 50, 3.5], [104, 24, 4.5], [124, 58, 3], [182, 76, 4], [22, 84, 3.5], [92, 62, 2.5]].forEach(([x, y, r]) => (s += spark(x, y, r)));
      s += `<path d="M166.8 26.4 A23 23 0 1 0 166.8 61.6 A19 19 0 0 1 166.8 26.4Z" fill="${c.g("#ffe58a")}"/>`;
      const zz = (x, y, z) => `<path d="M${x} ${y} h${z} l${-z} ${R(z * 1.2)} h${z}" stroke="#bfe0ff" stroke-width="${R(z * 0.3)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += zz(34, 62, 8) + zz(48, 42, 11) + zz(66, 20, 14);
      s += `<rect x="30" y="72" width="140" height="96" rx="20" fill="${c.g("#b5773f")}"/>` + c.hl(70, 82, 34, 5, 0, 0.4) + `<rect x="48" y="96" width="104" height="54" rx="20" fill="${c.g("#ffffff")}"/>`;
      // teddy, then the sleeping kid, then the blanket pulled up to the chin
      s += c.sphere(130, 114, 6, "#b5773f", 0.3) + c.sphere(150, 114, 6, "#b5773f", 0.3) + c.sphere(140, 127, 14, "#c98a4f", 0.5) + c.ell(140, 132, 7, 5, "#f2d0a8", 0, 0) +
        `<circle cx="135" cy="125" r="2" fill="${INK}"/><circle cx="145" cy="125" r="2" fill="${INK}"/><ellipse cx="140" cy="130" rx="2.4" ry="1.8" fill="#3a2530"/>`;
      s += `<g transform="translate(8.2 61.9) scale(.82)">${head(c, { eyes: "shut" })}</g>`;
      s += `<path d="M22 150 Q100 136 178 150 V184 Q178 194 168 194 H32 Q22 194 22 184Z" fill="${c.g("#5b8cff")}"/><path d="M22 150 Q100 136 178 150 V164 Q100 150 22 164Z" fill="#e3ecff"/>`;
      s += hand(c, 72, 154, 6.5) + hand(c, 108, 152, 6.5) + spark(50, 180, 5, "#ffe58a") + spark(150, 178, 5, "#ffe58a") + spark(128, 186, 3.5, "#ffe58a");
      return c.out(s);
    },
    /* Thank you! — a friend hands over a present */
    "greet-thanks"() {
      const c = TC.ArtCtx();
      let s = panel(c, "#fff3c4", "#ffd0e0", `<ellipse cx="100" cy="200" rx="140" ry="30" fill="#ffb3cc" opacity=".6"/>`);
      s += heartSvg(c, 100, 84, 13) + heartSvg(c, 82, 62, 6, "#ff8db3") + heartSvg(c, 120, 60, 7.5, "#ff8db3");
      s += `<rect x="80" y="122" width="40" height="36" rx="5" fill="${c.g("#ff4f7b")}"/><rect x="96" y="122" width="8" height="36" fill="${c.g("#ffd21f")}"/>` +
        `<rect x="76" y="113" width="48" height="13" rx="4" fill="${c.g("#ff7a9e")}"/><rect x="96" y="113" width="8" height="13" fill="${c.g("#ffe066")}"/>` +
        c.ell(91, 106, 10, 6, "#ffd21f", -28, 0.4) + c.ell(109, 106, 10, 6, "#ffd21f", 28, 0.4) + c.sphere(100, 109, 4.5, "#ffb020", 0.4);
      s += c.shadow(50, 187, 34, 6) + c.shadow(150, 187, 34, 6);
      s += kid(c, { cx: 50, fy: 188, k: 0.78, aL: [[80, 106], [104, 138], [141, 144]], aR: [[120, 104], [130, 116], [138, 121]], mouth: "open" });
      s += kid(c, { cx: 150, fy: 188, k: 0.78, shirt: "#35d35a", hair: "#3a2530", girl: 1, aL: [[80, 104], [70, 116], [62, 121]], aR: [[120, 106], [96, 138], [59, 144]] });
      return c.out(s);
    },
    /* Sorry! — bump! the books are on the ground, hands together to say sorry */
    "greet-sorry"() {
      const c = TC.ArtCtx();
      let s = panel(c, "#e6ebff", "#c3cfff", `<ellipse cx="100" cy="200" rx="140" ry="30" fill="#9fb0ee" opacity=".6"/>`);
      let b = ""; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 9 : 19; b += `${i ? "L" : "M"}${R(104 + Math.cos(a) * r)} ${R(52 + Math.sin(a) * r)} `; }
      s += `<path d="${b}Z" fill="${c.g("#ffd21f")}" stroke="#ff8a1f" stroke-width="2.5" stroke-linejoin="round"/>`;
      s += `<path d="M96 100 l-5 -9 M110 98 l5 -9" stroke="#8a94b8" stroke-width="3" stroke-linecap="round"/>` + bookSvg(c, 104, 114, -28, "#3d8bff");
      s += c.shadow(52, 187, 34, 6) + c.shadow(150, 187, 34, 6);
      s += kid(c, { cx: 52, fy: 188, k: 0.78, rot: 5, aL: [[80, 106], [86, 124], [97, 107]], aR: [[120, 106], [114, 124], [103, 107]], worry: 1, mouth: "sad" });
      s += kid(c, { cx: 150, fy: 188, k: 0.78, shirt: "#ff9a2e", hair: "#26293a", aL: [[80, 104], [62, 98], [54, 80]], aR: [[120, 104], [138, 98], [146, 80]], mouth: "o" });
      s += bookSvg(c, 96, 182, -6, "#ff4f7b") + bookSvg(c, 112, 171, 22, "#35d35a");
      return c.out(s);
    }
  };
  const NEW_SEAL = { "greet-hello": [58, 135, 9], "greet-morning": [60, 137, 9], "greet-night": [100, 177, 10], "greet-thanks": [46, 135, 8.5], "greet-sorry": [150, 136, 8.5] };
  Object.keys(NEW_ART).forEach((n) => { if (!TC.ART[n]) { TC.ART[n] = NEW_ART[n]; TC.SEAL[n] = NEW_SEAL[n]; } }); // art.js wins if it gets these later

  /* ---------- the track ---------- */
  const IM = {}; ["palm", "trophy", "cloud", "gift", "cat", "rabbit", "dog", "bear", "pig"].forEach((n) => (IM[n] = TC.artImg(n)));
  const PIN = new Image(); // the 土城 pin on its own, to pin back on top of the pyjamas
  PIN.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-23 -23 46 48">${TC.seal(0, 0, 20)}</svg>`);
  /** greeting → [scene, friend's picture, fur colour] */
  const CAST = { hello: ["hello", "cat", "#ffb15c"], "good morning": ["morning", "rabbit", "#efeaff"], "thank you": ["thanks", "dog", "#d9a066"], sorry: ["sorry", "bear", "#9a6236"], "good night": ["night", "pig", "#ffa3c2"] };
  const ORDER = ["hello", "good morning", "thank you", "sorry", "good night"];
  let cv, ctx, W, H, k = 1, raf;
  const GY = 470;    // ground line in base units (720 high)
  const PODIUM = 60; // height of the winner's step
  const GAP = 1300;  // from one friend to the next
  const A = { x: 200, y: GY, pose: "idle", t: 0, color: "#ffc83d", name: "", rot: 0, bow: 0 };
  let stops = [], flags = [], crowd = [], parts = [], cam = 0, finishX = 0, trophy = false, party = false;
  let epoch = 0, API = null; // animations of an earlier run (or of an aborted one) stop at once

  function resize() { const r = Math.min(Math.max(1, window.devicePixelRatio || 1), 1920 / innerWidth); W = cv.width = Math.round(innerWidth * r); H = cv.height = Math.round(innerHeight * r); k = H / 720; }
  function tween(ms, fn) {
    const e = epoch;
    return new Promise((res) => { const t0 = performance.now(); (function f() { if (e !== epoch || (API && API.aborted)) return res(); const t = Math.min(1, (performance.now() - t0) / ms); fn(t); if (t < 1) requestAnimationFrame(f); else res(); })(); });
  }
  const wait = (ms) => tween(ms, () => {});
  const ease = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  /** the runner stands this far from the left edge: the scene to the right of it must stay clear of the picture card */
  const camOff = (VW) => Math.max(110, Math.min(360, VW * 0.96 - 880));

  const friend = (art, fur, x) => ({ img: IM[art], fur, x, y: GY, size: 190, s: 1, hop: 0, tilt: 0, mode: "", happy: 0, ph: 0 });
  function build(scenes) {
    stops = scenes.map((sc, i) => {
      const [kind, art, fur] = CAST[sc.w] || CAST.hello, x = 900 + i * GAP;
      const st = { sc, kind, x, f: friend(art, fur, x + 215), v: {} };
      if (kind === "hello") st.f.mode = "wave";
      if (kind === "morning") { st.f.s = 0; st.v = { rise: 0, door: 0, ring: 0, crow: 0 }; }
      if (kind === "thanks") { st.f.mode = "hold"; st.v = { offer: 0, take: 0, gs: 1 }; }
      if (kind === "sorry") { st.f.x = x + 400; st.f.mode = "hold"; st.v = { carry: "high", bang: 0, dizzy: 0, books: ["#ff4f7b", "#35d35a", "#3d8bff"].map((col) => ({ col, x: 0, y: 0, r: 0 })) }; }
      if (kind === "night") { st.f.pj = true; st.v = { lamp: 1 }; }
      return st;
    });
    flags = stops.map((st) => ({ x: st.x + 560, up: 0 }));
    finishX = 900 + stops.length * GAP - 250;
    crowd = []; parts = []; trophy = false; party = false;
  }
  /** 0…1: how close the camera is to the stop of that kind (the sky turns to night / to sunrise around it) */
  function amb(kind, VW) {
    const st = stops.find((s) => s.kind === kind); if (!st) return 0;
    const u = Math.min(1, Math.max(0, (1150 - Math.abs(cam + camOff(VW) - st.x - 60)) / 610));
    return u * u * (3 - 2 * u);
  }

  /* ---------- small drawing helpers ---------- */
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  const lin = (x0, y0, x1, y1, a, b) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const disc = (x, y, r, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
  /** a glossy ball / egg shape */
  function ball(x, y, rx, col, ry = rx) {
    const g = ctx.createRadialGradient(x - rx * 0.35, y - ry * 0.4, rx * 0.1, x, y, Math.max(rx, ry));
    g.addColorStop(0, shadeHex(col, 1.55)); g.addColorStop(0.5, col); g.addColorStop(1, shadeHex(col, 0.72));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.fill();
  }
  function shadeHex(hex, f) { const n = parseInt(hex.slice(1), 16); const c = (v) => Math.max(0, Math.min(255, Math.round(f > 1 ? v + (255 - v) * (f - 1) : v * f))); return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`; }
  function heart(x, y, s, col) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y + s * 0.9);
    ctx.bezierCurveTo(x - s * 1.7, y - s * 0.2, x - s * 0.7, y - s * 1.4, x, y - s * 0.4); ctx.bezierCurveTo(x + s * 0.7, y - s * 1.4, x + s * 1.7, y - s * 0.2, x, y + s * 0.9); ctx.fill();
  }
  function star(x, y, s, col, rot = 0) {
    ctx.fillStyle = col; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = rot + (i / 10) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? s * 0.45 : s; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
    ctx.fill();
  }
  /** a glossy obby block with a top face and side shading */
  function block3d(x, y, w, h, col) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, shadeHex(col, 1.35)); g.addColorStop(0.5, col); g.addColorStop(1, shadeHex(col, 0.65));
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = shadeHex(col, 1.5); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 10, y - 10); ctx.lineTo(x + w + 10, y - 10); ctx.lineTo(x + w, y); ctx.fill();
    ctx.fillStyle = shadeHex(col, 0.55); ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + 10, y - 10); ctx.lineTo(x + w + 10, y + h - 10); ctx.lineTo(x + w, y + h); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.3)"; ctx.fillRect(x + w * 0.12, y + h * 0.1, w * 0.18, Math.min(10, h * 0.2));
  }
  function puff(x, y, c, n = 14, g = 0.2) { for (let i = 0; i < n; i++) parts.push({ x, y, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 6, g, l: 1, d: 0.02, c, s: 8 + Math.random() * 8 }); }
  function hearts(x, y, n = 6) { for (let i = 0; i < n; i++) parts.push({ x: x + (Math.random() - 0.5) * 110, y: y + (Math.random() - 0.5) * 50, vx: (Math.random() - 0.5) * 1.6, vy: -1.2 - Math.random() * 1.6, g: -0.01, l: 1, d: 0.012, c: ["#ff5fa2", "#ff7a9e", "#ff4b6e"][i % 3], s: 11 + Math.random() * 9, h: 1 }); }

  /* ---------- the frame ---------- */
  function draw() {
    raf = requestAnimationFrame(draw);
    A.t += 1 / 60;
    const VW = W / k, t = A.t;
    cam += (A.x - (party ? Math.max(250, Math.min(384, VW * 0.3)) : camOff(VW)) - cam) * 0.08; // at the party the podium sits left of the subtitle
    const night = amb("night", VW), dawn = amb("morning", VW);
    ctx.save(); ctx.scale(k, k);
    // sky: day → sunrise near the "good morning" friend → night near the "good night" friend
    ctx.fillStyle = lin(0, 0, 0, 720, "#5ec8ff", "#dff6ff"); ctx.fillRect(0, 0, VW, 720);
    if (dawn > 0) {
      const g = ctx.createLinearGradient(0, 0, 0, GY); g.addColorStop(0, "#ff9f6b"); g.addColorStop(0.6, "#ffd58a"); g.addColorStop(1, "#fff1c2");
      ctx.globalAlpha = dawn * 0.92; ctx.fillStyle = g; ctx.fillRect(0, 0, VW, 720); ctx.globalAlpha = 1;
    }
    if (night > 0) {
      const g = ctx.createLinearGradient(0, 0, 0, GY); g.addColorStop(0, "#0b1240"); g.addColorStop(0.7, "#2b3a8f"); g.addColorStop(1, "#5a62b8");
      ctx.globalAlpha = night; ctx.fillStyle = g; ctx.fillRect(0, 0, VW, 720);
      for (let i = 0; i < 28; i++) { ctx.globalAlpha = night * (0.55 + 0.45 * Math.sin(t * 2.4 + i * 1.7)); star(((i * 197) % 1000) / 1000 * VW, 96 + ((i * 83) % 120), 5 + (i % 3) * 2.5, "#fff6c2", i); }
      ctx.globalAlpha = night; drawMoon(Math.min(210, VW * 0.2), 168, 46); ctx.globalAlpha = 1;
    }
    ctx.globalAlpha = 1 - 0.75 * night;
    for (let i = 0; i < 6; i++) { const cx = ((i * 420 - cam * 0.2) % (VW + 400) + VW + 400) % (VW + 400) - 200; if (IM.cloud.complete) ctx.drawImage(IM.cloud, cx, 60 + (i % 3) * 50, 160, 160); }
    ctx.globalAlpha = 1;
    // stadium silhouette far away
    ctx.fillStyle = "rgba(60,90,160,.25)";
    for (let i = 0; i < 8; i++) { const sx = ((i * 380 - cam * 0.35) % (VW + 380) + VW + 380) % (VW + 380) - 190; ctx.fillRect(sx, GY - 230, 300, 230); ctx.fillRect(sx + 20, GY - 260, 20, 40); ctx.fillRect(sx + 260, GY - 260, 20, 40); }
    if (dawn > 0) { const st = stops.find((s) => s.kind === "morning"); drawSun(st.x - camOff(VW) * 0.45 - cam, GY + 80 - 330 * Math.max(st.v.rise, 0.22 * dawn), dawn); }
    for (let i = 0; i < 7; i++) { const px = ((i * 330 + 120 - cam * 0.5) % (VW + 330) + VW + 330) % (VW + 330) - 160; if (IM.palm.complete) ctx.drawImage(IM.palm, px, GY - 260, 200, 260); }
    ctx.translate(-cam, 0);
    // ground blocks (obby studs)
    const x0 = Math.floor(cam / 80) * 80;
    for (let x = x0; x < cam + VW + 80; x += 80) {
      const c = ["#35d35a", "#2fbf50"][(x / 80) & 1];
      const gg = ctx.createLinearGradient(0, GY, 0, GY + 40); gg.addColorStop(0, "#8ff27a"); gg.addColorStop(0.25, c); gg.addColorStop(1, "#1f8a3a");
      ctx.fillStyle = gg; ctx.fillRect(x, GY, 80, 40);
      ctx.fillStyle = lin(0, GY + 40, 0, 720, "#a8703f", "#5a3518"); ctx.fillRect(x, GY + 40, 80, 720 - GY);
      ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.beginPath(); ctx.ellipse(x + 23, GY + 10, 10, 5, 0, 0, 7); ctx.ellipse(x + 57, GY + 10, 10, 5, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,.12)"; ctx.fillRect(x + 78, GY, 2, 40);
    }
    // the friends' scenes, the flags, the finish, the runner
    const seen = stops.filter((st) => st.x > cam - 700 && st.x < cam + VW + 250);
    seen.forEach((st) => { SCENE[st.kind](st); drawFriend(st.f); PROP[st.kind] && PROP[st.kind](st, false); });
    flags.forEach((f) => { ctx.fillStyle = "#fff"; ctx.fillRect(f.x, GY - 160, 8, 160); ctx.fillStyle = f.up ? "#ffc83d" : "#aaa"; const fy = GY - 40 - 110 * f.up; ctx.beginPath(); ctx.moveTo(f.x + 8, fy - 40); ctx.lineTo(f.x + 80, fy - 20); ctx.lineTo(f.x + 8, fy); ctx.fill(); });
    drawFinish();
    drawAvatar();
    seen.forEach((st) => PROP[st.kind] && PROP[st.kind](st, true));
    if (night > 0) { // the world dims too; only the bedside lamp glows
      const g = ctx.createLinearGradient(0, 190, 0, 290); g.addColorStop(0, "rgba(14,20,72,0)"); g.addColorStop(1, `rgba(14,20,72,${0.3 * night})`);
      ctx.fillStyle = g; ctx.fillRect(cam, 190, VW, 530);
      seen.forEach((st) => { if (st.kind === "night") lampGlow(st); });
    }
    // particles: sparkles, dust and hearts
    parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += p.g; p.l -= p.d; ctx.globalAlpha = Math.max(0, Math.min(1, p.l * 1.6)); if (p.h) heart(p.x, p.y, p.s, p.c); else { ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s); } });
    ctx.globalAlpha = 1; parts = parts.filter((p) => p.l > 0);
    ctx.restore();
  }
  /** the rising sun (screen coordinates): glow, turning rays, a happy face */
  function drawSun(x, y, a) {
    const g = ctx.createRadialGradient(x, y, 20, x, y, 230); g.addColorStop(0, `rgba(255,236,150,${0.75 * a})`); g.addColorStop(1, "rgba(255,236,150,0)");
    ctx.fillStyle = g; ctx.fillRect(x - 230, y - 230, 460, 460);
    ctx.globalAlpha = a; ctx.strokeStyle = "#ffb020"; ctx.lineWidth = 9; ctx.lineCap = "round";
    for (let i = 0; i < 12; i++) { const an = A.t * 0.4 + (i / 12) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * 76, y + Math.sin(an) * 76); ctx.lineTo(x + Math.cos(an) * (96 + (i % 2) * 10), y + Math.sin(an) * (96 + (i % 2) * 10)); ctx.stroke(); }
    ball(x, y, 62, "#ffd21f");
    disc(x - 20, y - 6, 6, "#7a4a00"); disc(x + 20, y - 6, 6, "#7a4a00");
    ctx.strokeStyle = "#7a4a00"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y + 6, 20, 0.25, Math.PI - 0.25); ctx.stroke();
    ctx.fillStyle = "rgba(255,120,120,.5)"; ctx.beginPath(); ctx.ellipse(x - 34, y + 12, 10, 6, 0, 0, 7); ctx.ellipse(x + 34, y + 12, 10, 6, 0, 0, 7); ctx.fill();
    ctx.lineCap = "butt"; ctx.globalAlpha = 1;
  }
  /** a fat crescent moon (screen coordinates; the caller sets the alpha) */
  function drawMoon(x, y, r) {
    const a = 1, e = 0.3, r2 = Math.hypot(e, Math.sin(a)) * r, a2 = Math.atan2(Math.sin(a), -e);
    const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 3); g.addColorStop(0, "rgba(255,240,170,.35)"); g.addColorStop(1, "rgba(255,240,170,0)");
    ctx.fillStyle = g; ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
    ctx.fillStyle = lin(x - r, y - r, x + r, y + r, "#fff6c2", "#ffd45a");
    ctx.beginPath(); ctx.arc(x, y, r, -a, a, true); ctx.arc(x + (Math.cos(a) + e) * r, y, r2, a2, Math.PI * 2 - a2, false); ctx.closePath(); ctx.fill();
  }

  /* ---------- the friends (pictures from art.js) with paws that wave, stretch and cheer ---------- */
  function drawFriend(f) {
    if (!f.img.complete || f.s <= 0.02) return;
    const t = A.t, u = (f.size * f.s) / 200; // one unit of the 200-unit picture
    if (f.happy) { f.hop = Math.abs(Math.sin(t * 9 + f.ph)) * 24; if (Math.random() < 0.06) hearts(f.x, f.y - f.size * 0.95, 1); }
    ctx.save(); ctx.translate(f.x, f.y - f.hop); ctx.rotate(f.tilt + (f.mode === "wave" ? Math.sin(t * 5) * 0.03 : 0));
    const sq = f.mode === "stretch" ? 1 + 0.035 * Math.sin(t * 2.2) : 1; ctx.scale(1 / Math.sqrt(sq), sq);
    ctx.drawImage(f.img, -100 * u, -188 * u, 200 * u, 200 * u);
    if (f.pj) { // striped pyjamas over the tummy (the pin stays on top) and a night cap
      ctx.save(); ctx.beginPath(); ctx.ellipse(0, -38 * u, 50 * u, 36 * u, 0, 0, 7); ctx.clip();
      ctx.beginPath(); ctx.rect(-80 * u, -120 * u, 160 * u, 102 * u); ctx.arc(0, -102 * u, 63 * u, 0, 7); ctx.clip("evenodd");
      ctx.fillStyle = lin(-50 * u, 0, 50 * u, 0, "#8fb8ff", "#4f7fe6"); ctx.fillRect(-60 * u, -80 * u, 120 * u, 70 * u);
      ctx.fillStyle = "rgba(255,255,255,.7)"; for (let i = -3; i <= 3; i++) ctx.fillRect((i * 15 - 2.5) * u, -80 * u, 5 * u, 70 * u);
      ctx.restore();
      ctx.drawImage(PIN, -21.85 * u, -59.85 * u, 43.7 * u, 45.6 * u);
      ctx.fillStyle = lin(-40 * u, -190 * u, 60 * u, -130 * u, "#8fb8ff", "#4f7fe6");
      ctx.beginPath(); ctx.moveTo(-44 * u, -147 * u); ctx.quadraticCurveTo(-20 * u, -206 * u, 30 * u, -190 * u); ctx.quadraticCurveTo(64 * u, -180 * u, 76 * u, -150 * u); ctx.quadraticCurveTo(52 * u, -168 * u, 44 * u, -147 * u); ctx.quadraticCurveTo(0, -172 * u, -44 * u, -147 * u); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 11 * u; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-44 * u, -146 * u); ctx.quadraticCurveTo(0, -171 * u, 44 * u, -146 * u); ctx.stroke(); ctx.lineCap = "butt";
      ball(78 * u, -146 * u, 10 * u, "#ffffff");
    }
    // paws: angle 0 hangs down, π points straight up
    const paw = (side, ang) => {
      const sx = side * 40 * u, sy = -56 * u, ex = sx + side * Math.sin(ang) * 58 * u, ey = sy + Math.cos(ang) * 58 * u;
      ctx.strokeStyle = shadeHex(f.fur, 0.86); ctx.lineWidth = 21 * u; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke(); ctx.lineCap = "butt";
      ball(ex, ey, 14 * u, f.fur);
      return [ex, ey];
    };
    if (f.mode === "wave") paw(-1, 2.35 + Math.sin(t * 10) * 0.4);
    if (f.mode === "stretch") { paw(-1, 2.5 + Math.sin(t * 2.2) * 0.14); paw(1, 2.5 + Math.sin(t * 2.2) * 0.14); }
    if (f.mode === "cheer") { paw(-1, 2.45 + Math.sin(t * 9 + f.ph) * 0.3); paw(1, 2.45 - Math.sin(t * 9 + f.ph) * 0.3); }
    if (f.pj) { const [ex, ey] = paw(1, 1.45); teddy(ex + 6 * u, ey + 20 * u, 58 * u); ball(ex, ey, 14 * u, f.fur); }
    ctx.restore();
  }
  /** a little teddy bear, s tall, centred on x,y */
  function teddy(x, y, s) {
    const c = "#c98a4f", d = "#a8703f";
    ball(x - s * 0.2, y + s * 0.4, s * 0.13, d); ball(x + s * 0.2, y + s * 0.4, s * 0.13, d);
    ball(x, y + s * 0.18, s * 0.26, c, s * 0.28); ball(x - s * 0.27, y + s * 0.08, s * 0.1, d); ball(x + s * 0.27, y + s * 0.08, s * 0.1, d);
    ball(x - s * 0.2, y - s * 0.4, s * 0.1, d); ball(x + s * 0.2, y - s * 0.4, s * 0.1, d); ball(x, y - s * 0.22, s * 0.26, c);
    ctx.fillStyle = "#f2d0a8"; ctx.beginPath(); ctx.ellipse(x, y - s * 0.15, s * 0.12, s * 0.09, 0, 0, 7); ctx.fill();
    disc(x - s * 0.1, y - s * 0.27, s * 0.035, INK); disc(x + s * 0.1, y - s * 0.27, s * 0.035, INK); disc(x, y - s * 0.17, s * 0.04, "#3a2530");
  }

  /* ---------- the five little sets (drawn behind the friend) ---------- */
  function flower(x, y, col, ph) {
    const sw = Math.sin(A.t * 2 + ph) * 3;
    ctx.strokeStyle = "#2fa84a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x, y - 16, x + sw, y - 30); ctx.stroke();
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + ph; disc(x + sw + Math.cos(a) * 8, y - 30 + Math.sin(a) * 8, 6.5, col); }
    disc(x + sw, y - 30, 5, "#fff6c2");
  }
  const SCENE = {
    /* a garden gate under an arch of roses, a picket fence, flowers */
    hello(st) {
      const x = st.x;
      const fence = (a, b) => {
        ctx.fillStyle = "#dfe6f3"; ctx.fillRect(a, GY - 58, b - a, 9); ctx.fillRect(a, GY - 28, b - a, 9);
        for (let px = a + 4; px < b - 14; px += 26) { ctx.fillStyle = lin(px, 0, px + 18, 0, "#ffffff", "#cdd6ea"); ctx.beginPath(); ctx.moveTo(px, GY); ctx.lineTo(px, GY - 66); ctx.lineTo(px + 9, GY - 80); ctx.lineTo(px + 18, GY - 66); ctx.lineTo(px + 18, GY); ctx.fill(); }
      };
      fence(x - 196, x + 104); fence(x + 366, x + 580);
      [[-160, "#ff5fa2"], [-108, "#ffd21f"], [-56, "#ff7ab0"], [396, "#ffd21f"], [448, "#ff5fa2"], [500, "#9b6bff"], [552, "#ffd21f"]].forEach(([dx, col], i) => flower(x + dx, GY - 4, col, i));
      // the gate itself, swung open
      ctx.fillStyle = lin(x + 326, 0, x + 372, 0, "#ffffff", "#c3cde4"); ctx.beginPath(); ctx.moveTo(x + 326, GY - 84); ctx.lineTo(x + 370, GY - 102); ctx.lineTo(x + 370, GY - 8); ctx.lineTo(x + 326, GY); ctx.fill();
      ctx.strokeStyle = "#aab6d4"; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 1; i < 4; i++) { ctx.moveTo(x + 326 + i * 11, GY - 84 - i * 4.5); ctx.lineTo(x + 326 + i * 11, GY - i * 2); } ctx.stroke();
      // posts and the leafy arch with roses
      [x + 96, x + 316].forEach((px) => { ctx.fillStyle = lin(px, 0, px + 18, 0, "#c8874a", "#7a4826"); ctx.fillRect(px, GY - 180, 18, 180); ball(px + 9, GY - 182, 13, "#b5773f"); });
      const P = [[x + 105, GY - 178], [x + 111, GY - 266], [x + 319, GY - 266], [x + 325, GY - 178]];
      const arch = (w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); ctx.bezierCurveTo(P[1][0], P[1][1], P[2][0], P[2][1], P[3][0], P[3][1]); ctx.stroke(); ctx.lineCap = "butt"; };
      arch(32, "#2a9a45"); arch(15, "#55cf68");
      for (let i = 0; i <= 8; i++) {
        const q = i / 8, m = 1 - q, bx = m * m * m * P[0][0] + 3 * m * m * q * P[1][0] + 3 * m * q * q * P[2][0] + q * q * q * P[3][0], by = m * m * m * P[0][1] + 3 * m * m * q * P[1][1] + 3 * m * q * q * P[2][1] + q * q * q * P[3][1];
        ball(bx, by + (i % 2 ? 7 : -7), 10, i % 3 ? "#ff7ab0" : "#fff1f6"); disc(bx, by + (i % 2 ? 7 : -7), 3.5, "#ffd21f");
      }
    },
    /* a little house: the door opens, the alarm clock rings on the window sill, the rooster crows on its post */
    morning(st) {
      const x = st.x, v = st.v;
      ctx.fillStyle = lin(0, GY - 200, 0, GY, "#fff6dc", "#f0d6a2"); ctx.fillRect(x + 110, GY - 200, 320, 200);
      ctx.fillStyle = lin(0, GY - 286, 0, GY - 196, "#ff8466", "#c8402e"); ctx.beginPath(); ctx.moveTo(x + 84, GY - 196); ctx.lineTo(x + 270, GY - 284); ctx.lineTo(x + 456, GY - 196); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.beginPath(); ctx.moveTo(x + 104, GY - 200); ctx.lineTo(x + 270, GY - 278); ctx.lineTo(x + 270, GY - 268); ctx.lineTo(x + 130, GY - 200); ctx.fill();
      // door: frame, the warm inside, and the leaf swinging open to the right
      ctx.fillStyle = "#8a5530"; ctx.fillRect(x + 140, GY - 192, 150, 192);
      ctx.fillStyle = lin(0, GY - 184, 0, GY, "#ffe9a8", "#ffb85c"); ctx.fillRect(x + 150, GY - 183, 130, 183);
      const dw = 130 * (1 - 0.84 * v.door);
      ctx.fillStyle = lin(x + 280 - dw, 0, x + 280, 0, "#e08040", "#a84e22"); ctx.fillRect(x + 280 - dw, GY - 183, dw, 183);
      if (dw > 60) { ctx.strokeStyle = "rgba(90,40,10,.35)"; ctx.lineWidth = 4; ctx.strokeRect(x + 296 - dw, GY - 168, dw - 32, 66); ctx.strokeRect(x + 296 - dw, GY - 88, dw - 32, 70); }
      ball(x + 280 - dw + 14, GY - 92, 7, "#ffc83d");
      // window + sill
      ctx.fillStyle = "#8a5530"; ctx.fillRect(x + 314, GY - 176, 98, 92); ctx.fillStyle = lin(0, GY - 170, 0, GY - 90, "#bfe9ff", "#7fc6f5"); ctx.fillRect(x + 321, GY - 169, 84, 78);
      ctx.fillStyle = "#8a5530"; ctx.fillRect(x + 360, GY - 169, 6, 78); ctx.fillStyle = "#b5773f"; ctx.fillRect(x + 306, GY - 88, 114, 10);
      alarm(x + 363, GY - 118, v.ring);
      // fence post + rooster
      ctx.fillStyle = lin(x + 486, 0, x + 502, 0, "#c8874a", "#7a4826"); ctx.fillRect(x + 486, GY - 116, 16, 116); ctx.fillStyle = "#b5773f"; ctx.fillRect(x + 480, GY - 120, 28, 8);
      rooster(x + 494, GY - 120, v.crow);
      flower(x + 452, GY - 4, "#ff7ab0", 1); flower(x + 84, GY - 4, "#ffd21f", 2);
    },
    /* a party corner: bunting, balloons, more presents */
    thanks(st) {
      const x = st.x, t = A.t;
      [x + 92, x + 524].forEach((px) => { ctx.fillStyle = lin(px, 0, px + 12, 0, "#f3f6ff", "#aab6d4"); ctx.fillRect(px, GY - 246, 12, 246); ball(px + 6, GY - 250, 10, "#ffc83d"); });
      const q = (m) => [lerp(x + 98, x + 530, m), GY - 244 + 4 * 46 * m * (1 - m)];
      ctx.strokeStyle = "#8a94b8"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 98, GY - 244); ctx.quadraticCurveTo(x + 314, GY - 152, x + 530, GY - 244); ctx.stroke();
      for (let i = 1; i < 12; i++) { const [bx, by] = q(i / 12), sw = Math.sin(t * 3 + i) * 3; ctx.fillStyle = ["#ff5fa2", "#ffd21f", "#4cc9ff", "#35d35a", "#9b6bff"][i % 5]; ctx.beginPath(); ctx.moveTo(bx - 14, by - 2); ctx.lineTo(bx + 14, by - 2); ctx.lineTo(bx + sw, by + 30); ctx.fill(); }
      [[392, 150, "#ff5fa2", 0], [432, 186, "#4cc9ff", 1.3], [470, 144, "#ffd21f", 2.6]].forEach(([dx, hh, col, ph]) => {
        const bx = x + dx + Math.sin(t * 1.6 + ph) * 6, by = GY - hh + Math.cos(t * 1.9 + ph) * 4;
        ctx.strokeStyle = "rgba(90,100,140,.7)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, by + 34); ctx.quadraticCurveTo(bx + 8, by + 70, x + 436, GY - 34); ctx.stroke();
        ball(bx, by, 27, col, 33); ctx.fillStyle = shadeHex(col, 0.75); ctx.beginPath(); ctx.moveTo(bx, by + 32); ctx.lineTo(bx - 6, by + 41); ctx.lineTo(bx + 6, by + 41); ctx.fill();
      });
      if (IM.gift.complete) { ctx.drawImage(IM.gift, x + 384, GY - 98, 104, 104); ctx.drawImage(IM.gift, x + 462, GY - 66, 70, 70); }
    },
    /* by the library shelf */
    sorry(st) {
      const x = st.x;
      ctx.fillStyle = lin(x + 440, 0, x + 540, 0, "#b5773f", "#7a4826"); rr(x + 440, GY - 206, 100, 206, 8); ctx.fill();
      for (let r = 0; r < 3; r++) {
        const y = GY - 196 + r * 64; ctx.fillStyle = "#5a3518"; ctx.fillRect(x + 448, y, 84, 56);
        for (let i = 0, bx = x + 451; i < 7; i++) { const w = 9 + ((i * 7 + r * 3) % 4), hh = 40 + ((i * 5 + r * 7) % 12); ctx.fillStyle = ["#ff4f7b", "#35d35a", "#3d8bff", "#ffd21f", "#9b6bff", "#ff9a2e", "#4cc9ff"][(i + r * 2) % 7]; ctx.fillRect(bx, y + 56 - hh, w, hh); ctx.fillStyle = "rgba(255,255,255,.4)"; ctx.fillRect(bx + 1, y + 60 - hh, 2, hh - 8); bx += w + 1; }
      }
      flower(x - 120, GY - 4, "#ff7ab0", 0); flower(x - 70, GY - 4, "#ffd21f", 1.4);
    },
    /* a cosy bedroom: starry wallpaper, window, bedside lamp, bed */
    night(st) {
      const x = st.x, v = st.v;
      ctx.fillStyle = lin(0, GY - 262, 0, GY, "#7a6cd6", "#51449f"); ctx.beginPath(); ctx.moveTo(x + 92, GY); ctx.lineTo(x + 92, GY - 236); ctx.arcTo(x + 92, GY - 262, x + 118, GY - 262, 26); ctx.lineTo(x + 518, GY - 262); ctx.arcTo(x + 544, GY - 262, x + 544, GY - 236, 26); ctx.lineTo(x + 544, GY); ctx.fill(); ctx.fillStyle = "#3d3380"; ctx.fillRect(x + 92, GY - 14, 452, 14);
      for (let i = 0; i < 16; i++) star(x + 118 + ((i * 97) % 410), GY - 244 + ((i * 59) % 200), 5, "rgba(255,255,255,.22)", i);
      // window with the night outside
      ctx.fillStyle = "#f3f6ff"; rr(x + 392, GY - 244, 112, 96, 10); ctx.fill(); ctx.fillStyle = "#0f1750"; ctx.fillRect(x + 400, GY - 236, 96, 80);
      star(x + 418, GY - 216, 6, "#fff6c2"); star(x + 478, GY - 176, 5, "#fff6c2"); star(x + 440, GY - 172, 4, "#fff6c2"); drawMoon(x + 462, GY - 208, 15);
      ctx.fillStyle = "#f3f6ff"; ctx.fillRect(x + 445, GY - 236, 6, 80);
      // rug
      ctx.fillStyle = "#ff8db3"; ctx.beginPath(); ctx.ellipse(x + 250, GY + 3, 150, 11, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#ffc2d6"; ctx.beginPath(); ctx.ellipse(x + 250, GY + 3, 120, 7, 0, 0, 7); ctx.fill();
      // bedside table + lamp
      ctx.fillStyle = lin(x + 318, 0, x + 364, 0, "#c8874a", "#8a5530"); rr(x + 318, GY - 66, 46, 66, 6); ctx.fill(); ball(x + 341, GY - 40, 5, "#ffc83d");
      ctx.fillStyle = "#8a94b8"; ctx.fillRect(x + 338, GY - 110, 6, 44); ctx.fillStyle = "#6f7aa8"; rr(x + 326, GY - 72, 30, 8, 4); ctx.fill();
      ctx.fillStyle = v.lamp > 0.5 ? lin(0, GY - 150, 0, GY - 106, "#fff6c2", "#ffc83d") : "#8f86c9"; ctx.beginPath(); ctx.moveTo(x + 324, GY - 150); ctx.lineTo(x + 358, GY - 150); ctx.lineTo(x + 370, GY - 106); ctx.lineTo(x + 312, GY - 106); ctx.fill();
      // bed: foot board, mattress, pillow, blanket, head board
      ctx.fillStyle = lin(x + 376, 0, x + 392, 0, "#c8874a", "#8a5530"); rr(x + 376, GY - 92, 16, 92, 7); ctx.fill(); rr(x + 524, GY - 146, 18, 146, 8); ctx.fill();
      ctx.fillStyle = "#f3f6ff"; rr(x + 388, GY - 72, 140, 44, 10); ctx.fill(); ctx.fillStyle = "#8a5530"; ctx.fillRect(x + 388, GY - 32, 140, 12);
      ball(x + 494, GY - 82, 30, "#ffffff", 16);
      ctx.fillStyle = lin(0, GY - 86, 0, GY - 24, "#7fa8ff", "#4f7fe6"); rr(x + 384, GY - 82, 88, 58, 12); ctx.fill(); ctx.fillStyle = "#e3ecff"; rr(x + 456, GY - 84, 20, 60, 8); ctx.fill();
      star(x + 408, GY - 60, 7, "#ffe58a"); star(x + 436, GY - 44, 6, "#ffe58a");
    }
  };
  /** the lamp's warm light over the dimmed room */
  function lampGlow(st) {
    const x = st.x + 341, y = GY - 128, a = st.v.lamp;
    const g = ctx.createRadialGradient(x, y, 10, x, y, 230); g.addColorStop(0, `rgba(255,228,140,${0.42 * a})`); g.addColorStop(1, "rgba(255,228,140,0)");
    ctx.fillStyle = g; ctx.fillRect(x - 230, y - 230, 460, 460);
  }
  function alarm(x, y, ring) {
    const t = A.t; x += ring ? Math.sin(t * 70) * 3 : 0;
    ctx.strokeStyle = "#b8323a"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x - 14, y + 18); ctx.lineTo(x - 21, y + 29); ctx.moveTo(x + 14, y + 18); ctx.lineTo(x + 21, y + 29); ctx.stroke(); ctx.lineCap = "butt";
    ball(x - 17, y - 22, 10, "#ffc83d"); ball(x + 17, y - 22, 10, "#ffc83d"); ctx.fillStyle = "#8a94b8"; ctx.fillRect(x - 2 + (ring ? Math.sin(t * 70) * 9 : 0), y - 36, 4, 12);
    ball(x, y, 27, "#ff4b55"); disc(x, y, 20, "#fff");
    ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 14); ctx.moveTo(x, y); ctx.lineTo(x - 7, y + 8); ctx.stroke(); disc(x, y, 3, INK);
    if (ring) { ctx.strokeStyle = "#ff7a1f"; ctx.lineWidth = 4; for (let i = 0; i < 2; i++) { const rad = 38 + i * 11 + (Math.sin(t * 20) > 0 ? 3 : 0); ctx.beginPath(); ctx.arc(x, y - 6, rad, -0.55, 0.25); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y - 6, rad, Math.PI - 0.25, Math.PI + 0.55); ctx.stroke(); } }
    ctx.lineCap = "butt";
  }
  /** a rooster standing on x,y and looking to the left; it throws its head back to crow */
  function rooster(x, y, crow) {
    const t = A.t;
    ctx.save(); ctx.translate(x, y); ctx.scale(-1.15, 1.15);
    ctx.strokeStyle = "#ffb020"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(-6, 0); ctx.moveTo(7, -8); ctx.lineTo(7, 0); ctx.stroke();
    [["#26547c", -1.0], ["#2a9d8f", -0.62], ["#ffb020", -0.25]].forEach(([col, a]) => { ctx.save(); ctx.translate(-14, -26); ctx.rotate(a); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(-20, 0, 22, 7.5, 0, 0, 7); ctx.fill(); ctx.restore(); });
    ball(0, -26, 24, "#e8683a", 20); ctx.fillStyle = "#c24a22"; ctx.beginPath(); ctx.ellipse(-4, -24, 13, 8, 0.3, 0, 7); ctx.fill();
    ctx.translate(15, -40); ctx.rotate(crow ? -0.6 + Math.sin(t * 30) * 0.05 : 0);
    disc(-4, -18, 5, "#ff3b3b"); disc(2, -21, 6, "#ff3b3b"); disc(8, -17, 5, "#ff3b3b"); ball(1, -7, 12.5, "#f07a48"); disc(9, 4, 4.5, "#ff3b3b");
    ctx.fillStyle = "#ffb020"; ctx.beginPath();
    if (crow) { ctx.moveTo(11, -12); ctx.lineTo(27, -15); ctx.lineTo(12, -7); ctx.moveTo(11, -5); ctx.lineTo(24, -1); ctx.lineTo(11, -1); } else { ctx.moveTo(11, -11); ctx.lineTo(26, -6); ctx.lineTo(11, -2); }
    ctx.fill(); disc(5, -9, 2.5, INK);
    ctx.restore();
    if (crow) { ctx.strokeStyle = "#ff7a1f"; ctx.lineWidth = 4; ctx.lineCap = "round"; for (let i = 0; i < 3; i++) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 14 - i); ctx.beginPath(); ctx.arc(x - 30, y - 74, 26 + i * 13, Math.PI * 1.02, Math.PI * 1.4); ctx.stroke(); } ctx.globalAlpha = 1; ctx.lineCap = "butt"; }
  }

  /* ---------- props that move: the present, the books (front = drawn over the runner) ---------- */
  const PROP = {
    thanks(st, front) {
      const f = st.f, v = st.v; if (v.gs <= 0 || front !== v.take > 0.5 || !IM.gift.complete) return;
      const gx = lerp(f.x - 4 - 84 * v.offer, A.x + 4, v.take), gy = lerp(f.y - f.hop - 64 - 22 * v.offer + Math.sin(A.t * 4) * 4 * v.offer, A.y - 70, v.take), S = 108 * v.gs;
      if (v.take < 0.5) { ball(gx - 46, gy + 8, 14, f.fur); ball(gx + 46, gy + 8, 14, f.fur); }
      ctx.drawImage(IM.gift, gx - S / 2, gy - S * 0.56, S, S);
      if (v.take < 0.5) { ball(gx - 50, gy + 12, 9, f.fur); ball(gx + 50, gy + 12, 9, f.fur); }
      else if (v.gs === 1) { ctx.fillStyle = "#ffd3a8"; ctx.fillRect(gx - 54, gy - 4, 16, 18); ctx.fillRect(gx + 38, gy - 4, 16, 18); } // the runner's hands hug it
      if (v.offer > 0.9 && v.take < 0.1 && Math.random() < 0.2) parts.push({ x: gx + (Math.random() - 0.5) * 110, y: gy - 60 + Math.random() * 80, vx: 0, vy: -0.6, g: 0, l: 0.8, d: 0.025, c: "#ffe58a", s: 6 });
    },
    sorry(st, front) {
      const f = st.f, v = st.v, t = A.t;
      if (front === !v.carry) {
        v.books.forEach((b, i) => {
          if (v.carry) { b.x = f.x + (i % 2 ? 4 : -3); b.y = f.y - f.hop - (v.carry === "high" ? 84 : 26) - i * 17; b.r = 0; }
          ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r);
          ctx.fillStyle = lin(0, -8, 0, 8, shadeHex(b.col, 1.3), shadeHex(b.col, 0.75)); rr(-42, -8, 84, 16, 3); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.fillRect(-36, -5, 76, 5); ctx.fillStyle = "rgba(0,0,0,.2)"; ctx.fillRect(-42, -8, 7, 16);
          ctx.restore();
        });
        if (v.carry) { const py = f.y - f.hop - (v.carry === "high" ? 96 : 40); ball(f.x - 46, py, 14, f.fur); ball(f.x + 47, py, 14, f.fur); }
      }
      if (!front) return;
      if (v.bang > 0) { // the bump
        v.bang -= 0.03; const s = 40 + 50 * (1 - v.bang);
        ctx.globalAlpha = Math.max(0, v.bang); ctx.fillStyle = "#ffd21f"; ctx.strokeStyle = "#ff7a1f"; ctx.lineWidth = 5; ctx.beginPath();
        for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? s * 0.5 : s; ctx.lineTo(st.x + 112 + Math.cos(a) * r, GY - 112 + Math.sin(a) * r); }
        ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1;
      }
      if (v.dizzy) [[A.x, A.y - 222], [f.x, f.y - 176]].forEach(([hx, hy]) => { for (let j = 0; j < 3; j++) { const a = t * 4 + j * 2.09; star(hx + Math.cos(a) * 38, hy + Math.sin(a) * 11, 9, "#ffd21f", a); } });
    }
  };

  function drawFinish() {
    const x = finishX; if (!x) return;
    ctx.fillStyle = "#26293a"; ctx.fillRect(x, GY - 300, 12, 300); ctx.fillRect(x + 600, GY - 300, 12, 300);
    for (let i = 0; i < 20; i++) for (let j = 0; j < 2; j++) { ctx.fillStyle = (i + j) % 2 ? "#111" : "#fff"; ctx.fillRect(x + i * 30.6, GY - 300 + j * 26, 31, 26); }
    ctx.font = "700 44px Fredoka, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#ffc83d"; ctx.fillText("FINISH", x + 306, GY - 320);
    // winners' podium
    [[690, 40, "#c9d6ff", "2"], [800, PODIUM, "#ffc83d", "1"], [910, 28, "#e0915a", "3"]].forEach(([dx, hh, col, n]) => {
      block3d(x + dx, GY - hh, 110, hh, col);
      ctx.font = "700 30px Fredoka, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "rgba(10,22,51,.75)"; ctx.fillText(n, x + dx + 55, GY - hh / 2 + 11);
    });
    crowd.forEach(drawFriend);
  }
  function drawAvatar() {
    const { x, y, pose, t, color } = A;
    ctx.save(); ctx.translate(x, y); ctx.rotate(A.rot);
    const sw = pose === "run" ? Math.sin(t * 18) : 0, wig = Math.sin(t * 11);
    // legs
    ctx.fillStyle = "#3d4a8a";
    ctx.save(); ctx.translate(-10, -50); ctx.rotate(sw * 0.7); ctx.fillRect(-9, 0, 18, 50); ctx.restore();
    ctx.save(); ctx.translate(10, -50); ctx.rotate(-sw * 0.7); ctx.fillRect(-9, 0, 18, 50); ctx.restore();
    // everything above the hips leans forward in a bow
    ctx.translate(0, -50); ctx.rotate(A.bow); ctx.translate(0, 50);
    const tg = ctx.createLinearGradient(-26, -110, 26, -48); tg.addColorStop(0, shadeHex(color, 1.35)); tg.addColorStop(1, shadeHex(color, 0.7)); ctx.fillStyle = tg; ctx.fillRect(-26, -110, 52, 62);
    ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.font = "700 26px Fredoka"; ctx.textAlign = "center"; ctx.fillText(A.name ? A.name[0] : "", 0, -70);
    // arms: 0 hangs down; the right arm (towards the friend) waves
    const arms = { run: [sw * 0.8, -sw * 0.8], wave: [0.12, -2.45 + wig * 0.45], cheer: [2.6 + wig * 0.2, -2.6 - wig * 0.2], hug: [-0.75, 0.75], oops: [1.5, -1.5] }[pose] || [-A.bow * 0.8, -A.bow * 0.8];
    ctx.fillStyle = "#ffd3a8";
    ctx.save(); ctx.translate(-30, -104); ctx.rotate(arms[0]); ctx.fillRect(-8, 0, 16, 50); ctx.restore();
    ctx.save(); ctx.translate(30, -104); ctx.rotate(arms[1]); ctx.fillRect(-8, 0, 16, 50); ctx.restore();
    // head
    const hg = ctx.createLinearGradient(-24, -158, 24, -110); hg.addColorStop(0, "#ffe6cc"); hg.addColorStop(1, "#e8a878"); ctx.fillStyle = hg; ctx.fillRect(-24, -158, 48, 48);
    ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.fillRect(-18, -152, 12, 6);
    ctx.fillStyle = "#0a1633";
    if (A.bow > 0.15) { ctx.fillRect(-13, -136, 9, 3); ctx.fillRect(5, -136, 9, 3); } else { ctx.fillRect(-12, -140, 7, 9); ctx.fillRect(6, -140, 7, 9); }
    if (pose === "wave" || pose === "cheer" || pose === "hug") { ctx.fillRect(-9, -127, 18, 9); ctx.fillStyle = "#ff7a9e"; ctx.fillRect(-5, -122, 10, 4); }
    else if (pose === "oops") ctx.fillRect(-4, -128, 9, 10); else ctx.fillRect(-8, -124, 16, 4);
    ctx.fillStyle = color; ctx.fillRect(-26, -164, 52, 14);
    ctx.restore();
    // name tag
    ctx.font = "600 24px Fredoka, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "rgba(10,22,51,.7)"; const tw = ctx.measureText(A.name).width + 20; ctx.fillRect(x - tw / 2, y - 205, tw, 32); ctx.fillStyle = "#fff"; ctx.fillText(A.name, x, y - 181);
    if (trophy && IM.trophy.complete) { const s = 120 + Math.sin(t * 5) * 5; ctx.drawImage(IM.trophy, x - s / 2, y - 264 - s / 2 + Math.sin(t * 3) * 4, s, s); }
  }

  async function runTo(x, speed = 340) {
    A.pose = "run"; const x0 = A.x, d = x - x0;
    await tween((Math.abs(d) / speed) * 1000, (t) => { A.x = x0 + d * t; if (Math.random() < 0.15) puff(A.x - 20, GY - 8, "rgba(255,255,255,.7)", 2, 0); });
    A.pose = "idle";
  }
  /** the friend hops for joy, hearts everywhere */
  async function joy(f, ms = 1200) { f.happy = 1; TC.sfx("sparkle"); hearts(f.x, f.y - 150, 8); await wait(ms); f.happy = 0; f.hop = 0; }

  /* ---------- what happens when the runner gets there (before the question) ---------- */
  const ARRIVE = {
    async hello(st) { const f = st.f; TC.sfx("pop"); await tween(450, (t) => (f.hop = Math.sin(t * Math.PI) * 34)); f.hop = 0; },
    async morning(st) {
      const f = st.f, v = st.v, r0 = v.rise; let n = -1;
      v.crow = 1; TC.sfx("levelup");                                         // cock-a-doodle-doo: up comes the sun
      await tween(1300, (t) => (v.rise = lerp(r0, 1, ease(t))));
      v.ring = 1; await tween(700, (t) => { const q = Math.floor(t * 8); if (q !== n) { n = q; TC.sfx("tick"); } }); // rrring!
      v.crow = 0; TC.sfx("pop"); await tween(350, (t) => (v.door = ease(t))); // the door opens …
      f.mode = "stretch"; puff(f.x, GY - 90, "#ffffff", 10, 0.1);           // … and out comes the friend with a big stretch
      await tween(350, (t) => (f.s = t < 0.7 ? (1.12 * t) / 0.7 : 1.12 - (0.12 * (t - 0.7)) / 0.3));
      await wait(500);
    },
    async thanks(st) {
      const f = st.f, v = st.v; TC.sfx("pop");
      await tween(400, (t) => (f.hop = Math.sin(t * Math.PI) * 30)); f.hop = 0;
      TC.sfx("sparkle"); await tween(500, (t) => (v.offer = ease(t)));       // "This is for you!"
      await wait(300);
    },
    async sorry(st) {
      const f = st.f, v = st.v, x = st.x, ax = A.x, fx = f.x;
      A.pose = "run";                                                         // the friend cannot see over the books …
      await tween(800, (t) => { A.x = lerp(ax, x + 84, t); f.x = lerp(fx, x + 186, t); f.tilt = Math.sin(t * 22) * 0.06; });
      TC.sfx("kick"); TC.sfx("wrong"); v.bang = 1; v.carry = ""; A.pose = "oops"; // … bump!
      TC.floatText("Oops!", 36, 30, "#ff8a5c"); puff(x + 112, GY - 112, "#ffd21f", 16, 0.15);
      const from = v.books.map((b) => ({ x: b.x, y: b.y })), land = [[x + 86, GY - 9, 0.04], [x + 104, GY - 27, -0.3], [x + 344, GY - 9, 0.16]];
      await tween(800, (t) => {
        const e = Math.min(1, t / 0.5), q = 1 - (1 - e) * (1 - e), up = Math.sin(e * Math.PI);
        A.x = lerp(x + 84, x, q); A.y = GY - up * 26; A.rot = -0.22 * up;
        f.x = lerp(x + 186, x + 215, q); f.hop = up * 22; f.tilt = 0.2 * up;
        v.books.forEach((b, i) => { b.x = lerp(from[i].x, land[i][0], t); b.y = lerp(from[i].y, land[i][1], t) - Math.sin(t * Math.PI) * (100 + i * 34); b.r = land[i][2] + (1 - t) * (i % 2 ? 5 : -5); });
      });
      TC.sfx("pop"); Object.assign(A, { x, y: GY, rot: 0, pose: "idle" }); f.x = x + 215; f.hop = 0; f.tilt = 0; v.dizzy = 1;
      v.books.forEach((b, i) => { b.x = land[i][0]; b.y = land[i][1]; b.r = land[i][2]; });
      await wait(500);
    },
    async night(st) { st.f.mode = "wave"; TC.sfx("sparkle"); await wait(700); }
  };
  /* ---------- what the runner does when the button is pressed ---------- */
  async function waveHello(st) { A.pose = "wave"; await wait(1000); await joy(st.f); A.pose = "idle"; }
  const REACT = {
    hello: waveHello,
    async morning(st) { st.v.ring = 0; await waveHello(st); },
    async night(st) { await waveHello(st); TC.sfx("pop"); TC.floatText("💤", 46, 34, "#bfe0ff"); await tween(500, (t) => (st.v.lamp = 1 - 0.85 * t)); await wait(400); },
    async thanks(st) {
      const f = st.f, v = st.v;
      TC.sfx("coin"); A.pose = "hug"; f.mode = "cheer";
      await tween(500, (t) => (v.take = ease(t)));                            // hugs the present …
      await tween(800, (t) => (A.bow = Math.sin(t * Math.PI) * 0.42));        // … with a little bow
      A.bow = 0; await joy(f); f.mode = "";
      puff(A.x, A.y - 70, "#ffd21f", 16, 0.1); TC.sfx("sparkle");
      await tween(300, (t) => (v.gs = 1 - t)); v.gs = 0; A.pose = "idle";     // and puts it away
    },
    async sorry(st) {
      const f = st.f, v = st.v;
      v.dizzy = 0;
      for (let i = 0; i < 2; i++) { TC.sfx("pop"); await tween(600, (t) => (A.bow = Math.sin(t * Math.PI) * 0.6)); } // sorry, sorry!
      await tween(250, (t) => (A.bow = 0.75 * t));                            // … and helps to pick the books up
      for (let i = 0; i < v.books.length; i++) {
        const b = v.books[i], p = { x: b.x, y: b.y, r: b.r }; TC.sfx("tick");
        await tween(330, (t) => { const e = ease(t); b.x = lerp(p.x, f.x + (i % 2 ? 4 : -3), e); b.y = lerp(p.y, GY - 26 - i * 17, e) - Math.sin(t * Math.PI) * 60; b.r = p.r * (1 - e); });
      }
      v.carry = "low"; TC.sfx("coin");
      await tween(250, (t) => (A.bow = 0.75 * (1 - t))); A.bow = 0;
      await joy(f);
    }
  };

  const CSS = `.actbtn{position:fixed;left:50%;top:81%;transform:translate(-50%,-50%);z-index:26;width:29vh;height:29vh;border-radius:50%;display:grid;place-items:center;text-align:center;
    font:700 6vh Fredoka,sans-serif;color:#fff;text-shadow:0 .5vh 0 rgba(0,0,0,.3);cursor:pointer;touch-action:manipulation;
    background:radial-gradient(circle at 35% 28%,#ffe9a8,#ffb020 45%,#e06a00);box-shadow:0 2vh 0 #a84e00,0 3vh 5vh rgba(0,0,0,.4),0 0 0 1.4vh rgba(255,255,255,.35);line-height:1;animation:g6pulse .8s ease-in-out infinite}
    .actbtn:active{animation:none;transform:translate(-50%,-45%);box-shadow:0 .6vh 0 #a84e00}
    .actbtn small{display:block;font-size:2.4vh;margin-top:1vh}
    .g6card{position:fixed;right:4vw;top:12vh;z-index:24;width:44vh;height:44vh;border-radius:5vh;display:grid;place-items:center;pointer-events:none;
    background:radial-gradient(circle at 30% 22%,#ffffff,#d9f1ff 55%,#9fd4ff);border:1vh solid #fff;box-shadow:0 1.6vh 0 rgba(10,22,51,.3),0 2.6vh 5vh rgba(0,0,0,.35);animation:pop .35s}
    .g6card img{width:96%;height:96%;animation:g6bob 1.6s ease-in-out infinite}
    .g6card.ok{border-color:#2ee6b6;box-shadow:0 1.6vh 0 rgba(10,22,51,.3),0 0 5vh #2ee6b6}
    @media (max-aspect-ratio:3/2){.g6card{top:25vh;width:40vh;height:40vh}}
    @keyframes g6bob{50%{transform:translateY(-2%) scale(1.02)}}
    @keyframes g6pulse{50%{transform:translate(-50%,-50%) scale(1.1)}}`;
  function css() { if (!document.getElementById("g6css")) document.head.append(TC.h("style", { id: "g6css" }, CSS)); }
  let actBtn = null, card = null;
  /** the big picture of the situation, shown while the teacher asks */
  function showCard(name) { hideCard(); const src = TC.art(name); if (!src) return; css(); const im = new Image(); im.src = src; im.alt = name; im.draggable = false; card = TC.h("div", { class: "g6card" }, im); document.body.append(card); }
  function hideCard() { if (card) { card.remove(); card = null; } }
  /** the giant button with the greeting on it ("GOOD MORNING! 👆") */
  function actionButton(say) {
    return new Promise((res) => {
      css();
      const lines = say.toUpperCase().split(/\s+/), fs = Math.min(6, 23 / (Math.max(...lines.map((w) => w.length)) * 0.66));
      actBtn = TC.h("div", { class: "actbtn" }, TC.h("div", { style: `font-size:${fs.toFixed(2)}vh` }, ...lines.map((w) => TC.h("div", {}, w)), TC.h("small", { class: "zh" }, "👆 用力按！")));
      const go = () => { if (!actBtn) return; actBtn.remove(); actBtn = null; TC.pending = null; clearTimeout(t); TC.sfx("boost"); res(); };
      actBtn.addEventListener("pointerdown", go); document.body.append(actBtn); TC.pending = go;
      const t = setTimeout(go, 7000);
    });
  }
  /** the gate's scenes in the fixed order hello → good morning → thank you → sorry → good night */
  const ordered = (G) => ORDER.map((w) => G.scenes.find((s) => s.w === w)).filter(Boolean).concat(G.scenes.filter((s) => !ORDER.includes(s.w)));

  TC.games.obby = {
    mount(api) { cv = TC.h("canvas", { class: "game" }); api.stage.append(cv); ctx = cv.getContext("2d"); resize(); addEventListener("resize", resize); raf = requestAnimationFrame(draw); this.idle(api); },
    idle(api) {
      const G = (api && api.G) || Object.values(TC_CONTENT.gates).find((g) => g.key === "obby");
      const me = ++epoch; API = null;
      hideCard(); build(ordered(G)); Object.assign(A, { x: 200, y: GY, pose: "run", name: "", color: "#ffc83d", rot: 0, bow: 0 }); cam = 0;
      (async function demo() { while (me === epoch && !TC.kid && A.name === "") { await runTo(A.x + 400, 260); if (me === epoch && A.x > stops[0].x - 200) { A.x = 200; cam = 0; } } })();
    },
    async play(api) {
      const G = api.G, kid = api.kid;
      const me = ++epoch; API = api;
      const dead = () => api.aborted || me !== epoch;
      // always the same order; fewer rounds keep the order and still start with hello
      const all = ordered(G);
      build(all.slice(0, Math.max(1, TC.rounds(all.length))));
      Object.assign(A, { x: 200, y: GY, pose: "idle", color: kid.color, name: kid.name, rot: 0, bow: 0 }); cam = 0;
      const N = stops.length + 1;
      await TC.speak("Go!");
      for (let i = 0; i < stops.length; i++) {
        api.progress(i, N);
        const st = stops[i], sc = st.sc;
        await runTo(st.x - (st.kind === "sorry" ? 150 : 0)); if (dead()) return null;
        await ARRIVE[st.kind](st); if (dead()) return null;
        showCard(sc.img);
        const r = await api.ask({ teacher: G.teacher, tzh: G.tzh, say: sc.say, zh: sc.zh, keys: sc.keys || [[sc.w]], word: sc.w, hideKey: true });
        if (dead()) { hideCard(); return null; }
        TC.hideTalk();
        if (card && r.ok) card.classList.add("ok");
        await actionButton(sc.say);
        hideCard();
        if (dead()) return null;
        TC.floatText(sc.say, 28, 33, "#ffc83d");
        TC.speak((sc.w === "hello" ? "Yes! " : "") + sc.say); // whole recordings only: "Yes! Hello!", "Good morning!", "Thank you!" …
        await REACT[st.kind](st); if (dead()) return null;
        await runTo(flags[i].x + 30);
        TC.sfx("coin"); await tween(400, (t) => (flags[i].up = t));
        if (dead()) return null;
      }
      api.progress(stops.length, N);
      await runTo(finishX + 560); if (dead()) return null;
      const F = G.finale;
      await api.ask({ teacher: F.teacher, tzh: F.zh, say: F.say, keys: F.keys, word: F.word });
      if (dead()) return null;
      TC.hideTalk();
      // hop onto the podium …
      const x0 = A.x, x1 = finishX + 855; TC.sfx("pop"); A.pose = "run"; party = true;
      await tween(800, (t) => { A.x = x0 + (x1 - x0) * t; A.y = GY - PODIUM * t - Math.sin(t * Math.PI) * 150; });
      if (dead()) return null;
      A.y = GY - PODIUM; A.pose = "idle";
      // … all five friends come to cheer …
      const spots = [[-220, 0], [-110, 40], [110, 28], [220, 0], [330, 0]];
      for (let i = 0; i < ORDER.length; i++) {
        const [, art, fur] = CAST[ORDER[i]], f = friend(art, fur, x1 + spots[i][0]);
        Object.assign(f, { y: GY - spots[i][1], size: 150, s: 0, mode: "cheer", ph: i * 1.3 }); crowd.push(f);
        TC.sfx("pop"); puff(f.x, f.y - 70, "#ffffff", 12, 0.1);
        await tween(170, (t) => (f.s = t));
      }
      if (dead()) return null;
      // … and up goes the trophy
      crowd.forEach((f) => (f.happy = 1));
      A.pose = "cheer"; trophy = true;
      TC.sfx("fanfare"); puff(A.x, A.y - 270, "#ffc83d", 40, 0.15); TC.confetti(220);
      TC.floatText("WINNER!", 50, 80, "#ffc83d");
      await TC.speak("Wow! Great!");
      await wait(2000);
      api.progress(N, N);
      return dead() ? null : { ok: true };
    }
  };
})();
