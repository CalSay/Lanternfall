# Hero art pipeline (GPT key poses + code animation)

Agreed with the owner on 2026-09-29 after the Wren test (viewer: https://claude.ai/artifact/R2esehCtX9CkoCUe7aGcG6).
GPT draws each **key pose as one complete sprite**, so the anatomy is right. We add every moving layer in code:
breathing, cloth drift, companions, bow strings, projectiles, swooshes, sound waves and other effects.
We do not hand-assemble limbs from parts. It failed at this scale: floating heads, lumps on the chest, and hands over faces.

> **Art freeze (owner, 2026-09-30; `CLAUDE.md`):** effects and props (arrows, bow strings, tools, sparks, chips) now come
> from the artist inside the pack, drawn to match the art. Where this page says "code adds" an effect or a prop, that
> applies only to the effects already in the game; agents do not draw new art in code. One hero stands on the stage
> and one enemy at a time (owner, 2026-09-29 and 2026-10-01).

## 1. The fixed spec (same for every hero)

- Strict pixel art on a true grid, no noise or dithering, a clean 1-pixel dark outline.
- Character about **96 px tall**. Canvas **224×192**, transparent, feet on the anchor **(96,132)**. Facing right.
- Up to **40 colours** per hero, 4-6 shade ramps per material, cooler shadows and warmer highlights.
- The head sits on the shoulders: the hood or collar base joins the chest with no visible neck gap.
- The face stays fully visible in every pose. Closed-eye lines curve up or stay level (calm, never sad).
- **Leave out** anything that moves or changes in code: bow strings, arrows in flight, spells being cast,
  swooshes, companions, and live flames or pulsing glows.
- **Draw the prop, not the effect.** A staff's ember holder, a crystal focus, a lantern, a rune on a blade:
  draw them as part of the object, in a calm "resting" state (a faint warm tint on an ember, a crystal with
  its own colour and highlight). Code adds the live part on top (flickering flame, glow pulse, sparks) and can
  turn it up in fights and down at camp or in death. A baked-in flame can't flicker, shows even when she's
  knocked out, and fights the code flame for the same pixels.
  A bow is drawn **without its string**.
- Export each pose as its own PNG, plus a contact sheet and `palette.png`.

## 2. Pose sets by class

The poses marked "code" are built from the others, so GPT does not draw them.

| Animation | Archer (Ranger line) | Melee (Warrior line) | Caster (Lanternmage line) |
|---|---|---|---|
| Fight idle | Full draw | Ready guard | Ready (focus raised) |
| Attack | Full draw, then released | Wind-up, strike (swoosh in code) | Wind-up, cast (spell in code) |
| Ability | (code: arrow and effects) | Braced block | (code: the spell) |
| Camp idle | Relaxed at camp | Relaxed at camp | Relaxed at camp |
| Hurt | Hurt flinch | Hurt flinch | Hurt flinch |
| Death | Kneel, fallen | Kneel, fallen | Kneel, fallen |

Archers need 6 poses, melee heroes 7, casters 6.

## 3. The prompt template

Fill in the brackets and paste the whole thing:

> Fantasy pixel art hero for a browser RPG. Draw **[N] complete full-body sprites** of the same character (not
> separate parts). Each goes on its own 224×192 transparent canvas, facing right, feet on the anchor (96,132),
> character about 96 pixels tall. Use strict pixel art: a true pixel grid, no noise or dithering, a clean
> 1-pixel dark outline, and **up to 40 colours** shared across every pose, with 4-6 shade ramps per material
> (cooler shadows, warmer highlights). The head sits down on the shoulders with no visible neck gap. The face
> stays fully visible and calm in every pose. Leave out [code-drawn things: bow string / swooshes / spell
> effects / companion]; I add those.
>
> **Character:** [name, title], [class and role]. [Their story and personality in a few lines.] [Only the story
> facts the look must show, e.g. "a borrowed sword too big for him".] Design the outfit, colours and details
> yourself to fit the character.
>
> **Poses:**
> 1. [pose]: [one sentence of exact body position].
> 2. ...
>
> Export each pose as its own PNG, plus one contact sheet and `palette.png`.

## 4. Review checklist (the traps we hit on Wren)

- The head is attached. The collar or hood base meets the chest.
- There's no neck gap and no giraffe neck.
- Shoulders are the width of the torso, and the arms hang from them rather than outside them.
- Hands and weapons never cover the face.
- Every limb is visible and connected. Nothing is hidden by a prop or an arrow shaft.
- The weapon keeps its shape in every pose. Nothing is stretched or turned into a ribbon.
- The palette matches across poses, and the character reads as their class, not another's.

## 5. What code adds (`scratchpad` scripts today, `tools/art` when work resumes)

- Breathing: the rows above the knees shift by 1 px. The feet stay planted.
- Bow string: drawn over the body but under the drawing forearm. It meets at the hand at full draw and runs straight after the release.
- Projectiles, swooshes, spell effects and sound waves, timed to the hit frame.
- Companions (Wren's bat). Palette lock and outline clean-up. Frames go straight into the game.

## 6. Keep the design direction light (owner, 2026-09-29)

Give GPT the character's story, role, weapon type and the few details the story requires. Let it design the
outfit, palette and details itself: Wren's best choices came from GPT. Only step in when a result breaks the
checklist or reads as the wrong class.

## 7. Heights (owner, 2026-09-29)

Heroes may differ in height to fit their character (Pip, who is young, is about 86 px; adults about 96 px).
Ask GPT to draw at the target height **natively**. Don't shrink a 96 px sprite by a non-whole factor: it drops
rows and columns and breaks outlines. Pip's trial was shrunk this way, so her final poses should be redrawn at 86 px.

## 8. Stage and backgrounds (owner, 2026-10-08: browser first; replaces 2026-09-29 landscape only on mobile)

- Heroes and scenery share one scale: **1 art px = 1 logical px** (the stage's layout unit).
- Background canvas: **480 x 270 art px** (16:9), ground line at **y = 216**, key landmarks between x = 100
  and 380, the strip above the ground kept clear for fighters. Separate transparent layers: sky, far, mid,
  ground, optional foreground. Two states per area: shrouded and relit. Lamps drawn unlit or softly lit;
  glow, fog, flicker and fireflies are code.
- The design size is a desktop browser at 1280 x 720 CSS px: the stage is about 960 x 672 CSS px at x2, so about
  480 x 336 logical px and a 96 px hero is about 30% of the stage height. At 1920 x 1080 (must look good) it draws at
  x3; 1366 x 640 must fit.
- On a landscape phone (about 740 x 360 CSS px) the stage is about 480 x 316 logical px at x1, so a 96 px hero is
  about 30% of the stage height. Tablets (1024 x 768) draw at x2. Phones held upright (360 x 740) must not break.
- Check art at 1280 x 720 first, then 1920 x 1080, then 740 x 360.

## 9. Keeping the fight readable (owner: "it looks so cluttered", 2026-09-29)

1. **Quiet background behind the fight.** The far and mid layers sit well back (lower saturation and contrast, dimmed
   toward night blue) with a soft vignette, so only the road and the fighters are bright.
2. **A clear gap in the middle** of the road between the hero and the foe, for arrows, fireballs and swooshes.
3. **Contact shadows** under every fighter, so they stand on the road instead of floating on the picture.
4. **Lower foreground.** The front plants stay a thin dark strip, so they frame the road without covering feet.
5. **Heroes are never shrunk** (pixel art cannot be scaled down cleanly). Enemy size follows the monster's design in
   its C22 card; poses follow its moves.

Lane combat (enemies walking in) was scrapped on 2026-09-29: enemies need no walk cycle.
