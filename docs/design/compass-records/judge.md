# Judge: docs/design/compass.md (revised draft, 2026-10-07)

Opus judge. Read: `compass.md` (revised draft), `compass-records/redteam.md` (21 attacks; HIGH 1 to 8 already fixed in
the draft), `docs/DECISIONS.md` (D), `docs/design/fun-library.md` (FL), `docs/design/first-hour.md` (FH). Also checked the
why-review ceiling (`/mnt/project-files/autopilot/reports/why-review-2026-10-06/redteam.md`, "The ceiling";
`economy.md` "A concrete ceiling") for red-team attack 11. The rulings below are applied in `compass.md` (now version 2).
DECISIONS is not edited here; the coordinator writes "Compass: judge rulings (2026-10-07)".

Check that the draft fixed the HIGH attacks: 1 (32 heroes) yes; 2 (dead DECISIONS pointer) open until the coordinator
lands the section, as planned; 3 (library claims) mostly, the Q5 citation and the P9/P10 confidence still needed fixing,
done here; 4 ("learn in one hour") yes; 5 (pillar 3) half, see ruling 2c; 6 (P8) yes; 7 (scoring floor) half, see ruling
3; 8 (no telegraph) yes, wording tightened in ruling 2a.

## Ruling 1. What is the hook?

**Question.** The draft hook is FH's two sentences plus a third about the camp. Is that the hook, and is it true?

**Options.**
- A. Keep the draft: FH's two sentences plus the camp sentence.
- B. FH's two sentences only, word for word.
- C. One sentence: the lamp and the parry.
- D. FH's first sentence kept; the second rewritten so every claim is true at every first boss clear; the camp line kept
  as the promise behind the hook, outside it.

**Ruling: D.** The hook is:

> You carry the last lamp down a dark road, and every fight is yours to win with a well-timed parry. Beat a boss for the
> first time and a Lantern Cache opens: what you won, a chance at a new look, and the next stretch of road.

**Why.**
- FH's second sentence promises two things the game does not deliver at every boss. "Lights the next stretch of road":
  the stage relights only at zones 1 to 3 and 7 to 9 (D, Early game, Looks), and FH:45 says the shift is faint. "Gives
  your hero something new to wear or wield": a cache's only new reward is a look roll (D, Lantern Caches), certain only at
  the six colour zones; enemies drop gold, Essence, relics, Scrolls and by chance uniques, and gear is crafted, not
  dropped (D, Rewards). A hook is the first thing the compass asks every card to serve, so it cannot carry a broken
  promise (anti-goal "Broken promises"). The new wording keeps the cache, the look chase and the road, and each part is
  true: the cache shows the win's drops, rolls a look with printed odds and pity, and a Captain's win opens the next zone.
  This accepts red-team 19 in full.
- The first sentence stays: it names the two things only Lanternfall has together (the lamp-and-road fantasy and the
  hand-timed parry), and it is FH's wording. "Parry" alone is right for a hook (red-team 8 asked FH and the compass to
  agree); dodge and Assist are in the loop.
- The camp is a core piece (pillar 2), but it is what brings a player back, not why they start. A hook with three claims
  is a feature list. It stays on the page as "the promise behind the hook", with the Storehouse and away cap named so it
  does not over-promise (red-team 12).
- **Follow-up for the coordinator:** `first-hour.md` lines 8 to 10 must take the new second sentence in the same merge
  that writes DECISIONS. I was told not to touch other docs, so the two read differently until then. The compass now says
  FH "carries the same hook and changes with this page", so FH stops being described as the owner of the wording.
- The "why pick this" bullets were checked against FL. The Q5 line now cites Idle Slayer's Q5 count (9) and the 454-hour
  review as a review, not as the Q5 finding (red-team 3); P10 is marked medium confidence and P9 low; the parry bet says no
  principle backs it.

## Ruling 2. The core loop at four timescales; does any step contradict DECISIONS?

**Question.** Are the four loops right, and does any step break a settled decision?

**Options.**
- A. Keep the draft table.
- B. Keep the shape (four timescales, four steps each), fix the steps that contradict D or over-promise.
- C. Collapse to three timescales (fight, visit, week).

**Ruling: B.** Four timescales stay; each step is something the player does. Changes:

- **a. One fight, step 1.** "Watch the foe's wind-up" reads, to a careless card author, as permission to show what move is
  coming, which D bans three times ("No telegraph of the foe's next move", Combat; "No telegraph stands", Early game;
  hit-feel's "no telegraph"). Now: "Watch the foe strike: its wind-up and the timing bar set your press. Nothing tells you
  its next move; you learn its moves by fighting it." The cue is for when, never for what.
- **b. One fight, step 4.** Added the loss branch: "or lose, keep your place, and know why". D: losing never moves you;
  section 2 promises you know what you did wrong. A loop that only shows wins hides the fight's most important beat.
  Step 3 now says what a parry does in D's own terms (blocks, a turn off every cooldown). Fight length is "about 30 s for a
  zone foe, longer for a boss; no timer" (FH:40-44; D, Bosses: no timer) (red-team 21).
- **c. Pillar 3 (it frames the day and week loops).** The draft said a design "must not need extra per-hero authored
  content". D says every hero ships complete with art, kit, Hallowed looks, subclasses, an unlock route, a hero quest and
  a story part, and Hallowed is per-hero by design. A ban would reject decided work. Now: such a design costs 32 times
  over, must say so, and scores Cost by it. Hero voice stays with the starters (D, hero barks).
- **d. A day, step 2.** "Beat a boss that was a wall" used the word the anti-goals define as a failure. Now "a boss that
  beat you: gear up, change the build, or learn its moves", and the Walls anti-goal says a boss that needs better gear or
  play is not a wall. "One or two zones" became "a few zones"; the first hour alone covers ten.
- **e. A week, step 4.** "The weekly build adds something to try" is developer cadence (P7), not a player act; it also
  asks the player to come back on our schedule, against "the game never forces you back" (red-team 13). Replaced by "Go
  deeper: the Deepwell, and later challenge modes" (both in D for 1.0). A line under the table says updates add content
  but no step depends on one. Week step 2 now names Ascending at a Proving (D, Ascension), and step 1 names Champions,
  Elders and Provings, the region-scale moments D asks for.
- **f. The 5-minute visit.** Names the Storehouse, the away cap and Hands' shift fees (D, Gathering) so the loop shows its
  own limit (red-team 12). Step 3 adds "spend a point" (attribute points, D, Hero).
- **g. The closing paragraph.** It said fights give "essence, gold and drops" and both feed the Forge. D: gold is the
  camp's budget, Essence is fight-only and feeds crafting, and Scrolls come from bosses. Rewritten to match. The loop
  test now reads "a new **resource** that feeds neither a fight nor a build breaks the loop"; the draft's scoring table said
  "a resource **or system**", which would score every look, story beat and collection card Fit 1 and reject it, though
  the week loop exists to pay those out. Looks, story and collections are named as the loop's payouts.

Nothing else in the four rows contradicts D. Checked: zones advance only on a win (5 fights then the boss), cooldowns reset
per fight, no healing between fights (no step implies it), a new hero joins at the road's level, caches only on a first
clear, Essence fight-only, Tavern Contracts and Bounties as optional.

## Ruling 3. The test every card must pass: does it discriminate; are the thresholds sane?

**Question.** Draft rule: go ahead when Compass fit is at least 3, the total of five 1-to-5 axes is at least 16, and no
anti-goal is hit.

**Finding.** It does not discriminate the right way. Two of five axes (Cost, Reversibility) measure ease, and a save
change was penalised on both. So:
- The work that matters most fails. A first-hour system with good evidence and a save change (Impact 5, Evidence 3,
  Fit 5, Cost 1, Rev 1) totals 15: rejected. Most 1.0 commitments (fishing, the Kitchen, hero quests) touch save shape.
- Cheap trivia passes. A copy tweak few players notice, on lore (2, 1, 3, 5, 5), totals 16: accepted.
- Evidence still put "a fun-library principle" and "a measurement on our game" on the same rung, though FL:32 ranks our
  measurements above counted reviews (red-team 7, half fixed).

**Options.**
- A. Keep the sum, raise the bar to 17 or 18. Rejects more cheap trivia but also more big work; does not fix the bias.
- B. Weight the axes (Impact x2). Harder to apply by hand; judges will drift.
- C. Two sums: Value (Impact + Evidence + Fit) must clear its own floor, and Total (Value + Cost + Reversibility) a lower
  one. Ease can stop a middling idea but never a strong one.
- D. Drop Cost and Reversibility from the gate and use them only to order the queue.

**Ruling: C.** Go ahead when Fit is at least 3, Value at least 9, Total at least 14, and no anti-goal is hit. Bugs and
broken promises skip scoring. A card that builds a DECISIONS commitment is scored for shape and queue place, not for
whether.

**Why.**
- Value 9 means "average on all three" (3, 3, 3): a card has to matter, have a source and serve a loop step. Cheap
  trivia (Value 6) waits however cheap it is.
- Total 14 lets cost decide only in the middle: Value 9 needs Ease 5 (for example Cost 3, Rev 2); with Fit at least 3,
  Value 12 or more always passes, because Ease is at least 2. That is the behaviour we want: a strong idea with a save
  change goes ahead (and the save review gate still applies), a middling idea with a save change waits.
- D was rejected because a risky, middling card would then pass on Value alone; ease must still bite somewhere.
- Worked checks are printed under the table so the next judge can see the thresholds act.
- **Anchors.** All five columns are now shown; 2 and 4 are "between" except for Evidence, which gets its own rungs from
  FL's ladder: 1 lore; 2 a low-confidence principle (P9, P14, P15) or one reference game; 3 a medium- or high-confidence
  principle; 4 a measurement on our game (sim, walk, health, perf); 5 Cal's playtest or a replayed measurement that
  failed.
- **Save change scored once**, under Reversibility; Cost 1 is now "many or hot files, or needs a Codex art pack"
  (red-team 16a).
- **Impact 5** now says "for most players", so a first-hour change that touches one menu cannot claim 5 by naming the
  first hour.
- **Fit stays a hard floor at 3.** It is the only axis that asks "does this serve the game we decided on". The draft's
  red-team floor of Impact at least 2 is not added: the Value floor already does that job.

## Ruling 4. The remaining red-team attacks (MED and LOW)

| # | Attack | Ruling | Why, and what changed |
|---|---|---|---|
| 9 | Pillar 1 must allow Assist | **Accept** (draft had it; tightened) | D keeps Assist (Combat; Lantern Rule 6). Pillar 1 and fight step 3 say "Assist only widens the timing windows; it never plays for you", so an accessibility card is never blocked by pillar 1. |
| 10 | P13 mapped to fights | **Accept** (draft had it) | P13 sits under pillar 2. Pillar 1's row adds "it answers Q6, plays itself", the library's backing for hand-played fights. |
| 11 | "8 currencies" and "3 taps" have no source | **Accept in part** | They do have a source: the why-review ceiling (2026-10-06, Cal reviewed its cards): 8 named currencies, a 3-tap camp tour. The red team missed it; the draft cited it garbled ("caps new skilling at 8"; the skills cap is 10). The real problem is that the game is already over both (about 27 currencies, a 6 to 10 tap tour), so "a ninth currency" read as if we were under. The anti-goal now says any new named currency and any tap added to the camp tour, names the ceilings and today's counts, and cites the source. The coverage map's "two taps" is a different measure (finding a menu) and stays with the UI rubric. No new count script: the why-review counted. |
| 12 | Camp and "never punished" over-promise | **Accept** | D: Storehouse cap, unpaid Hands stop, away cap. The hook's camp line, section 2, pillar 2 and the visit row all name the limit. "Leaving costs you nothing you earned" stays: it is true (Hands never leave or lose levels). |
| 13 | Chores collide with shift fees and the weekly step | **Accept** | Chores now means a reward that expires or a lead that shrinks when you miss a day or a timer, or a daily must-do. A shift fee the player chooses to pay is named as not a chore. The weekly-build step is gone (ruling 2e). |
| 14 | Missing settled no's | **Accept** | The Settled no's line now lists prestige or resets; Auto, idle or away combat; a telegraph of the next move; suggested builds or combos; healing between fights; a party, formation or companions; ads of any kind; selling heroes, caches or keys; pay-to-win; art outside a vetted Codex pack. The draft's "new animation" was not a D rule; the art freeze is, so it is named instead. |
| 15 | "Dark patterns" list looks complete | **Accept** | Now "anything any of the ten Lantern Rules forbids", then "the usual misses", adding random sales (Rule 2) and core-convenience sales (Rule 6). The page still does not copy the rules (section 8). |
| 16a | Save change counted twice | **Accept** | Ruling 3. |
| 16b | "Early game first" double-counts Impact 5 | **Reject** | A tie-breaker acts only at equal scores, so it cannot double-count in the gate. Putting the early game first is policy: no store code switches on until the early-game milestone is done (D, Money, When). The line now gives that reason. Impact 5 was made neutral on timescale by naming the visit and the week. |
| 17 | Section 5 skips coverage area 3 | **Accept** (draft had it) | Area 3 is in pillar 2's row, with P14. |
| 18 | "P2 no forced ads" understates D | **Accept** | Now "P2 (we go further: no ads of any kind)". D: no ads, rewarded ads included. |
| 19 | "Lights the road" over-promises | **Accept** | Ruling 1: the hook no longer promises a relight; the page says no text may promise one at every boss. The faint shift stays with card `cache-lantern-read`. |
| 20 | "No dead zone over 8 minutes in the first hour" fails for cold players | **Accept** | Now F3's own wording: on the casual walk, no gap over 8 minutes between big moments up to the zone 10 Champion, measured by the nightly walk. A cold human's slower minutes are a playtest finding, not a failed compass line. |
| 21 | Fight length unsourced | **Accept** | "About 30 s for a zone foe, longer for a boss; no timer" (FH:40-44; D, Bosses). |

## For DECISIONS (coordinator)

Suggested section "Compass: judge rulings (2026-10-07)", one line each: the hook (ruling 1, with the FH follow-up); the
loop changes (no telegraph cue, the loss branch, the weekly-build step replaced by the Deepwell, "resource" not
"system"); the scoring rule (Fit 3, Value 9, Total 14; save change scored once; Evidence rungs; DECISIONS commitments
scored for shape); pillar 3's per-hero cost rule; the currency and camp-tour ceilings as anti-goals with their source;
16b rejected.
