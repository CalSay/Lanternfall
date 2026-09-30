# C26 approved primary resource art

Owner approved all seven primary resource families on 1 October 2026 and requested commit and coordinator handoff. There are 105 named designs: 15 grades each of Ore, Wood, Fibre, Hide, Herbs, Gems and Essence. Names, regional placement and source descriptions are in ../regional-audit/complete-ladder.json; Ore retains its existing 15 names.

## Files and use

The seven PNG atlases contain 3 columns and 5 region rows. Wood uses two replacements from wood-corrections-v1.png: Coralwood (grade 6) and Nightwood (grade 13). Use manifest.js as the authoritative selection and source rectangles, not a uniform grid: generated sheet spacing varies. All PNGs retain their generated alpha channels.

Run `node preview-server.cjs` from this directory; it prints a loopback port. Open that address for the labelled preview at 16, 22 and 64 pixels. To regenerate manifest.js, run `python build-manifest.py` with Pillow installed. The measured *-frames.json files are authoritative; analyze-wood-herbs.py records the initial analysis method and is not required for normal preview use.

Run `node check-preview.cjs` with PREVIEW_URL pointing to the server, PLAYWRIGHT_MODULE naming the installed Playwright package (defaults to playwright), and BROWSER_EXECUTABLE if using a non-managed browser. Checks cover 105 icons, all family/region filters, search, mobile overflow and script errors. Review screenshots are written beside the script.

## Integration boundary

This is approved visual source artwork, not wired game assets. The high-resolution sheets are scaled for visual review; native game pixel-grid/palette conversion and embedding remain coordinator work subject to the project's art rules. No source gameplay, saves, gathering rates, resource gates, or published artifact is changed here. The full 15-grade ladder requires its own gameplay integration; current runtime grades must not be silently remapped. Supporting currencies, trophies, secondary resources and other C26 packs are outside these 105 primary icons.

All artwork was made with the built-in image generation tool. Exact available prompts are in *-prompt.txt; wood/herb initial briefs are explicitly labelled reconstructed, while the wood correction prompt is preserved verbatim. Prior rejected iterations remain local and are not part of this approved handoff.

## Handoff validation (1 October 2026)

- `node tools/build.mjs`: passed.
- Full sharded `node tools/check.mjs`: 2,078 passing assertions, 1 failure, 0 browser sections skipped. The existing W1-B notices assertion reached 6 unread against a limit of 5. Coordinator acknowledgement and handoff exception: https://github.com/CalSay/Lanternfall/pull/1#issuecomment-5920464277 . This is not a green full-suite result. No game source changed in this art-only commit.
- Manifest rebuild: 105 names and in-bounds source rectangles passed.
- Portable preview checks: passed all 105 icons, seven family filters, five region filters, search, mobile overflow and script-error checks.
- `git diff --cached --check`: passed.
