# Approved status icons

Owner approved all 15 designs on 1 October 2026, including the flame-only Burn revision. This pack contains 90 transparent PNGs: 16, 24, 32, 36, 48 and 64 pixels for every status.

## Integration

`status-icons.js` supplies `STATUS_ICONS[id][size]` as self-contained PNG data URIs. IDs: burn, bleed, chill, frozen, stun, exposed, mark, sunder, weaken, pinned, blind, guard, ward, keen, curse. Import/embed this data in the single-file build; no external fetches are needed. Claude owns renderer integration. No gameplay code or saves changed.

Use a matching native size (16 for compact badges, 24 for normal status rows) or integer scaling with image smoothing off. Each canvas includes transparent padding. Keep durations and stacks as text overlays, and retain accessible status names/tooltips. These artwork IDs do not imply a runtime status rename; map existing IDs explicitly, particularly Freeze/Frozen and Burn/Burning. Aim, Grit and Embers are hero resources, outside this pack.

## Sources and export

Approved sources and exact built-in image generation prompts are preserved in `../review-v1`. Its manifest records measured atlas selections and the Burn, Ward and Weaken replacement images. Rebuild with `python tools/art/statusicons.py` (Pillow). This follows the action-icon export process: trim, premultiplied-alpha resize, binary alpha, at most 24 visible colours without dithering, transparent padding. No new art is drawn by the exporter.

`manifest.json` records source hashes/rectangles and output hashes/bounds/palette counts. `validation.txt` records export checks. Run `node art/status/game-v1/verify.cjs` to verify all embedded images against PNG files. Run `node art/status/game-v1/preview-server.cjs` for the native export gallery, or open preview.html directly. The gallery samples actual exported files at 16/24/64 pixels. Remaining sizes are verified in the manifest and verification script.

The source designs are approved; the production pack is ready for Claude to integrate and check in the combined game. Do not publish automatically.
