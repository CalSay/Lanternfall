# Rubric: UI

For menus, screens, layout, navigation and in-page icons. Coverage-map areas 1, 2, 4, 11, 16, 17.

## Hard checks

- Build and full `node tools/check.mjs` pass.
- Looked at in a browser at 360px portrait, landscape and reduced motion. Say which was run; skipped views are
  named, not assumed.
- Nothing overflows or scrolls sideways at 360px wide.
- Tap targets are at least 44px.
- Text contrast is readable (4.5:1 for body text); meaning never rides on colour alone.
- Respects `prefers-reduced-motion`.
- No `alert`, `confirm` or `prompt`; confirmations are in-page.
- Online layer untouched.
- Menu matches the draft or ruling it was built from.
- Game doc current: a player-visible change updates `docs/GAME.md` in the same PR.

## Scored criteria

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| Time to understand | A new player stares for more than 10 seconds | Clear in about 5 seconds | Clear at a glance |
| Taps to the main action | The main action is three or more taps deep | Two taps | One tap, or already on screen |
| Copy clarity | Jargon or long sentences | Plain but wordy | Short, active, uses the player's names for things |
| Consistency with other menus | Looks and behaves like a different game | Same style, a few odd controls | Same patterns, spacing and wording as its neighbours |
| Text leads, art supports | Art carries meaning the text doesn't, or crowds it | Text and art both there, balance off | Text says it, art confirms it |
| Information load | Too many numbers, currencies and buttons at once | Busy but scannable | Only what the player needs now |

## Blocking

Any failed hard check; a score of 1 or 2 on any criterion except "Copy clarity" (weak copy is `minor`, P2, per `AGENTS.md`); a screen with no way back; a button that can't be tapped; text cut off at
360px.
