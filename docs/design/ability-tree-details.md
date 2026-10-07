# Ability tree details

This companion to hero-abilities.md gives each of the 42 abilities its two branches, maps tiers to bosses and lists three-slot loadouts. Status (2 October 2026): the branches are built as **talents** (`24e-data-talents.js`) and the tiers as **Scrolls** by zone band (`56e-abilities.js`); see [combat-turn-build.md](combat-turn-build.md). The relic-to-boss map and the star wording below are the C19 proposal, kept as design history.

The owner-specified base critical multiplier is **2.5x**. A guaranteed critical applies that multiplier once; it does not roll a second critical or multiply twice. Gear and star effects add percentage points to 2.5x, with a proposed cap of 3.0x. Keen adds 0.5x to the next eligible direct cast under that same cap. Damage over time and stored damage cannot crit. Parry counters use their existing guaranteed-critical rule with the owner's new 2.5x base, exactly once; they do not roll an additional crit.

The binding timing, passive, and Speed decisions in §2a of hero-abilities.md apply throughout this map. This file resolves how they interact with the forks, unlocks, and sample builds; it does not add another action, refund, or resource trigger.

## 10. Full star trees

Each ability receives one fork with two named leaves. The player spends two star points to choose A or B. The choices are mutually exclusive; a player cannot take both. An ability does not require points in another ability before its fork opens.

The six entries marked **passive** remain selectable abilities in the tree, but they have no cast, cooldown, or pose. They occupy one of the three slots and work during active combat while equipped. A hero can equip the shared-pool passive and signature passive together, leaving one slot for an active ability; none is mandatory. The passive branch modifies its standing effect, not a hidden cast.

### Timing and multi-hit fork interactions

Use the exact timing windows and Perfect bonuses in the binding timed-ability table in hero-abilities.md. A miss reduces only that hit's direct power to 0.7; it does not remove baseline riders, undo costs, or cancel the action. In active combat, resolve each prompt from the player's input on the hero's own action opportunity.

Base P1 Fireball is one direct hit and gets one timing prompt. With **Scattered Cinders**, that direct hit becomes three equal hits at one third of the original direct power each. Each hit gets its own timing prompt and independent crit roll. A Miss scales only that hit. Burn applies once, Embers are spent once, and generic resources/equipment proc once after all three hits; gains cannot fund a later hit in the same cast. If one or more hits are Perfect, apply P1's +1 Burn opportunity once for the whole cast. Additional Perfect hits do not add more Burn duration. The alternate **Hearthfire** fork leaves Fireball single-hit and adds one Burn opportunity, within the cap.

Volley and Moonlit Volley retain their per-arrow prompts and the per-arrow Perfect riders in hero-abilities.md. Other generic resource and gear effects remain once per action unless the main specification explicitly names a per-hit exception. A passive multi-hit Attack is still one Attack action: Twin Shot rolls crit and explicit Attack on-hit effects per arrow, but normal Aim and Night Hunter resolve once. Damage ticks, reaction hits, and counterattacks are not new hero actions.

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
| A3 Pinning Shot | **Hunter's Opening:** also apply Mark for 2 foe opportunities. | **Leg Shot:** also apply Weaken for 1 foe opportunity. |
| A4 Hunter's Mark | **Study Prey:** gain 1 Aim. | **Lasting Trail:** a Mark spender leaves a fresh 1-foe-opportunity Mark after its hit. |
| A5 Volley | **Raking Flight:** the last arrow adds 2 Bleed stacks. | **Tight Grouping:** the third arrow ignores armour if the target was Marked when the cast began. |
| A6 Twin Shot (passive) | **Steady Hand:** if both arrows hit, gain 1 Aim once for the Attack action, in addition to the normal Attack gain. | **Quick Escape:** after a Twin Shot Attack, take 20% less direct damage at the next foe opportunity. |
| W1 Echo Shot | **Reverberation:** the echo applies Pinned. | **Blood Echo:** the echo adds 2 Bleed stacks. |
| W2 Bat Swarm | **Scent Blood:** the first swarm tick against a Bleeding foe adds 1 Bleed stack. | **Dark Wings:** replace swarm damage with Weaken for 2 foe opportunities; keep Blind. |
| W3 Deadeye | **Split Barb:** the hit against a Marked foe adds 2 Bleed stacks. | **Patient Eye:** spend 2 Aim for +0.2 U if available. |
| W4 Sonic Arrow | **Ringing Ears:** a successful setup also applies Weaken for 1 foe opportunity. | **Returning Note:** a successful setup grants 1 Aim. |
| W5 Shadow Step | **Slip the Snare:** remove 1 hero damage-over-time effect on cast. | **Find the Angle:** Shadow Step's guaranteed chosen Dodge grants 1 Aim when it succeeds. |
| W6 Moonlit Volley | **Silver Rain:** the first arrow renews an existing Mark to at least 2 foe opportunities. | **Needle Rain:** each arrow ignores 20% of armour reduction; the Bleed cap is unchanged. |
| W7 Night Hunter (passive) | **Predator's Patience:** the first Attack that gains Night Hunter's Aim each fight also grants Keen after the hit. | **Quiet Cover:** the first Attack that gains Night Hunter's Aim each fight also grants Guard for 1 foe opportunity. |
| W8 Final Echo | **Lingering Wound:** leave up to 2 Bleed stacks; only stacks spent count toward damage. | **Saved Breath:** leave 1 Aim; only Aim spent counts toward damage. |

### Tobin: shared melee and signature forks

| ID | Choice A | Choice B |
|---|---|---|
| M1 Heavy Strike | **Crack the Plate:** apply Sunder for 2 foe opportunities after the hit. | **Drive Back:** using Exposed grants 2 Grit. |
| M2 Cleave | **Open Wound:** add 1 Bleed stack. | **Close Guard:** apply Guard for 1 foe opportunity instead of Bleed. |
| M3 Sunder | **Riven Guard:** Sunder lasts 4 foe opportunities. | **Buckled Plate:** also apply Weaken for 1 foe opportunity. |
| M4 Momentum (passive) | **Relentless Rhythm:** the first Attack in a new chain starts at +20% instead of +10%; the +50% ceiling is unchanged. | **Measured Cadence:** after the fifth consecutive Attack, the next Attack also gets +1 Grit; once per chain. Any active ability resets the chain; defence and counters neither build nor reset it. |
| M5 Brace | **Hold Firm:** one direct hit that reaches Ward or HP grants 1 Grit. | **Read the Blow:** a successful parry during Brace makes the next Attack ignore armour. |
| M6 Lunge | **Press the Crack:** if the target is Sundered, gain 2 Grit. | **Return to Guard:** gain Guard for 1 foe opportunity instead of Lunge's Speed buff. |
| T1 Shield Bash | **Shield Edge:** apply Sunder for 2 foe opportunities after the hit. | **Stand Fast:** gain 2 Grit when the target cannot skip because of boss or control rules. |
| T2 Riposte | **Open the Seam:** apply Sunder for 2 foe opportunities after the hit. | **Earned Ground:** gain 2 Grit. |
| T3 Iron Will | **Steeled Nerves:** cleanse 1 hero damage-over-time effect. | **Set Your Feet:** gain Guard for 1 foe opportunity when Ward expires or breaks, once per cast. |
| T4 Taunting Roar | **Rattled:** also apply Sunder for 1 foe opportunity. | **Answer Me:** a successful parry during this Pinned enemy attack gives 2 extra Grit once for the whole attack, regardless of its hit count. |
| T5 Hammerfall | **Mighty Fall:** apply 2 Bleed stacks after the hit. | **Unbowed:** retain 2 Grit; retained Grit does not count toward this cast's damage. |
| T6 Shield Throw | **Ringing Rim:** apply Pinned on the shield's return. | **Guarding Return:** gain Ward equal to 5% of maximum HP on return. |
| T7 Bulwark (passive) | **Reprisal:** the first un-parried direct hit in each foe opportunity grants 1 Grit; this is in addition to Bulwark's per-parried-hit Grit. | **Shelter:** when an entire multi-hit enemy attack is parried, gain Ward equal to 5% of maximum HP instead of Bulwark's ×1.25 counter bonus for that attack. The ordinary full-move counter still resolves once. |
| T8 Last Stand | **The Borrowed Sword:** each completed full-move counter during Last Stand applies Sunder for 2 foe opportunities. | **The Hedge Knight:** the ending heal cleanses 1 damage-over-time effect instead of increasing the heal. |

### Pip: shared caster and signature forks

| ID | Choice A | Choice B |
|---|---|---|
| C1 Spark | **Bank the Spark:** gain 1 extra Ember only if the cast began at zero Embers. | **Cold Spark:** change to frost damage and apply 1 Chill instead of gaining an Ember. |
| C2 Frost Shard | **Rime Needle:** also apply Weaken for 1 foe opportunity. | **Thaw Point:** the next fire cast that consumes Freeze's Exposed retains 1 Ember it would otherwise spend; the retained Ember adds no damage. |
| C3 Arcane Ward | **Mending Light:** heal 5% of maximum HP if an existing Ward survives at cast time, once per fight. | **Hard Shell:** Ward blocks one enemy debuff application, then loses this property. |
| C4 Hex | **Long Sentence:** Curse lasts 4 foe opportunities; its storage cap is unchanged. | **Short Sentence:** Curse lasts 2 foe opportunities and deals a 0.3 U holy hit on cast. |
| C5 Afterglow (passive) | **Banked Flame:** when Afterglow's boosted Attack lands, gain 1 Ember; once for that Attack action. | **Clear Mind:** when Afterglow's boosted Attack lands, cleanse 1 hero debuff; once per fight. The Attack still gets its stored damage type and +50% power. |
| C6 Nova | **Rime Ring:** change to frost damage and apply 1 Chill. | **Sheltering Ring:** gain Ward equal to 5% of maximum HP after the hit. |
| P1 Fireball | **Scattered Cinders:** split direct damage into 3 equal hits with the same total; each hit has its own timing grade and crit. Apply Burn once and spend Embers once for the cast. | **Hearthfire:** add 1 Burn tick, within the 4-tick cap. |
| P2 Kindle | **Careful Tending:** if the target is not Burning, apply a weak 0.2 U Burn for 2 ticks; otherwise extend Burn normally. | **Bright Spark:** gain Keen if the cast began with 4 or more Embers; do not gain resources beyond the cap. |
| P3 Ignite | **Ash Seed:** after consumption, apply a fresh 0.2 U Burn for 1 tick. | **Gather Ash:** gain 1 Ember after consumption. |
| P4 Searing Eye | **Patient Flame:** empower only 1 action, but extend Burn by 1 on cast, within its cap. | **Piercing Gaze:** eligible critical hits ignore 20% fire resistance, never immunity. |
| P5 Wildfire | **Hungry Fire:** growth is 0.2 U instead of 0.15 U; the same ceiling applies. | **Cinder Veil:** the first grown tick applies Weaken for 1 foe opportunity. |
| P6 Lantern Flare | **Revealing Light:** a Burning target also gets Sunder for 2 foe opportunities. | **Guiding Light:** gain 1 Ember instead of applying Mark. |
| P7 Ember Heart (passive) | **Kindling Pulse:** the first Burn tick on each foe grants 2 Embers instead of 1, still under the 5-Ember cap. | **Warmth Within:** the first time each fight a Burn tick grants Ember, heal 5% of maximum HP; once per fight. |
| P8 Lanternburst | **Afterglow:** apply a fresh 0.2 U Burn for 2 ticks after the burst. | **Homeward Light:** gain Ward equal to 10% of maximum HP after the burst. |

### Universal Attack, Parry, and Dodge forks

Each row also costs 2 star points. Choose one option for each hero action.

| Hero | Action | Choice A | Choice B |
|---|---|---|---|
| Wren | Attack | The first Attack gains 2 Aim instead of 1. | Attacking a Marked foe adds 1 Bleed stack. |
| Wren | Parry | The first completed full-move counter each fight applies Mark for 2 foe opportunities. | Each completed full-move counter grants 1 Aim. |
| Wren | Dodge | The next Attack after a successful Dodge gains 1 Aim. | The next Attack after a successful Dodge applies Pinned. |
| Tobin | Attack | Attacking a Sundered foe grants 2 Grit instead of 1. | The first Attack grants Ward equal to 5% of maximum HP. |
| Tobin | Parry | The first completed full-move counter each fight applies Sunder for 2 foe opportunities. | The first completed full-move counter grants Guard for 1 foe opportunity. |
| Tobin | Dodge | The next Attack after a successful Dodge grants 2 Grit. | The next Attack after a successful Dodge grants Guard for 1 foe opportunity. |
| Pip | Attack | Attacking a Burning foe grants 2 Embers instead of 1. | The first Attack applies 1 Chill. |
| Pip | Parry | The first completed full-move counter each fight grants 1 Ember. | The first completed full-move counter applies Weaken for 1 foe opportunity. |
| Pip | Dodge | The next Attack after a successful Dodge extends Burn by 1, within its cap. | The next Attack after a successful Dodge grants Ward equal to 5% of maximum HP. |

Attack forks resolve once per Attack action unless a row explicitly says otherwise. Parry forks that refer to a counter trigger once only after the full enemy attack is parried. Independently, every successful parried hit, including each hit of a multi-hit attack, reduces every active cooldown by one; the completed counter adds no second refund. Dodge forks resolve on the next matching Attack after a successful Dodge; the token lasts through that hero action. Shadow Step guarantees the next chosen Dodge within its duration; that is still one chosen reaction and not an extra action.

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
| II | A2 Barbed Arrow, A4 Hunter's Mark, W2 Bat Swarm, W3 Deadeye. | M2 Cleave, M4 Momentum (passive), T2 Riposte, T3 Iron Will. | C2 Frost Shard, C3 Arcane Ward, P2 Kindle, P3 Ignite. |
| III | A3 Pinning Shot, A6 Twin Shot (passive), W4 Sonic Arrow, W5 Shadow Step. | M3 Sunder, M5 Brace, T4 Taunting Roar, T5 Hammerfall. | C4 Hex, C5 Afterglow (passive), P4 Searing Eye, P5 Wildfire. |
| IV | A5 Volley, W6 Moonlit Volley, W7 Night Hunter (passive). | M6 Lunge, T6 Shield Throw, T7 Bulwark (passive). | C6 Nova, P6 Lantern Flare, P7 Ember Heart (passive). |
| V | W8 Final Echo. | T8 Last Stand. | P8 Lanternburst. |

Proposed relic names are account inventory items. Redeeming one consumes it and records an unlock for the selected hero and ability. The tier relic drop rates are proposed: one guaranteed on an eligible first clear, then a 20% chance with a five-clear dry-streak pity rule. Pity is tracked per relic category, is account-wide, and resets when that relic drops. At Tier V, the first Proving gives a guaranteed Mother Spark; repeat eligible clears use the proposed 20% / five-clear pity rule. Validate rates and repeat availability before implementation.

Tier gates open eligibility but never unlock an ability by level alone. Chapel copy should identify the exact source boss and item. Later-region boss relics may substitute downward so a returning player does not have to grind an early boss; the chapel exchange rule remains a separate design decision. These 42 abilities are the complete base-hero set. A subclass replaces its hero's eight signature abilities while retaining the six shared-pool abilities; the base signature set remains part of the non-subclass roster.

## 12. Speed timeline and own-action clocks

Use the refined timeline in §2a of hero-abilities.md for all sample builds here. Both gauges start at zero for a fresh foe and reach readiness at 100. Fill at effective Speed; advance simulation time to the earliest ready actor, resolve that actor's opportunity, and reset only that actor's gauge. The hero wins exact ties, while another ready actor keeps its full gauge. Use the same event scheduler for turn order and the next-six-opportunity preview. Timing input, animation time, and interface delay do not fill gauges. Temporary Speed changes affect future gauge fill only, take effect after the current move, clamp to 50–200% of base, and apply at half strength against bosses.

Neither side may resolve more than two consecutive opportunities against ordinary foes or three against a boss. After reaching that limit, it waits at gauge 100 until the opponent resolves one opportunity. A skipped opportunity counts toward the sequence limit. This is a cap on consecutive actions, not an extra action or a change to cooldown math.

Each clock follows its owner. Cooldowns, offensive buff expiry, Momentum, Afterglow, and the H3 finisher gate count hero opportunities; DoT and enemy-status duration count foe opportunities. An effect applied during its owner's opportunity first ages at that owner's next opportunity. A foe's skipped opportunity still resolves foe-start DoT, expires foe-clock effects, and counts normally. A multi-hit move is one opportunity; its individual hits, timing prompts, parry reactions, and counter do not advance either gauge or clock. Finishers open at the hero's third opportunity, regardless of how many foe opportunities interleave. Counters and cooldown refunds never create another hero opportunity.

A completed enemy attack yields at most one full counter move, and only when every hit was parried. A dodge or failed parry on any hit prevents that counter; already earned per-hit cooldown and Grit effects remain. Bulwark's ×1.25 counter bonus applies once to the full move, not once per hit. Last Stand's ×2 applies once to that same move, so when both are active their proposed multipliers stack (×2.5 total); this is a balance point to measure. There is no extra cooldown refund at the end of the move.

## 13. Three-slot builds

Each loadout below uses exactly three equipped abilities. Sequence numbers count the hero's action opportunities. Foe opportunities and damage-over-time ticks may interleave according to Speed as defined in §2a of hero-abilities.md; a sequence number does not promise one foe action between hero actions.

| Build | Three equipped slots | Sequence and trade-off |
|---|---|---|
| Wren: precision | Echo Shot, Deadeye, Twin Shot (passive) | H1: Echo Shot applies Mark. H2: Deadeye still sees Mark and consumes it on a sure crit. Twin Shot then makes each Attack a two-arrow action, with independent crits and once-per-action Aim. |
| Wren: bleeding finish | Hunter's Mark, Moonlit Volley, Final Echo | H1: Mark. H2: Moonlit Volley adds up to 5 Bleed stacks while Mark remains. Bleed ticks between actions. H3: Final Echo consumes the surviving Bleed and Aim. This build saves its finisher for a longer fight. |
| Wren: night hunt | Echo Shot, Sonic Arrow, Night Hunter (passive) | Mark the foe, then use Sonic Arrow while Mark is still present. Night Hunter adds one Aim on each Attack action against a Marked foe, once per action even with multiple arrows. This trades Shadow Step's safety for a persistent Aim engine. |
| Tobin: early breaker | Shield Bash, Heavy Strike, Momentum (passive) | H1: Shield Bash attempts Stun and leaves Exposed. The foe may skip its next opportunity, but Exposed survives through H2. H2: Heavy Strike consumes Exposed for 1.25x. Subsequent Attack actions build Momentum; an ability resets the chain. Against a boss, Exposed still supports the payoff if control only adds Stagger. |
| Tobin: stored strength | Iron Will, Shield Bash, Hammerfall | H1: Iron Will gives 3 Grit. H2: Shield Bash attempts Stun and leaves Exposed. H3: Hammerfall requires 2 Grit, consumes Grit and Exposed, and delivers the payoff. A parry can add Grit but is not required. |
| Tobin: counter knight | Brace, Riposte, Bulwark (passive) | H1: Brace guards and widens the next parry window. Any successful parry hit lights Riposte and reduces every cooldown; Bulwark grants its extra Grit per parried hit. Only an attack with every hit parried also produces one full counter. H2: Riposte uses its one-action token. Bulwark has no cast or H3 action. |
| Pip: detonation | Fireball, Ignite, Afterglow (passive) | H1: Fireball applies Burn. H2: use Attack to consume Afterglow's +50% fire bonus; Burn ticks once per foe opportunity. H3: Ignite spends remaining Burn and deals its stored portion, which cannot crit. This trades Kindle's Ember build-up for a boosted attack between spells. |
| Pip: sustained flame | Fireball, Wildfire, Ember Heart (passive) | H1: Fireball applies Burn. H2: Wildfire refreshes and grows it. Each Burn tick gives Ember once per foe opportunity; use later Attacks or Fireball to continue the cycle. The payoff needs a longer fight. |
| Pip: lantern finish | Kindle, Ember Heart (passive), Lanternburst | Choose Kindle's Careful Tending fork. H1: Kindle gains 2 Embers and applies a light Burn to a fresh foe. H2: Attack gains the third Ember; a foe Burn tick may add another through Ember Heart. H3: Lanternburst is open and meets its 3-Ember requirement; it spends the Embers and remaining Burn. If Speed grants consecutive hero actions before the foe acts, the Attack still supplies the third Ember. |
| Pip: frost and flame | Frost Shard, Cold Spark branch of Spark, Fireball | H1: Frost Shard applies 2 Chill. H2: Cold Spark adds the third Chill, attempts Freeze, and leaves Exposed. H3: Fireball consumes Exposed for 1.25x. Without the Cold Spark fork, repeated Frost Shards can reach the setup before Chill expires. |

Cooldowns, hero resources, statuses, and opening counters reset when each new foe begins. This reset does not grant healing; normal kill/heal rules remain separate. Finishers open at H3, the third hero action opportunity. Last Stand is once per fight. Because cooldowns reset between foes, cooldown length chiefly spaces actions inside a longer fight; short trash fights may end before a setup/payoff chain or finisher. The listed builds are most useful against elites and bosses unless trash health and action count are tuned to support them.

Choose abilities manually from the three equipped slots. The interface should show cooldown, resource cost, status eligibility, remaining finisher gate, and timing prompt before commitment. Passives have no button and do not replace a manual action. These examples are design sequences, not runtime claims.
