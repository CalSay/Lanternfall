// 57k-trade: C4 gatherer trade runs. DOM-free; no hero or online activity.
// API: handsTradeOpen(), handsTradeDemand(at?) -> { week, lines }, handsTradeCargo(id),
// handsTradeQuote(id, cargo), handsTradeSend(id, cargo, expectedQuote?),
// handsTradeDiagnostic(id, cargo). Cargo is [[family, tier, positive integer], ...].
// Quote: { ok, why, town, townName, secs, cap, maxLines, units, gold, lines, week }.
// Lines: { kind, t, n, name, demand (integer percent), unitGold, gold }.
// expectedQuote is the displayed quote; a changed week/price/cargo rejects Send.
// Waiting cargo refunds use pack lines [family,tier,n,'trade-refund']; unloading
// them does not count as gathered material. Unknown job versions fail closed.
// Internal 57f hooks: handsTradeValid(job), handsTradeRepair(hand),
// handsTradeStatus(hand, at), handsTradeFinish(hand, away), handsTradeRecall(hand, at).
// Save: S.trade { v:1, trips, sold, gold, log:[{ id,n,at,units,gold,town }] }.
// A hand's job: { role:'trade', v:1, town, start,end, cargo, quote:{week,micros,demand,gold} }.
// Quote prices use integer millionths of gold. Jobs never reroll or reprice on return.
let handsTradeOpen, handsTradeDemand, handsTradeCargo, handsTradeQuote, handsTradeSend, handsTradeDiagnostic,
  handsTradeValid, handsTradeRepair, handsTradeStatus, handsTradeFinish, handsTradeRecall;
{
  const T = TRADE_TUNE, UNIT = 1e6, WEEK = 7 * 864e5, EPOCH = Date.UTC(2026, 0, 5);
  const DEF = { v: 1, trips: 0, sold: 0, gold: 0, log: [] };
  registerState('trade', DEF);
  const icon = { ic: ['boot', '#C9A36B'] }, own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const stock = (f, t) => S.mats && Array.isArray(S.mats[f]) && Number.isFinite(S.mats[f][t - 1]) ? Math.max(0, Math.floor(S.mats[f][t - 1])) : 0;
  const live = (f, t) => typeof f === 'string' && own(TRADE_FAMILIES, f) && Number.isInteger(t) && t >= 1 && t <= T.top
    && own(CRAFT_NODES, f) && MAT[f] && Array.isArray(MAT[f].short) && MAT[f].short[t - 1] && S.mats && Array.isArray(S.mats[f]) && S.mats[f].length >= t;
  const eligible = (h, f, t) => live(f, t) && (h.sk === 'any' || h.sk === skillOf(f)) && skillTierOpen(skillOf(f), t);
  const ledger = () => {
    if (!isPlainObj(S.trade)) S.trade = cloneJSON(DEF);
    for (const k of ['trips', 'sold', 'gold']) if (!Number.isFinite(S.trade[k]) || S.trade[k] < 0) S.trade[k] = 0;
    if (!Array.isArray(S.trade.log)) S.trade.log = [];
    return S.trade;
  };
  function cargoOK(cargo) {
    if (!Array.isArray(cargo) || !cargo.length || cargo.length > T.maxLines) return false;
    const seen = new Set(); let total = 0;
    for (const row of cargo) {
      if (!Array.isArray(row) || row.length !== 3) return false;
      const [f, t, n] = row; if (typeof f !== 'string') return false;
      const key = f + ':' + t;
      if (!live(f, t) || !Number.isSafeInteger(n) || n <= 0 || seen.has(key)) return false;
      seen.add(key); total += n; if (total > T.cap) return false;
    }
    return true;
  }
  handsTradeOpen = () => handsOpen() && campLevel('tavern') >= T.tavern;
  handsTradeDemand = (at = Date.now()) => {
    const week = Math.floor(((Number.isFinite(at) ? at : Date.now()) - EPOCH) / WEEK);
    const r = rng((Math.imul(week, 2654435761) ^ 0x4D4F5353) | 0), lines = [];
    for (const f of Object.keys(TRADE_FAMILIES)) for (let t = 1; t <= T.top; t++)
      if (live(f, t)) lines.push({ kind: f, t, demand: 100 });
    const shuffled = lines.slice();
    for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
    for (let i = 0; i < Math.min(shuffled.length, T.wanted + T.glut); i++) {
      const min = i < T.wanted ? T.wantMin : T.glutMin, max = i < T.wanted ? T.wantMax : T.glutMax;
      shuffled[i].demand = min + Math.floor(r() * (max - min + 1));
    }
    return { week, lines };
  };
  const creditFits = gold => Number.isFinite(S.gold) && S.gold >= 0 && S.gold + gold <= Number.MAX_SAFE_INTEGER;
  const price = (f, t, demand) => Math.round(foeGoldBase(econGradeZ(t)) * ECON.famW[TRADE_FAMILIES[f]] * demand * UNIT / 100);
  handsTradeCargo = id => {
    const h = handsGet(id); if (!h) return [];
    return handsTradeDemand().lines.filter(l => eligible(h, l.kind, l.t)).map(l => ({ ...l,
      name: matName(l.kind, l.t), have: stock(l.kind, l.t), unitGold: price(l.kind, l.t, l.demand) / UNIT }));
  };
  handsTradeQuote = (id, cargo, at = Date.now()) => {
    const h = handsGet(id), market = handsTradeDemand(at);
    const q = { ok: false, why: '', town: TRADE_TOWN.id, townName: TRADE_TOWN.n, secs: T.secs,
      cap: T.cap, maxLines: T.maxLines, units: 0, gold: 0, lines: [], week: market.week };
    const no = why => Object.assign(q, { why });
    if (!h || !handsOpen()) return no('Gatherers are not available.');
    if (!handsTradeOpen()) return no('Trade runs open at Tavern level 2.');
    if (h.job) return no(h.n + ' is already away or resting between shifts.');
    if (h.pack.length) return no(h.n + "'s pack waits for room in the Storehouse.");
    if (!cargoOK(cargo)) return no('Choose up to three different cargo lines, totalling 1–5,000 whole units.');
    let value = 0;
    for (const [f, t, n] of cargo) {
      if (!eligible(h, f, t)) return no('Choose unlocked materials from this gatherer\'s profession, grades 1–3.');
      if (stock(f, t) < n) return no('Not enough ' + matName(f, t) + ' in the Storehouse.');
      const demand = market.lines.find(l => l.kind === f && l.t === t).demand, micros = price(f, t, demand);
      if (!Number.isSafeInteger(micros) || micros <= 0 || micros > T.maxUnitGold * UNIT) return no('This trade is not available.');
      value += n * micros; q.units += n;
      q.lines.push({ kind: f, t, n, name: matName(f, t), demand, unitGold: micros / UNIT, gold: n * micros / UNIT });
    }
    q.gold = Math.floor(value / UNIT);
    if (!(q.gold > 0)) return no('Add enough cargo to earn at least 1 gold.');
    if (!creditFits(q.gold)) return no('Spend some gold before sending another trade run.');
    q.ok = true; return q;
  };
  const sameQuote = (a, b) => a && a.ok && a.week === b.week && a.town === b.town && a.secs === b.secs && a.gold === b.gold
    && Array.isArray(a.lines) && a.lines.length === b.lines.length && a.lines.every((l, i) => l && ['kind', 't', 'n', 'demand', 'unitGold'].every(k => l[k] === b.lines[i][k]));
  handsTradeSend = (id, cargo, expectedQuote) => {
    const at = Date.now(), q = handsTradeQuote(id, cargo, at); if (!q.ok || (expectedQuote !== undefined && !sameQuote(expectedQuote, q))) return null;
    const h = handsGet(id);
    const job = { role: 'trade', v: 1, town: TRADE_TOWN.id, start: at, end: at + T.secs * 1000,
      cargo: cargo.map(l => l.slice()), quote: { week: q.week, micros: q.lines.map(l => Math.round(l.unitGold * UNIT)), demand: q.lines.map(l => l.demand), gold: q.gold } };
    for (const [f, t, n] of job.cargo) S.mats[f][t - 1] -= n;
    h.job = job; ledger(); save();
    emit('handsTradeSend', { id, n: h.n, town: job.town, end: job.end, gold: q.gold }); return job;
  };
  handsTradeValid = j => {
    if (!j || j.role !== 'trade' || j.v !== 1 || j.town !== TRADE_TOWN.id || !cargoOK(j.cargo)) return false;
    if (!Number.isSafeInteger(j.start) || j.start < 0 || !Number.isSafeInteger(j.end) || j.end - j.start !== T.secs * 1000) return false;
    const q = j.quote;
    if (!q || !Number.isSafeInteger(q.week) || q.week !== Math.floor((j.start - EPOCH) / WEEK) || !Number.isSafeInteger(q.gold) || !(q.gold > 0)
      || !Array.isArray(q.micros) || q.micros.length !== j.cargo.length || !Array.isArray(q.demand) || q.demand.length !== j.cargo.length) return false;
    if (!q.micros.every(n => Number.isSafeInteger(n) && n > 0 && n <= T.maxUnitGold * UNIT) || !q.demand.every(n => Number.isInteger(n) && (n === 100 || (n >= T.glutMin && n <= T.glutMax) || (n >= T.wantMin && n <= T.wantMax)))) return false;
    const value = j.cargo.reduce((sum, l, i) => sum + l[2] * q.micros[i], 0);
    return Number.isSafeInteger(value) && Math.floor(value / UNIT) === q.gold;
  };
  const giveCargo = (h, cargo) => {
    for (const [f, t, n] of cargo) if (!stashAdd(f, t, n, 'parcel', true)) h.pack.push([f, t, n, 'trade-refund']);
  };
  handsTradeRepair = h => {
    if (!h || !h.job || h.job.role !== 'trade') return false;
    if (handsTradeValid(h.job)) return true;
    const j = h.job, cargo = j.cargo; h.job = null;
    if (j.v === 1 && j.town === TRADE_TOWN.id && cargoOK(cargo)) giveCargo(h, cargo);   // never mint gold from a malformed quote
    save(); return false;
  };
  handsTradeStatus = (h, at = Date.now()) => {
    const j = h && h.job;
    if (!handsTradeValid(j)) return { st: 'back', role: 'trade', label: 'Trade run needs checking', left: 0, pct: 0, kind: null, t: null, spot: 'road' };
    const left = Math.max(0, (j.end - at) / 1000);
    return { st: left > 0 ? 'out' : 'back', role: 'trade', label: left > 0 ? 'Trading at ' + TRADE_TOWN.n : !creditFits(j.quote.gold) ? 'Trade gold waits: spend some gold first' : 'Returning from ' + TRADE_TOWN.n,
      left, pct: Math.max(0, Math.min(1, (at - j.start) / (j.end - j.start))), kind: null, t: null, spot: left > 0 ? null : 'road' };
  };
  let awayReturns = [];
  handsTradeFinish = (h, away = false, at = Date.now()) => {
    if (!h || !h.job || h.job.role !== 'trade') return false;
    if (!handsTradeValid(h.job)) { handsTradeRepair(h); return false; }
    if (!Number.isFinite(at) || h.job.end > at || !creditFits(h.job.quote.gold)) return false;
    const j = h.job, gold = j.quote.gold, units = j.cargo.reduce((n, l) => n + l[2], 0);
    h.job = null; h.back = j.end;   // clear the reservation before any event can re-enter
    S.gold += gold; econEarn('trade', gold);
    const s = ledger(); s.trips++; s.sold += units; s.gold += gold;
    const e = { id: h.id, n: h.n, at: j.end, units, gold, town: j.town };
    s.log.push(e); if (s.log.length > T.logMax) s.log.splice(0, s.log.length - T.logMax);
    if (away) awayReturns.push(e); else toast(h.n + ' returns from ' + TRADE_TOWN.n + ': +' + fmt(gold) + ' gold.', 'good', icon, 'normal');
    save(); emit('handsTradeBack', { ...e, away: !!away }); return true;
  };
  handsTradeRecall = (h, at = Date.now()) => {
    if (!h || !h.job || h.job.role !== 'trade') return false;
    if (!handsTradeValid(h.job)) { handsTradeRepair(h); return false; }
    if (!Number.isFinite(at) || at < 0) return false;
    if (h.job.end <= at) { handsTradeFinish(h, false, at); return false; }
    const cargo = h.job.cargo; h.job = null; h.back = at; giveCargo(h, cargo);
    save(); emit('handsRecall', { id: h.id, role: 'trade', cargo: cargo.map(l => l.slice()) }); return true;
  };
  handsTradeDiagnostic = (id, cargo) => {
    const q = handsTradeQuote(id, cargo), h = handsGet(id);
    const gather = !h ? [] : q.lines.map(l => {
      const units = Math.floor(handsRate(h, l.kind, l.t) * T.secs / 3600);
      return { kind: l.kind, t: l.t, units, marketGold: Math.floor(units * l.unitGold), shiftFee: handsFee(h, l.kind, l.t) };
    });
    return { quote: q, gather, heroFightGold: econH(S.maxZone) * T.secs / 3600,
      note: 'Each gathering row is a separate two-hour alternative, before finds and overlapping gatherer bonuses. Shift fee is the full four-hour fee. Trade spends existing cargo; gathering creates new materials.' };
  };
  registerAwayLine(() => {
    const rows = awayReturns.map(e => ({ icon, group: 'Trade', txt: e.n + ' returned from ' + TRADE_TOWN.n + ': +' + fmt(e.gold) + ' gold.',
      go: () => emit('campGoto', { tab: 'world', view: 'tav', sel: '#sec-hands' }) }));
    awayReturns = []; return rows;
  });
  // Existing jobs still return if a hand-edited save lowered the Tavern/Hearth.
  on('away', () => { if (!handsOpen()) handsCatchUp(Date.now(), true); });
  let elapsed = 0;
  onTick(dt => { if (!(dt > 0) || !Number.isFinite(dt)) return; elapsed += dt; if (elapsed < 1) return; elapsed = 0;
    if (!handsOpen() && handsList().some(h => h.job && h.job.role === 'trade')) handsCatchUp(Date.now(), false);
  });
}