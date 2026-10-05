# Game health metrics (f-health)

Every change can be measured before and after against the same numbers. `node tools/health.mjs` plays the real game core
with three kinds of player and scores the result against `docs/design/health-baseline.json`.

```text
node tools/health.mjs                   run (about 40 seconds), print, write tools/.health/latest.json
node tools/health.mjs --compare         also compare with the baseline; exit 1 when a metric moves past tolerance
node tools/health.mjs --write-baseline  accept this run as the new baseline (tolerances already in the file are kept)
--only casual,active,optimiser   --jobs N   --json PATH   --seed-offset N
```

## The players

All three run `tools/sim.mjs` (turn fights on, the shipped game) once per starter hero (Wren, Tobin, Pip), on fixed seeds.
Time below is active time: game ticks the player was there for. Away gaps do not count as play.

| Persona | Plays | Policy |
|---|---|---|
| casual | three 5-minute visits a day (08, 13, 19h) for 3 in-game days; the game's own away gains run between visits | the sim's mixed policy; fights by hand, the morning gap gathers |
| active | one 60-minute session | parries about 60% of heavy hits and dodges most of the rest, casts every off-cooldown ability, learns Scrolls and fills the ability slots, builds the camp |
| optimiser | 10 hours | the same bot: always buys the best gain per gold, crafts the next class piece |

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

## Tolerances

Each baseline metric has a bad direction (`up`, `down`, or `both` for pacing, where faster is as suspect as slower) and an
allowed move, `max(abs, rel x |baseline|)`. Runs repeat exactly for a seed, but they are chaotic: a code change that touches
one random draw reshuffles them. So each band is at least three standard deviations of the metric over five seed offsets
(`--seed-offset 0` to `4`, 2026-10-05), or a design band where that is wider. A regression has to clear the noise.

Widen a band only with a reason, in the PR. To see the noise on a metric, run `--seed-offset 1`, `2`, and so on.

## Retired targets

`tools/sim.mjs --targets` and `--report early` still print their old rows, marked RETIRED: they measure the real-time
idle pacing model (the shipped game fights in turns, active only) or the party. Nothing passes or fails on them. Current
numbers come from this tool, `docs/DECISIONS.md` and `docs/design/combat-turn-build.md`. `--report early --turns 1` re-enables
the early rows.

## Found while building it

- The sim loaded the game files before seeding `Math.random`, so two runs of one seed could start from different saves.
  The sim now seeds it for the load too, which makes every run exact.
- `turnPlayer` in the sim never cast abilities in a turn fight (a slot-less `soloAbility()` does nothing there). It casts now.
- A lethal hit from a vampiric elite cleared the fight before its heal landed, and the heal threw. Fixed in
  `59k-turn.js` with a check in C29.
- Not yet scored (Opus sign-off, follow-up): Stars dominance (a star over 25%) and which gear wins; `starsSet` and `gearTierMean` only describe the choice.
- Wood is the most hoarded material family in every persona that gathers (casual and optimiser end with it unspent). Read it
  as a sink gap, not a bot quirk, when the economy is next tuned.
