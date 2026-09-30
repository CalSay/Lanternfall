# C20 zone-one turn prototype: stationary rate evidence

Engine commit: `a8550b5` (based on Claude checkpoint `f46c990`). Reproduce with bundled Node 24:
`node tools/sim.mjs --report turns --hours 1 --seeds 3 --seed 1 --json rates.json`.
The report ran 48 real-core cases (four profiles, four modes, seeds 1–3), each for one simulated hour. The early Wren fixture is `tests/fixtures/save-early.json`, explicitly moved from zone 8 to zone 1. No purchases or boss progression occur. XP and mastery gains are frozen after each kill, and Deed bonuses are off, so each case measures a fixed combat profile rather than a normal advancing playthrough. Equipment and training remain active. Generated Essence counts kill rewards before storage caps; stored Essence is the actual inventory change. All rows had zero deaths and generated equalled stored Essence in this run.

| Profile | Mode | Kills/hour | Generated Essence/hour | Stored Essence/hour |
|---|---|---:|---:|---:|
| Fresh Wren | Legacy Auto | 669.33 | 169.00 | 169.00 |
| Fresh Wren | Turn Auto | 639.33 | 166.00 | 166.00 |
| Fresh Wren | Turn hand | 1028.00 | 268.00 | 268.00 |
| Fresh Wren | Turn away | 633.00 | 171.00 | 171.00 |
| Fresh Tobin | Legacy Auto | 597.67 | 154.33 | 154.33 |
| Fresh Tobin | Turn Auto | 914.00 | 236.00 | 236.00 |
| Fresh Tobin | Turn hand | 984.67 | 247.33 | 247.33 |
| Fresh Tobin | Turn away | 917.00 | 232.00 | 232.00 |
| Fresh Pip | Legacy Auto | 874.67 | 218.00 | 218.00 |
| Fresh Pip | Turn Auto | 781.33 | 198.00 | 198.00 |
| Fresh Pip | Turn hand | 1218.33 | 300.00 | 300.00 |
| Fresh Pip | Turn away | 784.00 | 204.00 | 204.00 |
| Early Wren | Legacy Auto | 3672.00 | 975.00 | 975.00 |
| Early Wren | Turn Auto | 3428.00 | 934.67 | 934.67 |
| Early Wren | Turn hand | 1894.00 | 515.33 | 515.33 |
| Early Wren | Turn away | 3472.00 | 904.00 | 904.00 |

Hand is an **idealized upper-bound policy**: a scripted 0.2-second response to each hero turn, first-ready equipped ability, and perfectly timed parry at the middle of every offered window. It does not predict average human play. The early fixture's 1.2-second manual intro versus 0.6-second Auto intro dominates its one-hit fights; changing that timing needs design sign-off. Away retains the existing offline boost (1.00 for fresh heroes; 1.06 for early Wren), and reports actual `awayGains` rewards, while the separately stored scratch sample remains reward-free. Normalize early away by 1.06 before comparing it with live Auto.

Turn Auto versus legacy Auto changes kills/hour by roughly −4% Wren, +53% Tobin, −11% Pip, and −7% early Wren. Hand versus turn Auto changes kills/hour by roughly +61%, +8%, +56%, and −45%, respectively; the requested 25–40% hand premium is not met across profiles. One global Essence multiplier cannot restore legacy hourly income across the four profiles. Keep `essenceX=1` and the current timing/HP/attack knobs until Claude and the owner choose the tradeoff. A per-profile target computed as legacy generated Essence divided by Turn Auto kills would be approximately 0.264, 0.169, 0.279, and 0.284 Essence per kill, respectively; those are diagnostics, not proposed balance values.

The shared live/scratch resolver includes the existing starter attack riders, Ranger's 25% Focus mark and marked-target crit bonus, Warrior's deterministic 10% class block, Grit's damage cut, hero armour, per-second regeneration, training and gear attack/crit/cooldown modifiers, and the 15% heal on pack clear. Focus Auto applies its existing half-strength mark. Early Wren's gear has attack, crit and pierce; it has no block, ward, heal or echo, and zone-one Slimes are unarmoured, so pierce does not affect these measured rates. This is still a narrow prototype: constellation/Deepwell passives, typed enemy resistances, shields/overheal, and future elite or boss effects are not yet represented by the scalar adapter. Its rates should not be extrapolated to those systems or beyond zone one. Focused checks cover off-switch fallback, event order, turn cadence, defense, shared passive math (including a multi-hit live/scratch class-block case), away sample purity/cache, and split-session rewards after save/reload. Full-suite status is recorded in the C20 handoff.
