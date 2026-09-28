# The Lantern Road: pacing (M6, retuned by BAL1)

Status: BAL1 (the slower pace the owner asked for) on top of M6. Owners of the knobs: `PACE` in
`src/js/40-rules.js`, `ROSTER_TUNE` in `56-roster.js`, `UNLOCK_TUNE` in `56c-unlocks.js`,
`CAMP_TUNE` in `57-camp.js`, `SYN_TUNE` in `56b-synergy.js`. Check with
`node tools/sim.mjs --targets` (about 2.5 minutes). Try values without editing with
`--pace k=v`, `--tune k=v`, `--unlock path=v`, `--syn v` or `--eval "code"`.

## 1. The owner's direction (2026-09-27)

"The pace of the game still feels far too quick. Party members are far too easy to get. Damage
feels like it ramps so fast too." Uniques were already toned down (`UNIQ_TUNE`, 20-data.js).

## 2. Normal play (the check-in policy, `--days N`)

| Part | Default | Flag |
|---|---|---|
| Install | at the first check-in (08:00 on day 1). BAL1 fixed the sim, which gave a new game 8h of away gains before it was installed | - |
| Day 1 first session | 60 min | `--first 60` |
| Check-ins | 08:00, 13:00, 19:00 | `--checkins 8,13,19` |
| Session length | 15 min with the real tick (10 min fight, 5 min gather) | `--session 15` |
| Between sessions | the game's closed-form `awayGains()` (away cap 4h + 2h per Watchtower level, 24h at most) | - |
| Away activity | gather after the morning check-in (the node the gear needs, never a camp trip), fight otherwise | - |
| Gear | "weapon first": essence kept for the next class weapon; once the tier-1 set is done (or the weapon is 2 tiers behind) the gather trip goes to the weapon | `--forge any` |
| Camp | any affordable build, Watchtower first; every other live gather trip fetches a build's missing materials; an old lower-tier material is broken down at the Enchanter's Table | `--camp 0` |

"Meaningful upgrade" (the boredom metric): a new zone, a new gear tier in any hero position, a
recruit, a promotion, a drill (BAL1) or a finished Camp build (BAL1).

## 3. The targets (BAL1)

| Id | When | Target |
|---|---|---|
| T1 | 30m / 1h / 2h continuous, mixed idle play with class gear, every class | zones 6-9 / 10-13 / 15-19 |
| T2 | 3h continuous | zone 24 at most |
| T3 | class parity | each class reaches zone 15 within 0.85-1.15 x the median time (mean of 3 seeds) |
| T10 | before 2h | a roster step (a promotion comes due, or a drill) at least every 30 min |
| T16 | recruits | first after the starter 15-30 min, first Rare 1.5-3h (continuous); first Epic day 2-4, first Legendary day 14-21 (normal play) |
| D1 | end of day 1, normal play | zones 20-26 |
| P1 | Region 1 boss (zone 35) | day 4-8 |
| P2 | Region 2 boss (zone 70) | day 21-42 |
| P3 | Region 3 boss | INFO until Region 3 power exists |
| P4 | before the Region 2 boss | never more than 3 empty check-ins in a row |
| C1 | the Camp | first build in the first 10-20 min, full camp over several weeks (INFO) |

### What the sim shows now (`--targets`, seed 1)

| Target | Warden | Lanternmage | Ranger | Lightkeeper | |
|---|---|---|---|---|---|
| T1 | 9 / 11 / 16 | 8 / 11 / 18 | 9 / 12 / 18 | 9 / 12 / 16 | PASS |
| T2 | 22 | 22 | 23 | 21 | PASS |
| T3 (min to zone 15) | 105 (1.05) | 94 (0.95) | 86 (0.86) | 109 (1.09) | PASS |
| T10 (longest gap) | 11m | 8m | 8m | 12m | PASS |
| T16 | 18m / 1.9h / d2.3 / d17.3 | 19m / 1.6h / d2.8 / d17.3 | 25m / 1.5h / d2.3 / d15.8 | 17m / 2.0h / d2.8 / d15.3 | PASS |
| D1 | 19 | 18 | 18 | 18 | FAIL (see 8) |
| P1 (day) | 6.8 | 7.3 | 5.3 | 6.3 | PASS |
| P2 (day) | 30.3 | 31.8 | 29.3 | 28.5 | PASS |
| P4 | 2 | 2 | 3 | 2 | PASS |
| C1 first build / full | 19m / day 22 | 36m / day 24 | 17m / (48 of 53: Map Room waits on Soft Hide) | 19m / day 21 | INFO |

Warden curve (max zone, hero level) by day: d1 19 (L24), d2 29, d3 31, d4 33, d6 35, d8 37,
d10 41, d14 49, d21 57, d28 68, d35 72, d42 73. Before BAL1 it was d1 35, d2 45, d7 62, d12 72,
then the level-200 wall at 78-79.

Continuous warden, dps at 1h / 2h / 3h: 3.8K / 59K / 519K (zone 11 / 16 / 22). Before BAL1:
316K / 4.9M / 8.2M (zone 28 / 35 / 35).

Recruits (first after the starter / first Rare / first Epic / first Legendary):

| Class | First | Rare | Epic | Legendary |
|---|---|---|---|---|
| Warden | 18m Tobin | 1.9h Aldric | day 2.3 Vesper | day 17.3 Elowen |
| Lanternmage | 19m Wren | 1.6h Maren | day 2.8 Vesper | day 17.3 Elowen |
| Ranger | 25m Wren | 1.5h Maren | day 2.3 Vesper | day 15.8 Elowen |
| Lightkeeper | 17m Tobin | 2.0h Anselm | day 2.8 Vesper | day 15.3 Elowen |

Before BAL1: Tobin/Hesketh at 1 min, Maren (Rare) at 13-16 min, an Epic at about 1.2h.

## 4. The model: levels from time spent fighting

Before BAL1, companion XP per kill was normalised to the zone ("par" = 3 levels a zone, up to 18
levels above the character). Companions raced to about 3 x the zone, so every zone pushed dragged
their power up by about x1.37, and any one-off multiplier cascaded into many zones.

Now (`ROSTER_TUNE`):
- XP per kill counts the par level at most `gapMax` 4 above the character (was 18), with `par` 6,
  so the cap nearly always binds: about 25 kills' worth of XP a level at any zone.
- `killWorth`: a kill gives (seconds a normal foe of that zone takes the party) / `xpSecs` (5)
  kills' worth, at most `xpWorthMax` (8). XP therefore follows time spent fighting. Farming an easy
  zone for fast kills earns no more than pushing at the front, and a wall zone no less.
- A character behind the party still counts up to the party level (`catchGap` 18): a new recruit
  catches up in minutes (T11).
- Away XP (`offlineXp` 1, was 0.75) is given in 40 steps, so its price follows the levels gained
  while away (one lump priced at the starting level bought only a few levels).
- At the level cap XP banks up to `bankLv` 25 levels (was 1), spent the moment you promote: a long
  absence is never lost behind a cap, and promoting after a night away is a big moment.
- Past level `compLv` 80 each level needs x`compXp` 1.12 more XP, up to x`compXpMax` 200 (from level
  127). Region 2 is a few levels a day.

So the zone curve past the first half hour is: levels a day x power per level / ln(HP per zone).
Power per level is about x1.094 (growth 1.06, a drill x1.1 every 5 levels, x1.5 a rank). The HP
curve only has to match it: `hpGrowth` 1.46 (zones 12-27) and `hpLate` 1.22 past the bend at 27
(about 2 levels a zone).

## 5. Changes (before -> after)

### Damage ramp (owner: "damage ramps so fast")

| What | Before | After |
|---|---|---|
| Companion power per level (`ROSTER_TUNE.growth`) | x1.08 | x1.06 |
| Per promotion (`rankX`) | x2 | x1.5 (texts read it) |
| Drill every 5 levels between promotions (`stepEvery`, `stepX`) | none | x1.1 |
| One rank of 25 levels, all in | x13.7 | x9.4 |
| Blade (`PACE.bladeX` every `bladeEvery`) | x2 every 25 | x1.5 every 25 (text reads it) |
| Blade cost growth (`HERO_UPS` blade `r`) | x1.14 a level (x27 per 25) | x1.18 (x63 per 25) |
| Hero damage per level (`PACE.heroLv`) | +5% (linear) | +4% (the level-up toast reads it) |
| Gear tier power (`TIER_POW`) | 10 / 28 / 70 / 160 / 360 (tier 5 = x36 tier 1) | 10 / 22 / 42 / 75 / 130 (x13); affix rolls scale with it |
| Promotion gold (`promoGold`) | 60 x mobGold(cap / 3) | 60 x (rank + 1) foes of your max zone (x0.5 Commons, x0.25 when a whole rank behind the party) |
| Promotion essence tier | rank + 1 (Starlit for rank 5: walled Region 1 at level 125) | rank, at most tier 4 (`promoTierLag`, `promoTierMax`) |

### Pace (`PACE`)

| Knob | M6 | BAL1 | Why |
|---|---|---|---|
| `hpEarly`, `early` | none | x1.95 a zone up to zone 12 | zones 1-6 in minutes, then T1's 30 min |
| `hpGrowth` | 1.48 | 1.46 | zones 12-27 |
| `bend` | 30 | 27 | |
| `hpLate` | 1.29 | 1.22 | about 2 companion levels a zone |
| `regionStep` | x5 / x2.5 | x1.7 / x1.2 | the level-200 cap is the end of today's power, so the Region 2 boss must not need the last levels |
| `compLv` / `compXp` / `compXpMax` | 90 / 1.2 / 80 | 80 / 1.12 / 200 | the day-2+ curve |
| `essTier` (Starlit) | from 36 | from 42 | Starlit gear is a mid-Region 2 step instead of a burst after zone 35 |
| `farmSecs` | none | 20 | idle income never stalls (see 6) |

### Recruits (`ROSTER` routes, `UNLOCK_TUNE`)

Prices in gold are now foes' worth (`kills` x a normal foe's gold at the gate zone, `foesGold`), so
they follow the curve. Every how line is built from the tuned values.

| Who | Before | After |
|---|---|---|
| Tobin | zone 3, free | zone 8, free |
| Wren | zone 2 + 120 | zone 8 + 30 foes' gold |
| Hesketh | zone 3, free | zone 11, free |
| Pip | zone 4 + 1.1K | zone 12 + 60 foes |
| Bram | from zone 3, 60 Oak | from zone 10, 80 Oak |
| Maren (Rare) | from zone 4, 40 Glowing | from zone 16, 30 Radiant |
| Aldric (Rare) | 15 Renown + 25K | 25 Renown + 150 foes of zone 16 |
| Kestrel (Rare) | zone 12 + 30K | zone 18 + 200 foes |
| Tavern | visitors from zone 6; Vesper, Grenna from 18 | from 16; Vesper, Grenna from 31 (gold in foes) |
| Isolde (Epic) | tokens from zone 30 | from 29 |
| Vesper (Epic) | Renown 60 | Renown 90 |
| Elowen (Legendary) | zone 48, 2T gold | zone 54, 3000 foes of zone 54, 20 Blazing |
| Caedmon (Legendary) | Region 1 + 80 Renown | Region 1 + 250 Renown |

### Camp (`CAMP_TUNE`), checked with `--days`

Building gold 600 -> 60 x level foes' worth at the gate zone (the old value was 40 minutes of
income for the first build), row-1 materials x0.6. The first build (the Watchtower) lands at
17-36 minutes, the full camp on day 21-24 (Ranger: the Map Room waits on Soft Hide, which the sim
does not walk back for). Timers were checked and left as they are: the full camp is limited by
materials and trophies, not by timers.

## 6. Other BAL1 changes

- **Synergies matter** (`SYN_TUNE.today` 0.1 -> 1). Texts now show what you get: an active
  synergy's percentages are scaled by its strength (Common Cause, Bond), and if `today` is ever
  lowered the texts follow it; thresholds ("below 50% HP") are never scaled. Line-ups with every
  one of 9 (zone 20) or 14 (zone 40) recruits at the same level (warden hero): the best synergy
  line-up (Wren, Bram, Kestrel: Hedgefolk + Mark and Leap + Hunting Party) deals x2.96 its raw
  damage at zone 20 and x3.16 at zone 40, 2.6x / 2.3x the average random line-up (x1.74 / x1.69,
  kits included). At zone 40 it beats the best raw line-up (Kestrel, Vesper, Isolde) by x1.03.
  autoField still picks by raw power, so a player who plans the field is ahead of the sim.
- **Class auras deal their damage** (they were text only): Lanternmage casters +30%, Ranger
  strikers +10% crit chance and +50% crit damage (`SYN_TUNE.auras`).
- **T10 drills**: every 5 levels between promotions a character finishes a drill (x1.1 damage,
  `drill` event, a quiet toast). Fielded companions level together, so promotions cluster every
  25 levels; drills put a smaller step every 5. Measured: a roster step every 8-12 minutes early.
- **Transmute-down chains**: units made by breaking down cannot be broken down again
  (`S.craft.tmd`), so one tier-5 unit gives 2 tier-4, not 16 tier-1.
- **Next Up craft goal**: suggests the next tier of an item the hero can wear (`CRAFT_FITS` via
  `fits`, `canCraft`, `kindName`; never the legacy Sword or Helm) and opens the Craft tab with that
  recipe focused (`#forgeBtn`).
- **Idle income never stalls** (55-pace.js): with auto-progress on, a zone whose normal foe would
  take more than `farmSecs` (20s) drops to the highest farmable zone with one toast ("Your party
  fell back to Zone 31 to keep earning."), on load and during play, and climbs back one zone at a
  time while the next is easy. `awayGains` farms the best farmable zone at most `S.zone`.
- **Class weapon paths**: with the flatter tiers and time-based levels, gear no longer decides the
  race (the Warden's Smithing head start is gone: T3 1.05). The sim's classed heroes no longer fall
  back to the legacy Sword; the WIP experiment of gating class weapons on Smithing was measured
  and dropped (it widened the gap for the Workbench classes).

## 7. Save compatibility

No stored value is lowered or deleted, and no field is renamed. New fields: `S.pace.fell`,
`S.craft.tmd` (defaults `0` and `{}`). What changes for a live save: formulas. Companions keep
their levels and XP (XP above the old cap now banks up to 25 levels), their power per level and
rank is lower, gear tiers give less, and zones have a different HP curve (early zones harder,
Region 2 easier). A save parked at a zone it can no longer farm falls back (item above) instead of
earning nothing. Recruits already on the roster stay.

## 8. Open items for the coordinator

- **D1 fails (18-19, target 20-26).** With the sim's install bug fixed, day 1 is 1.5h of play and
  one 6h fight gap. The evening push is power-limited at about continuous 2.5h. Tried: away XP x1-2,
  XP bank 15-50 levels, `hpGrowth` 1.40-1.48, earlier Radiant essence, earlier Rares, `compLv` 85:
  D1 stayed 17-20 while T2 or P1 left their bands. Either accept about 19, or treat the morning
  away gap as fighting in the policy.
- **P3**: Region 3 still needs new power (ranks past 7, tier 6). The level-200 cap now lands just
  past the Region 2 boss (zone 73-77 by day 45).
- **autoField ignores synergies**: planning the field is worth up to x1.5-2.6 damage.
- **Warden aura** (tanks +40% health, +20 armour) still waits for party combat, so the Warden has
  no party damage aura; T3 is in band without it.

## 9. Retuning after merges

| Symptom | Knob |
|---|---|
| T1 30m too fast | `hpEarly` (1.95), or later first recruits |
| T1 1h-3h / T2 | `ROSTER_TUNE.xpSecs` (5; higher = slower levels), `hpGrowth` |
| Region 1 boss too early / late | `regionStep[0]` (1.7), `compLv` (80) |
| Region 2 too fast / slow | `compXpMax` (200), `hpLate` (1.22) together |
| Empty check-ins in Region 2 | `hpLate` down with `compXpMax` down (more zones and levels a day) |
| Recruits | `ROSTER` route `zone`/`kills`, `UNLOCK_TUNE` (`from`, `kills`, Renown) |
| More away hours (Watchtower, Codex) | companion XP is mostly away XP: raise `compXpMax` |

## 10. Stage C: party combat (2026-09-28)

Party combat (59-combat.js, 59b-enemies.js) is on for every save. Knobs: `COMBAT_TUNE` (59-combat),
`ENEMY_TUNE` (59b); try them with `--combat k=v` / `--enemy k=v`. `--targets` now also runs the party
combat targets (party-and-classes.md 9: T4-T9, T11-T14, T18) with fixed line-ups (`--lineup ids`).

### How the pace was kept

- **Damage stays anchored to today's formulas.** A companion swings at its role speed for
  `charDps x (1 - abF) / speed`; its signature ability, on a real cooldown, deals the rest as a burst
  (`charDps x abF x cooldown`), so average damage is unchanged whatever the cooldown. The hero keeps
  `heroSwing`. Overkill on one pack foe carries to the next (a pack is one old foe split three ways).
- **A pack is one old foe for the economy.** Pack HP and gold are `packHp` / `packGold` (1.2, spec) of
  one foe; `kill` fires once per pack (bounties, drops, bestiary, companion XP keep their pace);
  `S.kills` and `S.totalKills` count packs. Companion XP per kill is x`packHp` (56-roster `killWorth`).
- **Supports heal instead of the damage stand-in** (`supEq` is gone from damage; it still ranks them
  for autoField). autoField fields a support only when the party could not hold its max zone without
  one (`fieldSupport` 2), so early parties keep their damage.
- **Survival scales with the party**: HP and heals use the geometric mean of a member's power and the
  party's average (`hpPow`, clamp 0.15-6x), so the zone curve (set by damage) and survival stay in step.

### Knobs (spec -> tuned)

| Knob | Spec | Tuned | Why |
|---|---|---|---|
| `atk` (foe hit, x mobHp) | 0.12 | 0.006, softer below zone 12 (`easeZone`, `easePow` 1.5) | this game's mobHp curve is not 1.55^z; tuned so the push zone holds (T5 0 wipes) and a party without a support wipes a zone or two higher |
| `armourX` (physical vs armoured) | 0.5 | 0.85 | 0.5 cost physical classes 20-40% to zone 15 (T3) |
| `lmSplash` (Lanternmage splash) | 0.5 | 0.15 | 0.5 made the Lanternmage 0.73 of the median (T3) |
| `packHp` / `packGold` | 1.2 | 1.2 | one foe (1.0) ran T2 to 25 |
| `heal` (support heal / s, x power) | 1.2 | 0.8 | T6: a support worth 2-4 zones of hold |
| `estSafety` | - | 1.25 | the hold estimate keeps headroom for elite and spore-heavy packs |
| `awayRate` (away share of the estimate) | 0.75 | 0.75 | same as before (P2 30-34) |
| `bossGate` / `bossWait` | - | 1 / 600s | auto-challenge only when the boss would die in the timer (T7 54%, was 22-33%) |
| `SYN_TUNE.real` | - | 0 | Mark and Cleave as real hits cost 10-20% pace (a mark on a third of a foe dies with it); the averages stay until C4 shows packs |
| Elder Wraith heal (`wraithHeal`, `wraithEvery`) | 20% / 10s | 10% / 12s | every region boss (35, 70) is a Wraith; 20% pushed P1 past day 8 |
| Boss timer | 45s | 30s (unchanged) | 45s would move every boss earlier |

### What the sim shows (`--targets`, seed 1, after the Stage C merge)

T1 9/12/18 (all four classes), T2 22-24, T3 0.92-1.13, T10 10-12m, P1 day 5.3-7.3, P2 day 28-34,
T5 0 wipes, T7 54%, T8 0.89, T9 1.13 / 1.30, T13 100%, T14 99%. Misses: D1 18-19 (accepted in BAL1),
P4 Warden 4 (BAL1 had Lightkeeper 5; noisy by a check-in), T16 Lanternmage Epic day 4.3 (band 2-4),
T4 35% (edge of 20-35), T6 no-tank 0 zones lower (no-support 3), T11 25 min (BAL1's slower catch-up),
T12 attrition line-up does not reach zone 20 in 4h, T18 zone 5 in 3.7-5 min (the BAL1 early curve is
faster than the spec's 6-12). See the Stage C report for the follow-ups.
