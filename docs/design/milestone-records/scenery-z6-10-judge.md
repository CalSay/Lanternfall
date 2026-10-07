# Scenery for zones 6 to 10: judge ruling

Card `scenery-z6-10-judge` (Opus high, read-only judge), 2026-10-07. Question from `slice-art-manifest` (PR #150, section 4).
Red team: [scenery-z6-10-redteam.md](scenery-z6-10-redteam.md) (Sonnet, against the first draft; this version answers it).
Ruling lines: `docs/DECISIONS.md`, "Scenery for zones 6 to 10 (2026-10-07)". Claude decided; Cal can veto any line.

## The problem

The slice is measured by area (Mossy Hollow 1-5, Batwing Caves 6-10, the Bonefield 11-15), and the Caves painting is
briefed for zones 6 to 10. The game does not place scenery by area. `zoneTheme(z)` (`src/js/22-data-regions.js`) returns
`forest` for zones 1 to 7 (`MOSSY_ZONES`, an owner call of 2026-10-02), then follows the old 7-zone cycle
(`ZONE_THEME[zonePlace(z)]`). Zone names follow the areas (`zoneAreaName`). `62-stage.js` draws the painting `BG_ART[theme]`
when one exists, else the procedural scene for that theme.

| Zone | Area name on screen | Scenery today |
|---|---|---|
| 1-5 | Mossy Hollow | Mossy Hollow painting |
| 6, 7, 8 | Batwing Caves | Mossy Hollow painting |
| 9 | Batwing Caves | procedural cave |
| 10 | Batwing Caves | procedural bone (the Bonefield's look), under the Hollow Cantor fight |
| 11-14 | The Bonefield | procedural barrow, fungal, quarry, marsh |
| 15 | The Bonefield | Mossy Hollow painting |

Six of the slice's 15 zones show scenery that matches their area name. If the Caves painting were wired as `BG_ART.cave`
with no rule change, it would show in zone 9 only of the Caves area, and in zones 16, 23 and 30, on the Coast at 37, 44,
51, 58 and 65, and every seventh zone after. (The manifest's note said "zones 8 and up"; zone 8 is a `forest` place in the
cycle.)

Evidence is the code and the manifest only: no playtest or Cal note has named this yet, because no area painting but the
first exists. The digest flags this ruling so Cal can veto it. The mismatch becomes visible the day the Caves painting is wired, so it must be settled before that.

## The options

**A. Zones take their area's painting.** Zones 6 to 10 all show the Caves painting once it is wired.
For: the area title "Batwing Caves" plays on entering zone 6 (DECISIONS, Chapter 1 delivery readings); the player should
see caves when it says caves. The first Star (zone 6 Captain, beat 18, about 20:00) and Wren's cave scene at the zone 10
Champion (beat 25) both sit in this area (`first-hour.md`). The story bible calls area 2 "the miners' road" and puts the
Cantor's song in the caves. The Compass names "reach a new area" as a week-loop step, and pillar 4 is "the road pushes
light into the dark": a new area that looks like the last one wastes the beat. One painting per area matches the pack bill
(`milestones.md`: one backgrounds pack, one version of the night painting per area).
Against: it overrides Cal's 2026-10-02 call for zones 6 and 7 (below).

**B. Split the area: zones 6 and 7 forest, 8 to 10 Caves.** The area title says Batwing Caves at zone 6 over a forest,
and the first Star lands there; the Riftwing is a cave bat in a forest. A cave-mouth version for 6 and 7 would be a second
painting for a paused art lane. It still needs a code change, since the cycle puts bone at zone 10. Rejected.

**C. Keep forest to zone 7 and redraw the pack boundary to zones 8-10.** Everything against B, plus the manifest, roster
and story all group the area as 6 to 10. It also needs code, because the cycle gives zone 10 bone. Keeping forest is not
a no-code option. Rejected.

**D. Hard-code zones 6 to 10 to `cave`.** One line, but it would turn zones 6, 7 and 8 from the approved painting to the
procedural cave today, before any painting exists, and needs a new edit for every area painting. A's rule is the same size
(one condition on `BG_ART`) and needs no edit per painting. Rejected.

## Overriding the owner call for zones 6 and 7

DECISIONS ("Enemies and the world") holds Cal's line "Zones 1-7 use the Mossy Hollow scenery (2026-10-01 to 2026-10-02)";
commit ca9819c8 is tagged "(owner)" and says only "ahead of the world rebuild". This ruling overrides that line for zones
6 and 7, from the day the Caves painting is wired. My reading of his reason is inferred, not his words: on 2026-10-02 the
Mossy Hollow painting was the only approved background and the alternative was procedural scenery. Under A, zones 6 and 7
keep that painting until an approved Caves painting replaces it, so they never drop to procedural scenery. The DECISIONS
line is amended to say so. Cal can veto from the digest; with a veto, `SCENERY_BY_AREA` stays off (switch-off, below).

## Ruling

1. **Zones 6 to 10 show the Batwing Caves painting, all five, once it is vetted and wired** (wired: in `BG_ART` through
   `tools/art/embed-bg.mjs`). In the Hollow, a zone whose area has its painting wired shows that painting; the 7-zone cycle
   no longer decides it.
2. **Until an area's painting is wired, its zones keep today's scenery.** Zones 6, 7 and 8 keep the Mossy Hollow painting,
   zone 9 the procedural cave and zone 10 the procedural bone. This follows "a zone keeps today's live art until its pack
   is wired" (Milestone 1) and the art freeze.
3. **Zones in areas without their own painting are unchanged,** including the Coast. They keep the cycle's theme, and a
   theme that has a painting draws it, as the Mossy Hollow painting does today at zones 15, 22, 29 and 36, 43, 50, 57, 64.
   So once wired, the Caves painting also replaces the procedural cave at zones 16, 23, 30 and the Coast's cave places.
   That is the same theme with approved art, and those zones are outside M1a; each changes again when its own area's
   painting lands. No zone loses approved art.
4. **No recolour.** The painting is drawn as Codex delivered it; `zoneHue` (70 degrees from zone 8) never tints it
   (`bgArtDraw` draws it plain today). Codex paints the Caves version as its own palette and light version of the Mossy
   Hollow night painting (`milestones.md`, The stand-in, 4).
5. **The pack boundary is unchanged.** The backgrounds pack's Caves painting covers zones 6 to 10, as the manifest has it.
   The 2026-10-21 cut keeps it in scope (pack 7 shrinks to the Caves painting).
6. **The code change is its own card,** `scenery-follows-areas` (below), and merges before or with the Caves `integrate:`
   card. The Caves painting is not wired without it.

Left alone: foes in zones 6 to 10 still follow the cycle and `zoneHue`; the Batwing Caves area pack and its `integrate:`
card settle the foes. The painting loads as a WebP, so its first frame in a session can show the procedural scene, as the
Mossy Hollow painting does today; accepted. Nothing here touches a Cal-only item.

## Prediction and measure

- What a player sees: crossing into zone 6, the area title and the scenery change together. Zones 1 to 15 showing their
  area's scenery: 6 today; 6 after `scenery-follows-areas` merges (no visible change); 10 after the Caves painting is wired
  (zones 1-10); 15 after the Bonefield painting.
- Measure: the `slice-art-manifest` check (E4, not built yet; `milestones.md` lists it as a new section) will assert, for zones 1 to 15, that a zone in an area with a wired painting has
  `zoneTheme(z)` equal to that area's `BG_ART` key; the walk (`walk.mjs`) screenshots at zone 6 and zone 10 are judged in
  the Caves `integrate:` card's art pass.
- Missed if, after the Caves `integrate:` merges, any of zones 6 to 10 resolves to a theme other than `cave`, or if, before
  it, any zone 1 to 70 resolves to a different theme than today (`scenery-follows-areas` adds that 1-70 assertion; the
  regions check covers zones 1-35 today).

## Switch-off

`SCENERY_BY_AREA` in `22-data-regions.js`, default on. Off, `zoneTheme` is exactly today's rule (`MOSSY_ZONES`, then the
cycle). With the Caves painting wired and the flag off, zones 6 to 8 show the Mossy Hollow painting, zone 9 the Caves
painting and zone 10 the procedural bone: a mismatch, but no zone loses art. No save impact: `zoneTheme` reads no save
state.

## Coverage and pillar

Coverage-map area 15 (world and story); Compass pillar 4 (the road), week loop step 1 (reach a new area); Milestone 1a, E4.

## Proposed card

`scenery-follows-areas`: lane claude, Sonnet medium, size S, P2. Depends on: none. Areas: `art`, `tools-check` (it edits
`src/js/22-data-regions.js`, which no plan area owns yet, and `tools/check.mjs`). Milestone: M1a E4. Merges before or with
the Caves `integrate:` card.

Acceptance:
- `zoneTheme(z)`: when `SCENERY_BY_AREA` is on, `z` is in the Hollow, and the theme of its area (`ZONE_THEME[zoneAreaIdx(z)]`)
  has a `BG_ART` entry (guarded with `typeof BG_ART`, as `62-stage.js` does), return that theme; else
  today's rule.
- With no `BG_ART.cave`, `zoneTheme` is unchanged for zones 1 to 70 (asserted for all 70).
- With a stub `BG_ART.cave` set through `g.eval` in the check (BG_ART is a `const`, so add a key to the object), zones 6 to
  10 resolve to `cave`, zones 1 to 5 to `forest`, zones 11 to 15 unchanged, Coast zones unchanged.
- A small per-zone table of expected themes (with and without the cave painting) replaces the regions check's 7-cycle
  theme assertion and the area names check's `zoneTheme(8) === 'forest'`, so the Caves `integrate:` card only flips which
  table applies.
- Flag off: identical to today with or without the stub.
