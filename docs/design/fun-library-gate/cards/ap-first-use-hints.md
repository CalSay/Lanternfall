# ap-first-use-hints: Each new system explains itself once

Lane: claude    Class: A content + C UI    Model: sonnet-medium    Gate: auto    After: menu-polish, f-playtest-bots
Base: integration branch `claude/elegant-johnson-m6k00u` at start    Branch: claude/ap-ap-first-use-hints-<slug>

## Outcome (player words)
The first time a system opens, the docked hint says what it is in one line.

## Acceptance (measurable)
- Every system that unlocks after the first fight has exactly one first-use line (check lists systems with 0 or 2+ lines and fails); notices per unlock is at most 1 in the new-player playtest.

## Prediction (player effect)
Baseline: the new-player playtest run on the integration branch before the card (f-playtest-bots). Expected: the share of runs that use each newly unlocked system within 10 minutes of its unlock rises by at least 10 points, and notices per unlock stay at 1 or less. Measurement: f-playtest-bots must first ship a seeded-run report with this share and its denominator (runs per persona, at least 20 seeds); this card does not start until that field exists. Metric: that share per system, from the playtest report. Miss: a rise under 5 points after two playtests means the lines come out.

## Scope
Owned files: onboard hint data (55-onboard.js)
New save state: none    Switch off: the lines are plain data in the onboard hint file, so revert the card's commit or delete the entries; nothing is stored in the save.

## Source
Fun-library idea gate, 2026-10-05: `docs/design/fun-library-gate/judge-v2.md` (rerun on final evidence) (brief, red team and Opus judge verdict). Coverage-map area 16, 4.

## Stop when
The acceptance line passes in `node tools/check.mjs` and the 360px look is clean.
