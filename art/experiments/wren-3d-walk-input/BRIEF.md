# Codex brief: paint over a 4-frame 3D walk loop of Wren (experiment, not a game pack)

## Why

Your single paint-over frame (`codex/wren-3d-paintover`, 21f945a7) was the first test that read as real pixel art at game
size. Cal and Claude want to see whether it holds up **in motion**. Each frame is painted separately, so details can drift
from frame to frame (a buckle jumps, the trim pattern changes, the face shifts) and the walk shimmers. This test checks that.

The stiff outstretched arm in the last frame came from Claude's quick rig. These four frames have a proper walk: arms
swinging close to her body and a real stride.

This is a scratch experiment. Nothing goes into the game, and nothing replaces approved art. Don't wire, convert or embed anything.

## Inputs (all on GitHub)

Branch `claude/project-thread-7t9j06`, folder `art/experiments/wren-3d-walk-input/`:

| File | What |
|---|---|
| `wren-walk-1-3d-1x.png` … `wren-walk-4-3d-1x.png` | The four rendered frames at game size, 105x205 each, transparent, **already lined up on the same canvas**. These are your canvases. |
| `wren-walk-1-3d-hires.png` … `wren-walk-4-3d-hires.png` | The same poses rendered large (1254x1254, white background), to show what each blob is. |
| `wren-walk-3d-preview.gif`, `wren-walk-3d-sheet-3x.png` | The raw loop playing, and all four side by side at 3x. |

Also use your finished paint-over frame (`art/experiments/wren-3d-paintover/` on `codex/wren-3d-paintover`) as **the style
and detail key**: same palette, same face, same hood trim, same belt, quiver, lantern and boot details. Use your v2
drawings (`art/experiments/wren-3d-ref-v2/` on `codex/wren-3d-reference-v2`) for anything the key frame doesn't show.

Branch your work from `claude/project-thread-7t9j06`.

## Deliverables

Branch `codex/wren-3d-walk`, folder `art/experiments/wren-3d-walk/`. **Push the branch when done.**

| File | What |
|---|---|
| `wren-walk-1.png` … `wren-walk-4.png` | Your four repainted frames, same 105x205 canvases, transparent |
| `wren-walk-sheet-4x.png` | All four side by side, 4x nearest-neighbour |
| `wren-walk.gif` | The loop at 4x, about 180 ms a frame, on a dark background (#28223A) |
| `README.md` | Method, time taken, the palette, and anything that drifted between frames that you had to fix |

## Rules

1. **Keep each frame's pose and silhouette,** as last time. Don't move or resize anything on the canvas: the frames
   are already lined up, so she must not slide around when they play.
2. **Same details in every frame.** One palette for all four (at most 24 colours). The face, hood trim, bat emblems,
   belt buckle, quiver, lantern and boot straps keep the same shape and colours wherever they're visible. Only what the
   pose changes may change.
3. **Style as your paint-over frame:** strict pixel art, a clean 1 px dark outline (#120B18), flat shading clusters, one or
   two shade steps, light from the upper left, no dithering or anti-aliasing.
4. **Check the loop by playing it** before you push. If anything flickers or jumps, fix it in the frame that's off.

## Done means

The six files and the README are pushed on `codex/wren-3d-walk`, and the loop plays without shimmer. Claude puts it next to
the raw 3D loop for Cal.
