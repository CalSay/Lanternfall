# C26 equipment icons — owner review

110 icons: 22 active craft kinds, grades 1–5. Based on CRAFT_KINDS at checkpoint 2b379cf1391a63b6594a99fdc5d73168c83c8d7a. Current runtime has five equipment grades; resource grades 6–15 are outside this pack.

## Deliverables

- review-v1: authored transparent source atlases, exact generation prompts, measured source rectangles. Generated with the built-in image tool, not procedural drawing.
- game-v1: 660 PNGs at 16, 18, 20, 24, 32 and 48 px; <=24 visible colours; hard transparency and padding. 32 px matches current inventory tile display.
- game-v1/gear-icons.js: GEAR_ICONS['kind-gN'][size] data URIs for a self-contained artifact. Integrator should include only required sizes to avoid unnecessary HTML growth.
- game-v1/preview.html: all equipment, material references, native-size samples, greyscale power comparison. Run node art/gear/game-v1/preview-server.cjs.
- tools/art/gearicons.py: deterministic Pillow export; source and output hashes in manifests.

## Art direction and review

The approved first five resources determine dominant material colours and textures. Later tiers gain reinforcement, protection, blade area, layers and magical ornament rather than just a new tint. Purple is used for actual Amethyst/Dim essence, not generic gear theming.

An independent agent examined all 22 families / 110 icons at native32/48 against resource references. It requested stronger tools and jewellery progression, greener Kelp Fibre cloth, and removal of detached sword/spear fragments. These were corrected and re-reviewed; final verdict: no visual blockers, ready for owner review. See review-notes.md.

Clothing atlas columns3/4 are superseded by clergy.png. Kelp Fibre grade4 robe/tome/mitre/vestments come from kelp.png. Draft atlases are retained for provenance, not consumed. Three contaminated rectangular crops use largest connected silhouette isolation, recorded in metadata.

Legacy weapon/helm aliases proposed: warblade/greathelm. They are metadata only; old-save migration remains unchanged. Display labels use full resource names for comparison; game naming remains Claude's integration concern.

## Validation

- Export checks:110 x6=660 PNGs, dimensions, alpha, palette, padding, hashes pass.
- node tools/build.mjs: pass (2755.8 KB, unchanged game source).
- node tools/check.mjs: all checks passed; browser sections skipped:0.
- Browser preview:110 cards /550 loaded images, no broken images or horizontal overflow; item filter and greyscale mode exercised.

## Integration handoff

Status: owner review pending; no runtime wiring. Claude integrates after owner approval. Proposed lookup-only hooks: itemIcon in src/js/60-gfx.js and consuming craft/item displays as required, a new embedded art data module, architecture row and dedicated checks. Preserve layout, recipes, balance, save key, unlocks and hero pose art. This pack is inventory icon art, not equipped character sprites. No publishing performed.

