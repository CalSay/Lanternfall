# Ruling: integrate-route-s-pip (Opus art judge, 2026-10-10, base 4b4418cd)

Question: should Pip's route S pack (23 moves x 8 Scenario key frames from her approved concept) and her shaped-effect sprites go
into the 2D game? The judge rules **wire**, **re-brief** or **shelve**, after a red team, on the questions of Wren's ruling
([ruling.md](ruling.md), #328) and Tobin's parallel ruling. Card: `autopilot/cards/integrate-route-s-pip.md`. Scratch paths below
are under `/mnt/project-files/experiments/`: the pack `2d-poses-scenario/pip-moves/`, the effects `2d-poses-scenario/hero-fx-test/`,
the evidence, audits A-C, red team and judge files `route-s-judge-pip/` (`out/`, `out-seed/`, `audit/`, `redteam/`, `judge/`). The
audits and the red team are also copied into the repo: [pip-records/](pip-records/) (`audit-a.md`, `audit-b.md`, `audit-c.md`,
`redteam.md`). The
gallery (https://claude.ai/artifact/R3245P8ApnrWnfn4JRGNsr) was not opened. Reference: the concept
`/mnt/project-files/concept-art/heroes-official-34/pip.png`, not today's in-game Pip (a different design).

Cal's words: 01:15 "Check for the errors we found in making Wren (white/light blue pixels on the borders, third arm etc) ...
you'll have to use your best judgement"; later "I can already see some third arm images popping up in pip and tobin sheets".
Pip is ranged: no walk, no dash. Budget about 1,000 credits; spent 828. Cal's 00:40 rule (DECISIONS Art) allows Scenario poses
and effect sprites from the approved concept, so "art only by Codex" does not block this ruling.

## Ruling: wire, held for the split build; re-brief 4 sheets first (2 more for gathering)

The pack is on-model and its border halo is gone, but Cal's third arm is still there: **6 frames**, not the README's 0 (Fireball
frame 4 included). **Wire** Pip's 19 fight moves and her effect sprites through `route-s-pip-wire` (below; Pip's route S wire card,
a sibling of Wren's and Tobin's), behind the shared Classic art switch. It waits on (1) victory v2, Arcane Ward v2, Lanternburst v2
and Hex sigil v2 passing the judge's recheck, and (2) the split build, `asset-build` and `art-loader`: with Wren's sets her fight
set takes the one-file page to 12.4-12.7 MB, past #328's 12 MB second-hero line, and with Tobin too past 14 MB. The 4 gather loops
wire as one set through `route-s-pip-gather` after woodcut v6 and hunt v4 pass; until then gathering shows the camp pose.

Four third hands (fire 4, spark 3, frost shard 6, Searing Eye 7) sit on frames each move reads well without: skipped. Two (victory
5, 7) sit in the loop that also gives the camp pose and ends on a short staff: rerolled. Every other fault is a cut fault (a re-cut
from raw) or a conversion fault. None needs a redraw.

## Why

- **Look.** She matches the concept on every sheet (hood, tassel, curls, rust coat, book, lantern, brooch, forked staff; audits
  A-C, `redteam/lineup-x2.png`). The orb is unlit and no fire is drawn, by design: the game draws light (00:40 rule).
- **Cal's checks.** Halo: **0** pale edge pixels in all 23 seeded atlases at 190 px (`judge/tools/halo190.py`). Fused fingers: 0.
  Third hands: 6, each confirmed at game size (`judge/crops/thirdhand-a.png`, `-b.png`, `fire4-zoom-top.png`). Staff or tool held
  wrong: 19 frames (table).
- **Bytes say wait.** Her whole pack fits the 2.0 MB hero ceiling (1,660 KB registered), but with Wren's sets her fight set makes the
  page 12.4-12.7 MB, and with Tobin too 14.3-14.6 MB (question 4). The whole-pack rule forbids a core-only Pip.
- **Meaning.** Woodcut v5 4-6 repeat Wren's failed v3 (a level jab, the head a T-bar at 190 px, `judge/crops/woodcut-all.png`).
  Lanternburst never lifts the lantern, against "the lantern does not leave her hand" (`ability-art-brief.md:69`). The Hex sigil
  says Blind, Mark and Searing Eye, not Curse (`62b-fx.js:19-20`).

## Veto phrases for Cal

- "Wire Pip now": embed her fight set in the one-file page now (about 12.6 MB with Wren's sets). Tobin then waits for the split.
- "Pull the new Pip": undoes the wire.
- "Wait for all three heroes": holds Pip until Tobin's pack is also wired.
- "Pip as tall as Wren": register her at Wren's 190 px line, not 171.
- "Skip the Pip rerolls": no new sheets. Victory plays 1-4, 6. Arcane Ward plays idle-1, 3, 4, 5, 8. Lanternburst, woodcut, hunt
  and the Hex sigil wait for a later batch.
- "No Hex sigil": the live curse effect alone marks Hex.

## The nine questions

**1. Look at stage size; on-model.** Yes, it suits the game and is on-model against the concept.
- At ACTOR_K 1.5 her 171 art px draw about 256 CSS px at 1280x720 and 128 at 740x360: crisp at DPR 2, a 0.75 downscale at DPR 1
  (Wren's soft case). Computed, not rendered.
- Today's chibi Pip is a different design; her look changes on purpose.
- Weak points: the lantern glass drifts amber, red and brown, and the plain cut greys the olive hood (audit A). The seeded palette fixes
  the hood; gate 11 shots catch the glass.

**2. Mixed style.** Ship Pip without waiting, behind Classic art. One hero stands on the stage at a time. Her outline share is 0.84
(Wren 0.79, Tobin 0.70), closest to route S Wren (`redteam/mixed.json`). In the picker, today's chibi Pip clashes more than she will.
Veto: "Wait for all three heroes".

**3. Size and fit: should Pip stand shorter?** Yes. Cal's heights rule (2026-09-29, `art-pipeline.md` section 7: "Pip, who is young,
is about 86 px; adults about 96 px") stands; #328 scrapped the 96 px spec and whole-step zoom, not each hero's height.
- **Her line: hat-top 171 art px, 0.9 of Wren's 190** (Tobin's hair-top 180). Her eyes sit about 15 art px under theirs; she reads
  young, not small (`judge/crops/lineup-171-x3.png`).
- No per-hero scale is needed: registered to 171, the median fight move lands at 0.228 art px per source px, against Wren's 0.2217
  and Tobin's 0.223 (`judge/out-scaled/`). GPT drew her about 10% smaller; the line is a check, not a stretch.
- **Drift:** idle is drawn 5-8% big; attack 12%, frost shard 15% and wildfire 12% small (the orb, a sphere, measures it:
  `redteam/orb.json`). One scale per move by the opening hat-top fixes it; fight scales run 0.90-1.09 of the pack scale.
- Hunt is drawn at about 76% and is rerolled anyway (question 6). Opening and closing hat-tops differ 7-14 px in attack, fire, kindle
  and hex: a named frame scale of at most 1.06 with the feet locked meets ±4 (the hat tip flops ±2 px).

**4. Bytes and the page.** KB = KiB. One palette, 1-bit alpha, lossless WebP, per-move atlases.

| Set | Plain 63 | Seeded 63 | Seeded, registered to 171 (judge) |
|---|---|---|---|
| 19 fight moves | 1,156.5 KB | 1,143.4 KB | **1,297.9 KB** |
| 4 gather loops | - | 225.2 KB | 362.3 KB (orb-scaled, upper bound) |
| All 23 | 1,385.1 KB | 1,368.6 KB | 1,660.2 KB |
| Core 7 (idle, attack, parry, dodge, hit, defeat, victory) | - | 408.2 KB | 468.9 KB |
| 20 effect sprites | - | 36.2 KB (half size) | - |

- **Page:** today 8,404,328 bytes; with Wren's ruled sets 10.88-10.93 MB; plus Pip's core 7 11.40-11.46; plus her fight set and fx
  12.38-12.46 as drawn, about 12.58-12.67 registered (embed factor 1.24-1.27 from `redteam/bytes.json`); with Tobin too about
  14.3-14.6 MB, past the 14 MB fail line.
- **First:** `asset-build`, then `art-loader` (B2). B1 fails too (8.35 MB first load with Wren and Pip, against 8.0). Under B2 her core 7
  makes the boot set about 4.2 MB against the provisional 4.0 line; as in Tobin's ruling, only the in-play hero's core moves boot.
- **Ceilings:** fight atlases at most 1,350 KB; gather 380 KB; effect sprites 40 KB; the whole pack 2.0 MB; never below 63 colours.
- **Palette (as Tobin's):** seeded. Reserve the concept's 12 swatches, median-cut the other 51 over her pack. One palette per hero.

**5. Motion.** About like Tobin's, with half his joins (no dash). The clip decides.
- **Idle** boils 14-20% a step; idle 3 lifts a hand to the brim and idle 6 taps the staff. Held idle-1 with code breathing.
- **Joins** change 21-35% (Arcane Ward's 35% is its staff swap, rerolled). Big in-move steps (defeat 74%, nova 62%) are drawn
  pose changes in one-shot moves (`redteam/motion.json`).
- **Air:** dodge 3-4 (about 30 art px up) and victory 4 sit on the baseline; the raw sheets keep the height (`redteam/air.json`).
  Re-cut with a ground line. Dodge hops in place: code supplies the backward slide with a smear.
- Kindle 5-8 are near-duplicates, not a fault: hold 5 through 7.

**6. Completeness.** Has idle, Attack, all 12 actives (Afterglow and Cinder Heart are passive, `24c-data-abilities.js:69-82`), parry,
dodge, hit, defeat, victory and 4 gather loops. Camp pose: victory v2's resting frame at 0.5, or victory 6 (hand on hip) if v2 fails.
README open issues, judged: **Fireball third arm** fixed on frame 5, still on frame 4 (skipped). **Hand swaps** in hit (skip 5-6),
victory (reroll), defeat 2-5 (accepted: a fumble in a fall). **Key frames, not in-betweens:** as Wren; gate 12 decides. **Woodcut 5-6
thin:** confirmed, 4-6 fail; v6. Gathering is complete after woodcut v6 and hunt v4; mining passes, forage skips 4.

**7. Cal's defects, counted** (table below): **100**. (a) 24 cut faults, fixed by a re-cut from raw; (b) 52 by conversion or code,
24 fixed and 28 accepted minors the clip watches; (c) 24 need a reroll, on 6 sheets. **Third hands 6** (4 skipped, 2 rerolled);
staff or tool wrong 19 frames; border halo at game size 0; fused fingers 0.

**8. Effect sprites.**
- **Wire with the fight set:** fireball 0-3, frost 0-1, spark 0-1, kindle 0-3, flames 0-3, cinder 0-2: flat clusters in her palette,
  0 pale edge pixels after a 1-bit cut at alpha 128 (audit C, `redteam/fx.json`). Frost fits best; Spark reads as a fire dart, which
  her Spark is. Clean the trapped white in fireball 0-3 and flames 2-3. The fireball draws at about 26% of her height (fx4), not 37%.
- **No double head:** these sprites replace the live bolt head for their own casts; the live trail, ring and sparks stay. The flames
  loop draws while Burn lasts in place of the steady Burn light; cinders are the Cinder-gain motes and Lanternburst's charge, as in fx4.
- **Hex sigil: re-brief.** An opaque disc (57.5% near-black, centre fully opaque) that hides the foe, with Blind violet runes, a Mark gold
  rim and Searing Eye's eye. fx4's colours are not live (curse 150,60,200 against `FX_COL.curse` 200,40,170); the build uses `FX_COL`.

**9. Release frames against the live hits; contradictions.**
- **Release frames** (README table, matching fx4's hit table on all 13 casts): attack 5, fire 5, spark 4, frost shard 4, kindle 5,
  ignite 5, hex 5, wildfire 4, searing 4, nova 4, flare 4, lanternburst 5 (v2: 6), ward 6. The skips keep every one. Fireball holds frame 3
  (hand at her chest) through its timed ring, which fits "hold a growing but bounded fireball" (`ability-art-brief.md:67`).
- **Emitters:** the README's Fireball point (702, 298) lies outside fire-v4's 664 px frame (`redteam/emit.json`), and live #333 fires every
  Pip bolt from one fixed point (`62-stage.js:682`). The wire card measures per-move anchors on the shipped frames.
- **For another card** (`pip-cast-recipes`, below): live **Nova** is `d: 'bolt'` (`62b-fx.js:72`), so a bolt leaves her hand while
  she slams the staff butt down; it should be a ring from the staff butt along the ground. Live **Lantern Flare** (`:78`) is a bolt from the hand while she holds out the
  lantern; it should be a flash or pale cone from the lantern (`ability-art-brief.md:99`). Live **Lanternburst** (`:79`) is a bolt from the
  hand; the brief has a lantern-centred ring (`:101`).

## Defect table (move-frame; class a = re-cut from raw, b = conversion or code, b-acc = accepted and watched in the clip, c = reroll)

| # | Defect | Frames | n | Class |
|---|---|---|---|---|
| 1 | White pocket in the hair crown or edge, visible at 190 (`holes.py` skips the top 22%) | attack 4, 7; spark 8; kindle 3; dodge 3; woodcut 3, 4 | 7 | a |
| 2 | Lantern glass punched see-through, 1-4 px at 190 | attack 8; frostshard 1, 2, 3, 8; arcaneward 1, 7; searing 7; flare 4; dodge 1; defeat 3; forage 2 | 12 | a |
| 3 | Open mouth punched see-through | wildfire 6 (3 px at 190); victory 4 (1 px) | 2 | a |
| 4 | Holes that survive at 1-2 px; pale cuff with punched gaps | flare 3, 8; hunt 2 | 3 | a |
| 5 | **Third hand**, frame skipped | fire 4 (one sleeve, two hands, no front arm); spark 3; frostshard 6; searing 7 | 4 | b |
| 6 | Staff jumps to her front hand | hit 5, 6 (play 1-4, 7, 8) | 2 | b |
| 7 | Staff shaft cut to 35% | nova 3 (play 2, then 4) | 1 | b |
| 8 | Sickle in the wrong hand | forage 4 (loop skips 4) | 1 | b |
| 9 | Sheet drawn big or small | idle 5-8% big; attack 12%, frostshard 15%, wildfire 12% small (one scale per move) | 4 | b |
| 10 | Opening and closing hat-tops 7-14 px apart | attack, fire, kindle, hex (frame scale at most 1.06) | 4 | b |
| 11 | Airborne frames on the baseline | dodge 3, 4; victory 4 | 3 | b |
| 12 | Dodge hops in place | dodge (code slide and smear) | 1 | b |
| 13 | Idle boil 14-20%; hand to brim; staff tap | idle loop (held idle-1) | 1 | b |
| 14 | Stale emitter; live bolt from a fixed hand point | fire; all casts (per-move anchors) | 1 | b |
| 15 | Plain palette greys the olive hood (pack); soft alpha and trapped white (fireball 0-3, flames 2-3) | palette; fx | 2 | b |
| 16 | Staff in her front hand, or a swap with no in-between | attack 6-7; nova 2-7 and parry 6 (two-hand slam and block); defeat 2-5 (a fumble) | 4 | b-acc |
| 17 | Staff 62-80% long (foreshortened) | wildfire 7; parry 5; dodge 3, 4, 7 | 5 | b-acc |
| 18 | Staff rests on her shoulder, unheld | kindle 2-4 | 3 | b-acc |
| 19 | Colour slips: lantern glass red or brown (6); brown leggings (2); olive coat (1); waist-long hair (1); violet sliver (1); mauve hair (1) | wildfire 5-8, flare 7-8; spark 1-2; fire 5; fire 6; wildfire 1; nova 6 | 12 | b-acc |
| 20 | Back staff missing or slipped | mining 2, 3 | 2 | b-acc |
| 21 | Hat point hidden; low swing between overhead and level | attack 3; attack 4 | 2 | b-acc |
| 22 | **Third hand** (2); staff about 65%, orb at her chin (1) | victory 5, 7; victory 8 | 3 | c |
| 23 | Staff ping-pongs between her hands (back, front, both, back, front, back) | arcaneward 1, 2, 6, 7 | 4 | c |
| 24 | Staff shrinks to 25-49% on the release frames (3); lantern never used, against the brief (1) | lanternburst 4-6; the move | 4 | c |
| 25 | Edge-on head reads as a T-bar or sledge (3) or a spear point (1); back staff missing (1) | woodcut 4-6; 3; 3 | 5 | c |
| 26 | Spear shrinks to about 43 px of 150 (3); drawn at about 76% (1) | hunt 4-6; hunt 1-8 | 4 | c |
| 27 | Hex sigil: solid disc; Blind and Mark colours; an eye; Latin-letter runes | fx hex0 | 4 | c |

Totals: a 24, b 24, b-acc 28, c 24 = **100**. Not counted: about 40 hair specks and about 35 brass or band holes that vanish at 190;
258 pale source edge pixels (0 at 190); defects on frames already counted for a skip or reroll (arcaneward 5's ambiguous arm).

## The red team's case and the answer

Red team verdict: re-brief 4 sheets (victory, Arcane Ward, woodcut v6, the marks sheet), then wire with the split. Answers:

1. **Third hands remain; the README says none.** Agreed, and there are 4 more than the red team's 2 (fire 4, spark 3, frost shard 6,
   Searing Eye 7). Victory is rerolled; the four others are skipped, since each move reads without that frame.
2. **Bytes.** Agreed: wait for the split. Registering her to her height line adds about 155 KB, so the fight ceiling is 1,350 KB,
   not 1,200.
3. **Props and meaning.** Agreed on woodcut and Hex. Lanternburst goes from optional to required (its release frames also shrink
   the staff). Hunt is rerolled too: a spear that loses two thirds of its length mid-loop is the fault Tobin's cleave was rerolled for.

Kept: cutting from raw, a held idle, the border-pocket pass, per-move anchors, the Nova and Flare re-recipe, no double head, the clip.
Not adopted: a code check that the staff is in her rear hand in every frame (two-hand slams and blocks bring it across on purpose);
the judge's frame sheet and the clip check it instead.

## Build card spec: route-s-pip-wire

Lane: claude. Model: opus-high. Gate: judge (art). Prio: P1. Base: integration branch.
Depends on: route-s-wren-wire (its converter and stage drawing); asset-build; art-loader (per-hero loading); pip-cast-recipes;
actor-scale (soft); the judge passing victory v2, Arcane Ward v2, Lanternburst v2 and Hex v2.

**Outcome:** her 19 fight moves and 19 effect sprites (plus Hex v2) are converted from `pip-moves/raw` and `hero-fx-test` as drawn, and shown when
Classic art is off.

**Gates** (Wren's numbers apply unless named):
1. **Bytes:** seeded palette; fight atlases at most 1,350 KB; effect sprites at most 40 KB; boot and area lines as `art-loader`
   re-sets them; never embedded in a one-file build over 12 MB. The PR prints each number.
2. **Re-cut from raw:** `holes.py` extended into the head band, with a guard for skin, eye whites, teeth and lantern glass ringed by
   brass. No enclosed see-through hole or white pocket of 2 px or more at 190 px. Table rows 1-4 are cleared, shown on a magenta crop sheet.
3. **Registration and height:** ground line per sheet; one scale per move set by the opening frame's hat-top, within 0.88-1.12 of the
   pack scale. Opening and closing standing frames: hat-top **171 ± 4** art px, feet centre ± 3 of idle-1; at most a 1.06 frame scale on
   named frames. `check.mjs` asserts it.
4. **Idle:** held idle-1 plus code breathing. Reduced motion: held, no breathing.
5. **Frame lists** in data, never redrawn: fire 1-3, 5-8 (holds 3 through the timed ring); spark 1, 2, 4-8; frostshard 1-5, 7, 8;
   searing 1-6, 8; hit 1-4, 7, 8; nova 1, 2, 4-8; kindle holds 5 through 7. Each release (question 9) lands within 17 ms of the
   live shot; timings as Wren gate 5.
6. **Anchors:** a per-move emit point on each release frame, measured on the shipped frames. The live shot leaves it, never the fixed hand
   point. A check confirms each anchor sits on opaque art.
7. **Air and dodge:** re-cut height for dodge 3-4 and victory 4; dodge's backward travel is code with a smear (reduced motion: instant).
8. **Hands:** the PR carries one sheet of every shipped frame at 190 px x3. The judge counts hands and staff on it before the clip. No third
   hand ships.
9. **Scale, camp, picker, Classic art:** Wren gates 6-8. Camp and picker use victory v2's resting frame (or victory 6) at 0.5. One
   switch covers all three heroes.
10. **Effects:** question 8. Sprites are cut at alpha 128 with trapped white cleaned. The fireball draws at about 26% of her height. Sprite
    heads replace live heads (never both). The flames loop replaces the steady Burn light. Hex v2 is drawn in `FX_COL.curse`, with the foe visible
    through it. Reduced motion: a still sprite, no loop.
11. **Shots:** Wren gate 11, for idle, attack release, Fireball release, Frost Shard, Hex, Nova impact, Lanternburst, parry, hit,
    defeat, picker and camp.
12. **Clips:** 1280x720 DPR 1 and 740x360 DPR 2, 30 fps, about 15 s, seeded zone 5 fight: idle, Attack x2, Spark, Fireball (timed),
    Frost Shard, Hex, Arcane Ward, bitten, parry, dodge, Nova, Lanternburst, victory. Pass only if her size never changes, no foot slides,
    the staff never jumps hands at a join, no third hand shows, the idle does not boil, each release meets its shot from the right
    point, and no cast shows two heads.
13. **Checks:** Wren gate 13 (build, check, walk and cold leg on the SHA, a preview link to Cal). A Monday build only if gate 12 passed
    before the cut.

**Never:** redraw or repaint pixels; quantise below 63 colours; embed the gather loops; touch Wren's or Tobin's art; edit the
`62b-fx.js` recipes (pip-cast-recipes owns them); change the stage zoom or the online layer; spend credits.

## Build card spec: route-s-pip-gather

Depends on route-s-pip-wire, and on woodcut v6 and hunt v4 passing the judge. **PG1** at most 380 KB, seeded palette. **PG2** registration as
the wire card (standing frames hat-top 171 ± 4; crouches at their move's scale). **PG3** forage skips 4; mining plays all 8.
**PG4** contact as Wren G3: the axe head, pick tip or spear tip covers the node, and chips spawn there. **PG5** replaces the camp pose while
gathering and Codex's interim Pip hunt poses (`art/heroes/pip/hunt` stays on disk); Classic art restores both. **PG6** shots and
clip as Wren G5. **Never:** redraw, rotate or flip tool pixels; spend credits.

## Card spec: pip-cast-recipes (ability-effects-live lane)

Nova, Lantern Flare and Lanternburst re-recipe as in question 9, used only with route S art. It adds an anchor hook that `route-s-pip-wire` fills, and
a sprite-head hook (the live head is off when a sprite flies). Clip: the same fight as gate 12, with Classic art on and off.
**Never:** change another hero's recipe or a status colour.

## Re-brief list (Scenario, GPT Image 2.5, 18-19 credits a sheet; rolled by the pack thread within Cal's ~1,000 budget, not by this judge)

Roll in this order, in the pack's `moves.json` form (title, 8 frames, emitter) with each rule line in `extra.json`, references
[concept, Set A, Wren style]. Every move sheet also carries the ARMS and STAFF HAND RULE lines of `extra.json` "fire".

1. **Victory v2.** Title: "Victory, she celebrates". Frames: "ready stance, staff upright in her rear hand, front hand open and
   empty" / "twirls the staff once in her rear hand" / "raises the staff high overhead in her rear hand, front hand open" / "jumps
   for joy, staff held up in her rear hand, front fist pumped" / "lands, knees bent, staff still in her rear hand" / "plants the
   staff butt beside her rear foot, front hand on her hip, grinning" / "front hand touches her hat brim to the viewer, staff
   still planted in her rear hand" / "rests, smiling, weight on her rear foot, staff upright in her rear hand at full length, orb above
   her hat". Rule: "Pip has exactly two arms and two hands in every cell; the staff hand is always the rear hand. Count: one hand on the
   staff, one free hand, nothing else. The staff is the same full length in every cell; the orb never sits lower than her hat."
2. **Arcane Ward v2** (the brief's lantern-raise). Title: "Arcane Ward, she shields herself (draw no shield, bubble or glow)". Frames:
   "ready stance ..." (as idle) / "plants the staff butt beside her rear foot, rear hand on it" / "front hand unhooks the lantern from
   her belt" / "holds the lantern at her chest, eyes on it" / "lifts the lantern high overhead at arm's length, chin up, feet planted"
   / "release: holds the lantern high, coat stirring, the staff still upright in her rear hand" / "lowers the lantern and hooks it back on her
   belt" / "ready stance ...". Emitter: frame 6, the lantern. Rule: "The staff never leaves her rear hand and never crosses her body.
   The lantern is the same lantern as on her belt. She faces the viewer three-quarter, not the foe; she never thrusts the lantern
   forward (that is Lantern Flare)."
3. **Lanternburst v2** (the brief: "the lantern does not leave her hand"). Title: "Lanternburst, her finisher: lantern and staff
   together (draw no blast or glow)". Frames: "ready stance ..." / "front hand unhooks the lantern" / "crouches, lantern drawn in
   to her chest, staff angled forward in her rear hand" / "holds the crouch, eyes shut, lantern cupped close" / "rises, lantern and
   orb brought together in front of her chest" / "release: deep lunge, lantern thrust forward at full arm's length beside the staff
   orb, both pointing at the foe" / "recoil half a step back, lantern still in her hand" / "ready stance, lantern back on her belt".
   Emitter: frame 6, the lantern. Rule: "The staff is full length in every cell, as long as in the ready stance, with its whole
   shaft and butt visible; her rear hand grips it near the middle. The lantern is in her front hand from cell 2 to cell 7."
4. **Hex sigil v2** (one sheet, on white, sprites well apart; references: the concept and `pip-bolts.png` for style). "A curse sigil
   for a pixel-art game, 4 rotation views and 1 view lying flat on the ground as an ellipse. A thin open ring in magenta-purple
   (200,40,170), with 6 small angular glyph marks spaced around it, a 1-pixel dark outline, flat shading clusters as in the fireball
   and frost shard. The centre is completely empty and transparent. No eye, no gold, no solid disc, no letters or numbers, no glow haze."
5. **Woodcut v6** (gather). The v5 prompt, plus: "At impact (cells 5-6) the haft points up and right at about 45 degrees from her
   hands, with the head at its top; the bit's curved edge points right, level, into the trunk at chest height, and the broad face of
   the head shows. Never a level push with straight arms, never a head seen edge-on. Her staff is strapped across her back in every
   cell, cell 3 included."
6. **Hunt v4** (gather). The current (v3) prompt, plus: "Both hands stay on the shaft in every cell, the lunge included, and the whole spear,
   butt to point, shows in every cell at the same length. Draw her at the same size as the reference sheet: hat point, boots and
   orb as big as there."

Credits: 6 sheets at 18 = 108, bringing the pack to 936. At most one retry each for items 1-3 (54) gives 990. If credits run out,
the fallbacks are: victory plays 1-4, 6; Arcane Ward plays idle-1, 3, 4, 5, 8; and Lanternburst, Hex, woodcut and hunt wait for Cal's next
budget. A staff under 60% never ships.

## Risks

- **Rerolls fail again:** Fireball kept a third hand through two rerolls with the arms rule. The recheck counts hands per cell; the
  fallbacks apply; if Lanternburst v2 fails twice, the fight set waits.
- **171 reads too small** (Cal called Wren "a little kid" at the old size): gate 11 shots beside Wren and Tobin show it; veto "Pip as tall as Wren".
- **Joins pop** or the skips make Fireball, Spark or hit jerky: gate 12 shows it; the fix is that sheet's reroll (18 credits).
- **The split slips** and all three heroes wait; the art-loader's judge sets the boot line with all three in view.
- **Drift:** fx4's colours are not live (the build takes `FX_COL`); the seeded palette (12 swatches) may band the coat (gate 11 shots).

## Checked / not checked

Checked by the judge: the card, README, `meta.json` (no `bad` flag left), the prompts, the three audits, the red team and its JSONs,
both byte JSONs; the concept; its own crops at 190 px (`judge/crops/`) of every third-hand claim, the staff and tool frames, the skip
joins and the cut faults on magenta; a pale-edge scan of all 23 seeded atlases; a registered byte measure
(`judge/tools/measure_scaled.py`); a height lineup with Wren and Tobin; `fx-sheet.png` and `fx4.js`'s hit table; the live recipes and
emit point (`62b-fx.js`, `62-stage.js:682`), the abilities, the art brief, `hero-abilities.md` 6.3, `art-pipeline.md` 7,
`new-style/plan.md` 4.3, `art-loader.md`; Wren's ruling and Tobin's draft.

Not checked: the gallery and the fx4 stage test (no network); rendered stage shots and real clips; the ~1,188 enclosed holes frame by
frame (the auditors' game-size scans were used); bytes after a real build or the rerolls; the gather scale by hat-top.

## Plain words for Cal

Pip's new art looks like her concept on every frame. The light border pixels are gone. But your third arm is still there: six frames
have an extra hand, and the pack notes said Fireball was clean when it wasn't. Four of those frames are simply skipped. The victory
dance has two of them, so it gets a fresh sheet. Arcane Ward swaps her staff between hands, and Lanternburst shrinks it and forgets
the lantern, so those get fresh sheets too, as does the Hex symbol, which looks like a dark coin. The woodcutting and spear loops need one more go
each. That is six sheets, about 108 credits, which keeps her under 1,000. She stands a little shorter than Wren and Tobin, as you set for her
in September. She is too big to fit in the one-page game with Wren, so she goes in when the game moves to its own hosting. To
overrule, say "Wire Pip now", "Pull the new Pip", "Wait for all three heroes", "Pip as tall as Wren", "Skip the Pip rerolls" or
"No Hex sigil".
