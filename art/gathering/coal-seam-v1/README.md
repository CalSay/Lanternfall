# Coal Seam v1 — node and Hollow quarry scene

New art drawn with built-in image_gen. One grade; four states: idle, struck-1, struck-2, worked-out. This is an art-only review proposal and has not been wired into the game. Base: `08c3163e`, `claude/elegant-johnson-m6k00u`.

## Node

`coal-seam.png` is a 120×120 transparent atlas, two columns by two rows of fixed **60×60** frames. The separate frame files are also supplied. Every frame uses bottom/contact anchor **(30,48)**. The rock body is 48×25 native pixels, beside the Copper Vein's 47×28 native frame. Frame canvases retain the padding required for authored flying chips. Typical stage display is 2×, using nearest-neighbour scaling.

Idle is a grey rock face crossed by a broad black coal stratum. The first strike chips the left-facing work surface; the next frame lets the authored chips travel out and down. Worked-out shows a dark dug pocket and fragments resting at its foot. The rock stays rooted, with no per-frame fit or resizing. Timing suggestions (600/90/110/250ms) are metadata, not implemented game timing; the coordinator should play the two struck frames when the mining swing lands and use worked-out between swings.

`meta.json` records size, contact anchor, source rectangles, state order, suggested durations, bounding boxes and scene camera examples. The node is a new image-generated design. The Copper Vein is used only as an unchanged reference; its pixels and silhouette were not recoloured into coal.

`coal-seam-source.png` is the unmodified generated 2×2 sheet. `coal-seam-source-clean.png` is its magenta-keyed transparent copy. Final node processing uniformly samples each source cell to 60×60 with nearest-neighbour scaling, binary alpha and **one shared 16-colour palette** (no dithering). No hand drawing, procedural chips or synthetic outlines were added.

## Scene

`coal-quarry.png` is **448×224**, the same background plate format as `art/hunting/interim-v1/hunting-grounds.png`. Its 48-colour palette carries the Hollow's muted moss, soil, cool quarry greys and purple forest distance. `coal-quarry-source.png` preserves the generated source. Reduction to the hunting native grid uses BOX sampling and nondithered palette quantization.

This is a scenery-only plate. The mine recess, quarry wall and distant trees are background; the hero, mineable Coal Seam and its chips are separate sprites. There are no baked actors, node sprites, labels or pickups in the plate. Ground/contact height is 179 native pixels (80% of the plate).

For either orientation, uniformly scale to cover the viewport with nearest-neighbour sampling, centre-crop horizontally, and align the source ground line to 80% of viewport height. Do not stretch the plate. Metadata records the exact cover/crop examples for 360×740 and 740×360. The review images compose the existing Tobin gather pose and the new separate idle node over the plate; those images are review evidence, not backgrounds to integrate.

## Review evidence

- `node-review.png`: the Coal Seam's four states next to the unchanged live Copper Vein at native 1× and nearest-neighbour 3×.
- `copper-vein-reference.png`: Copper Vein's native 47×28 frame, exported from the existing live renderer (`ART.enemyFrames('node:ore', {tier:1}).idle0.art`).
- `copper-vein-live-reference.png`: the current local game at **Copper Vein / Mining Lv 1**. Existing story test flags dismiss intro screens; a test-only in-memory warm Hearth exposes mining. No game source was changed for this capture.
- `scene-review-portrait.png`, `scene-review-landscape.png`: separate hero and seam in the requested viewport sizes, with clear silhouettes and no clipping.
- `node-prompt.txt`, `scene-prompt.txt`: exact built-in image generation prompts.
- `validation.json`: final delivered image checks, shared palette, anchors, source integrity hashes and processing QC.

Whole-pack art judgement remains required before conversion/embedding. No files under src/, tools/ or docs/ were edited for this task, and none of this pack changes saves, mining rewards or scene code.
