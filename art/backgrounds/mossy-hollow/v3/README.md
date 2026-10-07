# Mossy Hollow — Claude handoff, v2

This bundle contains five corrected **relit** layers and the five unchanged **shrouded** originals. The relit changes use direct pixel processing of the supplied artwork; no generative repainting was used.

## Relit corrections — verified

- Every PNG is a full **480×270** canvas, aligned at origin (0,0), with no cropped transparent margins.
- Sky is fully opaque over the entire canvas, including the top edge. Missing sky coverage uses colours sampled from the original sky.
- Far hills reach both side edges and occupy all 480 columns. Their concealed lower region continues beneath the other layers.
- Ground retains its upper contour and continues to the bottom across the full width, including beneath the foreground. Its extension reuses existing path texture.
- Foreground has no visible pixels above **y=238**. Its original occupied strip was vertically fitted into **y=238–269** using nearest-neighbour sampling, retaining its horizontal arrangement and motifs.
- Every pixel has alpha **0 or 255**. Source alpha was thresholded at 128; no antialiasing, partial transparency, or dithering remains.
- All five relit layers share **47 opaque RGB colours plus one fully transparent entry**: 48 entries total, including transparency. The assembled scene uses the same palette.

Original scene elements retain their positions except for the required foreground height adjustment and edge extensions. Palette reduction necessarily changes individual pixel colours. Empty areas above terrain and between trees remain transparent so the layers stack correctly; full-canvas files do not mean every terrain layer is opaque everywhere.

`relit/palette.txt` lists the shared colours. `relit/validation.json` records the file checks. `previews/relit_composite.png` is a flattened reference only; use the separate layers in the game.

## Layer order and integration

Stack back to front at the same origin:

1. `01_sky.png` — sky.
2. `02_far.png` — hills, mountains, and village.
3. `03_mid.png` — trees, lamp posts, and fences.
4. `04_ground.png` — playable road.
5. Runtime characters and enemies.
6. `05_foreground.png` — thin front strip.

Characters are intended to be **96px tall** at native resolution. Keep their standing lane in the lower 20–25% of the canvas (approximately 54–68px), clear enough for their silhouettes. Render with nearest-neighbour sampling at integer display scales; avoid filtering or lossy conversion that introduces extra colours or softened edges.

## Art direction

Keep the background lower in contrast and less saturated than characters, especially behind the path. Relit depicts warm golden early morning, not bright midday. Shrouded depicts cold, desaturated blue-green-grey dusk. Preserve the scene layout between states.

Lamps should be unlit or softly lit, with glow, light pools, fog, and flicker added in code. Lighting and shadows should follow actual sources. Do not add glowing monster eyes. Existing painted lamp details remain in these assets; the runtime effects are not included.

## Shrouded originals

Shrouded PNGs are preserved byte-for-byte from the previous bundle. The relit validation and palette limit do **not** apply to them: they still contain partial alpha, thousands of colours, and foreground content above y=238. No shrouded corrections were requested in this revision.
