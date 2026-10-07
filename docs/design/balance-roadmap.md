# Combat overhaul and balance roadmap (owner, 2026-10-01)

The order the owner set. Each step finishes before the next starts.

## 1. Hero abilities (C19): built

Built in the C29 turn fight on 2 October 2026 ([combat-turn-build.md](combat-turn-build.md)): 42 abilities, passives,
timed abilities, the Speed timeline, Scrolls and talents. Design: `hero-abilities.md` and its companions.

## 2. Enemy overhaul (C22): designed; art lands zone by zone

The roster is final in structure ([enemies-c22-final-contract.md](enemies-c22-final-contract.md),
[world-structure.md](world-structure.md)). Zones 1 and 2 have their monsters in the game. The brief below is what the
owner asked for.

A full review of every enemy we fight, rebuilt for turn combat:

- **Basic enemies have 1-2 moves; bosses have 3-4.** Elites sit between (2-3, plus their elite trait).
- **Enemies can attack more than once in a turn cycle** (Speed timeline, `hero-abilities.md` §2a), and **an attack can be
  several hits** (a two- or three-hit combo, a delayed hit, a feint).
- **Defence per hit:** each hit is its own parry-or-dodge choice. Every successful parry takes 1 turn off every ability
  cooldown. The counter only comes if every hit of that attack was parried.
- Each enemy gets: moves (name, hits, timing pattern, damage per hit as % of hero HP at that zone, status it applies),
  Speed, HP, armour and weaknesses, and its C25 profile tell. Combat is active only (owner): no Auto or idle fighting.
- Bosses also get phases, a stagger rule and one move that teaches the fight.
- Covers the zone monsters, elites, Champions, Elders and the Deepwell. Hunting beasts are never fought as enemies
  (owner, 2026-10-01). The world raid stays out (online layer).

## 3. Number squish and balance patch: proposed

First numbers are in the turn build. The full pass is proposed in
[balance-c27-power-curve.md](balance-c27-power-curve.md); progression gaps are in
[progression-stalls.md](progression-stalls.md).

- **Scale health and damage down** to small, readable numbers, using Expedition 33's power curve as the guide (research:
  `e33-reference.md`).
- A deep pass per hero and per enemy: time to kill and hits to die at each stage, parry and dodge value, and the early pacing targets (C10a, in docs/DECISIONS.md).
- Tools: `tools/sim.mjs` and new turn-combat sims; checks pin the targets.
- Needs the abilities and enemies from steps 1 and 2 first.
