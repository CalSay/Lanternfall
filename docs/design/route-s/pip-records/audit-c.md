_Scratch record, copied from `/mnt/project-files/experiments/route-s-judge-pip/audit/` for the ruling ([../ruling-pip.md](../ruling-pip.md)). Image and script paths point into that scratch folder._

# Pip route S audit C: hit, defeat, victory, gathering, effect sprites

Auditor C, 10 Oct 2026. Read-only on the pack. Scripts are in `/tmp/claude-0/audit-pip-c/`.

## Method and key
- **Frames:** I viewed every one of the 56 frames on the stage colour at 3x from `out/<move>-190.png`, which is the game look: 190 px tall, 63 colours, 1-bit alpha. Anything doubtful I checked at full size from `frames/<move>-<n>.png`, on the stage colour and on mid-green.
- **Arms:** I counted hands and forearms in each frame. "2" means two arms; "2 (1 hid)" means one arm is out of sight behind her body.
- **Halo:** a source edge pixel counts as pale when it is white (min RGB >= 195, chroma < 45) or light blue. The table gives `src W/LB` from `out/bytes-190-63.json` (edge_pixels_source; each frame has about 3,500 to 6,500 edge pixels). I traced every source cluster on a 6x crop. I ran the same test on the 190 px frames: **0 pale edge pixels and 0 interior white pixels in all 56 frames.** The 63-colour quantise darkens the few highlights below the threshold.
- **Holes:** these are transparent pixels enclosed by the figure. I marked them on green, at full size and at 190 px. Gaps between hair locks and between staff prongs are real negative space and are not counted.
- **Sev:** none, minor, or blocker. Blocker means the fault shows at 190 px.

## hit
| F | Arms | Halo (src W/LB) | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 0/0 | Pin hole inside the belt buckle ring; closed at 190 | none |
| 2 | 2 | 0/0 | - | none |
| 3 | 2 | 0/0 | - | none |
| 4 | 2 (one clutches her stomach) | 0/0 | - | none |
| 5 | 2 | 0/0 | **Staff jumps to her front hand.** In frames 1-4 it is in her back hand, left of her body. At 190 px the orb and shaft jump about 45 px across her and back at frame 7. This reads as a fault, not as a flinch. | **blocker** |
| 6 | 2 (both hands on staff) | 1/1 | Same staff jump. Small negative-space gap between hood, hand and staff, about 2 px at 190. | **blocker** |
| 7 | 2 | 3/0 | Pale pixels are hair and steel highlights | none |
| 8 | 2 | 2/0 | Highlights | none |

## defeat (order checked: reel, sag, kneel, hand down, all fours, lie, lie, lie; the finish.py swap is correct)
| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 1/1 | Staff in her back hand | none |
| 2 | 2 | 1/1 | Staff moves to her front hand and stays there through frame 5. One swap, made during a big change of pose in a one-shot fall. At 190 it reads as a fumble more than a pop. | minor |
| 3 | 2 | 4/0 | Pale pixels are a lantern glint. A small hole is punched through the lantern glass (about 12x5 px at full size, 1-2 px at 190). | minor |
| 4 | 2 | 5/0 | Hair highlight | none |
| 5 | 2 | 1/0 | - | none |
| 6 | 2 (1 hid) | 0/0 | Lantern not drawn while she lies down (minor drift) | none |
| 7 | 2 (1 hid) | 0/0 | Same as 8 (a hold) | none |
| 8 | 2 (1 hid) | 0/0 | - | none |

## victory
| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 2/0 | - | none |
| 2 | 2 | 0/0 | - | none |
| 3 | 2 | 0/0 | Jump frame: she is 212 px tall here with the staff raised. This is the pose, not scale drift. | none |
| 4 | 2 | 3/0 | Small hole in the open mouth (shows green at full size; about 1 px at 190) | minor |
| 5 | **3** | 3/0 | **Third hand.** One fist is raised, another hand grips the staff just below it from the same sleeve, and her back hand rests at her hip. The staff is also in her front hand. | **blocker** |
| 6 | 2 | 0/0 | Staff back in her back hand, front hand on hip | none |
| 7 | **3** | 0/0 | **Third hand.** One hand touches the hat brim, a second hand on the same side grips the staff from a forearm that comes out under the coat, and a third is on her hip. | **blocker** |
| 8 | 2 (1 hid) | 0/0 | Leans with both hands on the orb, staff centred in front. This is another change of side, but it reads as a rest pose. | minor |

## mining (pickaxe)
| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 0/0 | Pickaxe reads clearly: two-pointed curved head. Staff slung on her back. | none |
| 2 | 2 | 0/0 | Staff on her back **is not drawn** (the orb vanishes for one frame) | minor |
| 3 | 2 | 0/0 | Staff on her back slips down to shoulder height | minor |
| 4 | 2 | 0/0 | - | none |
| 5 | 2 | 0/0 | - | none |
| 6 | 2 | 0/0 | - | none |
| 7 | 2 | 0/0 | - | none |
| 8 | 2 | 0/0 | - | none |

## woodcut (felling axe, v5)
| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 2/0 | Broad axe face reads as an axe. Pin holes along the bright blade edge, closed at 190. | none |
| 2 | 2 | 2/0 | Head raised in narrow profile; still reads as a hatchet | none |
| 3 | 2 | **13/0** | **White pocket in her hair.** About 15x10 px at full size, by her ear: this is leftover sheet background, not a highlight, and it shows as a pale speck at 190. The staff on her back is not drawn. The head is edge-on and reads like a spear or halberd point. Holes in the blade highlight. | minor |
| 4 | 2 | 9/0 | Pale speck in her hair again (visible at 190). The head is seen from the side as a flat slab across the end of the handle, which reads as a hammer. Hole at the blade edge. | **blocker** |
| 5 | 2 | 3/0 | **The axe head reads as a T-bar or sledge** at 190: a thin symmetrical bar across the end of the handle. This is the README's "thin" weak spot, and it is the same failure as Wren's sledgehammer and T-bar axe. | **blocker** |
| 6 | 2 | 0/0 | Same T-bar read | **blocker** |
| 7 | 2 | 5/0 | Broad face, reads as an axe. Pin hole at the blade edge (closed at 190). | none |
| 8 | 2 | **16/0** | Pale pixels are the steel edge highlight (traced) | none |

## forage (sickle)
| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 0/0 | Sickle in her back hand, held low behind her; reads as a sickle. Free fist in front. | none |
| 2 | 2 | 6/0 | Pale pixels are a lantern glint. Small hole in the lantern. | minor |
| 3 | 2 | 0/0 | - | none |
| 4 | 2 | 1/0 | **The sickle changes hands.** It is in her front hand here, swept low forward, and in her back hand in every other frame. At 190 it jumps across her body for one frame, which is the same fault as v1 and v2. The README's claim that "her free hand is always an empty fist" holds only for this frame's pose. | **blocker** |
| 5 | 2 | 1/0 | - | none |
| 6 | 2 | 0/0 | - | none |
| 7 | 2 | 0/0 | - | none |
| 8 | 2 | 2/0 | - | none |

## hunt (spear)
| F | Arms | Halo | Other defects | Sev |
|---|---|---|---|---|
| 1 | 2 | 2/0 | Long spear held in two hands, one point, blunt rounded butt | none |
| 2 | 2 | 6/3 | Rear sleeve cuff drawn pale blue-white with 2-3 punched gaps; about 3 px at 190. The light-blue pixels come from this cuff, not from fringe. | minor |
| 3 | 2 | 4/0 | Pale pixels are the spearhead highlight | none |
| 4 | 2 (1 hid) | 0/0 | **The spear shrinks.** In the one-arm lunge only about 43 px of the spear shows at 190, against about 150 px in frames 1-3 and 7-8. The shaft would have to be hidden behind her arm and cape. At 190 it reads as a short javelin, and her second hand vanishes too. It still has a single point. | **blocker** |
| 5 | 2 (1 hid) | 0/0 | Same | **blocker** |
| 6 | 2 (1 hid) | 0/0 | Same | **blocker** |
| 7 | 2 | 0/0 | - | none |
| 8 | 2 | 1/0 | - | none |

**Fingers:** I checked the open hands at full size (hit 1 and 7, victory 3, 6 and 7, forage 2 and 3). The fingers are separate. At 190 px a finger is 1-2 px wide, so fused fingers cannot show there.

**Off-model and effects:** every frame is on-model: copper curls, olive hat with orange leaves and gold tassel, rust coat with torn hem, cream tunic, spellbook, brass lantern, forked staff with a grey unlit orb. No frame has drawn fire, glow or motion lines. Height ranges from 151 to 212 px across the moves, and the extremes match the poses (crouch, raised arms). I saw no scale drift.

## Effect sprites
Measured on `hero-fx-test/fx/*.png`.
- **Pack size:** fx size x3 (back to sheet size) x0.2118, then alpha thresholded at 128, quantised to 63 colours with no dither, and saved as lossless WebP.
- **Stage size:** for comparison, the width `fx4.js` draws each sprite at with game scale s = 190/320. Flames and hex scale to the foe in `fx4.js`, so they have no fixed stage size.

| Sprite | fx/ px | Soft alpha | Pale edge (alpha>0 / alpha>=128) | Dark outline | Reads as | Pack size, bytes | Stage size, bytes | Verdict |
|---|---|---|---|---|---|---|---|---|
| fireball0 | 202x110 | 25% | 187 / 0 | weak (dark-red edge, 18%) | Fireball, yes (swirl and tail) | 128x70, 3,192 | 93x50, 2,014 | Fits. A pale streak at the top is trapped sheet white and survives the threshold (2-3 px). |
| fireball1 | 204x110 | 23% | 244 / 0 | weak | yes | 130x70, 3,200 | 93x50, 2,032 | Same trapped white streak in the tail |
| fireball2 | 198x110 | 25% | 188 / 0 | weak | yes | 126x70, 3,134 | 93x51, 2,086 | 1-2 single white specks |
| fireball3 | 202x110 | 23% | 172 / 0 | weak | yes | 128x70, 3,218 | 93x50, 2,050 | 1 white speck |
| frost0 | 228x61 | 23% | 105 / 0 (3 light-blue left; these are crystal colour) | yes (navy, 48%) | Frost Shard, yes | 145x39, 2,162 | 71x19, 814 | Best fit of the set: flat facets and outline |
| frost1 | 219x61 | 25% | 105 / 0 | yes | yes | 139x39, 2,090 | 71x20, 830 | Good |
| spark0 | 166x45 | 38% | 83 / 0 | no (6%) | A small fire dart. Fits Spark only because Pip's Spark is a fire spell; it does not read as an electric spark. | 105x29, 1,168 | 53x14, 498 | Thin and the most fringe-heavy |
| spark1 | 178x42 | 44% | 153 / 0 | no | same | 113x27, 1,068 | 53x13, 438 | Same |
| kindle0-3 | about 84-94 x 89-97 | 28-33% | 71-127 / 0 | partial (20-24%) | Kindle flame, yes; 4-frame flicker | 53-60 x 57-62, about 1,090-1,184 each (4,636 total) | 36x34-41, 646-740 each | Fits |
| flames0-3 | 215-222 x 109-156 | 25-28% | 230-380 / 0-1 | yes (dark-red base, 75%) | Burning ground, yes; good loop | 137-141 x 69-99, 3,506-4,076 each (15,082 total) | scales to foe | Fits. 1-px pale specks in flames2 and flames3. |
| hex0 | 211x207 | 7% | 137 / 0 | yes (99%) | **A solid medallion or coin**, not a sigil cast on the foe. The runes look like Latin letters (R, Z, B, A, 8) and have pale lavender cores. Drawn at 80% over the foe, it hides the foe. | 134x132, 7,600 | 2.0 x foe RX | **Re-brief:** an open ring with a clear centre and non-letter glyphs |
| cinder0-2 | 103-105 x 107-115 | 20-21% | 63-139 / 0 | yes (68-71%) | Glowing coals or embers; reads as Cinder | 65-67 x 68-73, 1,790-1,840 each (5,430 total) | 28x29-32, 588-626 each | Fits |

- **Alpha:** every fx sprite has soft alpha (7-44% of opaque pixels). The low-alpha pixels carry the white sheet colour, so drawn as they are they leave a pale halo. Thresholding at 128 removes every pale edge pixel; only frost keeps 3-4 light-blue pixels, which are its own colour. So threshold at 128 before use.
- **Bytes:** Pip's 20 sprites total **52.0 KB at pack scale** (fireball 12.7, frost 4.3, spark 2.2, kindle 4.6, flames 15.1, hex 7.6, cinder 5.4). At the stage's own draw widths, the fixed-width sprites (fireball, frost, spark, kindle, cinder; 16 sprites) total 15.3 KB.
- **Size against the hero:** at pack scale the fireball is 70 px tall, 37% of her 190 px height. That is large, and `fx4.js` draws it smaller (50 px).

## Totals (56 frames)
- **Extra arms or hands:** 2 frames, both blockers (victory 5, victory 7).
- **Halo, cut fringe:** 0 frames at 190 px. Every pale source edge cluster I traced is a real highlight (steel edges, lantern glints, teeth, hair shine).
- **White pockets:** 2 frames, minor (woodcut 3 and 4, a sheet-white speck in her hair that shows at 190). Hunt 2 has a pale blue-white cuff (minor).
- **Holes in solid parts:** lantern glass (defeat 3, forage 2), mouth (victory 4), axe blade edge (woodcut 1, 3, 4, 7). All are minor; the blade holes close at 190.
- **Staff or tool changes hands:** hit 5-6 (blocker), forage 4 (blocker), defeat 2-5 and victory 8 (minor).
- **Tool does not read as its item:** woodcut 4-6 read as a hammer or T-bar (blocker); woodcut 3 reads as a spear point (minor).
- **Tool length drift:** hunt 4-6, the spear shrinks to a short javelin (blocker).
- **Staff on her back drops out or slips:** mining 2, woodcut 3, mining 3 (minor).
- **Fused fingers:** 0 seen.
- **Frame order:** correct in every move.
- **Blocker frames:** 11 (hit 5, 6; victory 5, 7; woodcut 4, 5, 6; forage 4; hunt 4, 5, 6). **Minor:** 14.

## Skip or reroll
- **hit:** skip 5-6 and play 1-4 then 7-8. It still reads as a hit and recovery.
- **victory:** skip 5 and 7 (third hands); play 1-4, 6, 8. Or reroll 5-8 with the staff kept in her back hand.
- **woodcut:** reroll. Frames 4-6 are the chop itself, so skipping them leaves no stroke. Re-brief so the blade face stays flat to the viewer through the swing. Keep 1, 2, 7 and 8 as reference.
- **forage:** skip 4 and play 1-3, 5-8. That reads as crouch, reach and pick by hand with the sickle at her side. Or reroll 4 with the sickle still in her back hand.
- **hunt:** reroll the thrust (4-6) as a two-hand thrust that keeps the whole shaft in view.
- **defeat and mining:** keep as they are. The minor faults do not show in play.
- **Effects:** threshold every sprite at alpha 128. Clean the trapped white specks (fireball 0-3, flames 2-3) in the conversion, without redrawing. Re-brief the Hex sigil. Fireball, frost, kindle, flames and cinders suit the art. Spark is acceptable as a fire dart.
