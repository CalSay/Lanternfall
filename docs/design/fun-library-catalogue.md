# Fun-library catalogue: suggestions for Lanternfall, audited

Every suggestion below came from `fun-library.md`, then passed the idea gate before entering the backlog:
brief (`fun-library-gate/briefs.md`), red team (Sonnet, `fun-library-gate/red-team.md`), Opus high judge (`fun-library-gate/judge.md`), all committed beside this file.
Outcome on 2026-10-05: 15 ideas in, **5 admitted (narrowed; 1 later withdrawn, see Correction), 9 merged into existing cards, 1 dropped**.
Codex reviews this document on the PR before merge. Evidence counts are floors (see the library's limits).

## Verdict table

| id | Idea | Imp | Ev | Fit | Cost | Rev | Total | Verdict | Goes to |
|---|---|---|---|---|---|---|---|---|---|
| S1 | Away report is the front door | 2 | 2 | 2 | 4 | 5 | 15 | MERGE | `f-playtest-bots` |
| S2 | Offline parity audit | 2 | 1 | 2 | 4 | 5 | 14 | MERGE (reframed) | `f-health` |
| S3 | Monetisation guard in the rubric | 1 | 2 | 2 | 5 | 5 | 15 | MERGE (cut to one line) | `f-compass` |
| S4 | Active gold from timing tasks | 4 | 3 | 3 | 2 | 3 | 15 | MERGE | `active-gold-direction` |
| S5 | One new system at a time | 3 | 3 | 4 | 4 | 5 | 19 | ADMIT-NARROWED | `ap-first-use-hints` |
| S6 | Collection log with nearest completion | 4 | 4 | 3 | 3 | 5 | 19 | ADMIT-NARROWED | `ap-collection-counts` |
| S7 | In-game What's new | 2 | 2 | 4 | 4 | 5 | 17 | ADMIT-NARROWED | `ap-whats-new-notes` |
| S8 | Mastery that unlocks things | 2 | 1 | 2 | 2 | 4 | 11 | DROP | covered by `f-health` metric |
| S9 | Content-hours-remaining tracker | 3 | 2 | 3 | 4 | 5 | 17 | MERGE (reframed) | `xp-gold-pacing-report` |
| S10 | Dominance detector in the sim | 3 | 2 | 4 | 3 | 5 | 17 | MERGE (narrowed) | `f-health` |
| S11 | Save safety net | 5 | 3 | 5 | 3 | 3 | 19 | ADMIT-NARROWED | `ap-save-export` |
| S12 | Stall hint | 4 | 3 | 3 | 4 | 5 | 19 | ADMIT-NARROWED | `ap-stall-facts` |
| S13 | Menu budget | 2 | 1 | 4 | 4 | 5 | 16 | MERGE | `f-playtest-bots` (counts) + S5 card |
| S14 | No wait timers or energy | 1 | 1 | 1 | 5 | 5 | 13 | MERGE (reworded) | `f-compass` (with S3) |
| S15 | Repeat-craft queue | 2 | 1 | 2 | 3 | 4 | 12 | MERGE | `crafting-levelling-spec` |

Counts: ADMIT 0, ADMIT-NARROWED 5, MERGE 9, DROP 1.

## Admitted cards

| card id | title (player words) | lane | class | model | gate | after | acceptance (measurable) | area |
|---|---|---|---|---|---|---|---|---|
| ~~ap-save-export~~ (withdrawn: save codes already exist) | Back up your save and bring it back | claude | A save + C UI | sonnet-medium (Opus high save review) | judge | f-ci, fix-bounty-kind | A save exported from each fixture in the CI save corpus imports back to an identical `S` (deep-equal after `fresh()` merge), and a bad or truncated paste changes nothing and says why | 20 |
| ap-stall-facts | The game tells you plainly when you are stuck | claude | B mechanic (small) | sonnet-medium | judge | xp-gold-pacing-report, f-health | After 3 lost fights in a row at the same zone (or no zone gained in a set time from the pacing report), one docked factual line appears with live numbers and no advice; the casual persona's longest stretch with no visible next step drops against the `f-health` baseline | 7, 3 |
| ap-collection-counts | See how much of each place you have found | claude | C UI | sonnet-medium | auto | f-ci, menu-polish | Bestiary, uniques and Deeds show "n of m" per region or place at 360px with no overflow; a check asserts no unfound item's name or drop source appears anywhere in the rendered text | 12, 3 |
| ap-first-use-hints | Each new system explains itself once | claude | A content + C UI | sonnet-medium | auto | menu-polish | Every system that unlocks after the first fight has exactly one first-use line in the existing docked hint (check lists systems with 0 or 2+ lines and fails); notices per unlock is at most 1 in the new-player playtest | 16, 4 |
| ap-whats-new-notes | Returning players see what changed | claude | F tooling + C UI | sonnet-low | auto | f-ci | The build reads the top entry of a player changelog file and shows it once per version through the existing `news` bell channel for warm saves only (never a new game, never a modal); `check.mjs` fails if the entry is missing or longer than 3 lines | 21 |

## Reasons, idea by idea

**S1, MERGE into `f-playtest-bots`.** The away report and its one Collect button already exist. The red team is right
that the card is thin (gathering only) and that a front-door card adds a tap to every session. Ask the returning-casual
persona in the playtest lab to record seconds from open to first action. Card a change only if that is over 10 seconds,
and then as a header line, not a modal.

**S2, MERGE into `f-health`, reframed.** "Parity" is the wrong target: the owner decided active gathering finds more,
and the 4-count evidence comes from a discarded pass. Add one metric to `f-health`: active vs idle gathering yield per
job, with a band (active ahead in every job). Report only when a job falls outside it.

**S3 and S14, MERGE into `f-compass`.** Monetisation and its gates are owner decisions that wait for launch, and a
membership with convenience perks is already named. The Compass should restate the existing decision in one
anti-goal line: "no card adds a way to spend real money, an ad, or a timer that blocks active play". It should exclude
shift fees, cooldowns, production chains and the Storehouse cap by name. No separate rubric check; `f-rubrics` is done
and the mechanic rubric can cite the Compass.

**S4, MERGE into `active-gold-direction`.** This card exists and already sets the 25-35% band for skilled play. Two red
team constraints are worth handing to its thread: run the sim for gold per hour before building, and reject options
that give a reason to skip fights.

**S5, ADMIT-NARROWED as `ap-first-use-hints`.** Drop the cap of one system per hour; 1.0 content will break it, and
Q10's evidence is a complaint about gating, not for it. Keep the cheap, plain part: each system says what it is once,
in the docked hint that already exists. This improves onboarding without a new system and serves the planned in-game
guide. It goes after `menu-polish` because both touch guide text in `55-onboard.js`.

**S6, ADMIT-NARROWED as `ap-collection-counts`.** Biggest positive theme (P6, 215) and it improves systems we already
have. The red team's objection holds: "closest to done" and "where to find the rest" are suggested-build behaviour and
spoil drop hunts. Show counts per place only, never a named source for an unfound item. The Stars map already groups
by place, so this card covers only the views that do not.

**S7, ADMIT-NARROWED as `ap-whats-new-notes`.** Weak evidence for an in-game card, but it is cheap and reuses the
existing What's new channel. Narrowed so it cannot go stale silently: written from a committed file, shown once per
version, bell only, checked by `check.mjs`. One new save field for the last version seen, registered with a default.

**S8, DROP.** Prestige evidence for a game with no prestige, and the deliverable duplicates the Proving, Hallowed,
Stars and region-boss moments already decided. The one useful check ("no long stretch without a new option") is
already an `f-health` metric (longest stretch without a reward, new mechanics per hour).

**S9, MERGE into `xp-gold-pacing-report`, reframed.** Hours of content is a guess. Count distinct new things instead
(zones, uniques, abilities, Stars, bosses) per stage, defined as things that change a player's choices. One extra
table in that report names the stage where the count thins out.

**S10, MERGE into `f-health`, narrowed.** `f-health` already measures dominant choices. Narrow it to gear lines and Stars
(non-timing choices the sim can judge), set the threshold from a first run, and keep it report only.

**S11, ADMIT-NARROWED as `ap-save-export`.** The strongest admit: Q1 is the largest quit theme, export and import is a
1.0 commitment, and the game has none today. Cut the rolling backup in the same localStorage; it does not survive a
cleared origin and risks the quota inside the save path. Keep export (copyable text) and import (paste box with an
in-page confirm, since `confirm()` does nothing in the viewer), plus a round-trip test over the CI save corpus. No
reminder notices; at most a quiet "last backed up" line in settings. Gate judge with an Opus save review because it
touches the save path.

**S12, ADMIT-NARROWED as `ap-stall-facts`.** Walls are the top long-play quit reason (Q2, 31). The fix must not become a
suggested build. A factual line from live numbers ("You lost 3 fights in a row at zone 12"), no advice. It also
delivers the decided "Region 2 hint when the hero hits its limit" in a form that stays honest when balance changes.
It waits for `xp-gold-pacing-report` so the trigger matches where players actually stall. Gate judge because the
wording sits next to the no-suggested-builds rule.

**S13, MERGE into `f-playtest-bots` and `ap-first-use-hints`.** Thinnest evidence in the library (1.6% of negatives). The
playtest driver's `look` already lists buttons and notices; have it record counts per screen at 360px as a baseline.
A cap, if ever, comes from those measured numbers plus a margin.

**S15, MERGE into `crafting-levelling-spec`.** No counted evidence. Production chains already run in the background,
and the spec already adds a refining step. Hand the thread one open question: does the refining step need a batch
count (deterministic crafts only, capped, stops when the Storehouse is full)? Random-affix crafts and Reforge stay one
at a time.

## Missing ideas the research implies (max 3)

1. **Error watch (Q1, area 19 and 20).** Bugs and crashes are the top quit theme, and only S11 addresses the save half.
   The playtest driver and `check.mjs` browser runs should fail on any uncaught page error during a persona session,
   and the game should keep the last few errors in memory for a "copy bug report" line in settings. Cheap, connects
   existing tools. Suggested card: `ap-error-watch`, F tooling, sonnet-medium, auto, after `f-playtest-bots`.
2. **Locked things say what opens them (Q10, area 16 and 4).** Melvor's 16 tutorial complaints are locked-content
   surprise. Every locked tab, building or button should state its unlock in one line ("Opens after the Fenmother").
   Improves existing UI, no new system. Could fold into `ap-first-use-hints`.
3. **Goals at three ranges has no measure owner (P9, area 3).** No card counts visible goals in minutes, hours and days.
   Add "visible goals by range" to the playtest lab report format in `f-playtest-bots`, so a gap shows up before
   anyone designs a goal system.

## Not yet gated (candidates only, do not card)
The judge's three missing ideas (error watch, locked things name their unlock, visible goals by range) have not had a
red team. `ap-first-use-hints` already carries the second; the third is a line in the `f-playtest-bots` report format.
The error watch needs a brief and the gate before it becomes `ap-error-watch`.

## Audit trail
`fun-library-gate/briefs.md`, `red-team.md` and `judge.md` hold the full gate record.
Cards written to `autopilot/cards/`: ap-stall-facts, ap-collection-counts, ap-first-use-hints,
ap-whats-new-notes. The Foreman adds their backlog rows.

## Correction after the judge ran (2026-10-05, f-fun-library thread)
The judge said the game has no save export or import. That is wrong: `src/js/55-savecode.js` and `75-savecode-ui.js`
already ship save codes with a copy fallback and a guarded import, and `check.mjs` tests them ("C5 UI" lines). **S11 /
`ap-save-export` is withdrawn as a duplicate and its card file deleted.** What remains of Q1 (bugs and lost saves are the top
quit theme) is the error watch below, which still needs its own brief and gate. Admitted cards: 4, not 5.

## Update after widening to 56 games and removing duplicates (2026-10-05)
The gate ran on the first 21-game counts. Cal asked why only 21 games were read, the corpus became 56, and Codex review then
found that the first Steam samples held duplicate reviews (about 36%). The library was rebuilt on 11,679 distinct
reviews. Re-checking the verdicts against the rebuilt counts, none flips:
- S12 (stall facts): walls are still the top long-play reason (99 of 632 Steam negatives).
- S5 and S13 (first-use hints, menu budget): cluttered menus 61 negatives, 14 long-play (up from 27).
- S6 (collection counts): collection is the third most praised theme (480 reviews, 31 games).
- S9 (content remaining) and S14 (no energy gates): empty endgame is 183 negatives, 48 long-play; energy and timer gates are
  158 negatives, 22 long-play, so S14 now has real support for a Compass line.
- S10 (dominance detector): dominant strategy is rare (29 negatives, 7 long-play), weaker than the gate believed (it said
  14 of 14). It stays a report-only line in f-health, no card.
No verdict was re-run through the red team and judge; the Compass or planner thread may re-score S9, S10 and S14.
