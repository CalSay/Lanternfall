# C20: turn-based combat prototype

Status: the default-off zone-one engine is implemented on the C20 branch and
[accepted by Claude for owner play](https://github.com/CalSay/Lanternfall/issues/21#issuecomment-5919770467),
pending the full functional gate and handoff. The original proposal began at `badf298`;
the current branch is based on `3c0208e`. [Owner decisions](combat-turns.md) remain authoritative.
Approved decisions: [engine scope](https://github.com/CalSay/Lanternfall/issues/21#issuecomment-5918334844), [owner clarifications](https://github.com/CalSay/Lanternfall/issues/21#issuecomment-5918395871), and [live routing](https://github.com/CalSay/Lanternfall/issues/21#issuecomment-5918537087).

## Scope and compatibility

Default-off switch, zone 1 normal fights only, the three starters, one living foe.
Prototype constants stay in owned `59` files. The owner superseded the earlier
4–6-turn opening target with about three basic hits for the first enemies.
Foe HP uses `TURN_TUNE.foeHpX=1.6`; prototype-only effective hero damage values
match Wren 1.45, Tobin 1.2 and Pip 1.26 without changing default-off legacy damage.
An ability-free noncritical core check confirms three manual and three Auto basic
hits for all three fresh starters. Normal fight hits vary with abilities, criticals,
counters and burns; the [three-seed evidence](../coord/c20-rate-evidence.md) records them.
The one-enemy profile disables pack arrivals, adds and independent attack loops
in this mode. Bosses,
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
counters and intro cards never decrement cooldowns. **Cooldowns reset every fight** (owner, 2026-10-01, replacing the earlier carry rule): each
foe starts with every action ready, in live play and in the sampled offline rate. Runtime bases:

| Action | Turns |
|---|---:|
| Attack | 1 |
| Echo Shot | 5 |
| Shield Bash | 4 |
| Fireball | 5 |

Preserve training and existing gear cooldown benefits by proposing:
`ceil(baseTurns * trainAbCd(id, baseSeconds) / baseSeconds * mod('abilityCd'))`,
minimum 1. Claude approved this conversion. Gear `haste` currently means
-% ability cooldown; never repurpose it as initiative. Use a separate initiative
accessor with prototype values until the stat tree and gear decision are approved.

Give supported buffs, patches and statuses explicit turn durations. DoT resolves
once at the affected actor's turn start; duration decrements after that actor's
turn, with newly applied effects protected from immediate expiry. A patch reapplies
at a defined turn boundary, never per frame. Stop legacy cooldown, regeneration,
patch and status ticks during prototype fights; convert required effects explicitly.
Wind-ups and presentation retain seconds. Exact effect durations await tuning.

## Defense and Auto

The owner approved parry in the final 0.18 seconds before impact and dodge in
the final 0.35. One defense attempt per enemy attack prevents mashing.
Timed parry blocks, immediately refunds one turn from every cooldown including
Attack, and delivers one guaranteed-critical counter before the enemy turn ends.
Keep current counter strength initially; measure before tuning. With Attack C=1,
its refund makes it ready early but never grants another action. Dodge blocks
without counter or refund.

Consume Claude's existing `S.solo.auto` (default true), `soloAuto()` and
`soloSetAuto(v)`; add no second Auto-state field. The UI toggle changes immediately;
only engine scheduling adopts its value at the next actor boundary. A waiting,
uncommitted hero action is a boundary: enabling Auto resumes immediately. A committed
enemy wind-up retains its selected mode. Preserve
`soloActive() = !auto && !pageHidden` and the existing `soloGoIdle()`/`soloWake()`
hidden-page handling; combat presses never flip Auto. Tests use `soloSetAuto(false)`
for manual play. Auto uses the first ready equipped ability in bar order, otherwise
Attack. Per enemy attack, roll parry at 10%, then dodge at 25% only on failure:
32.5% combined avoidance. Caps are 30%/50%. Auto parry counters without refund (owner confirmed); `autoParryCounters` defaults on. Enchantments improve both Auto odds and manual windows;
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

Expose a snapshot with the same clock as `now`, phase, Auto state, foe identity, dodge bounds,
next actor and cooldowns labelled as turns. Simulation clock pauses with gameplay;
manual thinking never advances effects. UI enables hero actions only on the hero
turn and defense only for the scheduled enemy attack. The intro durations and contract are approved; abandonment must also emit `fightEnd`.

## Offline, evidence and expansion

Sample the same Auto resolver with seeded RNG in reward-free scratch state,
including intro, recovery, counter and respawn time. Never mutate live state,
consume live RNG or emit reward events while sampling. Apply resulting rates once
in the prototype `awayBase` branch and return before legacy combat accounting.
Keep explicit offline bonuses; remove the legacy away-rate penalty for this mode.
Emit `awayKills` once, never both replayed kill rewards and aggregate rewards.
Preserve fractional kills/Essence and stable sampling inputs across split sessions;
otherwise many short claims change yield. Existing caps and noncombat away hooks stay.

The [fixed-profile three-seed report](../coord/c20-rate-evidence.md) compares
legacy Auto, turn Auto, perfect and realistic scripted hand play, and away. It
reports kills, generated and stored Essence, direct hits, hero turns, fight seconds
and deaths. No single Essence multiplier places all three fresh starters within
±10% of legacy hourly income. Claude accepted `essenceX=1` for the owner playtest;
Essence, hand advantage and pace are explicit post-play follow-ups, not hidden
retunes. Split-session accounting and exactly-once rewards have core checks.
Expand beyond zone 1 only after the functional gate, Claude's UI, owner playtest
and rate sign-off;
C19/C25/full offline parity follow their queue gates.

## Approved boundaries

Claude approved narrow live and away routing in `50-sim.js`, legacy auto-tap/effect
suppression in `55-party.js`, and turn policy/reports in `tools/sim.mjs`. The switch-off
and unsupported-scope paths must retain their existing behavior, pinned by checks.
Use existing shared state/check extension points. No shell/stage edits or profile
system in C20. Haste means initiative; keep the existing internal gear key unchanged.
Its proposed player-facing rename to Focus belongs with C19's initiative stat tree.
The owner must play the prototype before it expands beyond zone 1.
