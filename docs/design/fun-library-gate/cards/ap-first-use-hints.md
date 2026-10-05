# ap-first-use-hints: Each new system explains itself once

Lane: claude    Class: A content + C UI    Model: sonnet-medium    Gate: auto    After: menu-polish
Base: integration branch `claude/elegant-johnson-m6k00u` at start    Branch: claude/ap-ap-first-use-hints-<slug>

## Outcome (player words)
The first time a system opens, the docked hint says what it is in one line.

## Acceptance (measurable)
- Every system that unlocks after the first fight has exactly one first-use line (check lists systems with 0 or 2+ lines and fails); notices per unlock is at most 1 in the new-player playtest.

## Scope
Owned files: onboard hint data (55-onboard.js)
New save state: none

## Source
Fun-library idea gate, 2026-10-05: `research/catalogue/judge-v2.md` (rerun on final evidence) (brief, red team and Opus judge verdict). Coverage-map area 16, 4.

## Stop when
The acceptance line passes in `node tools/check.mjs` and the 360px look is clean.
