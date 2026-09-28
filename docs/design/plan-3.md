# Plan 3: Hearth and Formation (coordinator, 2026-09-28)

The owner play-tested the paused build and asked for seven changes. This plan folds them into what
was left of plan 2 and puts everything in build order. Plan 2's specs (region-2.md, oaths.md,
legendaries.md, pinnacles.md) still stand. Where plan 3 changes them, this file wins.

## 1. The owner's asks and the decisions

| # | Ask | Decision |
|---|---|---|
| 1 | Gathering shows the right tool | Tools become items: pickaxe (mining), woodaxe (woodcutting), sickle (foraging), and a fishing rod on the Coast. The hero holds the tool while gathering. Tool tiers (Copper, Iron...) gather faster and find more. Tools are made at the Workbench |
| 2 | The party stays home while you gather | The hero gathers alone. The party walks back to the Hearth and builds **Well Rested** (a damage bonus for the first minutes of the next fight, capped). They show at the fire in the camp scene |
| 3 | Immersive gathering scenes | Each place is a scene, not a node on a platform: a lantern-lit mine with rails, a cart and several veins; a forest clearing with several trees and a growing woodpile; a meadow for herbs and fibre. Nodes crack, run out and grow back; the hero walks between them. The existing Glint grows into rich veins you tap |
| 4 | A party of 3: Front, Middle, Back | **The hero is one of the three** (owner). Today the field is the hero plus 3 companions on a cell grid. The new field is 3 slots: Front, Middle, Back. Every character has a home slot; any character can stand anywhere, at a small cost off-slot. Synergies are rebuilt in three layers: slot jobs, role combos across slots, and **Bonds** between named pairs that grow with time fielded side by side |
| 5 | Start at a cold Hearth; build each station | A new game opens on an unlit campfire. Lighting it is the first minute. Stations are built with materials: Workbench (tools) first, then Forge (weapons, armour), Loom, Enchanter's Table. Fighting is open from the start. Old saves get every station built (never take anything away) |
| 6 | NPC gatherers | **Hands**: townsfolk hired at the Tavern, separate from companions (companions fight and go on expeditions; Hands bring steady materials). They have a rarity, a skill, a trait, a shift length, and a level. They gather at about 10-25% of your rate, come home when the shift ends and hang out at camp until sent again. You can talk to them at the fire |
| 7 | A Storehouse | The Storehouse caps how much of each material you can **hold**, for every source, including gathering yourself (owner, 2026-09-28). Gathering skill XP still counts when you are full, so levels never stop. Upgrades raise the caps. Save rule: a save above its cap keeps every item (nothing is ever deleted); it just cannot gain more of that material until it spends below the cap. Old saves get the Storehouse level that holds what they already have |

Coordinator additions, building on the asks:
- **Tool mastery**: each tool levels as you use it (its own progress bar).
- **A Kitchen** (after Hands): Hands bring herbs, and later fish from the Coast. Meals give the party a
  timed buff. It fills the "come back in a few hours" slot.
- **Day and night at camp** on the device clock: lanterns come on at dusk, and night-owl Hands work then.
- **Camp plots**: camp has fixed plots that fill in as you build, so it grows from a fire to a town
  without a free-placement UI.
- **Bonds feed the companion endgame** (plan 2, D5): bond stories become the path to Lanternborn forms.

## 2. What was left of plan 2

Wave 1 is done (C4, C6 via Stage C, AF, R0, Q1, D2, D3, BAL2), except that the Deepwell's combat
follow-up (W6) is half done: its visuals are in, its combat rules are not. Some later-wave work landed
early: the Coast writing (R2-6), legendary data, the core, the UI and the icons (L1, L2, L4, L5), and the
pinnacle data and writing (PB0, PB4). Still to build: the Coast (R2-1 to R2-5, R2-7, R2-8), Oaths (O1-O4),
legendary combat powers (L3, L6), pinnacle fights (PB1-PB3, PB5), the Lantern Road map, drawn cosmetics,
the Region 3 spec, and the owner-gated festival and companion endgame.

## 3. Why this order

The party of 3 changes combat, synergies, the planner and balance. Every later system (Coast foes,
Oath rules, legendary powers, pinnacle fights) is tuned against the party, so the formation goes
first, or all of that would be tuned twice. The Hearth start, tools and Storehouse change crafting,
gathering and the first ten minutes; the Coast adds new materials (pearls, fish) that should arrive
with storage and tools already in place. Gathering scenes and the solo hero touch only the stage and
the gather view, so they start at once, alongside the two specs.

## 4. Waves

### Wave 1: specs, plus the quick visible wins (parallel)
| Task | Work | Owns |
|---|---|---|
| **D6** Formation spec | Party of 3 with the hero: slots, home slots, off-slot costs, slot jobs, rebuilt synergies, Bonds, migration from the 4-member field, the planner v3, balance targets (a BAL3 target list), UI sketch at 360 px | `docs/design/formation.md` |
| **D7** Hearth and Hands spec | Cold Hearth start, station build chain and costs, tools as items and tool mastery, the Storehouse and caps, Hands (hire, rarity, traits, shifts, returns, camp life), the Kitchen, day and night, plots, migration for old saves, pacing targets | `docs/design/hearth-and-hands.md` |
| **G1** Solo gathering and tools shown | The hero holds a pickaxe, woodaxe or sickle (by skill) while gathering; the party is not drawn in gather scenes; the party walks home, with a Well Rested buff (spec'd in G1's report, knob in a tune table) | tool sprites in a new `src/js/11c-art-tools.js`; small edits in `62-stage.js`, `55-gathering.js` |
| **G2** Gathering scenes | Mine, woods and meadow scenes with several nodes, depletion, regrowth and the hero walking between them; lanterns; the Glint shown on a vein | `src/js/63c-scenery-gather.js`; small edits in `63-scenery.js`, `62-stage.js` (node positions) |
| **W6b** Deepwell combat rules | Plan 2's W6 remainder: HP carried between floors, wipes end a run, Elder telegraphs, the Guard and Mend sets | `src/js/59c-deepwell-combat.js` |

### Wave 2: formation and hearth (after D6 and D7)
- **F1** formation core and migration; **F2** synergies, role combos and Bonds; **F3** planner v3 (it also fixes
  the queued planner issues: single-target damage before a boss, and field flapping); **F4** Party UI; **BAL3**.
- **H1** the cold Hearth start and building stations (plus onboarding); **H2** tools as items and tool mastery;
  **H3** the Storehouse and caps; the Map Room hint on the Roster board.

### Wave 3: Hands and the living camp
- **N1** Hands core (hire, shifts, returns, levels); **N2** Hands art and camp life (plots, the fire, day and
  night); **N3** Hands UI; **K12** the Kitchen.

### Wave 4: the Sunken Coast (plan 2, wave 2), on the new formation
R2-1 to R2-5, R2-7, R2-8. Coast foes are designed against Front, Middle and Back. Pearls and fish go to
the Storehouse; the fishing rod is a tool.

### Wave 5: Oaths and legendary powers (plan 2, wave 3)
O1-O4, L3, L6. Oath line-up rules use slots.

### Wave 6: pinnacles and the long tail (plan 2, wave 4)
PB1-PB3, PB5, the Lantern Road map, drawn cosmetics, D4 (the Region 3 spec).

### Wave 7: owner-gated
F1 the Lantern Festival: it must land before December, so it may start in parallel with wave 5 or 6.
D5 the companion endgame, now built on Bonds.

## 5. Rules for every wave
- Build, check and perf pass before each merge. The perf budget in perf.md stands; the gathering scenes
  use the packed-plate path.
- Save compatibility: new fields have defaults; old saves never lose items, companions or stations.
  Fixtures in `tests/fixtures/` must load without loss. Migrations get a check.mjs section.
- The online layer does not change.
