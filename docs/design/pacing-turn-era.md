# Pacing in the turn era: where the climb stalls, and what to change

Status: report, 6 October 2026 (card `xp-gold-pacing-report`). No game code changed. Measured with the real core
through `tools/sim.mjs` (turn fights on). Coverage-map areas 7 (progression curve) and 8 (economy). It re-checks
`progression-stalls.md` (1 October, before the turn engine), the 50-hour health run (PR #41), the optimiser playtest
(`autopilot/reports/playtest-2026-10-05-optimiser.md`) and the systems map (PR #45).

## The short answer

- **Every hero stalls between zone 20 and zone 30 (Fungal Deep and Quarry Ruins).** A good player on 3 hours a day
  reaches zone 20 in about 6 hours, then needs 23 to 37 more hours to reach zone 30 (Wren and Pip). Tobin does not
  reach zone 30 in 51 hours. A casual player (45 minutes a day) reaches zone 20 on day 5 and zone 25 on day 15 to 27,
  then gains one or two zones a month. No hero passes zone 28 in 60 days.
- **The first wall is hero XP.** Foe HP grows x1.42 a zone from zone 15 to 27. Training cannot pass the hero's level,
  so the hero needs about two levels a zone. A level costs x1.3 more XP each time: Lv 30 takes 1 to 3 active hours,
  Lv 34 and 35 take 7 to 11. At the wall, Training sits at the hero's level and gold piles up unspent (Wren holds up to
  52,000).
- **The second wall is gold, and it is right behind the first.** Ease XP alone and Wren and Pip reach level 39 to 50,
  but Training stops at 34 to 36 in every run: one level of all four moves costs 50,000 gold at Lv 35 and 171,000 at Lv 40,
  against 5,000 to 9,000 gold an active hour that falls as the zones rise.
- **Training milestones turn the climb into walls and cliffs.** Attack doubles every fifth level past 25 and barely
  moves in between. Wren waits about 11 hours at zones 27 to 29, then clears zones 29 to 35, the Region 1 boss included,
  in about 2 hours. Grey Shingle (zones 36 to 41) then takes about an hour.
- **Best fix (judge ruling, section 8):** ease the XP curve from Lv 26 to 40 and Training prices from Lv 20 to 40,
  together. Measured on two seeds, the good Wren and Pip reach zone 30 in 15 to 31 hours (now 29 to 43), and their
  longest stall before zone 35 falls from up to 19 hours to 5 to 10 hours. The casual Wren and Pip reach zone 30 on day
  30 and 34 (now never in 60 days). Spreading the Attack milestones, first proposed with them, is dropped: it was a
  hidden power buff. Tobin needs his own look (section 6).

## 1. How it was measured

Hours are active hours: time the player is in the game. Fights earn nothing while away; gathering does.

| Player | Plays | Turn skill | Command shape |
|---|---|---|---|
| Good | 3 hours a day (three 60-minute sessions, 08, 13, 19h) for 17 days: 51 hours | lands 80% of parries and dodges (the sim's own player) | `--days 17 --checkins 8,13,19 --session 60 --first 60` |
| Marathon | 50 hours in one go, nothing away (the health tool's `--long` run) | 80% | `--policy mixed --hours 50 --every 3600` |
| Casual | 45 minutes a day (three 15-minute visits) for 60 days: 45 hours | the turn report's casual: parries 25% of swings, dodges half the rest, takes the others; ability rings 10% Perfect, 40% Good, 50% missed | `--days 60 --checkins 8,13,19 --session 15 --first 15` |

Every run: `--class ranger|warden|lanternmage --active 1 --turns 1 --seed 41` (Wren, Tobin, Pip), and the good player
again on `--seed 42`. All runs use the sim's mixed policy: fight 10 minutes, gather 5, craft the next class piece, build
the camp, train the best value per gold, challenge the zone boss when it is ready. The casual's skill is the
`casual` player of `node tools/sim.mjs --report turns` (parry 0.25, dodge 0.5, Perfect 0.1, Good 0.4), played the way
`turnCombatSample` plays it, through a scratch copy of `tools/sim.mjs` (`LF_PROFILE=casual`, a patch to `turnPlayer`,
not committed; section 9). A 15-minute probe (`--evalfile`) logged zone, level, gold, Training, gear and wipes.
87 runs in all (the first 9 casual runs used a cruder skill model and are replaced). Tobin's late pass (PR #49)
merged after all but the 9 card 1 runs of section 5, so his other rows predate it.

The sim's own turn player never presses an ability's timing ring, so every timed ability lands as a Miss (70%) for
the good and marathon players. They keep it, because the build card re-measures with the unchanged tool. One check with
the turn report's `good` player instead (rings 40% Perfect, 45% Good; seed 41) moved nothing that matters: zone 30 at
35.7 hours for Wren and 37.7 for Pip (sim player: 30.2 and 42.5), Tobin still stops at zone 27.

## 2. Today's numbers

Hours to reach each zone, with the hero's level then. Good player: seed 41 / seed 42.

| Player | Hero | Zone 10 | Zone 20 | Zone 30 | Zone 35 | Zone 45 | After the run |
|---|---|---|---|---|---|---|---|
| Good | Wren | 0.4 h (Lv 16) / 0.5 h (Lv 16) | 5.8 h (Lv 27) / 6.2 h (Lv 28) | 30.2 h (Lv 35) / 29.3 h (Lv 35) | 30.5 h (Lv 35) / 30.9 h (Lv 35) | not reached | zone 44, Lv 37 / zone 43, Lv 37 |
| Good | Tobin | 0.4 h (Lv 14) / 0.4 h (Lv 14) | 10.4 h (Lv 26) / 6.7 h (Lv 27) | not reached | not reached | not reached | zone 27, Lv 31 / zone 27, Lv 31 |
| Good | Pip | 0.3 h (Lv 15) / 0.4 h (Lv 16) | 6.0 h (Lv 28) / 5.7 h (Lv 28) | 42.5 h (Lv 35) / 42.7 h (Lv 36) | not reached | not reached | zone 30, Lv 36 / zone 30, Lv 37 |
| Marathon | Wren | 0.4 h (Lv 16) | 7.2 h (Lv 27) | not reached | not reached | not reached | zone 29, Lv 36 |
| Marathon | Tobin | 0.4 h (Lv 14) | 7.2 h (Lv 26) | not reached | not reached | not reached | zone 27, Lv 34 |
| Marathon | Pip | 0.3 h (Lv 15) | 9.2 h (Lv 29) | not reached | not reached | not reached | zone 27, Lv 36 |
| Casual | Wren | 0.4 h (Lv 15, day 1) | 3.0 h (Lv 26, day 5) | not reached | not reached | not reached | zone 28, Lv 35 |
| Casual | Tobin | 0.5 h (Lv 14, day 1) | 3.6 h (Lv 26, day 5) | not reached | not reached | not reached | zone 25, Lv 29 |
| Casual | Pip | 0.5 h (Lv 17, day 1) | 3.7 h (Lv 27, day 5) | not reached | not reached | not reached | zone 27, Lv 34 |

Casual calendar: zone 25 on day 15 (Wren), 27 (Pip) and 52 (Tobin). After that: Wren zone 26 on day 16, zone 27 on
day 42, zone 28 on day 55; Pip zone 26 on day 31, zone 27 on day 37; Tobin sits on zone 24 from day 16 to day 52.
Longest stall: Wren 19 active hours at zone 26, Pip 18 hours at zone 27 (still there at the end), Tobin 27 hours at
zone 24.

The casual reaches zone 20 sooner than the good player in active hours: away gathering crafts their gear. The marathon
player gathers only while playing, so their gear falls a tier behind (mining 32 to 37 after 50 hours; tier 4 nodes need
64). That is why the marathon row is the slowest.

Longest stretch without a new zone before zone 35 (good player, seed 41 / 42): Wren 6.5 h (zone 28) / 12.0 h (zone 27);
Pip 19.1 h (zone 24) / 8.3 h (zone 30); Tobin 16.7 h (zone 24) / 11.8 h (zone 27). Marathon: Wren 12.9 h at zone 24,
which is the "12-hour wall at zones 24-25" of the 50-hour health run.

### The numbers behind the wall (read from the core)

| | Zone 20 | Zone 24 | Zone 27 | Zone 30 | Zone 34 | Zone 36 | Zone 42 |
|---|---|---|---|---|---|---|---|
| Foe HP, x per zone (`turnRefAtk`) | 1.42 | 1.43 | 1.42 | 1.16 | 1.12 | 1.12 | 1.11, then 1.22 |
| Gold a normal foe | 70 | 67 | 63 | 59 | 51 | 61 | 80 |
| XP a normal foe | 75 | 90 | 103 | 113 | 128 | 135 | 158 |

| Hero level | 30 | 33 | 35 | 38 | 40 |
|---|---|---|---|---|---|
| XP for the next level (`xpNeed`, x1.3 a level) | 30,230 | 66,416 | 112,244 | 246,601 | 416,756 |
| Gold for one level of all four Training moves | 14,485 | 30,376 | 49,767 | 104,368 | 170,992 |

Measured gold an active hour (good player): Wren 13,900 at zones 20-24, 7,400 at zones 25-29; Pip 8,700, then 7,000,
then 5,400 at zones 30-35; Tobin about 2,000. At Lv 35 one Training level is 5 to 9 hours of gold, and one hero level
is 7 to 11 hours of XP.

Hero power per level is about x1.2 on average (Training Attack plus +4% a level), but it comes as a staircase: Attack
x2 at every fifth level past 25 (`PACE.atkX2`), about x1.07 for the four levels between.

## 3. The claims of `progression-stalls.md`, checked

- **Hero XP wall near zone 24: still true.** `xpNeed` is unchanged (15 x 1.3^(L-1)); turn fights pay x2.5 XP a foe, but
  foe XP still grows with the zone in a straight line. Lv 33 takes 4 to 8 active hours, Lv 34 and 35 take 7 to 11;
  12.9 hours at zone 24 in the 50-hour run.
- **Gold falling while prices rise: still true, smaller in size.** Turn fights pay x3 gold a foe, so an hour pays 5,000
  to 14,000, not 3,700. But gold a foe still falls from 70 at zone 20 to 51 at zone 34 (the early x2 fades out from
  zone 20 to 35), while Training prices rise x1.28 a level. Today it is not the first wall (Training is level-capped and
  gold piles up at zones 24 to 28); it is the next one the moment XP is eased (section 5).
- **Nothing past about zone 45: still true.** Gear stops at tier 5 (`TIER_POW`, `validTier`), Training at 80 (40 before
  the Proving), and foe HP grows x1.22 a zone for ever from zone 42 (`refAtk` is flat there). Estimated with
  `turnPowerZone`: a hero with everything maxed (Lv 80, Training 80, tier 5 Epic +10) keeps up to about zone 76 (the old
  page said 71); a base-class hero, Training 40, to about zone 48. New: Hide grades 4 and 5 are never offered
  (`21-data-craft.js`, the Hunting row), and every Ranger piece and three Warden pieces need Hide.
- **"Warrior and Mage runs stall at zones 19 and 16": changed.** All three heroes reach zone 27 or later in 50 hours.

On the systems map's flags: gold is the second choke, not the first (above). Renown, Stamps and boss tokens gate nothing
on the climb; no stall in these runs waits on them.

## 4. The top three stalls, and one fix each

Fixes 1 and 2 are card 1. Fix 3 is card 2's, re-derived, after the red team and judge (section 8).

### Stall 1: hero levels stop in Fungal Deep and Quarry Ruins (zones 20 to 29)

- **Measured:** good player, zone 20 to zone 30 takes 23 to 37 hours (Wren, Pip); Tobin never gets there. Casual: from zone 25,
  Wren needs 40 days for three more zones and Pip 10 days for two; Tobin needs 36 days for one. At the wall Training equals the hero's level and gold piles up (Wren: 22,000 to 52,000
  unspent from hour 19 to hour 27 of the marathon).
- **Cause:** foe HP x1.42 a zone needs about two hero levels a zone; each level costs x1.3 more XP than the last.
- **Fix:** from Lv 26 to 40, each level costs x1.15 more XP instead of x1.3; past 40 it is x1.3 again, from the lower
  Lv 40 price. Lv 35 then needs 33,000 XP, not 112,000; Lv 40 needs 66,000, not 417,000; Lv 45 needs 246,000, not
  1.55 million. (First proposed for every level past 25; the judge limited it to the base-class levels, section 8.)
- **Code:** `xpNeed` in `src/js/40-rules.js` (one line; the 1.15 and the bend at 40 go in `PACE`). Anything that prints
  the XP bar reads `xpNeed`.
- **Save impact:** no save field changes, and `S.L` and `S.xp` keep their meaning, but banked XP gives a one-time lump.
  A save holds up to one old level's worth of XP; against the cheaper levels, `gainXp` (`src/js/50-sim.js`) spends that
  bank on the hero's next XP gain. With a full bank, a hero at Lv 26 to 31 gains 1 level at once, Lv 32 to 35 up to 2,
  Lv 36 to 39 up to 3, Lv 40 and up up to 4 (computed from both curves). Choice: accept the lump, with no migration.
  The only saves are Cal's and the testers' (DECISIONS, 2026-09-28), the judge ruled the same ("XP a hero already holds
  may turn into a level on the next gain"), and normalising `S.xp` would need a new save flag. The build card adds a
  check: an old save at Lv 35 and at Lv 40 with a full bank loads, takes one kill, and gains no more levels than this
  table says.
- **Must ship with fix 2.** Alone it moves the wall to gold: in all three XP-only runs Wren and Pip reached Lv 39 to 50
  with Training stuck at 34 to 36 and gold near zero, and Pip and Tobin still stalled at zones 24 to 27 in two of them.

### Stall 2: Training gold, once levels flow again

- **Measured:** XP-only runs (x1.15, x1.10, double XP): Training stops at 34 to 36 at Lv 39 to 50. Gold-only run (x1.5
  gold): Training +1 to 2 levels; Pip reaches zone 30 eleven hours sooner, Wren about the same, Tobin nothing, because
  the level cap still binds.
- **Cause:** prices rise x1.28 a level from Lv 20 to 40 (`ECON.train.r2`) while gold a foe falls. The optimiser playtest
  felt it as one Max pass costing 29,000 against about 75 gold a kill.
- **Fix:** Training prices rise x1.18 a level from Lv 20 to 40 instead of x1.28. One level of all four moves then costs
  14,700 at Lv 35 (now 49,800) and 33,600 at Lv 40 (now 171,000): about 2 to 5 hours of gold.
- **Code:** `ECON.train.r2` in `src/js/21w-data-econ.js` (one number). Side effect: Lv 41+ prices compound from the Lv 40
  price (`trainCost`, `r3` 1.15), so Ascended Training gets 5.09x cheaper at every level. No run reached the Proving, so
  that part is unmeasured. The ruling: accept it, keep `r3`, measure it with an Ascending run, and let the Training
  overhaul (DECISIONS, 2026-10-02) set the Ascended prices.
- **Save impact:** none (prices only).

### Stall 3: Attack milestones make walls, then cliffs

- **Measured:** Wren (good) waits at zones 27 to 29 for about 11 hours, then Attack 35 lands and zones 29 to 35, the
  Region 1 boss included, fall in 2.3 hours (seed 41). After the Fenmother, Grey Shingle (zones 36 to 41) takes 0.9 and
  1.0 hours (seeds 41, 42). The region boss should be a big moment (DECISIONS); here it is a speed bump at the end of a
  long wait.
- **Cause:** past Lv 25, Attack is x2 at each fifth level and about x1.07 between, while foe HP grows evenly.
- **Fix (card 2, not card 1):** spread each milestone over its five levels with steps re-derived so that average Attack
  over each five levels stays as today. The first proposal here (x2^(1/5), about x1.15, every level past 25, and
  x1.7^(1/5) before) kept power equal only at the fifth levels and raised it up to x1.74 between them (x1.53 before 25).
  Foe HP does not read the Attack curve, so that was a power buff against every tuned combat band; the judge dropped it
  (section 8). Measure the re-derived spread with card 2, after card 1 lands.
- **Code:** `PACE.atkEvery`, `atkX`, `atkX2` in `src/js/40-rules.js`, `SOLO_TUNE.train.abX`, `abX2` in
  `src/js/24b-data-solo.js`, and the Training card's "Lv 35: hits x2 harder" line in `src/js/55-training.js`. The
  ability milestones (cooldown, Stun and so on, `SOLO_TUNE.train.every`) stay every fifth level.
- **Save impact:** none.
- **The first proposal alone** moved Wren's zone 30 from 30.2 to 46.2 hours and Pip's from 42.5 to 29.3 (one seed): far
  more than the noise line, in both directions.

## 5. The fixes measured together

Good player, two seeds (41 / 42). Same seeds and policy as section 2.

| Change | Hero | Zone 30 | Zone 35 | Longest stall before 35 | Stalls of 3 h+ before 35 | After 51 h |
|---|---|---|---|---|---|---|
| Today | Wren | 30.2 / 29.3 h | 30.5 / 30.9 h | 6.5 / 12.0 h | 3 / 1 | zone 44 / 43 |
| Today | Pip | 42.5 / 42.7 h | not reached | 19.1 / 8.3 h | 4 / 8 | zone 30 / 30 |
| Today | Tobin | not reached | not reached | 16.7 / 11.8 h | 4 / 5 | zone 27 / 27 |
| **Card 1: fixes 1 + 2** | Wren | 23.2 / 14.7 h | 37.7 / 26.0 h | 10.1 / 9.2 h | 3 / 1 | zone 42 / 45 |
| **Card 1: fixes 1 + 2** | Pip | 30.7 / 21.2 h | 46.5 / 30.4 h | 7.8 / 5.1 h | 7 / 3 | zone 38 / 43 |
| **Card 1: fixes 1 + 2** | Tobin | not reached | not reached | 15.8 / 18.8 h | 5 / 4 | zone 27 / 27 |
| Fixes 1 + 2 + 3 (first proposal) | Wren | 19.5 / 19.0 h | 21.5 / 30.2 h | 3.2 / 5.1 h | 1 / 2 | zone 47 / 44 |
| Fixes 1 + 2 + 3 (first proposal) | Pip | 23.4 / 20.3 h | 41.2 / 30.9 h | 9.5 / 4.9 h | 3 / 2 | zone 41 / 44 |
| Fixes 1 + 2 + 3 (first proposal) | Tobin | 47.5 h / not reached | not reached | 11.5 / 15.5 h | 7 / 4 | zone 31 / 27 |
| 1 + 2 + 3 + even foe HP | Wren | 16.5 / 17.8 h | 24.2 / 31.2 h | 3.6 / 6.2 h | 1 / 3 | zone 45 / 47 |
| 1 + 2 + 3 + even foe HP | Pip | 16.5 / 12.5 h | 33.7 / 26.1 h | 8.3 / 5.3 h | 3 / 2 | zone 39 / 45 |
| 1 + 2 + 3 + even foe HP | Tobin | 37.0 / 37.0 h | not reached | 11.3 / 13.6 h | 5 / 5 | zone 33 / 31 |

The card 1 rows ran with the XP change limited to Lv 26 to 40 (the ruling), on the integration branch after Tobin's late
pass (PR #49). XP eased past every level from 25 gave the same hours to zone 35 on both seeds (no hero passed Lv 42 by
then), and Tobin's early zones did not change with PR #49.

Casual player (45 minutes a day, seed 41), zone 30 and zone 35 by active hours and calendar day:

| Change | Wren | Pip | Tobin |
|---|---|---|---|
| Today | zone 30 not reached; zone 28 on day 55 | zone 30 not reached; zone 27 on day 37 | zone 30 not reached; stuck on zone 24 from day 16 to 52 |
| **Card 1: fixes 1 + 2** | zone 30 at 22.4 h (day 30); zone 35 at 30.6 h (day 41) | zone 30 at 25.4 h (day 34); zone 31 by day 60 | zone 27 by day 60 |
| Fixes 1 + 2 + 3 (first proposal) | zone 30 at 19.4 h (day 26); zone 35 at 30.8 h (day 42); zone 42 by day 60 | zone 30 at 29.4 h (day 40); zone 33 by day 60 | zone 27 by day 60 |
| 1 + 2 + 3 + even foe HP | zone 30 at 10.4 h (day 14); zone 35 at 24.2 h (day 33); zone 45 at 42.1 h (day 57) | zone 30 at 13.3 h (day 18); zone 35 at 38.7 h (day 52) | zone 30 at 31.4 h (day 42) |

Marathon player (50 hours in one go, seed 41), zone reached and when:

| Change | Wren | Pip | Tobin |
|---|---|---|---|
| Today | zone 29 (zone 25 at 27.2 h) | zone 27 | zone 27 |
| Fixes 1 + 2 + 3 (first proposal) | zone 35 at 47.2 h (zone 30 at 39.9 h) | zone 28 | zone 27 |
| 1 + 2 + 3 + even foe HP | zone 45 at 49.9 h (zone 30 at 18.5 h) | zone 31 (zone 30 at 27.4 h) | zone 34 (zone 30 at 34.0 h) |

The marathon player's gear lags a tier (no away gathering), so fixes 1 to 3 help Wren only; even foe HP is what moves
Pip and Tobin there. Card 1 alone was not run as a marathon; the build card's `health.mjs --long --compare` does that.

Single changes, good player, seed 41 (zone 30 hours for Wren / Pip / Tobin, then zone after 51 h):

| Change | Zone 30 | After 51 h | Levels / Training Attack at the end |
|---|---|---|---|
| Today | 30.2 / 42.5 / - | 44 / 30 / 27 | 37 / 36 / 31; Attack 36 / 35 / 31 |
| XP x1.15 a level past 25 | 26.0 / - / - | 42 / 27 / 27 | 44 / 41 / 33; Attack 35 / 34 / 31 |
| XP x1.10 a level past 25 | 21.6 / - / - | 45 / 28 / 27 | 50 / 45 / 34; Attack 35 / 35 / 30 |
| Double XP a foe | 34.9 / 37.5 / - | 35 / 31 / 27 | 40 / 39 / 34; Attack 35 / 36 / 31 |
| Gold x1.5 a foe | 26.3 / 31.5 / - | 43 / 31 / 27 | 37 / 37 / 32; Attack 37 / 37 / 32 |
| Even foe HP, zones 15 to 34 | 22.8 / 39.3 / - | 35 / 31 / 29 | 37 / 37 / 32; Attack 36 / 36 / 32 |
| Milestones spread | 46.2 / 29.3 / - | 34 / 32 / 27 | 37 / 36 / 31; Attack 36 / 36 / 31 |

Runs are chaotic (one changed draw reshuffles a run), so read differences under about 5 hours as noise. The single
changes ran on one seed; the combined ones on two.

What the combined runs leave:

- **Wraithmarsh bosses (zones 30 to 34) become the next wall:** a stall of 5 to 10 hours there in all four card 1 runs
  of Wren and Pip, and a stall of 3 hours or more in 10 of 12 runs with fix 3 or even foe HP added (11 to 14 hours for
  Tobin). The boss pass sets their HP at x3.6 there (`TURN_TUNE.boss.hpX`, x2.6 at zone 25). Measure again after card 1
  lands before touching it.
- **Training reaches its base-class cap of 40** in the combined runs. The sim never takes the Proving (`--evo` was not
  set), so zones past 35 are slower here than for a player who Ascends.
- **"Even foe HP"** (`TURN_TUNE.refAtk` in `src/js/59k-turn.js` re-pointed so foe HP grows x1.31 a zone from 15 to
  34, the same HP at 15 and at 34) helps the players the other fixes leave behind: Tobin (zone 30 at 37 hours on both
  seeds, today never), the casual (zone 30 on day 14 and 18, not 26 and 40) and the marathon player (above). It adds
  little for a good Wren or Pip, makes zones 20 to 27 quick (Pip reaches zone 25 in 8 to 10 hours, today 20 to 31) and
  piles the wait onto the Wraithmarsh bosses (Pip, marathon: 19 hours at zone 31). So it is the second card, measured
  after the first lands, and it goes with a look at the Wraithmarsh boss HP. Save impact: none.

## 6. Other findings

- **Tobin falls far behind in the climb, not in a fight.** He kills about 30 foes an active hour on the good plan,
  against 96 for Wren and 85 for Pip, and earns about a third of their gold. On equal footing (`--report heroes`, a
  kept-up hero at each zone) he takes 1.2 to 1.5x the turns and wins every boss, as designed. The gap comes from the
  climb loop: he survives losing boss fights for a long time (17 wipes an hour against Wren's 67), so each failed try
  costs minutes, and his gear waits on Hide (53% of his blocked crafting time in the marathon run). Next step: a
  playtest of Tobin at zones 22 to 27, then a card, before any tuning.
- **Starlit gear is out of reach at Gullcliffs (zone 42 and on).** Foe HP goes back to x1.22 a zone at 42 and the
  reference hero there wears tier 5, but tier 5 needs gathering level 112, and Hide grades 4 and 5 do not exist. Good
  Wren: 6.5 hours at zone 42, then 10 hours at 43. This belongs with `crafting-levelling-spec` and a Hunting card (two
  new beasts need art from Codex).
- **The mixed policy spends gold on crafting, the camp and Hands' shifts before Training** (Training gets at most 35% of
  gold earned), and every hero trains the same split. Read the Training numbers as a floor for a player who puts Training
  first.

## 7. Targets for the build card

Card 1, per the judge ruling (section 8): fixes 1 and 2 together, since fix 1 alone moves the wall to gold. XP x1.15 a
level from Lv 26 to 40 and x1.3 again past 40 (`xpNeed`, with the 1.15 and the bend in `PACE`); `ECON.train.r2` 1.18.
Attack milestones unchanged. Card 2, after card 1 is measured: even foe HP from zone 15 to 34 with the Wraithmarsh boss
HP, and a milestone spread that keeps today's average power if one is still needed (section 5).

- **Predicted (good player, `--days 17 --checkins 8,13,19 --session 60 --first 60`):** zone 30 in 15 to 31 active hours
  for Wren and Pip (now 29 to 43); zone 35 for both in under 47 hours (Pip today: never); the longest stretch without a
  new zone before zone 35 under 11 hours for Wren and Pip (now up to 19). Tobin unchanged (zone 27).
- **Predicted (casual):** zone 30 within 45 days of 45 minutes for Wren and Pip (measured: day 30 and 34; today: not in
  60 days).
- **Measure:** the good player on seeds 41, 42, 43 and 44, all three heroes, before and after; the casual on seeds 41 and
  42, all three heroes, with the casual profile first committed to `tools/sim.mjs` as a flag (section 9 has the patch);
  `node tools/health.mjs --long --compare`, accepting the new baseline with `--write-baseline` and saying so in the PR
  (`zoneEnd`, `lastNewZoneHour` and `stallsOver1h` will leave their bands; that is the point); and an Ascending run,
  Wren `--evo venomstalker` and Pip `--evo warlock`, seed 41, before and after, for Lv 40 to 50 and zones 36 to 45.
- **Missed if:** Wren's or Pip's median hours to zone 30 over the four seeds is above 28; Wren or Pip has a stall over
  12 hours before zone 35 on any seed; zone 10 moves by more than 15 minutes; Tobin ends below zone 27 on any seed; the
  casual Wren or Pip does not reach zone 30 in 60 days; in the Ascending run, Lv 41 takes more than twice as long as
  Lv 40, or Grey Shingle (zones 36 to 41) takes under an hour.
- **Switch off:** put the old numbers back (x1.3 XP at every level, `r2` 1.28). No save field changes, so undoing it is
  free. Levels gained under the new curve stay (no level loss).
- **Old saves:** banked XP turns into 1 to 4 levels on the next XP gain (section 4, fix 1). Accepted; the build card's
  check loads a full-bank save at Lv 35 and Lv 40.
- **Gate:** economy targets and the pacing curve are `judge` calls under the playbook (the card said gate-cal, written
  before Autopilot's rules). This report ran the red team and the judge (section 8); the build card carries the ruling
  and its Opus balance sign-off. Not in the "Cal only" column.

## 8. Red team and judge

The fix choice is a `judge` call (economy targets and the pacing curve). A red-team worker (Sonnet medium) argued
against sections 4 to 7 as first written; an Opus high judge worker checked its code claims, recomputed the curves and
ruled. Section 7 follows the ruling.

**Red team, in short** (serious first):

- Fix 3 is a power buff, not a reshape: Attack is x1.15 to x1.74 higher on four of every five levels past 25 (and up
  to x1.53 before 25) against `atkSteps` (`40-rules.js`), and foe HP does not read the Attack curve, so it lifts every
  tuned combat band. Alone it moved Wren's zone 30 by 16 hours on one seed.
- Fix 2 reprices Ascended Training unmeasured: `trainCost` compounds `r3` from the Lv 40 price (`55-training.js`), so
  every price from Lv 40 on falls 5.09x. DECISIONS keeps Training as it is until its overhaul.
- Fix 1 as written also makes Ascended levels far cheaper (Lv 45: 133,000 XP, today 1.55 million), so both brakes on
  Ascended Training drop at once, in a part of the game the bot never plays.
- The wall moves to the Wraithmarsh bosses rather than going away, and Tobin barely moves.
- The evidence is thin: casual on one seed, the casual skill in a scratch patch, fix 1 run as a `gainXp` patch (the
  real `xpNeed` is a `const`, so `--eval` cannot replace it), no Ascending run.
- Minor: the Lv 35 "hits x2 harder" moment is lost; single levers ran on one seed.

**Judge ruling (Opus high): option B.** Ship fixes 1 and 2 with fix 1 limited to the base-class levels; drop fix 3.

- XP: x1.3 a level to Lv 25, x1.15 from Lv 26 to 40, x1.3 again past 40, growing from the lower Lv 40 price, so the
  curve has no jump. `Math.floor(15 * Math.pow(1.3, Math.min(S.L, 25) - 1 + Math.max(0, S.L - 40)) *
  Math.pow(1.15, Math.max(0, Math.min(S.L, 40) - 25)))`, with the 1.15 and the bend at 40 in `PACE`. Lv 35: 32,938 XP;
  Lv 40: 66,252; Lv 45: 245,989 (today 1.55 million).
- Training: `ECON.train.r2` 1.28 to 1.18; `bend2` 40 and `r3` 1.15 stay, so Ascended prices keep today's growth from a
  lower start (about 5x lower). Keeping the old Lv 41+ prices instead would put a 5x jump at Lv 41. Above 40 the x1.3
  XP still holds Training back (Training cannot pass the hero's level). The Training overhaul sets Ascended prices later.
- Attack milestones: unchanged. The Lv 30 and Lv 35 "hits x2 harder" moments stay. A re-derived spread that keeps
  today's average power can go with card 2 if it is still needed.
- Scores: Compass fit 4 (Q2 progress walls, P9 a steady rhythm, keeps the milestone moments); evidence confidence 3;
  impact on walls 3; cost 5; risk 4.
- Not A: fix 3 buffs power under a tuned combat model. Not C (even foe HP first): alone it left Pip at 39 hours and
  Tobin short of zone 30, and it moves the wait onto the Wraithmarsh bosses; it stays card 2.
- Red-team points accepted: the fix 3 buff, the Ascended XP, thin evidence, other levers as input for card 2. Partly
  accepted: the Ascended prices (real, but keep the growth rate and measure it), the wall moving (card 1 still cuts the
  largest wall on every hero). Rejected: the level gates going vestigial (the Proving opens on beating the Fenmother,
  and the cap of 40 stays); the DECISIONS line on catch-up XP (it is about boosts for new heroes, not the base curve).

## 9. Reproduce

```text
# today, good player (also --seed 42), one hero
node tools/sim.mjs --days 17 --checkins 8,13,19 --session 60 --first 60 --class ranger --active 1 --turns 1 --seed 41 --health out.json
# marathon: node tools/health.mjs --long (or the same sim line with --policy mixed --hours 50 --every 3600)
# casual: --days 60 --checkins 8,13,19 --session 15 --first 15, run with LF_PROFILE=casual through the turnPlayer patch below
# a change: add --eval "<code>" with one of the snippets below
```

`xpNeed` is a `const`, so the XP snippets replace `gainXp` with the same formula (the level-up toast is skipped; the
level, XP and events are the same).

| Change | `--eval` snippet |
|---|---|
| Card 1 XP (x1.15 from Lv 26 to 40) | `gainXp = function (n, quiet) { S.xp += n * mod("xp"); const need = () => Math.floor(15 * Math.pow(1.3, Math.min(S.L, 25) - 1 + Math.max(0, S.L - 40)) * Math.pow(1.15, Math.max(0, Math.min(S.L, 40) - 25))); while (S.xp >= need()) { S.xp -= need(); S.L++; emit("levelup", { L: S.L, quiet: !!quiet }); } }` |
| XP x1.15 a level past 25 | `gainXp = function (n, quiet) { S.xp += n * mod("xp"); const need = () => Math.floor(15 * Math.pow(1.3, Math.min(S.L, 25) - 1) * Math.pow(1.15, Math.max(0, S.L - 25))); while (S.xp >= need()) { S.xp -= need(); S.L++; emit("levelup", { L: S.L, quiet: !!quiet }); } }` |
| Training prices x1.18 | `ECON.train.r2 = 1.18` |
| Milestones spread | `PACE.atkEvery = 1; PACE.atkX = Math.pow(1.7, 0.2); PACE.atkX2 = Math.pow(2, 0.2); SOLO_TUNE.train.abX = Math.pow(1.55, 0.2); SOLO_TUNE.train.abX2 = Math.pow(1.8, 0.2)` |
| Even foe HP, zones 15 to 34 | `TURN_TUNE.refAtk = (() => { const old = TURN_TUNE.refAtk.map(p => p.slice()), H = z => turnZoneLine(old, z) * mobHp(z), g = Math.pow(H(34) / H(15), 1 / 19), pts = old.filter(p => p[0] < 15); for (let z = 15; z <= 34; z++) pts.push([z, H(15) * Math.pow(g, z - 15) / mobHp(z)]); return pts.concat(old.filter(p => p[0] > 34)); })()` |
| Double XP / gold x1.5 | `TURN_TUNE.xpX = 5` / `TURN_TUNE.goldX = 4.5` |

The casual player's patch to `turnPlayer` in a copy of `tools/sim.mjs` (put the copy in `tools/` so its imports resolve):

```js
const LF_PROF = { good: { parry: 0.6, dodge: 0.9, perfect: 0.4, good: 0.45 }, casual: { parry: 0.25, dodge: 0.5, perfect: 0.1, good: 0.4 } }[process.env.LF_PROFILE] || null;
// first in turnPlayer, after the snapshot: a timing ring is pressed 0.05 s (Perfect) or 0.15 s (Good) before it closes, or not at all
if (LF_PROF && s && s.phase === 'timing' && s.timing) {
  const key = 'ring:' + s.n + ':' + s.timing.i + ':' + s.timing.closesAt;
  if (!turnInput || turnInput.key !== key) { const r = rnd(); turnInput = { key, done: false, lead: r < LF_PROF.perfect ? 0.05 : r < LF_PROF.perfect + LF_PROF.good ? 0.15 : -1 }; }
  if (!turnInput.done && turnInput.lead >= 0 && s.now >= s.timing.closesAt - turnInput.lead) { turnInput.done = true; E('turnCombatAction("time")'); }
  return true;
}
// at a foe's windup: parry, else dodge, else no press; a tried defence is pressed mid-window and lands
turnInput.kind = LF_PROF ? (rnd() < LF_PROF.parry ? 'parry' : rnd() < LF_PROF.dodge ? 'dodge' : 'none') : rnd() < 0.6 ? 'parry' : 'dodge';
if (turnInput.kind === 'none') turnInput.done = true;
else turnInput.at = LF_PROF || rnd() < 0.8 ? opens + (s.closesAt - opens) * 0.5 : Math.max(s.now, opens - 0.1);
```

Checked over two days of play (Wren, seed 41): the casual graded 13% Perfect, 38% Good, 50% Miss; the good profile
44%, 41%, 15%; the sim's own player 0%, 0%, 100%.
