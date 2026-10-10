# Red team, group A: badnews, defeat, dodge, fallingletter (Oriel v6, 32 frames)

All 32 v6 frames were opened at full size, after the four review sheets. Crops are in `v6/crops/`, named `<move>-<n>-<what>.png`.
Staff length is the straight-line distance in px from the tip of the star finial (or the far edge of the ring when the staff is level) to the
visible butt end. Where the butt goes behind a boot in an upright hold, I measured to where it disappears (allowed by the brief).
I measured the finial top and the level or lying ends from the alpha mask, and read the butt ends off 2-3x grid crops (about ±10 px).
"%" is the share of the longest staff in the same move. Star-ring size is a scale check: about 125-130 px across in every upright frame.

White pockets: from the existing `v6/judge/pockets.json` (I did not re-run the tool). No blob in these 32 frames is over 60 px. The largest
is 52 px, inside the star ring of defeat 7. No cut faults to report.

Lantern glass is warm gold in all 32 frames. No staff bends in any frame. No frame has a third hand or arm.

## Frame table

| move | frame | hands/arms | third hand? | morph | staff (px, % of longest) | meaning | cut | severity |
|---|---|---|---|---|---|---|---|---|
| badnews | 1 | 2 | no | No book at either hip. A brown tassel hangs at the rear hip where idle 1 has the navy book (`badnews-1-6-7-8-hip.png`) | ~705, 86% (butt behind rear boot top) | ok | none | minor |
| badnews | 2 | 2 | no | none | ~705, 86% | ok: front hand lifts the book at the front hip | none | clean |
| badnews | 3 | 2 | no | **Her face turns ashen grey for one frame.** Mean skin colour is RGB 183,151,138 here, against 226,150,104 in frame 4 and 219,144,99 in frame 2 (`badnews-3-face.png`) | ~712, 86% | ok: reading, eyes down | none | **major** |
| badnews | 4 | 2 | no | none | ~705, 86% | ok: looks up, frowning | none | clean |
| badnews | 5 | 2 (book hand's forearm is under the book, cuff shows; `badnews-5-arms.png`) | no | none | **824, 100%** (butt cap well behind her, star far in front) | ok: staff points at the foe, open book in her other hand | none | clean |
| badnews | 6 | 2 | no | none | ~700, 85% | ok: book shut at chest | none | clean |
| badnews | 7 | 2 | no | none | ~700, 85% | ok: book back at the front hip | none | clean |
| badnews | 8 | 2 | no | Book gone again, tassel only (same as frame 1) | ~700, 85% | ok | none | minor |
| defeat | 1 | 2 | no | none | ~834, 99% | ok: reeling back, staff in rear hand | none | clean |
| defeat | 2 | 2 | no | none | ~802, 96% | ok, but the staff is now in her front hand on her right side (it was in her rear hand in frame 1) | none | minor |
| defeat | 3 | 2 | no | Dark hair strands and smudges cross her eye and cheek; the face reads dirty (`defeat-2-3-4-face.png`) | **839, 100%** (longest) | Weak: the "slip" is only a slight tilt, and she still grips the staff high | none | minor |
| defeat | 4 | 2 | no | Beard fixed: her chin is clean and her face shows | ~715, 85% | **The staff jumps from her front side (frames 2-3) to her rear side, upright and gripped again, then lies in front of her in frame 5.** This is the old "slipped staff stands back up" fault again (`defeat-2-3-4-5-staff-side.png`) | none | **major** |
| defeat | 5 | 2 | no | none | **601, 72%** lying. The star ring is ~100 px across here, against ~130 upright (`defeat-3-5-7-ring-size.png`), so the staff is drawn smaller, not foreshortened | ok: on her hands, staff beside her | none | **major (borderline)**: 28% shorter, past the 20-25% lying allowance |
| defeat | 6 | 2 (one under her cheek, one on the ground; `defeat-6-hands.png`) | no | none | **587, 70%** lying | ok: collapses onto her side | none | **major (borderline)**, as frame 5 |
| defeat | 7 | 1 shows (other arm under her) | no | Book no longer at her hip | **587, 70%** lying | ok | none (52 px pocket in the star ring, under the 60 px threshold) | **major (borderline)**, as frame 5 |
| defeat | 8 | 1 shows | no | Book gone | 669, 80% lying. The staff **grows 14%** from frame 7 while she lies still. This is the frame the game holds | ok: eyes closed | none | minor |
| dodge | 1 | 2 | no | none | ~760, 97% (butt behind boot) | ok | none | clean |
| dodge | 2 | 2 | no | none | **780, 100%** (butt cap shows) | ok: crouch | none | clean |
| dodge | 3 | 2 | no | Two legs, both boots show (`dodge-3-legs.png`). The hip book draws as two gold-edged navy blocks end to end, like two books (`dodge-3-book.png`) | ~665, 85%. The butt narrows to a point with no butt cap | ok: in the air, staff close | none | minor |
| dodge | 4 | 2 | no | **Three boots.** Three separate boot feet with toe caps under the hem: left (x~170-230, y~610-720), centre (x~245-330, y~680-800) and right (x~335-410, y~610-720), plus the bent-knee boot cuff above them (`dodge-4-legs.png`). That is an extra leg, the exact fault the v6 fix line "two legs, clearly separate" was meant to stop | ~615, 79% (butt meets the left boot) | ok: in the air, mantle flaring | none | **major** |
| dodge | 5 | 2 | no | none | ~774, 99% | ok: lands crouched | none | clean |
| dodge | 6 | 2 | no | none | ~745, 96% | ok | none | clean |
| dodge | 7 | 2 | no | none | ~742, 95% | ok | none | clean |
| dodge | 8 | 2 | no | none | ~740, 95% | ok | none | clean |
| fallingletter | 1 | 2 | no | No book at the rear hip (it shows in frames 2-3). Star ring ~15% larger than in the other frames | ~761, 93% | ok, faces right | none | minor |
| fallingletter | 2 | 2 (stacked on the staff) | no | none | ~793, 97% | ok: both hands on the staff, faces right | none | clean |
| fallingletter | 3 | 2 (both arms up, one wide sleeve shows) | no | none. **Faces right: the old fault is fixed** | **~520, 63%**. Visible from the finial to where the shaft goes behind her belt at y~520; nothing shows below the belt (`fallingletter-3-4-staff.png`, `fallingletter-3-4-butt.png`) | ok: staff overhead, face up | none | **major** |
| fallingletter | 4 | 2 (both arms up in one sleeve) | no | none. Faces right (fixed) | **~388, 47%**. The shaft ends where her lower forearm ends, at y~385, and nothing shows below (`fallingletter-3-4-butt.png`). Star ring ~100 px, against ~135 in frame 1. It reads as a short sceptre ending at her fists, the "short wand" the fix line bans | Weak: "on tiptoe" draws as fully airborne, feet dangling | none | **major** |
| fallingletter | 5 | 2 | no | none | 724, 88% (butt cap well behind her, star far in front: **old fault fixed**) | Mostly ok. Her front hand points at the sky, but the staff is held at her chest, not at arm's length | none | clean |
| fallingletter | 6 | 2 | no | none | 763, 93% (fixed) | ok: holds, looks up | none | clean |
| fallingletter | 7 | 2 | no | Book not visible at the hip | **~820, 100%** (butt cap near the ground) | ok: calm, arms lowered | none | minor |
| fallingletter | 8 | 2 | no | Book not visible | ~721, 88% | ok | none | minor |

## Per move

### badnews: **wire skipping frame 3**
- First-ruling fault (frame 5, half-length staff): **fixed.** Frame 5's staff is 824 px, the longest in the move. The butt cap shows far
  behind her and the star is far in front.
- New: frame 3 turns her skin grey for one frame. It flickers between the warm faces of frames 2 and 4, so it is a body morph (one of Cal's
  three faults). Frame 4 also shows the open book, so skipping 3 loses nothing.
- Minor: frames 1 and 8 have no book on her hip (idle 1 has it at her rear hip), so the book appears in frame 2 and vanishes after frame 7.
  At game size a navy book on a navy mantle is hard to see.

### defeat: **reroll** (the fallback is "wire skipping frame 4", only if the judge accepts a lying staff about 30% shorter)
- First-ruling fault, beard (frame 4): **fixed.**
- First-ruling fault, the slipped staff stands back up (frame 4): **not fixed.** Frame 3 barely slips. Then frame 4 moves the staff to her
  other side and stands it upright and gripped again, and frame 5 lays it in front of her. The staff crosses her body twice in three frames.
- Short lying staff (frames 5-7): 601, 587 and 587 px against 839 upright (72%, 70%, 70%). This is past the 20-25% lying allowance. It
  is not foreshortening: the star ring is drawn ~22% smaller (~100 px against ~130), so the whole staff shrank. Frame 8 then grows it back to
  669 px (80%), and frame 8 is the held frame. These are the closest calls in this group; the judge should check
  `defeat-3-5-7-ring-size.png` before ruling.
- Skipping frame 4 leaves 3 then 5, which reads well. It does not help 5-7.

### dodge: **wire skipping frame 4**
- First-ruling fault (staff pumps from 100% to ~65% in 3, 4, 6 and 7): **fixed.** The lowest is now 79% (frame 4); the rest are 85-99%.
- New: frame 4 has **three boot feet**, an extra leg. This is a body morph (Cal's fault). It sits in the jump, and dodge plays in every
  fight. Frame 3 to frame 5 (in the air, then landing) still reads as a dodge without it.
- Minor: frame 3's butt narrows to a point with no butt cap, and its hip book looks doubled at full size. At game size it is one navy shape.

### fallingletter: **reroll** (frames 3-4)
- First-ruling fault (she faces left in 3-4): **fixed.** She faces right in all 8 frames and tilts her head back to look up.
- First-ruling fault (half-length staff in 5-6): **fixed** (724 and 763 px, 88% and 93%).
- New: the short staff has moved to the raise. Frame 3 is ~63% and frame 4 is ~47%. In frame 4 the staff ends at her fists and forearm, and
  its star is drawn ~25% smaller. This is the "short wand" the v6 fix line bans, and it is the key frame of the move.
- Skipping 3-4 would jump from frame 2 (staff in both hands at her chest) straight to the release. The raise to the sky is the meaning of
  the move, so skipping is not an option.
- Minor: the book is missing from her hip in 1, 7 and 8. Frame 4 shows her floating, not on tiptoe.

## Totals (32 frames)

| fault | count | frames |
|---|---|---|
| Third hands | 0 | none |
| Body morphs | 2 | badnews 3 (grey skin), dodge 4 (three boots, an extra leg) |
| Bendy staffs | 0 | none |
| Short staffs | 5 (2 clear, 3 borderline) | fallingletter 3 (63%), fallingletter 4 (47%, ends at her fists); defeat 5, 6, 7 (lying, 72/70/70%, past the 25% allowance, star ring drawn smaller) |
| Other majors | 1 | defeat 4 (staff jumps across her body and stands back up, the old fault) |
| Major frames | 8 | badnews 3; defeat 4, 5, 6, 7; dodge 4; fallingletter 3, 4 |
| Minor frames | 9 | badnews 1, 8; defeat 2, 3, 8; dodge 3; fallingletter 1, 7, 8 |
| Clean frames | 15 | badnews 2, 4, 5, 6, 7; defeat 1; dodge 1, 2, 5, 6, 7, 8; fallingletter 2, 5, 6 |

The art thread's claim that all 8 frames pass is wrong for every move in this group. Arguing: badnews **wire skipping 3**, dodge **wire
skipping 4**, defeat **reroll**, fallingletter **reroll**.
