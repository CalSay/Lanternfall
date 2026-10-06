# Hero progression: the build (card `hero-progression-rework`, 2026-10-06)

The decisions are in `hero-progression.md` (Cal, 2026-10-06). This page is what the build card left open: the attribute
set, the level curve, the join level, bench XP, the switch-off flag and the save. Numbers marked (tuned) are set by the
sims in the PR; the rest is the design the red team and the Opus judge ruled on (records at the end).

Coverage-map areas: 7 (progression curve), 14 (heroes and build variety), 5 (meaningful choices).

## 1. What a level gives

Each move acts as if trained to one below the hero's level (`L - 1`, so a Lv 1 hero hits for today's untrained 4), so
the hero a player has today at the wall (Training near the level cap) is what every hero gets for free. The class-stage
cap stays (Lv 40 on a base class, Lv 80 after the Proving), but past it a level adds half a move level
(`HERO_TUNE.capHalf`): move level = `min(L - 1, cap) + 0.5 x max(0, L - 1 - cap)`. Passing the Proving then lifts Attack
about x1.27, not x1.63. Milestones and tiers use the whole part.

| Move | From the hero's level (each level) | Was (Training, per Training level) |
|---|---|---|
| Attack | the Attack curve `atkCurve(L)` | the same curve, bought with gold |
| Abilities | +2% ability power (turn fights) | the same, bought |
| Parry | counters +10% | the same, bought |
| Dodge | dodge window +4 ms (cap 500 ms) | the same, bought |
| Everything above | +2% (`HERO_TUNE.lvBase`) | +4% (`PACE.heroLv`, the old flat level bonus) |

The other half of the old +4% a level becomes attribute points (section 2). Attack's curve rises a little every level
instead of x1.7 (x2 past Lv 25) every fifth level: `atkSteps` takes the fifth-level step as a smooth power,
`x^((L - 2) / 5)`, which has the same mean over each block of five levels as the staircase. Levels now come at a steady
rate (section 3), and the staircase turned that into "four levels of almost nothing, then double", the walls and cliffs
of `pacing-turn-era.md`.

Ability Training goes too (the card's default): ability power follows the hero's level. Star points (one per 3 levels),
talent points and ability tiers keep following the level, unchanged. What star points buy is the `counters-and-layers`
card's.

## 2. Attributes: four points a level, four ways to spend them

Each hero earns `HERO_TUNE.perLevel` (4) attribute points for every level after Lv 1 and spends them on four attributes.
Points belong to the hero (Cal: "my Wren can play differently from someone else's").

| Attribute | A point gives | Each level gives | Who it suits |
|---|---|---|---|
| Might | Attack +3% | +1% | a hero who wins on Attack (Wren's Aim crits) |
| Focus | ability power +1% | +3% | a caster (Pip's Fireball, Burn) |
| Guard | counter damage +3%, parry window +1 ms | +1% | a parry build (Tobin's counters hit x1.5) |
| Vigour | health +1.5% | +2.5% | a player who takes hits, or a long boss fight |

The split between "a point" and "each level" is each attribute's own (`ATTRS[].base`, `.per`), set by the dominance arms
(section 6): abilities carry most of a turn fight's damage, so at +2% a point Focus was the best build for every hero on
normal foes (2 to 3x the kills an hour) and Might was a trap. Base + per is always 4%, so the even spread is unchanged.

- **Shape, not extra power.** Spread evenly (one point a level in each), the four attributes give exactly the old
  +4% a level on Attack, abilities, counters and health (the level's share plus the points' share). Every point put into one is a
  point not in the others.
- **Soft cap.** Points in one attribute past half of all the hero has earned count half (`HERO_TUNE.softAt`, `soft`).
  Survival is all in Vigour while damage is split three ways, so without it "all Vigour" beat every other build. A Lv 30
  hero with all 116 points in Might gets Attack x1.81 against an even spread, and health x0.80.
- **Guard's window** is the one thing beyond the old curve: +1 ms a point (after the soft cap), at most +60 ms
  (`HERO_TUNE.guardMs`).
- **Power outside a fight does not depend on the build.** Away and raid damage, the farmable zone and the Deepwell's
  depth read `heroAtk()`, which carries `attrNeutral()`: the level's multiplier as if the points were spread evenly. Turn
  fights apply the build on top (`attrRel`). So a build changes how fights play, never the online numbers.
- **Weapons scale with an attribute** (Cal, 12:33). The `craft-attribute-grades` card builds that on these four:
  `attrOf(hero, id)` and `ATTRS` are the read side, so it is built once.
- **Respec.** Adding points is free, any time. A hero's first reset is free; later ones cost
  `foeGoldBase(furthest zone) x 30` gold (`HERO_TUNE.respec`, no gold multipliers), shown on the button with a two-tap
  confirm. A fight takes the points as it starts, so a reset cannot change a fight in progress. (The judge asked for
  "reset only at camp"; the game has no at-camp state outside the Camp menu, so the price is the brake.) Gold's main
  sinks are the `gold-without-training` card's.
- **Spread evenly.** One tap spreads the free points so the four end as even as they can. The first time a hero takes
  the lamp with points to spend, a toast offers it (Go: Build).
- **Unspent points do nothing.** Next Up says when there are points to spend; the guide's old "Train Attack" step
  becomes "Add a point to Might".

## 3. The level curve follows the road

`xpNeed(L) = fights(L) x foeXp(roadZone(L))`:

- `roadZone(L)`: the zone where the road expects a hero to be Lv L (the inverse of `HERO_TUNE.road`, a zone -> level
  table, tuned to the old game's levels a zone plus one, since moves now use `L - 1`).
- `foeXp(z)`: what a normal foe pays at zone z (the turn fight's `1.5 z x 2.5`, without its rounding).
- `fights(L)`: `HERO_TUNE.fights` is the fights one zone of road takes, by zone, with a steady ratio between its
  points; a level takes that over the road's levels a zone there. So the fights a zone takes rise smoothly (at most
  21% from one zone to the next, the judge's limit is 25%) and no level is a wall on its own.

**The brake.** Most XP comes from away time, and away XP has no wall. Without a brake, heroes ran 20+ levels past the
road (zone 54 to 69 in 51 hours, against 29 to 31 in the old game). So a hero more than `aheadLead` (4) levels past the
road's level at the furthest zone earns `aheadX` (0.6) of the XP for each level further (`xpAheadX`, in `gainXp` and
bench XP). A tighter brake (lead 0 to 2) stopped levels while a hero was stuck at a wall, which is when a level helps
most, and made the gaps between levels longer.

Before: 15 x 1.3^(L - 1), a cost that grows x1.3 a level against XP that grows in a straight line with the zone, which
always walls (Lv 35 took 7 to 11 active hours).

## 4. New heroes join at the road's level; benched heroes earn half

- `roadLevel()`: the road's level at the furthest zone (`S.maxZone`), plus `joinLead` (2): heroes who play the road
  stand about that far above the table, and a joining hero should fight like them (the switch test, section 6).
- A hero who takes the lamp (the switch at camp, or a new hero) is lifted to at least `roadLevel()`. They keep their
  banked XP, cut to one short of the next level, so a lift never chains level-ups. A hero above it keeps their own
  level. Their attribute points come with the levels. A joining hero gets no free ability learns: they have their
  signature move and whatever Scrolls the player holds.
- Every won fight (not away time) gives each other hero the player can play 50% of its XP, at their own level's price.
  The floor makes this matter only for heroes above the road's level (`hero-progression.md` 5).

## 5. Switching it off, saves, online

- `HERO_TUNE.training = 1` restores today's rules: Training, its prices and caps, `xpNeed` 15 x 1.3^(L - 1), the flat
  +4% a level, the stepped Attack curve, no attributes, no join floor, no bench XP. The sims run both from one build. On
  a save played with attributes (`S.attr.live`), switching the flag on raises each hero's Training once to the move
  level their hero level gave them (`S.solo.trSeeded`), so no high-level hero comes back untrained. The Training code
  and its save fields stay until the judge signs off the sims after testers play; a later card removes them.
- Save key `lanternfall.save.v5` -> `v6` (S.v 6): old saves start fresh (Cal accepts wipes until 1.0; a key bump needs
  the `cal-approved` label). New field `S.attr = { v: 1, pts: { hero: { might, focus, guard, vigour } }, resets,
  met, live }`, defaults in `registerState`. `S.solo.tr` stays for the flag.
- Online: the raider doc's `L` and presence `lvl` stay the hero's level. No online file changes.

## 6. Predictions and results

All runs: `tools/sim.mjs --turns 1 --active 1`, good persona 17 days x 3 h (`--skill good`), casual 60 days x 45 min
(`--skill casual`), seeds 41, 42 and 43, each starter, the old game (this branch's parent, `HERO_TUNE` absent) and this
build. Scripts: `hero-progression-build/run.sh`, `an.mjs` (per-run lines in `matrix.txt`), `arms.mjs` (`arms-150.txt` before the per-attribute split, `arms-split.txt` after it and after the judge's join amend).
Attribute policy in the pace runs: even (the sim's default `--attrs even`).

**Pace (judge: hours to zone 30 at 0.75 to 1.10 x the old game, each starter, both personas).**

| Starter | Good, new | Good, old | Ratio | Casual, new | Casual, old |
|---|---|---|---|---|---|
| Wren | 34.7, 33.2, 28.9 h | 46.2, 40.2, 24.7 h | 0.87 | z30 at 31.2, 24.2 h; one seed ends z29 | ends z28 every seed |
| Pip | 33.0, 36.5, 36.0 h | 37.6, 49.2, 35.0 h | 0.87 | z30 at 44.2, 38.7 h; one seed ends z28 | ends z27-28 |
| Tobin | 39.0 h, never (z29), 37.5 h | never (z29, z29, z27) | faster | ends z25-27 | ends z25-26 |

- Good: Wren and Pip are in the band. Tobin reaches zone 30 in two seeds of three where the old game never did; he
  stays 10-16% slower than Wren and Pip (the DECISIONS band is 15-30%).
- Casual: the old game walls every starter at zone 27-28 (gaps of 9-11 h). Hours to zone 28 (the furthest the old game
  reaches): Wren 26.2 h against 27.2 h (0.96), Pip 34.6 h against 42.7 h or never. Casual Tobin reaches zone 25 in
  25 h against 40 h (0.63): faster than the band.

**Level gaps (judge: at most 2 zones' play with no level-up in zones 20-30, good persona).** Wren 1.9-2.4 zones, Pip
2.2-2.5, Tobin 5.8-5.9 (15-20 h at zone 26-27; the old Tobin had 14-18 h gaps and never reached 30). Old game: Wren
2.4-2.5, Pip 2.2-2.9. Missed for Tobin, at the edge for Wren and Pip. A level is worth about one zone of power (the
Attack curve x2 every 5 levels past 25), so the road holds about 0.85 levels a zone, and the gap falls under 2 zones
only if levels come at a steady rate. The tighter brakes tried (lead 0 to 2) made the gaps longer.

**Power margin (judge: 0.8 to 1.25, zones 1-50).** A road-level hero's Attack against the old game's hero at that
zone (old levels from the old runs, 3-zone mean, both curves smooth): 0.79-1.19 in zones 3-31; zones 32-50 have no
old-game data (no old run passed zone 35 with levels to compare).

**Fights to hold the road (judge: at most 25% change between neighbouring zones, zones 1-50).** 9-21% from zone 3 on.

**Switch (prediction 1: within 10 points, good persona; judge: 80% or better).** Zone-20 saves (seed 41), 150 fights
an arm, the joining hero lifted and spread evenly with their signature kit:

| From | To | Normal | Boss |
|---|---|---|---|
| Wren (100%, 90%) | Tobin | 100% | 100% |
| | Pip | 100% | 83% (-7) |
| Tobin (100%, 100%) | Wren | 99% | 35% (-65) |
| | Pip | 100% | 34% (-66) |
| Pip (100%, 60%) | Wren | 95% | 31% (-29) |
| | Tobin | 100% | 98% |

Normal fights hold. Bosses miss whenever the hero who leaves had more kit: the profiles show the gap is not the level
(the joiner is at Lv 28-29 against 28-30; after the judge's amend a joiner never outranks the hero who leaves, so from Tobin's Lv 28 save they join at 28, not 29) but abilities, Stars and gear affixes (Pip from Tobin's save has the same Attack
and more health, but one ability and no Stars against her own save's three abilities and three Stars). Before the
join lead the levels were 1-3 short as well. The judge's ruling sends this to Cal: no free ability learns.

**Dominance (judge: no build best for every starter on both foe types; each attribute in a winning build; the best
beats even by 5+ points somewhere).** Even, four pure builds and six pairs, normal foes (casual skill: win rate and
kills an hour) and the zone boss (good and casual skill), zone 20 and zone 30 saves, 150 fights an arm
(`arms-split.txt`). No build is best everywhere: Focus wins normal foes for most saves, Focus/Vigour wins bosses for
most, and Focus/Guard and even win some. The best beats even by 13 points (Pip, pure Focus, normal foes at zone 20).
Might is in no winning build in this run (in the earlier post-split run it won one boss row by a single fight): it is
the weakest attribute, so the rule's "each attribute wins somewhere" is not met for Might. Its job comes with weapons
that scale with attributes (card craft-attribute-grades). Wren with any extra Focus kills normal foes in one ability,
so pure Focus farms 2.1-3.2x faster than even for her and loses on bosses (81-91% against Vigour's 96-97%).

**Gold (judge: spent / earned at zone 20 at least 0.5 with the flag off).** Zone 20: 0.66 (Wren), 0.86 (Pip), 0.91
(Tobin); zone 30: 0.96-1.0. Old game: 0.95-1.0, with Training 26-33% of all gold spent. The gold goes to camp, crafting
and shifts.

## 7. Red team and judge

The red team's findings are in `hero-progression-build/red-team.md`, the lead's answers in `lead-response.md` and the
Opus judge's ruling in `judge.md`. What changed because of them:

| Finding | Ruling | In the build |
|---|---|---|
| All Vigour beat every build (x1.32) | soft cap | points past half count half |
| Guard's window was an easy mode (+136 ms) | cap | +60 ms at most |
| Might leaked into away, raid and farm power | build-neutral power | `attrNeutral()` in `heroAtk`, the build only in turn fights |
| Free respec allowed per-fight counter-picks | price it | first reset free, then gold |
| Lv 1 hit 2.5x today's | move level `L - 1` | first hit 4 |
| Lv 40 cliff at the Proving | half levels past the cap | x1.27 jump |
| A lift could chain level-ups | clamp | XP kept short of a level |
| The flag did not roll saves back | seed once | `S.solo.trSeeded` |
| Measures were loose | pinned | power margin, dominance arms, pace bands (section 6) |
| The join lead could lift a joiner past the hero who leaves | amend | the lift stops at the leaving hero's level; the road's own level stays the floor |
| A save code could carry more points than the level gives | validate | save codes refuse it; points past the total count nothing |

**Sign-off (Opus judge, after the results above).** The attribute set and the level curve are signed off for the
integration branch, not yet for testers. Accepted: the XP brake, the per-attribute split, no camp-only reset, the
Build tab. Before testers: smooth the road's slopes (a monotone curve through `HERO_TUNE.road`) and add a check that
whole-level fights change by at most 25% between neighbouring zones 1-50. For Cal: the switch's boss miss (kit, not
level), Tobin's level gaps, casual Tobin's pace, Wren's Focus farming, and Might as the weakest attribute until weapons
scale with attributes.
