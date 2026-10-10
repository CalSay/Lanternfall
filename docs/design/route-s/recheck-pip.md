# Recheck: Pip re-brief sheets (Opus art judge, 2026-10-10, rounds 1 and 2)

Against `docs/design/route-s/ruling-pip.md` (re-brief list items 1-6, defect rows 22-27, questions 3, 6, 8, 9, wire gates 3, 5-10,
gather gates PG2-PG4). All paths are scratch, in the shared folder (`/mnt/project-files/experiments/`). Sheets: `2d-poses-scenario/pip-moves/rebrief/`. Round 1 = `raw/`, `frames/`, `fx/`; round 2 = `round2/`.
My crops, scripts and JSON: `route-s-judge-pip/recheck/` (round 1), `recheck/r2/` (round 2), scripts in `recheck/tools/`.
"Art px" = after one scale per move set by the opening frame's hat-top (171). Idle-1 is the reference: hat-top 844 source px,
staff about 830 source px (audit B), so 171 and about 168 art px.

## Verdict (final)

- **Victory v2: PASS with a fallback list. Play 1, 2, 3, 4, 5, 6, 7, then hold 6.** Frame 8 swaps the staff into her front hand,
  so it is cut. Camp and picker pose: v2 frame 6 at 0.5. The raised staff reads 0.76-0.87 of idle-1 in 2-4 (b-acc, clip watches).
- **Arcane Ward v2: PASS with a fallback list. Play 1, 2, 3, 6, 7, 8; release on 6 (the lantern).** 4-5 show a second lantern on
  her belt and are cut. The staff stays in her rear hand in all 8 cells.
- **Lanternburst v3 (round 2): PASS with a fallback list. Play 1, 2, 3, 6, 8; hold 3 through the timed ring; release on 6; emit
  from the lantern glass at (729, 349) in frame 6.** The retry fixed the staff: upright, full length (1.03-1.09 of idle-1), in her
  rear hand in all 8 cells, never touching the lantern. The lantern is in her front hand in 2-7. Cut 5 and 7: a second lantern
  still hangs on her belt while she holds one. Cut 4: the cupped lantern is drawn at about 0.65 of its size.
- **Hex sigil v2: RE-BRIEF; waits for Cal's next budget (18 credits).** An open magenta ring with no eye, gold or disc, but 2 of its
  6 marks are a Latin G that reads at game size. Until a sigil passes, Hex shows the live curse effect. Cal's veto "No Hex sigil"
  ends the wait.
- **Woodcut v6: PASS with a fallback list. Loop 1, 2, 5, 6, 7, 8; contact on 5.** The impact passes (axe-head centre at 0.66 and
  0.68 of her height, edge right, broad face). 3 loses the back staff; 4 chops low and reverses.
- **Hunt v4: RE-BRIEF; waits for Cal's next budget (19 credits).** One hand and a 0.33-0.42 spear in 4-6 again, and still drawn at
  about 0.75 of Set A. No fallback loop.
- **Overall:** **No more rolls in this card.** Pip's fight set clears the re-brief hold except the Hex sigil. It needs either a
  passing sigil or Cal's "No Hex sigil", and it still waits for the split build (`asset-build`, `art-loader`) as ruled. The gather
  set waits on hunt: gathering keeps the camp pose, and Codex's interim hunt poses stay.

## Cal's checks (48 new frames, both rounds, on the game-size x3 sheets)

- **Third arms or hands: 0.**
- **Border halo at game size: 1 pixel in 48 frames**, the real steel edge on woodcut 7. Light blue: 0.
- **Staff in the wrong hand:** victory 8 and Lanternburst v2 3-8. Both are cut. Lanternburst v3: none.
- **Duplicate prop (the third-arm family):** a second lantern on her belt in Arcane Ward v2 4-5 and Lanternburst v3 5 and 7. All are cut.

## Round 1 verdicts (record)

Victory v2, Arcane Ward v2 and woodcut v6 passed with the lists above. Lanternburst v2 failed: from cell 3 the staff sat in her
front hand, the release showed 0.27 of the staff, and there was no clean fallback. So the card's one retry went to it (section
below). Hex v2 and hunt v4 failed and wait for Cal's next budget.

## Cal's checks, round 1 detail (40 frames)

- Hands per cell: victory 2 in all 8; Arcane Ward 2 in all 8; Lanternburst v2 2, except 6 (one; the rear arm is behind her);
  woodcut 2 in all 8; hunt 2 in 1-3 and 7-8, 1 in 4-6 (the rear hand is hidden; a fault, not a third hand).
- Halo: `tools/halo.py`, each frame at its move's registered scale, 1-bit alpha at 128, as `judge/tools/halo190.py`.
- Woodcut 3 loses the slung staff (cut). Lanternburst v2 3-4 show a brass shape under the held lantern (likely a second base).

## Victory v2 (`raw/victory-v2.png`, `frames/victory-1..8`)

| cell | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| hands | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| staff hand | rear | rear | rear | rear | rear | rear | rear | **front** |
| staff, art px (idle-1 168) | 179 | 146 | 130 | 128 | 178 | 184 | 181 | 194 |
| vs idle-1 | 1.07 | 0.87 | 0.77 | 0.76 | 1.06 | 1.10 | 1.08 | 1.16 |
| hat-top, art px | 171 | 163 | 162 | air | 154 | 181 | 181 | 184 |
| orb vs idle-1 (as drawn) | 0.87 | 0.89 | 0.86 | 0.87 | 0.88 | 0.85 | 0.86 | 0.87 |
| lanterns | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

- Staff lengths read by eye on a 50 px grid (about ±3%; `recheck/staff-grid-idle-victory.png`, `staff-grid-arcaneward.png`). Move scale 1.093 of the pack (band 0.88-1.12).
- Rule line obeyed: the orb is above her hat in every cell. Row 22's faults are gone: no third hand in 5 or 7, and 8's staff is
  full length. But 8 swaps hands, so row 22 becomes one cut frame.
- Joins (silhouette change, `tools/motion.py`): idle-1 → 1 0.24; 1-2-3 0.30, 0.31; 3 → 4 → 5 0.61, 0.57 (the drawn jump, as the
  old sheet's 0.57/0.55); 5 → 6 0.45; 6 → 7 → 6 0.24, 0.24. Ending on 6 gives 6 → idle-1 0.36, against 8's 0.45.
- Victory 4 keeps its 106 source px lift from the raw cut (about 23 art px): gate 7 is met by the cut.
- Re-brief fallback for the record (as the brief asked): 1-7, hold 6. It is good enough, so I recommend no retry.

## Arcane Ward v2 (`raw/arcaneward-v2.png`, `frames/arcaneward-1..8`)

| cell | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| hands | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| staff hand | rear | rear | rear | rear | rear | rear | rear | rear |
| staff vs idle-1 | 1.03 | full | full | full | 0.86 | 0.96 | full | 0.99 |
| lanterns | 1 | 1 | 1 (in hand) | **2** | **2** | 1 (in hand) | 1 (in hand) | 1 |
| hat-top, art px | 171 | 170 | 169 | 169 | 163 | 163 | 162 | 163 |

- "full" = butt at the boot by eye. Move scale 1.004. In 6 the belt hook shows an empty leather loop, not a lantern
  (`recheck/belt-aw3-aw6-aw7-lb3-lb4.png`; 4-5: `recheck/arcaneward-3-7-lanterns.png`).
- She faces three-quarter and never thrusts the lantern forward (not Lantern Flare). No shield, bubble or glow drawn.
- Row 23 is fixed: the staff never leaves her rear hand. The new fault (a lantern clone in 4-5) sits on frames the move reads
  well without: 3 unhooks it, 6 holds it high.
- Fallback joins: 1-2 0.14, 2-3 0.23, **3 → 6 0.33**, 6-7 0.38, 7-8 0.23; idle-1 → 1 0.23, 8 → idle-1 0.24. The old sheet ran 0.28-0.38.
- Re-brief fallback for the record: 1, 2, 3, 6, 7, 8. Good enough; no retry. A retry would only restore the chest beat (4) and the
  rise (5) and could lose the fixed staff hand.

## Lanternburst v2, round 1 (`raw/lanternburst-v2.png`, `frames/lanternburst-1..8`)

| cell | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| hands visible | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 |
| staff hand | rear | rear | **front** | **front** | **front** | **front** | **front** | **front** |
| lantern hand | belt | front | rear | rear | rear | front (same hand as staff) | rear | belt |
| staff vs idle-1 | 1.05 | full | 1.00 | full | full | **0.27** | full | full |
| hat-top, art px | 171 | 167 | 151 | 150 | 168 | 154 | 165 | 167 |

- The model swapped the hands' jobs from cell 3: the lantern at her chest is in the rear hand, the staff in the front. In 6 one
  hand holds both, and only the staff's head shows ahead of the fist (about 45 art px of 168). Row 24's shrink is back.
- Cells 3 and 4 show a brass shape below the held lantern, likely a second lantern's base.
- **No clean fallback.** Only 1 and 2 keep the staff in the rear hand. Every release candidate (5, 6, 7) has the staff in the
  front hand; 6 is under the 60% floor; 8 closes with the staff in the front hand, so the join back to idle-1 swaps hands.
  The fight set cannot wire with this move.
- **Why it failed:** the ruling's own cells asked for two things the model can only do with the front hand: "staff angled forward"
  (3) and "lantern thrust forward ... beside the staff orb, both pointing at the foe" (6). The brief needs only the lantern: "hold the
  physical offhand lantern ... a single centred release ... the lantern does not leave her hand" (`ability-art-brief.md`, P8). The fix
  keeps the staff upright behind her and puts all the action in the lantern. The deep lunge still sets it apart from Lantern Flare,
  where she stands and holds the lantern out.

### Retry: lanternburst-v3 (one roll, 19 credits; rolled verbatim in round 2)

Exact changes against `rebrief/raw/lanternburst-v2.prompt.txt`. Everything else stays as rolled (design, NOFX, the rear-hand line,
STYLE, GRID, the ARMS line with the lantern clause, the STAFF HAND RULE, the full-length staff line, the tail).

1. `MOVE: Lanternburst, her finisher: lantern and staff together (draw no blast or glow).`
   → `MOVE: Lanternburst, her finisher: she thrusts her lantern at the foe while her staff stays upright in her rear hand (draw no blast or glow).`
2. `3) crouches, lantern drawn in to her chest, staff angled forward in her rear hand.`
   → `3) crouches, her front hand draws the lantern in to her chest, the staff upright beside her rear foot in her rear hand.`
3. `4) holds the crouch, eyes shut, lantern cupped close.`
   → `4) holds the crouch, eyes shut, the lantern cupped close in her front hand, the staff upright in her rear hand.`
4. `5) rises, lantern and orb brought together in front of her chest.`
   → `5) rises, her front hand lifts the lantern to her chin, the staff upright in her rear hand with the orb above her hat.`
5. `6) release: deep lunge, lantern thrust forward at full arm's length beside the staff orb, both pointing at the foe.`
   → `6) release: deep lunge toward the foe, her front arm thrusts the lantern forward at full arm's length; her rear hand holds the staff upright behind her, the whole staff showing from the orb above her hat to the butt by her rear foot.`
6. `7) recoil half a step back, lantern still in her hand.`
   → `7) recoil half a step back, the lantern still in her front hand, the staff upright in her rear hand.`
7. `8) ready stance, lantern back on her belt.`
   → `8) ready stance, staff upright in her rear hand, front hand open and empty, lantern back on her belt.`
8. `The lantern is in her front hand from cell 2 to cell 7.`
   → `The lantern is in her front hand from cell 2 to cell 7. In the picture the lantern hand is always on the right of her body and the staff hand always on the left; the staff never crosses her body and never touches the lantern. There is only one lantern: while it is in her hand, her belt hook is empty.`
9. **Reference image (the stronger lever, as Tobin's recheck found):** upload `pip-moves/rebrief/frames/lanternburst-2.png`
   flattened on pure white, and send it as the **third** reference, so Wren's style sheet stays LAST (the STYLE line says "the LAST
   reference picture"): refs `[concept_full, setA, <lanternburst-2 upload>, wren_style]`. Add this line after the rule in item 8:
   `The third reference picture shows the grip to keep in cells 2 to 7: the staff upright in her rear hand on the left, the lantern in her front hand on the right. Copy that grip only, not that pose.`
   Lanternburst 2 is the one cut frame of this roll with the right grip and one lantern. An upload is not a generation; the pack
   thread should confirm it costs no credits before it rolls.

If v3 also fails, there is still no fallback: the fight set waits for Cal's next budget, as the ruling's risk line says.

## Round 2: Lanternburst v3 (`raw/lanternburst-v3.png`, `round2/frames/lanternburst-1..8`)

The prompt is my v3 change, rolled exactly (`raw/lanternburst-v3.prompt.txt`, diffed against v2: the 8 text changes and the grip
line). The refs are [concept, Set A, lanternburst-2 on white, Wren style]. It cost 19 credits (`credits.log` 07:09).

| cell | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| hands | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| staff hand | rear | rear | rear | rear | rear | rear | rear | rear |
| staff, art px (idle-1 168) | 183 | 182 | 175 | 173 | 183 | 178 | 178 | 178 |
| lantern in hand | - | front | front | front | front | front | front | - |
| lantern on belt | 1 | hook empty | none seen | none | **1** | hook only | **1** | 1 |
| lanterns total | 1 | 1 | 1 | 1 | **2** | 1 | **2** | 1 |
| held lantern height, src px (by eye) | - | ~140 | ~120 | **~85** | ~175 | ~130 | ~130 | - |
| hat-top, art px | 171 | 171 | 148 | 142 | 169 | 157 | 163 | 168 |
| orb vs idle-1 (as drawn) | 0.92 | 0.91 | 0.92 | 0.91 | 0.93 | 0.90 | 0.90 | 0.90 |

- **The staff is fixed.** It is upright, full length (1.03-1.09 of idle-1, butt to claws read on the x3 sheet) and in her rear hand
  in every cell. It never crosses her body or touches the lantern. Row 24 is cleared.
- **The lantern works.** It is in her front hand from 2 to 7. 3-4 draw it in (a crouch), and 6 thrusts it forward at arm's length
  in a deep lunge. That matches the brief: "hold the physical offhand lantern ... a single centred release ... the lantern does not
  leave her hand". The lunge sets it apart from Lantern Flare, where she stands.
- **Faults.** 5 and 7 show a second lantern on her belt while she holds one (the builder's note is right). 6 shows only the brass
  belt ring and a small brass clip, no glass and no lantern frame (`r2/lb3-6-belt-hook-x3.png`), so 6 is clean. In 4 the cupped
  lantern is drawn at about 0.65 of its size (`r2/lb3-held-lantern-2-7.png`). 2 shows the empty hook, as the rule asked.
- **Cal's checks:** 2 hands in every cell, 0 third hands (`r2/lb3-hands-lanterns-1-4.png`, `-5-8.png`). Halo at game size: 0 pixels
  (`tools/halo_r2.py`). No white pockets. The large holes (75-216 px) are real gaps between the staff, arm and body; the small
  2-9 px ones are hair and claw gaps (class a, `r2/lanternburst-game-x3-magenta.png`).
- **Registration:** move scale 1.045 of the pack (band 0.88-1.12). Opening 171, closing 8 at 167.6 art px: inside ±4 with no frame
  scale. 3-4 are a crouch (148, 142) and 6 a lunge (157), at the move scale.
- **Joins** (`tools/motion_r2.py`): idle-1 → 1 0.27; 1-2 0.25; 2 → 3 0.51 (stand to crouch); **3 → 6 0.47; 6 → 8 0.47**; 8 → idle-1
  0.28. The full sheet's own steps are the same size (4-5 0.50, 5-6 0.51, 6-7 0.48), so the cuts add no bigger pop. These are drawn
  pose changes in a one-shot finisher, like nova's 0.62.
- **Fallback list: 1, 2, 3, 6, 8.** 3 (crouch, lantern drawn in, eyes open) holds through the timed ring. 6 is the release. 8
  returns to ready with the lantern on her belt. The lantern goes from her hand to the belt between 6 and 8 with no hooking frame.
  That is b-acc, and gate 12's clip watches it.
- **Emit point (release, cell 6):** the lantern glass centre at **(729, 349)** source px in the 769 x 869 cut frame (0.948, 0.402 of
  the frame), on opaque art (`r2/lb3-6-emit.png`). At the move scale that is about 82 art px right of the feet centre and 110 art px
  above the baseline. The wire card re-measures it on the shipped frame (gate 6).
- Rough bytes: 5 frames about 40 KB, about 19 KB under the old 8-frame sheet (`tools/bytes_r2.py`).

## Hex sigil v2 (`raw/hexsigil-v2.png`, `fx/hex0..4-full.png`)

| view | size (src) | see-through centre px | median RGB | dark outline share of edge | gold px | pale edge at 100 px | bytes at 100 px, 16 / 32 colours |
|---|---|---|---|---|---|---|---|
| 0 front | 507 x 552 | 125,297 (45% of box) | 198, 17, 183 | 0.62 | 0 | 1 | 1,374 / 1,672 |
| 1 turn | 434 x 549 | 97,985 | 204, 17, 189 | 0.64 | 0 | 0 | 1,294 / 1,572 |
| 2 edge-on | 194 x 583 | 35,128 | 197, 16, 182 | 0.63 | 0 | 0 | 820 / 1,016 |
| 3 turn | 447 x 557 | 106,837 | 204, 17, 189 | 0.61 | 0 | 0 | 1,292 / 1,556 |
| 4 flat ellipse | 610 x 296 | 66,686 | 206, 17, 190 | 0.58 | 0 | 0 | 910 / 1,102 |

- Passes: an open thin ring, centre see-through in all five views; no eye, no gold, no disc, no haze; five views as asked; 6 marks.
  Colour: hue about 305° against `FX_COL.curse` (200,40,170) at about 311°, a little more saturated; the build draws it in `FX_COL`
  anyway (gate 10). Five views at 100 px: 5.7 KB (16 colours) or 6.9 KB (32), far under the 40 KB fx ceiling.
- Fails: the top and bottom marks are a Latin **G** in views 0, 1, 3 and 4 (`recheck/hex-game100-x4.png`; full size
  `recheck/hex-v2-view0-raw.png`). fx4 draws the sigil at 0.6 of the foe's height, about 90-150 px, so each mark is 13-20 px and the G reads.
  The side marks read as hooked triangles, not letters. The outline is a dark rim on about 60% of the edge; the cut is softer than the
  fireball's crisp clusters.
- **Fallback:** none. Every view carries the G marks, and fx4 spins view 0 in place.
- **Next-budget change (18 credits; not rolled in this card)**, against `rebrief/raw/hexsigil-v2.prompt.txt`:
  `with 6 small angular glyph marks spaced around it`
  → `with 6 small identical marks spaced evenly around it, each a plain pointed diamond with straight sides and one short straight notch at its outer tip; no curls, hooks or loops inside the marks, and nothing that looks like a G, C, D or any other letter`.
  Do not send v2 as a reference: it would carry the G.

## Woodcut v6 (`raw/woodcut-v6.png`, `frames/woodcut-1..8`)

| cell | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| hands on haft | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| back staff | yes | yes | **no** | yes | yes | yes | yes | yes |
| axe-head centre (feet 0, hat 1) | 0.34 | 1.09 | 1.12 | **0.25** | **0.66** | **0.68** | 0.37 | 0.33 |
| axe head, art px (w x h) | 22 x 22 | 24 x 28 | 22 x 28 | 24 x 20 | 22 x 22 | 22 x 25 | 22 x 22 | 22 x 22 |
| edge side (lightest steel) | mid | left (overhead) | left | mid | **right** | **right** | mid | right |
| hat-top, art px | 171 | 170 | 171 | 158 | 161 | 160 | 175 | 166 |
| lantern | hidden | 1 | 1 | 1 | 1 | 1 | hidden | hidden |

- **Impact passes** (`tools/axe.py`, `axe.json`): in 5-6 her hands are together above the belt, the haft rises up and right at
  about 45°, the head is at chest-to-face height, the edge points right, and the broad face shows. No edge-on T-bar (row 25 fixed).
  The head is about 22 x 22-25 art px, against Wren's passing v4 at 18 x 27.
- **Cell 4 chops low** (0.25, knee height), then the head rises again to 0.66 in 5: a reversal. Skip 4.
- **Cell 3 loses the back staff** (the builder's note is right); 2 is the same wind-up with the staff. Skip 3.
- Loop 1, 2, 5, 6, 7, 8 → 1. Joins: 0.25, **2 → 5 0.38**, 0.17, 0.33, 0.26, 8 → 1 0.15. The full sheet's 3 → 4 was 0.54.
- The lantern hides behind her hands and the axe head in 1, 7 and 8 and shows in 2-6. Its spot is covered in those cells: b-acc,
  watched in the PG6 clip. In 2 the slung staff's orb rises behind her raised arms beside the haft; it is not held
  (`recheck/woodcut2-staff-zoom.png`).
- Move scale 1.085 (band 0.88-1.12). The woodcut orb measures 0.71-0.80: the model draws the slung staff's orb smaller, so the orb
  is not a size gauge in the gather sheets. Hat-top is used instead.

## Hunt v4 (`raw/hunt-v4.png`, `frames/hunt-1..8`)

| cell | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| hands on shaft | 2 | 2 | 2 | **1** | **1** | **1** | 2 | 2 |
| spear butt to tip, src px | 703 | 656 | 703 | ~235 | ~295 | ~290 | ~682 | ~659 |
| vs cell 1 | 1.00 | 0.93 | 1.00 | **0.33** | **0.42** | **0.41** | 0.97 | 0.94 |
| tip reach from feet centre, src px | 443 | 371 | 407 | 426 | 509 | 504 | 443 | 396 |
| hat-top, art px | 171 | 174 | 169 | 169 | 166 | 166 | 179 | 171 |

- Read on a 50 px grid (`recheck/hunt-grid-1-4.png`, `hunt-grid-5-8.png`; tip reach by script, `spear.json`). In 4-6 her rear arm hides behind her body, the
  front arm is straight, and the shaft starts at her fist. That is row 26's fault again; the new rule line did not hold.
- **Size:** orb on the raw sheets 58-60.5 px, against Set A 76-87 (mean about 82), idle 75-81 and hunt v3 55-56. Hat-top in cell 1:
  660 source px, against v3's 690 and idle-1's 844 (`recheck/hunt-size-lineup.png`: v4 and v3 stand the same size). Registering to 171
  needs a move scale of **1.28** of the pack, outside 0.88-1.12. "Draw her at the same size as the reference sheet" did not work.
- **Fallback:** none. 1, 2, 3, 7, 8 are clean (two hands, the full spear, the point always right) but the tip moves only 36-72
  source px between them: a shuffle, not a thrust. PG4 (the tip covers the node) cannot be shown without 4-6.
- **Next-budget change (19 credits; not rolled in this card)**, against `rebrief/raw/hunt-v4.prompt.txt`:
  - `4) lunges forward, spear starting to thrust.` → `4) lunges forward, both hands on the shaft: her rear hand at the butt end by her rear hip, her front hand halfway along, the spear level.`
  - `5) full lunge: spear thrust straight forward at chest height, front knee bent, arms extended.` → `5) full lunge: her rear hand pushes the butt end forward to her front hip, her front hand still halfway along the shaft, the spear level at chest height, the butt end showing behind her rear hand, front knee bent.`
  - `6) holds the thrust a moment.` → `6) holds the thrust a moment, exactly as 5, both hands on the shaft.`
  - Size: drop `Draw her at the same size as the reference sheet: hat point, boots and orb as big as there.` and send
    `pip-moves/rebrief/frames/woodcut-1.png` (flattened on white) as the third reference, Wren style still last, with the line
    `The third reference picture shows how tall to draw her in this sheet and how her staff is slung: draw her exactly that tall, hat point to boots, in every cell. Copy only her size and the slung staff, not the axe or the pose.`
    Woodcut 1 stands at 0.92 of idle-1's hat-top with the staff slung, the size this sheet needs.

## Conversion notes (final)

**route-s-pip-wire (fight):**
- **Victory:** raw `rebrief/raw/victory-v2.png`, re-cut with gate 2's holes pass. Play **1, 2, 3, 4, 5, 6, 7, then hold 6**; 8 is
  never shipped. Move scale 1.093 of the pack, from cell 1's hat-top. To meet gate 3 on the closing frame, give 6 and 7 a feet-locked
  frame scale of about 0.965 (181 → 175 art px; inside the 1.06 limit). Victory 4 keeps its raw lift (about 23 art px).
  **Camp and picker:** v2 frame 6 at 0.5. Bytes: 7 frames about 56 KB by my rough measure, about 4 KB under the old 8-frame sheet.
- **Arcane Ward:** raw `rebrief/raw/arcaneward-v2.png`. Play **1, 2, 3, 6, 7, 8**; release and emit on **6** (the lantern), as
  question 9 names. 4 and 5 are never shipped. Move scale 1.004. Frames 6, 7 and 8 sit 8-9 art px under 171; give them a feet-locked
  frame scale of about 1.05 (inside 1.06). Bytes about 46 KB, about 12 KB under the old sheet. The wire card measures the anchor.
- **Lanternburst:** raw `rebrief/raw/lanternburst-v3.png` (cut as `round2/frames/`), re-cut with gate 2's holes pass. Play
  **1, 2, 3, 6, 8**; hold **3** through the timed ring; release on **6**, emitting from the lantern glass at (729, 349) source px. 4, 5
  and 7 are never shipped. Move scale 1.045; no frame scale needed (8 at 167.6). v1 and v2 do not ship. Watched in the clip: the
  lantern going back to her belt between 6 and 8. For pip-cast-recipes, the lantern-centred ring opens at this anchor.
- **Hex sigil:** none yet. Until a sigil passes, Hex shows the live curse effect only.
- **Holes:** small 2-5 px gaps sit in hair curls, between the orb and its claws, and in boots (`recheck/<move>-game-x3-magenta.png`,
  green rings). The claw gaps are real. Hair specks and the 1-2 px pockets are class a: gate 2's re-cut clears them. The large
  holes (40-265 px at game size) are real gaps between the staff, arms and body.

**route-s-pip-gather:**
- **Woodcut:** raw `rebrief/raw/woodcut-v6.png`. Loop **1, 2, 5, 6, 7, 8**, contact and chips on **5**. Skip 3 and 4. Move scale
  1.085; give 8 a feet-locked frame scale of about 1.03 (166 → 171) so the loop seam 8 → 1 holds. Bytes about 45 KB, about 12 KB under v5.
  Watched in the PG6 clip: the lantern hidden in 1, 7, 8; the orb's shift between 1 and 2.
- **Hunt:** none. The gather set does not wire until a hunt sheet passes. Codex's interim hunt poses stay (PG5).

## Credits (final)

- Pip's pack was **828** before this card. This card spent **132** on seven sheets: round 1 rolled six (five at 19, the sigil at 18,
  113), and round 2 rolled Lanternburst v3 (19). The pack is at **960** of Cal's ~1,000 (`rebrief/credits.log`).
- Not rolled: the victory and Arcane Ward retries (38 saved). Hunt v5 (19) and Hex sigil v3 (18) wait for Cal's next budget. If
  he allows both, the pack ends at about **997**. That is his call, not this card's.
- Account: Scenario `/usages` showed 6,024 used this month after round 1, so about **6,043** now. On the ~10,000 a month plan that
  leaves about **3,957** (an estimate: the API key cannot read the balance).

## Checked / not checked

Checked: the ruling (from git, `origin/claude/elegant-johnson-m6k00u`), the Tobin recheck, `gen_rebrief.py` and all six rolled
prompts (they match the ruling's text, except the builder's noted changes: the lantern clause in the ARMS line for Arcane Ward and
Lanternburst, woodcut cells 5-6 reworded with her hands placed and the old edge-on axe rule dropped, the sigil's sheet-layout line;
all sound), `cut_rebrief.py` and `cut-report.json`, `credits.log`; the six raw sheets; every cut frame at full size and at game size x3;
the five sigil views at full size and 100 px; idle-1, Set A, the old victory, flare, lanternburst and hunt sheets; fx4's sigil draw size.
Measured (`recheck/tools/`): hat-top per frame (`measure.py`), orb size, hands and lanterns per cell (by eye on the x3 sheets), staff
and spear length (by eye on a 50 px grid, about ±3%), axe-head height, size and edge (`axe.py`), spear tip reach (`spear.py`), halo,
holes and white pockets at game size (`halo.py`), silhouette change at the fallback joins (`motion.py`), sigil centre, colour, outline
and bytes (`hex.py`), rough atlas bytes (`bytes.py`, a per-atlas 63-colour palette, not the seeded hero palette).

Round 2 checked: the v3 prompt (diffed against v2) and refs line, `round2/checks/cut-report.json`, the raw sheet, all 8 cut frames at
full size and at game size x3, the belt and held lantern in every cell, and the emit point on cell 6 (`recheck/r2/`, `tools/*_r2.py`).

Not checked: feet-centre registration against idle-1 (gate 3's ±3; the wire card's `check.mjs` asserts it); emit anchors other than
Lanternburst 6 (gate 6);
bytes with the real seeded palette or a real build; the cut's pixel-identity with the pack cut (the builder's claim); real clips or
stage shots; the reference upload's cost (the coordinator says none). Not run: build or check. No red team on this recheck. The staff and
spear lengths and the lantern counts were read by eye.

## DECISIONS.md Art line (final)

- **Route S Pip re-brief recheck (route-s-pip-rebrief, Opus art judge, 2026-10-10; Cal can veto: "No Hex sigil", "Skip the Pip
  rerolls"):** Pip's fight set clears the re-brief hold except the Hex sigil, and still waits on the split build. Victory v2 plays 1-7 and
  holds 6, the camp pose (8 swaps the staff hand). Arcane Ward v2 plays 1, 2, 3, 6, 7, 8 (4-5 show a second lantern). Lanternburst v3,
  the one retry, keeps the full staff in her rear hand and thrusts the lantern; it plays 1, 2, 3, 6, 8 and emits from the lantern
  (5 and 7 show a second lantern). Woodcut v6 passes the impact and loops 1, 2, 5, 6, 7, 8. Hunt v4 (one hand and a short spear again)
  and the Hex sigil v2 (two marks read as a G) wait for Cal's next budget. Cal's checks: 0 third hands, 1 halo pixel (real steel) in
  48 frames. Seven sheets, 132 credits; Pip's pack 960 of ~1,000. (`docs/design/route-s/recheck-pip.md`)
