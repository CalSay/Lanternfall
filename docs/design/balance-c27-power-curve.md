# C27: the power curve and number squish (balance step 3)

Design proposal, 1 October 2026. Step 3 of `balance-roadmap.md`. Nothing here is live. Every number is a proposal
for owner and coordinator review. Read with `hero-abilities.md` §2a (binding), `ability-tree-details.md`,
`ability-validation.md`, `enemies-c22-final-contract.md`, the five `enemies-c22-*-final.md` files,
`world-structure.md` and `e33-reference.md`.

**[A]** marks an assumption. **[M]** marks a number from the throwaway fight model (a Monte Carlo of one hero against
one foe on the Speed timeline, per-hit defence, cooldown refunds and counters; not the game engine). **[R]** marks a
number measured from the real game core (`tools/lib/core.mjs`, seed 1, today's `main`).

## 0. The short version

- **One scale for everything.** Zone 1: hero about 110 HP and 22 Attack, Speed 100. Zone 175: about 11,500 HP and
  2,250 Attack, Speed about 126. That is 100x, as the owner asked. Today the same span is 10^18x.
- **Gear is the star: 86% of all growth.** 15 grades, each **+28%**. Rarity steps **+10-12%**, forging **+2% a
  level** to +10. A new grade always lands as a clean +28% jump because rarity and forging carry over when you
  **uptier** an item.
- **The sawtooth.** Each grade covers one window of zones (10, 10, then 15 per region). You arrive at a window 12%
  ahead (1.12x). The zones climb 2.5% each (1.7% in the long window). By the window's end you are 10% behind (0.90x).
  Then the next grade puts you ahead again. Captains check you every zone; Champions at the end of a window are walls.
- **Foe HP is counted in hero turns of a reference build**, not in Attack presses. Codex's 3-5 / 6-8 / 10-15 action
  budgets stay; they are multiplied by a build factor B that rises from 1.0 (zone 1) to 2.2 (zone 35) and 2.5 (zone 105).
- **Remove the hidden hand multipliers** (Attack x5, ability x2.5, counter x4) and the exponential Training curve. The
  counter becomes a sure crit at 0.5 Attack (1.25x on screen).
- **Bosses are real tests and never on a clock.** Remove the 45 s / 60 s Enrage. Champions last 9-13 hero turns,
  Elders 12-16. A typical player (70-80% of hits defended) wins a Champion most of the time and an Elder about half
  the time on the first try. A Break meter and interruptible charges reward combos.

## 1. Diagnosis: the curve today

### 1.1 What grows, and by how much

| Source | Where | Growth over the game today | Share of hero damage growth |
|---|---|---|---|
| Training: Attack level | `40-rules.js` `atkCurve`, `PACE.atkPer/atkX/atkX2` | Lv 0: 4. Lv 20: 1,036. Lv 40: 27,720. Lv 80: 14.1 million **[R]**. That is x3.5 million | about 89% |
| Training: ability levels | `55-training.js` `trainAbCurve` (`abX 1.55`, `abX2 1.8`) | Lv 0: 4. Lv 80: 1.4 million **[R]** | (abilities) |
| Hero level | `40-rules.js` `lvlMult`, `PACE.heroLv 0.04` | x4.96 at level 100 | about 9% |
| Gear | `20-data.js` `TIER_POW [10,22,42,75,130]`, `RAR` 1/1.35/1.8/2.5/3.2, `+15%` a plus to +10 | Best weapon: 130 x 2.5 x 2.5 = "+812% damage", so x9.1 | about 11% even when maxed |
| Solo knobs | `24b-data-solo.js` `dmgX 1.75`, `ramp` x1.35 from zone 8 to 12, `heroX` per hero | x2.4 | |
| Account multipliers, all multiplied together | `55-mastery.js` (+10% a zone star, +1% a star), `20-data.js` Warbanner (+20% a level, no cap), `57-camp.js` Blade blessing, `57c-codex.js` (+5%), `55-rested.js` (+10%), `57e-constellations.js`, `57d-deepwell.js` boons, `55-party.js` class `heroMul` and Mark | unbounded (Warbanner) | |

Gear today is a "+% damage" line on top of Training. It is a side dish, not the meal.

### 1.2 Where hero power and enemy power split

Foe HP (`40-rules.js` `mobHp`, `PACE`) **[R]**:

| Zone | 1 | 10 | 35 | 70 | 105 | 140 | 175 |
|---|---|---|---|---|---|---|---|
| Foe HP | 80 | 18,410 | 1.49e8 | 1.73e11 | 2.00e14 | 2.32e17 | 2.69e20 |

If Training keeps up with the hero level (the design intent), hits to kill a normal foe are **[R]**: zone 8 (L10):
3.3. Zone 15 (L20): 9.9. Zone 35 (L35, Attack 40): 254. Zone 60 (L60): 1,077. Zone 100 (L100, Attack 80): 107,000.
The idle-era curve assumed away gains, companions and auto-push. With active-only combat (owner, 2026-10-01) that
curve is a wall from about zone 15.

### 1.3 Where the numbers get silly

- **HP follows damage.** `59-combat.js` sets the hero's `hpP = pow`, so hero HP scales with Attack Training. HP climbs
  into the millions with damage, and one Training level changes both sides of every fight.
- **Hand multipliers hide the real scale.** An Attack press is the class tap x `atkX 5`; an ability by hand is x
  `abHandX 2.5`; a counter is x `counterX 4` x crit 2.5 (`24b-data-solo.js`). At level 1 **[R]**: Wren's Attack hits
  50.8, her Echo Shot 55.8. The signature ability is barely better than Attack. The counter hits 101.5.
- **Heroes do not share a scale.** Level 1 HP **[R]**: Wren 65, Tobin 187, Pip 96. The Thorn Imp's 20% Briar Jab
  takes 20% of Wren but 6% of Tobin. The cards are written against one reference hero.
- **Crit damage runs away.** The legacy helm adds `p / 200` crit damage: an Epic +10 tier-5 helm adds +4.1x, so crits
  hit for 6.6x. Crit chance caps at 75%; Wren starts at 25% (8% + 7% + 10%, `55-party.js`).
- **Only 5 gear tiers for 175 zones.** `PACE.essTier [1,7,13,19,42]` puts the last tier at zone 42. `gear-2.md`
  plans 15 grades but gives grades 6-15 only **+4% a grade** (`Pc(g)`), so 133 zones would have flat gear.
- **Mastery cannot work.** Zone stars need 25/100/300/800/2000 kills in one zone (`55-mastery.js`). A zone is now 6
  fights, played once.
- **Bosses are on a wall clock.** Boss HP is 12x a normal (x13.8 for region bosses, `PACE.bossHp`, `regionBoss`).
  `59-combat.js` gives zone bosses 45 s and region bosses 60 s, then Enrage (+50% speed, +10% damage a second) and a
  fail 15 s later (`50-sim.js` line 210). A turn fight with choices, timing rings and 2-4 hit moves takes 60-150 s
  for a boss **[M]**. Every boss would fail before its second combo.
- **The turn prototype stacks its own knobs** (`59k-turn.js`): `foeHpX 1.6`, `autoAttackX`, auto parry and auto
  dodge odds (void under active-only), its own `heroX`.

**Verdict:** replace the curve, do not retune it. Too many knobs multiply each other, and the shape is exponential
where it should be flat-ish and stepped.

## 2. The target curve, zone 1 to 175

### 2.1 Definitions

- **Grade windows.** Grades start at areas 1, 3 and 5 of each region:
  `GZ = [1, 11, 21, 36, 46, 56, 71, 81, 91, 106, 116, 126, 141, 151, 161]`. Windows are 10, 10 and 15 zones. The long
  window (areas 5-7) holds three Champions, whose Trophies pay for forging +8 to +10. That is the region's late power
  source. (Replaces the `gear-2.md` grade table, whose Region 1 grades sit at 1, 7, 13.)
- **ramp(z)** = 1.28 ^ ((g - 1) + (z - GZ[g]) / n_g), where g is the zone's grade and n_g its window length.
- **soft(z)**: the slow sources (expected rarity and forging, hero level, Training), 1.0 at zone 1 and 3.2 at zone 175.
  Expected rarity x forge = 1.63 ^ ((z - 1) / 174): Common at zone 1, about Uncommon +3 by zone 50, Rare +6 by 105,
  Epic +10 by 175 **[A]**. Hero level = zone up to 35, then +0.46 a zone to level 100 at zone 175 **[A]**.
- **Reference Attack** `A(z) = 20 x ramp(z) x soft(z)`: the unit of foe HP.
- **Reference HP** `H(z) = 100 x ramp(z) x softH(z)` (softH uses +1% HP a level): the unit of foe damage.
- **Build factor** `B(z)`: how much a reference build deals per hero turn, compared with one plain Attack. Linear from
  1.0 at zone 1 (Attack and the free signature) to 2.2 at zone 35 (three slots, a finisher, parry refunds), then to
  2.5 at zone 105 (subclass), flat after.
- **Reference Speed** `S(z) = 100 + 0.15 x (z - 1)`. Foe Speed on a card (0.75-1.35) multiplies this.

Foe stats from a card:

```
HP        = card actions x A(z) x B(z) x (1 - armour)      // armour: the card's 0/5/10/15/20/25%
hit       = card % x H(z) x roleScale                       // roleScale: section 6
Speed     = card Speed x S(z)
```

The hero:

```
Attack = 22 x 1.28^(grade - 1) x rarity x (1 + 0.02 x forge) x (1 + 0.004 x (level - 1)) x (1 + 0.005 x Attack Training)
HP     = 110 x 1.28^(armour grade - 1) x rarity x (1 + 0.02 x forge) x (1 + 0.01 x (level - 1)) x heroHp
heroHp: Wren 1.0, Tobin 1.2, Pip 0.95 (one scale; Tobin's edge is Guard and Grit, Pip's is Ward)
Speed  = 100 + Haste ranks + gear Speed (section 4.6)
```

The hero's 22 and 110 sit 12% above the zone 1 reference (20, 100). That is the "fresh grade" lead.

### 2.2 The table

Hero columns assume the hero has uptiered to the zone's grade with reference rarity and forging. "Turns" are hero
turns at the reference build. Damage is before Guard, Ward and Weaken.

| Zone | Grade | Ref Attack A | Ref HP H | Ref Speed | B | Hero Attack | Hero HP | Normal (4 turns) HP | Normal hit (25%) | Captain (7) HP | Champion (12) HP | Champion big hit 30% / charge 75% | Elder (20) HP |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 20 | 100 | 100 | 1.00 | 22 | 112 | 80 | 25 | 140 | 240 | 30 / 75 | 400 |
| 5 | 1 | 23 | 116 | 101 | 1.14 | 24 | 118 | 106 | 29 | 185 | 317 | 35 / 87 | 528 |
| 35 | 3 | 60 | 304 | 105 | 2.20 | 54 | 271 | 531 | 76 | 929 | 1,590 | 91 / 228 | 2,650 |
| 36 | 4 | 62 | 311 | 105 | 2.20 | 69 | 349 | 544 | 78 | 952 | 1,630 | 93 / 233 | 2,720 |
| 70 | 6 | 158 | 789 | 110 | 2.35 | 140 | 702 | 1,480 | 197 | 2,590 | 4,450 | 237 / 592 | 7,410 |
| 105 | 9 | 410 | 2,020 | 116 | 2.50 | 364 | 1,800 | 4,100 | 506 | 7,170 | 12,290 | 607 / 1,520 | 20,490 |
| 140 | 12 | 1,040 | 5,140 | 121 | 2.50 | 928 | 4,570 | 10,430 | 1,290 | 18,260 | 31,300 | 1,540 / 3,860 | 52,170 |
| 175 | 15 | 2,530 | 12,960 | 126 | 2.50 | 2,250 | 11,530 | 25,330 | 3,240 | 44,320 | 75,980 | 3,890 / 9,720 | 126,640 |

Zones 35, 70, 105, 140 and 175 are the last zones of a region: the hero there is on the oldest grade of the window
(0.89x). Zone 36 shows the jump: the hero's Attack goes 54 to 69 (+28%) while the zone moves 60 to 62.

Biggest numbers in the game: a normal foe 25k HP, a Champion 76k, the Voice about 150k (section 5.3). A capped
finisher crit at zone 175 is about 2,250 x 4.5 x 3.0 = 30k. Nothing reaches a million.

### 2.3 The sawtooth

```
power vs zone     grade 1          grade 2          grade 3 (long window: Champions 5-7, Trophies)
hero / zone       1.12 \           1.12 \           1.12 \
                        \ 0.90 |        \ 0.90 |         \___ 0.89 | Elder
                               new grade        new grade              new region, new grade: 1.12
```

1. **Each new zone's monster is slightly ahead of the last:** +2.5% a zone in 10-zone windows, +1.7% in the long one.
   Small upgrades keep pace: a forge level (+2%), a Training level (+0.5%), a hero level (+0.4% Attack, +1% HP).
2. **A gear upgrade puts you ahead.** The new grade is +28%: from 0.90x to 1.12x (a little more than one grade,
   because the zones climb inside the window too).
3. **The Captain checks you.** Each zone ends with a 6-8 turn Captain. At 0.90x it takes 7.8 turns instead of 7: you
   feel the drift and go forge or train.
4. **The Champion is a wall you beat by build and skill.** The Champions of areas 2, 4 and 7 fall at the end of a
   window, when you are at 0.90x. The area-7 Champion and the Elder sit at the end of the long window, where
   Trophy forging (+8 to +10, about +6%) and a tuned loadout lift you to about 1.0x.
5. **A new region opens with a new grade**, so the first zone of each region feels like a reward, not a wall.

Hero turns to kill (reference build) at each point of the tooth:

| Hero vs zone | Normal (4) | Captain (7) | Champion (12) | When |
|---|---|---|---|---|
| 0.90x | 4.4 | 7.8 | 13.3 | end of a window, old grade |
| 1.00x | 4.0 | 7.0 | 12.0 | on the curve |
| 1.12x | 3.6 | 6.2 | 10.7 | fresh grade |
| 1.25x | 3.2 | 5.6 | 9.6 | fresh grade plus one rarity step |

## 3. Power sources budget

### 3.1 Shares of growth

Shares are of the logarithm (so they add up). Hero Attack 22 to 2,250 (x102):

| Source | Growth | Share | Notes |
|---|---|---|---|
| Gear grade (15 grades, x1.28 each) | x31.8 | **75%** | The one big jump per window |
| Rarity (Common to Epic, expected) | x1.36 | 7% | Steps +10-12%; carries over on uptier |
| Forging (+0 to +10, +2% each) | x1.20 | 4% | +8 to +10 need Champion Trophies |
| Training, Attack (0 to 80, +0.5% a level) | x1.40 | 7% | Linear, not exponential. Gold sink, small steps |
| Hero level (1 to 100, +0.4% a level) | x1.40 | 7% | Levels mostly buy star points and HP |
| **Total** | **x102** | 100% | **Gear: 86%** |

Hero HP 110 to 11,530 (x105): armour grade x31.8, rarity and forge x1.63, level (+1% a level) x1.99.

On top of the reference (the "feel" layer, already inside foe HP through B, or capped):

| Source | Budget | Rule |
|---|---|---|
| Abilities, passives, combos (unlocked by boss relics) | B from 1.0 to 2.5 | Built into foe HP. Each new ability shortens fights while you learn it, then the curve absorbs it |
| Ability Training | +2% per 5 ranks, to +20% at rank 50 | Codex's milestone proposal; adopt it |
| Uniques | Epic power (1.36) plus one effect worth about +10-15% in its niche | Uptier like any item (they drop once) |
| Champion Trophies | Forging +8 to +10 (about +6%) and Trophy lines | Already counted in forging |
| Food (bag slot) | +5% Attack or +8% HP for one zone | Small and temporary |
| Potions (bag slot) | Heal 35% max HP, one a fight, costs a turn | Sustain, not power |
| Account bonuses (mastery, camp blessings, Codex seals, Rested, constellation stat nodes, Warbanner, Deepwell boons outside the Deepwell) | **+10% total, capped** | One bucket. Excess moves to gold, Essence or XP |
| Star forks | 0% | Behaviour only, as `ability-tree-details.md` says. Keep it that way |

### 3.2 Gear rules that make each step felt

- **15 grades, +28% each** (replaces `TIER_POW` and `gear-2.md`'s `Pc`). Grade g power `10 x 1.28^(g - 1)`.
- **Rarity:** Common 1.00, Uncommon 1.10, Rare 1.22, Epic 1.36, Legendary 1.52. A Unique is Epic power plus its effect.
  Today's 1 / 1.35 / 1.8 / 2.5 / 3.2 makes a lucky Epic worth three grades and breaks the curve.
- **Forging:** +2% a level, +10 at most. Today's +15% a level is x2.5 at +10, worth almost four grades.
- **Uptier ("Reforge to the next grade"):** keeps rarity, forging, affixes and Trophy lines; costs the new grade's
  materials. So the new grade is always a clean +28%. Crafting fresh is still the way to roll a better rarity.
  Without uptier, a player with a Rare +6 (x1.34) crafting an Uncommon next grade (x1.41) gains only 5%: the jump
  dies. With uptier the same player gains 28%.
- **Base lines become flat stats:** a weapon gives Attack (22 x 1.28^(g-1) x rarity x forge), armour gives HP. No more
  "+% damage" on top of another curve.
- **Show the delta in the player's own terms:** "+28% Attack. Gloomjaw: 4.4 turns -> 3.6" (section 7).

### 3.3 Turns to kill, before and after a step

Zone 20 to 21 (grade 2 to 3), reference build (B 1.67, then 1.71):

| Change | Hero Attack | Normal HP | Normal turns | Captain turns | Champion turns |
|---|---|---|---|---|---|
| Zone 20, old grade 2, Uncommon +3 | 36 | 265 | 4.4 | 7.8 | 13.4 |
| Zone 21, uptier to grade 3 | 46 | 281 | **3.6** | **6.2** | **10.7** |
| ... plus Uncommon to Rare (+11%) | 51 | 281 | 3.2 | 5.6 | 9.6 |
| ... plus +5 forging (+10%) | 56 | 281 | 2.9 | 5.1 | 8.8 |

A grade step removes almost one full turn from every normal fight. That is the felt jump.

## 4. Ability balance

### 4.1 One damage scale

- **U = the hero's Attack stat x (1 + ability Training bonus).** Attack is coefficient 1.0. An ability's coefficient
  multiplies the same Attack. Drop `atkX 5`, `abHandX 2.5`, `counterX 4`, `autoAttackX` and every turn-prototype
  `heroX`. **Sign-off 1 (manual 2.5x):** remove it. Adopt Codex's normalised ability multiplier 1.0.
- **Counter:** a sure crit at **0.5 Attack** = 1.25x Attack on screen. Bulwark x1.25 makes 1.56x; Last Stand x2 makes
  3.1x. At today's 2.5x Attack a full-parried move took a whole 3-action foe's budget **[M]**: one counter plus one
  action killed the Thorn Imp.

### 4.2 Coefficient bands

| Kind | Coefficient (x Attack) | Cooldown | Examples |
|---|---|---|---|
| Attack | 1.0 (Twin Shot 2 x 0.65) | 1 | |
| Shared damage | 1.3-2.0 | 2-4 | Power Shot 1.6, Heavy Strike 2.0, Spark 1.2, Nova 2.0 |
| Setup (debuff or status) | 0.6-1.8 plus the effect | 4-5 | Echo Shot 1.8 + Mark, Hunter's Mark 0.6 |
| Conditional payoff | 1.4-2.0; **a sure crit 1.2-1.5** (3.0-3.75 on screen) | 4-5 | Deadeye 1.5, Riposte 1.2 |
| DoT per application | 0.8-1.2 total | | Burn 0.4 x 3, Bleed 0.12 a stack a tick |
| Finisher | **4.5 raw at most** before crit | 7 | Final Echo, Hammerfall, Lanternburst |
| Passive | worth +15-20% of sustained output, or the same in defence | | Twin Shot, Momentum, Afterglow, Night Hunter, Bulwark, Ember Heart |

**Sustained output targets (B), with 75% of hits parried:** one ability 1.2; two abilities 1.6; a full three-slot build
2.0-2.3; an expert (90% parries, Perfect timing) 2.8 at most. A loadout above 2.8 at 75% parries is over-tuned.

The parry refund is the engine. A good parrier refunds 2-3 cooldown turns per enemy move, so a CD 5 payoff comes back
every two turns. In the model, a Codex-coefficient Wren build (Echo Shot, Deadeye 1.8 sure crit) deals about 3.5x
Attack a turn **[M]**, and a 10-action Champion fell in 4.6 turns. That is why foe HP must count build turns (B), and
why the sure-crit payoffs come down.

### 4.3 Abilities that look off (numbers)

| Ability | Today (Codex) | Problem | Proposal |
|---|---|---|---|
| T2 Riposte | 1.6 sure crit = 4.0U, CD 3, after any parried hit | With 75% parries on 2-hit moves, 94% of moves light it, and refunds make CD 3 ready every turn: 4.0U a turn, B about 4 | **1.2 sure crit (3.0U), CD 4** |
| W3 Deadeye | 1.8 sure crit = 4.5U, 5.4U on Mark | Echo -> Deadeye every two turns: 3.8U a turn | **1.5 (3.75U, 4.5U marked)** |
| A1 Power Shot | 1.8; Perfect = sure crit 4.5U (2.23x Good) | Perfect worth +125%; other Perfect bonuses are +25-50% | Keep the owner's sure-crit Perfect; **base 1.6** (Perfect 4.0U) |
| W8 Final Echo | 1.5 + 0.5 a Bleed + 0.5 an Aim; capped crit 19.8U | One hit takes 75% of a 12-turn Champion | **1.0 + 0.4 a Bleed + 0.4 an Aim** (4.2 raw, 12.6U at 3.0 crit) |
| P8 Lanternburst | 2.0 + 0.6 an Ember, x1.25 burning = 6.25 raw | Same | **1.5 + 0.5 an Ember**, x1.25 burning (5.0 raw) |
| T5 Hammerfall | 1.4 + 0.25 a Grit, x1.25 Exposed = 4.875 | Bulwark fills 10 Grit in two moves | **1.2 + 0.25 a Grit** (4.6 raw with Exposed) |
| C1 Spark | 1.3, CD 2, +1 Ember | Better than Attack every turn it is up | **1.2** |
| C6 Nova | 1.6, CD 4 | Lost its area in turn mode; worse than Power Shot | **2.0, CD 4** |
| M2 Cleave | 1.4 + 1 Bleed, CD 3 | Strictly worse than Heavy Strike 2.0 + Exposed | **1.5 + 2 Bleed** |
| A6 Twin Shot | 2 x 0.55 = 1.1 | A slot for +10% on Attacks only | **2 x 0.65 = 1.3** |
| M4 Momentum | +10% a consecutive Attack, any ability resets | With refunds you cast most turns; it rarely passes +10% | **+8% for each hero turn in a row without taking a hit, to +40%; a landed hit resets it.** Abilities no longer reset it. It rewards defence, Tobin's job |
| W2 Bat Swarm | 0.3 a foe turn x 3 + Blind | Low damage, fine as defence | Keep |
| P3 Ignite | Perfect stored Burn x2.0 | Within band | Keep |

Statuses as written are fine on this scale (Mark +20%, Exposed x1.25, Weaken 25%, Guard 40%, Ward 15-20% max HP).
**Recommendation:** setup statuses that feed a payoff (Mark, Exposed, Pinned's token) count **hero** turns, not foe
turns. Then a fast boss cannot age a combo out between your two actions.

### 4.4 Resources

- **Aim (Wren):** 0-3, +5% crit each, +1 per Attack. Worth about +7.5% damage per Aim at 2.5x crit. Keep. Wren's base
  crit drops to 15% (8% + 7%; remove the extra +10% kit bonus), so Aim matters.
- **Grit (Tobin):** 0-10, +3% Attack-button damage and 1% damage reduction each. Keep.
- **Embers (Pip):** 0-5, Fireball +10% each. Keep; Lanternburst per section 4.3.
- **Timing checks:** Perfect +50% (or the owner's listed rider), Good as written, Miss x0.7. Keep Codex's windows
  (Perfect 0.12 s, Good 0.30 s).

### 4.5 Open sign-offs: recommendations

| Open item | Recommendation |
|---|---|
| Manual 2.5x hand multiplier | **Remove** (with `atkX 5` and `counterX 4`). One scale: coefficient x Attack |
| Crit damage cap | **3.0x total** (2.5 base, +0.5 from gear, stars and Keen). Rolled crit chance **cap 60%** (was 75%); gear crit chance lines +20% at most. Sure crits ignore the chance cap |
| Focus rounding | Accept `max(2, ceil(baseCD x (1 - Focus)))`. **Cap Focus at 25%**, not 30%: refunds already shorten cooldowns. CD 2-8 become 2, 3, 3, 4, 5, 6, 6 |
| Haste pricing | Codex's +1 a rank on a Speed-10 scale is +10% a rank, +120% at 12 ranks: far too strong (Speed is turns). **+1 Speed a rank on the 100 scale (+1%), 15 ranks**, priced like ability Training. Gear Speed lines +15 at most. All permanent Speed: +30% over base at most |
| Star budget | Stars stay behaviour-only (0% of the power budget). 1 point a level to 35 covers all 17 forks (34 points). After 35, 1 point every 2 levels for subclass forks (16 points by about level 67). Free respec between fights |
| Hallowed, single target | No extra targets. Hallowed gives **+25% coefficient or one extra rider**, at most +30% on that ability (about +8-10% of total output). A Hallowed passive gets +25% to its numbers |

### 4.6 Speed

Speed is the strongest stat: +15% Speed is about +13% hero turns per boss move, so +13% damage and -13% damage taken
together. Keep its sources narrow (section 4.5). Dodge Training has no turn-mode use: fold it into Haste.

## 5. Enemy balance

### 5.1 How Codex's cards map onto the curve

- **HP** = card actions x A(z) x B(z) x (1 - armour). Codex's counts stand: normals 3-5, Captains 6-8, Champions 10-15,
  Elders as declared. "Actions" now means hero turns at the reference build, so skills shorten fights only above the
  reference. Two changes: Champions at least **12** (the Briar Regent's 10 lasted 7-8 turns with a full kit
  **[M]**, under the owner's 10-15; at 12 it lasts 8-9, a gentle first Champion), and **the Voice 26 -> 22**
  (section 6).
- **Hits:** card % x H(z) x role scale (section 6.2). Keep Codex's per-hit % as written. Normal move totals of 20-35%
  match the owner's "a missed defence costs 20-35%".
- **Armour:** 0/5/10/15/20/25% physical reduction, as cards state. Pip's spells ignore it; Sunder halves it.
- **Speed:** card Speed x S(z). The two-in-a-row cap (three for bosses) stays.
- **Captain:** inherits both moves, HP min(8, normal + 3), Speed as its card says (+0.05 in the Hollow, +0.1 on the Coast, unchanged in the Gloamvale). Its third
  move is the check. No extra generic multiplier, as the contract says.
- **Incoming statuses:** Bleed and Venom 2% of H a tick for 2 ticks, Burn 4% for 2, as the cards say. Keep.
- **Charge interrupt:** Codex's 6% of boss HP is about 0.6 reference Attacks on a 10-action boss: any Attack breaks
  it, so the charge never matters. **Interrupt at 1.5 x A(z) x B(z) of damage during the hold** (one payoff hit or two
  ordinary actions, about 10-12% of a Champion) or accepted control. Now the charge is a combo check.

### 5.2 Region modifiers

| Region | Card Speeds (all roles) | Biggest move totals | What gets harder |
|---|---|---|---|
| Hollow (1-35) | 0.75-1.20, mostly 0.8-0.9 | Champion charges 56-76%, Fenmother 102% | Learning: one to three hits a move |
| Sunken Coast (36-70) | 0.70-1.40 | up to 110% | Fast foes that double up, tide armour seams |
| Emberwaste (71-105) | 0.80-1.26, evenly spread | (cards use another notation; not checked here) | Burn, feints |
| Pale Reach (106-140) | 0.70-1.25 | | Chill on the hero (Speed down) |
| Gloamvale (141-175) | 0.75-1.25, many at 1.2 | Champion charges 62-80%, the Voice 112% | Long combos (up to 7 hits), held hits |

The scale does not change by region: the curve does that. Difficulty grows through Speed, hit count, feints and
statuses, which are skills, not stats. That is the right lever.

### 5.3 Codex's numbers on the curve (samples)

| Foe | Zone | Card actions | HP on the curve | Hits on the curve | Ref HP H |
|---|---|---|---|---|---|
| Thorn Imp | 1 | 3 | 60 | Briar Jab 20% = 20; Crosscut 2 x 10 | 100 |
| Crownthorn Imp (Captain) | 1 | 6 | 120 | Royal Rip 3 x 8 = 24 | 100 |
| Gloomjaw | 2 | 3 | 61 | Snap Shut 22% = 23 | 104 |
| Cave Devourer | 8 | 5 (10% armour) | 145 | Head Bite 30% = 39; Underjaw 2 x 17 | 130 |
| Ossuary Knight | 11 | 5 (20% armour) | 156 | Spine Lance 32% = 46 | 145 |
| Fen Abomination | 35 | 5 (20% armour) | 531 | Bogbreaker 34% = 103 | 304 |
| Briar Regent (Champion) | after 5 | 10 -> **12** | 238 -> 286 | Royal Cut 32% = 37; Sovereign Lance 2 x 28% = 2 x 33 | 116 |
| Drowned Halo (Champion) | after 35 | 15 | 1,790 | Halo Lance 36% = 110; charge 4 x 19% = 4 x 58 | 304 |
| Fenmother (Elder) | after 35 | 18 | 2,270 | Cold Hand 35% = 106; Smother 3 x 24% + 30% = 3 x 73 + 91 | 304 |
| Tideglass Knave | 36 | 3 | 408 | Fin Cut 22% = 68 | 311 |
| Breakwater Archon (Champion) | after 40 | 12 (20% armour) | 1,490 | Tidal Shear 4 hits, 92% total | 352 |
| Riftmaw | 141 | 3 | 7,990 | First Mouth 23% = 1,210 | 5,260 |
| The Voice (Elder) | after 175 | 26 -> **22** | 125,000 (148,000 at 26) | Decree 34% = 4,410; Snuff 7 x 16% = 7 x 2,070 | 12,960 |

**Today's Thorn Imp** (`59l-zone-foes.js`, `refHp 80`) **[R]**: 128 HP against an Attack of 51-57 (2.3-2.5 presses);
its jab takes 20% of Wren, 6% of Tobin, 15% of Pip. On the curve: 60 HP against 22 (2.7 presses, so 3 without a crit),
and the jab takes 18% of Wren (110 HP), 15% of Tobin (132), 19% of Pip (105). Codex's card holds on the new scale.

## 6. Boss difficulty (owner addition)

### 6.1 Rules

- **No wall clock in turn combat.** Remove `bossT 45` / `regionBossT 60`, the per-second Enrage and `enrageFail` for
  turn fights (`59-combat.js`, `50-sim.js`). Real time is a bad measure: a timing ring, a decision, a 7-hit combo all
  take seconds and the player is meant to think.
- **Pressure comes from phases, not timers.** Codex's phases (50% for Champions; 66% and 33% for Elders) add a hit, a
  feint, or Speed. A phase never cancels a promised hero turn or an announced release.
- ~~A soft "Dark Tide" only for stalling.~~ **Rejected (coordinator, 2026-10-01):** the owner removed the Enrage
  timer and Enrage entirely ("Remove the enrage timer and enrage entirely"), and a stacking damage ramp is an Enrage by
  another name. Bosses have no time or turn pressure; phases and the Break meter carry the fight. A stalled player can
  leave the boss and pick an easier zone.
- **Break meter (new, needs Codex sign-off).** Every boss has a Break bar of 100. It fills by skill: +4 a parried hit,
  +12 a completed counter, +10 a Perfect timed hit, plus Codex's +25 Stun / +35 Freeze. At 100 the boss is **Broken**:
  it loses its next turn, an active charge is cancelled, and it takes +25% damage for your next 2 turns. A good
  defender Breaks a boss about once every 1.5 boss cycles. That is the combo window the owner asked for.
- **The charge is a planned window.** The hold always gives you one turn (Codex). Interrupt needs 1.5 reference actions
  (section 5.1): land a payoff during the hold, or control it, or defend every release hit.
- **Sustain [A]:** heal 25% max HP after each regular win, to full on entering a zone and before every Champion and
  Elder. Codex left sustain open; without it, 31 fights an area cannot be balanced. The bag slot's potion (35%, one a
  fight) is the mistake buffer.

### 6.2 Damage scale by role (multiplies the card %)

| Role | Hollow | Coast | Emberwaste | Pale Reach | Gloamvale |
|---|---|---|---|---|---|
| Normal, Captain | 1.0 (areas 1-2 Captains 0.9: gentle) | 1.0 | 1.0 | 1.0 | 1.0 |
| Champion | 0.8 (areas 1-4), 0.9 (areas 5-7) | 0.9 | 0.9 | 0.9 | 0.9 |
| Elder | 0.75 | 0.8 | 0.8 | 0.8 | 0.75 (the Voice: 35 hits and a 7-hit Snuff are hard enough) |

### 6.3 Targets and model results

"Typical" is 70-80% of hits defended **[A]**. Dodge has the wider window (0.35 s against 0.18 s), so a typical
player dodges about 85% and parries about 70%. The model below uses one success rate for every hit and parries every
time; seconds assume 3.5 s a hero turn and 1.1 s a foe hit **[M]**. Real play with UI is slower: read about 1.5x.

| Fight | Hero turns | Model time | Win at 60% / 70% / 80% / 90% defended | Misses taken in a win (75%) | Undefended full cycle |
|---|---|---|---|---|---|
| Normal (Imp to Riftmaw) | 2-4 | 10-15 s | 100% at all | 0-1 | 20-35% of HP |
| Captain, early (Crownthorn) | 3-4 | 20-25 s | 100% at all | about 1.5 | 50-60% |
| Captain, mid (Deepmaw, 8) | 5 | 30 s | 91 / 99 / 100 / 100% | about 1.6 | about 90% |
| Champion, Hollow (Briar Regent, 12, x0.8) | 8-9 | 45-50 s | 92 / 98 / 100 / 100% | about 2.8 | about 120% |
| Champion, Hollow end (Drowned Halo, 15, x0.9) | 10-11 | 60 s | 45 / 74 / 93 / 100% | about 3.4 | about 170% |
| Elder, Fenmother (18, x0.75) | 11-12 | 75 s | 16 / 47 / 84 / 99% | about 4 | about 170% |
| ... with the 35% potion (+30% HP) | 12 | 80 s | - / 71 / 94 / -% | about 5 | |
| Elder, the Voice (22, x0.75) | 16 | 2 min | - / 24 / 69 / 99% (85%: 89%) | about 6 | about 170% |

Without abilities (Attack only) the Drowned Halo drops to 35% at 75% defence; dodging every hit (no refunds, no
counters) drops it to 19% at 70%, because refunds and counters are a third of the damage **[M]**. Parry is rewarded,
dodge is the safe line, exactly as the owner set.

**Mistakes a player can afford** (from full HP, before Ward, Guard and potions): about 5-6 missed hits against a Hollow
Champion (average landed hit about 17% of HP), about 5 against later Champions (19%), 4-5 against an Elder (18-20%),
6-7 against the Voice (14%, but 35 hits come at you). A full charge release undefended costs 45-80% for a Champion and
75-85% for an Elder after the role scale: lethal only when you are already hurt, as the owner wants. The Voice's
last-phase 7-hit Snuff (112% x 0.75 = 84%) comes when you are rarely at full HP.

### 6.4 The ramp

| Step | Fight length | Wants | Lesson |
|---|---|---|---|
| Captains, Hollow areas 1-2 | 3-6 turns | 60% defence wins | read a third move |
| Captains, later | 6-8 turns | 70% | gear check: if you drift to 0.90x, forge |
| Champions, Hollow | 9-11 turns | 70% for a likely first win | charge window, phases |
| Champions, later regions | 11-13 turns | 75-80% | longer combos, faster bosses |
| Elders | 12-16 turns | 80% for a likely win, 70% to scrape one | everything, plus sustain and Break |

Across regions the hero gets better tools (subclass, full forks) and the player gets better hands. The bosses get more
hits per move, more feints and more Speed. Their stats stay on the curve.

### 6.5 How Speed and refunds open combo windows

- Each parried hit takes 1 turn off every cooldown. A fully parried 3-hit move refunds 3: your CD 5 payoff is ready
  next turn. Refunds are the combo engine; Break is the reward for stringing them.
- The hold before a charge guarantees your turn. A boss's three-in-a-row cap applies only in later phases.
- Setup statuses that count hero turns (section 4.3) keep a Mark or Exposed alive across a boss's double turn.
- +15% hero Speed gives about 13% more hero turns per boss move.

## 7. Fun levers

**Do:**

- **Crit feel.** 2.5x stays special: rolled crit chance 15-35% for most builds, 60% at most. Crits get a bigger, gold
  number and a short hit-stop. Sure-crit payoffs print the same gold.
- **Big-number moments.** A finisher crit is about 12x Attack: 40-45% of a Champion, 25% of an Elder. One per fight,
  earned by setup. The fight's biggest hit is shown at the end ("Best hit: 1,840").
- **Overkill.** Show the overkill as a second, faded number. Overkill of 50% or more on a regular foe is a "Clean
  kill": +10% gold. No other reward (avoid number bloat).
- **Streaks.** A "Flawless" fight (no hit landed on you) and a flawless zone (6 fights) pay a little Essence. Show a
  parry streak counter during the fight; it feeds Break.
- **First kills.** Every Captain's first kill drops a grade item with a better rarity roll. Each Champion's first kill
  drops its **unique** (guaranteed, once, and it uptiers with you) and its Trophy. Each Elder drops its unique and the
  next region's first-grade materials. This also answers the open "uniques without rematches" item [A].
- **The counter.** Fully parrying a move freezes the frame, then a sure crit lands with "Counter". A full parry of a
  3+ hit move adds "Perfect defence" and fills Break.
- **Gear drops.** Rarity is revealed with a colour beam before the name. The card shows the delta in fights, not
  stats: "+28% Attack. Gloomjaw: 4.4 -> 3.6 turns". Uptier previews show the same.

**Do not:**

- Put any boss on a real-time clock, or end a fight before a full combo cycle.
- Scale enemy damage with the player's own HP, or let HP follow damage.
- Stack account-wide "+% damage" past the 10% bucket, or let any Training curve be exponential.
- Let a lucky rarity be worth more than one grade (Epic is 1.36, a grade is 1.28).
- Let a Perfect bonus exceed +50%, except the owner's sure-crit riders.
- Cap refunds per move, give random or automatic parries, or make dodge pointless.
- Let any number pass about 150k HP or 50k a hit.

## 8. Implementation plan

In order. Each step lands with its checks; the save key moves to `lanternfall.save.v6` at step 2 (owner rule: prefer a
clean wipe over a migration).

1. **`ZONE_CURVE` data (new core data file, for example `21zb-data-curve.js`).** `GZ`, `STEP 1.28`, `LEAD 1.12`, the
   soft-source table, `B(z)`, `S(z)`, and pure functions `refAtk(z)`, `refHp(z)`, `refSpeed(z)`, `buildX(z)`,
   `zoneGrade(z)`. Precompute a 175-row table at load. Checks: monotonic; A(175)/A(1) and H(175)/H(1) between 80 and
   130; hero/zone ratio 1.12 at every `GZ` start and 0.88-0.92 at every window end; no value above 150k.
2. **Hero stats on the curve** (`40-rules.js`, `59-combat.js`, `24b-data-solo.js`). Attack and HP from section 2.1.
   Remove `hpP = pow`, `atkX`, `abHandX`, `counterX`, `dmgX`, `ramp`, `heroX`, `hpX`, `drX`, `bossHitX`, the
   exponential `atkCurve`/`trainAbCurve` (Training becomes +0.5% a level; abilities +2% per 5 ranks to +20%) and
   `lvlMult`'s +4% a level (+0.4% Attack, +1% HP). Checks: level-1 Wren/Tobin/Pip HP 110/132/105 and Attack 22;
   Thorn Imp dies to 3 uncrit Attacks; the jab takes 15-20% of every hero.
3. **Gear** (`20-data.js`, `41-items.js`, `21-data-craft.js`, `55-crafting.js`). 15 grades at x1.28; rarity 1 / 1.10 /
   1.22 / 1.36 / 1.52; forging +2% to +10; flat Attack and HP base lines; the Uptier action; crit lines capped (+20%
   chance, +0.5x damage). Checks: an uptier keeps rarity and forge and adds exactly 28%; best-in-slot at zone z is at
   most 1.55x the reference.
4. **Foes from cards** (`59l-zone-foes.js`, `59k-turn.js`). Replace `refHp 80` with `refHp(z)`; HP from card actions x
   `refAtk(z)` x `buildX(z)` x (1 - armour); Speed x `refSpeed(z)`; the role scale (section 6.2). Remove `foeHpX`, the
   auto-parry and auto-dodge knobs. Checks: every card in the five regional files resolves; sample rows of section 5.3.
5. **Ability registry coefficients** (with the C19 engine). Section 4 bands and the section 4.3 changes; counter 0.5
   sure crit; crit cap 3.0x and 60%; Focus cap 25%; Haste +1 a rank, 15 ranks; setup statuses on the hero clock.
6. **Boss rules** (`59-combat.js`, `59h-bosses.js`, `50-sim.js`). Remove the wall-clock Enrage in turn fights; add the
   the Break meter, the 1.5-action charge interrupt, phase hooks; heal rules (25% after a win,
   full before a zone and a boss). Remove `PACE.bossHp` and `regionBoss` (boss HP comes from cards).
7. **One account bucket.** Route mastery, camp, Codex, Rested, constellation stat nodes, Warbanner and Loaded Die into
   one `+10%` cap; move the excess to gold, Essence or XP. Drop the per-zone mastery damage.
8. **Remove the old curve.** `PACE.hp0`, `hpEarly`, `hpGrowth`, `hpLate`, `bend`, `regionStep`, `essTier`,
   `farmableZone`/`farmSecs` (no idle push), `zoneAtk` and `COMBAT_TUNE.atk/easeZone/easePow`.
9. **`tools/sim-turn.mjs`** (new). A seeded, deterministic version of this document's fight model running the real
   turn engine with scripted defence success rates (50/70/80/90%). `check.mjs` pins: normals 2-5 turns, Captains
   3-8, Champions 8-13, Elders 11-18 at 75%; Champion first-try win 70-100% at 75% defence; Elder 45-75% at 75% and
   at least 85% at 85%; no fight ever fails on time; the biggest single hit stays under 50% of a Champion's HP.

## Appendix: model notes

- The curve script and fight model are scratch files (not committed): a stepped hero against a windowed zone curve,
  and a one-hero-one-foe Monte Carlo with a gauge timeline (hero 2 in a row, boss 3), per-hit success rate, 1-turn
  refunds, a counter on a fully parried move, a three-slot kit (setup 1.8 + Mark 4 turns, sure-crit payoff 1.5,
  Attack with 12% crit) and charge holds with interrupts.
- The model treats every defence as a parry at one success rate, ignores Guard, Ward, Weaken, statuses and phases,
  and does not model the Break meter. Real numbers will move; the shapes (who is too strong, where fights get long,
  what refunds are worth) are the point. Step 9 replaces it with the real engine.
