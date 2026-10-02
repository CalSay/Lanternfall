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
//   zoneFoeSkin(f, z)   cbSpawn (59-combat): make a regular foe of zone z that zone's monster (no-op elsewhere)
//   zoneFoeOf(f) -> the ZONE_FOES entry of a skinned foe, or null
//   zoneFoeDeathS(f) -> seconds its death animation runs (50-sim waits that long before the next foe), or 0
const ZONE_FOES = {
  1: { key: 'imp', name: 'Thorn Imp', refHp: 80,
    moves: [
      { id: 'jab', name: 'Briar Jab', anim: 'jab', hits: [{ wind: 1.61, x: 0.2 }] },
      // its two cuts land 0.88 s after the hop and 1.0 s apart (the owner-approved animation, 2026-10-02)
      { id: 'cross', name: 'Crosscut', anim: 'crosscut', hits: [{ wind: 1.61, x: 0.1 }, { wind: 1.0, x: 0.1 }] }
    ] }
};
// ms of frames a..b-1 of an action (one-based)
const zoneFoeMs = (A, a, b) => { let t = 0; for (let i = a; i < b; i++) t += A.f[i - 1][0]; return t; };
function zoneFoeWinds(key, move) {
  const P = typeof FOE_ART === 'object' && FOE_ART[key], A = P && P.acts[move.anim], hop = P && P.acts.hop;
  if (!A || !hop || A.con.length !== move.hits.length) return;
  move.hits.forEach((h, i) => {
    h.wind = (i ? zoneFoeMs(A, A.con[i - 1], A.con[i]) : zoneFoeMs(hop, 1, hop.f.length + 1) + zoneFoeMs(A, A.start, A.con[0])) / 1000;
  });
}
for (const z in ZONE_FOES) for (const m of ZONE_FOES[z].moves) if (m.anim) zoneFoeWinds(ZONE_FOES[z].key, m);
function zoneFoeSkin(f, z) {
  const Z = ZONE_FOES[z];
  if (!f || !Z || f.boss || f.elite) return f;
  f.skin = Z.key; f.key = Z.key + zoneCycle(z); f.name = Z.name;
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
