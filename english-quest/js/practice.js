/* =====================================================================
   運動會英語練習本 (practice.html) — listening and speaking practice before the sports day (the teacher, 2026-11-26)
   ---------------------------------------------------------------------
   Every line the six gates use, built from js/content.js (so the practice always matches the day), grouped as on the day:
   warm-up, gates 1–6 (with the mystery-box sentence and the word-order puzzles), and the Final Gate.
   No game: short cards. The child says the line first, then taps 🔊 to check, as on the day (the teacher's rule).
   Levels as on the day: 低年級 = big/small letter + listen-and-act word, 中年級 = the whole sentence, 高年級 = tap the
   right word for the blank. A one-minute listening check per chapter. Progress is kept in this browser for the parents.
   Sound: the games' own ElevenLabs clips (woman's and man's AI voice) through TC.sayHuman — never the computer voice:
   a line without a clip shows no 🔊 button (tools/tests/practice.js checks that none is missing).
   Pictures: ink doodles drawn here, deliberately unlike the games' pictures, so the day keeps its surprise.
   ===================================================================== */
(function () {
  "use strict";
  const C = window.TC_CONTENT, $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

  /* ---------------- doodles: ink on paper, a watercolour wash behind ---------------- */
  const at = (o) => Object.entries(o).map(([k, v]) => `${k}="${v}"`).join(" ");
  const c = (x, y, r, cls) => `<circle ${at({ cx: x, cy: y, r })}${cls ? ` class="${cls}"` : ""}/>`;
  const l = (x1, y1, x2, y2) => `<line ${at({ x1, y1, x2, y2 })}/>`;
  const p = (d, cls) => `<path d="${d}"${cls ? ` class="${cls}"` : ""}/>`;
  const r = (x, y, w, h, rx = 3) => `<rect ${at({ x, y, width: w, height: h, rx })}/>`;
  const e = (x, y, rx, ry) => `<ellipse ${at({ cx: x, cy: y, rx, ry })}/>`;
  const W = (col, x = 60, y = 54, rx = 42, ry = 32) => `<ellipse ${at({ cx: x, cy: y, rx, ry, fill: col })} filter="url(#wc)"/>`;
  const heart = (x, y, s = 1) => p(`M${x} ${y + 6 * s} c${-10 * s} ${-8 * s} ${-6 * s} ${-16 * s} 0 ${-10 * s} c${6 * s} ${-6 * s} ${10 * s} ${2 * s} 0 ${10 * s}Z`);
  const spark = (x, y, s = 5) => l(x - s, y, x + s, y) + l(x, y - s, x, y + s);
  /** a stick child: head at (x,y); arms and legs are end points from the shoulder (x,y+12) and the hip (x,y+30) */
  function kid(x, y, o = {}) {
    const A = o.a || [[-9, 12], [9, 12]], L = o.l || [[-6, 14], [6, 14]], sh = y + 12, hip = y + 30;
    let s = c(x, y, 7) + c(x - 2.4, y - 1, 1.1, "f") + c(x + 2.4, y - 1, 1.1, "f");
    s += o.sad ? p(`M${x - 3} ${y + 4} q3 -3 6 0`) : p(`M${x - 3} ${y + 2.5} q3 3 6 0`);
    s += l(x, y + 7, x, hip) + A.map(([dx, dy]) => l(x, sh, x + dx, sh + dy)).join("") + L.map(([dx, dy]) => l(x, hip, x + dx, hip + dy)).join("");
    return s;
  }
  const run = (x, y) => kid(x, y, { a: [[-10, 6], [11, -3]], l: [[-12, 10], [10, 13]] }) + l(x - 34, y + 14, x - 22, y + 14) + l(x - 38, y + 24, x - 24, y + 24) + l(x - 32, y + 34, x - 20, y + 34);
  const clock = (x, y, R) => c(x, y, R) + l(x, y, x, y - R * 0.6) + l(x, y, x + R * 0.5, y + R * 0.2) + c(x, y, 1.6, "f");
  const book = (x, y) => r(x, y, 44, 56, 4) + l(x + 8, y, x + 8, y + 56) + l(x + 16, y + 14, x + 36, y + 14) + l(x + 16, y + 22, x + 32, y + 22);
  const openBook = () => p("M60 30 Q40 22 16 28 V80 Q40 73 60 82 Q80 73 104 80 V28 Q80 22 60 30 Z") + l(60, 30, 60, 82) + l(26, 40, 50, 42) + l(26, 50, 50, 52) + l(70, 42, 94, 40) + l(70, 52, 94, 50);
  const bulb = () => p("M60 16 a22 22 0 0 1 13 40 v10 h-26 v-10 a22 22 0 0 1 13 -40 Z") + l(50, 72, 70, 72) + l(52, 79, 68, 79) + l(22, 36, 30, 38) + l(98, 36, 90, 38) + l(60, 4, 60, 9) + l(32, 14, 37, 19) + l(88, 14, 83, 19);
  const faucet = () => p("M24 30 H58 q12 0 12 12 V48") + l(42, 30, 42, 20) + l(34, 20, 50, 20) + p("M70 56 q-4 6 0 9 q4 -3 0 -9") + p("M70 72 q-4 6 0 9 q4 -3 0 -9") + c(40, 70, 6) + c(52, 80, 4) + c(92, 66, 5);
  const D = {
    wave: [W("#f6c445"), kid(56, 28, { a: [[-9, 12], [13, -14]] }) + p("M76 12 q7 5 5 12") + p("M83 7 q9 7 7 17")],
    late: [W("#f39b54"), run(52, 30) + clock(96, 24, 13)],
    knock: [W("#7fb0ea"), r(68, 14, 34, 76) + c(94, 54, 2.5, "f") + kid(36, 30, { a: [[18, 0], [-8, 12]] }) + p("M60 34 l5 -3") + p("M60 42 l6 0") + p("M60 50 l5 3")],
    restroom: [W("#5cc6b3"), r(20, 16, 80, 66, 10) + l(60, 22, 60, 76) + c(40, 32, 5) + l(40, 38, 40, 56) + l(33, 44, 47, 44) + l(40, 56, 36, 68) + l(40, 56, 44, 68) + c(80, 32, 5) + p("M80 38 L71 58 H89 Z") + l(76, 58, 76, 68) + l(84, 58, 84, 68)],
    water: [W("#7fb0ea"), p("M38 28 L45 84 H75 L82 28 Z") + p("M41 46 Q60 40 79 46") + p("M98 18 q-7 10 0 13 q7 -3 0 -13") + p("M104 42 q-5 8 0 10 q5 -2 0 -10")],
    lunchbox: [W("#f59bb7"), r(22, 44, 66, 38, 6) + r(18, 34, 74, 12, 5) + l(84, 16, 108, 58) + l(92, 14, 112, 52) + p("M98 70 q0 -10 8 -10 q8 0 8 8 q0 6 -8 8 v5") + c(106, 88, 1.6, "f")],
    hurt: [W("#ef8a7a"), p("M30 14 Q42 48 36 90") + p("M54 14 Q64 46 60 90") + r(30, 44, 32, 14, 6) + c(40, 51, 1.2, "f") + c(46, 51, 1.2, "f") + c(52, 51, 1.2, "f") + l(74, 34, 86, 26) + l(76, 50, 90, 50) + l(74, 66, 86, 74)],
    sun: [W("#f6c445", 60, 60, 44, 30), c(60, 56, 17) + [0, 30, 60, 90, 120, 150, 180].map((a) => { const t = (a * Math.PI) / 180; return l(60 - Math.cos(t) * 24, 56 - Math.sin(t) * 24, 60 - Math.cos(t) * 33, 56 - Math.sin(t) * 33); }).join("") + l(12, 84, 108, 84) + p("M53 56 q7 6 14 0")],
    smile: [W("#bfe36b"), c(60, 50, 30) + p("M47 44 q4 -6 8 0") + p("M65 44 q4 -6 8 0") + p("M46 58 q14 15 28 0") + spark(100, 20) + spark(18, 80, 4)],
    yay: [W("#7fd6a2"), kid(52, 34, { a: [[-13, -14], [13, -14]] }) + p("M84 24 l6 8 l14 -18")],
    worry: [W("#f59bb7"), kid(40, 32, { a: [[-8, 12], [24, 2]] }) + kid(78, 34, { sad: true, a: [[-8, 12], [8, 12]] }) + heart(60, 14, 0.9)],
    help: [W("#f39b54"), r(42, 46, 36, 28, 3) + l(42, 56, 78, 56) + l(12, 60, 42, 60) + l(108, 60, 78, 60) + heart(60, 24, 1.1)],
    bye: [W("#b79af0"), kid(48, 28, { a: [[-9, 12], [14, -12]] }) + r(36, 40, 10, 16, 3) + p("M70 12 q8 6 6 14") + p("M78 6 q10 8 8 18") + l(10, 92, 110, 92)],
    ball: [W("#f39b54"), r(72, 8, 38, 26, 2) + e(91, 40, 12, 3) + l(81, 41, 85, 56) + l(91, 43, 91, 58) + l(101, 41, 97, 56) + c(40, 64, 17) + l(23, 64, 57, 64) + l(40, 47, 40, 81) + p("M28 52 q12 12 0 24") + p("M52 52 q-12 12 0 24")],
    stand: [W("#7fd6a2"), kid(52, 26) + l(92, 76, 92, 26) + p("M84 34 l8 -8 l8 8")],
    sit: [W("#7fb0ea"), c(56, 26, 7) + c(53.6, 25, 1.1, "f") + c(58.4, 25, 1.1, "f") + p("M53 28.5 q3 3 6 0") + l(56, 33, 58, 56) + l(57, 40, 46, 50) + l(58, 56, 40, 58) + l(40, 58, 40, 80) + l(62, 60, 62, 84) + l(86, 60, 86, 84) + l(60, 60, 88, 60) + l(86, 60, 86, 32)],
    bow: [W("#f6c445"), c(48, 40, 7) + l(54, 44, 72, 58) + l(62, 50, 64, 68) + l(72, 58, 68, 88) + l(72, 58, 78, 88) + c(46, 41, 1, "f")],
    clap: [W("#f59bb7"), kid(50, 28, { a: [[18, -4], [18, 2]] }) + l(74, 30, 80, 26) + l(76, 40, 84, 40) + l(74, 48, 80, 52)],
    raise: [W("#7fd6a2"), kid(54, 34, { a: [[-9, 12], [4, -26]] }) + spark(68, 12, 5)],
    down: [W("#7fb0ea"), kid(50, 26, { a: [[-5, 17], [5, 17]] }) + l(90, 26, 90, 74) + p("M82 66 l8 8 l8 -8")],
    open: [W("#f6c445"), openBook()],
    close: [W("#b79af0"), book(38, 20)],
    wash: [W("#5cc6b3"), faucet()],
    rest: [W("#b79af0"), p("M54 22 a26 26 0 1 0 26 40 a20 20 0 1 1 -26 -40 Z") + p("M84 22 h10 l-10 12 h10") + p("M96 6 h7 l-7 8 h7")],
    alarm: [W("#f6c445"), clock(60, 56, 24) + c(40, 30, 7) + c(80, 30, 7) + l(46, 78, 40, 88) + l(74, 78, 80, 88) + l(20, 40, 28, 44) + l(100, 40, 92, 44) + l(18, 56, 26, 56) + l(102, 56, 94, 56)],
    window: [W("#7fb0ea"), r(26, 16, 68, 66) + l(60, 16, 60, 82) + l(26, 49, 94, 49) + p("M26 16 Q36 40 30 82") + p("M94 16 Q84 40 90 82")],
    table: [W("#f39b54"), r(14, 44, 92, 8, 2) + l(24, 52, 24, 88) + l(96, 52, 96, 88) + e(46, 40, 14, 4) + e(80, 40, 8, 4)],
    teeth: [W("#5cc6b3"), p("M38 30 q11 -9 22 0 q11 -9 22 0 q7 11 -2 27 l-4 22 q-4 5 -7 -6 l-3 -13 q-2 -5 -6 0 l-3 13 q-3 11 -7 6 l-4 -22 q-9 -16 -2 -27 Z") + spark(96, 22) + spark(24, 24, 4)],
    light: [W("#f6c445"), bulb()],
    door: [W("#f39b54"), r(38, 10, 44, 80) + c(74, 52, 3, "f") + l(30, 90, 90, 90)],
    drink: [W("#f39b54"), r(40, 32, 38, 54, 4) + l(68, 32, 76, 12) + l(76, 12, 88, 12) + l(48, 50, 70, 50) + c(59, 66, 6)],
    book: [W("#7fb0ea"), book(38, 20)],
    brush: [W("#5cc6b3"), p("M18 82 L80 34") + p("M24 88 L86 40") + l(18, 82, 24, 88) + [0, 1, 2, 3, 4].map((i) => l(80 + i * 5, 34 - i * 4 + 6, 76 + i * 5, 28 - i * 4)).join("")],
    fan: [W("#7fb0ea"), c(60, 40, 27) + p("M60 40 q-4 -18 8 -20 q8 8 -8 20") + p("M60 40 q18 2 18 14 q-10 6 -18 -14") + p("M60 40 q-14 12 -22 4 q2 -12 22 -4") + c(60, 40, 3, "f") + l(60, 67, 60, 86) + l(44, 88, 76, 88)],
    hands: [W("#f59bb7"), p("M28 86 V52 q0 -6 5 -6 V34 q0 -5 5 -5 q5 0 5 5 V48 q9 -9 13 -2 l-9 16 V86") + p("M92 86 V52 q0 -6 -5 -6 V34 q0 -5 -5 -5 q-5 0 -5 5 V48 q-9 -9 -13 -2 l9 16 V86")],
    mask: [W("#7fb0ea"), p("M30 42 Q60 32 90 42 V62 Q60 78 30 62 Z") + l(32, 50, 88, 50) + l(32, 58, 88, 58) + p("M30 44 q-14 6 0 18") + p("M90 44 q14 6 0 18")],
    nurse: [W("#ef8a7a"), r(28, 40, 64, 42, 6) + p("M48 40 v-8 h24 v8") + l(60, 50, 60, 72) + l(49, 61, 71, 61)],
    clean: [W("#7fd6a2"), r(38, 46, 44, 22, 6) + l(10, 78, 110, 78) + c(30, 40, 5) + c(92, 36, 6) + c(100, 52, 3) + spark(20, 62, 5)],
    tea: [W("#f39b54"), p("M34 48 H76 V64 q0 16 -21 16 q-21 0 -21 -16 Z") + p("M76 52 q14 0 12 11 q-2 7 -12 7") + p("M46 38 q-6 -8 0 -16") + p("M58 38 q-6 -8 0 -16")],
    hurry: [W("#f39b54"), run(62, 28)],
    idea: [W("#f6c445"), bulb()],
    ear: [W("#b79af0"), p("M64 24 q24 0 24 26 q0 14 -12 22 q-7 5 -7 13 q0 9 -9 9") + p("M70 40 q8 2 6 12 q-2 6 -8 6") + p("M40 38 q-8 12 0 24") + p("M28 30 q-14 20 0 40")],
    gift: [W("#f59bb7"), r(30, 46, 60, 40, 3) + r(26, 34, 68, 13, 3) + l(60, 34, 60, 86) + p("M60 34 q-15 -18 -20 -4 q4 7 20 4") + p("M60 34 q15 -18 20 -4 q-4 7 -20 4")],
    cards: [W("#f6c445"), `<g transform="rotate(-10 34 52)">${r(16, 34, 34, 40, 4)}</g>` + r(44, 30, 34, 40, 4) + `<g transform="rotate(10 90 52)">${r(74, 34, 34, 40, 4)}</g>` + l(22, 86, 98, 86)],
    friends: [W("#f59bb7"), kid(38, 32, { a: [[-9, 12], [20, 6]] }) + kid(82, 32, { a: [[-20, 6], [9, 12]] }) + heart(60, 12)],
    trophy: [W("#f6c445"), p("M40 20 H80 V40 q0 20 -20 20 q-20 0 -20 -20 Z") + p("M40 26 q-14 0 -12 12 q2 8 14 8") + p("M80 26 q14 0 12 12 q-2 8 -14 8") + l(60, 60, 60, 74) + r(44, 74, 32, 10, 2) + spark(98, 16) + spark(20, 14, 4)],
    nice: [W("#bfe36b"), c(60, 52, 18) + p("M52 50 q2 -3 4 0") + p("M64 50 q2 -3 4 0") + p("M52 58 q8 8 16 0") + heart(96, 20, 0.8) + heart(22, 26, 0.7)]
  };
  const dd = (id, label) => { const d = D[id] || D.smile; return `<svg class="dd" viewBox="0 0 120 100" role="img" aria-label="${esc(label || "")}"><g class="wash">${d[0]}</g><g class="ink" filter="url(#rough)">${d[1]}</g></svg>`; };

  /* ---------------- the chapters, from js/content.js ---------------- */
  // a short Chinese situation for every line (the booklet's own words are in content.js; these only set the scene)
  const SIT = {
    late: "上課鐘響完了，你才跑到教室門口。", in: "你從外面回來，教室的門關著，你想進去。", restroom: "上課上到一半，你突然想上廁所。",
    water: "跑完步好渴，想去喝水。", lunchbox: "中午要吃飯了，你發現便當沒帶來。", hurt: "下課玩的時候跌倒了，膝蓋好痛。",
    morning: "早上一進教室，歐力跟大家打招呼。", good: "歐力關心你今天過得好不好。", yes: "要開始了，歐力問大家準備好了沒。",
    okay: "你看起來不太舒服，歐力關心你。", welcome: "你幫歐力搬東西，歐力跟你說謝謝。", goodbye: "放學了，歐力跟大家說再見。",
    fun: "下課了，歐力約你去打籃球。", stand: "要上課了，大家站起來。", sit: "敬完禮，大家坐下。", bow: "站好了，向老師敬禮。",
    clap: "同學表演得很棒，大家給他拍拍手。", raise: "你知道答案，要先舉手。", down: "說完了，手放下來。", open: "要讀課文了，把書打開。",
    close: "讀完了，把書闔起來。", wash: "要吃飯了，先洗手。", wake: "午休結束了，歐力還在睡，把他叫醒！",
    water4: "口渴的時候喝它。", window: "打開它，風就吹進教室。", table: "吃飯、寫字都在它上面。", teeth: "吃完飯要刷它們。",
    lunchbox4: "裝午餐的盒子。", light: "教室暗暗的，打開它就亮了。", door: "進教室前要先敲敲它。", drink: "可以喝的飲料。",
    book: "上課要打開的。", brush: "刷牙要用它。", fan: "好熱喔，打開它就涼快了。", hands: "吃飯前要洗乾淨的。",
    mask: "感冒時戴在嘴巴上。", nurse: "受傷時，健康中心裡幫你擦藥的人。",
    "5:hands": "跟著節奏，一邊搓手一邊唸。", "5:table": "跟著節奏，一邊擦桌子一邊唸。", "5:teeth": "跟著節奏，一邊刷牙一邊唸。",
    "5:break": "跟著節奏，伸個懶腰休息一下。", "5:wake": "跟著節奏，張開眼睛伸懶腰。", "5:hurry": "跟著節奏，原地快快跑。",
    "6:wake": "故事第一頁：早上，鬧鐘響了。", "6:wash": "故事第二頁：要吃午餐了，手髒髒的。", "6:clean": "故事第三頁：吃完飯，桌上有飯粒。",
    "6:rest": "故事第四頁：午休時間到了。", "6:hurt": "故事第五頁：體育課跌倒了，歐力問你怎麼了。", "6:goodbye": "故事最後一頁：下課鐘響了。",
    hi: "每一關一開始，歐力都會先跟大家打招呼。"
  };
  const PIC = { late: "late", in: "knock", restroom: "restroom", water: "water", lunchbox: "lunchbox", hurt: "hurt", morning: "sun", good: "smile", yes: "yay", okay: "worry",
    welcome: "help", goodbye: "bye", fun: "ball", stand: "stand", sit: "sit", bow: "bow", clap: "clap", raise: "raise", down: "down", open: "open", close: "close", wash: "wash",
    rest: "rest", wake: "alarm", window: "window", table: "table", teeth: "teeth", light: "light", door: "door", drink: "drink", book: "book", brush: "brush", fan: "fan",
    hands: "hands", mask: "mask", nurse: "nurse", break: "tea", hurry: "hurry", clean: "clean", idea: "idea", listening: "ear", hi: "wave" };
  const MOVE = { "5:hands": "wash", "5:table": "clean", "5:teeth": "brush", "5:break": "tea", "5:wake": "alarm", "5:hurry": "hurry" };
  const itIs = (w) => /^(teeth|hands)$/.test(w) ? "They're " + w + "." : "It's " + (/^(water)$/.test(w) ? "" : /^[aeiou]/.test(w) ? "an " : "a ") + w + ".";

  function chapters() {
    const G = C.gates, gr = C.greetings[C.greetingOrder[1]], out = [];
    out.push({ id: "hi", g: 1, tab: "熱身", title: "見面打招呼", desc: "每一關一開始，歐力都會先跟你打招呼，你要回答他。", items: [
      { id: "hi", kind: "say", noAbc: true, no: gr.no, q: gr.teacher, qzh: gr.tzh, a: gr.say, azh: gr.zh, w: gr.word, sit: SIT.hi, pic: "wave" }] });
    const extras = (g, items) => {
      const H = C.hunt[g];
      if (H) items.push({ id: "box", kind: "say", no: H.page + "-" + H.line, extra: "🎁 神秘禮物盒", q: "What's in the box?", qzh: "盒子裡是哪一句？說說看！", a: H.text, azh: H.zh, w: H.w, sit: "過關前會打開一個禮物盒，裡面有一句話。", pic: "gift" });
      (C.sentences[g] || []).forEach((s, i) => items.push({ id: "order" + i, kind: "order", no: s.no, extra: "🧩 句子拼拼看", lv: [2, 3], q: "Say it!", qzh: "把句子排好，再唸出來！", a: s.s, azh: s.zh, w: s.keys[0][0], sit: "把字卡排成一句話。", pic: "cards" }));
      return items;
    };
    const g1 = G[1]; out.push({ id: "g1", g: 1, tab: "第 1 關", title: "第 1 關 " + g1.zh, desc: "看看教室裡發生什麼事，說出這時候該說的話。",
      items: extras(1, g1.scenes.map((x) => ({ id: x.w, kind: "say", no: x.no, q: g1.teacher, qzh: g1.tzh, a: x.say, azh: x.zh, w: x.w, sit: SIT[x.w], pic: PIC[x.w] }))) });
    const g2 = G[2]; out.push({ id: "g2", g: 2, tab: "第 2 關", title: "第 2 關 " + g2.zh, desc: "歐力是主持人，他問一句，你回答一句。",
      items: extras(2, g2.qa.concat([g2.finale]).map((x) => ({ id: x.w, kind: "say", no: x.no, q: x.t, qzh: x.tzh, a: x.say, azh: x.zh, w: x.w, sit: SIT[x.w], pic: PIC[x.w] }))) });
    const g3 = G[3]; out.push({ id: "g3", g: 3, tab: "第 3 關", title: "第 3 關 " + g3.zh, desc: "看圖上的動作，用英文叫歐力做（低年級：聽單字，跟著做動作）。",
      items: extras(3, g3.actions.map((x) => ({ id: x.w, kind: "say", follow: true, no: x.no, q: "Tell Ollie!", qzh: "用英文叫歐力做這個動作！", a: x.say, azh: x.zh, w: x.w, sit: SIT[x.w], pic: PIC[x.w] }))
        .concat([{ id: "quiet", kind: "listen", no: g3.quiet.no, q: g3.quiet.say, qzh: "", a: "", azh: g3.quiet.zh, w: g3.quiet.w, sit: "聽歐力說，做出他說的動作。", pic: "rest" },
          { id: "wake", kind: "say", follow: true, no: g3.wake.no, q: "Ollie is sleeping! Wake him up!", qzh: "歐力睡著了！用英文把他叫醒！", a: g3.wake.say, azh: g3.wake.zh, w: g3.wake.w, sit: SIT.wake, pic: "alarm" }])) });
    const g4 = G[4]; out.push({ id: "g4", g: 4, tab: "第 4 關", title: "第 4 關 " + g4.zh, desc: "看東西，說出它是什麼。注意第一個字母的聲音。",
      items: extras(4, g4.words.map((x) => { const pl = /^(teeth|hands)$/.test(x.w); return { id: x.w, kind: "say", no: x.no, q: pl ? "What are they?" : g4.teacher, qzh: pl ? "這些是什麼？" : g4.tzh, a: itIs(x.w), azh: x.zh + "（" + x.L.toUpperCase() + " 開頭）", w: x.w, sit: SIT[x.w + "4"] || SIT[x.w], pic: PIC[x.w] }; })) });
    const g5 = G[5]; out.push({ id: "g5", g: 5, tab: "第 5 關", title: "第 5 關 " + g5.zh, desc: "跟著節奏唸，一邊做動作；最後一個字要大聲說出來。",
      items: extras(5, g5.lines.map((x) => ({ id: x.w, kind: "say", no: x.no, q: "Your turn!", qzh: "換你唸！", a: x.say, azh: x.zh, w: x.w, sit: SIT["5:" + x.w], pic: MOVE["5:" + x.w] }))) });
    const g6 = G[6]; out.push({ id: "g6", g: 6, tab: "第 6 關", title: "第 6 關 " + g6.zh, desc: "校園的一天，故事的每一頁說一句。",
      items: extras(6, g6.pages.map((x) => ({ id: x.w, kind: "say", no: x.no, q: x.t || g6.teacher, qzh: x.tzh || g6.tzh, a: x.say, azh: x.zh, w: x.w, sit: SIT["6:" + x.w], pic: PIC[x.w] }))
        .concat([{ id: "ending", kind: "say", follow: true, no: g6.ending.no, q: "", qzh: "故事說完了，大家一起說：", a: g6.ending.say, azh: g6.ending.zh, w: "nice", sit: "故事說完了，全班一起說最後一句。", pic: "nice" }])) });
    out.push({ id: "final", g: 1, tab: "終點", title: "終點登機門", desc: "六關都過了！到終點排出六個字母的密碼，再說出最後一句。", items: [
      { id: "spell", kind: "spell", q: "", qzh: "六關的六個字母，排成一個英文字：", a: C.secret.toUpperCase(), azh: "朋友", w: "friend", sit: "每一關過關會拿到一個字母。", pic: "trophy" },
      { id: "friends", kind: "say", q: "Who are we? We are…", qzh: "我們是什麼？", a: C.finalLine.say, azh: "我們是好朋友！", w: "friend", sit: "密碼解開了！歐力問：我們是什麼？", pic: "friends" }] });
    out.forEach((ch) => ch.items.forEach((it, i) => { it.key = ch.id + ":" + it.id; it.ch = ch; it.pic = it.pic || "smile"; it.n = i + 1; }));
    return out;
  }
  const CH = chapters();

  /* ---------------- sound: the games' AI clips only ---------------- */
  let busy = false;
  const can = (t) => !!t && TC.canSayHuman(t);
  const vQ = (ch) => (ch.g % 2 ? "f" : "m"), vA = (ch) => (ch.g % 2 ? "m" : "f"); // as on the day: odd gates ask in the woman's voice
  async function play(text, voice, btn) {
    if (busy || !can(text)) return; busy = true; TC.ac(); if (btn) btn.classList.add("playing");
    try { await TC.sayHuman(text, null, voice); } catch (err) {} finally { busy = false; if (btn) btn.classList.remove("playing"); }
  }
  const sbtn = (label, text, voice, cls = "") => can(text) ? `<button type="button" class="btn ${cls}" data-say="${esc(text)}" data-v="${voice}">${label}</button>` : "";

  /* ---------------- state ---------------- */
  let level = +store.get("tcp_level", 2) || 2, cur = store.get("tcp_ch", "hi"), mode = "cards", hideAns = !!store.get("tcp_hide", false);
  if (!CH.some((c) => c.id === cur)) cur = "hi";
  const doneKey = () => "tcp_done_" + level;
  const done = () => store.get(doneKey(), {});
  const setDone = (k, on) => { const d = done(); if (on) d[k] = new Date().toISOString().slice(0, 10); else delete d[k]; store.set(doneKey(), d); };
  const visible = (ch) => ch.items.filter((it) => !it.lv || it.lv.includes(level));

  /* ---------------- top: levels, parents' box, tabs ---------------- */
  const LV = { 1: ["低年級", "字母＋做動作"], 2: ["中年級", "看整句念出來"], 3: ["高年級", "點字填空再念"] };
  function renderLevels() {
    $("#levels").innerHTML = [1, 2, 3].map((n) => `<button type="button" data-lv="${n}" aria-pressed="${n === level}">${LV[n][0]}<small>${LV[n][1]}</small></button>`).join("")
      + `<button type="button" id="hideBtn" aria-pressed="${hideAns}">🙈 挑戰：先遮住答案<small>點一下答案才看得到</small></button>`;
  }
  function renderParent() {
    const d = done(); let all = 0, ok = 0;
    const rows = CH.map((ch) => { const its = visible(ch), n = its.filter((it) => d[it.key]).length; all += its.length; ok += n;
      return `<div><span>${esc(ch.tab)}</span><b>${n} / ${its.length}</b><i><span style="width:${its.length ? (n / its.length) * 100 : 0}%"></span></i></div>`; }).join("");
    const last = Object.values(d).sort().pop();
    $("#parent").innerHTML = `<h2>家長看這裡 👀　${LV[level][0]}：已練熟 <span style="color:var(--green)">${ok}</span> / ${all} 句</h2>
      <ol class="howto"><li>一句約 30 秒：按 🔊 聽歐力問 → <b>孩子自己先說</b> → 按 🔊 聽答案對對看 → 會說了再按 ✓。</li>
      <li>每關最下面的「聽力小測驗」：1 分鐘 5 題，聽英文選圖。</li><li>運動會當天也是孩子先說，老師需要時才播示範，跟這裡一樣。</li></ol>
      <div class="meter">${rows}</div><div class="row"><span class="tip">${last ? "最近一次練熟：" + last : "還沒有練熟的句子，從「熱身」開始吧！"}</span>
      <button type="button" class="btn" id="resetBtn" style="margin-left:auto">清除這個年級的紀錄</button></div>`;
  }
  function renderTabs() {
    const d = done();
    $("#tabs").innerHTML = CH.map((ch) => { const its = visible(ch), all = its.length && its.every((it) => d[it.key]);
      return `<button type="button" data-ch="${ch.id}" aria-current="${ch.id === cur}">${esc(ch.tab)}${all ? '<span class="ok">✓</span>' : ""}</button>`; }).join("");
  }

  /* ---------------- one card ---------------- */
  const tok = (s) => String(s).toLowerCase().replace(/[^a-z']/g, "");
  function blanked(sentence, w) { // the sentence with the answer word as a blank (高年級)
    let hit = false;
    return sentence.split(" ").map((t) => { if (!hit && tok(t) === tok(w)) { hit = true; const tail = t.replace(/^[A-Za-z']+/, ""); return `<span class="blank" data-w="${esc(t.slice(0, t.length - tail.length))}">${esc(t.slice(0, t.length - tail.length))}</span>${esc(tail)}`; } return esc(t); }).join(" ");
  }
  function wrongWord(it) {
    const inS = new Set(it.a.split(" ").map(tok)); // never a word that is already in the sentence ("Good ___!" must not offer "good")
    const pool = shuffle(visible(it.ch).filter((x) => x.kind === "say" && x.w && !inS.has(tok(x.w))).map((x) => x.w));
    const fall = ["book", "water", "door", "hands", "table"].filter((x) => !inS.has(x));
    return pool[0] || fall[0];
  }
  function card(it) {
    const ch = it.ch, d = done(), isDone = !!d[it.key], low = TC.lowAction(it.w); let rowOpen = false;
    let body = `<div class="num">${it.extra ? esc(it.extra) : "第 " + it.n + " 題"}</div><p class="sit">${esc(it.sit || "")}</p>`;
    const qRow = (en, zh) => en ? `<div class="q"><span class="who">歐力問</span><span class="big-en">${esc(en)}</span>${sbtn("🔊", en, vQ(ch))}<small>${esc(zh || "")}</small></div>` : (zh ? `<div class="q"><small>${esc(zh)}</small></div>` : "");
    if (it.kind === "listen") {
      body += `<div class="q"><span class="who">歐力說</span>${sbtn("🔊 聽歐力說", it.q, vQ(ch), "say")}</div>
        <div class="row"><button type="button" class="btn" data-reveal="1">聽懂了嗎？看答案</button></div>
        <div class="a hide"><span class="big-en">${esc(it.q)}</span><small>${esc(it.azh)}——閉上眼睛，安靜不動！</small></div>`;
    } else if (it.kind === "spell") {
      const letters = shuffle(it.a.split(""));
      body += `<div class="q"><small>${esc(it.qzh)}</small></div><div class="tiles answer" data-spell="${esc(it.a)}"></div>
        <div class="tiles">${letters.map((ch2) => `<button type="button" class="btn word" data-letter="${ch2}">${ch2}</button>`).join("")}</div>
        <div class="act" data-after="1"><span class="big-en">${esc(it.a)}</span>${sbtn("🔊", "Friend!", vA(ch))}<span class="tip">friend＝朋友</span></div>`;
    } else if (level === 1 && it.follow) {
      // 低年級 on the day (g3-tpr.js "Ollie Says", g6-story.js ending): no letter here — Ollie says the line and everybody copies him
      body += `<div class="q"><span class="who">歐力說</span><span class="big-en">${esc(it.a)}</span>${sbtn("🔊", it.a, vQ(ch))}<small>${esc(it.azh)}</small></div>
        <div class="tip">不用找字母：聽歐力說，跟著他${it.id === "ending" ? "一起說、揮揮手" : "做：" + esc(low.zh)}</div>`;
    } else if (level === 1 && it.kind !== "order" && !it.noAbc) {
      const L = low.w[0].toUpperCase(), big = L === "L" || L === "I" || Math.random() < 0.5, show = big ? L : L.toLowerCase();
      const pool = shuffle("ABCDEFGHJKMNOPRSTUVWY".split("").filter((x) => x !== L)).slice(0, 2), opts = shuffle([L].concat(pool));
      const line = big ? "Find the small letter!" : "Find the big letter!";
      body += `<div class="q"><span class="who">歐力說</span><span class="big-en">${line}</span>${sbtn("🔊", line, vQ(ch))}<small>${big ? "找出小寫字母" : "找出大寫字母"}</small></div>
        <div class="letters"><span class="show">${show}</span><span>➜</span>${opts.map((o) => `<button type="button" class="btn" data-lt="${o === L ? 1 : 0}">${big ? o.toLowerCase() : o}</button>`).join("")}</div>
        <div class="act"><span class="big-en">${esc(low.w)}</span>${sbtn("🔊 聽單字", low.w.charAt(0).toUpperCase() + low.w.slice(1) + ".", vA(ch), "say")}<div class="tip">做動作：${esc(low.zh)}</div></div>`;
    } else if (it.kind === "order") {
      const words = it.a.split(" ");
      body += qRow(it.q, it.qzh) + `<div class="tiles answer" data-order="${esc(it.a)}"></div>
        <div class="tiles">${shuffle(words.map((w2, i) => ({ w2, i }))).map((x) => `<button type="button" class="btn word" data-tile="${x.i}">${esc(x.w2)}</button>`).join("")}</div>
        <div class="act" data-after="1"><span class="tip">排對了！先自己唸一次，再按 🔊 聽聽看：</span>${sbtn("🔊 聽答案", it.a, vA(ch), "say")}<div class="tip">${esc(it.azh)}</div></div>`;
    } else {
      const sentence = level === 3 ? blanked(it.a, it.w) : esc(it.a);
      if (level === 3) body += `<div class="steps"><span class="step">①</span> 聽歐力問 → <span class="step">②</span> 點對的字 → <span class="step">③</span> 遮起來自己說 → <span class="step">④</span> 聽答案對對看</div>`;
      body += qRow(it.q, it.qzh) + `<div class="a${hideAns ? " veil" : ""}"><span class="who">你說</span>`
        + (hideAns ? `<button type="button" class="btn" data-unveil="1">👀 我先說了，看答案</button><span class="big-en hide">${sentence}</span>` : `<span class="big-en">${sentence}</span>`)
        + `<small>${esc(it.azh)}</small></div>`;
      if (level === 3 && sentence.includes("blank")) {
        const right = (it.a.split(" ").find((t) => tok(t) === tok(it.w)) || it.w).replace(/[^A-Za-z']+$/, ""), cap = /^[A-Z]/.test(right);
        let wrong = wrongWord(it); if (cap) wrong = wrong.charAt(0).toUpperCase() + wrong.slice(1);
        body += `<div class="row"><span class="step">②</span><span class="tip">點對的字填進空格：</span>${shuffle([right, wrong]).map((o) => `<button type="button" class="btn word" data-pick="${o === right ? 1 : 0}">${esc(o)}</button>`).join("")}</div>
          <div class="row hide" data-step3="1"><span class="step">③</span><button type="button" class="btn" data-cover="1">🙈 把句子遮起來，自己說一次</button></div>`;
      }
      body += `<div class="row">${level === 3 ? '<span class="step">④</span>' : ""}${sbtn("🔊 聽答案", it.a, vA(ch), "say")}`; rowOpen = true; // ✓ goes on the same row
    }
    body += (rowOpen ? "" : `<div class="row">`) + `<button type="button" class="btn ${isDone ? "good" : ""}" data-done="${esc(it.key)}" aria-pressed="${isDone}">${isDone ? "✓ 練熟了" : "✓ 我會了"}</button></div>`;
    return `<article class="card${isDone ? " done" : ""}" data-key="${esc(it.key)}"><div class="pic">${dd(it.pic, it.azh)}</div><div>${body}</div></article>`;
  }

  /* ---------------- listening check: 5 questions, hear English, tap the picture ---------------- */
  let quiz = null;
  function quizItems(ch) { return visible(ch).filter((it) => it.kind === "say" && can(level === 1 ? TC.lowAction(it.w).w : it.a)); }
  function newQuiz(ch) { const its = shuffle(quizItems(ch)); quiz = { ch, list: its.slice(0, Math.min(5, its.length)), i: 0, score: 0, answered: false }; }
  function quizHTML() {
    const q = quiz, ch = q.ch;
    if (q.list.length < 2) return `<div class="quiz"><p>這一關的句子太少，不用小測驗。</p></div>`;
    if (q.i >= q.list.length) {
      const best = Math.max(q.score, store.get("tcp_best_" + level + "_" + ch.id, 0)); store.set("tcp_best_" + level + "_" + ch.id, best);
      return `<div class="quiz"><div class="score">答對 ${q.score} / ${q.list.length} 題 ${q.score === q.list.length ? "🎉 全對！" : ""}</div><p class="tip">最高紀錄：${best} / ${q.list.length}</p><button type="button" class="btn say" data-quiz="again">再測一次</button></div>`;
    }
    const it = q.list[q.i], said = (x) => (level === 1 ? TC.lowAction(x.w).w : x.a), others = [];
    shuffle(quizItems(ch).filter((x) => x !== it)).forEach((x) => { if (others.length < 2 && x.pic !== it.pic && said(x) !== said(it) && !others.some((o) => o.pic === x.pic || said(o) === said(x))) others.push(x); });
    const opts = shuffle([it].concat(others));
    const text = level === 1 ? TC.lowAction(it.w).w : it.a;
    if (level === 3) return `<div class="quiz"><div class="row"><b>第 ${q.i + 1} / ${q.list.length} 題</b><span class="tip">看圖、聽歐力問，選出你要回答的句子。</span></div>
      <div class="qz3"><div class="pic">${dd(it.pic, it.azh)}</div><div><p class="sit">${esc(it.sit || "")}</p>
      ${it.q ? `<div class="q"><span class="who">歐力問</span><span class="big-en">${esc(it.q)}</span>${sbtn("🔊", it.q, vQ(ch))}</div>` : ""}
      <div class="opts3">${opts.map((o) => `<button type="button" class="opt en3" data-opt="${o === it ? 1 : 0}">${esc(o.a)}</button>`).join("")}</div>
      <div class="row hide" data-after3="1">${sbtn("🔊 聽正確答案", it.a, vA(ch), "say")}<button type="button" class="btn" data-next="1">下一題 ➜</button></div></div></div></div>`;
    return `<div class="quiz"><div class="row"><b>第 ${q.i + 1} / ${q.list.length} 題</b><span class="tip">聽英文，點出對的圖。</span>${sbtn("🔊 聽英文", level === 1 ? text.charAt(0).toUpperCase() + text.slice(1) + "." : text, vA(ch), "say")}</div>
      <div class="opts">${opts.map((o) => `<button type="button" class="opt" data-opt="${o === it ? 1 : 0}">${dd(o.pic, o.azh)}<div>${esc(o.azh)}</div></button>`).join("")}</div></div>`;
  }

  /* ---------------- the page ---------------- */
  function render() {
    renderLevels(); renderParent(); renderTabs();
    const ch = CH.find((c2) => c2.id === cur);
    const head = `<div class="chap-head"><div><h2>${esc(ch.title)}</h2><p>${esc(ch.desc)}</p></div><div class="modes">
      <button type="button" class="btn ${mode === "cards" ? "say" : ""}" data-mode="cards">📒 逐句練習</button><button type="button" class="btn ${mode === "quiz" ? "say" : ""}" data-mode="quiz">👂 聽力小測驗</button></div></div>`;
    if (mode === "quiz") { if (!quiz || quiz.ch !== ch) newQuiz(ch); $("#main").innerHTML = head + quizHTML(); }
    else $("#main").innerHTML = head + `<div class="cards">${visible(ch).map(card).join("")}</div>`;
  }
  function refreshDone(key) { const art = document.querySelector(`.card[data-key="${CSS.escape(key)}"]`), on = !!done()[key];
    if (art) { art.classList.toggle("done", on); const b = art.querySelector("[data-done]"); b.classList.toggle("good", on); b.setAttribute("aria-pressed", String(on)); b.textContent = on ? "✓ 練熟了" : "✓ 我會了"; }
    renderParent(); renderTabs(); }

  document.addEventListener("click", (ev) => {
    const b = ev.target.closest("button"); if (!b) return; TC.ac();
    if (b.dataset.lv) { level = +b.dataset.lv; store.set("tcp_level", level); quiz = null; render(); return; }
    if (b.id === "hideBtn") { hideAns = !hideAns; store.set("tcp_hide", hideAns); render(); return; }
    if (b.id === "resetBtn") { if (confirm("要清除「" + LV[level][0] + "」的練習紀錄嗎？")) { store.set(doneKey(), {}); render(); } return; }
    if (b.dataset.ch) { cur = b.dataset.ch; store.set("tcp_ch", cur); quiz = null; render(); window.scrollTo({ top: $("#tabs").offsetTop - 4, behavior: "smooth" }); return; }
    if (b.dataset.mode) { mode = b.dataset.mode; quiz = null; render(); return; }
    if (b.dataset.say) { play(b.dataset.say, b.dataset.v, b); return; }
    if (b.dataset.done) { setDone(b.dataset.done, !done()[b.dataset.done]); if (done()[b.dataset.done]) TC.sfx("ding"); refreshDone(b.dataset.done); return; }
    const art = b.closest(".card");
    if (b.dataset.reveal) { art.querySelector(".a").classList.remove("hide"); b.remove(); return; }
    if (b.dataset.unveil) { b.nextElementSibling.classList.remove("hide"); b.remove(); return; }
    if (b.dataset.lt != null) { if (b.dataset.lt === "1") { b.classList.add("good"); TC.sfx("coin"); art.querySelector(".act").classList.add("on"); } else { b.classList.remove("wrong"); void b.offsetWidth; b.classList.add("wrong"); TC.sfx("wrong"); } return; }
    if (b.dataset.cover) { const en = art.querySelector(".a .big-en"); en.classList.remove("hide"); en.classList.add("covered"); const u = art.querySelector("[data-unveil]"); if (u) u.remove();
      b.outerHTML = `<button type="button" class="btn good" data-uncover="1">👀 我說完了，看答案</button>`; return; }
    if (b.dataset.uncover) { art.querySelector(".a .big-en").classList.remove("covered"); b.textContent = "👍 說完了！再按 🔊 聽聽看"; b.disabled = true; return; }
    if (b.dataset.pick != null) { if (b.dataset.pick === "1") { b.classList.add("right"); TC.sfx("coin"); art.querySelectorAll(".blank").forEach((x) => x.classList.add("on")); const s3 = art.querySelector("[data-step3]"); if (s3) s3.classList.remove("hide"); } else { b.classList.remove("wrong"); void b.offsetWidth; b.classList.add("wrong"); TC.sfx("wrong"); } return; }
    if (b.dataset.tile != null) { // word order: tap a tile to move it up; tap it in the answer row to put it back
      const ans = art.querySelector(".tiles.answer"), pool = art.querySelectorAll(".tiles")[1];
      (b.parentElement === ans ? pool : ans).append(b);
      const got = [...ans.children].map((x) => x.textContent).join(" ");
      if (got === ans.dataset.order) { ans.style.borderColor = "var(--green)"; TC.sfx("ding"); art.querySelector("[data-after]").classList.add("on"); }
      return;
    }
    if (b.dataset.letter) { const ans = art.querySelector(".tiles.answer"), want = ans.dataset.spell[ans.children.length];
      if (b.dataset.letter === want) { ans.append(b); b.disabled = true; TC.sfx("tick"); if (ans.children.length === ans.dataset.spell.length) { ans.style.borderColor = "var(--green)"; TC.sfx("levelup"); art.querySelector("[data-after]").classList.add("on"); } }
      else { b.classList.remove("wrong"); void b.offsetWidth; b.classList.add("wrong"); TC.sfx("wrong"); }
      return; }
    if (b.dataset.opt != null) { if (quiz.answered) return; quiz.answered = true;
      const ok = b.dataset.opt === "1"; if (ok) quiz.score++; TC.sfx(ok ? "coin" : "wrong");
      const box = b.closest(".opts, .opts3"); box.querySelectorAll(".opt").forEach((o) => o.classList.add(o.dataset.opt === "1" ? "right" : "no"));
      if (box.classList.contains("opts3")) { box.parentElement.querySelector("[data-after3]").classList.remove("hide"); return; }
      setTimeout(() => { quiz.i++; quiz.answered = false; render(); }, ok ? 700 : 1500); return; }
    if (b.dataset.next) { quiz.i++; quiz.answered = false; render(); return; }
    if (b.dataset.quiz) { newQuiz(CH.find((c2) => c2.id === cur)); render(); return; }
  });

  // for tools/tests/practice.js: every English line this page can play
  window.TC_PRACTICE = {
    chapters: CH,
    lines() {
      const s = new Set(["Find the small letter!", "Find the big letter!", "Friend!"]);
      CH.forEach((ch) => ch.items.forEach((it) => { if (it.q) s.add(it.q); if (it.a && it.kind !== "spell") s.add(it.a); if (it.w && it.kind === "say" && !it.noAbc) { const w = TC.lowAction(it.w).w; s.add(w.charAt(0).toUpperCase() + w.slice(1) + "."); } }));
      return [...s];
    },
    missing() { return this.lines().filter((t) => !TC.canSayHuman(t)); }
  };
  render();
})();
