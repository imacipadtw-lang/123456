/* Lists every line the TVs may say aloud that has NO audio clip yet, so they can all be generated in one batch with
   ElevenLabs (words → assets/audio/el-words, sentences → assets/audio/ai-sentences).
   Sources: js/content.js (all gates) + literal strings in TC.speak("...") / TC.teacherLine("...") calls of the game files.
   usage: node tools/need_audio.js [--json]     (writes tools/el-need.json with --json) */
const fs = require("fs"), path = require("path");
const R = path.join(__dirname, "..", "english-quest");
global.window = global;
for (const f of ["js/content.js", "assets/audio/credits.js", "assets/audio/el-words.js", "assets/audio/ai-sentences.js"]) eval(fs.readFileSync(path.join(R, f), "utf8"));
const norm = (t) => t.toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9' -]/g, "").replace(/\s+/g, " ").trim();
const have = (k) => !!(TC_AUDIO[k] || TC_AUDIO[k.replace(/ /g, "-")] || TC_EL_AUDIO[k] || TC_AI_AUDIO[k]);
const texts = new Set(), add = (t) => { if (t && /[a-z]/i.test(t)) String(t).replace(/\[[^\]]*\]/g, " ").split(/[.!?…,;:]+/).map((x) => x.trim()).filter((x) => /[a-z]/i.test(x)).forEach((x) => texts.add(x)); };
const C = TC_CONTENT;
for (let g = 1; g <= 6; g++) {
  const G = C.gates[g]; add(G.teacher);
  (G.scenes || []).forEach((x) => { add(x.say); add(x.w); });
  (G.qa || []).forEach((x) => { add(x.t); add(x.say); add(x.w); }); if (G.finale) { add(G.finale.t); add(G.finale.say); add(G.finale.w); }
  (G.actions || []).forEach((x) => { add(x.say); add(x.w); }); if (G.quiet) { add(G.quiet.say); add(G.wake.say); }
  (G.words || []).forEach((x) => add(x.w)); (G.lines || []).forEach((x) => { add(x.say); add(x.w); });
  (G.pages || []).forEach((x) => { add(x.t); add(x.say); add(x.w); }); if (G.ending) add(G.ending.say);
  (C.sentences[g] || []).forEach((x) => add(x.s));
}
add(C.greetings.name.teacher); add(C.clap.say); C.praise.forEach(add); add("Welcome"); add("Go");
// literal strings in the code
for (const f of ["js/station.js", "js/control.js", "js/core.js", "js/puzzles.js", "js/scratch.js", ...fs.readdirSync(path.join(R, "js/games")).filter((x) => x.endsWith(".js")).map((x) => "js/games/" + x)]) {
  const src = fs.readFileSync(path.join(R, f), "utf8"); let m; const re = /TC\.(?:speak|teacherLine)\(\s*(["'])((?:(?!\1).)*)\1/g;
  while ((m = re.exec(src))) if (!/\$\{/.test(m[2])) add(m[2]);
}
const miss = [...texts].filter((t) => !have(norm(t))).sort();
const words = miss.filter((t) => !/\s/.test(t)), sents = miss.filter((t) => /\s/.test(t));
const chars = (a) => a.reduce((s, t) => s + t.length + 1, 0);
if (process.argv.includes("--json")) fs.writeFileSync(path.join(__dirname, "el-need.json"), JSON.stringify({ words, sentences: sents }, null, 1));
console.log(`texts ${texts.size} | already have audio ${texts.size - miss.length} | missing ${miss.length} (words ${words.length} ≈ ${chars(words)} chars, sentences ${sents.length} ≈ ${chars(sents)} chars; total ≈ ${chars(miss)} of the 30,003 monthly)`);
console.log("WORDS:", words.join(" | ")); console.log("SENTENCES:\n" + sents.join("\n"));
