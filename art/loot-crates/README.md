# Lantern Cache concept art

Saved from the owner's 10 October 2026 design session. This package contains the
original design history, the current five-tier closed/open lineups, and the revised
Sovereign reveal animation. These are concept references for Claude's art review;
they have not been integrated into the game.

## Start here

- [Current closed lineup](concepts/lantern-caches-v4-sovereign.png)
- [Matching open lineup](concepts/lantern-caches-open-v1.png)
- [Sovereign reveal GIF](sovereign-reveal-v2/sovereign-reveal-v2-preview.gif)
- [Full-resolution GIF](sovereign-reveal-v2/sovereign-reveal-v2-50fps.gif)
- [Animation source and reproduction notes](sovereign-reveal-v2/README.md)

## Current visual hierarchy

| Tier | Name | Visual identity |
|---|---|---|
| I | Roadworn | Worn timber, plain iron, small amber lantern |
| II | Ironbound | Dark green timber, heavier iron and bronze fittings |
| III | Gilded | Walnut, ornate gold leafwork, amber lantern and small laurel crest |
| IV | Sovereign | Plum-black timber, substantial gold fittings, amethyst crest and violet lantern |
| V | Hallowed | Ivory, black and gold, the largest silhouette and great sunburst halo |

The tier names and designs are an art proposal. This package does not change loot
tables, first-clear rules, reward grants, game state or cache code. The scroll in
the animation is a sample reward, not a promised new item or rarity.

## Original designs and revisions

Every image and its original prompt are preserved byte-for-byte.

| Image | Place in the design history | Prompt |
|---|---|---|
| [Original lineup](concepts/lantern-caches-v1.png) | Includes the superseded blue Runebound third tier | [v1](concepts/lantern-caches-v1-prompt.txt) |
| [Gilded replacement](concepts/lantern-caches-v2-gilded.png) | Replaces Runebound with walnut and gold | [v2](concepts/lantern-caches-v2-prompt.txt) |
| [Grander Gilded](concepts/lantern-caches-v3-gilded.png) | Adds richer ornament to tier III | [v3](concepts/lantern-caches-v3-prompt.txt) |
| [Grander Sovereign](concepts/lantern-caches-v4-sovereign.png) | Current closed design; restores a clear step above Gilded | [v4](concepts/lantern-caches-v4-prompt.txt) |
| [Open lineup](concepts/lantern-caches-open-v1.png) | Current open-state reference for all five tiers | [open](concepts/lantern-caches-open-v1-prompt.txt) |

## Direction for the reveal

Reveal the actual reward after a short anticipation and opening effect. Do not
cycle through alternative rewards. Sovereign gathers gold motes into its lantern,
releases violet-and-gold light and a floor pulse, then presents the reward inside
a crowned laurel frame. Hallowed retains the sunburst motif and room for a stronger
final-tier spectacle. When a lower tier gains ornament, check its silhouette and
reveal against both adjacent tiers before calling the hierarchy finished.

The GIF loops for review. A game implementation should reveal once, keep the result
readable until dismissed, support skipping, and use a simple fade/static result
under reduced motion. Reward selection and payment must remain outside animation
playback. Claude should review the full pack under the repository's art gate before
integration. The remaining lid-ornament variations need a production cleanup pass.

## Provenance and integrity

Raster art was generated with the built-in imagegen tool. Node.js composes the
drawn assets into the GIF; it does not generate new chest, item or VFX artwork.
The manifest records relative paths, file sizes and SHA-256 hashes for the artwork
and prompts, plus animation metadata. No session-specific absolute path is needed
to consume or render the saved pack.

See [manifest.json](manifest.json) and [validation notes](VALIDATION.md).
