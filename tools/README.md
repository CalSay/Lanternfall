# Local build and checks

Use a current Node.js LTS release (Node 22 or newer). The same commands work in PowerShell, Command Prompt,
macOS and Linux shells. Run them from the repository root.

```text
npm ci
npx playwright install chromium
node tools/build.mjs
node tools/check.mjs
```

In PowerShell, use `npm.cmd` and `npx.cmd` if the machine's execution policy blocks the corresponding
`.ps1` launchers. There is no need to change that policy.

Playwright is a pinned development dependency. It is not included in the game's single HTML artifact.
The build and headless core checks need only Node; the complete check run also needs Playwright and a
Chromium browser. The final check summary reports how many browser sections were skipped and why.
A zero exit status with skipped browser sections does not establish that the browser checks passed.

`node tools/check.mjs --only="save codes|C5"` selects matching sections. `--jobs=1` runs serially;
the default runs independent sections in parallel. `node tools/perf.mjs --quick` runs the existing
performance budgets without changing their thresholds. Build first so both commands test current code.

## Playtest driver

`node tools/playtest.mjs look | tap "<label>" | wait <seconds> | away <hours> | state | new [fresh|early|mid|late]` plays the
built game in Chromium the way a player does (portrait 360x740, `--landscape` for 740x360) and keeps its save, clock and
screenshots in `--session <dir>` (default `.playtest/`). Build first. How an agent runs a persona session and what to
report: `docs/coord/playtest-lab.md`.

## Story stats

`node tools/story-stats.mjs <save.json | save code | file with a code> [more ...]` prints the Chapter 1 Champion skip rate and
the Journal opens (story-bible.md 12a) from `S.story.ends` and `S.story.journalOpens`. With several saves it adds them up.

## Browser discovery and overrides

The shared browser finder supports the project Playwright installation, its managed Chromium, installed
Chrome or Edge on Windows, and the existing Linux runner paths. Explicit overrides take priority:

```powershell
$env:LF_PLAYWRIGHT = 'C:\path\to\node_modules\playwright'
$env:LF_CHROMIUM = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
node tools/check.mjs
```

`LF_PLAYWRIGHT` may point to the Playwright package directory. `LF_CHROMIUM` points to the browser
executable, not its parent folder. Clear these variables to return to automatic discovery.

The Linux runner's `/opt/node22/lib/node_modules/playwright` and `/opt/pw-browsers/chromium*` locations
remain supported. A missing or invalid explicit override is reported, so a broken configured path does
not silently test a different browser.

## Other local tools

```text
node tools/savecode.mjs tests/fixtures/save-late.json
node tools/offline-parity.mjs --json=/tmp/lanternfall-offline-parity.json
node tools/site.mjs
node tools/serve.mjs
```

The save-code tool validates the JSON before loading it and prints an import code. The site tool wraps
the built artifact in a local `site/` folder; it does not upload or publish it. The server exposes the
built game for local testing. Keep real player saves out of commits and test with disposable fixtures.

The offline audit compares actual live ticks with away progress from the same seeded save at 30 minutes,
2 hours, the 4-hour starting cap, 8 hours and 24 hours. It also checks the 24-hour maximum cap.
Add `--mastered` for the same gathering fixture with Pickaxe mastery already complete. This is a
core-only diagnostic, not a requirement that intentional offline rates equal live rates (C14). Fights earn
nothing while away (combat is active only), so its combat rows are informational. Hero comparisons match the live snapshot to credited away time;
workers and other scheduled systems retain the full wall-clock comparison. The table shows raw away
gains and the boost-normalized hero delta, while optional JSON retains every snapshot and report line.

## Health metrics

```text
node tools/health.mjs --compare
```

Plays three kinds of player (casual, active, optimiser) on fixed seeds and compares the numbers with
`docs/design/health-baseline.json`. It exits 1 when a metric moves past its tolerance in the bad direction. Run it before
and after any balance, economy or pacing change. `--write-baseline` accepts a deliberate shift. See `docs/design/health.md`.

## Branch ledger

```text
node tools/branch-ledger.mjs [--json] [--base REF] [--stale DAYS] [--no-prs]
```

Lists every remote branch ahead of the integration branch: ahead/behind, last commit date, author and subject, open PR
number (needs a signed-in `gh`; otherwise `?`) and a status guess (merged, open PR, review-only art, stale, active).
Markdown on stdout, JSON with `--json`. Run `git fetch` first. It reads git only and touches no game files.

## Difficulty budget

```text
node tools/budget.mjs
```

Plays scratch turn fights for Wren, Tobin and Pip as heroes who keep up with the road at 26 checkpoints (normal foes,
elites, every boss tier, a tier behind on gear), casually and well, and prints each hero's win rate against its band in
`docs/design/difficulty-budget.json`. `health.mjs --compare` gates on it. `--sweep` shows a level either side, `--eval`
tries a tuning change first. See `docs/design/difficulty-budget.md`.

## First-hour walk

`node tools/walk.mjs --seed 1` plays 60 game minutes of the built game as a casual player (reads `LF_EYES`, follows each
guide tip and Next Up, presses moment cards, parries and dodges at set rates) on a fake clock, and writes `tools/.walk/walk-<date>.md` and `.json`
plus shots: the scorecard values F1 to F6, F10 and P4, each beat of `docs/design/first-hour.md` against the minute it
happened (over 50% off is listed), the stretches with nothing new, and every eyes finding (tip over the fighters, off-phase
tip, clipped text, a covered button, a marker that leads nowhere, a stall). It never sets game state. Options: `--size p|l`,
`--hero`, `--minutes`, `--clock-budget <min>` (default 30; the walk stops there and saves a snapshot), `--parry`, `--dodge`,
`--scorecard <file>` (adds one row), `--reports <dir>`, `--snapshot`. Report only. The nightly run is `.github/workflows/walk.yml`
(03:00 UK on the integration head; a manual run takes `seeds` and `sizes`). About 15 clock minutes for 60 game minutes.
