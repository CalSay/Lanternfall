# walk-presses-cover: the gold cover on the first-hour walk

Seeds 1-3 (Wren, Tobin, Pip), 1280x720, 60 game minutes each, every run to minute 60. Three runs a seed: the cover off, `--cover all`
(every short upgrade it can pay, cheapest first), and `--cover 1` (only when the free route, gathering then refining, would take
over 1 game minute). `ECON.coverFoes` is 9. Gathering is Mining / Woodcutting / Foraging; stations are Smithing / Woodcraft /
Tailoring / Enchanting. "Longest free route" is the longest the bot's estimate gave for any cover offer it could pay.

| Seed | Cover | Unspent gold | Last spend | Covered units | Refine orders | Gathering | Stations | Longest free route (min) |
|---|---|---|---|---|---|---|---|---|
| 1 Wren | off | 29% | 37:35 | 0 of 92 (0%) | 10 | 8 / 8 / 6 | 1 / 14 / 3 / 1 | - |
| 1 Wren | covers all | 2% | 52:36 | 41 of 98 (42%) | 3 | 8 / 8 / 7 | 1 / 14 / 7 / 3 | 1.2 |
| 1 Wren | covers over 1 min | 29% | 37:35 | 0 of 92 (0%) | 10 | 8 / 8 / 6 | 1 / 14 / 3 / 1 | 0.8 |
| 2 Tobin | off | 42% | 32:32 | 0 of 83 (0%) | 8 | 7 / 8 / 5 | 9 / 12 / 1 / 1 | - |
| 2 Tobin | covers all | 1% | 59:27 | 57 of 119 (48%) | 1 | 8 / 8 / 5 | 11 / 13 / 1 / 1 | 1.5 |
| 2 Tobin | covers over 1 min | 42% | 32:32 | 0 of 83 (0%) | 8 | 7 / 8 / 5 | 9 / 12 / 1 / 1 | 0.9 |
| 3 Pip | off | 5% | 57:41 | 0 of 126 (0%) | 5 | 11 / 11 / 7 | 2 / 12 / 3 / 9 | - |
| 3 Pip | covers all | 1% | 55:17 | 97 of 104 (93%) | 1 | 6 / 8 / 6 | 1 / 8 / 8 / 5 | 1.8 |
| 3 Pip | covers over 1 min | 9% | 47:49 | 8 of 101 (8%) | 5 | 8 / 13 / 7 | 2 / 12 / 3 / 7 | 1.1 |

## Against the ruling's measures (autopilot/rulings/2026-10-08-gold-covers-material.md)

1. Gold binds (unspent under 60%, a spend after minute 40). Covers all meets both on every seed (1-2% unspent, last spend 52:36 to
   59:27). With the cover off, unspent is already under 60% (29%, 42%, 5%), but seeds 1 and 2 make no spend after minute 40.
2. Gathering stays the main path (a refine order, covered units at most half). Covers all: seed 1 42% and seed 2 48% pass; seed 3
   (Pip) covers 93% and fails. Every run makes at least one refine order, but covering cuts them from 10/8/5 to 3/1/1.
3. Skills do not hollow out (Mining, Woodcutting, Foraging within 2 of the cover-off run). Covers all: seeds 1 and 2 pass; seed 3
   fails (Mining -5, Woodcutting -3).

The free route is short in the first hour: no offer the bot could pay took over 1.8 minutes, so a player who covers only slow
orders (over 2 minutes) never covers, and over 1 minute covers twice (Pip only, 8 of 101 units). The "covers all" player is the
case the balance pass has to price.

## How the numbers were made

Each run's report has a "## Gold cover" section (the cover runs print the cover-off row of the same seed under their own, from
`--cover-base`). In seed 3's covers-all run one press met the zone 6 Lantern Cache card coming up over Hero > Gear; the bot
pressed again 17 s later and covered it. The walk now counts such a press as neither a try nor a finding (the game played the
same; only that one report line goes).
