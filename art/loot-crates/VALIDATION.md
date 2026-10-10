# Crate art package validation

Validated 10 October 2026 on branch `codex/sovereign-crate-reveal`, based on
`origin/claude/elegant-johnson-m6k00u` at `1e14b635`.

## Passed

- `node tools/build.mjs`: rebuilt `dist/lanternfall.html` (8129.4 KB); the generated
  file has no diff against the branch baseline.
- All 31 artwork and prompt files match the SHA-256 hashes and byte counts in
  `manifest.json`. The saved image/GIF files are unchanged copies of the reviewed
  session outputs.
- The packaged sheet extractor recreated all eight poses and four original effects; all artwork hashes remained unchanged.
- Syntax checks passed for `render.cjs`, `prepare.cjs` and `make-preview.cjs`.
- The portable package renderer ran with `--stills` using Node 24.19.0 and the
  pinned canvas/sharp versions. Both `reward-hold.png` and
  `timing-contact-sheet.png` reproduced byte-for-byte.
- Full GIF metadata: 960 x 640, 400 frames, every delay 20 ms, total 8000 ms,
  infinite preview loop. First/last-frame mean channel error is about 0.485/255.
- Smaller GIF metadata: 720 x 480, the same 400 frames and 8000 ms.
- Opening, burst and reward-hold samples were visually inspected during authoring.

## Incomplete repository check

`node tools/check.mjs --jobs=2` was run with the bundled Playwright available.
Both workers exhausted the approximately 2 GB V8 heap and exited before the full
suite finished. The final output reports `2 check(s) failed` and
`browser sections skipped: 0 (none)`. This is an incomplete run, not a passing
browser suite. No test was weakened or removed, and no performance budget changed.

Build and check logs remain in the local session output directory; the above is
the handoff record. The full suite still needs a successful run in an environment
with sufficient test-process memory before integration.

## Scope

Only `art/loot-crates/` is added. No runtime source, live artwork wiring, balance,
save schema, online code, build tooling or published artifact is changed. These
files are an art prototype awaiting the normal complete-pack review.
