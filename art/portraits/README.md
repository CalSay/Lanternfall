# Hero portraits

64x64 PNGs, one per hero of the official 34 (`sources.json` maps id -> approved concept board). They are the boards' own
"Face Detail" vignettes: found, keyed off the grey ground, square-cropped at the head, resized, outlined and palette-reduced
by `tools/art/concept-portraits.py`. No pixels are drawn. The boards live on branch `codex/hero-animation-plan`
(`art/concepts/...`; list in `docs/handoff/codex-to-claude/official-34-heroes/concept-list.md` on that branch).
`node tools/portraits.mjs` packs them into `src/js/21yc-data-portraits.js`.
