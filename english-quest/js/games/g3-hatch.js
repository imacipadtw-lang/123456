/* Gate 3 · Pet Hatch — tap the egg three times, a pet hatches with a rarity glow, then "What is it?" → say the animal
   (egg-hatching / pet-collecting loop, as in today's most-played kids' games; passport 第1關 animals · 第6關 can / fly · 第4關 want) */
(function () {
  "use strict";
  TC.games = TC.games || {};
  const css = `
  .g3{position:absolute;inset:0;overflow:hidden;background:radial-gradient(120% 70% at 50% 0%,#bfeaff,#8fd3ff 40%,#77c96a 62%,#4fae4a)}
  .g3 .hill{position:absolute;border-radius:50%;background:radial-gradient(circle at 40% 30%,#9be27a,#5fbf4f)}
  .g3 .deco{position:absolute;pointer-events:none}
  .g3 .nest{position:absolute;left:50%;top:70%;width:46vh;height:13vh;margin-left:-23vh;border-radius:50%;background:radial-gradient(ellipse at 50% 35%,#ffe08a,#c98a3a 55%,#7a4a1c);box-shadow:0 2vh 3vh rgba(0,0,0,.25),inset 0 -1vh 2vh rgba(0,0,0,.3)}
  .g3 .stage{position:absolute;left:50%;top:22%;width:44vh;height:50vh;margin-left:-22vh;touch-action:manipulation;cursor:pointer}
  .g3 .aura{position:absolute;left:50%;top:50%;width:90vh;height:90vh;margin:-45vh 0 0 -45vh;border-radius:50%;opacity:0;transition:opacity .5s;pointer-events:none;
     background:repeating-conic-gradient(var(--aura) 0 10deg,transparent 10deg 24deg);animation:spin 7s linear infinite;-webkit-mask:radial-gradient(circle,#000 8%,transparent 62%);mask:radial-gradient(circle,#000 8%,transparent 62%)}
  .g3 .aura.on{opacity:.85}
  .g3 .egg{position:absolute;inset:0;transform-origin:50% 90%;transition:transform .15s}
  .g3 .egg img{width:100%;height:100%;filter:drop-shadow(0 0 3vh var(--glow))}
  .g3 .egg.wob{animation:eggwob .35s}
  @keyframes eggwob{25%{transform:rotate(-9deg) scale(1.04,.96)}75%{transform:rotate(9deg) scale(.97,1.03)}}
  .g3 .egg.idle{animation:eggidle 1.6s ease-in-out infinite}
  @keyframes eggidle{0%,100%{transform:rotate(0)}10%{transform:rotate(-5deg)}20%{transform:rotate(5deg)}30%{transform:rotate(0)}}
  .g3 .cracks{position:absolute;inset:0;pointer-events:none}
  .g3 .cracks path{stroke:#3a2a5a;stroke-width:3.5;fill:none;stroke-linecap:round;stroke-linejoin:round;opacity:0;transition:opacity .2s}
  .g3 .cracks path.on{opacity:.85}
  .g3 .top,.g3 .bot{position:absolute;inset:0}
  .g3 .top{clip-path:polygon(0 0,100% 0,100% 47%,88% 53%,76% 45%,64% 54%,52% 45%,40% 54%,28% 45%,16% 53%,0 46%);transition:transform .7s cubic-bezier(.3,1.4,.5,1)}
  .g3 .bot{clip-path:polygon(0 46%,16% 53%,28% 45%,40% 54%,52% 45%,64% 54%,76% 45%,88% 53%,100% 47%,100% 100%,0 100%)}
  .g3 .top img,.g3 .bot img{position:absolute;inset:0;width:100%;height:100%}
  .g3 .egg.shake{animation:eggwob .2s 3}
  .g3 .pop .cracks{opacity:0}
  .g3 .pop .top{transition:transform .7s cubic-bezier(.3,1.4,.5,1),opacity .3s .45s;transform:translate(-60vh,-80vh) rotate(-140deg);opacity:0}
  .g3 .pop .bot{transition:transform .7s ease-in,opacity .3s .45s;transform:translate(40vh,60vh) rotate(120deg);opacity:0}
  .g3 .pet{position:absolute;left:8%;right:8%;top:6%;bottom:8%;opacity:0;transform-origin:50% 100%;transform:scale(.6) translateY(20%);transition:transform .7s cubic-bezier(.2,1.6,.4,1),opacity .3s}
  .g3 .pet img{width:100%;height:100%}
  .g3 .pop .pet{opacity:1;filter:drop-shadow(0 2vh 2vh rgba(0,0,0,.3));transform:none}
  .g3 .pet img{transform-origin:50% 100%}
  .g3 .pop .pet img{animation:petjoy .8s ease-in-out infinite}
  @keyframes petjoy{50%{transform:translateY(-4%) scale(1.04,.96)}}
  /* "Can it fly?" — a flyer flaps up with wing / whoosh lines and hovers; a non-flyer hops, tries, plops and shrugs "?" */
  .g3 .wind{position:absolute;inset:-6% -24% -10%;width:148%;height:116%;overflow:visible;pointer-events:none;opacity:0;transition:opacity .2s}
  .g3 .wind path{fill:none;stroke:#fff;stroke-width:7;stroke-linecap:round;filter:drop-shadow(0 0 3px #0a1633)}
  .g3 .wind .wl{transform-origin:68px 92px;animation:wing .14s ease-in-out infinite alternate}
  .g3 .wind .wr{transform-origin:228px 92px;animation:wing .14s ease-in-out infinite alternate-reverse}
  .g3 .wind .sp{opacity:0;transition:opacity .2s}
  @keyframes wing{from{transform:scaleY(.55) rotate(-8deg)}to{transform:scaleY(1.1) rotate(8deg)}}
  .g3 .flap .wind,.g3 .hover .wind{opacity:1}
  .g3 .flap .wind .sp{opacity:1}
  .g3 .pop.flap .pet img{animation:petflap .14s ease-in-out infinite alternate}
  @keyframes petflap{to{transform:scale(1.05,.94)}}
  .g3 .pop.hover .pet{transform:translateY(-8%)}
  .g3 .pop.hover .pet img{animation:pethov 1s ease-in-out infinite}
  .g3 .hover .wind .wl,.g3 .hover .wind .wr{animation-duration:.3s}
  @keyframes pethov{50%{transform:translateY(-5%)}}
  .g3 .huh{position:absolute;right:-24%;top:4%;font-size:14vh;font-weight:700;line-height:1;color:#ffd23d;text-shadow:0 .5vh 0 #0a1633,0 0 2vh #0a1633;opacity:0;transform:scale(.2) rotate(-20deg);transition:transform .35s cubic-bezier(.2,1.8,.4,1),opacity .2s;pointer-events:none}
  .g3 .pop.shrug .huh{opacity:1;transform:rotate(12deg);animation:float 1.2s ease-in-out infinite}
  .g3 .tapme{position:absolute;left:0;right:0;top:84%;text-align:center;font-size:3.4rem;font-weight:700;color:#fff;text-shadow:0 .3rem 0 #0a1633,0 0 1.5rem #0a1633;white-space:nowrap;animation:float 1s ease-in-out infinite}
  .g3 .rar{position:absolute;left:50%;top:72.5%;transform:translateX(-50%);font-size:3.6rem;font-weight:700;letter-spacing:.15em;color:#fff;text-shadow:0 0 1.5rem var(--glow),0 .3rem 0 #0a1633;white-space:nowrap}
  .g3 .rar.low{top:62.5%;font-size:3rem;animation:rarpop .45s cubic-bezier(.2,1.6,.4,1)}
  @keyframes rarpop{from{transform:translateX(-50%) scale(.3);opacity:0}}
  .g3 .name{position:absolute;left:50%;top:67.5%;transform:translateX(-50%);font-size:6rem;font-weight:700;color:#fff;text-shadow:0 .4rem 0 #0a1633,0 0 2rem #0a1633;opacity:0;transition:opacity .3s;white-space:nowrap}
  .g3 .name.on{opacity:1}
  .g3 .pets{position:absolute;right:1.4rem;top:8.6rem;display:flex;flex-direction:column;gap:.8rem;z-index:6}
  .g3 .pcard{width:13rem;border-radius:1.4rem;padding:.3rem .5rem .4rem;text-align:center;background:linear-gradient(180deg,#fff,#eef2ff);color:#0a1633;box-shadow:0 .5rem 0 var(--rc),0 1rem 1.6rem rgba(0,0,0,.3);border:.35rem solid var(--rc);animation:pop .5s;cursor:pointer;touch-action:manipulation}
  .g3 .pcard img{width:5.8rem;height:5.8rem;display:block;margin:0 auto}
  .g3 .pcard b{display:block;font-size:1.6rem;line-height:1.15}
  .g3 .pcard small{font-size:1rem;font-weight:700;color:var(--rc)}
  .g3 .pcard .cn{display:inline;margin-left:.5rem;font-size:1.2rem;font-weight:600;color:#5a6aa8}
  .g3 .lineup .pcard .cn{display:block;margin:0;font-size:2rem}
  .g3 .lineup .pcard small{font-size:1.1rem}
  .g3 .lineup{position:absolute;inset:14.6rem 2rem 34vh;display:flex;align-items:center;justify-content:center;gap:2.4rem;z-index:7}
  .g3 .lineup .pcard{width:22rem;padding:.5rem;transform:scale(1);transition:transform .2s}
  .g3 .lineup .pcard img{width:13.5rem;height:13.5rem}
  .g3 .lineup .pcard b{font-size:3rem;line-height:normal}
  .g3 .lineup .pcard.sel{transform:scale(1.12) rotate(-3deg);box-shadow:0 0 0 .6rem #fff,0 0 4rem var(--rc)}
  `;
  const RAR = [{ n: "COMMON", egg: "#5ab0ff", glow: "#7fd3ff", aura: "rgba(127,211,255,.55)", rc: "#3d8bff" },
               { n: "RARE", egg: "#9b6bff", glow: "#c9a8ff", aura: "rgba(180,140,255,.6)", rc: "#9b6bff" },
               { n: "EPIC", egg: "#ff5fa2", glow: "#ff9ac2", aura: "rgba(255,120,180,.6)", rc: "#ff3d8a" },
               { n: "LEGENDARY", egg: "#ffc83d", glow: "#ffe58a", aura: "rgba(255,210,80,.75)", rc: "#e8a21a" }];
  const CRACKS = ["M100 70 l-14 18 l12 10 l-10 16", "M100 70 l14 14 l-8 14 l14 12", "M60 100 l16 6 l6 -14 l18 8", "M140 104 l-18 4 l-4 -14 l-16 10", "M52 96 Q100 84 148 96"];
  // wing strokes either side of the pet + speed lines under it (viewBox matches .wind: pet box widened 24% each side)
  const WIND = `<svg class="wind" viewBox="0 0 296 232" preserveAspectRatio="none"><g class="wl"><path d="M58 70 Q30 82 26 108"/><path d="M66 90 Q42 100 40 122"/><path d="M74 110 Q56 118 56 134"/></g>` +
    `<g class="wr"><path d="M238 70 Q266 82 270 108"/><path d="M230 90 Q254 100 256 122"/><path d="M222 110 Q240 118 240 134"/></g>` +
    `<g class="sp"><path d="M118 206 L114 228"/><path d="M148 210 L148 232"/><path d="M178 206 L182 228"/></g></svg>`;
  let root, stage, egg, eggTop, eggBot, cracks, pet, aura, rar, nameEl, tapme, pets;

  function build(api) {
    api.stage.append(TC.h("style", {}, css));
    root = TC.h("div", { class: "g3" });
    root.append(TC.h("div", { class: "hill", style: "left:-12%;top:52%;width:62%;height:44%" }), TC.h("div", { class: "hill", style: "right:-16%;top:56%;width:70%;height:44%" }));
    { const e = TC.artImg("eiffel", "deco"); e.style.cssText = "left:76%;top:16%;width:22vh;height:30vh;opacity:.85"; root.append(e); }
    [[4, 34, 15], [17, 40, 11], [72, 36, 14], [86, 42, 12]].forEach(([x, y, w]) => { const t = TC.artImg("tree", "deco"); t.style.cssText = `left:${x}%;top:${y}%;width:${w}vh`; root.append(t); });
    [[8, 12, 16], [62, 6, 20]].forEach(([x, y, w]) => { const c = TC.artImg("cloud", "deco"); c.style.cssText = `left:${x}%;top:${y}%;width:${w}vh;opacity:.9;animation:float ${4 + x / 20}s ease-in-out infinite`; root.append(c); });
    aura = TC.h("div", { class: "aura" });
    stage = TC.h("div", { class: "stage" });
    pet = TC.h("div", { class: "pet", html: `<img alt="">${WIND}<div class="huh">?</div>` });
    eggTop = TC.h("div", { class: "top" }, TC.h("img", { alt: "" }));
    eggBot = TC.h("div", { class: "bot" }, TC.h("img", { alt: "" }));
    cracks = TC.h("div", { class: "cracks", html: `<svg viewBox="0 0 200 200" width="100%" height="100%">${CRACKS.map((d) => `<path d="${d}"/>`).join("")}</svg>` });
    egg = TC.h("div", { class: "egg" }, eggBot, pet, eggTop, cracks);
    stage.append(egg);
    rar = TC.h("div", { class: "rar" }); nameEl = TC.h("div", { class: "name" }); tapme = TC.h("div", { class: "tapme hidden zh" });
    pets = TC.h("div", { class: "pets" });
    root.append(aura, TC.h("div", { class: "nest" }), stage, rar, nameEl, tapme, pets);
    api.stage.append(root);
    stage.addEventListener("pointerdown", () => tapHandler && tapHandler());
  }
  let tapHandler = null;
  function setEgg(r) {
    root.style.setProperty("--glow", r.glow); root.style.setProperty("--aura", r.aura);
    const src = TC.art("mystegg", r.egg);
    eggTop.firstChild.src = src; eggBot.firstChild.src = src;
    cracks.querySelectorAll("path").forEach((p) => p.classList.remove("on"));
    stage.className = "stage"; egg.className = "egg idle"; aura.classList.remove("on"); nameEl.classList.remove("on"); rar.className = "rar";
  }
  function burst(n = 18) {
    const r = stage.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
      const d = TC.h("div", { style: `position:fixed;left:${r.left + r.width / 2}px;top:${r.top + r.height * 0.4}px;width:2vh;height:2.6vh;border-radius:50% 50% 45% 45%;background:#fff8ec;z-index:9;box-shadow:inset -.3vh -.3vh 0 rgba(0,0,0,.12)` });
      document.body.append(d);
      const a = Math.random() * Math.PI * 2, v = 20 + Math.random() * 30;
      d.animate([{ transform: "translate(0,0) rotate(0)" }, { transform: `translate(${Math.cos(a) * v}vh,${Math.sin(a) * v - 10}vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }], { duration: 900 + Math.random() * 400, easing: "cubic-bezier(.2,.6,.4,1)" }).onfinish = () => d.remove();
    }
  }
  /** child taps the egg 3 times (or teacher presses Enter / waits) */
  function tapToCrack() {
    return new Promise((res) => {
      let taps = 0; tapme.textContent = "👆 TAP TAP TAP! 點蛋三下！"; tapme.classList.remove("hidden");
      const paths = cracks.querySelectorAll("path");
      const hit = () => {
        taps++; egg.classList.remove("idle", "wob"); void egg.offsetWidth; egg.classList.add("wob");
        TC.sfx(taps < 3 ? "pop" : "catch"); burst(5);
        paths[Math.min(paths.length - 1, taps * 2 - 2)].classList.add("on"); if (paths[taps * 2 - 1]) paths[taps * 2 - 1].classList.add("on");
        if (taps >= 3) { tapHandler = null; TC.pending = null; clearTimeout(t); tapme.classList.add("hidden"); res(); }
      };
      tapHandler = hit; TC.pending = () => { while (taps < 3) hit(); };
      const t = setTimeout(() => { if (taps < 3) TC.pending && TC.pending(); }, 15000);
    });
  }
  /** "Can it fly?" visual (≤ 2 s): flyers flap up into the sky and float back to a hover; the others hop, try, plop and shrug */
  async function flyShow(it) {
    if (it.fly) {
      stage.classList.add("flap"); TC.sfx("whoosh"); setTimeout(() => TC.sfx("sparkle"), 450);
      await pet.animate([{ transform: "none" }, { transform: "translateY(5%) scale(1.12,.86)", offset: 0.12 }, { transform: "translateY(-46%) rotate(-7deg)", offset: 0.42 },
        { transform: "translateY(-40%) rotate(7deg)", offset: 0.6 }, { transform: "translateY(-44%) rotate(-4deg)", offset: 0.75 }, { transform: "translateY(-8%)" }],
        { duration: 1700, easing: "ease-in-out" }).finished.catch(() => {});
      stage.classList.remove("flap"); stage.classList.add("hover");
    } else {
      [0, 260, 600].forEach((ms) => setTimeout(() => TC.sfx("pop"), ms)); setTimeout(() => TC.sfx("kick"), 900);
      await pet.animate([{ transform: "none" }, { transform: "translateY(-12%)", offset: 0.1 }, { transform: "none", offset: 0.2 }, { transform: "translateY(-12%)", offset: 0.3 },
        { transform: "none", offset: 0.4 }, { transform: "translateY(4%) scale(1.14,.84)", offset: 0.5 }, { transform: "translateY(-24%) scale(.94,1.08)", offset: 0.66 },
        { transform: "translateY(5%) scale(1.22,.76)", offset: 0.8 }, { transform: "none" }], { duration: 1150, easing: "ease-in-out" }).finished.catch(() => {});
      stage.classList.add("shrug"); TC.sfx("tick");
      await pet.animate([{ transform: "rotate(0)" }, { transform: "rotate(-8deg)" }, { transform: "rotate(8deg)" }, { transform: "rotate(0)" }], { duration: 600 }).finished.catch(() => {});
    }
  }
  function addCard(it, r, parent = pets) {
    const c = TC.h("div", { class: "pcard", style: `--rc:${r.rc}` }, TC.artImg(it.img), TC.h("b", {}, cap(it.w)), TC.h("small", {}, "★ " + r.n), TC.h("div", { class: "cn zh" }, it.zh));
    parent.append(c); return c;
  }

  TC.games.hatch = {
    mount(api) { build(api); this.idle(api); },
    idle() { pets.innerHTML = ""; setEgg(RAR[3]); pet.firstChild.src = TC.art("ollie"); tapHandler = null; tapme.classList.add("hidden"); root.querySelectorAll(".lineup").forEach((l) => l.remove()); rar.textContent = "PET HATCH"; },
    async play(api) {
      const G = api.G; pets.innerHTML = "";
      // shuffle, but make sure one pet that can fly (duck / bird) is among them, so 中級 sees both answers of "Can it fly?"
      const items = G.items.slice().sort(() => Math.random() - 0.5).slice(0, TC.rounds(4)), got = [];
      if (!items.some((x) => x.fly)) { const fl = G.items.filter((x) => x.fly); items[(Math.random() * items.length) | 0] = fl[(Math.random() * fl.length) | 0]; }
      const N = items.length + 1;
      await TC.speak("Go!");
      for (let i = 0; i < items.length; i++) {
        if (api.aborted) return null;
        api.progress(i, N);
        const it = items[i];
        const r = i === items.length - 1 ? RAR[3] : RAR[[0, 0, 1, 2][(Math.random() * 4) | 0]];
        setEgg(r); pet.firstChild.src = TC.art(it.img);
        rar.textContent = `${r.n} EGG!`; TC.sfx("whoosh");
        stage.animate([{ transform: "translateY(-60vh)" }, { transform: "translateY(0)" }], { duration: 650, easing: "cubic-bezier(.3,1.5,.5,1)" });
        await TC.sleep(700);
        await tapToCrack(); if (api.aborted) return null;
        // drum roll … the shell flies off and the pet is there, in full colour, with its rarity aura
        egg.classList.remove("wob"); void egg.offsetWidth; egg.classList.add("shake"); TC.sfx("drum");
        await TC.sleep(650); if (api.aborted) return null;
        egg.classList.remove("shake"); stage.classList.add("pop"); aura.classList.add("on"); burst(22);
        TC.sfx(r.n === "LEGENDARY" ? "fanfare" : "levelup"); TC.confetti(r.n === "LEGENDARY" ? 220 : 90, [r.egg, r.glow, "#fff"]);
        rar.textContent = `★ ${r.n} ★`; rar.classList.add("low");
        await TC.speak("Wow!"); if (api.aborted) return null;
        // "What is it?" — the pet stays large and clear on the nest while the child answers
        const distractors = G.items.filter((x) => x.w !== it.w).map((x) => ({ w: x.w }));
        const res = await api.ask({ teacher: G.teacher, tzh: G.tzh, say: it.say, zh: it.zh, keys: it.keys || [[it.w]], word: it.w, distractors, hideKey: true,
          onWrong: (w) => { pet.firstChild.animate([{ transform: "rotate(-9deg)" }, { transform: "rotate(9deg)" }, { transform: "rotate(-6deg)" }, { transform: "rotate(0)" }], { duration: 450 }); TC.sfx("wrong");
            TC.toast(`${cap(w)}? Look again! 再看一次！`, 1800); } });
        if (api.aborted) return null;
        TC.hideTalk();
        nameEl.textContent = cap(it.w) + "!"; nameEl.classList.add("on");
        await TC.speak((res.ok ? "Yes! " : "") + it.say); if (api.aborted) return null;
        // 中級 only: one more easy question "Can it fly?" — the pet shows it: flies up (yes) or hops and plops down (no)
        if (api.level === 2 && !TC.cfg.rounds) {
          const Q = G.follow, k = it.fly ? "yes" : "no";
          nameEl.classList.remove("on"); rar.classList.add("hidden");
          await flyShow(it); if (api.aborted) return null;
          await api.ask({ teacher: Q.teacher, tzh: Q.zh, say: Q.say[k], keys: Q.keys, word: Q.word[k], hideKey: true });
          if (api.aborted) return null;
          TC.hideTalk();
          nameEl.textContent = Q.after[k]; nameEl.classList.add("on");
          // "It can't fly." has no human clip for "can't": Ollie then says just "Yes!" / "No!" (the full line is the subtitle)
          await TC.speak(Q.after[k], TC.canSayHuman(Q.after[k]) ? {} : { human: Q.say[k] }); if (api.aborted) return null;
          stage.classList.remove("flap", "hover", "shrug");
        }
        await TC.sleep(600);
        got.push({ it, r }); addCard(it, r);
      }
      if (api.aborted) return null;
      api.progress(items.length, N);
      // finale: "Which one do you want?" — tap the pet you want, then say it
      setEgg(RAR[3]); stage.className = "stage hidden"; rar.textContent = "MY PETS"; aura.classList.add("on");
      const line = TC.h("div", { class: "lineup" }); root.append(line);
      const words = got.map((g) => g.it.w);
      let chosen = got[0];
      const cards = got.map((g) => { const c = addCard(g.it, g.r, line); c.onclick = () => { chosen = g; cards.forEach((x) => x.classList.remove("sel")); c.classList.add("sel"); TC.sfx("pop"); TC.model(g.it.w, g.it.w); if (TC.pending) TC.pending(); }; return c; });
      pets.innerHTML = "";
      tapme.textContent = "👆 TAP! 點一下你想要的寵物！"; tapme.classList.remove("hidden"); TC.sfx("levelup");
      await TC.waitAction(12000);
      tapme.classList.add("hidden");
      if (api.aborted) { line.remove(); return null; }
      cards[got.indexOf(chosen)].classList.add("sel");
      const F = G.finale, it = chosen.it;
      const r = await api.ask({ teacher: F.teacher, tzh: F.zh, say: F.say.replace("[animal]", it.w), zh: "說出你想要的寵物", keys: [words], word: it.w, hideKey: true });
      if (api.aborted) { line.remove(); return null; }
      TC.hideTalk();
      const want = got.find((g) => g.it.w === TC.pickHeard(r.heard, words)) || chosen;
      if (r.ok) TC.lastSay = F.say.replace("[animal]", want.it.w); // the line everybody repeats is the pet the child really said
      cards.forEach((x) => x.classList.remove("sel")); const fc = cards[got.indexOf(want)]; fc.classList.add("sel");
      fc.animate([{ transform: "scale(1.12)" }, { transform: "scale(1.3) rotate(4deg)" }, { transform: "scale(1.12)" }], { duration: 500, iterations: 3 });
      TC.sfx("fanfare"); TC.confetti(180);
      await TC.speak(`Great! The ${want.it.w}!`);
      await TC.sleep(1200); line.remove(); stage.className = "stage"; aura.classList.remove("on");
      if (api.aborted) return null;
      api.progress(N, N);
      return { ok: true };
    }
  };
  function cap(w) { return w[0].toUpperCase() + w.slice(1); }
})();
