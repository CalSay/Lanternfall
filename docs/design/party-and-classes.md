# Party and classes

Status: design spec for ROADMAP Phase 1. Written 2026-09-27. All numbers are starting values
for `tools/sim.mjs` to tune; the ratios and rules are the design.

Owner constraints this spec obeys: no prestige or resets, single-player first, idle most of
the time with active moments, playable on a 360px phone, Play Store possible later.

---

## 1. Fantasy and loop

**Fantasy:** you lead a small lantern-bearing warband. You pick who stands in front, who
heals, who you are. You watch them hold a line, and step in at the moments that matter.

**Idle check-in (30 to 90 seconds, several times a day)**

1. Open the game. "While you were away" card: gold, essence, companion levels gained.
2. Spend: promote a companion who hit their level cap, recruit a new face, forge one item.
3. Glance at the party: if the Fight tab shows "Party can push", tap Push.
4. Close. The party keeps fighting at the highest zone it can hold.

**Active session (5 to 15 minutes)**

1. Push the zone boss. Boss wind-ups show a red "!" and a ring on the boss. Tap the boss inside
   the window to parry.
2. Fire the hero ability on its button at the right moment (Shield Wall before a heavy hit,
   Lantern Flare into a fresh pack, Rally Hymn when the tank is low).
3. Try a different class at the Shrine against a boss that walled you. Switching is free.

Active play is worth about 1.3x idle progress speed at the push zone (see Balance targets).
Missing everything costs time, never progress.

---

## 2. Hero classes

The hero keeps one level, one set of gear and one set of hero upgrades (Blade, Swiftness,
Fortune). Class changes the hero's role, stat multipliers, aura and ability. Switch at the
**Shrine** (section in the Fight tab, unlocked at zone 3). Cost: nothing. Limits: not during a
boss fight; 5 second cooldown between switches to stop mis-taps. Existing and new saves start
as **Warden** (the current sword hero).

Hero base values (from existing formulas): `heroAtk()`, `aps()`, `critChance()`, `critMult()`.
Hero power `hp0 = heroAtk() * aps()`.

| Class | Role | HP | ATK | Armour | Passive | Aura (applies to companions of that role) | Also |
|---|---|---|---|---|---|---|---|
| Warden | tank (front) | 12 x hp0 | x0.8 | +30 | Enemies always target the Warden while alive | Tanks: +40% HP, +20 armour | Whole party takes 10% less damage |
| Lanternmage | caster (back) | 4 x hp0 | x1.0, hits all enemies | 0 | Attacks splash 50% to every other enemy | Casters: +30% ATK | Overkill damage carries to the next enemy |
| Ranger | striker (mid) | 5 x hp0 | x1.1 | 0 | +10% crit chance, +1.0 crit multiplier | Strikers: +10% crit chance, +50% crit damage | Taps deal +50% |
| Chaplain | support (back) | 6 x hp0 | x0.6 | +10 | Heals lowest-HP ally for 0.8 x hp0 per second | Supports: +40% healing | Companion ability cooldowns -25% |

### Hero abilities (one per class, tap button on the stage)

| Ability | Effect | Cooldown | Auto-cast (idle) |
|---|---|---|---|
| Shield Wall | 6s: party takes 60% less damage; the next boss heavy hit in the window is blocked fully (counts as a parry) | 30s | fires when front member < 50% HP |
| Lantern Flare | Instant 20 x heroAtk to every enemy, then burn 1 x heroAtk per second for 5s | 25s | fires when a new pack spawns |
| Volley | 10 arrows over 2s, each 3 x heroAtk at random enemies, can crit; strikers +50% attack speed for 8s | 30s | fires on cooldown |
| Rally Hymn | Heal party 40% max HP; +30% attack speed for 8s; all companion cooldowns advance 50% | 40s | fires when any member < 40% HP |

Auto-cast unlocks at zone 10 and runs at **double cooldown** (a toggle on the button, on by
default). Manual casting is about 2x the uptime plus good timing. Offline progress assumes
auto-cast value (a flat 1.05 dps factor; see 4.8).

---

## 3. Companions (recruits)

Companions stop being counters. Each is one named recruit with a role, a level, a rank, two
gear slots and one ability. **3 on the field plus the hero; the rest wait on the bench.**
The bench earns 50% XP.

### 3.1 Roster (9 recruits)

`idx` = old `S.comp` index they migrate from. Base power `b` = the old `COMPS[i].dps`, so a
level-1 recruit feels like the old unit. New recruits get values on the same curve.

| Recruit | Role | idx | b | Unlock | Recruit cost | Ability (auto) | CD |
|---|---|---|---|---|---|---|---|
| Squire | tank | 0 | 2 | start | 15g | Guard: 4s, takes 40% less damage | 12s |
| Archer | striker | 1 | 12 | zone 2 | 120g | Aimed Shot: 5 x ATK, always crits | 10s |
| Lamplighter (new) | support | - | 30 | zone 3 | 400g | Mend: heal lowest ally 25% max HP | 8s |
| Hedge Mage | caster | 2 | 70 | zone 4 | 1,100g | Fireball: 4 x ATK to all enemies | 10s |
| Knight | tank | 3 | 420 | zone 8 | 25K | Shield Bash: 4 x ATK, stuns 1.5s (interrupts a boss wind-up) | 15s |
| Dragoon | striker | 4 | 2,600 | zone 12 | 150K | Leap: 8 x ATK to front enemy, untargetable 1s | 14s |
| Duskblade (new) | striker | - | 16,000 | zone 16 | 900K | Execute: 12 x ATK if target < 30% HP, else 3 x | 9s |
| Starcaller | caster | 5 | 100,000 | zone 20 | 5M | Starfall: 3 pulses of 3 x ATK to all, over 3s | 18s |
| Lantern Saint | support | 6 | 2.5M | zone 28 | 150M | Sanctuary: heal all 20% max HP, then 3% per second for 5s | 20s |

Recruit cost is one-time gold, about 400 average kills at the unlock zone. Unlock = `S.maxZone`
reached (migrated recruits are unlocked regardless).

### 3.2 Role stats

Companion power: `pow = b * 1.08^(lv-1) * 2^rank * (1 + weaponPct/100) * dmgMult() * (1 + gear().party/100) * mod('party')`

| Role | Damage per second | Max HP | Armour | Speed (attacks/s) | Targeted by |
|---|---|---|---|---|---|
| tank | 0.5 x pow | 12 x pow | 20 (Knight 40) | 0.8 | front slot |
| striker | 1.4 x pow, crit 15% x3 | 5 x pow | 0 | 1.2 | mid |
| caster | 1.0 x pow to all enemies | 4 x pow | 0 | 0.7 | back |
| support | 0.3 x pow damage + heals 1.0 x pow HP/s to lowest-% ally | 6 x pow | 10 | 1.0 | back |

### 3.3 Levels, XP, ranks

- XP source: every kill gives each fielded companion `mob.xp` (1.5 x zone, boss x5). Bench gets 50%. Offline uses the same, closed form.
- XP to next level: `cxpNeed(lv) = 20 * 1.18^(lv-1)`.
- Ranks replace the old x2 every 25 count. Level cap = `25 * (rank + 1)`. At the cap, XP banks (up to one level's worth) and the card shows **Promote**.
- Promote cost: `recruitCost * 4^(rank+1)` gold plus `10 * (rank+1)` essence of tier `min(5, rank+1)`. Effect: rank +1, power x2, cap +25.
- Ranks: Recruit (0), Veteran (1), Captain (2), Champion (3), Legend (4). Max rank 4, max level 125.
- Gold sinks after this change: hero upgrades (unchanged), recruits, promotions, forging. The old per-count hire goes away.

### 3.4 Companion gear slots

Each companion has 2 slots: **role weapon** and **trinket** (section 5).

---

## 4. Combat model

### 4.1 Units

| Unit | HP | Attack per hit | Speed | Armour |
|---|---|---|---|---|
| Party member | role table (3.2) or class table (2) | role DPS / speed | role | role + gear |
| Normal enemy | `0.4 * mobHp(z)` (packs of 3) | `1.2 * 1.55^(z-1)` | 0.8/s | 0 |
| Zone boss | `8 * mobHp(z)` (unchanged) | `3 * 1.55^(z-1)` | 0.6/s | 0 |

`mobHp(z) = 10 * 1.55^(z-1)` is unchanged, so gold (`mobGold` per enemy x0.4, pack total 1.2x),
essence and zone pacing keep their current curve.

**Packs:** normal encounters are packs of 3 enemies side by side (72% zone type, 28% next type,
per enemy). Kills toward the boss count packs: 10 packs unlock the boss (unchanged number).
Packs give AoE and casters a job.

### 4.2 Targeting

- Formation has 4 slots: Front, Mid, Back, Back. Player orders it; default auto-order is tank > striker > support > caster.
- A Warden hero is always Front. Otherwise the hero takes its class slot.
- Enemies attack the front-most living member. Exceptions from enemy traits (4.5).
- Party single-target attacks hit the front enemy; AoE hits all.

### 4.3 Damage and healing

- `hit = ATK * (crit ? critMult : 1) * mods * (1 - red(target))`
- `red = min(0.6, armour / (armour + 100))`. Armour is flat: class, role, shields, hero helm (0.1 x helm power).
- Enemies have no armour; their HP curve is their defence.
- Healing goes to the ally with the lowest HP fraction. Overheal is lost.
- Regen: 0.5% max HP/s in combat, plus 10% max HP between packs (the 1s respawn gap).

Par check (why these numbers): at a zone the party can just farm, party DPS about `4 * 1.55^(z-1)`
(pack of 3 dies in about 3s). Tank HP about `9.6 * 1.55^(z-1)`, incoming about 8% of tank HP
per second after armour, one support heals about 8% per second. So: at par a party with a
support holds; without a support it wipes after 5 to 8 packs; at 1.5x par anything holds.

### 4.4 Knock-outs, wipes, retreat

- A member at 0 HP is **down** until the pack dies, then stands up at 30% HP.
- All 4 down = **wipe**. Toast: "Your party fell back to regroup." The party retreats one zone
  (`S.zone - 1`, min 1), fully heals after 5s and keeps farming. No gold, items or XP are lost.
- Auto-push (existing `S.auto`) returns to the wiped zone once party DPS > 1.15 x the DPS at the
  wipe (same rule as `failDps` today).
- Boss fight: timer rises from 30s to 45s. Wipe or timeout = fail, `bossFail` fires as today.

### 4.5 Enemy traits (one per type)

| Type | Trait |
|---|---|
| Moss Slime | none (tutorial enemy) |
| Cave Bat | fast: speed 1.4, attack x0.6 |
| Rattlebones | reassembles once at 20% HP unless killed by AoE |
| Barrow Beetle | HP x1.3, attack x0.8 |
| Spore Cap | hits apply poison: 2% max HP/s for 4s |
| Quarry Golem | slow heavy: speed 0.4, attack x2.2 |
| Marsh Wraith | reach: 30% of hits target the lowest-HP back member |

### 4.6 Boss telegraphs (the active moment)

- Every 8s the boss winds up a **heavy hit** for 1.5s: red "!" over the boss, a shrinking ring,
  a rising tone. Heavy hit = 4 x boss attack on the front member (Hydra/Colossus variants may
  hit all members at 1.5 x each).
- **Tap the boss during the last 0.8s = Parry**: no damage, boss staggered 2s, takes +50%
  damage while staggered. Tap earlier in the wind-up = **Dodge**: damage halved. No tap = full hit.
- Knight's Shield Bash and Shield Wall also count as a parry (so idle Warden or Knight parties
  survive bosses without the player).
- Taps outside a wind-up still deal tap damage, as today. A parry has a 44px hit ring minimum.
- Reduced motion: no shake or ring animation; the "!" and a colour flash on the boss stay.

### 4.7 Zone scaling

Everything enemy-side scales by `1.55^(z-1)`. Party power scales by levels (x1.08 per level,
about 6 levels per zone), ranks (x2), gear (%), hero upgrades and relics. The wall is where
party power falls behind: TTK grows and incoming damage grows together, so walls come from
both too little DPS and too little sustain, and tanks and supports matter.

### 4.8 Offline estimate (closed form)

No simulation. On load, for `z = S.zone` down to `S.zone - 10`:

```
D   = (fieldDps + heroDps*0.5) * aoeFactor * 1.05   // aoeFactor = 1 + 1.0 * aoeShare (about 2 alive on average)
in  = 0.8 * enemyAtk(z) * (1 - red(front)) * 3/2     // about 1.5 enemies alive per pack on average
sus = partyHealPerSec + frontRegen                   // heals + 0.5% regen, plus 10%/pack amortised
holds(z) = sus >= in  OR  frontHp / (in - sus) >= 120s
```

Use the highest `z` that holds. Kills = `D * t / mobHp(z) * boost` (boost as today). Gold,
essence and XP from kills as today; companion XP levels via a loop capped at rank cap (at most
125 steps per companion). If the zone changed, the card says "Your party held Batwing Caves II."
Raid and gather offline stay as they are.

### 4.9 World raid

Keep it simple. The raid boss does not attack, and HP does not matter. Party raid DPS =
`heroDps + fieldCompanionDps` (supports count their 0.3 x pow damage), times `raidMult()`.
The `raiders/<id>.dps` value keeps its shape (a number). No telegraphs in the raid in this spec.

---

## 5. Itemisation

### 5.1 Companion gear (new item slots, same `S.items` bag)

| Slot id | Item | Fits | Recipe (tier 1, scales like hero recipes) | Stat from power `p` |
|---|---|---|---|---|
| `shield` | Shield | tank | ore 5, wood 2, ess 1 | +p% HP, +0.25p armour |
| `bow` | Bow / Spear (Dragoon, Duskblade) | striker | wood 6, ore 1, ess 1 | +p% damage, +min(20, 0.05p)% crit |
| `staff` | Staff | caster | wood 4, ess 4 | +p% damage |
| `tome` | Tome | support | wood 2, ess 6 | +p% healing, +0.5p% damage |
| `trinket` | Trinket | any | ore 2, ess 4 | +0.6p% HP, -min(25, 0.05p)% ability cooldown |

Power, rarity, tiers, `+N` upgrades, salvage and forging all reuse the hero rules
(`itemPower`, `craftCost`, `upgradeCost`, `rollRarity`). The Forge's slot picker gets a second
row: "Party gear". Bag limit rises from 40 to 60.

Bosses: each zone boss kill has a 20% chance to also drop a companion item of the zone tier
(random role weapon or trinket, rolled rarity).

### 5.2 Hero gear stays relevant

- Weapon Might still multiplies the whole party (`dmgMult()` feeds companion power).
- Helm keeps crit and adds hero armour (0.1 x power), which matters for a Warden.
- Charm, Pickaxe, Axe unchanged. Existing uniques unchanged. Rattlebone Charm and
  Lantern Eater's Fang (`party` %) become stronger, which is intended.

### 5.3 Companion uniques (6)

Drop from zone bosses from cycle II (zone 8+), 10% per boss kill, pool by zone type. Raid pool unchanged.

| Unique | Slot | Source | Effect | Trade-off |
|---|---|---|---|---|
| Mossguard | shield | Mossy Hollow II+ | Tank reflects 20% of damage taken | - |
| Echo String | bow | Batwing Caves II+ | Crits fire a second shot for 50% | - |
| Ossuary Staff | staff | The Bonefield II+ | AoE damage +40% | Wielder takes +15% damage |
| Golem Heart | trinket | Quarry Ruins II+ | +50% max HP | -15% attack speed |
| Skyfall Spear | bow | Beetle Barrows II+ | **Dragoon only**: Leap hits twice | none on others (cannot equip) |
| Saint's Wick | trinket | Wraithmarsh II+ | **Lantern Saint only**: once per fight, revives the first downed ally at 30% HP | - |

(Fungal Deep II+ drops a guaranteed companion item instead of a unique.)

---

## 6. Save migration (v2 to v3)

Principle: never rename or repurpose a field. `S.comp`, `S.blade`, `S.swift`, `S.fortune`,
`S.items`, `S.equip` stay exactly as they are. New state lives under one new field.

```js
registerState('party', {
  v: 0,                    // 0 = not migrated, 1 = migrated
  cls: 'warden', clsAt: 0, // class and last switch time
  field: [], order: [],    // up to 3 recruit ids; formation order incl. 'hero'
  rec: {},                 // id -> { lv, xp, rank, wpn: itemId|null, trk: itemId|null }
  autoCast: true, wipeDps: 0
});
```
`S.v` becomes 3 after migration (a new value, old code never reads it as anything else).

**Mapping rules** (run once when `S.party.v === 0`, in `migrateParty()`):

1. For each old index `i` with `n = S.comp[i] > 0`, recruit `ID[i]`
   (`squire, archer, hedgemage, knight, dragoon, starcaller, saint`):
   `rank = min(4, floor(n / 25))`, `lv = min(25 * (rank + 1), max(1, n))`, `xp = 0`, no gear.
2. Migrated recruits count as unlocked even if `S.maxZone` is below their unlock zone.
3. Field = the 3 recruits with the highest DPS, tank first if any tank exists.
4. **No-loss check:** `old = sum over i of COMPS[i].dps * n * 2^floor(n/25) * multipliers` (the
   old `compDps()`). If `fieldCompDps() < old`, add 1 level to every migrated recruit (ignoring
   the cap for this step only, and bumping rank if the cap is passed) and repeat until
   `fieldCompDps() >= old`, max 500 steps.
5. `S.party.cls = 'warden'`. `S.party.v = 1`. `S.v = 3`. Save.
6. `S.comp` is left untouched (read-only history). New code never writes to it.
7. Items: all existing items keep ids and slots. No companion gear exists yet.

Fixture: `tests/fixtures/save-v2.json` (comp `[25,14,6,0,0,0,0]`) must migrate to Squire
rank 1 lv 25+, Archer lv 14+, Hedge Mage lv 6+, with field DPS >= old `compDps()`.
Add `tests/fixtures/save-v2-late.json` with all 7 comps > 0 and check the same.

---

## 7. UI on a 360px phone

### 7.1 Where the party lives

Tabs stay 5 for now (Fight, Gather, Forge, Raid, Tavern). The party is reached two ways:

- **Tap any party member on the stage** (outside a boss wind-up) opens their character sheet.
- **Fight tab, top section "Party"**: 4 portrait cards in a row (hero + 3), 80 x 88px each,
  showing sprite, level, HP bar and a role pip. Tap = character sheet. Below it "Recruits"
  (bench and locked recruits) and the **Shrine** (4 class buttons, 2 x 2 grid, 44px min height).
- The old companion hire list is replaced by the Recruits list.

### 7.2 Character sheet (bottom sheet, 90% height, swipe down or X to close)

```
[ sprite 64x64 ]  Archer          Lv 34  Veteran
                  Striker         [#####-----] XP
------------------------------------------------
HP 12.4K   ATK 3.1K/s   Armour 0   Speed 1.2
Crit 25%   Crit x3.0    Ability CD 10s
------------------------------------------------
[Bow slot 56px]  [Trinket slot 56px]
------------------------------------------------
Aimed Shot: 5x damage, always crits. Every 10s.
------------------------------------------------
[ Promote 2.1M ]  [ Bench ]  [ Move: Front Mid Back ]
```
Hero sheet shows the 5 hero gear slots in a 5 x 1 row (56px each, fits 360 - 32px gutter) and
the class with a "Change at Shrine" link.

### 7.3 Stage layout (logical canvas is about 180 x 100 pixels at P = 2)

```
 x:  0.10   0.22   0.32   0.42  |  0.60  0.72  0.84
     back   back   mid    FRONT |  enemy enemy enemy
     (row y-6)     (row y-6)    |  (boss: one sprite at 0.72)
```
- Two depth rows: slots 1 and 3 at ground line, slots 2 and 4 six pixels higher and drawn first.
- HP bar 16 x 2px above each unit, green > 50%, amber > 25%, red below. Down = grey sprite, no bar.
- Ability button: 56px circle, bottom-right corner of the stage, cooldown as a pie sweep; a
  small gold ring when auto-cast is on. Companion ability pips: 6px dots under each HP bar that fill as cooldowns run.
- Boss "!" 12px above the boss; parry ring centred on the boss, 44px minimum hit area.

---

## 8. Art direction

- **Sizes (source pixels):** party and normal enemies 16 x 16 (hero is 14 wide today); zone
  bosses 24 x 24; raid wyrm unchanged. Draw scale 2 for units, 3 for bosses at P = 2.
- **Frames:** idle 2 (bob 1px, 500ms each); attack 3 (wind-up 120ms, strike 80ms, recover
  150ms); hit 1 (white flash 80ms plus 1px knockback); down 1. Enemies add wind-up 2 frames
  (crouch, raised) looped during boss telegraphs with a red outline pulse at 4Hz.
- **Palette:** max 7 indices per sprite plus outline `#0B0810` (as today). Role colour on the
  main cloth index: tank steel blue `#3E63C9`, striker green `#3E8A4E`, caster violet `#8A4FC9`,
  support cream-gold `#EFE6D6`/`#F2C14E`. Classes reuse the hero body with a palette swap plus
  one overlay (Warden shield, Lanternmage lantern-staff, Ranger bow, Chaplain censer). Zone
  cycles keep the `shiftPal` hue shift. Must read at 1x on a dark sky: keep a 1px outline.
- **Pipeline extension:** a sprite becomes `{ base: rows[], frames: { idle: [delta, delta], attack: [...], ... } }`
  where a delta is a list of `[x, y, index]` pixel overrides or a whole-row replacement. Frames
  are baked once per `(key, frame, paletteKey)` into an offscreen canvas and cached in the
  existing sprite cache; drawing stays one `drawImage` per unit per frame. Overlays (weapons)
  are separate 8 x 8 maps with a pivot, drawn after the body (as the hero tool is today).
- **Motion budget:** at most 8 animated units on screen; 60fps target, 30fps on low-end.
  `prefers-reduced-motion`: idle frames freeze, no knockback or shake, flashes stay.

---

## 9. Balance targets (tools/sim.mjs)

Baseline today (`--policy mixed --seed 1`): zone 14 at 30m, 20 at 1h, 29 at 2h, 51 at 3h.

The simulator gets flags `--class warden|lanternmage|ranger|chaplain`, `--active 0|1`
(1 = casts on cooldown and parries 80% of wind-ups) and `--offline-check`.

| # | Target | Pass band |
|---|---|---|
| T1 | Idle mixed policy, any class: max zone at 30m / 1h / 2h | 12-16 / 18-22 / 26-32 |
| T2 | Late-game runaway: max zone at 3h | <= 42 (today's 51 is a known runaway) |
| T3 | Class spread: time to zone 20 for each class vs the median | 0.85-1.15 |
| T4 | Active vs idle (`--active 1` vs `0`): time to zone 20 | active 20-35% faster |
| T5 | Wipes per hour while farming at `maxZone - 2` | 0 |
| T6 | Wipes on a fresh push zone with no support in field | 1+ within 10 min (supports matter) |
| T7 | First boss attempt success rate, idle | 40-70% |
| T8 | Offline estimate vs simulated 1h of fighting (gold) | within +-15% |
| T9 | Migration of both fixtures: field DPS vs old `compDps()` | >= 1.00, <= 1.30 |
| T10 | Promotion due (cap hit) at least once per 20 min for the top companion before 2h | yes |

---

## 10. Build plan

Every stage ships behind `S.party.v` and a build flag `PARTY_STAGE` (A, B, C) in `00-util.js` so
main stays playable between merges. Each agent runs `node tools/build.mjs` and
`node tools/check.mjs`. Owners below are exclusive for the stage; "small edit" means an
extension-point change of a few lines, reviewed by the coordinator.

### Stage A: classes, abilities, visible party

| Task | Owns | Small edits in |
|---|---|---|
| A1 Classes core: class table, Shrine switch, auras as `addModifier`, hero abilities (cooldowns, effects, auto-cast), `registerState('party')` | `src/js/55-party.js` | - |
| A2 Party art data: 16x16 hero body + 4 class overlays, 7 companion maps, frame deltas | `src/js/12-art-party.js` (core, data only) | - |
| A3 Animation + stage: frame baking/cache, formation drawing (hero + top 3 owned old comps for now), ability button overlay | `src/js/61-anim.js` | `src/js/62-stage.js` |
| A4 UI: Shrine section, character sheet (hero only), Party cards | `src/js/75-party.js`, `src/styles/60-party.css` | `src/js/71-ui-fight.js` |
| A5 Sim: `--class`, `--active` flags; T1, T3, T4 report | `tools/sim.mjs` | - |

### Stage B: recruits, levels, companion gear

| Task | Owns | Small edits in |
|---|---|---|
| B1 Recruits core: roster, XP, ranks, promote, recruit, field/bench, `fieldCompDps()`; switch `compDps()` to it when `S.party.v >= 1` | `src/js/56-recruits.js` | `src/js/40-rules.js` (compDps), `src/js/51-actions.js` (hireComp retired) |
| B2 Migration: `migrateParty()`, second fixture, check.mjs asserts T9 | `src/js/57-migrate.js`, `tests/fixtures/save-v2-late.json`, `tools/check.mjs` | `src/js/30-state.js` (call after load) |
| B3 Companion items: `COMP_SLOTS`, recipes, stats, 6 uniques, boss drops, bag 60 | `src/js/58-comp-items.js` | `src/js/20-data.js`, `src/js/40-rules.js` (itemName/itemColor), `src/js/73-ui-forge.js` (second row) |
| B4 UI: recruit list, companion character sheet, gear equip, promote, formation order | `src/js/75-party.js` (continues from A4) | - |
| B5 Art: Lamplighter and Duskblade sprites, 5 companion gear icons | `src/js/12-art-party.js` | `src/js/10-art.js` (ICON entries) |

### Stage C: enemy attacks, roles, boss telegraphs

| Task | Owns | Small edits in |
|---|---|---|
| C1 Combat core: HP, packs, targeting, damage, healing, KO, wipe/retreat, enemy traits | `src/js/59-combat.js` | `src/js/50-sim.js` (tick branches to `combatTick` when flag C) |
| C2 Offline estimate: `partyAwayEstimate()` per 4.8 | `src/js/58-offline.js` | `src/js/50-sim.js` (awayGains fight branch calls it; coordinate with C1) |
| C3 Boss telegraphs: wind-up timer, parry/dodge resolution, stagger, `telegraph` events | `src/js/59b-boss.js` | `src/js/50-sim.js` (`playerTap` checks parry first) |
| C4 Stage combat visuals: packs of 3, HP bars, KO, enemy wind-up frames, parry ring, reduced motion | `src/js/61-anim.js`, `src/js/62-stage.js` | - |
| C5 Sim: combat in the loop, T5-T8, T10 | `tools/sim.mjs` | - |

C1, C2 and C3 all touch `50-sim.js`: C1 merges first, C2 and C3 rebase on it.

---

## 11. Open questions for the owner

1. **Party tab:** keep the party inside the Fight tab and the stage (this spec), or merge Raid and Tavern into one "World" tab so Party gets its own tab?
2. **Wipe cost:** retreat one zone and auto-return when stronger (this spec), or only restart the current pack with no zone change?
3. **Auto-cast:** hero ability auto-casts at half rate while idle (this spec), or manual only so the button always means "you are playing"?
4. **Packs of 3 enemies** instead of one at a time. It gives AoE and tanks a job but changes how every fight looks. OK?
5. **One hero, four classes:** classes share the hero's level and gear (this spec, free switching), or each class keeps its own gear loadout (more to collect, more to manage)?
