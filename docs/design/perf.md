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

## Fixes made in this pass

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

Files owned by other agents right now. Each item: where, why it is slow, the fix.

1. **70-ui.js `setHp`: forced layout on every new foe.** When the HP bar grows (every new foe, so
   every kill), it does `tr.style.transition = 'none'; ...; void tr.offsetWidth;`. `ui()` has just
   written a dozen text nodes, so reading `offsetWidth` forces a full style and layout of the page
   inside the frame (in traces: forced `UpdateStyleAndLayout` inside `frame`, 4-10 ms at x4). Fix:
   never read layout in `ui()`. Set `transition: none` and the width now and restore the transition
   in the next `requestAnimationFrame`, or restart the trail with the Web Animations API.
2. **70-ui.js `ui()` and 71-ui-fight.js `uiFight`: unconditional DOM writes.** Every call (5 per
   second) sets `textContent` on ~12 HUD nodes and, on the Fight tab, the gate title/desc and 3 fields
   per Hero row, even when unchanged. Each write replaces the text node and dirties layout, so every
   `ui()` frame pays a style + layout pass (the long tasks left in steady fighting on the late save are
   these frames: JS + 10-20 ms of style/layout + canvas at x4). Fix: the `setTxt(e, t)` guard used in
   75-camp-ui.js and now 75-almanac-ui.js for every `textContent`, `className` and `style.*` write in
   `ui()`, `uiFight`, `uiGather`, `uiForge`, `uiRaid`. Also look up `#modeSeg button` and
   `#amtSeg button` once, not per call.
3. **70-ui.js `showToast`: layout read per toast.** `$('stageBox').offsetHeight` forces layout for
   every notice. Keep the room count up to date from a ResizeObserver on the stage box instead.
4. **75-party.js roster (`party-roster` section): first open, 400-530 ms at x4 (was ~1 s).** The
   portrait bakes are now done ahead in idle time when the player has been in the game a few
   seconds; what is left is building every roster row at once. Fix: build the first screenful of
   rows now and the rest with `idleTask`, or mark off-screen rows `content-visibility: auto`.
5. **World tab first open, 160-230 ms at x4**: the Tavern/Raid/Camp/Almanac parts all mount and
   update with `force` in one task (almanac 50-70 ms, camp-buildings 10-18 ms, 74 panels). Same fix:
   stagger the first updates of the lower parts with `idleTask`.
6. **75-craft-ui.js `craft-recipes` update on open: 20-36 ms at x4**, and 73-ui-forge `uiForge`.
   Guard writes; build recipe rows once and update in place.
7. **62-stage.js `draw`: canvas fill.** Per frame the stage paints a full-stage fill, 5 full-width
   layers, the vignette, 10-18 scaled 'lighter' lamp glows, a key light and a ground pool (also
   scaled). With software canvas each full-stage pass costs ~1-2 ms at x4. In order of value:
   (a) move the vignette and theme tint (`scene.light.overlay`) to a CSS overlay element over the
   canvas (the compositor blends it; 63-scenery would then skip it); (b) drop the full-stage
   `fillRect` if the sky layer is fully opaque (check; keep it while the scene is null); (c) draw the
   key light and ground pool from cached device-resolution sprites 1:1.
8. **62-stage.js stage tap**: `stageEl.getBoundingClientRect()` on every tap forces layout after
   `ui()` writes. Cache the rect in the existing ResizeObserver.
9. **56-roster.js `compDps` per tick** (left alone to keep the sim byte-identical):
   `fieldCompDps -> sharedMult -> mod() -> activeOmen` runs every frame, about 3 ms per second
   unthrottled. Cache it per field and modifier state if it grows.

## Checklist for new code

- Nothing per frame that allocates canvases, gradients or data URLs; bake once and cache.
- Draw cached sprites 1:1 at whole device pixels where you can; scaled draws with smoothing on are
  the most expensive thing on a software canvas.
- In `update(force)` (5 times a second): write DOM only on change; never read layout
  (`offset*`, `getBoundingClientRect`, `getComputedStyle`) after writing.
- Bake or build big things (scenes, character sets, long lists) with `idleTask` ahead of need.
- Run `node tools/perf.mjs --quick` before handing a branch in.
