# Progression stalls: where the climb stops, and how to plug it (night 2)

Status: analysis and proposals, 2026-10-01. No code changed. Owner decisions this file takes as given: combat is
active only (no Auto, no away combat earnings); 175 zones (5 regions x 7 areas x 5 zones), each zone 5 fights then a
Shadowborn Captain; Champions (area) and Elders (region) are fought once; enemies drop gold, Essence, relics, uniques
and Trophies only; every crafting material comes from a gathering skill; saves can be wiped before 1.0.

> Retired specs named on this page (for example `gear-2.md`, `pacing.md`, `ability-validation.md`) are no longer in
> `docs/`. Read them with `git show 1536ffa:docs/design/<file>.md`. Current rules: `docs/GAME.md` and
> `docs/DECISIONS.md`.

Goal: getting new gear stays exciting from zone 1 to zone 175.

## 0. The short version

1. **There is no power past about zone 45.** Gear stops at tier 5 (zone 42). Training stops at Lv 80. With everything
   maxed (hero Lv 80, Training 80, a full tier 5 Epic +10 set) the hero clears a normal foe in 20 s only up to
   **zone 71** (measured, headless core). Zones 72-175 cannot be won. Mob HP grows x1.22 a zone; nothing else does.
2. **Hero XP hits a wall at about zone 24.** XP a foe grows with the zone (1.5 x z). The XP for a level grows x1.3 a
   level. Playing each zone once gives Lv 21 at zone 35 and Lv 33 at zone 175. Training cannot pass the hero's level,
   and the Proving needs Lv 35. At zone 30 one hero level takes **7 active hours**; at zone 42 it takes **117 hours**.
3. **Gold falls while prices rise.** The early gold boost (x2) fades to x1 from zone 20 to 35, so a foe at zone 35 pays
   less than a foe at zone 20. Prices were set as "hours of income" when income ran 24 hours a day (away combat). Now
   they mean hours of active play: a full tier 5 set to +10 costs **47 active hours** of gold at zone 42.
4. **Bosses fought once starve two systems.** Uniques (15% on a first kill) and Trophies (needed for +8 to +10, the
   Hearth and building rows). If only Champions and Elders drop Trophies, the game makes 40 and asks for about 130.
5. **Many rewards are about being away.** Hearth, Watchtower, Hourglass, Sporeheart, the Spore Cap Bestiary perk, the
   Codex Road seal: all pay "away gains", which no longer include combat.
6. **Measured today (sim, ranger, active, 30 h continuous):** zone 22 at 9 h, then **9 hours to zone 23**, zone 26 at
   24 h. Warrior and Mage runs stall at zones 19 and 16 for 24+ hours (see 2.3 for the sim caveat).

The fixes that matter most, in order: a hero XP curve that follows the zone (2 lines of code), Rested XP in place of
away combat, a power budget per region with gear grades 6-15, guaranteed first-kill rewards on every boss, a unique
pity timer plus Attune (bring an old unique up to your grade), and gold prices re-based on active hours.

---

## 1. Map of every progression system

How to read it: **Cost** is what the player pays. **Gives** is the power or access it returns. **Scales** is how the
cost and the gift grow. Numbers are from the code (file in brackets).

### 1.1 Power systems (make the hero hit harder or survive)

| System | Cost | Gives | Scales | Limit |
|---|---|---|---|---|
| Hero level (`50-sim` gainXp, `40-rules` xpNeed) | XP from fights: 1.5 x zone a foe, x5 for a boss | +4% damage a level; raises the Training cap; 1 star point every 3 levels | XP need x1.3 a level (Lv 40: 417K, Lv 50: 5.7M, Lv 60: 79M) | none, but see the wall in 2 |
| Training (`55-training`) | Gold. Attack base 6, ability 8, x1.2 a level to 20, x1.28 to 40, x1.15 after | Attack hit (4 + 6 x lv), x1.7 every 5 levels to 25, x2 after. Ability similar. Parry, Dodge | about +18% damage a level (Attack + ability) | hero level; 40 before the Proving, 80 after |
| Crafted gear (`21-data-craft`, `55-crafting`, `41-items`) | Materials of the item's tier (no gold). 3-7 units of 2-4 families, x(1 + 0.5(t-1)) | Item power 10 / 22 / 42 / 75 / 130 by tier, x rarity (1 / 1.35 / 1.8 / 2.5) | tier step x2.2, 1.9, 1.8, 1.7 | **tier 5 is the last** (`validTier`, `TIER_POW`) |
| Tier gate | Station level 1 / 10 / 22 / 36 / 54; materials of that tier | access | crafts: 8 / 10 / 13 / 23 per gate (cheap) | Essence tier by zone: 1 / 7 / 13 / 19 / 42 |
| Upgrade +1 to +10 | Gold 20 foes of the grade's first zone x (plus+1); materials 0.6 x recipe x (plus+1); +8, +9, +10 also 1 Trophy each | +15% item power a plus (x2.5 at +10) | linear in plus | +10 |
| Rarity | Re-craft (rarity rolls by station level: at 54, Common 8 / Uncommon 39 / Rare 37 / Epic 16) | x1.35 / 1.8 / 2.5 | flat | Epic for crafts |
| Reforge (`55-crafting`) | Essence + gold 15 foes x 1.5^n | reroll one affix line | x1.5 a reforge | none |
| Masterwork | 1 Trophy at craft | one extra line at 0.25 p | with p | one a craft |
| Uniques (`20-data` UNIQ, `50-sim` killPack) | Luck: 15% on a first boss kill, 4% on a replay, x0.5 if owned | Rare-level power (x1.8) plus an effect | tier = the zone's Essence tier | 7 designs in use (Coast reuses the Hollow's) |
| Constellations (`57e`) | Star points: Lv/3 + 4 a Great Lantern | 31 stars a class; damage, crit, cooldowns | with hero level | 2 keystones |
| Zone mastery (`55-mastery`) | 25 / 100 / 300 / 800 / 2,000 kills in one zone | +10% damage there and +1% everywhere a star | kills | **dead**: a zone is 6 fights a pass |
| Bestiary | 10 / 100 / 1,000 / 10,000 kills of a type | 3-15% perk by type (one is "offline gains") | kills | 7 types |
| Foe profiles (C25) | 1 / 5 / 15 / 50 kills of a foe | info, then +5% damage against it | kills | per foe |
| Crit damage pool (`55-econ` keen) | many small sources | crit damage | | +40% cap |
| Relics (`20-data` RELICS) | Embers (world raid only) | Banner +20% damage a level | x1.6 a level | online only |
| Proving / evolution (`55-classes`) | Beat the Fenmother (zone 35) and reach Lv 35 | evolved kit; Training cap 40 -> 80 | | once |
| Tonics | Herbs + Essence | +15% damage for 20 min (Vigor) | tier | one at a time |
| Well Rested (`55-rested`) | Gather 6 min | +10% damage for up to 3 min of fighting | | 180 s |

### 1.2 Economy and access systems

| System | Cost | Gives | Scales |
|---|---|---|---|
| Gold (`21w-data-econ`) | earned from foes: base 5 / 17 / 60 / 210 / 735 a region, +5% a zone; x2 to zone 20, fading to x1 at 35 | Training, upgrades, camp, Hands, tents | x3.4-3.5 a region |
| Essence | fights only: 25% a kill (x gear), boss +3; tier = zone's Essence tier | recipes, upgrades, reforge, camp | per kill |
| Gathering (`55-gathering`) | time; skill levels open node tiers at 1 / 14 / 30 / 64 / 112 | ore, wood, gems, fibre, herbs, hide | XP 10 x lv^2.2 a level |
| Hunting | time; 3 beasts = hide tiers 1-3 only | hide | tiers 4-5 never offered |
| Transmute | 4 of tier t -> 1 of t+1 (Enchanting gate); 1 -> 2 down | crosses skill gates | 4^n |
| Camp Hearth 2-10 (`57-camp`) | 0.05-36 h of income at zone 10-55; materials; 2-8 Trophies from Hearth 5; 2-48 h timer | building levels, builders, away gains +3%/lv | see 3.3 |
| Stations Lv 2-5 | gold rows 1.5-8 h; materials; Trophies at rows 4-5 | skill XP +10-30%; Lv 5 perks (Rare odds, salvage, transmute) | |
| Storehouse 1-8 | gold and materials | material caps 5K -> 2.5M a cell | |
| Watchtower, Library, Shrine, Tavern | gold, materials, Trophies | away hours; gathering and hero XP +5%/lv; Blessings; bounties | |
| Hands, Tents | hire 300-4,000 foes of gold; shift fees | gatherers work while you play | x region |
| Bounties | play | about 4 min of gold, materials, Essence, Renown | |
| Deepwell (`57d`) | play | Depth Marks for Deepwell-only boons, looks, titles, lore | none to main progress |
| Deeds (`58-deeds`) | play | titles, looks, small capped bonuses | |
| Trophies | 1 per first zone-boss kill from zone 20; champions 1 in 150 packs; raid | +8 to +10, Masterwork, Hearth and building rows, Star Chart | |

### 1.3 What the hero needs per zone (the demand side)

Mob HP (`40-rules` mobHp): x1.83 a zone to 11, x1.48 to 27, then **x1.22 a zone forever**, plus x1.7 at zone 35 and
x1.1 at every later region boss. From zone 42 to 175 that is **x450 billion**. Every power source above together grows
far less than that (section 2.2).

---

## 2. The stall table

### 2.1 Method

- **Measured (M):** numbers read from the shipped core in a Node vm (`tools/lib/core.mjs`), from fixtures
  `tests/fixtures/save-*.json`, and runs of `node tools/sim.mjs --policy mixed --class <c> --active --hours 30`.
  Scripts: `scratchpad/night2/{probe,curves,reach,stall,gather,camp,gold}.mjs`.
- **Estimated (E):** a model on top of the measured formulas:
  - An active player wins about **3.5 regular fights a minute** at the frontier (the sim's active ranger: 223 kills in
    about 71 fight minutes; ECON assumes 312 an hour, 5.2 a minute, because it counted idle play).
  - "Can farm zone z" = `trainEst(true)` (the sim's active dps) kills a normal foe in 30 s or less, with Training =
    hero level, gear of the zone's best tier at Rare (+3 to zone 19, +6 to 41, +10 from 42). This is generous on gear.
  - A **meaningful power step** = about +15-20% damage: one Training level of Attack + ability, a gear tier, a unique,
    or 3 pluses on the whole set.
- **Stall** = every route to the next meaningful step takes more than 60 active minutes at once.

### 2.2 How far each state reaches (M, headless core)

| Hero state | dps (active est.) | Last zone at 20 s a foe | at 60 s a foe |
|---|---|---|---|
| Late fixture as is: Pip Lv 49, Training 40, tier 4-5 Rare +10 | 8.3M | 35 | 41 |
| Lv 40, Training 40, tier 1 Common +0 | 1.8M | 30 | 34 |
| Lv 40, Training 40, tier 5 Epic +10 | 15M | 38 | 44 |
| Lv 50, Training 50, tier 5 Rare +10 | 65M | 45 | 51 |
| Lv 60, Training 60, tier 5 Rare +10 | 347M | 54 | 59 |
| **Lv 80, Training 80, tier 5 Epic +10 (everything maxed)** | 12B | **71** | 77 |
| Lv 120, Training 80, tier 5 Epic +10 | 16B | 73 | 78 |

Value of one step at Lv 50 (M): +1 hero level x1.014; +5 Training levels x2.32; whole set tier 5 -> 4 x0.64;
Rare -> Epic x1.33; +10 -> +9 x0.95. Mob HP needs x1.22 for every zone.

### 2.3 Measured timeline (sim, active, mixed play: fight 10 min, gather 5 min)

| Hero | Zone 12 | Zone 15 | Zone 20 | Zone 23 | Zone 26 | At 30 h |
|---|---|---|---|---|---|---|
| Wren (Ranger) | 27 min | 2.5 h | 8.0 h | 18.2 h | 23.7 h | zone 26, Lv 30 |
| Tobin (Warrior) | 18 min | 33 min | never | | | zone 19, Lv 23 (stuck from 4.4 h) |
| Pip (Mage) | 2.0 h | 2.6 h | never | | | zone 16, Lv 21 (stuck from 4.2 h) |

Gaps between new zones for Wren: 29 min (12->13), 81 min (14->15), 206 min (19->20), **551 min (22->23)**.
First tier-1 class set at 22 min (target 6-12), first tier-2 set at 6.4 h (target 35-60 min).

Caveats: the Warrior and Mage runs never crafted class gear (G1 "-"; looks like a sim class-key problem, for the
coordinator) and the policy never goes back to farm an older zone for XP or gold after a Captain loss. Since a Captain
loss now leaves you one paying fight before the retry (`59-combat` wipe), a player who does not walk back earns
almost nothing: Tobin made 626 kills against 1,962 boss losses in 30 h. Read those two rows as "what happens to a
player who does not know to replay", which is itself a gap (G9).

### 2.4 The table: active minutes to the next meaningful step

Columns: **A** next hero level (XP; it lifts the Training cap). **B** gold for that Training level (Attack + ability).
**C** next gear tier (the full set). **D** +1 on the whole set (Essence-bound / gold-bound). **E** expected unique
(15% a first Captain kill, so about 6.7 zones). L = hero level needed to farm the zone (30 s a foe); P = level from
playing each zone once.

| Zone | L / P | A: hero level | B: Training gold | C: next tier | D: +1 set | E: unique | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | 1 / 2 | 2 (M) | 1 (M) | t1 set 22 (M sim) | 20 / 103 | ~15 | fine |
| 8 | 1 / 10 | 1 | 1 | t2 open; set 6.4 h (M sim) | 20 / 99 | ~15 | gear slow |
| 15 | 8 / 14 | 1 | 1 | t3 open; set est. 60-120 (E) | 20 / 97 | ~20 | fine on levels |
| 22 | 19 / 17 | 15 | 7 | t4: ore needs Mining 64 (47 h) or transmute with Enchanting 36: est. 60-90 (E) | 35 / 323 | ~40 | soft |
| 28 | 30 / 19 | **206** | **105** | t5 not before zone 42 | 35 / 358 | stuck | **STALL** |
| 35 | 40 / 21 | **2,247** (37 h) | **1,583** (26 h) | none until 42 | 35 / 457 | stuck | **STALL (hard)** |
| 36 | 41 / 21 | 2,867 | 1,446 | none until 42 | 35 / 363 | stuck | **STALL (hard)** |
| 42 | 45 / 22 | 7,018 (117 h) | 1,945 | t5 open; the last tier | 54 / 512 | stuck | **STALL (hard)** |
| 56 | 60 / 24 | 269K | 10,289 | none, ever | 54 / 333 | stuck | **WALL** |
| 70 | 80 / 26 | 41M | 124K | none | 54 / 246 | stuck | **WALL** |
| 105, 140, 175 | >200 / 29-33 | no level is enough | | none | | | **WALL: unwinnable** |

Column D prices all 9 items; early on a player upgrades one or two, so divide by 5-9 there.

Read across: the hero runs ahead of the levels from zones 1-20 (P > L). From zone 22 the hero needs more levels than
one pass gives, and one level costs more each zone. From zone 28 all routes are slow together: that is the first true
stall. From zone 56 no amount of play is enough.

Gold (M, `gold.mjs`): gold an active hour at zone 18 is 3,885; at zone 27 it is 3,703; at zone 35 it is **2,835**
(the early x2 fades out). One Training level costs 1,442 gold at Lv 25 and 17,010 at Lv 35 (6 active hours).

---

## 3. The gaps, ranked by severity

Severity: **S1** blocks the game; **S2** makes a stretch feel dead for hours; **S3** dulls the gear chase.

### G1 (S1). No power source after tier 5 and Training 80

- Gear ends at tier 5 (zone 42). `TIER_POW` has 5 entries; `validTier` refuses 6+; `MAT` rows are 5 long.
  Gear 2.0 (`gear-2.md`, grades 6-15, 3 a region) is a spec, not code.
- Mob HP keeps growing x1.22 a zone. A maxed hero stops at zone 71-77.
- Regions 3-5 have no data (`REGIONS` lists the Hollow and the Coast; zones 71+ reuse the Coast).

### G2 (S1). The hero XP curve outruns XP a foe

- `xpNeed = 15 x 1.3^(L-1)`; foe XP = `ceil(1.5 x z)`. One is exponential, the other linear.
- One pass of every zone: Lv 21 at zone 35, Lv 26 at 70, Lv 33 at 175 (M).
- The Proving needs Lv 35 and the Fenmother. Training is capped by hero level. Star points are Lv/3.
- Away combat used to give half XP for idle hours (`PACE.heroAwayXp`). That is gone with active-only.

### G3 (S1). Gold prices assume 24-hour income

- Every price is "hours of fighting income" (`ECON.hourFoes` 312 foes an hour) set when away combat ran all day.
- Active play gives about 210 fights an hour. A one-hour price is now 1.5 active hours.
- The early boost (`ECON.early`, x2 to zone 20, x1 at 35) makes income **fall** from zone 20 to 35.
- Demand at Region 2 entry (zone 36-42): Training Lv 35->45 about 750K, a tier 5 set to +10 219K, Hearth 8 140K,
  Hearth 9 240K. At 4,600-6,000 gold an active hour that is **200+ active hours**.

### G4 (S1). Trophies: demand far above supply once bosses are fought once

- Demand (code today): Hearth 5-10 need 2+3+4+5+6+8 = 28; building rows 4-5 need 3 each (about 24);
  +8, +9, +10 need 3 per item, 27 per 9-item set, again each tier you take to +10; Masterwork 1 each; Star Chart 1.
  Rough total by the end of tier 5: **about 130**.
- Supply today: 1 per first zone-boss kill from zone 20 (Captains count), so 156 over 175 zones, but only 23 by zone
  42, when demand is already about 44 (Hearth 5-8, a tier 4 set to +10, Forge 4-5).
- If Trophies come only from Champions and Elders (world-structure.md), supply is **40 in the whole game**.

### G5 (S2). Uniques: few, luck-only, and they go stale

- 15% on a first Captain kill, 4% on a replay. Champions and Elders are fought once.
- Only 7 designs in play (the Coast reuses `ZONE_UNIQ`); 6 raid uniques are online-only.
- A unique keeps the tier of the zone it dropped in (1-5). A tier 2 Echo Cowl is dead weight by zone 30, and the boss
  that dropped it cannot be fought again.
- Expected: about 1 unique every 6-7 zones, with long dry runs (0.85^15 = 9% chance of none in 15 Captains).

### G6 (S2). Rewards that pay for being away

Dead or half-dead under active-only: Hearth (+3% away gains a level), Watchtower (+2 h away cap), Hourglass relic,
Sporeheart unique (+50% away gains), Spore Cap Bestiary perk (offline gains), Codex Road seal (+12% away gains),
the `offline` modifier on Constellations, away hero XP. These are rewards players already chase and get nothing for.

### G7 (S2). Zone mastery and kill counts are dead in a once-through world

`MASTERY_STARS` needs 25 kills for a zone's first star; a pass is 6 fights. Foe profiles need 50 kills for their +5%.
The Bestiary is keyed to 7 legacy types, while the C22 roster has 215 foes.

### G8 (S2). Material gates and dead materials

- Node tiers open at Mining/Woodcutting 64 (tier 4) and 112 (tier 5): **47 h and 163 h** of focused gathering after
  the previous gate (M). Essence tier 4 drops from zone 19 and tier 5 from 42, far sooner.
- Transmute (4:1 up) jumps the gate cheaply once Enchanting is 36 / 54, so the gate is a hidden wall: players who do not
  know about Transmute wait days; players who do skip gathering levels.
- Hunting has 3 beasts, so hide tiers 4-5 exist only by Transmute (16 tier 3 hide for 1 tier 5). Warden and Ranger
  gear is hide-heavy.
- After a set is made, piles overflow: the late fixture holds 500K-750K units of tier 4-5 ore, wood, fibre and herbs
  against recipes of about 100. Nothing worthwhile buys them.
- Hearth 8 needs tier 5 Essence at gate zone 38, but tier 5 Essence starts at zone 42.

### G9 (S2). Losing to a Captain gives no way forward on its own

After a Captain loss you get one paying fight, then the Captain again (`59-combat` wipe). Nothing tells the player to
replay an older zone, and nothing rewards it beyond normal gold. The sim's policy shows the result: 24 hours with no
progress.

### G10 (S3). Crafted gear has no surprise and no pity

Crafting costs no gold and materials are cheap after Transmute, so rarity is just re-rolls. Yet early on a bad roll
wastes scarce Essence. No pity, no "best roll yet" moment, no Unique-tier craft.

### G11 (S3). The region step

Zone 35 gets HP x1.7 (`regionStep`) while gold drops to its lowest per hour, and the next gear tier (5) is 7 zones away.
The first zones of Region 2 feel like a wall rather than a new land.

---

## 4. Plugs, gap by gap

Every number is a starting value for `tools/sim.mjs` and the turn-combat sims. The number squish (balance-roadmap.md
step 3) will rescale HP and damage; the **ratios** here are what matter.

### P1 (for G1). A power budget per region, then build to it

Set how much stronger the hero must get across a region, and split it between systems. Proposal per region:

| Source | Each region after the Hollow | How |
|---|---|---|
| Hero level + Training | x6 | about 12 levels a region (P2) at about x1.16 a level |
| Gear grades | x4.5 | 3 grades x1.65 (gear-2.md grades 6-15) |
| Upgrades +0 to +10, rarity | x1.3 | a new grade resets pluses, so only the net gain counts |
| Uniques, Constellations, Tonics, Shrine | x1.3 | Attune (P6), star points, Elder relics |
| **Total power** | **about x45** | |

The Hollow (zones 1-35) keeps today's measured curve to zone 27; P2 keeps hero levels on it.

- Then set mob HP to match: Region 1 as today to zone 27, then **x1.115 a zone** (45^(1/35)) from zone 28, and drop the
  x1.7 region step to **x1.25** (the step is felt, but a new grade waits at the region's door, P11).
- Build Gear 2.0 grades 6-15 as the main late power (gear-2.md 1-2): 3 grades a region at its zones 1, 12 and 24 of
  the region, so a new grade lands every 11-12 zones.
- Raise the Training cap per region instead of one jump: 40 base, +12 per Great Lantern (52, 64, 76, 88), always a
  few levels above Lt (P2) so gold, not the cap, sets the pace.
- Checks (`tools/check.mjs`): a hero at the budget's level and gear clears each region's first, middle and last zone at
  8-20 s a foe (turn-combat equivalent: 3-6 turns).

### P2 (for G2). Hero XP that follows the zone (rubber band)

Replace `xp: ceil(1.5 z)` with XP priced from the level the zone expects:

```
Lt(z)   = z <= 35 ? 14 + 0.6 z : 35 + (z - 35) / 3          // Lv 35 at the Fenmother, Lv 82 at zone 175
foe XP  = xpNeed(Lt(z)) / F,  F = 17 to zone 35, 30 after  // fights a level at the target level
Captain = x5 (as now); Champion x15; Elder x40
```

- On target, one pass of a zone (5 fights + a Captain worth 5) gives 0.6 levels in Region 1 and 0.33 after, the
  slope of Lt.
- Below target, each fight is a bigger share of a level, so the hero catches up fast (1 level in about 14 fights at
  3 levels under, 30 on target). Above target, XP thins out. No hard cap needed.
- With P2, column A of the table becomes 8-15 active minutes everywhere (E), and the Proving opens at zone 35 for a
  player who played each zone once.

### P3 (for G6 and G2). Rested XP: the active-play reward for coming back

Replace away combat with **Rested**: time away banks a bonus that active fights spend.

- Banks 1 "Rested fight" per 6 minutes away, up to 80 (8 hours). The Watchtower raises the bank: +20 a level (to 180).
- A Rested fight pays **x2 XP and x2 gold** (Essence unchanged, so materials stay earned).
- The Hearth's "+3% away gains a level" becomes "+3% Rested pay a level". The Hourglass relic: +10 bank a level.
  Sporeheart: "Rested fights pay x2.5". Spore Cap Bestiary perk: Rested bank +5/10/15/25%. Codex Road: +12 bank.
- Show it on the fight bar: "Rested: 42 fights at double XP".
- This keeps "come back tomorrow" without idle combat, and the player sees the bonus while playing.

### P4 (for G3). Re-base gold on active hours and smooth the region dip

- `ECON.hourFoes` 312 -> **210** (what an active hour is). Every "H" price drops by a third.
- `ECON.early`: keep x2 to zone 20, but end the fade at x1.4 (not x1) at zone 35, and keep x1.4 through Region 1's
  late zones; the region base jump (x3.4) then still makes Region 2 a raise, not a cut (zone 36 pays 17 vs 13.5 x 1.4 = 19:
  set base[1] to 22 so the first foe of the Coast pays more than the last of the Hollow).
- Training: after P2, a level costs about 25-40 active minutes of gold at its target zone (now: 360 min at Lv 35).
  Set `ECON.train.r2` 1.28 -> **1.2** and `r3` 1.15 -> **1.12**, then let gold per region (x3.4) carry the rest.
- Upgrades: gold for +1 is 20 foes x (plus+1). Make it **10 foes x (plus+1)**, and make the materials the main cost.
  A full set to +10 should cost about 6-8 active hours of gold at its grade's zone, not 47.
- Report each price in the UI as "about N fights" so the player can judge it.

### P5 (for G4). Trophies: guaranteed sources and a cheaper sink

- **Every Captain's first kill gives 1 Trophy from zone 1** (not 20). Champions give 3, Elders give 5.
  Supply: 175 + 105 + 25 = **305** over the game; about 50 by zone 35.
- Trophy of the Captain's monster family (kept as the 7 types until the C22 roster has families).
- Cut demand that is not about gear: Hearth rows take **Essence instead of Trophies** (`CAMP_TUNE.trophyEss` already
  exists as the fallback).
- +8, +9, +10 keep their Trophy; Masterwork keeps its Trophy. Those are the fun spends.
- Trophy exchange at the Trophy Wall: 3 Trophies of any kind -> 1 of the kind you pick.

### P6 (for G5). Uniques without rematches

Pick all four; each covers a different case.

1. **First-kill choice from Champions and Elders.** A Champion's first kill shows 3 uniques from its area's pool and the
   player keeps 1. An Elder offers 3 from its region and gives 1 plus a Great Lantern relic. 35 + 5 = **40 guaranteed
   uniques** over the game, about one an area (every 25-35 fights).
2. **Captain pity.** The 15% roll on a first Captain kill stays, with bad-luck protection: +5% a miss, reset on a drop
   (guaranteed on the 18th Captain; average 1 in 3.9 Captains, about 45 over the game). Replays keep 4%, pity applies there too.
3. **Attune** (the Enchanter's Table): raise a unique to your current grade. Cost: 2 Trophies of its boss's family +
   Essence of the target grade (as a craft of that grade). Keeps its effect; power follows the grade. Uniques never go
   stale, and old ones become chase targets again.
4. **Deepwell Echoes.** Every 10th Deepwell floor offers an Echo of a unique you have seen (its tier = your grade). The
   Deepwell is replayable and already isolated from main progress, so this is the "farm" for players who want a
   second copy, with no boss rematch.

Also: give the Coast its own 7 uniques before Region 2 ships (gear-2.md 6 lists them), and pre-socket them later.

### P7 (for G7 and G9). Make old zones useful again

- **Zone stars by feats, not kills.** Each zone has 3 stars: win the Captain; win a pass with no knock-out; win a pass
  under a par time. Each star: +1% damage everywhere (as now) and +10% gold in that zone. 525 stars over the game.
- **Replay bounty.** After a Captain loss: "Too strong for now. Replay Zone N-2 for 2x XP (next 10 fights)". The Next Up
  strip points to the best zone to replay (the highest zone that dies in 10 s).
- **Captain replays** keep the 4% unique roll (with pity) and give a small Essence bundle (5 of the zone's tier).
- **Daily first replay:** the first full pass of any older zone each day pays x3 gold. Fits active play; one tap.
- Foe profiles: lower the +5% damage tier from 50 kills to 15. Re-key the Bestiary to C22 families when they exist.

### P8 (for G8). Material gates, hide and dead materials

- **Node tier gates by zone, not only level:** a node tier opens at the lower of its skill level or reaching its grade's
  zone with skill level >= 60% of the gate. Mining 64 becomes "Mining 38 and zone 36". Matches gear-2.md ("gated by
  region; skill levels still matter for speed").
- **Show Transmute** in the craft screen: "Short 40 Cobalt Ore. Transmute 160 Silver Ore? (Enchanting 36)".
- **Hunting tiers 4-5:** two Coast beasts (Codex art exception applies to new Hunting beasts; the owner vets the
  set). Until they ship, hide transmutes at **3:1**.
- **Surplus sinks**, so nothing is dead:
  - Sell at the trade post (`21o-data-trade`, already priced by `ECON.famW`) with a daily cap of 1 active hour of gold.
  - **Temper** at the Forge: 200 units of any gathered material of your top tier -> +1% to one gear line on one item
    (max +10% an item). Turns old piles into small, steady upgrades.
  - Salvage gives back 30% of the recipe (today: a chance of 1 Essence).
- Hearth 8: tier 4 Essence (or gate it at zone 42).

### P9 (for G10). Crafting with pity and a moment

- Rarity pity per item kind and grade: no Rare+ in 3 crafts -> the 4th is Rare+; no Epic in 10 -> the 11th is Epic.
- A crafted **Perfect** roll (all affix rolls >= 0.9) at 3% is shown with a sparkle and a name ("Keen Oak Bow").
- Re-crafting the same kind and grade costs 50% materials once you own an Epic of it (the chase is the roll, not the grind).

### P10 (for G2 and G3). A guaranteed reward on every boss

| Boss | First kill | Replay |
|---|---|---|
| Captain (175) | Captain's Cache: 1 Trophy, Essence = 2 fights' worth, 1 gear-grade material bundle (10 units of the zone's home family), unique roll with pity | Essence 5, unique 4% (pity) |
| Champion (35) | Unique choice (P6), 3 Trophies, a Champion Chest: 1 crafted item of your class at the area's grade, Rare or better | none (fought once) |
| Elder (5) | Unique choice, 5 Trophies, +15 Training cap, Great Lantern relic, the next grade's recipes | none |

### P11 (for G11). Region entry: the Waystone Chest

The first time you enter a region, a chest at its first zone gives **the weapon of the new grade at Rare** (your class's
kind) and 20 of the new grade's Essence. The player walks into the harder land holding a visibly better weapon (about
+65% on the weapon line). It smooths the HP step and makes the region start with a gift, not a wall.

### P12 (for G9 and onboarding). Tell the player what the next step is

Next Up (`55-goals`) gets one "Power" goal that names the cheapest next step and its time:
"Train Attack Lv 31: 2 more fights' gold", "Upgrade your Bow to +4: 12 Glowing Essence", "Replay Zone 20 for XP".

---

## 5. Making gear feel exciting

### 5.1 Target cadence of felt upgrades (active minutes)

A felt upgrade: a new grade item, a unique, a Rare-to-Epic swap, a 3-plus jump, a new star keystone, a Training
milestone (every 5th level). Target at least one per play session (about 30 minutes).

| Stretch | Zones | Felt upgrade every | Gear-specific (new item worn) every | Today (M/E) |
|---|---|---|---|---|
| First hour | 1-12 | 3-5 min | 10-15 min | zones every 2-3 min, tier 1 set at 22 min |
| Hours 1-4 | 12-25 | 10-15 min | 20-30 min | tier 2 set at 6.4 h; zone gaps 30-200 min |
| Late Region 1 | 25-35 | 15-20 min | 30-40 min | 9 h between zones |
| Region 2 | 36-70 | 20-30 min | 30-45 min | unwinnable past ~56 |
| Regions 3-5 | 71-175 | 30-45 min | 45-60 min | unwinnable |

How the plugs supply it (Region 2 example: 35 zones at 6-8 active minutes each, about 4 active hours a region):
a grade every 11-12 zones (P1), a Champion unique every 5 zones (P6), a Captain unique every 4-5 zones (P6),
a Training milestone every 5 levels (about every 15 zones with P2 at 0.33 a zone: add +1 milestone per region
for ability milestones), 3 pluses every 2-3 zones (P4), Temper ticks between (P8).

### 5.2 How upgrades are presented

- **Drop moment:** an item drop or craft that beats what you wear gets a full-width card: name, rarity colour,
  "Power 410 -> 560 (+37%)", and one button, Equip. Lower items go to the bag silently.
- **Green arrows** on bag items and on the Craft list ("+22% over your Staff").
- **The hero shows it:** the new weapon is drawn in the next fight (art pack permitting; until then the gear icon flares).
- **Power number** on the hero sheet with the change since the session began ("+48% today").
- **Near-miss honesty:** "Epic chance 16%. Next guaranteed Rare+ in 2 crafts." (P9).
- **Unique choice screen** shows the 3 options side by side with "you own" markers (P6).
- **Toasts stay quiet** for +1 pluses; one summary line per session ("3 upgrades today").

### 5.3 Chase items

- **Uniques with Attune** (P6): 7 a region, each with an effect, kept current by Attune. Collect them on the Trophy Wall.
- **Perfect crafts** (P9): rare, named, visible.
- **Masterwork with a chosen Trophy line** on an Epic +10: the "finished" item of a grade.
- **Elder relics** (P10): one per region, a permanent effect, shown at the camp.
- **Set bonus** for a full grade set at Epic (gear-2.md weights): a small extra line, a colour trim on the hero.
- **Deepwell Echoes** for the completionist (P6.4).

---

## 6. Implementation list (small, testable steps, in order)

Each step: build, `node tools/build.mjs`, `node tools/check.mjs`, plus the named sim check. Steps 1-6 need no art and
change no online data. Bump the save key where noted (owner allows a wipe before 1.0).

| # | Step | Files | Test |
|---|---|---|---|
| 1 | Hero XP from the target level (P2): `PACE.xpT` table, `mobXp(z)` in 40-rules, used by spawn | `src/js/40-rules.js`, `src/js/50-sim.js` (spawn xp line) | sim: one pass of zones 1-35 reaches Lv 33-36; check pins Lt(35) = 35 |
| 2 | Re-base gold on active hours and smooth the dip (P4): `hourFoes`, `early`, `base[1]`, `train.r2/r3`, `upFoes` | `src/js/21w-data-econ.js` | `--report econ`: gold an hour never falls zone to zone; Training level <= 40 active min at target zone |
| 3 | Captain's Cache and Trophies from zone 1 (P5, P10) | `src/js/21-data-craft.js` (CRAFT_TROPHY_SRC), `src/js/55-gathering.js` (first-kill branch), `src/js/50-sim.js` killPack | check: 1 Trophy per first Captain kill; supply >= demand at zones 20, 35, 42 |
| 4 | Unique pity on Captains (P6.2) | `src/js/20-data.js` (UNIQ_TUNE.pity), `src/js/50-sim.js` killPack, state in `S.found` or a new registerState | seeded test: no 13-miss streak |
| 5 | After a Captain loss: replay bounty and the Next Up power goal (P7, P12) | `src/js/59-combat.js` (wipe, one line: emit), `src/js/55-goals.js`, `src/js/55-bounties.js` | sim policy: replay when told; Tobin and Pip pass zone 20 within 6 h |
| 6 | Rested (P3) and the away perks re-pointed | `src/js/55-rested.js`, `src/js/57-camp.js` (Hearth, Watchtower lines), `src/js/20-data.js` (Sporeheart, Hourglass text), `src/js/55-mastery.js` (Spore perk), `src/js/75-away.js` | check: 8 h away banks 80 fights; Rested fight pays x2 XP and gold |
| 7 | Zone stars by feats; profile +5% at 15 kills (P7) | `src/js/55-mastery.js`, `src/js/75-mastery-ui.js` | check: 3 stars from one clean fast pass |
| 8 | Crafting pity and Perfect rolls (P9) | `src/js/40-rules.js` rollRarity (pass a pity count), `src/js/55-crafting.js` craftItem, S.craft | seeded: Rare+ within 4 crafts |
| 9 | Materials: Transmute prompt, hide 3:1, sell surplus, Temper, Hearth 8 Essence (P8) | `src/js/55-crafting.js`, `src/js/75-craft-ui.js`, `src/js/57k-trade.js`, `src/js/57-camp.js` | late fixture: surplus can be spent; Hearth 8 buildable at its gate |
| 10 | Champion and Elder first-kill rewards, unique choice screen (P6.1, P10) | `src/js/59h-bosses.js`, `src/js/51-actions.js` (dropUnique with a pick), new UI in `src/js/75-codex-ui.js` or a small card file | check: 40 guaranteed uniques over a scripted run |
| 11 | Attune uniques (P6.3) | `src/js/55-crafting.js`, `src/js/41-items.js` (unique tier change), `src/js/75-craft-ui.js` | check: Attune keeps fx, sets t, pays Trophies |
| 12 | Waystone Chest (P11) | `src/js/55-lantern.js` (region entry hook) | check: entering zone 36 once gives 1 Rare weapon of the new grade |
| 13 | Power budget, HP retune (P1): hpLate, regionStep, Training cap per Lantern | `src/js/40-rules.js` PACE, `src/js/24b-data-solo.js` train.cap, `src/js/55-training.js` trainCap | new check: budget hero clears first/mid/last zone of Regions 1-2 at 8-20 s |
| 14 | Gear grades 6-15 (gear-2.md): `TIER_POW`, `MAT` rows, `validTier`, `PACE.essTier`, `ECON.gradeZ`, nodes, recipes. **Save key bump** | `src/js/20-data.js`, `src/js/21-data-craft.js`, `src/js/40-rules.js`, `src/js/41-items.js`, `src/js/55-crafting.js`, `src/js/55-gathering.js`, `src/js/55-store.js` | budget check through zone 175 |
| 15 | Hunting beasts for hide grades 4-5 (art exception: new Hunting beasts) | `src/js/21-data-craft.js` HUNT_BEASTS, art pipeline | owner vets art |
| 16 | Deepwell Echoes (P6.4) | `src/js/57d-deepwell.js` | check: Echo offered on floor 10 when a unique is known |
| 17 | Drop and craft presentation (5.2) | `src/js/75-craft-ui.js`, `src/js/70-ui.js`, toast rules in `src/js/23n-data-notices.js` | manual, 360 px and 740x360 |

For the coordinator (tools, not mine to edit): `tools/sim.mjs` should (a) replay an older zone after N Captain losses,
(b) craft class gear for `--class warrior|mage` with the solo heroes (G1 shows "-"), and (c) report "minutes between
felt upgrades" as a target (5.1). Then add a `--report stalls` that prints section 2.4 per zone.

## 7. Open questions for the owner

1. Is gathering idle while away? If yes, Rested (P3) covers combat and gathering keeps its away rate. If no, Rested
   should also bank "Rested swings" for gathering.
2. Captains: do they drop Trophies (P5 assumes yes, 1 each)? Without them Trophy supply is 40 for the game.
3. Unique pick (P6.1): a choice of 3, or one fixed unique per Champion? A choice is more exciting; fixed is easier to
   balance and to draw.
4. Total game length: with P1 and P2, about 6-8 active minutes a zone gives 20-25 active hours to zone 175, plus
   replays. Is that the target, or should Regions 3-5 be slower (more grind per zone, still with the cadence in 5.1)?
