# Project rules (土城國小 English Day)

- The app lives in `english-quest/` (static HTML/JS, no build step).
- **Every screen has two addresses** — main on GitHub Pages and a backup on claude.ai — kept in `english-quest/js/links.js`
  and shown on `links.html`, the guide and the gate host cards. After every change: commit, push this branch
  (GitHub Pages updates automatically via `.github/workflows/pages.yml`), **and** republish the claude.ai backup
  (see `deploy/publish-claude.md`) to the same URL.
- English pronunciation: real human US-English recordings from Wikimedia Commons / Wiktionary, verified by SHA-1, with speaker,
  licence and download time in `english-quest/assets/audio/credits.json`. Use a clearly labelled computer voice only when no
  human recording exists. Pronunciation must be checked to be correct.
- Artwork is original (drawn in code in `english-quest/js/art.js`); no third-party images.
- Before pushing: load every page in headless Chromium with no errors; play at least one gate end to end.
