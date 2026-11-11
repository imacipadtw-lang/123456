/* Gate 3 · Animal Catch — a mystery shadow hides in the grass; name it, then throw the Word Orb to catch it
   (passport L1 animals + L9/L10 adjectives) */
(function () {
  "use strict";
  TC.games = TC.games || {};
  const css = `
  .g3{position:absolute;inset:0;overflow:hidden;background:linear-gradient(#8fdcff,#d9f6ff 55%,#9be27a 55%,#5fbf4f)}
  .g3 .hill{position:absolute;border-radius:50%;background:#78cf5e}
  .g3 .grass{position:absolute;left:0;right:0;bottom:0;height:34%;display:flex;align-items:flex-end;justify-content:space-around;pointer-events:none;z-index:3}
  .g3 .blade{width:2.2%;background:linear-gradient(#58c94a,#2f8f2f);border-radius:50% 50% 0 0;transform-origin:50% 100%;animation:sway 2.4s ease-in-out infinite}
  .g3 .rustle .blade{animation:rustle .25s ease-in-out infinite}
  @keyframes sway{50%{transform:rotate(6deg)}}
  @keyframes rustle{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(12deg)}}
  .g3 .mon{position:absolute;left:50%;bottom:30%;width:32vh;height:32vh;transform:translate(-50%,40%);transition:transform .7s cubic-bezier(.2,1.5,.4,1),filter .6s;z-index:2}
  .g3 .mon.up{transform:translate(-50%,0)}
  .g3 .mon img{width:100%;height:100%;filter:brightness(0) drop-shadow(0 0 2vh rgba(255,255,255,.8));transition:filter .6s}
  .g3 .mon.show img{filter:none drop-shadow(0 1vh 1vh rgba(0,0,0,.3))}
  .g3 .mon.wrong{animation:shake .5s}
  .g3 .label{position:absolute;left:50%;bottom:66%;transform:translateX(-50%);font-size:5rem;font-weight:700;color:#fff;text-shadow:0 .3rem 0 #0a1633,0 0 1rem #0a1633;z-index:4;opacity:0;transition:opacity .3s}
  .g3 .label.on{opacity:1}
  .g3 .orb{position:absolute;left:50%;bottom:4%;width:13vh;height:13vh;margin-left:-6.5vh;border-radius:50%;z-index:6;touch-action:none;
     background:radial-gradient(circle at 35% 30%,#fff,#ffe58a 25%,#ffc83d 50%,#ff9a2e 80%);box-shadow:0 0 3vh #ffc83d,inset 0 -1vh 2vh rgba(0,0,0,.2);display:grid;place-items:center;font-weight:700;color:#0a1633;font-size:2.2vh}
  .g3 .orb.ready{animation:float 1s ease-in-out infinite;cursor:grab}
  .g3 .orb.wig{animation:wig .35s ease-in-out 3}
  @keyframes wig{25%{transform:rotate(-25deg)}75%{transform:rotate(25deg)}}
  .g3 .dex{position:absolute;right:1.5rem;top:8.5rem;display:flex;flex-direction:column;gap:.7rem;z-index:7}
  .g3 .card{width:11rem;background:#fff;color:#0a1633;border-radius:1rem;padding:.5rem;text-align:center;box-shadow:0 .4rem 0 rgba(0,0,0,.25);animation:pop .5s;border:.35rem solid var(--gate)}
  .g3 .card img{width:6rem;height:6rem}
  .g3 .card b{display:block;font-size:1.5rem}
  .g3 .card small{font-size:1.05rem;color:#555}
  .g3 .card.big{position:absolute;right:auto;left:50%;top:22%;transform:translateX(-50%) scale(2.2);z-index:9}
  .g3 .throw-hint{position:absolute;left:50%;bottom:19%;transform:translateX(-50%);font-size:2.4rem;font-weight:700;color:#fff;text-shadow:0 .2rem 0 #0a1633;z-index:6}
  .g3 .flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:8}
  `;
  let root, mon, monImg, label, orb, dex, hint, flash, grass;
  function build(api) {
    api.stage.append(TC.h("style", {}, css));
    root = TC.h("div", { class: "g3" });
    root.append(TC.h("div", { class: "hill", style: "left:-10%;top:42%;width:60%;height:40%" }), TC.h("div", { class: "hill", style: "right:-15%;top:46%;width:70%;height:40%;background:#6cc456" }));
    for (let i = 0; i < 5; i++) { const t = TC.h("img", { src: "assets/emoji/tree.svg", style: `position:absolute;width:12vh;left:${8 + i * 21}%;top:${36 + (i % 2) * 4}%` }); root.append(t); }
    mon = TC.h("div", { class: "mon" }); monImg = TC.h("img", { alt: "" }); mon.append(monImg);
    grass = TC.h("div", { class: "grass" });
    for (let i = 0; i < 34; i++) grass.append(TC.h("div", { class: "blade", style: `height:${55 + Math.random() * 45}%;animation-delay:${-Math.random() * 2}s` }));
    label = TC.h("div", { class: "label" });
    orb = TC.h("div", { class: "orb" }, "ABC");
    hint = TC.h("div", { class: "throw-hint hidden zh" }, "👆 往上滑丟出！ Swipe up to throw!");
    dex = TC.h("div", { class: "dex" });
    flash = TC.h("div", { class: "flash" });
    root.append(mon, grass, label, orb, hint, dex, flash);
    api.stage.append(root);
    let sy = null;
    orb.addEventListener("pointerdown", (e) => { sy = e.clientY; });
    orb.addEventListener("pointerup", (e) => { if (sy != null && (sy - e.clientY > 20 || Math.abs(sy - e.clientY) < 10)) TC.teacherOK(); sy = null; });
  }
  async function throwOrb() {
    orb.classList.remove("ready"); hint.classList.add("hidden");
    TC.sfx("whoosh");
    const r = mon.getBoundingClientRect(), o = orb.getBoundingClientRect();
    const dx = r.left + r.width / 2 - (o.left + o.width / 2), dy = r.top + r.height * 0.45 - (o.top + o.height / 2);
    await orb.animate([{ transform: "translate(0,0) rotate(0)" }, { transform: `translate(${dx * 0.5}px,${dy * 1.25}px) rotate(360deg)` }, { transform: `translate(${dx}px,${dy}px) rotate(720deg) scale(.8)` }], { duration: 700, easing: "ease-out", fill: "forwards" }).finished;
    flash.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 400 });
    TC.sfx("catch");
    await mon.animate([{ transform: "translate(-50%,0) scale(1)" }, { transform: "translate(-50%,10%) scale(0)", opacity: 0 }], { duration: 350, fill: "forwards" }).finished;
    await orb.animate([{ transform: `translate(${dx}px,${dy}px) scale(.8)` }, { transform: `translate(${dx}px,${dy + r.height * 0.4}px) scale(.8)` }], { duration: 300, fill: "forwards", easing: "cubic-bezier(.5,0,1,.5)" }).finished;
    for (let i = 0; i < 3; i++) { TC.sfx("tick"); await orb.animate([{ transform: `translate(${dx}px,${dy + r.height * 0.4}px) scale(.8) rotate(0)` }, { transform: `translate(${dx}px,${dy + r.height * 0.4}px) scale(.8) rotate(-25deg)` }, { transform: `translate(${dx}px,${dy + r.height * 0.4}px) scale(.8) rotate(25deg)` }, { transform: `translate(${dx}px,${dy + r.height * 0.4}px) scale(.8) rotate(0)` }], { duration: 420 }).finished; await TC.sleep(250); }
    TC.sfx("levelup"); TC.confetti(90);
    TC.floatText("Gotcha! 抓到了！", 50, 35, "#ffc83d");
    await TC.sleep(700);
    orb.getAnimations().forEach((a) => a.cancel());
    mon.getAnimations().forEach((a) => a.cancel());
  }
  function addCard(it) {
    const c = TC.h("div", { class: "card" }, TC.h("img", { src: `assets/emoji/${it.img}.svg`, alt: it.w }), TC.h("b", {}, cap(it.w)), TC.h("small", {}, it.zh));
    dex.append(c); return c;
  }
  async function appear(it) {
    mon.className = "mon"; label.classList.remove("on");
    monImg.src = `assets/emoji/${it.img}.svg`;
    grass.classList.add("rustle"); TC.sfx("drum");
    await TC.sleep(1100); grass.classList.remove("rustle");
    mon.classList.add("up"); TC.sfx("pop");
    await TC.sleep(600);
  }

  TC.games.catch = {
    mount(api) { build(api); },
    idle() { dex.innerHTML = ""; mon.className = "mon up show"; monImg.src = "assets/emoji/owl.svg"; label.classList.remove("on"); orb.classList.remove("ready"); },
    async play(api) {
      const G = api.G; dex.innerHTML = "";
      const pool = G.items.slice().sort(() => Math.random() - 0.5);
      const items = pool.slice(0, TC.rounds(4)), caught = [];
      const N = items.length + 1;
      await TC.speak("Something is in the grass! What is it?");
      for (let i = 0; i < items.length; i++) {
        api.progress(i, N);
        const it = items[i], L = api.level;
        await appear(it);
        const say = L === 1 ? cap(it.w) + "!" : L === 2 ? `It's ${it.art || "a"} ${it.w}.` : it.s3;
        const keys = L === 3 ? [[it.w], it.k3] : [[it.w]];
        const distractors = G.items.filter((x) => x.w !== it.w).map((x) => ({ w: x.w }));
        const r = await api.ask({ teacher: G.teacher, tzh: "牠是什麼動物？", say, zh: "", keys, word: it.w, distractors, hideKey: true,
          onWrong: (w) => { mon.classList.remove("wrong"); void mon.offsetWidth; mon.classList.add("wrong"); TC.sfx("wrong"); TC.toast(`Not a ${w}! Look again! 再看看！`, 1800); } });
        if (api.aborted) return null;
        mon.classList.add("show"); label.textContent = cap(it.w) + "!"; label.classList.add("on"); TC.sfx("ding");
        TC.hideTalk();
        orb.classList.add("ready"); hint.classList.remove("hidden");
        await TC.waitAction(6000);
        if (api.aborted) return null;
        label.classList.remove("on");
        await throwOrb();
        mon.className = "mon";
        caught.push(it); addCard(it);
      }
      api.progress(items.length, N);
      const F = G.finale, L = api.level, fav = caught[0];
      const fill = (s, it) => s.replace("[Animal]", cap(it.w)).replace("[animal]", it.w).replace("[fin3]", it.fin3);
      const r = await api.ask({ teacher: F.teacher, tzh: F.zh, say: fill(F.say[L], fav), zh: "選一隻你抓到的動物", keys: [caught.map((c) => c.w)], word: fav.w });
      if (api.aborted) return null;
      const pw = TC.pickHeard(r.heard, caught.map((c) => c.w));
      const pick = caught.find((c) => c.w === pw) || fav;
      const card = [...dex.children][caught.indexOf(pick)];
      card.classList.add("big"); TC.sfx("fanfare"); TC.confetti(160);
      await TC.speak(`The ${pick.w}! ${pick.fin3}`);
      await TC.sleep(1500); card.classList.remove("big");
      api.progress(N, N);
      return { ok: true };
    }
  };
  function cap(w) { return w[0].toUpperCase() + w.slice(1); }
})();
