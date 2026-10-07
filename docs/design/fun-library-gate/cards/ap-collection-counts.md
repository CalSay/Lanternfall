# ap-collection-counts: See how much of each place you have found

Lane: claude    Class: C UI    Model: sonnet-medium    Gate: auto    After: f-ci, menu-polish, f-playtest-bots
Base: integration branch `claude/elegant-johnson-m6k00u` at start    Branch: claude/ap-ap-collection-counts-<slug>

## Outcome (player words)
Bestiary, uniques and Deeds show how many you have found out of the total for each place.

## Acceptance (measurable)
- Views show n of m per region or place at 360px with no overflow; a check asserts no unfound item's name or drop source appears anywhere in the rendered text (counts only, no hunting spoilers).

## Prediction (player effect)
Baseline: the mid-game playtest run on the integration branch before the card. Expected: the share of runs that have found every beast and unique in a region they have cleared rises by at least 10 points. Measurement: f-playtest-bots must first ship a seeded-run report with this share and its denominator (runs per persona, at least 20 seeds); this card does not start until that field exists. Metric: that share per region, from the playtest report. Miss: a rise under 5 points after two playtests means the counts come out.

## Scope
Owned files: bestiary, uniques and Deeds views
New save state: none    Switch off: the counts are computed from existing data and shown in the three views only, so revert the card's commit; nothing is stored in the save.

## Source
Fun-library idea gate, 2026-10-05: `docs/design/fun-library-gate/judge-v2.md` (rerun on final evidence) (brief, red team and Opus judge verdict). Coverage-map area 12, 3.

## Stop when
The acceptance line passes in `node tools/check.mjs` and the 360px look is clean.
