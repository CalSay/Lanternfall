# uniques-first-four: kept-up budget rows (report-only)

`node tools/budget.mjs --uniq <key> --none [--seed-offset 0|1000]`: the hero in the kept-up set (rare +5, set worn)
at the zone boss, R (the unique worn at the zone's grade +5, switch on) against S (the same set, no unique), on the same seeds,
240 fights a cell. casual/none: win points; good: turns for a won fight. Twice-Sworn's dodge-first Tobin row adds
`--players dodge` on 3 seeds. Tool uniques have no fight rule or health line, so their fight rows read +0.0 everywhere (left out).

## Judge's condition: dodge-first Tobin with Twice-Sworn at z16 (3 seeds)

| seed offset | dodgeCasual S -> R | delta |
|---|---|---|
| 0 | 44->53 | +9.1 |
| 1000 | 41->55 | +14.1 |
| 2000 | 49->57 | +8.7 |

Pooled: +10.6, under the +12 line, so it does not go back to the judge (the Grit variant the judge measured was +13.6; the
second hit without Grit's bonus brings it down). dodgeGood wins 100 -> 100 with 5-8% fewer turns.

## Rows (seed offsets 0 and 1000)

Measured before the code review's three clamps (Oath with Mountain capped at +50% on a z16-34 zone boss, a stored Bleed
not boosted by Oath or Mountain, Final Echo counting at most 5 Crimson stacks). Each only lowers a gain, so these rows are an upper bound.

### twinned-vow, seed offset 0
```
z16-boss    wren   casual 76->76 (-0.5) turns 10.8->10.8 (+0.0)  good 100->100 (+0.0) turns 8.4->8.3 (-1.2)  none 0->0 (+0.0)
z16-boss    tobin  casual 80->86 (+6.3) turns 15.2->15 (-1.3)  good 100->100 (+0.0) turns 11.1->11 (-0.9)  none 0->2 (+2.1)
z16-boss    pip    casual 64->64 (+0.0) turns 11.9->11.9 (+0.0)  good 100->100 (+0.0) turns 9.4->9.4 (+0.0)  none 0->0 (+0.0)
z20-boss    wren   casual 60->63 (+2.5) turns 9.6->9.6 (+0.0)  good 100->100 (+0.0) turns 8.1->8.2 (+1.2)  none 0->0 (+0.0)
z20-boss    tobin  casual 80->81 (+1.3) turns 13.9->14.4 (+3.6)  good 100->100 (+0.0) turns 11.2->11.5 (+2.7)  none 0->0 (+0.0)
z20-boss    pip    casual 80->75 (-4.2) turns 9.2->9.5 (+3.3)  good 100->100 (+0.0) turns 6.8->7 (+2.9)  none 0->0 (-0.4)
z25-boss    wren   casual 82->90 (+7.5) turns 8.6->8.7 (+1.2)  good 100->100 (+0.0) turns 7.3->7.3 (+0.0)  none 0->0 (+0.0)
z25-boss    tobin  casual 80->78 (-1.7) turns 13->12.9 (-0.8)  good 100->100 (+0.0) turns 9.4->9.5 (+1.1)  none 0->0 (+0.0)
z25-boss    pip    casual 58->60 (+1.7) turns 10.1->10.2 (+1.0)  good 100->100 (+0.0) turns 7.8->8.1 (+3.8)  none 0->0 (+0.0)
z30-boss    wren   casual 77->72 (-5.0) turns 9.5->9.5 (+0.0)  good 100->100 (+0.0) turns 7.7->7.8 (+1.3)  none 0->0 (+0.0)
z30-boss    tobin  casual 80->80 (+0.0) turns 12.5->12.8 (+2.4)  good 100->100 (+0.0) turns 9.5->9.5 (+0.0)  none 0->0 (+0.0)
z30-boss    pip    casual 63->58 (-5.0) turns 11.5->11.7 (+1.7)  good 100->100 (+0.0) turns 8.7->8.8 (+1.1)  none 0->0 (+0.0)
```
### twinned-vow, seed offset 1000
```
z16-boss    wren   casual 78->78 (+0.8) turns 11->10.9 (-0.9)  good 100->100 (+0.0) turns 8.6->8.6 (+0.0)  none 0->0 (+0.0)
z16-boss    tobin  casual 79->83 (+3.7) turns 15.3->14.7 (-3.9)  good 100->100 (+0.0) turns 11.1->11.1 (+0.0)  none 0->0 (-0.4)
z16-boss    pip    casual 64->64 (+0.0) turns 11.9->11.9 (+0.0)  good 100->100 (+0.0) turns 9.3->9.3 (+0.0)  none 0->0 (+0.0)
z20-boss    wren   casual 60->63 (+3.3) turns 9.8->9.8 (+0.0)  good 100->100 (+0.0) turns 8.2->8.2 (+0.0)  none 0->0 (+0.0)
z20-boss    tobin  casual 85->83 (-2.1) turns 13.8->14.2 (+2.9)  good 100->100 (+0.0) turns 11->11.2 (+1.8)  none 0->0 (+0.0)
z20-boss    pip    casual 77->75 (-2.5) turns 9.3->9.5 (+2.2)  good 100->100 (+0.0) turns 6.8->7 (+2.9)  none 0->0 (+0.0)
z25-boss    wren   casual 77->84 (+7.1) turns 8.7->8.9 (+2.3)  good 100->100 (+0.0) turns 7.2->7.2 (+0.0)  none 0->0 (+0.0)
z25-boss    tobin  casual 83->78 (-5.0) turns 12.8->12.6 (-1.6)  good 100->100 (+0.0) turns 9.7->9.8 (+1.0)  none 0->0 (+0.0)
z25-boss    pip    casual 48->48 (-0.4) turns 10.2->10.4 (+2.0)  good 100->100 (+0.0) turns 7.9->8.2 (+3.8)  none 0->0 (+0.0)
z30-boss    wren   casual 67->70 (+2.9) turns 9.5->9.8 (+3.2)  good 100->100 (+0.0) turns 7.9->7.9 (+0.0)  none 0->0 (+0.0)
z30-boss    tobin  casual 76->79 (+2.5) turns 13.1->13.2 (+0.8)  good 100->100 (+0.0) turns 9.4->9.5 (+1.1)  none 0->0 (+0.0)
z30-boss    pip    casual 58->55 (-3.7) turns 11.3->11.4 (+0.9)  good 100->100 (+0.0) turns 8.8->8.9 (+1.1)  none 0->0 (+0.0)
```
### twice-sworn, seed offset 0
```
z16-boss    wren   casual 76->79 (+2.5) turns 10.8->10.7 (-0.9)  good 100->100 (+0.0) turns 8.4->8.3 (-1.2)  none 0->0 (+0.0)
z16-boss    tobin  casual 80->86 (+6.3) turns 15.2->15 (-1.3)  good 100->100 (+0.0) turns 11.1->11 (-0.9)  none 0->2 (+1.7)
z16-boss    pip    casual 64->64 (+0.0) turns 11.9->11.9 (+0.0)  good 100->100 (+0.0) turns 9.4->9.4 (+0.0)  none 0->0 (+0.0)
z20-boss    wren   casual 60->65 (+4.6) turns 9.6->9.6 (+0.0)  good 100->100 (+0.0) turns 8.1->8.2 (+1.2)  none 0->0 (+0.0)
z20-boss    tobin  casual 80->82 (+2.1) turns 13.9->14.3 (+2.9)  good 100->100 (+0.0) turns 11.2->11.5 (+2.7)  none 0->0 (+0.0)
z20-boss    pip    casual 80->79 (-0.4) turns 9.2->9.4 (+2.2)  good 100->100 (+0.0) turns 6.8->7 (+2.9)  none 0->0 (-0.4)
z25-boss    wren   casual 82->89 (+7.1) turns 8.6->8.7 (+1.2)  good 100->100 (+0.0) turns 7.3->7.3 (+0.0)  none 0->0 (+0.0)
z25-boss    tobin  casual 80->78 (-1.7) turns 13->12.9 (-0.8)  good 100->100 (+0.0) turns 9.4->9.5 (+1.1)  none 0->0 (+0.4)
z25-boss    pip    casual 58->61 (+3.4) turns 10.1->10.1 (+0.0)  good 100->100 (+0.0) turns 7.8->8.1 (+3.8)  none 0->0 (+0.0)
z30-boss    wren   casual 77->75 (-2.1) turns 9.5->9.5 (+0.0)  good 100->100 (+0.0) turns 7.7->7.8 (+1.3)  none 0->0 (+0.0)
z30-boss    tobin  casual 80->81 (+1.3) turns 12.5->12.8 (+2.4)  good 100->100 (+0.0) turns 9.5->9.5 (+0.0)  none 0->0 (+0.0)
z30-boss    pip    casual 63->59 (-4.1) turns 11.5->11.7 (+1.7)  good 100->100 (+0.0) turns 8.7->8.8 (+1.1)  none 0->0 (+0.0)
```
### twice-sworn, seed offset 1000
```
z16-boss    wren   casual 78->80 (+2.1) turns 11->10.8 (-1.8)  good 100->100 (+0.0) turns 8.6->8.6 (+0.0)  none 0->0 (+0.0)
z16-boss    tobin  casual 79->83 (+3.7) turns 15.3->14.6 (-4.6)  good 100->100 (+0.0) turns 11.1->11.1 (+0.0)  none 0->0 (-0.4)
z16-boss    pip    casual 64->64 (+0.0) turns 11.9->11.9 (+0.0)  good 100->100 (+0.0) turns 9.3->9.3 (+0.0)  none 0->0 (+0.0)
z20-boss    wren   casual 60->65 (+5.0) turns 9.8->9.8 (+0.0)  good 100->100 (+0.0) turns 8.2->8.2 (+0.0)  none 0->0 (+0.0)
z20-boss    tobin  casual 85->83 (-1.7) turns 13.8->14.2 (+2.9)  good 100->100 (+0.0) turns 11->11.2 (+1.8)  none 0->0 (+0.0)
z20-boss    pip    casual 77->78 (+1.2) turns 9.3->9.5 (+2.2)  good 100->100 (+0.0) turns 6.8->7 (+2.9)  none 0->0 (+0.0)
z25-boss    wren   casual 77->85 (+7.9) turns 8.7->8.9 (+2.3)  good 100->100 (+0.0) turns 7.2->7.2 (+0.0)  none 0->0 (+0.0)
z25-boss    tobin  casual 83->78 (-4.6) turns 12.8->12.5 (-2.3)  good 100->100 (+0.0) turns 9.7->9.8 (+1.0)  none 0->0 (+0.0)
z25-boss    pip    casual 48->50 (+1.3) turns 10.2->10.3 (+1.0)  good 100->100 (+0.0) turns 7.9->8.2 (+3.8)  none 0->0 (+0.0)
z30-boss    wren   casual 67->73 (+6.6) turns 9.5->9.7 (+2.1)  good 100->100 (+0.0) turns 7.9->7.9 (+0.0)  none 0->0 (+0.0)
z30-boss    tobin  casual 76->79 (+2.9) turns 13.1->13.2 (+0.8)  good 100->100 (+0.0) turns 9.4->9.5 (+1.1)  none 0->0 (+0.0)
z30-boss    pip    casual 58->55 (-3.3) turns 11.3->11.4 (+0.9)  good 100->100 (+0.0) turns 8.8->8.9 (+1.1)  none 0->0 (+0.0)
```
### moss-sword, seed offset 0
```
z16-boss    tobin  casual 80->84 (+3.8) turns 15.2->14.4 (-5.3)  good 100->100 (+0.0) turns 11.1->10.4 (-6.3)  none 0->0 (+0.0)
z20-boss    tobin  casual 80->82 (+1.7) turns 13.9->13.3 (-4.3)  good 100->100 (+0.0) turns 11.2->10.2 (-8.9)  none 0->0 (+0.0)
z25-boss    tobin  casual 80->80 (+0.4) turns 13->12.5 (-3.8)  good 100->100 (+0.0) turns 9.4->9.2 (-2.1)  none 0->0 (+0.0)
z30-boss    tobin  casual 80->84 (+3.8) turns 12.5->12.1 (-3.2)  good 100->100 (+0.0) turns 9.5->9.2 (-3.2)  none 0->0 (+0.0)
```
### moss-sword, seed offset 1000
```
z16-boss    tobin  casual 79->84 (+5.0) turns 15.3->14.7 (-3.9)  good 100->100 (+0.0) turns 11.1->10.6 (-4.5)  none 0->0 (-0.4)
z20-boss    tobin  casual 85->85 (-0.4) turns 13.8->13.3 (-3.6)  good 100->100 (+0.0) turns 11->10 (-9.1)  none 0->0 (+0.0)
z25-boss    tobin  casual 83->85 (+2.1) turns 12.8->12.5 (-2.3)  good 100->100 (+0.0) turns 9.7->9.4 (-3.1)  none 0->0 (+0.0)
z30-boss    tobin  casual 76->80 (+4.1) turns 13.1->12.7 (-3.1)  good 100->100 (+0.0) turns 9.4->9.2 (-2.1)  none 0->0 (+0.0)
```
### quarry-shield, seed offset 0
```
z16-boss    tobin  casual 80->87 (+6.7) turns 15.2->13.8 (-9.2)  good 100->100 (+0.0) turns 11.1->9.5 (-14.4)  none 0->0 (+0.0)
z20-boss    tobin  casual 80->76 (-4.2) turns 13.9->14.2 (+2.2)  good 100->100 (+0.0) turns 11.2->9.8 (-12.5)  none 0->0 (+0.0)
z25-boss    tobin  casual 80->88 (+7.5) turns 13->11.9 (-8.5)  good 100->100 (+0.0) turns 9.4->8 (-14.9)  none 0->0 (+0.0)
z30-boss    tobin  casual 80->85 (+5.0) turns 12.5->11.9 (-4.8)  good 100->100 (+0.0) turns 9.5->8.3 (-12.6)  none 0->0 (+0.0)
```
### quarry-shield, seed offset 1000
```
z16-boss    tobin  casual 79->87 (+7.5) turns 15.3->13.9 (-9.2)  good 100->100 (+0.0) turns 11.1->9.5 (-14.4)  none 0->0 (+0.0) turns 14->14 (+0.0)
z20-boss    tobin  casual 85->83 (-1.7) turns 13.8->14 (+1.4)  good 100->100 (+0.0) turns 11->9.8 (-10.9)  none 0->0 (+0.0)
z25-boss    tobin  casual 83->88 (+5.4) turns 12.8->11.9 (-7.0)  good 100->100 (+0.0) turns 9.7->8.2 (-15.5)  none 0->0 (+0.0)
z30-boss    tobin  casual 76->83 (+6.2) turns 13.1->12 (-8.4)  good 100->100 (+0.0) turns 9.4->8.5 (-9.6)  none 0->0 (+0.0)
```
### quarry-plate, seed offset 0
```
z16-boss    tobin  casual 80->88 (+7.5) turns 15.2->14 (-7.9)  good 100->100 (+0.0) turns 11.1->9.7 (-12.6)  none 0->0 (+0.0)
z20-boss    tobin  casual 80->80 (+0.4) turns 13.9->13.8 (-0.7)  good 100->100 (+0.0) turns 11.2->9.7 (-13.4)  none 0->0 (+0.0)
z25-boss    tobin  casual 80->83 (+2.5) turns 13->12.7 (-2.3)  good 100->100 (+0.0) turns 9.4->8.1 (-13.8)  none 0->0 (+0.0)
z30-boss    tobin  casual 80->73 (-6.7) turns 12.5->12.7 (+1.6)  good 100->100 (+0.0) turns 9.5->9.1 (-4.2)  none 0->0 (+0.0)
```
### quarry-plate, seed offset 1000
```
z16-boss    tobin  casual 79->89 (+9.6) turns 15.3->14.1 (-7.8)  good 100->100 (+0.0) turns 11.1->9.8 (-11.7)  none 0->0 (-0.4)
z20-boss    tobin  casual 85->83 (-2.5) turns 13.8->13.4 (-2.9)  good 100->100 (+0.0) turns 11->9.5 (-13.6)  none 0->0 (+0.0)
z25-boss    tobin  casual 83->85 (+1.7) turns 12.8->12.5 (-2.3)  good 100->100 (+0.0) turns 9.7->8.4 (-13.4)  none 0->0 (+0.0)
z30-boss    tobin  casual 76->75 (-1.7) turns 13.1->13.3 (+1.5)  good 100->100 (+0.0) turns 9.4->9.1 (-3.2)  none 0->0 (+0.0)
```
### bat-quiver, seed offset 0
```
z16-boss    wren   casual 76->79 (+2.5) turns 10.8->10.5 (-2.8)  good 100->100 (+0.0) turns 8.4->8.5 (+1.2)  none 0->0 (+0.0)
z20-boss    wren   casual 60->63 (+2.9) turns 9.6->9.4 (-2.1)  good 100->100 (+0.0) turns 8.1->8.4 (+3.7)  none 0->0 (+0.0)
z25-boss    wren   casual 82->88 (+5.4) turns 8.6->8.5 (-1.2)  good 100->100 (+0.0) turns 7.3->7.6 (+4.1)  none 0->0 (+0.0)
z30-boss    wren   casual 77->79 (+2.1) turns 9.5->9.6 (+1.1)  good 100->100 (+0.0) turns 7.7->8 (+3.9)  none 0->0 (+0.0)
```
### bat-quiver, seed offset 1000
```
z16-boss    wren   casual 78->79 (+1.3) turns 11->10.6 (-3.6)  good 100->100 (+0.0) turns 8.6->8.7 (+1.2)  none 0->0 (+0.0)
z20-boss    wren   casual 60->69 (+9.6) turns 9.8->9.4 (-4.1)  good 100->100 (+0.0) turns 8.2->8.4 (+2.4)  none 0->0 (+0.0)
z25-boss    wren   casual 77->84 (+7.1) turns 8.7->8.8 (+1.1)  good 100->100 (+0.0) turns 7.2->7.5 (+4.2)  none 0->0 (+0.0)
z30-boss    wren   casual 67->73 (+6.2) turns 9.5->9.7 (+2.1)  good 100->100 (+0.0) turns 7.9->8.1 (+2.5)  none 0->0 (+0.0)
```
### bat-bow, seed offset 0
```
z16-boss    wren   casual 76->78 (+2.0) turns 10.8->10.3 (-4.6)  good 100->100 (+0.0) turns 8.4->8.1 (-3.6)  none 0->0 (+0.0)
z20-boss    wren   casual 60->70 (+9.6) turns 9.6->9.4 (-2.1)  good 100->100 (+0.0) turns 8.1->8 (-1.2)  none 0->0 (+0.0)
z25-boss    wren   casual 82->83 (+1.2) turns 8.6->8.5 (-1.2)  good 100->100 (+0.0) turns 7.3->7.2 (-1.4)  none 0->0 (+0.0)
z30-boss    wren   casual 77->80 (+3.3) turns 9.5->9.3 (-2.1)  good 100->100 (+0.0) turns 7.7->7.6 (-1.3)  none 0->0 (+0.0)
```
### bat-bow, seed offset 1000
```
z16-boss    wren   casual 78->78 (+0.0) turns 11->10.3 (-6.4)  good 100->100 (+0.0) turns 8.6->8.2 (-4.7)  none 0->0 (+0.0)
z20-boss    wren   casual 60->69 (+9.6) turns 9.8->9.4 (-4.1)  good 100->100 (+0.0) turns 8.2->8 (-2.4)  none 0->0 (+0.0)
z25-boss    wren   casual 77->78 (+1.6) turns 8.7->8.5 (-2.3)  good 100->100 (+0.0) turns 7.2->7.2 (+0.0)  none 0->0 (+0.0)
z30-boss    wren   casual 67->72 (+5.0) turns 9.5->9.4 (-1.1)  good 100->100 (+0.0) turns 7.9->7.7 (-2.5)  none 0->0 (+0.0)
```
