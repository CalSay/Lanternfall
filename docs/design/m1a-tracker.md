# M1a tracker

Live tracking for Milestone 1a, "The Hollow, first three areas" (zones 1 to 15). The definition is in
`docs/design/milestones.md`; this file only records where each exit criterion stands. If the two disagree, `milestones.md` wins.

**Last updated:** 2026-10-07 (card `m1-panel`). Earliest close: 2026-10-19, if the art lands.

## How to keep this file current

- Update a row in the same PR that changes its status. One line of evidence per change: the PR number, a report path or a command result.
- Status words: **Open** (not met, work under way), **Blocked** (waits on something named), **Not built** (the check does not exist yet),
  **Met** (the check passes on a Monday build). A criterion is Met only when its own check passes. Opinion does not count.
- Card status comes from `autopilot/plan/plan.json`. Do not copy a card's status here for more than a day; name the card instead.
- Never edit a criterion here. Changes to a criterion go in `milestones.md` with a line in `docs/DECISIONS.md`.

## Exit criteria

All eight must hold on the same Monday build, no earlier than M0's second Monday build.

| # | Criterion (short) | Check | Status | What stands in the way | Cards |
|---|---|---|---|---|---|
| E1 | M0 closed (first hour F1 to F9, Cal notes, leaky replay) | playbook M0 line; scorecard F1 to F9; `walk.mjs --strict` | Open | 2026-10-07 walk missed F3 (18 big moments), F4 (14 new things) and F5 (40 findings at 360x740). | walk-bot-follow-up (running), unlock-gap-trial, unlock-voice (done), first-hour-art, cache-art, cache-looks, early-polish |
| E2 | Health in band, zero open gaps to zone 15, bare heroes lose to bosses | `health.mjs --compare`; `budget.mjs --slice 15` and `health.mjs --slice 15` | Open | Every band to zone 15 must hold, with zero open `gaps` rows and `stallCount` 0. Bare heroes must lose to bosses (`z5-boss-bare`, `z10-boss-bare`, new `z15-boss-bare`). `--slice` flags not built. | boss-tiers-pr2 (running), boss-tiers-pr4, tobin-safety-margin, gear-weight, resolve-bag-ways, gold-without-training, craft-attribute-grades, weapon-profiles, refine-queues, first-gold-and-camp-strip, active-gold-direction, crafting-levelling-spec. boss-tiers-pr3 is done (per plan.json). |
| E3 | Every fight kind in the slice runs as a turn fight | `check.mjs` C29 sections; new `slice-turn-check` | Open | Section `slice-turn-check (core)` passes for zone foes, elites, zone-boss Champions (zones 5, 10, 15) and a Deepwell floor (2026-10-07, card slice-turn-check). The Captain is not in the game yet (`ZONE_FOES[z].captain` unset), so Captain fights are not covered; the check picks them up once a Captain card sets it. | slice-turn-check (done), a Captain card (not written) |
| E4 | Every fight and place has vetted art, wired | `embed-foes.mjs --check`, `embed-bg.mjs --check`; new `slice-art-manifest` | Blocked | The Codex art lane is paused. Fails today by design. Each pack also needs a "wire" ruling in DECISIONS (Art); a stand-in never counts. | slice-art-manifest (running per plan.json), codex-art-ability-icons-4, wire-ability-icons-wren-tobin, starter-portrait-sprite-match, hero-portraits (running), 7 Codex packs, 7 `integrate:` cards (to write) |
| E5 | Every opening system explained once, none too fast | `check.mjs` "unlock tip coverage (E5)" (built); F4 on `walk.mjs --strict`; unlock-spacing metric | Part built | The tip-coverage check is in: a new game walked to zone 15 opens every system, spaced 60 s, each with a first-use line, a Hesketh line or its own step, and a real view. F4 on the walk and the `health.mjs` spacing metric are still open. Every hero who can join needs a kit, or is not offered. | unlock-tip-coverage (done), later-heroes-hidden (proposed), unlock-voice (done), ap-first-use-hints, abilities-stars-menus, gather-tip-spacing-stall |
| E6 | Clean at 360px and 740x360, no page errors, rarity shown | `eyes.mjs --strict`; `walk.mjs --strict` per hero; new `walk.mjs --fixture early` | Open | 40 findings at 360x740 on the last walk. `--fixture` start not built. | walk-fixture-start (proposed), craft-moments-show-rarity (no card file yet), early-polish. portrait-banner-over-hero and moment-cap-headroom are done (per plan.json). |
| E7 | First three areas play end to end as story | `docs/review/story.md` hard checks; new `champion-scene-check` | Blocked | `starters-join-when-met` waits on `starter-meet-scenes`. | starter-meet-scenes (proposed), champion-scene-check (proposed), starters-join-when-met (blocked), story-systems-fixes, story-encounter-hooks |
| E8 | Cold panel finds no blocker, late leg holds, saves safe | panel report; `playtest.mjs new save-z13`; `check.mjs` "saves"; save-risk review | Not built | E8a: panel report on the release candidate (F7 to F9, R1). E8b: 5 cold players from a zone-13 fixture, 3 of 5 want to keep playing. A play prompt goes to Cal (never a gate). No `save-z13` fixture yet. | fixture-z13 (proposed), save-fixture-current (running), save-risk-review (done per plan.json) |

## Art bill (E4)

The Codex lane is paused (0 packs a week today).

| Pack | Status |
|---|---|
| Area-1 sheet (Briarbound Ravager, Thornwing, Nightseed Sorcerer, Captain looks and moves) | Not started |
| Batwing Caves area pack | Not started |
| Bonefield area pack | Not started |
| Briar Regent pack | Not started |
| Hollow Cantor pack | Not started |
| Ossuary Marshal pack | Not started |
| Backgrounds pack (Caves and Bonefield) | Not started |

Each pack is one Codex card, then one `integrate:` card (S). Mark a row **Vetted** when the art judge passes it and **Wired** when
`embed-foes.mjs --check` or `embed-bg.mjs --check` sees it.

**Re-plan trigger:** if the Codex lane is still paused on 2026-10-21, or fewer than 2 vetted packs land in the first 4 weeks after
it resumes, the judge re-cuts E4 to zones 1 to 10 and moves zones 11 to 15 to M1b. The change goes in `docs/DECISIONS.md`.

## Close steps

Run after E1 to E8 hold on one Monday build.

| Step | Status |
|---|---|
| Weekly design review (cross-system) | Not started |
| Cut-or-merge review (two weakest systems get a card) | Not started |
| Targeted play prompt sent to Cal (his answer is never a gate) | Not started |
| "What's left" note that seeds M1b or M2 | Not started |
| Digest reports the close | Not started |

## Change log

- 2026-10-07: first version. Card statuses are from `plan.json` and can be newer than `milestones.md`. Criteria read from `milestones.md`, the 2026-10-07 walk row in `autopilot/scorecard.md` and `plan.json`.
