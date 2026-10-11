# Tavern Blackjack over many seeds: BJ-a, BJ-b and BJ-c (card blackjack-odds-multiseed)

Method: the #387 evidence method (`docs/proof/tavern-blackjack-build/evidence.md`) unchanged, at the shipped top bet
(`BJ_TUNE.hiH: 0.12` in `src/js/57t-blackjack.js`), on integration head ca8254d2:
`node tools/sim.mjs --report econ --days 14 --seed N --blackjack 1` for seeds 1 to 12 (Warden; idle, normal and active
profiles; the casual player plays 30 hands a day at the top bet, hits to 17, never doubles, from the table's own seeded
stream). Raw outputs: `raw/s<N>.txt`. The by-seed and totals tables: `node docs/proof/blackjack-odds-multiseed/tally.mjs docs/proof/blackjack-odds-multiseed/raw`
(BJ-d read from the raw files; the extra active seeds are summed from `raw/active-extra.txt`).
Seeds 1, 2 and 3 reproduce #387's 0.12 rows exactly. No game number changed.

## By seed

| Seed | BJ-a loss % (idle / normal / active), p90 H | BJ-a | BJ-b EC5 % off -> on (idle / normal / active) | BJ-b | BJ-c zone off -> on (idle / normal / active) | BJ-c | BJ-e |
|---|---|---|---|---|---|---|---|
| 1 | 1.00 / 0.90 / 0.98, p90 0.60 | pass | 4 -> 4, 62 -> 49, 15 -> 15 | FAIL | 24 -> 24, 28 -> 28, 33 -> 28 | FAIL | pass |
| 2 | 1.18 / 1.20 / 1.25, p90 0.60 | pass | 4 -> 4, 82 -> 79, 19 -> 16 | pass | 24 -> 24, 28 -> 28, 28 -> 28 | pass | pass |
| 3 | 1.26 / 1.70 / 1.36, p90 0.60 | pass | 4 -> 4, 49 -> 77, 18 -> 19 | FAIL | 24 -> 24, 28 -> 30, 28 -> 28 | FAIL | pass |
| 4 | 0.59 / 0.89 / 1.01, p90 0.60 | pass | 4 -> 4, 69 -> 92, 16 -> 18 | FAIL | 25 -> 25, 28 -> 32, 35 -> 28 | FAIL | pass |
| 5 | 0.00 / -0.60 / -0.50, p90 0.60 | pass | 4 -> 4, 72 -> 54, 15 -> 15 | FAIL | 24 -> 24, 28 -> 33, 35 -> 35 | FAIL | pass |
| 6 | 1.20 / 1.32 / 1.28, p90 0.61 | pass | 4 -> 4, 62 -> 72, 18 -> 20 | FAIL | 24 -> 24, 28 -> 28, 35 -> 35 | pass | pass |
| 7 | 0.51 / 0.48 / 1.09, p90 0.61 | pass | 4 -> 4, 59 -> 79, 16 -> 20 | FAIL | 24 -> 24, 28 -> 34, 35 -> 35 | FAIL | pass |
| 8 | 0.63 / 0.60 / 0.59, p90 0.60 | pass | 4 -> 4, 69 -> 64, 16 -> 18 | FAIL | 26 -> 26, 35 -> 28, 35 -> 28 | FAIL | pass |
| 9 | 0.65 / 0.96 / 0.67, p90 0.60 | pass | 4 -> 4, 79 -> 67, 15 -> 20 | FAIL | 25 -> 25, 28 -> 35, 35 -> 28 | FAIL | pass |
| 10 | -0.05 / 0.06 / 0.07, p90 0.60 | pass | 4 -> 4, 51 -> 28, 15 -> 10 | FAIL | 26 -> 26, 28 -> 28, 35 -> 28 | FAIL | pass |
| 11 | -0.16 / -0.01 / 0.73, p90 0.60 | pass | 4 -> 4, 56 -> 56, 16 -> 20 | pass | 24 -> 24, 34 -> 28, 28 -> 28 | FAIL | pass |
| 12 | 0.80 / 0.95 / 1.23, p90 0.61 | pass | 4 -> 4, 79 -> 79, 19 -> 23 | pass | 27 -> 27, 28 -> 28, 28 -> 35 | FAIL | pass |

Pass: BJ-a 12/12, BJ-b 3/12, BJ-c 2/12, BJ-d and BJ-e 12/12. (A negative loss is a day-average win.)

## Totals: the paired change, table on minus off

| Profile | BJ-a mean loss % (worst seed) | BJ-b EC5 change: mean ± s.e. (min, max) | EC5 off across seeds: mean ± s.d. | BJ-c zone change: mean ± s.e. (min, max) | Zone off across seeds: mean ± s.d. |
|---|---|---|---|---|---|
| idle | 0.63 (1.26) | 0.0 ± 0.0 (0, 0) | 4 ± 0 | 0.0 ± 0.0 (0, 0) | 24.8 ± 1.1 |
| normal | 0.70 (1.70) | +0.6 ± 4.8 (-23, +28) | 66 ± 11 | +0.9 ± 1.2 (-7, +7) | 29.1 ± 2.5 |
| active | 0.81 (1.36) | +1.3 ± 0.9 (-5, +5) | 17 ± 2 | -2.2 ± 1.3 (-7, +7) | 32.5 ± 3.4 |

Active's zone leaned down on the 12 seeds, so more active-only seeds ran the same off and on pair
(`node tools/sim.mjs --days 14 --class warden --profile active --json 1 --seed N [--blackjack 1]`; `raw/active-extra.txt`;
seed 1 rechecked, 33 -> 28 again): seeds 13 to 32 here, then seeds 33 to 64 by the judge.

| Active seeds | Zone change, mean ± s.e. | Down / up / same |
|---|---|---|
| 1 to 12 (the report runs) | -2.17 ± 1.27 | 5 / 1 / 6 |
| 1 to 32 | -1.25 ± 0.72 | 9 / 3 / 20 |
| 33 to 64 (fresh) | +0.09 ± 0.80 | 8 / 8 / 16 |
| **1 to 64** | **-0.58 ± 0.54** | 17 / 11 / 36 |

The lean faded on fresh seeds: over 64 seeds the mean sits inside the 1-zone bound and about 1 s.e. from zero.

Why the bounds flip: the day-14 zone sits at 28 or 35 and almost never between (82 of the 88 day-14 zones above 27 in seeds 1 to 32,
table on or off, are exactly 28 or 35), so one hero passing a wall a few hours earlier or later reads as 7 zones.
The table's gold (under 2% of income) shifts what the hero buys and when; after that the fights draw different random
numbers and the run takes another path. EC5 normal swings ±25 points the same way. A 5-point and a 1-zone bound on one
seed sit far inside this noise.

## Verdicts at the 0.12 H top bet

- **BJ-a holds.** 12 of 12 seeds, every profile; worst day-average loss 1.70% of income (bar 2%), p90 losing day 0.61 H (bar 1.1 H).
- **BJ-b misses on most seeds (9 of 12) as a per-seed bound, but the table does not move EC5.** The mean change is
  +0.6 ± 4.8 points (normal) and +1.3 ± 0.9 (active), both within noise, and misses go both ways.
- **BJ-c misses on most seeds (10 of 12) as a per-seed bound; the table does not move the zone.** Normal +0.9 ± 1.2
  zones on 12 seeds; active -0.58 ± 0.54 on 64 seeds (17 down, 11 up). Idle never moves.

What to change (the measure, not the game): see the ruling. No bet, odds or gold number changes.

## Ruling (judge, 2026-10-11)

1. **The 2026-10-10 ruling stands: ship 0.12 price-hours.** The active lean did not hold on 32 fresh seeds (+0.09 ± 0.80,
   8 down, 8 up). Its size never fit a real effect either: the table takes about 0.8% of active income, so even if a whole
   7-zone wall hung on that gold the expected change is about -0.1 zone. Normal leans up and idle never moves; a real drain
   would push all three down. Veto phrase: "Treat the active zone drop as real and cut the table's top bet below 0.12."
   It reopens if a continuous measure (the hour each run first reaches zone 28 or 35, paired) shows a steady delay
   more than 2 s.e. from zero.
2. **A later tooling card reads BJ-b and BJ-c as the mean paired change over 12 or more seeds, with its s.e.** FAIL when the
   mean is outside the bound and more than 2 s.e. from zero; PASS when the mean is inside the bound; otherwise NOISY
   (INFO, never a pass), printing how many seeds would settle it. An on-demand `--report`, not a `check.mjs` gate (about
   72 sim runs). If room, add the hours-to-zone-28/35 measure beside BJ-c: it needs far fewer seeds than the jumpy
   day-14 zone. "Within 2 s.e. of zero passes" was rejected: a noisier run would buy a pass. Veto phrase: "Keep BJ-b and
   BJ-c as one-seed checks."
