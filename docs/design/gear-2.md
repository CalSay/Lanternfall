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
