# leave-mid-fight-gathers: evidence (2026-10-11)

## Offline parity (`node tools/offline-parity.mjs --left-fight`)
A turn fighter who left mid-fight, harvest away vs live gathering on the same node (Pine Grove):

| Hours | Away units | Live units | Gap after ÷1.06 Hearth |
|---|---|---|---|
| 0.5 | 755 | 801 | 0.09% |
| 2 | 3172 | 3369 | 0.20% |
| 4 | 6759 | 7074 | -1.26% |
| 8 | 14642 | 15219 | -1.94% |
| 24 (8 h limit) | 14642 | 15219 | -1.94% |
| 24 (max limit) | 54248 | 56210 | -2.25% |

Tavern arrivals, the Rook lead and Well Rested match live at every length. The numbers equal the plain gatherer
mode exactly. check.mjs C14 now asserts this at 2 h (within 5% of live, equal to the gatherer, no gold or kills,
`report.leftFight` set).

## W11 visit sim (seed 11, three heroes, 15 fighter-left and 9 gatherer-left returns per persona)

| Persona | Fighter-left with an away harvest line | Fighter-left, newly Ready row | Gatherer-left, newly Ready row |
|---|---|---|---|
| casual5 | 0/15 -> 15/15 | 5/15 -> 10/15 | 4/9 -> 5/9 |
| lunch15 | 0/15 -> 15/15 | 7/15 -> 12/15 | 7/9 -> 7/9 |
| f60then5 | 0/15 -> 15/15 | 7/15 -> 9/15 | 6/9 -> 8/9 |
| All | 0/45 -> 45/45 | 19/45 -> 31/45 (69%) | 17/27 -> 20/27 (74%) |

The harvest line clears the bar everywhere. "Newly Ready at least as often" holds in casual5 and lunch15, but not in
f60then5 or in the total (69% vs 74%). The f60then5 bot leaves its hands-back and forge rows Ready across visits,
so a row that was already Ready before the visit does not count as new. This is a bot quirk, not a gap in the
away harvest. We report it as a miss on the letter of the bar.

## Health (`node tools/health.mjs --compare`): OK, every metric within tolerance
- casual: firstGoalSec 73.33 -> 73.33; longestDrySec 249.67 -> 161.67; zoneEnd 12 -> 10.67 (tolerance ±2;
  Wren 12 -> 10, Pip 14 -> 12); mechanicsPerHour 32.89 -> 32.44. Gear tier and gold rose.
- active and optimiser: unchanged.
- No re-baseline.

## Boot bytes (Brotli wire bytes, against the integration branch at 96d492c1)
- Page: 1130037 -> 1129969 (-68).
- Worst-zone boot set (the shipped boot line): 3983279 -> 3983211 (-68).
- The hero packs check's test build (with the never-shipped 21zx test hero file): 3998850 -> 3998938 (+88), 1062 B
  under its 4.0 MB fail line. Each base merge moved these by up to 440 B with no change on this branch, so the
  comment wording was re-tuned after each merge; the shipped line is the one held at or under the base.

## Save review
The save-reviewer found one blocking bug, now fixed: Spillover during a fighter's away called `setNode`, whose
`sceneReset` ended the live turn fight, so the next fight started with the hero at full HP. `setNode` now resets the
scene only while gathering, and the leave-mid-fight-gathers section asserts that a fighter's away spill keeps the
fight and the hero's HP (it fails on the old code).

## Code review
The reviewer found that `side-column-fits-740` had stopped checking that the Next Up chip clears the dock while
fighting (the old bound sat in the loop this change rewrote). It is back for every pair. It also found that the short
chip line dropped "you earn nothing" when the pile is full; the short line now cuts at the first comma ("Leave now:
Wren goes back to the Copper Vein. Copper Ore is full.").

At 740x360 the chip's whole line fits under short Next Up labels only. Of the 174 measured pairs (weighted to the
longest labels) it says the whole line 8 times, the short line 9 times and nothing 157 times. At 1024x768 and wider it
always says the whole line.
