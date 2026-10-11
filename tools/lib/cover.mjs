// walk-presses-cover: what the walk bot and the sim read before they press an upgrade's gold cover (upgradeCover, 55-crafting).
// Both evaluate COVER_READ inside the game's scope; it reads, never sets.
//
// For each piece the hero wears whose next upgrade is short of its material and that gold may cover: the units gold would pay,
// the cover gold, whether the cover can be paid now (canUpgrade with { cover: true }), whether the plain upgrade can (then the
// bot has no reason to cover), and `mins`, the free route's game minutes: gathering the raw units it still lacks at the hero's
// own speed (nodeTime, nodeYieldAvg) plus, for a middle (Ingot, Plank, Cloth, Leather), the refine order's time at its station
// (refineUnitSecs), one after the other. Coal is left out (Copper Ore brings it). A raw the hero cannot gather reads Infinity.
//
// The cover modes (--cover on tools/walk.mjs and tools/sim.mjs): 'all' covers every short upgrade it can pay; a number N covers
// only when `mins` is over N.
export const COVER_READ = `(() => {
  const out = [];
  const node = (k, t, n) => { if (!(n > 0)) return 0; try { const y = nodeYieldAvg(k) * mod('yield:' + k), nt = nodeTime(k, t); return y > 0 && nt > 0 ? n / y * nt : Infinity; } catch (e) { return Infinity; } };
  for (const pos of Object.keys(S.equip)) {
    const it = equipped(pos); if (!it) continue;
    const cv = typeof upgradeCover === 'function' ? upgradeCover(it) : null; if (!cv) continue;
    let secs = 0;
    if (REFINE_RAW[cv.fam]) { secs = cv.units * refineUnitSecs(REFINE_PRODUCTS[cv.fam].st, cv.t); for (const [f, tt, n] of refineNeed(cv.fam, cv.t)) if (f !== 'coal') secs += node(f, tt, n * cv.units - matOwn(f, tt)); }
    else secs = node(cv.fam, cv.t, cv.units);
    const can = canUpgrade(it.id, undefined, { cover: true });
    out.push({ id: it.id, pos, nm: itemName(it), plus: it.plus, fam: cv.fam, t: cv.t, units: cv.units, gold: cv.gold + upgradeCost(it).gold,
      ok: !!can.ok, why: can.ok ? '' : can.why || '', plain: !!canUpgrade(it.id).ok, mins: Math.round(secs / 6) / 10 });
  }
  return out;
})()`;
// The `upgraded` event's step, read as it fires (the item's plus has already gone up): the material units that step took in all
// (every count but Essence and coal) and the units gold covered.
export const UPGRADED_UNITS = `e => { let all = 0; try { const m = upgradeCost(Object.assign({}, e.item, { plus: e.item.plus - 1 })).mats; for (const k in m) if (k !== 'ess' && k !== 'coal') all += m[k]; } catch (x) { all = null; }
  return { all, cover: e.cover ? e.cover.units : 0, gold: e.cover ? e.cover.gold : 0 }; }`;
// --cover all|<min>: null (off), { all: true } or { min: N }. Anything else is an error message.
export function coverMode(v) {
  if (v === undefined || v === null || v === false || v === '0' || v === 'off') return null;
  if (v === true || v === 'all') return { all: true };
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? { min: n } : 'the cover is all or a number of minutes over 0';
}
export const coverWants = (mode, c) => !!mode && c.ok && !c.plain && (mode.all || c.mins > mode.min);
export const coverName = mode => !mode ? 'off' : mode.all ? 'covers everything' : `covers when the free order takes over ${mode.min} min`;
