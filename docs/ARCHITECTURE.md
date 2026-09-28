# Lanternfall architecture

The published game is one HTML file, `dist/lanternfall.html`, built from `src/`.
Never edit `dist/` by hand.

## Build

`tools/build.mjs` = `src/shell.html` with `<!-- @styles -->` replaced by every
`src/styles/*.css` (filename order) in one `<style>`, and `<!-- @script -->` replaced by every
`src/js/*.js` (filename order) concatenated inside one `(() => { 'use strict'; ... })()`.
All JS files share one scope: top-level `const`/`function` in one file is visible to later files.

## Module map (load order)

| File | Layer | Owns |
|---|---|---|
| 00-util.js | core | `fmt`, `rng`, event bus (`on`/`emit`), `mod`/`addModifier`, `onTick`, storage adapter |
| 05-platform.js | browser | localStorage adapter (Node tools replace it with an in-memory one) |
| 10-art.js | core | pixel maps, palettes, colour maths |
| 12a-art-body.js | core (data) | B1 character kit `AK`: materials, gear tiers, shapes, body anchors, faces, poses (docs/design/art-direction.md) |
| 12b..12f-art-*.js | core (data) | outfits: 12b hero classes, 12c Hedgefolk, 12d the Oath, 12e Dusk Company, 12f Wayfarers (one owner per file) |
| 13-art-enemies.js | core (data) | enemy, boss, wyrm and gather-node rigs |
| 60b-baker.js | browser | B1 baker: `charFrames`, `enemyFrames`, `portraitURL`, `drawCharPreview`, lights |
| 20-data.js | core | constants: zones, mats, slots, uniques, companions, upgrades, relics |
| 22-data-regions.js | core (data) | the Lantern Road's regions (region-2.md 2.2): `REGIONS` (the Hollow 1-35, the Sunken Coast 36-70; per region its 7 types as TYPES indices, names, themes, uniques, home grounds, hue rule, boss), `ROAD_BEYOND`, `regionOf`/`regionIdx`/`regionById`, `zoneNextType`, `zoneTheme`, `zoneHue`, `zoneUnique`, `zoneHome`, `regionBossZone`, `lanternsLitAt`. `zonePlace`/`zoneCycle`/`zoneType`/`zoneName` (40-rules) read it. Region 2's own data plugs in through `REGION_COAST` (22-data-coast.js); until then the coast reuses the Hollow's foes under its own names |
| 23-data-deeds.js | core (data) | achievements data (docs/design/achievements.md, AC2): `DEED_TRACKS` (92 tracks, tiers Bronze/Silver/Gold/Everflame, stars), `DEED_GROUPS`, `DEED_FEATS`, `DEED_SECRETS`, `DEED_LOOKS` (36 accessories + 4 frames), `DEED_LADDER`, `DEED_CHAPTERS`, `DEED_CAP` (the hard bonus cap per key), `DEED_TUNE` |
| 30-state.js | core | save `S`, `fresh()`, `loadSave()`, `save()`, `registerState`, `online` runtime state |
| 40-rules.js | core | formulas: gear, dps, gold, xp, costs, node times |
| 41-items.js | core | items core (K4): kinds, `fits()`, `itemStats()`/`itemLines()`, 8 hero positions (`gearCalc` behind `gear()`), `charGear(id)`, affix rolls, Reforge maths, bag rule |
| 50-sim.js | core | `tick`, combat, kills, xp, harvest, bosses, offline gains |
| 51-actions.js | core | player actions: forge, equip, salvage, upgrade, buy, hire, relics, loot |
| 52-raid.js | core | world boss damage and rewards |
| **55-*.js** | core | **feature logic (no DOM)**; 55-stats.js: lifetime counters and the away report data |
| 55-goals.js | core | "Next Up": `registerGoal`, `topGoals`, the built-in goals (UI: 75-goals-ui.js); the craft goal sets `S.fSlot`/`S.fTier` and bumps `forgeGoalPicks` so the Craft tab focuses that recipe |
| 55-onboard.js | core | the guided first ten minutes (docs/design/onboarding.md): `FEATURES` unlock table, `isUnlocked(id)`, `onboardReveal`, `onboardUnlockAll`, the guide (`GUIDE_STEPS`, `onboardStep`, `onboardDone`, `onboardTips`), `goalGate` for Next Up (on only in the browser); state `S.onboard` (old saves: all open). UI: 75-onboard-ui.js. Views and sections declare `feature: id` in `registerView`/`registerSection` |
| 55-welcome.js | core | the one-time live-save welcome (plan-2 D3): a save with progress and no `S.camp` gets the Hearth its max zone allows (`CAMP_HZ`), free, once; `welcomeApply()` (57-camp calls it after registering `camp`), `welcomeNote()` (the camp's opening notice, then null), `welcomeInfo()`; state `S.welcome` |
| 55-lantern.js | core | the Great Lantern moments (region-2.md 8, task R0): a region boss's first kill emits `greatLantern` once per save (a save already past it gets one bell line instead); `lanternSync()`, `lanternRoad()`; state `S.lantern` (`lit` = time relit per region). UI: 75-lantern-ui.js (the full-screen card, the Lantern Road strip on the Camp view and its sheet) |
| 55-story.js | core | the story (lore.md 9-10, LORE3): arrival lines on the first fight in each place, story beats at their zones (`at`) or by call, elder intro and fall lines once per type (the Hollow's zone 35 boss is the Listener, named from `REGIONS[i].boss.name` on `spawn`), bestiary lines for the Codex; old saves file what is behind them quietly (one "Catch up on the story" entry in the Codex). API for the Coast tasks: `storyBeat(id, { quiet })` -> 'card' \| 'quiet' \| false; also `storyList()`, `storyRead(id)`, `storyUnread()`, `storyLate()`, `storySay(map)`, `storyElderKey(z)`, `storyBestiary(key, got)`; state `S.story`. Words: 21h-lore-hollow.js, 21b-stories-coast.js. UI: 75-story-ui.js (stage captions and the story chip, the beat card sheet, `storyUI.codexRow()` on the Codex home) |
| 55-pace.js | core | idle income never stalls (BAL1): with auto-progress on, a zone whose foe takes > `PACE.farmSecs` drops to `farmableZone()` (one toast) and climbs back later; `paceCheck()`; state `S.pace.fell` |
| 55-crafting.js | core | crafting actions (K6): `craftItem`/`canCraft`, `upgradeItem` (Trophy gate +8..+10), `reforgeItem`, `transmute`, `equipChar`/`unequipChar` (one wearer per item), class-change unequip, Star Chart, Tonics; state in `S.craft` |
| 55-gathering.js | core | gathering for every family (K5): Foraging catch-up, home ground (`yield:<fam>`), signature fight drops, champions and Trophies, the Glint, offline drops; `homeFamily`, `homeBonus`, `sigDropChance`, `awaySigDrops`, `champChance`, `addTrophy`, `glint`, `whereToGet`, `GATHER_KINDS` |
| 55-tools.js | core | tools as items and tool mastery (hearth-and-hands.md 2, H2): rough tool = empty slot (tier 0), right tool (`toolRight(skill, t)`, read by `nodeTime`), rare finds (`toolFind`, on `harvest`), mastery per tool kind (`toolMastery`, `toolMasteryAdd`, `toolPerks`, `toolHandsMult`), `equippedTool(skill)` -> `{ kind, tier, item }`, `toolLook`, `toolName`, `toolBest(skill)` (sim policy), knobs `TOOL_TUNE` (`on: 0` = old rules, sim `--tools 0`); state `S.tools`. UI: 75-tools-ui.js (the Gather card, the item sheet's Mastery box) |
| 55-hearth.js | core | the cold Hearth start and building each station (hearth-and-hands.md 1, H1): a new game (no `S.camp`, no progress) starts cold (`hearthCold()`): unlit fire, stations Lv 0, gathering the Oak Grove; `hearthLight()` (8 Oak: Hearth 1, camp open, emits `campOpen`/`hearthLit`), plot rules `HEARTH_PLOT` / `hearthPlotOpen(id)` (57-camp `campList`), Lv 1 station rows `HEARTH_TUNE.first` / `hearthFirst(id)` (57-camp `campCost`), the craft gate `hearthStationWhy(st)` (55-crafting: "Build the Workbench first.", cold saves only), `hearthNext()` (sim policy), `hearthWarm()` (tools: the old warm start), the warm saves' What's new line, the Map Room Next Up goal; state `S.hearth`. Stage art: 63d-scenery-camp.js (the fire, Hesketh, plot stakes, the `#hearthFire` button) through 62-stage's `stageDeco(ctx, phase, v)` hook |
| 55-skillpace.js | core | the save rule for the slower skill pace (GP1, pacing.md 12): a save that predates GP1 keeps every tier the old gates gave its levels (`S.skillPace.hw`, set once per loaded save; a new game keeps nothing); `skillKept(k)`, `skillPaceInfo()`, one What's new line. The gates themselves: `SKILL_TUNE` (20-data: `NODE_REQ`, `SMITH_REQ`, XP curves, `nodeXp`, speed per level) and `skillTopTier(k)`, `skillTierOpen(k, t)`, `skillReq(k, t)`, `skillNextReq(k)`, `skillNeed(lv, k)` (40-rules); `stationTierOpen(kind, t)` (55-crafting). Gate on these, never on `S.skills[k].lv >= NODE_REQ[t - 1]` |
| 55-store.js | core | the Storehouse and material caps (docs/design/hearth-and-hands.md 4, H3): `STORE_TUNE`, `storeCap(fam, t)`, `stashRoom`, `stashFull`, `stashFits(lines)`, `stashNeed(lines)`, and **`stashAdd(fam, t, n, how)`, the one way to credit materials** (`'flow'` stops at the cap, `'parcel'` all or nothing, `'preview'` what fits after an in-page ask, `'gift'` always lands); Spillover (`storeNextNode`, `storeSwitch`), away gathering (`storeAwayGather`), the migration (old saves get the level that holds their piles, never lose a unit), the camp row's costs and effect lines (`CAMP_B.store`, Lv 0-8), `STORE_STATS` for the sim; state `S.store`. UI: 75-store-ui.js (the full chip on the node views, caps on node rows, the stage line and pack cells, the salvage note); bounty, Almanac and trader buttons wait while a reward does not fit. New credit sites must call `stashAdd`; spending stays a raw subtraction |
| 55-legend.js | core | legendary powers and circle sets (docs/design/legendaries.md, L2): the Lantern Book (`legendKnown`, `legendEchoes`, `legendEchoCap`), drops (`legendDrop(rank, source, opts)`, owed rolls `legendOwe`/`legendPayOwed`), actions with `legendCanX` checks (`legendLearn`, `legendInscribe`, `legendMark`, `legendSigil`), limits (`legendHeroCheck` for the in-page "Take off X?" ask, `legendCanWear`), reads (`legendActive`, `legendSets`, `legendSetTier`, `legendBudget` / `legendScale` = the runtime cap, `legendV`, `legendItemState`, `legendCardLines`, `legendBest`), `bonus('lg:<id>')`, Next Up goals; state `S.legend` (item fields `lg`, `lr`, `cm`). Data: 21c-data-legend.js; icons: 11b-art-legend.js; UI: 75-legend-ui.js (the Craft tab's Powers view, feature `powers`; `legendUI` helpers for the item sheet and the Party tab) |
| 56-roster.js | core | named companions: roster data, levels, drills, promotions, recruiting, field/cells (`setField` keeps `ROSTER_TUNE.fieldMax` 2 companions and places them with 56e `placeSlots`), `compDps()` once `S.party.rv >= 1`, S.comp migration; `foesGold(z, k)` (gold worth k foes of zone z) for prices that follow the PACE curve |
| 56b-synergy.js | core | specialities, traits, passives, Legend auras; the three synergy layers of the party of three (plan-3 F2, formation.md 2): 12 slot jobs (`SLOT_JOBS`, `slotJob(key)`), 8 combos and 4 Kin, 21 Bonds (all in `SYNERGIES` with `layer`), Common Cause, the caps (`FORM_TUNE.synCap`/`drCap`); `activeSynergies()`, `synergyStatus(id)`, `charTraits(id)` (the L25 milestone is Old Friend), `synUnit(key)`/`synParty()` (59-combat), `formQuick(trio, prep)`/`formQuickPrep()` (F3's quick score); knobs `SYN_TUNE` |

| 56c-unlocks.js | core | unlock avenues (B7): quests, Renown, boss tokens with pity, bestiary, Kingslayer, Star Chart, Tavern visitor; `leads()`, `addRenown`, `unlockTokenRoll`, `addTokenProgress`, `grantStarChart`, `visitorToday` (state in `S.party.unlock`) |
| 56e-formation.js | core | the party of three (plan-3 F1, docs/design/formation.md): the hero and 2 companions in one line of slots Back / Middle / Front (`S.party.cells[key].col` 0 / 1 / 2, `lane` 1); homes (`HOME_SLOT`, `CLASS_HOME`), Out of place, the hero floor and `trioX`, the migration of old parties of 3 (`S.party.formV`, `formOld`), pins (`S.party.pin`); knobs `FORM_TUNE`. API below ("Formation") |
| 56f-bonds.js | core | Bonds (plan-3 F2, formation.md 2.3, 3.3): time together (`S.bond`), levels Met..Sworn (`FORM_TUNE.bondH`/`bondX`), growth live / away / at the Hearth / on expeditions, Old Friend, seeds for old saves, stories (`bondStories`, `bondRead`; text in 21f-stories-bonds.js, LORE7), `swornOf(id)` (D5), `bondInfo`, `bondCounts` (AC2), `bondText` (toast copy for F4). API at the top of the file |
| 56d-autofield.js | core | the line-up planner v3 (plan-3 F3, formation.md 5): 2 companions and a slot for each of the three (the hero too); pair x slot-order quick score (F2 `formQuick` when present), at most `FORM_TUNE.maxEst` hold estimates; push = pack^(1-w) x boss^w (single-target, `bossW` / `bossWHard`) x hold x Front tank; pins (`S.party.pin`) kept. `bestLineup({ zone, goal, filter, by, pin, bossW })` -> `{ field, cells, score, why, parts }` (cached), `bestLineupLater(opts, cb)` (idle steps), `lineupScore`, `applyLineup(res)` (one `setSlots`); `autoPlan(reason, opts)` -> `{ changed, res, wait }`: event-driven automatic changes with `hyst` 6%, `dwell` 300 s and no return within 10 min; `autoPlanInfo()`; event `autoPlan { reason, from, to, cells, why, gain }`. `autoField()` and `fieldIfBetter` (56-roster) go through `autoPlan`; the sim polls `autoPlan('poll')`. No save fields |
| 57c-codex.js | core | the Codex and Lantern Light (docs/design/codex.md): pages read from other systems' state, recorders for what nothing else keeps, Light (only rises), milestones, capped Page Seal bonuses, the Blessing gate; `codexPages()`, `codexLight()`, `codexBonus(key)`, `codexHas(id)`, `codexTitle()` (state in `S.codex`; UI: 75-codex-ui.js, a sheet opened from the Journal card, the Library and `emit('codexOpen', { page })`) |
| 57d-deepwell.js | core | the Deepwell (docs/design/deepwell.md): runs, floors, Oil, the boon draft (46 boons, 8 sets), Depth Marks and their shop, the weekly Trial, run save/resume; `DW` API, `deepUnlocked()`, `deepActive()`, data `DEEP_TUNE`/`DEEP_BOONS`/`DEEP_SHOP`/`DEEP_RULES` (state in `S.deep`; UI: 75-deepwell-ui.js, the Fight tab's Deepwell view). Sets the 50-sim `arena` while a run is live |
| 59-combat.js | core | party combat (Stage C): packs of 3 foes, party HP/armour/shields, threat and reach, healing, crowd control, knock-outs, wipes (retreat one zone, push back), the hold estimate for away gains and auto-push; `partyCombatOn()`, `combatTick`, `cbSpawn`, `cbStrike`, `combatUnits()`, `combatFoes()`, `partyHoldEstimate(z)`, `partyHolds(z)`, `cbBossReady()`, knobs `COMBAT_TUNE`, counters `CB_STATS` (state in `S.combat`) |
| 59b-enemies.js | core | foe behaviours by zone type (dives, archers, bruisers, spore clouds, slams, healers), elites, boss mechanics and telegraphs, parry/dodge (`resolveParry(source)`, `cbTelegraph()`), knobs `ENEMY_TUNE`, data `FOE_BEH` |
| 59c-deepwell-combat.js | core | the Deepwell on party combat (deepwell.md 8.2 and 15, plan-3 W6b): a floor is one pack (wraps `DEEP_ARENA.spawn`/`onKill`), party HP carried between floors (`run.hpAt`), a wipe ends the run (`DW.fall()`, reason `wipe`), Oil refunds +5s and parries give Oil, Taunt Drill for every class, Lifeline once a floor (`dcLifeline`), the Deep Edge Lore (D8); knobs `DEEP_COMBAT_TUNE`, `deepCombatOn()`, `DWC` (state in `S.deepCombat`: the one-time tip). 59-combat hooks: `cbArena` adopts `mob.pack`, `cbRestore(clear)` |
| 57e-constellations.js | core | Constellations, the per-class star map (docs/design/constellations.md): 4 maps of 31 stars, points (`starPoints()` = L/3 + 4 per Great Lantern), light/unlight/reset, keystone limit (2), 2 layouts per class, the boss/Deepwell lock, load repair; every effect through `addModifier`, `bonus('tune:<knob>')` and `bonus('ks:<id>')` / `starKeystone(id)` (state in `S.stars`; UI: 75-stars-ui.js, the Party tab's Stars view, feature `stars` at hero level 10) |
| 58-deeds.js | core | achievements core (AC2): tracks read the save or new counters (`S.deeds.n/g/rec`, combat as `CB_STATS` deltas once a second), a quarter of the tracks checked per second, groups, Feats, secrets, points and ladder, capped Gold/Everflame bonuses (`deedBonus(key)`), titles joined to `codexTitles()` (ids `a_*`), looks and `wearGet(slot)`, the `deeds-near` Next Up goal, away lines, old-save credit (one What's new line); waiting tracks light up by runtime probes (`S.store`, `S.hands`, `S.kitchen`, `S.bond`, `S.oath`, `S.pin`, `REGIONS[1].plugged`); API `deeds` (header of the file); state `S.deeds` |
| 75-deeds-ui.js | browser | the Achievements menu (AC3): hidden tab `deeds`, views `ach-deeds`/`ach-tracks`/`ach-feats`/`ach-looks`, track and Feat sheets, the Feat card (replaces the core's Feat toast), the Everflame portrait ring, toast taps, the title picker (local titles only); `deedsUI { open(view, id), heroRow(), featCard(id), chapterSlot() }`; optional hooks `lookIconURL(id)`, `looksPreview(canvas, wear, zoom)` (AC4), `featTrophyURL(id)` (AC5). 75-stats-ui.js: the Journal's Achievements card, the stats wall and the number switch |
| 60-gfx.js, 62-stage.js | browser | `$`/`el` DOM helpers, canvas sprites, stage drawing, visual effects (listen to bus events) |
| 70-ui.js | browser | layout (docs/design/layout.md): game view, full-screen menus and sub-views (`setTab`, `closeMenu`, `registerView`), toasts and the bell sheet (Notices, Journal), `ui()`, `registerSection`, `registerTab`, write-on-change DOM helpers (`putText`, `putStyle`, `putHidden`, ...; docs/design/perf.md), event wiring |
| 71..74-ui-*.js | browser | Fight, Gather, Forge panels; Raid and Tavern (the two parts of the World tab) |
| **75-*.js** | browser | **feature UI** |
| 80-online.js | browser | db/room/user capabilities (do not change without sign-off) |
| 90-boot.js | browser | boot, timers, frame loop |

Core files (< 60, except 05) must not touch `document`, `window`, canvas or `localStorage`:
`tools/lib/core.mjs` loads them into a Node vm for `check.mjs` and `sim.mjs`.

Shared files: 00-52, 60-74, 80, 90, `src/shell.html`, `src/styles/*`. Change them only at
extension points, in small edits. Feature-owned files: your own `55-<feature>.js`,
`75-<feature>.js`, and optionally `src/styles/60-<feature>.css`.

## Extension API

```js
on(evt, fn) -> off()        // subscribe; handler errors are caught and logged
emit(evt, payload)
```
```js
on('kill', ({ zone, gold }) => { S.bounty.count++; });
emit('bountyDone', { id });
```

```js
registerState(key, defaults) -> S[key]   // new top-level save field; merges into fresh() and old saves (missing keys only)
```
```js
registerState('bounty', { count: 0, claimed: {} });
// S.bounty.count is now always defined, for new players and old saves
```

```js
addModifier(key, fn) -> remove()   // fn() returns a multiplier; mod(key) = product of all, 1 if none
```
Keys used by formulas: `dmg`, `gold`, `xp`, `skillXp`, `gatherSpeed` (higher = faster),
`offline`, `essence`, `crit`, `critDmg`, `tap`, `party`, `raid`, `compXp` (companion XP).
```js
addModifier('gold', () => 1 + 0.05 * S.bounty.count);
// goldMult() now includes it; dps/gold UI updates automatically
```

```js
addBonus(key, fn) -> remove()   // fn() returns a number; bonus(key) = sum of all, 0 if none
deviceDay(now?) / deviceWeek(now?)   // local calendar day since 2026-01-01; weeks start Monday
```
Per-character damage: `addCharModifier(fn(id) -> mult)` in 56-roster.js; `charMod(id)` is the product.

Formation (56e-formation.js, plan-3 F1; full list at the top of the file). F2, F3 and F4 build on it:
```js
FORM_SLOTS ['back', 'mid', 'front'] (index = col), SLOT_COL, SLOT_NAME, HOME_SLOT, CLASS_HOME, FORM_TUNE, FORM_TEXT
homeSlot(key) / slotOf(key) / whoIn(slot) / offSlot(key) / adjacentKeys(key)   // key: 'hero' or a character id
formMembers() -> ['hero', ...ids]; memberRole(key) -> role; formLine() -> [{ slot, col, key, home, off }] x 3; formWarning() -> ''
setSlots({ front, mid, back }) / swapSlots(a, b) / fieldTo(id, slot) -> bool   // one fieldChange each; the hero is never benched
setPin(id, on) / isPinned(id)                                                  // at most FORM_TUNE.maxPins; event formPin
placeSlots(keep) -> cells; slotsFor(keys, pre, cur) -> cells                  // the placement rule (pure form for planners)
trioMult(), heroFloorDps(), heroCombatDps(), heroStand(tap), offSlotMult(key)  // party-combat damage
formNoLoss() -> { before, after, ratio, old, field } | null                   // this save's migration (T9)
```
Synergies and Bonds (56b, 56f; plan-3 F2):
```js
SYNERGIES [{ id, name, layer: 'combo' | 'kin' | 'bond', needs, text, parts, need, circle, pair, cls, stories }]   // 14 old ids first
slotJob(key) -> { role, slot, name, label, text }; SLOT_JOBS[role][slot]; BOND_LV_NAME ['Not yet', 'Met', ... 'Sworn']
activeSynergies() -> [{ id, name, layer, lv, members, effectText, strength }]; synergyStatus(id) -> { active, layer, lv, missing, text }
synUnit(key) -> { dr, hp, heal, healIn, th, cd, ctrl, area }; synParty() -> { revive, diveTaunt }   // 59-combat / 59b
formQuickPrep() -> prep; formQuick({ front, mid, back }, prep) -> { d, st, front, sup, syn }        // F3: pure, ~13 us a call
bondLevel(id) / bondTime(id) / bondToNext(id) / bondInfo(id) / bondsOf(key, all) / partyBonds() / bondCounts()
bondStories(id) / bondRead(id, i) / bondUnread(id) / bondSworn(id) / swornOf(charId) / bondText(id, lv) / bondSet(id, lv)
```
Everything reads the current `S.party.field` / `cells`, so a planner that swaps them in to measure a line-up
scores slots, Out of place, `trioX` and the hero floor for free. Save: `field` (at most 2) and `cells` keep
their meaning; `formV`, `pin`, `formOld` merge into `S.party` through its registered defaults.

Bonus keys: `awayHours` (added to the away cap), `find:<skill>` (rare find points), `glint:<skill>` (Glint seconds).
Extra modifier keys: `skillXp:<skill>` (per-skill XP), `yield:<family>` (harvest and away yield per material family),
`gatherSpeed:<skill>` (node speed for one gathering skill; 55-tools mastery).
Constellation hooks (57e-constellations.js): `bonus('tune:<knob>')` also carries lit stars (always on, not only in a Deepwell run); `bonus('ks:<id>') > 0` / `starKeystone(id)` flag new combat behaviour for 55-party.js to read, with its numbers in `STAR_KS` (ids: unbroken, crush, challenger, bastion, oathsworn, twinSpark, slowBurn, wildfire, overflow, everburn, glass, storm, nextMark, pack, quickdraw, hawk, deadeye, rain, dawn, sanctuary, martyr, ages). Knobs 55-party.js reads today: `STAR_TUNE_ROUTED`.
Deepwell hooks: `arena` (50-sim: while set, `arena.spawn()` supplies foes and `arena.onKill(mob, overkill)` takes their deaths; no gold, XP, `kill` event or boss timer), `mod('abilityCd')` and `bonus('tune:<knob>')` (55-party.js class knobs: embersMax, guardMax, markT, blessMax, mark, emberPerTap, guard, blessT, volleyHits, charges, keepEmbers, hymnFloor; 1 / 0 outside a Deepwell run).
Almanac hooks (55-almanac.js): modifiers `foeHp`, `bossHp` (spawn), `uniqueChance` (boss unique roll),
`nonCrit` (hero non-crit hits), `rareW` (Rare/Epic forge weights), `salvage`, `bountyPay`; bonuses
`bossTime` (seconds added to the boss timer), `bountyNoWait`, `bestiaryMult`, `masteryMult`.
Events: `omen {id, day}`, `weeklyDone {k}`, `weeklyClaim {k, quiet}`. Later systems can feed weekly
goals with `almanac.count(kind, n)`.

```js
onTick(fn(dt)) -> remove()   // after each core tick; dt in seconds (<= 0.1)
```
```js
onTick(dt => { S.bounty.timer = Math.max(0, S.bounty.timer - dt); });
```

Each tab opens as a full-screen menu (portrait) or the right-hand column (wide screens) and is split
into 2-4 **sub-views** (docs/design/layout.md has the map). Adding a system: pick a view, never append
to a tab's end.
```js
registerSection(tabId, { id, title, view, mount(el), update(force) }) -> el
  // tabId: adv|party|gat|forge|world, camp|tav|raid (the Camp tab's parts, each its own view), or log (bell sheet, Journal)
  // view: a registerView id; omitted = the tab's first view. A new id makes a new view (label = title).
registerView(tabId, { id, label, order = 50, dot }) -> view   // a sub-view button; lowest order first (the default)
  // dot() -> true: attention dot on the button (and the tab) while that view is not open. Keep it cheap.
setTab(tabOrViewId, sel?)   // open a menu; a view id ('bounties', 'raid', 'make') opens that view; sel picks the view holding it and scrolls there
closeMenu()                 // back to the game view (portrait). S.tab is '' while no menu is open
registerTab({ id, label, icon, mount(panel), update(force), hidden }) -> panel   // a sixth tab: avoid, prefer a view
  // hidden: true = a full-screen menu with no tab button (the Achievements menu, id 'deeds'): open it with
  // setTab(id) or one of its view ids; sections and views register on it like any tab (lazy mount)
```
```js
registerSection('adv', { id: 'bounty', title: 'Bounties', view: 'bounties',
  mount(sec) { sec.append(el('p', null, 'Kill 50 foes.')); },  // el() helper from 60-gfx
  update(force) { /* ~5x per second while its tab and view are open */ } });
registerView('forge', { id: 'salvage', label: 'Salvage', order: 25, dot: () => bagFull() });
```
Static markup in `src/shell.html` joins a view with `data-view="id"` on the panel's direct child
(`"*"` = every view, or a space-separated list). Sections only update while their view shows, so rows
built in `update()` may not exist yet; `setTab(tab, sel)` builds them once before it looks for `sel`.
`mount(sec)` does not run at load: it runs when the section's tab first opens, always in registration
order within the tab: the sections up to the last one of the view that opens mount at once, the rest
of the tab in the next tasks (`log` sections when the Journal first shows; `setTab(tab, sel)` mounts
the whole tab at once). The section's own element exists from registration. Keep event handlers
(`on(...)`) outside `mount`, and never rely on nodes that `mount` builds before the tab has opened.

```js
registerAwayLine(fn(r)) -> remove()   // add lines to the "While you were away" card (55-stats.js)
on('away', r => { /* apply your own offline progress for r.t capped seconds */ })
```
```js
on('away', r => { S.camp.wood += Math.floor(r.t / 60); });          // shows up in the card's diff by itself
registerAwayLine(r => S.camp.done ? { icon: { ic: ['anvil', '#F2C14E'] }, txt: 'The smithy is built', sub: 'See the Camp tab' } : null);
```
The card diffs gold, xp, levels, zones, bosses, raid damage, embers, materials, items and skill
levels around the `away` phase, so changes made to `S` there appear without a line.

```js
registerGoal({ id, sys, label, pct, go, icon, prio }) -> remove()   // a "Next up" goal (55-goals.js)
topGoals(n = 3) -> [{ id, sys, label, pct, ready, go, icon }]       // cached ~0.45s, sticky order
```
`pct()` returns progress 0..1 (>= 1 = ready, shown first; null or <= 0 hides it); keep it cheap.
`label` is a string or fn. `sys` groups goals: at most 1-2 per system are shown. `go` is
`{ tab, view, sel, fn }` (the UI runs `fn`, opens the tab's menu on the view that holds `sel`, or on
`view` when there is no `sel`, scrolls to `sel` and flashes it) or a fn
returning one. `icon` is a toast icon spec, or `{ mob: typeKey }` / `{ char: rosterId }`.
`prio` (default 0) breaks ties and orders ready goals. Register from your own 55-*.js file.
`cap: 1` (optional): the diversity pass never takes a second goal from that `sys` (the deeds nudge, the story chapter).
`reserve: 1` (optional): when the goal has something to show it keeps one of the 3 rows (it replaces the lowest other
pick), so Ready goals cannot crowd it out (the deeds nudge, AP6). At most one reserved row.
```js
registerGoal({ id: 'camp-build', sys: 'camp', label: () => `${B.name}: ready to build`,
  pct: () => campBuildPct(), go: { tab: 'world', sel: '#sec-camp' }, icon: { ic: ['anvil', '#F2C14E'] } });
```
Away lines (`registerAwayLine`) may also carry `group` (their own block title, default "Also")
and `go()` (a Go button that closes the card first); "Next up" uses both.

## Events

| Event | Payload |
|---|---|
| `spawn` | `{ mob, zone }` (a new foe; listeners may change it: champions) |
| `kill` | `{ mob, zone, gold, ess, tier }` (`mob.type`, `mob.champ`, `mob.firstKill` on bosses) |
| `zoneClear` | `{ zone }` |
| `bossFail` | `{ zone, dps }` |
| `levelup` | `{ L }` |
| `skillUp` | `{ k: 'mine'|'wood'|'smith', lv, quiet }` |
| `harvest` | `{ kind: 'ore'|'crystal'|'wood'|'fibre'|'herb', t, n, glint?, away? }` |
| `rareFind` / `toolMastery` | `{ kind, t, n, away }` (55-tools: next-tier units found) / `{ kind: 'pick'|'axe'|'sickle', lv, quiet }` |
| `trophy` / `champion` / `glint` | `{ i, n, source }` / `{ mob }` / `{ on }` (55-gathering) |
| `itemAdded` | `{ item }` |
| `loot` | `{ item, first, kept }` (unique drop) |
| `gear` | none (equipped gear changed) |
| `activity` | `{ activity: 'fight'|'gather'|'raid' }` |
| `raidReward` | `{ gen, share, embers }` |
| `raidUnavailable` | none |
| `awayBegin` / `away` / `awayEnd` | `r` (report; see 55-stats.js). Apply offline gains on `away` only |
| `tap` | `{ node }` (player tap on the stage, browser) |
| `awayKills` | `{ kills, zone, lines }` (fight branch of `awayGains`; push extra report lines) |
| `recruit` | `{ id, source }` (a character joined the roster) |
| `charLevel` | `{ id, lv, quiet }` |
| `milestone` | `{ id, lv, quiet }` (L5/10/15/20/25, then every 25) |
| `drill` | `{ id, lv, quiet }` (every 5 levels between promotions: power x `ROSTER_TUNE.stepX`) |
| `promote` | `{ id, rank }` |
| `fieldChange` | `{ field }` |
| `formPin` / `formMigrated` | `{ id, on, pin }` / `{ old, field, benched, cells, oldCells, before, after }` (56e: a pin changed; an old party of 3 became hero + 2, once per save) |
| `rosterMigrated` | `{ old, now, ratio, steps }` |
| `crafted` | `{ item, kind, t }` (item null for the Star Chart) |
| `upgraded` / `reforged` | `{ item }` / `{ item, idx, line }` |
| `transmuted` | `{ fam, fromT, toT, take, give }` |
| `charGear` | `{ id, pos, item }` (a companion's wpn/trk changed; item null when unequipped) |
| `classChosen` | `{ cls, from }` (from: the class left, null on the first choice) |
| `retooled` | `{ legacy: { weapon, helm }, swap, from }` (41-items `retoolItems`: old gear became class gear) |
| `synergyChange` | `{ active, gained, lost }` (after a field change or a Bond level change) |
| `bondLevel` / `bondStory` | `{ id, lv, prev, quiet, story: 0 \| 1 \| 2, sworn }` (56f: a Bond reached a level; quiet for seeds and away) / `{ id, i }` (a Bond story read) |
| `packSpawn` | `{ foes }` (59-combat: a new pack, or a boss and its adds; `mob` is the foe the stage shows) |
| `unitHit` / `unitHeal` | `{ key, amount, kind, foe, blocked, shield }` / `{ key, amount, shield }` (party member hit or healed; kind hit, ranged, heavy, cloud, slam, dive, poison, burn) |
| `unitDown` / `unitUp` / `unitAbility` | `{ key }` / `{ key, hp }` / `{ key, id }` (knocked out; stands up between packs or after a wipe; a companion's signature ability) |
| `foeDown` | `{ mob, src }` (one foe of the pack died; `kill` fires once per pack) |
| `wipe` | `{ zone, to, boss, arena }` (every member down: retreat one zone, a failed boss attempt, or a Deepwell pause) |
| `telegraphStart` / `telegraphResolve` | `{ kind, dur, target, foe }` / `{ kind, result, by }` (59b: boss wind-ups; kind heavy, cloud, dive, heal; result parry, dodge, hit, interrupt, heal) |
| `hearthLit` | `{ quiet }` (55-hearth: a cold save's fire is lit; `campOpen { quiet: false }` fires first) |
| `unlock` / `onboardStep` | `{ id, tab, view, quiet }` (a feature opened; id `'*'` = all) / `{ id }` (a guide step done), 55-onboard |
| `menuView` / `createDone` (UI) | `{ tab, view }` (70-ui: a menu view shows) / `{ mode }` (76-create closed) |

Party combat payloads (`packSpawn` to `telegraphResolve`) are reused objects: copy what you keep.

| `renown` | `{ n, total, source }` |
| `token` | `{ id, won, chance }` (a Grenna/Isolde token roll) |
| `visitorHired` | `{ id, day }` |
| `kingslayerCredit` (listened) | `{ n }`: expedition credit toward Corvin's 150 boss kills, 50 at most |
| `codexLight` / `codexPage` / `codexMilestone` | `{ light, gain }` / `{ id, kind: 'half'\|'seal' }` / `{ at, rewards }` (57c-codex) |
| `deedTier` / `deedGroup` / `deedFeat` / `deedSecret` | 58-deeds: `{ id, tier, quiet }` / `{ id, lv, quiet }` (1 Gold, 2 Everflame) / `{ id, quiet }` / `{ id }` |
| `deedPoints` / `deedMilestone` / `deedLook` / `deedChapter` / `deedsInit` | `{ pts, gain }` / `{ at }` / `{ slot, id }` (worn look changed; slot `helm` = the Show helm switch) / `{ id, step, quiet }` / `{ tiers, pts }` |
| `deedsOpen` (listened, UI) | `{ view: 'deeds'\|'tracks'\|'feats'\|'looks', id }`: open the Achievements menu (the nudge's Go, away lines) |
| `meal` / `tideTurn` / `storeCap` (listened) | 58-deeds counts them for Well Fed, Tide-Turner and the Pack Rat secret (K12, R2, H3 emit them) |
| `starLit` / `starUnlit` / `starReset` / `starLayout` | 57e-constellations: `{ cls, id }` / `{ cls, id }` / `{ cls, n }` / `{ cls, i }` |
| `deepStart` / `deepFloorStart` / `deepKill` / `deepFloor` / `deepOffer` / `deepPick` / `deepEnd` | 57d-deepwell: `{ trial }` / `{ floor, kind }` / `{ mob, floor }` (arena kills: no `kill`) / `{ floor, kind, trial, refund }` / `{ kind }` / `{ id, rank }` / `{ summary, away }` (`summary.reason`: oil, wipe, leave, abandon, closed). With party combat `deepKill` fires once per floor (the pack) |
| `legendDrop` / `legendLearn` / `legendRank` | 55-legend: `{ id, rank, kind: 'item'\|'echo'\|'rankUp'\|'book', source, item }` / `{ id, rank, echo, up }` / `{ id, rank }` |
| `legendInscribe` / `legendMark` / `legendSigil` / `legendChange` | 55-legend: `{ id, item }` / `{ item, circle }` / `{ circle, n, source }` / none (anything the active-build cache reads changed) |
| `expedBack` circles (listened) | 55-legend reads `{ g, circles, recall }` for Circle Sigils; 56f reads `{ team, secs }` (time out together) for Bonds |
| `codexOpen` (listened, UI) | `{ page }`: open the Codex sheet, on a page or its home (null) |
| `greatLantern` | `{ n, region, zone, name, head, text, note, quiet, rewards, say }` (55-lantern: a region boss's first kill; `quiet` = an old save's catch-up, shown as a bell line; listeners push `{ txt, ic }` onto `rewards` for the card, e.g. 57e's star points; `say`: `[{ id, name, short, line }]` from recruited characters, 55-story `storySay`) |
| `storyArrival` / `storyBeat` / `storyElder` / `storyRead` | `{ key, zone, region, head, line }` / `{ id, beat, quiet }` / `{ key, kind: 'intro' \| 'fall', name, line, zone }` / `{ id }` (55-story; the UI shows them on the stage) |
| `storeFull`, `storeCap` / `storeSpill` | 55-store: `{ fam, t }` (a flow hit the cap; once per fill; `storeCap` is the name 58-deeds reads) / `{ from, to, away? }` (Spillover or Switch moved the hero to another node) |
| `whatsNew` | `{ msg, icon, first }`: a line in the bell's one "What's new" notice (70-ui; `first` puts it at the top). Toasts raised in the first 2.5 s of play fold into it too (old-save catch-ups) |
| `toast` | `{ msg, kind, icon, prio }` (icon: URL or `{item}`/`{mat}`/`{ic}` spec; prio 'high' \| 'normal' \| 'low', see docs/design/layout.md) |
| visual only | `float {txt,color,big,x,y}`, `burst {x,y,color,n,spd}`, `shake amount`, `lunge`, `nodeHit`, `wyrmHit`, `sceneReset` |

## Save

Key `lanternfall.save.v1`, `S.v = 2`. Never rename or repurpose a field; add fields with
`registerState` (or in `fresh()` for shared-core changes). `tests/fixtures/save-v2.json` must
keep loading without loss, and so must every fixture in `tests/fixtures/` (`save-v3-four.json`: a
chosen class and a full old field of 3 with gear, for the F1 party-of-three migration). `S.tab` is the open menu's tab, or `''` on the game view (portrait).
`S.story` (55-story, LORE3): `{ v, seen: { 'a:<region>:<place>\|boss', 'b:<beatId>' (ms; negative = filed by the old-save catch-up), 'ei:<elder>', 'ef:<elder>' }, read: { beatId: 1 }, init }`.
`S.bond` (56f, plan-3 F2): `{ v, t: { id: seconds together }, lv: { id: level announced }, seen: { id: stories read } }`.
`S.settings.hud` / `S.settings.targets` (62-stage: battle bars, "Show targets"; missing = on).
`S.settings.num` ('letters' | 'sci'; missing = letters): `fmt` reads it through `setNumFormat` (00-util;
58-deeds syncs it, `deeds.setNum(v)` switches). Letters past Dc go on aa, ab, ...; below 1e36 `fmt` is unchanged.
`S.nextUp` (min, picked) belonged to the old Fight-tab strip and is kept unused. UI conveniences
(last tab, last view per tab) live in `localStorage` key `lanternfall.ui.v1`, outside the save.

## Commands

```
node tools/build.mjs                         # build dist/lanternfall.html
node tools/check.mjs                         # dist syntax + headless smoke test + save migration
node tools/sim.mjs --policy mixed --hours 2 --seed 1   # balance timeline (policy fight|mixed, --every MIN)
node tools/sim.mjs --days 30 --class warden          # normal play over days (check-ins + away gains), docs/design/pacing.md
node tools/sim.mjs --targets                          # PASS/FAIL for T1-T18, D1, P1-P4 (docs/design/pacing.md, party-and-classes.md 9) and the recruit table; retune with --pace/--tune/--unlock/--combat/--enemy k=v
node tools/sim.mjs --class warden --lineup hesketh,wren,pip --t5 1 --t6 1 --t8 1   # a fixed line-up; party combat forks at 2h (T5 wipes, T6 hold zones, T8 offline vs live)
node tools/sim.mjs --report skills [--days 30]  # GP1: time to each gathering tier (focused, hours) and the day each skill opens each tier in normal play
node tools/perf.mjs --quick                  # frame, load, tap and memory benchmark vs the budget (docs/design/perf.md)
node tools/serve.mjs [port]                  # serve dist/ at http://localhost:5173 (launch config "lanternfall")
```
