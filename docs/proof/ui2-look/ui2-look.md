# ui2-look: the Lantern Brass look (UI redesign stage 1)

Card: `autopilot/cards/ui2-look.md`. Design: `docs/design/ui-redesign.md` sections 1-3. Mockup: https://claude.ai/artifact/ByLSRghC3o64DRhoraqg7F

## Shots

Each image is **Before | After | Mockup** (the mockup has no 1920x1080 frame, so that pair is Before | After; compare it with the 1280x720 mockup column).
Mid save (zone 20), reduced motion, the players' fonts.

- Fight: `fight-1280x720.jpg`, `fight-1920x1080.jpg`, `fight-740x360.jpg`, `fight-360x740.jpg`
- Craft menu: `craft-1280x720.jpg`, `craft-1920x1080.jpg`, `craft-740x360.jpg`, `craft-360x740.jpg`
- Route: `route.txt` (fight, then Craft; passes in desktop, `--landscape` and `--portrait`)

## What changed

- Fonts: Cinzel 600 for names and titles (a new `--title` role: place name, foe name, menu and card titles, loading name),
  Barlow Semi Condensed for everything else (`--display` for numbers and buttons, `--body`). Handjet is gone; `--display-k` is 1.
- Colours: night ink ground `#080B12`, opaque night panels (`--panel` #0B0F18, `--panel-2` #181E2C), 1 px brass lines,
  brass gradient for primary buttons (Craft, Gather go, Camp build, the pressed Fight toggle), lit brass for the open tab and
  sub-view, `--fire` (the old ember) kept for act-now items: ready Next Up, armed moves, news dots.
- Chrome: the menu head carries brass corner diamonds; section heads get a diamond and a fading rule; rows, chips and
  slots are rounded wells with thin brass lines.
- Stage 2-4 parts (plates, Next Up box, fight bar slots, station tiles) keep their old shapes.

## Deviation from the doc wording (judge: right call)

The doc makes `--display` the Cinzel role. `--display` sits in about 287 places, many of them fixed-width number boxes,
where Cinzel would not fit. So `--display` stays the numbers-and-buttons role (now Barlow) and titles take a new `--title`
role. The mockup does the same (numbers, pills and buttons in Barlow). Section heads stay Barlow spaced capitals.

## Menu blur: it cost frames, so the menu is opaque

`tools/perf.mjs --quick --save late` against the base build (`perf-quick-late-vs-base.txt`) and blur against no blur
(`perf-quick-late-blur-vs-opaque.txt`) were both noisy: different metrics failed each run, and both builds miss 23-26
budgets. So a direct A/B: the late save with Craft open, `requestAnimationFrame` frames counted over 5 s, three runs each
(headless Chromium, 4 CPUs, no GPU):

| view | 10 px blur | no blur |
|---|---|---|
| 740x360 | 301, 301, 301 frames | 301, 301, 300 frames |
| 1280x720 | 169, 167, 174 frames (gap p95 50 ms) | 300, 298, 301 frames (gap p95 16.7 ms) |

The blur halves the frame rate at 1280x720, so per the card the menu is opaque night ink (`#0B0F18`, the glass colour at
full strength) with no blur. With it opaque, 1280x720 runs 301, 301, 301 frames. The panel colours went opaque too: the
independent tester saw the fight show through the Settings, Notices and Switch sheets with an unblurred 82% panel.

## Contrast (doc section 3)

Measured on the game's own frame: Mossy Hollow (zone 1), 1280x720. The brightest scene pixel is 255,255,255 (a lantern
core). With the 82% glass first tried, the panel over it read 55,58,66: body text 9.17:1, muted 4.81:1. With the panels
opaque it reads 11,15,24: body 15.48:1, muted 8.11:1. The `ui2-look (browser)` check measures this on every run and
asserts the panel colour is opaque.

## Boot bytes

Brotli boot set, worst zone: plain 3,983,283 B (base 3,983,274, +9), hero-packs build 3,999,052 B (base 3,999,109, -57). Paid for by deleting the Handjet-era rules: the dot-grid ground,
`--display-k` multipliers in the files touched, and old comments.

## Checks

`node tools/build.mjs && node tools/check.mjs --only="check fonts|ui2-look"` passes. Also run locally: W1-D, story cards
fit, fight HUD fit, small text clips, ability-names-fit, turn-banner-clears-plate.

## Review and judge

- Reviewer: one blocking find (crafted item names lost their rarity colour under `.card h3`), fixed with
  `.card h3:not([class*="rar-"])`; also fixed: news dots and Next Up "more" back to fire, the story sheet's sticky button
  bar opaque, the selected sub-tab diamond no longer clashes with a "new" dot.
- Opus judge vs the mockup: **SHIP**. Follow-ups for later stages: Cinzel spaced capitals on menu sub-tabs (left as Barlow
  so five-view rows still fit at 360 px), titles with a light-to-deep gradient.
