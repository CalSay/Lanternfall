# C27 starting equipment — working checkpoint

Status: work in progress, NOT owner approved and NOT integration ready. Original hero images are unchanged.

## Available work

- Draft rig files for 37 existing poses: Tobin 15, Pip 14, Wren 8. All source hashes recorded. Fourteen gathering hand grips reuse the existing measured coordinates; combat/head/back anchors still need visual fit review.
- Sixteen native 80x80 shared tool views: pick, axe, sickle, spear; down, back, upright and level. Transparent binary alpha, reserved 16-colour ramps, grip at (40,40), source hashes, authored views with no code rotation.
- Exact approved grade1 equipment reference crops and their provenance in references/manifest.json.
- First Tobin ready-pose base recut, explicit edit mask and separate front-hand layer. All unmasked pixels match the approved pose exactly. First Copper Plate overlay proof. These still require visual fit review.
- Local fitting workshop: preview.html. Run node art/equipment/starting-v1/preview-server.cjs from repository root.
- Generation prompts and full-resolution selected sources retained. Rejected drafts are labelled.

## Not finished

No complete hero base pack, no final class-item layers, no complete armour-pose pack, no integration/export bundle. Additional authored weapon/tool angles are needed by existing poses. Wren has no approved gathering sources in fetched Git history (seven required poses missing). A missing source is not replaced by an invented approved pose.

The workshop only displays drafts and original outfits; it does not pretend missing gear layers exist. Front-hand occlusion for tools is not yet implemented in this draft preview.

## Fit findings and process

Imagegen's first base edit changed face, cape and boots despite explicit preservation instructions. That unmasked result was rejected. Replacement pixels are now fitted to the approved native frame and used only inside recorded removal masks. Original identity pixels outside those masks are copied exactly. Early mask review found a cap fragment, retained shoulder metal and duplicated hand edges; subsequent mask/alignment pass removed cap and shoulder leftovers. Hand fit remains under independent review.

The generated tool sheets initially reversed a pick angle, doubled an axe blade and gave the upright sickle a central U-shaped blade. These were redrawn before export. They remain pending native/pose review.

Body overlays are expensive: each pose has different seams around scarf, hands and exposed skin. Native proof comes before bulk generation to avoid multiplying misaligned images. The initial inventory, sources, four tool sheets/corrections, export and one body-fit iteration was completed in stages recorded below; this is not an estimate for a finished37pose pack.

## Reproduce

- python tools/art/c27-baseproof.py
- python tools/art/c27-tools.py
- python tools/art/c27-plateproof.py
- python tools/art/c27-rig-drafts.py (draft metadata only; do not overwrite later hand-refined rigs)

All drawing is from built-in imagegen or existing approved sources. These helpers only select, crop, resize, quantize and composite artwork, plus produce review guides. Never use source-generation drafts directly in the game.

## Independent audit checkpoint, 2026-10-01

The dedicated hero/theme reviewer passed the first Tobin-ready, Wren-full-draw and Pip-ready base candidates for continuing production. This is process approval only, not owner approval or a complete pack approval. Each has exact body/front-hand reconstruction, binary alpha, at most40colours, zero changed pixels outside the final edit mask and zero changed pixels inside the explicit protected-identity mask. Tobin's first plate overlay covers zero protected chest-glove pixels.

All seven Tobin gathering base candidates have since been authored individually, fitted through per-pose masks and submitted for independent review. Remaining combat poses, Pip gathering and other equipment layers are still pending.

Palette note: current tool exports use only reserved ramp colours. Semantic metal/wood/trim masks still need verification before any grades1–5 recolouring claim.

Measured file milestones (UTC): source contact inventory10:40; first Tobin base generated10:41; first masked fitting proof10:51, refined10:54;16tool native contact10:57; all37draft rigs10:59; first plate proof11:03. Later gathering production follows this checkpoint. Elapsed work includes fitting and review, not just imagegen time.

Repository checks: node tools/build.mjs passed. Full node tools/check.mjs --jobs=2 with LF_PLAYWRIGHT pointing to the existing installed dependency passed, browser sections skipped0. Artifact validator c27-check.py passed its current16tool/37source/Tobin-proof checks. These do not certify missing art or aesthetic correctness.

