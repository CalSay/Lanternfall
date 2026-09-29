# Classes 2.0: three base classes and six evolutions (CL1)

Status: design spec CL1, written 2026-09-28, finished after a restart (review pass: owner names kept exactly, Sanctuary restored, numbers checked against core-2). It fills in the class and evolution kits that the shared
rulebook [core-2.md](core-2.md) leaves to CL1 (core-2 9.1): taps, `ab1`, `ab2`, Finishers, passives and
core mechanics with coefficients; class base stats; the trials; the class migration; star maps per class;
hero base types (`dt`) and signature statuses; Bonds that react to the class; the Tactics unlock order.

Sources: plan-4.md 2-3 (owner decisions), roadmap-review.md 2.1-2.2, the wave log to 2026-09-28 (CORE-G
decisions: the Lanternmage's base type is **fire**, the Warlock adds dark fire and curses, the Lightkeeper holy;
"reaction" is the player word; fatigue merges into Rested), lore.md 2.2-2.4 and 5.4, formation.md,
constellations.md, and the code as it is today (`55-party.js` `HERO_CLASSES`, `56b-synergy.js`,
`57e-constellations.js`, `59-combat.js`).

How this file relates to core-2:

- **It uses core-2's ids, formulas, buckets, statuses, reactions, caps and the ability data shape.** Every
  number here is a value inside a core-2 range, or it is listed in section 8.2 as a proposed change-log
  line (also added to core-2 section 10 as "proposed, pending sign-off").
- **Numbers are starting values** for `tools/sim.mjs`. BAL3 tunes them per slice. Names and ids are not
  starting values: they are fixed once S2/S3 ship.
- `P` is the unit's hit power (core-2 0); "3 P" means 3 x P, then the target side.

Owner rules this spec obeys (plan-4 2.9, 3.1-3.6):

1. **Three base classes by armour weight**: Warrior (heavy), Ranger (medium), Lanternmage (light).
2. **Two first evolutions each, one damage and one utility**, owner-named: Reaver / Warden, Adder /
   Trapper, Warlock / Lightkeeper. Each one feels special, is clearly stronger than its base (about +35%), and
   changes how the game plays, idle and active.
3. **Utility paths lift the party's progress**, not just its survival. A tank or support is never the
   weaker pick.
4. **Permanent choice, costly respec** through the Mirror of Embers.
5. **The trial opens at the Region 1 boss**, solo. (The "level 60+" in plan-4 does not fit today's curve:
   see 3.1 and decision D1.)
6. **Room for a second evolution tier** after 1.0 in the save, the screens and the star maps.
7. **Nothing lost** in the migration from the four old classes.

Design rules of this spec:

1. **One verb per class, one twist per evolution.** The Warrior hits heavy, the Ranger marks, the Lanternmage
   burns. Each evolution bends that verb: the Reaver's heavy hits build Fury, the Warden's blocks store
   light; the Adder's marks carry Venom, the Trapper's are laid on the ground; the Warlock's Embers
   curse, the Lightkeeper's taps bless.
2. **Idle is a real way to play every kit.** Every mechanic runs on auto-taps and auto-cast. Active play
   wins through timing (Stagger, reaction windows, interrupts, parries), never through a penalty on idle.
3. **Every evolution drives at least one reaction and counters at least one elite trait**, and each type
   has at least two heroes, so a line-up is a real answer to a zone.
4. **The Lanternbearer's class decides the party's shape.** The class fills one role; the heroes fill the
   other two. A utility evolution frees a hero slot for damage; a damage evolution asks for sustain.

---

## 0. The shape in one table

| | Warrior | Ranger | Lanternmage |
|---|---|---|---|
| Weight, home | heavy, Front | medium, Middle | light, Back |
| Role (combos, slot jobs) | tank | striker | caster |
| Base type | physical | physical | fire |
| Tap (verb) | **Heavy hit** (Grit) | **Focus** (Mark) | **Ember** (Embers) |
| `ab1` | Shield Wall | Volley | Lantern Flare |
| Finisher | Hammerfall | Kill Shot | Lanternburst |
| Damage evolution | **Reaver**: Fury, Bleed, embers; *Rend* | **Adder**: Venom ramp; *Deathcap* | **Warlock**: Curse, dark fire; *Witchfire* |
| Utility evolution | **Warden**: Bulwark, holy sparks; *Stand Fast* | **Trapper**: traps, Mark, Root, Chill; *Snare Field* | **Lightkeeper**: Given Light, Blessing; *Sanctuary* |
| Evolution role | Reaver: striker (Front); Warden: tank | Adder: striker; Trapper: caster (Middle) | Warlock: caster; Lightkeeper: support |

The evolution role is what the formation layer reads (combos, slot jobs, the planner, `heroFloor`). The
weight and home slot never change with an evolution.

---

## 1. The base classes

### 1.1 Shared rules

- **The Lanternbearer's P** = `heroAtk()` x its buckets (core-2 1.2). It swings at `aps()` (1-5 a second
  with Swift). Crit: base 8%, x4 (core-2 1.1; unchanged). Rangers add 7% crit (15%, like strikers).
- **Taps** are the class verb. A tap also parries (the last 0.8 s of a `heavy` warning) and dodges (a
  `zone` warning), as core-2 4.1 says. Idle auto-play taps every 2 s after 4 s without a tap, at
  `autoEff` strength (today 0.5; CB2's question 9 decides; section 8.1 gives CL1's view).
- **`ab1` is always there.** It auto-casts from zone 10 (today's `autoCastZone`), as today.
- **Finishers** are data now and live with S6 (the stagger bar). Each class has one; its evolution
  replaces it.
- **Class auras** are today's `HERO_CLASSES[c].aura`: a class-wide lift for heroes of one role. They sit
  with the slot jobs in bucket Y, outside the +40% synergy cap (as today; change-log line 8.2-6).
- **Class meters** (Grit, Embers, and the evolutions' Fury, Bulwark, Blessing) are not statuses. Each
  feeds one named timed buff (bucket T) whose value follows the meter, so core-2's "a named buff never
  stacks with itself" holds (change-log line 8.2-5). Embers are a per-foe counter shown as pips on the
  focus foe, not a status badge.

Base stats (bucket C; HP is x the role scale in `59-combat` `hp`, as `heroHp` today):

| Class | HP scale | Armour | Block | Threat | Crit | Other |
|---|---|---|---|---|---|---|
| Warrior | 12 (today's Warden) | 30 | 10% (new) | x6 | 8% | takes `tankDr` (tank role) |
| Ranger | 6 (was 5) | 10 (was 0) | - | x1 | 15% | - |
| Lanternmage | 4 | 0 | - | x1.2 | 8% | `area` 15% (today's `lmSplash`), `ward` 10% |

The Ranger's HP and armour rise a little because medium armour now means something (core-2 5.1).

### 1.2 Warrior (heavy, Front, physical)

**Fantasy.** You stand between the lamp and the dark, so the dark hits you first. The Order's oldest
calling, "Wardens hold", is now the Warrior; the Warden is what a Warrior becomes when holding is all
they want (lore.md 2.4: the callings become lore words, core-2 7.2).

**Choice card line:** "Stand in front. Nothing gets past." (today's Warden pitch, kept.)

**Tap: Heavy hit** (`heavy`). 1.3 P physical, tag `heavy`. The foe turns on you (threat x3 on that hit).
Adds 1 **Grit**.

**Grit** (core mechanic; today's "guard stacks", renamed so it never clashes with the Guard status).
Up to 5 Grit, each lasting 10 s (a new one refreshes them all): **3% more damage and 1% less damage
taken per Grit** (named buff "Grit", bucket T). Idle taps add Grit at `autoEff` strength, so an idle
Warrior sits at about 5 Grit worth half.

**`ab1`: Shield Wall** (kept from the Warden: players know it).

```js
{ id: 'shieldwall', slot: 'ab1', cls: 'warrior', cd: 30, target: 'party', type: 'phys',
  tags: ['taunt', 'shield'],
  fx: [['buff', 'shieldwall', 6],          // Guard "Shield Wall": the party takes 50% less (a dr, core-2 1.4)
       ['buff', 'wallEmpower', 6],         // Empowered "Shield Wall": the party deals 20% more (bucket T)
       ['taunt', 3],                       // every foe in reach, bosses included (core-2 3.3)
       ['stagger', 10]] }
```

Today it is "60% less, 30% more". Core 2.0 lowers it to 50% / 20% because foes hit 2-3x harder and the
80% floor applies (core-2 1.4); the extra "blocks the next boss heavy hit on you" stays as a rider.
CB2 decides whether the 3 s boss-timer pause stays (it belongs to the timer question 12).

**Finisher: Hammerfall** (`hammerfall`). 7 P physical, `heavy`, `finisher`. Knocks the pack back: every
foe's next attack comes 1 s later. Fills Grit to 5.

**Passives.**
- **Heavy Hands:** your heavy hits deal x2 to shields. (Core-2's Shielded counter, 6.5.)
- **Shieldmates** (aura, today's): tanks in your party get +40% HP and +20 armour.

**Idle vs active.** Idle: the Warrior holds Front, auto-taps keep Grit up at half strength, Shield Wall
fires on cooldown. Active: tap heavy hits to hold 5 full Grit, parry every `heavy` warning (the tap is the
parry), and hold Shield Wall for the slam or the boss's signature.

**Why pick it.** The easiest class to hold a line with: it fills the tank role itself, so both heroes can
be damage or one can be a healer. Its heavy hits trigger **Shatter** on Chilled foes. It beats Shielded
elites.

### 1.3 Ranger (medium, Middle, physical)

**Fantasy.** Rangers walked the dark stretches between lamps and found the weak spot in what waited
there (lore.md 2.4). You read the fight and point at what must die.

**Choice card line:** "Find the weak spot. Hit it hard." (kept.)

**Tap: Focus** (`focus`). 1.0 P physical. Applies **Mark** to the foe at **25%** for 8 s (core-2 3.1 lets
a source set 15-30%; section 8.1 Q1 explains 25%). One Focus Mark at a time: a new Focus moves it.

**Keen Eye** (core mechanic). Your crit chance is x1.5 against a foe you Marked (today's `markCrit`).

**`ab1`: Volley.**

```js
{ id: 'volley', slot: 'ab1', cls: 'ranger', cd: 30, target: 'single', type: 'phys',
  tags: [],
  fx: [['dmg', 1.5, { hits: 10, over: 2, spread: 0.5 }],  // 10 arrows over 2 s; with 3+ foes half go to others
       ['buff', 'volleyQuick', 8]] }                       // Quickened "Volley": the party attacks 50% faster
```

The arrow spread is new (packs of 8-10 need it); against a lone boss all 10 arrows hit it. The haste is
today's 50%, now a real attack-speed buff (inside the x2 swing-speed cap).

**Finisher: Kill Shot** (`killshot`). 7 P physical, `heavy`, `finisher`. Marks the foe at 30% for 8 s
(the stronger Mark stays).

**Passives.**
- **Light Feet:** the Ranger takes 20% less from `dive` and `slam` hits (medium armour, quick feet).
- **Hunters' Company** (aura, today's): strikers in your party get +10% crit chance and +50% crit damage.

**Idle vs active.** Idle: auto-Focus keeps the focus foe Marked (at `autoEff` strength on the Mark value,
as today); Volley on cooldown. Active: Mark the right foe (the healer, the elite, the boss rather than an
add), and fire Volley into Stagger.

**Why pick it.** The steadiest damage, and the Mark lifts every hero's hits. Mark plus a holy hero is
**Judgement**, which heals the party. The Ranger is the class that makes other people better at killing.

### 1.4 Lanternmage (light, Back, fire)

**Fantasy.** Lanternmages spent a little lantern light as flame and threw it; the Order did not trust
them, so most were hedge-taught from old books like Pip's (lore.md 2.4). Fire is ordinary; lantern light
spent as fire is not, and the dark still flinches from it.

**Choice card line:** "Burn the whole pack at once." (kept.)

**Tap: Ember** (`ember`). 1.3 P fire. Plants 1 **Ember** on the foe (up to 5).

**Embers** (core mechanic). A per-foe counter that Lantern Flare spends. Shown as up to 5 flame pips over
the focus foe's bar.

**`ab1`: Lantern Flare.**

```js
{ id: 'flare', slot: 'ab1', cls: 'mage', cd: 25, target: 'splash', type: 'fire',
  tags: ['aoe'],
  fx: [['consume', 'embers'],              // returns n (0-5)
       ['dmg', 20, { perStack: 0.3 }],     // 20 P, +30% per Ember (50 P at 5)
       ['apply', 'burn', 1]] }             // on the target and on every foe the splash reaches
```

The numbers are today's (20x attack, +30% an Ember). The Burn on every foe the splash reaches is new:
with Burn's spread on death (core-2 3.1), a Flare into a swarm keeps burning after the first kill.

**Finisher: Lanternburst** (`lanternburst`). 7 P fire, `heavy`, `finisher`. Plants 5 Embers on the foe
and Burns every foe in the pack.

**Passives.**
- **Lantern Glass:** your hits splash 15% to the rest of the pack (`area`, today's `lmSplash`).
- **Kindred Sparks** (aura, today's): casters in your party get +30% attack.

**Idle vs active.** Idle: auto-taps plant Embers at half rate, Flare fires on cooldown with 2-3 Embers.
Active: tap to 5 Embers before each Flare, and Flare into Stagger or a reaction window (x1.25).

**Why pick it.** The best pack clearer: splash, Burn on the whole pack, Burn that spreads. Fire beats
plants and **Ice-Clad** elites, and Burn plus any Venom is **Blight**. The cost: 4 HP scale, so a
Lanternmage wants a tank in Front.

### 1.5 The base classes against each other

| | Warrior | Ranger | Lanternmage |
|---|---|---|---|
| Own damage share of the party (Region 1, balanced trio) | low (about 17%) | high (about 50%) | middle, rising with pack size |
| Best at | holding, bosses that hit hard | single targets, bosses, elites | packs, swarms |
| Reaction it feeds | Shatter (heavy) | Judgement (Mark) | Blight (Burn) |
| Elite trait it beats | Shielded | (none alone: its Mark speeds any burst) | Ice-Clad |
| Weak spot | spirits resist physical | spirits resist physical | the Emberwaste resists fire |
| Balanced trio (planner default) | Warrior (F), striker (M), support (B) | tank (F), Ranger (M), support (B) | tank (F), support (M), Lanternmage (B) |

The Ranger "beats no trait alone" on purpose: its answer to every trait is to point the party at it. Its
two evolutions each beat one (6.5 of core-2).

---

## 2. The six evolutions

### 2.1 What every evolution gives

On choosing an evolution the Lanternbearer gets, at once:

1. **A core mechanic** (a passive rule that changes what the tap and `ab1` do).
2. **Ability slot 2** (`ab2`), the evolution's named ability.
3. **A new Finisher** (replaces the base one).
4. **An evolution stat line** (bucket C) and changed base stats.
5. **A title, a look and a lamp colour** (the lamp is the class's visual anchor on the stage).
6. **A party role** that the formation layer reads, and **Bonds** that react to it.
7. **The evolution ring** on the star map (section 4) and **Tactics** rule slot 2 (section 3.6).

**What it keeps.** An evolution keeps everything of its base class that its section does not say it
*replaces*: the tap (unless a `var` changes it), `ab1`, the base core mechanic, the base passives and the
base class aura. Its **Stats** line always replaces the base stats. So an Adder still has Keen Eye and Hunters' Company, a Warden still has Grit and
Shieldmates, a Warlock still plants Embers and has Kindred Sparks. What each evolution replaces:

| Evolution | Replaces |
|---|---|
| Reaver | Grit (by Fury), the Warrior's stats, Hammerfall |
| Warden | the Warrior's stats, Hammerfall |
| Adder | Kill Shot |
| Trapper | the Focus Mark value (30%, not 25%), Kill Shot |
| Warlock | Lanternburst; Lantern Flare gains a Curse (`var`) |
| Lightkeeper | the Ember tap (by Blessing), Lantern Flare (by Rally Hymn, `var`), Embers, Lanternburst |

### 2.2 The power spike: how it is measured and split (answers core-2 Q4)

**Measure.** "Effective power" is what the sim can see: the push-zone gain of the same save, evolved vs
not, with the planner's best trio for each. Past zone 27 foe HP grows x1.22 a zone (`PACE.hpLate`), so
**+35% effective power is about 1.5 zones**, and it pays for most of the x1.7 Region 2 step
(`PACE.regionStep`) that starts at zone 35. That is why Region 2 is tuned for an evolved Lanternbearer.

```
effective = (party damage, evolved / base) x (hold, evolved / base)
hold      = party EHP / incoming damage at the push zone (counts only where hold binds the push;
            the sim reads it from partyHoldEstimate().margin)
target    = 1.30 to 1.40 for every evolution (BAL3 band CP6)
```

Damage evolutions get their spike mostly as party damage at equal hold. Utility evolutions get it as a
smaller party damage lift plus hold. The Lanternbearer's own damage moves much more than the party's,
because it is only part of the party:

| Evolution | Own damage vs base | Party damage vs base | Hold vs base | Effective | Where it comes from (buckets) |
|---|---|---|---|---|---|
| Reaver | about x2.6 | x1.35 | x1.00 | 1.35 | role floor tank -> striker (`heroFloor.reaver`), C x1.10, T Fury up to +20%, `ab2` Rend + Bleed + Cinder Edge |
| Warden | about x1.2 | x1.12 | x1.22 | 1.37 | C: HP x1.25, armour, block; T: Stand Fast Empower; stagger aura (more Stagger uptime, x1.5); Holy Sparks |
| Adder | about x1.65 | x1.33 | x1.00 | 1.33 | C x1.10 and status x1.25, Venom ramp (status damage), `ab2` Bloom, Patient Hunter |
| Trapper | about x1.1 | x1.18 | x1.15 | 1.36 | target side: pack Mark (vuln), Focus Mark 30%; Chill and Root (hold); traps; reactions it enables |
| Warlock | about x1.8 (packs) | x1.35 | x0.98 | 1.32 | C x1.10 and `area` +20%, Curse (stores 20%, detonates), `ab2` Witchfire, Held Light charge |
| Lightkeeper | about x0.5 (gives it away) | x1.20 | x1.15 | 1.38 | Given Light (moves own damage to heroes), Keeper's Light (Y), T Blessing and Rally Hymn, Sanctuary, heal and ward (hold) |

The biggest single lever is `heroFloor` (formation.md 4.2): the Lanternbearer's damage floor as a share of
a fielded hero's power in its role. Starting values per evolution:

```
heroFloor = { warrior: 1.0, ranger: 0.7, mage: 1.0,
              reaver: 0.62, warden: 1.0, venomstalker: 0.75, trapper: 0.7, warlock: 1.0, priest: 0 }
ROLE_D    = { tank: 0.5, striker: 1.82, caster: 1.0 (x1.45 on packs), support: 0 }   (formation 4.2, unchanged)
```

The Reaver's floor is lower than the Adder's because it moves from the tank's 0.5 to the striker's
1.82 (x3.6) and keeps a tank's HP; 0.62 x 1.82 = 1.13 per power is about x2.3 its Warrior floor before
the kit.

### 2.3 Reaver (Warrior, damage)

**Fantasy.** Wardens held; Reavers went out after the dark. To reave is to take back by force, and the
Reaver takes back the road one Front column at a time. The worse the fight gets, the harder they hit.
Their lamp burns red-orange, fed by the fight (lore: fire is ordinary; a Reaver does not care, it cuts).

**Choice card:** "Hit harder the worse it gets." - Every heavy hit builds Fury. - Rend cleaves the front
and makes it bleed. - Best with a healer behind you.

**Title:** the Red Lamp. **Role:** striker in Front (the Vanguard slot job: +damage). **Type:**
physical, adds fire (embers on cleaves).

**Stats** (replace the Warrior's): HP scale 12, armour 25, block 5%, threat x4, takes **half `tankDr`**
(20% less, not 40%: heavy armour, but no longer a shield-bearer). **Evolution line (C): "Reaver's Edge:
10% more damage."**

**Core mechanic: Bloodlust** (the owner's name: hits build Fury, and lower HP hits harder). Two rules:
Fury and Blood Price.

**Fury** (0-100; replaces Grit).
- +8 per Heavy hit (auto-taps +4), +3 per hit taken, +15 per Rend, +5 per foe killed.
- After 3 s with no hit landed or taken it drains 10 a second (so it resets between packs, not mid-fight).
- **Every 10 Fury: 2% more damage** (named buff "Fury", bucket T, up to 20%).
- **At 50+ Fury, Cinder Edge:** your Heavy hits and Rend also deal **0.5 P fire to every other foe in the
  enemy Front column** and apply **Burn** to the target. (This is the "embers on cleaves" of core-2 2.2.)
- **At 100 Fury, Unstoppable:** Stuns and Roots on you fall off and cannot land for 4 s (once per 20 s).

**Blood Price.** Below 50% HP you deal **20% more damage** (bucket C, conditional) and your hits heal
you for **4% of the damage they deal** (at most 3% of max HP a second). It is what keeps a Front striker
standing without a tank.

**Passives.** Heavy Hands (kept: heavy hits x2 to shields). The Warrior aura Shieldmates is kept: tank
heroes you field get +40% HP and +20 armour (useful when a tank hero takes Front and the Reaver the Middle).

**`ab2`: Rend.**

```js
{ id: 'rend', slot: 'ab2', cls: 'reaver', cd: 14, target: 'line', type: 'phys',
  tags: ['heavy'],
  fx: [['dmg', 2.5],                 // every foe in the enemy Front column
       ['apply', 'bleed', 3],        // Bleed ignores armour (core-2 3.1)
       ['stagger', 10],
       ['meter', 'fury', 15]] }      // new verb, change-log 8.2-4
```

At 5 Bleed on a foe, Bleed is 0.4 P a second for 6 s. A Rend every 14 s keeps 3-5 stacks up on the front
column. With Cinder Edge on, Rend is also a fire hit on each foe it touches (Ice-Clad needs 3).

**Finisher: Red Harvest** (`redharvest`). 8 P physical, `heavy`, `finisher`. Consumes the foe's Bleed:
+0.4 P per stack (10 P at 5 stacks). Fills Fury to 100.

**How play changes.**
- *Idle:* the Reaver stands in Front, auto-taps and hits taken build Fury to 50-70, Rend fires every
  14 s, Blood Price self-heals when it matters. Idle Fury sits lower than active (about +12% vs +20%).
- *Active:* keep Fury at 100 with heavy taps, parry for free Fury (a parry is a hit landed), fire Rend
  into Stagger for x1.5 x1.25, and cash Bleed in with Red Harvest.
- *What is new:* the Warrior's class becomes a damage class without leaving Front. The party's shape
  flips: the Reaver wants **a healer** and a **frost hero** more than a tank.

**Party role and heroes.**
- Default trio: **Reaver (F), a frost or poison striker/caster (M), a healer (B)**; or a tank hero in
  Front and the Reaver in the Middle (10% off-slot cost) for walls.
- Shines with: **Hesketh, Elowen** (sustain for a Front striker), **Thessaly, Kestrel** (Chill:
  every Reaver heavy hit becomes a Shatter), **Isolde, Corvin** (Venom + the Reaver's Burn = Blight),
  **Aldric** in the Middle (Intercept covers the Reaver's worst moments).
- Bonds: The Borrowed Sword (Tobin), The Banner (Aldric) with a Reaver line; new **Two Axes** (Bram).

**Reactions it drives.** Shatter (many heavy hits: every tap, Rend, the Finisher); Blight (Cinder Edge
Burn with a Venom hero). **Elite traits it beats:** Shielded (heavy x2), Ice-Clad (Cinder Edge fire
hits), Enraged (burst: Fury at 100).

**Visual identity** (for CHAR1 and art): the Warrior's plate, scorched and red-lacquered at the edges; a
two-handed cleaver-axe whose edge glows ember orange above 50 Fury; a torn short cape; the lamp hangs at
the hip and burns red-orange, brighter with Fury (reduced motion: a fixed bright lamp, no flicker).
Silhouette leans forward. Palette: iron, soot, ember orange (#D55E00 family, the fire colour).

**Power spike split** (2.2): own damage about x2.6, party damage x1.35, hold x1.00, effective 1.35.
Own damage: most of it is the role floor (a striker's share instead of a tank's, about x2.0 once the kit
is counted against it), then Reaver's Edge (C x1.10), Fury (T, about x1.12 idle, x1.20 active) and
Rend, Bleed and Cinder Edge. Party: the Lanternbearer goes from about a sixth of a Warrior party's damage
to about two fifths, which is x1.30-1.35 on the party; BAL3 sets `heroFloor.reaver` to land 1.35. Hold
stays level: half `tankDr` is paid back by Blood Price's self-heal and the healer the trio now fields.

### 2.4 Warden (Warrior, utility)

**Fantasy.** "Hold the road." The Order's first calling, taken all the way: the Warden holds so well that
the dark breaks itself on them, and every blow they stop becomes lantern light thrown back. Their lamp is
set into the boss of the shield and burns white-gold (holy).

**Choice card:** "Nothing gets past. Nothing." - Blocked hits are stored as light. - Stand Fast pulls every
foe onto you and gives the light back. - Your party staggers bosses faster.

**Title:** the Holdfast. **Role:** tank (Hold the Line in Front). **Type:** physical, adds holy (procs on
blocks and counters).

**Stats** (replace the Warrior's): HP scale 15, armour 45, **block 25%**, threat x8, full `tankDr`.
**Evolution line (C): "Warden's Mail: 25% more HP."**

**Core mechanic: Bulwark** (0-10; Grit stays, the Warden has both).
- Each hit you **block** stores 1 Bulwark; a **parry** stores 3; a hit you take for an ally (cover,
  Intercept-style jobs) stores 1.
- Each blocked hit also throws a **Holy Spark**: 0.3 P holy to the attacker. It is a holy hit: on a Marked
  foe it triggers **Judgement**; on a Cursed elite it strips its aura (core-2 6.5).
- Bulwark does not drain in a fight; it drains 1 a second between packs.

**Oath of the Order** (passive, aura; bucket Y outside the cap like the other class auras).
- The whole party's heavy hits, parries and interrupts fill **30% more stagger** (`stag`, inside the +50%
  cap). More Staggers means more x1.5 windows for everyone and more Finishers.
- While the Warden stands, **the Middle and Back take 10% less damage** (a `dr`).

**`ab2`: Stand Fast.**

```js
{ id: 'standfast', slot: 'ab2', cls: 'warden', cd: 18, target: 'pack', type: 'holy',
  tags: ['taunt', 'shield'],
  fx: [['taunt', 4],                        // every foe in reach, bosses included
       ['buff', 'standfastGuard', 4],       // Guard "Stand Fast": the Warden takes 30% less
       ['consume', 'bulwark'],              // returns n (0-10)
       ['dmg', 0.6, { perStack: 1, base: 0 }],  // 0.6 P holy per Bulwark, to every foe
       ['shield', 0.15, { perStack: 1, base: 0, to: 'party' }],  // 0.15 P per Bulwark to each member (cap 40% max HP)
       ['stagger', 3, { perStack: 1, base: 0 }],
       ['buff', 'standfastEmpower', 6]] }   // Empowered "Stand Fast": the party deals 15% more
```

At 10 Bulwark: 6 P holy to every foe, a shield on everyone, 30 stagger on the boss. Because it hits every
foe, **Stand Fast interrupts every cast bar on the field** (inside CB2's limit on boss signature
interrupts) (core-2 4.4: any Lanternbearer ability that
hits a caster interrupts it), which makes the Warden an answer to Summoner elites and healers too.

**Finisher: Oathstrike** (`oathstrike`). 8 P holy, `heavy`, `finisher`. Shields the party for 10% of
max HP, taunts every foe for 3 s, stores 5 Bulwark.

**How play changes.**
- *Idle:* the Warden blocks a quarter of all hits, Bulwark fills, Stand Fast fires every 18 s with 4-8
  stored, the party gets a steady Empower and shields. A Warden party idles 1-2 zones deeper than a
  Warrior party.
- *Active:* parry for 3 Bulwark each, hold Stand Fast for the boss's signature cast (it interrupts) or for
  Stagger (the Empower and the holy burst both land in the window), and spend the Finisher's shield on
  the slam that follows.
- *What is new:* the tank becomes the party's stagger engine and its biggest holy source.

**Party role and heroes (utility lift).**
- Default trio: **Warden (F), two damage heroes** (a striker in the Middle, a caster in the Back); the
  Warden's sustain often replaces the healer from Region 2 on.
- Shines with: **Wren** (her Marks + Holy Sparks = Judgement: the party heals itself), **Kestrel, Isolde,
  Corvin, Pip, Oriel, Morwen** (the damage it frees a slot for), **Grenna, Bram** (heavy hits fill the
  faster stagger bar).
- Bonds: The Borrowed Sword (Tobin), The Banner (Aldric) with Warden lines; new **The Lampwardens' Oath**
  (Maren).
- **Lift target:** party damage x1.12 and hold x1.22 over a Warrior in the same trio; with two damage
  heroes instead of a tank + one, the planner's best Warden trio beats the best Warrior trio by 1.3+ zones.

**Reactions it drives.** Judgement (Holy Sparks and Stand Fast on Marked foes); Shatter (heavy taps).
**Elite traits it beats:** Cursed (holy hits strip it), Shielded (heavy x2), Summoner (Stand Fast
interrupts), divers (taunt).

**Visual identity:** heavier plate than the Warrior, a tall kite shield with the lamp built into its boss
(white-gold light, #F0E442 holy family), a short mace or blade, a tabard with the Order's old lamp sign.
Blocks flash a small sun icon (reduced motion: the icon only). Silhouette: square, planted, shield first.

**Power spike split** (2.2): own damage about x1.2, party damage x1.12, hold x1.22, effective 1.37. From:
Warden's Mail (C, HP x1.25), armour 45 and block 25% (C), Oath of the Order (Y: back-line damage taken
x0.9, stagger +30%, worth about x1.05 party damage through more x1.5 windows), Stand Fast's Empower (T,
15% for 6 s in 18: about x1.05), Holy Sparks and Stand Fast's holy damage (about x1.02).

### 2.5 Adder (Ranger, damage over time)

**Fantasy.** The Ranger who learned from the Spore Garden what the dark learned first: a slow poison
beats a fast blade. They walk the dark stretches with a shaded lamp, a green glass hood over it, and
the foe is dying before it knows it was hit.

**Choice card:** "One drop at a time." - Your arrows stack Venom, up to 10. - Deathcap bursts it and
spreads it. - Best with a fire hero (Blight).

**Title:** the Quiet Thorn. **Role:** striker (Middle). **Type:** physical, adds poison.

**Stats:** HP scale 6, armour 10, crit 15%. **Evolution line (C): "Adder's Craft: 10% more damage,
25% more status damage."** (The status part multiplies Venom ticks and Blight's extra ticks.)

**Core mechanic: Venom ramp.**
- **Every 3rd swing applies 1 Venom.** Focus applies **2 Venom** and the Mark.
- **Spore-tipped:** every Volley arrow applies 1 Venom to the foe it hits (so Volley seeds the pack).
- Venom follows core-2 exactly: 0.04 P a tick per stack x (1 + 0.1 x stacks), up to 10 (0.8 P a tick),
  8 s, refresh on a new stack, halves the foe's healing at 5+.
- **Seep:** when a foe with Venom dies, **half its stacks** jump to the nearest living foe (up to 3 jumps
  from the first, like Burn). Venom survives the pack; swarms melt.

**Patient Hunter** (passive). Your hits deal **2% more per Venom stack** on the target (up to 20%;
bucket C, conditional on the target).

**`ab2`: Deathcap.**

```js
{ id: 'bloom', slot: 'ab2', cls: 'venomstalker', cd: 16, target: 'single', type: 'poison',
  tags: ['dot', 'aoe'],
  fx: [['consume', 'venom'],                      // returns n (0-10); the foe keeps 3 stacks (below)
       ['dmg', 0.4, { perStack: 1, ramp: 0.1 }],  // 0.4 P x n x (1 + 0.1 x n): 8 P at 10 stacks
       ['apply', 'venom', 3],                     // the target restarts at 3
       ['apply', 'venom', 4, null, { to: 'pack-others' }]] }  // every other foe gets 4
```

**Finisher: Heartseeker** (`heartseeker`). 8 P poison, `heavy`, `finisher`. Applies 10 Venom at once
(the full ramp).

**How play changes.**
- *Idle:* the best idle class in the game. Venom ramps by itself, Seep carries it across the pack, Bloom
  fires every 16 s at whatever it has (usually 7-10 on long fights). Idle loses least here.
- *Active:* hold Bloom until 10 stacks (a Tactics rule does it for you: `stacks venom 10`), fire it into
  Stagger or a Blight window, and Focus the healer first (Venom 5+ halves healing).
- *What is new:* the Ranger stops being burst and becomes a clock. Damage lives on the foes, not in the
  swings, so crits matter less and `stPow`, `pwPoison` and Blight matter more.

**Party role and heroes.**
- Default trio: **tank (F), Adder (M), a Burn caster (B)**: Pip or Morwen for Blight.
- Shines with: **Pip, Morwen, Caedmon** (Burn: Blight makes every Burn tick also tick all 10 Venom
  stacks, the strongest damage-over-time in the game), **Isolde, Corvin** (more Venom, anti-heal), **Maren**
  (a holy tank: the Ranger's Mark + her holy = Judgement).
- Bonds: Two Bows (Wren) and Asked (Corvin) with Adder lines; new **Same Poison** (Isolde).

**Reactions it drives.** **Blight** (it is the Blight engine). **Elite traits it beats:** Leeching
(Venom 5+ halves healing), and it strips healers (Marsh Wraiths, the Brine Witch).

**Weak spot.** Undead, plants and constructs resist poison (core-2 2.3): Region 1 is the Adder's
worst region, and it starts after it. The swings stay physical, so a resisted Venom costs about 15%
overall, not 40%. Beasts (the Coast's gulls, bats) are weak to poison.

**Visual identity:** a hooded long coat in moss and bark greens, a recurve bow with a vial rack on the
quiver, a lamp shaded under green glass so it throws only a thin light (bluish green #009E73 family).
Venomed foes show the drop badge with a digit (core-2 2.1). Silhouette: low, hooded, still.

**Passives.** Patient Hunter (above). Kept from the Ranger: Keen Eye, Light Feet, Hunters' Company.

**Power spike split** (2.2): own damage about x1.65, party damage x1.33, hold x1.00, effective 1.33.
From: Adder's Craft (C x1.10 on everything, x1.25 on status damage), the Venom ramp and Seep
(status damage, about 30% of its own damage at 10 stacks), Patient Hunter (C, up to x1.20 on a 10-stack
foe), Deathcap (`ab2`), and the role floor (`heroFloor.venomstalker` 0.75 vs 0.7).

### 2.6 Trapper (Ranger, utility)

**Fantasy.** A Ranger who knows the road so well the road fights for them. They go first, stake small
lamps in the ground ahead of the party, and every lamp hides a snare. "Hold the road, by knowing it"
(lore.md 2.4) taken literally.

**Choice card:** "The road fights for you." - Traps wait at the front of every pack. - Snare Field roots
and marks the whole pack. - Best with heavy hitters and fire.

**Title:** the Waylayer. **Role:** caster in the Middle (the Focus slot job: ability +damage; combos
like Kill Box read it as a caster). **Types:** physical, adds frost and poison (traps).

**Stats:** HP scale 7, armour 15, crit 15%. **Evolution line (C): "Trapper's Kit: 30% more control."**
(Stun, Root and Chill last 30% longer, inside core-2's hard caps.)

**Core mechanic: Traps.**
- The Trapper holds **2 trap charges**. When a pack spawns, its charges are laid in the enemy Front
  column by themselves (idle works). A trap springs on the first foe that steps in or attacks from there.
- Traps alternate:
  - **Frost Snare**: 1.5 P frost, **Root** 3 s and **Chill** 4 s.
  - **Spore Pit**: 1.0 P poison to the foe and every foe in its column, **Venom 4** on each.
- A charge comes back every 10 s (`haste` speeds it). In a boss fight, laid traps spring under the boss
  on its `heavy` or `slam` wind-up: a Snare on a boss becomes 24 stagger and its 15% slow (core-2 3.4).
- **Tripwire:** a diver that dives at the Back springs a charge in mid-air: it is Rooted where it stands,
  the dive ends, and the hit never lands.

**Hunter's Mark** (passive). Focus Marks at **30%** (the top of core-2's range), not 25%.

**`ab2`: Snare Field.**

```js
{ id: 'snarefield', slot: 'ab2', cls: 'trapper', cd: 20, target: 'pack', type: 'frost',
  tags: ['cc', 'aoe'],
  fx: [['dmg', 1.0],
       ['apply', 'root', 1, 3],
       ['apply', 'chill', 1, 4],
       ['apply', 'mark', 1, 8, { v: 0.2 }],   // every foe Marked 20% (the Focus foe keeps its 30%)
       ['stagger', 15],
       ['trap', 'rearm']] }                   // new verb, change-log 8.2-4: refills both charges
```

**Finisher: Deadfall** (`deadfall`). 7 P frost, `heavy`, `finisher`. Roots the pack (not the boss), Marks
the boss at 30% for 10 s and Chills it for 6 s.

**How play changes.**
- *Idle:* traps lay themselves on every pack, Snare Field fires every 20 s, divers never reach the Back.
  The party simply takes less and hits Marked foes.
- *Active:* Focus the foe that matters (30% Mark), fire Snare Field when the pack is full-size (every foe
  Marked for 8 s) or when a Summoner's adds land, and hold a charge for the boss's slam.
- *What is new:* the Ranger stops dealing the damage and starts deciding where it goes. The Trapper is the
  **reaction hub**: it provides Chill (Shatter), Venom (Blight) and Mark (Judgement), so every hero's hit
  becomes part of a reaction.

**Party role and heroes (utility lift).**
- Default trio: **a heavy-hitting tank (F), Trapper (M), a Burn or holy hero (B)**.
- Shines with: **Grenna, Aldric, Bram** (heavy hits on Chilled foes = Shatter, x2 and +20 stagger),
  **Pip, Morwen, Caedmon** (Burn + Spore Pit Venom = Blight), **Hesketh, Anselm, Vesper, Elowen, Maren**
  (holy on the pack-wide Mark = Judgement healing), **Thessaly** (more Chill; Bond).
- Bonds: Two Bows (Wren) and Asked (Corvin) with Trapper lines; new **The Bog Road** (Thessaly).
- **Lift target:** party damage x1.18 (pack Mark, Focus 30%, reactions) and hold x1.15 (Chill, Root,
  Tripwire) over a Ranger's trio.

**Reactions it drives.** All three: Shatter, Blight, Judgement. **Elite traits it beats:** Enraged (Chill
cancels the rage), Summoner (Snare Field interrupts the summon and Roots the adds), Explosive (a Chilled
foe freezes and does not blast).

**Visual identity:** a practical coat with many pockets, a short bow or crossbow, a bundle of small stake
lamps on the back; each laid trap shows as a small staked lamp in the enemy Front column (frost blue or
green pip). Palette: sky blue #56B4E9 and bluish green trims on leather. Silhouette: crouched, reaching.

**Passives.** Hunter's Mark (above). Kept from the Ranger: Keen Eye (x1.5 crit on your Marked foe),
Light Feet, Hunters' Company.

**Power spike split** (2.2): own damage about x1.1, party damage x1.18, hold x1.15, effective 1.36.
From the target side, not buckets C or T: Focus Mark 30% (vs 25%) and the pack-wide 20% Mark from Snare
Field (vuln, 8 s in 20: about x1.08 on packs), the reactions it hands the heroes (about x1.06), trap and
Snare damage (about x1.03); hold from Chill (foes attack 30% slower), Root and Tripwire.

### 2.7 Warlock (Lanternmage, damage)

**Fantasy.** The dark does not kill lantern light; it holds it, cold green or angry red, and uses it as a
lure or a weapon (lore.md 2.3, rule 5). The Warlock learned to do the same thing back: to steal the
dark's held fire and turn it on the things that hold it. The Order would have hated it. It works.

**Choice card:** "Take the dark's fire. Throw it back." - Your Embers curse what they touch. - Witchfire
sets off every curse at once. - Best with a tank and big hitters.

**Title:** the Firethief. **Role:** caster (Back). **Type:** fire ("dark fire": still the `fire` type,
with one rule of its own, Dark Turned).

**Stats:** HP scale 4, `area` +20% (splash 35%), ward 10%. **Evolution line (C): "Warlock's Pact: 10% more
damage."**

**Core mechanic: Hex.**
- Embers still plant on taps and still feed Flare. **A foe with 3 or more Embers is Cursed** for 6 s.
  Lantern Flare also Curses its target.
- Curse follows core-2: no healing; it **stores 20% of all damage the foe takes** (from anyone), and
  detonates at its end as fire to the foe and 50% of it to the rest of the pack (cap 10 P of the
  Warlock). The whole party feeds every Curse.
- **Creeping Hex** (the owner's "spreading curses"): when a Cursed foe dies, its Curse goes off at once
  (the stored damage hits the rest of the pack at 50%) and a fresh Curse jumps to the nearest foe without
  one, up to 3 jumps from the first (the same limit as Burn's spread). On a swarm, one Curse walks the
  pack.
- **Held Light:** each Curse that detonates gives Witchfire and Lantern Flare **10% charge** (at most 30%
  a second). On a big pack, detonations chain into Novas.
- **Dark Turned** (passive): the Warlock's Curse detonations and Witchfire treat **"resists fire" as neutral**
  (x1, not x0.6). A weakness to fire still counts. The Emberwaste burns with held light; the Warlock
  turns it back. (Change-log line 8.2-2; without it the Warlock loses Region 3, 35 zones.)

**`ab2`: Witchfire.**

```js
{ id: 'hexnova', slot: 'ab2', cls: 'warlock', cd: 15, target: 'pack', type: 'fire',
  tags: ['aoe'],
  fx: [['detonate', 'curse', 1.5],   // every Curse on the field goes off now, stored damage x1.5
                                     // (a Curse-ender, core-2 3.1; 'detonate' = consume + its effect)
       ['dmg', 1.2],                 // every foe
       ['apply', 'curse', 1, 6]] }   // then a fresh Curse on every foe
```

**Finisher: Unmaking** (`unmaking`). 9 P fire, `heavy`, `finisher`. Detonates the foe's Curse at double
the stored damage, and the pack takes 100% of it (not 50%).

**How play changes.**
- *Idle:* Embers curse the focus foe, Flare curses and burns, Nova curses the pack every 15 s and each
  Curse goes off on its own when it ends. Idle is strong on packs and fine on bosses.
- *Active:* let a Curse fill (big hits land into it: Isolde's Execute, Kestrel's Leap, a Shatter), then
  Nova to detonate it early at x1.5, and Unmake a Staggered boss for the biggest single number in the
  game. Watch the stored-damage ring on the badge.
- *What is new:* the Lanternmage's damage stops being its own. A Curse stores the whole party's damage, so the
  Warlock is the class that multiplies big hitters, and the best swarm clearer (Burn spread + pack
  detonations).

**Party role and heroes.**
- Default trio: **tank (F), a big-hit striker (M), Warlock (B)**. No healer by default; Curse's
  no-healing is on foes only, but a Warlock party is fragile and wants a tank that holds alone.
- Shines with: **Isolde, Kestrel, Grenna, Aldric** (big single hits into a Curse), **Isolde, Corvin**
  (Venom + the Warlock's Burn = Blight), **Caedmon** (a tank that burns back), **Morwen** (Bond).
- Bonds: The Missing Page (Pip) with a Warlock line; Lantern's Chosen (Elowen) for any non-Lightkeeper Lanternmage;
  new **Candle and Hex** (Morwen).

**Reactions it drives.** Blight (its Burn with a Venom hero). Curse is not a reaction, but it stores every
reaction's damage. **Elite traits it beats:** Leeching (Curse: no healing, and Curse beats Venom's half),
Ice-Clad (fire), Summoner (pack detonations clear the adds).

**Visual identity:** dark robes over light cloth with ember-red lining, a staff topped by a small iron
cage holding a shard of red held light (the stolen lamp); its own lamp burns a deep red with a dark
core. Cursed foes wear the cracked-ring badge. Silhouette: tall, narrow, the caged light held out.

**Passives.** Dark Turned and Held Light (above). Kept from the Lanternmage: Lantern Glass (splash, now 35% with
the Warlock's `area`) and Kindred Sparks.

**Power spike split** (2.2): own damage about x1.8 on packs (about x1.4 on a lone boss), party damage
x1.35, hold x0.98, effective 1.32. From: Warlock's Pact (C x1.10), `area` +20% (G, splash 15% -> 35%),
Curse (stores 20% of the whole party's damage: about x1.12 on the party at full uptime), Witchfire and
Creeping Hex on packs, Held Light (more Flares and Novas). Hold dips a little (no sustain of its own).

### 2.8 Lightkeeper (Lanternmage, utility)

**Fantasy.** Lightkeepers kept lamps, and people, burning (lore.md 2.4); Elowen was one. The safest
light is the one you give to someone (lore.md 2.3). The Lightkeeper gives theirs away: their own hits soften,
and the party burns brighter. Their lamp is open, white-gold, carried like a censer.

**Choice card:** "Give your light away." - Your heroes deal the damage you give up. - Sanctuary heals
the party, turns spare healing into shields and burns the dead. - Best with two damage heroes.

**Title:** the Given Light. **Role:** support (Back). **Type:** holy (the Lightkeeper's own hits, taps and
abilities).

**Stats:** HP scale 6, armour 10, ward 30% (overhealing becomes a shield up to 30% max HP; core-2 cap 40%).
**Evolution line (C): "Lightkeeper's Vows: 30% more healing."**

**Core mechanic: Given Light** (today's Lightkeeper rule, kept).
- **Your swings and taps deal 60% less** (x0.4). **Your heroes deal the damage you gave up** (today's
  `heroMul` / `lkShare` transfer, from x0.2 to x0.4 because the Lightkeeper also smites). Abilities and the
  Finisher are not reduced: their coefficients below are what lands.
- Your hits are **holy**: they trigger Judgement on Marked foes and hit undead, spirits, the drowned and the
  deep where it hurts (core-2 2.3: all four are weak to holy). That is the owner's "smite undead".
- `heroFloor.priest = 0`: the Lightkeeper is exempt from the damage floor, as the Lightkeeper is today.

**Tap: Blessing** (replaces Ember for a Lightkeeper; a `var`, change-log 8.2-4).
- Heals the most hurt ally for **1.0 P**; smites the focus foe for 0.5 P holy.
- Raises **Blessing** one level (I-III, 6 s from the last tap): **heroes deal 20% / 40% / 60% more**
  (named buff "Blessing", bucket T; today's +20% a stack, up to 3, kept so a Lightkeeper loses nothing).
  Idle auto-taps add it at half strength, as today.

**`ab1` for a Lightkeeper: Rally Hymn** (`hymn`, the Lightkeeper's ability, kept where a Lightkeeper player
knows it; a `var` that replaces Lantern Flare in `ab1`).

```js
{ id: 'hymn', slot: 'ab1', cls: 'priest', cd: 30, target: 'party', type: 'holy',
  tags: ['heal', 'cleanse'],
  fx: [['heal', 8],                  // 8 P to each member (BAL3 sets it to about 30-40% of a Front
                                     // tank's max HP at the push zone, as today's 40% max-HP heal)
       ['cleanse', 2],               // a Lightkeeper removes two harmful statuses (core-2 3.1)
       ['buff', 'hymnEmpower', 8],   // Empowered "Rally Hymn": the party deals 30% more
       ['charge', 'sig', 0.25]] }    // every hero's signature +25% charge
```

Today: 40% heal, +40% damage for 8 s, cd 40. Core 2.0 sets cd 30 and 30% more damage: the same average
(8 s of 30% every 30 s = 8 s of 40% every 40 s), with more heals and cleanses.

**`ab2`: Sanctuary** (owner-named). The Lightkeeper consecrates the ground under the party for 6 s.

```js
{ id: 'sanctuary', slot: 'ab2', cls: 'priest', cd: 20, target: 'party', type: 'holy',
  tags: ['heal', 'shield', 'aoe'],
  fx: [['apply', 'regen', 1, 6, { v: 0.8 }],        // Regen on each member: 0.8 P a tick for 6 s (4.8 P)
       ['shield', 0, { overflow: 1 }],              // while it lasts, all healing past full HP becomes shield
                                                     // (up to core-2's 40% cap, not the Lightkeeper's 30% ward)
       ['dmg', 0.6, { hits: 6, over: 6, to: 'pack' }],  // 0.6 P holy to every foe each second (3.6 P)
       ['stagger', 10]] }
```

Holy weakness makes Sanctuary a real damage ability against undead, spirits, the drowned and the deep
(3.6 P x1.5 on every foe). On a Marked pack each tick is a Judgement, so the party heals from its own
holy damage too. It is the owner's "holy heals that overflow into shields and smite undead" in one button.

Name clash: Elowen's signature is also called Sanctuary today. The owner named the Lightkeeper's ability, so
the Lightkeeper keeps it and Elowen's signature is shown as **Chapel Light** (display name only; its id and
numbers stay). Decision D7.

**Finisher: Dawnbreak** (`dawnbreak`). 7 P holy, `heavy`, `finisher`. Heals the party 3 P each, cleanses
one harmful status from each member, and sets Blessing to III.

**Passives.** Given Light and **Keeper's Light** (aura, today's Lightkeeper aura, kept): supports in your
party heal 40% more and hit 40% harder; all heroes deal 25% more. Kept from the Lanternmage: Lantern Glass (your
holy hits splash 15%) and Kindred Sparks (casters +30% attack).

**How play changes.**
- *Idle:* Blessing sits at about II, Rally Hymn fires every 30 s and Sanctuary every 20 s, overheal turns
  into shields, the heroes hit much harder. The Lightkeeper party idles deep because nothing dies.
- *Active:* keep Blessing at III, drop Sanctuary just before the boss's `line` hit (the shields are up
  when it lands), hold Rally Hymn for a Curse on an ally (it cleanses two), and Dawnbreak a Staggered
  boss for the whole party's reset.
- *What is new:* the Lanternmage stops burning and starts giving. The Lanternbearer's damage is spent through
  the heroes, so hero choice matters more for a Lightkeeper than for any other class.

**Party role and heroes (utility lift).**
- Default trio: **tank (F), a striker (M), Lightkeeper (B)**; from Region 2 many Priests field **two damage
  heroes** and let Sanctuary, Rally Hymn and ward carry the sustain.
- Shines with: **Wren** (Mark + the Lightkeeper's holy = Judgement; the party heals from its own damage),
  **Isolde, Kestrel, Corvin, Oriel, Pip, Morwen** (the heroes the gift lands on), **Anselm, Vesper**
  (Two Lights combo; faster signatures).
- Bonds: The Unlit Road (Hesketh) and Two Candles (Elowen), kept from the Lightkeeper.
- **Lift target:** party damage x1.20, hold x1.15 over a base Lanternmage's trio; the Lightkeeper's best trio is
  within 15% of the Warlock's best on the days to each region boss (CP4).

**Reactions it drives.** Judgement (holy hits on Marked foes). **Elite traits it beats:** Cursed (cleanse
two, and holy hits strip the aura); Explosive is softened (Sanctuary's shields are up for the blast).

**Visual identity:** light vestments in bone and pale gold, a censer-lamp on a chain (the open lamp,
white-gold #F0E442 family), a book at the hip. Blessing shows as 1-3 small suns over the party's
portraits (never colour only). Sanctuary draws a soft ring of light under the party (reduced motion: a
still ring). Silhouette: upright, the lamp held out and low.

**Power spike split** (2.2): own damage about x0.5 (it gives it away), party damage x1.20, hold x1.15,
effective 1.38. Party: the Lanternmage's own share (about a third) halves, and the heroes' two thirds rise about
x1.5 (Keeper's Light x1.25 in Y, Blessing about x1.2-1.4 in T, Given Light's transfer), which nets about
x1.20. Hold: Lightkeeper's Vows (C, heal x1.3), Sanctuary's Regen and overflow shields, Rally Hymn, ward 30%.

### 2.9 The six at a glance

| | Reaver | Warden | Adder | Trapper | Warlock | Lightkeeper |
|---|---|---|---|---|---|---|
| Meter | Fury 0-100 | Bulwark 0-10 (+ Grit) | Venom on foes | trap charges 2 | Embers, Curses | Blessing I-III |
| `ab2` (cd) | Rend (14) | Stand Fast (18) | Deathcap (16) | Snare Field (20) | Witchfire (15) | Sanctuary (20) |
| Finisher | Red Harvest 8-10 P | Oathstrike 8 P | Heartseeker 8 P | Deadfall 7 P | Unmaking 9 P | Dawnbreak 7 P |
| Reactions | Shatter, Blight | Judgement, Shatter | Blight | all three | Blight (+ stores all) | Judgement |
| Beats traits | Shielded, Ice-Clad, Enraged | Cursed, Shielded, Summoner | Leeching | Enraged, Summoner, Explosive | Leeching, Ice-Clad, Summoner | Cursed (Explosive, softened) |
| Idle strength | good | very good | best | very good | good | very good |
| Best active moment | Rend + Red Harvest in Stagger | Stand Fast on the signature cast | Bloom at 10 in Blight | Snare Field on a full pack | Nova on a full Curse; Unmaking | Sanctuary before the `line` hit |
| Lamp colour | red-orange | white-gold in the shield | green under glass | small staked lamps | deep red, caged shard | open white-gold |
| Title | the Red Lamp | the Holdfast | the Quiet Thorn | the Waylayer | the Firethief | the Given Light |

Every core-2 6.5 counter is met: Reaver and Warrior (Shielded), Warden (Cursed), Adder (Leeching),
Trapper (Enraged, Summoner), Warlock (Ice-Clad, Leeching), Lightkeeper (Cursed).

### 2.10 Room for the second tier (after 1.0)

Nothing in 1.0 fills it, but every piece has a place (core-2 8.3):

- **Ids:** a tier-2 path is `<evo>.<name>` in `S.cls.evo2` (for example `reaver.x`). Each first evolution
  can branch in two, so the shape stays "damage or utility" one level down.
- **Ability slot 3** (`ab3`) and its auto-cast flag are in `S.cls.slots` and `S.cls.auto` from S2.
- **A Proving per evolution:** trial ids `trial.reaver` and so on, in the same `S.cls.trials` map.
- **Star maps:** ring 2 (`e2s1-e2s8`) sits outside ring 1, with its own keystone that does not count
  toward the base map's 2.
- **Class card:** a locked tier-2 row under the evolution ("A second path opens in a later season").
- **Respec:** the Mirror's cost table has a `t2` row that resets tier 2 only (3.4).
- **Rule for the kits above:** no evolution uses up its whole design space. Each has one open direction
  its tier 2 can take (Reaver: fire or blood; Warden: holy wrath or pure wall; Adder: spores or
  single-target assassin; Trapper: frost or beasts; Warlock: curses or dark fire; Lightkeeper: healing or
  smiting). These are notes for later, not promises in copy.

---

## 3. The evolution unlock

### 3.1 When it opens

- **Gate:** the Fenmother (zone 35) beaten once **and** Lanternbearer level `CLS_TUNE.evoLv`.
- **The level:** plan-4 and roadmap-review say "level 60+". Today's curve does not reach that at the
  Fenmother. The sim (`--class warden --days 12`, this branch) has the Fenmother on **day 8.3 at level 39**,
  and level 42 on day 12; the constellations table puts level 54 at month 2. A level-60 gate would move
  the trial to about month 3, deep in Region 2, which Core 2.0 tunes for an *evolved* Lanternbearer.
  **Recommended: `evoLv` 35** (a player at the Fenmother always has it; it stops a very early boss kill
  from skipping the moment). Decision D1.
- The Next Up line and a toast say it: "The Fenmother has fallen. Your Proving is open." The Party tab's
  class card gets a gold dot.

### 3.2 The Proving (the trial)

Name: **the Proving**, because the Deepwell already has "this week's Trial" and "Trial Seals"
(`57d-deepwell.js`). Code id stays `trial`. Decision D2.

Common rules:

- **Solo**: the Lanternbearer only. The heroes step back and watch (they stand at the stage edge, dimmed).
  The fight uses the Fenmother's marsh background.
- **Free and repeatable.** Failing costs nothing and you can try again at once. The farm pauses for the
  fight (60-90 s) and resumes after.
- **Fixed strength.** Trial foes are scaled to a *reference* Lanternbearer, not to you: level 35, Region 1
  grade-3 gear at +3, no stars, the base class. So the Proving gets easier as you grow; a player who
  comes back at level 45 passes easily.
- **Pass bands** (BAL3 CP8): at reference power, active play passes in 1-3 tries; idle (no taps) passes
  at 1.25x reference or more. Nobody is ever locked out.
- Starting from Party > Class > "Take the Proving", or from the Fenmother zone's boss button once beaten.

**Warrior: Hold the Bridge** (`trial.warrior`). 60 s on a plank bridge. A lamp stands behind you (100
HP). Four packs cross (Rattlebones, Barrow Beetles). A foe you have not hit in the last 4 s walks past you
to the lamp and hits it. Three `heavy` warnings come at you. **Pass:** the lamp is still lit at 60 s and
you are standing. Teaches: taps turn foes, Shield Wall taunts everything, parries. Idle: Shield Wall's
taunt and the auto-taps hold most of it; the lamp survives at about 1.25x.

**Ranger: The Running Wraith** (`trial.ranger`). A champion wraith (the Fenmother's herald) flees across
the marsh; it escapes after 45 s. Three bats screen it and take your focus if you let them. It stops for
2 s at each of 3 lamps (burst windows). **Pass:** it falls before it escapes. Its HP is 40 s of the
reference Ranger's damage with the Mark on it. Teaches: Focus the right target (tap the wraith, not the
bats), Volley into a stop. Idle: auto-Focus marks the focus foe, which the stage keeps on the wraith.

**Lanternmage: The Cursed Wave** (`trial.mage`). Three waves in 60 s: a swarm of 10 bats; 6 Spore Caps whose
clouds Curse you (no healing, 1.5% of max HP a second while Cursed); 3 Marsh Wraiths that heal each other
(a `heal` cast bar). Your lamp heals you 3% a second while you are not Cursed. **Pass:** all three waves
down before your HP runs out. Teaches: Flare into a swarm, Burn spread, interrupting a heal with Flare. Idle: auto-cast Flare clears the swarm and usually lands on a heal cast by
chance; the Cursed wave is the idle wall, passed at about 1.25x reference.

### 3.3 The choice card (full screen)

After a pass, the choice opens at once. It can be closed ("Choose later"); the choice waits on the Party
tab with no timer.

```
+------------------------------------------+   360 px, 16 px gutters
| You passed the Proving.                  |
| Choose your path. It is permanent.       |
|  [ Reaver ]      [ Warden ]              |   two tabs, 50/50; swipe also switches
+------------------------------------------+
|        (portrait, 3 s looping demo)      |   reduced motion: a still frame
|  REAVER  - the Red Lamp                  |
|  "Hit harder the worse it gets."         |
|  - Every heavy hit builds Fury.          |
|  - Rend cleaves the front and bleeds.    |
|  - Best with a healer behind you.        |
|  New ability: Rend   New Finisher        |
|  Role: damage, in Front                  |
|  Good with: Hesketh, Thessaly, Isolde    |   only heroes you own; greyed if not
|  Beats: Shielded, Ice-Clad          |
+------------------------------------------+
|  [ Become a Reaver ]                     |   48 px button
|  Choose later                            |   text link
+------------------------------------------+
```

- **Become a Reaver** opens an in-page confirm (no `confirm()`): "Become a Reaver? This is permanent. You
  can change it later with a Mirror of Embers and Essence." [Yes, become a Reaver] [Not yet].
- On yes: the stage flashes the lamp to its new colour (reduced motion: a plain swap), a toast "You are a
  Reaver now. Rend is ready.", the title is granted, `ab2` fills its charge, the ring appears on the star
  map with a dot, and Tactics rule slot 2 unlocks (when Tactics exist).
- "Good with" lists owned heroes first; a hero you do not own shows as a grey name, never a silhouette
  tease.

### 3.4 The Mirror of Embers (respec)

The Mirror stays an item (`S.party.mirrors`, unchanged). Its sources: today's 2% zone-boss drop from zone
36, plus **1 on each Great Lantern relit from Region 2 on** (Silas the Fogbound and after). That makes
one respec per region affordable, never a habit.

| Change | Cost | What happens |
|---|---|---|
| Switch evolution (same base: Reaver to Warden) | 1 Mirror + Essence worth 2 hours of fighting at your farm zone | New `ab2`, Finisher, title, look; the ring's stars are refunded; the Proving stays passed |
| Change base class (Warrior to Lanternmage) | 2 Mirrors + Essence worth 4 hours | Gear retools to the new weight (as `retoolItems()` does now); each class keeps its own star layouts; the evolution is cleared, and if you ever passed a Proving you pick the new class's evolution at once (no new Proving) |
| Tier 2 (after 1.0) | row reserved (`respecCost.t2`) | resets tier 2 only |

- Each respec after the first costs **+50% Essence** (up to x3). Mirrors stay at 1 or 2.
- **Second thoughts:** one free switch within 10 minutes of choosing, once per save. Decision D3.
- The respec sheet shows both costs in full before the button, and "You have 1 Mirror" or "You need
  1 more Mirror" in plain words.

### 3.5 Save fields

The reserved key `S.cls` (core-2 8.2), filled in. `registerState('cls', defaults)`, `v` 1.

```js
S.cls = {
  v: 1,
  base: null,            // 'warrior' | 'ranger' | 'mage'
  evo: null,             // tier 1: 'reaver' | 'warden' | 'venomstalker' | 'trapper' | 'warlock' | 'priest'
  evo2: null,            // tier 2 (after 1.0): e.g. 'reaver.x'; always null in 1.0
  proven: {},            // { [evoId]: 1 } evolutions at full strength (3.7: a migrated grant may wait)
  trials: {},            // { [trialId]: { n: tries, won: 0|1, best: 0-100 } }, trialId 'warrior' ... (tier 2: 'reaver')
  respec: 0,             // respecs done (cost escalation)
  free: 1,               // the one free "second thoughts" switch (3.4)
  at: 0,                 // when the current evolution was chosen (for the 10-minute window)
  slots: { ab1: null, ab2: null, ab3: null },   // ability ids in each slot; null = the class default
  auto: { ab1: 1, ab2: 1, ab3: 1 },             // auto-cast per slot (S.party.autoCast stays the master switch)
  mig: 0,                // 1 once the legacy class was migrated (section 7)
  from: null             // the legacy S.party.cls it came from, for the record
};
```

- Ids and counts only (core-2 8.1-4). Meters, traps, Curses and Blessing levels are runtime, never saved.
- `S.party.cls` is **frozen**: old saves keep their legacy value forever, new saves leave it `null`. All
  code reads the class through `lbClass()` -> `{ base, evo, evo2 }` and `lbHas(tag)` (section 8.3).
- `S.party.chosen`, `S.party.mirrors`, `S.party.autoCast` keep their meaning.
- **Tier 2 room:** `evo2`, `slots.ab3`, `auto.ab3`, trial ids per evolution, a ring per tier on the star
  map, the respec table's tier-2 row, and a locked tier-2 row on the class card ("A second path opens in a
  later season").

### 3.6 Tactics unlock order (for S7)

The Lanternbearer has 2 rule slots (core-2 4.5): **slot 1 when Tactics arrive, slot 2 on evolving**.
Conditions and actions every class has from the start: `always`, `bossHp`, `selfHp`, `staggerFull`, and
`use` / `hold`. Each class and evolution adds:

| Class / evolution | Conditions | Actions | Suggested preset rule |
|---|---|---|---|
| Warrior | `telegraph` | - | IF `telegraph slam` THEN `use ab1` |
| Ranger | `foeLacks` | `focus` | IF `foeLacks mark` THEN `focus` |
| Lanternmage | `packSize` | - | IF `packSize 5` THEN `use ab1` |
| Reaver | `staggerNear`, `meter` | - | IF `staggerFull` THEN `use ab2` |
| Warden | `castBar`, `allyHp` | `taunt`, `interrupt` | IF `castBar sig` THEN `use ab2` |
| Adder | `stacks` | - | IF `stacks venom 10` THEN `use ab2` (else `hold ab2`) |
| Trapper | `elite`, `packSize` | `moveTo` | IF `elite summoner` THEN `use ab2` |
| Warlock | `foeHas`, `meter` | - | IF `meter curse 80` (the focus foe's Curse is 80% full) THEN `use ab2` |
| Lightkeeper | `allyHas`, `allyHp` | `cleanse` | IF `allyHas curse` THEN `cleanse` |

`stacks` and `meter` are new condition ids (change-log line 8.2-7).

### 3.7 A granted evolution that has not been proven

A migrated Warden or Lightkeeper gets its evolution **granted** (section 7). If that save has **not** beaten
the Fenmother yet, the evolution is granted but **unproven**: the tap, the core mechanic and `ab2` work (so
nothing they had is lost), but the evolution line (bucket C), the ring and the title wait until they pass
the Proving, and the new parts (a Warden's Bulwark and Stand Fast; a Lightkeeper's Sanctuary and Dawnbreak) run at
`CLS_TUNE.unproven` 0.6 strength. Their Proving
screen says "Prove what you already are." Passing sets `proven[evo]` and skips the choice card. Saves past
the Fenmother are proven at once ("Your road so far is your Proving."). Decision D4.

---

## 4. Star maps (Constellations) for three classes

### 4.1 What changes

- **Three base maps** (`warrior`, `ranger`, `mage`), same shape as today: Hearthstar, 3 arms of 8 stars, a
  crown ring of 5 bridges and a crown keystone (31 stars; positional ids `a<arm>s<slot>`, `b0-b4`,
  `crown`).
- **One evolution ring per tier.** On evolving, a ring of **8 stars** (5 minor, 2 notable, 1 keystone;
  ids `e1s1-e1s8`) appears around the map, linked to the three arms' star 5. Its content depends on the
  evolution. Tier 2 adds `e2s1-e2s8` later.
- **Each base map leans:** one arm toward each evolution and one neutral. So lighting an arm before the
  Proving is a hint of the path, never a trap: every arm works for both.
- **Points** are unchanged: `floor(L / 3) + 4 x Great Lanterns`, derived, never stored.
- **Keystone limit:** 2 lit on the base map, as today. The ring holds **1 keystone of its own** that does
  not count toward the 2 (so an evolution always has room for its signature rule).
- **Power cap:** the best build including the ring must stay under the coordinator's caps (+15% / +25% /
  +35% at levels 20 / 40 / 60). The ring's numbers are small and its keystone is play-changing. To make
  room, BAL3 may trim base-map minors about 10%. Coordinator item C2 (section 8.4).

### 4.2 The base maps

| Map | Arm 1 (leans) | Arm 2 (leans) | Arm 3 (neutral) | Crown | Built from |
|---|---|---|---|---|---|
| **Warrior** "Warrior's Oath" | **Vanguard** (Reaver): taps, damage, crit damage; keystones Crushing Blow (notable), **Challenger** | **Bulwark** (Warden): Grit (was guard), Shield Wall; keystone **Unbroken** | **Oath**: heroes, gold; keystone **Oathsworn** | **Lantern Bastion** | today's Warden map, same positions and ids |
| **Ranger** "Keen Eye" | **Deadeye** (Adder): crits, Hawk Eye; keystone **Deadeye** | **Hunt** (Trapper): Mark time and value; keystone **Pack Leader** | **Volley**: Volley, haste; keystone **Quickdraw** | **Rain of Arrows** | today's Ranger map, same ids; Mark texts become "Marked foes take +3% more" (vuln, inside +60%) |
| **Lanternmage** "First Spark" | **Kindle** (Warlock): Embers, Burn; keystone **Wildfire** | **Flare**: Flare, auto-cast; keystone **Kindling Storm** | **Glass**: crits, splash; keystone **Glass Lantern** | **Everburn** | today's Lanternmage map, same ids; Slow Burn and Everburn become real Burn (core-2 status) |

The Lightkeeper lean lives in the Lightkeeper ring (it is where the Lightkeeper's stars go). Today's Lightkeeper map
is retired as a base map.

Text changes on kept stars (effects unchanged): "guard stack" -> "Grit"; "Focus" Mark lines now add to
Mark's value (vuln); "Embers burn" -> "apply Burn". `STAR_KS` ids stay.

### 4.3 The evolution rings (tier 1)

Each ring: `e1s1-e1s5` minors (1 point), `e1s3` and `e1s6` notables (2 points), `e1s8` the keystone (3
points). Needs: 2 lit stars in the ring before a notable, 5 before the keystone. The keystones:

| Ring | Keystone (`ks` id) | Rule (with its cost) |
|---|---|---|
| Reaver | **Bloodrage** (`bloodrage`) | Fury never drains below 50 during a fight. You take 10% more damage. |
| Warden | **Aegis of the Order** (`aegis`) | Stand Fast also shields the party for 20% of its Bulwark damage, and every block anywhere in the party stores Bulwark for you. Stand Fast's cooldown is 30% longer. |
| Adder | **Lingering Death** (`lingering`) | Deathcap bursts the full stack count but consumes only half (the target keeps the rest, so it is back at 10 sooner). Seep no longer carries Venom when a foe dies. (A boss keystone: better on one foe, worse on swarms.) |
| Trapper | **Killing Ground** (`killground`) | Trap charges come back every 5 s in boss fights and elite fights. Snare Field no longer Roots (it still Chills and Marks). |
| Warlock | **Pact of Cinders** (`pactcinder`) | Every Curse detonation also Burns each foe it hits (Blight with any Venom), and Creeping Hex has no jump limit. You take 10% more damage. |
| Lightkeeper | **Martyr's Light** (`martyr`, kept from the Lightkeeper map) | Your own hits deal half (on top of Given Light). Your heroes deal 12% more. |

Ring minors and notables (one line each; numbers inside the cap):

- **Reaver:** Fury +1 per hit taken (x2); Rend +1 Bleed (notable); Blood Price at 60% HP (notable); Cinder
  Edge from 40 Fury; +1.5% damage.
- **Warden:** block +2% (x2); Holy Spark +0.1 P (notable); Stand Fast Empower +5% (notable); Bulwark cap
  +2; +3% HP.
- **Adder:** Venom every 3rd swing -> every 2nd for Focus-Marked foes (notable); Seep carries 60%;
  Bloom +0.05 P a stack (notable); status damage +3% (x2).
- **Trapper:** Spore Pit Venom +1 (x2); Tripwire also Marks (notable); Snare Field +2 s Mark (notable);
  control +5%.
- **Warlock:** Curse detonations +8% (notable); Held Light +2% charge (x2); Witchfire +0.1 P (notable); area +3%.
- **Lightkeeper** (the Lightkeeper's stars, renamed where needed): Lingering Light (Blessing +1 s), Warm Light
  (Blessing +1.5% per level), Morning Choir (Blessing cap IV, notable), Refrain (Rally Hymn +2 s,
  notable), Gift (heroes +2%).

### 4.4 Save and migration for stars

- New maps under new keys: `S.stars.maps.warrior`, `.mage`; `.ranger` stays (its ids and effects are
  kept). Legacy `maps.warden`, `.lanternmage`, `.lightkeeper` are **left untouched** in the save (never
  repurposed; the evolution id `warden` never keys a star map: rings live inside the base map as `e1s*`).
- Migration (once, `S.stars.v` 1 -> 2): copy `maps.warden` layouts to `maps.warrior` and
  `maps.lanternmage` to `maps.mage` (same positional ids, same effects). Lightkeeper layouts are not
  copied: their points are free again (points are derived, so nothing is lost), and the Lanternmage map plus the
  Lightkeeper ring are offered with a "Suggested layout" button that lights the Lightkeeper ring and the Flare arm.
- Ring stars unlight on an evolution switch (refunded). Base layouts persist per base class, as today.
- The Feat **Stars in Every Sky** ("36 points on each of the 4 class maps") becomes "each of the 3 class
  maps". Anyone who already earned it keeps it; progress reads the best of the legacy and new map for
  each class (58-deeds `starBest`). Keystone records `rec.ks['warden:...']` stay as they are.

---

## 5. Heroes: types, weights, statuses and Bonds

### 5.1 Base types and weights for the 18 heroes

Weight follows role (core-2 5.1): tank heavy, striker medium, caster and support light. `dt` is data
(`ROSTER[id].dt`, S1 writes it). "Status" is the one status the hero's signature applies (core-2 2.2).

| Hero | Role | Weight | Home | Type `dt` | Signature | Status | Feeds |
|---|---|---|---|---|---|---|---|
| Tobin Reed | tank | heavy | Front | phys | Guard | `guard` (helpful) | none (he holds; his Guard covers heavy hitters) |
| Maren Ashvale | tank | heavy | Front | **holy** | Beacon | `taunt` | Judgement (her Lanternlight burn-back becomes holy) |
| Ser Aldric Vane | tank | heavy | Front | phys | Shield Bash (heavy) | `stun` | Shatter |
| Grenna Holt | tank | heavy | Front | phys | Earthshatter (heavy) | `stun` | Shatter |
| Caedmon the Unburnt | tank | heavy | Front | **fire** | Pyre Guard | `burn` | Blight |
| Bram Hollis | striker | medium | Front | phys | Felling Blow (heavy) | `bleed` | Shatter |
| Wren Hollowmere | striker | medium | Middle | phys | Aimed Shot | `mark` | Judgement |
| Kestrel Thane | striker | medium | Middle | **frost** | Leap | `chill` | Shatter (sets it up) |
| Isolde Marrow | striker | medium | Middle | **poison** | Execute | `venom` | Blight |
| Corvin Black | striker | medium | Middle | **poison** | Hollow Cut | `venom` | Blight |
| Thessaly Gloam | caster | light | Middle | **frost** | Sinking Mire | `chill` | Shatter (sets it up) |
| Pip Cinderly | caster | light | Back | **fire** | Fireball | `burn` | Blight |
| Oriel Vess | caster | light | Back | **frost** | Starfall | `stun` | Shatter (stun fills stagger) |
| Morwen Tallow | caster | light | Back | **fire** | Candlelight Vigil | `burn` | Blight |
| Old Hesketh | support | light | Back | **holy** | Mend | `shield` | Judgement |
| Brother Anselm | support | light | Middle | **holy** | Call to Arms | `empower` (+ cleanse at L20) | Judgement |
| Vesper Lark | support | light | Middle | **holy** | Crescendo | `regen` | Judgement |
| Saint Elowen | support | light | Back | **holy** | Chapel Light (was Sanctuary, D7) | `regen` (+ cleanse at L20) | Judgement |

Checks against core-2 2.2: physical 5 (Tobin, Aldric, Grenna, Bram, Wren), holy 5, fire 3 (Caedmon, Pip,
Morwen), frost 3 (Kestrel, Thessaly, Oriel), poison 2 (Isolde, Corvin): every type on at least 2. Every
role has a non-physical hero: tank (Maren, Caedmon), striker (Kestrel, Isolde, Corvin), caster (all),
support (all). Poison is thinnest; HER should add 2 poison heroes (a Coast beast-hunter and an Emberwaste
one fit), and a physical support.

Why these: Maren is a Lampwarden (lantern light is holy); Caedmon already burns back (Everburn); Kestrel
"falls out of the cold high air" and her Leap now Chills where it lands; Isolde and Corvin are Dusk
Company contract blades (poisoned steel; Corvin's "Hollow Cut" is black with barrow rot); Thessaly's
slows *are* Chill; Oriel's star-cold Starfall already stuns. Supports are holy because they carry lantern
light (lore.md 2.2).

Kit text changes that follow (S1/S3, data only): Maren's Lanternlight "10% of the hit as holy"; Kestrel's
Leap "Chills the foes it lands on for 4 s"; Isolde's Execute and Corvin's Hollow Cut "apply 3 Venom";
Thessaly's Mire slow "is a Chill"; Oriel's Starfall slow "is a Chill" is dropped (her status is the stun).

### 5.2 Bonds that react to the class and evolution

**Re-keying the 8 hero Bonds** (their ids, time and stories are kept; the `cls` field becomes a class tag,
section 8.3):

| Bond (id) | Was | Now needs | Evolution line (added, inside the +40% cap) |
|---|---|---|---|
| The Borrowed Sword (`sword`) | Warden + Tobin | any **Warrior** + Tobin | Reaver: Tobin's Guard also covers you while you are below 50% HP. Warden: Tobin's blocks store Bulwark for you. |
| The Banner (`banner`) | Warden + Aldric | any **Warrior** + Aldric | Shield Wall +1 s (all). Reaver: Aldric's Shield Bash is heavy and Bleeds 1. Warden: Intercept stores Bulwark for you. |
| The Missing Page (`page`) | Lanternmage + Pip | any **Lanternmage** + Pip | Warlock: Pip's Fireball on a Cursed foe sets its Curse off at once. Lightkeeper: your Blessing also counts for Pip's Kindle. |
| Lantern's Chosen (`chosen`) | Lanternmage + Elowen | **Lanternmage, not Lightkeeper** + Elowen | (A Lightkeeper has Two Candles.) Warlock: Chapel Light also cleanses Curses on the party. |
| Two Bows (`twobows`) | Ranger + Wren | any **Ranger** + Wren | Adder: Aimed Shot applies 2 Venom. Trapper: Aimed Shot springs a trap under its target. |
| Asked (`asked`) | Ranger + Corvin | any **Ranger** + Corvin | Adder: Hollow Cut on a foe with 5+ Venom crits. Trapper: Corvin's Shadowstep goes to your Marked foe. |
| The Unlit Road (`unlit`) | Lightkeeper + Hesketh | **Lightkeeper** + Hesketh | (kept: Mend +20%; your heals add a 5% shield) |
| Two Candles (`candles`) | Lightkeeper + Elowen | **Lightkeeper** + Elowen | (kept: Chapel Light 4 s sooner; Rally Hymn heals 3% a second for 5 s) |

**New Bonds, one per evolution that had none** (ids new, 2 camp stories + a Sworn line each for LORE/CHAR1):

| id | Bond | Pair | Why | Effect at 100% | Lever | Stories (Friends / Close) |
|---|---|---|---|---|---|---|
| `twoaxes` | Two Axes | Reaver + Bram | He taught you to swing an axe in Mossy Hollow, for firewood | After your Rend, Bram's next Felling Blow Bleeds 2 and cleaves the Front column. You both deal 8% more to Bleeding foes | ability rider, char mult | Firewood / The Tree That Fell Wrong |
| `lampoath` | The Lampwardens' Oath | Warden + Maren | Two lampwardens, one road, the same Oath | When either of you taunts, both gain a shield of 10% of max HP. Your Holy Sparks Mark the attacker (15%, 4 s) | shield, mark | The Words, Said Twice / Give It to No One |
| `vials` | Same Poison | Adder + Isolde | She knows whose venom you use, and who taught you | Execute works on foes with 5+ Venom at 40% HP, not 30%. Your Venom ticks 25% faster on foes below 30% HP | threshold, tick rate | A Vial Returned / The Contract She Did Not Take |
| `bogroad` | The Bog Road | Trapper + Thessaly | She knows where the marsh hides its holes; you put snares in them | Sinking Mire re-arms one trap charge. Chilled foes take 10% more from both of you | trap charge, char mult | Where Not to Step / What the Water Kept |
| `candlehex` | Candle and Hex | Warlock + Morwen | The candlewitch and the lamp-thief: two ways to steal a flame | Morwen's Burns on a Cursed foe store double in the Curse. Wax Seal bursts set off Curses | curse store, detonation | Wax and Ash / A Flame That Was Not Hers |

The Lightkeeper keeps two Bonds (Unlit Road, Two Candles); every other evolution now has three (two from its
base class, one of its own), and every base class has two. Bonds keep the +40% damage / -20% damage-taken
cap per member (core-2 1.3, formation 2.5).

**Combos react to the evolution role**, not only the class: a Reaver in Front makes **Twin Blades** (with
a striker in the Middle) and **Vanguard**; a Trapper in the Middle makes **Kill Box**-like caster combos
(Crossfire does not apply: it needs a caster in Back); a Warden with a Middle tank makes **Two Walls**.
The planner (`56d-autofield.js`) reads the evolution role through `lbRole()`.

**For CHAR1 (later):** each hero gets one reaction line per evolution (18 x 6 short lines, or fewer with
defaults per circle), for the camp and the Bond sheet: how Tobin sees you as a Reaver ("You used to stand
still.") vs a Warden.

---

## 6. Class parity and targets for BAL3

### 6.1 Targets

The sim runs each base class (S2) and each evolution (S3) on seeds 1-3 with the planner's best trio.
"Zone" means max zone reached. Bands:

| # | Target | Band |
|---|---|---|
| CP1 | All 3 base classes: max zone at 2 h (active) | within 1 zone of each other |
| CP2 | All 3 base classes: max zone at day 1 and day 7 (normal play) | within 1 zone |
| CP3 | All 3 base classes: day of the Fenmother (zone 35) | within 15% (today's P1 band: days 5-8) |
| CP4 | All 6 evolutions: days to each region boss (Regions 2-5) | within 15% of each other |
| CP5 | Within one base class: damage evolution vs utility evolution, days to each region boss | within 10% (neither path is the "right" one) |
| CP6 | Evolution spike at choosing (2.2) | effective 1.30-1.40 for each of the 6 |
| CP7 | Utility lift: the same trio with the utility evolution vs its base | party damage >= x1.10 **and** push >= +1 zone (Warden, Trapper, Lightkeeper) |
| CP8 | The Proving | at reference power, active passes in 1-3 tries; idle passes at >= 1.25x reference; never above 1.5x |
| CP9 | Idle vs active (each evolution, same save, 2 h at the push zone) | active 15-35% more damage; no evolution below 10% (active must matter) or above 45% (idle must be fine) |
| CP10 | Ability share: abilities, statuses and Finishers as a share of the Lanternbearer's own damage (bosses) | 25-50% for each class and evolution (swings still matter, abilities are not decoration) |
| CP11 | Counter value: a counter class or hero vs a matched elite trait, time to kill that elite | at least 25% faster than a non-counter at equal power |
| CP12 | Region fit: each evolution's push rate in each region, vs the average of the 6 | none below 0.85 in any region (Adder in Region 1 is exempt: it starts after it) |
| CP13 | Tanks and supports on hard walls (plan-4 2.9): Warden and Lightkeeper vs damage evolutions on bosses, pinnacles and the Deepwell median depth | Warden and Lightkeeper at least equal |
| CP14 | Migration: each legacy fixture, `totalDps()` and the hold zone after migration vs before | >= 0.97 (nothing felt as lost); Lightkeeper -> Lightkeeper >= 1.0 |

### 6.2 How the utility paths lift progress (plan-4 2.9)

- **Warden:** the Warden fills the tank role better than any tank hero, so the planner fields two damage
  heroes; Stand Fast's Empower (15% for 6 s of 18) and the +30% stagger (more x1.5 windows and
  Finishers) lift the party's damage; Holy Sparks with a Mark source turn the party's damage into
  healing (Judgement). Most of its hold gain becomes damage, because a healer slot is freed.
- **Trapper:** the pack-wide 20% Mark (8 s of 20) and a 30% Focus Mark lift every hit; Chill (-30% foe
  attacks) and Root cut incoming; and it gives every hero's hit a reaction (Shatter for heavy hitters,
  Blight for Burn heroes, Judgement for holy heroes). The Trapper's lift grows with the heroes you own.
- **Lightkeeper:** Given Light moves its own damage to the heroes (who scale better), Blessing (up to 60%) and
  Rally Hymn (30%) are the biggest timed buffs in the game, Sanctuary's overflow shields and holy ticks
  cover the healer slot, and ward plus heals free a slot. The
  Lightkeeper's measured lift today (formation 4.4: 0.94 of old, before the knob) is the floor.

BAL3 reports CP7 per region, and a "lift" line in the sim: party damage and push zone with the
Lanternbearer's utility evolution vs its base, same heroes.

### 6.3 Sim additions

- `--class warrior|ranger|mage` (legacy ids still accepted: they run the migration first).
- `--evo reaver|warden|venomstalker|trapper|warlock|priest` (evolves at the Fenmother on the first check-in
  after the gate; `--evo none` stays base).
- `--trial` runs the Proving at reference power, idle and active, and prints pass rates (CP8).
- Report rows: CP1-CP14, the spike (2.2 table, measured), and each class's damage split (swings, taps,
  `ab1`, `ab2`, statuses, reactions, Finishers).

---

## 7. Migration from the four old classes

### 7.1 The map

```js
const LEGACY_CLS = {
  warden:      { base: 'warrior', evo: 'warden' },
  ranger:      { base: 'ranger',  evo: null },
  lanternmage: { base: 'mage',    evo: null },
  lightkeeper: { base: 'mage',    evo: 'priest' }
};
```

Runs once (`S.cls.v` 0 -> 1, after SAVE1's automatic backup; core-2 8.1-3). Idempotent: it only runs when
`S.cls.base` is null and `S.party.cls` is a legacy key. A save with `S.party.cls` null and `chosen` false
(the "choose your path" screen) simply picks from the 3 new classes.

### 7.2 What happens to each part of a save

| Part | Warden -> Warrior + Warden | Ranger -> Ranger | Lanternmage -> Lanternmage | Lightkeeper -> Lanternmage + Lightkeeper |
|---|---|---|---|---|
| Class kit | Heavy hit (Grit), Shield Wall, the Warrior aura; plus Warden (Bulwark, Stand Fast) granted | unchanged (Focus is now a 25% Mark) | unchanged (Flare now also Burns) | Blessing tap, Keeper's Light aura, Rally Hymn (in `ab1`, as today), Given Light; plus Sanctuary (`ab2`) and Dawnbreak |
| Proven? | yes if past zone 35; else unproven (3.7) | Proving open if past zone 35 | Proving open if past zone 35 | yes if past zone 35; else unproven |
| Star maps | `maps.warden` copied to `maps.warrior` (same build) | kept | `maps.lanternmage` copied to `maps.mage` | points freed; "Suggested layout" for the Lanternmage map and Lightkeeper ring |
| Gear | Warden kinds are Warrior kinds (heavy): no change | Ranger kinds (medium): no change | Lanternmage kinds (light): no change | Lightkeeper kinds (censer, tome, mitre, vestments) become **light kinds any Lanternmage wears**; Lightkeeper-leaning lines (heal) stay. RG1 owns the final kind list, with the rule that no migrated item stops fitting |
| Class uniques and powers (`LEG_POWERS[].cls`) | `warden` powers work for any Warrior | unchanged | `lanternmage` powers work for any Lanternmage | `lightkeeper` powers work for a Lightkeeper |
| Deepwell boons (`b.cls`) | `warden` boons: any Warrior | unchanged | `lanternmage`: any Lanternmage | `lightkeeper`: Lightkeeper |
| Bonds | `sword`, `banner`: time kept, now any Warrior | `twobows`, `asked` kept | `page`, `chosen` kept | `unlit`, `candles` kept, now Lightkeeper |
| Titles, achievements, Feats | kept; the Warden title is granted | kept | kept | kept; the Lightkeeper title is granted |
| Mirrors | kept | kept | kept | kept |
| The look | Warrior base look + Warden lamp | unchanged | unchanged | Lanternmage base look + Lightkeeper lamp |

One toast, plain, once: "Classes changed. You are a Warrior on the Warden's path. Nothing was lost." /
"...a Lanternmage on the Lightkeeper's path..." / "...still a Ranger. Your Proving opens at the Fenmother." A "What
changed" link opens a short card with the three points that matter for that class.

### 7.3 Why nothing is lost

- Every id stays: `S.party.cls` is frozen, the legacy star maps stay in the save, Bond ids and times stay,
  item kinds stay, power and boon `cls` tags resolve through `lbHas()`.
- Every ability a legacy class had is still in its kit (Shield Wall, Flare, Volley, Rally Hymn, Blessing),
  and CP14 holds the power at 0.97 or better.
- Star points are derived; freed points are points to spend, and the maps that carry over carry over
  exactly.

---

## 8. Core-2 answers, change-log proposals, build split, decisions

### 8.1 Answers to core-2's open questions for CL1

1. **Base Ranger's Focus:** it is the **standard Mark status at 25%** (core-2 allows 15-30% per source).
   A Mark is a vuln (additive, target side), a little weaker in a stack than today's x1.25 multiplier, so
   25% keeps today's number for Ranger saves and the "Open Wound" stars read cleanly. The Trapper's Focus
   is 30%, other sources (Wren, Snare Field) 20%. The stronger Mark stays (core-2 3.1).
2. **The Lanternmage's base type:** **fire** (coordinator, 2026-09-28). The Warlock stands apart with Curse
   (stores and detonates the party's damage), Witchfire, Held Light and Dark Turned (it ignores fire
   resistance, so it is not locked out of the Emberwaste). Chill leaves the base Lanternmage: it comes from the
   Trapper and the frost heroes (Kestrel, Thessaly). Change-log 8.2-1 and 8.2-2.
3. **Hero base types:** section 5.1. Every type on 2+, every role with a non-physical hero.
4. **The +35% spike in buckets:** section 2.2: measured as party effective power (damage x hold), 1.30-1.40
   per evolution; the split per evolution in the table (C evolution lines, T meters, `ab2`, the role floor
   `heroFloor`, target-side vuln, hold).

CL1's view on CB2's question 9 (`autoEff`): keep auto-**taps** at 0.5 (a tap is the active verb; idle
already gets the meters), and cast **abilities** at full power when auto-cast, with timing (Stagger,
reaction windows) as the active bonus. CP9 checks the gap.

### 8.2 Proposed core-2 changes (added to core-2 section 10 as "proposed", pending sign-off)

1. **2.2 table, Lanternmage row:** base type `fire` (was `frost`); Warlock "adds" dark fire (type `fire`) and
   Curse; "Base Lanternmage keeps Chill" becomes "Base Lanternmage keeps Burn". Core-2 2.2 ("Frost: Lanternmage base") and
   roadmap-review 2.2 follow. (Formalises the coordinator's 2026-09-28 decision.)
2. **2.3, one class exception:** the Warlock's Curse detonations and Witchfire treat "resists fire" as
   neutral (Dark Turned). Weakness still counts. Needed for Region 3 parity (CP12).
3. **4.1, `ab1` for the Lightkeeper:** the Lightkeeper's `ab2` stays **Sanctuary** as core-2 4.1 and the owner say;
   its `ab1` is Rally Hymn (`hymn`, a `var` replacing Lantern Flare), so migrated Lightkeepers keep their
   ability in its slot. Elowen's signature (also "Sanctuary" today) is shown as Chapel Light (hero data,
   not core-2; decision D7).
4. **4.4, the ability data shape:** (a) an optional `var: { [evoId]: { type, fx, name } }` for an
   evolution's variant of a base ability or tap (the Lightkeeper's Rally Hymn in `ab1` and Blessing tap, the Warlock's
   cursing Flare); (b) new effect verbs `meter` ([`meter`, id, n]: add to a class meter), `trap`
   ([`trap`, `rearm` | trapId]) and `detonate` ([`detonate`, `curse`, x]: a Curse-ender with a
   multiplier); (c) `consume` also takes a class meter id (`bulwark`, `embers`); (d) optional per-fx
   options `{ perStack, base, ramp, hits, over, spread, to, v, overflow }` (`overflow`: healing past
   full HP becomes shield while the effect lasts, up to the 40% shield cap).
5. **1.3 and 3.1, class meters:** Grit, Fury, Bulwark, Embers and Blessing are class meters, not
   statuses. Each feeds one named buff in bucket T whose value follows the meter, so the named-buff rule
   holds. Embers are a per-foe counter shown as pips, not a status badge.
6. **1.3 bucket Y, class auras:** class and evolution auras (Shieldmates, Hunters' Company, Kindred
   Sparks, Keeper's Light, Oath of the Order) sit with the slot jobs, outside the +40% cap, as
   `HERO_CLASSES[].aura` works today.
7. **4.5 Tactics:** new conditions `stacks` (status id, n) and `meter` (meter id, n or %). Meter ids:
   `grit`, `fury`, `bulwark`, `embers`, `blessing`, `traps` (charges), and `curse` (the focus foe's stored
   Curse damage as a % of its cap).
8. **7.1 glossary:** add **Grit, Fury, Bulwark, Blessing, Trap, the Proving**; "Evolution: a new path for
   your class, opened by the Proving at the end of the Hollow".
9. **8.2, `S.cls`:** the final shape is classes-2.md 3.5 (adds `proven`, `free`, `at`, `auto`, `mig`,
   `from`; `trials` entries `{ n, won, best }`).

### 8.3 Build split: S2 (base classes and migration) and S3 (evolutions)

Helpers every reader uses (S2 adds them in `55-classes.js`):

```js
lbClass()  -> { base, evo, evo2 }        // from S.cls; before migration, from LEGACY_CLS[S.party.cls]
lbHas(tag) -> bool                       // tags: 'base:warrior', 'evo:priest', and legacy data tags
                                         // 'cls:warden' (Shield Wall kit: every Warrior), 'cls:lanternmage'
                                         // (Flare kit: every Lanternmage), 'cls:ranger', 'cls:lightkeeper' (Lightkeeper)
lbRole()   -> 'tank' | 'striker' | 'caster' | 'support'   // evolution role, else the base role
lbHome()   -> 'front' | 'mid' | 'back'
```

Legacy data tags let item kinds, legend powers, Deepwell boons and Bonds keep their `cls: 'warden'`
fields unchanged; only the readers change.

**S2: three base classes + migration + star maps for 3 classes** (after S1 and SAVE1; Opus, L)

| File | Owner | What |
|---|---|---|
| `src/js/24-data-classes.js` (new, data only) | S2 | `CLASS_DEFS` (3 bases: stats, home, role, aura, pitch, how), `CLASS_ABILITIES` (taps, `ab1`s, base Finishers in the 4.4 shape), `LEGACY_CLS`, `CLS_TUNE` (`evoLv`, `unproven`, respec costs), empty `EVO_DEFS` |
| `src/js/55-classes.js` (new, core) | S2 | `registerState('cls')`, the migration (7), `lbClass`, `lbHas`, `lbRole`, `lbHome`, class meters Grit and Embers, `chooseBase()`; the toast |
| `src/js/55-party.js` | S2 | Kits read `CLASS_ABILITIES` instead of `HERO_CLASSES` switch arms; `HERO_CLASSES` stays as a legacy view built from the new data (4 legacy keys) so untouched readers keep working during the slice; `useMirror` routes to the respec flow stub |
| `src/js/57e-constellations.js`, `src/js/75-stars-ui.js` | S2 | `warrior`/`mage` maps, text changes, the stars migration (4.4), `starCls()` via `lbClass()`, ring anchor points (empty until S3) |
| `src/js/76-create.js`, `src/js/75-party-sheet.js`, `src/js/75-party.js` | S2 | Choose from 3 classes; the class card (base, locked evolution row, locked tier-2 row) |
| Readers of `S.party.cls` (small edits, one line each where possible): `41-items.js`, `55-legend.js`, `56-roster.js`, `56b-synergy.js`, `56d-autofield.js`, `56e-formation.js`, `56f-bonds.js`, `57c-codex.js`, `57d-deepwell.js`, `59-combat.js`, `59c-deepwell-combat.js`, `60b-baker.js`, `62-stage.js`, `70-ui.js`, `75-bonds-ui.js`, `75-craft-ui.js`, `75-deeds-ui.js`, `58-deeds.js` + `23-data-deeds.js` (Feat text 4 -> 3 maps) | S2 (coordinate with the file owners) | `S.party.cls ===` -> `lbHas()` / `lbClass()` |
| `tools/sim.mjs`, `tools/check.mjs`, `tests/fixtures/` | S2 | `--class` for 3 bases; check section "classes": each legacy fixture (one per old class) migrates once, idempotent, CP14; a fresh save chooses each base |

**S3: the six evolutions** (after S2; Opus, L)

| File | Owner | What |
|---|---|---|
| `src/js/24-data-classes.js` | S3 | `EVO_DEFS` (6: stats, role, aura, meters, title, lamp colour, choice card copy), `ab2`s, evolution Finishers, `var`s, trial data, ring star data |
| `src/js/55-classes.js` | S3 | the gate, the Proving state, `chooseEvo()`, the respec flow and costs, `proven`, Mirrors from Great Lanterns, Tactics unlock flags |
| `src/js/59e-class-combat.js` (new, core) | S3 | the evolution mechanics on S1's status engine: Fury, Blood Price, Cinder Edge; Bulwark, Holy Sparks, stagger aura; Venom ramp, Seep, Patient Hunter; traps, Tripwire; Hex, Held Light, Dark Turned; Given Light, Blessing; Finisher data exposed for S6 |
| `src/js/59f-trials.js` (new, core) | S3 | the three Provings (solo fight setup on the existing combat loop, pass rules, reference scaling) |
| `src/js/75-class-ui.js`, `src/styles/61-class.css` (new) | S3 | the Proving entry, the choice card (3.3), the confirm, the respec sheet, the ceremony |
| `src/js/57e-constellations.js` | S3 | the evolution rings (`e1s*`), ring keystone rule |
| `src/js/56b-synergy.js`, `src/js/56f-bonds.js` | S3 (small edits) | Bond re-keys and evolution lines (5.2), the 5 new Bonds, combos via `lbRole()` |
| `src/js/21f-stories-bonds.js` | LORE/CHAR1 writer | stories for the 5 new Bonds (placeholders "Story coming soon" until then) |
| `src/js/12a-art-body.js` and art files | CHAR1 / art (later) | evolution looks; S3 ships lamp colour and a tint only |
| `tools/sim.mjs`, `tools/check.mjs` | S3 | `--evo`, `--trial`, CP4-CP13 |

Finishers are data in S2/S3 and fire only when S6 adds the stagger bar. Statuses and reactions come from
S1; S2/S3 only apply them.

### 8.4 Decisions

**For the owner**

- **D1. The evolution level gate.** Plan-4 says level 60+, but the Lanternbearer is about level 39 at the
  Fenmother (day 8) today, and level 60 is about month 3. Recommended: **level 35 plus the Fenmother beaten**,
  so the Proving opens at the end of Region 1 as planned. (Alternative: keep 60 and move the Proving into
  Region 2, which then has to be tuned for base classes.)
- **D2. The trial's name.** "Trial" is taken by the Deepwell's weekly Trial. Recommended: **the Proving**.
- **D3. Second thoughts.** One free switch within 10 minutes of choosing, once per save. Recommended: yes
  (a misclick on a permanent choice should not cost a Mirror).
- **D4. Migrated Wardens and Lightkeepers below zone 35.** They keep their kit, but the new evolution
  parts run at 60% and the title waits until they pass the Proving. Recommended: yes (it keeps early pace
  fair between old and new saves without taking anything away).
- **D5. Titles:** the Red Lamp, the Holdfast, the Quiet Thorn, the Waylayer, the Firethief, the Given
  Light. They join the title list (`codexTitles()`, ids `c_<evo>`).
- **D6. The Warlock ignores fire resistance** with its Curses and Witchfire (Dark Turned). Without it one
  of six paths is weak for a whole region.
- **D7. Two abilities called Sanctuary.** The owner named the Lightkeeper's ability Sanctuary, and Saint
  Elowen's signature has that name today. Recommended: the Lightkeeper keeps **Sanctuary**; Elowen's
  signature is shown as **Chapel Light** (she relit the chapel; display name only, id and numbers kept).
  The Lightkeeper's `ab1` is Rally Hymn, so migrated Lightkeepers keep the ability they know.
- **D8. Blessing values.** Kept at today's +20% a level (up to +60% at III) so a Lightkeeper loses nothing
  when it becomes a Lightkeeper. BAL3 may lower it only if the Lightkeeper breaks CP4 on the high side.

**For the coordinator**

- **C1.** Sign off the change-log lines 8.2-1 to 8.2-9 (and tell RG1 and CB2 which ones touch them: 8.2-4
  and 8.2-7 touch CB2 and S7; 8.2-1 touches RG1's `pwFire`/`pwFrost` buff item regions for the Lanternmage).
- **C2.** The star-map cap curve with evolution rings: keep +15/25/35% at L20/40/60 (BAL3 trims minors to
  fit the ring), or allow +38% at L60 with a ring.
- **C3.** HER (heroes 19-32): add 2 poison heroes and a physical support to even out 5.1.
- **C4.** CHAR1 gets 3.3's choice card copy, 2.x visual notes and the 18 x 6 hero reaction lines.
- **C5.** RG1: the Lightkeeper's item kinds become light kinds any Lanternmage can wear (7.2); Lightkeeper lines lean
  to `heal`, `ward`, `pwHoly`; Warlock to `spell`, `stPow`, `pwFire`, `area`.
- **C6.** Core-2 8.1-2 and 8.2 still reserve `S.fatigue` and say fatigue must not reuse `S.rested`,
  but the coordinator's Q13 decision merged fatigue into Rested (one per-hero meter, `rested` extended).
  CL1 uses neither; S7's owner should update those two lines in core-2's change log.
- **C7.** Core-2 7.1 says the Proving opens "at the end of the Hollow" only once D1 is settled; if the
  owner keeps level 60, the glossary line and 3.1 here change together.

---

## Appendix: numbers in one place (`CLS_TUNE` starting values)

```js
CLS_TUNE = {
  evoLv: 35, unproven: 0.6, secondThoughtsMin: 10,
  respec: { evo: { mirrors: 1, essHours: 2 }, base: { mirrors: 2, essHours: 4 }, t2: null, esc: 0.5, escMax: 3 },
  trialRef: { L: 35, grade: 3, plus: 3, stars: 0 }, trialIdlePass: 1.25,
  grit: { v: 0.03, dr: 0.01, max: 5, t: 10 },
  embers: { max: 5 },
  fury: { heavy: 8, heavyAuto: 4, hit: 3, rend: 15, kill: 5, idleAfter: 3, drain: 10, per10: 0.02,
          cinderAt: 50, cinder: 0.5, stopAt: 100, stopT: 4, stopCd: 20 },
  bloodPrice: { at: 0.5, dmg: 0.2, leech: 0.04, leechCap: 0.03 },
  bulwark: { max: 10, block: 1, parry: 3, cover: 1, spark: 0.3, drainOut: 1, stag: 0.3, backDr: 0.1 },
  venom: { every: 3, focus: 2, volley: 1, seep: 0.5, seepJumps: 3, perStack: 0.02, perStackMax: 0.2 },
  traps: { charges: 2, back: 10, snare: 1.5, pit: 1.0, pitVenom: 4, bossStag: 24 },
  given: { own: 0.4, share: 1 }, blessing: [0.2, 0.4, 0.6], blessT: 6, blessIdle: 0.5,
  sanctuary: { regen: 0.8, t: 6, smite: 0.6 },
  hex: { embersToCurse: 3, heldLight: 0.1, heldCap: 0.3, darkTurned: 1, creepJumps: 3 },
  heroFloor: { warrior: 1.0, ranger: 0.7, mage: 1.0, reaver: 0.62, warden: 1.0,
               venomstalker: 0.75, trapper: 0.7, warlock: 1.0, priest: 0 }
};
```
