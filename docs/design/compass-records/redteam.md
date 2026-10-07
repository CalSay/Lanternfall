# Red team: docs/design/compass.md (version 1, 2026-10-07)

Checked against `docs/DECISIONS.md` (D), `docs/design/fun-library.md` (FL), `docs/design/first-hour.md` (FH) and
`/mnt/project-files/autopilot/coverage-map.md` (CM). Line numbers for the compass are `compass.md:N`. compass.md was not
edited.

What holds up: P2, P3, P4, P5, P6, P9, P12 numbers and games are right (Idle Slayer 25 in P4, 14 in P2; Melvor 17 in P3, 24
in P5; Melvor top in Q8 with 9 and Q10 with 13, FL:170,172). Q1, Q2, Q7, Q9, Q11 are the right themes. CM area numbers in
the pillar table all exist and fit their rows. The four confirmed core pieces are all present as pillars 1 to 4.

## High

**1. "34 heroes" is wrong (twice).** `compass.md:47` and `compass.md:58` say 34. D:42 says "32 heroes for 1.0"; no file in
docs/ says 34. Fix: say 32 (or "the 32-hero roster"); better, drop the number so the page cannot drift.

**2. The header cites a ruling section and records that do not exist.** `compass.md:3-5` points to D "Compass: judge rulings
(2026-10-07)". `grep -i compass docs/DECISIONS.md` finds nothing, and `docs/design/compass-records/` did not exist (this
file creates it). Every "see rulings" pointer is dead until the judge writes them. Same for "Cal, 2026-10-05: he does not
want ownership" and "Cal, confirmed 2026-10-06" (`compass.md:3`, `:38`): neither is in D (the nearest is the Money
delegation, D:256, 2026-10-06, and the Owner role line, D:23). Fix: land the DECISIONS section in the same change, and
cite the dated line that records Cal's four-piece confirmation, or say "per Cal's playtest chat" and link it.

**3. The hook's Melvor and Idle Slayer claims go beyond the fun library.**
- "Melvor ... its fights play themselves" (`compass.md:18`): FL has no such claim. Melvor is not named in Q6 "Shallow,
  plays itself" (FL:168: AdVenture Capitalist, RAID, AFK Arena, Vampire Survivors). Training lore, presented as evidence.
- "(P5, P15)" for Melvor: P15 has no Melvor hits (FL:149 names Hero Wars, Slay the Spire, Idle Hero TD), and FL:149-150
  calls P15 low confidence and "mostly combat or unit synergy, not skills feeding skills". Melvor's "systems feed each
  other" comes only from CM:21 ("Melvor's best trait"), which is a planner remark, not review counts. Fix: cite P5 and P3
  for Melvor only; mark the rest "design lore, not in the library".
- "its active part is a runner" (`compass.md:21`): FL:106 says "jump or tap to kill", which is only a hint. "Runner" is
  lore. Mark it as such.
- "Q5: 'years of active time'" (`compass.md:21`): the quote sits in the FL:183-186 quote block, not under a Q5 row;
  Idle Slayer is Q5 9 of 173 (FL:167). Cite it as "an Idle Slayer 454 h Steam review, near Q5", not as the Q5 finding.
- "What neither offers: a story-shaped road (P10, P9)" (`compass.md:23`): P10 is flagged high noise, adjacent story
  games dominate (FL:117-118), and Idle Slayer is not among its strong games; P9 is low count (FL:111). The claim that
  neither game offers it is unsupported. Fix: soften to "we bet on", and cite them as medium and low confidence.
- "timing skill, not a number, decides each boss" has no library support at all; the only parry-adjacent evidence is
  Expedition 33 as a reference (FL:42) with no principle number. Say so.

**4. "learn in one hour" contradicts the first-hour map.** `compass.md:19-20` promises interlocking skills "small enough
to learn in one hour". FH:35-68 opens roughly 20 new things in the hour (Hero, Gather, Camp, Next Up, Bounties, Crafting,
Stars, Uniques, Bestiary, Almanac, Tavern, Looks, Codex ...), and D:25-26 lists fishing, the Kitchen, hunting, sockets,
challenge modes for 1.0. Q8/Q10 are the library's Melvor complaints, but the compass has no evidence Lanternfall is
smaller. Fix: promise "one new thing at a time" (which FH does enforce, FH:13) instead of "small".

**5. Pillar 3 contradicts the hero decisions.** `compass.md:57-58` says "many heroes, no per-hero authored content".
D:42-43: each hero "ships complete: art, kit, Hallowed looks, subclasses, an unlock route, a hero quest and a part in the
story", and D:41 "Heroes keep their stories". The only no-per-hero rule is barks for the 31 non-starters (D:10-15). Fix:
"each hero is a complete kit; hero voice is starters only". Also the roster count is the 1.0 plan, not today's state.

**6. Pillar 4 leans on P8, which does not apply.** `compass.md:68` maps pillar 4 to "P8 unlocks over bigger numbers".
P8 is prestige or rebirth (FL:103); FL:107 says "not applicable", and D:19 bans prestige and resets. A reader will
read this as a path back to prestige. Fix: drop P8 from the table, or say "P8 (lesson only; no prestige)".

**7. Scoring guide cannot reject a card with no fit.** `compass.md:95,100-104`: pass at 15 of 25. Cost 5 plus
Reversibility 5 gives 10, so Impact 2, Evidence 2, Fit 1 (defined as "No loop step or pillar") scores 15 and goes
ahead. `compass.md:110` says such a card is "sent back", so the two sections disagree. Also the middle anchors (2 and 4)
are not defined, so two judges will split; and 1, 3, 5 anchors on Evidence mix rungs (FL:32-33 ranks Cal's playtest and
our measurements above counted reviews, but the table puts "a fun-library principle" and "a measurement on our game"
on the same 3). Fix: add a floor (Fit at least 3, and Impact at least 2), define 2 and 4 as "between", and split the
Evidence 3 into "library principle (3)" and "our own measurement (4)".

**8. The "Read the foe's turn" step conflicts with a settled decision.** `compass.md:44` fight step 1. D:140 "No telegraph
of the foe's next move: it makes combat easier"; D:425 and D:473 repeat it ("no foe intent icons"). The player learns
moves over kills (D:425-426), but in a fight there is nothing to read. Fix: "1. Watch the foe's turn (you learn its
moves over kills)", and add "no telegraph" to the pillar 1 text. Also `compass.md:12` "well-timed parry or dodge" is
fine, but FH:8 says "parry" only; align the two hooks.

## Medium

**9. Pillar 1 forbids "No Auto" but the Lantern Rules and D allow Assist.** `compass.md:55`; D:146 and D:315 (Rule 6) keep
an Assist setting that widens windows x1.5 (`combat-turn-build.md:387-389`). Say "no Auto; Assist widens windows, never
plays for you", so a card cannot be blocked by pillar 1 for an accessibility option.

**10. P13 is mapped to the wrong pillar.** `compass.md:65` puts "P13 calm (fair, not frantic)" under hand-played fights.
FL:136-140 defines P13 as chill, relax-and-decompress play, with "the gathering-is-calm pillar" as the Lanternfall
meaning, and area 2. A timing-based parry fight is not low-pressure by the library's quotes. Move P13 to pillar 2 (camp)
and add "fair" backing for fights from Q2/Q6 and CM area 6 ("a lost fight is clearly the player's fault").

**11. "At most 8 named currencies" and "3 taps" have no source.** `compass.md:33,87`. Neither number is in D, FH or CM.
CM:15 only says to count currencies, and CM:22 says "find anything in two taps", not three. D already names gold,
Essence, ore, wood, hide, Scrolls, Trophies, relics, Stars and caches (D:111,190,205,229), so the cap may already be
broken; no one has counted. Fix: count once (a short script on the live build) and state it, or phrase as "no more
currencies than today without a judge"; use "two taps" (CM) or add a decision for three.

**12. Pillar 2 and section 2 over-promise on camp and "never punished for leaving".** `compass.md:36,59`. D:208-213: the
Storehouse caps what you hold, unpaid Hands stop working, and the Keeper text assumes an away cap (D:271). So returning
can find capped piles and idle Hands. The page also says gathering is "idle" while D:27 says "Gathering stays idle" and
D:208 "active gathering included". Fix: "leaving pays up to the Storehouse and away cap; Hands need their shift fee".
Add the away cap and Storehouse to the camp row of the table so the loop shows its own limit.

**13. Anti-goal "Chores" and "Walls" collide with existing rules.** `compass.md:83-85`. "a task the player must do daily or
on a timer" would flag Hands shift fees (D:213) and the Tavern Contracts and "weekly update" return step (`compass.md:47`
"Come back to the weekly update"). The week-scale step 4 is itself an obligation to come back, against section 2 "never
forced to come back". Fix: reword to "a reward that expires if you miss it", and drop "come back to the weekly update"
from the player loop (it is P7 developer cadence, not a player step).

**14. Missing anti-goals from D that a card could break.** None of these appears in `compass.md:79-91`: prestige or resets
(D:19), telegraphing the foe (D:140), suggested builds or combos (D:141), healing between fights (D:143), party or
formation systems (D:48-49 "Removed"), idle or offline combat (D:27). Pillar 1 has the third in prose only. Fix: one
line "Settled no: ..." listing them, so reviewers can quote it (compass section 8 requires quoting a line).

**15. The "Dark patterns" line paraphrases and omits half the Lantern Rules.** `compass.md:88-89`. It names selling power
or chance, friction, interrupting offers, taking back. Rules 5 to 10 add: no core-convenience sale (Rule 6, so Repeat and
Assist are free), no earned-prestige loss (7), real prices (8), same game on every build (9), purchases never lost and no
account needed (10) (D:309-320). "Anything the Lantern Rules forbid" is right; the list after the colon should not look
complete. Fix: end the list with "see all ten" and add "random purchases" (Rule 2), which the page never says.

**16. Two scale defects in the scoring guide.** (a) Cost 1 includes "save change" and Reversibility 1 includes "Save
shape" (`compass.md:103-104`): a save change is penalised twice, while "Silent loss" is already an anti-goal. (b) The
tie-breaker "the early game first" (`compass.md:106`) double-counts Impact 5 ("changes the first hour"), pushing every
week-two idea below an equal first-hour idea. Fix: keep save change only in Reversibility; make Impact 5 neutral on
which timescale it changes.

## Low

**17. Section 5 skips CM area 3.** "Goals at three ranges" is area 3 (CM:14) and its heading copies it
(`compass.md:72`), but the pillar table cites 2, 21 and never 3. Add area 3 to pillar 2 or 4, and note FL:146 maps P14
to area 3.

**18. "P2 no forced ads" understates the decision.** `compass.md:68`. D:261: "no ads of any kind (rewarded ads
included)". P2 itself praises ads as optional boosts (FL:62-66, the Idle Slayer quote is *for* rewarded ads). The
compass cites P2 as support for a stricter rule. Fix: "P2 (we go further: no ads)".

**19. Loop text: first-hour overstates "lights the road".** `compass.md:12-14,60` ("every boss you beat lights more of
the road"). FH:45 says "the stage shift is faint"; colour relights are only zones 1 to 3 and 7 to 9 (D:436-438). Zones
4 to 6 and 10 plus give a cache without a relight. Fix: "opens a cache and, early on, relights the stage", or fund the
relight as a card.

**20. "No dead zone over 8 minutes in the first hour" (`compass.md:75`).** FH:59 puts the first unique at "25 to 40" by
chance, and FH:60-65 show gaps of 7:30 between planned moments; F3 only requires no gap over 8 up to zone 10 on the
casual walk (D:454-457), and FH:32 says a cold human reached zone 5 at minute 25. State it as "on the casual walk,
measured by the nightly walk", or the line fails for the cold player the page cares about.

**21. Fight length "about 30 to 90 s" is unsourced.** `compass.md:44`. FH:40-44 shows fights at 30 to 40 s apart; bosses
"last until one side falls" (D:127) with no cap. Fix: cite the walk's measured seconds per fight, or say "about 30 s
for a zone foe, longer for a boss".
