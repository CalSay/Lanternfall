# Ability tree details

This companion contains the detailed star, unlock and loadout maps linked from hero-abilities.md. It gives each of the 42 abilities its two star branches, maps tier relics to verified boss IDs and displayed names, and lists complete three-slot loadouts. Everything here is a proposal for review; relics and branches are not implemented.

The owner-specified base critical multiplier is **2.5x**. A guaranteed critical applies that multiplier once; it does not roll a second critical or multiply twice. Gear and star effects add percentage points to 2.5x, with a proposed cap of 3.0x. Keen adds 0.5x to the next eligible direct cast under that same cap. Damage over time and stored damage cannot crit. Parry counters use their existing guaranteed-critical rule with the owner's new 2.5x base, exactly once; they do not roll an additional crit.

## 10. Full star trees

Each ability receives one fork with two named leaves. The player spends two star points to choose A or B. The choices are mutually exclusive; a player cannot take both. An ability does not require points in another ability before its fork opens.

At one star point per hero level after level 1, a level-35 hero has 34 star points. That covers the 14 ability forks for 28 points and the three Attack, Parry, and Dodge forks for 6 points. During balancing, allow a free respec between fights. A permanent chapel respec cost remains for C22 to decide. Changing a fork does not erase gold Training levels.

The three paths below are interface groupings. They are not subclasses, and a player may choose abilities from any path for the three equipped slots.

| Hero | Path | Abilities |
|---|---|---|
| Wren | True Aim | A1, A4, A6, W1, W3 |
| Wren | Blood Trail | A2, A5, W6, W8 |
| Wren | Night Wings | A3, W2, W4, W5, W7 |
| Tobin | Sword Oath | M1, M2, M3, M6, T5 |
| Tobin | Shield Oath | M5, T1, T3, T6 |
| Tobin | Last Light | M4, T2, T4, T7, T8 |
| Pip | Kindling | C1, P1, P2, P5 |
| Pip | Wild Flame | C4, C5, P3, P4, P8 |
| Pip | Lantern Keeper | C2, C3, C6, P6, P7 |

### Wren: shared archer and signature forks

| ID | Choice A | Choice B |
|---|---|---|
| A1 Power Shot | **Piercing Head:** ignore half of the target's remaining armour reduction. | **Measured Draw:** spend 1 Aim, if available, for +0.3 U; this cast cannot also gain Aim. |
| A2 Barbed Arrow | **Deep Barb:** add 1 Bleed stack. | **Hooked Head:** apply Pinned instead of the second Bleed stack. |
| A3 Pinning Shot | **Hunter's Opening:** also apply Mark for 2 turns. | **Leg Shot:** also apply Weaken for 1 foe opportunity. |
| A4 Hunter's Mark | **Study Prey:** gain 1 Aim. | **Lasting Trail:** a Mark spender leaves a fresh 1-turn Mark after its hit. |
| A5 Volley | **Raking Flight:** the last arrow adds 2 Bleed stacks. | **Tight Grouping:** the third arrow ignores armour if the target was Marked when the cast began. |
| A6 Quick Draw | **Steady Hand:** gain 1 extra Aim only if the cast began at zero Aim. | **Quick Escape:** take 20% less direct damage at the next foe opportunity. |
| W1 Echo Shot | **Reverberation:** the echo applies Pinned. | **Blood Echo:** the echo adds 2 Bleed stacks. |
| W2 Bat Swarm | **Scent Blood:** the first swarm tick against a Bleeding foe adds 1 Bleed stack. | **Dark Wings:** replace swarm damage with Weaken for 2 foe opportunities; keep Blind. |
| W3 Deadeye | **Split Barb:** the hit against a Marked foe adds 2 Bleed stacks. | **Patient Eye:** spend 2 Aim for +0.2 U if available. |
| W4 Sonic Arrow | **Ringing Ears:** a successful setup also applies Weaken for 1 foe opportunity. | **Returning Note:** a successful setup grants 1 Aim. |
| W5 Shadow Step | **Slip the Snare:** remove 1 hero damage-over-time effect on cast. | **Find the Angle:** automatic evasion grants 1 Aim. |
| W6 Moonlit Volley | **Silver Rain:** the first arrow renews an existing Mark to at least 2 turns. | **Needle Rain:** each arrow ignores 20% of armour reduction; the Bleed cap is unchanged. |
| W7 Night Hunter | **Predator's Patience:** the first enhanced Attack against a Marked foe grants Keen after the hit. | **Quiet Cover:** the first enhanced Attack grants Guard for 1 foe opportunity. |
| W8 Final Echo | **Lingering Wound:** leave up to 2 Bleed stacks; only stacks spent count toward damage. | **Saved Breath:** leave 1 Aim; only Aim spent counts toward damage. |

### Tobin: shared melee and signature forks

| ID | Choice A | Choice B |
|---|---|---|
| M1 Heavy Strike | **Crack the Plate:** apply Sunder for 2 turns after the hit. | **Drive Back:** using Exposed grants 2 Grit. |
| M2 Cleave | **Open Wound:** add 1 Bleed stack. | **Close Guard:** apply Guard for 1 foe opportunity instead of Bleed. |
| M3 Sunder | **Riven Guard:** Sunder lasts 4 turns. | **Buckled Plate:** also apply Weaken for 1 foe opportunity. |
| M4 Battle Cry | **Challenge:** Pin the next enemy attack. | **Rally:** heal 5% of maximum HP on cast, once per fight. |
| M5 Brace | **Hold Firm:** one direct hit that reaches Ward or HP grants 1 Grit. | **Read the Blow:** a successful parry during Brace makes the next Attack ignore armour. |
| M6 Lunge | **Press the Crack:** if the target is Sundered, gain 2 Grit. | **Return to Guard:** apply Guard for 1 foe opportunity instead of Weaken. |
| T1 Shield Bash | **Shield Edge:** apply Sunder for 2 turns after the hit. | **Stand Fast:** gain 2 Grit when the target cannot skip because of boss or control rules. |
| T2 Riposte | **Open the Seam:** apply Sunder for 2 turns after the hit. | **Earned Ground:** gain 2 Grit. |
| T3 Iron Will | **Steeled Nerves:** cleanse 1 hero damage-over-time effect. | **Set Your Feet:** gain Guard for 1 foe opportunity when Ward expires or breaks, once per cast. |
| T4 Taunting Roar | **Rattled:** also apply Sunder for 1 turn. | **Answer Me:** a successful parry during this Pinned attack gives 2 extra Grit. |
| T5 Hammerfall | **Mighty Fall:** apply 2 Bleed stacks after the hit. | **Unbowed:** retain 2 Grit; retained Grit does not count toward this cast's damage. |
| T6 Shield Throw | **Ringing Rim:** apply Pinned on the shield's return. | **Guarding Return:** gain Ward equal to 5% of maximum HP on return. |
| T7 Bulwark | **Reprisal:** one direct hit per foe action that is not parried grants 1 Grit. | **Shelter:** Ward equal to 10% of maximum HP on cast replaces the counter bonus. |
| T8 Last Stand | **The Borrowed Sword:** each retaliation applies Sunder for 2 turns. | **The Hedge Knight:** the ending heal cleanses 1 damage-over-time effect instead of increasing the heal. |

### Pip: shared caster and signature forks

| ID | Choice A | Choice B |
|---|---|---|
| C1 Spark | **Bank the Spark:** gain 1 extra Ember only if the cast began at zero Embers. | **Cold Spark:** change to frost damage and apply 1 Chill instead of gaining an Ember. |
| C2 Frost Shard | **Rime Needle:** also apply Weaken for 1 foe opportunity. | **Thaw Point:** the next fire cast that consumes Freeze's Exposed retains 1 Ember it would otherwise spend; the retained Ember adds no damage. |
| C3 Arcane Ward | **Mending Light:** heal 5% of maximum HP if an existing Ward survives at cast time, once per fight. | **Hard Shell:** Ward blocks one enemy debuff application, then loses this property. |
| C4 Hex | **Long Sentence:** Curse lasts 4 foe opportunities; its storage cap is unchanged. | **Short Sentence:** Curse lasts 2 foe opportunities and deals a 0.3 U arcane hit on cast. |
| C5 Channel | **Banked Flame:** gain 1 Ember instead of reducing other cooldowns. | **Clear Mind:** cleanse 1 hero debuff instead of reducing other cooldowns. |
| C6 Nova | **Rime Ring:** change to frost damage and apply 1 Chill. | **Sheltering Ring:** gain Ward equal to 5% of maximum HP after the hit. |
| P1 Fireball | **Scattered Cinders:** split the direct damage into 3 equal hits with the same total; apply Burn once. | **Hearthfire:** add 1 Burn tick, within the 4-tick cap. |
| P2 Kindle | **Careful Tending:** if the target is not Burning, apply a weak 0.2 U Burn for 2 ticks; otherwise extend Burn normally. | **Bright Spark:** gain Keen if the cast began with 4 or more Embers; do not gain resources beyond the cap. |
| P3 Ignite | **Ash Seed:** after consumption, apply a fresh 0.2 U Burn for 1 tick. | **Gather Ash:** gain 1 Ember after consumption. |
| P4 Searing Eye | **Patient Flame:** empower only 1 action, but extend Burn by 1 on cast, within its cap. | **Piercing Gaze:** eligible critical hits ignore 20% fire resistance, never immunity. |
| P5 Wildfire | **Hungry Fire:** growth is 0.2 U instead of 0.15 U; the same ceiling applies. | **Cinder Veil:** the first grown tick applies Weaken for 1 foe opportunity. |
| P6 Lantern Flare | **Revealing Light:** a Burning target also gets Sunder for 2 turns. | **Guiding Light:** gain 1 Ember instead of applying Mark. |
| P7 Ember Shield | **Cinder Shell:** the first Ward hit grants 1 Ember instead of applying Burn. | **Warmth Within:** if Ward survives to expiry, heal 5% of maximum HP, once per fight. |
| P8 Lanternburst | **Afterglow:** apply a fresh 0.2 U Burn for 2 ticks after the burst. | **Homeward Light:** gain Ward equal to 10% of maximum HP after the burst. |

### Universal Attack, Parry, and Dodge forks

Each row also costs 2 star points. Choose one option for each hero action.

| Hero | Action | Choice A | Choice B |
|---|---|---|---|
| Wren | Attack | The first Attack gains 2 Aim instead of 1. | Attacking a Marked foe adds 1 Bleed stack. |
| Wren | Parry | The first counter each fight applies Mark for 2 turns. | Each counter grants 1 Aim. |
| Wren | Dodge | The next Attack after a successful Dodge gains 1 Aim. | The next Attack after a successful Dodge applies Pinned. |
| Tobin | Attack | Attacking a Sundered foe grants 2 Grit instead of 1. | The first Attack grants Ward equal to 5% of maximum HP. |
| Tobin | Parry | The first counter each fight applies Sunder for 2 turns. | The first counter grants Guard for 1 foe opportunity. |
| Tobin | Dodge | The next Attack after a successful Dodge grants 2 Grit. | The next Attack after a successful Dodge grants Guard for 1 foe opportunity. |
| Pip | Attack | Attacking a Burning foe grants 2 Embers instead of 1. | The first Attack applies 1 Chill. |
| Pip | Parry | The first counter each fight grants 1 Ember. | The first counter applies Weaken for 1 foe opportunity. |
| Pip | Dodge | The next Attack after a successful Dodge extends Burn by 1, within its cap. | The next Attack after a successful Dodge grants Ward equal to 5% of maximum HP. |

Resolve each fork at most once per action, never once per arrow or damage tick. Dodge tokens last through the next hero action. A successful automatic defense may trigger its matching fork. Shadow Step's guaranteed evasion does not count as a successful timed or automatic defense roll.

## 11. Tier gates and relic unlock routes

The starter signature is free. Each hero's other 13 abilities require both the tier gate and one relic redeemed at Elowen's chapel. A relic unlocks one eligible ability chosen by the player; it never picks randomly. Shared-pool abilities unlock per hero and are not automatically granted to future characters.

The tier counts are 2 / 4 / 4 / 3 / 1. Tier I includes the free signature and one relic ability; Tiers II and III each have four unlocks; Tier IV has three; Tier V has the finisher. This mapping makes useful shared abilities available before the Proving.

| Tier | Hero-level gate | Proposed relic | Verified source boss IDs and displayed names |
|---|---|---|---|
| I | Level 1 | First Spark | slime — Elder Moss Slime |
| II | Level 8 | Hollow Echo | bat — Elder Cave Bat; bones — Elder Rattlebones |
| III | Level 16 | Warden's Seal | beetle — Elder Barrow Beetle; spore — Elder Spore Cap |
| IV | Level 25 | Roadlight Ember | golem — Elder Quarry Golem; wraith — Elder Marsh Wraith |
| V | Level 35 and the Proving | Mother Spark | fenmother — The Fenmother; the lore beat also uses the key listener |

The boss IDs and display names above are verified in src/js/21g-data-bosses.js; the Fenmother lore key is listener in src/js/21h-lore-hollow.js. The relics and their drop rules below are proposed new content, not existing items or drop routes. Current boss-kit rows do not establish these drops, so implementation must add and test them explicitly. There is no Hollow Elder Hag or Elder Wolf in the current roster; the proposed route uses the actual Spore Cap, Quarry Golem, and Marsh Wraith instead.

| Tier | Wren | Tobin | Pip |
|---|---|---|---|
| I | W1 Echo Shot is free; A1 Power Shot uses First Spark. | T1 Shield Bash is free; M1 Heavy Strike uses First Spark. | P1 Fireball is free; C1 Spark uses First Spark. |
| II | A2 Barbed Arrow, A4 Hunter's Mark, W2 Bat Swarm, W3 Deadeye. | M2 Cleave, M4 Battle Cry, T2 Riposte, T3 Iron Will. | C2 Frost Shard, C3 Arcane Ward, P2 Kindle, P3 Ignite. |
| III | A3 Pinning Shot, A6 Quick Draw, W4 Sonic Arrow, W5 Shadow Step. | M3 Sunder, M5 Brace, T4 Taunting Roar, T5 Hammerfall. | C4 Hex, C5 Channel, P4 Searing Eye, P5 Wildfire. |
| IV | A5 Volley, W6 Moonlit Volley, W7 Night Hunter. | M6 Lunge, T6 Shield Throw, T7 Bulwark. | C6 Nova, P6 Lantern Flare, P7 Ember Shield. |
| V | W8 Final Echo. | T8 Last Stand. | P8 Lanternburst. |

Proposed relic names are account inventory items. Redeeming one consumes it and records an unlock for the selected hero and ability. The tier relic drop rates are proposed: one guaranteed on an eligible first clear, then a 20% chance with a five-clear dry-streak pity rule. Pity is tracked per relic category, is account-wide, and resets when that relic drops. At Tier V, the first Proving gives a guaranteed Mother Spark; repeat eligible clears use the proposed 20% / five-clear pity rule. Validate rates and repeat availability before implementation.

Tier gates open eligibility but never unlock an ability by level alone. Chapel copy should identify the exact source boss and item. Later-region boss relics may substitute downward so a returning player does not have to grind an early boss; C22 owns the exchange rule. These 42 abilities are the complete base-hero set. Subclass abilities remain additional future content pending C21; the Proving does not silently remove or replace them.

## 12. Three-slot builds

Each loadout below uses exactly three equipped abilities. Sequence numbers count the hero's action opportunities. Foe actions and damage-over-time ticks happen between them as defined in section 3 of hero-abilities.md.

| Build | Three equipped slots | Sequence and trade-off |
|---|---|---|
| Wren: precision | Echo Shot, Quick Draw, Deadeye | H1: Echo Shot applies Mark. The first foe opportunity ticks its duration. H2: Deadeye still sees Mark and consumes it on a sure crit. H3: Quick Draw builds Aim. Straightforward early combo. |
| Wren: bleeding finish | Hunter's Mark, Moonlit Volley, Final Echo | H1: Mark. H2: Moonlit Volley adds up to 5 Bleed stacks while Mark remains. Bleed ticks between actions. H3: Final Echo consumes the surviving Bleed and Aim. This build saves its finisher for a longer fight. |
| Wren: night hunt | Echo Shot, Sonic Arrow, Shadow Step | Mark the foe, then use Sonic Arrow while Mark is still present. Shadow Step guarantees the next dodge and sets up Keen. This trades the large finisher for control and safety. |
| Tobin: early breaker | Shield Bash, Heavy Strike, Iron Will | H1: Shield Bash attempts Stun and leaves Exposed. The foe may skip its next opportunity, but Exposed survives through H2. H2: Heavy Strike consumes Exposed for 1.25x. H3: Iron Will builds Grit and Ward. Against a boss, Exposed still supports the payoff if control only adds Stagger. |
| Tobin: stored strength | Iron Will, Shield Bash, Hammerfall | H1: Iron Will gives 3 Grit. H2: Shield Bash attempts Stun and leaves Exposed. H3: Hammerfall requires 2 Grit, consumes Grit and Exposed, and delivers the payoff. A parry can add Grit but is not required. |
| Tobin: counter knight | Brace, Riposte, Bulwark | H1: Brace guards and widens the next parry window. Parry during the foe action. H2: Riposte is lit after a successful manual or automatic parry. H3: Bulwark extends the guard and counter engine. A failed parry does not light Riposte; use Attack or Bulwark instead. |
| Pip: detonation | Fireball, Kindle, Ignite | H1: Fireball applies Burn. Burn ticks at foe starts. H2: Kindle adds Embers and extends remaining Burn. H3: Ignite spends Burn and damages from its remaining ticks; the stored portion cannot crit. |
| Pip: sustained flame | Fireball, Wildfire, Searing Eye | H1: Fireball applies Burn. H2: Wildfire refreshes and grows the Burn. H3: Searing Eye empowers the next 2 eligible hero actions, not its own cast. The payoff needs a longer fight. |
| Pip: lantern finish | Kindle, Ember Shield, Lanternburst | H1: Kindle gains 2 Embers. H2: Ember Shield creates Ward; if a foe attacks the Ward, it applies Burn. H3: Kindle can raise Embers to 4. H4: Lanternburst is open and has its 3-Ember requirement; it spends Embers and Burn. This needs the foe to hit the Ward for the Burn bonus and does not require forced self-damage. |
| Pip: frost and flame | Frost Shard, Cold Spark branch of Spark, Fireball | H1: Frost Shard applies 2 Chill. H2: Cold Spark adds the third Chill, attempts Freeze, and leaves Exposed. H3: Fireball consumes Exposed for 1.25x. Without the Cold Spark branch, repeated Frost Shards can reach the setup before the 4-turn Chill expires. |

Cooldowns, hero resources, statuses, and opening counters reset when each new foe begins. This reset does not grant healing; normal kill/heal rules remain separate. Finishers open at H3, the third hero action opportunity. Last Stand is once per fight. Because cooldowns reset between foes, cooldown length chiefly spaces actions inside a longer fight; short trash fights may end before a setup/payoff chain or finisher. The listed builds are most useful against elites and bosses unless trash health and action count are tuned to support them.

Use one condition-aware chooser and resolver for live turns and offline samples. Auto follows the player's slot priority but skips finishers before H3, Riposte without its token, Ignite, Wildfire, or Searing Eye without Burn, Hammerfall below 2 Grit, Lanternburst below 3 Embers, and an already active Night Hunter, Channel, or Searing Eye. Use Last Stand only below 35% HP and if unused. Recast Ward only when it adds at least 5% maximum-HP shield or the existing Ward expires before the next foe action. Apply the core specification's Burn-refresh eligibility filter before scanning slot priority; there is no second hidden ordering rule. Always fall back to Attack. A pure buff is still a valid action and must not be treated as a zero-damage failure.

These are implementable proposals, not a claim that Auto is already optimal.
