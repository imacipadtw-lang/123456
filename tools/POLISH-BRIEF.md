# Brief: emblem integration + award-level polish of ONE game file

Project: `/home/user/123456/english-quest/` — static HTML/JS, six classroom touch-TV English games for 土城國小 (Taiwan).
The education minister will watch and film the event; the school wants a result that could win a design award.
Read `/home/user/123456/tools/GAME-SPEC.md` first (rules of the games), then your game file (named in your task) completely.

## Why this pass
The teacher looked at the games and said: the little school emblems (土城 pins) are stuck on things like stickers in
awkward places (example: a pin floating on a monster's shoulder). She wants **every emblem in a fitting place, integrated
into the design of the thing it is on, creative, never abrupt** — and the whole game polished until it amazes.

## Part 1 — every 土城 emblem must belong to the thing it is on
`TC.seal(x, y, r, tilt, kind)` (in `js/art.js`, read its comment) now draws the school's mark in six styles:
`"pin"` (default enamel pin), `"patch"` (embroidered patch — fabric), `"print"` (flat printed logo — cups, boxes, books, paper,
screens, walls), `"plate"` (brass plate with screws — doors, furniture, machines), `"tag"` (hanging tag with a ring — collars,
necklaces, zips, handles; draw the cord/collar yourself), `"sticker"` (white-edged sticker — smooth hard things, fruit).
For pictures registered with `TC.ART[name]`: `TC.SEAL[name] = [x, y, r, tilt, kind]`, or `TC.SEAL[name] = "none"` when the picture
draws its own emblem with `TC.seal(...)` inside the art (then you control the layer order — e.g. under an arm, on a cap).

Rules
- Keep the school's mark on every character and every distinct object (the school asked for that), but place it where a
  designer would put a logo: cap front, chest/uniform, collar tag, belt buckle, door plate, the front of a cup, a book cover,
  the label of a bottle, the hub of a fan, the side of a bus, a flag, a banner, a medal… Match the style (`kind`) to the material,
  the tilt to the surface, the size to the object (clearly readable, but part of the object — typically 12–20 % of its width).
- Never over a face, a hand, an arm or leg, never crossing the outline of the object, never floating beside it, never covering
  text or the answer picture's key feature. One emblem per object. For repeated background things (trees, cones, bunting,
  audience) do not put a pin on each: carry the mark once in a natural way (one pennant of the bunting, a banner, a sign).
- Be creative where a plain logo would look silly: a monster wears a tiny school cap or a collar tag; an apple has a fruit
  sticker; a tooth character holds a little flag; hands wear a wristband with the mark; a cookie sits on a printed napkin.
  A self-made variation is fine as long as the two characters 「土城」 are readable.
- Review EVERY emblem in your game (the pictures you register, the things you draw on canvas/DOM, the start-screen art):
  list them, look at each one in a screenshot at real size, and move/restyle each one that is not clearly well placed.

## Part 2 — polish until it amazes
Play your game and LOOK at screenshots of every stage at 1920x1080 and 1366x768 (start/idle scene, each kind of round, the
success animations, the finale). Fix what a design-award jury would notice: anything overlapping, clipped, cramped, off-centre,
unevenly spaced, low-contrast or too small to read from the back of a classroom; flat or dull areas that deserve light, depth
and a little motion; abrupt animations that deserve easing; inconsistent colours. The bottom talk bar (`#talk`) is now more
compact: it covers roughly the lowest 31 % of the screen while a question is shown (it used to be 40 %) — use the space you
gain (bigger picture, better composition). The top-left 300×300 px (at 1920 px wide) is the school emblem / Home button.
Do not change the game rules, the content, the spoken lines, timing that tests rely on, or what `content.js` provides.

## Hard rules
- Edit ONLY your one game file. No other file (not art.js, core.js, station.js, content.js, css). If a shared file needs a
  change, describe it in your report instead. No git commands that change state.
- Plain ES2019, no dependencies, original art drawn in code. Keep `Esc`, `N`, Enter robust (no leftovers, no errors).
- Test before reporting: serve `cd /home/user/123456/english-quest && python3 -m http.server PORT &` (port in your task);
  `node /home/user/123456/tools/tests/e2e.js http://localhost:PORT N 1,2` must PASS for your gate N; also Esc and N mid-game with
  no page errors (Playwright is installed: `require('playwright')`, launch args `--use-fake-ui-for-media-stream
  --use-fake-device-for-media-stream --autoplay-policy=no-user-gesture-required`; start a game with
  `page.click('#lvlPick button[data-l="1"]'); page.click('#startBtn', {force:true})`, Enter = teacher's ✓).
  Test scripts and screenshots go in the scratch directory named in your task, never in the repo.

## Report (short)
A table of every emblem: where it was → where it is now and in which style; the polish changes; test results; anything you
need changed in files you may not edit.

## No microphone at the venue (new)
The classrooms cannot pick up sound, so NOTHING in the game may depend on sound input: no `TC.Mic.level`, no loudness
meters, no "the louder the more fireworks", no voice-energy bars, no text that tells people the screen is listening.
The child says the word and the host presses ✓ (Enter). Wherever your game used loudness, replace it with touch or time:
taps launch fireworks, a bar that fills by itself and faster with every tap, a countdown, a rhythm of taps. Children no
longer carry the passport booklet either, so do not tell them to open or look at it.
