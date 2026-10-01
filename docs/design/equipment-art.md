# Equipment art on the heroes (the paper-doll spec)

Status: proposal for owner sign-off (2026-10-01). Built from the owner's discussion with Codex on how to show gear
on the heroes without drawing every combination. Nothing here changes the art freeze: Codex draws, the owner vets
whole packs, and code only places and recolours what the artist drew. Inventory icons are a separate system (C26
gear icons) and are not affected.

## 1. The problem in numbers

Each hero wears 8 visible things:

- **4 class slots:** weapon, off-hand, head and body.
- **4 tools:** pickaxe, woodaxe, sickle and hunting spear.

The charm (and the old trinket) is never drawn on the hero; it is an icon only. Each item comes in 15 grades.

| Hero | Weapon | Off-hand | Head | Body | Poses (combat + gathering) |
|---|---|---|---|---|---|
| Wren | Bow | Quiver | Hood | Leathers | 8 + 7 (gathering set pending) |
| Tobin | Warblade | Shield | Greathelm | Plate | 8 + 7 |
| Pip | Staff | Lantern | Circlet | Robe | 7 + 7 |

**One kind per slot (owner, 2026-10-01).** Each hero only ever equips their own kind in each slot: Wren never
wears Plate, and Tobin never holds a Staff. What changes between items is the grade (and, for uniques, the item).
That gives three consequences:

- **Little to draw for each hero.** Each hero has 4 kinds × 15 grades = 60 gear items, drawn only for that hero.
  The three heroes share nothing on the body, so no overlay has to fit another hero's shape.
- **Tools are the only shared art.** Every hero uses the same pickaxe, woodaxe, sickle and spear.
- **Some lines need no on-hero art yet.** Codex's 22 icon lines include the Lightkeeper's Censer, Tome, Mitre and
  Vestments, plus the old Sword and Helm. No current hero wears any of them, so they need no on-hero art until a
  hero does. Today that leaves 12 class lines plus 4 tools.

If every grade of every item were drawn into every pose:

- per hero: 8 items × 15 grades × 15 poses ≈ **1,800 drawings**;
- for all three heroes: about **5,400**.

Drawing each combination as a whole hero image would multiply that again. Neither is a realistic art plan.

The rest of this spec cuts the number of drawings with four rules:

1. Draw each slot as its own layer.
2. Recolour grades from shared palette ramps instead of redrawing them.
3. Give each slot only as much pose work as it needs.
4. Let many grades share one look.

## 2. The four rules

### Rule 1: layers, not combinations

Each hero pose is delivered as layers drawn on the same 224×192 canvas, with the feet on the anchor (96, 132):

```
back gear  →  body  →  body armour  →  head gear  →  weapon or tool  →  front hand
(quiver on the back,                                (in front or behind,
 a shield behind the arm)                            set per pose)
```

- **Body:** the hero with no removable gear. The signature pieces stay on this layer: Wren's scarf and strap,
  Tobin's red scarf and cape, Pip's look. Hands are on it too.
- **Front hand:** the fingers that wrap a grip, on their own small layer. The weapon then sits between the palm
  and the fingers. Without this layer, a weapon either covers the hand or floats in front of it.
- **Layer order by pose:** a pose can put the weapon behind the body. For example, a bow arm reaching back on the
  wind-up. The rig file says so for each pose.

### Rule 2: grades are palette ramps, not drawings

Every equipment drawing uses **reserved material ramps** instead of fixed colours:

- **Primary material:** 5 shades.
- **Secondary material:** 4 shades.
- **Trim:** 3 shades.
- **Gem or glow:** 3 shades.

The game swaps each ramp for the grade's material. The colours come from the approved resource icons: Copper
through Mithril for ore, and Pine through Tideash for wood. One drawing then covers every grade made of that kind
of material.

The hero art is already stored as palette indices (`heroArtDecode` in `64h-hero-sprites.js`), so this costs almost
nothing at runtime.

### Rule 3: each slot gets only the pose work it needs

| Slot | How it's drawn | Drawings per look |
|---|---|---|
| Weapon (bow, warblade, staff) | A separate sprite placed at the hand's grip point. 4 hand-drawn angles (down, 45°, upright, level), never rotated in code. Each pose names its angle and layer. | 4 |
| Tools (pick, axe, sickle, spear) | Same as weapons, with grip points in the gathering poses. **Shared by all three heroes**, since every hero holds the same tool the same way. | 4 per tool, once for the whole game |
| Off-hand: quiver | Sits on the back. One sprite, moved with a back point in each pose. | 1-2 |
| Off-hand: shield, lantern | Held in hand: 3 angles (guard, lowered, braced). | 3 |
| Head (hood, greathelm, circlet) | Moves with the head. 3 head angles cover every pose (upright, bowed for hurt and kneel, lying for fallen). | 3 |
| Body (leathers, plate, robe) | The costly slot: an overlay for **every pose**, since it has to fit the torso and limbs. | 1 per pose (15) |
| Charm, trinket | Icon only. | 0 |

### Rule 4: few looks, many items

A **look** is one drawn design. Many items share it, and grades within a look differ only by palette (Rule 2).
Proposal: **three looks per slot**, one per band of grades:

| Band | Grades | Look |
|---|---|---|
| A | 1-5 (regions 1-2) | The hero's starting design: the gear in today's art |
| B | 6-10 | A sturdier version of the same idea: more plates, binding and trim |
| C | 11-15 | The late-game version: ornate, with a new silhouette |

Uniques (boss loot) can get their own look later, one by one, if the owner wants them to stand out on the hero.

## 3. What that costs

Per hero, using three looks and 15 poses:

| Slot | Drawings |
|---|---|
| Body | 3 looks × 15 poses = 45 |
| Head | 3 × 3 = 9 |
| Weapon | 3 × 4 = 12 |
| Off-hand | 3 × 3 = 9 |
| Base re-cut (body and front-hand layers) | 15 |
| **Per hero** | **about 90** |

For the whole game:

- 3 heroes × about 90 = about 270;
- plus about 48 for the four shared tools (4 tools × 3 looks × 4 angles);
- **about 320 drawings in total, against about 5,400.**

Each new look then costs one body set (15 drawings) plus a few small sprites. Each new grade costs nothing but a
palette.

The body slot is the expensive one, so the owner's choice in §6 Q1 sets most of the bill.

## 4. The fixed process (every slot, every hero)

1. **Rig the hero (once per hero).** Codex marks every pose in `art/heroes/<hero>/rig.json`:
   - main grip point and angle (one of the 4);
   - off-hand point and angle;
   - head point and head angle;
   - back point;
   - whether the weapon goes in front or behind;
   - which slots are hidden in that pose. For example, in gathering poses the weapon is stowed and the tool shows.

   This is metadata about existing art, not new art.
2. **Re-cut the base.** The artist delivers each pose split into body and front-hand layers, with the removable gear
   left out. Existing approved poses are the reference, and the result must match them pixel for pixel wherever
   nothing was removed. Owner vets the set.
3. **Draw to the item template.** Each slot has a fixed template:
   - canvas size;
   - the grip pixel marked;
   - the 4 angles (or 3 head angles) laid out in a strip;
   - only reserved ramp colours, with a 1-pixel dark outline, in the heroes' style.

   A body look is drawn over all 15 base poses.
4. **Check in the combiner.** A preview page (Codex, under `art/`) puts every look on every pose with every grade's
   palette. It flags these:
   - a missing anchor;
   - a gap at the grip;
   - colours outside the reserved ramps;
   - pixels outside the body's outline by more than the look allows;
   - a layer-order slip.
5. **Owner vets the whole pack.** The pack is one look of one slot for one hero, across every pose and grade. No
   partial packs (art freeze).
6. **Integrate.** Claude adds the pack's data and a check. The game builds each (hero, pose, frame, gear) picture
   once into a cached canvas, so drawing a frame costs the same as today.

Order of work: rig → base → weapon → head → off-hand → body. Body comes last because it costs the most, and the
earlier steps prove the anchors.

## 5. Prototype first

Before any full pack is made, do one hero end to end. **Tobin** is the best test because all four of his slots are
visible:

- rig Tobin;
- re-cut his base;
- one weapon look (4 angles), one helm look (3 angles) and one plate look (all 15 poses);
- show it in the combiner, then in the preview game behind the test switch.

Record how long each step took and where the fit broke. From that, the owner gets a real estimate for the full
plan, and decides Q1-Q3 below with the prototype in front of them.

## 6. Owner decisions

1. **How much should body and head gear change on the hero?**
   - **(a) Signature look:** body and head keep each hero's story look (Tobin's baker's cap and apron, as in
     `hero-accessories.md`), and grades show only through palette and trim. Weapons, off-hands and tools change
     shape.
     - About 150 drawings for the whole game: the base re-cuts, weapons, off-hands and the shared tools.
   - **(b) Three looks per slot,** as in §3.
     - About 320 drawings.
   - **(c) A look per grade.**
     - Several thousand drawings. Not recommended.

   Recommendation: (a) now, with (b) as a later upgrade. (a) needs no body overlays at all and still makes every
   weapon upgrade visible. It also matches the gear register the owner already approved.
2. **Bands:** are grades 1-5 / 6-10 / 11-15 the right split for looks? Or should the split follow regions instead?
3. **Uniques:** should boss loot get its own on-hero look, or only an icon and a glow?
4. **Gathering:** does the weapon hide while a tool is out (proposed), or hang on the back (more drawings)?

## 7. Who does what

- **Codex (art direction):**
  - the rig files;
  - the base re-cuts;
  - all item drawings and templates;
  - the combiner preview.
- **Owner:** vets each whole pack.
- **Claude:**
  - the runtime layer system in `64h-hero-sprites.js` (placing, palette swap and caching);
  - the checks: every pose has its anchors, ramps are respected, and the frame-time budget holds;
  - integration.

No art is drawn in code.
