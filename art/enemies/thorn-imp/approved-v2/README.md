# Thorn Imp — owner-approved animation package

Approved by the owner on 2 October 2026: "Yeah I'm happy with all of them. Can you package and send to Claude for implementation". This is the authoritative selection from the review drafts. It has not yet been wired into the game.

Start with `manifest.json`. There are seven actions and55 body frames: idle4, hop6, Briar Jab12, Crosscut16, hurt4, stagger4, death9 (including the transparent terminal state). Frame PNGs and atlases are both included. `preview.html` and `previews/` show the approved visual rhythm. `sources/` retains11 full-resolution generation sources plus prompts for future work.

## Rendering contract

- Standing height64px including horn against96px heroes. Body cells128x96. Facing left. Use nearest-neighbour sampling and preserve binary alpha.
- Shared body draw origin `(100,88)` is relative to its cell. This is the grounded rear-foot reference for fixed poses, not a promise that moving feet stay at that position during hop or collapse.
- FX cells176x128 have origin `(132,104)`. Draw FX at body top-left plus `(-32,-16)`; this puts both layers at the same world root. Atlas rects and filenames are explicit per frame.
- Render body, then attack FX, then landed-hit FX. The latter is separate: suppress it for misses, dodges and parries. A real collision may need the contact spark repositioned onto the target; retain the authored blade trail.
- Timing/event frame numbers are ONE-BASED. Atlas rectangles are pixel coordinates with width/height. Per-frame durations are milliseconds.

## Actions and combat timing

Briar Jab is the approved v4:600ms build-up plus220ms hold,140ms thrust,300ms recovery. Release frame7, contact frame9. Crosscut is the final v3 FX revision over the corrected v2 body: each preparation is820ms, releases at frames6/12 and contacts at frames8/13. Its second cut uses the anatomical left/camera-near arm continuously through follow-through and recovery. Effects coat the actual attacking blade rather than drawing a generic crescent.

These are approved presentation timings, not a change to game damage, turn rules or parry logic. Synchronize the authored cues and contacts with the authoritative defence windows. Each Crosscut hit needs its own defence opportunity and contact event. Do not infer extra hits from effect frames. Review-loop idle holds at the start/end of attacks are identified in the manifest; don't accidentally add the500ms showcase idle to every combat wind-up. `action_start_frame:2` excludes that leading presentation pause.

Use the same hop frames for approach and retreat, always facing the hero. The owner explicitly chose hops instead of walking. Translate the world root horizontally during140–430ms of the hop: left to approach, right to retreat. Its vertical lift is already present in the body images; do not add another vertical arc. Land before starting an attack. Preview clips demonstrate a travel distance, not a required distance in the game.

Hurt is a brief reaction; stagger is the deeper vulnerable opening. Their durations are visual defaults. Death collapses and unravels into darkness; its last frame is empty by design. Stop on that terminal state and remove the actor. The looping GIF resets only for review.

This package covers the NORMAL Thorn Imp. Crownthorn Captain crimson recolour/marking and Royal Rip are not supplied; don't silently apply the normal animation events to a three-hit captain attack.

## Verification and handoff

Run `python verify.py` with Pillow installed to validate hashes, all frame dimensions/alpha, atlas parity, terminal emptiness and event indices. `sha256.json` lists every package file except itself. No skill installation or local draft folder is needed to use or validate the package.

The approved bodies were copied without altering their pixels. Jab layers were repackaged into the common FX canvas, retaining body-relative positions. Crosscut combined FX were separated into attack and landed-hit layers with exact pixel recomposition checked. Original/rejected drafts are not part of this handoff.

Repository validation at base2c2eb86: `node tools/build.mjs` passed; `node tools/check.mjs` exited0 with "all checks passed".23 browser sections were explicitly skipped because Playwright was unavailable in this worktree. Claude should run browser checks after integration. No runtime source, save key or game balance changed in this art handoff.
