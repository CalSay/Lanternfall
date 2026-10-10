# Red team, group-a: attack, spark, frostshard, arcaneward, hex, nova, parry, dodge (64 frames)

Method: I looked at each move's review sheet first. Then I opened all 64 frames at full size, composited on a flat
green-grey background. The raw PNGs hide RGB under alpha=0, so a plain viewer shows ghosts that are not really there.
I zoomed every doubtful region into `crops/<move>-<n>-<what>.png`. A script flagged opaque near-white clusters (white
pockets) and detached specks. I checked staff straightness with straight-line overlays.
Coordinates are full-size frame pixels `(x,y)` from the top-left. "Idle length" is the staff in attack 1 / spark 1
(star top to butt, about 820 px, butt at the boot).

## Pack-wide faults (not repeated in every row)

- **Star-ring white pockets**: 36 of 64 frames have one to four opaque white triangles inside the gold ring of the staff
  star. The cut-out left the background in. Each is about 15x18 px, so about 4x4 px at game size. Frames: attack
  2,3,5,6,8; frostshard 1,4,5,6,7; arcaneward 2,3,4,5,7,8; hex 1,2,5,6,7,8; nova 1,2,3,6; parry 2,3,4,6; dodge
  2,3,5,6,7,8. Each one is minor, but they flicker on and off between neighbouring frames.
- **White blobs in her hair**: 15x15 px white specks at the top or right of the bun. Frames: attack 6, frostshard 6,
  arcaneward 2,3, hex 2,3,8, nova 1,5,8, parry 1,4, dodge 1,2,8.
- **Lantern is drawn glowing** in all 64 frames: warm yellow core behind the glass. The design text says UNLIT. The
  concept sheet also shows it lit, so this is for the judge to rule on. It is consistent, not a morph.
- **Glove flicker**: a dark-grey fingerless glove appears on one hand in frostshard 2–6 and nova 2–7. It is absent in
  the frames either side (bare hands in frostshard 1/7/8 and nova 1/8). Minor at game size.
- **Hidden RGB under transparent pixels**: alpha is 0 there, so it is invisible in-game. One example is another frame's
  star at attack 6's left edge (0–20, 150–190), and there is figure debris at attack 5's right edge. This only matters
  if the converter ignores alpha or bleeds colour when downscaling. The converter should premultiply.
- **Bendy staff: none found** in my 64 frames. Every staff I checked against a ruler line is straight. The staff faults
  in this group are **length** faults: the shaft stops at the hand or at mid-thigh, so it shrinks and regrows between
  frames.

## Frame table

| move | frame | hands/arms | third arm? | morph | staff | meaning | cut | severity |
|---|---|---|---|---|---|---|---|---|
| attack | 1 | 2: rear on staff, front open | no | none | 1, straight, idle length | ok | clean | clean |
| attack | 2 | 2 arms. The lower (front) hand on the staff, below her chin at (300–340, 260–295), is a **fused fingerless lump** (crop attack-2-stafflower) | no (fused hand) | none | straight, but **truncated**: the shaft ends at that lump with no butt, about 45% of idle | swing back over shoulder: ok | 2 star pockets | **major** |
| attack | 3 | 2, both on staff overhead | no | none | straight, **truncated**: ends in a fat brass cap just past the lower hand at her right temple (400, 250), about 45% (crop attack-3-staffhands) | ok | 4 star pockets | **major** |
| attack | 4 | **2 forearms with bracers, 1 hand**. The near arm's hand is missing: a pale blob sits under its cuff at (430–450, 300–330) (crop attack-4-hands) | missing hand | none | straight, **starts at the front fist** with no shaft behind the hands, about 45% | whip forward-down: ok | pale speck at the missing hand | **major** |
| attack | 5 | 2 arms. Rear hand hidden or fused behind the front wrist (crop attack-5-hands) | no | book is a navy panel high on her back at shoulder-blade level (180–250, 220–290), not at the hip | **starts at the front fist** (510, 185), no butt end, about 40% | thrust at chest: ok | 3 star pockets | **major** |
| attack | 6 | same as 5 | no | same book on her back | **starts at the front fist**, about 40% | hold: ok | 3 star pockets, 2 hair specks (214, 75) and (376, 39) | **major** |
| attack | 7 | 2: rear on staff, front hanging at hip | no | none | idle length | ok | clean | clean |
| attack | 8 | 2 | no | none | idle length | ok | 1 star pocket (100–119, 37–54) | minor |
| spark | 1 | 2 | no | none | idle length | ok | clean | clean |
| spark | 2 | 2, two fingers raised | no | none | ok | ok | clean | clean |
| spark | 3 | **3 hands**. Her rear sleeve sends up an arm with a bracer to two fingers at her ear (220, 230), while **a second hand still grips the staff from the same sleeve** at (130, 350). The front hand also hangs open at her hip (510, 480) (crop spark-3-thirdhand) | **YES** | none | ok, straight | wrong arm: the rear (staff) arm makes the gesture, not the front hand | clean | **major** |
| spark | 4 | 2, two fingers pointing | no | none | ok | ok | clean | clean |
| spark | 5 | 2, front hand flicked high | no | none | ok | ok | clean | clean |
| spark | 6 | 2 | no | none | ok | ok | **large white pocket**, 22x46 px, between mantle and belt at her rear waist (225–247, 387–433). Visible on the review sheet (crop spark-6-whitepocket) | **major** (cut) |
| spark | 7 | 2 | no | none | ok | ok | clean | clean |
| spark | 8 | 2 | no | none | ok | ok | clean | clean |
| frostshard | 1 | 2 | no | none | idle length | ok | star pocket (53–70, 54–72) | minor |
| frostshard | 2 | 2. Rear hand in a dark glove | no | glove appears; big book at rear hip | straight, about 80% (butt visible behind her) | side-on, staff level: ok | clean | minor |
| frostshard | 3 | 2 | no | glove | straight, about 80% | weak: staff held level at shoulder, not drawn back like a spear | clean | minor |
| frostshard | 4 | 2 arms. Gloved hand on the staff, and **a second bare hand squashed under it, gripping nothing** at (430–470, 205–240) (crop frostshard-4-hands) | fused hand | glove | **starts at the hand**, no butt, about 35% | thrust: ok | star pocket, white sliver in the mantle by the book strap (160, 290) | **major** |
| frostshard | 5 | same as 4: second hand fused under the gloved one (crop frostshard-5-hands) | fused hand | glove | **starts at the hand**, about 35% | hold extended: ok | 2 star pockets | **major** |
| frostshard | 6 | 2 | no | glove | straight, about 75% | ok (mist is not drawn, correctly) | 2 star pockets, white blob in hair left of the bun (142–157, 99–117) (crop frostshard-6-hairwhite) | minor |
| frostshard | 7 | 2 | no | none | idle length | ok | star pocket | minor |
| frostshard | 8 | 2 | no | none | idle length | ok | clean | clean |
| arcaneward | 1 | 2 | no | none | idle length | ok | clean | clean |
| arcaneward | 2 | 2, front hand on the book strap | no | book shows at the **front** hip beside the lantern as a round-bottomed satchel (330–410, 450–510), not the rear-hip book (crop arcaneward-2-bookhip) | idle length | unclipping reads, but the staff is held like idle, not planted beside her | star pocket, hair speck (368–383, 152–165) | minor |
| arcaneward | 3 | 2: staff hand, book on the front palm | no | none | ok | ok | 2 star pockets, white blob on top of the bun (271–286, 98–111) (crop arcaneward-3-hairwhite) | minor |
| arcaneward | 4 | 2 | no | none | ok | ok | star pocket | minor |
| arcaneward | 5 | 2 | no | none | ok | ok | star pocket | minor |
| arcaneward | 6 | 2, arms wide | no | none | ok, straight | ok | clean | clean |
| arcaneward | 7 | 2, book closed on chest | no | none | ok | ok | star pocket | minor |
| arcaneward | 8 | 2 | no | none | ok | ok | star pocket | minor |
| hex | 1 | 2 | no | none | idle length, butt at the boot (205, 810) | ok | 2 star pockets | minor |
| hex | 2 | 2, claw at chest | no | none | straight, but the **butt stops at mid-thigh** (130, 690) with a pointed ferrule. Hand-to-butt shrinks about 25% from frame 1 | ok | 2 star pockets, hair speck | **major** (staff length jump 1→2) |
| hex | 3 | 2 | no | none | idle length again (175, 810) | ok | hair speck (370–385, 144–157) | minor |
| hex | 4 | **3+**. Rear staff hand at (160, 290), plus **a clawed hand from the same rear side right beside it** at (210, 260). Where the front arm should be, there is **a mangled brown/gold armature with a pale hand-like blob** at (410–470, 330–520) (crops hex-4-rearhands, hex-4-frontside) | **YES** | **hair turns copper-orange** on the face side (440–470, 200–260). Big book at rear hip | straight, butt at mid-thigh (160, 630), about 75% (crop hex-4-staffend) | wrong: the front hand should be clawed and drawn back; the rear hand does it | clean | **major** |
| hex | 5 | 2 | no | none | butt at mid-thigh (150, 670), about 80% | ok | 2 star pockets | **major** (length) |
| hex | 6 | 2 | no | none | butt at mid-thigh (135, 670), about 80% | ok | star pocket | **major** (length) |
| hex | 7 | 2 | no | none | idle length (165, 790) | ok | 2 star pockets | minor |
| hex | 8 | 2 | no | none | **butt at mid-thigh** (165, 640), about 78%. Does not match frame 1, so it pops on loop | ok | 2 star pockets, hair speck | **major** (length) |
| nova | 1 | 2 | no | none | idle length | ok | star pocket, hair speck (286–296, 86–97) | minor |
| nova | 2 | **3 hands**. Rear gloved fist above the shaft at (252–292, 238–270); **separate pink fingers wrapped round the shaft with no arm** at (306–340, 286–316); front hand at (340–388, 320–356) (crop nova-2-hands-zoom) | **YES** | glove | starts at the rear fist, about 63% | crouch, two-hand grip: ok | 3 star pockets | **major** |
| nova | 3 | 2, one gloved | no | glove | straight, butt at (545, 480), about 64% | overhead: ok | 2 star pockets | **major** (length) |
| nova | 4 | 2 | no | **grey smear across her cheek under the eye** (410–460, 330–380), like soot or a mask (crop nova-4-face) | idle length, butt on ground | slam: ok | clean | **major** (face) |
| nova | 5 | 2 | no | none | **no star**: the top ends in a small finial just above her hands (490, 180), about 75% (crop nova-5-stafftop) | head down, blown: ok | hair speck (494–508, 71–83) | **major** |
| nova | 6 | 2, plus **a reddish hand-shaped blob above the gloved fist** at her chest (330–357, 225–265) (crop nova-6-hands) | **probable** | glove | starts at the fist, star end on the ground, about 60% | weak: looks up at the sky, barely crouched | star pocket | **major** |
| nova | 7 | 2 | no | staff now in the front-side hands. It jumps to the rear hand in 8 | idle length | ok | clean | minor |
| nova | 8 | 2 | no | none | idle length | ok | hair speck (351–363, 106–116) | minor |
| parry | 1 | 2 | no | none | idle length | ok | hair speck (360–375, 138–149) | minor |
| parry | 2 | 2 | no | none | about 90%, straight | ok | 2 star pockets | minor |
| parry | 3 | 2, wide grip | no | **stray gold rod** poking out under her rear sleeve at (95–150, 420–440), at a different angle from the staff (crop parry-3-goldrod) | idle length | block: ok | star pocket | minor |
| parry | 4 | 2 | no | none | ok | ok | star pocket, hair speck (119–140, 94–103) | minor |
| parry | 5 | 2 arms. **Rear fist grips empty air** at (390–460, 140–185); the staff starts at the front fist (crop parry-5-hands) | no (empty hand) | none | **starts at the front fist**, about 40%, no butt | shove: ok | clean | **major** |
| parry | 6 | 2 | no | none | about 80%, held up mid-spin | ok | 2 star pockets | minor |
| parry | 7 | 2 | no | none | about 90% | ok | clean | clean |
| parry | 8 | 2 | no | none | about 85%, butt just above the boot | ok | clean | minor |
| dodge | 1 | 2 | no | none | idle length | ok | white patch on the back of the shoulder (185–205, 275–310), hair speck (crop dodge-1-back-and-hip) | minor |
| dodge | 2 | 2 | no | book gone from the hip; a brown leather book with cream pages pokes up behind her shoulder (195–240, 280–320) (crop dodge-2-backshoulder) | ok | crouch: ok | star pocket, hair speck | minor |
| dodge | 3 | 2 | no | none | straight, butt at (380, 510), **about 67%** | ok | 3 star pockets | **major** (length) |
| dodge | 4 | 2 | no | none | butt at (370, 520), **about 67%** | ok | clean | **major** (length) |
| dodge | 5 | 2 | no | book corner behind the shoulder again | about 90% | ok | 2 star pockets | minor |
| dodge | 6 | 2 | no | none | butt at her hip (215, 540), **about 70%** | ok | 2 star pockets | **major** (length) |
| dodge | 7 | 2 | no | none | butt at her hip (215, 500), **about 65%** | ok | star pocket | **major** (length) |
| dodge | 8 | 2 | no | none | idle length | ok | star pocket, hair speck | minor |

## Verdicts I argue for

- **attack: reroll.** Frames 2–6 are the whole strike, and in every one the staff is cut to half length. In 4 it
  starts at her fist. Frame 2 has a fused hand lump and frame 4 is missing a hand. No subset makes a strike.
- **spark: wire skipping frames 3 and 6.** Frame 3 has a third hand (staff hand plus finger-hand from the same sleeve).
  Frame 6 has a big white pocket at her waist. 2→4 still reads as a flick without 3.
- **frostshard: reroll.** Frames 4–5 are the release and hold. Both have a fused second hand and a staff that starts at
  the fist (about 35% length). Skipping them removes the thrust.
- **arcaneward: wire.** No third hands, morphs or staff faults. The faults are white star pockets and hair specks
  (minor, cut cleanup), plus the frame 2 satchel-shaped book at the front hip (minor).
- **hex: reroll.** Frame 4 is the worst frame in my group: a third clawed hand beside the staff hand, a mangled front
  arm, and copper hair. Also, the staff butt jumps between ankle and mid-thigh across 1→2→3→4/5/6→7→8, and the end frame
  8 does not match frame 1.
- **nova: reroll.** 5 of 8 frames are major. Frame 2 has a third hand on the shaft, 4 a face smear, 5 a staff with no
  star, and 6 a hand-blob at her chest. In 2, 3 and 6 the staff is 60–65% length.
- **parry: wire skipping frame 5.** Frame 5 has the staff starting at the front fist and the rear fist gripping air.
  The rest is clean or minor (frame 3's stray gold rod is small). 4→6 still reads.
- **dodge: reroll** (weakest case in my list). Hands and body are clean throughout. But the staff shrinks to about
  two-thirds in the jump (3, 4) and the recovery (6, 7), then is full again in 5 and 8, so it visibly pumps. If the judge
  rules length changes minor, dodge is a "wire".

## Totals (group-a, 64 frames)

- **Third arms/hands: 4.** Definite: spark 3, hex 4, nova 2. Probable: nova 6 (hand-shaped blob).
- **Fused or missing hands (not a third hand): 5.** Attack 2, attack 4, frostshard 4, frostshard 5, parry 5. Attack 5
  and 6 have a rear hand hidden behind the front wrist (minor).
- **Body morphs (major): 2.** Hex 4 (copper hair plus mangled arm), nova 4 (grey face smear). Minor design drift: book
  position jumps (attack 5/6 on her back, arcaneward 2 front-hip satchel, dodge 2/5 behind the shoulder), glove flicker,
  glowing lantern in every frame.
- **Bendy staffs: 0.**
- **Other majors.** Staff length faults (truncated at the fist, or butt jumping to mid-thigh) in 21 frames: attack
  2,3,4,5,6; frostshard 4,5; hex 2,4,5,6,8; nova 2,3,5,6; parry 5; dodge 3,4,6,7. Nova 5 also has a staff with no star.
  Spark 6 has a large white pocket.
- **Severity count:** 24 major, 28 minor, 12 clean.
- **Worst frames:** hex 4, spark 3, nova 2, nova 5, attack 4, parry 5.
