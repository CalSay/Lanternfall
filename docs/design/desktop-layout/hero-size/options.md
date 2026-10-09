# Hero size on screen: the options and what they measure (hero-screen-size-ruling, 2026-10-09)

Evidence for the judge's ruling in `docs/design/desktop-layout.md` ("Hero size ruling"). Card:
`autopilot/cards/hero-screen-size-ruling.md`. Base: integration `0689869e`.

The question (Cal, 9 Oct 15:31 and 16:22): "We could probably make the heroes slightly bigger now that our focus is on a
browser/desktop game right?" and "Can we not make them bigger? Why do we have to be limited to the current game size?"

## How the mockups were made

`mock.cjs` (this folder; not game code) loads a scratch copy of the built page with one line changed, the landscape
stage's zoom floor in `62-stage.js:155` (`LAND_ZOOMS = [2, 3, 4], LAND_MIN_W = 360, LAND_MIN_H = 280`). Nothing in the
repo's game code, stage or art changed. Zooms stay whole numbers, so every art pixel is 2, 3 or 4 screen pixels.

| Option | Scratch line | Zoom at 740x360 / 1280x720 / 1366x640 / 1920x1080 |
|---|---|---|
| **Keep** (today) | `LAND_MIN_W = 360, LAND_MIN_H = 280` | x1 / x2 / x2 / x3 |
| **x3 at 1280** | `LAND_MIN_W = 300, LAND_MIN_H = 220` | x1 / x3 / x2 / x4 |
| **x4 at 1920** | `LAND_MIN_W = 360, LAND_MIN_H = 250` | x1 / x2 / x2 / x4 |

360x740 uses the portrait rule, which none of the options touches (x1 in all three).

Saves: `tests/fixtures/save-current.json` (Tobin, zone 20 boss, The Sepulchre Engine, 140 art px tall: the turn banner
and a foe-trick tip are up) and `tests/fixtures/save-early.json` (Wren, zone 8 boss, Elder Moss Slime, on the painted
Mossy Hollow picture). Shots at device pixel ratio 1, 1.5 s after load, mouse context. Images are lossy WebP (quality 88)
to keep the repo small; judge pixel edges on the live game, not on these files.

## What each option measures

Measured with `node mock.cjs <dist> <out> <option> <save> <sizes>` (stage numbers from `stageStats()` and
`stageRects()`; "text bottom" is the lowest text overlay in the stage's upper half: the place line, turn banner and tip).

| View | Option | Zoom | Hero height | Hero share of stage height | Boss (Sepulchre) top | Text bottom | Boss head vs text |
|---|---|---|---|---|---|---|---|
| 1280x720 | Keep | x2 | 202 px | 30% | 308 | 265 | clear by 43 px |
| 1280x720 | x3 at 1280 | x3 | 303 px | 46% | 167 | 265 | **under the banner by 98 px** |
| 1280x720 | x4 at 1920 | x2 | 202 px | 30% | 308 | 265 | clear by 43 px |
| 1920x1080 | Keep | x3 | 303 px | 30% | 457 | 285 | clear by 172 px |
| 1920x1080 | x3 at 1280 | x4 | 404 px | 40% | 316 | 285 | clear by 31 px |
| 1920x1080 | x4 at 1920 | x4 | 404 px | 40% | 316 | 285 | clear by 31 px |
| 1366x640 | all three | x2 | 202 px | 35% | 244 | 265 | under by 21 px (today too) |
| 740x360 | all three | x1 | 101 px | 32% | 157 | 236 | under by 79 px (today too) |
| 360x740 | all three | x1 | 101 px | 28% | 248 | 287 | under by 39 px (today too) |

(Hero height is from the hero's top to the ground line, so it includes Tobin's raised sword: about 101 logical px.)

What the shots show beyond the numbers:
- **x3 at 1280** ([boss](x3-at-1280-boss-1280x720.webp), [Wren](x3-at-1280-wren-1280x720.webp)): the hero fills the
  stage and reads boldly, but the stage is only 301 x 221 logical px. The boss's crown sits behind the turn banner and the
  tip; the hero's sword crosses the boss's body (the foe slot is a share of a narrower stage). On the painted Mossy
  Hollow picture, Wren is as tall as the cottages behind her: the picture does not scale with the zoom, the sprites do.
  A 1366x640 window keeps x2, so a bigger laptop window shows a smaller hero than 1280x720.
- **x4 at 1920** ([boss](x4-at-1920-boss-1920x1080.webp), [Wren](x4-at-1920-wren-1920x1080.webp),
  [gather](x4-at-1920-gather-1920x1080.webp)): 1280x720 is unchanged. At 1920x1080 the hero is 40% of the stage instead
  of 30%; each art pixel is a 4 px block. The boss head clears the banner by 31 px. The sword again overlaps the boss
  (spacing would need a look). On the code-drawn gather scene, which scales with the zoom, it looks whole; on the painted
  fight picture the 4 px sprite pixels sit beside fine painted detail.
- **Keep** ([boss 1280](keep-boss-1280x720.webp), [boss 1920](keep-boss-1920x1080.webp),
  [Wren 1920](keep-wren-1920x1080.webp)): the hero is about 30% of the stage height at both desktop sizes. At 1920x1080
  the upper half of the stage is sky and painted background.
- **The Camp tab** ([keep](keep-camp-1920x1080.webp), [x4](x4-at-1920-camp-1920x1080.webp)): the menu panel covers the
  stage; the camp picture inside the menu does not change with the stage zoom.
- **One hero on the stage.** The party, formation and lanes were removed (`docs/GAME.md`, "Removed from the code"); the
  starters who join at zones 5, 10 and 15 take turns through Switch, so there is no party of three to fit. Turn fights show
  one foe at a time.

## Finer art (art-scale-ruling's question), for the plain answer to Cal

Finer art means Codex draws more pixels per hero (for example 192 px instead of 96), not a bigger zoom. The 3D test render
shows what more pixels buy: [reference-3d-wren-192px.webp](reference-3d-wren-192px.webp) (Wren's current sprite on the
left, the Hunyuan3D model rendered at about 190 px beside it; **reference only, never game art**, art is made by Codex).
The outfit, bow and cape read better; the style moves from chunky pixel art toward detailed painted sprites.

How finer art lands on whole pixels (whole-number zooms only):

| Art height | 1280x720 | 1920x1080 |
|---|---|---|
| 96 px (today) | x2: 192 px | x3: 288 px (x4: 384) |
| 144 px (1.5x) | x2: 288 px (43%) | x2: 288 px or x3: 432 px |
| 192 px (2x) | x1: 192 px, finer | x2: 384 px, finer (x1.5 is uneven on a 1x monitor) |

So 2x art gives the same 1920x1080 size as "x4 at 1920" with finer detail, and today's size at 1280x720.

Bytes (from `docs/design/page-bytes.md` section 2 and its hero-pack row; not re-measured here):
- Heroes as Codex packs: 2.47 MB at today's scale, 5.55 MB at 1.5x, 9.86 MB at 2x if bytes grow with area (an upper
  bound). Under the Codex byte rule, page-bytes assumes about 150 KB a hero, 0.55 MB for the three starters; at 2x by area
  that is about 2.2 MB. The low end: today's three heroes are 180 KB in the page's own run-length format
  (`21y-data-heroart.js`), about 0.6 MB at 2x (`art-direction-v2.md` section 2).
- **On the Artifact:** Chapter 1 at the byte-rule ceilings is 13.66 MB of the 14 MB page ceiling (2.34 MB under the
  16 MB hard limit). Hero packs are not in that budget. 2x heroes (0.6 to 2.2 MB) would take up to all the room under 16 MB, and
  2x foes do not fit the per-pack ceilings without cutting frames (`art-direction-v2.md` section 2).
- **On Netlify (or Steam):** no page ceiling; art can load after the first screen. host-move-plan has not ruled a load
  budget yet, so this ruling gives no Netlify number of its own.
- **Style cost:** at 192 px the 1-px outline is half as thick on screen and shading clusters get smaller; it becomes a
  different look, which art-direction-v2's sample test and art-scale-ruling decide.
- **Codex time** (`art-direction-v2.md` section 2): about 6 to 12 h for the three heroes at 2x, and every foe still to
  come at the same scale, about 20 to 60 h more across Chapter 1.

## Window sizes the red team asked for (re-measured)

The red team pointed out that a maximized browser on a 1080p monitor is about 1920x950, not 1920x1080. Same mock, same save:

| Window | Keep | x3 at 1280 | x4 at 1920 |
|---|---|---|---|
| 1920x950 (maximized 1080p) | x3, 303 px, 34% | x4, 404 px, 46% | **x3**, 303 px, 34% (no change) |
| 1600x900 | x2, 202 px, 24% | x3, 303 px, 36% | x3, 303 px, 36% |
| 1440x900 | x2, 202 px, 24% | x3, 303 px, 36% | x2, 202 px, 24% |
| 1366x768 | x2, 202 px, 28% | x3, 303 px, 43% | x2, 202 px, 28% |
| 2560x1440 | x4, 404 px, 29% | x4 | x4 |

So "x4 at 1920" only changes a full-screen 1920x1080 (and flips 1600x900 to x3, which the desktop-layout check pins at x2);
"x3 at 1280" changes most laptop windows and has 1 px of height slack at 1280x720. A 2560x1440 screen already draws x4 today.
