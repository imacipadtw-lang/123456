#!/usr/bin/env node
/* Obfuscate ONE code file for the classroom edition.
   Reads JavaScript on stdin, writes obfuscated+minified JavaScript on stdout.

   Only the game's own CODE files go through here (core.js, art*.js, ollie3d.js, the game engines, toys.js,
   station.js …). The DATA scripts — js/content.js output, the audio manifests and the base64 sound blob — are
   NEVER passed in: obfuscating megabytes of base64 would bloat the file and buy nothing.

   The one rule that must hold: renameGlobals=false. Every file talks to the others through the shared globals
   (window.TC, TC_CONTENT, TC_SCHOOL, TC_SCRIPT, TC_AUDIO_DATA …); rename those and the game stops working. Only
   each file's own inner names are scrambled. Settings are kept conservative on purpose — no control-flow
   flattening, no self-defending, no debug traps — so nothing janks the animations or the WebGL loops on an
   ordinary classroom computer. It just comes out as one unreadable blob that still runs.

   Each file is obfuscated on its own, but they all run in the SAME page scope. javascript-obfuscator puts a
   string-array and its decoder at the top of every file; without a unique prefix those helpers take the same
   names in each file and clobber each other across <script> tags (one file's calls then hit another file's
   array → "x is not a function" everywhere). So every file MUST get its own identifiersPrefix — passed as the
   first argument — which renames those top-level helpers uniquely and keeps the files from colliding.

   usage:  node tools/obfuscate.js <uniquePrefix> < in.js > out.js
*/
"use strict";
const JO = require(require("child_process").execSync("npm root -g").toString().trim() + "/javascript-obfuscator");
const PREFIX = (process.argv[2] || "_o_").replace(/[^A-Za-z0-9_$]/g, "") || "_o_";

let src = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (src += c));
process.stdin.on("end", () => {
  try {
    const out = JO.obfuscate(src, {
      compact: true,
      simplify: true,
      renameGlobals: false,            // keep TC / TC_CONTENT / window.* so the files still talk to each other
      identifiersPrefix: PREFIX,       // unique per file: stops the string-array helpers colliding across <script> tags
      identifierNamesGenerator: "mangled",
      stringArray: true,
      stringArrayThreshold: 0.8,
      stringArrayEncoding: ["base64"], // light; rc4 would slow startup on classroom PCs
      stringArrayCallsTransform: false,
      splitStrings: false,
      numbersToExpressions: false,
      controlFlowFlattening: false,    // big perf hit + breakage risk on animation loops — off
      deadCodeInjection: false,
      selfDefending: false,
      debugProtection: false,
      disableConsoleOutput: false,
      unicodeEscapeSequence: false,
      target: "browser",
    }).getObfuscatedCode();
    process.stdout.write(out);
  } catch (e) {
    process.stderr.write("obfuscate failed: " + (e && e.message) + "\n");
    process.exit(1);
  }
});
