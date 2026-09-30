# C12 performance pass

Recovery note: source, regression and report recovered from the cloud transcript onto c3c2cf3 on 2026-09-30. The cloud raw profile files are not available locally. Historical measurements below are retained as reported evidence, not fresh local validation. Syntax and whitespace checks pass; browser regression, paired local performance and full-suite validation remain pending. This is a WIP checkpoint, not a completion handoff.

Status: gather warm-up starvation reproduced and fixed; timed validation pending the next exclusive window. Base is C2 `bdc82f43e9df6ebd500dce6c9fc50d65ab110ed0` on `codex/c12-perf`.

## Measurement plan

1. Build the untouched source. Run the existing `tools/perf.mjs --quick --json` with its budgets unchanged, explicit Playwright/Chromium paths, and no concurrent browser/check jobs. Retain complete raw output and failures.
2. Profile the real built artifact in fresh browser contexts using the existing in-IIFE instrumentation pattern, CDP CPU profiles, and Chrome traces. Cover phone portrait at 360×740/DPR2/CPU×4 for direct budget comparability, phone landscape at 740×360/DPR2/CPU×4 for the current target layout, and desktop where a finding needs confirmation.
3. Measure camp panorama cold first open and steady updates with a populated crew, Gather menu warm-up followed by activity switches to Ore/Wood/Herbs/Crystal, and steady stage draw. Separate scene-build, draw, UI, raster and idle work. Instrumented profiles diagnose costs; unchanged-harness runs decide budget outcomes.
4. If a Codex-owned hotspot is proven, make the smallest bounded fix, verify output/behavior, and alternate before/after runs in the same environment. Preserve original artifact for `--html` comparisons. Leave Claude-owned source unchanged and describe exact proposed patches with evidence.
5. Build and run required checks after code changes, keeping zero browser skips and reporting every failure honestly. Do not loosen budgets or treat profiling overhead as production cost.

## Source hypotheses to verify

- `63c-scenery-gather.js` queues four unique gathering scene themes concurrently, but `63-scenery.js` retains only three in-progress `sceneSteps` generators. Round-robin builders may repeatedly evict one another, leaving the activity-switch frame to finish a cold scene synchronously. Confirm step/start/completion counts and CPU stacks before changing scheduling.
- `campPaintScene` redraws static trees, ground, buildings and text on every Camp update (roughly five times/second), alongside the animated fire and crew. Measure that cost and first-use worker baking before considering a bounded static-layer cache.
- Stage draw and hero art live in Claude-owned `62-stage.js` and `64h-hero-sprites.js`; any identified hot paths require a proposal, not a direct edit. `70-ui.js` also remains Claude-owned.

## Untouched baseline

`node tools/build.mjs` succeeded (2444.6 KB). Built artifact preserved outside the checkout at `/workspace/scratch/lanternfall/c12/baseline.html`.

Ran the unmodified harness with `LF_PLAYWRIGHT=/workspace/Lanternfall/node_modules/playwright LF_CHROMIUM=/usr/bin/chromium node tools/perf.mjs --quick --save late --json /workspace/scratch/lanternfall/c12/base-late.json`. Chromium used the harness's portrait phone viewport, DPR 2 and CPU ×4. The localhost server required sandbox escalation. Runtime 91 seconds, five reported CPUs, **38 failed budgets / 46 checks**, no page errors. Raw output: `base-late.log` beside the JSON. An earlier sample overlapped another agent's checks and is retained as `contaminated-late.*`; it is excluded from conclusions.

| Metric | Untouched measured | Existing budget |
|---|---:|---:|
| First frame | 3517 ms | 1500 ms |
| Fight JS/frame p95 / p99 | 39.9 / 79.4 ms | 8 / 16.7 ms |
| Fight frame gap p95 | 113.8 ms | 34 ms |
| Fight long tasks / 7-second window | 37 | 1 |
| Fight `ui()` p95 | 25.8 ms | 8 ms |
| Camp tab longest task | 300 ms | 150 ms |
| Ore / Wood / Herb / Crystal switch longest task | 339 / 220 / 207 / 152 ms | 150 ms each |
| GC-to-GC heap growth | 2.76 MB/min | 2 MB/min |
| Tap to paint median | 460.8 ms | 150 ms |

These numbers are much slower than historical results in `docs/design/perf.md`; cross-machine before/after claims would be invalid. They establish current-container failures, not their cause. The Camp section's initial maximum was 105.1 ms, median 4.2 ms; its building list maximum was 75.4 ms, median 2.3 ms. Those section timers include more than panorama painting. Profile before selecting a fix. The short heap sample is not enough to establish a persistent leak.

## Confirmed gathering warm-up starvation

Instrumented copies of the actual built game counted `sceneSteps` calls/completions and the existing
three-entry unfinished-build map's evictions. This did not replace the renderer, idle scheduler or
scene builder with mocks. A late save started at 740×360, then resized to 844×390 and opened Gather.
Each of four newly sized themes was queued by the real menu event. Before the fix, all four builders
repeatedly evicted one another before finishing. The diagnostic ran concurrently with other agents'
functional checks; its counts establish the lifecycle defect, but its durations are not benchmark
comparisons.

| Six-second observation | Original source | Fixed source |
|---|---:|---:|
| Calls per theme (Mine / Glade / Woods / Meadow) | 116 / 116 / 116 / 116 | 10 / 10 / 10 / 10 |
| Completed gathering scenes | 0 / 4 | 4 / 4 |
| Unfinished-build evictions | 461 | 0 |

CPU sampling of the original run identified repeated `buildSteps` work among the leading sampled
JavaScript frames. The fixed run completed the four builds and returned to ordinary rendering/idle
work. Profiles and raw counters are in `/workspace/scratch/lanternfall/c12/{before,after}-warm.*`.
Two logged network failures are the intentionally blocked external font requests; no game JavaScript
error occurred. The first diagnostic attempts failed because the temporary server omitted UTF-8;
those attempts produced no useful game measurements and were discarded.

The fix changes only `63c-scenery-gather.js`: one gathering warm-up queue finishes a scene before
starting the next, still scheduling only one generator step per background idle task. Other idle
work keeps its turn, and the general renderer's three-build/eight-scene cache limits are untouched.
Scene art, random seeds, device plates and gameplay state are unchanged.

The new C12 browser check uses real scenes after two landscape resizes, verifies all four complete
in a bounded number of steps, and verifies reopening Gather reuses the completed work. Targeted
check execution, a new-save baseline, and quiet paired late-save performance runs are still pending.
Camp panorama and Claude-owned stage/hero/UI hotspots remain to be profiled; this patch makes no
claim that all 38 baseline budget failures are resolved.

