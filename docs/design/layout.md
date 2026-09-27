# Layout and notices

Owner feedback: the menu area was small, so players scrolled a lot, and notifications
covered the menus. This pass gives the panel most of the screen and moves notices onto the stage.

## Measured panel height (the scrolling menu area)

Mid-game save (`tests/fixtures/save-mid-v2.json`), Chromium, same on every tab.

| Viewport | Before | After, panel at top | After, panel scrolled (compact stage) |
|---|---|---|---|
| 360 x 740 | 264 px (36%) | 416 px (56%) | 460 px (62%) |
| 412 x 915 | 450 px (49%) | 503 px (55%) | 635 px (69%) |

Screenshots: `img/layout-before-*.png` (before) and `img/layout-360-*.png`, `img/layout-412-*.png`
(after: fight, party, craft, camp, scrolled, toasts, log).

## Screen, top to bottom

1. **Header, 48 px.** Portrait with level, name and XP bar, gold and embers, notices bell.
2. **Stage box.** Height `--stage-h = clamp(168px, 100dvh - 572px, 256px)`: 168 px on a 740 px phone,
   full 256 px from about 830 px tall. A HUD overlays its top (zone name and foe count, foe name, HP bar,
   boss timer) and its bottom left (DPS and Tap). The HUD never takes taps; they reach the stage.
3. **Control row, 50 px.** Fight / Gather / Raid on the left, the zone stepper (`< Zone 17 >`) on the
   right. The stepper hides while gathering or raiding.
4. **Panel.** Fills everything else and scrolls.
5. **Tab bar, 54 px, at the bottom** (thumb reach), plus the safe-area inset.

## Compact stage

When the panel scrolls down (past 40 px, and only if it would still scroll afterwards), the stage box
shrinks to `--stage-c` (124 px) and the stage slides up inside it so the party and foe stay in view.
Back at the top of the panel (under 6 px) it grows again. Switching tabs resets it.

- Only the box height changes. `#stage` and the canvas keep their full size, so 62-stage never
  re-lays out or re-bakes during the transition.
- The slide assumes the ground line sits at 80% of the stage height (`GY` in 62-stage). If that
  changes, update the `translateY` in `.app.compact .stage` (20-stage.css).
- In compact mode the zone line and the sound button hide; the foe line and HP bar shrink.
- 0.22 s ease-out; instant under `prefers-reduced-motion`.

## Notices (toasts)

API unchanged: `toast(msg, kind, icon)` or `emit('toast', { msg, kind, icon })`. New optional 4th
argument / field `prio`: `'high' | 'normal' | 'low'`. Without it: kind `loot` is high, the rest normal.

| Priority | What happens | Use for |
|---|---|---|
| high | Always pops; pushes out an older normal toast. 4.2 s (loot 5 s). | Level up, zone cleared, unique loot, recruit or companion joins, promotion, raid boss reward, Star Chart, a legendary forge, a new feature opening |
| normal | Pops if there is room; otherwise folds into the newest normal toast as "+N" and counts on the bell. 2.6 s. | Boss failed, achievement, bounty done, rare or epic forge, weekly goal, skill level that opens a new tier |
| low | Log only; counts on the bell. | Anything the player just did and can see (equip, salvage, common forge, upgrade, reforge, transmute, brew, switch mode, build queued), routine skill levels, bestiary steps |

Rules:

- Toasts live inside the stage box, just under the HP bar (in the sky), never over the panel, the
  control row or the ability button (right 62 px stay clear).
- At most 2 on a stage 200 px or taller, 1 on a shorter stage (small phones, compact strip).
- The container ignores pointers; each toast takes taps. Tap or swipe it sideways to dismiss.
- The same message twice while on screen becomes "+1" on the first.
- Every notice goes to the log: the bell in the header opens a bottom sheet with the last 50
  (this visit only, not saved). The bell count is the notices that did not pop. Opening the log clears it.

When you add a toast, pick the priority by asking: would the player be sorry to miss this? If they just
tapped a button and the panel already shows the result, it is `low`.

## Fight tab top

- The Omen banner is one 44 px row ("Omen · name", effect below). Tap to expand as before.
- Next Up starts collapsed to one row until the player toggles it (`S.nextUp.picked`, new field,
  default false; `S.nextUp.min` keeps its meaning).

## Rules for later UI work

- Size the stage from CSS only (`--stage-h`, `--stage-c` on `.app`). 62-stage reads its container.
- Nothing new between the header and the panel. New controls go in the panel (`registerSection`).
- Keep taps on the stage working: overlays on the stage need `pointer-events: none` unless they are
  buttons that stop propagation (the ability and sound buttons).
- Tap targets stay 44 px or larger. No horizontal scroll at 360 px; panel grids use `minmax(0, 1fr)`.
- Side gutter is `--gut` (12 px) for the header, stage, control row, panel and tab bar.
