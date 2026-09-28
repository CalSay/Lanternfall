# Plan 4: the Road to 1.0 (coordinator, 2026-09-28)

This file gathers every decision and request from the owner up to 2026-09-28 into one build order.
Plans 2 and 3 and the specs they name still hold where this file doesn't change them.
docs/coord/wave-log.md has the dated decisions.

## What 1.0 is (owner)

- **Five regions**, fully fleshed out with complex mechanics, ending with the Voice (the final boss, at the
  bottom of the Deepwell after Region 5, as lore.md has it). 1.0 ships a complete story.
- **32 heroes** (18 today).
- **Two named gatherers per resource type**, each with different benefits (a named cast, not random applicants).
- Launch essentials: a polished first hour, save safety (export/import at least, cloud ideally), an in-game
  guide, accessibility, sound and music.
- **Deferred until after launch:** art commissions and monetisation. Art only gets fixed before then if
  something is hideous.

## Standing rules

- Weekdays run moderately (up to 4 agents, check-ins at 09:38, 13:38, 17:38 and 21:38 UK). Weekends run at
  full speed. The owner can say pause or lighter at any time.
- Model routing: Opus for hard cross-system work and balance; Sonnet for well-specified builds, UI, art from
  a guide, and writing; Haiku for small mechanical jobs.
- Netlify deploys go out at most four times a day, only on commits marked `[deploy]`.
- Save compatibility is sacred. The online layer changes only with sign-off.
- Words: heroes (not companions); the Lanternbearer (the player's character); the party.

## Phase A: design the core of 1.0 (next session)

| Task | What | Model |
|---|---|---|
| **CL1** Classes 2.0 | Three base classes by armour weight: **Warrior** (heavy), **Ranger** (medium), **Mage** (light). Each has two first-tier evolutions, one damage and one utility: Warrior → **Reaver** / **Warden**; Ranger → **Venomstalker** (damage over time) / **Trapper**; Mage → **Warlock** / **Priest**. An evolution unlocks at a level plus a trial/boss/story step. Each one is a felt power spike and brings a new core mechanic, a signature ability, a second ability slot, a new look and title, and a party role. Also: damage types and statuses (holy, poison, fire, frost, physical; burn, venom, chill, stun, bleed); enemy weaknesses and resistances by region; synergy depth through types and statuses; how heroes fit in; enemy and boss damage targets for BAL3; room for a **second evolution tier after 1.0**. Migration: Warden → Warrior with Warden granted, Ranger → Ranger, Lanternmage → Mage, Lightkeeper → Mage with Priest granted. Class backstories tie into lore.md. | Opus |
| **MAP0** World map art study | Three candidate styles for the map and its landmarks and icons (Hollow's Rest, Tavern, Deepwell, Great Lantern, raid pin, Almanac post, road), full-screen at 360px. The owner picks one. Other UI icons stay as they are for now. | Opus |
| **N1b** Named gatherer roster | Two named gatherers per resource type, including K13's secondary resources and the Coast's, each pair splitting the job two ways (for example steady vs lucky). Each gets a lore hook, a recruit route (Tavern, quest, region) and **an upgrade tree**. A gem/socket-finder perk per pair. Keep levels, shifts, Bunkhouse beds and parcels. Migrate Tam and any Hands already hired. | Opus |
| **RD1** Road to 1.0 | This plan. It becomes a checklist and later sessions keep it current. | Sonnet |

## Phase B: menus, and making what exists usable

- **N3** Gatherer screens: the Tavern board, gatherer cards, send and return, the Bunkhouse, node-row chips.
  Follows N1b.
- **HINT1** Steady hint pop-ups (docked to a fixed band, no jitter).
- **UX-B** Shared style kit, a slimmer menu header, the Journal via the portrait (Deeds, Tracks, Feats,
  Codex; the rename box moves there).
- **NM1** Rename pass: companions → heroes; the player's character → the Lanternbearer.
- **UX-F** Craft + **Armoury** (owner priority: sort out crafting and gear). The Armoury is a bigger bag by
  level (50 base, nothing lost), gear sets and loadouts, lock and favourite, an auto-salvage filter, sort and
  filter, and a display rack at camp.
- **UX-W1** World tab and map in the chosen style (registerPlace; absorbs plan-2's Lantern Road map), then
  **UX-W2** (Hollow's Rest, Tavern sheet, Almanac post) and **UX-W3** (Deepwell place, raid pin,
  expeditions from the map, **trade routes** as expeditions).
- **UX-D** Party, **UX-E** Fight (the boss gate restyled), **UX-G** polish (onboarding pointers,
  empty/locked states, wide screens).
- Tab bar: Fight · Gather · Party · Craft · World.

## Phase C: the gear and resource overhaul

- **RG1** Resources and Gear 2.0 (spec, Opus, alongside CL1):
  - Armour weights: Warrior = metal + leather, Ranger = wood + leather, Mage = wood + cloth.
  - **15 material tiers**, 3 per region, gated by region; old tiers map across without loss.
  - **Production chains (K13):** Smelter (ore + coal → ingots), tanning (hide → leather), weaving
    (fibre → cloth), sawmill, still.
  - **Secondary resources** (coal, dye, salt...): the Lanternbearer can gather them, but they are ideal
    gatherer jobs.
  - Refining runs in the background at stations, faster with gatherer refiners.
  - **Enchanting** is how you apply buff (socket) items to gear. It unlocks in **Region 2**. Buff items
    come from gathering in each region.
  - Crafted gear has slots (otherwise base stats only). Uniques come pre-socketed, slightly better than
    crafted gear of the same rarity.
  - **Bosses carry signature buff items and always drop them.**
  - Gatherers can have find-rate perks, and active gathering finds more.
  - Balance around region gating.
- **Uniques 2.0**: signature play-changing effects, more of them, tied to bosses and regions, with story.
- **Camp building upgrade trees**: a tree inside each building (for example Forge weapon vs armour
  specialisation, Storehouse sorting/spillover, Bunkhouse comfort), not just building levels.
- **Kitchen** and **fishing** (the rod as a tool; meals as buffs).

## Phase D: combat depth

- **CB2 Active combat overhaul**: beyond parry. Dodging telegraphs, combos and ability chains, weak points
  and stagger bars, interrupts, and big-ability timing. Boss phases and mechanics; **elite traits**
  (Shielded, Vampiric, Explosive, Summoner...). Especially for dungeons and raids. Enemies, and bosses in
  particular, **hit much harder**. Idle-friendly, with active play clearly rewarded.
- **Tactics**: simple per-hero rules ("use the ability when a boss is under 50%", "heal under 30%", "focus
  poisoned targets"). Built after CB2.
- **Hero fatigue**: framed as a Rested bonus that fades over long stretches and returns at camp. Away time
  counts as rest. Rotating heroes never slows progression.
- **BAL3** Rebalance (a weekend):
  - class parity for the new classes
  - enemy and boss damage
  - the Region 2 recruit rule (**needs the owner's decision**; recommended: Region 2 expects you to have
    trained a stronger hero, with a hint when the pair hits its limit)
  - the benched-XP and catch-up changes
  - crafting Gold achievements arriving too early
  - gatherer pacing (HS9-12)
  - T1/D1/P1 pacing
  - the Deepwell run length, the Overflow boon and the Deep Lore cost
  - the Full Company Feat text (now about 6-7 months)
  - quiet perf re-runs

## Phase E: content to 1.0

- **Region 2, the Sunken Coast**: R2-1 to R2-8 (tide, foes, elders, the Drowned Keeper, pearls, fishing,
  coast buff items). The coast foe keys must match LORE2's bestiary keys.
- **Region 3, the Emberwaste**: spec (D4) and build. The Pyre Knight (Ser Hadric), with a Caedmon duel.
- **Region 4** and **Region 5**: new specs from lore.md's road and mystery ladder. Each region has its
  Great Lantern, a dungeon slot, a raid, and 3 material tiers with its buff items.
- **The Voice**: the final-boss spec (DV) and fight at the bottom of the Deepwell after Region 5, plus the
  ending (LORE13).
- **Heroes 18 → 32**, each with a home slot, Bonds and a role. **Hero quests**: per-hero chains that unlock
  top Bonds and a hero's own evolution.
- **Plan-2 carry-overs**: Oaths (O1-O4), legendary combat powers (L3, L6), pinnacle fights (PB1-PB3,
  PB5), drawn cosmetics at camp.
- **Random events and secrets**: wandering merchants, golden creatures, hidden areas, secret bosses, lore
  scraps.
- **Camp life** (N2): the camp panorama with plots, the Trophy Wall at plot p13, gatherers at the fire,
  day and night.
- **Writing**:
  - LORE6: the Hearth opening
  - LORE7: 42 Bond stories and 21 Sworn lines
  - LORE8: gatherer talk and fire stories (plus LORE8b, the Hollises)
  - LORE9: raid lines (approved)
  - LORE10: the Emberwaste
  - LORE11: Lanternborn
  - LORE13: the last fight
  - class backstories
  - Region 4 and Region 5 story
- **AC6** Chapter goals per region. Dormant achievement tracks go live as their systems land.
- **Factions and reputation**: maybe. Only once the World map has real places to go.

## Phase F: launch readiness

- A polished first hour.
- **Save safety**: export/import codes (with the installable web app / PWA), then cloud save (needs a
  backend).
- An **in-game guide/glossary** (damage types, statuses, evolutions, trees).
- **Accessibility**: colour-blind-safe damage types (icons and shapes), text size, reduced motion, a volume
  mixer.
- **Sound and music.**
- **Challenge modes**: boss rush, Oath replays, the weekly Deepwell trial.
- A **shareable camp card**.
- The **Lantern Festival** (seasonal; plan-3 said before December; decide whether it goes before 1.0).
- The **companion endgame** (D5, built on Sworn Bonds and Lanternborn).

## Small fixes queue

- Hesketh cut off at 360px; station stakes crowd the oak; the Company Cape reads weakly.
- A leftover Deepwell wipe animation behind the run-end card.
- The expedition "haul won't fit" warning.
- Gatherer counters on the Codex Camp page.
- No lifetime counter for Hide.
- AP6 nudge share.
- The boss gate button restyle (UX-E).
- Quiet perf re-runs for UX-A, AC3 and looks.

## After 1.0

- A second evolution tier for every class.
- Art commissions: first the three base classes and their evolutions (one signature look per class;
  capes, hats and auras layer on top), then the 32 heroes. An asset gallery doubles as the artist brief.
  The build step swaps in PNGs.
- Monetisation:
  - a free + paid battle pass
  - a membership: capped longer away time, faster builds, an extra builder, camp skin and effects,
    includes the premium pass
  - skins and a Founder pack
  - gems tied in only as cosmetics or convenience, never exclusive power
  - this needs accounts, server-side purchase checks and payments; the vision's fairness pillar gets
    rewritten then
- Guilds and bigger social features; an online backend for the standalone version.

## Waiting on the owner

- The Region 2 recruit rule (above).
- Online titles for other players (O1) and the own title on your Tavern row.
- Linking Netlify to the repo (deploys start then).
- Festival timing relative to 1.0.
