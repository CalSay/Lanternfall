# Art direction: B1 (16-bit, bold outline)

Status: the rules for the **code-drawn B1 kit** (`12a`-`12g`, `13`, `13b`, `60b-baker.js`). Chosen by the owner on
2026-09-27 (direction **B1**, with the lantern lighting of direction D on the stage). The three playable heroes and all
new art are drawn sprites instead: they follow [art-pipeline.md](art-pipeline.md) and the art freeze in `CLAUDE.md`
(match Wren, Tobin and Pip). Party-era notes below (several party members on the stage, `party-and-classes.md`
briefs) are history: there is one hero on the stage now.

Why: the owner found the old figures "too thin and tall", the clothing "didn't feel right" and the
art "lacked definition between different sections". B1 answers all three: stocky 4-head figures,
costumes built from separate coloured pieces, and a dark line wherever one piece sits on another.

The old reference screenshots were removed on 2026-10-02 (owner: not needed); git history keeps them.
Preview page: `prototypes/roster.html` (`#dbg=warden,tobin&s=6` shows every frame of the named
characters at 6 CSS px per art px; `e_slime`, `e_node_ore` show enemies and nodes).

## 1. The look in one paragraph

Classic console heroes. Each character is about **35 art px tall and 4 heads high**, drawn at
**2x** (1 art px = 2 CSS px, so 70 CSS px on the stage). Every piece of a costume is a flat block
of its own colour with **3 tones** (lit top-left edge, base, shaded edge), a **dark section line**
where it meets the piece under it, and the whole sprite has a **1 art px ink outline** (`#120B18`).
Small detail is left out rather than drawn as noise. Light is the mood: lantern glows, a warm key
light from the hero's lantern and a pool of light on the ground, drawn smooth at device resolution
over the crisp pixels.

## 2. Sizes

| Thing | Art px | On screen | Notes |
|---|---|---|---|
| Party member | 34-38 tall (hs 0.82-1.1), 18-30 wide plus weapon | 2x: 68-76 CSS px | head 9 art px tall (hh 4.6) |
| Head | 10 wide x 9 tall | | eyes are 1 x 2 px stamps |
| Portrait | 16 x 16 crop around the head | show at 32, 48, 64 or 96 CSS px | never at a non-integer scale |
| Monsters | slime 24, bat 26 (hovers), beetle 25, spore 32, bones 36, wraith 35 (hovers), golem 45 tall | 2x | elders 1.3x and crowned |
| Wyrm, nodes | wyrm about 80 x 66 (scaled to fit the stage); nodes 20-40 | 2x | |
| Stage | from 360 x 124 CSS px (portrait strip) up to about 1596 x 1036 at 1920 x 1080 (x3) | zoom 1x-4x | ground line GY = 80% of the height |

Screens (browser first, owner 2026-10-08): art is judged first at the design size, a desktop browser at 1280 x 720
CSS px, then at 1920 x 1080 (must look good) and 1366 x 640 (must fit). Landscape phones (740 x 360) and tablets
(1024 x 768) must show it without clipping; phones held upright (360 x 740) must not break.

Landscape stage zoom (62-stage.js `LAND_ZOOMS`, every viewport at least as wide as tall and 600 px or wider): the
largest of x1 to x4 that leaves at least 360 x 280 logical px, so x1 on landscape phones, x2 at 1280 x 720 and
1024 x 768, x3 at 1920 x 1080.

Portrait stage zoom (62-stage.js): the stage is laid out in logical px and drawn at a zoom ZM of 1, 1.5, 2,
2.5 ... so one art px is 2, 3, 4, 5 ... CSS px (whole pixels). ZM is the largest that keeps the
logical stage at least minW x 196, where minW is 272 on square or wide stages and eases down to 216
on tall portrait stages (height 1.3x the width or more), so the party fills a tall stage instead of
standing small under an empty sky. On a device pixel ratio of 1 or 2 only zooms that land on whole
device pixels are used. Examples (DPR 2): 336 x 526 (360 x 740 phone) and 388 x 701 (412 x 915) ->
1.5x (3 px). The container is
re-read on every resize. Taps use stage fractions, so they work at any zoom. On a strip under 210
logical px the ground drops to 14 px above the bottom and the scenery is built taller so it runs off
the bottom edge. A stage with a floor band of 76 CSS px or more under the ground is "tall": the
ability button (60 px) and the stage buttons move into the floor, and the upper lane stands higher
(10% of the height, up to 40 px).

Combat HUD (62-stage.js, drawn on the canvas in device px, toggled by the two-bar button on the
stage, `S.settings.hud`): an HP bar over each party member (green, amber, red; shield in white) with
an ability gauge under it (blue, gold when ready), an HP bar over each non-boss foe (red; champions
orange with a gold edge), status chips (Guard, Blessing, Shield Wall, Rally Hymn, haste to the right
of the hero's bar; Focus and Embers over the foe), the boss "!" telegraph (red heavy hit, green heal
over the boss, blue dive over the ally) with a shrinking wind-up ring, and the Glint over a gather
node. Data hooks for Stage C: `unitHp`, `unitCd`, `bossTelegraph` in 55-party.js. Screenshots:
`img/hud-*.png`.

Stage formation: 3 columns x 2 lanes. The columns in use spread from 6% to 55% of the logical
width (52% under 250 px, and short of a big foe's box), at most 84 px apart, pulled in so no sprite
leaves the left edge; the upper lane stands 8.5% of the height higher (12-26 px) and about
half a column further back, so each upper member shows between and above the two in front (slight
overlap only). It is drawn first and dimmed. The foe stands at 78%. Melee units dash to the foe and
back; ranged units fire from place. Floating numbers start just over the foe's head, stack upward
one row per text and fade before they reach the foe header (never higher than 16% down the stage).
Screenshots: `img/stage-b1-<W>x<H>-<zone>.png`.

## 3. Palette and tones

- **One material = one base colour + a kind.** `m('#2F57B0')` is cloth; kinds: `cloth`, `leather`,
  `metal`, `skin`, `hair`, `wood`, `stone`, `gem`, `slime` (all 3 tones), `flat` (one colour, no
  light) and `glow` (one colour that also emits light).
- **3 tones per material, no more** (`ramp3` in 12a). Highlight: +15 lightness (metal +23, less
  saturated), hue up to 10 degrees toward gold. Shade: -16 (metal -19), hue up to 16 degrees
  toward plum (262); skin shades toward red. No gradients or dithering inside a piece.
- **Line colour:** a dark, desaturated tone of the material itself (lightness 8-34). Skin lines are
  warm brown, never black or orange.
- **Ink outline** `#120B18` around the whole sprite, 1 art px, 4-way.
- **Each character: 3 colours** (primary, secondary, accent) from the brief in
  `party-and-classes.md` 3.2, plus skin and hair. About 6 materials, 3 tones each.
- **Neighbouring pieces get different hues,** not a lighter or darker version of the same one:
  brown gloves on a steel vambrace, a brown belt on a blue surcoat, an ember sash on violet.
- Skins: `#F2C39A`, `#C98E62`, `#8A5A3C`. Hero hair: `#3A2A24`, `#8A4A2A`, `#D8B070`, `#B8B4C0`.
- Glows: lantern glass `#FFD27A` (light `#FFC070`), embers `#FFB050`, holy `#FFE6A0`, Maren's teal
  `#AEF6E6`, Corvin's violet `#C49CFF`. Keep glows few: the lantern is the hero of the picture.

## 4. Section definition (what the baker does for you)

These passes run in `60b-baker.js` (`rasterize`). You get them by authoring pieces in the right
order; you never draw lines by hand.

1. **Tones from volume.** Each piece is shaded from its own shape (ellipses and capsules as round
   volumes, polygons with a bevelled edge), lit from the top left.
2. **Section line.** Where a piece sits on top of another (higher z, or later in the same z), the
   under-piece's pixels touching it become the under-piece's line colour. Pieces of the same
   material do not get a line unless the top one has `sep: 1`.
3. **Cast shadow.** The pixels directly under a piece that sits on top go one tone darker.
4. **Despeckle.** A pixel with no same-coloured neighbour takes its neighbours' colour.
5. **Ink outline** round the whole sprite.
6. **Faces are stamps**, not shapes: `face(k, ...)` places whole pixels relative to the head
   centre, so eyes never blur or vanish in any pose.

Options that change this per piece: `nl` (makes no line or shadow on what is under it: trims,
stamps, straps that should read as painted on), `nlu` (gets no line), `g: 'name'` (pieces in one
group share no lines: the skin of head and neck), `clip: part` (only inside another piece, and
shaded with its volume: bands, emblems, hems), `bev` (bevel width), `tone` (+1 darker, -1 lighter).

## 5. How to author an outfit

Files (all DOM-free, they load in Node):

| File | Holds | Owner after AR1 |
|---|---|---|
| `src/js/12a-art-body.js` | the kit: colour, materials, gear tiers, shapes, body anchors, body pieces, faces, hair, hoods, poses | art lead (shared; small edits only) |
| `src/js/12b-art-heroes.js` | Warden, Lanternmage, Ranger, Lightkeeper and their gear per slot | hero art agent |
| `src/js/12c-art-hedgefolk.js` | Tobin, Wren, Hesketh, Pip, Bram | Hedgefolk agent |
| `src/js/12d-art-oath.js` | Maren, Aldric, Anselm, Elowen, Caedmon | Oath agent |
| `src/js/12e-art-dusk.js` | Kestrel, Isolde, Oriel, Corvin | Dusk Company agent |
| `src/js/12f-art-wayfarers.js` | Thessaly, Grenna, Morwen, Vesper | Wayfarers agent |
| `src/js/60b-baker.js` | the renderer, caches, portraits, enemy conversion | art lead |

A companion entry:

```js
AK.CHARS.tobin = { name: 'Tobin', circle: 'hedgefolk',
  hs: .82, ws: 1.14,          // height and width scale of the body (hd: head, armW, handS)
  aF: -.3, aB: -.55,          // resting arm angles (radians; negative swings the hand forward)
  anim: 'slash',              // attack poses: slash heavy cast lift twin bash shoot swing thrust chop
  pose: { lean: .1, hb: .6 }, // optional stoop, added to every standing frame
  eye: '#2E2018',
  wpn: { fam: 'ore', fam2: 'hide', t: 2, r: 0 },   // role weapon: family, default tier and rarity
  build(k, w) { ... } };      // w = the role weapon's materials (see 6)
```

Inside `build`, write every piece **relative to the anchors** on `k`, never in absolute numbers:

| Anchor | Meaning |
|---|---|
| `k.hx, k.hy, k.hw, k.hh` | head centre and radii; `k.top`, `k.chin` |
| `k.shY, k.waY, k.hiY` | shoulder, waist and hip lines (negative y is up; feet at 0) |
| `k.sw, k.hipW` | half widths at the shoulders and hips |
| `k.pF, k.pB` / `k.hF, k.hB` | front and back shoulder pivots / hand points |
| `k.legR, k.armR, k.handR, k.bootH, k.bootL` | limb radii, boot height and toe length |
| `k.H` | 34, the body height (size props with it: a staff is `k.H * .72`) |
| `k.U(n)` | detail size: `n * 0.72`, at least 1 art px |
| `k.pose` | the frame's pose (read `k.pose.drawn` for a drawn bow) |

Shapes: `E(cx, cy, rx, ry)` ellipse, `C(x1, y1, r1, x2, y2, r2)` tapered capsule, `P(x, y, ...)`
polygon, `R(x, y, w, h)` rectangle, `Q(x, y, w, h)` whole-pixel stamp, `rrect`, `ringP`, `arcPts`.

Body helpers: `legs(k, trousers, boots, { cuff, toe, sole, greave, tall })`,
`torsoShape(k, { bot, ww, bw })`, `robeShape(k, { hem, flare })`,
`arm(k, 'F'|'B', sleeve, hand, { bare, bell, bellTrim, bracer, cuff, big })`, `head(k, skin)`,
`face(k, { eye, brow, glow, one, mouth })`, `hairShort(k, hair, { long })`, `hairFringe`, `beard`,
`hood(k, mat, { shadow, trim, peak })`, `belt(k, mat, { buckle })`, `lanternItems(size, frame, glass)`.

Pieces: `k.add(z, bone, material, shape, options)`. Held props: `k.held(z, 'F'|'B', tilt, [[mat,
shape, opt], ...])` with shapes in the prop's own frame (origin at the hand, -y along the prop).

Layers (`z`) and bones:

| z | Layer | Examples |
|---|---|---|
| 0-0.6 | back | cloak, cape, hood drape, long hair, quiver, lute, bell, plume, halo |
| 1-1.3 | back arm | back sleeve, back pauldron |
| 1.8-2.1 | legs | back leg, front leg, boots, greaves |
| 3-3.9 | body | torso, surcoat, robe, apron, belt, sash, straps, gorget, neck |
| 4-4.6 | head | head, face stamps, hair, helm, hood ring, hat |
| 5-5.5 | off-hand | shield, lantern, tome, bow (held by the back arm in front of the body) |
| 6-6.5 | front arm | sleeve, bracer, glove, pauldron |
| 7 | weapon | sword, staff, spear, axe |

Bones: `legs` (fixed), `up` (torso: bob and lean), `head` (rides on `up`), `armF` / `armB` (rotate
at the shoulders), `wF` / `wB` (held props: rotate at the hand on top of the arm).

## 6. Gear, tiers and rarity

A gear drawing never stores its colours. It reads a **material set** (`AK.gearMats(spec, tier,
rarity, glow)`):

| Key | Meaning |
|---|---|
| `P` | primary family at the tier (Ore: Copper, Iron, Mithril, Starsteel, Emberite; Wood: Oak ... Lanternwood; Crystal, Fibre, Hide), dyed toward the class colour if the slot has `dye` |
| `D` | primary, darker |
| `Q` | secondary family at the tier (grips, shafts, frames) |
| `R` | trim: gold from Rare up, else `D` |
| `G` | glow accent (Epic and up), else `null` |
| `C` | crystal: a gem, glowing from Epic |
| `L` | lamp glass (always lit, tinted by the crystal tier) |
| `r`, `t`, `pulse` | rarity 0-3, tier 1-5, Legendary pulse |

Rules: every class keeps its own colours whatever the gear (the Warden's surcoat is always blue);
the tier shows on the metal, wood or leather of the gear itself; Rare adds trim (a helm ridge, a
plume, a gold hem), Epic adds a glowing accent, Legendary pulses. Heroes: `g.weapon`, `g.off`,
`g.head`, `g.body`, `g.charm` (null when the slot is empty: draw hair instead of a helm, a hip
lantern instead of a held one). Companions: `w` is the role weapon (the spec `{ comp, t, r }`
overrides the tier and rarity).

## 7. Faces, heads and silhouettes

- Eyes: `face()` stamps two 1 x 2 px eyes (the near one at `hx + hw * .48`). A brow is a 2 x 1
  stamp. Hooded faces use `glow` eyes (1 px, lit) or no face at all (Corvin).
- Every character must read at stage size by **silhouette**: headgear (pot helm, winged helm,
  mitre, reed hat, candle crown, hood peak), a big prop (tower shield, maul, spear, lute, bell)
  and height/width (`hs`, `ws`). Colour is never the only difference.
- Hair and hats are separate pieces over the head, so the fringe gets a section line.

## 8. Animation

Frames: `idle0`, `idle1` (bob 1 art px), `wind`, `strike`, `down` (laid on the ground), `hit`
(white flash of idle0). Poses are numbers, not drawings (`AK.ANIMS`); a prop follows its hand.
Frame timing and movement are in 62-stage.js (wind 0.14 s, strike 0.12 s, recover 0.2 s).
`prefers-reduced-motion`: idle frames freeze, dashes snap, the flicker is steady.

## 9. Lighting on the stage (from direction D)

- Every `glow` piece is a light (radius `lr` in art px; the baker returns it in CSS px).
- The hero's brightest light throws a **warm key light** (radius about 115 px) over the party and
  a **pool of light** on the ground. Sprites are never recoloured; light is added on top.
- Glows use `lighter` blending, a flicker, and a slow pulse on pulsing pieces (lanterns, halos).
- Scenery lamps, fog and the vignette belong to 63-scenery.js.

## 10. Enemies and gather nodes

Monsters, elders, the raid wyrm and the gather nodes are drawn in B1 with kit pieces
(13-art-enemies.js; crystal, fibre and herb node rigs in 11-art-craft.js) and baked by the same
passes as the party (`enemyFrames(key, variant)`, rigs marked `b1: 1`). Preview page `prototypes/enemies.html` (`#frames=slime,golem&s=4`, add
`&elder` for elders).

- Creatures face left, feet at 0. Bones with pivots and poses (`idle0`, `idle1`, `wind`, `strike`;
  `hit` is a white flash). Rattlebones uses the character kit and is mirrored.
- Materials: `k.c(hex, kind)` follows the zone-cycle hue (+70 degrees per cycle), `k.f` is fixed,
  `k.glow` emits light. Eyes, runes and cores are glowing whole-pixel stamps or glow pieces.
- Elders: 1.3x, a gold crown with a red gem (the golem wears a crystal crown) plus one extra
  feature each (a skull in the slime, horns, a cape, a horn, twin caps, antlers). Champions keep
  their gold aura from the stage.
- Wyrm: one palette per raid generation (`ENEMY_RIGS.wyrm.gens`); the stage fits it with `S`.
- Nodes: `{ tier: 1-5 }` recolours the material and adds detail and glow at higher tiers.

## 11. Checklist for a new or reworked character

1. Read the brief (party-and-classes.md 3.2). Pick 3 colours plus skin and hair.
2. Build order: back pieces, legs, back arm, torso and clothing, belt, head, face, hair and
   headgear, off-hand, front arm, weapon, front pauldron.
3. Every piece relative to anchors; no absolute coordinates except inside held props.
4. Neighbouring pieces differ in hue; trims are `clip`ped to their parent.
5. The role weapon uses `w.P` / `w.R` / `w.G` so its tier and rarity show.
6. Check `#dbg=<key>&s=6` on `prototypes/roster.html`: every frame, no stray pixels, the face
   reads, the prop reads, the silhouette differs from the other characters in the circle.
7. Check the stage at 1280 x 720 first, then 1920 x 1080 and 740 x 360; 360 x 740 must not break.
8. `node tools/build.mjs && node tools/check.mjs` (the art check builds every outfit in every pose).
