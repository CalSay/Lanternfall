# boot-bytes-steady-measure: proof

The build was already deterministic: the same tree gives the same bytes (file order is sorted, names are content hashes). The swing
is the page term of the boot lines: the whole 3.74 MB page compressed as one Brotli quality 4 stream. q4's small match table makes
a change's bytes depend on everything around it, so a branch's delta moves when unrelated files merge into the base. Boot files,
hero cores and packs are compressed one file each and never moved.

The card's prediction (ordering or concatenation) was wrong, and no fix keeps the line's numbers and removes the noise: flushing
the stream at file boundaries made it noisier, quality 5 or 6 reads lower (a loosening), and counting per file reads ~166 KB
higher (the line would fail at once). Judge ruling (Opus high, 11 Oct): option A. The line stays exactly as is; a steady report
sits beside it. Veto: "Drop the steady report; whole-page q4 is the only boot number."

## The same change (#407, +509 raw page bytes) on three bases

Worst-zone boot set, bytes. "Line" is the shipped count (whole-page q4); "steady" counts each src/js file alone.

| base | line without | line with | line delta | steady without | steady with | steady delta |
|---|---|---|---|---|---|---|
| 96d492c1 | 3,983,279 | 3,983,211 | -68 | 4,150,190 | 4,150,464 | +274 |
| 4abb5140 | 3,983,279 | 3,983,211 | -68 | 4,150,190 | 4,150,464 | +274 |
| dd5723c6 | 3,983,672 | 3,984,092 | +420 | 4,150,138 | 4,150,412 | +274 |

96d492c1 and 4abb5140 build the same page (#412 changed only check.mjs), so they are one base in practice; dd5723c6 adds
#410 and #411's code. Zone 1 moves by the same deltas. Before: 488 B of swing. After: 0 B.

The check runs the same test every time: a change to 71-ui-fight.js measured with and without a change to 30-state.js gives
36 B and 36 B steady, against -14 B and -167 B on the line's count.

Lines unchanged: bootWarn 3.5 MB, bootFail 4.0 MB, zone set 0.65 MB, area set 1.0 MB.
