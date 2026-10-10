_Scratch record, copied from `/mnt/project-files/experiments/route-s-judge-pip/audit/` for the ruling ([../ruling-pip.md](../ruling-pip.md)). Image and script paths point into that scratch folder._

# Pip route S audit A: idle, attack, fire, spark, frostshard, arcaneward, kindle, ignite (64 frames)

Auditor: frame auditor A, 10 Oct 2026. Read-only on the pack. Scripts and crops are in `/tmp/claude-0/audit-pip-a/`.

## Method

- **Halo:** I scanned every source frame for rim pixels (opaque pixels with a transparent 4-neighbour) that are pale (min channel >190, chroma <40) or light blue. I traced each one in a 5x crop and checked it against `edge_pixels_source` in `out/bytes-190-63.json`. The counts match: 0 to 7 per frame against about 5,000 to 6,600 rim pixels.
- **White pockets:** I looked for near-white neutral blobs inside the art (min >228, chroma <14, 6 px or larger). I outlined them in green on the stage colour and read each one at 3x. The raw sheets have a background of (254,254,254), so a neutral white blob ringed by hair is left-over background. `holes.py` skips the top 22% of each frame (`head=0.22`), so pockets in the hair crown are never cleaned.
- **Punched holes:** I found every transparent area that does not touch the frame edge. I kept the ones whose surround is bright (lantern glass, brass, skin, gold bands) and read each one at 4x with the hole painted cyan. Dark-ringed holes in the hair are real gaps between locks and are fine.
- **Arms and hands:** I counted sleeves, forearms and hands in every frame at 0.5x, then zoomed to 1x to 2.5x on any frame where it was unclear.
- **Game size:** I checked every suspect at 3x and 6x in `out/<move>-190.png`, and ran the same hole scan on the 190 px sheets.
- **Scale:** I used the diameter of the grey orb as a rigid size marker (source px) and checked heads side by side at the same scale.
- **Sev:** *blocker* means it shows at 190 px game size. *minor* means it is real but sub-pixel or nearly invisible at 190 px, or it is a pose note. A suffix tells the judge the likely fix: *(cleanup)* can be fixed in the cutter or by an alpha fix with no reroll, *(reroll)* needs a new generation.

**Pack-wide checks that pass.** No fire, glow, sparks or motion lines are drawn in any frame. The orb is always grey and unlit. The lantern glass is amber with a painted shine, as in the concept. The hat, tassel, spellbook (on the viewer's left hip) and brass lantern are present in all 64 frames. No light-blue fringe was found anywhere. I saw no fused fingers or malformed hands at 1x to 2.5x.

One note on the export, not the pack: the 63-colour 190 px palette shifts the olive hat and hood to grey-green.

## idle (orb 74-79 px)
| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 0 | Small hair specks (7-9 px) | none |
| 2 | 2 | 1 (shine on a hair strand) | none | none |
| 3 | 2 (hand in hair) | 1 | none | none |
| 4 | 2 | 3 (lantern brass shine beside a 5 px brass hole) | 5 px hole in the lantern brass | minor |
| 5 | 2 | 3 (hair-gap residue) | 23 px hole in the lantern cap, 6 px hair gap | minor |
| 6 | 2 | 0 | none | none |
| 7 | 2 | 1 | Two holes in the lantern brass (23 px, 9 px) | minor |
| 8 | 2 | 1 (3 px residue in the staff/coat gap) | 16 px white speck in the hair | minor |

## attack (orb 65-70 px, about 12% smaller than idle)
| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 1 | 26 px hole in the lantern cap | minor |
| 2 | 2 | 0 | none | none |
| 3 | 2, both hands on the staff overhead (the brown cuff by her ear is the elbow strap, not a hand) | 2 | Hat point and tassel hidden by the arms; the head reads as a plain hood | minor |
| 4 | 1 visible (the far arm is hidden) | 1 | 30 px white hook at the hair/hood edge (cut fringe); 27 px hole in the shine on a staff band. Arc order 3 overhead → 4 low → 5 level goes over, down, then up | minor |
| 5 | 2 forward, 1 hand visible | 0 | 17 px hole in the lantern brass | minor |
| 6 | 2 | 0 | none | none |
| 7 | 2 | 0 | **White pocket 15x16 = 140 px in the back of the hair crown** (src 389-404, 133-149). At 190 px it shows as a 2x2 cream speck on the hair edge. The staff also jumps from the front hand (6) to the back hand (7) with no frame between | **blocker (cleanup)** |
| 8 | 2 | 1 | **36 px hole punched in the lantern glass shine** (src 350-356, 440-455); a 2 px stage-colour hole survives at 190 px | **blocker (cleanup)** |

## fire (Fireball, v4 sheet; orb 71-75 px)
| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 0 | none | none |
| 2 | 2 | 0 | 19 px hole in the lantern cap | minor |
| 3 | 2 (front hand at her chest) | 1 | none | none |
| 4 | **1 sleeve, 2 hands** | 2 | **Third-arm read.** The raised forearm with its bracer grows out of the back sleeve, and the staff hand beside it has no forearm. The front arm is missing. At 190 px two hands show side by side on the far side of her body | **blocker (reroll)** |
| 5 | 2 (staff in the back hand, front arm out straight) | 0 | The README third arm is fixed here. The upper coat is olive-brown instead of rust | minor |
| 6 | 2 | 1 | Hair streams back in long strands to waist height (concept: shoulder-length curls) | minor |
| 7 | 2 | 1 | none | none |
| 8 | 2 | 0 | none | none |

## spark (orb 71-73 px)
| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 0 | Leggings tinted brown, not grey | minor |
| 2 | 2 | 0 | Leggings tinted olive-brown (they flicker against frame 3) | minor |
| 3 | **3 hands** | 0 | **Third arm.** Staff hand and salute hand both come from the back sleeve, and the front arm hangs at her side with a third hand. Plain at 190 px | **blocker (reroll)** |
| 4 | 2 | 0 | 5 px hole in the lantern brass | minor |
| 5 | 2 | 0 | 4 px hole in the lantern brass | minor |
| 6 | 2 (finger to her lips, eyes closed) | 0 | none | none |
| 7 | 2 | 1 | Echoes frame 3 without the salute | none |
| 8 | 2 | 1 | **White pocket 16x16 = 138 px in the hair crown** (src 398-414, 144-160). Shows at 190 px as a 2x3 cream speck. Echoes frame 1 | **blocker (cleanup)** |

## frostshard (orb 63-67 px, about 15% smaller than idle)
| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 0 | **57 px hole in the lantern glass shine** (src 352-360, 463-482); 1-3 px shows at 190 | **blocker (cleanup)** |
| 2 | 2, both hands on the staff | 1 | **75 px hole in the lantern glass** (src 343-352, 387-409); shows at 190 | **blocker (cleanup)** |
| 3 | 2, both hands on the staff | 0 | **68 px hole in the lantern glass** (src 336-346, 371-387) plus an 8 px brass hole; shows at 190 | **blocker (cleanup)** |
| 4 | 2, both hands forward on the staff | 0 | none (staff level, orb forward, right way up) | none |
| 5 | 2 (back arm hidden) | 1 | none | none |
| 6 | **3 hands** | 1 | **Third arm.** Staff hand on the far side plus a two-handed self-hug: one hand grips her forearm and one clutches her upper arm. Reads as three hands at 190. The teeth (49+38 px white) are solid and correct. The staff jumps from the front hand (5) to the back hand (6) | **blocker (reroll)** |
| 7 | 2 | 0 | none | none |
| 8 | 2 | 3 (lantern glass shine) | **58 px hole in the lantern glass plus a 13 px hole below it** (src 354-366, 457-486). Shows at 190 as a stage-colour dot in the lantern | **blocker (cleanup)** |

## arcaneward (orb 68-81 px)
| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 1 | **66 px hole in the lantern glass** (src 333-340, 480-498); shows at 190. Staff in the **front** hand, while idle uses the back hand | **blocker (cleanup)** |
| 2 | 2 | 1 | Staff in the front hand | minor |
| 3 | 2, both hands stacked on top of the staff | 0 | none | none |
| 4 | 2 | 1 | Staff in the back hand, front arm raised | none |
| 5 | 2, both from the far side (raised arm over the hat, staff arm from under the coat) | 1 | Arm origin is ambiguous but there are two separate sleeves. Head reads a little smaller than in frame 4 (orb 68 vs 81) | minor |
| 6 | 2 | 0 lb 2 | **Staff jumps to the front hand** (5 back → 6 front → 8 back). Across 8 frames the staff goes back (idle) → front → both → back → front → back; at 190 it jumps from one side of her body to the other | **blocker (reroll or re-order)** |
| 7 | 2, both hands on the staff | 2 | **53 px hole in the lantern glass** (src 321-328, 463-481) | **blocker (cleanup)** |
| 8 | 2 | 0 | 18 px hole in the shine on a staff band; staff back in the back hand | minor |

## kindle (orb 66-73 px)
| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 1 (orb rim shine) | 76 px white = orb highlight (correct) | none |
| 2 | 2 (hands cupped at her mouth) | 0 lb 1 | Staff leans on her shoulder with no hand on it; cream cloth wrap on the staff | minor |
| 3 | 2 (cupped) | 1 | **White pocket 16x16 = 164 px in the back of the hair crown** (src 454-470, 177-193). Shows at 190 as a cream speck. Staff not held | **blocker (cleanup)** |
| 4 | 2 (open palms) | 2 | Staff not held | minor |
| 5 | 2 | 0 | Near-duplicate of 7 and 8 (front arm out, open palm) | minor |
| 6 | 2 (staff held diagonally across the body) | 0 | 20 px hole in the lantern brass | minor |
| 7 | 2 | 3 | Near-duplicate of 5 and 8; 50 px white = tassel shine (correct) | minor |
| 8 | 2 | 5 (orb rim shine, lantern shine) | Near-duplicate of 5 and 7 | minor |

## ignite (orb 66-72 px)
| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 1 | none | none |
| 2 | 2 | 0 | none | none |
| 3 | 2 | 0 | none | none |
| 4 | 2 (fist) | 0 | 7 px hole in the lantern brass | minor |
| 5 | 2 | 2 | none | none |
| 6 | 2 | 2 (5 px of 1-px residue on the torn coat hem) | Grin: 76+54 px white teeth, solid and correct | minor |
| 7 | 2 | 0 | 35 px hole in the shine on a staff band, 25 px hole in the lantern brass; neither shows at 190 | minor |
| 8 | 2 | 2 | none | none |

## README open issues for these moves
- **Fireball frame 4/5 third arm:** frame 5 (v4) is clean. **Frame 4 still has it**: one sleeve, two hands, no front arm. The README's overnight note ("all eight frames show two arms") is wrong for frame 4.
- **Kindle 5-8 alike:** confirmed. Frames 5, 7 and 8 are near duplicates; frame 6 differs only in the angle of the staff. This is a pose note, not a defect. Use frame 5 and frame 8 only.
- **Spark 6-7 echo frame 1:** this is actually 7 ≈ 3 (without the salute) and 8 ≈ 1. Frame 6 (finger to lips) is distinct. It works as a return to ready; no fault.

## Totals (64 frames)
- **Third hand or arm:** 3 blockers (fire-4, spark-3, frostshard-6), plus 1 minor ambiguous case (arcaneward-5). All other frames have exactly 2 arms; some show only 1 hand where the far arm is hidden.
- **Halo:** 0 blockers. 43 pale rim px in total (white 40, light blue 3), 0-7 per frame. They are orb, lantern and hair highlights plus 1-3 px of cut residue (idle-8, ignite-6). None is visible at 190 px, and there is no blue fringe.
- **White pockets in the art:** 3 blockers (attack-7 140 px, spark-8 138 px, kindle-3 164 px, all in the hair crown that `holes.py` skips). 1 minor (attack-4, 30 px), plus 2-16 px specks in the hair of about 40 frames that vanish at 190.
- **Holes punched through solid parts:** 7 blockers, all in the lantern glass shine (attack-8, frostshard-1, -2, -3, -8, arcaneward-1, -7; 36-75 px; 1-4 px of stage colour survives at 190). About 20 minor 4-35 px holes in lantern brass and staff bands that vanish at 190. No eyes, mouths or teeth are punched.
- **Staff / weapon:** 1 blocker (arcaneward hand ping-pong, frame 6). 3 minor: hand swaps with no in-between at attack 6→7 and frostshard 5→6, and the staff resting on her shoulder unheld in kindle 2-4. The staff never flips, never changes length, and the orb is never missing.
- **Fused fingers or malformed hands:** 0 seen.
- **Off-model drift:** 4 minor (spark-1/2 legging tint, fire-5 olive coat, fire-6 long hair, attack-3 hat point hidden). Scale: attack is about 12% and frostshard about 15% smaller than idle (orb 63-70 vs 74-79 px), which needs a per-move rescale (minor). There are no drawn effects.
- **Frame order:** no frame is out of order. attack-4's low swing between overhead and level is odd but acceptable (minor).

**Reroll or skip:** fire-4, spark-3, frostshard-6 (third arm), and arcaneward 1, 2, 6, 7 (staff in the front hand; reroll, or re-cut the move around 3-4-5-8).

**Cleanup without a reroll** (alpha fix, or extend `holes.py` above the 22% head line):
- White pockets in the hair: attack-7, spark-8, kindle-3.
- Lantern-glass holes to fill back in: attack-8, frostshard-1, -2, -3, -8, arcaneward-1, -7.
