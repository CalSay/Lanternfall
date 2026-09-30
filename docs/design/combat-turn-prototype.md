# C20: turn-based combat prototype

Status: proposed, awaiting Claude's sign-off. Based on `badf298` and the latest
[C20 direction](https://github.com/CalSay/Lanternfall/issues/21#issuecomment-5916888721).
[Owner decisions](combat-turns.md) remain authoritative. No engine changes in this proposal.
All numbers and implementation choices below are provisional unless already owner-decided.

## Scope and compatibility

Default-off switch, zone 1 normal fights only, the three starters, one living foe.
Prototype constants stay in owned `59` files. Retune foe HP/damage for one enemy;
disable pack arrivals, adds and independent attack loops in this mode. Bosses,
other zones, Deepwell and raids keep their current behavior. Leaving the supported
scope ends the prototype fight; no prototype timers or queued counter survive.
C25 owns profile discovery/progression; expose foe identity and completed kills now.

Retain per-hero training levels, equipment and existing save fields. Turn cooldowns
are new runtime values, never reinterpreted saved seconds. New saved fields need
safe defaults; missing fields mean prototype off. No save-key bump proposed;
Claude owns any later bump. Changing hero or mode scope clears transient fight state.

## Turns, cooldowns and effects

Higher initiative starts; ties favor the hero; then alternate. One accepted Attack
or ability consumes the hero turn. Invalid/repeated presses do nothing. Manual hero
input waits indefinitely. Defensive input belongs to the enemy attack, not a hero
turn. Stun consumes the affected actor's turn, preserving alternation.

Set a used action's cooldown to C. At each subsequent hero-turn start, subtract
one from every hero cooldown, floored at zero, before action selection. C=1 is
ready next hero turn; C=3 skips two opportunities. Waiting, animation frames,
counters and intro cards never decrement cooldowns. Proposed bases:

| Action | Turns |
|---|---:|
| Attack | 1 |
| Echo Shot | 5 |
| Shield Bash | 4 |
| Fireball | 5 |

Preserve training and existing gear cooldown benefits by proposing:
`ceil(baseTurns * trainAbCd(id, baseSeconds) / baseSeconds * mod('abilityCd'))`,
minimum 1. This conversion requires sign-off. Gear `haste` currently means
-% ability cooldown; never repurpose it as initiative. Use a separate initiative
accessor with prototype values until the stat tree and gear decision are approved.

Give supported buffs, patches and statuses explicit turn durations. DoT resolves
once at the affected actor's turn start; duration decrements after that actor's
turn, with newly applied effects protected from immediate expiry. A patch reapplies
at a defined turn boundary, never per frame. Stop legacy cooldown, regeneration,
patch and status ticks during prototype fights; convert required effects explicitly.
Wind-ups and presentation retain seconds. Exact effect durations await tuning.

## Defense and Auto

Propose parry in the final 0.18 seconds before impact, dodge in the final 0.35
(currently 0.35/0.8). One defense attempt per enemy attack prevents mashing.
Timed parry blocks, immediately refunds one turn from every cooldown including
Attack, and delivers one guaranteed-critical counter before the enemy turn ends.
Keep current counter strength initially; measure before tuning. With Attack C=1,
its refund makes it ready early but never grants another action. Dodge blocks
without counter or refund.

Consume Claude's existing `S.solo.auto` (default true), `soloAuto()` and
`soloSetAuto(v)`; add no second Auto-state field. The UI toggle changes immediately;
only engine scheduling adopts its value at the next actor boundary. Preserve
`soloActive() = !auto && !pageHidden` and the existing `soloGoIdle()`/`soloWake()`
hidden-page handling; combat presses never flip Auto. Tests use `soloSetAuto(false)`
for manual play. Auto uses the first ready equipped ability in bar order, otherwise
Attack. Per enemy attack, roll parry at 10%, then dodge at 25% only on failure:
32.5% combined avoidance. Caps are 30%/50%. Auto parry counters without refund
(pending confirmation). Enchantments improve both Auto odds and manual windows;
prototype exposes modifiers without changing crafting data yet.

## Engine/UI contract

Claude maintains the Auto toggle and owns the versus card, turn strip and action bar. Proposed events:

- `fightStart {heroHaste, foeHaste, first}` once after creation; `first` is `hero`
  or `foe`. Core intro lasts 1.2 seconds manually, 0.6 in Auto. UI mirrors it;
  no acknowledgement dependency or indefinite UI wait. Reduced motion changes visuals.
- `turn {who,n}` after start-of-turn effects, before accepting input. `n` begins
  at 1 and counts every actor turn, including skipped turns.
- `parryWindow {opensAt,closesAt}` when the enemy attack is scheduled. Both are
  fight-local simulation seconds, never epoch milliseconds; core validates input.
- `fightEnd` exactly once on victory, defeat or abandonment; cancel pending actions.

Expose a snapshot with the same clock, phase, Auto state, foe identity, dodge bounds,
next actor and cooldowns labelled as turns. Simulation clock pauses with gameplay;
manual thinking never advances effects. UI enables hero actions only on the hero
turn and defense only for the scheduled enemy attack. Intro durations and contract
need approval before integration.

## Offline, evidence and expansion

Sample the same Auto resolver with seeded RNG in reward-free scratch state,
including intro, recovery, counter and respawn time. Never mutate live state,
consume live RNG or emit reward events while sampling. Apply resulting rates once
in the prototype `awayBase` branch and return before legacy combat accounting.
Keep explicit offline bonuses; remove the legacy away-rate penalty for this mode.
Emit `awayKills` once, never both replayed kill rewards and aggregate rewards.
Preserve fractional kills/Essence and stable sampling inputs across split sessions;
otherwise many short claims change yield. Existing caps and noncombat away hooks stay.

Measure fixed early hero/gear profiles and seeds: legacy, turn Auto, scripted hand
play and away. Report kills/hour, generated and stored Essence/hour, and deaths.
Set Essence per kill from legacy generated Essence/hour divided by turn-Auto
kills/hour. Verify split-session accounting and exactly-once rewards. Expand beyond
zone 1 only after engine checks, Claude's UI, owner playtest and rate sign-off;
C19/C25/full offline parity follow their queue gates.

## Permission needed before implementation

Request narrow exceptions for live `50-sim.js` routing (away branch already assigned),
`55-party.js` legacy auto-tap/effect suppression and `tools/sim.mjs` turn policy/reports.
Use existing shared state/check extension points. No shell/stage edits, crafting-stat
rename or profile system in C20. Claude must approve these boundaries, provisional
values, cooldown/training semantics and event timing before build work starts.

