/* =====================================================================
   Scratch card (刮刮卡): after each gate the child scratches a silver panel
   on the big screen with a finger and finds points to trade for prizes.

   Points are worked out from the child's number and the gate, so every TV
   (and the Final Gate) agrees without any network:
   · fair mode (default): every child's six cards are 10, 10, 15, 15, 20, 30
     in a different order → everybody who finishes all six gates has 100.
   · surprise mode: each card is 10 / 20 / 30 / 50 (50 is rare).
   ===================================================================== */
(function () {
  "use strict";
  const { h, sleep } = TC;
  const FAIR = [10, 10, 15, 15, 20, 30];
  function rng(seed) { let a = (seed >>> 0) || 1; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function seedOf(id) { let s = 2166136261; for (const ch of "tces-" + id) { s ^= ch.charCodeAt(0); s = Math.imul(s, 16777619); } return s >>> 0; }
  /** points on the scratch card of child `id` at gate 1–6 */
  TC.pointsFor = function (id, gate) {
    const r = rng(seedOf(id));
    if (TC.cfg.fairPoints !== false) {
      const a = FAIR.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; }
      return a[(gate - 1) % 6];
    }
    let v = 10; for (let g = 1; g <= gate; g++) { const x = r(); v = x < 0.4 ? 10 : x < 0.75 ? 20 : x < 0.95 ? 30 : 50; }
    return v;
  };
  /** total for a list of gates (default: all six) */
  TC.pointsTotal = (id, gates = [1, 2, 3, 4, 5, 6]) => gates.reduce((s, g) => s + TC.pointsFor(id, g), 0);

  const css = `
  .sc-ov{position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:radial-gradient(90% 80% at 50% 40%,rgba(20,34,90,.86),rgba(4,8,24,.96));animation:scIn .35s}
  @keyframes scIn{from{opacity:0}}
  .sc-rays{position:absolute;inset:-40%;background:repeating-conic-gradient(from 0deg,rgba(255,229,138,.10) 0 9deg,transparent 9deg 18deg);animation:scSpin 40s linear infinite;pointer-events:none}
  @keyframes scSpin{to{transform:rotate(360deg)}}
  .sc-card{position:relative;width:min(74rem,92vw);border-radius:3rem;padding:2rem 2.6rem 2.2rem;color:#14213d;text-align:center;
    background:linear-gradient(160deg,#fffdf2 0%,#fff3c4 55%,#ffd96b 100%);
    box-shadow:0 0 0 .5rem #fff,0 0 0 1rem #f0bd3a,0 2.6rem 6rem rgba(0,0,0,.55),inset 0 -1.2rem 2.4rem rgba(200,144,26,.25);
    transform:perspective(120rem) rotateX(8deg);animation:scDrop .7s cubic-bezier(.2,1.5,.4,1)}
  @keyframes scDrop{from{transform:perspective(120rem) rotateX(50deg) translateY(-60vh) scale(.6)}}
  .sc-card::before,.sc-card::after{content:"";position:absolute;top:50%;width:4.4rem;height:4.4rem;border-radius:50%;background:#0b1433;transform:translateY(-50%);box-shadow:inset 0 0 0 .5rem #f0bd3a}
  .sc-card::before{left:-2.7rem}.sc-card::after{right:-2.7rem}
  .sc-head{display:flex;align-items:center;justify-content:center;gap:1.4rem}
  .sc-head img{width:7rem;height:7rem;filter:drop-shadow(0 .3rem .5rem rgba(0,0,0,.35))}
  .sc-head b{display:block;font-size:2.3rem;letter-spacing:.08em}
  .sc-head span{display:block;font-size:1.4rem;font-weight:700;color:#a8650a;letter-spacing:.14em}
  .sc-title{font-size:4.6rem;font-weight:700;line-height:1;margin:1.2rem 0 .4rem;background:linear-gradient(180deg,#ff5fa2,#d6337a);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 .25rem 0 rgba(0,0,0,.12))}
  .sc-sub{font-size:1.8rem;color:#5b4a1a;font-weight:600}
  .sc-win{position:relative;margin:1.4rem auto 1.2rem;width:min(52rem,84%);height:19rem;border-radius:2rem;overflow:hidden;
    background:radial-gradient(120% 100% at 50% 0%,#2a3f9e,#101a4a);box-shadow:inset 0 .6rem 1.6rem rgba(0,0,0,.6),0 0 0 .4rem #c8901a}
  .sc-prize{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:1.6rem;color:#fff}
  .sc-prize .n{font-size:13rem;font-weight:700;line-height:1;background:linear-gradient(180deg,#fff8c9 20%,#ffd23d 60%,#ff9a2e);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 .5rem 0 rgba(0,0,0,.35))}
  .sc-prize .u{font-size:3rem;font-weight:700;text-align:left;line-height:1.15}
  .sc-prize .u i{display:block;font-style:normal;font-size:2rem;color:#ffe58a}
  .sc-prize img{width:8rem;height:8rem}
  .sc-win canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:pointer;transition:opacity .6s}
  .sc-win.done canvas{opacity:0;pointer-events:none}
  .sc-win.done .sc-prize{animation:scPop .6s cubic-bezier(.2,1.6,.4,1)}
  @keyframes scPop{from{transform:scale(.6)}}
  .sc-foot{display:flex;align-items:center;justify-content:space-between;font-size:1.7rem;font-weight:700;color:#5b4a1a}
  .sc-foot .tot{background:#14213d;color:#ffe58a;border-radius:2rem;padding:.5rem 1.6rem}
  .sc-next{display:block;margin:1.4rem auto 0}
  .sc-finger{position:absolute;left:50%;top:50%;font-size:6rem;pointer-events:none;animation:scFinger 1.6s ease-in-out infinite}
  @keyframes scFinger{0%{transform:translate(-9rem,-1rem) rotate(-10deg)}50%{transform:translate(5rem,1rem) rotate(8deg)}100%{transform:translate(-9rem,-1rem) rotate(-10deg)}}
  `;
  document.head.append(h("style", {}, css));

  /**
   * Shows the scratch card and resolves with the points once the child has scratched it.
   * opt: { id, name, gate, city, points, total (points so far incl. this card, optional), auto (ms before it scratches itself) }
   */
  TC.scratchCard = function (opt) {
    return new Promise((resolve) => {
      const S = window.TC_SCHOOL || { zh: "", emblem: "" };
      const pts = opt.points != null ? opt.points : TC.pointsFor(opt.id, opt.gate);
      const cv = h("canvas", { width: 1040, height: 380 });
      const finger = h("div", { class: "sc-finger" }, "👆");
      const win = h("div", { class: "sc-win" },
        h("div", { class: "sc-prize" }, TC.artImg ? TC.artImg("star") : "", h("div", { class: "n" }, String(pts)), h("div", { class: "u" }, "points", h("i", { class: "zh" }, "點"))),
        cv, finger);
      const next = h("button", { class: "big-btn go sc-next", style: "visibility:hidden" }, "OK ▶");
      const card = h("div", { class: "sc-card" },
        h("div", { class: "sc-head" }, h("img", { src: S.emblem, alt: "" }), h("div", {}, h("b", { class: "zh" }, S.zh), h("span", {}, "ENGLISH DAY · SCRATCH CARD"))),
        h("div", { class: "sc-title" }, "Scratch & Win!"),
        h("div", { class: "sc-sub zh" }, `${opt.name || ""}，用手指把銀色的地方刮開！ Scratch it!`),
        win,
        h("div", { class: "sc-foot" }, h("span", {}, `GATE ${opt.gate}${opt.city ? " · " + opt.city.toUpperCase() : ""}`), h("span", { class: "tot zh", style: "visibility:hidden" }, "")),
        next);
      const ov = h("div", { class: "sc-ov overlay-like" }, h("div", { class: "sc-rays" }), card);
      document.body.append(ov);
      TC.sfx && TC.sfx("whoosh");

      /* silver foil */
      const g = cv.getContext("2d"), W = cv.width, H = cv.height;
      const lg = g.createLinearGradient(0, 0, W, H);
      [[0, "#f4f6fb"], [0.25, "#aeb6c8"], [0.5, "#eef1f8"], [0.75, "#8f98ad"], [1, "#dfe4ee"]].forEach(([o, c]) => lg.addColorStop(o, c));
      g.fillStyle = lg; g.fillRect(0, 0, W, H);
      g.globalAlpha = 0.12; g.fillStyle = "#14213d";
      for (let i = 0; i < 260; i++) { g.beginPath(); g.arc(Math.random() * W, Math.random() * H, 1 + Math.random() * 2.5, 0, 7); g.fill(); }
      g.globalAlpha = 0.5; g.font = "700 30px Fredoka, sans-serif"; g.textAlign = "center";
      for (let y = 46; y < H; y += 74) for (let x = (y / 74) % 2 ? 110 : 20; x < W + 100; x += 190) g.fillText("★ 土城 ★", x, y);
      g.globalAlpha = 1; g.fillStyle = "#14213d"; g.font = "700 64px Fredoka, 'Microsoft JhengHei', sans-serif";
      g.fillText("SCRATCH HERE  刮這裡", W / 2, H / 2 + 22);
      g.globalCompositeOperation = "destination-out";

      let done = false, last = null, lastSfx = 0;
      const pos = (e) => { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H]; };
      function rub(x, y) {
        g.lineWidth = 120; g.lineCap = "round"; g.lineJoin = "round";
        g.beginPath(); if (last) { g.moveTo(last[0], last[1]); g.lineTo(x, y); g.stroke(); } else { g.arc(x, y, 60, 0, 7); g.fill(); }
        last = [x, y];
        const now = Date.now(); if (now - lastSfx > 90) { lastSfx = now; TC.sfx && TC.sfx("hat"); }
      }
      function cleared() { const d = g.getImageData(0, 0, W, H).data; let c = 0, n = 0; for (let i = 3; i < d.length; i += 4 * 97) { n++; if (d[i] < 40) c++; } return c / n; }
      cv.addEventListener("pointerdown", (e) => { if (done) return; finger.remove(); try { cv.setPointerCapture(e.pointerId); } catch (err) {} last = null; rub(...pos(e)); e.preventDefault(); });
      cv.addEventListener("pointermove", (e) => { if (done || (e.buttons === 0 && e.pointerType === "mouse")) return; if (!last) return; rub(...pos(e)); if (cleared() > 0.42) finish(); });
      cv.addEventListener("pointerup", () => { last = null; if (!done && cleared() > 0.42) finish(); });

      async function autoScratch() { // the card scratches itself (teacher pressed Enter, or nobody touched it)
        if (done) return; finger.remove();
        for (let i = 0; i <= 26 && !done; i++) { const t = i / 26; last = i ? last : null; rub(60 + t * (W - 120), H / 2 + Math.sin(t * 16) * (H * 0.36)); await sleep(22); }
        finish();
      }
      const autoT = setTimeout(autoScratch, opt.auto || 14000);
      function key(e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); done ? close() : autoScratch(); } else if (e.key === "Escape") close(); }
      document.addEventListener("keydown", key, true);

      async function finish() {
        if (done) return; done = true; clearTimeout(autoT);
        win.classList.add("done");
        TC.sfx && TC.sfx("fanfare"); TC.confetti && TC.confetti(220);
        const tot = card.querySelector(".tot");
        if (opt.total != null) { tot.textContent = `累計 Total：${opt.total} 點`; tot.style.visibility = "visible"; }
        TC.sayPoints && TC.sayPoints(pts);
        next.style.visibility = "visible"; next.onclick = close;
        setTimeout(close, opt.stay || 9000);
      }
      let closed = false;
      function close() { if (closed) return; closed = true; clearTimeout(autoT); document.removeEventListener("keydown", key, true); ov.remove(); resolve(pts); }
      TC._scratchClose = close;
    });
  };
})();
