# z21-foe-climb: why the 10-hour bot stalls on zone 21-24 ordinary foes

Card: `autopilot/cards/z21-foe-climb.md`. Base: integration branch at bf3dd77b (after z20-wall, #244). Runs: `tools/health.mjs`
optimiser (10 h, seeds 31-35) and `--long` (50 h, seeds 41-45), five offsets each; budget rows at 120-240 fights.

## Step 1: which part is wrong

### The bot (found, and fixed in this card)

`tools/sim.mjs` `turnPlayer` keyed its one input a turn on `phase:n`. A foe move of several hits stays in turn `n`
(`59k-turn.js` `turnContact`: `m.hitI++` then `turnHitStart`, phase still `foeWindup`), so the bot defended a move's first hit
and stood still for every later one. The game lets a player parry or dodge each hit (`!m.usedDefense` is per hit), and the
budget's sampler (`turnCombatSample`) re-plans each hit. `docs/design/health.md` says the persona parries about 60% of hits and
dodges most of the rest; it did that for first hits only.

The size of it, on the bot's own save (Tobin at 300 min, zone 22, level 25), normal foes in chains of 5:

| | sampler at the bot's own defence (parry 48%, dodge 62% of the rest, no rings) | the live bot, minutes 259-600 |
|---|---|---|
| zone 22 | 43% of foes won | 3 kills, 279 falls (about 1%) |

The fix keys the input on the hit too (`phase:n:hit`).

### The game (a real gap, too big for this card)

- The ordinary foes from zone 19 are scaled to the reference hero (`TURN_TUNE.refHpX`, `refAtk`), the hero who keeps up:
  the zone's tier 4 rare +5 (+ the crafted set) at the road's level (29-32 at zones 21-24).
- A 10-hour player cannot have that. Tier 4 nodes need gathering 64 and tier 4 crafts a station at 36 (`SKILL_TUNE`);
  the bot's gathering skills are 22-24 at hour 10. Its worn tier has been 2.37-2.47 at hour 10 in every health baseline
  since f-health (`git log docs/design/health-baseline.json`). The 50-hour run reaches 3.9 by hour 50.
- Its level stays 24-26 for hours: from level 25 a level takes 390 fights (`HERO_TUNE.fights`); most hero XP comes from away
  time, and the optimiser has none.
- So from zone 19 a foe grows about x1.45 a zone against a hero who barely grows. On the bot's saves the hero's max HP is
  0.36, 0.23, 0.15, 0.10, 0.07, 0.05 of the reference HP at zones 18-23 (Tobin), and lower for Wren and Pip (0.02-0.03 at
  zones 21-22 when the fixed bot gets there sooner, on poorer gear). A landed hit is 0.14 of the reference HP.

### The knots (tested; they move the wall)

A cap on an ordinary foe's landed hit at zones 21-24 (0.25 of the hero's max HP, before armour; DoT ticks 0.07), on top of the
bot fix: the bots pass 21-24 sooner and meet zone 25 (its ordinary foes and the Champion) earlier, where they sit 4-6 hours.
A normHitX ladder (0.48/0.33/0.23/0.16 at 21-24) left Wren and Pip dying at zone 22 (their HP is 2-3% of the reference there).

## The numbers (optimiser, 10 h, five offsets)

| | before (base) | bot fix | bot fix + 0.25 hit cap at 21-24 | bot fix + trick read (landed) |
|---|---|---|---|---|
| stallCount (mean, sd) | 7.33, 0.87 | 8.00, 0.60 | 8.06, 0.74 | 7.20, 0.62 |
| longestStallSec (mean) | 15,637 | 11,619 | 14,002 | 12,568 |
| runs with a stall over 4 h (of 15) | 7 | 0 | 5 (all at zone 25) | 3 (zones 23-24: 4.0, 4.5, 5.3 h) |
| runs with a 3 h+ stall at zones 21-24 (of 15) | 12 | 9 (3.0-3.8 h) | 4 | 9 (3.0-5.3 h) |
| longest stall, offset 0 (w/t/p, min) | 233 / 341 / 178 | 210 / 181 / 204 | 286 / 212 / 225 | 225 / 241 / 220 |
| zoneEnd | 22.67 | 24.67 | 25.00 | 24.67 |
| zoneAt1h | 14.86 | 16.00 | 16.00 | 16.33 |
| wipesPerHour | 79.67 | 49.67 | 35.59 | 51.28 |
| gearTierMean | 2.47 | 2.47 | 2.49 | 2.49 |

The sd is the population sd over the five offsets (the band uses the sample sd: 0.69 for the landed column, so abs 2.1).

### The trick read (from the PR review)

Pressing every hit made the bot meet every boss feint (`24d-data-turnfoes.js`, feints from zone 7 at a move's third hit or
later), and a press at a feint costs the next hit's defence. Before the fix the bot never pressed a later hit, so feints never
touched it. The bot now reads a feint or a held swing as `turnCombatSample` and `walk.mjs` do: with chance 0.3 + 0.6 x its
avoidance (0.78) it leaves a feint alone or times a held hit as usual; else it presses as the swing would have landed. The
landed column is this bot. It costs the bot a little at zones 23-24 (three runs over 4 h), where its boss fights now play
the tricks a player meets.

With the fix the bot also stops stalling at zones 17-19 (Pip's 2.2-3 h at 17-18 and the zone 19 stalls of the watch items are gone).

Other personas with the fix (five offsets): active zoneEnd 15.2 to 16.73 (the active bot passes zone 13-17 sooner), first
boss unchanged (68 s), casual unchanged (zoneEnd 13.0 against 12.67). With the trick read too: active zoneEnd 16.33, casual
12.33, first boss 68 s.

## The 50-hour run

The bot fix only (before the trick read), against the old baseline: zoneEnd 28.56 to 30.47, zoneAt10h 22.11 to 24.67, longest
stall 64,208 to 56,806 s, gear tier 3.91. The "before" numbers are the old baseline's three-offset means and the "after" ones
are five-offset means (the same three offsets read 30.44, 24.56 and 52,540 s). 13 stalls of 3 h or more at zones 21-24 (3.2-6.1 h)
across the 15 runs; the long wall is still zone 25 (11-16 h).

The baseline (three offsets, as `--long --write-baseline` averages; the landed bot): zoneEnd 30.44 to 30.67, zoneAt10h 24.56,
longest stall 52,540 to 50,219 s, stalls over 3 h 5.22. Offset 0 has three stalls of 3 h or more at zones 21-24 (Wren 23: 4.4 h,
Pip 21: 3.8 h and 24: 3.5 h); the long wall is zone 25 (Tobin 16.2 h, Pip 17.1 h).

## Rows at the bot's footing (`tools/budget.mjs`, report kind `reportBot`)

Arrival level + 2 (level 25 at zones 20-22, 26 at 23-24; the bot's own level is 24-26), tier 2 rare +5, no set, arrival mastery. casual / good / the bot's own defence (w/t/p):

| row | casual | good | optimiser bot |
|---|---|---|---|
| z20-normal-bot | 24/96/18 | 88/100/95 | 53/99/52 |
| z21-normal-bot | 11/70/1 | 87/100/87 | 32/96/29 |
| z22-normal-bot | 4/35/3 | 74/99/78 | 21/68/13 |
| z23-normal-bot | 0/31/0 | 67/100/60 | 6/59/0 |
| z24-normal-bot | 0/2/0 | 47/94/34 | 0/23/0 |

The kept-up rows (zone tier 4 rare +5, road level) read 98-100 at the same zones.
