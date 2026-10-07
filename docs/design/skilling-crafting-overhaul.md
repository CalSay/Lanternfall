# Skilling and crafting overhaul

Design spec, 2026-10-07. Card `skilling-crafting-overhaul-spec` (P0, Opus high lead, judge gate). Replaces the cards
`refine-queues`, `craft-attribute-grades`, `weapon-profiles` and `crafting-levelling-spec`, and takes in W7's
`craft-delta`. It ends with four build cards (section 10), targeting a build by Fri 13 Nov and one balance pass after.

Rubric: design-doc. Coverage-map areas 10 (skills), 5 (meaningful choices), 8 (economy), 4 (overwhelm). Compass loop
step: "a 5-minute visit, steps 3 and 4" (spend what you won; set the camp working). Pillars 3 (you build your own hero)
and 2 (the camp works while you are away), held inside pillar 6 (gradual depth).

How this was made: today's code mapped line by line (`/mnt/project-files/research/overhaul/code-map-2026-10-07.md`);
five games researched by gatherers, about 11,000 player reviews pulled from Steam and the App Store
(`/mnt/project-files/research/overhaul/`); W4, W7 and the 6 October why review read in full. Cal's answers file
(`autopilot/reports/why-review-2026-10-06-answers.md`) wins where sources differ. A red team and an Opus judge ran on
the draft (section 11).

---

## 0. The short version

**What a player notices.** From about minute 20, crafting stops being "press Craft when Next Up says so". The Forge,
Workbench and Loom each get a second job, refining: ore and coal become ingots, logs become planks, fibre becomes cloth,
hide becomes leather. It runs while you fight and while you are away, and one tap at camp keeps it going. Tier 2 gear and
every gear upgrade use refined materials, so mining, chopping and coal finally have a steady customer. When you craft a
weapon you pick its profile (Heavy, Balanced or Swift), which decides which attribute it grows with, so your weapon and
your attribute points are one build. Your Smithing level sets the craft's grade (D to S), not a die, and a well-timed
Strike at the anvil lifts it one grade. Every craft shows what it changes in the fight, and Next Up names the piece and
the boss it is for.

**In one line (the test from 6 October):** raw materials become refined ones at the station that uses them, and your
skill level, your timing and your build decide how good the gear is.

**What skilling gives a player in minutes 20 to 60** (section 2 has the beat map): a named piece to chase for the next
boss; the first time the camp works while you fight (a smelt queue); two real choices (which profile; craft a top-grade
piece of this tier or a low-grade piece of the next); and a visible rise in the fight when the piece lands.

**Inside the ceiling:** 8 skills (max 10), one refine step for ore, wood, hide and fibre, coal as a mining node, no new
buildings, a camp visit in 2 or 3 taps, 11 pile rows (max 12), no new named currency (section 8).

---

## 1. The problem, with the evidence

1. **Crafting is the loop that does not carry minutes 20 to 60.** The walk made 2 crafts in 39 bot minutes and none
   after minute 6 (W7, section 3). Part of that is the bot and Next Up's repeat (`next-up-equip` owns the repeat), but the
   design gives a human little more: a craft is one tap, its result is a die roll, and nothing between the node and the
   item asks anything of you (code map section 3: crafting is instant, materials only, rarity rolled from the station
   level).
2. **Levels do nothing past the tier gates, and come too fast.** Station skills reach level 54 (the last tier gate) on
   7,077 XP; a tier 3 craft pays 129 (code map section 1). Past 54 a level only nudges the rarity odds. Cal, 3 Oct:
   crafting levels too fast. Melvor's most-voted long-play complaint: "Most skill level ups don't make you stronger at
   all, they just unlock recipes" (Steam 217236156, 1,342 h).
3. **Gathered materials have one use and pile up.** Nothing sits between a node and a finished item (code map 3).
   Gold piles up too: 7,800 of 8,138 gold unspent at minute 60 (W6); the walk's gold sat flat at 6,840 from bot minute 17
   (W7). Rusty's Retirement's long-play negatives name the same thing: "nothing to do with all your money" (review
   163998348).
4. **The rarity die is a re-roll tax, not a choice** (why review item 7). You pick a recipe and a die picks 1x to 2.5x
   power. Players who want a Rare re-craft and salvage.
5. **Might is in no winning build** (hero-progression judge ruling 4): it waits for weapons that scale with attributes.
6. **Crafted gear left in the bag** is the worst wall in the first hour (W4: 3% boss wins bare against 63% in tier 1
   gear). `next-up-equip` fixes the prompt; this spec makes the craft itself say what it does in the fight.
7. **Things the code half-built that this closes:** Tents 5 to 10 are priced in plank, cloth and leather that do not exist,
   so they can never be built (`21w-data-econ.js:50-55`, code map 6). Tonics are coded with no way to brew them (code map
   7). Hands only gather.

### What other games' players say (research, `research/overhaul/`)

| Game | Reviews read | Skilling or crafting: praise vs complaint | What they praise | What makes them quit |
|---|---|---|---|---|
| Melvor Idle | 1,450 | 128 vs 60 (+33 paywall) | "every skill feeds into another one, and there's nothing useless" (86215735); queue it and walk away | levels that only unlock recipes; a skill nerfed after players invested (Township: 19 of 60 negatives) |
| Old School RuneScape | 4,612 | about 138 vs 65 | skills that open new things; idle skilling on the phone ("I can grind afk skills via the app very easily", iTunes 14356578764) | "press a button, wait till action is done, repeat" (234367877); "no gratification for levelling any skill except Hitpoints" (187502738) |
| Legends of IdleOn | 3,564 | 60 vs 25 by sentiment | setting up before you leave; "spreadsheeting fishing efficiency at 1am" (224566628) | too many systems at once ("too many things to do", 226957302); about 113 complexity complaints |
| Rusty's Retirement | 1,360 | relaxing 22%, set-and-watch 18% of positives | the return: "I left rusty for two hours came back and he'd grown crops" (209979602, 76 votes) | content ran out (17% of negatives); surplus with no use; a farm that "plays itself" once automated (186315344) |
| Fantasy Life i | 1,870 | 140 vs 81 (hand-coded, of 345) | crafting your own gear; "the faster you do it the better the equipment" (201232787) | one identical crafting minigame everywhere (19); unskippable animations; real-time recipe gates |

**What these say for us, in order of weight:**
1. A craft must change the fight, visibly, and a level must change the craft. (Melvor, OSRS, Brighter Shores in W7.)
2. Queue it and walk away, with a clear return. Never ask for input every few minutes. (Melvor, Rusty, IdleOn.)
3. One second resource that gates the next tier is the classic hook (OSRS and Melvor coal). A web of prerequisites
   that needs a guide is the failure (OSRS Recipe for Disaster, IdleOn).
4. A short timed input is liked when it sets quality and can be skipped; it is hated when it is long, identical
   everywhere, or the only way to get full quality on bulk work (Fantasy Life i).
5. Never devalue what players already hold. (Melvor Township.) For us that also means save compatibility.

Limits: no human has played our build; the game wikis, Reddit and Google were blocked, so mechanics of other games come
from search snippets or memory and are marked in the research files; review labels are single-pass keyword or hand
counts, about +/-10%.

---

## 2. Minutes 20 to 60: what skilling gives the player

Times are the human estimates of `docs/design/first-hour.md` (Wren). Bot times run faster. Rows marked **new** come from
this spec.

| Time | Beat | What the player does | Decision or reveal |
|---|---|---|---|
| ~12:30 | Workbench and first tool (today) | crafts the tool from raw logs and ore | unchanged: tier 1 needs no refining |
| ~16 to 22 | First class weapon (today), now with a **profile pick** and the **Strike** (new) | picks Heavy, Balanced or Swift; taps Strike | **decision**: which attribute this weapon grows with; skill: the Strike's grade |
| right after | **The result card shows the fight change** (new) | reads "Gloomjaw now takes 6 hits, not 9" | reveal tied to a named boss |
| ~20 to 25 | **The first refine** (new): the first +1 upgrade asks for 2 Pine Planks, and the Workbench's Saw row appears | sets 10 planks going, goes back to the road | first time the camp works *while you fight* |
| ~25 to 35 | **Coal Seam** beside the Copper Vein (opens with the Forge) | mines coal; the Forge smelts Copper Ingots | a second job for Mining from its first minute |
| ~30 to 45 | **Smithing 3 and 6: grades C and B on Copper** (new milestones) | sees "Copper Warblade, grade B now possible" on Next Up | a level means a better craft |
| ~35 to 50 | **Tier 2 named by Next Up** for the zone 10 Champion: "Iron Warbow for the Fen Warden: 6 Iron Ingots" | mines iron and coal, smelts, crafts | **decision**: Copper at grade B now, or Iron at grade D when the ingots are in |
| ~35 to 60 | Hands (Hearth 2 and the Tavern, today) can work the Coal Seam | sends a Hand to coal, the Forge smelts, the hero chops | the IdleOn-style away plan Cal asked for: what to leave running |
| any visit | **Refill all** at camp (new) | one tap restarts every queue | the camp visit stays short |

What this fills, against W7's table: a named item to chase (each tier names its boss), crafting that changes the fight
visibly, a choice every zone or two (profile, grade-or-tier, what to leave running), and a reason to come back (queues
finish while away). It adds one new verb (refine) and one new pile (coal), introduced 5 to 10 minutes apart.

---

## 3. Skills

**The list stays at 8:** Mining, Woodcutting, Foraging, Hunting (gathering), and Smithing (Forge), Woodcraft
(Workbench), Tailoring (Loom), Enchanting (Enchanter's Table) (stations). Refining earns the station's own skill. No new
skill; the 6 October cap of 10 leaves two slots, held for Fishing and Cooking after Chapter 1 (not in this overhaul).

**Gathering skills keep their curve and node gates** (1/14/30/64/112, tuned on 2026-10-01). Out of scope here; one known
mismatch is flagged: tier 5 nodes open at level 112 while tier 5 items open at station 54. Tier 5 is region 2
material, so it does not touch Chapter 1.

**Station skills get a slower curve and a level cap of 75.** Today: `need = 7 x lv^0.5 x 1.04^(lv-1)`; level 54 costs
7,077 XP. New: `need = 8 x lv^0.8 x 1.035^(lv-1)`, and refining pays XP (section 4), so most XP comes from the queue
rather than from re-crafting cheap items (the old exploit).

| Reach level | Opens | XP today | XP new | Target time for a kept-up player (sim to confirm) |
|---|---|---|---|---|
| 3 / 6 | Copper grade C / B | 17 / 63 | 22 / 101 | 25 to 45 min |
| 10 | Tier 2 (Iron, Birch, Flax) | 160 | 300 | 40 to 60 min |
| 22 | Tier 3 | 748 | 1,744 | 3 to 5 h |
| 36 | Tier 4 | 2,312 | 6,044 | 12 to 18 h |
| 54 | Tier 5 | 7,077 | 19,854 | 40 to 50 h |
| 69 | Tier 5 grade S | 15,868 | 45,674 | 90 h+ |
| 75 | cap | 21,521 | 62,237 | the long tail |

Old saves keep their level and their XP bar's share of the current level (the hero-progression rule). Nobody loses a
level. The four catch-up rules (`CRAFT_CATCHUP`) stay, so a second station is never a slog.

---

## 4. Coal and the four middles (one refine step)

### The rule
Tier 1 gear is made from raw materials, as today. **Every upgrade, and every craft from tier 2 up, uses refined materials
for the item's main material.** The main material is the family the item is named for (a Birch Bow: wood). Its second
material stays raw. Tools, charms, trinkets and Enchanter's Table items stay raw.

Why tier 1 stays raw: the first-hour chain (first tool, first weapon) is tuned and measured, and W7 asks for the first
craft to be easy. Refining then arrives at the first upgrade or tier 2, which is minutes 20 to 50, the window this spec is
for.

### The table

| Middle | Station (its second queue) | One unit takes | Time per unit, tier 1 to 5 | XP per unit |
|---|---|---|---|---|
| **Ingot** | Forge: Smelt | 2 ore + coal: 1 / 2 / 3 / 4 / 4 | 15 / 25 / 40 / 60 / 90 s | 3 x tier |
| **Plank** | Workbench: Saw | 2 logs | same | 3 x tier |
| **Cloth** | Loom: Weave | 2 fibre | same | 3 x tier |
| **Leather** | Loom: Tan | 2 hide + 1 log of the same tier ("tanned with oak bark") | same | 3 x tier |

- **Coal** is one pile, one grade. The Coal Seam is a Mining node beside the Copper Vein, open at Mining 1, shown when
  the Forge is built. Same swing time and XP as copper. Hands can work it like any node.
- Crystal, herb and Essence stay raw. Crystal has no class that needs a cut step; herb goes into tonics (section 7).
- **Recipe conversion:** the main material's count halves, rounded up, into middles. A tier 2 Iron Warblade (today 9
  Iron Ore, 5 Birch Log, 3 Essence) becomes 5 Iron Ingots (10 ore, 10 coal), 5 Birch Log, 3 Essence. So raw ore
  stays about the same; coal and time are what is new.
- **Upgrades:** the material part of `kindUpgradeCost` names the middle for the main family (halved, rounded up). The gold
  part is the `gold-without-training` build's (provisional prices). So the upgrade, gold's biggest sink, now also pulls
  ore, coal and logs through the queue.
- **Tents 5 to 10** become buildable: their plank, cloth and leather costs (`21w-data-econ.js:50-55`) now exist.

### How the queue works
- Each of the Forge, Workbench and Loom shows one refine row: product, count, Start. The queue holds 20 units at
  station level 1, plus 20 per station level (100 at level 5). Station building levels get a new job; their gold costs
  become a skilling sink (section 6).
- It runs on its own, on the wall clock, **while you fight and while you are away**, under the same away cap as
  gathering (4 to 24 h). It stops when input runs out or the Storehouse pile is full, and says which. Nothing to collect:
  output goes straight to the Storehouse.
- **No timer over one fight's wait in the first hour:** tier 1 and 2 units take 15 and 25 s, under a zone fight (W7's
  rule, now a number).
- No fail chance, no quality grade on refined goods, no alloys (Cal's ceiling, 6 Oct).
- The away report gains a line: "The Forge smelted 24 Iron Ingots (stopped: out of coal)."
- **Refill all**: one button on the Camp view restarts every queue with its last product at the most it can take.

### Where it shows
- The Storehouse adds one row per middle, and coal shows as one extra cell in the ore row. It shows each family through a window of the player's
  current and next tier (`75-store-ui.js`), so the screen holds 11 rows, not 52 cells.
- A recipe or upgrade that is short of a middle says so in the row and offers the refine: "Short 3 Iron Ingots. Smelt
  3 (needs 6 Iron Ore, 6 coal)?" (the brainstorm's "Make what I need").

---

## 5. Grades replace the rarity die; profiles make the weapon part of the build

### Words (fixes the three meanings of "grade" the uniques review found)
- **Tier**: the material step (Copper, Iron, Silver, Cobalt, Mithril). Players read the material name.
- **Grade**: the letter D, C, B, A or S on a crafted piece. Set by skill, lifted by the Strike.
- **Rarity** (Common to Epic) stays on items made before this change and on uniques. New crafts have no rarity.
- The set rule (uniques review) keys on **tier**, so a set is four pieces of the same material step.

### Grade comes from your level, not a die
Your station skill's levels past the tier's gate set the grade: **D at the gate, C at +3, B at +6, A at +10, S at +15.**
So at Smithing 12 you make Copper at grade A or Iron at grade D. That is the min-maxer's choice the old die hid, and
levelling Smithing matters past every gate. The recipe row shows the grade before you craft.

| Grade | Bonus lines (today's rarity) | Weapon scaling (below) | Moment |
|---|---|---|---|
| D | 1 (Common) | 0.10 | none |
| C | 2 (Uncommon) | 0.20 | none |
| B | 2 | 0.30 | none |
| A | 3 (Rare) | 0.42 | medium moment |
| S | 4 (Epic) | 0.55 | medium moment |

Every graded piece has one base multiplier, **1.35**, about today's mean rarity multiplier for a player at a tier gate
plus a few levels (1.30 at Smithing 10, 1.41 at 22, from `rarityWeights`). That keeps today's boss bands roughly where they
are until the balance pass. Grade then changes the lines and, on a weapon, the scaling. Bonus lines still draw from the
class pool (Reforge rerolls one, as today). Masterwork still adds a line for a Trophy.

### The Strike (one hand-played beat per craft)
Crafting a weapon or armour piece shows the parry timing bar once. Tap in the window and the piece comes out **one grade
higher** (never above S, never more than one step above your level's grade). Miss, or tap Skip, and it comes out at your
level's grade. Materials are never lost. It uses the parry bar's look and sound, so it needs no new art, and it follows
reduced motion the way the parry bar does. Each station names it in its own word (Strike, Carve, Stitch, Etch).
Refining has no Strike: bulk work stays idle.

Why: it is our core verb (timing) at the moment of making, which OSRS's and Fantasy Life's players both ask for ("one
short foreground moment per cycle"; "the faster you do it the better the equipment"), and a craft is rare enough (one per
slot per tier, plus a few) that it cannot become the tedium Fantasy Life's reviewers name. Switch: `CRAFT_TUNE.strike`.

### Weapon profiles (Cal's pick C)
When you craft a weapon you pick a profile. Each grows with one attribute. The noun follows the hero's weapon family; the
art is the hero's own weapon.

| Profile | Speed | Grows with | What it is for | Wren | Tobin | Pip |
|---|---|---|---|---|---|---|
| **Heavy** | -10% | **Might** (Attack hits harder) | big basic hits | Warbow | Greatsword | Greatstaff |
| **Balanced** | 0 | **Focus** (abilities) | ability builds | Bow | Warblade | Staff |
| **Swift** | +10% | **Guard** (counters, parry) | parry and counter builds | Shortbow | Sabre | Wand |

**Scaling:** in a turn fight, the profile's channel (Attack, abilities or counters) is multiplied by
`1 + scaling(grade) x share`, where `share` is that attribute's points after the soft cap divided by all the hero's
spent points. A hero with half their points in Might, holding a grade S Heavy weapon, hits about 27% harder with Attack;
an even spread gets about 14%. The hooks are the three `attrRel` lines in `turnMakeProfile` (`59k-turn.js:308, 313,
322`). Outside turn fights (away, raid, farm zone, Deepwell depth) power stays build-neutral, as now, so **the online
numbers do not move**.

Vigour has no weapon on purpose: survival comes from armour and Vigour points. Armour has grades but no profile in this
overhaul (a later option, if the min-maxers ask for it).

**Retune** (Cal's name for the old idea): change a weapon's profile at the Forge for gold, rising 1.5x a time from the
Reforge base. Reforge stays as it is (one line).

---

## 6. Gold: three sinks, and the pick

Rule kept from 6 October: **gold buys means, not stats.** The `gold-without-training` build (running) makes +1 to +10
upgrades gold's main sink with provisional prices; this spec adds the materials side and two more sinks the balance
pass can weigh.

| Option | What gold buys | Grows with the road | Forecast (to be checked by the sim in the balance pass) |
|---|---|---|---|
| **A. The Forge leads** | upgrades (gold plus middles), Retune | yes, by tier | the main sink; the upgrade build found upgrades stall at +7 today, so with middles in the cost the stall moves from gold to materials, which the queue feeds. Expect about half of all gold spent. |
| **B. The camp leads** | station levels (queue length 20 to 100), Storehouse, Tents 5 to 10, Hands and shifts | yes, by region | station levels gain a skilling job, and Tents 5 to 10 finally have a price that can be paid. Expect about a quarter. |
| **C. Supplies lead** | tonics: herbs plus a gold fee a brew, one active at a time (section 7) | yes, by tier | small and steady; a choice before a boss. Expect a quarter or less. |

**Pick: all three, A biggest, in the 6 October split (about 50 / 25 / 25).** The balance pass sets the numbers with
`node tools/health.mjs --compare` and one target: at minute 60 and at each wall, unspent gold is under 60% of gold earned
(W6 today: 96%), and no single sink is always the right buy. Crafting itself stays free of gold, so the first craft never
waits on gold.

Spare materials late game: middles and coal give ore, wood, fibre and hide a second, larger use; upgrades take middles
at every step; Tents 5 to 10 take them in bulk. A lever the balance pass may pull but this spec does not turn on: Trade
runs carrying middles for a little more than their raw value.

---

## 7. Herbs and tonics (the supplies sink)

Tonics already exist in the core: Vigor Tonic (+15% damage), Forager's Draught (+25% gathering speed), Mending Draught
(+20% healing), 20 minutes, one active, the timer runs while away (`CRAFT_TONICS`, code map 7). Nothing can brew them
today. Wire a **Brew** row at the Enchanter's Table: herbs plus a gold fee, one active, shown on the fight HUD while it
lasts. That gives herb a job for every hero and gives a boss a preparation step ("brew a Vigor Tonic, then try again"),
the Preparation lever from the walls answer.

The bag slot (a potion that costs a turn) stays out: the judge put `bag-slot-and-steady-charges` out of M1 on 2026-10-06,
and tonics give herbs a use without a new combat action.

---

## 8. The ceiling, checked

| Ceiling (6 Oct) | After this spec |
|---|---|
| At most 10 skills | 8 |
| One refine step for ore, wood, hide | one step each, plus fibre to cloth (Cal's answer 5 adds cloth) |
| Coal as a mining node | yes, one grade |
| No new buildings | none: refining is a second queue on the Forge, Workbench and Loom; Brew on the Enchanter's Table |
| Camp visit in 3 taps | Camp, Refill all: 2 taps. Change a product: Camp, station, product: 3 |
| At most 12 piles on screen | 11 rows (7 raw families including Essence, coal folded into ore's row, 4 middles) through the tier window |
| At most 8 named currencies | no new currency; coal is a pile |
| Weapons scale with attributes | yes, by profile |
| No idle combat | none: refining is idle, fighting and the Strike are hand-played |

---

## 9. Alternatives weighed

| Idea | Pick | Why |
|---|---|---|
| Craft Rating with aim-then-roll odds (3 Oct proposal) | no | swaps one die for another; Cal's rarity point is to remove the die |
| Level as a hard tier gate (OSRS) | yes, kept | readable, already in the code; grades give the levels between gates a job |
| Fail chance on early tiers (OSRS iron, gem cutting) | no | Cal's ceiling: no fail chances; Fantasy Life's material loss is a top complaint |
| Quality grades on refined goods | no | ceiling; it would double the piles |
| A new Smelter or Tannery building | no | ceiling: no new buildings; the station's second queue does the job |
| Every family refined, including crystal and herb | no | no class needs it; herb gets tonics |
| Two choices per weapon (profile and a free attribute pick) | no | one choice that sets both is easier to read and keeps the camp short |
| Hands staffing a station | later | refining runs on its own already; staffing adds a screen. Good follow-up if away planning feels thin |
| Level 50 specialisations | no | over the ceiling for M1 |
| Master Orders (an order board) | no | Tavern Contracts already make the active gold earner |
| A crafting minigame with several inputs | no | one tap, skippable; Fantasy Life's long identical minigame is its top crafting complaint |
| The bag slot now | no | judge put it out of M1; tonics cover herbs |

Answers to the 3 October brainstorm's five questions: **scope** ore, wood, fibre and hide, not crystal or herb;
**active or idle** refining idle, crafting active; **fail chance** none; **specialisations** no; **order board** no
(Contracts).

---

## 10. Build cards

Four cards, written to `/mnt/project-files/autopilot/cards/`. Target: all merged by Fri 13 Nov, then one balance pass.

| # | Card | What a player gets | Model | After | Owned files |
|---|---|---|---|---|---|
| 1 | `craft-delta` (amended) | the result card shows the fight change; Next Up names the piece and its boss | Sonnet medium | `next-up-equip` | `75-craft-ui.js`, `55-goals.js` |
| 2 | `refine-middles` | coal, the four middles, refine queues, Refill all, upgrades and tier 2+ use middles, Tents 5 to 10 | Sonnet medium build, Opus high save review | none | new `55-refine.js`, new `75-refine-ui.js`, `21-data-craft.js`, `30-state.js` (mats), `41-items.js`, `50-sim.js`, `75-store-ui.js`, `55-savecode.js` |
| 3 | `forged-grades` | grades D to S, profiles and attribute scaling, Retune, the Strike, the new station curve | Sonnet medium build, Opus high combat review | `refine-middles` | `55-crafting.js`, `40-rules.js`, `20-data.js` (`SKILL_TUNE`), `59k-turn.js` (three hooks), `75-craft-ui.js` |
| 4 | `tonic-brew` | Brew tonics at the Enchanter's Table for herbs and gold | Sonnet medium | `refine-middles` | new `75-brew-ui.js`, new `21-data-brew.js` |

Order: 1 and 2 can run at the same time (no shared files). 3 follows 2 (both touch crafting data). 4 follows 2 and can
run beside 3. `75-craft-ui.js` is shared by 1 and 3, so 3 starts after 1 merges or rebases on it.

**Superseded:** `refine-queues`, `craft-attribute-grades`, `weapon-profiles`, `crafting-levelling-spec`. Held until the
overhaul lands (unchanged): `gear-weight`, zone tuning, the M1a E2 gate.

---

## 11. Predictions and how we check them

| Measure | Now | After the four cards | Missed if | How |
|---|---|---|---|---|
| Crafts, upgrades and refine starts in the walk's first 60 bot minutes (seed 1) | 2 crafts, 0 upgrades | at least 6 actions, the first refine before bot minute 25 | fewer than 4 | nightly walk |
| Unspent gold at minute 60 (W6 measure) | 96% | under 60% | over 75% | `health.mjs --compare` |
| Might in a winning build (dominance arms, zone 20 and 30) | in none | Heavy Might wins at least one arm per starter | in none | `hero-progression-build/arms.mjs` |
| No build or profile best everywhere | holds | still holds | one profile wins every arm | same |
| Boss bands (difficulty budget) after cards 2 and 3, before the balance pass | in band | within 5 points of band | more than 10 out | `budget.mjs` |
| First class weapon crafted, walk seed 1 | measured on the base commit when card 2 starts | no later than +1 min | later than +3 min | nightly walk |
| Saturday panel: can name the piece they craft for and why | not asked | 3 of 4 | 1 of 4 or fewer | panel notes |
| Camp visit taps | 3 to 5 | 2 to 3 | more than 3 | eyes route |
| Storehouse rows on screen at 360 px | 31 cells | at most 12 rows | more than 12 | eyes shot |

---

## 12. Saves, and how to switch it off

**No key bump** (stays `lanternfall.save.v5`). All additions are new, optional fields:
- `S.mats.coal` (one pile) and `S.mats.ingot`, `plank`, `cloth`, `leather` (five tiers each): added to `fresh().mats`;
  the loader already fills missing families (`S.mats = Object.assign(fresh().mats, o.mats)`, `30-state.js:45`).
- `registerState('refine', { v: 1, q: { forge, bench, loom: { prod, t, n, left } }, last })`.
- New item fields: `g` (grade 0 to 4) and `pf` (profile). An item without `g` is an old item and keeps its rarity, lines
  and power exactly. Items are never converted.
- Save codes (`55-savecode.js`) must accept the new families and fields and still refuse bad values.
- An Opus high save-risk review signs off card 2 before merge (the project rule for save changes).

**Switches** (all in data, all default on after the build):
- `REFINE_TUNE.on`: off means recipes and upgrades take raw materials again; middles stay in the Storehouse.
- `CRAFT_TUNE.grades`: off means new crafts roll rarity again; graded items keep their grade.
- `CRAFT_TUNE.profiles`: off means every weapon scales 0 (Balanced, no bonus).
- `CRAFT_TUNE.strike`: off means every craft comes out at the level's grade.

Turning any switch off loses no item, level or material.

---

## 13. What this leaves alone

The online layer (raid power reads build-neutral `heroAtk`, untouched); gathering curves and node gates; uniques
(drops, rules and the set design are the uniques thread's; this spec only fixes the word "tier" for sets); boss and zone
numbers (one balance pass after the build); the bag slot; Fishing and Cooking; camp art.

---

## 14. Red team and judge

Recorded in `docs/design/skilling-crafting-overhaul/red-team.md` and `judge.md`. Section 15 lists what changed.

## 15. Changes after the red team and judge

(filled in after the judge)

## Sources

- Code map: `/mnt/project-files/research/overhaul/code-map-2026-10-07.md` (file:line for every claim about today's
  code).
- Research: `/mnt/project-files/research/overhaul/` (`melvor-idle.md`, `osrs.md`, `idleon.md`, `rustys-retirement.md`,
  `fantasy-life-i.md`), with review ids.
- W7: `/mnt/project-files/research/why/W7-2026-10-07.md`. W4: `.../W4-2026-10-07.md`.
- Why review and Cal's answers: `/mnt/project-files/autopilot/reports/why-review-2026-10-06.md`,
  `why-review-2026-10-06-answers.md`.
- Inputs: `/mnt/project-files/ideas/crafting-overhaul-proposal.md`, `runescape-levelling-research.md`,
  `skilling-processing-brainstorm.md`, `skills-resources-combat-link.md`.
- `docs/design/hero-progression-build.md` (attributes, judge ruling 4), `docs/design/first-hour.md`,
  `docs/design/compass.md`, `docs/DECISIONS.md`.
