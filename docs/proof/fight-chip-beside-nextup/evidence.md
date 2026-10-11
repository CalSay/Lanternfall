# fight-chip-beside-nextup: evidence

## What changed
- `src/js/71-ui-fight.js`: `awayChipFit` tries the whole away line, then the short line (as before). If neither fits above the
  dock under the whole goal, the goal gives up its last lines one at a time (`nuCut`, a line clamp ending in "...") until the
  short line fits. The chip no longer says nothing. The cut comes off when the hero stops fighting or the words or screen change.
- `src/styles/60-goals.css`: `.nu-lbl.nu-cut`, the clamp. `src/styles/80-landscape.css`: the stale comment that said the away
  chip only shows while gathering.
- The whole goal stays in the Next Up chip's aria-label and in the list sheet a tap opens. Font sizes are unchanged (13 px goal
  and chip at 740x360, as before; 14 px from 1200 px wide).

## Check (`node tools/check.mjs --only="fight-chip-beside-nextup"`)
The 174 label pairs side-column-fits-740 walks, at 740x360 and 844x390, web fonts and fallback fonts. Each pair: the chip shows,
its box meets neither the goal nor the Next Up chip, all three stay on screen and above the dock, the goal keeps its words and
at least one line, and a cut goal keeps every line that still fits.

| view | before: chip says nothing | after: nothing | after: goal cut |
| --- | --- | --- | --- |
| 740x360 | 157 of 174 | 0 | 157 |
| 740x360, fallback fonts | 166 of 174 | 0 | 166 |
| 844x390 | (passes the chip/dock bound already) | 0 | 84 |
| 844x390, fallback fonts | | 0 | 144 |

Run on the old build the new section fails at 740x360 with 157 bad pairs ("the away chip says nothing"), so it holds the fix.

side-column-fits-740 now measures the goal with the game's cut put in place, allows a cut only on a phone and only when the whole
goal with the short line would not fit, and fails if the chip says nothing. At 1024x768 and wider no goal is cut (0 of 174 in
every view).

## Views
1280x720 and 360x740: the same boxes before and after (the cut never triggers there). 740x360: see the route's shot.

## Boot bytes
`node tools/build.mjs --split`: this branch -4 B steady (zone 1 and worst zone).
