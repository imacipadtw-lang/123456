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
  A new spoken line needs a clip: `node tools/need_audio.js` must report 0 missing, and `tools/verify_sentences.py` /
  `tools/verify_audio.py` must be run; report honestly which clips the recogniser could not confirm.
- The venue has no microphone and children do not carry the passport booklet: the microphone stays off by default, nothing may
  depend on listening or loudness, and no step may need the booklet. The level (低／中／高年級) is chosen on the home page.
- Levels: 低年級 = big/small letters and "Ollie says a word, do the action" only (no booklet sentence in the question bar);
  中年級 = booklet sentences shown in full, never a blank; 高年級 = booklet answer sentences with the answer word blank.
- The home page (and the backup launcher) is ONE screen with exactly the six gates plus the level buttons; nothing else is
  shown there — no tools, no opening / Final Gate tiles — and nothing scrolls (`node tools/tests/home-fit.js`). The other
  pages (`control.html`, `opening.html`, `guide.html`, `teacher-cards.html`, `links.html`, `credits.html`) are opened by address.
- Prizes: all six gates = a pack of cookies and a drink; more than 100 sticker points in all = one more pack of cookies.
- More than one session may work on this branch: `git fetch` and merge before pushing, never force-push, and keep the other
  session's flow decisions unless the teacher says otherwise.
- Artwork is original (drawn in code in `english-quest/js/art.js`); no third-party images.
- Before pushing: load every page in headless Chromium with no errors (`node tools/tests/pages.js`); play at least one gate
  end to end (`node tools/tests/e2e.js <base> <gates> <levels 1,2,3>`).
