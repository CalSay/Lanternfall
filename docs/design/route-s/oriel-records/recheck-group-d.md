# Red team, group D: Oriel v7 second reroll (attack, bearing, clearnight, frostshard)

Scope: the v7 second-reroll frames, `.../oriel-moves/v6-judge-rebrief/v7-second-reroll/frames/<move>-<1..8>.png` (32 frames).
I opened each review sheet in `review7/`, then all 32 frames at full size, then zoomed every suspect spot. Crops are in
`/mnt/project-files/experiments/route-s-judge-oriel/v6/crops/` (the file names start with the move and frame).

## How the staff was measured

- Staff length is the straight distance from the star finial tip to the brass butt cap, in frame px. All frames of a move share one
  scale: her head is the same size in every frame, and the review sheets use one scale per move.
- When an end lies in free space, I walked it out along the shaft axis to the last opaque pixel. When an end touches her body
  (a butt by a boot, the lantern or the robe), I placed it by eye from a zoomed crop, so allow about ±10 px.
- "Longest" is the move's longest straight staff:
  - attack: f1, 909 px;
  - bearing: f1, 898 px. Bearing f5 measures 983 px, but its staff is bent (see below), so I left it out;
  - clearnight: f1, 900 px;
  - frostshard: f1, 847 px. I left out the loose brass drop that hangs under its butt.
- Idle 1 (v6) measures about 711 px. Its butt sits at the knee.
- **The upright staff is not one length across moves.** Attack's upright staff is 909 px and frostshard's is 847 px. Both are
  much longer than idle 1's 711 px. A level or raised staff can therefore pass when held against idle and still fail against its
  own move. I give both percentages where it matters.
- Transparent pixels: every frame has alpha 0 or 255 only. Attack 5 has a piece of the next frame's mantle hem at its right edge
  (x 800-848, y 350-440), and attack 6 has half a star ring at its left edge (x 0-45, y 100-215). Both sit under alpha 0, so they
  are invisible once alpha is respected. They are the same conversion fault the first ruling noted (drop the colour under alpha 0).
  A raw RGB viewer shows them.
- White pockets: no opaque white blob is over 60 px except a 69 px highlight in the robe hem in clearnight f3, which is part of the
  art. The gaps between the star's points are transparent in all 32 frames, so the star does not flicker.

## Frame table

| move | frame | hands/arms | third hand? | morph | staff (px, % of longest) | meaning | cut | severity |
|---|---|---|---|---|---|---|---|---|
| attack | 1 | 2/2, staff in rear hand, front hand open | no | none | 909, 100% (idle 128%) | ready stance, faces right | clean | clean |
| attack | 2 | 2/2, staff in rear hand over shoulder, front hand open | no | none | **539, 59%** (idle 76%). The star ring is seen face-on, so the staff lies flat in the picture and this is not foreshortening | steps forward, staff swung back: yes | clean | **major** (short staff) |
| attack | 3 | 2/2, both hands on the staff overhead | no | none | **602, 66%** (idle 85%) | staff overhead in both hands, star up: yes | clean | **major** (short staff, 4 points under the line) |
| attack | 4 | 2 forearms. The front hand shows; the rear hand is hidden except for fingertips peeking under the front cuff (`attack-4-hands.png`) | no | none | **about 340 visible, 37%**. Counting the forearm that lies along the shaft gives about 460, 51%. **The staff starts at her front fist; no butt shows behind her hands.** | whips staff forward and down: yes | clean | **major** (short staff, ends at fist) |
| attack | 5 | 2 forearms. The front hand grips; the rear hand shows only as knuckles above the front cuff (`attack-5-hands.png`) | no | none | 774, 85%. Butt cap well behind her, star far in front | release thrust at chest height: yes | alpha-0 bleed at right edge (conversion) | clean (minor rear-hand read) |
| attack | 6 | same grip as 5 (`attack-6-hands.png`) | no | none | 726, 80% | holds the point: yes | alpha-0 bleed at left edge (conversion) | clean |
| attack | 7 | 2/2 | no | none | 855, 94% | draws the staff back upright: yes | clean | clean |
| attack | 8 | 2/2 | no | none | 859, 94% | ready stance: yes | clean | clean |
| bearing | 1 | 2/2 | no | none | 898, 100% (idle 126%) | ready stance | clean | clean |
| bearing | 2 | 2/2 | no | none | 895, 100% | looks up at the sky: yes | clean | clean |
| bearing | 3 | 1 visible. Her front arm holds the staff up; her rear arm is hidden behind her turned body | no | none | **620, 69%** (idle 87%). Gripped high, with a long part hanging below the hand and a brass butt cap at belt level (`bearing-3-staff-butt.png`) | holds the staff at arm's length angled up. Her head is level, so the "sighting along it" reads weakly | clean | minor (borderline: 69% sits on the "about 70%" line) |
| bearing | 4 | 2/2, both on the staff | no | **a thin brass rod or line runs from her nose tip to her upper hand**, about 60 px long (`bearing-4-face-line.png`) | 802, 89%. Straight: the rotated strip keeps the shaft on its axis (`bearing-4-staff-strip.png`) | steadies with front hand, sighting: yes | clean | minor (the nose line is about 15 px long and 1 px wide at game size; it reads as a sight line, but it is an unbriefed prop touching her face) |
| bearing | 5 | 2/2 | no | none | **BENT.** The upper shaft (star to both hands) runs about 36-38° off vertical. Under the rear sleeve it kinks: the lower shaft (y 520 to the ground by her rear boot) runs about 11° off vertical, a bend of about 25°. Extending the upper axis puts it about 120 px left of where the butt sits (`bearing-5-staff-line.png`, `bearing-5-staff-strip.png`). End to end it is 983 px, 109%, so it also grows | release, nod, sighting: yes | clean | **major** (bendy staff: one of Cal's three faults) |
| bearing | 6 | 2/2, front hand shows two fingers (V) | no | none | 883, 98% | lowers the staff, counts on two fingers: yes | clean | clean |
| bearing | 7 | 2/2 | no | none | 887, 99% | staff back upright | clean | clean |
| bearing | 8 | 2/2 | no | none | 886, 99% | ready stance | clean | clean |
| clearnight | 1 | 2/2 | no | none | 900, 100% | ready stance | clean | clean |
| clearnight | 2 | 2/2, open palm drawn to her shoulder | no | none | 896, 100% | front hand back to shoulder, palm open: yes | clean | clean |
| clearnight | 3 | 1 visible. The front hand is pulled behind her, as the brief asks. The v6 extra hand is gone | no | none | 847, 94% | turns side-on, hand behind her: yes | 69 px robe-hem highlight (art, not a cut) | clean |
| clearnight | 4 | 2/2, open palm thrust out | no | none | The visible shaft stops with an outlined end at mid-thigh (y 547, 550 px, 61%). A separate 60 px stub with a butt cap shows below the hem by her rear boot (x 162-177, y 735-795), on the same axis, about 797 px in all, 89% (`clearnight-4-staff-break.png`). It reads as the staff passing behind the hem, but the staff runs in front of the mantle above and behind it below | release, palm thrust, arm extended: yes | clean | minor (an upright butt at mid-thigh is accepted, and the stub is about 4x15 px at game size) |
| clearnight | 5 | 2/2 | no | **The mantle bunches round her neck like a scarf up to her chin. The cream-lined hood, the charcoal high collar and the two clasp brooches are gone** (`clearnight-4-5-6-neck.png`). Loose hair strands blow back to the left, away from the foe (the brief says swept forward). The face is clean: the v6 smudge is fixed | 871, 97% | holds the arm out: yes. "Mantle swept forward": no, it is wrapped | clean | **major** (body morph, the same fault the first ruling named for this frame) |
| clearnight | 6 | 2/2 | no | none | about 868, 96% | draws the hand back: yes | clean | clean |
| clearnight | 7 | 2/2 | no | none | 853, 95% | relaxes: yes | clean | clean |
| clearnight | 8 | 2/2 | no | none | The visible shaft ends at mid-thigh (y 610). After a gap, the butt cap shows at the knee behind the cream robe (y 635-685): 686 px, 76% (`clearnight-8-staff-butt.png`) | ready stance, but the staff butt is at the knee, not on the ground as in f1, so the 8-to-1 loop jumps | clean | minor |
| frostshard | 1 | 2/2 | no | none | 847, 100% (idle 119%). **A loose brass drop hangs by a thread under the butt cap** (y 866-901), and an 84 px brown speck sits apart from her on the ground at bottom left, x 55-62 (`frostshard-1-staff-butt.png`) | ready stance | stray speck (cut) | minor |
| frostshard | 2 | 2/2, both hands on a level staff | no | none | 742, 88% | side-on, staff level at chest: yes | clean | clean |
| frostshard | 3 | 2/2 | no | none | 713, 84% | staff pulled back like a spear, star at the foe: yes | clean | clean |
| frostshard | 4 | 2. The front hand grips; the rear hand shows as fingers above the front cuff (`frostshard-4-hands-butt.png`) | no | none | **593, 70%** (idle 83%). The butt cap shows behind her hood, so it is not a wand any more, but the staff passes behind her hood although her hands are in front of her | release thrust, star leading, arms out: yes | clean | minor (borderline: right on 70%; it jumps 70 to 87 to 69% across f4-f6) |
| frostshard | 5 | 2/2, both hands clear (`frostshard-5-hands.png`) | no | none | 740, 87% | holds the staff level and extended: yes | clean | clean |
| frostshard | 6 | 2, plus **a pale grey blob the size of a fist on her rear wrist and hand.** It is next to the peach rear fingers and reads as a grey mitten or a second, grey fist (`frostshard-6-rear-hand.png`) | arguable (grey fist shape) | **yes: the rear hand turns grey.** It is the only grey on any hand in four moves, and her cuffs are brown | **585, 69%** (idle 82%) | "breath misting, draws the staff back". The grey may be the mist the line asked for, drawn on her hand. No effects are drawn on purpose, and breath does not sit at the wrist | clean | **major** (morph: pale patch on navy, about 7x7 px at game size; judge's call, see below) |
| frostshard | 7 | 2/2 | no | none | about 830, 98%; the same loose brass drop under the butt | staff back upright | clean | minor (drop) |
| frostshard | 8 | 2/2 | no | none | about 835, 99%; the same loose brass drop under the butt | ready stance | clean | minor (drop) |

Across all four moves:
- no frame shows a pouch or a second book;
- the lantern glass is warm gold in all 32 frames;
- her hair is navy-black in every frame, with brown strands and blue highlights the same as in other moves;
- she faces right in every frame.

## Per move

### attack: argue **reroll**

- First-ruling faults:
  - "Strike 2-6 has a half-length staff": **not fixed.** 5 and 6 are fixed (85% and 80%, butt cap well behind her). But 2 (59%)
    and 3 (66%) are short, and 4 is the old fault unchanged: about 37% visible, and the staff starts at her front fist with no butt
    behind.
  - "2 and 4 fuse or lose a hand": 2 is **fixed** (two clear arms, one holding the staff). In 4 the rear hand is still almost all
    hidden: two forearms show, but only fingertips of the rear hand peek under the front fist. This is better than v6, and minor
    at game size.
- v6 fault "f6 level staff short": **fixed** (726 px, 80%).
- **The art thread's "all 8 pass" does not hold.** As an animation the staff runs 909, 539, 602, 340 (visible), 774, 726, 855 and
  859 px, so it pumps from full length to about a third and back within four frames. This is the dodge fault again, in the move
  every fight plays most.
- Skipping frames does not save it. Without 2-4 the move jumps straight from the ready stance to the thrust and loses its whole
  windup.
- Measured against idle 1 instead of its own frame 1, frames 2 and 3 pass (76% and 85%). Frame 4 fails either way, at 48% visible.

### bearing (Take a Bearing): argue **reroll**; fallback **wire skipping frame 5** (hold frame 4 in its place)

- First-ruling faults:
  - "about half length in 3": **mostly fixed.** It is 69% now, borderline, with a long tail hanging below the high grip, as the fix
    line asks.
  - "about 60% at the release (5)": the length is fixed, but **frame 5 now has a bent staff.** It kinks about 25° under her rear
    sleeve, and the lower part runs almost straight down to her boot. End to end it is 109% of frame 1, so the staff both bends and
    grows. That is Cal's "staff went bendy" fault, in the release frame.
- v6 fault "f3-f5 raised staff short": f3 is borderline (69%) and f4 is fixed (89%, straight). f5 is now bent: one fault is
  swapped for a worse one.
- Art-thread note "bearing f4, faint line near her nose": it is real. A thin brass rod about 60 px long runs from her nose tip to
  her upper hand. Minor at game size, and it reads as a sight line, but nobody briefed it.
- Frames 4 and 5 are nearly the same pose (both hands on the raised staff, sighting), so skipping 5 and holding 4 keeps the meaning.

### clearnight (Starbolt): argue **wire skipping frame 5**

- First-ruling fault: "Frame 5: the mantle becomes a scarf and her hood, collar and panel go." **Not fixed.** v7 f5 again wraps
  the mantle round her neck to the chin. The hood, the charcoal collar and the clasp brooches are gone (crop
  `clearnight-4-5-6-neck.png`). The fix line said "the same in every frame", and the reroll still drew the morph.
- v6 faults:
  - "f3 extra hand": fixed. Only the staff hand shows, and the front hand is behind her as the brief asks.
  - "f4-f5 level staff short": fixed. She now keeps the staff upright in her rear hand (94-97%).
  - "f5 face smudge": fixed. The face is clean.
- **Minor:**
  - in f4 the staff stops with an outlined end at mid-thigh, and a separate butt stub shows below the hem;
  - in f8 the butt rides at the knee, while f1's is on the ground, so the loop seam jumps.
- Frame 4 is the release and frame 5 only the hold. The first ruling's fallback for this move (1-4, 6-8) still works, so skip 5.

### frostshard (Hush): argue **wire skipping frame 6** (wire 1-8 if the judge reads the grey hand as minor)

- First-ruling faults: "The release and hold (4-5) have a fused hand and a staff at about 35%." Now:
  - **Hands fixed.** Two hands show in 4 and 5.
  - **Length fixed narrowly.** f4 is 593 px, 70%, with the butt cap showing behind her hood. f5 is 740 px, 87%.
- v6 fault "f4 staff short": fixed, at the line.
- Art-thread note "f6 greyish rear hand": it is real. A fist-sized pale grey blob sits on her rear wrist and hand next to the peach
  fingers. It reads as a grey mitten or a second, grey fist. I call it a morph and major: pale grey shows hard against her navy
  mantle. The judge may read it as the "breath misting" of the frame line drawn in the wrong place, which would make it minor. No
  other hand in these 32 frames changes colour.
- f6 is also on the length line (69%). Across f4-f6 the staff runs 70%, 87%, 69%, so it pumps about 25% each frame. That is less
  than dodge's 100% to 65%, but you can see it.
- Minor:
  - a loose brass drop hangs by a thread under the butt cap in f1, f7 and f8. It is the same in all three, but it is not in her
    design and no other move has it;
  - in f1 an 84 px brown speck sits apart from her on the ground at bottom left. Re-cut it.
- Skipping f6 joins f5 (level, extended) to f7 (upright), a bigger jump than the other frames. If that reads badly in game, reroll.

## Totals (32 frames)

| fault | count | frames |
|---|---|---|
| Third hands | 0 | none. Frostshard 6's grey blob is counted under morphs. |
| Body morphs | 2 | clearnight 5 (scarf mantle; hood, collar and brooches gone; the same fault as the first ruling), frostshard 6 (grey rear hand) |
| Bendy staffs | 1 | bearing 5 (about a 25° kink under the rear sleeve; the staff also grows to 109%) |
| Short staffs (under about 70%, or ending at her fist) | 3 | attack 2 (59%), attack 3 (66%), attack 4 (37% visible, ends at her fist) |
| Borderline length (69-70%, not counted as major) | 3 | bearing 3 (69%), frostshard 4 (70%), frostshard 6 (69%) |
| Other majors | 0 | |
| Minors | 8 | bearing 3 (borderline), bearing 4 (nose rod), clearnight 4 (staff break and stub), clearnight 8 (butt at knee, loop seam), frostshard 1 (brass drop, stray speck), frostshard 4 (borderline), frostshard 7 and 8 (brass drop). Attack 4's hidden rear hand is counted inside its major. |
| Clean | 18 | attack 5 and 6 included: their only notes are a rear hand that shows as knuckles, and alpha-0 bleed |

Majors: **6 frames** in all four moves: attack 2, 3 and 4; bearing 5; clearnight 5; frostshard 6.

Verdicts argued:
- attack: **reroll**;
- bearing: **reroll** (fallback: skip 5);
- clearnight: **wire skipping 5**;
- frostshard: **wire skipping 6**.

The art thread's claim that all 8 frames of each move pass is wrong for attack (2-4), bearing (5) and clearnight (5).
