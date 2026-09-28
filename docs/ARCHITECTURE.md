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
| 30-state.js | core | save `S`, `fresh()`, `loadSave()`, `save()`, `registerState`, `online` runtime state |
| 40-rules.js | core | formulas: gear, dps, gold, xp, costs, node times |
| 41-items.js | core | items core (K4): kinds, `fits()`, `itemStats()`/`itemLines()`, 8 hero positions (`gearCalc` behind `gear()`), `charGear(id)`, affix rolls, Reforge maths, bag rule |
| 50-sim.js | core | `tick`, combat, kills, xp, harvest, bosses, offline gains |
| 51-actions.js | core | player actions: forge, equip, salvage, upgrade, buy, hire, relics, loot |
| 52-raid.js | core | world boss damage and rewards |
| **55-*.js** | core | **feature logic (no DOM)**; 55-stats.js: lifetime counters and the away report data |
| 55-goals.js | core | "Next Up": `registerGoal`, `topGoals`, the built-in goals (UI: 75-goals-ui.js); the craft goal sets `S.fSlot`/`S.fTier` and bumps `forgeGoalPicks` so the Craft tab focuses that recipe |
| 55-onboard.js | core | the guided first ten minutes (docs/design/onboarding.md): `FEATURES` unlock table, `isUnlocked(id)`, `onboardReveal`, `onboardUnlockAll`, the guide (`GUIDE_STEPS`, `onboardStep`, `onboardDone`, `onboardTips`), `goalGate` for Next Up (on only in the browser); state `S.onboard` (old saves: all open). UI: 75-onboard-ui.js. Views and sections declare `feature: id` in `registerView`/`registerSection` |
| 55-pace.js | core | idle income never stalls (BAL1): with auto-progress on, a zone whose foe takes > `PACE.farmSecs` drops to `farmableZone()` (one toast) and climbs back later; `paceCheck()`; state `S.pace.fell` |
| 55-crafting.js | core | crafting actions (K6): `craftItem`/`canCraft`, `upgradeItem` (Trophy gate +8..+10), `reforgeItem`, `transmute`, `equipChar`/`unequipChar` (one wearer per item), class-change unequip, Star Chart, Tonics; state in `S.craft` |
| 55-gathering.js | core | gathering for every family (K5): Foraging catch-up, home ground (`yield:<fam>`), signature fight drops, champions and Trophies, the Glint, offline drops; `homeFamily`, `homeBonus`, `sigDropChance`, `awaySigDrops`, `champChance`, `addTrophy`, `glint`, `whereToGet`, `GATHER_KINDS` |
| 56-roster.js | core | named companions: roster data, levels, drills, promotions, recruiting, field/cells, `compDps()` once `S.party.rv >= 1`, S.comp migration; `foesGold(z, k)` (gold worth k foes of zone z) for prices that follow the PACE curve |
| 56b-synergy.js | core | specialities, traits, passives, Legend auras, 14 synergies, Common Cause, Bond; `activeSynergies()`, `synergyStatus(id)`, `charTraits(id)` |

| 56c-unlocks.js | core | unlock avenues (B7): quests, Renown, boss tokens with pity, bestiary, Kingslayer, Star Chart, Tavern visitor; `leads()`, `addRenown`, `unlockTokenRoll`, `addTokenProgress`, `grantStarChart`, `visitorToday` (state in `S.party.unlock`) |
| 57c-codex.js | core | the Codex and Lantern Light (docs/design/codex.md): pages read from other systems' state, recorders for what nothing else keeps, Light (only rises), milestones, capped Page Seal bonuses, the Blessing gate; `codexPages()`, `codexLight()`, `codexBonus(key)`, `codexHas(id)`, `codexTitle()` (state in `S.codex`; UI: 75-codex-ui.js, a sheet opened from the Journal card, the Library and `emit('codexOpen', { page })`) |
| 57d-deepwell.js | core | the Deepwell (docs/design/deepwell.md): runs, floors, Oil, the boon draft (46 boons, 8 sets), Depth Marks and their shop, the weekly Trial, run save/resume; `DW` API, `deepUnlocked()`, `deepActive()`, data `DEEP_TUNE`/`DEEP_BOONS`/`DEEP_SHOP`/`DEEP_RULES` (state in `S.deep`; UI: 75-deepwell-ui.js, the Fight tab's Deepwell view). Sets the 50-sim `arena` while a run is live |
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

Bonus keys: `awayHours` (added to the away cap). Extra modifier keys: `skillXp:<skill>` (per-skill XP),
`yield:<family>` (harvest and away yield per material family).
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
registerTab({ id, label, icon, mount(panel), update(force) }) -> panel   // a sixth tab: avoid, prefer a view
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
| `harvest` | `{ kind: 'ore'|'crystal'|'wood'|'fibre'|'herb', t, n, glint? }` |
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
| `rosterMigrated` | `{ old, now, ratio, steps }` |
| `crafted` | `{ item, kind, t }` (item null for the Star Chart) |
| `upgraded` / `reforged` | `{ item }` / `{ item, idx, line }` |
| `transmuted` | `{ fam, fromT, toT, take, give }` |
| `charGear` | `{ id, pos, item }` (a companion's wpn/trk changed; item null when unequipped) |
| `classChosen` | `{ cls, from }` (from: the class left, null on the first choice) |
| `retooled` | `{ legacy: { weapon, helm }, swap, from }` (41-items `retoolItems`: old gear became class gear) |
| `synergyChange` | `{ active, gained, lost }` (after a field change) |
| `unlock` / `onboardStep` | `{ id, tab, view, quiet }` (a feature opened; id `'*'` = all) / `{ id }` (a guide step done), 55-onboard |
| `menuView` / `createDone` (UI) | `{ tab, view }` (70-ui: a menu view shows) / `{ mode }` (76-create closed) |

| `renown` | `{ n, total, source }` |
| `token` | `{ id, won, chance }` (a Grenna/Isolde token roll) |
| `visitorHired` | `{ id, day }` |
| `kingslayerCredit` (listened) | `{ n }`: expedition credit toward Corvin's 150 boss kills, 50 at most |
| `codexLight` / `codexPage` / `codexMilestone` | `{ light, gain }` / `{ id, kind: 'half'\|'seal' }` / `{ at, rewards }` (57c-codex) |
| `deepStart` / `deepFloorStart` / `deepKill` / `deepFloor` / `deepOffer` / `deepPick` / `deepEnd` | 57d-deepwell: `{ trial }` / `{ floor, kind }` / `{ mob, floor }` (arena kills: no `kill`) / `{ floor, kind, trial, refund }` / `{ kind }` / `{ id, rank }` / `{ summary, away }` |
| `codexOpen` (listened, UI) | `{ page }`: open the Codex sheet, on a page or its home (null) |
| `toast` | `{ msg, kind, icon, prio }` (icon: URL or `{item}`/`{mat}`/`{ic}` spec; prio 'high' \| 'normal' \| 'low', see docs/design/layout.md) |
| visual only | `float {txt,color,big,x,y}`, `burst {x,y,color,n,spd}`, `shake amount`, `lunge`, `nodeHit`, `wyrmHit`, `sceneReset` |

## Save

Key `lanternfall.save.v1`, `S.v = 2`. Never rename or repurpose a field; add fields with
`registerState` (or in `fresh()` for shared-core changes). `tests/fixtures/save-v2.json` must
keep loading without loss. `S.tab` is the open menu's tab, or `''` on the game view (portrait).
`S.nextUp` (min, picked) belonged to the old Fight-tab strip and is kept unused. UI conveniences
(last tab, last view per tab) live in `localStorage` key `lanternfall.ui.v1`, outside the save.

## Commands

```
node tools/build.mjs                         # build dist/lanternfall.html
node tools/check.mjs                         # dist syntax + headless smoke test + save migration
node tools/sim.mjs --policy mixed --hours 2 --seed 1   # balance timeline (policy fight|mixed, --every MIN)
node tools/sim.mjs --days 30 --class warden          # normal play over days (check-ins + away gains), docs/design/pacing.md
node tools/sim.mjs --targets                          # PASS/FAIL for T1-T3, T10, T16, D1, P1-P4 (docs/design/pacing.md) and the recruit table; retune with --pace/--tune/--unlock k=v
node tools/perf.mjs --quick                  # frame, load, tap and memory benchmark vs the budget (docs/design/perf.md)
node tools/serve.mjs [port]                  # serve dist/ at http://localhost:5173 (launch config "lanternfall")
```
