# Project rules (土城國小 English Day)

- The app lives in `english-quest/` (static HTML/JS, no build step).
- **Every screen has two addresses** — main on GitHub Pages and a backup on claude.ai — kept in `english-quest/js/links.js`
  and shown on `links.html`, the guide and the gate host cards. After every change: commit, push this branch
  (GitHub Pages updates automatically via `.github/workflows/pages.yml`), **and** republish the claude.ai backup
  (see `deploy/publish-claude.md`; one version of the backup holds at most 512 files) to the same URL.
- English pronunciation (the teacher's decision, November 2026): every line the games speak is a clip made with the school's
  ElevenLabs account (voice "Bella - Professional, Bright, Warm", model `eleven_multilingual_v2`), listed in
  `english-quest/assets/audio/el-words.json` and `ai-sentences.json`. It is an AI voice: pages and docs must say so, never call it
  a human recording. The Wikimedia human recordings (`credits.json`, speaker / licence / download time) stay as a setting.
  A new spoken line needs a clip: `node tools/need_audio.js` must report 0 missing (`node tools/prune_audio.js` lists clips no screen uses), and `tools/verify_sentences.py` /
  `tools/verify_audio.py` must be run; report honestly which clips the recogniser could not confirm.
- The venue has no microphone and children do not carry the passport booklet: the microphone stays off by default, nothing may
  depend on listening or loudness, and no step may need the booklet. The level (低／中／高年級) is chosen on the home page.
- Content (the teacher's decision, November 2026): every sentence comes from the school booklet 《校園生活英語》 units (1)–(9)
  (the teacher's photographs); only the shortest, easiest lines, each with its "(unit)-line" in `js/content.js`. The children must
  never get stuck in front of guests: Ollie always says the line first.
- Levels: 低年級 = big/small letters and "Ollie says a word, do the action" only (no booklet sentence in the question bar);
  中年級 = booklet sentences shown in full, never a blank — Ollie says the sentence first, the child says it after him;
  高年級 = booklet answer sentences with the answer word blank and two word buttons — tap the right word, then say it.
- The home page (and the backup launcher) is ONE screen with exactly the six gates plus the level buttons; nothing else can be
  tapped there — no tools, no opening / Final Gate tiles — and nothing scrolls (`node tools/tests/home-fit.js`). Its header shows
  the school emblem BIG (a 3D medal that turns 360°, `TC.coin3d`) and the 3D Ollie; the teacher wants emblems large, never tiny. The other
  pages (`control.html`, `opening.html`, `quest-card.html`, `guide.html`, `teacher-cards.html`, `links.html`, `credits.html`)
  are opened by address. The printable card (`quest-card.html`) has six sticker places and NO letter boxes.
- Prizes (the teacher, 2026-11-21): a child (a parent may come along) plays only the six gates of their OWN level and collects six
  point stickers (10 / 20 / 30 points, one per gate). All six gates = a snack (點心) and a drink; a total of more than 100 points =
  one more small snack (小點心). Say 點心／小點心 in the pages, not 餅乾.
- More than one session may work on this branch: `git fetch` and merge before pushing, never force-push, and keep the other
  session's flow decisions unless the teacher says otherwise.
- Artwork is original (drawn in code in `english-quest/js/art.js`); no third-party images. Ollie in real 3D (360°, a finger can
  spin him) is `english-quest/js/ollie3d.js`: our own small WebGL renderer, model and animations — no 3D library, no downloaded
  model. It carries a copy of the school emblem made by `python3 tools/embed_emblem.py` (run it again if the emblem SVG changes)
  and falls back to the flat picture where WebGL is missing. New actions go into its `A` table (and `WORD` for 低年級 words).
- Before pushing: load every page in headless Chromium with no errors (`node tools/tests/pages.js`); play at least one gate
  end to end (`node tools/tests/e2e.js <base> <gates> <levels 1,2,3>`; with `SLOW=4500 FAKE_TTS=1` in front it lets Ollie finish
  every model line, taps the 高年級 word buttons and lists the lines a computer voice had to read — there must be none);
  `node tools/tests/opening.js <base>` does the same for the opening show.
