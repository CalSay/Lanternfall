// 55-refine: the stations' order lists (card refine-queues; overhaul spec 2, 4, 12, 13) and coal.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// The Forge smelts ore and coal into Ingots, the Workbench saws logs into Planks, the Loom weaves fibre into Cloth and
// tans hide (and a log of the same grade) into Leather. Each station holds up to REFINE_TUNE.max orders and runs them in
// turn: the first order that can make a unit runs; a stopped one (out of input, Storehouse full) lets the next run. An
// order is { prod, tier, want, made, all, at, keep }:
//   prod   'ingot' | 'plank' | 'cloth' | 'leather' (REFINE_PRODUCTS, 21-data-craft.js), made at that product's station
//   tier   grade 1-5 of the product and of its inputs (coal has one grade)
//   want   units to make (a shortfall order); 0 for an "All" order
//   made   units made so far;  at  seconds of work on the current unit (station-speed seconds)
//   all    1: make as many as the inputs allow, keeping `keep` of each input
//   keep   [n per input] for an All order: REFINE_TUNE.reserve of each input held when it was set ("keeps 24 Iron Ore")
// Orders keep running while you fight or gather (onTick) and while you are away ('awayEnd', below, after camp builds and
// Hands caught up; the hero's away gathering arrives evenly over the absence, as it would live).
// Coal (the art ruling 2026-10-08): once the Forge is built, every Copper Ore the hero mines (live, away, the Glint,
// Spillover: the 'harvest' event) brings REFINE_TUNE.coalDrop coal, with the fraction carried, never floored away. Hands
// fire no harvest, so they bring no coal until the Coal Seam (card coal-seam-integrate).
//
// Exposed names:
//   read   refineStationOf(prod), refineProducts(st), refineBuilt(st), refineSpeed(st), refineUnitSecs(st, tier),
//          refinePerMin(st, tier), refineOrders(st), refineState(st, o) -> { k: 'run'|'done'|'input'|'full'|'wait', why, miss },
//          refineCurrent(st), refineNeed(prod, tier) -> inputs [[fam, t, n]] of one unit, refineMaxUnits(prod, tier, all),
//          refineSlotFree(st), refineLabel(st)
//   act    refineAdd(prod, tier, n | 'all') -> { ok, why }, refineRemove(st, i), refineTick(dt)
//   offer  refineOffer(cost, t) -> { short: { <family>: [per tier] }, orders: [{ st, prod, tier, want, ok, full, why }], add() }
//          cost is { fam: n } or { mats: { fam: n } } at grade t (an upgrade's or a craft's cost). Frozen shape:
//          craft-attribute-grades reads it. add() adds every order that can start and returns how many it added.
//   away   refineAwayRun(T, stock, inflow) (the 'awayEnd' pass; the parity tool and the checks call it through awayGains)
// Events: 'refined' { st, prod, tier, n } after each unit made live; 'refineDone' { st, prod, tier, n } when a set-amount
// order makes its last unit live (one bell line, 'refine-done', and the Camp tab dot; an All order and the away run say nothing).
// Save: registerState('refine', { v, st: { forge, bench, loom }, said, seen, coal }). said: 1 = no "The Forge can smelt
// now" card owed (a new game, or shown); an old save (one saved before this change) starts at 0. seen: when the first order
// was ever added (ms, 0 = never). coal: 1 once the first coal toast has shown.

let refineStationOf, refineProducts, refineBuilt, refineSpeed, refineUnitSecs, refinePerMin, refineOrders, refineState,
  refineCurrent, refineNeed, refineMaxUnits, refineSlotFree, refineLabel, refineAdd, refineRemove, refineTick, refineOffer,
  refineAwayRun, refineOldCard;

{
  const T = REFINE_TUNE;
  // An old save: a save was loaded (or there is progress) and it has no refine record. Read before registerState fills one.
  const savedBefore = S.refine === undefined && (storedLast() > 0 || (S.totalKills || 0) > 0);
  registerState('refine', { v: 1, st: { forge: [], bench: [], loom: [] }, said: 1, seen: 0, coal: 0 });
  if (savedBefore) S.refine.said = 0;
  const R = () => S.refine;
  const have = (f, t) => Math.max(0, (S.mats[f] && S.mats[f][t - 1]) || 0);
  const name = (f, t) => matName(f, t);
  const plural = (f, t, n) => name(f, t) + (n !== 1 && (f === 'ingot' || f === 'plank' || MAT[f].unit === 'Log') ? 's' : '');
  const built = st => typeof campLevel === 'function' && campLevel(st) >= 1;

  refineStationOf = prod => (REFINE_PRODUCTS[prod] ? REFINE_PRODUCTS[prod].st : null);
  refineProducts = st => Object.keys(REFINE_PRODUCTS).filter(p => REFINE_PRODUCTS[p].st === st);
  refineBuilt = st => refineOn() && REFINE_STATIONS.includes(st) && built(st);
  for (const st of REFINE_STATIONS) addModifier('refineSpeed:' + st, () => 1 + T.perLevel * Math.max(0, (typeof campLevel === 'function' ? campLevel(st) : 1) - 1));
  refineSpeed = st => mod('refineSpeed:' + st);
  refineUnitSecs = (st, tier) => T.secs[tier - 1] / Math.max(1e-9, refineSpeed(st));
  refinePerMin = (st, tier) => 60 / refineUnitSecs(st, tier);
  refineNeed = (prod, tier) => REFINE_PRODUCTS[prod].inputs(tier);
  // A station's list. Once per loaded save, drop any order this version cannot run (a hand-edited or newer save), so a tick
  // never reads an unknown product.
  const okOrder = (st, o) => o && typeof o === 'object' && REFINE_PRODUCTS[o.prod] && REFINE_PRODUCTS[o.prod].st === st && Number.isInteger(o.tier) && o.tier >= 1 && o.tier <= 5
    && Number.isFinite(o.want) && Number.isFinite(o.made) && o.want >= 0 && o.made >= 0 && (o.all ? true : o.want >= 1);
  // a kept order's numbers made whole: at within one unit, keep matching the inputs (else the order keeps nothing back)
  const fixOrder = o => {
    o.want = Math.floor(o.want); o.made = Math.floor(o.made); o.all = o.all ? 1 : 0;
    o.at = Number.isFinite(o.at) ? Math.max(0, Math.min(T.secs[o.tier - 1], o.at)) : 0;
    if ('keep' in o && !(Array.isArray(o.keep) && o.keep.length === refineNeed(o.prod, o.tier).length && o.keep.every(n => Number.isInteger(n) && n >= 0))) delete o.keep;
    return o;
  };
  let cleanFor = null;
  const list = st => {
    if (!S.refine || typeof S.refine !== 'object' || Array.isArray(S.refine)) S.refine = { v: 1, st: { forge: [], bench: [], loom: [] }, said: 1, seen: 0, coal: 0 };
    const r = R(); if (!r.st || typeof r.st !== 'object' || Array.isArray(r.st)) r.st = { forge: [], bench: [], loom: [] };
    if (cleanFor !== r) { cleanFor = r; for (const k of REFINE_STATIONS) r.st[k] = Array.isArray(r.st[k]) ? r.st[k].filter(o => okOrder(k, o)).slice(0, T.max).map(fixOrder) : []; }
    return r.st[st];
  };
  refineOrders = st => list(st);
  const done = o => !o.all && o.made >= o.want;
  // Input units this order may still take from cell i (an All order keeps its reserve).
  const free = (o, i, f, t) => have(f, t) - (o.all && Array.isArray(o.keep) ? o.keep[i] || 0 : 0);
  // What stops this order now: done, an input short of one unit (miss names it), the product's pile full, or nothing (run).
  refineState = (st, o) => {
    if (done(o)) return { k: 'done', why: 'Done' };
    const need = refineNeed(o.prod, o.tier);
    for (let i = 0; i < need.length; i++) {
      const [f, t, n] = need[i];
      if (free(o, i, f, t) < n) return { k: 'input', miss: [f, t], why: have(f, t) >= n ? `Kept its reserve of ${f === 'coal' ? 'coal' : name(f, t)}` : f === 'coal' ? 'Out of coal' : `Out of ${name(f, t)}` };
    }
    if (typeof stashRoom === 'function' && stashRoom(o.prod, o.tier) < 1) return { k: 'full', why: 'Storehouse full' };
    return { k: 'run', why: '' };
  };
  refineCurrent = st => { if (!refineBuilt(st)) return null; for (const o of list(st)) if (refineState(st, o).k === 'run') return o; return null; };
  // Units an order of this product and grade could make from what you hold now (all: after the reserve it would keep).
  refineMaxUnits = (prod, tier, all) => {
    let m = Infinity;
    for (const [f, t, n] of refineNeed(prod, tier)) { const h = have(f, t), k = all ? Math.ceil(h * T.reserve) : 0; m = Math.min(m, Math.floor(Math.max(0, h - k) / n)); }
    const room = typeof stashRoom === 'function' ? stashRoom(prod, tier) : Infinity;
    return Math.max(0, Math.min(m, room));
  };
  refineSlotFree = st => list(st).length < T.max || list(st).some(done);
  // The camp card's button: "Smelt", or "Smelt · Smelting 4 a minute" while an order runs.
  refineLabel = st => {
    const v = [...new Set(refineProducts(st).map(p => REFINE_PRODUCTS[p].verb))].join(' and '), o = refineCurrent(st);
    if (!o) return v;
    const r = refinePerMin(st, o.tier);
    return `${v} · ${REFINE_PRODUCTS[o.prod].ing} ${r >= 10 ? Math.round(r) : +r.toFixed(1)} a minute`;
  };

  // ---------------- orders ----------------
  refineAdd = (prod, tier, n) => {
    const p = REFINE_PRODUCTS[prod];
    if (!p || !refineOn()) return { ok: false, why: 'Unknown product.' };
    if (!(Number.isInteger(tier) && tier >= 1 && tier <= 5)) return { ok: false, why: 'Unknown tier.' };
    const st = p.st, all = n === 'all';
    if (!built(st)) return { ok: false, why: `Build the ${CAMP_B[st].n} first.` };
    if (!refineSlotFree(st)) return { ok: false, why: `The ${CAMP_B[st].n} holds ${T.max} orders. Remove one first.` };
    const want = all ? 0 : Math.floor(+n);
    if (!all && !(want >= 1)) return { ok: false, why: 'Pick how many.' };
    if (refineMaxUnits(prod, tier, all) < 1) { const s = refineState(st, { prod, tier, want: 1, made: 0, all: 0, at: 0 }); return { ok: false, why: s.k === 'full' ? `Storehouse full: ${name(prod, tier)}.` : s.why || 'Not enough to make one.' }; }
    const o = { prod, tier, want, made: 0, all: all ? 1 : 0, at: 0 };
    if (all) o.keep = refineNeed(prod, tier).map(([f, t]) => Math.ceil(have(f, t) * T.reserve));
    const l = list(st), d = l.findIndex(done);
    if (l.length >= T.max && d >= 0) l.splice(d, 1);   // a finished order makes room
    // a set amount (a shortfall: an upgrade waits on it) goes ahead of the All orders, which may run for hours
    const j = all ? -1 : l.findIndex(x => x.all && !done(x));
    if (j < 0) l.push(o); else l.splice(j, 0, o);
    if (!R().seen) R().seen = Date.now();
    emit('refineOrder', { st, prod, tier, want, all: o.all });
    if (typeof save === 'function') save();
    return { ok: true, o };
  };
  refineRemove = (st, i) => { const l = list(st); if (!(i >= 0 && i < l.length)) return false; l.splice(i, 1); save(); return true; };

  // One unit made: pay its inputs, add the product, train the station's skill.
  const makeOne = (st, o, quiet) => {
    for (const [f, t, n] of refineNeed(o.prod, o.tier)) S.mats[f][t - 1] -= n;
    const got = stashAdd(o.prod, o.tier, 1, 'flow', true);
    o.made += 1;
    gainSkill(REFINE_PRODUCTS[o.prod].skill, T.xp * o.tier, quiet);
    return got;
  };

  // ---------------- live ----------------
  refineTick = dt => {
    if (!refineOn() || !(dt > 0)) return;
    for (const st of REFINE_STATIONS) {
      if (!built(st)) continue;
      let left = dt * refineSpeed(st);
      for (let guard = 0; guard < 1000 && left > 0; guard++) {
        const o = refineCurrent(st); if (!o) break;
        const unit = T.secs[o.tier - 1], need = unit - (o.at || 0);
        if (left < need) { o.at = Math.min(unit, (o.at || 0) + left); break; }
        left -= need; o.at = 0;
        makeOne(st, o, false);
        emit('refined', { st, prod: o.prod, tier: o.tier, n: 1 });
        if (!o.all && o.made === o.want) {
          emit('toast', { key: 'refine-done', msg: `The ${CAMP_B[st].n} made ${storeNum(o.want)} ${plural(o.prod, o.tier, o.want)}.`, kind: 'good', icon: null, prio: 'normal' });
          emit('refineDone', { st, prod: o.prod, tier: o.tier, n: o.want });
        }
      }
    }
  };
  onTick(dt => refineTick(dt));

  // ---------------- coal ----------------
  let coalCarry = 0, coalFor = null;
  on('harvest', e => {
    if (!e || e.kind !== 'ore' || e.t !== 1 || !(e.n > 0) || !refineOn() || !built('forge')) return;
    if (coalFor !== S) { coalFor = S; coalCarry = 0; }
    const x = e.n * T.coalDrop + coalCarry, n = Math.floor(x + 1e-9);
    coalCarry = x - n;
    if (!(n > 0)) return;
    const got = stashAdd('coal', 1, n, 'flow', !!e.away);
    if (e.away) { awayIn('coal', 1, got); return; }
    if (got > 0 && typeof addFloat === 'function') addFloat(`+${got} Coal`, '#9A97B3', false, 0.7, 0.42);
    if (got > 0 && !R().coal) { R().coal = 1; emit('toast', { key: 'refine-coal', msg: 'Coal! Copper Ore brings coal now the Forge is built. The Forge smelts it with ore into Ingots.', kind: 'good', icon: null, prio: 'normal' }); }
  });

  // ---------------- away ----------------
  // Inflow while away: the 'harvest' events marked away (the hero's away gathering, Spillover) and the coal they brought.
  let awayStock = null, awayFlow = null, awayLinesOut = [];
  const cellKey = (f, t) => f + ':' + t;
  function awayIn(f, t, n) { if (awayFlow && n > 0) awayFlow[cellKey(f, t)] = (awayFlow[cellKey(f, t)] || 0) + n; }
  on('awayBegin', () => { awayStock = JSON.parse(JSON.stringify(S.mats)); awayFlow = {}; awayLinesOut = []; });
  on('harvest', e => { if (e && e.away && awayFlow && e.n > 0) awayIn(e.kind, e.t, e.n); });
  // Runs every built station's orders over T seconds. stock: S.mats at the start; inflow: { 'fam:t': units } arriving
  // evenly. Never takes more than S.mats holds now (Hands, builds and trade may have moved it). Returns per-station tallies.
  refineAwayRun = (Tsecs, stock, inflow) => {
    const out = {};
    if (!refineOn() || !(Tsecs > 0)) return out;
    const used = {}, made = {};
    const base = (f, t) => Math.max(0, ((stock && stock[f]) || [])[t - 1] || 0);
    const flow = (f, t) => (inflow && inflow[cellKey(f, t)]) || 0;
    // what the cell holds at time x, minus what this pass already took (never more than S.mats holds now)
    const at = (f, t, x) => Math.min(have(f, t) + (used[cellKey(f, t)] || 0), base(f, t) + flow(f, t) * Math.min(1, x / Tsecs)) - (used[cellKey(f, t)] || 0);
    const room = (p, t) => (typeof stashRoom === 'function' ? stashRoom(p, t) : Infinity);
    // can o make its next unit at time x? (the live rule: every input, net of its reserve, and room for one)
    const can = (o, x) => !done(o) && refineNeed(o.prod, o.tier).every(([f, t, n], i) => at(f, t, x) - (o.all && o.keep ? o.keep[i] || 0 : 0) >= n) && room(o.prod, o.tier) >= 1;
    // the earliest time after x that o could run, from inflow alone (Infinity: never in this absence)
    const when = (o, x) => {
      if (done(o) || room(o.prod, o.tier) < 1) return Infinity;
      let w = x;
      refineNeed(o.prod, o.tier).forEach(([f, t, n], i) => {
        const k = o.all && o.keep ? o.keep[i] || 0 : 0, u = used[cellKey(f, t)] || 0;
        if (have(f, t) - k < n) { w = Infinity; return; }   // even everything held now is short
        const v = flow(f, t);
        if (base(f, t) - u - k >= n) return;
        w = v > 0 ? Math.max(w, (u + k + n - base(f, t)) * Tsecs / v) : Infinity;
      });
      return w;
    };
    const clock = {};
    for (const st of REFINE_STATIONS) if (built(st) && list(st).length) { clock[st] = 0; out[st] = { made: {}, used: {}, stop: null }; }
    for (let guard = 0; guard < 200000; guard++) {
      let st = null; for (const s of Object.keys(clock)) if (clock[s] < Tsecs && (st === null || clock[s] < clock[st])) st = s;
      if (st === null) break;
      const x = clock[st], sp = refineSpeed(st), l = list(st);
      // the first order that can finish its unit, checked at the moment the unit would finish
      let o = null, fin = 0;
      for (const c of l) { if (done(c)) continue; const f = x + (T.secs[c.tier - 1] - (c.at || 0)) / sp; if (can(c, Math.min(f, Tsecs))) { o = c; fin = f; break; } }
      if (!o) {
        const next = Math.min(...l.map(c => when(c, x)));
        clock[st] = next > x && next < Tsecs ? next : Tsecs;
        continue;
      }
      if (fin > Tsecs) { o.at = Math.min(T.secs[o.tier - 1], (o.at || 0) + (Tsecs - x) * sp); clock[st] = Tsecs; continue; }
      for (const [f, t, n] of refineNeed(o.prod, o.tier)) { const k = cellKey(f, t); used[k] = (used[k] || 0) + n; out[st].used[k] = (out[st].used[k] || 0) + n; }
      o.at = 0;
      makeOne(st, o, true);
      const mk = cellKey(o.prod, o.tier); made[mk] = (made[mk] || 0) + 1; out[st].made[mk] = (out[st].made[mk] || 0) + 1;
      clock[st] = fin;
    }
    for (const st of Object.keys(out)) {
      const first = list(st).find(c => !done(c));
      out[st].stop = !first ? (list(st).length ? 'done' : null) : refineCurrent(st) ? null : (w => w.charAt(0).toLowerCase() + w.slice(1))(refineState(st, first).why);
    }
    return out;
  };
  const DID = { forge: 'smelted', bench: 'sawed', loom: 'made' };
  on('awayEnd', r => {
    if (!awayStock) return;
    const stock = awayStock, inflow = awayFlow; awayStock = null; awayFlow = null;
    // stock that came in while away by other paths (Hands' deliveries, trade, a bounty) counts too, spread over the absence
    for (const f of STOCK_FAMILIES) (S.mats[f] || []).forEach((n, i) => {
      const k = cellKey(f, i + 1), x = n - Math.max(0, ((stock[f] || [])[i]) || 0) - (inflow[k] || 0);
      if (x > 0) inflow[k] = (inflow[k] || 0) + x;
    });
    const res = refineAwayRun(r && r.t || 0, stock, inflow);
    awayLinesOut = [];
    for (const [st, x] of Object.entries(res)) {
      const mk = Object.entries(x.made); if (!mk.length) continue;
      const parts = mk.map(([k, n]) => { const [p, t] = k.split(':'); return `${REFINE_PRODUCTS[p].did} ${storeNum(n)} ${plural(p, +t, n)}`; });
      // what it used: the raw inputs, then coal ("from 20 Silver Ore, 18 Iron Ore and 48 Coal")
      const used = Object.entries(x.used).sort((a, b) => (a[0].startsWith('coal') ? 1 : 0) - (b[0].startsWith('coal') ? 1 : 0))
        .map(([k, n]) => { const [f, t] = k.split(':'); return `${storeNum(n)} ${plural(f, +t, n)}`; });
      const usedTxt = used.length > 1 ? used.slice(0, -1).join(', ') + ' and ' + used[used.length - 1] : used[0] || '';
      const verb = parts.length === 1 ? parts[0] : `${DID[st]} ${parts.map(s => s.replace(/^\w+ /, '')).join(' and ')}`;
      awayLinesOut.push({ icon: null, group: 'Camp', txt: `The ${CAMP_B[st].n} ${verb} from ${usedTxt}` + (x.stop === 'done' ? ' (all orders done).' : x.stop ? ` (stopped: ${x.stop}).` : '.'),
        sub: 'Station orders keep running while you are away', goLabel: 'Orders', go: () => { if (typeof refineUI === 'object' && refineUI) refineUI.open(st); } });
    }
  });
  // 55-stats loads after this file, so the line source registers on the first absence (AWAY_LINES exists by then). It goes
  // first, so the Camp block (what the stations made) leads the other systems' lines, right under Materials.
  let lineOn = false;
  on('awayBegin', () => {
    if (lineOn) return; lineOn = true;
    const fn = () => { const l = awayLinesOut; awayLinesOut = []; return l.length ? l : null; };
    registerAwayLine(fn); AWAY_LINES.splice(AWAY_LINES.indexOf(fn), 1); AWAY_LINES.unshift(fn);
  });

  // ---------------- the old-save card ----------------
  // refineOldCard() -> true once: a save from before refining, the Forge built (the UI shows the card on opening Craft).
  refineOldCard = () => {
    if (!refineOn() || R().said || !built('forge')) return false;
    R().said = 1; save(); return true;
  };

  // ---------------- Next Up ----------------
  // offer: the orders that would cover a cost's shortfall in middles at grade t, net of orders already making them.
  refineOffer = (cost, t) => {
    const mats = cost && cost.mats ? cost.mats : cost || {}, short = {}, orders = [];
    if (refineOn()) for (const [k, n] of Object.entries(mats)) {
      const raw = REFINE_RAW[k]; if (!raw) continue;
      const st = REFINE_PRODUCTS[k].st, l = built(st) ? list(st) : [];
      if (l.some(o => o.prod === k && o.tier === t && o.all && refineState(st, o).k === 'run')) continue;   // an All order covers it
      const pending = l.filter(o => o.prod === k && o.tier === t && !o.all).reduce((a, o) => a + Math.max(0, o.want - o.made), 0);
      const miss = n - have(k, t) - pending; if (!(miss > 0)) continue;
      (short[k] = [0, 0, 0, 0, 0])[t - 1] = miss;
      const can = built(st) ? refineMaxUnits(k, t, false) : 0;
      const why = !built(st) ? `Build the ${CAMP_B[st].n} first.` : !refineSlotFree(st) ? `The ${CAMP_B[st].n} holds ${T.max} orders.` : can < 1 ? refineState(st, { prod: k, tier: t, want: 1, made: 0, all: 0, at: 0 }).why : '';
      orders.push({ st, prod: k, tier: t, want: miss, ok: !why, full: !why && can >= miss, why });
    }
    const add = () => { let n = 0; for (const o of orders) if (o.ok && refineAdd(o.prod, o.tier, o.want).ok) n++; return n; };
    return { short, orders, add };
  };
  // The piece the next refine is for: a worn piece's next upgrade, else the next craft of a worn position, short only of
  // middles (gold and Trophies in hand).
  const kindsAt = pos => { const row = CRAFT_FITS[pos] || {}, who = heroWho(); return ((who !== 'any' && row[who]) || row.any || []).filter(k => !CRAFT_KINDS[k].legacy && craftKindVisible(k)); };
  const onlyMiddles = (mats, t) => {
    let mid = false;
    for (const [k, n] of Object.entries(mats)) { if (matOwn(k, t) >= n) continue; if (!REFINE_RAW[k]) return false; mid = true; }
    return mid;
  };
  // The craft Next Up's forge goal works towards (the same pick as 55-goals.js forgeNext: the best-funded open craft, a
  // weapon first on a tie). upgrade-goal-chip-order's rule holds for refining too: never refine for an upgrade of the piece
  // that craft replaces, nor one whose inputs leave less of a shared material (same grade, or essence) than it needs.
  const craftNext = () => {
    let best = null;
    const zt = Math.min(5, zoneTier(S.maxZone || 1));
    for (const pos of CRAFT_HERO_POS) {
      const cur = equipped(pos);
      for (const kind of kindsAt(pos)) {
        const t = (cur && (cur.slot === kind || cur.u) ? cur.t : 0) + 1; if (t > zt) continue;
        const c = canCraft(kind, t);
        if (!c.cost || c.lv < c.need || c.unbuilt) continue;
        const ks = Object.keys(c.cost.mats);
        const p = c.ok ? 1 : Math.min(0.99, ks.reduce((a, k) => a + Math.min(1, matOwn(k, t) / Math.max(1, c.cost.mats[k])), 0) / Math.max(1, ks.length));
        const score = p + (pos === 'weapon' ? 0.02 : 0);
        if (!best || score > best.score) best = { kind, t, pos, cost: c.cost.mats, p, score };
      }
    }
    return best;
  };
  // what refining a cost's missing middles at grade t (and paying the cost) takes from each cell
  const takes = (mats, t) => {
    const out = {};
    for (const [k, n] of Object.entries(mats)) {
      const miss = REFINE_RAW[k] ? Math.max(0, n - matOwn(k, t)) : 0;
      if (!REFINE_RAW[k]) out[k + ':' + t] = (out[k + ':' + t] || 0) + n;
      if (miss) for (const [f, tt, m] of refineNeed(k, t)) out[f + ':' + tt] = (out[f + ':' + tt] || 0) + m * miss;
    }
    return out;
  };
  // (only what it can take now: while an input is short, the line says to gather it, which serves the craft too)
  const clash = (f, mats, t) => f && Object.entries(takes(mats, t)).some(([key, n]) => {
    const [k, tt] = key.split(':'), h = matOwn(k, +tt); return f.cost[k] && (k === 'ess' || +tt === f.t) && h >= n && h - n < f.cost[k];
  });
  let needSig = '', needVal = null;
  const refineFor = () => {
    if (!refineOn() || !built('forge') && !built('bench') && !built('loom')) return null;
    const sig = JSON.stringify([S.gold, S.maxZone, S.mats, S.equip, S.camp && S.camp.b, CRAFT_HERO_POS.map(p => { const it = equipped(p); return it ? [it.slot, it.t, it.plus] : 0; }),
      Object.values(S.skills || {}).map(x => x && x.lv), S.craft && S.craft.troph]);
    if (sig === needSig) return needVal;
    needSig = sig; needVal = null;
    const troph = (S.craft && S.craft.troph || []).some(n => n > 0), f = craftNext();
    for (const pos of CRAFT_HERO_POS) {
      if (f && f.p >= 1) break;   // a craft is ready: Next Up says craft it, not refine for an upgrade
      if (f && f.p > 0 && pos === f.pos) continue;
      const it = equipped(pos); if (!it || !CRAFT_KINDS[it.slot] || !craftKindVisible(it.slot) || it.plus >= CRAFT_TROPHY_GATE.max) continue;
      const c = upgradeCost(it);
      if (S.gold < c.gold || (c.troph && !troph) || !onlyMiddles(c.mats, it.t) || clash(f, c.mats, it.t)) continue;
      const nm = it.u ? kindName(it.slot, it.t, it.u) : CRAFT_KINDS[it.slot].noun;
      return (needVal = { mats: c.mats, t: it.t, what: `your ${nm} +${it.plus + 1}` });
    }
    const zt = Math.min(5, zoneTier(S.maxZone || 1));
    for (const pos of CRAFT_HERO_POS) {
      const cur = equipped(pos);
      for (const kind of kindsAt(pos)) {
        const t = (cur && cur.slot === kind ? cur.t : 0) + 1; if (t > zt) continue;
        const c = canCraft(kind, t);
        if (c.ok || !c.cost || c.unbuilt || c.lv < c.need || S.gold < (c.cost.gold || 0) || !onlyMiddles(c.cost.mats, t)) continue;
        const nm = kindName(kind, t), a = /^[AEIOU]/.test(nm) ? 'an' : 'a';
        return (needVal = { mats: c.cost.mats, t, what: `${a} ${nm}` });
      }
    }
    return null;
  };
  // goalNow() -> { ready, off, label, st } | { ready: false, label, pct, go } | null
  const goalNow = () => {
    const need = refineFor(); if (!need) return null;
    const off = refineOffer(need.mats, need.t), o = off.orders[0]; if (!o) return null;
    if (off.orders.every(x => x.full)) return { ready: true, off, st: o.st,
      label: off.orders.map((x, i) => `${i ? REFINE_PRODUCTS[x.prod].verb.toLowerCase() : REFINE_PRODUCTS[x.prod].verb} ${storeNum(x.want)} ${plural(x.prod, x.tier, x.want)}`).join(' and ') + ` for ${need.what}` };
    // the gap is an input: say where to get it (coal comes with Copper Ore), never offer an order that stops at once
    const g = off.orders.find(x => !x.full);
    if (!built(g.st)) return null;
    // three stopped orders fill the station: say so, and Go opens its card (never a silent dead end)
    if (!refineSlotFree(g.st)) return { ready: false, pct: 0.5, label: (refineCurrent(g.st) ? `The ${CAMP_B[g.st].n} has ${T.max} orders. Clear one to ` : `Clear a stopped ${CAMP_B[g.st].n} order to `) + `${REFINE_PRODUCTS[g.prod].verb.toLowerCase()} ${plural(g.prod, g.tier, 2)}`, go: { tab: 'world', sel: '#camp-b-' + g.st } };
    const miss = refineNeed(g.prod, g.tier).find(([f, t, n]) => have(f, t) < n * g.want); if (!miss) return null;
    const [f, t, n] = miss, pct = Math.max(0.05, Math.min(0.95, have(f, t) / (n * g.want)));
    if (f === 'coal') return { ready: false, pct, label: 'Mine Copper Ore to get coal', go: { act: 'gather', node: { kind: 'ore', t: 1 } } };
    const open = GATHER_KINDS.includes(f) && craftNodeVisible(f, t) && skillTierOpen(skillOf(f), t);
    return { ready: false, pct, label: `${NAV_VERB[f] || 'Gather'} ${name(f, t)} to ${REFINE_PRODUCTS[g.prod].verb.toLowerCase()} ${plural(g.prod, g.tier, 2)}`,
      go: open ? { act: 'gather', node: { kind: f, t } } : { tab: 'gat', view: { ore: 'mine', wood: 'wood', fibre: 'forage', hide: 'hunt' }[f] } };
  };
  registerGoal({
    id: 'refine', sys: 'forge', prio: 0.5,
    pct: () => { const g = goalNow(); return g ? (g.ready ? 1 : g.pct) : null; },
    label: () => { const g = goalNow(); return g ? g.label : ''; },
    icon: () => ({ ic: ['anvil', '#B08A5A'] }),
    go: () => {
      const g = goalNow(); if (!g) return null;
      if (g.ready) { const st = g.st; return { tab: 'world', sel: '#camp-b-' + st, fn: () => { const x = goalNow(); if (x && x.ready) x.off.add(); } }; }
      return g.go;
    }
  });
}
