/* 注音 of gates 7 and 8 (js/content.js): every [text, 注音] pair must carry exactly one syllable per Chinese character,
   every syllable must be made of 注音 symbols with at most one tone mark, and the list of all pairs is printed so that
   a teacher can read it through.   usage: node tools/tests/zhuyin.js [--list] */
const fs = require("fs"), path = require("path");
global.window = global; eval(fs.readFileSync(path.join(__dirname, "../../english-quest/js/content.js"), "utf8"));
const pairs = [], add = (a, where) => { if (Array.isArray(a)) pairs.push([a[0], a[1], where]); };
for (const [n, G] of Object.entries(TC_CONTENT.gates)) { if (!G.items) continue; add(G.q, "gate " + n);
  for (const x of G.items) { add(x.q, n + "/" + x.id); add(x.zh, n + "/" + x.id); add(x.fact, n + "/" + x.id); (x.opts || []).forEach((o) => add(o.zh, n + "/" + x.id)); } }
const SYL = /^˙?[ㄅ-ㄩ]{1,3}[ˊˇˋ]?$/; let bad = 0;
for (const [t, z, w] of pairs) { const han = t.match(/[一-鿿]/g) || [], syl = z.trim().split(/\s+/);
  const err = han.length !== syl.length ? `${han.length} characters but ${syl.length} syllables` : syl.find((s) => !SYL.test(s) || (/^˙/.test(s) && /[ˊˇˋ]$/.test(s))) ? "a syllable is not well formed" : "";
  if (err) { bad++; console.log("FAIL " + w + ": " + t + " — " + err); }
  if (process.argv.includes("--list")) console.log(han.map((c, i) => c + "(" + syl[i] + ")").join(" ")); }
console.log(`${bad ? "FAIL" : "PASS"} 注音: ${pairs.length} texts, ${bad} with a problem`); process.exit(bad ? 1 : 0);
