# Core 2.0 glossary: the shared rulebook (CORE-G)

This is the one rulebook for Core 2.0. **CL1** (classes), **RG1** (resources and gear) and **CB2** (active
combat) all write against it. Slices S1-S7 build from it, and GUIDE turns section 7 into the in-game guide.

How to use it:

- **Ids, formulas, caps and the stacking order are fixed here.** A spec may pick values *inside* a stated
  range. To go outside a range, or to add a stat, status, type or id, add a line to the change log (section 10)
  and get the coordinator's sign-off. The other two designers then re-read that line.
- **Numbers are starting values** for the sim (BAL3 tunes them per slice). Names and ids are not.
- It fits the code as it is today: `40-rules.js` (formulas), `41-items.js` / `21-data-craft.js`
  (`CRAFT_STATS`, kinds, affixes), `55-party.js` (class, ability, auto-cast), `56b-synergy.js` (jobs,
  combos, Kin, Bonds, the +40% cap), `59-combat.js` (units, armour, threat, shields), `59b-enemies.js`
  (behaviours, telegraphs, parry). Where Core 2.0 changes something that exists, the section says so.

Sources: plan-4.md sections 2-5 (scope), roadmap-review.md Part 2 (worked numbers), wave-log owner
decisions to 2026-09-28, formation.md (slots and the synergy caps), lore.md (regions, foes, the light).

---

## 0. Words used in this document

| Word | Meaning here |
|---|---|
| **unit** | Anything that fights: the Lanternbearer, a hero, a foe |
| **the Lanternbearer** (`lb`) | The player's character. Code still says "hero" (`heroAtk`, `S.party.cls`); new code says `lb` |
| **hero** | A recruited character (code: companion, roster character) |
| **P** (power) | A unit's **hit power**: the damage of one plain hit before the target. Lanternbearer: `heroAtk()` x its damage buckets. Hero: `charDps / swing speed`. Statuses and abilities are written as multiples of P |
| **coef** | A multiple of P. "Rend: 3 P physical" means 3 x P, then the target side |
| **grade** | An item or material tier, 1-15 (player word: **Tier**) |
| **pack** | The foes on the field at once (a boss and its adds count as a pack) |

---

## 1. Stats

### 1.1 The stat list

Every unit stat, its id, what it does and its cap. **Existing ids keep their meaning** (they are
`CRAFT_STATS` keys and `gear()` keys; old saves depend on them). New ids are marked **new**.

| Id | Player name | What it does | Cap (total) |
|---|---|---|---|
| `attack` | Attack | +% to the Lanternbearer's own P | - |
| `might` | Damage | +% damage for the whole party (it feeds `dmgMult()`) | - |
| `party` | Party damage | +% damage for heroes only | - |
| `pwPhys` `pwHoly` `pwPoison` `pwFire` `pwFrost` | Physical / Holy / Poison / Fire / Frost power | **new.** +% damage of that type dealt by the wearer, statuses of that type included | - |
| `spell` | Ability power | +% damage, healing and shields from **abilities**, signatures and Finishers (today it is "Spell power", exposed through `spellMult()` and not wired; Core 2.0 wires it with this meaning) | - |
| `stPow` | Status power | **new.** +% damage of damage-over-time statuses and of reaction damage (Blight ticks, Curse detonations) | - |
| `control` | Control | Stuns, Chill and Root last +% longer (existing line) | +100% (hard caps in 3.4 still apply) |
| `stag` | Stagger | **new.** +% stagger filled on bosses and elites | +50% |
| `crit` | Crit | Crit chance, added to the base (Lanternbearer 8%, strikers 15%) | gear lines 35%; total 75% |
| `critMult` | Crit damage | + to the crit multiplier (Lanternbearer base x4, strikers x3: unchanged) | - |
| `aspd` | Attack speed | +% swings a second | gear 40%; total x2 swing speed |
| `haste` | Haste | -% ability cooldown (charges fill faster) | gear 30%; all sources together 50% (`cdMin`) |
| `area` | Area | +% splash (the share of a single-target hit that also lands on the rest of the pack) | +50% |
| `pierce` | Pierce | Ignores % of a foe's armour | 100% |
| `hp` | Max HP | +% max HP | - |
| `armour` | Armour | Flat rating. Physical damage taken x (1 - A / (A + 100)); typed hits use half the rating | 60% reduction |
| `resHoly` `resPoison` `resFire` `resFrost` | Holy / Poison / Fire / Frost resist | **new.** -% damage taken of that type | 50% each |
| `block` | Block | Chance to block a hit for half damage (`blockX` 0.5) | 40% |
| `threat` | Threat | +% threat generated | +100% |
| `heal` | Healing | +% healing done | - |
| `ward` | Ward | Overhealing becomes a shield, up to % of max HP | 40% of max HP |
| `gold`, `ess`, gathering lines | (unchanged) | Economy lines stay as they are | (existing caps) |

Rules:

- **No new stat without a change-log line.** CL1, RG1 and CB2 build from this list only.
- **Physical has no resist stat.** Armour is the physical resist.
- Heroes read the same ids from their own gear (`charGear(id)`) plus their role's base stats (`ROLE_STATS`).
- Stats a unit cannot use are still shown, with the line greyed and "does nothing for a Warrior", so no
  item is a trap.

### 1.2 Damage out: the one formula

Every hit, tick, ability, signature and Finisher runs through this, in this order:

```
raw  = P x coef                                             (coef from the ability or status; plain hit = 1)
     x (1 + Σ gear%)                                        bucket G: every additive % line of the right kind
     x Π character                                          bucket C: class, evolution, level, Awakening, Rested
     x Π party                                              bucket Y: slot job x capped(combos, Kin, Bonds) x trioX
     x Π account                                            bucket A: mod('dmg') etc. (relics, Almanac, stars, camp trees, Deepwell boons)
     x Π timed buffs                                        bucket T: Empower, Keen, Shield Wall, Rally Hymn...
     x crit                                                 1 or the crit multiplier (status ticks never crit)
hit  = raw x typeMult x (1 - armourCut) x (1 + Σ vuln) x staggerX x timingX
```

The **target side** (the second line):

| Factor | Value |
|---|---|
| `typeMult` | Weak x1.5, neutral x1, resists x0.6 (section 2.3) |
| `armourCut` | Physical only: foe armour after pierce. "Armoured" foes cut 25% (today `armourX` 0.85 = 15%; CB2 picks 15-25%) |
| `Σ vuln` | "Takes more damage" effects **add together**: Mark +20%, others. Total cap +60% |
| `staggerX` | x1.5 while the foe is Staggered (section 6.4), else 1 |
| `timingX` | x1.25 for an **ability** that lands during Stagger or in a reaction window (3.5), else 1 |

### 1.3 The stacking order (one rule for everything)

**Inside a bucket, the same stat adds. Buckets multiply.** That is how `dmgMult()` works today, so old
numbers do not move.

| Bucket | What goes in it | How it combines | Cap |
|---|---|---|---|
| **G: gear** | Base lines, affixes, Masterwork, **socketed buff items**, unique items' stat lines, hero gear | adds (per stat) | per-stat caps in 1.1 |
| **C: character** | Class and evolution base stats and passives, level (`lvlMult`), Blade, hero rank and drills, **Awakening** passives, the fatigue Rested bonus | multiplies | - |
| **Y: party** | Slot jobs (outside the cap), combos, Kin, **Bonds** (including Bonds that react to the Lanternbearer's class), `trioX` | multiplies | combos + Kin + Bonds: +40% damage and -20% damage taken per member (formation 2.5, unchanged) |
| **A: account** | Everything behind `mod()` / `bonus()`: relics, Almanac Dares, constellations, camp building trees, Deepwell boons, **unique powers** (inside the existing legend budget cap, +30/+45/+70% at ranks I/III/V) | multiplies | the legend budget cap for powers; building trees' damage nodes are capped by WC1 |
| **T: timed** | Buffs with a timer, from abilities, statuses, dodges and procs | multiplies; **a named buff never stacks with itself** (it refreshes; the stronger one wins) | - |
| **target** | Type, armour, vulnerability, Stagger, timing | as 1.2 | vuln +60% |

**Copy rule that matches the maths:** "+x% damage" is always an additive line (bucket G, or a stat inside
its bucket). "x% **more** damage" is a separate multiplier (buckets C, Y, A or T). Every spec and the
guide use this wording, so a player can read how two effects combine.

### 1.4 Damage in

```
taken = hit x (1 - armourCut)                       physical: A / (A + 100), max 60%; typed: half the rating
            x (1 - res[type])                       typed only, max 50%
            x Π (1 - dr)                            Guard, Shield Wall, tankDr, cover, synergy DR (-20% cap)...
            x (1 + Σ vuln on the unit)              the party can be Marked too (enemy Mark)
floor: taken >= 20% of hit                          no stack of reductions goes past 80%
then:  shield absorbs first, then HP; block halves the hit before the shield
```

Enemy hits carry a type like player hits (section 2). Region foes hit with their region's types.

### 1.5 Healing, shields, threat

- **Heal** = P x coef x (1 + `heal`) x buckets C, Y, A, T. Curse on the target: no healing. Venom 5+
  stacks on a foe: its healing received is halved (the anti-heal rule, 3.2).
- **Shield** = the same maths as heal. One shield pool per unit (sources add into it), capped at 40% of
  max HP (60% while Guarded), lasts 6 s from its last top-up (`shieldT`).
- **Threat** stays as today (`threat` by role, x `thX`, switch at +20%). Taunt overrides it (3.3).

---

## 2. Damage types

### 2.1 The five types

| Id | Name | Icon shape (7x7 on stage, 9x9 in menus) | Colour (Okabe-Ito, colour-blind safe) | Lore |
|---|---|---|---|---|
| `phys` | Physical | **blade** (a diagonal sword) | bone white `#E8E4DA` | Steel and weight |
| `holy` | Holy | **sun** (a disc with 4 rays) | yellow `#F0E442` | Lantern light: the dark steps back from it |
| `poison` | Poison | **drop** (a teardrop) | bluish green `#009E73` | Spore, venom, rot |
| `fire` | Fire | **flame** (3 tongues) | vermillion `#D55E00` | Ordinary fire, the dark's stolen red light |
| `frost` | Frost | **flake** (a 6-point star) | sky blue `#56B4E9` | Cold sea, the Pale Reach |

Accessibility rules (A11Y, S1):

- **Never colour alone.** Every typed damage number is drawn with its icon in front. A weakness hit adds a
  `▲` after the number; a resisted hit adds `▼`.
- The icon shapes differ in outline, so they read in greyscale. Check them in the three colour-blind filters
  and in greyscale before merge.
- Crits: bigger number plus a `!`, never a colour change only.
- Status badges (3.1) carry their own shapes. Stack counts are digits on the badge.

### 2.2 Where types come from

- **Every hit has exactly one type.** A plain Lanternbearer or hero swing is the unit's **base type**.
- **Class base types** (CL1 fills the kits; the type identities are fixed here):

| Class | Base type | Evolution | Adds | Signature statuses |
|---|---|---|---|---|
| Warrior | `phys` | **Reaver** | `fire` (embers on cleaves) | Bleed |
| | | **Warden** | `holy` (procs on blocks and counters) | Taunt, Guard |
| Ranger | `phys` | **Venomstalker** | `poison` | Venom |
| | | **Trapper** | `frost` + `poison` (traps) | Mark, Root, Chill |
| Mage | `frost` | **Warlock** | `fire` | Burn, Curse |
| | | **Priest** | `holy` | Shield, Regen, Cleanse |

  Base Ranger keeps Mark (its Focus tap today). Base Mage keeps Chill.
- **Heroes:** each hero has one base type (`ROSTER[id].dt`, **new**, data only) and at most one status their
  signature applies. Rule for CL1: of the 18 heroes, each type is on at least 2, and each role has at least
  one non-physical hero. Heroes 19-32 (HER) fill gaps by region.
- **Gear** never changes a hit's type. Type **power** (`pw*`) and **resists** (`res*`) come from gear and
  buff items.
- **Unique powers** may convert (for example "Venom you apply also Chills"), but a power never changes the
  type of a plain swing.

### 2.3 Weakness and resistance

| Relation | Multiplier | Shown as |
|---|---|---|
| Weak | x1.5 | `▲` on the number; "Weak to fire" in the bestiary |
| Neutral | x1 | - |
| Resists | x0.6 | `▼`; "Resists poison" |

- A foe has **at most 1 weakness and 2 resistances**. Nothing is immune to a damage type (a player must never
  be locked out of a zone by their class).
- **Armoured** is not a resistance. It is armour (1.2), and `pierce` beats it.
- Families (foe data field `fam`, **new**). A foe takes its family's row; its own data may add one resist:

| Family `fam` | Weak | Resists | Examples |
|---|---|---|---|
| `beast` | poison | - | Cave Bat, Barrow Beetle, Stormgull |
| `plant` | fire | poison | Moss Slime, Spore Cap, Kelp Strangler |
| `undead` | holy | poison | Rattlebones |
| `spirit` | holy | phys | Marsh Wraith |
| `construct` | frost | poison | Quarry Golem, Coral Warden (armoured) |
| `drowned` | holy | frost, fire | Drowned Deckhand, Brine Witch, Lanternjelly |
| `ember` | frost | fire | Emberwaste foes, the Pyre Knight |
| `pale` | fire | frost | Region 4 (LORE-R45 confirms) |
| `deep` | holy | - | Deepwell foes; Region 5 (LORE-R45 confirms) |

- Bosses use their family's row. A region boss may add one resist (the Pyre Knight: fire).
- Region profiles (so RG1's buff items and CB2's elites line up): the Hollow tests physical and poison
  (beasts, plants, undead); the Coast is holy-weak and frost-resistant; the Emberwaste punishes fire and
  rewards frost; the Pale Reach reverses that; the Long Stair rewards holy.

---

## 3. Statuses

### 3.1 The list

One global **status tick every 1.0 s** (all damage-over-time lands on the same beat, which is cheap with
10 foes and easy to read). Durations count down in real time. `P` is the applier's power **when applied**
(a snapshot).

**Harmful, on foes** (from the party):

| Id | Name | Type | Effect | Duration | Stacking | Badge shape |
|---|---|---|---|---|---|---|
| `bleed` | Bleed | phys (ignores armour) | 0.08 P a tick per stack | 6 s | up to **5** stacks; a new stack refreshes all | three slashes |
| `venom` | Venom | poison | 0.04 P a tick per stack, x(1 + 0.1 x stacks) (ramps: 10 stacks = 0.8 P a tick) | 8 s | up to **10**; a new stack refreshes all; at 5+ the foe's healing is halved | drop with a digit |
| `burn` | Burn | fire | 0.12 P a tick | 4 s | 1 per foe (the stronger one stays) | small flame |
| `chill` | Chill | frost | Foe attacks and casts 30% slower (bosses 15%) | 4 s | 1 per foe (refresh) | flake |
| `stun` | Stun | - | The foe does nothing; a stun interrupts a cast | 1-3 s | no stacking; diminishing returns (3.4) | spiral |
| `root` | Root | - | The foe cannot move, dive or step in; it still attacks what it can reach | 3 s | no stacking; diminishing returns | chain link |
| `mark` | Mark | - | +20% damage taken from all sources (vuln, 1.2). A source may set 15-30% | 8 s | 1 per foe (the stronger one stays) | crosshair |
| `curse` | Curse | fire (detonation) | No healing. Stores 20% of all damage the foe takes. Detonates at the end (or when a Curse-ender hits it): the stored damage as fire to the foe, and 50% of it to the rest of the pack | 6 s | 1 per foe; stored damage caps at 10 P of the curser | cracked ring |

- **Burn spreads on death:** when a Burning foe dies, its Burn jumps to the 2 nearest living foes with the
  time it had left (at least 2 s). A spread Burn can spread again, up to 3 jumps from the first.
- Status damage uses `stPow`, the type's `pw*`, and the applier's buckets C, Y, A and T **at application**.
  It ignores crit.

**Harmful, on the party** (from foes). Enemy damage-over-time is a share of the **target's max HP**, as
the Spore Cap's poison is today:

| Id | On a party member |
|---|---|
| `bleed` | 1% max HP a tick per stack, up to 5 |
| `venom` | 0.5% max HP a tick per stack, ramping as above, up to 10 (the Spore cloud becomes Venom) |
| `burn` | 2% max HP a tick |
| `chill` | Attacks and ability charge 30% slower |
| `stun`, `root` | As on foes. The Kelp Strangler's hold is a Root; a boss's grab is a Stun |
| `mark` | The member takes +20% |
| `curse` | No healing on that member (the Cursed elite and the Brine Witch's hex) |

Cap: all damage-over-time on one party member together is at most 5% of max HP a tick.

**Helpful** (on the party, and on foes when an enemy healer casts them):

| Id | Name | Effect | Rule |
|---|---|---|---|
| `shield` | Shield | Absorbs damage | One pool per unit, cap 40% max HP (1.5), 6 s |
| `regen` | Regen | Heals a share of P a tick | One per unit (the stronger one stays) |
| `guard` | Guard | Takes x% less damage (a `dr` in 1.4) | Named: Shield Wall, Bulwark, Stand Fast... Each name once |
| `empower` | Empowered | x% more damage (bucket T) | Named per source; Rally Hymn is one |
| `quick` | Quickened | x% faster attacks | Named per source; Volley's haste is one |
| `keen` | Keen | 20% more damage for 3 s after a **perfect dodge** | One |
| `taunt` | Taunting | Foes in reach must attack this unit | 3 s (`tauntT`); bosses obey taunt |

**Action (not a status):** `cleanse` removes one harmful status (all its stacks) from an ally; a Priest's
cleanse removes two. Cleansing a Curse makes it detonate on nobody (the stored damage is lost).

### 3.2 Anti-heal

Foes that heal (Marsh Wraith, Vampiric elites, the Brine Witch) are countered by **Curse** (no healing) and
**Venom 5+** (half healing). They do not stack: Curse wins.

### 3.3 Taunt

A taunted foe attacks the taunter if it can reach it. Divers taunted mid-dive end the dive (as today).
Bosses obey taunt, at full duration: holding a boss is the tank's job. Taunt does not stop a cast bar.

### 3.4 Crowd control on elites and bosses

| Target | Stun | Root | Chill | Mark, DoT, Curse |
|---|---|---|---|---|
| Normal foe | full | full | full (30%) | full |
| Elite / champion | half duration | half duration | full | full |
| Boss | **immune**: each second of stun it would take fills **8 stagger** instead | immune | 15% slow | full; Curse stores at most 10 P |

- **Diminishing returns** (stun and root, per foe): a second one within 8 s lasts half; a third is ignored;
  8 s with none resets it.
- **Hard caps** after `control`: stun 3 s, root 4 s, chill 6 s.

### 3.5 Reactions: Blight, Shatter, Judgement

Two statuses or a status and a hit, on one foe, from any sources (the Lanternbearer, a hero, or both).
Player term: **reaction** (see 7.2: "combo" is already the formation word). The stage flashes the name;
with reduced motion it is text only, no shake.

| Id | Name | Trigger | Effect | Limit |
|---|---|---|---|---|
| `blight` | **Blight** | Venom and Burn on the same foe | Every Burn tick also triggers one Venom tick (all stacks). When a Blighted foe dies, its Burn spread carries half its Venom stacks | While both last |
| `shatter` | **Shatter** | A **heavy** hit on a Chilled foe | That hit deals x2 and removes the Chill. On a boss or elite, +20 stagger | Once per Chill |
| `judgement` | **Judgement** | **Holy** damage on a Marked foe | Heals every party member for 10% of the holy damage dealt | Healing from Judgement: at most 5% of each member's max HP a second |

- **Heavy** is a hit tag (4.4): Warrior taps, abilities tagged `heavy`, Finishers, and any single hit of 3 P
  or more. Crits are not heavy by themselves.
- **Reaction window:** for 3 s after a reaction on a foe, abilities that land on that foe get `timingX`
  x1.25 (1.2). The same bonus applies during Stagger. They do not stack.
- Reaction damage (the extra Venom ticks, Curse detonations) uses `stPow`.
- Room for more: new reactions take new ids in the `rx` table, via the change log. Candidates for later
  tiers: Fire + Chill ("Thaw"), Bleed + Curse.

---

## 4. The ability model

### 4.1 What a unit can do

| Thing | Who | Id | Notes |
|---|---|---|---|
| **Swing** | everyone | - | Plain hits at attack speed, base type |
| **Tap** | Lanternbearer | `tap` | The class tap (today: Heavy hit, Ember, Focus, Blessing). It also parries (the last 0.8 s of a heavy telegraph) and dodges (6.3) |
| **Ability slot 1** | Lanternbearer | `ab1` | The base class ability. Always there |
| **Ability slot 2** | Lanternbearer | `ab2` | Unlocks with the **first evolution** (the evolution's named ability: Rend, Stand Fast, Toxic Bloom, Snare Field, Hex Nova, Sanctuary) |
| **Ability slot 3** | Lanternbearer | `ab3` | **Reserved** for the second evolution tier (after 1.0). Save and UI leave room; nothing fills it in 1.0 |
| **Finisher** | Lanternbearer | `fin` | One per Stagger (6.4). Class-specific, 6-10 P, tags `heavy`, `finisher` |
| **Signature** | each hero | `sig` | The hero's one ability, on the same model. Awakening upgrades it (`sig` rank 2) and adds a passive |
| **Passives** | everyone | `pas` | Always-on rules (class core mechanic, evolution mechanic, hero traits) |

### 4.2 Charge and cooldown

- Each ability has a **charge** meter. It fills at `1 / cd` a second, x 1 / (1 - `haste`), with all
  cooldown reduction together capped at 50% (today's `cdMin`).
- Sources may add charge directly ("+10% charge on a crit"). They are listed in the ability data.
- An ability holds **1 charge**. A power or boon may raise that to 2 (today's Deepwell spare charge).
- **Cast when ready** (auto-cast) fires at the first valid target. Tactics (4.5) can hold a charge or aim
  it. A manual cast has the same power as an auto-cast. **Active play is rewarded through timing** (Stagger,
  reaction windows, interrupts, dodges), not through a penalty on idle play. CB2 decides whether today's
  `autoEff` 0.5 stays for the no-Tactics auto-cast.
- **Cooldown ranges:** `ab1` 20-40 s, `ab2` 12-30 s, `sig` 8-20 s (today 8-20 s).

### 4.3 Targeting

| Id | Hits | Notes |
|---|---|---|
| `self` | the caster | |
| `ally` | one party member | default: the lowest HP% (heals) or the one being hit (shields) |
| `party` | every party member | |
| `slot` | the party member in one slot (Front, Middle or Back) | taunts, covers, swaps |
| `single` | the focus foe | |
| `line` | one enemy column (Front, Mid or Back), every foe in it | big packs fill columns with several foes |
| `pack` | every foe on the field | a boss's adds included |
| `chain:n` | the focus foe, then up to n-1 more, nearest first | bounces |
| `splash` | `single`, plus `area` % of the hit to every other foe | casters today (`aoeOther`) |

Reach (who can target which enemy column) stays as formation.md 1.1 says.

### 4.4 The ability data shape

CL1 writes abilities and signatures in this shape; CB2 and S7 read it. Nothing outside it is allowed
without a change-log line.

```js
{ id: 'rend', slot: 'ab2', cls: 'reaver', cd: 18, target: 'line', type: 'phys',
  tags: ['heavy'],                       // heavy | dot | aoe | heal | shield | cc | interrupt | finisher | taunt | cleanse
  fx: [                                  // run in order
    ['dmg', 2.5],                        // coef x P, the ability's type
    ['apply', 'bleed', 2],               // status id, stacks (duration from 3.1 unless given: ['apply','bleed',2,8])
    ['stagger', 10],                     // stagger fill on bosses and elites
  ] }
```

Effect verbs: `dmg`, `apply`, `consume` (a status: returns its stacks for scaling: "+30% per Venom stack
consumed"), `heal`, `shield`, `taunt`, `cleanse`, `buff` (a named timed buff), `stagger`, `charge` (to
another ability), `move` (a party member to a slot). Numbers are coefficients of P or seconds.

- **Interrupts:** any Lanternbearer ability that hits a foe with a cast bar interrupts it. A hero's
  signature interrupts only if it is tagged `interrupt` or it stuns.
- **Heroes' signatures** use exactly this shape with `slot: 'sig'`. Today's signature numbers
  (`abF` 1/6 of their damage, `COMBAT_TUNE.abCd`) are the starting point.

### 4.5 Tactics ids (for S7; CB2 may add conditions)

A rule is `IF condition THEN action`. Heroes get 3 rule slots, the Lanternbearer 2. Unlocks come with
evolutions and Awakenings. Stored as `[condId, arg, actId, arg]`.

| Condition id | Arg | True when |
|---|---|---|
| `always` | - | always |
| `bossHp` | % | a boss is below the %HP |
| `allyHp` | % | any party member is below the %HP |
| `selfHp` | % | this unit is below the %HP |
| `foeHas` / `foeLacks` | status id | the focus foe has / lacks the status |
| `allyHas` | status id | a party member has the (harmful) status |
| `packSize` | n | n or more foes are standing |
| `elite` | trait id or `any` | an elite with that trait is on the field |
| `staggerFull` | - | a foe is Staggered |
| `staggerNear` | % | a stagger bar is above the % |
| `castBar` | `any` or `sig` | a foe is casting (a boss signature cast) |
| `telegraph` | telegraph id | that warning is showing |
| `phase` | 1-3 | the boss is in that phase |

| Action id | Arg | Does |
|---|---|---|
| `use` | `ab1` `ab2` `sig` | use that ability now (if charged) |
| `hold` | `ab1` `ab2` `sig` | keep the charge until the condition turns true (for example, hold for Stagger) |
| `focus` | - | the party's focus moves to the foe that matched |
| `taunt` | - | use the unit's taunt (tanks) |
| `cleanse` | - | cleanse the ally that matched |
| `interrupt` | - | use the first charged ability that can interrupt |
| `moveTo` | `front` `mid` `back` | swap this unit into that slot |

Presets (ids): `boss`, `farm`, `deepwell`.

---

## 5. Gear

### 5.1 Weights and who wears them

| Weight id | Classes | Main family (about 70%) | Second family (about 30%) | Base lines lean to |
|---|---|---|---|---|
| `heavy` | Warrior, Reaver, Warden | metal | leather | armour, HP, block, threat |
| `medium` | Ranger, Venomstalker, Trapper | wood | leather | attack speed, crit, some armour |
| `light` | Mage, Warlock, Priest | cloth | wood | ability power, healing, ward |

- The Lanternbearer wears **its own weight** in the armour positions (`helm`, `body`, `off`). Weapons are
  class kinds. `charm` and the tools (`pick`, `axe`, `sickle`) fit every class.
- **Heroes wear by role weight:** tank `heavy`, striker `medium`, caster and support `light`. They keep their
  two positions (`wpn`, `trk`).
- Small **accents** cross over (Warrior padding is cloth; Ranger arrowheads and Mage clasps are metal), so
  every gathering line matters a bit to every class.
- The **Mage's main family is cloth** (armour is most of a set). Plan-4's table says "wood + cloth" in
  the other order; the owner named both families without an order. RG1 may swap them with a change-log line.
- A class change (Mirror of Embers) **retools** gear to the new weight, as `retoolItems()` does today:
  same id, grade, rarity, +N and lines.

### 5.2 Grades (15 tiers, 3 per region)

| Region | Grades | Region id |
|---|---|---|
| 1 The Hollow | 1-3 | `hollow` |
| 2 The Sunken Coast | 4-6 | `coast` |
| 3 The Emberwaste | 7-9 | `ember` |
| 4 The Pale Reach (working name) | 10-12 | LORE-R45 |
| 5 The Long Stair (working name) | 13-15 | LORE-R45 |

**Item power by grade** (starting values; RG1 and BAL3 tune grades 6-15, **grades 1-5 are fixed**):

| Grade | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Power | 10 | 22 | 42 | 75 | 130 | 215 | 355 | 585 | 965 | 1590 | 2625 | 4330 | 7145 | 11790 | 19455 |

- **Grades 1-5 equal today's `TIER_POW` exactly.** So `it.t` keeps its meaning ("tier by power") and only
  its range grows from 5 to 15. Old items keep their power to the decimal. From grade 6 on, x1.65 a grade.
- `itemPower = TIER_POW[t] x rarity x (1 + 0.15 x plus)` is unchanged. Per-kind base lines keep their
  shares of P (`CRAFT_KINDS` base lines; RG1 revises them per weight).
- Material names per family and grade are RG1's (roadmap-review 2.3 has a draft). Two constraints:
  - Today's names at index 1-5 (ore: Copper, Iron, Mithril, Starsteel, Emberite; wood: Oak, Yew,
    Ironbark, Ghostwood, Lanternwood) either stay, or are relabelled with a one-time notice. The count
    never changes.
  - No name may mean two grades (the draft's grade-9 "Emberite" clashes with today's tier-5 ore).
- Old saves keep every material and item, even above their region.

### 5.3 Rarity and sockets

| Rarity id | Name | Power x (`RAR.m`) | Sockets (crafted) | Hero `wpn` | Hero `trk` |
|---|---|---|---|---|---|
| `common` | Common | 1 | 0 | 0 | 0 |
| `uncommon` | Uncommon | 1.35 | 1 | 1 | 1 |
| `rare` | Rare | 1.8 | 1 | 1 | 1 |
| `epic` | Epic | 2.5 | 2 | 2 | 1 |
| `legendary` | Legendary | 3.2 | 3 | 2 | 1 |

- Crafting can roll Legendary from Region 2 on (RG1 sets the weights). Today `RAR.legendary.n` reads
  "Unique". Crafted Legendaries show "Legendary"; a unique is known by `it.u`, never by its rarity.
- Tools have no sockets.

### 5.4 Buff items

- **One family per region, from Region 2.** Region 1 has none; Enchanting unlocks in Region 2.

| Family id | Name | Region | Found by | Top grade (`famTop`) |
|---|---|---|---|---|
| `pearl` | Lantern Pearl | coast | fishing, Tide Pools (active finds more) | 6 |
| `glass` | Ember-glass | ember | Emberwaste mining | 9 |
| `r4` | LORE-R45 | 4 | LORE-R45 | 12 |
| `r5` | LORE-R45 | 5 | LORE-R45 | 15 |

- **Three weight versions of each:** buff id `<family>_<w>`, with `w` = `h`, `m` or `l` (`pearl_h`,
  `glass_l`). The version must match the item's weight: heavy on heavy gear, and so on. Charms take any.

| Version | Lines drawn from |
|---|---|
| `h` heavy | `armour`, `hp`, `block`, and the resist of its region's threat type |
| `m` medium | `aspd`, `haste`, `crit`, `stPow`, `control` |
| `l` light | `spell`, `heal`, `ward`, and its region's type power (`pw*`) |

- A buff item has a **rarity** (the same five). Line budget per socket:

```
socket budget = 0.20 x TIER_POW[min(item grade, famTop)] x RAR[buff rarity].m x enchant strength
```

  Newer families matter because `famTop` limits how far an old family scales. Percentage lines with caps
  still obey the caps (1.1).
- **Enchant strength** from the Enchanting skill: 0.70 at level 1, rising in a straight line to **1.00** at
  the level RG1 sets. Uniques' own socket is fixed at **1.10**.
- **Removing** a buff item destroys it, unless a **Salvage Rune** is used.
- **Bosses always drop their signature buff item** (at least Uncommon). A boss beaten with active play
  (6.5) drops one more.
- Gatherer finder perks: about +5% find rate (N1b). Active gathering finds about 2x idle.

### 5.5 Uniques 2.0 and Echoes

- A **unique** is a boss-themed item: fixed kind, `it.u` key, **one power** (a play-changing effect,
  merged into the legendary powers system, `S.legend`), and **one locked socket** holding that boss's
  signature buff item at strength 1.10. It also has **one open socket**.
- **Raw stats rule** (owner 2026-09-27: uniques weaker on stats, rarer): a unique's base power stays at
  `UNIQ_TUNE.pow` (1.8, Rare level). Its raw stats (base plus sockets) must land within **90-110%** of a
  Rare crafted item of the same grade with a full-strength socket. So a crafted Epic or Legendary beats a
  unique on stats, and **the unique wins on its power**.
- About **6 per region**, 30 for 1.0. Region bosses, zone-boss rotations, the Deepwell and the raid all
  drop them.
- **Echoes:** each extra copy of a unique you already own is an Echo of its power. Echoes raise the power's
  rank I-V with the existing `S.legend.echo` count and the rank cap. The **Lantern Book** (`S.legend.book`)
  is the collection. Power damage stays inside the legend budget cap (bucket A).

---

## 6. Enemies

### 6.1 Packs

| Size id | Foes in a pack | Share of pack HP each | Examples (Region 1) |
|---|---|---|---|
| `brute` | 3 | 1/3 | Quarry Golem, Barrow Beetle |
| `normal` | 5-6 | 1/5.5 | Moss Slime, Rattlebones, Spore Cap, Marsh Wraith |
| `swarm` | 8-10 | 1/9 | Cave Bat (Coast: gulls; later: rats, wisps) |

- The foe data gets `size` (**new**) next to `row`, `atk` and `spd` in `FOE_BEH`.
- **Pack totals stay the economy unit:** a pack's HP and gold total `packHp` / `packGold` x one old foe, and
  `kill` fires once per pack (as today). The size only splits the totals. BAL3 may give swarms a
  different total so area damage pays.
- Mixed packs keep `mixP`. At most 1 elite per pack in Regions 1-3; 2 from Region 4 in `normal` and `swarm`.
- Only the focus foe, elites and bosses show full bars; the pack shows one combined bar; damage numbers merge
  per pack (plan-4 2.10).

### 6.2 Damage targets

| What | Target |
|---|---|
| **Normal packs** | The pack's total damage per second is **2-3x today's** (start at 2.5x) at the same zone, split across its members by size |
| **A party at its farm zone** | Holds with a tank and a healer; without a tank or without a healer it holds 3-5 zones lower (as BAL2 set) |
| **Bosses** | An **unprepared** party at the boss's gate power dies in **30-40 s** |
| **Prepared** | The same party with a counter type, the right line-up, and Tactics or active play wins before the timer |

"Unprepared" = idle auto-play, no Tactics, no counter to the boss's types or traits, today's line-up
planner. The formula CB2 tunes to:

```
boss damage per second = Σ party EHP / 35 s,    EHP = maxHP / (1 - damage reduction)
```

### 6.3 Telegraphs (warnings)

Existing ids stay (`heavy`, `dive`, `heal`). New ones:

| Id | What it is | Answer |
|---|---|---|
| `heavy` | A single big hit on one target (red "!") | **Parry**: the tap in the last 0.8 s. No damage, the foe is Reeling (below) and +25 stagger |
| `dive` | A diver goes for the back (blue "!") | Taunt, stun, knockback, or a tank covering |
| `heal` | A channelled heal (green "+") | Interrupt |
| `zone` | A danger zone under one or more slots | **Dodge**: tap to step out. In the last 0.5 s = a **perfect dodge**: Keen (+20% damage, 3 s) |
| `slam` | A hit on the whole Front column | Dodge, or a tank's Guard |
| `line` | A hit on every slot (clouds, surges) | Shields, resists, heals |
| `sig` | A boss's **signature cast** with a cast bar | **Interrupt**: skips the attack |
| `hard` | A cast that cannot be interrupted | Dodge or shield |
| `summon` | Adds are coming | Interrupt, or area damage when they land |
| `hazard` | An arena effect for a phase | Move slots, cleanse, burst |
| `enrage` | A timer or HP threshold for a harder mode | Burst down or Chill |
| `challenge` | A named duel (the Pyre Knight and Caedmon) | Special per boss |

- **Reeling** (`reel`): the parry result, 2 s, the foe takes +50% (today's `stagger` / `vulnT`, renamed in
  copy so it is never confused with the stagger bar).
- The old "early tap = half damage dodge" on `heavy` stays.

### 6.4 Stagger, phases, cast bars

- **Stagger bar** (bosses 100 points; elites 60): filled by heavy hits (+5), each stun second a boss or
  elite ignores (+8), parries (+25), interrupts (+15), reactions (+10; Shatter +20), and abilities with a
  `stagger` effect. `stag` raises all of it. After 4 s with no fill, the bar drains 5 a second.
- **Full:** the foe is **Staggered** for **5 s** (elites 3 s): it does nothing, takes x1.5 (1.2), and the
  Lanternbearer's **Finisher** prompt shows (one per Stagger). Each later stagger in the same fight needs
  25% more fill (up to x2).
- **Phases:** 2 or 3. Default thresholds: 50% (2 phases) or 66% / 33% (3 phases). Each phase adds one
  mechanic (adds, a wind-up, a hazard). The change takes 1.5 s and clears the telegraph showing; the boss
  is never invulnerable (idle play must not stall).
- **Cast bars:** casters and bosses show a bar with the cast's name. `sig` casts are interruptible (CB2 may
  limit it to once per phase); `hard` casts are not.
- Region and Deepwell bosses and the raid get the full kit first (plan-4 2.3).

### 6.5 Elite traits

| Id | Name | Effect (CB2 tunes) | Counter |
|---|---|---|---|
| `shielded` | Shielded | Starts with a shield of 30% max HP, back after 5 s without damage | **Heavy hits** deal x2 to the shield (Warrior) |
| `vampiric` | Vampiric | Heals 20% of the damage it deals | **Curse** or **Venom 5+** (anti-heal, 3.2) |
| `explosive` | Explosive | On death, blasts the party after a 1.5 s `zone` warning | **Dodge**, or kill it while Chilled: it freezes and does not blast |
| `summoner` | Summoner | Every 12 s casts a 2 s `summon` that calls 2 adds | **Interrupt** or stun; area damage |
| `enraged` | Enraged | Below 50% HP, attacks 50% faster | **Chill** cancels the rage while it lasts; burst |
| `frozen` | Frozen-armour | Takes half damage from physical and frost until 3 fire hits break the ice (it reforms after 8 s) | **Fire** |
| `cursed` | Cursed | Its hits Curse the member hit (no healing, 4 s) | **Holy** hits on it remove its aura for 5 s; **cleanse** |

- Elites roll **1 trait** in Regions 2-3 and **2 traits** from Region 4. Two traits never share a counter.
  Region 1 elites keep today's rules (stronger, no trait).
- Every damage type counters at least one trait, and so does every evolution: Reaver and Warrior
  (Shielded), Warden (Cursed), Venomstalker (Vampiric), Trapper (Enraged, Summoner), Warlock (Frozen,
  Vampiric), Priest (Cursed).
- Champions stay as today (a named strongest-of-kind, Trophies).

### 6.6 Active play rewards

A boss beaten with **3 or more** parries, dodges or interrupts drops **+1 signature buff item** and gives
**+50% XP** for that kill. Idle kills are never punished, just not given the bonus.

---

## 7. Player-facing words

### 7.1 Glossary (the guide's source text)

| Term | Plain meaning (guide line) |
|---|---|
| **Lanternbearer** | You. You carry the lamp and lead the party |
| **Hero** | Someone who fights beside you. You field two |
| **Party** | You and your two heroes |
| **Slot** | Where a party member stands: **Front**, **Middle** or **Back** |
| **Class** | Your way of fighting: **Warrior** (heavy armour), **Ranger** (medium), **Mage** (light) |
| **Evolution** | A new path for your class, opened by a trial at the end of the Hollow. It gives you a second ability |
| **Ability** | A special move that charges over time. Tap it, or let it fire by itself |
| **Signature** | A hero's own ability |
| **Finisher** | Your big hit on a Staggered foe. Tap the prompt |
| **Awakening** | A hero's upgrade at the end of their quest: a new passive and a stronger signature |
| **Damage type** | What a hit is made of: **physical**, **holy**, **poison**, **fire** or **frost** |
| **Weak / Resists** | A foe takes 50% more from its weakness and 40% less from what it resists |
| **Status** | An effect that stays for a while: Bleed, Venom, Burn, Chill, Stun, Root, Mark, Curse |
| **Reaction** | Two effects on one foe that set each other off: **Blight**, **Shatter**, **Judgement** |
| **Warning** | A sign that a big attack is coming. Tap in time to **parry** or **dodge** it |
| **Parry** | Tap just before a heavy hit lands. You take nothing and the foe reels |
| **Dodge** | Tap to step out of a danger zone. At the last moment it is a **perfect dodge** |
| **Cast bar** | A foe is casting. Hit it with an ability to **interrupt** |
| **Stagger** | Fill a boss's stagger bar and it stops for 5 seconds and takes 50% more |
| **Pack** | The foes you fight at once. **Brutes** come in threes, **swarms** in eights or more |
| **Elite** | A stronger foe with a **trait**. Each trait has a counter |
| **Boss** | A crowned foe with phases. Region bosses are **Listeners** |
| **Gear weight** | Heavy, medium or light. Your class wears one weight |
| **Tier** | How strong gear and materials are, 1 to 15. Each region brings three |
| **Rarity** | Common, Uncommon, Rare, Epic, Legendary. Higher rarity means more power and more sockets |
| **Socket** | A space on gear for a buff item |
| **Buff item** | A gem-like find from a region (Lantern Pearls, Ember-glass) that adds to your gear |
| **Enchanting** | Setting buff items into gear. Higher skill, stronger effect |
| **Salvage Rune** | Saves a buff item when you take it out |
| **Unique** | A boss's own item, with a power no crafted item has |
| **Power** | A unique's special effect |
| **Echo** | A copy of a unique you already have. It makes the power stronger |
| **Lantern Book** | Your collection of uniques and powers |
| **Tactics** | IF / THEN rules your party follows by itself |
| **Rested** | Heroes who rested fight better. See the open question on the name (9) |
| **Combo** | Two roles in two slots that help each other (the Party screen's existing word) |
| **Kin, Bond** | Heroes of one circle; a named pair who grow closer (unchanged) |

### 7.2 Naming rules

- **The Lanternbearer**, capital L, with "the". Never "the hero" or "the player" in copy. **Heroes** are the
  recruits (lower case).
- **Classes and evolutions** are capitalised: Warrior, Ranger, Mage; Reaver, Warden, Venomstalker, Trapper,
  Warlock, Priest. "Evolve into a Priest", "your Warlock".
- The old class names become lore words for the callings: Wardens hold, Rangers walk, **Lanternmages**
  burn, **Lightkeepers** keep. They are not class names any more (CHAR1 and LORE rework the lines).
- **Damage types are lower case** in sentences ("holy damage", "weak to fire"). **Statuses, reactions,
  traits and named buffs are capitalised** (Bleed, Blight, Vampiric, Keen, Reeling).
- **"Reaction", not "combo",** for Blight, Shatter and Judgement: "combo" is already the Party screen's word
  for two roles in two slots (formation.md 2.2).
- **No jargon in copy:** say "damage over time", "hits the whole pack", "damage a second", "comes back
  sooner"; never DoT, AoE, DPS, CC, CD, proc or aggro.
- Numbers: "+20% damage" (adds) vs "20% more damage" (multiplies), as in 1.3. Seconds as "5 s" in
  compact UI and "5 seconds" in the guide.
- Ids are lower case or camelCase ASCII and never change. Display names live in data tables, so a rename
  never touches the save.

---

## 8. Save shape for Core 2.0

### 8.1 Principles

1. **New state goes in new keys**, through `registerState(key, defaults)` so old saves merge the defaults.
   Each new key has a `v` (version) field.
2. **Never rename or repurpose.** Examples that apply here:
   - `S.party.cls` keeps its legacy values (`warden`, `lanternmage`, `ranger`, `lightkeeper`). After the S2
     migration new code reads the class through one accessor (`lbClass()` → `{ base, evo, evo2 }`) and
     never through `S.party.cls`.
   - Evolution id `warden` means the Warrior's evolution, in `S.cls.evo` only. The legacy class key `warden`
     is read only through the migration map (`LEGACY_CLS`).
   - `it.t` keeps "tier by power". Grades 1-5 have exactly today's power (5.2), so its range grows and its
     meaning stays.
   - `S.mats[family]` arrays may grow from 5 to 15 entries. If RG1 renames what index i *is* beyond a label
     (a different material), it migrates into a new key instead and leaves the old one untouched.
   - `S.rested` is today's Well Rested (gathering). Fatigue must not reuse it.
3. **Migrations run once**, keyed by the state's `v`. They are idempotent, run after SAVE1's automatic
   backup, never lower a count or an item's power, and toast what changed in one plain line.
4. **Store ids and counts, never derived numbers** (no cached stats, no computed power).
5. Runtime combat state (statuses, stagger, phases, cast bars, traits rolled on a pack) is **never saved**.

### 8.2 Reserved keys (the owning spec fills in the details)

| Key | Owner | Shape (draft) |
|---|---|---|
| `S.cls` | CL1 / S2-S3 | `{ v: 0, base: null, evo: null, evo2: null, trials: {}, respec: 0, slots: { ab1, ab2, ab3: null } }` (roadmap-review drafted `evo` as an array; a single id per tier is simpler, and `evo2` is the tier-2 slot) |
| item `so` | RG1 / S5 | `[[buffId, rarity, strength], ...]` sockets on an item; a missing field means empty |
| `S.buff` | RG1 / S5 | `{ [buffId]: [n per rarity, 5 entries] }` buff items held |
| `S.legend.echo`, `.book` | existing | Echoes and the Lantern Book for Uniques 2.0 (reuse, not new) |
| `S.tac` | S7 | `{ v: 0, rules: { [unitKey]: [[cond, arg, act, arg], ...] }, preset: {} }` |
| `S.fatigue` | S7 | `{ v: 0, m: { [heroId]: 0-100 }, back: { [heroId]: until } }` |
| `ROSTER[id].dt` | CL1 | Hero base type (data, not save) |
| `FOE_BEH[k].size`, `.fam` | CB2 | Pack size and family (data, not save) |

### 8.3 Room for the second evolution tier (after 1.0)

- `S.cls.evo2`, ability slot `ab3`, and a tier-2 id per first evolution (for example `reaver.x`), all empty
  in 1.0.
- The star map is data-driven with **one ring per tier**. The class screen shows a locked tier-2 row.
- Tactics rule slots and Finishers are keyed by slot id, so a third ability or a changed Finisher needs no
  new save shape.
- The respec (Mirror of Embers) resets from the chosen tier down. Its cost table has a row per tier.

---

## 9. Ownership and open questions

### 9.1 Who owns what

| Spec | Owns | Must not change without a change-log line |
|---|---|---|
| **CORE-G** (this file) | Stat ids and caps, the formulas and buckets, type ids and the multipliers, status ids and their rules, reactions, the ability data shape, targeting ids, Tactics ids, weights, grade powers 1-5, socket counts, the socket budget formula, pack size ids, telegraph ids, trait ids, the save principles, the glossary words | - |
| **CL1** | The class and evolution kits (taps, `ab1`, `ab2`, Finishers, passives, core mechanics) with coefficients; class base stats; trials; the class migration; star maps per class; hero base types (`dt`) and signature statuses; Bonds that react to the class; the Tactics unlock order | Status numbers, type multipliers, caps |
| **RG1** | Material names and region gating, grades 6-15 power, production chains, gear kinds per weight and their base lines, rarity weights, buff item lines and values, enchant strength curve, Salvage Runes, Uniques 2.0 (list, powers, bosses), material and item migration | Socket counts, `famTop`, the unique raw-stats band |
| **CB2** | Enemy numbers (pack damage, boss damage per the 6.2 formula), foe sizes and families per foe, elite trait numbers, boss kits (phases, casts, telegraphs, stagger values within 6.4), dodge and parry windows, active rewards, the stage readability rules for big packs | Trait ids and counters, telegraph ids |

S1 (types and statuses) is built from sections 1-3 and 6.1-6.3. It is the first code to prove this file.

### 9.2 Open questions

**For CL1**

1. Does base Ranger's Focus stay at +25% (today) or become the standard +20% Mark? (This file allows 15-30%
   per source.)
2. The Mage's base type: frost (roadmap and this file) or fire (the Lanternmage's Embers today)? If fire,
   Warlock needs another way to stand apart.
3. Which heroes get which base type (2 or more per type among the 18)?
4. How strong is the evolution power spike (+35% target) in terms of this file's buckets?

**For RG1**

5. The Mage's main family: cloth (this file) or wood (plan-4's table)?
6. Relabel today's material names by index (Iron becomes Bronze) or keep them for grades 1-5? The draft's
   grade-9 "Emberite" clashes with today's tier-5 ore either way.
7. The Enchanting level for 100% strength, and whether heroes' gear sockets are worth their Enchanting cost.
8. Where buff items live: the Storehouse (materials) or the Armoury?

**For CB2**

9. Does the no-Tactics auto-cast keep `autoEff` 0.5, or cast at full power with timing as the only active
   bonus?
10. Swarm pack totals: the same HP as other packs, or higher so area damage pays?
11. Boss signature casts: interruptible every time, or once per phase?
12. The zone boss's 30 s timer and the "unprepared party dies in 30-40 s" target: keep both, or give Region
    bosses a longer timer?

**For the coordinator**

13. The fatigue meter's name: plan-4 calls it **Rested**, but "Well Rested" already exists (the gathering
    damage bonus, `S.rested`). Merge them into one meter, or call fatigue something else (for example
    "Fresh")?
14. "Reaction" as the player word for Blight, Shatter and Judgement (because "combo" is taken): OK?

---

## 10. Change log

| Date | Change | By | Signed off |
|---|---|---|---|
| 2026-09-28 | First version | CORE-G | - |
| 2026-09-28 | **Proposed (CL1, classes-2.md 8.2-1):** 2.2 Mage row: base type `fire` (was `frost`); Warlock adds dark fire (type `fire`) and Curse; "Base Mage keeps Chill" becomes "keeps Burn" (Chill comes from the Trapper and frost heroes). Formalises the coordinator's 2026-09-28 decision | CL1 | pending |
| 2026-09-28 | **Proposed (CL1, 8.2-2):** 2.3 exception: the Warlock's Curse detonations and Hex Nova treat "resists fire" as neutral ("Dark Turned"); weakness still counts | CL1 | pending |
| 2026-09-28 | **Proposed (CL1, 8.2-3):** 4.1 the Priest's `ab2` stays Sanctuary (owner-named); its `ab1` is Rally Hymn (`hymn`, a `var` replacing Lantern Flare). Elowen's signature is shown as Chapel Light (hero data, decision D7) | CL1 | pending |
| 2026-09-28 | **Proposed (CL1, 8.2-4):** 4.4 ability shape: optional `var: { [evoId]: { type, fx, name } }`; new verbs `meter`, `trap`, `detonate`; `consume` takes a class meter id; per-fx options `{ perStack, base, ramp, hits, over, spread, to, v, overflow }` | CL1 | pending |
| 2026-09-28 | **Proposed (CL1, 8.2-5):** 1.3/3.1 class meters (Grit, Fury, Bulwark, Embers, Blessing) are not statuses; each feeds one named bucket-T buff whose value follows the meter | CL1 | pending |
| 2026-09-28 | **Proposed (CL1, 8.2-6):** 1.3 bucket Y: class and evolution auras sit with slot jobs, outside the +40% cap (as `HERO_CLASSES[].aura` today) | CL1 | pending |
| 2026-09-28 | **Proposed (CL1, 8.2-7):** 4.5 Tactics conditions `stacks` (status id, n) and `meter` (meter id, n or %) | CL1 | pending |
| 2026-09-28 | **Proposed (CL1, 8.2-8):** 7.1 glossary adds Grit, Fury, Bulwark, Blessing, Trap and "the Proving" (the evolution trial; "Trial" is the Deepwell's weekly Trial) | CL1 | pending |
| 2026-09-28 | **Proposed (CL1, 8.2-9):** 8.2 `S.cls` final shape per classes-2.md 3.5 (adds `proven`, `free`, `at`, `auto`, `mig`, `from`; `trials` entries `{ n, won, best }`) | CL1 | pending |
