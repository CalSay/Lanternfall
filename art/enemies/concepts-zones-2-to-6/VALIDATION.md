# Validation

Checked on 10 October 2026, based on integration commit `3937d6c5b6f142ae0cf74e9542b72180b672ac57`.

## Accepted artwork

- All five PNGs match the selected local originals byte for byte (SHA-256).
- All five fully decode as PNG, at 1536 x 1024. Total PNG size: 11,270,803 bytes.
- Visual inspection: all five main figures and head details face left; Ravager uses the facing correction; Riftwing is the accepted version with glowing eyes.
- No rejected image or eyeless Riftwing revision is included.
- Image checksums, source version names and dimensions are recorded in `manifest.json`.
- The package contains source concept art and generation briefs, not animation frames or runtime integration.

## Repository checks

- `node tools/build.mjs`: passed, producing `dist/lanternfall.html` at 10,256.8 KB. The rebuilt artifact has no Git diff.
- `node tools/check.mjs --jobs=2`: executed with bundled Node 24.19.0 and bundled Playwright, but **did not complete**. Both workers reached the V8 heap limit at approximately 2 GB with `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory`. The runner exited 1 with `2 check(s) failed`.
- No assertion lines beginning `  FAIL ` were emitted before the workers stopped. This is an incomplete suite, not a pass.
- The runner reported `browser sections skipped: 0 (none)`; this does not establish that every browser section was reached before the workers exhausted memory.
- No checks, performance budgets, game source, save fields or online code were changed.
- Git whitespace validation passed before commit.

Claude should rerun the complete suite in an environment with sufficient memory before integration. The artwork copy, PNG decoding and build checks above completed successfully.
