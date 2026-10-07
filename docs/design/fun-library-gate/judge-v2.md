# Idea gate, rerun: judge's verdicts on S1 to S10 and S12 to S15 (corrected evidence)

Written 2026-10-05 by the idea-gate judge (Opus, read-only except this file). This replaces `judge.md` for every idea
it covers. S11 stays withdrawn (save codes already ship in `55-savecode.js` / `75-savecode-ui.js`).

Inputs: `briefs.md` (ideas only; its counts are void), `../fun-library.md` (FINAL, 56 games, 11,374 distinct reviews plus
a separate 632-review long-play set; the only source of counts here), `red-team-v2.md`, the earlier `red-team.md` and
`judge.md`, `../fun-library-catalogue.md` (Correction and Update notes), `autopilot/coverage-map.md`,
`autopilot/backlog.md`, `autopilot/cards/`, and `docs/DECISIONS.md` on `origin/claude/elegant-johnson-m6k00u`.

Scores 1 to 5: Imp = impact, Ev = confidence in the evidence (final counts only), Fit = fit with owner decisions,
Cost (5 = cheap), Rev = reversibility. Bias to subtraction: improving or connecting an existing system beats a new one,
and an idea an existing card already covers is merged, not carded. Counts are floors, rung 3 evidence; they rank themes
and lose to Cal's playtests and to measurements on our game.

Things that changed since `judge.md`, besides the counts:
- `f-health` is **done** (PR #39). Ideas the old judge merged into it (S2, S10) now go to `f-health-long`, which is
  ready and owns `tools/health.mjs --long`. S8's covering metric (longest dry stretch, mechanics per hour) is already in
  `health-baseline.json`.
- The game already has a warm-save What's new path (`emit('whatsNew')`, the `news` bell channel, `70-ui.js`), which shows
  new-system lines to returning players today. That matters for S7.

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
| S12 | Stall facts | 4 | 3 | 3 | 4 | 5 | 19 | ADMIT-NARROWED | `ap-stall-facts` | same verdict, acceptance changed |
| S13 | Menu budget | 2 | 1 | 4 | 4 | 5 | 16 | MERGE | `f-playtest-bots` (counts) + `ap-first-use-hints` | same |
| S14 | No wait timers or energy (reworded) | 2 | 2 | 2 | 5 | 5 | 16 | MERGE (one line, with S3) | `f-compass` | same verdict, scores up |
| S15 | Repeat-craft queue | 2 | 1 | 2 | 3 | 4 | 12 | MERGE | `crafting-levelling-spec` | same |

Counts: ADMIT 0, ADMIT-NARROWED 3, MERGE 10, DROP 1 (14 ideas). Earlier: ADMIT-NARROWED 4 (after S11's withdrawal),
MERGE 9, DROP 1. The one verdict change is S7, ADMIT-NARROWED to MERGE.

## Reasons, idea by idea

**S1, MERGE into `f-playtest-bots` (same).** P1 is 258 positives (3.4%, strong in 11 games), but AFK Arena alone is 68 and
is away *combat*, which Lanternfall bans. Without it, 190. No theme measures away-card clarity, which is what S1 changes.
The away report and its single Collect button already exist (`75-away.js`). The returning-casual persona records seconds
from open to first action; a card is written only if that is over 10 seconds, and then as one header line, not a modal.

**S2, MERGE into `f-health-long`, reframed (target changed).** The final library has no theme for weak offline progress;
the brief's "4 negatives" is void, so do not cite the library. It survives only as a guard on an owner decision ("active
gathering finds more", finder perk about +5%): one band metric, active vs idle gathering yield per job, active ahead in
every job, flagged only when a job falls outside the band. The word "parity" is dropped. `f-health` is done, so the line
goes to `f-health-long`, which owns `tools/health.mjs`.

**S3, MERGE into `f-compass`, one line (same).** Ads 431 general (11.2%) but 7 of 632 long-play; paywalls 251 general,
29 long-play. P3 (237) backs the principle. Lanternfall has no ads and monetisation waits for launch (a membership with
capped convenience perks is already named), and "nothing pay-to-win" is already decided. One Compass line, shared with
S14 (see below). No separate rubric check.

**S4, MERGE into `active-gold-direction` (same, one constraint added).** P4 is 305 (4.1%, strong in 19 games), so the
theme is real, but its quotes praise active play inside the core, not a bolt-on task. Hand the thread three constraints:
run the sim for gold per hour first (inside the card's 25-35% band), reject any option that gives a reason to skip a
fight, and reject any option that needs a repeated check-in (Q11 chores: 45 general, 12 long-play).

**S5, ADMIT-NARROWED as `ap-first-use-hints` (same verdict, reason changed; Ev 3 to 2).** The complaint side is thin: Q8
is 58 general and 14 long-play, Q10 is 63 general and 6 long-play. P5 is large (516) but led by non-idle games (Banner
Saga 70, Slay the Spire 33). So this is no longer justified as a Q8 or Q10 fix. It stays because it is cheap, reversible,
improves an existing system (the docked hint) and lays groundwork for the decided 1.0 in-game guide and glossary. The cap
of one system per hour stays dropped. The judge's old "locked things say what opens them" idea was never gated and stays
out of this card.

**S6, ADMIT-NARROWED as `ap-collection-counts` (same).** Best-supported admit: P6 is 480 positives (6.4%), strong in 31
games, third most praised theme. The quotes praise having collectibles, not a nearest-completion pointer, and "where to
find the rest" breaks "no suggested builds" and "uniques are rarer, the effect is the draw". Counts per place only, never
a named source or name for an unfound item.

**S7, MERGE into the weekly deploy routine (CHANGED from ADMIT-NARROWED).** I take red-team-v2's suggestion. Reasons:
1. Evidence: P7 is 136 positives (1.8%, strong in only 5 games; IdleOn is 27 of them). The theme is a developer who
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

**S8, DROP (same).** P8 is 166 (2.2%), and the library itself marks it not applicable (no prestige or resets, owner
2026-09-27). The deliverable duplicates Proving, Hallowed, Stars and region-boss moments. The useful check (longest
stretch with nothing new, mechanics per hour) is already in `health-baseline.json`.

**S9, MERGE into `xp-gold-pacing-report`, reframed (same, with a trigger).** The evidence rose: Q5 is 160 general and
48 of 632 long-play (7.6%), second only to walls among committed players. Hours of content is still a guess, so count
distinct new things per stage (zones, uniques, abilities, Stars, bosses) that change the player's choices, as one table in
the report. Trigger: if that table names a stage where the count thins out, that stage becomes a brief for the next
idea gate. `f-health-long`'s "time since last new zone" and "share of run past the last reward" give the same signal from
the sim side; no extra work there.

**S10, MERGE into `f-health-long`, narrowed, no new work (target changed; Imp 3 to 2).** Q9 is the rarest quit theme:
27 general (0.7%), 7 long-play, led by Gnorp Apologue and Rogue Legacy 2. The brief's "14 of 14" is void. `f-health-long`
already reports the dominant build "for reference, not ranked as a priority". That is enough: gear lines and Stars only,
report only, no threshold until a first run sets one.

**S12, ADMIT-NARROWED as `ap-stall-facts` (same verdict, acceptance changed).** Q2 walls is the top long-play reason:
99 of 632 (15.7%), 423 general (11.0%). Caveats: its leaders are gacha power walls (RAID 60, AFK Arena 23) and it overlaps
Q4 and Q7, and no review says "I did not know why I was stuck". So the evidence backs reducing walls (the pacing report's
job) more than explaining them. The card stays because it also delivers a standing owner decision ("Region 2 ... with a
hint when the hero hits its limit", 2026-09-28) in a form that stays honest when balance changes and cannot become a
suggested build. Per red-team-v2 the acceptance now measures time stuck, not hint views, and it no longer leans on
"visible next step" (close to the ungated visible-goals idea). It waits for the pacing report (so the trigger matches
real stalls) and for `f-playtest-bots` (so time stuck can be measured). `f-health` is done and leaves the after list.

**S13, MERGE into `f-playtest-bots` (counts) and `ap-first-use-hints` (same).** Q8 is 58 general, 14 long-play. The
playtest driver's `look` records buttons and notices per screen as a baseline; `ap-first-use-hints` already caps notices
per unlock at 1. A cap, if ever, comes from measured screens plus a margin.

**S14, MERGE into `f-compass`, one line with S3 (same verdict, Imp and Ev 1 to 2).** Q7 is 145 general and 22 long-play
(3.5%), but RAID alone is 40 and the leaders are monetised energy games. Lanternfall has no energy and its timers (shift
fees, production chains, trade runs, cooldowns, Storehouse cap) are decided and not paywalled. The Compass gets one
anti-goal line covering S3 and S14: "No card adds a way to spend real money, an ad, energy, or a timer that blocks active
play or can be skipped for money." It names shift fees, cooldowns, production chains, trade runs and the Storehouse cap
as excluded. Monetisation itself stays an owner decision.

**S15, MERGE into `crafting-levelling-spec` (same).** P12 is 138 (1.8%) and is about interface clarity and bug fixes,
not queues; do not cite it. One open question for that thread: does the refining step need a batch count (deterministic
crafts only, capped at 10, stops on a full Storehouse)? Reforge and random-affix crafts stay one at a time.

## Admitted cards

None of these may include the "locked things say what opens them" line or the "visible goals by range" count; neither
was gated.

| card id | title (player words) | lane | class | model | gate | after | acceptance (one measurable line) | area |
|---|---|---|---|---|---|---|---|---|
| ap-first-use-hints | Each new system explains itself once | claude | A content + C UI | sonnet-medium | auto | menu-polish | A `check.mjs` section lists every system that unlocks after the first fight and fails if any has 0 or 2+ first-use lines in the existing docked hint; in the new-player playtest no unlock shows more than 1 notice. | 16, 4 |
| ap-collection-counts | See how much of each place you have found | claude | C UI | sonnet-medium | auto | f-ci, menu-polish | Bestiary, uniques and Deeds show "n of m" per region or place at 360px (and landscape) with no overflow, and a check fails if any unfound item's name or drop source appears in the rendered text. | 12, 3 |
| ap-stall-facts | The game tells you plainly when you are stuck | claude | B mechanic (small) | sonnet-medium | judge | xp-gold-pacing-report, f-playtest-bots | From a stall fixture save, one docked line appears after 3 lost fights in a row at one zone using only live numbers (a check fails if it names an item, talent, ability or Star or uses a listed advice word), and the playtest lab records the casual persona's time stuck at that stall before and after, with the judge keeping the line only if time stuck does not rise. | 7, 3 |

Card edits the Foreman should make (I am read-only):
- `ap-stall-facts`: replace the acceptance line with the one above; After becomes `xp-gold-pacing-report, f-playtest-bots`.
- `ap-collection-counts`, `ap-first-use-hints`: acceptance unchanged in substance; point Source at `judge-v2.md` and
  cite final counts only (P6 480, 31 games; S5 as onboarding and 1.0 guide groundwork, not Q8).
- `ap-whats-new-notes`: mark dropped (merged into the weekly deploy routine) and delete the card.

## Problems found in existing cards (outside this gate, for the coordinator)

1. **`f-playtest-bots` contains the ungated visible-goals line.** Its Acceptance says "Every report counts visible goals
   by range (minutes, hours, days)". The catalogue says that line is not in the card; it is. Remove it until the idea
   has a brief and passes the gate.
2. **`ap-error-watch` is `ready` without a gate.** The catalogue Correction says it "still needs its own brief and gate",
   and its Source cites void counts (252, 27). Final Q1 counts are 576 general and 33 long-play. Either gate it or note
   why it is exempt (observability tooling, class F, may count as `auto`), and fix the counts.
3. **`f-health-long` cites void counts** ("11,679 reviews", "Q9 29 negatives"). Final: 11,374 reviews, Q9 27 general,
   7 long-play.
4. **`judge.md` and the catalogue's verdict table** still show S7 as admitted and S2/S10 going to `f-health`; this file
   supersedes them.

## Addendum: S12 re-judged on the 10% criterion

Written 2026-10-05 by the idea-gate judge (Opus), after Codex's review. Codex is right that "time stuck does not rise"
lets a line with zero player benefit pass. The acceptance line is now: "the judge keeps the line only if the casual
persona's median time stuck at that stall falls by at least 10%, and drops the card if it does not." S12 is re-judged
against that line, final counts only (`../fun-library.md`; Q2 walls 423 general, 99 of 632 long-play).

| id | Idea | Imp | Ev | Fit | Cost | Rev | Total | Verdict | Goes to | Change from the S12 row above |
|---|---|---|---|---|---|---|---|---|---|---|
| S12 | Stall facts | 2 | 2 | 3 | 3 | 5 | 15 | **MERGE** | `xp-gold-pacing-report` (walls); Region 2 limit hint handed to the coordinator as an owner-decision task | **CHANGED: was ADMIT-NARROWED, 19** |

Reasons:
1. **The 10% bar is the right bar, and this card will probably miss it.** Time stuck at a wall is mostly the power gap:
   the levels and gear the hero still needs. A line with no advice cannot shrink that gap. It can only cut the part of
   the stall spent retrying without knowing why, and the card is forbidden to say what to do instead. After 3 lost fights
   the player already knows they are stuck, so "lost 3 fights in a row at zone 12" plus live numbers mostly repeats what
   the fight log shows. I see no clear path from this line to a 10% drop. Imp 4 to 2.
2. **It is hard to measure honestly.** If the casual persona is scripted, it reacts to the line only if we script it to,
   so any drop is something we built in. If it is model-driven and reads the screen, a 10% move in a median needs enough
   seeded runs per arm to beat run-to-run noise, and neither the card nor `f-playtest-bots` says how many. Either way the
   measurement costs more than the line. Cost 4 to 3.
3. **The evidence never backed explaining walls.** Q2 is the top long-play reason (99 of 632, 15.7%), but its leaders are
   gacha power walls (RAID 60, AFK Arena 23, Idle Archer TD 20, Hero Wars 19), it overlaps Q4 and Q7, and no counted
   review says "I did not know why I was stuck". The library supports making walls shorter. That is already
   `xp-gold-pacing-report`'s job, so S12's evidence merges there. Ev 3 to 2.
4. **The card was propped up by an owner decision, and the 10% bar should not decide that.** "Region 2 expects a
   trained-up, stronger hero, with a hint when the hero hits its limit" (2026-09-28) is a standing owner decision. Owner
   decisions do not need the fun gate, and a fun-gate kill switch must not be able to cancel one. So I split the two: the
   fun-library card goes, and the owner's Region 2 hint is delivered as its own small task, judged on being correct and
   advice-free, not on a 10% playtest delta. Fit stays 3: the decision wants a hint, while "no suggested builds" limits
   what any hint can say.
5. **Bias to subtraction.** Merging leaves one less mechanic, one less playtest arm and one less gated card, and loses
   nothing the evidence supports.

What should change in the catalogue (`../fun-library-catalogue.md`) and cards (the Foreman makes these; I am read-only):
- Verdict table: the S12 row becomes `| S12 | Stall facts | 2 | 2 | 3 | 3 | 5 | 15 | MERGE | xp-gold-pacing-report (walls) + owner-decision task (Region 2 limit hint) | CHANGED: was ADMIT-NARROWED |`.
- Headline counts become **ADMIT 0, ADMIT-NARROWED 2 (ap-first-use-hints, ap-collection-counts), MERGE 11, DROP 1**
  (14 ideas). Verdict changes in this rerun are now S7 and S12.
- Remove the `ap-stall-facts` row from the admitted-cards table and its S12 paragraph's "ADMIT-NARROWED" wording; replace
  it with a pointer to this addendum.
- Mark `ap-stall-facts` dropped (merged) and delete `cards/ap-stall-facts.md`.
- `xp-gold-pacing-report`: add one line to its report: for each stall it finds, the time the casual persona spends there
  (median over the seeded runs it already uses). Walls are cut by pacing, not by text.
- New coordinator item, outside the fun gate: deliver the owner decision "a hint when the hero hits its limit" for
  Region 2. Constraints carried over: one docked line, live numbers only, the existing check that fails on any item,
  talent, ability or Star name or listed advice word, no new save state. Acceptance: the line appears at the Region 2
  limit in a fixture save and passes that check. No time-stuck threshold. If the owner wants a measured benefit, that is
  the owner's call, not this gate's.
- Re-brief a fun-library stall card only if the playtest lab or Cal's playtests show players stuck because they did not
  understand the stall (for example, retrying a zone they cannot win while an easier zone would level them faster).
