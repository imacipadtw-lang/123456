/* Lists every English word the TVs can say aloud, and which of them have no human recording yet.
   usage: node tools/vocab.js [--missing] */
const fs = require("fs"), path = require("path");
const R = path.join(__dirname, "..", "english-quest");
global.window = global;
for (const f of ["js/content.js", "js/passport-code.js", "assets/audio/credits.js"]) eval(fs.readFileSync(path.join(R, f), "utf8"));
const lines = new Set();
const KEYS = /^(say|s|after|w|human)$/; // what the TV itself says (teachers ask the questions in person)
(function walk(o, k) {
  if (typeof o === "string") { if (KEYS.test(k) && /[a-z]/i.test(o) && !/^#/.test(o)) lines.add(o); }
  else if (Array.isArray(o)) o.forEach((x) => walk(x, k));
  else if (o && typeof o === "object") for (const kk in o) walk(o[kk], /^\d+$/.test(kk) ? k : kk);
})(TC_CONTENT, "");
for (const L in TC_PASSCODE) TC_PASSCODE[L].forEach((e) => lines.add(e.w));
// literals passed to TC.speak(...) / reveal: "..." / say: "..." in code
const files = ["js/core.js", "js/station.js", "js/control.js", "js/puzzles.js", "opening.html", ...fs.readdirSync(path.join(R, "js/games")).map((f) => "js/games/" + f)];
for (const f of files) {
  const src = fs.readFileSync(path.join(R, f), "utf8");
  for (const m of src.matchAll(/TC\.speak\(\s*([^;]*?)\)\s*;/g)) for (const lit of m[1].matchAll(/`([^`]*)`|"([^"]*)"/g)) lines.add((lit[1] || lit[2]).replace(/\$\{[^}]*\}/g, " "));
  for (const m of src.matchAll(/\b(?:say|human):\s*"([^"]*)"/g)) lines.add(m[1]);
}
["ten", "fifteen", "twenty", "thirty", "fifty", "one", "hundred", "points"].forEach((w) => lines.add(w)); // scratch-card points
const words = {};
for (const l of lines) l.replace(/\[[^\]]*\]/g, " ").replace(/[‘’]/g, "'").toLowerCase().replace(/[^a-z'\- ]/g, " ").split(/\s+/).map((w) => w.replace(/^['-]+|['-]+$/g, "")).filter(Boolean)
  .forEach((w) => (w.startsWith("letter-") ? [w] : w.split("-")).forEach((x) => x && (words[x] = (words[x] || 0) + 1)));
const all = Object.keys(words).sort(), miss = all.filter((w) => !TC_AUDIO[w.replace(/ /g, "-")] && !TC_AUDIO[w]);
if (process.argv.includes("--missing")) console.log(miss.join("\n"));
else { console.log("lines", lines.size, "| words", all.length, "| human", all.length - miss.length, "| missing", miss.length); console.log(miss.join(" ")); }
