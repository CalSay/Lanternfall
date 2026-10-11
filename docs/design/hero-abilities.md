# Hero ability trees: Wren, Tobin and Pip (C19 draft)

Status: **built** in the C29 turn fight (2 October 2026; [combat-turn-build.md](combat-turn-build.md)). This was Codex's C19 design, 1 October 2026, with the owner's later decisions in §2a. The game's data (`24c-data-abilities.js`, `24e-data-talents.js`) is the truth where it differs; the build page says what it picked. Mentions of Auto, relics and the chapel below are void: combat is active only, and Scrolls replaced relics.
It replaces the earlier "about 10 abilities" sketch with the owner's new count.

## 1. The brief

- **Owner (2026-10-01):** each hero has **6 shared + 8 signature = 14 abilities**. "Lots of abilities, but it's what
  makes unlocking a new character feel worth it."
- **The 6 shared** come from a pool per play style (archer, melee, caster), the same six for every hero of that style,
  each flavoured to the hero (name stays, colour and art change). The **8 signature** abilities are the hero's own.
- **Style:** turn combat in the spirit of Expedition 33. One ability sets something up and another pays it off. For
  example, Fireball burns a foe for three turns and Searing Eye crits on burning foes.
- **Kinds:** damage, buffs on the hero, debuffs on the foe.
- **In reach of the engine:** everything below uses the turn engine's pieces: cooldowns in turns, one action per hero
  turn, statuses that count turns, a timed parry and dodge, and three small per-hero resources (Aim is a rework). New mechanics are flagged
  in section 8 (including changes to existing mechanics).
- **Art:** each ability names the **pose family** it plays, so Codex can plan every pose at once (the linked art brief).

## 2a. Owner decisions after the C19 draft (binding; 1 October 2026)

These came in after checkpoint `57ed6ad` and override anything below that disagrees. **Latest direct owner decision: combat is active-only. There is no Auto or idle/offline fighting.** This supersedes earlier automatic farming and Good-by-default timing requirements; non-combat gathering is outside this change.

1. **Defence is one choice per hit of an enemy move.** On every hit the player picks one: parry (harder; blocks,
   counters, refunds) or dodge (easier; only avoids). No ability makes the choice, no enemy attack is parry-only or
   dodge-only; abilities may only make an option easier or more rewarding.
   **Multi-hit attacks (owner, 2026-10-01):** an enemy attack can be several hits, and an enemy can attack more than
   once in a turn cycle. Each hit is its own parry-or-dodge choice. **Every successful parry takes 1 turn off every
   ability cooldown** (per hit, not per attack). **The counter only comes if every hit of that attack was parried.**
   The rules in §2 below incorporate this per-hit refund.
2. **Speed sets turn frequency (Expedition 33 style), not only who opens.** Proposed timeline, for Codex/Claude to refine:
   each actor has a gauge that fills at its Speed; it acts at 100, then the gauge resets; ties go to the hero. Equal Speed
   alternates as today; +33% Speed gives about 4 actions for every 3. Speed changes are capped at 50%-200% of base;
   bosses take hostile Speed reductions at half strength. Stun and Freeze empty the foe's gauge (bosses: Stagger instead).
   Cooldowns, statuses and finisher openings still count the owner's own actions. The UI shows the next few turns as a
   strip. A Speed gear line is wanted.
3. **Passives.** A passive takes an ability slot, has no button and is always on. One per shared pool and one per
   signature set: A6 Twin Shot, M4 Momentum, C5 Afterglow, W7 Night Hunter, T7 Bulwark, P7 Ember Heart (rows below). They
   need no pose; the art brief's poses for the replaced actives drop unless another ability reuses them. A Hallowed
   passive gets stronger numbers only. Equipped passives apply to player-selected actions and reactions; they never select attacks for the player.
4. **Timed abilities** (timing checks like Expedition 33): press again as a ring closes. Perfect (~0.12 s) adds a
   bonus; Good (~0.3 s) is the ability as written; Miss is ×0.7 power, no bonus. Multi-hit abilities check each hit.
   Every timed move is resolved from active player input. Only on the hero's own turn. Draft list (4 per hero) with Perfect bonuses:
   Wren A1 Power Shot (sure crit), A5 Volley (per arrow, +1 Aim), W3 Deadeye (Mark stays), W6 Moonlit Volley (per arrow,
   +1 Bleed even unmarked); Tobin M1 Heavy Strike (+50%), T1 Shield Bash (Guard 1 more), T5 Hammerfall (keeps half the
   Grit), T6 Shield Throw (catch it: cooldown -2); Pip C2 Frost Shard (+1 Chill), P1 Fireball (Burn 1 more turn),
   P3 Ignite (stored Burn ×2 instead of the current draft’s ×1.25), P8 Lanternburst (keeps 2 Embers). Art: a wind-up hold and a release frame matched to the ring.
5. **Subclasses replace the signature set** ("it's like a new class"). Ascending into a subclass brings its own 8
   signature abilities; the 6 shared stay. These 42 are the base-hero set; subclass sets (C21) reuse pose families where
   they fit.
6. **Equip 3 for now.** A 4th slot comes with a bag button (a turn to drink a potion or eat food), later.
7. **Aim** is Wren's resource. **Base crit ×2.5** (live since `17b1b7e`).
8. **Combat is active only.** No Auto or idle fighting; every fight is played by hand. Rules below that mention Auto
   (Auto's chooser, Auto parry, "Auto counts as Good", Auto damage factors) are void and drop out of the engine work.

### Refined timeline proposal (design; not runtime)

- Gauge threshold 100. At a fresh foe both gauges start at zero. Rate is effective Speed; reference Speed 10 is a design unit, not a replacement for the live stat scale. Use positive gear/Training-adjusted base Speed, then clamp temporary modifiers to 50–200% of that base. Slow magnitudes are halved against bosses before the clamp. Chill’s -1 per stack refers to this reference scale; map proportionally when runtime calibration changes it.
- Advance simulation time directly by the smallest nonnegative `(100 - gauge) / rate` among eligible actors. Fill both gauges by rate × elapsed time, capped at 100. Only the selected actor spends its gauge (reset to zero). Hero wins exact ties; the other ready actor keeps its 100 gauge. Input, animation and timing-ring wall time never fill gauges.
- No ordinary actor or hero may resolve more than two consecutive opportunities; a boss may resolve three. After the limit, that actor is ineligible until the opponent resolves one opportunity. It waits at most at gauge 100; advance to the opponent’s readiness, do not discard its progress or grant a free instant turn. A skipped opportunity counts toward the sequence limit. This bounds extreme ratios rather than promising an unlimited Speed advantage.
- Speed changes affect future fill only, never rescale existing progress. Buffs/debuffs applied during a move take effect after the move completes; a multi-hit move cannot be interrupted by a newly ready turn. Preview the next six opportunities using the same scheduler, recalculating after effects. Unknown future choices must not be displayed as guarantees.
- Ordinary Stun/Freeze clears current gauge and marks one skip at the next ready opportunity. At that opportunity, resolve DoT, skip the move, expire foe-clock effects and count the opportunity normally. Shared control lock starts immediately on acceptance and lasts three subsequent foe opportunities, with the pending skip counting as the first; rejected control does not clear gauge. This intentionally supplies both immediate delay and a lost action; balance must test its combined value.
- Boss Stun/Freeze contributes 25/35 stagger instead. At 100 stagger clear the meter and gauge, mark one skip and start the same three-opportunity lock. During a signalled charge, a non-locked Stun/Freeze contribution also interrupts the charge without requiring a full bar. Charge damage thresholds use actual HP damage and are authored per boss; interruption cancels the release, never awards a second skip unless stagger actually reached 100. A charged release is ineligible until at least one hero opportunity has resolved since charge start, even when the boss has consecutive turns. If it would be selected earlier, hold that boss opportunity and schedule the hero; do not consume a fake turn, age statuses, loop on a ready boss, or use a new damaging move to punish the guaranteed response opportunity.
- Cooldowns, offensive buff expiry and finisher gates count hero opportunities. DoT and enemy status duration count foe opportunities. A 4-turn cooldown remains four hero opportunities, even if the foe is faster. Effects applied during an actor’s own opportunity first age on that actor’s next opportunity. Counterattacks, timing presses and individual hits are never opportunities.

### Timed ability contract (12 active abilities)

Keep the owner’s four-per-hero selection. Suggested full window widths are Perfect 0.12 s (±0.06), Good 0.30 s (±0.15, including Perfect); outside Good is Miss. Use one accepted press per advertised prompt. A missing/early press resolves Miss once, never repeats the move. No automatic Good result or offline timing simulation is permitted. Windows and an assisted timing option need playtesting/accessibility review; do not make speed or display frame rate shrink the input window.

Miss multiplies that timed hit’s direct damage, including a stored-damage component on Ignite, by 0.7. It removes only the Perfect bonus: baseline status riders, eligibility, resource spending and cooldown still resolve. It cannot turn a cost into a refund. Each arrow of Volley/Moonlit Volley has its own prompt, crit and grade; all other listed base moves have one. A branch that creates multiple hits, such as Scattered Cinders, creates one prompt per hit. Its Fireball Burn extension applies once if any hit is Perfect; Burn and Ember spending still resolve once per cast. Shield Throw’s single grade is judged at the catch, with its hit value held until that grade resolves; no second hidden release check. Death cancels remaining prompts.

| Ability | Perfect bonus; Good uses the base table |
|---|---|
| A1 Power Shot | Guaranteed crit once; normal crit Aim rider once. |
| A5 Volley | +1 Aim per Perfect arrow, awarded after all hits; cap 3. |
| W3 Deadeye | If Mark existed before the cast, preserve it instead of consuming it; no free Mark on an unmarked target. |
| W6 Moonlit Volley | +1 Bleed per Perfect arrow, even unmarked; on a marked target this adds to its ordinary rider, under the cap 5. |
| M1 Heavy Strike | ×1.5 direct damage; Exposed and crit remain separate, once each. |
| T1 Shield Bash | Guard lasts 3 foe opportunities instead of 2. |
| T5 Hammerfall | Refund floor(spent Grit / 2) after damage; compute damage from the original spend once. |
| T6 Shield Throw | Its assigned cooldown is reduced by 2 once, minimum 1; catch grade applies after Focus/Hallowed calculation. |
| C2 Frost Shard | +1 Chill; therefore attempts Freeze immediately from zero Chill. |
| P1 Fireball | Applied Burn lasts 4 ticks instead of 3, under the existing cap. |
| P3 Ignite | Stored Burn coefficient 2.0 instead of 1.25; direct 0.8 U unchanged. The earlier note saying 1.5 was stale. |
| P8 Lanternburst | Refund 2 Embers after resolving the original spend; no double resource multiplier. |

Perfect power, crit, Exposed, Mark and Hallowed can multiply substantially; these are not all approved balance values. Keep base critical damage at the owner’s 2.5× and measure these combined payoffs in step 3 rather than silently reducing the owner’s timing rewards.

## 2. Rules every ability follows

One active ability replaces Attack for one hero action, including a pure buff. A passive occupies a slot but spends no action and has no cooldown or button. Equip three; Attack, Parry and Dodge remain outside those slots. No extra action points, cross-hero combos, persistent summoned actors or positional combat are required. Loadouts change between fights only.

A cooldown of 4 cast on hero action H1 is ready on H5: assign it after resolution, subtract 1 at subsequent hero-turn starts. Proposed Focus rule: `max(2, ceil(baseCD * (1 - min(Focus,30)/100)))` for abilities; Attack stays 1. Do not apply legacy seconds-based Training reductions as well. Every successful player-parried hit, immediately reduces every active ability’s remaining cooldown by 1, floored at zero. There is no second move-end refund. A completed all-parry move grants one guaranteed-critical counter after its last hit; any dodge, miss or failed parry prevents that counter. Successful individual parries keep their refunds even if the sequence later fails. No reduction grants an extra action.

Each new foe (including each gauntlet member) resets cooldowns, hero resources, statuses and opening counters. HP follows existing heal/death rules; reset does not heal. Finishers open on the third **hero** action opportunity, not engine `m.n` (which counts both actors); refunds and waiting cannot open them early. Last Stand is additionally once per fight.

The tables' power unit **U is each ability's independently trained power**, using `trainAbPow(id)` and ability gear with a hero calibration constant. Attack keeps its own Training curve. Table figures are provisional comparisons at equal ability training, not raw multiples of whatever Attack upgrades the player bought. Calibration must preserve starter pacing before these coefficients become runtime data.

**Owner: base critical multiplier is 2.5×.** Direct hits can crit; DoT and already-stored damage cannot. Guaranteed crit replaces the random roll and does not multiply another crit. Suggested crit-damage gear/stars add percentage points to 2.5, with total capped 3.0 pending owner/Claude review; existing gear effects need an audit before changing their mapping. Ordinary crit chance keeps the current cap 75%; guaranteed crit can exceed that chance cap. Keen adds 0.5 to the multiplier for one cast, respecting the same proposed cap.

Active-only damage proposal: use one ability multiplier of 1.0 and Attack’s ordinary trained power; remove the obsolete Auto Attack factor from this design. Do not carry the legacy 2.5× manual spell multiplier on top unnoticed. Timing, reactions and choices provide skill expression. This normalization needs Claude’s balance sign-off and measured active fight lengths/reward rates, not an idle farming comparison.

The player chooses every hero action; equipped passives, cooldown readiness and waiting never fire one. Combat has no unattended repeat loop and earns no offline kills, gold, Essence or combat progress. Proposed pause contract: losing focus or leaving combat pauses the timeline and pending input window with no elapsed-time advancement or reward; resume the same pending action without rerolling outcomes or replaying paid effects. Reload/abandon cancels the encounter under existing persistence rules and grants no completion reward. Claude must settle combat save ownership before implementation. Enemy moves still resolve as part of an actively played encounter; this does not turn the game into a player-only damage simulator.

## 3. Status and resource contract

Foe DoT ticks at foe-turn start, including skipped turns; death cancels the rest of that turn. Ember Heart may resolve its tick gain before cleanup, but all hero resources reset on death of the foe, so no gain carries forward. Non-DoT foe statuses expire at foe-turn end. Hero offensive buffs count subsequent hero actions, excluding their casting action. Defensive effects count subsequent foe opportunities, including skips. Reapplication refreshes duration and keeps the stronger magnitude, never stacks multipliers. Multi-hit casts stop on death and cannot carry unused hits into a fresh fight.

| Status | Exact proposal |
|---|---|
| Burn |0.4 U fire per foe start,3 ticks; strongest snapshot retained, max 4 remaining ticks. Snapshot caster power/Status Power; apply target mitigation and vulnerability once when a tick lands.|
| Bleed |0.12 U physical per stack per foe start, max 5 stacks,3 ticks; common refreshed timer and strongest snapshot. Ignores armour, not physical resistance.|
| Chill |4 foe turns, refreshed on application, max 3. Frost Shard applies 2. At 3 clear Chill and attempt Freeze. Owner (Speed timeline, §2a): each Chill also -1 Speed while it lasts.|
| Stun / Freeze |Empty the ordinary foe gauge immediately and skip its next ready opportunity; start shared control lock immediately for the next 3 foe opportunities including that skip. Bosses instead gain proposed 25/35 stagger toward 100; reaching 100 skips one opportunity and clears the meter. This is NEW turn-engine work.|
| Exposed |A successful setup-control application, including a boss stagger contribution, leaves a token through the next hero action. Named payoffs consume it for 1.25×. It survives the skipped foe turn. A control application rejected by the lock still produces Exposed but cannot skip again.|
| Mark |+20% damage taken,3 foe turns unless specified. Existing-Mark conditions snapshot before the cast applies/refreshes its own Mark. Consumption occurs after the eligible hit.|
| Sunder |Halves physical armour reduction for 3 foe turns, not elemental resistance or HP.|
| Weaken |25% less outgoing direct damage for 2 foe opportunities; strongest only.|
| Pinned |Next enemy move’s parry and dodge windows 50% wider on every hit (owner: abilities never steer the parry-or-dodge choice), consumed after that move. Also slows Speed 10% for 2 foe opportunities (5% on bosses). Does not stack with Brace's window bonus; proposed final full-width caps: parry 0.35 seconds, dodge 0.50 seconds. Leaves a one-hero-action opening token for Sonic Arrow when consumed, so that combo can actually work.|
| Blind |30% miss for 2 foe opportunities,15% on bosses. Resolve chosen parry/dodge before rolling miss for an otherwise landing attack; misses earn no parry reward.|
| Guard |40% direct damage reduction for 2 foe opportunities unless specified. Combined reduction capped 75% before Ward.|
| Ward |Temporary shield for 3 foe opportunities; damage is mitigated before shield then HP. Keep greater remaining shield, never add shields; cap 30% max HP.|
| Keen |Next direct cast gets+0.5 crit multiplier under the proposed cap, consumed once for the whole cast even with no crit. DoT/counters do not consume it.|
| Curse |Hex stores 20% of actual HP damage for 3 foe opportunities, cap 3 U of Hex power. Clear Curse before burst. Burst is already-scaled damage: no new crit/Mark/mitigation. Exclude reflected damage and Curse bursts from storage. On death clear without a duplicate kill.|

Unused Venom is deferred rather than introducing a status no listed skill applies. Wildfire has one growth effect, at most 3 growth ticks and a raw tick ceiling 0.8 U. Kindle extends only remaining duration, capped 4. Ignite forecasts remaining raw ticks using current target mitigation/vulnerability once, consumes Burn, and never re-crits/re-amplifies the derived portion.

- **Aim (Wren), new:**0–3; each adds 5 percentage points crit chance. Attack grants 1 after resolving. Replaces the prototype's temporary focus effect; it is not already the runtime behavior.
- **Grit (Tobin):**0–10; Attack grants 1 per Attack action; every successful parried hit grants 1. Each gives+3% Attack-button damage and 1% damage reduction. Explicit Grit-spender coefficients do not receive a second Grit multiplier.
- **Embers (Pip):**0–5; Attack grants 1. Only skills explicitly saying they spend Embers do so; Fireball gains 10% per spent Ember, Lanternburst uses its own coefficient instead.

Shared skills' resource riders are class hooks; future heroes need not inherit Wren's Aim or Pip's exact Ember system.

### Resolution order and exact interaction rules

1. Validate eligibility and snapshot all pre-cast conditions/resources, including Aim for that cast's crit chance.
2. Resolve direct hits in order. Echo Shot's follow-up is a separate **0.6 U** hit, not 60% of an already-critical primary hit. A new Mark never boosts the originating hit.
3. Apply new riders, then consume the specifically snapshotted resources/statuses. A cast that both consumes and reapplies the same status must explicitly apply the replacement after consumption (e.g. Ash Seed). The replacement cannot be consumed as the old status.
4. Assign cooldown and spend the action, even if the action dealt no damage. Stop attack sequences at death and end the fight once.

Generic resource, equipment and star procs occur once per cast, unless explicitly labelled per hit. Twin Shot’s Attack on-hit effects and the named Volley/Moonlit Volley Perfect riders are explicit per-hit exceptions. Resource gains are applied after the cast, capped normally, and cannot feed later hits in that cast. Moonlit Volley cannot exceed five Bleed stacks. Multi-hit crits are independent.

Momentum counts consecutive Attack actions, not arrows: the first gets +10%, rising to +50% on the fifth; any active ability resets the chain. Defence and counters do not build or break it. Afterglow snapshots the last direct spell’s damage type and boosts the next Attack action by 50%, expiring after two subsequent hero opportunities; its casting action does not age it. A multi-hit Attack shares that bonus across its hits. Pure buffs, DoT and counters do not arm it. Neither passive creates another action.

Twin Shot replaces one Attack with two 0.55 Attack-power arrows, each with a crit roll and explicit Attack on-hit effects. Attack’s normal Aim and Night Hunter’s additional Aim each occur once per Attack action, not once per arrow. Searing Eye includes Pip’s Attack and direct spell components on a currently burning target, excluding counters and stored damage. Bulwark adds one Grit per successful parried hit and multiplies only the completed-move counter by 1.25. Passives never start a new player action on their own.

A Burn snapshot stores its original applier and pre-target-mitigation damage. Wildfire adds 0.15 of Wildfire's own trained U and its Status Power to that snapshot per growth tick, capped at 0.8 of that same Wildfire value. A weaker Wildfire never lowers an already stronger Burn: retain the original stronger snapshot with no growth until the cap would exceed it. Recasting refreshes one growth timer; it cannot stack growth rates. Ignite uses the current tick value times remaining ticks, not speculative future Wildfire growth. Apply current target mitigation/vulnerability once to that forecast, then consume Burn and growth together.

Victory, retreat, abandonment, death and reload cancel temporary states; cancellation does not grant expiry heals or Ward rewards. Last Stand's ending heal happens only at natural expiry while alive and still in the fight. Its once-per-fight flag cannot be reset by recasting or refunds.

The player chooses whether to refresh or detonate Burn. Show remaining ticks and preview the expected spend; never silently disable Fireball merely because Ignite or Lanternburst could be used. Ability buttons are disabled only by actual cooldown, opening gate or required condition/resource. A ready passive cannot block selection of an active ability.

## 4. Stats and progression layers

| Layer | Role |
|---|---|
| Gold Training |Attack, individual scalable ability power, Counter; retain hero-level and 40/80 stage caps pending pacing review. Never sell an upgrade that has no turn-mode effect. Pure control-only skills need no empty Training ranks.|
| Haste, gold stat tree |**Owner (2026-10-01): Speed sets turn frequency (§2a), not only the opener;** a Speed gear line is wanted. Retain the name Haste in code. Proposed+1/rank, max `min(12,floor(heroLevel/5))` ranks, cost `ceil(20*1.35^currentRank)`. Validate against actual enemy Haste before accepting numbers. Add the requested Speed gear line; price/rank values remain provisional and must be calibrated against base Speed.|
| Focus, gear |Cooldown reduction with cap/rounding above. Separate from Aim.|
| HP / Armour / Pierce / damage types |Use existing gear and hero rules. Do not change Pip's HP multiplier merely because she is a caster. Armour applies to physical hits; resistance to the appropriate type.|
| Status Power |Use the existing status-power path once for DoT. Do not silently rename/reuse Control, which currently affects control duration. Ward scales with max HP, not Status Power.|
| Stars |Mutually exclusive behavior branches, ability-tree-details.md; no repeatable numeric ranks.|
| Boss relics at chapel |New abilities, not Training or stars; exact routes in ability-tree-details.md.|
| Hero quest / Proving |Hallowed / Ascension remain distinct.|

Suggested new numeric Training milestones: every 5 ability ranks adds 2 percentage points to direct/DoT power, capped 20%; a pure Ward/heal move adds 1 percentage point shield/heal per 5 ranks, capped 5 and never overriding shield caps. No extra targets, turn-duration increases or cooldown reductions from gold. Remove or replace the old turn-mode Dodge cooldown purchase explicitly. These milestone changes are proposals, not live changes.

## 5. The shared pools (6 each)

Every future archer, melee or caster hero shares these six. The pose column is the pose family (the linked art brief).

### Archer pool (Wren)

| # | Ability | Kind | Power | Cooldown | Effect | Combo | Pose |
|---|---|---|---|---|---|---|---|
| A1 | **Power Shot** | damage | 1.8 | 3 | A heavy arrow. | +1 Aim if it crits | draw-release |
| A2 | **Barbed Arrow** | damage + debuff | 0.9 | 3 | 2 Bleed. | feeds Bleed payoffs | draw-release |
| A3 | **Pinning Shot** | debuff | 1.0 | 4 | Pinned; its opening token survives until the next hero action. | sets up a counter | kneel-shot |
| A4 | **Hunter's Mark** | debuff | 0.6 | 4 | Mark for 4 turns. | feeds every Mark payoff | point |
| A5 | **Volley** | damage | 3 x 0.7 | 4 | Three arrows, each rolls crit; generic resource/gear procs are once per cast. | multiple independent crit rolls | sky-draw |
| A6 | **Twin Shot** | passive | 2 × 0.55 | — | Attack fires two arrows using Attack Training; each rolls its own crit and explicit Attack on-hit effects; normal Aim and Night Hunter proc once per action. | two hits; resource gains remain action-based | none (Attack) |

### Melee pool (Tobin)

| # | Ability | Kind | Power | Cooldown | Effect | Combo | Pose |
|---|---|---|---|---|---|---|---|
| M1 | **Heavy Strike** | damage | 2.0 | 3 | A heavy one-handed warblade blow, shield retained. | ×1.25 and consume Exposed | overhead |
| M2 | **Cleave** | damage + debuff | 1.4 | 3 | A wide swing on the current foe, plus 1 Bleed. No extra targets in turn mode. | | wide-swing |
| M3 | **Sunder** | debuff | 1.0 | 4 | Sunder 3 turns. | feeds Sunder payoffs | overhead |
| M4 | **Momentum** | passive | — | — | Each consecutive Attack deals +10% more, up to +50%. Any ability resets it. Direct hits only. | rewards Attack chains between abilities | none |
| M5 | **Brace** | buff | — | 4 | Guard 2 turns; the next parry window is 50% wider. | sets up a parry | block |
| M6 | **Lunge** | damage + buff | 1.2 | 3 | Lunge in; +20% Speed for 2 subsequent hero opportunities. | | lunge |

### Caster pool (Pip)

| # | Ability | Kind | Power | Cooldown | Effect | Combo | Pose |
|---|---|---|---|---|---|---|---|
| C1 | **Spark** | damage | 1.3 fire | 2 | A quick bolt. | +1 Ember | small-cast |
| C2 | **Frost Shard** | damage + debuff | 1.1 frost | 3 | 2 Chill lasting 4 turns (3 Chill attempts Freeze). | fire consumes Exposed for ×1.25 (Thaw) | small-cast |
| C3 | **Arcane Ward** | buff | — | 5 | Ward 20% max HP. | | lantern-raise |
| C4 | **Hex** | debuff | — | 5 | Curse 3 turns: it stores 20% of the damage it takes and bursts for that when it ends. | rewards a big turn | point |
| C5 | **Afterglow** | passive | — | — | After a direct spell, the next Attack within 2 hero actions deals +50% and takes that spell's damage type. | weaves Attacks between spells | none |
| C6 | **Nova** | damage | 1.6 | 4 | A ring of force; 1.6 U on the current foe. No fictional extra target value in turn mode. | | burst |

## 6. Signature abilities (8 each)

Tier: when it can be unlocked (the linked unlock map). F = finisher.

### 6.1 Wren, the Ranger: Mark and crit, with bats and echoes

Her loop: **Mark the foe, build Aim, then cash it in.** Bleed is her second payoff.

| # | Ability | Tier | Kind | Power | Cooldown | Effect | Combo | Pose |
|---|---|---|---|---|---|---|---|---|
| W1 | **Echo Shot** (today's) | 1 | damage + debuff | 1.8 | 5 | Piercing visual on the current foe. Mark 3 turns. | on a foe already Marked, it echoes: a second hit x 0.6 | draw-release + sound waves |
| W2 | **Bat Swarm** | 2 | debuff | 0.3 a turn | 5 | Her bats harry the foe for 3 turns: 0.3 damage each foe turn and Blind. | Blind lowers its hit chance; pairs with dodging | whistle |
| W3 | **Deadeye** | 2 | damage | 1.8 | 5 | A sure crit on a Marked foe. Consumes Mark after the hit; unmarked hits roll normally. | the main Mark payoff | long-draw |
| W4 | **Sonic Arrow** | 3 | damage + debuff | 1.0 | 5 | Attempts Stun on a Marked foe or a foe with Pinned/opening token; spends Pinned/token first, otherwise Mark. | Pinning Shot or Mark, then this | draw-release + sound waves |
| W5 | **Shadow Step** | 3 | buff | — | 4 | For 2 foe opportunities, her next chosen Dodge on one hit cannot fail; that successful Dodge grants Keen. It never chooses a reaction or avoids a whole combo automatically. | dodge into Deadeye | backstep |
| W6 | **Moonlit Volley** | 4 | damage | 5 x 0.5 | 6 | Arrows fall from above. On a Marked foe each hit adds 1 Bleed. | Mark, then this, then Final Echo | sky-draw |
| W7 | **Night Hunter** | 4 | passive | — | — | Every Attack on a Marked foe gives +1 additional Aim. | one extra Aim per Attack, even with Twin Shot | none |
| W8 | **Final Echo** (F) | 5 | finisher | 1.5 + 0.5 per Bleed + 0.5 per Aim | 7, opens turn 3 | Requires at least 1 Bleed or Aim. Spends all Bleed and Aim. No on-kill refund: the next fight already resets cooldowns. | the end of her loop | long-draw + sound waves |

### 6.2 Tobin, the Warden: parry, Grit, stun

His loop: **Brace and parry, build Grit, then stun and smash.** He is the counter hero.

| # | Ability | Tier | Kind | Power | Cooldown | Effect | Combo | Pose |
|---|---|---|---|---|---|---|---|---|
| T1 | **Shield Bash** (today's) | 1 | damage + debuff + buff | 1.6 | 4 | Attempt Stun and leave Exposed. Guard for 2 foe opportunities. | sets up every Exposed payoff | shield-bash |
| T2 | **Riposte** | 2 | damage | 1.6 | 3 | **After a completed enemy move containing at least one successful player parry**, eligible through the next hero action only, even if other hits were dodged or missed. A sure crit. | parry, then this | lunge |
| T3 | **Iron Will** | 2 | buff | — | 5 | +3 Grit and Ward 15% max HP. | builds Grit | plant |
| T4 | **Taunting Roar** | 3 | debuff | — | 5 | Weaken 2 turns and Pinned. | an easy parry for Riposte | shout |
| T5 | **Hammerfall** | 3 | damage | 1.4 + 0.25 per Grit | 5 | Requires at least 2 Grit. Spends all Grit. ×1.25 and consume Exposed. | the main Grit payoff | overhead |
| T6 | **Shield Throw** | 4 | damage + debuff | 1.4 | 4 | Attempts Stun and leaves Exposed on a Sundered foe; shield returns during the same action. | Sunder, then this | throw |
| T7 | **Bulwark** | 4 | passive | — | — | Every successful parry grants +1 extra Grit and its counter deals ×1.25. | the parry engine, always on | none |
| T8 | **Last Stand** (F) | 5 | finisher damage + buff | 1.8; counter ×2 | 8, opens hero turn 3; once per fight | Hits for 180% power. Then, for the next 2 foe opportunities he cannot drop below 1 HP, has twice the normal parry window (under the cap), and completed all-parry counters deal ×2. No automatic retaliation. He still chooses each reaction. Then heals 15% max HP if alive; protection cannot refresh. | the comeback | slash, then stand |

### 6.3 Pip, the Lanternmage: Burn and Embers

Her loop: **Gather Embers, set the foe alight, then feed or detonate the fire.**

| # | Ability | Tier | Kind | Power | Cooldown | Effect | Combo | Pose |
|---|---|---|---|---|---|---|---|---|
| P1 | **Fireball** (today's) | 1 | damage + debuff | 1.8 | 5 | Burn 3 turns. Spends Embers (+10% each). | sets up every Burn payoff | big-cast |
| P2 | **Kindle** | 2 | damage + resource | 0.6 | 2 | +2 Embers. On a burning foe, Burn lasts 1 more turn. | builds Embers, stretches Burn | small-cast |
| P3 | **Ignite** | 2 | damage | 0.8 + remaining Burn ×1.25 | 4 | Requires Burn. Spends it; only the base 0.8 can crit, not the stored damage. | Fireball, then this | snap |
| P4 | **Searing Eye** | 3 | buff | — | 6 | Requires Burn. For the next 2 hero actions her direct hits on a burning foe always crit; DoT and stored damage cannot. | the owner's example: burn, then sure crits | channel |
| P5 | **Wildfire** | 3 | debuff | — | 5 | Requires Burn. Refresh to 3 ticks; increase raw tick by 0.15 U at each of next 3 foe starts, capped 0.8 U. No stacking growth effects. | stack with Kindle, cash with Ignite | big-cast |
| P6 | **Lantern Flare** | 4 | debuff | 0.5 holy | 5 | Blind 2 turns. A burning foe is also Marked. | | lantern-raise |
| P7 | **Ember Heart** | 4 | passive | — | — | Each Burn tick on the foe gives +1 Ember, once per foe action. | Burn feeds Fireball and Lanternburst | none |
| P8 | **Lanternburst** (F) | 5 | finisher | 2.0 +0.6 per Ember, ×1.25 on a burning foe | 7, opens turn 3 | Requires 3 Embers. Spends all Embers and the Burn. No additional generic Ember multiplier. | the end of her loop | burst |

### 6.4 Unlocking and branches

The exact tier, relic and boss allocation, all 42 star forks, universal Attack/Parry/Dodge forks and tested-by-reasoning three-slot sequences are in [Ability tree details](ability-tree-details.md). The starter signature is free; each hero's other 13 abilities require a relic and the listed tier gate. Proposed source rates remain subject to economy review.

## 7. Art production context

[Ability art brief](ability-art-brief.md) is the complete pose, equipment and effects checklist, including a Hallowed treatment for every signature. Families are sequences, not one PNG each. Use the revised family and timing-key inventory in that brief; passive-only poses are removed and timing holds/releases are budgeted explicitly. Current art is reference material until grip/contact/pose continuity has been verified.

## 8. Engine work and validation

The current turn prototype has four fixed cooldown keys and one sampled signature, excludes bosses, and rejects zero-damage actions. Aim stacks, generic buffs/debuffs, boss stagger, typed multi-hit spells and these complete loadouts require new work; they are not already supported merely because a similar real-time status exists.

After design approval:

1. Add a data-driven registry and active three-slot selection/resolution. Remove automatic combat selection and offline combat rewards as a coordinated runtime change. Keep the action-bar layout with Claude.
2. Add explicit hero/foe clocks, accepted buff actions, condition snapshots, resource spends, capped statuses and multi-hit events. Separate DoT, direct, counter and reflected damage to prevent recursion.
3. Add boss-safe control and readable status/resource indicators. Last Stand's once-per-fight flag, opener gates, death and retreat reset must be in the shared state.
4. Coordinate Training, star choices, relics and Hallowed with Ascension and chapel work. C22 now denotes the enemy overhaul in the current roadmap. Claude owns save-key and migration decisions.
5. Review complete hero art packs and validate layered fit before runtime wiring.

The C29 build ([combat-turn-build.md](combat-turn-build.md)) records what was built and its first sim numbers. No runtime files or art assets are changed by this design proposal.

## 9. Review decisions

Owner decisions are in §2a. Still proposals needing sign-off: Focus rounding, per-ability branches, relic pity, the
turn-only damage normalization (manual spell multiplier 1.0 vs legacy 2.5), the crit-damage cap 3.0, Haste pricing and
single-target Hallowed adaptations (art brief).

## Repository verification

For this design follow-up against `3795483`, `node tools/build.mjs` passed (3661.3 KB) and the full sharded `node tools/check.mjs` passed: 2134 assertions, zero failures and zero browser sections skipped. This validates the unchanged game baseline, not the proposed abilities. No gameplay source or art asset is changed by this design.
