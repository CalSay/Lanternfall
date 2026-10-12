# Zones 4-6 foe curve (card zone-4-6-foe-curve)

Origin: zone-1-3-foe-curve's judge (2026-10-11). After zones 1-3 moved onto the hero who arrives there, zone 4 stepped back to the old
numbers: foe pay 71 to 41, boss pay 356 to 219, a landed foe move about 18% to 8% of the hero's health, and zone 4-6 foes kept the
8-Attack early floor that grows with the hero (every fight about 3.6 to 5 turns, at any level). The zone 4 boss had 4.1K HP, under half
its own foes (10.2K). The zone 1-2 bosses' Venom and Bleed ticked on the level 1 reference HP, lighter than their direct hits.

## The rule (59k `TURN_TUNE.early`, 24d `TURN_EARLY_FOE_HITS`)

The zone 1-3 rule carries on to zone 6 (`early.to`): a zone 2-6 foe's HP is the zone's, pay rises from zone 3's, and the early floor is
3 plain Attacks everywhere. Zones 7+ are exactly as before.

| | zone 3 | zone 4 | zone 5 | zone 6 | zone 7 |
|---|---|---|---|---|---|
| foe HP (`early.hpX`, x the reference) | 5.2 | 4.2 (was 1) | 4 (was 1) | 2.5 (was 1) | 1 (no early tables) |
| early floor, plain Attacks of the hero (`TURN_EARLY_FOE_HITS`) | 3 | 3 (was 8) | 3 (was 8) | 3 (was 8) | none |
| boss HP (`early.bossHpX`) | 2.4 | 1.9 (was 1) | 1 | 1 | 1 |
| foe hits (`normHitX`) | 3.5 | 2.3 (was 0.94) | 3 (was 0.88) | 1.15 (was 0.82) | 0.76 (as before) |
| boss hit floor, a share of the hero's health (`boss.hpFloor`) | 0.9 | 1.0 (was 0.15) | 0.93 | 0.85 | 1.03 |
| gold (`early.payX`; XP as before) | 1.8 | 1.75 | 1.7 | 1.65 | 1 |

- **Zone 4's boss** stays under the zone 5 Champion: the boss-tiers check wants the Champion's HP at 1.5x zone 4's or more in reference
  Attacks, so zone 4's boss HP is x1.9 (7.8K), and zone 4's foes x4.2 (7.2K) sit under it. The zone 5 Champion and the zone 6 Captain
  keep their HP and hits (gated budget rows); only their pay moves.
- **Pay** rises a little each zone (foes 72, 73, 74; bosses 383, 409, 435), the least that still rises from zone 3's 71 and 356. A bigger
  rise (x1.85 to x1.95) paid a zone 6 foe nearly double a zone 9 foe and pushed the casual bots further (below).
- **Zone 1-3 boss riders** (`turnDotTick`): a Venom, Bleed or Burn tick from a zone 1-3 boss is a share of the hero's health x hpFloor,
  the footing its hits use (zone 1 Venom 0.6% to 1.4% of Wren's health a tick; zone 2 Bleed 0.5% to 1.6%). Zone 4+ ticks as before.

## The curve, before and after

Scratch fights (59k `turnCombatSample`, 120 fights a row, each from full health on its own seed), each hero at the level the walk meets
the fight with (zone 4 at 8, its boss at 9, zone 5 at 10, its Champion at 11, zone 6 at 11, its boss at 12), attribute points spread,
signature move only; zone 3 in the starter kit, zone 3's boss at 8 and zones 4+ with a tier 1 common weapon (what the walk wears). casual:
parries 25%, dodges 50% of the rest; never-defends: no Parry or Dodge. "plain Attacks" is HP over one plain Attack after the foe's armour
(a Rattlebones has 0.3). "HP lost" is per fight, from full health.

| Zone, fight, level | Hero | HP before > after | plain Attacks | gold | casual turns | casual HP lost | never-defends HP lost (win) |
|---|---|---|---|---|---|---|---|
| z3 foe L6 | wren | 4860 > 4860 | 9.75 > 9.75 | 71 > 71 | 5.61 > 5.61 | 30% > 30% | 93% (33%) > 93% (33%) |
| z3 foe L6 | tobin | 4860 > 4860 | 9.07 > 9.07 | 71 > 71 | 6.19 > 6.19 | 4% > 4% | 15% (100%) > 15% (100%) |
| z3 foe L6 | pip | 4860 > 4860 | 8.63 > 8.63 | 71 > 71 | 4.38 > 4.38 | 19% > 19% | 67% (100%) > 67% (100%) |
| z3 foe L7 | wren | 4860 > 4860 | 7.22 > 7.22 | 71 > 71 | 4.51 > 4.51 | 16% > 16% | 58% (100%) > 58% (100%) |
| z3 foe L7 | tobin | 4860 > 4860 | 6.71 > 6.71 | 71 > 71 | 4.88 > 4.88 | 2% > 2% | 8% (100%) > 8% (100%) |
| z3 foe L7 | pip | 4860 > 4860 | 6.39 > 6.39 | 71 > 71 | 3.23 > 3.23 | 10% > 10% | 27% (100%) > 27% (100%) |
| z3 boss L7 | wren | 6481 > 6481 | 9.62 > 9.62 | 356 > 356 | 4.67 > 4.67 | 22% > 22% | 76% (78%) > 76% (78%) |
| z3 boss L7 | tobin | 6481 > 6481 | 8.95 > 8.95 | 356 > 356 | 4.91 > 4.91 | 10% > 10% | 36% (100%) > 36% (100%) |
| z3 boss L7 | pip | 6481 > 6481 | 8.52 > 8.52 | 356 > 356 | 3.63 > 3.63 | 19% > 19% | 54% (100%) > 54% (100%) |
| z3 boss L8 | wren | 6481 > 6481 | 7.29 > 7.29 | 356 > 356 | 3.65 > 3.65 | 18% > 18% | 57% (100%) > 57% (100%) |
| z3 boss L8 | tobin | 6481 > 6481 | 6.78 > 6.78 | 356 > 356 | 3.69 > 3.69 | 8% > 8% | 29% (100%) > 29% (100%) |
| z3 boss L8 | pip | 6481 > 6481 | 6.45 > 6.45 | 356 > 356 | 2.53 > 2.53 | 16% > 16% | 45% (100%) > 45% (100%) |
| z4 foe L8 | wren | 10160 > 7183 | 8 > 5.66 | 41 > 72 | 3.66 > 2.62 | 6% > 11% | 20% (100%) > 36% (100%) |
| z4 foe L8 | tobin | 10930 > 7183 | 8 > 5.26 | 41 > 72 | 4.88 > 3.48 | 1% > 1% | 2% (100%) > 2% (100%) |
| z4 foe L8 | pip | 11477 > 7183 | 8 > 5.01 | 41 > 72 | 4.49 > 2.73 | 7% > 10% | 23% (100%) > 31% (100%) |
| z4 foe L9 | wren | 13170 > 7183 | 8 > 4.36 | 41 > 72 | 3.73 > 1.98 | 5% > 7% | 15% (100%) > 20% (100%) |
| z4 foe L9 | tobin | 14169 > 7183 | 8 > 4.06 | 41 > 72 | 4.81 > 2.8 | 0% > 0% | 2% (100%) > 0% (100%) |
| z4 foe L9 | pip | 14877 > 7183 | 8 > 3.86 | 41 > 72 | 4.38 > 1.98 | 5% > 6% | 18% (100%) > 17% (100%) |
| z4 boss L9 | wren | 4118 > 7825 | 2.5 > 4.75 | 219 > 383 | 3.96 > 5.01 | 12% > 38% | 25% (100%) > 87% (84%) |
| z4 boss L9 | tobin | 4118 > 7825 | 2.33 > 4.42 | 219 > 383 | 3.96 > 5.03 | 3% > 32% | 7% (100%) > 74% (100%) |
| z4 boss L9 | pip | 4118 > 7825 | 2.21 > 4.21 | 219 > 383 | 3.96 > 4.29 | 11% > 55% | 22% (100%) > 100% (0%) |
| z5 foe L10 | wren | 16829 > 12519 | 8 > 5.95 | 43 > 73 | 3.6 > 2.63 | 7% > 14% | 29% (100%) > 55% (100%) |
| z5 foe L10 | tobin | 18106 > 12519 | 8 > 5.53 | 43 > 73 | 4.72 > 3.75 | 1% > 1% | 2% (100%) > 3% (100%) |
| z5 foe L10 | pip | 28517 > 12519 | 12 > 5.27 | 43 > 73 | 4.38 > 2.03 | 8% > 8% | 27% (100%) > 24% (100%) |
| z5 foe L11 | wren | 21257 > 12519 | 8 > 4.71 | 43 > 73 | 3.36 > 2.17 | 5% > 8% | 22% (100%) > 32% (100%) |
| z5 foe L11 | tobin | 22869 > 12519 | 8 > 4.38 | 43 > 73 | 4.77 > 3.06 | 1% > 0% | 2% (100%) > 1% (100%) |
| z5 foe L11 | pip | 36019 > 13507 | 12 > 4.5 | 43 > 73 | 4.33 > 1.68 | 6% > 4% | 22% (100%) > 12% (100%) |
| z5 boss L11 | wren | 22308 > 22308 | 8.4 > 8.4 | 241 > 409 | 6.4 > 6.4 | 59% > 59% | 100% (4%) > 100% (4%) |
| z5 boss L11 | tobin | 22308 > 22308 | 7.8 > 7.8 | 241 > 409 | 7.03 > 7.03 | 73% > 73% | 100% (1%) > 100% (1%) |
| z5 boss L11 | pip | 22308 > 22308 | 7.43 > 7.43 | 241 > 409 | 5.03 > 5.03 | 58% > 58% | 100% (0%) > 100% (0%) |
| z6 foe L11 | wren | 14880 > 14318 | 8 > 7.7 | 45 > 74 | 3.49 > 3.43 | 10% > 14% | 32% (100%) > 42% (100%) |
| z6 foe L11 | tobin | 16008 > 14318 | 8 > 7.16 | 45 > 74 | 4.78 > 4.63 | 1% > 1% | 2% (100%) > 3% (100%) |
| z6 foe L11 | pip | 16809 > 14318 | 8 > 6.81 | 45 > 74 | 3.17 > 2.68 | 7% > 9% | 25% (100%) > 28% (100%) |
| z6 foe L12 | wren | 18614 > 14318 | 8 > 6.15 | 45 > 74 | 3.42 > 2.64 | 8% > 9% | 25% (100%) > 26% (100%) |
| z6 foe L12 | tobin | 20026 > 14318 | 8 > 5.72 | 45 > 74 | 4.78 > 3.94 | 1% > 0% | 2% (100%) > 1% (100%) |
| z6 foe L12 | pip | 21027 > 14318 | 8 > 5.45 | 45 > 74 | 3.2 > 2.33 | 8% > 7% | 19% (100%) > 16% (100%) |
| z6 boss L12 | wren | 20228 > 20228 | 8.69 > 8.69 | 264 > 435 | 5.8 > 5.8 | 66% > 66% | 100% (0%) > 100% (0%) |
| z6 boss L12 | tobin | 20228 > 20228 | 8.08 > 8.08 | 264 > 435 | 6.4 > 6.4 | 61% > 61% | 100% (6%) > 100% (6%) |
| z6 boss L12 | pip | 20228 > 20228 | 7.7 > 7.7 | 264 > 435 | 5.23 > 5.23 | 40% > 40% | 98% (93%) > 98% (93%) |
| z7 foe L12 | wren | 10481 > 10481 | 3.15 > 3.15 | 47 > 47 | 2.1 > 2.1 | 8% > 8% | 26% (100%) > 26% (100%) |
| z7 foe L12 | tobin | 10481 > 10481 | 2.93 > 2.93 | 47 > 47 | 2.09 > 2.09 | 1% > 1% | 3% (100%) > 3% (100%) |
| z7 foe L12 | pip | 10481 > 10481 | 2.79 > 2.79 | 47 > 47 | 1.86 > 1.86 | 4% > 4% | 11% (100%) > 11% (100%) |
| z7 foe L13 | wren | 10481 > 10481 | 2.54 > 2.54 | 47 > 47 | 1.71 > 1.71 | 3% > 3% | 8% (100%) > 8% (100%) |
| z7 foe L13 | tobin | 10481 > 10481 | 2.36 > 2.36 | 47 > 47 | 1.82 > 1.82 | 1% > 1% | 2% (100%) > 2% (100%) |
| z7 foe L13 | pip | 10481 > 10481 | 2.25 > 2.25 | 47 > 47 | 1.42 > 1.42 | 2% > 2% | 4% (100%) > 4% (100%) |
| z7 boss L13 | wren | 31970 > 31970 | 7.75 > 7.75 | 287 > 287 | 7.24 > 7.24 | 68% > 68% | 99% (3%) > 99% (3%) |
| z7 boss L13 | tobin | 31970 > 31970 | 7.2 > 7.2 | 287 > 287 | 7.93 > 7.93 | 69% > 69% | 100% (1%) > 100% (1%) |
| z7 boss L13 | pip | 31970 > 31970 | 6.86 > 6.86 | 287 > 287 | 5.58 > 5.58 | 72% > 72% | 100% (0%) > 100% (0%) |

A landed move as a share of the arriving hero's health (mean move, before > after; Wren / Tobin / Pip):

| Fight | Level | Before | After |
|---|---|---|---|
| z3 foe | 6 | 17 / 3 / 15% | 17 / 3 / 15% |
| z3 foe | 7 | 12 / 2 / 11% | 12 / 2 / 11% |
| z3 boss | 7 | 25 / 12 / 28% | 25 / 12 / 28% |
| z3 boss | 8 | 25 / 12 / 28% | 25 / 12 / 28% |
| z4 foe | 8 | 8 / 1 / 7% | 19 / 4 / 17% |
| z4 foe | 9 | 6 / 1 / 5% | 14 / 3 / 13% |
| z4 boss | 9 | 8 / 3 / 7% | 28 / 18 / 30% |
| z5 foe | 10 | 6 / 1 / 5% | 21 / 4 / 19% |
| z5 foe | 11 | 5 / 1 / 4% | 16 / 3 / 15% |
| z5 boss | 11 | 25 / 16 / 26% | 25 / 16 / 26% |
| z6 foe | 11 | 16 / 3 / 14% | 22 / 4 / 20% |
| z6 foe | 12 | 13 / 2 / 11% | 18 / 3 / 16% |
| z6 boss | 12 | 33 / 16 / 29% | 33 / 16 / 29% |
| z7 foe | 12 | 14 / 3 / 12% | 14 / 3 / 12% |
| z7 foe | 13 | 11 / 2 / 10% | 11 / 2 / 10% |
| z7 boss | 13 | 26 / 17 / 29% | 26 / 17 / 29% |

What it says:
- HP, pay and hits rise zone by zone: foe HP 4.9K (zone 3) > 7.2K > 12.5K > 14.3K, foe pay 71 > 72 > 73 > 74, boss pay 356 > 383 > 409 >
  435, a landed foe move 17% (Wren, zone 3) > 19% > 21% > 22% on arrival.
- Each boss outlasts its foes: zone 4's boss 7.8K against its foes' 7.2K, and about 5 turns against their 2 to 2.6 (its two rally gates);
  zone 5 22.3K and zone 6 20.2K against 12.5K and 14.3K.
- A zone 4-6 fight shortens as the hero levels: Wren 2.6 turns at zone 4 level 8, 2.0 at level 9 (before 3.7 at both); zone 5 2.6 to 2.2
  (was 3.6 to 3.4).
- Zone 4's boss was a pushover (a never-defending Wren won every fight and lost a quarter of her health). Now a casual Wren loses 38% of her
  health to it, and a never-defending Pip loses every time: zone 4 is where Pip first needs Parry or Dodge, a zone before the Champion.
- Tobin's armour keeps him at 0-4% against ordinary foes (as before, and as in zones 1-3); bosses hurt him (32% casual at zone 4).

## The standing rulings, measured

Three 60-minute walks on the final build (`node tools/walk.mjs --seed N --clock-budget 60`, reports in `walks/`), against the zone
1-3 card's walks on the same seeds (`docs/proof/zone-1-3-foe-curve/walks/`). Game time:

| seed | longest gap without progress (limit 8:00) | first boss | zone 4 Captain | zone 5 Champion | zone 10 Champion (limit 60:00) |
|---|---|---|---|---|---|
| 1 | 4:14 -> 4:52 (gathering for a goal) | 1:01 -> 1:01 | 9:28 | 11:10 -> 10:30 | 23:40 -> 20:52 |
| 2 | 4:29 -> 5:19 (a grind at zone 4-5) | 1:14 -> 1:14 | 10:09 | 15:11 -> 15:29 | 24:31 -> 22:46 |
| 3 | 6:55 -> 7:23 (gathering for a goal) | 1:11 -> 1:11 | 6:30 | 15:16 -> 13:53 | 25:27 -> 29:16 |

- Zones 1-10 never go 8 minutes without progress (F3 met on all three). The longest gap is seed 3's 7:23 from the zone 4 clear to
  the zone 5 Champion, spent gathering for the Quartz Circlet the walk crafts for that boss; it was 6:55 at the same spot before.
- The zone 10 Champion falls by 20:52 to 29:16, well inside minute 60. Seed 3 is 4 minutes later than before (it spends longer at
  zones 6-9); seeds 1 and 2 are 2-3 minutes sooner.
- The walks' other misses are not this card's: F5 (seed 3, 11 findings, the same count before) and F10 (placeholder ability tiles,
  missed on seeds 1 and 2 before too).
- Follow-ups for other cards: zone 7 pays less than zone 6 now (47 against 74 a foe) and its HP steps down too, so the curve has a
  cliff at 7 that a zone 7-10 card should smooth; a Pip who never defends now loses at the zone 4 Captain, a zone before the
  Champion (the ruling is about zone 5, so it still holds).

## Health and the budget

`node tools/budget.mjs` (240 fights a hero a row; casual and never-defending players), base -> this card:

| row | casual win W/T/P | never defends W/T/P | casual turns W/T/P |
|---|---|---|---|
| z4 boss (report only, 70-90) | 100/100/100 -> 100/100/99 | 100/100/100 -> 83/100/0 | 3.9/4/4 -> 4.9/4.9/4 |
| z5 Champion (60-80) | 71/79/90 -> same | 0/0/0 -> same | same |
| z6 Captain (70-90) | 80/91/99 -> same | 0/9/93 -> same | same |
| z7 Captain (70-90) | 82/88/85 -> same | 16/1/0 -> same | same |

The zone 4 boss now costs something (a landed hit takes 23/15/25% of the hero's health, was 5/1/5%), but a casual player still wins it
first try; it is a report row, so its band is not a line. Zones 5-7 keep their HP and hits, so their rows are the base's to the decimal
(Pip's casual +10 at z5 and +9 at z6 were there before). A player who never defends still loses at the zone 5 Champion: 0/0/0.

`node tools/health.mjs --compare` (CI runs seed offset 0). Every metric but one is inside its tolerance; casual.firstGoalSec is 78 s
(base 78 s, limit kept).

casual.zoneEnd (the zone a casual player reaches after 3 days of 3 short visits) reads 13.33 at offset 0 against a baseline of 10.8
(+2.53, allowed 2). Over five seed offsets it is noise, not a shift:

| offset | 0 | 1 | 2 | 3 | 4 | mean |
|---|---|---|---|---|---|---|
| base | 10 | 12 | 11.67 | 11 | 12 | 11.33 |
| this card | 13.33 | 11.33 | 12 | 12 | 11.67 | 12.07 |

The mean moves +0.74 zones. Over five offsets the shift is Pip's (11.8 -> 14.2; Wren 11.4 -> 11.6, Tobin 10.8 -> 10.4): her zone 5
foes were 12 of her plain Attacks before and are about 5 now. Offset 0's jump is the casual Wren (11 -> 15): in the base she spends
day 2 farming zones 6 and 7 for tier-1 materials while zone 6 foes grew with her; with zone HP fixed she farms them faster and gets
back to the zone 10 boss. The judge ruled to re-centre casual.zoneEnd only (10.8 -> 12.07, perHero 11.6/10.4/14.2, abs 2 kept; offset 0
then passes at +1.26) and to leave every other metric, firstGoalSec included, as it is. That edit waits for Cal's yes.
