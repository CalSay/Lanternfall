# Gathering and crafting

Status: design spec for ROADMAP Phase 1, written 2026-09-27. It pairs with
[party-and-classes.md](party-and-classes.md) (one permanent hero class, named companions in 4
roles) and replaces that spec's section 5.1 recipes and stat lines. Its companion uniques (5.3)
stay as they are. All numbers are starting values for `tools/sim.mjs` to tune. The ratios and
rules are the design.

Owner constraints this spec obeys: no prestige or resets, single-player first, idle most of the
time with active moments, playable on a 360px phone, and legible for a player, not a spreadsheet.

Design rules:

1. **Every family makes something a player wants.** No material exists only to feed another.
2. **Each class has a signature material** that most of its gear needs: Warden uses Ore,
   Lanternmage uses Crystal, Ranger uses Hide and Lightkeeper uses Herbs.
3. **Fight and Gather stay a real choice.** Hide, Essence and Trophies come only from fighting.
   Ore, Crystal, Wood, Fibre and Herbs come mainly from gathering, with a small trickle from fights.
4. **Stats come from materials, not dice.** Rarity is still a roll, but which role stat an item
   leans towards is the player's choice at the bench (Focus, section 4.4).
5. **No refining chains.** A recipe takes raw materials. The only conversion is Transmute
   (section 3.5), a deliberate trade and never a required step.

---

## 1. Material families

Seven families with 5 tiers each: 3 already exist and 4 are new. Tier `t` of every family
lines up with item tier `t`: a tier-2 item needs tier-2 materials, as today.

| Key | Family | Unit | Tier names (1 to 5) | Colours (1 to 5) | What it makes | Stat it pushes (Focus) |
|---|---|---|---|---|---|---|
| `ore` (exists) | Metal | Ore | Copper, Iron, Mithril, Starsteel, Emberite | existing | Warden weapons, shields, plate, censers, pickaxes, sickles | Armour, Block, Pierce |
| `wood` (exists) | Wood | Log | Oak, Yew, Ironbark, Ghostwood, Lanternwood | existing | Bows, staves, quivers, hafts, charms, axes | Attack |
| `ess` (exists) | Essence | Essence | Dim, Glowing, Radiant, Blazing, Starlit | existing | A little in almost every recipe, plus charms, trinkets and transmutes | Threat ("a brighter lantern draws the dark") |
| `crystal` (new) | Crystal | Shard | Quartz, Amber, Moonstone, Starglass, Emberglass | `#E8E8F0 #F2A93B #B8C8FF #9FE8FF #FF6A5A` | Lanterns, staff heads, circlets, trinkets | Spell power, Area |
| `fibre` (new) | Fibre | Fibre | Flax, Nettle, Silkgrass, Moonsilk, Gloamsilk | `#D8C9A0 #8FA868 #E6E0C0 #C9D8F0 #8A7FB8` | Robes, vestments, mitres, tomes, quivers, padding | Control, Haste |
| `herb` (new) | Herbs | Sprig | Sage, Wormwood, Bloodmoss, Ghostcap, Lantern Lily | `#7FB86A #A8B89A #B84A4A #CFE8E0 #FFD27A` | Censers, tomes, vestments, trinkets, tonics | Healing, Ward |
| `hide` (new) | Hide | Hide | Soft, Tough, Scaled, Dusk, Ember | `#B08A6A #8C6A43 #5E7A6A #5A4A6A #C9463E` | Ranger leathers, hoods, quivers, bowstrings, shield straps, tome bindings | Crit (and shared HP) |

Plus **Trophies** (not tiered): 7 boss-and-champion materials, one per zone type (section 2.4).

Why 7 and not 9: bone, sinew and feathers would each make only 1 or 2 items. Here they are
flavour names inside Hide (bowstrings are "sinew", fletching is "feathers"), so the pouch stays
7 rows by 5 tiers, which is 35 cells and fits one phone screen. Fishing and Hunting are left out
for the same reason. Fishing makes nothing that a class needs, and Hunting would duplicate what
Fight already does.

**Demand check** (tier-1 amounts for one full hero set of 5 positions, including the Charm;
recipes are in section 4.2):

| Class | Units | From gathering | From fighting | Signature family share |
|---|---|---|---|---|
| Warden | 48 | 32 (67%) | 16 | Ore 23 (48%) |
| Lanternmage | 45 | 33 (73%) | 12 | Crystal 13 (29%) |
| Ranger | 43 | 19 (44%) | 24 | Hide 15 (35%) |
| Lightkeeper | 44 | 32 (73%) | 12 | Herb 10 + Fibre 14 |

Ranger leans on fighting by design (a hunter). Section 8 sets the time budget so that every
class spends 25 to 45% of its time gathering.

---

## 2. Where materials come from

### 2.1 Gathering skills (3, one active node at a time)

| Skill | Save key | Node rows | Tool | Base seconds per unit, tier t |
|---|---|---|---|---|
| Mining | `mine` (exists) | Veins (ore), **Geodes (crystal, new)** | Pickaxe | ore `2.6 x (1 + 0.3(t-1))`; crystal x1.25 |
| Woodcutting | `wood` (exists) | Groves (wood) | Axe | `2.6 x (1 + 0.3(t-1))` |
| Foraging (new) | `forage` | **Fibre patches, Herb beds** | Sickle (new) | fibre x0.9, herb x1.0 |

- Node unlock levels are `NODE_REQ` for every row (GP1, 2026-09-28: `[1, 14, 30, 58, 112]`, was `[1, 8, 18, 30, 45]`; the knobs are `SKILL_TUNE` in 20-data.js, see [pacing.md](pacing.md) 12).
- The existing `nodeTime`, `nodeXp` and double-yield rules apply to every family. The Pickaxe
  covers veins and geodes, and the Sickle covers both Foraging rows. Crystal XP is x1.25.
- Node names:
  - Geodes: Quartz Geode, Amber Pocket, Moonstone Grotto, Starglass Rift, Emberglass Heart.
  - Fibre: Flax Field, Nettle Patch, Silkgrass Meadow, Moonsilk Web, Gloamsilk Hollow.
  - Herbs: Sage Bed, Wormwood Patch, Bloodmoss Bank, Ghostcap Ring, Lantern Lily Pool.
- **Catch-up:** Foraging earns x2 XP while its level is below `max(mine, wood)`, so late saves
  are not starting from zero.

### 2.2 Home ground: gathering depends on where the party camps

The party camps at `S.zone`, which is the zone it last fought in, chosen with the existing zone
arrows. Each zone type is home ground for one gathered family. Gathering that family while
camped there gives **+25% yield**, rising to **+50% with 3 or more mastery stars in that zone**.

| Zone type | Home family | Why |
|---|---|---|
| Mossy Hollow | Wood | old forest |
| Batwing Caves | Crystal | cave geodes |
| The Bonefield | Herbs | wormwood grows on graves |
| Beetle Barrows | Fibre | beetle silk |
| Fungal Deep | Herbs | spore gardens |
| Quarry Ruins | Ore | the quarry |
| Wraithmarsh | Fibre | marsh reed and shroud-thread |

Node tier is still gated by skill level, not by zone, so any cycle of a zone type works. A
Lanternmage who wants Moonstone walks back to the best Batwing Caves they have cleared. This
gives old zones a job, and it pairs with zone mastery.

### 2.3 Fight drops by monster type

Every kill already rolls essence (`essChance()`, tier = `zoneTier(z)`). Each monster type now
also rolls its **signature drop**: 1 unit of the zone tier, at the chance below, multiplied by
`(1 + 0.1 x mastery stars in that zone)`.

| Monster | Signature drop | Chance per kill |
|---|---|---|
| Moss Slime | Herbs | 20% |
| Cave Bat | Hide (wing leather) | 20% |
| Rattlebones | Hide (sinew) | 15% |
| Barrow Beetle | Hide (scaled) | 30% |
| Spore Cap | Fibre (mycelium) | 20% |
| Quarry Golem | Crystal | 15% |
| Marsh Wraith | Essence (a second roll) | 20% |

- With packs of 3 (72% zone type, 28% next type), the best Hide zones are Beetle Barrows (about
  22% per kill) and Batwing Caves or The Bonefield (about 16 to 20%).
- Fight never drops Ore or Wood. It gives a small trickle of Crystal, Fibre and Herbs, about a
  quarter of what gathering gives per minute at the same tier.
- Offline fighting (party spec 4.8) credits expected signature drops as
  `kills x sum over types(share x chance) x 0.75`, using the same 75% factor as offline kills.

### 2.4 Trophies (boss and champion only)

Trophies are the rare material. There is one per zone type: Moss Heart, Bat Fang, Grave
Knuckle, Beetle Horn, Spore Crown, Golem Core, Wraith Veil. They are stored untiered, as counts.

| Source | Trophies | Idle or active |
|---|---|---|
| First kill of a zone boss | 3 of that zone type | both |
| **Champion** enemies: 1 pack in 150 has one (gold outline, HP x3, attack x2) | 1 of that zone type + 5 of its signature drop | live: full; offline: half the expected rate |
| World raid reward (each `raidReward`) | 1 of a random type | light online extra |

Trophies are used for Masterwork (4.5) and for upgrades from +8 to +10 (4.6).

### 2.5 Idle-friendly vs active

| Source | Idle and offline | Active bonus |
|---|---|---|
| Gathering nodes | yes, as today (offline cap `4 + 2 x glass` hours) | Tapping the node gives +0.12 progress per tap (exists). New: a **Glint** appears on the node every 15 to 25s for 3s, and tapping it gives +2 units. An attentive player gets about +30% rate. |
| Fight essence and signature drops | yes (closed form) | none, beyond the existing faster kills |
| Champions and trophies | half rate offline | full rate live, and a champion pack is visible on the stage |
| Bench gathering jobs (2.6) | yes, runs all the time | none |
| Tonics (3.5) | timer runs offline | chosen before a push |

### 2.6 Suggestion: bench gathering jobs

The party spec says the bench earns nothing. That leaves benched characters idle, so this
suggestion (open question 2) gives them work:

- **Job slots:** 1 at zone 10, 2 at zone 20, 3 at zone 30.
- A benched character assigned to a node the hero has unlocked gathers at **12% of the hero's
  base rate** for that node. Tools and the Glint do not apply. Home ground does.
- **Role affinity x1.5:** tank for Ore, caster for Crystal, striker for Wood, support for Herbs
  and Fibre.
- Jobs give materials only. There is no skill XP, so node unlocks still come from the hero
  gathering, and no character XP (the bench rule stands).
- A character on a job can be fielded at any time, which ends the job. Jobs run offline with the
  same cap.
- Target: jobs supply 15 to 30% of gathered units at 3h (G8). This helps an idle player without
  replacing the Gather activity.

---

## 3. Stations and skills

There are 4 stations, each with one crafting skill. Stations are **filters in the Craft tab**,
not separate screens (section 6). Every station uses the tier gate
`STATION_REQ`, the same as `SMITH_REQ` (GP1: `[1, 10, 22, 36, 54]`, was `[1, 4, 9, 16, 25]`; pacing.md 12).

| Station | Skill (save key) | Makes | Mainly serves |
|---|---|---|---|
| Forge | Smithing (`smith`, exists) | Warblade, Shield, Greathelm, Plate, Censer, Pickaxe, Sickle | Warden, tanks, Lightkeeper weapon, tools |
| Workbench | Woodcraft (`bench`, new) | Bow, Staff, Quiver, Axe | Ranger, Lanternmage weapon, strikers, casters |
| Loom | Tailoring (`loom`, new) | Hood, Leathers, Circlet, Robe, Mitre, Vestments, Tome | Ranger and Lanternmage armour, Lightkeeper, supports |
| Enchanter's Table | Enchanting (`ench`, new) | Lantern, Charm, Trinket, Tonics, Transmute, Refocus | Lanternmage off-hand, everyone's charm and trinkets |

- Crafting XP uses today's formula for every station: `20 x t^1.7` per craft and `6 x t^1.5` per
  upgrade.
- **Catch-up:** the three new crafting skills earn x2 XP while below the Smithing level.
- **Rarity** uses today's `rarityWeights()`, fed by the level of the station that makes the item
  (the Forge still uses `smith`, so Forge odds are unchanged).
- Every class needs 2 or 3 stations. Warden: Forge and Enchanter. Lanternmage: Workbench, Loom
  and Enchanter. Ranger: Workbench, Loom and Enchanter. Lightkeeper: Forge, Loom and Enchanter.

### 3.5 Enchanter's Table utilities

- **Transmute:** 4 of tier t make 1 of tier t+1, or 1 of tier t makes 2 of tier t-1. It works
  within one family only, and tier t+1 needs Enchanting at `STATION_REQ[t]`. It turns a surplus
  into a shortage fix without a new gathering trip. It never crosses families, so Hide still
  needs fighting. Enchanting XP: `5 x t` per transmute.
- **Refocus:** changes an item's Focus (4.4). Cost: the Focus materials again plus `2 x t`
  Essence of the item's tier.
- **Tonics** (optional, build stage K6b): one active at a time, 20 minutes, the timer also runs
  offline, stackable in the pouch. Strength scales `x(1 + 0.25(t-1))`.
  - Vigor Tonic: herb 3, ess 1. +15% damage.
  - Forager's Draught: herb 3, fibre 2. +25% gathering speed.
  - Mending Draught: herb 4, crystal 1. +20% healing.

  Tonics are the Herb sink for classes that are not Lightkeepers.

---

## 4. Gear matrix

### 4.1 Positions and kinds

An item's `slot` field is its **kind**, which is the existing meaning: `'weapon'` has always
meant Sword. Where it can be worn is looked up in a `FITS` table. The hero has 8 positions
(`S.equip` keys): `weapon`, `off` (new), `helm` (the key is kept, shown as "Head"), `body` (new),
`charm`, `pick`, `axe` and `sickle` (new). A companion has `wpn` and `trk` (party spec).

| Position | Warden (tank) | Lanternmage (caster) | Ranger (striker) | Lightkeeper (support) | Any class |
|---|---|---|---|---|---|
| Weapon | Warblade | Staff | Bow | Censer | legacy Sword, weapon uniques |
| Off-hand | Shield | Lantern | Quiver | Tome | - |
| Head | Greathelm | Circlet | Hood | Mitre | legacy Helm, helm uniques |
| Body | Plate | Robe | Leathers | Vestments | - |
| Charm | - | - | - | - | Charm, charm uniques |
| Tools | - | - | - | - | Pickaxe, Axe, Sickle (shared by every class) |

| Companion role | Role weapon | Trinket |
|---|---|---|
| Tank | Shield (the same kind as the Warden off-hand) | Trinket (any role) |
| Striker | Bow (the same kind as the Ranger weapon) | Trinket |
| Caster | Staff (the same kind as the Lanternmage weapon) | Trinket |
| Support | Tome (the same kind as the Lightkeeper off-hand) | Trinket |

Four kinds are shared between hero and companions, so one recipe serves both. That makes 21
kinds in total: 16 class kinds, Trinket, Charm and 3 tools. The legacy Sword and Helm stay
valid, but have no recipe in the browser (4.7).

### 4.2 Recipes (tier-1 amounts; tier t costs `ceil(n x (1 + 0.5(t-1)))`, as `craftCost` does today)

| Kind | Station | Recipe | Base line (from power `p`) | Role budget |
|---|---|---|---|---|
| Warblade | Forge | ore 6, wood 3, ess 2 | Damage +p% (hero weapon: Might, party-wide) | tank |
| Shield | Forge | ore 5, wood 2, hide 2, ess 1 | HP +p% | tank |
| Greathelm | Forge | ore 5, hide 2, ess 1 | HP +0.5p% | tank |
| Plate | Forge | ore 7, hide 3, fibre 1 | HP +1.0p% | tank |
| Censer | Forge | ore 4, herb 4, ess 2 | Damage +p% (Might) | support |
| Staff | Workbench | wood 5, crystal 3, ess 2 | Damage +p% (Might on hero) | caster |
| Bow | Workbench | wood 6, hide 2, ess 2 | Damage +p% (Might on hero) | striker |
| Quiver | Workbench | hide 3, wood 3, fibre 2 | Crit chance +min(35, 0.12p)% | striker |
| Lantern | Enchanter | crystal 5, ore 2, ess 2 | Spell power +p% | caster |
| Circlet | Loom | crystal 4, fibre 2, ess 1 | HP +0.5p% | caster |
| Robe | Loom | fibre 7, crystal 1, herb 1, ess 2 | HP +1.0p% | caster |
| Hood | Loom | hide 4, fibre 2, ess 1 | HP +0.5p% | striker |
| Leathers | Loom | hide 6, fibre 3, ess 1 | HP +1.0p% | striker |
| Tome | Loom | fibre 3, hide 2, herb 2, ess 1 | Healing +p% | support |
| Mitre | Loom | fibre 4, herb 2, crystal 1 | HP +0.5p% | support |
| Vestments | Loom | fibre 7, herb 2, ess 2 | HP +1.0p% | support |
| Charm | Enchanter | wood 3, ess 5 (unchanged) | +0.8p% gold, +0.3p% essence (unchanged) | - |
| Trinket | Enchanter | crystal 2, herb 2, ess 2 | HP +0.6p%, ability cooldown -min(25, 0.05p)% | - |
| Pickaxe | Forge | ore 4, wood 4 (unchanged) | unchanged; now also covers geodes | - |
| Axe | Workbench | wood 5, ore 3 (unchanged) | unchanged | - |
| Sickle | Forge | ore 4, wood 3 | Foraging speed +0.6p%, double yield min(60, 0.1p)% | - |

Power is unchanged: `p = TIER_POW[t] x RAR[r].m x (1 + 0.15 x plus)`. A companion's weapon line
("Damage +p%") is that character's `weaponPct` in the party spec's power formula.

### 4.3 Role stats: 3 per role, plus shared HP

Each class kind has a **role budget of 0.5p** spread over its role's 3 stats. Balanced spreads it
1/3 to each stat. Focused spreads it 0.6 / 0.2 / 0.2. Rates are per point of budget:

| Role | Stat | Per point | Cap | Focus material | What it does in combat (party spec 4) |
|---|---|---|---|---|---|
| all | **HP** | +1% max HP | - | Hide | on armour base lines and trinkets |
| Tank | **Armour** | +0.3 flat armour | red cap 60% (exists) | Ore | `red = armour / (armour + 100)` |
| Tank | **Threat** | +0.5% | 100% | Essence | That share of enemy hits aimed at anyone else (Wraith reach, AoE splashes) is pulled onto this tank. Taunts last +0.5% longer per point. |
| Tank | **Block** | +0.1% chance | 40% | Ore | A blocked hit deals 50% damage. A blocked boss heavy hit counts as a Dodge. |
| Striker | **Attack** | +1% own damage | - | Wood | single-target damage |
| Striker | **Crit** | +0.12% crit chance, +0.005x crit damage | 35% chance | Hide | the same numbers as the Helm today |
| Striker | **Pierce** | +1.5% damage to bosses and champions | - | Ore | Enemies have no armour in the combat model, so Pierce is framed as "finds the gap" on big targets. Executes count. |
| Caster | **Spell power** | +1% ability and AoE damage | - | Crystal | Lantern Flare, Fireball, Starfall |
| Caster | **Area** | +0.4% splash to every other enemy | +50% | Crystal | adds to the Lanternmage's 50% splash; casters without splash gain it |
| Caster | **Control** | +0.5% duration | +100% | Fibre | stuns, burns, Mark, Kindle stacks, knockback delay |
| Support | **Healing** | +1% healing done | - | Herb | all heals |
| Support | **Ward** | +0.4% of the target's max HP | 40% | Herb | Overheal becomes a shield up to this share (stacks with Hesketh's Warm Light cap) |
| Support | **Haste** | -0.05% ability cooldown | -30% | Fibre | own ability and hero ability |

The coordinator's "mana or faith" is left out: the combat model has no resource bar, and Haste
covers "cast more often". On a phone the item card shows 4 lines at most: the base line and 3
role stats, each with a role icon. The Focus stat is starred.

### 4.4 Focus: which materials push which stats (the crafting decision)

When crafting a class kind, the player picks **Balanced** (no extra cost) or one of the 3 Focus
buttons. Each Focus button costs **2 extra units** (scaled by tier like the recipe) of that
stat's family:

| Role | Focus choices (extra material) |
|---|---|
| Tank | Armour (+Ore), Threat (+Essence), Block (+Ore) |
| Striker | Attack (+Wood), Crit (+Hide), Pierce (+Ore) |
| Caster | Spell power (+Crystal), Area (+Crystal), Control (+Fibre) |
| Support | Healing (+Herb), Ward (+Herb), Haste (+Fibre) |

Example: a Yew Bow with Crit Focus costs Yew 9, Tough Hide 3 + 3 and Glowing Essence 3. At
uncommon (p = 37.8) it rolls Damage +38%, Crit budget 11.3 (+1.4% crit), Attack budget 3.8
(+3.8%) and Pierce budget 3.8 (+5.7% vs bosses).

This **replaces random affixes** (open question 1). A player picks a direction and pays for it
in a known material, so Fight vs Gather decisions follow from what the player wants, and nothing
is rerolled. Rarity is still the random part.

### 4.5 Masterwork (trophies)

Adding 1 Trophy to a craft gives the item one extra line at **0.25p**, themed by the trophy. It
is shown as a gold line, one per item.

| Trophy | Masterwork line |
|---|---|
| Moss Heart | HP |
| Bat Fang | attack speed (+0.2% per point, cap 40%) |
| Grave Knuckle | Pierce |
| Beetle Horn | Armour |
| Spore Crown | Healing |
| Golem Core | on tools: gathering speed; on gear: Block |
| Wraith Veil | Haste |

### 4.6 Rarity, upgrades, salvage, bag

- **Rarity:** unchanged multipliers (common x1, uncommon x1.35, rare x1.8, epic x2.5, unique x3.2).
  The whole item scales, including the role budget.
- **+1 to +10 upgrades:** unchanged cost (`upgradeCost`: 0.6 x recipe x (plus + 1) plus gold
  `40 x 5^t x (plus + 1)`). **+8, +9 and +10 each also need 1 Trophy of any type.** Items
  already at +8 or more keep their level.
- **Salvage:** unchanged formula (`0.4 x recipe x (1 + 0.3 x plus)`) applied to every kind.
  Focus extras and Trophies are not refunded.
- **Bag:** only **unequipped** items count, and the limit is 50. Items equipped by the hero or
  any companion are free. (This replaces the party spec's flat 60, which equipped companion gear
  would eat.)
- Hero uniques keep their `slot` and fit that position **for any class**. Companion uniques
  (party spec 5.3) fit their kind as listed there.

### 4.7 Existing gear: nothing lost, nothing invalid

**Superseded by the retool (owner bug: "I was able to equip a sword as a ranger").** Class gear
only. Once the hero has a class (on load, at the first tick; on "Choose your path"), every
non-unique legacy Sword becomes that class's weapon (Warblade, Staff, Bow, Censer) and every
non-unique legacy Helm its head piece (Greathelm, Circlet, Hood, Mitre). Same id, tier, rarity,
+N; it stays worn. The item gets `rt` (the kind it was made as) and keeps that kind's base lines,
so a Hood that was a Helm keeps the crit, crit damage and armour lines and a Bow that was a
Sword keeps Might p: `gear()`, `heroDps()` and `totalDps()` do not move. A Mirror of Embers
switch retools the hero's worn gear of the old class, and bag items of other classes that are not
companion kinds, the same way (it no longer unequips). Legacy Sword/Helm fit only a hero with no
class and can no longer be crafted. Weapon and head uniques still fit every class. One notice:
"Your old swords and helms were reforged into Ranger gear." The table below is the K4 rule
(`RETOOL.on = 0`), kept for the exact-dps check.

| Existing item (`slot`) | New kind name | Fits | Stats |
|---|---|---|---|
| `weapon` (Sword) | Sword (legacy) | hero Weapon, any class | unchanged: Damage/Might +p% |
| `helm` | Helm (legacy) | hero Head, any class | unchanged crit line, plus armour 0.1p (party spec 5.2) |
| `charm` | Charm | hero Charm | unchanged |
| `pick` | Pickaxe | tools | unchanged, and now also speeds geodes |
| `axe` | Axe | tools | unchanged |
| uniques | unchanged | their position, any class | unchanged |

- Legacy Sword and Helm are **generic**: any class can wear them. A save that picks Ranger at the
  party spec's "Choose your path" screen keeps its sword equipped and its damage unchanged. A
  same-tier Bow is simply better, because it adds the 0.5p role budget.
- The Sword and Helm recipes leave the browser but stay in `RECIPE`, so upgrading and
  salvaging legacy items work exactly as today.
- **Invariant:** on migration, `gear()`, `heroDps()` and `totalDps()` return exactly the same
  values as before. New positions start empty, so any change only adds power.

---

## 5. The gathering loop on a phone

**Recommendation: keep one active node for the hero.** The hero does one thing at a time (Fight,
Gather or World), as today. Several parallel expeditions would add a management screen, a
timer per expedition and notification pressure, all against "legible, not homework". Variety
comes from which node and where the party camps, not from how many timers are running.

A typical 60-second check-in:

1. The away card lists gold, essence, signature drops and job hauls.
2. The Craft tab badge shows "2 upgrades ready". Craft one and pick a Focus.
3. If a recipe is short one family, the pouch cell shows where to get it ("Moonstone: Mining
   lv 18 Geode, home ground Batwing Caves"). Tap "Go gather" to switch activity and camp.
4. Close the game.

Idle depth comes from bench jobs (2.6), if the owner accepts them.

---

## 6. UI on a 360px phone

Tabs are Fight, Party, Gather, **Craft** (renamed from Forge; 5 letters fits the tab) and World.
Usable width is 328px after two 16px gutters.

### 6.1 Gather tab

```
[ Mining 23 ][ Woodcut 19 ][ Forage 7 ]      skill chips, 104x44 each
Mining:  (Veins)(Geodes)                      row toggle
[Cu][Fe][Mi][St][Em]                          5 node buttons, 60x60, lock + level on locked ones
Camp: Batwing Caves III  * Home: Crystal +25% [Change]
---------------------------------------------
Pouch   (All)(Gathered)(From fights)(Trophies)
          T1    T2    T3    T4    T5          label column 64px + 5 x 52px = 324px
Ore      412    96    12     -     -
Wood     230    40     3     -     -
Crystal   55    18     -     -     -
Fibre     80     6     -     -     -
Herbs     31     2     -     -     -
Hide      44    21     -     -     -
Essence  160    75     8     -     -
Trophies  Moss 2  Bat 1  Bone 0 ...           wraps to 2 rows
---------------------------------------------
Jobs (1/2)   [Maren -> Iron Vein  +1.4/min] [+ Assign]
```

- Each cell shows a 16px icon and a count, with 44px tap targets. Tapping a cell opens a bottom
  sheet showing: sources (nodes with level, home ground, monsters and their drop chance), what
  it is used in (kinds for your class first), and Transmute buttons.
- Filters cut the grid to its rows. Counts use `fmt()`.

### 6.2 Craft tab

```
For: [Ranger v]  (Tank)(Striker)(Caster)(Support)(Tools)   chips scroll sideways; default = hero class
Stations: [Forge 12][Bench 6][Loom 4][Ench 3]              78x44 each, XP bar, tap = filter
Tier: [1][2][3][4 lock Bench 16][5]
-- Weapon ------------------------------------------
(o) [bow] Yew Bow        Workbench     * can craft      56px collapsed row
         Yew 9  Tough Hide 3  Glowing 3                 cost chips: green = have, red = short
   v expanded:
     Focus: (Balanced) (Attack +3 Yew) (Crit +3 Hide) (Pierce +3 Iron)
     Masterwork: (none) (Bat Fang 1)
     Equipped: Oak Bow +2 (p 23)   New: p 28 to 50
     [ Craft ]                                          full-width 48px button
-- Off-hand ----------------------------------------
...
```

- **"Can craft" dot:** green means you have the materials and the level. Red cost chips show
  which family is short, and tapping a red chip opens its pouch sheet.
- **Tab badge:** a number on Craft for recipes that are craftable and would beat what the hero
  or a fielded companion has equipped in that position.
- The upgrade (+N), Salvage and Refocus buttons live on the item sheet (tap any item in the bag
  or on a character). This keeps the Craft tab to making things.
- Role chips show recipes for companions of that role (weapon and Trinket).

---

## 7. Save migration

Principle: never rename or repurpose a field. Every new field has a default, and nothing is
converted.

| Field | Change |
|---|---|
| `S.mats` | `fresh()` gains `crystal`, `fibre`, `herb`, `hide`, each `[0,0,0,0,0]`. `loadSave` already merges with `Object.assign(fresh().mats, o.mats)`. `ore`, `wood` and `ess` are untouched. |
| `S.skills` | `fresh()` gains `forage`, `bench`, `loom` and `ench`, each `{lv: 1, xp: 0}`. The existing merge keeps `mine`, `wood` and `smith`. |
| `S.equip` | `fresh()` gains `off`, `body` and `sickle` (null). `weapon`, `helm`, `charm`, `pick` and `axe` keep their ids. If party loadouts exist, they use the same keys. |
| `S.items` | untouched. Existing `slot` values are kinds (`weapon` = Sword, `helm` = Helm). New items may add `f` (Focus stat id) and `mw` (trophy id). A missing value means Balanced or none. |
| `S.node` | `kind` may now be `crystal`, `fibre` or `herb`. Old values are valid. |
| `S.fSlot`, `S.fTier` | still valid kinds and tiers (the Craft tab's default selection). |
| new | `registerState('craft', { v: 1, troph: [0,0,0,0,0,0,0], tonic: null, tonics: {}, jobs: [], champ: 0 })` |

Checks for `tools/check.mjs` on `save-v2.json`, `save-mid-v2.json` and the party spec's
`save-v2-late.json`:

- Material totals, item count, item ids and `S.equip` are identical after load.
- `gear()`, `heroDps()` and `totalDps()` are unchanged, to exact equality.
- Every equipped item `fits` its position for every class (the legacy kinds are generic).
- A load, save and load round trip loses nothing.

---

## 8. Balance targets (tools/sim.mjs)

New sim flags:

- `--class` (from the party spec).
- `--jobs 0|1`.
- `--report craft`, which prints set completion times and the time share per activity.
- A policy that gathers the family that most blocks its next craft, crafts Balanced, then
  applies Crit, Spell power, Healing or Armour Focus for its class once the station is at level 9.

| # | Target | Pass band |
|---|---|---|
| G1 | First full tier-1 class set (5 positions), mixed policy | 6 to 12 min, every class |
| G2 | First full tier-2 class set | 35 to 60 min; every class within 0.85 to 1.15 of the median |
| G3 | First full tier-3 class set | 2 to 3.5h |
| G4 | Share of time spent gathering (mixed policy, first 3h) | 25 to 45% for every class |
| G5 | Fight-only policy: tier-2 class items crafted by 1h | at most 3 of 5 (gathering matters) |
| G6 | Blocking family: share of time the next craft waits on one family | at most 50% for any single family |
| G7 | Max zone at 2h, mixed, versus the post-Stage-A baseline | within +/- 10% (the overhaul adds choice, not a slowdown) |
| G8 | Bench jobs share of gathered units at 3h (`--jobs 1`) | 15 to 30% |
| G9 | First Trophy / first +8 upgrade affordable | 20 to 60 min / 3 to 5h |
| G10 | Offline 8h: materials credited versus simulated live | within +/- 15% per family |
| G11 | Migration fixtures: dps and gear deltas | exactly 0 |

Sanity maths for G2: a tier-2 Warden set needs about 48 gathered units (`32 x 1.5`) at about
3.4s each, which is about 3 minutes of gathering. It also needs 24 fought units, about 110
kills at the 22% essence and hide rate. Crafting to level 4 at each station takes about 5
crafts. Tier-2 zones open at about 15 minutes, so 35 to 60 minutes leaves room for rarity rolls
and a Focus.

---

## 9. Build plan

This starts after party **Stage A** has merged, which provides `S.party.cls`, the class picker
and `75-party.js`. This spec **replaces party task B3's recipe and stat work**. B3 keeps only
the companion uniques and boss drops, and should build on K4's kind table.

Every agent runs `node tools/build.mjs` and `node tools/check.mjs`. The whole overhaul ships
behind a build flag, `CRAFT_STAGE` in `00-util.js` (off, 1 or 2).

| Wave | Task | Owns | Small edits in | Depends on |
|---|---|---|---|---|
| 1 | K1 Data: the 4 families, the kinds and `FITS` tables, recipes, stations, role stats, the Focus map, signature drops, home grounds, trophies, tonics | `src/js/21-data-craft.js` (core, data only) | `src/js/20-data.js` (make `skillOf` and `NODE_NAMES` table-driven) | Stage A |
| 1 | K2 Art: icons for 4 families, 16 kinds plus the Sickle, 10 nodes and 7 trophies (8x8 maps) | `src/js/11-art-craft.js` | `src/js/10-art.js` (ICON registry) | - |
| 1 | K3 Fixtures and checks: G11 asserts, round trip | `tests/fixtures/save-v3-craft.json`, `tools/check.mjs` (craft section) | - | Stage A |
| 2 | K4 Items core: `fits()`, `itemStats()` (base line, role budget, Focus, Masterwork), `gear()` over 8 positions, generic `craftCost`, `upgradeCost`, `itemName` and `itemColor`, `fresh()` defaults | `src/js/41-items.js` | `src/js/30-state.js` (fresh), `src/js/40-rules.js` (delegate gear, itemName, nodeTime) | K1 |
| 3 | K5 Gathering: Foraging, geodes, home ground, signature drops (on `kill`), champions and trophies, Glint, offline credits | `src/js/55-gathering.js` | `src/js/50-sim.js` (generic `harvest`, `awayGains` hook) | K4 |
| 3 | K6 Crafting: `craftItem(kind, t, focus, trophy)`, station XP and catch-up, Transmute, Refocus, trophy upgrade gate, generic salvage, bag rule. K6b: Tonics | `src/js/55-crafting.js` | `src/js/51-actions.js` (`forgeItem` delegates; `addItem`, `salvageGive`) | K4 |
| 3 | K7 Craft tab UI | `src/js/75-craft-ui.js`, `src/styles/60-craft.css` | `src/js/73-ui-forge.js` (retire old picker), `src/shell.html` (tab label) | K4 |
| 3 | K8 Gather tab UI: pouch, Foraging, camp and home ground | `src/js/75-gather-ui.js` | `src/js/72-ui-gather.js` | K4 |
| 3 | K9 Sim: craft policy, `--jobs`, `--report craft`, G1 to G10 | `tools/sim.mjs` | - | K5, K6 |
| 4 | K10 Bench jobs (if approved), with its UI section added to K8's file | `src/js/56-jobs.js` | `src/js/75-gather-ui.js` | party B1 |
| 5 | K11 Role stats in combat: Threat, Block, Ward, Area, Control, Pierce, Haste | `src/js/59b-rolestats.js` | `src/js/59-combat.js` (hook calls, with the C1 owner) | party C1 |

- **Before Stage C:** Attack, Spell power and Crit feed today's damage and crit maths. HP,
  Armour, Healing and the other role stats show on items marked "(active with party combat)".
  Wave 5 wires them in.
- **Parallel safety:** K5, K6, K7 and K8 own separate files. The only shared-file overlaps are
  small, one-function edits (50-sim for K5, 51-actions for K6). The coordinator merges K4 first.

---

## 10. Open questions for the owner

1. **Focus instead of random affixes.** The roadmap says "affixes". This spec gives each item
   fixed role stats that the player steers with extra materials, and keeps rarity as the only
   roll. OK, or do you want random affix rolls, which are more loot excitement but more to read?
2. **Bench gathering jobs** (2.6). Benched characters gather at 12% of the hero's rate, with up
   to 3 jobs. Yes, or keep the bench fully idle?
3. **Trophies for +8 to +10.** Top upgrades need boss and champion trophies, which makes
   late gear a fighting goal. OK, or keep upgrades to materials and gold only?
4. **Hide and Essence from fighting only.** Rangers lean on fighting (56% of their materials).
   OK, or add a small Hunting node so an idle gatherer can get Hide too?

## Owner decisions (2026-09-27)

These override the spec above where they conflict.

1. **Random affixes, not Focus.**
   - Crafted items roll random affix lines from their role's stat pool (tank: Armour, Threat, Block; striker: Attack, Crit, Pierce; caster: Spell power, Area, Control; support: Healing, Ward, Haste; any role: HP).
   - Rarity sets the number of lines: Common 1, Uncommon 2, Rare 3, Epic 4. Masterwork (a Trophy) adds 1.
   - Coordinator's call to keep it player-friendly: the Enchanter's Table can **Reforge** one chosen line for essence plus gold, with the cost rising each time on that item. Rarity and base power stay. Drop the Focus mechanic.
   - Existing items migrate with no affix lines and keep their exact current stats. Only new crafts roll affixes.
2. **Bench gathering jobs: yes,** as specified (up to 3 slots, about 12% of the hero's rate, materials only, no XP).
3. **Trophies gate the +8 to +10 upgrades,** as specified.
4. **Hide and essence stay fight-only.** No Hunting node.

Coordinator note on combat consistency: the party spec does give enemies armour (armoured types, and "ignores armour" abilities), so **Pierce means armour penetration.** Bonus damage against bosses is not needed.
