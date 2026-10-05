# ap-stall-facts: The game tells you plainly when you are stuck

Lane: claude    Class: B mechanic (small)    Model: sonnet-medium    Gate: judge    After: xp-gold-pacing-report, f-playtest-bots
Base: integration branch `claude/elegant-johnson-m6k00u` at start    Branch: claude/ap-ap-stall-facts-<slug>

## Outcome (player words)
When the hero is stuck, one docked line states the facts with live numbers and gives no advice.

## Acceptance (measurable)
- From a stall fixture save, one docked line appears after 3 lost fights in a row at one zone using only live numbers (a check fails if it names an item, talent, ability or Star or uses a listed advice word), and the playtest lab records the casual persona's time stuck at that stall before and after; the judge keeps the line only if the casual persona's median time stuck at that stall falls by at least 10%, and drops the card if it does not.

## Scope
Owned files: docked hint module
New save state: none

## Source
Fun-library idea gate, 2026-10-05: `research/catalogue/judge-v2.md` (rerun on final evidence) (brief, red team and Opus judge verdict). Coverage-map area 7, 3.

## Stop when
The acceptance line passes in `node tools/check.mjs` and the 360px look is clean.
