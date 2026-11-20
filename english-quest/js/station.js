/* Station flow: the teacher presses START → welcome → play → scratch card (10/20/30 points) → stamp + secret letter → back to START.
   No passport (children come empty-handed) and no names: one child plays at a time, the teacher hands out a points sticker. */
(function () {
  "use strict";
  const { h, $, sleep } = TC;
  const qs = new URLSearchParams(location.search);
  const hashGate = (location.hash.match(/gate-?(\d)/) || [])[1]; // e.g. station.html#gate-3 (hosts that drop ?query)
  let gate = +qs.get("gate") || +hashGate || +(() => { try { return localStorage.getItem("tc_gate"); } catch (e) { return 0; } })() || 1;
  if (!(gate >= 1 && gate <= 6)) gate = 1;
  try { localStorage.setItem("tc_gate", gate); } catch (e) {}
  TC.gate = gate;
  const G = TC_CONTENT.gates[gate];
  const game = TC.games[G.key];
  const SECRET = TC_CONTENT.secret.toUpperCase();
  const LETTER = SECRET[gate - 1];
  document.documentElement.style.setProperty("--gate", G.color);
  document.title = `Gate ${gate} · ${G.title}`;

  /* HUD + attract screen */
  $("#gNum").textContent = gate;
  $("#gTitle").textContent = G.title;
  $("#gSub").innerHTML = `<span class="zh">${G.zh}</span> · ${G.city}`;
  $("#scanTitle").textContent = G.title;
  $("#scanSub").innerHTML = `Gate ${gate} · ${G.city} ✈ ${G.zh}`;
  $("#scanGenre").textContent = G.genre;
  { const pr = $("#passportRef"); if (pr) pr.remove(); } // 115.11.20: children do not bring passports — no passport clues on screen
  $("#scanOllie").innerHTML = TC.ollieSVG();
  // floating 3D items from this gate's content drift behind the attract screen
  // each game lists its own drifting pictures (game.startArt); these generic ones are the fallback
  const ENGINE_ART = { rescue: ["star", "trophy", "medal"], talk: ["mic", "star", "trophy"], tpr: ["star", "medal", "rainbow"], monster: ["star", "gift", "mystegg"], chant: ["mic", "star", "medal"], story: ["star", "gift", "trophy"] };
  const GATE_ART = { [gate]: ((game && game.startArt) || ENGINE_ART[G.key] || []).filter((n) => TC.ART && TC.ART[n]) };
  const floaty = h("div", { class: "floaty" });
  (GATE_ART[gate] || []).concat(GATE_ART[gate] || []).forEach((n, i) => { const im = TC.artImg(n === "mystegg" ? "mystegg" : n); const left = (i * 37) % 92, top = 8 + ((i * 53) % 78);
    if ((left < 31 && top > 10 && top < 90) || (left > 8 && left < 84 && top > 24 && top < 66) || (left > 30 && left < 62 && top < 30) || (left > 20 && left < 72 && top > 80)) return; im.style.cssText = `left:${left}%;top:${top}%;--d:${6 + (i % 5)}s;animation-delay:${-i}s;width:${10 + (i % 3) * 3}vh;height:${10 + (i % 3) * 3}vh`; floaty.append(im); });
  $("#scan").prepend(floaty);
  floaty.querySelectorAll("img").forEach((im, i) => im.style.setProperty("--z", String(0.4 + ((i * 7) % 10) / 6)));
  // "4D" parallax: the start screen leans with the pointer (and drifts slowly on its own when nobody touches it)
  const scanEl = $("#scan"); let lastMove = 0;
  scanEl.addEventListener("pointermove", (e) => { lastMove = Date.now(); scanEl.style.setProperty("--mx", ((e.clientX / innerWidth) * 2 - 1).toFixed(3)); scanEl.style.setProperty("--my", ((e.clientY / innerHeight) * 2 - 1).toFixed(3)); });
  setInterval(() => { if (Date.now() - lastMove < 4000 || scanEl.classList.contains("hidden")) return; const t = Date.now() / 3000; scanEl.style.setProperty("--mx", (Math.sin(t) * 0.6).toFixed(3)); scanEl.style.setProperty("--my", (Math.cos(t * 0.8) * 0.4).toFixed(3)); }, 400);
  // the big cute 土城 badge of this gate (a different design at every gate) on the scan screen, and a small one in the HUD
  $("#scan").append(TC.badgeEl(gate, "scan-badge bob"));
  const hudEmb = document.querySelector(".gate-badge .emb"); if (hudEmb) hudEmb.remove();
  // a big 3D 土城 emblem stays in the top-left corner the whole time (clear on video)
  document.body.append(TC.badgeEl(gate, "big-emb"));
  // 115.11.20: tap the 土城 badge → home page (while a child is playing, ask first so a stray touch does not end the game)
  function goHome() {
    if (!running) { location.href = "index.html"; return; }
    if (document.querySelector(".home-ask")) return;
    const ask = h("div", { class: "settings home-ask" }, h("div", { class: "card", style: "text-align:center" },
      h("h2", { class: "zh" }, "回到首頁？"), h("p", { class: "zh" }, "這位孩子的遊戲會結束。"),
      h("div", { class: "row", style: "justify-content:center;gap:1.6rem" },
        h("button", { class: "save", onclick: () => { location.href = "index.html"; } }, "回首頁 Home"),
        h("button", { class: "save", style: "background:#2b3f7a", onclick: () => ask.remove() }, "繼續玩 Keep playing"))));
    document.body.append(ask);
  }
  document.querySelectorAll(".big-emb, #scan .scan-badge, .gate-badge").forEach((el) => { el.classList.add("home-link"); el.setAttribute("role", "button"); el.setAttribute("aria-label", "回首頁"); el.title = "回首頁"; el.addEventListener("click", (e) => { e.stopPropagation(); TC.ac(); TC.sfx("pop"); goHome(); }); });
  TC.setAIPill();

  let running = false, resultOpen = null;
  const api = {
    G, gate, stage: $("#stage"), aborted: false,
    get kid() { return TC.kid; },
    get level() { return TC.kid ? TC.kid.level : 2; },
    ask: (spec) => TC.ask(spec),
    progress(i, n) {
      const p = $("#pips"); p.innerHTML = "";
      for (let k = 0; k < n; k++) p.append(h("div", { class: "pip" + (k < i ? " done" : k === i ? " now" : "") }));
    }
  };
  TC.api = api;
  game.mount && game.mount(api);

  // level for the next player (初級 grades 1–2 / 中級 grades 3–6), remembered on this screen
  // 115.11.20: only "電腦問" — Ollie always reads the questions (the 老師問 choice was removed)
  TC.cfg.ollieAsks = true;
  let nextLevel = TC.cfg.level;
  function showLevel() { $("#lvlPick").querySelectorAll("button").forEach((b) => b.classList.toggle("on", +b.dataset.l === nextLevel)); }
  $("#lvlPick").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; TC.ac(); TC.sfx("pop"); nextLevel = +b.dataset.l; TC.cfg.level = nextLevel; TC.saveCfg(); showLevel(); });
  showLevel();
  let players = 0;
  function newPlayer() { players++; return { id: "p" + Date.now().toString(36), name: "", level: nextLevel, grade: [0, 2, 4, 6][nextLevel], color: ["#ffc83d", "#2ee6b6", "#4cc9ff", "#ff5fa2", "#9b6bff", "#ff9a2e"][players % 6] }; }

  function setKidChip(kid) {
    $("#kidChip").classList.remove("hidden");
    $("#kAv").textContent = "★"; $("#kAv").style.background = kid.color;
    $("#kName").textContent = "PLAYER";
    $("#lvlBtns").querySelectorAll("button").forEach((b) => b.classList.toggle("on", +b.dataset.l === kid.level));
  }
  $("#lvlBtns").addEventListener("click", (e) => {
    const l = +e.target.dataset.l; if (!l || !TC.kid) return;
    TC.kid.level = l; nextLevel = l; showLevel(); setKidChip(TC.kid); TC.toast("難度：" + TC.LEVELS[l].zh + "（" + TC.LEVELS[l].tip + "）（下一題生效）");
  });

  async function start() {
    if (running) return;
    TC.ac(); running = true; TC.sfx("whoosh");
    $("#startBtn").classList.add("pressed");
    await TC.Mic.init();
    $("#scan").classList.add("hidden"); $("#startBtn").classList.remove("pressed");
    document.body.classList.add("playing");
    await playKid(newPlayer());
    api.aborted = false; running = false; TC.kid = null;
    $("#kidChip").classList.add("hidden"); $("#pips").innerHTML = "";
    $("#scan").classList.remove("hidden"); document.body.classList.remove("playing");
    game.idle && game.idle(api);
  }

  let kidStart = 0;
  setInterval(() => { const c = $("#clock"); if (!c) return; if (!running || !kidStart) { c.textContent = `⏱ 0:00`; c.style.color = ""; return; }
    const s = ((Date.now() - kidStart) / 1000) | 0; c.textContent = `⏱ ${(s / 60) | 0}:${String(s % 60).padStart(2, "0")}`; c.style.color = s > 300 ? "#ff8a8a" : ""; }, 1000);
  async function playKid(kid) {
    TC.kid = kid; api.aborted = false; kidStart = Date.now();
    TC.stats = { lines: 0, stars: 0, turns: 0 }; TC.lastSay = "";
    setKidChip(kid);
    const ov = h("div", { class: "overlay welcome" },
      h("div", { class: "bpass" },
        h("div", { class: "av", style: `background:radial-gradient(circle at 35% 30%,#fff,${kid.color} 55%)` }, "★"),
        h("div", {}, h("div", { class: "k" }, "BOARDING PASS · TUCHENG ENGLISH DAY"), h("div", { class: "nm" }, "Welcome!"),
          h("div", { class: "rt" }, `TPE ✈ ${G.city.toUpperCase()} · GATE ${gate}`), h("div", { class: "zh", style: "font-size:2rem;color:#5a6aa8" }, TC.LEVELS[kid.level].zh + " · " + G.zh)),
        TC.badgeEl(gate, "bp-badge bob")));
    document.body.append(ov); TC.sfx("fanfare"); TC.confetti(80);
    // with sync on: show how many gates this traveller has already stamped
    TC.fetchState().then((st) => {
      const k = st && st.kids && (st.kids[kid.id] || st.kids[String(+kid.id)]);
      if (!k || !ov.isConnected) return;
      const n = (k.gates || []).filter((g) => g !== gate).length;
      ov.querySelector(".bpass > div:nth-child(2)").append(h("div", { style: "font-size:2.2rem;font-weight:700;color:#e8a21a;margin-top:.4rem" }, `★ ${n} / 6 stamps · 已收集 ${n} 個印章`));
    });
    await TC.speak("Welcome!");
    await sleep(600); ov.remove();
    TC.log({ type: "start" });
    // 👋 warm-up chat with the teacher (standard mode)
    if (!TC.cfg.rounds) {
      const gr = TC_CONTENT.greetings[TC_CONTENT.greetingOrder[gate]], L = kid.level;
      const age = ["", "seven", "eight", "nine", "ten", "eleven", "twelve"][kid.grade] || "ten"; // typical age for the grade
      const fill = (t) => t.replace(/\[Name\]/g, "___").replace(/\[name\]/g, "").replace("[Age]", age[0].toUpperCase() + age.slice(1)).replace("[age]", age); // no names: the child says their own
      api.progress(-1, 0);
      await TC.ask({ teacher: gr.teacher, tzh: gr.tzh, say: fill(gr.say), zh: "先跟老師打招呼！", keys: gr.keys.map((g) => g.map(fill).filter(Boolean)), autoModel: false, noAbc: true, word: gr.word || (gr === TC_CONTENT.greetings.age ? age : "") });
      TC.hideTalk();
      TC.lastSay = ""; // the warm-up ("I'm ___.") is never the class chorus line
      if (api.aborted) return;
    }
    let res = null;
    try { res = await game.play(api); } catch (e) { console.error(e); TC.toast("遊戲發生錯誤，老師可按 Esc 重來"); }
    TC.hideTalk();
    if (api.aborted) return;
    // (115.11.20) the "everybody say it — the louder, the more fireworks" step was removed: the classrooms have no microphone
    // 🧩 Sentence Builder with one sentence of this gate (skipped in quick mode)
    if (!TC.cfg.rounds && kid.level >= 2) {
      const pool = TC_CONTENT.sentences[gate] || [];
      const pz = pool[(Math.random() * pool.length) | 0];
      if (pz) await TC.sentencePuzzle(pz.s, pz.zh, pz.keys, api);
      if (api.aborted) return;
    }
    // 🎁 Mystery Box: tap a gift box, it opens to a sentence, say it (children do not bring passports)
    await TC.mysteryBox(gate, api);
    if (api.aborted) return;
    // 🎟 scratch card: points to trade for prizes
    const pts = TC.pointsFor(kid.id, gate);
    await TC.scratchCard({ id: kid.id, name: "", gate, city: G.city, points: pts });
    if (api.aborted) return;
    TC.log({ type: "points", points: pts });
    await showResult(kid, Object.assign(res || {}, { points: pts }));
  }

  async function showResult(kid, res) {
    const turns = Math.max(1, TC.stats.turns);
    const stars = Math.max(1, Math.min(3, Math.round(TC.stats.stars / turns)));
    const today = new Date();
    const date = `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}`;
    const boxes = h("div", { class: "boxes" }, ...SECRET.split("").map((c, i) => h("span", { class: i === gate - 1 ? "me" : "" }, i === gate - 1 ? c : i + 1 + "")));
    const letter = h("div", { class: "code-letter roll" }, "?");
    const next = h("button", { class: "big-btn go" }, "DONE ✓");
    const ov = h("div", { class: "overlay" },
      h("div", { class: "stamp-wrap" }, h("div", { class: "stamp" }, h("div", { class: "holo" }), h("div", { class: "s1" }, "TUCHENG"), TC.badgeEl(gate, "art st-badge"), h("div", { class: "s2" }, G.city.toUpperCase()), h("div", { class: "s3" }, `GATE ${gate} · ${date}`))),
      h("div", { class: "stars" }, ...[0, 1, 2].map((i) => TC.artImg("star", i < stars ? "" : "off"))),
      h("div", { class: "code-reveal" }, h("span", { class: "zh" }, "秘密代碼 Secret code"), letter, boxes),
      h("div", { class: "pts-chip" }, TC.artImg("star"), h("b", {}, "+" + (res.points || 0)), h("span", { class: "zh" }, "點 points")),
      h("div", { class: "zh", style: "font-size:2.6rem;font-weight:700" }, `記住字母 ${LETTER}！闖完六關，到終點登機門排出密碼 · 老師會發 ${res.points || 0} 點貼紙給你！`),
      h("div", { class: "res-actions" }, next));
    ov.append(TC.badgeEl(gate, "res-badge bob")); // this gate's big 土城 badge beside the stamp
    document.body.append(ov);
    TC.sfx("stamp"); TC.ollie("cheer");
    // rolling decoder
    const AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < 8; i++) { letter.textContent = AZ[(Math.random() * 26) | 0]; TC.sfx("tick"); await sleep(60 + i * 8); }
    letter.classList.remove("roll"); letter.textContent = LETTER; TC.sfx("levelup"); TC.confetti(200);
    TC.log({ type: "complete", stars, letter: LETTER, lines: TC.stats.lines });
    await sleep(500);
    await TC.speak("Great!");
    await sleep(300);
    await new Promise((r) => { resultOpen = r; next.onclick = r; });
    resultOpen = null; ov.remove(); TC.ollie("idle");
  }

  /* buttons + keys */
  $("#startBtn").onclick = start;
  $("#setBtn").onclick = () => TC.openSettings();
  // 📋 teacher script for this gate, generated from the same content the game uses
  $("#helpBtn").onclick = () => {
    if (document.querySelector(".settings")) return; // one teacher dialog at a time
    const ICON = { hello: "👋 ", q: "", extra: "＋ ", last: "★ " };
    const rows = TC_SCRIPT(gate).map((r) => [ICON[r.kind] + r.t, r.say, r.word, r.zh]);
    const card = h("div", { class: "card" }, h("h2", {}, `📋 Gate ${gate} ${G.title} · 老師台詞`),
      h("p", { class: "zh" }, "主持人問左欄（電腦問模式由歐力唸），孩子只要說出「答案字」就過關（低年級只要說字母、做動作；中年級畫面顯示整句；高年級是填空）。遊戲後有「句子拼拼看」、「神秘禮物盒」和刮刮卡（孩子不用帶護照）。Enter＝說得好 · H＝示範 · N＝跳過 · Esc＝回到開始畫面"),
      h("table", { style: "width:100%;border-collapse:collapse;font-size:1.3rem" },
        h("tr", {}, ...["主持人問／指令", "畫面上的句子", "答案字（說這個字）", "中文"].map((t) => h("th", { style: "text-align:left;border-bottom:2px solid var(--line);padding:.4rem" }, t))),
        ...rows.map((r) => h("tr", {}, ...r.map((t, i) => h("td", { style: "border-bottom:1px solid var(--line);padding:.4rem;vertical-align:top" + (i === 2 ? ";font-weight:700;color:#ffd23d" : "") }, t))))),
      h("div", { class: "row" }, h("button", { class: "save", onclick: () => wrap.remove() }, "關閉 Close")));
    const wrap = h("div", { class: "settings", onclick: (e) => { if (e.target === wrap) wrap.remove(); } }, card);
    document.body.append(wrap);
  };
  $("#okBtn").onclick = () => TC.teacherOK();
  $("#hearBtn").onclick = () => TC.hearModel();
  $("#skipBtn").onclick = () => TC.skipTurn();
  document.addEventListener("pointerdown", () => TC.ac(), { once: true });
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  TC.onKey = (e, burst) => {
    if (burst || e.repeat) return;
    const k = e.key;
    // Esc first closes a teacher dialog (settings, script card, name picker) if one is open
    if (k === "Escape") { const dlg = document.querySelectorAll(".settings,.picker"); if (dlg.length) { dlg.forEach((d) => d.remove()); return; } }
    if (k === "Enter" || k === " ") {
      e.preventDefault();
      if (resultOpen) resultOpen();
      else if (!running) start();
      else TC.teacherOK();
    } else if (k === "h" || k === "H") TC.hearModel();
    else if (k === "n" || k === "N" || k === "ArrowRight") TC.skipTurn();
    else if (k === "Escape") { if (running) { api.aborted = true; TC.skipTurn(); TC.ASR.stop(); document.querySelectorAll(".overlay,.pz,.actbtn,.lineup,.chorus").forEach((o) => o.remove()); if (TC.pending) { const p = TC.pending; TC.pending = null; p(); } if (resultOpen) resultOpen(); } }
    else if ((k === "s" || k === "S") && !running) TC.openSettings();
  };
  game.idle && game.idle(api);
})();
