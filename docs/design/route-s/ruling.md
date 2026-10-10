# Ruling: integrate-route-s-wren (Opus art judge, 2026-10-10, base b8390591)

Question: should Wren's route S pack go into the 2D game? Route S is Scenario-made 2D key frames of Cal's new full-body Wren
concept. The judge rules **wire**, **re-brief** or **shelve**, after a red team.
Card: `autopilot/cards/integrate-route-s-wren.md`. The pack, the red team and the measurements are scratch, in the shared
folder (`/mnt/project-files/`):

- Pack: `experiments/2d-poses-scenario/wren-moves/` (20 moves x 8 key frames, `string-test/` for the string-less shooting frames
  and their anchors), `wren-gathering/` (4 loops; woodcut and forage v2), `wren-fx-test/` (arrow and bat sprites, `fx3.js`).
  Gallery v10: https://claude.ai/artifact/R3245P8ApnrWnfn4JRGNsr
- Evidence: `experiments/route-s-judge/evidence.md`, with `tools/measure.py`, `out/` and `crops/`.
- Red team: `experiments/route-s-judge/redteam.md`, with outputs in `redteam/`. Judge checks: `experiments/route-s-judge/judge/`.
- The cancelled spike's route S material: `experiments/live-3d-spike/shots/s-*.png`, `clips/clip-4.mp4`, `clips/close-4.png`,
  `report-full.md`; closeout `autopilot/reports/live-3d-spike-closeout.md`.

Cal's words (input): 00:32 "That's absolutely brilliant, can we get all that in the game now". 00:34 "Update the rules.
Everything we've done with Wren today should be the default. Please proceed with putting this pack in the game". 00:37 the 3D
spike is cancelled ("Scenario has made 2D the best option we have"). 00:40 "Yes I aprove", the pipeline rules in
`autopilot/rulings/2026-10-10-wren-pipeline-default.md` (docs in #325): Scenario hero poses from the approved concept, a
game-drawn bowstring, and game-drawn motion and light effects are allowed; arrows and bats are sprites; this judge still checks
the pack, her size and the bytes. On size, 00:43: "Are the height rules still in place for heroes? With bigger screens for
desktop/browser I think we should scrap that", and "I might make mobile not have visuals. It'll be like a console menu".

Because of the 00:40 rule, "art only by Codex" does not block this ruling.

## Ruling: wire the fight set; re-brief the woodcut axe

Wire all 20 fight moves, the arrow sprites and the bat sprites through the gated build card `route-s-wren-wire` (below),
behind the Classic art switch. The woodcut axe failed twice (v2, v3) and passed on v4, so the 4 gathering loops wire as one
set through a follow-on card, `route-s-wren-gather`. Until it lands, gathering shows the camp pose, as it does today.
Heroes and foes draw 1.5x bigger against the scenery (`actor-scale`), after Cal's 01:23 note that she "looks like a little
kid".

The whole-pack rule allows this split. It covers "that character or scene". The fight set is complete and on-model, and
nothing from the gathering set ships half-done.

## Why

- **Look.** At 1280x720 she suits the painted backgrounds better than today's chunky Wren (`shots/s-1280x720.png` vs
  `2d-1280x720.png`; `crops/s-1280-wren-x3.png`). All 20 sheets are on-model. Her colours match her portrait and icons. Cal
  approved the look three times and the pipeline rule at 00:40.
- **Bytes.** The fight set alone fits the page: 1,604.9 KB of files (`out/bytes-190-63.json`). The built page is 8,357,240 bytes
  today; with the fight set embedded it is about 10.4 MB, under the 12 MB warn and 14 MB fail lines.
- **Motion.** The red team's motion faults are real. The judge re-measured them (`judge/check.py`): idle heights run 187-194 px,
  and about 39-40% of the silhouette changes going idle to attack and back. Conversion and code can fix them without new art:
  register the feet, scale each move once, hold the idle with code breathing, and add game-drawn motion effects (now allowed).
  The build's clip read (gate 12) decides whether that is enough.
- **Woodcut axe.** At 190 px it reads as a sledgehammer (`out/woodcut-190.png`), so it fails "fits the item's meaning". Mining,
  foraging and hunting read as their tools (`crops/gather-mining-forage-hunt.png`).
- **Woodcut v3 (2026-10-10 follow-up): fails.** At 190 px the edge-on head is a 4-5 x 16-22 px sliver on a long haft. It
  reads as a pick or T-bar, and its level jab matches the Hunting spear loop (`crops/woodcut-v3-190.png`,
  `crops/woodcut-v3-f4-6-x3.png`). The v3 prompt hid the broad face, against re-brief 1.
- **Woodcut v4 (follow-up): pass.** A flared felling axe in profile on every frame; the head is about 18 x 27 px at 190 px
  (`crops/woodcut-v4-190.png`). The edge faces down on impact. It reads as a chop when the head is drawn over the trunk
  (`zone1-test/scene-gather-big.png`), so gather gate G3 places it there. Gather set: 277.6 KB (`judge/v4/bytes-190-63.json`).
  Cal's 00:06 note asked for the edge "hidden behind the handle"; v3 tried that and became a T-bar, so reading as an axe wins.
- **Mixed style is limited.** One hero stands on the stage at a time. The clash with Tobin and Pip shows only in the picker and
  the hero sheet (`76-create.js:58`, `75-solo-ui.js:469`), where she is drawn at their height.

## Veto phrases for Cal

- "Pull the new Wren": undoes the wire.
- "Wait for all three heroes": holds Wren until Tobin and Pip have route S packs.
- "Turn the axe edge into the tree": reroll woodcut v5 (Scenario credits); text in the re-brief list.
- "Heroes back to 95 px": ACTOR_K = 1, today's size.
- "Heroes only, not foes": the 1.5x applies to heroes alone (bosses then fall to about 0.6 of hero height).

## The seven questions

**1. Look.** Yes, it suits the game, and it beats today's Wren where most players look.
- 1280x720: she sits in the painted Mossy Hollow scene, her face reads, and she matches her portrait and icons.
- 740x360: on a DPR 2 phone she is drawn at 1 device px per art px or more and stays crisp (1.5x with actor-scale). On DPR 1
  she is downscaled and softer than today's Wren (`crops/740-s-vs-2d.png`). That is a small-window case; real phones are DPR 2
  or more.
- Weak points: at idle the upright bow can read as a scythe, and her brown boots sit on a brown path. The game-drawn string and
  the bat help. The judge reads both again on the build's shots.

**2. Mixed style.** Ship Wren alone, behind Classic art.
- Only one hero is on the stage, so the mismatch shows only in the picker and hero sheet, where she is drawn at Tobin's and Pip's
  height.
- Tobin and Pip follow as route S packs, once Cal OKs the Scenario credits.
- On the Artifact page a second hero wires only if the page stays at or under 12 MB. A third waits for the hosting split.
- Veto: "Wait for all three heroes".

**3. Size and fit.** Actors (heroes, foes, bosses, gather nodes, beasts) draw at ACTOR_K = 1.5 against unchanged scenery
(Cal, 01:23: "She looks like a little kid"). A hero stands about 142 logical stage px. Screen px per Wren art px = 0.75 x stage
zoom x DPR.

| View | Stage zoom | Her height on screen | Scaling |
|---|---|---|---|
| 1280x720, 1366x640, 1024x768 | x2 | 285 CSS px | 1.5x at DPR 1, 3x at DPR 2 |
| 1920x1080 | x3 | 427 CSS px | 2.25x at DPR 1, 4.5x at DPR 2 |
| 740x360 | x1 | 142 CSS px | 1.5x device px at DPR 2; 0.75x downscale at DPR 1 |
| 360x740 portrait | 1.5 | about 142 CSS px (K = 1) | unchanged until UX-L1 |

The stage's logical layout and whole-step zoom are unchanged, and no-swarm-shrink stands. See "Hero size" below.

**4. Bytes.** Measured on scratch copies (`tools/measure.py`): one shared palette over the pack, 1-bit alpha, lossless WebP,
per-move atlases. KB = KiB.

| Set | 190 px, 63 colours | 190 px, 40 colours | 285 px, 63 colours |
|---|---|---|---|
| 20 fight moves | 1,604.9 KB | 1,406.3 KB | 3,215.2 KB |
| 4 gather loops | 283.2 KB | 249.1 KB | 564.9 KB |
| All 24 | 1,888.1 KB | 1,655.4 KB | 3,780.1 KB |

- In the page (basE91 embed), the fight set adds about 2.0 MB: 8.36 MB to about 10.4 MB.
- With woodcut v4 (`judge/v4/bytes-190-63.json`): gather set 277.6 KB, all 24 moves 1,881.9 KB; the page with both sets is
  about 10.73 MB.
- Ceilings: Wren's fight set at most 1,650 KB of files; arrow and bat sprites at most 60 KB; the gather set at most 300 KB; any hero's whole pack at most 2.0 MB of files.
- Do not quantise below 63 colours to make room: 40 colours saves only 12%.
- #320's 600 KB hero line lapses with the spike; the 2.0 MB ceiling replaces it. Under hosting route B2, only the core 7 moves
  of the hero in play belong in the boot set (545 KB), so the art-loader card must re-set the provisional 4.0 MB boot line.

**5. Motion.** A runtime tween or cross-fade is not enough: it ghosts. In-betweens are not needed to ship. These are:
- feet registration and one scale per move, during conversion;
- a held idle with code breathing;
- release frames matched to hits;
- game-drawn trails and smears on Shadow Step and Dodge, whose frames jump 75-86% in one step.

The judge's clip read decides. If it fails, the fix is one shared ready-stance frame (Scenario credits, Cal's OK).

**6. Completeness.**
- Has: idle, attack, Twin Shot, all 13 active abilities (Night Hunter is passive), parry, dodge, hit, defeat, victory, and
  4 gather loops.
- Camp pose: victory frame 4 (relaxed, bow on her shoulder), held. It is a drawn frame of the pack, not stand-in art.
- Volley loops its drawn draw-and-release frames once per timed arrow. Moonlit Volley is one sky shot, then 5 falling arrow
  sprites; its key is "sky-draw" (`hero-abilities.md:220`), so it needs no five draws.
- Gathering: complete with woodcut v4 (v2 and v3 failed); it wires through `route-s-wren-gather`.

**7. What #320 still means.**
- Live 3D and toon sprites are off. Gloomjaw's 3D model is shelved. Route S replaces "A with Codex paintover" for heroes.
- Foes stay 2D pixel at the whole-step stage zoom. Codex's zone 3-10 briefs continue at today's scale with 4-view turnarounds.
  The foe ceilings (85/120/200/60 KB, 425 KB an area) are unchanged. The spike's 135 KB foe line lapses.
- Scenario for foes is a new question for Cal, not settled here.
- art-scale-ruling is unheld: for heroes this ruling settles it; for foes it stays at today's scale.
- basic-attack-swings is a dependency of the build (Wren's Attack plays no swing in turn fights today).

## Hero size (all heroes)

Cal asked whether the height rules are still in place. Two were:
- hero art is drawn about 96 px tall (`art-pipeline.md` section 1);
- heroes grow only in whole zoom steps, never at a non-integer scale (#310).

**Scrapped:** the 96 px art spec for new hero packs (packs are about 190 px art from Scenario), and "never at a non-integer
scale" for these finer heroes only.

**What replaces them:** heroes and foes share one actor scale, ACTOR_K = 1.5 (Cal, 01:23: "I think the heroes should be bigger
than you've szed Wren in the example... She looks like a little kid"). A hero stands about 142 logical px (about 42% of the
1280x720 stage, 285 CSS px, close to the 270 px of Cal's big test, `zone1-test/scene-fight-big.png`). Foes keep today's ratio
to the hero (the Thorn Imp about 78%); scenery and stage zoom are unchanged. The source art stays 190 px, scaled up, with no
new bytes. Tobin's and Pip's 96 px art lands on 3 CSS px per art px at 1280x720, whole pixels, at the same height.

Why foes grow too: if only heroes grew, Gloomjaw (about 72 logical px against Wren's 95 in `shots/s-1280x720.png`) and the
Elder Moss Slime boss would drop to about half her height. The tight spots are the 280 logical px minimum stage (her head at
about 82) and 740x360 (her head beside "Your turn"); the `actor-scale` card gates both.

**What stays:** today's hero-to-boss and hero-to-foe ratios; whole-step zoom for the stage and backgrounds; no swarm shrink;
`LAND_ZOOMS`, `LAND_MIN_W` and `LAND_MIN_H`; portrait at K = 1 until UX-L1. A 285 px source pack waits for the hosting split
(3,215 KB fight set, page about 12.4 MB). Veto: "Heroes back to 95 px" or "Heroes only, not foes".

**If phones go menu-only:** that is a separate decision for Cal, not part of this card. It would drop the 740x360 and 360x740
stage gates (and zoom-1 stages could keep K = 1), leave small DPR 1 desktop windows as the only soft case, and let a phone build skip hero art bytes once hosting
route B2 exists. Until Cal decides, the CLAUDE.md landscape-phone rule stands.

## The red team's case and the answer

Red team verdict: re-brief. Its three strongest points and how the ruling answers them:

1. **Bytes:** 1.93 MB for one hero, about 13 times the plan's 150 KB; three heroes pass 14 MB. Answer: the fight set alone fits
   (about 10.4 MB); a 2.0 MB hero ceiling; a second hero only at or under 12 MB; a third waits for the hosting split. The
   gather set wires on its own card with its own 10.8 MB page line.
2. **Motion:** 19-41% silhouette pops at every move's start and end, a boiling idle, 13% scale drift between sheets. Answer:
   build gates 2, 3 and 12 (registration, a held idle, a judge clip read). If the clip fails, shared ready-stance frames come
   back as a re-brief.
3. **Fit:** what ships (63 colours, 190 px, 1-bit alpha) is not what Cal saw; soft at 1920 and at 740 on DPR 1; too big for the
   picker; no camp pose. Answer: the 1.5x mock reads fine (`judge/scale15.png`); DPR 1 phones are rare; the picker and camp
   use victory frame 4 at 0.5 scale (gate 7); a preview link goes to Cal before any Monday build (gate 13).

Kept from the red team: a hero byte ceiling; one scale and a feet anchor per frame; a held idle; the woodcut axe re-brief; a
string colour that matches the painted string; the camp pose and picker fit; shots at DPR 1 and 2.
Not adopted: a 1.0 MB hero ceiling met by fewer frames (it would cut drawn moves Cal asked for); "Cal says yes to the
converted frames" as a gate before the build (the preview link to Cal plus his veto covers it, and no card waits for Cal).

## Build card spec: route-s-wren-wire

Lane: claude. Model: opus-high. Gate: judge (art). Prio: P1. Base: integration branch `claude/elegant-johnson-m6k00u`.
Depends on: #325 bowstring-rule-docs; basic-attack-swings (her Attack must play in turn fights); ability-effects-live (the
effects engine).

**Outcome:** Wren's 20 fight moves are converted from `wren-moves/sheets` and `frames` as drawn, embedded, and drawn by the
stage when Classic art is off.

**Gates:**
1. **Bytes:** fight atlases (per move, one palette, at most 64 colours, 1-bit alpha, lossless WebP) at most 1,650 KB of files;
   arrow sprites (plain, heavy, sonic) and 6 bat flaps at most 60 KB; the page after `node tools/build.mjs` at most 10.6 MB.
   The PR prints all three numbers. No 285 px pack. The gather loops are not embedded here; `route-s-wren-gather` embeds them.
2. **Registration:** cut from the sheets with a ground line per sheet, not the bounding-box crops, so airborne frames keep their
   height. One scale per move, between 0.88 and 1.12 of the pack scale (0.2217), recorded in the data. Standing feet rows equal
   within 1 art px inside each move. The opening and closing standing frames of all 20 moves: hood-top height 190 ± 3 art px,
   feet centre within ± 3 art px of idle's held frame. `check.mjs` asserts these from the data.
3. **Idle:** either one held idle frame plus code breathing (1 art px drop above the waist, today's method), or a ping-pong of
   idle frames where every registered step changes at most 10% of the silhouette. Reduced motion: held frame, no breathing.
4. **String:** game-drawn through the 3 anchors on the 12 shooting moves, 1 art px wide, in the palette colour of the painted
   string on the 8 non-shooting moves. An automated check confirms every anchor sits on an opaque bow-tip or hand pixel on
   every shooting frame.
5. **Timing:** the spike's timings (attack and abilities 900 ms with the release frame on the hit; parry 660 ms; hit 540 ms;
   defeat 2080 ms, held). A release index per move. Volley's 3 and Moonlit Volley's 5 timed arrows each show their release
   frame or arrow spawn within 17 ms of the prompt's contact time. Frames may be reused or reordered, never redrawn.
6. **Scale:** 0.5 x ACTOR_K logical px per art px, with ACTOR_K read from `actor-scale` (1 until it lands). Nearest-neighbour
   at 1x and above, including 1.5x and 2.25x; under 1x, downscale once into cached canvases with smoothing. No change to
   `LAND_ZOOMS`, `LAND_MIN_W`, `LAND_MIN_H` or the portrait zooms.
7. **Camp, picker, hero sheet and camp switch:** victory frame 4 at 0.5 scale, with canvases sized so nothing clips. The header
   uses the concept portrait (`64k-portraits.js`). Gathering shows the camp pose until `route-s-wren-gather` lands.
8. **Classic art:** one Settings switch turns both the portraits and the stage Wren back to today's. Default: new art. The pref
   has a default, and old saves load without a save-key bump.
9. **Companion bat:** `bats.png` flaps at a fixed offset from the feet anchor, never overlapping her head box on any frame.
10. **Effects:** trails, flashes, sparks, rings, shake and hit-stop come from the effects engine, with status colours. Reduced
    motion: no shake, no trails.
11. **Shots for the PR:** fight idle, attack release, Volley, parry, hit, defeat, plus picker and camp, at 1280x720 (DPR 1
    and 2), 1920x1080 (DPR 1 and 2), 1366x640, 1024x768, 740x360 (DPR 1 and 2) and 360x740 portrait (DPR 2).
12. **Clips:** 1280x720 DPR 1, 30 fps, about 12 s, a seeded zone 2 fight: idle, Attack, Volley, bitten, parry, Moonlit Volley,
    Shadow Step, idle. The same at 740x360 DPR 2. The judge passes them only if she never changes size, never slides on her
    feet, the string never leaves the bow or jumps colour, the idle does not boil, and each release meets its hit.
13. **Checks:** `node tools/build.mjs && node tools/check.mjs`; walk and cold leg on the SHA (the preview gate); a preview link
    goes to Cal in the digest. It joins a Monday build only if gate 12 passed before the cut; otherwise it waits a week.

**Never:** redraw or repaint pixels, or quantise below 63 colours; embed the gather loops (that is `route-s-wren-gather`); touch Tobin's
or Pip's art; change the stage zoom or the online layer; spend Scenario credits.

## Build card spec: route-s-wren-gather

Lane: claude. Model: opus-high. Gate: judge (art). Prio: P1. Depends on: route-s-wren-wire.

- **G1 Bytes:** mining v1, woodcut v4 (`wren-gathering/v4/`), forage v2, hunt v1, in the fight set's palette, at most 300 KB of
  files; the page at most 10.8 MB. The PR prints both numbers.
- **G2 Registration:** gates 2 and 6 of route-s-wren-wire apply, at the same scale as the fight moves.
- **G3 Contact:** on impact frames (woodcut 5-6, the mining and hunt impacts) the hero draws after the node. The axe head, pick
  tip or spear tip covers the notch, crack or beast, and chips spawn there.
- **G4:** it replaces the camp pose while gathering, and Codex's interim Wren hunt poses (`art/heroes/wren/hunt` stays on disk).
  Classic art restores both.
- **G5 Shots and clip** at 1280x720 and 740x360 (DPR 1 and 2) for each loop. The judge passes them only if there is no size pop
  and contact is on the node.
- **Never:** redraw, rotate or flip tool pixels; touch Tobin's or Pip's art; spend Scenario credits.

## Build card spec: actor-scale

Lane: claude. Model: opus-high. Gate: judge (art). Prio: P1. Before or with route-s-wren-wire.

- **G1:** one constant, ACTOR_K = 1.5, for heroes, foes, bosses, adds, gather nodes and beasts. Nearest-neighbour; no art data
  changes.
- **G2:** at 1280x720, 1366x640, 1920x1080 and 740x360 (DPR 1 and 2), no actor box overlaps the HP plates, place line, turn
  banner, chips or stage buttons. Packs of 2-3 foes and a boss with adds overlap at most 15% of a foe's width. The
  hero-to-front-foe gap is at least 16 logical px; otherwise spread the foe slots.
- **G3:** if 740x360 fails G2, zoom-1 stages use K = 1.
- **G4:** portrait keeps K = 1.
- **G5 Shots:** zone 1 fight, Gloomjaw, Elder Moss Slime, a 3-foe pack, a gather scene. The preview link goes to Cal.

## Re-brief list

1. **Woodcut axe:** done; v4 passed (v2's block head and v3's edge-on sliver failed). Reroll only on Cal's veto "Turn the axe
   edge into the tree" (v5; Scenario credits): same as v4, except at impact (frames 5-6) the haft points up and right at about
   45 degrees from her hands, with the head at its top; the bit's curved edge points right, level, into the trunk at chest
   height, and the broad face still shows.
2. **Gather set:** mining v1, woodcut v4, forage v2, hunt v1 wire as one set through `route-s-wren-gather` after
   `route-s-wren-wire` lands. 277.6 KB measured, at most 300 KB.
3. **Only if gate 12 fails** (credits; Cal's OK): one shared ready-stance frame that every move opens and closes on.
4. **Tobin and Pip route S packs** (credits; Cal's OK): each at most 2.0 MB of files, wired under the page rule in question 2.

## Risks

- The build clip shows pops or boiling: registration and a held idle were not enough. Gate 12 shows it; the fix is re-brief 3.
- 1920x1080 at DPR 1 looks rough at 2.25x, with foes at 4.5 CSS px per art px. The build's 1920 shots show it.
- Bigger actors crowd the HUD or each other at 740x360 or on the minimum stage. actor-scale G2 shows it; G3 falls back to K = 1.
- DPR 1 small windows are soft. A reviewer complaint about small desktop windows would show it.
- Wren's 2 MB takes most of the Artifact page's room for Chapter 1 art (the plan forecasts 13.7-14.7 MB), so the hosting split
  must land before Chapter 1 art finishes. The page-size check and the board forecast show it.
- Under B2 the boot set with Wren's core 7 moves passes the provisional 4.0 MB line; the art-loader card re-sets it.

## Checked / not checked

Checked by the judge: the card, evidence, red team and the new pipeline ruling; DECISIONS #310 (lines 1159-1166) and
`desktop-layout/hero-size/ruling.md`; `62-stage.js` `LAND_ZOOMS`, `pickZoom` and the DPR cap at 2; the `64h-hero-sprites.js`
header; the picker canvases (`76-create.js:58`, `75-solo-ui.js:469`); the Classic art pref (portraits only today,
`64k-portraits.js:7`); the built page size; the byte JSONs and the red team's motion JSONs; its own height and silhouette
re-measure; a 1920 size mock and a 1.5x/2x scaling crop; the idle, attack, volley, moonlit, victory, shadowstep and woodcut
sheets; the spike shots and `close-4.png`; `hosting.md` sections 5, 6 and 8; the Volley and Moonlit Volley lines.

Not checked: gallery v10 (no network) and `clip-4.mp4` (read through `close-4.png`); `fx3.js` internals and the arrow and bat
sprite bytes at game scale; the red team's 79% outline and silhouette-area figures; the bat anchors. For the follow-ups:
HUD clearance and foe overlap at 1.5x in a real build (estimated from the shots), how far airborne frames rise, the 1920 DPR 1
look of 4.5x foes, and page bytes after a real build.

## Plain words for Cal

Yes, two height rules were still in place: hero art drawn 96 px tall, and heroes growing only in whole zoom steps. Both go.
Heroes and monsters both get 1.5x bigger against the scenery, so Wren stands about 285 px tall on a 1280x720 screen instead of
190, with no extra download. Her 20 fight moves go in behind the Classic art switch, and her gathering follows on its own card:
the third axe (v4) reads as an axe. To overrule, say "Pull the new Wren", "Wait for all three heroes", "Turn the axe edge into
the tree", "Heroes back to 95 px" or "Heroes only, not foes".
