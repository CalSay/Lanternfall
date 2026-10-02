// 24d-data-turnfoes: what foes do in turn fights (59k-turn.js). Data only.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// A move is one enemy turn of one or more hits. Every hit can be parried or dodged.
//   { id, name, hits: [{ wind, x, dt, ride }], ranged, charge }
//     wind   seconds of wind-up before that hit lands (a later hit counts from the hit before it): the rhythm to read
//     x      damage as a share of the zone's reference hero HP (59k turnRefHp), before armour and Guard
//     dt     damage type ('phys' default); ride: a status on the hero when that hit lands ('bleed', 'burn', 'venom',
//            'chill', 'weaken', 'blind')
//     charge the boss spends one turn gathering it (no damage) and lets it go on its next turn. Stun or Freeze it, or
//            hit it for TURN_TUNE.chargeBreak of its max HP in between, and it is broken (59k)
// Zone monsters with their own art (59l ZONE_FOES) bring their own moves. Every other normal foe uses TURN_FOE_BASIC
// (an elite adds TURN_FOE_ELITE). A zone boss uses TURN_BOSS_SETS[its BOSS_KITS id] (else TURN_BOSS_BASIC): its moves
// in turn are a, b, the charge, then c, and again. Below half HP it speeds up (TURN_TUNE.bossPhaseSpd).
// Numbers follow the C22 contract (docs/design/enemies-c22-final-contract.md): a normal move is about 20% of the
// reference HP, split across its hits; bosses hit harder and in longer strings (owner, 2026-10-02: genuinely hard).

const TURN_FOE_BASIC = [
  { id: 'strike', name: 'Strike', hits: [{ wind: 1.0, x: 0.2 }] },
  { id: 'flurry', name: 'Flurry', hits: [{ wind: 0.95, x: 0.1 }, { wind: 0.65, x: 0.1 }] }
];
const TURN_FOE_RANGED = [
  { id: 'shot', name: 'Shot', ranged: true, hits: [{ wind: 1.05, x: 0.2 }] },
  { id: 'twin', name: 'Twin Shot', ranged: true, hits: [{ wind: 0.9, x: 0.1 }, { wind: 0.75, x: 0.1 }] }
];
const TURN_FOE_ELITE = { id: 'crush', name: 'Crushing Blow', hits: [{ wind: 1.35, x: 0.27 }] };

const TURN_BOSS_SETS = {
  slime: { a: { id: 'engulf', name: 'Engulf', hits: [{ wind: 1.3, x: 0.28, dt: 'poison' }] },
    b: { id: 'lash', name: 'Ooze Lash', hits: [{ wind: 0.9, x: 0.1, dt: 'poison' }, { wind: 0.5, x: 0.1, dt: 'poison' }, { wind: 0.85, x: 0.1, dt: 'poison', ride: 'venom' }] },
    charge: { id: 'swell', name: 'Great Engulf', charge: true, hits: [{ wind: 1.4, x: 0.26, dt: 'poison' }, { wind: 0.6, x: 0.26, dt: 'poison', ride: 'venom' }] },
    c: { id: 'slap', name: 'Split Slap', hits: [{ wind: 0.6, x: 0.14 }, { wind: 1.1, x: 0.14 }] } },
  bat: { a: { id: 'bite', name: 'Rending Bite', hits: [{ wind: 1.15, x: 0.26, ride: 'bleed' }] },
    b: { id: 'flurry', name: 'Wing Flurry', hits: [{ wind: 0.7, x: 0.08 }, { wind: 0.35, x: 0.08 }, { wind: 0.35, x: 0.08 }, { wind: 0.6, x: 0.08 }] },
    charge: { id: 'storm', name: 'Dive Storm', charge: true, hits: [{ wind: 1.2, x: 0.18 }, { wind: 0.5, x: 0.18 }, { wind: 0.9, x: 0.18 }] },
    c: { id: 'shriek', name: 'Shriek', hits: [{ wind: 1.0, x: 0.2, ride: 'blind' }] } },
  bones: { a: { id: 'graveblow', name: 'Grave Blow', hits: [{ wind: 1.4, x: 0.3 }] },
    b: { id: 'volley', name: 'Bone Volley', ranged: true, hits: [{ wind: 0.9, x: 0.09 }, { wind: 0.45, x: 0.09 }, { wind: 0.45, x: 0.09 }] },
    charge: { id: 'crush', name: 'Ossuary Crush', charge: true, hits: [{ wind: 1.5, x: 0.27 }, { wind: 0.7, x: 0.27 }] },
    c: { id: 'rattle', name: 'Rattle', hits: [{ wind: 0.8, x: 0.12 }, { wind: 0.8, x: 0.12, ride: 'weaken' }] } },
  beetle: { a: { id: 'mandibles', name: 'Mandibles', hits: [{ wind: 1.0, x: 0.14 }, { wind: 0.55, x: 0.14 }] },
    b: { id: 'shellbash', name: 'Shell Bash', hits: [{ wind: 1.25, x: 0.28 }] },
    charge: { id: 'erupt', name: 'Erupt', charge: true, hits: [{ wind: 1.7, x: 0.5 }] },
    c: { id: 'thorns', name: 'Thorn Spray', ranged: true, hits: [{ wind: 0.8, x: 0.09 }, { wind: 0.5, x: 0.09 }, { wind: 0.5, x: 0.09, ride: 'bleed' }] } },
  spore: { a: { id: 'burst', name: 'Spore Burst', hits: [{ wind: 0.95, x: 0.12, dt: 'poison' }, { wind: 0.6, x: 0.12, dt: 'poison', ride: 'venom' }] },
    b: { id: 'capslam', name: 'Cap Slam', hits: [{ wind: 1.3, x: 0.27 }] },
    charge: { id: 'bloom', name: 'Spore Storm', charge: true, hits: [{ wind: 1.2, x: 0.11, dt: 'poison' }, { wind: 0.45, x: 0.11, dt: 'poison' }, { wind: 0.45, x: 0.11, dt: 'poison' }, { wind: 0.8, x: 0.11, dt: 'poison', ride: 'venom' }] },
    c: { id: 'choke', name: 'Choking Cloud', ranged: true, hits: [{ wind: 1.1, x: 0.16, dt: 'poison', ride: 'weaken' }] } },
  golem: { a: { id: 'fist', name: 'Stone Fist', hits: [{ wind: 1.35, x: 0.3 }] },
    b: { id: 'combo', name: 'Quarry Combo', hits: [{ wind: 1.0, x: 0.11 }, { wind: 0.4, x: 0.11 }, { wind: 1.2, x: 0.11 }] },
    charge: { id: 'shatter', name: 'Shatter', charge: true, hits: [{ wind: 1.6, x: 0.26 }, { wind: 0.55, x: 0.26 }] },
    c: { id: 'hail', name: 'Pebble Hail', ranged: true, hits: [{ wind: 0.8, x: 0.06 }, { wind: 0.35, x: 0.06 }, { wind: 0.35, x: 0.06 }, { wind: 0.35, x: 0.06 }] } },
  wraith: { a: { id: 'touch', name: 'Chill Touch', hits: [{ wind: 1.1, x: 0.22, dt: 'frost', ride: 'chill' }] },
    b: { id: 'wail', name: 'Wail', ranged: true, hits: [{ wind: 0.9, x: 0.12, dt: 'frost' }, { wind: 0.7, x: 0.12, dt: 'frost' }] },
    charge: { id: 'drown', name: 'Drown', charge: true, hits: [{ wind: 1.3, x: 0.17, dt: 'frost' }, { wind: 0.5, x: 0.17, dt: 'frost' }, { wind: 0.95, x: 0.17, dt: 'frost', ride: 'chill' }] },
    c: { id: 'fade', name: 'Fade Strike', hits: [{ wind: 1.75, x: 0.25, dt: 'frost' }] } },
  // the Hollow's region boss (zone 35): four moves, two charges, harder strings
  fenmother: { a: { id: 'grasp', name: 'Fen Grasp', hits: [{ wind: 1.2, x: 0.3, dt: 'frost', ride: 'chill' }] },
    b: { id: 'reeds', name: 'Reed Lash', hits: [{ wind: 0.8, x: 0.1 }, { wind: 0.4, x: 0.1 }, { wind: 0.7, x: 0.1 }, { wind: 0.4, x: 0.1, ride: 'bleed' }] },
    charge: { id: 'flood', name: 'The Flood', charge: true, hits: [{ wind: 1.4, x: 0.2, dt: 'frost' }, { wind: 0.6, x: 0.2, dt: 'frost' }, { wind: 0.6, x: 0.2, dt: 'frost' }] },
    c: { id: 'lull', name: 'Drowning Lull', ranged: true, hits: [{ wind: 1.6, x: 0.32, dt: 'frost', ride: 'weaken' }] } }
};
// any other boss (the Coast's elders until their turn kits exist, Silas): a fair, hard set
const TURN_BOSS_BASIC = {
  a: { id: 'heavy', name: 'Heavy Blow', hits: [{ wind: 1.3, x: 0.28 }] },
  b: { id: 'combo', name: 'Combo', hits: [{ wind: 0.9, x: 0.1 }, { wind: 0.5, x: 0.1 }, { wind: 0.8, x: 0.1 }] },
  charge: { id: 'smash', name: 'Gathered Smash', charge: true, hits: [{ wind: 1.5, x: 0.27 }, { wind: 0.6, x: 0.27 }] },
  c: { id: 'jab', name: 'Quick Jab', hits: [{ wind: 0.7, x: 0.16 }] }
};
// Speed relative to the reference hero (1.0 = Speed 10): foes without their own
const TURN_FOE_SPEED = { normal: 0.9, ranged: 0.95, elite: 1.0, boss: 1.05, region: 1.1 };
// Fight length in the hero's ordinary Attack actions at zone-ready power (the C22 contract's HP budgets)
const TURN_FOE_HP = { zoneFoe: 4, normal: 5, elite: 9, boss: 16, region: 30 };
