/* =====================================================================
   Content for the six gates.
   · Six themes chosen by the teacher, one per gate: 1 greetings, 2 numbers,
     3 colours, 4 weather, 5 feelings, 6 animals. The words come from
     《土城國小英語護照》; "no" is the passport word number so teachers can
     check it against the book ("hello" is the only answer not in the passport).
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
    /* ---------------- Gate 1 · Hello Run — GREETINGS: "What do you say?" ---------------- */
    1: {
      key: "obby", title: "Hello Run", zh: "打招呼跑酷", city: "San Diego", color: "#ff9a2e",
      genre: "Obby / runner 障礙跑酷", passport: "問候語：第25關 Good morning / Good night · 第6關 thank · 第24關 sorry",
      teacher: "What do you say?", tzh: "這時候要說什麼？",
      // img = picture of the situation; the child says the greeting
      scenes: [
        { w: "hello", no: "", zh: "你好（見到朋友）", img: "greet-hello", say: "Hello!", keys: [["hello", "hi"]] },
        { w: "good morning", no: 683, zh: "早安（太陽出來了）", img: "greet-morning", say: "Good morning!", keys: [["morning"]] },
        { w: "good night", no: 684, zh: "晚安（要睡覺了）", img: "greet-night", say: "Good night!", keys: [["night"]] },
        { w: "thank you", no: 124, zh: "謝謝（收到禮物）", img: "greet-thanks", say: "Thank you!", keys: [["thank", "thanks"]] },
        { w: "sorry", no: 651, zh: "對不起（不小心撞到）", img: "greet-sorry", say: "Sorry!", keys: [["sorry"]] }
      ],
      finale: { teacher: "Are you happy?", zh: "你開心嗎？", say: "Yes!", keys: [["yes", "yeah"]], word: "yes", no: [255] }
    },

    /* ---------------- Gate 2 · Turbo Talk Kart — NUMBERS: "How many?" ---------------- */
    2: {
      key: "kart", title: "Turbo Talk Kart", zh: "極速英語賽車", city: "Tokyo", color: "#4cc9ff",
      genre: "Kart racing 賽車遊戲", passport: "第7關 數字 1–10",
      teacher: "How many?", tzh: "有幾顆星星？",
      numbers: {
        1: { w: "one", no: 142 }, 2: { w: "two", no: 143 }, 3: { w: "three", no: 144 }, 4: { w: "four", no: 145 }, 5: { w: "five", no: 146 },
        6: { w: "six", no: 147 }, 7: { w: "seven", no: 148 }, 8: { w: "eight", no: 149 }, 9: { w: "nine", no: 150 }, 10: { w: "ten", no: 151 }
      },
      finale: { teacher: "Are you tired?", zh: "你累了嗎？", say: "No!", keys: [["no", "yes", "yeah"]], word: "no", no: [260] }
    },

    /* ---------------- Gate 3 · Pixel Craft — COLOURS: "What color is it?" ---------------- */
    3: {
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

    /* ---------------- Gate 4 · Mystery Box — WEATHER: "How's the weather?" ---------------- */
    4: {
      key: "box", title: "Mystery Box", zh: "神秘盲盒", city: "Vancouver", color: "#9b6bff",
      genre: "Mystery box / unboxing 開箱驚喜", passport: "第5關 天氣",
      teacher: "How's the weather?", tzh: "天氣怎麼樣？",
      // the weather that bursts out of the box (img = picture name drawn by the game)
      weather: [
        { w: "sunny", no: 91, zh: "晴天", img: "wx-sunny", say: "It's sunny." },
        { w: "rainy", no: 93, zh: "下雨", img: "wx-rainy", say: "It's rainy." },
        { w: "cloudy", no: 95, zh: "多雲", img: "wx-cloudy", say: "It's cloudy." },
        { w: "windy", no: 96, zh: "颳風", img: "wx-windy", say: "It's windy." },
        { w: "snowy", no: 101, zh: "下雪", img: "wx-snowy", say: "It's snowy.", keys: [["snowy", "snow", "snowing"]] }
      ],
      finale: { teacher: "Is it hot?", zh: "現在很熱嗎？", say: "Yes!", keys: [["yes", "yeah", "no"]], word: "yes", no: [90] }
    },

    /* ---------------- Gate 5 · Beat Party — FEELINGS: "How are you?" ---------------- */
    5: {
      key: "beat", title: "Beat Party", zh: "英語節奏派對", city: "Cairo", color: "#ff5fa2",
      genre: "Rhythm & dance 節奏舞蹈", passport: "第10關 心情 · 第3關 hungry",
      teacher: "How are you?", tzh: "你現在覺得怎麼樣？",
      // img = picture of a face showing this feeling
      feelings: [
        { w: "happy", no: 255, zh: "開心", img: "feel-happy", say: "I'm happy." },
        { w: "sad", no: 257, zh: "傷心", img: "feel-sad", say: "I'm sad." },
        { w: "angry", no: 256, zh: "生氣", img: "feel-angry", say: "I'm angry." },
        { w: "tired", no: 260, zh: "好累", img: "feel-tired", say: "I'm tired." },
        { w: "hungry", no: 59, zh: "肚子餓", img: "feel-hungry", say: "I'm hungry." },
        { w: "scared", no: 261, zh: "害怕", img: "feel-scared", say: "I'm scared." }
      ],
      finale: { teacher: "Photo time!", zh: "拍照囉！大家看鏡頭", say: "Cheese!", keys: [["cheese"]], word: "cheese", no: [697] }
    },

    /* ---------------- Gate 6 · Pet Hatch — ANIMALS: "What is it?" ---------------- */
    6: {
      key: "hatch", title: "Pet Hatch", zh: "英語寵物孵蛋", city: "Paris", color: "#ffc83d",
      genre: "Egg hatching & pets 孵蛋收集", passport: "第1關 動物 · 第6關 can / fly",
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
    }
  }
};

/* Sentence Builder: two-or-three-word sentences made of the same simple patterns (tap the word cards into order, then read it). */
window.TC_CONTENT.sentences = {
  1: [ { no: 683, s: "Good morning!", zh: "早安！", keys: [["morning"]] }, { no: 684, s: "Good night!", zh: "晚安！", keys: [["night"]] },
       { no: 124, s: "Thank you!", zh: "謝謝你！", keys: [["thank", "thanks"]] } ],
  2: [ { no: 146, s: "Five stars.", zh: "五顆星星。", keys: [["five"]] }, { no: 144, s: "Three stars.", zh: "三顆星星。", keys: [["three"]] },
       { no: 151, s: "Ten stars.", zh: "十顆星星。", keys: [["ten"]] } ],
  3: [ { no: 505, s: "It's red.", zh: "它是紅色的。", keys: [["red"]] }, { no: 507, s: "It's blue.", zh: "它是藍色的。", keys: [["blue"]] },
       { no: 508, s: "It's yellow.", zh: "它是黃色的。", keys: [["yellow"]] }, { no: 506, s: "It's green.", zh: "它是綠色的。", keys: [["green"]] } ],
  4: [ { no: 91, s: "It's sunny.", zh: "今天是晴天。", keys: [["sunny"]] }, { no: 93, s: "It's rainy.", zh: "今天下雨。", keys: [["rainy"]] },
       { no: 96, s: "It's windy.", zh: "今天颳風。", keys: [["windy"]] } ],
  5: [ { no: 255, s: "I'm happy.", zh: "我很開心。", keys: [["happy"]] }, { no: 257, s: "I'm sad.", zh: "我很傷心。", keys: [["sad"]] },
       { no: 59, s: "I'm hungry.", zh: "我肚子餓。", keys: [["hungry"]] } ],
  6: [ { no: 3, s: "It's a cat.", zh: "這是貓。", keys: [["cat"]] }, { no: 4, s: "It's a dog.", zh: "這是狗。", keys: [["dog"]] },
       { no: 139, s: "It can fly.", zh: "牠會飛。", keys: [["fly"]] } ]
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
  rows.push({ kind: "hello", t: gr.teacher, tzh: gr.tzh, say: gr.say.replace("[Name]", "___").replace("[age]", "nine"), word: gr.word || "", zh: "", no: (gr.no || []).join("、") });
  const q = (it, say, w) => rows.push({ kind: "q", t: G.teacher, tzh: G.tzh, say, word: w, zh: it.zh || "", no: it.no });
  if (G.key === "obby") G.scenes.forEach((x) => q(x, x.say, x.w));
  if (G.key === "kart") Object.entries(G.numbers).forEach(([n, v]) => q({ zh: n + " 顆星星", no: v.no }, cap(v.w) + "!", v.w));
  if (G.key === "craft") Object.entries(G.colors).forEach(([c, v]) => q(v, v.say, c));
  if (G.key === "box") G.weather.forEach((x) => q(x, x.say, x.w));
  if (G.key === "beat") G.feelings.forEach((x) => q(x, x.say, x.w));
  if (G.key === "hatch") G.items.forEach((it) => q(it, it.say, it.w));
  if (G.follow) rows.push({ kind: "extra", t: G.follow.teacher, tzh: G.follow.zh, say: "Yes! / No!", word: "yes no", zh: "中級加問：bird、duck 答 Yes，其他答 No（說哪個都過關）", no: (G.follow.no || []).join("、") });
  const F = G.finale;
  rows.push({ kind: "last", t: F.teacher, tzh: F.zh, say: F.say.replace("[animal]", "cat").replace("[color]", "blue"), word: F.word || (F.say.includes("[animal]") ? "cat" : F.say.includes("[color]") ? "blue" : ""), zh: "", no: (F.no || []).join("、") });
  return rows;
};
