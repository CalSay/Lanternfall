# Mossy Hollow — Claude handoff

Ten original transparent PNGs, organised into `shrouded/` and `relit/`. Files have been renamed for layer order; their bytes, dimensions, colours, and alpha channels are unchanged.

## Composition and stacking

Use a shared **480×270** canvas and origin for every layer. Stack back to front:

1. `01_sky.png` — sky.
2. `02_far.png` — hills, village, mountains.
3. `03_mid.png` — trees, lamp posts, fences.
4. `04_ground.png` — playable path.
5. Runtime characters.
6. `05_foreground.png` — bottom foreground strip.

Preserve full-canvas transparent margins. Both states should use the same scene geometry so switching lighting does not shift the landscape. Characters and enemies remain separate from the background; omit glowing monster eyes.

## Intended art constraints

- **Path:** lower 20–25% of the canvas (about 54–68px), kept clear for standing characters and readable across the screen.
- **Foreground:** no taller than 12% of the canvas; at most 32 whole pixel rows, within y=238–269. Avoid obscuring the playable lane.
- **Characters:** 96px tall at native resolution, about 36% of canvas height. Place feet on the path. Use nearest-neighbour scaling, preferably at integer display scales.
- **Palette:** target 32–48 colours per scene and crisp pixel-art edges. Keep the background less saturated and lower in contrast than characters, especially directly behind the path. Distant layers should recede.
- **Shrouded:** cold, desaturated blue-green-grey dusk, subdued village detail, dead or weak lamps.
- **Relit:** early morning with warm golden sunlight and returning moss greens, not bright midday. Retain character readability.
- **Lamps:** unlit or softly lit fixtures. Add glow, light pools, fog, and flicker in code. Lighting and shadows must agree with actual light sources; dead lamps must not cast warm light.

## Verified files and known differences from the brief

All ten files decode at 480×270 and contain transparent pixels and partial alpha. Source PNG bytes were preserved exactly. The original README states the images were resized using nearest-neighbour sampling; no additional resizing was performed for this handoff.

The art is not fully compliant with the intended constraints: each layer contains thousands of visible RGB colours, exceeding the 32–48-colour target. Both foreground layers have nonzero alpha above y=238; faint pixels extend to y=10 in relit and y=85 in shrouded. Most nontransparent pixels throughout the assets are partially transparent, so check compositing over the intended backdrop.

For Claude: load the layers as supplied, then review the assembled scene for path clearance, foreground height, alignment between states, and lighting. Treat the constraints above as the intended design, not verified compliance. Keep originals intact and flag required art corrections before altering them.
