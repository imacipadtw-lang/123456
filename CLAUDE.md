# Project rules (土城國小 English Day)

- The app lives in `english-quest/` (static HTML/JS, no build step).
- **Every screen has two addresses** — main on GitHub Pages and a backup on claude.ai — kept in `english-quest/js/links.js`
  and shown on `links.html`, the guide and the gate host cards. After every change: commit, push this branch
  (GitHub Pages updates automatically via `.github/workflows/pages.yml`), **and** republish the claude.ai backup
  (see `deploy/publish-claude.md`; one version of the backup holds at most 512 files) to the same URL.
- English pronunciation (the teacher's decision, November 2026): every line the games speak is a clip made with the school's
  ElevenLabs account, model `eleven_multilingual_v2`, in TWO lively voices so that a woman's and a man's voice are heard equally:
  "Bella - Professional, Bright, Warm" (`el-words.json`, `ai-sentences.json`) and "Liam - Energetic, Social Media Creator"
  (`m-words.json`, `m-sentences.json`, files under `assets/audio/m/`; the pages load the short list `voice-m.js` made by
  `python3 tools/pack_voice.py`). `TC.voiceOf(role)` in `js/core.js` decides: gates 1, 3, 5 — Ollie's lines in the woman's voice and
  the 🔊 model answer in the man's; gates 2, 4, 6 the other way round; praise at random. A line must NEVER fall back to the browser's
  robotic computer voice. These are AI voices: `credits.html`, the guide and the README must say so and never call them human
  recordings; the game and show screens carry no voice label (the teacher does not want one on the big screen). The Wikimedia human recordings (`credits.json`, speaker / licence / download time) stay as a setting.
  A new spoken line needs a clip: `node tools/need_audio.js` must report 0 missing (`node tools/prune_audio.js` lists clips no screen uses), and `tools/verify_sentences.py` /
  `tools/verify_audio.py` must be run; report honestly which clips the recogniser could not confirm. (2026-11-24: 68 words + 80 sentences per voice; `voice-m.js` lists 148.)
- The venue has no microphone and children do not carry the passport booklet: the microphone stays off by default, nothing may
  depend on listening or loudness, and no step may need the booklet. The level (低／中／高年級) is chosen on the home page.
- Content (the teacher's decision, November 2026): in every gate every sentence comes from the school booklet 《校園生活英語》 units (1)–(9)
  (the teacher's photographs); only the shortest, easiest lines, each with its "(unit)-line" in `js/content.js`. The children must
  never get stuck in front of guests, but the CHILD always says the line first (the teacher, 2026-11-21): Ollie asks the question
  and never reads the answer by himself — he models it only when the teacher presses 🔊 聽示範 (or H). No automatic model, no timer.
  When he models, he reads only the whole sentence, never the answer word on its own first (the teacher, 2026-11-21): `TC.model` in
  `js/core.js` plays just the sentence (its clip, or its pieces in order) — the standalone answer-word clip was removed.
- Gates 7–8 (Holiday Party, Hello, America!) were REMOVED on 2026-11-24 (the teacher: 「先刪除第七關節日大派對跟第八關美國文化」);
  the game has SIX gates, all from the booklet. Their code is only in git history (added in commit 85eca9a).
- Levels: 低年級 = big/small letters and "Ollie says a word, do the action" only (no booklet sentence in the question bar);
  (Every gate screen has the 低／中／高年級 switch at the top, usable at any time; the home campus flags 1–6 link to the gates.)
  中年級 = booklet sentences shown in full, never a blank — the child reads the sentence out;
  高年級 = booklet answer sentences with the answer word blank and two word buttons — tap the right word, then read it out.
- The home page (and the backup launcher) is ONE screen with exactly the SIX gates (3 tiles left, 3 right, the 3D campus between them) plus the level buttons; nothing else can be
  tapped there — no tools, no opening / Final Gate tiles — and nothing scrolls (`node tools/tests/home-fit.js` expects 6). Its header shows
  the school emblem BIG (a 3D medal that turns 360°, `TC.coin3d`) and the 3D Ollie; the teacher wants emblems large, never tiny. The other
  pages (`control.html`, `opening.html`, `quest-card.html`, `guide.html`, `teacher-cards.html`, `links.html`, `credits.html`)
  are opened by address. The printable card (`quest-card.html`) has SIX sticker places (the teacher, 2026-11-22: 闖關只有六關)
  and NO letter boxes: per gate only its number and country (1 美國 … 6 法國), nothing inside the circles; Ollie on the card; one bottom line
  「六個章都蓋滿，就可以到終點站領取小獎品！」.
- Classroom edition (the teacher, 2026-11-21: the day must not depend on the network, and the files must not spread): after a
  change, also rebuild the single-file classroom edition — `python3 tools/build_classroom.py <dir outside the repo>` (one
  self-contained HTML per gate, all six, with only that gate's questions, plus Final Gate and opening show) — check it with
  `node tools/tests/room-fit.js <dir>` and send the ZIP to the teacher. Every game screen must fit ONE page of the big screen:
  no scrolling, no button off the screen. Every badge that goes home carries the tag 「回首頁 HOME」.
  The classroom build obfuscates + minifies the game's own code (the teacher, 2026-11-21: harder to peek at or copy once the files
  are out) via `tools/obfuscate.js` (javascript-obfuscator; `npm i -g javascript-obfuscator`); only CODE files go through it — the
  question data, the audio manifests and the base64 sound blob are left alone. Each file gets its own `identifiersPrefix` so the
  per-file string-array helpers don't collide across the many `<script>` blocks on one page, and `renameGlobals` stays off so the
  files still talk through `TC` / `window.*`. `python3 tools/build_classroom.py <dir> --no-obfuscate` skips it for debugging. The
  ONLINE versions (GitHub Pages, claude.ai backup) are NOT obfuscated.
- Prizes (the teacher, 2026-11-21): a child (a parent may come along) plays only the gates of their OWN level; the six gates give six
  point stickers (10 / 20 / 30 points, one per gate). All six gates = a snack (點心) and a drink; a total of more than 100 points =
  one more small snack (小點心). Say 點心／小點心 in the pages, not 餅乾.
  The Final Gate uses the six letters FRIEND; its point buttons go 60…180.
- More than one session may work on this branch: `git fetch` and merge before pushing, never force-push, and keep the other
  session's flow decisions unless the teacher says otherwise.
- Artwork is original (drawn in code in `english-quest/js/art.js`); no third-party images.
  `js/toys.js` (own code and art) puts tappable toys in the background of every gate scene and the START screen (a ball into
  the hoop in gate 3's gym; globes, balloons, stars that spin 360°): for fun only — their counter has NO prize meaning and
  they never speak. Ollie in real 3D (360°, a finger can
  spin him) is `english-quest/js/ollie3d.js`: our own small WebGL renderer, model and animations — no 3D library, no downloaded
  model. It carries a copy of the school emblem made by `python3 tools/embed_emblem.py` (run it again if the emblem SVG changes)
  and falls back to the flat picture where WebGL is missing. New actions go into its `A` table (and `WORD` for 低年級 words).
- The school itself is in the game (the teacher, 2026-11-21): `english-quest/js/campus3d.js` is our own 3D model of the campus
  (track, classroom block, footbridge, big trees, solar roof, banana grove, paddies, greenhouses, mountains) built with the kit of
  `ollie3d.js`; it turns 360° and carries the six numbered gate flags (links to the gates). It sits in the middle of the home page (and of
  the backup launcher) with the six gates round it, and on the first slide of the opening show. It was modelled after the real layout seen in a public
  aerial video; no frame of that video may be used. A tap on the home campus (not a drag, not a flag) plays a surprise
  (the teacher, 2026-11-24): fireworks, rain + rainbow, the 1921 gold medal, a relay race with confetti, a hot-air balloon, the school
  bell (Westminster chime, synthesised) with dancing flags, Ollie flying past — a different one each tap (`surprise: true`); sound
  effects only, nothing spoken. Pictures should be lively: props and badges turn a full 360° (`.turn360`).
- Before pushing: load every page in headless Chromium with no errors (`node tools/tests/pages.js`: 15 pages with gates 1–6, 6 host cards,
  6 sticker places); play at least one gate
  end to end (`node tools/tests/e2e.js <base> <gates, default 1–6> <levels 1,2,3>`; with `SLOW=4500 FAKE_TTS=1` in front it taps the 高年級 word buttons,
  presses 🔊 so every model line plays, and lists the lines a computer voice had to read — there must be none);
  `node tools/tests/opening.js <base>` does the same for the opening show.
