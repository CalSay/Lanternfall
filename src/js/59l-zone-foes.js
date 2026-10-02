// 59l-zone-foes: the C22 roster's zone monsters, one zone at a time as their approved art lands
// (docs/design/enemies-c22-hollow-final.md; art in 64j-foe-art.js).
// The first is the Thorn Imp in zone 1 (owner, 2026-10-01). A zone monster is a skin over the zone's foe type: it keeps
// that type's index for the systems keyed by type (mastery, trophies, bounties, the Codex) and its damage-type row
// (the Imp: the Moss Slime's plant row, weak to fire 1.5x and resisting poison 0.6x, as the roster asks), and brings
// its own name, art and, in turn fights (59k), its own moves.
//   ZONE_FOES[z] -> { key, name, refHp, moves }   key: the art key (FOE_ART). refHp: the fixed reference hero HP the
//        zone's hits are authored against (not the player's HP). moves: the foe's moves in order (it alternates them);
//        each { id, name, hits: [{ wind, x }] }: wind, the seconds of anticipation before that contact (the parry and
//        dodge windows close on it); x, its damage as a share of refHp. Every hit is its own parry or dodge.
//        A move's anim names its action in the approved pack (FOE_ART, 21za); its winds then come from the pack's own
//        timing (zoneFoeWinds), so each parry window closes on the frame where the blade lands: the first hit adds the
//        hop in (the foe hops to you, then attacks); a later hit counts from the contact before it.
//        ranged: a projectile move (no hop): its wind runs to the release frame, then flight seconds to the hero.
//        row: the foe type whose weakness row it uses when that differs from its zone's slot (59a typeX).
//   zoneFoeSkin(f, z)   cbSpawn (59-combat): make a regular foe of zone z that zone's monster (no-op elsewhere). In a
//        legacy fight a skinned foe swings no faster than its slowest one-hit attack animation runs (zoneFoeCycle),
//        and each swing hits harder by as much, so the approved timings play in full at the same damage a second.
//   zoneFoeOf(f) -> the ZONE_FOES entry of a skinned foe, or null
//   zoneFoeDeathS(f) -> seconds its death animation runs (50-sim waits that long before the next foe), or 0
const ZONE_FOES = {
  1: { key: 'imp', name: 'Thorn Imp', refHp: 80,
    moves: [
      { id: 'jab', name: 'Briar Jab', anim: 'jab', hits: [{ wind: 1.61, x: 0.2 }] },
      // its two cuts land 0.88 s after the hop and 1.0 s apart (the owner-approved animation, 2026-10-02)
      { id: 'cross', name: 'Crosscut', anim: 'crosscut', hits: [{ wind: 1.61, x: 0.1 }, { wind: 1.0, x: 0.1 }] }
    ] },
  // Gloomjaw (owner-approved pack, 2026-10-02). Spit the Light is a dark void bolt (owner); the roster's numbers stand.
  // It takes the Moss Slime's plant row (weak to fire, resists poison) over zone 2's Cave Bat slot.
  2: { key: 'gloomjaw', name: 'Gloomjaw', refHp: 80, row: 'slime',
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
  f.skin = Z.key; f.key = Z.key + zoneCycle(z); f.name = Z.name;
  if (Z.row) f.txRow = Z.row;   // (f.row is its lane)
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
// The shortest legacy swing period that plays every one-hit move in full when they alternate (as 62-stage plays them):
// the most, over each move and the next, of the first's tail (its hit to its last frame) plus the next's lead (its first
// frame to its hit; a projectile's hit is its landing).
function zoneFoeCycle(Z) {
  const P = Z && typeof FOE_ART === 'object' && FOE_ART[Z.key]; if (!P) return 0;
  const L = Z.moves.filter(m => m.hits.length === 1 && P.acts[m.anim]).map(m => {
    const A = P.acts[m.anim], all = zoneFoeMs(A, A.start, A.end + 1);
    const lead = m.ranged && A.rel.length ? zoneFoeMs(A, A.start, A.rel[0]) + (m.flight || 0) * 1000 : A.con.length ? zoneFoeMs(A, A.start, A.con[0]) : all;
    return { lead, tail: Math.max(0, all - lead) };
  });
  let c = 0;
  for (let i = 0; i < L.length; i++) c = Math.max(c, L[i].tail + L[(i + 1) % L.length].lead);
  return c / 1000;
}
