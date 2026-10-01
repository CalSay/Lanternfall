# Hero ability trees: Wren, Tobin and Pip (C19 draft)

Status: **complete design proposal for owner and Claude review**, 1 October 2026. Developed from Claude checkpoint `57ed6ad`. Nothing here is built yet. The 6+8 count and **2.5× base critical damage** are owner directions; other tuning remains proposed. The linked tree, art and validation documents complete this specification. No measured balance claim is made.
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
  turn, statuses that count turns, a timed parry and dodge, and three small per-hero resources (Aim is a rework). New mechanics are flagged
  in section 8 (including changes to existing mechanics).
- **Art:** each ability names the **pose family** it plays, so Codex can plan every pose at once (the linked art brief).

## 2a. Owner decisions after the C19 draft (binding; 1 October 2026)

These came in after checkpoint `57ed6ad` and override anything below that disagrees.

1. **Defence is one choice per enemy attack.** On every enemy attack the player picks one: parry (harder; blocks,
   counters, refunds) or dodge (easier; only avoids). No ability makes the choice, no enemy attack is parry-only or
   dodge-only; abilities may only make an option easier or more rewarding.
   **Multi-hit attacks (owner, 2026-10-01):** an enemy attack can be several hits, and an enemy can attack more than
   once in a turn cycle. Each hit is its own parry-or-dodge choice. **Every successful parry takes 1 turn off every
   ability cooldown** (per hit, not per attack). **The counter only comes if every hit of that attack was parried.**
   This replaces "reduces remaining cooldowns 1 once per foe action" in §2.
2. **Speed sets turn frequency (Expedition 33 style), not only who opens.** Proposed timeline, for Codex/Claude to refine:
   each actor has a gauge that fills at its Speed; it acts at 100, then the gauge resets; ties go to the hero. Equal Speed
   alternates as today; +33% Speed gives about 4 actions for every 3. Speed changes are capped at 50%-200% of base;
   bosses take Speed changes at half strength. Stun and Freeze empty the foe's gauge (bosses: Stagger instead).
   Cooldowns, statuses and finisher openings still count the owner's own actions. The UI shows the next few turns as a
   strip. A Speed gear line is wanted.
3. **Passives.** A passive takes an ability slot, has no button and is always on. One per shared pool and one per
   signature set: A6 Twin Shot, M4 Momentum, C5 Afterglow, W7 Night Hunter, T7 Bulwark, P7 Ember Heart (rows below). They
   need no pose; the art brief's poses for the replaced actives drop unless another ability reuses them. A Hallowed
   passive gets stronger numbers only. Auto ignores passives.
4. **Timed abilities** (timing checks like Expedition 33): press again as a ring closes. Perfect (~0.12 s) adds a
   bonus; Good (~0.3 s) is the ability as written; Miss is ×0.7 power, no bonus. Multi-hit abilities check each hit.
   Auto and idle always count as Good. Only on the hero's own turn. Draft list (4 per hero) with Perfect bonuses:
   Wren A1 Power Shot (sure crit), A5 Volley (per arrow, +1 Aim), W3 Deadeye (Mark stays), W6 Moonlit Volley (per arrow,
   +1 Bleed even unmarked); Tobin M1 Heavy Strike (+50%), T1 Shield Bash (Guard 1 more), T5 Hammerfall (keeps half the
   Grit), T6 Shield Throw (catch it: cooldown -2); Pip C2 Frost Shard (+1 Chill), P1 Fireball (Burn 1 more turn),
   P3 Ignite (×2 not ×1.5), P8 Lanternburst (keeps 2 Embers). Art: a wind-up hold and a release frame matched to the ring.
5. **Subclasses replace the signature set** ("it's like a new class"). Ascending into a subclass brings its own 8
   signature abilities; the 6 shared stay. These 42 are the base-hero set; subclass sets (C21) reuse pose families where
   they fit.
6. **Equip 3 for now.** A 4th slot comes with a bag button (a turn to drink a potion or eat food), later.
7. **Aim** is Wren's resource. **Base crit ×2.5** (live since `17b1b7e`).

## 2. Rules every ability follows

One ability replaces Attack for one hero action, including a pure buff. Equip three; Attack, Parry and Dodge remain outside those slots. No extra action points, cross-hero combos, persistent summoned actors or positional combat are required. Loadouts change between fights only.

A cooldown of 4 cast on hero action H1 is ready on H5: assign it after resolution, subtract 1 at subsequent hero-turn starts. Proposed Focus rule: `max(2, ceil(baseCD * (1 - min(Focus,30)/100)))` for abilities; Attack stays 1. Do not apply legacy seconds-based Training reductions as well. Manual timed parry reduces remaining cooldowns 1 once per foe action; Auto parry does not. No reduction grants an extra action.

Each new foe resets cooldowns, hero resources, statuses and opening counters. HP follows existing heal/death rules; reset does not heal. Finishers open on the third **hero** action opportunity, not engine `m.n` (which counts both actors); refunds and waiting cannot open them early. Last Stand is additionally once per fight.

The tables' power unit **U is each ability's independently trained power**, using `trainAbPow(id)` and ability gear with a hero calibration constant. Attack keeps its own Training curve. Table figures are provisional comparisons at equal ability training, not raw multiples of whatever Attack upgrades the player bought. Calibration must preserve starter pacing before these coefficients become runtime data.

**Owner: base critical multiplier is 2.5×.** Direct hits can crit; DoT and already-stored damage cannot. Guaranteed crit replaces the random roll and does not multiply another crit. Suggested crit-damage gear/stars add percentage points to 2.5, with total capped 3.0 pending owner/Claude review; existing gear effects need an audit before changing their mapping. Ordinary crit chance keeps the current cap 75%; guaranteed crit can exceed that chance cap. Keen adds 0.5 to the multiplier for one cast, respecting the same proposed cap.

Turn-only proposal: manual/Auto ability damage starts at parity, with the current Auto Attack factor 0.75 retained initially. Manual advantage should come from timing, counters, refunds and choices; do not carry the legacy 2.5× manual spell multiplier on top unnoticed. This requires Claude's balance sign-off and measured kills/Essence per hour. Real-time behavior stays unchanged until separately migrated; no automatic turns-times-two-seconds adapter is promised.

## 3. Status and resource contract

Foe DoT ticks at foe-turn start, including skipped turns; death cancels the rest of that turn. Non-DoT foe statuses expire at foe-turn end. Hero offensive buffs count subsequent hero actions, excluding their casting action. Defensive effects count subsequent foe opportunities, including skips. Reapplication refreshes duration and keeps the stronger magnitude, never stacks multipliers. Multi-hit casts stop on death and cannot carry unused hits into a fresh fight.

| Status | Exact proposal |
|---|---|
| Burn |0.4 U fire per foe start,3 ticks; strongest snapshot retained, max 4 remaining ticks. Snapshot caster power/Status Power; apply target mitigation and vulnerability once when a tick lands.|
| Bleed |0.12 U physical per stack per foe start, max 5 stacks,3 ticks; common refreshed timer and strongest snapshot. Ignores armour, not physical resistance.|
| Chill |4 foe turns, refreshed on application, max 3. Frost Shard applies 2. At 3 clear Chill and attempt Freeze. Owner (Speed timeline, §2a): each Chill also -1 Speed while it lasts.|
| Stun / Freeze |Skip one ordinary foe opportunity; then shared control lock for 3 foe opportunities including skips. Bosses instead gain proposed 25/35 stagger toward 100; reaching 100 skips one opportunity and clears the meter. This is NEW turn-engine work.|
| Exposed |A successful setup-control application, including a boss stagger contribution, leaves a token through the next hero action. Named payoffs consume it for 1.25×. It survives the skipped foe turn. A control application rejected by the lock still produces Exposed but cannot skip again.|
| Mark |+20% damage taken,3 foe turns unless specified. Existing-Mark conditions snapshot before the cast applies/refreshes its own Mark. Consumption occurs after the eligible hit.|
| Sunder |Halves physical armour reduction for 3 foe turns, not elemental resistance or HP.|
| Weaken |25% less outgoing direct damage for 2 foe opportunities; strongest only.|
| Pinned |Next enemy attack's parry and dodge windows 50% wider (owner: abilities never steer the parry-or-dodge choice), consumed after that attack. No Speed change. Does not stack with Brace's window bonus; proposed final window cap 0.35 seconds. Leaves a one-hero-action opening token for Sonic Arrow when consumed, so that combo can actually work.|
| Blind |30% miss for 2 foe opportunities,15% on bosses. Resolve chosen parry/dodge before rolling miss for an otherwise landing attack; misses earn no parry reward.|
| Guard |40% direct damage reduction for 2 foe opportunities unless specified. Combined reduction capped 75% before Ward.|
| Ward |Temporary shield for 3 foe opportunities; damage is mitigated before shield then HP. Keep greater remaining shield, never add shields; cap 30% max HP.|
| Keen |Next direct cast gets+0.5 crit multiplier under the proposed cap, consumed once for the whole cast even with no crit. DoT/counters do not consume it.|
| Curse |Hex stores 20% of actual HP damage for 3 foe opportunities, cap 3 U of Hex power. Clear Curse before burst. Burst is already-scaled damage: no new crit/Mark/mitigation. Exclude reflected damage and Curse bursts from storage. On death clear without a duplicate kill.|

Unused Venom is deferred rather than introducing a status no listed skill applies. Wildfire has one growth effect, at most 3 growth ticks and a raw tick ceiling 0.8 U. Kindle extends only remaining duration, capped 4. Ignite forecasts remaining raw ticks using current target mitigation/vulnerability once, consumes Burn, and never re-crits/re-amplifies the derived portion.

- **Aim (Wren), new:**0–3; each adds 5 percentage points crit chance. Attack grants 1 after resolving. Replaces the prototype's temporary focus effect; it is not already the runtime behavior.
- **Grit (Tobin):**0–10; Attack and successful parry each grant 1 at most once per action. Each gives+3% Attack-button damage and 1% damage reduction. Explicit Grit-spender coefficients do not receive a second Grit multiplier.
- **Embers (Pip):**0–5; Attack grants 1. Only skills explicitly saying they spend Embers do so; Fireball gains 10% per spent Ember, Lanternburst uses its own coefficient instead.

Shared skills' resource riders are class hooks; future heroes need not inherit Wren's Aim or Pip's exact Ember system.

### Resolution order and exact interaction rules

1. Validate eligibility and snapshot all pre-cast conditions/resources, including Aim for that cast's crit chance.
2. Resolve direct hits in order. Echo Shot's follow-up is a separate **0.6 U** hit, not 60% of an already-critical primary hit. A new Mark never boosts the originating hit.
3. Apply new riders, then consume the specifically snapshotted resources/statuses. A cast that both consumes and reapplies the same status must explicitly apply the replacement after consumption (e.g. Ash Seed). The replacement cannot be consumed as the old status.
4. Assign cooldown and spend the action, even if the action dealt no damage. Stop attack sequences at death and end the fight once.

Generic resource, equipment and star procs occur once per cast; Moonlit Volley's explicitly named one-Bleed-per-arrow rider is an exception. Its five arrows still cannot exceed the five-stack cap. Multi-hit crits are independent and resource gains cannot feed later hits in the same cast.

Battle Cry affects direct hero actions only, not DoT, stored damage or counters. Channel similarly affects one direct spell cast, with the bonus split across its hits; no DoT or detonation amplification. Searing Eye includes Pip's fire Attack and direct spell components, excluding counters and stored damage. Night Hunter adds one Aim beyond Attack's normal gain; Bulwark adds one Grit beyond the normal successful-parry gain.

A Burn snapshot stores its original applier and pre-target-mitigation damage. Wildfire adds 0.15 of Wildfire's own trained U and its Status Power to that snapshot per growth tick, capped at 0.8 of that same Wildfire value. A weaker Wildfire never lowers an already stronger Burn: retain the original stronger snapshot with no growth until the cap would exceed it. Recasting refreshes one growth timer; it cannot stack growth rates. Ignite uses the current tick value times remaining ticks, not speculative future Wildfire growth. Apply current target mitigation/vulnerability once to that forecast, then consume Burn and growth together.

Victory, retreat, abandonment, death and reload cancel temporary states; cancellation does not grant expiry heals or Ward rewards. Last Stand's ending heal happens only at natural expiry while alive and still in the fight. Its once-per-fight flag cannot be reset by recasting or refunds.

Auto's Burn-spender preference is an eligibility filter, not a second hidden ordering rule: if an eligible equipped Ignite or Lanternburst is ready, a Fireball that would only refresh an equally strong or stronger existing Burn is ineligible for that action. Then scan eligible slots in order. An eligible attack that upgrades the Burn remains allowed. This rule must be identical in the live and offline chooser.

## 4. Stats and progression layers

| Layer | Role |
|---|---|
| Gold Training |Attack, individual scalable ability power, Counter; retain hero-level and 40/80 stage caps pending pacing review. Never sell an upgrade that has no turn-mode effect. Pure control-only skills need no empty Training ranks.|
| Haste, gold stat tree |**Owner (2026-10-01): Speed sets turn frequency (§2a), not only the opener;** a Speed gear line is wanted. Retain the name Haste in code. Proposed+1/rank, max `min(12,floor(heroLevel/5))` ranks, cost `ceil(20*1.35^currentRank)`. Validate against actual enemy Haste before accepting numbers. No extra gear line is required.|
| Focus, gear |Cooldown reduction with cap/rounding above. Separate from Aim.|
| HP / Armour / Pierce / damage types |Use existing gear and hero rules. Do not change Pip's HP multiplier merely because she is a caster. Armour applies to physical hits; resistance to the appropriate type.|
| Status Power |Use the existing status-power path once for DoT. Do not silently rename/reuse Control, which currently affects control duration. Ward scales with max HP, not Status Power.|
| Stars |Mutually exclusive behavior branches, section 10; no repeatable numeric ranks.|
| Boss relics at chapel |New abilities, not Training or stars; exact routes section 11.|
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
| A6 | **Twin Shot** | passive | 2 × 0.55 | — | Attack fires two arrows; each rolls its own crit and on-hit effects; Attack still grants its normal Aim once. | doubles every on-hit payoff | none (Attack) |

### Melee pool (Tobin)

| # | Ability | Kind | Power | Cooldown | Effect | Combo | Pose |
|---|---|---|---|---|---|---|---|
| M1 | **Heavy Strike** | damage | 2.0 | 3 | A heavy one-handed warblade blow, shield retained. | ×1.25 and consume Exposed | overhead |
| M2 | **Cleave** | damage + debuff | 1.4 | 3 | A wide swing on the current foe, plus 1 Bleed. No extra targets in turn mode. | | wide-swing |
| M3 | **Sunder** | debuff | 1.0 | 4 | Sunder 3 turns. | feeds Sunder payoffs | overhead |
| M4 | **Momentum** | passive | — | — | Each consecutive Attack deals +10% more, up to +50%. Any ability resets it. Direct hits only. | rewards Attack chains between abilities | none |
| M5 | **Brace** | buff | — | 4 | Guard 2 turns; the next parry window is 50% wider. | sets up a parry | block |
| M6 | **Lunge** | damage + buff | 1.2 | 3 | Lunge in; Weaken the next enemy attack. | | lunge |

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
| W5 | **Shadow Step** | 3 | buff | — | 4 | She dodges the next attack for sure, then Keen. | dodge into Deadeye | backstep |
| W6 | **Moonlit Volley** | 4 | damage | 5 x 0.5 | 6 | Arrows fall from above. On a Marked foe each hit adds 1 Bleed. | Mark, then this, then Final Echo | sky-draw |
| W7 | **Night Hunter** | 4 | passive | — | — | Every Attack on a Marked foe gives +1 additional Aim. | with Twin Shot: Aim fills fast | none |
| W8 | **Final Echo** (F) | 5 | finisher | 1.5 + 0.5 per Bleed + 0.5 per Aim | 7, opens turn 3 | Requires at least 1 Bleed or Aim. Spends all Bleed and Aim. No on-kill refund: the next fight already resets cooldowns. | the end of her loop | long-draw + sound waves |

### 6.2 Tobin, the Warden: parry, Grit, stun

His loop: **Brace and parry, build Grit, then stun and smash.** He is the counter hero.

| # | Ability | Tier | Kind | Power | Cooldown | Effect | Combo | Pose |
|---|---|---|---|---|---|---|---|---|
| T1 | **Shield Bash** (today's) | 1 | damage + debuff + buff | 1.6 | 4 | Attempt Stun and leave Exposed. Guard for 2 foe opportunities. | sets up every Exposed payoff | shield-bash |
| T2 | **Riposte** | 2 | damage | 1.6 | 3 | **Only right after a successful manual or Auto parry** (lit for 1 turn). A sure crit. | parry, then this | lunge |
| T3 | **Iron Will** | 2 | buff | — | 5 | +3 Grit and Ward 15% max HP. | builds Grit | plant |
| T4 | **Taunting Roar** | 3 | debuff | — | 5 | Weaken 2 turns and Pinned. | an easy parry for Riposte | shout |
| T5 | **Hammerfall** | 3 | damage | 1.4 + 0.25 per Grit | 5 | Requires at least 2 Grit. Spends all Grit. ×1.25 and consume Exposed. | the main Grit payoff | overhead |
| T6 | **Shield Throw** | 4 | damage + debuff | 1.4 | 4 | Attempts Stun and leaves Exposed on a Sundered foe; shield returns during the same action. | Sunder, then this | throw |
| T7 | **Bulwark** | 4 | passive | — | — | Every successful parry grants +1 extra Grit and its counter deals ×1.25. | the parry engine, always on | none |
| T8 | **Last Stand** (F) | 5 | finisher | 0.6 per retaliation | 8, opens hero turn 3; once per fight | For the next 2 foe opportunities he cannot drop below 1 HP and retaliates once per enemy action that damages Ward/HP; never also a parry counter. DoT cannot trigger it. Then heals 15% max HP if alive. Protection cannot refresh. | the comeback | shield-raise |

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

[Ability art brief](ability-art-brief.md) is the complete pose, equipment and effects checklist, including a Hallowed treatment for every signature. Families are sequences, not one PNG each. Plan 24 families across the three heroes before validated reuse, not 19 new images. Current art is reference material until grip/contact/pose continuity has been verified.

## 8. Engine work and validation

The current turn prototype has four fixed cooldown keys and one sampled signature, excludes bosses, and rejects zero-damage actions. Aim stacks, generic buffs/debuffs, boss stagger, typed multi-hit spells and these complete loadouts require new work; they are not already supported merely because a similar real-time status exists.

After design approval:

1. Add a data-driven registry and shared live/offline three-slot chooser and resolver. Keep the action-bar layout with Claude.
2. Add explicit hero/foe clocks, accepted buff actions, condition snapshots, resource spends, capped statuses and multi-hit events. Separate DoT, direct, counter and reflected damage to prevent recursion.
3. Add boss-safe control and readable status/resource indicators. Last Stand's once-per-fight flag, opener gates, death and retreat reset must be in the shared state.
4. Coordinate Training, star choices, relics and Hallowed with C21/C22. Claude owns save-key and migration decisions.
5. Review complete hero art packs and validate layered fit before runtime wiring.

[Ability validation](ability-validation.md) records the numerical sanity checks and required behavioral/balance tests. No runtime files or art assets are changed by this design proposal.

## 9. Review decisions

Owner decisions are in §2a. Still proposals needing sign-off: Focus rounding, per-ability branches, relic pity, the
turn-only damage normalization (manual spell multiplier 1.0 vs legacy 2.5), the crit-damage cap 3.0, Haste pricing and
single-target Hallowed adaptations (art brief).

## Repository verification

At checkpoint `57ed6ad`, `node tools/build.mjs` passed and the full sharded `node tools/check.mjs` passed: 2,133 assertions, zero failures and zero browser sections skipped. This validates the unchanged game baseline, not the proposed abilities. No gameplay source or art asset is changed by this design.
