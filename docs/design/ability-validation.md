# Ability validation plan and provisional arithmetic

Design only, 1 October 2026; follow-up to checkpoint `ff3795483`. Read with `hero-abilities.md` binding section 2a, `enemies-c22.md` and `e33-reference.md`. No runtime implementation or balance simulation is claimed. E33 figures marked estimated/unverified in the reference remain external inspiration, not Lanternfall acceptance values.

Latest owner override: **combat is active only. There is no idle fighting or offline combat progression.** The player selects every hero action and responds to each enemy hit. Other owner directions include Speed-driven turn frequency, six slot-consuming passives, twelve timed abilities, one cooldown refund per successful timed parry, and a counter only after every hit of the completed move was parried. Base crit is 2.5. Proposed details still need sign-off: total crit cap 3.0, normalized active ability multiplier 1.0, Focus rounding, rates, coefficients, windows, branches and timeline implementation. This plan follows the coordinator's revised gauge/cap and Last Stand contract; it must stay synchronized with the main specification.

## Timeline and clock acceptance

Use two gauges with threshold100, preserve the non-acting gauge, reset the acting gauge, and advance virtual timeline time only to the next eligible ready actor. A capped actor waits at100 until its opponent is ready. Hero wins ready ties unless capped. The hero and ordinary foe may take at most2 consecutive opportunities; a boss may take3. Speed modifiers clamp to50–200% of the actor's gear-adjusted base; debuffs on bosses have half effect before the clamp. These are virtual scheduling units, not animation seconds.

| Case | Required result |
|---|---|
| Equal Speed10 | Hero/foe alternate from a hero-won tie; neither starves. Both gauges ready at one timestamp is not an extra action. |
| Speed40:30 | Long-run uncapped ratio approaches4:3; count opportunities over many cycles, not just the opener. |
| Hero20:foe10 | Approximately2:1, never three consecutive hero opportunities. |
| Extreme ordinary ratio100:10 | Cap binds: at most2:1 opportunity throughput. Ready actor waits without banking overflow or creating a busy loop. Reverse sides too. |
| Boss100:hero10 | Boss gets at most3 consecutive opportunities; hero still gets a turn. Hero remains capped at2 against a slow boss. |
| Mid-fight Speed change | Preserve accumulated gauge; recompute future time-to-ready. Clamp and boss half-debuff apply once. No retroactive action or second cooldown decrement. |
| Player waits / timing prompt / long animation | Real elapsed time does not silently fill gauges, expire statuses or advance opening counters; the same recorded player inputs produce the same opportunity order. |

Accepted Stun/Freeze empties the ordinary foe gauge and queues one skipped opportunity at its next readiness. The shared lock lasts3 foe opportunities including skips. Verify the accepted application cannot both skip immediately and skip again later; a rejected reapplication must not empty gauge again. A skipped opportunity advances the appropriate status/lock clocks but makes no attack, defence roll or counter. Streak caps count opportunities, including skips, so the count is deterministic rather than dependent on damage dealt.

Boss control contributes the specified stagger instead; an accepted control contribution interrupts a pending charge without granting an additional free full-stagger skip. Test the case where the same contribution also reaches100 stagger: one interruption and at most one queued skip, never two. A charged release is ineligible until at least one hero opportunity has resolved since its charge began. Test a ready boss with two or three consecutive opportunities: it must hold that opportunity and schedule the hero without aging clocks, never bypass this grace or resolve a zero-time retry loop. The grace offers a real opportunity, not a guaranteed successful interruption; an existing control lock can still reject the attempt.

Cooldown4 cast H1 is ready H5 without refunds, irrespective of the number of foe opportunities between. Only own hero starts decrement normal cooldowns. Finishers open at the third hero opportunity, not the third overall actor event or third hit. Offensive buffs count subsequent hero actions; defensive effects count foe opportunities; foe DoT ticks at foe starts including skips. Trace both H-H-F and H-F-F-H schedules. Burn can expire before the advertised payoff against a faster foe, so every written combo must state its Speed assumptions rather than promising strict alternation.

## Per-hit defence and complete-move counters

Every actual hit gets its own choice and timing result. P-P-P refunds3 from every running cooldown and produces one counter after the third hit. P-D-P refunds2, produces no counter and avoids all three hits. P-Miss-P refunds2, takes only the failed hit and produces no counter. Only actual successful player timing earns these rewards; no later miss revokes an earlier refund. Floor remaining cooldowns at0; the cast-time minimum2 is not a minimum remaining cooldown.

A two-move enemy turn cycle evaluates each move separately: perfectly parrying move1 earns its counter even if move2 is dodged. Interrupting/cancelling a move before all authored hits resolve is not an all-parried completion. Death stops the sequence, further refunds and counters. DoT, status pulses, feints and skipped opportunities are not extra parryable hits. Define defence windows so one press cannot accidentally satisfy two nearby hits or both parry and dodge one hit.

All enhancements preserve the player's two choices; a parry-only incentive such as Brace is legal and need not improve Dodge. Pinned widens both across its next complete move. Test separate full-width caps0.35s parry/0.50s dodge, including normal0.18/0.35 windows, and explicitly resolve overlapping bonuses without double multiplication. Last Stand keeps its two-opportunity HP floor and natural-expiry heal, doubles the allowed parry window and completed counter, and grants no automatic retaliation. A mixed sequence cannot receive its completed-counter bonus. Once-per-fight remains independent of refunded cooldown.

Illustrative player skill bands, using independently successful parry attempts only to calculate arithmetic expectations:

| Per-hit player success | Expected refunds from a 7-hit move | Complete counter, 3 hits | Complete counter, 7 hits |
|---|---:|---:|---:|
|50%|3.5|12.5%|0.78125%|
|80%|5.6|51.2%|20.97%|
|95%|6.65|85.74%|69.83%|

These are not automatic defence probabilities. Runtime defence is determined by the player's actual choice and timestamp. Real errors can be correlated; replay authored input traces for successful parries, deliberate dodges, early/late presses and missing inputs. Measure skill bands from those results, never by granting random parries. Include mixed parry/dodge traces: successful dodges avoid damage but never refund cooldowns or qualify the move for a counter.

C22's proposed normal move budget is 10–20% max HP for the whole undefended move, not for every hit. Two consecutive moves therefore threaten 20–40% before player defence and other mitigation. Validate survivability and readable recovery opportunities for beginner, intermediate and expert input traces through full gauntlets; there is no idle-survival target.

## Damage and twelve timed-ability checks

Equal independently trained U, no mitigation/branches, ability multiplier1.0. Illustrative ordinary crit chance8% gives expected multiplier1.12 at crit2.5; pre-spend Aim can change Wren's chance. Attack uses its own trained scale A, not U. Damage already stored by a status cannot crit again.

| Move / state | Good result at crit2.5 | Perfect acceptance |
|---|---|---|
| A1 Power Shot |1.8U; mean2.016U at8% crit|Exactly one sure crit:4.5U, not a second crit multiplier; Aim gain once.|
| A5 Volley |Three0.7U arrows; mean2.352U total|Each Perfect arrow grants1 Aim, capped3; gains do not raise later arrows' snapshotted crit chance.|
| W3 Deadeye, Mark |Sure crit5.4U;6.48U at proposed crit cap3|Mark survives; it is neither consumed/recreated twice nor amplified twice.|
| W6 Moonlit Volley |Five0.5U arrows; named marked-target Bleed per arrow|Perfect arrow adds1 Bleed even unmarked, and adds to the marked-target rider (2 for a marked Perfect arrow), before cap5.|
| M1 Heavy Strike + Exposed |Raw2.5U; mean2.8U|Perfect+50% gives raw3.75U with Exposed; consumed once.|
| T1 Shield Bash |1.6U plus control/Guard|Guard lasts one extra foe opportunity; no extra action, skip or control duration.|
| T5 Hammerfall,10 Grit + Exposed |Raw4.875U; mean5.46U|Damage uses the full original spend; refund floor(spent Grit/2) after damage, including odd spends. Never recalculate that hit from the reduced net cost.|
| T6 Shield Throw |1.4U plus conditional control|Assign Focus/Hallowed-adjusted cooldown then subtract2 for the catch, minimum1; no overwritten refund or negative CD.|
| C2 Frost Shard |1.1U and2 Chill|Perfect adds third Chill and attempts Freeze once; control lock/boss rules still apply.|
| P1 Fireball |1.8U and3 Burn ticks|Perfect grants one extra tick within cap4. A split-hit branch checks each hit; apply the extension once if any hit is Perfect, never once per Perfect hit.|
| P3 Ignite,2 ordinary ticks left |Mean `.8*1.12 + (.4*2)*1.25 = 1.896U`|Use derived multiplier2.0: mean2.496U. The old1.5 comparison is obsolete; only base.8U can crit.|
| P8 Lanternburst,5 Embers + Burn |Raw6.25U; mean7.0U|Damage uses the full original spend; refund2 Embers after resolution, never multiplying that hit again.|

Final Echo with5 Bleed,3 Aim and Mark: raw6.6U, illustrative mean8.877U at8% base+15% Aim; capped critical hit19.8U at proposed3.0. Riposte1.6U remains a4.0U sure crit at2.5,4.8U at proposed3.0. Deadeye1.8U/Riposte1.6U remain provisional coefficients, not measured recommendations for every training ratio.

Timing windows are total widths0.12s Perfect and0.30s Good, not plus/minus values. Volley, Moonlit Volley and a split-hit Fireball branch check each hit; ordinary single-hit Fireball checks once. Test exact boundaries, early/late/missing/duplicate inputs, and each arrow independently. Miss multiplies that timed hit's direct result by0.7, including Ignite's derived Burn component, grants no Perfect bonus and retains mandatory control/status/resource riders. The illustrative two-tick Ignite Miss mean is1.896*0.7=1.3272U; its consumed Burn is not restored and its separate future DoT is not independently weakened. Timing grades come only from player input. A missing timing press resolves Miss for an already committed active cast; it never selects or begins a new action. No input may cross into the next cast or enemy defence phase.

Perfect Power Shot is 2.23 times its illustrative Good expected hit before refunds. Report damage and fight-length differences across player timing/defence skill bands; no active-versus-idle ratio or idle damage baseline remains.

## Passive and loadout acceptance

Passives occupy slots and have no pressable cast or cooldown. Test 0/1/2 passives, all slot orders and temporarily ineligible active skills. Attack remains available for the player to select; no skill or Attack fires as a fallback without input. Unequipping/respeccing between fights removes passive state. Hallowed passives change approved numbers only, not secretly add another active ability.

- Twin Shot: two0.55A direct hits total1.10A; independent crits, Attack Aim once. Explicit Attack on-hit effects trigger per arrow; normal Attack Aim and Night Hunter remain once per Attack action. Test the named exception list rather than applying all generic procs twice. Night Hunter adds one additional Aim per marked Attack, not per arrow unless explicitly changed.
- Momentum: first Attack gains10%, fifth reaches50%; test reset on an active ability and no reset from being hit, parrying, countering or merely owning another passive.
- Afterglow: one direct spell arms one next-Attack token with a two-hero-action lifetime and stored damage type; refresh never stacks+50%. Consumption once, no counter/DoT rearming. The obsolete idle Attack penalty must not leak into the active Attack calculation.
- Bulwark: each parried hit gives base1 Grit plus passive1, capped10. A7-hit perfect defence therefore reaches cap, but only its completed move grants one1.25x counter. No partial-move counter.
- Ember Heart: each actual Burn tick gives1 Ember once per foe opportunity, not per status effect or animation frame. Specify whether a lethal Burn tick grants the resource before fight reset; it must never survive into the next foe.

## Active input, pause and absence acceptance

- At a ready hero opportunity, waiting without input never launches Attack, casts the first ready ability, advances an opportunity or earns rewards. Check empty slots, all cooldowns ready, only passives equipped, old saved combat preferences and formerly scheduled fallback timers. Defeat, victory, zone entry and returning focus must not silently restart player attacks.
- During a committed cast or enemy move while actively playing, a missing timing/defence input is a Miss, not a granted Good grade, random dodge or random parry. Passive procs still require their documented initiating player action or actual damage event; none supplies an independent repeating attack.
- Backgrounding, pausing or losing the active play surface freezes combat scheduling and its remaining presentation windows. On deliberate resume, continue from the frozen state without catching up elapsed wall time, replaying queued hits or shrinking the remaining response window. Clear buffered input so one held or stale press cannot satisfy both sides of a pause or multiple prompts. Pausing must not refresh cooldowns, refill resources, extend a buff's counted opportunities or trigger expiry heals.
- Test hidden-tab intervals, application closure, network disconnection and reload with a saved fighting activity. Return grants **zero offline combat kills, combat XP, gold, Essence, loot, encounter credit or combat-triggered progression**. No retrospective combat damage, counters, DoT ticks or refunds run to simulate absence. Assert combat counters and inventories directly, not just the absence of a reward modal.
- Resolve the pause/kill boundary once: a defeat or victory already committed before suspension may be persisted once; resuming/reloading cannot duplicate its rewards. An unresolved future hit cannot become a completed kill during absence. Reload may use the documented encounter cancellation rule, but never manufacture an expiry heal or a fresh-fight reward.
- Test one long absence and several split absences: both yield zero combat gains. Gathering, Hands and other noncombat offline systems are outside this combat removal; do not accidentally delete or count their legitimate gains as combat rewards. Use an isolated combat fixture when asserting zero inventories, plus a separate mixed-activity attribution case.

## Remaining implementation acceptance

At Focus30%, CD2/3/4/5/6/7/8 become2/3/3/4/5/5/6. A3-hit perfect defence can clear an adjustedCD4 together with the next hero start; test repeated finishers after their opening gate, stacked catch refunds and control loops. More enemy hits deliberately give more cooldown fuel; do not silently cap refunds per move to recover old balance.

Run every three-slot build under equal/faster/slower Speed, Good/Perfect/Miss, boss control and all passive branches. Confirm independent ability-training snapshots, Wildfire growth caps, Ignite forecasting, Mark/Exposed consumption, Keen, Ward, armour/resistance and crit exactly once. Stop multi-hit casts on death with one reward. A test-only deterministic replay of explicit player action/timing inputs must match live resolution for the same seed, profile, Speed and enemy hit pattern. Such replay is a validation fixture, not an autonomous combat chooser or offline reward model.

Measure early/mid/max-training loads across normal3–5, elite6–8 and elder10–15 hero-action targets as proposed in C22. Report action counts, virtual timeline order, presentation seconds, refunds, counters, deaths and kills/Essence/gold per hour separately. Preserve hero training/unlocks and reset temporary states without free healing. No runtime tests or gameplay source changes accompany this design document.
