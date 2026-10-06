# Hero progression: the build (card `hero-progression-rework`, 2026-10-06)

The decisions are in `hero-progression.md` (Cal, 2026-10-06). This page is what the build card left open: the attribute
set, the level curve, the join level, bench XP, the switch-off flag and the save. Numbers marked (tuned) are set by the
sims in the PR; the rest is the design the red team and the Opus judge ruled on (records at the end).

Coverage-map areas: 7 (progression curve), 14 (heroes and build variety), 5 (meaningful choices).

## 1. What a level gives

Each move acts as if trained to the hero's level, so the hero a player has today at the wall (Training at the level cap)
is what every hero gets for free. The class-stage cap stays: Lv 40 on a base class, Lv 80 after the Proving.

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

| Attribute | A point gives | Who it suits |
|---|---|---|
| Might | Attack +2% | a hero who wins on Attack (Wren's Aim crits) |
| Focus | ability power +2% | a caster (Pip's Fireball, Burn) |
| Guard | counter damage +2%, parry window +1 ms (cap 350 ms) | a parry build (Tobin's counters hit x1.5) |
| Vigour | health +2% | a player who takes hits, or a long boss fight |

- **Shape, not extra power.** Spread evenly (one point a level in each), the four attributes give exactly the old
  +4% a level on Attack, abilities, counters and health (2% base + 2% from the points). Every point put into one is a
  point not in the others: all 136 points of a Lv 35 hero in Might give Attack x1.86 against an even spread, and
  abilities, counters and health x0.71. Guard's window is the one thing beyond the old curve, and only a parry build
  reaches its cap.
- **Weapons scale with an attribute** (Cal, 12:33). The `craft-attribute-grades` card builds that on these four:
  `attrOf(hero, id)` and `ATTRS` are the read side, so it is built once.
- **Respec is free, any time.** A fight takes the points as it starts. Free because a build should be tried, not
  bought, and every new hero arrives with a pile of points (section 4). Gold's sinks are the `gold-without-training`
  card's.
- **Unspent points do nothing.** Next Up says when there are points to spend; the guide's old "Train Attack" step
  becomes "Add a point to Might".

## 3. The level curve follows the road

`xpNeed(L) = fights(L) x foeXp(roadZone(L))`:

- `roadZone(L)`: the zone where the road expects a hero to be Lv L (the inverse of `HERO_TUNE.road`, a zone -> level
  table, tuned).
- `foeXp(z)`: what a normal foe pays at zone z (the turn fight's `ceil(1.5 z) x 2.5`).
- `fights(L)`: normal fights a level takes (`HERO_TUNE.fights`, a level table, tuned).

So a hero fighting at the zone the road expects for their level gains a level every `fights(L)` fights, at any level:
no level is a wall on its own. A hero behind the road levels faster (their zone pays more than their level needs), a
hero ahead of it slower. Before: 15 x 1.3^(L - 1), a cost that grows x1.3 a level against XP that grows in a straight
line with the zone, which always walls (Lv 35 took 7 to 11 active hours).

## 4. New heroes join at the road's level; benched heroes earn half

- `roadLevel()`: the road's level at the furthest zone (`S.maxZone`).
- A hero who takes the lamp (the switch at camp, or a new hero) is lifted to at least `roadLevel()`, with an empty XP
  bar. A hero above it keeps their own level. Their attribute points come with the levels.
- Every won fight (not away time) gives each other hero the player can play 50% of its XP, at their own level's price.
  The floor makes this matter only for heroes above the road's level (`hero-progression.md` 5).

## 5. Switching it off, saves, online

- `HERO_TUNE.training = 1` restores today's game exactly: Training, its prices and caps, `xpNeed` 15 x 1.3^(L - 1), the
  flat +4% a level, the stepped Attack curve, no attributes, no join floor, no bench XP. The sims run both from one
  build. The Training code and its save fields stay until the judge signs off the sims after testers play; a later
  card removes them.
- Save key `lanternfall.save.v5` -> `v6` (S.v 6): old saves start fresh (Cal accepts wipes until 1.0; a key bump needs
  the `cal-approved` label). New field `S.attr = { v: 1, pts: { hero: { might, focus, guard, vigour } } }`, defaults
  in `registerState`. `S.solo.tr` stays (zeros) for the flag.
- Online: the raider doc's `L` and presence `lvl` stay the hero's level. No online file changes.

## 6. Predictions (from `hero-progression.md`) and how this build measures them

| Prediction | Measure | Missed if |
|---|---|---|
| A hero who takes the lamp on a zone-20 save wins zone-20 fights within 10 points of the hero they replace | the good persona's save at zone 20 (seed named in the PR), each starter switching to the other two; 30 scratch fights each (`turnCombatSample`) | below 80% for the good persona |
| Hours to zone 30 (casual, each starter) no slower than baseline | `tools/sim.mjs --days 60` with the casual turn skill (`--skill casual`), seeds 41 | more than 10% slower |
| Longest stretch with no level-up, zones 20 to 30 (good persona) at most 2 zones' play | the good persona's level events | longer than 3 zones' play |

## 7. Red team and judge

(Recorded below by the PR.)
