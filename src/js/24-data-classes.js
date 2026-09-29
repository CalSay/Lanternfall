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
//                        fixed)
//   CLS_TUNE             the appendix numbers (evoLv, unproven, secondThoughtsMin, respec, grit, embers, ...)
// S3 (classes-2 2, 3, 4.3; below the S2 blocks):
//   EVO_DEFS[evo]        the six evolutions: { id, name, title, base, kind, role, dt, adds, col (lamp colour),
//                        tint, pitch, bullets, good, beats, hp, armour, block, ward, threat, crit, area, ctrl,
//                        tankDr, line { name, text }, meter, ab2, finisher, replaces, passives, aura, idle,
//                        active, ringKs, ring: [[name, text, fx, p] x 8] (e1s1-e1s8), tactics }
//   CLASS_ABILITIES      + the six ab2s and six evolution Finishers, + var.trapper (Focus 30%) and
//                        var.warlock (the cursing Flare)
//   CLASS_TRIALS[base]   the three Provings (3.2): { id, name, tpl: 'hold' | 'hunt' | 'wave', secs, text, how,
//                        ... } read by 59f-trials.js
//   CLS_TACTICS          Tactics unlock order (3.6): per base class { conds, acts, preset } (evolutions: EVO_DEFS
//                        .tactics); slot 1 when Tactics arrive (S7), slot 2 on evolving
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

// ---- S3: the six ab2s and the evolution Finishers (classes-2 2.3-2.8, core-2 4.4 shape) ----
Object.assign(CLASS_ABILITIES, {
  rend: { id: 'rend', slot: 'ab2', cls: 'reaver', cd: 14, target: 'line', type: 'phys', tags: ['heavy'],
    fx: [['dmg', 2.5], ['apply', 'bleed', 3], ['stagger', 10], ['meter', 'fury', 15]], name: 'Rend',
    desc: 'Cleaves every foe in the front line for 2.5x your attack and makes them bleed. Adds 15 Fury.' },
  redharvest: { id: 'redharvest', slot: 'fin', cls: 'reaver', type: 'phys', tags: ['heavy', 'finisher'],
    fx: [['dmg', 8], ['consume', 'bleed'], ['meter', 'fury', 100]], perBleed: 0.4, name: 'Red Harvest',
    desc: '8x your attack, +0.4x for each Bleed on the foe (it uses them up). Fills your Fury.' },
  standfast: { id: 'standfast', slot: 'ab2', cls: 'warden', cd: 18, target: 'pack', type: 'holy', tags: ['taunt', 'shield'],
    fx: [['taunt', 4], ['buff', 'standfastGuard', 4], ['consume', 'bulwark'], ['dmg', 0.6, { perStack: 1, base: 0 }],
      ['shield', 0.15, { perStack: 1, base: 0, to: 'party' }], ['stagger', 3, { perStack: 1, base: 0 }], ['buff', 'standfastEmpower', 6]],
    guard: 0.3, emp: 0.15, name: 'Stand Fast',
    desc: 'Every foe turns on you for 4s and you take 30% less. Your stored Bulwark bursts as holy light on every foe and shields your party. Your party deals 15% more for 6s.' },
  oathstrike: { id: 'oathstrike', slot: 'fin', cls: 'warden', type: 'holy', tags: ['heavy', 'finisher'],
    fx: [['dmg', 8], ['shield', 0.1, { to: 'party' }], ['taunt', 3], ['meter', 'bulwark', 5]], name: 'Oathstrike',
    desc: '8x your attack as holy. Shields your party for 10% of their health, taunts every foe and stores 5 Bulwark.' },
  bloom: { id: 'bloom', slot: 'ab2', cls: 'venomstalker', cd: 16, target: 'single', type: 'poison', tags: ['dot', 'aoe'],
    fx: [['consume', 'venom'], ['dmg', 0.4, { perStack: 1, ramp: 0.1 }], ['apply', 'venom', 3], ['apply', 'venom', 4, { to: 'pack-others' }]], name: 'Deathcap',
    desc: 'Bursts the Venom on your foe: 0.4x your attack per stack, more the more stacks. It keeps 3, and every other foe gets 4.' },
  heartseeker: { id: 'heartseeker', slot: 'fin', cls: 'venomstalker', type: 'poison', tags: ['heavy', 'finisher'],
    fx: [['dmg', 8], ['apply', 'venom', 10]], name: 'Heartseeker', desc: '8x your attack as poison. Puts 10 Venom on the foe at once.' },
  snarefield: { id: 'snarefield', slot: 'ab2', cls: 'trapper', cd: 20, target: 'pack', type: 'frost', tags: ['cc', 'aoe'],
    fx: [['dmg', 1.0], ['apply', 'root', 1, { dur: 3 }], ['apply', 'chill', 1, { dur: 4 }], ['apply', 'mark', 1, { v: 0.2, dur: 8 }], ['stagger', 15], ['trap', 'rearm']], name: 'Snare Field',
    desc: 'Roots, chills and marks every foe (your party deals 20% more to them for 8s), then re-arms both your traps.' },
  deadfall: { id: 'deadfall', slot: 'fin', cls: 'trapper', type: 'frost', tags: ['heavy', 'finisher'],
    fx: [['dmg', 7], ['apply', 'root', 1, { to: 'pack' }], ['apply', 'mark', 1, { v: 0.3, dur: 10 }], ['apply', 'chill', 1, { dur: 6 }]], name: 'Deadfall',
    desc: '7x your attack as frost. Roots the pack, and marks and chills the boss.' },
  hexnova: { id: 'hexnova', slot: 'ab2', cls: 'warlock', cd: 15, target: 'pack', type: 'fire', tags: ['aoe'],
    fx: [['detonate', 'curse', 1.5], ['dmg', 1.2], ['apply', 'curse', 1, { dur: 6 }]], name: 'Witchfire',
    desc: 'Every Curse goes off at once for 1.5x what it stored. Then 1.2x your attack as fire on every foe, and a fresh Curse on each.' },
  unmaking: { id: 'unmaking', slot: 'fin', cls: 'warlock', type: 'fire', tags: ['heavy', 'finisher'],
    fx: [['dmg', 9], ['detonate', 'curse', 2]], name: 'Unmaking', desc: "9x your attack as fire. The foe's Curse goes off at double, and the whole pack takes all of it." },
  sanctuary: { id: 'sanctuary', slot: 'ab2', cls: 'priest', cd: 20, target: 'party', type: 'holy', tags: ['heal', 'shield', 'aoe'],
    fx: [['apply', 'regen', 1, { dur: 6, v: 0.8 }], ['shield', 0, { overflow: 1 }], ['dmg', 0.6, { hits: 6, over: 6, to: 'pack' }], ['stagger', 10]], name: 'Sanctuary',
    desc: 'Holy ground under your party for 6s: it heals them every second, healing past full becomes a shield, and every foe takes holy damage each second.' },
  dawnbreak: { id: 'dawnbreak', slot: 'fin', cls: 'priest', type: 'holy', tags: ['heavy', 'finisher'],
    fx: [['dmg', 7], ['heal', 3, { to: 'party' }], ['cleanse', 1], ['meter', 'blessing', 3]], name: 'Dawnbreak',
    desc: '7x your attack as holy. Heals your party, cleanses one harm from each, and sets your Blessing to III.' }
});
CLASS_ABILITIES.focus.var = { trapper: { id: 'focus', name: 'Focus', v: 0.3, desc: 'Marks the foe for 8s: your whole party deals 30% more to it.' } };
CLASS_ABILITIES.flare.var.warlock = { id: 'flare', name: 'Lantern Flare', curse: 1,
  desc: 'A burst of 20x your attack, +30% for each Ember. It curses the foe and sets the whole pack burning.' };

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

// Star maps by kit (4.1-4.4). S3: a Lightkeeper plays the Lanternmage map and the Lightkeeper ring (its stars
// moved there); the legacy maps.lightkeeper layouts stay untouched in the save, their points free again.
const CLS_STAR_MAP = { warden: 'warrior', ranger: 'ranger', lanternmage: 'mage', lightkeeper: 'mage' };
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
// ---- S3: the six evolutions (classes-2 2.3-2.9, 3.3, 4.3) ----
// Stats replace the base class's once proven (3.7). tankDr: the share of the tank role's damage cut it takes.
// Ring stars: [name, text, fx, p] for e1s1-e1s8 (s3 and s6 notables, s8 the ring keystone); fx as the star
// maps (57e): m (modifiers), t (bonus('tune:<knob>'): knobs 59e-class-combat.js reads), ks, hero.
const EVO_DEFS = {
  reaver: {
    id: 'reaver', dt: 'phys', adds: ['fire'], col: '#FF6A2A', tint: '#D55E00',
    pitch: 'Hit harder the worse it gets.',
    bullets: ['Every heavy hit builds Fury.', 'Rend cleaves the front and makes it bleed.', 'Best with a healer behind you.'],
    good: ['hesketh', 'elowen', 'thessaly', 'kestrel', 'isolde', 'corvin'], beats: ['Shielded', 'Ice-Clad', 'Enraged'],
    hp: 12, armour: 25, block: 0.05, ward: 0, threat: 4, crit: 0.08, area: 0, ctrl: 1, tankDr: 0.5,
    line: { name: "Reaver's Edge", text: '10% more damage.' }, dmg: 0.1,
    meter: 'fury', ab2: 'rend', finisher: 'redharvest', replaces: ['grit', 'stats', 'hammerfall'],
    passives: [
      { name: 'Bloodlust', text: 'Heavy hits, hits you take and kills build Fury. Every 10 Fury: 2% more damage. From 50 your heavy hits burn the front line; at 100 nothing stuns or roots you for 4s.' },
      { name: 'Blood Price', text: 'Below half health you deal 20% more, and your hits heal you for 4% of their damage.' },
      { name: 'Heavy Hands', text: 'Your heavy hits deal double damage to shields.', s: 'S6' }],
    aura: null,
    idle: 'You hold the front, and hits build your Fury by themselves. Rend fires every 14s.',
    active: 'Tap heavy hits to keep Fury at 100, parry for free Fury, and Rend into a stagger.',
    ringKs: 'bloodrage',
    ring: [
      ['Hot Blood', 'Fury +1 for each hit you take.', { t: { furyHit: 1 } }, 1.006],
      ['Hot Blood II', 'Fury +1 for each hit you take.', { t: { furyHit: 1 } }, 1.006],
      ['Deep Cuts', 'Rend adds 1 more Bleed.', { t: { rendBleed: 1 } }, 1.015],
      ['Keen Edge', '+1.5% damage.', { hero: 1.015 }, 1.012],
      ['Early Embers', 'Cinder Edge starts at 40 Fury (was 50).', { t: { cinderAt: -10 } }, 1.01],
      ['Blood Price', 'Blood Price starts below 60% health (was 50%).', { t: { bloodAt: 0.1 } }, 1.015],
      ['Keen Edge II', '+1.5% damage.', { hero: 1.015 }, 1.012],
      ['Bloodrage', 'Fury never drains below 50 during a fight. You take 10% more damage.', { ks: 'bloodrage' }, 1.03]
    ],
    tactics: { conds: ['staggerNear', 'meter'], acts: [], preset: 'IF staggerFull THEN use ab2' }
  },
  warden: {
    id: 'warden', dt: 'phys', adds: ['holy'], col: '#FFE680', tint: '#F0E442',
    pitch: 'Nothing gets past. Nothing.',
    bullets: ['Blocked hits are stored as light.', 'Stand Fast pulls every foe onto you and gives the light back.', 'Your party staggers bosses faster.'],
    good: ['wren', 'kestrel', 'isolde', 'corvin', 'pip', 'oriel', 'morwen', 'grenna', 'bram'], beats: ['Cursed', 'Shielded', 'Summoner'],
    hp: 15, armour: 45, block: 0.25, ward: 0, threat: 8, crit: 0.08, area: 0, ctrl: 1, tankDr: 1,
    line: { name: "Warden's Mail", text: '25% more health.' }, hpX: 0.25,
    meter: 'bulwark', ab2: 'standfast', finisher: 'oathstrike', replaces: ['stats', 'hammerfall'],
    passives: [
      { name: 'Bulwark', text: 'Each hit you block stores 1 Bulwark (a parry stores 3, up to 10) and throws a Holy Spark at the attacker.' },
      { name: 'Oath of the Order', text: 'While you stand, your Middle and Back take 10% less damage, and your party staggers foes 30% faster.' }],
    aura: { name: 'Oath of the Order', text: 'Your Middle and Back take 10% less damage.' },
    idle: 'You block a quarter of all hits. Bulwark fills, and Stand Fast fires every 18s with what you stored.',
    active: 'Parry for 3 Bulwark each, and hold Stand Fast for the big hit.',
    ringKs: 'aegis',
    ring: [
      ['Firm Shield', 'You block 2% more hits.', { t: { wBlock: 0.02 } }, 1.006],
      ['Firm Shield II', 'You block 2% more hits.', { t: { wBlock: 0.02 } }, 1.006],
      ['Bright Spark', 'Holy Sparks deal 0.1x more of your attack.', { t: { spark: 0.1 } }, 1.012],
      ['Deep Bulwark', 'Bulwark cap +2.', { t: { bulwarkMax: 2 } }, 1.01],
      ['Stout', '+3% health.', { t: { wHp: 0.03 } }, 1.004],
      ['Rally', 'Stand Fast gives 5% more damage.', { t: { sfEmp: 0.05 } }, 1.015],
      ['Stout II', '+3% health.', { t: { wHp: 0.03 } }, 1.004],
      ['Aegis of the Order', 'Stand Fast also shields your party for 20% of its holy damage, and any block in your party stores Bulwark for you. Stand Fast comes back 30% slower.', { ks: 'aegis' }, 1.03]
    ],
    tactics: { conds: ['castBar', 'allyHp'], acts: ['taunt', 'interrupt'], preset: 'IF castBar sig THEN use ab2' }
  },
  venomstalker: {
    id: 'venomstalker', dt: 'phys', adds: ['poison'], col: '#3FD49A', tint: '#009E73',
    pitch: 'One drop at a time.',
    bullets: ['Your arrows stack Venom, up to 10.', 'Deathcap bursts it and spreads it.', 'Best with a fire hero (Blight).'],
    good: ['pip', 'morwen', 'caedmon', 'isolde', 'corvin', 'maren'], beats: ['Leeching'],
    hp: 6, armour: 10, block: 0, ward: 0, threat: 1, crit: 0.15, area: 0, ctrl: 1, tankDr: 0,
    line: { name: "Venomstalker's Craft", text: '10% more damage, 25% more status damage.' }, dmg: 0.1, stX: 0.25,
    meter: null, ab2: 'bloom', finisher: 'heartseeker', replaces: ['killshot'],
    passives: [
      { name: 'Venom', text: 'Every 3rd hit puts 1 Venom on the foe; Focus puts 2, and each Volley arrow 1. When a foe with Venom dies, half of it seeps to the next.' },
      { name: 'Patient Hunter', text: 'You deal 2% more for each Venom on the foe (up to 20%).' }],
    aura: null,
    idle: 'Venom ramps by itself and seeps across the pack. Deathcap fires with whatever it has.',
    active: 'Hold Deathcap until 10 Venom, and Focus the healer first: Venom 5+ halves their healing.',
    ringKs: 'lingering',
    ring: [
      ['Toxin', 'Status damage +3%.', { t: { stDmg: 0.03 } }, 1.008],
      ['Toxin II', 'Status damage +3%.', { t: { stDmg: 0.03 } }, 1.008],
      ['Quick Venom', 'On your Focus-marked foe, every 2nd hit adds Venom (was every 3rd).', { t: { venomQuick: 1 } }, 1.018],
      ['Seep Deeper', 'Seep carries 60% of the Venom (was 50%).', { t: { seep: 0.1 } }, 1.008],
      ['Sharp Eye', 'Crits come 2% more often.', { m: { crit: 1.02 } }, 1.005],
      ['Black Bloom', 'Deathcap deals 0.05x more of your attack per stack.', { t: { bloom: 0.05 } }, 1.015],
      ['Toxin III', 'Status damage +3%.', { t: { stDmg: 0.03 } }, 1.008],
      ['Lingering Death', 'Deathcap bursts every stack but uses only half. Venom no longer seeps when a foe dies.', { ks: 'lingering' }, 1.03]
    ],
    tactics: { conds: ['stacks'], acts: [], preset: 'IF stacks venom 10 THEN use ab2' }
  },
  trapper: {
    id: 'trapper', dt: 'phys', adds: ['frost', 'poison'], col: '#7FCBFF', tint: '#56B4E9',
    pitch: 'The road fights for you.',
    bullets: ['Traps wait at the front of every pack.', 'Snare Field roots and marks the whole pack.', 'Best with heavy hitters and fire.'],
    good: ['grenna', 'aldric', 'bram', 'pip', 'morwen', 'caedmon', 'hesketh', 'elowen', 'maren', 'thessaly'], beats: ['Enraged', 'Summoner', 'Explosive'],
    hp: 7, armour: 15, block: 0, ward: 0, threat: 1, crit: 0.15, area: 0, ctrl: 1.3, tankDr: 0,
    line: { name: "Trapper's Kit", text: 'Stun, Root and Chill last 30% longer.' },
    meter: 'traps', ab2: 'snarefield', finisher: 'deadfall', replaces: ['mark', 'killshot'],
    passives: [
      { name: 'Traps', text: 'You hold 2 traps. They lay themselves at the front of every pack: a Frost Snare roots and chills, a Spore Pit poisons its line. One comes back every 10s.' },
      { name: "Hunter's Mark", text: 'Your Focus marks for 30% (was 25%).' },
      { name: 'Tripwire', text: 'A foe that dives at your back line springs a trap in mid-air.' }],
    aura: null,
    idle: 'Traps lay themselves on every pack and Snare Field fires every 20s. Divers never reach your back line.',
    active: 'Focus the foe that matters, and fire Snare Field when the pack is full.',
    ringKs: 'killground',
    ring: [
      ['Barbed Pit', 'Spore Pits add 1 more Venom.', { t: { pitVenom: 1 } }, 1.006],
      ['Barbed Pit II', 'Spore Pits add 1 more Venom.', { t: { pitVenom: 1 } }, 1.006],
      ['Marked Wire', 'Tripwire also marks the diver.', { t: { wireMark: 1 } }, 1.012],
      ['Quick Hands', 'Traps come back 1s sooner.', { t: { trapBack: -1 } }, 1.01],
      ['Tight Snares', 'Control lasts 5% longer.', { t: { trapCtrl: 0.05 } }, 1.006],
      ['Long Watch', 'Snare Field marks for 2s longer.', { t: { snareMark: 2 } }, 1.015],
      ['Quick Hands II', 'Traps come back 1s sooner.', { t: { trapBack: -1 } }, 1.01],
      ['Killing Ground', 'Traps come back every 5s against bosses and elites. Snare Field no longer roots.', { ks: 'killground' }, 1.03]
    ],
    tactics: { conds: ['elite', 'packSize'], acts: ['moveTo'], preset: 'IF elite summoner THEN use ab2' }
  },
  warlock: {
    id: 'warlock', dt: 'fire', adds: ['fire'], col: '#E0303F', tint: '#8A1A2A',
    pitch: "Take the dark's fire. Throw it back.",
    bullets: ['Your Embers curse what they touch.', 'Witchfire sets off every curse at once.', 'Best with a tank and big hitters.'],
    good: ['isolde', 'kestrel', 'grenna', 'aldric', 'corvin', 'caedmon', 'morwen'], beats: ['Leeching', 'Ice-Clad', 'Summoner'],
    hp: 4, armour: 0, block: 0, ward: 0.1, threat: 1.2, crit: 0.08, area: 0.2, ctrl: 1, tankDr: 0,
    line: { name: "Warlock's Pact", text: '10% more damage.' }, dmg: 0.1,
    meter: 'curse', ab2: 'hexnova', finisher: 'unmaking', replaces: ['lanternburst'],
    passives: [
      { name: 'Hex', text: 'A foe with 3 or more Embers is Cursed for 6s, and so is the target of your Flare. A Curse stores 20% of the damage the foe takes, then goes off.' },
      { name: 'Creeping Hex', text: 'When a Cursed foe dies, a fresh Curse jumps to the next foe (3 jumps).' },
      { name: 'Held Light', text: 'Each Curse that goes off brings your abilities 10% closer.' },
      { name: 'Dark Turned', text: 'Witchfire ignores fire resistance.' }],
    aura: null,
    idle: 'Embers curse the focus foe, and Witchfire curses the pack every 15s. Strong on packs.',
    active: 'Let a Curse fill with big hits, then Witchfire to set it off early at 1.5x.',
    ringKs: 'pactcinder',
    ring: [
      ['Held Light', 'A Curse that goes off brings your abilities 2% closer more.', { t: { held: 0.02 } }, 1.006],
      ['Held Light II', 'A Curse that goes off brings your abilities 2% closer more.', { t: { held: 0.02 } }, 1.006],
      ['Deep Hex', 'Witchfire sets off Curses for 8% more.', { t: { hexDet: 0.08 } }, 1.015],
      ['Wide Glass', 'Your splash reaches 3% further.', { t: { wArea: 0.03 } }, 1.008],
      ['Wide Glass II', 'Your splash reaches 3% further.', { t: { wArea: 0.03 } }, 1.008],
      ['Witchfire Wick', 'Witchfire deals 0.1x more of your attack.', { t: { nova: 0.1 } }, 1.015],
      ['Held Light III', 'A Curse that goes off brings your abilities 2% closer more.', { t: { held: 0.02 } }, 1.006],
      ['Pact of Cinders', 'Every Curse that goes off also burns the foes it hits, and Creeping Hex has no jump limit. You take 10% more damage.', { ks: 'pactcinder' }, 1.03]
    ],
    tactics: { conds: ['foeHas', 'meter'], acts: [], preset: 'IF meter curse 80 THEN use ab2' }
  },
  priest: {
    id: 'priest', dt: 'holy', adds: ['holy'], col: '#FFF3B0', tint: '#F0E442',
    pitch: 'Give your light away.',
    bullets: ['Your heroes deal the damage you give up.', 'Sanctuary heals the party, turns spare healing into shields and burns the dead.', 'Best with two damage heroes.'],
    good: ['wren', 'isolde', 'kestrel', 'corvin', 'oriel', 'pip', 'morwen', 'anselm', 'vesper'], beats: ['Cursed'],
    hp: 6, armour: 10, block: 0, ward: 0.3, threat: 0.5, crit: 0.08, area: 0, ctrl: 1, tankDr: 0,
    line: { name: "Lightkeeper's Vows", text: '30% more healing.' }, healX: 0.3,
    meter: 'blessing', ab2: 'sanctuary', finisher: 'dawnbreak', replaces: ['ember', 'flare', 'embers', 'lanternburst'],
    passives: [
      { name: 'Given Light', text: 'You hit softly, and your heroes deal the damage you give up. Your hits are holy.' },
      { name: 'Blessing', text: 'Each tap heals the most hurt ally and blesses your heroes: +20% damage for 6s, up to 3 times.' },
      { name: 'Ward', text: 'Healing past full health becomes a shield, up to 30% of health.' }],
    aura: { name: "Keeper's Light", text: 'Supports in your party heal 40% more and hit 40% harder. All companions deal 25% more damage.' },
    idle: 'Blessing sits at about II. Rally Hymn and Sanctuary fire by themselves, and spare healing turns to shields.',
    active: 'Keep Blessing at III, and drop Sanctuary just before the big hit lands.',
    ringKs: 'martyr',
    ring: [
      ['Lingering Light', 'Blessings last 1s longer.', { t: { blessT: 1 } }, 1.008],
      ['Warm Light', 'Each Blessing gives +1.5% more.', { t: { bless: 0.015 } }, 1.012],
      ['Morning Choir', 'Blessing cap +1.', { t: { blessMax: 1 } }, 1.02],
      ['Gift', 'Companions deal +2%.', { m: { party: 1.02 } }, 1.015],
      ['Warm Light II', 'Each Blessing gives +1.5% more.', { t: { bless: 0.015 } }, 1.012],
      ['Refrain', 'Rally Hymn lasts 2s longer.', { t: { hymnT: 2 } }, 1.02],
      ['Gift II', 'Companions deal +2%.', { m: { party: 1.02 } }, 1.015],
      ["Martyr's Light", 'Your own hits deal half. Your companions deal 12% more.', { ks: 'martyr', hero: 0.5, m: { party: 1.12 } }, 1.035]
    ],
    tactics: { conds: ['allyHas', 'allyHp'], acts: ['cleanse'], preset: 'IF allyHas curse THEN cleanse' }
  }
};
for (const k in EVO_DEFS) Object.assign(EVO_DEFS[k], { name: EVO_NAMES[k].name, title: EVO_NAMES[k].title, base: EVO_NAMES[k].base, kind: EVO_NAMES[k].kind, role: EVO_NAMES[k].role });

// Tactics unlock order (3.6, for S7): slot 1 when Tactics arrive, slot 2 on evolving (EVO_DEFS[evo].tactics).
const CLS_TACTICS = {
  all: { conds: ['always', 'bossHp', 'selfHp', 'staggerFull'], acts: ['use', 'hold'] },
  warrior: { conds: ['telegraph'], acts: [], preset: 'IF telegraph slam THEN use ab1' },
  ranger: { conds: ['foeLacks'], acts: ['focus'], preset: 'IF foeLacks mark THEN focus' },
  mage: { conds: ['packSize'], acts: [], preset: 'IF packSize 5 THEN use ab1' }
};

// The Proving (3.2): one solo fight per base class, at fixed strength (a reference Lanternbearer who just beat
// the Fenmother: TRIAL_TUNE in 59f-trials.js). Free and repeatable; the farm pauses while it runs.
const CLASS_TRIALS = {
  warrior: { id: 'warrior', name: 'Hold the Bridge', tpl: 'hold', secs: 60,
    text: 'Four packs cross the bridge, and a lamp stands behind you. Keep it lit for 60 seconds.',
    how: 'Hit every foe: one you leave alone for 4 seconds walks past you to the lamp. Shield Wall pulls them all back.',
    packs: 4, every: 14, lamp: 100, slip: 4, types: ['bones', 'beetle'] },
  ranger: { id: 'ranger', name: 'The Running Wraith', tpl: 'hunt', secs: 45,
    text: "The Fenmother's herald flees across the marsh. Bring it down before it escapes.",
    how: 'Keep your Focus on the wraith, not the bats. It stops at three lamps: hit it hard there.',
    quarry: 'wraith', screen: 'bat', screenN: 3, stops: 3, stopT: 2 },
  mage: { id: 'mage', name: 'The Cursed Wave', tpl: 'wave', secs: 75,
    text: 'Three waves come at you. Clear them all before your health runs out.',
    how: 'Flare the bat swarm, burn the spore caps before their clouds curse you, and stop the wraiths healing.',
    waves: [['bat', 6], ['spore', 5], ['wraith', 3]] }
};

// Appendix (starting values). S2 reads grit, embers, secondThoughtsMin, evoLv, rangerCrit, lightFeet; S3 the
// evolution numbers (59e-class-combat.js), the respec costs and the Mirrors from Great Lanterns (55-classes.js).
const CLS_TUNE = {
  evoLv: 35, unproven: 0.6, secondThoughtsMin: 10,
  respec: { evo: { mirrors: 1, essHours: 2 }, base: { mirrors: 2, essHours: 4 }, t2: null, esc: 0.5, escMax: 3 },
  mirrorFromRegion: 2,        // +1 Mirror on each Great Lantern relit from Region 2 on (3.4)
  ab2AutoWait: 0.5,           // ab2 auto-cast waits half a cooldown more than a tap would (idle about 67% of the rate)
  fury: { heavy: 8, heavyAuto: 4, hit: 3, rend: 15, kill: 5, idleAfter: 3, drain: 10, per10: 0.02,
    cinderAt: 50, cinder: 0.5, stopAt: 100, stopT: 4, stopCd: 20, rageFloor: 50, rageTaken: 0.1 },
  bloodPrice: { at: 0.5, dmg: 0.2, leech: 0.04, leechCap: 0.03 },
  bulwark: { max: 10, block: 1, parry: 3, spark: 0.3, drainOut: 1, stag: 0.3, backDr: 0.1 },
  venom: { every: 3, focus: 2, volley: 1, seep: 0.5, seepJumps: 3, perStack: 0.02, perStackMax: 0.2 },
  traps: { charges: 2, back: 10, backBoss: 5, snare: 1.5, pit: 1.0, pitVenom: 4, bossStag: 24, springAfter: 0.8, rootT: 3, chillT: 4 },
  sanctuary: { regen: 0.8, t: 6, smite: 0.6, shieldCap: 0.4 },
  hex: { embersToCurse: 3, curseT: 6, heldLight: 0.1, heldCap: 0.3, creepJumps: 3 },
  trialRef: { L: 35, grade: 3, plus: 3, stars: 0 }, trialIdlePass: 1.25,
  grit: { v: 0.03, dr: 0.01, max: 5, t: 10 },
  embers: { max: 5 },
  rangerCrit: 0.07, lightFeet: 0.2,
  // S3: 56e-formation reads the evolution rows once proven. The Trapper is a caster (ROLE_D 1.0, not the
  // striker's 1.82), so its floor is 1.4, not CL1's 0.7: about x1.1 of the Ranger's 0.7 x 1.82 (2.2's own damage)
  // BAL3: the Ranger and Mage rows (and their paths) x2 / x1.6 with FORM_TUNE.heroFloor (was ranger 0.7, mage 1.0,
  // venomstalker 0.75, trapper 1.4, warlock 1.0)
  heroFloor: { warrior: 1.0, ranger: 1.4, mage: 1.6, reaver: 0.62, warden: 1.0,
    venomstalker: 1.5, trapper: 2.8, warlock: 1.6, priest: 0 }
};
