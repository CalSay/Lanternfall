# Codex as builder: rules for `codex-build` issues

You build one card at a time. Claude gives you a GitHub issue titled `codex-build: <card id>` with the card text, then
comments `@codex` with the task. Claude stays responsible for the result and reviews your PR before it merges.

## What you may build
Self-contained, clear-spec, low-risk work: UI layout and alignment, icon and art wiring, copy, content data inside an
existing format, and tools that touch no game files.

## What you never touch
Saves, the save key (the `KEY` in `src/js/30-state.js`), economy numbers, active/away parity, the online layer (`80-online.js`,
`52-raid.js`, `74-ui-raid.js`, the db/room/user shapes in `CLAUDE.md`), hero kits, new mechanics, any design call, and
hot files another Claude stream holds. If the card seems to need one of these, stop and say so in the issue.

## How to work
1. Read `CLAUDE.md`, then `docs/ARCHITECTURE.md` for the extension points. Keep edits to shared files small.
2. Branch `codex/<card id>` from the checkpoint the issue names, or else the tip of `claude/elegant-johnson-m6k00u`. Never push to `claude/*` or `main`.
3. Build only what the card's Acceptance lists. Anything extra goes in the PR body as a "Scope cut" idea, not in the diff.
4. Run `node tools/build.mjs`, then `node tools/check.mjs`. Both must pass. Commit the rebuilt `dist/` output only through
   the build.
5. Copy is short, plain, active, in a player's words.
6. If the card changes `src/`, commit `docs/proof/<card id>/route.txt` (the issue supplies it). CI replays it and makes
   the screenshots. You need no browser.
7. Open a PR into `claude/elegant-johnson-m6k00u` using `.github/pull_request_template.md`: a `Rubric:` line (pick from
   `docs/review/`), the card's outcome and acceptance lines, and one line per acceptance item saying how it is met.
   Add `docs/coord/patch-notes/<card id>.md` with one player-words line (tooling cards: skip it and note that the PR is
   `no-visible-change`).

## The bar Claude checks you against
Build and full check green; the matching `docs/review/` rubric hard checks pass and no criterion scores 1 or 2; every
acceptance line is met; no forbidden file touched; at 360px wide, with reduced motion respected, if it is UI.

## Review rounds
Claude's shepherd leaves at most two `@codex` fix rounds. After that Claude finishes the work on its own
`claude/ap-<card id>-codexfix` branch from yours and closes your PR as superseded.

## Why this exists, and how to switch it off
Why: builds queue behind Claude's usage, while clear-spec UI, copy and data cards need no design judgement (Cal,
2026-10-06). The first card (`codex-pilot`) measures the lane: PR opened unaided, time to PR, rounds needed, first-check
pass. If a card returns to Claude twice, or no PR appears within 2 hours, the lane stays unproven.
Off: delete the two pointer lines in `AGENTS.md`; Claude stops opening `codex-build` issues. This is docs only and
touches no saves.
