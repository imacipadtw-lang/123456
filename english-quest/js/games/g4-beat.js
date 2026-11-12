/* Gate 4 · Beat Party — "What's this?" → the child names the body part on the big card, and because
   the boss said it, the whole party touches it to the beat (passport 第3關 身體部位; finale "Cheese!" photo) */
(function () {
  "use strict";
  TC.games = TC.games || {};
  const css = `
  .g4{position:absolute;inset:0;overflow:hidden;background:radial-gradient(70% 60% at 50% 40%,#3b1c7a,#120827)}
  .g4 .spot{position:absolute;top:-20%;width:40%;height:140%;background:linear-gradient(rgba(255,255,255,.22),rgba(255,255,255,0));clip-path:polygon(45% 0,55% 0,100% 100%,0 100%);transform-origin:50% 0;mix-blend-mode:screen;animation:spotA 4s ease-in-out infinite}
  @keyframes spotA{0%,100%{transform:rotate(-25deg)}50%{transform:rotate(25deg)}}
  .g4 .floor{position:absolute;left:-30%;right:-30%;bottom:22%;height:46%;display:grid;grid-template-columns:repeat(12,1fr);grid-template-rows:repeat(5,1fr);transform:perspective(70vh) rotateX(58deg);transform-origin:50% 100%;gap:.6vh}
  .g4 .floor i{border-radius:.8vh;box-shadow:inset 0 0 2vh rgba(255,255,255,.08)}
  .g4 .ball{position:absolute;left:50%;top:-3vh;width:14vh;height:14vh;margin-left:-7vh;border-radius:50%;animation:spin 6s linear infinite;
     background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.9),transparent 30%),repeating-conic-gradient(#c9d6ff 0 10deg,#6f7fd8 10deg 20deg),#8fa2ff;box-shadow:0 0 4vh rgba(201,214,255,.7)}
  .g4 .ball:before{content:"";position:absolute;left:50%;top:-20vh;width:.4vh;height:20vh;background:#c9d6ff}
  .g4 .floor i{border:1px solid rgba(255,255,255,.08);animation:tile 1.2s infinite}
  @keyframes tile{0%,100%{background:rgba(255,95,162,.15)}50%{background:rgba(76,201,255,.25)}}
  .g4 .bot{position:absolute;left:30%;top:16%;width:26vh;height:30vh;margin-left:-13vh;transition:transform .2s}
  .g4 .bot.jump{animation:pJump .6s ease-in-out infinite}
  .g4 .bot.clap{animation:pClap .3s ease-in-out infinite}
  @keyframes pClap{50%{transform:scale(1.12,.9)}}
  .g4 .bot.nod{animation:pNod .6s ease-in-out infinite}
  @keyframes pNod{50%{transform:translateY(8%) rotate(8deg)}}
  .g4 .bot.peek{animation:pPeek .6s ease-in-out infinite}
  @keyframes pPeek{50%{transform:scale(1.14,.82)}}
  .g4 .bot.wiggle{animation:pWiggle .3s ease-in-out infinite}
  @keyframes pWiggle{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(9deg)}}
  .g4 .bot.boop{animation:pBoop .6s ease-in-out infinite}
  @keyframes pBoop{50%{transform:scale(1.2)}}
  .g4 .bot.dance{animation:pDance .6s ease-in-out infinite}
  .g4 .bot.sing{animation:talk .25s ease-in-out infinite}
  .g4 .bot.stand{transform:scale(1.18) translateY(-6%)}
  .g4 .pads{position:absolute;left:4%;right:4%;top:56%;height:13%;display:grid;grid-template-columns:repeat(4,1fr);gap:1.4rem;opacity:0;pointer-events:none;transition:opacity .25s}
  .g4 .pads.on{opacity:1;pointer-events:auto}
  .g4 .pad{border-radius:1.6rem;display:grid;place-items:center;font-size:3rem;font-weight:700;color:#fff;touch-action:manipulation;cursor:pointer;
     background:radial-gradient(circle at 35% 30%,color-mix(in srgb,var(--pc) 55%,#fff),var(--pc) 55%,color-mix(in srgb,var(--pc) 60%,#000));box-shadow:0 .7rem 0 color-mix(in srgb,var(--pc) 55%,#000),0 0 2rem var(--pc);text-shadow:0 .2rem 0 rgba(0,0,0,.3)}
  .g4 .pad:active,.g4 .pad.down{transform:translateY(.5rem);box-shadow:0 .2rem 0 color-mix(in srgb,var(--pc) 55%,#000),0 0 4rem var(--pc)}
  .g4 .djhint{position:absolute;left:50%;top:50.5%;transform:translateX(-50%);font-size:2.4rem;font-weight:700;color:#ffc83d;opacity:0;transition:opacity .25s;white-space:nowrap}
  .g4 .djhint.on{opacity:1}
  .g4 .ring{position:absolute;left:30%;top:32%;width:20vh;height:20vh;margin:-10vh;border-radius:50%;border:.6rem solid #ffc83d;pointer-events:none;animation:ring .6s ease-out forwards}
  .g4 .ring.oncard{left:auto;right:calc(9% + 20vh);top:calc(12.5% + 20vh)}
  @keyframes ring{from{transform:scale(.4);opacity:1}to{transform:scale(2.6);opacity:0}}
  @keyframes pJump{50%{transform:translateY(-28%)}}
  @keyframes pDance{0%,100%{transform:rotate(-12deg) translateX(-10%)}50%{transform:rotate(12deg) translateX(10%)}}
  .g4 .lane{position:absolute;left:4%;right:4%;top:56%;height:13%;border-radius:2rem;background:rgba(0,0,0,.35);border:2px solid rgba(255,255,255,.2)}
  .g4 .hit{position:absolute;left:3%;top:50%;width:11vh;height:11vh;margin-top:-5.5vh;border-radius:50%;border:.5rem solid #fff;box-shadow:0 0 2rem #ff5fa2}
  .g4 .hit.pulse{animation:hitp .6s infinite}
  @keyframes hitp{50%{transform:scale(1.15);box-shadow:0 0 4rem #ff5fa2}}
  .g4 .cmd{position:absolute;top:50%;transform:translateY(-50%);left:100%;white-space:nowrap;background:linear-gradient(90deg,#ff5fa2,#9b6bff);padding:.4rem 2rem .4rem .6rem;border-radius:2rem;font-size:3.6rem;font-weight:700;box-shadow:0 0 2rem rgba(255,95,162,.6);display:flex;align-items:center;gap:1rem}
  .g4 .cmd img{width:9vh;height:9vh;margin:-2vh 0;filter:drop-shadow(0 .6vh .6vh rgba(0,0,0,.3))}
  .g4 .posecard{position:absolute;right:9%;top:12.5%;width:40vh;height:40vh;border-radius:3.6vh;background:radial-gradient(circle at 40% 30%,#fff,#e6ecff);box-shadow:0 1.4vh 0 #9b6bff,0 2.4vh 4vh rgba(0,0,0,.4);display:grid;place-items:center;opacity:0;transform:scale(.6) rotate(-8deg);transition:all .4s cubic-bezier(.2,1.5,.4,1)}
  .g4 .posecard.on{opacity:1;transform:scale(1) rotate(-2deg)}
  .g4 .posecard.beat{box-shadow:0 1.4vh 0 #ffc83d,0 0 5vh #ffc83d,0 2.4vh 4vh rgba(0,0,0,.4)}
  .g4 .posecard img{width:96%;height:96%}
  .g4 .party{position:absolute;left:0;right:0;top:71.5%;height:25%;display:flex;align-items:center;justify-content:center;gap:1.6vh;opacity:0;pointer-events:none;transition:opacity .3s}
  .g4 .party.on{opacity:1}
  .g4 .party img{width:17vh;height:17vh;flex:0 0 auto;filter:drop-shadow(0 1vh 1vh rgba(0,0,0,.45))}
  .g4 .party .say{margin:0 1.6vh;text-align:center;font-size:5.4rem;font-weight:700;line-height:1.05;color:#fff;text-shadow:0 .35rem 0 #9b6bff,0 0 2rem rgba(255,95,162,.8);white-space:nowrap}
  .g4 .party .say b{color:#ffc83d}
  .g4 .party .say span{display:block;margin-top:.8rem;font-size:2.2rem;color:#ffc83d;text-shadow:0 .2rem 0 rgba(0,0,0,.4)}
  .g4 .power{position:absolute;right:2.5%;top:14%;width:4.5vh;height:32%;border-radius:2vh;background:rgba(255,255,255,.12);overflow:hidden;border:2px solid rgba(255,255,255,.3)}
  .g4 .power i{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(0deg,#2ee6b6,#ffc83d,#ff5fa2)}
  .g4 .power-l{position:absolute;right:1%;top:47%;width:9vh;text-align:center;font-size:1.3rem;font-weight:700}
  .g4 .combo{position:absolute;left:3%;top:16%;font-size:2.4rem;font-weight:700}
  .g4 .note{position:absolute;width:6vh;height:6vh;animation:noteUp 1.6s ease-out forwards}
  @keyframes noteUp{to{transform:translateY(-25vh) rotate(30deg);opacity:0}}
  .g4 .photo{position:absolute;left:50%;top:48%;transform:translate(-50%,-50%) rotate(-3deg);background:#fff;padding:1.2vh 1.2vh 7vh;box-shadow:0 2vh 5vh rgba(0,0,0,.5);z-index:9;animation:pop .6s}
  .g4 .photo canvas{display:block;width:60vh;height:45vh;object-fit:cover}
  .g4 .photo div{position:absolute;left:0;right:0;bottom:1.5vh;text-align:center;color:#0a1633;font-size:2.6vh;font-weight:700}
  .g4 .flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:8}
  `;
  let duck = false, root, bot, lane, hit, powerBar, combo, flash, card, party, beatOn = false, clock = null, nextBeat = 0, step = 0, peak = 0, partyOn = false;
  function build(api) {
    api.stage.append(TC.h("style", {}, css));
    root = TC.h("div", { class: "g4" });
    { const py = TC.artImg("pyramids"); py.style.cssText = "position:absolute;left:3%;top:24%;width:34vh;height:32vh;opacity:.35;filter:hue-rotate(-20deg) saturate(.8)"; root.append(py); const py2 = TC.artImg("pyramids"); py2.style.cssText = "position:absolute;right:16%;top:28%;width:26vh;height:24vh;opacity:.25;transform:scaleX(-1)"; root.append(py2); }
    root.append(TC.h("div", { class: "spot", style: "left:5%" }), TC.h("div", { class: "spot", style: "right:5%;animation-delay:-2s" }));
    const floor = TC.h("div", { class: "floor" }); for (let i = 0; i < 60; i++) floor.append(TC.h("i", { style: `animation-delay:${-((i * 7) % 11) * 0.13}s` })); root.append(floor, TC.h("div", { class: "ball" }));
    bot = TC.h("div", { class: "bot", html: TC.ollieSVG() });
    lane = TC.h("div", { class: "lane" }); hit = TC.h("div", { class: "hit" }); lane.append(hit);
    const power = TC.h("div", { class: "power" }); powerBar = TC.h("i"); power.append(powerBar);
    combo = TC.h("div", { class: "combo" });
    flash = TC.h("div", { class: "flash" });
    card = TC.h("div", { class: "posecard" }); party = TC.h("div", { class: "party" });
    root.append(bot, lane, card, power, TC.h("div", { class: "power-l zh" }, "聲音能量 VOICE"), combo, party, flash);
    buildPads();
    api.stage.append(root);
    (function meter() { const l = TC.Mic.level || 0; peak = Math.max(peak, l); powerBar.style.height = Math.min(100, l * 130) + "%"; requestAnimationFrame(meter); })();
  }
  // simple drum machine on the WebAudio clock (or the page clock when audio is not running)
  function beatLoop() {
    if (!beatOn) return;
    const spb = 60 / 100 / 2; // eighth notes at 100 BPM
    while (nextBeat < clock() + 0.12) {
      const s = step % 8, delay = Math.max(0, (nextBeat - clock()) * 1000);
      setTimeout(() => { if (!beatOn) return; if (duck) { if (s % 2 === 0) TC.sfx("hat"); return; } if (s === 0 || s === 4) TC.sfx("kick"); if (s === 2 || s === 6) TC.sfx("snare"); TC.sfx("hat"); if (s === 0) hit.animate([{ transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: 250 }); if (partyOn && s % 2 === 0) thump(s / 2); }, delay);
      nextBeat += spb; step++;
    }
    setTimeout(beatLoop, 40);
  }
  function startBeat() { if (beatOn) return; const c = TC.ac(); clock = c && c.state === "running" ? () => c.currentTime : () => performance.now() / 1000; beatOn = true; nextBeat = clock() + 0.05; step = 0; beatLoop(); }
  function stopBeat() { beatOn = false; }
  /** every beat of the party: the picture thumps and the crowd hops (odd and even kids take turns) */
  function thump(q) {
    const im = card.querySelector("img"); if (im) im.animate([{ transform: "scale(1.13)" }, { transform: "scale(1)" }], { duration: 300, easing: "ease-out" });
    party.querySelectorAll("img").forEach((k, i) => { if (i % 2 === q % 2) k.animate([{ transform: "translateY(0)" }, { transform: "translateY(-24%) scale(1.06)" }, { transform: "translateY(0)" }], { duration: 420, easing: "ease-out" }); });
    if (q === 0) ringFx("#ffc83d", " oncard");
  }
  function ringFx(col, where = "") { const r = TC.h("div", { class: "ring" + where, style: `border-color:${col}` }); root.append(r); setTimeout(() => r.remove(), 700); }
  function pose(p) { bot.className = "bot " + (p || ""); }
  function notes(n = 6) { for (let i = 0; i < n; i++) { const d = TC.artImg("star", "note"); d.style.cssText = `left:${25 + Math.random() * 50}%;top:${28 + Math.random() * 22}%;animation-delay:${i * 0.1}s`; root.append(d); setTimeout(() => d.remove(), 2000); } }
  /** DJ time: the child taps the pads while everyone does the move */
  const PADS = [["#ff5fa2", "kick", "BOOM"], ["#4cc9ff", "snare", "CLAP"], ["#ffc83d", "hat", "TSS"], ["#2ee6b6", "levelup", "YEAH"]];
  let pads, djhint;
  function buildPads() {
    pads = TC.h("div", { class: "pads" }); djhint = TC.h("div", { class: "djhint zh" }, "👆 DJ TIME! 打節奏！");
    PADS.forEach(([c, s, t]) => { const p = TC.h("div", { class: "pad", style: `--pc:${c}` }, t);
      p.addEventListener("pointerdown", () => { TC.sfx(s); p.classList.add("down"); setTimeout(() => p.classList.remove("down"), 120); notes(2); ringFx(c); bot.animate([{ transform: "scale(1)" }, { transform: "scale(1.1,.9)" }, { transform: "scale(1)" }], { duration: 200 }); });
      pads.append(p); });
    root.append(pads, djhint);
  }
  function djTime(on) { pads.classList.toggle("on", on); djhint.classList.toggle("on", on); lane.style.opacity = on ? 0 : 1; }
  /** what Ollie does for each body part while everyone touches it */
  const MOVE = { head: "nod", eyes: "peek", ears: "wiggle", nose: "boop", mouth: "sing", hands: "clap", feet: "jump" };
  /** a new round: the big picture card pops up and its beat note slides along the lane to the hit ring */
  async function showPart(p, question) {
    lane.querySelectorAll(".cmd").forEach((c) => c.remove());
    card.innerHTML = ""; card.append(TC.artImg(p.img, "", p.zh)); card.classList.add("on"); TC.sfx("pop");
    const c = TC.h("div", { class: "cmd" }, TC.artImg(p.img, "", p.zh), question); lane.append(c);
    const lw = lane.clientWidth;
    await c.animate([{ left: "100%" }, { left: (hit.offsetLeft + hit.offsetWidth + 20) / lw * 100 + "%" }], { duration: 1100, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }).finished.catch(() => {});
    hit.classList.add("pulse");
  }
  /** the boss said it: the crowd shows up, the sentence is on screen and everything moves to the beat */
  function partyTime(p) {
    partyOn = !!p; card.classList.toggle("beat", partyOn); party.classList.toggle("on", partyOn);
    if (!p) { pose(""); return; }
    const kid = () => TC.artImg(p.img, "", p.zh), i = p.say.toLowerCase().lastIndexOf(p.w);
    const say = TC.h("div", { class: "say" }, ...(i < 0 ? [p.say] : [p.say.slice(0, i), TC.h("b", {}, p.say.slice(i, i + p.w.length)), p.say.slice(i + p.w.length)]), TC.h("span", { class: "zh" }, `大家一起摸摸${p.zh}！`));
    party.innerHTML = ""; party.append(kid(), kid(), say, kid(), kid());
    pose(MOVE[p.w] || "dance");
  }
  function clearRound() { partyTime(null); djTime(false); card.classList.remove("on"); hit.classList.remove("pulse"); lane.querySelectorAll(".cmd").forEach((c) => c.remove()); }
  async function snapshot() {
    flash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600 }); TC.sfx("click");
    const cvs = document.createElement("canvas"); cvs.width = 960; cvs.height = 720; const ctx = cvs.getContext("2d");
    let ok = false;
    try {
      const st = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 } } });
      const v = TC.h("video", { playsinline: "", muted: "" }); v.srcObject = st; await v.play(); await TC.sleep(400);
      const r = Math.max(960 / v.videoWidth, 720 / v.videoHeight), w = v.videoWidth * r, hh = v.videoHeight * r;
      ctx.translate(960, 0); ctx.scale(-1, 1); ctx.drawImage(v, (960 - w) / 2, (720 - hh) / 2, w, hh); ctx.setTransform(1, 0, 0, 1, 0, 0);
      st.getTracks().forEach((t) => t.stop()); ok = true;
    } catch (e) {}
    if (!ok) { // no camera: a party card with Ollie instead of a photo
      const g = ctx.createLinearGradient(0, 0, 960, 720); g.addColorStop(0, "#ff5fa2"); g.addColorStop(1, "#9b6bff"); ctx.fillStyle = g; ctx.fillRect(0, 0, 960, 720);
      const o = new Image(); o.src = TC.art("ollie"); await new Promise((r) => { o.onload = r; o.onerror = r; setTimeout(r, 800); });
      try { ctx.drawImage(o, 330, 90, 300, 348); } catch (e) {}
      ctx.font = "700 110px Fredoka"; ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.fillText("CHEESE!", 480, 560); }
    ctx.fillStyle = "rgba(10,22,51,.55)"; ctx.fillRect(0, 640, 960, 80); ctx.fillStyle = "#ffc83d"; ctx.font = "700 40px Fredoka"; ctx.textAlign = "center";
    ctx.fillText("TUCHENG ENGLISH DAY · GATE 4 BEAT PARTY", 480, 695);
    return cvs;
  }

  TC.games.beat = {
    mount(api) { build(api); },
    idle() { stopBeat(); clearRound(); pose("dance"); combo.textContent = ""; root.querySelectorAll(".photo").forEach((p) => p.remove()); },
    async play(api) {
      const G = api.G; let streak = 0;
      const cap = (w) => w[0].toUpperCase() + w.slice(1);
      const wait = async (ms) => { const end = Date.now() + ms; while (Date.now() < end && !api.aborted) await TC.sleep(100); };
      const quit = () => { stopBeat(); clearRound(); return null; };
      root.querySelectorAll(".photo").forEach((p) => p.remove());
      clearRound(); combo.textContent = ""; startBeat();
      TC.floatText("YOU ARE THE BOSS!", 44, 30, "#ffc83d");
      await TC.speak("Go!");
      // body parts for this child: random, no repeats
      const pool = G.parts.slice(), parts = [];
      for (let n = Math.min(TC.rounds(5), pool.length); n > 0; n--) parts.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
      const N = parts.length + 1;
      for (let i = 0; i < parts.length; i++) {
        api.progress(i, N);
        const p = parts[i];
        await showPart(p, G.teacher);
        if (api.aborted) return quit();
        peak = 0; duck = true; // keep the music soft while the AI listens
        const t0 = Date.now();
        const r = await api.ask({ teacher: G.teacher, tzh: G.tzh, say: p.say, zh: p.zh, keys: p.keys || [[p.w]], word: p.w, hideKey: true });
        duck = false;
        if (api.aborted) return quit();
        hit.classList.remove("pulse");
        const fast = Date.now() - t0 < 5000, loud = peak > 0.45;
        streak = r.ok ? streak + 1 : 0;
        combo.textContent = streak > 1 ? `COMBO ×${streak}` : "";
        if (r.ok) { TC.floatText(loud ? "LOUD & PROUD!" : fast ? "PERFECT!" : "GREAT!", 44, 30, loud ? "#ff5fa2" : "#2ee6b6"); TC.confetti(loud ? 160 : 70); }
        // the boss said it → everyone touches it to the beat while the child plays the DJ pads
        TC.hideTalk(); partyTime(p); notes(loud ? 10 : 5); djTime(true);
        TC.speak(r.ok ? `${loud ? "Wow" : "Great"}! ${cap(p.w)}!` : `${cap(p.w)}!`);
        await wait(r.ok ? 4200 : 2800);
        if (api.aborted) return quit();
        clearRound();
      }
      api.progress(parts.length, N);
      const F = G.finale;
      pose("stand");
      duck = true;
      await api.ask({ teacher: F.teacher, tzh: F.zh, say: F.say, keys: F.keys, word: F.word });
      duck = false;
      if (api.aborted) return quit();
      TC.hideTalk();
      const cvs = await snapshot();
      if (api.aborted) return quit();
      const ph = TC.h("div", { class: "photo" }, cvs, TC.h("div", {}, `${api.kid.name} & friends · ${F.say}`));
      root.append(ph); TC.sfx("fanfare"); TC.confetti(200); pose("dance");
      await wait(5500);
      ph.remove(); stopBeat(); pose("");
      if (api.aborted) return null;
      api.progress(N, N);
      return { ok: true };
    }
  };
})();
