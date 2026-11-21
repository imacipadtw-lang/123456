/* =====================================================================
   Tucheng English Day — shared engine for every gate
   - one big START button per screen (no passport scanning), level 低／中／高年級
   - AI speech recognition (Web Speech API) + teacher override
   - human pronunciation clips (Wikimedia Commons) / labelled computer voice
   - voice recording replay, stamps, secret-code letters, optional Google Sheet sync
   ===================================================================== */
(function () {
  "use strict";
  const TC = (window.TC = window.TC || {});
  const $ = (s, r = document) => r.querySelector(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  TC.$ = $; TC.sleep = sleep;
  TC.h = function (tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const k in attrs || {}) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), attrs[k]);
      else if (k === "style") e.style.cssText = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    for (const c of kids.flat()) if (c != null) e.append(c.nodeType ? c : document.createTextNode(c));
    return e;
  };
  const h = TC.h;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  TC.esc = esc;

  /* ---------------- settings (stored on this device only) ---------------- */
  const DEF = { syncUrl: "", listen: false, /* no microphone at the venue: the host presses the tick; older saved "asr" settings are ignored on purpose */ volume: 0.9, voice: "", roster: "", hintAfter: 9, rounds: 0, ollieAsks: true, sentence: "auto", level: 1 };
  TC.cfg = Object.assign({}, DEF, safeJSON(localStorage.getItem("tc_cfg")) || {});
  TC.cfg.wordVoice = "el"; // 115.11.21: every voice is ElevenLabs (管理者要求)
  TC.cfg.ollieAsks = true; // 115.11.20: the 老師問 mode was removed — Ollie (the TV) always asks
  // 115.11.20: three levels — 1 低年級 (only the ABC letter + do the action) · 2 中年級 (whole sentence shown, read it) · 3 高年級 (fill in the blank)
  if (!TC.cfg.lv3) { TC.cfg.level = TC.cfg.level === 2 ? 3 : 2; TC.cfg.lv3 = 1; } // old 初級 (word shown) → 中年級, old 中級 (blank) → 高年級
  { const q = +(new URLSearchParams(location.search).get("lv") || 0); if (q >= 1 && q <= 3) TC.cfg.level = q; }
  if (!(TC.cfg.level >= 1 && TC.cfg.level <= 3)) TC.cfg.level = 2;
  TC.LEVELS = { 1: { zh: "低年級", tip: "1–2 年級 · 大小寫字母＋做動作" }, 2: { zh: "中年級", tip: "3–4 年級 · 看整句念出來" }, 3: { zh: "高年級", tip: "5–6 年級 · 點字填空再念" } };
  try { localStorage.setItem("tc_cfg", JSON.stringify(TC.cfg)); } catch (e) {}
  TC.saveCfg = () => { try { localStorage.setItem("tc_cfg", JSON.stringify(TC.cfg)); } catch (e) {} };
  function safeJSON(s) { try { return JSON.parse(s); } catch (e) { return null; } }
  /** rounds per child: standard, or capped in quick mode */
  TC.rounds = (d) => (TC.cfg.rounds ? Math.min(d, TC.cfg.rounds) : d);

  /* ---------------- players (kept for the Live Board colours; passport scanning was removed) ----------------
     (a new player id is made each time START is pressed)  */
  const AV_COLORS = ["#ffc83d", "#2ee6b6", "#4cc9ff", "#ff5fa2", "#9b6bff", "#ff9a2e", "#7ee36b", "#ff7a7a"];
  TC.levelFromGrade = (g) => (g <= 2 ? 1 : g <= 4 ? 2 : 3); // 1 低年級 · 2 中年級 · 3 高年級
  TC.parseKid = function (raw) {
    if (!raw) return null;
    const s = String(raw).trim();
    const m = s.match(/^TCES[-_ ]?(\d{1,3})[-_ ]?([1-6])[-_ ]?(.*)$/i);
    if (!m) return null;
    const id = m[1].padStart(2, "0"), grade = +m[2];
    let name = (m[3] || "").replace(/[._]+/g, " ").trim();
    const r = TC.roster()[id];
    if (!name && r) name = r.name;
    if (!name) name = "Traveler " + id;
    name = name.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w+/g, (w) => w);
    return mkKid(id, name, grade);
  };
  function mkKid(id, name, grade) {
    return { id, name, grade, level: TC.levelFromGrade(grade), color: AV_COLORS[(+id) % AV_COLORS.length] };
  }
  TC.mkKid = mkKid;
  TC.kidPayload = (k) => `TCES-${k.id}-${k.grade}-${k.name.replace(/\s+/g, ".")}`;
  TC.roster = function () {
    const out = {};
    String(TC.cfg.roster || "").split(/\n/).forEach((line) => {
      const p = line.split(/[,\t]| {1,}/).map((x) => x.trim()).filter(Boolean);
      if (p.length >= 2 && /^\d+$/.test(p[0])) {
        const id = p[0].padStart(2, "0");
        const g = p.find((x, i) => i > 0 && /^[1-6]$/.test(x));
        const name = p.slice(1).filter((x) => x !== g).join(" ");
        out[id] = { id, name, grade: g ? +g : 3 };
      }
    });
    return out;
  };

  /* ---------------- sound effects (synthesised, no files) ---------------- */
  let ac = null, bus = null;
  TC.ac = () => {
    if (!ac) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (C) {
        ac = new C();
        // master bus: compressor + a soft echo send so effects sound full on TV speakers
        const comp = ac.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4; comp.connect(ac.destination);
        bus = ac.createGain(); bus.gain.value = 1; bus.connect(comp);
        const d = ac.createDelay(1); d.delayTime.value = 0.16; const fb = ac.createGain(); fb.gain.value = 0.22; const wet = ac.createGain(); wet.gain.value = 0.18;
        const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3500;
        bus.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(wet); wet.connect(comp);
      }
    }
    if (ac && ac.state === "suspended") ac.resume();
    return ac;
  };
  const out = () => bus || (ac && ac.destination);
  function tone(f, t0, dur, type = "sine", vol = 0.25, f2 = null) {
    const c = TC.ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, c.currentTime + t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, c.currentTime + t0 + dur);
    const v = vol * TC.cfg.volume;
    g.gain.setValueAtTime(0.0001, c.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(v, c.currentTime + t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
    o.connect(g).connect(out()); o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.05);
  }
  function noise(t0, dur, vol = 0.3, hp = 800) {
    const c = TC.ac(); if (!c) return;
    const len = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    f.type = "highpass"; f.frequency.value = hp; g.gain.value = vol * TC.cfg.volume;
    s.buffer = b; s.connect(f).connect(g).connect(out()); s.start(c.currentTime + t0);
  }
  function sparkle(t0) { for (let i = 0; i < 6; i++) tone(2093 + Math.random() * 1500, t0 + i * 0.045, 0.12, "sine", 0.06); }
  TC.sfx = function (name) {
    switch (name) {
      case "ding": [880, 1320, 1760].forEach((f, i) => { tone(f, i * 0.06, 0.5, "sine", 0.22); tone(f * 2.01, i * 0.06, 0.25, "sine", 0.05); }); sparkle(0.12); break;
      case "sparkle": sparkle(0); break;
      case "coin": tone(988, 0, 0.08, "square", 0.15); tone(1319, 0.07, 0.25, "square", 0.15); break;
      case "pop": tone(500, 0, 0.12, "sine", 0.35, 1100); break;
      case "click": tone(1200, 0, 0.04, "square", 0.1); break;
      case "wrong": tone(300, 0, 0.18, "sawtooth", 0.15, 200); tone(220, 0.15, 0.3, "sawtooth", 0.15, 150); break;
      case "boost": noise(0, 0.9, 0.25, 400); tone(200, 0, 0.9, "sawtooth", 0.12, 900); break;
      case "whoosh": noise(0, 0.5, 0.25, 1500); break;
      case "stamp": tone(90, 0, 0.35, "sine", 0.7, 40); noise(0, 0.15, 0.4, 200); break;
      case "drum": for (let i = 0; i < 14; i++) noise(i * 0.07, 0.06, 0.18 + i * 0.01, 300); break;
      case "tick": tone(1800, 0, 0.03, "square", 0.08); break;
      case "kick": tone(150, 0, 0.18, "sine", 0.6, 45); break;
      case "snare": noise(0, 0.12, 0.25, 1200); break;
      case "hat": noise(0, 0.04, 0.12, 6000); break;
      case "fanfare": [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.35, "triangle", 0.25)); [1047, 1319, 1568].forEach((f) => tone(f, 0.5, 1.1, "triangle", 0.16)); tone(131, 0.5, 1.1, "sine", 0.35); tone(262, 0.5, 1.1, "sine", 0.18); sparkle(0.55); break;
      case "levelup": [392, 523, 659, 784, 1047].forEach((f, i) => { tone(f, i * 0.07, 0.22, "square", 0.09); tone(f, i * 0.07, 0.3, "sine", 0.12); }); sparkle(0.35); break;
      case "catch": tone(660, 0, 0.1, "square", 0.15); tone(440, 0.12, 0.1, "square", 0.15); tone(880, 0.24, 0.3, "square", 0.15); break;
    }
  };

  /* ---------------- voices: human clips first, labelled TTS otherwise ---------------- */
  TC.audioBase = "assets/audio/";
  TC.hasHuman = (w) => !!(window.TC_AUDIO && window.TC_AUDIO[String(w).toLowerCase()]);
  TC.playHuman = function (w) {
    const a = window.TC_AUDIO && window.TC_AUDIO[String(w).toLowerCase()];
    if (!a) return Promise.resolve(false);
    return new Promise((res) => {
      const au = new Audio(TC.audioBase + a.file);
      au.volume = TC.cfg.volume;
      TC.quiet(true);
      au.onended = () => { TC.quiet(false); res(true); }; au.onerror = () => { TC.quiet(false); res(false); };
      au.play().catch(() => { TC.quiet(false); res(false); });
    });
  };
  /* ----- human voice first: every English word the TV says is a real person's recording (Wikimedia Commons) -----
     A whole sentence is never glued together from single-word recordings (that loses the weak forms and the linking:
     "It's a tiger" must have the weak /ə/). A sentence is read in one go by the computer voice, labelled 電腦語音,
     unless a teacher switches that off in ⚙ (cfg.sentence "off": the teacher then says the sentences). */
  /** a clip by key: human recordings (TC_AUDIO) first, then whole-sentence AI clips (TC_AI_AUDIO, ElevenLabs, labelled AI 語音) */
  // words: the ElevenLabs voice (TC_EL_AUDIO, the same voice as the sentences) unless ⚙ asks for the Wikimedia human recordings;
  // sentences: the ElevenLabs sentence clips (TC_AI_AUDIO) unless ⚙ turns sentences off
  const clipOf = (k) => (TC.cfg.wordVoice !== "human" && (window.TC_EL_AUDIO || {})[k]) || (window.TC_AUDIO || {})[k] || (TC.cfg.sentence !== "off" && (window.TC_AI_AUDIO || {})[k]) || null;
  TC.clipOf = clipOf;
  const clipKey = (k) => clipOf(k) ? k : clipOf(k.replace(/ /g, "-")) ? k.replace(/ /g, "-") : null;
  const normTok = (w) => String(w).toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9' -]/g, "").replace(/^['-]+|['-]+$/g, "");
  /** split a line into playable pieces: [{t: text as written, clip: key in TC_AUDIO or null}] (longest phrase first: "ice cream") */
  TC.voiceTokens = function (text) {
    const words = String(text || "").replace(/\[[^\]]*\]/g, " ").split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)), out = [];
    for (let i = 0; i < words.length;) {
      let hit = null;
      for (let n = Math.min(12, words.length - i); n >= 1 && !hit; n--) { const k = clipKey(words.slice(i, i + n).map(normTok).join(" ")); if (k) hit = { t: words.slice(i, i + n).join(" "), clip: k, n }; }
      if (!hit) hit = { t: words[i], clip: null, n: 1 };
      out.push(hit); i += hit.n;
    }
    return out;
  };
  const isName = (t) => TC.kid && normTok(t) === normTok(TC.kid.name);
  const clipCache = {};
  let curClip = null; // the clip that is playing now (TC.stopModel can cut it short)
  function playClip(key) {
    const a = clipOf(key); if (!a) return Promise.resolve(false);
    return new Promise((res) => {
      const au = clipCache[key] || (clipCache[key] = new Audio(TC.audioBase + a.file));
      let fin = false; const done = (ok) => { if (!fin) { fin = true; if (curClip && curClip.au === au) curClip = null; res(ok); } };
      curClip = { au, done };
      try { au.currentTime = 0; } catch (e) {}
      au.volume = TC.cfg.volume; au.onended = () => done(true); au.onerror = () => done(false);
      const p = au.play(); if (p && p.catch) p.catch(() => done(false));
      setTimeout(() => done(false), 4000);
    });
  }
  TC.preloadClips = (words) => (words || []).forEach((w) => { const k = clipKey(normTok(w)); const a = k && clipOf(k); if (a && !clipCache[k]) { const au = new Audio(); au.preload = "auto"; au.src = TC.audioBase + a.file; clipCache[k] = au; } });
  /** The TV never glues separate word recordings into a sentence (that sounds unnatural: no weak forms, no linking).
      A line is cut at its punctuation; a piece is a human recording only when ONE recording covers the whole piece
      ("Yes!", "Tiger!", "Good morning!"). Anything longer is a sentence: see TC.speak. */
  TC.voicePieces = function (text) {
    return String(text || "").replace(/\[[^\]]*\]/g, " ").split(/[.!?…,;:]+/).map((x) => x.trim()).filter(Boolean)
      .map((seg) => { const t = TC.voiceTokens(seg); return { text: seg, clip: t.length === 1 && t[0].clip ? t[0].clip : null }; });
  };
  /** true when every piece of the line (apart from the child's name) is one human recording */
  TC.canSayHuman = (text) => { const p = TC.voicePieces(text); return p.length > 0 && p.every((x) => x.clip || isName(x.text)); };
  /** play the pieces of a line that have a recording; onPiece(piece) fires as each starts. Resolves true if anything was played. */
  TC.sayHuman = async function (text, onPiece) {
    const pieces = TC.voicePieces(text).filter((x) => x.clip); let any = false;
    TC.quiet(true);
    try { for (const pc of pieces) { onPiece && onPiece(pc); any = (await playClip(pc.clip)) || any; await sleep(140); } }
    finally { TC.quiet(false); onPiece && onPiece(null); }
    return any;
  };
  /* subtitle for what Ollie says (the words light up as they are spoken) */
  let capT = null;
  TC.caption = function (text, active = -1, toks = null, tag = "") { tag = ""; // 115.11.21: no voice-type labels (AI 語音／電腦語音) on screen
    let c = $("#cap"); if (!c) { c = h("div", { id: "cap" }); document.body.append(c); }
    clearTimeout(capT);
    if (!text) { c.classList.remove("show"); return; }
    c.innerHTML = `<img src="${TC.art ? TC.art("ollie") : ""}" alt="">` + (toks ? toks.map((t, i) => `<span class="${i === active ? "on" : ""}">${esc(t.t)}</span>`).join(" ") : `<span>${esc(text)}</span>`)
      + (tag ? `<i style="font:700 .42em/1 system-ui;font-style:normal;margin-left:.6em;padding:.25em .6em;border-radius:99px;background:rgba(255,255,255,.22);white-space:nowrap;vertical-align:middle">${esc(tag)}</i>` : false ? `<i style="font:700 .42em/1 system-ui;font-style:normal;margin-left:.6em;padding:.25em .6em;border-radius:99px;background:rgba(255,255,255,.22);white-space:nowrap;vertical-align:middle">電腦語音</i>` : "");
    c.classList.add("show");
    capT = setTimeout(() => c.classList.remove("show"), 2600 + text.length * 40);
  };
  let voices = [];
  function loadVoices() { voices = (window.speechSynthesis && speechSynthesis.getVoices()) || []; }
  if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  TC.voices = () => voices.filter((v) => /^en[-_]US/i.test(v.lang));
  /* Online voices (Edge "Natural", Chrome "Google US English") sound best but need the internet. Without a
     connection — or after one of them has failed — only voices installed on this computer are used. */
  let remoteDown = false;
  TC.pickVoice = function () {
    const local = remoteDown || navigator.onLine === false, ok = (v) => !local || v.localService !== false;
    const us = TC.voices().filter(ok);
    if (TC.cfg.voice) { const v = voices.find((x) => x.name === TC.cfg.voice); if (v && ok(v)) return v; }
    const pref = [/Aria.*Natural/i, /Jenny.*Natural/i, /Ana.*Natural/i, /Natural/i, /Google US English/i, /Samantha/i, /Zira/i];
    for (const p of pref) { const v = us.find((x) => p.test(x.name)); if (v) return v; }
    return us[0] || voices.find((v) => /^en/i.test(v.lang) && ok(v)) || null;
  };
  function ttsSpeak(text, opt = {}) {
    if (!window.speechSynthesis || !text) return Promise.resolve();
    return new Promise((res) => {
      try { speechSynthesis.cancel(); } catch (e) {}
      const u = new SpeechSynthesisUtterance(text);
      const v = TC.pickVoice(); if (v) u.voice = v;
      u.lang = "en-US"; u.rate = opt.rate || 0.9; u.pitch = opt.pitch || 1; u.volume = TC.cfg.volume;
      let done = false, started = false; const fin = () => { if (!done) { done = true; TC.quiet(false); TC.ollie && TC.ollie("idle"); res(); } };
      TC.quiet(true);
      u.onstart = () => { started = true; };
      u.onend = fin;
      u.onerror = (e) => { // an online voice with no connection: say it once more with a voice on this computer
        const err = e && e.error;
        if (!started && !opt.retry && v && v.localService === false && err !== "canceled" && err !== "interrupted") { remoteDown = true; done = true; ttsSpeak(text, Object.assign({}, opt, { retry: true })).then(res); } else fin();
      };
      setTimeout(fin, 1500 + text.length * 120);
      TC.ollie && TC.ollie("talk");
      speechSynthesis.speak(u);
    });
  }
  /** can this screen read a whole sentence aloud? (a US-English computer voice exists and the teacher has not switched it off) */
  TC.canSentence = () => TC.cfg.sentence !== "off" && !!window.speechSynthesis && !!TC.pickVoice();
  /**
   * Ollie says a line; the text always appears as a subtitle.
   *  - a line made only of whole human recordings ("Yes! Tiger!", "Good morning!") is played from those recordings;
   *  - any line with a real sentence in it ("Yes! It's a tiger.") is read in ONE go by the computer voice (natural weak
   *    forms and linking), labelled 電腦語音;
   *  - with the sentence voice off, or no English voice on this screen, only the human pieces are heard
   *    (opt.human can name what to say then) and the teacher says the sentence.
   */
  TC.speak = async function (text, opt = {}) {
    if (!text) return;
    const spoken = String(text).replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim();
    if (!TC.canSayHuman(text) && TC.canSentence()) { TC.caption(text, "tts"); return ttsSpeak(spoken, opt); }
    const line = opt.human != null && !TC.canSayHuman(text) ? opt.human : text, toks = TC.voiceTokens(text);
    const tag = TC.voicePieces(line).some((x) => x.clip && clipOf(x.clip).ai) ? "AI 語音" : "";
    TC.caption(text, -1, toks, tag);
    if (!TC.voicePieces(line).some((x) => x.clip)) { await sleep(Math.min(1600, 600 + text.length * 30)); return; }
    TC.ollie && TC.ollie("talk");
    await TC.sayHuman(line, (pc) => { if (!pc) return; const i = toks.findIndex((t) => t.clip === pc.clip); TC.caption(text, i, toks, tag); });
    TC.ollie && TC.ollie("idle");
  };
  /** after an answer: the whole model sentence, "Yes! It's a tiger." (one voice, in one go); on a screen without the sentence
      voice the human recordings "Yes! Tiger!" are heard instead and the sentence stays on screen for the teacher. */
  TC.sayAnswer = (ok, sentence, word) => { const W = String(word || ""), y = ok ? "Yes! " : ""; return TC.speak(y + (sentence || W), { human: y + W.charAt(0).toUpperCase() + W.slice(1) + "!" }); };
  /** Ollie's praise after a right answer: a random passport (5)-1..3 line — "Good job!", "Well done!", "Awesome!", "Excellent!", "That's right!", "You got it!" */
  let lastPraise = -1;
  TC.praise = function () {
    const L = (window.TC_CONTENT && TC_CONTENT.praise) || ["Good job!"]; let i; do { i = (Math.random() * L.length) | 0; } while (i === lastPraise && L.length > 1); lastPraise = i;
    return TC.speak(L[i]);
  };
  /** The host's own line (a question or a command). Spoken by the TV only in "電腦問" mode; in "老師問" mode the teacher says it. */
  TC.teacherLine = function (text) { return TC.cfg.ollieAsks ? TC.speak(text) : Promise.resolve(TC.caption(text)); };
  /** Count one finished activity as a turn with 1–3 stars (for games where the child acts instead of speaking). */
  TC.countTurn = function (stars = 3) { TC.stats.turns++; TC.stats.lines++; TC.stats.stars += stars; };
  /** Big "Give him a big hand!" banner (passport (5)-4): parents and friends clap. */
  TC.clapBanner = async function (ms = 3200) {
    const c = TC_CONTENT.clap, b = h("div", { class: "clap-banner" }, h("div", { class: "hands" }, "👏"), h("div", { class: "en" }, c.say), h("div", { class: "zh" }, c.zh + "　拍拍手！"));
    document.body.append(b); TC.sfx("fanfare"); TC.confetti(160);
    await TC.speak(c.say); await sleep(Math.max(0, ms - 1200)); b.classList.add("out"); await sleep(400); b.remove();
  };
  /** number of points on the scratch card: the number word is a human recording */
  TC.sayPoints = (n) => { const w = { 10: "ten", 20: "twenty", 30: "thirty" }[n]; /* a scratch card is 10, 20 or 30 points */ return w ? TC.speak(`${w[0].toUpperCase() + w.slice(1)} points!`, { human: w }) : Promise.resolve(); };
  /** Model the answer: first the answer word (or the whole phrase, "Good morning!") from its human recording,
      then — when the answer is a sentence — the whole sentence read in one go by the computer voice. */
  let modelRun = 0, modelOn = 0;
  /** stop Ollie's model line at once (the teacher pressed ✓ while he was still saying it) */
  TC.stopModel = function () { modelRun++; if (modelOn > 0 && curClip) { const c = curClip; try { c.au.pause(); } catch (e) {} c.done(false); } };
  TC.model = async function (sentence, word) {
    const kl = $("#kLine"), spans = kl ? [...kl.querySelectorAll(".w")] : [];
    const light = (on, words) => spans.forEach((sp) => sp.classList.toggle("saying", !!on && (words || []).some((w) => sp.dataset.n === TC.norm(w)[0])));
    const whole = TC.voicePieces(sentence), one = whole.length === 1 && whole[0].clip ? whole[0].clip : null;
    const wordKey = word && clipKey(normTok(word)), humanWord = wordKey || null; // the answer word's own clip (ElevenLabs or Wikimedia)
    const my = ++modelRun, clips = whole.map((x) => x.clip);
    if (whole.length > 1 && clips.every(Boolean)) {
      // a line of several pieces, each with its own clip ("Sorry, | I am late."): the answer word first, then the pieces in order
      modelOn++;
      try {
        if (humanWord) { light(true, [word]); TC.quiet(true); await playClip(humanWord); TC.quiet(false); light(false); if (my !== modelRun) return "stopped"; await sleep(300); if (my !== modelRun) return "stopped"; }
        showSrc("ai", clips[0]); spans.forEach((sp) => sp.classList.add("saying")); TC.quiet(true);
        for (const c of clips) { await playClip(c); if (my !== modelRun) break; await sleep(140); }
        TC.quiet(false); light(false);
      } finally { modelOn--; TC.quiet(false); }
      return "ai";
    }
    if (one && one === humanWord) { // the line IS the word ("Yes!", "Bow!"): say it once
      modelOn++; try { showSrc(clipOf(one).ai ? "aiword" : "human", one); spans.forEach((sp) => sp.classList.add("saying")); TC.quiet(true); await playClip(one); TC.quiet(false); light(false); } finally { modelOn--; }
      return "ai";
    }
    if (one && clipOf(one).ai) {
      // a whole-sentence AI clip: the answer word from its human recording first, then the sentence in one go
      modelOn++;
      try {
        if (humanWord) { showSrc(clipOf(humanWord).ai ? "aiword" : "human", humanWord); light(true, [word]); TC.quiet(true); await playClip(humanWord); TC.quiet(false); light(false); if (my !== modelRun) return "stopped"; await sleep(300); if (my !== modelRun) return "stopped"; }
        showSrc("ai", one); spans.forEach((sp) => sp.classList.add("saying")); TC.quiet(true); await playClip(one); TC.quiet(false); light(false);
      } finally { modelOn--; TC.quiet(false); }
      return humanWord ? "human+ai" : "ai";
    }
    const key = one || wordKey;
    if (key) { showSrc(clipOf(key).ai ? "aiword" : "human", key); light(true, key.split(/[ -]/)); TC.quiet(true); await playClip(key); TC.quiet(false); light(false); }
    if (!one && sentence && TC.canSentence()) { if (key) await sleep(300); showSrc("tts"); spans.forEach((sp) => sp.classList.add("saying")); await ttsSpeak(String(sentence).replace(/\[[^\]]*\]/g, " "), { rate: 0.85 }); light(false); return key ? "human+tts" : "tts"; }
    if (!key) { showSrc("none"); return "none"; }
    return "human";
  };
  function showSrc(kind, word) {
    const t = $("#srcTag"); if (!t) return;
    if (kind === "aiword") { const a = clipOf(word) || {}; t.className = "src-tag"; t.textContent = "ElevenLabs 語音"; t.title = `ElevenLabs text-to-speech (AI voice) · ${a.voice || ""}`; return; }
    if (kind === "ai") { const a = clipOf(word) || {}; t.className = "src-tag"; t.textContent = "整句：AI 語音"; t.title = `ElevenLabs text-to-speech (AI voice, not a human recording) · ${a.voice || ""}`; return; }
    if (kind === "human") {
      const a = clipOf(String(word).toLowerCase());
      t.className = "src-tag human"; t.textContent = "真人發音"; t.title = a ? `${a.file} · ${a.speaker} · ${a.licence}` : "Human recordings (Wikimedia Commons)";
    } else if (kind === "none") { t.className = "src-tag"; t.textContent = "請老師示範"; t.title = "No human recording for this line — the teacher models it"; }
    else { t.className = "src-tag"; t.textContent = "整句：電腦語音"; t.title = "The whole sentence is read by the computer voice of this screen (text-to-speech); single words are human recordings"; }
  }

  /* While the TV itself is talking, ignore what the recogniser hears (prevents the
     speakers' own model answer from counting as the child's answer). */
  let quietUntil = 0;
  TC.quiet = (on) => { quietUntil = on ? Infinity : performance.now() + 900; };
  TC.isQuiet = () => performance.now() < quietUntil;

  /* ---------------- microphone: level meter only (nothing is recorded or stored) ---------------- */
  const Mic = (TC.Mic = { stream: null, analyser: null, level: 0, ok: false });
  Mic.init = async function () {
    if (Mic.ok || Mic.released) return Mic.ok;
    try {
      Mic.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      const c = TC.ac(); const src = c.createMediaStreamSource(Mic.stream);
      Mic.analyser = c.createAnalyser(); Mic.analyser.fftSize = 1024; src.connect(Mic.analyser);
      const buf = new Float32Array(Mic.analyser.fftSize);
      (function loop() {
        Mic.analyser.getFloatTimeDomainData(buf);
        let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
        const rms = Math.sqrt(s / buf.length);
        Mic.level = Math.max(Mic.level * 0.82, Math.min(1, rms * 7));
        const m = $("#micMeter"); if (m) m.style.width = (Mic.level * 100).toFixed(0) + "%";
        const wv = $("#wave");
        if (wv && wv.offsetParent) { // live voice waveform: shows the AI is listening
          const g = wv.getContext("2d"), W = wv.width, H = wv.height; g.clearRect(0, 0, W, H);
          const grad = g.createLinearGradient(0, 0, W, 0); grad.addColorStop(0, "#2ee6b6"); grad.addColorStop(0.5, "#ffc83d"); grad.addColorStop(1, "#ff5fa2");
          g.strokeStyle = grad; g.lineWidth = 3; g.beginPath();
          for (let i = 0; i < W; i++) { const v = buf[Math.floor((i / W) * buf.length)] || 0; const y = H / 2 + Math.max(-1, Math.min(1, v * 6)) * (H / 2 - 4); i ? g.lineTo(i, y) : g.moveTo(i, y); }
          g.stroke();
        }
        requestAnimationFrame(loop);
      })();
      Mic.ok = true; return true;
    } catch (e) { console.warn("mic", e); Mic.ok = false; return false; }
  };
  Mic.release = function () {
    try { Mic.stream && Mic.stream.getTracks().forEach((t) => t.stop()); } catch (e) {}
    Mic.stream = null; Mic.released = true;
  };

  /* ---------------- AI speech recognition ---------------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const ASR = (TC.ASR = { supported: !!SR, state: SR ? "idle" : "unsupported", rec: null, want: false, handler: null });
  ASR.start = function (handler) {
    ASR.handler = handler;
    if (!SR || !TC.cfg.listen) { setAIPill(); return; }
    ASR.want = true;
    if (ASR.rec) return;
    const r = new SR();
    r.lang = "en-US"; r.continuous = true; r.interimResults = true; r.maxAlternatives = 5;
    r.onresult = (ev) => {
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const res = ev.results[i], alts = [];
        for (let j = 0; j < res.length; j++) alts.push(res[j].transcript);
        ASR.handler && ASR.handler(alts, res.isFinal);
      }
    };
    r.onerror = (e) => {
      if (e.error === "audio-capture" && Mic.stream) { // some Android panels cannot share the mic: give it to the recogniser
        Mic.release(); TC.toast("已把麥克風交給 AI 語音辨識", 3000);
      }
      if (e.error === "not-allowed" || e.error === "service-not-allowed") { ASR.state = "denied"; ASR.want = false; }
      else if (e.error === "network") ASR.state = "network";
      setAIPill();
    };
    r.onstart = () => { ASR.state = "on"; setAIPill(); };
    r.onend = () => { ASR.rec = null; if (ASR.state === "on") ASR.state = "idle"; setAIPill(); if (ASR.want) setTimeout(() => ASR.want && ASR.start(ASR.handler), ASR.state === "network" ? 2000 : 150); };
    try { r.start(); ASR.rec = r; } catch (e) { ASR.rec = null; }
  };
  ASR.stop = function () { ASR.want = false; ASR.handler = null; if (ASR.rec) try { ASR.rec.abort(); } catch (e) {} ASR.rec = null; };
  function setAIPill() {
    const p = $("#aiPill"); if (!p) return;
    p.style.display = TC.cfg.listen ? "" : "none"; // no microphone in use: no AI status at all
    const map = {
      on: ["on", "AI 正在聽 Listening"], idle: ["", "AI 待命"], unsupported: ["off", "老師判定模式（此瀏覽器無語音辨識）"],
      denied: ["off", "麥克風未授權 · 老師判定"], network: ["off", "AI 需網路 · 老師判定"]
    };
    const st = !TC.cfg.listen ? ["off", "AI 關閉 · 老師判定"] : map[ASR.state] || map.idle;
    p.className = "ai-pill " + st[0]; p.innerHTML = `<i></i>${st[1]}`;
  }
  TC.setAIPill = setAIPill;

  /* ---------------- answer matching (kid-friendly, lenient) ---------------- */
  const NUM = { 0: "zero", 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten", 11: "eleven", 12: "twelve", 20: "twenty" };
  const SOUND = { two: ["to", "too"], four: ["for", "fore"], eight: ["ate"], one: ["won"], red: ["read"], blue: ["blew"], bear: ["bare"],
    pink: ["ping"], plane: ["plain", "playing"], taxi: ["texas", "taxis"], bike: ["bite", "back"], bus: ["boss", "buzz"], cheese: ["chee", "cheers", "jeez"],
    hi: ["high"], fly: ["flies"], tiger: ["tigger"], zebra: ["zibra", "zeebra"], cake: ["kate"], cookie: ["cooky", "cookies"], sit: ["set"], clap: ["clip", "club"],
    friend: ["friends", "french"], swim: ["swimming"], climb: ["climbing", "time"], jump: ["jumping", "john"], run: ["running", "ron"], ride: ["right", "riding", "write"],
    // common near-misses for young Taiwanese learners (kept apart from other words in the same game)
    monkey: ["money", "monkeys"], rabbit: ["rabid", "robert"], turtle: ["total"], elephant: ["element"], duck: ["dock", "doc"],
    lion: ["line", "lying"], horse: ["house", "hose"], train: ["drain"], boat: ["both", "vote"], truck: ["track", "chuck"], egg: ["eggs", "ig"],
    green: ["grin"], purple: ["people"], white: ["wide", "why"], black: ["block"], stand: ["stan", "standing"], dance: ["dense", "dancing"],
    pizza: ["pisa"], lemon: ["lemons", "lemmon"], apple: ["apples", "app"], father: ["farther"], tennis: ["tenis"] };
  SOUND.tiger.push("taiga", "tigers");
  TC.norm = function (text) {
    let t = " " + String(text).toLowerCase() + " ";
    t = t.replace(/\b1st\b/g, "first").replace(/\b2nd\b/g, "second").replace(/\b3rd\b/g, "third");
    t = t.replace(/\b(\d+)\b/g, (m, d) => NUM[d] || m);
    t = t.replace(/[’`]/g, "'").replace(/\bit's\b/g, "it is").replace(/\bi'm\b/g, "i am").replace(/\blet's\b/g, "let us");
    t = t.replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ").trim();
    return t ? t.split(" ") : [];
  };
  function lev(a, b) {
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  function stem(w) { return w.replace(/'s$/, "").replace(/(ies)$/, "y").replace(/(es|s)$/, "").replace(/ing$/, ""); }
  TC.wordMatch = function (tok, target) {
    if (tok === target) return true;
    if (stem(tok) === stem(target) && stem(target).length >= 3) return true;
    if ((SOUND[target] || []).includes(tok)) return true;
    const L = target.length;
    if (L >= 5 && lev(tok, target) <= 1) return true;
    if (L >= 8 && Math.abs(tok.length - L) <= 1 && lev(tok, target) <= 2) return true;
    return false;
  };
  /** which candidate did the child say? exact/stem matches win over fuzzy ones */
  TC.pickHeard = function (text, list) {
    const toks = TC.norm(text || "");
    const exact = list.find((c) => toks.some((t) => t === c || stem(t) === stem(c)));
    return exact || list.find((c) => toks.some((t) => TC.wordMatch(t, c))) || null;
  };
  /** keys = [["bus"], ["fast","quick"]]  -> every group needs one alternative heard */
  TC.matchKeys = function (tokens, keys) {
    if (!keys || !keys.length) return tokens.length > 0;
    const joined = " " + tokens.join(" ") + " ";
    return keys.every((group) => group.some((alt) => {
      const parts = TC.norm(alt);
      if (parts.length > 1) return joined.includes(" " + parts.join(" ") + " ") || parts.every((p) => tokens.some((t) => TC.wordMatch(t, p)));
      return tokens.some((t) => TC.wordMatch(t, parts[0]));
    }));
  };
  TC.coverage = function (tokens, sentence) {
    const want = TC.norm(sentence); if (!want.length) return 0;
    let hit = 0; want.forEach((w) => { if (tokens.some((t) => TC.wordMatch(t, w))) hit++; });
    return hit / want.length;
  };

  /* ---------------- talk bar: one turn of teacher ↔ kid dialogue ---------------- */
  let turn = null, revealKey = () => {};
  TC.ask = function (spec) {
    // spec: {teacher, tzh, say, zh, keys, word, distractors:[{w, keys}], onWrong(w), onHeard(tokens)}
    if (turn) turn.finish({ ok: false, cancelled: true });
    return new Promise((resolve) => {
      const talk = $("#talk");
      $("#tLine").innerHTML = esc(spec.teacher || "") + (spec.tzh ? `<span class="t-zh">${esc(spec.tzh)}</span>` : "");
      const keyWords = new Set((spec.keys || []).flat().flatMap((k) => TC.norm(k)));
      const sayWords = String(spec.say || "").split(/\s+/).filter(Boolean);
      $("#kLine").innerHTML = sayWords.map((w, i) => {
        const n = TC.norm(w)[0] || ""; const isKey = [...keyWords].some((k) => TC.wordMatch(n, k));
        const hide = spec.hideKey && (spec.hideAlways || (TC.kid && TC.kid.level === 3)) && (spec.keys[0] || []).some((k) => TC.norm(k).some((kk) => TC.wordMatch(n, kk))); // hide only the mystery word
        return `<span class="w${isKey ? " key" : ""}${hide ? " blank" : ""}" data-n="${esc(n)}" data-t="${esc(w)}">${hide ? "?" + w.replace(/[a-z]/gi, "").slice(-1) : esc(w)}</span>`;
      }).join(" ") + (spec.zh ? `<span class="t-zh">${esc(spec.zh)}</span>` : "");
      const kw = String(spec.word || ((spec.keys || [])[0] || [])[0] || "").trim();
      // 低年級 (1–2 年級): no booklet sentence in the question bar. Two very easy steps:
      //   1. big and small letters — the first letter of an easy word is shown in one case, the child taps its partner
      //      in the other case ("H" → h, or "h" → H);  2. Ollie says the word and does its action, the child copies it.
      let lowLine = "";
      if (TC.kid && TC.kid.level === 1 && !spec.noAbc && kw && /^[a-z]/i.test(kw)) {
        const ans = kw, low = TC.lowAction ? TC.lowAction(kw) : { w: kw }, word = low.w; // easy word + its own action
        const L = word[0].toUpperCase(), l = L.toLowerCase();
        // true: "H" is shown, the child finds "h". A lone "l" looks like "I", so L and I are always shown as capitals
        const bigShown = L === "L" || L === "I" || Math.random() < 0.5;
        const show = bigShown ? L : l, want = bigShown ? l : L;
        // letters whose two cases look alike (C c, O o, S s…) are fine: the child still has to tell them from the other two
        const pool = "ABCDEFGHIJKLMNOPRSTUVWY".split("").filter((c) => c !== L && !((L === "L" || L === "I") && (c === "L" || c === "I")) && !(!bigShown && (c === "L" || c === "I")));
        const opts = [L]; while (opts.length < 3) opts.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
        for (let i = opts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [opts[i], opts[j]] = [opts[j], opts[i]]; }
        lowLine = bigShown ? "Find the small letter!" : "Find the big letter!";
        $("#tLine").innerHTML = esc(lowLine) + `<span class="t-zh">${bigShown ? "找出小寫字母" : "找出大寫字母"}</span>`;
        $("#kLine").innerHTML = `${low.props ? `<span class="abc-pic" aria-hidden="true">${low.props[0]}</span>` : ""}<span class="abc-big">${esc(show)}</span><span class="abc-arrow" aria-hidden="true">➜</span>`
          + `<span class="abc-opts">${opts.map((c) => `<button type="button" class="abc-btn" data-c="${c}" aria-label="${bigShown ? "小寫" : "大寫"} ${c}">${bigShown ? c.toLowerCase() : c}</button>`).join("")}</span>`
          + `<span class="abc-do zh">👆 ${esc(show)} 的${bigShown ? "小寫" : "大寫"}是哪一個？點點看！</span>`;
        $("#kLine").dataset.want = want;
        $("#kLine").querySelectorAll(".abc-btn").forEach((b) => b.addEventListener("click", () => {
          TC.ac();
          if (b.dataset.c === L) { if (b.classList.contains("ok")) return; b.classList.add("ok"); TC.sfx("coin"); setTimeout(() => (TC.actionBuddy ? TC.actionBuddy(ans) : Promise.resolve()).then(() => TC.teacherOK()), 450); }
          else { b.classList.remove("bad"); void b.offsetWidth; b.classList.add("bad"); TC.sfx("wrong"); }
        }));
      }
      // 高年級 (5–6 年級): the answer sentence has one blank. To keep it easy in front of guests, two words are offered:
      //   the child taps the right one, the blank fills in, and the CHILD reads the sentence out. Ollie does not read it
      //   first (the teacher's rule, 2026-11-21): he models a line only when the teacher presses 🔊 聽示範.
      const blanks = lowLine ? [] : [...$("#kLine").querySelectorAll(".w.blank")];
      if (blanks.length && TC.kid && TC.kid.level === 3 && spec.pick !== false) {
        const bare = (t) => String(t).replace(/[^A-Za-z' ]/g, "").trim();
        const right = blanks.map((b) => bare(b.dataset.t)).join(" "), cap = /^[A-Z]/.test(right);
        const pool = TC.gateWords().filter((w) => w && w.toLowerCase() !== right.toLowerCase() && !keyWords.has(w.toLowerCase()));
        let wrong = pool.length ? pool[(Math.random() * pool.length) | 0] : (right.toLowerCase() === "book" ? "door" : "book");
        if (cap) wrong = wrong.charAt(0).toUpperCase() + wrong.slice(1);
        const opts = Math.random() < 0.5 ? [right, wrong] : [wrong, right];
        const row = h("span", { class: "pick-opts", role: "group", "aria-label": "選出空格裡的字" }, h("span", { class: "pick-tip zh", "aria-hidden": "true" }, "👆"),
          ...opts.map((o) => h("button", { type: "button", class: "pick-btn", "data-ok": o === right ? "1" : "0" }, o)));
        const zhEl = $("#kLine").querySelector(".t-zh"); if (zhEl) $("#kLine").insertBefore(row, zhEl); else $("#kLine").append(row);
        row.querySelectorAll(".pick-btn").forEach((b) => b.addEventListener("click", () => {
          TC.ac();
          if (b.dataset.ok === "1") { if (b.classList.contains("ok")) return; b.classList.add("ok"); row.classList.add("done"); TC.sfx("coin"); revealKey(); }
          else { b.classList.remove("bad"); void b.offsetWidth; b.classList.add("bad"); TC.sfx("wrong"); }
        }));
      }
      $("#heard").innerHTML = "&nbsp;"; // 115.11.20: the one-line hint for child / host was removed (管理者要求)
      $("#okBtn").classList.remove("glow"); { const hb = $("#hearBtn"); if (hb) hb.classList.remove("glow"); }
      revealKey = () => $("#kLine").querySelectorAll(".w.blank").forEach((w) => { w.classList.remove("blank"); w.textContent = w.dataset.t; });
      talk.classList.add("show");
      let asked = null;
      if (lowLine) asked = TC.speak(lowLine); // 低年級: Ollie only says the letter task, not the booklet question
      else if (TC.cfg.ollieAsks && spec.teacher && !spec.silentTeacher) asked = TC.speak(spec.teacher.replace(/___/g, ""));
      // The child says the line FIRST (the teacher's rule, 2026-11-21). Ollie only asks the question; he never reads the
      // answer by himself. He models it when — and only when — the teacher presses 🔊 聽示範 (or H).
      void asked;
      const wrongSeen = new Set();
      let finished = false, hintT = null, best = 0;
      const t0 = Date.now();
      const finish = async (r) => {
        if (finished) return; finished = true; turn = null;
        TC.stopModel(); // never two voices at once: Ollie's model line stops when the teacher presses ✓
        clearTimeout(hintT); ASR.stop();
        r.ms = Date.now() - t0;
        if (r.ok) {
          r.stars = r.by === "ai" ? (best >= 0.8 ? 3 : 2) : 2;
          if (r.by === "ai") { const b = h("div", { class: "ai-badge" }, "🤖 AI 聽懂了！", h("q", {}, r.heard)); document.body.append(b); setTimeout(() => b.remove(), 1900); }
          revealKey();
          $("#kLine").querySelectorAll(".w").forEach((w) => w.classList.add("hit"));
          TC.sfx("ding");
          TC.stats.lines++; TC.stats.stars += r.stars; TC.stats.turns++; TC.lastSay = spec.say;
          TC.log({ type: "line", say: spec.say, heard: r.heard || "", by: r.by });
        }
        resolve(r);
      };
      turn = { finish, spec };
      ASR.start((alts, isFinal) => {
        if (finished || TC.isQuiet()) return;
        const tokensList = alts.map((a) => TC.norm(a));
        const shown = alts[0];
        $("#heard").innerHTML = `🤖 AI 聽到：<b>${esc(shown)}</b>`;
        // karaoke highlight
        const all = tokensList.flat();
        $("#kLine").querySelectorAll(".w").forEach((w) => { if (all.some((t) => TC.wordMatch(t, w.dataset.n))) w.classList.add("hit"); });
        spec.onHeard && spec.onHeard(all);
        for (let i = 0; i < tokensList.length; i++) {
          const toks = tokensList[i];
          best = Math.max(best, TC.coverage(toks, spec.say || ""));
          if (TC.matchKeys(toks, spec.keys)) return finish({ ok: true, by: "ai", heard: alts[i] });
        }
        if (isFinal && spec.distractors) {
          for (const d of spec.distractors) {
            if (!wrongSeen.has(d.w) && tokensList.some((toks) => TC.matchKeys(toks, d.keys || [[d.w]]))) {
              wrongSeen.add(d.w); spec.onWrong && spec.onWrong(d.w);
              if (wrongSeen.size >= 2) revealKey();
              break;
            }
          }
        }
      });
      hintT = setTimeout(() => { if (!finished) { $("#okBtn").classList.add("glow"); const hb = $("#hearBtn"); if (hb) hb.classList.add("glow"); } }, (TC.cfg.hintAfter || 9) * 1000 * (spec.hideKey ? 1.4 : 1));
    });
  };
  /** the key words of the gate on screen (the wrong choice for a 高年級 blank comes from here) */
  TC.gateWords = function () {
    const C = window.TC_CONTENT || {}, G = (C.gates || {})[TC.gate] || {}, H = (C.hunt || {})[TC.gate];
    const out = [].concat(G.scenes || [], G.qa || [], G.finale ? [G.finale] : [], G.actions || [], G.words || [], G.lines || [], G.pages || [], H ? [H] : []).map((x) => x.w).filter(Boolean);
    return [...new Set(out)];
  };
  TC.teacherOK = () => {
    if (turn) return turn.finish({ ok: true, by: "teacher", heard: "" });
    if (TC.pending) { const p = TC.pending; TC.pending = null; p(); }
  };
  /** wait for a tap/swipe (or teacher Enter, or timeout) between turns */
  TC.waitAction = (ms = 6000) => new Promise((res) => { let t; const done = () => { clearTimeout(t); if (TC.pending === done) TC.pending = null; res(); }; TC.pending = done; t = setTimeout(done, ms); });
  TC.skipTurn = () => turn && turn.finish({ ok: false, skipped: true });
  TC.hearModel = () => { if (!turn) return; revealKey(); TC.model(turn.spec.say, turn.spec.word); };
  TC.hideTalk = () => $("#talk").classList.remove("show");
  TC.stats = { lines: 0, stars: 0, turns: 0 };

  /* ---------------- little visual helpers ---------------- */
  TC.floatText = function (text, xPct = 50, yPct = 45, color = "#ffc83d") {
    const d = h("div", { class: "float-txt", style: `left:${xPct}%;top:${yPct}%;color:${color}` }, text);
    document.body.append(d); setTimeout(() => d.remove(), 1500);
  };
  TC.toast = function (text, ms = 2500) {
    const d = h("div", { class: "toast" }, text); document.body.append(d); setTimeout(() => d.remove(), ms);
  };
  const confCanvas = h("canvas", { id: "confetti" });
  let parts = [], confRun = false;
  TC.confetti = function (n = 160, colors) {
    if (!confCanvas.isConnected) document.body.append(confCanvas);
    const W = (confCanvas.width = innerWidth), H = (confCanvas.height = innerHeight);
    const cols = colors || ["#ffc83d", "#ff5fa2", "#2ee6b6", "#4cc9ff", "#9b6bff", "#ffffff"];
    for (let i = 0; i < n; i++) parts.push({ x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.45, vx: (Math.random() - 0.5) * 26, vy: -Math.random() * 26 - 8, r: 6 + Math.random() * 9, c: cols[i % cols.length], a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4, life: 1 });
    if (confRun) return; confRun = true;
    const ctx = confCanvas.getContext("2d");
    (function loop() {
      ctx.clearRect(0, 0, W, H);
      parts.forEach((p) => { p.vy += 0.7; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va; p.life -= 0.006;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 3, p.r, p.r * 0.66); ctx.restore(); });
      parts = parts.filter((p) => p.y < H + 40 && p.life > 0);
      if (parts.length) requestAnimationFrame(loop); else { confRun = false; ctx.clearRect(0, 0, W, H); }
    })();
  };

  /* ---------------- Ollie-Bot (robot owl guide from the passport) ---------------- */
  TC.ollieSVG = function (cls = "") {
    if (TC.art) return `<div class="ollie3d ${cls}"><img src="${TC.art("ollie")}" alt="Ollie-Bot" draggable="false"></div>`;
    return `<svg class="ollie ${cls}" viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg" aria-label="Ollie-Bot">
<g class="body">
 <line x1="100" y1="38" x2="100" y2="14" stroke="#c9d6ff" stroke-width="5" stroke-linecap="round"/>
 <path class="antenna-star" style="transform-origin:100px 12px" d="M100 0l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#ffc83d"/>
 <path class="wingL" d="M38 110 Q8 140 26 186 Q44 160 52 132z" fill="#6f7fd8"/>
 <path class="wingR" d="M162 110 Q192 140 174 186 Q156 160 148 132z" fill="#6f7fd8"/>
 <rect x="34" y="36" width="132" height="170" rx="62" fill="#8fa2ff"/>
 <path d="M44 52 L60 30 L76 50z M156 52 L140 30 L124 50z" fill="#8fa2ff"/>
 <circle cx="72" cy="88" r="27" fill="#fff"/><circle cx="128" cy="88" r="27" fill="#fff"/>
 <circle cx="72" cy="88" r="13" fill="#0a1633"/><circle cx="128" cy="88" r="13" fill="#0a1633"/>
 <circle cx="77" cy="83" r="5" fill="#fff"/><circle cx="133" cy="83" r="5" fill="#fff"/>
 <path class="beak" style="transform-origin:100px 108px" d="M90 106 L110 106 L100 122z" fill="#ffc83d"/>
 <rect x="62" y="132" width="76" height="52" rx="12" fill="#0a1633" stroke="#c9d6ff" stroke-width="4"/>
 <text x="100" y="167" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="26" fill="#2ee6b6">ABC</text>
 <rect x="70" y="204" width="18" height="14" rx="5" fill="#ffc83d"/><rect x="112" y="204" width="18" height="14" rx="5" fill="#ffc83d"/>
</g></svg>`;
  };
  TC.ollie = function (state) {
    document.querySelectorAll("svg.ollie,.ollie3d").forEach((o) => { o.classList.remove("talk", "cheer"); if (state === "talk" || state === "cheer") o.classList.add(state); });
    if (TC.O3) TC.O3.state(state); // the 3D Ollie moves his beak while he speaks
  };

  /* ---------------- keys (passport scanning was removed: the teacher presses START) ---------------- */
  document.addEventListener("keydown", (e) => {
    if (/INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || "")) return;
    if (/^(Shift|Control|Alt|Meta|CapsLock)/.test(e.code || "")) return;
    TC.onKey && TC.onKey(e, false);
  }, true);

  /* ---------------- event log + optional Google Sheet sync ---------------- */
  TC.gate = 0; TC.kid = null;
  TC.log = function (ev) {
    const row = Object.assign({ t: new Date().toISOString(), gate: TC.gate, kid: TC.kid ? TC.kid.id : "", name: TC.kid ? TC.kid.name : "", grade: TC.kid ? TC.kid.grade : "" }, ev);
    try {
      const log = safeJSON(localStorage.getItem("tc_log")) || []; log.push(row);
      localStorage.setItem("tc_log", JSON.stringify(log.slice(-5000)));
      if (TC.cfg.syncUrl) { const q = safeJSON(localStorage.getItem("tc_queue")) || []; q.push(row); localStorage.setItem("tc_queue", JSON.stringify(q)); flush(); }
    } catch (e) {}
  };
  let flushing = false;
  async function flush() {
    if (flushing || !TC.cfg.syncUrl) return; flushing = true;
    try {
      const q = safeJSON(localStorage.getItem("tc_queue")) || [];
      if (q.length) {
        await fetch(TC.cfg.syncUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ events: q }) });
        const now = safeJSON(localStorage.getItem("tc_queue")) || [];
        localStorage.setItem("tc_queue", JSON.stringify(now.slice(q.length)));
      }
    } catch (e) { /* offline: keep queue, retry later */ }
    flushing = false;
  }
  setInterval(flush, 15000);
  /** read the live state from the Google Sheet (null if sync is off or slow) */
  TC.fetchState = async function (ms = 2500) {
    if (!TC.cfg.syncUrl) return null;
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
    try { const u = TC.cfg.syncUrl + (TC.cfg.syncUrl.includes("?") ? "&" : "?") + "action=state&t=" + Date.now(); const r = await fetch(u, { signal: ctl.signal }); return await r.json(); }
    catch (e) { return null; } finally { clearTimeout(t); }
  };
  TC.flush = flush;
  TC.exportCSV = function () {
    const log = safeJSON(localStorage.getItem("tc_log")) || [];
    const cols = ["t", "gate", "kid", "name", "grade", "type", "say", "heard", "by", "stars", "letter"];
    const csv = "﻿" + [cols.join(",")].concat(log.map((r) => cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","))).join("\n");
    const a = h("a", { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: `tces-gate${TC.gate}-log.csv` });
    document.body.append(a); a.click(); a.remove();
  };

  /* ---------------- settings panel ---------------- */
  TC.openSettings = function () {
    if (document.querySelector(".settings")) return; // already open
    const vs = TC.voices();
    const card = h("div", { class: "card" });
    const wrap = h("div", { class: "settings" }, card);
    card.innerHTML = `<h2>⚙ 設定 Settings <small>（只存在這台電腦 · stored on this device）</small></h2>
      <label><span>關卡 Gate</span><select id="sGate">${[1, 2, 3, 4, 5, 6].map((g) => `<option value="${g}" ${g === TC.gate ? "selected" : ""}>Gate ${g} · ${TC_CONTENT.gates[g].title}</option>`).join("")}</select></label>
      <label><span>麥克風／AI 語音辨識</span><select id="sAsr"><option value="0">關（建議：現場不收音，孩子說完老師按 ✓）</option><option value="1">開（需要麥克風和網路，Chrome / Edge）</option></select></label>
      <label><span>每位孩子回合數</span><select id="sRounds"><option value="0">標準（約 3 分鐘／人）</option><option value="3">快速 3 回合（約 2 分鐘／人）</option></select></label>
      <label hidden><span>誰來問問題</span><select id="sOllie"><option value="1">電腦問：歐力用語音唸出問題</option></select></label>
      <label><span>整句怎麼唸</span><select id="sVMode"><option value="auto">整句一次唸完：有 ElevenLabs 錄音就用錄音，沒有就用電腦語音（建議）</option><option value="off">只唸單字，整句由老師親口示範</option></select></label>
      <label><span>單字的聲音</span><select id="sWord"><option value="el">ElevenLabs（和整句同一個聲音，建議）</option><option value="human">Wikimedia 真人錄音（多位不同錄音者）</option></select></label>

      <label><span>唸整句的電腦語音 Voice</span><select id="sVoice"><option value="">自動（優先 Natural 自然語音）</option>${vs.map((v) => `<option ${v.name === TC.cfg.voice ? "selected" : ""}>${esc(v.name)}</option>`).join("")}</select></label>
      <label><span>音量 Volume</span><input id="sVol" type="range" min="0.2" max="1" step="0.05" value="${TC.cfg.volume}"></label>
      <label><span>幾秒後提示（秒）</span><input id="sHint" type="text" value="${TC.cfg.hintAfter}" style="max-width:6rem"></label>
      <label><span>同步網址 Google Apps Script（可空白）</span><input id="sSync" type="text" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(TC.cfg.syncUrl)}"></label>
      <p><small>快捷鍵：Enter/空白鍵＝START／老師判定通過 ✓ · H＝聽示範 · N＝跳過 · Esc＝回到開始畫面</small></p>
      <div class="row"><button id="sTest">🎤 測試麥克風</button><button id="sCsv">⬇ 匯出紀錄 CSV</button><button id="sClose">取消</button><button class="save" id="sSave">儲存 Save</button></div>`;
    document.body.append(wrap);
    $("#sAsr").value = TC.cfg.listen ? "1" : "0"; $("#sRounds").value = String(TC.cfg.rounds || 0); $("#sOllie").value = TC.cfg.ollieAsks ? "1" : "0"; $("#sVMode").value = TC.cfg.sentence === "off" ? "off" : "auto"; $("#sWord").value = TC.cfg.wordVoice === "human" ? "human" : "el";
    $("#sClose").onclick = () => wrap.remove();
    $("#sCsv").onclick = () => TC.exportCSV();
    $("#sTest").onclick = async () => { const ok = await Mic.init(); TC.toast(ok ? "🎤 麥克風 OK，請說話看下方音量條" : "❌ 麥克風無法開啟"); };
    $("#sSave").onclick = () => {
      Object.assign(TC.cfg, { listen: $("#sAsr").value === "1", voice: $("#sVoice").value, volume: +$("#sVol").value, hintAfter: Math.max(3, +$("#sHint").value || 9), rounds: +$("#sRounds").value || 0, ollieAsks: true, sentence: $("#sVMode").value, wordVoice: $("#sWord").value, syncUrl: $("#sSync").value.trim() });
      TC.saveCfg(); setAIPill();
      const g = +$("#sGate").value; wrap.remove();
      if (TC.gate >= 1 && TC.gate <= 6 && g !== TC.gate) location.href = "station.html?gate=" + g + "#gate-" + g;
    };
  };
})();
