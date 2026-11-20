/* =====================================================================
   Content for the six gates — 《校園生活英語》 passport (pages 4–9)
   ---------------------------------------------------------------------
   Every sentence comes from the school's classroom-English passport, which the children
   already know:  (4) Question 提問 · (5) Giving Feedback / End of the Class 給回饋、課程結束 ·
   (6) Lunch Time & Nap Time 午餐與午休 · (7) When Students Are Sick 學生生病時 ·
   (8) Speech 上台朗讀 · (9) Others 其他.   "no" = "(page)-line" so a teacher can check it in the book.

   One theme per gate (the principal's wish: situations, dialogue, TPR, phonics, song & dance, story):
     1 situations  2 dialogue  3 TPR actions  4 phonics  5 chant (sing & dance)  6 story
   Each gate has its own game engine, found by `key`; code must never hard-code gate numbers.

   Levels:  1 = 低年級 (grades 1–2): only the first letter (ABC) of the key word + do the action
            2 = 中年級 (grades 3–4): the whole sentence is shown — read it
            3 = 高年級 (grades 5–6): the key word is a blank until the hint
   The child only ever says ONE word (the blank).  A picture shows the answer.
   "say" = the sentence shown on screen · "w" = the key word (answer) · "keys" = words the AI accepts.
   Ollie's praise lines are passport (5)-1..3: Good job! Well done! Awesome! Excellent! That's right! You got it!
   ===================================================================== */
window.TC_SCHOOL = { zh: "南投縣草屯鎮土城國民小學", en: "Tucheng Elementary School", emblem: "assets/img/tucheng-emblem.svg" };
window.TC_CONTENT = {
  secret: "FRIEND",              // one letter per gate, in gate order
  finalLine: { say: "We are friends!", keys: [["friend", "friends"]], no: "" },
  praise: ["Good job!", "Well done!", "Awesome!", "Excellent!", "That's right!", "You got it!"],   // passport (5)-1, 2, 3
  clap: { say: "Give him a big hand!", zh: "請大家給他一個掌聲！", no: "(5)-4" },

  gates: {
    /* ---------------- Gate 1 · Classroom Rescue — SITUATIONS ---------------- */
    1: {
      key: "rescue", title: "Classroom Rescue", zh: "教室大救援", city: "San Diego", color: "#ff9a2e",
      genre: "情境題 Situations", passport: "護照 (4) 提問、(6) 午餐、(7) 生病",
      teacher: "What do you say?", tzh: "這時候要說什麼？",
      // img = the situation picture the game draws; the child says the key word of the sentence Ollie needs
      scenes: [
        { w: "late", img: "sit-late", say: "Sorry, I am late.", zh: "遲到了，要說對不起", no: "(4)-6", keys: [["late"]] },
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
      genre: "對話 Dialogue", passport: "護照 (4) 提問、(5) 給回饋、(9) 其他",
      teacher: "", tzh: "",
      // t = what the host (Ollie / the teacher) says, say = the guest's answer; the child says w
      qa: [
        { t: "Are you finished?", tzh: "你做完了嗎？", say: "Yes, I'm done.", zh: "是的，我完成了", w: "done", keys: [["done", "finished"]], no: "(4)-5", img: "talk-done" },
        { t: "Thank you for your help.", tzh: "謝謝你的幫忙", say: "You're welcome.", zh: "不客氣", w: "welcome", keys: [["welcome"]], no: "(5)-9", img: "talk-welcome" },
        { t: "Can you close the door, please?", tzh: "可以請你關門嗎？", say: "Sure.", zh: "當然", w: "sure", keys: [["sure", "course", "okay"]], no: "(5)-19", img: "talk-door" },
        { t: "May I help you?", tzh: "需要我幫忙嗎？", say: "Yes, please.", zh: "好的，麻煩你", w: "please", keys: [["please"]], no: "(9)-2", img: "talk-help" },
        { t: "Could you please turn off the fan?", tzh: "可以請你關電扇嗎？", say: "Okay.", zh: "好的", w: "okay", keys: [["okay", "ok"]], no: "(5)-18", img: "talk-fan" },
        { t: "Class is over. That's all for today.", tzh: "下課了", say: "Goodbye.", zh: "再見", w: "goodbye", keys: [["goodbye", "bye"]], no: "(5)-20", img: "talk-bye" }
      ],
      finale: { t: "Could you give me a hand?", tzh: "你可以幫我一個忙嗎？", say: "Of course.", zh: "當然", w: "course", keys: [["course", "sure", "okay"]], no: "(9)-1", img: "talk-hand" }
    },

    /* ---------------- Gate 3 · Ollie Says — TPR ACTIONS ---------------- */
    3: {
      key: "tpr", title: "Ollie Says", zh: "歐力說", city: "Sydney", color: "#2ee6b6",
      genre: "動作 TPR", passport: "護照 (5) 課程結束、(6) 午餐與午休",
      teacher: "", tzh: "",
      // the child DOES the action with Ollie (no speaking needed); w = the verb that is shown big
      actions: [
        { id: "wash", w: "wash", say: "Wash your hands!", zh: "洗手", no: "(6)-1" },
        { id: "clean", w: "clean", say: "Clean up your table!", zh: "整理桌面", no: "(6)-3" },
        { id: "brush", w: "brush", say: "Brush your teeth!", zh: "刷牙", no: "(6)-4" },
        { id: "mask", w: "mask", say: "Wear your mask!", zh: "戴口罩", no: "(6)-2" },
        { id: "door", w: "close", say: "Close the door, please.", zh: "關門", no: "(5)-19" },
        { id: "hurry", w: "hurry", say: "Hurry up!", zh: "快一點", no: "(5)-12" },
        { id: "walk", w: "walk", say: "No running! Please walk.", zh: "別跑，用走的", no: "(5)-10" },
        { id: "break", w: "break", say: "Take a break!", zh: "休息一下", no: "(5)-14" }
      ],
      // the surprise at the end: everybody freezes, then wakes up with a bang
      quiet: { say: "It's quiet time. Close your eyes and rest.", zh: "午休時間，閉上眼睛休息", no: "(6)-6", w: "rest" },
      wake: { say: "Wake up, everyone!", zh: "大家起床囉！", no: "(6)-7", w: "wake" }
    },

    /* ---------------- Gate 4 · Sound Monsters — PHONICS ---------------- */
    4: {
      key: "monster", title: "Sound Monsters", zh: "音節怪獸", city: "Vancouver", color: "#9b6bff",
      genre: "字母與發音 Phonics", passport: "護照 (4)-(7) 的單字",
      teacher: "What is it?", tzh: "這是什麼？",
      // every word is a thing from the passport pages; the monster only eats words that START with its letter sound
      words: [
        { w: "water", L: "w", img: "p-water", zh: "水", no: "(4)-9" }, { w: "window", L: "w", img: "p-window", zh: "窗戶", no: "(5)-19" },
        { w: "table", L: "t", img: "p-table", zh: "桌子", no: "(6)-3" }, { w: "teeth", L: "t", img: "p-teeth", zh: "牙齒", no: "(6)-4" },
        { w: "lunchbox", L: "l", img: "p-lunchbox", zh: "便當盒", no: "(6)-5" }, { w: "light", L: "l", img: "p-light", zh: "電燈", no: "(5)-18" },
        { w: "door", L: "d", img: "p-door", zh: "門", no: "(5)-19" }, { w: "drink", L: "d", img: "p-drink", zh: "飲料", no: "(4)-9" },
        { w: "book", L: "b", img: "p-book", zh: "書", no: "(5)-15" }, { w: "brush", L: "b", img: "p-brush", zh: "牙刷", no: "(6)-4" },
        { w: "fan", L: "f", img: "p-fan", zh: "電扇", no: "(5)-18" }, { w: "hands", L: "h", img: "p-hands", zh: "雙手", no: "(6)-1" },
        { w: "mask", L: "m", img: "p-mask", zh: "口罩", no: "(6)-2" }, { w: "nurse", L: "n", img: "p-nurse", zh: "護理師", no: "(7)-2" }
      ]
    },

    /* ---------------- Gate 5 · Classroom Beat — CHANT (sing & dance) ---------------- */
    5: {
      key: "chant", title: "Classroom Beat", zh: "教室節奏派對", city: "Cairo", color: "#ff5fa2",
      genre: "唱跳 Chant & Dance", passport: "護照 (5) 課程結束、(6) 午餐與午休",
      teacher: "", tzh: "",
      // a draft chant built from passport commands — replace with the songs the English teacher really uses; w = the last word the child says
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
      genre: "故事 Story", passport: "護照 (5)-(7)：一天的校園生活",
      teacher: "What do we do?", tzh: "接下來做什麼？",
      // a pop-up book of one school day; every page the child says the missing word (t overrides the question)
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
  4: { page: "(7)", line: 4, text: "Drink lots of water and get some rest.", zh: "多喝水、多休息", w: "water", keys: [["water"]] },
  5: { page: "(8)", line: 3, text: "Thank you for listening.", zh: "謝謝你的聆聽", w: "listening", keys: [["listening", "listen"]] },
  6: { page: "(9)", line: 4, text: "I have an idea.", zh: "我有一個想法", w: "idea", keys: [["idea"]] }
};

/* Sentence Builder: short passport sentences — tap the word cards into order, then read it. */
window.TC_CONTENT.sentences = {
  1: [ { no: "(4)-14", s: "May I come in?", zh: "我可以進來嗎？", keys: [["come", "in"]] }, { no: "(6)-5", s: "I forgot my lunchbox.", zh: "我忘了帶便當。", keys: [["lunchbox", "forgot"]] },
       { no: "(4)-6", s: "Sorry, I am late.", zh: "抱歉，我遲到了。", keys: [["late", "sorry"]] } ],
  2: [ { no: "(5)-20", s: "Class is over.", zh: "下課了。", keys: [["class", "over"]] }, { no: "(5)-9", s: "Thank you for your help.", zh: "謝謝你的幫忙。", keys: [["help", "thank"]] },
       { no: "(5)-22", s: "Have a nice day.", zh: "祝你有美好的一天。", keys: [["nice", "day"]] } ],
  3: [ { no: "(6)-1", s: "Wash your hands.", zh: "洗手。", keys: [["wash", "hands"]] }, { no: "(6)-4", s: "Brush your teeth.", zh: "去刷牙。", keys: [["brush", "teeth"]] },
       { no: "(6)-3", s: "Clean up your table.", zh: "清理餐桌。", keys: [["clean", "table"]] } ],
  4: [ { no: "(7)-4", s: "Drink lots of water.", zh: "多喝水。", keys: [["water", "drink"]] }, { no: "(9)-4", s: "I have an idea.", zh: "我有一個想法。", keys: [["idea"]] },
       { no: "(4)-9", s: "May I get a drink?", zh: "我可以喝水嗎？", keys: [["drink"]] } ],
  5: [ { no: "(5)-14", s: "Take a break.", zh: "休息一下。", keys: [["break"]] }, { no: "(8)-3", s: "Thank you for listening.", zh: "謝謝你的聆聽。", keys: [["listening", "thank"]] },
       { no: "(5)-1", s: "Good job!", zh: "做得好！", keys: [["good", "job"]] } ],
  6: [ { no: "(6)-7", s: "Time to wake up.", zh: "該起床了。", keys: [["wake"]] }, { no: "(5)-21", s: "See you next time.", zh: "下次見。", keys: [["see", "time"]] },
       { no: "(5)-22", s: "Have a nice day.", zh: "祝你有美好的一天。", keys: [["nice", "day"]] } ]
};

/* Warm-up at the start of each gate (one short question; one word is enough). The child says their own name. */
window.TC_CONTENT.greetings = {
  name: { teacher: "What's your name?", tzh: "你叫什麼名字？", no: "(8)-1", say: "I'm [Name].", keys: [["i", "am", "my", "[name]"]] }
};
window.TC_CONTENT.greetingOrder = { 1: "name", 2: "name", 3: "name", 4: "name", 5: "name", 6: "name" };

/* One list of "host asks → child says" lines per gate, used by the 📋 popup, the guide and the gate host cards,
   so the printed scripts always match the games.  row = { t, tzh, say, word, zh, no, kind: "hello" | "q" | "extra" | "last" } */
window.TC_SCRIPT = function (gate) {
  const C = window.TC_CONTENT, G = C.gates[gate], gr = C.greetings[C.greetingOrder[gate]], rows = [];
  rows.push({ kind: "hello", t: gr.teacher, tzh: gr.tzh, say: gr.say.replace("[Name]", "___"), word: "", zh: "說自己的名字", no: gr.no });
  const q = (r) => rows.push(Object.assign({ kind: "q" }, r));
  if (G.key === "rescue") G.scenes.forEach((x) => q({ t: G.teacher, tzh: G.tzh, say: x.say, word: x.w, zh: x.zh, no: x.no }));
  if (G.key === "talk") { G.qa.forEach((x) => q({ t: x.t, tzh: x.tzh, say: x.say, word: x.w, zh: x.zh, no: x.no })); rows.push({ kind: "last", t: G.finale.t, tzh: G.finale.tzh, say: G.finale.say, word: G.finale.w, zh: G.finale.zh, no: G.finale.no }); }
  if (G.key === "tpr") {
    G.actions.forEach((x) => q({ t: x.say, tzh: x.zh, say: "（做動作，不用開口）", word: "", zh: "跟著歐力做", no: x.no }));
    rows.push({ kind: "last", t: G.quiet.say, tzh: G.quiet.zh, say: "（閉眼不動）→ " + G.wake.say, word: "", zh: "午休靜止，再突然起床", no: G.quiet.no + "、" + G.wake.no });
  }
  if (G.key === "monster") G.words.forEach((x) => q({ t: G.teacher, tzh: G.tzh, say: "It's " + (/^[aeiou]/.test(x.w) ? "an " : "a ") + x.w + ".", word: x.w, zh: x.zh + "（" + x.L.toUpperCase() + " 開頭）", no: x.no }));
  if (G.key === "chant") G.lines.forEach((x) => q({ t: x.say.replace(new RegExp(x.w, "i"), "___"), tzh: x.zh, say: x.say, word: x.w, zh: "唸最後一個字並做動作", no: x.no }));
  if (G.key === "story") { G.pages.forEach((x) => q({ t: x.t || G.teacher, tzh: x.tzh || G.tzh, say: x.say, word: x.w, zh: x.zh, no: x.no })); rows.push({ kind: "last", t: G.ending.say, tzh: G.ending.zh, say: "（全班一起說）", word: "", zh: "故事結束，大家一起說", no: G.ending.no }); }
  const H = C.hunt[gate];
  rows.push({ kind: "extra", t: "What's in the box?", tzh: "神秘禮物盒：盒子裡是哪一句？", say: H.text + "（或本關其他句子）", word: H.w, zh: "神秘禮物盒：" + H.zh, no: "" });
  return rows;
};
