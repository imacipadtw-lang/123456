# Game rules — 《校園生活英語》 redesign (read before writing a game)

Audience: grades 1–6 of a small rural school, with PARENTS and VISITORS (the education minister may be filming) in the room.
Everything must be so easy that nobody is stuck in front of them, and so fun that children beg to play again.
All sentences come from the school's classroom-English passport booklet, pages (4)-(9); see `js/content.js` (the source
of truth: read the entry of YOUR gate, `TC_CONTENT.gates[n]`, found by `key`, never by hard-coding a number).

## The six games (one file each in `js/games/`, registered as `TC.games.<key> = { mount(api), idle(api), play(api), startArt }`)
| gate | key | file | theme |
|---|---|---|---|
| 1 | rescue | g1-rescue.js | situations: "Classroom Rescue" — Ollie is in a classroom emergency, the child says the key word to save him |
| 2 | talk | g2-talk.js | dialogue: "Ollie Talk Show" — host Ollie asks, the guest (child) answers; the audience (parents) claps |
| 3 | tpr | g3-tpr.js | TPR actions: "Ollie Says" — the child DOES the action with Ollie (no speaking); quiet-time freeze, then "Wake up!" |
| 4 | monster | g4-monster.js | phonics: "Sound Monsters" — a monster eats only things that START with its letter sound |
| 5 | chant | g5-chant.js | sing & dance: "Classroom Beat" — rhythm chant of passport commands, pads on the beat, everybody dances |
| 6 | story | g6-story.js | story: "Storybook Day" — a 3D pop-up book of a school day, the child says the missing word on each page |

## Rules
1. **One word answers.** Every spoken question is `api.ask({ teacher, tzh, say, zh, keys, word, hideKey: true })`: `say` is the
   sentence shown on screen, `keys` the accepted words, `word` the key word (its pronunciation clip). The engine prints the key
   word at 初級 (level 1) and blanks it at 中級 (level 2) by itself — games never branch on level for wording.
   `teacher` is the host's line; in "電腦問" mode (`TC.cfg.ollieAsks`) the engine speaks it for you; in "老師問" mode the teacher says it.
   A host line must never contain an accepted answer word. For lines you speak yourself that are questions/commands use
   `TC.teacherLine(text)` (speaks only in 電腦問 mode, otherwise just shows the subtitle).
2. **A big, clear picture of the situation/answer** is on screen while the question is asked. Draw it yourself in code
   (SVG via `TC.ArtCtx()` registered as `TC.ART[name]`, with `TC.SEAL[name] = [x, y, r, tilt]` for the 土城 pin, or canvas/DOM).
   3D look: gradients, shading, soft shadows, gentle idle animation — it must look professional, cute and colourful (think
   Roblox/Pixar-lite). No third-party images or fonts. Every object that is a thing/person wears a small 土城 pin (`TC.seal`).
3. **Nobody fails in public.** A wrong or no answer never ends the game: Ollie models the answer (`TC.model(say, word)`), the
   child repeats, the game moves on. `Enter`/Space = teacher's ✓, `N` = skip, `Esc` = abort (`api.aborted` — check it after
   every await and return early). Touch first: everything the child does is one tap on the big screen.
4. **Praise** after a right answer: `await TC.praise()` (random "Good job!", "Well done!", "Awesome!", "Excellent!", "That's right!",
   "You got it!" — passport (5)). At the very end of the game: `await TC.clapBanner()` ("Give him a big hand!", parents clap).
5. **Ollie's spoken lines**: `TC.speak(text)` — whole-sentence clips are used when they exist, otherwise the browser voice reads it
   (labelled). Prefer passport sentences. Never glue words together yourself. Single words: `TC.speak("Water!")`.
6. Stats: `TC.ask` already counts turns/stars for spoken answers. In activities where the child acts instead of speaking call
   `TC.countTurn(3)` once per finished activity so the result screen shows stars.
7. **Wow moments**: one moment per game that the minister will want to film (confetti `TC.confetti(n)`, sounds `TC.sfx(name)`,
   big animations), and one moment where PARENTS take part (clap, do the action, chant along).
8. Rounds: `const n = TC.rounds(5)` rounds per play (quick mode shortens it). A play takes about 60–90 seconds.
   Use `api.progress(i, n)` for the dots. Return `{ ok: true }` (the engine adds points) after the finale.
9. `idle(api)` draws the attract scene behind the start screen (called at load and after each player); `mount(api)` builds
   your DOM/canvas once inside `api.stage`; `startArt` = array of art names drifting on the start screen (optional).
10. Chinese UI text in Traditional Chinese; English text exactly as in `content.js`.
