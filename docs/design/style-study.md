# Style study: five ways to draw the cast

Status: options for the owner to pick from (2026-09-27). Nothing in `src/` has changed.
Prototype: `prototypes/style-study.html` (self-contained; open it on a phone).
Screenshots: `docs/design/img/style-study.png` (full page, 400 px wide) and
`docs/design/img/style-study-zoom.png` (all five line-ups side by side, 3x).

Why: the owner finds the current Hi-bit figures (`art-direction.md`, 6.5 to 7 heads, see
`img/roster-preview.png`) "a little too thin and tall". They also said the clothing "doesn't
feel right" and later that the art "lacks definition between different sections of the
characters". They lean towards 16-bit.

Every direction draws the same cast: the hero as Warden and as Lanternmage, Tobin, Maren,
Elowen, Grenna, Corvin, a Mossy Slime and the Golem Elder. Each one has a 360 x 250 stage (party
of four against two slimes and the boss, 2-frame idle, one attack each in turn), a 3x zoom row
and 48 px portraits. `#dbg=A,B1&s=4` on the prototype URL shows idle, wind-up and strike frames
for inspection. `#dbg=A,B1,B2,C,D&s=3&idle` shows the side-by-side line-up.

## What changed in every direction

- **Stockier bodies.** 3 to 5 heads instead of 6.8. Shoulders are wider than the head, hands and
  boots are big, legs are short.
- **Costumes made of pieces, not tubes.** Every character has layered, shaped parts: pauldrons,
  a tabard or apron with an emblem, a belt with a buckle, straps, pouches, a cloak or robe with a
  clear hem band, chunky gloves and boots. Cloth, leather and metal each look different.
- **Colour blocking.** Each character has one primary, one secondary and one accent colour, taken
  from their brief (party-and-classes.md 3.2):

| Character | Primary | Secondary | Accent | Reads as |
|---|---|---|---|---|
| Warden | royal blue surcoat | steel plate | gold lantern emblem, red plume | knight with sword and heater shield |
| Lanternmage | violet robe | deep plum capelet | ember sash, gold trim, glowing lantern | mage with staff and lantern |
| Tobin | moss green quilted jacket | brown leather | iron pot helm, dented buckler | short squire, sword too big for him |
| Maren | ash grey hooded cloak | dark steel | pale teal light and trim | hood in shadow, tower shield, lantern on it |
| Elowen | cream hooded mantle | white dress | gold stole, halo, lantern | the lantern saint |
| Grenna | brown leather apron | rust shirt, slate trousers | blue kerchief (tank blue), rune on the maul | huge stonemason with a maul |
| Corvin | black hooded coat | bone white clasp and bracers | violet edges and blade glow | no face, twin daggers |

## Section definition (rules for the conversion wave)

The owner's main complaint. These rules are what the prototype renderer does, and the port
should keep them:

1. **Three tones per material, no more.** Highlight, base, shade. No gradients or dithering
   inside a piece. The tone comes from the piece's own volume (light from the top left), so a
   piece is a flat block with a lit edge and a shaded edge.
2. **A section line wherever one piece sits on another.** The pixel of the lower piece next to
   the upper piece becomes the lower piece's *line colour*: a dark, desaturated tone of its own
   material (skin uses a warm brown, never orange or black). This separates hair from face,
   helm from hair, torso from belt, sleeve from glove, pauldron from sleeve, tabard from mail,
   trouser from boot. Pieces of the same material do not get a line unless marked `sep`.
3. **Cast shadow under an overlapping piece.** The pixels directly under a piece that sits on
   top go one tone darker (under the belt, the pauldron, the hood, the chin).
4. **Each section gets its own hue, not a lighter or darker version of its neighbour.** Gloves
   are leather brown against a steel vambrace, a belt is brown against a blue surcoat, a sash is
   ember against violet.
5. **Outer outline on every sprite** (the rule differs per direction, below).
6. **Despeckle.** After shading, any pixel with no same-coloured neighbour takes the colour of
   its neighbours. This kills single-pixel noise, which matters most at 2x.
7. **Faces are pixel stamps, not shapes.** Eyes, brows, mouth and blush are placed as whole
   pixels relative to the head centre, so they never blur, shrink or vanish in a pose.
8. **Small sprites drop detail, not clarity.** At 2x (B1, B2) trims under 1 art px, rivets,
   pouches and quilting are left out rather than drawn as noise.

## A. Chibi

- **Pitch:** "Big heads, big eyes, tiny boots. Cute and bright, and you can read every face."
- **Proportions:** about 3 heads (head 20 art px tall, body 33). Stubby limbs, wide head.
- **Sprite size:** 53 art px tall, drawn at 1 art px = 1 CSS px. Boss about 80 px.
- **Palette:** bright and saturated, a warm dusk background (purple sky, sunset, green meadow).
  Highlights shift toward gold, shade toward plum.
- **Outline:** full 1 px outline in a very dark tone of the neighbouring material (coloured
  outline, not black).
- **Shading:** 3 flat tones, cel-like; big 2 x 4 eyes with a white catchlight, blush pixels.
- **Conversion cost:** a redraw of every head, hood and hat (the head is 2.5x larger, so every
  helm, hood, hairstyle and face is new). Bodies and gear can be re-proportioned from anchors.
  About the same cost as B; the most work per face.
- **Fit:** readable and charming, but it pulls the tone toward cute and away from melancholy.

## B1. 16-bit, bold outline (front-runner)

- **Pitch:** "Classic console heroes. Chunky pixels and a bold black outline, readable from
  across the room."
- **Proportions:** about 4 heads (head 9 art px of 35). Chunky torso, short legs.
- **Sprite size:** 35 art px tall, drawn at **2x** (70 CSS px, so 2 x 2 device pixels per art px
  on a 1x screen, 4 x 4 on a phone). Slime about 16, Golem Elder about 46 art px (92 CSS).
- **Palette:** the character's 3 colours plus skin and hair; max about 6 materials, 3 tones each.
  Background: SNES-style forest with a canopy ceiling, trunks, dithered dusk sky, tiled grass.
- **Outline:** full 1 art px outline in ink `#120B18` (2 CSS px on screen).
- **Shading:** 3 tones, light top left, section lines in the material's dark.
- **Conversion cost:** see "Conversion" below. It is the cheapest of the five to *draw* (fewer
  pixels, detail is dropped rather than drawn), but it needs the 2x draw path in the stage.
- **Fit:** the clearest at a glance. Every piece is its own colour block with a dark edge.

## B2. 16-bit, soft outline

- **Pitch:** "The same console look, a little taller, with outlines tinted on the lit side so gear
  colours glow."
- **Proportions:** about 4.5 heads (head 8.6 of 38). Slightly longer arms and legs than B1.
- **Sprite size:** 38 art px tall at 2x (76 CSS px).
- **Palette:** same as B1.
- **Outline:** selective. Outline pixels on the lit side (top and left) use the neighbouring
  material's line colour; on the shadow side they use ink.
- **Shading:** as B1.
- **Conversion cost:** as B1.
- **Fit:** B1's clarity with a softer, warmer edge. Slightly less punchy on busy backgrounds.

## C. Sturdy storybook

- **Pitch:** "Sturdy heroes in heavy gear, in warm book-illustration colours with thick ink lines."
- **Proportions:** about 5 heads (head 12.6 of 60). Broadest shoulders (22 px), big hands (7 px)
  and long boots.
- **Sprite size:** 60 art px tall at 1x. Boss about 90 px.
- **Palette:** every colour is pulled 10% toward warm parchment; highlights go gold, shade goes
  cool plum. Background: golden-hour hills, big oaks, soft light shafts.
- **Outline:** thick ink `#24140E`: 8-way first ring plus a second ring, so lines read as 2 px.
- **Shading:** 3 flat tones with the widest bevel (3 px), so pieces look rounded and heavy.
- **Conversion cost:** lowest redraw: 5 heads is close to today's build, so the current rig
  shapes can be re-proportioned (shorter legs, wider torso) and then retouched. The heavy
  outline and the palette are renderer changes.
- **Fit:** handmade and heavy, good for forging. Figures are the largest, so the stage is fuller.

## D. Lamplit (wildcard)

- **Pitch:** "Sturdy little heroes carried by lantern light: warm faces, blue night, cool
  moonlit edges."
- **Why:** light is what Lanternfall is about, so make light the style: cosy, readable 4-head
  figures lit warm by their lanterns, with a cool night around them for the melancholy.
- **Proportions:** about 4 heads (head 14 of 55).
- **Sprite size:** 55 art px at 1x.
- **Palette:** base colours pulled toward dusk (less saturated, slightly blue); highlights mixed
  28% toward lantern orange; shade shifted toward blue. A 4th colour per material is a cool rim
  (moonlight) on right-facing edges. Background: night pines, moon, a rope of little lanterns,
  lantern posts, fireflies, low fog.
- **Outline:** selective (lit side in the material's line colour, shadow side ink).
- **Shading:** 3 tones plus the rim, and strong lantern glows drawn at device resolution.
- **Conversion cost:** as A or B for the figures; the lighting is mostly the current lighting
  pass turned up, plus the rim step in the baker.
- **Fit:** the most atmospheric. The darkest palette, so enemies rely on glowing eyes and edges.

## Conversion: what it costs with the current rig pipeline

The current pipeline (`src/js/12-art-rigs.js` data, `src/js/60b-baker.js` baker) has the right
bones: parts with a z layer, a bone and a material key, poses as bone values, tier recolour by
material keys (`P`, `D`, `Q`, `R`, `G`), and lights from emissive parts. All of that stays.

What does not survive is the **shape data**: every part is written in absolute coordinates for
a 6.8-head body (for example the plate is `['p', 1, -6.5, -48.4, 6.4, -48.4, ...]`). A uniform
scale does not fix proportions, because the head must grow while the legs shrink and the torso
widens. So:

1. **Re-proportioning by remap (C only).** A piecewise remap of y (head band up-scaled, legs
   compressed) and x (widened) gets 5 heads close enough to retouch. Gets C most of the way.
2. **Anchor-relative authoring (A, B1, B2, D, and the cleanest path for C too).** The prototype
   writes every piece relative to body anchors (`shY`, `waY`, `hiY`, `sw`, `hipW`, hand points,
   head centre and size). One outfit then works at 3, 4, 4.5 and 5 heads, as the study shows:
   each character is drawn once and rendered in all five directions. Porting means rewriting
   each outfit in that form. It is a redraw of the data, not of the pipeline.

Estimated work for the chosen direction (one agent, anchor-relative path):

| Job | Size |
|---|---|
| Baker: anchors, 3-tone ramps, section-line pass, cast shadow, despeckle, outline rule, face stamps | about 1 day (ported from the prototype) |
| Stage and portraits: 2x draw path and 16 px portrait crop (B only), new foot line and slot spacing | half a day |
| 4 hero classes: base body + 16 gear drawings (4 slots x 4 classes), tier and rarity keys kept | 1 to 1.5 days |
| 18 companions: outfit + role weapon + trinket each (the 5 in the study are done) | about 1 hour each, 2 days |
| Enemies (8 rigs) and bosses: enemy rigs are not human-proportioned; they need the new tones, lines and outline and a size pass | 1 day |
| Scenery: new palettes per zone in the chosen style (the study has one forest per style) | 1 to 2 days |

About 6 to 8 agent-days in total for A, B1, B2 or D, and about 5 for C.

Save data is untouched: gear keeps its tier and rarity; only the drawings change.

## Recommendation

**B1 (16-bit, bold outline), with D's lantern lighting on top.** It answers all three complaints
directly: stocky 4-head figures, costumes that read as separate coloured pieces, and the
strongest section definition of the five (ink outline, section lines, 3 tones, 2x pixels). It
reads best at 1x on a phone and is the cheapest to draw per character, because small detail is
left out instead of drawn as noise. The warm lantern glows, pulses and night palette from D can
sit on a B1 stage without changing the sprites, which keeps the cosy-but-melancholy mood.

If the owner finds B1 too harsh, B2 is the same work with a softer outline.
