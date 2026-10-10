# Sovereign reveal, second draft

This is the more ceremonial revision requested for the second-highest crate tier.
The chest starts centred, gathers gold motes into its lantern, releases violet and
gold light with a floor pulse, then moves aside for a larger scroll and crowned
laurel frame. The original chest and reward artwork are reused.

| File | Details |
|---|---|
| [Full GIF](sovereign-reveal-v2-50fps.gif) | 960 x 640, 400 frames at 50 fps, 8 seconds, loops, silent |
| [Chat preview GIF](sovereign-reveal-v2-preview.gif) | 720 x 480, same frames and timing |
| [Reward hold](reward-hold.png) | Still of the completed reveal |
| [Timing sheet](timing-contact-sheet.png) | Nine selected points in the sequence |
| [GIF validation](validation.json) | Dimensions, timing and loop boundary measured from the export |

The 400 playback frames interpolate eight drawn lid poses. They are not 400
independently drawn cels. The lower body is held fixed within the chest; scene
placement moves the whole chest. Small changes in the generated lid ornament still
need cleanup for a production pack. The sample scroll does not define live loot.

## Timing

| Time | Beat |
|---|---|
| 0.00-0.45 s | Closed chest, centred |
| 0.45-1.55 s | Lantern charge and gathering motes |
| 1.50-2.40 s | Lid opens; release impact around 1.98 s |
| 1.87-2.85 s | Floor pulse expands and fades |
| 2.11-3.15 s | Scroll rises and chest moves aside |
| 2.94-3.42 s | Laurel frame and caption settle |
| 3.42-6.55 s | Readable reward hold |
| 6.55-7.95 s | Fade and reset for this looping preview |

## Source files

- sources/opening-keyframes.png: original eight-pose sheet, 4 x 2.
- sources/reveal-effects.png: original scroll, glow, sparks and halo, 2 x 2.
- sources/sovereign-ceremonial-effects.png: light fan, floor pulse, trail and wreath, 2 x 2.
- sources/generation-prompts.txt and generation-prompt.txt: exact built-in imagegen prompts.
- assets/: extracted original chest poses and effects, ready for the renderer.
- render.cjs: complete compositor and GIF encoder.
- prepare.cjs: recreates assets/ from the original sheets if needed.
- make-preview.cjs: makes the smaller GIF from a new full-size render.

## Reproduce

Use Node 22 or later. In this folder:

```sh
npm install
npm run stills
npm run render
npm run preview
```

The package pins sharp 0.35.5 and @napi-rs/canvas 0.1.100 without changing the game's
dependencies. All new renders go to ignored out/; committed review media is kept.
The included assets are already extracted; npm run prepareAssets is optional.

The original captions use installed Georgia and Segoe UI fonts. On Windows the
renderer looks in the Windows Fonts folder. On another host, LF_ART_FONT_DIR can
point to legitimately installed copies named georgia.ttf, segoeui.ttf and
segoeuisl.ttf. Missing faces fall back to local fonts, so caption pixels may differ.
The committed GIFs remain the visual reference. Font files are not bundled.
