# C26 game-ready action icons

Production conversion of the owner-approved neutral-v2 designs,1October2026. All16 assets exported at16,24,36 and48pixels:64 transparent PNGs. These files are ready to embed; the game renderer has not been switched over.

## Use

- Use the matching native size:24px short-height action bar,36px compact bar/ability picker,48px regular bar,16px small badges. Avoid shrinking the whole atlas. Transparent canvas margins are1px at16/24 and2px at36/48. Artwork is centred with aspect preserved.
- action-icons.js provides ACTION_ICONS[id][size] as PNG data URIs. It is standalone pure data and adds no network fetches. Copy/include its content as a game data fragment after Claude approves the shared renderer integration.
- IDs: attack-wren, attack-tobin, attack-pip, echo, bash, fire, parry, dodge, empty, auto-off, auto-on, locked, cooldown, ready, selected, unavailable.
- For the existing API, map atk to attack-<soloHero()>; ability IDs echo/bash/fire already match. Never paint a48px PNG onto the existing12px canvas: use a correctly sized canvas/image backing store first. Keep labels/keyboard handlers and cooldown semantics unchanged.
- Ready and selected are transparent frame layers. Lock/cooldown/unavailable are badges or status images; timer values stay text. Do not replace an action silhouette entirely when showing its cooldown.
- All native images have binary alpha and at most24 visible colours, no dithering. Use1:1 display or integer scaling. The preview is checking actual exported files, not the source atlas.
- All PNGs total78624bytes; embedded JS107232bytes. Integration may include just sizes actually used, but the full bundle is small and self-contained.

## Rebuild / verify

Run python tools/art/actionicons.py with Pillow. It reads the approved per-icon atlas/rectangle manifest and preserves the original six hero images, using neutral-v2 only for shared assets. It trims transparent bounds, downsamples in premultiplied alpha, thresholds alpha, quantizes visible colours without dithering, then pads the result. No new art is drawn in code. Source designs remain unchanged.

manifest.json records source SHA256, rectangles, output dimensions, per-PNG SHA256, colours, bounds, filenames and embedded data. Export asserts64PNGs, exact sizes, transparent borders and alpha/palette limits. Two runs produced identical embedded-data SHA256. Independent Node verification decoded every embedded PNG, compared to its file byte-for-byte and checked dimensions.

Run node art/actions/game-v1/preview-server.cjs and open its loopback URL. index.html also opens directly.

## Validation / integration status

Production preview71 image instances loaded at their native sizes, including all64 exports and seven action-bar examples. Visual inspection passed. Game build passed2755.8KB. The unchanged game source passed the full check suite with0browser skips earlier in this session; this conversion only adds art, exporter and preview files, so no gameplay rerun was needed.

Claude still owns renderer integration, layout and shared styles. Scope proposal is on issue27. Production assets are complete; actual in-game hookup/combined browser validation is the remaining integration step.