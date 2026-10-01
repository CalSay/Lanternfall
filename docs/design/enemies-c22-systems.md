# C22: elites, champions, Deepwell and Hunting

> **Superseded selection draft (1 October 2026):** see [the fantasy review](enemies-c22-fantasy-review.md). The owner now requires darkness-born combat enemies, one enemy per fight with no queues, and Hunting kept separate. Elders retain Trophies. Final roster count is pending the owner and Claude. Do not implement this earlier roster or its gauntlet/Hunting combat proposals as written.

Design proposal, 1 October 2026. Read the shared encounter contract and regional rosters. Combat is active only. This file changes no runtime, drop rates, online raid data or gathering timers.

## Audit and replacement of the seven elite traits

An elite uses one named tougher variant from the area's roster:6–8 ordinary Attack actions, not doubled again by the trait. Start with one trait; a two-trait late challenge requires explicit combined balance review. A trait cannot override the two-consecutive-opportunity cap, create an unavoidable hit, steal input or make any attack parry-only/dodge-only. Trait cues are persistent icons plus readable changes to the next move, never colour alone.

| Existing trait | Decision | Exact solo proposal and counterplay |
|---|---|---|
| Shielded | Rework | Start with Ward 8% of enemy max HP, lasting at most 2 foe opportunities. No immunity or repeated refill. Any damage can break it; Sunder does not pretend to remove Ward. A clearly drawn cracked rim reports remaining shield. Wren can prepare Mark, Tobin build Grit, Pip prepare Burn while it lasts. Trait adds no damage and no extra move. |
| Leeching | Rework | On move resolutions 1, 4, 7 and so on, heal 30% of that move's actual hero-HP damage, capped 3% of elite max HP. Ward-only damage, parried/dodged hits and DoT yield no healing. Show red threads before the leech move, detach after resolution. Each hit contributes once to the same capped bucket. Dodge or parry all of it to deny healing; burst during the other moves. No passive regeneration or heal-loop enrage. |
| Explosive | Rework | Retire the unavoidable death explosion. Below 30% HP, replace the next second-slot move with a visibly charged Final Spark: charge consumes one opportunity; guaranteed hero response; release 1 hit 30% fire, either defence allowed. Interrupt by accepted control or 8% elite max HP actual damage, or kill it. No post-mortem attack; no extra kill reward. After release/interrupt, trait is spent for that foe. Normal elite control applies, not automatic boss immunity. |
| Summoner | Rework | Retire simultaneous adds. Once per encounter, its second move becomes Call: no hit, visible whistle/bell; only an uncancelled release inserts one already-learned ordinary base foe after the current foe. Wind-up shows a provisional queue marker, never a committed foe; death or interruption removes that marker. Queue length remains at most5; at capacity replace a future generic slot rather than append, never replace a fixed boss/quest slot. If all five slots are protected, omit Summoner at encounter construction; if capacity changes during the call, release fizzles without replacement or reward and the one-use trait is spent. Announce the addition before commitment. A charge-style hero response permits accepted control or 8% actual elite HP damage to cancel the call. Added foe pays the existing per-foe allocation only, no duplicated gauntlet completion credit. Not allowed on the first teaching gauntlet. |
| Enraged | Keep, bound it | Below 40% HP, Speed+15% and direct move damage+10% once, temporary modifier clamp still applies; no extra instant turn. Red shoulder/eye cue and next-turn strip update after current move. No cumulative stacking on repeated threshold crossings. Wren can slow it, Tobin guard/parry, Pip save a spender for the short final phase. |
| Ice-Clad | Rework | Begin with a visible coat that grants 15% additional physical reduction (combined physical reduction cap 35%) for the first 2 foe opportunities. The first fire hit removes it; taking3direct hits of any type also removes it, counting multi-hit contacts. Never adds permanent frost immunity or retaliation. Pip has the natural answer; Wren Twin Shot and Tobin ordinary hits still progress. DoT does not increment the three-hit break count. |
| Cursed | Rework | Retire passive reflection/unavoidable hex. On move resolutions 2, 5, 8 and so on, the last hit of that move is marked by a dark ring; if it lands, apply Weaken 25% for 1 hero opportunity. Either defence denies it. No second damage packet, no hidden timer and no copied hero damage. Cleanse or simply take the one weakened opportunity; the next action is unaffected. |

Cadence counts completed named moves, not opportunities: a charge plus release counts once; an interrupted move consumes its count once; skipped opportunities and recovery do not increment it. This works with one-, two- or three-move regional scripts. A marked move with no landed direct hit yields no trait effect.

Ordinary elites and non-boss champions use ordinary Stun/Freeze control: gauge reset and one pending skipped opportunity. When control also interrupts a charge, that skip and charge recovery are the same next opportunity, never two skips. Boss-tagged champions use the shared boss stagger/lock rules instead.

Trait audit outcome: retain all seven readable identities; retire their pack-only or unavoidable mechanisms. An elite's optional third move comes from its regional variant card. Adding a trait does not automatically add a fourth move or multiply toughness again. One explicit damage budget covers the complete combination. Explosive and Summoner are mutually exclusive in a multi-trait future; Leeching+Shielded and Enraged+high-Speed also need dedicated encounter tests before being enabled.

## Champions

A champion is a named, authored duel from a region's existing champion lore, not a random elite with every number multiplied. Use one area variant silhouette plus its existing champion identity and a clearly shown crown/title. Target 8–10 ordinary Attack actions; retain at most 3 moves: the base's two and one visible charged signature, with the hero response and 8% max HP damage interrupt threshold. Speed cap 2 consecutive opportunities unless the encounter is explicitly boss-tagged. One scripted phase at 50% HP changes one move's rhythm or damage budget, never both at once on first sight. No random extra elite trait on the first clear.

Examples to develop without renaming existing keys: Hollow's old king's guard champion uses Rattlebones rhythm plus a three-hit standard charge; Coast's first mate uses Deckhand/bell timing without a crew on stage; Pale Reach's Skua champion uses a held third-feather release. These illustrate the selection rule, not additional regional boss entries. Preserve source champion names and their reward table during implementation. A champion is marked before entry, optional after its zone unlock, and can be retried manually. Gold, Essence and eligible relic rewards are each granted once by the existing ledger; a champion receives an occasional unique only if its existing reward classification is boss-eligible. No material reward is retained.

Champion charge template: start a clear raised weapon/crown pose, no damage; after a guaranteed hero opportunity release 3 hits 20%+20%+25%=65% phys, slow-slow-fast. The concrete champion may change type/rhythm under a named profile, not inherit this invisible template without showing it. Either defence always works. All-hit parry gives one counter; three parries give three cooldown refunds. Wren can set Mark then burst; Tobin can interrupt/earn Grit; Pip can use Burn damage toward the interruption threshold. No required hero.

## Deepwell pool rules

The Deepwell remains a separate place; the Climber does not become an ordinary Gloamvale enemy. Use existing unlock, floor, checkpoint and reward gates. Do not create free regional unlocks by encountering a later-region foe early.

1. At entry, snapshot reached regions and learned enemy IDs. Floors draw from unlocked regional pools; no undiscovered late-region silhouette leaks into a first Hollow run. A later unlocked region expands the pool on the next entry, not mid-floor.
2. A normal floor is a visible three-foe sequential queue: a light/quick foe, a heavier/slow foe and a timing/status foe. Later optional challenge floors can use four or five; never more than one named variant in a baseline queue. Avoid two Weaken/Chill specialists back-to-back until that pairing has a measured attrition budget.
3. Adapt the existing floor schedule rather than invent a new one. Where it calls for an elite, replace one ordinary slot with the corresponding named variant and one allowed trait. Where it calls for a Deep Elder, use one previously introduced area's elder kit as the sole marked boss encounter. Preserve its tells, hit counts and charge response; depth raises fixed calibration numbers rather than erasing its timing lesson.
4. The current floor 20+Snuff and floor 40+speed escalation require a solo rewrite: propose Snuff as a **named charged move slot**, not a ticking Lamp meter or an extra attack outside the move rotation. It replaces an elder move, never increases the kit beyond4. Charge at least one hero opportunity; release 3 hits 20%+20%+25%=65% holy, slow-delayed-fast; control or 6% bossHP interrupts. One complete ordinary move separates Snuffs. Depth speed stays under the shared streak and temporary-stat clamps. These are explicit replacements requiring coordinator approval, not silent changes to the old seconds-based runtime.
5. Keep one saved encounter seed, current member index and committed reward ledger. Pausing preserves them. Abandon/reload follows the active-only cancellation rule, grants no completion loot, and cannot reroll the same floor reward repeatedly. No offline floor clears, kill samples or catch-up rewards.
6. HP carries under the actual checkpoint/healing system; a queue boundary alone does not heal. Test attainable sustain with three equipped slots and currently unlocked abilities. If a run requires future bag/potion features, shorten the queue or supply an explicitly approved checkpoint rest instead of inventing consumables.

**Example unlocked-Hollow floor:** Cave Bat → Rootling → Reed Mourner (only after Wraithmarsh is reached). Before that, substitute the learned Dewcap Newt as the status lesson. An elite floor can replace Rootling with Knotted Rootling+Shielded; target 7 actions, not14. An elder floor uses Elder Quarry Golem only after its first exposure, or an already learned earlier elder. This preserves skill learning and avoids a random first encounter with an untelegraphed boss mechanic.

## Hunting: three existing beasts

These cards supply moves for the existing approved Hunting silhouettes. They do not silently replace the current gathering loop with combat, remove offline gathering, change spear recipes or introduce later-grade beasts. Claude must decide whether these are active Hunting encounters or reusable combat animation profiles when integrating. The owner's earlier spear-thrust contact and open-mouth-before-contact art direction remains: preserve the authored bite wind-up and physical spear contact, but do not show a successful bite if it was interrupted or defended.

All three use beast weaknesspoison, resistnone; ordinary control applies. Percentages are fixed zone-ready calibration units. Each selected move gives separate parry/dodge contact choices; no mandatory spear-only reaction. Weapon equipment and resource payout remain in their existing systems.

### Enraged Boar — existing grade 1 Hunting beast

A woodland boar’s bristles stand around the dark like a thorn hedge. Speed 0.8×, target 3 ordinary hero actions in a combat adaptation, armour 5% phys; no scripted double opportunity.

- **Tusk Thrust:**1 hit,slow,22% phys; no status. Head drops, tusks point forward and mouth opens just before the real contact. Defend on the forward tusk motion, not its preparatory snort.
- **Bristle Shake:**2 hits,slow-fast,9%+12% phys=21%; no status. Two distinct shoulder jerks announce two contacts. No unavoidable thorn reflection when the hero stabs it.

Alternate Thrust/Shake; no automatic enrage multiplier implied by its existing name. First-entry Wren Echo Shot, Tobin Shield Bash and Pip Fireball suffice, with ordinary Attack and either defence. Optional later Sunder helps the small armour layer. Combat rewards follow gold, Essence and existing relic eligibility only. Bristlehide remains the separate grade 1gathering output, not an enemy drop. Seven keys: idle, thrustwind/contact(open mouth), shakewind/contact, hurt, retreat/restored. Existing poses are references pending exact timing/contact fit, not permission to redraw them.

### Bristleback Wolf — existing grade 2 Hunting beast

A darkened forest wolf bristles before its lunge. Speed 1.15×, target 4 ordinary hero actions, armour 0; occasional paired foe opportunities under cap 2.

- **Open-Jaw Lunge:**1 hit,delayed,27% phys; no status. Shoulders sink and the open mouth holds before the head moves forward; spear contact can meet the chest/jaw silhouette rather than scrape its top.
- **Double Snap:**2 hits,quick-delayed,11%+15% phys=26%; final landed hit Bleed 2% for 2 hero opportunities. Two jaw closures, with the second visibly held.

Alternate Lunge/Snap. Tests resisting the urge to react at the first open-mouth pose. Wren can Pinned/Mark after those unlock; Tobin can parry either snap for Grit and only both for a counter; Pip Ward protects a mistake and Frost Shard provides control. No hero is mandatory. Combat rewards follow gold, Essence and existing relic eligibility only. Duskfang Pelt remains the separate grade 2gathering output. Seven keys: idle, lungewind/contact, snapwind/contact, hurt, retreat/restored; two contacts can reuse a jaw key only if both beats remain distinct. No scale change that blurs the approved creature sprite.

### Fen Lizard — existing grade 3 Hunting beast

A marsh lizard’s pale throat swells around a darkened breath. Speed 0.9×, target 5 ordinary hero actions, armour 10% phys; no scripted extra turns.

- **Fen Bite:**1 hit,slow,29% phys; no status. Throat settles, mouth opens wide, then jaw comes forward. The attack’s contact aligns to the hero’s held weapon plane.
- **Marsh Spit:**1 hit,delayed,23% poison; Venom 3% for 2 hero opportunities. Throat inflates in a separate silhouette, then releases one visible droplet. Every defence can deny both impact and Venom.

Alternate Bite/Spit; a missed Spit costs 29% including two ticks, not 29% on each tick. Wren can use Bleed through armour; Tobin Sunder improves direct hits; Pip Ward or Flame damage is neutral, not an invented weakness. Earlier starter kits remain usable with more Attack actions. Combat rewards follow gold, Essence and existing relic eligibility only. Fenscale remains the separate grade 3gathering output. Seven keys: idle, bitewind/contact, spitwind/release, hurt, retreat/restored. Reuse the approved open-mouth frame only if its throat shape matches the move.

## Integration and balance checklist

Verify all region/base/variant references before wiring; a trait never changes the actor count or introduces an unlisted damage packet. Exercise perfect/mixed/missed defence, control-lock rejection, threshold interruption, death mid-move, queued summons at capacity, variant+trait stat composition, champion first-clear ledger, Deepwell abandonment and zero absent combat progression. Measure active encounter/gauntlet lengths and missed-hit budgets for each hero; no Auto rates or idle-survival claim remains. The online world raid is untouched.
