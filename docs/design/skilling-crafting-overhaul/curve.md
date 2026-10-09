# The station curve: fit and level-by-zone table

Card `craft-curve-skills-report` (part A of the craft split), 9 October 2026. Spec: [the overhaul](../skilling-crafting-overhaul.md)
sections 3, 12 and 13. Everything here sits behind `CRAFT_TUNE.curve`, which stays off in the game until the balance pass.

## What is built

- `CRAFT_TUNE` (`src/js/20-data.js`): `{ grades: 0, strike: 0, infuse: 0, curve: 0, infuseX: 3 }`. All off. Cards B and C read the
  other keys.
- `SKILL_TUNE.craftNeedV2`: the planned curve, one piece a tier, `[first level, XP from that level to the next, growth a level]`.
  `skillCurve` returns it for the four station skills when the switch is on; `skillNeed` reads the pieces (`src/js/40-rules.js`).
- `SKILL_TUNE.belowTierX` 0.1 (provisional): with the switch on, a craft, an upgrade, a reforge (judged by Enchanting's top tier, which it
  levels) or a legacy `forgeItem` craft below the station's highest open tier pays a tenth of its XP (`craftXpShare` in `src/js/55-crafting.js`; `forgeItem` in
  `51-actions.js`). Refining keeps its XP.
- `S.craft.xpv` (default 0; old saves get 0): which curve the station bars are on. `craftXpMap` carries each bar to the curve in use,
  keeping its share of the level and staying under the next level; no level changes. It runs when the craft state loads (a save-code
  import reloads into this) and at the top of every station gain in `gainSkill`, so refine XP, which skips `gainStation`, never
  chains level-ups on an unmapped bar. Save codes accept `xpv` 0 or 1.

The fitted curve (provisional until the balance pass):

| piece | levels | XP a level | growth | XP to reach the piece's end |
|---|---|---|---|---|
| tier 1 | 1-9 | 6 | x1.08 | 71 to level 10 |
| tier 2 | 10-21 | 11 | x1.05 | 206 to 20 (grade A), 241 to 22 |
| tier 3 | 22-35 | 73 | x1.09 | 1,346 to 32 (A), 2,134 to 36 |
| tier 4 | 36-53 | 400 | x1.24 | 14,788 to 46 (A), 42,453 to 51 (S), 80,524 to 54 |
| tier 5 | 54 on | 16,000 | x1.025 | no cap; level 100 takes 49,821, level 150 171,242 |

Each piece starts at least as high as the last level before it (a jump at each opening, never a drop). Today's curve
(`craftNeed`, `7 x lv^0.5 x 1.04^(lv - 1)`) needs 160 XP to level 10, 748 to 22, 2,312 to 36 and 7,077 to 54.

## How it was measured

`node tools/sim.mjs --report skills --parts C [--craft curve=1] [--md PATH]` (new part C). Each starter (Wren, Tobin, Pip) is played
in turn fights by the turn era's two players ([pacing-turn-era.md](../pacing-turn-era.md) section 1): **casual**, three 15-minute
visits a day for 60 days (parries 25%, dodges half the rest), and **good**, three 60-minute sessions a day for 17 days. Both play the
sim's mixed policy, which crafts each next class piece as its tier opens. For this report the policy is the kept-up player of the
spec: it does not re-roll gear for the rarity die (`--reroll 0`; the re-roll loop was 97% of station XP and the grades card removes
its reason), and when it leaves it sets each built station to refine All of the material its gear tier uses (`--awayrefine 1`;
spec section 3: "a station that works while you are away levels too"). Station XP is split into refining (live and away) and the
rest by wrapping the game's own `gainSkill`, `refineTick` and `refineAwayRun` in the sim's core. A level's zone is the furthest
zone when it was first reached.

Targets (the card's Prediction, for the casual): each gate 10/22/36/54 by the zone that opens its tier (7/13/19/42); grade A
(20/32/46) by zone 10/16/22; missed if later than that zone + 2. Tier 4 S (level 51) not before zone 35. Refining at least half of
station XP, missed under a third. The good player is reported, not gated.

## Results, seed 1

**Switch off (today's curve, the same kept-up player):** 53 misses. Refining is 97-99% of station XP, and today's curve lets
the overnight batches run away: the casual Wren's Woodcraft is 44 at zone 16 and 124 at zone 25 (level 51 comes by zone 19),
while the first gates lag (Pip's Woodcraft makes 10 at zone 13). On the plain mixed policy (re-rolls on, no away orders) refining
is 2-4% of station XP: the re-roll loop earns the rest.

**Switch on (the fit):** casual: every gate and grade A on the stations that make the set lands by its zone + 2, except Pip's
Woodcraft at tier 2 (10 at zone 10, 20 at zone 13: Pip makes only the Staff there) and Pip's Enchanting (below). Refining is 96-100%
of the casual's station XP and 91-96% of the good player's; that target is met by the kept-up player model (no re-rolls, away
orders), not by the curve itself. Misses left (42 in all, 12 of them the casual's):

1. **Tier 4 S before zone 35, every station (casual, and good).** The casual stops gaining zones at 24 to 29 for weeks
   ([pacing-turn-era.md](../pacing-turn-era.md): every hero stalls between zones 20 and 30) while the stations refine every night,
   so level 51 comes at zones 23 to 25, and the tier 5 gate (54) comes at zones 23 to 28, long before tier 5 opens at zone 42
   (the report checks gates only as "by"). No sane curve fixes this: holding 51 back to zone 35 while 46 comes by zone 22 would
   need levels 46 to 50 to cost many times level 45 (an estimate from the stall's length, not a run). Owner: the balance pass (the zone 20-30 stall, and how much a night's refining pays).
2. **Pip's Enchanting (casual and good).** The Enchanter's Table has no refine product, so its XP is crafts only and lags every
   gate (10 at zone 15 for the casual). Pip's Lantern is made there. Owner: the balance pass (options: an Essence refine at the
   Table, or a share of the other stations' refine XP).
3. **The good player's grades on day 1.** Three hours on day 1 reach zone 19 before any away time, so the stations make 11 to 14 by
   zone 19 and catch up the first night (36 by zone 19 to 25). The kept-up footing assumes grade A by zone 10 and 16; a fast player
   wears grade D or C there. Owner: the balance pass, with the budget rows card B builds on this report.

## Level by zone, switch on (seed 1)

`*` marks a station that makes a class set piece. `end` is the run's last day.

### casual

| hero | station | z1 | z3 | z5 | z7 | z10 | z13 | z16 | z19 | z22 | z25 | z30 | z35 | z42 | z45 | end |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Wren | smith | 1 | 1 | 9 | 9 | 9 | 9 | 22 | 41 | 47 | 52 | - | - | - | - | 53 (z29, day 60) |
| Wren | bench * | 1 | 1 | 6 | 11 | 16 | 33 | 42 | 46 | 49 | 55 | - | - | - | - | 72 (z29, day 60) |
| Wren | loom * | 1 | 1 | 1 | 11 | 16 | 36 | 42 | 44 | 44 | 52 | - | - | - | - | 74 (z29, day 60) |
| Wren | ench | 1 | 1 | 7 | 9 | 9 | 9 | 10 | 10 | 10 | 11 | - | - | - | - | 27 (z29, day 60) |
| Tobin | smith * | 1 | 1 | 9 | 13 | 20 | 25 | 27 | 32 | 41 | 49 | - | - | - | - | 55 (z29, day 60) |
| Tobin | bench | 1 | 1 | 3 | 9 | 12 | 36 | 40 | 44 | 49 | 55 | - | - | - | - | 74 (z29, day 60) |
| Tobin | loom | 1 | 1 | 1 | 1 | 4 | 9 | 9 | 23 | 42 | 54 | - | - | - | - | 81 (z29, day 60) |
| Tobin | ench | 1 | 1 | 4 | 7 | 8 | 8 | 9 | 9 | 10 | 25 | - | - | - | - | 35 (z29, day 60) |
| Pip | smith | 1 | 1 | 6 | 6 | 6 | 14 | 19 | 26 | 32 | - | - | - | - | - | 34 (z24, day 60) |
| Pip | bench * | 1 | 1 | 4 | 6 | 8 | 17 | 36 | 46 | 48 | - | - | - | - | - | 72 (z24, day 60) |
| Pip | loom * | 1 | 1 | 1 | 11 | 14 | 22 | 22 | 38 | 43 | - | - | - | - | - | 71 (z24, day 60) |
| Pip | ench * | 1 | 1 | 5 | 7 | 8 | 9 | 13 | 22 | 28 | - | - | - | - | - | 37 (z24, day 60) |

### good

| hero | station | z1 | z3 | z5 | z7 | z10 | z13 | z16 | z19 | z22 | z25 | z30 | z35 | z42 | z45 | end |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Wren | smith | 1 | 1 | 9 | 9 | 9 | 9 | 9 | 9 | 24 | 30 | 44 | 45 | 46 | 47 | 47 (z47, day 17) |
| Wren | bench * | 1 | 1 | 6 | 10 | 11 | 13 | 14 | 14 | 36 | 43 | 51 | 53 | 56 | 58 | 61 (z47, day 17) |
| Wren | loom * | 1 | 1 | 1 | 1 | 11 | 12 | 13 | 13 | 20 | 26 | 50 | 51 | 53 | 56 | 58 (z47, day 17) |
| Wren | ench | 1 | 1 | 7 | 7 | 9 | 9 | 9 | 9 | 12 | 13 | 25 | 26 | 27 | 27 | 28 (z47, day 17) |
| Tobin | smith * | 1 | 1 | 9 | 9 | 11 | 11 | 15 | 36 | 40 | 43 | 52 | 53 | - | - | 54 (z36, day 17) |
| Tobin | bench | 1 | 1 | 3 | 3 | 4 | 4 | 5 | 36 | 40 | 43 | 53 | 57 | - | - | 59 (z36, day 17) |
| Tobin | loom | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 3 | 6 | 10 | 52 | 55 | - | - | 57 (z36, day 17) |
| Tobin | ench | 1 | 1 | 5 | 8 | 10 | 10 | 10 | 10 | 10 | 11 | 26 | 29 | - | - | 37 (z36, day 17) |
| Pip | smith | 1 | 1 | 9 | 9 | 9 | 9 | 9 | 21 | 22 | 27 | 40 | 42 | - | - | 42 (z39, day 17) |
| Pip | bench * | 1 | 1 | 8 | 9 | 11 | 12 | 13 | 36 | 36 | 43 | 52 | 57 | - | - | 61 (z39, day 17) |
| Pip | loom * | 1 | 1 | 1 | 1 | 11 | 12 | 13 | 16 | 20 | 26 | 50 | 54 | - | - | 57 (z39, day 17) |
| Pip | ench * | 1 | 1 | 7 | 7 | 11 | 11 | 11 | 19 | 19 | 23 | 38 | 38 | - | - | 38 (z39, day 17) |

## For card B (grades)

The budget fixture reads the grade a kept-up casual has at each row from this table (switch on): the casual's level on the station
that makes the piece, at the row's zone, minus the tier's gate, gives the grade (D at the gate, C +3, B +6, A +10, S +15). Re-run
`node tools/sim.mjs --report skills --parts C --craft curve=1 --md PATH` after any change to the curve, the refine numbers or the
sim's crafting policy; one run takes about 6 minutes on 4 cores.
