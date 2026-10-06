# The first hour: beat map

Version 2, 2026-10-06. Owner: the early-game plan (`/mnt/project-files/early-game/plan.md`). Any card that changes what a
player sees in minutes 0 to 60 updates this map in the same PR, or names the beat it serves. The nightly walk
(`tools/walk.mjs`, card `qa-first-hour-walk`) plays a fresh save against it; in week 1 its measured times replace the
estimated ones, and a beat more than 50% off its time becomes a finding.

**The hook.** You carry the last lamp down a dark road, and every fight is yours to win with a well-timed parry. The
first time you beat each boss, a Lantern Cache opens, lights the next stretch of road, and gives your hero something
new to wear or wield.

**Rules for every beat.**
- At most one new thing (a tab, a system, a currency) per beat, and at most 2 in any 3 minutes of the first 30
  (scorecard F4). The three fight verbs (Attack with the ability, Dodge, Parry) are taught one per fight and are not
  counted as new things; a beat's "Learns" column still names one.
- A big moment at least every 5 minutes in the first 20, never a gap over 8; then one at every zone first clear from 5
  to 10 (F3, as amended in DECISIONS "Early game"). Moments: see the plan, section 1. Every zone
  Captain's first clear opens a Lantern Cache (`cache-core`), so those wins count as moments too.
- New things are announced between fights, never during a parry window (F5).
- Times are for the casual walk (follows Next Up, parries and dodges at a set rate). **est** = estimated, **meas** =
  measured by the walk.

**Status column.** `today` = the integration build already does this. `card` = the named card builds it.

**The unlock clock** belongs to `story-unlock-gates`. Every FEATURES rule stays, and `onboardCheck` opens at most one
queued feature per 60 s of un-paused play (`ONBOARD_TUNE.gap`, `55-onboard.js`). A feature skips the queue when the
player's own act or a drop opened it: walking to gather, the fire lit (Camp), the Workbench built (Craft), the Tavern
built, the first Star, the first unique, the raid. Its seeded cold walk opened, after the first boss: Hero 0:32,
Gather 1:32, fire 1:54, Next Up 2:55, away strip 3:55, Bounties 4:56, Almanac 7:00, Forage 8:11, Bestiary 9:11, Stars
10:06, Uniques 12:01. That bot walk breaks F4 (Hero, Gather and the fire inside 1:22): a 60 s gap lets 3 new things
land in 2 minutes, and F4 needs about 90 s between them, so the times below space new things at least 1:30 apart and
card `unlock-gap-trial` takes the gap to a judge (the fire's 150 s bound and "a player's act never waits" stand). A cold human player was far slower: player B reached zone 5 at minute 25 (`/mnt/project-files/
early-game/playtest-coldB.md`). The minutes below are targets for a casual human; the nightly walk replaces them.

| # | Min | On screen | Player does | Learns (one thing) | Earns, and how it lands | Should feel | Story or hero beat | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | 0:00 | Three stills, one line each; Skip. Text over the darkened Mossy Hollow background until `first-hour-art` passes | Taps through or skips | Why there is a lamp | nothing | curiosity | The lamp and the spiral; the last lamp goes out; you run with yours | built by `intro-and-picker`, `first-hour-art` |
| 2 | 0:25 | "Who are you?": Wren, Tobin, Pip in second person | Picks a hero | Who they are | their hero | ownership | "You are good at doors." | built by `intro-and-picker` |
| 3 | 0:35 | Hesketh's fire over still 3, at most 3 lines; then the guide panel with his face | Reads | A guide exists | nothing | warmth | Hesketh lights his fire from your lamp | built by `intro-and-picker`, `guide-panel` |
| 4 | 0:45 | Fight 1 (within 45 s of opening for a player who taps through) | Attack, then the ability | Attack and the ability | gold ticks up | power | | today (tip placement and phase: cards) |
| 5 | 1:25 | Fight 2 | Dodges a heavy hit | Dodge | | relief | | today (phase guard: `story-unlock-gates` or `guide-phase-guards`) |
| 6 | 1:55 | Fight 3 | Parries a heavy hit | Parry | PERFECT and hit-stop on a good parry (today); the parry stamp and lamp row (card) | skill | | today; card `hit-feel` |
| 7 | 2:25 | Fights 4 and 5 | Uses all three verbs | nothing new | | flow | | today |
| 8 | 2:55 | The zone 1 Captain; Hesketh: "Watch the red rings" | Fights the boss | Boss strings | | tension | | today (line: card `guide-voice`) |
| 9 | 3:45 | **Big moment: first boss win**, and the **first Lantern Cache** reveals the win's drops plus the Ember Red lantern colour; the stage relights | Taps to open | Caches | the win's drops; Ember Red | surprise | The hero's first line | card `moment-layer`, `cache-core`, `hero-voice` |
| 10 | 5:30 | The Hero tab (spacing governor), with the first attribute point | Spends the point | Attributes | +1 point | ownership | | `story-unlock-gates`; points from PR #58; moment `moment-layer` |
| 11 | 7:15 | The Gather tab; Hesketh: "Wood first." | Chops 8 logs | Gathering | logs | | | `story-unlock-gates`; line `unlock-voice` |
| 12 | 9:00 | **Medium moment: the camp fire lit**; the Camp tab; Hesketh's talk plays here | Lights the fire, listens | Camp | a home | relief | "Every road needs a place to come back to." | today (fire); cards `intro-and-picker` (talk moves here), `moment-layer` |
| 12a | 10:00 | **Big moment: the second cache**, from the zone 2 Captain's first clear, with a second lantern colour; the stage relights | Taps to open | nothing new | the win's drops plus a colour | surprise | | card `cache-core`, `moment-layer` |
| 13 | 10:45 | Next Up in the compact top bar | Reads Next Up | Next Up | | direction | | today: Next Up shares one line with Fight / Gather, zone arrows in the header (`top-bar-compact`); unlock time `story-unlock-gates` |
| 14 | 12:30 | The Workbench and the first tool: the first craft, with a **result card** showing its grade | Crafts the tool | Crafting | a tool, revealed | pride | | today (chain); card `craft-reveal` |
| 14a | 14:00 | **Big moment: the zone 3 Captain's cache**, with a third lantern colour (opens automatically; a big card because it holds a look) | | nothing new | the win's drops plus a colour | delight | | card `cache-core`, `moment-layer` |
| 15 | 14:15 | The away chip joins the top bar | | Leaving pays only what you set going | | | | today: the always-on away sentence is gone; the away chip shows while gathering (`top-bar-compact`); show rule `story-unlock-gates` |
| 16 | 16:00 | Bounties (zone 4); Hesketh's board also at Camp; a ready bounty shows a Claim on Next Up | Claims in place | Bounties | gold or Essence | small win | | today (unlock); card `bounties-anywhere` |
| 16a | 16:30 | **Medium moment: the zone 4 Captain's cache** (opens automatically, a banner) | | nothing new | the win's drops | | | card `cache-core`, `moment-layer` |
| 17 | 17:45 | **Big moment: the zone 5 Champion's first clear**, its post scene in the card; Tobin joins here unless you picked him | Can switch (if Tobin joined) | Switching | a hero, at the road's level (unless you picked Tobin) | company | Tobin's meet scene (bible 4.4) | card `starters-join-when-met`, `moment-layer`; PR #58 for the level |
| 18 | 20:00 | **Big moment: first Star** (zone 6 Captain); the zone 6 cache opens inside the same card; the Stars tab | Equips the Star | Stars | a Star | power | | today (Star); cards `moment-layer` (Star is big), `cache-core` |
| 19 | 22:00 | The first Forge weapon (where the walk measures the cold chain ending, est. 20 to 25) | Crafts a weapon | | a weapon, revealed | pride | | today; card `craft-reveal` |
| 20 | 25 to 40 | **Big moment: first unique**, by chance (15% on a first clear, with modifiers; no pity); the Uniques tab | Equips it | Uniques | the unique | delight | The hero's unique line | today (drop); cards `moment-layer`, `cache-core`, `hero-voice` |
| 20a | 27:30 | **Big moment: the zone 7 Captain's cache**, with lantern colour 4 | | nothing new | the win's drops plus a colour | delight | | card `cache-core` |
| 21 | 28:00 | The Bestiary | Reads a foe | Foe types; the Foe tab now shows what you've learned | | curiosity | | `story-unlock-gates`; card `foe-weak-resists` |
| 22 | 31:30 | The Almanac | | | | | | `story-unlock-gates` |
| 22a | 35:00 | **Big moment: the zone 8 Captain's cache**, with colour 5 | | nothing new | the win's drops plus a colour | delight | | card `cache-core` |
| 23 | 35:00 | The Tavern | Meets the keeper | Hands | | company | | `story-unlock-gates` |
| 23a | 42:30 | **Big moment: the zone 9 Captain's cache**, with colour 6 | | nothing new | the win's drops plus a colour | delight | | card `cache-core` |
| 24 | 45:00 | A cache look and the Wardrobe count (only once `cache-art` passes) | Dresses the hero | Looks | a look | ownership | | card `cache-looks` |
| 25 | 50:00 | **Big moment: the zone 10 Champion's first clear**; Wren joins here unless you picked her; the Codex | | The Codex | a hero (unless you picked Wren) | company | Wren's cave scene | card `starters-join-when-met`, `moment-layer`; `story-unlock-gates` (Codex) |

## What this map does not decide

- Pip joins at the zone 15 Champion (past the first hour) unless you picked Pip.
- Numbers: gold, XP, Essence per cache, pity lengths. Those go through the economy and difficulty-budget gates.
- The World Raid (zone 12): the online layer is out of scope.
