/* Station flow: scan passports → welcome → play → stamp + secret letter → next traveler */
(function () {
  "use strict";
  const { h, $, sleep } = TC;
  const qs = new URLSearchParams(location.search);
  let gate = +qs.get("gate") || +localStorage.getItem("tc_gate") || 1;
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
  $("#passportRef").textContent = "護照對應：" + G.passport;
  $("#scanOllie").innerHTML = TC.ollieSVG();
  TC.setAIPill();

  const queue = [];
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

  function renderQueue() {
    const q = $("#queue"); q.innerHTML = "";
    queue.forEach((k, i) => q.append(h("div", { class: "q-kid" },
      h("div", { class: "av", style: `background:${k.color}` }, k.name[0]),
      h("span", {}, k.name), h("span", { class: "x zh", onclick: () => { queue.splice(i, 1); renderQueue(); } }, "移除 ✕"))));
    $("#goBtn").classList.toggle("hidden", !queue.length || running);
  }
  TC.onScan((kid) => {
    TC.ac();
    if (queue.some((k) => k.id === kid.id) || (TC.kid && running && TC.kid.id === kid.id)) { TC.toast(`${kid.name} 已經在隊伍裡了`); return; }
    queue.push(kid); renderQueue(); TC.sfx("coin");
    if (running) TC.toast(`✈ ${kid.name} 已排隊，下一位！`);
    else TC.speak(`Hello, ${kid.name}!`);
  });

  function setKidChip(kid) {
    $("#kidChip").classList.remove("hidden");
    $("#kAv").textContent = kid.name[0]; $("#kAv").style.background = kid.color;
    $("#kName").textContent = kid.name;
    $("#lvlBtns").querySelectorAll("button").forEach((b) => b.classList.toggle("on", +b.dataset.l === kid.level));
  }
  $("#lvlBtns").addEventListener("click", (e) => {
    const l = +e.target.dataset.l; if (!l || !TC.kid) return;
    TC.kid.level = l; setKidChip(TC.kid); TC.toast("難度：" + ["", "初級 Basic", "中級 Intermediate", "高級 Advanced"][l] + "（下一題生效）");
  });

  async function runQueue() {
    if (running || !queue.length) return;
    running = true; renderQueue();
    await TC.Mic.init();
    $("#scan").classList.add("hidden");
    while (queue.length) {
      const kid = queue.shift(); renderQueue();
      await playKid(kid);
      if (api.aborted) break;
    }
    api.aborted = false; running = false; TC.kid = null;
    $("#kidChip").classList.add("hidden"); $("#pips").innerHTML = "";
    $("#scan").classList.remove("hidden"); renderQueue();
    game.idle && game.idle(api);
  }

  async function playKid(kid) {
    TC.kid = kid; api.aborted = false;
    TC.stats = { lines: 0, stars: 0, turns: 0, lastBlob: null };
    setKidChip(kid);
    const ov = h("div", { class: "overlay welcome" },
      h("div", { style: "width:14rem;height:16rem", html: TC.ollieSVG("cheer") }),
      h("h2", {}, `Welcome, ${kid.name}!`),
      h("p", {}, `Gate ${gate} · ${G.city} · `, h("span", { class: "zh" }, ["", "初級", "中級", "高級"][kid.level] + " 挑戰")));
    document.body.append(ov); TC.sfx("fanfare"); TC.confetti(80);
    await TC.speak(`Welcome to ${G.city}, ${kid.name}!`);
    await sleep(600); ov.remove();
    TC.log({ type: "start" });
    let res = null;
    try { res = await game.play(api); } catch (e) { console.error(e); TC.toast("遊戲發生錯誤，老師可按 Esc 重來"); }
    TC.hideTalk();
    if (api.aborted) return;
    // 🧩 Sentence Builder with a passport sentence (skipped in quick mode)
    if (!TC.cfg.rounds) {
      const pool = (TC_CONTENT.sentences[gate] || []).filter((x) => { const n = x.s.split(/\s+/).length; return kid.level === 1 ? n <= 4 : kid.level === 2 ? n <= 5 : n >= 4; });
      const pz = pool[(Math.random() * pool.length) | 0];
      if (pz) await TC.sentencePuzzle(pz.s, pz.zh, kid.level === 3 ? pz.keys : pz.keys.slice(0, 1), api);
      if (api.aborted) return;
    }
    // 🛂 Passport Code: look the number up in the paper passport → secret letter
    await TC.passportCode(LETTER, api);
    if (api.aborted) return;
    await showResult(kid, res || {});
  }

  async function showResult(kid, res) {
    const turns = Math.max(1, TC.stats.turns);
    const stars = Math.max(1, Math.min(3, Math.round(TC.stats.stars / turns)));
    const today = new Date();
    const date = `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}`;
    const boxes = h("div", { class: "boxes" }, ...SECRET.split("").map((c, i) => h("span", { class: i === gate - 1 ? "me" : "" }, i === gate - 1 ? c : i + 1 + "")));
    const letter = h("div", { class: "code-letter roll" }, "?");
    const replay = h("button", { class: "big-btn", onclick: () => playBlob() }, "🔊 ", h("span", { class: "zh" }, `聽 ${kid.name} 說英文`));
    const next = h("button", { class: "big-btn go" }, queue.length ? `NEXT: ${queue[0].name} ▶` : "DONE ✓");
    const ov = h("div", { class: "overlay" },
      h("div", { class: "stamp-wrap" }, h("div", { class: "stamp" }, h("div", { class: "holo" }), h("div", { class: "s1" }, "TUCHENG"), h("div", { class: "s2" }, G.city.toUpperCase()), h("div", { class: "s3" }, `GATE ${gate} · ${date}`), h("div", { class: "s3" }, `✈ ${kid.name}`))),
      h("div", { class: "stars" }, "★".repeat(stars) + "☆".repeat(3 - stars)),
      h("div", { class: "code-reveal" }, h("span", { class: "zh" }, "秘密代碼 Secret code"), letter, boxes),
      h("div", { class: "zh", style: "font-size:1.8rem" }, `把字母寫在護照卡的第 ${gate} 格！ Write it in box ${gate}!`),
      h("div", { class: "res-actions" }, replay, next));
    document.body.append(ov);
    TC.sfx("stamp"); TC.ollie("cheer");
    // rolling decoder
    const AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < 8; i++) { letter.textContent = AZ[(Math.random() * 26) | 0]; TC.sfx("tick"); await sleep(60 + i * 8); }
    letter.classList.remove("roll"); letter.textContent = LETTER; TC.sfx("levelup"); TC.confetti(200);
    TC.log({ type: "complete", stars, letter: LETTER, lines: TC.stats.lines });
    await sleep(500);
    await TC.speak(`Great job, ${kid.name}! Your secret letter is ${LETTER}.`);
    await sleep(300);
    function playBlob() {
      if (!TC.stats.lastBlob) { TC.toast("這台沒有錄音（可在設定開啟）"); return Promise.resolve(); }
      return new Promise((r) => { const a = new Audio(URL.createObjectURL(TC.stats.lastBlob)); a.volume = 1; a.onended = r; a.onerror = r; a.play().catch(r); });
    }
    if (TC.stats.lastBlob) { TC.floatText(`🎤 ${kid.name}!`, 50, 30, "#2ee6b6"); await playBlob(); }
    await new Promise((r) => { resultOpen = r; next.onclick = r; });
    resultOpen = null; ov.remove(); TC.ollie("idle");
  }

  /* buttons + keys */
  $("#goBtn").onclick = runQueue;
  $("#camBtn").onclick = () => { TC.ac(); TC.cameraScan(); };
  $("#manBtn").onclick = () => { TC.ac(); TC.manualPick(); };
  $("#setBtn").onclick = () => TC.openSettings();
  $("#okBtn").onclick = () => TC.teacherOK();
  $("#hearBtn").onclick = () => TC.hearModel();
  $("#skipBtn").onclick = () => TC.skipTurn();
  document.addEventListener("pointerdown", () => TC.ac(), { once: true });
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  TC.onKey = (e, burst) => {
    if (burst || e.repeat) return;
    const k = e.key;
    if (k === "Enter" || k === " ") {
      e.preventDefault();
      if (resultOpen) resultOpen();
      else if (!running && queue.length) runQueue();
      else TC.teacherOK();
    } else if (k === "h" || k === "H") TC.hearModel();
    else if (k === "n" || k === "N" || k === "ArrowRight") TC.skipTurn();
    else if (k === "Escape") { if (running) { api.aborted = true; TC.skipTurn(); TC.ASR.stop(); document.querySelectorAll(".overlay,.pz,.actbtn,.lineup").forEach((o) => o.remove()); if (TC.pending) { const p = TC.pending; TC.pending = null; p(); } if (resultOpen) resultOpen(); } }
    else if ((k === "s" || k === "S") && !running) TC.openSettings();
    else if ((k === "c" || k === "C") && !running) TC.cameraScan();
    else if ((k === "m" || k === "M") && !running) TC.manualPick();
  };
  game.idle && game.idle(api);
})();
