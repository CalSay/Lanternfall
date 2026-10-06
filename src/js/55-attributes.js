// 55-attributes: attribute points (card hero-progression-rework; docs/design/hero-progression-build.md section 2).
// Each hero earns HERO_TUNE.perLevel points a level after Lv 1 and spends them on the four ATTRS (24g). A point raises one
// thing by its `per`: Might Attack, Focus ability power, Guard counters (and the parry window), Vigour health. Every level
// also gives each of the four HERO_TUNE.lvBase. Points in one attribute past HERO_TUNE.softAt of the hero's total count
// HERO_TUNE.soft each. Adding points is free; the first reset per hero is free, later ones cost gold (attrResetCost). A
// fight takes the points as it starts.
// Power outside a fight (heroAtk: the away and raid dps, farmableZone, the Deepwell's depth) uses the build-neutral
// multiplier attrNeutral(): the same for every split of the same points. Turn fights apply the split on top (attrRel).
// HERO_TUNE.training (the switch-off flag) turns all of this off: no points, and every multiplier is the old flat
// +PACE.heroLv a level.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// API (function declarations: 40-rules, 59-combat, 59j and 59k call them at run time):
//   attrOn() -> bool (attributes are live: the flag is off)
//   heroLvOf(k?) -> the hero's level (the one playing reads S.L; others their saved record; default: the one playing)
//   attrOf(k, id) -> points in one attribute; attrEff(k, id) -> those points after the soft cap
//   attrPoints(k?) -> { total, spent, free }
//   attrAdd(id, n = 1, k?) -> points added (never past the free points; emits attrSet { hero, id, n })
//   attrSpread(k?) -> points added: the free points spread so the four end as even as they can (emits attrSet a point)
//   attrResetCost(k?) -> gold (0 for a hero's first reset); attrReset(k?) -> bool (pays; every point back to free;
//                      emits attrReset { hero, cost })
//   attrNeutral(k?) -> the build-neutral level multiplier: 1 + lvBase x (L - 1) + the mean per x spent / 4
//   attrX(kind, k?) -> the level-and-points multiplier on kind 'atk' | 'ab' | 'counter' | 'hp'
//   attrRel(kind, k?) -> attrX(kind) / attrNeutral(): heroAtk() carries attrNeutral() (40-rules lvlMult), so a turn fight's
//                       Attack, abilities, counters and health multiply by this on top of it
//   attrParryMs(k?) -> Guard's extra parry window, in seconds (at most HERO_TUNE.guardMs)
//   attrSpentAny() -> bool (any hero has spent a point: the guide's step)
// Save: registerState('attr', { v: 1, pts: { hero: { might, focus, guard, vigour } }, resets: { hero: n }, met: { hero: 1 }, live }).
// live: 1 once the save has run with attributes on; with the flag back on, 55-attributes seeds Training from levels once
// (S.solo.trSeeded). Points spent
// are stored; the total is derived from the level, never stored.

function attrOn() { return !HERO_TUNE.training; }
function heroLvOf(k) {
  const s = S.solo;
  if (!k || !s || k === s.hero) return S.L || 1;
  const r = s.lv && s.lv[k];
  return r && r.L > 0 ? r.L | 0 : 1;
}
const attrHero = k => k || (typeof soloHero === 'function' ? soloHero() : null) || (S.solo && S.solo.hero) || 'wren';
function attrRec(k) {
  k = attrHero(k);
  const a = S.attr || (S.attr = { v: 1, pts: {} });
  if (!a.pts || typeof a.pts !== 'object') a.pts = {};
  let r = a.pts[k];
  if (!r || typeof r !== 'object') r = a.pts[k] = ATTR0();
  return r;
}
function attrOf(k, id) { const v = attrRec(k)[id]; return v > 0 ? Math.floor(v) : 0; }
function attrTotal(k) { return attrOn() ? Math.max(0, (heroLvOf(k) - 1) * HERO_TUNE.perLevel) : 0; }
function attrEff(k, id) {
  const p = attrOf(k, id), h = HERO_TUNE.softAt * attrTotal(attrHero(k));
  return p <= h ? p : h + HERO_TUNE.soft * (p - h);
}
function attrPoints(k) {
  k = attrHero(k);
  const total = attrTotal(k);
  let spent = 0; for (const id of ATTR_IDS) spent += attrOf(k, id);
  return { total, spent, free: Math.max(0, total - spent) };
}
function attrAdd(id, n, k) {
  k = attrHero(k);
  if (!attrOn() || !ATTR_IDS.includes(id)) return 0;
  const add = Math.min(Math.max(0, Math.floor(n === undefined ? 1 : n)), attrPoints(k).free);
  if (!(add > 0)) return 0;
  const r = attrRec(k); r[id] = attrOf(k, id) + add;
  emit('attrSet', { hero: k, id, n: add });
  if (typeof gearDirty === 'function') gearDirty();
  return add;
}
// Spread the free points so the four attributes end as even as they can (the lowest first; ties in screen order).
function attrSpread(k) {
  k = attrHero(k);
  if (!attrOn()) return 0;
  const r = attrRec(k); let n = attrPoints(k).free, add = 0;
  for (; n > 0; n--) {
    let best = ATTR_IDS[0]; for (const id of ATTR_IDS) if (attrOf(k, id) < attrOf(k, best)) best = id;
    r[best] = attrOf(k, best) + 1; add++;
  }
  if (add) { emit('attrSet', { hero: k, id: 'spread', n: add }); if (typeof gearDirty === 'function') gearDirty(); }
  return add;
}
function attrResets() { const a = S.attr || (S.attr = { v: 1, pts: {} }); if (!a.resets || typeof a.resets !== 'object') a.resets = {}; return a.resets; }
function attrResetCost(k) {
  k = attrHero(k);
  return (attrResets()[k] | 0) >= 1 && typeof foeGoldBase === 'function' ? Math.ceil(foeGoldBase(Math.max(1, S.maxZone || 1)) * HERO_TUNE.respec) : 0;
}
function attrReset(k) {
  k = attrHero(k);
  const r = attrRec(k); let any = false;
  for (const id of ATTR_IDS) if (r[id]) any = true;
  if (!any) return false;
  const cost = attrResetCost(k);
  if (cost > 0) { if (!(S.gold >= cost)) return false; S.gold -= cost; if (typeof econSpend === 'function') econSpend('up', cost); }
  for (const id of ATTR_IDS) r[id] = 0;
  const rs = attrResets(); rs[k] = (rs[k] | 0) + 1;
  emit('attrReset', { hero: k, cost });
  if (typeof gearDirty === 'function') gearDirty();
  return true;
}
const ATTR_BY_KIND = {}; for (const a of ATTRS) ATTR_BY_KIND[a.kind] = a;
const ATTR_PER = ATTRS.reduce((t, a) => t + a.per, 0) / ATTRS.length;
function attrNeutral(k) {
  const L = heroLvOf(k);
  if (!attrOn()) return 1 + PACE.heroLv * (L - 1);
  return 1 + HERO_TUNE.lvBase * (L - 1) + ATTR_PER * attrPoints(k).spent / ATTRS.length;
}
function attrX(kind, k) {
  const L = heroLvOf(k);
  if (!attrOn()) return 1 + PACE.heroLv * (L - 1);
  const a = ATTR_BY_KIND[kind];
  return 1 + HERO_TUNE.lvBase * (L - 1) + (a ? a.per * attrEff(k, a.id) : 0);
}
function attrRel(kind, k) { return attrOn() ? attrX(kind, k) / attrNeutral(k) : 1; }
function attrParryMs(k) { const a = ATTR_BY_KIND.counter; return attrOn() && a && a.parryMs ? Math.min(HERO_TUNE.guardMs, a.parryMs * attrEff(k, a.id)) / 1000 : 0; }
function attrSpentAny() {
  const p = S.attr && S.attr.pts; if (!p || typeof p !== 'object') return false;
  for (const k in p) { const r = p[k]; if (r && typeof r === 'object') for (const id of ATTR_IDS) if (r[id] > 0) return true; }
  return false;
}

// The first time a hero takes the lamp with points to spend, one line points at Attributes (judge 1d).
on('heroJoin', ({ key } = {}) => {
  if (!attrOn() || !key) return;
  const a = S.attr || (S.attr = { v: 1, pts: {} }); if (!a.met || typeof a.met !== 'object') a.met = {};
  const free = attrPoints(key).free; if (a.met[key] || !(free > 0)) return;
  a.met[key] = 1;
  const nm = typeof ROSTER === 'object' && ROSTER[key] ? ROSTER[key].name.split(' ')[0] : 'Your hero';
  emit('toast', { key: 'attr-join', msg: `${nm} has ${free} attribute points. Spread them evenly in one tap, or build your own.`, kind: 'good', prio: 'normal', go: { view: 'attributes' } });
});

registerState('attr', { v: 1, pts: {}, resets: {}, met: {}, live: 0 });
// The switch-off flag on a save played with attributes (judge 6): once, each hero's Training is raised to the move level their
// hero level gave them (55-training trainLv's L - 1, to the stage cap), so no high-level hero comes back untrained.
if (attrOn()) S.attr.live = 1;
else if (S.attr.live && S.solo && typeof S.solo === 'object' && !S.solo.trSeeded) {
  const T = SOLO_TUNE.train;
  for (const k of SOLO_ORDER) {
    const L = heroLvOf(k), stage = S.solo.asc && S.solo.asc[k] ? 1 : 0, lv = Math.max(0, Math.min(L - 1, T.cap[Math.min(stage, T.cap.length - 1)]));
    if (!(lv > 0)) continue;
    const r = trainRec(k);
    for (const mv of trainMoves(k)) if (!(r[mv] >= lv)) r[mv] = lv;
  }
  S.solo.trSeeded = 1;
}
