# Build map: from today to 1.0 (Season 1) (coordinator, 2026-09-28)

This file turns plan-4.md and roadmap-review.md into tasks with dependencies, a model for each, and a
session order. A **session** is one 5-hour usage window.

- **Weekday session:** about 4 agents.
- **Weekend session:** 5 agents. Two or three sessions fit in a weekend day.

The estimates assume merges go smoothly. Balance passes and fixes found in review add about 20%.

## 0. Gaps found while mapping (answering "did we cover the map and buildings?")

**Covered so far:**

- **The World map's layout and places** (ux-overhaul.md, UX2b): a vertical strip of regions, with Hollow's
  Rest, the Tavern, the Deepwell, the raid pin, the Almanac post, Great Lanterns, band sheets and the
  expedition bar.
- **Building upgrade trees in outline** (roadmap-review.md 2.6).

**Not covered yet:**

1. **The full building catalogue after all the changes.** Today there are 11: Hearth, Watchtower, Forge,
   Workbench, Loom, Tavern, Storehouse, Bunkhouse, Library, Map Room, Shrine, plus the Enchanter's Table
   and Garden rows. The plan adds the Armoury, Tannery, Smelter (or the Forge's smelting branch), Kitchen,
   Trophy Wall and more. Nobody has written what every building is for, what it unlocks, its tree, its
   plot, and its region gate.
2. **The camp itself as a place (N2):**
   - the drawn camp panorama with plots
   - gatherers at the fire
   - day and night
   - buildings visibly growing
   - the Trophy Wall and display racks
3. **How the map grows across five regions.** Open questions:
   - Does each region have its own **outpost** (a small forward camp: a place to rest, a local
     vendor/town for trade routes, the region's dungeon entrance), or does everything stay at Hollow's
     Rest?
   - Where are the **towns** that trade routes (2.10) go to?
   - Where is each region's **dungeon** and **raid** drawn?
   - How do **secrets and events** (2.9) appear on the map?
4. **Region 4 and 5 themes** (LORE-R45), needed for tiers and for the map.

**Addition:** a new spec, **WC1 "World and Camp 2.0"** (Opus, Phase A), covering all of 1-3 above. Section
5 below gives its brief.

## 1. Tracks and dependencies

```
PHASE A (design)            PHASE B (menus/usability)     PHASE C-D (Core 2.0 slices)      PHASE E (content)          PHASE F
CORE-G glossary ──┬─ CL1 ───┐                              S1 types ─ S2 classes* ─ S3 evos  R2 Coast build ─ R3 ─ R4 ─ R5 ─ VOICE ─ first-hour polish
                  ├─ RG1 ───┼──────────────────────────────── S4 gear/tiers ─ S5 enchant/uniques                                    guide, a11y, sound
                  └─ CB2 ───┘                               S6 active combat ─ S7 tactics/fatigue                                    challenge modes
LORE-R45 ─────────── RG1 tier names, R3-R5 specs            (*SAVE1 before S2)                HEROES 18→32 + Awakenings
MAP0 ─────────────── UX-W1 ─ UX-W2 ─ UX-W3                   BAL3 after each slice            EVENTS/SECRETS (after W1)
WC1 ──────────────── UX-W2, BT1 building trees, N2 camp art
N1b ─ N3 ─────────── (after S4) refiners, Hunter, Tannery
UX-B ─ NM1 ─ UX-F (Craft+Armoury) ─ UX-D ─ UX-E ─ UX-G
HINT1, SAVE1, SFX1 (independent)
```

**Hard rules:**

- The **Coast is built after S5**, so it launches on the new damage types, tiers and buff items (pearls).
- **SAVE1 lands before S2** (the first big migration).
- **NM1 lands after UX-B** and before the other new screens, so they use the new words.
- **UX-W1 needs MAP0 (the chosen style) and UX-B.**
- **Heroes 19-32 need CL1** (roles and types) **and HQ1** (the Awakening spec).

## 2. Task list

| ID | Task | Needs | Model | Size |
|---|---|---|---|---|
| **Phase A: design** | | | | |
| CORE-G | Core 2.0 glossary: damage types, statuses, stats, the ability model, gear weights, buff families, tiers | – | Opus | S |
| CL1 | Classes 2.0: Warrior/Ranger/Mage, 6 evolutions, trials, abilities, types, synergies, the migration, room for tier 2 | CORE-G | Opus | L |
| RG1 | Resources and Gear 2.0: weights, 15 tiers, chains, enchanting, buff items, crafted slots, Uniques 2.0 (boss-themed) | CORE-G, LORE-R45 | Opus | L |
| CB2 | Active combat: dodge, stagger, interrupts, boss phases, elite traits, enemy damage | CORE-G | Opus | L |
| WC1 | World and Camp 2.0: the building catalogue and trees, the camp panorama, outposts/towns/dungeons/raids per region, events on the map | LORE-R45 | Opus | M |
| LORE-R45 | Regions 4-5 themes, materials and bosses; the Season 1 ending rewrite (the Voice retreats, the Season 2 hook) | – | Sonnet | M |
| MAP0 | World map art study (3 styles); the owner picks | – | Opus | M |
| N1b | Named gatherers: 9 jobs × 2 (incl. Hunter), perks, trees, recruit routes | – | Opus | M |
| HQ1 | Hero quests and Awakenings spec (the template plus 14 new hero concepts to reach 32) | CL1 | Opus | M |
| **Phase B: menus and usability** | | | | |
| HINT1 | Steady hint pop-ups | – | Sonnet | S |
| SAVE1 | Export/import, automatic backups before migrations, restore | – | Sonnet | S |
| N3 | Gatherer screens | N1b | Sonnet | M |
| UX-B | Style kit, slim header, Journal | – | Opus | M |
| NM1 | Rename pass (heroes, Lanternbearer) | UX-B | Sonnet | S |
| UX-F | Craft + Armoury screens (bag levels, loadouts, lock, auto-salvage, sort) | UX-B | Sonnet | M |
| UX-W1 | World map shell in the chosen style, registerPlace | UX-B, MAP0 | Opus | L |
| UX-W2 | Hollow's Rest place (buildings by WC1), Tavern sheet, Almanac post | UX-W1, WC1 | Sonnet | M |
| UX-W3 | Deepwell place, raid pin, expeditions and trade routes from the map | UX-W1 | Sonnet | M |
| UX-D / UX-E / UX-G | Party, Fight (incl. the boss gate), polish | UX-B | Sonnet | M each |
| FB1 | Send-feedback report plus local error capture | – | Haiku | S |
| **Phase C-D: Core 2.0 build slices** (each followed by a BAL3 pass on what it touched) | | | | |
| S1 | Damage types, statuses, combos, enemy weaknesses; heroes get types | CL1, CB2 | Opus | L |
| S2 | Three base classes plus migration; star maps for 3 classes | S1, SAVE1 | Opus | L |
| S3 | Six evolutions: trials, abilities, the second slot, looks, the Mirror respec | S2 | Opus | L |
| S4 | Gear weights, 15 tiers, production chains, Tannery/Smelter, Hunter and refiner jobs, migration | RG1, N3 | Opus | L |
| S5 | Enchanting, buff items, Uniques 2.0 (boss-themed, Echoes, merged with the Lantern Book) | S4 | Opus | L |
| S6 | Active combat, elite traits, the boss overhaul (Deepwell and raid first) | S1, CB2 | Opus | L |
| S7 | Tactics and hero fatigue | S6 | Opus | M |
| BT1 | Building trees (every building, per WC1) | WC1, S4 | Sonnet | M |
| N2 | Camp panorama art and camp life (plots, the fire, day/night, gatherers, Trophy Wall into the scene) | WC1 | Sonnet | M |
| **Phase E: content** | | | | |
| R2 | The Sunken Coast (R2-1..8 plus the new systems: pearls as buff items, fishing, the Kitchen, the Coast outpost/town) | S5 | Opus lead + Sonnet art/writing | XL |
| R3 / R4 / R5 | Each region: spec, data, foes, art, writing, UI, sim | the previous region | Opus + Sonnet | XL each |
| VOICE | The Season 1 finale fight (DV spec plus build) and the ending (LORE13) | R5, S6 | Opus | L |
| HER | Heroes 19-32 (data, art, Bonds) plus Awakenings and hero quests for all 32 | HQ1, S3 | Sonnet (Opus review) | XL |
| EV1 | Random events and secrets (12 events, the secrets list) | UX-W1 | Sonnet | M |
| OATH / PIN | Oaths as challenge modes; pinnacle bosses as Season 1 endgame fights | S6 | Opus | L |
| LORE-* | Bond stories, gatherer talk, region writing, class backstories (the characters redesign) | as each system lands | Sonnet | ongoing |
| AC6 | Chapter goals per region | as each region lands | Sonnet | S each |
| **Phase F: launch** | | | | |
| GUIDE | In-game guide (from CORE-G) | S1-S6 | Sonnet | M |
| A11Y | Colour-blind type icons (from CL1), text size, mixer | S1 | Sonnet | S |
| SFX1 / MUS1 | Synthesised sound effects (anytime), chiptune loops per region | – / regions | Sonnet | M / M |
| CH1 | Challenge modes (boss rush, Oath replays, weekly trial) | S6, OATH | Sonnet | M |
| CARD1 | Shareable camp card | N2 | Haiku/Sonnet | S |
| FH1 | First-hour polish plus testers' checklist | everything | Opus | M |
| BAL-F | Final balance across the Season 1 journey (story 2-3 months, completion 6-9) | everything | Opus | L |
| **Characters follow-up** (secondary update after Core 2.0) | | | | |
| CHAR1 | Playable characters redesign: looks, personality, backstories, hero reactions | S3 | Sonnet (+ art later) | M |

Sizes: S is under one agent-session, M about one, L about 2, XL about 4 or more.

## 3. Session plan

| Session | Agents |
|---|---|
| 1 (next) | CORE-G → then CL1, RG1, CB2 (Opus), MAP0 (Opus), LORE-R45 (Sonnet), HINT1 (Sonnet) |
| 2 | WC1 (Opus), N1b (Opus), HQ1 (Opus, after CL1), SAVE1 (Sonnet), UX-B (Opus) |
| 3 | N3, NM1, FB1, SFX1 (Sonnet/Haiku); the owner picks the map style; BAL2.5 at a weekend |
| 4-5 | UX-W1 (Opus), UX-F, UX-W2, UX-W3 (Sonnet); S1 (Opus) |
| 6-9 | S2 → S3 → S4 → S5 (Opus, one or two in flight) with BAL3 after each; BT1 and N2 alongside (Sonnet); UX-D/E/G |
| 10-11 | S6, S7; EV1; CHAR1; GUIDE and A11Y started |
| 12-16 | R2, the Coast (the first region on Core 2.0); HER in batches; OATH/PIN |
| 17-30 | R3, R4, R5 (about 4 sessions each), writing throughout, HER finished |
| 31-34 | VOICE, CH1, MUS1, CARD1, FH1, BAL-F, launch checks |

About **35 sessions** to Season 1. At roughly 1-2 weekday sessions a day plus 4-6 at weekends, that is
**about 3-5 weeks of calendar time**, depending on usage. Regions are the long pole. Once Core 2.0 is in,
they get faster, because most region work becomes data, art and writing on top of systems that already exist.

## 4. Owner decisions still open

- **The map style** (after MAP0).
- **Outposts:** one forward camp per region, or everything at Hollow's Rest? (WC1 recommends.)
- **Regions 4 and 5 themes** (LORE-R45 proposes; the owner approves).
- The **14 new heroes' concepts** (HQ1 proposes; the owner approves).

## 5. WC1 brief (World and Camp 2.0)

Write `docs/design/world-camp.md`:

- **(a) The full building catalogue for Season 1.** For each building:
  - purpose and what it unlocks
  - level range and costs
  - its tree (3 × 4)
  - its plot
  - its region gate

  Include the Tannery, Smelter (or the Forge's smelting branch), Kitchen, Armoury, Trophy Wall, and Infirmary
  (or fatigue rest in the Bunkhouse). Merge or retire any weak ones (Garden, Library, Shrine).
- **(b) The camp scene:**
  - the panorama and its plots
  - how buildings look at each level
  - gatherers and resting heroes at the fire
  - critters, day and night
  - performance
- **(c) The World map across five regions:**
  - per-region places (an outpost or not, the town for trade routes, the dungeon, the raid site, the Great
    Lantern, secrets)
  - how events and secrets appear
  - how travel works
  - what is drawn for locked regions
- **(d) How the camp and the map connect:** a building's work shown on the map, gatherers at nodes on the
  map, and so on.
- **(e) A build split** for UX-W2, BT1 and N2.
