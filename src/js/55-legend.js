// 55-legend: legendary powers and circle sets, the core (docs/design/legendaries.md, task L2).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Data: 21c-data-legend.js (LEG_*, legendVal/legendText/legendP). Combat powers: 59e-legend-combat (L3).
// UI: 75-legend-ui (L4). Sim: tools/sim.mjs --legend (L6).
//
// Exposed names:
//   book     legendRank(id) is 21c's clamp; here: legendKnown(id) -> Book rank (0 = not learned),
//            legendEchoes(id) -> 0..3, legendEchoCap() -> the highest rank Echoes can reach (2.2)
//   drops    legendDrop(rank, source, opts?) -> { id, rank, kind: 'item'|'echo'|'rankUp'|'book', item } | null
//              opts: { id (a set power), pool: 'class'|'comp', z (drop zone), t (item tier), rnd, quiet }.
//              A power you do not know comes on a Legendary item (Epic power, `lg` + `lr`) that is wearable
//              and can be learned; a known one goes to the Book at once (an Echo, or a higher rank). A full
//              bag learns the item at once (no dead drops). null when nothing can drop yet (no class and no
//              companion): the roll is then kept in S.legend.owed and paid later.
//            legendOwe(rank, source, opts?) -> records a roll for later (sources that land before they can pay)
//            legendPayOwed() -> n paid (S.legend.owed, and S.oath.owed if the Oath core recorded any)
//   actions  every action returns falsy when refused; canX returns { ok, why, cost? } with player text
//            legendLearn(itemId) / legendCanLearn(itemId)          Learn: the item breaks down (normal salvage)
//            legendInscribe(id, itemId) / legendCanInscribe(id, itemId)   cost { pearls, ess, gold, t, rank }
//            legendMark(itemId, circle) / legendCanMark(itemId, circle)   cost { sigil, pearls, t }; circle: index or key
//            legendMarkWhy(kind, t, circle) -> '' | why, legendMarkPay(item, circle) (Mark at craft, 55-crafting)
//            legendSigil(circle, n, source) -> adds Circle Crests (Oath elders at 8+ call this, O1)
//   limits   legendHeroCheck(itemId, pos) -> { ok, why, off: itemId | null } (the in-page "take off X?" ask)
//            legendCanWear(charId, item, pos) -> { ok, why } (a companion carries 1 power; equipChar asks)
//   read     legendActive() -> { hero: [{ id, rank, item, pos }], comp: [{ id, rank, char, item, pos }],
//                               members: { circle: n }, sets, budget }   (cached; gear/charGear/fieldChange)
//            legendSets() -> { n: [4 counts], tier: { circle: 0|2|4|6 }, active: [circles, at most 2] }
//            legendSetTier(circle) -> 0|2|4|6 (0 unless it is one of the 2 active sets)
//            legendBudget() -> { raw, capped, cap, scale, rank, hit }   the runtime cap (6, coordinator decision)
//            legendScale() -> capped / raw (<= 1): multiply every legendary damage gain by it
//            legendV(id, key) -> the power's value at its active rank (0 when not active); not scaled
//            legendWearers(id) -> companion ids wearing it (active), legendItemRank(item) -> rank the item uses
//            legendItemState(item, who?) -> { on, why, rank } (why an item's power is off: class, role, limit)
//            legendCardLines(item, who?) -> [{ k: 'power'|'mark', txt, sub, on, col }]  (41-items itemLegendLines)
//            legendBest(cls, rank, opts?) -> the best legal build estimate { raw, capped, cap, hero, comp, line, sets }
//            LEG_RUN[id] -> 'simple' (run here) | 'combat' (L3) | 'util' (not wired yet)
//   bonus    bonus('lg:<id>') -> the power's active rank (0 when not active), for the class and combat code
//            bonus('lg:cause') -> extra Common Cause (Hedgelight Lamp, Hearth and Hedge 2): 56b reads it (L3)
//
// Simple powers and set tiers run here: Oathkeeper's Banner (mod 'party'), Dusk Contract (mod 'crit'),
// Wayfarer's Lamp and Hedgelight Lamp (tune:embersMax / tune:blessMax), Ossuary Staff (addCharModifier),
// Hearth and Hedge 2/4/6 (gold, Hedgefolk speed, Common base power), Night Work 2 (critDmg),
// Road Songs 2 (abilityCd). Every damage part is multiplied by legendScale(); gold and knobs are not.
//
// The runtime cap (coordinator decision, wave-log): every active power's and set tier's damage estimate
// (legendP / the set tier's p; a per-member power once per fielded companion of its circle; a companion
// power at LEG_CAPS.model.comp) is summed into one budget and clamped to the cap for the highest active
// rank (+30/+45/+70% at I/III/V from LEG_CAPS.best, straight lines for II and IV). scale = capped / raw.
//
// Events: legendDrop { id, rank, kind, source, item }, legendLearn { id, rank, echo, up },
//   legendRank { id, rank }, legendInscribe { id, item }, legendMark { item, circle },
//   legendSigil { circle, n, source }, legendChange (anything the cache reads changed).
// Listens: expedBack { g, circles, recall } (57b), milestone { id, lv } (Bond at 25), gear, charGear,
//   fieldChange, recruit, classChosen.
//
// Save: registerState('legend', { v, book, echo, sig, coastGrant, bondCredit, seen, owed, bondSwept, n }).
//   owed: [{ r, src, opts }] rolls not paid yet. n: { drops, learned } counters. Item fields: lg (power id),
//   lr (rank at drop, legendary items only), cm (circle mark 0-3). All optional; missing = none.

const LEG_RUN = {};
let legendKnown, legendEchoes, legendEchoCap, legendDrop, legendOwe, legendPayOwed, legendLearn, legendCanLearn,
  legendInscribe, legendCanInscribe, legendMark, legendCanMark, legendMarkWhy, legendMarkPay, legendSigil,
  legendHeroCheck, legendCanWear, legendActive, legendSets, legendSetTier, legendBudget, legendScale, legendV,
  legendWearers, legendItemRank, legendItemState, legendCardLines, legendBest;

{
  registerState('legend', {
    v: 1, book: {}, echo: {}, sig: [0, 0, 0, 0], coastGrant: 0, bondCredit: {}, seen: {},
    owed: [], bondSwept: 0, n: { drops: 0, learned: 0 }
  });
  const L = () => S.legend;
  const T = LEG_TUNE;
  const P = id => LEG_POWERS[id];
  const HERO_POS = LEG_FITS.hero;
  const no = (why, x) => Object.assign({ ok: false, why }, x);
  const yes = x => Object.assign({ ok: true, why: '' }, x);
  const rn = r => roman(r);

  // Which powers run here (simple), wait for party combat (combat, L3), or sit outside combat (util).
  const SIMPLE = ['banner', 'contract', 'wayfarer', 'hedgelight', 'ossuary'];
  for (const id of LEG_IDS) LEG_RUN[id] = SIMPLE.includes(id) ? 'simple' : P(id).wire === 'util' ? 'util' : 'combat';

  // ---------------- small helpers ----------------
  const circleIdx = c => typeof c === 'number' ? (c >= 0 && c < 4 ? c | 0 : -1) : LEG_CIRCLES.indexOf(c);
  const circleName = i => LEG_CIRCLE_NAME[LEG_CIRCLES[i]];
  const heroCls = () => (S.party && S.party.cls) || null;
  const live = () => { try { return rosterLive(); } catch (e) { return false; } };
  const fieldKeys = () => live() ? ((S.party && S.party.field) || []).filter(isRecruited).slice(0, 3) : [];
  const pearlLive = () => !!(S.mats && Array.isArray(S.mats.pearl));   // Pearls arrive with Region 2 (R2)
  const pearlHave = t => pearlLive() ? S.mats.pearl[t - 1] || 0 : Infinity;
  const pearlPay = (t, n) => { if (pearlLive()) S.mats.pearl[t - 1] -= n; };
  const pearlWhy = (t, n) => `${n - pearlHave(t)} more ${pearlLive() && MAT.pearl ? matName('pearl', t) : 'Pearls'}`;
  const charName = id => ROSTER[id] ? ROSTER[id].name.split(' ')[0] : 'They';

  // ---------------- cache ----------------
  let ver = 0, cache = null;
  const dirty = () => { ver++; cache = null; };
  const changed = () => { dirty(); emit('legendChange', {}); };
  for (const e of ['gear', 'charGear', 'fieldChange', 'recruit', 'classChosen', 'promote']) on(e, dirty);

  // ---------------- the Book ----------------
  legendKnown = id => (L().book[id] | 0);
  legendEchoes = id => (L().echo[id] | 0);
  // Echoes rank up to one band above your highest Oath kept (2.2). No Oath kept: rank I.
  const bandOf = lv => lv > 0 ? T.bandLevels.filter(b => lv >= b).length : 0;
  legendEchoCap = () => Math.min(T.ranks, bandOf((S.oath && S.oath.maxL) | 0) + T.echoCapAbove);
  const echoUp = (id, quiet) => {
    const b = L().book, e = L().echo; let up = 0;
    while ((e[id] | 0) >= T.echoPerRank && (b[id] | 0) < legendEchoCap()) { e[id] -= T.echoPerRank; b[id]++; up++; }
    if ((e[id] | 0) > T.echoPerRank) e[id] = T.echoPerRank;   // banked until the cap rises
    if (up) {
      emit('legendRank', { id, rank: b[id] });
      if (!quiet) toast(`${P(id).n} is now rank ${rn(b[id])}.`, 'loot', { ic: legendIconSafe(id) }, 'high');
    }
    return up;
  };
  // A power reaches the Book at rank r: new, an Echo (r <= Book rank) or a higher rank (keeps the Echoes).
  function toBook(id, r, quiet) {
    const b = L().book; r = legendRank(r);
    if (!b[id]) { b[id] = r; L().n.learned++; changed(); return { kind: 'book', rank: r }; }
    if (r > b[id]) {
      b[id] = r; changed();
      emit('legendRank', { id, rank: r });
      if (!quiet) toast(`${P(id).n} is now rank ${rn(r)}.`, 'loot', { ic: legendIconSafe(id) }, 'high');
      return { kind: 'rankUp', rank: r };
    }
    L().echo[id] = (L().echo[id] | 0) + 1;
    const up = echoUp(id, quiet);
    changed();
    if (!up && !quiet) toast(`Echo of ${P(id).n}: ${Math.min(T.echoPerRank, legendEchoes(id))}/${T.echoPerRank} toward rank ${rn(Math.min(T.ranks, b[id] + 1))}.`, 'good', { ic: legendIconSafe(id) }, 'normal');
    return { kind: up ? 'rankUp' : 'echo', rank: b[id] };
  }
  const legendIconSafe = id => { try { return legendIcon(id); } catch (e) { return ['star', LEG_COL]; } };

  // ---------------- what fits where ----------------
  // An item's rank: the Book's; a legendary item not yet learned uses the higher of its own and the Book's.
  legendItemRank = it => it && it.lg && P(it.lg) ? Math.max(legendKnown(it.lg), it.lr | 0) : 0;
  const heroUses = id => { const p = P(id); return !!p && p.fits === 'hero' && (p.cls == null || p.cls === heroCls()); };
  const compUses = (id, charId, pos) => {
    const p = P(id), R = ROSTER[charId]; if (!p || !R || p.fits === 'hero') return false;
    if (p.only && p.only !== charId) return false;
    return p.fits === 'trinket' ? pos === 'trk' : pos === 'wpn' && R.role === p.fits;
  };

  // ---------------- the active build (cached) ----------------
  function heroList() {
    const out = [];
    for (const pos of HERO_POS) {
      const it = itemById(S.equip[pos]);
      if (it && it.lg && P(it.lg) && legendItemRank(it) > 0 && fits(it, pos, 'hero')) out.push({ pos, it });
    }
    return out;
  }
  // The hero's active powers: the first 2 distinct usable powers by position.
  function heroActive(list) {
    const act = [];
    for (const { pos, it } of list || heroList()) {
      if (!heroUses(it.lg) || act.some(a => a.id === it.lg) || act.length >= T.heroMax) continue;
      act.push({ id: it.lg, rank: legendItemRank(it), item: it, pos });
    }
    return act;
  }
  function compute() {
    const field = fieldKeys(), members = {}, comp = [], n = [0, 0, 0, 0];
    for (const c of LEG_CIRCLES) members[c] = 0;
    for (const k of field) members[ROSTER[k].circle] = (members[ROSTER[k].circle] || 0) + 1;
    const hero = heroActive();
    for (const pos of HERO_POS) {
      const it = itemById(S.equip[pos]);
      if (it && it.cm != null && n[it.cm] != null && fits(it, pos, 'hero')) n[it.cm]++;
    }
    for (const k of field) {
      const r = charRec(k); let has = false;
      for (const pos of CRAFT_COMP_POS) {
        const it = r && r[pos] != null ? itemById(r[pos]) : null;
        if (!it || !fits(it, pos, k)) continue;
        if (it.cm != null && n[it.cm] != null) n[it.cm]++;
        if (!has && it.lg && legendItemRank(it) > 0 && compUses(it.lg, k, pos)) { has = true; comp.push({ id: it.lg, rank: legendItemRank(it), char: k, item: it, pos }); }
      }
    }
    const tierOf = c => T.setTiers.filter(t => c >= t).pop() || 0;
    const order = LEG_CIRCLES.map((c, i) => i).filter(i => tierOf(n[i]) > 0).sort((a, b) => n[b] - n[a] || a - b).slice(0, T.setsActive);
    const tier = {}; for (const c of LEG_CIRCLES) tier[c] = 0;
    for (const i of order) tier[LEG_CIRCLES[i]] = tierOf(n[i]);
    const sets = { n, tier, active: order.map(i => LEG_CIRCLES[i]) };
    // the budget
    let raw = 0, top = 0;
    for (const a of hero) { const p = P(a.id); raw += legendP(a.id, a.rank) * (p.per && p.pPer ? members[p.per] || 0 : 1); top = Math.max(top, a.rank); }
    for (const a of comp) { raw += legendP(a.id, a.rank) * LEG_CAPS.model.comp; top = Math.max(top, a.rank); }
    for (const c of sets.active) for (const t of T.setTiers) if (t <= tier[c]) raw += LEG_SETS[c].tiers[t].p;
    const rank = top || 1, cap = capAt(rank), capped = Math.min(raw, cap);
    const budget = { raw, capped, cap, scale: raw > cap ? capped / raw : 1, rank, hit: raw > cap };
    return { S, ver, hero, comp, members, sets, budget };
  }
  // The cap for a rank: LEG_CAPS.best at I / III / V, straight lines between.
  function capAt(r) {
    const b = LEG_CAPS.best, ks = Object.keys(b).map(Number).sort((x, y) => x - y);
    r = legendRank(r);
    for (let i = 0; i < ks.length - 1; i++) if (r >= ks[i] && r <= ks[i + 1]) return b[ks[i]] + (b[ks[i + 1]] - b[ks[i]]) * (r - ks[i]) / (ks[i + 1] - ks[i]);
    return b[ks[ks.length - 1]];
  }
  const A = () => (cache && cache.S === S && cache.ver === ver) ? cache : (cache = compute());
  legendActive = () => A();
  legendSets = () => A().sets;
  legendSetTier = c => A().sets.tier[typeof c === 'number' ? LEG_CIRCLES[c] : c] || 0;
  legendBudget = () => A().budget;
  legendScale = () => A().budget.scale;
  const activeRank = id => {
    const a = A(); let r = 0;
    for (const x of a.hero) if (x.id === id) r = Math.max(r, x.rank);
    for (const x of a.comp) if (x.id === id) r = Math.max(r, x.rank);
    return r;
  };
  legendV = (id, key) => { const r = activeRank(id); return r ? legendVal(id, key, r) : 0; };
  legendWearers = id => A().comp.filter(x => x.id === id).map(x => x.char);
  for (const id of LEG_IDS) addBonus('lg:' + id, () => activeRank(id));

  // Why an item's power is on or off for its wearer (who: 'hero', a roster id, or null = whoever wears it).
  legendItemState = (it, who) => {
    if (!it || !it.lg || !P(it.lg)) return { on: false, why: '', rank: 0 };
    const p = P(it.lg), rank = legendItemRank(it), a = A();
    if (who == null) {
      if (HERO_POS.some(pos => S.equip[pos] === it.id)) who = 'hero';
      else { const rec = (S.party && S.party.rec) || {}; who = Object.keys(rec).find(k => CRAFT_COMP_POS.some(pos => rec[k] && rec[k][pos] === it.id)) || null; }
    }
    if (p.fits === 'hero') {
      if (p.cls && p.cls !== heroCls()) return { on: false, why: `Works for a ${HERO_CLASSES[p.cls] ? HERO_CLASSES[p.cls].name : p.cls} hero only.`, rank };
      if (who !== 'hero') return { on: false, why: who ? 'Only your hero can use this power.' : 'Equip it on your hero.', rank };
      if (a.hero.some(x => x.item === it)) return { on: true, why: '', rank };
      if (a.hero.some(x => x.id === it.lg)) return { on: false, why: 'Your hero already uses this power.', rank };
      return { on: false, why: `Your hero carries ${T.heroMax} legendary powers.`, rank };
    }
    if (p.only && who !== p.only) return { on: false, why: `Works for ${charName(p.only)} only.`, rank };
    if (who === 'hero' || !who) return { on: false, why: p.fits === 'trinket' ? 'A companion must wear it.' : `A ${ROLE_STATS[p.fits].n.toLowerCase()} companion must wear it.`, rank };
    if (p.fits !== 'trinket' && ROSTER[who] && ROSTER[who].role !== p.fits) return { on: false, why: `Works on a ${ROLE_STATS[p.fits].n.toLowerCase()} only.`, rank };
    if (a.comp.some(x => x.item === it)) return { on: true, why: '', rank };
    if (!fieldKeys().includes(who)) return { on: false, why: `${charName(who)} is not in the party.`, rank };
    return { on: false, why: `${charName(who)} carries another legendary power.`, rank };
  };
  legendCardLines = (it, who) => {
    const out = [];
    if (it && it.lg && P(it.lg)) {
      const st = legendItemState(it, who), rank = st.rank || 1;
      const learn = it.lr && !legendKnown(it.lg) ? 'Learn it to keep it forever.' : '';
      const sub = st.on ? learn : [st.why, learn].filter(Boolean).join(' ');
      out.push({ k: 'power', id: it.lg, txt: `${P(it.lg).n} (rank ${rn(rank)}): ${legendText(it.lg, rank)}`, sub, on: st.on, col: LEG_COL });
    }
    if (it && it.cm != null && LEG_CIRCLES[it.cm]) {
      const c = LEG_CIRCLES[it.cm];
      out.push({ k: 'mark', circle: c, txt: `${circleName(it.cm)} mark: counts toward ${LEG_SETS[c].n}.`, sub: '', on: true, col: LEG_COL });
    }
    return out;
  };

  // ---------------- limits ----------------
  // The in-page ask before a hero equip (2.3): which powered item would have to come off.
  legendHeroCheck = (itemId, pos) => {
    const it = itemById(itemId); if (!it) return no('No such item.', { off: null });
    pos = pos || kindPos(it.slot);
    if (!it.lg || !heroUses(it.lg)) return yes({ off: null });
    const list = heroList().filter(x => x.pos !== pos && x.it.id !== it.id);
    const act = heroActive(list);
    if (act.some(a => a.id === it.lg) || act.length < T.heroMax) return yes({ off: null });
    const off = act[act.length - 1].item;
    return no(`Your hero carries ${T.heroMax} legendary powers. Take off ${itemName(off)}?`, { off: off.id });
  };
  legendCanWear = (charId, it, pos) => {
    if (!it || !it.lg || !P(it.lg)) return yes();
    const r = charRec(charId); if (!r) return no('No such companion.');
    const other = CRAFT_COMP_POS.filter(p => p !== pos).map(p => itemById(r[p])).find(x => x && x.lg && x.id !== it.id && P(x.lg) && P(x.lg).fits !== 'hero');
    if (other && P(it.lg).fits !== 'hero') return no(`${charName(charId)} carries 1 legendary power. Take off ${itemName(other)} first.`);
    return yes();
  };
  // Keep the hero at 2 powers after any gear change: a newly worn third powered item goes back to the
  // bag; a save that already has 3 (edited, or from before) keeps the first 2 by position and says so.
  let heroSeen = null, heroSeenFor = null;
  function heroRepair(quiet) {
    const list = heroList().filter(x => heroUses(x.it.lg));
    const ids = new Set(list.map(x => x.it.id));
    const distinct = [...new Set(list.map(x => x.it.lg))];
    if (distinct.length <= T.heroMax) { heroSeen = ids; heroSeenFor = S; return 0; }
    const prev = heroSeenFor === S && heroSeen ? heroSeen : null;
    let off = prev ? list.filter(x => !prev.has(x.it.id)) : [];
    if (!off.length) { const keep = new Set(heroActive(list).map(a => a.id)); off = list.filter(x => !keep.has(x.it.lg)); }
    else {
      // take off only the new items that push the count over (by position, last first)
      const stay = list.filter(x => !off.includes(x));
      const keep = new Set(heroActive(stay).map(a => a.id));
      const out = [];
      for (const x of off) { if (keep.has(x.it.lg)) continue; if (keep.size < T.heroMax) keep.add(x.it.lg); else out.push(x); }
      off = out;
    }
    for (const x of off) S.equip[x.pos] = null;
    heroSeen = new Set(heroList().map(x => x.it.id)); heroSeenFor = S;
    if (!off.length) return 0;
    const what = off.length === 1 ? itemName(off[0].it) : `${off.length} items`;
    const msg = `Your hero carries ${T.heroMax} legendary powers, so ${what} went back to your bag.`;
    if (quiet) emit('whatsNew', { msg, icon: { ic: legendIconSafe(off[0].it.lg) } }); else toast(msg, 'raid', null, 'high');
    gearDirty(); save();
    return off.length;
  }
  on('gear', () => { if (heroSeenFor !== S) return; heroRepair(false); });

  // ---------------- drops (2.1) ----------------
  function pickPower(opts, rnd) {
    const cls = heroCls();
    const roles = new Set(live() ? rosterList().map(k => ROSTER[k].role) : []);
    const signOk = id => !P(id).only || isRecruited(P(id).only);
    const classPool = cls && LEG_CLASS_IDS[cls] ? LEG_CLASS_IDS[cls].slice() : [];
    const compPool = roles.size ? LEG_COMP_IDS.filter(id => signOk(id) && (P(id).fits === 'trinket' || roles.has(P(id).fits))) : [];
    let pool = opts.pool === 'class' ? classPool : opts.pool === 'comp' ? compPool : null;
    if (!pool) pool = rnd() < T.drop.cls ? (classPool.length ? classPool : compPool) : (compPool.length ? compPool : classPool);
    if (!pool.length) return null;
    const w = pool.map(id => legendKnown(id) ? 1 : T.drop.unknownW), tot = w.reduce((a, b) => a + b, 0);
    let x = rnd() * tot;
    for (let i = 0; i < pool.length; i++) if ((x -= w[i]) < 0) return pool[i];
    return pool[pool.length - 1];
  }
  function makeItem(id, rank, t, rnd) {
    const p = P(id); let kind, role;
    if (p.fits === 'hero') {
      const cls = p.cls || heroCls();
      const poss = T.item.pos.filter(pos => ((CRAFT_FITS[pos] || {})[cls] || []).length);
      if (!poss.length) return null;
      kind = CRAFT_FITS[poss[Math.floor(rnd() * poss.length)]][cls][0];
    } else if (p.fits === 'trinket') {
      kind = 'trinket';
      const roles = live() ? [...new Set(fieldKeys().concat(rosterList()).map(k => ROSTER[k].role))] : [];
      role = roles.length ? roles[0] : 'striker';
    } else kind = CRAFT_FITS.wpn[p.fits][0];
    const it = newItem(kind, t, T.item.r, { role, rnd });
    it.lg = id; it.lr = rank;
    return it;
  }
  legendDrop = (rank, source, opts = {}) => {
    const rnd = opts.rnd || Math.random, r = legendRank(rank), quiet = !!opts.quiet;
    const id = opts.id && P(opts.id) ? opts.id : pickPower(opts, rnd);
    if (!id) { legendOwe(r, source, opts); return null; }
    L().n.drops++;
    let res;
    if (legendKnown(id)) {
      const b = toBook(id, r, quiet);
      res = { id, rank: legendKnown(id), kind: b.kind, item: null };
    } else {
      const t = opts.t || zoneTier(opts.z || S.zone || 1);
      const it = makeItem(id, r, Math.max(1, Math.min(5, t | 0)), rnd);
      if (it && !bagFull()) {
        S.items.push(it); emit('itemAdded', { item: it });
        if (!quiet) toast(`Legendary! ${P(id).n} (rank ${rn(r)})`, 'loot', { item: it }, 'high');
        res = { id, rank: r, kind: 'item', item: it };
      } else {
        toBook(id, r, true);
        if (!quiet) toast(`Legendary! ${P(id).n} (rank ${rn(r)}). Your bag was full, so it went straight into the Lantern Book.`, 'loot', { ic: legendIconSafe(id) }, 'high');
        res = { id, rank: r, kind: 'book', item: null };
      }
      changed();
    }
    emit('legendDrop', Object.assign({ source: source || '' }, res));
    save();
    return res;
  };
  legendOwe = (rank, source, opts) => {
    const o = {}; if (opts) for (const k of ['id', 'pool', 'z', 't']) if (opts[k] != null) o[k] = opts[k];
    L().owed.push({ r: legendRank(rank), src: source || '', opts: o });
    return L().owed.length;
  };
  // Pays recorded rolls. Rolls that still cannot drop stay recorded.
  legendPayOwed = () => {
    let paid = 0;
    const payList = (arr, rd) => {
      const keep = [];
      for (const e of arr.splice(0)) {
        const x = rd(e); if (!x) continue;
        const id = x.opts.id && P(x.opts.id) ? x.opts.id : null;
        if (!id && !pickPower(x.opts, () => 0)) { keep.push(e); continue; }
        const L0 = L().owed.length;
        const res = legendDrop(x.r, x.src, Object.assign({}, x.opts, { quiet: false }));
        if (res) paid++;
        else { L().owed.length = L0; keep.push(e); }
      }
      arr.push(...keep);
    };
    payList(L().owed, e => e && typeof e === 'object' ? { r: e.r, src: e.src, opts: e.opts || {} } : null);
    // The Oath core (O1) may have recorded rolls before this file existed (oaths.md 8): { rank | r, source | src } or a rank.
    if (S.oath && Array.isArray(S.oath.owed) && S.oath.owed.length) {
      payList(S.oath.owed, e => typeof e === 'number' ? { r: e, src: 'oath', opts: {} }
        : e && typeof e === 'object' ? { r: e.rank || e.r || 1, src: e.source || e.src || 'oath', opts: e.opts || {} } : null);
    }
    return paid;
  };

  // ---------------- Learn (5) ----------------
  legendCanLearn = itemId => {
    const it = itemById(itemId);
    if (!it) return no('No such item.');
    if (!it.lg || !it.lr || !P(it.lg)) return no('Only a Legendary item can be learned.');
    const b = legendKnown(it.lg);
    return yes({ id: it.lg, rank: it.lr, echo: b > 0 && it.lr <= b, up: it.lr > b && b > 0 });
  };
  legendLearn = itemId => {
    const c = legendCanLearn(itemId); if (!c.ok) return false;
    const it = itemById(itemId), was = isEquipped(it.id);
    if (was) unwearItem(it.id);
    salvageGive(it);                               // the normal salvage materials come back
    S.items = S.items.filter(i => i.id !== it.id);
    const res = toBook(it.lg, it.lr, true);
    if (was) gearDirty();
    toast(res.kind === 'book' ? `${P(it.lg).n} is in your Lantern Book (rank ${rn(legendKnown(it.lg))}). Inscribe it on gear you craft.`
      : res.kind === 'rankUp' ? `${P(it.lg).n} is now rank ${rn(legendKnown(it.lg))}.`
      : `Echo of ${P(it.lg).n}: ${Math.min(T.echoPerRank, legendEchoes(it.lg))}/${T.echoPerRank} toward the next rank.`, 'loot', { ic: legendIconSafe(it.lg) }, res.kind === 'echo' ? 'normal' : 'high');
    emit('legendLearn', { id: it.lg, rank: legendKnown(it.lg), echo: res.kind === 'echo', up: res.kind === 'rankUp' });
    changed(); save();
    return true;
  };

  // ---------------- Inscribe (5) ----------------
  const heroWearsAt = id => HERO_POS.find(pos => S.equip[pos] === id) || null;
  const compWearer = id => { const rec = (S.party && S.party.rec) || {}; for (const k of Object.keys(rec)) for (const pos of CRAFT_COMP_POS) if (rec[k] && rec[k][pos] === id) return [k, pos]; return null; };
  legendCanInscribe = (id, itemId) => {
    const p = P(id), it = itemById(itemId);
    if (!p) return no('Unknown power.');
    const rank = legendKnown(id);
    if (!rank) return no('Learn this power first.');
    if (!it) return no('Pick an item.');
    const t = it.t, cost = { pearls: LEG_COST.inscribe.pearls(rank), ess: LEG_COST.inscribe.ess, gold: foesGold(S.maxZone, LEG_COST.inscribe.goldFoes), t, rank, pearlLive: pearlLive() };
    const x = { cost };
    if (it.lr) return no('Learn this Legendary item first. Inscribe powers on gear you craft.', x);
    if (it.u) return no('Uniques cannot take a power.', x);
    if (!lgFits(it, id)) return no(p.fits === 'hero' ? `${p.n} goes on a ${p.cls && HERO_CLASSES[p.cls] ? HERO_CLASSES[p.cls].name + ' ' : ''}weapon, off-hand, head or body piece.`
      : p.fits === 'trinket' ? `${p.n} goes on a Trinket.` : `${p.n} goes on a ${ROLE_STATS[p.fits].n.toLowerCase()}'s weapon.`, x);
    if (it.lg === id) return no('This item already has that power.', x);
    // limits: inscribing onto worn gear must not break them
    const hp = heroWearsAt(it.id);
    if (hp && p.fits === 'hero') {
      const old = it.lg; it.lg = id;
      const n = new Set(heroList().filter(z => heroUses(z.it.lg)).map(z => z.it.lg)).size;
      if (old == null) delete it.lg; else it.lg = old;
      if (n > T.heroMax) return no(`Your hero carries ${T.heroMax} legendary powers. Take one off first.`, x);
    }
    const cw = compWearer(it.id);
    if (cw && p.fits !== 'hero') { const w = legendCanWear(cw[0], Object.assign({}, it, { lg: id }), cw[1]); if (!w.ok) return no(w.why, x); }
    if (pearlHave(t) < cost.pearls) return no(pearlWhy(t, cost.pearls), x);
    if (S.mats.ess[t - 1] < cost.ess) return no(`${cost.ess - S.mats.ess[t - 1]} more ${matName('ess', t)}`, x);
    if (S.gold < cost.gold) return no(`${fmt(cost.gold - S.gold)} more gold`, x);
    return yes(x);
  };
  legendInscribe = (id, itemId) => {
    const c = legendCanInscribe(id, itemId); if (!c.ok) return false;
    const it = itemById(itemId), k = c.cost;
    pearlPay(k.t, k.pearls); S.mats.ess[k.t - 1] -= k.ess; S.gold -= k.gold;
    it.lg = id;
    changed(); gearDirty();
    toast(`${itemName(it)} now carries ${P(id).n}.`, 'loot', { item: it }, 'normal');
    emit('legendInscribe', { id, item: it });
    save();
    return true;
  };

  // ---------------- Mark and Sigils (4.1) ----------------
  const markable = kind => { const d = CRAFT_KINDS[kind]; return !!d && ((d.cls && HERO_POS.includes(d.pos)) || d.comp === 'wpn' || d.comp === 'trk'); };
  legendMarkWhy = (kind, t, circle) => {
    const i = circleIdx(circle);
    if (i < 0) return 'Pick a circle.';
    if (!markable(kind)) return 'A mark goes on a class piece, a companion weapon or a Trinket.';
    if ((L().sig[i] | 0) < LEG_COST.mark.sigil) return `Needs 1 ${circleName(i)} Sigil`;
    if (pearlHave(t) < LEG_COST.mark.pearls) return pearlWhy(t, LEG_COST.mark.pearls);
    return '';
  };
  legendMarkPay = (it, circle) => {
    const i = circleIdx(circle); if (!it || i < 0 || legendMarkWhy(it.slot, it.t, i)) return false;
    L().sig[i] -= LEG_COST.mark.sigil; pearlPay(it.t, LEG_COST.mark.pearls);
    it.cm = i; changed();
    emit('legendMark', { item: it, circle: LEG_CIRCLES[i] });
    return true;
  };
  legendCanMark = (itemId, circle) => {
    const it = itemById(itemId), i = circleIdx(circle);
    if (!it) return no('No such item.');
    const x = { cost: { sigil: LEG_COST.mark.sigil, pearls: LEG_COST.mark.pearls, t: it.t, pearlLive: pearlLive() } };
    if (it.u) return no('Uniques cannot take a mark.', x);
    if (i >= 0 && it.cm === i) return no(`It already has the ${circleName(i)} mark.`, x);
    const why = legendMarkWhy(it.slot, it.t, i);
    return why ? no(why, x) : yes(x);
  };
  legendMark = (itemId, circle) => {
    const c = legendCanMark(itemId, circle); if (!c.ok) return false;
    const it = itemById(itemId);
    legendMarkPay(it, circle);
    gearDirty();
    toast(`${itemName(it)} carries the ${circleName(it.cm)} mark.`, 'good', { item: it }, 'low');
    save();
    return true;
  };
  legendSigil = (circle, n, source, quiet) => {
    const i = circleIdx(circle); n = n | 0; if (i < 0 || n <= 0) return 0;
    L().sig[i] = (L().sig[i] | 0) + n;
    emit('legendSigil', { circle: LEG_CIRCLES[i], n, source: source || '' });
    if (!quiet) toast(`${n} ${circleName(i)} Sigil${n > 1 ? 's' : ''}.`, 'good', { ic: (() => { try { return sigilIcon(i); } catch (e) { return ['star', LEG_COL]; } })() }, 'low');
    return n;
  };
  // Expeditions: a returning team with 2+ members of one circle brings 1 Sigil of it (Good or better), 2 on Perfect.
  on('expedBack', p => {
    if (!p || p.recall || !p.circles) return;
    const g = p.g != null ? p.g : EXPED_GRADES.findIndex(x => x.n === p.grade);
    if (!(g >= 1)) return;
    const n = g >= EXPED_GRADES.length - 1 ? T.sigil.perfect : T.sigil.good;
    for (const [c, k] of Object.entries(p.circles)) if (k >= T.sigil.expedMin) legendSigil(c, n, 'exped', !!p.auto);
  });
  // Bond: a character's first level 25 gives 2 Sigils of their circle.
  on('milestone', ({ id, lv, quiet } = {}) => {
    if (lv !== T.sigil.bondLevel || !ROSTER[id] || L().bondCredit[id]) return;
    L().bondCredit[id] = 1;
    legendSigil(ROSTER[id].circle, T.sigil.bond, 'bond', !!quiet);
  });
  // Old saves: characters already past level 25 are credited once (at most bondCreditMax per circle).
  function bondSweep() {
    if (L().bondSwept || !live()) return;
    L().bondSwept = 1;
    const got = [0, 0, 0, 0];
    for (const k of rosterList()) {
      const r = charRec(k); if (!r || r.lv < T.sigil.bondLevel || L().bondCredit[k]) continue;
      L().bondCredit[k] = 1;
      const i = circleIdx(ROSTER[k].circle), n = Math.min(T.sigil.bond, T.sigil.bondCreditMax - got[i]);
      if (n > 0) { got[i] += n; legendSigil(i, n, 'bond', true); }
    }
    // Silent: the Sigils show in the Powers view (L4); the bell's one What's new notice stays the welcome's.
  }

  // ---------------- the simple powers and set tiers ----------------
  const setOn = (c, t) => legendSetTier(c) >= t;
  const members = c => A().members[c] || 0;
  addModifier('party', () => { const r = activeRank('banner'); return r ? 1 + legendVal('banner', 'dmg', r) * members('oath') * legendScale() : 1; });
  addModifier('crit', () => {
    const r = activeRank('contract'); if (!r) return 1;
    const add = legendVal('contract', 'crit', r) * members('dusk') * legendScale(); if (!(add > 0)) return 1;
    return 1 + add / critBase();   // + flat crit chance on critChance()'s base
  });
  addModifier('critDmg', () => setOn('dusk', 2) ? 1 + LEG_SETS.dusk.tiers[2].fx.critDmg * legendScale() : 1);
  addModifier('abilityCd', () => setOn('wayfarers', 2) ? 1 - LEG_SETS.wayfarers.tiers[2].fx.cd * legendScale() : 1);
  addModifier('gold', () => setOn('hedgefolk', 2) ? 1 + LEG_SETS.hedgefolk.tiers[2].fx.gold : 1);
  addBonus('tune:embersMax', () => { const r = activeRank('wayfarer'); return r ? legendVal('wayfarer', 'embers', r) * members('wayfarers') : 0; });
  addBonus('tune:blessMax', () => { const r = activeRank('hedgelight'); return r ? legendVal('hedgelight', 'bless', r) * members('hedgefolk') : 0; });
  addBonus('lg:cause', () => {
    const r = activeRank('hedgelight');
    return ((r ? legendVal('hedgelight', 'cause', r) * members('hedgefolk') : 0) + (setOn('hedgefolk', 2) ? LEG_SETS.hedgefolk.tiers[2].fx.cause : 0)) * legendScale();
  });
  // Per-character parts (56-roster loads after this file: registered on first use).
  let charModsOn = false;
  function charMods() {
    if (charModsOn) return; charModsOn = true;
    addCharModifier(id => {
      const a = A(); if (!a.comp.length && !a.sets.active.length) return 1;
      let m = 1;
      const o = a.comp.find(x => x.id === 'ossuary' && x.char === id);
      if (o) m *= 1 + legendVal('ossuary', 'aoe', o.rank) * a.budget.scale;
      const R = ROSTER[id];
      if (R && setOn('hedgefolk', 4) && R.circle === LEG_SETS.hedgefolk.tiers[4].fx.circle) m *= 1 + LEG_SETS.hedgefolk.tiers[4].fx.speed * a.budget.scale;
      if (R && setOn('hedgefolk', 6) && R.rarity === LEG_SETS.hedgefolk.tiers[6].fx.rarity) m *= 1 + (LEG_SETS.hedgefolk.tiers[6].fx.base - 1) * a.budget.scale;
      return m;
    });
  }

  // ---------------- the best legal build estimate (6) ----------------
  // Same sum as the runtime budget: 2 hero powers (a per-member power once per fielded companion of its
  // circle) + 3 companion powers at LEG_CAPS.model.comp + the best two sets (6 + 4 pieces, gross), then
  // clamped to the cap. opts.pool: roster ids to pick line-ups from (default every character).
  legendBest = (cls, rank, opts = {}) => {
    const r = legendRank(rank), keys = opts.pool || ROSTER_KEYS, M = LEG_CAPS.model;
    const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
    const setV = LEG_CIRCLES.map(c => { const t = LEG_SETS[c].tiers; return [c, t[2].p + t[4].p + t[6].p, t[2].p + t[4].p]; });
    let sets = { v: 0, pick: [] };
    for (const a of setV) for (const b of setV) if (a !== b && a[1] + b[2] > sets.v) sets = { v: a[1] + b[2], pick: [a[0] + ' 6', b[0] + ' 4'] };
    const classIds = (LEG_CLASS_IDS[cls] || []).concat(LEG_PIN_IDS);
    let best = null;
    for (let a = 0; a < keys.length; a++) for (let b = a + 1; b < keys.length; b++) for (let c = b + 1; c < keys.length; c++) {
      const line = [keys[a], keys[b], keys[c]], n = {};
      for (const k of line) n[ROSTER[k].circle] = (n[ROSTER[k].circle] || 0) + 1;
      let cv = 0, cp = [];
      for (const pm of perms) {
        const used = new Set(), pick = []; let v = 0;
        for (const i of pm) {
          const k = line[i];
          const o = LEG_COMP_IDS.filter(id => !used.has(id) && (P(id).fits === ROSTER[k].role || P(id).fits === 'trinket') && (!P(id).only || P(id).only === k))
            .sort((x, y) => legendP(y, r) - legendP(x, r))[0];
          if (o) { used.add(o); pick.push(o); v += legendP(o, r) * M.comp; }
        }
        if (v > cv) { cv = v; cp = pick; }
      }
      const hv = classIds.map(id => [id, legendP(id, r) * (P(id).per && P(id).pPer ? n[P(id).per] || 0 : 1)]).sort((x, y) => y[1] - x[1]);
      const raw = (hv[0] ? hv[0][1] : 0) + (hv[1] ? hv[1][1] : 0) + cv + sets.v;
      if (!best || raw > best.raw) best = { raw, hero: hv.slice(0, 2).map(x => x[0]), comp: cp, line, sets: sets.pick };
    }
    const cap = capAt(r);
    return Object.assign(best || { raw: 0, hero: [], comp: [], line: [], sets: [] }, { cap, capped: Math.min(best ? best.raw : 0, cap), rank: r });
  };

  // ---------------- Next Up goals ----------------
  const bagLegend = () => S.items.find(it => it.lg && it.lr && P(it.lg) && !legendKnown(it.lg) && !isEquipped(it.id)) || null;
  registerGoal({ id: 'legend-learn', sys: 'legend', prio: 2,
    label: () => { const it = bagLegend(); return it ? `Learn ${P(it.lg).n} into the Lantern Book` : ''; },
    pct: () => bagLegend() ? 1 : 0,
    go: { tab: 'forge', view: 'powers' }, icon: () => { const it = bagLegend(); return it ? { item: it } : null; } });
  // A learned power that is on no item yet, and a crafted item it fits: progress = what you can pay.
  let inscCache = null, inscAt = -1;
  const inscGoal = () => {
    const now = Date.now(); if (inscCache && inscCache.S === S && now - inscAt < 2000) return inscCache.g;
    inscAt = now;
    let g = null;
    const book = Object.keys(L().book).filter(id => P(id));
    if (book.length) {
      const on = new Set(S.items.filter(it => it.lg && !it.lr).map(it => it.lg));
      for (const id of book) {
        if (on.has(id)) continue;
        const p = P(id); if (p.fits === 'hero' && !heroUses(id)) continue;
        const it = S.items.filter(x => !x.lr && !x.u && !x.lg && lgFits(x, id)).sort((a, b) => itemPower(b) - itemPower(a))[0];
        if (!it) continue;
        const c = legendCanInscribe(id, it.id), k = c.cost; if (!k) continue;
        const f = [Math.min(1, pearlHave(k.t) / k.pearls), Math.min(1, S.mats.ess[k.t - 1] / k.ess), Math.min(1, S.gold / Math.max(1, k.gold))];
        const pct = c.ok ? 1 : Math.min(0.99, f.reduce((a, b) => a + b, 0) / 3);
        if (!g || pct > g.pct) g = { id, it, pct };
      }
    }
    inscCache = { S, g };
    return g;
  };
  registerGoal({ id: 'legend-inscribe', sys: 'legend', prio: 1,
    label: () => { const g = inscGoal(); return g ? `Inscribe ${P(g.id).n} on ${itemName(g.it)}` : ''; },
    pct: () => { const g = inscGoal(); return g ? g.pct : 0; },
    go: { tab: 'forge', view: 'powers' }, icon: () => { const g = inscGoal(); return g ? { ic: legendIconSafe(g.id) } : null; } });
  // A circle set one step from its next tier while you hold its Sigils.
  const setGoal = () => {
    const s = legendSets(); let g = null;
    LEG_CIRCLES.forEach((c, i) => {
      const n = s.n[i], next = T.setTiers.find(t => t > n); if (!n || !next || !(L().sig[i] > 0)) return;
      const pct = n / next; if (!g || pct > g.pct) g = { c, i, n, next, pct };
    });
    return g;
  };
  registerGoal({ id: 'legend-set', sys: 'legend',
    label: () => { const g = setGoal(); return g ? `${LEG_CIRCLE_NAME[g.c]} set: mark ${g.next - g.n} more piece${g.next - g.n > 1 ? 's' : ''}` : ''; },
    pct: () => { const g = setGoal(); return g ? g.pct : 0; },
    go: { tab: 'forge', view: 'powers' }, icon: () => { const g = setGoal(); try { return g ? { ic: sigilIcon(g.i) } : null; } catch (e) { return null; } } });

  // ---------------- load and tick ----------------
  // Once per loaded save (S is replaced by loadSave()): keep the hero at 2 powers, credit Bond Sigils,
  // pay recorded rolls. Then every few seconds: pay rolls that can drop now, and bank Echoes the cap allows.
  let initFor = null, acc = 0;
  onTick(dt => {
    charMods();
    if (initFor !== S) {
      initFor = S; dirty();
      if (!L().owed) L().owed = [];
      heroSeenFor = null; heroRepair(true);
      bondSweep();
      if (L().owed.length || (S.oath && Array.isArray(S.oath.owed) && S.oath.owed.length)) legendPayOwed();
      return;
    }
    acc += dt; if (acc < 3) return; acc = 0;
    if (L().owed.length || (S.oath && Array.isArray(S.oath.owed) && S.oath.owed.length)) legendPayOwed();
    for (const id of Object.keys(L().echo)) if ((L().echo[id] | 0) >= T.echoPerRank && legendKnown(id) < legendEchoCap()) { echoUp(id, false); changed(); }
    if (!L().bondSwept) bondSweep();
  });
}
