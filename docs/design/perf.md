# Performance: budget, benchmark and hotspots

Owner direction: "We should be constantly checking that the speed and smoothness of the game are
as good as possible." This page holds the budget, how to measure it, and the rules for new code.

## Commands

```
node tools/build.mjs && node tools/perf.mjs --quick   # ~40 s, phone only: run after every merge
node tools/perf.mjs                                    # ~6 min: phone and desktop, new game and late save
node tools/perf.mjs --html old/dist/lanternfall.html   # benchmark another build (before/after)
node tools/perf.mjs --quick --compare base.html        # ~8 min: this dist vs a base dist on the same machine (see Slow machines)
node tools/perf.mjs --trace out/                       # also save a Chrome trace of each fight window
```

Exit code 1 when any metric is over budget. `--json file` writes the raw numbers, `--only phone|desktop`
and `--save new|late` narrow the run.

## Method

`tools/perf.mjs` runs headless Chromium (Playwright, found by `tools/lib/browser.mjs`; see `tools/README.md`) against an
instrumented copy of `dist/lanternfall.html`. dist itself is not changed. The copy:

- is wrapped in a document skeleton with a device-width viewport, as the artifact host does;
- has a small hook appended inside the game's IIFE that times `frame` (the whole rAF callback),
  the first `draw`, `ui()` and each part of it (`uiFight`..., every registered section), and exposes
  test helpers (`bossUp`, `bossKill`, `toast`, `setTab`);
- blocks every outside request (Google Fonts), so runs are repeatable offline.

Scenarios: a new game (no save, class picked through the creation screen) and
`tests/fixtures/save-late.json` (seeded into localStorage before page scripts, `last` = now so the
away card stays shut). Each runs in a fresh browser context,
at **phone** 360 x 740, DPR 2, touch, CPU slowed x4 (CDP `Emulation.setCPUThrottlingRate`), and at
**desktop** 1280 x 800, DPR 1, full speed.

Sequence per scenario: load, warm up, open every tab in turn (first open mounts it, then it updates),
a burst of 16 toasts, a frontier boss (10 kills, challenge, kill 2 s later: zone clear and a new
scene), then 20 s of steady fighting (frame stats, `ui()` cost), GC-to-GC heap growth over 60 s, DOM
node count, and taps on the Attack button (pointerdown to click handled, and to the next painted frame; story
pop-ups are closed first and only taps that land on the button count). The full run also measures gathering, a swarm
scenario and a boss kit.

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

## Hotspots and lessons

Passes 1-4 (PERF, PERF2-4) and C12 fixed the big ones: guarded DOM writes, lazy tab mounts, 1:1 cached scene plates and
glows, a warmed next scene, an idle queue that runs under load, and scene builds in small steps. Their measurements
are in git history (`git show 1536ffa:docs/design/perf.md`, `git show 1536ffa:docs/coord/perf-c12.md`).

Still worth knowing:

1. **The canvas raster is the main cost on a phone.** What is left in a phone frame (x4) is draw plus raster, about
   10 ms, most of it lamp glows (1:1 copies of about 180 device px, 10-18 lamps a scene). Fewer or smaller glows per
   theme is an art call.
2. **A zone jump builds a new scene** (150-180 ms on the late save at x4). It cannot be warmed, since the player picks
   it.
3. **Idle work must stay small.** A phone at x4 has almost no idle periods while fighting, so the idle queue runs from
   timed-out callbacks (60b-baker.js). Keep each `idleTask` under about 16 ms at x4 and split bigger builds into steps
   (a generator works well: `buildSteps`, `spans`, `atmoSteps`).
4. **Wrappers must pass every argument.** 75-deepwell-ui.js once wrapped `drawScene` with fewer arguments and silently
   switched off the fast path for every player. When wrapping a stage or scenery function, take `(...args)` and pass
   them all on.

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
  argument on (`...args`): dropping one can switch off a fast path for every player (lesson 4 above).
- Soft glows: draw them with `ANIM.lightAt` / `ANIM.glowAt` (1:1 device-size copies on the stage), not
  a scaled `drawImage` of a 64 px sprite.
- A section's `mount` runs when its tab first opens, not at load (70-ui.js `mountTab`): keep boot free
  of panel building, and never rely on nodes a mount builds before then.
- Run `node tools/perf.mjs --quick` before handing a branch in.

## Slow machines (found 2026-10-06, perf-quick-baseline)

The absolute budgets were set on a fast machine. On the cloud build containers (4 CPUs, software canvas, CPU x4) `--quick` misses 44 to 53 metrics on the integration branch, and on builds from before today too (c1af26c and 56335c5 gave 49 and 53): first frame about 3.7 s, gather about 25 fps, tap to paint 240 to 380 ms. The art data (about 7 MB of the page) has not grown since 2 Oct, so this is the machine, not a slowdown. Run to run the same build varies by 2x on tab and gather timings and by 3x on long-task counts, so a single base-vs-head comparison also false-alarms (tried: 3 to 4 "regressions" comparing a build with itself).

So on these containers read `--quick` as report only (CI already does). To judge a change, run `--html <base dist>` and the new dist back to back, three times each, and compare medians. Do not raise the budgets: they stay the target for a real phone.

### Judge a change on a slow machine: `--compare` (perf-quick-rebaseline, 2026-10-06)

Build the base branch, copy its `dist/lanternfall.html` somewhere, build your branch, then run
`node tools/perf.mjs --quick --compare <base dist>`. Both builds run three times (`--runs N`), alternating, on the same machine.
Each metric is the median of its runs. A metric fails only if it is over its budget AND more than 1.25x the base build's median
(plus 5% of the budget as a floor). A metric over budget on both builds prints as `noise` (the machine, not the change). Exit code 1 if any fails.
The budgets themselves are unchanged: they stay the target for a real phone, and plain `--quick` still reports against them.

Two harness fixes landed with it: the run closes the new moment card (`.mm-ov`) like the story sheets, and the tap test waits for a live
Attack button and retries until it has the wanted number of real taps (the button greys out between packs, so on a new game it often measured 0 or 1 tap).
