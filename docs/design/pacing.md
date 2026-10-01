# The Lantern Road: pacing (M6, retuned by BAL1 and BAL2)

Status: BAL2 (roles matter in party combat, section 11) on top of BAL1 (the slower pace the owner
asked for) and M6. Owners of the knobs: `PACE` in
`src/js/40-rules.js`, `ROSTER_TUNE` in `56-roster.js`, `UNLOCK_TUNE` in `56c-unlocks.js`,
`CAMP_TUNE` in `57-camp.js`, `SYN_TUNE` in `56b-synergy.js`. Check with
`node tools/sim.mjs --targets` (about 6 minutes on 4 cores; `--days 60` for the 60-day report). Try values without editing with
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
- ~~A character behind the party still counts up to the party level (`catchGap` 18): a new recruit
  catches up in minutes (T11).~~ Removed by CU1 (section 13): a hero behind the party earns the XP
  of its own level.
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

## 11. BAL2: balance after party combat (2026-09-28)

Goal (plan-2 wave 1, coordinator): roles must matter (T6, T12) without making balanced play harder;
keep T1-T3, T10, P1, P2 passing; fix T16, P4, T11, T18; the sim's Ranger walks back for Soft Hide
(C1); a 60-day report. Tuned on the merged build with the line-up planner (56d-autofield.js) on.

### What changed in the model

- **Foes hit harder** (`COMBAT_TUNE.atk` 0.006 -> 0.025, a quarter of the spec's 0.12). Sustain now
  binds a zone or two above the push zone, so a missing tank or healer costs zones: a balanced
  party holds about 2 zones past its push zone, a no-tank one 1 below, a no-support one 2 below.
  Bosses keep their Stage C size (`bossAtk` 2.5 -> 0.75: at 2.5 x 0.025 the heavy hit one-shot
  squishies and the Lightkeeper stalled at zone 41 with every companion down).
- **Tanks shrug off hits** (`tankDr` 0.4, new): a tank takes 40% less on top of its armour. With
  healing absolute (a support heals x its power), a striker in front was almost as good as a tank;
  now a tank's effective HP is about 3x a striker's.
- **Supports Smite** (`ROSTER_TUNE.supDps` 0 -> 0.7): a support hits the focus foe for 0.7 x its
  power a second (magic; a striker deals about 1.8 x). It is part of `charDps`, so `totalDps`, the
  boss gate, the estimate and the raid all see it. Healers still heal first; the Smite is extra.
- **The Lightkeeper's aura** ("Supports in your party heal 40% more") now also makes their Smite
  40% stronger (a char modifier in 59-combat, `lkAura`); the aura text says so. The attrition
  line-up (Lightkeeper, Tobin, Hesketh, Elowen) kills fast enough to reach zone 20.
- **Between packs** a member heals 15% of max HP (`packHealF` 0.1 -> 0.15): no-support line-ups
  held 5 zones lower on some saves (spec 2-4).
- **The hold estimate** (59-combat) counts support ability heals (Mend, Call to Arms, Sanctuary,
  Verse, the Lightkeeper's auto-cast Rally Hymn) as a share of the target's max HP per cooldown,
  and its safety margin is gone (`estSafety` 1.25 -> 1): with the harder foes it walled pushes the
  live party held (live damage taken and healing matched the estimate within 10-20% on probes at
  zones 9-72). `estEff` 1 -> 1.08 (T8 read 0.81-0.87 after the planner merge); the boss gate
  (`cbBossReady`) no longer uses `estEff`, so auto-challenge timing is unchanged.
- **Push retry after a wipe** (`pushRetry` 60 s, new): the party climbs back when the estimate says
  it holds, or tries again after 60 s (doubling with each wipe at that zone, up to 8 min). Before,
  a pessimistic estimate could park a party a zone below its best for 15 minutes.
- **Early zones** are harder and zone 12 on is unchanged (`hp0` 40 -> 80, `hpEarly` 1.95 -> 1.83):
  zone 5 takes 6-8 minutes with the starter (T18; was 3.7-5.1).
- **Catch-up** (`catchGap` 18 -> 35, `catchStep` 0.2 -> 0.6, `catchMax` 1 -> 3): a level-1 recruit
  reaches party level - 5 in 7-9 minutes (T11; was 25).
- **The runaway at 2-3h** (T2: the planner fields Wren, Bram and Kestrel's Hunting Party the moment
  Kestrel joins, and catch-up makes her strong in minutes): `xpSecs` 5 -> 5.5, `hpGrowth` 1.46 -> 1.48,
  `compLv` 80 -> 75, Kestrel's route zone 18 + 200 foes -> zone 20 + 300 foes.
- **Region 2** (`compXpMax` 200 -> 250, `regionStep` [1.7, 1.2] -> [1.7, 1.1]): levels past 124 cost a
  little more; the zone 70 boss needs 9% less, so a caster-heavy party at the level-200 cap is not
  walled there for ever (the Lanternmage sat at zone 70 from day 22 to day 45 in one run).
- **Recruit timing** (T16, calendar-sensitive): Vesper visits from zone 30 (was 31: the slowest
  class missed her first visit by one zone, Epic on day 4.3-5.3), Grenna visits from 33 (was 31)
  and the Dusk Contract rolls from zone 31 (was 29) (the fastest class got an Epic on day 1.8),
  Elowen's quest from zone 57 (was 54; Legendary on day 12.3-13.8).

### Knobs (before -> after)

| Knob | Before | After |
|---|---|---|
| `COMBAT_TUNE.atk` | 0.006 | 0.025 |
| `COMBAT_TUNE.bossAtk` | 2.5 | 0.75 |
| `COMBAT_TUNE.tankDr` | - | 0.4 |
| `COMBAT_TUNE.packHealF` | 0.1 | 0.15 |
| `COMBAT_TUNE.estSafety` | 1.25 | 1 |
| `COMBAT_TUNE.estEff` | 1 (also in the boss gate) | 1.08 (estimate only) |
| `COMBAT_TUNE.pushRetry` | - | 60 s (x2 per wipe, at most x8) |
| Support ability heals in the estimate | no | yes (`AB_HEAL`) |
| `ROSTER_TUNE.supDps` | - (supports 0) | 0.7 |
| Lightkeeper aura on supports | heal x1.4 | heal and Smite x1.4 |
| `ROSTER_TUNE.catchGap` / `catchStep` / `catchMax` | 18 / 0.2 / 1 | 35 / 0.6 / 3 |
| `ROSTER_TUNE.xpSecs` | 5 | 5.5 |
| Kestrel's route | zone 18 + 200 foes | zone 20 + 300 foes |
| `PACE.hp0` / `hpEarly` | 40 / 1.95 | 80 / 1.83 (zone 12 HP unchanged) |
| `PACE.hpGrowth` | 1.46 | 1.48 |
| `PACE.compLv` | 80 | 75 |
| `PACE.compXpMax` | 200 | 250 |
| `PACE.regionStep` | [1.7, 1.2] | [1.7, 1.1] |
| `UNLOCK_TUNE.visitors.vesper.from` | 31 | 30 |
| `UNLOCK_TUNE.visitors.grenna.from` | 31 | 33 |
| `UNLOCK_TUNE.tokens.isolde.from` | 29 | 31 |
| `UNLOCK_TUNE.quests.elowen.from` | 54 | 57 |

Tried and dropped: `atk` 0.035 (continuous runs 20-30% slower), `bossAtk` 1.5 (Region 2 boss wipes
caster parties at the level cap), `supDps` 0.5 (attrition 1.38-1.64 x balanced) and 0.8, Elder Wraith
heal 5% (Region 1 boss on day 3.3-3.8), `hpGrowth` 1.5 and `xpSecs` 6 (T2 unchanged, T1 2h at 14-16),
a Lanternmage hero with more HP or armour (no change: the hero is about 1% of party damage by day 8).

### Sim changes (tools/sim.mjs)

- **C1**: a Camp build short only of a fight-only material (Soft Hide for the Map Room) walks back
  to the zone of that tier that drops it best, every other fight cycle. The Ranger's camp is full on
  day 20-22 (was 48 of 53, never full).
- The Morwen quest bench (no support for the zone 33 boss) now fields the planner's best
  non-support line-up; before it left a party of two, which wiped 170 times over 8 days once foes hit
  harder.
- `--snapday D:path` writes the save at the end of day D (debugging); `--targets --days 60` runs
  the targets on 60 days of normal play.
- Checks: the Hesketh check now wants a soft Smite (damage above 0, below Wren's) instead of none.

### Targets before -> after (`--targets`, seed 1)

| Target | Before (Stage C build) | After |
|---|---|---|
| T1 | 9/11-12/18 each | 9/11/19, 8/11/19, 9/11/17, 8/12/18 |
| T2 | 24 / 22 / 22 / 24 | 24 / 24 / 21 / 23 |
| T3 | 0.92-1.13 | 0.97-1.02 |
| T4 | 35% (FAIL) | 23% |
| T5 (wipes at maxZone - 2) | 0 (zone 16) | 0 (zone 17) |
| T6 (no tank / no support) | 0 / 3 lower (FAIL) | 3 / 4 lower |
| T7 | 54% | 45% |
| T8 | 0.89 | 0.96 |
| T11 | 24.7 min (FAIL) | 8.6 min |
| T12 attrition / glass / caster | attrition never reached zone 20 (FAIL) / 0.93 / 0.85 | 1.20 / 0.87 / 0.92 |
| T13 | 100% | 100% |
| T14 | 99% | 99% |
| T16 | LM Epic day 4.3 (FAIL) | first 20-28m, Rare 1.7-1.9h, Epic day 2.3-2.8, Legendary day 15.3-19.8 |
| T18 | 3.7-5.1 min (FAIL) | 6.3-8.2 min, 0 wipes |
| D1 | 18-19 (FAIL, accepted) | 17-19 (FAIL, accepted) |
| P1 | day 5.3-7.3 | day 5.3-7.3 |
| P2 | day 28-34 | day 21.3-28.3 |
| P4 | Warden 4 (FAIL) | 1-3 |
| Total | 12/20 | 19/20 |

Seed 2 reads 16/20: D1, T4 38%, and the Lanternmage at P1 day 9.3 with its first Epic on day 5.3.
The Lanternmage is the laggard in normal play: the planner scores push line-ups by pack damage,
where casters' splash counts, and fields Morwen, Pip and a healer; the zone 35 boss is single
target, so the party is 20-30% short of it for a day or two. The fix belongs in the planner (weigh
single-target damage when a zone boss is next), not in the pace.

### 60 days of normal play (`--days 60`, seed 1)

| Class | d1 | d3 | d7 | d14 | d21 | d28 | d35 | d60 | Region 1 / 2 boss | Camp full |
|---|---|---|---|---|---|---|---|---|---|---|
| Warden | 19 | 30 | 35 | 49 | 59 | 70 | 74 | 75 | day 7.3 / 28.3 | day 23 |
| Lanternmage | 18 | 31 | 37 | 53 | 70 | 75 | 75 | 75 | day 6.3 / 21.3 | day 20 |
| Ranger | 17 | 30 | 35 | 51 | 59 | 69 | 73 | 73 | day 7.3 / 28.3 | day 22 |
| Lightkeeper | 19 | 35 | 40 | 49 | 59 | 69 | 73 | 73 | day 5.3 / 28.3 | day 21 |

Every class hits the level-200 roster cap at zone 73-75 around day 30-35; after that most check-ins
are empty (P3 needs Region 3 power: ranks past 7, tier 6).

### Open items

- The planner's boss blind spot above (the Lanternmage, P1 and its Epic on some seeds).
- T4 reads 23-38% by seed (band 20-35%): active parries and Shield Wall count for more now that
  foes hit harder.
- The planner's field flaps between two line-ups every few seconds in continuous runs (for
  example Wren, Bram, Anselm and Wren, Bram, Pip); each switch rebuilds the units.
- `AF_TUNE.bossTank` (35%) stays: with bosses at their Stage C size a Front tank still matters
  for the heavy hit.
- Save compatibility: no stored field is added, renamed or lowered; only formulas change.

## 12. GP1: gathering and crafting skill pace (2026-09-28)

Owner (2026-09-28): "The resource gathering levelling is too fast... the next tier up only being 4
levels away is too fast." Earlier: a slower pace overall. Knobs: `SKILL_TUNE` in `src/js/20-data.js`
(one table). Measure with `node tools/sim.mjs --report skills [--days 30] [--focus 200]`; try values
with `--eval "SKILL_TUNE.nodeReq[3] = 60"`.

### 12.1 The knobs (before -> after)

| Knob (`SKILL_TUNE`) | Before | After | Reads it |
|---|---|---|---|
| `nodeReq` (gathering tier gates, `NODE_REQ`) | 1 / 8 / 18 / 30 / 45 (gaps 7, 10, 12, 15) | 1 / 14 / 30 / 64 / 112 (gaps 13, 16, 34, 48) | `skillTopTier`, `skillTierOpen` (40-rules) |
| `stationReq` (crafting tier gates, `SMITH_REQ`, `CRAFT_STATION_REQ`) | 1 / 4 / 9 / 16 / 25 (gaps 3, 5, 7, 9) | 1 / 10 / 22 / 36 / 54 (gaps 9, 12, 14, 18) | the same; `stationTierOpen` (55-crafting) |
| `gatherNeed` (XP for the next gathering level) | 25 x 1.12^(lv-1) | 10 x lv^2.2 | `skillNeed(lv, k)` |
| `craftNeed` (the same for the 4 stations) | 25 x 1.12^(lv-1) | 7 x lv^0.5 x 1.04^(lv-1) | `skillNeed(lv, k)` |
| `nodeXp` (XP a swing at a tier-t node) | 6 x t^1.6 (6/18/35/55/79) | 7 x t (7/14/21/28/35) | `nodeXp`, `nodeXpFor` |
| `spdPerLv` (gathering speed per level) | +2% | +2% (unchanged: old saves gather exactly as fast as before) | `nodeTime` |

Why these shapes. A power curve (`lv^2.2`) instead of the old exponential: with an exponential curve
and tier XP that jumps x2-3 at each new node, the level gaps between tiers shrink at the top (no
exponential fit gave widening gaps with tier 2 near an hour). The flatter tier XP (`7 x t`) keeps
the jump at a new node a treat (x2 at tier 2, x1.2 by tier 5) instead of a skip past the next gate.
Crafting uses a gentle curve that counts crafts: a player who crafts and upgrades one set per tier
opens the next tier (about 8 tier-1 crafts for tier 2, a tier-2 set with upgrades for tier 3). The
small exponential tail (1.04) stops a heavy re-roller's level (and so its rarity odds,
`rarityWeights`) from running away: 4M XP is level ~180, not ~1000.

### 12.2 Focused skill time (`--report skills`, part A)

Hours of one gathering skill's own time, fresh save, always at the best open node. "Tooled" gets a
Common tool of each tier the moment it opens; "rough" never has one; "away" gathers only through
`awayGains` in 4h trips (the node is picked when the trip starts). Tool mastery counts. Mining,
Woodcutting and Foraging read the same (one curve).

| Mode | Tier 2 | Tier 3 | Tier 4 | Tier 5 | Level at 10m / 30m / 1h / 3h / 10h | Longest level gap, first 30 min |
|---|---|---|---|---|---|---|
| Before, tooled | 1m | 3m | 7m | 18m | 37 / 52 / 61 / 73 / 85 | 2m |
| Before, rough | 2m | 4m | 10m | 30m | 30 / 44 / 53 / 65 / 77 | 2m |
| Before, away (4h trips) | 4h | 4h | 4h | 4h | (all at the end of the first trip) | - |
| After, tooled | 50m | 5.2h | 30h | 105h | 8 / 11 / 15 / 24 / 40 | 7m |
| After, rough | 1.1h | 7.2h | 46h | 182h | 7 / 10 / 13 / 21 / 34 | 7m |
| After, away (4h trips) | 4h | 12h | 52h | 188h | - | - |

Levels still come often early: 8 levels in the first 10 minutes, 11 by 30 minutes (one every 2-3
minutes, never more than 7), then they slow: about 20 minutes a level just before tier 3, an hour
before tier 4, 1.5-2 hours before tier 5 (focused, tooled).

### 12.3 Normal play (`--report skills --days 21`, part B)

The day each skill opens tiers 2 / 3 / 4 / 5 (day 0.3 = install at 08:00 on day 1; `-` = not within
the run), seed 1, the `--days` check-in policy with its away gathering.

Before (all 7 skills opened every tier in the first 1-3 days):

| Class | Mining | Woodcutting | Foraging | Smithing | Woodcraft | Tailoring | Enchanting |
|---|---|---|---|---|---|---|---|
| Warden | 0.3/0.3/0.4/1.3 | 0.3/0.4/0.5/0.5 | 0.3/0.4/0.8/1.8 | 0.3/0.3/0.4/0.5 | 0.4/0.4/0.8/1.3 | - | 0.4/1.3/1.3/- |
| Lanternmage | 0.3/0.4/0.5/0.5 | 0.3/0.3/0.8/2.3 | 0.3/0.3/0.4/1.5 | 0.3/0.3/-/- | 0.3/0.3/0.8/- | 0.3/0.3/0.8/1.3 | 0.3/0.4/0.8/- |
| Ranger | 0.3/0.5/0.5/0.5 | 0.4/0.4/0.8/1.5 | 0.3/0.4/0.8/2.3 | 0.4/0.4/0.5/1.8 | 0.4/0.4/0.8/1.8 | 0.4/0.4/1.3/1.8 | 0.6/1.3/1.8/- |
| Lightkeeper | 0.3/0.4/0.8/2.3 | 0.4/0.6/1.3/2.5 | 0.3/0.3/0.5/0.5 | 0.3/0.4/0.8/2.3 | 0.6/1.3/2.5/2.8 | 0.3/0.3/0.4/1.3 | 0.6/1.6/2.3/- |

(The before run was 3 days long; Mining was level 86-89 on day 3.)

After:

| Class | Mining | Woodcutting | Foraging | Smithing | Woodcraft | Tailoring | Enchanting |
|---|---|---|---|---|---|---|---|
| Warden | 0.5/2.5/6.5/16.5 | 1.5/3.5/9.5/15.5 | 4.5/4.5/-/- | 0.3/0.8/1.5/2.3 | 0.8/2.8/5.3/10.5 | - | 1.5/3.5/8.5/- |
| Lanternmage | 1.5/2.8/8.5/13.5 | 0.5/2.5/5.5/14.5 | 9.5/9.5/-/- | 0.3/0.6/0.8/2.3 | 0.3/1.6/2.8/4.5 | 1.3/1.5/4.3/4.3 | 0.5/2.8/3.5/8.6 |
| Ranger | 12.5/12.5/14.5/20.5 | 0.5/2.5/6.5/19.5 | 1.5/2.8/10.5/- | 0.3/0.6/1.3/3.3 | 0.3/1.6/1.8/3.3 | 0.5/1.6/2.8/2.8 | 0.5/2.5/3.5/- |
| Lightkeeper | 0.5/4.5/6.5/17.3 | 2.5/4.8/12.5/16.5 | 1.5/3.5/8.5/- | 0.3/0.6/1.5/2.5 | 0.6/4.5/5.8/14.3 | 0.8/1.6/3.5/4.8 | 2.5/5.3/11.5/- |

Gathering levels on days 1 / 3 / 7 / 14 / 21 (the class's main skill): Mining (Warden) 25 / 39 / 66 /
98 / 143; Woodcutting (Lanternmage) 25 / 43 / 71 / 103 / 151. Before, Mining was 71 on day 1 and
about 104 on day 21 (Lanternmage, old build); by day 21 the new curve is past the old level, so late
gathering speed is not lower than before, only reached later.

Against the targets (the skill a class gathers most; the policy spends 2-2.5 h a day on it, most of
it away): tier 2 on the first away trip (day 0.5-1.5; 50 min of focused, tooled play, target 45-60
min), tier 3 on day 2.5-3.5 (target 2-3), tier 4 on day 5.5-9.5 (target 6-8), tier 5 on day 13.5-17.3
(target 14-20). A skill the class rarely needs lags (the Ranger mines little: Mining tier 2 on day
12.5), which is fine: it opens when that player starts to use it.

Crafting: the stations a class crafts at open tier t a little before its gathering skills do
(Smithing tier 5 on day 2.3-3.3, Woodcraft and Tailoring for the Lanternmage and Ranger on day
2.8-4.5), because the sim re-rolls and upgrades a lot (smithing reaches level 60 on day 3). Materials
of tier t only come from gathering tier t (or a rare find), so the gathering gates pace the gear; a
station gate matters for a player who crafts one set per tier, and for a station a class seldom uses
(the Warden's Enchanting tier 4 on day 8.5). The heavy crafter's levels are about as fast as before
(Smithing 67 on day 3, 55 before), so rarity odds did not jump.

### 12.4 Save rule (55-skillpace.js)

Players keep their skill levels and XP. A save that predates GP1 stores, once, the highest tier the
old gates gave each skill (`S.skillPace.hw`), and every gate reads max(the new rule, that mark):
`skillTopTier(k)`, `skillTierOpen(k, t)`, `stationTierOpen(kind, t)`. A new game keeps nothing. One
What's new line tells a player who keeps a tier above the new gates. `tools/check.mjs` (skill pace)
proves no fixture loses a node tier, a recipe tier, an Enchanting tier or an item, through a save
and load and a later `loadSave()`. The fixtures keep: save-v2, save-a-v1 and save-mid-v2
Woodcutting and Smithing tier 2; save-v2-late Mining, Woodcutting and Smithing tier 5.

### 12.5 Targets (`--targets`, seed 1): before -> after

17/20 -> 17/20, the same three misses as before GP1.

| Target | Before | After |
|---|---|---|
| T1 30m/1h/2h | 8/11/19, 8/11/17, 9/11/18, 7/11/18 | 8/10/16, 8/11/16, 9/11/16, 9/11/17 (gear tiers later: 2h zones 1-3 lower, still in band) |
| T2 3h | 24/23/22/23 | 21/19/21/20 |
| T3 | 0.93-1.01 | 0.99-1.04 |
| T4 | 29% | 31% |
| T16 (FAIL before and after) | Epic d2.3-4.3, Legendary d17.3-23.5 | Epic d2.8-4.8, Legendary d16.8-23.8 |
| D1 (FAIL, accepted in BAL1) | 19-20 | 17-19 |
| P1 (FAIL before and after) | day 6.3-8.3 | day 6.3-8.3 |
| P2 | day 22.3-35.3 | day 22.8-33.8 |
| P4 | 1-2 | 2 |
| C1 camp full | day 21-24 | day 23-30 (the Ranger and Lightkeeper wait on tier-4/5 camp materials) |
| T5-T14, T18 | pass | pass |

Tried and dropped: `nodeXp` 6 x t (T1 Lightkeeper 2h zone 14), craft curve base 10 (T4 37%: early
Smithing levels feed rarity, and the idle run fell behind), `nodeReq[3]` 58 (tier 4 on day 4.5),
exponential gathering curves (the gaps shrink at the top).

### 12.6 Sim changes

- `--report skills` (parts A and B above; `--focus H`, `--days N`, `--json 1`).
- The `--days` JSON carries `skTier` (the day each skill opened each tier), `skGather` (live and
  away seconds per gathering skill) and skill levels per day.
- A station too low for the next set piece now gathers for its training craft one tier down (a
  player would; before GP1 the gates were too low for it to matter). Without it the Lanternmage never
  foraged and Tailoring stayed at tier 1 for three weeks.
- P4: a gathering tier that opens counts as a meaningful upgrade (new nodes), like a gear tier.
- The policy gates on `skillTierOpen` / `skillTopTier` instead of `NODE_REQ` levels.

## 13. CU1: no rapid catch-up for heroes (2026-09-28)

Owner: "They shouldn't have rapid catch-up XP either. We could have an achievement for maxing out
all heroes and that shouldn't be spoonfed." (The bench already earns no XP: `benchXp` 0.)

### Knobs (before -> after)

| Knob | Before | After |
|---|---|---|
| `ROSTER_TUNE.catchGap` (par counted up to the party level for a hero behind it) | 35 | removed |
| `ROSTER_TUNE.catchStep` / `catchMax` (+XP per level behind the party) | 0.6 / 3 (up to +300%) | removed (`catchUpBonus()` is always 0) |
| `ROSTER_TUNE.catchPromo` (promotion price a rank behind the party) | 0.25 | removed (full price) |
| `ROSTER_TUNE.gapMax` (par at most this far above the hero) | 4 | 4 (kept: the natural rule) |
| `ROSTER_TUNE.commonXp` | 1.5 | 1.5 (a rarity trait, not a catch-up) |
| Planner `by: 'potential'` (56-roster `potential`, 56d `withLevels`) | lifted every candidate to the party level and rank | real level and rank (same as `'now'`); `afRealPow` stays null |

A hero behind the party now earns the XP of its own level. The natural effect stays: past `compLv`
(75) each level costs x1.12 more, up to x250, so a low hero gains levels much faster than the pair
in the same fight. The auto line-up never fields a level-1 recruit over a strong pair; fielding one
to train it is the player's choice. The anti-flapping rules (6% gain, 300 s dwell, no return within
10 min) are unchanged.

### T11 redefined

Was: a level-1 recruit fielded at zone 20 reaches party level - 5 in 5-10 min.

Now: **levelling a new hero takes real play.** (a) Continuous: a level-1 recruit fielded at zone 15
needs at least 60 min to reach party level - 5 (the fork stops at 90 min; zone 20 is no longer
reached in the 3h runs). (b) Normal play (`--train 3`): a hero recruited at the first check-in
after day 3 and fielded in place of the lower-level member reaches the pair's level of that
moment within **1-5 days** of being fielded.

Measured (seed 1): continuous, Kestrel L1 -> L29 in 90 min (target L56); normal play, Thessaly
reaches the pair (L116-120) in 4.0 / 5.0 / 4.0 / 4.0 days (Warden / Lanternmage / Ranger /
Lightkeeper). Levels 1-75 go in under a day of normal play; the rest is the paceXp curve.

T18 (starter only, zone 5 in 6-12 min) runs with the roster off and has no catch-up in it; it is
unchanged (it fails on the Lightkeeper at 5.8 min, as before CU1).

### The Full Company Feat (all 18 at Lanternborn, rank 7)

Rank 7 needs level 175 (the rank 6 cap). Levels 1-175 cost about 15,000 level-1-equivalents of XP
(75 + ~2,400 for 76-124 + 50 x 250 for 125-174); a fielded hero earns about 600-650 a day in
normal play (the pair reached L200 around day 30-35). 13 non-Commons plus 5 Commons (x1.5 XP) is
about 380 fielded hero-days, 2 at a time: **about 6-7 months** of normal play (was a few weeks of
rotation with catch-up). The Feat's "3-5 months" text (23-data-deeds.js, achievements.md) should
read "6+ months" or the level 125+ multiplier (`compXpMax` 250) should come down for the Feat to
stay at 3-5 months; not changed here (owner's call).

### Targets before -> after (`--targets`, seed 1; the branch was already 13/22 before CU1)

| Target | Before | After |
|---|---|---|
| T1 | 8/11/16, 8/11/17, 10/12/17, 8/10/17 (FAIL) | 8/11/16, 8/11/14, 10/12/14, 8/11/13 (FAIL) |
| T2 | 19-20 | 17-19 |
| T3 | 0.95-1.07 | 0.88-1.07 |
| T4 | 32% | 37% (FAIL) |
| T6 | 3 / 5 lower (FAIL) | 2 / 2 lower (PASS) |
| T8 | 1.17 (FAIL) | 1.02 (PASS) |
| T11 | n/a (FAIL) | see above; the continuous leg read n/a in that run (zone 20), fixed to zone 15 after it |
| T16 | Epic d2.3-5.3 (FAIL) | Epic d3.5-5.3 (FAIL) |
| P1 | day 5.3-9.3 (FAIL) | day 7.8-10.3 (FAIL) |
| P2 | day 24.6-37.3 | Warden 30.8, Lightkeeper 42.3; Lanternmage and Ranger never (zone 69-70 at day 45) (FAIL) |
| P4 | 1-3 | 3 / 28 / 31 / 13 (FAIL: the stall at the zone 70 wall) |
| Total | 13/22 | 12/22 |

### Open: progress without recruits (coordinator decision)

The fielded pair plus promotions no longer carries Region 2. With no catch-up the planner keeps
the first pair it had (in the sim usually the starter and a Common, fielded before the Rares
arrived), and two Commons at the level-200 cap cannot beat the zone 70 boss (the stall F3 saw).
P1 slips about 2 days and P2/P4 fail for the Lanternmage and Ranger. Options:

1. Retune Region 2 for a Common pair at the cap (zone 70 boss and `hpLate`), so recruits are never
   required (the brief's rule); Rares/Epics then make it faster.
2. Make the sim player invest: when the fielded pair is capped (level 200, or a rank cap it cannot
   pay), field the benched hero with the highest ceiling. A real player would, but it means
   recruits are required for Region 2.
3. A small, fair rule for a hero far behind (e.g. gapMax counts from the pair's level down to
   gapMax x 2 behind), kept well short of the old catch-up.

Save compatibility: no stored field is added, renamed or changed; only formulas and knobs.

## 13. C10a: the owner's early-pacing targets (2026-10-01)

Owner: "Gold gain is way too low atm. Getting to hearth 2 is too long. Getting to level 14 of each resource gathering
also takes a while." Targets set on issue #11, all three heroes:

| | Before | Target | After |
|---|---|---|---|
| Hearth 2 built and Tam's first shift | about a day (9,000 gold, 120/100/30 materials, 2 h build) | about 30 min | **30-32 min** (sim, mixed policy, seed 1; 33-35 min on seeds 1-3 with a 5 min build) |
| Gold an hour, zones 1-20 (kills and bounties) | Wren 10.6K, Tobin 5.8K, Pip 8.7K in the first hour | about double | **Wren 18.9K, Tobin 12.0K, Pip 13.2K** (x1.5-2.1; exactly x2 a minute of fighting) |
| One gathering skill, level 1 to 14 (grade 1) | 26 min of gathering | about half | **13 min**; levels 14 and up unchanged |

Knobs:

- `CAMP_HEARTH[2]` 20 Pine, 20 Copper, 5 Dim Essence, 2 min build; `ECON.hearthH[2]` 0.05 hours (110 gold). Gate stays zone 10.
- `ECON.early` `{ x: 2, full: 20, end: 35 }`: `mobGold` (kills, offline kills, bounty pay) x2 to zone 20, easing to x1 at the
  Region 1 boss. Prices stay on the base curve, so early prices halve in effect; gold still rises into Region 2.
- `SKILL_TUNE.gatherEarly` `{ below: 14, x: 0.5 }`: gathering levels 1-13 need half the XP.

Sim fixes found on the way (`tools/sim.mjs`):

- The fight policy never built camp stations but the cold Hearth trip still sent the hero to gather for them, so Wren
  stalled at zone 5 for the rest of the run. Now it builds them, as the guide's player does.
- Trips skipped Hide, which counted as gatherable once Hunting added Hide nodes, though Hunting is still off
  (`craftNodeEnabled`).
- `hearthTrip`: like a player, the hero gathers what the next Hearth is short of as soon as its zone is reached.

Measure: `node tools/sim.mjs --hours 1 --policy mixed --class ranger|warden|lanternmage --seed 1`.
`tools/check.mjs` section "C10a pacing" holds the targets.
