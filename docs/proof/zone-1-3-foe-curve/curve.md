# Zones 1-3 foe curve (card zone-1-3-foe-curve)

Origin: Sunday release check, 11 Oct, "Still rough 2" (all three players): zone 2 is slow and safe. Gloomjaw had 4.6K HP and grew
to 9K by level 5, paid about 37 gold (the first imp's pay), hit for about 10 of 2K HP, and the zone bosses had less HP than the
foes before them.

## Why it happened

Every zone 1-3 number comes from the zone's reference hero (`turnRefAtk`, `turnRefHp`, 59k), and in zones 1-3 that hero is a
level 1 hero. The hero who plays zone 2 has come in at level 4 and zone 3 at level 6 (the walk: level 4 at the zone 1 clear,
level 6 at the zone 2 clear; the players: level 4 on entering zone 2), with about 3.3x and 3.5x that Attack and health. So:

- Foes: the early floor (`TURN_EARLY_FOE_HITS`, 8 plain Attacks of the hero who meets the foe in zones 2-6) set every zone 2-3
  foe's HP. HP was a fixed number of the hero's own Attacks, so each level and each weapon grew the foe by as much.
- Bosses: kept the reference HP (16 reference Attacks x bossEase), about 2.5 plain Attacks of the arriving hero, under the
  floor's 8.
- Hits: a share of the level 1 reference HP: about 5% of an arriving hero's health a move.
- Pay: `mobGold` grows 5% a zone, so zone 2 paid 38 gold to zone 1's 36.

## The rule (59k `TURN_TUNE.early`, 24d `TURN_EARLY_FOE_HITS`)

Zones 2-3 are set on the hero who arrives there. Zone tables, 1 from zone 4, so zones 4+ are exactly as before:

| | zone 1 | zone 2 | zone 3 | zone 4+ |
|---|---|---|---|---|
| foe HP (`early.hpX`, x the reference) | 1 | 5 | 5.2 | 1 |
| early floor, plain Attacks of the hero (`TURN_EARLY_FOE_HITS`) | 3 | 3 (was 8) | 3 (was 8) | 8 to zone 6 |
| boss HP (`early.bossHpX`) | 1 | 3.5 | 2.4 | 1 |
| boss floor, plain Attacks of the hero (`early.bossHits`) | 4 | 5 | 5 | none |
| foe hits (`normHitX`) | 1 | 3.25 | 3.5 | 0.94 to 0.7 (as before) |
| boss hits, a share of the hero's own health (`boss.hpFloor`) | 0.7 | 0.8 | 0.9 | 0.15 (as before) |
| gold (`early.payX`; XP as before) | 1 | 1.6 | 1.8 | 1 |

A zone 2-3 foe's HP is now the zone's: a level or a weapon shortens the fight, down to the floor of 3 plain Attacks (Cal's
note 18: no foe falls to one hit). A boss's HP is mostly the zone's too, so Might shortens it; its floor keeps it above the
foes for a hero far over the road (and on the first boss, where a level 3 hero meets a level 1 reference). The zone 1 boss
floor is 4, not 6: 6 cost 15 s on health's first boss win (past its tolerance), 4 costs 5 s. Zone 1's foes are untouched.

## The curve, before and after

Scratch fights (59k `turnCombatSample`, 120 a row), each hero at the level a player meets the fight with, starter kit, the
signature move only, attribute points spread. casual: parries 25%, dodges 50% of the rest; never-defends: no Parry or Dodge.
Turns are the hero's (a person takes 3 to 5 s a turn). "HP lost" is per fight, from full health.

| Zone, fight, level | Hero | HP before > after | plain Attacks | gold | casual turns | casual HP lost | never-defends HP lost (win) |
|---|---|---|---|---|---|---|---|
| z1 foe L3 | wren | 658 > 658 | 3 > 3 | 36 > 36 | 1.5 > 1.5 | 1% > 1% | 3% (100%) > 3% (100%) |
| z1 foe L3 | tobin | 708 > 708 | 3 > 3 | 36 > 36 | 2.3 > 2.3 | 0% > 0% | 0% (100%) > 0% (100%) |
| z1 foe L3 | pip | 1114 > 1114 | 4.5 > 4.5 | 36 > 36 | 1.8 > 1.8 | 2% > 2% | 4% (100%) > 4% (100%) |
| z1 boss L3 | wren | 582 > 877 | 2.7 > 4 | 180 > 180 | 1.6 > 1.9 | 4% > 10% | 12% (100%) > 30% (100%) |
| z1 boss L3 | tobin | 582 > 943 | 2.5 > 4 | 180 > 180 | 1.4 > 2.4 | 1% > 4% | 2% (100%) > 13% (100%) |
| z1 boss L3 | pip | 582 > 1486 | 2.4 > 6 | 180 > 180 | 1 > 2.5 | 2% > 13% | 6% (100%) > 37% (100%) |
| z2 foe L4 | wren | 2642 > 2146 | 7.6 > 6.2 | 38 > 60 | 3.6 > 3 | 6% > 17% | 19% (100%) > 51% (100%) |
| z2 foe L4 | tobin | 2842 > 2146 | 7.6 > 5.7 | 38 > 60 | 4.9 > 4.1 | 1% > 1% | 2% (100%) > 4% (100%) |
| z2 foe L4 | pip | 4477 > 2146 | 11.4 > 5.5 | 38 > 60 | 4.3 > 2.1 | 6% > 8% | 17% (100%) > 22% (100%) |
| z2 foe L5 | wren | 3872 > 2146 | 7.6 > 4.2 | 38 > 60 | 3.5 > 2 | 4% > 7% | 13% (100%) > 20% (100%) |
| z2 foe L5 | tobin | 4166 > 2146 | 7.6 > 3.9 | 38 > 60 | 4.8 > 3.1 | 0% > 0% | 1% (100%) > 1% (100%) |
| z2 foe L5 | pip | 6562 > 2461 | 11.4 > 4.3 | 38 > 60 | 4.2 > 1.7 | 4% > 4% | 12% (100%) > 11% (100%) |
| z2 foe L6 | wren | 5409 > 2146 | 7.6 > 3 | 38 > 60 | 3.5 > 1.5 | 3% > 3% | 9% (100%) > 7% (100%) |
| z2 foe L6 | tobin | 5819 > 2182 | 7.6 > 2.8 | 38 > 60 | 4.8 > 2.3 | 0% > 0% | 1% (100%) > 0% (100%) |
| z2 foe L6 | pip | 9166 > 3437 | 11.4 > 4.3 | 38 > 60 | 4.2 > 1.7 | 3% > 3% | 8% (100%) > 8% (100%) |
| z2 boss L5 | wren | 1312 > 4591 | 2.6 > 9 | 189 > 302 | 1.3 > 4.4 | 3% > 17% | 10% (100%) > 64% (100%) |
| z2 boss L5 | tobin | 1312 > 4591 | 2.4 > 8.4 | 189 > 302 | 1.4 > 4.5 | 1% > 8% | 2% (100%) > 29% (100%) |
| z2 boss L5 | pip | 1312 > 4591 | 2.3 > 8 | 189 > 302 | 1.3 > 4.3 | 2% > 18% | 7% (100%) > 64% (100%) |
| z3 foe L6 | wren | 5694 > 4931 | 8 > 6.9 | 40 > 71 | 3.8 > 3.4 | 6% > 18% | 17% (100%) > 53% (100%) |
| z3 foe L6 | tobin | 6126 > 4931 | 8 > 6.4 | 40 > 71 | 5 > 4.2 | 1% > 2% | 2% (100%) > 5% (100%) |
| z3 foe L6 | pip | 6432 > 4931 | 8 > 6.1 | 40 > 71 | 4.5 > 3.5 | 6% > 15% | 20% (100%) > 46% (100%) |
| z3 foe L7 | wren | 7697 > 4931 | 8 > 5.1 | 40 > 71 | 3.7 > 2.5 | 4% > 10% | 13% (100%) > 28% (100%) |
| z3 foe L7 | tobin | 8281 > 4931 | 8 > 4.8 | 40 > 71 | 5 > 3.5 | 0% > 1% | 1% (100%) > 1% (100%) |
| z3 foe L7 | pip | 8695 > 4931 | 8 > 4.5 | 40 > 71 | 4.5 > 2.6 | 4% > 9% | 14% (100%) > 26% (100%) |
| z3 foe L8 | wren | 10160 > 4931 | 8 > 3.9 | 40 > 71 | 3.7 > 1.9 | 3% > 5% | 10% (100%) > 15% (100%) |
| z3 foe L8 | tobin | 10930 > 4931 | 8 > 3.6 | 40 > 71 | 5 > 2.8 | 0% > 0% | 1% (100%) > 0% (100%) |
| z3 foe L8 | pip | 11477 > 4931 | 8 > 3.4 | 40 > 71 | 4.4 > 2 | 3% > 5% | 11% (100%) > 15% (100%) |
| z3 boss L7 | wren | 2701 > 6481 | 2.8 > 6.7 | 198 > 356 | 1.9 > 4.8 | 3% > 21% | 9% (100%) > 77% (83%) |
| z3 boss L7 | tobin | 2701 > 6481 | 2.6 > 6.3 | 198 > 356 | 2.3 > 5 | 1% > 10% | 2% (100%) > 36% (100%) |
| z3 boss L7 | pip | 2701 > 6481 | 2.5 > 6 | 198 > 356 | 1.7 > 3.6 | 3% > 18% | 9% (100%) > 54% (100%) |
| z3 boss L8 | wren | 2701 > 6481 | 2.1 > 5.1 | 198 > 356 | 1.3 > 3.7 | 2% > 17% | 7% (100%) > 58% (100%) |
| z3 boss L8 | tobin | 2701 > 6481 | 2 > 4.7 | 198 > 356 | 1.5 > 3.8 | 0% > 9% | 1% (100%) > 30% (100%) |
| z3 boss L8 | pip | 2701 > 6481 | 1.9 > 4.5 | 198 > 356 | 1 > 2.5 | 1% > 16% | 4% (100%) > 46% (100%) |
| z4 foe L8 | wren | 10160 > 10160 | 8 > 8 | 41 > 41 | 3.6 > 3.6 | 5% > 5% | 23% (100%) > 23% (100%) |
| z4 foe L8 | tobin | 10930 > 10930 | 8 > 8 | 41 > 41 | 5 > 5 | 1% > 1% | 2% (100%) > 2% (100%) |
| z4 foe L8 | pip | 17216 > 17216 | 12 > 12 | 41 > 41 | 4.3 > 4.3 | 6% > 6% | 22% (100%) > 22% (100%) |
| z4 boss L8 | wren | 4118 > 4118 | 3.2 > 3.2 | 219 > 219 | 4.5 > 4.5 | 17% > 17% | 38% (100%) > 38% (100%) |
| z4 boss L8 | tobin | 4118 > 4118 | 3 > 3 | 219 > 219 | 3.9 > 3.9 | 3% > 3% | 7% (100%) > 7% (100%) |
| z4 boss L8 | pip | 4118 > 4118 | 2.9 > 2.9 | 219 > 219 | 3.9 > 3.9 | 14% > 14% | 29% (100%) > 29% (100%) |

A landed move as a share of the arriving hero's health (mean move, before > after; Wren / Tobin / Pip):

| Fight | Level | Before | After |
|---|---|---|---|
| zone 1 foe | 1 | 20 / 4 / 18% | same |
| zone 1 boss | 3 | 8 / 2 / 7% | 20 / 9 / 22% |
| zone 2 foe | 4 | 6 / 1 / 5% | 19 / 4 / 17% |
| zone 2 boss | 5 | 6 / 1 / 6% | 22 / 10 / 24% |
| zone 3 foe | 6 | 5 / 1 / 5% | 18 / 3 / 16% |
| zone 3 boss | 7 | 7 / 1 / 6% | 25 / 12 / 28% |
| zone 4 foe | 8 | 8 / 2 / 7% | same |
| zone 4 boss | 8 | 11 / 3 / 9% | same |

What it says:
- HP, pay and hits rise together zone by zone: foe 658 > 2.1K > 4.9K, boss 0.9K > 4.6K > 6.5K, foe pay 36 > 60 > 71, boss pay
  180 > 302 > 356.
- A boss outlasts the foes before it at every level a player meets it (zone 2: 4.4 turns against its foes' 2-3).
- A zone 2 foe's fight shortens as the hero levels: Wren 3.0 turns at level 4, 2.0 at 5, 1.5 at 6 (before: 3.5 to 3.6 at every
  level). Zone 3 does the same from 3.4.
- A Wren or Pip who never defends loses about half their health to an arriving zone 2-3 foe and two thirds to its boss, and a
  zone 3 boss beats a never-defending Wren 1 time in 6. A casual player loses about a fifth.
- Tobin's armour and Shield Bash's stun keep him near 1-5% against ordinary foes (zones 1-4 alike, before and after); bosses
  hurt him (13-36% never defending). "Tobin survives best" (DECISIONS.md) stands.

Not in scope, and what it leaves (follow-up for the Foreman): zone 4 is where the old numbers come back. Its foes keep the
8-Attack floor that grows with the hero (3.6 to 5 turns), pay 41 gold (zone 3 now pays 71) and hit for 8% (zone 3 18%); its
boss pays 219 (zone 3's 356). A zones 4-6 curve card would carry the same rule on.

Zone 1 is the one exception (judge, on the reviewer's note): it is set by floors. Its foes are always 3 and its boss always 4
plain Attacks of the hero who meets them, whatever their level or gear, so the boss outlasts its foes in the same terms. The first
boss is met once, at about level 3. Damage-over-time riders on the zone 1-2 bosses (Venom, Bleed) still tick on the reference HP,
so they are lighter than the boss's direct hits: a small follow-up for the same zones 4-6 card.

## The standing rulings, measured

| Ruling | Before (base a174fa98) | After |
|---|---|---|
| z1-10 never more than 8 min without progress (walk F3, 60 min, seeds 1-3) | 5:55 / 6:19 / 6:49 | 4:14 / 4:29 / 6:55 (met) |
| z10 Champion by minute 60 (walk) | 25:47 / 27:35 / 24:36 | 23:40 / 24:31 / 25:27 (met) |
| Zone 5 Champion (walk) | 11:02 / 18:23 / 15:37 | 11:10 / 15:11 / 15:16 |
| First boss (walk F2) | 1:01 / 1:10 / 1:11 | 1:01 / 1:14 / 1:11 |
| Zone 2, arrival to clear (walk) | 2:10 to 4:27 | 1:10 to 1:20 |
| Non-parriers still lose at the z5 Champion (`budget.mjs --none`, z5-boss) | 0 / 0 / 0 wins | 0 / 0 / 0 wins |
| z3 boss, casual (budget band 85-100) | 100 / 100 / 100, 1.6 / 1.6 / 1.3 turns | 100 / 100 / 100, 4.3 / 4 / 3.6 turns |
| Health `--compare` casual.firstGoalSec (limit 82.56) | 73.3 s | 78 s |
| Early sim, active, zone 10 minutes (mean of seeds 1-3; Wren / Tobin / Pip) | 27.2 / 36.4 / 28.1 | 26.9 / 31.2 / 26.2 |
| Early sim, active, zone 5 minutes | 12.7 / 13.0 / 13.2 | 11.7 / 11.0 / 11.6 |

Before for the walks: the same three seeds on the base build (seed 1 matches the nightly walk). Walks were run with `node tools/walk.mjs --seed N --clock-budget 60`; the after reports are in `walks/`. Pip's boss fails in the early sim rose on seeds 1-3 (18 to 33) and
fell on seeds 4-9 (32 to 29): noise, watched by the judge's risk line. Seed 3 misses F5 on a clipped "+1 Cinders" line (Pip's
ability bar), before and after alike.

## Judge (Opus high, 2026-10-11)

Ship the curve as tuned. Zone 4's step back stays until a P1 zones 4-6 curve card, due before the 2026-10-18 release check. Zone 1
keeps its boss floor of 4 as an explicit exception. The cold-camp fixture's Wren at level 2 is a fair fixture fix (every bound the
same). Veto phrases for Cal: "put zones 1 to 3 back" (the whole curve), "let levels shorten the first boss" (zone 1).

Attribute review (a recommendation, no change; the half rule stays): a Focus point is worth too little. All-in Focus is slower than
all-in Might on every early boss, even for Pip (zone 2 boss, level 5: 4.5 against 4.3 turns; equal only at the zone 3 boss at level
8). A separate card should give Focus Might's split (base 0.01, per 0.03 in `ATTRS`, 24g) and measure all-in builds on bosses and
normal foes, so the 2026-10-06 farm build ("Focus kills normal foes faster") comes true.
