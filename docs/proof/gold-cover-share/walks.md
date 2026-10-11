# gold-cover-share: how much of an upgrade's material gold may cover

The walk-presses-cover persona ("covers everything": it pays gold for every short upgrade it can, cheapest first), 1280x720,
60 game minutes, seeds 1-3 (Wren, Tobin, Pip), on the integration branch at 0dca987e. Commands:
`node tools/walk.mjs --seed <s> --cover all [--html <build>] --clock-budget 80 --out tools/.walk/<tag> --date 2026-10-11`.
The card wants gold to cover 50% or less of upgrade material for every hero, with gold under 60% unspent at minute 60.
Walks are deterministic: the same build and seed give the same run.

## The merged build: `ECON.coverFoes` 27 (was 9)

| Seed | Covered units | Covered upgrades | Cover gold | Unspent | Last spend | Refine orders | Mining / Woodcutting / Foraging | F3 longest gap |
|---|---|---|---|---|---|---|---|---|
| 1 Wren | 29 of 89 (33%) | 19 of 35 | 6,500 | 1% | 58:36 | 1 | 8 / 8 / 7 | 4:49 |
| 2 Tobin | 21 of 91 (23%) | 13 of 36 | 4,740 | 1% | 58:43 | 12 | 8 / 8 / 5 | 5:00 |
| 3 Pip | 34 of 69 (49%) | 17 of 29 | 5,700 | 1% | 51:29 | 1 | 9 / 13 / 7 | 6:36 |

Every seed covers half or less, binds its gold (1% unspent, a spend after minute 50), runs a refine order, and keeps F3 (no gap
of 8 minutes). Against walk-presses-cover's cover-off rows (older build 58598336: 8/8/6, 7/8/5, 11/11/7) every skill is
within 2. Pip's F5 "missed" is the same set of layout findings his walk had before this card (no cover finding).

## Pip at five prices

| coverFoes | Covered units | Unspent | Cover gold |
|---|---|---|---|
| 9 (before) | 64 of 94 (68%) at minute 53 (clock budget) | 2% | 3,545 |
| 14 | 54 of 90 (60%) | 2% | 4,550 |
| 18 | 48 of 95 (51%) | 2% | 5,220 |
| 27 | 34 of 69 (49%) | 1% | 5,700 |
| 36 | 40 of 80 (50%) | 3% | 8,280 |

The share flattens near half from 18 up: the bot holds no material when it covers, so a dearer cover buys fewer upgrades as
well as fewer units. 27 is the lowest price walked that passes all three seeds; Pip sits one point under the line.

## The cap that was tried first

A per-step cap (no cover unless the hero holds at least half the step) at price 9 covered 3% / 14% / 2%. It passes the share
by construction, but once the stale-press fix below went in, Tobin's walk split at one press (13:41) and his gold sat 41%
unspent with no spend after 32:06, the same as his cover-off walk. The judge ruled for the price instead (veto phrase: "put the
half cap back").

## The stale press

A cover press made after the last units arrived (the sheet still showed the button) was refused ("Gold cannot cover this
upgrade."). `canUpgrade` with `{ cover: true }` now makes the plain upgrade when nothing is short any more (check:
upgrade-gold-covers-short, "all 6 Silver Ingots held when the cover is pressed"). None of the price-27 walks hit it.
