# Red team, group B: Oriel route S pack

Moves: fallingletter, pullreading, bearing, clearnight, badnews, letters, slivershum, idle (64 frames).
Method: I opened the review sheet for each move, then every frame at full size. I made zoom crops of doubtful areas, plus game-size (1/4) strips, in `../crops/` (named `<move>-<n>-<what>.png`). I also ran an alpha scan: there is no semi-transparent edge, no pale halo, and no stray opaque island bigger than a hair curl or a flake.

Staff length reference: in idle 1 the staff runs from star to butt about 840 px, about the same as her full height. I flag a staff as "short" when the whole staff, butt cap included, is visible and is about half that length or less.

Pack-wide notes (apply to many rows, not counted per frame):
- **Lantern looks lit in every frame of every move.** The panes glow yellow-white, and in idle they glow red. The design text says UNLIT. Compare strip: `crops/idle-1-lanterncompare.png`.
- **Idle does not match the other 7 moves.** Idle has a red-glass lantern (every other move has gold/yellow glass), warmer brown-black hair, and a dark rounded pouch at the hip rather than the navy gold-cornered book. The game loops idle most of the time and cuts into the other moves from it, so the lantern will flip from red to gold on every attack.
- **White pockets in the star ring.** In about 40 of the 64 frames, the triangles between the star points and the ring are left white rather than cut out. In other frames they are cut. The star will flicker white/clear as the animation plays. I list them per frame as "star pockets".
- Hidden RGB under alpha 0: slivershum 5, 6 and 7 hold fragments of the neighbouring sheet cells (a star ring at the left edge, a boot and mantle at the right edge) under fully transparent pixels. They are invisible when composited. They only matter if a converter ignores alpha.

## Frame table

| move | frame | hands/arms | third arm? | morph | staff | meaning | cut | severity |
|---|---|---|---|---|---|---|---|---|
| idle | 1 | 2/2 | no | red lantern, pouch not book (idle-wide) | 1, straight, ref length | ok | clean | minor |
| idle | 2 | 2/2 | no | as idle 1 | 1, straight | ok (breathes in, looks up a little) | thin dark stroke left of staff below hand (`idle-2-stroke`) | minor |
| idle | 3 | 2/2 | no | as idle 1 | 1, straight | ok, glances up | same dark stroke left of staff (`idle-3-hand`) | minor |
| idle | 4 | 2/2 | no | as idle 1 | 1, straight | ok | white pocket in hair at right of bun (383,150) | minor |
| idle | 5 | 2/2 | no | as idle 1 | 1, straight | ok, weight back | clean | minor |
| idle | 6 | 2/2 | no | as idle 1 | 1, straight | ok, butt on ground | star pocket; white pockets beside staff under hand (170,373),(152,431) | minor |
| idle | 7 | 2/2 | no | as idle 1 | 1, straight | ok | big star pocket (66,49); hair pocket (336,119) | minor |
| idle | 8 | 2/2 | no | as idle 1 | 1, straight | ok | hair pocket (347,121); detached brown flake by front boot (442,763) (`idle-8-speck`) | minor |
| fallingletter | 1 | 2/2 | no | none | 1, straight | ok | star pocket | minor |
| fallingletter | 2 | 2/2, both on staff | no | navy panel hanging at front hip by lantern looks like a 2nd book edge (`fallingletter-2-book`), probably a mantle fold | 1, straight | ok | star pocket | minor |
| fallingletter | 3 | 2/2, both on staff overhead | no | none | 1, straight; lower half hidden behind body, so it reads short | ok | star pockets | minor |
| fallingletter | 4 | 2/2 | no | none | 1, straight; ends at her shoulder, reads short | ok, tiptoe | star pockets | minor |
| fallingletter | 5 | 2/2 | no | none | 1, straight, **SHORT: butt cap sits right behind her fist, about 385 px (under half of idle)** (`fallingletter-5-grip`) | ok (staff at foe, hand up) | star pockets | **major** |
| fallingletter | 6 | 2/2 | no | none | **SHORT, same as 5** | ok | star pockets | **major** |
| fallingletter | 7 | 2/2 | no | none | 1, straight; ends at mid-shin, shorter than in 8 | ok | star pocket | minor |
| fallingletter | 8 | 2/2 | no | none | 1, straight | ok | star pocket | minor |
| pullreading | 1 | 2/2 | no | none | 1, straight | ok | star pocket | minor |
| pullreading | 2 | 2/2 | no | none | 1, straight | ok, hand high | star pockets | minor |
| pullreading | 3 | 2/2 | no | none | 1, straight | ok, fist closed | star pockets; **long white sliver along the left of the staff, hand to hip** (129,426) (`pullreading-3-whitestrip`) | minor |
| pullreading | 4 | 2/2 | no | **hair ornament turns silver on a navy disc (gold everywhere else)** (`pullreading-4-ornament`); star head looks paler | 1, straight (lower end passes behind the hem, lines up) | ok, yank and bend | star pockets | minor |
| pullreading | 5 | 2/2 | no | none | 1, straight | weak: fist at shoulder height, not hip; knees barely bent | star pockets | minor |
| pullreading | 6 | 2/2 | no | none | 1, straight | ok | star pocket | minor |
| pullreading | 7 | **3 hands**: right hand on staff + **two palms pressed together at her chest** | **YES** (`pullreading-7-thirdhand`) | none | 1, straight | wrong: "brush palms" needs the staff hand | star pocket | **major** |
| pullreading | 8 | 2/2 | no | none | 1, straight | ok | hair pocket (366,197) | minor |
| bearing | 1 | 2/2 | no | none | 1, straight | ok | star pocket; hair pocket (368,127) | minor |
| bearing | 2 | 2/2 | no | none | 1, straight | ok, chin up | star pocket; hair pocket | minor |
| bearing | 3 | 2/2 (front on staff, rear at book) | no | **rear sleeve turns brown and scaly; rear hand is a pale smear fused into the book** (`bearing-3-reararm`) | 1, straight, **SHORT: whole staff about 420 px, butt just below her hand** | partial: both eyes shut, not sighting with one eye | star pockets | **major** |
| bearing | 4 | 2/2 both on staff | no | none | 1, straight, short (about 525 px, 60%) | ok | star pockets | minor |
| bearing | 5 | 2/2 both on staff | no | none | 1, straight, short (about 500 px) | ok-ish: smiling with both eyes closed | star pockets; pockets at (105,247),(272,212) | minor |
| bearing | 6 | 2/2 | no | none | 1, straight | ok, two fingers | clean | clean |
| bearing | 7 | 2/2 | no | none | 1, straight | ok | star pocket | minor |
| bearing | 8 | 2/2 | no | none | 1, straight | ok | star pocket | minor |
| clearnight | 1 | 2/2 | no | none | 1, straight | ok | clean | clean |
| clearnight | 2 | 2/2 | no | none | 1, straight | ok, palm at shoulder | hair pocket (383,142) | minor |
| clearnight | 3 | **1 visible**: front arm fully hidden | no | none | 1, **slight bow: lower half curves about 8 px off a straight line over 650 px** (`clearnight-3-staffline`) | reads one-armed; "pulled back behind her" | clean | minor |
| clearnight | 4 | 2/2 | no | none | 1, straight | ok, palm thrust | clean | clean |
| clearnight | 5 | 2/2 | no | **mantle turns into a wrapped scarf round her neck; hood, charcoal collar and cream front panel are lost, grey crumpled cloth at chest** (`clearnight-5-chest`) | 1, straight | ok, arm out, mantle swept | white tuft at rear shoulder | **major** |
| clearnight | 6 | 2/2 | no | none | 1, straight | ok | clean | clean |
| clearnight | 7 | 2/2 | no | none | 1, straight | ok | big star pocket (113,110); hair pocket | minor |
| clearnight | 8 | 2/2 | no | none | 1, straight | ok | hair pocket (381,127) | minor |
| badnews | 1 | 2/2 | no | none | 1, straight | ok | star pocket | minor |
| badnews | 2 | 2/2 (front hand on book at rear hip) | no | none | 1, straight | ok, unclips | clean | clean |
| badnews | 3 | 2/2 | no | none | 1, straight | ok, reading | star pocket | minor |
| badnews | 4 | 2/2 | no | none | 1, straight | ok, frowns | hair pocket (378,143) | minor |
| badnews | 5 | 2/2 | no | none | 1, straight, **SHORT: butt cap at her fist, about 430 px** (`badnews-5-grip`) | ok (staff at foe, open book) | transparent hole in sleeve under staff arm (`badnews-5-arms`) | **major** |
| badnews | 6 | 2/2 | no | none | 1, straight | **wrong: book still open, not snapped shut** | star pocket | minor |
| badnews | 7 | 2/2 | no | none | 1, straight | ok, clips book back | star pocket | minor |
| badnews | 8 | 2/2 | no | none | 1, straight | ok | star pocket | minor |
| letters | 1 | 2/2 | no | none | 1, straight | ok | star pocket | minor |
| letters | 2 | **3 hands**: staff hand + **brown-gloved hand reaching at belt centre** + bare hand on book at front hip | **YES** (`letters-2-arms`, `letters-2-thirdhand`) | **2nd book: star-roundel book still on rear hip while another book is at front hip** | 1, straight | wrong: two books, unclipped from the wrong hip | star pocket; hair pocket (277,97) | **major** |
| letters | 3 | **1 hand visible**: rear arm holds the book out behind; **no front arm at all** (`letters-3-frontarm`) | no | none | **1, FLOATING: no hand on it, stands behind her shoulder, lower end lost in mantle** (`letters-3-staff`) | wrong: book in rear (staff) hand, staff unheld | large star pockets (202-274, 69-96) | **major** |
| letters | 4 | 2/2 | no | none | 1, straight | ok | clean | clean |
| letters | 5 | 2/2 | no | none | 1, straight | ok, pages at foe | star pockets | minor |
| letters | 6 | 2/2 | no | none | 1, straight | ok | clean | clean |
| letters | 7 | 2/2 | no | none | 1, straight | ok, closed book at chest | star pockets | minor |
| letters | 8 | 2/2 | no | none | 1, straight | ok | star pockets | minor |
| slivershum | 1 | 2/2 | no | none | 1, straight | ok | clean | clean |
| slivershum | 2 | 2/2 both on staff | no | none | 1, straight, full length | ok | clean | clean |
| slivershum | 3 | 2/2 | no | none | 1, straight | partial: only one hand on staff (front hand empty at chest) | clean | minor |
| slivershum | 4 | 2/2 | no | none (mantle lifts as asked) | 1, straight | partial: front hand at neck, not on staff; eyes closed ok | star pockets; hair pocket (309,124) | minor |
| slivershum | 5 | 2/2 (one on staff, other hidden) | no | none | 1, straight, **VERY SHORT: about 285 px, a third of idle; butt at her fist** (`slivershum-5-grip`, `slivershum-5-gamesize`) | partial: "both hands" shows one | star pockets; pocket between legs (439,530) | **major** |
| slivershum | 6 | 2/2 (one on staff) | no | none | **VERY SHORT, same as 5** (`slivershum-6-grip`) | partial | star pockets | **major** |
| slivershum | 7 | 2/2 both on staff | no | none | 1, straight, slightly short (about 585 px) | ok | clean | minor |
| slivershum | 8 | 2/2 | no | none | 1, straight (gold drop by butt is a boot pendant) | ok | clean | clean |

## Verdicts I argue for

- **idle: reroll.** The frames themselves are clean and readable. But the red lantern, warmer hair and pouch do not match the other moves, and idle is the most-seen loop. "Every piece matches the others" fails. If the judge rejects that, then wire.
- **fallingletter: reroll.** The release and hold frames (5, 6) shrink the staff to half length. Skipping them removes the move's payoff.
- **pullreading: wire skipping frame 7.** Frame 7 is a clear third hand (palms together while the other hand holds the staff). Holding frame 6 covers it. Everything else is minor.
- **bearing: wire skipping frame 3.** Frame 3 has a half-length staff and a smeared, recoloured rear arm. 2 to 4 still reads. Frames 4 and 5 also run short (60%).
- **clearnight: wire skipping frame 5.** In frame 5 the mantle turns into a scarf and the front panel and collar vanish, which is Cal's "body morphs" fault. Holding frame 4 covers it.
- **badnews: reroll.** Frame 5 (release) has a half-length staff and a hole in the sleeve. Frame 6 shows the book open when it should be shut.
- **letters: reroll.** Frame 2 has a third hand plus a second book. Frame 3 has a floating staff with no front arm. Two of the four action frames fail.
- **slivershum: reroll.** The release and hold frames (5, 6) shrink the staff to about a third of its length, a short sceptre at game size, and "both hands" is never shown.

## Totals (group B, 64 frames)

- **Third arms/hands: 2**: pullreading 7, letters 2.
- **Body morphs (major): 2**: clearnight 5 (mantle into scarf, panel and collar lost) and letters 2 (second book). Minor morphs: bearing 3 (rear sleeve brown and smeared hand), pullreading 4 (silver hair ornament), plus the move-level idle mismatch (red lantern, hair, pouch).
- **Bendy staffs: 0 major, 1 minor**: clearnight 3, slight bow.
- **Other majors: 7**:
  - Short staff: fallingletter 5, fallingletter 6, badnews 5, bearing 3, slivershum 5, slivershum 6.
  - Floating staff with a missing front arm: letters 3.
- **Major frames total: 10 of 64** (pullreading 7, letters 2, letters 3, clearnight 5, bearing 3, fallingletter 5, fallingletter 6, badnews 5, slivershum 5, slivershum 6).
- **Clean: 11.** Minor only: 43.
- Pack-wide: the lantern looks lit everywhere, and the star rings have white pockets in about 40 frames, which will flicker.
