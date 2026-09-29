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
survival that S1-S5 bring: armour and resist lines on weighted gear, `ward`, shields, Guard, the Lightkeeper and
Warden kits, Judgement healing, and type resists against a region's hit type. BAL3's job in S6 is to set `hp`
(the role HP scales) so a **recommended** line-up holds within one zone of HEAD (target CX2, 1.6), while a
line-up with no tank or no healer holds clearly lower.

### 1.2 Damage per region

Each foe hits with a **damage type** (core-2 1.4: "Region foes hit with their region's types"). That needs one
data field per foe, `FOE_BEH[k].dt` (proposed change 8.2-4), next to `fam` and `size`. Resists (`res*`) and
armour (physical) answer it.

| Region (zones) | Pack damage at the farm zone, recommended line-up | Hit types (share of pack damage) | Boss: unprepared party falls in | Boss timer (Enrage) |
|---|---|---|---|---|
| **1 The Hollow** (1-35) | 6-12% party HP per pack (softer under zone 12) | physical 70%, poison 20% (Spore Cap, Slime), frost 10% (Wraith) | 36-40 s (the gentle end of the band: the first boss walls) | 45 s; the Fenmother 60 s |
| **2 The Sunken Coast** (36-70) | 8-14% | physical 50%, frost 35% (sea: Deckhand, Kelp, Witch), poison 15% (Jelly) | 33-38 s | 45 s; Silas the Fogbound 60 s |
| **3 The Emberwaste** (71-105) | 10-16% | fire 55%, physical 45% | 32-36 s | 45 s; the Pyre Knight 60 s |
| **4 The Pale Reach** (106-140) | 12-18% | frost 55%, physical 30%, holy 15% (LORE-R45 confirms) | 30-35 s | 45 s; region boss 60 s |
| **5 The Gloamvale** (141-175) | 12-18% | poison 30%, fire 30%, frost 20%, physical 20% (the deep takes every colour) | 30-34 s | 45 s; region boss 60 s |

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

| Rule | Zone elder | Region boss (the Fenmother, the Fogbound, ...) |
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
| CX10 | Active rewards | `good` earns the active bonus (3.8) on ≥ 80% of boss kills; `idle` on 0% |
| CX11 | Stagger rhythm on a 45 s zone elder | `idle` 1 Stagger (0-2), `good` 2-3, `perfect` 3-4 |
| CX12 | Deepwell | idle median floor within ±2 of HEAD; `good` +3 to +6 floors |
| CX13 | Raid | idle raid damage an hour ≥ HEAD for every class; `good` +15-30% |
| CX14 | Elite traits | an elite with a trait never adds more than 40% to its pack's clear time for an unprepared party, and 10% or less with its counter |
| CX15 | Performance | section 2.8 |

---

## 2. Packs

### 2.1 Sizes and families per foe

Core-2 6.1 fixes the size ids (`brute` 3, `normal` 5-6, `swarm` 8-10) and 2.3 the families. CB2 places every
foe (data fields `FOE_BEH[k].size`, `.fam`, `.dt`; the last is proposed in 8.2-4):

| Foe | Region | `size` | Members | `fam` | Hit `dt` | Row | Pack behaviour quota (2.3) |
|---|---|---|---|---|---|---|---|
| Moss Slime | Hollow | `normal` | 6 | `plant` | poison | Front | - |
| Cave Bat | Hollow | `swarm` | 9 | `beast` | phys | Mid | 2 divers at a time |
| Rattlebones | Hollow | `normal` | 5 | `undead` | phys | Mid | 2 get back up (the rest stay down) |
| Barrow Beetle | Hollow | `brute` | 3 | `beast` | phys | Front | - |
| Spore Cap | Hollow | `normal` | 5 | `plant` | poison | Back | 1 spore cloud per 6 s for the pack |
| Quarry Golem | Hollow | `brute` | 3 | `construct` | phys | Front | unchanged: each Golem slams on its 3rd hit |
| Marsh Wraith | Hollow | `normal` | 5 | `spirit` | frost | Back | 1 heal channel at a time |
| Shinglecrab | Coast | `brute` | 3 | `beast` | phys | Front | each shells once, one at a time |
| Stormgull | Coast | `swarm` | 8 | `beast` | phys | Mid | 2 Snatches at a time |
| Drowned Deckhand | Coast | `normal` | 5 | `drowned` | frost | Front | 1 Undertow at a time |
| Kelp Strangler | Coast | `normal` | 5 | `drowned` | phys | Mid | 1 Bind at a time |
| Lanternjelly | Coast | `swarm` | 8 | `drowned` | poison | Back | 1 Chain Shock per 3 s for the pack |
| Brine Witch | Coast | `normal` | 5 | `drowned` | frost | Back | 1 Hex channel at a time |
| Coral Warden | Coast | `brute` | 3 | `construct` | phys | Front | - |

- **Every region has 2 brutes, 3 normal and 2 swarm types** as the guide for LORE-R45's Regions 3-5 foe lists
  (the Hollow has 4 normal types and 1 swarm, the bats; the Coast fits the guide). Swarms are small,
  quick things: bats, gulls, jellies, rats, wisps, embers, moths.
- **Normal packs are 5 or 6** by type (the table), fixed per type so a zone always looks the same.
  Swarms are 8-10: 8 by default, 9 for the bats, 10 only for Region 4-5 swarms.
- **Mixed packs** (`mixP` 0.72, today's rule): the pack takes the zone type's size. Up to a third of the
  members come from the next type of the region cycle, each taking one member's share. A **brute never mixes
  into a swarm** and a **swarm never mixes into a brute pack** (two size steps apart); in those zones the pack
  is pure. A brute mixed into a normal pack takes 2 members' shares and counts as 2 members.
- **Elites:** at most 1 per pack in Regions 1-3; from Region 4, 2 in `normal` and `swarm` packs (core-2 6.1).
  `eliteP` 0.2 per pack from zone 15 (today); from Region 4 the second elite rolls at 0.1.
- **Champions** (55-gathering) stay the lead's roll, as today.

### 2.2 Shared pack totals

```
tot    = mobHp(z) x packHp x mod('foeHp') x (size === 'swarm' ? swarmHp : 1)
member = tot / n x (0.9 to 1.1) x (brute-in-normal ? 2 : 1)      n = members (a brute-in-normal counts 2)
gold   = mobGold(z) x packGold x (swarm ? swarmPay : 1) / n      per member (paid on its death, as today)
xp     = ceil(1.5 x z x packHp) x (swarm ? swarmPay : 1)         on the lead (as today)
kill   = once per pack (the lead), as today; S.kills and S.totalKills count packs
```

- **Overkill carries** to the next foe (today's rule), so a single big hit is never wasted on a small foe.
- **Gold floats merge:** each foe still pays when it dies (so gold ticks up during a pack), but the stage
  shows one "+123g" per pack at the clear, not one per foe (2.7).
- **The boss's adds** pay nothing (today) and are not a "pack" for sizing: a boss and its adds are drawn with
  the boss rules (2.5).

### 2.3 Behaviours in a big pack (quotas)

A behaviour that is fine on one foe in three becomes a wall on six. So behaviours run as **pack cadences**,
not per member: the pack keeps one timer per behaviour, and each time it fires, one eligible member does it.

| Behaviour | Today (per foe) | 2.0 (per pack) |
|---|---|---|
| Dive (Cave Bat, Stormgull Snatch) | every 10 s each | every 5 s, 1 diver; at most **2 diving** at once |
| Spore cloud | every 6 s each | every 6 s for the pack (1 cloud) at the pack's cloud strength (x1.5 when 3+ Spore Caps stand) |
| Heal channel (Marsh Wraith) | every 5 s each | 1 channel at a time; the next starts 2 s after the last ends |
| Reassemble (Rattlebones) | once each | the first 2 that fall get up; the rest stay down |
| Slam (Quarry Golem) | every 3rd hit each | unchanged (brutes are 3) |
| Undertow, Bind, Hex, Chain Shock | per foe | 1 at a time for the pack |
| Shell Up (Shinglecrab) | once each at 50% | once each, one shell at a time |

Quotas are data (`FOE_BEH[k].quota`, CB2's field, no save), so a region can tune them.

### 2.4 Spawn rhythm

- **Arrival:** a new pack walks in from the right edge while the last one's death animation plays (inside
  today's `respawn` 0.45 s). Members enter in 3 groups 0.15 s apart (front column first), so ten sprites never
  pop in on one frame. Reduced motion: they appear in place, in the same 3 groups.
- **First swings** are spread over 0.6-2.0 s (today 0.6-1.4 s), so ten foes never land their first hits on
  one tick.
- **Respawn** stays 0.45 s between packs. Pack cadence is unchanged, so gold a minute is unchanged for the
  same kill speed (CX7).
- A foe acts only once it has fully arrived (`born` ≥ 0.3 s, as the stage already hides foes under 0.1 s).

### 2.5 The stage: columns, depth and the zoom step

**Columns.** The foe side keeps its Front, Mid and Back columns (`row` 2 / 1 / 0; party reach is formation.md
1.1, unchanged). A big pack fills them several deep:

| Pack | Layout on the foe side |
|---|---|
| 1 (boss) | the boss at its big size; adds stand in front of it, up to 4 |
| 3 (brutes) | today's 3 slots (`FOE_X` [0.62, 0.76, 0.9]) |
| 5-6 | 3 columns, 2 deep; each rear rank stands 10 logical px up and 8 px back, drawn first and dimmed 10% (the party's old two-lane look) |
| 8-10 (swarm) | 3 columns, 3-4 deep, rear ranks up and back as above; small sprites (below) |

Each column's members are ordered by HP so the lowest-HP member stands in front (it is the one melee reaches,
and the eye goes to it).

**The zoom step.** The stage picks its zoom from a width floor (`pickZoom`, `ZOOM_W` 272 / `ZOOM_WT` 216
logical px). The floor rises for swarms:

| Pack on the field | Width floor x | On a 360 x 740 phone (DPR 2) |
|---|---|---|
| Brutes, normal packs, a boss with up to 2 adds | x1 (today) | zoom 1.5 (240 logical px wide), as today |
| Swarms, a boss with 3+ adds | **x1.4** | **zoom 1** (360 logical px wide): one step out |

- The step is chosen **per zone** from the zone type's size (and per boss fight from its kit), not per pack,
  so it never flips between packs of one zone. Mixed packs in a swarm zone stay zoomed out.
- The change happens at a **zone change or a boss start**, where the scene already resets (`sceneReset`);
  the new pack walks in at the new zoom. No tween (pixel art must land on whole pixels), no extra rebakes
  beyond today's zoom-change text rebake.
- Wide and landscape stages usually need no step (their floor already fits); the rule is the same.

**Swarm sprites are half size.** Swarm foes draw from a **1x bake** (1 art px = 1 logical px) instead of the
B1 2x bake, so they stay on whole pixels and read as "many small things". At the zoomed-out step on a phone a
bat is about 12-16 CSS px across and the party members about 70 CSS px tall, so the party stays the thing you
read first. Elites in a swarm draw from the 2x bake (they stand out by size as well as by their mark).

### 2.6 Bars and chips (less clutter)

| On the field | Bar | Chips |
|---|---|---|
| **Focus foe** (the one the party hits, `mob`) | full bar over its head (today's `foeHud`) | its statuses (up to 4 badges, core-2 3.1 shapes, stack digits) |
| **Elites and champions** | full bar with the violet or gold edge, plus up to 2 **trait badges** (5.1) | statuses, as the focus |
| **Boss** | its bar in the header (today), plus the **stagger bar** and **cast bar** (3.3, 3.4) | statuses in the header row |
| **Other pack members** | **no bar** | at most **1** badge each: the most important of Stun, Root, Burn, Curse, Mark (in that order); no timers |
| **The pack** | **one pack bar** in the foe header: the pack's name and count ("Cave Bats · 6 of 9") and the summed HP | - |
| **Threat** | a pip only on a foe that is hitting a non-tank (the one that matters); the red "left the tank" flash stays | - |

- The header's pack bar replaces the lead foe's bar (the header shows the focus foe's name when it is an
  elite or a champion, else the pack's).
- The "Battle HUD" and "Show targets" settings (today's) still turn the stage bars and pips off.
- A foe under a Stagger shows a gold outline; a foe casting shows its cast bar (3.4) even when it is not the
  focus (a cast is always worth seeing).

### 2.7 Damage numbers merge per pack

Today every hit on any foe raises a number (a pool of 24) and each foe's death raises a gold float.

| Number | 2.0 rule |
|---|---|
| Hits on the **focus foe** | shown as today, one per hit, with the type icon in front (core-2 2.1) and `▲` / `▼` for weak / resisted; crits bigger with a `!` |
| Hits, splashes and ticks on **every other foe in the pack** | added into **one pack number** that rises every 0.5 s over the pack's centre, with the icon of the type that dealt the most |
| Status ticks on the focus foe | merged into one number a second (the status tick is already once a second, core-2 3.1) |
| Reactions | the name flashes once over the foe ("Shatter!", "Blight", "Judgement") with its number |
| Gold | one "+123g" at the pack clear |
| Party side | unchanged (C4 already merges per member and kind) |

- **Caps:** at most **6** foe-side numbers alive at once; the oldest fades first (today's rule). At most
  **8 new number sprites baked a second** (`bakeText` is the costly part); over that, a number waits for the
  next pack-number tick.
- The Lightkeeper's party-strike number (`partyAcc`, every 0.6 s) folds into the pack number.

### 2.8 Performance budget (10 foes on a mid-range phone)

The perf budget (perf.md) does not move. Big packs must fit inside it:

| Metric (phone, x4 CPU, 360 x 740, DPR 2) | Budget | Today's reference |
|---|---|---|
| Fight: JS per frame p95 / p99, a swarm of 10 with statuses, Burn spreading and merged numbers | ≤ 8 / 16.7 ms | 6.5 / 12.2 ms with packs of 3 (perf.md) |
| Extra JS per frame vs a pack of 3 at the same zone | **≤ +1.5 ms** p95 | - |
| `combatTick` with 10 foes and 3 members (inside the frame) | ≤ 0.8 ms p95 | - |
| Frame gap p95 | ≤ 34 ms | 28.4 ms |
| Long tasks: pack arrival, zone change with the zoom step, boss phase change | none over 50 ms | - |
| Heap growth | < 2 MB a minute (no allocation per hit, per tick or per pack) | - |

How it stays cheap:

- **Pooled foes.** `FOE_MAX` 6 becomes **12**, and foe records are a fixed pool reused pack to pack (today
  `mkFoe` makes new objects each pack). Threat tables are the pool's `Float64Array(4)`s, zeroed, never remade.
- **One status tick a second** (core-2 3.1) for every foe at once; per-frame work is only timers.
- **Pack cadences** (2.3) mean 10 foes run 1-2 behaviour timers, not 10.
- **Sprites:** swarm 1x bakes are a quarter of the pixels of a 2x bake; every rig is baked lazily and
  prewarmed with `idleTask` on a zone change (today's path). Dimmed rear ranks use `globalAlpha`, no new
  bake. At most **2 draws a foe** (body, and one overlay for an elite trait or a Stagger outline).
- **HUD:** 1 bar (focus) + elites + 1 pack bar, instead of up to 10; badges are cached 5x5 sprites.
- **Numbers:** the caps in 2.7.
- `tools/perf.mjs` gains scenarios `swarm10` and `bossKit` (8.5). Both must pass on HEAD's phone profile
  before S6 merges.

---

## 3. Active mechanics (360 px, one thumb)

### 3.1 The input map

```
+----------------------------------------------+  360 px wide, the Fight view
| [pack or boss header: name, HP, stagger,     |  the boss header adds a 6 px gold stagger bar and,
|  cast name + bar, Enrage in 0:31, pips ●●○]  |  while casting, the cast's name and purple bar
|         [ DODGE  >>  ======|==  ]            |  40 px warning banner, one at a time (pinnacles 3.2)
|                                              |
|   party (Back Mid Front)      foes           |  THE STAGE: a tap anywhere here is the contextual
|                                              |  verb below (at least 240 px tall on a phone)
|                                   ( ab2 56 ) |  ability 2 (after the evolution), 56 px
|                                   ( ab1 64 ) |  ability 1, 64 px, bottom right (thumb zone)
+----------------------------------------------+
```

**One tap, the right verb.** A stage tap resolves in this order (the first that applies):

| # | What is showing | The tap does |
|---|---|---|
| 1 | The **Finisher** prompt (a foe is Staggered, 3.4) | the Lanternbearer's Finisher |
| 2 | A `heavy` warning | in the last 0.8 s: **parry**; earlier: the old half-damage dodge (kept, core-2 6.3) |
| 3 | A `zone` or `slam` warning | in the dodge window: **dodge** (perfect in the last 0.5 s); earlier: a normal class tap and a small "wait" tick on the banner |
| 4 | A cast bar on a **normal foe or elite** (`heal`, `summon`) | **interrupts** it (today's rule for the Wraith's heal) |
| 5 | Anything else | the class tap on the focus foe (CL1's taps) |

The **ability buttons** cast `ab1` and `ab2`. While a boss's `sig` cast bar shows, the button's rim turns
purple ("interrupt now"); while a Stagger or a reaction window is open on the focus foe it turns gold with a
ring counting down ("hit now"). A player can learn the whole system from those two colours and the banner.

- Buttons sit in the thumb zone (bottom right), 64 and 56 px, 8 px apart. A setting **Buttons on the left**
  mirrors them (left thumbs).
- The stage tap never needs aim: it acts on what is showing, or on the focus foe.
- Two answer warnings never overlap (pinnacles 3.2: at least 1.0 s apart; a later one waits up to 3 s, then is
  skipped once). A passive rule (a spore cloud, a Burn) may run alongside; it never needs a tap.

### 3.2 Parry (kept; the result is "Reeling")

| Rule | Value |
|---|---|
| Warning | `heavy`: red "!", the shrinking ring, banner "PARRY" |
| Wind-up | 1.5 s (Maren fielded: +0.4 s lead) |
| Parry window | the last **0.8 s** (Maren +0.3 s; Deepwell Quick Parry +0.4 s; Maud's Lantern power +0.3 / +0.5 s) |
| Parry | no damage. The foe is **Reeling** 2 s: it does nothing and takes +50% (a vuln, proposal 8.2-1). **+25 stagger** |
| Tap earlier | half damage (today's early-tap dodge, kept) |
| Line-up answers (idle) | Shield Wall (blocks a heavy hit on the Lanternbearer; on anyone with Lantern Bastion), Aldric's Shield Bash, a stun on a normal foe or elite |
| Where | every boss (cadence per kit, 8 s default); **new:** brute packs and elites from zone 15 get a pack heavy every 12 s (one at a time), inside the pack damage budget (CX1) |

The pack heavy gives idle zones an optional active moment: a parried brute reels, the pack dies a little
faster. Idle play takes the hit, which is already counted in CX1, so it costs nothing extra.

### 3.3 Dodge

| Rule | Value |
|---|---|
| Warnings | `zone`: a hatched patch on the ground under 1-3 party slots, banner "DODGE" with a double chevron `>>`, orange. `slam`: the same on the Front slot only |
| Wind-up | **1.8 s** (never under 1.2 s, even under Vows or an Enrage) |
| Dodge window | the last **1.0 s** |
| Perfect dodge | the last **0.5 s** |
| Dodge | every member standing in the patch steps out and takes nothing (a 0.2 s sidestep; reduced motion: a snap and a flash) |
| Perfect dodge | as a dodge, plus **Keen** (20% more damage for 3 s, bucket T, core-2 3.1) on each member who stepped out, and **+10 stagger** on the foe that cast it (proposal 8.2-2) |
| A tap before the window | a normal class tap; the banner shows a small "wait" tick. No lock-out, no cost |
| Missed | the kit's hit (usually 2-3x the boss's attack) on each member in the patch, capped at 35% max HP each |
| Line-up answers (idle) | reductions (Shield Wall, Guard, Stand Fast), shields (Lightkeeper, wards, Pearl `ward` lines), resists to the hit's type, a formation that keeps the struck slot empty (the boss sheet shows which slots a kit's zones strike) |
| Where | bosses (from phase 1 or 2 per kit), Explosive elites (5.1), the Deepwell's and the raid's kits |

- **Spamming does not win the perfect.** The first tap inside the window dodges. A player who taps without
  looking dodges at about 1.0 s and never gets Keen. Waiting for the last half second is the skill.
- `line` warnings (every slot: clouds, surges) **cannot** be dodged: they are answered by shields, heals and
  resists. The Coast's tide **Surge** keeps its region-2 rule (a tap is a Brace that halves it; a brace in
  the last 0.8 s blocks it) as a `line` with a Brace tap.
- The pinnacles' **Scatter** is this dodge (8.2-3): the struck cells are the patch; the tap makes the members
  in them step out. The Scatter button in pinnacles.md 8.3 is no longer needed; the stage tap does it.

### 3.4 The stagger bar and Finishers

**The bar.** Bosses have 100 points, elites 60 (core-2 6.4). The boss's bar is a 6 px gold bar under its HP in
the header, in 10 segments. An elite's is a 1-HUD-px gold line under its stage bar, shown only once it has
any fill.

| Fills the bar | Points (core-2 6.4, CB2's picks inside it) |
|---|---|
| A **heavy** hit (Warrior taps, `heavy` abilities, any single hit of 3 P or more) | +5; a unit's heavy hits fill **at most 4 a second** in all (so tap speed alone cannot stagger a boss; proposal 8.2-2) |
| A stun second a boss ignores (a boss is stun-immune, core-2 3.4); on an elite, each stun second it does take | +8 |
| A **parry** | +25 |
| An **interrupt** | +15 |
| A **perfect dodge** | +10 (proposal 8.2-2) |
| A reaction (Blight, Judgement) / **Shatter** | +10 / +20 |
| An ability's `stagger` effect | its value (CL1: Shield Wall 10, Snare Field 15, ...) |
| `stag` (the stat) | +x% to all of the above (cap +50%) |

- After 4 s with no fill the bar drains 5 a second.
- **Full:** the foe is **Staggered** for **5 s** (elites **3 s**): it does nothing, any warning it was showing is
  cancelled (not counted as an answer), a cast is stopped, and it takes **x1.5** (`staggerX`). Each later
  Stagger in the same fight needs 25% more fill (x1.25, x1.5, x1.75, then x2).
- Look: the boss holds its `wind` pose low, with a gold outline; banner "STAGGERED" and "FINISHER" (below).
  Reduced motion: the outline and the banner, no pose change.

**Finishers** (core-2 4.1 `fin`; each class's and evolution's Finisher is CL1's data: 6-10 P, tags `heavy`,
`finisher`).

| Rule | Value |
|---|---|
| Prompt | when a Stagger starts: the banner turns gold, "FINISHER" with a star; the Finisher shape pulses on the foe |
| Fire | the first stage tap during the Stagger (tap priority 1). **One per Stagger**, the Lanternbearer only |
| Damage | CL1's coef x P, x1.5 for the Stagger (`staggerX`); **not** also x1.25 `timingX` (the Finisher *is* the window; proposal 8.2-5) |
| Idle | if nobody taps, it fires by itself **2.5 s** into the Stagger at **50%** (the tap `autoEff`) |
| Tactics (S7) | action `finish` (proposal 8.2-6) fires it at 0.5 s into the Stagger at **80%** |
| Elites | a Staggered elite gets a Finisher too (3 s window; auto at 1.5 s) |
| Hook | `emit('finisher', { key, fin, foe, dmg, auto })`: CL1's riders (Hammerfall's knockback, Red Harvest's Bleed cash-in, Dawnbreak's heal) and unique powers read it |

Heroes have no Finisher; their signatures that land during the Stagger get `timingX` like any ability.

**Rhythm target (CX11).** On a 45 s zone elder: idle gets about 1 Stagger (auto-taps, auto-cast `stagger`
effects, companions' heavy hits, reactions), `good` play 2-3 (parries and perfect dodges add about 3 a
second), `perfect` 3-4. A Warrior or a Warden party staggers most (heavy taps; CL1's Warden +30% stagger).

### 3.5 Interrupts and cast bars

| Cast kind (telegraph id) | Who casts | Bar | Length |
|---|---|---|---|
| `heal` | Marsh Wraith, Brine Witch (self-heal), healer adds | purple bar over the foe, "+" glyph | 1.5 s (High tide Witch 1.0 s: region-2 kept) |
| `summon` | Summoner elites, bosses calling adds | purple bar, "~" glyph; bosses: the cast's name in the header | 2.0 s |
| `sig` | a boss's **signature cast** | the header shows the name ("Kneel", "Spore Bloom") and a purple bar | 2.0-2.5 s (never under 1.5 s) |
| `hard` | a cast that cannot be stopped (phase changes, Enrage, some big moves) | grey bar with a lock glyph | 2.0-3.0 s |

What stops a cast:

| Cast | Stage tap | A Lanternbearer ability that hits the caster | A hero signature | A stun |
|---|---|---|---|---|
| `heal`, `summon` on a normal foe or elite | **yes** | yes | if tagged `interrupt` or it stuns | yes |
| `sig` on a boss | no | **yes** | if tagged `interrupt` | yes: a boss ignores the stun (it fills stagger, core-2 3.4) but the stun still stops the cast (proposal 8.2-7) |
| `hard` | no | no | no | no |

- **An interrupt** skips the attack, gives **+15 stagger** (bosses and elites), and the caster starts that
  cast's cadence again from zero.
- **Every `sig` cast can be interrupted, every time** (Q11, 8.1). The limit is the Lanternbearer's charges:
  `ab1` 20-40 s and `ab2` 12-30 s against a signature every 14-20 s, so the Lanternbearer alone stops about
  half of them. Heroes with an `interrupt` signature and stunners cover the rest, and every kit has at least
  one `hard` cast so interrupts are not the whole answer. Spending a charge on an interrupt instead of
  holding it for a Stagger is the decision.
- A missed `sig` costs what its kit row says, inside pinnacles 3.4's caps (one effect of at most 3 s, or at
  most 8% of the boss's HP healed, or up to 2 adds, or a hit capped at 35%).

### 3.6 Ability timing

- **Windows** (core-2 1.2, 3.5): an ability that lands during a **Stagger** or a **reaction window** (3 s after
  a reaction on that foe) gets `timingX` **x1.25**; in a Stagger it also gets `staggerX` x1.5 (x1.875 in all).
  The two windows do not stack with each other.
- **Showing it:** the ability button's gold rim with a ring that runs down the window's time left; the
  focus foe's outline flashes gold once when a reaction opens a window.
- **Holding a charge:** a ready ability waits on its button and does not fill further. Holding costs uptime;
  x1.875 pays for holding up to about 40% of the cooldown. The button shows "ready" and, if a Stagger is
  close (bar ≥ 80%), a small gold pip: "a Stagger is coming".
- **Auto-cast without Tactics** (Q9, 8.1): full power, at the first valid target, as today. One small smart
  default: if the focus foe's stagger bar is at 90% or more, auto-cast waits **up to 1.5 s** for the Stagger.
  It never holds longer (holding is what Tactics is for).

### 3.7 Idle, line-up and active, mechanic by mechanic

| Mechanic | Idle (auto-play, no Tactics) | Line-up answer | Active answer | Active edge |
|---|---|---|---|---|
| Parry (`heavy`) | takes the hit (capped 35%) | Shield Wall, Bash, stuns | tap in the last 0.8 s | no damage, Reeling 2 s (+50%), +25 stagger |
| Dodge (`zone`, `slam`) | takes the hit (capped 35%) | reductions, shields, resists, an empty struck slot | tap in the last 1.0 s | no damage; perfect: Keen +20% 3 s, +10 stagger |
| Stagger | fills from auto-taps, auto-cast `stagger` effects, heroes' heavy hits and stuns, reactions | a Warrior or Warden, stunners, reaction-makers | parries, perfect dodges, interrupts, heavy taps | about 2-3x as many Staggers |
| Finisher | auto at 2.5 s, 50% | - | tap at once | x2 the idle Finisher, and the full window after it |
| Interrupt (`heal`, `summon`) | auto-cast and signatures stop some by chance | stunners, `interrupt` heroes, area damage for summons | the stage tap | the heal or the adds never happen |
| Interrupt (`sig`) | an `interrupt` hero or a stun | Aldric, Grenna, Oriel, Warden's `ab2` (CL1) | an ability during the bar | skips the boss's biggest move; +15 stagger |
| Ability timing | casts when ready (waits ≤ 1.5 s for a Stagger at 90%+) | - | cast into Stagger or a reaction window | x1.25 (x1.875 in Stagger) |

**Efficiency:** auto-**taps** keep `autoEff` **0.5** (a tap is the active verb); the auto-**Finisher** fires at
0.5; auto-**cast abilities** are at **full** power (Q9). The active edge comes from timing, never from a
penalty on idle play.

### 3.8 Active rewards (core-2 6.6)

| Rule | Value |
|---|---|
| Who qualifies | a boss (zone elder, region boss, Deep Elder, pinnacle; the raid in 6.2) beaten with **3 or more active answers**: parries, dodges of `zone` / `slam` (perfect or not), interrupts |
| Counted | only the player's own taps and ability presses. Line-up answers, auto-play and Tactics do not count (they already work idle). The heavy's early half-damage tap does not count. Finishers do not count (every Stagger offers one) |
| Reward | **+1 signature buff item** (a second roll of the boss's drop, core-2 5.4) and **+50% XP** for that kill |
| Shown | three small lantern pips in the boss header light as you answer ("●●○"); the win toast adds one line: "Played it well: +1 Lantern Pearl, +50% XP." |
| Idle | the boss's normal drops, always (its signature buff item always drops, at least Uncommon). Never less than HEAD |
| Packs | no reward item (idle zones stay idle). Parries, dodges and Keen just make packs die faster |

Counters for deeds and stats (new save key `cb2`, 8.4): parries, dodges, perfect dodges, interrupts,
Finishers, active boss kills.

### 3.9 Accessibility and reduced motion

- **Assist timing** (a setting, default off; pinnacles.md 14 Q2): every wind-up and cast bar x1.5 and every
  window with it (parry 1.2 s, dodge 1.5 s, perfect 0.75 s, the Finisher's auto-fire at 3.75 s). **Full
  rewards.** Pinnacle best times get a small lantern mark.
- **Every answer is one tap.** No holds, swipes, double taps or precise targets.
- **Word, shape, colour, sound** for each warning (colours as pinnacles 8.3, the scatter orange now the dodge):

| Warning | Word | Shape | Colour |
|---|---|---|---|
| `heavy` | PARRY | "!" and the shrinking ring (reduced motion: the bar only) | red |
| `zone`, `slam` | DODGE | `>>` and a hatched patch on the ground | orange |
| `heal`, `summon`, `sig` | INTERRUPT | "~" and the cast bar | purple |
| `hard` | (the cast's name) | a lock | grey |
| `line` | BRACE (the Coast's Surge) / the cast's name | a wave `≈` | blue |
| `dive` | (none: a pip) | a blue "!" over the target | blue |
| `enrage` | ENRAGE | a flame over the timer | red |
| Stagger | FINISHER | a star, the gold outline | gold |

- **Reduced motion:** no rings, sidesteps, lunges, shake or marching hatch. Banners appear in place. Wind-ups
  show only as the banner bar. The Staggered pose does not change (the outline and banner say it). The
  zoom step (2.5) is already a snap.
- **Haptics** (a setting, default on where the device has it): a 20 ms buzz when an answer warning starts,
  10 ms on a success. `navigator.vibrate` inside try/catch; nothing if it is missing.
- **Screen readers:** the banner is DOM with `aria-live="polite"`: "Parry now", "Dodge", "Interrupt Kneel",
  "Finisher ready".
- **Colour-blind:** the words and shapes carry every meaning (check in the three filters and greyscale, as
  core-2 2.1).

---

## 4. Bosses

### 4.1 The template

Every boss is one data row in `BOSS_KITS` (8.3) read by one scheduler. The shape:

| Part | Zone elder | Region boss | Deep Elder | Raid wyrm | Pinnacle |
|---|---|---|---|---|---|
| Phases | **2** (at 50%) | **3** (66% / 33%) | 2 (floors 5-15), 3 (floor 20+) | 3, by the **shared** world HP | 3 (70% / 35%, pinnacles.md kept) |
| Timer | 45 s, then Enrage | 60 s, then Enrage | none (Oil) | none | 90 s (Enrage at 70 s) |
| Phase 1 | the heavy hit (parry) + the boss's **identity** mechanic | the same | the elder kit of its type | heavy + the generation's signature | pinnacles.md 4 |
| Each later phase | **one** new mechanic: adds, a wind-up, a hazard or a `sig` cast | the same | the same, plus Oil's own at 20+ | the same | pinnacles.md 4 |
| Answer kinds | at least 2 of parry, dodge, interrupt (plus line-up answers) | at least 3, and one `hard` cast | as its type | parry, dodge, interrupt | pinnacles.md 3.2 |

Rules for every kit:

- **Phase change:** a 1.5 s `hard` roar ("It stops listening."), which clears the warning showing. The boss is
  **never** invulnerable (idle play must not stall). The fallen stand up at 30% HP.
- **Scheduler:** one answer warning at a time, 1.0 s apart; wind-ups ≥ 1.2 s; cast bars ≥ 1.5 s (pinnacles 3.2).
  The first use of each mechanic in a player's first fight shows one hint line under the banner
  ("Hit it with an ability while it casts").
- **Damage:** the boss's `atk` is set for the 30-40 s target (1.5) with the caps on (1.4). Mechanics are written
  as multiples of the boss's attack.
- **Type:** the boss hits with its family's type (`dt`) and takes its family's weakness and resists (core-2 2.3).
  A region boss may add one resist.
- **Stagger:** 100 points (core-2 6.4). Finishers as 3.4.

**The signature buff item** (plan-4 2.3, core-2 5.4):

- Each boss names one buff item id, `<family>_<w>` (core-2 5.4: `pearl_h`, `glass_l`, ...), of its region's family,
  in the weight that fits its theme (a shelled crab carries a heavy Pearl; a witch a light one).
- **Visible in the body:** the rig gets a `gem` anchor (a bone and an offset). The stage draws a 3x3 art-px
  glint there in the family's colour with a slow pulse (reduced motion: steady). It is baked into the rig's
  frames once, so it costs nothing per frame.
- **Always drops**, first kill and every rematch, at least Uncommon (RG1's rarity roll). An active kill (3.8)
  rolls a second one. On the kill the glint pops out of the body and floats to the header (reduced motion: it
  fades out there and in at the header).
- **Region 1 has no buff item family** (core-2 5.4: Enchanting opens in Region 2). Hollow bosses carry their
  **heart-light** (the light they stole) in the same anchor; it drops today's rewards. Whether they should drop
  a buff item once Enchanting is open is decision D2 (8.6).

**The themed unique hook** (plan-4 4.7, core-2 5.5): each kit row names `uniq`, an id in RG1's Uniques 2.0
list. RG1 owns the list, the power and the drop rate (`UNIQ_TUNE`, Echoes). CB2 gives the powers events to hook:
`parry`, `dodge` (`perfect`), `interrupt`, `stagger`, `finisher`, `reaction`, `phase`, `bossSig` (the drop). The
kits below give each boss a **theme word** for RG1 ("poison spread", "shell"), nothing more.

```js
// 21g-data-bosses.js (CB2 data; no save)
BOSS_KITS.slime = {
  name: 'Elder Moss Slime', fam: 'plant', dt: 'poison', res: [], phases: [0.5], timer: 45, hp: 12, atk: 1,
  sig: null, heart: '#B6F09A', uniq: null /* RG1 */, theme: 'poison spread', gem: ['body', 2, -6],
  mech: [
    { id: 'engulf', tele: 'heavy', ph: 1, every: 8, wind: 1.5, x: 4, cap: 0.35 },
    { id: 'ooze', tele: 'zone', ph: 1, every: 14, wind: 1.8, x: 2, slots: 1, apply: ['venom', 3], cap: 0.35 },
    { id: 'split', tele: 'hard', ph: 2, at: 0.5, wind: 1.5, adds: ['slime', 2, 0.12] }
  ] };
```

### 4.2 The Hollow: seven elders and the Fenmother

Zone elders: 2 phases, 45 s. Their HP and attack follow the zone (today's rule, x1.5 HP for the timer). The
identity mechanic is today's second mechanic, now with a proper warning.

| Elder (`fam`, hits) | Phase 1 (100-50%): heavy + identity | Phase 2 (under 50%): one new | Answers | Theme (RG1) |
|---|---|---|---|---|
| **Elder Moss Slime** (plant, poison) | **Engulf** (heavy, 4x, 8 s). **Ooze** (`zone`, 14 s): a patch under 1 slot, 2x and Venom 3 | **Split** (`hard` at 50%): 2 small slimes (12% HP each), Ooze under 2 slots | parry, dodge; area for the split | poison spread |
| **Elder Cave Bat** (beast, phys) | **Rending Bite** (heavy, 8 s). **Dive** (`dive`, 12 s): the Back member, 2x for 5 s | **Call the Colony** (`summon`, 2 s, 16 s): 4 bats (3% HP each, half-size) | parry; taunt, stun or cover for the dive; interrupt or area | bleed and swarm |
| **Elder Rattlebones** (undead, phys) | **Grave Blow** (heavy, 8 s). **Raise the Dead** (`summon`, 2 s, 15 s): 2 Rattlebones | **Bone Volley** (`line`, 14 s): 1.5x to every member | parry, interrupt; shields and heals | undead rising |
| **Elder Barrow Beetle** (beast, phys) | **Mandibles** (heavy, every **6 s**: the heavy-hit boss) | **Burrow** (`zone`, 12 s): digs under the Back or Middle slot and bursts up, 2.5x (it can still be hit: the mound) | parry, dodge | armour and thorns |
| **Elder Spore Cap** (plant, poison) | **Spore Burst** (`line`, 8 s, its heavy): 1.5x to every member and Venom 2 | **Spore Bloom** (`sig`, 2.5 s, 16 s): Venom 5 on every member | shields, cleanse; interrupt | venom bloom |
| **Elder Quarry Golem** (construct, phys, armoured) | **Crushing Fist** (heavy, 6x, capped 35%, 8 s) | **Rockfall** (`slam`, 11 s): the Front slot, 3x | parry, dodge; `pierce`, frost (weak) | stone and shatter |
| **Elder Marsh Wraith** (spirit, frost) | **Cold Touch** (heavy, 8 s). **Mend** (`heal`, 1.5 s, 12 s): heals itself 10% (a tap stops it, today's rule) | **Drown the Light** (`sig`, 2 s, 15 s): Curses the lowest-HP member (no healing, 4 s) | parry, tap, interrupt, cleanse; holy (weak) | cold and silence |

**The Fenmother** (Region 1 boss, zone 35, the Elder of Wraithmarsh V; `spirit`, hits frost; 60 s, 3 phases).
"The first wraith the marsh ever swallowed, the one the Voice has worn since. While it stands, no relit fire
here outlasts the morning."

| Phase | New mechanic | Warning | Effect | Answers |
|---|---|---|---|---|
| 1. The Fog Comes (100-66%) | **Cold Hand** (heavy, 8 s) and **Smother** | `heavy`; `sig`, 2.5 s, every 16 s | Smother, if it lands: every timed buff on the party ends (Empower, Keen, Shield Wall...) and every member is **Marked** for 5 s (takes +20%: core-2 3.1, no new status) | parry; interrupt with an ability, an `interrupt` hero, a stun |
| 2. It Calls (66-33%) | **Echoes** | `summon`, 2 s, every 20 s | 2 Marsh Wraiths (6% HP each, healers) | interrupt; area; focus the healers (Mark) |
| 3. The Voice Answers (under 33%) | **Whisper** | `zone`, every 10 s, 2 slots | 2.5x frost to each member in the patch; the stage darkens a step (a cached dim plate) | dodge; frost resist; a formation that keeps one slot clear |
| Phase changes | **It stops smothering** | `hard`, 1.5 s | nothing (it turns to your lamp) | - |

Signature: the heart-light (D2). Theme: "the voice": interrupts and silence. It is the Hollow's exam: all three
answer kinds, each alone first.

### 4.3 The Sunken Coast: seven elders and Silas the Fogbound

region-2.md 4.1's second mechanics become the identity; each gets one phase-2 mechanic. The tide still applies
(region-2 3.2). Region-2's "immune to physical" Reef Wall becomes **physical x0.3** because core-2 2.3 says
nothing is immune to a damage type.

| Elder (`fam`, hits) | Phase 1: heavy + identity | Phase 2: one new | Signature buff item | Theme (RG1) |
|---|---|---|---|---|
| **Elder Shinglecrab** (beast, phys) | **Claw** (heavy, 8 s). **Shell Up** at 75% (a 1 s `hard`-looking wind-up that a stun attempt or knockback stops; in its shell it takes 10% and regains 2% HP a second, 4 s) | **Tidal Snap** (`slam`, 10 s): the Front slot, 3x; Shell Up again at 50% and 25% | `pearl_h` (heavy) | shell and block |
| **Elder Stormgull** (beast, phys) | **Beak** (heavy, 8 s). **Squall** (`sig`, 2 s, 12 s): strips every shield, and every member's next attack and ability wait 1 s | **Gull Storm** (`summon`, 2 s, 18 s): 6 gulls (2% HP each, half-size) | `pearl_m` (medium) | wind and speed |
| **The Bosun** (Elder Deckhand; drowned, frost) | **Belaying Pin** (heavy, 8 s). **Ship's Bell** (`summon`, 2 s, 15 s): 2 Drowned Deckhands (at High tide they get up once) | **Undertow** (`dive`, 12 s): drags a Middle or Back member to the Front for 4 s | `pearl_h` | the bell: taunts |
| **Elder Kelp Strangler** (drowned, phys) | **Lash** (heavy, 8 s). **Bind** (`dive`-style blue "!", 10 s): 2 members cannot act for 3 s, broken when it loses 15% HP | **Crushing Coils** (`sig`, 2.5 s, 18 s): the bound members take 2.5x (capped 35%) | `pearl_m` | roots and holds |
| **Elder Lanternjelly** (drowned, poison) | **Sting** (heavy, 8 s). **Chain Shock** (passive, 6 s): 1.2x to one member, 60% to the next slots | **Split** (`hard` at 50%): 3 small jellies (8% HP each) with Chain Shock; each one's death gives Jellylight (+10% party damage, 3 s) | `pearl_l` (light) | chain damage |
| **Elder Brine Witch** (drowned, frost) | **Brine Lash** (heavy, 8 s). **Brine Hex** (passive, 9 s): Curses the top damage dealer (no healing, 4 s; core-2 3.1 names it) | **Brine Renewal** (`sig`, 2 s, 12 s): heals her 8% | `pearl_l` | hex and curse |
| **Elder Coral Warden** (construct, phys, armoured) | **Coral Crush** (heavy, 5x, 8 s). **Reef Wall** (`hard`, 1.5 s, every 20 s): physical x0.3 for 5 s | **Coral Spikes** (`zone`, 13 s): 2 slots, 2.5x | `pearl_h` | reflect |

**Silas Penrow, the Fogbound** (zone 70, region boss; `drowned`, hits frost; 60 s; 3 phases; the fight's own fast tide:
20 s High, 20 s Low, region-2 7). His six mechanics map onto the grammar; formation is a line of three slots now,
so the Green Beam strikes slots, not columns.

| Phase | Mechanics | Warning | Effect | Answers |
|---|---|---|---|---|
| 1. The Lamp (100-66%) | **Lamp Swing** | `heavy`, 8 s | 4x on his target | parry |
| | **Green Beam** | `zone`, 14 s, 2 slots side by side | 2.5x frost to each (x1.5 at High tide; Soaked +50%), capped 35% | dodge (was: "tap turns the lens away") |
| | The sea feeds the lens / On the rocks | `hazard` at High / Low | High: he regains 1% HP a second (a stun attempt stops it for 5 s); Low: +25% damage taken | stuns at High; save bursts for Low |
| 2. The Undertow (66-33%) | **Undertow** | `dive` (blue arrow), 12 s | drags the lowest-HP Middle or Back member to the Front for 5 s | taunt, knockback; a tap in the wind-up is a dodge (2 s instead of 5 s) |
| 3. The Bell (under 33%) | **Toll the Drowned Bell** | `sig`, 2.5 s, 15 s | 2 Drowned Deckhands | interrupt with an ability; area |
| Phase changes | **The Lens Flares** | `hard`, 1.5 s | the lens turns green-white; nothing else | - |

Signature: **`pearl_l`, the green pearl set in the lens** (the lens is already his lantern prop; it burns gold on
rematches). Theme: "the lens": beams and light.

### 4.4 The Deepwell Elders

A Deep Elder is a Hollow elder type in the well's cold palette (deepwell.md 2.1). Its kit is **that type's elder
kit** (4.2) with the Deepwell's depth rules:

| Floors | Kit |
|---|---|
| 5, 10, 15 | the 2-phase elder kit; no timer |
| 20, 25, 30, 35 | 3 phases: phase 3 (under 33%) adds **Snuff the Lamp** (`sig`, 2 s, every 18 s): -5 s Oil unless interrupted |
| 40+ | as 20+, and every mechanic comes 15% more often (wind-ups never under their minimums) |
| Elder Hall week (every other floor an elite) | unchanged; the elites roll traits (6.1) |

- Parries give 2 s of Oil (today, `parryOil`); CB2 adds: an interrupt +2 s, a perfect dodge +1 s, a Finisher
  +3 s (6.1).
- **Signature item:** deepwell.md's rule 4 says Deepwell power stays in the Deepwell, and plan-4 says bosses
  always drop their buff item. Decision D3 (8.6); the recommendation is **at most one buff item a run**, from the
  first Deep Elder at floor 20 or deeper, of your highest region's family, plus the in-run reward in 6.1.

### 4.5 The raid wyrm

Section 6.2 has the raid's rules (shared phases, a local party, no change to the shared data). The kit:

| Phase (shared: the world HP every raider sees) | Mechanic | Warning | Effect |
|---|---|---|---|
| All | **Tail Sweep** | `heavy`, every 10 s | 4x on your front member |
| 1 (100-66%) | the **generation's signature** (below) | per generation | - |
| 2 (66-33%) | **Ash Call** | `summon`, 2 s, every 20 s | 6 whelps (a half-size swarm, 1.5% of a zone elder's HP each, local) |
| 3 (under 33%) | **Wyrmfire** | `zone`, every 12 s, 2 of your 3 slots | 3x of its type to each member in it, capped 35% |

| Generation (`WYRM_GENS`) | Signature (phase 1 on) | Type | Signature buff item |
|---|---|---|---|
| 1 The Ashen Wyrm | **Flame Breath** (`zone`, 14 s, 2 slots) | fire | `glass_l` |
| 2 The Hollow King | **Kneel** (`sig`, 2 s, 16 s: stuns every member 2 s) | frost | `pearl_h` |
| 3 The Mire Colossus | **Mire Spawn** (`summon`, 2 s, 16 s: 3 mire slimes) | poison | `pearl_m` |
| 4 The Glass Hydra | **Shard Rain** (`line`, 12 s: 1.2x and Chill) | frost | `pearl_l` |
| 5 The Lantern Eater | **Swallow the Light** (`sig`, 2.5 s, 18 s: ends every timed buff; the party is Marked 5 s) | fire | `glass_m` |
| 6 The Pale Tyrant | **Pale Roar** (`hard`, 2 s, 20 s: Chill on every member 4 s) | frost | `r4_h` (Region 4's family; `pearl_h` until it exists) |

The generation's rig shows its signature item in the chest (the wyrm rig gets the `gem` anchor; its palette per
generation is untouched).

### 4.6 The pinnacles

pinnacles.md stays the design of the four fights. Core 2.0 changes only what the rulebook changes:

| Change | Rule |
|---|---|
| Party | the Lanternbearer and **2** heroes (formation.md), not 3 companions. Line-ups in pinnacles 5.1 drop their weakest member; the Weight of the Crown and the Many-Handed Swipe still want two taunters (a Warrior Lanternbearer with a tank hero, or two tank heroes) |
| Answers | PARRY is `heavy`; INTERRUPT is `sig`; **SCATTER is the dodge** (`zone`; the stage tap, no Scatter button); CLEANSE and SWAP get their own telegraph ids `cleanse` and `swap` (proposal 8.2-3) and keep the Lantern touch |
| Stagger and Finishers | all four have a 100-point stagger bar and take Finishers |
| Damage | `PIN_TUNE.atk` is retuned with the new `bossAtk` and the caps (pinnacles 3.4's caps already match 1.4) |
| Signature items | the King `pearl_h`, the Lurelight `pearl_l`, the First Fire `glass_l`, the Climber `pearl_m` (a Region 5 item later). Always dropped; the active kill adds one |
| Uniques | the four pinnacle powers (pinnacles 7.2) are these bosses' themed uniques; RG1 merges them into Uniques 2.0 |

### 4.7 Regions 3-5

The template applies unchanged. The Pyre Knight (Ser Durand) and the Caedmon duel use the `challenge` telegraph
(core-2 6.3) for their duel moments; the Region 3 spec writes them. LORE-R45 names Regions 4-5's bosses; each
region's spec writes seven elders and a region boss in the 4.2 tables' shape, meeting 1.2's type shares.

---

## 5. Elite traits

### 5.1 The seven traits

Ids and counters are core-2's (6.5). CB2 sets the numbers, the look and where they roll. Every trait is data
in `ELITE_TRAITS` (21g) with one small handler (59i).

| Id | Name | Effect | Counter (core-2) and how it works | Look on the stage | Badge (5x5) |
|---|---|---|---|---|---|
| `shielded` | Shielded | Starts with a shield of **30%** of its max HP. **5 s** after it last took damage the shield comes back full | **Heavy hits** deal **x2** to the shield; burst it and keep hitting | a pale blue hexagon rim (a cached overlay per rig size), cracked under 50% | hexagon |
| `vampiric` | Leeching | Heals **20%** of the damage it deals (after the party's armour and reductions), at most 3% of its max HP a second | **Curse**: no healing; **Venom 5+**: half (core-2 3.2) | up to 3 red drops rise when it heals | fang |
| `explosive` | Explosive | On death: a **1.5 s `zone`** patch under the slot it was hitting, then **2x** its attack to each member there (capped **20%**) | **Dodge** it; or kill it while **Chilled**: it freezes and fizzles, no blast | glowing orange cracks; a fuse spark while the patch shows | bomb |
| `summoner` | Summoner | Every **12 s** a **2 s `summon`** cast: 2 adds of the pack's type, each **8%** of its max HP, no gold or XP; at most 4 of its adds alive | **Interrupt** (the stage tap, an ability, a stun, an `interrupt` hero); area damage for the adds | a purple sigil under its feet while it casts | circle sigil |
| `enraged` | Enraged | Under **50%** HP it attacks **50% faster** and deals **20% more** | **Chill** turns the rage off while it lasts; burst it past 50% | red steam over it once raging | horns |
| `frozen` | Ice-Clad | Takes **x0.5** from physical and frost while iced. **3 fire hits** break the ice (Burn ticks and Curse detonations count as hits); it re-forms **8 s** after breaking | **Fire** | a white-blue ice crust (a cached palette variant and rim); gone when broken | flake in a square, with 3 pips |
| `cursed` | Cursed | Its hits **Curse** the member hit (no healing, 4 s, refreshed by each hit) | **Holy** damage on it turns the aura off for **5 s**; **cleanse** lifts the Curse | a violet ring at its feet | cracked ring |

- **First sighting:** the first time a trait appears, one toast: "Shielded elite: heavy hits break its shield
  twice as fast." (one line per trait, from 21g). The Bestiary's foe page lists the traits met and their counters.
- **Two traits never share a counter** (core-2 6.5). The only pair that would is Explosive + Enraged (both answer
  to Chill), so they never roll together.
- **Idle bound** (CX14): with no counter, a trait adds at most 40% to its pack's clear time; with its counter,
  10% or less. The stall guard (90 s) stays.
- Champions keep today's rules (no traits).

### 5.2 Where they roll

| Where | Traits per elite | Elites per pack | Weights: Shielded / Leeching / Explosive / Summoner / Enraged / Ice-Clad / Cursed |
|---|---|---|---|
| Region 1 (the Hollow) | **0** (today's elites: x2 HP, behaviour at double strength) | ≤ 1 | - |
| Region 2 (the Coast) | 1 | ≤ 1 | 25 / 20 / 5 / 20 / 10 / 0 / 20 (drowned foes are holy-weak, so Cursed and its holy counter fit; no Frozen by the sea) |
| Region 3 (the Emberwaste) | 1 | ≤ 1 | 20 / 10 / 25 / 15 / 25 / 0 / 5 (fire and fury; no ice in a burning land) |
| Region 4 (the Pale Reach) | **2** | ≤ 2 in `normal` and `swarm` | 15 / 10 / 10 / 15 / 10 / 30 / 10 (Frozen's home: fire is the answer there, core-2 2.3) |
| Region 5 (the Gloamvale) | 2 | ≤ 2 | 15 / 15 / 10 / 15 / 10 / 10 / 25 (the deep curses; holy is the answer) |
| The Deepwell | 1 from floor 8, 2 from floor 20 | as the floor | equal weights |
| Pinnacles, the raid | none (bosses have kits instead) | - | - |

**Zone leans.** So a line-up can be built "zone by zone" (plan-4 2.4), each zone of a region's 7-zone cycle
leans to **two** traits (weight x3). The region data holds `lean[7]` (a pair per zone place). The Bestiary and the
zone's info line say it: "Elites here are often Leeching or Shielded." The planner (56d) gives a small score to a
line-up that carries a lean's counter (8.3, S6-C), so idle players get sensible picks too.

---

## 6. The Deepwell and the raid

### 6.1 The Deepwell: where active play pays most

The Deepwell is the mode built for attention (deepwell.md 1: "active"). CB2 turns that into rewards that stay
below (deepwell.md rule 4), plus the signature item in D3.

| What | Rule |
|---|---|
| Packs | a floor's foes use their `size` (2.1), all at once, floor HP split as today |
| Elite floors | the elite rolls traits: 1 from floor 8, 2 from floor 20 (Elder Hall weeks too) |
| Deep Elders | full kits (4.4): 2 phases to floor 15, 3 from floor 20 with Snuff the Lamp |
| **Oil for answers** | parry +2 s (today), **interrupt +2 s, perfect dodge +1 s, Finisher +3 s**; at most +12 s a floor from answers |
| **An active boss kill** (3.8's rule) | the draft after it shows **4 cards** instead of 3 (all Rare or better) |
| New boons (`[A]`, active) | **Steady Feet** (dodge window +0.3 s, perfect +0.2 s), **Breaker** (+30% stagger below), **Coup de Grâce** (Finishers +50%; the auto-Finisher fires at 80%), **Silence** (an interrupt gives back 30% of that ability's charge) |
| New boon (idle-friendly) | **Lamplight Ward** (a wind-up that lands unanswered deals 30% less), so idle drafts are not worse off |
| New set | **The Dance** (Steady Feet, Breaker, Coup de Grâce): each perfect dodge also gives 2 s of Oil |
| The weekly Trial | the same kits; the new boons join the Trial's pool |
| Idle | target CX12: the idle median floor stays within ±2 of HEAD (more HP loss is offset by the Lamplight Ward and the Oil being unchanged) |

What active play adds below, in one line for the Deepwell's tips card: "Parry, dodge and interrupt to earn Oil.
Beat a Deep Elder with your own answers and your next draft shows four cards."

### 6.2 The raid: a shared foe, a local fight

**Today** the raid is a damage race with no party HP: your party's damage (x `raidMult`) adds to `S.raid.dmg`,
which 80-online writes to your `raiders/<userId>` doc. **The online layer does not change** (CLAUDE.md): not
`world/boss`, not `raiders/*`, not the room presence or the `rally` topic, not `52-raid.js` or `80-online.js`.
Everything below is local, in a new core file (8.3), reading `online.world` and `worldHp()` only.

| Rule | Value |
|---|---|
| The fight | your party on the stage against the wyrm (today's scene), with the kit in 4.5 |
| **Shared phases** | from the shared world HP (`worldHp() / maxHp`): every raider is in the same phase at the same time |
| **Shared clock** | the wyrm's warnings run on a schedule seeded by `gen` and the UTC second, so every raider sees the same Flame Breath at the same moment. No messages are sent |
| Party HP | the wyrm's hits land on your party. **Falter, not wipe:** a fallen member stands up after 6 s at 50%; if all three fall, the party regroups for 8 s (no damage) and stands up whole. A raid never ends in a loss |
| Your damage | HEAD's raid damage x **raid stance 1.12** (a flat lift that covers an idle party's small downtime, so idle damage an hour is at least HEAD's: CX13) x the local multipliers (your Staggers x1.5, Keen, Reeling, Finishers) |
| Stagger and Finishers | local: your own stagger bar on your view of the wyrm; your Staggers raise only your damage |
| Active answers | parry the Tail Sweep, dodge the breath and Wyrmfire, interrupt the `sig` casts |
| Rewards | today's Embers and raid unique on the wyrm's fall (unchanged). **Plus** the generation's signature buff item for every raider with at least 1% of the damage, and one more if you gave 3+ active answers during that wyrm (3.8). Granted locally from the existing `raidReward` event |
| Away | the away raid gain is unchanged (0.5 x damage a second) |

What active play adds in a raid: about 15-30% more of your damage (CX13), a second signature item, and the
feeling of a room full of lanterns dodging the same breath.

---

## 7. Tactics hooks (for S7)

### 7.1 What Tactics can and cannot do

| Mechanic | Tactics can | Tactics cannot |
|---|---|---|
| Parry, dodge | answer with the line-up (IF `telegraph heavy` THEN `use ab1` for a Shield Wall; IF `telegraph zone` THEN `moveTo` a clear slot) | parry or dodge. Those stay the player's own (roadmap-review 2.8: "active play still beats Tactics on perfect dodges") |
| Interrupt | IF `castBar sig` THEN `interrupt` (the first charged ability that can) | beat a charge that is not there |
| Stagger | IF `staggerNear 80` THEN `hold ab1`; IF `staggerFull` THEN `use ab2` | - |
| Finisher | IF `staggerFull` THEN `finish` (proposal 8.2-6): fires at 0.5 s at 80% | reach 100% (the player's tap) |
| Elites | IF `elite vampiric` THEN `focus`; IF `allyHas curse` THEN `cleanse` | - |
| Reactions | IF `reaction` THEN `use ab1` (proposal 8.2-6: a reaction window is open on the focus foe) | - |

Tactics answers do **not** count toward the active reward (3.8): they already work while idle.

### 7.2 The ids CB2 feeds (core-2 4.5)

| Condition | CB2's args | Source |
|---|---|---|
| `telegraph` | `heavy` `dive` `heal` `zone` `slam` `line` `sig` `hard` `summon` `hazard` `enrage` (`cleanse` `swap` proposed) | the scheduler (59g) |
| `castBar` | `any`, `sig` | 59g |
| `elite` | a trait id or `any` | 59i |
| `staggerFull`, `staggerNear` | -, % | 59g |
| `phase` | 1-3 | 59h |
| `packSize` | n (3, 5, 8 now mean brutes, normal, swarm) | 59-combat |
| `bossHp` | % | 59-combat |
| `reaction` (proposed) | - | S1's reaction engine |

Actions CB2 serves: `use`, `hold`, `focus`, `taunt`, `cleanse`, `interrupt`, `moveTo` (all core-2), and `finish`
(proposed, the Lanternbearer only).

**Engine hook:** `cbState()` returns one reused, read-only snapshot for Tactics and the UI:
`{ tele: { kind, left, win, foe }, cast: { kind, left, foe }, stag: { v, max, on, left }, rxWin, phase,
elites: [traits], packN }`. Tactics reads it 4 times a second, never per frame.

### 7.3 Presets (content for S7)

| Preset | Lanternbearer (2 rules) | Heroes (3 rules each, as their kit allows) |
|---|---|---|
| `boss` | IF `castBar sig` THEN `interrupt`; IF `staggerFull` THEN `finish` | IF `staggerNear 80` THEN `hold sig`; IF `allyHp 40` THEN `use sig` (healers); IF `telegraph dive` THEN `taunt` (tanks) |
| `farm` | IF `packSize 5` THEN `use ab1`; IF `elite any` THEN `focus` | IF `packSize 5` THEN `use sig` (area heroes); IF `allyHas curse` THEN `cleanse` (Lightkeeper, cleansers) |
| `deepwell` | IF `telegraph zone` THEN `use ab1` (a shield or Guard ability; else skipped); IF `castBar sig` THEN `interrupt` | IF `allyHp 50` THEN `use sig`; IF `elite summoner` THEN `use sig` (stunners); IF `telegraph dive` THEN `taunt` |

### 7.4 Auto-play without Tactics

What an idle party does today stays, plus four small defaults (none needs a setting):

1. Abilities auto-cast at full power at the first valid target; they wait up to 1.5 s when a Stagger is at 90%+
   (3.6).
2. The auto-Finisher fires 2.5 s into a Stagger at 50% (3.4).
3. **A casting foe (`heal`, `summon`) becomes the party's focus while it casts**, so stuns and signatures land on
   it by default. (Today the focus is the marked foe, the one hitting the most hurt ally, else the most hurt foe.)
4. Hero signatures tagged `interrupt` or that stun fire at a `sig` cast if they have a charge (they do not hold).

---

## 8. Answers, rulebook changes, build split and checks

### 8.1 Answers to core-2's open questions for CB2

9. **Auto-cast efficiency (`autoEff`).** Auto-**taps** keep **0.5** (the tap is the active verb, and the
   classes' meters already fill idle; CL1 agrees). Auto-cast **abilities** fire at **full power** at the first
   valid target, with one smart wait (up to 1.5 s for a Stagger at 90%+). The auto-**Finisher** is a tap verb:
   **0.5**, at 2.5 s. Tactics' Finisher: 0.8. The active edge is timing (x1.25 windows, x1.5 Stagger, Keen,
   Reeling, interrupts), never a cut to idle play.
10. **Swarm totals.** **Higher:** a swarm pack totals **1.25x** HP and pays **1.25x** gold and XP
    (`swarmHp`, `swarmPay`). Single-target parties earn about the same a second there; area parties earn
    15-30% more (CX8). Area damage becomes a reason to pick a class, not a tax on the others.
11. **Interrupting boss signatures.** **Every time.** The limit is the Lanternbearer's charges (`ab1` 20-40 s,
    `ab2` 12-30 s against a signature every 14-20 s), so spending a charge on an interrupt or holding it for a
    Stagger is the decision. Heroes with an `interrupt` signature and stuns (which stop a boss's cast while
    turning into stagger) cover the rest. Every region boss also has a `hard` cast that nothing stops.
12. **The zone boss timer vs the 30-40 s kill target.** **The timer becomes an Enrage timer and gets longer:**
    zone elders 45 s, region bosses 60 s, with boss HP x1.5 / x2 so the damage needed to win is today's. At 0 the
    boss enrages (50% faster, +10% damage a second); the fight fails 15 s later. A prepared party wins at today's
    power; an unprepared one falls first and needs 1-2 zones more (1.5). The Warrior's Shield Wall keeps its
    3 s pause (it holds back the Enrage).

### 8.2 Proposed core-2 changes (for the change log, section 10; pending the coordinator's sign-off)

| # | Section | Change | Why |
|---|---|---|---|
| 8.2-1 | 1.2, 6.3 | **Reeling** is a vuln entry: +50%, added into Σ vuln (cap +60%), 2 s, the foe does nothing | Core-2 names Reeling but not where it sits in the formula. Today it is a separate x1.5 |
| 8.2-2 | 6.4 | Stagger fill: **perfect dodge +10**; a unit's heavy hits fill **at most 4 a second** | Dodges must feed the Stagger like parries; tap speed alone must not stagger a boss |
| 8.2-3 | 6.3 | Telegraph ids **`cleanse`** and **`swap`** (the pinnacles' answers); `zone` windows fixed: dodge in the last 1.0 s, perfect in the last 0.5 s; the pinnacles' Scatter is a `zone` | Pinnacles use two answers core-2 has no id for; the dodge window needs a start |
| 8.2-4 | 6.1, 8.2 | Foe data adds **`dt`** (hit type) and **`quota`** next to `size` and `fam`; normal packs are 5 or 6 **per type**; swarm totals `swarmHp` / `swarmPay` 1.25 | Core-2 1.4 says foes hit with their region's types but gives no field; Q10 |
| 8.2-5 | 1.2 | The **Finisher** takes `staggerX`, not `timingX` | It only exists in the window; x1.875 on the biggest hit would dwarf everything else |
| 8.2-6 | 4.5 | Tactics condition **`reaction`** (a reaction window is open on the focus foe) and action **`finish`** (the Lanternbearer's Finisher at 80%) | Reaction windows are the other half of ability timing; Tactics needs a Finisher short of the player's 100% |
| 8.2-7 | 3.4 | A stun on a boss during a **`sig`** cast stops the cast (the stun itself still becomes stagger) | Stunners are the idle answer to signatures, as in pinnacles.md |
| 8.2-8 | 1.4 | **Hit caps:** telegraphed 35% of max HP, boss swings 15%, pack swings 10% (swarm 4%), Explosive blast 20% | No one-shots once bosses hit 6.5x harder (the probe: the Golem's heavy took 65% of a striker) |
| 8.2-9 | 6.2 | The **boss timer is an Enrage timer**: 45 s zone elders, 60 s region bosses, fail 15 s after; boss HP x1.5 / x2 | Q12 |
| 8.2-10 | 6.6 | The active reward counts the **player's own** parries, `zone` / `slam` dodges and interrupts; not line-up answers, Tactics, Finishers or the heavy's early half-damage tap | 6.6 does not say whose answers count |
| 8.2-11 | 3.1 | **Keen** goes on each member who stepped out of the patch | One tap moves the whole party out; Keen on the Lanternbearer only would read as a bug |
| 8.2-12 | 5.4 | Signature item exceptions: **Hollow bosses** carry a heart-light, not a buff item (Region 1 has no family); **Deep Elders** drop at most one a run (D2, D3) | Core-2 5.4 says "bosses always drop" and "Region 1 has none"; deepwell.md rule 4 |

`armourX` 0.8 (1.1) is inside core-2's 15-25% range and needs no line. CL1's own proposals (classes-2.md 8.2-4, the ability shape
and `var`; classes-2.md 8.2-7, `stacks` and `meter`) touch this spec only through Tactics; nothing here conflicts with them. The lines are also entered in core-2 section 10 as "proposed (CB2)".

### 8.3 Build split and file ownership

**What S1 needs from CB2** (S1 is the types and statuses slice; it proves core-2 first):

- The data in 2.1: `FOE_BEH[k].fam` and `.dt` for the Hollow's 7 types (and the Coast's once R2 lands), so foes
  take weakness and resists and hit with a type (resists `res*` answer it). `size` and `quota` ride along as data
  but do nothing until S6.
- Typed numbers and status badges on the **focus foe** (2.6, 2.7's first row). The pack number and the other
  rows are S6.
- `FOE_MAX` stays 6 and packs stay 3 in S1.

**Slice S6: active combat, elites and the boss overhaul.** Eight tasks:

| Task | Owns | Small edits in | Depends on | Model |
|---|---|---|---|---|
| **S6-A** Engine: pack sizes, the foe pool (12), quotas, spawn rhythm, swarm totals, the damage knobs, hit caps, the Enrage timer and the auto-challenge survival test | `src/js/59-combat.js`, `src/js/59b-enemies.js` | `src/js/50-sim.js` (Enrage at `bossTime` 0, fail at -15 s), `src/js/40-rules.js` (`PACE.bossHp`, `regionBoss`) | S1 | opus |
| **S6-B** Active core: the answer scheduler (one queue in place of the single `TELE`), dodge and `zone`, cast bars and interrupt rules, the stagger bar, Finishers, Keen, Reeling, active counters and rewards, `cbState()`, the events | `src/js/59g-active.js` (new, core) | `src/js/55-party.js` (tap priority 1-4 in `classTap`; the ability buttons' interrupt and window states), `src/js/59b-enemies.js` (`resolveParry` calls into 59g) | S6-A; S2 (Finisher data; S3 for evolution Finishers) | opus |
| **S6-C** Bosses: the kit interpreter, phases, every kit in section 4, the planner's `needs` and lean counters | `src/js/59h-bosses.js` (new, core), `src/js/21g-data-bosses.js` (new, data: `BOSS_KITS`, `ELITE_TRAITS`, trait weights, leans, hints and copy) | `src/js/59b-enemies.js` (`bossStart` hands a kit boss to 59h), `src/js/56d-autofield.js` (score `needs` and lean counters), `src/js/22-data-regions.js` (`lean[7]` per region) | S6-B; S5 (the `bossSig` drop grants a buff item) | opus |
| **S6-D** Elite traits | `src/js/59i-elites.js` (new, core) | `src/js/59-combat.js` (roll traits at spawn; the shield pool in `cbDamageFoe`; the heal hook) | S6-A, S1 | opus |
| **S6-E** Stage and fight UI: layout for 12 foes and depth ranks, the zoom step, the bar rules, merged numbers, `zone` patches, cast bars, the stagger outline and bar, trait overlays and badges, gem glints, the Finisher prompt, the banner (DOM, `aria-live`), settings (Assist timing, Haptics, Buttons on the left) | `src/js/13d-art-combat.js` (new: trait overlays, glints, heart-lights, hatch pattern, badges), `src/styles/60-combat2.css` (new) | `src/js/62-stage.js` (layout, zoom floor, HUD rules, numbers), `src/js/60b-baker.js` (the 1x swarm bake), `src/js/71-ui-fight.js` (the header: pack bar, stagger bar, cast name, "Enrage in", active pips), `src/js/70-ui.js` (three settings rows), `src/js/13-art-enemies.js` (`gem` anchors on the rigs) | S6-B | opus (perf-sensitive) |
| **S6-F** The Deepwell and the raid | `src/js/59j-raid-combat.js` (new, core: the local raid fight, the shared clock, Falter, the stance, the signature grant on `raidReward`) | `src/js/59c-deepwell-combat.js` (Oil for answers, the 4-card draft, trait floors), `src/js/57d-deepwell.js` (5 boon rows, the set, `offers` 4 after an active kill) | S6-C, S6-D | opus |
| **S6-G** Sim, checks, perf | `tools/sim.mjs` (`--cbtap`, `--cbharness`, CX1-CX14) | `tools/check.mjs` (8.5), `tools/perf.mjs` (`swarm10`, `bossKit`) | all | opus |
| **S6-H** Writing: first-use hints, trait toasts, the Fenmother's lines, boss intro and fall lines for new kits, win-toast lines, the Deepwell tip, settings copy | text fields in `src/js/21g-data-bosses.js` (S6-C owns the file; S6-H fills copy fields only) and `src/js/21h-lore-hollow.js` (Fenmother lines) | - | - | sonnet |

- **Untouched:** `52-raid.js`, `80-online.js`, the shared data shapes, the room, the leaderboard.
- **Reserved names respected:** `59d` (the coast, region-2), `59e` (CL1's class combat), `59f` and `13c`
  (pinnacles). CB2 takes `59g`-`59j`, `21g` and `13d`.
- **Order:** S6-A, then S6-B; S6-C, S6-D and S6-E in parallel once S6-B's events exist; S6-F after C and D;
  S6-G last, and it retunes the knobs (a BAL3 pass for the slice). S6-H any time.
- **Pinnacles (PB1-PB5)** build on this: if they are built after S6, 59f uses 59g's scheduler and 59h's kit
  interpreter and needs none of pinnacles.md 12's private hooks.

### 8.4 Save

```js
registerState('cb2', {
  v: 1,
  assist: 0,      // Assist timing (3.9)
  haptic: 1,      // Haptics
  left: 0,        // Buttons on the left
  seen: {},       // mechanic or trait id -> 1 once its first-use hint or toast has shown
  n: { parry: 0, dodge: 0, perfect: 0, intr: 0, fin: 0, act: 0 }   // counters for deeds and stats (act: active boss kills)
});
```

- All new, merged into old saves by `registerState`. Nothing existing is renamed or repurposed: `S.combat` (`on`,
  `back`, `tip`) is untouched; `S.raid` keeps its shape.
- **Runtime combat state is never saved** (core-2 8.1-5): stagger, casts, traits rolled on a pack, phases, the
  raid's local fight. A reload mid-boss ends the attempt, as today.
- The Deepwell's saved draft already stores its offered cards as a list; a 4-card offer needs no new field.

### 8.5 Checks and performance tests

`tools/check.mjs`, a new "cb2" section:

1. **Kits:** every `BOSS_KITS` row has 2-3 phases; each phase after the first adds exactly one mechanic; every
   telegraph id is core-2's (plus 8.2-3's); every mechanic has a cap within 1.4, an answer and an idle answer;
   wind-ups ≥ 1.2 s and cast bars ≥ 1.5 s; each region boss has a `hard` cast.
2. **Traits:** exactly core-2's 7 ids; the Explosive + Enraged pair never rolls (enumerate every pair); Region 1
   weight 0; each region's `lean[7]` names real traits.
3. **Foes:** every type has `size`, `fam` (core-2 2.3's list) and `dt` (core-2 2.1's ids); member counts in
   range.
4. **Pack totals:** with the noise seeded, the members' max HP sums to the pack total (x1.25 for swarms), gold to
   the pack's gold, and `kill` fires once per pack.
5. **Caps:** 120 s of each Hollow elder against the late fixture: no party hit above its cap (1.4).
6. **Idle is whole:** the late fixture's idle gold a minute over 10 minutes ≥ 97% of the HEAD number stored in the
   check (CX7).
7. **No overlap:** in 50 seeded fights per kit, answer warnings never overlap and are ≥ 1.0 s apart.
8. **Enrage:** `bossTime` 0 enrages; the fail comes at -15 s; Short Fuse still takes 10 s off.
9. **Active reward:** a scripted fight with 3 manual answers rolls the signature item twice; the same fight idle
   rolls it once; Tactics answers do not count.
10. **Save:** the `cb2` round trip; every fixture loads; the existing "dps unchanged at load" check passes.

`tools/perf.mjs` (phone profile, 360 x 740, DPR 2, x4 CPU), both must pass before S6 merges:

| Scenario | Script | Budget (2.8) |
|---|---|---|
| `swarm10` | a swarm zone (10 foes), 30 s of fighting with Burns spreading, statuses, merged numbers, an Explosive elite | JS/frame p95 ≤ 8 ms and ≤ +1.5 ms over the 3-foe baseline; frame gap p95 ≤ 34 ms; no long task on pack arrival or the zoom step; heap < 2 MB a minute |
| `bossKit` | the Fenmother: 3 phase changes, a summon, a Stagger and a Finisher, 45 s | frame gap p95 ≤ 34 ms; no long task over 50 ms at a phase change or the Finisher |

### 8.6 Decisions for the owner

| # | Decision | Recommended |
|---|---|---|
| D1 | **The boss timer becomes an Enrage timer:** 45 s for zone elders and 60 s for region bosses (HP x1.5 / x2, so the same party wins at the same power); at 0 the boss enrages and the fight fails 15 s later | **Yes.** It makes "bosses can kill you" real without slowing a prepared player |
| D2 | **Hollow bosses carry no buff item** (Region 1 has none; Enchanting opens in Region 2). They show a heart-light and drop today's rewards | **Yes, keep Region 1 simple.** RG1 may add a small Hollow family later if the first region feels bare |
| D3 | **Deep Elders drop at most one buff item a run** (from floor 20, your highest region's family), an exception to "Deepwell power stays in the Deepwell" | **Yes.** It makes the dungeon rewarding (plan-4 2.2) and buff items are capped by sockets |
| D4 | **The raid gets a local fight:** the wyrm hits your party, members Falter and stand up (no loss), phases follow the shared world HP, warnings follow a shared clock; a x1.12 raid stance keeps idle raid damage at least today's. No change to the shared data | **Yes** |
| D5 | **Assist timing** (all warnings 1.5x longer) with full rewards | **Yes** (pinnacles.md Q2 asked the same) |
| D6 | **The auto-Finisher** fires for idle players at 50% | **Yes.** Idle gets a taste; the tap doubles it |
| D7 | **Swarms have 25% more HP and pay 25% more** | **Yes.** Area classes gain; nobody loses |
| D8 | **Brutes and elites get a parry-able heavy hit in normal zones** (from zone 15, inside today's damage budget) | **Yes.** An optional active moment in idle zones, at no idle cost |

For the coordinator: sign-off on the change-log lines 8.2-1 to 8.2-12, and a note to CL1 (8.2-5, 8.2-6 touch
Finishers and Tactics) and RG1 (8.2-12 touches signature drops; section 4 lists each boss's buff item id and a
theme word for its unique).

### 8.7 Specs this changes

| Spec | Change |
|---|---|
| region-2.md 4.1, 7 | Reef Wall is physical x0.3 (not immune); the Green Beam is a dodge over 2 slots; Brine Hex is a Curse; the Keeper's phases as 4.3 |
| pinnacles.md 3.2, 5.1, 8.3, 12 | a party of three; Scatter is the stage-tap dodge (no Scatter button); `cleanse` / `swap` ids; stagger and Finishers on all four; the hooks come from 59g/59h |
| deepwell.md 1 (rule 4), 8.2 | the one-item-a-run exception (D3); Oil for answers; the 4-card draft; new boons |
| party-and-classes.md 4.7, 4.8 | behaviours become pack quotas; the heavy and parry live in this grammar |
| perf.md | the `swarm10` and `bossKit` scenarios |
