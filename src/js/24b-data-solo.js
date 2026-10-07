// 24b-data-solo: the solo hero (task SOLO1, docs/design/solo-hero.md). Data and knobs only.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// The party is gone: one hero fights at a time. The three starters are roster characters played as the
// hero; each maps onto a base class kit (stats, gear weights, star maps), so balance keeps its tables.
//   SOLO_TUNE        knobs (sim --eval "SOLO_TUNE.x = ...")
//   SOLO_ABILITIES   the abilities: { id, name, cd, line, desc }
//   SOLO_HEROES      the starters: { key, base, kit, weapon, role, range, abs (unlocked ids), eq (starting slots), ab (the signature) }
//   SOLO_ORDER       picker order
// Runtime and state: 59j-solo.js. UI: 75-solo-ui.js, 76-create.js.

const SOLO_TUNE = {
  // ---- Auto is a saved toggle (59j soloSetAuto); a combat press turns it off. While it is off nothing fights for you ----
  atkX: 5,              // an Attack press: the class tap x atkX (W2-A: 3.5 x attack speed before Swiftness left; while active there is no auto swing)
  abHandX: 2.5,         // an ability cast by hand hits this much harder than the idle auto-cast
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
  counterX: 4,         // the counter's damage (x the hero's attack x attack speed), and it always crits (x critMult); +stagger on bosses and elites
  // ---- the ability (one per starter) ----
  autoDelay: 1.5,      // idle: the hero casts a ready ability after it has waited this long (the player goes first)
  echo: { x: 2.2, xOther: 1.4, mark: 6 },                      // Echo Shot: every foe in the lane, Marked
  bash: { x: 3.2, xOther: 1.6, stun: 2, dr: 0.4, drT: 4 },                  // Shield Bash: the front foe, Stun, less damage taken
  fire: { x: 2.4, xOther: 1.0, patchT: 3, burnP: 1.5 },        // Fireball: burst, Burn, a burning patch
  // ---- telegraphs (owner: heavy hits come mainly from bosses and elites; trash rarely, and softer) ----
  trashEvery: 20, trashFirst: 9, trashX: 1.6, trashFrom: 1,   // a pack foe's heavy: every 20 s of fighting (first at 9 s)
  // ---- balance for one hero (sim.mjs --targets early pacing) ----
  dmgX: 1.75,          // the hero's damage (the party's share folded in)
  ramp: [8, 12, 1.35], // ... rising x1.35 from max zone 8 to 12 (the old party's trio step)
  heroX: { wren: 0.76, tobin: 1.2, pip: 1.15 },   // per hero damage, for parity (the Ranger kit crits more; the Warrior's is a tank's). W2-A: wren 0.85 -> 0.76
  heroHp: { wren: 1.1, tobin: 1, pip: 1.6 },      // per hero HP (Pip wears cloth and stands alone)
  hpX: 2.6,            // the hero's HP (it takes every hit now)
  drX: 0.25,           // the hero shrugs off 25% of every hit (a party's cover and heals folded in)
  bossHitX: 0.6,       // a boss's (and its adds') hits on the lone hero (bosses were tuned against a tank)
  // ---- Training (W2-A, solo-hero.md "Training"): gold levels up each hero's moves. Runtime: 55-training.js ----
  // Attack's damage curve is PACE.atkPer / atkX / atkEvery (40-rules atkCurve). Prices: ECON.train (21w).
  train: {
    cap: [40, 80],       // the class-stage cap: base class, then after Ascension (the Proving). A move also never passes the hero's level.
                         //   40: the Proving's level (35, CLS_TUNE.evoLv) and a little room; it binds near day 11 today
    aps: { wren: 1, tobin: 1, pip: 1 },   // idle auto swings a second, fixed per hero (Swiftness is gone; the Attack cooldown sets a hand's speed)
    abPer: 3, abX: 1.55, abX2: 1.8,   // an ability's power: (4 + abPer x level) x abX every 5th level, abX2 past PACE.atkBend (x the hero's level, gear and damage)
    every: 5,            // a milestone every 5th level (Attack and abilities)
    // each ability's milestones, in turn: cd -0.5 s cooldown; mark +2 s Mark; target +1 foe; stun +0.5 s Stun; patch +1 s burning patch
    ms: { echo: ['cd', 'mark'], bash: ['target', 'stun'], fire: ['patch', 'cd'] },
    msv: { cd: 0.5, mark: 2, target: 1, stun: 0.5, patch: 1 },
    cdMin: 0.5,          // milestones never take a cooldown under half its base
    parry: 0.1,          // Parry: +10% counter damage a level
    dodge: 0.97, dodgeMin: 0.4   // Dodge: its cooldown x0.97 a level, never under 0.4 s (the dodge window never grows)
  }
};

// The abilities (one per starter for now; the ability trees of solo-hero.md come later). line: the picker's one line.
const SOLO_ABILITIES = {
  echo: { id: 'echo', name: 'Echo Shot', short: 'Echo', cd: 9, line: 'Pierces the whole line and Marks every foe.',
    desc: 'A piercing arrow down the line. It hits every foe in its path and Marks them (they take 20% more).' },
  bash: { id: 'bash', name: 'Shield Bash', short: 'Bash', cd: 8, line: 'Stuns the front foe; you take less damage.',
    desc: 'A heavy blow to the front foe. It Stuns it, and Tobin takes 40% less damage for 4 seconds.' },
  fire: { id: 'fire', name: 'Fireball', short: 'Fireball', cd: 10, line: 'Burns the target and nearby foes; leaves fire.',
    desc: 'A burst of fire on the target. It Burns it and nearby foes, and leaves a burning patch for 3 seconds.' }
};
// abs: the abilities the hero has unlocked; eq: the three slots a new game starts with (S.solo.eq per hero).
const SOLO_HEROES = {
  wren: { key: 'wren', base: 'ranger', kit: 'ranger', weapon: 'Bow', role: 'Archer', range: 'Ranged', abs: ['echo'], eq: ['echo', null, null] },
  tobin: { key: 'tobin', base: 'warrior', kit: 'warden', weapon: 'Sword and shield', role: 'Tank', range: 'Melee', abs: ['bash'], eq: ['bash', null, null] },
  pip: { key: 'pip', base: 'mage', kit: 'lanternmage', weapon: 'Staff', role: 'Caster', range: 'Ranged, fire', abs: ['fire'], eq: ['fire', null, null] }
};
for (const k in SOLO_HEROES) SOLO_HEROES[k].ab = SOLO_ABILITIES[SOLO_HEROES[k].abs[0]];   // the signature ability (the picker and the guide name it)
const SOLO_ORDER = ['wren', 'tobin', 'pip'];
// W2-A: each hero's Training levels (S.solo.tr[hero] = { atk, parry, dodge, <ability id> }): all 0 on a new game.
const TRAIN0 = () => { const o = {}; for (const k of SOLO_ORDER) { o[k] = { atk: 0, parry: 0, dodge: 0 }; for (const id of SOLO_HEROES[k].abs) o[k][id] = 0; } return o; };
// The hero key for a base class (a tool that picks a class picks its starter).
const SOLO_BY_BASE = { ranger: 'wren', warrior: 'tobin', mage: 'pip', warden: 'tobin', lanternmage: 'pip', lightkeeper: 'pip' };
