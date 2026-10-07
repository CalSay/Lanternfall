// 24d-data-turnfoes: what foes do in turn fights (59k-turn.js). Data only.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// A move is one enemy turn of one or more hits. Every hit can be parried or dodged.
//   { id, name, hits: [{ wind, x, dt, ride }], ranged, charge }
//     wind   seconds of wind-up before that hit lands (a later hit counts from the hit before it): the rhythm to read
//            (owner, 2026-10-02: follow-up hits came "way too fast"; no hit winds up in under 0.6 s, so the dodge window
//            never opens the moment the hit before lands)
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

// Each ordinary foe type's own moves (card foe-moves-by-type, docs/design/foe-moves.md). Zone monsters with their own art
// (59l ZONE_FOES) and bosses keep theirs; a type with no row here (the Coast's, for now) uses the basic pair above.
//   moves   what it does, in turn (it alternates them)        speed  relative to the reference hero (TURN_FOE_SPEED.normal is 0.9)
//   sig     an elite's signature move, in place of TURN_FOE_ELITE        eliteHp  scales the elite's HP (a glass cannon lasts less)
//   ranged  its moves are shots (the type's FOE_BEH.ranged says the same)
// Threat a second matches the basic pair (about 0.18 of the reference HP): slow foes hit big and rarely, fast foes chip.
const TURN_FOE_TYPES = {
  slime: { speed: 0.8,
    moves: [{ id: 'engulf', name: 'Engulf', hits: [{ wind: 1.5, x: 0.24, dt: 'poison' }] },
      { id: 'lash', name: 'Ooze Lash', hits: [{ wind: 1.1, x: 0.11, dt: 'poison' }, { wind: 0.8, x: 0.11, dt: 'poison', ride: 'venom' }] }],
    sig: { id: 'gengulf', name: 'Great Engulf', hits: [{ wind: 1.6, x: 0.34, dt: 'poison', ride: 'venom' }] } },
  bat: { speed: 1.0, eliteHp: 0.4,
    moves: [{ id: 'nip', name: 'Nip', hits: [{ wind: 0.8, x: 0.11 }] },
      { id: 'wingflurry', name: 'Wing Flurry', hits: [{ wind: 0.75, x: 0.07 }, { wind: 0.6, x: 0.07 }, { wind: 0.6, x: 0.07 }] },
      { id: 'dive', name: 'Dive', hits: [{ wind: 0.7, x: 0.11 }, { wind: 0.6, x: 0.11 }] }],
    sig: { id: 'divestorm', name: 'Dive Storm', hits: [{ wind: 0.7, x: 0.08 }, { wind: 0.55, x: 0.08 }, { wind: 0.55, x: 0.08 }, { wind: 0.55, x: 0.08, ride: 'bleed' }] } },
  bones: { speed: 0.95, ranged: true,
    moves: [{ id: 'boneshot', name: 'Bone Shot', ranged: true, hits: [{ wind: 1.1, x: 0.2 }] },
      { id: 'bonevolley', name: 'Bone Volley', ranged: true, hits: [{ wind: 0.9, x: 0.065 }, { wind: 0.65, x: 0.065 }, { wind: 0.65, x: 0.065 }] }],
    sig: { id: 'barrage', name: 'Bone Barrage', ranged: true, hits: [{ wind: 0.9, x: 0.075 }, { wind: 0.6, x: 0.075 }, { wind: 0.6, x: 0.075 }, { wind: 0.6, x: 0.075 }] } },
  beetle: { speed: 0.7,
    moves: [{ id: 'shellbash', name: 'Shell Bash', hits: [{ wind: 1.4, x: 0.27 }] },
      { id: 'mandibles', name: 'Mandibles', hits: [{ wind: 1.1, x: 0.13 }, { wind: 0.8, x: 0.13 }] }],
    sig: { id: 'rollcharge', name: 'Rolling Charge', hits: [{ wind: 1.8, x: 0.42 }] } },
  spore: { speed: 0.9, ranged: true,
    moves: [{ id: 'puff', name: 'Spore Puff', ranged: true, hits: [{ wind: 1.1, x: 0.15, dt: 'poison', ride: 'weaken' }] },
      { id: 'cloud', name: 'Poison Cloud', ranged: true, hits: [{ wind: 1.0, x: 0.1, dt: 'poison' }, { wind: 0.8, x: 0.1, dt: 'poison', ride: 'venom' }] }],
    sig: { id: 'sporestorm', name: 'Spore Storm', ranged: true, hits: [{ wind: 1.0, x: 0.1, dt: 'poison' }, { wind: 0.7, x: 0.1, dt: 'poison' }, { wind: 0.7, x: 0.1, dt: 'poison', ride: 'venom' }] } },
  golem: { speed: 0.6,
    moves: [{ id: 'stonefist', name: 'Stone Fist', hits: [{ wind: 1.5, x: 0.32 }] },
      { id: 'quarryslam', name: 'Quarry Slam', hits: [{ wind: 1.8, x: 0.26 }] }],
    sig: { id: 'quarrysmash', name: 'Quarry Smash', hits: [{ wind: 2.0, x: 0.5 }] } },
  wraith: { speed: 1.0, ranged: true,
    moves: [{ id: 'wail', name: 'Wail', ranged: true, hits: [{ wind: 0.9, x: 0.08, dt: 'frost' }, { wind: 0.7, x: 0.08, dt: 'frost' }] },
      { id: 'chilltouch', name: 'Chill Touch', hits: [{ wind: 1.2, x: 0.17, dt: 'frost', ride: 'chill' }] }],
    sig: { id: 'drownwail', name: 'Drowning Wail', ranged: true, hits: [{ wind: 0.9, x: 0.08, dt: 'frost' }, { wind: 0.65, x: 0.08, dt: 'frost' }, { wind: 0.65, x: 0.08, dt: 'frost', ride: 'chill' }] } }
};
// What answers each type, from the abilities the starters already have (Codex tip; check.mjs holds every id real and every
// starter good against two types or more). `by` lists the abilities of each hero that help against it, and why in `tip`.
const FOE_COUNTERS = {
  slime: { tip: 'Slow and heavy. Burn it: fire hurts a Moss Slime most.', by: { wren: ['pinning'], tobin: ['brace'], pip: ['fire', 'spark'] } },
  bat: { tip: 'Fast chip hits. Guard or Ward soaks them, and parry the last one.', by: { wren: ['shadowstep'], tobin: ['brace', 'ironwill'], pip: ['arcaneward'] } },
  bones: { tip: 'It shoots from afar and has armour. Holy light hurts it most.', by: { wren: ['pinning'], tobin: ['sundering'], pip: ['nova', 'flare'] } },
  beetle: { tip: 'One slow, heavy bash. Stun it, or Chill it twice to Freeze it, before the swing.', by: { wren: ['pinning', 'sonic'], tobin: ['bash'], pip: ['frostshard'] } },
  spore: { tip: 'Poison clouds from afar that Weaken you. Burn it, and Ward off the venom.', by: { wren: ['shadowstep'], tobin: ['ironwill'], pip: ['fire', 'arcaneward'] } },
  golem: { tip: 'The slowest and the hardest hit. Break its armour, or Freeze it.', by: { wren: ['pinning'], tobin: ['sundering'], pip: ['frostshard'] } },
  wraith: { tip: 'Low damage, but it chills. Holy light hurts it most.', by: { wren: ['batswarm'], tobin: ['riposte'], pip: ['nova', 'flare'] } }
};

const TURN_BOSS_SETS = {
  slime: { a: { id: 'engulf', name: 'Engulf', hits: [{ wind: 1.3, x: 0.28, dt: 'poison' }] },
    b: { id: 'lash', name: 'Ooze Lash', hits: [{ wind: 0.9, x: 0.1, dt: 'poison' }, { wind: 0.65, x: 0.1, dt: 'poison' }, { wind: 0.85, x: 0.1, dt: 'poison', ride: 'venom' }] },
    charge: { id: 'swell', name: 'Great Engulf', charge: true, hits: [{ wind: 1.4, x: 0.26, dt: 'poison' }, { wind: 0.6, x: 0.26, dt: 'poison', ride: 'venom' }] },
    c: { id: 'slap', name: 'Split Slap', hits: [{ wind: 0.6, x: 0.14 }, { wind: 1.1, x: 0.14 }] } },
  bat: { a: { id: 'bite', name: 'Rending Bite', hits: [{ wind: 1.15, x: 0.26, ride: 'bleed' }] },
    b: { id: 'flurry', name: 'Wing Flurry', hits: [{ wind: 0.7, x: 0.08 }, { wind: 0.6, x: 0.08 }, { wind: 0.6, x: 0.08 }, { wind: 0.6, x: 0.08 }] },
    charge: { id: 'storm', name: 'Dive Storm', charge: true, hits: [{ wind: 1.2, x: 0.18 }, { wind: 0.65, x: 0.18 }, { wind: 0.9, x: 0.18 }] },
    c: { id: 'shriek', name: 'Shriek', hits: [{ wind: 1.0, x: 0.2, ride: 'blind' }] } },
  bones: { a: { id: 'graveblow', name: 'Grave Blow', hits: [{ wind: 1.4, x: 0.3 }] },
    b: { id: 'volley', name: 'Bone Volley', ranged: true, hits: [{ wind: 0.9, x: 0.09 }, { wind: 0.65, x: 0.09 }, { wind: 0.65, x: 0.09 }] },
    charge: { id: 'crush', name: 'Ossuary Crush', charge: true, hits: [{ wind: 1.5, x: 0.27 }, { wind: 0.7, x: 0.27 }] },
    c: { id: 'rattle', name: 'Rattle', hits: [{ wind: 0.8, x: 0.12 }, { wind: 0.8, x: 0.12, ride: 'weaken' }] } },
  beetle: { a: { id: 'mandibles', name: 'Mandibles', hits: [{ wind: 1.0, x: 0.14 }, { wind: 0.7, x: 0.14 }] },
    b: { id: 'shellbash', name: 'Shell Bash', hits: [{ wind: 1.25, x: 0.28 }] },
    charge: { id: 'erupt', name: 'Erupt', charge: true, hits: [{ wind: 1.7, x: 0.5 }] },
    c: { id: 'thorns', name: 'Thorn Spray', ranged: true, hits: [{ wind: 0.8, x: 0.09 }, { wind: 0.65, x: 0.09 }, { wind: 0.65, x: 0.09, ride: 'bleed' }] } },
  spore: { a: { id: 'burst', name: 'Spore Burst', hits: [{ wind: 0.95, x: 0.12, dt: 'poison' }, { wind: 0.6, x: 0.12, dt: 'poison', ride: 'venom' }] },
    b: { id: 'capslam', name: 'Cap Slam', hits: [{ wind: 1.3, x: 0.27 }] },
    charge: { id: 'bloom', name: 'Spore Storm', charge: true, hits: [{ wind: 1.2, x: 0.11, dt: 'poison' }, { wind: 0.65, x: 0.11, dt: 'poison' }, { wind: 0.65, x: 0.11, dt: 'poison' }, { wind: 0.8, x: 0.11, dt: 'poison', ride: 'venom' }] },
    c: { id: 'choke', name: 'Choking Cloud', ranged: true, hits: [{ wind: 1.1, x: 0.16, dt: 'poison', ride: 'weaken' }] } },
  golem: { a: { id: 'fist', name: 'Stone Fist', hits: [{ wind: 1.35, x: 0.3 }] },
    b: { id: 'combo', name: 'Quarry Combo', hits: [{ wind: 1.0, x: 0.11 }, { wind: 0.6, x: 0.11 }, { wind: 1.2, x: 0.11 }] },
    charge: { id: 'shatter', name: 'Shatter', charge: true, hits: [{ wind: 1.6, x: 0.26 }, { wind: 0.7, x: 0.26 }] },
    c: { id: 'hail', name: 'Pebble Hail', ranged: true, hits: [{ wind: 0.8, x: 0.06 }, { wind: 0.6, x: 0.06 }, { wind: 0.6, x: 0.06 }, { wind: 0.6, x: 0.06 }] } },
  wraith: { a: { id: 'touch', name: 'Chill Touch', hits: [{ wind: 1.1, x: 0.22, dt: 'frost', ride: 'chill' }] },
    b: { id: 'wail', name: 'Wail', ranged: true, hits: [{ wind: 0.9, x: 0.12, dt: 'frost' }, { wind: 0.7, x: 0.12, dt: 'frost' }] },
    charge: { id: 'drown', name: 'Drown', charge: true, hits: [{ wind: 1.3, x: 0.17, dt: 'frost' }, { wind: 0.65, x: 0.17, dt: 'frost' }, { wind: 0.95, x: 0.17, dt: 'frost', ride: 'chill' }] },
    c: { id: 'fade', name: 'Fade Strike', hits: [{ wind: 1.75, x: 0.25, dt: 'frost' }] } },
  // the Hollow's region boss (zone 35): four moves, two charges, harder strings
  fenmother: { a: { id: 'grasp', name: 'Fen Grasp', hits: [{ wind: 1.2, x: 0.3, dt: 'frost', ride: 'chill' }] },
    b: { id: 'reeds', name: 'Reed Lash', hits: [{ wind: 0.8, x: 0.1 }, { wind: 0.6, x: 0.1 }, { wind: 0.7, x: 0.1 }, { wind: 0.6, x: 0.1, ride: 'bleed' }] },
    charge: { id: 'flood', name: 'The Flood', charge: true, hits: [{ wind: 1.4, x: 0.2, dt: 'frost' }, { wind: 0.6, x: 0.2, dt: 'frost' }, { wind: 0.6, x: 0.2, dt: 'frost' }] },
    c: { id: 'lull', name: 'Drowning Lull', ranged: true, hits: [{ wind: 1.6, x: 0.32, dt: 'frost', ride: 'weaken' }] } }
};
// any other boss (the Coast's elders until their turn kits exist, Silas): a fair, hard set
const TURN_BOSS_BASIC = {
  a: { id: 'heavy', name: 'Heavy Blow', hits: [{ wind: 1.3, x: 0.3 }] },
  b: { id: 'combo', name: 'Combo', hits: [{ wind: 0.9, x: 0.1 }, { wind: 0.65, x: 0.1 }, { wind: 0.8, x: 0.1 }] },
  charge: { id: 'smash', name: 'Gathered Smash', charge: true, hits: [{ wind: 1.5, x: 0.27 }, { wind: 0.6, x: 0.27 }] },
  c: { id: 'jab', name: 'Quick Jab', hits: [{ wind: 0.7, x: 0.16 }] }
};
// Boss tricks (card boss-tiers-pr4; docs/design/foe-moves.md "Boss tricks"): the zone bosses from zone 4 (TURN_TUNE.tricks) play these
// sets in place of TURN_BOSS_SETS, so a hero in good gear has to read the fight and not only press on the beat. Same move ids, names and
// (about) the same damage a move as the sets above; what changes is the shape:
//   hold   a delayed hit: it winds up, hangs for `hold` s, then comes. The bar stalls, then runs; press as it runs, not as it stalls.
//   feint  a fake: it winds up like a hit, then the bar breaks and nothing lands. A press at it fools you: the next hit cannot be defended.
//   longer strings and an uneven rhythm (the winds differ along a string)
// A hold is 0.4 s or more (a press on the beat is then always too early) and no hit winds up in under 0.6 s. A Champion (every fifth
// zone, 40-rules bossTierOf) plays its Captain's four moves and a fifth, `d`, its signature string, third in its order.
// Order: Captain a, b, charge, c. Champion a, b, d, charge, c. Zones 4-6 hold only; feints start at TURN_TUNE.tricks.feintFrom.
const TBH = (wind, x, o) => Object.assign({ wind, x }, o);
const TBF = wind => ({ wind, x: 0, feint: true });
const TURN_BOSS_TRICKS = {};
{
  const sets = {
    slime: { a: { id: 'engulf', name: 'Engulf', hits: [TBH(1.0, 0.28, { dt: 'poison', hold: 0.5 })] },
      b: { id: 'lash', name: 'Ooze Lash', hits: [TBH(0.9, 0.075, { dt: 'poison' }), TBH(0.6, 0.075, { dt: 'poison' }), TBF(0.7), TBH(1.0, 0.075, { dt: 'poison' }), TBH(0.6, 0.075, { dt: 'poison', ride: 'venom' })] },
      charge: { id: 'swell', name: 'Great Engulf', charge: true, hits: [TBH(1.4, 0.17, { dt: 'poison', hold: 0.45 }), TBH(0.6, 0.17, { dt: 'poison' }), TBH(0.6, 0.17, { dt: 'poison', ride: 'venom' })] },
      c: { id: 'slap', name: 'Split Slap', hits: [TBH(0.6, 0.09), TBH(0.6, 0.09), TBH(1.1, 0.1, { hold: 0.4 })] },
      d: { id: 'rush', name: 'Smothering Rush', hits: [TBH(0.9, 0.07, { dt: 'poison' }), TBH(0.6, 0.07, { dt: 'poison' }), TBH(0.6, 0.07, { dt: 'poison' }), TBF(0.8), TBH(0.6, 0.07, { dt: 'poison' }), TBH(1.0, 0.07, { dt: 'poison', hold: 0.5 }), TBH(0.6, 0.07, { dt: 'poison', ride: 'venom' })] } },
    bat: { a: { id: 'bite', name: 'Rending Bite', hits: [TBH(1.15, 0.26, { ride: 'bleed', hold: 0.5 })] },
      b: { id: 'flurry', name: 'Wing Flurry', hits: [TBH(0.7, 0.08), TBH(0.6, 0.08), TBF(0.6), TBH(0.6, 0.08), TBH(0.9, 0.08, { hold: 0.4 })] },
      charge: { id: 'storm', name: 'Dive Storm', charge: true, hits: [TBH(1.2, 0.18, { hold: 0.5 }), TBH(0.6, 0.18), TBF(0.6), TBH(0.8, 0.18)] },
      c: { id: 'shriek', name: 'Shriek', hits: [TBH(0.8, 0.1), TBH(1.0, 0.1, { ride: 'blind', hold: 0.45 })] },
      d: { id: 'swarm', name: 'Screech Swarm', hits: [TBH(0.7, 0.07), TBH(0.6, 0.07), TBH(0.6, 0.07), TBF(0.6), TBH(0.6, 0.07), TBH(1.0, 0.07, { hold: 0.5 }), TBH(0.6, 0.07, { ride: 'bleed' })] } },
    bones: { a: { id: 'graveblow', name: 'Grave Blow', hits: [TBH(1.4, 0.3, { hold: 0.55 })] },
      b: { id: 'volley', name: 'Bone Volley', ranged: true, hits: [TBH(0.9, 0.07), TBH(0.6, 0.07), TBF(0.6), TBH(0.6, 0.07), TBH(0.9, 0.07, { hold: 0.4 })] },
      charge: { id: 'crush', name: 'Ossuary Crush', charge: true, hits: [TBH(1.5, 0.18, { hold: 0.5 }), TBH(0.7, 0.18), TBH(0.7, 0.18)] },
      c: { id: 'rattle', name: 'Rattle', hits: [TBH(0.8, 0.08), TBH(0.6, 0.08), TBH(0.8, 0.08, { ride: 'weaken' })] },
      d: { id: 'rain', name: 'Bone Rain', ranged: true, hits: [TBH(0.9, 0.07), TBH(0.6, 0.07), TBH(0.6, 0.07), TBF(0.6), TBH(0.6, 0.07), TBH(1.0, 0.07, { hold: 0.5 }), TBH(0.6, 0.07)] } },
    beetle: { a: { id: 'mandibles', name: 'Mandibles', hits: [TBH(1.0, 0.1), TBH(0.6, 0.09), TBH(0.9, 0.09, { hold: 0.4 })] },
      b: { id: 'shellbash', name: 'Shell Bash', hits: [TBH(1.25, 0.28, { hold: 0.55 })] },
      charge: { id: 'erupt', name: 'Erupt', charge: true, hits: [TBH(1.7, 0.25, { hold: 0.5 }), TBH(0.7, 0.25)] },
      c: { id: 'thorns', name: 'Thorn Spray', ranged: true, hits: [TBH(0.8, 0.07), TBH(0.6, 0.07), TBF(0.6), TBH(0.6, 0.07), TBH(0.9, 0.06, { ride: 'bleed' })] },
      d: { id: 'stampede', name: 'Stampede', hits: [TBH(1.0, 0.07), TBH(0.6, 0.07), TBH(0.6, 0.07), TBF(0.7), TBH(0.6, 0.07), TBH(1.1, 0.07, { hold: 0.5 }), TBH(0.6, 0.07)] } },
    spore: { a: { id: 'burst', name: 'Spore Burst', hits: [TBH(0.95, 0.08, { dt: 'poison' }), TBH(0.6, 0.08, { dt: 'poison' }), TBH(0.9, 0.08, { dt: 'poison', ride: 'venom', hold: 0.4 })] },
      b: { id: 'capslam', name: 'Cap Slam', hits: [TBH(1.3, 0.27, { hold: 0.5 })] },
      charge: { id: 'bloom', name: 'Spore Storm', charge: true, hits: [TBH(1.2, 0.11, { dt: 'poison' }), TBH(0.65, 0.11, { dt: 'poison' }), TBF(0.65), TBH(0.65, 0.11, { dt: 'poison' }), TBH(0.9, 0.11, { dt: 'poison', ride: 'venom', hold: 0.45 })] },
      c: { id: 'choke', name: 'Choking Cloud', ranged: true, hits: [TBH(0.9, 0.08, { dt: 'poison' }), TBH(1.0, 0.08, { dt: 'poison', ride: 'weaken', hold: 0.4 })] },
      d: { id: 'sporebloom', name: 'Deathcap Bloom', ranged: true, hits: [TBH(0.9, 0.07, { dt: 'poison' }), TBH(0.6, 0.07, { dt: 'poison' }), TBF(0.6), TBH(0.6, 0.07, { dt: 'poison' }), TBH(0.6, 0.07, { dt: 'poison' }), TBH(1.0, 0.07, { dt: 'poison', hold: 0.5 }), TBH(0.6, 0.07, { dt: 'poison', ride: 'venom' })] } },
    golem: { a: { id: 'fist', name: 'Stone Fist', hits: [TBH(1.35, 0.3, { hold: 0.55 })] },
      b: { id: 'combo', name: 'Quarry Combo', hits: [TBH(1.0, 0.08), TBH(0.6, 0.08), TBF(0.6), TBH(1.2, 0.08), TBH(0.6, 0.08)] },
      charge: { id: 'shatter', name: 'Shatter', charge: true, hits: [TBH(1.6, 0.17, { hold: 0.5 }), TBH(0.7, 0.17), TBH(0.7, 0.17)] },
      c: { id: 'hail', name: 'Pebble Hail', ranged: true, hits: [TBH(0.8, 0.05), TBH(0.6, 0.05), TBH(0.6, 0.05), TBF(0.6), TBH(0.7, 0.05), TBH(0.6, 0.05)] },
      d: { id: 'avalanche', name: 'Avalanche', hits: [TBH(1.0, 0.07), TBH(0.6, 0.07), TBH(0.6, 0.07), TBF(0.7), TBH(0.6, 0.07), TBH(1.2, 0.07, { hold: 0.5 }), TBH(0.6, 0.07)] } },
    wraith: { a: { id: 'touch', name: 'Chill Touch', hits: [TBH(1.1, 0.22, { dt: 'frost', ride: 'chill', hold: 0.5 })] },
      b: { id: 'wail', name: 'Wail', ranged: true, hits: [TBH(0.9, 0.08, { dt: 'frost' }), TBH(0.7, 0.08, { dt: 'frost' }), TBF(0.8), TBH(0.9, 0.08, { dt: 'frost', hold: 0.4 })] },
      charge: { id: 'drown', name: 'Drown', charge: true, hits: [TBH(1.3, 0.13, { dt: 'frost', hold: 0.45 }), TBH(0.65, 0.13, { dt: 'frost' }), TBH(0.65, 0.13, { dt: 'frost' }), TBH(0.9, 0.13, { dt: 'frost', ride: 'chill' })] },
      c: { id: 'fade', name: 'Fade Strike', hits: [TBH(1.2, 0.25, { dt: 'frost', hold: 0.6 })] },
      d: { id: 'banshee', name: 'Banshee Wail', ranged: true, hits: [TBH(0.9, 0.07, { dt: 'frost' }), TBH(0.6, 0.07, { dt: 'frost' }), TBH(0.6, 0.07, { dt: 'frost' }), TBF(0.7), TBH(0.6, 0.07, { dt: 'frost' }), TBH(1.0, 0.07, { dt: 'frost', hold: 0.5 }), TBH(0.6, 0.07, { dt: 'frost', ride: 'chill' })] } }
  };
  for (const k in sets) { const { d, ...cap } = sets[k]; TURN_BOSS_TRICKS[k] = { captain: cap, champion: { ...cap, d } }; }
}
// Speed relative to the reference hero (1.0 = Speed 10): foes without their own
const TURN_FOE_SPEED = { normal: 0.9, ranged: 0.95, elite: 1.0, boss: 1.05, region: 1.1 };
// Fight length in the hero's ordinary Attack actions at zone-ready power (the C22 contract's HP budgets)
const TURN_FOE_HP = { zoneFoe: 4, normal: 5, elite: 9, boss: 16, region: 30 };
// Early foes take at least 3 hits (card early-foes-three-hits; Cal's play note #18: zone 1-6 foes fell to one hit). By zone 1 to 6, the
// fewest plain Attacks of the hero who meets it that a normal foe's HP may be (59k turnFoeSetup), whatever level the hero reaches the
// zone at. 6 to 8 plain Attacks is 3 or 4 hero turns once an opening ability and a parry counter land (walk, seed 1: 4 of 28 kills
// under 3 turns, mean 3.6). Elites, bosses, the Deepwell and the Provings keep their own HP.
const TURN_EARLY_FOE_HITS = [6, 8, 8, 8, 8, 8];

// Elite traits in turn fights (owner, 2026-10-02): one per elite, from zone COMBAT_TUNE.eliteFrom (59k turnFoeSetup).
// Names and badges are the old traits' (ELITE_TRAITS, 21g); these are their turn rules and the line the first one shows.
//   shielded  a shield of `share` of its max HP takes hits first; a hit of `heavy` of its max HP or more counts twice on it
//   vampiric  heals `heal` of the damage its landed hits do, unless it is Cursed or carries `stop` Bleed
//   enraged   below half HP it is `spd` faster and hits `dmg` harder (still never more than 2 turns in a row)
//   frozen    its ice halves every hit but fire; fire hits it x`fire` and breaks the ice
//   cursed    its landed hits Weaken you; holy damage hurts it x`holy`
const TURN_TRAITS = {
  shielded: { share: 0.3, heavy: 0.08, first: 'Shielded elite: its shield soaks your hits first. Big hits break it twice as fast.' },
  vampiric: { heal: 0.5, stop: 3, first: 'Leeching elite: it heals from every hit it lands. Curse it, or stack 3 Bleed, to stop it.' },
  enraged: { spd: 1.3, dmg: 1.2, first: 'Enraged elite: under half health it gets faster and hits harder. Chill slows it.' },
  frozen: { resist: 0.5, fire: 1.5, first: 'Ice-Clad elite: its ice halves your damage. Fire breaks the ice.' },
  cursed: { holy: 1.5, first: 'Cursed elite: its hits Weaken you. Holy damage hurts it more.' }
};
