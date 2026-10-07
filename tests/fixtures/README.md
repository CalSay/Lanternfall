# Save fixtures

Every `*.json` here is a v5 save. `tools/check.mjs` loads all of them in every save-integrity section (saves, items, retool,
stars, Deepwell, camp, save codes, export after play, and the rest), so adding a file is enough.

- `save-early|mid|late.json`: written 2026-09-30, before the attribute, star-budget and guide-voice changes. They prove old saves
  still load.
- `save-current.json`: a played save from the current game (points spent, tips retired, stars lit). Re-snap it with
  `node tools/snap-fixture.mjs tests/fixtures/save-mid.json tests/fixtures/save-current.json` when a new writer of saved state merges.
- `save-release-YYYY-MM-DD.json`: a played save snapshotted from the deployed SHA on a Monday (docs/coord/deploy-log.md, "Release snapshot").

Empty bounty slots must wait until 2100 (`snap-fixture.mjs` does this). Never edit a fixture to make a check pass.
