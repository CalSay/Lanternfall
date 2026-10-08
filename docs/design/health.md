# Game health metrics (f-health)

Every change can be measured before and after against the same numbers. `node tools/health.mjs` plays the real game core
with three kinds of player and scores the result against `docs/design/health-baseline.json`.

```text
node tools/health.mjs                   run (about 40 seconds), print, write tools/.health/latest.json
node tools/health.mjs --compare         also compare with the baseline; exit 1 when a metric moves past tolerance
node tools/health.mjs --write-baseline  accept the mean of 5 seed offsets as the baseline (about 3 min; tolerances kept)
--only casual,active,optimiser,budget   --jobs N   --json PATH   --seed-offset N
node tools/health.mjs --long            the 50-hour run (about 2.5 min on 3 free cores, 7 min of CPU in all); add --compare, or --write-baseline (3 seeds, about 8 min on 3 cores)
```

The run also scores the **difficulty budget** (`tools/budget.mjs`, one process a hero beside the personas): each fight
kind's win rate for each starter against its band, with known gaps. See `difficulty-budget.md`.

## The players

All three run `tools/sim.mjs` (turn fights on, the shipped game) once per starter hero (Wren, Tobin, Pip), on fixed seeds.
Time below is active time: game ticks the player was there for. Away gaps do not count as play.

| Persona | Plays | Policy |
|---|---|---|
| casual | three 5-minute visits a day (08, 13, 19h) for 3 in-game days; the game's own away gains run between visits | the sim's mixed policy; fights by hand, the morning gap gathers |
| active | one 60-minute session | parries about 60% of hits and dodges most of the rest (every hit of a move, z21-foe-climb), casts every off-cooldown ability, learns Scrolls and fills the ability slots, builds the camp |
| optimiser | 10 hours | the same bot: always buys the best gain per gold, crafts the next class piece |
| long (`--long`) | 50 hours, one run per starter, seed 41 | the optimiser's bot, kept going |

The bot learns a Scroll the moment it can and slots abilities in the Abilities screen's order. Hero parity is the three
starters under the same persona.

## What it measures

| Metric | Where |
|---|---|
| Seconds to the first goal (first zone boss win) and first reward | `firstGoalSec`, `firstRewardSec` |
| Longest stretch without a reward (zone clear, level, camp build, craft, unlock, skill level, Scroll, Star, trophy, hire) | `longestDrySec`, `visitsWithRewardShare` (casual) |
| Stall points: 10 active minutes without a new zone | `stallCount`, `longestStallSec`, and the zone it was on |
| Zone reached per hour | `zoneEnd`, `zoneAt1h`, `zonePerHour`, `zoneByHour` |
| Wipes | `wipesPerHour` |
| Gold, essence and material source against sink | `goldSpentShare`, spend split by category, `essHeldShare`, `deadFamilies` (families 90% unspent) |
| Dominant choices | `abilityTopShare` (most-cast ability), `trainTopShare` (most-trained move), Stars set, worn gear tier |
| Hero parity | `heroParity`: the widest gap of a starter from the median zone |
| New mechanics unlocked per hour | `mechanicsPerHour`, `mechanicsByHour`, `mechanicsBurst10min` |

## The long run

`--long` plays 50 active hours per starter (about 2.5 minutes of wall time on three free cores, the heroes in parallel; about 7 minutes of CPU, so allow that on one core; the simulation cost is spread through the game core, with no single hotspot to cut) and is scored against the `long`
section of the baseline. It exists to catch what a 10-hour run cannot: a progress wall late in the game, and an empty endgame.

| Metric | Reads as |
|---|---|
| `zoneEnd`, `zoneAt10h`, `zoneAt25h` | how far the hero got, and when |
| `lastNewZoneHour`, `sinceLastZoneHours`, `postZoneShare` | when the last new zone landed, and how much of the run came after it |
| `postNewThingShare` | share of the run after the last new zone, unlock, camp building, Proving, hire, or Star (repeat drops do not count): an empty endgame |
| `stallsOver1h`, `longestStallSec` | progress walls: stretches of an hour or more without a new zone (the report lists each, with its zone) |
| `goldSpentShare`, `essHeldShare`, `deadFamilies` | sinks still working after 50 hours |
| `abilityTopShare`, `trainTopShare`, `starsSet`, `gearTierMean` | the dominant build, for reference (not ranked); the report also prints the Stars set and the gear worn at the end |

The `long` baseline is the mean of 3 seed offsets and records `sd`, the spread of that mean, so a band can be read against the noise.

## Tolerances

The baseline is the mean of five seed offsets. Each baseline metric has a bad direction (`up`, `down`, or `both` for pacing, where faster is as suspect as slower) and an
allowed move, `max(abs, rel x |baseline|)`, held by the mean of the three heroes and (at twice the band) by each hero against their own baseline. A metric missing from the baseline fails. Runs repeat exactly for a seed, but they are chaotic: a code change that touches
one random draw reshuffles them. So each band is at least three standard deviations of the metric over five seed offsets
(`--seed-offset 0` to `4`, 2026-10-05), or a design band where that is wider. A regression has to clear the noise.

Widen a band only with a reason, in the PR. To see the noise on a metric, run `--seed-offset 1`, `2`, and so on.

## Retired targets

`tools/sim.mjs --targets` and `--report early` still print their old first-hours rows (E1 to E6, T1 to T3), marked RETIRED:
they measure the real-time idle pacing model, and the shipped game fights in turns, active only. Nothing passes or fails on
them. `--report early --turns 1` re-enables the early rows. The day-scale targets (D1, P1 to P4, EC9) stay live, because this
tool covers 3 days and 10 hours, not weeks. Party-era code paths are marked retired in comments. Current numbers come from
this tool, `docs/DECISIONS.md` and `docs/design/combat-turn-build.md`.

## Found while building it

- The sim loaded the game files before seeding `Math.random`, so two runs of one seed could start from different saves.
  The sim now seeds it for the load too, which makes every run exact.
- `turnPlayer` in the sim never cast abilities in a turn fight (a slot-less `soloAbility()` does nothing there). It casts now.
- A lethal hit from a vampiric elite cleared the fight before its heal landed, and the heal threw. Fixed in
  `59k-turn.js` with a check in C29.
- Not yet scored (Opus sign-off, follow-up): Stars dominance (a star over 25%) and which gear wins; `starsSet` and `gearTierMean` only describe the choice.
- Wood is the most hoarded material family in every persona that gathers (casual and optimiser end with it unspent). Read it
  as a sink gap, not a bot quirk, when the economy is next tuned.
