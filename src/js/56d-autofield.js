// 56d-autofield: the line-up planner (plan-2 task AF, autoField v2).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Picks the best 3 companions and their formation cells for a zone. Every candidate field is
// scored with the game's own closed-form hold estimate (59-combat partyHoldEstimate: party
// damage with synergies, who gets hit, healing, the zone's foe behaviours), so roles come in
// only when the estimate needs them: a tank or a healer takes a damage dealer's place when the
// party cannot hold the zone without one. On top of that, small tie-breaks: an active synergy
// (56b activeSynergies, by strength) wins when damage is close, and the zone's foe behaviours
// (59b FOE_BEH) favour a tank in Front against divers and a stun against the Wraith healers.
// Cells follow the reach rules (melee foes hit the front-most column): tanks Front, strikers
// Mid (melee strikers Front when there is no tank), casters and supports Back; the planner also
// tries a support right behind the tank in the same lane (Shield and Hearth) and keeps the better.
//
// Exposed names:
//   bestLineup(opts) -> { field, cells, score, why, parts } | null (no roster yet)
//     opts.zone    zone to plan for (default: your best zone for 'push', the current zone for 'farm')
//     opts.goal    'push' (default: hold the zone, most damage) | 'farm' (most gold per second)
//     opts.filter  fn(id) -> bool | [ids] | { circle } | { role } (e.g. circle-only for the Oaths)
//     opts.key     cache key for a function filter (without it a function filter is not cached)
//     opts.by      'now' (default: today's levels) | 'potential' (levels once caught up; autoField)
//     parts: { zone, goal, dps, holds, margin, goldPerSec, synergies: [{ id, name, strength }],
//              reasons: [text], foe, current: { score, dps, holds } | null, gain, same, cand }
//   lineupScore(field, opts) -> { score, dps, holds, margin, goldPerSec, cells, synergies } (checks, UI)
//   applyLineup(res) -> field  (sets the field and cells; the caller decides when: see autoField)
//   AF_TUNE (knobs)
//
// Cost: at most perRole characters of each role are candidates (12 at most: 220 fields of 3),
// one estimate each, plus the Hearth cells for the top few. Results are cached per roster /
// zone / class / expedition change (levels in steps of 5), and nothing here runs per tick.
// Characters out on an expedition (57b expedOut) are never picked.

let AF_TUNE, bestLineup, lineupScore, applyLineup;

{
  const T = {
    perRole: 3,           // candidates per role (by value), so the search stays bounded
    synBonus: 0.03,       // tie-break per active synergy, x its strength (Common Cause, Bond)
    synMax: 0.08,         // at most +8%: a synergy wins when damage is close, never against a big gap
    behBonus: 0.03,       // foe behaviours the estimate does not model (a Front tank vs divers, a stun vs Wraith healers)
    failBase: 0.2, failMargin: 0.3,   // a field that does not hold keeps 20-50% of its score (by sustain)
    farmFail: 0.1,        // farming: a field that does not hold is worth a tenth
    needGap: 0.05,        // when nothing holds, a role is a reason when the best field without it has 5% less sustain
    hearthTop: 4,         // Hearth cells are tried for this many of the best fields
    deep: 6,              // fields per make-up (with or without a tank, a support) that get the full estimate
    lvStep: 5             // cache: levels in steps of 5
  };
  AF_TUNE = T;

  const R = id => ROSTER[id];
  const P = () => S.party;
  const COLS = { front: 2, mid: 1, back: 0 };
  const FOE_WORD = { slime: 'slimes', bat: 'divers', bones: 'archers', beetle: 'bruisers', spore: 'spore clouds', golem: 'golems', wraith: 'wraiths' };
  const STUNS = { aldric: 1, grenna: 1, thessaly: 1, oriel: 1, kestrel: 1 };
  const onExped = id => { try { return typeof expedOut === 'function' && !!expedOut(id); } catch (e) { return false; } };
  const heroCls = () => (P() && P().cls && HERO_CLASSES[P().cls]) ? P().cls : null;
  const heroColOf = () => { const c = heroCls(); return c ? COLS[HERO_CLASSES[c].row] : 2; };
  const heroRole = () => { const c = heroCls(); return c ? HERO_CLASSES[c].role : null; };
  const roleOf = k => k === 'hero' ? heroRole() : R(k).role;
  const foeKey = z => { try { const t = TYPES[zoneType(z)]; return t ? t.key : ''; } catch (e) { return ''; } };

  // ---------------- cells (reach rules) ----------------
  // Default: as 56-roster placeCells (tank Front, melee strikers Front without a tank, else the role
  // column), lanes filled lower first. pre: cells already taken { key: { col, lane } }; ban: 'col:lane' kept empty.
  function placeAll(field, pre, ban) {
    const cells = Object.assign({}, pre || {}), used = {};
    for (const k in cells) used[cells[k].col + ':' + cells[k].lane] = 1;
    if (ban) used[ban] = 1;
    const hasTank = field.some(k => R(k).role === 'tank');
    const want = k => {
      if (k === 'hero') return heroColOf();
      const c = R(k), col = ROLE_STATS[c.role].col;
      return c.role === 'striker' && !c.ranged && !hasTank ? 2 : col;
    };
    for (const k of ['hero'].concat(field)) {
      if (cells[k]) continue;
      const col = want(k), order = k === 'hero' ? [col] : [col, col === 1 ? 2 : 1, col === 0 ? 2 : 0];
      let done = false;
      for (const c of order) for (const lane of [1, 0]) if (!done && !used[c + ':' + lane]) { cells[k] = { col: c, lane }; used[c + ':' + lane] = 1; done = true; }
    }
    return cells;
  }
  // Shield and Hearth: a tank in Front and a support right behind it in the same lane.
  function hearthCells(field) {
    const all = ['hero'].concat(field);
    const tank = all.find(k => roleOf(k) === 'tank'), sup = all.find(k => roleOf(k) === 'support');
    if (!tank || !sup) return [];
    const hc = heroColOf(), out = [];
    if (tank === 'hero' && hc !== 2) return [];
    for (const lane of [1, 0]) {
      const pre = { [tank]: { col: 2, lane } };
      let ban = null;
      if (sup === 'hero') { if (hc === 1) pre.hero = { col: 1, lane }; else { pre.hero = { col: 0, lane }; ban = '1:' + lane; } }
      else pre[sup] = { col: 1, lane };
      out.push(placeAll(field, pre, ban));
    }
    return out;
  }

  // ---------------- one field ----------------
  // Scores a field with cells: the hold estimate at zone z, today's synergies, the zone's foes.
  function measure(field, cells, z, goal) {
    const p = P(), f0 = p.field, c0 = p.cells;
    p.field = field.slice(); p.cells = cells;
    try {
      let dps = 0, holds = true, margin = 99, gps = 0;
      if (typeof partyHoldEstimate === 'function') {
        const e = partyHoldEstimate(z, { one: true });
        dps = e.dps; holds = !!e.holds; margin = e.margin; gps = e.goldPerSec;
      } else {
        dps = heroDps() + field.reduce((a, k) => a + charDps(k), 0); gps = dps;
      }
      const syn = typeof activeSynergies === 'function' ? activeSynergies().map(s => ({ id: s.id, name: s.name, strength: s.strength })) : [];
      const synF = 1 + Math.min(T.synMax, T.synBonus * syn.reduce((a, s) => a + s.strength, 0));
      const fk = foeKey(z);
      let behF = 1;
      if (fk === 'bat' && field.some(k => R(k).role === 'tank' && cells[k] && cells[k].col === 2)) behF += T.behBonus;
      if (fk === 'wraith' && field.some(k => STUNS[k])) behF += T.behBonus;
      const m = Math.max(0, Math.min(1, margin));
      const base = goal === 'farm' ? gps : dps;
      const holdF = holds ? 1 : goal === 'farm' ? T.farmFail : T.failBase + T.failMargin * m;
      const score = Number.isFinite(base) ? base * holdF * synF * behF : 0;
      return { field: field.slice(), cells, score, dps, holds, margin, goldPerSec: gps, synergies: syn };
    } finally { p.field = f0; p.cells = c0; }
  }

  // ---------------- candidates ----------------
  function filterFn(fl) {
    if (!fl) return () => true;
    if (typeof fl === 'function') return fl;
    if (Array.isArray(fl)) return k => fl.includes(k);
    if (fl.circle) return k => R(k).circle === fl.circle;
    if (fl.role) return k => R(k).role === fl.role;
    return () => true;
  }
  // 'potential': levels once caught up to the party level and promoted to match (as 56-roster).
  function withLevels(by, ids, fn) {
    if (by !== 'potential') return fn();
    const pl = Math.floor(partyLevel()), saved = [];
    for (const k of ids) {
      const r = charRec(k), lv = Math.max(r.lv, pl);
      saved.push([r, r.lv, r.rank]);
      r.rank = Math.max(r.rank, Math.min(7, Math.floor((lv - 1) / 25))); r.lv = Math.min(lv, levelCap(r.rank));
    }
    try { return fn(); } finally { for (const [r, lv, rank] of saved) { r.lv = lv; r.rank = rank; } }
  }
  const value = k => charPow(k) * (R(k).role === 'support' ? ROSTER_TUNE.supEq : ROLE_STATS[R(k).role].dps * (1 + (ROLE_STATS[R(k).role].crit || 0) * ((ROLE_STATS[R(k).role].critX || 1) - 1)));
  function candidates(pass) {
    const all = rosterList().filter(k => !onExped(k) && pass(k));
    const out = [];
    for (const role of ['tank', 'striker', 'caster', 'support']) out.push(...all.filter(k => R(k).role === role).sort((a, b) => value(b) - value(a)).slice(0, T.perRole));
    return out;
  }
  function combos(list) {
    const n = list.length, out = [];
    if (n <= 3) return [list.slice()];
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) out.push([list[a], list[b], list[c]]);
    return out;
  }
  // Two stages: every field gets a quick damage number (synergies included, no estimate), then the
  // best T.deep of each make-up (tank or not, support or not) get the full hold estimate. So a role
  // the estimate needs is always weighed, and the search stays at about 25 estimates.
  function shortlist(list) {
    if (list.length <= T.deep) return list;
    const p = P(), f0 = p.field, groups = {};
    try {
      for (const f of list) {
        p.field = f.slice();
        const q = fieldCompDps() + heroDps();
        const g = (f.some(k => R(k).role === 'tank') ? 't' : '') + (f.some(k => R(k).role === 'support') ? 's' : '');
        (groups[g] = groups[g] || []).push({ f, q });
      }
    } finally { p.field = f0; }
    const out = [];
    for (const g in groups) out.push(...groups[g].sort((a, b) => b.q - a.q).slice(0, T.deep).map(x => x.f));
    return out;
  }
  const sameSet = (a, b) => a.length === b.length && a.every(k => b.includes(k));
  const sameCells = (a, b, keys) => keys.every(k => a && b && a[k] && b[k] && a[k].col === b[k].col && a[k].lane === b[k].lane);

  // ---------------- the why line ----------------
  function reasons(best, evals, z) {
    const fk = foeKey(z), foes = FOE_WORD[fk] || 'foes here';
    const out = [];
    const lacking = test => { let s = 0; for (const e of evals) if (!e.field.some(test) && e.score > s) s = e.score; return evals.some(e => !e.field.some(test)) ? s : null; };
    const need = (test, text) => {
      if (!best.field.some(test)) return;
      const s = lacking(test); if (s == null) return;
      const w = evals.find(e => e.score === s && !e.field.some(test));
      // a reason only when the hold estimate says so: without it the zone does not hold (or holds much worse)
      if (w && ((!w.holds && best.holds) || (!best.holds && w.margin < best.margin * (1 - T.needGap)))) out.push(text);
    };
    need(k => R(k).role === 'tank', 'tank');
    need(k => R(k).role === 'support', 'healer');
    if (out.length) out.splice(0, out.length, `a ${out.join(' and a ')} for the ${foes}`);
    if (fk === 'bones' || fk === 'golem') need(k => R(k).role === 'caster', 'a caster for the armour');
    if (fk === 'wraith') need(k => !!STUNS[k], 'a stun for the healers');
    return out.slice(0, 2);
  }
  function whyLine(best, rs, goal) {
    const syn = best.synergies.slice().sort((a, b) => b.strength - a.strength).slice(0, 2).map(s => s.name);
    const head = syn.join(' + ');
    const tail = rs.join(' and ');
    if (head && tail) return `${head}, ${tail}`;
    if (head || tail) return head || (tail[0].toUpperCase() + tail.slice(1));
    return goal === 'farm' ? 'The fastest gold here' : best.holds ? 'Your strongest three' : 'Your toughest three';
  }

  // ---------------- search (cached) ----------------
  let cache = new Map(), cacheFor = null;
  function sigOf(o, z, goal, by) {
    const step = Math.max(1, T.lvStep);
    let s = [heroCls(), z, goal, by, o.key || (typeof o.filter === 'function' ? '' : JSON.stringify(o.filter || null)), S.L, Math.floor((S.blade || 0) / 10)].join('|') + '|';
    for (const k of rosterList()) { const r = charRec(k); s += k + Math.floor(r.lv / step) + '.' + r.rank + '.' + r.wpn + '.' + r.trk + (onExped(k) ? 'x' : '') + ','; }
    return s;
  }
  bestLineup = opts => {
    if (!(typeof rosterLive === 'function' && rosterLive())) return null;
    const o = opts || {}, goal = o.goal === 'farm' ? 'farm' : 'push', by = o.by === 'potential' ? 'potential' : 'now';
    const z = Math.max(1, Math.floor(o.zone || (goal === 'farm' ? S.zone : S.maxZone) || 1));
    const cacheable = typeof o.filter !== 'function' || !!o.key;
    if (cacheFor !== S) { cache = new Map(); cacheFor = S; }
    const sig = cacheable ? sigOf(o, z, goal, by) : null;
    let res = sig ? cache.get(sig) : null;
    if (!res) {
      const pass = filterFn(o.filter), list = candidates(pass);
      res = withLevels(by, list, () => {
        const evals = shortlist(combos(list)).map(f => measure(f, placeAll(f), z, goal)).sort((a, b) => b.score - a.score);
        if (!evals.length) evals.push(measure([], placeAll([]), z, goal));
        // Hearth cells for the best few: keep them when they score higher.
        for (let i = 0; i < Math.min(T.hearthTop, evals.length); i++) {
          for (const c of hearthCells(evals[i].field)) { const m = measure(evals[i].field, c, z, goal); if (m.score > evals[i].score * (1 + 1e-9)) evals[i] = m; }
        }
        evals.sort((a, b) => b.score - a.score);
        const best = evals[0], rs = reasons(best, evals, z);
        return { best, rs, cand: list.length, n: evals.length };
      });
      if (sig) { if (cache.size > 24) cache.clear(); cache.set(sig, res); }
    }
    // The pick is cached; its numbers and the field you have now are measured fresh (two estimates),
    // so the preview compares like with like and follows your moves.
    const b = withLevels(by, res.best.field, () => measure(res.best.field, res.best.cells, z, goal));
    const f0 = (P().field || []).filter(k => isRecruited(k)).slice(0, 3), c0 = P().cells || {};
    const same = sameSet(f0, b.field) && sameCells(c0, b.cells, ['hero'].concat(b.field));
    let current = null;
    if (same) current = { score: b.score, dps: b.dps, holds: b.holds };
    else try { const m = withLevels(by, f0, () => measure(f0, c0, z, goal)); current = { score: m.score, dps: m.dps, holds: m.holds }; } catch (e) {}
    return {
      field: b.field.slice(), cells: JSON.parse(JSON.stringify(b.cells)), score: b.score, why: whyLine(b, res.rs, goal),
      parts: { zone: z, goal, by, dps: b.dps, holds: b.holds, margin: b.margin, goldPerSec: b.goldPerSec, synergies: b.synergies.slice(), reasons: res.rs.slice(),
        foe: foeKey(z), current, gain: current && current.score > 0 ? b.score / current.score : null, same, cand: res.cand }
    };
  };
  lineupScore = (field, opts) => {
    const o = opts || {}, goal = o.goal === 'farm' ? 'farm' : 'push';
    const z = Math.max(1, Math.floor(o.zone || (goal === 'farm' ? S.zone : S.maxZone) || 1));
    const f = (field || []).filter(k => isRecruited(k)).slice(0, 3);
    return withLevels(o.by, f, () => measure(f, o.cells || placeAll(f), z, goal));
  };
  applyLineup = res => {
    if (!res || !Array.isArray(res.field)) return null;
    const f = setField(res.field);
    if (res.cells && sameSet(f, res.field) && res.cells.hero) {
      P().cells = JSON.parse(JSON.stringify(res.cells));   // a new object: the stage watches identity
      emit('fieldChange', { field: P().field });
    }
    return f;
  };
}
