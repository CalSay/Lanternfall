# Wren four-frame walk paintover

Scratch experiment only: no game integration, conversion, embedding or replacement of approved art.

## Sources and method

Branched from `claude/project-thread-7t9j06` at `ff8cb68a5e470dfbc6d2cf88621d43aaea72117a`. The four `../wren-3d-walk-input/wren-walk-N-3d-1x.png` files are the authoritative aligned canvases; the hires versions identify the costume parts. Style/detail key: the accepted single paintover on `codex/wren-3d-paintover`, `21f945a7`. Wren v2 (`080f00a0`) remains the underlying costume reference.

Each pose received a built-in image-generator repaint using its render, the accepted key and the first new repaint as references. The prompt required the original pose and silhouette, purple hood and front curls, calm open eye, gold bat trim, charcoal armor, brown straps and boots, quiver and lantern, upper-left light, flat shading clusters and a #120B18 one-pixel outline. No long cape, bow, gradients, dithering, glow or text.

The previously authorized deterministic pixel finish registers generated paint to each source canvas, samples without smoothing, maps to the accepted fixed palette, fills small uncovered areas from nearby painted pixels, restores the original source mask at alpha >=128, and applies an inner one-pixel outline. No source-render RGB is used in the final painting. These are AI-assisted paintovers, not a claim of manually placing every pixel.

## Drift corrected

- Generated head proportions, eyes and hood marks varied. Reused one painted head at the source render's integer head offsets: frame 1 (0,0), frame 2 (0,-3), frame 3 (0,0), frame 4 (0,-3).
- The shoulder motif also changed during playback inspection. Extended that shared artwork through the upper mantle while retaining each frame's source silhouette.
- Frame 2's painted waist sat too high. Registered its interior waist downward by four pixels without changing the canvas or alpha mask.
- Reused the central chest straps and belt detail to reduce changes between poses, keeping moving arms and their occlusion separate.
- One fixed palette prevents per-frame colour quantization changes. Lower-body detail visibility still changes with the stride and overlap; the supplied render's body bob remains intentional.

Played the assembled GIF in Edge/Chromium and inspected timed playback captures covering all four frames. Corrected the upper-body detail drift above and replayed. This is ready for Cal's motion judgement; pixel registration alone does not establish that a full animation pack would be free of perceptual shimmer.

## Files, timing and palette

- Four 105 x 205 RGBA PNGs, binary alpha, zero silhouette differences from each input at alpha >=128.
- `wren-walk-sheet-4x.png`: exact side-by-side nearest-neighbour enlargement, 1680 x 820, transparent.
- `wren-walk.gif`: 420 x 820, four frames, 180 ms each, infinite loop, #28223A background.
- About 25 minutes elapsed for setup, four generations, corrections, playback and validation on 9 Oct 2026 (20:45-21:10 BST). This included resolving the previous stalled check run; it is not a per-frame painting-speed estimate.

**23 visible sprite colours**, all from the accepted key's 24-colour palette (the unused colour is #74427D). Transparency is separate; GIF background adds #28223A.

`#120B18 #251B29 #34202A #352043 #393039 #3C153B #513064 #553023 #554650 #69234F #6E471E #805034 #A53772 #A95643 #AC6C24 #B4773C #CD548B #DB895B #E9A438 #F9ECDF #FFB67C #FFD16A #FFDCAD`

## Validation

Passed: PNG sizes, binary alpha, original silhouettes, shared colour count, exact sheet scaling, four GIF frames, 180 ms timing, infinite looping and background colour. Browser playback exercised the saved GIF, followed by a corrected replay.

`node tools/build.mjs` passed. `node tools/check.mjs --jobs=1` ran with a 4 GB heap, reported three Forge-completion notification failures, then exited 134 with JavaScript heap exhaustion. This is not a passing full game check. No game code or checks were changed.
