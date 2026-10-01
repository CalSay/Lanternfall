# Gathering nodes · one active source at hero scale

Status: pending owner review. Art and context studies only; no runtime art, gameplay or layout changes.

## Current pack: game-v2

Twenty-five current materials: five grades each of ore, gems, wood, fibre and herbs. Each has intact, worked/struck and depleted artwork, plus a separate authored harvest burst: 100 sprites, 200 transparent PNG exports (native plus nearest-neighbour 2x). Later ten grades are not included.

The preview shows ONE active node and the actual approved Tobin sprite on a shared ground anchor, at native art scale. Tobin is the existing 224x192 canvas with feet at (96,132), nominal character height96px. No family is independently enlarged to fill a uniform square.

- Ore and gems use 256x192 geological wall-and-floor panels. The deposit is embedded in the wall, within working reach; depletion leaves the standing wall and an exhausted recess. Ore is not a free-standing collectible boulder.
- Trees use a 224x288 canvas, with species-specific size and silhouette. Target source heights: Pine252, Birch228, Oak272, Mangrove210, Tideash240px; fit also respects width. These are compact harvestable trees, not claims about mature botanical maxima. Stumps keep the intact tree's exact art scale and ground anchor.
- Fibre uses 128x128 canvases with material-specific heights70,84,62,74,76px. Herbs use the same canvas with heights42,60,82,58,52px. The empty space is deliberate. All plants remain rooted rather than represented by inventory bundles.
- Impacts use48x48 canvases. They are one authored burst per material, not multi-frame particle animation sheets. The preview only moves those images; it does not draw particle art in code.

The forest and coastal habitat images are authored contextual studies, not replacements for the approved world backgrounds. Mangrove, Tideash, coastal fibres and coastal herbs are previewed on shoreline soil; other vegetation uses woodland soil. The geological panels provide their own cave wall and floor. Final scene integration should preserve the shared ground and reachable contact height rather than resize every node to the same box. Cave surroundings can extend beyond these local panels in the eventual scene.

## Material identity and audit

Approved resource references and names are retained in `review-v1/*-reference.png` and `resource-references.json`. All source atlases and exact prompts are preserved. Every visual was authored with built-in imagegen.

The initial independent material audit found one real mismatch: Tide Pearl was shown cracking. The corrected final geological atlas keeps the pearl intact as the shellstone opens, then leaves an empty recess. Its impact comes from `pearl-extraction-v3.png`: tan stone chips, never pearl fragments. `fibre-effects-v2.png` provides the final separated plant clippings. Older rejected/prototype source rows remain as provenance but are not selected by the current manifest.

The original `game-v1` exports are superseded scale prototypes, retained for comparison only. Their inventory-like geological nodes are NOT the current proposed art. The independent review covered material identities and led to the pearl correction. The subsequent one-node/hero-scale revision requires its own final context review; do not claim the older independent review approved the revised scene pack.

## Files and reproduction

`game-v2/manifest.json` records every selected source, crop, trim, dimensions, ground/effect anchor, contact height, SHA256 and embedded PNG. `nodes.js` is the browser-readable equivalent; assets can be embedded without runtime downloads. Original full-resolution sheets are under `review-v1/`.

Run `python tools/art/node-export.py` to recreate all current native and2x exports, material contact sheets, habitat references and unchanged hero reference. Run `node tools/art/node-preview.cjs` for the current single-node interactive preview. The preview has material and state selectors and honours reduced motion.

## Validation

- Native export check:25materials,75node states,25impact bursts,200PNGs; binary alpha, transparent padding,40colour maximum per sprite, source/output hashes and dataURI byte equality pass.
- Repository build passed at base d0c7b1b.
- Full repository checks passed with installed Playwright and Chrome; zero browser sections skipped.
- Browser review verified25materials and150images loaded in the first contact preview; revised single-node state controls and final visual scale are reviewed separately.

## Integration proposal for Claude

Use one active node in a gathering scene, with its habitat geometry and the hero sharing one scale and ground anchor. Keep the cave wall when a vein is exhausted; keep tree stump/plant roots at their original location. Use the authored material-specific impact image at its contact point. This is a proposal only: no runtime files, timing, balance, save state or stage layout are changed by this branch. Whole-pack owner approval is required before integration.
- Revised scene browser check: exactly one active node, actual224x192approved hero canvas, state selection changes the correct image, and all selected scene images load. Pine shared-scale screenshot is `game-v2/preview-tree.jpg`.
