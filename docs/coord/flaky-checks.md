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

## solo copy (browser, W1-C), W1-F counts (tools/check.mjs), w1f-scan-load-flake, 2026-10-09

- **Seen:** "W1-F: the scan opened 384 item sheets ... 4 subclass cards ... 12 long-presses" failing in full local 4-job runs
  (three sightings on 9 Oct, two on bd5b361e). Not seen on CI. It passed when run alone.
- **Short count:** `items.cards` (needs 4). Reproduced with 3 or 4 copies of the section beside two shards: 6 subclass cards
  became 4 in 6 of 42 runs, one hero's choice card opening with no tabs. A page-side watcher showed that hero's path (Reaver,
  Warlock) was already taken during the item-sheet step.
- **Read too early / wrong target:** the "evolution choice" step leaves the path card open, and the item-sheet steps pressed the
  Save, Reforge and Compare buttons with forced pointer clicks (300 ms timeout, error swallowed). A forced click lands on whatever
  covers the button's spot. Unloaded, every one failed ("outside of the viewport", "not visible") and was swallowed, so the
  buttons were never pressed; under load some landed on the path card's "Become" and then "Yes". Not a game bug.
  `items.press` (needs 12, exactly 12 happen) was one slow tick from the same fate: a fixed 700 ms hold read a 550 ms long press.
- **Fix:** the item-sheet and hero-sheet buttons are found and clicked in one step inside the page (a DOM click on the button
  itself), with nothing swallowed. A first try that found the button with `locator.count()` and clicked it in a second call
  crashed 3 times in 12 loaded runs: the sheet redrew between the two (Salvage arms and hides the Reforge box).
  The hero-sheet loop's selectors (`.sheet .cl-go`, `.cs-act`, `.cs-story summary`) match nothing in the game today, so that loop
  presses nothing, before and after; left for a follow-up card. The long-press step waits (capped at 5 s, a miss fails naming hero and slot) for the action
  bar, for the last sheet to close, and for each slot's sheet or picker; a slot with nothing to hold keeps its plain hold. A real mouse
  resting on the button still lost Attack's long press twice under load (a full 4-job run, then 1 of 20 section runs, both Tobin):
  Attack acts on the press, the dock's pane redrew, the bar got shorter, the Fight panels tabs slid under the resting pointer, and
  the button's `pointerleave` dropped the press ("events: down:atk leave:atk ...; under the pointer: sb-tab"). Holding the game
  still did not stop it. The press is now the slot's own `pointerdown` and `pointerup` sent to the button, so the game's long-press
  code runs as for a finger and a redraw cannot move the pointer off it. A missed press names the slot's pointer events. A
  subclass choice with no tabs fails saying which path was taken. Thresholds (100, 4, 12) unchanged.
