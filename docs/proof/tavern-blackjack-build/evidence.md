# Tavern Blackjack: economy evidence (spec section 12)

`node tools/sim.mjs --report econ --days 14 --seed N --blackjack 1` (Warden; idle, normal and active profiles). The
table player is the casual one from the spec: 30 hands a day at the highest bet, hit to 17, never double. The table
draws from its own seeded random stream, so the runs with and without it share every other random number.

| Highest bet | Seed | BJ-a loss share (idle / normal / active), p90 | BJ-b EC5 normal | BJ-c zone at day 14 | d, e |
|---|---|---|---|---|---|
| 0.2 H | 1 | 1.5-1.7% | FAIL 62 -> 85 | FAIL active 33 -> 35 | pass |
| 0.2 H | 2 | FAIL 2.15% normal, 2.14% active, p90 1.00 H | pass | pass | pass |
| 0.2 H | 3 | FAIL 2.10 / 2.69 / 2.23%, p90 1.00 H | FAIL 49 -> 82 | pass | pass |
| 0.15 H | 1 | 1.26 / 1.28 / 1.06%, p90 0.75 H | FAIL 62 -> 49 | FAIL active 33 -> 35 | pass |
| **0.12 H** | 1 | 1.00 / 0.90 / 0.98%, p90 0.60 H | FAIL 62 -> 49 | FAIL active 33 -> 28 | pass |
| **0.12 H** | 2 | 1.18 / 1.20 / 1.25%, p90 0.60 H | pass 82 -> 79 | pass | pass |
| **0.12 H** | 3 | 1.26 / 1.70 / 1.36%, p90 0.60 H | FAIL 49 -> 77 | FAIL normal 28 -> 30 | pass |

**Ruling (judge, 2026-10-10).** Ship 0.12 price-hours. BJ-a, the measure that follows the bet, passes on all three
seeds at 0.12. BJ-b and BJ-c flip direction from seed to seed (EC5 up or down; the zone rises while the table only
takes gold) and do not shrink as the bet is cut, and the baseline EC5 alone spans 49% to 82% across seeds against a
5-point bar. They are recorded as noise, not a block, until they are measured on several seeds (follow-up). If a
multi-seed run shows a steady lift or drop, the table really moves the economy and this ruling reopens.
Veto phrase: "Raise the table's top bet back to 0.2."
