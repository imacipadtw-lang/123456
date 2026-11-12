/* Gate 5 · Mystery Box — tap the box, count the animals that pop out, say the number (passport L7 numbers 1–10, L1 animals) */
(function () {
  "use strict";
  TC.games = TC.games || {};
  const css = `
  .g5{position:absolute;inset:0;overflow:hidden;background:radial-gradient(80% 70% at 50% 45%,#3a2a7a,#0d0a26)}
  .g5 .shelf{position:absolute;left:0;right:0;top:66%;height:4%;background:linear-gradient(#b07a4a,#6d4527);box-shadow:0 1vh 2vh rgba(0,0,0,.5)}
  .g5 .boxpos{position:absolute;left:50%;top:26%;width:30vh;height:30vh;margin-left:-15vh;transform-origin:50% 100%;transition:transform .6s cubic-bezier(.4,1.2,.5,1),opacity .3s}
  .g5 .side .boxpos{transform:translate(-39vw,9vh) scale(.62)}
  .g5 .bye .boxpos{opacity:0}
  .g5 .boxw{position:absolute;inset:0;transform-origin:50% 100%;perspective:120vh;cursor:pointer;touch-action:manipulation}
  .g5 .boxw.drop{animation:dropIn .8s cubic-bezier(.3,1.4,.5,1)}
  .g5 .boxw.shake{animation:shake .45s infinite}
  @keyframes dropIn{from{transform:translateY(-80vh)}}
  .g5 .cube{position:absolute;left:calc(50% - 11vh);width:22vh;bottom:4%;height:22vh;transform-style:preserve-3d;animation:cubeTurn 6s ease-in-out infinite}
  @keyframes cubeTurn{0%,100%{transform:rotateX(-14deg) rotateY(-28deg)}50%{transform:rotateX(-14deg) rotateY(28deg)}}
  .g5 .face{position:absolute;inset:0;border-radius:1vh;display:grid;place-items:center;backface-visibility:hidden;
     background:linear-gradient(90deg,transparent 42%,#ffe58a 42%,#ffd21f 58%,transparent 58%),linear-gradient(135deg,color-mix(in srgb,var(--c1) 70%,#fff),var(--c1) 45%,var(--c2));
     box-shadow:inset 0 0 0 .5vh rgba(255,255,255,.25),inset 0 -2vh 3vh rgba(0,0,0,.2)}
  .g5 .face b{font-size:12vh;color:#fff;text-shadow:0 .6vh 0 rgba(0,0,0,.25),0 0 2vh rgba(255,255,255,.6)}
  .g5 .f-front{transform:translateZ(11vh)}.g5 .f-back{transform:rotateY(180deg) translateZ(11vh)}
  .g5 .f-right{transform:rotateY(90deg) translateZ(11vh)}.g5 .f-left{transform:rotateY(-90deg) translateZ(11vh)}
  .g5 .f-bottom{transform:rotateX(-90deg) translateZ(11vh);filter:brightness(.6)}
  .g5 .lid3{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .8s cubic-bezier(.3,1.4,.5,1),opacity .8s}
  .g5 .f-top{transform:rotateX(90deg) translateZ(11vh);background:linear-gradient(90deg,transparent 42%,#ffe58a 42%,#ffd21f 58%,transparent 58%),linear-gradient(0deg,transparent 42%,#ffe58a 42%,#ffd21f 58%,transparent 58%),linear-gradient(135deg,color-mix(in srgb,var(--c2) 60%,#fff),var(--c2))}
  .g5 .bow{position:absolute;left:50%;top:6.5vh;z-index:2;width:16vh;height:10vh;margin-left:-8vh;transform:translateZ(0) translateY(-50%);pointer-events:none;
     background:radial-gradient(circle at 50% 60%,#ffe58a 0 18%,transparent 19%),radial-gradient(ellipse 34% 48% at 26% 50%,#ffd21f 60%,transparent 62%),radial-gradient(ellipse 34% 48% at 74% 50%,#ffd21f 60%,transparent 62%);filter:drop-shadow(0 .5vh .5vh rgba(0,0,0,.3))}
  .g5 .open .lid3{transform:translateY(-55vh) rotateX(70deg) rotateZ(30deg);opacity:0}
  .g5 .open .cube{animation-play-state:paused}
  .g5 .open .f-front b{opacity:0}
  .g5 .beams{position:absolute;left:50%;top:50%;width:120vh;height:120vh;margin:-60vh 0 0 -60vh;border-radius:50%;opacity:0;pointer-events:none;background:repeating-conic-gradient(var(--beam) 0 8deg,transparent 8deg 22deg);transition:opacity .4s;animation:spin 6s linear infinite;mask:radial-gradient(circle,#000 10%,transparent 60%);-webkit-mask:radial-gradient(circle,#000 10%,transparent 60%)}
  .g5 .open .beams{opacity:.9}
  .g5 .open .bow{opacity:0;transition:opacity .3s}
  .g5 .rar{position:absolute;left:50%;top:-2.5vh;transform:translateX(-50%);font-size:3.2rem;font-weight:700;letter-spacing:.2em;white-space:nowrap;opacity:0;pointer-events:none;text-shadow:0 0 2rem currentColor}
  .g5 .open .rar{opacity:1;transition:opacity .4s .3s}
  .g5 .snap,.g5 .snap *{transition:none!important}
  /* the counting mat: animals land here in rows of five (a ten-frame); it starts below Ollie's subtitle bubble */
  .g5 .mat{position:absolute;left:22%;right:12%;top:14.8rem;bottom:29.5%;border-radius:3vh;background:rgba(13,10,38,.8);box-shadow:inset 0 0 0 .4vh rgba(255,255,255,.14);opacity:0;transition:opacity .4s;pointer-events:none;
     display:grid;grid-template-columns:repeat(var(--cols,5),var(--s,10vh));gap:var(--gy,.6vh) var(--gx,1.2vh);justify-content:center;align-content:center}
  .g5 .side .mat{opacity:1}
  .g5 .bye .mat{opacity:0}
  .g5 .ani{position:relative;width:var(--s);visibility:hidden;transform-origin:50% 80%}
  .g5 .ani>img:first-child{display:block;width:var(--s);height:var(--s);filter:drop-shadow(0 .8vh .8vh rgba(0,0,0,.45))}
  .g5 .ani>i{position:relative;display:block;width:max-content;min-width:calc(var(--d)*1.3);height:var(--d);margin:var(--l) auto 0;padding:0 .6vh;box-sizing:border-box;border-radius:var(--d);background:#0a1633;box-shadow:0 0 0 .35vh #ffc83d;
     line-height:var(--d);font-size:calc(var(--d)*.82);font-style:normal;font-weight:700;text-align:center;color:#ffc83d;opacity:0}
  .g5 .ani>i.on{opacity:1;animation:pop .3s}
  .g5 .ani.hop{animation:g5hop .36s ease-out}
  .g5 .ani.cheer{animation:g5cheer .5s ease-in-out infinite}
  @keyframes g5hop{40%{transform:translateY(-16%) scale(1.18)}}
  @keyframes g5cheer{50%{transform:translateY(-9%) scale(1.05)}}
  .g5 .think{position:absolute;right:-4%;top:-6%;width:44%;height:44%;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 .5vh 1vh rgba(0,0,0,.35);transition:opacity .3s,transform .3s;animation:float 1.6s ease-in-out infinite}
  .g5 .think::after{content:"";position:absolute;left:8%;bottom:-8%;width:22%;height:22%;border-radius:50%;background:#fff}
  .g5 .think img{width:74%;height:74%}
  .g5 .think.off{opacity:0;transform:scale(.3)}
  .g5 .ani>.food{position:absolute;right:-6%;bottom:-5%;width:52%;height:52%;visibility:hidden;filter:drop-shadow(0 .5vh .5vh rgba(0,0,0,.45))}
  .g5 .bignum{position:absolute;left:11%;top:13%;transform:translateX(-50%);font-size:24vh;line-height:1;font-weight:700;color:#ffc83d;text-shadow:0 .8vh 0 #7a3d00,0 0 4vh rgba(255,200,61,.7);opacity:0;pointer-events:none}
  .g5 .bignum.on{opacity:1}
  .g5 .bignum.tick{animation:pop .28s cubic-bezier(.2,1.6,.4,1)}
  .g5 .shelfItems{position:absolute;right:3%;top:16%;display:flex;flex-direction:column;gap:1.5vh;padding:1.5vh;border-radius:2vh;background:rgba(255,255,255,.08);min-height:12vh;min-width:10vh}
  .g5 .got{position:relative;width:10vh;height:10vh;animation:pop .5s}
  .g5 .got img{width:100%;height:100%;display:block}
  .g5 .got b{position:absolute;right:-1vh;bottom:-.6vh;min-width:4.6vh;height:4.6vh;padding:0 .6vh;box-sizing:border-box;border-radius:2.3vh;background:#ffc83d;color:#0a1633;font-size:3.2vh;line-height:4.6vh;text-align:center;box-shadow:0 .3vh 0 rgba(0,0,0,.4)}
  .g5 .tapopen{position:absolute;left:0;right:0;top:76%;text-align:center;font-size:3.2rem;font-weight:700;color:#ffc83d;text-shadow:0 .3rem 0 #000;animation:float 1s ease-in-out infinite;white-space:nowrap;pointer-events:none}
  .g5 .label{position:absolute;left:55%;top:73%;transform:translateX(-50%);font-size:6.4rem;font-weight:700;white-space:nowrap;opacity:0;transition:opacity .3s;text-shadow:0 .3rem 0 #000;pointer-events:none}
  .g5 .label.on{opacity:1}
  `;
  const RAR = [{ n: "COMMON", c1: "#3d8bff", c2: "#2ee6b6", beam: "rgba(76,201,255,.55)", col: "#4cc9ff" },
               { n: "RARE", c1: "#9b6bff", c2: "#ff5fa2", beam: "rgba(155,107,255,.6)", col: "#c9a8ff" },
               { n: "EPIC", c1: "#ff5fa2", c2: "#ff9a2e", beam: "rgba(255,95,162,.6)", col: "#ff8cc0" },
               { n: "LEGENDARY", c1: "#ffc83d", c2: "#ff9a2e", beam: "rgba(255,210,80,.75)", col: "#ffc83d" }];
  const FOOD = ["cake", "pizza", "apple", "ice-cream", "banana", "cookie", "strawberry", "watermelon"];
  let root, scene, boxpos, boxw, mat, rarEl, bigNum, labelEl, shelf, tapOpen, openReady = false;
  function build(api) {
    api.stage.append(TC.h("style", {}, css));
    root = TC.h("div", { class: "g5" });
    scene = TC.h("div", { class: "scene", style: "position:absolute;inset:0" });
    const F = (cls, txt) => TC.h("div", { class: "face " + cls }, txt ? TC.h("b", {}, txt) : null);
    boxw = TC.h("div", { class: "boxw" }, TC.h("div", { class: "cube" }, F("f-back"), F("f-left"), F("f-right"), F("f-bottom"), F("f-front", "?"),
      TC.h("div", { class: "lid3" }, F("f-top"))), TC.h("div", { class: "bow" }));
    rarEl = TC.h("div", { class: "rar" });
    boxpos = TC.h("div", { class: "boxpos" }, TC.h("div", { class: "beams" }), boxw, rarEl);
    mat = TC.h("div", { class: "mat" });
    bigNum = TC.h("div", { class: "bignum" }); labelEl = TC.h("div", { class: "label zh" });
    scene.append(boxpos, mat, bigNum, labelEl);
    shelf = TC.h("div", { class: "shelfItems" });
    tapOpen = TC.h("div", { class: "tapopen hidden zh" }, "👆 TAP TO OPEN! 點箱子打開！");
    const bg = TC.h("div", { style: "position:absolute;inset:0;pointer-events:none" });
    { const m = TC.artImg("mountains"); m.style.cssText = "position:absolute;left:50%;top:22%;width:120vh;height:46vh;margin-left:-60vh;opacity:.22"; bg.append(m); }
    FOOD.forEach((n, i) => { const im = TC.artImg(n); im.style.cssText = `position:absolute;left:${[34, 62, 44, 72, 30, 58, 78, 40][i]}%;top:${[8, 10, 60, 40, 34, 70, 64, 18][i]}%;width:${8 + (i % 3) * 3}vh;opacity:.18;filter:blur(2px);animation:drift ${7 + i}s ease-in-out ${-i}s infinite alternate`; bg.append(im); });
    root.append(bg, TC.h("div", { class: "shelf" }), shelf, scene, tapOpen);
    api.stage.append(root);
    boxw.addEventListener("pointerdown", () => {
      if (TC.pending && openReady) { TC.pending(); return; }
      boxw.classList.remove("shake"); void boxw.offsetWidth; boxw.classList.add("shake"); TC.sfx("snare"); setTimeout(() => boxw.classList.remove("shake"), 450);
    });
    setRar(RAR[1]);
  }
  function setRar(r) { scene.style.setProperty("--c1", r.c1); scene.style.setProperty("--c2", r.c2); scene.style.setProperty("--beam", r.beam); rarEl.textContent = "★ " + r.n + " ★"; rarEl.style.color = r.col; }
  /** a brand-new closed box in the middle (no transitions from the previous round) */
  function freshBox(rar, drop) {
    scene.classList.add("snap"); scene.classList.remove("open", "side", "bye");
    mat.innerHTML = ""; bigNum.classList.remove("on"); labelEl.classList.remove("on"); tapOpen.classList.add("hidden"); openReady = false;
    setRar(rar); boxw.className = "boxw"; void boxw.offsetWidth; scene.classList.remove("snap");
    if (drop) boxw.classList.add("drop");
  }
  /** put n hidden cells on the mat, sized so that rows of five fill it; returns the cells */
  function fill(names) {
    const n = names.length, cols = Math.min(n, 5), rows = Math.ceil(n / 5), vh = root.clientHeight / 100;
    const W = mat.clientWidth, H = mat.clientHeight, pad = vh, gx = 1.2 * vh, gy = 0.6 * vh;
    const d = (rows > 1 ? 4.4 : 5) * vh, l = (rows > 1 ? -2.8 : 0.4) * vh; // number badge: under the feet (one row) or tucked half behind them (two rows)
    const s = Math.floor(Math.min((W - 2 * pad - (cols - 1) * gx) / cols, (H - 2 * pad - (rows - 1) * gy) / rows - d - l, 30 * vh));
    const P = { cols, s: s + "px", gx: gx + "px", gy: gy + "px", d: d + "px", l: l + "px" };
    for (const k in P) mat.style.setProperty("--" + k, P[k]);
    mat.innerHTML = "";
    return names.map((name, k) => { const c = TC.h("div", { class: "ani" }, TC.artImg(name), TC.h("i", {}, k + 1 + "")); mat.append(c); return c; });
  }
  /** vector from an element's centre to the mouth of the box */
  function toBox(el) {
    const b = boxpos.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: b.left + b.width / 2 - (r.left + r.width / 2), y: b.top + b.height * 0.3 - (r.top + r.height / 2), up: root.clientHeight * 0.16 };
  }
  const FLY = 460;
  function flyOut(el) {
    const v = toBox(el); el.style.visibility = "visible";
    el.animate([{ transform: `translate(${v.x}px,${v.y}px) scale(.12) rotate(-180deg)`, opacity: 0.4 },
      { transform: `translate(${v.x * 0.5}px,${v.y * 0.5 - v.up}px) scale(1.1) rotate(-30deg)`, opacity: 1, offset: 0.55 },
      { transform: "translate(0,3%) scale(1.08,.9)", opacity: 1, offset: 0.88 },
      { transform: "none", opacity: 1 }], { duration: FLY, easing: "ease-out" });
  }
  function flyIn(el, delay) {
    const v = toBox(el);
    el.animate([{ transform: "none", opacity: 1 },
      { transform: `translate(${v.x * 0.5}px,${v.y * 0.5 - v.up}px) scale(.8) rotate(90deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${v.x}px,${v.y}px) scale(.12) rotate(180deg)`, opacity: 0 }], { duration: FLY, delay, easing: "ease-in", fill: "forwards" });
  }
  function reset() { freshBox(RAR[1], false); shelf.innerHTML = ""; }

  TC.games.box = {
    mount(api) { build(api); },
    idle() { reset(); },
    async play(api) {
      const G = api.G, rounds = TC.rounds(4), N = rounds + 1;
      reset();
      const animals = shuffle(G.pool), used = [], got = [];
      for (let i = 0; i < rounds; i++) {
        api.progress(i, N);
        // how many? 1–5 for 初級, 1–10 for 中級; a new number every round
        const all = Array.from({ length: api.level === 1 ? 5 : 10 }, (_, k) => k + 1);
        let opts = all.filter((x) => !used.includes(x));
        if (!opts.length) opts = all.filter((x) => x !== used[used.length - 1]);
        const n = opts[(Math.random() * opts.length) | 0]; used.push(n);
        const word = G.numbers[n].w, name = animals[i % animals.length], last = i === rounds - 1;
        const rar = last ? RAR[3] : RAR[(Math.random() * 3) | 0], colors = [rar.c1, rar.c2, "#fff"];
        // 1 · a fresh box drops in; the child taps it open
        freshBox(rar, true); TC.sfx("whoosh"); await TC.sleep(800);
        if (api.aborted) return null;
        tapOpen.classList.remove("hidden"); openReady = true; TC.sfx("pop");
        await TC.waitAction(8000); openReady = false; tapOpen.classList.add("hidden");
        if (api.aborted) return null;
        boxw.classList.add("shake"); TC.sfx("drum"); await TC.sleep(1000); boxw.classList.remove("shake");
        scene.classList.add("open"); TC.sfx("levelup"); TC.confetti(60, colors);
        const wow = TC.speak("Wow!");
        await TC.sleep(800);
        // 2 · the box hops aside and the animals pop out one at a time onto the counting mat
        const cells = fill(Array(n).fill(name)), digits = api.level === 1, step = n > 5 ? 300 : 400;
        scene.classList.add("side"); await TC.sleep(650);
        for (const c of cells) {
          if (api.aborted) return null;
          flyOut(c); TC.sfx("pop");
          if (digits) setTimeout(() => c.lastChild.classList.add("on"), FLY); // 初級: a running number under each one
          await TC.sleep(step);
        }
        await wow; await TC.sleep(300);
        if (api.aborted) return null;
        // 3 · "How many?" — one word: the number
        const r = await api.ask({ teacher: G.teacher, tzh: G.tzh, say: cap(word) + "!", zh: "數數看有幾個", keys: [[word, String(n)]], word, hideKey: true });
        if (api.aborted) return null;
        TC.hideTalk();
        // 4 · count-up: each animal hops in turn while the big number counts 1…n
        bigNum.textContent = ""; bigNum.classList.add("on");
        for (let k = 0; k < n; k++) {
          const c = cells[k];
          c.classList.remove("hop"); void c.offsetWidth; c.classList.add("hop"); c.lastChild.classList.add("on");
          bigNum.textContent = k + 1; bigNum.classList.remove("tick"); void bigNum.offsetWidth; bigNum.classList.add("tick");
          TC.sfx("coin"); await TC.sleep(n > 5 ? 300 : 380);
          if (api.aborted) return null;
        }
        labelEl.textContent = cap(word) + "!"; labelEl.classList.add("on");
        cells.forEach((c, k) => { c.classList.remove("hop"); c.style.animationDelay = (k % 2) * 0.25 + "s"; c.classList.add("cheer"); });
        TC.sfx(last ? "fanfare" : "levelup"); TC.confetti(last ? 220 : 100, colors);
        await TC.speak(r.ok ? `Yes! ${cap(word)}!` : `${cap(word)}!`);
        await TC.sleep(700);
        if (api.aborted) return null;
        // 5 · back into the box they jump; one goes to the collection shelf with its number
        TC.sfx("whoosh");
        cells.forEach((c, k) => { c.classList.remove("cheer"); flyIn(c, k * 60); });
        await TC.sleep(FLY + n * 60);
        got.push(name); shelf.append(TC.h("div", { class: "got" }, TC.artImg(name), TC.h("b", {}, n + ""))); TC.sfx("pop");
        scene.classList.add("bye"); await TC.sleep(450);
      }
      if (api.aborted) return null;
      // finale · the counted animals are hungry — the golden box serves a feast
      api.progress(rounds, N);
      const F = G.finale, menu = shuffle(FOOD);
      freshBox(RAR[3], true); TC.sfx("whoosh"); await TC.sleep(800);
      const cells = fill(got);
      cells.forEach((c, k) => {
        c.lastChild.remove();
        c.append(TC.h("div", { class: "think" }, TC.artImg(menu[k % menu.length])), TC.artImg(menu[k % menu.length], "food"));
        c.style.visibility = "visible"; c.animate([{ transform: "scale(.3)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 400, delay: k * 120, fill: "backwards", easing: "cubic-bezier(.2,1.6,.4,1)" });
      });
      scene.classList.add("side"); TC.sfx("pop"); await TC.sleep(700);
      if (api.aborted) return null;
      await api.ask({ teacher: F.teacher, tzh: F.zh, say: F.say, keys: F.keys, word: F.word });
      if (api.aborted) return null;
      TC.hideTalk();
      boxw.classList.add("shake"); TC.sfx("drum"); await TC.sleep(900); boxw.classList.remove("shake");
      scene.classList.add("open"); TC.sfx("fanfare"); TC.confetti(200);
      for (const c of cells) {
        c.querySelector(".think").classList.add("off");
        flyOut(c.querySelector(".food")); TC.sfx("pop"); await TC.sleep(300);
      }
      cells.forEach((c, k) => { c.style.animationDelay = (k % 2) * 0.25 + "s"; c.classList.add("cheer"); });
      labelEl.textContent = "Yummy! Let's eat! 開動囉！"; labelEl.classList.add("on");
      await TC.speak("Wow! Great!");
      await TC.sleep(1200);
      api.progress(N, N);
      return { ok: true };
    }
  };
  function cap(w) { return w[0].toUpperCase() + w.slice(1); }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
})();
