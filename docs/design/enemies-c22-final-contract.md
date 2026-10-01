# C22 final roster structure and combat contract

Owner-approved structure, 1 October 2026; creature names, artwork and balance below remain design proposals for review. Based on coordinator checkpoint 2a61322 and world-structure.md. This replaces the old four-monster pools, exploration counts, area passes, gauntlets and Hunting combat cards. No runtime or art implementation is included.

## Counts and progression

Five regions, each seven areas played once, each five consecutive zones. A zone contains five manually initiated regular fights against its own monster, then one Shadowborn Captain. One enemy per fight. Clearing all five zones leads to the area's Champion of Darkness. Clearing all seven areas leads to the region's Elder of Darkness, a separate encounter. No queued gauntlet, autonomous next fight or offline combat.

| Design role | Per area | Per region | Game |
|---|---:|---:|---:|
| Unique zone monsters | 5 | 35 | 175 |
| Champions of Darkness | 1 | 7 | 35 |
| Elders of Darkness | — | 1 | 5 |
| Unique designs | 6 | 43 | 215 |
| Shadowborn Captain enhancements (excluded from unique designs) | 5 | 35 | 175 |

Thus 210 unique non-region-boss designs, plus the five existing region bosses. Each zone has six fights; each area has 31 including its Champion; each region has 218 including its Elder; the game has 1,090 prescribed progression fights. These are design counts, not a claim runtime progression is already converted. Captains reuse their zone monster's silhouette and pose set, with a readable recolour and extra move; ordinary repeated fights do not introduce another species. Bosses do not repeat. Any justified later return is a new, stronger encounter requiring explicit approval.

Pale Reach's existing Frostgate Bastion and Gloamvale's existing Heart of the Gloamvale are used as their seventh full areas, each with a separate Champion before Whitehush/the Voice. This mapping was confirmed by Claude in PR1 comment5940265643 and recorded in world-structure.md at b41592c. Region bosses are Fenmother, Silas, Ser Durand, Whitehush and the Voice. Durand is not the Pyre Champion. The Voice is one continuous phased battle and one victory ledger.

## Roster documents

- [Hollow](enemies-c22-hollow-final.md)
- [Sunken Coast](enemies-c22-coast-final.md)
- [Emberwaste](enemies-c22-emberwaste-final.md)
- [Pale Reach](enemies-c22-pale-reach-final.md)
- [Gloamvale](enemies-c22-gloamvale-final.md)

## Origin, rewards and visual hierarchy

Ordinary combat foes and Champions are agents born from the darkness, not corrupted animals, resurrected villagers or household objects with eyes. Dark bodies unravel on defeat. Established region-boss histories remain story exceptions. Hunting alone uses existing wildlife driven into a rage by the darkness and stays in gathering; its beasts are never inserted into combat.

Retain gold, Essence and existing relic eligibility. Preserve existing Trophy eligibility through the old area-boss to Champion role mapping; do not create Trophy IDs or drop rates here. Some bosses may yield uniques, but the acquisition policy without rematches remains unresolved. Do not promise rerolls, repeat farms, guaranteed unique drops or new loot sources. No gathered material, Sigil or disguised resource cache is an enemy reward.

Captains are visibly empowered individuals of the same monster: palette change plus readable outline/mark treatment from the approved pack, a title, tougher stats and one extra move composed from existing poses. Colour alone cannot carry the tell. Champions require their own imposing anatomy and proper names, not merely a scaled normal with an Elder prefix. Their stage footprint may be larger but contacts must remain reachable and silhouettes must not cover controls. Elders have the largest narrative presence, through authored phases and effects rather than unlimited sprite size. Art budgets are estimates, never approved generated art.

## Shared numerical and reaction rules

HP budgets count neutral uncritical ordinary Attack actions against zone-ready reference gear, with ordinary armour reflected. Values are provisional fixed-zone calibration, not HP that changes dynamically with the player's build. The opening Mossy Hollow monster targets three ordinary hits. Normals generally 3–5; Captains 6–8; Champions 10–15; Elders declare their budget. Skills can shorten fights.

Speed is relative to the reference hero at 1.0. C19's gauge scheduler preserves progress; normals/Captains never exceed two consecutive opportunities; Champions/Elders at most three. Speed never reduces reaction windows. Physical armour and elemental weakness/resistance are separate; cards declare the values. Weakness multiplier1.5 and resistance0.6 remain provisional; unlisted types neutral. Each hit has one damage type. No compulsory hero/ability/equipment unlock is assumed.

Each real hit accepts parry or dodge. One parry refunds one from every active ability cooldown. A counter happens once only after every hit of a completed move was parried; cancelled moves do not award it. No damage from wind-up, feint, passive scenery or phase transition. Normal combos split a comparable whole-move damage budget instead of multiplying a heavy single hit across every contact. Every projectile has an authored contact cue; no second enemy is implied by multiple limbs or mouths.

Incoming status proposals have one shared meaning: Bleed deals2% reference HP at each of two subsequent hero starts; Burn4% at each of two; Venom2% at each of two. A named rider applies once on its specified landed hit, strongest tick refreshes duration, with no hidden stacks. These are different move strengths only when a card explicitly declares a stronger exception. Enemy Venom needs runtime approval and does not revive deferred hero Venom abilities. Blind gives the next direct hero action a30% miss chance; it never hides telegraphs or changes reactions. Chill reduces Speed10% for two hero opportunities, maximum two stacks, never freezes or steals input. Weaken reduces direct output25% for one hero opportunity. Damage taken through Ward counts as a landed contact for these proposals unless a card explicitly says HP damage is required. Regional scripts must not introduce different stack definitions. All values remain subject to the shared balance pass.

## Charges, control and phases

Every Champion and Elder has an interruptible charged move. Wind-up consumes one foe opportunity, no damage. Release may occur only after at least one hero opportunity; hold a prematurely ready boss without aging clocks or creating another attack. Default interrupt: accepted non-locked Stun/Freeze contribution, or actual HP damage equal to6% boss max HP during charge. Ward damage does not count, DoT HP damage does. Ordinary Captain charged moves, if any, use8% max HP unless stated.

Interruption consumes the charge and the next enemy opportunity is recovery. A concurrent ordinary control skip or full boss stagger skip shares that opportunity, never adds another skip. Ordinary control clears gauge and gives one skip; boss control contributes25/35 stagger with a three-foe-opportunity lock including recovery. One ordinary move resolves before another charge starts. Phase changes happen at move end, announce visibly, give no free damage and cannot erase a hero's promised charge response.

Where a normal/Captain card has no special script, normal alternates moves1/2; Captain cycles1/2/3. Champions use1/2/charge/release/other move, then repeat. Explicit regional scripts override this. No end-of-fight automatic heal is introduced: existing healing/checkpoint rules need calibration against the finalized encounter counts. Do not require imaginary potions to make31 fights sustainable.

## Systems integration decisions still needed

The seven old elite traits are not automatically stacked onto every Captain. The authored Captain enhancement is complete; avoid applying an extra generic HP multiplier or fourth move. Old queue-based Summoner is withdrawn: propose a single-body empowerment ability instead, requiring review before enabling the trait. Shielded/Leeching/Explosive/Enraged/Ice-Clad/Cursed require explicit audit against the selected Captain kits; none adds unavoidable damage or a second actor.

Deepwell must also use one enemy per encounter. Retain its existing progression/checkpoint rules, admit only learned normal/Captain identities and do not repeat unique Champions/Elders as farmable floors. Any dedicated Deepwell boss needs a separate approved identity. No world-raid changes. Existing repeatable champion systems must not silently reintroduce these one-time story bosses.

Before runtime/art: confirm stable IDs and Trophy mapping; resolve unique acquisition, sustain, enemy status magnitudes and exact pose budgets. Reconcile the roster against C19 hero damage/resources, then test all three heroes and mixed successful/missed defences. Required code regression checks do not validate these proposed combat numbers.

## Regression validation

Build passed (3663.2 KB). Full sharded checks passed: 2134 assertions, zero failures, zero browser skips, on the integrated 2a61322 gameplay baseline. This validates unchanged gameplay, not the proposed enemy balance. Roster structure and move arithmetic are reviewed separately.
