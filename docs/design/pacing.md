# The Lantern Road: pacing (task M6)

Status: implemented on the M6 branch. Owner of the knobs: the `PACE` table in `src/js/40-rules.js`.
Check with `node tools/sim.mjs --targets`. Try values without editing with `--pace key=value`.

## 1. The problem

Before M6 the zone curve had no bend. Mob HP grew by x1.42 per zone for ever, every zone boss
had 8x HP, Starlit (tier 5) essence dropped from zone 25, and companion XP per kill was
normalised to the zone ("par" = 3 levels per zone). Companions therefore levelled as fast as
the party pushed, and any one-off multiplier was amplified into many zones. A tier-5 sword
(damage x10 to x20 at about 2h45) pushed the party 20 zones in ten minutes. Region 1 fell in
about 3 hours. Normal play reached zone 73 by day 3 and then hit the roster's level-200 cap,
so Region 2 was also gone in the first weekend.

## 2. Normal play (the check-in policy)

The sim's `--days N` mode plays this policy. All of it is flags, so other policies can be tried.

| Part | Default | Flag |
|---|---|---|
| Day 1 first session | 60 min at 08:00 | `--first 60` |
| Check-ins | 3 a day, at 08:00, 13:00 and 19:00 | `--checkins 8,13,19` |
| Session length | 15 min, played with the real tick (10 min fight, 5 min gather) | `--session 15` |
| Between sessions | the game's own closed-form `awayGains()`, capped by the away cap (4h today) | - |
| Night | the 19:15 to 08:00 gap (8h of sleep inside it) | - |
| Away activity | gather after the morning check-in, fight at the max zone otherwise | - |
| Gear | "sword first": essence is kept for the next sword tier (`--forge weapon`, the default) | `--forge any` |

That is 45 minutes of active play a day (1.5h on day 1) plus about 12 hours of away gains.

"Meaningful upgrade" (the boredom metric): a new zone, a new gear tier in any slot, a recruit,
or a promotion. The sim counts check-ins in which none of these happened.

## 3. The target curve

| When | Target | Why |
|---|---|---|
| 30m / 1h / 2h of play (continuous) | zones 12-16 / 18-22 / 26-32 (T1) | the onboarding; unchanged |
| 3h of play (continuous) | zone 42 at most (T2) | no runaway |
| End of day 1 (normal play) | zone 28-32 | the evening check-in closes on the Region 1 approach |
| Region 1 boss (zone 35) | day 2-4 (P1) | the first milestone lands on the second or third day |
| Region 2 (zones 36-70) | 2-5 zones a day, steady | always a next zone within a day |
| Region 2 boss (zone 70) | 7-21 days, aim 12-14 (P2) | the first "weeks" rung |
| Region 3 boss (zone 105) | 30-60 days (P3) | needs Region 3 power (see 7) |
| Boredom before the Region 2 boss | at most 3 empty check-ins in a row (P4) | never a full day without an upgrade |

### What the sim shows now (warden, seed 1, `--days 21`)

| Day | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 16 | 18 | 21 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Max zone | 29 | 35 | 42 | 46 | 50 | 53 | 55 | 57 | 62 | 65 | 67 | 70 | 70 | 71 | 74 | 76 | 76 |
| Hero level | 28 | 30 | 32 | 34 | 36 | 37 | 38 | 39 | 39 | 40 | 40 | 41 | 41 | 41 | 42 | 43 | 44 |

Region 1 boss: day 2.8. Region 2 boss: day 13.8. Longest stretch without a meaningful upgrade
before the Region 2 boss: 46 active minutes (2 check-ins). Companions: the best three reach
about level 105 (rank 4) on day 3, 140 (rank 5) on day 7, 185 (rank 7) on day 14 and the
level-200 cap around day 20. The top gear tier is 4 on day 1 and 5 (Starlit) from day 2.

All classes (`--targets`): Region 1 boss on day 1.8-2.8, Region 2 boss on day 10.8-13.8.

## 4. The levers

| Lever | What it does | Verdict |
|---|---|---|
| Zone HP growth past zone 30 | More power per zone. | It cannot slow time on its own: kill time at the wall is fixed by the boss rule (8x HP in 30s = normal mobs die in about 4s), so kills per hour do not change. Steeper growth only moves the level-200 cap zone down, below zone 70. Used the other way: **gentler** (1.29) so the cap sits at zone 76-80 and the Region 2 boss is never a hard wall. |
| Boss walls at region ends | A one-off bump. | A boss-only wall is followed by a burst: the next few zones are easier than the boss. Used as a **region step** instead: mob HP x5 from zone 35 and x2.5 more from zone 70, and it stays. |
| Gear tier gates by material tier | When the big multipliers arrive. | Used: Starlit (tier 5) essence now drops from zone 36, so the tier-5 sword is Region 2's reward, not the thing that skips the Region 1 boss. |
| The forge runaway | x10-x20 in one forge. | Mostly a sim artefact: the old policy ran with no sword for hours (other slots and promotions ate the matching essence), then forged tier 5 in one go. The sim now forges "sword first". The real fix is the essence gate above plus the XP curve below, which stops companions racing after the jump. |
| Companion promotion costs | A hard gate every 25 levels. | Not used: a gold or essence gate is a hard wall, and gold grows exponentially so any fixed cost is soon trivial. |
| **Companion XP curve** | Levels past 90 need more kills. | **The main lever.** Companions are 60-95% of damage, and their XP per kill is normalised to the zone, so their level *is* the pacing. From level 90 the XP needed grows x1.2 per level up to x80 (level 114). Region 2 is paced by that plateau: about 2-4 levels a day per companion, which is 2-5 zones a day. |
| Early zone HP growth | T1. | 1.42 -> 1.48. The merged B7 unlocks (bounty claims, Maren, Renown) had pushed T1 to 16-18 / 24-27 / 31-35. |

### Why this wall is soft

- Every check-in has something close: a companion level (each is +11% damage), a promotion
  every 25 levels, a new zone most sessions, Blade and Fortune buys, gear rerolls and +levels.
- The XP curve ramps (x2.5 at level 95, x6 at 100, x15 at 105) instead of stepping, so there is
  no single day on which progress stops.
- New recruits stay fast: the curve is by the companion's own level, so a level-1 recruit still
  catches up in minutes (T11 unchanged).
- Away time matters more than raw play time: about 12 hours of away gains a day are most of a
  companion's XP, so three short check-ins keep pace with a long session.
- The region steps come with a reward on the far side (Starlit essence, the tier-5 sword).
- Measured: before the Region 2 boss the longest run of empty check-ins is 2-3 (at most a day),
  and the longest stretch is 37-46 active minutes.

## 5. Changes (before -> after)

All in `PACE` (`src/js/40-rules.js`) unless named.

| Knob | Before | After | Effect |
|---|---|---|---|
| `hpGrowth` (mob HP per zone, zones 1-30) | 1.42 | 1.48 | T1 back in band after B7. Zone 30 has 3.3x the old HP |
| `hpLate` (per zone past 30) | 1.42 | 1.29 | the level-200 cap moves from zone 73 to 76-80 |
| `regionStep` (HP step from zones 35 / 70) | none | x5 / x2.5 | the region walls; they stay (no burst after) |
| `regionBoss` (extra on region bosses only) | none | 1 (off) | spare knob |
| `bossHp` | 8 | 8 | unchanged, now a knob |
| `essTier` (first zone of each essence tier) | 1, 7, 13, 19, 25 | 1, 7, 13, 19, 36 | Starlit is Region 2's essence |
| `compLv` / `compXp` / `compXpMax` (companion XP need past level 90) | none | 90 / x1.2 per level / cap x80 | the time lever |
| `heroAwayXp` (hero XP while away) | 0 | 0.5 | constellations.md: 50% of the away kills' XP. T1/T2 are continuous play, so unaffected; normal play reaches hero level 42 instead of 33 by day 16 and the Region 2 boss about a day sooner |

Code edits outside the table (small):
- `56-roster.js`: `cxpNeed(lv)` multiplies by `paceXp(lv)`; XP per kill (`cxpGain`, the gapMax cap)
  uses the old curve (`cxpBase`). No `ROSTER_TUNE` value changed.
- `50-sim.js`: bosses use `bossHpMult(z)`; `awayBase` gives quiet hero XP; `gainXp(n, quiet)`.
- `76-audio.js`: no level-up sound for quiet (away) levels.

### Save compatibility

No stored value is changed or lowered, and no field is added. What changes for a live save:
zones 2-59 have more HP than before (x1.5 at zone 10, x3.3 at 30, x10 at 35), zones past 60 have
less. Companions past level 90 keep their XP but need more for the next level. A save farming
zones 25-35 now earns Blazing (tier 4) essence there instead of Starlit; Starlit already owned is
kept. A player past the new curve simply finds the next zones harder.

## 6. Retuning after merges

`node tools/sim.mjs --targets` runs every class for 3h continuous and 30 days of normal play and
prints PASS/FAIL. It takes about a minute. `--pace`, `--tune`, `--unlock`, `--syn`, `--seed`,
`--forge` pass through, so a retune can be tried in one command, e.g.
`node tools/sim.mjs --targets --syn 0.75 --pace hpGrowth=1.51`.

| Symptom | Knob |
|---|---|
| T1 too fast (more early power: synergies, affixes) | `hpGrowth` up. With `SYN_TUNE.today` 0.75, T1 is 15-19 / 23-24 / 30; `hpGrowth` 1.51-1.52 puts it back in band |
| Region 2 too fast or too slow (more away hours from the Camp, more party damage) | `compXpMax` (plateau height); x80 -> x120 is about +4 days (and up to 6 empty check-ins in a row) |
| Region 1 boss too early | `regionStep[0]` up (x5 -> x6 adds up to half a day for the slower classes) |
| Region 2 boss is a long stall | `regionStep[1]` down, or `hpLate` down (moves the level-200 cap zone up) |
| A burst after a region boss | keep `regionBoss` at 1; walls belong in `regionStep` |
| The transition around zone 30-40 feels abrupt | `compXp` (ramp speed) and `compLv` (where it starts) |

Headroom: with synergies raised to 0.75 (`--syn 0.75`, about +30-50% party damage) the long
curve barely moves (Region 1 boss day 1.8-2.3, Region 2 boss day 10.8-14.3, P4 still passes).
T1 is the sensitive target; retune it with `hpGrowth` only.

The Camp's Watchtower (away cap up to 24h) will be the biggest future shift: companion XP is
mostly away XP, so tripling the away hours roughly halves the Region 2 time. Raise `compXpMax`
when it lands.

## 7. Open items for the coordinator

- **Region 3 (P3).** Today's power ends at the level-200 roster cap (rank 7): the party stops at
  zone 76-80 (reported as INFO). Region 3 needs new power sources from the Region 2 spec: ranks
  past 7, tier-6 materials, Constellations. Budget: about 3 zones of power a day (x2.2 a day
  with `hpLate` 1.29), and give zone 105 its own `regionStep` entry.
- **The first Legendary (B7).** Elowen's quest (zone 28, 150M gold) lands at 1.8-2.6h because gold
  grows exponentially with the zone. Change `UNLOCK_TUNE.quests.elowen` to
  `{ from: 48, gold: 2e12, ess: [4, 20] }`. Measured (13-14h runs, one seed): first Legendary at
  6.5-11.2h for all four classes (Elowen or Caedmon); T1 and T2 unchanged. Update the "how"
  text in `ROSTER.elowen` to match.
- **T10 fails** (a promotion due every 20 minutes before 2h): the gaps are 40-55 minutes. Fielded
  companions level in lockstep and caps come every 25 levels, so cap hits cluster. No small
  `ROSTER_TUNE` change fixes it (`killsPerLv`, `commonXp`, `catchMax` tried). It needs a roster
  design change: shorter early ranks, or staggered recruits.
- **T1 lightkeeper** reaches zone 23 at 1h (band 18-22). It was 23 before M6 too (the class is
  strong early). That is a class knob in `55-party.js`, not a pacing one.
- **T16 Rare**: Maren joins at 8-10 min for warden and lightkeeper (target 15-40 min). That is B7's
  `quests.maren`.
- The sim's T1/T2 numbers now use the "sword first" gear policy. The old policy (`--forge any`)
  often ran for hours with no sword, which made the late jump look bigger than a player's.
