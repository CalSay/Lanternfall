# C20 zone-one turn prototype: stationary rate evidence

Engine commit `1be5c40`, based on Claude checkpoint `3c0208e`. Reproduce with bundled Node 24:
`node tools/sim.mjs --report turns --hours 1 --seeds 3 --seed 1 --json rates.json`.
This ran 60 real-core cases: four profiles, five modes and seeds 1–3, one simulated hour each. The early Wren fixture (`tests/fixtures/save-early.json`) was moved from zone 8 to zone 1. XP/mastery gains and Deed bonuses were disabled to hold profiles fixed; equipment and training remained active. No purchases or boss progression occurred. All cases had zero deaths, and stored Essence equalled generated Essence. Rates below are three-seed means.

| Profile | Mode | Kills/h | Essence/h | Direct hits/fight | Hero turns/fight | Fight seconds |
|---|---|---:|---:|---:|---:|---:|
| Fresh Wren | Legacy Auto | 669.33 | 169.00 | — | — | — |
| Fresh Wren | Turn Auto | 1321.33 | 324.33 | 2.16 | 2.04 | 2.27 |
| Fresh Wren | Turn hand, perfect | 1350.67 | 333.00 | 1.67 | 1.00 | 2.20 |
| Fresh Wren | Turn hand, realistic | 1154.67 | 308.00 | 1.74 | 1.30 | 2.64 |
| Fresh Wren | Turn away | 1334.00 | 349.00 | 2.15 | 2.03 | 2.25 |
| Fresh Tobin | Legacy Auto | 597.67 | 154.33 | — | — | — |
| Fresh Tobin | Turn Auto | 933.00 | 250.33 | 3.38 | 3.22 | 3.41 |
| Fresh Tobin | Turn hand, perfect | 1096.00 | 263.67 | 2.34 | 1.45 | 2.83 |
| Fresh Tobin | Turn hand, realistic | 917.33 | 229.00 | 2.46 | 1.89 | 3.45 |
| Fresh Tobin | Turn away | 933.00 | 237.00 | 3.37 | 3.21 | 3.40 |
| Fresh Pip | Legacy Auto | 874.67 | 218.00 | — | — | — |
| Fresh Pip | Turn Auto | 960.67 | 241.67 | 2.85 | 2.66 | 3.30 |
| Fresh Pip | Turn hand, perfect | 1218.33 | 300.00 | 1.92 | 1.00 | 2.50 |
| Fresh Pip | Turn hand, realistic | 997.33 | 244.33 | 2.07 | 1.45 | 3.14 |
| Fresh Pip | Turn away | 964.00 | 241.00 | 2.86 | 2.67 | 3.31 |
| Early Wren | Legacy Auto | 3672.00 | 975.00 | — | — | — |
| Early Wren | Turn Auto | 3428.00 | 934.67 | 1.00 | 1.00 | 0.60 |
| Early Wren | Turn hand, perfect | 1894.00 | 515.33 | 1.00 | 1.00 | 1.40 |
| Early Wren | Turn hand, realistic | 1756.00 | 477.33 | 1.00 | 1.00 | 1.55 |
| Early Wren | Turn away | 3636.00 | 950.00 | 1.00 | 1.00 | 0.60 |

The owner's opening target is **about three basic hits**, and an ability-free, noncritical core probe confirms exactly three manual and three Auto basic attacks for each fresh starter. The fight table includes abilities, critical hits, parry counters and burns. “Direct hits” counts Attack, ability and counter damage, excluding burn ticks; one hero turn can therefore contain two hits. Normal Auto averages 2.16, 3.38 and 2.85 direct hits for Wren, Tobin and Pip. Ability cooldowns carry between normal foes and decrement only at hero-turn starts; they reset on hero/scope change or defeat. The separate turn-only damage ratios preserve the default-off legacy hero values.

Perfect hand is an idealized upper bound: 0.2-second action response and every parry timed correctly. The realistic scripted policy uses 0.35-second response and lands 60% of attempted parries. Against Turn Auto, perfect-hand kills/h gain +2%, +17% and +27% for fresh Wren, Tobin and Pip; realistic-hand changes are −13%, −2% and +4%. These miss the proposed +25–40% hand premium for most starters. Early Wren remains one-hit with trained gear, so the retained 1.2-second hand intro versus 0.6-second Auto intro dominates its rate; the owner's three-hit target applies to fresh first enemies, not every progressed character.

No single Essence multiplier gives all three fresh Turn Auto profiles within ±10% of their legacy Auto Essence/h. The feasible multiplier intervals are Wren **0.47–0.57**, Tobin **0.55–0.68**, Pip **0.81–0.99**; their intersection is empty. [Claude accepted the zone-one prototype](https://github.com/CalSay/Lanternfall/issues/21#issuecomment-5919770467) for owner play with `TURN_TUNE.essenceX` at 1; Essence, hand advantage and pace return after that playtest. Generated Essence means pre-cap rewards and stored means actual inventory change; both matched here. Away retains the existing offline boost (1.00 fresh; 1.06 early Wren). The early away row normalized by 1.06 is 3427.28 kills/h and 895.47 Essence/h versus live Auto 3428 and 934.67; kills now match after the scratch respawn timing correction, while seeded reward variation accounts for the remaining Essence difference. The raw away row includes the intended boost.

The shared live/scratch resolver includes starter attack riders, Ranger's Focus mark and marked crit, Warrior class block, Grit damage cut, hero armour, regeneration, gear and training modifiers, and pack-clear healing. Early Wren's gear has attack, crit and pierce; zone-one Slimes are unarmoured, so pierce is inert here. Constellation/Deepwell passives, typed resistances, shields/overheal and future elite/boss effects remain outside this zone-one prototype. Do not extrapolate these stationary rates to those systems. Focused checks cover default-off fallback, turn/event order, live/scratch class-block and respawn parity, lethal wipe reentrancy, cooldown carry, away sample purity/cache and split-session rewards after save/reload. Full-suite status belongs in the C20 handoff.
