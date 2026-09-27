# The Deepwell

Status: design spec D1 for the long-term vision (system 3), written 2026-09-27. It runs on
today's combat first and upgrades when party combat ([party-and-classes.md](party-and-classes.md)
Stage C) lands. It sits in the Camp ([camp.md](camp.md)). All numbers are starting values for
`tools/sim.mjs` to tune. The ratios and rules are the design.

Owner constraints this spec obeys: no prestige or resets, idle most of the time with active
moments, nothing pay-to-win, no gacha, playable on a 360px phone.

Design rules:

1. **Your main progress is never touched.** A run cannot cost gold, items, levels or time. While
   you are below, your party's normal farming is credited at the away rate.
2. **A run is short and always pays.** 8 to 15 minutes. Leaving or running out of Oil keeps
   everything you found.
3. **Choices, not luck, make a deep run.** 3 boons per draft, with rerolls and a Skip. Sets
   reward a plan. The weekly Trial gives everyone the same offers.
4. **Deepwell power stays in the Deepwell.** Boons end with the run. Deep Lore upgrades work only
   below. Depth Marks buy Deepwell upgrades, cosmetics, titles and the Deepwell's own Lore.
5. **Readable on a phone.** One Oil bar, one floor number, three cards.

---

## 1. Fantasy and loop

**Fantasy:** under Hollow's Rest there is an old well that goes down further than any rope. The
dark down there is thick. Your lantern burns Oil to push it back, and the deeper you go, the
stranger the light you find.

**A run (8 to 15 minutes, active):**

1. Enter from the Camp's Well or the Deepwell chip on the Fight tab. Pick **Normal run** or
   **This week's Trial**.
2. Clear a floor. Pick 1 of 3 boons, or Skip for Oil.
3. Every 5th floor a Deep Elder waits. Every 6th floor is a Quiet Landing with no fight.
4. The run ends when your Oil runs out, or when you tap **Climb out** between floors.
5. Collect Depth Marks. Spend them in the Deep Lore shop.

**Unlock:** zone 20 and Hearth 3 (about 1 hour in). Without the Camp merged, zone 20 alone. The
first run shows 3 one-line tips: the Oil bar, the draft, Climb out.

---

## 2. Runs and floors

### 2.1 Floor kinds

| Floor | Kind | Content | After it |
|---|---|---|---|
| 5, 10, 15, ... | **Boss** | 1 Deep Elder (a random type, HP x8) | Draft with at least 1 Epic |
| 3, 8, 13, ... | **Elite** | 1 elite foe (HP x3) and 1 normal foe | Draft with at least 1 Rare |
| 6, 12, 18, ... (not a boss floor) | **Quiet Landing** | No fight. Pick 1 of 3: **Refill** (+25s Oil), **Sharpen** (a random boon you own gains a rank), **Study** (a draft of Rare or better) | - |
| every other floor | **Normal** | 3 foes, one after another (today's single-foe combat) | Normal draft |

Foes use today's monster types, drawn per floor from the run's seed, with a cold "deep" palette
shift. The stage uses a new `well` theme (dark stone, hanging chains, pale blue motes).

### 2.2 Scaling

```
anchor  = S.maxZone when the run starts (stored in the run, never changes during it)
zEff(f) = max(1, anchor - 6 + 0.45 x (f - 1))
foeHp   = mobHp(zEff(f)) x (normal 1 | elite 3 | boss 8) x (0.9 to 1.1 from the seed)
```

- Floor 1 foes have about 12% of the HP of a foe at your max zone. Floor 14 is about par. Floor
  25 is about 5x par, floor 35 about 26x, floor 45 about 125x.
- Anchoring to your max zone makes every player's depth comparable, early or late, and keeps the
  mode fresh for months: a stronger account starts deeper in the numbers, not deeper in floors.

### 2.3 Oil (the run's health)

Today's combat has no party HP, so **Oil** is what a run spends.

| Rule | Value |
|---|---|
| Starting Oil | 60s, + `bonus('deepOil')` (Deep Lore up to +50s; the Deep Blessing +15s) |
| Max Oil | 120s (Deep Pockets: 150s) |
| Drain | 1 per second while foes are alive on a fight floor. Drafts and Landings do not drain |
| Clear refund | Normal +15s, Elite +22s, Boss +35s |
| Skip a draft | +8s |
| Out of Oil | The run ends: "Your lantern gutters. You climb back up with everything you found." |

Sanity maths: at the boss-ready threshold, a foe at your max zone dies in about 3.75s. Floor 14
(par) drains about 12.6s and refunds 15s, so you gain Oil. Floor 20 (+2.5 zones, 2.4x HP)
drains about 28s and refunds 15s, so you lose about 13s a floor. With no boons and no taps a run
ends around floor 22 to 24. Boons and taps push that to the 25 to 40 range (targets in 9).

### 2.4 Leaving

**Climb out** is on every draft and Landing screen. In-page confirm: "Climb out now? You keep 58
Depth Marks." Leaving mid-floor is not offered (it would dodge an Oil loss); closing the app
mid-floor is safe (section 6).

---

## 3. Boons

### 3.1 Draft rules

- After each fight floor: 3 offers, no duplicates. Boons at max rank are left out. Class boons
  appear only for your class. Role boons need a fielded companion of that role. **[C]** boons
  enter the pool when party combat (Stage C) is on.
- **Rarity weights:** Common 65, Rare 28, Epic 7 at floor 1. Every 5 floors: Common -5, Rare +3,
  Epic +2 (floor 30: 35 / 46 / 19). Elite drafts hold at least 1 Rare, boss drafts at least 1 Epic.
- **Class weight:** your class boons count x1.5, so a class plan is reachable.
- **Reroll:** 1 per run (Deep Lore: up to 4). It redraws all 3.
- **Banish** (Deep Lore): remove 1 offered boon from the pool for this run, 1 or 2 per run.
- **Skip:** take +8s Oil instead of a boon. Always there.
- **Ranks:** a boon marked x2 or x3 can be taken again to rank up. The card shows "II to III".

### 3.2 Sets

Every boon has 0 to 2 set tags. Holding **3 different boons of one set** switches on that set's
bonus for the rest of the run. The draft card shows "Crit 2/3" on tags you are building.

| Set | Bonus at 3 |
|---|---|
| Flame | **Bonfire:** +20% damage |
| Oil | **Deep Breath:** Oil does not drain for the first 4s of each floor |
| Crit | **Starburst:** crits strike again for 30% |
| Tap | **Drumbeat:** every 25th tap hits for 15x your attack |
| Company | **Shoulder to Shoulder:** companions +2% damage per floor cleared this run (max +60%) |
| Path (your class boons) | **True Path:** your class ability cooldown halves |
| Guard [C] | **Iron Line:** tanks take 25% less damage |
| Mend [C] | **Deep Mercy:** all healing +30% |

### 3.3 The boon list (46)

Wiring: `mod` = an `addModifier` key gated on `deepActive()`. `tune` = `bonus('tune:<knob>')`,
read by `55-party.js` (the same hook Constellations uses). `run` = rule code in the run engine.

**Common (14)**

| Id | Boon | Sets | Ranks | Effect | Wiring |
|---|---|---|---|---|---|
| `whet` | Whetstone | Flame | x3 | +12% damage | mod `dmg` |
| `luck` | Lucky Break | Crit | x3 | Crits come 20% more often | mod `crit` |
| `heavy` | Heavy Hand | Tap | x3 | Taps deal +40% | mod `tap` |
| `warm` | Warm Oil | Oil | x3 | +15s Oil now; clears refund +2s | run |
| `steady` | Steady Flame | Oil | x2 | Oil drains 10% slower | run |
| `drill` | Company Drill | Company | x3 | Companions deal +15% | mod `party` |
| `sharp` | Sharp Eye | Crit | x3 | Crit damage +20% | mod `critDmg` |
| `first` | First Strike | Flame | x1 | The first foe on each floor starts at half health | run |
| `map` | Bounty Map | - | x1 | +1 Depth Mark per floor from now on | run |
| `study` | Quick Study | - | x1 | +1 reroll now | run |
| `kindle` | Kindling | Path (Lanternmage) | x2 | Ember cap +2 | tune `embersMax` |
| `shield` | Shield Drill | Path (Warden) | x2 | Guard stack cap +2 | tune `guardMax` |
| `fletch` | Fletching | Path (Ranger) | x2 | Focus lasts +4s | tune `markT` |
| `psalm` | Psalm | Path (Lightkeeper) | x2 | Blessing cap +1 | tune `blessMax` |

**Rare (13)**

| Id | Boon | Sets | Ranks | Effect | Wiring |
|---|---|---|---|---|---|
| `heart` | Ember Heart | Flame | x1 | Every 3 floors cleared, +8% damage for the rest of the run | mod `dmg`, run counter |
| `flow` | Overflow | Flame | x1 | Overkill damage carries to the next foe on the floor | run |
| `exec` | Executioner | Crit | x1 | Foes below 15% health die at once | run (strike check) |
| `sconce` | Oil Sconce | Oil | x2 | Boss floors refund +15s more | run |
| `twin` | Twin Flame | Path (any class) | x2 | Ability cooldown -15% | mod `abilityCd` |
| `rhythm` | Tap Rhythm | Tap | x1 | Taps less than 0.4s apart build a combo: +5% tap damage per step, up to +60% | run |
| `cascade` | Crit Cascade | Crit, Oil | x1 | Each crit gives back 0.2s Oil (max 3s a floor) | run |
| `glass` | Cracked Lantern | Flame | x1 | +45% damage, but clears refund 4s less | mod `dmg`, run |
| `ration` | Field Rations | Company | x2 | Companions +25% on elite and boss floors | mod `party` |
| `focus` | Hunter's Focus | Path (Ranger) | x1 | Marked foes take +50% from everyone (was +25%) | tune `mark` |
| `double` | Double Ember | Path (Lanternmage) | x1 | Each tap plants 2 Embers | tune `emberPerTap` |
| `bulwark` | Bulwark | Path (Warden) | x1 | Each guard stack gives +5% (was +3%) | tune `guard` |
| `choir` | Choir | Path (Lightkeeper) | x1 | Blessings last 10s (was 6s) | tune `blessT` |

**Epic (10)**

| Id | Boon | Sets | Effect | Wiring |
|---|---|---|---|---|
| `twice` | Kindle Twice | Path (Lanternmage) | Lantern Flare leaves its Embers in place, once per floor | tune flag |
| `wallnight` | Wall of Night | Path (Warden), Oil | Shield Wall also stops Oil drain for 6s | run |
| `storm` | Arrow Storm | Path (Ranger) | Volley fires 20 arrows (was 10) | tune `volleyHits` |
| `hymn` | Endless Hymn | Path (Lightkeeper) | Rally Hymn lasts until the floor is cleared | tune flag |
| `lheart` | Lantern Heart | - | Your ability holds 2 charges | tune `charges` |
| `pact` | Deep Pact | Flame | Damage x1.5; max Oil halves | mod `dmg`, run |
| `relight` | Quick Relight | Oil | Floors cleared in under 6s refund double | run |
| `crown` | Crown of the Deep | - | Each boss floor cleared gives a free Rare boon (your pick of 3) | run |
| `mass` | Critical Mass | Crit | Crits come 50% more often and deal +50% | mod `crit`, `critDmg` |
| `warband` | Warband | Company | Companions deal +60% | mod `party` |

**Stage C boons [C] (9)**, in the pool once party combat is on:

| Id | Boon | Rarity | Sets | Effect |
|---|---|---|---|---|
| `thorn` | Thorn Plate | Rare | Guard | Your tanks reflect 30% of damage taken |
| `iron` | Iron Wall | Common x3 | Guard | Tanks +20% max HP |
| `taunt` | Taunt Drill | Common | Guard | Tank and Warden taps taunt for 2s |
| `dward` | Deep Ward | Rare | Mend | Overhealing becomes a shield, up to 20% max HP |
| `mend` | Mending Light | Common x2 | Mend | The party heals 10% max HP per floor cleared |
| `life` | Lifeline | Epic | Mend | Once per floor, a member who would go down stays at 1 HP |
| `wild` | Wildfire | Epic | Flame (caster) | Burns and Embers jump to a new foe when their foe dies |
| `duel` | Duelist | Rare | Crit (striker) | Each striker's first hit on a foe always crits |
| `parry` | Quick Parry | Rare | - | The parry window is 0.4s longer |

Synergy examples the sets and tags are built for:

- **Ember battery** (Lanternmage): Kindling, Double Ember, Kindle Twice, Twin Flame. Path x3
  halves Flare's cooldown. Flare every few seconds with 9 Embers.
- **Drumline** (any class, active): Heavy Hand, Tap Rhythm, Lucky Break with Crit Cascade. Tap x3
  plus crits that refill Oil. The best active build, weak idle.
- **Warband** (Lightkeeper or any idle player): Company Drill, Field Rations, Warband. Company x3
  grows every floor. The best build for auto-play.
- **Oil miser**: Warm Oil, Steady Flame, Quick Relight, Oil Sconce. Slow kills that never run dry.

---

## 4. Depth Marks

### 4.1 Earning

| Source | Marks |
|---|---|
| Each floor cleared | 1 (floors 1-10), 2 (11-25), 3 (26+) |
| Each boss floor cleared | +5 |
| New personal best | +3 for each floor past your old best (once) |
| Bounty Map boon | +1 per floor |
| Weekly Trial, first time this week at floor 10 / 20 / 30 / 40 | +20 / +30 / +40 / +50 |
| Almanac board goals (almanac.md) | 20 to 40 each |
| Deep Tide Omen | x1.5 on run marks that day |

A median run to floor 25 pays about 10 + 30 + 25 = 65 marks.

### 4.2 The Deep Lore shop

**Deep Lore** (upgrades for the Deepwell only; off in the Trial):

| Upgrade | Effect | Ranks and prices |
|---|---|---|
| Deep Breath | +10s starting Oil | 5: 50, 100, 200, 350, 500 |
| Spare Wick | +1 reroll per run | 3: 80, 240, 600 |
| Banish | Banish 1 offered boon per run | 2: 150, 450 |
| Wider Choice | Boss-floor drafts show 4 boons | 1: 800 |
| Favourite | Start each run with a Common boon of your choice (rank 2: a Rare) | 2: 500, 1500 |
| Lantern Stair | Start at floor 6 (rank 2: floor 11). Skipped floors pay their marks, and you pick 1 (2) Common boons at the start | 2: 300, 900 |
| Deep Pockets | Max Oil 150s | 1: 600 |

Deep Lore total: 7,320 marks.

**Cosmetics and titles** (no power):

| Item | Count | Price each |
|---|---|---|
| Lantern colours (the hero's light on the stage: Deep Blue, Ghost Green, Ember Red, Moon White, Violet, Gold) | 6 | 150 |
| Camp decorations (Deep Crystals, Glow Moss, Well Lanterns, the Elder's Skull, Chain Arch, Blue Brazier, Rope Bridge, Drowned Bell) | 8 | 200 to 400 |
| Hero trails on the stage (Motes, Embers, Frost) | 3 | 600 |
| Titles: Well-walker 100, Oil-sipper 150, Deep Diver 250, Lightless 400, Keeper of the Well 500, the Bottomless 800 (also needs floor 50) | 6 | 100 to 800 |

**Deep Lore pages** (the Deepwell's own Codex page; the only Codex entries that can be bought):
10 pages, 100 marks each, bought in order. They tell who dug the well and why it glows.

Whole shop: about 14,900 marks. At 3 to 6 runs a week plus the Trial and board, that is 25 to 40
weeks: a months-long horizon, with the useful Deep Lore done in 10 to 20 weeks.

---

## 5. The weekly Trial

- **Week:** `deviceWeek()` (weeks start Monday, device date, like the Tavern visitor).
- **Seeded:** the week number seeds the floor foes and every boon offer. Offers depend only on
  the week, the floor and how many rerolls you used on it, so the same choices meet the same
  offers. Choices, not luck, decide.
- **Fair:** Deep Lore upgrades are off. The anchor is still your max zone (2.2).
- **One rule a week,** from a bag of 12, shuffled per 12-week cycle so none repeats within 12
  weeks:

| Rule | Effect |
|---|---|
| Glass Week | Damage x2; max Oil 60s |
| Company Week | Your hero deals no damage; companions x2 |
| Drum Week | Taps x3; auto-attacks x0.5 |
| Boss Rush | Every 3rd floor is a boss floor |
| Rare Air | Drafts show 2 boons, both Rare or better |
| Drought | Refunds halved; start with 150s Oil |
| Crit Week | Crits come twice as often; non-crits deal half |
| Short Wick | No rerolls; drafts show 4 |
| Elder Hall | An elite floor every other floor; elite drafts hold an Epic |
| Pathfinder | Class boons appear twice as often |
| Steep Week | Foes gain 0.55 zones per floor (was 0.45); marks x1.5 |
| One of Each | At most one boon of each set |

- **Attempts:** unlimited. Your best floor this week is kept, plus a history of weekly bests.
- **Trial Seals:** a week with a best of floor 15 or deeper earns a Seal (Codex, 1 Lantern Light
  each, up to 52). Missing a week costs nothing.
- **Leaderboard:** none for now. The online layer is frozen. A light board could later read the
  Trial best (see question 3).

---

## 6. Run save and resume

- The run lives in `S.deep.run`. It is saved at the start of each floor and after each pick.
- **Closing mid-floor:** on resume the floor restarts with full foes and the Oil it had when the
  floor began. That is the same Oil you would have had, so there is nothing to exploit.
- **Runs do not move while the game is closed.** A saved run waits indefinitely.
- A **Trial run from an earlier week** is scored on resume ("That Trial has closed. Your run was
  scored.") and its marks are paid.
- **Abandon** (in-page confirm) ends the run and pays its marks.

---

## 7. Your main progress while you are below

- Starting a run pauses the normal Fight, Gather or World activity on the stage.
  `S.activity` does not change.
- The real seconds spent in the well are credited when you climb out (or on the next load, if
  the app closed during a run) as `awayGains(seconds)`: the normal away rate and cap.
- A small card shows it: "While you were below: +4.2M gold, +31 Glowing Essence."
- So a run costs nothing. It pays Depth Marks on top of your normal idle income.

---

## 8. Combat: today and after Stage C

### 8.1 Today (single foes, no party HP)

A small **arena** hook in `50-sim.js` lets the Deepwell supply the foes:

```js
let arena = null;              // set by 55-deepwell.js while a run is active
// spawn():  if (arena) { mob = arena.spawn(); return; }
// kill():   if (arena) { mob.hp = 0; mob.dead = 0.001; arena.onKill(mob); respawn = 0.45; return; }
// tick():   if (arena) arena.tick(dt);   // Oil drain; the boss timer is skipped while an arena is set
// auto boss challenge is off while an arena is set
```

- Arena kills emit `deepKill`, not `kill`, so gold, zone mastery, bestiary, bounties and
  achievements do not move. Taps, crits and abilities work as today.
- Class taps and abilities come from `55-party.js`. Boons change them through `tune:` bonuses.
- The stage draws `mob` as it does now, with the `well` theme (added as `THEMES.well` from the
  Deepwell data file, not in `20-data.js`).

### 8.2 After Stage C (party combat)

| Change | Rule |
|---|---|
| Floors | Packs of 3 with today's zone behaviours (dives, armour, spore clouds, healers), picked per floor from the seed |
| Party HP | Carries between floors. Each clear heals 25% max HP. Quiet Landings heal 60% |
| Wipe | Ends the run, the same as running out of Oil |
| Oil | Stays, with refunds +5s higher. Now HP and Oil are both run health |
| Bosses | Deep Elders use their Elder telegraphs. A parry refunds 2s of Oil |
| Boons | The 9 [C] boons join the pool; Guard and Mend sets switch on |
| Anchor | `partyHoldEstimate()`'s best zone replaces `S.maxZone` |

---

## 9. UI on a 360px phone

**Entry sheet** (Well card or the Fight-tab chip "Deepwell: best floor 27"):

```
THE DEEPWELL                               Marks 412
[ Normal run ]  Best: floor 27
[ This week's Trial: Drum Week ]  Best this week: 18   Taps x3, auto-attacks x0.5
[ Deep Lore shop ]
(Resume run: floor 14, Oil 48s)   <- replaces the two run buttons while a run is saved
```

**In a run** (overlay on the stage):

- Top-left: a lantern icon and the Oil bar (120 x 10px, amber, red under 15s), with "48s".
- Top-centre: "Floor 17". Climb out appears only between floors (on the draft and Landing).
- Bottom: the boons strip, 16px icons, up to 10 then "+4". Tap it for the full list with ranks
  and set progress.

**Draft** (bottom sheet, 328px):

```
Floor 17 cleared. +15s Oil                          Oil 61s
[card 104x156] [card 104x156] [card 104x156]         3 x 104 + 2 x 8 = 328
[ Reroll (1) ]   [ Skip: +8s Oil ]   [ Climb out ]
```

Each card: a rarity frame (Common stone, Rare blue, Epic violet), a 32px icon, the name, "II to
III" if it ranks up, the effect in 2 to 3 lines at 12px, and set tags with progress ("Crit 2/3").
Tap a card to pick it. Banish is a small x in the card's corner when owned. Buttons are 44px tall.

**Run end:** floor reached, your best, the marks as lines (floors, bosses, new best), and three
buttons: Go again, Deep Lore shop, Back to camp.

**Reduced motion:** cards appear without a flip, no shake on boss floors, the Oil bar changes
without a pulse.

---

## 10. Save state

```js
registerState('deep', {
  v: 1,
  best: 0,                 // best floor, normal runs
  marks: 0, marksTotal: 0,
  lore: {},                // Deep Lore upgrade id -> rank
  cos: {},                 // cosmetic and title id -> true (the Codex shows and equips titles)
  pages: 0,                // Deep Lore pages bought (0-10)
  trial: { week: -1, best: 0, paid: {}, hist: {} },    // paid: milestone floors paid this week; hist: week -> best floor
  seen: {},                // boon id -> times picked (Codex)
  runs: 0,
  run: null                // { trial, week, seed, anchor, floor, kind, oil, oilAtStart, boons: {id: rank},
                           //   offer: [ids] | null, rr, ban, marks, secs, landing: null | [ids] }
});
```

- New field only. `check.mjs`: fixtures load with `run: null`; a saved mid-floor run resumes at
  the same floor with `oil === oilAtStart`.

---

## 11. Balance targets (tools/sim.mjs)

New flag `--deep N`: after the normal timeline, run N seeded runs. Pickers: `greedy` (highest
estimated value, builds toward a set), `random`, and `--active` taps as in the party sim.

| # | Target | Pass band |
|---|---|---|
| D1 | Deepwell unlock | 50 to 90 min |
| D2 | Median run length | 8 to 15 min |
| D3 | Median depth: idle auto-play, greedy picks / active, greedy / best of 20 active | 18-25 / 28-38 / 40-50 |
| D4 | Class spread of median depth | within 0.85 to 1.15 of the median |
| D5 | Greedy vs random picks | greedy 20 to 40% deeper |
| D6 | Marks per median run | 50 to 80 |
| D7 | Deep Lore complete, 3 to 6 runs a week | 10 to 20 weeks; whole shop 6 to 12 months |
| D8 | Full Deep Lore vs none, same anchor | 15 to 25% deeper |
| D9 | Away credit while below vs `awayGains` for the same seconds | exact |
| D10 | Mid-floor resume | same floor, same Oil, same boons |
| D11 | Each of the 4 synergy builds in 3.3 beats random picks | yes, for its class |

---

## 12. Build plan

The vision places the Deepwell in wave 5. Because it runs on today's combat, I recommend
**wave 3** (camp.md, note N10), with W6 in wave 5 after Stage C.

| Wave | Task | Owns | Small edits in | Depends on |
|---|---|---|---|---|
| 3 | W1 Data: floor rules, 46 boons, sets, Trial rules, the shop, `THEMES.well` | `src/js/24-data-deep.js` (core, data only) | - | - |
| 3 | W2 Core: state, run engine (floors, Oil, seeded offers, drafts, rerolls, banish, Landings), boon wiring, sets, marks, shop, Trial, save and resume, away credit | `src/js/55-deepwell.js` | `src/js/50-sim.js` (arena hook, about 10 lines); `src/js/55-party.js` (read `tune:` bonuses and `mod('abilityCd')`, with the A1 owner; shared with Constellations) | B0 (camp.md) |
| 3 | W3 UI: entry sheet, HUD, draft, run end, shop | `src/js/75-deepwell.js`, `src/styles/60-deepwell.css` | `src/js/62-stage.js` (hide the zone name while an arena is set) | W2 |
| 3 | W4 Art and writing: 46 boon icons (8x8), deep palette shift, 8 decorations, 3 trails, 10 Lore pages | `src/js/14c-art-deep.js`, `src/js/24b-deep-text.js` | `src/js/10-art.js` (ICON entries) | - |
| 3 | W5 Sim: `--deep`, pickers, D1-D11 | `tools/sim.mjs` | - | W2 |
| 5 | W6 Stage C upgrade: packs, HP carry, wipes, Elder telegraphs, [C] boons, hold-estimate anchor | `src/js/59c-deepwell-combat.js` | - (uses C1 and C2 hooks) | C1, C2, C3 |

---

## 13. Open questions for the owner

1. **Your farm keeps running while you are below,** at the away rate. So the mode never costs
   progress, and a player never has to choose between idle income and fun. Recommended: **yes**.
2. **Deep Lore power stays in the Deepwell** and is off in the Trial. Depth Marks never buy main-
   game power. Recommended: **yes**. It keeps the mode a lab, not a second grind for damage.
3. **The Trial is personal-best only for now.** A light leaderboard would need a new online doc
   shape (coordinator sign-off). Recommended: **personal best now**, revisit with the Phase 2
   online interface.

---

## 14. Build notes (W1-W3, 2026-09-27)

Built in `src/js/57d-deepwell.js` (data, core, no DOM), `src/js/75-deepwell-ui.js` and
`src/styles/60-deepwell.css`. Changes from the spec above, and why:

- **Scaling anchor.** Foe HP is `par x 1.45^(-6 + 0.7 x (floor - 1))`, where `par` is a foe your
  party kills in 3.75s at the start of the run (`(heroDps() + compDps()) x 3.75`). Anchoring on
  `S.maxZone` made depth depend on how far a save sits above its frontier (the late fixture kills
  a max-zone foe in 0.5s and went 60 floors). The step is 0.7 zones a floor (spec 0.45): at 0.45
  runs went 45-50 floors and took 15-22 minutes. Steep Week uses 0.85.
- **Where the run lives.** The Fight tab's Deepwell view (not the Camp's Well). While a run is
  live, `S.activity` is `'fight'` and your own activity waits in `run.act`; it comes back when you
  climb out, when the run pauses, and inside every away phase.
- **Reloads.** A saved run is paused on load (the normal game plays on) and waits for Resume, which
  restarts the floor with the Oil it began with. Seconds already spent below are added to the
  load's away time.
- **The Trial is fixed for everyone:** Deep Lore, the Camp and Codex Oil bonuses and the Almanac's
  Deepwell Omens are all off in it.
- **Cosmetics** are stored (`S.deep.cos`, `S.deep.eq`) and shown in the Codex Wardrobe; the stage
  and the camp scene do not draw them yet. Titles are picked in the Codex.

Balance (`tools/sim`-style harness on `save-v2-late.json`, auto-play, drafts counted at 6s each):

| Case | Median floor | Minutes | Marks (no new best) |
|---|---|---|---|
| Idle, greedy picks (4 classes) | 27-29 | 8.7-10.9 | 71-77 |
| Idle, random picks | 19-25 | 8.1-9.3 | 53-75 |
| Active, 3 taps a second, greedy | 29-32 | 9.5-12.2 | - |
| Full Deep Lore (no Stair), greedy | 28-29 | 9.9-11.4 | 74-77 |
| This week's Trial (Rare Air) | 22-24 | 7.1-9.5 | 108 (with the 10/20 milestones) |

Marks: about 75 a run, so 3-6 runs a week plus the Trial (50) and Almanac goals make 300-550 a
week: Deep Lore (7,320) in 13-24 weeks, the whole shop (15,470) in 28-52 weeks. Open: D8 (Deep
Lore 15-25% deeper) is not met; Oil is rarely what ends a run (the boss floors at 25 and 30 are),
so Oil upgrades add about 1 floor. Rerolls, Banish, Favourite and the Stair help players who plan
sets, which the harness picker does not. A later balance pass could give Deep Breath a small drain
cut or add a below-only damage Lore.
