# Combat overhaul and balance roadmap (owner, 2026-10-01)

The order the owner set. Each step finishes before the next starts.

## 1. Hero abilities (C19, in review)

`hero-abilities.md` and its three companion docs. Done when the owner signs off the 42 abilities, passives, timed
abilities, the Speed timeline and the open proposals in its §9.

## 2. Enemy overhaul (C22, design only, no art)

A full review of every enemy we fight, rebuilt for turn combat:

- **Basic enemies have 1-2 moves; bosses have 3-4.** Elites sit between (2-3, plus their elite trait).
- **Enemies can attack more than once in a turn cycle** (Speed timeline, `hero-abilities.md` §2a), and **an attack can be
  several hits** (a two- or three-hit combo, a delayed hit, a feint).
- **Defence per hit:** each hit is its own parry-or-dodge choice. Every successful parry takes 1 turn off every ability
  cooldown. The counter only comes if every hit of that attack was parried.
- Each enemy gets: moves (name, hits, timing pattern, damage per hit as % of hero HP at that zone, status it applies),
  Speed, HP, armour and weaknesses, its C25 profile tell, and how Auto plays against it.
- Bosses also get phases, a stagger rule and one move that teaches the fight.
- Covers the zone foes (7 types x regions), elites (7 traits), zone bosses, region bosses, Deepwell and Hunting beasts.
  The world raid stays out (online layer).

## 3. Number squish and balance patch

- **Scale health and damage down** to small, readable numbers, using Expedition 33's power curve as the guide (research:
  `e33-reference.md`, when written).
- A deep pass per hero and per enemy: time to kill and hits to die at each stage, parry and dodge value, Auto vs by-hand,
  away/idle earnings, and the early pacing targets in `pacing.md`.
- Tools: `tools/sim.mjs` and new turn-combat sims; checks pin the targets.
- Needs the abilities and enemies from steps 1 and 2 first.
