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

### Pass 4 (PERF4)

Same machine, 2026-09-28, shared with other agents. "Base" is `claude/elegant-johnson-m6k00u` at the
PERF3 merge (plus Constellations), "after" is this pass. Phone: three `--only phone` runs of each build,
alternated base/after, **median of 3**; desktop: one run each. Lower is better except fps.

| Metric | phone/new base → after | phone/late base → after | desktop/new base → after | desktop/late base → after |
|---|---|---|---|---|
| Boot script done (ms) | 1019 → 791 | 1059 → 744 | 297 → 195 | 318 → 173 |
| First frame (ms) | 1332 → 1083 | 1445 → 1050 | 402 → 269 | 449 → 272 |
| Fight fps | 34.8 → 52.2 | 31.8 → 48.3 | 60 → 59.7 | 60 → 60 |
| Fight JS/frame p95 / p99 (ms) | 7.4 / 10.5 → 6.5 / 12.2 | 7.3 / 10.8 → 7.5 / 11.2 | 1.2 / 4.4 → 2.4 / 4.3 | 1.2 / 1.9 → 2.3 / 3.3 |
| Fight frame gap med / p95 (ms) | 27.6 / 43.9 → 18.1 / 28.4 | 29.9 / 45.8 → 19.7 / 30.7 | 16.7 / 16.9 → 16.7 / 18.9 | 16.7 / 16.9 → 16.7 / 16.9 |
| Fight long tasks in 20 s | 9 → 0 | 14 → 0 (runs: 0, 2, 0) | 0 → 0 | 0 → 0 |
| `ui()` p95 (ms) | 3.5 → 3.3 | 3.5 → 3.6 | 0.6 → 0.7 | 0.6 → 0.8 |
| Tab longest task: Fight / Party / Gather / Craft / Camp (ms) | 0 / 92 / 53 / 101 / 62 → 0 / 82 / 0 / 81 / 0 | 53 / 88 / 51 / 98 / 150 → 0 / 82 / 53 / 113 / 103 | all 0 → 0 / 0 / 0 / 55 / 0 | all 0 → all 0 |
| Toast burst: longest task (ms) | 0 → 51 | 63 → 60 | 0 → 0 | 0 → 0 |
| Boss kill: longest task (ms) | 74 → 51 | 158 → 147 | 0 → 0 | 0 → 0 |
| Heap growth (MB/min) | 0.42 → 0.39 | 0.19 → 0.30 | 0.49 → 0.50 | 0.45 → 0.49 |
| DOM nodes | 3134 → 3135 | 3646 → 3631 | 3113 → 3114 | 3592 → 3628 |
| Tap to paint, median (ms) | 151 → 121 | 191 → 137 | 12 → 15 | 13 → 9 |
| Over budget (each run) | 2 / 2 / 2 → 0 / 0 / 1 | 5 / 5 / 5 → 0 / 1 / 0 | 0 → 1 | 0 → 0 |

Reading it: the base had lost most of pass 3's raster savings (see the first fix in pass 4), so its
phone fight was back to 32-35 fps. After this pass the phone fight runs at 48-52 fps, the frame gap
p95 is under the 34 ms budget on both saves, and long tasks while fighting fell from 9-14 to 0-2 per
20 s. The boot script is 230-310 ms shorter at x4 (first frame 1050-1080 ms), and the Camp tab's first
open on the late save fell from 150 to about 100 ms. The few misses left were single runs over by a few
ms (tap to paint 160 once, one 12.1 ms tab JS p95, one 55 ms Craft open on desktop).

### Pass 3 (PERF3)

Same machine, 2026-09-27/28, shared with other agents (load average 2-17 during the runs). "Base" is
`claude/elegant-johnson-m6k00u` at the PERF2 merge, "after" is this pass. Phone: three full `--only
phone` runs of each build, alternated base/after, **median of 3** (and a fourth pair on the final
build, in line with these); desktop: one run each. Lower is better except fps.

| Metric | phone/new base → after | phone/late base → after | desktop/new base → after | desktop/late base → after |
|---|---|---|---|---|
| First frame (ms) | 1431 → 1131 | 1546 → 1277 | 373 → 386 | 481 → 356 |
| Fight fps | 30.8 → 55.4 | 25.7 → 41.9 | 59.5 → 59.7 | 59.6 → 59.9 |
| Fight JS/frame p95 / p99 (ms) | 5.9 / 7.9 → 5.7 / 11.7 | 6.8 / 12.5 → 6.8 / 13.1 | 1.4 / 2.6 → 2.1 / 3.8 | 1.2 / 2.8 → 2 / 4.1 |
| Fight frame gap med / p95 (ms) | 32.1 / 47.3 → 17 / 26 | 37 / 53.4 → 21.2 / 42.1 | 16.7 / 19.5 → 16.7 / 18.6 | 16.7 / 17.8 → 16.7 / 19 |
| Fight long tasks in 20 s | 6 → 0 | 33 → 11 | 1 → 0 | 1 → 0 |
| `ui()` med / p95 (ms) | 1.2 / 2.9 → 1.2 / 2.4 | 1.3 / 3.3 → 1.2 / 3.1 | 0.3 / 0.7 → 0.3 / 0.6 | 0.3 / 0.6 → 0.3 / 0.6 |
| Tab longest task: Fight / Party / Gather / Craft / Camp (ms) | 74 / 86 / 54 / 84 / 75 → 79 / 82 / 0 / 98 / 93 | 0 / 86 / 58 / 77 / 109 → 0 / 86 / 55 / 109 / 134 | all 0 → all 0 | all 0 → all 0 |
| Toast burst: longest task (ms) | 65 → 53 | 83 → 0 | 95 → 0 | 0 → 0 |
| Boss kill: longest task (ms) | 140 → 56 | 154 → 152 | 64 → 0 | 56 → 0 |
| Heap growth (MB/min) | 0.27 → 0.43 | 0.32 → 0.45 | 0.47 → 0.5 | 0.43 → 0.59 |
| DOM nodes | 3273 → 2908 | 3752 → 3413 | 3273 → 2885 | 3742 → 3390 |
| Tap to paint, median (ms) | 176 → 113 | 220 → 120 | 13 → 10 | 15 → 20 |
| Over budget (each run) | 3 / 4 / 4 → 0 / 0 / 0 | 4 / 5 / 4 → 5 / 3 / 3 | 3 → 0 | 2 → 0 (one tap missed the button: a harness flake) |

Reading it: on the phone the steady-fight frame gap fell by about 45% (median 32-37 → 17-21 ms, fps
31 → 55 on a new game), long tasks while fighting from 6-33 to 0-11 per 20 s, tap to paint by about
40%, the first frame by 250-300 ms, and the boss kill's longest task on a new game from 140 to 56 ms.
Phone/new and desktop/new are now within every budget. Still over on phone/late: frame gap p95 (about
40 ms) and long tasks while fighting (7-16), and the boss window (150-180 ms, the zone jump in
`bossUp`, see hotspot 10); see hotspot 7 for what is left. Heap growth is flat (well under budget; the
device-size copies are capped). JS per frame p99 rose a little (1:1 copies are more `drawImage`
calls, and the composite is rebuilt about once a second) while the raster behind it fell a lot.

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

## Fixes, pass 4 (PERF4)

- **The 1:1 scenery path was off (75-deepwell-ui.js, one line).** The Deepwell's `drawScene` wrapper
  passed on only `(ctx, scene, camX, which)`, dropping `k, ox, oy, bg`, so since the Deepwell merge no
  plate, no back-layer composite and no backdrop fill was used: every frame scaled all five layers
  again. In-page, one phone/late frame (draw plus the raster it queues, x4) went from 23-28 ms to
  10-11 ms with the arguments passed on (back layers 7.0 → 1.2 ms, foreground 2.0 → 0.3 ms). The wrapper
  now passes every argument (`...rest`); nothing else in that file changed.
- **60b-baker.js, idle queue.** Two lanes (soon, background). A phone at x4 gets almost no idle periods
  while fighting, so work ran only from timed-out callbacks, one task per 1.5 s: a scene's plates and
  atmosphere copies could wait 10-20 s. Now timed-out callbacks come every 250 ms while soon work waits
  (600 ms for background work) and run tasks for up to 12 ms; a pending long timeout is replaced when
  soon work arrives. `ART.idleStats()` (also `stageStats().idle`) counts runs, timeouts and the longest task.
- **63-scenery.js, small steps.** The scene build is a generator (`buildSteps`): the sky, the paint, the
  ground detail, one step per layer bake, the atmosphere data. `sceneSteps(theme, W, H, hue)` runs it one
  step per call (5-25 ms each at x4; `sceneFor` finishes a started build, same result). The layer spans
  (`spans`) take one layer per step and the atmosphere copies (`atmoSteps`) three steps. `warmScene`
  (62-stage) chains the scene steps, then queues the plate and atmosphere steps (`scenePlates(...,
  'queue')`). Before, the scene was one 80-200 ms task and the spans one ~100 ms task.
- **60b-baker.js, enemy frames lazy.** B1 rigs baked all four frames and the flash at once; now idle0
  bakes at once and the rest on first use or in idle time, like the party.
- **60b-baker.js, `rasterize`.** Masks and normals come from one arena per call (views instead of four
  typed arrays per piece: allocation was about a quarter of a bake), with two shared temporaries, and the
  cast-shadow, section-line and despeckle loops no longer build an array or object per pixel. 12-35%
  faster warm, more when cold at boot. Every frame of every class, companion, enemy, elder, wyrm and node
  (392 frames) hashes the same as before.
- **13-art-enemies.js.** `box` / `elderBox` are worked out on first read (posing every frame of every rig
  at load was about 65 ms of boot at x4). Same values.
- **Boot.** 76-create.js draws the four class figures one per task after the first frame (the screen
  itself opens at once; saves that do not need it never build it). 72-ui-gather.js builds its node rows,
  pack grid and trophies (about 75 icons) in idle tasks after boot, or all at once on the tab's first
  update. 90-boot.js works out the away gains and their card in a task right after the first frame (the
  absence is measured at boot, so the gains are the same; if the page is hidden or closed first they are
  applied before the save).
- **70-ui.js, tab first opens.** `setTab` mounts, in registration order, only up to the last section of
  the view that opens; the rest of the tab mounts in later tasks (`mountRest`, COLD_MS each). The first
  updates' 30 ms time box now counts the mounts. `scrollTop = 0` is written before the menu changes (the
  layout is still clean, so it is cheap) instead of after, where it laid the new panel out inside the
  click (20-40 ms at x4). The click task on Craft / Camp went from 110-135 ms (94-115 ms of it JS) to
  85-100 ms (about 40 ms JS).

Measured and not done: device-size copies of sprite frames (hotspot 7a): in-page, turning the sprites off
changed a phone frame's draw plus raster by less than the noise (under 0.5 ms at x4). Cropping the fog
bands (7b): about 0.2 M px a frame at 1:1, measured about 0.2 ms; not worth the extra draw calls.

Pixels: an in-page check in both builds hashed every scene layer, the back and fore layers drawn at 3
camera positions and the atmosphere at a fixed T in 8 zones (7 themes): all identical, and the plate path
equals the scaled path. Screenshots of the create screen and "Choose your path" are identical; the stage
in 3 zones and the Gather, Craft, Camp and Party menus match apart from live numbers.
`node tools/sim.mjs --policy mixed --hours 2 --seed 1` is byte-identical.

## Fixes, pass 3 (PERF3)

Where the phone frame went before this pass (phone/late, x4, in-page toggles, median frame gap): all
on 36 ms, no scenery layers 22-24 ms, no atmosphere 22-26 ms, no key light 27 ms, no lamp glows 28 ms,
nothing drawn 16.7 ms. Per frame the stage scaled 4.2 M device px of layers (6x nearest, 6 times the
0.69 M px canvas) plus about 0.8 M px of bilinear glows, all rasterised in software on the main thread.

- **63-scenery.js, layer spans**: for each layer, bands of rows with the column runs that can show:
  empty pixels are dropped, and so are pixels of a back layer hidden behind a later opaque back layer
  over the whole distance the parallax can move them (camX within +-16, `CAM_MAX`). Found once per
  scene (in idle time, from the art canvases).
- **63-scenery.js, plates**: the runs of each layer scaled once (nearest) to device size and packed
  into one canvas per layer (opaque layers get an `alpha: false` canvas, so a copy is a plain copy).
  Two slots (the scene on screen and the next zone's). A plate is never built in a frame: a miss
  queues it with `idleTask(fn, true)` and that frame draws the layers scaled, as before.
- **63-scenery.js, back-layer composite**: sky, far, mid and ground are composed into one opaque
  canvas (stage plus a margin for the shake, backdrop colour underneath) that is rebuilt only when a
  layer's whole-pixel offset changes (the camera sway moves the ground about 1.4 px a second). Most
  frames draw the whole background as one 1:1 copy. The foreground is copied run by run (30 k px
  instead of 0.85 M).
- **63-scenery.js, vignette**: drawn 1:1 only where it has pixels (its clear middle is skipped; bands
  found once per scene on the half-size overlay, one pixel of margin for the smoothing).
- **63-scenery.js, atmosphere copies**: the fog and vignette device copies (`atmoDev`) now have two
  slots and are built in idle time too (scaled fallback until then). Particles set the composite mode
  and fill once per type instead of twice per particle.
- **61-anim.js `glowAt`**: glows of 96 device px or more (lamp pools and cores, the moon, the key
  light, character and boss lights, big particles) are drawn 1:1 from device-size copies. Sizes snap to
  a 4% grid; LRU capped at 5 M px (20 MB); at most 2 new copies per frame (the rest draw scaled that
  frame). `lightAt` goes through it; the stage sets the view each frame (`devView`).
- **62-stage.js, key light**: its flicker is snapped to 8 steps, so it cycles 8 copies (0.6 MB each).
- **Boss kill (hotspot 10)**: the trace showed the "next zone" warm-up never hit: 90-boot built
  `sceneFor` at the stage element's CSS size (332 x 522) but the stage asks at its logical size
  (221 x 348), so the clearing frame built the scene (80 ms at x4) and then scaled it. `warmScene(z)`
  (62-stage) now builds the scene at the stage's own size, then its plates and atmosphere copies, and
  the warm-up tasks go to the front of the idle queue (`idleTask(fn, soon)`, 60b), ahead of the roster
  portraits. The kill frame fell from 138-186 ms of JS to 14-26 ms.
- **First frame (hotspot 11)**: sections of closed tabs mount on the tab's first open (70-ui:
  `mountTab`, all of a tab's sections at once, in registration order), about 60 ms of boot at x4; a
  character set bakes only idle0 at once and idle1, wind, strike and the hit flash go to the front of
  the idle queue (the stage shows idle0 in place of idle1 until it is baked: `ART.ready`), about one
  bake per party member less before the first frame; class previews on the create screen bake idle0
  only; layer spans, plates and atmosphere copies are no longer built before the first frame.

Pixels: an in-page check draws the same frame (loop stopped, same T) through the old and new paths
and compares `getImageData`. Scenery layers and the vignette are identical in 7 consecutive zones (the 7
zone themes) x 10 camera positions, on the late save at 360 x 740, DPR 2. Glows differ by at most 3-8 of 255 in a channel (position rounded to a whole
device pixel, size snapped to 4%), in 5-8% of channels, all in soft light: not visible. Core files
(00-59) are untouched: `node tools/sim.mjs --policy mixed --hours 2 --seed 1` is byte-identical.

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
7. **Mostly done (pass 3). 63-scenery.js `drawScene` + 62-stage.js `draw`: canvas raster.** The
   layers, vignette and big glows are now 1:1 copies of device-size canvases, the back layers one
   composite (see Fixes, pass 3). Phone/new is within budget; phone/late's fight window still goes
   over (frame gap p95 about 40 ms, 7-16 long tasks in 20 s): that window includes a boss fight and a
   zone clear (the late save's party clears a zone every 20 s or so), the idle-time builds for the next
   zone (scene 30-80 ms at x4, plates and atmosphere 25-45 ms each), and frames of 50-65 ms where the
   canvas hand-off to the compositor (`Commit`, about 16 ms a frame at x4 for the 664 x 1044 canvas)
   meets a busy frame. Pass 3 listed (a) sprite device copies, (b) fog cropping, (c) splitting the
   scene build. **Pass 4:** (c) is done (`buildSteps`), (a) and (b) were measured and dropped (under
   0.5 ms a frame each). The real cause of the phone/late misses was the Deepwell wrapper switching the
   1:1 path off, plus the idle queue starving (see Fixes, pass 4); with both fixed phone/late fights at
   about 48 fps with 0-2 long tasks per 20 s. What is left in a phone frame (x4, in-page): draw plus
   raster about 10 ms, of which the atmosphere is about 6 ms, most of it the lamp glows ('lighter', 1:1
   copies of about 180 device px, 10-18 lamps a scene). Next, if needed: fewer or smaller lamp glows
   per theme (an art call).
8. **Done (pass 2).** 62-stage.js stage tap: rect cached in the ResizeObserver.
9. **56-roster.js `compDps` per tick** (left alone to keep the sim byte-identical):
   `fieldCompDps -> sharedMult -> mod() -> activeOmen` runs every frame, about 3 ms per second
   unthrottled. Cache it per field and modifier state if it grows.
10. **Done (pass 3). Boss kill (zone clear).** The trace showed the pass-1 warm-up never hit (it
    built the scene at the element's CSS size, the stage asks at its logical size), and the idle
    queue ran it behind every roster portrait. Now `warmScene` builds the scene, plates and
    atmosphere copies at the stage's size, at the front of the queue, and a scene's device copies
    are never built inside a frame. The kill frame's JS fell from 138-186 ms to 14-26 ms. The
    harness's "boss kill" window also holds `bossUp`, which on the late save jumps to the frontier
    zone (a scene build the player causes by picking a zone, not warmable): that is the 150-180 ms
    left on phone/late. Pass 4: 140-150 ms (cheaper bakes), just inside budget. To go further,
    `pickScene` could keep the old scene for a few frames while `sceneSteps` builds the new one (a
    visible change on a zone jump, so not done).
11. **Done (pass 4). First frame on the phone** (pass 3 base 1330-1450 → 1050-1080 ms at x4). Pass 4
    moved the class figures, the Gather rows, the rig boxes and the away gains out of boot and made
    bakes cheaper. Left in the first frame: the scene build (about 150-220 ms cold at x4) and one idle0
    bake per party member (25-60 ms each cold); both are needed for that frame. Pass 3 notes:
    (1430-1550 → 1130-1280 ms at x4): closed tabs
    mount on first open, a character set bakes idle0 only up front, the create screen's previews
    bake idle0 only, and no layer spans, plates or atmosphere copies are built before the first
    frame. Left: the boot script is still about 600 ms at x4. The biggest parts are outside the files
    this pass owned: 76-create.js building the create or "Choose your path" screen (about 240 ms,
    shown at load for a new game and for this late save), 72-ui-gather.js at load (about 45 ms),
    13-art-enemies.js (about 65 ms), and `showAwayReport(awayGains(...))` at boot (about 50 ms even
    for a 1 s absence).
12. **Done (pass 4). Tab first opens** (pass 3: Forge 90-120 ms, Camp 85-155 ms on phone/late) now
    mount only the open view's part (in registration order), count the mounts in the first updates'
    time box, and lay the menu out once (scrollTop). Camp 150 → about 100 ms, Craft 80-120 ms. Left in
    those tasks: the click's own layout (about 30 ms at x4) and the first rows (the Camp roster board's
    portraits, when idle time has not baked them yet).
13. **Idle work must stay small.** A phone at x4 has almost no idle periods while fighting, so the idle
    queue runs from timed-out callbacks (60b-baker.js). Keep each `idleTask` under about 16 ms at x4 and
    split bigger builds into steps (a generator works well: `buildSteps`, `spans`, `atmoSteps`).
14. **Wrappers must pass every argument.** 75-deepwell-ui.js wrapped `drawScene` with fewer arguments
    and silently switched off the fast path for every player (fixed in pass 4). When wrapping a stage
    or scenery function, take `(...args)` and pass them all on.

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
  list the player opens now builds in time-boxed chunks (about 20 ms, then `setTimeout`). Work needed
  within seconds goes to the front of the idle queue: `idleTask(fn, true)`. Keep each idle task under
  about 4 ms real (16 ms at x4); split bigger work into steps (a generator, one step per task).
- When you wrap a stage or scenery function (`drawScene`, `drawAtmosphere`, `draw`), pass every
  argument on (`...args`): dropping one can switch off a fast path for every player (hotspot 14).
- Soft glows: draw them with `ANIM.lightAt` / `ANIM.glowAt` (1:1 device-size copies on the stage), not
  a scaled `drawImage` of a 64 px sprite.
- A section's `mount` runs when its tab first opens, not at load (70-ui.js `mountTab`): keep boot free
  of panel building, and never rely on nodes a mount builds before then.
- Run `node tools/perf.mjs --quick` before handing a branch in.
