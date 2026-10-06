# Eyes: checks that see the screen like a player

`node tools/build.mjs && node tools/eyes.mjs` plays the built game in headless Chromium at 360x740 and 740x360 and reports what a
player would notice. It reads the screen through `window.LF_EYES` (`src/js/89-eyes-hook.js`). Report only: it prints
findings and exits 0 unless `--strict`. One command, no CI needed. About 3 minutes for both sizes, 1 minute with `--quick`.

```
node tools/eyes.mjs                       both sizes, all four checks, findings in tools/.eyes/latest.md (+ .json, shots/)
node tools/eyes.mjs --quick               portrait only, shorter
node tools/eyes.mjs --html <file>         another build (a build from before the hook gets stageRects and the hook patched in)
node tools/eyes.mjs --only moments        layout, tipphase, moments, placeholders
node tools/eyes.mjs --strict              exit 1 when anything is found
```

## LF_EYES (read only)

| Getter | Gives |
|---|---|
| `rects()` | CSS-px boxes of the hero, foe, boss (opaque pixels of the drawn sprite), both HP plates, the guide tip and its marker |
| `phase()` | `idle`, `player turn`, `foe wind-up`, `parry or dodge window` |
| `tip()` | `{ action, text, target, button: { sel, hidden, greyed } }` of the guide hint on screen, or null |
| `sfx()` | sounds the game asked for since the last call (it wraps `SFX.play` and passes every call through) |
| `floats()` | the stage's floating texts still alive (LEVEL UP and the like) |

`tools/check.mjs` section "LF_EYES hook (browser, qa-player-eyes)" tests each getter and that reading changes no save state.
`stageRects()` in `62-stage.js` is the one shared-file addition: it reports where the stage last drew each sprite.

## The four checks

1. **Layout.** Fixtures: first fight, a foe that opens the fight, first boss, first unique, first craft. The player bot reads each
   tip for 1.2 s, then presses what it points at. Finds: the tip covers, or comes within 6 px of, the hero, a foe, the boss or an HP
   plate (6 px because the boss tip that Cal saw touched the boss's crown); page boxes overlapping by more than 4 px where
   neither holds the other (`ALLOW` in `tools/eyes.mjs` lists meant overlaps, each with a reason); clipped text (ellipsis, cut
   height, off the screen); the tip's pointer more than 8 px from its marker (judged once the marker stops moving); sideways scroll.
2. **Tip against the fight.** The tip asks for an action the game cannot take now (Attack or an ability while the foe winds up;
   Dodge or Parry on the hero's turn), or names a greyed or hidden button. Counts only when it lasts half a second.
3. **Moments.** Each moment is made to happen (first boss win, unique drop, rare craft, a plain craft's grade, level up, new
   ability, new Star, new hero, new look) while a guide step is up and a level up has just landed. A toast, card, banner, sheet or
   stage text that has its name (and rarity where it has one) must stay up for 2 s, and a sound must be asked for. The bell does not
   count. A control (a toast drawn straight on screen) must be seen, or the reader itself is flagged. Not yet forced: a story
   card competing (it holds the game).
4. **Placeholders.** Visible two-letter tiles (`.mono`, `.sp-mono`, `.ab-mono`) where an icon should be.

## Reading a finding

`first fight, portrait: tip pointer off its target. pointer at x 180, target 8,516 88x108: 84 px away`. The scenario, the size,
what is wrong, the numbers, and a screenshot in `shots/`. A finding is a question for the owner of that screen, not a verdict:
fix it, or add it to `ALLOW` with a reason.

## Limits

- The bot is one kind of player. A foe that opens the fight is forced by setting the turn meter, not met in play.
- Moments are made to happen through the game's own functions; the check proves what shows, not that the drop was likely.
- Fixtures `save-mid` (first craft, moments) is an old save: its guide state differs from a real player at that point.
- CI: `tools/ci/eyes.mjs` (sys-proof-ci) replays the Bar's routes. This tool is the local, wider read; wiring a summary into that
  job's PR comment is a follow-up card (`ap-eyes-ci-summary`), kept out of CI until Actions minutes are back.
