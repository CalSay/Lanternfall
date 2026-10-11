# gold-cover-share: how much of an upgrade's material gold may cover

The walk-presses-cover persona ("covers everything": it pays gold for every short upgrade it can, cheapest first), 1280x720,
60 game minutes, seeds 1-3 (Wren, Tobin, Pip), on the integration branch at 0dca987e. Commands:
`node tools/walk.mjs --seed <s> --cover all [--html <build>] --clock-budget 80 --out tools/.walk/<tag> --date 2026-10-11`.
The card wants gold to cover 50% or less of upgrade material for every hero, with gold under 60% unspent at minute 60.

## The price lever flattens at half

Pip (seed 3) at five prices (`ECON.coverFoes`, foes of the tier's foe gold a raw unit):

| coverFoes | Covered units | Unspent | Cover gold | Mining / Woodcutting / Foraging |
|---|---|---|---|---|
| 9 (today) | 64 of 94 (68%) at minute 53 (clock budget) | 2% | 3,545 | not read |
| 14 | 54 of 90 (60%) | 2% | 4,550 | 11 / 11 / 7 |
| 18 | 48 of 95 (51%) | 2% | 5,220 | 12 / 8 / 7 |
| 27 | 34 of 69 (49%) | 1% | 5,700 | 9 / 13 / 7 |
| 36 | 40 of 80 (50%) | 3% | 8,280 | 13 / 9 / 7 |

At 27, Wren covers 33% and Tobin 23%, so 27 passes all three, but Pip sits at the line from 18 to 36: the bot holds no
material when it covers (it covers before it gathers), so a dearer cover buys fewer upgrades and the share stays near half.
A price can land under 50% on these seeds; it cannot keep Pip there.

## The cap: gold covers at most half the step

`upgradeCover` (55-crafting) offers the cover only when the hero holds at least half the step's material (`units * 2 >
need`, with need in the step's own units: Planks, Ingots or raw). The price stays at 9. Over the whole walk the share is then
at most half for any hero and any way of playing, since every covered step is.

| Seed | Covered units | Covered upgrades | Unspent | Last spend | Refine orders | Mining / Woodcutting / Foraging | F3 longest gap |
|---|---|---|---|---|---|---|---|
| 1 Wren | 4 of 121 (3%) | 4 of 34 | 4% | 52:33 | 8 | 8 / 9 / 7 | 4:18 |
| 2 Tobin | 18 of 128 (14%) | 16 of 41 | 1% | 58:30 | 12 | 8 / 8 / 5 | 5:17 |
| 3 Pip | 3 of 128 (2%) | 3 of 36 | 2% | 52:33 | 3 | 10 / 12 / 7 | 6:57 |

Gold still binds on every seed (1-4% unspent, a spend after minute 50), every seed runs refine orders, and every F3 gap is
under 8 minutes. walk-presses-cover's cover-off rows (older build 58598336) had Mining / Woodcutting / Foraging 8/8/6,
7/8/5 and 11/11/7: every capped seed is within 2.

The cover now mostly finishes a step the hero is part way through. That made one old race likelier: the bot (or a player)
opens the sheet mid-gather, the last units arrive, and the cover press was refused ("Gold cannot cover this upgrade.").
Pip's capped walk logged it twice and Tobin's once. `canUpgrade` with `{ cover: true }` now makes the plain upgrade when
nothing is short any more (check: upgrade-gold-covers-short, "all 6 Silver Ingots held when the cover is pressed").
