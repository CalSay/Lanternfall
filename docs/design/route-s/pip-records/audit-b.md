_Scratch record, copied from `/mnt/project-files/experiments/route-s-judge-pip/audit/` for the ruling ([../ruling-pip.md](../ruling-pip.md)). Image and script paths point into that scratch folder._

# Pip route S, audit B: hex, wildfire, searing, nova, flare, lanternburst, parry, dodge (64 frames)

Auditor B, 10 Oct 2026. The pack was only read. Nothing in `2d-poses-scenario/` was changed. Scripts and crops are in `/tmp/claude-0/audit-pip-b/`.

## Method and key

- **Looked at:** every frame at full size on mid green, in pairs (`p-<move>-<k>.png`). Hands, staff and face were zoomed to 2-4x. Every frame was also checked at game size: `out/<move>-190.png` at 3x on green (`g-<move>-<h>.png`).
- **Halo:** I took every opaque pixel that touches transparency (8-neighbour) and flagged it if it was white (min>200, low saturation) or light blue. Each flag was traced from its 5x5 neighbourhood:
  - **h** = a real highlight inside a light cluster: orb shine, lantern brass or glass, tunic edge.
  - **s** = a lone cut speck of 1-3 px next to the dark outline: hem tips, hair tips, staff fork tips.
  - The same test was run on the 190 px output.
- **Holes:** a hole is a transparent region not connected to the outside.
  - A hole ringed by dark outline is real negative space: staff/body gaps, hair-lock gaps, the staff fork under the orb.
  - A hole ringed by light colour (less than 35% dark) was punched through solid art. I traced each one and re-checked it at 190 px.
- **White pockets:** opaque near-white blobs of 15 px or more were traced. Almost all are real: lantern shine, eye whites, teeth, brass and orb highlights.
- **Scale:** I compared orb diameter and hat-tip-to-boot height (frame 1 and frame 8) across frames and across moves.
- **Staff length:** I compared the visible staff, butt to orb tip, with the ready frame. Ready-frame staff is about 830 px at full size and about 180 px at game size.
- **Sev:** none / minor (fine at 190 px, or hard to see) / **blocker** (shows at 190 px). For each blocker I say whether a **re-cut** fixes it (alpha or cutter only, no redraw) or it needs a **reroll**.
- **Arms:** "2" means two arms and two hands, each traced to its own shoulder.

## Hex (curse: claw hand reaching at the foe)

| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 1h (orb) / 3s (hair tip, staff-body gap) | none | none |
| 2 | 2 | 0 | Staff swung forward across her body, still in her right hand. Not a swap. | none |
| 3 | 2 | 0h / 2s (coat hem tip) | 7 px hole in the lantern-base brass shine (386,484). Gone at 190. | minor |
| 4 | 2 | 0h / 7s (hem tip, staff-body gap; 3 grey-blue px at 158-161,458) | none | minor |
| 5 | 2 | 1h | none | none |
| 6 | 2 | 4h (tunic edge, lantern) | 7 px hole in the lantern brass (414,528). Gone at 190. | minor |
| 7 | 2 | 0h / 1s | none (relaxed arm, smirk) | none |
| 8 | 2 | 7h | none | none |

Reads as a hex: a grasping claw hand in F3, F5 and F6. The staff stays in her right hand throughout. No drawn effects.

## Wildfire

| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 0 | Off-palette violet sliver (about 15x50 px) sticks out behind the spellbook's left edge (about 130,455). | minor |
| 2 | 2 | 4h / 2s | none | none |
| 3 | 2 | 0 | none (staff level overhead, both arms up) | none |
| 4 | 2 | 0h / 2s | none (low sweep; right forearm traced to its shoulder) | none |
| 5 | 2 | 1h | Lantern glass drawn red (amber in F1-4). | minor |
| 6 | 2 | 3h (tunic) | **Mouth punched:** 72 px hole through the open mouth and teeth (329,314). **3 px transparent at 190.** Also 10 px and 4 px holes in the lantern brass and belt. Lantern glass red. | **blocker (re-cut)** |
| 7 | 2 | 0 | Staff ends visibly at her belt: about 580 px of 830 (about 70%). 19 px hole in the staff band shine (613,539). | minor |
| 8 | 2 | 0h / 2s | Lantern glass red. | minor |

**Scale:** Wildfire Pip is drawn about 12% smaller than in Hex, Searing and Flare.
- Hat-tip-to-boot in F1: 742 px, against 844 / 838 / 842.
- Orb diameter: 67 px, against 72-77.
- At pack scale 0.2118, her ready stance is 179 px tall, against Hex's 193 px. She will visibly shrink when she casts.
- Fix at conversion with a per-move scale of about 1.12. No redraw needed.

## Searing Eye

| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 0h / 1s (hem tip) | none | none |
| 2 | 2 | 4h (lantern glass) / 2s | 14 px hole in the lantern brass (373,424). Gone at 190. | minor |
| 3 | 2 | 2h / 1s | none. Clean finger ring over her eye; the hand is well formed. | none |
| 4 | 2 | 0 | none (ring at her eye, frowning gaze) | none |
| 5 | 2 | 1h / 1s | none | none |
| 6 | 2 | 0 | none (points at the foe) | none |
| 7 | **3** | 0h / 1s | **Third arm.** The cream right sleeve rises to the hand tapping her temple. The staff hand has only a short forearm that ends behind that sleeve, with no upper arm of its own. The left arm hangs at her hip. Three hands show at 190 px. Also a **51 px streak punched through the lantern glass** (372,452): 3 px transparent at 190. | **blocker (reroll or skip)** |
| 8 | 2 | 0 | none | none |

Reads as Searing Eye: hand to brow, a finger ring at the eye (F3-4), then a point at the foe. Scale is fine: orb 75-80 px in every frame.

## Nova (ground slam)

| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 0 | none | none |
| 2 | 2 | 0 | none (two-hand grip) | none |
| 3 | 2 | 0h / 2s | **Staff cut short.** The shaft stops at her raised hands, with about 290 px visible (35%). The lower shaft should cross her face and body down to the left, and it is not drawn. At 190 px it reads as a short rod over her head. | **blocker (reroll or skip)** |
| 4 | 2 | 0 | Butt slammed down: reads well. 16 px hole in the staff band shine (538,140). Gone at 190. | minor |
| 5 | 2 | 0h / 1s | none (two hands, far arm hidden by her hair; wind-blown hair) | none |
| 6 | 2 | 0h / 2s | Back hair locks drawn mauve-pink, not copper: about 150x150 px at (150,270). Barely visible at 190 after the palette. A 6 px hole in the coat hem (491,477). | minor |
| 7 | 2 | 0 | none | none |
| 8 | 2 | 0h / 7s (hair tip, hand tip) | none | none |

## Lantern Flare (v2)

| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 0h / 2s | none | none |
| 2 | 2 | 0h / 1s | none (unhooks the lantern) | none |
| 3 | 2 | 2h / 3s | 5 px hole in her eye (344,199) and 18 px in the lantern top brass. 2 px at 190 (lantern). | minor |
| 4 | 2 | 0 | **77 px streak punched through the lantern glass** (590,350). **4 px transparent at 190**, right on the release point. | **blocker (re-cut)** |
| 5 | 2 | 2s | none | none |
| 6 | 2 | 1h / 2s | 3 px hole in the lantern. | minor |
| 7 | 2 | 1h / 2s | none (rehooks the lantern) | none |
| 8 | 2 | 1h | 32 px and 17 px holes in the staff band shine (72,150). 1 px at 190. Lantern glass now brown. | minor |

The v2 third arm is gone. Every frame has one hand on the staff and one on the lantern (or empty); in F4-5 she turns her face away, with no shielding arm. Reads as the lantern thrust out (F3-5). The lantern glass changes between frames: lit orange in F1, pale amber in F3-6, brown in F7-8 (minor).

## Lanternburst (finisher)

| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 0h / 1s | 11 px hole in the lantern brass. Gone at 190. | minor |
| 2 | 2 | 2s | none | none |
| 3 | 2 | 3h | Staff about 70% of its length, overhead (foreshortening is possible). 8 px hole in the belt buckle. | minor |
| 4 | 2 | 1h | **Staff truncated.** Only the orb, fork and about 200 px of shaft show. The shaft runs into the hat tip, which seems to merge with it, and the rest is missing. At 190 px it reads as a short mace. | **blocker (reroll)** |
| 5 | 2 | 2h / 2s | **Staff about 43% long.** Her fists grip the butt end, and the staff is about 78 px at game size against 180 px. This is the release frame. | **blocker (reroll)** |
| 6 | 2 | 0 | **Staff about 49% long:** about 88 px at game size. | **blocker (reroll)** |
| 7 | 2 | 0h / 2s | none (recovery, eyes shut) | none |
| 8 | 2 | 0 | none | none |

The move reads as an overhead windup then a lunge. But in F4-6 the staff shrinks to a sceptre, which is the same fault as Kindle v1's short wand.

## Parry

| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 3s (2 pure-white px on the staff fork tip at 54,48) | none | minor |
| 2 | 2 | 1h | none (two-hand guard) | none |
| 3 | 2 | 0 | none (block, staff flips to orb-up-right; teeth solid) | none |
| 4 | 2 | 0 | none | none |
| 5 | 2 | 0 | Staff about 62% long in the push: about 112 px at 190, against 180. It still reads as a staff. | minor |
| 6 | 2 | 1s | none (both hands on the staff at her front; lower forearm comes from under the coat, traced) | none |
| 7 | 2 | 2s | none | none |
| 8 | 2 | 1h | 7 px hole in the lantern brass. Gone at 190. | minor |

## Dodge

| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 1h | **55 px streak punched through the lantern glass** (373,475). **2 px transparent at 190.** | **blocker (re-cut)** |
| 2 | 2 | 1s | none | none |
| 3 | 2 | 2h | **White pocket in a hair curl:** a 78 px opaque white blob at (435,145), left over from the background. At 190 it is a 2x2 cream speck on the hair edge. Staff about 75% long. Two 3-4 px holes in the lantern brass. | **blocker (re-cut)** |
| 4 | 2 | 1h / 1s | Staff about 75% long (airborne). | minor |
| 5 | 2 | 1s | none (landing crouch) | none |
| 6 | 2 | 2s | none | none |
| 7 | 2 | 1s | Staff butt ends at her knee, about 80% long. | minor |
| 8 | 2 | 3s | none | none |

Dodge is a hop in place. In the sheet cells her centre moves only 26 px, and her feet lift about 135 px in F3-4. It has almost no backward travel, as the README says, so the runtime must add the backward slide. The staff stays in her right hand throughout.

## Totals (64 frames)

- **Halo / fringe:** 116 pale rim pixels in all at full size.
  - 45 are real highlights: orb, lantern, brass, tunic.
  - 71 are lone cut specks of 1-3 px on hem, hair and fork tips, with 0-7 per frame against about 7,500 rim pixels.
  - **None of them survive at 190 px:** 0 pale rim pixels in all 64 game-size frames.
- **Extra arm:** 1, Searing Eye F7 (blocker).
- **Fused or malformed hands:** 0.
- **Staff wrong:** 9 frames.
  - Blocker: Lanternburst F4, F5, F6 and Nova F3, the length collapsing to 25-49%.
  - Minor: Wildfire F7, Parry F5, Dodge F3, F4 and F7, at 62-80%.
  - No staff swaps hands wrongly, flips, or loses its orb.
- **Holes punched through solid art:** 23 in 17 frames.
  - Blocker at 190: Wildfire F6 mouth; the lantern glass in Searing F7, Flare F4 and Dodge F1.
  - The rest are 3-18 px brass, band or eye punches, gone at 190. Flare F8 leaves 1 px.
- **White pockets left inside the art:** 1, Dodge F3 hair (blocker at 190, re-cut).
- **Off-model:** 4 minor issues.
  - Violet sliver behind the spellbook (Wildfire F1).
  - Mauve back hair (Nova F6).
  - Lantern glass colour drifts amber, red and brown (Wildfire F5-8, Flare F7-8).
  - Hat, spellbook, lantern, tassel, coat and boots stay on model everywhere.
- **No drawn fire, glow or effects. No frames out of order.**
- **Scale drift:** 1, pack-level. Wildfire is about 12% smaller than the other moves. Within each move the orb stays within ±5%.
- **Blockers:** 11 frames.
  - 6 need a reroll or a skip: Searing F7, Nova F3, Lanternburst F4-F6.
  - 5 need only a re-cut: Wildfire F6, Searing F7 (lantern), Flare F4, Dodge F1, Dodge F3.

**Skip or reroll:**
- **Lanternburst:** reroll the sheet, naming the fault "staff full length in the backswing and lunge; the hands grip near the middle, the butt shows behind the hands". F4-F6 are its key frames.
- **Searing Eye F7:** reroll, or skip it and hold F6 into F8.
- **Nova F3:** reroll, or skip it and go F2 to F4.

**Re-cut only (no redraw):**
- Restore alpha from the raw sheet for the Wildfire F6 mouth and the lantern glass in Searing F7, Flare F4 and Dodge F1.
- Key out the hair pocket in Dodge F3.
- Scale Wildfire by about 1.12 at conversion.
