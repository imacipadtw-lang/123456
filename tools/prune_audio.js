/* Lists (and with --apply removes) ElevenLabs clips that no screen can say any more, so the offline ZIP and the
   claude.ai backup (at most 512 files per version) do not carry dead files.
   A clip is kept when its key is one of the lines found by tools/need_audio.js (run with --keys).
   The Wikimedia human recordings (credits.json) are never touched: they stay as a setting.
   usage: node tools/prune_audio.js [--apply] */
const fs = require("fs"), path = require("path"), cp = require("child_process");
const R = path.join(__dirname, "..", "english-quest", "assets", "audio");
const keys = new Set(JSON.parse(cp.execFileSync("node", [path.join(__dirname, "need_audio.js"), "--keys"], { encoding: "utf8" })));
// keep the lines of the Final Gate and the scratch card even if a scan misses them
["we are friends", "we are", "who are we", "ten points", "twenty points", "thirty points", "welcome", "go", "say it", "what's in the box", "your turn"].forEach((k) => keys.add(k));
const apply = process.argv.includes("--apply");
let gone = 0;
for (const [man, v] of [["ai-sentences", "TC_AI_AUDIO"], ["el-words", "TC_EL_AUDIO"]]) {
  const f = path.join(R, man + ".json"), m = JSON.parse(fs.readFileSync(f, "utf8"));
  const dead = Object.keys(m).filter((k) => !keys.has(k) && !keys.has(k.replace(/-/g, " ")));
  console.log(`${man}: ${Object.keys(m).length} clips, ${dead.length} no longer used${dead.length ? ": " + dead.join(" | ") : ""}`);
  if (!apply) continue;
  for (const k of dead) { const file = path.join(R, m[k].file); if (fs.existsSync(file)) fs.unlinkSync(file); delete m[k]; gone++; }
  fs.writeFileSync(f, JSON.stringify(m, null, 1));
  fs.writeFileSync(path.join(R, man + ".js"), "/* Clips made with ElevenLabs text-to-speech (AI voice, not human recordings) — generated from " + man + ".json. */\nwindow." + v + " = " + JSON.stringify(m, null, 1) + ";\n");
}
console.log(apply ? `removed ${gone} clips` : "(nothing removed — add --apply)");
