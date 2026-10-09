# Flaky checks

One entry per check that failed at random and was fixed: what it read too early, how it was reproduced, and the fix. A fix
changes how a check waits for the real state; it never loosens, skips, retries or quarantines the check, or lengthens a timer.

## craft reveal (tools/check.mjs), craft-reveal-flake-watch, 2026-10-09

- **Seen:** "craft reveal crashed: page.evaluate: TypeError: Cannot read properties of null (reading 'dataset')" in full local
  4-job runs (three sightings, one on 07aaae10). It passed when run alone.
- **Read too early:** the odds read `document.querySelector('.cf-rec').dataset.kind` 500 ms after clicking the Forge tab. Under
  load the tab's first open builds its sections over later tasks, so the recipe rows were not drawn yet and `.cf-rec` was null.
  Reproduced with the section's opening steps under 15x CPU throttling: one view of six had no `.cf-rec` at 500 ms, and the rows
  came about 0.9 s after the click. Not a game bug: the rows draw a moment later.
- **Fix:** the section waits for each state it reads instead of a fixed timer: the recipe rows after the tab click and each
  craft's own result card (both fail plainly, e.g. "the Forge recipe rows (.cf-rec) never appeared within 5 s"), then the card
  closing after Equip and a bag tile after opening Gear (their asserts name a miss). Every assert is unchanged.
