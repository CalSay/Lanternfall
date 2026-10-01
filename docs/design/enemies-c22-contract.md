# C 22 enemy design contract and review index

> **Structure now finalized:** [Final roster contract](enemies-c22-final-contract.md) records175 zone monsters,35 Champions and5 Elders (215 unique), plus175 Captain enhancements. This earlier exploration is retained as design history, not the current count or role contract.

> **Superseded selection draft (1 October 2026):** see [the fantasy review](enemies-c22-fantasy-review.md). The owner now requires darkness-born combat enemies, one enemy per fight with no queues, and Hunting kept separate. Elders retain Trophies. Final roster count is pending the owner and Claude. Do not implement this earlier roster or its gauntlet/Hunting combat proposals as written.

Design proposal, 1 October 2026. Based on coordinator checkpoint `c4542cf` and C 19 follow-up `c26ed05` / `524ada6`. The owner’s latest direction is **active-only combat**: no Auto, idle fight resolution or offline combat rewards. This replaces the earlier farming requirement. No runtime or artwork is included.

## Reading order and scope

- [Hollow](enemies-c22-hollow.md): 28 normal foes and variants, seven elders, Fenmother.
- [Coast](enemies-c22-coast.md): 28 normal foes and variants, seven elders, Silas.
- [Emberwaste](enemies-c22-emberwaste.md): 28 normal foes and variants, seven elders, Pyre Knight.
- [Pale Reach](enemies-c22-pale-reach.md): 24 normal foes and variants, six elders, Whitehush.
- [Gloamvale](enemies-c22-gloamvale.md): 24 normal foes and variants, six elders, Voice.
- [Encounter systems](enemies-c22-systems.md): seven elite traits, champions, Deepwell and the three existing Hunting beasts.

These are 132 normal designs, 132 named tougher variants, 33 area-elder roles and five region bosses (Ser Durand fills both the final Emberwaste elder and its region-boss role) across 33 areas. Variants inherit every unspecified field of their named base card; their explicit deltas are complete encounter modifiers, not extra simultaneous actors. New names are proposals for owner review. Existing lore identities remain intact. Latest owner reward direction: gold, Essence and relics remain; bosses may occasionally drop uniques. Enemy kills do not drop gathering materials. Resource gathering and its approved source beasts remain separate.

## Shared card conventions

**Reference hero:** appropriately trained and geared for the area. Toughness is target uncritical ordinary Attack actions to defeat, with neutral damage and typical zone armour already reflected; it is not a promise that a finisher also takes that many actions. First Moss Slime and the first Mossy Hollow gauntlet target **three ordinary hits** per normal foe, as the owner requested. Subsequent normal targets are 3–5, tougher variants 6–8, elders 10–15; region bosses explicitly declare their targets. Number-squish calibration belongs to step 3.

**Speed:** ratios compare the enemy to a reference hero at 1.0. Ratios above 1 sometimes yield two opportunities; below 1 sometimes allow two hero opportunities. Actual frequency depends on gear, ties and slows. Neither side exceeds two consecutive opportunities, except a region boss/elder designated boss may take three. Multi-hit moves are still one opportunity. A speed ratio is not an instruction to inject an extra attack on a fixed turn. C19’s shared scheduler governs both sides.

**Damage:** every listed percentage is a share of reference hero maximum HP, before Guard/Ward and the hero’s damage-type mitigation. Lists give per-hit values and totals. Normal single heavy hits generally cost20–35%; multi-hit attacks split a comparable move budget so a three-hit normal does not secretly demand three perfect defences. Ticks are additional only where explicitly listed. No outgoing damage rises because the player increased max HP: percentages are design calibration units, converted to fixed zone stats in step 3. No instant damage from feint animation, stage overlap or telegraph alone.

**Defence:** every real hit accepts either parry or dodge. Feints do not have fake damage windows and cannot consume a reaction input unless the player presses before the real window; all actual contacts have an authored cue. Each parry refunds 1 from every active ability cooldown. A counter occurs once only after all hits in the authored move were parried. An interrupted or cancelled sequence never gives an all-parry counter. Do not secretly lower enemy hit counts because counters became easier.

**Timing vocabulary:** quick = compact readable anticipation; delayed = a clear held pose before release; feint = one visible false start followed by an unambiguous contact cue; slow-slow-fast = three distinct cues with the last shorter interval; charge = a visibly separate wind-up opportunity. Exact milliseconds, reaction widths and animation playback are a later usability test, not implied by these names. Later regions combine learned patterns rather than hide the cue or demand faster reflexes solely because the zone number rose.

**Control/status:** no immunity. Use existing type identifiers phys, holy, poison, fire, frost (weakness1.5/resistance0.6 are current references, not new tuned numbers). Armour is proposed physical damage reduction, not an additional universal resistance. All unlisted types are neutral. Debuffs on the hero require a hit that actually lands through the chosen defence; they do not attach to a parried/dodged hit. For these cards: Bleed/Venom/Burn specify per-tick HP damage and remaining hero opportunities, tick at hero-start; refresh strongest, no added hidden stacks. Chill slows reference Speed 10% for 2 hero opportunities per listed stack, max 2 on hero in this proposal; it never steals the player’s action or removes a reaction choice. Weaken 25% direct output reduction for 1 hero opportunity; Blind affects next player direct action but never obscures timing or forces random reaction failures. Cleanse removes the named harmful effect. Where a move has several hits, apply its status once on the explicitly named hit, not each hit by default.

## Boss and elder charge contract

Every elder and region boss has a marked charge in its move list. Starting that move consumes one foe opportunity and deals no damage; the named release occurs on the next eligible foe opportunity **after at least one hero opportunity**. If Speed would select it too soon, hold the boss and allow the hero response without aging clocks or adding another damaging move. One pending charge only. Its wind-up and release remain a single named move with two opportunities; refund/counter tests cover only the release hits.

Interrupt by a non-locked Stun/Freeze contribution or the card’s actual HP-damage threshold dealt after charge begins, before release (default 6% of boss maximum HP). Ward damage does not count toward that threshold. DoT HP damage counts. Interruption consumes the charge; the next opportunity is recovery, with no damage and no second charge. For ordinary charged enemies, control gauge reset still applies, but the pending control skip and interrupted-charge recovery share the same next opportunity. Boss control also fills stagger 25/35; reaching 100 gives only the usual one skip, not an extra recovery plus skip. After an interrupt, one ordinary move must resolve before another charge can start. Boss control lock lasts 3 foe opportunities including a skipped/recovery opportunity. A phase transition cannot cancel a pending hero response or grant an immediate attack.

Move scripts list a deterministic teaching rotation; an interrupted slot becomes recovery. Random alternatives may vary only after every move has been seen, cannot add consecutive charges, and need deterministic seeded replay. HP thresholds queue phase changes at move end. No party positions, terrain hazards, raid data or second actor on stage.

## Gauntlets, rewards and art budgeting

Area gauntlets list3–5 sequential foes. Each battle requires active input. The player may stop between members; no automatic next fight. Cooldowns/resources/statuses reset per foe under C19; HP uses the agreed healing model, never an undocumented full heal. There is no invented potion/food system to make attrition work. Step 3 must test gauntlets with available sustain and set an explicit recovery budget before rollout. Additions from Summoner obey the same visible queue cap, never duplicate rewards or run offline.

Enemy rewards are **gold and Essence**, plus relics where the existing eligibility rules allow; bosses may occasionally drop their existing uniques. No ore, wood, fibre, hide, herbs, gems or other crafting-resource drops are proposed, including disguised terrain-cache rewards for kills. Do not remove progression flags or existing first-clear story unlocks merely because they are not loot. Relic/unique rates and eligibility remain coordinator-owned; a new normal foe does not automatically gain a relic roll. Beasts recover or dissolve into their original material as lore permits; no corpse harvesting is needed. Hunting resource gathering is outside combat loot, and any combat adaptation of a Hunting beast follows this same kill-reward rule.

Art notes budget pose **keys**, not a claim of finished sprites. Default seven-key normal envelope: idle; two distinct wind-ups; two contact/release keys; hurt; defeated. Multi-hit moves can reuse contact keys with authored timing, never invisible extra blows. An elder can share silhouettes with its base but needs readable crown/scale and charge hold/release. Hero and enemy contacts must meet physically; coast creatures stay reachable at the water edge. No generation or wiring is authorized by this design handoff.

## Review gates

Before runtime: owner/Claude approve the roster, C 19 rules and relative budgets; step 3 turns them into actual numbers. Test three hero kits at entry/mid/end regional gear; three timing skill bands; first-foe three-hit target; full/mixed defence sequences; boss interruption and consecutive-turn caps; no-input pause and zero offline rewards; no loot duplication at gauntlet boundaries. Report damage distribution and fight length, not only best-case burst. The unmodified baseline build/check result validates repository health, not these unwritten encounters.

## Repository validation

On unchanged gameplay checkpoint `c4542cf`: build PASS (3662.2 KB), full sharded checks PASS (2134 assertions, zero failures, zero browser skips). Hollow structural review: 28 normal cards, 28 variants, seven elders, seven gauntlet rows and Fenmother. Later regional design-only additions reuse this baseline check; per-region roster counts are checked separately.
