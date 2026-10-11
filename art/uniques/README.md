# Lanternfall unique relics — draft review

34 individual item concepts: 21 proposed road drops and all 13 legacy uniques. Display names are proposals, not runtime changes. Stable IDs and earned ownership are preserved. No effects, balance, drop sources, online files or save data are changed. Owner requested names and fantasy icon design on 7 October 2026.

Open `preview.html` for all six native sizes, nearest current crafted comparisons at 32/48px, and greyscale comparisons. `overview.png` is a review contact image, not a runtime sprite sheet. The six PNG exports per item are standalone stills. All assets are under this directory; preview has no network dependencies.

## Art direction

Match approved `art/gear/game-v2`: forged surfaces, broad pixel clusters, dark outlines, cool interior shadows and warm upper-left highlights. Each relic has a distinct silhouette and boss signature. Long equipment runs lower left to upper right. Colour comes from its physical materials and signature; rarity is not a purple tint. Legacy artwork represents its first-source grade and does not promise new grade-aware runtime behaviour.

## Provenance and export

Every item was generated separately with the built-in image_gen tool, requesting true transparency. Original source PNGs are retained in `sources/`. Exact prompts are in `prompts.json` and the manifest. Style was informed by visual inspection of current crafted gear. `references/` contains unmodified copies of nearest crafted 32/48 icons for portable review.

The shared `tools/art/gearicons.py` `bake` function crops the alpha>=128 bounding box, scales using premultiplied alpha, quantizes to 24 visible colours without dithering, hardens alpha and centres with existing padding (1px for <=24; 2px for 32/48). No procedural substitute artwork was drawn and canonical art tooling was not modified. Manifest records exporter hash, alpha crop rectangle as [left, top, right, bottom], source SHA-256 and each export's SHA-256, visible colours and bounding box.

## Review and limits

Deterministic checks cover all 204 exports: expected dimensions, <=24 visible RGB colours, alpha in {0,255}, transparent outer padding and SHA-256. Visual review checks silhouette, identity, finish and current-gear comparisons. Browser preview checks include 740x360 and 360px width, no broken images or horizontal overflow. These checks are not independent art-judge approval. Runtime integration and any gameplay approval remain separate work.

Build passes. The default repository check passes with 40 browser sections skipped; the previous design branch's complete browser runs encountered existing moment-count / Windows screenshot-write failures, with the affected sections passing in isolation. A clean full browser-suite result is not claimed. The art draft contains no source or test changes.

## Where I'm not sure

- Some boss ornament may lose detail at 16px; inspect native 16/18/20/24 before wiring into compact inventory views.
- Legacy equipment uses old broad weapon/head kinds. Icons preserve that category and first-source material; class-specific adaptation is not approved here.
- These fantasy silhouettes need owner/art-judge approval. They do not certify proposed effects, acquisition pace or the held support-class budget fixtures.
- No claim of a complete browser-enabled gameplay suite pass; do not merge either draft without the requested review.
