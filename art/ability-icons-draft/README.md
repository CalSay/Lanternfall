# Full 34-hero ability icon drafts

**426 individually designed symbols:** 408 signatures (34 heroes × nine active and three passive abilities) plus 18 shared class cards. Total: 321 active and 105 passive. Core Attack/Parry/Dodge icons, Star badges and subclass badges are outside this scope. Existing approved icons supplied style references only.

Open [the self-contained HTML gallery](review.html): grouped by class and hero, with hero navigation, four native previews per icon (128, 64, 48, 32px) and expandable exact effects. Images are embedded; links and disclosures work without JavaScript or external network access. No PDF, server or deployment is required.

These are **owner-review drafts**, not official production icons. Per-icon actual-art review, findings and current pixel fingerprints are recorded in [the review record](../../docs/design/ability-icon-review/review.json). Reviewer closure does not authorize game integration or replace owner approval. No approved pose/concept/game artwork or runtime code was changed.

## Exact source and visual production

`inventory.json` preserves all exact ability names, kinds, effects, selected-list plate IDs, historical source hero IDs and owner-approved concept hashes. Mechanics source: `docs/design/hero-abilities-34.json`, SHA256 `94f0c776eff4f233607ea2f46c8231dc257157d65c2534c7b23b28a02753adff`. Plate IDs follow selected roster order, which differs from older hero IDs; use the inventory mapping.

All creative compositions were manually authored after reading the cards and signed-off designs. `prompts/` records those assignments and targeted revisions. `raw/` retains original image-generation results, including rejected initial attempts. Scripts create no creative art: they extract, key, normalize, export, assemble existing images and validate records. The generated symbols are prop/effect metaphors, not hero body poses or sheets. Pose lock remains mandatory for every future character pose production.

Style: native action-icon pixel clusters, confident dark contours, restrained opaque shade groups, recognizable dominant mechanics. Hero palettes/materials follow approved concepts. Passive emblems are settled shapes; active effects have direction and impact. No drawn lettering, UI chrome, automatic defence, extra actors, resurrection, thrown held equipment or new weapon type is introduced by the symbolic artwork.

## Extraction and provenance

Hero plates use 4×3 slots; shared plates use 3×2. Initial worker extraction used nominal equal slots; later root extraction recovered actual empty three-pixel gutters near nominal boundaries so complete isolated glyphs could be extracted without cutting painted pixels. Records retain original source hashes and cell information; adaptive records additionally retain exact source rectangles. Single-icon revisions use a one-glyph input and replace only their named icon. No character mask or pose-lock threshold was edited.

Flat magenta background is keyed narrowly (`r>220`, `b>220`, `g<65`, `abs(r-b)<32`), protecting deeper violet magic. Each complete glyph is fitted to 84% of the export square using nearest-neighbor sampling and binary transparency. The exports share generous margins; fit scaling is appropriate to these abstract UI symbols and is not a body-pose scale policy.

Commands:

```sh
python tools/ability-icon-pack.py --plate hero-01 --input art/ability-icons-draft/raw/hero-01/revision-01.png
python tools/ability-icon-pack.py --plate hero-16 --single-icon hero-16-03 --input art/ability-icons-draft/raw/hero-16/revision-01.png
python tools/ability-icon-pack.py --gallery
python tools/ability-icon-audit.py
```

Do not regenerate closed exports casually: review closure applies to their exact current 128/48px hashes. A changed glyph requires actual-pixel re-review. Older nominal crops are preserved rather than silently reprocessed with the later adaptive profile.

## Evidence-guided revisions

Wren's initial near-magenta effects lost pixels during keying; revised opaque deep-violet symbols passed. Tobin's initial cramped plate was revised for clear margins. Hesketh's healing-heart metaphor was replaced with the correct protection meaning, and his pink dome was corrected. Bram's fringe was corrected. Elowen's crowded beam extraction was repaired with a bounded plate revision and empty-gutter extraction. Cass's scythe-like hook became the approved triangular spear language; only that glyph changed. Findings and current closures are preserved in the review history.

Two tool-delivery failures (Oriel and Flint) returned displayed images without a recoverable saved path. Identical-prompt operational recovery attempts were archived; they were not aesthetic reroll loops. Future image results are stored before parsing, with embedded-data recovery supported. No concurrent "latest file" is trusted as the correct source. Oriel's briefly misidentified worker output was detected, removed from the deliverable and replaced before final review.

The mechanical audit checks complete inventory coverage, four RGBA sizes, binary alpha, margins, source/export fingerprints, unchanged approved concept hashes, exact reviewed card text and closure on current actual images. It complements visual review; it cannot measure perceived fun, balance or runtime readability in a game integration that has not been authorized.
