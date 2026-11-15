/* Lists every word or phrase the TVs say aloud (each must be ONE human recording) and which have no recording yet.
   The TVs say: the answer word/phrase of every question, the passport-code words, a few interjections, and the
   number words for scratch-card points.   usage: node tools/vocab.js [--missing] */
const fs = require("fs"), path = require("path");
const R = path.join(__dirname, "..", "english-quest");
global.window = global;
for (const f of ["js/content.js", "js/passport-code.js", "assets/audio/credits.js"]) eval(fs.readFileSync(path.join(R, f), "utf8"));
const need = new Set(["yes", "no", "wow", "great", "go", "ok", "hello", "welcome", "good", "ten", "fifteen", "twenty", "thirty", "fifty", "cheese", "friend", "open"]);
for (let g = 1; g <= 6; g++) for (const r of TC_SCRIPT(g)) (r.kind === "extra" ? r.word.split(" ") : [r.word]).forEach((w) => w && need.add(w.toLowerCase()));
for (const L in TC_PASSCODE) TC_PASSCODE[L].forEach((e) => need.add(e.w.toLowerCase()));
Object.values(TC_CONTENT.gates).forEach((G) => { if (G.colors) Object.keys(G.colors).forEach((c) => need.add(c)); if (G.items) G.items.forEach((i) => need.add(i.w)); });
const has = (w) => !!(TC_AUDIO[w] || TC_AUDIO[w.replace(/ /g, "-")]);
const all = [...need].sort(), miss = all.filter((w) => !has(w));
if (process.argv.includes("--missing")) console.log(miss.join("\n"));
else { console.log("spoken words/phrases", all.length, "| with a human recording", all.length - miss.length, "| missing", miss.length); console.log(miss.join(" | ")); }
