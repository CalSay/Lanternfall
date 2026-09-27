# Performance: budget, benchmark and hotspots

Owner direction: "We should be constantly checking that the speed and smoothness of the game are
as good as possible." This page holds the budget, how to measure it, the latest numbers, and the
known hotspots for each file's owner.

## Commands

```
node tools/build.mjs && node tools/perf.mjs --quick   # ~40 s, phone only: run after every merge
node tools/perf.mjs                                    # ~7 min: phone and desktop, new game and late save
node tools/perf.mjs --html old/dist/lanternfall.html   # benchmark another build (before/after)
node tools/perf.mjs --trace out/                       # also save a Chrome trace of each fight window
```

Exit code 1 when any metric is over budget. `--json file` writes the raw numbers, `--only phone|desktop`
and `--save new|late` narrow the run.

## Method

`tools/perf.mjs` runs headless Chromium (`/opt/pw-browsers/chromium`, Playwright) against an
instrumented copy of `dist/lanternfall.html`. dist itself is not changed. The copy:

- is wrapped in a document skeleton with a device-width viewport, as the artifact host does;
- has a small hook appended inside the game's IIFE that times `frame` (the whole rAF callback),
  the first `draw`, `ui()` and each part of it (`uiFight`..., every registered section), and exposes
  test helpers (`bossUp`, `bossKill`, `toast`, `setTab`);
- blocks every outside request (Google Fonts), so runs are repeatable offline.

Scenarios: a new game (no save, class picked through the creation screen) and
`tests/fixtures/save-v2-late.json` (seeded into localStorage before page scripts, `last` = now so the
away card stays shut; "Choose your path" is clicked through). Each runs in a fresh browser context,
at **phone** 360 x 740, DPR 2, touch, CPU slowed x4 (CDP `Emulation.setCPUThrottlingRate`), and at
**desktop** 1280 x 800, DPR 1, full speed.

Sequence per scenario: load, warm up, open every tab in turn (first open mounts it, then it updates),
a burst of 16 toasts, a frontier boss (10 kills, challenge, kill 2 s later: zone clear and a new
scene), then 20 s of steady fighting (frame stats, `ui()` cost), GC-to-GC heap growth over 60 s, DOM
node count, and 7 taps on the first Hero upgrade at x1 (pointerdown to click handled, and to the next painted
frame, checking that the level really went up; story pop-ups are closed first and only taps that
land on the button count).

Metrics:

- **JS/frame**: time inside the rAF callback (tick, animate, draw, and `ui()` every 0.2 s).
- **frame gap**: time between rAF callbacks; what the player sees. 16.7 ms = 60 fps.
- **long tasks**: main-thread tasks over 50 ms (PerformanceObserver `longtask`).

Caveat: headless Chromium here has no GPU, so the stage canvas is rasterised in software on the
main thread (`CanvasResourceProviderSharedImage::ProduceCanvasResource` in a trace). That makes
canvas fill cost show up in frame gaps and long tasks. Phones with GPU canvas pay it on the GPU, but
phones with a blocklisted GPU fall back to exactly this, so we treat it as the worst case.
Numbers vary run to run by 10-20% on a busy machine; compare before/after on the same machine.

## Budget

| Metric | Phone (x4 CPU) | Desktop |
|---|---|---|
| First frame after navigation | <= 1500 ms | <= 600 ms |
| Fight: JS per frame p95 / p99 | <= 8 / 16.7 ms | <= 4 / 8 ms |
| Fight: frames with JS over 16.7 ms | <= 1% | <= 0.5% |
| Fight: frame gap p95 | <= 34 ms (30 fps floor) | <= 20 ms |
| Fight: long tasks | <= 1 per 10 s | 0 |
| `ui()` p95 per call | <= 8 ms | <= 2 ms |
| Each tab open: JS per frame p95 | <= 12 ms | <= 6 ms |
| Each tab: longest task (first open + updates) | <= 150 ms | <= 50 ms |
| Toast burst, boss kill: longest task | <= 150 ms | <= 50 ms |
| Heap growth (GC to GC) | < 2 MB/min | < 2 MB/min |
| DOM nodes | <= 5000 | <= 5000 |
| Tap to painted response (median) | <= 150 ms | <= 50 ms |
| Taps that change state, page errors | all, 0 | all, 0 |

## Results

### Pass 2 (PERF2)

Same machine, 2026-09-27, still shared with other agents' browsers and sims (load average 4-9 on 4
CPUs), so absolute phone numbers are worse than pass 1's and swing a lot between runs. "Base" is
`claude/elegant-johnson-m6k00u` with the Codex merged (its committed dist), "after" is this pass. The
builds were run alternately: one full run plus two `--only phone` runs each; the table shows the
**median of 3** for phone and the single full run for desktop. Lower is better except fps.

| Metric | phone/new base → after | phone/late base → after | desktop/new base → after | desktop/late base → after |
|---|---|---|---|---|
| First frame (ms) | 1390 → 1373 | 1560 → 1502 | 505 → 417 | 397 → 408 |
| Fight fps | 27.1 → 30.4 | 23.3 → 25.2 | 59.4 → 60 | 59.5 → 59.8 |
| Fight JS/frame p95 / p99 (ms) | 6.9 / 11 → 5.7 / 7.8 | 8.5 / 17 → 7.5 / 10.6 | 2.8 / 3.8 → 1 / 2.6 | 2.2 / 3.2 → 1.2 / 2.4 |
| Fight frame gap med / p95 (ms) | 35.3 / 53.6 → 32.4 / 45.2 | 40.6 / 69.4 → 38.9 / 56.9 | 16.7 / 18.8 → 16.7 / 16.9 | 16.7 / 17.7 → 16.7 / 17.6 |
| Fight long tasks in 20 s | 34 → 7 | 91 → 53 | 1 → 0 | 1 → 1 |
| `ui()` med / p95 (ms) | 1.7 / 4.8 → 1.2 / 3.3 | 1.6 / 6.2 → 1.5 / 3.3 | 0.4 / 2.1 → 0.3 / 0.6 | 0.4 / 2.2 → 0.3 / 0.6 |
| Tab longest task: Fight / Party / Gather / Craft / Camp (ms) | 61 / 75 / 66 / 84 / 76 → 58 / 76 / 52 / 78 / 70 | 123 / 99 / 77 / 115 / 202 → 54 / 102 / 67 / 90 / 109 | 0 / 0 / 58 / 0 / 55 → all 0 | all 0 → all 0 |
| Toast burst: longest task (ms) | 92 → 73 | 70 → 68 | 51 → 54 | 0 → 0 |
| Boss kill: longest task (ms) | 181 → 142 | 199 → 183 | 0 → 0 | 0 → 52 |
| Heap growth (MB/min) | 0.28 → 0.23 | 0.46 → 0.45 | 0.47 → 0.48 | 0.98 → 0.52 |
| DOM nodes | 3422 → 3270 | 3870 → 3757 | 3395 → 3277 | 3870 → 3737 |
| Tap to paint, median (ms) | 201 → 182 | 244 → 200 | 13 → 14 | 14 → 16 |
| Over budget (full run) | 6 → 4 | 10 → 5 | 5 → 1 | 2 → 2 |

Reading it: `ui()` p95 fell by a third to a half everywhere, JS per frame p99 by a third, and the long
tasks in steady fighting on the phone fell from 34 to 7 (new game) and 91 to 53 (late save). Every tab's
first open is now under 150 ms on the phone (the Camp tab on the late save was 202). Still over budget on
the phone, and all of it the main thread being busy rasterising the stage in software (JS per frame is
now 1-3 ms of a 32-40 ms frame): frame gap p95, long tasks while fighting, tap to paint (the click waits
behind those frames), the boss kill (zone clear and a new scene) and, by a hair, the first frame. On
desktop the one-offs (a single 52-66 ms task) come and go between runs. See hotspots 7 and 10.

The Codex (57c-codex.js, 75-codex-ui.js) is cheap: a forced `codexRefresh` takes 0.5-3.3 ms at x4 and
runs at most every 5 s while fighting; its Journal card updates once a second only while the bell sheet
shows it. None of the 17 tick hooks costs more than 0.02 ms on average. No change was needed there.

### Pass 1

Full run, same machine (4 CPUs, busy with other agents), 2026-09-27. "Before" is the branch base
(`claude/elegant-johnson-m6k00u` merged), "after" is this pass. Two full runs each; the second is
shown, with the first in brackets where it differs a lot. Lower is better.

| Metric | phone/new before → after | phone/late before → after | desktop/new before → after | desktop/late before → after |
|---|---|---|---|---|
| First frame (ms) | 1471 → 1738 [1390 → 1305] | 1921 → 1347 [1978 → 1397] | 418 → 309 | 492 → 350 |
| Load: longest task (ms) | 926 → 1252 [916 → 825] | 1123 → 817 [1153 → 844] | 256 → 193 | 293 → 188 |
| Fight fps | 42.8 → 53.6 | 39.6 → 49.0 | 60 → 60 | 60 → 60 |
| Fight frame gap med / p95 (ms) | 21.1 / 37.8 → 17.1 / 30.8 | 22.9 / 40.6 → 18.2 / 34.3 | 16.7 / 16.8 → 16.7 / 16.9 | 16.7 / 16.9 → 16.7 / 17.4 |
| Fight JS/frame p95 (ms) | 6.4 → 5.9 | 7.2 → 6.0 | 1.2 → 1.2 | 1.3 → 1.5 |
| Fight long tasks in 20 s | 8 → 3 [14 → 2] | 7 → 10 [11 → 8] | 0 → 0 | 0 → 0 |
| `ui()` p95 (ms) | 6.0 → 6.1 | 6.2 → 5.8 | 1.1 → 1.1 | 1.4 → 2.3 |
| Party tab: longest task (ms) | 1121 → 407 | 923 → 531 | 374 → 0 (none > 50) | 236 → 0 (none > 50) |
| World tab: longest task (ms) | 159 → 160 | 225 → 228 | none | none |
| Boss kill: longest task (ms) | 101 → 68 | 101 → 122 | none | none |
| Heap growth (MB/min) | 0.37 → 0.45 | 0.54 → 0.44 | 0.47 → 0.43 | 0.56 → 0.59 |
| DOM nodes | 3835 → 3635 | 4281 → 4150 | 3754 → 3639 | 4332 → 4173 |
| Tap to paint, median (ms) | 149 → 118 | 129 → 149 | 11 → 13 | 15 → 12 |
| Over budget | 4 → 5 | 5 → 4 | 1 → 0 | 1 → 1 |

Reading it: the steady-fight frame rate on a slowed phone rose by about a quarter (median frame
gap 21-23 → 17-18 ms, p95 38-41 → 31-34 ms), the Party tab's first open went from about a second
to under half, and on desktop it no longer stalls at all. Load is noisy on this machine (the
phone/new first-frame figure swung 1305-1738 ms across runs); the late save loads about 30% faster.
Heap growth is flat (no leak) and far under budget everywhere. Still over budget on the phone: the
Party and World tab first opens, and long tasks in steady fighting on the late save (the `ui()`
frames: see hotspots 1-2).

Where the stage's time went (phone/late, x4, before the fix, turning one piece off at a time with
the in-page hook; median frame gap): everything on 31 ms, no atmosphere 20 ms, no vignette overlay
22 ms, no fog 28 ms, no lamps 29 ms, nothing drawn 16.7 ms. (That probe ran on an early harness
without the viewport skeleton, so compare the pieces with each other, not with the table.)

## Fixes, pass 2 (PERF2)

- **70-ui.js, write-on-change helpers**: `putText`, `putStyle` (value cached per element),
  `putAttr`, `putHidden`, `putDisabled`, `putClass`, `putToggle`, and `viewOpen(tab, view)`. Use them
  in any `update(force)` or per-tick code. `ui()` looks its HUD nodes and mode buttons up once and
  writes only changed values; so do `uiFight`, `uiGather`, `renderTrophies`, `uiRaid`, the bell,
  `viewDots`, `setIc`, and the Party, party sheet, Camp and Craft sections.
- **70-ui.js, only what shows updates**: `uiFight` runs only on the Fight tab's Upgrades view,
  `uiForge` only on Uniques, `uiRaid` only on Raid, `uiTavern` only on Tavern, and `uiGather` only
  updates the open view's rows (a view switch calls `ui(true)`, so a view is fresh when it shows). The
  Tavern's "who is here" chips are rebuilt only when someone or their activity changes.
- **70-ui.js `setHp` + 20-stage.css**: the foe HP bar and its white trail now scale with
  `transform: scaleX()` (composited, no relayout per hit or per trail frame) instead of `width`. A new
  foe refills the trail with its transition off for two frames instead of reading `offsetWidth`.
  Same look.
- **70-ui.js, toasts and the bell**: the room count comes from a ResizeObserver on the stage box; the
  bell's wiggle restarts by swapping between two identical animations (`ping`/`ping2`, 10-base.css)
  instead of reading `offsetWidth`.
- **70-ui.js, staggered first opens**: a section's first update (it builds its rows) runs only while
  that `ui()` call has used less than 30 ms (`COLD_MS`); the rest build in the next tasks, top first
  (`warmSections`). This is what keeps each tab's first open under budget.
- **75-party.js roster, 75-camp-ui.js roster board**: tiles and rows are built in time-boxed chunks
  (20-25 ms, then `setTimeout`), the first screenful at once. A newer rebuild cancels an old one.
- **75-craft-ui.js recipes**: the list is built once per station, tier, filter and recipe set; after
  that a row is rebuilt only when what it shows changes (`rowSig`: costs, can craft, why, who it
  beats, masterwork, role). `force` no longer rebuilds everything, and the Masterwork picker is
  rebuilt only when the trophies or the pick change.
- **62-stage.js**: the tap reads the stage rect cached in the ResizeObserver (dropped on scroll or
  window resize); the full-stage backdrop fill is skipped when the opaque sky covers the canvas (kept
  while a shake moves the scene up or down); the ground pool under the hero is scaled once to device
  pixels and copied 1:1.

Not done, on purpose: the vignette as a CSS overlay (63-scenery draws it under the ability effects,
the canvas HUD and the floating text, so a CSS layer over the canvas would darken those too: not the
same look), and a cached key light (its radius flickers every frame, so a 1:1 sprite would change
the look or need many sizes). Core files (00-59) are untouched: `node tools/sim.mjs --policy mixed
--hours 2 --seed 1` is byte-identical before and after. Screenshots of every tab and view at 360 x 740
(late save) match the base apart from the live numbers (gold, materials).

## Fixes, pass 1

- **63-scenery.js, `drawAtmosphere`**: the vignette overlay (stored at half size) and the 4 fog bands
  (a 64 px glow) were scaled with bilinear filtering every frame, over the whole stage. That was
  most of the stage's raster time (turning the overlay off alone took the phone's median frame gap
  from 31 to 22 ms in the probe above). They are now copied once per scene and pixel ratio to
  device-resolution canvases (`atmoDev`) and drawn 1:1 at whole device pixels. Same look.
- **60b-baker.js, lazy frame sets**: `charFrames` and `enemyFrames` baked every frame of a
  character (5 + a flash copy) or foe (4 + flash) at once: about 20 bakes at boot and 5 in the frame
  a new zone's foe appears. Now idle0/idle1 (characters) or idle0 (foes) bake at once and the rest
  are getters that bake on first use, and are queued to bake in idle time (`idleTask`:
  requestIdleCallback with a timeout, setTimeout fallback). Portraits (`portraitCanvas`) bake idle0
  only and queue nothing. Same frames, same pixels, same cache.
- **90-boot.js, warm-up**: while a frontier boss is ready or being fought, the next zone's scene,
  its two likely foes and this zone's Elder boss are built in idle time, so clearing a zone does not
  build a scene and bake in one frame. After boot every roster portrait is baked in idle time, so the
  first open of the Party tab (a portrait per roster row) no longer bakes 15+ characters.
- **90-boot.js, hidden page**: the 5 s autosave is skipped while the page is hidden (the frame loop
  is paused, so nothing changes). This also fixes a bug: `save()` stamps `S.last`, so the background
  timer kept pushing `S.last` forward and a player who left the tab in the background came back to
  little or no away gains.
- **75-almanac-ui.js**: the Almanac card rewrote every text node 5 times a second; it now writes
  only what changed (each write makes the browser lay the panel out again).

Core files (00-59) are untouched: `node tools/sim.mjs --policy mixed --hours 2 --seed 1` is
byte-identical before and after.

## Hotspots for owners

Each item: where, why it is slow, the fix. Done items stay listed so the reasoning is kept.

1. **Done (pass 2).** 70-ui.js `setHp`: forced layout on every new foe (`void tr.offsetWidth`).
2. **Done (pass 2).** 70-ui.js `ui()`, 71-ui-fight.js `uiFight` (and `uiGather`, `uiForge`, `uiRaid`,
   `uiTavern`): unconditional DOM writes every call, and updates for views not on screen.
3. **Done (pass 2).** 70-ui.js `showToast` (and `bellUpdate`): a layout read per notice.
4. **Done (pass 2).** 75-party.js roster first open: tiles now build in time-boxed chunks.
5. **Done (pass 2).** Camp tab first open (phone/late 202 → 109 ms): staggered section builds and a
   chunked roster board.
6. **Done (pass 2).** 75-craft-ui.js `craft-recipes`: rows built once, rebuilt one at a time on change.
7. **Open, the biggest one left. 63-scenery.js `drawScene` + 62-stage.js `draw`: canvas raster.**
   JS per frame is now 1-3 ms, but a phone frame is still 32-40 ms at x4 with software canvas: the
   5 parallax layers are drawn scaled (2 x zoom, nearest) over the whole stage every frame, plus the
   vignette, 10-18 scaled lamp glows and the scaled key light. This is what is left of the fight frame
   gap, the long tasks while fighting and the slow taps. Next steps, in order of value: (a) keep
   device-resolution copies of the current scene's layers (one slot, like `atmoDev`; about 3 MB per
   layer on a 360 px phone at DPR 2) and draw them 1:1 at whole device pixels, since their x is
   already whole logical pixels; (b) skip layers fully hidden behind an opaque one; (c) cap lamp
   glows drawn per frame on small stages. Measure each with the in-page hook (turn one piece off).
8. **Done (pass 2).** 62-stage.js stage tap: rect cached in the ResizeObserver.
9. **56-roster.js `compDps` per tick** (left alone to keep the sim byte-identical):
   `fieldCompDps -> sharedMult -> mod() -> activeOmen` runs every frame, about 3 ms per second
   unthrottled. Cache it per field and modifier state if it grows.
10. **Boss kill (zone clear): 140-180 ms longest task on the phone.** The next scene and foes are
    warmed in idle time (pass 1), but the clearing frame still does the new scene's first raster, the
    level-up/zone toasts and the reward work together. Trace it (`--trace`) before changing anything.
11. **First frame on the phone, 1370-1500 ms at x4**: boot script ~1 s (building every panel and
    section at load). Mount the lower sections of closed tabs lazily (on first open, with the stagger
    above) to cut it.

## Checklist for new code

- Nothing per frame that allocates canvases, gradients or data URLs; bake once and cache.
- Draw cached sprites 1:1 at whole device pixels where you can; scaled draws with smoothing on are
  the most expensive thing on a software canvas.
- In `update(force)` (5 times a second): write DOM only on change (the `put*` helpers in 70-ui.js);
  never read layout (`offset*`, `getBoundingClientRect`, `getComputedStyle`) after writing. To restart
  a CSS animation, swap between two same-looking animation names instead of reading `offsetWidth`.
- `force` means "the player just acted", not "rebuild everything": rebuild a list only when its
  content changes (a signature), and a row only when that row's content changes.
- Animate bars with `transform`, not `width`, where the look allows.
- Bake or build big things (scenes, character sets, long lists) with `idleTask` ahead of need; a long
  list the player opens now builds in time-boxed chunks (about 20 ms, then `setTimeout`).
- Run `node tools/perf.mjs --quick` before handing a branch in.
