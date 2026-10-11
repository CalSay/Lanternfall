# Judge: first-hour-jargon (draft 2)

Opus high judge (run from `.claude/agents/judge.md`), 2026-10-11, read-only, on draft 2 of `../first-hour-jargon.md`
after the red team (`red-team.md`). Draft 3 made every edit below.

**Ruling:** card A to G, with the edits. Fork 1 (how fight words are told): the hybrid. A chip or meter answers a tap or
hover, and at most one line shows the first time a status lands in a fight. Fork 2 (card F): hold only the display; the
release clock and the stall bound stay.

**Why:**
- Lines only fails: the trick line rewrites itself, shows 1.6 to 1.8 s and goes silent while `warnSticky` is set
  (`75-turn-ui.js:272, 285`). Nobody can read it twice.
- Tap only leaves the word hidden when it matters. The game already uses the hybrid for the resource: the tip opens by
  itself on the first point, then answers a tap (`75-turn-ui.js:188-197, 351`). Foe tricks "say so when they land"
  (DECISIONS). Desk 66 asked for a tap only late in that run.
- A line in the hero's turn is safe: the fight waits for the player there (`turnWaiting`, `59k-turn.js:190-195`), so no
  timer has to hold the game.
- Holding the release would test the stall bound `stall <= gap + 3` (`tools/check.mjs:2873-2874`), set by a judge.
  Holding the display meets F5 ("announced between fights") and leaves every number in the unlock-gap ruling alone.
- Checked in code: `guardX` 0.6, `exposedX` 1.25, `sunderX` 0.5, `bashGrit` 2, `gritDmg` 0.08 (`59k-turn.js:80-83`);
  Guard 3 on a Perfect Bash (744); the stun lock and boss stagger (559-577); the ring grade uses `abs`, and no press grades
  Miss (1054, 1068). Not checked: each player-note time in section 4, and the first weapon's Essence cost.

**Edits before carding (all made in draft 3):**
1. Exposed: Bash counts its own Exposed down (`59k-turn.js:744, 812`), so only the very next move cashes it. The line
   says "if your next move is an Attack or Heavy Strike, it hits 25% harder", as a rule, not advice (no combos).
2. Card B: chips and meters only, not pops (canvas floats that fade in about a second). Foe chips are on the canvas
   (`62-stage.js:2163`), so B adds `62-stage.js`; a stage tap during a fight does nothing today (`:2219`).
3. Card B: the first-landing line shows only in the hero's turn and clears on the next press (the beat map's Never: no
   foe acts while a tip is on screen).
4. Card B: name the clash with `desktop-tooltips` (P1), which owns hover.
5. Card F: hold only governor-released rows; a row the player or a drop opened (`now()` true) shows at once. The walk
   logs a shown time per row, and F4 must hold on shown times too.
6. Card A: drop only the Hammerfall sentence from the Grit tip; keep "Shield Bash 2" and "takes 1% off the damage you take".
7. Card D: catch every "Dim Essence", including recipe and Storehouse names from `matName` (`20-data.js:42`).
8. Cards C and E: update the exact-text checks (`check.mjs:18113`; `17772`, `17784`) to the new copy, just as strict.
   C covers both lantern branches (`75-caches-ui.js:71`).
9. Ring words: use the parry card's "Too early" / "Too late". Card A's existing file says sonnet-medium; the plan uses
   Opus medium (model routing's default).

**Veto phrases:** "Tap only, no fight lines" (fork 1). "Hold the release, not the display" (fork 2).

**Risks:**
- The prediction misses: more than 9 unread words in minutes 0 to 15 at the next Sunday check would show one line a
  fight is too slow, or that nobody finds the tap.
- Held displays bunch after long fights: if the walk's shown-time F4 count goes over 2 in 3 minutes, re-rule toward
  holding the release with the bound signed off.
- A copy check is loosened instead of updated, which breaks the cards' own Never.

**DECISIONS.md line (for the Foreman):** - **Fight words are told by tap and by first landing (first-hour-jargon, Opus
high judge 2026-10-11; Cal can veto with "Tap only, no fight lines" or "Hold the release, not the display").** Every status
chip and resource meter answers a tap or hover with its line, built from the move that landed. The first landing of a
status in a save shows that line once in the hero's turn, at most one a fight, and it clears on the next press. A
released tab shows once no foe is on the stage. The release clock and every check bound stay; rows opened by the player
or a drop show at once. Plan: `docs/design/first-hour-jargon.md`.
