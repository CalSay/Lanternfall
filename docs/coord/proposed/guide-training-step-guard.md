# guide-training-step-guard: The guide never pauses the game with nothing to tap

Status: proposed. Source: first-hour walk (walk-2026-10-06). Cut from guide-phase-guards to keep that PR small.

The "Open Training." step puts its marker on an empty spot (231,575) and its tip sits behind the Hero sheet. The chop and Workbench rings (231,446) lead nowhere on tap. The game stays paused until Training is tapped.

Outcome: a guide step that pauses the game always has a visible, tappable target. Guard the `upgrade` step (and chop/bench rings) so it does not pause when its target is missing. Do not polish Training itself: PR #58 removes it.

Update (21:56, early-game lead): #58 swaps "Open Training." for "Open Build." through the same `path()`, so the bug survives #58. Fix it as a general guard in `75-onboard-ui.js` `tick()`: a step whose target cannot be tapped must not pause the game or show a ring.

Tried and backed out in guide-phase-guards: a `reachable()` test (nonzero size, centre inside the viewport, not covered inside the menu panel) called after the `vis()` check. It broke the guide walk and the C2 "offscreen target still scrolls into view" checks, because legitimate targets start offscreen and scroll in, and the tab buttons count as covering. A real fix needs the exact failing state from the walk (marker at 231,575 with the Hero sheet open) and must keep those checks green.
