# Gatherers 2.0: the named gatherers (N1b)

Status: design spec N1b, written 2026-09-28. It extends Hands as built by N1 (`21f-data-hands.js`,
`57f-hands.js`, hearth-and-hands.md 5) and fills in what gear-2.md leaves to N1b (gear-2 3.5 and 9.4 C4):
the roster, names, tempers, trees, recruit routes, caps, the Hunter and the refiner role. All numbers
are starting values for `tools/sim.mjs`. Ids and names are not.

**Revised by ECON1 / N1c (2026-09-28).** The owner overrode D1 and D2 (section 14): gatherers are **hired for
gold** from the Tavern's applicant board, **with rarity**; the named gatherers are special applicants their
routes put on the board; each **shift costs a fee** by grade (no daily wage); the cap is the number of
**Tents** (2 at the start, about 10 by Region 5); there are no beds, lodgers or swaps. Prices, fees and Tents
live in docs/design/economy-2.md (sections 4 and 5), which wins where the two disagree. Sections changed by
this revision are marked **Changed (ECON1)**; the rest stands.

Sources: plan-4.md 1, 4 and 5; build-map.md (N1b, N3, S4, BT1, WC1); hearth-and-hands.md 5, 7, 8, 10;
gear-2.md 1-3, 5.4, 8, 9; core-2.md 7 and 8; lore.md 1, 4, 7; regions-4-5.md 1.9 and 2.9; the wave log
to 2026-09-28 (region bosses are the Voice's shrouds, and each one's fall brings "a sight, a person, a
power"); the Hands code as it is today.

Owner rules this spec obeys:

1. **Two named gatherers per resource job, each with different benefits** (plan-4 1 and 5).
2. **Gatherers stay at camp.** They sleep in their Tent, walk out on a shift, come home with a pack
   (owner, 2026-09-28). **Changed (ECON1):** Tents, not the Bunkhouse. They are visible in camp; tapping one
   opens a talk panel with **Send on a job**, limited to their profession.
3. **Hands never level the Lanternbearer's own skills.** No skill XP, no tool mastery, no fight drops
   (owner, done in N1).
4. **There is a cap on gatherers, and it grows later.** **Changed (ECON1):** the cap is the number of Tents
   in camp: 2 at the start, built with gold and materials, about 10 by Region 5.
5. **Production chains matter** (plan-4 4.4): secondary resources are ideal gatherer jobs, and
   gatherers can refine at stations.
6. **Upgrade trees per gatherer**: 3 branches x 4 nodes, paid with hours worked plus materials (plan-4 5).
7. **Material names wait for MAT1.** This file says "grade-4 ore", "Region 2 coal", never a new name.
8. **Saves:** until 1.0 the owner accepts a fresh start (CLAUDE.md, wave log). No heavy migration here.
9. **Added (ECON1): hired with rarity.** The Tavern's board keeps N1's rarity (Common to Legendary), odds and
   pity. Named gatherers are special applicants put on the board by their routes, and hired for gold. Hire is
   a one-off fee.
10. **Added (ECON1): no wage, a fee a shift.** Sending a gatherer costs a fixed fee set by the grade; a higher
    level charges a little more and brings more. Unpaid means they cannot be sent. Nobody leaves or loses levels.

Design rules of this spec:

1. **People, and a board.** **Changed (ECON1):** the 18 named gatherers are people from the story with a
   reason to come to the fire; they are the board's **Legendaries**, and they wait for you. Random
   townsfolk fill the other spots, Common to Epic, with N1's odds and pity.
2. **The pair is a choice.** Steady brings more units. Lucky brings finds. Both are worth a Tent.
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
| Random applicants, rarity, pity, gold price | **Changed (ECON1):** random applicants Common to Epic (odds, pity) **plus** the **18 named gatherers** (22 by Region 5) as Legendary star spots their routes put on the board. All hired for a one-off fee (economy-2 4.1); Tam free |
| Skill: Mining, Woodcutting or Foraging | A **job** (9 jobs, section 1). Full share on the job's nodes |
| 1-2 random traits; Legendaries have a calling | A **temper** (Steady or Lucky, section 2) and a **signature** of their own (section 3) |
| No growth beyond +0.25% share a level | Levels (share x1.57 by Lv 20), plus a **tree**: 3 branches x 4 nodes (section 4) |
| Beds cap how many you hire; Let go loses them | **Changed (ECON1):** **Tents** cap how many you hire (2 at the start, 10 by Region 5). A named gatherer let go returns to the board with their level; a random one leaves (section 6) |
| Shifts are free | **Changed (ECON1):** each shift costs a fee by grade and level, paid at send; 1-2 shifts can be queued (3 with Second Wind) (section 8) |
| Gather only | Gather, **hunt** (hide from cleared zones) or **refine** at a station (sections 1 and 7) |

What stays exactly as built: the shift model (length, rate and seed fixed at send, so offline pays the
same as online), packs as Storehouse parcels, levels by hours, stories at the fire at Lv 5/10/15/20,
`campClock()`, the at-camp spots, the away lines, the applicant board with its odds and pity (**Changed
(ECON1):** kept, not removed), and the `handBeds` / `handBedsMax` bonus keys (now extra gatherer slots on top
of Tents). The Bunkhouse retires: its beds become Tents (economy-2 5). The 16 random traits stay in the data for any old random Hand; the
tree reuses several of them as node effects (Keen Eye, Lucky, Night Owl, Storyteller, Cook).

---

## 1. The nine jobs

Confirmed against gear-2.md 3.5 and plan-4 5: Miner, Coal-digger, Woodcutter, **Hunter**, Herbalist,
Weaver-gatherer, Salter, Fisher and Seeker. **Refiner is a role, not a job**: any gatherer can take a
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
| **Seeker** `gem` | the node's skill | A region's buff-item node (gear-2 5.4) | Buff items (rolls, not units) | none: the Enchanter's Table instead (4.3) | Region 2 |

- **Full share on the job's own nodes, half share on any other gathering node** (N1's off-skill rule,
  `HANDS_TUNE.offSkill` 0.5, keyed on the job's families instead of the skill). A Hunter, Seeker or
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

### 1.3 The Seeker

- Works the buff-item node of any region reached (Tide Pools on the Coast, Glass seams in the Emberwaste,
  and the later regions' nodes, gear-2 5.4).
- **Finds:** one roll every 10 minutes of shift at `20% x share x 2` (gear-2 5.4): 4.8% at Lv 1. Rarity
  from the node's table. Buff items go into the pack as a line and unload into the Storehouse's Buff Items
  page (uncapped counts, so they never wait).
- Also brings a trickle of the node's raw family at half share if the node has one (R2 decides for Tide
  Pools).

### 1.4 Regions 4 and 5: one more pair each

LORE-R45 proposed a pair for the Pale Reach's Starfall fields and one for Region 5's deep glass
(regions-4-5.md 1.9, 2.9). They join the **Seeker** job as **region pairs**: full finds anywhere, +25%
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
take a job. Ten are new. **Changed (ECON1):** every named gatherer is **Legendary** on the board and is hired
for the Legendary fee of the region you have reached (economy-2 4.1: 20,000 in Region 1, 68,000 in Region 2);
Tam is free. One-liners are in the lore's voice (lore.md 1 and 7.2: ordinary, practical, a bit
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
| 12 | `brannoc` | **Brannoc** | Coal-digger | Lucky | A kiln-hand from the Emberwaste. He kept the Kilns' last fire banked, not burning, so the dark walked past. | **Glass in the Coal:** his coal shifts roll for the region's buff item at half a Seeker's rate | at a full Seeker's rate |
| 13 | `ada` | **Ada Hollis** | Salter | Steady | Bram's wife. She followed his marks home. Salt kept them fed on the coast. | **Brine Vats:** refining at the Tannery, her own-chain bonus is x2, not x1.5 | x2.5, and Tannery orders take 10% less salt while she works there |
| 14 | `morrow` | **Morrow** | Salter | Lucky | Rakes the salt pans at the far edge, where nobody else will go at low tide. | **Tide-wrack:** each shift 10% chance of one Coast find: a Trophy, 25 Fish, or a Common buff item | 20% |
| 15 | `quill` | **Quill** | Fisher | Steady | Fishes from the drowned village's bell tower. He says the fish there are used to bells. | **Early Tide:** +30% fish on shifts sent 05:00-11:00, +10% at other times | +45% / +15% |
| 16 | `pell` | **Pell Hollis** | Fisher | Lucky | Bram's boy. Not small any more. | **Bram's Boy:** +15% yield while Bram is in the party; his fishing rolls for the region's buff item +5% more | 10% of his buff finds come one rarity higher |
| 17 | `oona` | **Oona** | Seeker | Steady | Dives the Tide Pools. She holds her breath longer than anyone and will not say where she learned. | **Long Breath:** her rolls come every 6 min (Steady's 8) | every 5 min |
| 18 | `sparrow` | **Sparrow** | Seeker | Lucky | A glass-picker from the Emberwaste flats. Reads cracks in the ground like a map. | **Reads the Cracks:** 20% of her finds come one rarity higher | 35% |

The region pairs (1.4; names from LORE-R45, for the R4 and R5 specs to keep or replace):

| # | Key | Name | Job | Temper | Who | Signature |
|---|---|---|---|---|---|---|
| 19 | `fenn` | Fenn | Seeker (Region 4) | Steady | A survivor of the Silent Village. Knows the Starfall fields better than any outsider. | +25% finds at the Region 4 node (all region pairs); rolls every 6 min |
| 20 | `wick` | Wick | Seeker (Region 4) | Lucky | Fenn's neighbour. Named for a candle, and lucky like one that will not blow out. | +25% at home; 20% of finds one rarity higher |
| 21 | `corrin` | Old Corrin | Seeker (Region 5) | Steady | A retired Deepwell miner. Came this far down because nobody else would. | +25% at home; rolls every 6 min |
| 22 | `sable` | Sable | Seeker (Region 5) | Lucky | Found a way down that nobody else had. | +25% at home; 20% of finds one rarity higher |

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
- **Share. Changed (ECON1):** by rarity, 10 / 11 / 12 / 13 / 14% at Lv 1 (Common to Legendary; every named
  gatherer is Legendary: 14%), **x(1 + 0.03 x (lv - 1))** (x1.57 at Lv 20: 22% for a named gatherer). The shift
  fee rises x1.38 by Lv 20 (economy-2 4.2), so levelling pays about 12% a unit.
- **Changed (ECON1): random gatherers** (Common to Epic) have a job, 1-2 N1 traits, and the **Road** and
  **Hearth** branches only (no temper, no signature, no Trade branch). Their points: Lv 5, 9, 14, 20 (4).
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
| 2 | **Second Wind. Changed (ECON1):** the shift queue holds **3** shifts instead of 2 (8; each shift paid at send) | **Standing Order:** while this gatherer refines at a station, the station re-places its last order when the queue empties, if the Storehouse has the inputs |
| 3 | **Big Pack:** +10% haul; a pack that does not fit unloads what fits and waits with the rest (instead of each line all-or-nothing) | **At Camp** (the job's camp perk, below). Works while they are at camp; the best of a kind counts, no stacking |
| 4 | **Tireless:** +1 h a shift (**Changed (ECON1):** and the 30 min rest between queued shifts drops to 10 min) | **Master of the Station:** own-chain bonus x2 (not x1.5; Ada: x3), and the Standing Order runs while they are out on a node shift too |

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
| Seeker | Loupe | Tuning a buff item costs 25% less (gear-2 4.2) |

**Fisher and Seeker have no chain.** Their C1, C2 and C4 read:

| Row | Fisher (the Kitchen) | Seeker (the Enchanter's Table) |
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
| 3 | 80 of the job's refined goods, grade max(g, 4): Miner and Coal-digger Ingots, Woodcutter Planks, Hunter and Salter Leather, Weaver-gatherer Cloth, Herbalist Tinctures (Herbs x3 if the Still is cut, gear-2 O6), Fisher Planks (a boat), Seeker Ingots (tools) |
| 4 | 200 refined, grade max(g, 4), and 1 Trophy of any type |

- Row 3 therefore opens for real in Region 2 (refined goods start at grade 4). A Region 1 gatherer reaches
  Lv 11 at about day 5-9 and meets the chains at the same time as the Lanternbearer. The card says:
  "Needs Ingots. The Smelter opens when the Great Lantern of the Hollow burns."
- Every cost fits Storehouse Lv H at the Hearth H a player has when that row opens (HS8 extends to trees).
- Numbers are `GATHER_TUNE.teach` for the sim to tune.

---

## 5. Recruit routes

**Changed (ECON1):** **Word travels** that the fire holds, and each person comes when their reason comes
true. A route is a cheap probe the core checks once a second (like N1's `HANDS_LATER.when`). When it holds,
the person **arrives at the Tavern** and takes a **star spot** on the hiring board (a camp card and a toast:
"Nan Tarrow is at the Tavern, looking for work."). You hire them for the Legendary fee when a Tent is free.
They wait for ever; star spots do not count toward the board's 3 random spots.

### 5.1 Kinds of route

| Kind | What it means | Example |
|---|---|---|
| **Camp** | A building reaches a level | The Kitchen is built: Mother Ashby smells the bread |
| **Region** | Progress in a region: a zone reached, an elder type beaten, a node opened | The quarry's elder falls: Nan comes up out of the tunnels |
| **Milestone** | A region boss falls and its shroud lifts. **The person** of the owner's "sight, person, power" | The Hollow's boss: Gil walks out of the marsh |
| **Hero** | A hero is recruited or finishes their quest (HQ1) | Elowen's quest: Sister Fennel comes with the chapel's pots |
| **Rumour** | The Tavern tells you where someone is; you do one small thing | "There's a lad still in the quarry cracks." Mine grade-2 ore for 20 min |
| **Event** | A random event (EV1) that waits for you; tap it | "A pedlar at the gate." |

Events and rumours **wait** (no FOMO, plan-4 6.7). **Added (ECON1):** N1's Legendary pity (every 90
applicants) fires the next unmet named gatherer's fallback early (a "Word on the Road" rumour). A route never needs a hero to be *fielded*, only
recruited (lore.md's Hollises rule). Every Hero, Rumour and Event route has a **fallback** that fires on
region progress, so a player who skips a quest still meets everyone by the region's boss.

### 5.2 Who comes when

| # | Name | Route | Trigger (the probe) | Fallback | Expected (normal play) |
|---|---|---|---|---|---|
| 1 | Tam | Camp | Hands open (Hearth 2 and the Tavern; **changed, ECON1:** Tents 1-2 come free, no Bunkhouse); Tam is hired free on the spot | - | about 1 h (zone 10) |
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

### 5.3 The Tavern board. Changed (ECON1)

The Tavern keeps N1's **Job board** and adds **Word on the Road** under it.

- **Job board:** up to 3 random applicants (Common to Epic, one every 8 h, 6 h from Tavern Lv 3; odds 0.52 /
  0.30 / 0.13 / 0.05; pity Rare 8, Epic 25) and every named gatherer whose route fired, in **star spots** at
  the top. Each card: portrait, name, rarity, job (temper for named), share, the hire fee, **Hire** (or
  "No free Tent"), and **Turn away** (random only).
- **Word on the Road:** every named gatherer not yet on the board, in two states:

| State | Card shows |
|---|---|
| On the way (route started or a rumour open) | Portrait in shadow, name, job, the one thing to do ("Mine at a grade-2 vein: 12 of 20 min") |
| Not yet | A silhouette and the job. A hint in the lore's voice: "Someone in the marsh keeps a shaded lamp." |

---

## 6. The cap: Tents. Changed (ECON1)

The owner's cap is the number of **Tents** in camp. Each Tent holds one hired gatherer; everyone hired has a
Tent and works. **No beds, no lodgers, no Swap** (this section replaces gatherers-2's crew and lodgers).

- **Hire needs a free Tent.** A named gatherer who arrives while every Tent is full waits in their star spot.
- **Let go:** a random gatherer leaves for good (the UI asks first). A named gatherer returns to their star spot
  with level, tree and counters; re-hiring them is free.
- The `handBeds` / `handBedsMax` bonus keys add gatherer slots on top of Tents (BT1's "Bunk beds" +1).

### 6.1 How the cap grows

| Tents | Opens | Gold | When (normal play) |
|---|---|---|---|
| 1-2 | Free with the Tavern at Hearth 2 (Tam comes with them) | 0 | about hour 1 (zone 10) |
| 3 | Hearth 4 | 23,000 | day 1-2 |
| 4 | The Coast reached | 42,000 | day 7-9 |
| 5 | Coast, zone 50 | 90,000 | day 14-18 |
| 6 | The Emberwaste reached | 150,000 | about day 30 |
| 7 | Emberwaste, zone 85 | 320,000 | about day 38 |
| 8 | The Pale Reach reached | 520,000 | about day 48 |
| 9 | Pale Reach, zone 120 | 1.1M | about day 56 |
| 10 | The Gloamvale reached | 2.3M | about day 65 |

Materials, build times and the camp row (`CAMP_B.tent`, levels 0-10) are in economy-2 5; WC1 places the
Tents on the panorama.

| When | Tents (crew) | Named met |
|---|---|---|
| End of Region 1 (day 5-8) | 3 | 9-10 |
| End of Region 2 (day 21-35) | 5 | 16 |
| End of Region 3 | 7 | 18 |
| Region 5 | 10 | 22 |

So the choice is real at every stage: about a third to half the named people you have met fit in a Tent, and
each shift has a price. Who you hire, and how often you send them, is the budget question economy-2 sets up.

---

## 7. Production chains: how gatherers feed them

### 7.1 Who feeds which chain

| Chain (gear-2 3.1) | Takes | Gathered by | Refined best by (own chain) |
|---|---|---|---|
| Smelting | 2 Ore + 1 Coal | Miner (Ore), Coal-digger (Coal) | Miner, Coal-digger; Ned's Full Scuttle wants it running |
| Sawing | 2 Logs | Woodcutter | Woodcutter |
| Tanning | 2 Hide + 1 Salt | Hunter (Hide), Salter (Salt); Gil skips it for 20% of his hide | Hunter, Salter; Ada x2 (x3 with Master) |
| Weaving | 2 Fibre + 1 Dye | Weaver-gatherer (both; Gammer Loy's Tight Weave brings the dye with the fibre) | Weaver-gatherer |
| Distilling | 3 Herbs | Herbalist | Herbalist |

Three ways a gatherer helps a chain, from light to heavy:

1. **Supply the secondary.** Coal, salt and dye are the throttle (gear-2 3.4). The Lanternbearer's own
   time is better spent on the grade it is climbing, so this is the first Tent a Region 2 player fills.
2. **Supply the main input.** Miners, Woodcutters, Hunters and Weaver-gatherers add to what the
   Lanternbearer gathers.
3. **Refine.** A refiner speeds a station while their shift runs; **Standing Order** keeps the station
   busy while you are away.

### 7.2 A worked example (Region 2, grade 4, the Warrior's heavy set)

Let R be the Lanternbearer's rate at the grade-4 ore vein (units an hour). A coal seam gives the
Lanternbearer about 3.75R (gear-2 3.4).

| Who (Lv 1) | Where | Rate |
|---|---|---|
| Ned Culver (Steady: 12% x 1.15) | Region 2 coal seam | 0.52R coal an hour |
| The Lanternbearer | grade-4 ore | R ore an hour, which needs 0.5R coal to smelt |
| Nan Tarrow (Steady, Deep Seam) | grade-4 ore (her top grade) | 0.17R ore an hour |
| The Smelter, Lv 1 | grade 4 | 600 ingots an hour |
| + Nan refining (own chain) | | +2.5 x 12% x 1.5 = +45%: 870 an hour |
| + Ned refining too (own chain; 2 at most) | | about 1,140 an hour |

So **one Coal-digger keeps up with all the ore the Lanternbearer mines**, and a Miner either adds ore or,
better once the queue is long, refines. Two Tents of the crew run the Smelter. A Warrior also wants a
Salter (and later a Hunter) for leather; a Mage a Weaver-gatherer; a Ranger a Woodcutter and a Salter.
With 5 Tents in Region 2 a player runs their class's two chains and one more. **Added (ECON1):** each of
those shifts costs 4,100-6,800 gold (grade 4-6, economy-2 4.2), so running both refiners and both suppliers
all day is a Region 2 budget question: early in the region it costs more than idle fighting brings in.

A player with no gatherers still progresses (gear-2 design rule 3): the Lanternbearer gathers coal in 10
minutes for an hour of ore, and the station runs alone.

### 7.3 Refiner numbers

| | Lv 1 (12%) | Lv 10 (15.6%) | Lv 20 (19.6%) |
|---|---|---|---|
| Station speed, other chain (`2.5 x share`) | +30% | +39% | +49% |
| Own chain (x1.5) | +45% | +59% | +74% |
| Own chain with Handy (C1, x1.25) | +56% | +73% | +92% |
| Own chain with Handy and Master (x2 instead of x1.5) | - | - | +123% |

Two such refiners and a Lv 5 station (x1.8) give about x6 the Lv 1 speed at grade 4: a Rare +5 set's
refined goods in well under one away session (gear-2 E4).

---

## 8. Idle and offline. Changed (ECON1)

- **A shift is fixed at send**, as N1: place (node, zone or station), length, rate, seed **and fee**. Reload and
  offline pay the same as watching. The rate uses the Lanternbearer's rate at send, without Tonics, Omens,
  meals or the Glint (N1's `handsHeroRate`).
- **Fee:** paid at send, set by the job's grade and the gatherer's level (economy-2 4.2). Unpaid means the
  Send button says "Needs 1,400 more gold". Nothing is charged while you are away; gold never goes below 0.
  Tam's first 3 shifts are free.
- **Length:** 4 h for every gatherer (random and named; N1's 2-8 h by rarity goes), +15 min every 5 levels,
  +30 min with Long Legs, +1 h with Tireless: 4 to 5.75 h.
- **Queue (replaces the old Second Wind):** at send you pick 1 or 2 shifts in a row (3 with Second Wind), each
  paid at send. After a shift the pack unloads and the gatherer rests 30 minutes (10 with Tireless), then goes
  out again to the same place with the same rate and the next seed. Worked out in closed form inside
  `handsCatchUp`, so it runs the same offline. A pack that waits (Storehouse full) stops the queue: the shifts
  that did not start are **refunded**, and the gatherer stays home (the Storehouse's signal).
- **Recall:** a gatherer out can be called home: the haul so far comes home pro rata, the running shift's fee
  is kept, queued fees are refunded.
- **Coming home:** the pack unloads into the Storehouse as parcels (N1). Big Pack lets a pack unload what fits
  and hold the rest.
- **What a night away gives:** a 2-shift queue covers 8.5-10 h; with Second Wind, 3 shifts cover 13-15 h. The
  owner's rule stands: they go out for a set time and come home, and every shift is paid for.
- **Hunters** work their zone for the shift like a node. **Refiners** add their speed to the station only
  between their shift's start and end; S4's away closed form splits the away window at those times (at most
  2 refiners x 3 shifts a station: a few segments).
- **Buff-item and find rolls** come from the seed at the end of the shift, so a reload cannot re-roll them.
- **At Camp** perks work while the gatherer is at camp, as N1's at-camp traits (the best one of a kind counts).
- **Send all again** (N1's `handsSendAgain`) stays the one-tap check-in: every gatherer at camp goes back to
  their last place, with the last queue length, if the gold covers all of it (else the button says how many
  it can pay for, cheapest first: "Send 3 of 5: 9,600 gold").

---

## 9. Data and save

### 9.1 Data (`src/js/21p-data-gatherers.js`, data only)

```js
GATHER_TUNE = {                 // Changed (ECON1): shares, board, queue; fees, hire and Tents are ECON data (21w-data-econ.js)
  on: 1,                        // 0: N1's rules only (tools/sim.mjs --named 0)
  share: [0.10, 0.11, 0.12, 0.13, 0.14], perLv: 0.03,   // by rarity, x(1 + perLv x (lv - 1)): x1.57 at Lv 20
  odds: [0.52, 0.30, 0.13, 0.05], pity: [8, 25, 90],   // random applicants Common..Epic; pity[2]: Word on the Road
  shiftH: 4, restMin: 30, queue: 2, queueSW: 3, tamFree: 3,
  steadyY: 0.15, luckyKeen: 0.03, luckyTroph: 0.03, luckyBuff: 0.05, luckyBuffEveryH: 2,
  gemEveryMin: { base: 10, steady: 8 },
  hunt: { ref: 0.5, beast: 0.25 },
  refine: { k: 2.5, own: 1.5, max: 2 },
  pts: [3, 5, 7, 9, 11, 14, 17, 20], rows: [3, 7, 11, 17],
  teach: [[150, 'raw'], [400, 'raw'], [80, 'ref'], [200, 'ref', 1]],   // [n, raw or refined, trophies]
  campFx: { store: 0.03, away: 0.02, build: 0.05, hide: 0.05, rested: 0.10, meal: 0.10, tune: 0.25 }
};
GATHER_JOBS = {            // id -> { n, sk, fams, chain, st, camp, from (region), refined }
  miner: { n: 'Miner', sk: 'mine', fams: ['ore', 'crystal'], chain: 'smelt', st: 'smelter', camp: 'stonework', from: 1, refined: 'ingot' },
  coal:  { n: 'Coal-digger', sk: 'mine', fams: ['coal'], chain: 'smelt', st: 'smelter', camp: 'bank', from: 2, refined: 'ingot' },
  // wood, hunter, herb, weaver, salter, fisher, gem: as the table in section 1
};
GATHERERS = [              // 22 rows; the Region 4 and 5 pairs have live: 0 until their region specs
  { key: 'nan', n: 'Nan Tarrow', job: 'miner', tmp: 'steady', about: 'Worked the quarry before the dark. Grenna knows her.',
    sig:  { id: 'deep', n: 'Deep Seam', txt: '+25% yield on the highest grade her job has open', y: 0.25, top: 1 },
    sigp: { txt: '+40%, on the two highest grades', y: 0.40, top: 2 },
    route: { k: 'region', when: () => ..., fb: { zone: 25 }, hint: 'Someone still works the quarry tunnels, by feel.' } },
  // ...
];
GATHER_TREE = { A: { steady: [4 nodes], lucky: [4 nodes] }, B: [4], C: [4], noChain: { fisher: [3], gem: [3] } };
// node: { id, n, txt, fx: { y, keen, troph, buff, shiftMin, sw, haul, split, refine, standing, own, camp } }
```

Effects reuse N1's machinery where they can: `y` adds to `yieldOf`, `shiftMin` to `handsShiftSecs`, `keen`
and `troph` to N1's Keen Eye and Lucky rolls, the at-camp perks to N1's `handsCampTrait` pattern.

### 9.2 Save: the `hands` key, `v: 3`. Changed (ECON1)

**Changed (ECON1):** ECON1 bumps the save key to `lanternfall.save.v2` and starts fresh (economy-2 9), so
there is no v1 to v2 step: the bullets after the table are kept for the record only. The state stays
`S.hands` (`registerState('hands', ...)`):

| Field | Meaning |
|---|---|
| `S.hands.v` | 3 |
| `S.hands.board.star` | named gatherers waiting on the board: `[key]` (**added, ECON1**) |
| `S.hands.tamFree` | Tam's free shifts left (**added, ECON1**) |
| hand `r` | rarity; named gatherers `legendary` (**changed, ECON1**) |
| job `fee`, `q`, `qFee` | fee paid for the running shift; queued shifts left; their fees, refundable (**added, ECON1**) |
| `S.hands.leads` | `{ [key]: { at, n, ev } }`: a route under way (rumour minutes mined, an event waiting) |
| `S.hands.met` | (exists) key -> ms they arrived; now every named gatherer |
| hand `trade` | The job id (`miner` ...). Missing = an old random Hand, read by N1's rules. (**Not** `job`: that field is the current shift) |
| hand `tmp` | `steady` or `lucky` |
| hand `role` | `gather` (missing), `hunt`, `refine` (gear-2 9.1) |
| hand `tree` | `{ k: [taught node ids], on: [active node ids] }` |
| job `z`, `st` | The zone (hunt), the station (refine) |

- ~~`r` stays on named records as `common`~~ (**changed, ECON1:** `legendary`).
- ~~**The v1 to v2 step**~~ (**not built, ECON1:** fresh start) (small; skipped if S4 bumps the save key and starts fresh): Tam, the five
  Legendaries and the Hollises already in `list` get `trade`, `tmp` and `bed: 1` and keep their levels;
  their `tr` and `cl` stay in the save, but the signature replaces them. Old random Hands stay exactly as
  they are (N1's rules, a bed each, Let go works). Random applicants on the board leave (never hired,
  nothing paid). Routes that are already true fire quietly, with one card: "3 people have come to the
  fire while you were away."
- `HANDS_LATER` (the Hollises) is superseded by their `GATHERERS` rows.

---

## 10. Screens for N3 (360 px wide)

All tap targets 44 px or more. No information on hover only. Reduced motion: no walking or bobbing; bars
jump instead of filling.

### 10.1 The crew (Camp > Tents). Changed (ECON1)

The crew list lives on the Tents' camp card (the Bunkhouse retires). WC1 also shows each gatherer in the
camp panorama; tapping one there opens the same talk panel as tapping their row here (10.2).

```
+------------------------------------------+
| Crew  4 of 5 Tents   Gold 12,400 [Send all]|
|------------------------------------------|
| [pt] Nan Tarrow   Miner · Steady · L      |
|      Out: grade-4 ore vein  1 h 20 m (+1) |
|      [=========--------]                  |
|------------------------------------------|
| [pt] Ned Culver   Coal-digger · Steady    |
|      Refining at the Smelter · +45%       |
|------------------------------------------|
| [pt] Rook         Miner · Lucky   [Send]  |
|      At the fire · 4,400 a shift          |
|------------------------------------------|
| ( )  Empty Tent          [Hire at Tavern] |
+------------------------------------------+
```

- A row is 64 px: a 40 px portrait, name and chips on line 1 (rarity letter for random gatherers), status on
  line 2, a bar when out, "(+1)" when a shift is queued. The right button is the next thing to do: **Send**,
  **Collect** (a pack waits: opens the Storehouse note), or none. An empty Tent links to the Tavern board.
- **Send all** shows its total ("Send all: 17,600") and, when gold is short, "Send 3 of 5: 9,600".

### 10.2 The talk panel and gatherer card (a sheet). Changed (ECON1)

Tapping a gatherer (in camp or on the crew list) opens the **talk panel**: portrait (96 px, N2's art), name,
rarity, job and temper chips, a talk line (LORE-G; rotates with `handsTalk(id)`), and one big button, **Send
on a job**. The data is `handsTalkInfo(id)` (economy-2 11.1). Below it:

- **Level 7**, a bar, "9 h to level 8". "Brings 14.4% of your rate." "A grade-4 shift: 4,400 (4,500 at Lv 8)."
- The **Signature** box (named): name and line; "Signature+" greyed until A4 is active.
- Now: status and time left. Buttons: **Send on a job**, **Tree**, **Recall** (while out), **Let go** (asks).
- Folded: hours worked, units brought, finds, stories heard, gold spent on shifts (N1's counters plus one).

### 10.3 The send sheet (Send on a job). Changed (ECON1)

Only this gatherer's **profession** shows: a Miner sees ore veins and geodes, a Hunter cleared zones, a
refiner-capable gatherer the Refine tab. Tabs show only when they apply: **Gather** (the job's nodes the
Lanternbearer has open), **Hunt** (Hunters), **Refine** (once S4's stations exist).

```
| Gather   Refine                          |
| * grade-4 ore vein            4,400 gold  |
|   2,340 in 4 h 30 m · The Smelter needs ore |
|   grade-3 ore vein            2,600 gold  |
|   1,980 in 4 h 30 m                       |
|------------------------------------------|
| Shifts in a row:  [1] [2]  (3: Second Wind)|
| [ Send: 8,800 gold ]   You have 12,400    |
```

The top row is the suggestion (N1's `handsSuggest`, extended: a chain's missing input or secondary first,
then camp builds, then the smallest pile), with its reason on the second line. Rows marked "Full" show the
Storehouse chip and stay tappable (the pack will wait). The Send button shows the total fee; short of gold it
reads "Needs 1,400 more gold" and is disabled. Tam's free shifts read "Free (2 left)".

### 10.4 The tree (a sheet)

Three columns (**Trade**, **Road**, **Hearth**), four rows. At 360 px each column is about 104 px; a node
is a 52 px tile with its icon and a two-line name (11 px). States: locked (row level not reached),
teachable (a cost chip), taught (outlined), active (filled). "Points: 3 of 5". Tapping a node opens a panel
at the bottom with the effect, the cost and one button: **Teach (150 grade-2 Logs)**, **Put a point
here** or **Take the point back**. The **Move points** toggle shows only while the gatherer is at camp.

### 10.5 The Tavern: Job board and Word on the Road. Changed (ECON1)

The **Job board** first (5.3): star spots for named gatherers, then up to 3 random applicants; each card 156 px
wide in a 2-column grid with portrait, name, rarity, job, share, the fee and **Hire** / **Turn away**. "No free
Tent" replaces Hire when the Tents are full, with a link to build the next one. Then **Word on the Road**:
named gatherers not yet on the board, grouped by region (reached regions and the next one only), states as in
5.3. A card with a route under way has a small bar ("12 of 20 min").

### 10.6 Chips and notes elsewhere

| Where | What | How |
|---|---|---|
| Gather node rows | "Nan · 1 h 20 m" | `registerGatherRowNote(fn(kind, t))` (72-ui-gather, exists) |
| S4's station sheet | Refiner slots: "Ned refining · +45%", or "Empty: send a gatherer" | S4's refine UI reads `handsRefiners(st)` |
| Away card | Group "Gatherers": "Nan is back: +2,340 grade-4 ore." / "Pell found an Uncommon buff item." / "Ada worked the Tannery for 4 h." | N1's away lines |
| Next Up | "Nan is back: send again (4,400)", "Gil Rushby is at the Tavern", "Rook is in the quarry: mine at a grade-2 vein", "Tent 4 is ready to build" | N1's goals, plus leads and Tents |
| Arrival | A camp card: portrait, the arrival line, **Meet** (opens the Tavern board on their star spot) | new |
| Away card | "Nan's second shift was refunded: the Storehouse is full (4,400 gold)." | new (ECON1) |

---

## 11. Sim targets and hooks

| Id | Target | Band |
|---|---|---|
| GT1 | First named gatherer after Tam (Gammer Loy) | hour 2-4 |
| GT2 | Each arrival against 5.2's expected column | within +/- 25% of the region's length |
| GT3 | **Changed (ECON1):** Tents in use at check-ins after day 1 (the policy) | 80% or more |
| GT4 | Gatherers' share of gathered units (HS9, extended) | day 2: 10-20%; day 14: 20-35%; day 45: 25-40% |
| GT5 | One gatherer's rate over the Lanternbearer's reference (HS10, revised) | 10-30% (a Lv 20 Steady with a full Trade branch is the top) |
| GT6 | Chains: from day 10, no station waits on coal, salt or dye for more than one check-in with the policy's crew | yes |
| GT7 | Steady vs Lucky: a day's value, same job, same level | within 15% |
| GT8 | Buff items from gatherers (Lucky rolls, Gem-seekers, Brannoc, Morrow, Pell) | 15-25 a region (inside gear-2 E6's 80-110) |
| GT9 | Refining with the policy's refiners: gear-2 E4 holds; with no gatherers at all, E4 misses by at most one more check-in | yes |
| GT10 | Trees: first node taught / first capstone / 8 points on one gatherer | day 1-2 / day 20-30 / day 35-45 |
| GT11 | Offline 8 h vs live 8 h, with a 2-shift queue | within 15% per family |
| GT12 | Every teaching cost fits the Storehouse level expected when its row opens (HS8) | exact (check.mjs, static) |
| GT13 | Gatherers never add skill XP or tool mastery: the Lanternbearer's XP is identical with `--named 0` and `1` for the same actions | exact (check.mjs) |
| GT14 | **Added (ECON1):** fees and hires follow economy-2's tables; crew pressure EC3 and levelling EC11 hold | economy-2 8.2 |
| GT15 | **Added (ECON1):** a queued shift that cannot start is refunded, live and offline alike; gold never goes below 0 | exact (check.mjs) |

**Sim flags:** `--named 0|1` (the named roster; 0 = N1's random applicants) and `--report gatherers`
(units by gatherer and job, finds, Tents used, fees paid, arrivals by day, tree points spent). **Policy
(changed, ECON1):** hire into free Tents by need (a secondary for each chain the class runs, then the class's main family, then a Lucky Seeker
once Enchanting is open, then the rest); send by the extended `handsSuggest`; one refiner per running chain
once its queue holds more than one away session; teach the Trade branch first, then the Hearth branch for
chain jobs and the Road branch for the others; pay fees under economy-2 8.1's spend policy (keep one
shift's fee per gatherer in reserve).

**Core helpers for the sim (no DOM):** `gatherRoster()`, `gatherLead(key, stage)`, `gatherMeet(key)`,
`gatherHire(key)` (**changed, ECON1:** replaces `gatherSwap`), `gatherTeach(id, node)`, `gatherPoint(id, node, on)`,
`handsSendHunt(id, z)`, `handsSendRefine(id, st)`, `handsRefiners(st)` (a speed multiplier).

---

## 12. Build split

File numbers were checked against `src/js` and every file name the design docs reserve: `21p`, `21q` and
`57h` are free. Nothing here uses 59e, 59g, 59h, 59i or 59j. **Changed (ECON1):** fees, hire prices and Tent
rows come from `src/js/21w-data-econ.js` (ECON-A, economy-2 11); N3a needs ECON-A first.

| Task | Work | Owns (new files) | Small edits in | Needs |
|---|---|---|---|---|
| **N3a** Gatherers core (Opus or Sonnet, M) | Data (9.1), the roster and routes, leads and arrivals, **the board (random Common-Epic with pity, named star spots, Word on the Road pity), hire fees, rarity shares, jobs for random applicants, shift fees, the queue, refunds, Recall, Tam's free shifts, Tents as the cap, `handsTalkInfo` (economy-2 11.1)** (changed, ECON1; no lodgers, no Swap, no v2 step), tempers, signatures, levels and points, trees (teach, points, respec), the Hunter, Big Pack, refiner hooks for S4 (`handsRefiners`, `handsSendRefine`; the role is stored and shown, and speed counts once S4's stations exist), away lines, Next Up goals; sim `--named`, `--report gatherers`, GT1-GT15; check section `gatherers` | `src/js/21p-data-gatherers.js`, `src/js/57h-gatherers.js` | `57f-hands.js` (hook points: a yield adder, a shift adder, a find hook, the own-job rule by families, `role`, `trade`, **fee at send, the queue and refunds, `handsBeds()` reads Tents** (changed, ECON1)); `21f-data-hands.js` (**odds, pity, shares; `hireFoes`, `shiftH`, `beds` retired** (changed, ECON1); `HANDS_LATER` retired); `57c-codex.js` (Camp page: met of 22); `tools/sim.mjs`, `tools/check.mjs` | N1 (done), ECON-A |
| **N3b** Gatherer screens (Sonnet, M) | Section 10: the crew view, the talk panel and card, the send sheet with fees and the queue, the tree sheet, the Job board and Word on the Road, arrival cards, node chips, the away group (changed, ECON1) | `src/js/75-hands-ui.js`, `src/styles/60-hands.css` (both named in hearth-and-hands 10) | `74-ui-tavern.js` (mount Word on the Road), `75-camp-ui.js` (the Tents card opens the crew view; changed, ECON1) | N3a |
| **LORE-G** Gatherer words (Sonnet, S) | 22 arrival lines, route hints, about 8 talk lines each, 4 fire stories each (88), rumour lines | `src/js/21q-gatherers-talk.js` | - | N3a (keys) |
| **S4** (in its own files) | Stations call `handsRefiners(st)` for speed and split the away window at refiner shift ends; `zoneGrade` for the Hunter; coal, salt and dye nodes as job families; Ned carries the Coast arrival gift; tree rows 3-4 read the refined families | - | `55-gear2.js`, `75-refine-ui.js` (refiner slots) | N3a |
| **S5** | Lucky and Seeker buff rolls go through `55-enchant.js`'s find table (off until S5: no buff items exist yet) | - | `55-enchant.js` | N3a |
| **BT1 / WC1** | **Changed (ECON1):** the Tents row (`CAMP_B.tent`, levels 0-10, economy-2 5) replaces the Bunkhouse; Tents on the panorama; a building tree's "Bunk beds" (+1 through `addBonus('handBeds')`); gatherers visible in camp, tap to talk | - | `57-camp.js` | ECON-A, N3a |
| **R2, EV1, HQ1** | Quill's, Oona's and Morrow's triggers and the `fish` skill; Dorrie's and Jory's events; the Elowen quest probe. Each calls `gatherLead(key, stage)` | - | their own files | N3a |
| **N2** | Art for 22 on the B1 townsfolk kit; camp spots by job (Hunter by the Tannery, Salter and Fisher by the Kitchen, Coal-digger by the Forge, Seeker by the Enchanter's Table) | `src/js/12g-art-hands.js` (reserved) | - | N3a (keys) |

Merge order: N3a first, then N3b and LORE-G in parallel. N3a runs on today's 5 tiers: the Hunter works at
once, the coal, salt and dye jobs and refiners switch on with S4, buff rolls with S5, and the Region 4 and
5 pairs with their regions (`live: 0`). Every task runs `node tools/build.mjs`, `node tools/check.mjs` and
`node tools/perf.mjs --quick`. Per-tick work stays at one route probe a second.

---

## 13. Player-facing copy (starting lines)

| Where | Line |
|---|---|
| Arrival (changed, ECON1) | Nan Tarrow is at the Tavern, looking for work. |
| Arrival, no Tent (changed, ECON1) | Gil Rushby is at the Tavern. Build a Tent to take him on. |
| Hire | Hire Nan Tarrow for 20,000 gold? |
| Fee | A grade-4 shift: 4,400 gold. |
| Short of gold | Needs 1,400 more gold. |
| Refund | Nan's second shift was refunded: the Storehouse is full (4,400 gold). |
| Temper chips | Steady: brings more. / Lucky: finds things. |
| Rumour | Nan says there's a lad still down in the quarry cracks. |
| Lead | Mine at a grade-2 vein. He follows the sound of your pick. (12 of 20 min) |
| Tree gate | Needs Ingots. The Smelter opens when the Great Lantern of the Hollow burns. |
| Queued shift | Nan rested and went back out (shift 2 of 2). |
| Refiner | Ned is refining at the Smelter: +45% speed. |
| Idle refiner | Waiting for an order at the Smelter. |

---

## 14. Decisions for the owner

**Changed (ECON1):** the owner answered D1 and D2 (wave log, 2026-09-28): **no** to both. Gatherers are hired
for gold from a board with rarity, and the cap is Tents. D4 is reworded by the shift queue. D3, D5 and D6 stand.
New decisions for this revision are in economy-2.md 12.

- ~~**D1. Named gatherers only.**~~ **Owner: no** (hired with rarity; ECON1). Random applicants, rarity and hire prices go. Every gatherer is a named
  person with a route, recruited free. A save's existing random Hands keep working as they are.
  Recommended: **yes** (it is what "two named gatherers per job" means, and it removes the gacha board).
- ~~**D2. The cap is on who works, not on who you meet.**~~ **Owner: no** (Tents; ECON1). Beds set the crew (10 by Region 5); everyone else
  lodges at the Tavern and swaps in for free while at camp. Nobody leaves for good. Recommended: **yes**.
- **D3. Trees: 8 points across 12 nodes.** Points come from levels; each node is taught once with
  materials (rows 3-4 ask for refined goods, so chains feed the trees); points move freely between taught
  nodes at camp. Recommended: **yes**.
- **D4. Shifts stay bounded.** **Changed (ECON1):** a queue of 2 paid shifts (3 with Second Wind) replaces
  the free re-sends below. The tree's Second Wind sends a gatherer out once more (twice at most), so a
  night away is covered, but nobody works for ever without a check-in. Recommended: **yes** (it keeps
  your earlier rule that they come back to camp when done).
- **D5. Old names, new jobs.** Jory becomes the Lucky Hunter, Mother Ashby the Lucky Herbalist, Old
  Bracken the Lucky Woodcutter; the Hollises arrive together at the Coast's boss but work two jobs (Ada
  salts, Pell fishes). Recommended: **yes**.
- **D6. 22 by Region 5.** The Region 4 and 5 pairs (LORE-R45's Fenn and Wick, Old Corrin and Sable) are
  extra Gem-seekers with a home-region bonus; the R4 and R5 specs keep or rename them. Recommended:
  **yes**.
