# Red team, group C: hit, defeat, victory, mining, woodcut, forage, hunt (56 frames)

Method: I opened the review sheet for each move, then every frame at full size, and zoomed doubtful spots into
`crops/` (named `<move>-<n>-<what>.png`, plus `groupc-whitepockets.png`, `victory-all-lantern.png`,
`defeat-1v8-starsize.png`, `defeat-5to8-lantern.png`, `mining-3-haircolour.png`). I ran a script over all 56 frames to
find opaque near-white pockets (RGB > 244, alpha > 200, 25 px or more). Coordinates are full-size frame pixels (x,y).

Notes that apply to the whole pack, not flagged per frame:
- **Lantern glass.** Every frame draws the lantern with warm amber glass and a bright diamond in the middle (see
  `victory-all-lantern.png`). It reads as faintly lit, like idle v2. The README already accepts this. I flag only
  frames where the lantern changes from that look.
- **Star-ring white pockets.** Many frames have small background-white holes inside the star ring or between hair
  curls, about 10x15 px (about 3x4 px at game size). I list them as `minor` cut faults.
- **hunt-5 and hunt-6 hidden fragments.** The transparent pixels hold leftover RGB from the next frame: a mantle and
  boot at the right edge of hunt-5, and a spear tip at x 0-160, y 230-260 of hunt-6. Alpha is 0 there
  (`hunt-5-neighbour.png` and `hunt-6-neighbour.png` render empty), so nothing shows in game. They would appear only if
  a converter drops alpha or un-premultiplies. Worth knowing; not a fault in this file.

## Frame table

| move | frame | hands/arms | third arm? | morph | staff | meaning | cut | severity |
|---|---|---|---|---|---|---|---|---|
| hit | 1 | 2/2 (staff in rear hand, front hand open) | no | book at rear hip barely reads; it blends into the mantle, while frames 2-4 show it clearly | 1, straight, in rear hand | ok | small red-brown smudge on rear-hip mantle (~115,525) | minor |
| hit | 2 | 2/2 | no | book now clear at rear hip (pops in from frame 1) | 1, straight | ok, head back, eyes shut | white pockets in star ring (32-115, 38-115) | minor |
| hit | 3 | 2/2 | no | none | 1, straight | ok, stumbles back | white pocket in hair just in front of the face (278-291, 183-198); star-ring pockets | minor |
| hit | 4 | 2/2 (front hand on belly, `hit-4-hands.png`) | no | none | 1, straight | ok (hand on belly, not side) | hair pocket (328,137) | minor |
| hit | 5 | 2/2 | no | head turns down and to the left | 1, straight, but **switched to the FRONT hand** on the right side of the sprite. Frames 4 and 6 have it in the rear hand on the left, so the staff jumps across her body for one frame | braced on ground: ok | star-ring pockets (446-480, 53-117) | **major** |
| hit | 6 | 2/2 | no | none | 1, straight, rear hand | ok | none | clean |
| hit | 7 | 2/2 | no | small purple fleck at rear hip (~150,350) | 1, straight | ok | star-ring and hair pockets (58-138, 38-91) | minor |
| hit | 8 | 2/2 | no | none | 1, straight | ok, matches frame 1 | star-ring pockets (70-148, 35-106) | minor |
| defeat | 1 | 2/2 | no | no book at hip (it is there in 2-8) | 1, straight, rear hand | ok, reeling | star-ring pocket (106-127, 99-124) | minor |
| defeat | 2 | 2/2 (rear arm reaches across the front, `defeat-2-arms.png`) | no | gold glitter specks on front thigh (330-380, 500-560) | 1, straight, now in front hand (swaps from frame 1, but it reads as part of the fall) | ok, one knee, leaning on staff | star-ring pockets | minor |
| defeat | 3 | 2/2 | no | hair hangs over the face | 1, straight, tilted (slipping) | ok | white pocket between hood and hair (298-313, 231-244) | minor |
| defeat | 4 | 2/2 | no | **the hair under her chin reads as a dark beard** (`defeat-4-face.png`): the lower face is a dark mass | 1, straight, upright again after slipping in 3 (goes backwards) | mostly ok, both knees, head hanging | star-ring pocket (527-544, 101-118) | **major** |
| defeat | 5 | 2/2 (one on ground, one on staff) | no | none | 1, straight, on the ground. About 75-80% of its standing length (ring 0.85x, `defeat-1v8-starsize.png`) | ok | none | minor |
| defeat | 6 | 1 visible (other under body, plausible) | no | none | 1, straight, lying, same shorter length | ok | none | minor |
| defeat | 7 | 1 visible | no | lantern turns **silver-grey with pale glass** (`defeat-5to8-lantern.png`) | 1, straight, shorter | ok | none | minor |
| defeat | 8 | 1 visible | no | lantern is brass again | 1, straight, shorter | ok, eyes closed | white pocket inside star ring | minor |
| victory | 1 | 2/2 | no | none | 1, straight, rear hand | ok | star-ring pocket (105-117, 108-128) | minor |
| victory | 2 | 2/2 | no | none | 1, straight | ok | ring and hair pockets (381,131) | minor |
| victory | 3 | 2/2 | no | **the lantern at her front hip turns into a brown leather pouch** for this one frame (`victory-all-lantern.png`, 3rd tile; 280-400, 400-580) | 1, straight | book already up at chest (supposed to be unclipping at hip) | ring pocket | **major** |
| victory | 4 | 2/2 | no | none (lantern amber as pack) | 1, straight | ok, reading the open book | none of note | clean |
| victory | 5 | 2/2 | no | none | 1, straight | ok, book shut, smile | ring and hair pockets | minor |
| victory | 6 | 2/2 | no | none | 1, straight | clips the book at her FRONT hip; elsewhere it sits at the rear hip | hair pockets (206,124), (367,157) | minor |
| victory | 7 | 2/2 | no | new brass cuff on her raised rear forearm (110-140, 290-340) | 1, straight, but about 10% shorter than frame 1 (0-735 vs 0-830 px, same body height) | ok, staff high, hand on hip | ring pockets | minor |
| victory | 8 | 2/2 | no | front legging a lighter grey than other frames (300-380, 560-680) | 1, straight | ok | ring pockets | minor |
| mining | 1 | 2/2 | no | no book at hip (book is there in 2-7); dark green blotch on the back of the rear hand (`mining-1-haft.png`) | slung, straight, top only | pickaxe handle runs on past the rear hand, under the mantle, to (60,470). Total about 500 px vs about 300 in frames 2-7, **so the pickaxe is about 1.7x longer** | hair pockets (93-145, 41-84) | **major** |
| mining | 2 | 2/2 | no | none | slung, straight | ok, pick over rear shoulder | none | clean |
| mining | 3 | 2/2 | no | **hair turns chestnut brown, the bun is gone and the ornament shrinks** (`mining-3-haircolour.png`; dark-pixel mean RGB 45,25,12 vs 28,22,24 in frame 2) | slung, straight | ok, pick overhead | pockets (91-126, 273-326) | **major** |
| mining | 4 | 2/2 (`mining-4-hands.png`) | no | none | slung, straight | pick head already at knee height. It reads as the impact, so 4 and 5 look alike | hair pockets (246-278, 71-83) | minor |
| mining | 5 | 2/2 (`mining-5-hands.png`) | no | dark green blotch on the back of the front hand | slung, straight | ok, impact | hair pockets | minor |
| mining | 6 | 2/2 | no | same hand blotch | slung, straight | ok | none | minor |
| mining | 7 | 2/2 | no | none | slung, straight | **no pickaxe head shows.** The handle ends in a small grey spike and a brass ferrule (`mining-7-toolhead.png`), so the pick reads as a stick (same fault as the earlier forage sickle reroll) | none | **major** |
| mining | 8 | 2/2 | no | no book at hip | slung, straight | long handle again (cap at 110,420; about 475 px), so the pick pops longer at the loop seam | none | **major** |
| woodcut | 1 | 2/2, **clasped**: one hand cups the other fist (`woodcut-1-fists.png`) | no | none | slung, straight | fists at belly centre, not right hip. **Hands are clasped, not stacked; no straight handle fits through both** | hair pocket (120-135, 96-115) | **major** |
| woodcut | 2 | 2 forearms, **only 1 fist** shows at her rear shoulder; the second hand is hidden or fused behind it (`woodcut-2-fists.png`) | no | none | slung, straight | wind-up at shoulder ok; an axe would look one-handed | hair pockets (64-131, 96-120), (363,108) | minor |
| woodcut | 3 | 2/2, two fists side by side on a diagonal above and behind her head (`woodcut-3-fists.png`) | no | face covered by the raised front arm and sleeve, only one eye shows (natural occlusion) | slung, straight | ok, top of the swing. Best frame for an axe | white tuft between fists and sleeve (~215,100); pocket between staff and mantle (139-156, 258-287) | minor |
| woodcut | 4 | **1 arm, 1 fist**: the rear arm is missing entirely (`woodcut-4-arms.png`) | no | **missing arm** | slung, straight | reads as a one-armed punch at head height, not a two-hand swing | white pockets under chin (354-381, 212-232) and behind head (196-209, 205-224) | **major** |
| woodcut | 5 | **1 arm, 1 fist**: rear arm missing | no | **missing arm** | slung, straight | one-armed punch with the fist at shoulder height (not chest); knees barely bent | ring pocket | **major** |
| woodcut | 6 | 2/2, fists **side by side** at chest, thumbs up, knuckles to the viewer (`woodcut-6-fists.png`) | no | none | slung, straight | looks like gripping the mantle edges. **The two grips are parallel and vertical; one straight handle cannot pass through both** | hem pocket (77-85, 685-698) | **major** |
| woodcut | 7 | 2/2, clasped as in frame 1 | no | red curl in hair by the face | slung, straight | **clasped, no handle line** | white pocket by the eye and hair (~345,140; `woodcut-7-face.png`) | **major** |
| woodcut | 8 | 2/2, clasped as in frame 1 (`woodcut-8-fists.png`) | no | none | slung, straight | **clasped, no handle line** | hair pockets | **major** |
| forage | 1 | 2/2 | no | none | slung, straight | ok, sickle in rear hand | hair pockets | minor |
| forage | 2 | 2/2 | no | none | slung, straight | ok | hair pockets (294-460, 84-112) | minor |
| forage | 3 | 2/2 | no | dark marks on the back of the rear hand | slung, straight | ok, front fist low | small pockets | minor |
| forage | 4 | 2/2, **both hands on the sickle** (`forage-4-hands.png`) | no | none | slung, straight | front hand should be free; here it is a two-hand grip | hair pockets | minor |
| forage | 5 | 2/2 | no | none | slung, straight | ok, blade low, front fist | small hair pocket | minor |
| forage | 6 | 2/2 | no | dark marks on rear hand | slung, straight | ok | hair pockets | minor |
| forage | 7 | 2/2 | no | none | slung, straight; lower end shows under the book (`forage-7-rearhip.png`) | ok | small pocket | minor |
| forage | 8 | 2/2 | no | none | slung, straight | ok | white holes between the curled fingers of the front hand (`forage-8-fronthand.png`) | minor |
| hunt | 1 | 2/2 | no | boots gain gold pointed knee plates, in all 8 hunt frames (`hunt-1-boots.png`) | slung, straight (near vertical) | ok. Spear has 1 leaf point and ends at the rear hand (`hunt-1-rearhand.png`), about 540 px | white strip under the spear shaft (392-424, 323-328) | minor |
| hunt | 2 | 2/2 | no | boot plates | slung, straight | ok. Spear about 650 px, butt well behind the rear hand | hair pockets | minor |
| hunt | 3 | 2/2 | no | boot plates | slung, straight | ok, coiled at hip. Spear about 410 px | hair pockets | minor |
| hunt | 4 | 2/2 (hands overlap, `hunt-4-hands.png`) | no | boot plates | slung, straight | spear shows only from the hands forward, about 250 px. The butt could hide behind the forearms and body, but it reads as a short javelin | hair pockets | minor |
| hunt | 5 | 2/2 (`hunt-5-hands.png`) | no | boot plates | slung, straight | ok, full lunge at chest height. Spear about 330 px visible | none visible (hidden fragment, see notes) | minor |
| hunt | 6 | 2/2 | no | boot plates | slung, straight | ok | none visible (hidden fragment, see notes) | minor |
| hunt | 7 | 2/2 | no | boot plates | slung, straight | ok | hair pockets | minor |
| hunt | 8 | 2/2 | no | boot plates | slung, straight | ok | hair pockets | minor |

## Woodcut: can the game place an axe?

**No, not across the move.** The brief asked for "two fists together, one above the other, as if gripping one handle".
Only frame 3 does that.

- **Stacked on one line, as on one handle?** Only frame 3: two fists touching on a diagonal above and behind the head,
  and a handle through both would point back over her head. Frames 1, 7 and 8 are a clasp: one hand cups the other
  fist in the same spot, like a polite bow. Frame 6 has the two fists side by side at the same height, thumbs up, like
  holding the mantle edges. Frames 2, 4 and 5 show only one fist (in 4 and 5 the rear arm is missing).
- **Same grip direction frame to frame?** No. The grip changes from clasp (1) to single fist (2) to diagonal pair (3)
  to single fist (4, 5) to parallel vertical pair (6) to clasp (7, 8). No one handle angle and pivot keeps a straight
  handle in both fists through the loop. A game-placed axe would slide off the hands or pass through a palm in at
  least 1, 6, 7 and 8.
- **Does the arc read as chopping?** Wind-up over the rear shoulder (2) and top of the swing (3) read right. Then 4
  and 5 throw one arm straight out at head and shoulder height, which reads as a punch. Impact should be both fists at
  chest height with knees bent; it is neither. Frame 6 snaps both fists back to the chest, and 7 and 8 are a clasp at
  the belly, not at the right hip.
- **Frames where an axe cannot be placed believably:** 1, 4, 5, 6, 7, 8. Frame 2 works only as a one-handed axe.
  Frame 3 is the only good one.

## Verdicts per move

- **hit: wire skipping frame 5.** Frame 5 moves the staff into her front hand, between two rear-hand frames, so it
  jumps across her body. Frame 6 still carries the "staff braced" beat. The rest are clean or have tiny pockets.
- **defeat: wire skipping frame 4.** Frame 4 gives her a beard-like dark lower face and stands the slipped staff back
  up. Frames 3 to 5 still read without it. The shorter lying staff and the silver lantern in frame 7 are minor.
- **victory: wire skipping frame 3.** The lantern turns into a brown pouch for one frame. Everything else is calm
  and on-model.
- **mining: reroll.** Four of 8 frames are major: hair turns brown in 3 (the same fault that forced the letters
  reroll), the pick has no head in 7, and the handle is about 1.7x longer in 1 and 8 than mid-swing. The book also
  vanishes in 1 and 8. Skipping frames cannot fix the loop, because 1 and 8 are the ready pose.
- **woodcut: reroll.** The move exists only to hold a game-placed axe, and 6 of 8 frames cannot hold one. Two frames
  (4, 5) are missing her rear arm.
- **forage: wire.** No major faults. Frame 4 has a two-hand sickle grip and frame 8 small finger holes; both are minor.
- **hunt: wire.** Spear and hands read throughout. The gold knee plates on the boots are a consistent drift. The
  spear looks short at the thrust (4-6) but can be read as hidden behind the arms.

## Totals (56 frames)

- **Third arms/hands: 0.** I counted every frame; no extra hand, arm fragment or hand-shaped blob.
- **Body morphs (major): 3.** mining 3 (brown hair, no bun), victory 3 (lantern becomes a pouch), defeat 4 (beard-like
  lower face). Minor morphs: book missing in hit 1, defeat 1, mining 1 and 8; silver lantern in defeat 7; brass cuff
  in victory 7; gold knee plates on all hunt boots; green blotch on hands in mining 1, 5 and 6.
- **Bendy staffs: 0.** The staff is single, straight and star-up in all 56 frames. Length drift (minor): about 20-25%
  shorter lying in defeat 5-8, about 10% shorter in victory 7.
- **Other majors: 10.** Missing rear arm in woodcut 4 and 5; fists that cannot take an axe in woodcut 1, 6, 7 and 8;
  pick with no head in mining 7; pick handle 1.7x longer in mining 1 and 8; staff jumps to the front hand in hit 5.
- **Major frames in all: 13 of 56.** clean 3, minor 40, major 13.
