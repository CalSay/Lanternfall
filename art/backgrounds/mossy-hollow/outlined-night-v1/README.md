# Mossy Hollow: outlined moonlit background

## Approved for Claude handoff — 2026-10-02

Owner authorized packaging and handoff, including the portrait extension. `sources/portrait-master.png` extends the tree canopy and night sky upward; its prompt is preserved alongside it. Portrait exports are 480x900 and 960x1800 in PNG and lossless WebP. These preserve the landscape exports as separate options.

The existing scenery is procedural and adapts to the stage, rather than using one fixed portrait image height. Browser measurements of the local dist build's initial state: a 390x844 viewport has a 362x674 stage; 360x740 has a 332x570 stage. 480x900 provides approximately the taller measured aspect ratio. UI state can change the available height.

The portrait version's painted road is near 89% height, while `62-stage.js` currently puts character feet at 80%. Claude must align the actors to the road when integrating, or request a revised floor composition; simply swapping this into the old renderer is insufficient. The old landscape placement notes below apply only to the landscape export. Use the portrait variant for tall stages and landscape for wide stages.

The owner approved the smooth textured scene with thin black outlines. This package supplies an actor-free version for use as a fixed battle backdrop. The full-resolution approved composition and generated clean master are preserved in `sources/`, with their exact prompts. Removing the actors required generated reconstruction of the hidden scenery; the clean version is available for review in `preview.html`.

## Files and rendering

- `runtime/`: opaque PNG and lossless WebP exports at 480x270, 960x540 and 1440x810. Prefer the 960x540 WebP for a 480x270 logical viewport on a 2x display; select the larger export for larger displays.
- `manifest.json`: dimensions, sizes, suggested placement and rendering metadata.
- `preview.html`: local preview with clean backdrop and the approved composition for comparison.
- `sha256.json`: checksums of package contents. `package.py` rebuilds exports and verifies PNG/WebP pixels, dimensions and ZIP contents (requires Pillow).

The master is resized with Lanczos to exact 16:9; the tiny source-aspect discrepancy is normalized without cutting off content. Preserve smooth background sampling and full colour to retain the approved textures. Render the existing character sprites separately with their normal nearest-neighbour sampling. The contours are baked artwork, not a guaranteed one-device-pixel stroke at every display size.

## Integration notes for Claude

1. Render as one fixed, opaque background before actors. This is NOT a drop-in replacement for the older five-layer parallax pack. Do not stack it with the old trees, ground or sky. The current package has no independent parallax, foreground occlusion, relit variant or scrolling seams.
2. Use the landscape export for a 16:9 battle viewport and the portrait export for a tall viewport. Letterbox or deliberately frame other aspect ratios; do not stretch it arbitrarily. Embed the selected asset as a data URI when producing the self-contained game artifact; do not add external network fetches.
3. Start actor feet at logical y=208 (77% of image height), with example x positions at 33% and 65%. Keep feet on the open road. These are guides, not validated game camera settings. Keep canonical hero/enemy scales (96px hero, approximately 75px Gloomjaw); the illustrative actors in the concept were not an exact runtime scale reference.
4. Moonlight, lantern light pools and purple fissure light are already painted in. Avoid applying duplicate whole-scene glows or a second full-screen night tint. Apply any actor night tint only to body sprites in a scoped render pass; draw emissive ability effects separately with normal colours/alpha afterwards.
5. The foreground foliage is baked into the backdrop; it will not occlude actors. Draw all actors and effects above this fixed scene. Independent foreground/parallax layers would require a separate art pass.

No runtime code is changed by this package. In-game layout, actual actor scale and lighting still need integration testing. The pack is ready for integration; no game publishing is part of this handoff.

The portrait master is 916x1717. The 960x1800 export is a slight upscale for convenient 2x dimensions; it adds no new source detail. Preserve both masters.
