// 24-data-classes: Classes 2.0, slice S2 (docs/design/classes-2.md 1, 3.5, 4, 7, 8.3 and the appendix).
// CORE FILE, data only: no DOM. The engine is 55-classes.js (state, migration, lbClass) and 55-party.js
// (the kits); 59-combat.js reads the base stats.
//
// Exposed names:
//   CLASS_BASES          ['warrior', 'ranger', 'mage'] (the picker's order)
//   CLASS_DEFS[base]     { id, name, weight, home, role, dt, kit, col, pitch, how, meter, tap, ab1, finisher,
//                        hp, armour, block, ward, threat, crit, area, aura: { name, text }, passives: [{ name, text, s }],
//                        evos: [damage, utility], trial } the three base classes (1.1-1.4)
//   CLASS_ABILITIES[id]  taps, ab1s and base Finishers in the core-2 4.4 shape plus { name, desc } (the words
//                        the player reads); `var: { [evoId]: { id, name, desc, cd } }` an evolution's variant
//                        (the legacy Lightkeeper's Blessing tap and Rally Hymn live here until S3)
//   LEGACY_CLS[key]      { base, evo } the four old classes (7.1)
//   CLS_KIT(base, evo)   -> the legacy kit key that runs ('warden' | 'ranger' | 'lanternmage' | 'lightkeeper' | null)
//   CLS_STAR_MAP[kit]    the star map a kit uses ('warrior' | 'ranger' | 'mage'; the legacy 'lightkeeper' map
//                        until S3's ring); CLS_STAR_FROM[map] the legacy map copied into it once (4.4)
//   EVO_NAMES[evo]       { name, title, base, kind: 'damage' | 'utility', role, line } names only (owner-chosen,
//                        fixed); EVO_DEFS is empty until S3 fills the kits
//   CLS_TUNE             the appendix numbers (evoLv, unproven, secondThoughtsMin, respec, grit, embers, ...)
//
// Ids never change once shipped. Numbers are starting values for tools/sim.mjs (BAL3 tunes them).

const CLASS_BASES = ['warrior', 'ranger', 'mage'];

const CLASS_DEFS = {
  warrior: {
    id: 'warrior', name: 'Warrior', weight: 'heavy', home: 'front', role: 'tank', dt: 'phys', kit: 'warden', col: '#3E63C9',
    pitch: 'Stand in front. Nothing gets past.',
    how: 'Tap a foe for a heavy hit. It turns on you and adds 1 Grit: +3% damage and 1% less damage taken for 10s, up to 5.',
    meter: 'grit', tap: 'heavy', ab1: 'shieldwall', finisher: 'hammerfall',
    hp: 12, armour: 30, block: 0.1, ward: 0, threat: 6, crit: 0.08, area: 0,
    aura: { name: 'Shieldmates', text: 'Tanks in your party get +40% health and +20 armour.' },
    passives: [{ name: 'Heavy Hands', text: 'Your heavy hits deal double damage to shields.', s: 'S6' }],
    evos: ['reaver', 'warden'], trial: 'warrior'
  },
  ranger: {
    id: 'ranger', name: 'Ranger', weight: 'medium', home: 'mid', role: 'striker', dt: 'phys', kit: 'ranger', col: '#3E8A4E',
    pitch: 'Find the weak spot. Hit it hard.',
    how: 'Tap a foe to mark it for 8s. Your whole party deals 25% more to it, and you crit 1.5x as often on it.',
    meter: null, tap: 'focus', ab1: 'volley', finisher: 'killshot',
    hp: 6, armour: 10, block: 0, ward: 0, threat: 1, crit: 0.15, area: 0,
    aura: { name: "Hunters' Company", text: 'Strikers in your party get +10% crit chance and +50% crit damage.' },
    passives: [{ name: 'Light Feet', text: 'You take 20% less from dives and slams.' }],
    evos: ['venomstalker', 'trapper'], trial: 'ranger'
  },
  mage: {
    id: 'mage', name: 'Lanternmage', weight: 'light', home: 'back', role: 'caster', dt: 'fire', kit: 'lanternmage', col: '#8A4FC9',
    pitch: 'Burn the whole pack at once.',
    how: 'Tap a foe to hit it with fire and plant an Ember on it, up to 5. Lantern Flare sets them all off.',
    meter: 'embers', tap: 'ember', ab1: 'flare', finisher: 'lanternburst',
    hp: 4, armour: 0, block: 0, ward: 0.1, threat: 1.2, crit: 0.08, area: 0.15,
    aura: { name: 'Kindred Sparks', text: 'Casters in your party get +30% attack.' },
    passives: [{ name: 'Lantern Glass', text: 'Your hits splash 15% to the rest of the pack.' }],
    evos: ['warlock', 'priest'], trial: 'mage'
  }
};

// core-2 4.4 shape. Taps carry `coef` (x P). Finishers are data now and fire with S6's stagger bar.
const CLASS_ABILITIES = {
  heavy: { id: 'heavy', slot: 'tap', cls: 'warrior', type: 'phys', coef: 1.3, tags: ['heavy'],
    fx: [['dmg', 1.3], ['threat', 3], ['meter', 'grit', 1]], name: 'Heavy hit',
    desc: 'A heavy hit of 1.3x your attack. The foe turns on you. Adds 1 Grit.' },
  shieldwall: { id: 'shieldwall', slot: 'ab1', cls: 'warrior', cd: 30, target: 'party', type: 'phys', tags: ['taunt', 'shield'],
    fx: [['buff', 'shieldwall', 6], ['buff', 'wallEmpower', 6], ['taunt', 3], ['stagger', 10]], dr: 0.6, emp: 0.3, t: 6, name: 'Shield Wall',
    // S2 keeps today's 60% / 30%: classes-2 1.2 lowers it to 50% / 20% because Core 2.0 foes hit 2-3x harder,
    // which lands with S6; at 50 / 20 on today's foes the sim lost T4 and T7 (BAL3 applies it with S6).
    desc: 'For 6s your party takes 60% less damage and deals 30% more. It blocks a boss heavy hit on you, and the boss timer stops for 3s.' },
  hammerfall: { id: 'hammerfall', slot: 'fin', cls: 'warrior', type: 'phys', tags: ['heavy', 'finisher'],
    fx: [['dmg', 7], ['delay', 1], ['meter', 'grit', 5]], name: 'Hammerfall',
    desc: '7x your attack. Every foe attacks 1s later. Fills your Grit.' },
  focus: { id: 'focus', slot: 'tap', cls: 'ranger', type: 'phys', coef: 1, tags: [],
    fx: [['dmg', 1], ['apply', 'mark', 1, { v: 0.25, dur: 8 }]], name: 'Focus',
    desc: 'Marks the foe for 8s: your whole party deals 25% more to it.' },
  volley: { id: 'volley', slot: 'ab1', cls: 'ranger', cd: 30, target: 'single', type: 'phys', tags: [],
    fx: [['dmg', 1.5, { hits: 10, over: 2, spread: 0.5 }], ['buff', 'volleyQuick', 8]], name: 'Volley',
    desc: '10 arrows of 1.5x your attack, then your party attacks 50% faster for 8s.' },
  killshot: { id: 'killshot', slot: 'fin', cls: 'ranger', type: 'phys', tags: ['heavy', 'finisher'],
    fx: [['dmg', 7], ['apply', 'mark', 1, { v: 0.3, dur: 8 }]], name: 'Kill Shot',
    desc: '7x your attack. Marks the foe: your party deals 30% more to it for 8s.' },
  ember: { id: 'ember', slot: 'tap', cls: 'mage', type: 'fire', coef: 1.3, tags: [],
    fx: [['dmg', 1.3], ['meter', 'embers', 1]], name: 'Ember',
    desc: '1.3x your attack as fire. Plants an Ember on the foe, up to 5.',
    var: { priest: { id: 'bless', name: 'Blessing', type: 'holy', coef: 1,
      desc: 'You hit softly, but your heroes deal the damage you give up. Each tap blesses them: +20% damage for 6s, up to 3 times.' } } },
  flare: { id: 'flare', slot: 'ab1', cls: 'mage', cd: 25, target: 'splash', type: 'fire', tags: ['aoe'],
    fx: [['consume', 'embers'], ['dmg', 20, { perStack: 0.3 }], ['apply', 'burn', 1]], name: 'Lantern Flare',
    desc: 'A burst of 20x your attack, +30% for each Ember on the foe. Uses up the Embers and sets the whole pack burning.',
    var: { priest: { id: 'hymn', name: 'Rally Hymn', cd: 40, type: 'holy',
      desc: 'Heals your party 40% of their health. They deal 40% more damage for 8s, and their abilities come back sooner.' } } },
  lanternburst: { id: 'lanternburst', slot: 'fin', cls: 'mage', type: 'fire', tags: ['heavy', 'finisher'],
    fx: [['dmg', 7], ['meter', 'embers', 5], ['apply', 'burn', 1, { to: 'pack' }]], name: 'Lanternburst',
    desc: '7x your attack as fire. Plants 5 Embers and sets the whole pack burning.' }
};

// The four old classes (7.1). Runs once per save; the kit it becomes plays the same (7.2).
const LEGACY_CLS = {
  warden: { base: 'warrior', evo: 'warden' },
  ranger: { base: 'ranger', evo: null },
  lanternmage: { base: 'mage', evo: null },
  lightkeeper: { base: 'mage', evo: 'priest' }
};
// The legacy kit key that runs for a class (until S3 gives the evolutions their own kits, a granted Warden
// plays the Warrior's kit and a granted Lightkeeper the old Lightkeeper's).
const CLS_KIT = (base, evo) => !base || !CLASS_DEFS[base] ? null : base === 'mage' && evo === 'priest' ? 'lightkeeper' : CLASS_DEFS[base].kit;

// Star maps by kit (4.1-4.4). The legacy Lightkeeper map stays live for a Lightkeeper until S3 moves its
// stars into the Lightkeeper ring; its points are never lost.
const CLS_STAR_MAP = { warden: 'warrior', ranger: 'ranger', lanternmage: 'mage', lightkeeper: 'lightkeeper' };
const CLS_STAR_FROM = { warrior: 'warden', mage: 'lanternmage' };

// Names only (owner-chosen, fixed; names.md "Coordinator override"). S3 fills EVO_DEFS with the kits.
const EVO_NAMES = {
  reaver: { name: 'Reaver', title: 'the Red Lamp', base: 'warrior', kind: 'damage', role: 'striker', line: 'Hit harder the worse it gets.' },
  warden: { name: 'Warden', title: 'the Unmoved', base: 'warrior', kind: 'utility', role: 'tank', line: 'Nothing gets past. Nothing.' },
  venomstalker: { name: 'Venomstalker', title: 'the Quiet Thorn', base: 'ranger', kind: 'damage', role: 'striker', line: 'One drop at a time.' },
  trapper: { name: 'Trapper', title: 'the Pathfinder', base: 'ranger', kind: 'utility', role: 'caster', line: 'The road fights for you.' },
  warlock: { name: 'Warlock', title: 'the Shadowbinder', base: 'mage', kind: 'damage', role: 'caster', line: "Take the dark's fire. Throw it back." },
  priest: { name: 'Lightkeeper', title: 'the Given Light', base: 'mage', kind: 'utility', role: 'support', line: 'Give your light away.',
    pitch: 'Keep them standing.', aura: 'Supports in your party heal 40% more and hit 40% harder. All companions deal 25% more damage.' }
};
const EVO_DEFS = {};

// Appendix (starting values). Only the S2 parts are read today: grit, embers, secondThoughtsMin, evoLv,
// rangerCrit, lightFeet; the rest wait for S3/S6.
const CLS_TUNE = {
  evoLv: 35, unproven: 0.6, secondThoughtsMin: 10,
  respec: { evo: { mirrors: 1, essHours: 2 }, base: { mirrors: 2, essHours: 4 }, t2: null, esc: 0.5, escMax: 3 },
  trialRef: { L: 35, grade: 3, plus: 3, stars: 0 }, trialIdlePass: 1.25,
  grit: { v: 0.03, dr: 0.01, max: 5, t: 10 },
  embers: { max: 5 },
  rangerCrit: 0.07, lightFeet: 0.2,
  heroFloor: { warrior: 1.0, ranger: 0.7, mage: 1.0, reaver: 0.62, warden: 1.0,
    venomstalker: 0.75, trapper: 0.7, warlock: 1.0, priest: 0 }
};
