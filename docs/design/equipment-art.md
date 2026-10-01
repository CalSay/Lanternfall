# Equipment art on the heroes (the paper-doll spec)

Status: direction agreed with the owner (2026-10-01; §5). The open points are in §6. Built from the owner's discussion with Codex on how to show gear
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

## 5. Decided: outfits, and heroes start dressed (owner, 2026-10-01)

### Outfits

- **Equipped gear shows on the hero.** Each slot shows the hero's equipped item: its look, and its grade's palette.
  This is option (b) in §6.
- **The current designs become outfits.** Each hero's approved art (Wren's bat hood and leathers, Tobin's baker's
  cap and apron with the borrowed sword, Pip's witch hat and robe) becomes that hero's first **outfit**.
- **An outfit is only a look.** The player can pick an outfit to show instead of their equipped items. The stats
  still come from the equipped items.
- **The first outfit needs no new art.** Proposal: with an outfit on, the game draws the approved full pose as it
  is today, with no gear layers. Effects stay as they are (the bow string, arrows, Pip's flame).
- **Tools always show.** When gathering, the hero shows the equipped tool, even with an outfit on. Tools are not
  part of an outfit.
- **Where the player picks it.** Outfits go in a Looks list per hero: one row, "Show: Equipped gear / <outfit
  name>". Later outfits (event rewards, unique sets) join that list.

### Starting gear

New heroes start **dressed and armed**: the grade 1 item in each class slot (weapon, off-hand, head, body). Today
they start with nothing.

Open for the owner:

- **Tools at the start?** The Cold Hearth tutorial teaches crafting the first pickaxe. Proposal: heroes start with
  the 4 class items and **no tools**, so that tutorial step still makes sense. The pickaxe you craft is then the
  first tool you see in your hero's hands.
- **Save key.** This changes `fresh()`, so it needs a save-key bump (Claude only).

### The first art pack: starting gear (replaces the Tobin-only prototype)

The first pack is grade 1 for all three heroes, made with the full process in §4. It proves the system on every
hero at once.

1. **Rig all three heroes:** every combat and gathering pose (Wren's gathering set once it exists).
2. **Base re-cut:** each hero with nothing removable on, split into body and front-hand layers. They wear plain
   clothes underneath; the artist chooses them, in the heroes' style.
3. **Starting items, one look each, drawn in grade 1 colours on the reserved ramps:**

| Hero | Weapon (4 angles) | Off-hand | Head (3 angles) | Body (every pose) |
|---|---|---|---|---|
| Wren | Plain bow, no string | Quiver | Plain hood | Simple leathers |
| Tobin | Plain warblade | Plain shield (3 angles) | Plain greathelm | Plain plate |
| Pip | Plain staff (ember holder, no flame) | Lantern (3 angles) | Plain circlet | Plain robe |

4. **The 4 tools:** one shared look, 4 angles each.
5. **Combiner preview:** every hero, every pose, starting gear on and off, and the outfit on.

All of these are "look A" for their slot (§2 Rule 4). Later grades in band A reuse them with their own palettes, so
this pack also covers grades 1-5 on the hero once the palettes are set.

Record the time each step took and where the fit broke. That gives the owner a real estimate for looks B and C.

## 6. Still open

1. ~~How much should gear change on the hero?~~ Decided: equipped gear shows (option b), and outfits sit on top.
2. **Bands:** are grades 1-5 / 6-10 / 11-15 the right split for looks? Or should the split follow regions instead?
3. **Uniques:** should boss loot get its own on-hero look, or only an icon and a glow?
4. **Gathering:** does the weapon hide while a tool is out (proposed), or hang on the back (more drawings)?
5. **Starting tools:** none (proposed, keeps the tutorial), or a starter set?

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
