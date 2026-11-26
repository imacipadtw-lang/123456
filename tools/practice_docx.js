/* The Word question bank for 低年級 and 中年級 (the teacher, 2026-11-26: for 怡伶老師's lessons, so that the children can say the
   lines in front of the parents on the day). Built from the same data as the games (js/content.js, via practice.html), and
   it describes each gate the way the game code runs it (rounds per gate, who speaks first, what 低年級 do in gate 3 …),
   so check this file again whenever a game's flow changes.
   usage: node tools/practice_docx.js <baseUrl of english-quest, e.g. http://localhost:8767> <out.docx>   (needs a static server) */
const { chromium } = require("playwright"), fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType, HeadingLevel, BorderStyle,
  LevelFormat, Header, Footer, PageNumber, PageBreak, ExternalHyperlink } = require("docx");
const [base, out] = [process.argv[2] || "http://localhost:8767", process.argv[3] || "題庫.docx"];
const LINK = "https://imacipadtw-lang.github.io/123456/english-quest/practice.html";

(async () => {
  const b = await chromium.launch(), p = await b.newPage();
  await p.goto(base + "/practice.html"); await p.waitForTimeout(800);
  const D = await p.evaluate(() => {
    const C = TC_CONTENT, low = (w) => TC.lowAction(w);
    // 🎁 Mystery Box = the gate's hunt line + its sentences (puzzles.js); 🧩 Sentence Builder = its sentences (station.js, 中／高年級)
    const pool = (g) => { const m = new Map(), H = C.hunt[g];
      const add = (text, zh, w, no, k) => { const key = text.replace(/[.!?]$/, ""); const o = m.get(key) || { text, zh, w, no, box: false, order: false }; o[k] = true; m.set(key, o); };
      if (H) add(H.text, H.zh, H.w, H.page + "-" + H.line, "box");
      (C.sentences[g] || []).forEach((s) => { add(s.s, s.zh, s.keys[0][0], s.no, "box"); add(s.s, s.zh, s.keys[0][0], s.no, "order"); });
      return [...m.values()].map((o) => Object.assign(o, { low: low(o.w).w, lowzh: low(o.w).zh })); };
    // gate 4: only letters with two or more words are played (g4-monster.js eligibleLetters); the rest are wrong-choice cards
    const n4 = {}; C.gates[4].words.forEach((w) => (n4[w.L] = (n4[w.L] || 0) + 1));
    return {
      chapters: window.TC_PRACTICE.chapters.map((ch) => ({ id: ch.id, title: ch.title, desc: ch.desc,
        items: ch.items.map((it) => { const lo = low(it.w); return { id: it.id, kind: it.kind, extra: it.extra || "", lv: it.lv || null, noAbc: !!it.noAbc, no: it.no || "", q: it.q, qzh: it.qzh, a: it.a, azh: it.azh, sit: it.sit, low: lo.w, lowzh: lo.zh }; }) })),
      pool: { 1: pool(1), 2: pool(2), 3: pool(3), 4: pool(4), 5: pool(5), 6: pool(6) },
      g4ask: C.gates[4].words.filter((w) => n4[w.L] >= 2).map((w) => w.w),
      size: { 1: C.gates[1].scenes.length, 2: C.gates[2].qa.length, 3: C.gates[3].actions.length, 5: C.gates[5].lines.length, 6: C.gates[6].pages.length },
      quiet: C.gates[3].quiet.say, wake: C.gates[3].wake.say
    };
  });
  await b.close();
  const CH = D.chapters, S = D.size;

  /* ---------- look ---------- */
  const ZH = "Microsoft JhengHei", EN = "Arial", NAVY = "1F3A6E", GOLD = "B8860B", PAGE_W = 11906, M = 1134, W = PAGE_W - 2 * M; // A4, 2 cm margins
  const t = (text, o = {}) => new TextRun({ text, font: { ascii: o.en ? EN : ZH, hAnsi: o.en ? EN : ZH, eastAsia: ZH }, size: o.size || 22, bold: o.bold, color: o.color, italics: o.it });
  const para = (runs, o = {}) => new Paragraph({ children: Array.isArray(runs) ? runs : [runs], spacing: { before: o.before || 0, after: o.after == null ? 80 : o.after, line: 300 }, alignment: o.align, keepNext: o.keepNext, numbering: o.bullet ? { reference: "dots", level: 0 } : undefined });
  const border = { style: BorderStyle.SINGLE, size: 4, color: "9AA6C8" }, borders = { top: border, bottom: border, left: border, right: border };
  const cell = (children, width, o = {}) => new TableCell({ width: { size: width, type: WidthType.DXA }, borders, margins: { top: 60, bottom: 60, left: 90, right: 90 },
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: "auto" } : undefined, children: (Array.isArray(children) ? children : [children]).map((c) => (c instanceof Paragraph ? c : para(c, { after: 20 }))) });
  const table = (cols, head, rows) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: cols,
    rows: [new TableRow({ tableHeader: true, children: head.map((hd, i) => cell(t(hd, { bold: true, size: 20, color: "FFFFFF" }), cols[i], { fill: NAVY })) })]
      .concat(rows.map((r, ri) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, cols[i], { fill: ri % 2 ? "F4F6FB" : undefined })) }))) });
  const en = (s, size = 24) => t(s, { en: true, bold: true, size });
  const zhSmall = (s) => t(s, { size: 19, color: "555555" });
  const two = (enText, zhText, size) => [para(en(enText, size), { after: 10 }), para(zhSmall(zhText || ""), { after: 10 })];
  const H1 = (s) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t(s, { size: 34, bold: true, color: NAVY })], spacing: { before: 120, after: 120 }, keepNext: true });
  const H2 = (s) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [t(s, { size: 27, bold: true, color: NAVY })], spacing: { before: 280, after: 60 }, keepNext: true });
  const note = (s) => para(t(s, { size: 20, color: "555555" }), { keepNext: true });
  const day = (s) => para([t("當天：", { size: 20, bold: true, color: GOLD }), t(s, { size: 20, color: "333333" })], { keepNext: true });
  const ref = (no) => t(no || "—", { en: true, size: 19, color: "555555" });
  const num = (n) => t(String(n), { en: true });
  const pair = (L) => para(en(L.toUpperCase() + "  ↔  " + L.toLowerCase(), 28));
  const gOf = (ch) => (/^g\d$/.test(ch.id) ? +ch.id.slice(1) : 0);

  /* what happens at each gate on the day, per level (from the game code: TC.rounds(n) picks in standard mode) */
  const DAY2 = { hi: "每一關開始時都有這一題。",
    g1: `從這 ${S[1]} 題隨機抽 5 題。`,
    g2: `第 1–${S[2]} 題隨機抽 5 題，最後一定是第 ${S[2] + 1} 題。`,
    g3: `第 1–${S[3]} 題隨機抽 5 題：孩子用英文下指令，歐力照著做。最後是午休：歐力說完第 ${S[3] + 1} 題就睡著了，孩子說第 ${S[3] + 2} 題把他叫醒。`,
    g4: `玩 3 回合。怪獸說「我只吃 /W/ 開頭的東西」，孩子從圖卡中點出 2 個這個字母開頭的東西餵牠，再回答最後吃下去的那一個是什麼。會被問到的只有下表第 1–${D.g4ask.length} 題；其他東西只當錯的圖卡出現。`,
    g5: `從這 ${S[5]} 句隨機抽 4 句。中年級：孩子先唸，然後大家跟歐力一起唸、跟著節奏跳。`,
    g6: `故事 ${S[6]} 頁依序全部出現，每頁說一句；最後歐力說 Have a nice day!，大家可以一起說。`,
    final: "六關都過了，到終點登機門。" };
  const DAY1 = { hi: "每一關開始時都有這一題（不用配對字母）。",
    g1: `從這 ${S[1]} 題隨機抽 5 題。`,
    g2: `第 1–${S[2]} 題隨機抽 5 題，最後一定是第 ${S[2] + 1} 題。`,
    g3: `低年級這一關是「歐力說」：不用配對字母。歐力說一句（例如 Stand up!）並做動作，大家跟著做。第 1–${S[3]} 題隨機抽 5 題，最後是午休：閉上眼睛不動，歐力會自己大喊 Wake up, everyone! 起床。`,
    g4: `玩 3 回合：怪獸只吃某個字母開頭的東西，孩子點圖卡餵牠，每吃一個，歐力就說出它的英文；最後一個再做字母配對和動作。會被問到的只有下表這 ${D.g4ask.length} 個。`,
    g5: `從這 ${S[5]} 句隨機抽 4 句。歐力先跟著節奏唸、大家跳舞，然後才輪到孩子：字母配對＋動作。`,
    g6: `故事 ${S[6]} 頁依序全部出現；最後歐力說 Have a nice day!，大家可以一起說、揮揮手。`,
    final: "六關都過了，到終點登機門。" };

  /* ---------- the opening page ---------- */
  const body = [];
  body.push(new Paragraph({ children: [t("運動會英語闖關　題庫", { size: 44, bold: true, color: NAVY })], spacing: { after: 60 } }));
  body.push(para(t("低年級・中年級　課堂練習用", { size: 28, bold: true, color: GOLD }), { after: 60 }));
  body.push(para(t("南投縣草屯鎮土城國民小學　運動會英語日（115 年 12 月 19 日）", { size: 21, color: "555555" }), { after: 200 }));
  body.push(H2("校長的期待"));
  body.push(para(t("運動會當天，孩子要在家長面前自己把英文唸出來。這份題庫收錄六關會出現的每一句，請在課堂上先讓孩子練熟。"), { after: 120 }));
  body.push(H2("當天怎麼進行"));
  const bullet = (runs) => body.push(para(runs, { bullet: true }));
  bullet([t("每一關一開始，歐力（大螢幕上的機器貓頭鷹）會說 "), en("Hi, everyone!", 22), t("，孩子回答 "), en("Hi, Ollie!", 22), t("。")]);
  bullet([t("孩子先說", { bold: true }), t("：歐力只問問題，不會先唸答案；關主老師需要時才按「🔊 聽示範」。課堂練習時也請讓孩子先說，說不出來再給示範。")]);
  bullet([t("中年級：", { bold: true }), t("畫面上整句都看得到，孩子看著唸出來，不用填空。")]);
  bullet([t("低年級：", { bold: true }), t("不用說句子。歐力說 "), en("Find the small letter!", 22), t("（或 "), en("Find the big letter!", 22), t("），孩子從三個字母中點出對的那一個；接著歐力說一個單字並做動作，孩子跟著說、跟著做。第 3 關例外，見第二部分。")]);
  bullet([t("每一關玩完、拿點數之前，還有 "), t("🎁 神秘禮物盒", { bold: true }), t("（三個盒子選一個打開，中年級唸出裡面的句子，低年級是一個單字）；中年級另外還有 "), t("🧩 句子拼拼看", { bold: true }), t("（把字卡排成一句再唸）。")]);
  bullet([t("每一關的題目是從題庫隨機抽的（每關下面的「當天」有寫抽幾題），所以整份都要練。")]);
  bullet([t("題目全部來自《校園生活英語》護照，表格最右欄是護照的「單元-句號」，例如 (4)-7。終點的 We are friends! 不在護照裡。")]);
  body.push(H2("線上練習本（可以聽聲音跟讀）"));
  body.push(para([new ExternalHyperlink({ link: LINK, children: [new TextRun({ text: LINK, style: "Hyperlink", font: EN, size: 20 })] })], { after: 40 }));
  body.push(note("每一句都可以按 🔊 聽男生或女生的聲音（ElevenLabs 的 AI 語音，不是真人錄音），也有 1 分鐘的聽力小測驗。網頁上的圖和當天大螢幕上的不一樣，當天還有驚喜。"));
  body.push(H2("建議練法（每關約 5 分鐘）"));
  ["老師唸「歐力問」那一句（或播網頁上的 🔊）。", "孩子自己說「孩子說」那一句；說不出來再給示範，再請他說一次。", "全班一起說一次，再請 2～3 位孩子單獨說，練習在大家面前開口。"]
    .forEach((s) => bullet(t(s)));

  /* ---------- 中年級 ---------- */
  body.push(new Paragraph({ children: [new PageBreak()] }));
  body.push(H1("一、中年級（3–4 年級）：看整句唸出來"));
  body.push(note("每一關的題目都在下面。「孩子說」那一欄請練到能自己唸出來。"));
  const cols = [620, 2150, 3016, 3016, 800];
  CH.forEach((ch) => {
    const g = gOf(ch);
    body.push(H2(ch.title)); body.push(day(DAY2[ch.id] || ""));
    let main = ch.items.filter((it) => !it.extra && it.kind !== "order");
    if (g === 4) main = main.slice().sort((a, b2) => (D.g4ask.includes(b2.id) ? 1 : 0) - (D.g4ask.includes(a.id) ? 1 : 0)); // the askable ones first
    const rows = main.map((it, i) => {
      if (it.kind === "listen") return [num(i + 1), t("午休時間到了。"), two(it.q, "歐力說", 20), [para(t("（不用說話）", { bold: true }), { after: 10 }), para(zhSmall("歐力說完就睡著了，下一題把他叫醒"), { after: 10 })], ref(it.no)];
      if (it.kind === "spell") return [num(i + 1), t(it.sit), para(t(it.qzh)), two(it.a.split("").join(" "), "排出密碼：friend 朋友", 24), ref(it.no)];
      if (it.id === "ending") return [num(i + 1), t(it.sit), para(t("歐力說，大家一起說：")), two(it.a, it.azh, 25), ref(it.no)];
      const off = g === 4 && !D.g4ask.includes(it.id);
      return [num(i + 1), t((off ? "（只當圖卡，不會被問）" : "") + (it.sit || "")), it.q ? two(it.q, it.qzh, 21) : para(t(it.qzh || "")), two(it.a, it.azh, 25), ref(it.no)];
    });
    body.push(table(cols, ["題", "情境", "歐力問", "孩子說", "護照"], rows));
    if (g) {
      body.push(para(t("過關前的加分活動：🧩 句子拼拼看抽一句；🎁 神秘禮物盒出現其中三句，孩子選一個盒子打開。", { size: 20, color: "555555" }), { before: 120, keepNext: true }));
      body.push(table([620, 5182, 2000, 1000, 800], ["", "孩子說", "意思", "會出現在", "護照"],
        D.pool[g].map((o, i) => [num(i + 1), para(en(o.text, 25)), t(o.zh), t([o.box ? "🎁" : "", o.order ? "🧩" : ""].join(" ").trim()), ref(o.no)])));
    }
  });

  /* ---------- 低年級 ---------- */
  body.push(new Paragraph({ children: [new PageBreak()] }));
  body.push(H1("二、低年級（1–2 年級）：大小寫字母＋聽單字做動作"));
  body.push(note("低年級不用說句子。每一題有兩步：① 歐力說 Find the small letter!（或 Find the big letter!），孩子從三個字母中點出它的小寫（或大寫）；② 歐力說一個單字並做動作，孩子跟著說、跟著做。當天先出現大寫還是小寫是隨機的（L 和 I 一定先出現大寫，因為小寫 l 和大寫 I 長得很像），兩種都要練。"));
  const lcols = [620, 2700, 1700, 1900, 2682];
  CH.forEach((ch) => {
    const g = gOf(ch);
    let items = ch.items.filter((it) => !it.extra && it.kind !== "order");
    if (g === 4) items = items.filter((it) => D.g4ask.includes(it.id));
    body.push(H2(ch.title)); body.push(day(DAY1[ch.id] || ""));
    const rows = items.map((it, i) => {
      const L = it.low.charAt(0), n = i + 1;
      if (it.noAbc) return [num(n), t(it.sit), para(t("（不用配對）")), two(it.a, "孩子回答歐力", 24), t("揮揮手，跟歐力打招呼！")];
      if (g === 3 && it.kind === "listen") return [num(n), t("午休時間到了。"), para(t("（不用配對）")), two(D.quiet, "歐力說的話", 19), t("閉上眼睛，安靜不動，等歐力大喊起床。")];
      if (g === 3 && it.id === "wake") return [num(n), t("午休結束。"), para(t("（不用配對）")), two(D.wake, "歐力自己大喊", 22), t("張開眼睛，伸個大懶腰！")];
      if (g === 3) return [num(n), t(it.sit || ""), para(t("（不用配對）")), two(it.a, "歐力說的話", 22), t("跟著歐力做：" + it.lowzh)];
      if (it.id === "ending") return [num(n), t(it.sit), para(t("（不用配對）")), two(it.a, "歐力說的話", 22), t("跟著歐力一起說，揮揮手！")];
      if (it.kind === "spell") return [num(n), t("六關各得一個字母，到終點排出來。"), para(en("F R I E N D", 24)), two("friend", "朋友", 24), t("跟著老師一起拼：F-R-I-E-N-D！")];
      return [num(n), t(it.sit || ""), pair(L), two(it.low, "", 26), t(it.lowzh)];
    });
    body.push(table(lcols, ["題", "情境", "大小寫配對", g === 3 ? "歐力說" : "歐力說的單字", "一起做的動作"], rows));
    if (g) {
      const seen = new Set(), box = D.pool[g].filter((o) => !seen.has(o.low) && seen.add(o.low));
      body.push(para(t("🎁 神秘禮物盒：過關前選一個盒子打開，裡面是下面其中一個字（先配對字母，再跟歐力說、做動作）。", { size: 20, color: "555555" }), { before: 120, keepNext: true }));
      body.push(table([620, 2700, 1700, 1900, 2682], ["", "", "大小寫配對", "盒子裡的字", "一起做的動作"], box.map((o, i) => [num(i + 1), t("🎁 神秘禮物盒"), pair(o.low.charAt(0)), two(o.low, "", 26), t(o.lowzh)])));
    }
  });
  body.push(para(t("依 115 年 11 月 26 日的闖關內容整理；題目若有更動，會再更新這份題庫。", { size: 18, color: "777777" }), { before: 240 }));

  const doc = new Document({
    creator: "土城國小英語闖關", title: "運動會英語闖關 題庫（低年級・中年級）",
    styles: { default: { document: { run: { font: ZH, size: 22 } } },
      paragraphStyles: [{ id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: ZH, size: 34, bold: true, color: NAVY }, paragraph: { spacing: { before: 120, after: 120 }, keepNext: true, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: ZH, size: 27, bold: true, color: NAVY }, paragraph: { spacing: { before: 280, after: 60 }, keepNext: true, outlineLevel: 1 } }] },
    numbering: { config: [{ reference: "dots", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 260 } } } }] }] },
    sections: [{ properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: M, bottom: M, left: M, right: M } } },
      headers: { default: new Header({ children: [para(t("土城國小　運動會英語闖關題庫（低年級・中年級）", { size: 17, color: "888888" }), { align: AlignmentType.RIGHT })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888" })] })] }) },
      children: body }]
  });
  fs.writeFileSync(out, await Packer.toBuffer(doc));
  console.log("written " + out + " (" + CH.reduce((s, c) => s + c.items.length, 0) + " items; gate-4 askable: " + D.g4ask.join(",") + ")");
})();
