/* Gate 6 · Sports Day Obby — the teacher asks "What can you do?", the child says "I can jump / swim / climb…"
   (one word is enough), presses the giant action button and the runner clears the obstacle; trophy on the podium at the end
   (passport L4/L6 verbs, can) */
(function () {
  "use strict";
  TC.games = TC.games || {};

  /* ---------- action pictures art.js does not have yet: the same glossy chibi kid as pose-jump / pose-run ---------- */
  const SKIN = "#ffd3a8", SHIRT = "#4cc9ff", PANTS = "#3d4a8a", HAIR = "#5a3518";
  const limb = (pts, col, w = 13) => `<path d="M${pts.map((p) => p.join(" ")).join(" L")}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const hand = (c, x, y, r = 8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.g(SKIN)}"/>`;
  /** the kid's head (radius r) at x,y — hair, or a helmet / swim cap when a colour is given */
  function head(c, x, y, r, hat, extra = "") {
    const k = r / 32;
    let s = c.sphere(100, 66, 32, SKIN, 0.6);
    s += hat ? c.path("M66 62 Q64 28 100 28 Q136 28 136 62 Q100 47 66 62Z", hat) + c.hl(86, 40, 15, 6, -20, 0.6)
      : c.path("M68 62 Q70 30 100 30 Q132 30 132 62 Q120 46 100 50 Q80 46 68 62Z", HAIR);
    s += c.eyes(100, 68, 11, 5) + c.smile(100, 80, 6) + c.blush(100, 78, 20) + extra;
    return `<g transform="translate(${x - 100 * k} ${y - 66 * k}) scale(${k})">${s}</g>`;
  }
  const drops = (pts, col = "#fff") => pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`).join("");
  const NEW_ART = {
    /* front crawl through the waves: goggles, one arm over, kicking feet */
    "pose-swim"() {
      const c = TC.ArtCtx();
      const wave = (y, amp) => { let d = `M0 ${y}`; for (let x = 0; x < 200; x += 25) d += ` Q${x + 12.5} ${y - amp} ${x + 25} ${y}`; return d + " V200 H0Z"; };
      const goggles = `<path d="M68 66 Q100 59 132 66" stroke="#26293a" stroke-width="4" fill="none"/>` +
        [89, 111].map((x) => `<ellipse cx="${x}" cy="68" rx="10.5" ry="9" fill="#bfe6ff" fill-opacity=".45" stroke="#26293a" stroke-width="3"/>`).join("");
      let s = `<path d="${wave(104, 9)}" fill="${c.v("#b5ebff", "#4a9bff")}"/>`;
      let b = limb([[98, 106], [76, 62], [110, 40]], SKIN, 12) + hand(c, 112, 39) + drops([[126, 34, 4], [134, 46, 3], [98, 28, 3]], "#7fd3ff");
      b += limb([[70, 120], [26, 104]], SKIN, 13) + limb([[70, 128], [30, 134]], SKIN, 13) + limb([[78, 123], [58, 121]], PANTS, 24);
      b += `<rect x="60" y="102" width="68" height="40" rx="19" fill="${c.g("#ff7a3d")}" transform="rotate(-6 94 122)"/>`;
      b += limb([[120, 116], [176, 110]], SKIN, 12) + hand(c, 180, 110);
      b += head(c, 140, 90, 30, "#ffd21f", goggles);
      s += `<g transform="translate(-14 -22) scale(1.14)">${b}</g>`;
      s += `<path d="${wave(126, 8)}" fill="${c.v("#7fd3ff", "#2a6fe0")}" opacity=".52"/>`;
      s += `<g stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"><path d="M14 148 q10 -7 20 0 t20 0 M92 166 q10 -7 20 0 t20 0 M30 184 q10 -7 20 0 t20 0"/></g>`;
      s += drops([[10, 84, 7], [24, 70, 5], [4, 104, 4], [36, 86, 4], [14, 58, 3], [40, 66, 3], [196, 92, 4], [188, 82, 3]]);
      return c.out(s);
    },
    /* up a climbing wall: helmet, rope, hands and feet on the colourful holds */
    "pose-climb"() {
      const c = TC.ArtCtx();
      let s = c.shadow(100, 194, 80, 6) + `<path d="M46 4 H172 Q182 4 182 14 V194 H36 V14 Q36 4 46 4Z" fill="${c.v("#f3d9b0", "#c79a66")}"/><rect x="168" y="6" width="14" height="188" fill="#000" opacity=".1"/>`;
      s += `<g stroke="#a87d4e" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"><path d="M48 84 l14 8 l-6 14 M166 34 l-12 10 l6 12 M150 178 l12 -8 M50 150 l10 4"/></g>`;
      [[140, 18, "#9b6bff"], [168, 104, "#ff5fa2"], [50, 122, "#ff9a2e"], [168, 150, "#ffd21f"], [50, 60, "#35d35a"], [90, 14, "#3d8bff"]].forEach(([x, y, col]) => (s += c.sphere(x, y, 8, col)));
      s += `<path d="M17 130 V66 m-11 13 l11 -13 l11 13" stroke="#2ee6b6" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      let b = `<path d="M100 144 V-30" stroke="#ff5fa2" stroke-width="5"/>`; // rope
      [[54, 34, "#ff4b55"], [148, 66, "#3d8bff"], [68, 194, "#9b6bff"], [137, 182, "#35d35a"]].forEach(([x, y, col]) => (b += c.sphere(x, y, 10, col)));
      b += limb([[90, 150], [74, 170], [70, 190]], PANTS, 15) + limb([[110, 150], [138, 150], [136, 176]], PANTS, 15);
      b += `<rect x="74" y="96" width="52" height="58" rx="18" fill="${c.g(SHIRT)}"/><rect x="74" y="138" width="52" height="9" rx="4" fill="#26293a"/><circle cx="100" cy="142" r="6" fill="${c.g("#ffc83d")}"/>`;
      b += limb([[80, 104], [60, 86], [54, 40]], SHIRT) + hand(c, 54, 36) + limb([[120, 104], [144, 100], [148, 72]], SHIRT) + hand(c, 148, 68);
      b += head(c, 100, 66, 32, "#ff4b55");
      return c.out(s + `<g transform="translate(13 7) scale(.96)">${b}</g>`);
    },
    /* riding a bike: helmet, hands on the handlebar, feet on the pedals */
    "pose-ride"() {
      const c = TC.ArtCtx();
      const wheel = (x) => `<circle cx="${x}" cy="154" r="30" fill="#fff" fill-opacity=".35" stroke="#26293a" stroke-width="9"/><circle cx="${x}" cy="154" r="23" fill="none" stroke="#c9d6ff" stroke-width="2"/>` +
        `<path d="M${x - 22} 154 h44 M${x} 132 v44 M${x - 16} 138 l32 32 M${x + 16} 138 l-32 32" stroke="#c9d6ff" stroke-width="1.6"/><circle cx="${x}" cy="154" r="6" fill="#8a94b8"/>`;
      let s = c.shadow(100, 190, 86, 7) + `<g stroke="#8a94b8" stroke-width="5" stroke-linecap="round" opacity=".8"><path d="M28 66 h-20 M36 88 h-30 M24 110 h-18"/></g>`;
      s += limb([[88, 100], [102, 128], [90, 166]], "#2c3566", 14) + `<rect x="80" y="164" width="20" height="7" rx="3" fill="#26293a"/>`;
      s += wheel(46) + wheel(154);
      s += `<path d="M46 154 L80 108 L134 108 L100 154 Z M100 154 L80 108 M134 108 L154 154 M134 108 L130 84 L148 80" stroke="#ff4f7b" stroke-width="8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
      s += `<ellipse cx="82" cy="101" rx="16" ry="6" fill="${c.g("#26293a")}"/><path d="M100 154 L110 142 M100 154 L90 166" stroke="#8a94b8" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="154" r="9" fill="${c.g("#ffc83d")}"/>`;
      s += `<rect x="66" y="50" width="42" height="54" rx="17" fill="${c.g(SHIRT)}" transform="rotate(16 86 100)"/>`;
      s += limb([[88, 98], [118, 114], [112, 138]], PANTS, 15) + `<rect x="102" y="137" width="22" height="8" rx="4" fill="#26293a"/>`;
      s += limb([[104, 66], [126, 82], [146, 82]], SHIRT, 12) + hand(c, 147, 81);
      s += head(c, 110, 34, 27, "#ffc83d");
      return c.out(s);
    },
    /* flying like a superhero: red cape, one fist up, above the clouds */
    "pose-fly"() {
      const c = TC.ArtCtx();
      const cloud = (x, y, k) => c.sphere(x, y, 18 * k, "#ffffff", 0.3) + c.sphere(x + 22 * k, y + 4 * k, 14 * k, "#ffffff", 0.3) + c.sphere(x - 20 * k, y + 5 * k, 13 * k, "#ffffff", 0.3);
      let s = cloud(150, 176, 1.1) + cloud(34, 40, 0.8) + cloud(64, 188, 0.7);
      s += `<g stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"><path d="M22 176 l12 -17 M42 186 l10 -14 M8 152 l9 -13"/></g>`;
      let b = c.path("M80 98 Q40 122 30 190 Q50 176 66 190 Q84 176 100 190 Q116 150 120 98Z", "#ff4b55");
      b += limb([[92, 150], [88, 184]], PANTS, 15) + limb([[110, 150], [114, 184]], PANTS, 15) + `<ellipse cx="88" cy="188" rx="10" ry="7" fill="${c.g("#ff4b55")}"/><ellipse cx="114" cy="188" rx="10" ry="7" fill="${c.g("#ff4b55")}"/>`;
      b += `<rect x="74" y="96" width="52" height="58" rx="18" fill="${c.g(SHIRT)}"/>`;
      b += limb([[78, 104], [60, 120], [74, 136]], SHIRT) + hand(c, 76, 137);
      b += head(c, 100, 66, 32);
      b += limb([[124, 102], [131, 26]], SHIRT) + hand(c, 131, 20, 10);
      s += `<g transform="rotate(35 100 110)">${b}</g>`;
      s += `<path d="M180 22 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4 l9 -4z" fill="${c.g("#ffd21f")}"/>`;
      return c.out(s);
    }
  };
  const NEW_SEAL = { "pose-swim": [166, 170, 15, -8], "pose-climb": [109, 129, 10.5], "pose-ride": [92, 80, 9, 16], "pose-fly": [91, 122, 11, 35] };
  Object.keys(NEW_ART).forEach((n) => { if (!TC.ART[n]) { TC.ART[n] = NEW_ART[n]; TC.SEAL[n] = NEW_SEAL[n]; } }); // art.js wins if it gets these later
  const actionArt = (w) => TC.art("pose-" + w);

  const PALM = TC.artImg("palm");
  const IM = { trophy: TC.artImg("trophy"), bike: TC.artImg("bike"), cloud: TC.artImg("cloud") };
  let cv, ctx, W, H, k = 1, raf;
  const GY = 470; // ground line in base units (720 high)
  const PODIUM = 60; // height of the winner's step
  const A = { x: 200, y: GY, pose: "idle", t: 0, color: "#ffc83d", name: "", glider: false, bike: false, rot: 0 };
  let course = [], cam = 0, parts = [], flags = [], finishX = 0, trophy = false, demoRun = 0;

  function resize() { const r = Math.min(1, 1600 / innerWidth); W = cv.width = Math.round(innerWidth * r); H = cv.height = Math.round(innerHeight * r); k = H / 720; }
  function tween(ms, fn) { return new Promise((res) => { const t0 = performance.now(); (function f() { const t = Math.min(1, (performance.now() - t0) / ms); fn(t); if (t < 1) requestAnimationFrame(f); else res(); })(); }); }
  const ease = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  function buildCourse(moves) {
    course = []; flags = []; let x = 700;
    moves.forEach((m) => {
      const w = { hurdle: 140, river: 420, wall: 120, track: 700, bikeLane: 640, cliff: 560 }[m.obstacle];
      course.push({ m, x, w, type: m.obstacle, done: false });
      flags.push({ x: x + w + 140, up: 0 });
      x += w + 520;
    });
    finishX = x + 200;
  }
  function groundAt(x) { for (const o of course) if ((o.type === "river" || o.type === "cliff") && x > o.x && x < o.x + o.w) return null; return GY; }

  function draw() {
    raf = requestAnimationFrame(draw);
    A.t += 1 / 60;
    cam += (A.x - 360 - cam) * 0.08;
    ctx.save(); ctx.scale(k, k);
    const VW = W / k;
    // sky
    const g = ctx.createLinearGradient(0, 0, 0, 720); g.addColorStop(0, "#5ec8ff"); g.addColorStop(1, "#dff6ff"); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, 720);
    for (let i = 0; i < 6; i++) { const cx = ((i * 420 - cam * 0.2) % (VW + 400) + VW + 400) % (VW + 400) - 200; if (IM.cloud.complete) ctx.drawImage(IM.cloud, cx, 60 + (i % 3) * 50, 160, 160); }
    // stadium silhouette far away
    ctx.fillStyle = "rgba(60,90,160,.25)";
    for (let i = 0; i < 8; i++) { const sx = ((i * 380 - cam * 0.35) % (VW + 380) + VW + 380) % (VW + 380) - 190; ctx.fillRect(sx, GY - 230, 300, 230); ctx.fillRect(sx + 20, GY - 260, 20, 40); ctx.fillRect(sx + 260, GY - 260, 20, 40); }
    for (let i = 0; i < 7; i++) { const px = ((i * 330 + 120 - cam * 0.5) % (VW + 330) + VW + 330) % (VW + 330) - 160; if (PALM.complete) ctx.drawImage(PALM, px, GY - 260, 200, 260); }
    ctx.translate(-cam, 0);
    // ground blocks (obby studs)
    const x0 = Math.floor(cam / 80) * 80;
    for (let x = x0; x < cam + VW + 80; x += 80) {
      if (groundAt(x + 40) === null) continue;
      const c = ["#35d35a", "#2fbf50"][(x / 80) & 1];
      const gg = ctx.createLinearGradient(0, GY, 0, GY + 40); gg.addColorStop(0, "#8ff27a"); gg.addColorStop(0.25, c); gg.addColorStop(1, "#1f8a3a");
      ctx.fillStyle = gg; ctx.fillRect(x, GY, 80, 40);
      const gd = ctx.createLinearGradient(0, GY + 40, 0, 720); gd.addColorStop(0, "#a8703f"); gd.addColorStop(1, "#5a3518"); ctx.fillStyle = gd; ctx.fillRect(x, GY + 40, 80, 720 - GY);
      ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.beginPath(); ctx.ellipse(x + 23, GY + 10, 10, 5, 0, 0, 7); ctx.ellipse(x + 57, GY + 10, 10, 5, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,.12)"; ctx.fillRect(x + 78, GY, 2, 40);
    }
    // obstacles
    for (const o of course) drawObstacle(o);
    flags.forEach((f) => { ctx.fillStyle = "#fff"; ctx.fillRect(f.x, GY - 160, 8, 160); ctx.fillStyle = f.up ? "#ffc83d" : "#aaa"; const fy = GY - 40 - 110 * f.up; ctx.beginPath(); ctx.moveTo(f.x + 8, fy - 40); ctx.lineTo(f.x + 80, fy - 20); ctx.lineTo(f.x + 8, fy); ctx.fill(); });
    drawFinish();
    drawAvatar();
    // particles
    parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += p.g; p.l -= 0.02; ctx.globalAlpha = Math.max(0, p.l); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s); });
    ctx.globalAlpha = 1; parts = parts.filter((p) => p.l > 0);
    ctx.restore();
  }
  function puff(x, y, c, n = 14, g = 0.2) { for (let i = 0; i < n; i++) parts.push({ x, y, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 6, g, l: 1, c, s: 8 + Math.random() * 8 }); }

  function drawObstacle(o) {
    const { x, w } = o;
    if (o.type === "hurdle") { block3d(x + 50, GY - 110, 40, 110, "#ff5a5a"); ctx.fillStyle = "rgba(255,255,255,.9)"; for (let i = 0; i < 3; i++) ctx.fillRect(x + 50, GY - 100 + i * 36, 40, 12); }
    if (o.type === "river") { const t = A.t; const wg = ctx.createLinearGradient(0, GY + 20, 0, 720); wg.addColorStop(0, "#7fd3ff"); wg.addColorStop(0.3, "#3d8bff"); wg.addColorStop(1, "#1b4fb8"); ctx.fillStyle = wg; ctx.fillRect(x, GY + 20, w, 720 - GY); ctx.fillStyle = "rgba(255,255,255,.5)"; for (let i = 0; i < w; i += 60) ctx.fillRect(x + i + Math.sin(t * 3 + i) * 10, GY + 30, 30, 6); }
    if (o.type === "wall") { for (let r = 0; r < 5; r++) for (let c = 0; c < 2; c++) block3d(x + c * 60, GY - 60 - r * 60, 60, 60, (r + c) % 2 ? "#9b6bff" : "#7d55d9"); }
    if (o.type === "track") { ctx.fillStyle = "#e0523f"; ctx.fillRect(x, GY - 6, w, 14); ctx.fillStyle = "#fff"; for (let i = 20; i < w; i += 90) { ctx.beginPath(); ctx.moveTo(x + i, GY - 30); ctx.lineTo(x + i + 30, GY - 18); ctx.lineTo(x + i, GY - 6); ctx.fill(); } }
    if (o.type === "bikeLane") { ctx.fillStyle = "#4cc9ff"; ctx.fillRect(x, GY - 6, w, 14); if (!o.done && !A.bike && IM.bike.complete) ctx.drawImage(IM.bike, x - 30, GY - 90, 90, 90); }
    if (o.type === "cliff") {
      const ab = ctx.createLinearGradient(0, GY, 0, 720); ab.addColorStop(0, "#5a6aa8"); ab.addColorStop(0.5, "#26293a"); ab.addColorStop(1, "#0a0c18"); ctx.fillStyle = ab; ctx.fillRect(x, GY, w, 720 - GY);
      ctx.fillStyle = "#8a5a32"; ctx.beginPath(); ctx.moveTo(x, GY); ctx.lineTo(x + 26, GY + 60); ctx.lineTo(x + 8, GY + 130); ctx.lineTo(x + 30, GY + 250); ctx.lineTo(x, 720); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + w, GY); ctx.lineTo(x + w - 24, GY + 70); ctx.lineTo(x + w - 6, GY + 150); ctx.lineTo(x + w - 28, GY + 260); ctx.lineTo(x + w, 720); ctx.fill();
      const sx = x + w / 2, sy = GY - 150 + Math.sin(A.t * 3) * 8; // floating warning sign over the gap
      ctx.fillStyle = "#ffc83d"; ctx.beginPath(); ctx.moveTo(sx, sy - 50); ctx.lineTo(sx + 48, sy + 34); ctx.lineTo(sx - 48, sy + 34); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#26293a"; ctx.lineWidth = 6; ctx.stroke(); ctx.fillStyle = "#26293a"; ctx.font = "700 54px Fredoka, sans-serif"; ctx.textAlign = "center"; ctx.fillText("!", sx, sy + 26);
      ctx.fillStyle = "#26293a"; ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 4; for (let i = 0; i < 5; i++) { const yy = GY - 200 + i * 40; ctx.beginPath(); ctx.moveTo(x + 40 + ((A.t * 200 + i * 80) % (w - 80)), yy); ctx.lineTo(x + 100 + ((A.t * 200 + i * 80) % (w - 80)), yy); ctx.stroke(); } }
  }
  /** a glossy obby block with a top face and side shading */
  function block3d(x, y, w, h, col) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, shadeHex(col, 1.35)); g.addColorStop(0.5, col); g.addColorStop(1, shadeHex(col, 0.65));
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = shadeHex(col, 1.5); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 10, y - 10); ctx.lineTo(x + w + 10, y - 10); ctx.lineTo(x + w, y); ctx.fill();
    ctx.fillStyle = shadeHex(col, 0.55); ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + 10, y - 10); ctx.lineTo(x + w + 10, y + h - 10); ctx.lineTo(x + w, y + h); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.3)"; ctx.fillRect(x + w * 0.12, y + h * 0.1, w * 0.18, Math.min(10, h * 0.2));
  }
  function shadeHex(hex, f) { const n = parseInt(hex.slice(1), 16); const c = (v) => Math.max(0, Math.min(255, Math.round(f > 1 ? v + (255 - v) * (f - 1) : v * f))); return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`; }
  function drawFinish() {
    const x = finishX; if (!x) return;
    ctx.fillStyle = "#26293a"; ctx.fillRect(x, GY - 300, 12, 300); ctx.fillRect(x + 600, GY - 300, 12, 300);
    for (let i = 0; i < 20; i++) for (let j = 0; j < 2; j++) { ctx.fillStyle = (i + j) % 2 ? "#111" : "#fff"; ctx.fillRect(x + i * 30.6, GY - 300 + j * 26, 31, 26); }
    ctx.font = "700 44px Fredoka, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#ffc83d"; ctx.fillText("STADIUM", x + 306, GY - 320);
    // winners' podium
    [[690, 40, "#c9d6ff", "2"], [800, PODIUM, "#ffc83d", "1"], [910, 28, "#e0915a", "3"]].forEach(([dx, hh, col, n]) => {
      block3d(x + dx, GY - hh, 110, hh, col);
      ctx.font = "700 30px Fredoka, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "rgba(10,22,51,.75)"; ctx.fillText(n, x + dx + 55, GY - hh / 2 + 11);
    });
  }
  function drawAvatar() {
    const { x, y, pose, t, color } = A;
    ctx.save(); ctx.translate(x, y); ctx.rotate(A.rot);
    const sw = pose === "run" ? Math.sin(t * 18) : pose === "swim" ? Math.sin(t * 8) : pose === "climb" ? Math.sin(t * 10) : 0;
    if (A.bike && IM.bike.complete) ctx.drawImage(IM.bike, -55, -80, 110, 110);
    // legs
    ctx.fillStyle = "#3d4a8a";
    ctx.save(); ctx.translate(-10, -50); ctx.rotate(sw * 0.7); ctx.fillRect(-9, 0, 18, 50); ctx.restore();
    ctx.save(); ctx.translate(10, -50); ctx.rotate(-sw * 0.7); ctx.fillRect(-9, 0, 18, 50); ctx.restore();
    // torso
    const tg = ctx.createLinearGradient(-26, -110, 26, -48); tg.addColorStop(0, shadeHex(color, 1.35)); tg.addColorStop(1, shadeHex(color, 0.7)); ctx.fillStyle = tg; ctx.fillRect(-26, -110, 52, 62);
    ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.font = "700 26px Fredoka"; ctx.textAlign = "center"; ctx.fillText(A.name ? A.name[0] : "", 0, -70);
    // arms
    ctx.fillStyle = "#ffd3a8";
    const armA = pose === "fly" ? -2.6 : pose === "climb" ? -2.8 + sw * 0.4 : pose === "swim" ? -1.5 + sw * 1.4 : pose === "cheer" ? -2.7 : sw * 0.8;
    ctx.save(); ctx.translate(-30, -104); ctx.rotate(armA); ctx.fillRect(-8, 0, 16, 50); ctx.restore();
    ctx.save(); ctx.translate(30, -104); ctx.rotate(pose === "fly" || pose === "cheer" ? 2.6 : pose === "climb" ? 2.8 - sw * 0.4 : -armA); ctx.fillRect(-8, 0, 16, 50); ctx.restore();
    // head
    const hg = ctx.createLinearGradient(-24, -158, 24, -110); hg.addColorStop(0, "#ffe6cc"); hg.addColorStop(1, "#e8a878"); ctx.fillStyle = hg; ctx.fillRect(-24, -158, 48, 48);
    ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.fillRect(-18, -152, 12, 6);
    ctx.fillStyle = "#0a1633"; ctx.fillRect(-12, -140, 7, 9); ctx.fillRect(6, -140, 7, 9); ctx.fillRect(-8, -124, 16, 4);
    ctx.fillStyle = color; ctx.fillRect(-26, -164, 52, 14);
    if (A.glider) { ctx.fillStyle = "#ff5fa2"; ctx.beginPath(); ctx.moveTo(-110, -150); ctx.quadraticCurveTo(0, -230, 110, -150); ctx.lineTo(0, -170); ctx.fill(); }
    ctx.restore();
    // name tag
    ctx.font = "600 24px Fredoka, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "rgba(10,22,51,.7)"; const tw = ctx.measureText(A.name).width + 20; ctx.fillRect(x - tw / 2, y - 205, tw, 32); ctx.fillStyle = "#fff"; ctx.fillText(A.name, x, y - 181);
    if (trophy && IM.trophy.complete) { const s = 160 + Math.sin(t * 5) * 8; ctx.drawImage(IM.trophy, x + 170 - s / 2, y - 130 - s / 2 + Math.sin(t * 3) * 6, s, s); }
  }

  async function runTo(x, speed = 340) {
    A.pose = "run"; const x0 = A.x, d = x - x0;
    await tween((Math.abs(d) / speed) * 1000, (t) => { A.x = x0 + d * t; if (Math.random() < 0.15) puff(A.x - 20, GY - 8, "rgba(255,255,255,.7)", 2, 0); });
    A.pose = "idle";
  }
  async function act(o) {
    const { x, w } = o;
    if (o.type === "hurdle") {
      TC.sfx("pop"); A.pose = "run"; const x0 = A.x, x1 = x + w + 60;
      await tween(900, (t) => { A.x = x0 + (x1 - x0) * t; A.y = GY - Math.sin(t * Math.PI) * 190; A.rot = Math.sin(t * Math.PI * 2) * 0.2; });
      A.y = GY; A.rot = 0; puff(A.x, GY, "#fff");
    } else if (o.type === "river") {
      A.pose = "swim"; const x0 = A.x;
      await tween(500, (t) => { A.x = x0 + 70 * t; A.y = GY + 60 * t; }); TC.sfx("whoosh"); puff(A.x, GY + 40, "#bfe3ff", 24, 0.25);
      await tween(2200, (t) => { A.x = x0 + 70 + (w - 70) * t; A.y = GY + 60 + Math.sin(t * 20) * 6; A.rot = 0.9; if (Math.random() < 0.3) puff(A.x - 30, GY + 30, "#bfe3ff", 2, 0.2); });
      A.rot = 0; await tween(400, (t) => { A.x = x0 + w + 40 * t; A.y = GY + 60 * (1 - t); });
    } else if (o.type === "wall") {
      A.pose = "climb"; const x0 = A.x;
      await tween(300, (t) => (A.x = x0 + (x - 30 - x0) * t));
      await tween(1500, (t) => (A.y = GY - 300 * t));
      await tween(500, (t) => { A.x = x - 30 + (w + 60) * t; A.y = GY - 300 - Math.sin(t * Math.PI) * 40; });
      A.pose = "run"; await tween(500, (t) => (A.y = GY - 300 + 300 * t * t)); puff(A.x, GY, "#fff");
    } else if (o.type === "track") {
      TC.sfx("boost"); A.pose = "run"; const x0 = A.x;
      await tween(900, (t) => { A.x = x0 + (x + w - x0 + 60) * ease(t); A.t += 0.08; if (Math.random() < 0.6) puff(A.x - 40, GY - 10, "#ffe58a", 2, 0); });
    } else if (o.type === "bikeLane") {
      A.bike = true; A.pose = "idle"; TC.sfx("coin"); const x0 = A.x;
      await tween(1500, (t) => { A.x = x0 + (x + w - x0 + 60) * ease(t); A.y = GY - 20 - Math.sin(t * Math.PI) * 30; });
      A.bike = false; A.y = GY;
    } else if (o.type === "cliff") {
      A.glider = true; A.pose = "fly"; TC.sfx("whoosh"); const x0 = A.x;
      await tween(2300, (t) => { A.x = x0 + (x + w + 80 - x0) * t; A.y = GY - Math.sin(t * Math.PI) * 200 - 40 * t * (1 - t); });
      A.glider = false; A.y = GY; puff(A.x, GY, "#fff");
    }
    A.pose = "idle"; A.rot = 0; A.y = GY;
  }

  const CSS = `.actbtn{position:fixed;left:50%;top:58%;transform:translate(-50%,-50%);z-index:26;width:30vh;height:30vh;border-radius:50%;display:grid;place-items:center;
    font:700 6vh Fredoka,sans-serif;color:#fff;text-shadow:0 .5vh 0 rgba(0,0,0,.3);cursor:pointer;touch-action:manipulation;
    background:radial-gradient(circle at 35% 28%,#ffe9a8,#ffb020 45%,#e06a00);box-shadow:0 2.2vh 0 #a84e00,0 3vh 5vh rgba(0,0,0,.4),0 0 0 1.4vh rgba(255,255,255,.35);line-height:1;animation:g6pulse .8s ease-in-out infinite}
    .actbtn:active{animation:none;transform:translate(-50%,-44%);box-shadow:0 .6vh 0 #a84e00}
    .actbtn small{display:block;font-size:2.4vh;margin-top:1vh}
    .g6card{position:fixed;right:4vw;top:12vh;z-index:24;width:44vh;height:44vh;border-radius:5vh;display:grid;place-items:center;pointer-events:none;
    background:radial-gradient(circle at 30% 22%,#ffffff,#d9f1ff 55%,#9fd4ff);border:1vh solid #fff;box-shadow:0 1.6vh 0 rgba(10,22,51,.3),0 2.6vh 5vh rgba(0,0,0,.35);animation:pop .35s}
    .g6card img{width:94%;height:94%;animation:g6bob 1.6s ease-in-out infinite}
    .g6card.ok{border-color:#2ee6b6;box-shadow:0 1.6vh 0 rgba(10,22,51,.3),0 0 5vh #2ee6b6}
    @media (max-aspect-ratio:3/2){.g6card{top:25vh;width:40vh;height:40vh}}
    @keyframes g6bob{50%{transform:translateY(-3%) scale(1.03)}}
    @keyframes g6pulse{50%{transform:translate(-50%,-50%) scale(1.12)}}`;
  function css() { if (!document.getElementById("g6css")) document.head.append(TC.h("style", { id: "g6css" }, CSS)); }
  let actBtn = null, card = null;
  /** the big picture of the action (what the child can say), shown while the teacher asks */
  function showCard(w) { hideCard(); css(); const im = new Image(); im.src = actionArt(w); im.alt = w; im.draggable = false; card = TC.h("div", { class: "g6card" }, im); document.body.append(card); }
  function hideCard() { if (card) { card.remove(); card = null; } }
  function actionButton(word) {
    return new Promise((res) => {
      css();
      actBtn = TC.h("div", { class: "actbtn" }, TC.h("div", {}, word.toUpperCase() + "!", TC.h("small", { class: "zh" }, "👆 用力按！")));
      const go = () => { if (!actBtn) return; actBtn.remove(); actBtn = null; TC.pending = null; clearTimeout(t); TC.sfx("boost"); res(); };
      actBtn.addEventListener("pointerdown", go); document.body.append(actBtn); TC.pending = go;
      const t = setTimeout(go, 7000);
    });
  }

  TC.games.obby = {
    mount(api) { cv = TC.h("canvas", { class: "game" }); api.stage.append(cv); ctx = cv.getContext("2d"); resize(); addEventListener("resize", resize); raf = requestAnimationFrame(draw); this.idle(api); },
    idle(api) { const G = (api && api.G) || TC_CONTENT.gates[6]; hideCard(); buildCourse(G.moves); Object.assign(A, { x: 200, y: GY, pose: "run", name: "", color: "#ffc83d", glider: false, bike: false, rot: 0 }); trophy = false; cam = 0;
      const me = ++demoRun;
      (async function demo() { while (me === demoRun && !TC.kid && A.name === "") { await runTo(A.x + 400, 260); if (me === demoRun && A.x > course[0].x - 200) { A.x = 200; cam = 0; } } })(); },
    async play(api) {
      const G = api.G, kid = api.kid;
      demoRun++;
      const must = G.moves.filter((m) => ["jump", "swim", "climb", "fly"].includes(m.w));
      const extra = G.moves.filter((m) => !must.includes(m)).sort(() => Math.random() - 0.5)[0];
      const moves = [must[0], must[1], extra, must[2], must[3]].filter(Boolean).slice(0, TC.rounds(5));
      buildCourse(moves); trophy = false;
      Object.assign(A, { x: 200, y: GY, pose: "idle", color: kid.color, name: kid.name, glider: false, bike: false, rot: 0 }); cam = 0;
      const N = moves.length + 1;
      await TC.speak("Go!");
      for (let i = 0; i < course.length; i++) {
        api.progress(i, N);
        const o = course[i], m = o.m;
        await runTo(o.x - 70); if (api.aborted) return null;
        showCard(m.w);
        const r = await api.ask({ teacher: G.teacher, tzh: G.tzh, say: m.say, zh: m.zh, keys: m.keys || [[m.w]], word: m.w, hideKey: true });
        if (api.aborted) { hideCard(); return null; }
        TC.hideTalk();
        if (card && r.ok) card.classList.add("ok");
        await actionButton(m.w);
        hideCard();
        if (api.aborted) return null;
        TC.floatText(cap(m.w) + "!", 50, 42, "#ffc83d");
        TC.speak(m.say); // "I can jump!" while the runner does it
        await act(o); o.done = true;
        await runTo(flags[i].x + 30);
        TC.sfx("coin"); await tween(400, (t) => (flags[i].up = t));
        if (api.aborted) return null;
      }
      api.progress(course.length, N);
      await runTo(finishX + 560); if (api.aborted) return null;
      const F = G.finale;
      await api.ask({ teacher: F.teacher, tzh: F.zh, say: F.say, keys: F.keys, word: F.word });
      if (api.aborted) return null;
      TC.hideTalk();
      // still full of energy: hop onto the podium and lift the trophy
      const x0 = A.x, x1 = finishX + 855; TC.sfx("pop"); A.pose = "run";
      await tween(800, (t) => { A.x = x0 + (x1 - x0) * t; A.y = GY - PODIUM * t - Math.sin(t * Math.PI) * 150; });
      A.y = GY - PODIUM; A.pose = "cheer"; trophy = true;
      TC.sfx("fanfare"); puff(A.x + 170, A.y - 130, "#ffc83d", 40, 0.15); TC.confetti(220);
      TC.floatText("WINNER!", 62, 50, "#ffc83d");
      await TC.speak("Wow! Great!");
      await TC.sleep(1200); A.pose = "idle";
      api.progress(N, N);
      return { ok: true };
    }
  };
  function cap(w) { return w[0].toUpperCase() + w.slice(1); }
})();
