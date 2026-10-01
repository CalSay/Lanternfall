# Full equipment ladder and richer metal redraw — C26

Status: owner review pending for new/revised art. Based on codex/c26-gear-icons at775220d, including owner's approval of initial grades1–5. Owner subsequently requested grades6–15 for all22 lines, then redrawing ALL tool and metal-armour grades to match richer newer artwork. Thus the prior metal approval is superseded by these review candidates.

## Coverage

330 icons =22kinds x15resource grades. 220 additional upper-tier designs; all135 metal/tool/censer designs use the richer finish, including45replacements for grades1–5. The65unchanged low-tier nonmetal icons retain approval. New/revised265 icons await whole-pack review.

Native transparent PNGs:16,18,20,24,32,48px (1980 total), <=24visible colours, hardalpha, consistent padding. game-v2/gear-icons.js is self-contained data; embed only the sizes needed at integration. game-v1 is retained unchanged for provenance/comparison.

Sources: review-extended. tools/armour{1,6,11}detail.png supersede the simpler tool/armour drafts. natural6/11, cloth6/11, jewels6/11 cover other upper-tier families. woodfix supplies correctedG7/G14 bows; woodstaff-fix supplies their diagonal staffs. Resource material references come from approved-v1 manifest and source frames. Exact built-in image-generation prompts are in review-extended/prompts.json. Rejected haze-bearing wood drafts were not selected or bundled.

## Reproduction

Run python tools/art/gear15icons.py with Pillow, then node tools/art/gear15icons-check.cjs art/gear/game-v2. Exporter measures transparent gutters, isolates meaningful components, crops/resizes authored artwork, quantizes visible colours, and records source/output hashes. Continuous spear/warblade silhouettes and G10staff final exports exclude detached neighbouring fragments. It does not draw new artwork.

Run node art/gear/game-v2/preview-server.cjs to review by item, grade range and greyscale. The large image enlarges native32; actual16/32/48 samples and source resource icon are shown beside it.

## Independent review

Three agents reviewed all330 icons across22lines, including detail consistency with newer cloth/hide, material identity, power progression and native-size quality.

- Metal reviewer: all9lines/135icons pass after removal of detached spear/sword fragments. Rich forged surfaces, layered fittings and armour now match newer packs.
- Natural reviewer: all5lines/75icons pass after matching diagonal staff framing and removing row fragments. Ironwood and Wraithwood corrected to their approved wood colours.
- Magic/cloth reviewer: all8lines/120icons pass. No visual blockers.

Minor nonblocking reservations retained for owner judgement: regional changes sometimes make an adjacent tier less ornate (notablyG5→G6 and someG10→G11 transitions); G12Starroot cloth is warmivory versus cooler reference; Blackmere cloth is dark at32px, though silhouettes remain readable. Overall progression and material identities pass; the last tiers read as advanced equipment.

## Validation

- 330icons cover all22kinds grades1–15;1980PNG dimension/alpha/palette/padding checks pass.
- Independent byte comparison of all1980 embedded PNGs with disk, and PNG dimensions: pass.
- Preview330cards/1650images loaded,0failed,0pending, no horizontal overflow; grade and kind filters exercised.
- node tools/build.mjs: pass2755.8KB.
- node tools/check.mjs --jobs=2: allchecks passed, browsersections skipped0.

## Claude handoff

No runtime code, recipes, balance, save key, unlock availability or published game changed. Grade6–15 art is prepared ahead of runtime support; do not enable tiers solely because the images exist. After owner approval, use game-v2 as canonical full ladder and select only required embedded sizes. Existing proposed itemIcon lookup hooks remain with Claude. These are inventory icons, not hero equipment pose swaps. New richer metal designs supersede the previous metal icons only after owner review. No publication performed.

