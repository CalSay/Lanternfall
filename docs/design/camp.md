# The Camp: Hollow's Rest

Status: design spec D1 for the long-term vision (`long-term-vision.md`, system 1), written
2026-09-27. It builds on [party-and-classes.md](party-and-classes.md) (the roster, the bench) and
[gathering-and-crafting.md](gathering-and-crafting.md) (7 material families, Trophies, the 4
stations, bench jobs). Sister specs: [expeditions.md](expeditions.md), [deepwell.md](deepwell.md),
[almanac.md](almanac.md), [codex.md](codex.md), [constellations.md](constellations.md). All
numbers are starting values for `tools/sim.mjs` to tune. The ratios and rules are the design.

Owner constraints this spec obeys: no prestige or resets, single-player first, idle most of the
time with active moments, nothing pay-to-win, playable on a 360px phone.

Design rules:

1. **The Camp never takes anything away.** Nothing a player can do today moves behind a
   building. Stations and the Tavern start built, for new and old saves.
2. **Build timers are the daily rhythm, not a paywall.** Only play shortens builds: a second
   builder, one Omen, one Blessing and one Codex Seal. There is no skip currency, now or later.
3. **Every building answers a need a player already feels:** "my away time runs out", "my bench
   does nothing", "I want my crafts to go further", "where do I see everything I've found".
4. **Small, capped effects.** The Camp makes idle play kinder and adds choices. It is not a
   second damage tree. The whole Camp adds no more than +15% damage (through one Shrine
   Blessing).
5. **One place per character.** A benched companion is in exactly one place: resting at camp,
   on a gathering job, or on an expedition.

---

## 0. Designer notes to the coordinator

Read these first. Each note names a weakness in the vision and the fix this spec set uses.

**N1. The time ladder breaks past zone 35 (the biggest risk).** Today's sim reaches zone 29 at
2h and 53 at 3h. Party spec target T1/T2 puts zone 26-32 at 2h and at most 42 at 3h. So Region 1
(zones 1-35) and its Great Lantern fall in the **first afternoon**, not in "weeks". The vision's
weeks and months rungs cannot hang on region clears unless the zone curve bends hard after
Region 1. Fixes used in these specs:
- Days, weeks and months are paced by **wall-clock systems** (build timers, expeditions, the
  weekly Trial and board, Codex mastery pages, the 2-keystone limit), not by zone count.
- Hero-level pacing drives Constellation points. Today hero XP is 0 while away (`awayGains`
  gives none), so idle players stall. See constellations.md, open question 1.
- **Please commission a Lantern Road pacing target** with the Region 2 spec: Region 2 boss in
  1 to 3 weeks of normal play, Region 3 in 1 to 2 months. The sim needs a `--days N` mode with
  a check-in policy (2 short sessions a day plus closed-form away gains) to test any of the
  days-and-weeks targets in these specs. Task M6 below adds it.

**N2. The bench is triple-booked.** Bench jobs (owner approved), Expeditions and "companions
living at camp" all want the same benched characters, each with its own screen. Fix: one
**Roster board** in the Camp shows every benched character with one status (Resting, Job,
Expedition) and one button to change it. The Gather tab's Jobs section and the Map Room link to
it. Status is derived from the owning systems (`S.craft.jobs`, `S.exped.slots`), never stored
twice (section 6).

**N3. Two name clashes.**
- "Great Lantern" is both the camp-level building and the region beacons that give
  Constellation points. The camp-level building is now the **Hearth** (Campfire, then Hearth,
  then Lantern Hall as it grows). Great Lanterns stay the region beacons.
- "Lantern Relics" in the Shrine clash with the existing Relics shop (Warbanner, Lucky Coin,
  Ember Heart, Hourglass). The Shrine holds **Blessings** instead.

**N4. Station buildings would double-gate crafting.** The stations already have skills and tier
gates (`STATION_REQ`). If buildings also gated tiers, existing saves would lose recipes. Fix:
stations start at level 1 for everyone, and levels 2-5 add conveniences and small perks (bulk
craft, rarity nudge, cheaper upgrades). They never gate a recipe.

**N5. The Library and the Garden overlap other systems.** The Library's "reads stories and
bestiary pages" is the Codex, so the Library **is** the Codex's building. The Garden duplicates
bench jobs, so it is built as a job slot that needs no companion (Herbs or Fibre only). If the
coordinator wants to cut one building, cut the Garden and build **Next Up** (N11) instead.

**N6. Two of the vision's Omen examples are net losses.** "Bosses have +50% HP" hurts a pusher
that day. That breaks "never a net loss". Fix: every Omen is pure upside. Twists are opt-in
**Dares** that the player accepts for a bigger reward and can drop at any time (almanac.md).

**N7. The Watchtower and the Hourglass relic both set the away cap.** Fix: they add. Hourglass
stays `4 + 2 x glass` hours (max 14h). The Watchtower adds +2h per level (max +10h). The top is
**24h**, so a player who checks in once a day loses nothing.

**N8. There is no room for a sixth tab at 360px.** Fix: the **World tab becomes the Camp tab**.
It shows the camp scene and buildings, then the Tavern (a building now), then the World raid
section, unchanged. Only the mount point of the raid section moves. No online code changes.
Owner question 1.

**N9. Currency sprawl.** Renown, Embers, Depth Marks, Lantern Light, festival currency and
materials are already a lot. These specs add only **Depth Marks** (spent) and **Lantern Light**
(a score, never spent). The Almanac board, Expeditions and the Camp pay in things that already
exist.

**N10. Two smaller fixes.**
- "Depth Marks buy Codex entries" would let players buy a collection. Marks buy only the
  Deepwell's own Lore page. No other Codex entry can be bought.
- The Deepwell is slotted in wave 5, after Stage C. It does not need party combat: with an
  **Oil** timer as run health (deepwell.md) it works on today's combat. I recommend moving it to
  **wave 3**. It is the only new *active* system, and the other new systems are all idle ones.
  Stage C then upgrades it.

**N11. A proposed extra system: Next Up.** "Many bars" only helps if the player *sees* the bar
that is nearly full. Next Up is a 3-row strip at the top of the Fight tab and at the bottom of the
"While you were away" card. It shows the 3 goals closest to done across every system, each with
a Go button: "Hearth 4: ready to build", "Maren: 2 levels to Promote", "Bestiary: 12 Cave Bats to
page 3". Systems register goals through one call, `registerGoal({ id, label, pct(), go() })`,
so the cost is small (one core file, one UI file). It works like a quest log without writing
quests, and it points every check-in at the next small win. I rate it higher for long-term
enjoyment than the Garden. Recommend wave 2, beside Q1 "While you were away".

**Shared-core additions these specs need** (one small task for the coordinator, B0 in the build
plans):

| Addition | Where | Why |
|---|---|---|
| `addBonus(key, fn)` and `bonus(key)`: an additive registry (sum, 0 if none) next to `addModifier` | `00-util.js` | Hours, slots, counts and knob changes do not fit a product of multipliers |
| `deviceDay()` = local date as days since 2026-01-01; `deviceWeek()` = `floor((deviceDay() + 3) / 7)` (weeks start Monday) | `00-util.js` | The Tavern already uses this epoch; the Almanac, the Trial and the Camp share it |
| Away cap: `(4 + 2 x glass + bonus('awayHours')) x 3600` | `50-sim.js` `awayGains` | Watchtower |
| Per-skill XP: `mod('skillXp') x mod('skillXp:' + k)` | `50-sim.js` `gainSkill` | Station and Library levels, Omens |
| Per-family yield: harvest `n` and away credit `x mod('yield:' + kind)` | `50-sim.js` `harvest`, `awayGains` | Omens |

New modifier keys (product, `mod()`), each read by the system named: `skillXp:<skill>` (sim),
`yield:<family>` (sim), `compXp` (roster B1), `abilityCd` (55-party), `buildTime` (camp),
`expHaul` (expeditions), `upgradeGold` and `salvage` (crafting K6), `bossDmg` (sim, while
`mob.boss`). New bonus keys (sum, `bonus()`): `awayHours`, `builders`, `expSlots`, `bag`,
`deepOil`, `deepRerolls`, `shrineSlots`, `tune:<class knob>`.

---

## 1. Fantasy and loop

**Fantasy:** you are carrying the last lanterns through the dark, and Hollow's Rest is where you
come home. It starts as Old Hesketh's campfire in a hollow off the road. It grows into a
lantern-lit town where your companions live when they are not fighting.

**Daily check-in (60 to 120 seconds, 1 to 3 times a day)**

1. The away card lists what came in, plus "Hearth 5 is finished" and "Expedition back".
2. Open the Camp tab. A finished building glows. Tap it to see the new level.
3. Start the next build, or queue one behind it. Send the bench out again.
4. Close the game. The timers keep running.

**First meeting (about zone 5, 8 to 15 minutes in):** a joining-moment card. "Old Hesketh stops
at a hollow off the road and sets down his lamp. 'Every road needs a place to come back to.' He
lights a fire. It is small. It is yours." The Camp tab badge lights and the first build (the
Garden, 3 minutes) is suggested.

---

## 2. Buildings

Levels are shown as "Lv 3/5". A building's level can never pass the level its Hearth allows.

| Key | Name | Levels | Opens at | What it does | What it unlocks |
|---|---|---|---|---|---|
| `hearth` | Hearth (Campfire, Hearth, Lantern Hall) | 1-10 | camp unlock (free Lv 1) | Camp level. +3% away gains per level | Other buildings and their levels (2.1) |
| `forge` | Forge | 1-5 | built (Lv 1) | Smithing perks | Bulk craft at Lv 3 |
| `bench` | Workbench | 1-5 | built (Lv 1) | Woodcraft perks | Bulk craft at Lv 3 |
| `loom` | Loom | 1-5 | built (Lv 1) | Tailoring perks | Bulk craft at Lv 3 |
| `ench` | Enchanter's Table | 1-5 | built (Lv 1) | Enchanting perks | Bulk craft at Lv 3 |
| `tavern` | Tavern | 1-5 | built (Lv 1) | The visitor (party spec), kinder visitor rules | Rumours (forecast) at Lv 3 |
| `garden` | Garden | 1-5 | Hearth 1 | Grows Herbs or Fibre on its own | - |
| `watch` | Watchtower | 1-5 | Hearth 2 | +2h away cap per level | Hold hint at Lv 2 |
| `maproom` | Map Room | 1-5 | Hearth 2 | Expedition slots and route lengths | Expeditions (expeditions.md) |
| `library` | Library | 1-5 | Hearth 2 | Companion XP | The Codex (codex.md) |
| `shrine` | Shrine | 1-3 | Hearth 4 | Holds 1 or 2 Blessings | Blessings |
| `well` | the Deepwell | landmark | Hearth 3 and zone 20 | Entrance to the Deepwell | The Deepwell (deepwell.md) |
| `post` | Almanac post | landmark | camp unlock | Opens the Almanac | - |

Stations and the Tavern start at Lv 1 for every save, because they already work today. The
Deepwell and the Almanac post are landmarks: they have no levels and cost nothing.

### 2.1 The Hearth: gates, costs and timers

The Hearth is the camp's spine. Each Hearth level needs a max zone. A building's level `L`
needs Hearth `HREQ[L - 1]` (arrays are 0-based).

```
HZ   = [5, 8, 12, 16, 20, 25, 30, 36, 45, 55]   // max zone for Hearth 1..10 (Hearth 8 = Great Lantern 1 lit)
HREQ = [1, 2, 4, 6, 8]                            // Hearth level for building level 1..5 (Shrine: [4, 6, 8])
```

| Hearth | Needs zone | Gold (k foes) | Materials | Trophies | Timer | Also |
|---|---|---|---|---|---|---|
| 1 | 5 | free | - | - | - | Camp opens; Garden and the Almanac post |
| 2 | 8 | 1,500 | Oak 40, Copper 30 | - | 15m | Watchtower, Map Room, Library; buildings to Lv 2 |
| 3 | 12 | 2,500 | Yew 60, Iron 45, Glowing Essence 15 | - | 1h | The Deepwell (with zone 20) |
| 4 | 16 | 4,000 | Ironbark 60, Mithril 45, Radiant Essence 20 | - | 2h | Shrine; buildings to Lv 3 |
| 5 | 20 | 6,000 | Ironbark 90, Mithril 70, Moonstone 30 | 2 | 4h | **Second builder** |
| 6 | 25 | 8,000 | Ghostwood 60, Starsteel 45, Blazing Essence 20 | 3 | 6h | Buildings to Lv 4 |
| 7 | 30 | 10,000 | Ghostwood 90, Starsteel 70, Starglass 30 | 4 | 8h | Lantern Hall art |
| 8 | 36 | 12,000 | Lanternwood 120, Emberite 90, Starlit Essence 40 | 5 | 12h | Buildings to Lv 5 |
| 9 | 45 | 15,000 | Lanternwood 160, Emberite 120, Gloamsilk 60 | 6 | 16h | Decoration slots +4 |
| 10 | 55 | 20,000 | Lanternwood 200, Emberite 160, Emberglass 80 | 8 | 24h | Lantern Hall crown; title "Keeper of Hollow's Rest" |

- **Gold** is written in "k foes": `campGold(z, k) = k x mobHp(z) x 0.05`, which is `k` kills'
  worth of gold at the gate zone before any gold bonus. It tracks the exponential economy without
  being eaten by the player's own gold multipliers. With today's multipliers, 1,500 foes at zone
  8 is about 2 to 4 minutes of income.
- **Trophies** are "any type" (the player picks which to spend in the build sheet).
- **Effect:** `addModifier('offline', () => 1 + 0.03 x hearth)`. That is +30% away gains at
  Hearth 10.
- Until the crafting overhaul (K1) ships, Hearth costs that name a new family use the same tier
  of Ore instead. `22-data-camp.js` keeps a fallback column.

### 2.2 Buildings: cost formula and timers

For building `b` at level `L` (L >= 2, or L >= 1 for buildings that are not pre-built):

```
H      = max(HREQ[L - 1], opensAt[b])         // opensAt: 2 for Watchtower, Map Room, Library; 4 for Shrine; else 1
zRef   = HZ[H - 1]                            // the gate zone of the Hearth level it needs
tier   = L                                    // material tier = building level (t5 needs gathering 45)
gold   = campGold(zRef, 600 x L)
mats   = for each family f in FAM[b]: ceil(M[b][f] x [1, 1.5, 2, 3, 4][L-1]) of tier `tier`
troph  = [0, 0, 0, 1, 2][L-1]  of the building's trophy type
timer  = [3m, 30m, 2h, 6h, 12h][L-1]          // Shrine: [1h, 6h, 12h]
```

| Building | Families (M per family) | Trophy type |
|---|---|---|
| Forge | Ore 30, Wood 15 | Golem Core |
| Workbench | Wood 30, Crystal 15 | Moss Heart |
| Loom | Fibre 30, Hide 15 | Beetle Horn |
| Enchanter's Table | Crystal 25, Essence 20 | Wraith Veil |
| Tavern | Wood 30, Herbs 15 | Bat Fang |
| Garden | Wood 20, Herbs 20 | Spore Crown |
| Watchtower | Wood 25, Ore 20 | Bat Fang |
| Map Room | Hide 25, Fibre 20 | Grave Knuckle |
| Library | Fibre 20, Crystal 15, Essence 10 | Wraith Veil |
| Shrine (Lv 1-3 use rows 3-5) | Crystal 25, Essence 25 | Spore Crown |

Example: Map Room Lv 3 needs Hearth 4 (zone 16, tier 3). It costs 1,800 foes of zone-16 gold,
50 Scaled Hide and 40 Silkgrass Fibre, no trophy, and 2 hours.

Every building uses at least one gathered family and at least one fought family (Hide, Essence
or a Trophy) by level 4, so the Camp pulls the player into both Fight and Gather.

### 2.3 Builders and the queue

- **1 builder** at the start, **2 from Hearth 5**. `bonus('builders')` can add more (none do
  today; the key exists for a festival or Codex reward later).
- Each builder has **1 queued build** behind the current one. Costs are paid when a build is
  queued, so a queue can never stall. A queued build starts the moment the one ahead finishes,
  offline too.
- Timers are wall-clock timestamps (`end`), so they finish while the game is closed. The away
  card lists finished builds.
- **Cancel** refunds 100% of the cost if the build has not started, 50% if it has.
- **Speed:** `timer x mod('buildTime')`. Sources: the Builder's Moon Omen (-25% for builds
  started that day), the Hearth Blessing (-10%) and the Camp Codex Seal (-3%). Nothing else. No
  currency skips a timer.

### 2.4 Effects by building and level

| Building | Lv 1 | Lv 2 | Lv 3 | Lv 4 | Lv 5 |
|---|---|---|---|---|---|
| Forge | Smithing station (today) | Smithing XP +10% | "Make 5" bulk craft; XP +20% | Rarity nudge: Rare weight +5, Epic +2 | Upgrades cost 20% less gold |
| Workbench | Woodcraft station | Woodcraft XP +10% | "Make 5"; XP +20% | Rarity nudge | Salvage returns +25% |
| Loom | Tailoring station | Tailoring XP +10% | "Make 5"; XP +20% | Rarity nudge | Masterwork lines +20% |
| Enchanter's Table | Enchanting station | Enchanting XP +10% | "Make 5"; XP +20% | Rarity nudge | Transmute 3 to 1 (was 4); Reforge -20% |
| Tavern | Visitor (today) | The visitor stays 48h (yesterday's can still be hired) | **Rumours:** see the next 3 visitors and the next 2 Omens | The trader sells 2 lots, plus 1 Trophy of your choice a day for essence | Every 5th bounty gives +1 extra Renown |
| Garden | 20 units/h | 40/h | 60/h | 80/h | 100/h |
| Watchtower | Away cap +2h | +4h; **hold hint** on the away card | +6h | +8h | +10h |
| Map Room | 1 slot, 1h/4h routes | 2 slots | 8h routes | 3 slots | 12h routes; Repeat while away |
| Library | Codex opens | Companion XP +5% | +10%; Codex hints show exact sources | +15% | +20% |
| Shrine | 1 Blessing | Blessings +25% | 2 Blessings | - | - |

Modifier wiring (all in `55-camp.js`):

| Effect | Wiring |
|---|---|
| Station XP | `addModifier('skillXp:smith', () => [1, 1, 1.1, 1.2, 1.2, 1.2][lv])`, same for `bench`, `loom`, `ench` |
| Rarity nudge | `rarityWeights()` is extended by K6 to add `bonus('rare:' + station)` and `bonus('epic:' + station)`; Camp adds 5 and 2 at Lv 4+ |
| Upgrade gold, salvage, Masterwork, Transmute, Reforge | `mod('upgradeGold')`, `mod('salvage')`, `mod('mwLine')`, `bonus('transmuteSave')`, `mod('reforge')`, read by K6 |
| Watchtower | `addBonus('awayHours', () => 2 x lv)` |
| Library | `addModifier('compXp', () => 1 + 0.05 x max(0, lv - 1))` |
| Hearth | `addModifier('offline', () => 1 + 0.03 x lv)` |
| Map Room | read by `55-expeditions.js` (`campLevel('maproom')`) |
| Tavern | read by B7's visitor code (`campLevel('tavern')`) |

- **Hold hint** (Watchtower Lv 2): the away card adds "Your party could hold zone 31 (you are
  in 28)" with a "Go" button. It uses the party spec's `partyHoldEstimate()` after Stage C, and
  today's rule before it (the highest zone where `totalDps()` kills a foe in 3s or less).
- **Garden:** the player picks Herbs or Fibre. Output goes straight to the pouch at the best
  Foraging tier the hero has unlocked, at `rate[lv] / (1 + 0.3 x (t - 1))` units per hour of
  tier `t` (higher tiers grow slower, like nodes). It runs on the wall clock and holds at most 24h of growth. At Lv 5 it is roughly one
  bench job (gathering spec 2.6) and needs no companion.
- **Bulk craft ("Make 5"):** crafts 5 of the same recipe in one tap if materials allow. It is a
  button, not a queue, and it has no timer. Each item rolls on its own.

### 2.5 Blessings (the Shrine)

A Blessing is a medium, chosen bonus. Each **Codex page** unlocks its Blessing when the page
reaches 50% (codex.md). The Shrine holds 1 (2 at Lv 3). Swapping is free and instant, outside a
boss fight or a Deepwell run.

| Blessing | Unlocked by page | Effect (Shrine Lv 2: x1.25) |
|---|---|---|
| Blade | Bestiary | +8% damage |
| Coin | Zones | +12% gold |
| Hunt | Uniques | +15% damage to bosses |
| Anvil | Armoury | +15% crafting XP (all stations) |
| Kin | Companions | +15% companion XP |
| Road | Stories | +12% away gains |
| Wild | Materials | +12% gathering speed |
| Hearth | Camp | Builds 10% faster |
| Wayfarer | Lore | Expeditions bring back +15% |
| Deep | Deepwell | Deepwell runs start with +15s Oil |
| Sky | Omens | Dares pay +25% more |
| Oath | Achievements | +10% essence drops |

The Blade Blessing at Shrine Lv 2 (+10%) is the Camp's only damage bonus (rule 4).

---

## 3. Benched companions at camp

### 3.1 The Roster board

A section on the Camp tab. One row (56px) per benched character, sorted by status:

```
[portrait] Maren Ashvale   Lv 41  Tank      Resting at the Shrine      [ Send v ]
[portrait] Pip Cinderly    Lv 38  Caster    Expedition: Batwing Deep   2h 14m
[portrait] Bram Hollis     Lv 40  Striker   Job: Ironbark Stand  +1.2/min  [ Stop ]
```

- **Send** opens a small menu: "On a job" (the gathering spec's job picker) or "On an
  expedition" (the Map Room picker). A full slot list is greyed with the reason.
- Status is derived, never stored twice: `campStatus(id)` returns `field` if the id is in
  `S.party.field`, `job` if it is in `S.craft.jobs`, `exped` if it is in any `S.exped.slots[i].team`,
  otherwise `rest`. Every system calls `campFree(id)` before it assigns a character.
- Fielding a character on a job ends the job (gathering spec rule). Fielding a character on an
  expedition asks first, in-page: "Call Pip back now? She brings half of what she found."

### 3.2 Who you see in the scene

Resting characters live at a favourite spot. The scene shows **at most 8** characters at once
(the motion budget allows 10 animated units). Priority: just back from an expedition, then an
unread camp story, then rarity, then level.

| Spot | Characters (first free wins) |
|---|---|
| Hearth | Hesketh, Caedmon, Tobin |
| Forge | Aldric, Grenna |
| Workbench | Bram |
| Library | Pip, Oriel (on the roof, at night) |
| Enchanter's Table | Morwen |
| Shrine | Elowen, Maren, Anselm (at the bell) |
| Tavern | Vesper, Isolde (the corner table), Kestrel |
| Watchtower | Wren (on top) |
| Garden | Thessaly (by the pond) |
| Map Room | Corvin |

- A character on an expedition is not drawn. Their spot shows a small pack-shaped gap, and the
  Map Room flag is raised while any team is out.
- **Tap a character:** a speech bubble with one line of camp chatter (3 lines each, rotating; 54
  lines in total), and a "Sheet" button that opens their character sheet.
- **Unread camp story:** a small lantern "!" over their head. Tapping it opens the story. This is
  where the party spec's 54 camp stories are read, with the Party-tab list as a second route.

---

## 4. The camp scene on a 360px phone

### 4.1 Layout

The scene is a **panorama 960 x 180 art px** (1 art px per CSS px, art direction section 1),
seen through a **328 x 180 window**. Swipe to pan, with a building-chip strip under it for a
direct jump. It opens centred on the Hearth.

```
x:  0        120       240       360      480       600       720       840      960
    Garden   Tavern    Watch-    HEARTH   Forge     Loom      Library   Shrine   Map Room
    + pond             tower     (start)  Workbench Enchanter                    Deepwell
    road ---------------------------------------------------------------- Almanac post
```

- Ground line at y 150. Buildings are 64 to 120 art px tall. Characters are 56 to 64 art px
  tall, standing on the ground line in front of their building.
- **Chip strip** (328 x 44): Garden, Tavern, Tower, Hearth, Craft, Library, Shrine, Map, Well.
  Each chip is a 36px icon with a dot when something is ready (a finished build, a returned
  expedition, an unread story).
- **Tap a building:** it highlights, and its card in the list below scrolls into view and opens.
- Day and night follow the device clock: dusk sky from 18:00, night from 21:00 with lanterns lit
  (the art direction's lighting pass), dawn from 06:00. The Lantern Hall glows at every hour.

### 4.2 Building stages (art)

| Building | Lv 1 | Lv 3 | Lv 5 |
|---|---|---|---|
| Hearth | ring of stones and a fire (Hearth 1-2) | Hearth 3-5: a covered hearth with benches; 6-8: a timber hall; 9-10: the Lantern Hall, a stone hall with a great lantern on the roof |
| Stations | a tent and a tool | a timber shed | stone and a hanging lantern |
| Others | a lean-to or a signpost | timber | stone, banners, lanterns |

Stage art is 3 variants per building (Lv 1-2, Lv 3-4, Lv 5) and 4 for the Hearth. **Scaffold
overlay** while building: poles, a ladder, a small hammering figure (1 of 2 builders, generic).

### 4.3 Performance and motion

- Static layers (sky, far hills, ground, buildings) are baked to an offscreen canvas when a
  level or the time of day changes. Each frame draws: that bake (one `drawImage` of the visible
  slice), the fire, smoke, up to 8 characters, the builders and the lighting pass.
- 60fps target, 30fps on low-end. The scene only animates while the Camp tab is open.
- **Reduced motion:** no pan inertia (pans snap to the chip), idle frames freeze, the fire is a
  steady glow, no smoke drift.

### 4.4 The Camp tab, top to bottom (328px content width)

1. **Scene** (328 x 180) with the chip strip (328 x 44).
2. **Builders** strip: one row per builder (56px): "Building: Watchtower Lv 3, 1h 12m" with a
   progress bar, then its queued build or "Queue empty [ + ]".
3. **Buildings**: one card per building (collapsed 56px: icon, name, "Lv 2/5", the next effect in
   one line, a green dot if it can be built now). Expanded: the effect table for this building
   with the current level highlighted, cost chips (green = have, red = short; tap a red chip
   opens the pouch sheet), the timer, and **[ Build ]** or **[ Queue ]** (48px). Locked
   buildings show the gate: "Needs Hearth 4 (zone 16)".
4. **Roster board** (3.1).
5. **Tavern** (the existing section, moved here, plus Rumours at Lv 3).
6. **World raid** (the existing section, unchanged).

The Library card has an **Open Codex** button. The Map Room card has **Expeditions**. The Well
has **Enter the Deepwell**. The Almanac post opens the Almanac sheet.

---

## 5. Save state

```js
registerState('camp', {
  v: 1,
  open: false,                 // camp unlocked
  b: { hearth: 0, forge: 1, bench: 1, loom: 1, ench: 1, tavern: 1,
       garden: 0, watch: 0, maproom: 0, library: 0, shrine: 0 },   // levels
  builds: [],                  // [{ id, to, start, end }], one per builder, ordered
  queue: [],                   // [{ id, to }], at most one per builder, cost already paid
  garden: { fam: 'herb', last: 0, acc: 0 },   // acc = fractional units carried
  bless: [],                   // active Blessing ids (max = shrine slots)
  talk: {},                    // id -> index of the next chatter line
  deco: {}                     // decoration id -> slot index (cosmetics from other systems)
});
```

- **Old saves:** `registerState` fills the defaults, so every station and the Tavern start at
  Lv 1. On the first tick, if `S.maxZone >= 5`, the camp opens with Hearth 1 and a short toast
  instead of the joining card ("Hesketh has made camp. See the Camp tab.").
- No existing field changes. The World tab keeps its id (`world`) and only its label changes to
  Camp, so `S.tab === 'world'` in old saves still opens it.
- `check.mjs` asserts on every fixture: the camp loads, stations are Lv 1, `gear()` and
  `totalDps()` are unchanged, and a load-save-load round trip keeps `S.camp` whole.
- Finishing builds while away: on load, `campCatchUp(now)` walks each builder: finish the build
  if `end <= now`, start its queued build at the old `end`, repeat. The Garden credits
  `min(now - last, 24h)`.

---

## 6. Balance targets (tools/sim.mjs)

New sim mode: `--days N --checkins 2` runs live play for 20 minutes at each check-in (the mixed
policy, plus a camp policy that builds the cheapest useful level and fills the queue) and the
closed-form away gains between check-ins. It prints camp levels per day.

| # | Target | Pass band |
|---|---|---|
| CA1 | Camp opens (zone 5) | 8 to 15 min |
| CA2 | First build finished inside the first session | yes (the Garden, 3 min) |
| CA3 | Hearth 5 (second builder) | day 2 to 4 |
| CA4 | Every building Lv 5 and Hearth 10 (2 check-ins a day) | 5 to 9 weeks, given zone 55 by then (N1) |
| CA5 | A building finishes on at least one check-in each day, days 1 to 21 | 90% of days |
| CA6 | Builder idle time, 2 check-ins a day, days 1 to 14 | at most 25% |
| CA7 | Camp's share of gathered materials, weeks 1 to 2 | 15 to 30% |
| CA8 | Camp's share of gold spent, weeks 1 to 2 | at most 20% (gold is not the gate) |
| CA9 | Camp power: damage | at most +10% (Blade Blessing only) |
| CA10 | Away gains at Hearth 10 + Watchtower 5, 24h away vs Hearth 1, 24h away | 1.9x to 2.3x (cap 24h vs 14h, x1.3 vs x1.03) |
| CA11 | Fixtures load; stations Lv 1; dps unchanged | exact |

Sanity maths for CA4: build timers sum to about 277h (Hearth 73h, nine 5-level buildings 20.6h
each, the Shrine 19h). Two builders with queues finish that in 6 to 7 days of pure timer. The
zone gates (Hearth 8 at zone 36, Hearth 10 at zone 55) and trophy costs stretch it to weeks. If
N1's pacing puts zone 55 later than week 5, CA4 moves with it, which is intended.

---

## 7. Build plan

Follows the vision's waves: Camp core in wave 2, Camp UI and art in wave 3. Every agent runs
`node tools/build.mjs` and `node tools/check.mjs`. The whole Camp ships behind `CAMP_STAGE` in
`00-util.js` (0 off, 1 core, 2 UI), so main stays playable between merges.

| Wave | Task | Owns | Small edits in | Depends on |
|---|---|---|---|---|
| 2 | B0 Shared core: `addBonus`/`bonus`, `deviceDay`/`deviceWeek`, away-cap hook, per-skill XP, per-family yield (section 0) | - | `src/js/00-util.js`, `src/js/50-sim.js` | - (coordinator) |
| 2 | M1 Camp data: buildings, `HZ`, `HREQ`, cost tables, timers, effect tables, Blessings, spots, fallback costs | `src/js/22-data-camp.js` (core, data only) | - | K1 (family names; fallback if not merged) |
| 2 | M2 Camp core: `registerState('camp')`, unlock and old-save rule, build/queue/cancel, `campCatchUp`, effects via `addModifier`/`addBonus`, Garden, Blessings, `campStatus`/`campFree`/`campLevel`, events `campBuilt {id, lv}` | `src/js/55-camp.js` | `src/js/90-boot.js` (call `campCatchUp` before `awayGains`; add finished builds to the away card) | B0, M1 |
| 3 | M3 Camp tab UI: World tab relabelled Camp, builders strip, building cards, Roster board, Blessing picker | `src/js/75-camp.js`, `src/styles/60-camp.css` | `src/js/70-ui.js` (tab label), `src/js/74-ui-raid.js` and `src/js/74-ui-tavern.js` (mount order only) | M2 |
| 3 | M4 Camp scene: panorama, bake cache, day/night, building stages, scaffold, spots, chatter bubbles, reduced motion | `src/js/75-camp-scene.js`, `src/js/14-art-camp.js` (core, data only) | `src/js/10-art.js` (ICON entries for the chip strip) | M2, A2 rigs |
| 3 | M5 Writing: 54 chatter lines, the joining moment, building blurbs (house voice) | `src/js/22b-camp-text.js` (data) | - | - |
| 3 | M6 Sim: `--days`, `--checkins`, camp policy, CA1-CA10 | `tools/sim.mjs` | - | M2 |

- **Parallel safety:** M3 and M4 own separate files. M4 draws into a canvas that M3 mounts by id.
- **Cross-system hooks:** K6 reads the station modifiers (upgrade gold, salvage, transmute,
  reforge, rarity nudge); B7 reads `campLevel('tavern')`; `55-expeditions.js` reads
  `campLevel('maproom')`. Each reader treats a missing Camp as level 1, so merge order does not
  matter.

---

## 8. Open questions for the owner

1. **The World tab becomes the Camp tab.** The Tavern and the World raid move under the camp
   scene, unchanged. This keeps five tabs at 360px. Recommended: **yes**.
2. **No build speed-ups for sale, ever.** Only play shortens builds: a second builder (Hearth 5),
   one Omen, one Blessing and one Codex Seal. Keeping this rule closes a pay-to-skip door for a store launch.
   Recommended: **yes, make it a standing rule.**
3. **Next Up instead of a standalone Garden** (note N11). Next Up shows the 3 nearest goals
   across every system. The Garden would stay as a small building. Recommended: **build Next Up
   in wave 2**. Keep the Garden only if it fits the wave 3 budget.
