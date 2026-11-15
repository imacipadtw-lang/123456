/* Prints every multi-word English line the TVs can say (Ollie's lines with the child's name removed, and every
   model sentence a child is asked to say), one per line, de-duplicated.  usage: node tools/lines_list.js */
const fs = require("fs"), path = require("path"), R = path.join(__dirname, "..", "english-quest");
global.window = global; eval(fs.readFileSync(path.join(R, "js/content.js"), "utf8"));
const out = new Set(), C = TC_CONTENT;
const add = (t) => { t = String(t).replace(/\$\{[^}]*\}/g, "").replace(/\[[^\]]*\]/g, "").replace(/\s+([,.!?])/g, "$1").replace(/,\s*!/g, "!").replace(/\s{2,}/g, " ").trim(); if (t.split(/\s+/).length > 1) out.add(t); };
for (let g = 1; g <= 6; g++) TC_SCRIPT(g).forEach((r) => r.say.split(" / ").forEach(add));
Object.values(C.sentences).flat().forEach((s) => add(s.s));
const G = C.gates; if (G[3].follow) Object.values(G[3].follow.after).forEach(add);
G[3].items.forEach((it) => add(G[3].finale.say.replace("[animal]", it.w)));
// Ollie's literal lines in code
const files = ["js/core.js", "js/station.js", "js/control.js", "js/puzzles.js", "js/scratch.js", "opening.html", ...fs.readdirSync(path.join(R, "js/games")).map((f) => "js/games/" + f)];
for (const f of files) {
  const src = fs.readFileSync(path.join(R, f), "utf8");
  for (const m of src.matchAll(/TC\.speak\(\s*(`[^`]*`|"[^"]*")/g)) add(m[1].slice(1, -1));
  for (const m of src.matchAll(/\bsay:\s*"([^"]*)",\s*build/g)) add(m[1]);
}
// "Yes! " + item sentences that games build at run time
for (const it of G[1].items) add("Yes! " + it.say); for (const it of G[3].items) add("Yes! " + it.say);
for (const f of G[2].family) add("Yes! " + f.say); for (const x of G[5].weather) add("Yes! " + x.say);
for (const m of G[6].moves) add(m.say); for (const p of G[4].parts) add(p.say);
console.log([...out].sort().join("\n"));
