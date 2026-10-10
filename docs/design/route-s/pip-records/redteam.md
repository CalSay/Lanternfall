_Scratch record, copied from `/mnt/project-files/experiments/route-s-judge-pip/` for the ruling ([../ruling-pip.md](../ruling-pip.md)). Relative paths below point into that scratch folder._

# Red team: do not wire Pip's route S pack yet (10 Oct 2026)

Brief: argue against wiring Pip's route S pack (`2d-poses-scenario/pip-moves/`, 23 moves x 8) and her effect sprites
(`hero-fx-test/fx/fireball*, frost*, spark*, kindle*, flames*, hex0, cinder*`). Scratch only: nothing wired, no credits, no network.
Tools and outputs are in `route-s-judge-pip/redteam/` (`*.py`, `*.json`, `*.png`). Paths below are relative to that folder unless
they start with `../`. Cal's 00:40 pipeline rule allows Scenario poses, so I do not argue "Codex only".

## Verdict: re-brief (not shelve)

Pip is the lightest and cleanest of the three packs. Her border halo is a fifth of Tobin's, her palette holds, and she is on-model.
But she does not fit the one-file page either. The README's "exactly two arms in every frame" is wrong in two victory frames. Her
woodcut repeats the failure Wren's ruling already rejected, and the Hex sprite says the wrong status. She has to wait for the split
build anyway, so rerolling 4 sheets now (about 72-76 credits) costs no schedule. Then wire her with Tobin's split-build card.

### Three strongest points
1. **Cal's defect is still there: two frames have a third hand, and the README says none do.** In victory-5 she pumps a fist, a
   second hand grips the staff where her elbow should be, and her rear hand hangs at her hip. In victory-7 one hand tips her hat,
   one grips the staff, and one rests on her hip (`crop-victory-3hands-zoom.png`, `crop-victory-arms.png`). The staff also
   changes hands in 4 moves the README does not list. In Arcane Ward's opening "ready stance" (frame 1) the staff is in her front
   hand while her rear hand hangs empty, and it swaps back and forth 3 more times inside the move (`crop-arcaneward-hands.png`).
   Nova 2-7 and parry 6 also hold it on the front side (`crop-nova-parry-hands.png`). With hit, defeat and victory, that is about
   16 frames with the staff in the front hand and about 12 joins where it jumps hands. In victory-8 the staff is about two-thirds
   its length: the orb sits at her chin, not above her head.
2. **Bytes: she misses the 12 MB second-hero line, and she cannot share the page with Tobin.** Today's page is 8,404,328 bytes
   (`dist/` at 4b4418cd, after #333 added 44.7 KB). With Wren's ruled sets it is 10.88-10.93 MB, leaving 822 KiB of room. Pip's
   fight set plus her fx is 1,180 KiB, so the page reaches **12.38-12.46 MB**, 357 KiB over. Without Wren's gather set it is still
   12.02-12.10 MB. Tobin's draft (12.79-12.88 MB on today's base) plus Pip gives 14.29-14.42 MB, past the 14 MB fail line. B1
   (everything loads first) is 8.35 MB with Wren and Pip, past its 8.0 MB fail line. B2's boot set with Pip's core 7 is 4.17 MB,
   past the provisional 4.0 MB line. Only her core 7 fits (11.40-11.46 MB), and the whole-pack rule forbids that. (`bytes.py`,
   `bytes.json`)
3. **Her props and effects contradict what they mean.**
   - Woodcut v5 frames 4-6 draw the axe head edge-on: steel about 4-6 x 12-20 art px at 190 px, swung level at chest height
     (`axe.json`, `crop-woodcut-axe.png`). Wren's ruling failed her v3 for this exact reason ("a 4-5 x 16-22 px sliver ... its
     level jab matches the Hunting spear loop").
   - The Hex sigil is an opaque dark disc. 57.5% of it is near-black, it fills 0.75 of its box, and its centre third is 100%
     opaque. It has violet runes (140,80,205), almost exactly the live **Blind** colour (130,70,210). Its gold rim (237,176,55) is
     **Mark**'s colour (255,196,60). The live Curse colour is magenta (200,40,170). And it has an eye in the middle, which is Searing
     Eye's motif. So it reads as Lantern Flare's Blind and Mark, not Hex (`fx.json`, `fx-sheet.png`, `62b-fx.js:20-22`).
   - Lanternburst never uses the lantern: it hangs on her belt while she thrusts the staff, the same two-handed chest-height thrust
     as Attack 5 and Frost Shard 4. The brief says "the lantern does not leave her hand" and "a lantern-centred ring opens"
     (`ability-art-brief.md:69,101`).

## Findings, with evidence

**Bytes.** Pip's files (seeded) are fight 19 moves 1,143.4 KiB, gather 225.2 KiB, all 23 1,368.6 KiB, core 7 408.2 KiB, fx 36.2
KiB at half size (96.5 KiB at cut size). All are under the 2.0 MB hero ceiling (1,465 KiB with fx). The plain palette adds 13 KiB.

**Scale (`head.py`, `head.json`, `orb.py`, `orb.json`, `lineup-x2.png`).**
- Smaller on purpose: `art-pipeline.md:93` makes Pip about 86 px against 96 for adults (0.896, so 170 art px against Wren's 190).
  At idle her hat top is 177 (0.93 of Wren's line).
- Smaller by accident: the idle sheet is drawn larger than every move sheet. The staff orb is a sphere, so it cannot foreshorten.
  Against idle-1 (77.7 px) it measures 0.84-0.94 in the fight moves and 0.70-0.82 in gathering. Hat tops on opening frames
  are: attack 163, fire 162, wildfire 155, dodge 161, lanternburst 165, hunt 134, against idle's 177. In those moves she reads
  13-18% under Wren, not 10%.
- The pack scale K was set from idle's staff tip, so most moves come out 4-8% small. Best-fit silhouette scales for frame 1 are
  0.98-1.08 (inside Wren's 0.88-1.12 band). Hunt needs 1.12-1.18 by silhouette and 1.32 by hat top.
- Inside a sheet, frames 1 and 8 are both "ready stance", yet their hat tops differ by 7-14 px in attack, fire, arcaneward, kindle,
  hex and lanternburst. With hit, parry, victory and hunt, 11 of 22 standing moves cannot meet gate 2's ±3 px with one scale. Tobin
  had 8. A caveat: the hat brim flops ±2 px.

**Motion (`motion.py`, `motion.json`).**
- The idle boils 14-20% a step (Wren 8-18%, Tobin 15-26%). Idle 3 lifts a hand to the hat brim and idle 6 taps the staff (26% from
  idle-1), so only a held idle-1 with code breathing can pass gate 3.
- Joining idle to each move changes 21-35% (Arcane Ward 35%, from the staff swap). Gathering joins change 29-47%.
- Big jumps inside moves: defeat 74%, nova 62% (2->3), forage 61%, frost shard 57% (5->6, staff level to hugging herself),
  victory 57%, parry 55%, mining 52%, dodge 51%.
- Airborne frames sit on the baseline in `frames/`. The raw sheets keep the height: dodge 3-4 sit 135-146 px (about 30 art px)
  above that row's ground, and victory 4 sits 72 px above (`air.py`, `air.json`). Cut from the sheets with a ground line, as Wren's
  gate 2 requires.

**Meaning against the live game** (`24c-data-abilities.js:69-82`, `62b-fx.js:67-79`, `62-stage.js:682`).
- Live #333 fires every Pip cast from one fixed hand point (`handX = ax+10`, `handY = hy-44`). Nova (a ground slam) and Lantern
  Flare (a lantern flash with her face turned away) are live `d: 'bolt'`, so an orange bolt would leave her "hand" while she slams
  or shields. The build must re-recipe them or add anchors.
- The fx4 stage test that Cal saw does not match live: its colours differ (curse 150,60,200; ward 170,140,255) and Nova and
  Searing work differently.
- The README's emitter table is stale for Fireball: (702,298) lies outside fire-v4's 664 px-wide frame (`emit.json`). The other
  points are within 2-29 full px (under 6 art px).
- Arcane Ward and Lantern Flare are "lantern raise" in the brief. Flare uses the lantern; Ward spreads her arms.
- Release frames match fx4's hit indices on all 13 moves.

**Cal's defects, counted.** The halo is largely fixed: 258 pale edge px on coloured parts over 184 frames (Tobin 1,184) and 14
light-blue (`halo.json`). But holes.py misses white pockets on the border: background trapped inside the outline at hair tips.
Six of them show as 2-3 px white dots at game size: attack-4, spark-8 (her closing ready stance), kindle-3, dodge-3, woodcut-3 and
woodcut-4 (`specks.json`, `specks-x.png`; kindle-7 and victory-4 are a tassel glint and teeth). There are about 6.5 enclosed holes
a frame (1,188), the same as Tobin; I did not view them. Colour holds: no frame has more than 1.5% magenta (`colour.json`). Third
hands: 2 (victory 5, 7). Staff swaps: see point 1. Staff shrink: victory-8. Woodcut axe: frames 4-6.

**Effect sprites (`fx.py`, `fx.json`, `fx-sheet.png`).** They are clean (0 pale edge px), and 1-bit alpha keeps their shapes. But
the set is split: flames, hex and cinders have dark outlines (47-90% of edge px), while fireball, frost, spark and kindle have none
(0-5%) and are 23-44% soft alpha. Those four are glows, which #333 already draws live (an orange head plus the 62b trail). A
sprite would ride on a second head unless the build turns `A.proj` off for them. The burning-ground loop does the same to live
`flames()` on 5 abilities.

**Mixed style (`lineup-x2.png`, `picker-mock-x4.png`, `mixed.json`).** I concede most of this. One hero is on the stage at a time.
The outline share is 0.84 (Wren 0.79, Tobin 0.70), so she matches route S Wren best. Today's chibi Pip next to route S Wren is the
bigger clash, and wiring Pip shrinks it.

## The strongest honest case for wiring
She is the lightest pack (1,143 KiB fight set), on-model against the concept (hat, curls, rust coat, book and belt lantern), the
cleanest halo of the three, with stable colour, release frames that match the test's hit table, and good meaning on 10 of 13 casts.
Most of the motion faults have the conversion fixes Wren's ruling accepted.

## What I would keep, and what I would require
**Keep:** idle (held frame 1), attack, all 12 casts except Arcane Ward and Lanternburst, parry, dodge, hit and defeat (with skips),
mining, forage and hunt, plus the frost, kindle, cinder and fireball sprites as shapes.

**Rerolls first** (Cal's OK; 18-19 credits a sheet; the pack has spent 828 of about 1,000):
1. Victory: two hands, the staff at full length in one hand.
2. Arcane Ward: the staff stays in her rear hand from frame 1.
3. Woodcut v6: a broad face on frames 4-6 and a downward chop.
4. The marks sheet: a hex sigil in Curse magenta, with no eye, an open ring and no solid disc.

That is 72-76 credits, or about 150 with one retry each. Optional, at the judge's call: Lanternburst with the lantern held (19),
and hunt redrawn at pack scale (19).

**Gates on the wire card:**
1. Pip embeds only after the split (B1 at most 8.0 MB first load, or B2 with the art-loader's re-set boot line), never on the
   one-file page with Wren's sets. Fight set at most 1,200 KiB; fx at most 40 KiB at half size.
2. Cut from raw sheets with a ground line per row. One scale per move inside 0.88-1.12 (hunt only by name), set by the orb diameter
   or a silhouette fit, not by the staff tip. Opening and closing hat tops within ±4 px of idle-1's at that scale.
3. Hold idle-1 with code breathing.
4. A check asserts the staff is in her rear hand on every frame except the named two-handed ones.
5. The holes pass removes border pockets, and the PR shows the 6 named frames at game size.
6. Per-move emit anchors, measured on the frames that actually ship (fire-v4). Nova and Flare re-recipe so that no bolt leaves the
   hand.
7. Fireball, spark and kindle sprites replace the live head (no double head), and the burning-ground loop replaces live
   `flames()`, not both.
8. Wren's gate 12 clip for Pip: Attack, Fireball, Arcane Ward, Hex, Nova, Lanternburst, parry, idle.
