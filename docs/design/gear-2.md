# Gear 2.0: resources, weights, chains, enchanting, buff items and Uniques 2.0 (RG1)

Status: design spec RG1, written 2026-09-28. It fills in what the shared rulebook
[core-2.md](core-2.md) leaves to RG1 (core-2 9.1): material names and region gating, grades 6-15, the
production chains, gear kinds per weight and their base lines, rarity weights, buff item lines and values,
the enchant strength curve, Salvage Runes, Uniques 2.0 (list, powers, bosses), and the material and item
migration. It also designs trade routes inside expeditions (plan-4 4.12). All numbers are starting values
for `tools/sim.mjs`; BAL3 tunes them per slice. Ids and names are not starting values.

Sources: plan-4.md section 4 (the owner's gear and resource decisions), core-2.md (sections 1, 5, 8 and
the change log), classes-2.md (weights per class and evolution, C5, 7.2), regions-4-5.md (names for
grades 6-15, the Starshard and Wellglass families), legendaries.md (the Lantern Book, Echoes, Inscribe,
Pearls as a cost), region-2.md (Pearls, Tidefast and Shellbreaker, the coast uniques),
gathering-and-crafting.md, hearth-and-hands.md (Storehouse caps, stations, Hands), pacing.md 11-13 (BAL2,
GP1 skill pace, CU1), roadmap-review.md 2.3, 2.5 and 2.10, the wave log to 2026-09-28, and the code as it
is today (`20-data.js`, `21-data-craft.js`, `41-items.js`, `55-crafting.js`, `55-gathering.js`,
`55-store.js`, `55-tools.js`, `55-legend.js`, `21c-data-legend.js`, `57f-hands.js`).

How this file relates to core-2:

- **It uses core-2's stat ids, buckets, grade powers 1-5, socket counts, the socket budget formula,
  `famTop` and the unique raw-stats band.** Every number here sits inside a core-2 range, or it is listed
  in section 9.2 as a proposed change-log line (also added to core-2 section 10 as "proposed").
- **No new stat.** Every line in this file is a core-2 1.1 stat id.
- `p` is an item's power, `itemPower(it) = TIER_POW[t] x rarity x (1 + 0.15 x plus)` (unchanged). "Grade"
  is core-2's word; the player word is **Tier**.

Owner rules this spec obeys (plan-4 4, the wave log):

1. **Gear by weight.** Warrior = metal + leather, Ranger = wood + leather, Mage = cloth (main) + wood. The
   main family is about 70%, the second about 30%, small accents cross over.
2. **15 tiers, 3 per region, gated by region.** Skill levels still matter for speed, yield and rare finds.
   **Existing saves keep everything**, even above their region.
3. **Production chains**, one step, in the background at stations; coal, salt and dye are secondary
   resources the Lanternbearer *can* gather but that are ideal gatherer jobs; gatherers can refine;
   **Region 1 stays raw.** A Tannery and a Hunter job: yes.
4. **Enchanting** applies buff items, from Region 2. Sockets 0 / 1 / 1 / 2 / 3 by rarity; crafted gear
   otherwise has base stats only. Skill sets the strength. Removing destroys unless a Salvage Rune is used.
5. **Buff items:** one family per region, a heavy / medium / light version of each, rarities, gatherer
   finder perks about +5%, active gathering finds more, **bosses always drop their signature buff item**.
   Not mining-only.
6. **Uniques 2.0:** boss-themed, carry a power (merged with the legendary powers), pre-socketed with the
   boss's buff item, Echoes upgrade them, the Lantern Book collects them, about 6 per region. Uniques are
   weaker on raw stats and rarer (2026-09-27); crafted gear stays within about 10%.
7. **Storehouse holds materials only** (buff items get a page there); the **Armoury** holds gear.
8. **Trade routes live inside expeditions.**

Design rules of this spec:

1. **Every tier has a job, and so does every family.** Three grades per region; each class needs every
   gathering line a little and one line a lot.
2. **Power grows, ratings do not run away.** Output lines grow x1.65 a grade (core-2). Lines with a cap or
   a flat rating grow slowly, so caps and gathering rates stay meaningful to grade 15 (2.4).
3. **Chains add a decision, not a wall.** Refining runs while you are away; the secondary resource is the
   throttle, and Hands make it cheap. A player with no Hands still progresses.
4. **Nothing is lost.** Every material, item, power, unique, rank and recipe a save has today keeps
   working. Old items keep their exact stats; new rules apply to new crafts.
5. **Plain words.** "Iron Ingot", "Tannery", "Set a Lantern Pearl", "Takes 2 min". Short sentences.

---

## 0. Why (what the code does today)

- **7 families x 5 tiers** (`CRAFT_FAMILIES`: ore, wood, crystal, fibre, herb, hide, ess). Hide and essence
  are fight-only. `S.mats[fam]` arrays are 5 long.
- **Tiers follow zones and skill, not regions.** Fight drops use `zoneTier(z)` (`PACE.essTier`
  `[1, 7, 13, 19, 42]`): tier 4 drops from **zone 19, inside Region 1**. Nodes open by skill (`NODE_REQ`
  `[1, 14, 30, 64, 112]`, GP1), so in normal play tier 4 nodes open on day 5.5-9.5 and tier 5 on day
  13.5-17 (pacing.md 12.3): the calendar already lines up with the Coast, the gates do not.
- **Recipes are raw**, per class kind (`CRAFT_KINDS`: warblade, bow, staff, censer, and so on). No weights.
- **No sockets.** Pearl settings (`pl`), Tide Pools and `S.mats.pearl` are specified (region-2.md 5) but
  not built: `55-legend` treats Pearl costs as free until `S.mats.pearl` exists (`pearlLive()`).
- **13 uniques** (`UNIQ`: 7 zone elders, 6 raid bosses) are stat lines, found in `S.found`.
- **39 legendary powers** plus 4 pinnacle powers drop on Legendary items, are learned into the Lantern
  Book (`S.legend.book`, `.echo`) and inscribed onto crafted gear.
- **Every line scales with `p`.** At grade 15 a Rare +10 pickaxe would give about +73,000% mining speed and
  a helm's crit line would sit at its cap from grade 6. Section 2.4 fixes this with line power.

---

## 1. Materials and grades

### 1.1 The families

| Group | Key | Family | Unit | Grades | Source | Used for |
|---|---|---|---|---|---|---|
| Raw, gathered | `ore` | Metal | Ore | 1-15 | Mining veins | Heavy gear, accents (clasps, arrowheads), tools |
| | `wood` | Wood | Log | 1-15 | Woodcutting groves | Medium gear, Mage weapons and accents, tools |
| | `fibre` | Fibre | Fibre | 1-15 | Foraging patches | Light gear, padding accents |
| | `crystal` | Crystal | Shard | 1-15 | Mining geodes | Charms, trinkets, light accents, Salvage Runes |
| | `herb` | Herbs | Sprig | 1-15 | Foraging beds | Support accents, Tonics, tinctures |
| Raw, fought and hunted | `hide` | Hide | Hide | 1-15 | Fight drops; **Hunter** Hands (3.5) | Leather |
| | `ess` | Essence | Essence | 1-15 | Fight drops only | A little in almost every recipe |
| **Secondary** (new) | `coal` | Coal | Coal | by region (2-5) | Mining (coal seams), Coal-digger Hands | Smelting |
| | `salt` | Salt | Salt | by region (2-5) | Foraging (salt pans, rime, stone), Salter Hands | Tanning |
| | `dye` | Dye | Dye | by region (2-5) | Foraging (dye plants), Weaver Hands | Weaving cloth |
| **Refined** (new) | `ingot` | Ingots | Ingot | 4-15 | Smelting ore + coal | Heavy gear main |
| | `plank` | Planks | Plank | 4-15 | Sawing logs | Medium gear main, light second |
| | `leather` | Leather | Leather | 4-15 | Tanning hide + salt | Heavy and medium second |
| | `cloth` | Cloth | Cloth | 4-15 | Weaving fibre + dye | Light gear main |
| | `tinct` | Tinctures | Tincture | 4-15 | The Still: herbs | Tonics from grade 4, Salvage Runes |
| **Buff items** (new) | `S.buff` | Lantern Pearl, Pyreglass (working, 5.1), Starshard, Wellglass | - | by rarity | 5.4 | Sockets (4) |
| Coast (R2 spec) | `fish` | Fish | Fish | 4-6 | Fishing | The Kitchen (R2 owns) |

- **Secondary arrays are by region**, not by grade: `S.mats.coal` is 5 long, index = region - 1. Index 0
  (the Hollow) stays 0: Region 1 has no chains (3.6). One coal per region keeps the pouch short and reads
  plainly ("Sea Coal"), and it matches LORE-R45's one name per region.
- **Refined arrays are 15 long** like raw ones; grades 1-3 stay empty (Region 1 is raw).
- `pearl` stops being a material family. Region 2 ships Pearls as **buff items** (build-map R2, core-2
  5.4). Section 5.7 maps every Pearl cost in legendaries.md and region-2.md onto them.

### 1.2 The ladder: all 15 grades

Grades 1-5 keep today's names exactly (coordinator, 2026-09-28). Grades 6-15 are LORE-R45's names
(regions-4-5.md 1.4, 2.4, 3). Essence 6-15 had no names; this file adds them (**working**, owner approves).

| Grade | Region | Ore | Wood | Fibre | Hide | Crystal | Herb | Essence |
|---|---|---|---|---|---|---|---|---|
| 1 | Hollow | Copper | Oak | Flax | Soft | Quartz | Sage | Dim |
| 2 | Hollow | Iron | Yew | Nettle | Tough | Amber | Wormwood | Glowing |
| 3 | Hollow | Mithril | Ironbark | Silkgrass | Scaled | Moonstone | Bloodmoss | Radiant |
| 4 | Coast | Starsteel | Ghostwood | Moonsilk | Dusk | Starglass | Ghostcap | Blazing |
| 5 | Coast | Emberite | Lanternwood | Gloamsilk | Ember | Emberglass | Lantern Lily | Starlit |
| 6 | Coast | Coralsteel | Saltheart | Tideweave | Coral | Tideglass | Brinewort | Gleaming |
| 7 | Emberwaste | Cinderore | Charwood | Cinderwool | Cinder | Cindergem | Ashbloom | Kindled |
| 8 | Emberwaste | Ashsteel | Cinderpine | Ashsilk | Drake | Ashglass | Cindermint | Fervent |
| 9 | Emberwaste | Wyrmsteel | Sunwood | Flameweave | Salamander | Sungem | Sunflare Root | Sunlit |
| 10 | Pale Reach | Frostiron | Frostpine | Frostweave | Frost | Rimequartz | Snowroot | Candlelit |
| 11 | Pale Reach | Rime-steel | Whitebark | Snowsilk | Ridge | Glacierglass | Rimeblossom | Palelit |
| 12 | Pale Reach | Skysteel | Starwood | Starweave | Star | Starglow | Starflower | Skylit |
| 13 | Long Stair | Deepiron | Wellwood | Deepweave | Well | Deepglass | Deeproot | Deeplit |
| 14 | Long Stair | Rootsteel | Rootwood | Shadewool | Root | Rootglass | Shademoss | Bluefire |
| 15 | Long Stair | Wellsteel | Duskwood | Duskweave | Gloam | Wellglow | Duskbloom | Unfading |

- **Hide names** keep the code's shape: `MAT.hide.short` holds the first word and the unit is "Hide"
  (`matName` gives "Coral Hide", "Gloam Hide"). LORE-R45 wrote them as one word (Coralhide); the words are
  the same, only the space is added so "Coral Leather" reads the same way. Nothing is renamed.
- **Refined names** reuse the raw family's short name with the refined unit: "Starsteel Ingot",
  "Ghostwood Plank", "Dusk Leather", "Moonsilk Cloth", "Ghostcap Tincture". One name per grade per family,
  so no name means two grades (core-2 5.2).
- **One clash to settle (owner decision O3):** the buff family "Ember-glass" and today's grade-5 crystal
  "Emberglass" differ only by a hyphen. The crystal keeps its name (it is in live saves). Recommended:
  the buff family is shown as **Pyreglass** (id `glass` unchanged).

### 1.3 Secondary resources by region

| Region | Coal (Mining) | Salt (Foraging) | Dye (Foraging) | Where |
|---|---|---|---|---|
| 1 Hollow | - | - | - | Region 1 recipes are raw (3.6) |
| 2 Coast | **Sea Coal** | **Sea Salt** | **Whelk Dye** (working) | Coal washes up on the Grey Shingle; salt pans at Low tide; dye from whelk shells in the Coral Nave |
| 3 Emberwaste | **Pyre Coal** (working) | **Ash Salt** (working) | **Ember Madder** (working) | Coal in the Kilns; salt crusts on the Glass Flats; madder root on the Cinder Road |
| 4 Pale Reach | **Glimmercoal** | **Frostsalt** | **Frostbloom Dye** | regions-4-5.md 1.4 |
| 5 Long Stair | **Wellcoal** | **Deep Salt** | **Gloam Dye** | regions-4-5.md 2.4 |

A grade-g recipe uses the secondary of grade g's region: Starsteel Ingots (grade 4) take Sea Coal,
Wyrmsteel Ingots (grade 9) take Pyre Coal.

### 1.4 What gates each grade

A grade is **open** for gathering and crafting when both hold:

1. **Its region is reached** (`S.maxZone >= REGIONS[r].z0`). Grades 1-3 are open from the start.
2. **The skill gate**: the node's gathering skill for nodes, the station's crafting skill for recipes.

| Grade | Region | Fight drops from zone (`zoneGrade`) | Node gate (`nodeReq`) | Station gate (`stationReq`) |
|---|---|---|---|---|
| 1 | Hollow | 1 | 1 | 1 |
| 2 | Hollow | 7 | 14 | 10 |
| 3 | Hollow | 13 | 30 | 22 |
| 4 | Coast | **36** (was 19) | 64 | 36 |
| 5 | Coast | 42 | 112 | 54 |
| 6 | Coast | 56 | 140 | 66 |
| 7 | Emberwaste | 71 | 165 | 76 |
| 8 | Emberwaste | 82 | 190 | 86 |
| 9 | Emberwaste | 94 | 215 | 96 |
| 10 | Pale Reach | 106 | 235 | 104 |
| 11 | Pale Reach | 117 | 255 | 112 |
| 12 | Pale Reach | 129 | 275 | 120 |
| 13 | Long Stair | 141 | 290 | 127 |
| 14 | Long Stair | 152 | 305 | 134 |
| 15 | Long Stair | 164 | 320 | 140 |

- Zones assume 35 zones a region (Region 3 is zones 71-105 per lore.md 8.3; Regions 4-5 follow). The R3-R5
  specs move these rows if their zone counts differ; the rule is "the first zone of the region, then about
  a third and two thirds of the way in".
- `zoneGrade(z)` replaces `zoneTier(z)` for every fight drop (essence, signature drops, champions, uniques,
  expedition bands). `PACE.essTier` becomes the table above (`GRADE_Z`). Grades 1-3 and 5 start where they
  do today; **only grade 4 moves**, from zone 19 to zone 36. Section 1.8 covers saves that already had it.
- **Station gates stay low on purpose.** The crafting curve (`craftNeed`, with its 1.04 tail) makes level
  140 about 10 grade-15 crafts a level. Refining (3.3) also gives station XP, so a player who keeps a queue
  running passes the gates without re-rolling gear.
- **Node gates** keep GP1's rows 1-5. Rows 6-15 are starting values; GP2 (a part of S4's sim work) checks
  them against the in-region targets in 1.5 with `--report skills --days 90` and tunes `gatherNeed`'s tail
  or `nodeXp` if a gate lands late. A player who gathers that family should never wait on the node gate for
  a region's first grade.

### 1.5 What skill levels do inside a region

The region opens the grades; skill paces them inside the region and makes the Lanternbearer better at them.

| Inside a region | Target (normal play, the family a class gathers most) |
|---|---|
| First grade | Open on arrival (the gate is already met) |
| Second grade | About a third of the way through the region's calendar |
| Third grade | About two thirds of the way through |
| After the third | Levels keep paying: +2% speed a level (`spdPerLv`), tool mastery, rare finds, and the Hands' rate (they work at a share of yours) |

For Region 1 these are GP1's measured days (grade 2 on the first away trip, grade 3 on day 2.5-3.5). For
Region 2 they are GP1's tier 4 and 5 days (5.5-9.5, 13.5-17) plus grade 6 around day 20-26.

### 1.6 Nodes

| Row | Skill | Grades | Rule |
|---|---|---|---|
| Veins (ore), Geodes (crystal) | Mining | 1-15 | Names 1-5 as today; 6-15 "`<material>` Vein" and "`<material>` Geode" (Coralsteel Vein, Tideglass Geode). Region specs may give a region's three its own place names |
| Groves (wood) | Woodcutting | 1-15 | 6-15 "`<material>` Stand" (Saltheart Stand) |
| Fibre patches, Herb beds | Foraging | 1-15 | 6-15 "`<material>` Patch", "`<material>` Bed" |
| **Coal seams** (new) | Mining | one per region, 2-5 | Opens on reaching the region, Mining at the region's first node gate |
| **Salt pans, Dye plants** (new) | Foraging | one per region, 2-5 | Same rule, Foraging |
| Region nodes | as the region spec | - | Tide Pools and Fishing (Coast), Glass seams (Emberwaste), Starfall fields (Pale Reach), Wellglass seams (Long Stair) (5.4) |

Secondary nodes are built to be Hand work: **3 units a swing** at 0.8x the time of the region's first-grade
node, **half the skill XP**, no rare finds, the Glint works. The Lanternbearer can fill a gap by hand; a
Coal-digger does it better (3.5).

### 1.7 Storehouse

- **Caps per cell do not change** (`STORE_TUNE.caps`, owner's H3 table). `tierMult` grows to 15 entries of
  1. Groups: `coal`, `salt`, `dye` x1 (gathered); `ingot`, `plank`, `leather`, `cloth`, `tinct` x0.5
  (refined goods are denser: half the cap, and a recipe needs half as many, 2.3); `hide`, `ess` stay x0.5.
- **Why no new levels are needed for flows:** line power (2.4) keeps tool speed near its grade-5 value, and
  node time grows with grade (`1 + 0.3 (t - 1)`: 5.2x base at grade 15 against 2.2x at grade 5). With skill
  speed at level 300 (+600%) the best away rate at grade 15 comes out close to the grade-5 rate the Lv 8 cap
  was sized for. S4's check (HS19) extends to every grade and every family; if a cell fails, the fix is a
  Lv 9-10 row owned by WC1/BT1.
- **A cap never blocks a cost** (HS8) extends to refined and secondary cells: the largest refined cost (a
  +10 upgrade at grade 15) is a few hundred units.
- **Buff items are counts, not capped** (like Trophies), shown on the Storehouse's **Buff Items** page
  (coordinator decision, 5.6). Salvage Runes and Tinctures show there too.
- **The pouch view** groups cells by region: the current region's three grades open, older regions
  collapsed into one row per family ("Hollow: 12K Copper · 8K Iron · 40K Mithril"). 15 x 12 families is
  180 cells; only the open region is drawn by default (UX-F owns the screen).

### 1.8 Migration of today's 5 tiers

Today a save can hold grade 4 and 5 materials and items while still in Region 1 (zone 19+ drops, tier 4-5
nodes by skill, expedition bands IV-V). The rule: **the save keeps them, and keeps every way it had to use
them.** One pass, `S.gear2.v` 0 -> 1, after SAVE1's automatic backup (core-2 8.1).

| What | Rule |
|---|---|
| `S.mats` arrays | Padded from 5 to 15 with zeros (never truncated). New families start at zero. `Object.assign(fresh().mats, o.mats)` keeps the old 5-long arrays, so the pass pads every family, and readers use `S.mats[f][t - 1] \|\| 0` |
| Kept grades | The pass records `S.gear2.kept` = the highest grade the save had open anywhere: node tiers (GP1's `S.skillPace.hw` and today's gates), station tiers, `zoneTier(S.maxZone)` under the old table, the highest grade of any material held and of any item. A new game keeps nothing |
| Nodes | A kept grade stays open whatever the region (like GP1's rule): a Region 1 save with Starsteel veins keeps mining them |
| Fight drops | `dropGrade(z) = max(zoneGrade(z), min(oldZoneTier(z), kept))`: a save that already farmed tier-4 essence at zone 25 still does |
| Crafting a kept grade before its region | Grades 4-5 need refined materials (2.3), and refining needs the region's coal. Until the save reaches that region, **a kept grade crafts with its old raw recipe** (today's `CRAFT_KINDS` amounts). One line on the recipe: "Old recipe: you reached this tier before the Coast" |
| Items made before S4 | Keep every field and their exact lines (no `rv`: K4 base lines, 2.4). Upgrades and salvage use the old raw recipe for ever, at any grade. They gain **sockets by rarity** (4.1), which only adds |
| Transmute | Up into a grade needs that grade open (region reached or kept). Down stays as today |
| Expedition bands IV-V (Region 1) | Give grade 3 for new saves, and their old tier for a save that kept it |
| Camp costs | Rows that ask grade 4-5 in Region 1 (Storehouse Lv 6-8, other Hearth 6-8 rows) must move to grades 1-3 for new saves; WC1/BT1 re-cost them. A save mid-build keeps its price |
| `S.mats.pearl`, item `pl` | Never shipped. If a test save has them: `S.mats.pearl` is left in place and each unit of tier t is also credited as 1 `pearl_m` of rarity t (Seed = Common ... Lantern = Legendary); an item with `pl` gets that Pearl in its first socket at strength 1. Guard only |

What's new (one line, once): "Tiers now come by region: three in each. You keep every material and item
you have, and every tier you had open."

Region 1 pacing effect: grade 4 used to drop from zone 19. Gear lines at grade 3 instead of 4 are about
x0.56 on the weapon's damage line; with the rest of the party's damage that is roughly one zone at the
Listener (zone HP grows x1.48 a zone). BAL3 checks P1 (day 5-8) after S4 and trims Region 1's zone HP from
zone 19 on if it slips.

---

## 2. Gear by weight

### 2.1 Weights, kinds and who wears them

The kinds already in `CRAFT_KINDS` fit the three weights, so **no kind id changes**: only their recipes
(2.3) and base lines (2.4) get a Gear 2.0 version, used by items crafted after S4 (`rv: 2`).

| Position | Heavy (`heavy`) | Medium (`medium`) | Light (`light`) | Any |
|---|---|---|---|---|
| Weapon | Warblade | Bow | Staff, Censer | - |
| Off-hand | Shield | Quiver | Lantern, Tome | - |
| Head | Greathelm | Hood | Circlet, Mitre | - |
| Body | Plate | Leathers | Robe, Vestments | - |
| Charm | - | - | - | Charm |
| Tools | - | - | - | Pickaxe, Woodaxe, Sickle (Rod on the Coast) |
| Hero weapon (`wpn`) | Shield (tank) | Bow (striker) | Staff (caster), Tome (support) | - |
| Hero trinket (`trk`) | - | - | - | Trinket |

- **Who wears what** (core-2 5.1): the Lanternbearer wears its class's weight in weapon, off-hand, head and
  body, whatever its evolution. Warrior, Reaver, Warden: heavy. Ranger, Venomstalker, Trapper: medium.
  Mage, Warlock, Priest: light. Heroes wear by role in their two positions: tank heavy, striker medium,
  caster and support light.
- **Light kinds for any Mage** (classes-2.md 7.2, C5): Staff, Lantern, Circlet and Robe (today's
  Lanternmage kinds) and Censer, Tome, Mitre and Vestments (today's Lightkeeper kinds) are all light kinds,
  and **any Mage wears both sets**. They differ in look and in their default line set (2.2): Staff, Lantern,
  Circlet, Robe lean to casting; Censer, Tome, Mitre, Vestments lean to healing. `CRAFT_FITS` reads the
  weight (`KIND_W[kind]`) through `lbClass()` instead of the legacy class key; `cls` stays on each kind as
  data so `retoolItems()` and legend `fits` keep working. No migrated item stops fitting.
- **A class change** (Mirror of Embers) retools as `retoolItems()` does today: same id, grade, rarity, +N,
  lines, and the sockets' buff items turn into the new weight's version of the same family, rarity and
  strength (4.4).
- **The legacy Sword and Helm** stay non-craftable, as today.

### 2.2 Line sets: one weight, two roles

Each weight is worn by two evolution roles (classes-2.md 0): heavy by tanks (Warrior, Warden) and a
striker (Reaver); medium by strikers (Ranger, Venomstalker) and a caster (Trapper); light by casters (Mage,
Warlock) and a support (Priest). So a Gear 2.0 craft asks one question at the bench: **"Lines for"**, with
the weight's two roles. The default is the Lanternbearer's role now (`lbRole()`); hero kinds default to
their role. The choice is stored on the item (`ls`) and Reforge keeps using it.

| Line set | Affix pool (rolled lines, all different) | Who it serves |
|---|---|---|
| `tank` | armour, block, threat, one resist (holy, poison, fire or frost), stagger | Warrior, Warden, tank heroes |
| `striker` | attack, crit (with crit damage), pierce, attack speed, the wearer's type power | Reaver, Ranger, Venomstalker, striker heroes |
| `caster` | ability power, area, control, status power, the wearer's type power | Mage, Warlock, Trapper, caster heroes |
| `support` | healing, ward, haste, holy power | Priest, support heroes |
| any | max HP | everyone |

- **Type power** is fixed when the line rolls and stored as its stat id (`['pwFire', 0.62]`), so a class
  change never moves it: the Lanternbearer's current type (base or the evolution's added type: Reaver fire,
  Warden holy, Venomstalker poison, Trapper frost or poison, Warlock fire, Priest holy); for hero kinds, a
  type picked at the bench from the types of heroes of that role (classes-2.md 5.1).
- This answers C5 in the pool itself: Priest pieces lean to healing, ward and holy power; Warlock pieces to
  ability power, status power, fire power and area.
- **New affix ids** (all core-2 stats, `CRAFT_AFFIXES` rows): `aspd` (0.2 a point), `stPow` (1), `stag`
  (0.1), `pwPhys` `pwHoly` `pwPoison` `pwFire` `pwFrost` (1), `resHoly` `resPoison` `resFire` `resFrost`
  (0.4). Existing ids keep their rates. Line counts by rarity are unchanged (1 / 2 / 3 / 4 / 4, +1 with
  Masterwork), and so is the roll (`CRAFT_AFFIX_ROLL` 0.12-0.22 of the line's power).
- Items made before S4 keep their pools (Reforge on an old item rolls from its old pool, as today).

### 2.3 Recipe shapes

Tier-1 amounts; grade g costs `craftScale(n, g)` as today. **Grades 1-3** take these raw. **From grade 4**
the main and second families are taken refined, at half the count rounded up (Ore 7 becomes Ingot 4),
and the accents stay raw.

| Weight | Kind | Main (about 70%) | Second (about 30%) | Accents |
|---|---|---|---|---|
| Heavy | Warblade | Ore 7 | Hide 2 | Fibre 1 (grip), Essence 2 |
| | Shield | Ore 6 | Hide 3 | Wood 1, Essence 1 |
| | Greathelm | Ore 5 | Hide 2 | Fibre 1 (padding), Essence 1 |
| | Plate | Ore 7 | Hide 3 | Fibre 1 (padding), Essence 1 |
| Medium | Bow | Wood 7 | Hide 2 | Ore 1 (arrowheads), Essence 2 |
| | Quiver | Wood 5 | Hide 3 | Ore 1, Essence 1 |
| | Hood | Wood 5 | Hide 2 | Ore 1 (buckle), Essence 1 |
| | Leathers | Wood 6 | Hide 3 | Ore 1, Essence 1 |
| Light | Staff | Wood 5 | Fibre 3 | Crystal 1, Essence 2 |
| | Censer | Wood 4 | Fibre 3 | Ore 1 (clasp), Herbs 1, Essence 2 |
| | Lantern | Fibre 5 | Wood 2 | Crystal 2, Essence 1 |
| | Tome | Fibre 6 | Wood 2 | Herbs 1, Essence 1 |
| | Circlet | Fibre 5 | Wood 1 | Crystal 2, Essence 1 |
| | Mitre | Fibre 6 | Wood 1 | Herbs 1, Essence 1 |
| | Robe | Fibre 7 | Wood 2 | Crystal 1, Essence 2 |
| | Vestments | Fibre 7 | Wood 2 | Herbs 1, Essence 2 |
| Any | Charm | Crystal 3 | Herbs 1 | Essence 4 |
| Any | Trinket | Crystal 2 | Herbs 2 | Essence 2 (unchanged) |
| Tools | Pickaxe, Woodaxe, Sickle | unchanged (ore and wood; from grade 4, Ingots and Planks at half) | | |

- **Shares, per set of four:** heavy metal 25 : leather 10 (71%); medium wood 23 : leather 10 (70%); light
  cloth 20-22 : wood 10-11 (65-69%). **The light weapon leads with wood** (a staff is mostly wood); the
  owner's 70 / 30 holds across the set, not in every single piece (owner decision O1).
- **Every gathering line matters to every class:** ore is an accent in medium and light gear and a tool
  metal; fibre pads heavy gear; wood is in every light piece; crystal and herbs are in charms, trinkets and
  light accents; hide is in everything heavy and medium.
- **Example**, a grade-6 Plate: Coralsteel Ingot `craftScale(4, 6)` = 14, Coral Leather `craftScale(2, 6)`
  = 7, Tideweave Fibre 4, Gleaming Essence 4. Raw behind it: 28 Coralsteel Ore, 14 Sea Coal, 14 Coral
  Hide, 7 Sea Salt.
- **Upgrades and salvage** use the item's own recipe version (`rv`): Gear 2.0 items upgrade with refined
  materials from grade 4 (`0.6 x recipe x (plus + 1)`, gold as today); pre-S4 items keep their raw recipe
  for ever (1.8). Salvage gives back 40% of the item's own recipe, refined if it was refined.
- **Transmute** works on raw and secondary families only (refined goods are made, not traded up).

### 2.4 Stat budgets per grade

**Two kinds of lines.**

| Kind | Stats | Scales with |
|---|---|---|
| **Power lines** (output multipliers, no cap) | `might`, `attack`, `spell`, `heal`, `hp`, `pw*`, `stPow` | item power `p` (x1.65 a grade from grade 6, core-2 5.2) |
| **Rating lines** (a cap, a flat rating, or an economy or tool line) | `armour`, `block`, `threat`, `crit`, `critMult`, `aspd`, `haste`, `area`, `control`, `pierce`, `ward`, `stag`, `res*`, `gold`, `ess`, every gathering line | **line power** `lp` |

```
Pc(g) = TIER_POW[min(g, 5)] x (1 + 0.04 x max(0, g - 5))     // 10, 22, 42, 75, 130, then +4% a grade
lp    = Pc(t) x rarity x (1 + 0.15 x plus)                     // equals p for grades 1-5
```

For grades 1-5, `lp` equals `p`, so **no item that exists today changes by a decimal**. From grade 6 a
rating line gains 4% a grade instead of 65%: caps stay goals, armour stays a real choice, and tool speed
(and so the Storehouse and the Hands) stays in scale. This rule is a proposed core-2 change (9.2-1).

| Grade | `TIER_POW` | `Pc` | Rare weapon, damage line (`might` = 1.0 p) | Epic +10 weapon | Rare medium helm crit (0.05 lp) | Socket budget, Rare buff at 100%, power / rating |
|---|---|---|---|---|---|---|
| 1 | 10 | 10 | +18% | +63% | 0.9% | - (Region 1 has none) |
| 3 | 42 | 42 | +76% | +263% | 3.8% | - |
| 4 | 75 | 75 | +135% | +469% | 6.8% | 27 / 27 |
| 5 | 130 | 130 | +234% | +813% | 11.7% | 47 / 47 |
| 6 | 215 | 135 | +387% | +1,344% | 12.2% | 77 / 49 |
| 9 | 965 | 151 | +1,737% | +6,031% | 13.6% | 347 / 54 |
| 12 | 4,330 | 166 | +7,794% | +27,063% | 15.0% | 1,559 / 60 |
| 15 | 19,455 | 182 | +35,019% | +121,594% | 16.4% | 7,004 / 66 |

(Without line power the same crit line would read +1,751% at grade 15, fifty times its cap. The socket budget
is core-2's `0.20 x power(min(g, famTop)) x rarity x strength`, with `Pc` for rating lines; 5.2 turns it
into lines.)

**Base lines, Gear 2.0** (x `p` for power lines, x `lp` for rating lines; caps as core-2 1.1):

| Position | Heavy | Medium | Light |
|---|---|---|---|
| Weapon | damage 1.0; block 0.02 | damage 1.0; attack speed 0.02 | damage 1.0; ability power 0.3 |
| Off-hand | HP 0.8; block 0.04 | crit 0.10; attack speed 0.02 | Lantern: ability power 0.8. Tome: healing 0.8 |
| Head | HP 0.5; armour 0.06 | HP 0.4; crit 0.05 | Circlet: HP 0.4, ability power 0.2. Mitre: HP 0.4, ward 0.03 |
| Body | HP 1.0; armour 0.12 | HP 0.8; armour 0.05 | Robe: HP 0.6, ability power 0.4. Vestments: HP 0.6, healing 0.4 |
| Charm | gold 0.8; essence 0.3 (today's lines, on `lp`) | | |
| Trinket | HP 0.6; haste 0.05 (cap 25; today's, haste on `lp`) | | |
| Tools | speed 0.6; double yield 0.1 (cap 60); rare find 0.012 (cap 8) (today's, on `lp`) | | |

- **The damage line is the same for every weight** (`might` 1.0 p on the weapon, as today), so class
  parity (classes-2.md 6) does not move with gear. Weights differ in the second line: heavy blocks and
  holds, medium swings faster and crits, light casts and heals.
- **Armour check:** a heavy helm and body at grade 5, Rare +5 (`lp` 409) give about 74 armour; with the
  Warrior's base 30 that is 104, a 51% physical cut, under the 60% cap. At grade 15 Rare +5 (`lp` 573) it is
  about 133 with the base (57%); only Legendary +10 pieces reach the cap.
- **Parity check (sim, S4):** a Rare +5 set of each weight at grades 3, 6, 9, 12 and 15 gives each class
  within 5% of the median party power at the push zone (the CP targets in classes-2.md 6.1).

### 2.5 Crafted slots, rarities and sockets

| Rarity | Power x | Affix lines | Sockets (Lanternbearer pieces) | Hero `wpn` | Hero `trk` | Crafting odds at station level 36 / 80 / 140 |
|---|---|---|---|---|---|---|
| Common | 1 | 1 | 0 | 0 | 0 | 21.5% / 6.3% / 4.2% |
| Uncommon | 1.35 | 2 | 1 | 1 | 1 | 37.0 / 34.4 / 29.5 |
| Rare | 1.8 | 3 | 1 | 1 | 1 | 29.4 / 39.1 / 42.1 |
| Epic | 2.5 | 4 | 2 | 2 | 1 | 11.6 / 17.2 / 19.5 |
| Legendary | 3.2 | 4 | 3 | 2 | 1 | 0.5 / 3.1 / 4.6 |

- **Crafted Legendary** (core-2 5.3): from Region 2, `rarityWeights` gains
  `legendary: region >= 2 ? max(0, (lv - 30) x 0.08) x mod('rareW') : 0`. The other weights are unchanged,
  so Region 1 odds are exactly today's. `RAR.legendary.n` reads **"Legendary"**; a unique is known by
  `it.u` and shows "Unique".
- **Sockets are derived** from rarity and position, never stored as a count: every existing item gains
  its sockets (empty) when S5 lands. Tools and the legacy Sword and Helm have none. Charms use the
  Lanternbearer column. Oath Legendary items (Epic power with `lg`) have 2.
- **Region 1:** sockets show on the card as empty rings with "Opens on the Sunken Coast" until Enchanting
  unlocks (4.2). They are a reason to keep a good Region 1 piece.
- **Crafted slots in all:** the Lanternbearer has 5 socket-bearing positions (up to 3 each) and each hero 2
  (up to 2 + 1). A party in Legendary gear has 21 sockets; a typical Region 2 party (Rare and Epic) has
  about 11.

---

## 3. Production chains

### 3.1 The chains

One step each, from Region 2 on. Every output is a family in `S.mats` (1.1).

| Chain | Takes (for 1 output) | Station | Makes | Station skill (XP) |
|---|---|---|---|---|
| **Smelting** | 2 Ore + 1 Coal of that grade's region | the Forge's Smelter | 1 Ingot | Smithing |
| **Sawing** | 2 Logs | the Workbench's Saw | 1 Plank | Woodcraft |
| **Tanning** | 2 Hide + 1 Salt of that grade's region | the **Tannery** (new building) | 1 Leather | Tailoring |
| **Weaving** | 2 Fibre + 1 Dye of that grade's region | the Loom | 1 Cloth | Tailoring |
| **Distilling** | 3 Herbs | the Still at the Enchanter's Table | 1 Tincture | Enchanting |

- Refined goods are **denser**: recipes ask half as many (2.3), and the Storehouse holds half as many
  (1.7), so the raw behind a recipe is the same as before plus the secondary.
- Sawing has no secondary: medium gear pays in salt (leather) and heavy gear in coal and salt, light gear
  in dye. Heavy gear costs the most secondary; it is also the most durable in the Storehouse sense (the
  Warrior replaces fewer pieces, since armour caps early, 2.4).
- **Tinctures** go into Tonics from grade 4 (1 Tincture replaces 3 Herbs in a Tonic recipe) and Salvage
  Runes (4.4). The Still is optional for 1.0 (owner decision O6); without it, runes take Herbs.
- Who needs what: every class needs Ingots only as accents and tools, Planks in every light piece, Leather
  for heavy and medium, Cloth for light. So each class runs two or three chains and touches all five a little.

### 3.2 Stations, queues and where they live

| Station | Where (WC1 decides the building; this is the job) | Opens | Queue |
|---|---|---|---|
| Smelter | The Forge's Smelter branch (plan-4 6.2 names it); WC1 may make it its own building | The Great Lantern of the Hollow (Region 2 reached) | 3 orders |
| Saw | The Workbench (a Sawmill branch) | same | 3 |
| Loom | The Loom | same | 3 |
| **Tannery** | **New building**, its own plot. The plot shows a stake from zone 30: "Opens when the Great Lantern of the Hollow burns" | same | 3 |
| Still | The Enchanter's Table | same | 3 |

- **An order** is a grade and a count (up to 250 x station level at once). The inputs are taken when the
  order is placed, so the pouch never promises what the queue already spent. **Cancel** gives back what is
  not yet refined (a gift: it always lands). Building trees can add a 4th and 5th order (BT1).
- **Outputs arrive one by one as a flow** into the Storehouse. If that cell is full the order pauses
  ("Storehouse full: Starsteel Ingot. Refining waits."), like a node at its cap. Nothing is lost.
- **It runs while you are away**, up to the away cap, in closed form (orders run in queue order).
- A station builds up to Lv 5 on the standard camp rows (WC1/BT1 cost them). The Tannery's Lv 1 costs
  Region 1 materials so it can stand on arrival: Mithril Ore 60, Ironbark Log 80, Scaled Hide 40, 10 min.
- **Coast arrival gift** (a gift, lands above the cap): 50 Sea Coal, 25 Sea Salt, 25 Whelk Dye, so the first
  grade-4 weapon is one short queue away. Next Up: "Smelt your first Starsteel Ingots at the Forge."

### 3.3 Refining speed

```
secs per output = 6 x (1 + 0.15 x (g - 4)) / speed
speed           = (1 + 0.2 x (station level - 1)) x (1 + refiners) x mod('refine')
```

| Grade | Lv 1, no refiner | Lv 3, 1 Common refiner | Lv 5, 2 Rare refiners |
|---|---|---|---|
| 4 | 600 an hour | 1,050 | 1,890 |
| 6 | 460 | 810 | 1,450 |
| 9 | 340 | 600 | 1,080 |
| 12 | 270 | 480 | 860 |
| 15 | 230 | 400 | 710 |

(A Rare refiner adds `2.5 x 15%` = +37.5%; Lv 5 is x1.8.)

- **Demand check:** a Rare +5 set of four at the new grade (recipes plus upgrades, `10 x recipe`) takes
  about 500 main + 250 second refined units at grade 6, and 1,100 + 550 at grade 15. That is about one away
  session at Lv 1 with no help, and 2-3 hours with a built-up station and refiners. Refining should never
  hold a new grade back by more than one check-in (target E4, section 8).
- **Refining XP:** `0.3 x g` a unit to the station's skill (a grade-15 set's ingots are about 2-3 crafts of
  XP). It lets a player who keeps a queue running pass the station gates (1.4) without re-rolling gear.
- The knob table is `REFINE_TUNE` (`secs`, `perGrade`, `perLv`, `batch`, `xp`) in the S4 data file.

### 3.4 Secondary resources: the throttle

- **One secondary unit per refined unit** (none for planks). A grade-6 heavy set needs about 500 Sea Coal
  and 250 Sea Salt.
- **The Lanternbearer can gather them** (the owner's rule: the game is playable without Hands). A coal seam
  gives 3 Coal a swing at 0.8x the time of the region's first ore node: about 3.75x that node's rate, so 10
  minutes of coal covers an hour of ore. But it gives half the skill XP and no rare finds, so the hero's own
  time is better spent on the grade it is climbing. **That is what makes it a Hand job**, not a penalty.
- **Hands on secondaries:** a Common Coal-digger at 10% share gathers `0.1 x 3.75` = 37% of the hero's ore
  rate in Coal, which feeds 75% of that ore into ingots. One secondary Hand per chain a class runs is enough.

### 3.5 Gatherer jobs RG1 needs (N1b owns the roster, names and trees)

| Job | Works | Rate | Notes |
|---|---|---|---|
| Coal-digger | Coal seams | share x the hero's rate at that seam | from Region 2 |
| Salter | Salt pans (and rime, stone) | same | from Region 2 (roadmap-review 2.5) |
| Weaver-gatherer | Fibre patches and Dye plants | same | fibre from Region 1, dye from Region 2 |
| **Hunter** (owner: yes) | A lit zone the party has cleared | `share x huntRef(g)`, `huntRef(g)` = 0.5 x the hero's reference rate at the best grade-g node it has | Brings Hide of the zone's grade. +25% in zones whose foes drop hide as a signature (beasts) |
| Gem-seeker | A region's buff-item node (5.4) | finds at share x the node's find rate | The Lucky one of the pair gets +5% find rate (owner) |
| **Refiner** (any Hand) | A station instead of a node | +`2.5 x share` station speed (Common 25%, Legendary 62%); x1.5 on its own chain (a Coal-digger at the Smelter) | At most 2 refiners a station. No haul and no pack: the queue is the pay. Hand XP by hours worked, as today |

- The Lanternbearer never hunts: owner decision 4 (hide is fight-only for the hero) stands; hunting is a
  Hand job (plan-4 5, owner "Hunter: yes").
- Refiners and Hunters sleep in the Bunkhouse like any Hand; the bed cap's late-game rise (`handBeds`)
  is where they come from.
- The `role` field on a Hand record (57f-hands.js: "missing = 'gather'") takes `refine` and `hunt`.

### 3.6 Region 1 stays raw

- Grades 1-3 take raw materials only. The refined cells for grades 1-3 exist in the save (15-long arrays)
  but are never made or shown.
- The stations' refining queues, the Tannery and the secondary nodes open together at the Great Lantern of
  the Hollow, one step before the first grade-4 recipe. A player's first hour is exactly today's.
- Kept grades (1.8) craft raw before the Coast, so a Region 1 save never meets a refined recipe early.

---

## 4. Enchanting

### 4.1 Sockets

- Counts by rarity and position (core-2 5.3; table in 2.5). Uniques 2.0: one locked socket and one open
  socket (Region 1 uniques: one open socket, 6.1). Classic uniques: one open socket. Tools: none.
- Item field `so`: the **open** sockets, `[[buffId, rarity, strength], ...]` (core-2 8.2), index = socket.
  A missing or short array means empty sockets. A unique's locked socket is **data** (its row in `UNIQ2`),
  never saved (store ids, not derived numbers).
- **The version must match the item's weight** (core-2 5.4): heavy items take `_h`, medium `_m`, light
  `_l`; charms take any; hero weapons take their role's weight; hero trinkets take any.

### 4.2 Setting a buff item

At the **Enchanter's Table**, from the Great Lantern of the Hollow (the Coast reached; core-2: Region 1
has no buff items). The Enchanting skill (`ench`) already exists; this is its main job from Region 2 on.

| | Rule |
|---|---|
| Action | **Set** a buff item from the Storehouse into an empty socket of a fitting version |
| Cost | Gold `foesGold(S.maxZone, 20)` and 2 Essence of the item's grade. The buff item is used up into the socket |
| Strength | Fixed when set: `enchStr(lv) = 0.70 + 0.30 x min(1, (lv - 1) / 79)`: **100% at Enchanting 80** |
| XP | `8 x g` Enchanting XP (g = the item's grade) |
| Value | The socket budget (core-2 5.4, with `Pc` for rating lines) split over the buff item's two lines (5.2) |

| Enchanting | 1 | 20 | 36 | 54 | 66 | 80 |
|---|---|---|---|---|---|---|
| Strength | 70% | 77% | 83% | 90% | 95% | 100% |

- **Why 80:** GP1 has Enchanting near 36 when a class reaches the Coast (tier 4 on day 3.5-11.5), so the
  first settings land at about 83%. Level 80 comes around the middle of Region 3 for a player who enchants
  and brews, and a bit later for one who does not: the skill matters for two regions and then stops being a
  tax. Uniques' locked sockets are fixed at 110% (core-2).
- **Tune:** re-set a buff item at your current strength without taking it out. Gold
  `foesGold(S.maxZone, 10)`, no Essence, `2 x g` XP. It is the reason to keep levelling Enchanting past the
  first settings, and it never costs the buff item.
- **Heroes' sockets are worth it** (core-2 Q7): the cost is small and flat (gold plus 2 Essence); the buff
  item is the real price, and heroes deal most of the party's damage, so a Rare buff item in a hero's weapon
  is often the best use of one. The sim's settings policy (8) fills hero weapons second, after the
  Lanternbearer's weapon.

### 4.3 Taking a buff item out

| Way | Result |
|---|---|
| **Take out** | The buff item breaks (owner rule). In-page ask: "Take out the Rare Lantern Pearl? It will break. [Break it] [Keep it]" |
| **Take out with a Salvage Rune** | The buff item goes back to the Storehouse at its rarity. Its strength is set again when you next set it |
| **Set another over it** | Asks the same question first; never silent |
| **Salvage the item** | The salvage sheet lists its buff items with a toggle "Use N Salvage Runes to keep them" (on when you hold runes). Without runes they break, and the sheet says so. **Auto-salvage never picks an item with a buff item in it** |
| **Upgrade (+N)** | Buff items stay. The socket budget reads the item's grade and the buff's rarity and strength, not +N |
| **Class change (retool)** | Buff items turn into the new weight's version of the same family, rarity and strength |
| **Temper a unique** (6.5) | Buff items stay; their value follows the new grade up to `famTop` |

**Salvage Runes** (a count in `S.gear2.rune`, shown on the Buff Items page):

| Source | Amount |
|---|---|
| Craft at the Enchanter's Table | 5 Crystal + 3 Essence of any grade from 4 (you pick the pile; default your highest), + 1 Tincture if the Still exists (else 3 Herbs). 10 Enchanting XP |
| Region boss first kill (Coast onward) | 3 |
| Bounties, the Almanac board, trade towns (7) | 1-2 as rewards |

A rune costs about as much as an hour of mid-region gathering: cheap enough to move Rare and better buff
items, not worth it for Commons, which is the decision the owner's rule asks for.

### 4.4 What the Lanternbearer sees (360 px)

**Item sheet (Armoury, UX-F), the sockets row** under the lines:

```
 Coralsteel Plate +4         Rare · Heavy · Tier 6
 HP +619%   Armour +47
 ...affix lines...
 Sockets  [ ◆ Rare Lantern Pearl 92% ]   [ ◇ empty ]
          +42% max HP, +7% frost resist    Tap to set
          Tidefast on the Coast
```

**Tap an empty socket → "Set a buff item"** (a 90% bottom sheet):

```
 Set a buff item · heavy                        [x]
 Your Enchanting 55: 90% strength
 ── Lantern Pearl ─────────────────────────────────
 ◆ Rare       ×3   +42% max HP, +7.0% frost resist   [Set]
 ◆ Uncommon   ×7   +31% max HP, +5.3% frost resist   [Set]
 ◆ Common    ×12   +23% max HP, +3.9% frost resist   [Set]
 Costs 1.2K gold and 2 Gleaming Essence
```

- Only versions that fit are listed; the lines are the real values at this item's grade and your
  strength. Families you have none of show one grey row: "Lantern Pearls: fishing and Tide Pools".
- **Tap a filled socket** → a small sheet: its lines, "Set at 92%. Your Enchanting gives 95%."
  **[Tune to 95%: 600 gold]**, **[Take out with a Salvage Rune (you have 4)]**, **[Take out (it breaks)]**.
- Toasts: "Set a Rare Lantern Pearl in Coralsteel Plate." (low). Colour is never the only signal: the
  rarity word is always written, and the version shows as a small weight icon plus the word.
- Reduced motion: no sparkle on setting; the socket fills at once.
