# Stage A build plan (coordinator)

Stage A delivers:

- class choice (new game, plus a one-time choice for existing saves)
- hero abilities and class taps
- the visible party in formation
- the Party tab and the World tab
- the new Hi-bit art for heroes, companions, enemies and scenery

This file overrides the build plan in `party-and-classes.md` section 10 where they differ. The differences come from later owner decisions:

- Hi-bit art: `art-direction.md` and `prototypes/characters.html`.
- The support class is the **Lightkeeper** (key `lightkeeper`).

Combat rules stay as they are today (monsters don't attack) until Stage C. Stage A makes the party visible and gives classes their identity inside the current combat.

## Waves

| Wave | Task | Agent owns | Small edits allowed in |
|---|---|---|---|
| 1 | **A1 Classes core** | `src/js/55-party.js`, `tools/sim.mjs` (`--class`, `--active`) | `src/js/50-sim.js`: route the stage tap to `classTap()` |
| 1 | **A2 Character art pipeline** | `src/js/12-art-rigs.js` (data), `src/js/60b-baker.js` (canvas) | none |
| 1 | **A4 UI shell** | `src/js/75-party.js`, `src/js/76-create.js`, `src/styles/60-party.css` | `src/js/70-ui.js` (tab list), `src/js/74-ui-raid.js`, `src/js/74-ui-tavern.js`, `src/shell.html` (tab buttons) |
| 1 | **A6 Scenery** | `src/js/63-scenery.js` | none |
| 1 | **A7 Enemy and node art** | `src/js/13-art-enemies.js` (data), `prototypes/enemies.html` (preview) | none |
| 2 | **A3 Stage integration** | `src/js/61-anim.js`, `src/js/62-stage.js` | `src/styles/20-stage.css` |

After each wave the coordinator merges, runs build, check and sim, browser-tests a new game and the fixture saves, then publishes.

## Rules for every agent

- Read `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/design/party-and-classes.md` (sections 2, 4.6, 7) and `docs/design/art-direction.md`.
- Files numbered below 60 are loaded into Node by `tools/lib/core.mjs`. They must not touch `document`, `window` or canvas at load time. Data-only art files (12, 13) are plain arrays and objects, which is fine.
- All JS shares one scope. Wrap your file in `{ ... }` and expose only the names in this contract, or use a distinctive prefix.
- Save compatibility: add state only with `registerState`. Never rename existing fields. `tests/fixtures/save-v2.json` and `save-mid-v2.json` must keep loading.
- Before finishing, run `node tools/build.mjs && node tools/check.mjs`. Commit on your branch with a message ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Do not merge, push or publish.
- Keep the look consistent with `prototypes/characters.html` (the owner approved it): proportions of 6.5 to 7 heads, 4-tone hue-shifted ramps, selective outline, smooth lighting on top.

## Contracts

### State (A1)

```js
registerState('party', {
  v: 1,            // party system version
  cls: null,       // 'warden' | 'lanternmage' | 'ranger' | 'lightkeeper'
  chosen: false,   // false => show "Choose your path" (existing saves) or creation (new games)
  newGame: false,  // true when the save was created after this update
  field: [],       // up to 3 companion character keys shown on stage, in slot order
  cells: {},       // key -> { col: 0 back | 1 mid | 2 front, lane: 0 | 1 }; 'hero' included
  abilityCd: 0, autoCast: true, mirrors: 0
});
```

### Companion characters and the old companion slots (A1 owns the map; A2 draws them)

Old `S.comp` index to character key:

| Index | Old companion | Character key |
|---|---|---|
| 0 | Squire | `tobin` |
| 1 | Archer | `wren` |
| 2 | Hedge Mage | `pip` |
| 3 | Knight | `aldric` |
| 4 | Dragoon | `kestrel` |
| 5 | Starcaller | `oriel` |
| 6 | Lantern Saint | `elowen` |

- **Existing saves:** field the 3 highest owned slots, ordered by base power.
- **New games:** at creation, grant the class starter as a free unit in its old slot, so today's DPS maths keeps working.

| Class | Starter | Slot |
|---|---|---|
| Warden | Wren | 1 |
| Lanternmage | Tobin | 0 |
| Ranger | Tobin | 0 |
| Lightkeeper | Bram | Tobin's slot 0 for maths; drawn as `bram` |

Store the starter key in `S.party.field`.

### Class data and actions (A1)

- `HERO_CLASSES[key]` holds:
  - `name`, `role`, `row`, `pitch`, `how`, `tapName`
  - `ability: { name, desc, cd }`
  - `aura` (text)
- `chooseClass(key, heroName?)` emits `classChosen { cls }`.
- `castAbility()` returns true if cast, and emits `ability { cls, name }`. Auto-cast runs at double cooldown from zone 10 when `autoCast` is on.
- `classTap({ target: 'mob' | 'node' | 'world' })` emits `classTap { cls, kind }`.
- Stage A interim effects, since monsters don't attack yet:

  | Class | Tap | Ability |
  |---|---|---|
  | Warden | Heavy hit plus a guard stack: +2% damage for 10s, up to 5 stacks | Shield Wall: party damage +30% for 6s, and the boss timer pauses for 3s |
  | Lanternmage | Plants an Ember on the mob (up to 5) | Lantern Flare: burst of 20x attack, +30% per Ember, detonates Embers |
  | Ranger | Focus mark: the marked mob takes +25% from hero and party for 8s; crit chance up | Volley: 10 hits of 1.5x attack, then party attack speed +50% for 8s |
  | Lightkeeper | Blessing: party DPS +10% for 6s, stacking to 3 | Rally Hymn: party damage +40% for 8s |

  - Lightkeeper damage is x0.2 overall; the party budget goes into buffs. Everything is applied through `addModifier`.
- Auto-play: after 4s without a tap, auto-tap in class style about once every 2s, at 50% effectiveness.
- Mirror of Embers:
  - Drops at 2% from zone bosses from zone 36; stored in `S.party.mirrors`.
  - `useMirror()` reopens class choice.
  - `emit('toast')` on drop.

### Art pipeline (A2): port from `prototypes/characters.html`

- **Data: `12-art-rigs.js`**
  - Material ramps, the families `FAM`, and body parts per class.
  - Gear item visuals per class slot: `weapon`, `off`, `head`, `body`, `charm`.
  - Companion outfits for `tobin`, `wren`, `pip`, `aldric`, `kestrel`, `oriel`, `elowen`, `bram`, `hesketh`, following their sprite briefs in `party-and-classes.md` 3.2.
  - Part format as in the prototype: `[z, bone, mat, shape, minRarity]`.
- **Baker: `60b-baker.js`**
  - `charFrames(spec) -> { idle0, idle1, wind, strike, hit, down }`
    - Each frame is `{ c: canvas, ox, oy, lights: [{x, y, rgb, pulse, size}] }`, with feet at `(ox, oy)` in art px.
    - Frames are cached by a spec hash.
  - `heroSpec()` builds the hero from state (`S.party.cls`, `S.equip`):

    | Old slot | New visual |
    |---|---|
    | `weapon` | the class weapon, tier = item.t, rarity index from item.r (common 0, uncommon 1, rare 1, epic 2, legendary 3) |
    | `helm` | the class head item |
    | `charm` | charm |

    - Off-hand: the class default at tier 1 Common.
    - Body: base class outfit (body armour arrives with crafting).
    - Uniques draw at Legendary.
  - `companionSpec(key)` builds a companion.
  - `portraitURL(key | 'hero')` returns a head-and-shoulders data URL for UI cards.
  - `drawCharPreview(canvas, spec, zoom)` is for the creation screen.
  - Also covers enemies and gather nodes from A7's data: `enemyFrames(key, variant)`.

### Enemy and node art (A7)

- **Data: `13-art-enemies.js`**, in the same part format.
- **Monster types:** the 7 existing types (`slime`, `bat`, `bones`, `beetle`, `spore`, `golem`, `wraith`), redrawn in the new proportions and mood.
- **Bosses:** an `elder` variant flag (bigger, crowned, with extra parts), and the world boss `wyrm`, whose palette is recoloured per raid generation.
- **Gather nodes:** `node:ore` and `node:wood`, whose material colour comes from the tier.
- **Poses:** `idle0`, `idle1`, `wind`, `strike` as numeric pose objects.
- **Preview:** verify in `prototypes/enemies.html`, which can copy the prototype baker. Only the data file ships.

### Scenery (A6)

- `sceneFor(theme, W, H, hue) -> { layers: [{ c, f }], fog, amb, light }`
  - `W` and `H` are CSS px.
  - Layers are pre-rendered at 1 art px per CSS px.
  - `f` is the parallax factor.
- `drawScene(ctx, scene, camX)` draws the layers.
- `drawAtmosphere(ctx, scene, T, W, H)` draws smooth fog bands, ambient particles and the vignette at device resolution.
- Themes:
  - Zones: `forest`, `cave`, `bone`, `barrow`, `fungal`, `quarry`, `marsh`, using today's zone themes redrawn in Hi-bit.
  - Other: `mine`, `woods`, `raid`.
- The zone cycle hue shift is kept.

### Stage (A3, wave 2)

- **Scale:** the stage renders at 1 art px per CSS px, with device-resolution lighting on top. Stage height is about 250px.
- **Formation:** hero and companions sit in the 3x2 formation from spec 7.4, scaled to the new sprite size. Enemies sit on the right.
- **Ability button:** round, on the stage, with a cooldown sweep.
- **Kept from today:**
  - all current event hooks (`float`, `burst`, `shake`, `lunge`, and so on)
  - tap to strike or work, now through `classTap`
  - gathering scenes and the raid scene
- **Motion:** respects reduced motion.
