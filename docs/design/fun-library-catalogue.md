# Fun-library catalogue: suggestions for Lanternfall, audited

Every suggestion below came from `fun-library.md` and passed the idea gate before entering the backlog: brief
(`fun-library-gate/briefs.md`), red team (Sonnet), Opus high judge. **The gate was run twice.** The first run (`red-team.md`,
`judge.md`) used counts that Codex review later showed were inflated by duplicate Steam reviews and a mixed sample, so it
is kept only as a record. **The second run on the final evidence (`red-team-v2.md`, `judge-v2.md`) is the verdict.** All gate
records are committed in `fun-library-gate/`, with the cards in `fun-library-gate/cards/`.

Counts were refreshed after a fetch fix restored 494 Apple reviews for Idle Heroes (general sample 11,374 to 11,868). The gate ran on the earlier counts; the largest changes are pay-to-win 251 to 290 and walls 423 to 457, and no verdict depends on the order of ads and walls.

Outcome of the second run: 14 ideas (S11 was withdrawn earlier because save codes already exist): **2 admitted narrowed
(ap-first-use-hints, ap-collection-counts), 11 merged into existing cards, 1 dropped (S8)**. Two verdicts
changed from the first run: S7 (in-game What's new) went from admitted to merged into the weekly deploy routine, and S12
(stall facts) went from admitted to merged after the judge re-ran it against the 10% time-stuck bar (see the addendum in
`judge-v2.md`). Both cards were deleted. Counts are floors from the final library (11,868 reviews plus a separate 632-review long-play set).

## Verdict table

| id | Idea | Imp | Ev | Fit | Cost | Rev | Total | Verdict | Goes to | Change from judge.md |
|---|---|---|---|---|---|---|---|---|---|---|
| S1 | Away report is the front door | 2 | 3 | 2 | 4 | 5 | 16 | MERGE | `f-playtest-bots` | same |
| S2 | Offline parity audit (reframed as a band check) | 2 | 1 | 3 | 4 | 5 | 15 | MERGE (reframed) | `f-health-long` | target only (`f-health` is done) |
| S3 | Monetisation guard | 1 | 2 | 2 | 5 | 5 | 15 | MERGE (one line) | `f-compass` | same |
| S4 | Active gold from timing tasks | 4 | 3 | 3 | 2 | 3 | 15 | MERGE | `active-gold-direction` | same, one constraint added |
| S5 | One new system at a time | 3 | 2 | 4 | 4 | 5 | 18 | ADMIT-NARROWED | `ap-first-use-hints` | same verdict, reason changed |
| S6 | Collection log with nearest completion | 4 | 4 | 3 | 3 | 5 | 19 | ADMIT-NARROWED | `ap-collection-counts` | same |
| S7 | In-game What's new | 1 | 1 | 3 | 4 | 5 | 14 | **MERGE** | weekly deploy routine (`playbook.md`) | **CHANGED: was ADMIT-NARROWED** |
| S8 | Mastery that unlocks things | 2 | 1 | 1 | 2 | 4 | 10 | DROP | already an `f-health` metric | same |
| S9 | Content remaining (count new things) | 3 | 3 | 3 | 4 | 5 | 18 | MERGE (reframed) | `xp-gold-pacing-report` | same, with a carding trigger |
| S10 | Dominance detector | 2 | 1 | 4 | 4 | 5 | 16 | MERGE (narrowed, no new work) | `f-health-long` | target only (`f-health` is done) |
| S12 | Stall facts | 2 | 2 | 3 | 3 | 5 | 15 | **MERGE** | `xp-gold-pacing-report` (walls) plus a separate owner-decision task (Region 2 limit hint) | **CHANGED: was ADMIT-NARROWED** (re-judged on the 10% criterion) |
| S13 | Menu budget | 2 | 1 | 4 | 4 | 5 | 16 | MERGE | `f-playtest-bots` (counts) + `ap-first-use-hints` | same |
| S14 | No wait timers or energy (reworded) | 2 | 2 | 2 | 5 | 5 | 16 | MERGE (one line, with S3) | `f-compass` | same verdict, scores up |
| S15 | Repeat-craft queue | 2 | 1 | 2 | 3 | 4 | 12 | MERGE | `crafting-levelling-spec` | same |

Counts: ADMIT 0, ADMIT-NARROWED 2, MERGE 11, DROP 1 (14 ideas). Earlier: ADMIT-NARROWED 4 (after S11's withdrawal),
MERGE 9, DROP 1. The verdict changes are S7 and S12, both ADMIT-NARROWED to MERGE.

## Reasons, idea by idea

**S1, MERGE into `f-playtest-bots` (same).** P1 is 260 positives (3.3%, strong in 11 games), but AFK Arena alone is 68 and
is away *combat*, which Lanternfall bans. Without it, 190. No theme measures away-card clarity, which is what S1 changes.
The away report and its single Collect button already exist (`75-away.js`). The returning-casual persona records seconds
from open to first action; a card is written only if that is over 10 seconds, and then as one header line, not a modal.

**S2, MERGE into `f-health-long`, reframed (target changed).** The final library has no theme for weak offline progress;
the brief's "4 negatives" is void, so do not cite the library. It survives only as a guard on an owner decision ("active
gathering finds more", finder perk about +5%): one band metric, active vs idle gathering yield per job, active ahead in
every job, flagged only when a job falls outside the band. The word "parity" is dropped. `f-health` is done, so the line
goes to `f-health-long`, which owns `tools/health.mjs`.

**S3, MERGE into `f-compass`, one line (same).** Ads 441 general (10.9%) but 7 of 632 long-play; paywalls 290 general,
29 long-play. P3 (247) backs the principle. Lanternfall has no ads and monetisation waits for launch (a membership with
capped convenience perks is already named), and "nothing pay-to-win" is already decided. One Compass line, shared with
S14 (see below). No separate rubric check.

**S4, MERGE into `active-gold-direction` (same, one constraint added).** P4 is 312 (4.0%, strong in 19 games), so the
theme is real, but its quotes praise active play inside the core, not a bolt-on task. Hand the thread three constraints:
run the sim for gold per hour first (inside the card's 25-35% band), reject any option that gives a reason to skip a
fight, and reject any option that needs a repeated check-in (Q11 chores: 48 general, 12 long-play).

**S5, ADMIT-NARROWED as `ap-first-use-hints` (same verdict, reason changed; Ev 3 to 2).** The complaint side is thin: Q8
is 63 general and 14 long-play, Q10 is 69 general and 6 long-play. P5 is large (533) but led by non-idle games (Banner
Saga 70, Slay the Spire 33). So this is no longer justified as a Q8 or Q10 fix. It stays because it is cheap, reversible,
improves an existing system (the docked hint) and lays groundwork for the decided 1.0 in-game guide and glossary. The cap
of one system per hour stays dropped. The judge's old "locked things say what opens them" idea was never gated and stays
out of this card.

**S6, ADMIT-NARROWED as `ap-collection-counts` (same).** Best-supported admit: P6 is 498 positives (6.4%), strong in 32
games, third most praised theme. The quotes praise having collectibles, not a nearest-completion pointer, and "where to
find the rest" breaks "no suggested builds" and "uniques are rarer, the effect is the draw". Counts per place only, never
a named source or name for an unfound item.

**S7, MERGE into the weekly deploy routine (CHANGED from ADMIT-NARROWED).** I take red-team-v2's suggestion. Reasons:
1. Evidence: P7 is 140 positives (1.8%, strong in only 5 games; IdleOn is 27 of them). The theme is a developer who
   keeps adding and fixing. The weekly deploy delivers that whether or not an in-game card exists, and no counted review
   asks for in-game notes. Ev drops to 1.
2. Subtraction: the game already tells warm saves what is new through the `news` bell channel. The card would add a
   changelog file, a new save field (last version seen) and a build rule that fails `check.mjs` on every version without
   an entry. That is a standing process cost and another notice, for the weakest-evidenced idea of the four.
3. The old judge admitted it "on cost" only. Cheap is not a reason to build something nobody asked for.
What it merges into: the weekly deploy step in `autopilot/playbook.md` already appends a line to `docs/coord/deploy-log.md`.
That line gains one player-facing sentence on what changed (3 lines at most). No game code, no save field. Re-brief an
in-game version only if the playtest lab's returning-casual persona reports missing a change that the existing What's
new did not show. The Foreman should mark `ap-whats-new-notes` dropped (merged) and remove its card.

**S8, DROP (same).** P8 is 167 (2.1%), and the library itself marks it not applicable (no prestige or resets, owner
2026-09-27). The deliverable duplicates Proving, Hallowed, Stars and region-boss moments. The useful check (longest
stretch with nothing new, mechanics per hour) is already in `health-baseline.json`.

**S9, MERGE into `xp-gold-pacing-report`, reframed (same, with a trigger).** The evidence rose: Q5 is 167 general and
48 of 632 long-play (7.6%), second only to walls among committed players. Hours of content is still a guess, so count
distinct new things per stage (zones, uniques, abilities, Stars, bosses) that change the player's choices, as one table in
the report. Trigger: if that table names a stage where the count thins out, that stage becomes a brief for the next
idea gate. `f-health-long`'s "time since last new zone" and "share of run past the last reward" give the same signal from
the sim side; no extra work there.

**S10, MERGE into `f-health-long`, narrowed, no new work (target changed; Imp 3 to 2).** Q9 is the rarest quit theme:
28 general (0.7%), 7 long-play, led by Gnorp Apologue and Rogue Legacy 2. The brief's "14 of 14" is void. `f-health-long`
already reports the dominant build "for reference, not ranked as a priority". That is enough: gear lines and Stars only,
report only, no threshold until a first run sets one.

**S12, MERGE into `xp-gold-pacing-report` (CHANGED from ADMIT-NARROWED).** Re-judged on the 10% bar (median time stuck must fall 10% or the card is dropped): a line with no advice cannot close a power gap, the persona result is hard to measure honestly, and no review says "I did not know why I was stuck". Q2 walls (99 of 632 long-play, 457 general) backs shorter walls, which is the pacing report's job; it adds one line, the casual persona's median time stuck at each stall it finds. The Region 2 limit hint (owner decision 2026-09-28) becomes its own task with no time-stuck threshold: one docked line of live numbers, the existing no-item/talent/ability/Star/advice-word check, no new save state.

**S13, MERGE into `f-playtest-bots` (counts) and `ap-first-use-hints` (same).** Q8 is 63 general, 14 long-play. The
playtest driver's `look` records buttons and notices per screen as a baseline; `ap-first-use-hints` already caps notices
per unlock at 1. A cap, if ever, comes from measured screens plus a margin.

**S14, MERGE into `f-compass`, one line with S3 (same verdict, Imp and Ev 1 to 2).** Q7 is 153 general and 22 long-play
(3.5%), but RAID alone is 40 and the leaders are monetised energy games. Lanternfall has no energy and its timers (shift
fees, production chains, trade runs, cooldowns, Storehouse cap) are decided and not paywalled. The Compass gets one
anti-goal line covering S3 and S14: "No card adds a way to spend real money, an ad, energy, or a timer that blocks active
play or can be skipped for money." It names shift fees, cooldowns, production chains, trade runs and the Storehouse cap
as excluded. Monetisation itself stays an owner decision.

**S15, MERGE into `crafting-levelling-spec` (same).** P12 is 141 (1.8%) and is about interface clarity and bug fixes,
not queues; do not cite it. One open question for that thread: does the refining step need a batch count (deterministic
crafts only, capped at 10, stops on a full Storehouse)? Reforge and random-affix crafts stay one at a time.

## Admitted cards

None of these may include the "locked things say what opens them" line or the "visible goals by range" count; neither
was gated.

| card id | title (player words) | lane | class | model | gate | after | acceptance (one measurable line) | area |
|---|---|---|---|---|---|---|---|---|
| ap-first-use-hints | Each new system explains itself once | claude | A content + C UI | sonnet-medium | auto | menu-polish | A `check.mjs` section lists every system that unlocks after the first fight and fails if any has 0 or 2+ first-use lines in the existing docked hint; in the new-player playtest no unlock shows more than 1 notice. | 16, 4 |
| ap-collection-counts | See how much of each place you have found | claude | C UI | sonnet-medium | auto | f-ci, menu-polish | Bestiary, uniques and Deeds show "n of m" per region or place at 360px (and landscape) with no overflow, and a check fails if any unfound item's name or drop source appears in the rendered text. | 12, 3 |

The two admitted cards' Source lines point at `judge-v2.md`. `ap-stall-facts` was dropped (merged) and its card deleted.

## Not yet gated (nothing from this list is in a card made by this thread)
Candidates from the first judge: an error watch, "locked things say what opens them", and "visible goals by range". None has
had a red team and judge. Cards outside this gate currently carry two of them, which the coordinator should resolve:
`f-playtest-bots` has a visible-goals line, and `ap-error-watch` is marked ready without the gate. See
`fun-library-gate/judge-v2.md`, section "Problems found in existing cards".

## Withdrawn
S11 (`ap-save-export`): the game already ships save export and import (`src/js/55-savecode.js`, `75-savecode-ui.js`, tested in
`check.mjs`); the first judge was wrong. The card was deleted.

## Audit trail
`fun-library-gate/` holds `briefs.md`, `red-team.md`, `judge.md` (first run, superseded), `red-team-v2.md`, `judge-v2.md`
(final, with the S12 addendum) and the two admitted cards.
