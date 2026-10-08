# The first hour: beat map

Version 2, 2026-10-06. Owner: the early-game plan (`/mnt/project-files/early-game/plan.md`). Any card that changes what a
player sees in minutes 0 to 60 updates this map in the same PR, or names the beat it serves. The nightly walk
(`tools/walk.mjs`, card `qa-first-hour-walk`) plays a fresh save against it; in week 1 its measured times replace the
estimated ones, and a beat more than 50% off its time becomes a finding.

**The hook** (the Compass, `docs/design/compass.md`, owns it). You carry the last lamp down a dark road, and every fight
is yours to win with a well-timed parry. Beat a boss for the first time and a Lantern Cache opens: what you won, a
chance at a new look, and the next stretch of road.

**Rules for every beat.**
- At most one new thing (a tab, a system, a currency) per beat, and at most 2 in any 3 minutes of the first 30
  (scorecard F4). The fight verbs (Attack, Dodge, the ability, Parry) are each taught the first time they come up, with
  the fight held until the player presses them (`cal-0107-staged-guide`), and are not counted as new things; a beat's
  "Learns" column still names one.
- A big moment at least every 5 minutes in the first 20, never a gap over 8; then one at every zone first clear from 5
  to 10 (F3, as amended in DECISIONS "Early game"). Moments: see the plan, section 1. Every zone
  Captain's first clear opens a Lantern Cache (`cache-core`), so those wins count as moments too.
- New things are announced between fights, never during a parry window (F5).
- **Never** (from Cal's play notes, 2026-10-07; every card that changes minutes 0 to 60 inherits these, and a card's own
  Never list adds to them):
  - Never a prompt for something the player cannot do: swap an ability with only one, "Tap to add" with nothing to add,
    spend points before the tab that spends them is open.
  - Never a line that does not match what happens next ("Wood first", then a fight).
  - Never let a foe act while a tip or a Hesketh line is on screen in a fight.
  - Never a popup or sheet with no way back to the fight.
  - Never a held line with no way on: it ends with the press it teaches or a Got it.
  - Never move the player somewhere they did not choose while Hesketh talks or right after (lighting the fire, then the
    fight).
  - Never a new tab, the first attribute points, the first Scroll or a second ability in the first hour without a line
    from Hesketh that names it.
  - Never a sentence fragment or a stage direction as Hesketh's speech ("Materials in, gear out", "Go on, press it").
  - `cal-0107-hesketh-voice` fixed the last one; `cal-0107-staged-guide` fixed the rest (Cal's notes 2, 3, 4, 10 and 12),
    held by tools/check.mjs "staged guide (browser)".
- Times are for the casual walk (follows Next Up, parries and dodges at a set rate). **est** = estimated, **meas** =
  measured by the walk.

**Status column.** `today` = the integration build already does this. `card` = the named card builds it.

**The unlock clock** belongs to `story-unlock-gates` and `unlock-gap-trial`. Every FEATURES rule stays, and `onboardCheck` opens at
most one queued feature per 90 s of un-paused play (`ONBOARD_TUNE.gap`, `55-onboard.js`; it was 60 s). A feature skips the queue
when the player's own act or a drop opened it: walking to gather, the fire lit (Camp), the Workbench built (Craft), the Tavern
built, the first Star, the first unique, the raid. Judge ruling (2026-10-07): F4 counts only what the governor releases; a thing a
player act or a drop opened is listed, not counted, because the game cannot space what the player does. The seeded walk (seed 1, 20 minutes, `walk.mjs`):
gap 60 releases 3 unlocks in 3 minutes (from 5:24: Next Up, away strip, Bounties) and fails F4; gap 90 releases at most 2 and
passes. At gap 90 the walk opens Hero 0:32, Gather 2:52, fire 3:19, Workbench 4:20, Next Up 6:07, away strip 7:45, Bounties
9:25 (Gather, the fire, the Workbench and the first Star and unique are the player's own acts). A cold human player was far slower: player B reached zone 5 at minute 25
(`/mnt/project-files/early-game/playtest-coldB.md`). The minutes below are targets for a casual human; the nightly walk replaces them.

| # | Min | On screen | Player does | Learns (one thing) | Earns, and how it lands | Should feel | Story or hero beat | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | 0:00 | Three stills, one line each; Skip. Text over the darkened Mossy Hollow background until `first-hour-art` passes | Taps through or skips | Why there is a lamp | nothing | curiosity | The lamp and the spiral; the last lamp goes out; you run with yours | built by `intro-and-picker`, `first-hour-art` |
| 2 | 0:25 | "Who are you?": Wren, Tobin, Pip in second person | Picks a hero | Who they are | their hero | ownership | "You are good at doors." | built by `intro-and-picker` |
| 3 | 0:35 | Hesketh's fire over still 3, at most 3 lines; then the guide panel with his face | Reads | A guide exists | nothing | warmth | Hesketh lights his fire from your lamp | built by `intro-and-picker`, `guide-panel` |
| 4 | 0:45 | Fight 1 (within 45 s of opening for a player who taps through), held on each new press: Attack on your first turn, then Dodge on the foe's first swing | Attack, then Dodge | Attack and Dodge | gold ticks up | power | | built: `cal-0107-staged-guide` (the foe's clock stops as the Dodge window opens; the line and the ringed button wait for the press); panel `guide-panel` |
| 5 | 0:55 | Fight 1, your next turn: the ability, held (no word about swapping, no "Tap to add" on the empty slots) | Presses the ability | The ability | | relief | | built: `cal-0107-staged-guide` |
| 6 | 1:05 | The foe's next swing (fight 1, or fight 2's first if the foe fell or was stunned) | Parries | Parry | Hit-stop on a good parry; PARRIED! stamp, sized numbers and a lamp row for clean parries (hit-feel, built) | skill | | built: `cal-0107-staged-guide` (all four done by the end of fight 2 for all three heroes); card `hit-feel` |
| 7 | 2:25 | Fights 4 and 5 | Uses all three verbs | nothing new | | flow | | today |
| 8 | 2:55 | The zone 1 Captain; Hesketh: "Watch the bar" (turn fight) or "Watch the red rings" (legacy) | Fights the boss | Boss strings | | tension | | built: `guide-voice` (the boss tip in Hesketh's voice); `cal-0107-staged-guide`: the tip may start as the boss opens, before its first move, and holds with Got it |
| 9 | 3:45 | **Big moment: first boss win**, and the **first Lantern Cache** reveals the win's drops plus the Ember Red lantern colour; the stage relights | Taps to open | Caches | the win's drops; Ember Red | surprise | The hero's first line | built: card `cache-core` (card "First boss down" lists the win's drops and Ember Red; the stage shift is faint, see `cache-lantern-read`); card `moment-layer`; `hero-voice` done (boss1 bark on the card) |
| 9a | when it happens | **Only if a zone boss beats you for the first time**: the Try again card shows what beat you; once it closes and the road is quiet, Hesketh adds one line: "No shame in that. The card showed what beat you, and each try shows one more of its moves." | Reads it; Try again or keeps fighting | Try again card | | understanding | Once per save. It waits behind any guide step, shows only between fights and holds the game with a Got it (`cal-0107-staged-guide`). | card `defeat-card-guide-tip` (`defeat` line in 75-onboard-ui SAY_MORE) |
| 10 | 1:10 | The Hero tab at the first level-up (level 2, the end of fight 2), with the first attribute points; Hesketh: "The Hero tab is open now. Open Hero and spend your new points." | Spends the points, then Back to the fight | Attributes | +4 points | ownership | | built: `cal-0107-staged-guide` (the tab opens on the level-up; the upgrade step carries the unlock line, so the tab is announced once; the level card says "4 attribute points to spend on the Hero tab."); moment `moment-layer` |
| 11 | 7:15 | The Gather tab; Hesketh: "You can gather now. Bring me Pine Log for a proper fire, and we'll talk once it's lit." Then "Tap Gather and chop some Pine Log for the fire." | Chops 8 logs | Gathering | logs | | | `story-unlock-gates`; built: `cal-0107-staged-guide` (the wood-then-talk promise moved here from the roadside fire; said once); `cal-0107-gear-and-rates`: every open node row says a minute and an hour |
| 12 | 9:00 | **Medium moment: the camp fire lit**; the Camp tab; Hesketh's talk plays at the grove, and you stay there gathering | Lights the fire, listens | Camp | a home | relief | "Every road needs a place to come back to." | built: `cal-0107-staged-guide` (no walk back to the fight; his next line is "Chop 12 Pine Log for the Workbench (0/12)."); cards `intro-and-picker`, `moment-layer` |
| 12a | 10:00 | **Big moment: the second cache**, from the zone 2 Captain's first clear, with a second lantern colour; the stage relights | Taps to open | nothing new | the win's drops plus a colour | surprise | | card `cache-core`, `moment-layer` |
| 13 | 10:45 | Next Up in the compact top bar | Reads Next Up | Next Up | | direction | | today: Next Up shares one line with Fight / Gather, zone arrows in the header (`top-bar-compact`); unlock time `story-unlock-gates` |
| 14 | 12:30 | The Workbench and the first tool: the first craft, with a **result card** showing its grade | Crafts the tool | Crafting | a tool, revealed | pride | | today (chain); `craft-delta`: a crafted tool that beats the worn one (or fills an empty slot) goes on by itself and the card says how much faster you gather ("Copper Pickaxe on. Mining is 33% faster."); `cal-0107-flow-bugs`'s guide tip to put it on stays as the fallback for a tool found in the bag with an empty slot (Equip on the tip and on the card, which closes once the piece is worn); result card built by `craft-reveal` (craft-reveal PR); `workbench-cost`: the Workbench costs 300 gold and 12 Pine Log (was 20 logs, no gold), the first gold a player spends; every hero holds 360 gold when zone 1 clears, so it never waits (walk, seeds 1-3: Workbench up at 2:45 to 3:45, numbers in `docs/coord/proposed/workbench-cost.md`); `cal-0107-gear-and-rates`: a tool you Keep waits in Hero, Gear (the new-item dot is on the Hero tab) |
| 14a | 14:00 | **Big moment: the zone 3 Captain's cache**, with a third lantern colour (opens automatically; a big card because it holds a look) | | nothing new | the win's drops plus a colour | delight | | card `cache-core`, `moment-layer` |
| 15 | 14:15 | The away chip joins the top bar | | Leaving pays only what you set going | | | | today: the always-on away sentence is gone; the away chip shows while gathering (`top-bar-compact`); show rule `story-unlock-gates` |
| 16 | 16:00 | Bounties (zone 4); Hesketh's board also at Camp; a ready bounty shows a Claim on Next Up | Claims in place | Bounties | gold or Essence | small win | | today (unlock); `bounties-anywhere` done: Next Up and the "Bounty ready" notice claim in place, board also at Camp; voiced by `unlock-voice` |
| 16a | 16:30 | **Medium moment: the zone 4 Captain's cache** (opens automatically, a banner) | | nothing new | the win's drops | | | card `cache-core`, `moment-layer` |
| 17 | 17:45 | **Big moment: the zone 5 Champion's first clear**, its post scene in the card; Tobin joins here unless you picked him | Can switch (if Tobin joined) | Switching, unless you picked Tobin | a hero, at the road's level (unless you picked Tobin) | company | Tobin's meet scene (bible 4.4) | cards `champion-moment`, `starters-join-when-met`; PR #58 for the level |
| 18 | 20:00 | **Big moment: first Star** (zone 6 Captain); the zone 6 cache opens inside the same card; the Stars tab | Equips the Star | Stars | a Star | power | | today (Star); cards `moment-layer` (Star is big), `cache-core` |
| 19 | 22:00 | The first Forge weapon (where the walk measures the cold chain ending, est. 20 to 25) | Crafts a weapon | | a weapon, revealed | pride | | today (guide steps `stock:weapon` and `weapon` follow the Forge step: gather, then Craft opens on the class weapon; `first-gold-and-camp-strip`); result card built by `craft-reveal` (craft-reveal PR); not measured to its end: the walk bot stalls at 2:16 on the base build (also seen before this card), so the end of the chain is unmeasured |
| 19a | 24:00 (est.) | The first refine, at the first upgrade: the Forge weapon's +1 takes 1 Copper Ingot, and Next Up says "Smelt 1 Copper Ingot for your Warblade +1" (Saw and a Pine Plank for Wren and Pip); with no coal it says "Mine Copper Ore to get coal" (coal comes with Copper Ore once the Forge is built) | Taps Go: the order goes on the Forge (Smelt on the Forge's card in Camp), the Ingot comes in 15 s, then the upgrade | Refining | the +1, from an Ingot | making | | `refine-queues` (55-refine.js, 75-refine-ui.js); not measured yet: the walk does not refine, so the time is an estimate |
| 20 | 25 to 40 | **Big moment: first unique**, by chance (15% on a first clear, with modifiers; no pity); the Uniques tab | Equips it | Uniques | the unique | delight | The hero's unique line | `hero-voice` done (unique bark on the card); card `cache-core` |
| 20a | 27:30 | **Big moment: the zone 7 Captain's cache**, with lantern colour 4 | | nothing new | the win's drops plus a colour | delight | | card `cache-core` |
| 21 | 28:00 | The Bestiary | Reads a foe | Foe types; the Foe tab now shows what you've learned | | curiosity | | `story-unlock-gates`; card `foe-weak-resists` |
| 22 | 31:30 | The Almanac | | | | | | `story-unlock-gates` |
| 22a | 35:00 | **Big moment: the zone 8 Captain's cache**, with colour 5 | | nothing new | the win's drops plus a colour | delight | | card `cache-core` |
| 23 | 35:00 | The Tavern | Meets the keeper | Hands | | company | | `story-unlock-gates` |
| 23a | 42:30 | **Big moment: the zone 9 Captain's cache**, with colour 6 | | nothing new | the win's drops plus a colour | delight | | card `cache-core` |
| 24 | 45:00 | A cache look and the Wardrobe count (only once `cache-art` passes) | Dresses the hero | Looks | a look | ownership | | card `cache-looks` |
| 25 | 50:00 | **Big moment: the zone 10 Champion's first clear**, its post scene in the card; Wren joins here unless you picked her | Can switch (if this is the first join) | Switching, only if you picked Tobin (nobody joined at zone 5); else nothing new | a hero (unless you picked Wren) | company | Wren's cave scene | cards `champion-moment`, `starters-join-when-met` |
| 25a | 51:30 | The Codex opens, at least 1:30 after the Champion card closes (a join counts as a new thing for the spacing governor) | Reads it | The Codex | | curiosity | | `story-unlock-gates` (Codex); card `starters-join-when-met` (the wait) |

## What this map does not decide

- Pip joins at the zone 15 Champion (past the first hour) unless you picked Pip.
- Numbers: gold, XP, Essence per cache, pity lengths. Those go through the economy and difficulty-budget gates.
- The World Raid (zone 12): the online layer is out of scope.
