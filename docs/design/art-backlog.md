# Art backlog (owner work list)

Started 2026-09-29, after the new hero art went into the game. Work top to bottom. Every hero prompt follows
art-pipeline.md (224x192 canvas, feet on (96,132), about 96 px tall, Pip 86 px, up to 40 colours, strict pixel art,
draw the prop not the effect). Paste the hero's existing `palette.png` and one current pose with every prompt so
GPT keeps the same character and colours.

## 1. Heroes: what each still needs

| Hero | Fight | Death | Gathering | Notes |
|---|---|---|---|---|
| Wren | done (draw, release, hurt, camp) | **kneel, fallen** | **axe, pickaxe, sickle** (2 poses each) | outline trimmed in code (tools/heroart.mjs) |
| Tobin | done | done | **axe, pickaxe, sickle** | |
| Pip | done | done | **axe, pickaxe, sickle** | optional: redraw natively at 86 px (art-pipeline 7) |

**Gathering tools.** The game has four gathering places (63c-scenery-gather): ore (mine), wood (woods), fibre and
herbs (meadow), crystal (glade). Three tools cover them: a **pickaxe** for ore and crystal, an **axe** for wood and a
**sickle** for fibre and herbs. Each tool needs two poses: **wind-up** and **strike**. Code adds the chips, sparks,
wood splinters and cut grass. That is 6 poses per hero, 18 in all.

### Prompt: gathering poses (one hero per request)

> Same character as the attached sprite and palette: [name]. Draw **6 complete full-body sprites**, each on its own
> 224x192 transparent canvas, facing right, feet on the anchor (96,132), the same height as the attached sprite,
> strict pixel art, a clean 1-pixel dark outline, only colours from the attached palette plus up to 4 new ones for
> the tools. The face stays visible and calm. Leave out chips, sparks and splinters; I add those.
> 1. Pickaxe, wind-up: both hands on the handle, pickaxe raised behind the head.
> 2. Pickaxe, strike: pickaxe swung down in front, head at knee height, weight forward.
> 3. Axe, wind-up: a woodcutter's axe held back over the right shoulder, body turned.
> 4. Axe, strike: the axe swung level into an imaginary trunk at waist height in front.
> 5. Sickle, wind-up: crouched a little, sickle drawn back at hip height, the other hand reaching forward.
> 6. Sickle, strike: the sickle swept forward low through imaginary grass.
> Export each pose as its own PNG, plus a contact sheet.

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
