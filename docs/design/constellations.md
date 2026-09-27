# Constellations: the talent star map

Status: design spec D1 for the long-term vision (system 5), written 2026-09-27. It is the
roadmap's talent tree, one star map per hero class from [party-and-classes.md](party-and-classes.md).
Every star works on today's combat (Stage A classes in `55-party.js`). Stars marked **[C]** gain
an extra part when party combat (Stage C) lands. All numbers are starting values to tune.

Owner constraints this spec obeys: no prestige or resets, free respecs (roadmap), nothing
pay-to-win, playable on a 360px phone.

Design rules:

1. **Keystones change how you play, not only how much.** Each class has 4. A keystone is a new
   rule with a cost, not a bigger number.
2. **At most 2 keystones are lit at once.** Build variety lasts forever, because the map can never
   become "take everything".
3. **Free respec, 2 saved layouts.** Trying a keystone costs nothing. A "Farm" and a "Push"
   layout make the choice a daily one.
4. **Points come from playing:** hero levels and Great Lanterns. Nothing else, nothing bought.
5. **Readable at 360px.** 31 stars per class on one 328 x 328 map, with a list view as well.

---

## 1. Points

```
starPoints() = floor(S.L / 3) + 4 x greatLanternsLit()
greatLanternsLit() = number of region bosses beaten   // Region 1: S.maxZone > 35; later regions add theirs
```

| When (expected, see N1 in camp.md) | Hero level | Great Lanterns | Points |
|---|---|---|---|
| 3 minutes | 3 | 0 | 1 |
| 1 hour | 20 | 0 | 6 |
| 3 hours | 27 | 1 | 13 |
| Day 3 (active) | 36 | 1 | 16 |
| Week 3 | 45 | 1 | 19 |
| Month 2 (Region 2 cleared) | 54 | 2 | 26 |
| Month 4 to 6 (Region 3) | 63 to 72 | 3 | 33 to 36 |

- Hero levels come fast early and slowly later (`xpNeed` grows x1.3 a level), so points slow down
  naturally. Today the hero earns **no XP while away**, so an idle-first player's points stall.
  See question 1.
- `STAR_EVERY = 3` and `LANTERN_PTS = 4` are the tuning knobs.
- A map costs 44 points to light fully, but only 2 keystones can be lit, so a finished build uses
  about 38. That is a months-long horizon on purpose.

---

## 2. Map rules

- **Shape:** a Hearthstar in the centre (lit for free), 3 **arms** of 8 stars, and a **crown
  ring** of 5 bridge stars and 1 crown keystone. 31 stars per class.
- **Arm:** 5 minor stars (1 point), 2 notable stars (2 points) and a keystone at the tip (3
  points). Stars 1 to 5 form the **spine** from the Hearthstar to the keystone (star 8). Stars 6
  and 7 are a **side branch** off star 4. The arm keystone needs **5 lit stars in its arm**, so
  the cheapest keystone costs 9 points (the spine, 6, plus 3).
- **Crown ring:** bridge stars (1 point each) link the third star of each arm. The crown keystone
  (3 points) needs **3 lit bridges and 3 lit stars in every arm**.
- **Lighting:** a star can be lit if it is next to a lit star and you have the points.
- **Unlighting:** a star can be unlit if every other lit star stays connected to the Hearthstar.
  **Reset** unlights everything. Both are free.
- **Keystone limit:** 2 lit at a time. The third keystone's button reads "Unlight a keystone
  first".
- **When:** anywhere except during a zone boss fight or a Deepwell run. The layout at the start of
  a run stays for the run.
- **Layouts:** 2 per class, named "Farm" and "Push" by default (tap and hold to rename, 12
  characters). Switching is instant and free, with the same "when" rule.
- **Mirror of Embers:** changing class keeps each class's layouts. The new class's map starts
  empty, or where you left it.

### 2.1 Layout on the 328 x 328 map

```
                         (arm 1 tip: keystone)
                                  *
                                  o
                          b       o       b          b = bridge star (crown ring, radius 116)
                                  O                   O = notable, o = minor, * = keystone
                     C            o            b      C = crown keystone (on the ring)
                                  o
                                  @                   @ = Hearthstar (164, 164)
                           o             o
                        O                   O
         arm 3 ->   o                          o   <- arm 2
                 *                                *
```

- Arms point up (-90 degrees), lower right (30) and lower left (150). Stars sit at radius steps of
  36px from the centre, with notables offset 10px to the side so the arm reads as a zigzag.
- Hit areas are 44px. Spacing between neighbours is at least 36px, so taps stay clean.
- Coordinates live in the data file as `[x, y]` on the 328 grid. Edges are listed per star.

---

## 3. The four maps

Wiring legend: `mod` = an `addModifier` key; `tune` = `bonus('tune:<knob>')` read by
`55-party.js` (the knobs in its `T` table); `ks` = a keystone flag, `bonus('ks:<id>') > 0`, read
by the class code. Hero-only damage uses the A1 trick (`dmg x k`, `party x 1/k`) so companions
are not changed.

Every class shares these **5 bridge stars** (1 point each): +3% damage (`mod dmg`); companions
+4% (`mod party`); ability cooldown -4% (`mod abilityCd`); +3% damage; hero XP +5% (`mod xp`).

### 3.1 Warden (tank; heavy hits build guard; Shield Wall)

**Hearthstar: Warden's Oath** (no effect).

| Arm | # | Star | Kind | Effect | Wiring |
|---|---|---|---|---|---|
| Bulwark | 1 | Long Guard | minor | Guard stacks last +2s | tune `guardT` +2 |
| | 2 | Firm Stance | minor | Each guard stack gives +0.5% more | tune `guard` +0.005 |
| | 3 | Deep Guard | notable | Guard cap +2 | tune `guardMax` +2 |
| | 4 | Brace | minor | Shield Wall lasts +1s | tune `wallT` +1 |
| | 5 | Ready Shield | minor | Shield Wall cooldown -6% | mod `abilityCd` 0.94 |
| | 6 | Hold the Line | notable | Shield Wall stops the boss timer 2s longer. [C] The party takes 10% less damage while you hold 5+ guard | tune `wallPause` +2 |
| | 7 | Long Guard II | minor | Guard stacks last +2s | tune `guardT` +2 |
| | 8 | **Unbroken** | keystone | Guard stacks never fall off while you land a heavy hit at least every 3s. Guard cap 10 (was 5), but each stack gives +2% (was +3%). [C] Each stack also gives 2 armour | ks `unbroken` |
| Vanguard | 1 | Heavy Arm | minor | Taps +8% | mod `tap` 1.08 |
| | 2 | Edge | minor | +4% damage | mod `dmg` 1.04 |
| | 3 | Crushing Blow | notable | Every 5th heavy hit deals triple | ks `crush` |
| | 4 | Hard Hits | minor | Crit damage +10% | mod `critDmg` 1.1 |
| | 5 | Heavy Arm II | minor | Taps +8% | mod `tap` 1.08 |
| | 6 | Bash | notable | Heavy hits on a boss add 0.2s to its timer, up to +6s a fight. [C] Heavy hits stagger for 0.3s | ks `bash` |
| | 7 | Edge II | minor | +4% damage | mod `dmg` 1.04 |
| | 8 | **Challenger** | keystone | Your taps taunt. Heavy hits deal +25%, and each one on a boss adds 0.3s to its timer (up to +10s; replaces Bash). [C] Taps taunt every enemy for 2s, and you take 20% less damage while taunting | ks `challenger` |
| Oath | 1 | Comrades | minor | Companions +5% | mod `party` 1.05 |
| | 2 | Comrades II | minor | Companions +5% | mod `party` 1.05 |
| | 3 | Shield Brothers | notable | Shield Wall's party bonus +10% (x1.4, was x1.3) | tune `wall` +0.1 |
| | 4 | Drillmaster | minor | Companion XP +5% | mod `compXp` 1.05 |
| | 5 | Comrades III | minor | Companions +5% | mod `party` 1.05 |
| | 6 | Banner Over Camp | notable | +8% gold and +8% away gains | mod `gold` 1.08, `offline` 1.08 |
| | 7 | Comrades IV | minor | Companions +5% | mod `party` 1.05 |
| | 8 | **Oathsworn** | keystone | Your aura doubles. You deal 25% less; your companions deal +30%. [C] Tanks get +80% HP and +40 armour (was +40% and +20) | ks `oathsworn`; hero-only x0.75, `party` 1.3 |
| Crown | - | **Lantern Bastion** | crown keystone | Every heavy hit takes 1s off Shield Wall's cooldown, and Shield Wall stops the boss timer for its whole length (was 3s). [C] Shield Wall also blocks the next boss heavy hit on anyone | ks `bastion` |

### 3.2 Lanternmage (caster; taps plant Embers; Lantern Flare)

**Hearthstar: First Spark** (no effect).

| Arm | # | Star | Kind | Effect | Wiring |
|---|---|---|---|---|---|
| Kindle | 1 | More Tinder | minor | Ember cap +1 | tune `embersMax` +1 |
| | 2 | Hot Coals | minor | Each Ember adds +3% to Flare | tune `flarePerEmber` +0.03 |
| | 3 | Twin Spark | notable | A tap has a 25% chance to plant 2 Embers | ks `twinSpark` |
| | 4 | More Tinder II | minor | Ember cap +1 | tune `embersMax` +1 |
| | 5 | Quick Fingers | minor | Taps +8% | mod `tap` 1.08 |
| | 6 | Slow Burn | notable | Each Ember burns for 0.1x your attack per second | ks `slowBurn` |
| | 7 | Hot Coals II | minor | Each Ember adds +3% to Flare | tune `flarePerEmber` +0.03 |
| | 8 | **Wildfire** | keystone | When a foe with Embers dies, its Embers jump to the next foe. [C] They spread to every foe in the pack at half the count | ks `wildfire` |
| Flare | 1 | Short Wick | minor | Flare cooldown -5% | mod `abilityCd` 0.95 |
| | 2 | Bright Flare | minor | Flare +10% (x22 attack, was x20) | tune `flare` +2 |
| | 3 | Afterglow | notable | After a Flare, +20% damage for 4s | ks `afterglow` |
| | 4 | Short Wick II | minor | Flare cooldown -5% | mod `abilityCd` 0.95 |
| | 5 | Spark | minor | +4% damage | mod `dmg` 1.04 |
| | 6 | Ready Lamp | notable | Auto-cast waits 1.5x the cooldown (was 2x) | tune `autoCd` -0.5 |
| | 7 | Bright Flare II | minor | Flare +10% | tune `flare` +2 |
| | 8 | **Kindling Storm** | keystone | Flare no longer uses up Embers, but its cooldown is 50% longer | ks `storm` |
| Glass | 1 | Spark II | minor | +4% damage | mod `dmg` 1.04 |
| | 2 | Clear Eye | minor | Crits come 5% more often | mod `crit` 1.05 |
| | 3 | Focused Lens | notable | Crit damage +25% | mod `critDmg` 1.25 |
| | 4 | Spark III | minor | +4% damage | mod `dmg` 1.04 |
| | 5 | Clean Cut | minor | Crit damage +10% | mod `critDmg` 1.1 |
| | 6 | Overkill | notable | Overkill damage carries to the next foe (the class's Stage C passive, early) | ks `overflow` |
| | 7 | Spark IV | minor | +4% damage | mod `dmg` 1.04 |
| | 8 | **Glass Lantern** | keystone | Ember cap 10 (was 5), each Ember adds +40% to Flare (was +30%), but your taps deal half | ks `glass` |
| Crown | - | **Everburn** | crown keystone | Each Ember burns for 0.2x your attack per second, and Flare plants 2 new Embers after it goes off | ks `everburn` |

### 3.3 Ranger (striker; taps set the Focus mark; Volley)

**Hearthstar: Keen Eye** (no effect).

| Arm | # | Star | Kind | Effect | Wiring |
|---|---|---|---|---|---|
| Hunt | 1 | Long Mark | minor | Focus lasts +2s | tune `markT` +2 |
| | 2 | Open Wound | minor | Marked foes take +5% | tune `mark` +0.05 |
| | 3 | Next in Line | notable | When a marked foe dies, the next foe starts marked for 4s | ks `nextMark` |
| | 4 | Open Wound II | minor | Marked foes take +5% | tune `mark` +0.05 |
| | 5 | Long Mark II | minor | Focus lasts +2s | tune `markT` +2 |
| | 6 | Boss Stalker | notable | +10% damage to bosses; a marked boss drops its unique 10% more often | mod `bossDmg` 1.1; `uniqueChance` 1.1 while marked |
| | 7 | Open Wound III | minor | Marked foes take +5% | tune `mark` +0.05 |
| | 8 | **Pack Leader** | keystone | The mark's bonus for your party doubles (+50%, was +25%), but you lose your own crit bonus on marked foes | ks `pack`; tune `mark`, `markCrit` |
| Volley | 1 | Quick Nock | minor | Volley cooldown -5% | mod `abilityCd` 0.95 |
| | 2 | Full Quiver | minor | Volley +1 arrow | tune `volleyHits` +1 |
| | 3 | Quiver Song | notable | The haste after Volley lasts +4s | tune `hasteT` +4 |
| | 4 | Quick Nock II | minor | Volley cooldown -5% | mod `abilityCd` 0.95 |
| | 5 | Hunting Call | minor | Companions +5% | mod `party` 1.05 |
| | 6 | Steady Draw | notable | Auto-cast waits 1.5x the cooldown (was 2x) | tune `autoCd` -0.5 |
| | 7 | Full Quiver II | minor | Volley +1 arrow | tune `volleyHits` +1 |
| | 8 | **Quickdraw** | keystone | Volley's cooldown is 40% shorter. It fires 6 arrows (was 10), each at 2.5x your attack (was 1.5x) | ks `quickdraw` |
| Deadeye | 1 | Steady Aim | minor | Crits come 5% more often | mod `crit` 1.05 |
| | 2 | Barbs | minor | Crit damage +10% | mod `critDmg` 1.1 |
| | 3 | Hawk Eye | notable | Your first hit on each foe always crits | ks `hawk` |
| | 4 | Fast Hands | minor | Taps +8% | mod `tap` 1.08 |
| | 5 | Barbs II | minor | Crit damage +10% | mod `critDmg` 1.1 |
| | 6 | Finisher | notable | Foes under 20% health take +30% from you | ks `finisher` |
| | 7 | Steady Aim II | minor | Crits come 5% more often | mod `crit` 1.05 |
| | 8 | **Deadeye** | keystone | You mark one foe at a time and the mark lasts until it dies. Your crits on it deal double | ks `deadeye` |
| Crown | - | **Rain of Arrows** | crown keystone | Every 10th tap fires a free 5-arrow volley at 1x your attack | ks `rain` |

### 3.4 Lightkeeper (support; taps bless companions; Rally Hymn)

**Hearthstar: Small Light** (no effect).

| Arm | # | Star | Kind | Effect | Wiring |
|---|---|---|---|---|---|
| Dawn | 1 | Lingering Light | minor | Blessings last +1s | tune `blessT` +1 |
| | 2 | Warm Light | minor | Each Blessing gives +2% more | tune `bless` +0.02 |
| | 3 | Morning Choir | notable | Blessing cap +1 | tune `blessMax` +1 |
| | 4 | Lingering Light II | minor | Blessings last +1s | tune `blessT` +1 |
| | 5 | Warm Light II | minor | Each Blessing gives +2% more | tune `bless` +0.02 |
| | 6 | Kind Hands | notable | Idle auto-play blesses 50% more often | tune `autoEff` +0.25 |
| | 7 | Warm Light III | minor | Each Blessing gives +2% more | tune `bless` +0.02 |
| | 8 | **Dawnbringer** | keystone | Blessing cap 6 (was 3) and each lasts 12s (was 6s), but each gives +12% (was +20%) | ks `dawn` |
| Hymn | 1 | Short Verse | minor | Rally Hymn cooldown -5% | mod `abilityCd` 0.95 |
| | 2 | Loud Verse | minor | Rally Hymn +5% (x1.45, was x1.4) | tune `hymn` +0.05 |
| | 3 | Refrain | notable | Rally Hymn lasts +3s | tune `hymnT` +3 |
| | 4 | Short Verse II | minor | Rally Hymn cooldown -5% | mod `abilityCd` 0.95 |
| | 5 | Loud Verse II | minor | Rally Hymn +5% | tune `hymn` +0.05 |
| | 6 | Steady Voice | notable | Auto-cast waits 1.5x the cooldown (was 2x) | tune `autoCd` -0.5 |
| | 7 | Teacher | minor | Companion XP +5% | mod `compXp` 1.05 |
| | 8 | **Sanctuary Hymn** | keystone | Rally Hymn lasts 16s (was 8s), but its cooldown is 60s (was 40s). [C] The Hymn heals 5% max HP per second | ks `sanctuary` |
| Martyr | 1 | Gift | minor | Companions +5% | mod `party` 1.05 |
| | 2 | Gift II | minor | Companions +5% | mod `party` 1.05 |
| | 3 | Lantern Share | notable | The damage you give up goes 10% further | tune `lkShare` +0.1 |
| | 4 | Gift III | minor | Companions +5% | mod `party` 1.05 |
| | 5 | Wider Glow | minor | Your aura +2% (companions +12%, was +10%) | tune `lkAura` +0.02 |
| | 6 | Vigil | notable | +8% gold and +8% away gains | mod `gold` 1.08, `offline` 1.08 |
| | 7 | Gift IV | minor | Companions +5% | mod `party` 1.05 |
| | 8 | **Martyr's Light** | keystone | You deal no damage at all. Your companions deal +40% | ks `martyr`; hero-only x0, `party` 1.4 |
| Crown | - | **Lamp of Ages** | crown keystone | While Rally Hymn is up, Blessings do not fade, and the Hymn adds a Blessing every 2s | ks `ages` |

### 3.5 Power budget

| Part | Rough effective damage at the push zone |
|---|---|
| All minors in 3 arms (15) | +35 to +45% |
| All notables (6) | +20 to +30% |
| 2 keystones, played to | +10 to +20%, plus a new way to play |
| Bridges (5) | +10% |
| **A finished 38-point build** | **+60 to +90%** (about 1.3 to 1.7 zones) |

Keystones are not meant to be the biggest numbers. Several have a cost (Oathsworn, Glass Lantern,
Pack Leader, Martyr's Light, Kindling Storm), so a player picks them for how they play.

---

## 4. UI on a 360px phone

**Entry:** the hero card on the Party tab gets a **Stars** button with a gold badge when points
are unspent ("Stars 3"). The level-up toast adds "+1 star point" every third level.

**Star map sheet** (full screen, 16px gutters):

```
[<]  WARDEN STARS            4 of 17 points left
     (Farm)(Push)                          [Reset]      layout chips 96 x 36; hold to rename
+-------------------------------------------+
|                                           |
|             328 x 328 star map            |
|                                           |
+-------------------------------------------+
Deep Guard                      notable . 2 points
Guard cap +2.
                                   [ Light (2) ]        48px
(List view)                                             toggle
```

- **Stars:** minor 12px, notable 18px, keystone 24px, drawn in the class's role colour (Warden
  steel blue `#3E63C9`, Lanternmage violet `#8A4FC9`, Ranger green `#3E8A4E`, Lightkeeper gold
  `#F2C14E`). Lit stars glow (the lighting pass). Stars you can light now have a white ring. Locked
  stars are dim. Lines between lit stars are gold, others 40% grey.
- **Tap a star:** it is selected and its detail shows under the map: name, kind, cost, effect, and
  a dim "[C] With party combat: ..." line where there is one. Button: Light, Unlight, or the
  reason it is locked ("Light 5 stars in Bulwark first").
- **Keystone limit:** with 2 lit, other keystones show a small lock and "2 of 2 keystones".
- **Reset** asks in-page: "Unlight every star in Farm? It is free."
- **List view:** the same stars as grouped rows (Hearthstar, arm by arm, crown), 56px each. It is
  the accessible view and the fallback on very small screens.
- **Reduced motion:** no twinkle, no glow pulse; lit stars are a steady bright fill.

---

## 5. Save state

```js
registerState('stars', {
  v: 1,
  maps: {},    // class id -> { layouts: [{ name: 'Farm', lit: [] }, { name: 'Push', lit: [] }], active: 0 }
  seen: 0      // points already announced (for the badge)
});
```

- Points are derived (`starPoints()`), never stored.
- On load, a layout is checked: unknown star ids are dropped, and if a layout spends more than the
  points (only possible if data changes), stars are unlit from the tips until it fits. A toast
  says so. Nothing else can make a layout invalid, because points only go up.
- New field only. `check.mjs`: fixtures load with empty maps and unchanged `totalDps()`.

---

## 6. Balance targets

| # | Target | Pass band |
|---|---|---|
| S1 | First point / first keystone (9 points) / second keystone (18 points), mixed, active | 3 min / 2 to 4h / day 4 to 10 |
| S2 | Second keystone, idle-first player (2 check-ins a day) | week 2 to 3 (needs question 1) |
| S3 | A finished 2-keystone build with its arms' notables (about 25 points) | 4 to 8 weeks |
| S4 | Full 38-point build | 3 to 6 months (needs Great Lanterns 2 and 3) |
| S5 | Power of a 38-point build | +60 to +90% effective damage at the push zone |
| S6 | Every keystone, in a layout built for it, vs the class's best layout: time to zone 20 and Deepwell median depth | within 10% (no dead keystones) |
| S7 | Farm vs Push layouts | Farm: at least +10% away income; Push: at least +10% boss damage |
| S8 | Class spread with stars | party T3 still passes (0.85 to 1.15) |

The sim gets `--stars farm|push|<keystone ids>`, which lights the cheapest path to the named
keystones and then the class's damage minors.

---

## 7. Build plan

The vision places Constellations in wave 5. Every star has a pre-Stage-C effect, so it can ship any
time after Stage A. Wave 4 or 5 both work; wave 5 lets the [C] parts ship with it.

| Wave | Task | Owns | Small edits in | Depends on |
|---|---|---|---|---|
| 5 | S1 Data: 4 maps (31 stars each), coordinates, edges, effects, keystone flags, texts | `src/js/27-data-stars.js` (core, data only) | - | - |
| 5 | S2 Core: `starPoints`, `greatLanternsLit`, light/unlight/reset, connectivity, keystone limit, layouts, the "when" rule, modifier and bonus wiring, load check | `src/js/55-constellations.js` | `src/js/55-party.js` (read `tune:` bonuses in one `tune(k)` helper, `ks:` flags at the class tap, Flare, Volley, Blessing and Hymn code, `autoCd` in auto-cast; shared with the Deepwell's boons) | B0, A1 |
| 5 | S3 UI: Stars button and badge, star map canvas, detail panel, list view, layout chips, reset confirm | `src/js/75-constellations.js`, `src/styles/60-constellations.css` | `src/js/75-party.js` (Stars button on the hero card, with the B5 owner) | S2 |
| 5 | S4 [C] parts: taunts, armour, staggers, pack spread, heals | `src/js/59d-stars-combat.js` | - (C1 and C2 hooks) | C1, C2, S2 |
| 5 | S5 Sim: `--stars`, S1-S8 | `tools/sim.mjs` | - | S2 |

**Parallel safety:** the Deepwell (W2) and Constellations (S2) both need the `tune()` edit in
`55-party.js`. Whichever merges first adds it; the other only reads it.

---

## 8. Open questions for the owner

1. **Hero XP while away.** Today the hero earns no XP offline, so a mostly idle player's star
   points stall at around level 30. Recommended: **yes, 50% of the hero XP from away kills**, the
   same as the away gold rate, capped by the away cap. Hero levels also add 5% damage each, so the
   sim must re-check T1 and T2.
2. **At most 2 keystones lit at once.** It keeps every late build a real choice and stops the map
   from becoming "take everything". Recommended: **yes**.
3. **Points only from hero levels and Great Lanterns** (1 per 3 levels, 4 per Lantern). No Codex,
   Deepwell or shop source. Recommended: **yes**. It keeps the tree tied to the adventure and
   keeps the other systems from turning into damage.
