/* =====================================================================
   Content for the six gates — 《Campus English @ Tucheng 校園生活英語》, units (1)–(9)
   ---------------------------------------------------------------------
   Every sentence comes from the school's own classroom-English booklet, which the children already know
   (the teacher's photographs of all nine units, November 2026):
     (1) Greeting 打招呼 · (2) Time to begin 開始上課 · (3) During the Class 上課中 · (4) Question 提問 ·
     (5) Giving Feedback / End of the Class 給回饋、課程結束 · (6) Lunch Time & Nap Time 午餐與午休 ·
     (7) When Students Are Sick 學生生病時 · (8) Speech 上台朗讀或說故事 · (9) Others 其他.
   "no" = "(unit)-line" so a teacher can check each sentence in the booklet.
   Only the shortest, easiest lines are used: the children know the booklet, but they must not get stuck in
   front of parents and guests.  The child says the line first; Ollie models it only when the teacher presses 🔊 聽示範.

   One theme per gate (the principal's wish: situations, dialogue, TPR, phonics, song & dance, story):
     1 situations  2 dialogue  3 TPR actions  4 phonics  5 chant (sing & dance)  6 story
   Each gate has its own game engine, found by `key`; code must never hard-code gate numbers.

   Levels:  1 = 低年級 (grades 1–2): big and small letters + do the action with Ollie (no sentence to say)
            2 = 中年級 (grades 3–4): the whole sentence is shown — the child reads it out
            3 = 高年級 (grades 5–6): the answer sentence has one blank — tap the right word, then say it
   "say" = the sentence shown on screen · "w" = the key word (the blank) · "keys" = words the AI accepts
   (the microphone is off at the venue; the teacher presses ✓).
   Ollie's praise lines are booklet (5)-1..3: Good job! Well done! Awesome! Excellent! That's right! You got it!
   ===================================================================== */
window.TC_SCHOOL = { zh: "南投縣草屯鎮土城國民小學", en: "Tucheng Elementary School", emblem: "assets/img/tucheng-emblem.svg" };
window.TC_CONTENT = {
  secret: "FRIEND",              // one letter per gate, in gate order
  finalLine: { say: "We are friends!", keys: [["friend", "friends"]], no: "" },
  praise: ["Good job!", "Well done!", "Awesome!", "Excellent!", "That's right!", "You got it!"],   // booklet (5)-1, 2, 3
  clap: { say: "Give him a big hand!", zh: "請大家給他一個掌聲！", no: "(5)-4" },

  gates: {
    /* ---------------- Gate 1 · Classroom Rescue — SITUATIONS ---------------- */
    1: {
      key: "rescue", title: "Classroom Rescue", zh: "教室大救援", city: "San Diego", color: "#ff9a2e",
      genre: "情境題 Situations", passport: "護照 (2) 開始上課、(4) 提問、(6) 午餐、(7) 生病",
      teacher: "What do you say?", tzh: "這時候要說什麼？",
      // img = the situation picture the game draws; the child says the sentence Ollie needs
      scenes: [
        { w: "late", img: "sit-late", say: "Sorry, I am late.", zh: "遲到了，要說對不起", no: "(2)-6", keys: [["late"]] },
        { w: "in", img: "sit-in", say: "May I come in?", zh: "想進教室", no: "(4)-14", keys: [["in"]] },
        { w: "restroom", img: "sit-restroom", say: "May I go to the restroom?", zh: "想上廁所", no: "(4)-7", keys: [["restroom", "bathroom"]] },
        { w: "water", img: "sit-water", say: "May I get a drink of water?", zh: "想喝水", no: "(4)-9", keys: [["water"]] },
        { w: "lunchbox", img: "sit-lunchbox", say: "I forgot my lunchbox.", zh: "忘記帶便當", no: "(6)-5", keys: [["lunchbox", "lunch", "box"]] },
        { w: "hurt", img: "sit-hurt", say: "I'm hurt.", zh: "受傷了", no: "(7)-1", keys: [["hurt"]] }
      ]
    },

    /* ---------------- Gate 2 · Ollie Talk Show — DIALOGUE ---------------- */
    2: {
      key: "talk", title: "Ollie Talk Show", zh: "歐力脫口秀", city: "Tokyo", color: "#4cc9ff",
      genre: "對話 Dialogue", passport: "護照 (1) 打招呼、(2) 開始上課、(4) 提問、(5) 給回饋",
      teacher: "", tzh: "",
      // the greetings the children say every day.  t = what the host (Ollie) says, say = the guest's answer
      qa: [
        { t: "Good morning, everyone.", tzh: "大家早安", say: "Good morning!", zh: "早安", w: "morning", keys: [["morning"]], no: "(1)-5", img: "talk-morning" },
        { t: "How are you today?", tzh: "你今天好嗎？", say: "I'm good, thanks!", zh: "我很好，謝謝", w: "good", keys: [["good", "great", "okay"]], no: "(1)-1", img: "talk-good" },
        { t: "Are we ready?", tzh: "大家準備好了嗎？", say: "Yes!", zh: "準備好了", w: "yes", keys: [["yes", "ready"]], no: "(2)-8", img: "talk-ready" },
        { t: "Are you okay?", tzh: "你還好嗎？", say: "I'm okay.", zh: "我還好", w: "okay", keys: [["okay", "ok"]], no: "(4)-3", img: "talk-okay" },
        { t: "Thank you for your help.", tzh: "謝謝你的幫忙", say: "You're welcome.", zh: "不客氣", w: "welcome", keys: [["welcome"]], no: "(5)-9", img: "talk-welcome" },
        { t: "Goodbye, everyone.", tzh: "大家再見", say: "Goodbye!", zh: "再見", w: "goodbye", keys: [["goodbye", "bye"]], no: "(5)-21", img: "talk-bye" }
      ],
      finale: { t: "Wanna play basketball?", tzh: "要打籃球嗎？", say: "Yeah, that sounds fun!", zh: "好啊，聽起來很有趣！", w: "fun", keys: [["fun", "yeah"]], no: "(1)-3", img: "talk-basketball" }
    },

    /* ---------------- Gate 3 · Ollie Says — TPR ACTIONS ---------------- */
    3: {
      key: "tpr", title: "Ollie Says", zh: "歐力說", city: "Sydney", color: "#2ee6b6",
      genre: "動作 TPR", passport: "護照 (2) 開始上課、(3) 上課中、(6) 午餐與午休",
      teacher: "", tzh: "",
      // the classroom commands of every lesson.  id = Ollie's 3D action in js/ollie3d.js; w = the word shown big
      actions: [
        { id: "stand", w: "stand", say: "Stand up!", zh: "起立", no: "(2)-1" },
        { id: "sit", w: "sit", say: "Sit down!", zh: "坐下", no: "(2)-1" },
        { id: "bow", w: "bow", say: "Bow!", zh: "敬禮", no: "(2)-1" },
        { id: "clap", w: "clap", say: "Clap your hands!", zh: "拍手", no: "(3)-8" },
        { id: "raise", w: "raise", say: "Raise your hand!", zh: "舉手", no: "(3)-8" },
        { id: "down", w: "down", say: "Put your hands down!", zh: "手放下", no: "(3)-8" },
        { id: "open", w: "open", say: "Open your books!", zh: "把書本打開", no: "(3)-6" },
        { id: "close", w: "close", say: "Close your books!", zh: "把書本闔上", no: "(3)-6" },
        { id: "wash", w: "wash", say: "Wash your hands!", zh: "洗手", no: "(6)-1" }
      ],
      // the surprise at the end: everybody freezes, then wakes up with a bang
      quiet: { say: "It's quiet time. Close your eyes and rest.", zh: "午休時間，閉上眼睛休息", no: "(6)-6", w: "rest" },
      wake: { say: "Wake up, everyone!", zh: "大家起床囉！", no: "(6)-7", w: "wake" }
    },

    /* ---------------- Gate 4 · Sound Monsters — PHONICS ---------------- */
    4: {
      key: "monster", title: "Sound Monsters", zh: "音節怪獸", city: "Vancouver", color: "#9b6bff",
      genre: "字母與發音 Phonics", passport: "護照 (2)–(7) 的單字",
      teacher: "What is it?", tzh: "這是什麼？",
      // every word is a thing from the booklet; the monster only eats words that START with its letter sound
      words: [
        { w: "water", L: "w", img: "p-water", zh: "水", no: "(4)-9" }, { w: "window", L: "w", img: "p-window", zh: "窗戶", no: "(2)-3" },
        { w: "table", L: "t", img: "p-table", zh: "桌子", no: "(6)-3" }, { w: "teeth", L: "t", img: "p-teeth", zh: "牙齒", no: "(6)-4" },
        { w: "lunchbox", L: "l", img: "p-lunchbox", zh: "便當盒", no: "(6)-5" }, { w: "light", L: "l", img: "p-light", zh: "電燈", no: "(2)-4" },
        { w: "door", L: "d", img: "p-door", zh: "門", no: "(2)-3" }, { w: "drink", L: "d", img: "p-drink", zh: "飲料", no: "(4)-9" },
        { w: "book", L: "b", img: "p-book", zh: "書", no: "(2)-10" }, { w: "brush", L: "b", img: "p-brush", zh: "牙刷", no: "(6)-4" },
        { w: "fan", L: "f", img: "p-fan", zh: "電扇", no: "(2)-4" }, { w: "hands", L: "h", img: "p-hands", zh: "雙手", no: "(3)-8" },
        { w: "mask", L: "m", img: "p-mask", zh: "口罩", no: "(6)-2" }, { w: "nurse", L: "n", img: "p-nurse", zh: "護理師", no: "(7)-1" }
      ]
    },

    /* ---------------- Gate 5 · Classroom Beat — CHANT (sing & dance) ---------------- */
    5: {
      key: "chant", title: "Classroom Beat", zh: "教室節奏派對", city: "Cairo", color: "#ff5fa2",
      genre: "唱跳 Chant & Dance", passport: "護照 (5) 課程結束、(6) 午餐與午休",
      teacher: "", tzh: "",
      // a draft chant built from booklet commands — replace with the songs the English teacher really uses; w = the last word the child says
      lines: [
        { say: "Wash your hands!", w: "hands", zh: "洗洗手", no: "(6)-1", move: "wash" },
        { say: "Clean up your table!", w: "table", zh: "清桌子", no: "(6)-3", move: "clean" },
        { say: "Brush your teeth!", w: "teeth", zh: "刷刷牙", no: "(6)-4", move: "brush" },
        { say: "Take a break!", w: "break", zh: "休息一下", no: "(5)-14", move: "rest" },
        { say: "Time to wake up!", w: "wake", zh: "起床囉", no: "(6)-7", move: "wake" },
        { say: "Hurry up!", w: "hurry", zh: "快一點", no: "(5)-12", move: "run" }
      ]
    },

    /* ---------------- Gate 6 · Storybook Day — STORY ---------------- */
    6: {
      key: "story", title: "Storybook Day", zh: "校園一天故事書", city: "Paris", color: "#ffc83d",
      genre: "故事 Story", passport: "護照 (5)–(7)：一天的校園生活",
      teacher: "What do we do?", tzh: "接下來做什麼？",
      // a pop-up book of one school day; every page the child says the line of the page (t overrides the question)
      pages: [
        { w: "wake", img: "st-wake", say: "Time to wake up!", zh: "該起床囉", no: "(6)-7" },
        { w: "wash", img: "st-wash", say: "Wash your hands before lunch.", zh: "吃飯前先洗手", no: "(6)-1" },
        { w: "clean", img: "st-clean", say: "Clean up your table.", zh: "清理餐桌", no: "(6)-3" },
        { w: "rest", img: "st-rest", say: "Close your eyes and rest.", zh: "閉上眼睛休息", no: "(6)-6" },
        { w: "hurt", img: "st-hurt", t: "What's the matter?", tzh: "怎麼了？", say: "I'm hurt.", zh: "我受傷了", no: "(7)-1", keys: [["hurt"]] },
        { w: "goodbye", img: "st-bye", t: "Class is over.", tzh: "下課了", say: "Goodbye.", zh: "再見", no: "(5)-20", keys: [["goodbye", "bye"]] }
      ],
      ending: { say: "Have a nice day!", zh: "祝你有美好的一天", no: "(5)-22" }
    }
  }
};

/* Mystery Box at the end of each gate (children do not bring passports): one of the sentences hidden in the gift boxes.
   page/line are kept only as the source in the school booklet; they are never shown to children. */
window.TC_CONTENT.hunt = {
  1: { page: "(4)", line: 7, text: "May I go to the restroom?", zh: "我可以去上廁所嗎？", w: "restroom", keys: [["restroom", "bathroom"]] },
  2: { page: "(5)", line: 9, text: "You're welcome.", zh: "不客氣", w: "welcome", keys: [["welcome"]] },
  3: { page: "(6)", line: 1, text: "Wash your hands before lunch.", zh: "用餐前先洗手", w: "wash", keys: [["wash"]] },
  4: { page: "(5)", line: 12, text: "Hurry up!", zh: "快一點！", w: "hurry", keys: [["hurry"]] },
  5: { page: "(8)", line: 3, text: "Thank you for listening.", zh: "謝謝你的聆聽", w: "listening", keys: [["listening", "listen"]] },
  6: { page: "(9)", line: 4, text: "I have an idea.", zh: "我有一個想法", w: "idea", keys: [["idea"]] }
};

/* Sentence Builder: short passport sentences — tap the word cards into order, then read it. */
window.TC_CONTENT.sentences = {
  1: [ { no: "(4)-14", s: "May I come in?", zh: "我可以進來嗎？", keys: [["come", "in"]] }, { no: "(6)-5", s: "I forgot my lunchbox.", zh: "我忘了帶便當。", keys: [["lunchbox", "forgot"]] },
       { no: "(2)-6", s: "Sorry, I am late.", zh: "抱歉，我遲到了。", keys: [["late", "sorry"]] } ],
  2: [ { no: "(5)-20", s: "Class is over.", zh: "下課了。", keys: [["class", "over"]] }, { no: "(5)-9", s: "Thank you for your help.", zh: "謝謝你的幫忙。", keys: [["help", "thank"]] },
       { no: "(5)-22", s: "Have a nice day.", zh: "祝你有美好的一天。", keys: [["nice", "day"]] } ],
  3: [ { no: "(6)-1", s: "Wash your hands.", zh: "洗手。", keys: [["wash", "hands"]] }, { no: "(6)-4", s: "Brush your teeth.", zh: "去刷牙。", keys: [["brush", "teeth"]] },
       { no: "(6)-3", s: "Clean up your table.", zh: "清理餐桌。", keys: [["clean", "table"]] } ],
  4: [ { no: "(3)-2", s: "Look at the picture.", zh: "看這張圖片。", keys: [["look", "picture"]] }, { no: "(9)-4", s: "I have an idea.", zh: "我有一個想法。", keys: [["idea"]] },
       { no: "(3)-6", s: "Open your books.", zh: "把書本打開。", keys: [["open", "books"]] } ],
  5: [ { no: "(5)-14", s: "Take a break.", zh: "休息一下。", keys: [["break"]] }, { no: "(8)-3", s: "Thank you for listening.", zh: "謝謝你的聆聽。", keys: [["listening", "thank"]] },
       { no: "(5)-1", s: "Good job!", zh: "做得好！", keys: [["good", "job"]] } ],
  6: [ { no: "(6)-7", s: "Time to wake up.", zh: "該起床了。", keys: [["wake"]] }, { no: "(5)-21", s: "See you next time.", zh: "下次見。", keys: [["see", "time"]] },
       { no: "(5)-22", s: "Have a nice day.", zh: "祝你有美好的一天。", keys: [["nice", "day"]] } ]
};

/* Warm-up at the start of each gate: the greeting of every lesson — booklet (1)-5 "T: Hi everyone.  S: Hi Ms. Lin."
   Ollie is the host here, so the child greets Ollie. */
window.TC_CONTENT.greetings = {
  hi: { teacher: "Hi, everyone!", tzh: "大家好！", no: "(1)-5", say: "Hi, Ollie!", zh: "跟歐力打招呼", keys: [["hi", "hello"]], word: "hi" }
};
window.TC_CONTENT.greetingOrder = { 1: "hi", 2: "hi", 3: "hi", 4: "hi", 5: "hi", 6: "hi" };

/* One list of "host asks → child says" lines per gate, used by the 📋 popup, the guide and the gate host cards,
   so the printed scripts always match the games.  row = { t, tzh, say, word, zh, no, kind: "hello" | "q" | "extra" | "last" } */
window.TC_SCRIPT = function (gate) {
  const C = window.TC_CONTENT, G = C.gates[gate], gr = C.greetings[C.greetingOrder[gate]], rows = [];
  rows.push({ kind: "hello", t: gr.teacher, tzh: gr.tzh, say: gr.say, word: "", zh: gr.zh || "打招呼", no: gr.no });
  const q = (r) => rows.push(Object.assign({ kind: "q" }, r));
  if (G.key === "rescue") G.scenes.forEach((x) => q({ t: G.teacher, tzh: G.tzh, say: x.say, word: x.w, zh: x.zh, no: x.no }));
  if (G.key === "talk") { G.qa.forEach((x) => q({ t: x.t, tzh: x.tzh, say: x.say, word: x.w, zh: x.zh, no: x.no })); rows.push({ kind: "last", t: G.finale.t, tzh: G.finale.tzh, say: G.finale.say, word: G.finale.w, zh: G.finale.zh, no: G.finale.no }); }
  if (G.key === "tpr") {
    G.actions.forEach((x) => q({ t: x.say, tzh: x.zh, say: x.say, word: x.w, zh: x.zh, no: x.no })); // 低年級 copy Ollie; 中／高年級 say the command
    rows.push({ kind: "last", t: G.quiet.say, tzh: G.quiet.zh, say: "（閉眼不動）→ " + G.wake.say, word: "", zh: "午休靜止，再突然起床", no: G.quiet.no + "、" + G.wake.no });
  }
  // the same sentence the game shows: "They're teeth." for plurals, "It's water." for uncountable words
  const itIs = (w) => /^(teeth|hands)$/.test(w) ? "They're " + w + "." : "It's " + (/^(water)$/.test(w) ? "" : /^[aeiou]/.test(w) ? "an " : "a ") + w + ".";
  if (G.key === "monster") G.words.forEach((x) => q({ t: /^(teeth|hands)$/.test(x.w) ? "What are they?" : G.teacher, tzh: /^(teeth|hands)$/.test(x.w) ? "這些是什麼？" : G.tzh, say: itIs(x.w), word: x.w, zh: x.zh + "（" + x.L.toUpperCase() + " 開頭）", no: x.no }));
  if (G.key === "chant") G.lines.forEach((x) => q({ t: x.say.replace(new RegExp(x.w, "i"), "___"), tzh: x.zh, say: x.say, word: x.w, zh: "唸最後一個字並做動作", no: x.no }));
  if (G.key === "story") { G.pages.forEach((x) => q({ t: x.t || G.teacher, tzh: x.tzh || G.tzh, say: x.say, word: x.w, zh: x.zh, no: x.no })); rows.push({ kind: "last", t: G.ending.say, tzh: G.ending.zh, say: "（全班一起說）", word: "", zh: "故事結束，大家一起說", no: G.ending.no }); }
  const H = C.hunt[gate];
  rows.push({ kind: "extra", t: "What's in the box?", tzh: "神秘禮物盒：盒子裡是哪一句？", say: H.text + "（或本關其他句子）", word: H.w, zh: "神秘禮物盒：" + H.zh, no: "" });
  return rows;
};
