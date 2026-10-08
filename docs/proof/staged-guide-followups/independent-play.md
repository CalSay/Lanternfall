# staged-guide-followups: independent play

Reviewer: an independent Claude agent, 2026-10-08. Build: `dist/lanternfall.html` as built from the builder's working tree.

How I played: a fresh game as Wren (intro skipped, no fixtures, no test shortcuts), my own Playwright driver on a fake clock,
stepped 100 ms at a time so every guide line is timed to the nearest 0.1 s of game time. Taps land on screen coordinates, as
a finger would. The driver reads `.ob-txt` directly, so it sees the guide panel over an open menu. It waits 1.5 s before it taps
Got it or Continue. Seven runs to the first Scroll and past it:

- Portrait 360x740: seed 1 (quick player: attacks, dodges every wind-up, uses Echo), seeds 2 and 4 (patient player: only Attack, plus what Hesketh asks).
- Landscape 740x360: seeds 1 (twice) and 3 (one quick, two patient). After the slot line, these runs open a menu (Hero, or Gather) and leave it open beside the fight for 30 to 45 s.
- The same landscape run on the base branch build (`origin/claude/elegant-johnson-m6k00u`), for comparison.

## Steps

### Step 2: one point in Might, then the back line. PASS in both views

- Portrait: "Put a point in Might." I add one point (4 free, 3 left). "When you're done here, close the menu and the fight goes on." comes
  1.1 s, 1.2 s and 1.3 s after the tap (three runs). Its Back to the fight button works.
- Landscape: 1.2 s and 1.3 s after the tap. The button works.
- Between the two lines the panel is empty for about 1 s. The game waits behind the menu. Nothing else shows.
- The base build took 15 to 20 s here, so the fix works.

### Step 3: the first boss, the card, then the Scroll line. PASS in both views

- In all six runs the Scroll line never showed before the "First boss down" card. No guide line was up while the card was up.
- Once the card has faded in, it sits on a clean, dimmed screen.
- After Continue the Scroll line came 300, 100 and 100 ms later in portrait, and 100, 200 and 100 ms later in landscape. Each time it came
  before the next foe walked in. The game waits on its Got it.
- One small thing: the dead boss still stands at "0 / 582" behind the Scroll line until you tap Got it, because the game is held there.
  It does not get in the way.

### Step 4: learn Power Shot from Hero > Abilities. PASS in both views

- I tapped Learn twice (Power Shot, paid with the Moss Scroll). Every run says "Power Shot is next to Echo now. Press it there when it's
  ready." The row reads Attack | Echo | Power | Empty, and in landscape the Abilities view reads Q Echo | W Pow… | E Emp…. The line
  matches what is on screen. (Base build: "next to Attack".)
- Portrait: the line comes at once, with the Hero menu over the fight.
- Landscape: the line comes 8.6 s, 12.7 s and 22 s after Learn. The fight goes on beside the menu, and Hesketh waits for the gap after
  the kill. That follows the card's "never beside a live fight", and the base build does the same. A player may wonder why he took so long.

### Step 5: landscape. PASS for the card's own items. FAIL on one path that the change did not cover

- In every run, in both views, no guide line was up while a foe was alive and the game was running.
- I saw no line on screen for under 1 s between fights. (The only short lines in my logs are the lessons and the "Open Hero" line,
  which I ended myself by pressing the button within 0.1 to 0.9 s.)
- Lines that start in the gap after a kill hold that gap until you tap Got it. In landscape the Bestiary's first-use line, opened mid-fight,
  waited for the kill, then held the gap with a Got it. It cleared on its own after 6.9 s, as first-use lines always do.
- The fire talk at 740x360 (the `story-card-landscape-fit` route): the second page shows all four of Hesketh's lines, with Continue and Skip.
- **Fail path:** in landscape, with the Hero menu left open beside the fight, "Tap Gather and chop some Pine Log for the fire." popped up
  in the middle of a fight. Once it came during the foe's wind-up (Parry and Dodge lit), once during the foe's recovery. It froze the
  fight there until I acted. Its ring sat on the menu's tabs, not on Gather. The base build does exactly the same, so this change did not
  cause it. But it is what step 5 says must not happen ("no line from him pops up while I'm in the middle of a fight").

### Step 1 (not mine to judge, checked anyway)

- Attack, Dodge, Echo and Parry each showed and held the game at the right moment (wind-up for Dodge and Parry, your turn for Attack and
  Echo). The boss tip showed as the boss walked in, with Got it, in every run.
- #197's route, `grep -v '^#' docs/proof/cal-0107-staged-guide/route.txt | node tools/playtest.mjs batch --seed 1`: **EXPECTS: 14 pass, 0 fail**.
  With `--landscape`: **EXPECTS: 14 pass, 0 fail**.
- No page errors in any run.

## Problems a player could still notice

1. **Portrait, Fight menu: the Bestiary and Bounties first-use lines are lost (new with this change).** If I open Fight > Bestiary while a foe
   is alive, Hesketh never says his line: the fight waits at my turn under the menu, so no gap ever comes. If I open it in the gap after a
   kill, the line shows for 1.7 s, then the next foe walks in and it vanishes, unread, with no Got it. The base build showed it for 7 s and
   marked it read. Repro: zone 6 or 60 kills (or `onboardReveal("bestiary")`), portrait, Fight menu, Bestiary, while fighting.
2. **Landscape, any menu open: a between-fights step freezes a live fight** (from before this change; step 5's fail path above).
3. **The back line now covers the last attribute row.** It comes 1 s after the first point, while 3 points are still free. In portrait its
   panel sits over Vigour: +5 is under the panel's ×, and most of +1 is hidden. You have to scroll to reach them. Before, you had 15 to 20 s free.
4. **Landscape: the slot line comes 9 to 22 s after Learn** (see step 4). It is correct when it comes.
5. **Landscape: the back line's button reads "Back to…"**, cut short in the side panel. This was the same before.
6. **Next Up's note now stops the game until you tap Got it** when it starts on the fight screen. That is what item 3 asks for, but the step's
   own comment says it "never pauses and never blocks (audit-1 3.8)". An idle player who walks away loses that time.

## Code review findings

1. **Regression: a first-use line on the Fight menu in portrait.** `src/js/75-onboard-ui.js:361` now computes a first-use line only when
   `guidePhase(!guideMenuCovers()) === 'between'`. `guidePhase` (`src/js/55-onboard.js:184`) treats the Fight menu (`S.tab === 'adv'`) as
   see-through in every view. But `fightInView()` (`75-onboard-ui.js:326`) treats a portrait menu as covering the fight, so `gap`
   (`:367`) is false and nothing holds the line. Failure path: portrait, fighting, the Bounties or Bestiary view open. Opened mid-fight, the
   phase is never 'between', so the line never shows. Opened in the gap, it shows until the next foe's intro, then `step` is null and
   `hide()` runs (1.7 s in my run). `hide()` also resets `useT0`, so the 7 s read timer never completes. Fix idea: gate on
   `!fightInView() || guidePhase(true) === 'between'`, the same test the hold uses.
2. **Not fixed: a between step can start mid-fight in landscape with a menu open.** `src/js/55-onboard.js:327-328` and `:311` call
   `guidePhase()` with no argument. With any menu open (other than Fight) that returns 'between', even at 740x360 with the fight
   in view. So `gather`, `upgrade`, `bench` and the like start and pause mid-fight, including inside a foe's wind-up. This is the card's item 2
   and Outcome in a wider form. #197's own note ("a camp or menu tip never freezes a fight") says it should not happen. It predates this diff,
   but step 5 fails on this path.
3. **Stale comments and a changed rule.** `gapHeld` (`75-onboard-ui.js:369`, `:396`) makes the `nextup` note and landscape first-use lines
   pause the game. The comments at `55-onboard.js` (nextup: "never pauses and never blocks") and `75-onboard-ui.js` (a first-use line
   "never pauses the game") are now wrong. Whether Next Up's note may stop an idle game is a call for Cal or the planner.
4. **Live-progress lines are now silent on the fight screen.** `75-onboard-ui.js:368` hides any between step with no Got it (the
   `stock:*` "needs" lines) while `fightInView()`. They used to flash, so this is the intended trade. But in landscape they now show only
   when you are not fighting, even with a menu open.
5. **Deadlock check: none found.** The card hold (`:355`) sets `ONBOARD.paused` only while a big card is up or queued *and* no cache is
   pending, so the cache still opens on the next tick. A kill ends `TURN_LIVE` in the same step that resolves it, so the moment layer's
   `fighting()` is false and its 100 ms timer flushes the card. `guideBusy()` gives up after 1 s. When the card closes, `cardComing()` turns
   false and the line shows. Got it works on every held line: `finish()` handles `use:`, `say:` and plain steps. A `lost` target clears the pause.
6. **Slot line edge (low).** `75-onboard-ui.js:91-92`: if the slot left of the new move is empty, it says "is in slot W". Learn always fills the
   first empty slot, so this cannot happen from Learn. If it ever does, note that the portrait action bar shows no Q/W/E letters.
7. **The fixes asked for work.** `BACK_WAIT = 1` (`55-onboard.js:163`) gives the back line in 1.1 to 1.3 s. The Scroll line waits for the
   card and shows after Continue. The slot line names the move on its left, as the row labels it.

## What the builder changed after this play (not re-played by the independent player)

- Finding 1 (portrait Fight menu lines lost): fixed. A first-use line now waits only when the fight is really in view beside the menu
  (landscape); a portrait menu covers the fight, so its line shows at once and pauses nothing, as before. Check: "staged guide follow-ups:
  in portrait the Fight menu's first line (Bounties) shows over the menu and pauses nothing".
- Finding 2 (landscape: a between step starts mid-fight beside a menu and freezes it): fixed in `55-onboard.js` `onboardStep`. On a wide
  screen a step starts only in the phase the fight is really in. Check: "in landscape, with the Hero menu open, a between line never starts
  over a live fight". The back line still comes within 2 s of the first point in both views (checked at 740x360 and 360x740).
- Finding 3: the comments now say that a Got it line or a landscape first-use line holds the gap between foes until read.
- Findings 4 and 5 stay as they are and are listed in the PR: the back line sits over the Vigour row while it shows, and live-progress
  lines (materials, gold) wait for a calm screen instead of flashing up between foes.
