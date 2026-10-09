# Codex brief: paint over one 3D walk frame of Wren (experiment, not a game pack)

## Why

We built Wren in 3D from your v2 reference drawings (`codex/wren-3d-reference-v2`, 080f00a0), rigged her and rendered her
walking at game size, about 200 px tall. The poses and angles come out steady, but the colours and detail don't: shrunk
straight from 3D, she reads as a blurry model, not pixel art. A machine can't choose which details to keep at this size.
An artist can.

The test: you take one rendered walk frame and repaint it as finished pixel art. If the result looks like a hand-made
sprite, we use 3D for poses and angles and you paint every frame. Cal picked this trial on 9 Oct.

This is a scratch experiment. Nothing goes into the game, and nothing replaces approved art. Don't wire, convert or embed anything.

## Inputs (all on GitHub, no attachments needed)

Branch `claude/project-thread-7t9j06`, folder `art/experiments/wren-3d-paintover-input/`:

| File | What |
|---|---|
| `wren-walk-3d-1x.png` | The rendered frame at real game size, 98x204, transparent background. **This is your canvas.** |
| `wren-walk-3d-4x-preview.png` | The same frame enlarged 4x, just for viewing. |
| `wren-walk-3d-hires.png` | The same pose rendered large (1254x1254, white background), to show what each blob is. |

Your v2 drawings: `art/experiments/wren-3d-ref-v2/` on `codex/wren-3d-reference-v2` (080f00a0).
Her approved concept board: `art/concepts/hero-corrections-v1/wren.png` on `codex/hero-animation-plan`.

Branch your work from `claude/project-thread-7t9j06` so the inputs are in your checkout.

Use your v2 drawings for her face, hood, bat trim, belts and boots, and the concept board for the palette.

## Deliverables

Branch `codex/wren-3d-paintover`, folder `art/experiments/wren-3d-paintover/`. **Push the branch when done.**

| File | What |
|---|---|
| `wren-walk-paintover.png` | Your repainted frame, the same 98x204 canvas, transparent background |
| `wren-walk-paintover-4x.png` | The same enlarged 4x with nearest-neighbour scaling, for review |
| `README.md` | What you changed and why, how long it took, and how many colours you used |

## Rules

1. **Keep the pose and silhouette.** Her body, arm and leg positions, height and outline stay where the render puts them,
   so the frames will still line up in an animation. You may fix small outline wobbles and add or trim a pixel or two.
2. **Repaint everything inside.** Treat the render as a guide only. Simplify busy patches into bold, readable shapes:
   clear face (eyes, mouth), clean hood edge and ears, readable bat trim, belt, quiver, lantern and boot straps.
   Drop detail that turns to noise at this size.
3. **Match her sprite style:** strict pixel art, a clean 1 px dark outline (#120B18), flat shading clusters with one or
   two shade steps, no dithering noise, no anti-aliasing against the background. Purple hood and trim as in your v2
   drawings, not the brown cast of the render.
4. **Palette:** about 24 colours at most.
5. She faces screen right in a three-quarter view, in mid-stride (left leg forward). Light comes from the upper left.

## Done means

The two PNGs and the README are pushed on `codex/wren-3d-paintover`. Claude puts your frame next to the raw render and
her current sprite for Cal to judge.
