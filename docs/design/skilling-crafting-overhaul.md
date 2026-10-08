# Skilling and crafting overhaul

Design spec, 2026-10-07. Card `skilling-crafting-overhaul-spec` (P0, Opus high lead, judge gate). It takes in W7's
`craft-delta` and rewrites three held cards (`refine-queues`, `craft-attribute-grades`, `weapon-profiles`) so their ids
stay stable for the build plan; `crafting-levelling-spec` closes into this doc. Five build cards (section 11; the fifth
from Cal's 7 October preview notes, section 17), target
Fri 13 Nov, then one balance pass.

Rubric: design-doc. Coverage-map areas 10 (skills), 5 (meaningful choices), 8 (economy), 4 (overwhelm). Compass loop
step: "a 5-minute visit, steps 3 and 4" (spend what you won; set the camp working). Pillars 3 (you build your own hero)
and 2 (the camp works while you are away), inside pillar 6 (gradual depth).

How this was made: today's code mapped with file:line references
(`/mnt/project-files/research/overhaul/code-map-2026-10-07.md`); five games researched, about 11,000 player reviews
pulled from Steam and the App Store (`/mnt/project-files/research/overhaul/`); W4, W7, the 6 October why review and the
rising-games scan (`research/rising/2026-10-07.md`) read. Cal's answers file
(`autopilot/reports/why-review-2026-10-06-answers.md`) wins where sources differ. A red team ran budget sims on the
draft and found four blockers; all are fixed below (section 15). An Opus judge accepted the result with twelve required
changes, all applied (section 16). The coordinator's two asks (cadence targets, an Essence use) are sections 2 and 7b.

---

## 0. The short version

**What a player notices.** From about minute 20, crafting stops being "press Craft when Next Up says so".
- **Refining.** The Forge, Workbench and Loom each get a second job: ore and coal become ingots, logs become planks,
  fibre becomes cloth, hide becomes leather. You set a station going once and it keeps working while you fight and while
  you are away, until the order is made or its input runs out. From tier 2, gear and every upgrade use refined materials, so mining,
  chopping, foraging and hunting all get a steady customer for every hero, and coal for every hero whose gear uses ore.
- **Grades instead of a die.** Your station skill sets the grade of what you make (D, C, B, A, S). Levelling Smithing
  now always means a better craft, and you choose between a top-grade piece of this tier or a low-grade piece of the next.
- **Weapons that fit your build.** A weapon's profile (Heavy, Balanced or Swift) decides which attribute it grows with,
  so your weapon and your attribute points are one build. Might finally has a weapon.
- **The Strike, or Essence.** One tap on the timing bar while you craft lifts the piece one grade, up to A. Skip it and
  nothing is lost. Or spend Essence to lift it the same way (Infuse): Essence finally has a steady use.
- **You see why you made it.** Every craft says what it changes in the fight, and Next Up names the piece and the boss
  it is for.

**Cal's preview notes (7 Oct)** that land here (section 17): upgrades add flat numbers, not percentages (#6); five
attributes at 3 points a level, and each weapon grows with two of them, as in Expedition 33 (#21); a crafted tool goes on
by itself (#13); your gear lives on the Hero tab (#14); refine orders show "an hour" like gathering (#16); early foes
take at least three hits (#18).

**In one line (the 6 October test):** raw materials become refined ones at the station that uses them, and your skill
level, your timing and your build decide how good the gear is.

**What skilling gives a player in minutes 20 to 60** (section 2): a named piece to chase for the next boss; the first time
the camp works while you fight; a real choice at least every 8 minutes (grade or tier, Strike or Infuse, then profile);
a new thing at each beat; and a visible rise in the fight when the piece lands.

**Cadence targets** (section 2): a choice at least every 8 minutes of play in minutes 20 to 60, and at least 4 an hour
through hour 10; a new mechanic at each first-hour beat, then no gap longer than 3 hours of play through hour 10.

**Inside the ceiling:** 8 skills (max 10), one refine step each for ore, wood, hide and fibre, coal as a mining node, no
new buildings, no new currency, at most 8 cells on the Storehouse's first view (section 9).

---

## 1. The problem, with the evidence

1. **Crafting is the loop that does not carry minutes 20 to 60.** The walk made 2 crafts in 39 bot minutes and none
   after minute 6 (W7, section 3). Part of that is the bot and Next Up's repeat (`next-up-equip` owns the repeat), but the
   design gives a human little more: a craft is one tap, its quality is a die roll, and nothing between the node and the
   item asks anything of you (code map 3: instant, materials only, rarity rolled from the station level).
2. **Levels do nothing between tier gates.** Station skills reach the last gate (54) on 7,077 XP; a tier 3 craft pays 129
   (code map 1). Between gates a level only nudges the rarity odds. Cal, 3 Oct: crafting levels too fast. Melvor's
   top-voted long-play complaint: "Most skill level ups don't make you stronger at all, they just unlock recipes"
   (Steam 217236156, 1,342 h).
3. **Gathered materials and gold have nowhere to go.** Nothing sits between a node and an item. Gold: 7,800 of 8,138
   unspent at minute 60 (W6); flat at 6,840 from bot minute 17 (W7). Rusty's Retirement's long-play negatives say the
   same: "nothing to do with all your money" (review 163998348).
4. **The rarity die is a re-roll tax** (why review item 7): pick a recipe, a die picks 1x to 2.5x power; players re-craft.
5. **Might is in no winning build** (hero-progression judge ruling 4): it waits for weapons that scale with attributes.
6. **Crafted gear left in the bag** is the worst first-hour wall (W4: 3% boss wins bare, 63% in tier 1 gear).
   `next-up-equip` fixes the prompt; this spec makes the craft say what it does in the fight.
7. **Half-built pieces this closes:** Tent 5 is priced in tier 4 plank, cloth and leather that do not exist
   (`21w-data-econ.js:50`); tonics are coded but cannot be brewed (code map 7). Tents 6 to 10 cite tiers 6 to 12, which
   do not exist either; they wait for later regions.
8. **Essence piles up.** After the gold build (#180), about half of all Essence earned sits unspent at hour 10 (its
   judge; 25% before). The systems map and the rising-games gap report both name "Essence has nowhere to go".

### What other games' players say (`research/overhaul/`)

| Game | Reviews read | Skilling or crafting: praise vs complaint | What they praise | What makes them quit |
|---|---|---|---|---|
| Melvor Idle | 1,450 | 128 vs 60 (+33 paywall) | "every skill feeds into another one, and there's nothing useless" (86215735); queue it and walk away | levels that only unlock recipes; a skill nerfed after players invested (Township: 19 of 60 negatives) |
| Old School RuneScape | 4,612 | about 138 vs 65 | levels that open new things; idle skilling on the phone ("I can grind afk skills via the app very easily", iTunes 14356578764) | "press a button, wait till action is done, repeat" (234367877); "no gratification for levelling any skill except Hitpoints" (187502738) |
| Legends of IdleOn | 3,564 | 60 vs 25 by sentiment | planning what runs while away; "spreadsheeting fishing efficiency at 1am" (224566628) | too many systems at once ("too many things to do", 226957302); about 113 complexity complaints |
| Rusty's Retirement | 1,360 | relaxing 22%, set-and-watch 18% of positives | the return: "I left rusty for two hours came back and he'd grown crops" (209979602, 76 votes) | content ran out (17% of negatives); surplus with no use; a farm that "plays itself" once automated (186315344) |
| Fantasy Life i | 1,870 | 140 vs 81 (hand-coded, of 345) | crafting your own gear; "the faster you do it the better the equipment" (201232787) | one identical crafting minigame everywhere (19); unskippable animations; real-time recipe gates |

**What they say for us, by weight:**
1. A craft must change the fight, visibly, and a level must change the craft (Melvor, OSRS; Brighter Shores in W7).
2. Queue it and walk away, with a clear return. Never ask for input every few minutes (Melvor, Rusty, IdleOn).
3. One second resource that gates higher tiers is the classic hook (OSRS and Melvor coal). A web of prerequisites that
   needs a guide is the failure (OSRS Recipe for Disaster, IdleOn).
4. A short timed input is liked when it sets quality and can be skipped; it is hated when long, identical everywhere,
   or the only way to get full quality on bulk work (Fantasy Life i).
5. Never devalue what players already hold (Melvor Township; the rising-games scan's Forge Master: "I was at 5.7mill
   power and then the update ... power has dropped to 3.5 mill").
6. New mechanics must keep arriving through the first hours (rising-games scan: Sandustry "after the first threeish
   hours there are no new mechanics, just grinding").

Limits: no human has played our build; game wikis, Reddit and Google were blocked, so other games' mechanics come from
search snippets or memory and are marked in the research files; review labels are single-pass counts, about +/-10%.

---

## 2. Minutes 20 to 60, and the hours after

Times are `docs/design/first-hour.md`'s human estimates (Wren). Bot times run faster. At most one new thing per beat;
player acts still pass through the 90 s unlock gap where the governor applies.

| Time | Beat | What the player does | New thing |
|---|---|---|---|
| ~12:30 | Workbench and first tool (today) | crafts from raw | none: tier 1 needs no refining |
| ~16 to 22 | First class weapon (today) | crafts it; it is Balanced; the result card says, for example, "Gloomjaw now takes 6 hits, not 9" | **the fight change on the result card** (card `craft-delta`) |
| ~22 to 28 | The first upgrade (gold's first big use). Tobin's Copper Warblade +1 takes 2 Copper Ingots and 1 Pine Plank; Wren's Pine Bow +1 takes 2 Pine Planks and 1 leather; Pip's Pine Staff +1 takes 2 Pine Planks | sets the station going from Next Up, goes back to the road | **refining**: the camp works while you fight. Tobin also meets **coal** here: the Coal Seam shows the first time an order needs an ingot. Two stations at once is one idea (an order on a station), set from one Next Up line |
| ~28 to 35 | Second craft at a station | taps the bar while it crafts | **the Strike** |
| ~30 to 45 | Woodcraft or Smithing reaches gate + 3 | Next Up: "Pine Bow at grade C is ready to make" | **grades**: a level means a better craft |
| ~40 to 50 | A craft the Strike cannot be trusted on (the player missed one) | "Infuse to grade B: 6 Essence" on the recipe row | **Infuse**: Essence lifts the grade (section 7b) |
| ~45 to 60, or after the first time away | Tier 2 opens (zone 7, Woodcraft 10); Next Up names it for the zone 10 Champion: "Birch Bow for the zone 10 Champion: 5 Birch Planks, 2 Duskfang Leather" | chops, hunts, refines, crafts; picks grade A Pine or grade D Birch | **the second refine** where a hero has not met it (Pip: cloth; Tobin: leather for the Plate; Pip's ingots and coal with the Lantern) |
| at the first tier 2 weapon | the weapon screen offers Heavy, Balanced or Swift | picks one | **profiles** (Retune comes later) |
| after Hands open (Hearth 2, Tavern) | a Hand works the Coal Seam while the Forge smelts | plans what runs while away | the IdleOn-style away plan Cal asked for (no new system) |

### Cadence targets

The rising-games gap report names two places we trail: **a choice every few minutes** and **a new mechanic every few
hours** (`research/rising/new-mechanic-gaps.md`, section 4). This spec sets a number for each.

**A choice** is a moment where the player picks between two or more things they can afford, and the pick changes what
they fight with or what the camp makes. In this spec: grade-or-tier (Copper A or Iron D), Strike or Infuse or neither,
the profile, which order to put on a station, and where the gold goes (upgrade, Retune, Reforge pick, crew, station
level). Pressing a button that has one sensible answer is not a choice. Every craft names its choice on the recipe row.

| Window | Choice target | New-mechanic target |
|---|---|---|
| Minutes 20 to 60 | at least one choice every 8 minutes of play (5 or more in the 40 minutes) | one new thing at each beat in the table above (6 beats in 40 minutes), never two at once |
| Hours 1 to 3 | at least 4 choices an hour | Retune (first re-make of a weapon); grade A and its medium moment |
| Hours 3 to 10 | at least 4 choices an hour | no gap longer than 3 hours of play between new mechanics (schedule below) |

**After the first hour, one new mechanic every few hours to hour 10:** Retune at the first re-make of a weapon (hour 1
to 2); grade A and its medium moment (hour 1 to 3); tier 3, the first piece needing leather from Transmuted hide, and
the third order on a station (hour 3 to 5); Reforge as "pick the line" (hour 3 to 5); station levels that speed refining
(hour 4 to 7); tier 4 (zone 19, hour 6 to 10). Tonics come with the balance pass (section 8), which fills the hour 7 to
10 stretch if tier 4 arrives late. Other threads add their own (the Deepwell, `night-road`); this spec only counts its
own.

**How we measure it.** Card `craft-delta` makes the craft screen and Next Up emit `emit('choice', kind)` when a choice is
shown and taken, and `emit('firstUse', kind)` at each mechanic's first use (no save field); the walk log and `sim.mjs`
timeline report the gaps. Missed if the walk shows a gap of more than 15 minutes with no choice in minutes 20 to 60, or a gap of more than 4
hours of sim play with no new mechanic before hour 10 (section 12).

What this fills, against W7's table: a named item to chase, crafting that changes the fight visibly, a choice at least
every 8 minutes, and a reason to come back (stations work while you are away).

---

## 3. Skills

**The list stays at 8:** Mining, Woodcutting, Foraging, Hunting (gathering), and Smithing (Forge), Woodcraft
(Workbench), Tailoring (Loom), Enchanting (Enchanter's Table). Refining earns the station's own skill. No new skill; the
cap of 10 leaves two slots, held for Fishing and Cooking after Chapter 1. Copy names the right skill per station: Wren's
and Pip's weapons are Woodcraft, Tobin's Smithing.

**Gathering skills keep their curves and node gates** (1/14/30/64/112). Two known gaps, out of scope but named: tier 4
and 5 hide have no Hunting node (Transmute only), and tier 5 nodes open at 112 against tier 5 items at 54. Tier 5 is
region 2 material.

**Station skills: the gates follow the road, the levels between them slow down.** Tier gates stay at levels 1, 10, 22,
36 and 54. The rule for the curve:
- **Gate by the road.** A kept-up player reaches each tier's gate no later than the zone that opens that tier
  (`PACE.essTier`: tier 2 at zone 7, tier 3 at 13, tier 4 at 19, tier 5 at 42). Otherwise every player is a tier
  behind, which the budget's `behind` row shows is a wall (z20 casual 4/11/4).
- **Grades between gates take time.** A kept-up casual player reaches grade A on a tier (gate + 10) by the tier's zone
  + 3: zone 10 for tier 2, zone 16 for tier 3, zone 22 for tier 4. Grade S (gate + 15) is the long tail: tier 4 S
  (Smithing 51) no earlier than zone 35.
- **XP comes mostly from refining** (2 x tier per unit), so a station that works while you are away levels too. Card 3
  shows refining gives at least half of a kept-up player's station XP.
- **Re-crafting cheap items stops paying.** Today a Copper Warblade gives 20 XP for 9 raw materials, about twice what
  smelting the same ore gives. Rule (provisional): a craft below your highest open tier pays a tenth of its XP. Re-making
  a piece at a better grade on your current tier pays in full.

The curve may need a different fit per tier (a jump at each opening, a crawl from zone 22 to 42); the card may fit it in
pieces. Card `craft-attribute-grades` fits `SKILL_TUNE` to these rules with `node tools/sim.mjs --report skills` and records the
table (level reached by zone, for the casual and good personas). No level cap: today's saves have none, and the station
Deeds ask for 150. Past S on tier 5 (level 69), levels add nothing new; that is the long tail.

Old saves keep their level, and their XP bar keeps its share of the current level, mapped once behind a version flag
(the hero-progression rule).

---

## 4. Coal and the four middles (one refine step)

### The rule
**Tier 1 gear is made from raw materials, as today. From tier 2, and for every upgrade, gear takes refined ore, wood,
fibre and hide.** Crystal, herb and Essence stay raw. Tools, charms and trinkets stay raw.

Tier 1 stays raw because the first-hour chain (first tool, first weapon) is tuned and measured, and W7 asks for the first
craft to be easy. Refining then arrives with the first upgrade (about minute 22 to 28) and tier 2 (minutes 40 to 60),
the window this spec is for. Every family is refined, not only the main one, so each hero uses at least two stations:
Tobin ingots and planks (Warblade) and leather (Plate); Wren planks (Bow) and leather (Leathers, Hood); Pip planks
(Staff), cloth (Robe) and ingots (Lantern). No class's crafting is shallower than another's (Cal, answer 5). Wren's gear
has no ore today (Cal's class table: Ranger is wood, hide and fibre), so Wren never smelts; her Mining feeds tools and
the camp. That is accepted, not hidden: Wren works two stations, Tobin and Pip three.

### The table

| Middle | Station (second job) | One unit takes | Time per unit, tier 1 to 5 | XP per unit |
|---|---|---|---|---|
| **Ingot** | Forge: Smelt | 2 ore + coal: 1 / 2 / 3 / 4 / 4 | 15 / 25 / 40 / 60 / 90 s | 2 x tier |
| **Plank** | Workbench: Saw | 2 logs | same | 2 x tier |
| **Cloth** | Loom: Weave | 2 fibre | same | 2 x tier |
| **Leather** | Loom: Tan | 2 hide + 1 log of any tier, lowest first ("tanned with oak bark") | same | 2 x tier |

- **Coal** is one pile, ungraded, stored as a five-slot family that uses slot 1 only (so save codes and the parity tool
  read it like every other family). The Coal Seam is a Mining node beside the Copper Vein, open at Mining 1, shown the
  first time a recipe needs an ingot. Same swing time and XP as copper. Hands can work it like any node.
- **Recipe conversion.** Each refined family's count halves, rounded up. A tier 2 Iron Warblade (today 9 Iron Ore, 5
  Birch Log, 3 Essence) becomes 5 Iron Ingots and 3 Birch Planks (10 ore, 10 coal, 6 logs) and 3 Essence.
- **Upgrades.** The material part of `kindUpgradeCost` converts the same way. The gold part belongs to the
  `gold-without-training` build (provisional prices). So the upgrade, gold's biggest sink, also pulls raw materials
  through the stations.
- **Tent 5** becomes buildable when its zone arrives (zone 50): its tier 4 plank, cloth and leather now exist. Tents 6
  to 10 cite tiers 6 to 12 (`21w-data-econ.js:51-55`) and wait for later regions.

### How a station works
- Each of the Forge, Workbench and Loom has a short **order list: up to 3 orders, run in turn.** An order is a product
  at a tier and an amount. The Loom needs this most (Weave and Tan); it also covers two tiers at once. Each order **runs
  until its amount is made, the input runs out, or the Storehouse pile is full**, says which, and the next order starts.
  No length cap and no Refill needed: set it once and it keeps going (Cal's rule, answer 5).
- **Amounts never drain your piles by surprise.** An order started from a shortfall (Next Up, or a recipe row's offer)
  defaults to the shortfall: "Smelt 3". An order set to All keeps a reserve of each input, shown on the row ("keeps 24
  Iron Ore"); provisional 20% of each input pile. Camp builds, tools and Trade runs still find ore and logs.
- It runs on the wall clock **while you fight and while you are away**, under the same away cap as gathering (4 to
  24 h). Nothing to collect: output goes to the Storehouse.
- **Station levels buy speed:** +10% refining speed a level (Lv 2 to 5). Station builds become a skilling sink.
- **No unit takes longer than a zone fight in the first hour:** tier 1 and 2 units take 15 and 25 s. A first tier 2
  weapon's batch is done within about four fights, while you play them.
- No fail chance, no quality grade on refined goods, no alloys (Cal's ceiling).
- The away report gains one line per station: "The Forge smelted 24 Iron Ingots (stopped: out of coal)."
- A recipe or upgrade short of a middle says so in its row and offers the order in one tap: "Short 3 Iron Ingots.
  Smelt 3 (6 Iron Ore, 6 coal)?" Card 2 exports `refineOffer(cost)`; card 3 puts the offer on the craft screen.
- **Never sold.** Refining time, speed and amount are never for money (Lantern Rule 4: never build friction to sell its
  removal).

### Where it shows
- The Storehouse's first view shows **one cell per family at your current tier (`zoneTier(S.maxZone)`): 6 raw
  families, Essence, coal = 8 cells.** A refined family's count sits in the same cell as its raw one ("Iron Ore 120 ·
  Ingots 40"). Other tiers fold out on tap. Middles get Storehouse caps (group 0.5, as hide); coal gets group 1, like
  ore.
- Until vetted icons land (art card, section 11), a middle shows its raw family's existing icon with a text label
  ("Ingot"). No code-drawn or tinted icon. The Coal Seam reuses the Copper Vein's scene, shown as drawn (no redraw, no tint), with its own name. The art judge
  rules on this before card 2 merges; if it counts as a stopgap under the art freeze, coal drops from the Copper Vein
  instead (1 coal for every 2 copper) until the Coal Seam still lands, and no new node shows.

---

## 5. Grades replace the rarity die

### Words (fixes the three meanings of "grade" the uniques review found)
- **Tier**: the material step (Copper, Iron, Silver, Cobalt, Mithril). Players read the material name.
- **Grade**: the letter D, C, B, A or S on a crafted piece, set by skill, lifted by the Strike or by Essence.
- **Rarity** words stay on items made before this change and on uniques. A graded item also carries a rarity twin in
  its existing `r` field (below), so old code paths and save codes keep working.
- Sets (uniques thread) key on **tier**: four pieces of the same material step.

### Grade comes from your level
Levels past the tier's gate set the grade: **D at the gate, C at +3, B at +6, A at +10, S at +15.** On Copper (gate 1)
that is C at 4, B at 7, A at 11, S at 16. So at Smithing 12 you can make Copper at grade A or Iron at grade D. The recipe
row shows the grade before you craft.

| Grade | Power multiplier | Rarity twin (`r`) | Bonus lines | Weapon scaling | Moment |
|---|---|---|---|---|---|
| D | 1.0 | common | 1 | 0.10 | none |
| C | 1.35 | uncommon | 2 | 0.20 | none |
| B | 1.55 | uncommon | 2 | 0.30 | none |
| A | 1.8 | rare | 3 | 0.42 | medium |
| S | 2.5 | epic | 4 | 0.55 | medium |

The multipliers reuse today's rarity values (B is new, between) and are fixed: they must equal the rarity values, or old
items move against new ones. Balance moves through the curve and the lift, never these. **No item a player owns changes**: old items keep their
rarity, lines and power exactly, and an old Epic stays as good as a new S. Copper S (2.5 x 10 = 25) against Iron D
(1.0 x 22 = 22) is a real choice, and so is Iron A against Silver D.

Power reads the grade's multiplier when `g` is set, else the rarity's. If the grades switch is ever turned off, a grade B
item reads as uncommon (1.35): a small, stated drop on that one grade, and nothing breaks.

### The rest of the die goes too
On a graded item, bonus lines come in the class pool's fixed order (each class's signature stat first) at a fixed
middle roll. **Reforge becomes a choice on graded items:** swap one line for a pool stat you pick, at today's Reforge
price. Old items keep the random Reforge. Masterwork still adds a line for a Trophy.

### The kept-up footing (what the budget assumes)
The judge's budget runs (`skilling-crafting-overhaul/judge.md`, top table) show one grade step is wider than the casual
Captain band: an S weapon puts casual Captains 10 to 20 points over, and a just-opened tier puts them 15 to 45 under.
So the old fixture "rare +5" does not map to one grade. **Card 3's budget fixture wears, at each row, the grade
`sim.mjs --report skills` gives a kept-up casual at that zone, at +5.** The casual lifts the weapon only; the good player
lifts every piece; both capped at A. The fixture also runs a casual who lifts every piece with Infuse; both casual rows
are checked.

**The opening dip, zones 19 to 21.** When tier 4 opens, a kept-up player wears tier 4 at C or B, or tier 3 at S: 19 to 59
casual against a band of 60 to 80, and a missed lift at tier 4 D is a wall (3 to 16). Tier 3's opening (zones 13 to 15)
has a first-time footing; tier 4's has none. The balance pass owns new budget gaps here and closes them through the
curve or the boss knots. **Card 3 does not reach the live artifact before the balance pass.**

### The Strike
Crafting a piece shows the parry timing bar once, holding the game for that second (`holdGame`). Tap in the window and
the piece comes out **one grade higher, never above A**. Grade S comes only from your level. When the bar cannot lift
(your level's grade is already A or S, or you Infused), it does not show. No tap, or a miss, and the piece comes out at
your level's grade. Materials are never lost. It uses the parry bar's look and sound (no new
art), widens with Assist (`turnAssistX`) and follows reduced motion as the parry bar does. Each station names it
(Strike, Carve, Stitch, Etch). Refining has no Strike: bulk work stays idle. A routine craft is still three taps
(recipe, Craft, Equip); the Strike is a tap you may add. The first class weapon has no Strike; it arrives at the second
craft at a station.

Why: our core verb (timing) at the moment of making, which both OSRS's and Fantasy Life's players ask for ("one short
foreground moment"; "the faster you do it the better the equipment"). Crafts are few (one per slot per tier, plus
re-makes), so it cannot become Fantasy Life's tedium. The cap at A keeps one tap from beating the band: the A to S step
alone is 10 to 20 points of casual win rate. Switch: `CRAFT_TUNE.strike`.

---

## 6. Weapon profiles: your weapon is part of your build

When you craft a tier 2 or higher weapon you pick a profile; tier 1 weapons are Balanced. Unique weapons take no profile:
they keep their own effects and read as Balanced with no lift. The noun follows the hero's
weapon family, the art is the hero's own weapon, and **no profile changes Speed** (the red team's sims showed Speed moves
win rates in steps, 65 to 48 for z20 Wren at -10%).

| Profile | Grows with | Channels it lifts in a turn fight | Strength | Wren | Tobin | Pip |
|---|---|---|---|---|---|---|
| **Heavy** | **Might** | Attack and counters | full | Warbow | Greatsword | Greatstaff |
| **Balanced** | **Focus** | abilities | half (Focus already leads) | Bow | Warblade | Staff |
| **Swift** | **Guard** | counters, and +10 ms parry window at grade A and S (inside Guard's 60 ms cap, `HERO_TUNE.guardMs`) | full | Shortbow | Sabre | Wand |

**Scaling:** each lifted channel is multiplied by `1 + scaling(grade) x strength x share`, where `share` is that
attribute's points after the soft cap over all the hero's spent points. Hooks: the `attrRel` lines in `turnMakeProfile`
(`59k-turn.js:308, 313, 322`). Outside turn fights (away, raid, farm zone, Deepwell depth) power stays build-neutral, so
away and raid damage do not move. One online number does: the `raiders` doc's `gear` is `gear().score`
(`80-online.js:10`); grades use today's rarity multipliers, so its scale is unchanged.

**The gate before card `weapon-profiles` merges** (red team B3): `arms.mjs` with profiles, zones 20 and 30, the three
starters. Might plus Heavy wins at least one arm per starter, Focus plus Balanced is not best on both foe types, and no
profile is best everywhere. If it fails, the coefficients move; the rule stays.

Vigour gets a weapon through card 5 (Heavy's second attribute, section 17); survival still comes mostly from armour and Vigour points. **Armour has grades but no profile** in this
overhaul. Cal's answer 7 asked for an armour secondary stat; it is deferred for scope (veto line in section 13).

**Retune:** change a weapon's profile at the Forge for gold, 1.5x more each time, from the Reforge base price. Counter
in a new item field `rn`.

---

## 7. Gold: three sinks, and the pick

Rule from 6 October: **gold buys means, not stats.** The `gold-without-training` build (running) makes +1 to +10 upgrades
gold's main sink with provisional prices; this spec adds the materials side and names the other sinks.

| Option | What gold buys | Grows with the road | Forecast (the balance pass checks it) |
|---|---|---|---|
| **A. The Forge** | upgrades (gold plus middles), Retune, Reforge | yes, by tier | the main sink; the upgrade build found upgrades stall at +7 on gold today; with middles the stall becomes materials, which the stations feed. About half of gold spent. |
| **B. The crew** | Hands (hire, shifts) | yes, by region | Hands on coal and logs feed the stations while away. About a quarter. |
| **C. Supplies and buildings** | station levels (refine speed), Storehouse, Tents, later tonics | yes, by region | station levels gain a skilling job; Tent 5 only from zone 50. A quarter or less in Chapter 1. |

**Pick: all three in Cal's split, Forge 50, crew 25, supplies and buildings 25.** The `gold-without-training` card owns
that split and its sim; the balance pass after this build retunes it once, with middles in place. Target for that pass:
at minute 60 and at each wall, unspent gold under 60% of earned (W6 today: 96%), and no sink always the right buy.
Crafting itself stays free of gold, so the first craft never waits on gold.

Spare materials late game: every refined family feeds upgrades at every step, and Tent 5 takes middles in bulk.
A lever the balance pass may pull but this spec does not: Trade runs carrying middles for a little more than raw.

---

## 7b. Essence: Infuse

**The problem.** Essence drops from every fight and goes into recipes, upgrades and Reforge. After the gold build (#180)
about half of it sits unspent at hour 10 (its judge; 25% before). A pile that only grows makes crafting look empty.

**The use: Infuse.** On the recipe row of any piece (not tools, not refining), the player may spend Essence of the
piece's tier to lift it one grade, never above A: the same lift as the Strike. One lift a craft: the Strike or Infuse,
not both. So the timing bar is the free way to a better piece and Essence is the steady way, for a player who misses
taps, plays with reduced motion, or wants a sure result on a costly piece. Each craft gains a named choice (Strike,
Infuse, or neither), and Essence has a use that grows with the road: every re-make at a better grade, every slot, every
tier.

- **Price** (provisional, balance pass): 3 x the recipe's Essence count, at the piece's tier, from tier 1 (Copper
  Warblade: 6 Essence). Recipes with no Essence (Plate, Mitre, Quiver) use 3.
- **Never sold** (Lantern Rule 4), and Essence itself is never sold.
- **Budget:** the lift is the same as the Strike's and capped at A, so the casual who Infuses every piece wears the
  good player's grades; card 3's fixture checks that row (section 5).
- **Target:** unspent Essence at hour 10 back to 30% or under (`health.mjs`, 10-hour sim), with no Essence-only power:
  Infuse buys what timing also buys.
- Retune also takes a little Essence (provisional: the Reforge base Essence), so the profile change uses both gold and
  Essence.

Alternatives weighed for Essence: a refining flux (Essence per ingot) adds a second input to every order and a tier
mismatch; a separate Essence shop of stat boosts is "gold buys stats" by another name; converting Essence to gold makes
it a second gold. Infuse uses an existing lift and adds no screen.

---

## 8. Herbs and tonics: with the balance pass, not before

Tonics exist in the core (Vigor +15% damage, Forager's Draught +25% gathering speed, Mending Draught +20% healing, 20
minutes, one active) but cannot be brewed. The red team's sims show Vigor's +15% moves the zone 10 Champion from
56/48/49 to 76/70/71 (band 40 to 60): an always-right buy. So **Brew is a follow-up card (`tonic-brew`) that runs with
the balance pass**, gated on `budget.mjs` with each tonic on. Forager's and Mending first; Vigor only at a strength that
keeps every boss in band. Herb keeps its gear uses until then. The bag slot stays out of M1 (judge, 2026-10-06).

---

## 9. The ceiling, checked

| Ceiling (6 Oct) | After this spec |
|---|---|
| At most 10 skills | 8 |
| One refine step for ore, wood, hide | one step each, plus fibre to cloth (Cal's answer 5) |
| Coal as a mining node | yes, one grade |
| No new buildings | none: refining is a second job on the Forge, Workbench and Loom |
| Camp visit in 3 taps | unchanged: a station keeps refining until its input runs out, so a visit needs no new tap; changing a product is Camp, station, product |
| Routine craft in 3 taps | recipe, Craft, Equip; the Strike or Infuse is an optional tap; the profile pick is remembered |
| At most 12 piles on screen | 8 cells on the Storehouse's first view (refined counts share their raw family's cell) |
| At most 8 named currencies | no new currency; coal is a pile; Essence gains a use, not a twin |
| Weapons scale with attributes | yes, by profile |
| No idle combat | none: refining is idle, fighting and the Strike are hand-played |

---

## 10. Alternatives weighed

| Idea | Pick | Why |
|---|---|---|
| Craft Rating with aim-then-roll odds (3 Oct proposal) | no | another die; Cal's point is to remove the die |
| One flat power multiplier for every grade | no | red team: not power-neutral (z10 Champion 56 to 72, z20 Captain 65 to 19) and makes "next tier at D" always right |
| A slower curve everywhere | no | red team: puts tier 4 hours behind zone 19, a wall; slow the levels between gates instead |
| Speed on profiles (Heavy -10%, Swift +10%) | no | red team: steps in win rates, Heavy a trap; channels instead |
| Fail chance on early tiers (OSRS) | no | Cal's ceiling; Fantasy Life's material loss is a top complaint |
| Quality grades on refined goods | no | ceiling; doubles the piles |
| A new Smelter or Tannery building | no | ceiling: no new buildings |
| Refining only the main material | no | red team: then coal serves only Tobin |
| A queue length cap (20 to 100) | no | red team: empties in 5 to 13 minutes; runs until input runs out instead |
| One refine row per station | no | judge: the Loom makes two middles; a short order list (up to 3) instead |
| The Strike lifting to S | no | judge's budget runs: the A to S step alone puts casual Captains 10 to 20 points over |
| Essence as a refining flux, a stat shop, or gold | no | section 7b: a second input on every order; "gold buys stats" again; a second gold |
| Hands staffing a station | later | stations already run on their own; staffing adds a screen. Cal's answer 5 allowed it; deferred (veto line) |
| Level 50 specialisations | no | over the ceiling for M1 |
| Master Orders (an order board) | no | Tavern Contracts make the active gold earner |
| A crafting minigame with several inputs | no | one optional tap; Fantasy Life's long identical minigame is its top crafting complaint |
| Tonics now | later | +11 to +22 boss points (red team); with the balance pass |

The 3 October brainstorm's five questions: **scope** ore, wood, fibre and hide, not crystal or herb; **active or idle**
refining idle, crafting active; **fail chance** none; **specialisations** no; **order board** no (Contracts).

---

## 11. Build cards

Written to `/mnt/project-files/autopilot/cards/`. Target: all five merged by Fri 13 Nov, then one balance pass.
Each card carries its own tool changes (the red team found the budget, arms, sim personas and walk bot blind to this
change), so its prediction can be measured.

| # | Card | What a player gets | Model | After | Owned files (all exist unless marked new) |
|---|---|---|---|---|---|
| 1 | `craft-delta` (amended) | the result card shows the fight change; Next Up names the piece and its boss, and offers upgrades; tools go on by themselves; gear moves to the Hero tab (built by `cal-0107-gear-and-rates`); choice and first-use events for the cadence measure | Sonnet medium | `next-up-equip` | `75-craft-ui.js`, `75-moments-ui.js`, `55-goals.js`, new `75-hero-gear-ui.js`, `tools/walk.mjs` (Go words, choice log) |
| 2 | `refine-queues` (rewritten) | coal, the four middles, order lists on three stations while you fight and while away, recipes and upgrades from tier 2 use middles; exports `refineOffer(cost)` | Sonnet medium lead with 2 builders; Opus high save review | `gold-without-training` | Builder A (data, state, store, save codes, parity): `21-data-craft.js`, `30-state.js` (mats), `41-items.js` (costs), `55-store.js`, `75-store-ui.js`, `55-savecode.js`, `tools/offline-parity.mjs`. Builder B (refining, gathering, away): new `55-refine.js`, new `75-refine-ui.js`, new `60-refine.css`, `55-gathering.js` (coal node), `tools/sim.mjs` (personas, and the choice and first-use timeline); may touch `72-ui-gather.js` (Coal Seam row) and `57f-hands.js` (Hands on coal) |
| 3 | `craft-attribute-grades` (rewritten) | grades D to S replace the die, fixed lines, Reforge as a pick, the Strike, Infuse, the shortfall offer on the craft screen, the station curve pinned to the road, re-craft XP, upgrades as flat numbers | Sonnet medium; Opus high combat and save review | `refine-queues`, `craft-delta` | `55-crafting.js`, `40-rules.js`, `20-data.js` (`SKILL_TUNE`), `41-items.js` (lines), `75-craft-ui.js`, `58-deeds.js`, `55-savecode.js` (`g`), `tools/budget.mjs`, `tools/sim.mjs` (skills report, after card 2), new `skilling-crafting-overhaul/curve.md` |
| 4 | `weapon-profiles` (rewritten) | Heavy, Balanced, Swift with attribute scaling, Retune | Sonnet medium; Opus high combat review | `craft-attribute-grades` | `59k-turn.js` (three hooks), `55-crafting.js` (Retune), `75-craft-ui.js`, `55-savecode.js` (`pf`, `rn`), `docs/design/hero-progression-build/arms.mjs` |
| 5 | `five-attributes` (new, Cal's note #21) | Luck as a fifth attribute, 3 points a level, each weapon grows with two attributes | Opus high; judge gate | `weapon-profiles` | section 17 |

Also written: `art-refined-materials` (icons for coal and the four middles, and the Coal Seam; whichever art lane the
14 Oct art decision opens; not blocking: text labels until then) and `tonic-brew` (after the balance pass).

Order: 1 and 2 at the same time (no shared files; card 2's two builders hold separate files). 3 after both. 4 after 3.
5 after 4, then the balance pass.
Card 3 merges behind its switches and does not reach the live artifact until the balance pass closes the zone 19 to 21
dip (section 5). Shared files are handed on, never edited by
two cards at once. `gold-without-training` (running) owns the upgrade gold price and `50-sim.js`; card 2 changes only
the material side and uses `on('away')` in its own file, not `50-sim.js`. `first-gold-and-camp-strip` and
`set-bonus-build` read their dependency as `craft-attribute-grades`, which keeps its id.

**Held until the overhaul lands (unchanged):** `gear-weight`, zone tuning, the M1a E2 gate.

---

## 12. Predictions and how we check them

| Measure | Now | After the five cards | Missed if | How |
|---|---|---|---|---|
| Craft, upgrade and refine actions in the walk's first 60 bot minutes (seed 1) | 2 crafts, 0 upgrades | at least 6, the first refine by bot minute 25 | fewer than 4 | nightly walk (card 1 adds the Go words and upgrade goal) |
| Choice cadence, minutes 20 to 60 (walk seed 1, `choice` events) | not measured; W7: reveals but few decisions | a choice at least every 8 minutes, 5 or more in the window | any gap over 15 minutes | walk log (card 1) |
| Choice cadence, hours 1 to 10 (sim casual) | not measured | at least 4 an hour | any hour with fewer than 2 | `sim.mjs` timeline (card 1 events) |
| New-mechanic cadence to hour 10 (sim casual, `firstUse` events) | not measured | one at each first-hour beat; no gap over 3 hours | a gap over 4 hours | `sim.mjs` timeline |
| Unspent gold at minute 60 (W6 measure) | 96% | under 60% after the balance pass | over 75% | `health.mjs --compare` |
| Unspent Essence at hour 10 | about 50% after #180 | 30% or under after the balance pass | over 40% | `health.mjs`, 10-hour sim |
| Refining's share of station XP (kept-up casual) | 0 | at least half | under a third | `sim.mjs --report skills` (card 3) |
| Might in a winning build | in none | Heavy Might wins at least one arm per starter | in none | `arms.mjs` with profiles (card 4) |
| No build or profile best everywhere | holds | still holds | one profile wins every arm | same |
| Boss bands after cards 2 to 4, before the balance pass | in band | every row within 5 points of its band, except zones 19 to 21 (the opening dip, owned by the balance pass) | any other row 10 or more out | `budget.mjs` on the skills-report footing (card 3) |
| Tier gate reached by its zone (kept-up casual) | not measured | gate level by the zone that opens the tier; grade A by that zone + 3; tier 4 S not before zone 35 | any tier gate later than its zone + 2 | `sim.mjs --report skills` (card 3) |
| First class weapon crafted, walk seed 1 | measured on card 2's base | no later than +1 min | later than +3 min | nightly walk |
| Saturday panel: can name the piece they craft for and why | not asked | 3 of 4 | 1 of 4 or fewer | panel notes |
| Storehouse first view at 360 px | 31 cells | 8 cells | more than 12 | eyes shot |
| Hits a kept-up hero needs on a normal foe, zones 1 to 6 (Cal's note #18) | 1 (Cal, preview) | at least 3 | any zone at 1 | `budget.mjs` early rows (player-notes fix, kept by card 3) |
| Attributes in a winning build (card 5) | Might in none | all five in at least one | any in none | `arms.mjs` with five attributes |

---

## 13. Saves, switches, and what changed for players

**No key bump** (stays `lanternfall.save.v5`). All additions are new, optional fields:
- `S.mats.coal`, `ingot`, `plank`, `cloth`, `leather`: five-slot arrays in `fresh().mats`; the loader already fills
  missing families (`S.mats = Object.assign(fresh().mats, o.mats)`, `30-state.js:45`). Storehouse caps for each.
- `registerState('refine', { v: 1, st: { forge: [], bench: [], loom: [] } })`: each station holds an array of up to 3
  orders `{ prod, tier, want, made, all, at }` (`at` is the running unit's progress), run in turn.
- New item fields: `g` (grade 0 to 4), `pf` (profile), `rn` (retunes). Graded items keep `r` (the rarity twin). An item
  without `g` is an old item and keeps its rarity, lines and power exactly. **Items are never converted.**
- Station XP bars map once to the new curve behind a version flag (`S.craft.xpv`).
- **Old saves past gate + 15 craft S at once.** Live saves keep fast-curve levels, so a player at Smithing 51 or more
  makes tier 4 S on day one. Good for them; it raises their raid gear Might. Shapes are unchanged (the raid doc's `gear`
  stays `gear().score` on the same scale). The balance pass checks the world raid's time to kill.
- Save codes accept the new families and fields and still refuse bad values. The parity tool gets a refining fixture.
- An Opus high save-risk review signs off card 2 before merge, and card 3 for the item fields.
- **What changed for you:** one card the first time an old save opens the Craft tab after card 2: "The Forge has a
  second job. Your gear is unchanged." Old gear never loses power (the rising-games scan's top update complaint).

**Switches** (data, default on in code; card 3's three are held off in the weekly release until the balance pass):
`CRAFT_TUNE.curve` (off: today's `SKILL_TUNE` craft curve and full re-craft XP); `REFINE_TUNE.on` (off: recipes and upgrades take raw again; middles stay stored);
`CRAFT_TUNE.grades` (off: new crafts roll rarity again; graded items read their twin); `CRAFT_TUNE.profiles` (off: no
scaling); `CRAFT_TUNE.strike` (off: every craft at the level's grade); `CRAFT_TUNE.infuse` (off: no Essence lift). No switch loses an item, level or material.

**Veto lines for Cal** (deviations from his answers file): armour gets no secondary-stat choice yet (answer 7); Hands
do not staff stations yet (answer 5); Reforge stays on graded items as a line pick rather than becoming Retune (answer 7
named Retune for the profile change, which this spec has).

---

## 14. Red team and judge

Red team: `docs/design/skilling-crafting-overhaul/red-team.md` (4 blockers, 11 majors, 10 minors, with budget sims).
Judge: `docs/design/skilling-crafting-overhaul/judge.md`: **accept with required changes.** Rubric: evidence 5, problem
fit 4, alternatives 5, buildable 3, prediction 4, reversibility 4; all hard checks pass. Fixed: the grade multipliers.
Accepted: no level cap, Reforge as a pick, tier 1 raw and the rest refined, the profile channel rule. Provisional for
the balance pass: refine ratios, coal per ingot, unit times, grade thresholds, weapon scaling, profile strengths, the
gold split, Infuse's price. The judge recommends Cal upholds all three veto lines (section 13).

## 15. What changed after the red team

| Finding | Change |
|---|---|
| B1 flat 1.35 base not power-neutral | grade sets the multiplier, reusing rarity values (1.0, 1.35, 1.55, 1.8, 2.5) |
| B2 slower curve puts gates behind the road | gates pinned to the zone that opens each tier; only the levels between gates slow |
| B3 profiles: Heavy a trap, Focus dominant, Speed steps | no Speed change; Heavy lifts Attack and counters; Balanced at half strength; an `arms.mjs` gate before merge |
| B4 no rarity crashes the game | graded items keep `r` as a rarity twin |
| M1 queue empties in minutes | no length cap; runs until input runs out; station levels buy speed |
| M2 tools blind | each card owns its tool changes (budget, arms, sim personas, walk words, parity) |
| M3 tonic +11 to +22 points | tonics move to the balance pass with a budget gate |
| M4 coal only for Tobin | every refined family converts from tier 2: Tobin and Pip smelt, Wren does not (accepted, stated); each starter uses two or three stations |
| M5 leather adds a Woodcutting 64 gate | tan with a log of any tier, lowest first |
| M6 save gaps | coal as a five-slot family; caps for middles; `rn` for Retune; a version flag for XP; no level cap; Deeds read the twin |
| M7 ceiling miscounted | Storehouse first view 8 cells; no Refill tap; routine craft stays 3 taps |
| M8 two new things in one beat | first weapon Balanced with no Strike; Strike, grades, coal and profiles spread over minutes 22 to 60 |
| M9 art | text labels on existing icons until an art card lands; Coal Seam reuses the Copper Vein scene |
| M10 card size and clashes | card 2 gets two builders and the full file list; cards keep the old ids; `50-sim.js` left to its owner |
| M11 the die is still there | fixed line order and roll on graded items; Reforge becomes a pick |
| Minors | Copper grade levels fixed; Strike holds the game; per-station skill names; veto lines; raid score noted; Tents from zone 50; Cal's split restored; timer rule restated |

## 16. What changed after the judge

| # | Required change | Where |
|---|---|---|
| 1 | The Strike lifts one grade, never above A; S only from level; no bar when it cannot lift | section 5 |
| 2 | Budget footing is the skills report's grade at each zone (casual lifts the weapon, good every piece, both capped at A); A by the tier's zone + 3; tier 4 S not before zone 35 | sections 3, 5 |
| 3 | The zone 19 to 21 opening dip named; balance pass owns the gaps; card 3 not live before it; z19 to 21 exempt from "within 5" | sections 5, 11, 12 |
| 4 | Order lists of up to 3 per station; array save shape; the Loom carries Weave and Tan | sections 4, 13 |
| 5 | Amounts default to the shortfall; All keeps a 20% reserve | section 4 |
| 6 | Re-craft XP: a tenth below your highest open tier; refining at least half of station XP | sections 3, 12 |
| 7 | Beat map: Tobin's first upgrade brings Smelt and coal at minute 22 to 28. Wren's Bow +1 takes a plank and a leather, so she meets Saw and Tan together; the spec treats that as one idea (an order on a station) set from one Next Up line | section 2 |
| 8 | Only Tent 5 becomes buildable | sections 1, 4, 7 |
| 9 | Cards rewritten; `tonic-brew` and `art-refined-materials` written | section 11, card folder |
| 10 | Card 2 names each builder's files, may touch `72-ui-gather.js` and `57f-hands.js`, exports `refineOffer(cost)`; the offer moves to card 3 | section 11 |
| 11 | Old saves past gate + 15 craft S at once; the balance pass checks raid time to kill | section 13 |
| 12 | Coal's store group 1; current tier is `zoneTier(S.maxZone)`; Swift's 10 ms inside Guard's cap | sections 4, 6 |

Also added at the coordinator's ask: cadence targets (section 2) and Infuse, Essence's use (section 7b).

## 17. Cal's preview notes, 7 October

Cal played the preview and sent 21 notes. Six bear on this spec. The rest go to build cards through the preview thread.

| Note | What Cal said | What this spec does | Card |
|---|---|---|---|
| #6 | "I don't like that upgrades give %. I would rather flat numbers. Other things can increase by %." | **Upgrades add a flat number.** Each +1 adds a fixed amount to the piece's main stat, set when the piece is made from its tier and grade ("+1: +3 Attack"). The total at each + equals today's 15% a step, so the budget does not move; the player reads numbers, not percentages. Grades, profiles and attributes stay as multipliers (the "other things" Cal allowed). Old items show the same total as a flat number. No save change. | `craft-attribute-grades` |
| #21 | "I'm getting infinity attribute points. Is it set to 3 a level? We need more attributes to make this a better choice. Again refer to E33." | Today it is 4 points a level on 4 attributes (`HERO_TUNE.perLevel`, `24g-data-hero.js:34`), and only the hero grows with them. **Expedition 33's model, adapted:** a fifth attribute, **Luck** (crit chance in turn fights, under `TURN_TUNE.critChanceCap`), **3 points a level**, and **each weapon grows with two attributes**: Heavy with Might and Vigour, Balanced with Focus and Luck, Swift with Guard and Luck (the second at half strength). Vigour gains a weapon. Every point now moves the hero and a weapon, and there are more ways to spend it. Old saves keep their spent points while they fit; a hero who has spent more than the new total gets a free reset with a card that says why. If "infinity" was a literal number on screen, that is a bug and goes to the preview thread. | new `five-attributes` |
| #18 | "I'm one shotting everything in the early game." | The overhaul does not change tier 1 power, so it will not fix this alone. Target added (section 12): a normal foe in zones 1 to 6 takes at least 3 hits from a kept-up hero. Fewer points a level (3, not 4) takes a little off. The fix itself is first-hour tuning now, not after 13 November; it goes to the Foreman as a player-notes fix card, and card 3's budget run keeps the check. | player-notes fix; `craft-attribute-grades` keeps the check |
| #13 | "It tells me to make a pickaxe ... It doesn't tell me I need to equip it." | **A crafted tool that beats the worn one goes on by itself**, and the result card says so ("Bronze Pickaxe on: mining 20% faster"). Tools are one per slot with no build choice, so an Equip tap is only friction. Gear still asks, because gear is a choice. | `craft-delta` |
| #14 | "I think gear should be on the hero tab rather than the crafting tab." | **Worn gear and the bag move to the Hero tab** (the `party` view), next to Attributes and Abilities, where the build is made. The Craft tab makes things and links to the hero's gear. With weapons growing from attributes, the two belong on one screen. | `craft-delta`; the gear move is built by `cal-0107-gear-and-rates` |
| #16 | "I liked the amount / minute and / hour that we had on the display." | The gathering Now card still has the rate line (`72-ui-gather.js:228`), so why it did not show goes to the preview thread. Refine orders use the same line: "Smelting: 2.4 a minute · 144 an hour". | `refine-queues` |

Note #17 (equipping from the result card still asks "keep it?") is in `75-moments-ui.js`, which `craft-delta` owns, so
that card closes the card on Equip.

### `five-attributes` (card 5)
- **Luck:** crit chance in turn fights, with `per` set so an even spread across five attributes gives today's power a
  level. Outside turn fights power stays build-neutral, as now.
- **3 points a level** (`HERO_TUNE.perLevel`).
- **Second attribute on each profile** at half strength, on the same channels (Heavy: Vigour; Balanced and Swift: Luck).
  The weapon card says it in words: "Grows with Might (strong) and Vigour (some)". No letters, because grades already use
  letters.
- **Gate:** `arms.mjs` with five attributes and the profiles. Every attribute is in at least one winning build, and no
  build is best everywhere.
- **Saves:** each hero's record in `S.attr.pts` reads a missing `luck` as 0 (`attrRec`, `55-attributes.js`, fills it). A hero whose spent points exceed the new
  total is reset once for free, with a card. No key bump.
- After `weapon-profiles`, before the balance pass. Opus high lead, because it is combat and hero progression; judge gate.
- Owned files: `24g-data-hero.js`, `55-attributes.js`, `75-attributes-ui.js`, `59k-turn.js` (crit hook; after
  `weapon-profiles`), `docs/design/hero-progression-build/arms.mjs` (after `weapon-profiles`).

## Sources

- Code map: `/mnt/project-files/research/overhaul/code-map-2026-10-07.md`.
- Research: `/mnt/project-files/research/overhaul/` (`melvor-idle.md`, `osrs.md`, `idleon.md`, `rustys-retirement.md`,
  `fantasy-life-i.md`), with review ids; `/mnt/project-files/research/rising/2026-10-07.md`.
- W7 and W4: `/mnt/project-files/research/why/`.
- Why review and Cal's answers: `/mnt/project-files/autopilot/reports/why-review-2026-10-06.md`,
  `why-review-2026-10-06-answers.md`.
- Inputs: `/mnt/project-files/ideas/crafting-overhaul-proposal.md`, `runescape-levelling-research.md`,
  `skilling-processing-brainstorm.md`, `skills-resources-combat-link.md`.
- `/mnt/project-files/research/rising/new-mechanic-gaps.md` (cadence gaps, Essence).
- `docs/design/hero-progression-build.md`, `docs/design/difficulty-budget.md`, `docs/design/first-hour.md`,
  `docs/design/compass.md`, `docs/DECISIONS.md`, `/mnt/project-files/monetisation/plan.md` (Lantern Rule 4).
