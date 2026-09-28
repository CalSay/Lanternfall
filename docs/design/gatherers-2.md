# Gatherers 2.0: the named gatherers (N1b)

Status: design spec N1b, written 2026-09-28. It extends Hands as built by N1 (`21f-data-hands.js`,
`57f-hands.js`, hearth-and-hands.md 5) and fills in what gear-2.md leaves to N1b (gear-2 3.5 and 9.4 C4):
the roster, names, tempers, trees, recruit routes, caps, the Hunter and the refiner role. All numbers
are starting values for `tools/sim.mjs`. Ids and names are not.

Sources: plan-4.md 1, 4 and 5; build-map.md (N1b, N3, S4, BT1, WC1); hearth-and-hands.md 5, 7, 8, 10;
gear-2.md 1-3, 5.4, 8, 9; core-2.md 7 and 8; lore.md 1, 4, 7; regions-4-5.md 1.9 and 2.9; the wave log
to 2026-09-28 (region bosses are the Voice's shrouds, and each one's fall brings "a sight, a person, a
power"); the Hands code as it is today.

Owner rules this spec obeys:

1. **Two named gatherers per resource job, each with different benefits** (plan-4 1 and 5).
2. **Gatherers stay at camp.** They sleep in the Bunkhouse, walk out on a shift, come home with a pack
   (owner, 2026-09-28).
3. **Hands never level the Lanternbearer's own skills.** No skill XP, no tool mastery, no fight drops
   (owner, done in N1).
4. **There is a cap on gatherers, and it grows later** (owner; data-driven beds, done in N1).
5. **Production chains matter** (plan-4 4.4): secondary resources are ideal gatherer jobs, and
   gatherers can refine at stations.
6. **Upgrade trees per gatherer**: 3 branches x 4 nodes, paid with hours worked plus materials (plan-4 5).
7. **Material names wait for MAT1.** This file says "grade-4 ore", "Region 2 coal", never a new name.
8. **Saves:** until 1.0 the owner accepts a fresh start (CLAUDE.md, wave log). No heavy migration here.

Design rules of this spec:

1. **People, not loot.** Every gatherer is someone from the story with a reason to come to the fire.
   No random rolls for who arrives, no rarity, no gacha board.
2. **The pair is a choice.** Steady brings more units. Lucky brings finds. Both are worth a bed.
3. **Chains, not chores.** A gatherer's best work is feeding a chain: a secondary resource, a refining
   queue, or both. The Lanternbearer can still do all of it by hand.
4. **Shifts end.** A gatherer goes out for a set time and comes home (the owner's ask in
   hearth-and-hands.md). The tree can stretch a shift, never make it endless.
5. **Plain words.** "Nan is out at the grade-4 vein. Back in 2 h." Short sentences.

---

## 0. What exists today, and what changes

N1 built Hands as **random applicants**: one every 8 hours at the Tavern, a rarity roll with pity
(Common to Legendary), 1-2 random traits, a hire price in gold, 5 named Legendaries in the pool, Tam
free at the start, the Hollises as an off data hook. They live in the Bunkhouse (1-5 beds, +1 at
Hearth 8, 6 at most), work one node for a fixed shift at 10-25% of the Lanternbearer's rate, and unload
a pack into the Storehouse. Levels 1-20 by hours worked.

| Today (N1) | Gatherers 2.0 (this spec) |
|---|---|
| Random applicants, rarity, pity, gold price | A fixed roster of **18 named gatherers** (22 by Region 5), each with a recruit route. Free |
| Skill: Mining, Woodcutting or Foraging | A **job** (9 jobs, section 1). Full share on the job's nodes |
| 1-2 random traits; Legendaries have a calling | A **temper** (Steady or Lucky, section 2) and a **signature** of their own (section 3) |
| No growth beyond +0.25% share a level | Levels, plus a **tree**: 3 branches x 4 nodes (section 4) |
| Beds cap how many you hire; Let go loses them | Beds cap the **crew** who work. Everyone else **lodges** at the Tavern and can swap in (section 6) |
| Gather only | Gather, **hunt** (hide from cleared zones) or **refine** at a station (sections 1 and 7) |

What stays exactly as built: the shift model (length, rate and seed fixed at send, so offline pays the
same as online), packs as Storehouse parcels, levels by hours, stories at the fire at Lv 5/10/15/20,
`campClock()`, the at-camp spots, the away lines, the Bunkhouse and its data-driven beds, and the
`handBeds` / `handBedsMax` bonus keys. The 16 random traits stay in the data for any old random Hand; the
tree reuses several of them as node effects (Keen Eye, Lucky, Night Owl, Storyteller, Cook).

---

## 1. The nine jobs

Confirmed against gear-2.md 3.5 and plan-4 5: Miner, Coal-digger, Woodcutter, **Hunter**, Herbalist,
Weaver-gatherer, Salter, Fisher and Gem-seeker. **Refiner is a role, not a job**: any gatherer can take a
shift at a station instead of a node.

| Job (`job`) | Skill (for the rate) | Works | Brings | Its chain (own-chain x1.5 as a refiner) | Opens |
|---|---|---|---|---|---|
| **Miner** `miner` | Mining | Ore veins, crystal geodes | Ore, Crystal | Smelting (the Forge's Smelter) | Region 1 (Hands open, zone 10) |
| **Coal-digger** `coal` | Mining | Coal seams (one a region) | Coal of that region | Smelting | Region 2 |
| **Woodcutter** `wood` | Woodcutting | Groves | Logs | Sawing (the Workbench's Saw) | Region 1 |
| **Hunter** `hunter` | none (see 1.1) | A lit zone the party has cleared | Hide of the zone's grade | Tanning (the Tannery) | Region 1, at its boss (5) |
| **Herbalist** `herb` | Foraging | Herb beds | Herbs | Distilling (the Still) | Region 1 |
| **Weaver-gatherer** `weaver` | Foraging | Fibre patches; dye plants from Region 2 | Fibre, Dye | Weaving (the Loom) | Region 1 (dye from Region 2) |
| **Salter** `salter` | Foraging | Salt pans (and the later regions' rime and stone) | Salt of that region | Tanning | Region 2 |
| **Fisher** `fisher` | Fishing (R2) | Fishing spots | Fish (R2 owns the family) | none: the Kitchen instead (4.3) | Region 2 |
| **Gem-seeker** `gem` | the node's skill | A region's buff-item node (gear-2 5.4) | Buff items (rolls, not units) | none: the Enchanter's Table instead (4.3) | Region 2 |

- **Full share on the job's own nodes, half share on any other gathering node** (N1's off-skill rule,
  `HANDS_TUNE.offSkill` 0.5, keyed on the job's families instead of the skill). A Hunter, Gem-seeker or
  refiner has no off-job gathering: they gather at half share like anyone else if sent to a node.
- **Hide and Fishing:** the Lanternbearer never hunts (gear-2 O13). Fishing is the Lanternbearer's too
  (R2); the Fisher works it at a share like any node.
- `HANDS_SKILLS` gains `fish` with the Coast (the comment in `21f-data-hands.js` already says so).

### 1.1 The Hunter

- **Where:** any zone the party has cleared (`z <= S.maxZone - 1`, and its region reached). The send
  sheet lists the zones whose foes drop hide as a signature (beasts) first.
- **Rate:** `share x huntRef(g) x temper x tree`, with `huntRef(g) = 0.5 x handsHeroRate(best node of
  grade g the Lanternbearer has open, any family)` (gear-2 3.5). g = `zoneGrade(z)` (`zoneTier` before
  S4). **+25%** in a beast zone.
- **Brings:** Hide of grade g, into the pack as usual. No essence, no gold, no fight drops, no kills
  counted anywhere (no bestiary, no bounties, no achievements' kill tracks). A Hunter is a trapper, not a
  fighter.
- **Before S4:** hide grades 1-5 exist today, so the Hunter can ship with N3 on today's tiers.

### 1.2 The refiner role

As gear-2 3.3 and 3.5, with named shares:

- A refiner takes a **shift at a station** instead of a node: the Smelter, the Saw, the Loom, the
  Tannery or the Still (S4 builds the stations and queues). At most **2 refiners a station**.
- While the shift runs, the station's speed gains `+2.5 x share` (a Lv 1 gatherer at 12%: +30%), **x1.5 on
  the gatherer's own chain** (the table above), more with the tree (4.3).
- **No pack and no haul:** the queue is the pay. Hours worked count for levels as on any shift.
- **Refining XP** stays the order's: the Lanternbearer placed it and paid the inputs, and each unit pays
  its XP once (gear-2 3.3). A refiner changes *when* units land, never how many, so a Hand never adds
  skill XP (owner rule 3).
- A refiner at an empty queue idles (the card says "Waiting for an order at the Smelter"). The shift still
  ends on time. The **Standing order** node (4.3) keeps the queue fed.

### 1.3 The Gem-seeker

- Works the buff-item node of any region reached (Tide Pools on the Coast, Glass seams in the Emberwaste,
  and the later regions' nodes, gear-2 5.4).
- **Finds:** one roll every 10 minutes of shift at `20% x share x 2` (gear-2 5.4): 4.8% at Lv 1. Rarity
  from the node's table. Buff items go into the pack as a line and unload into the Storehouse's Buff Items
  page (uncapped counts, so they never wait).
- Also brings a trickle of the node's raw family at half share if the node has one (R2 decides for Tide
  Pools).

### 1.4 Regions 4 and 5: one more pair each

LORE-R45 proposed a pair for the Pale Reach's Starfall fields and one for Region 5's deep glass
(regions-4-5.md 1.9, 2.9). They join the **Gem-seeker** job as **region pairs**: full finds anywhere, +25%
finds at their own region's node. That makes **22 by Region 5**, as plan-4 5 expects. Their names below
are LORE-R45's working names; the R4 and R5 specs keep or replace them (Region 5 is being reworked in
LORE-R45b).

---

## 2. Temper: Steady and Lucky

Every gatherer has one temper. Each job has one of each.

| | **Steady** | **Lucky** |
|---|---|---|
| In a line | Brings more, every time | Brings less often, but brings something special |
| Units | **+15% yield** | +0% |
| Tier-up finds (N1's Keen Eye rule) | none | **3%** of units come back one grade up (capped at the highest grade open) |
| Trophies | none | **3%** a shift: 1 Trophy of a random type |
| Buff items (not Gem-seekers) | none | **5% a roll** (owner: finder perks about +5%), one roll every **2 hours** of shift at a node of the current region's grades (gear-2 5.4) |
| Buff items (Gem-seekers) | rolls every **8 min** instead of 10 | **+5% a roll** (owner), on top of the job's rate |

- **Value parity (sim target GT7):** over a day of shifts, a Steady's extra units and a Lucky's finds
  should be worth the same within 15%, with finds valued at their gold-equivalent (a grade-up unit at 1.65
  units, a Trophy at 10 minutes of the Lanternbearer's gold, a buff item at its trade-town price, gear-2 7).
- The temper shows as a chip on the card: **Steady** (a filled sack icon) or **Lucky** (a four-leaf
  icon). The tree's first branch follows the temper (4.2).

---

## 3. The eighteen

The existing named Hands (Tam, the five Legendaries, the Hollises) all keep their names and stories and
take a job. Ten are new. One-liners are in the lore's voice (lore.md 1 and 7.2: ordinary, practical, a bit
tired, glad of the fire). The signature is what makes each one different from the other of the pair;
"Signature+" is its upgrade at the end of the temper branch (4.2).

### 3.1 The roster

| # | Key | Name | Job | Temper | Who they are | Signature | Signature+ (tree A4) |
|---|---|---|---|---|---|---|---|
| 1 | `tam` | **Tam** | Woodcutter | Steady | Hesketh's nephew. He heard about the fire from his uncle. | **Woodpile:** +25% yield when the next camp build is short of his wood | +40%, and it counts any craft the Next Up card names too |
| 2 | `bracken` | **Old Bracken** | Woodcutter | Lucky | Felled the Hollow woods with Bram's father. Still hums the felling songs. | **Felling Song:** other Woodcutters out at the same time get +15% | **Heartwood:** his grade-up finds rise from 3% to 6% |
| 3 | `nan` | **Nan Tarrow** | Miner | Steady | Worked the quarry before the dark. Grenna knows her. | **Deep Seam:** +25% yield on the highest grade her job has open | +40%, on the two highest grades |
| 4 | `rook` | **Rook** | Miner | Lucky | Crawled the quarry's cracks for ten years. Came up with his pockets full. | **Pockets:** at an ore vein he also brings Crystal of that grade, 10% of the haul | 20%, and his Crystal lines roll for the region's buff item once an hour |
| 5 | `fennel` | **Sister Fennel** | Herbalist | Steady | Kept the herb garden at Elowen's chapel. Still keeps it, in pots. | **Physic Garden:** while she is on the crew, Tonics last 25% longer | 50% longer |
| 6 | `ashby` | **Mother Ashby** | Herbalist | Lucky | From Emberlea. She keeps a place at the table for Caedmon. | **Hearth Cook:** counts as a Cook while out too; meals +10% (as N1) | meals +20%; each shift 5% chance of a free meal's ingredients (K12) |
| 7 | `loy` | **Gammer Loy** | Weaver-gatherer | Steady | Spun in the dark by feel. "The dark is no excuse for a loose thread." | **Tight Weave:** from Region 2, her fibre shifts also bring the region's Dye, 15% of the haul | 30% |
| 8 | `dorrie` | **Dorrie Fitch** | Weaver-gatherer | Lucky | A pedlar who walked the dark roads selling thread to anyone still behind a door. | **Pedlar's Bolt:** each shift 4% chance of a bolt: 20 Cloth of the node's grade (before Region 2: 40 Fibre one grade up) | 8% |
| 9 | `gil` | **Gil Rushby** | Hunter | Steady | A marsh trapper. He lived on a reed island with one shaded lamp. | **Dresses the Hide:** from Region 2, 20% of his hide comes home as Leather (2 hide to 1, no salt) | 35% |
| 10 | `jory` | **Jory Quickhands** | Hunter | Lucky | He lived by his wits in the dark. He will not say how. | **Light Fingers:** his Trophy chance is 6% a shift, not 3% | 10%, and the Trophy is the type your next +8 to +10 upgrade needs |
| 11 | `ned` | **Ned Culver** | Coal-digger | Steady | Picks sea coal off the Grey Shingle. He has not missed a low tide in ten years. | **Full Scuttle:** +50% coal while the Smelter has an order running | +75% |
| 12 | `brannoc` | **Brannoc** | Coal-digger | Lucky | A kiln-hand from the Emberwaste. He kept the Kilns' last fire banked, not burning, so the dark walked past. | **Glass in the Coal:** his coal shifts roll for the region's buff item at half a Gem-seeker's rate | at a full Gem-seeker's rate |
| 13 | `ada` | **Ada Hollis** | Salter | Steady | Bram's wife. She followed his marks home. Salt kept them fed on the coast. | **Brine Vats:** refining at the Tannery, her own-chain bonus is x2, not x1.5 | x2.5, and Tannery orders take 10% less salt while she works there |
| 14 | `morrow` | **Morrow** | Salter | Lucky | Rakes the salt pans at the far edge, where nobody else will go at low tide. | **Tide-wrack:** each shift 10% chance of one Coast find: a Trophy, 25 Fish, or a Common buff item | 20% |
| 15 | `quill` | **Quill** | Fisher | Steady | Fishes from the drowned village's bell tower. He says the fish there are used to bells. | **Early Tide:** +30% fish on shifts sent 05:00-11:00, +10% at other times | +45% / +15% |
| 16 | `pell` | **Pell Hollis** | Fisher | Lucky | Bram's boy. Not small any more. | **Bram's Boy:** +15% yield while Bram is in the party; his fishing rolls for the region's buff item +5% more | 10% of his buff finds come one rarity higher |
| 17 | `oona` | **Oona** | Gem-seeker | Steady | Dives the Tide Pools. She holds her breath longer than anyone and will not say where she learned. | **Long Breath:** her rolls come every 6 min (Steady's 8) | every 5 min |
| 18 | `sparrow` | **Sparrow** | Gem-seeker | Lucky | A glass-picker from the Emberwaste flats. Reads cracks in the ground like a map. | **Reads the Cracks:** 20% of her finds come one rarity higher | 35% |

The region pairs (1.4; names from LORE-R45, for the R4 and R5 specs to keep or replace):

| # | Key | Name | Job | Temper | Who | Signature |
|---|---|---|---|---|---|---|
| 19 | `fenn` | Fenn | Gem-seeker (Region 4) | Steady | A survivor of the Silent Village. Knows the Starfall fields better than any outsider. | +25% finds at the Region 4 node (all region pairs); rolls every 6 min |
| 20 | `wick` | Wick | Gem-seeker (Region 4) | Lucky | Fenn's neighbour. Named for a candle, and lucky like one that will not blow out. | +25% at home; 20% of finds one rarity higher |
| 21 | `corrin` | Old Corrin | Gem-seeker (Region 5) | Steady | A retired Deepwell miner. Came this far down because nobody else would. | +25% at home; rolls every 6 min |
| 22 | `sable` | Sable | Gem-seeker (Region 5) | Lucky | Found a way down that nobody else had. | +25% at home; 20% of finds one rarity higher |

### 3.2 Why these pairs

- **Every pair differs on two axes:** the temper (more units vs finds) and a signature that pulls the
  player a different way. Tam wants you building; Bracken wants other Woodcutters out. Nan wants the top
  grade; Rook wants you short of Crystal. Ned wants the Smelter running; Brannoc wants the region's buff
  items. Ada wants to refine; Morrow wants to wander.
- **Three signatures feed chains directly** (Loy's dye, Gil's leather, Ada's tanning), two feed the
  Smelter (Ned, and any Miner as a refiner), and three feed buff items (Brannoc, Pell, the Gem-seekers).
- **Old names, new jobs.** Jory was "any skill" in N1; as a poacher-Hunter his "will not say how" has a
  job. Mother Ashby stays the Hearth Cook as a Herbalist. The Hollises (N1's `HANDS_LATER`) arrive
  together, as plan-4 says, but work two jobs: Ada salts, Pell fishes.

---

## 4. Levels and trees

### 4.1 Levels and points

- Levels 1-20 by hours worked, as N1: `2 x lv` hours to the next level (380 hours to Lv 20).
- **Share** = 12% at Lv 1, **+0.4% a level** (19.6% at Lv 20). One flat table for everyone: no rarity.
  (N1's `share` by rarity stays for old random Hands.)
- **Tree points:** one at **Lv 3, 5, 7, 9, 11, 14, 17 and 20**: 8 points for 12 nodes, so a gatherer at
  Lv 20 fills two branches, or spreads.
- **Rows open by level:** row 1 at Lv 3, row 2 at Lv 7, row 3 at Lv 11, row 4 (the capstones) at Lv 17,
  and a capstone needs the 3 nodes above it.
- **Teaching a node costs materials, once** (4.4). A taught node stays taught for good.
- **Free respec at camp:** move points between *taught* nodes at no cost while the gatherer is at camp.
  Teaching a new node still costs its materials. So trying a build is cheap, and a full collection of
  taught nodes is a long-term sink.

### 4.2 Branch A: the Trade (follows the temper)

| Row | Steady | Lucky |
|---|---|---|
| A1 | **Good Swing:** +5% yield | **Sharp Eye:** grade-up finds +1.5% (3% to 4.5%) |
| A2 | **Full Pack:** +5% yield | **Lucky Bag:** +2.5% a buff-item roll |
| A3 | **Top Seam:** +5% yield on the highest grade the job has open | **Trophy Nose:** Trophy chance +3% a shift; +2.5% a buff-item roll |
| A4 | **Signature+** (3.1) | **Signature+** (3.1) |

A Lucky's tree adds at most +5% a roll (A2 + A3), the "up to +5% more" of gear-2 5.4. Gem-seekers read
"+2.5% a roll" as their own find chance.

### 4.3 Branch B: the Road, and Branch C: the Hearth (every gatherer)

| Row | B: the Road (shifts and packs) | C: the Hearth (chains and camp) |
|---|---|---|
| 1 | **Long Legs:** +30 min a shift | **Handy:** +25% of this gatherer's refining speed |
| 2 | **Second Wind:** home with a pack that unloads in full, they rest 30 min and go out once more to the same place, by themselves (8) | **Standing Order:** while this gatherer refines at a station, the station re-places its last order when the queue empties, if the Storehouse has the inputs |
| 3 | **Big Pack:** +10% haul; a pack that does not fit unloads what fits and waits with the rest (instead of each line all-or-nothing) | **At Camp** (the job's camp perk, below). Works while they are at camp; the best of a kind counts, no stacking |
| 4 | **Tireless:** +1 h a shift, and Second Wind fires twice | **Master of the Station:** own-chain bonus x2 (not x1.5; Ada: x3), and the Standing Order runs while they are out on a node shift too |

**Row C3, At Camp, by job:**

| Job | At Camp | Effect |
|---|---|---|
| Miner | Stonework | Storehouse cap +3% on Ore and Crystal |
| Coal-digger | Banks the Fire | +2% away gains (as N1's Storyteller; best one counts) |
| Woodcutter | Stacks the Woodpile | Camp builds 5% faster |
| Hunter | Tells Tracks | Expeditions bring +5% Hide |
| Herbalist | Poultices | The party's Rested meter fills 10% faster at the Hearth (core-2 change log: fatigue is Rested) |
| Weaver-gatherer | Mends | Storehouse cap +3% on Fibre and Cloth |
| Salter | Salts the Stores | Storehouse cap +3% on Hide and Leather |
| Fisher | Fish Supper | Meals last 10% longer (as N1's Cook; best one counts) |
| Gem-seeker | Loupe | Tuning a buff item costs 25% less (gear-2 4.2) |

**Fisher and Gem-seeker have no chain.** Their C1, C2 and C4 read:

| Row | Fisher (the Kitchen) | Gem-seeker (the Enchanter's Table) |
|---|---|---|
| C1 | **Gutting Knife:** +10% fish | **Cutter:** Salvage Runes cost 15% less |
| C2 | **Fresh Catch:** each shift's fish also counts as one meal's fish in the Kitchen (K12's pantry) | **Appraiser:** 10% of Common finds come as Uncommon |
| C4 | **Kitchen Hand:** meals cost 25% less to cook | **Setter:** Salvage Runes cost 30% less, and Take out keeps the buff item 10% of the time without a rune |

### 4.4 What teaching costs

A node's cost is in the gatherer's own job family, at the **highest grade the job has open** (a Coal-digger
pays in the current region's Coal). Rows 3 and 4 ask for the chain's refined goods, so chains matter to the
trees too.

| Row | Cost (grade g = the job's highest open) |
|---|---|
| 1 | 150 raw of the job's family, grade g |
| 2 | 400 raw, grade g |
| 3 | 80 of the job's refined goods, grade max(g, 4): Miner and Coal-digger Ingots, Woodcutter Planks, Hunter and Salter Leather, Weaver-gatherer Cloth, Herbalist Tinctures (Herbs x3 if the Still is cut, gear-2 O6), Fisher Planks (a boat), Gem-seeker Ingots (tools) |
| 4 | 200 refined, grade max(g, 4), and 1 Trophy of any type |

- Row 3 therefore opens for real in Region 2 (refined goods start at grade 4). A Region 1 gatherer reaches
  Lv 11 at about day 5-9 and meets the chains at the same time as the Lanternbearer. The card says:
  "Needs Ingots. The Smelter opens when the Great Lantern of the Hollow burns."
- Every cost fits Storehouse Lv H at the Hearth H a player has when that row opens (HS8 extends to trees).
- Numbers are `GATHER_TUNE.teach` for the sim to tune.

---

## 5. Recruit routes

Nobody is hired. **Word travels** that the fire holds, and each person comes when their reason comes
true. A route is a cheap probe the core checks once a second (like N1's `HANDS_LATER.when`). When it holds,
the person **arrives at the fire** (a camp card and a toast: "Nan Tarrow has come to the fire."). If a bed
is free they join the crew; if not, they lodge at the Tavern (6).

### 5.1 Kinds of route

| Kind | What it means | Example |
|---|---|---|
| **Camp** | A building reaches a level | The Kitchen is built: Mother Ashby smells the bread |
| **Region** | Progress in a region: a zone reached, an elder type beaten, a node opened | The quarry's elder falls: Nan comes up out of the tunnels |
| **Milestone** | A region boss falls and its shroud lifts. **The person** of the owner's "sight, person, power" | The Hollow's boss: Gil walks out of the marsh |
| **Hero** | A hero is recruited or finishes their quest (HQ1) | Elowen's quest: Sister Fennel comes with the chapel's pots |
| **Rumour** | The Tavern tells you where someone is; you do one small thing | "There's a lad still in the quarry cracks." Mine grade-2 ore for 20 min |
| **Event** | A random event (EV1) that waits for you; tap it | "A pedlar at the gate." |

Events and rumours **wait** (no FOMO, plan-4 6.7). A route never needs a hero to be *fielded*, only
recruited (lore.md's Hollises rule). Every Hero, Rumour and Event route has a **fallback** that fires on
region progress, so a player who skips a quest still meets everyone by the region's boss.

### 5.2 Who comes when

| # | Name | Route | Trigger (the probe) | Fallback | Expected (normal play) |
|---|---|---|---|---|---|
| 1 | Tam | Camp | Hands open (Hearth 2, the Tavern and the Bunkhouse built), as N1 | - | about 1 h (zone 10) |
| 7 | Gammer Loy | Camp | The Loom reaches Lv 2, with Hands open | zone 15 | hour 2-4 |
| 3 | Nan Tarrow | Region | The first kill of a quarry elder (the Quarry Golem type) | zone 25 | day 1 |
| 2 | Old Bracken | Hero | Bram recruited ("I felled trees with your father, boy.") | zone 25 | day 1-2 |
| 4 | Rook | Rumour | Nan at camp; the Tavern rumour; then 20 min of the Lanternbearer's mining at any grade-2 ore vein ("He follows the sound of your pick.") | zone 30 | day 2-3 |
| 6 | Mother Ashby | Camp | The Kitchen built (Hearth 3) | - | day 1 (zone 14) |
| 5 | Sister Fennel | Hero | Elowen's quest done (zone 28's chapel) | zone 30 | day 2-4 |
| 8 | Dorrie Fitch | Event | EV1's "A pedlar at the gate" (before EV1 lands: a Tavern Lv 2 rumour) | zone 32 | day 2-4 |
| 9 | Gil Rushby | **Milestone** | The Hollow's region boss falls (zone 35): "The green lights go out over the marsh. A trapper walks out of the reeds." | - | day 5-8 |
| 10 | Jory Quickhands | Event | After Gil's 3rd shift: "A hare hangs on the Storehouse door. Nobody saw who left it." Tap it | Coast zone 40 | day 6-9 |
| 11 | Ned Culver | Region | The Coast reached (Great Lantern of the Hollow lit). He carries the Coast arrival gift (gear-2 3.2): "Ned brought 50 sea coal. He says he has more." | - | day 6-8 |
| 15 | Quill | Region | Fishing opens on the Coast (R2 sets the zone) | - | day 7-9 |
| 17 | Oona | Region | Tide Pools open (R2) | - | day 8-12 |
| 14 | Morrow | Region | The Lanternbearer's first gather at a salt pan: "Someone is already there, raking." | Coast zone 45 | day 7-10 |
| 13, 16 | Ada and Pell Hollis | **Milestone** + Hero | The Coast's region boss falls **and** Bram is recruited (lore.md 7.2; either order) | - | day 21-35 |
| 18 | Sparrow | Region | The Emberwaste reached (zone 71) | - | about day 30 |
| 12 | Brannoc | **Milestone** | The Emberwaste's region boss (the Pyre Knight) falls: "The Kilns go dark for the first time in ten years. Someone kept them banked." | - | day 40-55 |
| 19, 20 | Fenn, Wick | Region, **Milestone** | Wick when the Starfall fields open; Fenn when the Region 4 boss falls (R4 spec) | - | day 48-72 |
| 21, 22 | Old Corrin, Sable | Region | Region 5's node opens; the second at its middle (R5 spec) | - | day 65-80 |

- **Every region boss brings a person** (the wave log's milestone rule): the Hollow Gil, the Coast the
  Hollises, the Emberwaste Brannoc, the Pale Reach Fenn. Region 5's end is the Voice, not a shroud; its
  pair comes on region progress.
- **Every secondary resource has a gatherer early in Region 2:** Ned (coal) on arrival, Morrow (salt) at
  the first salt pan, Gammer Loy (dye, since Region 1). The Hunter comes one step before the Tannery opens.
- Arrival lines and fire stories are LORE work (13): 22 arrival lines, 4 stories each.

### 5.3 The Tavern board

The Tavern's Job board becomes **Word on the Road**: every gatherer as a card in three states.

| State | Card shows |
|---|---|
| Met | Portrait, name, job, temper. "At camp" / "Lodging here" |
| On the way (route started or a rumour open) | Portrait in shadow, name, job, the one thing to do ("Mine at a grade-2 vein: 12 of 20 min") |
| Not yet | A silhouette and the job. A hint in the lore's voice: "Someone in the marsh keeps a shaded lamp." |

No random applicants, no gold price, no Turn away. Pity counters stay in the save, unused.

---

## 6. Caps: the crew and the lodgers

The owner wants a cap on gatherers that grows. Losing a named person to a cap would feel bad, so the cap
is on **who works**, not on who you have met.

- **Crew:** gatherers with a **bed** in the Bunkhouse. Only the crew goes on shifts, hunts or refines, and
  only the crew gives at-camp perks.
- **Lodgers:** everyone else you have met. They lodge at the Tavern (still Hollow's Rest, still at camp),
  sit at the fire at night, talk, and tell stories. They do not work and do not level.
- **Swap:** any crew member at camp (not out, no pack waiting) can trade places with a lodger. Free,
  instant. The Bunkhouse view has one **Swap** button per bed.
- N1's **Let go** becomes **Send to lodge** for named gatherers (nobody leaves for good). Old random Hands
  keep N1's Let go.

### 6.1 How the cap grows

| Source | Beds | When (normal play) |
|---|---|---|
| Bunkhouse Lv 1-5 (N1, done) | 1, 2, 3, 4, 5 | zone 10 to about day 10 |
| Hearth 8, the Lantern Hall (N1, done) | +1 | week 1-2 |
| **Bunkhouse Lv 6** (new row; the Coast reached) | +1 | Region 2 |
| **Bunkhouse Lv 7** (Emberwaste reached) | +1 | Region 3 |
| **Bunkhouse Lv 8** (Pale Reach reached) | +1 | Region 4 |
| **The Bunkhouse tree's capstone** (BT1: "Bunk beds") | +1 | Region 3-4 |
| **Cap** (`bedMax`, raised from 6) | **10** | Region 5 |

| When | Beds (crew) | Met (roster) |
|---|---|---|
| End of Region 1 (day 5-8) | 3-4 | 9-10 |
| End of Region 2 (day 21-35) | 6-7 | 16 |
| End of Region 3 | 8 | 18 |
| Region 5 | 10 | 22 |

So the choice is real at every stage: about half the people you have met can work. The rows are
`HANDS_TUNE.beds` (extended to 8 levels) and `bedMax: 10`; WC1/BT1 own the Bunkhouse's costs, region gates
and tree.

---
