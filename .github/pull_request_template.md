Rubric: <mechanic | balance | ui | content | tools | art | design-doc>  (see docs/review/)

## Card
Card id:

### Outcome
<paste the card's outcome>

### Acceptance
<paste the card's acceptance lines>

## What changed
Before:

After:

## Proof route
`docs/proof/<card-id>/route.txt` (played with `tools/playtest.mjs`; CI's `eyes` job replays it). Pure refactor with no visible change: label `no-visible-change` and say so here.

## Acceptance map
One line per acceptance line: the `expect` or `shot` that proves it.
- <acceptance line> -> `expect "..."` / `shot <name>`

## Scope cuts
Each cut is a `proposed` card file in the project's `autopilot/cards/`. Name them here, or write "none".

## Patch-note line
`docs/coord/patch-notes/<card-id>.md`: one player-words line and the best shot's name.

## Health metrics before/after
<`node tools/health.mjs` numbers before and after, or "n/a" with the reason>

## Checks
- [ ] `node tools/build.mjs`
- [ ] `node tools/check.mjs` (skipped sections named)
- [ ] Hard checks in the rubric
