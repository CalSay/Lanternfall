# Road to 1.0: coordinator review (2026-09-28)

A review of plan-4.md. Part 1 changes the build order. Part 2 fills out the ideas that were still raw, far
enough to write specs from. Part 3 adds what 1.0 is missing. Part 4 lists the questions for the owner.
Numbers here are starting points for the specs and the sim, not final tuning.

---

## Part 1: changes to the plan

### 1.1 Design "Core 2.0" as one package, then build it in slices

Classes 2.0 (CL1), Resources and Gear 2.0 (RG1) and Active Combat (CB2) all share the same building blocks:

- damage types and statuses
- abilities and their slots
- gear weights and buff items
- boss mechanics

Designing them one after another means each re-opens the last. **Change:**

- One design pass writes a shared **glossary spec** first (`core-2.md`: damage types, statuses, stats,
  ability model, gear weights, buff-item families, tiers).
- CL1, RG1 and CB2 are then written in parallel against that glossary.
- The build is split into vertical slices, so the game stays playable between merges (1.5 below).

### 1.2 Move the big rebalance to after Core 2.0; run a small stabilising pass now

A full BAL3 before the classes, gear and combat change would tune numbers that are about to be replaced.
**Change:**

- **BAL2.5 (this weekend, small):**
  - the Region 2 recruit rule (owner: yes; a hint when the pair is capped)
  - catch-up and bench XP, as decided
  - crafting Gold tiers arriving too early
  - gatherer pacing (HS9-12)
  - T1, D1 and P1
  - the Full Company Feat text
- **BAL3** runs after each Core 2.0 slice lands, one slice at a time, and a **BAL-final** runs before launch.

### 1.3 Pull save export/import forward to Phase B

Core 2.0 migrates classes, tiers and gear on live saves. That is the riskiest change the game will make.
Testers (the owner, his friend) need a way to back up and restore a save before it lands.

**Change:** a small task (SAVE1) early in Phase B:

- Export/import codes in Settings.
- An automatic local backup before any migration runs. The last 3 are kept, with "Restore the save from
  before the update".

### 1.4 Design accessibility and the in-game guide inside Core 2.0, not at the end

- **Accessibility:** damage types that only differ by colour would have to be redone later. CL1 defines
  each type's icon shape, colour and pattern together.
- **Guide:** it needs a stable vocabulary. The glossary (1.1) becomes the in-game guide's source text.

### 1.5 Build order for Core 2.0 (vertical slices)

1. **Slice 1: damage types + statuses + enemy weaknesses.** Combat engine plus Region 1 tuning. No class
   changes yet. Heroes get types.
2. **Slice 2: three base classes + migration.** Warden saves → Warrior (Warden granted), Lanternmage →
   Lanternmage, Lightkeeper → Lanternmage (Lightkeeper granted). The star maps are rebuilt for 3 classes.
3. **Slice 3: the six evolutions**, with their trials, abilities, second ability slot and looks.
4. **Slice 4: gear weights + tiers + production chains** (RG1), with migration of materials and items.
5. **Slice 5: enchanting + buff items + Uniques 2.0.**
6. **Slice 6: active combat + elites + boss overhaul** (CB2).
7. **Slice 7: Tactics + fatigue.**

Each slice ends with a BAL3 pass on what it touched.

### 1.6 Name and theme Regions 4 and 5 now

RG1 needs 15 tier names, and Region 4 and 5 materials, before it can lay out the tables. **Change:** a short
lore task (LORE-R45) runs in Phase A and gives each region:

- its theme and name
- its signature gathering and buff-item family
- its enemy families and weaknesses
- its boss and Great Lantern

It uses lore.md's mystery ladder: the Emberwaste is Region 3, and the road runs on toward the Voice.

### 1.7 Add pacing targets for the whole 1.0 journey

The sim targets stop at Region 2. 1.0 needs a target curve for "normal play" (about 1-2 hours active plus
away time daily) before BAL3 can aim at anything:

| Milestone | Target (normal play) |
|---|---|
| Region 1 boss, first evolution trial opens | days 5-8 |
| Region 2 boss | weeks 3-5 |
| Region 3 boss | weeks 7-10 |
| Region 4 boss | weeks 12-16 |
| Region 5 boss, then the Voice | months 5-7 |
| Full Company Feat (all heroes maxed) | 7-9 months |

These are proposals; the owner may want 1.0 shorter.

### 1.8 Keep heroes to one upgrade each (not branching evolutions)

32 heroes × 2 branching evolutions would be 64 designs, and art later. **Change:**

- Each hero gets one **Awakening** at the end of their hero quest: a new passive, a stronger signature and
  a new look.
- Only the Lanternbearer's classes branch.
- A second hero tier can come after 1.0, like the second class tier.

---

## Part 2: the raw ideas, filled out

### 2.1 Class evolutions: the rules around them (CL1 fills in the classes)

- **When:** the **first evolution trial opens at the Region 1 boss (the Fenmother)**, level 60 or more. The
  end of Region 1 is the natural "act 1" payoff. Region 2 then opens enchanting, so the second act starts
  with two new systems.
- **The trial:** a solo challenge fight for the Lanternbearer, with no heroes.
  - The Warrior holds a wall of foes for 60 s.
  - The Ranger downs a fleeing champion.
  - The Lanternmage survives a cursed wave.
  - Failing costs nothing. On passing, you choose your branch on a full-screen card that shows both paths
    in action.
- **Choosing and switching:** the choice is permanent for the save's main class, so it means something.
  A **Mirror of Embers** (it already exists) lets you respec for a real cost (a boss trophy plus essence).
  So you can change, but you won't flip back and forth.
- **The power spike:** about +35% effective power at the moment of choosing. It comes from the new
  mechanic, a second ability slot, and base stats weighted toward the branch. Enemies in Region 2 are tuned
  for an evolved Lanternbearer.
- **Room for tier 2** (after 1.0): the save stores `S.cls = { base, evo: [branchId], evo2: null }`. The
  star map adds a ring per tier.

### 2.2 Damage types and statuses (the glossary pins these down)

Five types:

| Type | Classes | Who resists | Who is weak |
|---|---|---|---|
| **Physical** | the base | armoured foes | – |
| **Holy** | Lightkeeper, Warden procs | the Coast's drowned | undead (Bonefield, the Barrow) |
| **Poison** | Venomstalker, Trapper traps | undead and constructs | beasts |
| **Fire** | Warlock, Reaver's embers | the Emberwaste | marsh and plant foes |
| **Frost** | Lanternmage base, Trapper | – | fire foes |

Statuses, each with one clear rule:

| Status | Rule |
|---|---|
| Bleed | damage over time; stacks to 5 |
| Venom | damage over time; stacks to 10 and ramps |
| Burn | spreads on death |
| Chill | slows attacks by 30% |
| Stun | pauses the foe |
| Mark | +20% damage taken |
| Curse | no healing; detonates |

**Combos (the synergy depth):**

- Venom + Burn = "Blight": burn ticks also tick venom.
- Chill + a heavy hit = "Shatter": ×2 damage.
- Mark + holy = "Judgement": heal the party for 10% of it.

Combos are shown on the stage as a word flash (with reduced motion, text only).

**Accessibility:** each type has a unique icon shape (drop, flame, flake, sun, blade). Numbers are never
told apart by colour alone.

### 2.3 Resources and gear by weight (RG1)

**Materials by region.** 5 regions × 3 tiers = 15 tiers per family:

| Family | Region 1 (Hollow) | Region 2 (Coast) | Region 3 (Emberwaste) | Regions 4-5 |
|---|---|---|---|---|
| Metal | Copper, Bronze, Iron | Tidesteel, Brine-iron, Coral-silver | Cinder, Ashsteel, Emberite | from LORE-R45 |
| Wood | Oak, Yew, Ironbark | Driftwood, Mangrove, Saltheart | Charwood, Emberpine, Sunwood | |
| Leather | Soft, Tough, Scaled | Sealskin, Eelhide, Shellback | Ashhide, Drake, Salamander | |
| Cloth | Flax, Nettle, Silkgrass | Kelp-silk, Sailcloth, Pearl-thread | Cinderwool, Ashsilk, Flameweave | |

Old tiers 1-5 map onto the new tiers without loss. Items keep their power.

**Gear recipes by weight:**

| Class | Main material (about 70%) | Second material (about 30%) |
|---|---|---|
| Warrior | metal | leather |
| Ranger | wood | leather |
| Lanternmage | cloth | wood (staves, focus) |

Accents cross over: Warrior gear takes a little cloth padding, Ranger gear a little metal (arrowheads),
Lanternmage gear a little metal (clasps). Every gathering line matters to every class a bit, and matters a lot to
one.

**Leather** comes from hunting. See 2.5: a new gatherer job, plus fight drops as today.

**Production chains.** One step, running in the background at the camp stations:

| Chain | Station |
|---|---|
| ore + coal → ingot | Forge / Smelter |
| hide + salt → leather | Tannery (new building) |
| fibre + dye → cloth | Loom |
| log → plank | Workbench / Sawmill |

- Each station has a queue (3 slots, more through its tree) and runs while you are away.
- Refining speed comes from the station level plus assigned gatherer refiners.
- Gear recipes take refined materials from Region 2 on. Region 1 stays raw, so the first hour stays simple.

**Enchanting (Region 2 on):**

- Crafted gear has sockets by rarity: Common 0, Uncommon 1, Rare 1, Epic 2, Legendary 3.
- **Enchanting** puts a buff item into a socket at the Enchanter's Table. The Enchanting skill sets how
  well it applies (buff strength 70% → 100% by skill).
- Removing an item destroys it, unless a Salvage Rune (a crafted item) is used.

**Buff items: one family per region:**

| Region | Buff item | From |
|---|---|---|
| 2 | **Pearls** | fishing and Tide Pools |
| 3 | **Ember-glass** | Emberwaste mining |
| 4-5 | from LORE-R45 | |

Every family has a version for each weight:

- **Heavy:** a sturdiness and damage-type resist line.
- **Medium:** a speed and status line.
- **Light:** a power and cast line.

Buff items have rarities. Bosses always drop their signature buff item. Gatherer finder perks raise the
find rates. Active gathering finds about twice as often as idle.

**Uniques 2.0:**

- About 6 per region (30 for 1.0). Each is a boss-signature item with one **play-changing effect** (for
  example "Venom you apply also chills"), pre-socketed with that boss's buff item at about +10% over a
  crafted equivalent.
- They merge with the legendary powers system. One rule: unique items carry a power. The Lantern Book
  stays as the collection. **Echoes** (duplicates) upgrade the power's rank, so repeat boss kills matter.
- Crafted gear plus good sockets stays within about 10% of a unique of the same tier. The unique wins on
  its effect, not on raw stats (the owner's 2026-09-27 rule).

### 2.4 Active combat (CB2): the specific mechanics

All of it is one-thumb and optional. Idle zones stay idle.

- **Dodge:** big telegraphed attacks show a zone; a tap moves the Lanternbearer out. A perfect dodge gives
  +20% damage for 3 s.
- **Stagger bar** on bosses and elites. Heavy hits, stuns and combos fill it. When full, the enemy is
  staggered for 5 s and takes ×1.5 damage. A tap during the stagger lands a "Finisher" (a class-specific
  big hit).
- **Interrupts:** casters show a cast bar; tapping the ability interrupts it. Interrupting a boss's
  signature cast skips that attack.
- **Ability timing:** your abilities charge; firing into a stagger or a combo window gives a bonus.
- **Boss phases:** every boss gets 2-3 phases with one new mechanic each (adds, a wind-up, an arena hazard).
  It also gets a visible **signature buff item** in its body, which drops on the kill.
- **Elite traits:** one trait by Region 2, two by Region 4. The traits are Shielded, Leeching, Explosive,
  Summoner, Enraged, Ice-Clad and Cursed. Each has a counter (holy beats Cursed, fire beats
  Ice-Clad, and so on).
- **Enemy damage:** bosses can kill an unprepared party in about 30-40 s at their intended power, and
  normal packs about 2-3× today.
- **Rewards for active play:** a boss killed with active play (3+ dodges or interrupts) drops +1 buff item
  and more XP. Idle kills are never punished, just not bonused.
- **Raid and dungeon use:** the Deepwell and the raid get the full boss kit first.

### 2.5 Named gatherers: the roster frame (N1b fills in the names)

Resource jobs for 1.0 (the job list is fixed, so the roster is 2 × jobs):

| Job | Gathers |
|---|---|
| Miner | ore |
| Coal-digger | coal |
| Woodcutter | logs |
| Hunter | hides (a new job: sends a gatherer to hunt a zone's beasts) |
| Forager-herbalist | herbs |
| Weaver-gatherer | fibre, dye plants |
| Salter | salt, from the Coast on |
| Fisher | from the Coast on |
| Gem-seeker | geodes, buff items |

That's 9 jobs × 2 = **18 named gatherers**, plus later-region additions to about 22.

- Each pair splits two ways: **Steady** (long shifts, reliable yield) vs **Lucky** (shorter shifts, better
  rare and buff-item finds).
- Each has an upgrade tree of **3 branches × 4 nodes**. Nodes are paid for with their own hours worked
  (levels) plus a small material cost. For example, a Lucky Miner: find → extra find → rare tier → "Prospector:
  shows the Glint on shift".
- They are recruited in different ways:
  - the Tavern board (a named gatherer appears when their region or skill conditions are met)
  - a hero's quest
  - a secret event
  - the Hollises: Bram plus the Coast
- Tam stays the free starter (a Steady Woodcutter).
- **Refiners:** any gatherer can be set to a station instead of a node, at half their job perk.

### 2.6 Camp building trees

Every building gets **one talent point per building level** (Lv 8 means 8 points). Each building has
**3 branches × 4 nodes**. Respec is free while the building is idle, which removes the fear of choosing.

| Building | Branch 1 | Branch 2 | Branch 3 |
|---|---|---|---|
| Forge | Weaponsmith (+weapon rolls) | Armourer (+armour rolls) | Smelter (ingot speed, coal saving) |
| Storehouse | Deep Shelves (+cap) | Sorting (auto-spillover, family pages) | Cold Room (herbs and fish keep; K12 meals) |
| Bunkhouse | Comfort (+rest, shift length) | Training (gatherer XP) | Hearthsongs (gatherer stories, +find at the fire) |
| Tavern | Rumours (event odds) | Recruiting (applicant speed, hero hire cost) | Trade (expedition trade prices) |
| Watchtower | Long Watch (+away cap) | Scouts (better expedition grades) | Balefire (event alerts) |
| Kitchen, Tannery, Enchanter's Table | each on the same pattern | | |

The number of nodes affecting damage is capped, so trees give identity, not raw power.

### 2.7 Hero fatigue (no clash with "no bench XP")

- Each hero has a **Rested** meter (0-100).
  - Fielded heroes lose 10 per hour of live fighting (about 10 hours of fighting to empty it).
  - Benched heroes and heroes at camp regain 25 per hour. Away time counts.
- **Rested 50-100:** +10% damage and healing.
- **Below 50:** the bonus shrinks to 0.
- **Never a penalty below normal.**
- **Why rotate:** swapping in a rested hero from a core group of 4-5 keeps the bonus up. Rested heroes
  also get +25% XP for their first hour back in the field. This rewards rotation without giving the bench
  XP.
- The planner (Tactics/auto) can rotate by itself, if you allow it.

### 2.8 Tactics

- **Built after CB2**, so there is something worth reacting to.
- **Each hero has 3 rule slots**, plus 2 for the Lanternbearer's abilities. Each rule is
  **IF [condition] THEN [action]**.
- **Conditions, at launch:**
  - a boss's HP below X%
  - an ally's HP below X%
  - a foe has a status
  - an elite with a trait is present
  - the stagger bar is full
  - a cast bar is showing
- **Actions:**
  - use an ability
  - focus the target
  - hold the ability for a stagger
  - taunt
  - cleanse
  - move to a slot (swap Front/Middle)
- **Unlocking:** conditions and actions unlock with evolutions and hero Awakenings.
- **Presets:** "Boss", "Farm", "Deepwell".
- **Idle and active:** Tactics run while you're idle too, so a good setup is the idle player's version of
  active skill. Playing actively still beats Tactics on perfect dodges.

### 2.9 Random events and secrets

- **Events:**
  - They roll at check-ins and during live play.
  - At most 1 is active at a time, with 2-4 per day.
  - **They wait for you:** an event stays until you visit or dismiss it. It never expires while you're
    away (no FOMO).
- **12 events at launch.** Examples:

  | Event | What happens |
  |---|---|
  | Wandering Merchant | rare materials for gold |
  | Golden Beetle | chase it for gems |
  | Lost Pilgrim | escort them for lore and a title |
  | Strange Light | a hidden mini-zone |
  | Storm | a gathering bonus with harder foes |
  | Old Hallam's letter | a story beat |

- **Secrets:** hidden zones, bosses and lore behind odd actions: tap the moon, sit at the fire at midnight,
  beat a boss barehanded. They tie into the 16 secret achievements, and some reward named gatherers or
  heroes. Hints for them come from Tavern rumours (the Tavern tree).

### 2.10 Trade routes (inside expeditions)

- **Trade expeditions** carry up to N units of a material to a town in a region you've reached, and come
  back with gold or goods you can't make.
- **Demand:** each town has a demand list (3 materials) that changes weekly.
- **Price:** 60%-160% of base, set by demand, route grade and the Tavern Trade branch.
- **Duration:** routes take 2-8 hours.
- **Purpose:** it gives Storehouse overflow a use and adds a light economy game with no new screen.

### 2.11 Hero quests and Awakenings

- **Per hero:** 3 short steps.
  1. Field them with a named partner (Bond).
  2. A story encounter in their region.
  3. A solo-ish trial.
- **The Awakening at the end:**
  - a new passive
  - an upgraded signature
  - a new look and title line
  - unlocking their Sworn Bond story
- **Writing load:** about 32 × (3 steps + an Awakening line) ≈ 130 short texts, split across LORE tasks by
  region.

### 2.12 Challenge modes (the endgame)

- **Boss Rush:** a region's bosses back to back. Weekly leaderboard later (post-1.0, online).
- **Oath replays** (plan 2's Oaths): zones with modifiers.
- **The weekly Deepwell Trial.**
- **Rewards:** titles, looks and trophies only. No power, so they stay fair.

### 2.13 The first hour

- Target beats (the sim checks these):
  - class choice
  - the cold Hearth and fire
  - the first tool
  - zone 5
  - first recruit
  - first Bond chip
  - the Workbench and Forge
  - the Storehouse
  - the Fenmother tease
- One new thing at least every 2 minutes for the first 15 minutes, then every 5 minutes.
- A tester checklist and a recorded sim run per class.

### 2.14 Sound and music (within the one-file rule)

No external files are allowed, so:

- **Sound effects:** Web Audio, synthesised: hits, crits, parries, level-ups, loot and UI. About 40 cues,
  each a few lines of code.
- **Music:** a small chiptune sequencer with one loop per region, written as note data (kilobytes, not
  megabytes).
- A volume mixer (music, SFX, UI), muted until the first tap (browser rule).
- A composer can replace the loops after 1.0 through the same asset-swap step as the art.

---

## Part 3: additions

1. **SAVE1** early (1.3): export/import plus automatic backups before migrations.
2. **LORE-R45** (1.6): name and theme Regions 4 and 5 now.
3. **1.0 pacing targets** (1.7) in the sim.
4. **An in-game changelog:** the "What's new" bell already exists. A short list per update helps testers and
   players follow the big changes Core 2.0 brings.
5. **Tester feedback inside the game:** a "Send feedback" button that copies a short report (version, zone,
   class, last error) to paste to the owner. It needs no server.
6. **Error capture:** keep the last 20 errors in local storage and show them in the feedback report, so bugs
   found by testers can be reproduced.
7. **A performance guard for 1.0 size:** five regions of art and music. Set a budget (the dist file at 4 MB
   or less; first frame on a mid phone at 2.5 s or less) and track it in perf.mjs.
8. **A Hunter job and a Tannery building** (from 2.3 and 2.5), since leather becomes a main material.

## Part 4: questions for the owner

1. **Core 2.0 order:** agree to design classes, gear and combat together, then build in 7 slices, with the
   big rebalance after each slice and a small stabilising pass this weekend?
2. **Pacing:** is about 5-7 months to the Voice right for 1.0, or shorter?
3. **Evolution switching:** permanent, with a costly respec via the Mirror of Embers. OK?
4. **Heroes:** one Awakening each for 1.0 (no branching)?
5. **Leather:** a new Hunter gatherer job and a Tannery building?
6. **Uniques and legendary powers:** merge into one system (uniques carry the powers), as described in 2.3?
