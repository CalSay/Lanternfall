# C12 performance pass

## Local Windows recovery

The recovered scheduling fix is based on `13af1fd`, first replayed as `2d8a2b2`
on `b334967`, then rebased onto `f46c990`. The paired measurements below are of
**b334967 and b334967 plus the scheduling fix**, not of the later integration
checkpoint. The later checkpoint did not change the gathering warm-up source.
Only `63c-scenery-gather.js` scheduling, an additive C12 check block and this report
change. Art, renderer algorithms, save state and performance budgets are untouched.

Environment: Windows, bundled Node 24.19.0, bundled Playwright, installed Microsoft
Edge, eight reported CPUs. No other agent browser checks or simulations ran during
timed samples. The normal benchmark's phone viewport is 360x740, DPR2, CPU x4.

Artifacts are retained locally in
`C:/Users/callu/AppData/Local/Temp/lanternfall-c12-local-b334967/`:
`baseline.html`, `candidate.html`, their `*-quick.log`/`*-quick.json`, `profile.mjs`,
`baseline-normal-*` and `candidate-normal-*` CPU profiles, Chrome traces and JSON
summaries. The earlier `before*`/`baseline-profile*` diagnostics are exploratory;
CPU x4 left the idle queue delayed, so they are not the final lifecycle comparison.
Historical cloud numbers at the end are not fresh local results; their raw files
were not recovered.

Artifact SHA256:
- Baseline: `f3733f53e6e17dc127709bed8948ae67dd9825dc30fd94163d58b3d52f6a4220`.
- Candidate: `f57c391c3dcadc51f0aae0dba4336f90c329f02f4972f017d5994ddf295a98b5`.

## Unchanged local budget run

Ran `tools/perf.mjs --quick --html <artifact> --json <result>` sequentially for both
artifacts, using the same `LF_PLAYWRIGHT` and `LF_CHROMIUM` paths. Each includes new
and late saves. Both returned 1 for failed budgets, with zero game page errors.
This is one paired sample, not a median or proof of overall improvement.

| Metric | Baseline new / late | Candidate new / late | Budget |
|---|---:|---:|---:|
| Failed budgets | 29/40 / 39/46 | 32/40 / 39/46 | 0 |
| First frame, ms | 7000 / 5294 | 5236 / 5328 | 1500 |
| Fight JS p95, ms | 25.9 / 21.8 | 22.0 / 16.8 | 8 |
| Fight long tasks | 18 / 6 | 11 / 2 | 1 |
| Fight UI p95, ms | 16.0 / 15.9 | 18.0 / 9.2 | 8 |
| Ore switch longest task, ms | 375 / 348 | 275 / 219 | 150 |
| Wood switch longest task, ms | 280 / 250 | 214 / 207 | 150 |
| Herb switch longest task, ms | 229 / 229 | 224 / 235 | 150 |
| Crystal switch longest task, ms | 238 / 243 | 232 / 226 | 150 |

Overall failures are 68/86 before and 71/86 after. The candidate does **not** pass the
performance gate. Most sampled switches are shorter, but they still exceed budget;
steady-stage, UI, cold-load and other costs remain. No budget was relaxed.

## Confirmed local lifecycle fix

The final diagnostic uses the real game, late-save fixture, landscape 740x360 then
844x390, DPR2, normal CPU speed. It waits for the initial idle queue to drain,
opens Gather and observes ten seconds. Instrumentation counts actual builder
steps/completions and unfinished-cache evictions, and records CPU profiles/traces.
It does not mock the renderer or scheduler. These timings are diagnostic only.

| Ten-second warm-up | Baseline | Candidate |
|---|---:|---:|
| Mine / Glade / Woods / Meadow steps | 618 / 618 / 618 / 617 | 10 / 10 / 10 / 10 |
| Completed scenes | 0 / 4 | 4 / 4 |
| Unfinished-build evictions | 2468 | 0 |
| Total instrumented builder time, ms | 4448.8 | 154.8 |
| Game page errors | 0 | 0 |

The baseline CPU profile attributes 2343 ms of self samples to `buildSteps` during
warm-up; the candidate completes its work and returns to idle. Four independently
rescheduled builders were evicting each other from the three-entry unfinished
cache. The queue finishes one scene before starting the next while still yielding
after every generator step. Cache limits, scene contents and gameplay are unchanged.

## Remaining costs and proposed follow-up

- Camp: the fixture has one present gatherer and nine buildings. Normal-speed camp
  painting p95 was 1.3/3.5 ms, with cold maxima 16.1/35.2 ms. CPU x4 exploratory
  cold paint reached 123.5 ms. `workerFrame` synchronously bakes a missing cached
  frame. This does not justify rewriting the whole panorama. A separate measured
  follow-up could warm the existing worker frame through idle scheduling before
  opening Camp; no art-content changes are needed. Not included in this patch.
- Stage (Claude): CPU profiles repeatedly identify native `drawImage` and atmosphere
  drawing. In the x4 diagnostic, stage draw p95 was 9.6 ms and atmosphere 4.1 ms.
  Proposed investigation in `62-stage.js`: warm existing device-size scene/atmosphere
  plates for the impending gathering view, keyed by dimensions/DPR, then check if
  the switch avoids first-frame scaling. Preserve visual output and cache bounds;
  do not lower art quality or change drawing without measured evidence and approval.
- Shell (Claude): a captured `warmSections` callback in `70-ui.js` took 51.8 ms at
  normal speed. Its 30 ms budget is checked before each indivisible section update.
  Proposed patch direction: permit costly section initialization to yield between
  row batches; preserve immediate initialization of visible controls. Merely lowering
  the outer budget cannot split a single expensive section. Camp traces also include
  10-12 ms Layout tasks and sampled `updatePill` work; those samples alone do not
  prove a specific DOM write is responsible. Do not bypass its existing signature cache.

## Validation

On `f46c990` plus this patch: build passes; source syntax passes; focused C12 browser
regression passes five assertions with zero skipped browser sections. Both tested
landscape resizes finish all four scenes in ten steps each, reopening reuses them,
and there are no page errors. Earlier non-browser smoke passed as well.
Full `tools/check.mjs --jobs=2` finished with 1,940 passing assertions, two failures
and zero skipped browser sections. Both failures were in the existing 1280x720
first-session guide: the walk stopped after `tool`, and only 19 states were seen
against a minimum of 20. No bad-target detail or page error was reported. The
guide loop has a 220-iteration limit. One diagnostic rerun with
`--only=landscape 1280x720` passed all 15 assertions with zero skipped sections.
No unchanged full rerun was made. Logs: `full-f46c990.log` and
`landscape1280-isolated.log` in the artifact directory above.

This is a WIP handoff pending the coordinator's validation decision; the full
functional run and the performance gate are not green.

## Historical cloud record (not local validation)

The following material was recovered from the earlier cloud transcript. Its raw
profiles are unavailable locally. The older checkpoint names and pending statuses
below describe that historical run, not the current Windows validation.

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
