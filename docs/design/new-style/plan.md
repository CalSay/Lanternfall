# New art style plan: scenery, gathering, nodes and monsters to match the route S heroes

Card: `autopilot/cards/new-style-art-plan.md` (planner spec, Opus high). Base: `9685be4a` (ruling #328 merged).
Origin: Cal, 10 Oct 01:09: "we need to do the new backgrounds and paths etc (all layers of the environment) to match the new art
style of the heroes and we also need to do the same for gathering and the resource nodes / monsters". His notes on the zone 1
test at 01:20 (a floating layer; hero and foe hard to tell from the background), 01:23 (heroes bigger), 01:26 and 01:29 (the
pine node: the tier's own tree, huge, off the top, notch where the axe lands, no logs, no pickaxe by the ore).

This is a plan. It makes no art, spends no Scenario credits and wires nothing. Everything measured here was measured on scratch
copies of the zone 1 test (`/mnt/project-files/experiments/new-style-plan/`, with its scripts).

## 0. The plan in plain words

- **What changes.** Every place the heroes stand gets redrawn in their style: the 7 areas' scenery and roads, the 4 gathering
  scenes and their nodes, all 43 Chapter 1 monsters (and their Captains as recolours), the 3 hunting beasts and the camp.
  Icons stay Codex's.
- **How.** Codex draws a concept for each new monster; Scenario makes the sheets from that concept plus the zone 1 sample;
  the sheets are cut and cleaned without redrawing; the game draws light and motion effects; an Opus art judge rules on each
  whole pack after a red team.
- **Order.** The first hour first: Mossy Hollow (z1-5), Batwing Caves (z6-10), the four gathering scenes with their tier 1-2
  nodes, the hunting beasts and the camp. That is 8 packs, about 104 sheets, about 1,870 credits. The other 5 areas and the
  higher node tiers follow, about 148 sheets and 2,660 credits.
- **Two things must be true first.** Cal extends the Scenario rule from hero poses to scenery, nodes and monsters (section 7,
  D1). The hosting split must be live, because the one-file page is already full with the new heroes (section 5).
- **Two findings from the zone 1 test.** The 01:20 darkening fix did not make the actors easier to see by measure; a haze
  grade does (section 3.2). And a layered painted scene costs about 8 times the 190 KB background ceiling if it stays lossless
  (section 5.1).

## 1. Inventory

Counted at `9685be4a`. "Today" is what the game draws now; "new" is what the new style needs.

| Asset | Today | Count | Source | New style needs |
|---|---|---:|---|---|
| Areas (Chapter 1) | 35 zones in 7 areas of 5: Mossy Hollow 1-5, Batwing Caves 6-10, The Bonefield 11-15, Beetle Barrows 16-20, Fungal Deep 21-25, Quarry Ruins 26-30, Wraithmarsh 31-35 | 7 | `src/js/22-data-regions.js:60-67`; `docs/design/enemies-c22-roster.md:13-19` | 7 scenery sets |
| Area scenery | Codex's Mossy Hollow painting (one flat 960x540 picture, road at 0.770, no parallax; 480x900 upright copy) in z1-8, 15, 22, 29; procedural scenes elsewhere | 1 painting + 11 procedural themes | `src/js/21zb-data-bgart.js:4`; `src/js/63-scenery.js:175-200`; `22-data-regions.js:83-86` | 7 sets |
| Parallax layers | Procedural scenes: sky, far, mid, ground, fore at [0.05, 0.2, 0.5, 1, 1.35] | 5 a scene | `63-scenery.js:225`, `:814-819` | 4 a set: sky+far, mid, ground (with the road), fore |
| Paths (roads) | Painted inside each theme's ground layer, art rows G-1 to G+7, per theme (forest dirt road `:401`, barrow slabs `:490`, marsh planks `:580`); not tiled | 1 a theme | `63-scenery.js:362-367` | Inside each set's ground layer, tiling across the width (the zone 1 road already tiles) |
| Gathering scenes | gmine (ore), gwoods (wood), gmeadow (fibre and herb), gglade (crystal); each shows 3-5 nodes of the picked kind and tier | 4 | `src/js/63c-scenery-gather.js:1-12`, `:32` (`THEME` map), `:300-315` | 4 sets |
| Resource nodes | 5 rigs (ore, wood, crystal, fibre, herb) x 5 tiers; tiers are recolours with added detail; 4 frames (idle0, idle1, wind, strike) | 25 | `src/js/13-art-enemies.js:517-567`; `src/js/11-art-craft.js:128,152,173`; names `src/js/20-data.js:43`, `src/js/21-data-craft.js:154-156` | 25 stills (each tier its own drawing, Cal 01:26), with chips |
| Zone monsters | Thorn Imp and Gloomjaw are Codex packs (7 actions, 55 and 67 frames); the rest are 7 procedural rigs of 4 frames (slime, bat, bones, beetle, spore, golem, wraith) | 35 designed (2 drawn) | `world-structure.md:22-27`; `src/js/21za-data-foeart.js:7`; `20-data.js:4-11` | 35 packs of 8 key frames |
| Captains | A recolour of the zone's monster plus an extra move, inside its pack | 35 | `world-structure.md:29` | A palette in data plus up to 4 extra key frames |
| Area Bosses (Champions) | Procedural "Elder" rigs at 1.3x with a crown | 7 | `world-structure.md:24`; `13-art-enemies.js:26` | 7 packs |
| Region Boss | The Fenmother, her own kit over the type art | 1 | `src/js/59h-bosses.js:28-35` | 1 pack |
| Non-bipeds | No body-type field exists. Of z1-10: Thornwing, Riftwing and Cave Devourer clearly; Nightseed Sorcerer unclear; 6 bipeds. The "about 17 of 43" is an unchecked red-team estimate | 3-4 of 10 (z1-10) | `enemies-c22-hollow-final.md:27-114`; `live-3d/ruling.md:47` | Section 6 risk 2 |
| Heroes | Wren route S (20 fight moves wiring, 4 gather loops next); Tobin and Pip route S packs being made overnight | 3 | `docs/design/route-s/ruling.md`; cards `integrate-route-s-tobin`, `-pip` | Already their own cards |
| Allies | The other two heroes, joining at z5, z10, z15 | 2 at a time | `docs/GAME.md:38-41` | Covered by the hero packs |
| Hunting | 3 beasts (Enraged Boar, Bristleback Wolf, Fen Lizard; tiers 4-5 reserved) on a 448x224 interim bitmap over gwoods | 3 + 1 ground | `21-data-craft.js:139-143,153`; `src/js/64i-hunt-art.js:36-46` | 3 beast packs; the woods set as the ground |
| Camp | Procedural 1024x192 panorama with 9 station plots; Trophy Wall in 4 stages; the cold-Hearth grove (fire, Hesketh, plot stakes) over the Pine Grove | 1 + 9 + 4 + 1 | `src/js/63d-scenery-camp.js:1-12,163-169,249+`; `src/js/63e-scenery-wall.js:6-10` | 1 set + 9 stations + 4 wall stages + grove props + Hesketh |
| Deepwell | Procedural "well" scene | 1 | `62-stage.js:231` | 1 set (later) |
| Icons | Codex: gear 110, action 29, navigation 32, status 15, resources 35, portraits 34 | 255 | `21u`, `21s`, `21t`, `21v`, `21r`, `21yc` | **None: they stay as they are** |
| Out of scope | Raid wyrm and raid scene (online layer, parked); 18 roster characters and 4 critters (`12b`-`12f`, `13b`); intro stills (card `first-hour-art`, Codex) | | `13-art-enemies.js:505` | Not in this plan (see 8.3 for the stills) |

## 2. The pipeline for each asset type

Every type runs the same five steps. Credits are spent only in step 2, and only with Cal's OK (section 7).

1. **Concept.** Codex draws one concept per new monster, Champion and beast: a front three-quarter view and a side view at
   the stage facing, with its Captain's colours as a swatch row. Imp and Gloomjaw use their approved frames. Scenery and nodes
   need no Codex concept: their references are the zone 1 sample's approved layers plus the area's written brief
   (`docs/design/regions-4-5.md`, `world-structure.md`, `enemies-c22-*-final.md`).
2. **Scenario sheets.** GPT Image 2.5 through Scenario, 3072x2048, on white, one sheet per job, with three references:
   Wren's concept (the style anchor), the zone 1 sample's layer of the same kind, and the concept from step 1. Prompts come
   from the shared kit (card `ns-kit`).
3. **Cut and clean.** The kit's cutter (from `zone1-test/build.py` and `wren-moves/cut8.py`): white joined to the border and
   enclosed pockets removed, the pale fringe peeled, specks dropped. Then registration: a ground line per sheet, one scale per
   sheet, and the anchors below marked by hand on a review page and saved as data. No pixel is redrawn.
4. **Game-drawn effects.** Light and motion only, per #325: lantern glows, ground light pools, hit flashes, sparks, smears,
   shake, hit-stop, dust. Anything with a shape (arrows, chips, spores as objects) is a sprite from the sheet.
5. **Judge.** A red team argues against the whole pack; the Opus art judge rules **wire**, **re-brief** or **shelve** against
   the gates in section 3.

### Anchors each type needs (marked by hand in step 3, checked by the wire card)

| Type | Anchors |
|---|---|
| Scenery layer | **Seat line** (the lowest row where the layer meets the ground, per layer); **road band** (top and bottom of the walkable road in the ground layer, which must contain the stage ground line GY = 0.8 of the stage height, `62-stage.js:211`); **tile period** of the ground layer; **parallax factor**; **light points** (lantern centres, for the game's glow); **upright safe area** (the crop for 360x740 until UX-L1 or Cal's menu-only decision) |
| Monster, Champion, beast frame | **Feet point** (ground contact, centre); **hit point** (where the hero's blows and arrows land); **head top** (HP plate and status chips); **strike point** per attack frame (sparks); **hover height** for flyers (the feet point sits on a shadow point); **release frame** per attack (meets the hit, as for Wren) |
| Node | **Base line**; **contact point** per hero: the notch, crack or stem meets that hero's tool tip on the impact frame (notch y = tool tip y, as `zone1-test/scene.py` does for Wren); **chips spawn point**; **glint point** |
| Camp station | **Footprint base**, **label anchor**, **tap box** |
| Hero (their own cards) | Feet, string anchors, and the **tool tip on each gather impact frame**, which the node contact needs |

### Motion for monsters

Key frames, never tweens: ruling #328 found a runtime tween or cross-fade ghosts. A monster gets 8 key frames on one sheet:
idle (held, with code breathing), advance, two attacks (wind-up and strike), hurt, defeat. The Imp test sheet is this shape
(`zone1-test/cut/imp-1..8.png`). Its Captain gets up to 4 more frames on a second sheet, plus a palette in data (Captains are
recolours, `world-structure.md:29`). A Champion gets 2 sheets (up to 16 frames), the Fenmother 3. Registration, a held idle,
release frames on the hit, and game-drawn smears on big jumps are the same rules Wren's build card uses (`route-s/ruling.md`,
gates 2, 3, 5 and 10). Today's Imp has 55 drawn frames; the new one has 8. The fight's timing already holds frames, so this
is the ruled method, not a cut.

## 3. Judge gates for every environment pack

Every pack's judge applies all of these. J1-J3 are Cal's notes and the card's acceptance; they are measured, not eyeballed.

- **J1 Grounded layers (Cal 01:20).** On the 1280x720 composite, every connected piece of the mid and fore layers reaches the
  seat line or hangs from a piece that does; between the mid layer's lowest opaque row and the ground layer's top edge, every
  column overlaps by at least 4 px (no transparent gap). A lamp, tree, fence or rock that floats fails the pack.
- **J2 Actors read against the scene (Cal 01:20).** At 1280x720 and 740x360, for each hero (Wren, Tobin, Pip idle) and each
  foe in the pack at each of its standing slots (`62-stage.js:177,180`): at least **70%** of the background pixels within 3 px
  outside the silhouette differ from the actor's median edge lightness by **15 L\*** or more; and the background ring's mean
  chroma is at most the actor's plus 0.10. Script: `experiments/new-style-plan/contrast.py`.
- **J3 Scale at ACTOR_K 1.5 (ruling #328).** Measured with the stage's real zoom at 1280x720, 740x360 and 1024x768: a hero
  stands 142 logical px; doors are at least 1.15x the hero's height; fences at most 0.55x; lamp posts 1.4x to 1.8x (Cal 01:23
  read Wren reaching two-thirds of a lamp post as an adult). Foes stand at their ruled ratio to the hero (section 4.3).
- **J4 Style match.** Side by side with the zone 1 sample, Wren's idle and the packs already wired: the same outline weight,
  light direction, palette ramp and level of detail at 1280x720. The red team argues the drift case.
- **J5 Bytes** under the pack's line in section 5.
- **J6 Whole screens.** The pack lists every screen it changes. Each is whole: no screen draws new and old environment art
  together (section 4.4).
- **J7 Anchors.** Every anchor in section 2 is present; the node contact meets each wired hero's tool tip within 2 art px on
  the impact frame; flyers cast their shadow on the road band.

### 3.1 What the zone 1 test shows (calibration)

| Composite (1280x720, heroes 270 px, Imp 78%) | Wren: dL\*, outline score | Imp: dL\*, outline score |
|---|---|---|
| Raw layers | -3.5, 49% | -5.3, 71% |
| The 01:20 fix: background darkened, desaturated, blue tint (`scene.py` `night()`) | +4.0, **26%** | +1.5, 54% |
| A haze grade: far and mid blended 35-45% toward a moonlit blue-grey, saturation 0.5; road and actors untouched (`fog.py`) | -8.1, **75%** | -8.2, **87%** |

Evidence: `experiments/new-style-plan/contrast.txt`, `fog-fight-270.png`.

### 3.2 What it means

Darkening a night scene pulls it toward Wren's dark cloak and the Imp's dark greens. By measure it made her harder to see,
not easier. Atmospheric haze does the opposite: distance gets lighter and greyer, and the actors stay dark and saturated
against it. So the kit's prompts ask Scenario for hazy, low-contrast far and mid layers. A haze grade at conversion, recorded
in the pack's manifest, is the fallback, and the judge sees the graded pack. The game adds a warm ground light pool under each
actor (a light effect, #325). J2 is the pass line, whatever the method.

## 4. Order: early game first, in whole judged packs

### 4.1 The packs

The first hour runs z1-10 (F3: the z10 Champion by minute 60) and ships 16 Nov. Gathering, Hunting (opens z5) and the camp all
show in it.

| # | Pack | What it holds | Screens it changes |
|---|---|---|---|
| 1 | **A1 Mossy Hollow** | 4 scenery layers; Thorn Imp, Gloomjaw, Briarbound Ravager, Thornwing, Nightseed Sorcerer, each with its Captain; the Briar Regent | Fights z1-5 |
| 2 | **G-woods** | 4 layers; wood tiers 1-2 (the Pine Grove and the next grove) | Woodcutting at tiers 1-2; the hunting ground |
| 3 | **G-mine** | 4 layers; ore tiers 1-2 | Mining ore at tiers 1-2 |
| 4 | **A2 Batwing Caves** | 4 layers; Riftwing, Maw Cantor, Cave Devourer, Glassfang Fiend, Echoblade, with Captains; the Hollow Cantor | Fights z6-10 |
| 5 | **G-meadow** | 4 layers; fibre and herb tiers 1-2 | Foraging at tiers 1-2 |
| 6 | **G-glade** | 4 layers; crystal tiers 1-2 | Crystal at tiers 1-2 |
| 7 | **G-hunt** | Enraged Boar, Bristleback Wolf, Fen Lizard, on the G-woods layers | Hunting |
| 8 | **Camp** | 4 layers; 9 stations (built states); Trophy Wall's 4 stages; the cold-Hearth grove (fire, stakes); Hesketh on the stage | Camp |
| 9-13 | **A3-A7** | Bonefield, Beetle Barrows, Fungal Deep, Quarry Ruins, Wraithmarsh (the Fenmother in A7) | Fights z11-35 |
| 14 | **Node tiers 3-5** | Wood, ore, crystal, fibre, herb at tiers 3-5 | Gathering at tiers 3-5 |
| 15 | **Deepwell** | 4 layers | Deepwell runs |

The first-hour tier cut (tiers 1-2) is an estimate; the G packs' make cards confirm it from `SKILL_TUNE` and a 60-minute sim
before spending, and add a tier if the first hour reaches it. A1 goes first because it is the first screen and the zone 1 test
already holds its scenery and Imp. G-woods goes second because Wren's gather set (`route-s-wren-gather`) lands on it.

### 4.2 One rule makes the order safe: whole screens or Classic

The game decides per screen. A screen draws new-style environment art only when **every** piece it would draw (scenery, every
foe that can stand there, every node of the picked kind and tier) has a wired new-style version. Otherwise the whole screen
draws today's art. So z11 stays classic until A3 lands, and a tier 3 woods scene stays classic until pack 14. No screen mixes
environment styles, and no pack has to wait for another. This is card `ns-scenery-engine`'s job.

Heroes are the one exception, already ruled (#328): the new heroes stand on classic screens past the first hour until their
area's pack lands. The packs above are what closes that gap.

### 4.3 What ships behind Classic art

One Settings switch, the one route S already extends. With Classic art on, every screen draws today's art: heroes, portraits,
scenery, foes, nodes, beasts and camp. The default is the new art. The switch stays for one release after the last first-hour
pack, then the next judge rules whether classic environment art can go (it frees its bytes).

## 5. Budgets

### 5.1 Bytes per pack

Measured on the zone 1 test at game size (`experiments/new-style-plan/bytes.txt`). The current background ceiling is one
960x540 picture at 190 KB lossless (`page-bytes.md` 4).

| Zone 1 test, 4 layers at 960 px wide | Lossless | 64 colours | Lossy WebP q90 (alpha kept exact) |
|---|---:|---:|---:|
| Far (with sky) | 577 KB | 232 KB | 90 KB |
| Mid | 464 KB | 155 KB | 145 KB |
| Ground with road | 303 KB | 88 KB | 91 KB |
| Fore | 165 KB | 61 KB | 47 KB |
| **Set** | **1,509 KB** | **537 KB** | **374 KB** |

A layered painted set is about 8 times the ceiling lossless. The page-bytes ruling already holds a reserve for this: lossy
WebP at q90 or higher for new backgrounds when "Codex's first two backgrounds miss 190 KB lossless at a look the art judge
passes" (`page-bytes.md` 4). The zone 1 set misses it by 1.3 MB. **Proposal for the judge:** scenery layers ship as lossy WebP
q90 with exact alpha, at most **400 KB a set**; sprites (foes, nodes, beasts, stations) stay lossless, at most 64 colours,
1-bit alpha.

| Piece | Measured or estimated | Line (proposed where new) |
|---|---|---|
| Scenery set (4 layers) | 374 KB at q90 | **400 KB** (new; replaces 190 KB for layered sets) |
| Zone monster, 8 frames at 148 art px | 60 KB at 63 colours (Imp test) | 85 KB with its Captain (unchanged) |
| An area's 5 monsters with Captains | about 5 x 80 KB | 425 KB (unchanged) |
| Champion, up to 16 frames at about 200 art px | about 140 KB (estimate from the Imp) | **160 KB** (was 120 KB) |
| The Fenmother | about 210 KB (estimate) | **240 KB** (was 200 KB) |
| Tree node at 480 art px (runs off the top) | 64 KB at 64 colours (pine test) | **70 KB** (new) |
| Rock or plant node at 160 art px | 15 KB (copper test) | **20 KB** (new) |
| Beast | none yet | 60 KB (unchanged) |
| Camp station | none yet | **25 KB** (new) |

| Pack | Estimate (files) |
|---|---:|
| A1, A2 (each): set 400 + monsters 425 + Champion 160 | 985 KB |
| G-woods: set 400 + 2 trees | 540 KB |
| G-mine, G-glade (each): set 400 + 2 nodes | 440 KB |
| G-meadow: set 400 + 4 nodes | 480 KB |
| G-hunt: 3 beasts | 180 KB |
| Camp: set 400 + 9 stations + wall + grove + Hesketh | about 750 KB |
| **First hour (packs 1-8)** | **about 4.8 MB** |
| A3-A7, node tiers 3-5, Deepwell | about 5.9 MB |
| **Chapter 1 environment** | **about 10.7 MB** |

**Against the page.** The one-file page is 8.36 MB today. Wren's fight set takes it to about 10.4 MB and her gather set to
about 10.73 MB (#328). Tobin and Pip at up to 2.0 MB each would pass the 14 MB fail line on their own, so #328 already holds a
third hero for the hosting split. **No environment pack fits the one-file page.** Every wire card depends on the split.

**Against the hosting plan** (`hosting.md` 6). The split build's first-load lines are warn above 6.0 MB and fail above 8.0 MB
on the wire. Loading everything up front (B1) cannot hold 3 hero packs plus 4.8 MB of first-hour environment, so these packs
need B2: the art loader that fetches the area in play. Its provisional area-set line is 1.0 MB of files; A1 and A2 at about
985 KB each fit it, with no room for stills in the same set. Gather scenes, the hunt and the camp load as their own sets when
opened. The whole web build is about 3.5 MB code and CSS, 6 MB of heroes and 10.7 MB of environment: about 20 MB, under the
25 MB report line. Classic art costs no wire bytes under B2 because its files load only when the switch is on.

### 5.2 Scenario credits per pack

Price: 18 credits a sheet (GPT Image 2.5, logged by every pack so far). Cal's new tier gives 20% off, so the real price may be
about 14.4; the plan prices at 18 to stay safe. Rerolls: Tobin needed 1.32 sheets per move, Pip 1.70, the zone 1 nodes 3.0
(the notch kept landing high). The plan uses **1.5x** for scenery and monsters and **2x** for nodes.

| Pack | Sheets (first pass) | Sheets with rerolls | Credits at 18 |
|---|---:|---:|---:|
| A1 Mossy Hollow: 4 layers, 5 monsters x 2, Champion x 2 | 16 | 24 | 432 |
| G-woods: 4 layers, wood t1-2 x 1 each | 6 | 10 | 180 |
| G-mine: 4 layers, ore t1-2 on 1 sheet | 5 | 8 | 144 |
| A2 Batwing Caves | 16 | 24 | 432 |
| G-meadow: 4 layers, fibre and herb t1-2 on 2 sheets | 6 | 10 | 180 |
| G-glade: 4 layers, crystal t1-2 on 1 sheet | 5 | 8 | 144 |
| G-hunt: 3 beasts | 3 | 5 | 90 |
| Camp: 4 layers, stations x 3, wall, grove, Hesketh | 10 | 15 | 270 |
| **First hour (packs 1-8)** | **67** | **104** | **1,872** |
| A3-A7 (A7 with the Fenmother, 3 sheets) | 83 | 125 | 2,250 |
| Node tiers 3-5 | 7 | 14 | 252 |
| Deepwell; beast tiers 4-5 | 6 | 9 | 162 |
| **Chapter 1** | **163** | **252** | **4,536** |

**Against what remains this month.** The API cannot read the balance (`3d-wren-test/scenario/current/README.md`, credit log).
Estimate: about 1,043 left of the old 5,000, plus 5,000 from the 01:15 upgrade, less about 98 for the woodcut v4 and node
redos, less Tobin's 627 and Pip's 774: **about 4,540**, falling as tonight's rerolls finish. The first hour (about 1,870) fits.
The whole chapter (about 4,540) would take all of it, with nothing left for hero rerolls or the style-model retrain (1,500,
Cal's card). So the plan spends only the first hour this month. The rest is Cal's call (D3). Credits are Cal's money: no pack
spends a credit without his OK.

### 5.3 Hero and foe size per view

From ruling #328: ACTOR_K = 1.5; a hero stands about 142 logical px; new art draws at 0.75 logical px per art px. New monster
art is drawn at the hero's art density, so a monster's art height is its ratio to the hero times 190 art px.

| View | Stage zoom | Hero on screen | Thorn Imp (78%) | Champion (about 1.05x) | Scenery |
|---|---|---|---|---|---|
| 1280x720, 1366x640, 1024x768 | x2 | 285 CSS px | 222 CSS px | about 300 CSS px | 960x540 picture at about 1 picture px per CSS px |
| 1920x1080 | x3 | 427 CSS px | 333 | about 450 | 1 picture px spans 1.5 CSS px (soft; the judge reads the 1920 shot) |
| 740x360 | x1 | 142 CSS px (95 if actor-scale's G3 falls back) | 111 | about 150 | downscaled 2:1 |
| 360x740 upright | 1.5 | about 142 CSS px (K = 1) | 111 | about 150 | upright safe-area crop |

Cal's big test (`zone1-test/scene-*-big.png`) has heroes at 270 px on a 720 px screen; the ruled 285 CSS px at 1280x720 is the
same size within 6%. Props are sized to that hero (J3), so a fence reads waist-high and a lamp post stands over her head. A
Champion's top must stay under the foe header (16% of the stage height, `art-direction.md` 2); the `actor-scale` card's
overlap gate holds for the new packs too. Monster ratios stay as designed per monster in `enemies-c22-hollow-final.md`.

## 6. Risks

1. **Style drift across packs.** Each run of sheets can wander in palette, outline weight and detail. Shows as: J4 fails, or
   the second area looks like a different game next to the first. Answer: fixed references every run (Wren's concept, the
   zone 1 approved layers, the previous wired pack); per-area palette ramps written into the kit before sheets are made; A2
   made only after A1 is judged, so its lessons carry over. The style-model retrain (1,500 credits) would lock the look
   further; it is Cal's card and not needed before A1 is judged.
2. **Non-biped monsters.** Image models miscount legs and wings the way they added third arms to Tobin and Pip. Thornwing,
   Riftwing and Cave Devourer are in the first hour. Shows as: extra or missing limbs, wings that change shape between frames.
   Answer: the kit counts legs and wings per frame like arms; Codex's side view is the reference; one reroll budget per monster
   (in the 1.5x). A monster that fails twice holds its whole area pack, never ships alone.
3. **Monster motion.** 8 key frames can pop between poses. Answer: the Wren rules (registration, held idle, release on the hit,
   game-drawn smears), and a judge clip read per pack, as `route-s-wren-wire` gate 12.
4. **Bytes and hosting.** Nothing here ships until the split build and the art loader are live. Shows as: a wire card blocked
   on the page-size check. Answer: the wire cards depend on `asset-build` and `art-loader`; `art-loader`'s trigger ("finer hero
   art is adopted", `hosting.md` 5) is met by route S, so it should start now.
5. **The 16 Nov first hour and the 20 Nov public post.** 8 packs, each made, judged and wired, plus the engine and the loader.
   With 4 build threads that is about 4 weeks of work in 5. Shows as: pack 8 not judged by 9 Nov. Answer: the packs are in
   first-screen order, and the whole-screen rule lets any pack that misses simply stay classic. The public post shows whatever
   is wired; it never shows a half pack.
6. **The tier cut.** If the first hour reaches tier 3 nodes, a tier 3 scene stays classic. The G make cards check it first.
7. **Phones.** Cal may make phones menu-only. Until he does, every pack keeps 740x360 and 360x740 working (the upright crop).
   If he does, the 740x360 and upright gates drop and phones skip the environment bytes.

## 7. Cal decisions (nothing here is assumed)

- **D1 Extend the Scenario rule to scenery, nodes, monsters, beasts and the camp.** The 00:40 rule covers hero poses and effect
  sprites. Cal's 01:09 message asks for the restyle, but the rule line amends "Art should only be made by Codex" (6 Oct) for
  these too, so it needs his typed yes. Codex keeps concepts and icons. Without it, every make card waits.
- **D2 Credits for the first hour:** about 1,870 credits (104 sheets at 18) this month, from an estimated 4,540 left.
- **D3 The rest of Chapter 1:** about 2,660 credits. Options: wait for next month's 10,000 (recommended: none of it is first
  hour); or top up now. Cal can read the reset date and the real balance on Scenario's billing page; the API cannot.
- **D4 The style-model retrain** (1,500 credits, existing card): optional. Recommended only if A1's judge reports drift.

## 8. Cards

Each pack has three cards: **make** (Scenario sheets in scratch, `/mnt/project-files/art-new-style/<pack>/`; spends credits
only after D1 and D2), **judge** (red team, then the Opus art judge rules with gates J1-J7) and **wire** (converts the pack as
drawn and wires it behind Classic art under the whole-screen rule). The judge never grades its own pack; the make card never
wires.

### 8.1 For `plan.mjs add`

Lanes and models follow the project's routing: builds Opus medium, judges and new systems Opus high, Codex for concepts.
"Cal" in Gate means the card's credit spend waits for D1 and D2.

| id | Title | deps | areas | size | prio | lane / model | Gate |
|---|---|---|---|---|---|---|---|
| ns-kit | New-style kit: prompts, references, cutter, anchors page, J1 and J2 scripts, byte measure (no credits) | none | docs | M | 1 | claude / opus-medium | auto |
| ns-codex-foe-concepts-z1-10 | Codex concepts: 8 monsters (z3-10) and 2 Champions, with Captain swatches | none | art | M | 1 | codex / codex | judge |
| art-loader | B2 art loader (`hosting.md` 9, card 6; its trigger is met) | asset-build | build, tools-walk, tools-ci, docs | L | 1 | claude / opus-high | judge |
| ns-scenery-engine | Layered painted scenery, sprite foes and nodes at actor scale, anchors, whole-screen-or-Classic rule | actor-scale, route-s-wren-wire | fight-layout, art, gather-ui | L | 1 | claude / opus-high | judge |
| ns-a1-make | Mossy Hollow pack sheets | ns-kit, ns-codex-foe-concepts-z1-10 | art | M | 1 | claude / opus-medium | Cal |
| ns-a1-judge | Mossy Hollow pack ruling | ns-a1-make | docs | M | 1 | claude / opus-high | judge |
| ns-a1-wire | Wire Mossy Hollow | ns-a1-judge, ns-scenery-engine, art-loader | art, fight-layout | M | 1 | claude / opus-medium | judge |
| ns-gwoods-make | Woods gather scene and wood t1-2 sheets | ns-kit | art | S | 1 | claude / opus-medium | Cal |
| ns-gwoods-judge | Woods pack ruling | ns-gwoods-make | docs | S | 1 | claude / opus-high | judge |
| ns-gwoods-wire | Wire the woods pack | ns-gwoods-judge, ns-scenery-engine, art-loader, route-s-wren-gather | art, gather-ui | M | 1 | claude / opus-medium | judge |
| ns-gmine-make | Mine scene and ore t1-2 sheets | ns-kit | art | S | 1 | claude / opus-medium | Cal |
| ns-gmine-judge | Mine pack ruling | ns-gmine-make | docs | S | 1 | claude / opus-high | judge |
| ns-gmine-wire | Wire the mine pack | ns-gmine-judge, ns-gwoods-wire | art, gather-ui | S | 1 | claude / opus-medium | judge |
| ns-a2-make | Batwing Caves pack sheets | ns-a1-judge, ns-codex-foe-concepts-z1-10 | art | M | 1 | claude / opus-medium | Cal |
| ns-a2-judge | Batwing Caves pack ruling | ns-a2-make | docs | M | 1 | claude / opus-high | judge |
| ns-a2-wire | Wire Batwing Caves | ns-a2-judge, ns-a1-wire | art, fight-layout | M | 1 | claude / opus-medium | judge |
| ns-gmeadow-make | Meadow scene and fibre and herb t1-2 sheets | ns-gwoods-judge | art | S | 2 | claude / opus-medium | Cal |
| ns-gmeadow-judge | Meadow pack ruling | ns-gmeadow-make | docs | S | 2 | claude / opus-high | judge |
| ns-gmeadow-wire | Wire the meadow pack | ns-gmeadow-judge, ns-gwoods-wire | art, gather-ui | S | 2 | claude / opus-medium | judge |
| ns-gglade-make | Glade scene and crystal t1-2 sheets | ns-gwoods-judge | art | S | 2 | claude / opus-medium | Cal |
| ns-gglade-judge | Glade pack ruling | ns-gglade-make | docs | S | 2 | claude / opus-high | judge |
| ns-gglade-wire | Wire the glade pack | ns-gglade-judge, ns-gwoods-wire | art, gather-ui | S | 2 | claude / opus-medium | judge |
| ns-codex-beast-concepts | Codex concepts: Boar, Wolf, Fen Lizard | none | art | S | 2 | codex / codex | judge |
| ns-ghunt-make | Hunting beast sheets | ns-kit, ns-codex-beast-concepts | art | S | 2 | claude / opus-medium | Cal |
| ns-ghunt-judge | Hunting pack ruling | ns-ghunt-make, ns-gwoods-judge | docs | S | 2 | claude / opus-high | judge |
| ns-ghunt-wire | Wire the hunting pack (replaces the interim bitmap) | ns-ghunt-judge, ns-gwoods-wire | art, gather-ui | S | 2 | claude / opus-medium | judge |
| ns-camp-make | Camp scene, stations, Trophy Wall, grove and Hesketh sheets | ns-kit, ns-a1-judge | art | M | 2 | claude / opus-medium | Cal |
| ns-camp-judge | Camp pack ruling | ns-camp-make | docs | M | 2 | claude / opus-high | judge |
| ns-camp-wire | Wire the camp pack | ns-camp-judge, ns-scenery-engine, art-loader | art, camp-ui | M | 2 | claude / opus-medium | judge |

### 8.2 Later (prio 3; their make cards wait for D3)

The same three cards per pack, each make card depending on the previous area's judge card and on its own Codex concept card
(`ns-codex-foe-concepts-<area>`, 5 monsters and a Champion; the Fenmother in A7):
`ns-a3-*` (Bonefield), `ns-a4-*` (Beetle Barrows), `ns-a5-*` (Fungal Deep), `ns-a6-*` (Quarry Ruins), `ns-a7-*` (Wraithmarsh,
the Fenmother), `ns-nodes-t3-5-*`, `ns-deepwell-*`.

### 8.3 Notes for the Foreman (not cards of this plan)

- `first-hour-art` (Codex: 3 stills and a Hesketh bust in the B1 pixel style) would land in the old style. If D1 passes, its
  brief should name the zone 1 sample and Wren's concept as style references.
- Ruling #328 kept Codex's zone 3-10 foe briefs at today's scale. If D1 passes, those briefs become `ns-codex-foe-concepts-z1-10`
  (concepts, not animated packs).
- `one-background-an-area` (one flat 960x540 picture an area) is superseded for areas that get a new-style pack; it stays for
  nothing else once A1-A7 land.

## 9. Checked and not checked

Checked: the card and its inputs; ruling #328; the zone 1 test files, its README and `scene.py`; Cal's notes in the Wren thread
(01:20-01:29); the credit log; `hosting.md` 5, 6, 8 and 9; `page-bytes.md` 4; the plan board's cards for hosting and route S;
the inventory sources above. Measured on scratch copies: the 4 layers' bytes in three encodings; the Imp atlas at 148 and
111 art px; the pine and copper nodes; the J2 contrast score on three grades.

Not checked: how the lossy q90 layers look at 1920x1080 (the judge reads it on A1); the first hour's real node tiers (the G
make cards); the Champion and Fenmother byte estimates (no sheet exists); 740x360 and 1024x768 composites of the new scenery
(estimated from the 1280 composite); the real Scenario balance.
