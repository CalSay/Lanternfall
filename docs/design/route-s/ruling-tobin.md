# Ruling: integrate-route-s-tobin (Opus art judge, 2026-10-10, base 2636ca13)

Question: should Tobin's route S pack go into the 2D game? It holds 25 moves x 8 Scenario key frames from his approved concept,
plus his shaped-effect sprites. The judge rules **wire**, **re-brief** or **shelve**, after a red team, on the questions of Wren's
ruling (`docs/design/route-s/ruling.md`, #328). Card: `autopilot/cards/integrate-route-s-tobin.md`. All paths are scratch, in the
shared folder (`/mnt/project-files/experiments/`):

- Pack: `2d-poses-scenario/tobin-moves/` (README, `raw/`, `frames/`, `sheets/`, `strips/meta.json`); gallery
  https://claude.ai/artifact/R3245P8ApnrWnfn4JRGNsr (not opened). Effects: `2d-poses-scenario/hero-fx-test/` (`tobin-fx.png`,
  `fx/shield0-3`, `rock0-4`, `crack0`); the live-drawn engine is not ruled here.
- Evidence: `route-s-judge-tobin/MEASURE.md`, `out/` (plain palette), `out-seed/` (seeded); audits `audit/A.md`, `B.md`, `C.md`
  (sheets `audit/<move>-a/-b.png`); red team `redteam.md`, `redteam/`; judge `judge/tools/`, `judge/crops/`. Reference: the concept
  `/mnt/project-files/concept-art/heroes-official-34/tobin.png`, not today's in-game Tobin (a different design).

Cal's words: 01:15 "Please work on Tobin and Pip while I'm sleeping. Check for the errors we found in making Wren (white/light
blue pixels on the borders, third arm etc) ... you'll have to use your best judgement". 01:16: Tobin is melee and dashes in.
01:38: effects for Tobin and Pip too. Budget about 1,000 credits; the pack spent 646.

Codex's role: CLAUDE.md says only Codex makes art, but Cal's 00:40 rule (`autopilot/rulings/2026-10-10-wren-pipeline-default.md`,
DECISIONS Art) allows Scenario hero poses and effect sprites from the approved concept, so it does not block this ruling.

## Ruling: wire, held for the split build; re-brief 3 sheets first

The pack is on-model, complete and clean of Cal's Wren faults. **Wire** Tobin's 21 fight moves, plus the rubble and crack sprites, through
`route-s-tobin-wire` (below), behind the shared Classic art switch. It waits on two things: (1) cleave v2 and the thrown-shield
views v2 pass the judge's recheck (woodcut v5 too, for the gather card); (2) the split build, `asset-build` and `art-loader`. On the
one-file page his fight set alone reaches 12.7-12.8 MB, past #328's 12 MB line for a second hero. The 4 gather loops wire as one set through
`route-s-tobin-gather` after woodcut v5 passes; until then gathering shows the camp pose.

The whole-pack rule allows this split, as it did for Wren. Nothing from either set ships half-done. Every other fault is a cut fault, which a
re-cut from raw fixes, or a conversion fault (skip a frame, lift, one scale per move). None needs a redraw.

## Why

- **Look.** He matches the concept on every sheet: cape and scarf, leaf brooch, tabard leaf, olive coat, mail forearms, lantern,
  knee cops and leaf shield (red team 3; audits A-C). At 1280x720 he sits beside route S Wren as one cast
  (`judge/crops/stage-1280x720-DPR1.png`). The seeded palette keeps his olive coat (`crops/idle-190-seed-x3.png` against `-plain-`).
- **Cal's checks pass.** No frame in 200 has a third arm or hand (all three auditors and the red team). The sword is always
  in his right hand and the shield on his left arm or back. The border halo is gone at game size. What remains are white pockets
  inside the art (hair tufts, gaps) and two punched mouths. These are cut faults (`judge/crops/mouth-holes-x3.png`).
- **Bytes say wait.** His seeded files are under the 2.0 MB hero ceiling (all 25: 1,719.0 KB), but his fight set takes the page to
  **12.71-12.80 MB** (question 4). Only 857-918 KB fit under 12 MB, and the whole-pack rule forbids a core-only Tobin.
  `docs/design/new-style/plan.md` 5.1 and section 6 already make every new wire card wait on `asset-build` and `art-loader`.
- **Last Stand is right as drawn.** I depart from the red team here. Since 3da451d3 (6 Oct) the live Last Stand hits for 180% power, then holds
  him at 1 HP for 2 foe turns (`src/js/24c-data-abilities.js:67`, `59k-turn.js:749, 928`). The pack draws a charge, a big slash, a planted sword
  and a stand. That matches the live ability, so `dash: true` is right. The 1 Oct buff brief (`ability-art-brief.md:41` a shield raise, `:93` no retaliation pictured)
  and `hero-abilities.md:237` predate the change; the docs drift is noted under risks.

## Veto phrases for Cal

- "Wire Tobin now": embed his fight set in the one-file page now (about 12.8 MB, past the 12 MB line). Pip then waits for the split.
- "Pull the new Tobin": undoes the wire.
- "Wait for all three heroes": holds Tobin until Pip's pack is also ruled wire.
- "Keep the first cleave": wire cleave v1 as drawn, with no reroll.
- "Last Stand should be a shield raise": reroll Last Stand as the brief's held shield-raise, with `dash: false`.

## The nine questions

**1. Look at stage size; on-model.** Yes, it suits the game, and it is on-model against the concept.
- 1280x720 (ACTOR_K 1.5): 285 CSS px; face, brooch and tabard leaf read (`judge/crops/stage-1280x720-DPR1.png`). 740x360: crisp at DPR 2
  (`stage-740x360-DPR2.png`); at DPR 1 downscaled 0.75 and softer, face still reads (`stage-740x360-DPR1.png`), Wren's same case.
- Today's sprite (white cap, plain tabard) is a different design. The concept is the reference; his look changes on purpose.
- Weak points: the sword's length wobbles 15-25% between frames, and he has two ready stances (question 5). The clip reads both.

**2. Mixed style.** Ship Tobin without waiting for Pip.
- Usually one hero stands on the stage (`docs/GAME.md:36-41`). The plan says allies stand on screen from zone 5
  (`new-style/plan.md:349`); the judge could not confirm it in `62-stage.js`. Gate 11 shots catch any stage mix.
- In the picker, two route S heroes and one pixel hero clash less than one and two (red team 5). The picker uses victory-7 at 0.5,
  or the concept portrait if the judge's 1:1 crop shows a blurred face (`redteam/picker-mock-x4.png`). Veto: "Wait for all three heroes".

**3. Size and fit.**
- Same pack scale as Wren: 0.223 against her 0.2217. Both are 190 art px tall. His hair-top sits about 10 art px (5%) under her
  hood-top, and his stance is wider. That suits a sturdier squire, so there is no per-hero scale.
- Per-sheet drift (hair-top, `redteam/head.json`): attack is drawn 7% small and forage 7-11% tall; one scale per move fixes both
  within Wren's 0.88-1.12 band.
- **Hunt is drawn at about 80%:** knee cops and head are smaller, not just crouched (`judge/crops/hunt-vs-idle.png`). One per-move
  scale of about 1.25 fixes it. That departs from Wren's gate 2 band for hunt by name: it is still a downscale (0.279 of a source about
  4.5x the target), so no pixel is redrawn or blown up. The build sets it so the knee-cop diameter matches idle-1 within 5%.
- **Lunge 4-6** (README open issue judged): the shrink is real but about 85-90%, not 70% (B: head and blade; knee cops unchanged;
  `audit/lunge-a.png`). One named frame scale of at most 1.10 with the feet locked, or leave them if the clip reads a lean. No reroll.

**4. Bytes and the page.** KB = KiB. One palette over the pack, 1-bit alpha, lossless WebP, per-move atlases, 190 px.

| Set | Plain 63 colours (`out/`) | Seeded 63 (`out-seed/`) |
|---|---|---|
| 21 fight moves | 1,504.3 KB | **1,475.3 KB** |
| 4 gather loops | 244.9 KB | 243.7 KB |
| All 25 | 1,749.2 KB | 1,719.0 KB |
| Core 9 (idle, attack, dash, dashback, parry, dodge, hit, defeat, victory) | 647.0 KB | 636.3 KB |

- **Page:** today 8,359,586 bytes; with Wren's fight, gather and fx 10.83-10.89 MB. Plus Tobin's core 9: 11.64-11.71 MB; plus his
  fight set: 12.71-12.80 MB; plus all 25 and fx: 13.05-13.15 MB. With the rubble and crack the fight set is 12.74-12.84 MB. No whole set fits the 12 MB line.
- **First:** `asset-build`, then `art-loader` (B2). B1 does not hold him either: its first load is 8.73 MB with both heroes,
  against the 8.0 MB fail line (`redteam/bytes.json`).
- **What `art-loader` must allow (input to its judge):** packs load per hero. The boot set holds only the in-play hero's core
  moves (Tobin's core 9, 0.64 MB; Wren's core 7, 0.55 MB); his other moves load after boot; another hero's pack loads when he joins or
  is switched to. Never a stand-in while a pack loads.
- **Ceilings:** fight atlases at most 1,550 KB; gather at most 260 KB; rubble and crack at most 20 KB; thrown-shield views at most 15 KB.
  The whole pack stays at most 2.0 MB. Do not go below 63 colours.
- **Palette method (ruled):** seeded. Reserve the concept sheet's 14 swatches, then median-cut the other 49 over his whole pack.
  The plain cut turns his olive coat grey-brown (the coordinator's visual compare, `MEASURE.md`). The seeded cut is also 2% smaller.
  One palette per hero. Wren's card may adopt seeding if her shots show a lost hue; this ruling does not require it.

**5. Motion.** Worse than Wren's, and melee doubles the joins (red team 2). Conversion and code can fix it; the clip decides.
- **Idle boil:** 15-26% a step, and idle 5 and 7 drop the sword: held idle-1 with code breathing only (Wren gate 3's ping-pong
  option is closed for Tobin).
- **Dash chain:** idle, dash, move, dashback, idle; each join changes 13-30%. A game-drawn smear on dash and dashback is allowed
  (00:40 rule); dashback's travel is code, since its frames hop in place.
- **Two stances:** most moves end with the sword raised; dashback, lunge, roar and others end with it low. If the clip shows the
  flip, re-brief 4 (a shared ready-stance sheet) applies.
- **Airborne frames** (README open issue confirmed): hammerfall 3-4, dashback 3, 4, 6 and dodge 3-4 sit on the baseline. Re-cut from
  raw with a ground line (Wren gate 2) so any drawn height survives; otherwise code lifts them on a set arc (hammerfall apex about 24 px).

**6. Completeness.**
- Has: idle, attack, dash, dashback, all 12 actives (Momentum and Bulwark are passive; checked in `24c-data-abilities.js`), parry,
  dodge, hit, defeat, victory, and 4 gather loops. Camp pose: victory-7, sword on his shoulder (`audit/victory-a.png`), a drawn frame.
- Gathering is complete only after woodcut v5 (README open issue "woodcut v4 drops his back shield": confirmed, reroll). Mining,
  forage and hunt pass with skips and a scale. Open issues "defeat 7-8 wide" and "frames drift sideways" are not faults: anchor
  the lying frames at the standing hip centre and lock the feet (gate 3).

**7. Cal's defects, counted** (table below): **154**. (a) 72 cut faults, fixed by re-cutting from raw; (b) 63 by conversion or code,
40 fixed and 23 accepted minors the clip watches; (c) 19 need a reroll, on 3 sheets. Third arms 0; wrong hand 0; border halo at game
size 0; fused fingers: idle-7 (unused) and the riposte 4-5 tube fist (accepted).

**8. Effect sprites.**
- **Rubble (rock0-4) and crack: wire** with the fight set: earth and stone in flat clusters, dark outline, 0 pale edge pixels.
  Threshold their soft alpha to 1 bit and scale them to the pack scale.
- **Thrown-shield views (shield0-3): re-brief.** shield0-2 add a steel boss and a peaked top that the concept and all 200 frames
  lack (`redteam/shield-held-vs-thrown.png`), failing "the same shield returns" (`ability-art-brief.md:65`). The back view is fine but
  is rerolled with the set so all four match.

**9. Dash flags** (`strips/meta.json`), ruled:
- **true:** attack, bash, heavystrike, cleave, sundering, hammerfall, lunge, **riposte** (his own turn ability once he has parried,
  `59k-turn.js:604, 741`; not the parry counter itself, so he dashes in) and **laststand** (hits for 180%, see Why).
- **false:** ironwill, brace, roar, shieldthrow (thrown from his spot), parry, dodge, hit, idle, defeat, victory and the gather loops.
- **Fix:** `dash` itself is flagged true. The build stores no flag on dash and dashback, and `check.mjs` asserts the list above from the data.

## Defect table (move-frame; class a = re-cut from raw, b = conversion or code, b-acc = accepted and watched in the clip, c = reroll)

| # | Defect | Frames | n | Class |
|---|---|---|---|---|
| 1 | White pockets in hair tufts and gaps (holes.py clears only below the head line) | idle 2-7; attack 1-8; dash 1,4,6,7,8; dashback 2; bash 1,2,7,8; heavystrike 1,7,8; cleave 1,3,4,5,7,8; riposte 2,5,8; hammerfall 3,6; parry 2,4,8; hit 6; victory 2,3,6; forage 6,7,8; hunt 2,4,5; laststand 7; shieldthrow 5 (fingers) | 53 | a |
| 2 | White gap at face or guard | attack 7; bash 5, 6 | 3 | a |
| 3 | Open mouth punched see-through | roar 6; laststand 2 (`judge/crops/mouth-holes-x3.png`) | 2 | a |
| 4 | Pale 1-3 px specks on hair or cape edges (10); notches or slivers cut into steel or rim (4) | ironwill 2, 7; sundering 1; roar 2, 7; laststand 5, 8; dodge 3; hit 5, 7; notches defeat 2, hammerfall 3, ironwill 2, 6 | 14 | a |
| 5 | Sword drops out of guard; idle-7 grip beside the fist, fused fingers | idle 5, 7 (held idle-1; both unused) | 2 | b |
| 6 | Idle boil, 15-26% a step | idle loop | 1 | b |
| 7 | Hilt with no blade | attack 7 (skip; hold 6) | 1 | b |
| 8 | Floating shield; defeat-5 stands up mid-fall | defeat 3, 5 (play 1,2,4,6,7,8) | 2 | b |
| 9 | Sword 60%; grin, not a shout | roar 4; roar 3, 7 (play 1,2,5,6,8) | 3 | b |
| 10 | Sword dagger-short | shieldthrow 3 (play 1,2,4-8; hold 5 on release) | 1 | b |
| 11 | Pick head missing | mining 7 (loop 1-6, 8) | 1 | b |
| 12 | Sickle missing | forage 6 (loop skips 6) | 1 | b |
| 13 | Scarf turns magenta | hunt 8 (loop 1-7) | 1 | b |
| 14 | Drawn at about 80% | hunt 1-8 (one scale, about 1.25) | 8 | b |
| 15 | Upper body about 10% small | lunge 4-6 (frame scale 1.10, or accept) | 3 | b |
| 16 | Airborne frames on the baseline | hammerfall 3-4; dashback 3, 4, 6; dodge 3-4 | 7 | b |
| 17 | Lying frames wide | defeat 7-8 (hip anchor) | 2 | b |
| 18 | Sheet scale drift | attack (7% small); forage 1, 8 (7-11% tall) | 3 | b |
| 19 | Sword raised vs low at joins | dash chain | 1 | b |
| 20 | `dash` flagged as a dash move (meta); olive coat lost in the plain palette (pack); soft alpha on fx (rock0-4, crack0) | data, palette, fx | 3 | b |
| 21 | Shield about 15% bigger front-on: the judge measured it between B's 10% and the red team's 15-28% (`judge/crops/brace-vs-idle.png`). It reads as brought forward | brace 3-8 | 1 | b-acc |
| 22 | Held shield about 78% while edge-on (flight sprite sized to frame 5); no release beat; bare hand; sword 68% | shieldthrow 2-5; 4-5; 5; 4 | 4 | b-acc |
| 23 | Sword length wobble 15-25% | pack-wide (dash 1/8, bash 6-7, riposte 4-5, sundering 3, hammerfall 2, laststand 2/6/7) | 1 | b-acc |
| 24 | Drawing slips: tube fist (2); tunic smear; muddled knee shapes; overlong grip; hand on the shield face; odd chop order | riposte 4, 5; dodge 6; brace 4; roar 5; ironwill 4; heavystrike 4-5 | 7 | b-acc |
| 25 | Colour and size slips: crossguard flickers rose-copper (4); pink scarf blob, quantised away (2); figure 6% small (2); back shield on the wrong side, face toward the viewer (2) | hit 3, 5, 6, 7; victory 2, 4; victory 4, 5; mining 2, 3 | 10 | b-acc |
| 26 | Sword resizes to 54-70%; back view with no hand on the sword; no single level arc | cleave 2, 4, 5, 6 | 4 | c |
| 27 | No shield on his back; a level push with the edge down at impact | woodcut 1-8; 5-6 | 10 | c |
| 28 | Steel boss (3); peaked top (1); orange face (1) | fx shield0-2; shield0-3; shield0-3 | 5 | c |

Totals: a 72, b 40, b-acc 23, c 19 = **154**. Not counted: Last Stand (it matches the live ability), lanterns hidden by the hilt
(idle-5, hunt-1) and hair specks visible only at full size.

## The red team's case and the answer

Red team verdict: re-brief, about 6 sheets, then wire after the hosting split. Its three strongest points and how the ruling answers them:

1. **Bytes: no whole set fits under 12 MB.** Agreed: the wire waits on `asset-build` and `art-loader`, with only the in-play hero's
   core moves in the boot set. Tobin's 0.09 MB over Wren's core is an input to the loader's judge.
2. **Props and meaning.** Agreed on cleave, woodcut and the shield sprites (rerolled). Not adopted: Last Stand (the live ability
   changed on 6 Oct and the art matches it) and a shieldthrow-3 reroll (skipped in code). Brace: measured at about 15%, accepted as
   perspective, brace v3 held as a fallback.
3. **Motion is worse than Wren's.** Agreed: held idle-1, lifts, skips, a smear and a join gate in the clip; a shared ready-stance
   sheet waits as a re-brief. Its "8 of 23 moves cannot meet ±3 with one scale": at ±4, four still fail (Iron Will, Shield Throw,
   Last Stand, and Brace, which ends crouched); they open or close on idle-1 (gate 3).

Kept: the page line, held idle, air lifts, skips (defeat-5, hunt-8), the metadata check, a Tobin clip, the picker crop. Not adopted:
a 15% cap at every join (the clip judges it, as for Wren) and a hunt reroll (a scale is conversion).

## Build card spec: route-s-tobin-wire

The card asked to add Tobin to the route S wire card. He gets his own card instead: `route-s-wren-wire` keeps Tobin out of
scope (`autopilot/cards/route-s-wren-wire.md:14`), and Tobin must also wait for the split build, which Wren does not.

Lane: claude. Model: opus-high. Gate: judge (art). Prio: P1. Base: integration branch.
Depends on: route-s-wren-wire (its converter and stage drawing); asset-build; art-loader (with per-hero loading, question 4);
ability-effects-live; actor-scale (soft); and the judge passing cleave v2 and shield views v2.

**Outcome:** his 21 fight moves, rubble, crack and shield views are converted from `tobin-moves/raw` as drawn and shown when Classic art is off.

**Gates** (Wren's numbers apply unless named):
1. **Bytes:** seeded palette; fight atlases at most 1,550 KB; rubble and crack at most 20 KB; shield views at most 15 KB; boot and
   area lines as `art-loader` re-sets them; never embedded in a one-file build over 12 MB. The PR prints each number.
2. **Re-cut from raw:** `holes.py` extended to the head band, with a skin-ring guard so mouths and eye whites stay. No enclosed
   see-through hole or white pocket of 2 px or more at 190 px; table rows 1-4 cleared, shown on a magenta-backed crop sheet.
3. **Registration:** Wren gate 2 (ground line per sheet, one scale per move in 0.88-1.12), except hunt (knee cops, about 1.25) and
   lunge 4-6 (at most 1.10). Opening and closing standing frames: hair-top 180 ± 4 art px, feet centre ± 3 of idle-1; `check.mjs` asserts it.
   Iron Will (185/176), Shield Throw (177/169) and Last Stand (172/180) cannot meet that with one scale (`redteam/head.json`),
   and Brace ends crouched: their frame lists open or close on idle-1 instead (reuse, no redraw); the clip judges the join.
4. **Idle:** held idle-1 plus code breathing. Reduced motion: held, no breathing.
5. **Frame lists** in data, never redrawn: attack skips 7; defeat plays 1,2,4,6,7,8; roar 1,2,5,6,8; shieldthrow skips 3 and holds 5
   on release. Each hit lands on its frame within 17 ms; timings as Wren gate 5.
6. **Dash chain:** each `dash: true` move plays dash, the move, then dashback; code supplies the travel with a smear (reduced motion:
   instant swap). Flags as question 9, asserted from data.
7. **Air:** re-cut height first, otherwise a code lift on a set arc for the row-16 frames. No foot slides on the baseline.
   Hammerfall holds frames 3-4 at the apex while Grit shows (`ability-art-brief.md:64`); code holds them, no new pose.
8. **Shield continuity:** the flight sprite is the held shield's size at shieldthrow-5 ± 10%. It leaves on frame 5, and his hand is empty on
   6-7, until the catch at 8. One timing ring closes on the catch.
9. **Scale, camp, picker, Classic art:** Wren gates 6-8. Camp and picker use victory-7 at 0.5, or the concept portrait if the
   judge's 1:1 crop shows a blur. One switch covers both heroes.
10. **Effects:** Wren gate 10. Rubble spawns at hammerfall's impact frame, and the crack lies at his sword tip on the ground line.
11. **Shots:** Wren gate 11, for idle, attack release, Shield Bash, Hammerfall impact, Shield Throw (out, catch), parry, hit, defeat,
    picker and camp.
12. **Clips:** 1280x720 DPR 1 and 740x360 DPR 2, 30 fps, about 15 s, seeded zone 5 fight: idle, Attack x3, bitten, parry, Riposte,
    Shield Throw out and back, Hammerfall, Last Stand, idle. Pass only if size never changes, no foot slides, the sword never flips at a
    join, the shield never changes shape, the idle does not boil, and each hit lands on its frame.
13. **Checks:** Wren gate 13 (build, check, walk and cold leg on the SHA, a preview link to Cal). A Monday build only if gate 12 passed
    before the cut.

**Never:** redraw or repaint pixels; quantise below 63 colours; embed the gather loops; touch Wren's or Pip's art; change the stage zoom
or the online layer; spend credits.

## Build card spec: route-s-tobin-gather

Depends on route-s-tobin-wire and woodcut v5 passing the judge. **TG1** at most 260 KB, seeded palette. **TG2** registration as the
wire card (hunt by knee cops). **TG3** mining skips 7, forage skips 6, hunt loops 1-7. **TG4** contact as Wren G3. **TG5** replaces the
camp pose while gathering and Codex's interim Tobin hunt poses (`art/heroes/tobin/hunt` stays on disk); Classic art restores both.
**TG6** shots and clip as Wren G5.

## Re-brief list (Scenario, GPT Image 2.5, 19 credits a sheet; rolled by the pack thread within Cal's ~1,000 budget, not by this judge)

1. **Cleave v2** (1 sheet). "Cleave: one wide, level sweep at waist height, from behind his right hip across to his left. Tobin faces right
   in every cell, chest toward the viewer; never show his back. The sword is the same length and width in every cell as in the
   ready stance, the whole blade visible; his right hand always grips the hilt. Cells: ready stance; sword drawn back level behind his
   hip; sweeping forward level; full extension, blade level pointing right; follow-through to his left, blade still level;
   recovering; sword back up to guard; ready stance as in idle. The shield stays strapped on his left forearm, clear of the blade."
2. **Woodcut v5** (1 sheet). Use the v4 prompt, plus: "His kite shield is slung on his back, strapped, at his upper left, in every cell,
   as in mining; his sword is sheathed at his hip. At impact (cells 5-6) the haft points up and right at about 45 degrees from his
   hands with the head at its top; the bit's curved edge points right, level, into the trunk at chest height, and the broad face of
   the head shows. Never a level push with straight arms."
3. **Thrown-shield views v2** (1 sheet; references: the concept and the cut frame brace-3). "Tobin's kite shield exactly as he holds it: red
   planks with a cream leaf branch, a gold riveted rim, a flat top with clipped corners. No boss, no centre stud, no metal dome. Four spin
   views: front, three-quarter, edge-on, back with two leather straps and a grip. The same red as the held shield."
4. **Only if gate 12 fails on the joins:** one shared ready-stance sheet (sword raised as in idle-1) for every move and dashback.
5. **Only if gate 12 shows the brace jump:** brace v3, the shield at idle-1's size, measured on a grid.

Credits: 3 sheets = 57; at the pack's 1.32 sheets a move about 76; worst case, items 4-5 plus one more failure is 6 sheets (114), or 8 sheets (152) at the 1.32 rate. The pack
stays under 800 of the ~1,000 budget.

## Risks

- The split slips and Tobin waits: `asset-build` or `art-loader` still unmerged when Pip's ruling lands.
- Rerolls fail again (cleave v2 or the shield): the recheck shows it; fallback "Keep the first cleave" or a v3.
- Joins pop at speed (melee has twice Wren's joins), or skipped frames make defeat, roar or Shield Throw jerky: gate 12 shows it;
  the fix is re-brief 4 or a reroll of that sheet (19 credits each).
- Docs drift: `ability-art-brief.md:41,93` and `hero-abilities.md:237` still describe Last Stand as a buff, so a reviewer may
  fail the art against them. A docs card should update both to the 6 Oct ability.
- The seeded palette bands the cape (14 reserved swatches leave 49): gate 11 shots show it. Pip's pack competes for the same boot
  and area room; the art-loader's judge sets the lines with all three in view.

## Checked / not checked

Checked by the judge: the card, README, `meta.json`, `moves.json` prompts, the three audits, the red team and its JSONs, MEASURE and
both byte JSONs; the concept; audit sheets for idle, attack, cleave, defeat, shieldthrow, roar, woodcut, hunt, mining, forage,
laststand, lunge, dashback, victory and brace; `tobin-fx.png`; its own crops (`judge/crops/`, scripts in `judge/tools/`: brace against
idle, mouths on magenta, stage sizes at 1280 and 740 at DPR 1 and 2, hunt against idle); the live Last Stand, Riposte and Shield Throw
code; `hosting.md` 5-6; `new-style/plan.md` 5.1 and 6; `art-loader.md`; Wren's ruling and DECISIONS line.

Not checked: the gallery and the fx4.js stage test (no network); real clips; the red team's 1,184 pale-edge pixels frame by frame
(the auditors' game-size scans were used); the ally-on-stage claim; bytes after a real build.

## Plain words for Cal

Tobin's new art is good. He looks like his concept on every frame. No third arms. The light border pixels are gone. A few white
specks inside his hair and two open mouths were cut badly, and a fresh cut fixes them. Three pieces need a redo (about 60 credits):
the Cleave swing, where his sword changes size; the woodcutting loop, which loses the shield off his back; and the flying shield,
which grew a metal knob his real shield doesn't have. Other bad frames are simply skipped. His fight moves wait only on the
Cleave and shield redos; his gathering waits on the woodcutting redo. Last Stand is drawn as a slash, then a stand. That matches
how it plays since 6 Oct; the old brief said a shield raise. He is too big to fit in the one-page game
beside Wren, so he goes in when the game moves to its own hosting. To overrule, say "Wire Tobin now", "Pull the new Tobin", "Wait
for all three heroes", "Keep the first cleave" or "Last Stand should be a shield raise".
