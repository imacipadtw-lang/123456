/* Lists every line Ollie can say (TC.speak literals) and whether it is fully covered by human recordings.
   ${...} parts (the child's name, the item word, a number) are shown as {…}; names are skipped when spoken. */
const fs = require("fs"), path = require("path"), R = path.join(__dirname, "..", "english-quest");
global.window = global; eval(fs.readFileSync(path.join(R, "assets/audio/credits.js"), "utf8"));
const has = (w) => !!(TC_AUDIO[w] || TC_AUDIO[w.replace(/ /g, "-")]);
const files = ["js/core.js", "js/station.js", "js/control.js", "js/puzzles.js", "js/scratch.js", "opening.html", ...fs.readdirSync(path.join(R, "js/games")).map((f) => "js/games/" + f)];
let bad = 0, n = 0;
for (const f of files) {
  const src = fs.readFileSync(path.join(R, f), "utf8");
  const lits = [...src.matchAll(/TC\.speak\(\s*(`[^`]*`|"[^"]*")(\s*,\s*\{[^}]*human:\s*"([^"]*)")?/g)].map((m) => ({ t: m[1].slice(1, -1), human: m[3] }));
  for (const m of src.matchAll(/\bsay:\s*"([^"]*)",\s*build/g)) lits.push({ t: m[1] });
  for (const { t, human } of lits) {
    n++;
    const line = (human != null ? human : t).replace(/\$\{[^}]*\}/g, " ");
    const miss = line.toLowerCase().replace(/[^a-z' ]/g, " ").split(/\s+/).filter(Boolean).filter((w) => !has(w));
    if (miss.length) { bad++; console.log(`${f}: "${t}"${human != null ? ` [human: "${human}"]` : ""}  → no clip: ${miss.join(", ")}`); }
  }
}
console.log(`${n} lines, ${n - bad} fully human`);
