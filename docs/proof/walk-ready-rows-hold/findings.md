# walk-ready-rows-hold: why Ready rows sat on Next Up and why the walk "stalled"

Evidence: the walk logs of 6658f2a5, c9c645e2 and 6e534acc (autopilot/reports, 10 Oct), the seed 1 walk on this branch
(walk-seed1.txt next to this file), and the game code named below.

## 1. The Ready row that held: the bot, triggered by a game Go that lands in the wrong place

The row that sat Ready from about 31 min to 60 min in every walk since the Tavern came in is **"Tam is at camp: send again"**
(goal `hands-back`, src/js/57f-hands.js:738). The "essence to the Essence Keeper" row in the card is the Achievements nudge
(`deeds-near`, src/js/58-deeds.js:708); its bar is capped below 100% (`DEED_TUNE.nearMax`), so it never reads Ready and never held
anything.

What happened, each walk (6658f2a5 at 30:54 to 31:12, c9c645e2 at 33:38 to 33:57):

1. followNextUp pressed the row's Go 4 times. Each Go opened the Tavern on `#sec-hands` (the hire list), and the one button there
   is "Tents 1/2". The bot pressed it; nothing changed; after 4 presses it gave up on the goal (`st.calls`, as designed).
2. gateStep opens Next Up only when no row is Ready, because "a Ready row is followNextUp's". It did not know followNextUp had given
   up, so Tam's row blocked every tier gate for the rest of the hour. The bot never worked Woodcutting or Mining for a gate again,
   and gathering ended at Mining 8 and Woodcutting 8 of 14.

So the hold is the bot's: **fixed here.** gateStep now ignores a Ready row followNextUp has given up on (4 presses that changed
nothing), and works the gate as before. On 6658f2a5 the gate row was row 3 of 3 at 45 and 60 min, so this fix would have let the
bot press it.

**Why the seed 1 walk on this branch still works no gate after 36 min (walk-seed1.txt):** the game no longer shows the gate row.
On base 7a0c69ec the craft row ("Birch Bow: Mining 7 of 14 opens Iron Ore") ranks 9 of 13 at 45 min and 7 of 12 at 60 min, outside
Next Up's 3 rows. The rows above it are Tam's, "1 more Quarry Golems for bestiary page 1" (90% from 31 to 49 min, a foe from zones
the hero has left), "Defeat 15 Moss Slimes (zone 1)" (86%, the same) and "7 essence to Essence Keeper I" (93%). gateStep only
presses a gate row the list shows, so there is nothing to press, and a person would not see the gate either. The fix lets the bot
past Tam's row; it then looks for the gate row and finds none (it looks again every 30 s).

- **Game card (proposed): next-up-stale-rows-over-gate.** Next Up fills its 3 rows with near-done nudges the player cannot finish
  where they are (a bestiary kill or bounty for a zone 1 foe, the essence nudge) while the tier gate that opens tier 2 gear drops
  to rank 7 to 9. Evidence: walk-seed1.txt, lists from 31:45 to 56:13. Balance and ranking are the planner's call.

Also seen on this run: with Tam's row, followNextUp's fallback pressed "Hire for 1.50K gold" (35:48 to 36:06) in the hire list.
Nothing was bought (the presses changed nothing), but the hands-back Go fix above removes that risk too.

The game part is real too, and is carded, not fixed here (game changes are out of scope):

- **Game card (proposed): hands-back Go lands on Tam's card.** `hands-back` and `hands-app` share `go = { tab: 'world', view: 'tav',
  sel: '#sec-hands' }` (57f-hands.js:736). That section is the hire list (Tents, applicants). Tam's own button lives in
  `#sec-hands-crew`, further down, and for a Hand never sent it says "Send on a job" (then a job pick), not "Send again"
  (74-ui-hands.js:300-355). A person who presses Go sees "Tents 1/2" and the applicants, and has to scroll to find Tam.
  The row also says "send again" for a Hand who has never been sent (Tam arrives by story). Fix: `hands-back` goes to
  `#sec-hands-crew` and flashes the idle Hand's main button; say "send them out" when the Hand has no last job.
  check.mjs's "Next Up Go targets" passes today because `#sec-hands` is visible; it does not check that the target is the
  thing the row names. A person is not stuck (they can scroll), but the row stays Ready until they find Tam.

## 2. The "foe wind-up" stalls (52:47 on 9779cecf, 45:04, 27:01, 28:28): no stall a person would feel

The walk's stall check fires when kills, gold, zone, level, unlocks and tab stay the same for 90 s of game time (walk.mjs, the
`sig` line in run()). Two different things trip it, and neither is the game holding the player or #348's strike phase:

- **Gathering (27:01 on 6e534acc, 28:28 on 6658f2a5, 29:18 on c9c645e2).** The bot was in the Gather view for a gate or a Next Up
  Go (6658f2a5: gate session 26:54 to 28:25; 6e534acc: Hearth 2 gathering 25:42 to 26:57; c9c645e2: Tavern wood 28:04 to 29:36).
  Gathering raises skill XP and materials, which the signature does not count, and the fight behind it is paused, so the phase
  reads whatever it was when the hero left ("foe wind-up" or "idle"). The screen showed the Gather view working. A person would
  not be stuck.
- **Long fights and repeated losses (45:04 on c9c645e2, and the idle stalls at 48:50, 52:24, 53:34, 55:59, 58:38).** c9c645e2 lost
  the zone 16 boss at 44:29 and cleared it at 45:14: a long boss fight with no kill. The idle stalls sit inside strings of
  ordinary-foe losses (`normalLosses`: zones 19 to 21, a loss every 10 to 40 s; "idle" is the gap after each wipe). The screen
  showed fights and the loss card. A person would feel this as a wall, not a frozen game. It is a balance question
  (balance-pass), and part of it is the bot's own doing: with the gate held by Tam's row it never got tier 2 gear.

- **Walk card (proposed): walk-stall-counts-gathering.** Add skill XP (or materials) to the stall signature, so a working Gather
  view is not called a stall, and name losses in the stall line ("lost N fights in 90 s") so a wall reads as a wall. Out of this
  card's files (gateStep only).
