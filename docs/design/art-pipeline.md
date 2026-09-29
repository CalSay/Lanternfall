# Hero art pipeline (GPT key poses + code animation)

Agreed with the owner on 2026-09-29 after the Wren test (viewer: https://claude.ai/artifact/R2esehCtX9CkoCUe7aGcG6).
GPT draws each **key pose as one complete sprite**, so the anatomy is right. We add every moving layer in code:
breathing, cloth drift, companions, bow strings, projectiles, swooshes, sound waves and other effects.
We do not hand-assemble limbs from parts. It failed at this scale: floating heads, lumps on the chest, and hands over faces.

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

> Fantasy pixel art hero for a mobile RPG. Draw **[N] complete full-body sprites** of the same character (not
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
