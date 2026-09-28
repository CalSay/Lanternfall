# World map: art study (MAP0)

Status: options for the owner (2026-09-28). This is a study only: nothing in `src/` changed.
It comes before UX-W1 to W3 (plan-4.md 6.4: "The map must be designed well").

The owner said the draft (`img/ux/w-map.png`) looked "really sub-par", and the weak part was the map
icons and landmarks. The draft had flat grey rocks, a road of tiny yellow squares, and sprites
that did not match the B1 characters. This study offers three finished directions. Each one keeps
the layout from ux-overhaul.md section 7 (head row, region chips, one vertical scroll of region
plates, the expedition bar, the bottom tabs), and each redraws the map and every landmark in B1.

![overview](img/map/map-overview.png)

| File | What it shows |
|---|---|
| `img/map/map-overview.png` | The three phone screens side by side |
| `img/map/map-a-screen.png`, `map-b-screen.png`, `map-c-screen.png` | 360 x 740 (rendered at DPR 2), the Hollow, mid save (zone 17) |
| `img/map/map-a-full.png`, `map-b-full.png`, `map-c-full.png` | The whole scroll on the late save (zone 38): the Hollow lit, the Coast reached, Beyond locked with the raid |
| `img/map/map-a-closeups.png`, `map-b-closeups.png`, `map-c-closeups.png` | Every landmark at 3x, plus one slice of each of the 5 regions, lit and locked |

Prototype (scratch code, not loaded by the game): `prototypes/map-study/`. Open
`index.html?style=A|B|C&view=screen|full|sheet` in a browser, or `?view=overview`. It loads the
real B1 kit (12a-12f, 60b) only to take the hero's 16 x 16 portrait for the You marker.
`node prototypes/map-study/shots.mjs [out] --fonts <dir>` re-renders every PNG (Playwright and
`/opt/pw-browsers/chromium`, like `tools/perf.mjs`).

Saves used: **mid** is zone 17, level 21. Bands I and II are lit, band III is half lit, IV and V
are dark, the Great Lantern is dark, one team is out on band I, and the Tavern and Almanac have
dots. **Late** is zone 38. The Hollow and its Great Lantern are lit, the Coast has lamps 36-37 lit,
one team is out and one is back, and the Ashen Wyrm raid is live on the Beyond plate.

## What all three share

- **B1 rules on every sprite** (art-direction.md): 3 tones per material lit from the top left,
  hand-placed section lines where one piece sits on another, and a 1 art px ink outline `#120B18`.
  Everything shows at whole-number scales: 2x on the map, 3x on the sheets. Nothing is drawn
  at a fractional scale.
- **Lit vs unlit is the whole picture, not just the lamp.** Each plate is painted once in full
  colour, then relit. Pixels inside a lit lamp's reach keep their colour and get a warm banded
  pool near the flame. Pixels outside it take the style's "dark" palette. The edge between them
  is one dithered band (SNES style), not a gradient. Hollow's Rest is always lit (the Hearth). A lit
  Great Lantern lights its whole region. So a player sees how far they have come in one glance,
  and each new lamp pushes the light a little further down the road.
- **One lamp per zone, 7 per band, 5 bands per region.** The road runs one row per band, as in
  ux-overhaul 7.2, and the band flags and zone ranges are DOM. Lamps are lit when `zone < maxZone`.
- **Pins are DOM over a baked plate** (spec 7.2-7.3). Each pin is its sprite at 2x, with a label
  chip and the ember dot. Labels are clamped inside the plate. Each style has its own label skin:
  a JRPG window (A), ink on a parchment slip (B), or a dark chip with a lamplight underline (C).
- **You** is the hero's real portrait (from `ART.portraitCanvas`, 16 x 16) framed in that style's
  frame, always at 2x (32 CSS px). The spec's 24 CSS px would be a 1.5x scale, which B1 forbids.
- The Almanac post stands at the camp gate on the road. The Deepwell is beside the camp. The Great
  Lantern is on Lantern Hill above the camp (lore.md 8.1). The raid pin sits on the Beyond plate,
  lit and tappable, with the Beyond chip's red dot (spec 7.5).

## A. Dusk overworld

![A](img/map/map-a-screen.png) ![A full](img/map/map-a-full.png)

**Pitch:** a 16-bit JRPG world map seen from above at a 3/4 tilt. It has 12 x 12 grass tiles,
round-canopy forests outlined as one mass, Lantern Hill as a cliffed plateau with stairs and a
waterfall, a stream with plank bridges at every road crossing, a marsh pond, graves, barrows,
mushrooms and a quarry. The land past your last lamp waits in the night palette.

- **Palette.** Grass `#6E9E52 #4C7E40 #35613A #22442E`. Road `#A48558`, edge `#6A5034`. Water
  `#24587A #2E6A84 #4A8AA0`. Stone `#B8B0C2 #88809C #5C5474 #3A3450`. Roof `#DA6A4E #AC443A #76292E`.
  Canvas `#F4E8C6 #D4BE90 #A08660`. Gold `#FFE08A #E4B44A #A8762A`. Lamp glass `#FFD27A`, core
  `#FFF3C4`, dark glass `#5A6072`. **Night:** every colour is desaturated 55% and mixed 62% toward
  `#0C1224`.
- **Sprites (art px, plus a 1 px outline):** Hollow's Rest 40 x 27 (command tent with a pennant, two
  tents, the fire, a lantern pole, a woodpile). Tavern 26 x 24 (gable roof, gable window, planks,
  two lit windows, mug sign, chimney). Deepwell 24 x 24 (roofed winch, stone ring, blue glow).
  Great Lantern 16 x 32 (plinth, column, gold cage; lit or cold glass). Ashen Wyrm 26 x 24 (on an
  ember crag). War horn 12 x 12. Almanac post 16 x 20. Road lamp 5 x 10. You 22 x 26 (gold ring with
  a tail). Team 20 x 13 (three walkers and a banner). Band flag 8 x 10. Locked gate 24 x 18.
  Stamps: tree 14 x 16, pine 11 x 16, rock 8 x 6, grave 4 x 5, barrow 16 x 8.
- **Reads at phone size:** very well. It is the most "map-like" of the three: you see geography,
  and every place stands on its own clearing. The road is the lightest thing on the plate. Lamps
  are the smallest of the three (10 x 20 CSS px) but read through their light pools.
- **Five regions:** each region gets a tile palette and 2-3 stamps. The Coast has a sea, shingle
  and pines, with Saltreach Light on a rock. The Emberwaste has ash ground, lava cracks and dead
  trees. The Pale Reach has snow and frosted pines. The Long Stair has cave floor and glowing
  crystals. See the strip at the bottom of `map-a-closeups.png`.
- **Locked region (next or Beyond):** the dim palette from spec 7.11 (desaturated 80%, mixed toward
  `#1E1A20`), dark lamps, and a barred gate with a gold padlock across the road.
- **Weak points:** it looks like many other RPG maps. The lanterns are only one theme among trees,
  rocks and water. It needs the most terrain stamps per region.

## B. Lampwright's chart

![B](img/map/map-b-screen.png) ![B full](img/map/map-b-full.png)

**Pitch:** an old parchment map in sepia ink, as the Lantern Order's lampwrights would have drawn
it. It has tree marks, hatched hills, ripple lines, a ruled road and a compass rose. Crisp B1
landmarks sit on it like stickers: an ink outline plus a 1 px pale "cut" edge. **The chart is only
coloured where your lamps are lit.** Past the last lamp it is bare ink on smoke-stained paper. Lit
lamps are gold leaf, and dark lamps are bare ink outlines.

- **Palette.** Paper `#EADAB0 #DCC897 #C9B07C` with a burnt edge `#A88C5C`. Ink `#2E2018`, light
  ink `#6A5238`. Cut edge `#F6EBCB`. Washes, multiplied onto the paper: meadow `#DCE8B4`, forest
  `#B8D08C`, water `#A8C8D0` / sea `#9CC0CC`, road `#F0C890`, camp yard `#F2D8A8`. Gold leaf `#FFE890
  #E8B84A #A8762A #6A4418`. Red wax `#E0524F #9A3A30 #6A2428`. **Unlit (soot):** the bare
  (unwashed) chart is desaturated 45% and mixed 46% toward `#3A2E26`.
- **Sprites (art px, plus ink and cut edge = 2 px):** Hollow's Rest 42 x 28 (low palisade, lantern
  pole, a big and a small tent, the fire). Tavern 24 x 28 (a timber-framed two-storey house, a stone
  ground floor, lit windows, mug sign). Deepwell 22 x 26 (stone arch, pulley, blue light rising).
  Great Lantern 22 x 36 (a lamp tower with gold-leaf rays when lit). Ashen Wyrm 32 x 24 (a serpent
  diving through the ground, "here be dragons"). War horn 12 x 11. Almanac post 20 x 22 (a signpost
  with a nailed page). Road lamp 7 x 9 gold / 5 x 9 ink. You 22 x 28 (a red wax map pin with a
  gold-leaf rim). Team 14 x 18 (a pennant token on a wax disc). Band flag 7 x 9. Locked seal 18 x 18
  (red wax with a padlock). Ink marks: tree 5 x 5, pine 5 x 6.
- **Reads at phone size:** landmarks and gold lamps read best of the three against the light
  paper. The "colour comes back" idea is lovely, but it is the subtlest lit vs unlit read (warm
  green-gold vs grey-brown). The parchment is the one light surface in a dark UI.
- **Five regions:** one sheet per region, with torn top and bottom edges, so a region appends as a
  new leaf. Each region changes only its land wash and its ink mark: trees, pines and sea,
  dead trees and ember dots, peaks with hatching, or cut stair steps.
- **Locked region:** a blank, soot-darkened sheet with a fold, faint pencil marks where the road
  will go, and the red wax seal with a padlock. It is the most story-like locked state ("not yet
  charted").
- **Weak points:** a bright plate on a dark game. It moves furthest from the stage's look, and the
  ink marks can get busy in dense forest.

## C. Lamplit terraces

![C](img/map/map-c-screen.png) ![C full](img/map/map-c-full.png)

**Pitch:** the region at night, seen from the side like the fight stage. The Lantern Road zigzags
down the hillside in **5 stone terraces, one per band**, joined by stairs at alternate ends. Each
zone has a tall lamp post (the same lantern shape as `63-scenery.js`) and **a small picture of
that zone beside it**: moss and fireflies, a cave mouth, graves, a barrow door, giant caps, cut
stone, and reeds. Because the 7 zone types repeat in every band, each terrace reads as "the 7
places, again, deeper". Lit lamps light their stretch of terrace in warm bands. The rest of the
hill is a cold blue silhouette. Hollow's Rest, the Tavern, the Deepwell and the Almanac line the
camp plateau under the moon, and the Great Lantern stands on Lantern Hill.

- **Palette.** Sky bands `#0A1022 #0E1628 #132034 #1A2C40`, dithered. Terrace lip `#5E9A4A`, road
  `#8A6A44 / #6A5034`, retaining wall `#7A7490 #5A5470 #3A3450`, backdrop ridge `#1C3438`, pines
  `#1E4238 / #2A5444`. Lamp glass as the stage: `FLAME #FFBA60`, glass `#FFD27A`, core `#FFF3C4`,
  dead glass `#4A5064`. **Night:** every colour is desaturated 50% and mixed 62% toward `#080C1A`.
  A soft glow layer (art size, smooth, `screen` blend) sits on top.
- **Sprites (art px, plus a 1 px outline):** Hollow's Rest 50 x 30 (two tents, a rope of five
  little lanterns over the fire, logs). Tavern 32 x 32 (two storeys of lit windows, a lantern by
  the door, mug sign, smoking chimney). Deepwell 26 x 32 (a well house with a beam of blue light
  through the roof). Great Lantern 22 x 46 (a lantern on a tall banded column). Ashen Wyrm 32 x 28
  (wings up on a burning crag, with a red glow). Almanac post 18 x 26 (a notice board with its own
  lamp). Road lamp 9 x 21 (the tallest thing on a terrace). You 22 x 30 (your portrait as the glass
  of a lantern). Team 22 x 16 (walkers, the first carrying a lantern on a pole). Band flag 7 x 9.
  Locked gate 28 x 26 (chains and a dark lantern). Zone vignettes 16 x 16 each (7).
- **Reads at phone size:** the clearest progress read of the three. Lit terraces glow and dark ones
  are silhouettes. Each terrace is an 84 CSS px row, which is exactly the band's tap target (spec
  7.3). Lamps are big (18 x 42 CSS px). It matches the stage (same lanterns, same banded light, same
  night) and the B1 characters best. The zone vignettes give the band sheet a preview for free.
- **Five regions:** each region swaps its backdrop and terrace palette: sea behind the Coast's
  terraces with Saltreach Light at the end, a red sky and ash for the Emberwaste, snow peaks and an
  aurora for the Pale Reach, a cave ceiling with crystals for the Long Stair. The road itself goes
  down the whole way, which fits the Long Stair ending (lore.md 8.4). Each region needs its 7
  vignettes (16 x 16), which can share the stage's zone art.
- **Locked region:** pitch night (desaturated 70%, mixed 70% toward `#06060C`), the road running
  off into the dark, and a chained gate with a dark lantern. Beyond shows the raid foe lit against a
  red horizon.
- **Weak points:** it is a road more than a map; there is no left-right geography. Plates are a bit
  taller (Hollow 316 art px vs 300; Coast 276 vs 236). The camp plateau is tight at 360 px: four
  places share one row, and the Great Lantern's label goes to its left. Unlit regions are very dark,
  so the Next state leans on the header note and the gate.

## Side by side

| | A. Dusk overworld | B. Lampwright's chart | C. Lamplit terraces |
|---|---|---|---|
| View | top-down 3/4 | top-down chart with pictorial stickers | side view, terraces |
| Lit vs unlit | full colour vs night palette | colour washes vs bare ink and soot | warm light vs blue silhouette (strongest) |
| Lanterns as the main visual | medium | medium (gold leaf) | **high** |
| Match with the B1 stage | good | lowest (light paper) | **best** (same lamps, light and night) |
| Geography, "a map" | **best** | good | weakest |
| Landmark readability | good | **best** on light paper | good (lit windows, glows) |
| Art per new region | palette + 3 stamps | wash + 1 mark | backdrop + 7 vignettes |
| Plate size (Hollow / Coast / Beyond, art px) | 180 x 300 / 236 / 84 | 180 x 300 / 236 / 84 | 180 x 316 / 276 / 90 |

## Performance (perf.md, ux-overhaul 7.12)

All three styles meet the spec's budget. Every plate is baked once to a canvas at art size (180 px
wide) and shown at 2x with `image-rendering: pixelated`. There is no `requestAnimationFrame`. Only
the ember dots, and optionally the camp fire and raid pin, animate, in CSS with `steps(2)`, and not
under reduced motion.

- **The study's own bake times** (desktop, unoptimised): 110-210 ms for the Hollow, 20-50 ms for
  the Coast, and 6-40 ms for Beyond. The study code keeps colours as hex strings in JS arrays and
  tests every pixel against every light. That is fine for a mockup but not how to ship.
- **How to ship it under 4 ms desktop / 16 ms phone per plate:** paint into a `Uint8Array` of
  **palette indices** (each style uses about 40-60 colours). Keep two small palettes per region:
  lit and dark (plus the warm tints). Then relighting is a palette swap per pixel, done only inside
  each light's bounding box (a lamp is about 50 x 50 px). The first paint is about 54,000 index
  writes plus 35 light boxes, and a new max zone repaints one box. It writes to the canvas with one
  `putImageData`. Stamps (trees, vignettes) are pre-indexed arrays copied in. The plate costs 216
  KB of RGBA per region, as the spec estimates.
- **Glows.** A and B need none: the banded pools in the plate are the light. C wants a soft glow
  layer. Bake it once at art size (180 x 316 canvas, radial gradients), let CSS scale it with
  smoothing, and composite it with `mix-blend-mode: screen`. That adds one extra layer per plate
  on the compositor and no main-thread work while scrolling. If the blend layer costs too much on
  a low-end GPU, bake the glow into the plate at 1x CSS instead (360 x 632 x 4 B = 0.9 MB for the
  Hollow).
- **DOM:** per region, 5-6 pins, 5 flags, 5 zone labels, You and the teams (about 20 nodes, under
  the spec's 40).
- **Sprites:** landmarks are fixed small maps (the largest is C's Hollow's Rest, 52 x 32) baked with
  the plates in `idleTask`. Nothing is animated inside a canvas.

## Recommendation

**C, Lamplit terraces**, with two borrowings.

Why C: the brief is "keep the lantern/lamp theme and show lit vs unlit progress clearly", and C
does both hardest. The lamps are the biggest, brightest thing on the map, and a lit band against a
dark one reads from across the room. It is the same world as the fight stage (the same lantern
drawing, banded light and night), so opening World feels like stepping back from the stage rather
than into a different game. The owner's complaint was the landmarks and icons. In C they are big,
lit, side-on buildings in the characters' B1 style, and the zone vignettes add seven small
landmarks per band that the other styles do not have. Each terrace is also exactly one band's tap
row, so the layout in ux-overhaul 7 needs no change.

Borrow from B: **colour returns where the light does.** C already relights. Keep the unlit
palette cold but a touch lighter than in these PNGs, so a Next region's shapes still read. Borrow
from A: **give the top a real place.** Make the camp plateau two tiers: Lantern Hill and the Great
Lantern above, and the Tavern, Hollow's Rest, Deepwell and Almanac on the plateau. That gives
labels room at 360 px (they are tight now), and pins stay 48 px apart.

If the owner wants a map with geography first, A is the runner-up. It is the lowest risk and scales
cleanly with palettes and stamps. B is the most charming but pulls furthest from the game's dark
B1 look, so I would keep its "coloured only where lit" idea rather than the parchment itself.

**Next steps for UX-W1 (if C is chosen):** port `style-c.js` to an indexed-palette painter in
`13d-art-world.js` (`WORLD_MAP` rows become terrace ground lines). Share the lamp and lantern
pieces with `63-scenery.js`. Draw the Coast's 7 zone vignettes. Add the checks from ux-overhaul
7.10: one `WORLD_MAP` block per region, 5 rows, pins 48 px apart, and a plate 180 art px wide.
