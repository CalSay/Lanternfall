# Red team on the 15 idea briefs (S1 to S15)

Written 2026-10-05. Job: argue against each idea. Not balanced on purpose.

## Attacks on the evidence (apply to every idea)

1. **Counts are floors from keyword matches, and the corpus is helpful-first.** Helpful-first feeds over-represent loud, extreme reviews, and the review tool mixes in "most recent" App Store pages only up to 5 pages. A count of 130 or 215 out of 3,533 positives is 3.7% and 6.1% of positives. These rank themes at best. They do not say "players want X".
2. **A count says players mention a thing, not that adding it makes our game better.** Praise for "offline progress" in IdleOn and Melvor is praise for games whose core loop IS idle. Lanternfall decided combat is active only. P1, P4, P8 and P12 are borrowed from genres Lanternfall has chosen not to be.
3. **Most counted games are not our game.** Shop Titans (shop sim, heavy monetisation) drives Q1, Q4, Q7. Tap Titans 2 and Idle Slayer are tap and rebirth games. Q3 (ads), Q4 (paywalls) and Q7 (timers) are monetisation complaints about games that have monetisation. Lanternfall has none and has no active monetisation area. These rows are evidence about other people's business models.
4. **Steam long-play set is 266 reviews across 21 games.** Per-theme counts there are 14 to 31, spread over maybe 8 games each. Q9 "14 of 14" sounds strong; it is 14 reviews, mostly Idle Champions 5 and Increlution 3, two games whose dominant-strategy complaints are about party composition, which Lanternfall removed. "Only among long-play players" is partly an artefact: the extra long-play pull was negatives only, so the other columns have no equivalent sampling.
5. **Negative reviews skew to a small slice.** Steam negatives total 422, the long-play set is 266 of those, so most of the "committed player" evidence is a special pull, not a natural sample. Phone vs PC shares compare 1,300 vs 422 reviews from different games; a platform difference is confounded with a game difference (Shop Titans is 46,959 App Store ratings of mostly Q1 text).
6. **Q5 (22 of 266) and Q2 (31) are single digits of percent** (8% and 12%). Q-themes overlap (Q2 "includes paywall walls", also in Q4). Do not add them.
7. **Nothing here is measured on Lanternfall.** The library's own text says it loses to Cal's playtests and to measurements. Several briefs state their effect as "unknown to a target", which means no baseline exists. Ideas are unfalsifiable until a baseline is taken.
8. **P12 has no count and S15 rests on it.** One quote from one game.

---

## S1 Away report is the front door
- **Strongest objection:** Combat is active only and away earnings are gathering only, so the away card for a typical Lanternfall player holds a few piles of ore and wood. Making that card "the front door" promotes the least exciting thing the game has over the thing the player opens it for (a fight). A one-screen 360px layout has no spare room, and a card on open that must be dismissed adds a tap before every session.
- **Evidence supports it?** Partly. P1's 130 is from games where away progress includes everything, including combat. Cited quotes are about AFK combat and skilling, which we banned for combat. The brief itself admits clarity is "unmeasured".
- **Conflicts:** Combat is active only (no away combat earnings) makes the card thin. Game-first layout (the game is the main view). Hints stay docked, no spam of notices early.
- **Fix:** First measure seconds to first action with the existing report in the persona bot. Ship only if it is over 10 seconds, and make the card collapse to one line that sits in the existing header rather than a modal.

## S2 Offline parity audit
- **Strongest objection:** The "weak offline progress" evidence (61 complaints) is from Tap Titans and Berserker, whose offline was combat. Lanternfall offline has no combat, so parity with active play is the wrong target by design: active should beat offline, and "parity" findings will pressure someone to raise offline until active gathering and active play stop mattering (P4 contradicts this). The brief predicts the audit "finds nothing", which is a sign it is a report for its own sake.
- **Evidence supports it?** No. Count is 4 for this theme (the brief's own "low confidence"), and the 61 comes from the discarded Haiku pass the library itself says not to use.
- **Conflicts:** Combat is active only (offline combat cannot be compared). Gathering stays idle (fine) but "active gathering finds more" is an owner decision so parity is explicitly not wanted.
- **Fix:** Reframe as a ratio band check: confirm active gathering beats idle by a stated factor in every job, and report only if a job falls outside it. Drop "parity".

## S3 Monetisation guard in mechanic.md
- **Strongest objection:** Monetisation is undecided and officially "wait until launch". Writing three hard rules into a reviewer rubric now prejudges the owner decision (the owner has already named a battle pass, a capped-convenience membership and skins) and "no core mechanic behind a timer" collides with already-decided gatherer shift fees, Storehouse caps and cooldowns. Reviewers will get false flags on every cooldown.
- **Evidence supports it?** Partly. Ads 129 and paywalls 113 are real and big, but they complain about other games' business models and the game already has "nothing pay-to-win" as a decision. The rubric adds nothing the DECISIONS line does not.
- **Conflicts:** "Art commissions and monetisation wait until launch" (owner asks, does not guess). "Membership with capped convenience perks" is a gate-like perk the rule could flag.
- **Fix:** Cut to one check: "does this card add a way to spend real money or a gate to core play". Define "gate" so cooldowns and shift fees are excluded, and get Cal to approve the text.

## S4 Active gold from timing tasks
- **Strongest objection:** Combat already pays gold, and a second skill task that pays gold gives players a reason to skip fights, which are the game. A short timing task repeated for gold is the definition of a chore loop, the exact "side content that is a chore" the coverage map warns about, and adds a new currency source to an economy where "gold stops inflating" was an explicit decision. It needs an economy retune and a new screen at 360px.
- **Evidence supports it?** Partly. P4's 149 praises active play in general, led by OSRS and Melvor (which have deep skilling) and Idle Slayer. Idle Slayer's jump task is the core loop, not a side task. No evidence that timing mini-games added to an existing combat game help.
- **Conflicts:** Gold economy decision (gold per foe steps by region; hero power from gear not gold). Combat is active only is not violated, but "no click-spamming" is at risk. One new thing at a time (S5's own rule). Needs Cal's gate for economy targets.
- **Fix:** Make it pay a non-gold sink-neutral reward (cosmetic or a gatherer perk) or cap it at a share of fight gold, and run the sim for gold per hour before building.

## S5 One new system at a time
- **Strongest objection:** A cap of "1 new system per hour" is a rule the roadmap will break immediately: 1.0 requires fishing, Kitchen, hero quests, challenge modes, Hallowed, subclasses, and 32 heroes. Gating them to meet a cap delays content experienced players want and makes the early game slower, which the owner has asked the opposite of (pace targets, no catch-up XP aside). Per-system first-use hints add notices, and the decisions say early game must not be spammed.
- **Evidence supports it?** Partly. P5 (163) is praise for depth, Q8 (27 of 1,722 negatives, 1.6%) is the whole bloat complaint, and Q10's 16 of 34 are Melvor locked-content surprise, which is a gating complaint, the opposite of this idea.
- **Conflicts:** Hints stay docked, early game not spammed, the game pauses while a tutorial step is open. "In-game guide and glossary" already planned for 1.0 (overlap). No suggested builds (hints must stay neutral).
- **Fix:** Drop the numeric cap; keep only the one-line hint, folded into the planned guide, and measure notices per unlock first (area 16).

## S6 Collection log with next-nearest completion
- **Strongest objection:** "Closest to done" turns every collection into a priority queue, which is a suggested-build mechanic for loot and pushes players to farm the nearest item instead of exploring. Telling players "where to find the rest" is a spoiler list that deflates drop hunts, undercuts "finding what works should be hard and rewarding", and creates a checklist chore.
- **Evidence supports it?** Partly. P6 is 215, the biggest positive theme, but leader games (Tap Titans 2, Idle Slayer, Shop Titans) have large, simple cosmetics and achievement lists. The quotes praise having collectibles, not a nearest-completion hint.
- **Conflicts:** No suggested builds or combos (spirit, 2026-10-02). Unique boss drops are "rarer, effect is the draw". Menu and one-screen limits on 360px.
- **Fix:** Show progress counts and region only (n of m per place, for example "3 of 7 in Emberwaste") and never name a specific drop source for unfound items.

## S7 In-game "What's new" card
- **Strongest objection:** Weekly deploys of three lines max means a card that changes weekly, needs a human or agent to write it every week and is stale or wrong the first time a deploy skips ("only if something merged"). Players who return after a month see only the latest card, so it does not do the job it claims. It is also another notice on screen.
- **Evidence supports it?** Partly. P7's 92 is a strict match and is about developer behaviour (updating, fixing), which patch notes outside the game also show. The strongest quote source is IdleOn (27 of 92), one game with a famously prolific dev. It is not evidence the in-game card matters.
- **Conflicts:** Notices must not spam; deploy cadence is one a week (card cadence is tied to a process step that can fail).
- **Fix:** Generate it from a committed changelog file at build time and make `check.mjs` fail if the card is older than the last deploy.

## S8 Mastery that unlocks things, not numbers
- **Strongest objection:** It rests on a prestige reviews count in a game that banned prestige, and it duplicates cards already planned (Proving, Hallowed, Stars, region boss moments). It is a principle, not a feature: "unlock something visible at every tier" has no concrete deliverable and invites scope creep across 32 heroes.
- **Evidence supports it?** No. P8 (101, mostly Idle Slayer 42 and Tap Titans 2 28) praises rebirth specifically, and the library admits 0 negatives matched, so the "resets are safe" read is untestable. The effect that the quote describes is about progress speed after prestige, not about unlocks.
- **Conflicts:** No prestige or resets (the theme borrowed from). Overlaps decided Proving and Hallowed.
- **Fix:** Cut as a card. Keep a single check: "no stretch longer than N hours without a new option", run by the sim over existing planned content.

## S9 Content-hours-remaining tracker
- **Strongest objection:** "Hours of content" is not measurable for an idle RPG with random drops and optional collections; any number depends on the player's skill and luck, so the floor will be a guess presented as a metric. It will push the team to count padding (grind hours) as content.
- **Evidence supports it?** Partly. Q5 is 22 of 266 and 8 of the 22 are one game family; all are Steam long-play, a group Lanternfall (pre 1.0) does not have yet. The brief itself calls the number a guess.
- **Conflicts:** None directly. Risk against "length depends on how fun the loop is", which makes a grind-hour target backward.
- **Fix:** Count distinct new things (zones, uniques, abilities, stars) per stage instead of hours, and define "new" as changes the player's decisions.

## S10 Dominance detector in the sim
- **Strongest objection:** An optimiser over a game with 14 abilities, talents, 43 stars and gear lines will always find a best-in-slot; "X% of runs" thresholds will flag everything or nothing and the sim is not the real game. It also lands on top of the existing hero parity bands and f-health work and costs sim time that active combat (timing windows, parry) cannot model.
- **Evidence supports it?** Partly. 14 of 14 sounds clean but is 14 reviews from two or three games with party mechanics, concentrated in Idle Champions and Increlution. The sim does not model timing skill, so dominance by "optimiser" is not what players found.
- **Conflicts:** No suggested builds (a detector that flags dominance leads to nerfing choices into sameness; fine if report-only). Active combat is not simulated (timing).
- **Fix:** Run it only on gear lines and Stars (non-timing choices), with a threshold set from a first run, and keep it report-only as the brief says.

## S11 Save safety net
- **Strongest objection:** It touches the save path, the one thing declared sacred, to protect against a bug class (lost saves) the project has no evidence it has. A rolling backup in localStorage doubles the stored data and can hit the storage quota, and failing to write the backup could throw in the save path. "Zero reported lost saves" is a target nobody can verify.
- **Evidence supports it?** Partly. Q1 is 252, the biggest count, but it is Shop Titans 46, IdleOn 37, Tap Titans 2 31, which are cloud-sync and server games. Only a slice is about saves, the rest crashes. A single-page localStorage game has different failure modes (cleared site data) that a local backup in the same storage does not survive.
- **Conflicts:** Save compatibility is sacred (touches it). Export/import is already a 1.0 commitment (overlap). Backup in the same localStorage does not help when the whole origin is cleared.
- **Fix:** Do only the export reminder and a tested export/import round-trip in the CI save corpus. Skip the rolling backup unless it lives in a different store with try/catch and a size cap.

## S12 Stall hint
- **Strongest objection:** A hint that says "why you stopped progressing and the next step" is a suggested-build mechanism and will be wrong whenever the sim changes (the brief admits this). It also undercuts the decision that finding what works is hard and rewarding, and that Region 2 gets a hint only at "hero hits its limit". The hint text is hand-written copy to maintain against an economy in flux.
- **Evidence supports it?** Partly. Q2 is 31 of 266, but "walls" there includes paywall walls and Melvor locked content. Complaints are about the walls, not about missing hints.
- **Conflicts:** No suggested builds or combos in the game. No telegraph of the foe's next move (same spirit: do not spell out what to do). Also area-specific hint rule exists for Region 2.
- **Fix:** Limit the hint to a factual state ("You lost 3 fights in a row at zone 12") with no prescription, generated from live numbers, not hand-written.

## S13 Menu budget
- **Strongest objection:** A cap on buttons, currencies and notices will be gamed or ignored, and the game is explicitly growing (32 heroes, a camp that "grows sideways", 43 stars, new menus planned). A strict cap makes content cards fail review for being content. The check also needs a counting tool that someone must maintain.
- **Evidence supports it?** Weak. Q8 is 27 reviews out of 1,722 negatives (1.6%) and only 4 of the 266 long-play, led by Melvor 7 and Leaf Blower 4. This is the thinnest complaint in the library and Lanternfall already has 360px and a UI rubric.
- **Conflicts:** None as such; overlaps the existing UI rubric, 360px rule, and S5.
- **Fix:** Merge into S5 and the existing UI rubric as one counted metric, with the cap set from today's measured screens plus a margin, not a theory number.

## S14 No wait timers or energy
- **Strongest objection:** The game already has timers by decision: gatherer shifts, production chains running in the background, trade runs, cooldowns, and it plans repeat-craft queues. A blanket "no wait timers" anti-goal either contradicts those or has to be defined so narrowly it bans nothing. The brief itself says it "blocks future crafting queues".
- **Evidence supports it?** No. Q7 is 36, with 18 from Shop Titans alone (a game built on craft timers), and 2 of 266 long-play. The library says Lanternfall is not planning monetisation, so the energy-gate complaint is about a business model it does not have.
- **Conflicts:** Production chains run in the background; trade runs; gatherer shift fees; the Storehouse cap. Monetisation undecided (a membership with convenience perks could be timer-skip, which this rule would pre-ban without asking the owner).
- **Fix:** Reword to "no timer may block active play or be skippable for money" and move it to the monetisation decision for Cal to sign, not the Compass.

## S15 Repeat-craft queue
- **Strongest objection:** Evidence is reading-only from one Shop Titans quote, and Shop Titans is a shop sim where crafting is the whole loop. Here, crafting is Reforge, random affixes and sockets where each craft is a decision; a "do this 10 times" queue removes the decision, and with random affix lines it creates a roll-and-ignore loop. It also changes skill XP pacing and a Storehouse cap interaction, and it is automation in a game that decided against Auto.
- **Evidence supports it?** No. P12 has no count, the library says "do not cite a number for it", and the brief cites it anyway. The brief's own effect ("taps drop from 10 to 2") is not a player-value measure.
- **Conflicts:** Combat is active only is the spirit against automation (crafting is not combat, so no rule broken, but the same reasoning). Skill levelling "must feel earned" (area 10). Storehouse cap interaction.
- **Fix:** Limit to deterministic crafts (ingots, planks, food) with a cap of 10 and stop on a full Storehouse; exclude random-affix gear and Reforge.

---

## Summary ranking

Weakest: **S2** (count of 4, from a discarded pass, wrong target), **S8** (prestige evidence for a no-prestige game, duplicates planned cards), **S14** (contradicts existing timers, evidence is Shop Titans). Next: S15 (no count), S13 (1.6% of negatives).
Least bad: S11 (largest count, real risk) if cut down, S12 if made factual, S1 if measured first.
