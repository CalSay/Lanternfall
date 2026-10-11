# walk-cover-stale-press: walks

Build 90dca517 (integration branch), 1280x720, `--cover all`, seeds 1-3 (Wren, Tobin, Pip), 60 game minutes asked. The three
seeds ran side by side on one machine, so each stopped at the 30-minute clock budget before game minute 60 (the minute read is in
the table). Base = today's tools/walk.mjs; fix = this branch.

| Seed | Run | Read at | Presses | Could not cover | Plain upgrade | Cover findings | Covered units | Covered upgrades |
|---|---|---|---|---|---|---|---|---|
| 1 Wren | base | 49 | 19 | 0 | n/a | 0 | 29 of 83 (35%) | 19 of 34 |
| 1 Wren | fix | 45 | 18 | 0 | 0 | 0 | 27 of 81 (33%) | 18 of 33 |
| 2 Tobin | base | 46 | 13 | 0 | n/a | 0 | 21 of 80 (26%) | 13 of 33 |
| 2 Tobin | fix | 43 | 13 | 0 | 0 | 0 | 21 of 74 (28%) | 13 of 32 |
| 3 Pip | base | 55 | 17 | 0 | n/a | 0 | 34 of 69 (49%) | 17 of 29 |
| 3 Pip | fix | 50 | 17 | 0 | 0 | 0 | 34 of 65 (52%) | 17 of 28 |

The card predicted some false "could not cover" lines on these seeds today. There were none, base or fix: in these runs no press
landed after the material came in, so the stale case did not come up on its own. The fix only relabels a press whose piece went
up, so the covered shares are counted the same way as before; the share moves above (up to 3 points) are the two walks stopping
at different game minutes under the clock budget, not the fix. Pip read 49% (base, minute 55) and 52% (fix, minute 50).

## Forced stale press (seed 1, 12 game minutes, local unshipped hook: see route.txt)

| Run | Presses | Logged | Cover findings |
|---|---|---|---|
| fix | 11 | 11 "plain upgrade (the material was in hand by the press)" | 0 |
| base walk.mjs + the same hook | 11 | 11 "could not cover" | 1 (x11): "Copper Pickaxe to +1: the press did not upgrade it" |
