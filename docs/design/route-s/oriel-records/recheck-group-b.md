# Red team, group B: idle, letters, mining, nova (Oriel v6 recheck, 10 Oct 2026)

Every frame was opened at full size and checked against the review sheet, `moves.json` / `kit.json` / `gather.json` and
`extra-v6.json`. Coordinates are `(x, y)` in px in the full-size v6 frame (`v6-judge-rebrief/frames/<move>-<n>.png`).
Crops are in `v6/crops/` (`idle-*`, `letters-*`, `mining-*`, `nova-*`).

How I measured length: a staff runs from the top of the star finial to the brass butt cap. A pick runs from the butt end of
the handle to where the handle meets the iron head. I read the end points off 50 px grid overlays (accurate to about +-10 px).
The % is against the longest length in the same move. The frames are cropped one by one, but her head and the pick head stay
the same size in px from frame to frame, so the % figures compare like with like (within about 5%).

## Per-frame table

| move | frame | hands/arms | third hand? | morph | staff (px, % of longest) | meaning | cut | severity |
|---|---|---|---|---|---|---|---|---|
| idle | 1 | 2 / 2 | no | none; navy book at rear hip (160-250, 440-550), lantern glass gold | ~715 visible, 77% of idle 6; butt passes behind the rear boot cuff (allowed) | ready, faces right | none | clean |
| idle | 2 | 2 / 2 | no | none; book, gold glass | ~715, 77% (butt behind boot) | breathes in (small change from 1) | none | clean |
| idle | 3 | 2 / 2 | no | none; book, gold glass | ~715, 77% (butt behind boot) | glances up, clear | none | clean |
| idle | 4 | 2 / 2 | no | none | ~715, 77% (butt behind boot) | looks back at foe | none | clean |
| idle | 5 | 2 / 2 | no | none | ~700, 75% (butt behind boot) | weight shift barely shows (same as 4) | 65 px pale speck on the boot (98-106, 720-731) is a highlight, not a hole | clean |
| idle | 6 | 2 / 2 | no | none | ~930, 100% (longest); staff now in front of the boot, butt on the ground | taps the staff butt, clear | none | clean (staff passes in front of the boot only in this frame; fine for a tap) |
| idle | 7 | 2 / 2 | no | none | ~700, 75% (butt behind boot) | breathes out | none | clean |
| idle | 8 | 2 / 2 | no | none | ~700, 75% (butt behind boot) | ready, matches 1 | none | clean |
| letters | 1 | 2 / 2 | no | none; navy book on its strap at rear hip (130-240, 470-650) | ~893, 100% | ready, front hand open | none | clean |
| letters | 2 | 2 / 2 (staff hand + one hand on the book's top edge, 470-500, 330-360) | no | one book only; empty brown holster at rear hip (fine, the book is in hand) | ~887, 99% | unclips the book, reads | none | clean |
| letters | 3 | **3**: staff hand (205-250, 320-380); a bare hand under the open book (100-150, 405-430) on a brown-bracer forearm (165-215, 370-410) that comes out of the staff arm's own cream sleeve; and the real front hand hanging empty at her right hip (540-610, 470-600), fingers smeared | **YES** | the staff below the grip turns pale cream for ~60 px (215-240, 380-440) | ~828, 93% | wrong: the book is not in her front hand, an extra arm holds it behind her | front-hand fingers broken/smeared with a white fleck (crop `letters-3-right-hand.png`) | **major** (Cal's third arm) |
| letters | 4 | 2 / 2 | no | none | ~808, 90% | steps forward, book swung around in front hand | none | clean |
| letters | 5 | 2 / 2 | no | none | ~833, 93% | release: book at arm's length toward the foe | none | clean |
| letters | 6 | 2 / 2 | no | none | ~827, 93% | holds the open book out, lowering | none | clean |
| letters | 7 | 2 / 2 | no | none | ~892, 100% | closes the book, held at the chest | none | clean |
| letters | 8 | 2 / 2 | no | **book gone**: no book in hand or on the hip, only the empty brown holster (crop `letters-1to8-rear-hip.png`, last tile). Frame 1, idle and every other ready pose show the book here | ~812, 91% | ready stance, but the book has vanished | none | **major** (book missing; pops back when idle cuts in) |
| mining | 1 | 2 / 2 (grey-gloved rear hand 175-215, 380-420; bare front hand 395-440, 360-400) | no | none; navy hair, book at rear hip, staff slung on back | pick 387, 100% (longest) | ready hold across the body | none | clean |
| mining | 2 | 2 / 2 | no | grey glove now on the other hand (the lower hand, 165-200, 220-265) | pick ~200 visible = 52%; the lower forearm runs along the handle line, so counting it gives about ~270 = 70% | raises the pick over her rear shoulder | none | minor (borderline length; re-open) |
| mining | 3 | 2 / 2 | no | hair navy-black (first-ruling chestnut is gone) | pick ~292, 75% | pick high overhead, both hands on the haft | none | clean |
| mining | 4 | 2 / 2 (both on the haft, 400-500, 430-500) | no | no glove on either hand | pick ~262, **68%** (the butt wrap shows at 380-420, 435-460, so this is its full length) | swings down, bending forward | none | minor (borderline, just under 70%) |
| mining | 5 | 2 / 2 | no | no glove on either hand | pick ~264, **68%** (butt wrap visible at 345-390, 435-455) | impact: head low in front, knees bent | none | minor (borderline, just under 70%) |
| mining | 6 | 2 / 2 (bare rear fingers 340-380, 345-380; grey-gloved front hand 380-440, 335-385) | no | glove has moved to the front hand | pick **~220, 57%** (butt end ~345, 365 to the head at ~540, 395). The head is still 200 px tall against 222 in frame 1, so the handle shrank, not the whole pick. Crop `mining-6-pick-grid.png` | small recoil | none | **major** (pick under 70%; the first-ruling "1.7x" fault is back at 1.76x) |
| mining | 7 | 2 / 2 | no | none | pick ~354, 91%; iron head shows (first-ruling fault fixed) | pulls the pick back toward the hip | none | clean |
| mining | 8 | 2 / 2 | no | none | pick ~383, 99% | back to the ready hold, matches 1 | none | clean |
| nova | 1 | 2 / 2 | no | **no book**: a brown leather pouch/holster with a gold star line sits at the rear hip (170-240, 430-530) where idle shows the navy book (crop `nova-1-hip.png`) | ~825, 93% | ready, front hand open | none | **major** (pouch in the book's place) |
| nova | 2 | 2 / 2 (both on the shaft, 300-430, 280-420); no third fist | no | navy book now shows, slung high on her back (110-230, 265-385) | ~668, 75%; butt shows well behind the lower hand, star far in front | crouches low, staff in both hands | none | clean (on its own; it is the book-present half of the flicker) |
| nova | 3 | 2 / 2 (230-330, 140-230) | no | book gone again, brown pouch at hip (140-210, 520-600) | **~474, 54%** (star ~(30,15) to butt cap ~(420,285)). Crop `nova-3-staff-grid.png` | lifts the staff overhead in both hands, on her toes; she faces up-right with her back half to us | none | **major** (short staff + pouch) |
| nova | 4 | **3 hands on the shaft**: top hand (466-507, 372-426) on a brown-bracer forearm; middle hand (448-498, 426-476) on the gold-bracer cream-sleeve arm; bottom hand (457-498, 476-522) on a second brown-bracer forearm. Crop `nova-4-hands.png` | **YES** | book on back (80-200, 420-510) with a purple scrap on top (170-190, 400-420); face is clean (first-ruling eye smear fixed) | ~845, 95%; star on top | release: slams the butt down, knees bent | none | **major** (Cal's third hand, on the release key frame) |
| nova | 5 | 2 / 2 | no | book gone (brown pouch, 200-280, 460-530); the bun has mostly come loose, hair streams left (the fix line asked for the bun to stay pinned); a loose hair loop floats just right of the shaft (475-500, 295-325) | ~855, 97%; star on top (first-ruling "no star" fixed) | holds the slam, head down, mantle and curls blown out | **white cut, 210 px**, on the mantle's left edge (68-94, 508-525) (crop `nova-5-mantle-gap.png`) | **major** (pouch/book flicker) + minor (white cut, loose bun) |
| nova | 6 | 2 / 2 (390-450, 300-400); no chest blob | no | book on back again (90-200, 300-410) | **~552, 62%** (butt ~(325,510) to star ~(575,15)). Crop `nova-6-staff-grid.png` | still crouched, looks up | none | **major** (short staff) |
| nova | 7 | 2 / 2 (top 360-410, 270-330 on a long gold-wrapped forearm; bottom 365-410, 400-440 on a brown-bracer forearm) | no | book gone (brown pouch at 210-260, 450-560) | ~885, 100% (longest) | stands, pulling the staff upright | none | **major** (pouch/book flicker) |
| nova | 8 | 2 / 2 | no | no book, brown pouch at rear hip (195-260, 400-500) | ~795, 90% | ready, staff back in the rear hand | 41 px white fleck on the front fingertip (545-553, 271-281); that hand shows only 3 thin splayed fingers | **major** (pouch) + minor (fingertip) |

No bendy staff anywhere in the 32 frames. Every staff is one straight brass shaft with the star at the top end. The lantern glass
is warm gold in all 32. Hair is navy-black everywhere; the warm curls by her cheek match idle, so they are not a colour change.
Apart from nova 5, no white cut over 60 px, and none of the small specks flicker.

## Per move: verdict argued

### idle: **wire (1-8)**
- First-ruling faults: red lantern glass is **fixed** (warm gold in all 8). The pouch at the rear hip is **fixed** (the navy book
  hangs on its strap in all 8, crop `idle-1to8-hip-book-lantern.png`).
- Nothing against it. The staff butt sits behind the rear boot cuff in 1-5, 7 and 8 (an upright hold, allowed) and comes in front
  of the boot to touch the ground in 6, which suits a tap. Frames 4-5 barely differ, but idle is held at 1 with code breathing,
  so that does not matter.

### letters: **reroll** (fallback if Cal wants it now: wire skipping 3, and also 8 if the book-gone fault is upheld)
- First-ruling faults: the third hand and second book in frame 2 are **fixed**. The floating staff in frame 3 is **fixed** (the
  rear hand holds it), **but frame 3 now has a new third hand.** The open book is held by a bare hand on a brown-bracer forearm
  that comes out of the staff arm's own sleeve, while her real front hand hangs empty at her right hip with smeared fingers. This
  is exactly Cal's "third arm", on the backswing key frame.
- New: frame 8 has no book at all. The book is in her hand in 7, then gone in 8, and back on her hip when idle cuts in.
- Skipping 3 still reads (2 book at hip, then 4 swinging it around). Skipping 8 means 7 cuts straight to idle, so the book jumps
  from her hand to her hip. Both are workable fallbacks, but the move as drawn breaks Cal's rule.

### mining: **reroll**
- First-ruling faults: chestnut hair in 3 is **fixed** (navy-black in all 8). The missing pick head in 7 is **fixed**. The handle
  being 1.7x longer in 1 and 8 is **not fixed**: 387 px in frame 1 and 383 px in frame 8, against about 220 px in 6 (1.76x) and
  about 263 px in 4-5 (1.47x). The iron head keeps its size (200-222 px tall in every frame), so only the handle shrinks. The fix
  line "the pickaxe is the same size in every frame" is not met. Frames 4-6 are the downswing, impact and recoil, so no skip
  avoids them.
- Minor: the grey glove jumps between hands (rear hand in 1, 3, 7, 8; front or lower hand in 2 and 6; no glove in 4-5). At game
  size it is a 5 px colour flicker on the hands.

### nova: **reroll**
- First-ruling faults:
  - Third fist in 2: **fixed** (two hands).
  - Probable chest blob in 6: **fixed**.
  - Grey smear over the eye in 4: **fixed** (the face is clean).
  - No star in 5: **fixed**.
  - Short staff in 2: **fixed** (75%).
  - Short staff in 3: **not fixed** (54%).
  - Short staff in 6: **not fixed** (62%).
- New: **frame 4 has three hands on the shaft**, stacked one above the other, each on its own forearm. That is Cal's third hand,
  on the release frame, so it cannot be skipped.
- New: **the book flickers.** It shows only in 2, 4 and 6, as a navy book slung high on her back. In 1, 3, 5, 7 and 8 a brown
  leather pouch sits where idle has the book. This is the same "pouch in the book's place" fault that re-briefed idle, and here it
  alternates frame by frame. Note: the old v5 frames seem to have had this too (old 4 and 7 show a back book, old 1 and 8 do not).
  The first ruling did not list it.
- Minor: 210 px white cut on the mantle edge in 5; the bun blown loose in 5 against the fix line; white fleck on the fingertip in 8.

## Totals (group B, 32 frames)

| fault | count | frames |
|---|---|---|
| Third hands (major) | **2** | letters 3, nova 4 |
| Body morphs (major) | **6 frames** (one fault type: the book missing or a pouch in its place) | nova 1, 3, 5, 7, 8; letters 8 |
| Bendy staffs | **0** | none |
| Short staff / pick under 70% (major) | **3** | nova 3 (54%), nova 6 (62%), mining 6 (57%) |
| Borderline length, judge to re-open (minor) | 3 | mining 4 (68%), mining 5 (68%), mining 2 (52% visible, ~70% counting the forearm along the haft) |
| Other majors | 0 | (the smeared front hand in letters 3 is part of that frame's third-hand fault) |
| Minors | 5 | mining glove swapping hands (2, 4, 5, 6); nova 5 white cut 210 px and loose bun; nova 8 fingertip fleck |

Major frames: 10 of 32 (letters 3, 8; mining 6; nova 1, 3, 4, 5, 6, 7, 8). Clean: all of idle; letters 1, 2, 4-7; mining 1, 3,
7, 8; nova 2.

Worst frames: **nova 4** (three hands on the staff at release), **letters 3** (an extra arm holds the book out of the staff
sleeve while the real front hand hangs empty), **nova 3** (staff at 54%), **mining 6** (pick handle at 57%, the 1.7x fault back).
