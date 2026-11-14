/* =====================================================================
   Content for the six gates.
   · Every answer word comes from 《土城國小英語護照》 levels 1–6 (第1–6關),
     so the children can review those six levels before the day; "no" is the
     passport word number so teachers can check it against the book.
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
      genre: "Kart racing 賽車遊戲", passport: "第1關 交通工具 · 第5關 hot",
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
      finale: { teacher: "Are you hot?", zh: "你覺得熱嗎？", say: "Yes!", keys: [["yes", "yeah", "no"]], word: "yes", no: [90] }
    },

    /* ---------------- Gate 2 · Pixel Craft — "Who is he / she?" + family (passport level 2) ---------------- */
    2: {
      key: "craft", title: "Pixel Craft", zh: "方塊創造家", city: "Sydney", color: "#2ee6b6",
      genre: "Block building 方塊建造", passport: "第2關 家人",
      teacher: "Who is he?", tzh: "他是誰？",
      // the child builds a pixel portrait of a family member, then says who it is
      family: [
        { w: "father", no: 26, zh: "爸爸", he: true, say: "He's my father.", keys: [["father", "dad", "daddy"]] },
        { w: "mother", no: 27, zh: "媽媽", he: false, say: "She's my mother.", keys: [["mother", "mom", "mommy"]] },
        { w: "grandpa", no: 30, zh: "爺爺", he: true, say: "He's my grandpa.", keys: [["grandpa", "grandfather"]] },
        { w: "grandma", no: 32, zh: "奶奶", he: false, say: "She's my grandma.", keys: [["grandma", "grandmother"]] },
        { w: "brother", no: 25, zh: "哥哥／弟弟", he: true, say: "He's my brother.", keys: [["brother"]] },
        { w: "sister", no: 24, zh: "姐姐／妹妹", he: false, say: "She's my sister.", keys: [["sister"]] }
      ],
      finale: { teacher: "Is this your family?", zh: "這是你的家人嗎？", say: "Yes!", keys: [["yes", "yeah"]], word: "yes", no: [28, 39] }
    },

    /* ---------------- Gate 3 · Pet Hatch — "What is it?" + animals, "Big or small?" ---------------- */
    3: {
      key: "hatch", title: "Pet Hatch", zh: "英語寵物孵蛋", city: "Paris", color: "#ffc83d",
      genre: "Egg hatching & pets 孵蛋收集", passport: "第1關 動物 · 第6關 can / fly · 第4關 want",
      teacher: "What is it?", tzh: "這是什麼？",
      items: [
        { w: "tiger", no: 11, zh: "老虎", img: "tiger", say: "It's a tiger.", fly: false },
        { w: "elephant", no: 6, zh: "大象", img: "elephant", say: "It's an elephant.", fly: false },
        { w: "rabbit", no: 10, zh: "兔子", img: "rabbit", say: "It's a rabbit.", fly: false },
        { w: "turtle", no: 12, zh: "烏龜", img: "turtle", say: "It's a turtle.", fly: false },
        { w: "monkey", no: 8, zh: "猴子", img: "monkey", say: "It's a monkey.", fly: false },
        { w: "pig", no: 9, zh: "豬", img: "pig", say: "It's a pig.", fly: false },
        { w: "zebra", no: 13, zh: "斑馬", img: "zebra", say: "It's a zebra.", fly: false },
        { w: "duck", no: 5, zh: "鴨", img: "duck", say: "It's a duck.", fly: true },
        { w: "cat", no: 3, zh: "貓", img: "cat", say: "It's a cat.", fly: false },
        { w: "horse", no: 7, zh: "馬", img: "horse", say: "It's a horse.", fly: false },
        { w: "lion", no: 14, zh: "獅子", img: "lion", say: "It's a lion.", fly: false },
        { w: "dog", no: 4, zh: "狗", img: "dog", say: "It's a dog.", fly: false },
        { w: "bear", no: 2, zh: "熊", img: "bear", say: "It's a bear.", fly: false },
        { w: "bird", no: 1, zh: "鳥", img: "bird", say: "It's a bird.", fly: true }
      ],
      // one extra easy question for 中級 after a pet hatches: "Can it fly?" → "Yes!" / "No!" (either is accepted)
      follow: { teacher: "Can it fly?", zh: "牠會飛嗎？", say: { yes: "Yes!", no: "No!" }, word: { yes: "yes", no: "no" }, keys: [["yes", "yeah", "no"]],
        after: { yes: "It can fly!", no: "It can't fly." }, no: [134, 135, 139] },
      // the child taps the favourite pet; the game fills "[animal]"
      finale: { teacher: "Which one do you want?", zh: "你想要哪一隻？", say: "I want the [animal].", no: [82] }
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

    /* ---------------- Gate 5 · Mystery Box — "How's the weather?" + weather (passport level 5) ---------------- */
    5: {
      key: "box", title: "Mystery Box", zh: "神秘盲盒", city: "Vancouver", color: "#9b6bff",
      genre: "Mystery box / unboxing 開箱驚喜", passport: "第5關 天氣 · 第3關 hungry",
      teacher: "How's the weather?", tzh: "天氣怎麼樣？",
      // the weather that bursts out of the box (img = picture name drawn by the game)
      weather: [
        { w: "sunny", no: 91, zh: "晴天", img: "wx-sunny", say: "It's sunny." },
        { w: "rainy", no: 93, zh: "下雨", img: "wx-rainy", say: "It's rainy." },
        { w: "cloudy", no: 95, zh: "多雲", img: "wx-cloudy", say: "It's cloudy." },
        { w: "windy", no: 96, zh: "颳風", img: "wx-windy", say: "It's windy." },
        { w: "snowy", no: 101, zh: "下雪", img: "wx-snowy", say: "It's snowy.", keys: [["snowy", "snow", "snowing"]] }
      ],
      finale: { teacher: "Are you hungry?", zh: "你餓了嗎？", say: "Yes!", keys: [["yes", "yeah", "no"]], word: "yes", no: [59] }
    },

    /* ---------------- Gate 6 · Sports Day Obby — "What can you do?" + action verbs ---------------- */
    6: {
      key: "obby", title: "Sports Day Obby", zh: "運動會障礙跑酷", city: "San Diego", color: "#ff9a2e",
      genre: "Obby / runner 障礙跑酷", passport: "第4、6關 動詞 · can · 第3關 thirsty",
      teacher: "What can you do?", tzh: "你會做什麼？",
      moves: [
        { w: "walk", no: 127, zh: "走路", obstacle: "river", say: "I can walk!" },
        { w: "climb", no: 140, zh: "爬", obstacle: "wall", say: "I can climb!" },
        { w: "run", no: 70, zh: "跑", obstacle: "track", say: "I can run!" },
        { w: "ride", no: 125, zh: "騎", obstacle: "bikeLane", say: "I can ride!" },
        { w: "fly", no: 139, zh: "飛", obstacle: "cliff", say: "I can fly!" }
      ],
      finale: { teacher: "Are you thirsty?", zh: "你口渴了嗎？", say: "Yes!", keys: [["yes", "yeah", "no"]], word: "yes", no: [57] }
    }
  }
};

/* Sentence Builder: two-or-three-word sentences made of the same simple patterns (tap the word cards into order, then read it). */
window.TC_CONTENT.sentences = {
  1: [ { no: 20, s: "It's a bus.", zh: "這是公車。", keys: [["bus"]] }, { no: 17, s: "It's a train.", zh: "這是火車。", keys: [["train"]] },
       { no: 18, s: "It's a taxi.", zh: "這是計程車。", keys: [["taxi"]] }, { no: 15, s: "It's a boat.", zh: "這是船。", keys: [["boat"]] } ],
  2: [ { no: 26, s: "He's my father.", zh: "他是我的爸爸。", keys: [["father"]] }, { no: 27, s: "She's my mother.", zh: "她是我的媽媽。", keys: [["mother"]] },
       { no: 30, s: "He's my grandpa.", zh: "他是我的爺爺。", keys: [["grandpa"]] }, { no: 32, s: "She's my grandma.", zh: "她是我的奶奶。", keys: [["grandma"]] } ],
  3: [ { no: 3, s: "It's a cat.", zh: "這是貓。", keys: [["cat"]] }, { no: 4, s: "It's a dog.", zh: "這是狗。", keys: [["dog"]] },
       { no: 139, s: "It can fly.", zh: "牠會飛。", keys: [["fly"]] } ],
  4: [ { no: 47, s: "Touch your nose.", zh: "摸摸你的鼻子。", keys: [["nose"]] }, { no: 65, s: "Touch your head.", zh: "摸摸你的頭。", keys: [["head"]] },
       { no: 66, s: "Touch your mouth.", zh: "摸摸你的嘴巴。", keys: [["mouth"]] } ],
  5: [ { no: 91, s: "It's sunny.", zh: "今天是晴天。", keys: [["sunny"]] }, { no: 93, s: "It's rainy.", zh: "今天下雨。", keys: [["rainy"]] },
       { no: 96, s: "It's windy.", zh: "今天颳風。", keys: [["windy"]] } ],
  6: [ { no: 70, s: "I can run.", zh: "我會跑。", keys: [["run"]] }, { no: 139, s: "I can fly.", zh: "我會飛。", keys: [["fly"]] },
       { no: 127, s: "I can walk.", zh: "我會走路。", keys: [["walk"]] } ]
};

/* Warm-up at the start of each gate (one short question; one word is enough). "[Name]" / "[age]" are filled in by the program. */
window.TC_CONTENT.greetings = {
  name: { teacher: "What's your name?", tzh: "你叫什麼名字？", no: [37], say: "I'm [Name].", keys: [["i", "am", "my", "[name]"]] }
};
window.TC_CONTENT.greetingOrder = { 1: "name", 2: "name", 3: "name", 4: "name", 5: "name", 6: "name" };

/* One list of "teacher asks → child says" lines per gate, used by the 📋 popup, the guide and the gate host cards,
   so the printed scripts always match the games.  row = { t, tzh, say, word, zh, no, kind: "hello" | "q" | "extra" | "last" } */
window.TC_SCRIPT = function (gate) {
  const C = window.TC_CONTENT, G = C.gates[gate], gr = C.greetings[C.greetingOrder[gate]], rows = [];
  const cap = (w) => w[0].toUpperCase() + w.slice(1);
  rows.push({ kind: "hello", t: gr.teacher, tzh: gr.tzh, say: gr.say.replace("[Name]", "Amy").replace("[age]", "nine"), word: gr.word || "", zh: "", no: (gr.no || []).join("、") });
  const q = (it, say, w) => rows.push({ kind: "q", t: G.teacher, tzh: G.tzh, say, word: w, zh: it.zh || "", no: it.no });
  if (G.key === "kart" || G.key === "hatch") G.items.forEach((it) => q(it, it.say, it.w));
  if (G.key === "craft") G.family.forEach((f) => rows.push({ kind: "q", t: f.he ? "Who is he?" : "Who is she?", tzh: f.he ? "他是誰？" : "她是誰？", say: f.say, word: f.w, zh: f.zh, no: f.no }));
  if (G.key === "beat") G.parts.forEach((p) => q(p, p.say, p.w));
  if (G.key === "box") G.weather.forEach((x) => q(x, x.say, x.w));
  if (G.key === "obby") G.moves.forEach((m) => q(m, m.say, m.w));
  if (G.follow) rows.push({ kind: "extra", t: G.follow.teacher, tzh: G.follow.zh, say: "Yes! / No!", word: "yes no", zh: "中級加問：bird、duck 答 Yes，其他答 No（說哪個都過關）", no: (G.follow.no || []).join("、") });
  const F = G.finale;
  rows.push({ kind: "last", t: F.teacher, tzh: F.zh, say: F.say.replace("[animal]", "cat"), word: F.word || (F.say.includes("[animal]") ? "cat" : ""), zh: "", no: (F.no || []).join("、") });
  return rows;
};
