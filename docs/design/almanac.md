# The Almanac: daily Omens and the weekly board

Status: design spec D1 for the long-term vision (system 4), written 2026-09-27. It touches most
other systems through modifier keys, so each Omen switches on only when the system it needs is
in the game. All numbers are starting values for `tools/sim.mjs` to tune.

Owner constraints this spec obeys: no prestige or resets, single-player first, idle with active
moments, no streaks, no fear of missing out on power, playable on a 360px phone.

Design rules:

1. **Never a net loss.** An Omen only adds. Any twist is an opt-in **Dare** that the player
   accepts for a bigger reward and can drop at any time.
2. **It changes what is best today, not whether you play.** A missed Omen comes back within 35
   days. Missing a day costs nothing but that day's bonus.
3. **No surprises that sting.** Tomorrow's Omen is always shown. The Tavern's Rumours (camp.md)
   show two days ahead.
4. **The weekly board is relaxed.** 5 goals that normal play finishes in a few sessions.
   Unfinished goals simply end with the week. No streaks, nothing to keep alive.
5. **No new currency.** The board pays materials, Depth Marks, Renown and Trophies.

---

## 1. Dates

Both use the shared helpers from camp.md's B0 (the same epoch as the Tavern visitor):

- `deviceDay(ms = Date.now())`: local calendar date as whole days since 2026-01-01. Computed from
  the local year, month and day (`Date.UTC(y, m, d)`), so daylight-saving shifts never make a day
  23 or 25 hours long.
- `deviceWeek(ms)`: `floor((deviceDay(ms) + 3) / 7)`. 2026-01-01 is a Thursday, so weeks start on
  Monday.

Changing the phone clock only changes the player's own single-player game (owner decision round 5
for the Tavern). It is accepted here too.

---

## 2. Daily Omens

### 2.1 The schedule

```
N     = 35 (the Omen list)
cycle = floor(day / N), pos = day % N
bag   = shuffle(OMEN_IDS, seed = cycle x 7919 + 17)
        then a fix pass: if bag[i] has the same category as bag[i-1], swap it with the next
        entry of a different category
omen(day) = bag[pos], unless this save cannot use it (section 2.3); then the fallback
            FALLBACK[day % 5] = Gold Rain, Swift Hands, Scholar's Sky, Long Night, Keen Winds
```

- Every Omen appears once per 35-day cycle. No two days in a row share a category.
- The seed is the same for everyone, so friends see the same Omen on the same date.
- An Omen lasts from local midnight to midnight.
- **While away,** the Omen of the day you left covers the whole away period
  (`deviceDay(S.last)`). It is simple to explain, and it lets a player go to bed on a good
  Omen.

### 2.2 The Omen list (35)

Wiring: a key in `mod` is an `addModifier` returning the value while the Omen is active; a key in
`bonus` is an `addBonus`. "Needs" is the system that must be in the game for the Omen to be
used; before that, the fallback plays.

| # | Omen | Category | Effect | Wiring | Needs | Dare (opt-in) |
|---|---|---|---|---|---|---|
| 1 | Quiet Woods | Gather | +50% Wood | mod `yield:wood` 1.5 | - | - |
| 2 | Deep Veins | Gather | +50% Ore | mod `yield:ore` 1.5 | - | - |
| 3 | Crystal Night | Gather | +50% Crystal | mod `yield:crystal` 1.5 | K5 | - |
| 4 | Bloom Day | Gather | +50% Herbs and Fibre | mod `yield:herb`, `yield:fibre` 1.5 | K5 | - |
| 5 | Swift Hands | Gather | Gathering 30% faster | mod `gatherSpeed` 1.3 | - | - |
| 6 | Glint Hour | Gather | Glints appear twice as often | bonus `glintRate` 1 | K5 | - |
| 7 | Apprentice Day | Gather | Gathering skills earn +50% XP | mod `skillXp:mine`, `:wood`, `:forage` 1.5 | - | - |
| 8 | Gold Rain | Fight | +30% gold | mod `gold` 1.3 | - | **Gold Fever:** foes +30% HP, gold +80% instead |
| 9 | Wraith Tide | Fight | Wraithmarsh zones drop triple essence | mod `essence` 3 while `zoneType(S.zone) === 6` | zone 7 | - |
| 10 | Hunter's Moon | Fight | Signature drops twice as often | mod `sigDrop` 2 | K5 | - |
| 11 | Champion's Day | Fight | Champions appear 3x as often | mod `champion` 3 | K5 | **Big Game:** champions have x2 HP and drop 2 Trophies |
| 12 | Blood Moon | Fight | Zone bosses drop double Trophies | mod `trophy` 2 | K5 | **Red Sky:** bosses +50% HP, Trophies x3 |
| 13 | Lucky Star | Fight | Zone bosses drop uniques 50% more often | mod `uniqueChance` 1.5 | - | - |
| 14 | Keen Winds | Fight | Crits come 20% more often | mod `crit` 1.2 | - | **Knife Edge:** non-crits deal 25% less, crits deal +60% |
| 15 | Scholar's Sky | Fight | Hero XP +50% | mod `xp` 1.5 | - | **Hard Lessons:** foes +25% HP, hero XP x2.5 |
| 16 | Company Feast | Fight | Companions earn +50% XP | mod `compXp` 1.5 | B1 | - |
| 17 | Bestiary Day | Fight | Kills count double toward bestiary pages | bonus `bestiaryMult` 1 | - | - |
| 18 | Mastery Day | Fight | Kills count double toward zone mastery | bonus `masteryMult` 1 | - | - |
| 19 | Boss Hunt | Fight | +25% damage to bosses | mod `bossDmg` 1.25 | - | **Short Fuse:** boss timer -10s, unique drop chance x2 |
| 20 | Hot Forge | Craft | Crafting skills earn +50% XP | mod `skillXp:smith`, `:bench`, `:loom`, `:ench` 1.5 | - | - |
| 21 | Steady Hands | Craft | Rare and Epic craft odds +50% | mod `rareW` 1.5 (K6 multiplies the rare and epic weights) | - | - |
| 22 | Cheap Reforge | Craft | Reforges cost half | mod `reforge` 0.5 | K6 | - |
| 23 | Salvager's Luck | Craft | Salvage returns double | mod `salvage` 2 | - | - |
| 24 | Transmuter's Day | Craft | Transmutes cost one less (never below 2) | bonus `transmuteSave` 1 | K6 | - |
| 25 | Builder's Moon | Road | Builds started today are 25% faster | mod `buildTime` 0.75, stored on the build at start | Camp | - |
| 26 | Fair Winds | Road | Expeditions sent today bring back +30% | mod `expHaul` 1.3, stored at send | Expeditions | - |
| 27 | Busy Tavern | Road | Hiring the visitor costs 25% less gold; the trader sells double | bonus `tavernDeal` 1 | B7 | - |
| 28 | Bounty Day | Road | Bounties refill at once and pay +50% | bonus `bountyNoWait` 1, mod `bountyPay` 1.5 | - | - |
| 29 | Renown Day | Road | Bounties give double Renown | mod `renown` 2 | B7 | - |
| 30 | Deep Tide | Deep | Depth Marks x1.5 | mod `deepMarks` 1.5 | Deepwell | **Undertow:** Oil drains 20% faster, marks x2.5 instead |
| 31 | Lantern Oil | Deep | Deepwell runs start with +30s Oil | bonus `deepOil` 30 | Deepwell | - |
| 32 | Falling Stars | Deep | Deepwell drafts show 4 boons | bonus `deepOffers` 1 | Deepwell | - |
| 33 | Long Night | Rest | Away gains +25% | mod `offline` 1.25 | - | - |
| 34 | Hearth Day | Rest | The Garden grows double; resting companions share a new line | mod `garden` 2 | Camp | - |
| 35 | The Wyrm Stirs | Rest | +25% raid damage | mod `raid` 1.25 | has raided once (`S.wyrms > 0` or `S.raid.gen > 0`) | - |

- Magnitudes stay narrow: +25% to +50% on one thing, x2 to x3 on a rare drop. An Omen can make one
  activity the best choice today without making any day feel required.
- The Wyrm Stirs uses the existing `raid` modifier. It does not touch the online layer.

### 2.3 Dares

- 7 Omens carry a Dare. The Almanac card shows it under the Omen with a toggle: "Take the Dare:
  foes have 30% more HP, and gold is +80% instead of +30%."
- Accepting and dropping are instant and free. The Dare ends at midnight with the Omen.
- A Dare's twist and its bigger reward switch on and off together, so a player can never keep
  the reward without the twist.
- The Sky Blessing (camp.md) adds 25% to a Dare's reward part.
- Dares do not apply to away time. Away gains use the plain Omen.

### 2.4 "Best today" hint

Each Omen card has one line and a **Go** button that sets the player up:

| Category | Hint | Go does |
|---|---|---|
| Gather | "Best today: Wood. Mossy Hollow is home ground." | Switches to Gather on the best node for that family and moves camp to its home ground |
| Fight | "Best today: Wraithmarsh. Your best is Wraithmarsh IV (zone 28)." | Switches to Fight in that zone |
| Craft | "Best today: the Forge. You can make 3 upgrades." | Opens the Craft tab |
| Road | "Best today: send your bench out before bed." | Opens the Map Room or the Camp |
| Deep | "Best today: a Deepwell run." | Opens the Deepwell entry sheet |
| Rest | "Best today: rest easy." | Closes the sheet |

---

## 3. The weekly board

### 3.1 Goals

Each week (`deviceWeek()`) the board draws **5 goals**: 3 Easy (about one session each) and 2
Steady (2 to 3 sessions). The draw is seeded by the week and filtered to goals this save can make
progress on. Counts scale with progress like bounties: `x (1 + floor(maxZone / 10) x 0.25)` for
kill and gather goals, rounded to 5.

| Id | Tier | Goal | Base count | Needs |
|---|---|---|---|---|
| `wBoss` | Easy | Beat zone bosses | 5 | - |
| `wBty` | Easy | Claim bounties | 6 | - |
| `wGath` | Easy | Gather units at your top tier or one below | 300 | - |
| `wCraft` | Easy | Craft items | 5 | - |
| `wExp` | Easy | Send expeditions | 3 | Expeditions |
| `wFloor` | Easy | Clear Deepwell floors (any runs) | 30 | Deepwell |
| `wCrit` | Easy | Land critical hits | 300 | - |
| `wChamp` | Easy | Defeat champions | 3 | K5 |
| `wBuild` | Easy | Finish a building level | 1 | Camp, a build possible |
| `wTrial` | Easy | Reach floor 15 in this week's Trial | 1 | Deepwell |
| `wKill` | Easy | Defeat foes | 1,000 | - |
| `wTrans` | Easy | Transmute | 5 | K6 |
| `wBoss2` | Steady | Beat zone bosses | 25 | - |
| `wLvl` | Steady | Gain companion levels (all fielded, summed) | 20 | B1 |
| `wPromo` | Steady | Promote a companion | 1 | B1, someone within 10 levels of a cap |
| `wUp` | Steady | Upgrade gear (+1 each) | 10 | - |
| `wGrade` | Steady | Bring back Great or Perfect expeditions | 3 | Expeditions |
| `wDeep` | Steady | Reach floor 25 in one Deepwell run | 1 | Deepwell |
| `wStar` | Steady | Earn zone mastery stars | 2 | a star within reach |
| `wRef` | Steady | Reforge item lines | 3 | K6 |
| `wGath2` | Steady | Gather units at your top tier or one below | 2,000 | - |
| `wBty2` | Steady | Claim bounties | 15 | - |
| `wRare` | Steady | Craft a Rare or better item | 3 | - |
| `wElder` | Steady | Clear 2 boss floors in one Deepwell run | 1 | Deepwell |

- Goals count **live** events (`kill`, `harvest`, `itemAdded`, `bountyDone`, `expedSent`,
  `expedBack`, `campBuilt`, `deepKill`, `deepFloor`), like bounties and mastery. Away gains do not
  fire events, so counts are sized for live play.
- Progress starts at 0 each week. Two goals of the same kind never appear together.
- **Swaps:** 2 per week. A swap replaces one unfinished goal with a new one of the same tier.

### 3.2 Rewards

| Tier | Reward |
|---|---|
| Easy | **Small camp crate** (3 families x 40 units at your top tier) + 20 Depth Marks |
| Steady | **Large camp crate** (3 families x 100 units) + 40 Depth Marks + 1 Trophy of your choice + 2 Renown |
| 3 goals done | An **Almanac Stamp** (Codex: 1 Lantern Light each, up to 52 a year) |
| 5 goals done | One more small crate |

- **Crate families** are the ones your next camp build is short of, so the reward lands where you
  feel the need. With no build pending, your class's signature family (gathering spec rule 2) plus
  the two families you have least of.
- Before the Deepwell unlocks, the marks part becomes 50% more crate.
- Claims are one tap per goal. Unclaimed finished goals are **claimed for you** at the week's end
  and shown on the next open, so nothing is lost to forgetting.

---

## 4. UI on a 360px phone

- **Header button:** a 36px Omen icon at the right of the header, with a dot when a weekly goal is
  ready to claim. It opens the Almanac sheet. The Camp's Almanac post opens the same sheet.
- The away card's last line names today's Omen: "Today: Quiet Woods, +50% Wood."

**Almanac sheet** (bottom sheet, 90% height, 328px content):

```
TODAY  Quiet Woods                                   [64px Omen art]
+50% Wood.
Best today: Wood. Mossy Hollow is home ground.            [ Go ]
Tomorrow: Deep Veins (+50% Ore)
-----------------------------------------------------------------
THIS WEEK  (ends in 3 days)                  Stamps 14   Swaps 2
[boss]  Beat 5 zone bosses          ####-  4/5    crate + 20 marks
[flask] Craft 5 items               #####  done   [ Claim ]
[map]   Send 3 expeditions          ##---  2/3             [Swap]
[star]  Earn 2 mastery stars        -----  0/2    large crate ...
[well]  Reach floor 25 in one run   -----  best 19
-----------------------------------------------------------------
Past Omens: 21 of 35 seen  >  (opens the Codex Omens page)
```

- Goal rows are 56px with 44px buttons. Reward icons sit under the bar on narrow phones.
- With a Dare, a toggle row sits under the Omen text: "[ ] Take the Dare: Gold Fever".
- Reduced motion: the Omen art does not animate.

---

## 5. Save state

```js
registerState('almanac', {
  v: 1,
  dare: { day: -1, on: false },   // a Dare is on only when day === deviceDay()
  week: -1,                       // the week these goals belong to
  goals: [],                      // [{ k, tier, need, have, done, claimed }]
  swaps: 2,
  stamps: 0, full: 0,             // weeks with 3+ goals / with all 5
  seen: {}                        // omen id -> first day seen (Codex)
});
```

- The day you left is `deviceDay(S.last)`, so no new field is needed for away gains.
- On load and every 5s: if `week !== deviceWeek()`, auto-claim finished goals of the old week,
  then draw a new board and reset swaps.
- New field only. `check.mjs`: fixtures load; a fixed `deviceDay` gives the same Omen twice.

---

## 6. Balance targets

| # | Target | Pass band |
|---|---|---|
| A1 | Omen spread over 350 days | each Omen 10 times; no category twice in a row |
| A2 | Gain on the Omen's focus, played to it (sim, 1 day) | +15 to +40% over a normal day; never below a normal day |
| A3 | Weekly board, 2 sessions of 20 min a day | 3 of 5 by day 2 to 3; 5 of 5 by day 4 to 6 |
| A4 | Board's share of weekly materials | at most 10% |
| A5 | Board's share of Depth Marks (3 runs a week) | 25 to 35% |
| A6 | A Dare played to, vs the plain Omen | +30 to +60% on the focus reward |
| A7 | Omen with the away rule vs no Omen, 8h away on Long Night | exactly x1.25 |

The sim's `--days` mode (camp.md M6) plays the day's Omen with the "Go" choice at each check-in.

---

## 7. Build plan

Wave 2 in the vision. Omens that need later systems stay dormant (fallback) until those systems
merge, so this ships early with no cross-team waits.

| Wave | Task | Owns | Small edits in | Depends on |
|---|---|---|---|---|
| 2 | L1 Data: 35 Omens, categories, Dares, hints, fallback list, 24 goals, rewards | `src/js/25-data-almanac.js` (core, data only) | - | - |
| 2 | L2 Core: schedule and shuffle, `omenToday()`, away rule, modifier and bonus wiring with `needs()` checks, Dares, weekly board (draw, scale, events, swaps, claims, auto-claim), crate families, events `omen {id}`, `weeklyDone {k}` | `src/js/55-almanac.js` | `src/js/55-mastery.js` (`bonus('bestiaryMult')`, `bonus('masteryMult')` on the kill counts); `src/js/55-bounties.js` (`bountyNoWait`, `bountyPay`); `src/js/50-sim.js` (`mod('uniqueChance')` in `kill()`; `bossDmg` via `dmg` while `mob.boss`) | B0 |
| 2 | L3 UI: header button, Almanac sheet, away-card line | `src/js/75-almanac.js`, `src/styles/60-almanac.css` | `src/shell.html` (header button slot), `src/js/70-ui.js` (header wiring) | L2 |
| 2 | L4 Art: 35 Omen icons (16x16) and 7 Dare frames | `src/js/14d-art-omens.js` | `src/js/10-art.js` (ICON entries) | - |
| 3 | L5 Sim: Omen play in `--days`, A1-A7 | `tools/sim.mjs` | - | L2, M6 |

Later systems read their keys (`compXp`, `buildTime`, `expHaul`, `deepMarks`, `sigDrop`, and so
on) the moment they merge. Nothing in the Almanac changes when they do.

---

## 8. Open questions for the owner

1. **Dares.** Opt-in twists on 7 Omens for a bigger reward, droppable at any time. They keep
   the vision's "Blood Moon" flavour without ever costing a player who does not choose it.
   Recommended: **yes**.
2. **Away time uses the Omen of the day you left.** Simple, predictable, and kind to players who
   check in at night. Recommended: **yes**.
3. **Unclaimed weekly goals are claimed for you** when the week ends. Nothing is lost to
   forgetting, and it removes the only "come back before Sunday" pressure. Recommended: **yes**.
