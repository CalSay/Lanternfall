# Red team v2: S1 to S10 and S12 to S15 against the FINAL library (56 games)

Written 2026-10-05. Job: argue against each idea, using only counts from `research/fun-library.md` (11,374 reviews: 7,516
positive, 3,858 negative; separate long-play set of 632 Steam negatives from 50+ hour players). Brief counts are ignored.
S11 is withdrawn (save codes already ship). Not balanced on purpose. "Earlier verdict" is the judge's call in `judge.md`.

Percent shares used below (computed here): positives are out of 7,516, general negatives out of 3,858, long-play out of 632.

| Theme | Count | Share |
|---|---|---|
| P1 away progress | 258 | 3.4% of positives |
| P4 active play | 305 | 4.1% |
| P5 gradual depth | 516 | 6.9% |
| P6 collection chase | 480 | 6.4% |
| P7 dev keeps updating | 136 | 1.8% |
| P8 prestige that opens things | 166 | 2.2% |
| P12 QoL and readable UI | 138 | 1.8% |
| Q2 walls and grind | 423 general / 99 long-play | 11.0% / 15.7% |
| Q3 ads | 431 / 7 | 11.2% / 1.1% |
| Q4 pay-to-win, paywalls | 251 / 29 | 6.5% / 4.6% |
| Q5 empty endgame | 160 / 48 | 4.1% / 7.6% |
| Q6 shallow | 124 / 35 | 3.2% / 5.5% |
| Q7 energy, timers | 145 / 22 | 3.8% / 3.5% |
| Q8 cluttered menus | 58 / 14 | 1.5% / 2.2% |
| Q9 dominant strategy | 27 / 7 | 0.7% / 1.1% |
| Q10 confusing start | 63 / 6 | 1.6% / 0.9% |

## Attacks on the corrected evidence (apply to every idea)

1. **The library says what it is: rung 3, floors, keyword matches.** It loses to Cal's playtests and to measurements on
   our game. The biggest positive theme (P5, 516) is only 6.9% of positives; P7 and P12 are 1.8%. These rank themes.
   None says "build this feature".
2. **Adjacent games inflate P5, P6, P10, P11** (14 of 56 are turn RPGs, roguelites, gather-and-craft). The library says
   read them as "this matters", not as a ranking. P5's top game is The Banner Saga (70) and Slay the Spire is second (33).
   Neither is an idle game.
3. **Q-counts are mostly other people's business models.** The top Q2 games are RAID 60, AFK Arena 23, Idle Archer TD 20, Hero Wars 19. Q7 is RAID 40, Hero Wars 23, Shop Titans 9.
   These are gacha and monetised games. Lanternfall has combat that is active only and no monetisation yet.
4. **The long-play set is a special pull**: 632 reviews, up to 25 per game from each game's 100 most helpful negatives of
   the last year. Counts like Q8 14 or Q9 7 are a handful of reviews spread across a few games. It was also analysed
   alone, so it has no matched positive column. "Committed players quit over X" has no denominator of committed players
   who stayed.
5. **Q-themes overlap.** Q2 walls often means paywall walls (Q4) or timer walls (Q7). Do not add them or treat them as
   independent reasons.
6. **Nothing is measured on Lanternfall.** Every brief states its effect against an unknown baseline.
7. **Good news for the ideas, stated so the attack is honest:** the rebuilt data is bigger and deduplicated, so the old
   attack "21 games, 266 long-play reviews, counts of 14" is partly retired. Several old attacks lose force (S1, S6, S12).
   New ones appear (S10, S14, S15 changed in both directions; see below).

---

## S1 Away report is the front door
- **Strongest objection:** Away progress is gathering only (combat is active by decision), so the card the player meets
  first holds piles of ore and wood. Promoting it to the "front door" puts the dullest thing first and adds a tap before
  the fight the player came for. 360px has no spare room.
- **Corrected evidence supports it?** Partly. P1 is now 258 (3.4% of positives, strong in 11 games), not 130. But the
  leaders are AFK Arena 68, Melvor 22, IdleOn 21, OSRS 18, Idle Slayer 16. AFK Arena alone is 26% of the theme and is an AFK
  combat game. The library's own Lanternfall note says "applies to gathering only". Removing AFK Arena leaves 190.
  No theme in the library measures *clarity* of an away card, which is what S1 changes.
- **Conflicts:** Combat is active only (no away combat earnings). Game-first layout. "Early game must not be spammed."
- **Fix:** Measure seconds from open to first action in the playtest persona before changing anything; if under 10, close
  the idea. If over, collapse the report to one header line, not a modal.
- **Earlier verdict (MERGE into f-playtest-bots): more defensible.** The count doubled, so the need is real, but the
  evidence is still about away *combat*; measure-first stays the right size of response.

## S2 Offline parity audit
- **Strongest objection:** "Parity" is the wrong target. The owner decided active gathering finds more, and combat has no
  offline output to compare. Chasing parity pushes offline up until active gathering stops mattering (P4 says players want
  active play to matter).
- **Corrected evidence supports it?** No. The final library has **no theme for weak offline progress at all**: P1 is a
  positive theme, and none of Q1 to Q11 is about offline being too weak. The brief's "4 negatives" is not in the final
  library and cannot be cited. Evidence for the idea is zero counted reviews.
- **Conflicts:** Owner decision "active gathering finds more" (Gathering section: a finder perk of about +5%, and active
  gathering finds more). "Combat is active only".
- **Fix:** Reword as a band check (active beats idle by a stated factor per job), report only when a job falls outside it.
  Drop the word parity.
- **Earlier verdict (MERGE reframed into f-health): more defensible as a reframe, less defensible as a response to
  evidence.** The reframe survives because it is a balance guard on an owner decision, not because of reviews. Do not cite
  the library for it.

## S3 Monetisation guard in the rubric
- **Strongest objection:** Monetisation is "asked, not guessed" and waits for launch; the owner already named a battle
  pass, a capped-convenience membership and skins. A hard three-line rubric prejudges that, and its "no timer" clause hits
  shift fees, cooldowns and the Storehouse cap.
- **Corrected evidence supports it?** Partly, and the split matters. Ads 431 general (11.2%) but **7 of 632 long-play
  (1.1%)**. Paywalls and pay-to-win 251 general (6.5%), **29 long-play (4.6%)**. P2 (181) and P3 (237) praise no forced ads
  and fair money. Ads are an early-churn theme (phones: AdVenture Capitalist 85, Idle Miner Tycoon 49, Tiny Tower 35), and
  the library says phones weigh most for Lanternfall. But Lanternfall has no ads and no ad plan, so the 431 count guards
  against something not on the roadmap, while the DECISIONS line "nothing pay-to-win" already covers Q4.
- **Conflicts:** "Art commissions and monetisation wait until launch". Membership with capped convenience perks.
- **Fix:** One check only, one line: "does this card add a way to spend real money, or an ad, or a gate on core play". Name
  shift fees, cooldowns and the Storehouse cap as excluded. Cal signs the wording.
- **Earlier verdict (MERGE, cut to one line, into f-compass): about the same.** Larger corrected counts back the *principle*
  (P3 237) but the long-play split (ads 7) confirms the red team's point that it protects against nothing currently built.
  Merge-to-one-line stays right.

## S4 Active gold from timing tasks
- **Strongest objection:** Combat already pays gold. A second task that pays gold gives a reason to skip fights, and a
  repeated timing task is a chore loop. It adds a gold source to an economy where "gold stops inflating" is decided.
- **Corrected evidence supports it?** Partly. P4 is 305 (4.1%, strong in 19 games), double the brief's 149, led by Melvor
  27, OSRS 27, Idle Slayer 25, Hero Wars 18, IdleOn 17. But the library's quotes praise *active play inside the core*
  (OSRS skill ceiling, Idle Slayer's jump loop). No quote is about a bolt-on timing task. Hero Wars is an auto-battle gacha,
  so some of its 18 are not about skill at all. Q11 (chores and forced check-ins) is 45 general and 12 long-play
  (RAID 11): the exact complaint a repeated task invites.
- **Conflicts:** Gold economy decision. "No click-spamming" (turn combat). Needs Cal's economy gate.
- **Fix:** Pay a gold amount capped at a share of fight gold (the existing card already holds a 25-35% band) and run the
  sim for gold per hour first. Reject any option that gives a reason to skip a fight.
- **Earlier verdict (MERGE into active-gold-direction): more defensible.** The count doubling makes the theme real; the
  merge keeps it inside an existing owner-gated card instead of a new system.

## S5 One new system at a time
- **Strongest objection:** The numeric cap breaks on day one (1.0 needs fishing, the Kitchen, hero quests, challenge modes,
  Hallowed, 32 heroes). First-use hints are more notices, and the decisions say early game is not spammed.
- **Corrected evidence supports it?** Partly. P5 is 516 (6.9% of positives, strong in 30 games), the largest principle after
  the noisy P10 and P11, but adjacent story games lead it (Banner Saga 70, Slay the Spire 33). Idle leaders are Melvor 24
  and AFK Arena 25. The complaint side is thin: Q8 is 58 (1.5%) and 14 of 632 long-play (2.2%); Q10 is 63 general and **6 of
  632 long-play (0.9%)**. Melvor 13 of the 63 Q10 reviews is locked-content surprise, a gating complaint that argues for
  *saying what opens things*, not for fewer systems.
- **Conflicts:** Hints stay docked; the early game must not be spammed; an in-game guide and glossary is already a 1.0
  commitment (overlap).
- **Fix:** Drop the cap. Fold the one-line hint into the planned guide, and measure notices per unlock first.
- **Earlier verdict (ADMIT-NARROWED as ap-first-use-hints): slightly less defensible.** The positive count rose but its
  top games are not ours, while Q10 fell to 6 long-play and Q8 is 14. The narrowed card is cheap and reversible so it can
  stay, but it should be justified as onboarding polish and an overlap with the planned guide, not as a Q8 fix.

## S6 Collection log with next-nearest completion
- **Strongest objection:** "Closest to done" turns each collection into a queue and "where to find the rest" is a spoiler
  list. That is a suggested-build mechanic for loot. It undercuts the decision that uniques are rare and their effect is
  the draw, and "finding what works should be hard and rewarding".
- **Corrected evidence supports it?** Partly, and more than before. P6 is 480 (6.4% of positives, strong in **31** games),
  AFK Arena 48, Tap Titans 2 36, Idle Slayer 33, RAID 25, Vampire Survivors 22. This is now the third most praised theme
  and spread widely. But the quotes praise *having* collectibles and achievements, not a nearest-completion hint, and the
  leaders are gacha and cosmetic-list games. Q6 shallow (124, 35 long-play) shows collection alone does not rescue a thin
  loop.
- **Conflicts:** No suggested builds or combos (2026-10-02). Uniques "rarer, effect is the draw". 360px one-screen.
- **Fix:** Show only "n of m" per place. Never name a drop source for an unfound item (already the narrowed card's rule,
  with a check).
- **Earlier verdict (ADMIT-NARROWED as ap-collection-counts): more defensible.** Best-supported admit after the rebuild;
  the narrowing already removes the spoiler objection.

## S7 In-game What's new card
- **Strongest objection:** A weekly three-line card is a process step that fails when a deploy skips; returners after a
  month see only the last card, so it does not do the job it claims. It is another notice.
- **Corrected evidence supports it?** Partly, but weaker than it looks. P7 is 136 (1.8% of positives, strong in only **5**
  games: IdleOn 27, Dunidle 10, Orna 10, Shop Titans 9, Melvor 8). The brief's 92 is gone. IdleOn is 20% of the theme.
  The theme is *a developer who keeps adding and fixing*, which the cadence delivers whether or not an in-game card
  exists. No review asks for in-game notes.
- **Conflicts:** Notices must not spam; cadence tied to the Monday deploy "only if something merged".
- **Fix:** Generate from a committed changelog file at build time, show once per version on warm saves via the existing
  bell channel, fail `check.mjs` if the entry is missing or over three lines (as already narrowed).
- **Earlier verdict (ADMIT-NARROWED as ap-whats-new-notes): less defensible on evidence, still defensible on cost.** The
  count rose from 92 to 136 only because the library grew, while the theme stayed at 1.8% and 5 games. It is the weakest
  admit by evidence. It survives only because the path already exists and cost is low. Candidate to demote to MERGE.

## S8 Mastery that unlocks things, not numbers
- **Strongest objection:** It borrows from prestige reviews in a game that banned prestige. The deliverable duplicates
  Proving, Hallowed, Stars and region-boss moments.
- **Corrected evidence supports it?** No. P8 is 166 (2.2%), Idle Slayer 43, Tap Titans 2 28, Cell to Singularity 11, AFK
  Arena 9, Exponential Idle 9, strong in 8 games. The library marks it "not applicable, kept to show what players want".
  Praise is for speed after a reset. Q5 (empty endgame 160, 48 long-play) is the stronger link to "new options" and is
  already S9.
- **Conflicts:** "No prestige or resets" (owner, 2026-09-27). Overlaps decided Proving and Hallowed.
- **Fix:** Cut as a card. Keep one sim check, longest stretch with no new option, in f-health.
- **Earlier verdict (DROP): more defensible.** The count rose to 166 but the library itself says it does not apply.
  Nothing in the rebuild rescues it.

## S9 Content-hours-remaining tracker
- **Strongest objection:** "Hours of content" depends on skill and luck, so the number is a guess presented as a metric,
  and it rewards counting grind as content.
- **Corrected evidence supports it?** Yes, more than before, with a caveat. Q5 is 160 general (4.1%) and **48 of 632
  long-play (7.6%)**, the second biggest committed-player reason after walls (99). Strongest in RAID 10, Idle Slayer 9,
  Hero Wars 8, Potion Craft 8. The brief's "22 of 266" is void. Caveats: Lanternfall has no committed 50h players to
  lose yet; the long-play games are mostly monetised gacha; and the quotes are about repetition ("farming the big void
  deeper and deeper"), which a count of new things measures only partly.
- **Conflicts:** None direct. Risk against the owner's rule that length depends on how fun the loop is.
- **Fix:** Count distinct new things per stage (zones, uniques, abilities, Stars, bosses), defined as changes to the
  player's choices, as the judge reframed it.
- **Earlier verdict (MERGE reframed into xp-gold-pacing-report): more defensible.** The corrected long-play number is
  double the old share and the judge's "new things, not hours" reframe already meets the guess objection. Could even
  support carding if the pacing report finds a thin stage.

## S10 Dominance detector in the sim
- **Strongest objection:** An optimiser over gear lines, 43 Stars and 14 abilities always finds a best-in-slot; the sim does
  not model timing skill; it overlaps f-health.
- **Corrected evidence supports it?** No. Q9 is **27 general (0.7%) and 7 of 632 long-play (1.1%)**, the rarest quit theme in
  the library, strongest in Gnorp Apologue 6 and Rogue Legacy 2 4. Nothing here is a Lanternfall-like game. The brief's
  "14 of 14 only among long-play" is void: the count is 7, and the platform table says Steam 2.1% vs App Store 0.3%, with
  small counts and a helpful-first Steam sample.
- **Conflicts:** No suggested builds (a detector that drives nerfs flattens choice). Active combat is not in the sim.
- **Fix:** Gear lines and Stars only, threshold set from a first run, report only. No card.
- **Earlier verdict (MERGE narrowed into f-health): less defensible as an evidence-led item, still fine as a free line.**
  The catalogue already downgraded it to a report line with no card. I agree; the evidence alone would not justify
  even that, but it costs a few lines in an existing metric.

## S12 Stall hint
- **Strongest objection:** "Why you stopped and the next step" is a suggested-build mechanism, goes stale whenever balance
  changes, and the owner decided Region 2 gets a hint only at "hero hits its limit". Players complain about walls, not
  about missing hints.
- **Corrected evidence supports it?** Partly. Q2 is the top long-play reason at **99 of 632 (15.7%)** and 423 general
  (11.0%), the largest negative count that survives in the long-play set. But Q2 is led by RAID 60, AFK Arena 23, Idle Archer
  TD 20, Hero Wars 19, Idle Slayer 17: gacha power walls where the fix is paying or waiting. Walls include paywall walls
  (overlap with Q4, Q7). Reviews say "wall" and "grind", not "I did not know why I was stuck". A hint does not remove a wall,
  and no theme in the library measures lack of explanation.
- **Conflicts:** No suggested builds or combos. "Finding what works should be hard and rewarding." Region 2 hint rule.
  "No telegraph of the foe's next move" (same spirit).
- **Fix:** Factual line from live numbers only ("lost 3 fights in a row at zone 12"), no prescription, no hand-written
  advice (already the admitted narrowing).
- **Earlier verdict (ADMIT-NARROWED as ap-stall-facts): more defensible on need, same on form.** Q2's 99 long-play is the
  clearest stronger-than-expected number in the rebuild. The caution is that it supports "reduce walls" more than "hint at
  walls", so the card's acceptance must measure time stuck, not hint views.

## S13 Menu budget
- **Strongest objection:** A cap on buttons and currencies is gamed or ignored, the game is growing sideways (32 heroes, 43
  Stars, new menus), and strict caps fail content cards for being content. It overlaps the UI rubric and the 360px rule.
- **Corrected evidence supports it?** Weak. Q8 is 58 general (1.5%) and **14 of 632 long-play (2.2%)**, strongest in Melvor 9,
  Tiny Tower 5, AFK Arena 3, Cassette Beasts 3. Still the thinnest complaint in the library after dominant strategy and
  confusing start. P12 (readable UI, 138, 1.8%) points the same way, thinly. Steam share is 2.3% vs App Store 1.3%.
- **Conflicts:** None direct. Overlaps existing UI rubric, 360px rule, S5.
- **Fix:** Merge into the playtest counts and the UI rubric, with any cap set from measured screens plus a margin.
- **Earlier verdict (MERGE into f-playtest-bots and S5): same.** The numbers did not move enough either way.

## S14 No wait timers or energy
- **Strongest objection:** The game already has timers by decision: gatherer shifts, background production chains, trade
  runs, cooldowns, a planned repeat-craft queue. A blanket anti-goal bans them or says nothing. A membership with
  capped convenience perks is a possible timer-skip, which this rule would pre-ban without asking the owner.
- **Corrected evidence supports it?** Partly, and the corrected numbers are better than the red team's. Q7 is 145 general
  (3.8%) and **22 of 632 long-play (3.5%)**. The leaders are **RAID 40, Hero Wars 23, Shop Titans 9**, not Shop Titans 18
  as the older run said. One game, RAID, is 28% of the general count. These are monetised timer and energy games, and the
  quote from OSRS is about sprint energy, a skill mechanic. Q7 is not Lanternfall's shape: its timers are not paywalled
  and it has no energy.
- **Conflicts:** Production chains, trade runs, gatherer shift fees, Storehouse cap. Monetisation undecided (a
  membership with convenience perks).
- **Fix:** One line: "No timer may block active play or be skippable for money". Name shift fees, cooldowns and
  production chains as excluded, and have Cal sign it.
- **Earlier verdict (MERGE reworded into f-compass): more defensible.** The catalogue's update says S14 has real support
  for a Compass line; I agree on the count, not on a hard ban. Only the reworded form survives, and Cal must approve it.

## S15 Repeat-craft queue
- **Strongest objection:** Crafting here is Reforge, random affixes and sockets, where each craft is a decision; a "do this N
  times" queue removes it and leaves roll-and-ignore. It changes skill XP pacing and Storehouse interaction, and it is
  automation in a game that decided against Auto.
- **Corrected evidence supports it?** No, but the reason changed. P12 now has a count: **138 (1.8%, strong in 5 games: OSRS
  14, Melvor 11, AFK Arena 9, IdleOn 9, Orna 8)**. That is the theme "quality of life and a readable interface", and the
  library's two quotes are about interface clarity and developers fixing bugs. Not one of them is about queues or
  automation. Using it for a craft queue stretches a general QoL count into a specific feature. Brief wording "auto-build,
  reading only" is not in the final library.
- **Conflicts:** "Combat is active only" (spirit against automation). Area 10: skill levelling must feel earned.
  Storehouse cap. Random-affix crafts and Reforge.
- **Fix:** Deterministic crafts only (ingots, planks, food), capped at 10, stop on a full Storehouse; exclude Reforge and
  random-affix gear.
- **Earlier verdict (MERGE into crafting-levelling-spec): same, with the brief's missing-count flaw now a general-QoL
  mismatch.** Merge as one open question to that card stays right. Do not cite P12 as support.

---

## Summary

**Weakest on corrected counts:** S2 (no theme in the final library at all), S8 (P8 166 for a no-prestige game; library marks
it not applicable), S10 (Q9 is 27 general, 7 long-play, the rarest theme), S7 (P7 136, 1.8%, only 5 strong games), S15 (P12
is general QoL, not queues), S13 (Q8 58, 14 long-play).

**Strongest on corrected counts:** S12 (Q2 walls 99 of 632 long-play, 15.7%), S9 (Q5 48 of 632, 7.6%), S6 (P6 480, 31
games), S4 (P4 305, 19 games). S14 gains real support (Q7 22 long-play) but only for a reworded line.

### Does the corrected evidence change the earlier verdict?

| id | Earlier verdict | After the rebuild |
|---|---|---|
| S1 | MERGE | more defensible (P1 258, still AFK-combat led; measure first) |
| S2 | MERGE reframed | reframe defensible, but no review evidence at all; do not cite the library |
| S3 | MERGE one line | about the same (ads 7 long-play, paywalls 29) |
| S4 | MERGE | more defensible (P4 305 across 19 games) |
| S5 | ADMIT-NARROWED | slightly less (Q10 6 long-play, Q8 14; top P5 games not idle) |
| S6 | ADMIT-NARROWED | more (P6 480, 31 games) |
| S7 | ADMIT-NARROWED | less on evidence (P7 136, 5 games); keep only for cost; candidate to demote to MERGE |
| S8 | DROP | more defensible |
| S9 | MERGE reframed | more (Q5 48 long-play, 7.6%); could support a card if the pacing report finds a thin stage |
| S10 | MERGE narrowed (no card) | less on evidence, fine as a free report line |
| S12 | ADMIT-NARROWED | more on need (Q2 99), same caution on form |
| S13 | MERGE | same |
| S14 | MERGE reworded | more (Q7 22 long-play, RAID-led), but only as a reworded rule |
| S15 | MERGE | same |

**No verdict flips.** One watch item: S7 has the weakest evidence of the four admitted cards and is the first to demote if
backlog room is tight. One correction to carry: the brief and old red team quoted numbers (S2's 4, S10's 14 of 14, S15's
"reading only" P12, S12's 31, S9's 22 of 266, S13's 4 of 266) that no longer exist in the library. Cards should cite the
final counts only.
