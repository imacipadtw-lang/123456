/* Checks Ollie's lines (TC.speak literals): the TV only plays a piece of a line when ONE human recording covers it,
   so every fixed piece should be a single recorded word or phrase. Pieces containing ${…} (the child's name, the
   answer word) are skipped here; answer words are checked by tools/vocab.js.   usage: node tools/lines.js */
const fs = require("fs"), path = require("path"), R = path.join(__dirname, "..", "english-quest");
global.window = global; eval(fs.readFileSync(path.join(R, "assets/audio/credits.js"), "utf8"));
const has = (w) => !!(TC_AUDIO[w] || TC_AUDIO[w.replace(/ /g, "-")]);
const files = ["js/core.js", "js/station.js", "js/control.js", "js/puzzles.js", "js/scratch.js", "opening.html", ...fs.readdirSync(path.join(R, "js/games")).map((f) => "js/games/" + f)];
let n = 0, silent = 0;
for (const f of files) {
  const src = fs.readFileSync(path.join(R, f), "utf8");
  const lits = [...src.matchAll(/TC\.speak\(\s*(`[^`]*`|"[^"]*")(\s*,\s*\{[^}]*human:\s*"([^"]*)")?/g)].map((m) => ({ t: m[1].slice(1, -1), human: m[3] }));
  for (const m of src.matchAll(/\bsay:\s*"([^"]*)",\s*build/g)) lits.push({ t: m[1] });
  for (const { t, human } of lits) {
    n++;
    const pieces = (human != null ? human : t).split(/[.!?…,;:]+/).map((x) => x.trim()).filter(Boolean);
    const quiet = pieces.filter((p) => !p.includes("${") && !has(p.toLowerCase().replace(/[^a-z' ]/g, "").trim()));
    if (quiet.length) { silent++; console.log(`${f}: "${t}"  → shown as subtitle only: ${quiet.join(" | ")}`); }
  }
}
console.log(`${n} lines checked; ${silent} have a piece that is subtitle-only (no single recording)`);
