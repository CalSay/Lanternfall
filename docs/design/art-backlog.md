# Art backlog (owner work list)

Started 2026-09-29, after the new hero art went into the game. Work top to bottom. Every hero prompt follows
art-pipeline.md (224x192 canvas, feet on (96,132), about 96 px tall, Pip 86 px, up to 40 colours, strict pixel art,
draw the prop not the effect). Paste the hero's existing `palette.png` and one current pose with every prompt so
GPT keeps the same character and colours.

## 1. Heroes: what each still needs

| Hero | Fight | Death | Gathering | Notes |
|---|---|---|---|---|
| Wren | done: v4 redesign, 8 poses (draw, release, wind-up, brace, camp, hurt) | done (kneel, fallen) | **on hold: the sheet shows the old hood; redo in the v4 design** | outline trimmed in code (tools/heroart.mjs) |
| Tobin | done | done | done (7 poses; code draws pickaxe, axe, sickle, spear) | |
| Pip | done | done | done (7 poses; code draws the tools) | optional: redraw natively at 86 px (art-pipeline 7) |

**Gathering tools.** The game has five gathering places (63c-scenery-gather and Hunting): ore (mine), gems (glade),
wood (woods), fibre and herbs (meadow) and hide (hunting grounds). Today code draws the pickaxe, axe, sickle and spear in
the heroes' empty fists. Under the art freeze (owner, 2026-09-30) new tools, chips and sparks come from the artist in
the pack; the code-drawn ones stay until a vetted pack replaces them.

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

## 2. Enemies

The roster is `enemies-c22-roster.md` (215 enemies plus 175 Captains), with each monster's moves in its regional
`enemies-c22-*-final.md` card. Poses follow the moves: one pack per monster, its Captain in the same pack. Done and in
the game: the Thorn Imp (zone 1) and Gloomjaw (zone 2). Next: zone 3 onward, in order.

## 3. Backgrounds

Mossy Hollow's painted night background is approved and used for zones 1-7 (2026-10-02). The other areas follow.

## 4. Icons

The C26 icon packs are approved and in the game (resources, gear, actions, menus, statuses). Ability icons: see
`ability-art-brief.md`.
