# Red team, group E: v7 second reroll, hex (Foretold), hunt, slivershum (Starfall)

Frames: `2d-poses-scenario/oriel-moves/v6-judge-rebrief/v7-second-reroll/frames/<move>-<n>.png`. I opened the review7 sheets first,
then all 24 frames at full size, then zoomed every hand, hip, face and staff/spear end. All crops are in `../crops/`.
Lengths are in frame px, measured end to end along the shaft (finial or point tip to butt cap). All frames are at the raw-sheet scale
(checked against `raw/hunt-v7.png`).

**A note on cuts:** the hunt frames carry colour from the next cell under alpha 0 (a spear tip at hunt 6's left edge, boot pieces at
hunt 5's right edge, a speck at hunt 7's left edge). This colour only shows in viewers that ignore alpha. Composited on grey, these
frames are clean (`crops/hunt-edge-fragments.png` is empty grey). It is the known conversion rule (cut at alpha 128, drop colour
under alpha 0), not an art fault. I did not count it.

## Frame table

Longest in move: hex 857 px (frame 1); hunt spear 803 px (frame 5); slivershum 900 px (frame 1, upright).

| move | frame | hands/arms | third hand? | morph | staff (px, % of longest) | meaning | cut | severity |
|---|---|---|---|---|---|---|---|---|
| hex | 1 | 2/2: staff hand, open front hand reaching to the foe | no | none. Navy book at the rear hip (dark, partly behind the mantle) | 857, 100% upright, star on top | ready, faces right; front hand reaches out rather than resting | none | clean |
| hex | 2 | 2/2: staff hand, clawed front hand at her chest | no | none | 850, 99% | claw at chest, OK | white speck (about 4x14 px) on the claw's middle finger; small orange smudge by the thumb (`crops/hex-4-fronthand.png`, right tile) | minor |
| hex | 3 | 2/2: claw drawn to her shoulder | no | none | 851, 99% | OK, glaring | small hair specks | clean |
| hex | 4 | 2/2: claw at her chest, five clear fingers | no | none. Book plain at the rear hip; hair navy-black, no copper | 853, 100% | lean in, OK | none | clean |
| hex | 5 | 2/2: front hand thrust at the foe | no | none | 839, 98% | release reads weakly: the hand is open and splayed like frames 1 and 8, not clawed | none | minor |
| hex | 6 | 2/2: front hand a closed fist at shoulder height | no | none | 838, 98% | "turns a key": a twisted fist, reads OK | none | clean |
| hex | 7 | 2/2: front hand lowered, open | no | none | 826, 96% | OK | none | clean |
| hex | 8 | 2/2 | no | none | 832, 97% | ready, OK | none | clean |
| hunt | 1 | 2/2: gloved rear hand and bare front hand on the spear | no | none. Staff slung, star on top; book at the rear hip; lantern gold | spear 714, 89%; butt about 150 px behind the rear hand | low stance, spear forward, OK | none | clean |
| hunt | 2 | 2/2: rear hand at the butt (head height), front hand mid-shaft | no | none | 710, 88% | draws back; reads more as a raised overhand grip, acceptable | none | clean |
| hunt | 3 | 2/2 | no | the spear point ends in a brass knob, like a butt cap on the blade (`crops/hunt-3-spearhead.png`) | 536, **67%**. **BENDY:** from the butt to the rear hand the shaft is near level (about 7°); after the rear hand it drops at about 27° and then 39° to the point (`crops/hunt-3-bend-overlay.png`, `hunt-3-shaft-bend.png`) | coiled, spear at the hip, OK | none | **major** (bendy spear, short spear) |
| hunt | 4 | 2/2 | no | the slung staff below her shoulder melts into a grey streaked smear and splits into two prongs with a white gap (`crops/hunt-4-back-staff.png`) | about 430 visible, **54%**; **ends at her rear fist**, nothing behind the hand (`crops/hunt-4-rearhand-back.png`) | the thrust starts; the spear is a stub behind her lead hand | none | **major** (short spear, ends at fist) |
| hunt | 5 | two forearms (two stacked bracers), **one hand** on the shaft (`crops/hunt-5-6-hands.png`) | no; fused hand | none | 803, 100%; butt cap far behind her back, OK | full thrust at chest height, OK | none (colour under alpha 0 only) | minor (fused hand; the old and v6 frames had the same one-hand thrust and the first ruling did not count it) |
| hunt | 6 | as frame 5: two bracers, one hand | no; fused hand | none | 736, 92% | holds, OK | none (colour under alpha 0 only) | minor |
| hunt | 7 | 2/2 | no | none | 658, 82% | pulls back, OK | none | clean |
| hunt | 8 | 2/2 | no | none | 588, 73% (passes, but only just); butt about 70 px behind the rear hand | ready, OK | none | minor (spear 27% shorter than at the thrust) |
| slivershum | 1 | 2/2 | no | **no navy book anywhere** (only belt flaps at the rear hip) | 900, 100% upright | ready, OK | none | minor (book missing) |
| slivershum | 2 | 2/2: both hands on the level staff | no | no book | 790, 88%; butt shows behind the rear hand, star far in front | wide stance, staff level, OK | none | minor (book missing) |
| slivershum | 3 | 2/2: gloved rear hand and bare front hand together by her head. A dark bracer and lining hang under the gloved hand beside the cream sleeve. It reads as one arm with its wide sleeve fallen, but the judge should glance at it (`crops/slivershum-3-4-arms.png`) | no (probably) | **a brown leather book or pouch with a gold star appears at her FRONT hip** (`crops/slivershum-1to4-hips.png`) | 564, **63%** (`crops/slivershum-staff-lengths.png`) | wind-up, star toward the foe, OK | white specks in her hair by the ornament (small) | **major** (short staff, pouch) |
| slivershum | 4 | 2/2, same arrangement as 3 | no (probably) | the same brown pouch at the front hip | 598, **66%** | eyes closed, staff drawn back, OK | none | **major** (short staff, pouch) |
| slivershum | 5 | 1 visible: front hand only; the rear arm is hidden under the mantle | no; rear hand missing | pouch gone again, no book | 820, 91%; butt cap shows well behind | release; "both hands" is not shown, but it reads as a one-hand drive | none | minor (missing rear hand, as in the old and v6 frames) |
| slivershum | 6 | 1 visible, as 5 | no | no book | 736, 82%; butt shows | hold, OK | none | minor |
| slivershum | 7 | 2/2: both hands on the upright staff (`crops/slivershum-7-hands.png`) | no | **the brown pouch is back at the front hip** | 883, 98% | steps back, OK | none | **major** (pouch flicker) |
| slivershum | 8 | 2/2 | no | no book, no pouch | 843, 94% | ready, OK | none | minor (book missing) |

Faces and hair: consistent navy-black hair and the same face in all 24 frames (`crops/hex-all-face.png`, `hunt-all-face.png`,
`slivershum-all-face.png`). A few thin copper-brown curl highlights sit on the right side of her hair in hunt 1-3, 7-8, hex 2-3
and slivershum 3. They are thin and steady, minor. There is no smear, no beard shadow and no copper face-side hair. Lantern glass is
warm gold in every frame. All three moves face right in every frame. Every staff and spear is checked for straightness with an
overlay line (`crops/hunt-spear-straightness.png`, `slivershum-staff-straightness.png`): all straight except hunt 3.

## Per move

### hex (Foretold): wire, frames 1-8
- v6 fault (frame 4's front hand melted into a blob): **fixed**. Frame 4 shows a clear claw with separate fingers and thumb.
- First ruling (frame 4: third hand, ghost arm with a staff stub, copper hair): **all fixed**. Two hands in every frame; one upright
  staff at 96-100%, star on top, butt by her rear boot; book at the rear hip in all 8.
- Against: frame 5's "clawed thrust" is an open splayed hand, almost identical to frames 1 and 8, so the release barely reads as a
  curse. There is a small white speck on frame 2's finger (re-cut). Neither is a reason to hold it. I cannot honestly argue against wiring hex.

### hunt: reroll (fallback, only on Cal's skip word: wire skipping frames 3 and 4)
- v6 fault (frames 5-6: spear short at the thrust): **fixed**. Frame 5's spear is the longest of the move (803 px) and frame 6's is
  736 px, with the butt cap far behind her back.
- First ruling (frames 4-6: spear shrinks, ends at her fist): frames 5-6 **fixed**; frame 4 **not fixed**. The spear still ends in her
  rear fist at about 54%. The extra-v7 line "at the thrust, a long part of the shaft sticks out behind her rear hand" fails here.
- New break: **frame 3's spear is bent.** It kinks about 20° at her rear hand and again near her front hand. That is Cal's "bendy
  staff" fault, and the brief says such a move is not wired. Frame 3's spear is also 67% long and ends in a brass knob past the blade.
- Also against: the spear grows from 588 px (frame 8, the ready pose) to 803 px (frame 5, the thrust), about 37%, inside a looping
  move. That is the same pumping that got dodge re-briefed, though every frame except 3-4 clears 70%. In frames 5-6 two forearms run
  into one hand, which is minor at game size and was there before. Frame 4's slung staff smears into a grey fork behind her
  shoulder.
- A skip of 3-4 leaves 1, 2, 5, 6, 7, 8 (ready, draw back, thrust, hold, pull back, ready). That still plays as a thrust, so it is a
  usable fallback, but as drawn the move fails.

### slivershum (Starfall): reroll (fallback: wire skipping frames 3, 4 and 7, which loses the wind-up and the recoil)
- v6 fault (frames 5-6: pointed staff short, butt missing): **fixed**. 820 px (91%) and 736 px (82%), with the brass butt cap well
  behind her. There is one star head only, and the butt cap is plain.
- First ruling (frames 5-6: a staff a third of its length): **fixed**.
- New break: **frames 3-4 (the wind-up overhead) have the staff at 63% and 66%.** The extra-v7 line explicitly asked for the full
  length "even when raised overhead". It failed. The star ring is the same size as in frame 1, so this is a short shaft, not
  foreshortening.
- New break: **the navy book is gone from the whole move**. The old and v6 frames carried it at the rear hip. Instead, a brown
  leather book or pouch with a gold star pops in at her FRONT hip in frames 3, 4 and 7 and vanishes in the other five. Under the
  first ruling's precedents (idle's pouch, victory 3's lantern-to-pouch), that is a costume morph. When idle (with its book) cuts
  into Starfall, the book vanishes. The first ruling did let "the book jumping place" pass as minor in attack and dodge, so the judge
  may downgrade it, but there the book stayed navy and stayed a book.
- Minor: frames 5-6 show only the front hand on the staff, so "both hands" is not drawn. The old and v6 frames were the same and
  were not counted. In frames 3-4, a dark bracer and sleeve lining hang under the gloved hand. I read it as one arm, but it is the
  place a "third arm" would be seen.
- Skipping 3 and 4 removes the charge (the draw-back and the eyes-closed focus), the heart of a "charge the star" finisher. Skipping
  7 as well leaves 1, 2, 5, 6, 8. That is a thin move, so I argue a reroll.

## Totals (24 frames)

| fault | count | frames |
|---|---|---|
| Third hands | 0 | none (fused or missing hand, minor: hunt 5, 6; slivershum 5, 6) |
| Body morphs | 3 | slivershum 3, 4, 7 (brown pouch or book pops in at the front hip; the navy book is missing from all 8 slivershum frames) |
| Bendy staffs or spears | 1 | hunt 3 |
| Short staffs or spears (<70% or ends at fist) | 4 | hunt 3 (67%), hunt 4 (54%, ends at her fist), slivershum 3 (63%), slivershum 4 (66%) |
| Other majors | 0 | (hunt 3's knob-tipped point is part of hunt 3's major) |
| Major frames | 5 | hunt 3, hunt 4, slivershum 3, slivershum 4, slivershum 7 |
| Minor frames | 10 | hex 2, 5; hunt 5, 6, 8; slivershum 1, 2, 5, 6, 8 |
| Clean frames | 9 | hex 1, 3, 4, 6, 7, 8; hunt 1, 2, 7 |

Worst frames: **hunt 3** (bent spear at 67%, knob on the point), **hunt 4** (spear ends at her fist, 54%), **slivershum 3** (staff 63%
plus pouch). The art thread's "all 8 pass" holds for hex only.
