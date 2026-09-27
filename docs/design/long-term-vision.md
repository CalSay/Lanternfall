# Long-term vision (coordinator, 2026-09-27)

The owner asked for a game that stays enjoyable for a long time, and told the coordinator not
to stop at the current roadmap. This file sets the direction. The detailed specs live in their
own files; this one says **why** each system exists and **in what order** we build it.

## The problem we are solving

Lanternfall has no prestige and no resets (owner decision). Most idle games keep players with
resets. We need other reasons to come back. A player should always have:

1. **Something to do right now** (seconds to minutes): taps, abilities, parries, a craft, a bounty.
2. **Something landing soon** (hours): a recruit, a promotion, a gear tier, a new zone.
3. **A reason to open the game tomorrow** (days): a building finishes, an expedition returns,
   a new Omen is up, the Tavern visitor changes.
4. **A goal for next week** (weeks): a Legendary hunt, the weekly Trial, a region boss.
5. **A horizon** (months): new regions, the Codex, Lanternborn ranks, yearly festivals.

Today the game covers 1 and 2 well, has a thin 3 (the Tavern) and little of 4 or 5. Every
system below fills a gap on this ladder. None of them resets anything.

## Pillars

- **Permanent progress, many bars.** Lots of progress bars that fill at different speeds, so
  one of them is always close to done.
- **Your party, your story.** The named companions are the heart of the game. New systems give
  the whole roster a job, not just the 3 on the field.
- **Idle by default, rewarded for attention.** Nothing needs you online, but active play is
  faster and more fun (parries, the Deepwell, manual abilities).
- **Choices, not chores.** Daily content changes what is best today. It never punishes a
  missed day with lost power (no streaks that reset, no timed power items).
- **Fair forever.** No gacha, nothing pay-to-win, no fear of missing out on power. Seasonal
  items are cosmetic and come back every year.

## New systems (beyond the roadmap)

### 1. The Camp: Hollow's Rest (days to months)

A home base that grows from a campfire to a lantern-lit town. You build and upgrade buildings
with gold and gathered materials. Builds take real time (minutes early, hours later), which
gives a daily check-in rhythm that suits idle play. Benched companions are shown living at
camp.

Buildings give each system a physical home and a permanent upgrade path:

| Building | What it does |
|---|---|
| Campfire / Great Lantern | The camp level. It gates the other buildings, and each level adds a small offline boost |
| Forge, Enchanter's Table, Workbench, Loom | The crafting stations from the gathering spec, now upgraded here |
| Tavern | The visitor, plus more hire slots and rumours (hints for leads) as it levels |
| Watchtower | Raises the offline cap (8h to 12h to 16h) and shows the best zone to hold |
| Library | Reads camp stories and bestiary pages; gives mastery XP bonuses |
| Stables / Map Room | Unlocks and upgrades Expeditions (more slots, longer routes) |
| Shrine | Holds Lantern Relics (see Codex) and lets you set one active blessing |
| Garden | Slowly grows herbs and fibre on its own |

### 2. Expeditions (hours, uses the bench)

You send 1 to 3 **benched** companions on a timed route (1h, 4h or 8h) to a place you have
already cleared. Routes have a need ("a tank", "a Wayfarer", "power 5K") and a reward focus
(a material family, trophies, character tokens, lore). Meeting the needs raises the success
grade. Companions earn a little XP. This gives every recruit a purpose, fills the "come back
in a few hours" slot, and becomes the light route to some unlocks (the party spec already
names expeditions as a shortcut for Corvin).

### 3. The Deepwell (active mode, weekly)

This is an optional challenge dungeon under the Hollow. You descend floor by floor with your
party. After each floor you **pick 1 of 3 boons** (roguelite-style: "Kindle stacks twice",
"Tank reflects 30%", "+1 ability charge"). A run ends when the party falls or you leave. Your
main progress is never touched. Your best depth earns **Depth Marks**, which buy cosmetics,
titles, Codex entries and Deepwell-only upgrades. Every week there is a **Trial**: a fixed-seed
run with set rules, and you chase your personal best (a light leaderboard can come later). This
is the skill ceiling and the build laboratory.

### 4. The Almanac: daily Omens (days)

Each device day brings one **Omen**, a gentle world modifier that changes what is best to do:
"Blood Moon: bosses have +50% HP and drop double trophies", "Quiet Woods: +50% wood",
"Wraith Tide: marsh zones give triple essence". It uses the device date, like the Tavern. It
also shows a small **weekly board** of 5 relaxed goals that pay out camp materials and
Depth Marks. Nothing expires in a way that costs power.

### 5. Constellations: the talent tree (weeks)

This is the roadmap's talent tree, given a theme. Each class has a star map. Stars come from
hero levels and from **Great Lanterns** (lit at region bosses). Respecs are free, and you can
save 2 layouts. The map has keystone stars that change how a class plays, for example "Warden
taps also taunt" or "Lanternmage Embers spread on kill".

### 6. The Codex and Lantern Light (months)

This is one collection book: bestiary, uniques, affixes seen, companions, camp stories,
cosmetics and Deepwell depths. Completing a page gives a small permanent bonus and a title.
Everything feeds one account-wide number, **Lantern Light**. It is the long-term score that
replaces prestige: it only goes up, it shows how much of the world you have relit, and its
milestones unlock cosmetics and quality-of-life perks (an extra expedition slot, an auto-salvage
filter).

### 7. The Lantern Road: regions and story (months)

The world is a road through dark lands. Each region is about 35 zones and brings a new theme, a
new material family, new enemy behaviours, a region boss and a **Great Lantern** to relight. A
light story runs across regions through camp stories and joining moments. Region 1 is the
Hollow (zones 1-35). Region 2 is the **Sunken Coast** (tides, drowned enemies, pearl and
driftwood). Region 3 is the **Emberwaste** (heat, ash, the Ashen Wyrm's home).

### 8. Festivals (yearly)

Date-based events, such as the Lantern Festival in midwinter and the Harvest Moon in autumn,
bring a festival currency, cosmetics and a themed Deepwell. They come back every year, so
nothing is lost forever.

### 9. Care for the player

These are small features that make the long game pleasant:

- a "While you were away" report
- a stats page
- settings: sound, number format, reduced motion, confirm salvage
- a guided first ten minutes
- an auto-salvage filter

## Coordinator decisions after the D1 specs (2026-09-27)

The owner delegated these calls to the coordinator. All D1 recommendations are accepted:

- **Pacing is the biggest risk.** Region 1 clears in about 3 hours today. Days, weeks and months
  are paced by real-time systems (builds, expeditions, the weekly Trial and board, Codex pages),
  and the zone curve bends after Region 1. Target: Region 2 boss in 1 to 3 weeks of normal play,
  Region 3 in 1 to 2 months. The sim gains a `--days` mode (task M6).
- **One Roster board** shows every benched character with one status: Resting, Job or Expedition.
- **Names:** the camp-level building is the **Hearth** (Campfire, Hearth, Lantern Hall). Shrine
  bonuses are **Blessings**, not Relics.
- **Omens are pure upside.** Twists are opt-in **Dares**. Away time uses the Omen of the day you left.
- **Buildings never gate recipes.** Station levels add perks only. The Watchtower adds to the
  Hourglass relic, up to a 24h away cap.
- **The World tab becomes the Camp tab.** The raid section moves inside it unchanged.
- **Build speed-ups are never sold.** Lantern Light gives no direct power. Titles are local for now.
- **Next Up** is added. It shows the 3 goals closest to done across every system, and systems
  add goals with `registerGoal`. It replaces a standalone Garden.
- **The Deepwell and the Codex move to wave 3.** The Deepwell uses Oil as run health, so it needs
  no party combat.
- **Hero XP while away** is 50%, with the sim re-checking T1 and T2. At most 2 keystones are lit.
  Expeditions show the grade before sending, never fail, and repeat up to 3 runs while away.
- **Shared core (B0) is done:** `addBonus`/`bonus`, `deviceDay`/`deviceWeek`, and the away-cap,
  per-skill XP and per-family yield hooks.

## Build order

The party (Stage B) and crafting overhaul specs come first, because the Camp, Expeditions and
Deepwell all build on the roster, the role items and the materials. The new systems start as
soon as their foundations are in.

| Wave | Work |
|---|---|
| 1 | B1+B3 roster core and migration. B6 character art and writing. K1 craft data. K2 craft art. D1 specs for the new systems. Q1 "While you were away" and stats |
| 2 | B2 synergies. B7 unlock avenues. B5 Party UI. K4 items core. M6 pacing and `--days` sim. Next Up. Almanac and Omens. Art style study, then the art conversion |
| 3 | K5-K8 gathering and crafting. B4 companion uniques. Camp. Expeditions. Deepwell. Codex |
| 4 | Stage C party combat (C1-C5). Settings and onboarding |
| 5 | Constellations. Region 2 spec |
| 6 | Region 2: the Sunken Coast. The first festival |

After every wave the coordinator merges, builds, runs the check and the balance sim,
play-tests a new game and the fixture saves, and opens a pull request for the owner.
