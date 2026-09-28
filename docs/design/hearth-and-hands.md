# Hearth and Hands: the cold start, tools, the Storehouse, Hands and the Kitchen

Status: design spec D7 for plan 3 ([plan-3.md](plan-3.md), wave 1), written 2026-09-28. It builds
on the Camp ([camp.md](camp.md), `57-camp.js`), gathering and crafting
([gathering-and-crafting.md](gathering-and-crafting.md), `55-gathering.js`, `55-crafting.js`,
`21-data-craft.js`, `41-items.js`), onboarding ([onboarding.md](onboarding.md), `55-onboard.js`),
expeditions ([expeditions.md](expeditions.md), `57b-expeditions.js`) and the pacing curve
([pacing.md](pacing.md)). Sister spec: formation.md (D6). Wave 1's G1 (the hero holds the tool;
the party walks home) and G2 (gathering scenes) land before this is built. All numbers are
starting values for `tools/sim.mjs` to tune. The ratios and rules are the design.

Owner asks this spec answers (2026-09-28):

1. "The game starting around the hearth makes sense and you have to build each forge station."
2. "Resource gathering should show the right tool used for the job." (tools as items)
3. "NPCs that do the resource gathering for you at relatively low returns. They can have rarity
   levels and you can hang out with them at camp when they're not busy. They can only idle gather
   for a set amount of time and return to camp when done."
4. "We'd need a storage room building." Owner decision: the Storehouse **limits what you can hold
   from every source**, including active gathering. Gathering skill levels never stop when full.

Coordinator decisions already made (plan-3.md 1): the gatherers are **Hands** (townsfolk, not
companions); tools have **mastery**; a **Kitchen** after Hands; **day and night** at camp on the
device clock; **fixed camp plots**; old saves never lose anything (stations pre-built; a save above
a cap keeps every item but cannot gain that material until it is below the cap; old saves get the
Storehouse level that holds what they have).

Design rules:

1. **Nothing is taken away.** Old saves keep every station, item, material and recipe. The cold
   start is for new games only. No stat on an existing item goes down.
2. **Fighting is never gated.** The fire is the first thing to do, not a wall. A player who taps
   Fight at second one can fight.
3. **Flows stop, parcels wait.** A full Storehouse stops continuous income (gathering, fight drops).
   Rewards that arrive in one lump (Hands' packs, expeditions, bounties) wait until there is room.
   Nothing the player earned in a lump is thrown away without the player saying so.
4. **Levels never stop.** Gathering skill XP, tool mastery and Hand levels keep counting when the
   Storehouse is full.
5. **Hands help, the hero leads.** One Hand earns 10-25% of the hero's rate. Hands give materials
   only: no skill XP, no fight drops, no damage.
6. **No pay-to-win, no FOMO.** Nothing is sold. Nothing expires in a way that costs power. Missing a
   day never loses an applicant you could have hired (they queue, like the away cap).
7. **Plain words.** "Storehouse full", "Hands", "Stone Pick". Short sentences, active voice.

---

## 0. Why (what the code does today)

- `57-camp.js` pre-builds the Forge, Workbench, Loom, Enchanter's Table and Tavern at Lv 1 for every
  save (`pre: 1`), and the camp opens at zone 5 (`CAMP_TUNE.openZone`). A new game starts on the
  Fight tab with no camp.
- Tools are already items: kinds `pick`, `axe`, `sickle` in `CRAFT_KINDS`, hero positions `pick`,
  `axe`, `sickle` in `S.equip`. The Pickaxe and Sickle are made at the Forge, the Axe at the
  Workbench. An empty slot gathers at the base rate. Tools have 2 base lines (speed, double yield)
  and roll no affixes.
- Materials have no cap. Every credit is a raw `S.mats[f][t - 1] += n`, in 12 places (list in 4.6).
  A late save gathers Emberite at about 60 a minute against an 18-unit recipe (region-2.md 0).
- Bench gathering jobs (`CRAFT_JOBS`, owner approved 2026-09-27, task K10) were never built.
  Hands replace them (9, decision 9).
- `75-camp-ui.js` is a list. The drawn camp scene (camp.md 4) was never built.

---

## 1. The first ten minutes: a cold Hearth

### 1.1 Who gets the cold start

A **new game** only: at load, `S.camp === undefined` and the save has no progress
(`S.totalKills === 0 && S.L === 1 && S.maxZone === 1`). It gets `S.hearth.cold = 1`. Every other
save (every live save, every fixture) is **warm**: nothing in this section changes for it.

A cold save starts with:

| Field | Cold start | Warm (every old save) |
|---|---|---|
| `S.camp.open` | `true` from lighting the fire (1.2) | as today (opens at zone 5) |
| `S.camp.b.hearth` | 0 until lit | as today |
| `S.camp.b.bench/forge/loom/ench/tavern` | 0 (plots to build) | 1 (the `registerState` default, unchanged) |
| `S.camp.b.store` | 0 (packs hold 100) | the migration level (4.7) |
| `S.activity`, `S.node` | `'gather'`, `{ kind: 'wood', t: 1 }` (the grove by the fire) | unchanged |

### 1.2 The first minute: light the fire

The stage opens on the **cold Hearth**: a ring of stones, a dead fire, Old Hesketh with his lamp out,
and one oak at the edge of the hollow. It is night in the scene whatever the clock says (the camp's
day and night start once the fire is lit). The hero holds a **Flint Hatchet** (the rough woodaxe:
an empty `axe` slot, 2.1).

| Step | What the player sees | Done when |
|---|---|---|
| 1 | Card: "Old Hesketh's lamp has gone out. 'Wood first. Then we talk.'" The hero starts chopping on their own. Guide: **Tap the tree to chop faster.** | 8 Oak Log (about 20 s idle, 12-15 s with taps and a Glint) |
| 2 | The fire's plot glows. Guide: **Tap the fire to light it.** Cost: 8 Oak Log. | tapped |
| 3 | The fire catches. Hesketh: "Every road needs a place to come back to." Camp opens (Hearth 1), the lanterns come on, the Camp tab appears. The hero picks up their weapon and walks out to zone 1. Guide: **The road is dark. Tap a foe to strike.** | - |

Lighting is `hearthLight()` in `55-hearth.js`: it pays the Oak, sets `S.camp.b.hearth = 1` and
`S.camp.open = true`, emits `campOpen { quiet: false }` and `hearthLit`, and sets `S.activity =
'fight'`. It is instant (no builder). The old "Old Hesketh sets down his lamp" toast at zone 5 does
not play for cold saves (they already lit it).

**Fighting stays open.** The Fight view is unlocked from second one. If the player switches to
Fight before lighting, the guide shows the fight steps and comes back to "Tap the fire to light it"
after the first boss (or as soon as they hold 8 Oak). An unlit fire costs nothing: no bonus is
missing, no timer runs. Only the Camp tab waits for it.

### 1.3 The station chain

Every station is built on its own **plot** (7) with materials and a short timer, by the one builder.
Lv 1 builds cost **no gold**. Lv 2-5 keep today's rows (`campCost`, `CAMP_HREQ`), unchanged.

| Order | Station | Plot opens when | Lv 1 cost | Timer | What it unlocks |
|---|---|---|---|---|---|
| 0 | Hearth (the fire) | start | 8 Oak Log | instant | The camp, the Camp tab, the builder, the Workbench plot |
| 1 | **Workbench** | Hearth lit | 20 Oak Log | 30 s | Every tool (2), bows, staffs, quivers; the Craft tab |
| 2 | **Forge** | Workbench built | 25 Copper Ore, 10 Oak Log | 60 s | Warblades, shields, helms, plate, censers |
| 3 | **Storehouse** | Forge built, or any pile at 80 of 100 | 30 Oak Log, 20 Copper Ore | 90 s | Caps go from 100 to 300 (4) |
| 4 | **Loom** | zone 5 (Foraging opens) | 20 Flax Fibre, 10 Oak Log, 5 Soft Hide | 2 min | Robes, hoods, leathers, tomes, mitres, vestments, circlets |
| 5 | **Enchanter's Table** | zone 6 | 15 Quartz Shard, 10 Dim Essence, 10 Oak Log | 3 min | Lanterns, trinkets, charms, Reforge, Transmute, Tonics |
| 6 | **Tavern** | zone 8 | 40 Oak Log, 20 Sage Sprig | 3 min | The visitor, Rumours at Lv 2, Hands' beds (5.7) |
| - | Watchtower, Library, Map Room, Shrine | as today (Hearth 1, 2, 2, 4) | today's rows | today's | today's |
| 7 | **Kitchen** (wave 3) | Hearth 3 (zone 14) | 6.1 | 6.1 | Meals (6) |

- **Crafting needs the station built** (`campLevel(st) >= 1`). This is the one place camp.md N4
  ("buildings never gate recipes") changes, at the owner's ask. It only ever bites a cold save:
  every warm save has every station at Lv 1. Tier gates stay on skill levels, as today.
- A class's first weapon: Ranger (Bow) and Lanternmage (Staff) make it at the Workbench, Warden
  (Warblade) and Lightkeeper (Censer) at the Forge. Every class has a weapon recipe by minute 6.
- A station plot that is not open yet shows nothing. An open plot shows a stake with a tag
  ("Workbench: 20 Oak") and opens the build card on tap.
- Cumulative Oak for the chain up to the Tavern: 8 + 20 + 10 + 30 + 10 + 10 + 40 = 128, plus 4-5
  per tool. That is about 6 minutes of chopping spread over the first 20.

### 1.4 The first ten minutes (targets for H1 to measure)

Same method as onboarding.md: scripted new game in Chromium, warden, mixed play.

| Time | What happens | Was |
|---|---|---|
| 0:00 | Cold Hearth. The hero chops. Guide: tap the tree | Fight tab, tap the foe |
| 0:20-0:45 | The fire is lit; Camp tab; walk out to zone 1 | - |
| 0:50 | Tap and ability hints done | 0:03 |
| 1:00-1:20 | First upgrade; Next Up | 0:12 |
| 1:20-1:50 | First boss (zone 2); Party tab | 0:34 |
| 2:00-3:00 | Guide: build the Workbench (chop 20 Oak, 30 s build) | - |
| 3:00-4:00 | Mine 4 Copper with the Stone Pick; make a Copper Pickaxe; Craft tab | Craft at 5:20 |
| 4:00-5:00 | Zones 3-4; Bounties | 1:18 / 2:14 |
| 5:00-6:30 | Forge built (60 s); first class weapon | - |
| 6:30-8:00 | Zone 5: Foraging with the Bone Sickle; Loom plot | 3:21 |
| 7:00-10:00 | Storehouse built (the first "nearly full" warning if it came) | - |
| 8:00 / 10:00 | Almanac / Roster (time rules unchanged) | same |
| 10:00-15:00 | Loom built | - |
| 14:00-20:00 | Zone 6-7; Enchanter's Table | - |
| about 20:00 | Zone 8; Tavern built; first recruit about 22:00 | Tavern 14:00 |
| about 60:00 | Zone 10: Hearth 2; Storehouse Lv 2; Hands open, Tam arrives (5.3) | - |

The fire and the first two builds cost about 90 seconds of the first ten minutes. The pace curve
(T1, D1, P1) must not move by more than 5% (target HS6).

### 1.5 The onboarding order (replaces onboarding.md's tables for cold saves)

`FEATURES` (55-onboard.js). Warm saves keep `S.onboard.all = true`, so none of this shows to them.

| Feature | Where | Opens when (cold saves) | Was |
|---|---|---|---|
| gather | Gather tab (Wood, Mining) | from the start | zone 3 |
| camp | Camp tab (Camp) | the fire is lit | zone 5 |
| nextup | Next Up chip | first upgrade, or zone 2 | same |
| party | Party tab | hero level 3, or zone 2 | same |
| craft | Craft tab (Make, Gear) | the Workbench is built | materials, an item, or zone 6 |
| bounties | Fight: Bounties | zone 4 | same |
| forage | Gather: Foraging | zone 5, or Foraging above 1 | same |
| bestiary, almanac, roster, uniques, codex, raid, stars, deep, synergy, exped | as today | same | same |
| tavern | Camp: Tavern | the Tavern is built | 14 min or zone 8 |
| **hands** (N1, late) | Camp: Hands; the Tavern's Job board | Hearth 2 and the Tavern built | new |
| **kitchen** (K12, late) | Camp: the Kitchen card | the Kitchen plot opens (Hearth 3) | new |

`hands` and `kitchen` are `late: true` rows, so old saves see them when their own rule holds, not
empty before.

`GUIDE_STEPS`, in order (sentences live in 75-onboard-ui.js):

| Step | Shows when | Sentence (target) | Done |
|---|---|---|---|
| chop (new) | cold and unlit | Tap the tree to chop faster. (the tree) | 8 Oak, or lit |
| light (new) | 8 Oak and unlit | Tap the fire to light it. (the fire) | lit |
| tap | lit, or the player chose Fight | The road is dark. Tap a foe to strike. (the foe) | 3 taps or 25 kills |
| ability | as today | as today | as today |
| boss | as today | as today | as today |
| upgrade | as today | as today | as today |
| tab:party | as today | as today | as today |
| bench (new) | the Workbench plot is open | Build the Workbench. It makes tools. (the plot's card) | Workbench built |
| tool (new) | the Workbench is built | Make a Copper Pickaxe. (the recipe) | any tool item made |
| nextup | as today | as today | as today |
| forge (new) | the Forge plot is open and the tool step is done | Build the Forge for your weapon. (the plot) | Forge built |
| store (new) | any pile at 80% of its cap, or the Forge built | Your packs are nearly full. Build a Storehouse. (the plot) | Storehouse built |
| recruit | as today | as today | as today |

Removed for cold saves: `tab:gat` (replaced by chop), `tab:world` (replaced by light), `tab:forge`
(replaced by tool). Checks in `check.mjs` (onboarding section): the fire lit under 1:00; first
upgrade affordable under 1:30 (was 1:00); Party and Next Up by 2:30 (was 2:00); a tool by 5:00;
no gap over 3 minutes in the first 10 (unchanged).

---

## 2. Tools

### 2.1 Kinds

| Kind (key) | Position (`S.equip`) | Skill | Nodes | Rough tool (empty slot) | Made at |
|---|---|---|---|---|---|
| Pickaxe (`pick`) | `pick` | Mining | Veins (ore), Geodes (crystal) | Stone Pick | Workbench (was the Forge) |
| Woodaxe (`axe`) | `axe` | Woodcutting | Groves (wood) | Flint Hatchet | Workbench |
| Sickle (`sickle`) | `sickle` | Foraging | Fibre patches, Herb beds | Bone Sickle | Workbench (was the Forge) |
| Fishing Rod (`rod`, reserved) | `rod` (added by the Coast) | Fishing (Coast) | fishing spots; Tide Pools if R2 agrees (decision 14) | Driftwood Rod | Workbench |

- **The rough tools are not items.** An empty tool slot gathers at the base rate, exactly as today,
  and the hero is drawn holding the rough tool. Nothing to lose, nothing in the bag.
- The item kind keys do not change. Only the Axe's display noun becomes **Woodaxe** (`noun` in
  `CRAFT_KINDS.axe`). Old axes are named "Copper Woodaxe" and so on; their stats do not move.
- **Moving tools to the Workbench keeps every recipe.** Tools gate on the better of Woodcraft and
  Smithing (today's `stationLevel` rule for `RECIPE` kinds, extended to the Sickle). Their craft
  XP goes to Woodcraft.
- The hero holds the tool of the skill in use (G1 draws it). H2 adds the tier look: Stone, then
  Copper, Iron, Mithril, Starsteel and Emberite heads in `MAT.ore.col`, a glow on Epic and Unique.

### 2.2 Tiers and stats

Tool tiers are the item tiers, named by ore: **Copper, Iron, Mithril, Starsteel, Emberite** (1-5),
with the rough tool as tier 0. Power `p = itemPower(it)` as today.

| Stat | Line | Per p | Cap | Old tools |
|---|---|---|---|---|
| Speed | `mineSpd` / `woodSpd` / `forageSpd` (`fishSpd`) | 0.6 | none | unchanged |
| Yield (double) | `oreDbl` / `woodDbl` / `forageDbl` (`fishDbl`) | 0.1 | 60% | unchanged |
| **Rare find** (new) | `oreFind` / `woodFind` / `forageFind` (`fishFind`) | 0.012 | 8% | gain the line (only up) |
| **Right tool** (new, rule) | +25% speed while the tool's tier >= the node's tier | - | - | applies |

- **Rare find:** each unit gathered has this chance to bring 1 unit of the **next tier** of the same
  family (a Copper vein turns up Iron). On a tier-5 node it brings 2 more of tier 5. The next tier
  does not need to be unlocked. Away gathering credits the expected finds. Float: "Rare find! +1
  Iron Ore".
- **Right tool** is the owner's "right tool for the job" in numbers, as a bonus, never a gate: a
  Stone Pick still mines Emberite. Old saves without tools lose nothing.
- Examples (Copper vein, Mining 1): rough 2.60 s a unit; common Copper Pickaxe
  `2.6 / (1.06 x 1.25)` = 1.96 s (+33%); uncommon 1.92 s (+35%). Tier 5 Epic +10: speed +487%,
  double 60%, find 8%.
- **No affixes on tools** (decision 3). Rarity scales the whole tool. The Masterwork line stays
  (Golem Core: gathering speed). Tools stay easy to read: three lines and a mastery bar.

### 2.3 Recipes (tier-1 amounts; tier t costs `craftScale(n, t)` as today)

| Tool | Recipe | Note |
|---|---|---|
| Pickaxe | Ore 4, Wood 4 | `RECIPE.pick`, unchanged (upgrade costs of old picks stay) |
| Woodaxe | Wood 5, Ore 3 | `RECIPE.axe`, unchanged |
| Sickle | Ore 4, Wood 3 | unchanged |
| Fishing Rod (Coast) | Wood 4, Fibre 3 | R2-1 adds it with the `rod` position |

### 2.4 Tool mastery

Mastery belongs to the **tool kind** (Pickaxe, Woodaxe, Sickle), not to one item (decision 2). A
better pickaxe keeps your Pickaxe mastery, so an upgrade never feels like a reset. The bar shows on
the equipped tool's card, under its three lines.

- **XP = seconds spent gathering with that kind**, live and away (1:1), rough tool included, and
  **when the Storehouse is full** (rule 4). Hands do not add mastery.
- Level 1 to 20. Minutes to the next level: `5 x lv` (Lv 1 to 2: 5 min; Lv 19 to 20: 95 min;
  950 min, about 16 hours, to master). A tool used for 8 hours of away gathering a day masters in
  2-4 days.

| Level | Perk (that tool kind only) |
|---|---|
| each | +1% gathering speed (+20% at Lv 20) |
| 5 | Rare find +1 point |
| 10 | The Glint on its nodes lasts 1 s longer |
| 15 | +5% yield |
| 20 | "Master" on the tool's name, a gold edge; **Hands on that skill gather +10%** |

Wiring: `addModifier('gatherSpeed:' + skill, ...)` (right tool and mastery speed; `nodeTime` reads
the new key, a one-line edit in 40-rules), `addModifier('yield:' + fam, ...)` (Lv 15, the existing
key), a `find:<skill>` bonus key for Lv 5, `bonus('glint:<skill>')` for Lv 10.

---

## 3. Gathering with tools, in play

- **Active:** the hero swings the held tool at the node (G2 scenes). "Right tool" shows as a small
  green tick on the tool chip; a rough tool shows "Stone Pick (rough)".
- **Away:** unchanged maths plus the right-tool bonus, mastery speed and expected rare finds. The
  away card line adds "Pickaxe mastery 7 (+1)".
- **Full:** see 4.4.

---

## 4. The Storehouse

### 4.1 What it caps

Every **material cell** (family and tier) has a cap. The cap depends on the Storehouse level and the
family's group. Tiers share one number, so the pouch reads "340 / 600" in every cell of a row
(`STORE_TUNE.tierMult = [1, 1, 1, 1, 1]` is a knob if the sim wants tier-5 cells smaller).

| Group | Families | Cap factor |
|---|---|---|
| Gathered | ore, wood, crystal, fibre, herb | x1 |
| Fought | hide, ess | x0.5 |
| Coast | pearl, fish (when they exist) | x0.5 |
| Not capped | Trophies, tonics, meals, gold, Embers, Renown, Marks | - |

### 4.2 Levels, caps and costs

`S.camp.b.store`, Lv 0 (no Storehouse: "packs") to Lv 8. Storehouse Lv L needs Hearth L
(`STORE_HREQ = [1, 2, 3, 4, 5, 6, 7, 8]`). Gold is `campGold(CAMP_HZ[H - 1], 60 x L)` as for other
buildings (none at Lv 1). Trophies are "any type".

**Revised by the owner (2026-09-28, H3):** "It's an idle game: the Storehouse should scale up quite
quickly. Meaningful, not ridiculous, but never so small it's only worth idling for 10 minutes." The
first table (100 / 300 / ... / 10,000) was a few minutes of play and is replaced by the one below.

| Lv | Hearth (zone) | Gathered cap | Fought cap | Cost | Trophies | Timer | Perk |
|---|---|---|---|---|---|---|---|
| 0 | - | 5,000 | 2,500 | - | - | - | "Your packs hold 5,000 of each" |
| 1 | 1 (fire) | 40,000 | 20,000 | Oak 30, Copper 20 | - | 90 s | - |
| 2 | 2 (10) | 50,000 | 25,000 | Oak 80, Copper 60, Flax 30 | - | 10 m | - |
| 3 | 3 (14) | 100,000 | 50,000 | Yew 90, Iron 70, Nettle 40 | - | 30 m | **Spillover** (4.4) |
| 4 | 4 (18) | 200,000 | 100,000 | Ironbark 100, Mithril 80, Silkgrass 50 | - | 2 h | - |
| 5 | 5 (22) | 300,000 | 150,000 | Ironbark 150, Mithril 120, Scaled Hide 40 | 1 | 6 h | - |
| 6 | 6 (27) | 750,000 | 375,000 | Ghostwood 150, Starsteel 120, Moonsilk 60 | 2 | 12 h | - |
| 7 | 7 (32) | 1,250,000 | 625,000 | Ghostwood 220, Starsteel 180, Starglass 60 | 3 | 18 h | - |
| 8 | 8 (38) | 2,500,000 | 1,250,000 | Lanternwood 250, Emberite 200, Gloamsilk 80 | 4 | 24 h | - |

How the table is derived (knobs: `STORE_TUNE.caps` and `STORE_TUNE.pace` in 55-store.js):

1. **Rates.** Away gathering per hour is `3600 / nodeTime x nodeYieldAvg x yield mods x offline
   boost` (40-rules, 50-sim `awayBase`). The tool dominates it: the sim crafts and upgrades tools
   early (a tier-1 Epic +9 axe by day 2). Measured with `node tools/sim.mjs --days 30 --class <c>
   --store 0` (the "store: away rate by day" line; units an hour before any cap, all four classes):

   | Day | Hearth | Skill | Tool | Best away rate |
   |---|---|---|---|---|
   | 1 | 1 | 25 | T1 Rare/Epic +1..+3 | 3,000-3,500 /h (T1) |
   | 2-3 | 1-2 | 30-46 | T1-T2 Rare/Epic up to +9 | 3,000-4,400 /h (T1-T3) |
   | 5-7 | 4 | 57-74 | T3-T4 Rare/Epic +9..+10 | 10,800-16,700 /h (T3) |
   | 10-14 | 5-8 | 90-112 | T4-T5 Rare/Epic +5..+10 | 18,000-51,000 /h (T4) |
   | 21-30 | 7-10 | 130-212 | T5 Rare/Epic +10 | 38,000-96,000 /h (T5) |

2. **Away hours.** The away cap is 4 h + 2 h per Watchtower level (Lv 1/2/3/4/5 need Hearth
   1/2/4/6/8) + 2 h per Hourglass relic, 24 h at most. `pace[L].h` is what a player can have at
   Hearth L, rounded up: 8, 8, 10, 12, 14, 16, 20, 24 h.
3. **Rule.** Lv 1 (built about minute 10 of a new game) holds a full 8 h away session at the best
   tier then; every later level holds a full away session (its hours) on the best node the pacing
   expects at that Hearth (`pace[L]`: the upper edge of the sim's classes). Rounded up to a round
   number, and every level more than the last. `check.mjs` HS19 recomputes it from the live
   formulas at each row (every gathered family, the fastest one counts):

   | Lv | Reference (`pace`) | Away rate | Away session | Cap | Fills away | Fills tapping (~2x) |
   |---|---|---|---|---|---|---|
   | 1 | T1, skill 25, T1 Rare +3 axe | 4,031 /h | 8 h = 32,251 | 40,000 | 9.9 h | ~5 h |
   | 2 | T2, skill 40, T2 Rare +3 | 4,911 /h | 8 h = 39,285 | 50,000 | 10.2 h | ~5 h |
   | 3 | T3, skill 50, T3 Rare +6 | 7,503 /h | 10 h = 75,031 | 100,000 | 13.3 h | ~7 h |
   | 4 | T3, skill 74, T3 Epic +10 | 15,133 /h | 12 h = 181,597 | 200,000 | 13.2 h | ~7 h |
   | 5 | T4, skill 90, T4 Rare +10 | 18,558 /h | 14 h = 259,810 | 300,000 | 16.2 h | ~9 h |
   | 6 | T4, skill 110, T5 Rare +10 | 38,484 /h | 16 h = 615,745 | 750,000 | 19.5 h | ~12 h |
   | 7 | T5, skill 135, T5 Epic +10 | 51,863 /h | 20 h = 1,037,261 | 1,250,000 | 24.1 h | ~15 h |
   | 8 | T5, skill 210, T5 Epic +10 | 74,813 /h | 24 h = 1,795,509 | 2,500,000 | 33.4 h | ~21 h |

4. **Builds.** Quick and cheap early (90 s, 10 min, 30 min), slower later (2 h to a day).
5. **Packs (Lv 0)** hold 5,000: an hour or two of early gathering, for the few minutes before the
   Storehouse (its plot opens once the Forge stands, spec 1.3).
6. **Active play.** Tapping about doubles the live rate (each tap is 0.12 of a swing), so the cell
   you work fills in about 5 h at Lv 1-2 and 7-20 h later. The owner's "1-3 h of active play" cannot
   hold together with "a full away session never overflows": away gathering runs at the live rate
   (times the offline boost), so any cap that holds 8+ h away holds 4+ h of tapping. This table
   keeps the away rule (the owner's rules 1-2) and leaves the active one loose; the cap still bites
   on lower-tier cells, on long sessions and on the Glint and rare finds. A tighter active cap would
   need a slower away rate than live, which is an economy change for the coordinator.

- **Rule: a cap never blocks a cost.** Every single material cost the game can ask at Hearth H (the
  next Hearth, building rows, recipes at +0..+10, Star Chart, promotions, legendary costs, the next
  Storehouse) fits in the cap of Storehouse Lv H. `check.mjs` asserts it statically (HS8); with the
  revised caps it holds with a wide margin (the largest cost is a few hundred units).

### 4.3 How materials arrive: flows, parcels, gifts

All credits go through one function, `stashAdd(fam, t, n, how)` (H3), which returns what it added.

| How | Sources | At the cap |
|---|---|---|
| **flow** | hero gathering (live and away), the Glint, rare finds, fight essence, signature drops, champion drops | Adds up to the cap; the rest is not made. Skill XP and mastery still count |
| **parcel** | a Hand's pack (5.5), an expedition haul, a bounty reward, an Almanac board reward, the Tavern trader's essence | Waits whole until it fits (4.5) |
| **choice** | salvage, transmute | The player sees what fits before acting (4.5) |
| **gift** | refunds (a cancelled build), one-time rewards (Great Lantern, Codex milestones, achievements, welcome gifts) | Always lands, even above the cap (decision 6) |

### 4.4 At the cap, in play

- **Gather view and stage:** when the node's material is full, the hero keeps swinging (skill XP
  and mastery count). The float reads "Full" instead of "+1". A chip over the node:
  **"Storehouse full: Copper Ore. Mining XP still counts."** with a **Switch** button that picks the
  next unlocked node of the same skill that is not full.
- **Spillover** (Storehouse Lv 3): a toggle on the chip. When the node's material fills, the hero
  moves to the next node of the same skill that is not full (highest tier first). While away, too.
- **The Glint** does not show on a full node (nothing to tap for).
- **Fight drops:** essence and signature drops above the cap are not made. No toast; the pouch
  cell turns red and the Fight's drop float reads "Full".
- **Pouch** (Gather tab, Pack view): each cell shows "have / cap" and a thin bar: amber from 90%,
  red with "Full" at the cap. A cell above its cap (old save) shows the number in amber with a lock
  and "Over the cap: spend below 600 to gather more."
- **Next Up:** "Storehouse Lv 3: holds 1,000 of each" as a camp goal when any cell has been full for
  10 minutes of play.
- **Toasts:** one per cell per fill, low priority: "Storehouse full: Copper Ore."

### 4.5 Parcels and choices

- **Hands** come home with a pack. It unloads on its own, oldest first, as soon as there is room
  (checked each second and on load). While a pack is not empty, that Hand cannot start a new shift.
  The Hand card offers **Empty the pack** (in-page ask: "Throw away 120 Oak Log? [Throw away]
  [Keep]").
- **Expeditions:** Collect (or the away phase) credits the haul only if every line fits; otherwise
  the slot shows "Back. Storehouse full: collect when you have room." and Repeat pauses for that
  slot. Nothing is lost. The send sheet warns if the preview haul would not fit today.
- **Bounties and the Almanac board:** Claim is disabled while the reward does not fit ("Needs room
  for 60 Iron Ore"). The bounty keeps its slot.
- **Tavern trader:** the essence trade is disabled while it does not fit.
- **Salvage:** the sheet shows what fits. If some would not: "Only 5 of 8 Copper Ore fit. Salvage
  anyway?" [Salvage] [Keep]. Bulk salvage sums it the same way.
- **Transmute:** disabled when the target cell cannot take the whole result.

### 4.6 The credit sites H3 routes through `stashAdd`

`50-sim.js` harvest (flow), away gather (flow), kill essence (flow), away essence (flow);
`55-gathering.js` `give` (flow), `tapGlint` (flow); `57b-expeditions.js` `addMat` and collect
(parcel); `55-bounties.js` claim (parcel); `55-almanac.js` reward claim (parcel); `56c-unlocks.js`
trader (parcel); `51-actions.js` salvage (choice); `55-crafting.js` transmute (choice) and
`craftSalvageBonus` (choice, with salvage); `57-camp.js` refund (gift). Spending stays a raw
subtraction.

### 4.7 Migration: old saves

Owner rule, exactly:

1. **Nothing is deleted.** `S.mats` is not touched by the migration.
2. **Old saves get the Storehouse level that holds what they have.** At the first load with this
   build (`S.store` undefined and the save has progress), `S.camp.b.store` = the lowest level whose
   caps hold every capped cell. The Hearth gate is ignored for this (never take away). A save with
   nothing above 100 still gets **Lv 1** (it predates the packs).
3. **If no level holds a pile** (a cell above 2,500,000 gathered or 1,250,000 fought), the save gets Lv 8
   and that cell is **over the cap**: it keeps every unit and cannot gain that material until it is
   spent below the cap. `S.store.mig.over` lists those cells for the notice.
4. One "What's new" line: "Your camp has a Storehouse now, at level 4. It holds up to 1,600 of each
   material." Plus, if any cell is over: "Dim Essence is over the cap. You keep all of it. Spend
   below 1,250,000 to gain more."

Fixtures: `save-v2-late.json` (largest cell 120 Copper) gets Lv 1; all four fixtures get Lv 1.

---

## 5. Hands

### 5.1 What a Hand is

A Hand is a townsperson from the road who gathers for you. Hands are not companions: they never
fight, never go on expeditions, never join the Roster board. They live at camp, go out on
**shifts**, come home with a **pack**, and sit at the fire until you send them again.

| | Hands | Expeditions (companions) |
|---|---|---|
| Who | Townsfolk hired at the Tavern | Benched companions |
| Where | One gathering node the hero has unlocked | A route in a cleared band |
| Brings | One gathered family (ore, wood, crystal, fibre, herb) | Mixed families incl. Hide and Essence, Trophies, Lore, Renown, tokens |
| Size | 10-25% of the hero's rate at that node | Set by grade and route |
| Length | 2-8 h by rarity and traits | 1, 4, 8 or 12 h, chosen |
| Grows | Hand levels 1-20 (hours worked) | Companion XP (capped) |
| Needs | A bed (the Tavern) | A Map Room slot |
| At camp | At the fire or their work spot; talk, stories | Resting at their favourite spot |

### 5.2 Rarity

Rarity uses the game's colours (`RAR`). It sets the base share, the shift length and the number of
traits.

| Rarity | Applicant odds | Base share | Shift | Traits | Hire (foes' gold at max zone) |
|---|---|---|---|---|---|
| Common | 52% | 10% | 2 h | 1 | 100 |
| Uncommon | 30% | 12% | 3 h | 1 | 250 |
| Rare | 13% | 15% | 4 h | 2 | 600 |
| Epic | 4% | 18% | 6 h | 2 | 1,500 |
| Legendary | 1% | 20% | 8 h | 2 + a calling | 4,000 |

- **Pity:** a Rare or better at least every 8 applicants, an Epic or better every 25, a Legendary
  every 90 (counters in `S.hands.pity`).
- Hire cost is `foesGold(S.maxZone, k)`, as other prices on the PACE curve. No other cost, **no
  upkeep** (decision 10).

### 5.3 Hiring (the Tavern's Job board)

- A section in the Tavern view. **One applicant arrives every 8 hours** of wall clock (every 6 hours
  from Tavern Lv 3), and up to **3 wait** on the board, like the away cap. Missing days loses
  nothing beyond 3 waiting. Applicants stay until hired or turned away.
- Each card shows everything: name, rarity, skill, traits, shift, "Gathers about 230 Oak an hour
  now". Buttons: **Hire** (gold) and **Turn away** (frees the spot; the next applicant still waits
  its 8 hours).
- **Tam**, Hesketh's nephew, a Common Woodcutter with the Steady trait, arrives free when Hands
  open (Hearth 2 and the Tavern built). Old saves past Hearth 2 get him when N1 lands.
- **Let go** on a Hand's card (in-page ask) frees a bed. They wave from the road.

### 5.4 Skills

Each Hand has one skill: **Mining, Woodcutting or Foraging** (Fishing joins with the Coast). A Hand
can work any node the hero has unlocked for any skill: at full share on their own skill, at **half**
on the others. Home ground does not apply (Hands work near camp).

### 5.5 Shifts and yield

- **Send:** pick a Hand and a node (the sheet suggests the node whose material the next build or
  craft is short of). One tap: **Send again** repeats each Hand's last node.
- At send the shift is fixed and stored, like an expedition: node, length, rate and a seed. Reload
  and offline pay the same.
- **Rate** (units an hour) =
  `heroRate(kind, t) x share x traits x (own skill ? 1 : 0.5)`, where
  `heroRate = 3600 / nodeTime(kind, t) x nodeYieldAvg(kind)` with the hero's current skill, tool
  and mastery, **without** Tonics, meals, Omens or the Glint. So Hands follow the hero's progress
  and never need gear of their own.
- **Share** = base share (5.2) + 0.25% per level above 1: a Common at Lv 20 gathers 14.75%, a
  Legendary at Lv 20 24.75%.
- **Pay:** at the end of the shift the whole haul goes into the Hand's pack, which unloads into the
  Storehouse (4.5). No skill XP for the hero, no tool mastery, no fight drops.
- **Shift length:** rarity length (5.2), +15 min per 5 levels, then traits.
- **How many at once:** every Hand you house can work at the same time. Beds (5.7) are the limit.
- Example: Mining 10, uncommon Copper Pickaxe (right tool), mastery 5: the hero does about 2,350
  Copper an hour. Tam-like Common Lv 1 on Copper: 235 an hour, 470 per 2-hour shift.

### 5.6 Levels

Level 1-20. XP = hours worked (shift hours, paid at the end). Hours to the next level: `2 x lv`
(380 hours to Lv 20: about 3 weeks of shifts). Each level: +0.25% share. Every 5 levels: +15 min
shift and a story at the fire (5.9).

### 5.7 Beds: how many Hands

Beds are rooms above the Tavern. No new building.

| Tavern Lv | 1 | 2 | 3 | 4 | 5 | + Hearth 8 (Lantern Hall) |
|---|---|---|---|---|---|---|
| Beds | 1 | 2 | 3 | 4 | 5 | +1 (6 at most) |

The Tavern's effect lines gain "N beds for Hands" (a one-line edit in `campEffects`).

### 5.8 Traits

A Hand has 1 or 2 traits (5.2), never the same twice. Legendaries also have a **calling** (5.10).

| # | Trait | Effect |
|---|---|---|
| 1 | Steady | +10% yield |
| 2 | Strong Back | +1 h shift |
| 3 | Packmule | +15% haul, -10% shift |
| 4 | Homebody | +40% yield, -25% shift |
| 5 | Wanderer | +50% shift, -10% yield |
| 6 | Keen Eye | Rare finds: 2% of units come back one tier up (2.2) |
| 7 | Early Riser | +20% yield on shifts sent 05:00-11:00 (device clock) |
| 8 | Night Owl | +50% shift length on shifts sent 18:00-06:00 |
| 9 | Stonecutter | +25% yield on Crystal |
| 10 | Green Thumb | +25% yield on Fibre and Herbs |
| 11 | Lucky | Each shift: 2% chance to bring 1 Trophy of a random type |
| 12 | Friendly | +10% yield for this Hand and one other Friendly Hand when their shifts overlap |
| 13 | Chatterbox | While at camp: other Hands earn +10% level XP |
| 14 | Cook | While at camp: meals last 25% longer (needs the Kitchen) |
| 15 | Storyteller | While at camp: +2% away gains |
| 16 | Old Hand | Levels 25% faster |

- Traits 13-15 work **while the Hand is at camp**. They give resting a small job, so "hanging out"
  is worth something without making it a chore.
- Early Riser and Night Owl mirror each other so every hour of the day has a trait that likes it.
  Neither takes anything away outside its hours (rule 6).
- The at-camp traits do not stack from two Hands with the same trait (the best one counts).

### 5.9 Camp life

- **Where they are:** a Hand not on a shift is at camp. By day at their work spot (Miners by the
  Storehouse door, Woodcutters at the woodpile by the Workbench, Foragers at the Kitchen table);
  from dusk at the fire. The scene draws at most **3 Hands** and **5 companions** (camp.md's
  budget of 8 characters).
- **Leaving and coming home:** a Hand walks out along the road with the tool of their skill, and
  comes back with a full pack on their back. A full pack that is waiting sits by the Storehouse.
- **Talk:** tap a Hand for one line (rotating per Hand): a greeting that knows the time of day, a
  line about their last shift ("The Iron Vein gave up 300 today."), a line for each trait, a
  level-up line. About 90 lines in total (N2).
- **Stories at the fire:** at Lv 5, 10, 15 and 20 a Hand has a short story (3-4 sentences, one tap)
  the next time you tap them at the fire. Legendary Hands have a 4-part story. No reward beyond a
  Codex line (the Codex's Camp page counts stories heard); it is there to make them people.
- **Day and night:** 6.3.

### 5.10 Legendary Hands

Five named townsfolk (plus random names from pools of 40 first names and 30 trade names for the
rest). Their **calling** is a third, stronger trait.

| Name | Skill | Calling |
|---|---|---|
| Nan Tarrow, who worked the Quarry before the dark | Mining | Deep Seam: +25% yield on tier 4 and 5 nodes; Rare finds 4% |
| Old Bracken | Woodcutting | Felling Song: other Woodcutters on shift +15% |
| Sister Fennel | Foraging | Physic Garden: every shift also brings Herbs of the same tier (25% of the haul) |
| Jory Quickhands | any (full share on all skills) | Light Fingers: Lucky at 6% |
| Mother Ashby | Foraging | Hearth Cook: counts as Cook while on shift too; meals +10% |

### 5.11 Hands and the other systems

- **Away card:** "Tam is back from the Oak Grove: +470 Oak Log." / "Tam's pack waits: Storehouse
  full." Group "Hands".
- **Next Up:** "A Hand is back: send again" (ready), "Applicant waiting at the Tavern".
- **Codex:** the Camp page counts Hands hired, stories heard, Legendary Hands met.
- **Well Rested** (G1): unrelated; the party rests at the fire with the Hands.
- **Kitchen:** 6.2.
- **Online:** none. Hands never touch the raid, the room or the leaderboard.

---

## 6. The Kitchen, meals, day and night, plots

### 6.1 The Kitchen

A building on its own plot, wave 3 (after Hands). Opens at **Hearth 3** (zone 14). Levels 1-5 on the
camp formula (families Wood 20, Herbs 25; trophy Spore Crown; rows and timers as other buildings;
Lv 1 needs Hearth 3, so `opens: 3`).

| Lv | Effect |
|---|---|
| 1 | Cook Hearty Stew and Spiced Broth |
| 2 | Also Forager's Pie and Hand's Supper |
| 3 | Meals last 6 h (was 4 h) |
| 4 | Cook 5 at once |
| 5 | Leftovers: eating a meal has a 25% chance not to use it up |

### 6.2 Meals

One meal is active at a time, for **4 hours** (6 at Kitchen Lv 3). The timer runs while away. Meals
are a separate slot from Tonics (20 min), so they stack with one. Cooked meals wait in the pantry
until eaten. Strength scales with tier as Tonics do (`x (1 + 0.25 (t - 1))`); the recipe scales with
`craftScale`.

| Meal | Tier-1 recipe | Effect (tier 1) |
|---|---|---|
| Hearty Stew | Herbs 6, Wood 2 | Party +8% max HP |
| Spiced Broth | Herbs 5, Essence 1 | +5% damage |
| Forager's Pie | Herbs 4, Fibre 3 | +8% gathering speed; Hands sent while it is active +15% yield |
| Hand's Supper | Herbs 4, Wood 2 | Hands sent while it is active: +25% shift length |
| Fish Supper (Coast) | Fish 4, Herbs 2 | +8% away gains |

- Camp rule 4 (the whole camp adds at most +15% damage) holds. The Blade Blessing gives up to +10%
  (Shrine Lv 2) and the Broth +5% to +10% by tier, so K12 caps the Broth at
  `max(0, CAMP_DMG_CAP - blade)` with `CAMP_DMG_CAP = 0.15`. The Broth's card says so when the cap
  bites: "+5% damage (the camp's limit is +15%)".
- Meals fill the "come back in a few hours" slot: cook and eat at a check-in, it lasts to the next.

### 6.3 Day and night

The camp follows the device clock (`new Date().getHours()`, local time). The sim's `Date.now`
follows sim time, so it runs there too.

| Phase | Hours | Scene |
|---|---|---|
| Dawn | 06:00-08:00 | Pale sky, lanterns go out, Hands head to work spots |
| Day | 08:00-18:00 | Full light |
| Dusk | 18:00-21:00 | Warm sky, lanterns come on one by one |
| Night | 21:00-06:00 | Dark sky, lanterns lit, everyone at the fire, stars |

- Power at night: only the Night Owl and Early Riser traits read the clock. Nothing else.
- Reduced motion: the lanterns switch on at once; no flicker.
- The Lantern Hall (Hearth 8+) glows at every hour, as camp.md says.
- `campClock(now) -> { phase, h }` lives in `57f-hands.js` (N1) so the core can read it; the scene
  (N2) draws it.

### 6.4 Camp plots

The camp is a panorama (camp.md 4.1, 960 x 180 art px) with **fixed plots**. Each building has one
plot; nothing is placed by hand. A plot is dark until it opens, then shows a stake with a tag, then
the building's stage art (camp.md 4.2) as it grows.

| Plot | x (art px) | Building | Opens |
|---|---|---|---|
| p1 | 60 | Kitchen | Hearth 3 |
| p2 | 150 | Tavern | zone 8 (cold) / built (warm) |
| p3 | 250 | Watchtower | Hearth 1 |
| p4 | 360 | **Hearth** (centre, the start) | always |
| p5 | 440 | Workbench | Hearth lit |
| p6 | 510 | Forge | Workbench built |
| p7 | 580 | Storehouse | Forge built, or a pile at 80 of 100 |
| p8 | 650 | Loom | zone 5 |
| p9 | 720 | Enchanter's Table | zone 6 |
| p10 | 790 | Library | Hearth 2 |
| p11 | 860 | Shrine | Hearth 4 |
| p12 | 930 | Map Room | Hearth 2 (with Expeditions) |
| landmarks | road | Deepwell, Almanac post | as today |

Spots for people: the fire (p4, room for 6), the woodpile (p5), the Storehouse door (p7), the
Kitchen table (p1), plus camp.md's favourite spots for companions (`CAMP_SPOTS`). The chip strip
(camp.md 4.1) lists open plots only.

---

## 7. Pacing

### 7.1 Where each piece lands

| When (normal play) | Piece |
|---|---|
| 0:00-1:00 | Cold Hearth, first chop with the Flint Hatchet, the fire |
| 2-5 min | Workbench; first tool (Copper Pickaxe) |
| 5-10 min | Forge; first class weapon; Storehouse Lv 1 |
| 10-20 min | Loom; Enchanter's Table; the first full tier-1 set |
| about 20 min | Tavern |
| about 1 h (zone 10) | Hearth 2: Storehouse Lv 2, Hands open, Tam |
| 1.5-2 h (zone 14) | Hearth 3: Kitchen, Storehouse Lv 3 (Spillover) |
| day 1 | 2-3 Hands; first tool mastery 10 |
| day 2-4 | First Rare Hand; first tool mastered (Lv 20); Storehouse Lv 5-6 |
| week 1-2 | 4-5 beds full; Storehouse Lv 7-8 (zones 32 and 38) |
| week 3-5 | First Legendary Hand; first Hand at Lv 20 |

The cold start moves the first 20 minutes by about 90 seconds. Storehouse caps and Hands change
where materials come from, not how fast zones fall: HS6 holds T1, D1, P1 and P2 within 5%.

### 7.2 Balance targets (tools/sim.mjs)

| Id | Target | Band |
|---|---|---|
| HS1 | The fire lit (scripted new game) | 0:20-1:00 |
| HS2 | First tool crafted | 2-5 min |
| HS3 | Workbench, Forge, Loom and Enchanter's Table all built | 12-25 min, every class |
| HS4 | Storehouse Lv 1 built | 5-15 min |
| HS5 | Onboarding: no gap over 3 min in the first 10 | yes (unchanged) |
| HS6 | T1, D1, P1, P2 against today's `--targets` | within 5%, every class |
| HS7 | Time at cap: share of gathering time (live and away) spent on a full node | days 1-3 at most 20%; days 7-21 at most 35% (with the policy below) |
| HS8 | Every cost reachable at Hearth H fits Storehouse Lv H | exact (static, in check.mjs) |
| HS9 | Hands' share of gathered units | day 2: 10-20%; day 14: 20-35% |
| HS10 | One Hand's rate over its hero reference | 10-25% (every rarity and level) |
| HS11 | First Hand hired (not Tam) | 1-2 h continuous; day 1 in normal play |
| HS12 | First Rare Hand / first Legendary Hand | day 1-3 / day 14-35 |
| HS13 | First tool mastery 20 | day 2-6 |
| HS14 | Meal active on check-ins after the Kitchen is built | INFO (policy check) |
| HS15 | Right tool, tier-matched common tool vs rough | +30% to +45% speed |
| HS16 | G1 (first full tier-1 set) with station builds | 10-18 min (was 6-12) |
| HS17 | Offline 8h vs live 8h, Hands and away gathering with caps | within 15% per family |
| HS18 | Migration: fixtures load, `S.mats` exact, dps exact, stations Lv >= 1, Storehouse holds every pile | exact |
| HS19 | (owner, 2026-09-28) At each expected Storehouse level (`STORE_TUNE.pace`), a full away session on the best open node fits the cap | exact (check.mjs 'store') |

HS7 note (H3): with the revised caps HS7 is re-measured by `--targets`; with the first table it read
about 90%, because a 4-5 h away gather overflows any cap of minutes.

### 7.3 Sim hooks

New flags (default on for new behaviour, `0` for the old rules to compare):

| Flag | Meaning |
|---|---|
| `--cold 0|1` | Start at a cold Hearth (default 1). The policy chops 8 Oak, lights, then plays as today and builds stations as soon as it can pay |
| `--store 0|1` | Storehouse caps on (1) or none (0). The policy builds Storehouse levels like other camp builds, turns Spillover on, and spends or switches when a node is full |
| `--tools 0|1` | Right tool, mastery and rare finds on. The policy crafts the tier-matched tool of the skill it gathers when affordable |
| `--hands 0|1` | Hands on. Policy: hire the best applicant when a bed is free and the price is under 10 minutes of income; send every Hand at each check-in to the node the next build or craft is shortest of (own skill first); empty no packs |
| `--kitchen 0|1` | Kitchen on. Policy: at each check-in cook and eat Forager's Pie if Hands are out, else Spiced Broth |
| `--report hands` | Prints units per family by source (hero live, hero away, Hands, fights, expeditions), time at cap per family, Hands hired by rarity, mastery levels |

Core helpers the sim calls (no DOM): `hearthLight()`, `hearthNext()` (55-hearth: the next station
the policy should build), `toolBest(skill)` (55-tools), `stashRoom(fam, t)`, `storeCap(fam, t)`,
`storeLevelFor(mats)` (55-store), `handsBoard()`, `handsHire(i)`, `handsSend(id, kind, t)`,
`handsSendAgain()` (57f-hands), `cookMeal(k, t)`, `eatMeal(k, t)` (57g-kitchen).

Knobs: `HEARTH_TUNE` (55-hearth: light cost 8, Lv 1 station costs and timers), `TOOL_TUNE`
(55-tools: right 0.25, findPer 0.012, findCap 8, masteryMins 5, masteryMax 20, perks), `STORE_TUNE`
(55-store: caps, groups, tierMult, packs 100, spill level 3), `HANDS_TUNE` (21f-data-hands: odds,
pity, shares, per-level 0.0025, shifts, arrival hours 8 / 6, hire foes, beds, off-skill 0.5),
`KITCHEN_TUNE` (57g-kitchen: hours 4 / 6, meals).

---

## 8. Save and migration

### 8.1 State

| Field | Owner | Change |
|---|---|---|
| `S.hearth` (new) | H1 | `registerState('hearth', { v: 1, cold: 0, lit: 0 })`. `cold`: this save began at a cold Hearth. `lit`: ms the fire was lit (0 = not; warm saves 0, never read) |
| `S.camp.b.store`, `S.camp.b.kitchen` | H3, K12 | New keys in the camp's `b` default (0). `fillDefaults` merges them into old saves |
| `S.camp.b.forge/bench/loom/ench/tavern`, `hearth` | H1 | A cold save sets them to 0 at start. Same fields, same meaning (levels); nothing repurposed |
| `S.tools` (new) | H2 | `registerState('tools', { v: 1, m: { pick: [1, 0], axe: [1, 0], sickle: [1, 0] }, finds: 0 })`. `m[kind] = [level, seconds into the level]`; the Coast adds `rod` |
| items | H2 | No new fields. Tools gain the `*Find` line by formula, not by field |
| `S.store` (new) | H3 | `registerState('store', { v: 1, mig: { lv: 0, at: 0, over: [] }, spill: 0, said: {} })`. `mig`: what the migration gave; `spill`: Spillover on; `said`: cells already toasted this fill |
| `S.hands` (new) | N1 | `registerState('hands', { v: 1, seq: 0, list: [], board: { apps: [], next: 0 }, pity: [0, 0, 0], tam: 0, log: [] })`. `list[i] = { id, n, r, sk, tr: [..], lv, xp, job: { kind, t, start, end, rate, seed } \| null, pack: [[fam, t, n]], last: { kind, t }, talk, st }`. `st`: stories heard |
| `S.kitchen` (new) | K12 | `registerState('kitchen', { v: 1, meal: null, pantry: {} })`. `meal = { k, t, end }` |
| `S.equip.rod` | R2-1 (Coast) | Reserved: added to `fresh().equip` with the Coast |
| `S.craft.jobs` | - | Stays in the save, unused (bench jobs are superseded; never delete a field) |

### 8.2 Old saves, step by step

1. Stations: untouched (Lv >= 1 already). `S.hearth.cold` = 0. The camp opens at zone 5 as today.
2. Tools: pick and sickle recipes move to the Workbench, gated on max(Woodcraft, Smithing): every
   recipe a save could make, it still can. Old tools gain the Rare find line and the Right tool
   bonus. Mastery starts at 1 for every kind. `gear()` keys that existed keep their values;
   `heroDps()` and `totalDps()` are identical.
3. Storehouse: 4.7.
4. Hands: open when the save has Hearth 2 and the Tavern (every warm save past zone 10). Tam
   arrives. Nothing else.
5. Kitchen: its plot opens at Hearth 3.
6. One "What's new" block: "Your stations were already built. Tools now have mastery. Your
   Storehouse is level N. Hands can be hired at the Tavern." (lines appear only for what is live).

### 8.3 Checks (tools/check.mjs, one section per task)

- **cold (H1):** a fresh save is cold; stations 0; Hearth 0; `canCraft` refuses with "Build the
  Workbench first."; `hearthLight()` with 8 Oak lights it; every fixture is warm with stations Lv 1.
- **tools (H2):** fixture dps and `gear()` old keys exact; pick/sickle recipes open at the same
  tiers as before on every fixture; right-tool speed x1.25; mastery XP counts at the cap.
- **store (H3):** `stashAdd` never raises a cell above its cap; a cell above the cap stays and
  gains nothing until it is spent below; migration picks the lowest level that holds every pile
  (Lv 1 on every fixture; a synthetic save with 12,000 Dim Essence gets Lv 8 and one over cell);
  HS8 static check; parcels wait (a bounty claim at the cap is refused and the bounty stays); skill
  XP counts at the cap; round trip keeps `S.store`.
- **hands (N1):** a shift pays the same haul online and through `awayGains`; the same seed gives
  the same haul; a Hand with a pack cannot be sent; beds cap hires; Tam arrives once.
- **kitchen (K12):** one meal at a time; the timer runs away; camp damage stays at most +15%.

---

## 9. Decisions for the coordinator to confirm

1. **Rough tools are the empty slot**, not items (Flint Hatchet, Stone Pick, Bone Sickle are how an
   empty slot is named and drawn). Keeps old saves exact and the bag clean.
2. **Tool mastery belongs to the tool kind**, not one item, so a better tool never resets it.
3. **Tools roll no affixes.** Three lines, rarity and mastery.
4. **"Right tool" is a +25% speed bonus**, not a tier gate (a gate would lock old saves out of nodes).
5. **All tools move to the Workbench**, gated on max(Woodcraft, Smithing).
6. **Flows stop, parcels wait, gifts always land.** Refunds and one-time rewards (Great Lantern,
   Codex milestones, achievements) may go above the cap. The strict reading of the owner's rule
   would make them wait too; I think a story reward that says "wait" feels bad.
7. **Salvage may throw away what does not fit**, but only after an in-page ask showing the numbers.
8. **Migration ignores the Hearth gate** and gives Lv 8 with over-cap cells if nothing holds a pile.
9. **Hands replace bench jobs.** The owner approved bench jobs on 2026-09-27; they were never built,
   and Hands are the owner's newer ask for the same need. Companions stay fighters and expedition
   teams. `CRAFT_JOBS` stays as inert data. Worth one line to the owner.
10. **Beds come from the Tavern** (1-5, +1 at Hearth 8), no upkeep, a free starter Hand (Tam).
11. **Applicants arrive every 8 hours, up to 3 waiting**, instead of a daily board, so there is no
    daily-login pressure.
12. **Hands skip home ground and work off-skill at half share.**
13. **The Spiced Broth adds +5% damage**, and K12 caps the camp's total at +15% (camp.md rule 4).
14. **The fishing rod covers fishing spots**; R2 decides whether Tide Pools (pearls) use it too.
    I recommend yes, so the Coast has one new tool, not two.
15. **Cold start = a save with no progress and no `S.camp` at load.** A player who opened an old
    build and never fought also gets the cold start (harmless).

---

## 10. Task split

Every task runs `node tools/build.mjs`, `node tools/check.mjs` and `node tools/perf.mjs --quick`,
adds its own named section to `check.mjs`, and commits on its branch. Per-tick work stays cheap:
caps are a lookup; Hands, meals and packs check once a second.

### Wave 2 (after D6 and D7; alongside F1-F4)

| Task | Work | Owns | Small edits in | Depends on |
|---|---|---|---|---|
| **H1** Hearth start and stations | Cold-start detection, `hearthLight()`, the intro stage state, Lv 1 station rows and plot-open rules (1.3), the station-built craft gate, the new `FEATURES` and `GUIDE_STEPS` (1.5), the warm What's-new line, `hearthNext()` for the sim; a minimal stage theme: the fire ring, unlit and lit, Hesketh, one oak, plot stakes | `src/js/55-hearth.js`, `src/js/63d-scenery-camp.js` | `57-camp.js` (a `first` Lv 1 cost/timer field on `CAMP_B` rows and `campCan` reading it; cold saves skip `openCamp`), `55-crafting.js` (one station-built line in `canCraft`), `55-onboard.js` (tables), `75-onboard-ui.js` (sentences, targets), `75-camp-ui.js` (the light button, plot cards), `63-scenery.js` (register the theme), `docs/design/onboarding.md` | G1, G2 |
| **H2** Tools and mastery | Workbench move and gate, Woodaxe noun, the find lines, right tool, rare finds (live and away), mastery state, XP, perks, the tool card with its bar, tier looks | `src/js/55-tools.js`, `src/js/75-tools-ui.js` | `21-data-craft.js` (`st`, noun, 3 stat rows, base `find` lines), `41-items.js` (legacy pick/axe lines add the find line), `55-crafting.js` (`stationLevel` rule for tools), `40-rules.js` (`nodeTime` reads `mod('gatherSpeed:' + skill)`), `11c-art-tools.js` (tier tints, rough looks) | G1 |
| **H3** Storehouse and caps | `STORE_TUNE`, `stashAdd`/`stashRoom`/`storeCap`, the 12 credit sites (4.6), flows, parcels, choices, gifts, Spillover, migration, pouch caps and full chips, prompts for salvage, bounties, expeditions; **sim** flags `--cold`, `--store`, `--tools` and HS1-HS8, HS13, HS15, HS16, HS18 | `src/js/55-store.js`, `src/js/75-store-ui.js`, `tools/sim.mjs` (wave 2 owner) | `57-camp.js` (`CAMP_B.store` row, `b.store` default, effect lines), `50-sim.js`, `55-gathering.js`, `57b-expeditions.js`, `55-bounties.js`, `55-almanac.js`, `56c-unlocks.js`, `51-actions.js`, `55-crafting.js` (one call each) | H1 (merge after), H2 (sim flags) |

Merge order: H2, H1, H3. H1 and H3 both add rows to `CAMP_B` (different keys). H3 merges last
because it touches the most shared files and owns the sim.

### Wave 3 (Hands and the living camp)

| Task | Work | Owns | Small edits in | Depends on |
|---|---|---|---|---|
| **N1** Hands core | Data (rarities, odds, pity, traits, callings, names, `HANDS_TUNE`), state, the board and arrivals, hire, let go, send, send again, shift pay through packs, levels, at-camp traits, `campClock()`, away lines, Next Up goals, Codex counters, Tam; **sim** `--hands`, `--report hands`, HS9-HS12, HS17 | `src/js/21f-data-hands.js`, `src/js/57f-hands.js`, `tools/sim.mjs` (wave 3 owner) | `57-camp.js` (Tavern bed lines), `55-onboard.js` (`hands` row), `57c-codex.js` (Camp page counters) | H3 |
| **N2** Hands art and camp life | The camp panorama with fixed plots and building stages, the fire, day and night, lanterns, Hands (townsfolk outfits on the B1 kit, tools in hand, packs), walks out and home, spots, talk bubbles, stories at the fire, reduced motion; about 90 talk lines and the stories | `src/js/12g-art-hands.js`, `src/js/14-art-camp.js`, `src/js/75-camp-scene.js`, `src/js/21g-hands-talk.js` | `75-camp-ui.js` (mount the scene on top), `63d-scenery-camp.js` (share the fire painter with H1's stage theme) | N1 (data shape), H1 |
| **N3** Hands UI | The Tavern's Job board, the Hands view (cards, send sheet with the suggested node, send again, pack and Empty the pack ask, let go ask), the away-card group | `src/js/75-hands-ui.js`, `src/styles/60-hands.css` | `74-ui-tavern.js` (mount point for the board) | N1 |
| **K12** Kitchen | `CAMP_B.kitchen`, meals, pantry, cook, eat, the timer (live and away), Hand effects, the camp damage cap, the Kitchen card, `--kitchen` policy hook for N1's sim | `src/js/57g-kitchen.js`, `src/js/75-kitchen-ui.js` | `57-camp.js` (row, default key), `55-onboard.js` (`kitchen` row) | N1 |

Parallel safety: N2 draws, N3 mounts, N1 owns the rules; they share only N1's read API. K12 reads
`S.hands` through N1's API. N1 owns `tools/sim.mjs` in wave 3; K12 gives it `cookMeal`/`eatMeal`.

---

## 11. Player-facing copy (starting lines)

| Where | Line |
|---|---|
| Cold start card | Old Hesketh's lamp has gone out. "Wood first. Then we talk." |
| Guide | Tap the tree to chop faster. / Tap the fire to light it. / The road is dark. Tap a foe to strike. |
| Lit | The fire catches. Hesketh: "Every road needs a place to come back to." |
| Plot tag | Workbench: 20 Oak |
| Craft gate | Build the Workbench first. |
| Tool chip | Stone Pick (rough) / Copper Pickaxe. Right tool: +25% speed |
| Mastery | Pickaxe mastery 7. 12 min to level 8. |
| Rare find | Rare find! +1 Iron Ore |
| Full | Storehouse full: Copper Ore. Mining XP still counts. [Switch] |
| Over cap | Over the cap. Spend below 600 to gather more. |
| Parcel | Back. Storehouse full: collect when you have room. |
| Salvage ask | Only 5 of 8 Copper Ore fit. Salvage anyway? |
| Board | An applicant is waiting at the Tavern. |
| Hand back | Tam is back from the Oak Grove: +470 Oak Log. |
| Pack waits | Tam's pack waits by the Storehouse. |
| Empty ask | Throw away 120 Oak Log? |
| Let go ask | Let Tam go? He leaves your camp for good. |
| Meal | Forager's Pie: gathering 8% faster for 4 hours. |
