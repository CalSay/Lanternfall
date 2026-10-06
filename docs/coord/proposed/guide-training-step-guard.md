# guide-training-step-guard: The guide never pauses the game with nothing to tap

Status: proposed. Source: first-hour walk (walk-2026-10-06). Cut from guide-phase-guards to keep that PR small.

The "Open Training." step puts its marker on an empty spot (231,575) and its tip sits behind the Hero sheet. The chop and Workbench rings (231,446) lead nowhere on tap. The game stays paused until Training is tapped.

Outcome: a guide step that pauses the game always has a visible, tappable target. Guard the `upgrade` step (and chop/bench rings) so it does not pause when its target is missing. Do not polish Training itself: PR #58 removes it.
