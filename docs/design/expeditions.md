# Expeditions

Status: design spec D1 for the long-term vision (system 2), written 2026-09-27. It uses the
roster and the bench from [party-and-classes.md](party-and-classes.md), the material families and
Trophies from [gathering-and-crafting.md](gathering-and-crafting.md), and the Map Room and the
Roster board from [camp.md](camp.md). All numbers are starting values for `tools/sim.mjs` to tune.

Owner constraints this spec obeys: no prestige or resets, single-player first, idle with active
moments, no gacha, playable on a 360px phone.

Design rules:

1. **Every recruit gets a purpose.** A benched Common with the right circle or role is worth
   sending. Needs ask for roles, circles and names, not only raw power.
2. **You see the result before you send.** The grade is shown up front, and it is the only thing
   that sets the size of the haul. The only luck is in the bonus rolls, which are all upside.
3. **Nothing is lost.** No failure, no injuries, no lockouts. The worst grade still brings
   something home.
4. **A light route, never the only route.** Tokens, Kingslayer credit and Renown from
   expeditions shorten another unlock. They never replace it.
5. **The bench rule stays mostly true.** Expeditions give a little XP, capped below the party,
   so fielding stays the way to grow a character.

---

## 1. Fantasy and loop

**Fantasy:** the lanterns you relit keep the road open behind you. Your spare companions walk
back along it, clear what crept in, and bring home what they find.

**Loop (30 seconds, 1 to 3 times a day):**

1. The away card says "Expedition back: Wraithmarsh Reeds (Great)" with the haul.
2. Open the Map Room. Tap **Send again**, or pick a new route and tap **Best team**.
3. Pick a length that fits when you will be back: 1h, 4h, 8h or 12h.

**Unlock:** the Map Room (camp.md) opens at Hearth 2 (zone 8). Level 1 builds in 3 minutes. If
the Camp is not merged yet, Expeditions open at zone 8 with 1 slot.

---

## 2. Slots and lengths

| Map Room | Slots | Lengths |
|---|---|---|
| Lv 1 | 1 | 1h, 4h |
| Lv 2 | 2 | 1h, 4h |
| Lv 3 | 2 | 1h, 4h, 8h |
| Lv 4 | 3 | 1h, 4h, 8h |
| Lv 5 | 3 | 1h, 4h, 8h, 12h; **Repeat** |
| Lantern Light 200 (codex.md) | +1 slot (`bonus('expSlots')`) | - |

- A slot takes a team of 1 to 3 benched companions. With 4 slots, 12 characters can be out at
  once. Add 3 bench jobs and 3 fielded, and all 18 characters have work.
- **Length factor** (haul per hour): 1h x1.2, 4h x1.0, 8h x0.9, 12h x0.85. A short trip is
  slightly richer per hour, and a long trip is richer per check-in. Neither is punished.
- **Team factor:** 1 member x0.45, 2 members x0.75, 3 members x1.0.

---

## 3. Routes

### 3.1 Bands

Region 1 splits into 5 bands of 7 zones, one per zone cycle. A band's routes open when its last
boss is beaten (`S.maxZone > zEnd`). Material rewards come at the band's tier.

| Band | Zones | Opens at | Material tier | Route power `R` |
|---|---|---|---|---|
| I | 1-7 | zone 8 | 1 | 630 |
| II | 8-14 | zone 15 | 2 | 2.5K |
| III | 15-21 | zone 22 | 3 | 7.6K |
| IV | 22-28 | zone 29 | 4 | 20K |
| V | 29-35 | zone 36 (Great Lantern 1) | 5 | 50K |

**Power** is shown on every character card and team: `ePow(c) = 10 x rarityMult x lv x 2^rank`
(rarity multipliers from the party spec: Common 1, Rare 1.5, Epic 2.2, Legendary 3.2). Team
power is the sum. `R(band) = 3 x 10 x par x 2^floor(par / 25)` with `par = 3 x zEnd`, which is
three Commons at par level. It leaves out gear and multipliers on purpose: a benched character
has no field bonuses, and the number stays small enough to read.

### 3.2 Route table (18 routes in Region 1)

Focus icons: family names, **T** Trophies, **K** a recruit token, **L** Lore, **R** Renown.

| Id | Route | Band | Focus (share) | Need 1 | Need 2 |
|---|---|---|---|---|---|
| `r1a` | Mossy Hollow Rounds | I | Wood 70%, Herbs 30% | a Hedgefolk | a striker |
| `r1b` | Batwing Echoes | I | Hide 60%, Crystal 40% | a tank | Wren |
| `r1c` | The Old Bonefield Road | I | L, R | a support | 2 or more companions |
| `r2a` | Barrow Silk | II | Fibre 60%, Hide 40% | a tank | an Oath member |
| `r2b` | Spore Gardens | II | Herbs 60%, Essence 40% | a support | a caster |
| `r2c` | Quarry Scouting | II | T (Golem Core, Grave Knuckle) | a tank | average level 30+ |
| `r3a` | Wraithmarsh Reeds | III | Fibre 50%, Essence 50% | a caster | a Wayfarer |
| `r3b` | Quarry Night Shift | III | K Stonebreaker's Token, Ore | a tank | a caster |
| `r3c` | Dusk Errand | III | K Dusk Contract, Hide | a striker | a Dusk Company member |
| `r4a` | Deep Geodes | IV | Crystal 60%, Ore 40% | a Rare or better | a tank |
| `r4b` | The Chapel Ruins | IV | L, R | a support | an Oath member |
| `r4c` | Hunting the Barrows | IV | T (Beetle Horn, Bat Fang, Moss Heart), Hide | 2 strikers | average level 60+ |
| `r5a` | Emberwood | V | Wood 50%, Crystal 50% | an Epic or better | a Hedgefolk |
| `r5b` | The Drowned Road | V | L (a Sunken Coast teaser), Essence | a caster | a support |
| `r5c` | Wyrm's Wake | V | T (any 2 types), Herbs | a tank | a Legendary |
| `r5d` | **The Hollow Court** | V | Kingslayer credit, L | Aldric | a Dusk Company member |
| `r2d` | Hedge Muster | II | R, XP x2 | 3 Hedgefolk | - (one need, counts twice) |
| `r3d` | The Wayfarers' Crossing | III | Essence, R, XP x2 | 2 Wayfarers | average level 45+ |

- Needs are always things the roster can offer. Every role has at least 2 characters, and every
  circle has at least 4.
- **The Hollow Court** is 8h only and needs Band V. It exists for Corvin (section 5).
- **Rumours** (Tavern Lv 3): one open route a day, picked by `deviceDay()`, shows "Rumour: +50%
  haul today". It is a nudge, not a timed must-do: the same route comes back within a week.

---

## 4. Grade and rewards

### 4.1 Grade

```
points = (need 1 met) + (need 2 met) + (teamPower >= R) + (teamPower >= 1.5 R)
```

| Points | Grade | Haul | Bonus rolls |
|---|---|---|---|
| 0-1 | Fair | x0.6 | 0 |
| 2 | Good | x1.0 | 0 |
| 3 | Great | x1.3 | 1 |
| 4 | Perfect | x1.6 | 2 |

The send sheet shows the grade live as you pick the team: "Great: add a caster for Perfect".

### 4.2 Haul (per hour, team factor 1.0, Good grade, length factor 1.0)

| Focus | Per hour | Notes |
|---|---|---|
| Gathered family (Wood, Ore, Crystal, Fibre, Herbs) | 90 units of the band tier | About 12% of a live hero's rate per member. Split by the route's shares |
| Fought family (Hide, Essence) | 60 units | Hide and Essence stay fight-first; this is a top-up |
| Trophies (T) | 0.35 | Split over the listed types. Fractions carry as a chance |
| Token (K) | 1 token roll per 3h | Rolled through B7's `unlockTokenRoll(id)`, the same roll as a boss kill, with pity. A miss moves pity on |
| Lore (L) | 1 Lore page per run of 4h or more at Good+; 1h runs add a quarter page | 5 pages per band, 25 in Region 1 (Codex Lore page) |
| Renown (R) | +1 per 2h | Toward Aldric, Vesper's fallback and Caedmon |
| Kingslayer credit | Good +5, Great +8, Perfect +10 per run | Counts as zone boss kills for Corvin, capped at 50 in total |

```
haul = perHour x hours x lengthFactor x teamFactor x gradeMult x mod('expHaul')
```

`mod('expHaul')` sources: the Wayfarer Blessing (+15%), the Fair Winds Omen (+30% for teams
sent that day), the Lore Codex page (+3%). Rounding: floor, with the fraction as a chance, rolled
from the run's seed.

### 4.3 Bonus rolls (Great: 1, Perfect: 2)

| Roll | Chance | Reward |
|---|---|---|
| Extra haul | 50% | 25% more of the route's main focus |
| Trophy | 25% | 1 Trophy of the band's zone types |
| Lore scrap | 15% | a quarter Lore page |
| Keepsake | 10% | a camp decoration (12 in Region 1, one per route with a material or trophy focus). Once all are found, this becomes a Trophy |

Keepsakes are cosmetics (the Chapel Bell, the Batwing Kite, the Golem's Lamp, and so on). They go
into the Camp's decoration slots and the Codex. They never give power.

### 4.4 XP

Each member earns `0.2 x cxpNeed(lv) x hours x gradeMult` XP, which is about a fifth of a level
per hour. A member cannot pass **party level - 5** through expeditions; extra XP is dropped. Two
routes (Hedge Muster, the Wayfarers' Crossing) give x2 XP. Fielding stays far faster: at par, a
fielded character gains a level in about 40 kills.

### 4.5 Example

Maren (Rare, Lv 40, rank 1), Thessaly (Rare, Lv 38, rank 1) and Pip (Common, Lv 42, rank 1) go
on Wraithmarsh Reeds (Band III, R = 7.6K) for 8h. Power: 1,200 + 1,140 + 840 = 3,180, under R.
Needs: a caster (yes: Thessaly, Pip) and a Wayfarer (yes: Thessaly). Points 2, grade **Good**.
Haul: Fibre `90 x 8 x 0.9 x 0.5 share = 324` Silkgrass Fibre, and Essence `60 x 8 x 0.9 x 0.5 =
216` Radiant Essence. With Kestrel (Rare, Lv 90, rank 3, power 10,800) in place of Pip, team
power is 13,140, which passes both R and 1.5 R. The grade becomes **Perfect**: x1.6 and 2 bonus
rolls.

---

## 5. Unlock shortcuts

| Character | Normal route (party spec) | Expedition shortcut |
|---|---|---|
| Grenna | Stonebreaker's Token from Quarry Ruins bosses, 8% +8% per miss | Quarry Night Shift rolls the token once per 3h. An 8h Good run is about 2.4 rolls |
| Isolde | Dusk Contract from zone bosses from zone 16, 10% +10% per miss | Dusk Errand rolls it once per 3h |
| Corvin | Kingslayer: 150 zone boss kills and every bestiary page at tier 2 | The Hollow Court adds 5 to 10 boss kills per run, 50 at most. The bestiary part stays |
| Aldric, Vesper, Caedmon | Renown 15, 60, 80 | Lore routes add Renown at +1 per 2h |

The Hollow Court needs Aldric in the team. That ties it to the Old Enemies synergy: Aldric goes
looking for the Hollow King's blade and comes back with a story (a Lore page per run, 3 pages in
all, ending on the day Corvin agrees to meet you).

---

## 6. Idle and offline

- **Wall clock:** a slot stores `start` and `end`. It finishes while the game is closed. It is not
  limited by the away cap, because its length is fixed when it is sent.
- **Fixed at send:** the grade and a seed are stored at send. Every roll (fractions, bonus rolls,
  keepsakes) comes from that seed, so the result is the same whether the game was open or not,
  and reloading cannot reroll it. Token rolls happen on return, through the token pity code.
- **Auto-collect:** a finished slot pays into the pouch on the next tick (or on load), adds a line
  to the away card and a dot on the Camp chip strip, and frees the team (they go back to Resting).
- **Repeat** (Map Room Lv 5, one toggle per slot): a returned team goes out again on the same
  route and length, up to 3 runs in a row, then waits for you. Each run is seeded and paid on its
  own.
- **Call back:** in-page confirm. The team returns now with half of the haul for the time spent
  (`elapsed / length x 0.5`) and all XP earned so far. No bonus rolls.

---

## 7. UI on a 360px phone

The Map Room card on the Camp tab has an **Expeditions** button (and a chip-strip dot). It opens a
bottom sheet at 90% height, 328px content width.

```
Slots 2/3                                        [Log]
[Pip][Maren][Thess]  Wraithmarsh Reeds  Good  ###----  5h 12m
[Bram][Wren]         Batwing Echoes     Great  back!   [Collect]  <- only if you open it at the moment it lands
[ + Send a team ]
-----------------------------------------------------
(All)(Materials)(Trophies)(Tokens)(Lore)          chips scroll sideways
Band III  Zones 15-21                    Power 7.6K
 [icon] Wraithmarsh Reeds   Fibre Essence   (caster v)(Wayfarer v)
 [icon] Quarry Night Shift  Token Ore       (tank v)(caster x)
 ...
```

- **Route card** (collapsed 64px): a 40px route icon, the name, focus icons, and need chips that
  are green when your bench can meet them right now. Tap to open the send sheet.
- **Send sheet:**
  - Length: a segmented control (1h, 4h, 8h, 12h), 4 x 78px, 44px tall. Locked lengths show the
    Map Room level they need.
  - Team: 3 portrait slots of 64px. Tap a slot to open the bench list, sorted by how many needs a
    character meets, then by level (lowest first, so the ones who need XP go).
  - **Best team** button: fills for the best grade, preferring characters with the lowest level.
  - Grade meter: 4 pips and the grade name, with a one-line hint for the next grade.
  - Haul preview: 3 to 5 lines with icons and amounts for this grade. Bonus rolls are listed as
    "1 bonus roll".
  - **[ Send ]** 48px, full width.
- **Log:** the last 10 returns with their hauls.
- A character who is out shows "Out: Wraithmarsh Reeds, 5h" on their Party-tab tile and sheet.

---

## 8. Save state

```js
registerState('exped', {
  v: 1,
  slots: [],      // [{ r, team: [ids], h, start, end, seed, grade, rep: 0..3, repOn: false }]
  done: {},       // routeId -> runs finished
  lore: {},       // pageId -> quarters (4 = found)
  court: 0,       // Kingslayer credit given (max 50)
  keep: {},       // keepsake id -> true
  log: [],        // last 10: { r, grade, haul, at }
  seq: 0
});
```

- New field only. Status on the Roster board comes from `slots[].team`, not a copy.
- If a team member is missing (a future save edit or bug), the slot still pays at its stored grade.
- `check.mjs`: fixtures load with an empty `exped`; a seeded run pays the same haul twice.

---

## 9. Balance targets (tools/sim.mjs)

Uses camp.md's `--days` mode. The expedition policy fills every slot with Best team at each
check-in, choosing the length that best covers the gap to the next check-in.

| # | Target | Pass band |
|---|---|---|
| E1 | First expedition sent | 30 to 60 min |
| E2 | Expedition share of all materials, day 7 | 8 to 18% |
| E3 | Expedition share of Hide and Essence, day 7 | 15 to 30% |
| E4 | Expedition share of Trophies, week 2 | at most 35% |
| E5 | Grenna and Isolde: expected recruit time with the token routes vs without | 60 to 80% (a 20 to 40% cut) |
| E6 | Hollow Court credit at 50 | 5 to 10 runs; Corvin still takes at least 10h (party T16) |
| E7 | A character used only on expeditions, day 7 | within 10 to 20 levels of party level |
| E8 | Slot busy time, 2 check-ins a day, from Map Room 3 | at least 75% |
| E9 | By day 7 with 10+ recruits: open routes that reach Great | at least 2 |
| E10 | Same seed, open vs closed game | identical haul |

---

## 10. Build plan

Wave 3 in the vision. Every agent runs `node tools/build.mjs` and `node tools/check.mjs`.

| Wave | Task | Owns | Small edits in | Depends on |
|---|---|---|---|---|
| 3 | X1 Data: bands, 18 routes, needs, focus tables, lengths, bonus table, keepsakes, Lore page text | `src/js/23-data-exped.js` (core, data only) | - | K1 (families) |
| 3 | X2 Core: `registerState('exped')`, `ePow`, grade, send/collect/call back, seeded hauls, repeat, XP with the cap, Renown, token and Kingslayer hooks, events `expedSent`, `expedBack {r, grade, haul}` | `src/js/55-expeditions.js` | `src/js/56c-unlocks.js` (export `unlockTokenRoll(id)`, accept `kingslayerCredit {n}`) | B1, B7, M2 (Map Room level; level 1 if missing) |
| 3 | X3 UI: Map Room sheet, route cards, send sheet, Best team, log, Party-tab "Out" line | `src/js/75-expeditions.js`, `src/styles/60-expeditions.css` | `src/js/75-party.js` (one line on tiles, with the B5 owner) | X2, M3 |
| 3 | X4 Writing and art: 18 route icons (16x16), 12 keepsakes, 25 Lore pages (2 to 4 sentences each, house voice) | `src/js/23b-exped-text.js`, `src/js/14b-art-exped.js` | `src/js/10-art.js` (ICON entries) | - |
| 3 | X5 Sim: expedition policy, E1-E10 | `tools/sim.mjs` | - | X2, M6 |

The away-card lines use Q1's away-report hook (`onAway(fn)`); if Q1 has not merged, a two-line
edit in `90-boot.js` adds them.

---

## 11. Open questions for the owner

1. **A little XP on expeditions.** The party spec says the bench earns nothing. Expeditions give
   about a fifth of a level per hour, capped at party level - 5, so fielding stays the real way to
   grow. Recommended: **yes**, it is what makes sending a Common feel worth it.
2. **Grades shown before sending, no failure.** The grade is known at send, and the only luck is
   bonus rolls. It is less of a gamble and more legible. Recommended: **yes**.
3. **Repeat while away** (Map Room Lv 5), up to 3 runs in a row. It helps players who check in
   once a day. Recommended: **yes**, capped at 3 so the game still invites a visit.
