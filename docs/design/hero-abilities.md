# Hero ability trees: Wren, Tobin and Pip (C19 draft)

Status: **draft for review** (owner brief 2026-10-01; Codex second review on PR #1). Nothing here is built yet.
It replaces the "about 10 abilities" sketch in `solo-hero.md` (Abilities) with the owner's new count.

## 1. The brief

- **Owner (2026-10-01):** each hero has **6 shared + 8 signature = 14 abilities**. "Lots of abilities, but it's what
  makes unlocking a new character feel worth it."
- **The 6 shared** come from a pool per play style (archer, melee, caster), the same six for every hero of that style,
  each flavoured to the hero (name stays, colour and art change). The **8 signature** abilities are the hero's own.
- **Style:** turn combat in the spirit of Expedition 33. One ability sets something up and another pays it off. For
  example, Fireball burns a foe for three turns and Searing Eye crits on burning foes.
- **Kinds:** damage, buffs on the hero, debuffs on the foe.
- **In reach of the engine:** everything below uses the turn engine's pieces: cooldowns in turns, one action per hero
  turn, statuses that count turns, a timed parry and dodge, and three small per-hero resources. New mechanics are flagged
  **[new]** and listed in section 8.
- **Art:** each ability names the **pose family** it plays, so Codex can plan every pose at once (section 7).

## 2. Rules every ability follows

- **One action a turn.** An ability replaces the hero's Attack that turn. Parry and dodge happen on the foe's turn, as now.
- **Cooldowns are in the hero's turns.** Attack has 1. Small abilities 2-3, medium 4-5, finishers 6-8. **Fresh every fight**
  (owner, 2026-10-01). Finishers also **open after N turns**: the button lights only from turn N, so no fight opens on a
  finisher.
- **A timed parry takes 1 turn off every cooldown** (as now). This stays the main reward for active play.
- **Power** is shown as a multiple of the hero's Attack hit (Attack = 1.0). The engine's hand bonus and Auto penalty apply
  on top, as today.
- **Equip 3.** The action bar keeps 3 ability slots (Q/W/E) plus Attack, Parry and Dodge. With 14 abilities the loadout is
  the build. (Question 2 asks whether to go to 4.)
- **Auto** casts the first ready ability in bar order. Abilities that need a condition (Riposte after a parry, Ignite on a
  burning foe) are skipped by Auto until the condition holds.
- **Bosses:** a stun, freeze or skipped turn becomes **Stagger** on a boss (as today: bosses fill the stagger bar
  instead). Every ability below says what it does to a boss when that differs.
- **Packs (real-time mode, until the turn engine ships everywhere):** cooldown turns x 2 s; status turns x 2 s; "all foes"
  hits the pack. One foe at a time in turn mode, so "all foes" is the one foe there.

## 3. Statuses (turn versions)

Foe turns count down foe statuses; hero turns count down hero buffs. A status re-applied refreshes its turns; the stronger
one stays.

| Status | On | Effect | Turns | Stacks | Bosses |
|---|---|---|---|---|---|
| **Burn** | foe | 0.4 fire damage at the start of its turn | 3 | no (stronger stays) | yes |
| **Bleed** | foe | 0.15 physical a stack at the start of its turn, ignores armour | 3 | to 5 | yes |
| **Venom** | foe | 0.08 a stack, +1 stack each turn on its own; at 5+ stacks the foe's healing is halved | 4 | to 10 | yes |
| **Chill** | foe | -3 Speed. **3 Chill = Frozen**: it skips its next turn, then the Chill clears | 2 | to 3 | Frozen = big Stagger |
| **Stun** | foe | skips its next turn. Not twice within 3 turns | 1 | no | Stagger |
| **Mark** | foe | takes +20% damage | 3 | no | yes |
| **Sunder** | foe | armour halved | 3 | no | yes |
| **Weaken** | foe | deals 25% less | 2 | no | yes |
| **Pinned [new]** | foe | its next attack winds up slower: the parry window is 50% wider | until it attacks | no | yes |
| **Blind [new]** | foe | its attacks miss 30% of the time | 2 | no | 15% |
| **Guard** | hero | takes 40% less | 2 | no | — |
| **Ward [new]** | hero | a shield of X% max HP that soaks hits first | 3 | no (stronger stays) | — |
| **Keen** | hero | next hit +50% crit damage | 1 hit | no | — |

**Per-hero resources** (the E33-style charge; all three exist today):
- **Wren: Aim**, up to 3. Each Aim adds +10% crit chance. Gained from Attack and some abilities. (Today's turn effect
  is called "focus". Gear Haste is now shown as **Focus**, so the hero resource needs another name: **Aim**.)
- **Tobin: Grit**, up to 10. Each Grit adds +3% Attack and -1% damage taken (as now).
- **Pip: Embers**, up to 5. Each Ember adds +10% to the next fire spell that spends them (as now).

## 4. Stats

Proposed hero stat sheet. Bold stats are new or changed. Gear, Training (gold) and the star map raise them.

| Stat | What it does | Wren | Tobin | Pip |
|---|---|---|---|---|
| Attack | the 1.0 every power figure scales from | medium | medium | high (spells) |
| HP | | low (x1.1) | medium (x1.0) | high (x1.6, as now) |
| Armour | cuts physical hits | low | high | low |
| Crit chance | | **15%** | 8% | 8% |
| Crit damage | | high | normal | normal |
| **Speed** | who acts first (today "Haste"/initiative; a gear line, which is missing today) | 10 | 9 | 10 |
| **Focus** | -% cooldowns (gear Haste renamed), cap 30%, never below 1 turn | | | |
| Pierce | ignores armour | yes | | |
| **Status power** | +% status damage (Burn, Bleed, Venom) and Ward size; uses today's `control` gear line | | | yes |
| Counter | +% parry counter damage (Training) | | yes | |

## 5. The shared pools (6 each)

Every future archer, melee or caster hero shares these six. The pose column is the pose family (section 7).

### Archer pool (Wren)

| # | Ability | Kind | Power | Cooldown | Effect | Combo | Pose |
|---|---|---|---|---|---|---|---|
| A1 | **Power Shot** | damage | 2.2 | 3 | A heavy arrow. | +1 Aim if it crits | draw-release |
| A2 | **Barbed Arrow** | damage + debuff | 1.2 | 3 | 2 Bleed. | feeds Bleed payoffs | draw-release |
| A3 | **Pinning Shot** | debuff | 1.0 | 4 | Pinned, and -3 Speed for 2 turns. | sets up a counter | kneel-shot |
| A4 | **Hunter's Mark** | debuff | 0.6 | 4 | Mark for 4 turns. | feeds every Mark payoff | point |
| A5 | **Volley** | damage | 3 x 0.7 | 4 | Three arrows; each can crit and each counts as a hit. | many hits for on-hit effects | sky-draw |
| A6 | **Quick Draw** | damage + resource | 0.9 | 2 | A fast shot. | +1 Aim | draw-release |

### Melee pool (Tobin)

| # | Ability | Kind | Power | Cooldown | Effect | Combo | Pose |
|---|---|---|---|---|---|---|---|
| M1 | **Heavy Strike** | damage | 2.0 | 3 | A big two-handed blow. | x1.5 on a Stunned foe | overhead |
| M2 | **Cleave** | damage + debuff | 1.4 | 3 | A wide swing; hits all foes. 1 Bleed. | | wide-swing |
| M3 | **Sunder** | debuff | 1.0 | 4 | Sunder 3 turns. | feeds Sunder payoffs | overhead |
| M4 | **Battle Cry** | buff | — | 5 | +25% damage for 3 turns. | | shout |
| M5 | **Brace** | buff | — | 4 | Guard 2 turns; the next parry window is 50% wider. | sets up a parry | block |
| M6 | **Lunge** | damage + buff | 1.2 | 3 | Dash in. +3 Speed for 2 turns. | | lunge |

### Caster pool (Pip)

| # | Ability | Kind | Power | Cooldown | Effect | Combo | Pose |
|---|---|---|---|---|---|---|---|
| C1 | **Spark** | damage | 1.3 fire | 2 | A quick bolt. | +1 Ember | small-cast |
| C2 | **Frost Shard** | damage + debuff | 1.1 frost | 3 | 1 Chill (3 Chill = Frozen). | Frozen foes take x1.5 from fire ("Thaw") | small-cast |
| C3 | **Arcane Ward** | buff | — | 5 | Ward 20% max HP. | | lantern-raise |
| C4 | **Hex** | debuff | — | 5 | Curse 3 turns: it stores 20% of the damage it takes and bursts for that when it ends. | rewards a big turn | point |
| C5 | **Channel** | buff | — | 5 | Skip the hit. Next spell x1.8 and -1 turn on every cooldown. | | channel |
| C6 | **Nova** | damage | 1.6 | 4 | A ring of force; hits all foes. | | burst |

## 6. Signature abilities (8 each)

Tier: when it can be unlocked (section 6.4). F = finisher.

### 6.1 Wren, the Ranger: Mark and crit, with bats and echoes

Her loop: **Mark the foe, build Aim, then cash it in.** Bleed is her second payoff.

| # | Ability | Tier | Kind | Power | Cooldown | Effect | Combo | Pose |
|---|---|---|---|---|---|---|---|---|
| W1 | **Echo Shot** (today's) | 1 | damage + debuff | 1.8 | 5 | Pierces all foes. Mark 3 turns. | on a foe already Marked, it echoes: a second hit x0.6 | draw-release + sound waves |
| W2 | **Bat Swarm** | 2 | debuff | 0.3 a turn | 5 | Her bats harry the foe for 3 turns: 0.3 damage each foe turn and Blind. | Blind lowers its hit chance; pairs with dodging | whistle |
| W3 | **Deadeye** | 2 | damage | 3.0 | 5 | A sure crit on a Marked foe. Spends the Mark. | the main Mark payoff | long-draw |
| W4 | **Sonic Arrow** | 3 | damage + debuff | 1.0 | 5 | Stuns a Marked or Pinned foe (spends it). | Pinning Shot or Mark, then this | draw-release + sound waves |
| W5 | **Shadow Step** | 3 | buff | — | 4 | She dodges the next attack for sure, then Keen. | dodge into Deadeye | backstep |
| W6 | **Moonlit Volley** | 4 | damage | 5 x 0.5 | 6 | Arrows fall from above. On a Marked foe each hit adds 1 Bleed. | Mark, then this, then Final Echo | sky-draw |
| W7 | **Night Hunter** | 4 | buff | — | 6 | For 3 turns every Attack Marks and gives +1 Aim. | turns Attack into setup | hood-stance |
| W8 | **Final Echo** (F) | 5 | finisher | 1.5 + 0.5 per Bleed + 0.5 per Aim | 7, opens turn 3 | Spends all Bleed and Aim. If it kills, every cooldown drops 2. | the end of her loop | long-draw + sound waves |

### 6.2 Tobin, the Warden: parry, Grit, stun

His loop: **Brace and parry, build Grit, then stun and smash.** He is the counter hero.

| # | Ability | Tier | Kind | Power | Cooldown | Effect | Combo | Pose |
|---|---|---|---|---|---|---|---|---|
| T1 | **Shield Bash** (today's) | 1 | damage + debuff + buff | 1.6 | 4 | Stun. Guard 2 turns. | sets up every Stun payoff | shield-bash |
| T2 | **Riposte** | 2 | damage | 2.8 | 3 | **Only right after a parry** (lit for 1 turn). A sure crit. | parry, then this | lunge |
| T3 | **Iron Will** | 2 | buff | — | 5 | +3 Grit and Ward 15% max HP. | builds Grit | plant |
| T4 | **Taunting Roar** | 3 | debuff | — | 5 | Weaken 2 turns and Pinned. | an easy parry for Riposte | shout |
| T5 | **Hammerfall** | 3 | damage | 1.0 + 0.3 per Grit | 5 | Spends all Grit. x1.5 on a Stunned foe. | the main Grit payoff | overhead |
| T6 | **Shield Throw** | 4 | damage + debuff | 1.4 | 4 | Stuns a Sundered foe. | Sunder, then this | throw |
| T7 | **Bulwark** | 4 | buff | — | 6 | For 3 turns: Guard, and every parry gives +1 Grit and counters x1.5. | the parry engine | block |
| T8 | **Last Stand** (F) | 5 | finisher | counters | 8, opens turn 3 | For 2 turns he cannot drop below 1 HP and counters every hit he takes. Then he heals 20% max HP. | the comeback | shield-raise |

### 6.3 Pip, the Lanternmage: Burn and Embers

Her loop: **Gather Embers, set the foe alight, then feed or detonate the fire.**

| # | Ability | Tier | Kind | Power | Cooldown | Effect | Combo | Pose |
|---|---|---|---|---|---|---|---|---|
| P1 | **Fireball** (today's) | 1 | damage + debuff | 1.8 | 5 | Burn 3 turns. Spends Embers (+10% each). | sets up every Burn payoff | big-cast |
| P2 | **Kindle** | 2 | damage + resource | 0.6 | 2 | +2 Embers. On a burning foe, Burn lasts 1 more turn. | builds Embers, stretches Burn | small-cast |
| P3 | **Ignite** | 2 | damage | burn left x1.5 | 4 | Spends the Burn: all its remaining damage at once, x1.5. | Fireball, then this | snap |
| P4 | **Searing Eye** | 3 | buff | — | 6 | For 2 turns her hits on a burning foe always crit. | the owner's example: burn, then sure crits | channel |
| P5 | **Wildfire** | 3 | debuff | — | 5 | Burn grows: +0.2 each turn instead of fading, 3 turns. | stack with Kindle, cash with Ignite | big-cast |
| P6 | **Lantern Flare** | 4 | debuff | 0.5 holy | 5 | Blind 2 turns. A burning foe is also Marked. | | lantern-raise |
| P7 | **Ember Shield** | 4 | buff | — | 5 | Ward 5% max HP per Ember (kept, not spent). A foe that hits it catches fire. | Burn without casting | lantern-raise |
| P8 | **Lanternburst** (F) | 5 | finisher | 2.0 + 1.0 per Ember, x2 on a burning foe | 7, opens turn 3 | Spends all Embers and the Burn. | the end of her loop | burst |

### 6.4 Unlocking

Fourteen abilities in five tiers. Hero level opens a tier; a boss item at Elowen's chapel unlocks each ability in it,
as `solo-hero.md` already says ("level alone never unlocks an ability").

| Tier | Opens at | Abilities |
|---|---|---|
| 1 | start | the hero's signature 1 (today's ability) + pool 1 (Power Shot / Heavy Strike / Spark) |
| 2 | Lv 8 | signature 2-3 + one pool ability |
| 3 | Lv 16 | signature 4-5 + one pool ability |
| 4 | Lv 25 | signature 6-7 + one pool ability |
| 5 | the Proving (Lv 35) | the finisher + the last two pool abilities |

Hallowed (`solo-hero.md`) applies to the 8 signature abilities, as decided.

## 7. Poses for the art (the reason for doing this now)

Every ability plays one **pose family**: a wind-up, a release and a recover pose, with Attack's recover reused where it
fits. Shared families are drawn once per hero. Props and effects (sound waves, bats, fire) come from the artist (art freeze).

| Pose family | Used by | Wren | Tobin | Pip |
|---|---|---|---|---|
| draw-release | A1 A2 A6 W1 W4 | exists (draw, release) | | |
| long-draw | W3 W8 | **new**: a held full draw | | |
| sky-draw | A5 W6 | **new**: aim up | | |
| kneel-shot | A3 | **new** (kneel exists for hurt) | | |
| point | A4 C4 | **new** | | **new** |
| whistle | W2 | **new** (+ the bat fx exists) | | |
| backstep | W5 | **new** (also the dodge) | | |
| hood-stance | W7 | **new** | | |
| overhead | M1 M3 T5 | | wind + strike exist | |
| wide-swing | M2 | | **new** | |
| shout | M4 T4 | | **new** | |
| block | M5 T7 | | exists | |
| lunge | M6 T2 | | **new** | |
| shield-bash | T1 | | **new** (today it plays the block) | |
| plant | T3 | | **new**: braced, feet set | |
| throw | T6 | | **new** | |
| shield-raise | T8 | | **new** | |
| small-cast | C1 C2 P2 | | | wind + cast exist |
| big-cast | P1 P5 | | | exists (Fireball) |
| lantern-raise | C3 P6 P7 | | | **new** |
| channel | C5 P4 | | | **new** |
| snap | P3 | | | **new** |
| burst | C6 P8 | | | **new** |

**New poses per hero:** Wren 7, Tobin 7, Pip 5 (about 3 frames each), plus the effects: arrows, sound waves, bats, a
thrown shield, fire, frost, the lantern's light, wards. This is the art bill Codex can plan against in one go.

## 8. What the engine needs (all in reach)

Today's turn engine (`59k-turn.js`) knows four cooldown keys and a handful of effects. To build this:

1. **An ability table** (data, like `SOLO_ABILITIES`) in place of the hard-coded `TURN_CD_KEYS`: power, cooldown, opens-at
   turn, statuses applied, conditions, what it spends.
2. **Turn statuses** from section 3: the real-time `59a-status` rules counted in turns.
3. **Conditions and spends:** "on a Marked / burning / Stunned foe", "spends Burn / Mark / Grit / Embers / Aim".
4. **Multi-hit** (Volley, Moonlit Volley), where each hit rolls its own crit.
5. **[new] Ward** (a shield in HP), **Blind** (miss chance), **Pinned** (a wider parry window; the `parryWindow` hook
   exists), **Riposte's lit-after-parry rule**, **Last Stand's 1 HP floor**.
6. **The action bar picker** grows from 1 ability per hero to a list of 14 with tiers and locks.
7. **Auto rules:** skip conditional abilities until they apply.

None of this needs new UI beyond the picker and status icons. Real-time mode reads the same table (turns x 2 s).

## 9. Questions for the owner

1. **6/8:** is this 6 shared + 8 signature = 14 per hero? (This draft assumes so.)
2. **Equip 3 or 4?** Three keeps the 2 x 3 bar; with 14 abilities, four slots (2 x 4) gives builds more room.
3. **Wren's "focus" becomes Aim**, since gear Focus is now the cooldown stat. OK?
4. **Subclasses:** the Proving opens subclasses "each with new abilities" (`solo-hero.md`). Does tier 5 here count as that,
   or do subclasses add more abilities on top of the 14? (Each extra ability is more art.)
5. **Speed on gear:** turn order needs a Speed line on gear (there is none today). Add it?
