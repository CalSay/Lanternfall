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
//   zoneFoeSkin(f, z)   cbSpawn (59-combat): make a regular foe of zone z that zone's monster (no-op elsewhere)
//   zoneFoeOf(f) -> the ZONE_FOES entry of a skinned foe, or null
const ZONE_FOES = {
  1: { key: 'imp', name: 'Thorn Imp', refHp: 80,
    moves: [
      { id: 'jab', name: 'Briar Jab', hits: [{ wind: 0.85, x: 0.2 }] },
      // slow, then fast
      { id: 'cross', name: 'Crosscut', hits: [{ wind: 1.1, x: 0.1 }, { wind: 0.5, x: 0.1 }] }
    ] }
};
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
