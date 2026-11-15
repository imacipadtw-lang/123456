/* Turbo Talk Kart (engine "kart", used by the NUMBERS gate) — "How many?" → count the stars on the board, say the number, get a turbo boost (passport 第7關 數字 1–10) */
(function () {
  "use strict";
  TC.games = TC.games || {};
  const OLLIE = TC.artImg("ollie"), TOWER = TC.artImg("tower");
  const IM = {}; ["tree", "star", "trophy"].forEach((n) => (IM[n] = TC.artImg(n)));

  let cv, ctx, W, H, raf = 0;
  const S = { lane: 0, laneX: 0, stars: [], got: 0, hint: 0, pos: 0, speed: 0, target: 0, boost: 0, curveX: 0, signs: [], finishAt: 0, rival: 0, rivalSpeed: 0, bubble: null, board: null, run: 0, shake: 0, kidColor: "#ffc83d", kidName: "", place: 2, running: false, finished: false };
  const SEG = 220; // world units per stripe pair

  function curve(d) { return Math.sin(d / 1300) * 0.9 + Math.sin(d / 520 + 1) * 0.45; }

  function resize() {
    const r = Math.min(1, 1600 / innerWidth);
    W = cv.width = Math.round(innerWidth * r); H = cv.height = Math.round(innerHeight * r);
  }

  function draw(t) {
    raf = requestAnimationFrame(draw);
    const dt = 1 / 60;
    // physics
    S.speed += (S.target * (S.boost > 0 ? 2.4 : 1) - S.speed) * 0.05;
    if (S.boost > 0) S.boost -= dt;
    S.pos += S.speed * dt;
    S.rival += S.rivalSpeed * dt;
    if (S.shake > 0) S.shake -= dt;
    const y0 = H * 0.42, K = H * 0.9;
    const sx = S.shake > 0 ? (Math.random() - 0.5) * 10 : 0;
    ctx.save(); ctx.translate(sx, 0);
    // sky
    const g = ctx.createLinearGradient(0, 0, 0, y0);
    g.addColorStop(0, "#2a1b6e"); g.addColorStop(0.55, "#ff6fa8"); g.addColorStop(1, "#ffcf6b");
    ctx.fillStyle = g; ctx.fillRect(-20, 0, W + 40, y0 + 2);
    // sun
    ctx.fillStyle = "rgba(255,240,180,.9)"; ctx.beginPath(); ctx.arc(W * 0.72, y0 * 0.62, H * 0.09, 0, 7); ctx.fill();
    // parallax mountains: one continuous ridge + a Fuji-like peak (Tokyo)
    const par = S.curveX * 0.25;
    ctx.fillStyle = "#5b3f9c"; ctx.beginPath(); ctx.moveTo(-20, y0);
    for (let x = -20; x <= W + 20; x += 8) { const wx = (x + par) * 0.004; ctx.lineTo(x, y0 - H * (0.045 + 0.03 * Math.sin(wx * 2.1) + 0.02 * Math.sin(wx * 5.3 + 1))); }
    ctx.lineTo(W + 20, y0); ctx.fill();
    const span = W * 1.8, fx = ((W * 0.28 - par) % span + span) % span - W * 0.4;
    ctx.fillStyle = "#43307e"; ctx.beginPath(); ctx.moveTo(fx - H * 0.32, y0); ctx.lineTo(fx - H * 0.045, y0 - H * 0.21); ctx.lineTo(fx + H * 0.045, y0 - H * 0.21); ctx.lineTo(fx + H * 0.32, y0); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(fx - H * 0.085, y0 - H * 0.155); ctx.lineTo(fx - H * 0.045, y0 - H * 0.21); ctx.lineTo(fx + H * 0.045, y0 - H * 0.21); ctx.lineTo(fx + H * 0.085, y0 - H * 0.155); ctx.lineTo(fx + H * 0.03, y0 - H * 0.172); ctx.lineTo(fx, y0 - H * 0.152); ctx.lineTo(fx - H * 0.03, y0 - H * 0.172); ctx.fill();
    { const tx = ((W * 0.82 - par * 0.6) % (W * 1.6) + W * 1.6) % (W * 1.6) - W * 0.2, th = H * 0.3; if (TOWER.complete) ctx.drawImage(TOWER, tx - th * 0.5, y0 - th, th, th); }
    // road, scanline by scanline
    const rows = []; let x = W / 2, dx = 0; const step = 2;
    S.curveX += curve(S.pos) * S.speed * dt * 1.2;
    for (let y = H; y > y0; y -= step) {
      const dy = y - y0, z = K / dy, d = S.pos + z * 60;
      dx += curve(d) * step * 0.0011; x += dx * step * 0.9;
      const half = (W * 0.62) * (dy / (H - y0));
      const stripe = Math.floor(d / SEG) % 2;
      ctx.fillStyle = stripe ? "#3cc46a" : "#33b35f"; ctx.fillRect(0, y - step, W, step + 1);
      ctx.fillStyle = stripe ? "#ff4b6b" : "#ffffff"; ctx.fillRect(x - half * 1.12, y - step, half * 2.24, step + 1);
      ctx.fillStyle = stripe ? "#5d6274" : "#575b6c"; ctx.fillRect(x - half, y - step, half * 2, step + 1);
      if (stripe) { ctx.fillStyle = "#ffe066"; ctx.fillRect(x - half * 0.02, y - step, half * 0.04, step + 1); }
      if (S.finishAt && Math.abs(d - S.finishAt) < 70) { const n = 12; for (let q = 0; q < n; q++) { ctx.fillStyle = (q + Math.floor(d / 35)) % 2 ? "#fff" : "#111"; ctx.fillRect(x - half + (2 * half / n) * q, y - step, 2 * half / n + 1, step + 1); } }
      rows.push({ y, x, half, d, dy });
    }
    // sprites (far → near)
    const spr = [];
    for (let i = 0; i < 30; i++) { // trees
      const d = Math.floor(S.pos / 600) * 600 + i * 600;
      spr.push({ d, side: i % 2 ? 1.5 : -1.5, img: IM.tree, s: 1.1 });
    }
    S.signs.forEach((sg) => !sg.done && spr.push({ d: sg.d, side: 0, sign: sg }));
    S.laneX += (S.lane - S.laneX) * 0.18;
    S.stars.forEach((st) => {
      if (st.done) return;
      const dz = st.d - S.pos;
      if (dz < 140 && dz > -40) { if (Math.abs(st.lane - S.laneX) < 0.5) { st.done = true; S.got++; TC.sfx("coin"); TC.floatText("+1 ★", 50 + st.lane * 18, 62, "#ffc83d"); } }
      if (!st.done && dz > -60) spr.push({ d: st.d, side: st.lane * 0.62, img: IM.star, s: 0.42, spin: true });
    });
    if (S.finishAt) spr.push({ d: S.finishAt, side: 0, banner: true });
    spr.push({ d: S.rival, side: -0.35, rival: true });
    spr.sort((a, b) => b.d - a.d);
    for (const s of spr) {
      const z = (s.d - S.pos) / 60; if (z <= 0.6 || z > 200) continue;
      const dy = K / z, y = y0 + dy; if (y > H + 200) continue;
      const row = rows.reduce((a, r) => (Math.abs(r.y - y) < Math.abs(a.y - y) ? r : a), rows[0]);
      const sc = dy / (H - y0);
      const px = row.x + s.side * row.half;
      if (s.img) { const sz = H * 0.5 * sc * s.s; if (s.img.complete) { if (s.spin) { const k = Math.abs(Math.cos(performance.now() / 260)); ctx.drawImage(s.img, px - (sz * k) / 2, y - sz * 1.3, sz * k, sz); } else ctx.drawImage(s.img, px - sz / 2, y - sz, sz, sz); } }
      else if (s.sign) drawSign(px, y, sc, s.sign);
      else if (s.banner) drawBanner(row.x, y, row.half);
      else if (s.rival) drawKart(px, y, sc * 0.9, "#9b6bff", "O", 0, true);
    }
    // player kart
    const tilt = Math.max(-0.12, Math.min(0.12, curve(S.pos) * 0.12));
    const roadHalfBottom = W * 0.62 * ((H * 0.8 - y0) / (H - y0));
    drawKart(W / 2 + S.laneX * roadHalfBottom * 0.62, H * 0.8, 1, S.kidColor, S.kidName[0] || "?", tilt + (S.lane - S.laneX) * 0.25, false);
    // star counter + lane hint
    if (S.running) {
      ctx.font = `700 ${H * 0.055}px Fredoka, sans-serif`; ctx.textAlign = "right"; ctx.lineWidth = H * 0.01; ctx.strokeStyle = "#0a1633"; ctx.fillStyle = "#ffc83d";
      ctx.strokeText(`★ ${S.got}`, W * 0.97, H * 0.2); ctx.fillText(`★ ${S.got}`, W * 0.97, H * 0.2);
      if (S.hint > 0 && !S.bubble && !S.board) { S.hint -= dt; ctx.globalAlpha = Math.min(1, S.hint); ctx.textAlign = "center"; ctx.font = `700 ${H * 0.045}px Fredoka, "Microsoft JhengHei", sans-serif`; ctx.fillStyle = "#fff";
        ctx.strokeText("👈 點左右換車道，收集星星！ 👉", W / 2, H * 0.62); ctx.fillText("👈 點左右換車道，收集星星！ 👉", W / 2, H * 0.62); ctx.globalAlpha = 1; }
    }
    if (S.boost > 0 || S.speed > 900) speedLines();
    // star board: n big stars to count ("How many?")
    if (S.board) drawBoard(performance.now());
    // bubble with the trophy (finale)
    if (S.bubble) {
      const b = S.bubble; b.t = Math.min(1, b.t + 0.06);
      const r = H * 0.19 * easeOut(b.t), cx = W / 2, cy = H * 0.43; // big, and clear of Ollie's subtitle (#cap, top centre) above and the talk bar below
      ctx.fillStyle = "rgba(255,255,255,.95)"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
      ctx.lineWidth = H * 0.012; ctx.strokeStyle = "#4cc9ff"; ctx.stroke();
      const im = IM[b.img]; if (im && im.complete) ctx.drawImage(im, cx - r * 0.8, cy - r * 0.8, r * 1.6, r * 1.6);
    }
    // place badge + speed
    ctx.font = `700 ${H * 0.07}px Fredoka, sans-serif`; ctx.textAlign = "left";
    const place = S.pos > S.rival ? 1 : 2; S.place = place;
    if (S.running) { ctx.fillStyle = place === 1 ? "#ffc83d" : "#fff"; ctx.strokeStyle = "#0a1633"; ctx.lineWidth = H * 0.01; const txt = place === 1 ? "1st" : "2nd"; ctx.strokeText(txt, W * 0.03, H * 0.2); ctx.fillText(txt, W * 0.03, H * 0.2); }
    ctx.restore();
  }
  const easeOut = (t) => 1 - Math.pow(1 - t, 3) + Math.sin(t * Math.PI) * 0.15;

  /* ---- star board: rows of up to five big stars, between Ollie's subtitle (#cap, top centre) and the talk bar ----
     A number line sits under each row: from the start when b.digits (初級), otherwise the board grows downwards to make
     room for it once the answer is in (the talk bar has slid away by then), so the stars can be as big as possible. */
  function boardLayout(b, now) {
    const k = W / innerWidth, rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 12;
    const capEl = document.getElementById("cap"), talk = document.getElementById("talk");
    const top = Math.max((8.2 * rem + Math.max(capEl ? capEl.offsetHeight : 0, 6.8 * rem) + 0.8 * rem) * k, H * 0.225); // also clear of "1st" and "★ 12"
    const bottom = (innerHeight - 1.2 * rem - Math.max(talk ? talk.offsetHeight : 0, 19 * rem) - 0.8 * rem) * k;
    const cols = Math.min(5, b.n), rows = Math.ceil(b.n / 5), pad = H * 0.02, zh = bottom - top, ROW = 1.08, NUM = 0.34;
    const s = Math.max(H * 0.08, Math.min((zh - pad * 2) / (rows * (ROW + (b.digits ? NUM : 0))), (W * 0.84 - pad * 2) / (cols * 1.1))); // star size
    const g = b.digits ? 1 : b.growT ? Math.min(1, (now - b.growT) / 300) : 0;
    const cw = s * 1.1, pw = cols * cw + pad * 2, ph0 = rows * s * (ROW + (b.digits ? NUM : 0)) + pad * 2, rh = s * (ROW + NUM * g);
    return { s, cw, rh, pad, pw, ph: rows * rh + pad * 2, px: W / 2 - pw / 2, py: top + (zh - ph0) / 2 };
  }
  function drawBoard(now) {
    const b = S.board, L = boardLayout(b, now), s = L.s;
    const a = b.out ? Math.max(0, 1 - (now - b.out) / 400) : Math.min(1, (now - b.t0) / 220);
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(14,22,60,.92)"; roundRect(L.px, L.py, L.pw, L.ph, H * 0.035); ctx.fill();
    ctx.lineWidth = H * 0.009; ctx.strokeStyle = "#ffc83d"; ctx.stroke();
    ctx.restore();
    const tx = W * 0.9, ty = H * 0.18; // the kart's star counter
    const digit = (txt, x, y, px, fill) => { ctx.font = `700 ${px}px Fredoka, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round"; ctx.lineWidth = px * 0.2; ctx.strokeStyle = "#0a1633"; ctx.strokeText(txt, x, y); ctx.fillStyle = fill; ctx.fillText(txt, x, y); ctx.textBaseline = "alphabetic"; };
    let big = null;
    b.stars.forEach((st, i) => {
      if (!st.t || st.done) return;
      const cx = L.px + L.pad + ((i % 5) + 0.5) * L.cw, cy = L.py + L.pad + Math.floor(i / 5) * L.rh + s * 0.52;
      let x = cx, y = cy, k = easeOut(Math.min(1, (now - st.t) / 320));
      const u = st.c ? (now - st.c) / 420 : 2; // count-up pulse
      if (u < 1) k *= 1 + 0.22 * Math.sin(u * Math.PI);
      const f = st.f ? (now - st.f) / 480 : -1; // flight to the counter
      if (f >= 1) { st.done = true; S.got++; TC.sfx("coin"); return; }
      if (f > 0) { const e = f * f; x = cx + (tx - cx) * e; y = cy + (ty - cy) * e - Math.sin(f * Math.PI) * H * 0.07; k *= 1 - 0.7 * e; }
      const d = s * 1.16 * k; // the star fills about 84% of its picture: draw the picture a little larger than the cell
      if (IM.star.complete) ctx.drawImage(IM.star, x - d / 2, y - d * 0.465, d, d);
      if (f > 0 || !(b.digits || st.c)) return;
      if (u < 1) big = { n: i + 1, x: cx, y: cy + s * 0.7, px: s * (0.34 + 0.3 * Math.sin(u * Math.PI)) };
      else digit(i + 1, cx, cy + s * 0.74, s * 0.34, st.c ? "#ffc83d" : "#fff");
    });
    if (big) digit(big.n, big.x, big.y, big.px, "#ffe066"); // the number being counted, on top
    if (b.label && !b.out) { // answer plate under the board (the talk bar has slid away): ⑤ Five!
      const t = Math.min(1, (now - b.labelT) / 260), fh = H * 0.075 * (0.6 + 0.4 * easeOut(t));
      ctx.font = `700 ${fh}px Fredoka, sans-serif`;
      const tw = ctx.measureText(b.label).width, r = fh * 0.72, w = tw + r * 2 + fh * 1.3, x0 = W / 2 - w / 2, y0 = Math.min(L.py + L.ph + H * 0.018, H * 0.985 - r * 2);
      ctx.fillStyle = "rgba(255,255,255,.97)"; roundRect(x0, y0, w, r * 2, r); ctx.fill(); ctx.lineWidth = H * 0.008; ctx.strokeStyle = "#4cc9ff"; ctx.stroke();
      ctx.fillStyle = "#ffc83d"; ctx.beginPath(); ctx.arc(x0 + r, y0 + r, r * 0.8, 0, 7); ctx.fill();
      ctx.textBaseline = "middle"; ctx.textAlign = "center"; ctx.fillStyle = "#0a1633"; ctx.fillText(b.n, x0 + r, y0 + r + fh * 0.04);
      ctx.textAlign = "left"; ctx.fillText(b.label, x0 + r * 2 + fh * 0.25, y0 + r + fh * 0.04); ctx.textBaseline = "alphabetic";
    }
  }

  function speedLines() {
    ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = H * 0.004;
    for (let i = 0; i < 24; i++) {
      const a = Math.random() * Math.PI * 2, r1 = H * (0.35 + Math.random() * 0.3), r2 = r1 + H * 0.2;
      ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r1, H * 0.42 + Math.sin(a) * r1 * 0.6); ctx.lineTo(W / 2 + Math.cos(a) * r2, H * 0.42 + Math.sin(a) * r2 * 0.6); ctx.stroke();
    }
  }

  function drawSign(x, y, sc, sg) {
    const w = H * 0.55 * sc, hgt = w * 0.95;
    ctx.fillStyle = "#222"; ctx.fillRect(x - w * 0.55, y - hgt * 1.25, w * 0.06, hgt * 1.25); ctx.fillRect(x + w * 0.49, y - hgt * 1.25, w * 0.06, hgt * 1.25);
    ctx.fillStyle = "#ffc83d"; roundRect(x - w * 0.55, y - hgt * 1.6, w * 1.1, hgt * 0.6, w * 0.08); ctx.fill();
    ctx.fillStyle = "#0a1633"; ctx.font = `700 ${hgt * 0.42}px Fredoka, sans-serif`; ctx.textAlign = "center"; ctx.fillText("?", x, y - hgt * 1.15);
  }
  function drawBanner(x, y, half) {
    const top = y - half * 0.9;
    ctx.fillStyle = "#222"; ctx.fillRect(x - half * 1.15, top, half * 0.05, half * 0.9); ctx.fillRect(x + half * 1.1, top, half * 0.05, half * 0.9);
    const bw = half * 2.3, bh = half * 0.22, n = 16;
    for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) { ctx.fillStyle = (i + j) % 2 ? "#111" : "#fff"; ctx.fillRect(x - half * 1.15 + (bw / n) * i, top + (bh / 2) * j, bw / n + 1, bh / 2 + 1); }
    ctx.fillStyle = "#ffc83d"; ctx.font = `700 ${bh * 0.9}px Fredoka, sans-serif`; ctx.textAlign = "center"; ctx.fillText("FINISH", x, top - bh * 0.25);
  }
  function roundRect(x, y, w, hh, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + hh, r); ctx.arcTo(x + w, y + hh, x, y + hh, r); ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function drawKart(x, y, sc, color, letter, tilt, rival) {
    const u = H * 0.0028 * sc * (rival ? 1 : 0.62);
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(0, 0, 70 * u, 14 * u, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#111"; roundRect(-66 * u, -38 * u, 30 * u, 36 * u, 6 * u); ctx.fill(); roundRect(36 * u, -38 * u, 30 * u, 36 * u, 6 * u); ctx.fill();
    const gb = ctx.createLinearGradient(0, -62 * u, 0, -12 * u); gb.addColorStop(0, "#ffffff"); gb.addColorStop(0.12, color); gb.addColorStop(1, "rgba(0,0,0,.45)");
    ctx.fillStyle = color; roundRect(-48 * u, -62 * u, 96 * u, 50 * u, 16 * u); ctx.fill(); ctx.fillStyle = gb; ctx.globalAlpha = 0.55; ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(255,255,255,.45)"; roundRect(-40 * u, -58 * u, 80 * u, 10 * u, 5 * u); ctx.fill();
    ctx.fillStyle = "#26293a"; roundRect(-60 * u, -78 * u, 120 * u, 10 * u, 4 * u); ctx.fill(); ctx.fillRect(-46 * u, -70 * u, 8 * u, 12 * u); ctx.fillRect(38 * u, -70 * u, 8 * u, 12 * u);
    ctx.fillStyle = "#8a94b8"; ctx.beginPath(); ctx.arc(-22 * u, -18 * u, 6 * u, 0, 7); ctx.arc(22 * u, -18 * u, 6 * u, 0, 7); ctx.fill();
    ctx.fillStyle = "#0a1633"; roundRect(-56 * u, -30 * u, 112 * u, 12 * u, 5 * u); ctx.fill();
    // driver helmet
    const gh = ctx.createRadialGradient(-9 * u, -92 * u, 2 * u, 0, -82 * u, 28 * u); gh.addColorStop(0, "#ffffff"); gh.addColorStop(0.5, rival ? "#8fa2ff" : "#eef2ff"); gh.addColorStop(1, rival ? "#4a5bc0" : "#9aa6cf");
    ctx.fillStyle = gh; ctx.beginPath(); ctx.arc(0, -82 * u, 26 * u, 0, 7); ctx.fill();
    if (rival && OLLIE.complete) ctx.drawImage(OLLIE, -30 * u, -122 * u, 60 * u, 70 * u);
    else { ctx.fillStyle = color; ctx.font = `700 ${30 * u}px Fredoka, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(letter, 0, -80 * u); ctx.textBaseline = "alphabetic"; }
    if (!rival && S.boost > 0) { for (let i = 0; i < 2; i++) { const fx = (i ? 30 : -30) * u; ctx.fillStyle = Math.random() > 0.5 ? "#ffc83d" : "#ff5a5a"; ctx.beginPath(); ctx.moveTo(fx - 10 * u, -20 * u); ctx.lineTo(fx + 10 * u, -20 * u); ctx.lineTo(fx, (10 + Math.random() * 30) * u); ctx.fill(); } }
    ctx.restore();
  }

  async function driveTo(d, dead) {
    // drive until the sign is just ahead, then brake
    S.target = 700;
    while (S.pos < d - 1400) { if (dead()) return; await TC.sleep(50); }
    S.target = 160;
    while (S.pos < d - 520) { if (dead()) return; await TC.sleep(40); }
    S.target = 0;
    await TC.sleep(500);
  }

  TC.games.kart = {
    mount(api) {
      cv = TC.h("canvas", { class: "game" }); api.stage.append(cv); ctx = cv.getContext("2d");
      cv.addEventListener("pointerdown", (e) => { if (!S.running || S.bubble || S.board) return; const r = cv.getBoundingClientRect(); S.lane = Math.max(-1, Math.min(1, S.lane + (e.clientX - r.left < r.width / 2 ? -1 : 1))); TC.sfx("whoosh"); });
      resize(); addEventListener("resize", resize);
      raf = requestAnimationFrame(draw);
    },
    idle() { S.run++; S.running = false; S.bubble = null; S.board = null; S.target = 300; S.rivalSpeed = 0; S.signs = []; S.finishAt = 0; S.kidName = ""; S.kidColor = "#ffc83d"; },
    async play(api) {
      const G = api.G, kid = api.kid, run = ++S.run;
      const dead = () => api.aborted || run !== S.run; // Esc, or a newer game has started
      Object.assign(S, { pos: 0, speed: 0, target: 0, boost: 0, rival: 1500, rivalSpeed: 0, signs: [], finishAt: 0, bubble: null, board: null, kidColor: kid.color, kidName: kid.name, running: true, lane: 0, laneX: 0, stars: [], got: 0, hint: 6 });
      const rounds = TC.rounds(5), used = [];
      for (let i = 0; i < rounds; i++) S.signs.push({ d: 3500 + i * 5200 });
      // star trails between the signs, weaving across the three lanes
      for (let d = 1200; d < 3500 + rounds * 5200 + 4000; d += 420) { const near = S.signs.some((sg) => Math.abs(sg.d - d) < 900); if (!near) S.stars.push({ d, lane: Math.round(Math.sin(d / 1700) * 1.4), done: false }); }
      TC.preloadClips && TC.preloadClips(Object.values(G.numbers).map((v) => v.w).concat(["yes", "go", "great"]));
      const N = rounds + 1;
      // start lights: three reds, then green
      const lights = TC.h("div", { style: "position:fixed;left:50%;top:25%;transform:translateX(-50%);z-index:30;display:flex;gap:2vh;padding:2vh 3vh;border-radius:3vh;background:#14182b;box-shadow:0 2vh 4vh rgba(0,0,0,.5)" });
      const bulbs = [0, 1, 2].map(() => { const b = TC.h("div", { style: "width:10vh;height:10vh;border-radius:50%;background:#3a2030;box-shadow:inset 0 -1vh 2vh rgba(0,0,0,.5)" }); lights.append(b); return b; });
      document.body.append(lights);
      for (let i = 0; i < 3; i++) { await TC.sleep(650); if (dead()) { lights.remove(); return null; } bulbs[i].style.background = "radial-gradient(circle at 35% 30%,#ffb3b3,#ff2a2a 60%,#a00)"; bulbs[i].style.boxShadow = "0 0 4vh #ff3b3b"; TC.sfx("tick"); TC.sfx("pop"); }
      await TC.sleep(700); if (dead()) { lights.remove(); return null; }
      bulbs.forEach((b) => { b.style.background = "radial-gradient(circle at 35% 30%,#d6ffe0,#2ee66b 60%,#0a8a3a)"; b.style.boxShadow = "0 0 4vh #2ee66b"; });
      TC.floatText("GO!", 50, 45, "#2ee66b"); TC.sfx("boost"); TC.speak("Go!");
      setTimeout(() => lights.remove(), 900);
      S.rivalSpeed = 420;
      for (let i = 0; i < rounds; i++) {
        api.progress(i, N);
        const sg = S.signs[i];
        await driveTo(sg.d, dead); if (dead()) return null;
        S.rivalSpeed = 80;
        // how many stars? 初級: 1–5 with a little running number under each star; 中級: 1–10, numbers only after the answer
        const easy = api.level === 1, max = easy ? 5 : 10;
        const all = Object.keys(G.numbers).map(Number).filter((x) => x <= max);
        const fresh = all.filter((x) => !used.includes(x));
        const n = fresh.length ? fresh[(Math.random() * fresh.length) | 0] : used.filter((x) => x <= max)[0] || all[0]; // never twice in a game (unless the level was lowered mid-game and 1–5 ran out)
        if (used.includes(n)) used.splice(used.indexOf(n), 1);
        used.push(n);
        const word = G.numbers[n].w, Word = cap(word);
        const b = (S.board = { n, digits: easy, t0: performance.now(), stars: Array.from({ length: n }, () => ({ t: 0, c: 0, f: 0, done: false })), growT: 0, label: "", labelT: 0, out: 0 });
        await TC.sleep(250);
        for (let j = 0; j < n; j++) { if (dead()) return null; b.stars[j].t = performance.now(); TC.sfx("pop"); await TC.sleep(n > 5 ? 200 : 260); }
        await TC.sleep(200); if (dead()) return null;
        const r = await api.ask({ teacher: G.teacher, tzh: G.tzh, say: Word + "!", zh: "數數看有幾顆星星", keys: [[word, String(n)]], word, hideKey: true });
        if (dead()) return null;
        TC.hideTalk(); b.growT = performance.now();
        // count-up: each star pulses in turn with its number
        await TC.sleep(450);
        for (let j = 0; j < n; j++) { if (dead()) return null; b.stars[j].c = performance.now(); TC.sfx("click"); await TC.sleep(n > 5 ? 230 : 300); }
        await TC.sleep(250); if (dead()) return null;
        b.label = Word + "!"; b.labelT = performance.now();
        const said = TC.speak(r.ok ? "Yes! " + Word + "!" : Word + "!"); // Ollie: "Yes! Five!"
        sg.done = true;
        await TC.sleep(900); await Promise.race([said, TC.sleep(2200)]); // keep the stars up while Ollie says it
        if (dead()) return null;
        // the stars fly into the kart's star counter, then the turbo fires
        const t = performance.now(); b.out = t; b.stars.forEach((st, j) => (st.f = t + j * 80));
        TC.sfx("whoosh");
        await TC.sleep(n * 80 + 560); if (dead()) return null;
        b.stars.forEach((st) => { if (!st.done) { st.done = true; S.got++; } }); // (a frame was skipped)
        S.board = null;
        if (r.ok) { TC.sfx("boost"); S.boost = 2.6; S.shake = 0.4; TC.floatText(r.by === "ai" ? "TURBO!" : "GO!", 50, 45, "#ffc83d"); }
        S.target = 700; S.rivalSpeed = i < 2 ? 640 : 380;
        if (i === 2) { S.rival = Math.min(S.rival, S.pos - 400); }
      }
      // finish
      api.progress(rounds, N);
      S.lane = 0; S.finishAt = S.pos + 5200; S.rival = Math.min(S.rival, S.pos - 900); S.rivalSpeed = 500;
      await driveTo(S.finishAt + 700, dead); if (dead()) return null;
      // the kart is over the line: Ollie stops behind, the trophy appears, then "Are you tired?" → "No!"
      S.rivalSpeed = 0; S.rival = Math.min(S.rival, S.pos - 300);
      TC.sfx("levelup"); TC.confetti(90); TC.floatText("YOU WIN!", 50, 45, "#ffc83d");
      await TC.sleep(1100); if (dead()) return null;
      S.bubble = { img: "trophy", t: 0 }; TC.sfx("pop");
      const F = G.finale;
      await api.ask({ teacher: F.teacher, tzh: F.zh, say: F.say, keys: F.keys, word: F.word });
      if (dead()) return null;
      TC.hideTalk(); S.bubble = null;
      S.target = 900; S.boost = 2; TC.sfx("fanfare"); TC.confetti(220);
      TC.floatText("GREAT!", 50, 40, "#ffc83d"); TC.speak("Great!");
      const tro = TC.artImg("trophy"); tro.style.cssText = "position:fixed;left:50%;top:44%;width:34vh;height:34vh;margin:-17vh;z-index:44;filter:drop-shadow(0 0 4vh #ffc83d)";
      document.body.append(tro); tro.animate([{ transform: "scale(.2) rotate(-30deg)", opacity: 0 }, { transform: "scale(1.15) rotate(6deg)", opacity: 1 }, { transform: "scale(1) rotate(0)" }], { duration: 800, easing: "cubic-bezier(.2,1.5,.4,1)" });
      await TC.sleep(2600); tro.remove(); if (dead()) return null;
      S.target = 0; S.running = false;
      api.progress(N, N);
      return { ok: true };
    }
  };
  function cap(w) { return w[0].toUpperCase() + w.slice(1); }
})();
