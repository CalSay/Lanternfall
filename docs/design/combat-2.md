# Active Combat 2.0 (CB2)

Status: design spec CB2 for Core 2.0 ([plan-4.md](plan-4.md) section 2, built in slice **S6**, with the data S1
needs), written 2026-09-28. It fills in what the shared rulebook [core-2.md](core-2.md) leaves to CB2
(core-2 9.1): enemy numbers, foe sizes and families, elite trait numbers, boss kits, dodge and parry windows,
active rewards and the stage rules for big packs. It builds on party combat (`59-combat.js`, `59b-enemies.js`,
`59c-deepwell-combat.js`), [formation.md](formation.md) (a party of three), [pinnacles.md](pinnacles.md) (the
telegraph grammar and fairness caps), [deepwell.md](deepwell.md) and [region-2.md](region-2.md). CL1
([classes-2.md](classes-2.md), being finished in parallel) writes the class kits and Finishers into core-2's ability shape; this file only
refers to them through core-2 ids. All numbers are starting values for `tools/sim.mjs` (BAL3). The ratios,
ids and rules are the design.

Owner asks this spec answers (plan-4 2.1-2.4, 2.7, 2.10; wave-log 2026-09-28):

- "Enemies, and definitely bosses, must hit harder." Normal packs about 2-3x today; a boss kills an
  unprepared party in about 30-40 s at its intended power.
- "Active combat beyond parry, much more fun and rewarding, especially dungeons and raid fights."
- "Bosses become special": phases, a signature buff item set in the body that always drops, a themed unique.
- Elite traits (yes). Bigger packs (3 / 5-6 / 8-10) with a zoom step, smaller swarm sprites, less clutter.
- Tactics later ("tower defense vibes"). Idle zones stay idle. **Idle kills are never punished.**

Design rules:

1. **Idle stays whole.** Every active mechanic has an idle answer: an automatic version at lower strength,
   a line-up that answers it, or (from S7) a Tactics rule. An idle player earns at least what they earn on
   HEAD at the same farm zone. Active play adds on top: it is never the price of keeping up.
2. **One thumb, one verb.** The stage tap does the right thing for what is showing (a Finisher, a parry, a
   dodge, an interrupt, else the class tap). Abilities sit on one or two big buttons. Nothing ever needs a
   precise tap on a small sprite.
3. **One answer at a time.** Two warnings that need the player never overlap (pinnacles 3.2). A second one
   waits.
4. **No one-shots.** Every hit has a cap as a share of the target's max HP (section 1.4). Only piled-up misses
   lose a fight.
5. **Missing costs time, never progress.** A failed boss costs its attempt. A wipe in a farm zone falls back
   one zone (today's rule). Nothing is ever taken away.
6. **Readable at 360 px.** Every warning has a word, a shape and a colour. Bars and numbers show only where
   they change a decision (section 2.6).
7. **The rulebook rules.** Ids, formulas, caps and the stacking order are core-2's. Where this file needs
   something core-2 does not have, it is a proposed change-log line (section 8.2), not a quiet addition.

---

## 0. Why (what the build does today, measured)

Measured on HEAD (`63db291`) with a probe harness on the shipped core (`tools/lib/core.mjs`), fixtures in
`tests/fixtures`, each party at its `partyHoldEstimate` zone, 240 s of auto-play, seed 7:

| Fixture (party) | Zone | Pack clear | Party HP lost per pack | Boss with endless HP: party lasts |
|---|---|---|---|---|
| `save-v2` (Warden, Wren, Pip) | 5 | 0.8 s | 0% (the early-zone ease) | 240 s+ (never falls) |
| `save-mid-v2` (Warden, Tobin, Wren) | 13 | 5.1 s | 5.7% | 240 s+ |
| `save-v2-late` (Warden, Tobin, Wren) | 38 | 6.0 s | 2.6% | 144 s |
| `save-v3-four` (Ranger, Aldric, Wren) | 34 | 2.5 s | 2.5% | 240 s+ |

What that means:

- **Nothing threatens a party that holds its zone.** A pack costs 2.5-6% of the party's HP; the 15% heal
  between packs (`packHealF`) refills it. A zone boss deals 0.4-1.1% of party HP a second, so an idle party
  survives 2-4 minutes, far past the 30 s timer. The only real fail is the timer (a damage check).
- **Packs are always 3** (`COMBAT_TUNE.packSize`, `FOE_MAX` 6, stage slots `FOE_X` for 1-3 foes).
- **One active verb.** The tap parries a boss's heavy hit (last 0.8 s of a 1.5 s wind-up; earlier = half
  damage), interrupts a Marsh Wraith's heal channel, and is otherwise the class tap. Auto-taps fire every 2 s
  after 4 s idle at `autoEff` 0.5.
- **Bosses have 2 mechanics:** the heavy hit plus one per Elder (split, dive, adds, faster heavy, cloud,
  6x heavy, self-heal). No phases, no cast bars, no stagger, nothing that fills the screen.
- **Every foe shows a bar and every hit shows a number** (a pool of 24 foe floats, per-foe gold floats).
  Fine for 3 foes, cluttered for 10.

With the pack attack x2.5 and the boss attack x6.5 (the starting values in 1.1), the same probe gives: packs
cost 6-6.5% of party HP at zone 34-38 (the mid fixture's hold estimate drops from zone 13 to 11: the hold
estimate reacts as it should), and an unprepared party falls to a boss in **28 s** (Ranger, one tank, no
healer) to **49 s** (Warden with a second tank). That is the 30-40 s band, before any new mechanic. It also
shows the one-shot risk: the Elder Golem's 6x heavy hit takes **44%** of Aldric's HP and **65%** of Wren's.
Section 1.4 caps that.

---

## 1. Enemy damage and HP

### 1.1 The knobs (all in `COMBAT_TUNE` / `ENEMY_TUNE`; BAL3 tunes)

| Knob | Today | Core 2.0 start | What it means |
|---|---|---|---|
| `atk` | 0.025 | **0.0625** (x2.5) | A normal foe's hit = `atk` x `mobHp(z)` x its `FOE_BEH.atk`. Packs hit 2.5x harder |
| `bossAtk` | 0.75 | **1.95** (boss hits x6.5 today's) | Boss hit = zone attack x `bossAtk` |
| `easeZone` / `easePow` | 12 / 1.5 | 12 / 1.5 (kept) | Zones under 12 hit softer, so the first hour stays gentle |
| `packHp`, `packGold` | 1.2 / 1.2 | 1.2 / 1.2 (kept) | The pack is still one old foe's economy (core-2 6.1) |
| `swarmHp`, `swarmPay` | - | **1.25 / 1.25** (new) | Swarm packs total 25% more HP and pay 25% more gold and XP (section 2.2, Q10) |
| `eliteHp`, `eliteGold` | 2 / 2 | 2 / 2 (kept) | An elite is x2 its share |
| `armourX` | 0.85 | **0.8** | "Armoured" foes cut 20% of physical (core-2 1.2 lets CB2 pick 15-25%) |
| `bossHp` (PACE) | 8 | **12** for zone elders, **16** for region bosses | x1.5 and x2 to match the longer timers (1.5): the same party damage beats them in the same share of the timer |
| `bossT` | 30 s | **45 s** zone elders, **60 s** region bosses | The boss timer, now an **Enrage** timer (1.5) |
| hit caps | - | 0.35 / 0.15 / 0.10 | No one-shots (1.4) |

The attack knobs raise damage everywhere at once. What keeps pacing is not softer foes but the new sources of
survival that S1-S5 bring: armour and resist lines on weighted gear, `ward`, shields, Guard, the Priest and
Warden kits, Judgement healing, and type resists against a region's hit type. BAL3's job in S6 is to set `hp`
(the role HP scales) so a **recommended** line-up holds within one zone of HEAD (target CX2, 1.6), while a
line-up with no tank or no healer holds clearly lower.

### 1.2 Damage per region

Each foe hits with a **damage type** (core-2 1.4: "Region foes hit with their region's types"). That needs one
data field per foe, `FOE_BEH[k].dt` (proposed change 8.2-4), next to `fam` and `size`. Resists (`res*`) and
armour (physical) answer it.

| Region (zones) | Pack damage at the farm zone, recommended line-up | Hit types (share of pack damage) | Boss: unprepared party falls in | Boss timer (Enrage) |
|---|---|---|---|---|
| **1 The Hollow** (1-35) | 6-10% party HP per pack (easeZone under 12) | physical 70%, poison 20% (Spore Cap, Slime), frost 10% (Wraith) | 38-42 s (the gentle end of the band; it is the first boss wall) | 45 s; the Listener 60 s |
| **2 The Sunken Coast** (36-70) | 8-14% | physical 50%, frost 35% (sea: Deckhand, Kelp, Witch), poison 15% (Jelly) | 33-38 s | 45 s; the Drowned Keeper 60 s |
| **3 The Emberwaste** (71-105) | 10-16% | fire 55%, physical 45% | 32-36 s | 45 s; the Pyre Knight 60 s |
| **4 The Pale Reach** (106-140) | 12-18% | frost 55%, physical 30%, holy 15% (LORE-R45 confirms) | 30-35 s | 45 s; region boss 60 s |
| **5 The Long Stair** (141-175) | 12-18% | poison 30%, fire 30%, frost 20%, physical 20% (the deep takes every colour) | 30-34 s | 45 s; region boss 60 s |

"Party HP per pack" is the damage a pack deals over its life as a share of the party's summed max HP, after
armour and reductions, at the zone `partyHoldEstimate` gives. Today it is 2.5-6%; the target is 2-3x. It
rises by region because later regions add elite traits (section 5) and harder behaviours, not because `atk`
changes per region.

**Region 1 hit types by foe:** Moss Slime poison (it is a plant), Cave Bat physical, Rattlebones physical
(arrows), Barrow Beetle physical, Spore Cap poison, Quarry Golem physical, Marsh Wraith frost (a cold
marsh-spirit). **Coast** (region-2.md 4): Shinglecrab physical, Stormgull physical, Drowned Deckhand frost,
Kelp Strangler physical, Lanternjelly poison (its sting; the Chain Shock is a poison sting in 2.0), Brine
Witch frost, Coral Warden physical. Regions 3-5 take their foes' types from LORE-R45; the table's shares are
the target the foe list must meet.

### 1.3 Pack HP

- **Totals do not change** for brute and normal packs: `packHp` x one old foe, split across the members by
  size (2.2). The economy unit stays the pack (core-2 6.1).
- **Swarms** total `swarmHp` 1.25x and pay `swarmPay` 1.25x gold and XP (Q10, 8.1). For a single-target party
  the gold a second stays about the same (25% more HP, 25% more pay; overkill carries inside a pack, so no
  hit is wasted on a small foe). For an area party (Warlock, Trapper, Reaver cleaves, Burn spreads, Pip,
  Oriel) the gold a second rises, because area damage hits every member at once. Target CX8.
- Elites are x2 their share (`eliteHp`, kept). Traits add their own effect (5.2), never more HP.

### 1.4 Hit caps (no one-shots)

After armour, resists, reductions and block, before shields:

| Hit | Cap (share of the target's max HP) |
|---|---|
| A telegraphed hit (`heavy`, `slam`, `zone`, `line`, `dive`, a boss `sig` that lands) | **35%** per hit (pinnacles 3.4 kept) |
| A boss's plain swing | **15%** |
| A pack foe's plain swing (brute, normal) | **10%**; a swarm foe **4%** |
| Damage over time on one member, all sources | **5%** a tick (core-2 3.1) |
| An Explosive elite's blast | **20%** |

- The cap is applied in `cbHitUnit` from the hit's kind (one `Math.min` per hit), so it costs nothing.
- Caps are asserted from the data by `tools/check.mjs` (8.5) and watched in the sim (`CB_STATS.maxOver` of
  the party side, new).
- Caps make the boss attack knob honest: a boss kills through pressure (several answered and unanswered hits
  in a row) rather than one big number. The sim tunes `bossAtk` with the caps on.

### 1.5 Bosses: the damage target and the timer

**The target (core-2 6.2):** an **unprepared** party at the boss's **gate power** falls in **30-40 s**.

- **Gate power** = the party power at which the boss dies in exactly its timer with idle auto-play and the
  planner's line-up (today's `cbBossReady` rule with `bossGate` 1).
- **Unprepared** = idle auto-play, no Tactics, no counter to the boss's damage type or kit, the planner's line-up
  for the zone (not the boss). **Prepared** = the same power with a counter type or resist, a tank and a
  healer, or Tactics, or active play.
- The formula CB2 tunes to is core-2's: `boss damage per second = Σ party EHP / 35 s` for the reference
  unprepared party, `EHP = maxHP / (1 - damage reduction)`. Each boss's `atk` (in its kit row) is set so
  that holds, with the caps on.

**The timer becomes an Enrage (answers Q12).** Keeping a 30 s fail timer next to a 30-40 s kill target would
make the damage meaningless: an unprepared party at gate power would always win at 30 s, just before it
fell. So:

| Rule | Zone elder | Region boss (the Listener, the Keeper, ...) |
|---|---|---|
| Timer | **45 s** | **60 s** (region-2.md 7 already gives the Keeper 60 s) |
| Boss HP | x1.5 today (`bossHp` 12) | x2 today (`regionBoss` 1.33 on top of `bossHp` 12) |
| At 0 | **Enrage**: an `enrage` warning, then the boss attacks 50% faster and deals +10% more each second | the same |
| Fail | at timer + 15 s, or a wipe: "The zone boss held its ground." (today's toast and `bossFail`) | the same |

- The HP rises with the timer, so the **damage a second needed to win is today's**. A prepared party beats a
  zone elder at the same power as on HEAD (pacing kept, target CX4). An unprepared party at that power falls
  at about 35 s, before it can land the kill at 45 s: it needs about 1.3x the power (1-2 zones), or a tank
  and a healer, or a few taps.
- Everything that reads `bossTime` keeps working: the Almanac's Short Fuse (-10 s), the constellation that
  adds seconds, the Warrior's Shield Wall pause (now: it holds the Enrage back 3 s; CL1 asked, 8.1 Q12), the
  secret `s_close` (a kill with under 1 s left before the Enrage). The header bar reads "Enrage in 0:12".
- **Auto-challenge** (`cbBossReady`) adds a survival test: it starts a boss when the kill fits the timer **and**
  the estimate says the party lives 10% longer than the kill takes (`partyHoldEstimate` gives the sustain
  numbers today). The existing 600 s `bossWait` retry stays, so an idle player is never walled by a careful
  estimate.
- **Deepwell Elders** have no timer (Oil is the clock). **Pinnacles** keep 90 s with their own Enrage at 70 s.
  **The raid** has no timer (6.2).

### 1.6 Sim targets for BAL3 (S6)

New sim flag `--cbtap idle|good|perfect` (like pinnacles' `--pintap`): **idle** taps nothing (auto-taps,
auto-cast, auto-Finisher); **good** parries 60% of heavy hits, dodges 60% of zones (half of them perfect),
interrupts 50% of `sig` casts it can reach with a charge, takes the Finisher prompt within 1 s, casts
abilities into Stagger when one is due within 3 s; **perfect** answers everything in the best window.
`--cbharness <fixture> --boss <type> --power <zone>` runs 50 seeded boss fights and prints wins, median time,
time to fall with endless boss HP, and each mechanic's cost.

| Id | Target | Band |
|---|---|---|
| CX1 | Pack damage at the farm zone, recommended line-up (tank + support + the class), `--cbtap idle` | 8-20% of party HP per pack (Region 1: 6-12%); today 2.5-6% |
| CX2 | Hold zones: the recommended line-up | within ±1 zone of HEAD at 2 h, day 1 and day 7, every class (pacing kept) |
| CX3 | Hold zones: no tank, or no healer | 4-6 zones under the recommended line-up (BAL2 had 2-4 / 3-4) |
| CX4 | Boss gate: a prepared idle party | beats each zone elder at HEAD's first-kill power +0 to +1 zone; region bosses' first-kill days within ±10% of the P2 bands |
| CX5 | Boss damage: an unprepared party at gate power, endless boss HP | falls in 30-40 s (median of the 7 elders of each region; each elder 25-45 s) |
| CX6 | Skill matters: `good` vs `idle`, same line-up | first kills 1-2 zones of power earlier (region bosses 0.5-1.5 days earlier); `perfect` vs `good` 0.5-1 zone |
| CX7 | Idle is never punished | idle gold an hour at the farm zone ≥ 97% of HEAD, every class; idle XP an hour ≥ 97% |
| CX8 | Swarms | area-heavy parties +15-30% gold a second at swarm zones vs normal zones; single-target parties within ±5% |
| CX9 | No one-shots | no hit above its cap (1.4) in any run; `maxOver` on the party side ≤ 0.35 |
| CX10 | Active rewards | `good` earns the active bonus (6.6) on ≥ 80% of boss kills; `idle` on 0% |
| CX11 | Stagger rhythm on a 45 s zone elder | `idle` 1 Stagger (0-2), `good` 2-3, `perfect` 3-4 |
| CX12 | Deepwell | idle median floor within ±2 of HEAD; `good` +3 to +6 floors |
| CX13 | Raid | idle raid damage an hour ≥ HEAD for every class; `good` +15-30% |
| CX14 | Elite traits | an elite with a trait never adds more than 40% to its pack's clear time for an unprepared party, and 10% or less with its counter |
| CX15 | Performance | section 2.8 |
