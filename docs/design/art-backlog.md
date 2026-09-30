# Art backlog (owner work list)

Started 2026-09-29, after the new hero art went into the game. Work top to bottom. Every hero prompt follows
art-pipeline.md (224x192 canvas, feet on (96,132), about 96 px tall, Pip 86 px, up to 40 colours, strict pixel art,
draw the prop not the effect). Paste the hero's existing `palette.png` and one current pose with every prompt so
GPT keeps the same character and colours.

## 1. Heroes: what each still needs

| Hero | Fight | Death | Gathering | Notes |
|---|---|---|---|---|
| Wren | done (draw, release, hurt, camp) | **kneel, fallen** | received 2026-09-30, to wire | outline trimmed in code (tools/heroart.mjs) |
| Tobin | done | done | received 2026-09-30, to wire | |
| Pip | done | done | received 2026-09-30, to wire | optional: redraw natively at 86 px (art-pipeline 7) |

**Gathering tools.** The game has four gathering places (63c-scenery-gather): ore (mine), wood (woods), fibre and
herbs (meadow), crystal (glade). Three tools cover them: a **pickaxe** for ore and crystal, an **axe** for wood and a
**sickle** for fibre and herbs. The heroes are drawn with **empty fists** and code draws the tool in their hands, so
one set of 8 poses serves all three tools. Code also adds the chips, sparks, wood splinters and cut grass.

Received 2026-09-30 for Wren, Tobin and Pip as one 8-pose sheet each (large, soft-edged). A script shrinks each pose
to the 224x192 canvas and snaps it to the hero's palette; a Tobin trial came out clean. Pose order on the sheets:
1 rest, 2 arms forward, 3 fist at the shoulder, 4 arms overhead, 5 low swing, 6 low crouch, 7 level punch, 8 rest.

### Prompt: gathering poses (one hero per request, for new heroes)

> Same character as the attached sprite and palette: [name]. Draw **8 complete full-body sprites** as one sheet,
> facing right, the same height and style as the attached sprite, strict pixel art, a clean 1-pixel dark outline,
> only colours from the attached palette. **The hands are empty fists**: the character mimes holding a tool with
> both hands, and I draw the tool myself. The face stays visible and calm. No chips, sparks or effects.
> 1. Rest: both fists together low in front, ready stance.
> 2. Arms forward: both fists pushed forward at chest height.
> 3. Fists back over the right shoulder.
> 4. Arms overhead: both fists raised above the head.
> 5. Low swing: fists swung down in front at knee height, weight forward.
> 6. Low crouch: crouched, fists drawn back at hip height.
> 7. Level punch: fists thrust level at waist height.
> 8. Rest again, as pose 1.
> Transparent background, all 8 on one contact sheet in two rows of four.

### Prompt: Wren's death poses

> Same character as the attached sprite and palette: Wren Hollowmere. Draw **2 complete full-body sprites** on
> 224x192 transparent canvases, facing right, feet (or knees) on the anchor (96,132), same scale and palette, strict
> pixel art, 1-pixel dark outline, no bat and no bow string (code adds them).
> 1. Kneeling: down on one knee, one hand on the ground, bow held loosely in the other hand, head lowered but the face visible.
> 2. Fallen: lying on her side on the ground, facing the viewer, eyes closed, bow beside her.
> Export each pose as its own PNG, plus a contact sheet.

## 2. Enemies (Region 1)

Seven areas: Mossy Hollow, Batwing Caves, The Bonefield, Beetle Barrows, Fungal Deep, Quarry Ruins, Wraithmarsh.
Each needs its regular foes, its zone boss, and the region boss (the Fenmother). No walking poses (lane combat is
scrapped). Per enemy: **idle, attack wind-up, attack, hurt, death**, facing left, sized by band (art-pipeline 9:
swarm 24-36 px, normal 48-64, brutes about 96, bosses bigger). Bosses and elites also need a **heavy wind-up** pose
(the telegraph players parry or dodge) and a **staggered** pose. A full list of enemies per area comes with the
first enemy request.

## 3. Backgrounds (paused by the owner)

Mossy Hollow v3 needs the road fix, then the other six Region 1 areas. They wait for the landscape layout.

## 4. Icons

The draft icons in docs/design/mockups/combat-screen.html are drawn in code (24x24). Keep them, or ask GPT for a
matching icon sheet later.
