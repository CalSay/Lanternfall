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
| 20-data.js | core | constants: zones, mats, slots, uniques, companions, upgrades, relics |
| 30-state.js | core | save `S`, `fresh()`, `loadSave()`, `save()`, `registerState`, `online` runtime state |
| 40-rules.js | core | formulas: gear, dps, gold, xp, costs, node times |
| 41-items.js | core | items core (K4): kinds, `fits()`, `itemStats()`/`itemLines()`, 8 hero positions (`gearCalc` behind `gear()`), `charGear(id)`, affix rolls, Reforge maths, bag rule |
| 50-sim.js | core | `tick`, combat, kills, xp, harvest, bosses, offline gains |
| 51-actions.js | core | player actions: forge, equip, salvage, upgrade, buy, hire, relics, loot |
| 52-raid.js | core | world boss damage and rewards |
| **55-*.js** | core | **feature logic (no DOM)**; 55-stats.js: lifetime counters and the away report data |
| 55-goals.js | core | "Next Up": `registerGoal`, `topGoals`, the built-in goals (UI: 75-goals-ui.js) |
| 56-roster.js | core | named companions: roster data, levels, promotions, recruiting, field/cells, `compDps()` once `S.party.rv >= 1`, S.comp migration |
| 56b-synergy.js | core | specialities, traits, passives, Legend auras, 14 synergies, Common Cause, Bond; `activeSynergies()`, `synergyStatus(id)`, `charTraits(id)` |

| 56c-unlocks.js | core | unlock avenues (B7): quests, Renown, boss tokens with pity, bestiary, Kingslayer, Star Chart, Tavern visitor; `leads()`, `addRenown`, `unlockTokenRoll`, `addTokenProgress`, `grantStarChart`, `visitorToday` (state in `S.party.unlock`) |
| 60-gfx.js, 62-stage.js | browser | `$`/`el` DOM helpers, canvas sprites, stage drawing, visual effects (listen to bus events) |
| 70-ui.js | browser | tabs, toasts, `ui()`, `registerSection`, `registerTab`, event wiring |
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

```js
onTick(fn(dt)) -> remove()   // after each core tick; dt in seconds (<= 0.1)
```
```js
onTick(dt => { S.bounty.timer = Math.max(0, S.bounty.timer - dt); });
```

```js
registerSection(tabId, { id, title, mount(el), update(force) }) -> el   // tabId: adv|party|gat|forge|world, or raid|tav (parts of World)
registerTab({ id, label, icon, mount(panel), update(force) }) -> panel   // prefer sections (360px)
```
```js
registerSection('adv', { id: 'bounty', title: 'Bounties',
  mount(sec) { sec.append(el('p', null, 'Kill 50 foes.')); },  // el() helper from 60-gfx
  update(force) { /* ~5x per second while the tab is open */ } });
```

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
`{ tab, sel, fn }` (the UI runs `fn`, opens the tab, scrolls to `sel` and flashes it) or a fn
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
| `kill` | `{ mob, zone, gold, ess, tier }` |
| `zoneClear` | `{ zone }` |
| `bossFail` | `{ zone, dps }` |
| `levelup` | `{ L }` |
| `skillUp` | `{ k: 'mine'|'wood'|'smith', lv, quiet }` |
| `harvest` | `{ kind: 'ore'|'wood', t, n }` |
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
| `promote` | `{ id, rank }` |
| `fieldChange` | `{ field }` |
| `rosterMigrated` | `{ old, now, ratio, steps }` |
| `synergyChange` | `{ active, gained, lost }` (after a field change) |

| `renown` | `{ n, total, source }` |
| `token` | `{ id, won, chance }` (a Grenna/Isolde token roll) |
| `visitorHired` | `{ id, day }` |
| `kingslayerCredit` (listened) | `{ n }`: expedition credit toward Corvin's 150 boss kills, 50 at most |
| `toast` | `{ msg, kind, icon }` (icon: URL or `{item}`/`{mat}`/`{ic}` spec) |
| visual only | `float {txt,color,big,x,y}`, `burst {x,y,color,n,spd}`, `shake amount`, `lunge`, `nodeHit`, `wyrmHit`, `sceneReset` |

## Save

Key `lanternfall.save.v1`, `S.v = 2`. Never rename or repurpose a field; add fields with
`registerState` (or in `fresh()` for shared-core changes). `tests/fixtures/save-v2.json` must
keep loading without loss.

## Commands

```
node tools/build.mjs                         # build dist/lanternfall.html
node tools/check.mjs                         # dist syntax + headless smoke test + save migration
node tools/sim.mjs --policy mixed --hours 2 --seed 1   # balance timeline (policy fight|mixed, --every MIN)
node tools/serve.mjs [port]                  # serve dist/ at http://localhost:5173 (launch config "lanternfall")
```
