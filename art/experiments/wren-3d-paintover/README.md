# Wren walk-frame paintover

Scratch experiment only. Nothing is wired, converted or embedded into the game, and this does not replace approved art.

## Inputs

- Base branch: `claude/project-thread-7t9j06`, commit `4cb839a3d2779f20e1d86864358a9427c15f96a6`.
- Canvas: `../wren-3d-paintover-input/wren-walk-3d-1x.png` (98 x 204). Its 4x preview supplied pose/placement and its hires render identified the costume shapes.
- Design: Wren v2 body-front at `080f00a0` on `codex/wren-3d-reference-v2`.
- Palette/design reference: approved `art/concepts/hero-corrections-v1/wren.png` on `codex/hero-animation-plan` (the supplied identical local concept-board copy).

## Changes and method

Repainted the interior to restore purple cloth and hair, warm skin, charcoal armor and distinct gold fittings. Re-established the eye and mouth, hood edge and bat shapes, crossed straps, belt buckle, quiver fletching, lantern and boot buckles. Reduced the render's mottled lighting and small stitching to flat shade clusters, lit from the upper left. Kept the screen-right three-quarter pose and all limb positions.

The built-in image generator produced the repaint using the rendered frame as the edit target, with the hires render and approved drawings as references. Cal authorized deterministic finishing: nearest-neighbour sampling to the original canvas, a fixed 24-colour palette without dithering, the original silhouette thresholded at alpha >=128, and a one-pixel inner outline in #120B18. Generated colour just outside its own contour was extended from the nearest painted pixel only where needed to fill the original mask. No source-render RGB pixels were retained. This is an AI-assisted paintover with pixel constraints, not a claim of manually placing every pixel.

Art production and pixel validation took about 7 minutes (9 Oct 2026, 20:19-20:26 BST); repository checks and Git handoff were additional time.

## Files and verification

- `wren-walk-paintover.png`: 98 x 204 RGBA; exactly **24 visible RGB colours**, plus transparency; alpha values only 0 and 255.
- `wren-walk-paintover-4x.png`: 392 x 816, exact nearest-neighbour 4x enlargement.
- Silhouette: zero differing pixels against the input mask at alpha >=128. No repositioning or resizing of the source canvas.
- Visually inspected the 4x result for face, equipment and outline readability.

Palette: `#120B18 #251B29 #393039 #554650 #352043 #513064 #74427D #3C153B #69234F #A53772 #CD548B #34202A #553023 #805034 #B4773C #6E471E #AC6C24 #E9A438 #FFD16A #A95643 #DB895B #FFB67C #FFDCAD #F9ECDF`.

## Prompt

Repaint all interior pixels of the supplied walk frame as strict pixel art, preserving its exact silhouette, pose, height, angles and placement. Screen-right three-quarter mid-stride; trailing arm down-left, overlapping legs, boot pointing right. Use the hires render only to identify shapes, and Wren v2/concept art for identity and palette. Purple hood and front curls, readable open eye and calm mouth, simplified gold bat trim, charcoal tunic and leggings, leather straps and boots, hip quiver and lantern. Upper-left light, one or two shade steps, at most 24 solid colours, one-pixel #120B18 outline, transparent background. No long cape, bow, gradient, antialiasing, dithering, blur, glow or text. Do not change anatomy or limb positions.
