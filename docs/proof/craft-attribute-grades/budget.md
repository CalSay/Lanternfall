# Budget rows with grades on (craft-attribute-grades)

Card craft-attribute-grades, 9 October 2026, on base `dbdec807` (after rally-gates-live, #261). Everything here is behind
`CRAFT_TUNE.grades`, which stays off in the game until the balance pass.

## How it was measured

- Baseline: `node tools/budget.mjs` on the base commit (240 fights a cell, seed offset 0).
- Switch off: `node tools/budget.mjs` on this branch. **Every row is identical to the baseline** (the JSON rows compare equal).
- Switch on: `node tools/budget.mjs --craft grades=1`. The kept-up rows (the footing's own gear, no `gear` option, not arrival)
  wear each piece at the grade the kept-up casual's station level gives at the row's zone (the casual table in
  [curve.md](../../design/skilling-crafting-overhaul/curve.md), `CRAFT_TUNE.curve` on, seed 1), at +5, no lift. A piece is at
  the row's tier (a behind row's is one down), or at the best tier the casual's station has open when it has not reached the
  row's tier yet. Each class piece wears one HP line at the middle roll and no other bonus line; the rare footing it replaces
  had HP lines at rolled values on the pieces that drew one, so the graded rows carry a little more bonus HP. Every other row
  (first-hour, arrival, bare, late epic +10) keeps its rarity footing.

The kept-up footing before this card was "rare +5" (1.8x, grade A's power). A graded piece below A lowers a row; **grade S
(2.5x) raises it**, which the card did not expect: the casual's stations reach S on tier 4 from zone 25 (card A's miss 1: the
stations refine every night through the zone 20-30 stall).

Tier and grade worn (weapon, off-hand, head, body, Charm):

| zone | Wren | Tobin | Pip |
|---|---|---|---|
| z5 | 1C 1C 1D 1D 1B | 1B 1B 1B 1B 1B | 1C 1C 1D 1D 1C |
| z8 | 2D 2D 2D 2D 1B | 2C 2C 2C 2C 2C | 1C 1B 2D 2D 1B |
| z10 | 2B 2B 2B 2B 1B | 2A 2A 2A 2A 2A | 1B 1B 2C 2C 1B |
| z12 | 2B 2B 2B 2B 1B | 2A 2A 2A 2A 2A | 1B 1B 2C 2C 1B |
| z13 | 3A 3A 3A 3A 1B | 3C 3C 3C 3C 3C | 2B 1B 3D 3D 2C |
| z14 | 3A 3A 3A 3A 1B | 3C 3C 3C 3C 3C | 2B 1B 3D 3D 2C |
| z15 | 3A 3A 3A 3A 1B | 3C 3C 3C 3C 3C | 2B 1B 3D 3D 2C |
| z16 | 3S 3S 3S 3S 3D | 3C 3C 3C 3C 3C | 3A 2C 3D 3D 2B |
| z19 | 4A 4A 4B 4B 4C | 3A 3A 3A 3A 3A | 4A 3D 4D 4D 3C |
| z20 | 4A 4A 4B 4B 4C | 3A 3A 3A 3A 3A | 4A 3D 4D 4D 3C |
| z21 | 4A 4A 4B 4B 4C | 3A 3A 3A 3A 3A | 4A 3D 4D 4D 3C |
| z22 | 4A 4A 4B 4B 4A | 4C 4C 4C 4C 4C | 4A 3B 4B 4B 3A |
| z25 | 4S 4S 4S 4S 4S | 4A 4A 4A 4A 4A | 4S 4D 4S 4S 4D |
| z27 | 4S 4S 4S 4S 4S | 4A 4A 4A 4A 4A | 4S 4D 4S 4S 4D |
| z30 | 4S 4S 4S 4S 4S | 4S 4S 4S 4S 4S | 4S 4D 4S 4S 4D |
| z34 | 4S 4S 4S 4S 4S | 4S 4S 4S 4S 4S | 4S 4D 4S 4S 4D |

## Casual win % that moved (switch on against the baseline)

Every cell that moved; `off` is the distance outside the band before and after (0: in band). Behind, focus, might and vigour
rows are differences against their ref row.

```
z5-boss-keptup       wren   casual    72 ->   67 (-5)   band 60-85    off 0 -> 0 
z5-boss-keptup       pip    casual    98 ->   90 (-9)   band 60-85    off 13 -> 5 toward
z5-boss-keptup       mean   casual    83 ->   79 (-4)   band 60-85    off 0 -> 0 
z8-boss-keptup       wren   casual    97 ->   93 (-3)   band 80-97    off 0 -> 0 
z8-boss-keptup       pip    casual    95 ->   92 (-3)   band 80-97    off 0 -> 0 
z8-boss-keptup       mean   casual    97 ->   95 (-2)   band 80-97    off 0 -> 0 
z10-boss-keptup      pip    casual    72 ->   69 (-3)   band 60-85    off 0 -> 0 
z10-boss-keptup      mean   casual    74 ->   73 (-1)   band 60-85    off 0 -> 0 
z12-boss-keptup      pip    casual    94 ->   92 (-2)   band 75-95    off 0 -> 0 
z13-boss-keptup      pip    casual    98 ->   95 (-2)   band 75-95    off 3 -> 0 toward
z14-boss-keptup      pip    casual   100 ->   99 (0)    band 40-100   off 0 -> 0 
z15-boss-keptup      pip    casual    99 ->   95 (-4)   band 60-85    off 14 -> 10 toward
z15-boss-keptup      mean   casual    97 ->   95 (-2)   band 60-85    off 12 -> 10 toward
z16-boss             wren   casual    99 ->  100 (0)    band 60-80    off 19 -> 20 AWAY
z16-boss             tobin  casual    97 ->   95 (-2)   band 70-90    off 7 -> 5 toward
z16-boss             pip    casual    98 ->   98 (-1)   band 60-80    off 18 -> 17 toward
z16-boss             mean   casual    98 ->   97 (-1)   band 63-83    off 15 -> 14 toward
z17-boss             tobin  casual    96 ->   95 (0)    band 70-90    off 6 -> 5 toward
z17-boss             pip    casual    99 ->   97 (-3)   band 60-80    off 19 -> 17 toward
z17-boss             mean   casual    98 ->   97 (-1)   band 63-83    off 15 -> 14 toward
z18-boss             tobin  casual    96 ->   96 (-1)   band 70-90    off 6 -> 6 
z18-boss             pip    casual   100 ->   98 (-1)   band 60-80    off 20 -> 18 toward
z18-boss             mean   casual    99 ->   98 (-1)   band 63-83    off 16 -> 15 toward
z19-boss             pip    casual    96 ->   90 (-5)   band 60-80    off 16 -> 10 toward
z19-boss             mean   casual    97 ->   96 (-1)   band 63-83    off 14 -> 13 toward
z20-elite            wren   casual    98 ->   96 (-1)   band 75-97    off 1 -> 0 toward
z20-elite            pip    casual   100 ->   91 (-9)   band 75-97    off 3 -> 0 toward
z20-elite            mean   casual    99 ->   96 (-3)   band 75-97    off 2 -> 0 toward
z20-boss             wren   casual    90 ->   89 (0)    band 60-80    off 10 -> 9 toward
z20-boss             tobin  casual    90 ->   86 (-3)   band 70-90    off 0 -> 0 
z20-boss             pip    casual    93 ->   88 (-5)   band 60-80    off 13 -> 8 toward
z20-boss             mean   casual    91 ->   88 (-3)   band 63-83    off 8 -> 5 toward
z20-boss-behind      wren   casual     6 ->    1 (-5)   band 10-60    off -4 -> -9 AWAY
z20-boss-behind      tobin  casual    -1 ->   -5 (-4)   band 10-60    off -11 -> -15 AWAY
z20-boss-behind      pip    casual     8 ->    3 (-5)   band 10-60    off -2 -> -7 AWAY
z20-boss-behind      mean   casual     4 ->    0 (-4)   band 10-60    off -6 -> -10 AWAY
z21-boss             wren   casual    98 ->   97 (0)    band 60-80    off 17 -> 17 
z21-boss             tobin  casual    85 ->   76 (-8)   band 70-90    off 0 -> 0 
z21-boss             pip    casual    92 ->   85 (-7)   band 60-80    off 12 -> 5 toward
z21-boss             mean   casual    91 ->   86 (-5)   band 63-83    off 8 -> 3 toward
z22-boss             wren   casual    88 ->   86 (-2)   band 60-80    off 8 -> 6 toward
z22-boss             tobin  casual    87 ->   86 (-1)   band 70-90    off 0 -> 0 
z22-boss             pip    casual    91 ->   87 (-5)   band 60-80    off 11 -> 7 toward
z22-boss             mean   casual    89 ->   86 (-3)   band 63-83    off 6 -> 3 toward
z23-boss             wren   casual    89 ->   88 (-1)   band 60-80    off 9 -> 8 toward
z23-boss             tobin  casual    88 ->   83 (-5)   band 70-90    off 0 -> 0 
z23-boss             pip    casual    88 ->   86 (-2)   band 60-80    off 8 -> 6 toward
z23-boss             mean   casual    88 ->   86 (-2)   band 63-83    off 5 -> 3 toward
z24-boss             tobin  casual    83 ->   78 (-5)   band 70-90    off 0 -> 0 
z24-boss             mean   casual    87 ->   86 (-1)   band 63-83    off 4 -> 3 toward
z25-boss             wren   casual    82 ->   92 (+10)  band 60-80    off 2 -> 12 AWAY
z25-boss             pip    casual    58 ->   78 (+20)  band 60-80    off -2 -> 0 toward
z25-boss             mean   casual    73 ->   83 (+10)  band 63-83    off 0 -> 0 
z25-boss-behind      wren   casual    70 ->   33 (-37)  band 10-60    off 10 -> 0 toward
z25-boss-behind      tobin  casual    73 ->   28 (-45)  band 10-60    off 13 -> 0 toward
z25-boss-behind      pip    casual    57 ->   53 (-4)   band 10-60    off 0 -> 0 
z25-boss-behind      mean   casual    67 ->   38 (-29)  band 10-60    off 7 -> 0 toward
z25-boss-behind      wren   good      98 ->  100 (+3)   band 60-100   off 0 -> 0 
z25-boss-behind      tobin  good     100 ->  100 (0)    band 60-100   off 0 -> 0 
z25-boss-behind      pip    good      97 ->  100 (+3)   band 60-100   off 0 -> 0 
z25-boss-behind      mean   good      98 ->  100 (+2)   band 60-100   off 0 -> 0 
z27-boss             wren   casual    72 ->   84 (+12)  band 60-80    off 0 -> 4 AWAY
z27-boss             pip    casual    68 ->   82 (+13)  band 60-80    off 0 -> 2 AWAY
z27-boss             mean   casual    73 ->   82 (+9)   band 63-83    off 0 -> 0 
z27-boss             pip    none       1 ->    8 (+7)   band 0-10     off 0 -> 0 
z30-elite            wren   casual    99 ->  100 (+1)   band 75-97    off 2 -> 3 AWAY
z30-elite            pip    casual    98 ->  100 (+3)   band 75-97    off 1 -> 3 AWAY
z30-elite            mean   casual    99 ->  100 (+1)   band 75-97    off 2 -> 3 AWAY
z30-boss             wren   casual    77 ->   98 (+21)  band 60-80    off 0 -> 18 AWAY
z30-boss             tobin  casual    80 ->   94 (+14)  band 70-90    off 0 -> 4 AWAY
z30-boss             pip    casual    63 ->   82 (+19)  band 60-80    off 0 -> 2 AWAY
z30-boss             mean   casual    73 ->   91 (+18)  band 63-83    off 0 -> 8 AWAY
z30-boss             tobin  none       0 ->    1 (+1)   band 0-10     off 0 -> 0 
z34-boss             wren   casual    72 ->   75 (+3)   band 60-80    off 0 -> 0 
z34-boss             tobin  casual    80 ->   94 (+14)  band 70-90    off 0 -> 4 AWAY
z34-boss             pip    casual    68 ->   78 (+11)  band 60-80    off 0 -> 0 
z34-boss             mean   casual    73 ->   82 (+9)   band 63-83    off 0 -> 0 
z34-boss             pip    none       0 ->    1 (+1)   band 0-10     off 0 -> 0 
z25-boss-joined      wren   casual    82 ->   92 (+10)  band 0-30     off 52 -> 62 AWAY
z25-boss-joined      pip    casual    58 ->   78 (+20)  band 0-30     off 28 -> 48 AWAY
z25-boss-joined      mean   casual    73 ->   83 (+10)  band 0-30     off 43 -> 53 AWAY
z25-boss-focus       wren   casual    20 ->   15 (-5)   band -15-15   off 5 -> 0 toward
z25-boss-focus       pip    casual     6 ->    9 (+3)   band -15-15   off 0 -> 0 
z25-boss-focus       mean   casual    13 ->   12 (-1)   band -15-15   off 0 -> 0 
z25-boss-might       wren   casual    27 ->   18 (-9)   band -15-15   off 12 -> 3 toward
z25-boss-might       mean   casual    31 ->   28 (-3)   band -15-15   off 16 -> 13 toward
z25-boss-vigour      wren   casual    -9 ->   -7 (+2)   band -15-15   off 0 -> 0 
z25-boss-vigour      pip    casual   -19 ->  -14 (+5)   band -15-15   off -4 -> 0 toward
z25-boss-vigour      mean   casual   -14 ->  -12 (+2)   band -15-15   off 0 -> 0 
```

## Against the card's Prediction

- **z7-z12 stay in the bands the rally ruling set:** met. The z8, z10 and z12 kept-up rows move 1 to 3 points. The cells
  that sat over their band in the baseline (z8 Tobin, z12 Wren and Tobin) do not move.
- **The tier-opening rows (z13-z15, z19-z21):** the spec expected 15-45 under on the kept-up footing. Measured: no dip. They
  move 0 to 9 points, all down and all in band or toward it (z21 Tobin 85 -> 76, in band; Pip 92 -> 85, toward). The
  fitted curve puts Wren's stations well past each gate; Tobin's Smithing is 32 at zone 19, under tier 4's gate, so he wears
  tier 3 at A (42 x 1.8 = 75.6, about tier 4 D's 75); Pip wears D and C pieces from zone 13.
- **Every other row moves 5 points or less, or toward its band:** **missed** on the grade S rows from zone 25. z25-boss Wren
  82 -> 92 (2 -> 12 over), z30-boss Wren 77 -> 98 (0 -> 18 over), Tobin 80 -> 94 (4 over), Pip 63 -> 82 (2 over), z27 Wren
  and Pip +12/+13 (to 4 and 2 over), z34 Tobin 80 -> 94 (4 over). The derived z25-boss-joined row moves with z25-boss. The
  z20-boss-behind drop grows 4 to 5 points (further under its band, inside the 5-point allowance). Owner: the balance pass
  (the station curve against the zone 20-30 stall, card A's miss 1); this card changes no curve or fight number.
- **Early hits (note #18): not lowered.** Casual turns a won fight (w/t/p): z1-normal 2.4/3.1/1.8, unchanged (the starter
  kit); z8-normal 1/1.1/1 -> 1.4/1.4/1 (grade D and C tier 2 pieces hit softer than rare +5); z20-normal 1.3/2.4/1 ->
  1.3/2.9/1.6.
