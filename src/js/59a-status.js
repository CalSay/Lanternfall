// 59a-status: damage types, statuses and reactions on party combat (Core 2.0 slice S1;
// docs/design/core-2.md 1.2, 1.4, 2, 3; combat-2.md 8.3). Data: 21x-data-types.js.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// What it does:
//   - every hit has one type; foes take x1.5 from their weakness and x0.6 from what they resist
//     (typeX), and hit the party with their own type (res* gear lines and half armour answer it)
//   - the eight harmful statuses on foes and on party members, with core-2's stacking, caps, durations,
//     the crowd-control rules for elites and bosses and diminishing returns (3.4)
//   - one status beat a second for all damage over time (3.1); Burn spreads on death
//   - the reactions Blight, Shatter and Judgement and their 3 s window (3.5)
// Runtime state only (on the foe and unit records of 59-combat): nothing here is saved (core-2 8.1-5).
//
// Exposed names (59-combat and 59b call these at their extension points; others may read them):
//   types   typeX(f, dt) -> multiplier on foe f; typeXKey(key, dt); typeRel(key, dt) -> 1 weak | -1 resist | 0;
//           typeZone(dt, z, mixP) -> the zone's pack-weighted multiplier (hold estimate, planner);
//           lbType() the Lanternbearer's type; heroType(id); unitType(key) ('hero' or a hero id)
//   foes    stApply(f, id, stacks, P, src, opts) -> bool   opts { dur, v } (dur before `control`)
//           stHas(f, id), stStacks(f, id), stLeft(f, id), stSlow(f), stHealX(f) (anti-heal), stVuln(f)
//           stFoeHit(f, amount, src, kind, dt, tags) -> the amount after type, vuln, timing and Shatter
//           stFoeDealt(f, dealt, src, dt) (Curse stores, Judgement heals), stFoeDies(f) (Burn spread, Curse)
//           stBadges(f) -> up to 4 { id, n, f } for the focus foe's chips (a reused list)
//   party   stUnitApply(u, id, stacks, opts), stUnitClear(u), stCleanse(u, n), stUnitVuln(u),
//           stUnitNoHeal(u), stUnitSlow(u), stUnitStunned(u)
//   loop    stTick(dt) (59-combat combatTick, once a frame)
//   tags    stTagNext(tag) marks the Lanternbearer's next strike ('heavy' | 'ab'); ST_HEAVY, ST_AB, ST_CRIT bits
//   info    ST_LAST { dt, rel, x } the last foe hit (the stage's typed number), ST_STATS counters
// Events: reaction { id, foe, amount } (a reaction happened: Blight starts, a Shatter, Judgement opens).

var typeX, typeXKey, typeRel, typeZone, lbType, heroType, unitType,
  stApply, stHas, stStacks, stLeft, stSlow, stHealX, stVuln, stFoeHit, stFoeDealt, stFoeDies, stBadges,
  stUnitApply, stUnitClear, stCleanse, stUnitVuln, stUnitNoHeal, stUnitSlow, stUnitStunned,
  stTick, stTagNext, ST_LAST, ST_STATS, ST_HEAVY, ST_AB, ST_CRIT;

{
  const D = STATUS_DEFS, UD = UNIT_STATUS, K = ST_TUNE;
  ST_HEAVY = 1; ST_AB = 2; ST_CRIT = 4;
  ST_LAST = { dt: '', rel: 0, x: 1, shatter: false, heavy: false };
  ST_STATS = { applied: {}, reactions: { blight: 0, shatter: 0, judgement: 0 }, beats: 0, dot: 0, spread: 0, healed: 0, immune: 0, dr: 0 };
  for (const id in D) ST_STATS.applied[id] = 0;

  // ---------------- types ----------------
  // TX[key][dt]: the multiplier for each foe type key (from its family row), built once.
  const TX = {};
  const rowFor = key => (typeof FOE_TYPE === 'object' && FOE_TYPE[key]) || null;
  function txOf(key) {
    let t = TX[key];
    if (t) return t;
    t = TX[key] = {};
    const r = rowFor(key);
    const res = r && r.region === 'hollow' && K.resistHollow > 0 ? K.resistHollow : TYPE_X.resist;   // S1 pick, see ST_TUNE
    for (const d of DMG_TYPES) t[d] = !r ? 1 : r.weak === d ? TYPE_X.weak : r.res.includes(d) ? res : TYPE_X.neutral;
    return t;
  }
  typeXKey = (key, dt) => (dt && txOf(key)[dt]) || 1;
  typeX = (f, dt) => (f && dt ? typeXKey(f.type, dt) : 1);
  typeRel = (key, dt) => { const x = typeXKey(key, dt); return x > 1 ? 1 : x < 1 ? -1 : 0; };
  // The pack a zone sends: its type mixP of the time, the next type in the cycle for the rest.
  typeZone = (dt, z, mixP) => {
    if (!dt) return 1;
    const m = mixP == null ? 0.72 : mixP, a = TYPES[zoneType(z)], b = TYPES[zoneNextType(z)];
    return m * typeXKey(a && a.key, dt) + (1 - m) * typeXKey(b && b.key, dt);
  };
  lbType = () => { const c = S && S.party && S.party.cls; return (c && LB_DT[c]) || 'phys'; };
  heroType = id => (typeof ROSTER === 'object' && ROSTER[id] && ROSTER[id].dt) || (HERO_DT[id] && HERO_DT[id].dt) || 'phys';
  unitType = key => (key === 'hero' ? lbType() : heroType(key));

  // ---------------- helpers ----------------
  const alive = f => f && !f.dead && f.hp > 0 && !f.gone;
  const units = () => (typeof combatUnits === 'function' ? combatUnits() : []);
  const foes = () => (typeof combatFoes === 'function' ? combatFoes() : []);
  const unitAt = src => { const U = units(); return src >= 0 && U[src] && U[src].live ? U[src] : null; };
  // A unit's hit power P (core-2 0): the Lanternbearer's attack, a hero's damage a swing.
  const powOf = u => !u ? 0 : u.key === 'hero' ? heroAtk() : (u.dps || 0) / Math.max(0.1, u.spd || 1);
  const ccRow = f => (f.boss ? CC_RULES.boss : f.elite || f.champ ? CC_RULES.elite : CC_RULES.normal);
  const ctrlOf = src => { const u = unitAt(src); return u && u.ctrl > 0 ? Math.min(2, u.ctrl) : 1; };
  const rec = (f, id) => { const s = f.ss || (f.ss = {}); return s[id] || (s[id] = { n: 0, t: 0, p: 0, v: 0, src: -1, j: 0, st: 0 }); };
  const peek = (f, id) => (f.ss && f.ss[id]) || null;
  let clock = 0;

  // ---------------- statuses on foes ----------------
  // stacks: stacks to add (bleed, venom); P: the applier's hit power now (a snapshot); src: unit index or -1.
  stApply = (f, id, stacks, P, src, opts) => {
    const d = D[id];
    if (!d || !alive(f)) return false;
    const o = opts || null, n = Math.max(1, stacks | 0);
    src = src == null ? -1 : src;
    ST_STATS.applied[id]++;
    if (id === 'bleed' || id === 'venom') {
      const r = rec(f, id);
      if (!(r.t > 0)) { r.n = 0; r.p = 0; }
      r.n = Math.min(d.max, r.n + n); r.t = (o && o.dur) || d.dur;   // a new stack refreshes all
      r.p = Math.max(r.p, P || 0); r.src = src;
      if (id === 'venom') checkBlight(f);
      return true;
    }
    if (id === 'burn') {
      const r = rec(f, id), p = P || 0;
      // one per foe: the stronger stays (a weaker one only tops up the time of an equal one)
      if (r.t > 0 && r.p > p) return false;
      r.n = 1; r.t = Math.max(r.t > 0 && r.p === p ? r.t : 0, (o && o.dur) || d.dur); r.p = p; r.src = src; r.j = (o && o.j) || 0;
      f.burnT = r.t;
      checkBlight(f);
      return true;
    }
    if (id === 'chill') {
      const x = ccRow(f).chill; if (!(x > 0)) return false;
      const r = rec(f, id), dur = Math.min(d.cap, (o && o.dur ? o.dur : d.dur * ctrlOf(src)) * x);
      r.n = 1; r.t = Math.max(r.t, dur); r.v = f.boss ? d.bossSlow : d.slow; r.src = src; r.st = 0;
      f.chillT = r.t;
      return true;
    }
    if (id === 'stun' || id === 'root') {
      const x = ccRow(f)[id];
      let dur = o && o.dur ? o.dur : d.dur * ctrlOf(src);   // a given duration already carries `control`
      if (!(x > 0)) {
        // bosses are immune: each second of stun fills stagger instead (the bar is S6: f.stag counts it)
        ST_STATS.immune++;
        if (id === 'stun') { f.stag = (f.stag || 0) + CC_RULES.bossStun * Math.min(d.cap, dur); if (typeof onFoeStun === 'function') onFoeStun(f); }
        return false;
      }
      // diminishing returns per foe: a second within drWin lasts half, a third is ignored
      const r = rec(f, id);
      if (clock - r.st >= CC_RULES.drWin) r.n = 0;
      if (r.n >= 2) { ST_STATS.dr++; return false; }
      dur = Math.min(d.cap, dur * x * (r.n === 1 ? 0.5 : 1));
      if (r.n === 1) ST_STATS.dr++;
      r.n++; r.st = clock; r.src = src;
      if (id === 'stun') {
        f.stunT = Math.max(f.stunT || 0, dur);
        if (typeof onFoeStun === 'function') onFoeStun(f);
      } else {
        r.t = Math.max(r.t, dur); f.rootT = r.t;
        if (f.diveT > 0 && typeof endDive === 'function') endDive(f);   // a Root ends a dive
      }
      return true;
    }
    if (id === 'stagger') { f.reelT = Math.max(f.reelT || 0, (o && o.dur) || d.dur); return true; }   // SOLO1: a parry's stagger
    if (id === 'mark') {
      const v = Math.max(d.vMin, Math.min(d.vMax, (o && o.v) || d.v)), dur = (o && o.dur) || d.dur;
      if (f.markT > 0 && (f.mkV || d.v) > v) return false;   // the stronger Mark stays
      if (!(f.markT > 0)) { const r = rec(f, 'mark'); r.st = 0; }   // a fresh Mark: Judgement may open again
      const same = f.markT > 0 && f.mkV === v;
      f.mkV = v; f.markT = same ? Math.max(f.markT, dur) : dur;
      return true;
    }
    if (id === 'curse') {
      const r = rec(f, id);
      if (r.t > 0) return false;   // one per foe
      r.n = 1; r.t = (o && o.dur) || d.dur; r.p = P || 0; r.v = 0; r.src = src;
      return true;
    }
    return false;
  };
  stLeft = (f, id) => {
    if (!f) return 0;
    if (id === 'stun') return Math.max(0, f.stunT || 0);
    if (id === 'mark') return Math.max(0, f.markT || 0);
    if (id === 'stagger') return Math.max(0, f.reelT || 0);
    const r = peek(f, id); return r && r.t > 0 ? r.t : 0;
  };
  stHas = (f, id) => stLeft(f, id) > 0;
  stStacks = (f, id) => { if (!stHas(f, id)) return 0; const r = peek(f, id); return r ? Math.max(1, r.n) : 1; };
  // Chill's slow (the foe's swings and casts): 30%, bosses 15%.
  stSlow = f => { const r = peek(f, 'chill'); return r && r.t > 0 ? r.v : 0; };
  // Anti-heal (3.2): Curse stops a foe's healing; Venom 5+ halves it; they do not stack (Curse wins).
  stHealX = f => (stHas(f, 'curse') ? 0 : stStacks(f, 'venom') >= D.venom.antiHealAt ? K.antiHeal : 1);
  // Σ vuln on the foe (1.2): the Mark status (Reeling stays today's separate x1.5 until S6, 8.2-1).
  stVuln = f => (f && f.markT > 0 && f.mkV > 0 ? Math.min(K.vulnCap, f.mkV) : 0);
  // The Lanternbearer's Focus (55-party) is a Mark by another name until S2 moves it here.
  const marked = f => f.markT > 0 || (typeof partyClock === 'function' && f.markUntil > partyClock());

  // ---------------- reactions ----------------
  const RX_EV = { id: '', foe: null, amount: 0 };
  function reaction(f, id, amount) {
    ST_STATS.reactions[id]++;
    f.rxT = K.rxWin;
    if (f.boss || f.elite) f.stag = (f.stag || 0) + (REACTIONS[id].stag || 0);
    RX_EV.id = id; RX_EV.foe = f; RX_EV.amount = amount || 0;
    emit('reaction', RX_EV);
    const m = typeof mob !== 'undefined' ? mob : null;
    if (f === m && typeof addFloat === 'function') addFloat(REACTIONS[id].n, REACTIONS[id].col, id === 'shatter', 0.7, 0.34);
  }
  function checkBlight(f) {
    const b = peek(f, 'burn'), v = peek(f, 'venom');
    const on = b && b.t > 0 && v && v.t > 0;
    if (on && !f.blight) { f.blight = true; reaction(f, 'blight', 0); }
    else if (!on) f.blight = false;
  }

  // ---------------- hits on foes ----------------
  let pending = 0;
  stTagNext = tag => { pending |= tag === 'heavy' ? ST_HEAVY : tag === 'ab' ? ST_AB : 0; };
  // 59-combat cbStrike takes the Lanternbearer's pending tags once per strike.
  stTagNext.take = () => { const t = pending; pending = 0; return t; };

  // The target side (core-2 1.2): type, vuln, timing; Shatter doubles a heavy hit on a Chilled foe.
  stFoeHit = (f, amount, src, kind, dt, tags) => {
    let a = amount;
    const x = dt ? typeX(f, dt) : 1;
    ST_LAST.dt = dt || ''; ST_LAST.x = x; ST_LAST.rel = x > 1 ? 1 : x < 1 ? -1 : 0; ST_LAST.shatter = false;
    a *= x;
    const vu = stVuln(f);
    if (vu > 0) a *= 1 + vu;
    const tg = tags | 0;
    if ((tg & ST_AB) && (f.rxT > 0 || f.stgT > 0)) a *= K.rxX;   // a reaction window or a Stagger (S6-B: timingX x1.25)
    // heavy: tagged, or a single hit of heavyP x P or more (a crit is not heavy by itself)
    let heavy = !!(tg & ST_HEAVY);
    if (!heavy && kind !== 'burn' && kind !== 'dot') {
      const u = unitAt(src), P = powOf(u);
      const base = (tg & ST_CRIT) && typeof critMult === 'function' ? amount / Math.max(1, critMult()) : amount;
      heavy = P > 0 && base >= K.heavyP * P;
    }
    ST_LAST.heavy = heavy;   // S6-B: 59-combat fills the stagger bar (+5)
    if (heavy) {
      const c = peek(f, 'chill');
      if (c && c.t > 0) {
        a *= REACTIONS.shatter.x; c.t = 0; f.chillT = 0; ST_LAST.shatter = true;
        reaction(f, 'shatter', a);
      }
    }
    return a;
  };
  // After the damage landed: Curse stores a share (capped at 10 P of the curser); holy damage on a
  // Marked foe is Judgement (heals the party 10% of it, at most 5% of each member's max HP a second).
  stFoeDealt = (f, dealt, src, dt) => {
    if (!(dealt > 0)) return;
    const c = peek(f, 'curse');
    if (c && c.t > 0) c.v = Math.min(D.curse.storeCap * c.p, c.v + dealt * D.curse.store);
    if (dt === 'holy' && marked(f)) {
      const mr = rec(f, 'mark');
      if (!mr.st) { mr.st = 1; reaction(f, 'judgement', dealt); }   // the window opens once per Mark
      const heal = dealt * REACTIONS.judgement.heal;
      for (const u of units()) {
        if (!u.live || u.down || !(u.maxHp > 0)) continue;
        if (clock - (u.jdgAt || -9) >= 1) { u.jdgAt = clock; u.jdgGot = 0; }
        const room = u.maxHp * REACTIONS.judgement.cap - (u.jdgGot || 0);
        const h = Math.min(heal, room);
        if (h > 0 && typeof cbHealUnit === 'function') { u.jdgGot = (u.jdgGot || 0) + h; ST_STATS.healed += cbHealUnit(u, h, null); }
      }
    }
  };
  // A foe died: its Burn jumps to the 2 nearest living foes with the time it had left (at least 2 s),
  // up to 3 jumps from the first; a Blighted foe's jump carries half its Venom. A Curse detonates.
  const near = [];
  stFoeDies = f => {
    if (!f || !f.ss) return;
    const b = peek(f, 'burn'), list = foes();
    if (b && b.t > 0 && b.j < D.burn.jumps) {
      near.length = 0;
      for (const o of list) if (o !== f && alive(o)) near.push(o);
      near.sort((p, q) => Math.abs(p.row - f.row) - Math.abs(q.row - f.row));
      const v = peek(f, 'venom'), carry = f.blight && v && v.t > 0 ? Math.floor(v.n / 2) : 0;
      for (let i = 0; i < Math.min(D.burn.spread, near.length); i++) {
        ST_STATS.spread++;
        stApply(near[i], 'burn', 1, b.p, b.src, { dur: Math.max(D.burn.spreadMin, b.t), j: b.j + 1 });
        if (carry > 0) stApply(near[i], 'venom', carry, v.p, v.src);
      }
      b.t = 0;
    }
    const c = peek(f, 'curse');
    if (c && c.t > 0) { detonate(f, c, true); }
  };
  function detonate(f, c, dead) {
    const amt = c.v; c.t = 0; c.v = 0;
    if (!(amt > 0) || typeof cbDamageFoe !== 'function') return;
    if (!dead) cbDamageFoe(f, amt * (1 + stPow(c.src)), c.src, 'dot', 'fire');
    for (const o of foes()) if (o !== f && alive(o)) cbDamageFoe(o, amt * D.curse.splash * (1 + stPow(c.src)), c.src, 'dot', 'fire');
  }
  // Status power and type power from gear lines (core-2 1.1; the lines arrive with S4/S5: 0 until then).
  const PW = { phys: 'pwPhys', holy: 'pwHoly', poison: 'pwPoison', fire: 'pwFire', frost: 'pwFrost' };
  function gearOf(src) { const u = unitAt(src); if (!u) return null; try { return u.key === 'hero' ? gear() : charGear(u.key); } catch (e) { return null; } }
  function stPow(src) { const g = gearOf(src); return g && g.stPow > 0 ? g.stPow / 100 : 0; }
  function dotX(src, dt) { const g = gearOf(src); if (!g) return 1; return 1 + (g.stPow > 0 ? g.stPow / 100 : 0) + (g[PW[dt]] > 0 ? g[PW[dt]] / 100 : 0); }

  // ---------------- statuses on party members ----------------
  const urec = (u, id) => { const s = u.us || (u.us = {}); return s[id] || (s[id] = { n: 0, t: 0, v: 0 }); };
  const upeek = (u, id) => (u.us && u.us[id]) || null;
  stUnitApply = (u, id, stacks, opts) => {
    const d = UD[id];
    if (!d || !u || u.down) return false;
    const o = opts || null, r = urec(u, id), n = Math.max(1, stacks | 0), dur = (o && o.dur) || d.dur;
    if (id === 'bleed' || id === 'venom') {
      if (!(r.t > 0)) r.n = 0;
      // o.floor: raise to at least n stacks instead of adding (S1: a Spore cloud, until S6's pack cadence)
      r.n = Math.min(d.max, o && o.floor ? Math.max(r.n, n) : r.n + n); r.t = dur;
    } else if (id === 'mark') { r.v = Math.max(r.t > 0 ? r.v : 0, (o && o.v) || d.v); r.t = Math.max(r.t, dur); r.n = 1; }
    else { r.n = 1; r.t = Math.max(r.t, dur); }
    return true;
  };
  stUnitClear = u => { if (u && u.us) for (const k in u.us) { u.us[k].t = 0; u.us[k].n = 0; } };
  // Cleanse (3.1): removes n harmful statuses (all their stacks), the most harmful first.
  const CLEANSE_ORDER = ['stun', 'curse', 'venom', 'bleed', 'burn', 'root', 'chill', 'mark'];
  stCleanse = (u, n) => {
    if (!u) return 0;
    let k = 0;
    if (u.poisonT > 0) { u.poisonT = 0; u.poisonDps = 0; k++; }   // the old spore poison (none are made any more)
    if (!u.us) return k;
    for (const id of CLEANSE_ORDER) { if (k >= (n || 1)) break; const r = u.us[id]; if (r && r.t > 0) { r.t = 0; r.n = 0; k++; } }
    return k;
  };
  stUnitVuln = u => { const r = u && upeek(u, 'mark'); return r && r.t > 0 ? Math.min(K.vulnCap, r.v) : 0; };
  stUnitNoHeal = u => { const r = u && upeek(u, 'curse'); return !!(r && r.t > 0); };
  stUnitSlow = u => { const r = u && upeek(u, 'chill'); return r && r.t > 0 ? UD.chill.slow : 0; };
  stUnitStunned = u => { const r = u && upeek(u, 'stun'); return !!(r && r.t > 0); };

  // ---------------- the tick ----------------
  let beat = 0;
  function tickFoe(f, dt, doBeat) {
    const s = f.ss; if (!s) return;
    const b = s.burn, v = s.venom, bl = s.bleed, c = s.curse;
    if (doBeat && alive(f) && typeof cbDamageFoe === 'function') {
      // one number of each DoT per beat; ticks never crit and ignore armour (bleed included)
      if (bl && bl.t > 0) { ST_STATS.dot++; cbDamageFoe(f, D.bleed.coef * bl.p * bl.n * dotX(bl.src, 'phys'), bl.src, 'dot', 'phys'); }
      if (alive(f) && v && v.t > 0) venomTick(f, v);
      if (alive(f) && b && b.t > 0) {
        ST_STATS.dot++;
        cbDamageFoe(f, D.burn.coef * b.p * dotX(b.src, 'fire'), b.src, 'burn', 'fire');
        if (alive(f) && f.blight && v && v.t > 0) venomTick(f, v);   // Blight: each Burn tick also ticks the Venom
      }
    }
    if (bl && bl.t > 0) bl.t -= dt;
    if (v && v.t > 0) { v.t -= dt; if (v.t <= 0) { v.n = 0; checkBlight(f); } }
    if (b && b.t > 0) { b.t -= dt; f.burnT = Math.max(0, b.t); if (b.t <= 0) checkBlight(f); }
    const ch = s.chill; if (ch && ch.t > 0) { ch.t -= dt; f.chillT = Math.max(0, ch.t); }
    const rt = s.root; if (rt && rt.t > 0) { rt.t -= dt; f.rootT = Math.max(0, rt.t); }
    if (c && c.t > 0) { c.t -= dt; if (c.t <= 0 && alive(f)) { c.t = 0.001; detonate(f, c, false); } }
    if (f.rxT > 0) f.rxT -= dt;
  }
  function venomTick(f, v) {
    ST_STATS.dot++;
    const amt = D.venom.coef * v.p * v.n * (1 + D.venom.ramp * v.n) * dotX(v.src, 'poison');
    cbDamageFoe(f, amt, v.src, 'dot', 'poison');
  }
  function tickUnit(u, dt, doBeat) {
    const s = u.us; if (!s) return;
    if (doBeat && !u.down && typeof cbHitUnit === 'function') {
      const bl = s.bleed, v = s.venom, b = s.burn;
      let a = 0, w = 0;
      const pb = bl && bl.t > 0 ? UD.bleed.hp * bl.n : 0;
      const pv = v && v.t > 0 ? UD.venom.hp * v.n * (1 + UD.venom.ramp * v.n) : 0;
      const pf = b && b.t > 0 ? UD.burn.hp : 0;
      a = pb + pv + pf;
      if (a > 0) {
        w = Math.min(1, UD.dotCap / a);   // all damage over time on one member: at most 5% max HP a tick
        if (pv > 0) cbHitUnit(u, u.maxHp * pv * w, 'poison', null);
        if (pb > 0 && !u.down) cbHitUnit(u, u.maxHp * pb * w, 'bleed', null);
        if (pf > 0 && !u.down) cbHitUnit(u, u.maxHp * pf * w, 'burn', null);
      }
    }
    for (const k in s) { const r = s[k]; if (r.t > 0) { r.t -= dt; if (r.t <= 0) { r.t = 0; r.n = 0; } } }
  }
  stTick = dt => {
    clock += dt;
    beat += dt;
    const doBeat = beat >= K.tick;
    if (doBeat) { beat -= K.tick; ST_STATS.beats++; }
    const list = foes();
    for (let i = 0; i < list.length; i++) { const f = list[i]; if (f && !f.dead) tickFoe(f, dt, doBeat); }
    const U = units();
    for (let i = 0; i < U.length; i++) { const u = U[i]; if (u.live) tickUnit(u, dt, doBeat); }
  };

  // ---------------- the focus foe's badges (combat-2 2.6) ----------------
  const BADGES = [], BPOOL = [];
  for (let i = 0; i < 4; i++) BPOOL.push({ id: '', n: 0, f: -1 });
  stBadges = f => {
    BADGES.length = 0;
    if (!f || f.dead) return BADGES;
    for (const id of ST_BADGE_ORDER) {
      if (BADGES.length >= 4) break;
      const left = stLeft(f, id); if (!(left > 0)) continue;
      const b = BPOOL[BADGES.length], d = D[id];
      b.id = id; b.n = id === 'bleed' || id === 'venom' ? stStacks(f, id) : 0;
      b.f = Math.max(0, Math.min(1, left / Math.max(1, id === 'stun' ? d.cap : d.cap || d.dur)));
      BADGES.push(b);
    }
    return BADGES;
  };
}
