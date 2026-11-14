/* Gate 2 · Pixel Craft — tap and the voxel blocks drop in to build a pixel portrait of a family member, then say who it is
   ("Who is he?" → "He's my grandpa."); at the end all the portraits stand together in a family photo (passport L2 family) */
(function () {
  "use strict";
  TC.games = TC.games || {};
  // block colours: skin, hair, eyes, clothes … t/r = the green-red 土城 badge every family member wears on the chest
  const PAL = {
    s: "#f7c9a3", S: "#e3a27a", e: "#22202e", w: "#ffffff", m: "#d9465e", c: "#ff9fb2",
    h: "#3b2618", H: "#7a4524", g: "#aeb4c0", G: "#e9ecf2", q: "#2c3e66", f: "#c8902c", P: "#e0559a",
    b: "#3d7be0", r: "#e5383b", t: "#1f9d55", y: "#ffc83d", p: "#e2559a", n: "#9a6034",
    o: "#9a7ad6", O: "#7656b6", B: "#2f6fe0", d: "#2ab0a0", i: "#ff5fa2", u: "#ffd23d"
  };
  // 16 × 16 front-facing busts, one per passport family word (father: tie · mother: long hair, earrings ·
  // grandpa: bald top, glasses, moustache · grandma: grey bun, glasses · brother: cap · sister: pigtails, bows)
  const FACES = {
    father: [
      "................",
      ".....hhhhhh.....",
      "....hhhhhhhh....",
      "...hhhhhhhhhh...",
      "...hhsssssshh...",
      "...hshhsshhsh...",
      "...SssessessS...",
      "...SscsssscsS...",
      "....ssmssmss....",
      "....sssmmsss....",
      ".....ssssss.....",
      "......ssss......",
      "..bbbbwrrwbbbb..",
      ".bbbbbbrrbbbbbb.",
      ".bbttbbrrbbbbbb.",
      ".bbrrbbrrbbbbbb."],
    mother: [
      "................",
      ".....HHHHHH.....",
      "....HHHHHHHH....",
      "...HHHHHHHHHH...",
      "..HHHHssssHHHH..",
      "..HHsessssesHH..",
      "..HHssessessHH..",
      "..HHscsssscsHH..",
      "..HHssmssmssHH..",
      "..HysssmmsssyH..",
      "..HHHssssssHHH..",
      "..HHHHssssHHHH..",
      ".HHHpppsspppHHH.",
      ".HHppppyyppppHH.",
      ".ppttpppppppppp.",
      ".pprrpppppppppp."],
    grandpa: [
      "................",
      "......ssss......",
      "....ssssssss....",
      "...gssssssssg...",
      "..gggssssssggg..",
      "..ggfffssfffgg..",
      "...SfeffffefS...",
      "...SfffssfffS...",
      "....sggggggs....",
      "....gsmmmmsg....",
      ".....ssssss.....",
      "......ssss......",
      "..nnnnwwwwnnnn..",
      ".nnnnnwwwwnnnnn.",
      ".nnttnnwwnnnnnn.",
      ".nnrrnnwwnnnnnn."],
    grandma: [
      "......gggg......",
      "......gGgg......",
      "....gggggggg....",
      "...gggggggggg...",
      "...ggssssssgg...",
      "...gPPPssPPPg...",
      "...gPePPPPePg...",
      "...SPPPssPPPS...",
      "....ssmssmss....",
      "....sssmmsss....",
      ".....ssssss.....",
      "......ssss......",
      "..oooowsswoooo..",
      ".oooooowwoooooo.",
      ".oottooOOoooooo.",
      ".oorrooOOoooooo."],
    brother: [
      "................",
      "....BBBBBBBB....",
      "...BBBBwBBBBB...",
      "..qqqqqqqqqqqq..",
      "...hhsssssshh...",
      "...hssssssssh...",
      "...SssessessS...",
      "...SscsssscsS...",
      "....smwwwwms....",
      ".....smmmms.....",
      "......ssss......",
      "...ddddssdddd...",
      "..dddddddddddd..",
      ".dddddddddddddd.",
      ".ddttdddddddddd.",
      ".ddrrdddddddddd."],
    sister: [
      "................",
      ".....HHHHHH.....",
      ".ii.HHHHHHHH.ii.",
      ".iiHHHHHHHHHHii.",
      "..HHHssssssHHH..",
      "..HHsessssesHH..",
      ".HHHssessessHHH.",
      ".HH.scsssscs.HH.",
      ".HH.ssmssmss.HH.",
      ".HH..ssmmss..HH.",
      "..ii..ssss..ii..",
      "...uuuwsswuuu...",
      "..uuuuwwwwuuuu..",
      ".uuuuuuuuuuuuuu.",
      ".uuttuuuuuuuuuu.",
      ".uurruuuuuuuuuu."]
  };
  const NAMES = Object.keys(FACES), N16 = 16, BUILD_TAPS = 3;
  const OPERA = TC.artImg("opera"), OLLIE = TC.artImg("ollie");
  const PIN = new Image(); // the real 土城 pin on the family-photo frame
  PIN.src = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-23 -23 46 46">${TC.seal(0, 0, 20)}</svg>`);

  let cv, ctx, W, H, raf, t0 = 0, sparks = [];
  let mode = "one", pieces = [], blocks = [], frame = null; // "one" = a single portrait being built · "photo" = everybody together
  let glow = null, spinStart = 0, word = "", wordT = 0, toyMode = false, building = null, tapCb = null;
  function resize() { const r = Math.min(1, 1600 / innerWidth); W = cv.width = Math.round(innerWidth * r); H = cv.height = Math.round(innerHeight * r); layout(); }
  function layout() {
    if (!pieces.length || !W) return;
    if (mode === "one") {
      // big, between the HUD and the talk bar (≈ 14 %–66 % of the height), so the whole face shows while the question is asked
      const s = Math.floor(Math.min((W * 0.5) / (N16 + 0.4), (H * 0.5) / (N16 + 0.63)));
      Object.assign(pieces[0], { s, d: s * 0.38, ox: W * 0.5 - (N16 * s) / 2, oy: H * 0.14 + s * 0.38 });
      frame = null;
      return;
    }
    // family photo: the portraits side by side in a frame, Ollie at the end of the row
    const n = pieces.length, gap = 2, ol = 11, cols = n * N16 + (n - 1) * gap + gap + ol;
    const s = Math.floor(Math.min((W * 0.84) / cols, (H * 0.36) / (N16 + 0.63)));
    const rw = cols * s, x0 = W * 0.5 - rw / 2, y0 = H * 0.39 - (N16 * s) / 2;
    pieces.forEach((P, i) => Object.assign(P, { s, d: s * 0.38, ox: x0 + i * (N16 + gap) * s, oy: y0 }));
    frame = { x: x0 - s * 2.2, y: y0 - s * 2.6, w: rw + s * 4.4, h: N16 * s + s * 5.2, s, ox: x0 + n * (N16 + gap) * s, ow: ol * s };
  }
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    r = Math.min(255, Math.max(0, r * f)); g = Math.min(255, Math.max(0, g * f)); b = Math.min(255, Math.max(0, b * f));
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  }
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
  function pill(text, cx, cy, size, fill, ink, edge) {
    ctx.font = `700 ${size}px Fredoka, sans-serif`; ctx.textAlign = "center";
    const tw = Math.min(W * 0.84, ctx.measureText(text).width), bw = tw + size * 0.9, bh = size * 1.55, bx = cx - bw / 2, by = cy - bh / 2;
    ctx.fillStyle = fill; rrect(bx, by, bw, bh, bh / 2); ctx.fill();
    ctx.lineWidth = size * 0.07; ctx.strokeStyle = edge; ctx.stroke();
    ctx.fillStyle = ink; ctx.fillText(text, cx, by + bh * 0.68, W * 0.84);
    ctx.textAlign = "left";
    return { x: bx, y: by, w: bw, h: bh };
  }
  function drawFrame(t) {
    const F = frame, s = F.s;
    ctx.fillStyle = "rgba(10,22,51,.2)"; rrect(F.x + s * 0.5, F.y + s * 0.7, F.w, F.h, s * 1.2); ctx.fill();
    ctx.fillStyle = "#c98a3c"; rrect(F.x, F.y, F.w, F.h, s * 1.2); ctx.fill();
    ctx.lineWidth = s * 0.3; ctx.strokeStyle = "#8a5520"; ctx.stroke();
    const m = s * 0.9, g = ctx.createLinearGradient(0, F.y, 0, F.y + F.h);
    g.addColorStop(0, "#fff6d8"); g.addColorStop(1, "#ffe1a8");
    ctx.fillStyle = g; rrect(F.x + m, F.y + m, F.w - m * 2, F.h - m * 2, s * 0.6); ctx.fill();
    // little hearts floating in the photo
    ctx.font = `${s * 1.6}px sans-serif`; ctx.textAlign = "center"; ctx.fillStyle = "#ff5fa2";
    for (let i = 0; i < 5; i++) { ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t * 2 + i); ctx.fillText("❤", F.x + F.w * (0.1 + i * 0.2), F.y + m + s * 1.7 + Math.sin(t * 1.6 + i * 1.3) * s * 0.3); }
    ctx.globalAlpha = 1; ctx.textAlign = "left";
    if (OLLIE.complete && OLLIE.naturalWidth) { const oh = Math.min(F.ow * 1.25, N16 * s * 0.95); ctx.drawImage(OLLIE, F.ox + (F.ow - oh * 0.86) / 2, pieces[0].oy + N16 * s - oh + Math.sin(t * 3) * s * 0.15, oh * 0.86, oh); }
    if (PIN.complete && PIN.naturalWidth) { const pr = s * 4.6; ctx.drawImage(PIN, F.x + F.w - pr * 0.8, F.y - pr * 0.25, pr, pr); }
  }
  function draw() {
    raf = requestAnimationFrame(draw);
    const now = performance.now(), t = (now - t0) / 1000;
    // sky + ground
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#7fd3ff"); g.addColorStop(0.7, "#c9f0ff"); g.addColorStop(0.71, "#7bd36b"); g.addColorStop(1, "#4fae4a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // voxel clouds
    for (let i = 0; i < 4; i++) { const cx = ((t * 18 * (i + 1) + i * 420) % (W + 300)) - 150, cy = H * (0.1 + i * 0.07), s = H * 0.03; for (let k = 0; k < 4; k++) cube(cx + k * s, cy + (k % 2 ? 0 : -s * 0.5), s, s * 0.35, "#ffffff", 0.85); }
    if (OPERA.complete) { const ow = H * 0.26; ctx.globalAlpha = 0.9; ctx.drawImage(OPERA, W * 0.8, H * 0.71 - ow * 0.9, ow * 1.05, ow); ctx.globalAlpha = 1; }
    // ground grid
    ctx.strokeStyle = "rgba(0,0,0,.08)"; for (let x = 0; x < W; x += H * 0.05) { ctx.beginPath(); ctx.moveTo(x, H * 0.71); ctx.lineTo(x - H * 0.1, H); ctx.stroke(); }
    if (!pieces.length) return;
    if (frame) drawFrame(t);
    for (const P of pieces) {
      const { s, d, ox, oy } = P;
      if (building && P === pieces[0]) { // the glowing build area: tap it!
        const a = 0.45 + 0.35 * Math.sin(t * 6), pad = s * 0.6;
        ctx.fillStyle = `rgba(255,255,255,${0.22 + a * 0.2})`; rrect(ox - pad, oy - d - pad, N16 * s + d + pad * 2, N16 * s + d + pad * 2, s); ctx.fill();
        ctx.lineWidth = s * 0.22; ctx.strokeStyle = `rgba(255,200,61,${a + 0.2})`; ctx.stroke();
      }
      // a soft glowing ghost of the hidden picture
      ctx.fillStyle = `rgba(255,255,255,${building && P === pieces[0] ? 0.4 + 0.15 * Math.sin(t * 6) : 0.3})`;
      for (const b of P.blocks) if (!b.placed) ctx.fillRect(ox + b.c * s + 1, oy + b.r * s + 1, s - 2, s - 2);
      // blocks: bottom rows first, left → right (a finished portrait spins once)
      let sx = 1; if (spinStart && mode === "one") { const k = Math.min(1, (now - spinStart) / 1500); sx = Math.cos(k * Math.PI * 2); if (k >= 1) spinStart = 0; }
      const cx = ox + (N16 * s) / 2;
      ctx.save(); ctx.translate(cx, 0); ctx.scale(Math.abs(sx) < 0.04 ? 0.04 : sx, 1); ctx.translate(-cx, 0);
      for (const b of P.order) {
        if (!b.placed) continue;
        if (b.y < 0) { b.vy += 2.2; b.y += b.vy; if (b.y >= 0) { b.y = 0; if (b.vy > 8) { b.vy = -b.vy * 0.28; if (!b.popped) { b.popped = 1; TC.sfx("click"); } } else b.vy = 0; } }
        else if (b.vy) { b.vy += 2.2; b.y += b.vy; if (b.y >= 0) { b.y = 0; b.vy = 0; } }
        const wob = glow ? Math.sin(t * 6 + b.c * 0.5 + b.r * 0.3) * s * 0.06 : 0;
        cube(ox + b.c * s, oy + b.r * s + b.y + wob, s, d, b.hex);
      }
      ctx.restore();
      if (!frame) { ctx.fillStyle = "rgba(0,0,0,.15)"; ctx.fillRect(ox - d, oy + N16 * s, N16 * s + d * 2, s * 0.25); } // shadow line
    }
    if (frame) pill("My Family", W * 0.5, frame.y + frame.h, H * 0.042, "#ffc83d", "#0a1633", "#ffffff");
    if (building) { // the big BUILD! button, with a dot for each tap
      const k = 1 + Math.sin(t * 7) * 0.05, y = H * 0.8;
      pill("👆 BUILD!", W * 0.5, y, H * 0.062 * k, "#ffc83d", "#0a1633", "#ffffff");
      for (let i = 0; i < building.need; i++) { ctx.fillStyle = i < building.taps ? "#2ee6b6" : "rgba(255,255,255,.75)"; ctx.beginPath(); ctx.arc(W * 0.5 + (i - (building.need - 1) / 2) * H * 0.045, y + H * 0.085, H * 0.014, 0, 7); ctx.fill(); }
    }
    // after the answer: the word, BIG, next to the portrait
    if (word && mode === "one") {
      const k = Math.min(1, (now - wordT) / 350), u = k - 1, back = 1 + 2.70158 * u * u * u + 1.70158 * u * u;
      const P = pieces[0], x = (P.ox - P.d) / 2;
      ctx.save(); ctx.translate(x, H * 0.4); ctx.scale(back, back); ctx.rotate(-0.06);
      pill(word, 0, 0, Math.min(H * 0.085, (P.ox * 0.8) / (word.length * 0.56)), "rgba(255,255,255,.95)", "#0a1633", "#ffc83d");
      ctx.restore();
    }
    // fireworks
    if (glow && Math.random() < 0.25) burst(W * (0.2 + Math.random() * 0.6), H * (0.1 + Math.random() * 0.3), glow, true);
    for (const p of sparks) { p.vy += 0.15; p.x += p.vx; p.y += p.vy; p.l -= 0.015; ctx.globalAlpha = Math.max(0, p.l); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, H * 0.008, H * 0.008); }
    ctx.globalAlpha = 1; sparks = sparks.filter((p) => p.l > 0);
  }
  function burst(x, y, c, quiet) { for (let i = 0; i < 40; i++) { const a = Math.random() * 7, v = 2 + Math.random() * 5; sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c, l: 1 }); } if (!quiet) TC.sfx("pop"); }

  /** show these portraits: one ("one", to build) or several side by side ("photo") */
  function setPieces(names, m) {
    mode = m; glow = null; word = ""; spinStart = 0; toyMode = false; building = null; tapCb = null; blocks = [];
    pieces = names.map((name) => {
      const P = { name, blocks: [] };
      FACES[name].forEach((row, r) => row.split("").forEach((ch, c) => { if (PAL[ch]) P.blocks.push({ r, c, hex: PAL[ch], placed: false, y: 0, vy: 0, popped: 0 }); }));
      P.order = P.blocks.slice().sort((a, b) => b.r - a.r || a.c - b.c);
      blocks.push(...P.blocks);
      return P;
    });
    layout();
  }
  /** drop the next `n` hidden blocks, bottom rows first (each a little higher, so they rain in one after another) */
  function dropSome(n) {
    const list = blocks.filter((b) => !b.placed).sort((a, b) => b.r - a.r || a.c - b.c).slice(0, n);
    list.forEach((b, k) => { b.placed = true; b.y = -H * (0.42 + Math.random() * 0.12) - k * H * 0.004; b.vy = 0; b.popped = 0; });
    if (list.length) TC.sfx("whoosh");
    return list.length;
  }
  async function landed(ms = 1800) { const end = performance.now() + ms; while (blocks.some((b) => b.y < 0 || b.vy) && performance.now() < end) await TC.sleep(80); }
  /** 👆 the child taps the build area: each tap drops a chunk; after BUILD_TAPS taps, `ms` or teacher Enter the wait ends */
  function waitBuild(ms) {
    TC.hideTalk(); TC.caption("");
    const chunk = Math.ceil(blocks.length / (BUILD_TAPS + 1));
    return new Promise((res) => {
      // the wait owns its timer, and only clears tapCb / TC.pending / building while they are still its own
      let timer = 0, fin = false;
      const B = { taps: 0, need: BUILD_TAPS };
      const done = () => { if (fin) return; fin = true; clearTimeout(timer); if (tapCb === tap) tapCb = null; if (TC.pending === done) TC.pending = null; if (building === B) building = null; res(); };
      const tap = () => { if (fin) return; B.taps++; dropSome(chunk); if (B.taps >= BUILD_TAPS) done(); };
      building = B; tapCb = tap; TC.pending = done; timer = setTimeout(done, ms);
    });
  }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }

  TC.games.craft = {
    mount(api) { cv = TC.h("canvas", { class: "game" }); api.stage.append(cv); ctx = cv.getContext("2d");
      cv.addEventListener("pointerdown", (e) => {
        const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * (W / r.width), y = (e.clientY - r.top) * (H / r.height);
        if (tapCb) { TC.sfx("pop"); burst(x, y, "#ffc83d", true); tapCb(); return; } // building: any tap drops more blocks
        if (!toyMode) return; // toy: tap a block to make it hop
        for (const P of pieces) {
          const c = Math.floor((x - P.ox) / P.s), rr = Math.floor((y - P.oy) / P.s);
          const b = P.blocks.find((q) => q.placed && q.c === c && q.r === rr && q.y === 0);
          if (b) { b.vy = -H * 0.03; b.y = -1; TC.sfx("pop"); burst(x, y, b.hex, true); return; }
        }
      }); t0 = performance.now(); resize(); addEventListener("resize", resize); raf = requestAnimationFrame(draw); this.idle(api); },
    idle() { setPieces(NAMES, "photo"); blocks.forEach((b) => { b.placed = true; }); },
    preview(i) { setPieces([NAMES[i % NAMES.length]], "one"); blocks.forEach((b) => { b.placed = true; }); },
    async play(api) {
      const G = api.G, F = G.finale;
      const fam = shuffle(G.family.filter((f) => FACES[f.w])).slice(0, TC.rounds(4)), N = fam.length + 1;
      api.progress(0, N);
      setPieces([fam[0].w], "one");
      TC.floatText("Let's build!", 56, 54, "#0a1633");
      await TC.speak("OK! Go!");
      if (api.aborted) return null;
      for (let i = 0; i < fam.length; i++) {
        const f = fam[i];
        api.progress(i, N);
        if (i) setPieces([f.w], "one");
        // 👆 tap, tap, tap: the portrait builds up from the bottom; the rest drops in by itself
        await waitBuild(6000);
        if (api.aborted) return null;
        dropSome(blocks.length);
        await landed();
        if (api.aborted) return null;
        // ✨ finished: a spin, confetti, "Wow!"
        TC.sfx("fanfare"); TC.confetti(70); spinStart = performance.now();
        await Promise.all([TC.speak("Wow!"), TC.sleep(1500)]);
        if (api.aborted) return null;
        // the finished portrait stays big → "Who is he / she?" → "He's my grandpa."
        TC.caption("");
        const r = await api.ask({ teacher: f.he ? "Who is he?" : "Who is she?", tzh: f.he ? "他是誰？" : "她是誰？", say: f.say, zh: f.zh, keys: f.keys, word: f.w, hideKey: true });
        if (api.aborted) return null;
        word = f.w[0].toUpperCase() + f.w.slice(1) + "!"; wordT = performance.now();
        const P = pieces[0]; burst(P.ox, P.oy + P.s * 3, "#ffc83d"); burst(P.ox + N16 * P.s, P.oy + P.s * 3, "#ff5fa2");
        await Promise.all([TC.speak(r.ok ? "Yes! " + f.say : f.say), TC.sleep(1400)]);
        if (api.aborted) return null;
      }
      // 📷 the family photo: everybody built today drops in side by side → "Is this your family?" → "Yes!"
      api.progress(fam.length, N); TC.hideTalk(); TC.caption("");
      setPieces(fam.map((f) => f.w), "photo");
      dropSome(blocks.length);
      await landed(2200);
      if (api.aborted) return null;
      TC.sfx("fanfare"); TC.confetti(90);
      await TC.sleep(700);
      if (api.aborted) return null;
      const r = await api.ask({ teacher: F.teacher, tzh: F.zh, say: F.say, keys: F.keys, word: F.word });
      if (api.aborted) return null;
      // 🎉 celebration: fireworks, the whole family wobbles, tap the blocks to make them hop
      glow = "#ffc83d"; TC.sfx("levelup"); TC.confetti(160);
      TC.floatText("❤ Family! ❤", 50, 30, "#ff5fa2");
      await TC.speak(r.ok ? "Yes! Great!" : "Great!");
      if (api.aborted) return null;
      toyMode = true; TC.hideTalk();
      TC.floatText("👆 Tap the blocks!", 55, 52, "#0a1633");
      await TC.sleep(3500); toyMode = false;
      api.progress(N, N);
      return { ok: true };
    }
  };
})();
