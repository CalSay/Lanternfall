// 55-attributes: attribute points (card hero-progression-rework; docs/design/hero-progression-build.md section 2).
// Each hero earns HERO_TUNE.perLevel points a level after Lv 1 and spends them on the four ATTRS (24g). A point raises one
// thing by its `per`: Might Attack, Focus ability power, Guard counters (and the parry window), Vigour health. Every level
// also gives each of the four HERO_TUNE.lvBase. Points are free to move (attrReset); a fight takes them as it starts.
// HERO_TUNE.training (the switch-off flag) turns all of this off: no points, and every multiplier is the old flat
// +PACE.heroLv a level.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// API (function declarations: 40-rules, 59-combat, 59j and 59k call them at run time):
//   attrOn() -> bool (attributes are live: the flag is off)
//   heroLvOf(k?) -> the hero's level (the one playing reads S.L; others their saved record; default: the one playing)
//   attrOf(k, id) -> points in one attribute; attrPoints(k?) -> { total, spent, free }
//   attrAdd(id, n = 1, k?) -> points added (never past the free points; emits attrSet { hero, id, n })
//   attrReset(k?) -> bool (every point back to free; emits attrReset { hero })
//   attrX(kind, k?) -> the level-and-points multiplier on kind 'atk' | 'ab' | 'counter' | 'hp'
//   attrRel(kind, k?) -> attrX(kind) / attrX('atk'): heroAtk() already carries attrX('atk') (40-rules lvlMult), so the
//                       other three multiply by this on top of it
//   attrParryMs(k?) -> Guard's extra parry window, in seconds
//   attrSpentAny() -> bool (any hero has spent a point: the guide's step)
// Save: registerState('attr', { v: 1, pts: { hero: { might, focus, guard, vigour } } }). Points spent are stored; the total
// is derived from the level, never stored.

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
function attrPoints(k) {
  k = attrHero(k);
  const total = attrOn() ? Math.max(0, (heroLvOf(k) - 1) * HERO_TUNE.perLevel) : 0;
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
function attrReset(k) {
  k = attrHero(k);
  const r = attrRec(k); let any = false;
  for (const id of ATTR_IDS) { if (r[id]) any = true; r[id] = 0; }
  if (!any) return false;
  emit('attrReset', { hero: k });
  if (typeof gearDirty === 'function') gearDirty();
  return true;
}
const ATTR_BY_KIND = {}; for (const a of ATTRS) ATTR_BY_KIND[a.kind] = a;
function attrX(kind, k) {
  const L = heroLvOf(k);
  if (!attrOn()) return 1 + PACE.heroLv * (L - 1);
  const a = ATTR_BY_KIND[kind];
  return 1 + HERO_TUNE.lvBase * (L - 1) + (a ? a.per * attrOf(k, a.id) : 0);
}
function attrRel(kind, k) { return attrOn() ? attrX(kind, k) / attrX('atk', k) : 1; }
function attrParryMs(k) { const a = ATTR_BY_KIND.counter; return attrOn() && a && a.parryMs ? a.parryMs * attrOf(k, a.id) / 1000 : 0; }
function attrSpentAny() {
  const p = S.attr && S.attr.pts; if (!p || typeof p !== 'object') return false;
  for (const k in p) { const r = p[k]; if (r && typeof r === 'object') for (const id of ATTR_IDS) if (r[id] > 0) return true; }
  return false;
}

registerState('attr', { v: 1, pts: {} });
