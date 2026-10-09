// 56e-abilities: learning abilities with Scrolls (docs/design/combat-turn-build.md "Unlocks"; data: 24c-data-abilities.js).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Each hero starts with their signature (Echo Shot, Shield Bash, Fireball). The other 13 are learned on the Hero tab
// (75-abilities-ui.js) by spending a Scroll of their tier, once the hero reaches that tier's level (ABILITY_TIERS).
// A higher Scroll can pay for a lower tier. Scrolls belong to the lamp (shared by every hero) and drop from zone bosses:
// one for sure the first time each zone's boss falls, then a 1 in 5 chance on a replay, never more than 5 replays dry.
//   abilityOwned(hero, id) -> bool
//   abLearnInfo(hero, id) -> { id, a, owned, tier, lv, lvOk, scroll, payWith, why }   why: '' (can learn now) | a reason
//   abilityLearn(hero, id) -> bool (spends the Scroll; emits abilityLearned { hero, id })
//   scrollCount(id) -> n; scrollFor(zone) -> the Scroll id a zone's boss drops
//   scrollUsable(hero, id) -> bool: the hero can learn a move with that Scroll now (a move of its tier or lower, not owned, level met)
//   scrollSpares(hero) -> { short: [{ id, lv }], spare: [{ id, n, play: [hero], join: [hero] }], idle: [id] } for the Scrolls held
//     (scroll-spares): short, the hero still has moves a Scroll pays for but the level is short (lv: the lowest that opens one);
//     spare, the hero has learned every move it pays for, and play / join name the other starters who still lack one (met: you can
//     play them; not met: they join on the road); idle, no starter lacks one.
// Events: scrollDrop { id, n, first, firstEver }, abilityLearned { hero, id }.
// Save: registerState('abil', { unl: { hero: [ids] }, scrolls: { id: n }, dry: { id: n }, got: { id: n } }).
// Talents (24e): each learned ability, and Attack, Parry and Dodge, has two talents, a free A | B toggle (no points).
// Choices change freely; a fight takes them as it starts. An unpicked slot has no talent: no default is written.
//   talentsOf(hero) -> { id: 'a' | 'b' } (only abilities the hero owns)
//   talentSet(hero, id, 'a' | 'b' | null) -> bool (null clears it; emits talentSet)
// Save: S.abil.tal = { hero: { id: 'a' | 'b' } }; S.abil.resTip = { hero: 1 } (the resource line has shown on its own, 75-turn-ui).
// The Learn order (loadout-odds, W10): the moves the hero can learn now, by what each does to the zone boss line (55-fight-delta
// loadoutOdds). A move is tried as one change to the slots: it goes into slot p, and the move that sat there takes the slot of the one
// going out (d; when p is d it simply replaces it), the rest stay. Its best spot ranks it. Never a whole set: one move, one spot.
//   learnOdds(k, sync) -> { zone, base, rows: [{ id, win, p, d, out, eq, lift }] (best first) } | null (pending, nothing to learn, no
//     turn fight). base: the slots now; out: the move that leaves the slots ('' for none); lift: loadoutWins(base, win) or null.
//   learnPick(k) -> abLearnInfo of the move Learn names first, with .row (its learnOdds row) once the odds are in
//   abilityPlace(k, row) -> puts a learned move in its spot (p, d) as the row says
var abilityOwned, abLearnInfo, abilityLearn, scrollCount, scrollFor, scrollUsable, scrollSpares, talentsOf, talentSet, learnOdds, learnPick, abilityPlace;
{
  const SCROLL_TUNE = { replay: 0.2, pity: 5 };
  const blank = () => ({ unl: { wren: [], tobin: [], pip: [] }, scrolls: {}, dry: {}, got: {}, tal: { wren: {}, tobin: {}, pip: {} }, resTip: {} });
  registerState('abil', blank());
  const A = () => S.abil || (S.abil = blank());
  const lvOf = k => { try { const l = soloLevels()[k]; return l ? l.L : 1; } catch (e) { return S.L || 1; } };
  abilityOwned = (k, id) => {
    const a = ABILITIES[id]; if (!a || a.hero !== k) return false;
    if (!a.tier) return true;
    const u = A().unl[k]; return Array.isArray(u) && u.includes(id);
  };
  scrollCount = id => Math.max(0, A().scrolls[id] | 0);
  // the Scroll that pays for tier t: that tier's own if you have one, else the lowest higher one you have
  const payFor = t => { for (let i = t - 1; i < SCROLL_ORDER.length; i++) if (scrollCount(SCROLL_ORDER[i]) > 0) return SCROLL_ORDER[i]; return ''; };
  abLearnInfo = (k, id) => {
    const a = ABILITIES[id], tier = a ? a.tier : 0, T = ABILITY_TIERS[tier] || null;
    const owned = abilityOwned(k, id), lv = T ? T.lv : 1, lvOk = lvOf(k) >= lv, scroll = T ? T.scroll : '', payWith = tier ? payFor(tier) : '';
    const why = owned ? 'owned' : !a || a.hero !== k ? 'other' : !lvOk ? `Level ${lv}` : !payWith ? `Needs a ${SCROLLS[scroll].name}` : '';
    return { id, a, owned, tier, lv, lvOk, scroll, payWith, why };
  };
  // a hero's moves a Scroll of tier t pays for that they have not learned
  const leftFor = (k, t) => (typeof HERO_ABILITIES === 'object' && HERO_ABILITIES[k] || []).filter(id => { const a = ABILITIES[id]; return a && a.tier && a.tier <= t && !abilityOwned(k, id); });
  scrollUsable = (k, id) => { const sc = SCROLLS[id]; return !!sc && leftFor(k, sc.tier).some(x => lvOf(k) >= ABILITY_TIERS[ABILITIES[x].tier].lv); };
  scrollSpares = k => {
    const out = { short: [], spare: [], idle: [] };
    const starters = typeof ROSTER === 'object' ? Object.keys(ROSTER).filter(h => h !== k && ROSTER[h].route && ROSTER[h].route.type === 'starter' && HERO_ABILITIES[h]) : [];
    for (const id of SCROLL_ORDER) {
      const n = scrollCount(id); if (!n) continue;
      const t = SCROLLS[id].tier, left = leftFor(k, t);
      if (left.length) { if (!scrollUsable(k, id)) out.short.push({ id, lv: Math.min(...left.map(x => ABILITY_TIERS[ABILITIES[x].tier].lv)) }); continue; }
      const need = starters.filter(h => leftFor(h, t).length);
      if (!need.length) { out.idle.push(id); continue; }
      const met = h => typeof heroCanPlay === 'function' ? !!heroCanPlay(h) : true;
      out.spare.push({ id, n, play: need.filter(met), join: need.filter(h => !met(h)) });
    }
    return out;
  };
  abilityLearn = (k, id) => {
    const i = abLearnInfo(k, id);
    if (i.why) return false;
    const s = A();
    s.scrolls[i.payWith] = scrollCount(i.payWith) - 1;
    if (!Array.isArray(s.unl[k])) s.unl[k] = [];
    s.unl[k].push(id);
    emit('abilityLearned', { hero: k, id });
    return true;
  };
  const talOk = (k, id) => typeof TALENTS === 'object' && !!TALENTS[id] && (id.includes(':') ? id.startsWith(k + ':') : abilityOwned(k, id));
  const talRec = k => { const s = A(); if (!s.tal || typeof s.tal !== 'object') s.tal = {}; if (!s.tal[k] || typeof s.tal[k] !== 'object') s.tal[k] = {}; return s.tal[k]; };
  talentsOf = k => { const out = {}, r = talRec(k); for (const id in r) if ((r[id] === 'a' || r[id] === 'b') && talOk(k, id)) out[id] = r[id]; return out; };
  talentSet = (k, id, c) => {
    if (!talOk(k, id) || (c != null && c !== 'a' && c !== 'b')) return false;
    const r = talRec(k);
    if (c == null) { delete r[id]; emit('talentSet', { hero: k, id, choice: null }); return true; }
    r[id] = c; emit('talentSet', { hero: k, id, choice: c });
    return true;
  };
  scrollFor = z => {
    if (typeof isRegionBoss === 'function' && isRegionBoss(z)) return 'mother';
    for (const [last, id] of SCROLL_BANDS) if (z <= last) return id;
    return 'roadlight';
  };
  // the spots one move can take in the slots eq (see learnOdds above), each once
  const spotsFor = (eq, m) => {
    const out = [], seen = new Set();
    for (let p = 0; p < 3; p++) for (let d = 0; d < 3; d++) {
      const occ = eq[p] || null; if (d !== p && !occ) continue;   // nothing to move: it would drop a move for nothing
      const e = eq.slice(0, 3); e[p] = m; if (d !== p) e[d] = occ;
      const key = e.join(); if (seen.has(key)) continue; seen.add(key);
      out.push({ eq: e, p, d, out: d === p ? occ || '' : eq[d] || '' });
    }
    return out;
  };
  learnOdds = (k, sync) => {
    if (!k || k !== soloHero() || typeof loadoutOdds !== 'function' || typeof HERO_ABILITIES !== 'object' || !HERO_ABILITIES[k]) return null;
    const ids = HERO_ABILITIES[k].filter(id => !abLearnInfo(k, id).why); if (!ids.length) return null;
    const eq = soloEquipped().slice(0, 3), spots = ids.map(id => spotsFor(eq, id));
    const r = loadoutOdds([eq].concat(...spots.map(ss => ss.map(s => s.eq))), { sync: !!sync });
    if (!r || r.wins.some(w => w == null)) return null;
    let j = 1; const base = r.wins[0], rows = [];
    ids.forEach((id, i) => { let best = null; for (const s of spots[i]) { const w = r.wins[j++]; if (!best || w > best.win) best = Object.assign({ id, win: w }, s); }
      if (best) rows.push(Object.assign(best, { lift: loadoutWins(base, best.win) })); });
    const ord = id => HERO_ABILITIES[k].indexOf(id);
    rows.sort((a, b) => b.win - a.win || ABILITIES[a.id].tier - ABILITIES[b.id].tier || ord(a.id) - ord(b.id));
    return { zone: r.zone, base, rows };
  };
  // in one change (one soloEquip event), so nothing reads the slots half done
  abilityPlace = (k, row) => {
    if (!row || k !== soloHero() || !abilityOwned(k, row.id) || typeof soloEquipped !== 'function') return false;
    const cur = soloEquipped(); if (cur.includes(row.id)) return false;
    const next = cur.slice(0, 3), occ = next[row.p] || null;
    next[row.p] = row.id; if (row.d !== row.p && occ) next[row.d] = occ;
    cur.splice(0, 3, ...next);
    emit('soloEquip', { hero: k, slot: row.p, id: row.id });
    return true;
  };
  // Next Up (55-goals): a Scroll in hand and an ability it can teach the hero you play. Once the odds are in, the move that lifts the
  // zone boss line most; until then (or with no turn fight, or when no move lifts it) the lowest tier, then the list's order
  learnPick = k => { k = k || soloHero(); if (!k || typeof HERO_ABILITIES !== 'object' || !HERO_ABILITIES[k]) return null;
    const lo = learnOdds(k);
    if (lo && lo.rows.length && lo.rows[0].lift && lo.rows[0].lift.after > lo.rows[0].lift.before) { const row = lo.rows[0], i = abLearnInfo(k, row.id); i.row = row; i.zone = lo.zone; i.base = lo.base; return i; }
    let best = null; for (const id of HERO_ABILITIES[k]) { const i = abLearnInfo(k, id); if (!i.why && (!best || i.tier < best.tier)) best = i; } return best; };
  const learnable = () => learnPick(soloHero());
  registerGoal({ id: 'learn-ability', sys: 'hero', prio: 4, pct: () => { const k = soloHero(); return k && typeof HERO_ABILITIES === 'object' && HERO_ABILITIES[k] && HERO_ABILITIES[k].some(id => !abLearnInfo(k, id).why) ? 1 : null; },
    label: () => { const i = learnable(); if (!i) return '';
      const L = i.row && i.row.lift; return L ? `Learn ${i.a.name}: zone ${i.zone} boss, about ${L.after} in 10 wins (now ${L.before})` : `Learn ${i.a.name}: your ${SCROLLS[i.payWith].name} is ready`; },
    icon: () => ({ ic: ['sword', '#F2C14E'] }),
    go: () => { const i = learnable(); return { tab: 'party', view: 'abilities', sel: i ? `#sec-abilities .ab-det[data-ab="${i.id}"] .ab-learn` : '#sec-abilities',
      fn: () => { if (i && typeof abilityOpenDetail === 'function') abilityOpenDetail(i.id); } }; } });   // the Learn button sits in the detail, so open it
  // the drop: a zone boss's kill (50-sim killPack emits zoneClear on a first clear, then kill)
  let firstZ = 0;
  on('zoneClear', p => { firstZ = p ? p.zone : 0; });
  on('kill', p => {
    if (!p || !p.mob || !p.mob.boss) return;
    const z = p.zone, id = scrollFor(z), s = A(), first = firstZ === z; firstZ = 0;
    let drop = first;
    if (!drop) { s.dry[id] = (s.dry[id] | 0) + 1; drop = s.dry[id] >= SCROLL_TUNE.pity || Math.random() < SCROLL_TUNE.replay; }
    if (!drop) return;
    s.dry[id] = 0; s.scrolls[id] = scrollCount(id) + 1; s.got[id] = (s.got[id] | 0) + 1;
    const ever = SCROLL_ORDER.reduce((n, k) => n + (s.got[k] | 0), 0);
    emit('scrollDrop', { id, n: s.scrolls[id], first, firstEver: ever <= 1 });
    // the first Scroll ever teaches what it is for: Old Hesketh says it between fights (75-onboard-ui, cal-0107-staged-guide), so with tips on
    // the toast is only the bell's entry; after that a quiet line, only when the hero in play can learn with it now (scroll-spares: a spare
    // drops quietly, the stage float shows it and Abilities says who it is for)
    if (ever <= 1) toast(`${SCROLLS[id].name}! Spend it on the Hero tab to learn an ability.`, 'good', null, S.onboard && S.onboard.tips ? 'low' : 'high');
    else if (!soloHero() || scrollUsable(soloHero(), id)) toast(`${SCROLLS[id].name} found.`, 'good', null, 'low');
  });
}
