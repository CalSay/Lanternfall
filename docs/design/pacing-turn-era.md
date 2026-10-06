# Pacing in the turn era: where the climb stalls, and what to change

Status: report, 6 October 2026 (card `xp-gold-pacing-report`). No game code changed. Measured with the real core
through `tools/sim.mjs` (turn fights on). Coverage-map areas 7 (progression curve) and 8 (economy). It re-checks
`progression-stalls.md` (1 October, before the turn engine), the 50-hour health run (PR #41), the optimiser playtest
(`autopilot/reports/playtest-2026-10-05-optimiser.md`) and the systems map (PR #45).

## The short answer

- **Every hero stalls between zone 20 and zone 30 (Fungal Deep and Quarry Ruins).** A good player on 3 hours a day
  reaches zone 20 in about 6 hours, then needs 23 to 37 more hours to reach zone 30 (Wren and Pip). Tobin does not
  reach zone 30 in 51 hours. A casual player (45 minutes a day) reaches zone 20 in about a week, zone 25 in about three
  weeks, and then about two zones a month. No hero passes zone 28 in 60 days.
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
- **Best fix:** ease the XP curve and Training prices together, then spread the Attack milestones. Measured together on
  two seeds, the good player reaches zone 30 in 19 to 23 hours (now 29 to 43), and Wren's and Pip's longest stall before
  zone 35 falls from up to 19 hours to 3 to 10 hours. The casual Wren and Pip reach zone 30 on day 30 and 35 (now never
  in 60 days). Tobin needs his own look (section 6).

## 1. How it was measured

Hours are active hours: time the player is in the game. Fights earn nothing while away; gathering does.

| Player | Plays | Turn skill | Command shape |
|---|---|---|---|
| Good | 3 hours a day (three 60-minute sessions, 08, 13, 19h) for 17 days: 51 hours | lands 80% of parries and dodges (the sim's own player) | `--days 17 --checkins 8,13,19 --session 60 --first 60` |
| Marathon | 50 hours in one go, nothing away (the health tool's `--long` run) | 80% | `--policy mixed --hours 50 --every 3600` |
| Casual | 45 minutes a day (three 15-minute visits) for 60 days: 45 hours | lands 40% (the turn report's casual sits at 25% parry, 50% dodge) | `--days 60 --checkins 8,13,19 --session 15 --first 15` |

Every run: `--class ranger|warden|lanternmage --active 1 --turns 1 --seed 41` (Wren, Tobin, Pip), and the good player
again on `--seed 42`. All runs use the sim's mixed policy: fight 10 minutes, gather 5, craft the next class piece, build
the camp, train the best value per gold, challenge the zone boss when it is ready. The casual's 40% timing came from a
scratch copy of `tools/sim.mjs` with one number changed (line 756, `rnd() < 0.8`), not committed. A 15-minute probe
(`--evalfile`) logged zone, level, gold, Training, gear and wipes. 66 runs in all.

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
| Casual | Wren | 0.4 h (Lv 14, day 1) | 4.4 h (Lv 27, day 6) | not reached | not reached | not reached | zone 28, Lv 35 |
| Casual | Tobin | 0.4 h (Lv 14, day 1) | 3.5 h (Lv 25, day 5) | not reached | not reached | not reached | zone 24, Lv 29 |
| Casual | Pip | 0.5 h (Lv 16, day 1) | 4.9 h (Lv 27, day 7) | not reached | not reached | not reached | zone 27, Lv 34 |

Casual calendar: zone 25 on day 21 (Wren) and 23 (Pip); Tobin never. After that: Wren zone 26 on day 29, zone 27 on
day 56; Pip zone 27 on day 39; Tobin sits on zone 24 from day 25 to day 60.

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

### Stall 1: hero levels stop in Fungal Deep and Quarry Ruins (zones 20 to 29)

- **Measured:** good player, zone 20 to zone 30 takes 23 to 37 hours (Wren, Pip); Tobin never gets there. Casual: about two
  zones a month from zone 25. At the wall Training equals the hero's level and gold piles up (Wren: 22,000 to 52,000
  unspent from hour 19 to hour 27 of the marathon).
- **Cause:** foe HP x1.42 a zone needs about two hero levels a zone; each level costs x1.3 more XP than the last.
- **Fix:** past level 25, each level costs x1.15 more XP instead of x1.3. Lv 35 then needs 33,000 XP, not 112,000; Lv 40
  needs 66,000, not 417,000.
- **Code:** `xpNeed` in `src/js/40-rules.js` (one line). Anything that prints the XP bar reads `xpNeed`.
- **Save impact:** none. `S.L` and `S.xp` keep their meaning; only future levels get cheaper. No catch-up lump: a hero
  keeps the XP they hold.
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
  price, so Ascended Training gets about 5x cheaper too. No run reached the Proving, so that part is unmeasured. Default
  for the build: accept it, and let the Training overhaul (DECISIONS, 2026-10-02) set the Ascended prices.
- **Save impact:** none (prices only).

### Stall 3: Attack milestones make walls, then cliffs

- **Measured:** Wren (good) waits at zones 27 to 29 for about 11 hours, then Attack 35 lands and zones 29 to 35, the
  Region 1 boss included, fall in 2.3 hours (seed 41). After the Fenmother, Grey Shingle (zones 36 to 41) takes 0.9 and
  1.0 hours (seeds 41, 42). The region boss should be a big moment (DECISIONS); here it is a speed bump at the end of a
  long wait.
- **Cause:** past Lv 25, Attack is x2 at each fifth level and about x1.07 between, while foe HP grows evenly.
- **Fix:** spread each milestone over its five levels: x2^(1/5), about x1.15, every level past 25, and x1.7^(1/5) before.
  Power at every fifth level stays exactly as today; it only rises sooner in between.
- **Code:** `PACE.atkEvery`, `atkX`, `atkX2` in `src/js/40-rules.js`, `SOLO_TUNE.train.abX`, `abX2` in
  `src/js/24b-data-solo.js`, and the Training card's "Lv 35: hits x2 harder" line in `src/js/55-training.js` (it should
  say "+15% a level"). The ability milestones (cooldown, Stun and so on, `SOLO_TUNE.train.every`) stay every fifth level.
- **Save impact:** none.
- **Alone it does nothing** (one seed: Wren slower, Pip faster, Tobin the same). It pays only once levels and gold flow.

## 5. The fixes measured together

Good player, two seeds (41 / 42). Same seeds and policy as section 2.

| Change | Hero | Zone 30 | Zone 35 | Longest stall before 35 | Stalls of 3 h+ before 35 | After 51 h |
|---|---|---|---|---|---|---|
| Today | Wren | 30.2 / 29.3 h | 30.5 / 30.9 h | 6.5 / 12.0 h | 3 / 1 | zone 44 / 43 |
| Today | Pip | 42.5 / 42.7 h | not reached | 19.1 / 8.3 h | 4 / 8 | zone 30 / 30 |
| Today | Tobin | not reached | not reached | 16.7 / 11.8 h | 4 / 5 | zone 27 / 27 |
| Fixes 1 + 2 | Wren | 23.2 / 14.7 h | 37.9 / 26.0 h | 10.8 / 9.2 h | 3 / 1 | zone 42 / 45 |
| Fixes 1 + 2 | Pip | 30.7 / 21.2 h | 46.5 / 30.4 h | 7.8 / 5.1 h | 7 / 3 | zone 41 / 43 |
| Fixes 1 + 2 | Tobin | not reached | not reached | 14.8 / 17.5 h | 5 / 4 | zone 27 / 27 |
| **Fixes 1 + 2 + 3** | Wren | 19.5 / 19.0 h | 21.5 / 30.2 h | 3.2 / 5.1 h | 1 / 2 | zone 47 / 44 |
| **Fixes 1 + 2 + 3** | Pip | 23.4 / 20.3 h | 41.2 / 30.9 h | 9.5 / 4.9 h | 3 / 2 | zone 41 / 44 |
| **Fixes 1 + 2 + 3** | Tobin | 47.5 h / not reached | not reached | 11.5 / 15.5 h | 7 / 4 | zone 31 / 27 |
| + even foe HP (option) | Wren | 16.5 / 17.8 h | 24.2 / 31.2 h | 3.6 / 6.2 h | 1 / 3 | zone 45 / 47 |
| + even foe HP (option) | Pip | 16.5 / 12.5 h | 33.7 / 26.1 h | 8.3 / 5.3 h | 3 / 2 | zone 39 / 45 |
| + even foe HP (option) | Tobin | 37.0 / 37.0 h | not reached | 11.3 / 13.6 h | 5 / 5 | zone 33 / 31 |

Casual player (45 minutes a day, seed 41), zone 30 and zone 35 by active hours and calendar day:

| Change | Wren | Pip | Tobin |
|---|---|---|---|
| Today | zone 30 not reached; zone 28 on day 58 | zone 30 not reached; zone 27 on day 39 | zone 30 not reached; stuck on zone 24 from day 25 |
| Fixes 1 + 2 + 3 | zone 30 at 22.0 h (day 30); zone 35 at 37.9 h (day 51) | zone 30 at 26.0 h (day 35); zone 34 by day 60 | zone 27 by day 60 |
| + even foe HP (option) | zone 30 at 9.5 h (day 13); zone 35 at 21.5 h (day 29) | zone 30 at 13.9 h (day 19); zone 35 at 43.9 h (day 59) | zone 30 at 36.7 h (day 49) |

Marathon player (50 hours in one go, seed 41), zone reached and when:

| Change | Wren | Pip | Tobin |
|---|---|---|---|
| Today | zone 29 (zone 25 at 27.2 h) | zone 27 | zone 27 |
| Fixes 1 + 2 + 3 | zone 35 at 47.2 h (zone 30 at 39.9 h) | zone 28 | zone 27 |
| + even foe HP (option) | zone 45 at 49.9 h (zone 30 at 18.5 h) | zone 31 (zone 30 at 27.4 h) | zone 34 (zone 30 at 34.0 h) |

The marathon player's gear lags a tier (no away gathering), so fixes 1 to 3 help Wren only; even foe HP is what moves
Pip and Tobin there.

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

- **Wraithmarsh bosses (zones 30 to 34) become the next wall:** a stall of 3 hours or more there in 10 of 12 combined
  runs, the longest 9.5 hours for Wren and Pip and 11 to 14 hours for Tobin. The boss pass sets their HP at x3.6 there
  (`TURN_TUNE.boss.hpX`, x2.6 at zone 25). Measure again after fixes 1 to 3 land before touching it.
- **Training reaches its base-class cap of 40** in the combined runs. The sim never takes the Proving (`--evo` was not
  set), so zones past 35 are slower here than for a player who Ascends.
- **"Even foe HP"** (`TURN_TUNE.refAtk` in `src/js/59k-turn.js` re-pointed so foe HP grows x1.31 a zone from 15 to
  34, the same HP at 15 and at 34) helps the players fixes 1 to 3 leave behind: Tobin (zone 30 at 37 hours on both
  seeds, today never), the casual (zone 30 on day 13 and 19, not 30 and 35) and the marathon player (above). It adds
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

Card 1: three changes (fixes 1, 2 and 3 together, since 1 alone moves the wall and 3 alone does nothing). Card 2,
after card 1 is measured: even foe HP from zone 15 to 34 with the Wraithmarsh boss HP (section 5).

- **Predicted (good player, `--days 17 --checkins 8,13,19 --session 60 --first 60`, seeds 41 and 42):** zone 30 in
  18 to 25 active hours for Wren and Pip (now 29 to 43); zone 35 for both in under 45 hours (Pip today: never); the
  longest stretch without a new zone before zone 35 under 10 hours for Wren and Pip (now up to 19).
- **Health tool:** `node tools/health.mjs --long --compare` will move `zoneEnd`, `lastNewZoneHour` and `stallsOver1h`
  outside their bands (the point of the change); the build card accepts the new baseline with `--write-baseline` and
  says so in the PR.
- **Predicted (casual, seed 41):** zone 30 within 40 days of 45 minutes for Wren and Pip (today: not in 60 days).
- **Missed if:** Pip's zone 30 is still over 30 hours on both seeds, or Wren or Pip has a stall over 12 hours before
  zone 35, or zone 10 moves by more than 15 minutes. Zone 20 comes about an hour sooner (cheaper Training from Lv 20);
  that is expected.
- **Switch off:** each change is one constant; put the old numbers back (x1.3 XP, `r2` 1.28, `atkEvery` 5 with `atkX`
  1.7, `atkX2` 2, `abX` 1.55, `abX2` 1.8). No save field changes, so undoing it is free.
- **Gate:** economy targets and the pacing curve are `judge` calls under the playbook (the card said gate-cal, written
  before Autopilot's rules). Not in the "Cal only" column.

## 8. Reproduce

```text
# today, good player (also --seed 42), one hero
node tools/sim.mjs --days 17 --checkins 8,13,19 --session 60 --first 60 --class ranger --active 1 --turns 1 --seed 41 --health out.json
# marathon: node tools/health.mjs --long (or the same sim line with --policy mixed --hours 50 --every 3600)
# casual: --days 60 --checkins 8,13,19 --session 15 --first 15, with the defence timing at 0.4 (tools/sim.mjs line 756)
# a change: add --eval "<code>" with one of the snippets below
```

| Change | `--eval` snippet |
|---|---|
| XP x1.15 a level past 25 | `gainXp = function (n, quiet) { S.xp += n * mod("xp"); const need = () => Math.floor(15 * Math.pow(1.3, Math.min(S.L, 25) - 1) * Math.pow(1.15, Math.max(0, S.L - 25))); while (S.xp >= need()) { S.xp -= need(); S.L++; emit("levelup", { L: S.L, quiet: !!quiet }); } }` |
| Training prices x1.18 | `ECON.train.r2 = 1.18` |
| Milestones spread | `PACE.atkEvery = 1; PACE.atkX = Math.pow(1.7, 0.2); PACE.atkX2 = Math.pow(2, 0.2); SOLO_TUNE.train.abX = Math.pow(1.55, 0.2); SOLO_TUNE.train.abX2 = Math.pow(1.8, 0.2)` |
| Even foe HP, zones 15 to 34 | `TURN_TUNE.refAtk = (() => { const old = TURN_TUNE.refAtk.map(p => p.slice()), H = z => turnZoneLine(old, z) * mobHp(z), g = Math.pow(H(34) / H(15), 1 / 19), pts = old.filter(p => p[0] < 15); for (let z = 15; z <= 34; z++) pts.push([z, H(15) * Math.pow(g, z - 15) / mobHp(z)]); return pts.concat(old.filter(p => p[0] > 34)); })()` |
| Double XP / gold x1.5 | `TURN_TUNE.xpX = 5` / `TURN_TUNE.goldX = 4.5` |
