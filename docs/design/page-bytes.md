# Page bytes: fitting Chapter 1's art into the one-page game

Card `page-bytes-plan` (9 Oct 2026). Docs only: nothing here changes the game, the art, the art tools or the generated data.
The gate judge's ruling is `autopilot/rulings/2026-10-09-page-bytes.md` (project files); its verdict is copied at the end.

**The short version.** The page is 8.71 MB of the Artifact's 16 MB. At today's cost per pack, Chapter 1's owed art and a code reserve add
about 64 MB, so the page would be about 72 MB. Lossless steps alone (WebP, a denser text encoding, packing the code) cannot close that.
What closes it is a rule for how Codex exports new sprite packs (lossless WebP, at most 64 colours, hard 1-bit edges: the house
style the heroes already follow), a byte ceiling for every new pack and background, one background picture an area instead of
two, and packing the code. With those, Chapter 1 lands at about 13.7 MB if every new pack stays under the budget in section 4,
leaving 2.3 MB free. No step changes how today's art looks; fewer frames and lossy backgrounds are held in reserve (section 4).
The gate judge adopted the plan with amendments (see Ruling); Cal can undo it by saying "lift the Codex byte rule".

All sizes are decimal (1 MB = 1,000,000 bytes, the stricter reading of the 16 MB limit) and are bytes **as they sit in the page**
unless a line says "file bytes". Measured on the integration branch at `1adfc548` (merge of #293).

## How to re-measure

Every number below names one of these. The scripts only read the repo; `levers.py` writes copies into a scratch folder.

| Tag | Command | What it gives |
|---|---|---|
| [parts] | `node tools/build.mjs && node docs/design/page-bytes/page-parts.mjs` | the page by part |
| [levers] | `python3 -I docs/design/page-bytes/levers.py <scratch>` (Pillow with WebP, about 4 min) | each lever on copies of the two foe packs and the background |
| [decode] | `node docs/design/page-bytes/decode-check.mjs <scratch>` (Playwright Chromium) | PNG vs WebP on the canvas, decode time, DecompressionStream |
| [forecast] | `node docs/design/page-bytes/forecast.mjs <scratch>` | Chapter 1 totals per lever step, the budget check, the zones 1-15 option |

## 1. Today's page

8,705,334 bytes = 8.71 MB, 54% of 16 MB [parts].

| Part | KB in the page | Share |
|---|---:|---:|
| Hand-written code (every non-generated `src/js` file) | 3,050.0 | 35.0% |
| `21zb-data-bgart.js`: Mossy Hollow background, landscape 960x540 + portrait 480x900, lossless WebP | 1,900.6 | 21.8% |
| `21za-data-foeart.js`: Thorn Imp (519 KB) and Gloomjaw (1,125 KB), PNG atlases | 1,644.5 | 18.9% |
| `21u-data-gearicons.js` (110 gear icons, 3 sizes each) | 683.5 | 7.9% |
| CSS (as built) | 370.1 | 4.3% |
| `21s-data-actionicons.js` | 205.7 | 2.4% |
| `21y-data-heroart.js` (Wren, Tobin, Pip: palette + run-length) | 179.9 | 2.1% |
| `21z-data-huntart.js` (interim Hunting art, run-length) | 172.0 | 2.0% |
| `21t-data-navicons.js` | 137.7 | 1.6% |
| `21r-data-resicons.js` | 136.9 | 1.6% |
| `21yc-data-portraits.js` | 111.6 | 1.3% |
| `21v-data-statusicons.js` | 102.5 | 1.2% |
| Shell, title, font links, markup | 10.5 | 0.1% |
| Fonts (Handjet, Barlow Semi Condensed) | 0 | linked from Google Fonts, fetched at run time |

Base64 runs make up 5.24 MB of the page (821 runs) [parts]. Base64 spends 4 characters on every 3 bytes.

Code is the part that grows fastest: hand-written code plus CSS went from 2.60 MB on 1 Oct to 3.38 MB on 9 Oct, about 0.1 MB a
day (`git ls-tree -l` at the last commit of each day, non-generated `src/js` plus `src/styles`). Whole-line `//` comments are
0.65 MB of the hand-written code (21%) [parts].

## 2. Chapter 1 forecast at today's cost

Chapter 1 is 35 zones in 7 areas: 35 zone monsters, 7 Champions and the Fenmother (`enemies-c22-roster.md`). Only Wren, Tobin
and Pip are playable in it: they are the only heroes with kits (`SOLO_ORDER` in `24b-data-solo.js`). Anselm, Maren, Morwen and
Grenna are met in Chapter 1 (`STORY_MEET` in `56c-unlocks.js`) but carry no lamp, so they add no fight art. Unit costs are the measured
per-pack costs in the page today [forecast]:

| Owed for Chapter 1 | Count | Each | MB |
|---|---:|---:|---:|
| Zone monsters (2 of 35 are in) | 33 | 822 KB (mean of Imp 519, Gloomjaw 1,125) | 27.12 |
| Champions (assumed to cost a Gloomjaw) | 7 | 1,125 KB | 7.87 |
| The Fenmother (assumed two Gloomjaws) | 1 | 2,249 KB | 2.25 |
| Area backgrounds, landscape + portrait (Mossy Hollow is in) | 6 | 1,900 KB | 11.40 |
| Gather scenes (`codex-art-gather-scenes`: mine, glade, woods, meadow) | 4 | 1,900 KB | 7.60 |
| Hunting: the vetted pack replaces the interim one (1 scene + 3 beasts, less the interim 172 KB) | 1 | 4,194 KB | 4.19 |
| Ability icons (14 a hero, 3 heroes, at the action-icon cost) | 42 | 7.1 KB | 0.30 |
| Unique item icons (7 zone, 6 raid, at the gear-icon cost) | 13 | 6.2 KB | 0.08 |
| Refined material icons (`art-refined-materials`) | 21 | 3.9 KB | 0.08 |
| Portraits: 3 heroes and Hesketh at 64 and 128 px | 4 | 16 KB | 0.07 |
| Story stills, 320x180 (first-hour-art 3, story-stills 6; at the background's cost a pixel) | 9 | 112 KB | 1.01 |
| Code and CSS growth to 1.0 (a reserve; at today's pace it lasts about 16 days) | | | 1.60 |
| **Total owed** | | | **63.6** |

So Chapter 1 at today's cost is about **72.3 MB**, 4.5 times the limit [forecast]. Not counted, because nobody has decided them:

| Only if it happens | MB at today's cost |
|---|---:|
| Captains with one extra attack each (the roster says they "may need extra attack poses"), at Gloomjaw's largest attack | 11.05 |
| Captains as full re-skins: `milestones.md` counts 35 Captains with "own looks and moves"; the budget puts each inside its monster's ceiling | not priced |
| Heroes redrawn as Codex animation packs (art-direction-v2) at 1x | 2.47 |
| ... at 1.5x pixel scale (bytes assumed to grow with area) | 5.55 |
| ... at 2x | 9.86 |

On the pixel-scale rows: scaling today's Imp and Gloomjaw atlases up by nearest neighbour adds only 10% to 16% at 1.5x and
15% to 22% at 2x [levers, `nn_scale_*`], so the area figure is an upper bound and the real cost of a finer redraw lies between.
Today's foe body atlases are 7,302 to 50,234 colours each (effect atlases 110 to 2,117) and Gloomjaw has 256 alpha levels
[levers, `colours`, `alpha_levels`]; detail drawn that way grows with area.

Steam has no 16 MB limit (the game ships as files there); this plan is about the web page only.

## 3. The levers, measured on the two real foe packs

Each lever was run on copies of the Imp and Gloomjaw atlases (22 atlases, 165 frames) and on the Mossy Hollow background
[levers]. "Pixel-identical" means every RGBA value of every pixel matched after decoding with Pillow, unless the line says more.
The Imp and Gloomjaw columns are **file bytes** (the PNG or WebP itself), except levers 10 and 11, which are characters in the page.
The browser columns were measured in Playwright's Chromium 141, not inside the Artifact sandbox: every lever that needs a new
browser API is probed on the preview Artifact before it is built.

| Lever | Imp | Gloomjaw | Looks the same? | Load cost | What Codex changes |
|---|---|---|---|---|---|
| **1. Lossless WebP** instead of PNG | 387 -> 283 KB (-27%) | 841 -> 599 KB (-29%) | Yes: decoded pixel-identical [levers, `webp_identical`]. On a Chromium canvas the Imp is identical; Gloomjaw's semi-transparent pixels (never opaque ones) come out up to 2/255 apart once drawn over grey, from the browser's alpha rounding [decode] | About the same: all 22 atlases decoded in 157 ms as WebP vs 176 ms as PNG here; the judge's two runs gave 191 vs 182 and 142 vs 144 [decode]. WebP already ships in the Artifact (the background) | Export lossless WebP, as Codex already does for backgrounds |
| **2. Palette-indexed PNG or WebP** | not lossless for the body atlases (7,302 to 22,986 colours); only the four effect atlases (110 to 705) fit 256 | not lossless: up to 50,234 colours, 256 alpha levels | No. Forcing 256 colours on today's packs: WebP 91 KB / 176 KB (-68% / -71%), but each atlas moves 21% to 42% of its pixels by more than 8/255 (mean error 2.1 to 3.8) | none | See lever 8: the saving comes from drawing in few colours, not from converting |
| **3. Trim empty atlas space** (crop every frame, repack tightly) | 283 -> 282 KB | 599 -> 616 KB (+3%) | Yes (each crop read back identical) | none | Nothing: WebP already codes empty space for almost nothing. Not worth it |
| **4. Shared frames** (drop exact and mirrored repeats) | 7 exact repeats, 0 mirrored: 282 -> 282 KB | 1 repeat: 616 -> 608 KB | Yes | none | Nothing for bytes: WebP already finds repeats. Repeats in the manifest stay free |
| **5. Fewer frames** (every other frame of actions over 8 frames; both sides trimmed and packed) | 77 -> 57 frames, 282 -> 218 KB (-23%) | 88 -> 67 frames, 616 -> 420 KB (-32%) | **No**: motion gets choppier. Judge only | none | Draw key poses and hold them with manifest timing |
| **6. One atlas per area** (both packs in one image) | 898 KB separate -> 931 KB together (+4%) | | Yes | none | Nothing: it costs bytes. Keep one atlas per action |
| **7. Deflate decoded in-page** (`DecompressionStream`) | raw pixels deflated: 358 KB, worse than WebP; PNG bytes deflated: 380 KB (-2%) | 808 KB; 832 KB (-1%) | Yes | Chromium has `gzip`, `deflate`, `deflate-raw` (no `brotli`) [decode] | Nothing for art. It pays on **code**: see lever 9 |
| **8. Draw new packs in at most 64 colours with hard 1-bit edges** (export rule) | 283 -> about 78 KB (32 colours: 52 KB) | 599 -> about 91 KB (32 colours: 84 KB) | Today's packs would look different, so this is a rule for **new** packs, never a conversion. The numbers are today's art cut to 64 flat colours an atlas (not across the pack) with no dithering and hard edges, a stand-in for a pack drawn that way. Capping per atlas allows more colours than a cap across the pack, so the stand-in is conservative. It is a style rule, so art-direction-v2 and the art judge own it; new packs drawn this way would not match Gloomjaw's soft edges, which the art freeze's "every piece matches" has to settle | none | At most 64 colours across the whole pack, alpha only 0 or 255 (no soft edges or glows; a glow is drawn as solid pixels), lossless WebP. Heroes already work to 40 colours (`art-pipeline.md`) |
| **9. Pack the code**: hand-written code and CSS deflated at build, one string unpacked at boot | | | Yes (the code is the same once unpacked) | Inflating 1 MB takes milliseconds; must be probed in the Artifact sandbox (card 2, pack-code) | None |
| **10. basE91 text instead of base64** for every embedded file | 377,600 -> 348,203 chars (-7.8%); a base-122-style code would give 323,655 (-14%) | 799,312 -> 736,971 (-7.8%) | Yes (same bytes) | One decode loop, then `createImageBitmap(new Blob(...))`, which works in Chromium [decode]; probe in the sandbox. basE91 uses `"` and `<`, so each string sits in single quotes outside any JSON | None |
| **11. One background picture an area** (landscape only; upright screens show a crop) | Mossy Hollow: 1,900 KB -> 1,011 KB in the page (-47%) | | Landscape: identical. Upright 360x740: a crop instead of the drawn portrait, so the judge rules | none | Draw one 960x540 picture an area, with the upright crop's safe area marked |
| **12. Lossy WebP for painted backgrounds** | Mossy Hollow landscape 759 KB -> 254 KB at quality 95 (mean error 2.3/255), 190 KB at 90 (2.9/255) | | **No**: lossy. Judge only, never a default | none | Nothing |

Two smaller facts from the same run: the Imp pack carries 2 frames the game never plays (the review-only idle hold at the end
of jab and crosscut) [levers, `frames_not_played`]; and re-optimising the PNGs saves under 2% [levers, `png_reopt`].

## 4. Order, and the budget

The table stacks the levers in the order the forecast prices them; the build order the judge set is in section 7.
Each step's Chapter 1 total [forecast]:

| Step | Today's page | Owed | Chapter 1 total |
|---|---:|---:|---:|
| A. Today's cost per pack | 8.71 | 63.6 | 72.28 MB |
| B. + foe packs as lossless WebP (lever 1) | 8.24 | 52.4 | 60.66 MB |
| C. + basE91 for every embedded file (lever 10) | 7.90 | 48.4 | 56.33 MB |
| D. + new packs drawn to the export rule (lever 8) | 7.90 | 13.8 | 21.73 MB |
| E. + one background picture an area (lever 11) | 7.08 | 10.8 | 17.84 MB |
| F. + code and CSS packed (lever 9) | 4.95 | 9.8 | 14.72 MB |
| G. (judge only) F + fewer frames (lever 5) | 4.95 | 8.3 | 13.26 MB |

("Owed" includes the code reserve, which shrinks to 0.6 MB once code is packed.) The two packs and the background already in the
game keep their pixels in every step; only their encoding changes (and Mossy Hollow's portrait copy goes in step E, which the
ruling holds back until the art judge has seen the upright crop). Step D prices backgrounds at the 64-colour stand-in as a proxy
for the 190 KB ceiling; the ruling sets no colour cap on backgrounds, so for them the ceiling is what binds.

Step F's estimate is 0.72 MB over a 2 MB margin because it prices new packs at the measured stand-in. The budget below is what
Codex is briefed on, so that the whole of Chapter 1 fits with the margin. At these ceilings the total is **13.66 MB, leaving
2.34 MB under 16 MB** [forecast, "Budget at the ceilings"].

**Proposed margin: keep 2 MB free** (the ceiling for the page is 14.0 MB), for code growth beyond the reserve, the Captains'
poses if they grow, and late fixes.

**Ceilings, in file bytes** (lossless WebP, every atlas of the pack together; each file byte costs 1.23 characters in the page).
They hold per pack and per area sheet: an area's 5 monsters with their Captains share 425 KB, so a small monster can lend bytes to
a big one (`DECISIONS.md`: "a pack may be an area sheet").

| Pack | Ceiling | Measured stand-in today |
|---|---:|---|
| Zone monster, including its Captain's extra poses | 85 KB | Imp 78 KB, Gloomjaw 91 KB at 64 colours; 52 / 84 KB at 32 |
| Champion | 120 KB | none yet (a Gloomjaw-sized pack at 64 colours is 91 KB) |
| The Fenmother | 200 KB | none yet |
| Hunting beast | 60 KB | none yet |
| Five monsters of one area, with their Captains | 425 KB | |
| Background (area, gather scene or hunting ground): one 960x540 picture, no colour cap | 190 KB | Mossy Hollow landscape: 759 KB as approved (139,151 colours); 249 KB at 64 colours, 198 KB at 32 |
| Story still, 320x180 | 25 KB | none yet |
| Icon | today's sizes: about 1.3 KB a size an icon | today's icons |
| Hero pack, only if art-direction-v2 asks for raster heroes | not in the budget: it needs its own room (assuming 150 KB a hero, a Champion-sized pack, 3 heroes take 0.55 MB, a quarter of the margin) | |

Backgrounds get no colour cap: a cap would re-brief the painting style, which art-direction-v2 owns, and Mossy Hollow cut to 64
colours looks worse (mean error 3.98) than lossy quality 95 at the same size (2.34) [levers]. So a painted scene has to reach
190 KB lossless by how it is painted, a quarter of Mossy Hollow's 759 KB.

Captains are inside the monster's ceiling, look and extra poses alike. Gloomjaw's stand-in (91 KB) is already over 85 KB, so a
Captain's extra action means fewer, held frames, a smaller monster in the same area sheet lending bytes, or fewer colours.

**Reserve only** (the judge): fewer frames (lever 5) and lossy WebP at quality 90 or higher (lever 12), for new packs only, the art
judge deciding each pack. They trigger when either happens: the size check warns (over 12 MB) after code packing has landed, with
art still owed that will not fit; or Codex's first two backgrounds miss 190 KB lossless at a look the art judge passes.
Quantising existing art is never done.

**For Codex** (these lines go to the art-direction-v2 thread through the coordinator; that thread owns the brief):
1. Export every pack and background as lossless WebP.
2. Sprite packs (monsters with their Captains, Champions, the Fenmother, beasts): at most 64 colours across the whole pack, alpha
   0 or 255 only, no soft edges or glows.
3. Stay under the ceiling above in file bytes, all atlases together: monster with Captain 85 KB, an area's five 425 KB, Champion
   120 KB, Fenmother 200 KB, beast 60 KB, still 25 KB.
4. Backgrounds: one 960x540 picture an area, at most 190 KB, no colour cap, with the upright crop's safe area marked.
5. Hold key poses with manifest timing rather than drawing in-betweens that barely move.

## 5. Option only Cal decides

**The web build carries zones 1-15, Steam carries the rest.** This is tied to Cal's open money decision and is not picked here.
Its bytes: 41.50 MB at today's cost, 10.51 MB at step F, and 24.28 MB with the lossless steps and code packing but no export
rule [forecast, "Option, Cal-only"]. So it does not replace the export rule; with the rule it frees about 4.2 MB for the zones
it carries.

## 6. Follow-up card spec: a page size check in `tools/check.mjs`

Card name: `page-size-check`. Lane claude, class tooling, Opus medium.

- **Check:** after the build, read `dist/lanternfall.html`'s byte size. **Fail** above 14,000,000 bytes (the ceiling with the
  2 MB margin); **warn** above 12,000,000 bytes, printing the five largest parts the way `page-parts.mjs` does.
- **Per pack:** for each pack in `21za-data-foeart.js` and `21zb-data-bgart.js` (and later files of the same kind), fail when a
  pack's decoded file bytes pass its ceiling in section 4, naming the pack; also fail when an area's monsters pass 425 KB
  together. A pack's kind (monster, Champion, Elder, beast, background, still) comes from a table of stage keys in the check,
  or from a `kind` field once the embed tools write one.
- **Known exceptions,** listed with their measured sizes so the check is green on day one and catches only new art: the Thorn Imp
  and Gloomjaw packs, Mossy Hollow's two pictures and the interim Hunting art.
- **Growth line:** print the code and CSS source bytes next to the same at `git merge-base HEAD origin/claude/elegant-johnson-m6k00u`,
  so a PR that adds 100 KB of code says so.
- **Out of scope:** changing any art, art tool or generated data file; the levers themselves.
- **Check for the builder:** `node tools/build.mjs && node tools/check.mjs` passes; two mutation runs fail with their messages: a
  scratch copy of the page padded past 14 MB, and a scratch pack over its ceiling.

## 7. Build cards this implies (the Foreman cards them)

In the order the judge set. Every card that touches art or art tools also follows the art freeze in `CLAUDE.md`.

1. **page-size-check** (section 6). No art change. First, so every later step is measured.
2. **codex-export-rule**: the lines for Codex in section 4, sent to art-direction-v2, which owns the brief. Briefing only.
3. **embed-base91** (lever 10). One decoder for every embedded file. Probe `createImageBitmap` from a Blob in the sandbox first.
   The encoder must refuse a string that contains `</script`. Frees 0.34 MB today and 7.8% of every later pack.
4. **pack-code** (lever 9). Build change: hand-written code and CSS deflated into one string and unpacked at boot. First a probe on
   the preview Artifact that `DecompressionStream` and running the unpacked script work in the sandbox (CSP). Error reports must
   keep their line numbers (`55-errors.js` records them), and `check.mjs` reads the built page, so its checks must read the
   unpacked source. Frees 2.1 MB today and keeps future code at about 38% of its size.
5. **foe-webp-embed** (lever 1). `tools/art/embed-foes.mjs` embeds WebP. New packs come from Codex as WebP. Re-encoding the two
   shipped packs is allowed in principle (no pixel changes) and goes through the Opus art judge as an `integrate:` card with the
   decode proof. Frees 0.47 MB today.
6. **one-background-an-area** (lever 11), for new areas. Mossy Hollow keeps its portrait picture until the art judge has seen the
   upright crop at 360x740. Frees 0.82 MB today once Mossy Hollow follows (0.89 MB while base64 stays).
7. Reserve only, on the trigger in section 4: fewer frames (lever 5) and lossy backgrounds (lever 12). The zones 1-15 web build is
   Cal's call (section 5).

## Ruling

Gate judge (Opus, high), 9 Oct 2026; full text in `autopilot/rulings/2026-10-09-page-bytes.md` (project files).

- **Ruling:** adopt with amendments. Build order as in section 7. The export rule covers sprite packs only; backgrounds get lossless
  WebP and the 190 KB ceiling with no colour cap; Captains fit inside their monster's ceiling; ceilings hold per pack and per area
  sheet (425 KB); the shipped packs are re-encoded only through the art judge; fewer frames and lossy backgrounds (quality 90 or
  higher) are reserve only, on the trigger in section 4; existing art is never quantised. The size-check spec is adopted with the
  fixes now in section 6. The zones 1-15 split is not ruled on: it stays Cal's.
- **Veto phrase:** "lift the Codex byte rule".
- **Prediction:** with page-size-check, embed-base91, pack-code and foe-webp-embed merged and no new art, `page-parts.mjs` reports
  at most 5.2 MB (step F says 4.95), and the first Codex monster pack under the rule is 85 KB or less. Missed if the page is over
  5.5 MB or the pack over 100 KB.
- **Risks:** Captains drawn as full re-skin atlases would add about 3.4 MB and break the plan (a Codex Captain delivery shows it);
  code growth beyond the reserve (the size check's growth line shows it); the first real pack missing its ceiling.
