// 21d-data-pinnacle: the data for the four pinnacle bosses (docs/design/pinnacles.md, task PB0).
// Core, data only (no DOM, no state); loads in Node too. 59f-pinnacle (PB1) runs the fights,
// 75-pinnacle-ui (PB2) draws them, tools/sim.mjs (PB5) tunes these numbers. The words players
// read live in 21e-stories-pinnacle.js; this file holds only short names.
// Exposed names:
//   PIN_IDS             -> ['king', 'lure', 'fire', 'below'], the suggested order (and the weekly order)
//   PIN_TUNE            -> the knobs (pinnacles.md 9): hp, atk, timer, enrageAt, phases, anchor, touches,
//                          scheduler gaps, wind-up floor, parry window, Assist, rank V odds, rewards
//   PIN_KINDS[kind]     -> the telegraph grammar (3.2): { word, glyph, col, tone } for parry | interrupt |
//                          cleanse | swap | scatter | dive
//   PIN_CAPS[kind]      -> the fairness caps (3.4), asserted by tools/check.mjs against every mechanic
//   PIN[boss]           -> one boss: { id, n, area, theme, overlay, anchor, order, cols[3], takeX[3],
//                          phases[3], mech: { id: mechanic }, enrage, needs, counters, samples, friend,
//                          reward } plus the boss's own rule block (tide | sky + cart | light)
//   PIN_MECH[id]        -> every mechanic by id (17), with .boss added; ids are unique across bosses
//   PIN_VOW_RULES[vow]  -> what each Oath Vow means in a pinnacle (6.2): { w, max, ...effect }
//   PIN_WEEK            -> Boss of the Week (7.5): { order, bag[8], boss(week), oath(week), level(set) }
//   PIN_REWARDS         -> per-kill rewards (7.1): { first, every, legend }
//   PIN_POWERS[id]      -> the 4 pinnacle legendary powers (7.2), rows for 21c-data-legend (L1)
//   PIN_COSMETICS[id]   -> lantern colours, trails and camp trophies (7.3): { n, kind, boss, vow, col? }
//   PIN_CODEX           -> Codex page 15 and the Seals row numbers (7.4), all-four titles, the frame
// Mechanic shape (every field is set on every mechanic; check.mjs asserts it):
//   { id, n, kind, ph: [p1, p2, p3] (1 = runs in that phase), every: [s, s, s] (0 = not in that
//     phase; for swap mechanics the stacks come from hits instead), first (s from the phase start),
//     wind (s, the default wind-up; 0 for swap), target, fx: { ... }, cap: { ... }, tap, idle: [tags],
//     role: [roles] }
//   Tap and idle answers are tags the planner (56d-autofield) and 59f read: wall, bash, ward, stun,
//   taunt, peel, cover, cleanse, aoe, spread, focus. Shields and heals halve or soak, they do not answer.

const PIN_IDS = ['king', 'lure', 'fire', 'below'];

const PIN_TUNE = {
  hp: 2.4, atk: 3.5,                 // x the zone boss HP and x the normal foe attack at the anchor zone
  timer: 90, enrageAt: 70,           // the enrage starts 20s before the end (Short Wick moves both)
  intro: 3,                          // skippable intro, not on the timer
  phases: [0.7, 0.35],               // HP fractions where phase 2 and phase 3 start
  phasePause: 1.5,                   // the roar between phases: no damage either way
  standUp: 0.3,                      // downed members stand up at 30% HP when a phase ends
  anchor: { king: 74, lure: 78, fire: 82, below: 86 },
  touchCharges: 2, touchBack: 5,     // Lantern touch: 2 charges, 1 back every 5s
  gap: 1.0,                          // at least 1s between two player-answered telegraphs
  queueWait: 3,                      // a telegraph waits up to 3s for its turn, then is skipped once
  windMin: 1.2,                      // no wind-up is ever shorter, whatever shortens it
  parry: 0.8, parryMaren: 1.1,       // parry window: the last 0.8s of a heavy wind-up (1.1s with Maren)
  dodgeX: 0.5,                       // a tap before the window is a Dodge: half damage
  assist: 1.5,                       // the Assist switch: every wind-up and the parry window x1.5, full rewards
  stepBack: { threat: 0.5, secs: 3 },// a Lantern touch on a crowned ally
  crushed: { secs: 3, takeX: 1.5 },  // a missed swap
  practice: [0.7, 0.35],             // Practice phase 2 / 3 starts at this HP, no rewards, no best time
  lgBase: 0.02, lgPer: 0.001, pity: 0.005,   // rank V roll: 2% + 0.1% a Vow level, +0.5% a miss (shared)
  echo: 1, firstRank: 3,             // 1 Echo a kill; the first kill learns the power at rank III
  vowBands: [1, 6, 11, 16, 21],      // Codex Vow bands
  bestMax: 31                        // best times kept per boss (Vow levels 0-30)
};

// The telegraph grammar (3.2). Word, glyph and colour always go together; colour is never alone.
const PIN_KINDS = {
  parry:     { word: 'PARRY',     glyph: '!',  col: '#E0483E', tone: 'rise' },
  interrupt: { word: 'INTERRUPT', glyph: '~',  col: '#9B5CE0', tone: 'wobble' },
  cleanse:   { word: 'CLEANSE',   glyph: 'drop', col: '#2FB5A5', tone: 'drip' },
  swap:      { word: 'SWAP',      glyph: 'crown', col: '#E8B84A', tone: 'bell' },
  scatter:   { word: 'SCATTER',   glyph: '<>', col: '#F08A2B', tone: 'sweep' },
  dive:      { word: 'DIVE',      glyph: '!',  col: '#4F8FE0', tone: 'rise' }
};

// What a miss may cost at most (3.4). hit: share of the target's max HP after armour (the hit plus any
// rider). stun: seconds of lost control. heal: boss HP healed back. dot: share of max HP a debuff
// deals in its worst 6 seconds. crushed: seconds and damage taken. light: Maud's Light lost.
const PIN_CAPS = {
  parry:     { hit: 0.35 },
  interrupt: { stun: 3, heal: 0.08, light: 30 },
  cleanse:   { dot: 0.25 },
  swap:      { crushed: 3, takeX: 1.5 },
  scatter:   { hit: 0.30 },
  dive:      { hit: 0.35, stun: 4 }
};

const PIN = {
  // ---------------- 4.1 The Hollow King ----------------
  king: {
    id: 'king', n: 'The Hollow King', area: 'The Hollow Court', theme: 'barrow', overlay: 'court', rig: 'king',
    anchor: 74, order: 1,
    cols: ['back', 'back', 'front'],       // where the boss stands in each phase (melee cannot reach Back)
    takeX: [1, 1, 1.2],                    // damage the boss takes in each phase
    phases: [
      { n: 'Behind the Curtain', adds: { id: 'courtier', n: 'Kneeling Courtier', count: 2, hp: 0.06, col: 'front', reach: 'melee', role: 'soak' } },
      { n: 'The Court Speaks', adds: { id: 'courtier', n: 'Kneeling Courtier', count: 2, hp: 0.06, col: 'front', reach: 'melee', role: 'soak', every: 20, keep: 2 } },
      { n: 'The Curtain Falls', adds: null }
    ],
    mech: {
      decree: { id: 'decree', n: 'Royal Decree', kind: 'parry', ph: [1, 1, 1], every: [9, 9, 9], first: 4, wind: 1.5,
        target: 'threat', fx: { mult: 4, onParry: { stagger: 2, takeX: 1.5 } }, cap: { hit: 0.35 },
        tap: 'parry', idle: ['wall', 'bash', 'ward'], role: ['tank', 'tap'] },
      kneel: { id: 'kneel', n: 'Kneel', kind: 'interrupt', ph: [1, 1, 1], every: [16, 16, 16], first: 8, wind: 2.0,
        target: 'party', fx: { stun: 2.5, immune: ['corvin'], reach: ['back', 'back', 'front'] }, cap: { stun: 2.5 },
        tap: 'boss', idle: ['stun'], role: ['caster', 'stun'] },
      blade: { id: 'blade', n: 'The King\'s Blade', kind: 'dive', ph: [0, 1, 1], every: [0, 14, 14], first: 5, wind: 1.5,
        target: 'backLowHp', fx: { add: { id: 'assassin', n: 'Unseen Blade', hp: 0.04, leap: true }, secs: 5, dmgX: 2 },
        cap: { hit: 0.35 }, tap: 'add', idle: ['peel', 'taunt', 'cover'], role: ['tank', 'striker'] },
      crown: { id: 'crown', n: 'Weight of the Crown', kind: 'swap', ph: [0, 0, 1], every: [0, 0, 0], first: 0, wind: 0,
        target: 'threat', fx: { stackOn: 'bossHit', stackEvery: 2, stacks: 4, tapAt: 3, crushed: { secs: 3, takeX: 1.5, stun: 3 } },
        cap: { crushed: 3, takeX: 1.5 }, tap: 'portrait', idle: ['taunt'], role: ['tank'] }
    },
    enrage: { id: 'courtRises', n: 'The Court Rises', every: { decree: 5 }, fx: { addAtkSpd: 1.5, courtStands: true } },
    needs: { taunts: 2, stun: 'back', peel: 1, ranged: 1 },
    counters: { strong: ['taunts2', 'stunBack', 'peel', 'ranged'], weak: ['allMelee', 'oneTankNoPeel', 'noStun'] },
    samples: {
      warden: ['maren', 'oriel', 'wren'], lanternmage: ['tobin', 'aldric', 'anselm'],
      ranger: ['maren', 'kestrel', 'oriel'], lightkeeper: ['tobin', 'grenna', 'oriel']
    },
    friend: { corvin: { immune: ['kneel'], sayAt: 'phase3' } },
    reward: { power: 'nokneel', title: 'unkneeling', colour: 'crownViolet', trail: 'curtainMotes', trophy: 'hollowCrown', title30: 'uncrowned' }
  },

  // ---------------- 4.2 The Lurelight ----------------
  lure: {
    id: 'lure', n: 'The Lurelight', area: 'Saltreach Reef', theme: 'lighthouse', overlay: 'reefNight', rig: 'lure',
    anchor: 78, order: 2,
    cols: ['back', 'back', 'front'],
    takeX: [1, 1, 1.25],
    phases: [
      { n: 'The Song', adds: null },
      { n: 'Two Lights', adds: { id: 'lureAdd', n: 'Second Lure', count: 1, hp: 0.10, col: 'mid', reach: 'none', role: 'lure' } },
      { n: 'Low Water', adds: null }
    ],
    tide: { high: 15, low: 15, fromWorld: true, p3: 'low' },   // its own fast tide; phase 3 stays at Low
    mech: {
      swallow: { id: 'swallow', n: 'Swallow', kind: 'parry', ph: [1, 1, 1], every: [8, 8, 8], first: 4, wind: 1.5,
        target: 'threat', fx: { mult: 4, hitCap: 0.23, swallowed: { tide: 'high', secs: 4, dps: 0.03 } }, cap: { hit: 0.35 },
        tap: 'parry', idle: ['wall', 'bash', 'ward'], role: ['tap', 'tank'] },
      song: { id: 'song', n: 'Lure Song', kind: 'interrupt', ph: [1, 1, 1], every: [15, 15, 15], first: 7, wind: 2.0,
        target: 'lowHpPct', fx: { charm: 3, addAliveX: 0.5, lateTouch: true, reach: ['back', 'back', 'front'] }, cap: { stun: 3 },
        tap: 'lure', idle: ['stun', 'cleanse'], role: ['caster', 'stun'] },
      rot: { id: 'rot', n: 'Brine Rot', kind: 'cleanse', ph: [1, 1, 1], every: [12, 12, 12], first: 6, wind: 1.5,
        target: 'two', fx: { count: 2, dps: 0.015, stacks: 3, stackEvery: 3, secs: 9, healX: 0.6 }, cap: { dot: 0.25 },
        tap: 'portrait', idle: ['cleanse'], role: ['support'] },
      riptide: { id: 'riptide', n: 'Riptide', kind: 'scatter', ph: [1, 1, 1], every: [14, 14, 9], first: 10, wind: 1.8,
        target: 'lane', fx: { mult: 2.5, highX: 1.5, soakedX: 1.5, strike: { by: 'lane', pick: 'most' }, braceX: 0.5 },
        cap: { hit: 0.30 }, tap: 'scatter', idle: ['spread'], role: ['formation'] }
    },
    enrage: { id: 'flood', n: 'The Flood', every: { riptide: 6 }, fx: { tide: 'high', soakFront: true } },
    needs: { cleanse: 1, stun: 'back', spread: 'lane', tidefast: 1, ranged: 1 },
    counters: { strong: ['cleanse', 'tidefast', 'ranged', 'spreadLane'], weak: ['burnHigh', 'stackedLane', 'noCleanse'] },
    samples: {
      warden: ['anselm', 'oriel', 'wren'], lanternmage: ['maren', 'elowen', 'thessaly'],
      ranger: ['tobin', 'anselm', 'oriel'], lightkeeper: ['grenna', 'wren', 'thessaly']
    },
    friend: {},
    reward: { power: 'lurebreak', title: 'lurebreaker', colour: 'deepGreen', trail: 'seaSpray', trophy: 'lureLamp', title30: 'undrowned' }
  },

  // ---------------- 4.3 The First Fire ----------------
  fire: {
    id: 'fire', n: 'The First Fire', area: 'Emberlea Road', theme: 'forest', overlay: 'emberRoad', rig: 'wyrmYoung',
    anchor: 82, order: 3,
    cols: ['front', 'front', 'front'],
    takeX: [1, 1, 1],
    burnTakenX: 0.5,                       // the Wyrm takes half damage from burns
    phases: [
      { n: 'The Road', adds: null },
      { n: 'The Sky', adds: null },
      { n: 'The Last Cart', adds: null }
    ],
    sky: { ph: [0, 1, 0], every: 20, secs: 6, col: 'back' },     // in the air: counts as Back, Talon pauses
    cart: { ph: [0, 0, 1], hpOfTank: 0.3, fallDmgX: 1.3 },       // the villagers' cart behind the Back column
    mech: {
      talon: { id: 'talon', n: 'Talon', kind: 'parry', ph: [1, 1, 1], every: [8, 8, 8], first: 4, wind: 1.5,
        target: 'threat', fx: { mult: 4, knock: { cols: 1, secs: 3 }, ground: true, bedrockX: 0.75 }, cap: { hit: 0.35 },
        tap: 'parry', idle: ['wall', 'bash', 'ward'], role: ['tank', 'tap'] },
      breath: { id: 'breath', n: 'Flame Breath', kind: 'scatter', ph: [1, 1, 1], every: [13, 13, 13], first: 9, wind: 1.8,
        target: 'col', fx: { mult: 2.5, hitCap: 0.15, burn: { dps: 0.03, secs: 5 }, strike: { by: 'col', pick: 'most' }, immune: ['caedmon'] },
        cap: { hit: 0.30 }, tap: 'scatter', idle: ['spread'], role: ['formation'] },
      ash: { id: 'ash', n: 'Ash Fall', kind: 'cleanse', ph: [0, 1, 1], every: [0, 18, 18], first: 6, wind: 1.5,
        target: 'two', fx: { count: 2, dps: 0.01, stacks: 4, stackEvery: 2, secs: 8, highX: 0.5, immune: ['caedmon'] }, cap: { dot: 0.25 },
        tap: 'portrait', idle: ['cleanse'], role: ['support'] },
      cart: { id: 'cart', n: 'Hunt the Cart', kind: 'dive', ph: [0, 0, 1], every: [0, 0, 12], first: 4, wind: 1.5,
        target: 'cart', fx: { cartHit: 0.35 }, cap: { hit: 0.35 },
        tap: 'boss', idle: ['taunt', 'cover'], role: ['tank'] }
    },
    enrage: { id: 'fireSpreads', n: 'The Fire Spreads', every: { breath: 8 }, fx: { burnsHold: true } },
    needs: { taunts: 1, cleanse: 1, spread: 'col', ranged: 1 },
    counters: { strong: ['caedmon', 'taunts', 'cleanse', 'ranged'], weak: ['oneColumn', 'noTauntP3', 'burnHeavy'] },
    samples: {
      warden: ['tobin', 'anselm', 'oriel'], lanternmage: ['maren', 'elowen', 'wren'],
      ranger: ['grenna', 'tobin', 'anselm'], lightkeeper: ['maren', 'tobin', 'kestrel']
    },
    friend: { caedmon: { immune: ['breath', 'ash'], sayAt: 'phase3' } },
    reward: { power: 'onehour', title: 'heldRoad', colour: 'emberleaRed', trail: 'cinders', trophy: 'wyrmScale', title30: 'hourKept' }
  },

  // ---------------- 4.4 The Climber ----------------
  below: {
    id: 'below', n: 'The Climber', area: 'The Last Landing', theme: 'well', overlay: 'wellBottom', rig: 'climber',
    anchor: 86, order: 4,
    cols: ['front', 'front', 'front'],
    takeX: [1, 1, 1],
    phases: [
      { n: 'The Stair', adds: null },
      { n: 'The Dark Floods', adds: null },
      { n: 'Maud\'s Light', adds: null }
    ],
    light: {                               // Maud's Lantern (4.4)
      start: 100, max: 100,
      low: 50, lowWindX: 0.8, lowDmgX: 0.9,          // below 50: wind-ups 20% shorter (never under windMin), party -10%
      darkDmgX: 0.7, darkHeal: 0.01, darkUntil: 20,  // at 0: party -30%, the Climber heals 1%/s until Light > 20
      touch: 15, parry: 5, heal: 1, healPerSec: 3,   // ways back: a touch on the lantern, a parry, a heal on a member under 50%
      drain: [0, 1, 1], flare: { ph: 3, min: 50, takeX: 1.4 }
    },
    mech: {
      grasp: { id: 'grasp', n: 'Grasp', kind: 'parry', ph: [1, 1, 1], every: [8, 8, 8], first: 4, wind: 1.5,
        target: 'threat', fx: { mult: 4.5, light: 5 }, cap: { hit: 0.35 },
        tap: 'parry', idle: ['wall', 'bash', 'ward'], role: ['tank', 'tap'] },
      hands: { id: 'hands', n: 'Grasping Hands', kind: 'dive', ph: [1, 1, 1], every: [15, 15, 15], first: 7, wind: 1.5,
        target: 'twoMidBack', fx: { add: { id: 'hand', n: 'Grasping Hand', hp: 0.03, count: 2 }, hold: 4 }, cap: { stun: 4 },
        tap: 'add', idle: ['aoe', 'peel'], role: ['caster', 'peel'] },
      snuff: { id: 'snuff', n: 'Snuff', kind: 'interrupt', ph: [0, 1, 1], every: [0, 17, 17], first: 5, wind: 2.0,
        target: 'lantern', fx: { light: -30, reach: ['front', 'front', 'front'] }, cap: { light: 30 },
        tap: 'boss', idle: ['stun'], role: ['stun'] },
      lightless: { id: 'lightless', n: 'Lightless', kind: 'cleanse', ph: [0, 1, 1], every: [0, 14, 14], first: 9, wind: 1.5,
        target: 'one', fx: { count: 1, dps: 0.02, stacks: 1, stackEvery: 0, secs: 6, noHeal: true }, cap: { dot: 0.25 },
        tap: 'portrait', idle: ['cleanse'], role: ['support'] },
      swipe: { id: 'swipe', n: 'Many-Handed Swipe', kind: 'swap', ph: [0, 0, 1], every: [0, 0, 0], first: 0, wind: 0,
        target: 'threat', fx: { stackOn: 'grasp', stacks: 3, tapAt: 2, crushed: { secs: 3, takeX: 1.5 } },
        cap: { crushed: 3, takeX: 1.5 }, tap: 'portrait', idle: ['taunt'], role: ['tank'] }
    },
    enrage: { id: 'lanternGutters', n: 'The Lantern Gutters', every: { grasp: 5 }, fx: { drain: 3 } },
    needs: { support: 2, cleanse: 1, stun: 'front', aoe: 1, taunts: 2 },
    counters: { strong: ['support2', 'stunFront', 'aoe', 'taunts2'], weak: ['glass', 'noSupport'] },
    samples: {
      warden: ['aldric', 'elowen', 'pip'], lanternmage: ['grenna', 'anselm', 'hesketh'],
      ranger: ['aldric', 'elowen', 'maren'], lightkeeper: ['grenna', 'tobin', 'morwen']
    },
    friend: { morwen: { sayAt: 'phase3' } },
    reward: { power: 'maudlamp', title: 'maudsHeir', colour: 'wellGold', trail: 'lanternDust', trophy: 'maudsHook', title30: 'lightBelow' }
  }
};

// Every mechanic by id (ids are unique across bosses; S.pin.mech and S.pin.fails key on them).
const PIN_MECH = {};
PIN_IDS.forEach(b => Object.keys(PIN[b].mech).forEach(id => { PIN_MECH[id] = Object.assign({ boss: b }, PIN[b].mech[id]); }));

// What each Vow means in a pinnacle (6.2). w and max match the Oath Vows (oaths.md 2.2): the Vow level is
// the same sum, 0-30. The swearable cap is the Oath one, max(6, S.oath.maxL + 4); the Week's Oath ignores it.
const PIN_VOW_RULES = {
  hard:     { w: 1, max: 3, hpX: 0.35 },                          // boss and adds +35% HP a rank
  fierce:   { w: 1, max: 3, dmgX: 0.30 },                         // boss and adds +30% damage a rank
  restless: { w: 1, max: 2, often: 0.10 },                        // mechanics 10% more often a rank (wind-ups keep windMin)
  elders:   { w: 2, max: 2, eliteHp: 2, extraHeavyAt: 2 },        // r1: elite adds (x2 HP); r2: +1 heavy hit per phase change
  bitter:   { w: 1, max: 2, healX: -0.20 },                       // party healing and shields -20% a rank
  wick:     { w: 1, max: 2, secs: 8 },                            // timer -8s a rank; the enrage still starts 20s before the end
  tide:     { w: 2, max: 1, high: 20, low: 20, lureHigh: 20, lureCycle: 30 },
  choir:    { w: 2, max: 1, healer: 'marshWraith', healerLure: 'brineWitch' },   // a healer add each phase
  norest:   { w: 2, max: 1, standAt: 3 },                         // downed members stand up only at phase 3
  circle:   { w: 2, max: 1 },                                     // fielded companions share one circle
  unlit:    { w: 3, max: 1, cdX: 1.3, noAuto: true },             // the hero ability does not auto-cast
  thin:     { w: 3, max: 1, comps: 2 }                            // field 2 companions, not 3
};

// Boss of the Week (7.5): a highlight, never a lockout and never power.
const PIN_WEEK = {
  order: ['king', 'lure', 'fire', 'below'],
  // The Week's Oath bag: 8 fixed Vow sets at level 10-14. Everyone gets the same one in a week.
  bag: [
    { id: 'few',     vows: { thin: 1, wick: 1, fierce: 2, hard: 2, bitter: 1, restless: 1 } },          // 10
    { id: 'kin',     vows: { circle: 1, tide: 1, hard: 2, fierce: 2, restless: 2 } },                   // 10
    { id: 'night',   vows: { norest: 1, elders: 1, hard: 3, fierce: 2, wick: 1, bitter: 1 } },          // 11
    { id: 'dark',    vows: { unlit: 1, fierce: 3, restless: 2, hard: 2, bitter: 1 } },                  // 11
    { id: 'choir',   vows: { choir: 1, bitter: 2, hard: 3, fierce: 2, wick: 2, restless: 1 } },         // 12
    { id: 'flood',   vows: { tide: 1, elders: 2, hard: 2, fierce: 2, wick: 1, restless: 1 } },          // 12
    { id: 'three',   vows: { thin: 1, circle: 1, hard: 2, fierce: 2, wick: 2, restless: 2 } },          // 13
    { id: 'alone',   vows: { unlit: 1, norest: 1, choir: 1, hard: 2, fierce: 3, bitter: 2 } }           // 14
  ],
  boss: w => PIN_WEEK.order[((w % 4) + 4) % 4],
  // The set shifts by 3 every 8 weeks, so each boss meets every set within 32 weeks.
  oath: w => PIN_WEEK.bag[(((w + 3 * Math.floor(w / 8)) % 8) + 8) % 8],
  level: set => Object.keys(set.vows).reduce((n, k) => n + PIN_VOW_RULES[k].w * set.vows[k], 0),
  seal: 1                                // a Pinnacle Seal (1 Codex Light) for the first kill at the Week's Oath
};

// Per-kill rewards (7.1). Everything goes into capped systems; no new stat, no new currency.
const PIN_REWARDS = {
  first: { rank: 3, trophies: 5, pearls: 5, pearlTier: 5, title: true, colour: true, card: true },
  every: { echo: 1, trophies: 2, trophyAt: [10, 20], pearls: 2, pearlPer: 10, pearlTier: 5 },
  legend: { rank: 5, source: 'pin', base: 0.02, per: 0.001, pity: 0.005 },   // legendDrop(5, 'pin'); pity shared
  vow: { trail: 10, trophy: 20, title: 30 }                                  // per-boss cosmetics by Vow level
};

// The four pinnacle powers (7.2). Rows for 21c-data-legend.js (L1): hero powers for any class, on any hero
// position, counting toward the hero's limit of 2. v[k] lists ranks I-V. They drop only from their boss.
const PIN_POWERS = {
  nokneel: { id: 'nokneel', n: 'Crown of No One', boss: 'king', fits: 'hero', cls: null, p1: 0.05, p5: 0.10,
    v: { every: [20, 18, 16, 14, 12], dmg: [0.05, 0.0625, 0.075, 0.0875, 0.10], secs: [4, 4, 4, 4, 4] },
    txt: r => `You ignore the first stun, bind, charm or kneel every ${PIN_POWERS.nokneel.v.every[r - 1]}s. Each one ignored gives you +${Math.round(PIN_POWERS.nokneel.v.dmg[r - 1] * 1000) / 10}% damage for 4s.`,
    wire: 'cc' },
  lurebreak: { id: 'lurebreak', n: 'Lurebreaker\'s Hook', boss: 'lure', fits: 'hero', cls: null, p1: 0.05, p5: 0.10,
    v: { heal: [0.03, 0.0375, 0.045, 0.0525, 0.06], cd: [1, 1, 1, 1, 1] },
    txt: r => `Every interrupt and cleanse you make heals you for ${Math.round(PIN_POWERS.lurebreak.v.heal[r - 1] * 1000) / 10}% of max HP and takes 1s off your ability cooldowns.`,
    wire: 'telegraph' },
  onehour: { id: 'onehour', n: 'One More Hour', boss: 'fire', fits: 'hero', cls: null, p1: 0.04, p5: 0.08,
    v: { hp: [0.30, 0.375, 0.45, 0.525, 0.60], secs: [5, 6, 7, 9, 10] },
    txt: r => `Once a boss fight, when you would fall, you stand at ${Math.round(PIN_POWERS.onehour.v.hp[r - 1] * 1000) / 10}% HP and the boss timer gains ${PIN_POWERS.onehour.v.secs[r - 1]}s.`,
    wire: 'wipe' },
  maudlamp: { id: 'maudlamp', n: 'Maud\'s Lantern', boss: 'below', fits: 'hero', cls: null, p1: 0.06, p5: 0.12,
    v: { early: [0.3, 0.35, 0.4, 0.45, 0.5], dmg: [0.02, 0.025, 0.03, 0.035, 0.04], stacks: [3, 3, 3, 3, 3], secs: [6, 6, 6, 6, 6] },
    txt: r => `Wind-ups show ${PIN_POWERS.maudlamp.v.early[r - 1]}s earlier and your parry window grows by the same. Each parry gives you +${Math.round(PIN_POWERS.maudlamp.v.dmg[r - 1] * 1000) / 10}% damage for 6s, up to 3 times.`,
    wire: 'parry' }
};

// Cosmetics (7.3). No power. Lantern colours and trails use the Deepwell cosmetic slots; trophies are
// camp decorations. vow: the Vow level of a kill of that boss that unlocks it (0 = the first kill).
const PIN_COSMETICS = {
  crownViolet:  { n: 'Crown Violet', kind: 'colour', boss: 'king', vow: 0, col: '#8A5CC9' },
  deepGreen:    { n: 'Deep Green', kind: 'colour', boss: 'lure', vow: 0, col: '#3FBF7F' },
  emberleaRed:  { n: 'Emberlea Red', kind: 'colour', boss: 'fire', vow: 0, col: '#D9482B' },
  wellGold:     { n: 'Well Gold', kind: 'colour', boss: 'below', vow: 0, col: '#E8B84A' },
  curtainMotes: { n: 'Curtain Motes', kind: 'trail', boss: 'king', vow: 10, col: '#B0344A' },
  seaSpray:     { n: 'Sea Spray', kind: 'trail', boss: 'lure', vow: 10, col: '#BFE6E0' },
  cinders:      { n: 'Cinders', kind: 'trail', boss: 'fire', vow: 10, col: '#F08A2B' },
  lanternDust:  { n: 'Lantern Dust', kind: 'trail', boss: 'below', vow: 10, col: '#F2D98A' },
  hollowCrown:  { n: 'The Hollow Crown', kind: 'trophy', boss: 'king', vow: 20, spot: 'hearthPost' },
  lureLamp:     { n: 'The Lure Lamp', kind: 'trophy', boss: 'lure', vow: 20, spot: 'campGate' },
  wyrmScale:    { n: 'A Wyrm Scale', kind: 'trophy', boss: 'fire', vow: 20, spot: 'hearthWall' },
  maudsHook:    { n: 'Maud\'s Hook', kind: 'trophy', boss: 'below', vow: 20, spot: 'wellSide' }
};

// Codex page 15 (7.4), the Pinnacle Seals row, the all-four titles and the portrait frame (7.3).
const PIN_CODEX = {
  page: 15,
  first: 10, band: 2, card: 2,           // Light: each first kill, each boss x Vow band, each kill card read (+ The Voice)
  total: 90,
  seal: 1, sealMax: 52,                  // Pinnacle Seals row: 1 Light each, up to 52
  pageSeal: 'lampbearer',                // the Page Seal title, no power
  wardrobe: 16,                          // Wardrobe entries added (4 colours, 4 trails, 4 trophies, 4 boss titles)
  allFour: { first: 'pinnacle', vow20: 'lampbearerFour', vow30: 'againstDark' },
  frame: [{ vow: 10, n: 'bronze', col: '#B07A45' }, { vow: 20, n: 'silver', col: '#C9D1DA' }, { vow: 30, n: 'gold', col: '#F2C14E' }]
};
