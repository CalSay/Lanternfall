// 24b-data-solo: the solo hero (task SOLO1, docs/design/solo-hero.md). Data and knobs only.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// The party is gone: one hero fights at a time. The three starters are roster characters played as the
// hero; each maps onto a base class kit (stats, gear weights, star maps), so balance keeps its tables.
//   SOLO_TUNE        knobs (sim --eval "SOLO_TUNE.x = ..."); on: 0 turns the whole layer off (the dormant party
//                    game; check.mjs runs its legacy party sections that way through a prelude `var __SOLO = 0`)
//   SOLO_HEROES      the starters: { key, base, kit, weapon, role, ab: { id, name, desc, cd } }
//   SOLO_ORDER       picker order
//   soloOn() -> bool the solo layer is on
// Runtime and state: 59j-solo.js. UI: 75-solo-ui.js, 76-create.js.

const SOLO_TUNE = {
  on: typeof __SOLO === 'undefined' ? 1 : +__SOLO,
  // ---- the buttons ----
  atkCd: 0.6,          // Attack: one class hit, then a short cooldown (mashing is not a win)
  parryWin: 0.35,      // Parry: the last 0.35 s of a heavy wind-up (tight)
  dodgeWin: 0.8,       // Dodge: the last 0.8 s of any heavy, slam or ground wind-up (easier)
  dodgeCd: 1.2,        // Dodge: cooldown after every press
  parryCd: 0.4,        // Parry: a short lock after a success
  openT: 1.0,          // a parry outside the window: open this long (Parry locked, hits taken x openX)
  openX: 1.5,
  counterT: 0.55,      // a parry staggers the foe for the counter's length; the counter lands at counterAt
  counterAt: 0.3,
  counterX: 3,         // the counter's damage (x the hero's attack); +stagger on bosses and elites
  // ---- the ability (one per starter) ----
  autoDelay: 1.5,      // idle: the hero casts a ready ability after it has waited this long (the player goes first)
  echo: { x: 2.2, xOther: 1.4, mark: 6 },                      // Echo Shot: every foe in the lane, Marked
  bash: { x: 3.2, stun: 2, dr: 0.4, drT: 4 },                  // Shield Bash: the front foe, Stun, less damage taken
  fire: { x: 2.4, xOther: 1.0, patchT: 3, burnP: 1.5 },        // Fireball: burst, Burn, a burning patch
  // ---- telegraphs (owner: heavy hits come mainly from bosses and elites; trash rarely, and softer) ----
  trashEvery: 20, trashFirst: 9, trashX: 1.6, trashFrom: 1,   // a pack foe's heavy: every 20 s of fighting (first at 9 s)
  // ---- balance for one hero (sim.mjs --targets early pacing) ----
  dmgX: 1.6,           // the hero's damage (the party's share folded in)
  hpX: 2.6,            // the hero's HP (it takes every hit now)
  drX: 0.25            // the hero shrugs off 25% of every hit (a party's cover and heals folded in)
};

const SOLO_HEROES = {
  wren: { key: 'wren', base: 'ranger', kit: 'ranger', weapon: 'Bow', role: 'Archer', range: 'Ranged',
    ab: { id: 'echo', name: 'Echo Shot', cd: 9, desc: 'A piercing arrow down the line. It hits every foe in its path and Marks them (they take 20% more).' } },
  tobin: { key: 'tobin', base: 'warrior', kit: 'warden', weapon: 'Sword and shield', role: 'Tank', range: 'Melee',
    ab: { id: 'bash', name: 'Shield Bash', cd: 8, desc: 'A heavy blow to the front foe. It Stuns it, and Tobin takes 40% less damage for 4 seconds.' } },
  pip: { key: 'pip', base: 'mage', kit: 'lanternmage', weapon: 'Staff', role: 'Caster', range: 'Ranged, fire',
    ab: { id: 'fire', name: 'Fireball', cd: 10, desc: 'A burst of fire on the target. It Burns it and nearby foes, and leaves a burning patch for 3 seconds.' } }
};
const SOLO_ORDER = ['wren', 'tobin', 'pip'];
// The hero key for a base class (a tool that picks a class picks its starter).
const SOLO_BY_BASE = { ranger: 'wren', warrior: 'tobin', mage: 'pip', warden: 'tobin', lanternmage: 'pip', lightkeeper: 'pip' };
function soloOn() { return !!SOLO_TUNE.on; }
