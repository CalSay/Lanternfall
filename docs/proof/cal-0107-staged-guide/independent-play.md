# cal-0107-staged-guide: independent play check

**Verdict: not ready. 7 of 10 steps pass and 3 fail (6, 7 and 10).** The held fight lesson (steps 1 to 5) works well on all three heroes.

Played 2026-10-08 through dist/lanternfall.html as built, in headless Chromium, with real clicks and key presses. I read game state only to check things. Runs:
Wren portrait 360x740 (steps 1 to 10, played straight through from a fresh game, four runs); Tobin portrait using the keys d/s/q/a (steps 1 to 5,
twice); Pip landscape 740x360 using clicks (steps 1 to 5); the unlit-8log fixture in landscape (step 9). "Nothing moves" means that while a
line was up, the turn clock, hero HP and foe HP read the same twice, 0.6 s apart. Screenshots are in the session scratchpad at `indep/`,
not in the repo.

| # | Result | What I saw |
|---|---|---|
| 1 | PASS | The last fire card is "Something's coming up the road. Keep that lamp behind you." After Continue, the foe walks in about 2.5 s later. Same for all three heroes. |
| 2 | PASS | "There it is. Press Attack and hit it." The clock stays at 1.333 and both HP bars stay the same for 2.5 s, until I press Attack. |
| 3 | PASS | The foe winds up and the fight holds at the start of the Dodge window: "It's about to hit you. Press Dodge now and get out of the way." It stayed held for 2 s. I pressed Dodge, saw "Dodged", and lost no HP (also with the S key on Tobin). |
| 4 | PASS | "Echo Shot is ready now. Press it." (Tobin: "Shield Bash…", Pip: "Fireball…"). The fight holds. Nothing about swapping. The empty slots only read "Empty" with a "+", and no text asks me to tap them. |
| 5 | PASS | "Here comes another. Press Parry now, just before the blow lands." The fight holds, I parry (parries=1) and lose no HP. For Wren and Tobin the ability killed foe 1, so this came on foe 2's first swing, as the step allows. |
| 6 | FAIL | Between fights it works: the scroll line waits on Got it and no foe comes for 3 s or more. But he also speaks **during** the first boss fight. On my first turn, after the boss's opening hit has already landed, the fight holds on "That's the zone boss. Watch its bar, and Dodge or Parry every hit." [Got it]. |
| 7 | FAIL | At the end of fight 2, "The Hero tab is open now. Open Hero and spend your new points." The game waits. Next come "Open Build." and "Put your point in Might. It makes you hit harder." I did what he said and put one point in. Then he says "This is where you grow. Your level, build and abilities are all here." That is a second Hero tab introduction. About 20 s later: "When you're done here, close the menu and the fight goes on." [Back to the fight]. If I spend all 4 points instead, the second introduction does not show and the back line comes at once. |
| 8 | PASS | "You can gather now. Bring me Pine Log for a proper fire, and we'll talk once it's lit." [Got it]. |
| 9 | PASS | Lighting the fire opens the talk over the grove scene, and I stay on Woodcutting at the Pine Grove. Afterwards I'm still chopping there and his line is "Chop 12 Pine Log for the Workbench (0/12)." I got the same result on a fresh game and on the fixture. |
| 10 | FAIL | First half passes: "That boss dropped a Moss Scroll. Open Hero, then Abilities, and learn a new move with it." Second half fails. Learning Power Shot drops it into slot W by itself, so the queued slot line is dropped and he never tells me to put it in a slot under the fight. The other heroes learn moves the same way, so I expect this for them too. |

## Other problems a player would notice

1. **The boss warning comes too late (step 6).** The first boss's opening move ("Engulf") lands with no warning. Only on my next turn
   does he say "Dodge or Parry every hit". Repro: fresh Wren, play to fight 5 of zone 1, and do not press anything on your first turn for about 0.5 s.
2. **"Put your point in Might" says one point, but I have four.** The line before says "spend your new points", and the Build view says "3 points
   to spend" after one is used. Following his words leaves points unspent, and that is what triggers the second Hero line and a 20 s wait before
   he says how to get back. Repro: step 7, press +1 once.
3. **No slot line after learning (step 10).** Learning a move puts it in the first empty slot (75-abilities-ui learn button), so
   `SAY_STILL.slot` drops "Your new move needs a slot…" every time on the first Scroll. Repro: beat the zone 1 boss, tap Got it, then Hero >
   Abilities > Power Shot > Learn > Tap again. Slot W fills, and he says nothing.
4. **The scroll line flashes, then a card covers it.** As the boss dies, the scroll line pops up. A moment later the "First boss down" Lantern cache
   card covers it, which also lists "Moss Scroll". At the same moment the stage shows the zone banner, its story text and "Bounty ready". The line
   comes back after Continue. It reads as busy and out of order. Repro: beat the zone 1 boss in portrait.
5. **The Gather line can come during a fight.** In portrait, I was on the Hero menu (learning the move) while a zone 2 foe was live behind it.
   "You can gather now…" [Got it] popped up over the menu. The menu counts as "between fights", but a fight was going on behind it.
   Repro: after the first boss, stay in Hero > Abilities until the Gather tab opens, about 90 s after the Hero tab.
6. Minor: the marker ring slides over from its last target. For a moment it sits half on Echo and half on the empty slot (ability lesson), or on
   empty space in the Hero card ("Open Build."), before it settles. Repro: screenshot right as each line appears.

What works well: each hold stops at the exact opening of its window, so the press always lands. Holds survive 2 s or more of waiting. Keys work
during a hold. Landscape shows the lines in the side column without covering the controls. No page errors (only blocked font requests).

## Re-play after fixes (2026-10-08)

**Verdict: ready. Steps 6, 7 and 10 now pass, and steps 2 to 5 still pass for Wren in portrait.** I played dist/lanternfall.html (built from 92485d88) three times
from a fresh game as Wren at 360x740, with clicks (two runs) and the keys d/s/q/a (one run). I read state only. Screenshots are in the scratchpad at `indep2/`.

| # | Result | What I saw |
|---|---|---|
| 2-5 | PASS | Same as before, all three runs: "There it is. Press Attack and hit it.", "It's about to hit you. Press Dodge now…", "Echo Shot is ready now. Press it.", "Here comes another. Press Parry now…". Each one holds the fight (clock and both HP bars do not move) until I press. |
| 6 | PASS | The boss tip now comes as the boss walks in (intro, turn clock 0.02 to 0.17 s), before its first move: "That's the zone boss. Watch its bar, and Dodge or Parry every hit." [Got it]. The fight holds for 3 s or more until I tap it. Nothing else spoke during a fight in about 8 minutes of play across the 3 runs. The Scroll, Uniques and Gather lines came between fights, and no foe came until I tapped Got it. |
| 7 | PASS | At the end of fight 2: "The Hero tab is open now. Open Hero and spend your new points." → "Open Build." → "Put a point in Might. It makes you hit harder." → "When you're done here, close the menu and the fight goes on." [Back to the fight]. No second Hero tab line, whether I put in 1 point or all 4. |
| 10 | PASS | "That boss dropped a Moss Scroll. Open Hero, then Abilities, and learn a new move with it." After Learn and Tap again, Power Shot goes into slot W and he says "Power Shot is next to Attack now. Press it there when it's ready." [Got it]. That makes sense, and after I closed the menu, Power was ready in the row under the fight. |

Small problems a player could still notice (none of these fails a step):
1. **A quiet gap after one point (step 7).** He says "Put a point in Might". If I add just one point, he says nothing for about 15 to 20 s, while "3 points to spend"
   shows and fight 3 starts behind the menu (2.5 s after the point). Then the back line comes. If I spend all 4 points, it comes at once. Repro: step 7, press +1 once, then wait.
2. **"Next to Attack" is a little loose (step 10).** The row reads Attack | Echo | Power | Empty, so Echo is next to Attack and Power is one further along. He also says
   it while the Hero menu covers the fight. A zone 2 foe (Gloomjaw) is already waiting behind the menu when he speaks.
3. **Still there from the first play: the Scroll line flashes, then a card covers it.** The line shows for a moment over a busy stage: the zone banner, the story
   text, "LEVEL UP", "Bounty ready", and a foe card that still reads "Elder Moss Slime 0 / 582". Then the "First boss down" card covers it for as long as it stays open. After
   Continue the line comes back. Repro: beat the zone 1 boss in portrait.
No page errors (only the blocked font requests). My first run showed the page shifted up under the cache card. It came from my script's click on an Attack
button the card covered (Playwright scrolls to find a spot to click). It did not happen when I did not tap under the card, so it is not a game problem.
