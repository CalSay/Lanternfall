# Independent playtester: persona and route

The project's independent tester is a model that plays a fresh build with no script and writes down what is wrong as it
notices it. Builders never grade their own work: the tester runs in its own session, sees only the game, and a separate
judge scores its notes. The Sunday release check uses this persona.

Tool: `tools/playtest-human.mjs` (driver: `tools/playtest.mjs`; method: `docs/coord/playtest-lab.md`). The brief the player
reads is `BRIEF` in that file, plus one line naming the hero when `--hero` is given; the whole prompt is printed into each
run's `run.json`. `--view` picks the player as well as the screen (the views of `tools/lib/views.mjs`).

## Personas

### The desk player (primary, from 2026-10-08)

The game is browser-first (CLAUDE.md), so the main tester sits at a desk: a 1280x720 browser window, a mouse and a keyboard,
no touch screen (`--view desktop`, the tool's default; `laptop` 1366x640 and `hd` 1920x1080 for short size checks). Same
curiosity, impatience and note style as below, and every v2 habit. What differs:
- The brief opens with the browser window, mouse and keyboard, and its actions are `click`, `hover <label>` (rest the pointer
  on a button: the tool says whether it has a title tooltip and the look shows any hover state) and `press <key>` (Escape,
  Enter, Space, a letter), as well as wait, read and scroll (the wheel). `tap` still works as a synonym for click.
- One extra habit, about the device, not about any human's notes: say when something seems made for a phone instead
  (words that say tap, swipe or hold; text too small at a desk; a control that needs a long press; a button that does not
  answer a click, or does not change when the pointer rests on it).

Scoring under the holdout rule (DECISIONS.md, 8 Oct; research/better-ways/relay/2026-10-08-playtester-holdout.md in the
project files): the desk player was written from the browser-first rule and the desktop layout spec only. No line of its
brief comes from Cal's notes or the `escapes.md` "Bot saw" rows, and none may be added from them. It is scored the same way
as v2: a judge that did not write it compares the union of two seeds' notes with Cal's next play notes made on a desktop
browser, and the desk habit stays only if it lifts the held-out catch above 7 of 18 (or the same 39% share) by more than one
note. Until then its first run (`autopilot/reports/desktop-playtest-2026-10-08/` in the project files) is a findings run,
not a score.

### The phone dipper (`--view landscape` or `--view portrait`)

A normal first-time player on a phone. Curious, a little impatient, follows the game's suggestions when they make sense.
Knows nothing but the screen: no repo, docs, cards or anyone's notes. Writes one blunt line per problem, the moment it
sees it, and says what it expected instead. Ends with a `TOP:` note naming the 3 to 5 problems that would most make it stop.

Persona v2 (2026-10-07) adds "habits of a careful player", general checks a careful human makes:
- When a character speaks: does what happens next fit, and did I finish reading before the game moved me? How do they sound as a person?
- When a tip appears: did I have time to read it, and can I do what it says right now?
- After a reward screen: did what it showed arrive where it should be?
- When I make or get an item: was I told to equip or use it, and where? Does a new item or ability work straight away?
- After a menu task (points, craft, equip): is the way back to the action shown, and in how many taps?
- When I look for something: where did I look first, and where was it?
- Numbers: does this number tell me what I get? Was spending points a real decision?
- Pictures: letters, blanks or stand-ins where a picture should be.

## Route (release check)

```
node tools/build.mjs
node tools/playtest-human.mjs start --html dist/lanternfall.html --seed 1 --hero Tobin --max-steps 250 --out <run>-s1
node tools/playtest-human.mjs start --html dist/lanternfall.html --seed 2 --max-steps 250 --out <run>-s2
node tools/playtest-human.mjs start --html dist/lanternfall.html --seed 3 --view landscape --max-steps 120 --out <run>-phone
```
The first two are the desk player (the default view). The third is the phone dipper's short check. A run to a zone rather
than to a time raises `--max-minutes` and runs in legs: one player holds about 400 steps, and a hand-played kill costs about
10, so the 8 Oct desk run to zone 10 took two legs (400 steps to zone 6, then `--resume` and 435 more; 45 game minutes).
Each run is driven by a worker on Opus (`act` / `note` / `stop`, one action per turn, reading each screenshot), or with an
API key by `run` (add `--max-usd 12`: the default $10 cap stops a 250-step run early and skips the closing `TOP:` turn). Seed 1 plays the hero Cal plays. 250 steps reach about 30 game minutes. A run costs about $6 to $7 at
150 steps as a Claude Code worker (most of it is the worker's own prompt), so expect $10 to $11 at 250. The driver runs
with `--frozen` (the game clock moves only on reading time, waits and taps) and `--thumb` (a tap never scrolls the page
where a thumb cannot).

Scoring: a separate judge (Sonnet) compares the notes with a human's notes, if any, quoting the tester line for each
match ("caught" = same problem, same complaint; "partly" = same thing, different complaint). It also triages the
tester's new issues as real, false alarm, unsure or tool.

## Retune against Cal's notes of 2026-10-07

Before (persona v1, measured on the #177 build, 2 seeds of 150 steps, Pip): **7 of 18 caught, 9 partly, 2 missed**
(research/player-feedback/playtester-score-2026-10-07.md in the project files). Rows 14 to 34 of `autopilot/escapes.md`
are these notes.

| Cal # | Escape row | v1 result | Why | v2 change that targets it | v2 would catch? |
|---|---|---|---|---|---|
| 1 Intro art | 14 | not scored (art) | praised the art | pictures habit (stand-ins only, not taste) | no: art quality is the art judge's |
| 2 "Wood first" then a fight | 15 | caught | | dialogue-fits habit | yes |
| 3 No pause to learn dodge/parry | 16 | caught (s1) | | tip-time habit | yes |
| 4 Change-ability tip with one ability | 17 | partly | tip gone before the screenshot | tip "can I do it now" habit; reading-time look lists vanished lines | likely |
| 5 Level-up popup nice | 18 | not scored (praise) | noted praise | | yes |
| 6 % instead of flat numbers | 20 | partly | said the % were small, not that they should be flat | numbers habit | partly: "flat like E33" is Cal's taste |
| 7 No way back to the fight after attributes | 21 | partly | complained about the Fight tab | way-back habit | likely |
| 8 Boss screen good | 19 | not scored (praise) | | | yes |
| 9 Loot shown, nothing after Continue | 22 | partly | found late or missing rewards, not this case | reward-arrived habit | likely |
| 10 Fire lighting drops you into combat mid-talk | 23 | caught (s2) | | finish-reading habit | yes |
| 11 Hesketh sounds odd | 24 | partly | called two lines unclear | "how do they sound" habit | likely |
| 12 Guide not staged; silent unlocks | 25 | caught | | | yes |
| 13 Pickaxe: never told to equip | 26 | partly | equipped from the craft card by habit | told-to-equip habit | likely |
| 14 Gear belongs on the Hero tab | 27 | partly | could not find where to equip | where-did-I-look habit | likely |
| 15 "Packs near full" at 30 of 5,000 | 28 | caught (s1) | s2 never built the Forge | 250 steps | yes |
| 16 Gather rates per minute and hour | 29 | missed | Cal remembered an older screen; a fresh player cannot | none: needs a returning-player pass with last week's notes | no |
| 17 Equip, still asked to Keep | 30 | caught | | | yes |
| 18 One-shotting everything | 31 | caught | | | yes |
| 19 Codex icons missing | 32 | missed | Pip's icons draw; a fresh player cannot know which art was due | pictures habit (the walk's F10 found letter stand-ins "Po" and "Ma" on Wren's bar) + Tobin on seed 1 | partly: only where stand-ins show |
| 20 Tobin heavy attack dead in the fight it was equipped | 33 | partly (Pip, same symptom) | played Pip | try-it-straight-away habit + Tobin on seed 1 | likely |
| 21 Too many attribute points; choice not meaningful | 34 | partly | noted the count mismatch | real-decision habit | likely |

After (persona v2), predicted from the table: between **7 of 18** (only the "yes" rows, the same as now on the union,
though each seed alone should catch more) and **15 of 18** (every "likely" lands; #6, #16 and #19 stay partly or
missed; #1 is art and not scored). This is a prediction, not a measurement. v2's habits were written from these same notes, so re-running on
this build and these notes would overstate it. The honest test is Cal's next set of notes on a new build, or the Sunday
release check scored against whatever Cal finds that week. Record it below.

| Date | Build | Persona | Human notes | Caught | Partly | Cost |
|---|---|---|---|---|---|---|
| 2026-10-07 | #177 preview | v1, 150 steps, Pip x2 | Cal, 18 scorable | 7 | 9 | $6.92 + $6.05 |
