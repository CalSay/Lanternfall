# Art direction

Status: chosen by the owner on 2026-09-27 after the side-by-side in `prototypes/art-styles.html`.
Reference build: `prototypes/characters.html` (the rig, the layer system and the tier ramps).

## 1. The style: Hi-bit with smooth lighting

- **Hi-bit pixel art.** Characters are real pixels, about 56 to 64 art px tall, drawn at
  1 art px per CSS px (2 or 3 device pixels on a phone). Pixels stay crisp (nearest-neighbour).
- **Smooth lighting on top.** Lantern glow, bloom, fog, spell light and vignette are drawn at
  device resolution with gradients, never pixelated. Light is the mood: warm lantern-lit dark
  fantasy, not grimdark.
- **Parallax backgrounds.** 4 to 5 pixel layers per zone (sky, far, mid, ground, foreground).
- **Font and UI.** Pixelify Sans for display, IBM Plex Sans Condensed for body. Panels keep the
  current plum and ember palette.

## 2. Palette and material ramps

Base palette: bg `#140F1A`, ink/outline `#0B0810`, ember `#FF9E3D`, gold `#F2C14E`,
hp `#E0524F`, xp `#6FCB6A`, arcane `#B58CFF`, bone `#EFE6D6`.

Every material is a **4-tone ramp** generated from one base colour (`ramp()` in the prototype):

| Tone | Rule |
|---|---|
| Highlight | lighter by 16 (metals 30), hue shifted up to 10 degrees toward gold, less saturated for metals |
| Base | the material colour |
| Shadow | darker by 17, hue shifted up to 14 degrees toward plum (265) |
| Deep | darker by 32, hue shifted up to 24 degrees toward plum; also the lit-side outline colour |

Rules:
- Light comes from the top-left (the lantern side). Shading is baked per part: a lit rim,
  base, a shadow side with a 1px checker dither into it, and a deep edge.
- A part covered by another part above it gets one step darker (cast shadow).
- **Selective outline:** the exterior silhouette is outlined 1px. On the lit side the outline
  is the part's deep tone; on the shadow side it is ink. No black lines inside the figure.
- Emissive parts (lantern glass, eyes, gems, coals, runes) are flat bright colours and each one
  also registers a light for the lighting pass.
- Max about 6 materials per character plus emissives, so figures stay readable at 1x.

## 3. Proportions and silhouettes

- **6.5 to 7 heads tall.** Base body: feet at 0, knees -16, hips -30, waist -34, shoulders -48,
  chin -52, top of head -62 (art px). Real shoulders, a waist, two-part limbs and hands (a hand
  plus a thumb shape). No chibi heads.
- **Faces readable but restrained:** one eye, a brow, a nose, a small mouth. Helmets and hoods
  may hide the face; a hood shades the eyes and leaves a small lit eye.
- **Three-quarter view facing right** for the party, facing left for enemies.
- Silhouettes must differ at 1x by height, headgear and the held item: greathelm vs circlet vs
  hood vs mitre; blade vs staff vs bow vs censer. Colour alone is never the only difference.
- Companions can vary height (scale 0.9 to 1.0) and build (Tobin is short and stocky, Elowen tall
  and slender).

## 4. Sprite sizes

| Thing | Native size (art px) | Notes |
|---|---|---|
| Party member | 56 to 64 tall, up to 44 wide with weapon | box -20..22 x -76..1 around the feet |
| Normal enemy | 30 to 64 | bats small, golems big |
| Zone boss | 72 to 96 | |
| Raid wyrm | 120+ | |
| Portrait | the same sprite, head and shoulders crop, shown at 2x | no separate drawing |

## 5. Animation frames

| Animation | Frames | Timing |
|---|---|---|
| Idle | 2 (torso and head sink 1px) | 600ms each |
| Attack | 3: wind-up, strike, recover (recover reuses idle) | 250 / 300 / 150ms |
| Cast | 2 (reuse wind-up and strike with the cast pose) | |
| Hit | 1 white flash (generated) plus knockback | 80ms |
| Down | 1 | |
| Dash, leap | reuse the strike frame; movement is a position tween | |

Poses are bone values, not new drawings (section 6.2), so each frame is a bake of the same layers.

## 6. Layered equipment (paper-doll)

### 6.1 Layers

A character is a **base body** plus **ordered layers**. Every drawing is a list of shapes, and
each shape names its layer, its bone and its material.

| z | Layer | Examples |
|---|---|---|
| 0 | Back | cloak and hood drape, quiver, long hair, mitre lappets, halo |
| 1 | Back arm | back arm, back sleeve, back pauldron, back vambrace |
| 2 | Legs | trousers, boots, greaves, sabatons |
| 3 | Body | tunic, plate, robe, leathers, vestments, belt, belt lantern, charm |
| 4 | Head | face, hair, greathelm, circlet, hood, mitre |
| 5 | Off-hand | shield, lantern, tome (held by the back arm, drawn in front of the body) |
| 6 | Front arm | front arm, sleeve, pauldron, gauntlet |
| 7 | Weapon | warblade, staff, bow, censer |
| 8 | Front effects | smoke, sparks, spell light (drawn live, not baked) |

Within a layer, the order of the list decides overlaps.

### 6.2 Bones and pose anchors (why gear stays aligned)

All drawings are made in one shared coordinate space (the base body). Each shape is tied to a
bone: `legs`, `up` (torso), `head` (child of `up`), `armF` and `armB` (children of `up`, rotating
at the shoulder pivots `(5.4, -47.5)` and `(-5.4, -47.5)`). A pose is a handful of numbers:
`up` (breathing), `lean`, `rotF`, `rotB`, `dx`. The same transform is applied to the body and to
every gear layer on that bone, so a pauldron, sleeve, gauntlet and blade move exactly with the
arm through idle and attack frames. Hands are at fixed anchors, front `(6.5, -28.2)` and back
`(-5.9, -28.2)`: every weapon is drawn around those points.

Frames are baked once per equipment change (4 frames: idle 0, idle 1, wind-up, strike), cached,
and drawn as one image per frame.

### 6.3 Tier recolour

A gear drawing does not store colours. It uses material keys:

| Key | Meaning |
|---|---|
| `P` | primary family at the item's tier (Plate: Ore; Robe: Fibre; Bow: Wood) |
| `D` | primary, one step darker (folds, grooves, back faces) |
| `Q` | secondary family at the same tier (grip leather, shield face, arrow shafts) |
| `R` | trim: shown in gold/silver from Rare up, otherwise falls back to `D` |
| `G` | glow accent: an emissive part that only exists from Epic up |
| `L`, `Pc`, `Qc` | lamp glass and crystal parts (crystal becomes emissive from Epic up) |

Families and tiers (from the crafting spec): Ore Copper to Emberite, Wood Oak to Lanternwood,
Crystal Quartz to Emberglass, Fibre Flax to Gloamsilk, Hide Soft to Ember. Each tier has a base
colour and a glow colour; `ramp()` makes the 4 tones. **Class dye:** cloth items blend the fibre
colour 45% toward a class dye (Lanternmage violet, Lightkeeper cream) so a class keeps its identity
across tiers.

### 6.4 Rarity

| Rarity | Look |
|---|---|
| Common | plain material, no trim |
| Rare | trim parts appear (gold edges, emblem, buckle, stole) |
| Epic | glow accents appear (runes, gems, visor glint) and crystals become emissive |
| Legendary | glow accents pulse and shed sparks; bespoke extras (the Greathelm plume) |
| Unique | a bespoke drawing or extra parts on the same bones, plus its own glow colour |

### 6.5 Drawings needed per class

| Item | Drawings |
|---|---|
| Base body | 1 shared body, 3 skin tones and 4 hair colours as ramps, 3 hair styles (short, long, bald) |
| Weapon, Off-hand, Head, Body | 1 drawing each per class (16 total), plus a drawn-bow variant |
| Charm | 1 shared |
| Belt lantern | 1 shared (the hero's identity light when no lantern is held) |
| Uniques | 1 extra drawing each |

So a class needs 4 gear drawings; tiers (5) x rarities (4) come free through ramps and part flags.
That is 20 looks per slot from one drawing. Poses need no extra drawings.

### 6.6 Companions

A companion is the same base body plus a **fixed outfit** (their own drawn clothes and headgear,
fixed materials) plus their **role weapon** and **trinket** as normal tiered gear layers:

| Role | Role weapon layer |
|---|---|
| Tank | Shield (off-hand layer) |
| Striker | Bow (weapon layer) |
| Caster | Staff (weapon layer) |
| Support | Tome (off-hand layer) |

The trinket is a small belt or chest piece (charm, flask, whistle, wick). Signature props
(Tobin's borrowed sword, Hesketh's lighting pole, Elowen's lantern and halo) are part of the outfit.
Upgrading a companion's weapon recolours it on their body, like the hero.

## 7. Lighting pass

- Every emissive part registers a light at bake time (position, colour, size).
- Per frame: radial glow in `lighter` blend plus a small warm core (bloom), with a lantern flicker.
  Legendary lights pulse and shed sparks.
- Fog bands, the moon halo and a vignette are drawn over the scene at device resolution.
- `prefers-reduced-motion`: idle frames freeze, flicker is steady, no sparks or shake.

## 8. Performance budget

- Baking: about 60 shapes x 4 frames per character, done on equipment change (under 50ms on a
  mid phone). Up to 10 characters on screen.
- Per frame: one image per unit, about 1-3 gradient lights per unit, 5 background layers.
