# Red team brief: Oriel route S pack (card route-s-oriel-judge)

You are a red team. Argue AGAINST wiring Oriel's pack into the game. Your job is to find every defect, frame by frame. A judge reads your file and checks every frame you flag, so name frames exactly (`move N`) and be specific about where in the frame (e.g. "a third hand at her rear hip, below the book").

Cal (owner) on the previous version of this pack, 10:31: "There's so much third arm going on. Her body also morphs in weird ways at times. Also her staff went bendy in one of them. Maybe high quality was worth it. Or you didn't do your checks well enough." The art thread then redrew the fight sheets (book strapped at hip, 6 sheets rerolled). Do not trust that the redraw fixed it: check every frame yourself.

## Inputs (read-only; never edit, move or delete anything under 2d-poses-scenario/)
- Frames, full size (about 580x900 px each): `/mnt/project-files/experiments/2d-poses-scenario/oriel-moves/frames/<move>-<1..8>.png`
- Review sheets (all 8 frames of a move at one scale, numbered): `/mnt/project-files/experiments/route-s-judge-oriel/review/<move>.png`
- What each frame should show: `/mnt/project-files/experiments/2d-poses-scenario/oriel-moves/moves.json`, `kit.json`, `gather.json` (each entry: id, title, 8 frame descriptions).
- Her design (concept): `/mnt/project-files/concept-art/heroes-official-34/oriel.png`. Design text: navy-black curly hair in a bun with gold star-compass ornament, gold earring, deep navy hooded mantle with gold constellation lines and ragged gold-trimmed hem, long cream-white inner robe with wide sleeves, cream front panel with gold compass-rose, charcoal high collar, crossed brown belts, small brass lantern at hip (UNLIT), grey leggings, tall strapped brown boots, ONE tall straight brass staff with gold ring bands topped by an eight-pointed brass star in a ring, ONE navy book with gold corners (strapped at her rear hip in fights unless the move uses it). Gathering moves: staff slung across her back, book at hip. Woodcut is drawn with EMPTY FISTS on purpose (the game will place an axe).

## Method
1. Open the review sheet for the move first, to compare neighbouring frames (morphing shows between frames).
2. Then open EVERY frame at full size with the Read tool and count. Do not skip frames because the review sheet looked fine: third hands hide in sleeves, mantle folds and behind the staff.
3. For each frame record:
   - **hands/arms**: how many hands and arms you can see. Anything more than two (an extra hand on the staff, a hand on the book while both hands are elsewhere, an arm fragment from the mantle, a hand-shaped blob) is a THIRD ARM/HAND. Also note fused or missing hands.
   - **body morph**: anything that changes her body or design between frames, or is anatomically wrong: torso or leg length jumps, extra/missing leg, head size change, a limb bending the wrong way, hair colour change, mantle turning into a cape/wing, clothes changing, face covered, a lit lantern, a second book.
   - **staff**: count (exactly one), straight or BENT/curved/wavy, length vs idle 1 (much shorter or longer?), star at the top end only, held (not floating), not broken.
   - **meaning**: does the frame show what its description says? (wrong hand, wrong pose, missing tool in gathering, etc.)
   - **cut faults**: white pockets, pale halo edge, missing parts cut off, specks.
4. Use Python (PIL, numpy, scipy are installed; install nothing) only if it helps, e.g. to crop and zoom a doubtful region into `/mnt/project-files/experiments/route-s-judge-oriel/crops/` (name crops `<move>-<n>-<what>.png`). Write no other files outside your output file and crops.

## Output
Write ONE markdown file to `/mnt/project-files/experiments/route-s-judge-oriel/redteam/<your group>.md` with:
- A table, one row per frame (all frames of your moves, even clean ones): `| move | frame | hands/arms | third arm? | morph | staff | meaning | cut | severity |` with severity one of `clean`, `minor` (reads fine at game size, about 1/4 of full size), `major` (a player would notice at game size, or Cal's three faults: third arm/hand, body morph, bendy staff).
- Per move: a one-line verdict you argue for (`wire`, `wire skipping frames N`, `reroll`), and why.
- Totals: third arms/hands, body morphs, bendy staffs, other majors.
Be honest: if a frame is clean, say clean. Do not inflate. Do not call any `mcp__hearthbot__` tools and do not post anywhere; your final message is a short summary of the totals and the worst frames.
