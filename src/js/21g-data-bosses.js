// 21g-data-bosses: boss kits, elite traits and the player-facing lines of active combat (Core 2.0 slice S6-C/D/H;
// docs/design/combat-2.md 4, 5, 3.9 and 8.3). CORE FILE, data only: no DOM. The kit interpreter is 59h-bosses.js,
// the trait handlers 59i-elites.js, the answer scheduler 59g-active.js.
//
// Exposed names:
//   BOSS_KITS[id]   one row per boss: { name, fam, dt, phases: [hp shares], timer, atk, sig, heart, uniq, theme, gem,
//                   region, mech: [{ id, name, tele, ph, every, first, wind, x, slots, apply, adds, fx, at, answer,
//                   idle, hint }] }. Keys: the Hollow's seven foe types (zone elders and Deep Elders), the Coast's
//                   seven (R2 builds those foes), and the region bosses 'fenmother' and 'silas'.
//                   tele: core-2 6.3 ids. x: a multiple of the boss's attack. slots: party slots a zone strikes.
//                   apply: [status, stacks, secs]. adds: [type | 'self', n, share of the boss's max HP].
//                   fx: what a cast does when it lands (59h FX). answer / idle: the active and the line-up answer.
//   BOSS_DEEP       the Deepwell's depth rules (combat-2 4.4): Snuff the Lamp from floor 20, faster from 40
//   ELITE_TRAITS    the seven traits (core-2 6.5, combat-2 5.1): name, counter, badge (5x5), first-sighting line
//   ELITE_WEIGHTS   per region (0 the Hollow .. 4 the Gloamvale) and 'deep': traits per elite and weights (5.2)
//   ELITE_LEANS     per region: the two traits each of its 7 zone places leans to (weight x3)
//   ELITE_TUNE      the trait numbers (5.1)
//   BOSS_COPY       first-use hints, the win line, the phase roar (S6-H: plain words, short sentences)
//
// Numbers are combat-2's starting values; ids never change.

const BOSS_KITS = {
  // ---------------- the Hollow: seven elders (2 phases, 45 s; 4.2) ----------------
  slime: { name: 'Elder Moss Slime', fam: 'plant', dt: 'poison', phases: [0.5], timer: 45, atk: 1, sig: null, heart: '#B6F09A',
    uniq: null, theme: 'poison spread', gem: ['body', 2, -6], region: 0,
    mech: [
      { id: 'engulf', name: 'Engulf', tele: 'heavy', ph: 1, every: 8, first: 4, wind: 1.5, x: 4, answer: 'parry', idle: 'Shield Wall, a stun' },
      { id: 'ooze', name: 'Ooze', tele: 'zone', ph: 1, every: 14, first: 7, wind: 1.8, x: 2, slots: 1, slots2: 2, apply: ['venom', 3, 8], answer: 'dodge', idle: 'shields, a clear slot' },
      { id: 'split', name: 'Split', tele: 'hard', ph: 2, at: 0.5, wind: 1.5, adds: ['self', 2, 0.12], answer: 'area', idle: 'area damage' }
    ] },
  bat: { name: 'Elder Cave Bat', fam: 'beast', dt: 'phys', phases: [0.5], timer: 45, atk: 1, sig: null, heart: '#E7C3FF',
    uniq: null, theme: 'bleed and swarm', gem: ['body', 0, -4], region: 0,
    mech: [
      { id: 'bite', name: 'Rending Bite', tele: 'heavy', ph: 1, every: 8, first: 4, wind: 1.5, x: 4, answer: 'parry', idle: 'Shield Wall, a stun' },
      { id: 'dive', name: 'Dive', tele: 'dive', ph: 1, every: 12, first: 7, wind: 1.5, x: 2, secs: 5, answer: 'taunt', idle: 'a tank covering, a stun' },
      { id: 'colony', name: 'Call the Colony', tele: 'summon', ph: 2, every: 16, first: 3, wind: 2, adds: ['bat', 4, 0.03], answer: 'interrupt', idle: 'area damage' }
    ] },
  bones: { name: 'Elder Rattlebones', fam: 'undead', dt: 'phys', phases: [0.5], timer: 45, atk: 1, sig: null, heart: '#F2E7C9',
    uniq: null, theme: 'undead rising', gem: ['body', 0, -8], region: 0,
    mech: [
      { id: 'graveblow', name: 'Grave Blow', tele: 'heavy', ph: 1, every: 8, first: 4, wind: 1.5, x: 4, answer: 'parry', idle: 'Shield Wall, a stun' },
      { id: 'raise', name: 'Raise the Dead', tele: 'summon', ph: 1, every: 15, first: 7, wind: 2, adds: ['bones', 2, 0.08], answer: 'interrupt', idle: 'area damage, a stun' },
      { id: 'volley', name: 'Bone Volley', tele: 'line', ph: 2, every: 14, first: 3, wind: 1.5, x: 1.5, answer: 'shield', idle: 'shields and heals' }
    ] },
  beetle: { name: 'Elder Barrow Beetle', fam: 'beast', dt: 'phys', phases: [0.5], timer: 45, atk: 1, sig: null, heart: '#FFB36B',
    uniq: null, theme: 'armour and thorns', gem: ['body', 0, -6], region: 0,
    mech: [
      { id: 'mandibles', name: 'Mandibles', tele: 'heavy', ph: 1, every: 6, first: 4, wind: 1.5, x: 4, answer: 'parry', idle: 'Shield Wall, a stun' },
      { id: 'burrow', name: 'Burrow', tele: 'zone', ph: 2, every: 12, first: 3, wind: 1.8, x: 2.5, slots: 1, back: 1, answer: 'dodge', idle: 'shields, a clear slot' }
    ] },
  spore: { name: 'Elder Spore Cap', fam: 'plant', dt: 'poison', phases: [0.5], timer: 45, atk: 1, sig: null, heart: '#C9F08A',
    uniq: null, theme: 'venom bloom', gem: ['body', 0, -8], region: 0,
    mech: [
      { id: 'burst', name: 'Spore Burst', tele: 'line', ph: 1, every: 8, first: 4, wind: 1.5, x: 1,   // S6 pick: 1x, not 1.5x (a line cannot be parried or dodged; at 1.5x it walled Ranger parties at zone 68)
      apply: ['venom', 2, 8], answer: 'shield', idle: 'shields, a cleanse' },
      { id: 'bloom', name: 'Spore Bloom', tele: 'sig', ph: 2, every: 16, first: 3, wind: 2.5, fx: ['venomAll', 5], answer: 'interrupt', idle: 'a stun, a cleanse' }
    ] },
  golem: { name: 'Elder Quarry Golem', fam: 'construct', dt: 'phys', phases: [0.5], timer: 45, atk: 1, sig: null, heart: '#9FD8FF',
    uniq: null, theme: 'stone and shatter', gem: ['body', 0, -10], region: 0,
    mech: [
      { id: 'fist', name: 'Crushing Fist', tele: 'heavy', ph: 1, every: 8, first: 4, wind: 1.5, x: 6, answer: 'parry', idle: 'Shield Wall, a stun' },
      { id: 'rockfall', name: 'Rockfall', tele: 'slam', ph: 2, every: 11, first: 3, wind: 1.8, x: 3, answer: 'dodge', idle: 'a tank in Front, shields' }
    ] },
  wraith: { name: 'Elder Marsh Wraith', fam: 'spirit', dt: 'frost', phases: [0.5], timer: 45, atk: 1, sig: null, heart: '#BFF7E8',
    uniq: null, theme: 'cold and silence', gem: ['body', 0, -8], region: 0,
    mech: [
      { id: 'coldtouch', name: 'Cold Touch', tele: 'heavy', ph: 1, every: 8, first: 4, wind: 1.5, x: 4, answer: 'parry', idle: 'Shield Wall, a stun' },
      { id: 'mend', name: 'Mend', tele: 'heal', ph: 1, every: 12, first: 7, wind: 1.5, fx: ['healSelf', 0.1], answer: 'interrupt', idle: 'a stun, anti-heal' },
      { id: 'drown', name: 'Drown the Light', tele: 'sig', ph: 2, every: 15, first: 3, wind: 2, fx: ['curseLow', 4], answer: 'interrupt', idle: 'a cleanse, a stun' }
    ] },

  // ---------------- the Fenmother (Region 1 boss, zone 35; 3 phases, 60 s) ----------------
  fenmother: { name: 'The Fenmother', fam: 'spirit', dt: 'frost', phases: [0.66, 0.33], timer: 60, atk: 1, sig: null, heart: '#D8FFF2',
    uniq: null, theme: 'the voice', gem: ['body', 0, -10], region: 0, boss: 1,
    mech: [
      { id: 'coldhand', name: 'Cold Hand', tele: 'heavy', ph: 1, every: 8, first: 4, wind: 1.5, x: 4, answer: 'parry', idle: 'Shield Wall, a stun' },
      { id: 'smother', name: 'Smother', tele: 'sig', ph: 1, every: 16, first: 8, wind: 2.5, fx: ['smother', 5], answer: 'interrupt', idle: 'a stun, an interrupt hero' },
      { id: 'echoes', name: 'Echoes', tele: 'summon', ph: 2, every: 20, first: 4, wind: 2, adds: ['wraith', 2, 0.06], answer: 'interrupt', idle: 'area damage, a Mark' },
      { id: 'whisper', name: 'Whisper', tele: 'zone', ph: 3, every: 10, first: 3, wind: 1.8, x: 2.5, slots: 2, dt: 'frost', answer: 'dodge', idle: 'frost resist, a clear slot' }
    ] },

  // ---------------- the Sunken Coast: seven elders and Silas (4.3; R2 builds these foes) ----------------
  crab: { name: 'Elder Shinglecrab', fam: 'beast', dt: 'phys', phases: [0.5], timer: 45, atk: 1, sig: 'pearl_h', heart: null,
    uniq: null, theme: 'shell and block', gem: ['body', 0, -6], region: 1,
    mech: [
      { id: 'claw', name: 'Claw', tele: 'heavy', ph: 1, every: 8, first: 4, wind: 1.5, x: 4, answer: 'parry', idle: 'Shield Wall, a stun' },
      { id: 'shell', name: 'Shell Up', tele: 'hard', ph: 1, at: 0.75, wind: 1.5, fx: ['shell', 4], answer: 'stun', idle: 'wait it out' },
      { id: 'snap', name: 'Tidal Snap', tele: 'slam', ph: 2, every: 10, first: 3, wind: 1.8, x: 3, answer: 'dodge', idle: 'a tank in Front' },
      { id: 'shell2', name: 'Shell Up', tele: 'hard', ph: 2, at: 0.25, repeat: 'shell', wind: 1.5, fx: ['shell', 4], answer: 'stun', idle: 'wait it out' }
    ] },
  gull: { name: 'Elder Stormgull', fam: 'beast', dt: 'phys', phases: [0.5], timer: 45, atk: 1, sig: 'pearl_m', heart: null,
    uniq: null, theme: 'wind and speed', gem: ['body', 0, -4], region: 1,
    mech: [
      { id: 'beak', name: 'Beak', tele: 'heavy', ph: 1, every: 8, first: 4, wind: 1.5, x: 4, answer: 'parry', idle: 'Shield Wall, a stun' },
      { id: 'squall', name: 'Squall', tele: 'sig', ph: 1, every: 12, first: 7, wind: 2, fx: ['squall', 1], answer: 'interrupt', idle: 'a stun' },
      { id: 'storm', name: 'Gull Storm', tele: 'summon', ph: 2, every: 18, first: 3, wind: 2, adds: ['gull', 6, 0.02], answer: 'interrupt', idle: 'area damage' }
    ] },
  deckhand: { name: 'The Bosun', fam: 'drowned', dt: 'frost', phases: [0.5], timer: 45, atk: 1, sig: 'pearl_h', heart: null,
    uniq: null, theme: 'the bell: taunts', gem: ['body', 0, -8], region: 1,
    mech: [
      { id: 'pin', name: 'Belaying Pin', tele: 'heavy', ph: 1, every: 8, first: 4, wind: 1.5, x: 4, answer: 'parry', idle: 'Shield Wall, a stun' },
      { id: 'bell', name: "Ship's Bell", tele: 'summon', ph: 1, every: 15, first: 7, wind: 2, adds: ['deckhand', 2, 0.06], answer: 'interrupt', idle: 'area damage' },
      { id: 'undertow', name: 'Undertow', tele: 'dive', ph: 2, every: 12, first: 3, wind: 1.5, x: 1.5, secs: 4, answer: 'taunt', idle: 'a tank covering' }
    ] },
  kelp: { name: 'Elder Kelp Strangler', fam: 'drowned', dt: 'phys', phases: [0.5], timer: 45, atk: 1, sig: 'pearl_m', heart: null,
    uniq: null, theme: 'roots and holds', gem: ['body', 0, -8], region: 1,
    mech: [
      { id: 'lash', name: 'Lash', tele: 'heavy', ph: 1, every: 8, first: 4, wind: 1.5, x: 4, answer: 'parry', idle: 'Shield Wall, a stun' },
      { id: 'bind', name: 'Bind', tele: 'dive', ph: 1, every: 10, first: 7, wind: 1.5, fx: ['bind', 3], answer: 'burst', idle: 'burst it' },
      { id: 'coils', name: 'Crushing Coils', tele: 'sig', ph: 2, every: 18, first: 3, wind: 2.5, fx: ['coils', 2.5], answer: 'interrupt', idle: 'a stun' }
    ] },
  jelly: { name: 'Elder Lanternjelly', fam: 'drowned', dt: 'poison', phases: [0.5], timer: 45, atk: 1, sig: 'pearl_l', heart: null,
    uniq: null, theme: 'chain damage', gem: ['body', 0, -6], region: 1,
    mech: [
      { id: 'sting', name: 'Sting', tele: 'heavy', ph: 1, every: 8, first: 4, wind: 1.5, x: 4, answer: 'parry', idle: 'Shield Wall, a stun' },
      { id: 'shock', name: 'Chain Shock', tele: 'line', ph: 1, every: 6, first: 6, wind: 1.2, x: 0.8, answer: 'shield', idle: 'shields' },
      { id: 'jsplit', name: 'Split', tele: 'hard', ph: 2, at: 0.5, wind: 1.5, adds: ['jelly', 3, 0.08], answer: 'area', idle: 'area damage' }
    ] },
  witch: { name: 'Elder Brine Witch', fam: 'drowned', dt: 'frost', phases: [0.5], timer: 45, atk: 1, sig: 'pearl_l', heart: null,
    uniq: null, theme: 'hex and curse', gem: ['body', 0, -8], region: 1,
    mech: [
      { id: 'brinelash', name: 'Brine Lash', tele: 'heavy', ph: 1, every: 8, first: 4, wind: 1.5, x: 4, answer: 'parry', idle: 'Shield Wall, a stun' },
      { id: 'hex', name: 'Brine Hex', tele: 'line', ph: 1, every: 9, first: 7, wind: 1.2, x: 0, fx: ['curseTop', 4], answer: 'cleanse', idle: 'a cleanse' },
      { id: 'renewal', name: 'Brine Renewal', tele: 'sig', ph: 2, every: 12, first: 3, wind: 2, fx: ['healSelf', 0.08], answer: 'interrupt', idle: 'anti-heal, a stun' }
    ] },
  coral: { name: 'Elder Coral Warden', fam: 'construct', dt: 'phys', phases: [0.5], timer: 45, atk: 1, sig: 'pearl_h', heart: null,
    uniq: null, theme: 'reflect', gem: ['body', 0, -10], region: 1,
    mech: [
      { id: 'crush', name: 'Coral Crush', tele: 'heavy', ph: 1, every: 8, first: 4, wind: 1.5, x: 5, answer: 'parry', idle: 'Shield Wall, a stun' },
      { id: 'reef', name: 'Reef Wall', tele: 'hard', ph: 1, every: 20, first: 8, wind: 1.5, fx: ['reefWall', 5], answer: 'magic', idle: 'magic and typed damage' },
      { id: 'spikes', name: 'Coral Spikes', tele: 'zone', ph: 2, every: 13, first: 3, wind: 1.8, x: 2.5, slots: 2, answer: 'dodge', idle: 'shields, a clear slot' }
    ] },
  silas: { name: 'Silas the Fogbound', fam: 'drowned', dt: 'frost', phases: [0.66, 0.33], timer: 60, atk: 1, sig: 'pearl_l', heart: null,
    uniq: null, theme: 'the lens', gem: ['lamp', 0, 0], region: 1, boss: 1,
    mech: [
      { id: 'lamp', name: 'Lamp Swing', tele: 'heavy', ph: 1, every: 8, first: 4, wind: 1.5, x: 4, answer: 'parry', idle: 'Shield Wall, a stun' },
      { id: 'beam', name: 'Green Beam', tele: 'zone', ph: 1, every: 14, first: 7, wind: 1.8, x: 2.5, slots: 2, dt: 'frost', answer: 'dodge', idle: 'frost resist, a clear slot' },
      { id: 'undertow', name: 'Undertow', tele: 'dive', ph: 2, every: 12, first: 3, wind: 1.5, x: 1.5, secs: 5, answer: 'taunt', idle: 'a tank covering' },
      { id: 'toll', name: 'Toll the Drowned Bell', tele: 'sig', ph: 3, every: 15, first: 3, wind: 2.5, adds: ['self', 2, 0.04], answer: 'interrupt', idle: 'area damage' },   // BAL3: adds 6% -> 4% (single-target parties walled at the cap)
      { id: 'flare', name: 'The Lens Flares', tele: 'hard', ph: 2, at: 0.66, roar: 1, wind: 1.5, fx: ['none', 0], answer: '-', idle: '-' }
    ] }
};
// The Coast's region boss answers every kind and has a `hard` cast (checks: 8.5-1).

// Deep Elders (4.4): the type's kit with no timer; floor 20+ adds Snuff the Lamp in a third phase; 40+ is faster.
const BOSS_DEEP = {
  snuffFrom: 20, fastFrom: 40, fast: 0.85,
  snuff: { id: 'snuff', name: 'Snuff the Lamp', tele: 'sig', ph: 3, every: 18, first: 3, wind: 2, fx: ['oil', 5], answer: 'interrupt', idle: 'a stun' },
  phase3: 0.33
};

// ---------------- elite traits (combat-2 5) ----------------
const ELITE_TRAITS = {
  shielded: { name: 'Shielded', counter: 'heavy hits', badge: ['.www.', 'w...w', 'w...w', 'w...w', '.www.'], col: '#BFE6FF',
    first: 'Shielded elite: heavy hits break its shield twice as fast.' },
  vampiric: { name: 'Leeching', counter: 'Curse or Venom 5+', badge: ['r...r', 'rr.rr', 'rrrrr', '.r.r.', '.r.r.'], col: '#E0524F',
    first: 'Leeching elite: it heals from its hits. Curse it, or stack Venom to 5.' },
  explosive: { name: 'Explosive', counter: 'dodge, or kill it Chilled', badge: ['...y.', '..o..', '.ooo.', 'ooooo', '.ooo.'], col: '#FF9B3D',
    first: 'Explosive elite: it blasts when it dies. Dodge the blast, or kill it while it is Chilled.' },
  summoner: { name: 'Summoner', counter: 'interrupt', badge: ['.vvv.', 'v...v', 'v.v.v', 'v...v', '.vvv.'], col: '#B47BFF',
    first: 'Summoner elite: tap while it casts to stop its adds.' },
  enraged: { name: 'Enraged', counter: 'Chill, or burst it', badge: ['r...r', 'r...r', '.rrr.', 'rrrrr', '.rrr.'], col: '#FF5A4A',
    first: 'Enraged elite: under half health it attacks faster. Chill calms it.' },
  frozen: { name: 'Ice-Clad', counter: 'fire', badge: ['bbbbb', 'b.w.b', 'bwwwb', 'b.w.b', 'bbbbb'], col: '#9CDCFF',
    first: 'Ice-Clad elite: it takes half from physical and frost. Three fire hits break the ice.' },
  cursed: { name: 'Cursed', counter: 'holy, or a cleanse', badge: ['.vvv.', 'v...v', 'v.V.v', 'v..V.', '.vv..'], col: '#B47BFF',
    first: 'Cursed elite: its hits stop healing. Holy damage calms it; a cleanse lifts the Curse.' }
};
// 5.2: traits per elite and weights (Shielded, Leeching, Explosive, Summoner, Enraged, Ice-Clad, Cursed).
const ELITE_ORDER = ['shielded', 'vampiric', 'explosive', 'summoner', 'enraged', 'frozen', 'cursed'];
const ELITE_WEIGHTS = {
  0: { n: 0, w: [0, 0, 0, 0, 0, 0, 0] },
  1: { n: 1, w: [25, 20, 5, 20, 10, 0, 20] },
  2: { n: 1, w: [20, 10, 25, 15, 25, 0, 5] },
  3: { n: 2, w: [15, 10, 10, 15, 10, 30, 10] },
  4: { n: 2, w: [15, 15, 10, 15, 10, 10, 25] },
  deep: { n: 1, n2From: 20, from: 8, w: [1, 1, 1, 1, 1, 1, 1] }
};
// Two traits never share a counter: Explosive and Enraged both answer to Chill.
const ELITE_NEVER = [['explosive', 'enraged']];
// Zone leans (5.2): each place of a region's 7-zone cycle leans to two traits (x3).
const ELITE_LEANS = {
  1: [['vampiric', 'shielded'], ['summoner', 'cursed'], ['shielded', 'explosive'], ['cursed', 'vampiric'], ['summoner', 'shielded'], ['enraged', 'cursed'], ['vampiric', 'summoner']],
  2: [['explosive', 'shielded'], ['enraged', 'summoner'], ['explosive', 'vampiric'], ['shielded', 'enraged'], ['summoner', 'explosive'], ['enraged', 'cursed'], ['shielded', 'summoner']],
  3: [['frozen', 'shielded'], ['frozen', 'summoner'], ['vampiric', 'frozen'], ['cursed', 'shielded'], ['frozen', 'explosive'], ['summoner', 'enraged'], ['frozen', 'cursed']],
  4: [['cursed', 'vampiric'], ['shielded', 'cursed'], ['summoner', 'frozen'], ['cursed', 'explosive'], ['vampiric', 'shielded'], ['cursed', 'summoner'], ['enraged', 'vampiric']]
};
const ELITE_TUNE = {
  lean: 3,
  shielded: { share: 0.3, back: 5, heavyX: 2 },
  vampiric: { share: 0.2, capPerSec: 0.03 },
  explosive: { wind: 1.5, x: 2 },
  summoner: { every: 12, first: 6, cast: 2, n: 2, share: 0.08, max: 4 },
  enraged: { at: 0.5, spd: 1.5, dmg: 1.2 },
  frozen: { x: 0.5, hits: 3, back: 8 },
  cursed: { secs: 4, holyOff: 5 }
};

// ---------------- words (S6-H) ----------------
const BOSS_COPY = {
  first: {
    // SOLO1: the buttons (Attack, Parry, Dodge, the ability) replace the stage tap
    heavy: 'A red ring means a heavy hit. Dodge it, or Parry just before it lands to stagger it and counter.',
    zone: 'Orange ground means DODGE. Press Dodge as it ends. Wait for the very end for a perfect dodge.',
    slam: 'It will slam where you stand. Press Dodge as the warning ends.',
    sig: 'It is casting its big move. Hit it with your ability while it casts to stop it.',
    heal: 'It is healing. Press Attack to stop it.',
    summon: 'It is calling help. Press Attack or your ability to stop it.',
    line: 'This hits you wherever you stand. Nothing to dodge: heal up after.',
    hard: 'Nothing stops this one. Get ready for what comes next.',
    dive: 'It dives at you. A stun stops it.',
    stagger: 'Staggered! Press Attack for your Finisher.',
    packHeavy: 'Big foes wind up heavy hits too. Dodge, or Parry as the ring closes.',
    activeKill: 'Played it well: +50% XP.'
  },
  roar: 'It stops listening.',
  enrage: 'The boss is enraged. Finish it fast.',
  fenmother: { intro: 'The fog thickens. Something old is listening.', fall: 'The marsh lets out its breath.' },
  deepTip: 'Parry, dodge and interrupt to earn Oil. Beat a Deep Elder with your own answers and your next draft shows four cards.',
  banner: { heavy: 'PARRY', zone: 'DODGE', slam: 'DODGE', sig: 'INTERRUPT', heal: 'INTERRUPT', summon: 'INTERRUPT', line: 'BRACE', hard: '', dive: '', enrage: 'ENRAGE', fin: 'FINISHER' },
  aria: { heavy: 'Parry now', zone: 'Dodge', slam: 'Dodge', sig: 'Interrupt', heal: 'Interrupt', summon: 'Interrupt', fin: 'Finisher ready' }
};
