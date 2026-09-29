# Lanternfall art source

Hero art made with the GPT key-pose pipeline (docs/design/art-pipeline.md). These are source files. The game
build doesn't read this folder yet; wiring the heroes into the game is the art tool's job when work resumes.

| Hero | Class | Poses | Version | Notes |
|---|---|---|---|---|
| Wren Hollowmere | Archer (striker) | full draw, just released, relaxed camp, hurt | GPT v4 "complete poses" | 96 px. Death uses a toppled camp pose until kneel and fallen poses exist |
| Tobin Reed | Melee (tank) | ready guard, wind-up, strike, braced block, relaxed camp, hurt, kneeling, fallen | GPT v3 (after the style pack) | 96 px |
| Pip Cinderly | Caster | ready, wind-up, cast, relaxed camp, hurt, kneeling, fallen | GPT 86 px trial | 86 px, shorter on purpose because she's young. Shrunk from 96 px, so a native 86 px redraw would clean her edges |

Each hero folder has:
- `poses/`: GPT's full-body sprites, untouched (224x192, feet on the anchor at 96,132).
- `palette.png`: the hero's 40 colours.
- `fx/` (Wren only): the bat, arrow and sound-wave sprites the code layers on top.
- `animate.py`: the script that builds the animations from the poses and adds the code effects: Wren's bow
  string, arrows, sound waves and bat; Tobin's swoosh and block spark; Pip's procedural fire, fire bolt, embers
  and smoke. The paths inside point at the old session scratch folder. Fix them to `art/heroes/<hero>/poses`
  when you move these into `tools/art`.

Also here:
- `viewer/hero-animations.html`: the animation viewer page. It's self-contained: open it in a browser, or
  publish it. Live copy: https://claude.ai/artifact/R2esehCtX9CkoCUe7aGcG6
- `lanternfall-hero-style-pack.zip`: the reference pack to attach when asking GPT for a new hero.

The accessories that become craftable gear are in docs/design/hero-accessories.md.
