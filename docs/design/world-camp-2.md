# World and Camp 2.0 (WC1)

Status: design spec WC1, written 2026-09-28. It covers build-map.md section 5 (the WC1 brief): (a) the
full building catalogue for Season 1 with levels, costs, trees, plots and region gates; (b) the camp
panorama; (c) the World map across five regions (outposts, towns, dungeons, raid sites, Great Lanterns,
events, secrets, travel, locked regions); (d) how the camp and the map connect; (e) the build split for
UX-W2, BT1, N2 and the tasks this spec adds. It also settles the region-boss milestone table (lore.md
4.4a) against plan-4's unlock order. All numbers are starting values for `tools/sim.mjs`; ids and names
are not.

Sources: build-map.md (WC1 row, section 5 brief), plan-4.md 1, 5, 6 and 8, lore.md 2, 4.4, 4.4a, 7 and 8,
regions-4-5.md, gear-2.md (chains, stations, the Tannery, trade towns, owner answers to 9.3: the Still is
benched until after 1.0), gatherers-2.md (routes, caps, BT1/WC1 hooks), hearth-and-hands.md 1, 4 and 6,
camp.md, map-study.md "Hybrid H", ux-overhaul.md 6.14 and 7, combat-2.md 6, classes-2.md 3, roadmap-review.md
2.6 and 2.9, pinnacles.md, region-2.md 8.2, the wave log to 2026-09-28, and the camp code as built
(`57-camp.js`, `55-hearth.js`, `55-store.js`, `57f-hands.js`, `21f-data-hands.js`, `63d-scenery-camp.js`,
`63e-scenery-wall.js`, `55-lantern.js`, `57e-constellations.js`).

Owner and coordinator rules this spec obeys:

1. **One camp.** Hollow's Rest is the only place you build. The map grows real places, but nothing out on
   the road has a build queue.
2. **Building trees live inside each building:** one point a level into 3 branches x 4 nodes, free respec
   while the building is idle, damage nodes capped (plan-4 6.2).
3. **Region bosses are Shrouds** (lore.md 4.4). On the map a Shroud's zone is a hole of dark the lamp pools
   cannot reach. Its fall lifts the region's shroud for good, and **we** relight the Great Lantern.
4. **Every Shroud's fall gives a sight, a person and a power** (lore.md 4.4a), each genuinely new at that
   point in the game (coordinator fix, section 1).
5. **The gatherer cap is Tents** (owner, 2026-09-28, overriding gatherers-2 6): 2 at the start, about 10 by
   Region 5, built with gold and materials. Gatherers cost a one-off **hire fee** plus a **shift fee** in
   gold by resource grade, with no daily wage (N1c and ECON1 own those rules; this spec shows them).
6. **Gold is priced by ECON1.** Gold per kill will step up by region (ECON1). So every gold cost here is
   written in a relative unit, **R*r* minutes**: minutes of a normal player's fight gold in region *r*
   (`goldMin(r, m)`, ECON1 defines it). Section 2.9 lists every gold cost in one table.
7. **The camp scene pans, it does not shrink** (owner): it grows sideways, with two zoom levels at whole
   pixel scales (2x normal, 1x overview), and hired gatherers live in it as people you can tap.
8. **Words:** buff items are **Sigils** (Tide, Ember, Frost and Gloam Sigils); the crystal family shows as
   **Gems**, mined from Geodes; the Gem-seeker job is the **Sigil-seeker**. `docs/design/materials.md` does
   not exist on this branch, so materials are named by grade and family only ("grade-4 ore").
9. **Saves:** until 1.0 the owner accepts a wipe (CLAUDE.md). No heavy migrations; new fields get defaults.
10. **The online layer does not change shape** (`world/boss`, `raiders/*`, room presence, `rally`,
   `52-raid.js`, `80-online.js`). The map only decides where the raid pin is drawn.

Design rules of this spec:

1. **Every building has one clear job a player can say in five words.** Two weak buildings become one
   decent one; a new building only exists when a system needs a home.
2. **Levels past 5 are gated by region, not by the Hearth.** The Hearth still paces Region 1 and the start
   of Region 2; after that the road paces the camp.
3. **A tree gives identity, not raw power.** Points never reach all 12 nodes (10 at most), and every camp
   damage source together stays at +15% (camp.md rule 4, K12's `CAMP_DMG_CAP`).
4. **The camp shows the road.** Each lifted shroud changes the camp's skyline, and each new building stands
   on a plot that was a stake first.
5. **No per-frame work on the map.** The shroud is baked into the light plate like any lamp.

---

## 1. The milestones: the final table (coordinator fix)

### 1.1 What was wrong with lore.md 4.4a

| Row | Problem | Fix |
|---|---|---|
| 1, the Hollow | The person "raises the Storehouse", which a new game builds in about minute 8 (H3). | The person raises the **Tannery**, the one building that opens at this moment (gear-2 3.2: leather opens with the Great Lantern of the Hollow). |
| 2, the Coast | "Enchanting unlocks" at the Coast's boss. gear-2 4.2 opens Enchanting **on reaching the Coast** (the Great Lantern of the Hollow), so Tide Sigils from the Coast's elders can be set all through Region 2. At the Coast's boss it would be 3-4 weeks late. | Enchanting stays where gear-2 puts it. The Coast's power is **Lanternlit** (rank 8), which region-2.md 8.2 and gear-2 5.7 already gate on this exact fall. The person raises the **Infirmary**, where tired heroes rest. |
| 3, the Emberwaste | "Trade routes open between reached regions". gear-2 7.1 (owner O12: yes) opens trade on reaching the Coast (Mossy Hollow, Map Room Lv 2) and each town on reaching its region. And a "Forge upgrade" is not a new building. | The power is **Awakenings** (plan-4 7): the held lights go home and every lamp brightens, so a hero's own light can burn brighter. The person raises the **Lamp House**, where a hero's quest ends in its Awakening. HQ1 confirms (decision O3). |
| 4, the Pale Reach | "A new Tactics slot". Heroes have 3 rule slots and the Lanternbearer 2 (core-2 4.5), and classes-2 3.6 opens them with Tactics and evolving, not with a region. A fourth slot breaks that shape. | The sight is the stars coming back, so the power is **a third keystone** on the star map (`STAR_TUNE.keyMax` 2 to 3). The person raises the **Beacon**. |

The table below replaces lore.md 4.4a's Person and Power columns (the Sight column is kept, with one
line added for what the map and the camp show). LORE work updates lore.md to match after the owner signs
off (decision O1).

### 1.2 The final table

| Region boss (Shroud) | Sight: on the map | Sight: at camp | Person | Building or service (new at this point) | Power (plan-4 order) |
|---|---|---|---|---|---|
| **The Hollow: the Drowning Dark** (zone 35, about day 5-8) | The hole at Wraithmarsh V closes. The marsh fog motes stop; fireflies come back. The Great Lantern on Lantern Hill lights and lifts the whole Hollow plate to dusk. Mossy Hollow's market pin lights. | Morning mist burns off the camp's skyline; the Great Lantern shines on Lantern Hill behind the Hearth. | **The Rushbys**: Gil Rushby, the marsh trapper, and his family, who hid on a reed island in the fog with one shaded lamp. Gil joins as the Hunter (gatherers-2 route 9). | **The Tannery.** The Rushbys raise it: Lv 1 is theirs, free, 10 minutes. The leather chain opens (gear-2 3.2, 3.6). | **The Proving** (the evolution trial, classes-2 3.2; owner: gated on this kill). Reaching the Coast also opens the production chains and Enchanting (gear-2), which show their own cards when first used. |
| **The Sunken Coast: Silas Penrow, the Fogbound** (zone 70, about day 21-35) | The Coast's hole closes. The sea-fog band over the plate lifts; Saltreach Light turns from held green to gold. At low tide the drowned streets show as a pale grid under the water. | A glint of sea shows on the far west horizon; gulls pass at dawn. | **Mercy Penrow**, Silas's sister, Saltreach's healer, who stayed on the reef with the survivors for ten years. The Hollises come too, if Bram is recruited (gatherers-2 routes 13 and 16). | **The Infirmary.** Mercy raises it (Lv 1 free, 10 minutes). Heroes rest there: Rested fills faster and rested heroes come back stronger. | **Lanternlit:** heroes promote to rank 8, level cap 225 (region-2.md 8.2; 25 Tide Sigils, gear-2 5.7). The Pinnacles also open here, with an Oath of 15 kept (pinnacles.md 1). |
| **The Emberwaste: the Pyre Knight** (zone 105, about day 40-55) | Every red (held) lamp glow on the plate lifts off as a mote and drifts west, out of the plate, home. The ash plate warms to its lit palette, and a green fleck grows in the ground ramp. | The eastern hills turn from red glow to green at dawn; the camp's lamps burn a little brighter from now on (a warmer lamp tint). | **The Emberlea families** Caedmon got out on the Fall night, led by the old lampwright **Tamsin Wray**. Brannoc the kiln-hand comes with them (gatherers-2 route 12). | **The Lamp House.** The Emberlea lampwrights raise it (Lv 1 free, 10 minutes). A hero's quest ends here. | **Awakenings** (plan-4 7, HQ1): finishing a hero's quest at the Lamp House Awakens them. |
| **The Pale Reach: the Whitehush** (zone 140, about day 60-72) | The hole at Frostgate Bastion closes; the Whiteout motes stop. True stars (fixed pixels) show in the plate's sky band. The new Great Lantern stands lit at the Frostgate. The Silent Village's sill-candles light one by one. | Real stars over the camp at night, for the first time; Oriel sits on the Chapel roof to watch them. | **Wick**, the Silent Village's candle-keeper, who kept one candle lit for the whole village, alone, for ten winters (regions-4-5.md 1.9's hook), and **Fenn**, her neighbour. | **The Beacon**, on the rise above the camp. Wick raises it (Lv 1 free, 10 minutes). Once a day it calls a waiting event to you, and its light shows secret hint marks on the map. | **A third keystone** on every star map (`STAR_TUNE.keyMax` 3). "The stars are back." |
| **Season 1 finale: the Voice** (the Heart of the Gloamvale; not a Shroud) | The Heart's great hole thins to plain night (dusk level). Every lamp pool on every plate grows 15% at once. | Every lamp in camp brightens; the Lantern Hall's crown burns white-gold. | Everyone the Voice held goes home (lore.md 8.6): Vesper, Oriel, Elowen. | None. | None (lore.md 8.7): a title, a lantern colour, the Season 2 hook. |

Notes:

- **Why these three buildings.** Each is a home a system needs, arriving the moment the system becomes
  useful: leather is a main material from Region 2 (the Tannery); Region 3's fights hit harder and reward
  rotating heroes (the Infirmary); Awakenings are the last big hero power before the finale (the Lamp
  House). The Beacon serves events and secrets, which grow richer as more of the map is real.
- **The person's building is a gift.** Its Lv 1 costs nothing and takes 10 minutes, whatever the builders
  are doing (it does not use a builder). Its plot showed a stake with a line in the Shroud's voice since
  the region's third band ("Nothing grows here while the fog stands.").
- **Old saves** past a boss get the person and the building's Lv 1 on load, once, as one bell line
  ("The Rushbys came while you were away. The Tannery stands.") (55-lantern's `quiet` rule).
- **The leftover LORE-R45 names** (the coordinator leans against extra Sigil-seeker pairs): Wick and Fenn
  are the Pale Reach's people above; **Haldor and Nessa** keep the Gloamvale's outpost fire (3.2);
  **Old Corrin**, the retired Deepwell miner, can be the Deepwell's winch-keeper at camp (he arrives when
  the Deepwell opens), and **Sable** "found a way down nobody else had": she guides the party to the
  Deepwell's new stretch after the ending (regions-4-5.md 2.8). HER, R5 and LORE-G keep or drop these.

---

## 2. The building catalogue

### 2.1 The list

Seventeen buildings and five landmarks. "Opens" is when its plot shows a stake you can build on. "Levels"
is the full range for Season 1; the region gates for Lv 6-10 are in 2.3.

| # | Building (id) | Job, in five words | Opens | Levels | Status |
|---|---|---|---|---|---|
| 1 | **Hearth** (`hearth`) | The camp's level and builders | Always (a cold start lights it) | 1-10 | Built; re-costed (2.4) |
| 2 | **Workbench** (`bench`) | Woodcraft; the Saw (planks) | The fire lit | 1-10 | Built; Saw fixture from Region 2 |
| 3 | **Forge** (`forge`) | Smithing; the Smelter (ingots) | Workbench built | 1-10 | Built; Smelter fixture from Region 2 |
| 4 | **Storehouse** (`store`) | Holds materials and Sigils | Forge built, or a pile near full | 1-8 (9-10 reserved) | Built (H3); gains a tree |
| 5 | **Loom** (`loom`) | Tailoring; weaving cloth | Zone 5 | 1-10 | Built; weaving from Region 2 |
| 6 | **Enchanter's Table** (`ench`) | Enchanting; setting Sigils; runes | Zone 6 | 1-10 | Built; Sigils from Region 2 |
| 7 | **Tavern** (`tavern`) | Heroes, gatherers, rumours, trade | Zone 8 | 1-10 | Built |
| 8 | **Tents** (`bunk`, was the Bunkhouse) | Where your gatherers sleep | Hands open (Hearth 2 and the Tavern) | 2-10 tents | **Repurposed** (2.5) |
| 9 | **Watchtower** (`watch`) | Away limit; scouts; alerts | Hearth 1 | 1-10 | Built |
| 10 | **Map Room** (`maproom`) | Expeditions and trade routes | Hearth 2 | 1-10 | Built |
| 11 | **Chapel** (`library`, was the Library; absorbs the Shrine) | Codex, Blessings, study | Hearth 2 | 1-10 | **Merged** (2.6) |
| 12 | **Armoury** (`armoury`) | Your gear, sets and racks | Hearth 2 | 1-10 | New (UX-F screens, BT1 row) |
| 13 | **Kitchen** (`kitchen`) | Meals that last hours | Hearth 3 | 1-10 | New (K12's design, R2 builds) |
| 14 | **Tannery** (`tannery`) | Tanning hides into leather | Stake from zone 30; raised by the Rushbys | 1-10 | New (milestone 1) |
| 15 | **Infirmary** (`infirmary`) | Tired heroes rest and recover | Stake from zone 57; raised by Mercy Penrow | 1-10 | New (milestone 2) |
| 16 | **Lamp House** (`lamphouse`) | Heroes Awaken here | Stake from zone 92; raised by the Emberlea families | 1-10 | New (milestone 3) |
| 17 | **Beacon** (`beacon`) | Calls events; shows secrets | Stake from zone 127; raised by Wick | 1-5 | New (milestone 4) |
| - | Trophy Wall (`wall`, decor plot p13) | Your Feats on display | 250 achievement points | 3 stages | Built (AC5); no tree |
| - | The Deepwell, the Almanac post, Lantern Hill (the Great Lantern), the road gate | Landmarks | As today | - | No levels, no tree |

**Merged or retired:**

- **The Garden** was cut before it was built (57-camp: "Next Up replaces the Garden"). It stays cut:
  gatherers and the Kitchen cover what it did.
- **The Library and the Shrine merge into the Chapel** (2.6). Both were thin: the Library's Codex already
  opens from the Journal, and the Shrine only held 1-2 Blessings over 3 levels. Blessings are unlocked by
  Codex pages, so the building that keeps the books is the natural place to hold them.
- **The Bunkhouse becomes the Tents** (owner, 2.5).
- **The Still** (herbs into Tinctures) is benched until after 1.0 (gear-2 owner answer O6). The Enchanter's
  Table keeps a reserved fourth branch slot for it in the data (`CAMP_TREES.ench.later`), never shown.
- **The Smelter and the Saw are fixtures, not buildings.** Plan-4 6.2 gives the Forge a Smelter branch.
  A player must be able to smelt without spending a point, so the Smelter is a **fixture of the Forge**
  (its queue opens on reaching the Coast); the Forge's **Smelter branch** makes it better. The same for the
  Saw at the Workbench and weaving at the Loom. The **Tannery is the one new chain building**, because
  leather had no station before (gear-2 3.2, owner "Tannery: yes").

### 2.2 Costs, Lv 1-5 (kept, with the grade fix)

Materials, trophies and timers keep 57-camp's formula: each family in the building's `fam` at
`ceil(M x mult[L])`, trophies `troph[L]`, timers `secs[L]` (CAMP_TUNE). **Gold** changes from today's
`campGold(zRef, goldPerLv x L)` (foes' worth at the gate zone, which inflates) to a relative row in 2.9
that ECON1 prices. One more fix:

**The grade of a row follows gear-2's region gates.** Today row `L` asks tier `L`, so a Lv 4 building (Hearth
6, zone 27) asks grade-4 materials, which gear-2 moves to the Coast (zone 36). New rule, one table:

| Row | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Material grade (`CAMP_GRADE`) | 1 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 10 | 13 |
| Gate | Hearth 1 | Hearth 2 | Hearth 4 | Hearth 6 | Hearth 8 (Coast) | Hearth 10 | Emberwaste reached | Zone 88 | Pale Reach reached | Gloamvale reached |

- From grade 4 a family asks its **refined** form at half the count (ore to Ingots, wood to Planks, fibre
  to Cloth, hide to Leather; gear-2 1.7's density rule). Gems, herbs and essence stay raw.
- **Hearth rows** get the same rule: Hearth 6 (zone 27) and Hearth 7 (zone 32) drop from grade 4 to grade
  3 at x1.3 the amounts; Hearth 8 (zone 38) drops from grade 5 to grade 4 (grade 5 first drops at zone 42).
  Hearth 9-10 keep grade 5.
- **Gatherers' region gates** are unchanged: a row never asks a grade whose region is not reached.

### 2.3 Levels 6-10: region gates and costs

Levels 6-10 each give one more tree point and the level line in 2.8. They open with the road, not the
Hearth (rule 2):

| Level | Gate | Grade | Material mult | Trophies (any) | Timer |
|---|---|---|---|---|---|
| 6 | Hearth 10 (zone 55, mid Coast) | 5 | 5 | 3 | 36 h |
| 7 | The Emberwaste reached (zone 71) | 7 | 6 | 3 | 40 h |
| 8 | Zone 88 (mid Emberwaste) | 8 | 8 | 4 | 44 h |
| 9 | The Pale Reach reached (zone 106) | 10 | 10 | 4 | 48 h |
| 10 | The Gloamvale reached (zone 141) | 13 | 12 | 5 | 48 h |

- Gold: the row's relative amount in 2.9.
- **Builders:** 1, 2 from Hearth 5 (today), **3 from the Hearth tree's capstone** (2.8). About 60 builds of
  Lv 6-10 over roughly 75 days at 36-48 h each is about 35 days of work for 3 builders, so a player who
  checks in daily keeps every builder busy without racing.
- **Points by region end** (normal play): Region 1 about 4 a building, Region 2 about 6, Region 3 about 8,
  Region 4 about 9, Region 5 10. Never 12.
- The Storehouse keeps H3's own rows (Lv 1-8, `STORE_HREQ`, `STORE_COST`); Lv 9-10 are added only if gear-2's
  HS19 check fails at grades 6-15. The Beacon has 5 levels (2.7). The Tents use 2.5.

### 2.4 The Hearth (kept)

Levels 1-10 and `CAMP_HZ` as built (zone 5 to 55). Effects as built (+3% away gains a level, a second
builder at 5, the Lantern Hall at 8, "Keeper of Hollow's Rest" at 10). What changes:

- The grade fix (2.2) for Hearth 6-8.
- **A tree** (2.8), 10 points at Hearth 10.
- **Gatherers' beds leave the Hearth:** N1's "+1 bed at Hearth 8" goes, because the cap is Tents (2.5).
- The **Lantern Hall** stages (N2, 4.3) change with each lifted shroud (the crown's colour), not with levels.

### 2.5 Tents (was the Bunkhouse)

Owner, 2026-09-28: the gatherer cap is the number of Tents in camp.

| Rule | Value |
|---|---|
| What a tent is | A home for **one gatherer who works** (the crew). Everyone else you have met lodges at the Tavern (gatherers-2 6's lodgers rule stays: nobody leaves for good). |
| Start | The Tents plot opens with Hands (Hearth 2 and the Tavern built). The first build pitches **2 tents** (3 minutes, wood and fibre of grade 1; no gold). |
| More | Each later build pitches **one more tent**, up to **10**. |
| The id | The code's Bunkhouse (`CAMP_B.bunk`, `S.camp.b.bunk`) **becomes the Tents**: same id, same plot rules, `n: 'Tents'`. The level is the build count; tents = level + 1 (Lv 1 = 2 tents, Lv 9 = 10 tents). `HANDS_TUNE.beds` becomes `[0, 2, 3, 4, 5, 6, 7, 8, 9, 10]`, `hallBeds` 0, `bedMax` 10. `handsBedsAt` keeps its shape. No migration: a live save's Bunkhouse level maps to one more tent than it had beds, never fewer. |
| Look | A tent's look follows the camp, not the rule: **canvas tents** (Hearth 1-4), **timber cabins** (Hearth 5-9), **stone cottages with a sill lamp** (Hearth 10, or the Emberwaste's shroud lifted). Every tent upgrades at once, free, when the camp does. |
| Tree | 9 points at 10 tents (2.8): Comfort, Training, Thrift. No node adds a tent: the cap is the Tents you build. |

The curve (starting values; BAL3 tunes it with N1c's fees). Gold is in the relative unit of rule 6 (2.9):

| Tents | Gate | Gold | Materials | Timer | When (normal play) |
|---|---|---|---|---|---|
| 2 | Hands open | none | Grade-1 wood 30, fibre 15 | 3 min | about hour 1 (zone 10) |
| 3 | Hearth 4 | R1 10 min | Grade-2 wood 80, fibre 40 | 1 h | day 1 |
| 4 | Hearth 6 | R1 30 min | Grade-3 wood 120, hide 40 | 6 h | day 2-4 |
| 5 | Hearth 8 (the Coast reached) | R2 45 min | Grade-4 Planks 80, Cloth 40 | 16 h | day 6-9 |
| 6 | Zone 55 | R2 60 min | Grade-5 Planks 120, Leather 50 | 24 h | day 14-20 |
| 7 | The Emberwaste reached | R3 60 min | Grade-7 Planks 150, Cloth 60 | 30 h | day 36-45 |
| 8 | Zone 88 | R3 75 min | Grade-8 Planks 180, Leather 70 | 36 h | day 45-52 |
| 9 | The Pale Reach reached | R4 75 min | Grade-10 Planks 220, Cloth 90 | 42 h | day 55-62 |
| 10 | The Gloamvale reached | R5 90 min | Grade-13 Planks 260, Leather 100 | 48 h | day 68-75 |

That is 4 tents at the Hollow's boss, 6 at the Coast's, 8 by the Emberwaste's and 10 in the Gloamvale, the
curve gatherers-2 6.1 wanted (crew about half of who you have met).

**Fees** (N1c and ECON1 own the numbers): a gatherer costs a one-off **hire fee** and a **shift fee** each
time you send them, by the grade of the resource; there is no daily wage. This spec only places the fees on
screen (6.3). The Tents' Thrift branch and the Kitchen's Shared Pot node are the camp's two fee cuts.

### 2.6 The Chapel (the Library and the Shrine, merged)

| Rule | Value |
|---|---|
| Id | Keeps `library` (its level and plot); `n: 'Chapel'`. The `shrine` row retires. `S.camp.bless` keeps its meaning. |
| Opens | Hearth 2 (the Library's gate). |
| Lv 1 | Opens the Codex from camp (as the Library did); gathering XP +5% (the Library's line). |
| Blessings | **1 slot at Lv 2, 2 slots at Lv 5** (the Shrine's Lv 1 and Lv 3), Blessings 25% stronger at Lv 4 (the Shrine's Lv 2). Unlocking stays with Codex pages (camp.md 2.5). |
| Hero XP | The Library's hero XP line stays here, because heroes need it from Region 1: +5% a level after Lv 1, to +20% at Lv 5 (as today), and +5% a level on to +45% at Lv 10. |
| No migration | A save with a Shrine gets `library = max(library, shrine + 1)` once, capped at its Hearth gate, so no Blessing slot is lost. Pre-1.0 the owner accepts a wipe anyway. |

Spots: Pip and Oriel (the roof at night), Elowen, Maren and Anselm (at the bell) (`CAMP_SPOTS`: `shrine`
and `library` both map to the Chapel).

### 2.7 The four milestone buildings

| Building | Lv 1 (the gift) | Lv 2-10 | Plot stake line (before the fall) |
|---|---|---|---|
| **Tannery** | The Tanning queue (gear-2 3.1-3.3: 2 Hide + 1 salt of the grade's region = 1 Leather, 3 orders). Gil's Hunter shifts count Hide straight into it when you pick "Send to the Tannery". | Queue speed +20% a level (gear-2 3.3's `perLv`), Tailoring XP (+10% a level to +50%), and its tree | "Leather needs a Tannery. Nothing grows in this fog." |
| **Infirmary** | Heroes at camp or on the bench refill **Rested** 50% faster (S7's meter). A hero back from 8 h+ at rest keeps the "rested" +25% XP for 90 minutes instead of 60. | Refill +10% a level; the tree | "Nobody on this road has been tended in ten years." |
| **Lamp House** | Awakening happens here: a hero whose quest is done steps in and comes out Awakened (HQ1's ceremony card). | Quest step timers -5% a level; the tree | "The Lea's lights are held. Nothing burns brighter while they are." |
| **Beacon** | **The call:** once a day, light it to bring the next event now (events otherwise roll 2-4 a day; plan-4 6.7). Secret hint marks you have heard of show on the map. | Gold per 2.9 (G10). Lv 2: secret hint marks you have *not* heard of show as faint "?" too. Lv 3: 2 calls a day. Lv 4: an event you call pays +25%. Lv 5: the call also rerolls which event comes, once. No tree (5 levels). | "Every fire up here dies by morning." |

The Beacon has no tree on purpose: five levels, five lines. It is a service, not a specialisation.

### 2.8 Every building: level lines and trees

Tree rules (BT1):

- **One point a level.** Points go into 3 branches of 4 nodes. Nodes in a branch are taken in order (1, 2,
  3, then 4, the capstone). A capstone needs the 3 before it.
- **Free respec while idle:** reset all points at no cost when the building has no build pending and, for a
  chain station, no order running. Otherwise the reset button says why ("Busy: Forge Lv 6 is building").
- **Caps:** at most one node per building touches damage; every camp damage source together stays at +15%
  (`CAMP_DMG_CAP`, K12). The away cap stays at 24 h. Build time cuts stop at -25% total.
- Node values are starting values. `v` is written per node; a node may read another system's modifier key.

| Building | Level line (Lv 1 / each level / capstone levels) | Branch A (nodes 1-4) | Branch B (nodes 1-4) | Branch C (nodes 1-4) |
|---|---|---|---|---|
| **Hearth** | +3% away gains a level; 2 builders at 5 | **Welcome:** away gains +4% · Rested fills 25% faster at the fire · away gains +4% · **Homecoming:** the first check-in each day gives 20 min of +25% gold and XP | **Builders:** build timers -5% · Cancel refunds 75% after start (was 50%) · build timers -5% · **A third builder** | **Lantern Hall:** hero XP +5% · Bond time at the fire +25% · hero XP +5% · **The Long Table:** heroes at camp count for Bonds with the fielded party (half rate) |
| **Workbench** | Woodcraft station; XP +10% a level (to +50%); "Make 5" at 3; Salvage +25% at 5 (today) | **Bowyer:** bow and staff rolls: Rare weight +3 · Epic +1 · Rare +3 · **True Grain:** a crafted weapon's main line +5% | **Carpenter:** building materials -5% (wood only) · build timers -3% · wood costs -5% · **Master Joiner:** one extra queued build per builder | **Sawmill** (from Region 2): Saw speed +20% · a 4th Saw order · Saw speed +20% · **Offcuts:** 1 Plank in 10 comes free |
| **Forge** | Smithing station; XP +10% a level; Rare odds +10% at 5 (today) | **Weaponsmith:** weapon rolls Rare +3 · Epic +1 · **+3% damage (the Forge's one damage node, counts to the camp cap)** · **Tempered Edge:** Temper (gear-2 6.5) costs 25% less | **Armourer:** armour rolls Rare +3 · Epic +1 · armour lines +3% · **Proof Plate:** upgrades +8 to +10 cost 20% less gold | **Smelter** (from Region 2): Smelter speed +20% · a 4th order · coal -10% an Ingot · **Bloomery:** a 5th order, and Smelter orders keep running 2 h past the away cap |
| **Storehouse** | Caps by level (H3's table) | **Deep Shelves:** caps +5% · +5% · +5% · **Overflow Shed:** a full cell stores 10% past its cap (flows only) | **Sorting:** Spillover picks the best next node (not the next tier) · the pouch groups by region (UX-F) · parcels wait 2 more days before a reminder · **Quartermaster:** refunds and gifts show what they filled | **Cold Room:** Fish from gatherers +10% · Sigils page shows find odds · herbs +5% from gatherers · **Salt Store:** secondary resources (coal, salt, dye) have double caps |
| **Loom** | Tailoring station; XP +10% a level; gathering 10% faster at 5 (today) | **Tailor:** cloth armour rolls Rare +3 · Epic +1 · Rare +3 · **Fine Stitch:** Masterwork lines +20% | **Dyer:** dye -10% a Cloth · weaving speed +20% · dye -10% · **Colourfast:** retool keeps a piece's Sigils at full strength | **Weaver** (from Region 2): weaving speed +20% · a 4th order · weaving speed +20% · **Bolt Room:** 1 Cloth in 10 comes free |
| **Tannery** | Tanning queue; speed +20% a level; Tailoring XP | **Tanner:** tanning speed +20% · a 4th order · speed +20% · **Pit Row:** a 5th order | **Salter:** salt -10% a Leather · Hunter shifts +10% Hide · salt -10% · **Brine Vat:** Hide from Hunters lands 15% as Leather | **Leatherworker:** leather armour rolls Rare +3 · Epic +1 · leather lines +3% · **Supple Hide:** medium pieces take one more Sigil strength step (+5%) |
| **Enchanter's Table** | Enchanting station; XP +10% a level; Reforge -20% at 5 (today) | **Setter:** setting costs -20% gold · Tune costs -20% · Sigil strength +2% · **Steady Hand:** setting at Enchanting below 80 counts as 5 levels higher | **Runes:** Salvage Runes cost 20% less · salvage keeps a Sigil 60% (was 50%; owner O4) · runes -20% · **Rune Pouch:** a region boss's first kill gives +2 runes | **Charms:** charm and trinket rolls Rare +3 · Epic +1 · Rare +3 · **Matched Glow:** the Matched set (gear-2 O5) needs 2 filled sockets, not 3. (Reserved 4th branch: the Still, after 1.0) |
| **Tavern** | The visitor; Rumours at 3; bounties +15% at 4; Renown at 5 (today). Hiring gatherers with gold (N1c) happens here | **Rumours:** one more rumour a day · secret hints come a day sooner · rumours name an event's reward · **Old Stories:** each heard secret hint also marks its region on the map | **Recruiting:** gatherer hire cost -10% · hero visitor stays 72 h · hire cost -10% · **Word Travels:** a gatherer's route (gatherers-2 5) needs half the rumour work | **Trade:** trade prices +5% · +5% · a town's wanted line shows next week's too · **Old Customers:** +5% more, and the first trip each week to a town pays 1 Common Sigil of its region |
| **Tents** | 2 to 10 tents (2.5) | **Comfort:** shifts +10% longer · Second Wind once more (gatherers-2 D4's max stays 2) · shifts +10% · **Home Cooking:** a gatherer back from a shift sets out again at once if you are away and the Kitchen has a meal on | **Training:** gatherer XP +10% · tree teaching costs -15% · XP +10% · **Old Hands:** Lv 20 gatherers share +2% | **Thrift:** shift fees -5% · -5% · hire fees -10% · **Shared Roof:** shift fees -10% more |
| **Watchtower** | Away limit +2 h a level to Lv 5 (the 24 h total cap); the hold hint at 2 (today); Lv 6-10 points only | **Long Watch:** away limit +1 h · +1 h · +1 h (all under 24 h) · **Night Watch:** away gains past 12 h are not reduced (Hearth Day stacks) | **Scouts:** expedition grade +1 step on Poor · the hold hint also names the best farm zone · band mastery stars show on the map · **Pathfinder:** expeditions 10% shorter | **Lookout:** an event pin also shows on the activity pill · events in a region you are not in show a dot on its chip · a secret spot glints when you are within one band · **Signal Fire:** the Beacon's call has 1 more use a week |
| **Map Room** | Expedition slots and lengths (today); trade routes from Lv 2 (gear-2 7) | **Routes:** a 12 h route at Lv 3 (was 5) · Repeat while away at Lv 4 · a 4th slot · **Long Road:** 16 h routes | **Cargo:** trade cargo +25% · +25% · caravans bring 1 Lore page on each town's 3rd trip · **Caravan Guard:** a trade trip never rolls Poor | **Surveyor:** expedition haul +5% · +5% · Sigil-focused routes +1 Sigil on Great · **Old Maps:** the first route to each band gives its mastery star |
| **Chapel** | Codex; gathering XP +5% a level; Blessings (2.6); hero XP +5% a level after 1 | **Blessings:** Blessings +10% stronger · swap a Blessing once a day during a boss fight (today: never) · +10% · **Two Candles:** a 3rd Blessing slot | **Study:** Codex hints show exact sources · Light +5% · Bestiary pages +10% faster · **Scriptorium:** each Codex seal's bonus +20% | **Bells:** Bond stories unlock at the fire 25% sooner · Anselm's bell wakes the camp: dawn comes an hour earlier in the scene (cosmetic) and Hands set out at dawn +5% · hero XP +5% · **Evensong:** heroes at camp at night fill Rested 25% faster |
| **Armoury** | Bag 50 + 25 a level (to 300 at Lv 10); gear sets: 1 per character at Lv 1, 2 at 3, 3 at 5 | **Racks:** bag +25 · +25 · +25 · **The Long Wall:** the camp's display rack shows 6 pieces (was 3) | **Sets:** a set for the Deepwell and one for bosses swap by themselves when you go · sets remember Sigils · +1 set per character · **Quick Change:** switching sets is free during a boss's first 5 s | **Care:** auto-salvage filters by Sigil and power · salvage returns +10% · locked items never show in salvage lists · **Keeper's Mark:** auto-salvage keeps one of each unique power's best |
| **Kitchen** | K12: meals (Lv 1 two recipes, Lv 2 four, Lv 3 6 h meals, Lv 4 cook 5, Lv 5 Leftovers 25%); fish meals from the Coast; Lv 6-10: meals +4% stronger a level | **Pantry:** pantry holds +50% · Leftovers +10% · cook 10 at once · **Larder:** a meal eaten while away lasts its full time from when you come back | **Hearty:** meal effects +10% · Broth's damage counts to the camp cap as before · +10% · **Feast:** one meal a day lasts 12 h | **Shared Pot:** shift fees -5% while a meal is on · Hand's Supper +25% · Forager's Pie +25% · **Mother Ashby's Table:** the Herbalist's Cook signature doubles |
| **Infirmary** | Rested refill +50% at Lv 1, +10% a level | **Rest:** refill +15% · the Rested bonus holds above 40% (was 50%) · refill +15% · **Deep Sleep:** a hero rested to full keeps it 2 h longer in the field | **Tending:** a hero knocked out stands 1 s sooner (field, not boss fights) · wipes retreat 1 zone less often (stall timer +10%) · stand 1 s sooner · **Field Kit:** once a boss fight, the first knocked-out hero stands at 30% HP | **Drill:** returning rested heroes' XP bonus +10% · +10% · lasts 30 min longer · **Sparring:** the bench's top 2 heroes by level gain Bond time with each other at camp |
| **Lamp House** | Awakening ceremony; quest step timers -5% a level | **Lampwright:** Awakening costs -10% · -10% · a second Awakening can be in progress · **Bright Wick:** Awakened heroes' signature +5% | **Kindling:** quest steps show their next need on Next Up · a quest step done while away completes on return, not at the next check-in · -10% step timers · **Hearthlight:** the Awakened hero's look gains the Lamp House's glow (cosmetic) and +5% Rested refill | **Glass:** hero lantern looks (achievements' lantern skins) glow at camp at night · a new lantern colour per Awakening (cosmetic) · the Lantern Book shows each hero's quest · **Given Light:** each Awakened hero raises the whole party's hero XP by 1% (to +10%) |

Notes on the table:

- **Damage.** Only the Forge's Weaponsmith node 3 and the Kitchen's Broth touch damage (plus the Chapel's
  Blade Blessing). All three count to `CAMP_DMG_CAP` 0.15.
- **The Smelter, Saw and Weaver branches are greyed until Region 2** ("Opens when the Great Lantern of the
  Hollow burns"). A Region 1 player spends points elsewhere, and a free respec later moves them.
- **The Beacon and the Trophy Wall have no tree.**

### 2.9 Every gold cost in this spec (for ECON1)

**R*r* N min** = N minutes of a normal player's fight gold in region *r* (`goldMin(r, N)`; ECON1 sets the
income per region). The region is the one the gate sits in. Starting values; ECON1 reprices them to its
scale and may round. Everything not in this table costs no gold.

| # | Cost | Gold (relative) | Today (for reference) |
|---|---|---|---|
| G1 | Hearth 2 / 3 / 4 / 5 | R1 5 / 15 / 30 / 45 min | `CAMP_HEARTH[k]` foes' worth at the gate zone |
| G2 | Hearth 6 / 7 | R1 60 / 75 min | as above |
| G3 | Hearth 8 / 9 / 10 | R2 90 / 120 / 150 min | as above |
| G4 | Any building Lv 1 (cold start stations, `hearthFirst`) | none | none |
| G5 | Building row 2 / 3 / 4 / 5 | R1 10 / 30 / 60 min; row 5 R2 90 min | `campGold(zRef, 60 x L)` |
| G6 | Building row 6 / 7 / 8 / 9 / 10 | R2 120 · R3 120 · R3 150 · R4 150 · R5 180 min | new |
| G7 | The Storehouse's rows (H3, `STORE_COST`) | the same rows as G5-G6 by level; ECON1 checks H3's own table | H3's own formula |
| G8 | Tents 3-10 | 2.5's column: R1 10, R1 30, R2 45, R2 60, R3 60, R3 75, R4 75, R5 90 min | new |
| G9 | A milestone building's Lv 1 (the gift) | none | new |
| G10 | The Beacon Lv 2-5 | R4 60 / 90 / 120 / 150 min | new |
| G11 | Tree nodes and resets | none (points only; resets are free) | new |
| G12 | Gatherer hire fee | N1c / ECON1 (shown on the hire card) | N1's hire price |
| G13 | Gatherer shift fee, by resource grade | N1c / ECON1 (shown on the send sheet) | new |
| G14 | Beacon call, dungeon entry, outpost sheet, map travel | none | - |
| G15 | Trade routes, setting and tuning Sigils, Temper, Salvage Runes | gear-2 owns them; ECON1 reprices there | gear-2 |

A building's row gold is the same for every building (only its materials differ), so ECON1 prices 10 rows,
not 17 x 10.

---

## 3. The World map across five regions

The map is Hybrid H (map-study.md): A's night overworld, C's landmarks, lamp pools that fall off fast,
fireflies in the shadow. One vertical scroll of region plates (ux-overhaul 7). This section adds what each
region holds and how the Shrouds, milestones, events and secrets show.

### 3.1 Outposts: one light forward camp per region (decision O2)

**Recommendation: yes, but an outpost is a place, not a second camp.** Each region from the Coast on has
one **outpost**: a pin cluster on its plate with a small fire (a lamp pool), the region's **town** (trade
routes, gear-2 7) and its **dungeon** entrance where it has one. It has no buildings and no build queue.

What an outpost does:

- **Its sheet** (a place sheet, ux-overhaul 7.9's shape): the town's weekly demand ("Wanted: grade-5 wood,
  grade-4 Leather · Glut: grade-4 fibre"), **Send a caravan ›** (the trade send sheet), the dungeon's row
  (**Enter ›**, best floor, this week's line), the region's **noticeboard** (the event waiting in this
  region, if any; the region's gatherers on the way, gatherers-2 5.3), and one line of news in the house
  voice ("Hallam says the tide's early today.").
- **Rest.** Heroes on the bench count as "at camp" for Rested wherever you fight (plan-4 2.8 lets away time
  count); the outpost fire is where the art shows them. No rule change.
- **It grows with the milestone.** While the region is shrouded the outpost fire is small (radius x0.7) and
  its news lines are about the Shroud. When the shroud lifts, the fire grows to full size and the town
  gains its last sell line (the town's Uncommon Sigils, gear-2 7.1).

Why not everything at Hollow's Rest: the owner wants the map to hold real places (plan-4 6.4, 6.6), and
trade needs somewhere to go. Why not full forward camps: two build queues would double the camp's check-in
work and split the story's home.

### 3.2 Per region

| | The Hollow | The Sunken Coast | The Emberwaste | The Pale Reach | The Gloamvale |
|---|---|---|---|---|---|
| Zones | 1-35 | 36-70 | 71-105 | 106-140 | 141-175 |
| Home or outpost | **Hollow's Rest** (home; the only build queue) | **Hallam's Landing**, the ferryman's shingle, on the Grey Shingle band | **New Emberlea**, on the Lea's western hills where Emberlea's people rebuilt | **Frostgate Cairn** (a camp at the pass on arrival); **the Silent Village** joins it when the Whitehush falls | **The Last Fire**, kept by Haldor and Nessa at the top of the Last Descent |
| Trade town (gear-2 7.1) | **Mossy Hollow** market: opens when the Drowning Dark falls (your home village, back in business once the fog is gone) and the Map Room is Lv 2 | Hallam's Landing: the Coast reached | New Emberlea: the Emberwaste reached | **The Silent Village**: the Whitehush beaten (gear-2's "Star-Fallen" row, renamed) | **Hollow's Rest** itself ("the road comes home"): the Gloamvale reached (gear-2's "Long Stair" row, renamed) |
| Dungeon (decision O5) | **The Deepwell**, under the cliff beside camp (exists) | **The Drowned Nave**, under the Coral Nave band (zone 49) | **The Deep Kilns**, under the Kilns band (zone 84) | **The Starfall Crater** (regions-4-5.md 1.8), in the Starfall Fields band (zone 119) | None. After the ending the Deepwell grows its new stretch (regions-4-5.md 2.8) |
| Raid homes (ux-overhaul 7.5; client table only) | **The Barrow Gate** (the Hollow King), **Wraithmarsh** (the Mire Colossus) | **The Glass Deep**, off Glimmer Lagoon (the Glass Hydra) | **Wyrmscale Ridge** (the Ashen Wyrm), **the Pyre's Mouth** (the Lantern Eater) | **The Frostgate pass** (the Pale Tyrant; before the plate exists it stays on Beyond) | None (the Voice is never in the raid) |
| Great Lantern | Lantern Hill, above Hollow's Rest | **Saltreach Light**, on its rock under row X | **The Emberlea lamp tower**, in the middle of the Pyre band | **The Frostgate lantern**: new construction, drawn as scaffold until the fall | None: **the Seam**, a crack of grey sky over the Closed Orchard band (regions-4-5.md 2.7) |
| Shroud hole | Wraithmarsh V (zone 35) | Zone 70, over Saltreach's reef | The Pyre (zone 105) | Frostgate Bastion (zone 140) | **The Heart** (zone 175): a hole twice a Shroud's size, the Voice |
| Weather while shrouded | Marsh fog wisps (grey motes, low, slow) replace fireflies in bands IV-V | A sea-fog band over the sea; motes are fog, not sea sparks | Ash fall; every unlit lamp glows held red, not dark grey | Whiteout snow (dense motes) | Nothing moves at all: no motes |
| Motes once lifted | Fireflies | Sea motes | Embers (few, warm) | Snow (light) and fixed star pixels | Ash-grey motes that drift up (after the finale only) |
| Lamp tint (map-study) | `#FFBA60` | `#FFC890` | `#FF8A50` | `#FFE0B0` (sill candles in cairns, not Order lamps) | none: the only warm pools are the Last Fire and the party (see below) |

Region notes:

- **The Pale Reach has no Order lamps** (regions-4-5.md 1.1). Its road "lamps" are hand-lit sill candles in
  cairns: the same sprite at 8 x 10 with a stone base, smaller pools (x0.8).
- **The Gloamvale has no lamps at all.** Each band you clear gets a candle that Haldor and Nessa carry down
  and set on a cairn (the same cairn sprite, pools x0.6), so the road still lights up behind you, a little.
  The whole plate is shadow except those, the Last Fire and the frontier glow.
- **Dungeons use one engine** (decision O5): the Deepwell's floors, Oil and boon draft with the region's
  foes, its hazard (the tide floods the Nave's odd floors; heat drains Oil faster in the Kilns; the
  Whiteout halves warning time in the Crater), 20 floors, Deep Elders at 5, 10, 15 and 20 dropping the
  region's Sigil (at most one a run, CB2 owner D3). Depth Marks are shared. Each dungeon opens when its band's
  second elder falls. The Deepwell stays what it is.

### 3.3 How a Shroud looks, and how it lifts

**While a Shroud stands** (its region reached, its boss not beaten):

- **The hole.** In the light model a Shroud is one more entry in the plate's light list with `dark: 1`:
  an ellipse (34 x 24 art px; the Heart 68 x 48) centred on the boss zone's lamp. Inside it the level is
  forced to 0 (shadow) whatever lamp pools reach there; the edge is the usual 4 x 4 Bayer dither, but toward
  darker, with a 1-art-px rim of `#050816`. Lamp pools stop at its edge, so a lit road runs into black. The
  boss zone's lamp is not drawn inside the hole; its label chip says "The Drowning Dark" in a cold grey.
- **Only held light shows inside.** Saltreach Light's green glass and the Pyre's red lamps are fixed pixels
  that ignore the hole ("it lights nothing"). No other pin or event may sit inside a hole.
- **The region's Great Lantern pin** is drawn dark with the cold grey underline (map-study), as today.
- **The weather** row in 3.2 replaces the region's motes. Motes never enter the hole.
- **The region chip** in the head row shows the region's lantern dark with a small ring of dark around it.

**When it falls** (55-lantern's `greatLantern` for that region, first kill only):

1. If the World map is closed, nothing happens on it until it opens. The next time the World tab opens
   (or at once, if it is open), the plate scrolls to the hole.
2. **The lift** (1.2 s): a DOM overlay over the hole (a radial `mask-image` from the plate's own dark
   colour) shrinks to nothing on the compositor, and 10 motes of the region's lifted kind rise out of it.
   The Emberwaste's lift also sends every red lamp glow on the plate west as a mote (2 s, staggered).
   Reduced motion: no overlay and no motes; the new plate simply shows.
3. Behind the overlay the plate is re-baked in an `idleTask` with `lifted: 1` for that region: no hole, the
   Great Lantern lit (ambient 0.2 lifts the region to dusk), the lifted motes, the outpost fire full size,
   the town pin lit.
4. The lift plays **once per save** (`S.folk.lift[region]`). An old save past the boss sees the lifted
   plate with no animation.
5. After the lift, the **person** walks: a small figure sprite goes from the Great Lantern pin along the
   road to Hollow's Rest (2 s, DOM, compositor only), and Hollow's Rest gets the ember dot until you see the
   arrival card there (section 5). Reduced motion: no walk, the dot only.

### 3.4 What locked regions look like

As ux-overhaul 7.1 and map-study, plus the Shroud rule:

| State | What is drawn |
|---|---|
| **Reached, shrouded** | Full plate; lamps lit to your max zone; the hole at the boss zone; the region's weather; the Great Lantern dark; the outpost fire small |
| **Reached, lifted** | As above without the hole; the Great Lantern lit (ambient dusk over the plate); lifted motes |
| **Next** (the first region not reached) | The plate in the grey palette, all shadow except the frontier's dusk glow at the chained gate. No hole is drawn: the player has not met the Shroud yet. Pins dim; a tap says "Opens at zone 71." |
| **Beyond** | The short dim plate: the road running out, a dark lantern, the raid pin if its foe lives there. Named for the next road name only |

### 3.5 Travel

- **There is no travel time.** Tap a road row: the band sheet (ux-overhaul 7.6), tap a lit zone tile: you
  fight there and the menu closes. Tap an outpost: its sheet. Tap a dungeon: its entrance view.
- **The You marker** stands on your zone's lamp while fighting, at Hollow's Rest while gathering, at a
  dungeon's pin during a run, at the raid pin while raiding (ux-overhaul 7.3).
- **Gathering stays at camp.** Nodes are near Hollow's Rest (and the region nodes, Tide Pools, Glass seams,
  Starfall fields, are worked "from camp" as today); the map never asks you to walk to a node.

### 3.6 Events on the map (for EV1)

Plan-4 6.7: 12 events at launch, at most 1 active, 2-4 a day, **they wait for you**. EV1 owns the event
list, odds and rewards; this is how they sit on the map.

| Rule | Value |
|---|---|
| Pin | A 24 px icon pin with a 2-step glow ring (`steps(2)`, off under reduced motion) and the ember dot. It stands on a spot of its kind (below) in a region you have reached. Toasted once when it appears; the activity pill's dot shows while it waits (Watchtower's Lookout adds more). |
| Never | inside a Shroud's hole, on top of another pin (48 px apart), or in a region not reached. |
| Where | **Road events** on a lit road row of the region you are fighting in, at the lamp nearest You. **Camp events** at Hollow's Rest's gate. **Town events** at an outpost. **Wild events** off the road in the shadow (they carry their own small light). |
| The Beacon | Its call (2.7) brings the next event now, placed by the same rules. |

The Shroud decides which events a region can roll:

| Event (EV1 names and tunes) | Kind | Rolls in | What it is |
|---|---|---|---|
| **A Lamp Gone Out** | road | **shrouded regions only** | A lit lamp on your road has gone dark overnight ("No fire here outlasts the morning."). Fight one pack there to relight it; it pays the zone's gold x3 and a chance of a Trophy. Never again in that region once its shroud lifts. |
| **Lost in the Fog** (the lost pilgrim) | wild | shrouded regions only | A figure at the edge of the hole. Escort: fight 3 packs at the nearest zone; lore and a title the first time |
| **Market Day** | town | lifted regions only | The town wants one line at 180% for the next caravan |
| **A Fallen Star** | wild | the Pale Reach, lifted | A shard in the snow: a Frost Sigil find roll (Uncommon or better) |
| **The Wandering Merchant** | camp | any | Rare materials for gold |
| **A Golden Beetle** | road | any lifted region, and the Hollow always | Tap it three times as it hops lamp to lamp: Gems |
| **A Strange Light** | wild | any | A steady light in the shadow. Follow it: a hidden mini-zone (3 packs and an elder) |
| **A Storm** | region | any | A band of weather over one region for 2 h once accepted: gathering +25%, foes +25% HP |
| **A Letter** | camp (the Almanac post) | any | A story beat (Hallam's letters and the like) |
| **A Pedlar at the Gate** | camp | the Hollow (Dorrie Fitch's route, gatherers-2 5.2) | as gatherers-2 |
| **A Hare on the Door** | camp | after Gil's 3rd shift (Jory's route) | as gatherers-2 |
| **A Caravan in Trouble** | road | while a trade caravan is out | Fight 2 packs at the band it is crossing: the trip pays +20% |

### 3.7 Secrets on the map

- **Before a hint:** nothing is drawn. Secrets are hidden zones, bosses and lore behind odd actions
  (roadmap-review 2.9).
- **After a Tavern rumour:** a faint "?" hint mark (12 x 12, dusk palette, no glow) at the secret's spot.
  Tapping it shows the rumour again. The Beacon Lv 2 shows unheard hint marks too, fainter.
- **Found:** the mark becomes a small permanent landmark pin with its name ("The Hermit's Pool"), lit with
  its own small pool (radius 12 x 9). It ties to its secret achievement (58-deeds).
- Secrets never sit inside a Shroud's hole; a secret *in* a shrouded place (the marsh's heart) appears only
  after the lift.

---

## 4. The camp scene (N2)

### 4.1 Scale, size and zoom (owner: pan, do not shrink)

The camp grows **sideways** into a wider scene you pan, never smaller art. It has **two zoom levels, both
whole-number pixel scales**, so B1's rule (no fractional scales) holds.

| Rule | Value |
|---|---|
| Art | Drawn at the **stage's art scale**: heroes and gatherers are their normal B1 sprites (about 12-16 x 24-30 art px), buildings 24-60 art px tall, the Trophy Wall its AC5 size (62 x 48). The scene is **96 art px tall**, ground line at y 82 |
| **Normal: 2x** | 1 art px = 2 CSS px. The window is 328 x 192 CSS at 360 px wide and shows 164 art px of camp (about four buildings). All taps happen here |
| **Overview: 1x** | 1 art px = 1 CSS px. The window is 328 x 96 CSS (the scene shrinks in height, the list below moves up) and shows 328 art px, a third to a half of the camp. It is for seeing the camp, not for tapping people: a tap on a building or a gatherer in overview **zooms back to 2x centred on it** (a second tap then acts) |
| Switch | A 44 x 44 button at the scene's top right (a magnifier: "Overview" / "Zoom in"), or a pinch (in to 2x, out to 1x; one step per pinch, never an in-between scale) |
| Pan | Drag or swipe (the scene is `data-noswipe` for the view swipe). **Edge arrows:** a 32 x 44 chevron at each side jumps one window width. Normal motion: a 200 ms ease; reduced motion: an instant jump, no inertia |
| **Where you are** | A **mini strip** under the scene, 328 x 24 CSS: the whole camp squeezed to 328 px as simple marks (a 4 x 8 block per building in its roof colour, a dot per gatherer at camp, the fire as a gold dot), with a bright frame for the window. Drag or tap it to jump. It is UI, not pixel art, so its squeeze is allowed |
| Opens | At 2x, centred on the Hearth (or on what a deep link names). The last position and zoom are kept in `lanternfall.ui.v1` (`panoX`, `panoZ`) |
| Wide screens | The 531 px menu column shows 265 art px at 2x or 531 at 1x |

Width by region (art px; the town grows east along the road, 4.2):

| Region reached | Width | At 2x (CSS) | At 1x (CSS) | Screens to pan at 2x / 1x (328 px) |
|---|---|---|---|---|
| The Hollow | 720 | 1,440 | 720 | 4.4 / 2.2 |
| The Coast | 832 | 1,664 | 832 | 5.1 / 2.5 |
| The Emberwaste | 896 | 1,792 | 896 | 5.5 / 2.7 |
| The Pale Reach | 960 | 1,920 | 960 | 5.9 / 2.9 |
| The Gloamvale | 992 | 1,984 | 992 | 6.0 / 3.0 |

The new strip at each region's end shows open road and a stake before its building stands, so the width
never jumps under the player. 55-hearth's `HEARTH_PANO_W` (1,024 today, a placeholder) becomes this table
(`CAMP_PANO.w`), and the Trophy Wall's x moves to p13 below; 63e paints at any `(cx, gy, k)`, so nothing
else changes there.

### 4.2 Plots

| Plot | x (art px) | Building | Plot opens |
|---|---|---|---|
| p0 | 18 | The Deepwell (landmark: the well mouth under the cliff) | Hearth 3 and zone 20 |
| p1 | 70 | **Tents**: a field of 2-10 homes in two staggered rows of 5 (x 30-110) | Hands open |
| p2 | 138 | Tavern (lodgers on its bench) | zone 8 (cold) / built (warm) |
| p3 | 180 | Watchtower | Hearth 1 |
| p4 | 230 | **Hearth** (the fire; Lantern Hill with the Great Lantern behind, x 190-270) | always |
| p5 | 280 | Workbench (the woodpile) | the fire lit |
| p6 | 322 | Forge (the Smelter's furnace beside it from Region 2) | Workbench built |
| p7 | 364 | Storehouse (packs unload at its door) | Forge built, or a pile near full |
| p8 | 406 | Loom (the dye vat from Region 2) | zone 5 |
| p9 | 448 | Enchanter's Table | zone 6 |
| p10 | 492 | Chapel | Hearth 2 |
| p11 | 536 | Kitchen (its table) | Hearth 3 |
| p12 | 578 | Map Room | Hearth 2 (with Expeditions) |
| p12b | 620 | Armoury (the display rack out front) | Hearth 2 |
| p13 | 668 | Trophy Wall (AC5) | 250 achievement points |
| gate | 704 | The Almanac post and the road gate (the Hollow) | as today |
| p14 | 750 | Tannery | stake from zone 30; built at the Hollow's fall |
| p15 | 794 | Infirmary | stake from zone 57; built at the Coast's fall |
| gate | 820 | the gate (the Coast) | |
| p16 | 858 | Lamp House | stake from zone 92; built at the Emberwaste's fall |
| gate | 884 | the gate (the Emberwaste) | |
| p17 | 918 | Beacon (on a rise; tall and thin, 14 x 60) | stake from zone 127; built at the Pale Reach's fall |
| gate | 944-992 | the gate, then the road home (the Pale Reach on) | |

- An unopened plot is plain ground. An open plot is a stake with a tag (63d's `paintPlot`). A milestone
  plot shows a **dark stake** (the tag in cold grey) with its Shroud line (2.7) until the fall.
- **Work spots** (4.5) sit in front of their building, so people spread along the whole camp by profession.

### 4.3 How buildings look by level

Four stages per building plus scaffold (camp.md 4.2, extended for levels 6-10):

| Stage | Levels | Look |
|---|---|---|
| 1 | 1-2 | Canvas, a lean-to, rough posts; a tool on a stump |
| 2 | 3-4 | Timber, a shingle roof, one window |
| 3 | 5-7 | Stone footing, a hanging lantern, a sign |
| 4 | 8-10 | Stone and timber, two lanterns, the building's banner in the colour of the last lifted shroud |

- **The Hearth:** a ring of stones (1-2), a covered hearth with benches (3-5), a timber hall (6-7), the
  Lantern Hall (8-10). The Lantern Hall's crown changes colour with each lifted shroud: gold (the Hollow),
  sea-gold (the Coast), warm white (the Emberwaste), silver (the Pale Reach), white-gold (the finale).
- **Tents:** canvas (Hearth 1-4), timber cabins (Hearth 5-9), stone cottages with a sill lamp (Hearth 10 or
  the Emberwaste lifted), 2.5. Each home belongs to one crew member; its window lights at dusk while its
  gatherer is at camp.
- **Chain fixtures** show from Region 2: a smelting furnace with a chimney beside the Forge, a saw pit by
  the Workbench, a dye vat by the Loom. Smoke rises while an order runs.
- **The Armoury's rack** shows your 3 best worn pieces as item icons (6 with the Racks capstone), baked when
  gear changes.
- **Scaffold** while building: poles, a ladder and one builder figure per busy builder.
- B1 rules (3 tones lit from the top left, a 1 art px ink outline `#120B18`). About 75 pixel maps: 17
  buildings x 4 stages, 3 home styles, fixtures, the rack, the skyline pieces.

### 4.4 The skyline: each shroud's sight at camp

| Shroud lifted | Skyline change |
|---|---|
| None | A low grey mist band behind the far hills in the morning; the Great Lantern on Lantern Hill dark |
| The Hollow | The mist goes; the Great Lantern lit on the hill (its glow ignores day and night) |
| The Coast | A thin strip of sea glints on the far west edge; at dawn two gulls cross (reduced motion: none) |
| The Emberwaste | The eastern hills, which glowed faintly red at night, show green at dawn |
| The Pale Reach | Stars at night (fixed pixels); the peaks on the north edge get snow caps |
| The finale | Every lantern in camp brightens (tint +15% toward white); the Lantern Hall's crown turns white-gold |

### 4.5 Gatherers in the scene (owner)

Hired gatherers **live in the camp scene**: you see them around their home and their work spot, watch them
walk out on a shift, and see them come back with their haul.

| State (`handsStatus`) | Where and how |
|---|---|
| **At camp, day** | At their **work spot** in front of their profession's building: Woodcutters at the woodpile (Workbench), Miners at the Storehouse door, Hunters by the Tannery (before it stands, by their home), Herbalists, Salters and Fishers by the Kitchen, Weavers by the Loom, Coal-diggers by the Forge, Sigil-seekers by the Enchanter's Table. Two of one profession stand 24 art px apart. Idle poses, changing every 6-12 s: stand, lean on the tool, sit on a crate, turn to talk to a neighbour (2 frames each) |
| **At camp, dusk and night** | At the fire (6 places, 3 more on the bench behind) or at their own home's door with its window lit. Pose: sit, warm hands (2 frames) |
| **Sent on a shift** | Walks from their spot to the east gate (about 30 art px a second), tool on shoulder, and leaves the scene. Their home's window goes dark |
| **Out** | Not drawn. The mini strip shows no dot for them |
| **Back with a pack** | Walks in at the gate with a pack (2-frame carry), goes to the Storehouse door and sets the pack down (it stays there until it unloads), then walks to their spot |
| **Refining** | Stands at their station with a tool, working (2 frames), until the shift ends |
| **Lodgers** | On the Tavern's bench by day, at the fire at night if a place is free |

Reduced motion: no walking. A sent gatherer vanishes from the spot; one coming back appears at the
Storehouse door with the pack; idle poses do not change. Heroes resting at camp keep camp.md 3.2's spots
(`CAMP_SPOTS`, with `library` and `shrine` now the Chapel; tired heroes at the Infirmary once it stands)
under the same rules. The critter you wear sleeps by the fire at night (64-looks `lookCritterDraw`).

**Tapping a gatherer** (at 2x) opens the **talk panel** (6.4).

**Tap targets with about 10 gatherers in camp:**

- Each figure has a **44 x 56 CSS hit box** centred on its feet (the sprite itself is about 28 x 56 at 2x).
  Work spots spread people along the whole camp, so a 2x window (164 art px) rarely holds more than 3-4.
- Two figures closer than 22 art px (44 CSS) never share a spot: the second takes the next free place at its
  building, and past two a spot's extra people stand at the fire or at their home.
- If hit boxes still overlap, the **front-most** (lowest on screen, then nearest the centre) wins, and a
  long press shows a small chooser of the 2-3 names under the finger.
- In overview (1x) a tap never opens a panel; it zooms to 2x centred on the tap.
- **List fallback:** the Work view (6.2) lists every gatherer with the same actions, and a **People** chip
  at the scene's top left opens a sheet of everyone at camp (gatherers and heroes), each row with Talk and
  Show (Show pans the scene to them). Screen readers use the list; the canvas is `aria-hidden`.

### 4.6 Day and night

`campClock()` (57f): dawn 06-08, day 08-18, dusk 18-21, night 21-06. Lanterns come on one by one at dusk
(reduced motion: at once). The Lantern Hall glows at every hour. A tap on a resting hero gives a bubble line
and a Sheet button; an unread fire story shows a small lantern "!" over the person.

### 4.7 Performance

- **Only the visible slice is drawn.** The static layers (sky, skyline, hills, ground, buildings, homes, the
  rack, sitting figures) bake into one canvas **at art size** (992 x 96 x 4 B = 0.38 MB at the widest). Each
  frame draws only the window's slice with one `drawImage`, `imageSmoothingEnabled = false`, at 2 or 1 times
  the device scale.
- **Re-bake** only when a level, a stage, the phase of day, a home's owner or the rack changes, in
  `idleTask` chunks of 128 art px (at most 4 ms desktop / 16 ms phone each), the visible chunk first.
- **Sprites:** gatherer and hero frames come from the B1 baker (`charFrames`), baked once per person (about
  14 frames: 4 idle poses x 2, walk 4, carry 2) and cached; 10 gatherers and 8 heroes are about 250 small
  frames, under 1.5 MB at DPR 3. Only figures inside the slice plus a 16 art px margin are updated and
  drawn; the rest only advance their timers. At most **14 moving figures** at once (walkers and posers);
  the rest are drawn into the bake as sitting figures until they move.
- **Frame rate:** about 9 frames a second for idle animation (as 63e), 30 fps while panning or while someone
  walks in view, nothing while the Build view is hidden. Budget: at most **2 ms desktop / 6 ms phone** p95 a
  frame (perf.md), with 10 gatherers and 8 heroes at camp.
- **Taps** hit-test a list of the visible figures' boxes (about 8 at most), no pixel reads.
- **Reduced motion:** no pan easing, no walking, idle frames freeze, a steady fire, no smoke drift, no gulls.

---

## 5. How the camp and the map connect

| On the map | Comes from camp |
|---|---|
| **Hollow's Rest pin** | Its 24 x 24 sprite follows the Hearth's stage: tents (1-4), a hall (5-7), the Lantern Hall (8+). A thread of smoke (2-step CSS) while any build runs; the ember dot for a finished build, an arrival card waiting, or a pack to unload. |
| **A chip on Hollow's Rest** | "3 out · 1 back" for gatherers on shifts (tap: the Work view). |
| **Hunters** | A tiny figure (8 x 10) on the lamp of the zone a Hunter works, until the shift ends. |
| **Caravans** | A cart chip on the road row between Hollow's Rest and the town, with the time left (as teams out, ux-overhaul 7.3). |
| **Refining** | Nothing on the map (it happens at camp); the smoke above counts it. |
| **The Beacon** | A small steady pool (radius 20 x 14, silver) on Lantern Hill once it stands, beside the Great Lantern. Its call button is on the Beacon's row and on the World head as a chip when a call is ready. |
| **The person's walk** | After a lift (3.3). The arrival card opens at Hollow's Rest. |

| At camp | Comes from the map |
|---|---|
| **The skyline** (4.4) | Each lifted shroud |
| **The milestone plots** | A dark stake from the region's third band; the building at the fall |
| **Arrival cards** | A card at Hollow's Rest when the person comes (portrait, 2 short lines, what they built, the power): "The Rushbys came in from the marsh. Gil hunts. His family built you a Tannery. Your Proving is open." |
| **Caravans home** | A cart unloads at the Storehouse door (the parcel lands, 55-store) |

---

## 6. UI needs

### 6.1 Hollow's Rest (UX-W2, ux-overhaul 7.8, extended)

- **The panorama** (N2) mounts above the chips Build · Work · Blessing: the scene (328 x 192 at 2x, 328 x 96
  in overview), the zoom button and the People chip on it, the edge arrows, and the mini strip (328 x 24)
  under it (4.1). Without N2 the Trophy Wall card stays at the top of Build (as today).
- **A building's icon** on its Build row pans the scene to it (the old chip strip's job).
- **Build** groups (ux-overhaul 6.14): Ready to build · Waiting on materials · the rest folded, plus
  "Buildings with their own screen" (Storehouse, Armoury, Map Room, Chapel's Codex, Tavern).
- **A building sheet** (a tap on its row): the level card (now → next line, cost chips, the timer, Build or
  Queue), then a **Tree** tab.
- **The Tree tab** at 328 px: three columns (one per branch, 104 px each) of four nodes (104 x 56 buttons:
  the node name and one line). Taken nodes gold, next ones outlined, locked ones dim with the reason ("Opens
  when the Great Lantern of the Hollow burns"). Head line: "Points 3 of 5". **Reset** (free) under the
  columns, disabled with its reason while busy. Taking a node asks nothing (a reset is free).
- **Region-gated levels** show their gate on the row: "Lv 7 opens in the Emberwaste".
- **Milestone plots** show as a row in the folded group: "Tannery · The fog must lift first."
- **The arrival card** (a card in the Build view's top slot until seen, and a bell line).

### 6.2 Work (gatherers-2 10, N3b)

- Header line: **"Crew 4 of 5 tents · 3 out · Shift fees today 720"** with a Tents link.
- Crew rows as gatherers-2 10.1, each with **Send again · 240 gold** (the fee on the button).
- Station rows with their queue (the Smelter, the Saw, the Loom's weaving, the Tannery), refiner slots.

### 6.3 Fees on screen (N1c and ECON1 own the rule)

| Where | What |
|---|---|
| The talk panel and the send sheet (6.4) | The shift fee for the picked resource and grade, before Send ("Shift fee: 240 gold") |
| The Tavern's hire card | The hire fee, before you hire ("Hire Rook: 2K gold") |
| Send again, Send all | The fee on the button; Send all shows the total |
| The Work view header | Fees paid today |
| The away card | One line in the Hands group when Second Wind re-sent someone: "Paid 480 in shift fees" |
| Not enough gold | Send is disabled with the reason ("Needs 240 gold"); nothing is ever taken on credit |
| The Tents and Kitchen trees | Thrift and Shared Pot show the saving on the next fee |

### 6.4 The talk panel and "Send on a job" (owner; N3b builds it, N1c sets the fees)

A tap on a gatherer in the scene (or Talk in the list) opens a **bottom sheet** (at most 60% of the screen,
so the scene stays visible above it):

```
[portrait]  Nan Tarrow                  Lv 7 · Common
            Miner · Steady              At camp · by the Storehouse
 "Quarry dust never leaves your lungs. Good. Means it's still there."
 [ Send on a job ]            [ Card › ]            ✕
```

- **The line** is one talk line in their voice (LORE-G), rotating per tap. **Level, rarity and status**
  as `handsStatus` gives them ("At camp", "Out at the grade-3 vein · back in 1 h 12 m", "Back: pack
  waiting", "Refining at the Smelter", "Lodging at the Tavern").
- **Send on a job** is shown only while they are at camp with no pack waiting (otherwise: the reason, and
  "Unload" when a pack waits). It opens the **job picker, limited to their profession**:
  - **Resource:** only their job's families (a Woodcutter gets wood only; a Miner ore and Gems; a
    Weaver-gatherer fibre and, from the Coast, dye; a Hunter a cleared zone; a Sigil-seeker the region
    nodes; gatherers-2 1). From S4, a second row, **Refine at <their chain's station>**, where their job
    has one (gatherers-2 1.2).
  - **Grade:** chips for the open grades of that resource, highest first, each with its node name.
  - **Shows before Send:** shift length, expected haul ("about 1,900 grade-3 ore"), whether it fits the
    Storehouse (55-store `stashFits`), and the **shift fee in gold**.
  - **Send · 240 gold** (the fee on the button; disabled with the reason if gold is short). After Send the
    sheet closes and the gatherer walks out (4.5).
- **Card ›** opens the full gatherer card (gatherers-2 10.2: tree, signature, stories).
- Lodgers get **Swap in** instead of Send (gatherers-2 6), which needs a free home.
- 360 px: two rows of grade chips at most (44 px tall), the resource row as a segmented control, Send full
  width at the bottom (48 px).

### 6.5 The World map (UX-W1, UX-W3 and the new tasks)

- The Shroud hole, the lift overlay and the person's walk (3.3).
- **Outpost pins** and their sheets (3.1). **Town sheet** = the outpost sheet's trade part.
- **Dungeon entrance views** in the Deepwell's shape (ux-overhaul 7.7) under their own view ids
  (`dn-nave`, `dn-kilns`, `dn-crater`).
- **Event pins** (3.6), **hint marks** and **secret pins** (3.7).
- The Beacon's **call** chip in the World head when a call is ready.
- Checks (`tools/check.mjs` section `world`, extended): every region's hole spot is its boss zone; no pin
  or event spot inside a hole; pins 48 px apart with outposts, dungeons and hint marks included.

---

## 7. Data shapes and save keys

### 7.1 Data (`src/js/21u-data-camp2.js`, data only)

```js
// Rows merged into 57-camp's CAMP_B (new ids) and read by the trees core.
CAMP2_B = {
  armoury:   { n: 'Armoury', max: 10, opens: 2, fam: { ore: 20, wood: 20 }, tro: 5, fx: 'armouryFx' },
  kitchen:   { n: 'Kitchen', max: 10, opens: 3, fam: { wood: 20, herb: 25 }, tro: 4 },   // K12 owns its effects
  tannery:   { n: 'Tannery', max: 10, fam: { hide: 25, wood: 15 }, tro: 3, skill: 'loom', folk: 'rushby', stake: 30 },
  infirmary: { n: 'Infirmary', max: 10, fam: { fibre: 25, herb: 20 }, tro: 6, folk: 'penrow', stake: 57 },
  lamphouse: { n: 'Lamp House', max: 10, fam: { crystal: 25, ore: 15 }, tro: 6, folk: 'emberlea', stake: 92 },   // crystal = Gems
  beacon:    { n: 'Beacon', max: 5, fam: { wood: 20, crystal: 20 }, tro: 1, folk: 'wick', stake: 127, noTree: 1 }
};
CAMP2_RENAME = { bunk: { n: 'Tents', max: 9 }, library: { n: 'Chapel', max: 10 } };   // shrine retires
CAMP_GRADE = [1, 1, 2, 3, 4, 5, 7, 8, 10, 13];              // material grade by row (2.2, 2.3)
CAMP_LV_GATE = [null, null, null, null, null,                // rows 1-5: CAMP_HREQ as today
  { hearth: 10 }, { region: 2 }, { zone: 88 }, { region: 3 }, { region: 4 }];
CAMP_ROW6 = { mult: [5, 6, 8, 10, 12], troph: [3, 3, 4, 4, 5], secs: [36, 40, 44, 48, 48] };   // h
CAMP_GOLD = { hearth: [0, 0, [1, 5], [1, 15], [1, 30], [1, 45], [1, 60], [1, 75], [2, 90], [2, 120], [2, 150]],
  row: [0, 0, [1, 10], [1, 30], [1, 60], [2, 90], [2, 120], [3, 120], [3, 150], [4, 150], [5, 180]],
  beacon: [0, 0, [4, 60], [4, 90], [4, 120], [4, 150]] };   // [region, minutes]: goldMin(r, m) (2.9; ECON1 prices)
TENTS = [ /* 2.5's rows: { gate, gold: [region, minutes], mats: [[fam, g, n]], secs } for tents 2..10 */ ];
CAMP_TREES = {
  forge: [ { id: 'weapon', n: 'Weaponsmith', nodes: [ { id: 'w1', n: 'Rare rolls', txt: 'Weapon rolls: Rare +3', key: 'bonus:rare:forgeW', v: 3 }, /* x4 */ ] },
           { id: 'armour', ... }, { id: 'smelt', n: 'Smelter', region: 2, nodes: [...] } ],
  /* every building in 2.8 */
};
CAMP_FOLK = {   // the milestone people (section 1)
  rushby:   { region: 'hollow', n: 'The Rushbys', b: 'tannery', hand: 'gil', power: 'proving' },
  penrow:   { region: 'coast', n: 'Mercy Penrow', b: 'infirmary', power: 'lanternlit' },
  emberlea: { region: 'ember', n: 'The Emberlea families', b: 'lamphouse', hand: 'brannoc', power: 'awaken' },
  wick:     { region: 'pale', n: 'Wick', b: 'beacon', power: 'keystone3' }
};
CAMP_PANO = { h: 96, ground: 82, w: [720, 832, 896, 960, 992], zoom: [2, 1], plots: { /* 4.2 */ }, spots: { /* 4.5: work spots by job */ } };
OUTPOSTS = { coast: { n: "Hallam's Landing", at: [x, y], town: 'landing', dungeon: 'nave' }, /* 3.2 */ };
SHROUD_MAP = { hollow: { zone: 35, rx: 34, ry: 24, weather: 'fog' }, /* 3.2, 3.3 */ };
```

Region data (the Emberwaste, the Pale Reach, the Gloamvale) extends `OUTPOSTS` and `SHROUD_MAP` from each
region task's own data file, the way `REGION_COAST` plugs into `REGIONS`.

### 7.2 Save

| Key | Shape | Owner | Notes |
|---|---|---|---|
| `S.camp.b` | adds `armoury`, `kitchen`, `tannery`, `infirmary`, `lamphouse`, `beacon` (0 = not built); `bunk` means tents - 1; `library` is the Chapel; `shrine` is read once (2.6) then ignored | BT1 (57-camp defaults, small edit) | Missing ids default to 0 through `registerState` |
| `S.ctree` | `{ v: 1, p: { [buildingId]: [a, b, c] } }`: points per branch (0-4 each; sum at most the level) | BT1 (`57i-camp-trees.js`) | Nodes are taken in order, so counts are enough. A load clamps any sum above the level (it can never happen by play) |
| `S.folk` | `{ v: 1, at: { rushby: ms, penrow: ms, emberlea: ms, wick: ms }, seen: { id: 1 }, lift: { region: 1 }, beacon: { day, n } }` | WM1 (`55-shroud.js`) | `at`: the person arrived (the gift built); `seen`: the arrival card read; `lift`: the map's lift played; `beacon`: calls used today |
| `S.events` | EV1 owns it; this spec needs `{ cur: { id, region, spot } }` so the map can place the pin | EV1 | |
| `S.lantern.lit` | unchanged (55-lantern) | - | **A region's shroud is lifted exactly when `S.lantern.lit[region]` is set.** No separate shroud state |
| `S.stars` | unchanged; `STAR_TUNE.keyMax` reads `2 + bonus('keyMax')`, which WM1 sets to 1 once the Pale Reach's shroud lifts | 57e (small edit) | |
| `lanternfall.ui.v1` | adds `panoX` (the panorama's last scroll, art px) and `panoZ` (2 or 1) | N2 | Browser prefs, outside the save |

Nothing online changes. Pre-1.0, if BT1 lands after a save-key bump, the `shrine` read and the tents mapping
are not needed at all.

---

## 8. Sim targets (BAL3 after BT1; `tools/sim.mjs --days 90 --report camp`)

| Id | Target | Value |
|---|---|---|
| WC-T1 | Tents at each region's boss (normal play) | 4 · 6 · 8 · 9, and 10 in the Gloamvale (±1) |
| WC-T2 | Hire and shift fees as a share of gold income, per region, median player (N1c's and ECON1's curves) | at most 15%; a normal player can always afford to send the whole crew at a check-in |
| WC-T3 | Building gold share of all gold spent, per region | 15-30% (the rest goes to gear, heroes, trade) |
| WC-T4 | Builders idle at check-ins after day 3 | under 30% of check-ins with a free builder and nothing affordable |
| WC-T5 | Tree points by region end (average over buildings) | about 4 · 6 · 8 · 9 · 10 (2.3) |
| WC-T6 | Camp damage total (Blade Blessing + Broth + Weaponsmith) | at most +15% (`CAMP_DMG_CAP`), checked every hour of sim time |
| WC-T7 | Away cap | at most 24 h with every source |
| WC-T8 | A milestone building's Lv 1 | built within 15 minutes of its boss's first kill, every class |
| WC-T9 | The Tannery at the Coast | Leather on hand for the first grade-4 medium piece within one check-in of arriving (with gear-2's Coast arrival gift and Gil) |
| WC-T10 | Trees give identity, not power | the best and worst sensible tree layouts differ by at most 5% in `totalDps()` and 10% in gold an hour |
| WC-T11 | The Beacon | events a day with the call: 3-5 (2-4 without); never more than 1 waiting |
| WC-P1 | Panorama frame (perf.mjs `--camp`, 10 gatherers and 8 heroes at camp, both zoom levels) | p95 at most 2 ms desktop / 6 ms phone; a re-bake chunk at most 16 ms phone; sprite caches under 1.5 MB; a zoom switch under 16 ms to first paint |
| WC-P2 | Map plate with a Shroud | bake time +1 ms at most per plate; the lift runs on the compositor only |
| WC-P3 | DOM on the map | outposts, dungeons, events and hint marks keep each region at most 40 nodes (ux-overhaul 7.12) |

Sim hooks: `--camp2 0` (today's camp: no trees, no new buildings), `--trees <policy>` (`even`, `station`,
`economy`), `--tents <curve>`, the camp report (tents by day, points by region, gold shares, idle builders).

---

## 9. Build split

File numbers were checked against `src/js` and every file the design docs name: `21r`, `21s`, `57i`, `55-shroud`,
`63f`, `75-camp-trees-ui`, `75-shroud-ui`, `75-outposts-ui` are free. Nothing here uses 59e, 59g, 59h,
59i, 59j, 21p, 21q, 57h (reserved), or 57g (K12's kitchen and TR1's trade both name it; the coordinator
should give one of them another letter). `14-art-camp.js` was reserved by camp.md for exactly this art.

| Task | Work | Owns (new files) | Small edits in | Needs |
|---|---|---|---|---|
| **BT1** Building trees and the catalogue (Sonnet, M) | 21r data (2.1-2.8, 7.1 except the map parts); the new rows merged into `CAMP_B`; the Tents rule and curve; the Chapel merge; region-gated Lv 6-10 and the grade fix; the tree core (points, order, free respec while idle, caps, every node's modifier or bonus); Next Up "a point to spend"; check section `camptree`; sim `--camp2`, `--trees`, WC-T1 to T7, T10 | `src/js/21u-data-camp2.js`, `src/js/57i-camp-trees.js`, `src/js/75-camp-trees-ui.js`, `src/styles/60-camp-trees.css` | `57-camp.js` (merge rows, `CAMP_GRADE`, gates, `bunk`/`library` names, `shrine` read), `21f-data-hands.js` (beds to tents, `hallBeds` 0, `bedMax` 10), `55-hearth.js` (`HEARTH_PLOT` rows p0-p17, `HEARTH_PANO_W` by region), `57e-constellations.js` (`keyMax` reads a bonus), `tools/sim.mjs`, `tools/check.mjs` | WC1, S4 (the chain branches read its queues; before S4 they show locked) |
| **WM1** Milestones and the Shroud (Sonnet, M) | `CAMP_FOLK`; the person's arrival on `greatLantern` (quiet for old saves); the gift build (Lv 1 free, 10 min, no builder); the power flags (Proving via classes' gate, Lanternlit via rank 8's gate, Awakenings flag for HQ1, `keyMax` +1); arrival cards; the Shroud layer for the map (hole, weather, lift overlay, the walk); `S.folk`; check section `milestones` (each region's person, building and power exactly once; no pin inside a hole) | `src/js/55-shroud.js`, `src/js/75-shroud-ui.js` | `55-lantern.js` (push person and power lines onto `rewards`), `75-world-ui.js` (a `registerMapLight(fn)` hook and a `registerMapLayer(fn)` hook, if UX-W1 has not added them) | UX-W1, BT1 |
| **UX-W2** Hollow's Rest and the Tavern (as ux-overhaul 8) | Plus: the Build groups with the new rows, region-gate lines, milestone plot rows, the arrival card slot, the Tree tab mount (BT1's UI), Work's fee lines (6.2, 6.3) | as ux-overhaul 8 | `75-camp-ui.js` | UX-W1, BT1 (for the tree tab; ships without it) |
| **UX-W3** (as ux-overhaul 8) plus outposts | Plus: outpost pins and sheets (3.1), town sheets for TR1, the dungeon entrance view shape with a view id per dungeon | `src/js/75-outposts-ui.js` | - | UX-W1 |
| **N2** Camp panorama and camp life (Sonnet, M) | Section 4: the panorama painter, plots and stages, the skyline, scaffold, day and night, the two zoom levels, pan, edge arrows and the mini strip, gatherers (spots by job, idle poses, walking out and home with a pack, hit boxes, the long-press chooser) and heroes at their spots, lodgers, the critter, the People list, talk bubbles, the rack, the Trophy Wall through `trophyWall.paint`, the fire through `campPaintFire`, perf (WC-P1) | `src/js/14-art-camp.js` (data: building stages, tents, fixtures, skyline pieces), `src/js/63f-camp-pano.js` (painter, bake, frame), `src/styles/60-camp-pano.css` | `75-camp-ui.js` (mount above the chips), `12g-art-hands.js` (read only) | WC1, N3a (gatherer keys), BT1 (plot list) |
| **N3b** (gatherers-2 12) plus the talk panel | 6.4: the talk panel and the job picker limited to the profession, fees shown before Send (N1c's numbers), Swap in for lodgers; N2's scene and the People list open it through `campTalk(id)` | N3b's files (`75-hands-ui.js`, `60-hands.css`) | - | N3a, N1c |
| **EV1** Events and secrets | Its own spec work, using 3.6 and 3.7 for placement and the Shroud rules; the Beacon's call through `eventsCall()` | EV1's files (suggested `src/js/57j-events.js`, `src/js/75-events-ui.js`) | - | UX-W1, WM1 |
| **R2-R5** each region | Its `OUTPOSTS` and `SHROUD_MAP` rows, its dungeon (the Deepwell engine with the region's foes and hazard), its plate's weather and motes | the region's own files | - | WM1, UX-W3 |
| **LORE** | lore.md 4.4a updated to section 1.2; arrival lines for the four people; the Shroud lines on the stakes; outpost news lines (about 8 a region); event text with EV1 | `src/js/21v-camp-words.js` (new, data only: `CAMP_WORDS`; `21q-gatherers-talk.js` stays N1b's) | - | owner sign-off |

Merge order: BT1 first (data and trees; the camp works without N2), then WM1 and N2 in parallel (WM1's camp
side needs no art; N2 draws what BT1 lists), then UX-W2's extras. R2 adds the Coast's outpost and the
Drowned Nave. Every task runs `node tools/build.mjs`, `node tools/check.mjs` and `node tools/perf.mjs --quick`.

---

## 10. Player-facing copy (starting lines)

| Where | Line |
|---|---|
| A dark milestone stake | Leather needs a Tannery. Nothing grows in this fog. |
| Arrival, the Hollow | The Rushbys came in from the marsh. Gil hunts. His family built you a Tannery. Your Proving is open. |
| Arrival, the Coast | Mercy Penrow came ashore. She built an Infirmary for tired heroes. Your heroes can now reach Lanternlit. |
| Arrival, the Emberwaste | The Emberlea families came home. Their lampwrights built the Lamp House. Heroes can now Awaken. |
| Arrival, the Pale Reach | Wick carried her candle down the pass and lit the Beacon. The stars are back: you can light a third keystone. |
| Tents row | 4 tents · 4 gatherers at work |
| Send sheet | Send Nan to the grade-3 vein? Shift fee: 240 gold. Back in 2 h. |
| Talk panel status | Out at the grade-3 vein · back in 1 h 12 m |
| Overview hint (first time) | Tap anything to zoom back in. |
| Tree head | Points 3 of 5 |
| Tree reset, busy | Busy: the Forge is building. Reset when it is done. |
| Region-gated level | Lv 7 opens in the Emberwaste. |
| The Beacon | Light the Beacon: something on the road will come to you now. |
| A Lamp Gone Out | A lamp went out at zone 23 overnight. Fight there to light it again. |
| Outpost, shrouded | Hallam's Landing · the fog sits on the water again tonight. |

---

## 11. Decisions for the owner

- **O1. The milestone table (1.2).** The Hollow: the Rushbys raise the Tannery, the Proving opens. The
  Coast: Mercy Penrow (Silas's sister) raises the Infirmary, Lanternlit opens (and the Pinnacles, as they
  already do). The Emberwaste: the Emberlea families (led by Tamsin Wray) raise the Lamp House, Awakenings
  open. The Pale Reach: Wick raises the Beacon, a third keystone opens. Enchanting and trade routes stay
  where gear-2 put them (on reaching the Coast). New names: the Rushbys, Mercy Penrow, Tamsin Wray.
  Recommended: **yes**.
- **O2. Outposts: one light forward camp per region** (a fire, the town, the dungeon's entrance and a
  noticeboard; no buildings, no build queue). Hollow's Rest stays the only camp. Recommended: **yes**.
- **O3. Awakenings happen at the Lamp House, from the Emberwaste's fall** (about day 40-55). Quest steps 1-2
  can start whenever HQ1 says; the Awakening itself needs the Lamp House. If you want Awakenings earlier,
  the Emberwaste's power becomes Temper for uniques and HQ1 sets its own gate. Recommended: **yes, at the
  Lamp House**.
- **O4. The catalogue merges:** the Library and the Shrine become **the Chapel** (Codex, Blessings, study);
  the Bunkhouse becomes **the Tents** (your rule); the Smelter, the Saw and weaving are fixtures of the
  Forge, the Workbench and the Loom with a tree branch each; the Tannery is the only new chain building; the
  Still stays benched. Recommended: **yes**.
- **O5. Region dungeons:** the Drowned Nave (Coast), the Deep Kilns (Emberwaste) and the Starfall Crater
  (Pale Reach), each a 20-floor run on the Deepwell's engine with the region's foes, hazard and Sigils,
  built with each region. The cheaper option is the Starfall Crater only. Recommended: **all three**, as
  region content rather than new systems.
- **O6. Building levels 6-10 open by region** (Lv 6 mid Coast, 7 the Emberwaste, 8 mid Emberwaste, 9 the
  Pale Reach, 10 the Gloamvale), one tree point a level, so a building ends Season 1 with 10 of its 12
  nodes and never all of them. A third builder is the Hearth tree's capstone. Recommended: **yes**.
- **O7. The Tents curve and look:** 2 tents at the start, then 3 (day 1), 4 (the Hollow's boss), 6 (the
  Coast's boss), 8 (the Emberwaste's), 10 (the Gloamvale). Tents turn into cabins at Hearth 5 and stone
  cottages at Hearth 10, all at once, free. Hire and shift fees show before you pay: on the hire card,
  the talk panel, the send sheet and the Send buttons. Recommended: **yes**.
- **O8. The Beacon's call:** once a day (twice at Beacon Lv 3), bring the next event to you now. Events
  still wait and never expire. Recommended: **yes**; it gives an eager player more events without making
  anyone who plays less miss one.
