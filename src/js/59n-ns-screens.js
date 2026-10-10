// 59n-ns-screens: the pieces each screen draws in the new style (card ns-scenery-engine; docs/design/new-style/engine.md has the
// piece names and the whole-screen rule). CORE FILE: no DOM; tools/build.mjs reads nsPackZones in Node.
//   nsFoeKey(m) -> a foe's new-style key ('' never); nsZoneFoes(z) / nsFightPieces(z): a turn fight in zone z
//   nsGatherPieces(kind, t, grove), nsCampPieces(view) (63d campSceneLayout), nsPackZones(piece) -> [[from, to], ...]
const NS_GATHER_SET = { ore: 'gmine', crystal: 'gglade', wood: 'gwoods', fibre: 'gmeadow', herb: 'gmeadow', hide: 'gwoods' };
const NS_PILE = { ore: 'cart', crystal: 'crate', wood: 'logs', fibre: 'basket', herb: 'basket' };
function nsFoeKey(m) {
  if (!m || m.deep) return '';
  const z = m.tz || m.z || (typeof S === 'object' && S ? S.zone : 1), type = m.type || String(m.key || '').replace(/\d+$/, '');
  if (m.boss) {
    if (typeof isRegionBoss === 'function' && isRegionBoss(z)) { const r = regionIdx(z); return r === 0 ? 'fenmother' : r === 1 ? 'silas' : type + '.elder'; }
    // a turn fight's zone boss: its Champion or Captain while its area is on (59l zoneFoeBoss)
    const Z = m.turn && typeof ZONE_FOES === 'object' ? ZONE_FOES[z] : null;
    if (Z && Z.champion) return Z.champion.key || 'champion' + z;
    if (Z && Z.captain) return Z.key + '.captain';
    return type + '.elder';
  }
  return m.skin || type;
}
function nsZoneFoes(z) {
  const out = [], add = k => { if (k && !out.includes(k)) out.push(k); };
  const Z = typeof ZONE_FOES === 'object' ? ZONE_FOES[z] : null, zt = TYPES[zoneType(z)].key;
  if (Z) add(Z.key); else { add(zt); add(TYPES[zoneNextType(z)].key); }
  add(nsFoeKey({ boss: true, type: zt, key: zt, z, tz: z, turn: 1 }));
  return out;
}
const nsFightPieces = z => ['scenery:fight.' + zoneAreaIdx(z)].concat(nsZoneFoes(z).map(k => 'foe:' + k));
function nsGatherPieces(kind, t, grove) {
  const set = NS_GATHER_SET[kind]; if (!set) return [];
  const out = ['scenery:gather.' + set];
  if (kind === 'hide') { const B = typeof HUNT_BEASTS === 'object' && HUNT_BEASTS[(t | 0) - 1]; out.push(B ? 'beast:' + B.key : 'beast:?'); return out; }
  out.push('node:' + kind + '.' + t, 'prop:pile.' + NS_PILE[kind]);
  if (grove) {
    out.push('prop:fire', 'npc:hesketh');
    for (const id of ['bench', 'forge', 'store']) {
      const lv = S.camp && S.camp.b ? S.camp.b[id] || 0 : 0;
      if (lv >= 1) out.push('station:' + id);
      else if (typeof CAMP_B === 'object' && CAMP_B[id] && typeof hearthPlotOpen === 'function' && hearthPlotOpen(id)) out.push('prop:stake');
    }
  }
  return out.filter((p, i, a) => a.indexOf(p) === i);
}
function nsCampPieces(view) {
  const out = ['scenery:camp'];
  if (!view) return out;
  if (view.tents > 0) out.push('prop:tent');
  if (view.open) out.push('prop:fire');
  for (const b of view.buildings || []) out.push('station:' + b.id);
  for (const a of view.actors || []) { out.push('gatherer:' + (a.key || a.id)); if (a.status && a.status.st === 'pack') out.push('prop:pack'); }
  return out.filter((p, i, a) => a.indexOf(p) === i);
}
function nsPackZones(piece) {
  if (piece.startsWith('critter:')) return [[1, ROAD_ZONES]];
  const out = [];
  for (let z = 1; z <= ROAD_ZONES; z++) {
    if (!nsFightPieces(z).includes(piece)) continue;
    const last = out[out.length - 1];
    if (last && last[1] === z - 1) last[1] = z; else out.push([z, z]);
  }
  return out;
}
