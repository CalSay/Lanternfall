# Ability validation plan and provisional arithmetic

Design review only, 1 October 2026. Companion to `hero-abilities.md` on `codex/c19-abilities`; no runtime changes or executed balance simulations. All estimates below are arithmetic, not measured combat results. Owner direction: base critical multiplier 2.5. Proposed, not approved: total critical multiplier cap 3.0; manual/Auto ability multipliers both 1.0; the listed coefficients, Focus rule, status limits and branches.

## Reconciled design contract

The core specification now resolves the review findings: one authoritative 2/4/4/3/1 unlock map; new engine work identified separately from existing support; exact art requirements in the linked art brief; per-cast proc defaults with explicit multi-arrow exceptions; independent status-power ownership; pre-cast resource snapshots; and deterministic Auto eligibility before slot priority. See “Resolution order and exact interaction rules” in [Hero abilities](hero-abilities.md).

Numbers and proposed caps remain subject to owner/Claude sign-off. These written resolutions do not establish that the runtime implements them. The scenarios below are acceptance criteria for the later engine change.

## Numeric sanity, not balance results

Assume equal independently trained U, no armour/resistance/gear damage/branches, no hand multiplier, and the stated condition. An ordinary 8% crit chance gives expected direct multiplier `1 + .08*(2.5-1) = 1.12`. This 8% is an illustrative existing baseline, not a new Wren crit-stat decision. Guaranteed crit is exactly one critical event.

| Move | At base critical rules | At proposed maximum crit multiplier |
|---|---|---|
| Deadeye 1.8U, Mark consumed after hit | guaranteed `1.8*1.2*2.5 = 5.4U` | `6.48U` at 3.0 |
| Riposte 1.6U | guaranteed `1.6*2.5 = 4.0U` | `4.8U` at 3.0 |
| Heavy Strike, Exposed | raw `2*1.25 = 2.5U`; illustrative mean 2.8U | critical hit 7.5U |
| Hammerfall, 10 Grit + Exposed | raw `(1.4+2.5)*1.25 = 4.875U`; mean 5.46U | critical hit 14.625U |
| Final Echo, 5 Bleed + 3 Aim + Mark | raw `5.5*1.2 = 6.6U`; illustrative mean 8.877 U at 8% base +15% pre-spend Aim | critical hit 19.8U |
| Lanternburst, 5 Embers + Burn | raw `(2+3)*1.25 = 6.25U`; mean 7.0U | critical hit 18.75U |
| Ignite, two ordinary Burn ticks left | raw base .8U plus `(.4*2)*1.25 = 1.0U` derived; illustrative mean 1.896U | only base can crit: 3.4U total |

Deadeye 1.8U and Riposte 1.6U are reasonable provisional test values with these conditions and the 2.5 baseline. Additional critical damage may increase the multiplier above 2.5 only under an explicit mapping; suggested additive percentage points up to total 3.0 is still an approval item. Keen shares that total cap, not another multiplier. Do not use these arithmetic comparisons as DPS comparisons against Attack: Attack has a separate training curve, and setups consume turns and slots.

At Focus 30%, base cooldowns 2/3/4/5/6/7/8 become 2/3/3/4/5/5/6. CD3 gains nothing from Focus alone under ceil rounding. A manual refund can make CD2 available on the next hero action; this is not an extra action. Validate short-CD saturation explicitly.

## Required executable scenarios when built

- Timing: cast CD4 on H1, ready H5; one timed parry advances readiness once, Auto parry never refunds. A skipped foe opportunity and waiting do not advance the finisher's hero counter. Zero-damage buffs consume exactly one action.
- Status boundaries: trace every application/tick/expiry through H1/F1/H2/F2. Bash's Exposed survives the skip; offensive buffs affect the promised number of subsequent actions. Guard/Ward count skipped opportunities as specified. Freeze and Stun share the same control lock; bosses receive exact stagger increments without an illicit second skip.
- Three-slot builds: run every sequence in `ability-tree-details.md` at zero resources, without undisclosed skills or branches. Trace Burn through Fireball–Wildfire–Eye and verify at least the advertised payoff remains. Test failed parry, missing Burn and insufficient resources in Auto.
- Damage: independently verify crit, Mark, Exposed, armour, resistance, Status Power and resource spending once. Final Echo uses its pre-spend Aim for the crit roll. Test multi-hit death on the first arrow; remaining hits, riders and rewards never reach a new foe.
- Loops: maximum Focus, all refund sources, control lock, weaker-status refresh, strongest Ward and each branch. Last Stand cannot reactivate in the same fight or double-counter with parry; retaliation/DoT/Curse cannot recurse. Confirm all caps under unequal ability training.
- Persistence: refresh loadout only between fights; reset resources/statuses/opening counters without free healing. Preserve each hero's independent training/unlocks. Abandonment and reload cannot manufacture expiry heals or rewards.
- Parity and pacing: same seed/profile/loadout through live Auto and scratch Auto produces the same decisions and reward totals, including split offline sessions. Measure beginner/midgame/max-training builds, short mobs/long bosses, manual accuracy bands and Auto. Report kills, damage, deaths, Essence and gold per hour; do not claim the 25–40% manual target until measured.
