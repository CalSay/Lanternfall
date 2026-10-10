// 59l-zone-foes: the C22 roster's zone monsters, one zone at a time as their approved art lands
// (docs/design/enemies-c22-hollow-final.md; art in 64j-foe-art.js).
// The first is the Thorn Imp in zone 1 (owner, 2026-10-01). A zone monster is a skin over the zone's foe type: it keeps
// that type's index for the systems keyed by type (mastery, trophies, bounties, the Codex) and its damage-type row
// (the Imp: the Moss Slime's plant row, weak to fire 1.5x and resisting poison 0.6x, as the roster asks), and brings
// its own name, art and, in turn fights (59k), its own moves.
//   ZONE_FOES[z] -> { key, name, speed, armour, moves }   key: the art key (FOE_ART). speed: relative to the reference
//        hero (1 = Speed 10); armour: its physical damage reduction. moves: the foe's moves in order (it alternates them);
//        each { id, name, hits: [{ wind, x }] }: wind, the seconds of anticipation before that contact (the parry and
//        dodge windows close on it); x, its damage as a share of the zone's reference hero HP (59k turnRefHp, not the
//        player's HP). Every hit is its own parry or dodge.
//        A move's anim names its action in the approved pack (FOE_ART, 21za); its winds then come from the pack's own
//        timing (zoneFoeWinds), so each parry window closes on the frame where the blade lands: the first hit adds the
//        hop in (the foe hops to you, then attacks); a later hit counts from the contact before it.
//        ranged: a projectile move (no hop): its wind runs to the release frame, then flight seconds to the hero.
//        row: the foe type whose weakness row it uses when that differs from its zone's slot (59a typeX).
//   zoneFoeSkin(f, z)   cbSpawn (59-combat): make a regular foe of zone z that zone's monster (no-op elsewhere). In a
//        legacy fight a skinned foe resets after every attack (owner, 2026-10-02): hop in, attack, hop home, a rest of
//        ZONE_FOE_REST s, then the next. Its swings come no faster than that cycle (zoneFoeCycle), and each hits harder by
//        as much, so the approved timings play in full at the same damage a second.
//   zoneFoeOf(f) -> the ZONE_FOES entry of a skinned foe, or null
//   zoneFoeDeathS(f) -> seconds its death animation runs (50-sim waits that long before the next foe), or 0
const ZONE_FOES = {
  1: { key: 'imp', name: 'Thorn Imp', speed: 0.9, armour: 0,
    moves: [
      { id: 'jab', name: 'Briar Jab', anim: 'jab', hits: [{ wind: 1.61, x: 0.2 }] },
      // its two cuts land 0.88 s after the hop and 1.0 s apart (the owner-approved animation, 2026-10-02)
      { id: 'cross', name: 'Crosscut', anim: 'crosscut', hits: [{ wind: 1.61, x: 0.1 }, { wind: 1.0, x: 0.1 }] }
    ] },
  // Gloomjaw (owner-approved pack, 2026-10-02). Spit the Light is a dark void bolt (owner); the roster's numbers stand.
  // It takes the Moss Slime's plant row (weak to fire, resists poison) over zone 2's Cave Bat slot.
  2: { key: 'gloomjaw', name: 'Gloomjaw', speed: 0.8, armour: 0.05, row: 'slime',
    moves: [
      { id: 'snap', name: 'Snap Shut', anim: 'snap-shut', hits: [{ wind: 1.61, x: 0.22 }] },
      { id: 'bolt', name: 'Spit the Light', anim: 'void-bolt', ranged: true, flight: 0.35, hits: [{ wind: 1.4, x: 0.2 }] }
    ] }
};
// ms of frames a..b-1 of an action (one-based)
const zoneFoeMs = (A, a, b) => { let t = 0; for (let i = a; i < b; i++) t += A.f[i - 1][0]; return t; };
function zoneFoeWinds(key, move) {
  const P = typeof FOE_ART === 'object' && FOE_ART[key], A = P && P.acts[move.anim], hop = P && P.acts.hop;
  if (!A || !hop || (!move.ranged && A.con.length !== move.hits.length)) return;
  if (move.ranged) { if (A.rel.length && move.hits.length === 1) move.hits[0].wind = zoneFoeMs(A, A.start, A.rel[0]) / 1000 + (move.flight || 0); return; }
  move.hits.forEach((h, i) => {
    h.wind = (i ? zoneFoeMs(A, A.con[i - 1], A.con[i]) : zoneFoeMs(hop, 1, hop.f.length + 1) + zoneFoeMs(A, A.start, A.con[0])) / 1000;
  });
}
for (const z in ZONE_FOES) for (const m of ZONE_FOES[z].moves) if (m.anim) zoneFoeWinds(ZONE_FOES[z].key, m);
function zoneFoeSkin(f, z) {
  const Z = ZONE_FOES[z];
  if (!f || !Z || f.boss || f.elite) return f;
  f.skin = Z.key; f.name = Z.name;
  if (!Z.kit || (typeof FOE_ART === 'object' && FOE_ART[Z.key])) f.key = Z.key + zoneCycle(z);   // a kit with no pack yet keeps its slot type's look
  if (Z.row) f.txRow = Z.row;   // (f.row is its lane)
  if (Z.kit) f.armoured = Z.armour > 0;   // a kit's own armour, not its slot type's (59-combat, legacy fights)
  const cyc = zoneFoeCycle(Z);
  if (cyc > 0 && f.spd > 0 && 1 / f.spd < cyc) { const k = cyc * f.spd; f.spd /= k; f.atk *= k; }
  return f;
}
function zoneFoeOf(f) {
  if (!f || !f.skin) return null;
  for (const z in ZONE_FOES) if (ZONE_FOES[z].key === f.skin) return ZONE_FOES[z];
  return null;
}
function zoneFoeDeathS(f) {
  const P = f && f.skin && typeof FOE_ART === 'object' && FOE_ART[f.skin], D = P && P.acts.death;
  return D ? zoneFoeMs(D, 1, D.f.length + 1) / 1000 : 0;
}
// The legacy swing period that plays every one-hit move as a full reset cycle when they alternate (as 62-stage plays
// them): the most, over each move and the next, of the first's tail (its hit to its last frame, then its hop home) plus
// the rest plus the next's lead (its hop in, then its first frame to its hit; a projectile needs no hop, its hit is its
// landing).
const ZONE_FOE_REST = 0.6;
function zoneFoeCycle(Z) {
  const P = Z && typeof FOE_ART === 'object' && FOE_ART[Z.key]; if (!P) return 0;
  const hop = P.acts.hop ? zoneFoeMs(P.acts.hop, 1, P.acts.hop.f.length + 1) : 0;
  const L = Z.moves.filter(m => m.hits.length === 1 && P.acts[m.anim]).map(m => {
    const A = P.acts[m.anim], all = zoneFoeMs(A, A.start, A.end + 1), h = m.ranged ? 0 : hop;
    const lead = m.ranged && A.rel.length ? zoneFoeMs(A, A.start, A.rel[0]) + (m.flight || 0) * 1000 : A.con.length ? zoneFoeMs(A, A.start, A.con[0]) : all;
    return { lead: h + lead, tail: Math.max(0, all - lead) + h + ZONE_FOE_REST * 1000 };
  });
  let c = 0;
  for (let i = 0; i < L.length; i++) c = Math.max(c, L[i].tail + L[(i + 1) % L.length].lead);
  return c / 1000;
}

// ---------------- the first hour's foe kits (card ns-foe-kits-z1-10; docs/design/new-style/plan.md 4.1 and 8.1) ----------------
// The roster's (enemies-c22-hollow-final.md) zone 3-10 monsters, the zone 1-10 Shadowborn Captains and the two Champions, as
// fight data. Each area stays off (ZONE_FOE_TUNE.on, by area: 0 Mossy Hollow, zones 1-5; 1 Batwing Caves, zones 6-10) until its
// wire card brings its art; off, the game plays exactly as before. zoneFoeArea(a, on) turns one on or off at runtime (tests).
//   ZONE_FOE_KITS[z]   { monster, captain, champion }, any of them
//     monster    a ZONE_FOES row (above) plus hp: its roster HP in ordinary actions (the game's are hpX longer, the Imp's 4
//                against its 3). key: the art key its pack will carry; until FOE_ART has it, the foe keeps its slot type's look.
//     captain    { name, speed, look, extra }: the zone's monster, recoloured (look: the roster's marking, for its art card),
//                its two moves then the extra one (the roster's Captain script 1, 2, 3)
//     champion   { name, speed, armour, row, moves: [a, b, charge, c], phase: { i, move } }: below TURN_TUNE.bossPhaseAt it
//                plays phase.move in place of moves[i] (the roster's phase change; the damage stays)
//   A hit is { wind, x, dt, ride, hold, feint } as in 24d. The roster's rhythm words: slow 1.1 to 1.2 s, then 1.0; fast and
//   quick 0.6 (0.8 on a move's first hit); even 0.85; delayed adds a hold of 0.45 to 0.5 s, a long delay 0.6 to 0.7; a harmless
//   lift or pulse is a feint. A move plays the tricks only where today's zone bosses do (zoneFoeShape): an ordinary monster
//   never holds or feints (a hold joins its wind); a Captain or Champion holds from TURN_TUNE.tricks.from and feints from
//   tricks.feintFrom. A feint that is not played adds 0.4 s to the next hit, as a hold where holds play, else as wind (the
//   lift still shows, it just cannot fool you).
//   ZONE_FOE_ROWS      weakness rows the foe types lack (59a txOf reads them by txRow): fire / frost, holy / frost
//   ZONE_FOE_TUNE      on: by area. parity: 1 holds each kit to the damage a turn and the length of the fight it replaces
//                      (the roster's numbers are "design targets ... need joint calibration"): a monster to its slot type's
//                      moves, a Captain or Champion to today's zone boss script, so the fitted boss knots and the difficulty
//                      budget stay where they are; 0 plays the roster's numbers raw. hpX: roster actions -> reference Attacks.
//   zoneFoeBoss(z, script, spd, arm) -> { name, script, script2, spd, arm, row, tier } or null   (59k turnFoeSetup: a zone
//                      boss's Captain or Champion kit, given today's script, Speed and armour for parity)
// A zone whose boss is a Champion (zones 5 and 10, 40-rules bossTierOf) keeps its Captain in ZONE_FOE_KITS only: the game has
// no Captain fight there yet, so ZONE_FOES[z].captain (and its story banner, 55-story) stays unset.
const ZONE_FOE_TUNE = { on: [0, 0], parity: 1, hpX: 4 / 3,
  // fit[z] = [HP, Wren's damage, Tobin's, Pip's] on top of a boss kit's parity, fitted on the budget's first-hour rows (tools/budget.mjs;
  // docs/proof/ns-foe-kits-z1-10/report.md): HP holds the played-well fight length (a kit's one- to three-hit moves are parried in full
  // more often than today's trick strings, and a full parry earns a counter), each hero's damage holds that hero's casual win rate, so the
  // heroes' spread stays as today's. Zones 2 to 4 sit at 100% either way and keep damage parity; zone 2 has no row and takes zone 1's
  // length; zone 4 is held to its rally gates (no HP brings its turns back) and takes zone 6's length.
  fit: { 1: [1.13, 0.67, 1, 1], 2: [1.13, 1, 1, 1], 3: [0.92, 1, 1, 1], 4: [1.8, 1, 1, 1], 5: [1, 0.93, 1.33, 0.88], 6: [1.82, 0.8, 0.88, 0.76],
    7: [1.8, 0.94, 1.23, 0.95], 8: [1.66, 0.83, 1.11, 0.83], 9: [1.75, 0.86, 1.4, 1.11], 10: [1, 1.25, 1.16, 1.38] } };
const ZONE_FOE_ROWS = {
  'zf-fire-frost': { region: 'hollow', weak: 'fire', res: ['frost'] },
  'zf-holy-frost': { region: 'hollow', weak: 'holy', res: ['frost'] }
};
const ZFH = (wind, x, o) => Object.assign({ wind, x }, o);
const ZFF = wind => ({ wind, x: 0, feint: true });
const ZONE_FOE_KITS = {
  1: { captain: { name: 'Crownthorn Imp', speed: 0.95, look: 'ivory mask and crimson blade edges',
    extra: { id: 'royalrip', name: 'Royal Rip', hits: [ZFH(1.1, 0.08), ZFH(1.0, 0.08), ZFH(0.6, 0.08)] } } },
  2: { captain: { name: 'Gloomjaw Lightgorged', speed: 0.85, look: 'pale jaw plates and a double throat ring',
    extra: { id: 'volley', name: 'Gorged Volley', ranged: true, hits: [ZFH(1.2, 0.13, { dt: 'holy' }), ZFH(0.8, 0.13, { dt: 'holy', hold: 0.5 })] } } },
  3: { monster: { key: 'ravager', name: 'Briarbound Ravager', speed: 0.75, armour: 0.1, row: 'slime', hp: 3,
      moves: [{ id: 'cleaver', name: 'Cleaver Drop', hits: [ZFH(1.0, 0.23, { hold: 0.45 })] },
        { id: 'backhand', name: 'Thorn Backhand', hits: [ZFH(1.2, 0.1), ZFH(0.6, 0.1)] }] },
    captain: { name: 'Briarbound Headsman', speed: 0.8, look: 'white armour seams and a red cleaver tip',
      extra: { id: 'sentence', name: 'Sentence', hits: [ZFF(0.8), ZFF(0.6), ZFH(1.0, 0.28, { hold: 0.6 })] } } },
  4: { monster: { key: 'thornwing', name: 'Thornwing', speed: 1.1, armour: 0, row: 'zf-fire-frost', hp: 3,
      moves: [{ id: 'needle', name: 'Wing Needle', hits: [ZFH(1.0, 0.2)] },
        { id: 'scissor', name: 'Scissor Flight', hits: [ZFH(0.8, 0.1), ZFH(0.6, 0.1, { hold: 0.45 })] }] },
    captain: { name: 'Thornwing Razorcrown', speed: 1.15, look: 'bone-white wing margins and a split face mark',
      extra: { id: 'triple', name: 'Triple Scissor', hits: [ZFH(0.8, 0.08), ZFH(1.0, 0.08), ZFH(0.6, 0.08)] } } },
  5: { monster: { key: 'nightseed', name: 'Nightseed Sorcerer', speed: 0.9, armour: 0, row: 'slime', hp: 3,
      moves: [{ id: 'rootlance', name: 'Root Lance', hits: [ZFH(1.1, 0.21)] },
        { id: 'seedpulse', name: 'Seed Pulse', hits: [ZFH(0.85, 0.1, { dt: 'poison' }), ZFH(0.85, 0.1, { dt: 'poison' })] }] },
    captain: { name: 'Nightseed Hexarch', speed: 0.95, look: 'gold heart veins and black claw tips',
      extra: { id: 'germinate', name: 'Dark Germination', hits: [ZFH(1.0, 0.26, { dt: 'poison', ride: 'venom', hold: 0.5 })] } },
    champion: { name: 'The Briar Regent', speed: 0.85, armour: 0.1, row: 'slime',
      moves: [{ id: 'royalcut', name: 'Royal Cut', hits: [ZFH(1.0, 0.32, { hold: 0.5 })] },
        { id: 'court', name: 'Court of Thorns', hits: [ZFH(1.1, 0.1), ZFH(1.0, 0.1), ZFH(0.6, 0.1)] },
        { id: 'lance', name: 'Sovereign Lance', charge: true, hits: [ZFH(1.2, 0.28), ZFH(0.8, 0.28, { hold: 0.5 })] },
        { id: 'crownfall', name: 'Crownfall', hits: [ZFH(0.8, 0.14), ZFH(0.7, 0.14, { hold: 0.45 })] }],
      // the shoulder-throne opens: Royal Cut lifts its blade first (a harmless lift), then cuts as before
      phase: { i: 0, move: { id: 'royalcut', name: 'Royal Cut', hits: [ZFF(0.8), ZFH(1.0, 0.32, { hold: 0.5 })] } } } },
  6: { monster: { key: 'riftwing', name: 'Riftwing', speed: 1.15, armour: 0, row: 'zf-holy-frost', hp: 4,
      moves: [{ id: 'crescent', name: 'Crescent Dive', hits: [ZFH(1.2, 0.12), ZFH(0.6, 0.14)] },
        { id: 'descent', name: 'False Descent', hits: [ZFF(0.8), ZFH(1.0, 0.26)] }] },
    captain: { name: 'Riftwing Moonsunder', speed: 1.2, look: 'silver wing rims and a split chest ring',
      extra: { id: 'brokenring', name: 'Broken Ring', hits: [ZFH(1.2, 0.1), ZFH(0.6, 0.1), ZFH(0.8, 0.1, { hold: 0.5 })] } } },
  7: { monster: { key: 'mawcantor', name: 'Maw Cantor', speed: 0.9, armour: 0, row: 'bones', hp: 4,
      moves: [{ id: 'ribspear', name: 'Rib Spear', hits: [ZFH(1.2, 0.28)] },
        { id: 'hymn', name: 'Hollow Hymn', hits: [ZFH(1.1, 0.08, { dt: 'holy' }), ZFH(1.0, 0.08, { dt: 'holy' }), ZFH(0.6, 0.08, { dt: 'holy' })] }] },
    captain: { name: 'Maw Cantor Throatriven', speed: 0.95, look: 'white teeth and a crimson mouth border',
      extra: { id: 'rivenhymn', name: 'Riven Hymn', hits: [ZFH(0.8, 0.11, { dt: 'holy' }), ZFH(0.8, 0.11, { dt: 'holy', hold: 0.6 }), ZFH(0.6, 0.11, { dt: 'holy' })] } } },
  8: { monster: { key: 'devourer', name: 'Cave Devourer', speed: 0.8, armour: 0.1, row: 'bones', hp: 5,
      moves: [{ id: 'headbite', name: 'Head Bite', hits: [ZFH(1.3, 0.3)] },
        { id: 'underjaw', name: 'Underjaw', hits: [ZFH(1.2, 0.13), ZFH(0.7, 0.13, { hold: 0.5 })] }] },
    captain: { name: 'Cave Devourer Deepmaw', speed: 0.85, look: 'a pale head jaw and an amber chest mouth',
      extra: { id: 'twofold', name: 'Twofold Hunger', hits: [ZFH(1.1, 0.15), ZFH(0.8, 0.18, { hold: 0.6 })] } } },
  9: { monster: { key: 'glassfang', name: 'Glassfang Fiend', speed: 1.1, armour: 0.05, row: 'golem', hp: 4,
      moves: [{ id: 'fangthrust', name: 'Fang Thrust', hits: [ZFH(1.1, 0.27)] },
        { id: 'glasscross', name: 'Glass Cross', hits: [ZFH(0.8, 0.13), ZFH(0.7, 0.13, { hold: 0.5 })] }] },
    captain: { name: 'Glassfang Prismfang', speed: 1.15, look: 'opal blade edges and a striped face slit',
      extra: { id: 'splinter', name: 'Splinter Salute', hits: [ZFH(1.0, 0.1), ZFH(0.7, 0.1), ZFH(0.7, 0.1, { ride: 'bleed' })] } } },
  10: { monster: { key: 'echoblade', name: 'Echoblade', speed: 1, armour: 0, row: 'zf-holy-frost', hp: 4,
      moves: [{ id: 'resonant', name: 'Resonant Cut', hits: [ZFH(1.2, 0.28)] },
        { id: 'echofeint', name: 'Echo Feint', hits: [ZFF(0.8), ZFH(1.1, 0.12, { dt: 'holy' }), ZFH(0.6, 0.12, { dt: 'holy' })] }] },
    captain: { name: 'Echoblade Stillnote', speed: 1.05, look: 'ivory elbow spurs and three chest stripes',
      extra: { id: 'silentthird', name: 'Silent Third', hits: [ZFH(1.1, 0.1, { dt: 'holy' }), ZFH(1.0, 0.1, { dt: 'holy' }), ZFH(0.8, 0.1, { dt: 'holy', hold: 0.5 })] } },
    champion: { name: 'The Hollow Cantor', speed: 0.95, armour: 0.05, row: 'zf-holy-frost',
      moves: [{ id: 'tuningfang', name: 'Tuning Fang', hits: [ZFH(1.2, 0.34)] },
        { id: 'threefold', name: 'Threefold Hymn', hits: [ZFH(1.1, 0.12, { dt: 'holy' }), ZFH(0.6, 0.12, { dt: 'holy' }), ZFH(0.8, 0.14, { dt: 'holy', hold: 0.5 })] },
        { id: 'unmaking', name: 'Unmaking Chord', charge: true, hits: [ZFH(1.2, 0.22, { dt: 'holy' }), ZFH(1.0, 0.22, { dt: 'holy' }), ZFH(0.6, 0.22, { dt: 'holy' })] },
        { id: 'vault', name: 'Shut the Vault', hits: [ZFH(1.1, 0.16), ZFH(0.6, 0.16)] }],
      // the top jaw grows a light rim: Threefold Hymn turns slow, delayed, fast (same damage and hits)
      phase: { i: 1, move: { id: 'threefold', name: 'Threefold Hymn', hits: [ZFH(1.1, 0.12, { dt: 'holy' }), ZFH(0.8, 0.12, { dt: 'holy', hold: 0.5 }), ZFH(0.6, 0.14, { dt: 'holy' })] } } } }
};
// A kit move as zone z plays it (above): boss, a Captain or Champion; else an ordinary monster. Returns a new move.
function zoneFoeShape(mv, z, boss) {
  const T = typeof TURN_TUNE === 'object' ? TURN_TUNE.tricks : { on: 1, from: 4, feintFrom: 7 };
  const holds = boss && T.on && z >= T.from, feints = boss && T.on && z >= T.feintFrom, out = [];
  let lift = 0;   // a feint left out: what it adds to the next hit
  for (const h0 of mv.hits) {
    if (h0.feint && !feints) { lift += 0.4; continue; }
    const h = Object.assign({}, h0);
    if (lift) { if (holds) h.hold = (h.hold || 0) + lift; else h.wind += lift; lift = 0; }
    if (h.hold > 0 && !holds) { h.wind += h.hold; delete h.hold; }
    out.push(h);
  }
  return Object.assign({}, mv, { hits: out, nreal: null });
}
// Damage a foe turn (the parity measure): each move's real hits, a charged move over its two turns at chargeX
function zoneFoeThreat(script, cx) {
  let x = 0, n = 0;
  for (const mv of script) { const s = mv.hits.reduce((a, h) => a + (h.feint ? 0 : h.x || 0), 0); x += mv.charge ? s * (cx || 1) : s; n += mv.charge ? 2 : 1; }
  return n ? x / n : 0;
}
const zoneFoeScaled = (mv, k) => k === 1 ? mv : Object.assign({}, mv, { hits: mv.hits.map(h => h.feint ? h : Object.assign({}, h, { x: h.x * k })), nreal: null });
// ZONE_FOES as the switches say: the two live monsters, plus every kit of an area that is on
const ZONE_FOES_BASE = Object.assign({}, ZONE_FOES);
function zoneFoeApply() {
  for (const z in ZONE_FOES) if (!ZONE_FOES_BASE[z]) delete ZONE_FOES[z];
  for (const z in ZONE_FOES_BASE) ZONE_FOES[z] = ZONE_FOES_BASE[z];
  for (const zs in ZONE_FOE_KITS) {
    const z = +zs, K = ZONE_FOE_KITS[z];
    if (!ZONE_FOE_TUNE.on[zoneAreaIdx(z)]) continue;
    let row = ZONE_FOES[z];
    if (K.monster && !row) {
      const M = K.monster, ty = TYPES[zoneType(z)] && TYPES[zoneType(z)].key, TY = TURN_FOE_TYPES[ty], arm0 = FOE_BEH[ty] && FOE_BEH[ty].armoured ? 0.3 : 0;
      let moves = M.moves.map(mv => zoneFoeShape(mv, z, false)), hp = M.hp * ZONE_FOE_TUNE.hpX;
      if (ZONE_FOE_TUNE.parity && TY) {   // its slot type's damage a turn at its Speed, and its fight length through armour
        const k = TY.speed * zoneFoeThreat(TY.moves) / (M.speed * zoneFoeThreat(moves));
        moves = moves.map(mv => zoneFoeScaled(mv, k));
        hp = TURN_FOE_HP.normal * (1 - M.armour) / (1 - arm0) * M.hp / ZONE_FOE_KIT_HP[zoneAreaIdx(z)];
      }
      row = { key: M.key, name: M.name, speed: M.speed, armour: M.armour, row: M.row, hp, moves, kit: true };
    }
    if (!row) continue;
    const add = {};
    if (K.captain && typeof bossTierOf === 'function' && bossTierOf(z) === 'captain') add.captain = K.captain;
    if (K.champion) add.champion = K.champion;
    ZONE_FOES[z] = Object.keys(add).length ? Object.assign({}, row, add) : row;
  }
  for (const k in ZONE_FOE_BOSS_CACHE) delete ZONE_FOE_BOSS_CACHE[k];
}
// each area's mean roster HP (parity: a monster lasts as long as its slot type, by its share of its area's HP)
const ZONE_FOE_KIT_HP = [0, 1].map(a => { const L = Object.keys(ZONE_FOE_KITS).filter(z => zoneAreaIdx(+z) === a && ZONE_FOE_KITS[z].monster).map(z => ZONE_FOE_KITS[z].monster.hp); return L.reduce((s, h) => s + h, 0) / L.length; });
function zoneFoeArea(a, on) { ZONE_FOE_TUNE.on[a] = on ? 1 : 0; zoneFoeApply(); }
const ZONE_FOE_BOSS_CACHE = {};
function zoneFoeBoss(z, script, spd, arm) {
  const Z = ZONE_FOES[z], C = Z && (Z.champion || Z.captain);
  if (!C || !script || !script.length) return null;
  const champ = !!Z.champion, ck = z + ':' + (champ ? 'c' : 'k') + ':' + script.map(m => m.id).join(',') + ':' + spd + ':' + arm;
  if (ZONE_FOE_BOSS_CACHE[ck]) return ZONE_FOE_BOSS_CACHE[ck];
  const base = champ ? C.moves : [Z.moves[0], Z.moves[1], C.extra];
  const cx = typeof TURN_TUNE === 'object' && typeof turnZoneLine === 'function' ? turnZoneLine(TURN_TUNE.boss.chargeX, z) : 1;
  let s1 = base.map(mv => zoneFoeShape(mv, z, true)), s2 = champ && C.phase ? s1.map((mv, i) => i === C.phase.i ? zoneFoeShape(C.phase.move, z, true) : mv) : null;
  const armK = champ ? C.armour || 0 : Z.armour || 0, sp = C.speed * 10;
  const fit = (ZONE_FOE_TUNE.parity && ZONE_FOE_TUNE.fit[z]) || [1, 1, 1, 1];
  let k = 1;
  if (ZONE_FOE_TUNE.parity) k = spd * zoneFoeThreat(script, cx) / (sp * zoneFoeThreat(s1, cx));
  s1 = s1.map(mv => zoneFoeScaled(mv, k)); if (s2) s2 = s2.map(mv => zoneFoeScaled(mv, k));
  return (ZONE_FOE_BOSS_CACHE[ck] = { name: C.name, tier: champ ? 'champion' : 'captain', script: s1, script2: s2, spd: sp, arm: armK,
    row: champ ? C.row : Z.row, kd: { wren: fit[1], tobin: fit[2], pip: fit[3] }, hpK: ZONE_FOE_TUNE.parity ? fit[0] * (1 - armK) / (1 - (arm || 0)) : 1 });
}
zoneFoeApply();
