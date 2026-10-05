# ap-collection-counts: See how much of each place you have found

Lane: claude    Class: C UI    Model: sonnet-medium    Gate: auto    After: f-ci, menu-polish
Base: integration branch `claude/elegant-johnson-m6k00u` at start    Branch: claude/ap-ap-collection-counts-<slug>

## Outcome (player words)
Bestiary, uniques and Deeds show how many you have found out of the total for each place.

## Acceptance (measurable)
- Views show n of m per region or place at 360px with no overflow; a check asserts no unfound item's name or drop source appears anywhere in the rendered text (counts only, no hunting spoilers).

## Scope
Owned files: bestiary, uniques and Deeds views
New save state: none

## Source
Fun-library idea gate, 2026-10-05: `research/catalogue/judge-v2.md` (rerun on final evidence) (brief, red team and Opus judge verdict). Coverage-map area 12, 3.

## Stop when
The acceptance line passes in `node tools/check.mjs` and the 360px look is clean.
