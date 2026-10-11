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

## Boot bytes (Brotli wire bytes)
- Page: 1131528 -> 1131476 (-52).
- Worst-zone boot set (the shipped boot line): 3984708 -> 3984656 (-52).
- The hero packs check's test build (with the never-shipped 21zx test hero file): 3999471 -> 3999551 (+80), 449 B
  under its 4.0 MB fail line. Brotli moves this test build by a few hundred bytes for any edit; the shipped line fell.
