# Oaths: choose how hard the dark fights back

Status: design spec for plan 2 ([plan-2.md](plan-2.md), wave 3), written 2026-09-28. Oaths are
player-chosen difficulty on zones you have cleared: you swear **Vows** that make the foes harder,
and the zone pays in legendary powers ([legendaries.md](legendaries.md)), Pearls, Trophies, Circle
Sigils, Oath Seals and titles. Built on party combat (Stage C), the hold estimate (C3) and the tide
([region-2.md](region-2.md)). All numbers are starting values for `tools/sim.mjs` to tune.

Owner constraints this spec obeys: no prestige or resets, fair with no FOMO power, idle by default
and rewarded for attention, slower pace, playable at 360px.

Design rules:

1. **Nothing is lost by swearing.** An Oath earns the same companion XP per minute as your front,
   never costs items or progress, and breaking it is free.
2. **The player picks the difficulty and the kind of difficulty.** Vows are rules, not only
   bigger numbers, so an Oath is a line-up puzzle.
3. **Higher Oaths pay in things the front does not give:** legendary powers and their rank,
   Seals, titles. Gold stays best at your front.
4. **Bragging is personal for now.** A best Oath per zone type, a highest Oath kept, titles and a
   Codex page. No leaderboard until the online interface exists (the online layer is frozen).
5. **One screen.** Swearing is a bottom sheet with a list of Vows and one number.

---

## 1. Fantasy and loop

**Fantasy:** the Great Lantern of the Hollow is lit, but the old lampwardens swore oaths to hold
their roads against worse than this. You swear them again: on a road you have already cleared, you
invite the dark to come back harder, and you hold anyway.

**Loop (active, 10 to 30 minutes, any day from the first Great Lantern):**

1. Tap the **Oath** button next to the zone stepper. The sheet suggests a zone ("Your party can
   hold Oath 8 at The Wrecks II").
2. Tap Vows to raise the Oath level (or pick a preset, Oath I to X). The sheet shows the rewards
   and whether your party can hold it.
3. Tap **Swear**. The party moves to that zone; its foes and its elder carry your Vows.
4. Beat the zone's elder under the Oath to **keep** it: a Seal for that zone type, maybe a
   legendary power, a new highest Oath.
5. Leave it running while away (it keeps paying at the away rate if it holds), or tap **Break
   the Oath** to go back to your front.

**Unlock:** the first kill of the zone 35 boss (the Great Lantern of the Hollow, region-2.md 8.3),
about day 5 to 7. Old saves past zone 35 get it on load (feature `oaths` in `FEATURES`).

---

## 2. Rules

### 2.1 Where

- Any **cleared** zone: `z < S.maxZone` (its boss has been beaten), Region 1 or the coast.
- Not in the Deepwell, not in the raid. One Oath at a time.
- While sworn, auto-progress is off (the party stays on the Oath zone) and the zone stepper shows
  "Zone 45 · Oath 12". Moving to another zone breaks the Oath (in-page confirm).

### 2.2 Vows

The **Oath level** is the sum of the weights of the Vow ranks you picked (0 to 30).

| Id | Vow | Ranks | Weight per rank | Effect per rank |
|---|---|---|---|---|
| `hard` | **Hardened** | 3 | 1 | Foes and the elder have +35% HP |
| `fierce` | **Fierce** | 3 | 1 | Foes and the elder deal +30% damage |
| `restless` | **Restless** | 2 | 1 | Foes attack 12% faster; the elder's telegraphs come 10% more often |
| `elders` | **Elders Stir** | 2 | 2 | Rank 1: every pack has an elite. Rank 2: every pack has an elite that also uses its Elder's second mechanic |
| `bitter` | **Bitter Water** | 2 | 1 | Party healing and shields -20% |
| `wick` | **Short Wick** | 2 | 1 | The elder's timer is 8s shorter |
| `tide` | **Rising Water** | 1 | 2 | The tide applies here (Region 1 zones too); on the coast, High tide lasts 14 of the 24 minutes |
| `choir` | **Choir of the Dark** | 1 | 2 | Every pack has a healer (a Marsh Wraith, or a Brine Witch on the coast) |
| `norest` | **No Rest** | 1 | 2 | Downed members stand up after 3 packs, not after the next |
| `circle` | **One Circle** | 1 | 2 | Every fielded companion must share one circle (Hedgefolk, the Oath, Dusk Company, Wayfarers) |
| `unlit` | **Unlit Lamp** | 1 | 3 | Your hero ability does not auto-cast and its cooldown is 30% longer |
| `thin` | **Thin Line** | 1 | 3 | You field 2 companions, not 3 |

Maximum: 3 + 3 + 2 + 4 + 2 + 2 + 2 + 2 + 2 + 2 + 3 + 3 = **30**.

- Stacking is multiplicative for HP and damage: Hardened 3 is x1.35^3 = x2.46 HP, about 4.5 coast
  zones of HP (`hpLate` 1.22).
- **One Circle** and **Thin Line** are checked when you swear; the sheet offers "Field a matching
  line-up" (autoField within the rule).
- **Presets** (one tap, then editable):

| Preset | Level | Vows |
|---|---|---|
| Oath I | 2 | Hardened 1, Fierce 1 |
| Oath II | 4 | Hardened 2, Fierce 2 |
| Oath III | 6 | Hardened 2, Fierce 2, Restless 1, Bitter Water 1 |
| Oath IV | 8 | + Elders Stir 1 |
| Oath V | 10 | + Short Wick 1, Restless 2 |
| Oath VI | 13 | Hardened 3, Fierce 3, Restless 2, Elders Stir 1, Short Wick 1, Choir |
| Oath VII | 16 | VI + Rising Water, Bitter Water 1 |
| Oath VIII | 20 | VII + Elders Stir 2, Short Wick 2, Bitter Water 2 |
| Oath IX | 25 | VIII + No Rest, Unlit Lamp |
| Oath X | 30 | every Vow at full rank |

### 2.3 The Oath ladder

- **Swearable level:** at most `max(6, S.oath.maxL + 4)`: your **highest Oath kept + 4**, and 6
  before you have kept one.
- **Keeping** an Oath: beat the elder of the sworn zone while every picked Vow is active. The elder
  appears after 10 packs as usual; the boss gate's "Rematch the zone boss" button reads "Face the
  Oath elder". A toggle "Face the Oath elder when ready" (like "Fight frontier bosses when ready")
  makes it idle while the game is open.
- A failed elder (timer or wipe) costs nothing; the Oath stays sworn.

### 2.4 Idle and offline

- The Oath stays sworn while you are away. The away estimate (`partyHoldEstimate`) runs with the
  Oath's multipliers and rules (Vows in closed form: HP, damage, speed, healing, elites as +50% of
  one foe's HP per elite, a healer as +15% effective HP, Thin Line as the 2-companion party).
- **If it holds:** away kills pay the Oath's drop bonus, and **elders are credited at 1 per 20
  minutes away** (at most 24 a day), each rolling for a legendary like a live elder (section 3).
  Live play is faster (an elder every 2 to 4 minutes when farming well), which is the reward for
  attention.
- **If it does not hold:** the away time farms that zone without the Oath (normal rewards, no
  elders credited), and the away card says: "Your Oath was too heavy to hold while you were away.
  Your party farmed the zone without it." Income never stalls.
- Companion XP per minute is the same as at your front: XP per kill follows time spent fighting
  (`ROSTER_TUNE.killWorth`, capped at `xpWorthMax`), so a slower Oath kill is worth more XP, up to
  the cap. Target O4 checks it.

---

## 3. Rewards

| Reward | Rule |
|---|---|
| Drops | Gold, Essence, signature drops and Pearls x `1 + 0.06 x L` (Oath 20: x2.2). A zone 10 below your front still pays less gold than the front (x0.14 per 10 coast zones) |
| **Legendary powers** | Each Oath elder kill at level 3+ rolls: `1% + 0.2% x L` (Oath 10: 3%, Oath 20: 5%, Oath 30: 7%), plus **pity**: +1% per miss, reset on a drop. The first Oath elder at level 3+ always drops one. The power's rank comes from the level band below. Details in [legendaries.md](legendaries.md) |
| Trophies | An Oath elder at level 5+ gives 1 Trophy (+1 at 15+, +1 at 25+) of the zone's kind (coast: the kind you hold fewest of) |
| Pearls | An Oath elder gives `1 + floor(L / 5)` Pearls of the zone tier |
| **Circle Sigils** | An Oath elder at level 8+ gives 1 Circle Sigil of a random fielded companion's circle (legendaries.md 4) |
| **Oath Seal** | Keeping an Oath records the best level for that **zone type** (7 Hollow types + 7 coast types = 14 Seals). Codex page and titles below |
| Highest Oath kept | One number, shown on the hero sheet and the Journal; raises the swearable level |

Rank bands for legendary drops (legendaries.md 2):

| Oath level | 1-5 | 6-10 | 11-15 | 16-20 | 21-30 |
|---|---|---|---|---|---|
| Power rank | I | II | III | IV | V |

### 3.1 Bragging rights (all local)

| What | Where |
|---|---|
| Highest Oath kept | Hero sheet line "Oath 17", Journal stat, the Oath sheet header |
| **Oath board** | The Oath sheet's second part: 14 rows (zone types), each with its best Seal level and the date. A row of lantern flames, gold at 20+, white at 30 |
| Titles | Oathsworn (keep any Oath), Oathkeeper (10), Unbroken (15), Lanternsworn (20), the Unwavering (25), Oath of Thirty (30) |
| Codex page **Oaths** | 14 zone types x 5 bands (Seal at 1, 6, 11, 16, 21+): 70 entries, 1 Light each. Page Seal title "Keeper of Oaths", no power bonus (Codex caps unchanged) |
| Oath flame | A cosmetic: the hero's lantern light gains a thin ring coloured by the highest Oath kept (amber 10, blue 20, white 30); on by default, a switch in the hero sheet |
| Stats | Oath elders beaten, highest Oath per region |

A leaderboard would need a new online doc shape; it waits for the Phase 2 online interface
(question 3).

---

## 4. How an Oath feels (examples)

- **A Warden at zone 52 on day 16** swears Oath IV at Grey Shingle II (zone 43): elites every
  pack, crabs at Low tide armoured. She saves Low tide for a caster line-up with the Tide Chart and
  keeps it at the second elder. Her first legendary drops: Tidewall (rank I).
- **A Lightkeeper on day 30** after the Keeper: Oath 18 at The Coral Nave III with Thin Line, a
  three-member party of Elowen, Grenna and Morwen. Choir of the Dark adds a Brine Witch to each
  pack, so Morwen's burns carry the healers down. Keeping it lifts his highest Oath to 18, rank IV
  powers start to drop.
- **One Circle** makes a Hedgefolk line-up (Tobin, Wren, Pip) the answer, with the Hedgefolk set
  (legendaries.md 4) finally worth building.

---

## 5. UI on a 360px phone

### 5.1 Where

- The game view's control row: the zone stepper gains a small **Oath** button (44x44, a lantern
  flame icon) once Oaths are unlocked. While sworn, the zone label reads "Zone 45 · Oath 12" in gold.
- Next Up goals: "Keep an Oath at level 6", "Your party can hold Oath 10 at The Wrecks II".
- The Codex Oaths page opens from the Oath board.

### 5.2 The Oath sheet (90% bottom sheet, like the Codex)

```
Oaths                                   Highest kept: 12      [x]
[ Swear ]  [ Oath board ]                          segmented, 44px
Zone  [<] The Wrecks II · 45 [>]     Suggested: holds Oath 10
Preset [I][II][III][IV][V][VI][VII][VIII][IX][X]      scrolls sideways, 40px chips
-----------------------------------------------------------
Hardened        Foes +35% HP each rank         [o][o][ ]   1 each
Fierce          Foes deal +30% each rank       [o][ ][ ]   1 each
Restless        Foes attack 12% faster         [ ][ ]      1 each
Elders Stir     An elite in every pack         [ ][ ]      2 each
...                                                       (12 rows, 52px)
-----------------------------------------------------------
Oath 9 of 16                     Legendary rank II · x1.54 drops
Your party: holds  (green) | may fall back (amber) | will not hold (red)
[ Swear Oath 9 ]                                           48px, full width
```

- Tapping a Vow row cycles its rank (0 to max, then 0). Pips show ranks; the weight is on the
  right. A level above the swearable cap greys the Swear button ("Keep Oath 12 first").
- The hold line uses `partyHoldEstimate` with the Oath (green: holds with margin; amber: holds at
  one tide only or with a thin margin; red: does not hold).
- **Saved Oaths:** long-press Swear to save up to 3 Vow sets ("Farm", "Push", "Brag").
- Reduced motion: no flame flicker; the sheet slides in instantly.

---

## 6. Save state

```js
registerState('oath', {
  v: 1,
  on: null,        // { z, vows: { hard: 2, ... }, L, t }  (t: when sworn)
  best: {},        // zone type key -> best level kept (e.g. { crab: 12, bat: 6 })
  maxL: 0,         // highest Oath kept (sets the swearable cap)
  pity: 0,         // legendary pity in percent points
  first: 0,        // 1 once the guaranteed first legendary dropped
  away: 0,         // unspent away-elder credit, seconds
  saved: [null, null, null],
  kills: 0, flame: 1
});
```

- No existing field changes. Old saves merge the defaults. A save sworn to a zone that no longer
  exists cannot happen (zones are never removed).
- The Codex reads `S.oath.best` (derived page). Titles read `S.oath.maxL`.

---

## 7. Balance targets (tools/sim.mjs)

New flags: `--oath auto|off` (auto: after the first Great Lantern, at each evening check-in the sim
swears the highest level it holds at a zone 8-12 below its front, faces elders, and breaks the
Oath to push when a new zone opens), `--oathdebug 1`.

| Id | Target | Band |
|---|---|---|
| O1 | First Oath kept | within 1 day of the first Great Lantern |
| O2 | Highest Oath kept, `--oath auto`, day 30 / day 45 | 10-14 / 16-22 |
| O3 | P2 with `--oath auto` (time spent at Oaths) | Region 2 boss day stays within 21-42 and within +3 days of `--oath off` |
| O4 | Companion XP per active minute at an Oath vs the front | 0.9-1.1 |
| O5 | Gold per minute at a held Oath 10 zones below the front | 0.2-0.5 of the front's (Oaths are not the gold choice) |
| O6 | Legendary drops, `--oath auto` | first on day 5-8; 4-8 by day 14; all 6 class powers at rank I+ by day 20-30 |
| O7 | P4 after the Region 2 boss (with Oaths and legendaries) | at most 3 empty check-ins in a row to day 45 (a new Oath level kept and a new power or rank count as meaningful) |
| O8 | Offline: 8h away at a held Oath vs live | kills within +/-15%; legendary rolls 24 a day at most |
| O9 | Performance | Oath packs (elites, healers) inside the fight budget; the sheet opens under 150 ms on the phone |

Knobs: `OATH_TUNE` in `55-oaths.js`: vow values (hard 0.35, fierce 0.3, restless 0.12, bitter 0.2,
wick 8), `drop 0.06`, `lgBase 0.01`, `lgPer 0.002`, `pity 0.01`, `awayEvery 1200`, `awayMax 24`,
`cap0 6`, `capStep 4`, band edges.

---

## 8. Build plan (plan 2, wave 3)

| Task | Owns | Small edits in | Depends on |
|---|---|---|---|
| O1 Oath core: state, Vows as modifiers (`foeHp`, `foeAtk`, `foeSpd`, `heal`, `bossTime`, elites and healers through the spawn hook), Rising Water through the coast tide API, One Circle and Thin Line field rules, keeping, the ladder, rewards, away credit, goals | `src/js/55-oaths.js` | `src/js/59-combat.js` (read `mod('foeAtk')`, `mod('foeSpd')`, a pack-composition hook for elites and healers), `src/js/59-combat.js` estimate (accepts the Oath option), `src/js/56-roster.js` (autoField accepts a filter), `src/js/55-onboard.js` (`FEATURES` row) | Stage C, R0; Rising Water needs R2-2 |
| O2 Oath UI: the zone-row button, the Oath sheet (Swear, board), hold line, saved sets, titles in the hero sheet, the flame ring | `src/js/75-oaths-ui.js`, `src/styles/60-oaths.css` | `src/js/70-ui.js` (a slot beside the zone stepper), `src/js/62-stage.js` (the flame ring on the hero's light, a few lines) | O1 |
| O3 Codex and stats: the Oaths page, titles, Journal lines | - | `src/js/57c-codex.js`, `src/js/55-stats.js` | O1 |
| O4 Sim: `--oath`, O1-O9 in `--targets` | `tools/sim.mjs` | `tools/check.mjs` (a sworn Oath survives save and load; breaking restores auto-progress) | O1 |

Legendary drops are rolled in O1 through `legendDrop(rank, source)` from legendaries.md (L2). If
L2 merges later, O1 records the rolls and L2 pays them (`S.oath.owed`), so merge order does not matter.

---

## 9. Open questions for the owner

1. **Oaths pay no extra XP and less gold than your front;** the draw is legendary powers, Seals,
   titles and Pearls. Recommended: **yes**. It keeps Oaths a choice, never a chore, and pushing your
   front stays the fastest way forward.
2. **Vows you pick one by one** (12 Vows, a level from 0 to 30), with one-tap presets Oath I to X.
   The alternative is fixed tiers only. Recommended: **both, as specified**. Presets keep it simple;
   Vows make the line-up puzzles.
3. **Bragging stays personal** (Oath board, titles, Codex) until the online interface exists.
   Recommended: **yes**, and add an Oath column to the Hall of Heroes when the online layer is
   reopened (a coordinator sign-off item).
