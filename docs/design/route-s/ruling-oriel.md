# Ruling: route-s-oriel-judge (Opus art judge, 2026-10-10, base 6658f2a5)

Question: should Auriel's route S pack go into the 2D game? It holds 23 kept moves x 8 Scenario key frames, the 11:02 finals after the
redraw. The judge rules **wire**, **re-brief** or **shelve** per move, after a red team. The yardstick is
`docs/design/art-direction.md`, the live game's look, and Wren's wired pack (#346). The questions follow Tobin's and Pip's rulings.

Card: `autopilot/cards/route-s-oriel-judge.md`. Scratch paths below are under `/mnt/project-files/experiments/`:
- the pack is `2d-poses-scenario/oriel-moves/` (`frames/`, README, `extra.json`);
- the judge's files are `route-s-judge-oriel/` (`review/` holds one 2x4 sheet per move, `crops/` the zooms, `judge/pockets.json`,
  `judge/bytes.json`, `tools/`, and `redteam/` with the brief and groups A to C).

The red team's three files are also copied into the repo at [oriel-records/](oriel-records/). The reference is Codex's concept,
`/mnt/project-files/concept-art/heroes-official-34/oriel.png`.

Kept moves, as `docs/design/heroes/oriel.md` section 7 lists them (the spec cut `foldchart` and `looksup`, so they are not ruled on):
- Attack;
- her own 7: fallingletter, pullreading, bearing, clearnight, badnews, letters, slivershum;
- the shared 5: spark, frostshard, arcaneward, hex, nova;
- the core 6: parry, dodge, hit, idle, defeat, victory;
- gathering 4: mining, woodcut, forage, hunt.

Names follow #352 and `hero-themed-kits`; this ruling judges poses only.

Cal's words (10:31, on the pack before the 11:02 redraw): "There's so much third arm going on. Her body also morphs in weird ways at
times. Also her staff went bendy in one of them. Maybe high quality was worth it. Or you didn't do your checks well enough." The card's rule is that a
move with a third arm or hand, a body morph or a bendy staff is re-brief, not wire.

## Ruling: re-brief. 4 moves pass, 19 sheets are rerolled, and nothing wires until a recheck passes

The redraw did not clear Cal's faults. **6 third hands** remain (5 certain, 1 probable), with **7 body morphs** and **0 bendy staffs**.
A new, pack-wide fault is the bigger one: **the staff shrinks to a third or a half of its length** whenever she holds it level or points
it at the foe. It does this in the release frame of attack, Frost Shard, Falling Star, Ill Omen, Take a Bearing and Starfall, and in
dodge's jump; her hunting spear does the same mid-thrust. Tobin's cleave and Pip's Lanternburst were rerolled for the same fault (a held item changing size).

- **Wire as drawn (4):** arcaneward; parry, skipping frame 5; hit, skipping frame 5; forage.
- **Re-brief (19 sheets):**
  - 9 for Cal's faults: spark, hex, nova, pullreading, letters, clearnight, defeat, victory, mining.
  - 9 more for a short staff or spear, or a broken pose, in a key frame: attack, frostshard, fallingletter, badnews, bearing,
    slivershum, dodge, woodcut, hunt.
  - 1 for idle: it does not match the other moves (below).
- **Shelve:** none. She is on-model on every sheet, and no fault needs a redraw. Every fault is a reroll fault, a cut fault (re-cut
  from raw) or a conversion fault.

`route-s-oriel-wire` waits for two things: the 19 rerolls passing a recheck (the same shape as Tobin's and Pip's rechecks), and
`hero-themed-kits` (the kit card).
The rerolls cost about 114 credits (19 sheets at 6, medium). The art thread spends them only on Cal's word (card: "a re-brief card
spends credits only with Cal's word"). The re-brief lines below go to the Wren art thread, which owns Scenario generation.

## Why

- **Look.** She matches the concept on every sheet. The hair, bun ornament, mantle with gold constellations, cream panel with the
  compass rose, crossed belts, strapped boots, ringed star staff and navy book are all there. Her outline and shading sit with Wren's
  wired pack. She reads as a caster, not a fighter, so her moves are small and the staff carries the silhouette. That is why a staff
  that halves in length shows so much.
- **Cal's checks, counted** (frame by frame, at full size, by three red-team groups; the judge zoomed every major):

| Fault | Frames | Count |
|---|---|---|
| Third hand or arm | spark 3 (finger hand at her ear plus the staff hand plus the front hand), hex 4 (a clawed hand by the staff hand and a ghost arm with a staff stub at her front), nova 2 (a third fist on the shaft), pullreading 7 (palms together plus the staff hand), letters 2 (a gloved hand at the belt plus a hand on the book plus the staff hand); probable: nova 6 (a hand-shaped blob at her chest) | 5 + 1 |
| Body morph | hex 4 (copper hair on the face side), nova 4 (grey smear over the eye), clearnight 5 (the mantle wraps her neck like a scarf; the hood, collar and front panel go), letters 2 (a second book on her hip), mining 3 (chestnut hair, no bun), victory 3 (the lantern turns into a pouch), defeat 4 (the hair under her chin reads as a beard) | 7 |
| Bendy staff | none. clearnight 3 bows about 8 px over 650 (1%), minor | 0 |
| Staff or spear shrinks below 70% of its longest, or ends at her fist | attack 2-6, frostshard 4-5, nova 2, 3, 5 (no star at all), 6, parry 5, dodge 3, 4, 6, 7 (about 65%), fallingletter 5-6, badnews 5, bearing 3 and 5, slivershum 5-6 (about a third), hunt 4-6 (the spear: 540, 650, 410, 250, 330 px visible in frames 1-5) | 25 |
| Other key-frame faults | attack 2 and 4 (a fused or missing hand), frostshard 4-5 (fused second hand), letters 3 (the staff floats with no hand, the book is in the staff hand), fallingletter 3-4 (she turns to face left), hit 5 (the staff jumps to her front hand for one frame), mining 7 (no pick head), mining 1 and 8 (the handle is 1.7x longer), woodcut 1 and 4-8 (fists that cannot hold one axe handle; 4 and 5 lose the rear arm) | 18 |

  - **Accepted, not counted as majors.** A staff butt that rides between ankle and mid-thigh in an upright hold counts as lifting the
    staff. The lying staff is 20-25% shorter in defeat 5-8, because the ground foreshortens it. Glove flicker, the book jumping place
    in attack 5-6 and dodge 2 and 5, and the gold knee plates in hunt are all small at game size.
  - **The lantern glows** in every move. The prompt asked for unlit glass, but the concept draws it lit, and it is the same in every
    fight move, so it stays. Idle's glass is red where every other move's is gold: that is one of idle's reroll reasons.
- **Cut faults (re-cut from raw, not rerolls).** White pockets of 8 px or more show in 180 of 184 frames. Most are the gaps between
  the star's points inside its ring, plus specks in her hair (`judge/pockets.json`). Some frames cut the ring gaps and others do not,
  so the star would flicker. The wire card's re-cut must flood every enclosed white gap. In hunt 5-6 and attack 6, the transparent
  pixels still carry colour from the next frame on the sheet. Conversion must cut at alpha 128 and drop the colour under alpha 0.
- **Bytes fit.** She is 190 art px tall at Wren's pack scale (0.2217), with 63 colours, 1-bit alpha and lossless WebP
  (`judge/bytes.json`, per-frame upper bound):
  - fight set: 1,171-1,395 KB, under Wren's 1,650 KB ceiling;
  - gather set: 229-273 KB;
  - all 23 moves: 1,400-1,668 KB, under the 2.0 MB hero line;
  - idle: 60-72 KB, the only part that boots, and only when she is the save's hero.

  She joins at the zone 20 Champion, so a new game's boot set (3.49 of 3.50 MB) does not change. A zone-20+ save that carries her
  swaps one hero's idle for another's.

## Per move: verdict, frames, impact and emit

The impact frame is the frame that `fxImpactIn` lands the act on. Emit points are `oriel.md` section 7's (x from her back edge, y from
the top of the cut frame). The wire card re-measures them on the packed frames of the final sheets. A frame list is the order the move
plays; a skipped frame is never shown.

| Move | Verdict | Frames to play (if it passes as is) | Impact | Emit | Why |
|---|---|---|---|---|---|
| idle | **re-brief** | (1-8, held at 1 with code breathing, as Pip) | none | none | Clean, but red lantern glass and a pouch where every other move has the book: the lantern changes colour each time idle cuts into a move |
| attack | **re-brief** | - | 5 | staff star | The strike (2-6) has a half-length staff; 2 and 4 fuse or lose a hand |
| spark | **re-brief** | fallback 1, 2, 4, 5, 7, 8 | 4 | two fingers | Third hand in 3; a large white pocket in 6 |
| frostshard | **re-brief** | - | 4 | staff star | The release and hold (4-5) have a fused hand and a staff at about 35% |
| arcaneward | **wire** | 1-8 | 6 | body centre (book) | No major fault; pockets are cut faults |
| hex | **re-brief** | fallback 1, 2, 3, 5, 6, 7, 8 | 5 | clawed hand | Frame 4: third hand, ghost arm and copper hair |
| nova | **re-brief** | - | 4 | staff butt on the ground | Third hand in 2 (probable in 6), face smear in 4, no star in 5, short staff in 2, 3 and 6 |
| fallingletter | **re-brief** | - | 5 | raised fingertip | She turns to face left in 3-4; the release and hold (5-6) have a half-length staff |
| pullreading | **re-brief** | fallback 1-6, 8 | 4 | the star from above | Third hand in 7 |
| bearing | **re-brief** | - | 5 | staff star | The staff is about half length in 3 and about 60% at the release (5) |
| clearnight | **re-brief** | fallback 1-4, 6-8 | 4 | open palm | Frame 5: the mantle becomes a scarf and her hood, collar and panel go |
| badnews | **re-brief** | - | 5 | staff star | The release (5) has a half-length staff |
| letters | **re-brief** | - | 5 | open book | Frame 2: third hand and a second book; frame 3: the staff floats |
| slivershum | **re-brief** | - | 5 | staff star | Her finisher's release and hold (5-6) have a staff a third of its length |
| parry | **wire** | 1, 2, 3, 4, 6, 7, 8 | 3 (the block) | staff middle | Frame 5's staff starts at her fist and the rear fist grips air; 4 to 6 still reads |
| dodge | **re-brief** | - | 3 (in the air) | none | The staff pumps from 100% to about 65% and back (3, 4, 6, 7). Dodge plays in every fight, so it shows |
| hit | **wire** | 1, 2, 3, 4, 6, 7, 8 | none | none | The staff hops to her front hand in 5 only |
| defeat | **re-brief** | fallback 1, 2, 3, 5, 6, 7, 8 | none | none | Frame 4: a beard-like lower face, and the slipped staff stands back up |
| victory | **re-brief** | fallback 1, 2, 4-8 | none | none | Frame 3: the lantern turns into a pouch |
| mining | **re-brief** | - | 5 | pick head | Chestnut hair in 3, no pick head in 7, and the handle 1.7x longer in 1 and 8 (the ready pose, so no skip fixes it) |
| woodcut | **re-brief** | - | 5 | axe head (game-placed) | Only frame 3 can hold one straight handle (below) |
| forage | **wire** | 1-8 | 4 | sickle | Two-hand sickle grip in 4 and finger holes in 8 are minor |
| hunt | **re-brief** | - | 5 | spear point | The spear shrinks to about 40% at the thrust (4-6) and ends at her fist at impact; no skip fixes the thrust |

A "fallback" list applies only if Cal says "Skip the bad Auriel frames" (below), or if a reroll comes back worse than the frame it replaces.

## The woodcut sheet and the game-placed axe

**Ruling: a game-placed axe counts as a minor detail under Cal's 08:45 words, on one condition. The axe is an artist-drawn sprite,
and the game only places and turns it.** The axe is Scenario's own drawing, like `tests-10oct/axes8.png` (8 fixed angles). The game
puts it at a per-frame fist anchor and angle, behind her head on the wind-up, with the fists drawn back over the haft. That is the
bowstring's pattern: the art is the artist's, and the game supplies the position. A code-drawn axe (rectangles or a hand-pixelled head)
is not a minor detail. It is new art, and it stays out under CLAUDE.md's art rules.

**Does it fix Cal's axe problem? It fixes the axe, not the pose.** Every earlier sheet drew a different axe, or drew it edge-on as a
T-bar (Wren v3, Pip v5, Tobin v4). One vetted axe sprite is the same in every frame, so that failure cannot come back. But Auriel's sheet
cannot take it yet:
- Frame 3 is the only frame with two fists on one line that a straight handle could pass through.
- Frames 1, 7 and 8 are a clasp (one hand cups the other fist).
- Frame 6 has the fists side by side, with the grips parallel.
- Frames 2, 4 and 5 show one fist; in 4 and 5 the rear arm is missing, so the chop reads as a one-armed punch at head height.

The Tobin test strip (`tests-10oct/tobin-woodcut-comp.webp`) shows the second risk: at impact the axe points up, not into the trunk.

So woodcut is re-briefed (lines below). The axe sprite is part of Auriel's pack and is judged in the same woodcut recheck, not on
its own. Before it wires, a composite strip of Auriel with the placed axe goes to the recheck judge. The
pass test is Tobin's woodcut v6 recheck: the axe head forward at about two-thirds of her height at impact, the edge into the trunk, and
the same axe in every frame.

## Re-brief lines for the art thread (the Wren art thread owns generation; spend only on Cal's word)

These lines go into `extra.json` for the 19 sheets. Keep every existing line, including the hand count, the book strap and no effects.

- **Staff length (all staff moves):** "The staff is always as long as she is tall, in every frame. When she holds it level or points it
  at the foe, both ends show: the brass butt cap sticks out behind her rear hand and the star is far in front of her. It is never a short
  wand that ends at her fist."
- **idle:** "The lantern glass is the same warm gold as in her other moves, not red. The navy star-chart book hangs on its strap at her
  rear hip in every frame; there is no pouch there."
- **fallingletter:** "She faces right in every frame. To look up she tilts her head back; her face stays turned toward the right edge."
- **letters:** "Exactly one book, in her front hand from frame 2 to frame 7. The staff stays in her rear hand, butt on the ground."
- **clearnight:** "Her hooded mantle, charcoal collar and cream front panel are the same in every frame."
- **nova:** "The star is always at the top end of the staff, in every frame."
- **mining:** "The pickaxe is the same size in every frame and its iron head always shows. Her hair is dark navy-black in every frame."
- **woodcut:** "Both fists show in every frame, one directly above the other on the same straight line, gripping as if on one long
  handle, the same grip in every frame. Impact: both arms straight forward at chest height, fists level and pointing right at the
  trunk. No tool is drawn."
- **hunt:** "The spear is the same length in every frame; when she thrusts, its butt shows behind her rear hand."
- **victory, defeat, spark, hex, pullreading:** reroll with the current lines unchanged. The recheck counts the same faults again.

## Veto phrases for Cal

- **"Skip the bad Auriel frames":** no rerolls. Ship the moves that have a fallback list (spark, hex, pullreading, clearnight, defeat,
  victory) with those frames skipped. The other 13 re-briefed moves have no fallback, so her pack still cannot wire whole until they
  are rerolled.
- **"Code can draw Auriel's axe":** the game may draw the axe itself, not only place an artist-drawn one. This changes CLAUDE.md's art
  rules for one prop.
- **"Auriel's hunt spear is fine":** puts hunt back to wire as drawn, frames 1-8 (the independent judge check moved it to re-brief).
- **"Short staffs and spears are fine":** accept the half-length staff or spear in thrusts as foreshortening. Attack, frostshard,
  badnews, bearing, slivershum, dodge and hunt then pass as drawn or with skips; nova, fallingletter, letters, mining and woodcut stay re-briefed for their other faults.

## Checks run

- All 184 kept frames opened at full size by the red team (group A 64, B 64, C 56); every major zoomed by the judge.
- `tools/pockets.py` (white pockets of 8 px or more per frame), `tools/bytes.py` (byte estimate), `tools/review.py` (review sheets).
- An independent Opus judge (judge agent) reopened the worst frames and upheld the ruling with one change: hunt moved from wire to
  re-brief, because its spear shrinks mid-thrust under the same rule. It also widened the length rule to every held prop (spear, pick,
  sickle), counting arm-hidden length only where the forearm lies along the shaft.
- No pixels redrawn and no credits spent.
