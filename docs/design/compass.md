# The Compass

Version 2, 2026-10-07 (Opus judge rulings applied). Owner: Claude (Cal, 2026-10-05: he does not want ownership of these
calls; he can comment or veto any line, nothing waits for him). The four core pieces below were confirmed by Cal on
2026-10-06 (project memory; the rulings are now in DECISIONS). Rulings behind it: `docs/DECISIONS.md`, "Compass: judge
rulings (2026-10-07)", with the red-team and judge records in `docs/design/compass-records/`.

Every card, idea and review is scored against this page. It is short on purpose. Read it, then say which step of the
loop or which part of the hook your work serves. If the answer is "none", the work needs a strong reason or it waits.

## 1. The hook

**You carry the last lamp down a dark road, and every fight is yours to win with a well-timed parry.**
**Beat a boss for the first time and a Lantern Cache opens: what you won, a chance at a new look, and the next stretch
of road.**

Every word of it must be true at every first boss clear: the cache shows the win's drops, rolls a look with its odds
printed, and the next zone opens. The stage itself relights only at zones 1 to 3 and 7 to 9 for now, so no text may
promise a relight at every boss. `first-hour.md` carries the same hook and changes with this page.

The promise behind the hook, which brings a player back: your camp keeps gathering while you are away, up to its
Storehouse and away cap, so every return brings something to build.

Why a player picks this over Melvor Idle or Idle Slayer (counts from `docs/design/fun-library.md`):
- Melvor Idle is loved for depth (P5, 24 positive reviews), fair money (P3, 17) and active play (P4, 27), and it is the top
  game for bloated menus and a confusing start (Q8 9, Q10 13). Lanternfall aims for the same depth with one new thing at a
  time, and makes the fight itself the active part.
- Idle Slayer is loved for blending idle with active play (P4, 25) and for respecting your time (P2, 14). It is among the
  top games for an empty or repetitive endgame (Q5, 9 negatives), and a 454-hour review says it takes "actual years of
  active time" to reach the end. In Lanternfall a boss win opens a new stretch of road and a new look, not only a bigger
  number.
- Our bet, not yet measured by the library: a timed parry decides each boss (no principle backs this; Expedition 33 is
  only a reference), and a story-shaped road (P10, medium confidence; P9, low) carries the grind. The first-hour walk and
  Cal's playtests are the test of it.

The measure of the hook is the first hour (`docs/design/first-hour.md`): first fight within 45 s, a big moment at least
every 5 minutes in the first 20, one new thing at a time.

## 2. What a session should feel like

- You open the game and something is ready within 10 seconds (a camp pile, a Next Up goal, a boss you can try).
- A fight is tense and fair. When you lose, you know what you did wrong.
- You leave knowing what you will do next time and holding something you did not have before.
- You never feel buried: one new thing at a time, few named currencies, and a camp visit that takes a few taps (the
  ceilings are in section 6, "Overwhelm").
- Leaving costs you nothing you earned, and the game never forces you back. The camp fills up to its Storehouse and away
  cap; Hands work the shifts you paid for.

## 3. The core loop, at four timescales

The four core pieces (Cal, confirmed 2026-10-06): hand-played fights, a camp that works while away, building your own
hero, and pushing light down a dark road. Each loop step names the systems that serve it. Cards name their step in
`Loop step:` (for example "5-minute visit, step 3").

| Timescale | Steps | Systems that serve it |
|---|---|---|
| **One fight** (about 30 s for a zone foe, longer for a boss; no timer) | 1. Watch the foe strike: its wind-up and the timing bar set your press. Nothing tells you its next move; you learn its moves by fighting it. 2. Attack or use an ability. 3. Defend each hit: parry (harder; blocks and takes a turn off every cooldown) or dodge (easier; only avoids). Assist may widen the windows; it never plays for you. 4. Win and see what drops, or lose, keep your place, and know why. | Turn combat, foe moves by type, parry/dodge windows, abilities and cooldowns, hit feel, fight HUD, the Foe tab, drops |
| **A 5-minute visit** | 1. Open: collect what the camp made. 2. Fight a zone's five foes, then try the boss. 3. Spend what you won: craft, upgrade, equip, spend a point. 4. Set the camp working and leave. | Camp piles, the Storehouse and away cap, Hands and shift fees, away report, Next Up, zone progress, Forge and Armoury, Bounties, Lantern Caches on a first boss clear |
| **A day** | 1. Push the road a few zones. 2. Beat a boss that beat you: gear up, change the build, or learn its moves. 3. Fill a collection, or finish a bounty or a Contract. 4. Leave the camp on a long job. | Zones and Captains, hero level and attribute points, Scrolls, abilities and talents, Stars, crafting grades, Bestiary and Almanac, Tavern Contracts, the away return |
| **A week** | 1. Reach a new area, region or story chapter (a Champion, an Elder, a Proving). 2. Take a different hero down the road, Ascend one, or try a new build. 3. Chase a unique, a Deed or a look. 4. Go deeper: the Deepwell, and later challenge modes. | Regions, Champions and Elders, story, the hero roster (a new hero joins at the road's level), Provings and evolutions, uniques, Deeds and titles, cache looks and the Wardrobe, the Deepwell |

Updates add new content (P7), but no loop step depends on one, and nothing in the loop is a streak or a daily duty.

The loop is closed on purpose: fights give gold, Essence, XP, Scrolls and drops; the camp gives ore, wood and hide; gold
runs the camp, and materials and Essence feed the Forge; gear and the hero build win harder fights; harder fights open
the road and the looks. A new resource that feeds neither a fight nor a build breaks the loop. Looks, story and
collections are what the loop pays out, not resources: they serve pillar 3 or 4 and the week's steps.

## 4. Pillars

1. **Every fight is hand-played.** No Auto, no idle fighting, no away combat earnings, no telegraph of the foe's next
   move. Assist only widens the timing windows; it never plays for you. (DECISIONS: Combat is active only; Combat.)
2. **The camp works while you are away, and the return feels good.** Gathering is idle, up to the Storehouse and away cap;
   the away report is clear.
3. **You build your own hero.** Level, attributes, Stars, abilities, gear, evolutions. 32 heroes for 1.0, each shipped
   complete. A design that needs new authored content for every hero costs 32 times over: it says so, and scores Cost by
   it. Hero voice stays with the three starters.
4. **The road pushes light into the dark.** Zones advance only on a win; every first boss clear opens something.
5. **Fair money.** The Lantern Rules (DECISIONS: Money) apply to every price, currency, timer and gate.
6. **Gradual depth.** One new thing at a time; every system explained once, briefly, at the right moment.

| Pillar | Fun-library principles | Coverage-map areas |
|---|---|---|
| 1 Hand-played fights | P4 active play (it answers Q6, "plays itself") | 6 combat feel, 14 heroes and build variety |
| 2 Camp and away | P1 away progress, P14 always something to do, P13 calm, low pressure | 2 session shape, 3 goals at three ranges, 13 away and return, 9 side content |
| 3 Your hero | P5 depth, P15 systems feed each other, P6 collections | 5 meaningful choices, 10 skills, 12 collection, 14 heroes |
| 4 The road | P9 steady unlocks, P10 world carries the grind (P8 prestige does not apply: no resets) | 7 progression, 15 world and story, 21 retention |
| 5 Fair money | P2 (we go further: no ads of any kind), P3 fair money | 8 economy (monetisation area is gated) |
| 6 Gradual depth | P5, P12 readable UI | 4 overwhelm, 11 menus, 16 onboarding, 1 first 10 minutes, 17 accessibility |

## 5. Goals at three ranges

- **Minutes:** a next goal is on screen at all times (Next Up), and a small reward lands at least every few minutes.
- **Hours:** a visible goal for the session: the next zone, boss or craft. On the casual walk, no gap over 8 minutes
  between big moments up to the zone 10 Champion (F3, measured by the nightly walk).
- **Days to weeks:** a collection, a hero to build, a region to reach, a look to earn. Every month-two player has a reason
  to return that is not a chore (coverage area 21).

## 6. Anti-goals

A card that does any of these needs a strong reason, recorded in the PR.

- **Walls:** a fight or zone the player cannot beat with any build they can reach, or can only pass by waiting. (Q2: the top
  reason committed players leave.) A boss that needs better gear or better play is not a wall.
- **Chores:** a reward that expires, or a lead that shrinks, when you miss a day or a timer; a daily task you must do to
  keep up. A shift fee you pay when you choose to set Hands working is not a chore. (Q11, Q7.)
- **Dominant choices:** one gear, ability or hero always wins. (Q9; sims check it.)
- **Overwhelm:** a second new thing in one beat (the first-hour rules); any new named currency (ceiling 8 core counters,
  which "Counters and layers" in DECISIONS has now met; new work reads as one of them or goes in the Rare finds row); or a tap added to the camp tour (ceiling 3; about
  6 to 10 today). Both ceilings are the why-review's (2026-10-06, "The ceiling"). (Q8, Q10.)
- **Dark patterns:** anything any of the ten Lantern Rules forbids. The usual misses: selling power, chance or anything
  random; friction built to sell its removal; an offer that interrupts; selling a core convenience (Repeat, Assist,
  accessibility); taking back anything earned or bought.
- **Settled no's:** anything DECISIONS lists as rejected or banned: prestige or resets; Auto, idle or away combat; a
  telegraph of the foe's next move (no intent icons); suggested builds or combos; healing between fights; a party,
  formation or companions; ads of any kind; selling heroes, caches or keys; pay-to-win; art outside a vetted Codex pack
  (the art freeze).
- **Silent loss:** any change that could lose or reshape a save. Old saves load; nothing earned is lost. (Q1.)
- **Broken promises:** text, a marker or an icon that promises something the game does not deliver.

## 7. Scoring guide (for the idea gate's judge)

Score each axis 1 to 5 from the table. Where a cell says "between", the card sits between its neighbours; one anchor is
enough to place a card. Then add two sums:

- **Value** = Impact + Evidence + Compass fit (3 to 15).
- **Total** = Value + Cost + Reversibility (5 to 25).

A card goes ahead when **Compass fit is at least 3, Value is at least 9, Total is at least 14, and no anti-goal is hit**.
A card that fixes a bug or a broken promise skips scoring. A card that builds something DECISIONS already commits to is
not asked whether: it is scored to choose its shape and its place in the queue, and must still hit no anti-goal.

| Axis | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| **Impact** | A few players, barely noticed | between | Noticed by most players in one area | between | Changes the first hour, the 5-minute visit or the weekly return for most players |
| **Evidence confidence** | Training-data lore only | A low-confidence principle (P9, P14, P15) or one reference game | A medium- or high-confidence fun-library principle | A measurement on our game (sim, walk, health, perf) | Cal's playtest, or a replayed measurement that failed |
| **Compass fit** | No loop step or pillar, or a new resource that feeds neither a fight nor a build | between | Serves one step of the loop | between | Closes a loop step (a gap in it now works end to end), or fixes a miss against pillars 1 to 4 |
| **Cost** (5 = cheap) | Many files or hot files, or needs a Codex art pack | between | A system on one or two hot files | between | Docs, copy, or one small change |
| **Reversibility** (5 = easy) | Save shape, money, a public promise | between | Flag-guarded, old behaviour kept | between | A single revert |

A save change is scored once, under Reversibility, not again under Cost.

What the thresholds do (worked checks):
- A cheap tweak few players notice, on lore (Impact 2, Evidence 1, Fit 3, Cost 5, Rev 5): Value 6, waits.
- A big, well-backed system with a save change (5, 3, 5, 1, 1): Value 13, Total 15, goes ahead. With Fit at least 3, Value 12
  or more always goes ahead, whatever it costs.
- A middling idea with a save change (3, 3, 3, 1, 1): Value 9, Total 11, waits until it is cheaper or better backed.
- A cheap change backed by a principle (3, 3, 3, 5, 5): Value 9, Total 19, goes ahead.

Tie-breakers: the early game first (the early-game milestone gates the store); evidence beats opinion; the cheaper step
wins when two cards serve the same loop step.

## 8. How to use this page

- Every card states `Loop step:` and the pillar it serves. A card with neither is sent back.
- A review quotes the line of this page it relies on (a pillar, an anti-goal, an axis score).
- This page changes only through the Opus judge, with the change recorded in `docs/DECISIONS.md`. The first-hour beat
  map, the coverage map and the Lantern Rules stay the detailed rules; this page does not copy them.
- Refresh with the fun library (monthly drift review) and whenever a playtest shows a pillar is wrong.
