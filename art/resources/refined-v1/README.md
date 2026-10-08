# Refined resources v1 — art review pack

21 new resource icons for Lanternfall refining, drawn with built-in image_gen against the C26 owner-approved resource pack. Base: `08c3163e` on `claude/elegant-johnson-m6k00u`. This is an art-only proposal; the whole pack still needs the project's art judge before integration.

## Contents

- `coal.png`: one mined anthracite lump, grade 1.
- `ingot.png`: Copper, Iron, Silver, Cobalt and Mithril Ingots.
- `plank.png`: Pine, Birch, Oak, Mangrove and Tideash Planks.
- `cloth.png`: Hemp Cloth, Linen, Briar Cloth, Kelp Cloth and Stormgrass Cloth.
- `leather.png`: Bristle, Duskfang, Fenscale, Riptide and Kelpie Leather.
- `manifest.js`: `window.ICON_PACK`, with family, grade, exact display name, atlas and measured source rectangle. Refined items also declare their approved raw family/grade. Use these rectangles, not an assumed uniform grid.
- `*-prompt.txt`: exact prompts. Coal was generated in the sixth ingot source cell and extracted into its own image.
- `sources/`: unchanged built-in generated images, retained for provenance. These have magenta backgrounds and are not the transparent delivery atlases.
- `raw-refined-review.png`: each raw source beside its refined result at 16, 22, **24**, and 64px on the approved dark tile.
- `preview-desktop.png`, `preview-mobile.png`: browser evidence from the **unchanged approved-v1 preview page and preview server**, staged with these atlases. Their historical Ore/Wood/Fibre/Hide headings represent Ingot/Plank/Cloth/Leather in this run; its historical 105-design wording is part of the reused page, not the count of this pack.

## Visual contract

Ingots are cast trapezoidal bars; planks are square-ended stacked sawn boards; cloth is a folded woven bolt; leather is a smooth cured and folded cut hide. They have manufactured silhouettes instead of the raw pack's ore inclusions, logs, stems and fur. Material colours track approved grades 1–5. Fenscale keeps broad scale panels after tanning. Coal has dark anthracite facets with cool highlights and no host rock, orange ore or fire.

All four family atlases are 1024×1536. Five icons occupy a two-column, three-row layout, with the sixth cell empty. Alpha cleanup removes the generated magenta background; it does not redraw the objects, recolour the raw pack or add details. Delivery alpha is binary and the original internal source pixels are retained. The art is source-resolution review artwork, like approved-v1; no game data has been converted or embedded.

## Review and validation

The existing `art/resources/approved-v1/preview-server.cjs` and `preview.html` were copied unchanged into a temporary staging directory. The delivery manifest was adapted there only to the existing preview's Ore/Wood/Fibre/Hide filter keys, and the five PNGs copied alongside it. Run that existing server from the staged directory for repeat review; do not overwrite approved-v1.

Browser QA: 21 cards, 63 canvases (16, 22, 64px), no page errors, no horizontal overflow at 360×740. 24px review is included in the raw/refined sheet. Source rectangles are in bounds, every named icon is nonempty, and all five delivered PNGs have transparent margins. Full validation facts and image hashes are in `validation.json`.

The Coal Seam node, scene and its review evidence live in `../../gathering/coal-seam-v1/`. No source, tools, docs, game embedding, gameplay rules or integration changes belong to this pack.
