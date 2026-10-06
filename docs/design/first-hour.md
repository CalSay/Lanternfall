# The first hour: beat map

Version 1, 2026-10-06. Owner: the early-game plan (`/mnt/project-files/early-game/plan.md`). Any card that changes what a
player sees in minutes 0 to 60 updates this map in the same PR, or names the beat it serves. The nightly walk
(`tools/walk.mjs`, card `qa-first-hour-walk`) plays a fresh save against it; in week 1 its measured times replace the
estimated ones, and a beat more than 50% off its time becomes a finding.

**The hook.** You carry the last lamp down a dark road, and every fight is yours to win with a well-timed parry. Every
boss you beat opens a Lantern Cache, lights the next stretch of road, and gives your hero something new to wear or wield.

**Rules for every beat.**
- At most one new thing (a tab, a system, a currency, a verb) per beat, and at most 2 in any 3 minutes of the first 30
  (scorecard F4).
- A big moment at least every 5 minutes, never a gap over 8 (F3). Moments: see the plan, section 1.
- New things are announced between fights, never during a parry window (F5).
- Times are for the casual walk (follows Next Up, parries and dodges at a set rate). **est** = estimated, **meas** =
  measured by the walk.

**Status column.** `today` = the build at `eb7f732` already does this. `card` = the named card builds it.

| # | Min | On screen | Player does | Learns (one thing) | Earns, and how it lands | Should feel | Story or hero beat | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | 0:00 | Four drawn stills, one line each; Skip | Taps through (or skips) | Why there is a lamp | nothing | curiosity | The village, the last lamp out, the dark, the run | card `intro-and-picker`, `first-hour-art` |
| 2 | 0:40 | "Who are you?": Wren, Tobin, Pip in second person | Picks a hero | Who they are | their hero | ownership | "You are Tobin Reed. You never run first." | card `intro-and-picker` |
| 3 | 0:50 | Hesketh's fire; the guide panel with his face | Reads one line | A guide exists | nothing | warmth | Hesketh lights his fire from your lamp | card `guide-panel`, `guide-voice` |
| 4 | 1:00 | Fight 1 | Attack, then the ability | Attack and the ability | gold ticks up (small) | power | | today (tip placement: card) |
| 5 | 1:40 | Fight 2 | Dodges a heavy hit | Dodge | | relief | | today (phase gating: card) |
| 6 | 2:10 | Fight 3 | Parries a heavy hit | Parry | a "PERFECT" stamp on a good parry | skill | | card `hit-feel` |
| 7 | 2:40 | Fights 4 and 5 | Uses all three verbs | nothing new | | flow | | today |
| 8 | 3:10 | The zone 1 Captain; Hesketh: "Watch the red rings" | Fights the boss | Boss strings | | tension | | today (line: card) |
| 9 | 4:00 | **Big moment: first boss win** and the **first Lantern Cache** | Taps to open | Caches | a flame colour; the stage relights in it; Essence | surprise | The hero's first bark | card `moment-layer`, `lantern-cache`, `looks-early`, `hero-voice` |
| 10 | 4:20 | **Medium moment: level up**; the Hero tab appears | Spends the first attribute point | Attributes | +1 point | ownership | | card `unlock-pace`; points from PR #58 |
| 11 | 6:00 | Zone 2; the Next Up line appears in the compact top bar | Reads Next Up | Next Up | | direction | Zone 2 line | card `unlock-pace` |
| 12 | 8:00 | Hesketh: "Wood first. Then we talk." The Gather tab appears | Chops 10 logs | Gathering | logs | | Hesketh's "wood first" pays off | card `unlock-pace` (today: 20 logs at zone 2) |
| 13 | 10:30 | **Medium moment: the camp fire lit**; the Camp tab appears | Lights the fire | Camp | a home | relief | "Every road needs a place to come back to." | today (moment: card) |
| 14 | 13:00 | First gold buys the first weapon at the Forge; the Craft tab | Crafts a weapon | Crafting | a weapon, with a **result card** showing its grade | pride | | card `first-gold-and-camp-strip`, `craft-reveal` |
| 15 | 16:00 | Hesketh's board at camp; a bounty to claim | Claims from the notice | Bounties | gold or Essence; a small moment | small win | | card `bounties-anywhere` |
| 16 | 18:00 | Zone 4 to 5 Captains, each a cache | Fights | nothing new | caches | anticipation | | card `lantern-cache` |
| 17 | 20:00 | **Medium moment: first Star** (zone 6 Captain); the Stars tab | Equips the Star | Stars | a Star | power | | today (moment, menu: cards) |
| 18 | 25:00 | **Big moment: first unique** (per-boss pity keeps it near here) | Equips it | Uniques and the trophy wall | the unique | delight | The hero's unique bark | card `moment-layer`, `lantern-cache` |
| 19 | 30:00 | The Bestiary | Reads a foe | Foe types | | curiosity | Bestiary lines | card `unlock-pace` (today: zone 6) |
| 20 | 35:00 | The Almanac | | | | | | card `unlock-pace` (today: 7 min or zone 7) |
| 21 | 40:00 | The Tavern | Meets the keeper | Hands | | company | | card `unlock-pace` (today: 14 min or zone 8) |
| 22 | 45:00 | A look found in a cache; the Wardrobe count | Dresses the hero | Looks | a look | ownership | | card `looks-early` |
| 23 | 50:00 | Zone 10 Captain; the Codex | | The Codex | a cache | | | today (zone 10) |
| 24 | 60:00 | A second hero met on the road (Chapter 1 area 1 to 2) | Can switch | Switching heroes | a hero, joining at the road's level | company | Tobin or Wren's first scene | PR #58, story canon 4.4 |

## What this map does not decide

- Numbers: gold, XP, Essence per cache, pity lengths. Those go through the economy and difficulty-budget gates.
- The World Raid (zone 12): the online layer is out of scope.
