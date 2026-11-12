/* Gate 2 · Pixel Craft — tap a colour block, answer "What color is it?", and the blocks of that colour drop in
   and build the picture (passport L19 colours) */
(function () {
  "use strict";
  TC.games = TC.games || {};
  const KEY = { r: "red", o: "orange", y: "yellow", g: "green", b: "blue", p: "purple", w: "white", k: "black", n: "brown", i: "pink" };
  const ART = [
    { name: "rainbow", reveal: "Look at the rainbow!", grid: [
      "....rrrrrrrr....",
      "..rroooooooorr..",
      ".rooyyyyyyyyoor.",
      "rooyyggggggyyoor",
      "royggbbbbbbggyor",
      "roygbbppppbbgyor",
      "roygbp....pbgyor",
      "roygbp....pbgyor",
      "roygbp....pbgyor"] },
    { name: "medal", reveal: "It's a gold medal! You are number one!", grid: [
      "bb........rr",
      ".bb......rr.",
      "..bb....rr..",
      "...bb..rr...",
      "....brrb....",
      "....yyyy....",
      "..yyyyyyyy..",
      ".yyyyooyyyy.",
      ".yyyooooyyy.",
      ".yyyyooyyyy.",
      "..yyyyyyyy..",
      "....yyyy...."] },
    { name: "sun", reveal: "It's the sun! The sun is yellow.", grid: [
      "......o......",
      "..o...o...o..",
      "...o.yyy.o...",
      "....yyyyy....",
      "...yykykyy...",
      "ooyyyyyyyyyoo",
      "...yyrrryy...",
      "....yyyyy....",
      "...o.yyy.o...",
      "..o...o...o..",
      "......o......"] },
    { name: "icecream", reveal: "It's ice cream! I love ice cream.", grid: [
      "....rr....",
      "...iiii...",
      "..iiiiii..",
      ".iwiiiiii.",
      ".iiiiiiii.",
      ".nnnnnnnn.",
      "..oyoyoy..",
      "..yoyoyo..",
      "...oyoy...",
      "...yoyo...",
      "....oo....",
      "....oo...."] },
    { name: "ollie", reveal: "It's Ollie-Bot! Hello, Ollie!", grid: [
      ".....y......",
      "....yyy.....",
      ".....k......",
      ".p........p.",
      ".pppppppppp.",
      "ppwwwppwwwpp",
      "pwwkwppwkwwp",
      "pwwwwppwwwwp",
      "ppwwpoopwwpp",
      "pppppooppppp",
      "pppwwwwwwppp",
      "pppwwwwwwppp",
      ".pppppppppp.",
      "..oo....oo.."] }
  ];

  const OPERA = TC.artImg("opera");
  let spinStart = 0, cv, ctx, W, H, raf, art = null, blocks = [], palette = [], glow = null, t0 = 0, sparks = [], swRects = [], pickCb = null, picked = null, toyMode = false;
  let hero = null, caption = ""; // hero = the picked colour shown BIG while the question is asked
  function resize() { const r = Math.min(1, 1600 / innerWidth); W = cv.width = Math.round(innerWidth * r); H = cv.height = Math.round(innerHeight * r); layout(); }
  let L = { s: 30, ox: 0, oy: 0, d: 10 };
  function layout() {
    if (!art) return;
    const rows = art.grid.length, cols = Math.max(...art.grid.map((r) => r.length));
    // the strip under the HUD stays free for Ollie's subtitle, so the picture sits between 25% and 70% of the height
    const s = Math.floor(Math.min((W * 0.62) / (cols + 0.4), (H * 0.45) / (rows + 0.63)));
    L = { s, d: s * 0.38, ox: W * 0.56 - (cols * s) / 2, oy: H * 0.25 + s * 0.38 };
  }
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    r = Math.min(255, Math.max(0, r * f)); g = Math.min(255, Math.max(0, g * f)); b = Math.min(255, Math.max(0, b * f));
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  }
  const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
  function rrect(x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
  function cube(x, y, s, d, hex, alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = shade(hex, 1.18); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d, y - d); ctx.lineTo(x + s + d, y - d); ctx.lineTo(x + s, y); ctx.fill();
    ctx.fillStyle = shade(hex, 0.72); ctx.beginPath(); ctx.moveTo(x + s, y); ctx.lineTo(x + s + d, y - d); ctx.lineTo(x + s + d, y + s - d); ctx.lineTo(x + s, y + s); ctx.fill();
    ctx.fillStyle = hex; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.fillRect(x + s * 0.12, y + s * 0.12, s * 0.22, s * 0.22);
    ctx.strokeStyle = "rgba(0,0,0,.18)"; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
    ctx.globalAlpha = 1;
  }
  /* where the big block sits: on the left, where the palette was (the build stays fully visible) */
  function heroBox() { const s = Math.min(H * 0.27, W * 0.135); return { s, d: s * 0.35, x: W * 0.05, y: H * 0.275 }; }
  function star4(x, y, r, a) {
    ctx.globalAlpha = a; ctx.fillStyle = "#fff"; ctx.beginPath();
    for (let i = 0; i < 8; i++) { const q = (i * Math.PI) / 4, rr = i % 2 ? r * 0.28 : r; ctx.lineTo(x + Math.cos(q) * rr, y + Math.sin(q) * rr); }
    ctx.fill(); ctx.globalAlpha = 1;
  }
  function drawHero(t) {
    const B = heroBox(), k = Math.min(1, (performance.now() - hero.t0) / 450), u = k - 1;
    const back = 1 + 2.70158 * u * u * u + 1.70158 * u * u, ease = 1 - u * u; // pop in from the tapped swatch
    const s = hero.s0 + (B.s - hero.s0) * back, d = s * 0.35;
    const x = hero.x0 + (B.x - hero.x0) * ease, y = hero.y0 + (B.y - hero.y0) * ease + Math.sin(t * 2.4) * B.s * 0.02 * k;
    // card behind the block: dark for white/yellow, light for the others, so every colour is unmistakable
    const pad = B.s * 0.15, dark = lum(hero.hex) > 0.8;
    ctx.globalAlpha = k; ctx.fillStyle = dark ? "rgba(16,30,72,.86)" : "rgba(255,255,255,.9)";
    rrect(B.x - pad, B.y - B.d - pad, B.s + B.d + pad * 2, B.s + B.d + pad * 2, B.s * 0.14); ctx.fill();
    ctx.lineWidth = Math.max(2, B.s * 0.022); ctx.strokeStyle = dark ? "rgba(255,255,255,.85)" : "rgba(10,22,51,.28)"; ctx.stroke();
    ctx.globalAlpha = 1;
    // soft shadow under the block
    ctx.fillStyle = dark ? "rgba(0,0,0,.35)" : "rgba(10,22,51,.16)"; ctx.beginPath(); ctx.ellipse(B.x + (B.s + B.d) / 2, B.y + B.s + pad * 0.42, B.s * 0.5, pad * 0.3, 0, 0, 7); ctx.fill();
    cube(x, y, s, d, hero.hex);
    // gloss: light from the top-left, shade at the bottom-right, a shiny streak
    const g = ctx.createLinearGradient(x, y, x + s, y + s);
    g.addColorStop(0, "rgba(255,255,255,.42)"); g.addColorStop(0.5, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(0,0,0,.2)");
    ctx.fillStyle = g; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = "rgba(255,255,255,.3)"; ctx.beginPath(); ctx.moveTo(x + s * 0.08, y + s * 0.5); ctx.lineTo(x + s * 0.5, y + s * 0.08); ctx.lineTo(x + s * 0.66, y + s * 0.08); ctx.lineTo(x + s * 0.08, y + s * 0.66); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.beginPath(); ctx.moveTo(x + s * 0.1, y - d * 0.12); ctx.lineTo(x + s * 0.1 + d * 0.76, y - d * 0.88); ctx.lineTo(x + s * 0.5 + d * 0.76, y - d * 0.88); ctx.lineTo(x + s * 0.5, y - d * 0.12); ctx.fill();
    // bold outline
    ctx.lineJoin = "round"; ctx.lineWidth = Math.max(2, s * 0.028); ctx.strokeStyle = dark ? "rgba(10,22,51,.7)" : "rgba(10,22,51,.6)";
    ctx.beginPath(); ctx.moveTo(x, y + s); ctx.lineTo(x, y); ctx.lineTo(x + d, y - d); ctx.lineTo(x + s + d, y - d); ctx.lineTo(x + s + d, y + s - d); ctx.lineTo(x + s, y + s); ctx.closePath();
    ctx.moveTo(x, y); ctx.lineTo(x + s, y); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y); ctx.lineTo(x + s + d, y - d); ctx.stroke();
    // twinkles
    [[0.2, 0.22, 0], [1.02, -0.2, 2.1], [0.82, 0.86, 4.2]].forEach(([fx, fy, ph]) => star4(x + s * fx, y + s * fy, s * 0.085, k * (0.35 + 0.65 * Math.abs(Math.sin(t * 2.6 + ph)))));
  }
  function showHero(name) {
    const q = swRects.find((r) => r.p.name === name), B = heroBox();
    if (TC.caption) TC.caption(""); // Ollie's last line must not sit next to a new colour
    hero = { name, hex: TC_CONTENT.gates[2].colors[name].hex, t0: performance.now(), x0: q ? q.cx : B.x, y0: q ? q.cy : B.y, s0: q ? q.sz : B.s * 0.3 };
  }
  function popHero(hex) {
    if (!hero) return;
    const B = heroBox(), c = hex || hero.hex; hero = null;
    burst(B.x + B.s * 0.5, B.y + B.s * 0.5, c); burst(B.x + B.s * 0.8, B.y + B.s * 0.2, lum(c) > 0.8 ? "#ffc83d" : "#ffffff");
  }
  function draw() {
    raf = requestAnimationFrame(draw);
    const t = (performance.now() - t0) / 1000;
    // sky + ground
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#7fd3ff"); g.addColorStop(0.7, "#c9f0ff"); g.addColorStop(0.71, "#7bd36b"); g.addColorStop(1, "#4fae4a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // voxel clouds
    for (let i = 0; i < 4; i++) { const cx = ((t * 18 * (i + 1) + i * 420) % (W + 300)) - 150, cy = H * (0.1 + i * 0.07), s = H * 0.03; for (let k = 0; k < 4; k++) cube(cx + k * s, cy + (k % 2 ? 0 : -s * 0.5), s, s * 0.35, "#ffffff", 0.85); }
    if (OPERA.complete) { const ow = H * 0.26; ctx.globalAlpha = 0.9; ctx.drawImage(OPERA, W * 0.8, H * 0.71 - ow * 0.9, ow * 1.05, ow); ctx.globalAlpha = 1; }
    // ground grid
    ctx.strokeStyle = "rgba(0,0,0,.08)"; for (let x = 0; x < W; x += H * 0.05) { ctx.beginPath(); ctx.moveTo(x, H * 0.71); ctx.lineTo(x - H * 0.1, H); ctx.stroke(); }
    if (!art) return;
    const { s, d, ox, oy } = L;
    const rows = art.grid.length;
    // ghost outline of the hidden picture
    for (const b of blocks) if (!b.placed) { ctx.strokeStyle = "rgba(10,22,51,.25)"; ctx.setLineDash([s * 0.15, s * 0.12]); ctx.strokeRect(ox + b.c * s + 2, oy + b.r * s + 2, s - 4, s - 4); ctx.setLineDash([]); }
    // blocks: bottom rows first, left → right (the finished sculpture spins once at the finale)
    const order = blocks.slice().sort((a, b) => b.r - a.r || a.c - b.c);
    const cols = Math.max(...art.grid.map((r) => r.length)), cx = ox + (cols * s) / 2;
    let sx = 1; if (spinStart) { const k = Math.min(1, (performance.now() - spinStart) / 2400); sx = Math.cos(k * Math.PI * 2); if (k >= 1) spinStart = 0; }
    ctx.save(); ctx.translate(cx, 0); ctx.scale(Math.abs(sx) < 0.04 ? 0.04 : sx, 1); ctx.translate(-cx, 0);
    for (const b of order) {
      if (!b.placed) continue;
      if (b.y < 0) { b.vy += 2.2; b.y += b.vy; if (b.y >= 0) { b.y = 0; if (b.vy > 8) { b.vy = -b.vy * 0.28; if (!b.popped) { b.popped = 1; TC.sfx("click"); } } else b.vy = 0; } }
      else if (b.vy) { b.vy += 2.2; b.y += b.vy; if (b.y >= 0) { b.y = 0; b.vy = 0; } }
      const wob = glow ? Math.sin(t * 6 + b.c * 0.5 + b.r * 0.3) * s * 0.06 : 0;
      cube(ox + b.c * s, oy + b.r * s + b.y + wob, s, d, b.hex);
    }
    ctx.restore();
    // shadow line
    ctx.fillStyle = "rgba(0,0,0,.15)"; ctx.fillRect(ox - d, oy + rows * s, art.grid[0].length * s + d * 2, s * 0.25);
    // what the finished picture is — on-screen text only (Ollie just says "Wow!")
    if (caption) {
      ctx.font = `700 ${H * 0.058}px Fredoka, sans-serif`; ctx.textAlign = "center";
      const tw = Math.min(W * 0.84, ctx.measureText(caption).width), bw = tw + H * 0.09, bh = H * 0.105, bx = W * 0.5 - bw / 2, by = H * 0.775;
      ctx.fillStyle = "rgba(255,255,255,.94)"; rrect(bx, by, bw, bh, bh / 2); ctx.fill();
      ctx.lineWidth = H * 0.006; ctx.strokeStyle = "#ffc83d"; ctx.stroke();
      ctx.fillStyle = "#0a1633"; ctx.fillText(caption, W * 0.5, by + bh * 0.69, W * 0.84);
    }
    // glow fireworks
    if (glow) { if (Math.random() < 0.25) burst(W * (0.2 + Math.random() * 0.6), H * (0.1 + Math.random() * 0.3), glow); }
    for (const p of sparks) { p.vy += 0.15; p.x += p.vx; p.y += p.vy; p.l -= 0.015; ctx.globalAlpha = Math.max(0, p.l); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, H * 0.008, H * 0.008); }
    ctx.globalAlpha = 1; sparks = sparks.filter((p) => p.l > 0);
    ctx.textAlign = "left";
    if (hero) {
      // the picked colour, BIG; the other colours wait in a small row underneath
      const B = heroBox(), sz = H * 0.036, step = Math.min(sz * 1.55, (B.s + B.d) / palette.length);
      palette.forEach((p, i) => { if (p.name !== hero.name) cube(B.x + i * step, H * 0.63, sz, sz * 0.35, p.hex, p.done ? 0.3 : 1); });
      drawHero(t);
      return;
    }
    // palette swatches (left): tap one! (a colour gets its ✓ and its name once it has been said)
    const picking = !!pickCb;
    palette.forEach((p, i) => {
      const x = W * 0.05, y = H * 0.16 + i * H * 0.088, sz = H * (picked === p.name ? 0.075 : 0.062), pulse = p.done ? 0 : Math.sin(t * 5 + i) * (picking ? 0.1 : 0.06);
      swRects[i] = { p, x: x - 10, y: y - sz * 0.6, w: W * 0.2, h: sz * 1.5, cx: x, cy: y, sz };
      if (picked === p.name) { ctx.fillStyle = "rgba(255,255,255,.75)"; rrect(x - 14, y - sz * 0.55, W * 0.2, sz * 1.5, 18); ctx.fill(); }
      cube(x, y - sz * pulse, sz, sz * 0.35, p.hex, p.done ? 0.35 : 1);
      if (!p.done) return;
      ctx.font = `600 ${H * 0.032}px Fredoka, sans-serif`; ctx.fillStyle = "rgba(10,22,51,.4)";
      ctx.fillText("✓ " + p.name, x + sz * 1.55, y + sz * 0.68);
    });
    swRects.length = palette.length;
    const next = palette.findIndex((p) => !p.done);
    if (picking && next >= 0) { // a bouncing hand points at the next block the picture needs
      const bob = Math.abs(Math.sin(t * 4)) * W * 0.012;
      ctx.font = `${H * 0.075}px sans-serif`; ctx.fillStyle = "#0a1633"; ctx.fillText("👈", W * 0.05 + H * 0.115 + bob, H * 0.16 + next * H * 0.088 + H * 0.06);
    }
  }
  function burst(x, y, c) { for (let i = 0; i < 40; i++) { const a = Math.random() * 7, v = 2 + Math.random() * 5; sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c, l: 1 }); } TC.sfx("pop"); }

  function setArt(a) {
    art = a; layout(); blocks = []; glow = null; hero = null; caption = ""; picked = null; pickCb = null; toyMode = false; spinStart = 0;
    a.grid.forEach((row, r) => row.split("").forEach((ch, c) => { if (KEY[ch]) blocks.push({ r, c, color: KEY[ch], hex: TC_CONTENT.gates[2].colors[KEY[ch]].hex, placed: false, y: 0, vy: 0 }); }));
    const used = [...new Set(blocks.map((b) => b.color))];
    palette = used.map((name) => ({ name, hex: TC_CONTENT.gates[2].colors[name].hex, done: false }));
  }
  async function drop(color) {
    const list = blocks.filter((b) => b.color === color && !b.placed).sort((a, b) => b.r - a.r || a.c - b.c);
    for (let i = 0; i < list.length; i++) { const b = list[i]; b.placed = true; b.y = -H * (0.5 + Math.random() * 0.2); b.vy = 0; if (i % 3 === 0) await TC.sleep(35); }
    await TC.sleep(900);
  }
  /** 👆 the child taps a colour block; after `ms` (or when the teacher presses Enter) the game picks for them → null */
  function waitPick(ms) {
    picked = null; TC.hideTalk(); TC.floatText("👆 Tap a color!", 40, 52, "#0a1633");
    return new Promise((res) => {
      // every wait owns its timer, and only clears pickCb / TC.pending while they are still its own
      let timer = 0, fin = false;
      const done = (v) => { if (fin) return; fin = true; clearTimeout(timer); if (pickCb === done) pickCb = null; if (TC.pending === auto) TC.pending = null; res(v); };
      const auto = () => done(null);
      pickCb = done; TC.pending = auto; timer = setTimeout(auto, ms);
    });
  }

  TC.games.craft = {
    mount(api) { cv = TC.h("canvas", { class: "game" }); api.stage.append(cv); ctx = cv.getContext("2d");
      cv.addEventListener("pointerdown", (e) => {
        const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * (W / r.width), y = (e.clientY - r.top) * (H / r.height);
        const hit = pickCb && !hero && swRects.find((q) => x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h && !q.p.done);
        if (hit) { picked = hit.p.name; TC.sfx("pop"); pickCb(hit.p.name); return; }
        if (toyMode || !pickCb) { // toy: tap a block to make it hop
          const { s, ox, oy } = L; const c = Math.floor((x - ox) / s), rr = Math.floor((y - oy) / s);
          const b = blocks.find((q) => q.placed && q.c === c && q.r === rr && q.y === 0);
          if (b) { b.vy = -H * 0.03; b.y = -1; TC.sfx("pop"); burst(x, y, b.hex); }
        }
      }); t0 = performance.now(); resize(); addEventListener("resize", resize); raf = requestAnimationFrame(draw); this.idle(api); },
    idle() { setArt(ART[(Math.random() * ART.length) | 0]); blocks.forEach((b) => { b.placed = true; }); glow = null; },
    preview(i) { setArt(ART[i]); blocks.forEach((b) => { b.placed = true; }); },
    async play(api) {
      const G = api.G, C = G.colors;
      // quick mode: prefer a picture with few colours; colours that are not asked drop in by themselves
      const few = TC.cfg.rounds ? ART.filter((x) => new Set(x.grid.join("").replace(/\./g, "")).size <= TC.cfg.rounds + 1) : [];
      const pool = few.length ? few : ART;
      const a = pool[(Math.random() * pool.length) | 0]; setArt(a);
      const asks = TC.rounds(palette.length), N = asks + 1;
      let last = palette[0].name;
      api.progress(0, N);
      TC.floatText("Let's build!", 56, 54, "#0a1633");
      await TC.speak("OK! Go!");
      if (api.aborted) return null;
      for (let i = 0; i < asks; i++) {
        api.progress(i, N);
        // 👆 tap the colour block you want (after a few seconds, or on Enter, the next colour the picture needs is picked)
        const tapped = await waitPick(6000);
        if (api.aborted) return null;
        const name = tapped || palette.find((p) => !p.done).name;
        picked = name; showHero(name); TC.sfx("whoosh");
        // the picked colour is shown BIG → "What color is it?" → "It's red."
        const r = await api.ask({ teacher: G.teacher, tzh: G.tzh, say: C[name].say, zh: C[name].zh, keys: [[name]], word: name, hideKey: true });
        if (api.aborted) return null;
        palette.find((p) => p.name === name).done = true; picked = null; last = name;
        popHero();
        TC.floatText(cap(name) + "!", 55, 54, C[name].hex);
        await Promise.all([drop(name), TC.speak(r.ok ? `Yes! It's ${name}.` : `It's ${name}.`)]);
        if (api.aborted) return null;
      }
      const rest = palette.filter((p) => !p.done);
      if (rest.length) { rest.forEach((p) => { p.done = true; }); TC.sfx("whoosh"); await Promise.all(rest.map((p) => drop(p.name))); }
      if (api.aborted) return null;
      // ✨ the finished picture
      api.progress(asks, N); TC.hideTalk();
      TC.sfx("fanfare"); TC.confetti(120); toyMode = true; spinStart = performance.now(); caption = a.reveal;
      await Promise.all([TC.speak("Wow!"), TC.sleep(2800)]);
      if (api.aborted) return null;
      // ★ "What color do you like?" — tap your favourite block (or we suggest the last colour); any colour word is right
      const F = G.finale, names = Object.keys(C);
      palette.forEach((p) => { p.done = false; });
      const fav = (await waitPick(5000)) || last;
      if (api.aborted) return null;
      caption = ""; picked = fav; showHero(fav); TC.sfx("whoosh");
      const r = await api.ask({ teacher: F.teacher, tzh: F.zh, say: F.say.replace("[color]", fav), zh: C[fav].zh + "（或你喜歡的顏色）", keys: [names], word: fav, hideKey: true });
      if (api.aborted) return null;
      const liked = (r.ok && TC.pickHeard(r.heard, names)) || fav;
      if (r.ok) TC.lastSay = F.say.replace("[color]", liked); // everybody repeats what the child really said
      palette.forEach((p) => { p.done = true; }); picked = null;
      glow = C[liked].hex; popHero(glow); TC.sfx("levelup");
      TC.floatText(`${cap(liked)}! ✨`, 55, 54, glow);
      await TC.speak(`Great! I like ${liked}!`);
      if (api.aborted) return null;
      TC.floatText("👆 Tap the blocks!", 55, 52, "#0a1633");
      await TC.sleep(4000); toyMode = false;
      api.progress(N, N);
      return { ok: true };
    }
  };
  function cap(w) { return w[0].toUpperCase() + w.slice(1); }
})();
