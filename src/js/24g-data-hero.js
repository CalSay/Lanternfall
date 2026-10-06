// 24g-data-hero: hero progression knobs (card hero-progression-rework; docs/design/hero-progression.md and
// hero-progression-build.md). Data and knobs only. Runtime: 55-attributes.js (attribute points), 40-rules.js (the road
// and the level curve), 55-training.js (a move's level from the hero's level), 59j-solo.js (the join level, bench XP).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
//   HERO_TUNE.training  1 restores today's game exactly (gold Training, xpNeed 15 x 1.3^(L-1), +4% a level, the stepped
//                       Attack curve, no attributes, no join floor, no bench XP). The switch-off flag: kept until the judge
//                       signs off the sims after testers play (hero-progression.md "Switching it off").
//   lvBase              the share of the old +4% a level (PACE.heroLv) a level gives an attribute with no `base` of its own;
//                       attribute points give the rest in the player's own split
//   perLevel            attribute points a level after Lv 1
//   ATTRS               the four attributes: base (what each level gives it), per (a point's share; base + per = PACE.heroLv,
//                       so an even spread is the old +4% a level on each), kind (what it raises: atk | ab | counter | hp), parryMs
//                       (Guard: the parry window a point, ms; the window cap is TURN_TUNE.windowCaps.parry)
//   road                [zone, level] points: the level the road expects a hero to have on reaching that zone (straight
//                       lines between the points, then the last slope on). (tuned)
//   fights              [zone, fights] points: normal fights one zone of the road takes (its levels' XP over what a foe
//                       there pays; a steady ratio between points, so no zone is a wall). (tuned)
//   bench               the share of a won fight's XP every other playable hero earns
//   smooth              1: Attack's (and abilities') fifth-level step is a smooth power with the same mean over each block
//   softAt, soft        a hero's points in one attribute past softAt of all they have earned count soft each (judge 1a)
//   guardMs             the most Guard adds to the parry window, ms (judge 1b)
//   capHalf             past the class stage's cap, a level adds this much move level (judge 3b): a move's level is
//                       min(L - 1, cap) + capHalf x max(0, L - 1 - cap)
//   aheadLead, aheadX   XP is x aheadX for each level a hero is past the road's level at the furthest zone + aheadLead
//                       (40-rules xpAheadX; away XP too). (tuned)
//   joinLead            a joining hero is lifted to floor(roadLv(furthest zone) + joinLead): heroes who play the road sit
//                       about this far above the table (sims), and the one who joins should fight like them. (tuned)
//   respec              the second and later resets of a hero's points cost foeGoldBase(furthest zone) x this (the first is free)

const HERO_TUNE = {
  training: 0,
  lvBase: 0.02,
  perLevel: 4,
  road: [[1, 1], [3, 4.6], [5, 7.8], [7, 10.8], [10, 15], [12, 18], [15, 22.3], [17, 24.8], [20, 27], [25, 31], [30, 35.2], [35, 39.2], [40, 43.2], [50, 51.2], [70, 65.2]],
  fights: [[1, 3], [5, 6], [10, 17], [15, 45], [20, 132], [25, 390], [30, 560], [35, 650], [40, 720], [50, 830], [70, 1000]],
  bench: 0.5,
  smooth: 1,
  softAt: 0.5,
  soft: 0.5,
  guardMs: 60,
  capHalf: 0.5,
  respec: 30,
  aheadLead: 4,
  aheadX: 0.6,
  joinLead: 2
};
// The order is the screen's order. line: one plain line for the Attributes view.
const ATTRS = [
  { id: 'might', name: 'Might', kind: 'atk', base: 0.01, per: 0.03, line: 'Attack hits harder.' },
  { id: 'focus', name: 'Focus', kind: 'ab', base: 0.03, per: 0.01, line: 'Abilities hit harder.' },
  { id: 'guard', name: 'Guard', kind: 'counter', base: 0.01, per: 0.03, parryMs: 1, line: 'Counters hit harder, and the parry window is wider.' },
  { id: 'vigour', name: 'Vigour', kind: 'hp', base: 0.025, per: 0.015, line: 'More health.' }
];
const ATTR_IDS = ATTRS.map(a => a.id);
const ATTR0 = () => { const o = {}; for (const id of ATTR_IDS) o[id] = 0; return o; };
