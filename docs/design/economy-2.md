# Economy 2.0: gold as the camp's budget (ECON1, with N1c)

Status: design spec ECON1 (includes N1c), written 2026-09-28. Docs and measurement only; no `src/` change.
It replaces today's gold curve, reprices every gold sink, turns gold-gain from everything except gear into
crit damage, and prices gatherers (hire, shifts, Tents). gatherers-2.md is revised to match (its changed
sections are marked **Changed (ECON1)**). All numbers are starting values for `tools/sim.mjs`; BAL tunes them.

Sources: the owner's decisions in docs/coord/wave-log.md (2026-09-28: hired gatherers with rarity, per-shift
fees instead of a daily wage, Tents cap from 2, gold stops inflating, gold-gain moves to crit damage except
on gear, gatherers visible in camp with a talk panel); gatherers-2.md; gear-2.md (2.4 lines, 4.2 enchanting
costs, 7 trade, 8 pacing, owner answers to 9.3); materials.md; core-2.md 1.1-1.3 (stats, caps, buckets);
plan-4.md 4-6; hearth-and-hands.md 1-5; and the code that sets gold today (`40-rules.js`, `20-data.js`,
`56-roster.js`, `57-camp.js`, `55-store.js`, `21-data-craft.js`, `41-items.js`, `21f-data-hands.js`,
`57f-hands.js`, `56c-unlocks.js`, `55-legend.js`, `55-mastery.js`, `56b-synergy.js`, `57c-codex.js`,
`57e-constellations.js`, `58-deeds.js`, `23-data-deeds.js`, `56-achievements.js`, `55-almanac.js`,
`55-bounties.js`, `52-raid.js`). No `world-camp-2.md` exists on this branch, so the Tent numbers here are a
proposal for WC1 to adopt or move (section 5).

Owner rules this spec obeys (wave log, 2026-09-28):

1. Gatherers are hired at the Tavern from an applicant board with rarity (Common to Legendary, N1's odds and
   pity). The named gatherers are special applicants their story routes put on the board, hired for gold.
   Hire is a one-off fee.
2. No daily wage. Each **shift** costs a fixed fee set by the resource's grade. A higher-level gatherer
   charges a little more and brings more, so levelling pays. Unpaid means you cannot send them. Gatherers
   never leave and never lose levels.
3. The cap is the number of **Tents** in camp: 2 at the start, built with gold and materials, about 10 by
   Region 5.
4. Gold stops inflating: gold per kill steps up by region, with gentle growth inside a region. Every gold
   price is repriced to that scale. Gold is the camp's budget. Hero power comes from gear, materials and XP.
5. Gold-gain % stays on **gear** as a low line you take instead of damage. Gold-gain from every other source
   becomes **crit damage**, with a slow ramp and a hard cap.
6. A real choice: fight more to fund a bigger crew and more shifts, gather yourself, or build. A full crew
   running constantly costs more than idle fighting income early in each region, and is comfortable late.
7. Gatherers are visible in camp. Tapping one opens a talk panel with **Send on a job**, limited to their
   profession. The UI belongs to WC1/N3; this spec defines the data.
8. The online layer keeps its shape. Raid gold rewards may be repriced locally (there are none today:
   the raid pays Embers).

Design rules of this spec:

1. **One scale.** Every price is "hours of fighting income at a reference zone", written down as gold. A
   player can hold every number in their head: a shift costs about an hour or two of fighting.
2. **Readable numbers.** Region 1 prices are hundreds to tens of thousands; Region 5 prices are hundreds of
   thousands to a few million. Nothing needs letters past M.
3. **Gold never buys raw hero power without a ceiling it can feel.** Blade and Swiftness stay, on a curve
   that tracks the new income (section 4.4). Everything else that made gold grow becomes crit damage, capped.
4. **Pay before, never after.** Fees are paid when you send. Nothing drains gold while you are away, so gold
   can never go negative and nothing needs a debt rule.

---

## 1. Today's gold curve (measured)

`node tools/sim.mjs --days 45 --class warden` (normal play: check-ins at 08:00, 13:00 and 19:00, 15 minutes
each, the first 60; the morning gap gathers, the others fight), with a logger on `zoneClear`, `awayBegin`
and `awayEnd` (scratch probe, not committed). Gold per foe is `mobHp(z) x 0.05 x goldMult()`.

| Day | Max zone | Gold an hour (24 h average) | `goldMult()` | Base gold a foe | Where gold went | Next Hearth price |
|---|---|---|---|---|---|---|
| 1 | 17 | 2.6M | x7.4 | 22K | Blade, Fortune | Hearth 2: 1.38M |
| 2 | 24 | 408M | x15.6 | 340K | Blade, Fortune (97%) | Hearth 3: 16.9M |
| 3 | 26 | 2.6B | x18.3 | 750K | Blade, Fortune (98%) | Hearth 4: 130M |
| 5 | 31 | 17.3B | x25.7 | 2.5M | Blade, Fortune (98%) | Hearth 5: 933M |
| 8 (Region 1 boss, day 8.3) | 35 | 214B | x51 | 9.2M | Blade, Fortune (98%) | Hearth 6: 8.8B |
| 10 | 38 | 381B | x56 | 17M | Blade, Fortune | Hearth 7: 30B |
| 14 | 46 | 3.1T | x96 | 82M | Blade, Fortune (97%) | Hearth 8: 201B |
| 21 | 56 | 46T | about x100 | 490M | Blade, Fortune | Hearth 10: 9.8T |
| 30 (Region 2 boss, day 36) | 70 | 796T | about x100 | 11B | Blade, Fortune | camp full since day 24 |
| 45 | 72 | 1.56Qa | about x100 | 13B | Blade (one level in about 2 days) | - |

What the numbers say:

- **Gold per foe grows x1.48 a zone** in Region 1's middle and x1.22 a zone after zone 27, plus a x1.7 step at
  zone 35: a Region 2 foe is worth 10^6 of a zone-5 foe.
- **`goldMult()` grows to about x100:** Fortune (x9.8 at level 88), charm gold lines (+650% at grade 5, they
  scale with item power), mastery stars, Blessings, deeds, sets. Gold-gain compounds with the curve.
- **About 97% of all gold goes into Blade and Fortune**, whose prices grow x1.18 and x1.35 a level. Every
  other price (Hearth, buildings, Storehouse, hires, promotions) is paid in seconds to minutes: the full camp is
  built by day 24 with gold never the limit. Gold is a single upgrade treadmill, not a budget.
- **Hands are free after the hire.** The hire costs 100-4,000 foes of your best zone, which `goldMult` makes
  a few seconds of income.

Measured rates used below (normal play, the same run): a fighting session earns 190-380 foe-equivalents an
hour live (packs of 3 count as 1.2 foes); a fighting away gap earns about 600 an hour up to the away cap
(4 h at the start, 6-12 h from the Hourglass and the Watchtower); the **24-hour average is 250-350 foe-
equivalents an hour, about 7,500 a day**. Everything in this spec is priced against that number.

---

## 2. The new gold curve

### 2.1 Formula

```
foeGold(z) = GOLD_BASE[r] x (1 + GOLD_IN x (z - z0[r]))      r = the zone's region, z0 its first zone
GOLD_BASE  = [5, 17, 60, 210, 735]                             (x3.4, x3.5, x3.5, x3.5 a region)
GOLD_IN    = 0.05                                              (+5% of the region's base a zone: x2.7 by its boss)
mobGold(z) = foeGold(z) x goldMult()                           goldMult = (1 + gear gold %, capped) x Gold Rain
```

- A **pack** pays 1.2 foes (as today, `COMBAT_TUNE.packGold`), a zone boss or elder x6, champions as today.
- The curve is linear inside a region and steps at each region boss: the first foe of a new region pays
  x1.26-1.31 the last foe of the old one. Gold per foe grows **x400** over the whole game (today: x10^18).
- `foesGold(z, k)` (56-roster) keeps its signature and becomes `k x foeGold(z)` rounded to 2 significant
  digits, so every price already written as "k foes of zone z" reprices by itself. Old k values must still
  be re-set (section 3), because they were tuned against a `goldMult` of x5 to x100.
- `goldMult()` loses Fortune, the Lucky Coin relic and every `mod('gold')` source except the Gold Rain Omen
  (section 6). Gear gold is capped at +30% (section 6.1).

### 2.2 Table

Income assumes the measured 24-hour averages: **idle** 6,000 foe-equivalents a day (two check-ins, every gap
fighting), **normal** 7,500 (measured), **active** 10,500 (six check-ins; to be measured, section 8).

| Zone | Region | Gold a foe | An hour of normal income | A day: idle | A day: normal | A day: active |
|---|---|---|---|---|---|---|
| 1 | 1 Hollow | 5 | 1,600 | 30K | 38K | 53K |
| 10 | 1 | 7.3 | 2,300 | 44K | 54K | 76K |
| 18 | 1 | 9.3 | 2,900 | 56K | 69K | 97K |
| 25 | 1 | 11 | 3,400 | 66K | 83K | 120K |
| 35 (boss) | 1 | 13.5 | 4,200 | 81K | 100K | 140K |
| 36 | 2 Coast | 17 | 5,300 | 100K | 130K | 180K |
| 42 | 2 | 22 | 6,900 | 130K | 170K | 230K |
| 56 | 2 | 34 | 11K | 200K | 260K | 360K |
| 70 (boss) | 2 | 46 | 14K | 280K | 340K | 480K |
| 71 | 3 Emberwaste | 60 | 19K | 360K | 450K | 630K |
| 82 | 3 | 93 | 29K | 560K | 700K | 980K |
| 94 | 3 | 129 | 40K | 770K | 970K | 1.4M |
| 105 (boss) | 3 | 162 | 51K | 970K | 1.2M | 1.7M |
| 106 | 4 Pale Reach | 210 | 66K | 1.3M | 1.6M | 2.2M |
| 117 | 4 | 326 | 100K | 2.0M | 2.4M | 3.4M |
| 129 | 4 | 452 | 140K | 2.7M | 3.4M | 4.7M |
| 140 (boss) | 4 | 567 | 180K | 3.4M | 4.3M | 6.0M |
| 141 | 5 Gloamvale | 735 | 230K | 4.4M | 5.5M | 7.7M |
| 152 | 5 | 1,139 | 360K | 6.8M | 8.5M | 12M |
| 164 | 5 | 1,580 | 490K | 9.5M | 12M | 17M |
| 175 (the Voice) | 5 | 1,985 | 620K | 12M | 15M | 21M |

The pricing unit **H(z)** below is one hour of normal income at zone z: `H(z) = 312 x foeGold(z)`.

---

## 3. Repricing: every gold sink, old and new

"Old" is today's price at the point a normal player first buys it (the probe above; gate zones as the code).
"New" is the new price; the rule column is what goes into data. Gold is rounded to 2 significant digits.

### 3.1 The camp

| Sink | Old rule | Old price (examples) | New rule | New price |
|---|---|---|---|---|
| **Hearth 2** (gate zone 10) | 1,500 foes of the gate zone | **1,381,056** | 4 H(gate) | **9,000** |
| Hearth 3 (zone 14) | 2,500 foes | 16.9M | 6 H | 15,000 |
| Hearth 4 (zone 18) | 4,000 foes | 130M | 9 H | 26,000 |
| Hearth 5 (zone 22) | 6,000 foes | 933M | 12 H | 38,000 |
| Hearth 6 (zone 27) | 8,000 foes | 8.8B | 16 H | 57,000 |
| Hearth 7 (zone 32) | 10,000 foes | 29.8B | 20 H | 80,000 |
| Hearth 8 (zone 38) | 12,000 foes | 201B | 24 H | 140,000 |
| Hearth 9 (zone 46) | 15,000 foes | 1.23T | 30 H | 240,000 |
| Hearth 10 (zone 55) | 20,000 foes | 9.8T | 36 H | 370,000 |
| Station and building Lv 1 (Forge, Workbench, Loom, Enchanter's Table, Tavern, Watchtower, Library, Map Room) | cold Hearth: materials only; Watchtower 2,692 | 0-2,692 | materials only (H1 rows) | 0 |
| Building Lv 2 (gate Hearth 2, zone 10) | `goldPerLv` 60 x L foes of the gate zone | 110K | 1.5 H(gate) | 3,400 |
| Building Lv 3 (Hearth 4, zone 18) | 60 x L | 5.8M | 3 H | 8,700 |
| Building Lv 4 (Hearth 6, zone 27) | 60 x L | 265M | 5 H | 18,000 |
| Building Lv 5 (Hearth 8, zone 38) | 60 x L | 5.0B | 8 H | 47,000 |
| Shrine Lv 1 / 2 / 3 (Hearth 4 / 6 / 8) | rows 3-5 | 1.9M / 132M / 3.0B | 5 / 8 / 12 H | 14,000 / 29,000 / 70,000 |
| Storehouse Lv 1-8 (gates Hearth 1-8) | `campGold(z, 60 x L)` | 0 / 110K / 1.2M / 7.8M / 47M / 397M / 1.25B / 8.0B | 0 / 1 / 2 / 3 / 5 / 7 / 9 / 12 H(gate) | 0 / 2,300 / 5,100 / 8,700 / 16,000 / 25,000 / 36,000 / 70,000 |
| **Tents** (new; replace the Bunkhouse's beds) | - | Bunkhouse Lv 2-5 as buildings: 110K-5.0B | section 5 | 23,000 (Tent 3) to 2.3M (Tent 10) |
| Region 3-5 building rows (WC1/BT1, not built yet) | - | - | same hour rule, gate = the row's zone | e.g. a Lv 6 row at zone 71: 8 H = 150,000 |
| Building tree nodes (BT1) | - | - | gold 2 H(zone the node's row opens) + materials | WC1/BT1 fill in |

A camp build still asks for materials and a timer as today. Gold is no longer the cheap part: Hearth 2 is an
afternoon of fighting, Hearth 10 a day and a half.

### 3.2 Gatherers

| Sink | Old rule | Old price | New rule | New price |
|---|---|---|---|---|
| Hire, by rarity | `foesGold(S.maxZone, [100, 250, 600, 1500, 4000])` | at zone 20: 7.1M-280M; at zone 35: 920M-37B | one-off, `HIRE_FOES[rarity] x GOLD_BASE[region reached]`, section 4.1 | Region 1: 1,500 / 3,000 / 6,000 / 12,000 / 20,000 |
| Named gatherer (special applicant) | free (gatherers-2 as written) | 0 | the Legendary fee; Tam free | Region 1: 20,000; Region 2: 68,000 |
| Shift | free | 0 | section 4.2 | grade 1: 2,000 to grade 15: 110,000 |
| Daily wage (owner's earlier idea) | - | - | **none** | 0 |

### 3.3 The Lanternbearer and heroes

| Sink | Old rule | Old price (examples) | New rule | New price |
|---|---|---|---|---|
| **Blade** level n | `10 x 1.18^n` | Lv 50: 39K; Lv 102: 215M; **Lv 140: 116B**; Lv 178: 62T | `5 x 1.05^n` (section 4.4) | Lv 50: 57; Lv 102: 720; **Lv 140: 4,600**; Lv 178: 30,000; Lv 230: 370,000 |
| Swiftness level n (cap 40) | `50 x 1.6^n` | Lv 10: 5.5K; Lv 20: 600K; Lv 40: 7.3B | `20 x 1.25^n` | Lv 10: 190; Lv 20: 1,700; Lv 40: 150,000 |
| Fortune level n | `100 x 1.35^n`, +10% gold a level, no cap | Lv 88: about 3T | **Precision** (section 6.2): `200 x 1.45^(n-1)`, +1% crit damage a level, cap 15 | Lv 1: 200; Lv 5: 880; Lv 10: 5,700; Lv 15: 36,000 |
| Promotion (rank r to r + 1) | `foesGold(S.maxZone, 60 x (r + 1))` | rank 0 at zone 20: 4.3M | `foesGold(S.maxZone, 300 x (r + 1))` (about 1 h a rank) | rank 0 at zone 20: 2,900; rank 3 at zone 50: 35,000 |
| Recruit, progress routes (`kills` foes of `zone`) | kills x old foe | Wren 8.3K; Pip 180K; Kestrel 21M | unchanged kills, new foe gold | Wren 200; Pip 470; Kestrel 2,900 |
| Recruit, Tavern visitors (`kills` of `from`) | kills x old foe | Anselm 4.4M; Vesper 1.0B; Grenna 4.6B | unchanged kills | Anselm 2,600; Kestrel 5,300; Thessaly 7,900; Vesper 6,100; Grenna 20,000 |
| Recruit, Elowen's quest (3,000 kills of zone 57) | | about 1.5T | unchanged | 100,000 |
| Travelling trader (10 Essence for 150 kills of max zone - 1) | | | unchanged kills | zone 30: 1,800 |
| Old companions (`COMPS`, retired by the roster) | | | unchanged (unused) | - |

### 3.4 Crafting and gear

| Sink | Old rule | Old price (examples) | New rule | New price |
|---|---|---|---|---|
| Upgrade +1 to +10 | `40 x 5^t x (plus + 1)` (t = tier, max 5) | tier 1 +0: 200; tier 5 +9: **1.25M** (and the same for every grade after 5 under gear-2) | `20 x foeGold(GRADE_Z[g]) x (plus + 1)` | grade 1 +0: 100; grade 5 +9: 4,400; grade 9 +9: 26,000; grade 15 +9: 320,000 |
| Reforge (n-th on an item) | `30 x 5^t x 1.5^n` | tier 5 first: 94K | `15 x foeGold(GRADE_Z[g]) x 1.5^n` | grade 5 first: 330; grade 15 first: 24,000 |
| Craft a new item | materials only | 0 | unchanged | 0 |
| Set a Sigil (gear-2 4.2) | `foesGold(S.maxZone, 20)` | (not built) | `foesGold(S.maxZone, 60)` | zone 50: 1,700 |
| Tune a Sigil | `foesGold(S.maxZone, 10)` | (not built) | `foesGold(S.maxZone, 30)` | zone 50: 870 |
| Temper a unique (gear-2 6.5) | `foesGold(S.maxZone, 50)` | (not built) | `foesGold(S.maxZone, 150)` | zone 50: 4,300 |
| Inscribe a legendary power | `foesGold(S.maxZone, 100)` | zone 35: 920M | `foesGold(S.maxZone, 200)` | zone 35: 2,700 |
| Refining orders (gear-2 3) | materials only | 0 | unchanged | 0 |

### 3.5 Trade, bounties, raid

| Item | Old rule | New rule | New example |
|---|---|---|---|
| Trade price a unit (gear-2 7.2) | `foeGold(first zone of the grade) x famW` (gathered 0.02, gems and herbs 0.025, hide 0.03, essence 0.06, secondary 0.01, refined 0.05) | same formula on the new `foeGold`; **famW x3** (gathered 0.06, gems and herbs 0.075, hide 0.09, essence 0.18, secondary 0.03, refined 0.15), so a full trip is 5-10% of a day's income (E12) | 5,000 grade-4 ore at 100%: 5,000 x 17 x 0.06 = 5,100 |
| A Common Sigil as a trade return | 30 foes of the region's first zone | unchanged rule | Region 2: 510 |
| Bounty gold | about 4 minutes of income at the farm zone | unchanged rule (it follows income) | zone 50: about 600 |
| Raid rewards | Embers (no gold) | unchanged; the raid pays no gold, so nothing is repriced. The online docs and the Ember formula keep their shape | - |
| Deepwell, expeditions | no gold | unchanged | - |

### 3.6 Gold numbers that are not prices

| Where | Old | New |
|---|---|---|
| Deed track "Hoard" (gold earned, lifetime) | 1e9 / 1e12 / 1e15 / 1e18 | 100K / 1M / 10M / 100M |
| Feat "Dragon's Hoard" (`f_gold`) | 1e24 ("1Sp gold earned") | 500M (a full Season 1 of normal play is about 400M-900M) |
| Old achievements `gold1m` / `gold1b` | Earn 1M / 1B | Earn 100K / 10M (names: "Coin Collector" / "Dragon Hoard") |
| Next Up and the hint on Blade ("x more gold") | unchanged rule | unchanged |

---

## 4. Gatherers: hire, shifts and levels

### 4.1 The hiring board and rarity

The Tavern's board is back (N1's), with the named gatherers on it.

- **Random applicants:** one every 8 h of wall clock (6 h from Tavern Lv 3), at most 3 waiting, as N1.
  Rarity **Common / Uncommon / Rare / Epic** with odds **0.52 / 0.30 / 0.13 / 0.05** and N1's pity (a Rare
  or better at least every 8, an Epic every 25). A random applicant has a **job** (one of the jobs open now,
  gatherers-2 1), 1-2 N1 traits by rarity, and no temper or signature.
- **Named gatherers are the Legendaries.** When a named gatherer's route fires (gatherers-2 5), they walk
  into the Tavern and take a **star spot** on the board, above the three random spots. Star spots do not
  count toward the 3 and never leave. Every named gatherer is **Legendary**. Tam is Legendary too, and free.
- **N1's Legendary pity (every 90 applicants) becomes Word on the Road:** the next named gatherer whose route
  has not fired gets its fallback now ("Nan says there's a trapper out in the marsh. He'll come if you ask.").
  Random Legendaries no longer roll (the 1% goes to Epic).
- **Turn away** a random applicant as N1. A named applicant can wait for ever (no FOMO).
- **Hire fee (one-off):** `HIRE_FOES[rarity] x GOLD_BASE[region reached]`, `HIRE_FOES = [300, 600, 1200,
  2400, 4000]`. It follows the region you have reached, not your zone, so it steps once a region.

| Region reached | Common | Uncommon | Rare | Epic | Legendary (named) |
|---|---|---|---|---|---|
| 1 Hollow | 1,500 | 3,000 | 6,000 | 12,000 | 20,000 |
| 2 Coast | 5,100 | 10,000 | 20,000 | 41,000 | 68,000 |
| 3 Emberwaste | 18,000 | 36,000 | 72,000 | 140,000 | 240,000 |
| 4 Pale Reach | 63,000 | 130,000 | 250,000 | 500,000 | 840,000 |
| 5 Gloamvale | 220,000 | 440,000 | 880,000 | 1.8M | 2.9M |

A Legendary costs about 3-6 hours of normal income when their route fires, a Common under one.

- **Share by rarity:** 10 / 11 / 12 / 13 / 14% of the Lanternbearer's rate at Lv 1, **x(1 + 0.03 x (lv - 1))**
  (Lv 20: x1.57, so 15.7% to 22%). A Steady's +15% yield sits on top (top: about 25%, inside GT5's 10-30%).
  This replaces N1's `share` and `perLv` and gatherers-2's flat 12% + 0.4%. Named gatherers have the most
  share and a temper, a signature and the Trade branch of the tree; random ones have traits and the Road and
  Hearth branches only.
- **Letting go:** a random gatherer leaves for good (N1's Let go, the UI asks first). A named gatherer
  **goes back to the Tavern**: their star spot returns, with their level, tree and counters, and re-hiring
  them is free ("They remember you."). Nobody loses a level.

### 4.2 Shift fees

A shift is **4 hours** for every gatherer (+15 min every 5 levels, +30 min Long Legs, +1 h Tireless; N1's
2-8 h by rarity goes, so a fee buys the same time from anyone). The fee is paid **when you send** and set by
the **grade** of the job (a node's grade; a Hunter's zone grade; a refiner's station order grade) and the
gatherer's level:

```
fee(g, lv) = FEE_FOES[region of g] x GOLD_BASE[region of g] x FEE_STEP[position of g in its region] x (1 + 0.02 x (lv - 1))
FEE_FOES = [400, 240, 171, 133, 120]      FEE_STEP = [1, 1.1, 1.2]      rounded to 2 significant digits
```

| Grade (region) | Lv 1 | Lv 5 | Lv 10 | Lv 15 | Lv 20 |
|---|---|---|---|---|---|
| 1 (Hollow) | 2,000 | 2,200 | 2,400 | 2,600 | 2,800 |
| 2 | 2,200 | 2,400 | 2,600 | 2,800 | 3,000 |
| 3 | 2,400 | 2,600 | 2,800 | 3,100 | 3,300 |
| 4 (Coast) | 4,100 | 4,400 | 4,800 | 5,200 | 5,600 |
| 5 | 4,500 | 4,800 | 5,300 | 5,700 | 6,200 |
| 6 | 4,900 | 5,300 | 5,800 | 6,300 | 6,800 |
| 7 (Emberwaste) | 10,000 | 11,000 | 12,000 | 13,000 | 14,000 |
| 8 | 11,000 | 12,000 | 13,000 | 14,000 | 16,000 |
| 9 | 12,000 | 13,000 | 15,000 | 16,000 | 17,000 |
| 10 (Pale Reach) | 28,000 | 30,000 | 33,000 | 36,000 | 39,000 |
| 11 | 31,000 | 33,000 | 36,000 | 39,000 | 42,000 |
| 12 | 34,000 | 36,000 | 40,000 | 43,000 | 46,000 |
| 13 (Gloamvale) | 88,000 | 95,000 | 100,000 | 110,000 | 120,000 |
| 14 | 97,000 | 100,000 | 110,000 | 120,000 | 130,000 |
| 15 | 110,000 | 110,000 | 120,000 | 140,000 | 150,000 |

- **Levelling pays:** Lv 20 charges x1.38 and brings x1.57 (share), so a unit costs about 12% less.
- **Old grades are cheap:** a grade-2 shift in Region 3 costs 2,200 when you earn about 25,000 an hour.
  Old-grade jobs (tree costs, Tents, trade cargo) never squeeze the budget; the current grades do.
- **Rarity is value, not price:** the fee does not read rarity. An Epic brings 30% more than a Common for the
  same fee; that is what the hire fee buys.
- `FEE_FOES` is set so that a full crew running all day (6 shifts each) costs **about 1.15x an idle player's
  fighting income at the region's first zones, and about 0.6x by its boss** (section 8, EC3). Region 1 is
  the tutorial: 0.55-0.65 throughout.
  The worked numbers (full crew = every Tent the region opens; early = Lv 1 at the region's lowest grade,
  late = Lv 10 at its top grade; income from 2.2):

  | Region | Crew | Full crew all day / idle income, early | late | Normal play (3 shifts a day) / normal income, early | late | Active (5 a day) / active income, early | late |
  |---|---|---|---|---|---|---|---|
  | 1 Hollow | 2, then 3 | 0.55 | 0.62 | 0.22 | 0.25 | 0.26 | 0.30 |
  | 2 Coast | 5 | 1.15 | 0.63 | 0.46 | 0.25 | 0.55 | 0.30 |
  | 3 Emberwaste | 7 | 1.11 | 0.65 | 0.44 | 0.26 | 0.53 | 0.31 |
  | 4 Pale Reach | 9 | 1.14 | 0.63 | 0.46 | 0.25 | 0.54 | 0.30 |
  | 5 Gloamvale | 10 | 1.14 | 0.60 | 0.46 | 0.24 | 0.54 | 0.29 |

  So early in a region, sending everyone every time takes about half of a normal player's gold, with Tents,
  the Hearth and Blade asking for the rest; by the boss it is a quarter.
- **Tam's first three shifts are free** (he is family), so the first send never waits on gold.
- **Free for the Lanternbearer's own nodes?** No: a gatherer's fee is the same wherever they work. Gathering
  yourself is always free; that is the choice.

### 4.3 Unpaid, queued and cancelled shifts

- **Unpaid = cannot send.** The Send button reads "Needs 1,400 more gold" and stays tappable to show where to
  get it (Fight). Nothing else happens: no leaving, no lost levels, no mood.
- **Queue (offline cover):** at send you choose **1 or 2 shifts in a row** (3 with the tree's **Second Wind**,
  gatherers-2 4.3 B2, which is changed to this). All fees are paid at send. After each shift the gatherer
  unloads, rests 30 minutes, and goes out again to the same job with the same rate and the next seed. A pack
  that cannot unload (Storehouse full) stops the queue and **refunds the shifts that did not start**.
- **Recall:** a gatherer out on a shift can be called home. The current shift's fee is not refunded (the
  haul so far comes home, pro rata); queued shifts are refunded.
- **Price changes:** the fee is fixed at send, like the rate. Levelling mid-queue does not change it.

### 4.4 Levels, and the Lanternbearer's own upgrades

- Gatherer levels are unchanged (hours worked, 1-20, gatherers-2 4.1).
- **Blade** keeps its shape with a slower price: `5 x 1.05^n` instead of `10 x 1.18^n`. Priced against the new
  income, it should reach today's measured levels on about the same days if it takes about 25% of spend
  (an estimate from the measured Blade levels and the income table; EC9 checks it) (Lv 50 in the
  first hour, 100 on day 2, 140 at the Region 1 boss, 178 at the Region 2 boss), and slows by itself as prices
  outgrow a region's income: about Lv 230 in Region 4 and 260 in Region 5. BAL checks it with T1-T3, D1,
  P1-P2 (section 8, EC9).
- **Swiftness** `20 x 1.25^n`, cap 40 (unchanged cap).
- **Fortune becomes Precision** (section 6.2).

---

## 5. Tents (the crew cap)

**Changed from N1's Bunkhouse and gatherers-2's beds and lodgers.** The cap on hired gatherers is the number
of **Tents** in camp. Each Tent is one hired gatherer. There is no lodging, no swap and no separate crew:
everyone you have hired has a Tent and works.

| Tent | Opens (gate) | Gold | Materials | Build time | When (normal play) |
|---|---|---|---|---|---|
| 1-2 | Free with the Tavern at Hearth 2 (with Tam) | 0 | - | - | about hour 1 (zone 10) |
| 3 | Hearth 4 | 23,000 | 120 Birch, 80 Linen, 40 Leather | 1 h | day 1-2 |
| 4 | The Coast reached | 42,000 | 150 Mangrove, 100 Cotton, 60 Sharkskin | 2 h | day 7-9 |
| 5 | Coast, zone 50 (grade 5 open) | 90,000 | 80 grade-4 Planks, 80 grade-4 Cloth, 40 grade-4 Leather | 4 h | day 14-18 |
| 6 | The Emberwaste reached | 150,000 | 100 grade-6 Planks, 100 grade-6 Cloth, 50 grade-6 Leather | 6 h | about day 30 |
| 7 | Emberwaste, zone 85 | 320,000 | 120 grade-7 Planks, 120 grade-7 Cloth, 60 grade-7 Leather | 8 h | about day 38 |
| 8 | The Pale Reach reached | 520,000 | 120 grade-9 Planks, 120 grade-9 Cloth, 60 grade-9 Leather | 10 h | about day 48 |
| 9 | Pale Reach, zone 120 | 1.1M | 140 grade-10 Planks, 140 grade-10 Cloth, 70 grade-10 Leather | 12 h | about day 56 |
| 10 | The Gloamvale reached | 2.3M | 160 grade-12 Planks, 160 grade-12 Cloth, 80 grade-12 Leather | 16 h | about day 65 |

- Gold is 8-10 hours of normal income at the gate. Materials ask for the region's refined goods from Tent 5,
  so chains matter to the crew (gear-2 3). Grade-2 and grade-4 names are materials.md's; the later grades say
  "grade-g" until the rows are built.
- A Tent is a camp build (a builder, a timer, queueable, cancel refunds as today). It is **one camp row with
  levels 0-10** (`CAMP_B.tent`, `max: 10`, level = Tents built; `pre: 0`, set to 2 when Hands open). Tents
  1-2 need no plot; Tents 3-10 take spots on the tent ground (WC1 places them on the panorama; one sprite
  a Tent, the gatherer sits by theirs at night).
- **The Bunkhouse building retires** (its beds become Tents). Its N1 at-camp perks (none) and effect lines go.
  WC1 may reuse the plot. The `handBeds` and `handBedsMax` bonus keys stay: a building tree node (BT1) can add a
  Tent-free slot ("Bunk beds: +1 gatherer") up to `tentMax` 11.
- **Crew by region** (Tents open): Region 1: 2, then 3; Region 2: 5; Region 3: 7; Region 4: 9; Region 5: 10.
  WC1: if world-camp-2.md sets different building gates, keep the counts per region and move the gates.

---

## 6. Gold-gain: gear keeps it, everything else becomes crit damage

### 6.1 Gold on gear (the only gold-gain)

| Source | Today | New |
|---|---|---|
| Charm base line `gold` | 0.8 x `p` (+650% at grade 5) | **0.04 x `lp`** (gear-2 line power): grade 5 Rare +5 about +16%, grade 15 Legendary +10 about +30% |
| The charm as a choice | one line set (gold + essence) | **two line sets** (gear-2 2.2): **Fortune** (gold 0.04 lp, essence 0.3 lp) or **War** (damage `might` 0.25 p, essence 0.3 lp). You choose at craft; Reforge can swap the set. Taking Fortune costs about 5-10% party damage (EC8) |
| `gold` affix (`CRAFT_AFFIXES`) | rolls like other economy affixes | halved, on `lp`; it takes an affix slot a damage or crit line could have |
| Crown of Hollows (raid unique, +40% gold) | +40% | **+10% gold**, item data only (local; raid docs untouched) |
| **Cap** | none | **gear gold +30% total** (core-2 1.1 row "economy lines": add the cap, section 10) |

`goldMult() = (1 + min(30, gear().gold) / 100) x omen`. At most x1.3 from gear; the Gold Rain Omen x1.3 on its
day (6.3). So income is always within x1.7 of the table in 2.2.

### 6.2 Crit damage from everything else

Every other gold-gain source becomes **crit damage** in one pool (code id `keen`).

```
keen = min(KEEN_CAP, Σ sources)          KEEN_CAP = 0.40 (+40% crit damage)
crit multiplier x (1 + keen)             every party member: the Lanternbearer through mod('critDmg'),
                                         heroes through their crit multiplier in 59-combat (one hook)
```

- It sits in **bucket A (account)** of core-2 1.3 and multiplies the crit multiplier (Lanternbearer base x4,
  strikers x3). At 30% crit chance, +40% crit damage is about +25% damage; at 8% it is about +10%.
- **Slow ramp:** targets (EC7) are about +10% by the Region 1 boss, +20% by the Region 2 boss, +30% by the
  Region 3 boss; the cap in Region 5 for a thorough player. The sources below add to about +75%, so the cap
  is reached without every source, and it binds.

| Source (file) | Today (gold) | New (crit damage) |
|---|---|---|
| **Fortune** upgrade (`HERO_UPS`, 20-data) | +10% gold a level, no cap | **Precision**: +1% a level, cap 15 (+15%); price in 3.3 |
| **Lucky Coin** relic (`RELICS`, Embers from the raid) | +25% gold a level | **Loaded Die**: +2% a level, cap 5 (+10%); price in Embers unchanged |
| Zone mastery stars (55-mastery) | +10% gold a star in that zone | +1% a star in that zone (max +5%) |
| Bestiary, Bones perk (55-mastery) | +3 / 6 / 10 / 15% gold | +1 / 2 / 3 / 5% |
| Shrine Blessing **Coin** (57-camp) | +12% gold x Blessing power | Blessing **Edge**: +6% x Blessing power |
| Codex seal, Zones page (57c-codex; cap key `gold` 0.05) | +3% gold | +3% (cap key `critDmg` 0.05) |
| Constellations: Banner Over Camp, Vigil (57e) | +6% gold, +6% away | +3% crit damage, +6% away |
| Kin: Hedgefolk (56b-synergy) | +5% gold | +3% |
| Combo "You get 5% more gold" (56b-synergy) | +5% gold | +3% |
| Set: Hearth and Hedge, tier 2 (55-legend) | +10% gold | +5% |
| Deeds, bonus key `gold` (23-data-deeds, 58-deeds; `DEED_CAP.gold` 0.03, `DEED_BONUS.gold` a tier) | up to +3% gold | same numbers, key `keen` (cap 0.03) |
| Old achievements (56-achievements: zone10, zone50, kill1k, kill100k, gold1m, gold1b, bty50) | +2 to +5% gold each (+20%) | half: +1 to +2.5% each (+10%) |
| Gold Rain Omen (55-almanac) | +30% gold today (Dare: +80%, foes +30% HP) | **stays gold** (6.3) |

### 6.3 The one exception: Gold Rain

The Gold Rain Omen stays a gold day (+30%; its Dare "Gold Fever" +60%, foes +30% HP). It is a day's
event, not a growing multiplier, and it gives the budget a good day to plan around ("Gold Rain today: send the
whole crew"). Recommended to keep (decision 6 in section 12).

---

## 7. Offline behaviour

| Thing | While you are away |
|---|---|
| Fighting gold | As today: packs a second from the hold estimate x `awayRate` 0.75, up to the away cap, at the new `foeGold` |
| Shifts | Fixed at send (place, rate, length, seed, fee). They run and end on wall clock; packs unload as parcels (N1). Queued shifts (4.3) start 30 minutes after the pack unloads, in closed form inside `handsCatchUp` |
| Fees | Paid at send, never while away. Gold cannot go below 0; nothing charges on the away phase |
| Refunds | A queued shift that cannot start (Storehouse full, you recalled them) refunds its fee on the away phase; the away card says so: "Nan's second shift was refunded: the Storehouse is full (1,400 gold)." |
| Applicants | Arrive on wall clock (N1): up to 3 random waiting, plus any named star spots |
| Tents | Camp builds: finish on wall clock, like every build |
| Order of the away phase | fight gold, then camp builds, then gatherers (so nothing depends on gold earned away) |

**What a night gives:** a normal player sending the crew at 19:00 with a 2-shift queue covers 19:00-03:30 (two 4 h
shifts and a 30 min rest). With Second Wind (3 shifts) it covers the whole night. Each shift is paid up
front, so a big night costs its fees at the evening check-in. That is the choice: fight a bit longer before
bed to afford a third shift, or send fewer.

---

## 8. Sim targets and how `tools/sim.mjs` checks them

### 8.1 Player profiles

| Profile | Check-ins | Session | Away activity | Crew policy |
|---|---|---|---|---|
| **idle** | 08:00, 20:00 | 10 min | fight every gap | send every gatherer at each check-in with a full queue (2 shifts) |
| **normal** (today's default) | 08:00, 13:00, 19:00 | 15 min (first 60) | the morning gap gathers, the rest fight | send at each check-in; 1 shift by day, 2 at 19:00 |
| **active** | 08:00, 10:00, 12:00, 14:00, 17:00, 20:00, 22:00 | 30 min | fight | send at each check-in; 1 shift by day, 2 at 22:00 |

`--profile idle|normal|active` sets `--checkins` and `--session` and the crew policy. Spend policy (all
profiles): keep 1 shift's fee per gatherer in reserve at each check-in; then buy in this order: a Tent that
opened; the next camp build Next Up names; hires while a Tent is free (named first, then Rare or better);
Blade and Swiftness up to 25% of the check-in's income; Precision; the rest waits.

### 8.2 Targets (ECON, `--targets` and `--report econ`)

| Id | Target | Band |
|---|---|---|
| EC1 | `foeGold(z)` matches the table in 2.2 at the sample zones | exact (check.mjs, static) |
| EC2 | Income a day by region (foe-equivalents a day, 24 h average), per profile | idle 5,000-7,000; normal 6,500-8,500; active 9,000-12,000 (fix the table in 2.2 to the measurement if outside) |
| EC3 | **Crew pressure:** fees of the region's full crew sending 6 shifts a day, over the idle profile's fighting income | first 5 zones of Regions 2-5: 1.05-1.40; last 5 zones: 0.50-0.75; Region 1: 0.45-0.80 |
| EC4 | Normal play, spend split per region (sim ledger) | shifts 25-45%; camp (Hearth, buildings, Storehouse, Tents) 25-40%; Blade, Swiftness and Precision 15-30%; the rest (hires, recruits, promotions, crafting, Sigils) 5-20% |
| EC5 | Gold always has a use: banked gold after spending at a check-in | under 1 day of income at 90% of check-ins; an affordable purchase or shift at 95% of check-ins |
| EC6 | Camp pacing | Hearth 2 bought in hours 2-6 of play (normal); the camp's last Region 2 row not before day 30 (today day 24) |
| EC7 | Crit damage pool (normal play) | Region 1 boss 6-14%; Region 2 boss 14-24%; Region 3 boss 22-32%; cap not before Region 5 |
| EC8 | Gear gold | gear gold never above 30% (static); the Fortune charm's damage cost 5-10% of party dps at grades 3, 6, 9, 12, 15 |
| EC9 | Pace unchanged | T1-T3, D1, P1, P2 still pass; max zone at days 1, 3, 8, 14, 30 within 10% of today's (Blade repricing) |
| EC10 | No inflation | `S.gold` and every price under 1e8 through Region 5 (normal); the largest price is Tent 10 or Hearth 10 of its region |
| EC11 | Levelling pays | units per gold at Lv 20 over Lv 1, same job and grade: 1.12 or more |
| EC12 | The choice is real | with `--crew 0` (no gatherers) normal play hits E2-E4 (gear-2 8.2) within 1 more check-in a grade; with the full crew and no Blade spend, P1-P2 slip by at most 15% |
| EC13 | Named gatherers are worth their fee | a Legendary's output over the fee it cost to hire plus its first 20 shifts is 1.3x a Common's or better |

### 8.3 Sim changes

- `--econ 0|1` (default 1 once ECON-A lands; 0 = today's curve for before/after), `--profile`, `--crew 0|1`.
- A **gold ledger** in the sim (and in the game, `S.econ.spent`, section 9): earned by source (fight live,
  fight away, bounties, trade), spent by category (shift, hire, tent, camp, upgrade, craft, recruit, other).
- `--report econ [--days 90]`: per region the income a day by profile, the spend split (EC4), banked gold
  (EC5), the crew ratio (EC3, computed in closed form from the fee table and the measured idle income), the
  crit damage pool at each boss (EC7), and the price of the five biggest purchases.
- `check.mjs` section `econ`: EC1, EC8's cap, EC10's static part (every price table under 1e8), fees and hire
  tables equal to `ECON` data, no `mod('gold')` source left except the Omen (a registry probe: with every
  save field maxed, `goldMult() <= 1.3 x 1.8`).

---

## 9. Save plan

The owner accepts a wipe before 1.0 (CLAUDE.md). ECON1 changes what `S.gold`, `S.fortune`, `S.relic.coin`
and every Hand record mean, so it **bumps the save key**: `lanternfall.save.v1` becomes
`lanternfall.save.v2` (`30-state.js` `KEY`, and the copies in `tools/check.mjs`, `tools/perf.mjs`,
`tools/sim.mjs --from-save`). An old v1 save is never read; the game starts fresh. If S4 (gear-2) lands in the
same wave, **one bump covers both** (the coordinator picks the wave; the second task checks the key is
already `v2` and leaves it).

- `S.v` becomes 3. `tests/fixtures/*.json` are replaced by fresh v3 fixtures made with the sim's
  `--snapday` (the coordinator keeps a late-game test save, as agreed).
- New fields, all with defaults in `fresh()` or `registerState`:

| Field | Meaning |
|---|---|
| `S.precision` | Precision upgrade level (0-15). `S.fortune` stays in `fresh()` at 0, unused |
| `S.relic.edge` | Loaded Die relic level (0-5). `S.relic.coin` stays at 0, unused |
| `S.econ` | `{ v: 1, spent: { shift, hire, tent, camp, up, craft, recruit, other }, earned: { fight, away, bounty, trade, other } }` (the ledger; also the Journal's "Where your gold went") |
| `S.camp.b.tent` | Tents built (0-10); set to 2 when Hands open |
| `S.hands.v` | 3 |
| hand `r` | rarity (kept from N1; named gatherers `legendary`) |
| hand `job` fields `fee`, `q`, `qFee` | the fee paid for the running shift; queued shifts left; their fees (refundable) |
| `S.hands.board.star` | named applicants waiting: `[key]` |
| `S.hands.tamFree` | Tam's free shifts left (3) |

- Gatherers-2's `bed` and lodger fields are **not** added (Tents replace them). `S.camp.b.bunk` is not written.

---

## 10. Proposed core-2 change-log lines (for coordinator sign-off)

1. **1.1 `gold`:** the economy line `gold` gets a cap: **+30% total from gear**. No other source adds to gold
   except the Gold Rain Omen.
2. **1.1 `critMult` and 1.3 bucket A:** a new account-wide crit damage pool (`bonus('keen')`) multiplies every
   party member's crit multiplier by `1 + min(0.40, keen)`. Every former gold-gain source outside gear feeds
   it (6.2). Hard cap **+40%**.
3. **8.2 reserved keys:** `S.econ`, `S.precision`, `S.relic.edge`, `S.camp.b.tent`; save key `v2`, `S.v` 3.

---

## 11. Build split

File numbers checked against `src/js` and every name the design docs reserve: **`21r`** is free (21p and 21q
stay N3a's and LORE-G's; 21g, 21k, 21n, 21o are S4, S5, TR1). **`55-econ.js`** and **`75-econ-ui.js`** are
unused names. Nothing here uses 59e, 59g, 59h, 59i, 59j or 57h.

| Task | Work | Owns (new files) | Small edits in | Needs |
|---|---|---|---|---|
| **ECON-A** Gold curve and prices (Opus, M) | `ECON` data (curve, hour rule, every price table, fee and hire tables, Tent rows, crit-damage sources and cap), the ledger `S.econ`, `foeGoldBase(z)`, `econHours(h, z)`, `keen()` / `keenMult()`, Precision, the Loaded Die, the gold-to-crit-damage conversions, the save-key bump, Next Up goals for Tents; sim `--econ`, `--profile`, `--report econ`, EC1-EC13; check section `econ` | `src/js/21w-data-econ.js`, `src/js/55-econ.js` | `40-rules.js` (`mobGold` on `foeGoldBase`; `goldMult` without Fortune and the relic; `critMult` x `keenMult()`); `20-data.js` (`HERO_UPS` Blade, Swiftness, Precision; `RELICS` the Loaded Die; Crown of Hollows); `30-state.js` (`KEY`, `S.v`, `fresh()` fields); `56-roster.js` (`foesGold`, `promoGold`); `57-camp.js` (`CAMP_TUNE` hour rule, `CAMP_HEARTH` hours, Blessing Edge, `CAMP_B.tent`, Bunkhouse retired); `55-store.js` (gold rows); `21-data-craft.js`, `41-items.js` (charm line sets, gold line on `lp` and its cap, gold affix, upgrade and reforge gold); `55-legend.js` (inscribe k, set bonus to crit damage); `55-mastery.js`, `57c-codex.js`, `57e-constellations.js`, `56b-synergy.js`, `56-achievements.js`, `23-data-deeds.js`, `58-deeds.js` (sources to crit damage, gold thresholds); `59-combat.js` (heroes' crit multiplier x `keenMult()`, one line); `tools/sim.mjs`, `tools/check.mjs`, `tools/perf.mjs` (`KEY`) | - (can start now; lands with or before S4 for one key bump) |
| **N3a** Gatherers core, revised (Opus, M) | gatherers-2 as revised: the board (random C-E with pity, named star spots, Word on the Road pity), hire fees, rarity shares, jobs for random applicants, shift fees, queue and refunds, recall, Tam's free shifts, Tents as the cap, the talk-panel data (`handsTalkInfo`, 11.1), plus everything gatherers-2 12 lists for N3a minus lodgers and Swap | `src/js/21p-data-gatherers.js`, `src/js/57h-gatherers.js` (unchanged names) | `57f-hands.js` (fee at send, queue, refunds, `handsBeds()` reads Tents, N1's `hireFoes`/`shiftH` retired), `21f-data-hands.js` (odds, pity, shares) | ECON-A (`21r` tables) |
| **ECON-B** Gold screens (Sonnet, S) | Journal: "Where your gold went" (the ledger, by region); the crit-damage sheet (sources, cap bar) from the Party tab's stats; price chips "about 2 h of fighting" on camp and Tent costs; the Precision row in upgrades | `src/js/75-econ-ui.js`, `src/styles/60-econ.css` | `75-stats-ui.js` (mount the ledger card) | ECON-A |
| **N3b / WC1** | The Tavern board with star spots and fees, the talk panel and its Send sheet (fee, queue, "Needs x more gold"), Tents on the camp panorama | as gatherers-2 12 (`75-hands-ui.js`, `60-hands.css`) and WC1's files | `74-ui-tavern.js`, `75-camp-ui.js` | N3a |
| **BAL-E** (Sonnet, S) | Run `--report econ` for the three profiles over 90 days, tune `GOLD_BASE`, `FEE_FOES`, hour rows and the Blade price to EC2-EC13 | - | `21w-data-econ.js` (numbers only) | ECON-A, N3a |

Merge order: ECON-A first (it can ship before N3a: Hands keep N1's rules with the new hire table and fees
applied by a small `57f` hook, Tents at 2 plus N1's Bunkhouse beds until N3a lands), then N3a, then ECON-B
and N3b in parallel, then BAL-E. Every task runs `node tools/build.mjs`, `node tools/check.mjs` and
`node tools/perf.mjs --quick`. No per-tick cost is added: prices are table reads; crit damage is a cached sum
refreshed on the events that change its sources.

### 11.1 Data for the talk panel (WC1/N3 draw it)

`handsTalkInfo(id)` (57h, pure, no DOM) returns everything the panel needs:

```js
{ id, key, name, rar, rarName, job, jobName, tmp, lv, share, line,          // line: a talk line (LORE-G), rotates with handsTalk(id)
  status: { st: 'camp' | 'out' | 'back' | 'pack', label, left, pct },
  gold: S.gold, queueMax: 2 | 3, freeShifts: 0-3,                          // freeShifts: Tam only
  jobs: [                                                                    // limited to their profession (gatherers-2 1)
    { kind, t, place, name,                                                  // kind: family or 'hunt' | 'refine'; place: node, zone or station
      fee, feeNext,                                                          // this level's fee; the fee at the next level (for "levelling pays")
      haul, secs, own, full,                                                 // what one shift brings (handsPreview), Storehouse full chip
      can: { ok, why } }                                                     // why: 'Needs 1,400 more gold' | 'Out on a job' | 'Pack waiting' | 'Storehouse full'
  ],
  suggest: { kind, t, why } }                                                // the top row (handsSuggest)
```

Sorted: the suggestion first, then grades high to low. The panel picks a resource and a grade, sees the fee and
the haul, picks 1-3 shifts, and taps **Send** (`handsSend(id, kind, t, { shifts })`).

---

## 12. Decisions for the owner

1. **The gold curve** (2.1): x3.5 a region, +5% of the region's base a zone (x2.7 by the boss), 5 gold a foe at
   the start and about 2,000 at the Voice. Recommended: **yes**.
2. **Named gatherers are the Legendaries** (4.1): random applicants roll Common to Epic with N1's odds and
   pity; every named gatherer is Legendary and waits on the board in a star spot; N1's Legendary pity now
   brings the next named gatherer early. Recommended: **yes** (it keeps rarity and pity and makes the
   named people the prize).
3. **Shifts are 4 hours for everyone, paid at send, with a queue of 2** (3 with Second Wind), refunded if they
   cannot start. Recommended: **yes** (it covers a night without a wage or debt).
4. **Blade stays a gold upgrade on a gentler curve** (`5 x 1.05^n`), tuned to reach today's levels on the same
   days. Recommended: **yes** (moving it to XP would redo the Lanternbearer's pacing; this keeps it and caps
   its share at about a quarter of spend).
5. **Crit damage: +40% cap** for every former gold-gain source except gear; Fortune becomes Precision, the
   Lucky Coin becomes the Loaded Die. Recommended: **yes**.
6. **Gold Rain stays a gold day** (+30%) as the one non-gear gold boost. Recommended: **yes** (a day event to
   plan the crew around; everything permanent became crit damage).
