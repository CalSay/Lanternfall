// 55-lantern: the Great Lantern moments (docs/design/region-2.md 8.1 and 8.3, plan-2 task R0).
// CORE FILE: no DOM. UI: 75-lantern-ui.js (the full-screen card and the Lantern Road strip).
//
// The first kill of a region boss (REGIONS[i].z1, 22-data-regions.js) relights that region's Great
// Lantern, once per save:
//   emit('greatLantern', { n, region, zone, name, head, text, note, quiet, rewards, say })
//     n: 1 for the Hollow, 2 for the Coast. head/text/note: COAST_STORY[region.beat] (21b-stories-coast).
//     quiet: true for a save that was already past the boss before this system existed (it gets one
//       bell line through emit('whatsNew') instead of the card).
//     rewards: listeners push { txt, ic } lines while the event runs (57e-constellations: the star
//       points; later the Oaths, rank 8 ...). The card and the bell line list them.
// The reward itself is never granted here: each system derives its own from S.maxZone or listens.
//
// State S.lantern: { v, lit: { regionId: time relit }, seen }. seen = the max zone this system last
// looked at (0 = never: a save loaded for the first time since R0, so what it passed is quiet).
//
// API: lanternSync() (runs on zoneClear and after each tick; cheap when nothing changed),
//      lanternRoad() -> [{ id, n, name, col, z0, z1, lit, at, reached, here, beyond }]

let lanternSync, lanternRoad;
{
  registerState('lantern', { v: 1, lit: {}, seen: 0 });
  const L = () => S.lantern || (S.lantern = { v: 1, lit: {}, seen: 0 });

  function fire(r, i, quiet) {
    const beat = (typeof COAST_STORY !== 'undefined' && COAST_STORY[r.beat]) || null;
    const e = {
      n: i + 1, region: r.id, zone: r.z1, name: r.lantern,
      head: (beat && beat.head) || `${r.lantern} burns again.`,
      text: (beat && beat.text) || '', note: (beat && beat.note) || '',
      quiet: !!quiet, rewards: []
    };
    emit('greatLantern', e);
    if (quiet) {
      const extra = e.rewards.map(x => x.txt).filter(Boolean);
      emit('whatsNew', { msg: [e.head, e.note].concat(extra.length ? [extra.join('. ') + '.'] : []).filter(Boolean).join(' '),
        icon: { ic: ['orb', r.col, { 7: '#FFF3C4' }] }, first: true });
    }
  }

  lanternSync = () => {
    const l = L(), mz = S.maxZone || 1, old = !l.seen;
    if (l.seen === mz) return;
    REGIONS.forEach((r, i) => {
      if (mz > r.z1 && !l.lit[r.id]) { l.lit[r.id] = Date.now(); fire(r, i, old); }
    });
    l.seen = mz;
  };
  on('zoneClear', () => lanternSync());
  onTick(() => { const l = S.lantern; if (!l || l.seen !== S.maxZone) lanternSync(); });

  lanternRoad = () => {
    const l = L(), mz = S.maxZone || 1, here = regionIdx(S.zone || 1);
    const out = REGIONS.map((r, i) => ({
      id: r.id, n: r.n, name: r.lantern, col: r.col, z0: r.z0, z1: r.z1,
      lit: mz > r.z1, at: l.lit[r.id] || 0, reached: mz >= r.z0, here: i === here, beyond: false
    }));
    out.push({ id: ROAD_BEYOND.id, n: ROAD_BEYOND.n, name: 'Beyond: ' + ROAD_BEYOND.n, col: ROAD_BEYOND.col,
      z0: 0, z1: 0, lit: false, at: 0, reached: false, here: false, beyond: true });
    return out;
  };
}
