/* =====================================================================
   Content for the six gates.
   · Words come from 《土城國小英語護照》 levels 1–10 (第1–10關); "no" is the
     passport word number so teachers can check it against the book.
     (Colours are passport level 19 — kept because "What color is it?" is a
     basic lower-grade pattern.)
   · Every question is a simple lower/middle-grade pattern, and the child
     only has to say ONE word — the blank in the sentence on screen — while
     a picture of the answer is shown.
   · Two levels:  1 = 初級 (grades 1–2): the word is printed under the picture
                  2 = 中級 (grades 3–6): the word is a blank until the hint
   "say"  = the sentence shown to the child (the key word is the blank)
   "keys" = words the AI accepts (any one of them is enough)
   ===================================================================== */
window.TC_SCHOOL = { zh: "南投縣草屯鎮土城國民小學", en: "Tucheng Elementary School", emblem: "assets/img/tucheng-emblem.svg" };
window.TC_CONTENT = {
  secret: "FRIEND",              // one letter per gate, in gate order
  finalLine: { say: "We are friends!", keys: [["friend", "friends"]], no: [40, 111] },

  gates: {
    /* ---------------- Gate 1 · Turbo Talk Kart — "What is it?" + vehicles ---------------- */
    1: {
      key: "kart", title: "Turbo Talk Kart", zh: "極速英語賽車", city: "Tokyo", color: "#4cc9ff",
      genre: "Kart racing 賽車遊戲", passport: "第1關 交通工具",
      teacher: "What is it?", tzh: "這是什麼？",
      items: [
        { w: "bus", no: 20, zh: "公車", img: "bus", say: "It's a bus." },
        { w: "train", no: 17, zh: "火車", img: "train", say: "It's a train." },
        { w: "taxi", no: 18, zh: "計程車", img: "taxi", say: "It's a taxi." },
        { w: "plane", no: 19, zh: "飛機", img: "plane", say: "It's a plane." },
        { w: "bike", no: 16, zh: "腳踏車", img: "bike", say: "It's a bike." },
        { w: "boat", no: 15, zh: "船", img: "boat", say: "It's a boat." },
        { w: "truck", no: 23, zh: "卡車", img: "truck", say: "It's a truck." },
        { w: "scooter", no: 21, zh: "摩托車", img: "scooter", say: "It's a scooter." }
      ],
      finale: { teacher: "Are you happy?", zh: "你開心嗎？", say: "Yes!", keys: [["yes", "yeah"]], word: "yes", no: [255] }
    },

    /* ---------------- Gate 2 · Pixel Craft — "What color is it?" ---------------- */
    2: {
      key: "craft", title: "Pixel Craft", zh: "方塊創造家", city: "Sydney", color: "#2ee6b6",
      genre: "Block building 方塊建造", passport: "第19關 顏色",
      teacher: "What color is it?", tzh: "這是什麼顏色？",
      colors: {
        red: { no: 505, zh: "紅色", hex: "#ff4b4b", say: "It's red." },
        orange: { no: 525, zh: "橘色", hex: "#ff9a2e", say: "It's orange." },
        yellow: { no: 508, zh: "黃色", hex: "#ffd23d", say: "It's yellow." },
        green: { no: 506, zh: "綠色", hex: "#35d35a", say: "It's green." },
        blue: { no: 507, zh: "藍色", hex: "#3d8bff", say: "It's blue." },
        purple: { no: 512, zh: "紫色", hex: "#9b5cff", say: "It's purple." },
        pink: { no: 510, zh: "粉紅色", hex: "#ff7ac0", say: "It's pink." },
        white: { no: 509, zh: "白色", hex: "#f4f7ff", say: "It's white." },
        black: { no: 511, zh: "黑色", hex: "#26293a", say: "It's black." },
        brown: { no: 523, zh: "棕色", hex: "#9a5b34", say: "It's brown." }
      },
      // the child answers with any colour word; the game fills "[color]" with a suggestion
      finale: { teacher: "What color do you like?", zh: "你喜歡什麼顏色？", say: "I like [color].", no: [604] }
    },

    /* ---------------- Gate 3 · Pet Hatch — "What is it?" + animals, "Big or small?" ---------------- */
    3: {
      key: "hatch", title: "Pet Hatch", zh: "英語寵物孵蛋", city: "Paris", color: "#ffc83d",
      genre: "Egg hatching & pets 孵蛋收集", passport: "第1關 動物 · 第9關 big / small",
      teacher: "What is it?", tzh: "這是什麼？",
      items: [
        { w: "tiger", no: 11, zh: "老虎", img: "tiger", say: "It's a tiger.", size: "big" },
        { w: "elephant", no: 6, zh: "大象", img: "elephant", say: "It's an elephant.", size: "big" },
        { w: "rabbit", no: 10, zh: "兔子", img: "rabbit", say: "It's a rabbit.", size: "small" },
        { w: "turtle", no: 12, zh: "烏龜", img: "turtle", say: "It's a turtle.", size: "small" },
        { w: "monkey", no: 8, zh: "猴子", img: "monkey", say: "It's a monkey.", size: "small" },
        { w: "pig", no: 9, zh: "豬", img: "pig", say: "It's a pig.", size: "big" },
        { w: "zebra", no: 13, zh: "斑馬", img: "zebra", say: "It's a zebra.", size: "big" },
        { w: "duck", no: 5, zh: "鴨", img: "duck", say: "It's a duck.", size: "small" },
        { w: "cat", no: 3, zh: "貓", img: "cat", say: "It's a cat.", size: "small" },
        { w: "horse", no: 7, zh: "馬", img: "horse", say: "It's a horse.", size: "big" },
        { w: "lion", no: 14, zh: "獅子", img: "lion", say: "It's a lion.", size: "big" },
        { w: "dog", no: 4, zh: "狗", img: "dog", say: "It's a dog.", size: "small" },
        { w: "bear", no: 2, zh: "熊", img: "bear", say: "It's a bear.", size: "big" },
        { w: "bird", no: 1, zh: "鳥", img: "bird", say: "It's a bird.", size: "small" }
      ],
      // one extra easy question for 中級 after a pet hatches: the child says "Yes!" or "No!" (either is accepted; the question never contains the answer word)
      follow: { teacher: "Is it big?", zh: "牠很大嗎？", say: { big: "Yes!", small: "No!" }, word: { big: "yes", small: "no" }, keys: [["yes", "yeah", "no"]],
        after: { big: "It's big.", small: "It's small." }, no: [219, 223] },
      // the child answers with any of the hatched animals; the game fills "[animal]"
      finale: { teacher: "What do you like?", zh: "你喜歡哪一個？", say: "I like the [animal].", no: [604] }
    },

    /* ---------------- Gate 4 · Beat Party — "What's this?" + body parts (Touch your ___!) ---------------- */
    4: {
      key: "beat", title: "Beat Party", zh: "英語節奏派對", city: "Cairo", color: "#ff5fa2",
      genre: "Rhythm & dance 節奏舞蹈", passport: "第3關 身體部位",
      teacher: "What's this?", tzh: "這是什麼？",
      // img = art name of the picture that shows this body part
      parts: [
        { w: "head", no: 65, zh: "頭", img: "body-head", say: "Touch your head!" },
        { w: "eyes", no: 50, zh: "眼睛", img: "body-eyes", say: "Touch your eyes!", keys: [["eyes", "eye"]] },
        { w: "ears", no: 52, zh: "耳朵", img: "body-ears", say: "Touch your ears!", keys: [["ears", "ear"]] },
        { w: "nose", no: 47, zh: "鼻子", img: "body-nose", say: "Touch your nose!" },
        { w: "mouth", no: 66, zh: "嘴巴", img: "body-mouth", say: "Touch your mouth!" },
        { w: "hands", no: 46, zh: "手", img: "body-hands", say: "Touch your hands!", keys: [["hands", "hand"]] },
        { w: "feet", no: 55, zh: "腳", img: "body-feet", say: "Touch your feet!", keys: [["feet", "foot"]] }
      ],
      finale: { teacher: "Photo time!", zh: "拍照囉！大家看鏡頭", say: "Cheese!", keys: [["cheese"]], word: "cheese", no: [] }
    },

    /* ---------------- Gate 5 · Mystery Box — "How many?" + numbers 1–10 ---------------- */
    5: {
      key: "box", title: "Mystery Box", zh: "神秘盲盒", city: "Vancouver", color: "#9b6bff",
      genre: "Mystery box / unboxing 開箱驚喜", passport: "第7關 數字 · 第1關 動物",
      teacher: "How many?", tzh: "有幾個？",
      // what jumps out of the box (art names); the child counts them and says the number
      pool: ["duck", "cat", "pig", "rabbit", "bird", "dog", "bear", "monkey"],
      numbers: {
        1: { w: "one", no: 142 }, 2: { w: "two", no: 143 }, 3: { w: "three", no: 144 }, 4: { w: "four", no: 145 }, 5: { w: "five", no: 146 },
        6: { w: "six", no: 147 }, 7: { w: "seven", no: 148 }, 8: { w: "eight", no: 149 }, 9: { w: "nine", no: 150 }, 10: { w: "ten", no: 151 }
      },
      finale: { teacher: "Are you hungry?", zh: "你餓了嗎？", say: "Yes!", keys: [["yes", "yeah", "no"]], word: "yes", no: [59] }
    },

    /* ---------------- Gate 6 · Sports Day Obby — "What can you do?" + action verbs ---------------- */
    6: {
      key: "obby", title: "Sports Day Obby", zh: "運動會障礙跑酷", city: "San Diego", color: "#ff9a2e",
      genre: "Obby / runner 障礙跑酷", passport: "第4、6關 動詞 · can",
      teacher: "What can you do?", tzh: "你會做什麼？",
      moves: [
        { w: "jump", no: 607, zh: "跳", obstacle: "hurdle", say: "I can jump!" },
        { w: "swim", no: 394, zh: "游泳", obstacle: "river", say: "I can swim!" },
        { w: "climb", no: 140, zh: "爬", obstacle: "wall", say: "I can climb!" },
        { w: "run", no: 70, zh: "跑", obstacle: "track", say: "I can run!" },
        { w: "ride", no: 125, zh: "騎", obstacle: "bikeLane", say: "I can ride!" },
        { w: "fly", no: 139, zh: "飛", obstacle: "cliff", say: "I can fly!" }
      ],
      finale: { teacher: "Are you tired?", zh: "你累了嗎？", say: "No!", keys: [["no", "yes", "yeah", "ok", "okay", "fine"]], word: "no", no: [260] }
    }
  }
};

/* Sentence Builder: two-or-three-word sentences made of the same simple patterns (tap the word cards into order, then read it). */
window.TC_CONTENT.sentences = {
  1: [ { no: 20, s: "It's a bus.", zh: "這是公車。", keys: [["bus"]] }, { no: 17, s: "It's a train.", zh: "這是火車。", keys: [["train"]] },
       { no: 18, s: "It's a taxi.", zh: "這是計程車。", keys: [["taxi"]] }, { no: 15, s: "It's a boat.", zh: "這是船。", keys: [["boat"]] } ],
  2: [ { no: 505, s: "It's red.", zh: "它是紅色的。", keys: [["red"]] }, { no: 507, s: "It's blue.", zh: "它是藍色的。", keys: [["blue"]] },
       { no: 508, s: "It's yellow.", zh: "它是黃色的。", keys: [["yellow"]] }, { no: 506, s: "It's green.", zh: "它是綠色的。", keys: [["green"]] } ],
  3: [ { no: 3, s: "It's a cat.", zh: "這是貓。", keys: [["cat"]] }, { no: 4, s: "It's a dog.", zh: "這是狗。", keys: [["dog"]] },
       { no: 219, s: "It's big.", zh: "它很大。", keys: [["big"]] }, { no: 223, s: "It's small.", zh: "它很小。", keys: [["small"]] } ],
  4: [ { no: 47, s: "Touch your nose.", zh: "摸摸你的鼻子。", keys: [["nose"]] }, { no: 65, s: "Touch your head.", zh: "摸摸你的頭。", keys: [["head"]] },
       { no: 66, s: "Touch your mouth.", zh: "摸摸你的嘴巴。", keys: [["mouth"]] } ],
  5: [ { no: 255, s: "I'm happy.", zh: "我很開心。", keys: [["happy"]] }, { no: 59, s: "I'm hungry.", zh: "我餓了。", keys: [["hungry"]] },
       { no: 258, s: "I'm fine.", zh: "我很好。", keys: [["fine"]] } ],
  6: [ { no: 70, s: "I can run.", zh: "我會跑。", keys: [["run"]] }, { no: 139, s: "I can fly.", zh: "我會飛。", keys: [["fly"]] },
       { no: 140, s: "I can climb.", zh: "我會爬。", keys: [["climb"]] } ]
};

/* Warm-up at the start of each gate (one short question; one word is enough). "[Name]" / "[age]" are filled in by the program. */
window.TC_CONTENT.greetings = {
  name: { teacher: "What's your name?", tzh: "你叫什麼名字？", no: [37], say: "I'm [Name].", keys: [["i", "am", "my", "[name]"]] },
  feel: { teacher: "How are you?", tzh: "你好嗎？", no: [258, 255], say: "I'm fine.", word: "fine",
    keys: [["fine", "good", "great", "happy", "ok", "okay", "super", "excited", "tired", "hungry"]] },
  age: { teacher: "How old are you?", tzh: "你幾歲？", no: [148], say: "I'm [age].",
    keys: [["six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "6", "7", "8", "9", "10", "11", "12", "13"]] }
};
window.TC_CONTENT.greetingOrder = { 1: "name", 2: "age", 3: "feel", 4: "name", 5: "age", 6: "feel" };

/* One list of "teacher asks → child says" lines per gate, used by the 📋 popup, the guide and the gate host cards,
   so the printed scripts always match the games.  row = { t, tzh, say, word, zh, no, kind: "hello" | "q" | "extra" | "last" } */
window.TC_SCRIPT = function (gate) {
  const C = window.TC_CONTENT, G = C.gates[gate], gr = C.greetings[C.greetingOrder[gate]], rows = [];
  const cap = (w) => w[0].toUpperCase() + w.slice(1);
  rows.push({ kind: "hello", t: gr.teacher, tzh: gr.tzh, say: gr.say.replace("[Name]", "Amy").replace("[age]", "nine"), word: gr.word || "", zh: "", no: (gr.no || []).join("、") });
  const q = (it, say, w) => rows.push({ kind: "q", t: G.teacher, tzh: G.tzh, say, word: w, zh: it.zh || "", no: it.no });
  if (G.key === "kart" || G.key === "hatch") G.items.forEach((it) => q(it, it.say, it.w));
  if (G.key === "craft") Object.entries(G.colors).forEach(([c, v]) => q(v, v.say, c));
  if (G.key === "beat") G.parts.forEach((p) => q(p, p.say, p.w));
  if (G.key === "box") Object.entries(G.numbers).forEach(([n, v]) => q({ zh: n, no: v.no }, cap(v.w) + "!", v.w));
  if (G.key === "obby") G.moves.forEach((m) => q(m, m.say, m.w));
  if (G.follow) rows.push({ kind: "extra", t: G.follow.teacher, tzh: G.follow.zh, say: "Yes! / No!", word: "yes no", zh: "中級加問；說 Yes 或 No 都可以", no: (G.follow.no || []).join("、") });
  const F = G.finale;
  rows.push({ kind: "last", t: F.teacher, tzh: F.zh, say: F.say.replace("[color]", "blue").replace("[animal]", "cat"), word: F.word || (F.say.includes("[color]") ? "blue" : F.say.includes("[animal]") ? "cat" : ""), zh: "", no: (F.no || []).join("、") });
  return rows;
};
