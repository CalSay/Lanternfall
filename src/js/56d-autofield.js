// 56d-autofield: the line-up planner v3 (plan-3 task F3; docs/design/formation.md section 5).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// A plan is 2 companions and a slot (Back, Middle, Front) for each of the three members, the hero
// included. Search (bounded, spec 5.2):
//   1. candidates: at most perRole per role by value (12 at most), never someone on an expedition;
//      pinned companions (S.party.pin, or opts.pin) are always in, and every plan holds them;
//   2. quick score, every pair x every slot order (66 x 6 = 396 placements at most): F2's
//      formQuick(trio) when it exists; else closed form: each member's party-combat damage
//      (heroCombatDps, charDps: trio, synergies, Bonds) measured once per pair in home slots, then
//      Out of place per order;
//   3. shortlist: per pair its best order and its home order; per make-up (tank or not, support or
//      not) the best FORM_TUNE.deep pairs;
//   4. full score: the hold estimate (59-combat partyHoldEstimate) for the shortlist, at most
//      FORM_TUNE.maxEst estimates per search (the field you have now included).
// Score (spec 5.3):
//   push  pack^(1 - w) x boss^w x zoneX^(held - z) x frontTank x tie-breaks
//         pack = the estimate's damage; boss = single-target damage on the zone
//         boss (casters without splash, the boss type's armour, Execute / Hollow Cut / Mark,
//         heroCombatDps); w = bossW, or bossWHard at a region boss or after a failed boss attempt
//         at this zone; frontTank = 1 - bossTank without a tank in Front, 1 - bossTankHard once the
//         zone boss has knocked the party out at this zone (the fight showed it needs a tank)
//         (the spec puts zoneX^(held - z) inside pack; here it scales the whole blend, else at w 0.6 a
//         line-up that loses the packs wins the push, the packs knock it out, and the party flips back)
//   farm  gold per second where it holds; x farmFail when it does not
//   tie-breaks (v2): synBonus per active synergy x strength (at most synMax), behBonus for a Front
//   tank against divers and a stun against Wraith healers.
// When the party changes on its own (spec 5.4): autoPlan(reason) runs on events only (recruit,
// promotion, drill, every 5 levels of a fielded member, a new zone, a fall-back, a failed boss, an
// expedition leaving or coming back, a class change, a pin change, and "stuck": stuckT seconds of
// fighting with no kill and a member down, which also weighs a tank as after a boss knock-out). An automatic change needs a
// gain of FORM_TUNE.hyst (6%) and FORM_TUNE.dwell (300 s of game time) since the last one; ties
// keep the current party. At once: an empty place someone can fill, a pinned companion off the
// field, the party no longer holds the zone it fell back to, or a recruit beats a member by the old
// fieldIfBetter rule (56-roster passes opts.now).
//
// Exposed names:
//   bestLineup(opts) -> { field, cells, score, why, parts } | null (no roster yet)
//     opts.zone    zone to plan for (default: the next zone past your best for 'push', the current zone for 'farm')
//     opts.goal    'push' (default) | 'farm'
//     opts.filter  fn(id) -> bool | [ids] | { circle } | { role }
//     opts.key     cache key for a function filter (without it a function filter is not cached)
//     opts.by      'now' (default: today's levels) | 'potential' (levels once caught up; autoPlan)
//     opts.boss    push only: count the zone boss (default true)
//     opts.pin     [ids] kept in every plan (default S.party.pin; [] for none)
//     opts.bossW   override the boss weight w
//     parts: { zone, goal, by, dps, st, pack, holds, held, margin, goldPerSec, frontTank,
//              synergies: [{ id, name, strength, lv, layer }], reasons: [text], foe, bossW, hard,
//              pins, current: { score, dps, st, holds, held } | null, gain, same, cand, placements, est }
//   bestLineupLater(opts, cb)  the same search in small steps through idleTask (sync without it);
//                              cb(res) once done. For background refreshes (the Party tab)
//   lineupScore(field, opts) -> { score, dps, st, holds, held, margin, goldPerSec, cells, synergies }
//     (opts.cells: the placement; default: home slots)
//   applyLineup(res) -> field   sets field and cells in one change (56e setSlots)
//   autoPlan(reason, opts) -> { changed, res, wait } | null (the planner cannot run)
//     reason: 'poll' (runs a plan only when an event made one due), 'call' / 'on' (runs now), or an
//     event name. opts.force: ignore hysteresis and dwell (autoField(), turning Auto line-up on);
//     opts.now: switch at once when better at all (56-roster fieldIfBetter); opts.by (default
//     'potential'); opts.sync: never spread over idle steps.
//     wait: 'off' (Auto line-up is off) | 'idle' (nothing due) | 'dwell' (due after the dwell)
//           | 'gain' (not 6% better) | 'same' (already the best) | 'planning' (idle steps running)
//   autoPlanInfo() -> { on, pending, planning, dwellLeft, last: { at, reason, from, to, why, gain } | null, changes }
//   AF_TUNE (knobs; bossW, bossWHard, hyst, dwell, deep, maxEst, maxPins are read from FORM_TUNE)
// Events: autoPlan { reason, from: [ids], to: [ids], cells, why, gain } after an automatic change.
// Hooks: formQuick(trio) (F2, probed with typeof): trio = { front, mid, back } ('hero', ids or
//   null) -> { d, st, front, sup } (pack and single-target damage, a pure function); without it,
//   or when it throws or returns a non-number, the closed form above runs.
//
// Cost: an uncached search is ~66 quick measurements plus at most maxEst estimates; a cached plan
// re-measures itself and the field you have now (two estimates). The cache key holds the roster
// (levels in steps of lvStep), zone, class, pins and the boss state. Nothing runs per tick: events
// mark a plan as due; the tick starts it; in the browser it runs in idleTask steps of about
// stepUnits (a quick = 1, an estimate = estUnits), so no step is a long task.

// var: 56-roster (earlier in the load) asks for autoPlan and bestLineup by typeof.
var AF_TUNE, bestLineup, bestLineupLater, lineupScore, applyLineup, autoPlan, autoPlanInfo;

{
  const T = {
    perRole: 3,           // candidates per role (by value), so the search stays bounded
    synBonus: 0.03,       // tie-break per active synergy, x its strength
    synMax: 0.08,         // at most +8%: a synergy wins when damage is close, never against a big gap
    behBonus: 0.03,       // foe behaviours the estimate does not model (a Front tank vs divers, a stun vs Wraith healers)
    bossTank: 0.35,       // push: no tank in Front scores 35% less (the zone boss's heavy hit; the estimate models packs)
    bossTankHard: 0.7,    // ... 70% less once the zone boss has knocked the party out at this zone
    zoneX: 1.55,          // push: the pack score drops by this for each zone short of the target it holds
    farmFail: 0.1,        // farming: a field that does not hold is worth a tenth
    lvStep: 5,            // cache: levels in steps of 5; autoPlan re-plans every 5 levels of a fielded member
    stX: { isolde: 1.15, corvin: 1.1 },   // single-target: Execute, Hollow Cut
    stPierce: { isolde: 1, corvin: 1 },   // ... which also ignore armour
    markX: 1.08,          // the Ranger hero's Mark on its own hits on the boss
    nowGain: 0.001,       // an urgent re-plan still has to be better at all
    flipT: 600,           // no automatic return to the line-up it left within 10 min (FT7), unless urgent
    stuckSpan: 5,         // after a stuck fight (stuckT), a tank weighs as after a knock-out for 5 zones
    stuckT: 60,           // fighting this long with no kill and a member down: the party is stuck (counts as knocked out)
    stepUnits: 8, estUnits: 3   // idle steps: work per step (a quick = 1, an estimate = estUnits)
  };
  AF_TUNE = T;
  const FT = { bossW: 0.35, bossWHard: 0.6, hyst: 0.06, dwell: 300, deep: 4, maxEst: 32, maxPins: 2, offSlot: 0.1 };
  const F = k => (typeof FORM_TUNE === 'object' && FORM_TUNE && Number.isFinite(FORM_TUNE[k])) ? FORM_TUNE[k] : FT[k];

  const R = id => ROSTER[id];
  const P = () => S.party;
  const COLS = ['back', 'mid', 'front'];
  const FOE_WORD = { slime: 'slimes', bat: 'divers', bones: 'archers', beetle: 'bruisers', spore: 'spore clouds', golem: 'golems', wraith: 'wraiths' };
  const STUNS = { aldric: 1, grenna: 1, thessaly: 1, oriel: 1, kestrel: 1 };
  const onExped = id => { try { return typeof expedOut === 'function' && !!expedOut(id); } catch (e) { return false; } };
  const heroCls = () => (P() && P().cls && HERO_CLASSES[P().cls]) ? P().cls : null;
  const CLS_ROLE = { warden: 'tank', ranger: 'striker', lanternmage: 'caster', lightkeeper: 'support' };
  const roleOf = k => k === 'hero' ? (typeof memberRole === 'function' ? memberRole('hero') : CLS_ROLE[heroCls() || 'warden']) : R(k).role;
  const foeKey = z => { try { const t = TYPES[zoneType(z)]; return t ? t.key : ''; } catch (e) { return ''; } };
  const fmax = () => (ROSTER_TUNE && ROSTER_TUNE.fieldMax) || 2;
  const CT = k => { try { return COMBAT_TUNE[k]; } catch (e) { return undefined; } };
  const num = (v, d) => Number.isFinite(v) ? v : d;
  const combatOn = () => typeof partyCombatOn === 'function' && partyCombatOn();
  const frontTankOf = cells => { for (const k in cells) if (cells[k] && cells[k].col === 2 && roleOf(k) === 'tank') return true; return false; };

  // ---------------- boss state (in memory; the spec's "since the last zone change") ----------------
  let failZone = 0, wipeZone = 0, stuckZone = 0;   // stuckZone outlives zone clears for stuckSpan zones
  const bossHard = z => { try { return regionBossZone(z) || regionBossZone(z - 1) || failZone === z || failZone === z - 1; } catch (e) { return false; } };
  const bossWiped = z => (!!wipeZone && (wipeZone === z || wipeZone === z - 1)) || (!!stuckZone && z - 1 >= stuckZone && z - 1 < stuckZone + T.stuckSpan);

  // ---------------- placements ----------------
  // Every way to put the members (hero first) in distinct slots; cells are built Back to Front.
  function placements(keys) {
    const out = [], n = keys.length, used = [false, false, false], at = [];
    const rec = i => {
      if (i === n) {
        const cells = {};
        for (let c = 0; c < 3; c++) { const j = at.indexOf(c); if (j >= 0 && j < n) cells[keys[j]] = { col: c, lane: 1 }; }
        out.push(cells); return;
      }
      for (let c = 0; c < 3; c++) if (!used[c]) { used[c] = true; at[i] = c; rec(i + 1); used[c] = false; }
    };
    rec(0);
    return out;
  }
  const homeCells = field => {
    const c = typeof slotsFor === 'function' ? slotsFor(['hero'].concat(field), null, null) : null, o = {};
    if (!c) { ['hero'].concat(field).forEach((k, i) => { o[k] = { col: 2 - i, lane: 1 }; }); return o; }
    for (let col = 0; col < 3; col++) for (const k in c) if (c[k].col === col) o[k] = { col, lane: 1 };
    return o;
  };
  const cellKey = (field, cells) => ['hero'].concat(field.slice().sort()).map(k => k + (cells[k] ? cells[k].col : '-')).join(',');
  const homeCol = k => { try { return ({ back: 0, mid: 1, front: 2 })[homeSlot(k)]; } catch (e) { return -1; } };

  // ---------------- damage ----------------
  // Per member, with the placement swapped in: party-combat damage (heroCombatDps, charDps), its
  // pack factor (splash) and single-target factor on the zone boss (spec 5.3: casters and supports
  // without splash, physical hits x armourX on an armoured boss type; Execute, Hollow Cut and
  // Wren's Mark ignore it; the Lanternmage's hits are magic).
  function memberDmg(field, z) {
    const beh = (typeof FOE_BEH === 'object' && FOE_BEH[foeKey(z)]) || {};
    const ax = num(CT('armourX'), 0.85), ao = num(CT('aoeOther'), 0.5), sp = num(CT('lmSplash'), 0.15), ac = num(CT('autoCast'), 1);
    const marked = field.includes('wren'), phys = k => beh.armoured && !marked && !T.stPierce[k] ? ax : 1;
    const cls = heroCls() || 'warden', out = [];
    out.push({ k: 'hero', d: heroCombatDps() * ac, px: cls === 'lanternmage' ? 1 + sp * 0.9 : 1, sx: (cls === 'lanternmage' ? 1 : phys('hero')) * (cls === 'ranger' ? T.markX : 1) });
    for (const k of field) { const r = R(k).role; out.push({ k, d: charDps(k), px: r === 'caster' ? 1 + ao * 0.9 : 1, sx: (r === 'caster' || r === 'support' ? 1 : phys(k)) * (T.stX[k] || 1) }); }
    return out;
  }
  const stOf = m => m.reduce((a, x) => a + x.d * x.sx, 0);
  // Swap a placement in for a measurement (every reader of field/cells follows: slots, Out of place,
  // trio, synergies, Bonds). New objects, so identity caches (56b, 56e) see the change.
  function withPlace(field, cells, fn) {
    const p = P(), f0 = p.field, c0 = p.cells;
    p.field = field.slice(); p.cells = cells;
    try { return fn(); } finally { p.field = f0; p.cells = c0; }
  }

  // ---------------- quick score (one pair, every order) ----------------
  let fq = true;   // formQuick usable (off after it throws or returns a non-number)
  const blend = (d, st, ft, ctx) => ctx.goal === 'farm' ? d : Math.pow(Math.max(d, 1e-12), 1 - ctx.w) * Math.pow(Math.max(st, 1e-12), ctx.w) * (ctx.boss && !ft ? 1 - ctx.tankPen : 1);
  function quickPair(f, ctx) {
    const places = placements(['hero'].concat(f)), home = homeCells(f), out = [];
    if (fq && typeof formQuick === 'function') {
      try {
        for (const cells of places) {
          const trio = { front: null, mid: null, back: null };
          for (const k in cells) trio[COLS[cells[k].col]] = k;
          const r = formQuick(trio);
          if (!r || !Number.isFinite(r.d) || !Number.isFinite(r.st)) throw new Error('formQuick');
          out.push({ cells, q: blend(r.d, r.st, frontTankOf(cells), ctx) });
        }
        return { out, home };
      } catch (e) { fq = false; out.length = 0; }
    }
    // Closed form: measured once in home slots, then Out of place per order (slot jobs and combos
    // wait for formQuick; the full estimate reads them for the shortlist).
    const m = withPlace(f, home, () => memberDmg(f, ctx.z));
    const off = combatOn() ? 1 - F('offSlot') : 1;
    const at = (k, cells) => cells[k] && cells[k].col === homeCol(k) ? 1 : off;
    for (const cells of places) {
      let d = 0, st = 0;
      for (const x of m) { const r = at(x.k, cells) / at(x.k, home); d += x.d * x.px * r; st += x.d * x.sx * r; }
      out.push({ cells, q: blend(d, st, frontTankOf(cells), ctx) });
    }
    return { out, home };
  }

  // ---------------- full score (one hold estimate) ----------------
  function measure(field, cells, ctx, cnt) {
    const z = ctx.z, goal = ctx.goal;
    return withPlace(field, cells, () => {
      let dps = 0, holds = true, margin = 99, gps = 0, held = z;
      const m = memberDmg(field, z);
      if (typeof partyHoldEstimate === 'function') {
        if (cnt) cnt.est++;
        const e = partyHoldEstimate(z);
        dps = e.dps; margin = e.margin; gps = e.goldPerSec;
        held = e.holds && e.zone >= z - 10 ? e.zone : z - 11;
        holds = held >= z;
      } else { dps = m.reduce((a, x) => a + x.d * x.px, 0); gps = dps; }
      const st = stOf(m);
      const syn = typeof activeSynergies === 'function' ? activeSynergies().map(s => ({ id: s.id, name: s.name, strength: num(s.strength, 1), lv: s.lv || s.level || 0, layer: s.layer || s.kind || '' })) : [];
      const synF = 1 + Math.min(T.synMax, T.synBonus * syn.reduce((a, s) => a + s.strength, 0));
      const fk = foeKey(z), ft = frontTankOf(cells);
      let behF = 1;
      if (fk === 'bat' && field.some(k => R(k).role === 'tank' && cells[k] && cells[k].col === 2)) behF += T.behBonus;
      if (fk === 'wraith' && field.some(k => STUNS[k])) behF += T.behBonus;
      const pack = dps, holdF = goal === 'farm' ? 1 : Math.pow(T.zoneX, held - z);
      let score = goal === 'farm' ? gps * (holds ? 1 : T.farmFail) : blend(pack, st, ft, ctx) * holdF;
      score *= synF * behF;
      if (!Number.isFinite(score)) score = 0;
      return { field: field.slice(), cells, key: cellKey(field, cells), score, dps, st, pack, holds, held, margin, goldPerSec: gps, frontTank: ft, synergies: syn };
    });
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
      const r = charRec(k); if (!r) continue;
      const lv = Math.max(r.lv, pl);
      saved.push([r, r.lv, r.rank]);
      r.rank = Math.max(r.rank, Math.min(7, Math.floor((lv - 1) / 25))); r.lv = Math.min(lv, levelCap(r.rank));
    }
    try { return fn(); } finally { for (const [r, lv, rank] of saved) { r.lv = lv; r.rank = rank; } }
  }
  const value = k => charPow(k) * (R(k).role === 'support' ? ROSTER_TUNE.supEq : ROLE_STATS[R(k).role].dps * (1 + (ROLE_STATS[R(k).role].crit || 0) * ((ROLE_STATS[R(k).role].critX || 1) - 1)));
  const pinsOf = (o, pass) => {
    const l = Array.isArray(o.pin) ? o.pin : (P() && Array.isArray(P().pin) ? P().pin : []);
    return l.filter((k, i) => R(k) && isRecruited(k) && !onExped(k) && pass(k) && l.indexOf(k) === i).slice(0, Math.min(fmax(), F('maxPins')));
  };
  function candidates(pass, pins) {
    const all = rosterList().filter(k => !onExped(k) && pass(k));
    const out = pins.slice();
    for (const role of ['tank', 'striker', 'caster', 'support']) for (const k of all.filter(k => R(k).role === role).sort((a, b) => value(b) - value(a)).slice(0, T.perRole)) if (!out.includes(k)) out.push(k);
    return out;
  }
  // Fields of fieldMax (2) companions that hold every pin; one smaller field when the roster is small.
  function pairs(list, pins) {
    const m = fmax(), n = list.length, out = [];
    if (n <= m) return [list.slice()];
    const ok = f => pins.every(k => f.includes(k));
    if (m === 1) { for (const a of list) if (ok([a])) out.push([a]); return out; }
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) { const f = [list[a], list[b]]; if (ok(f)) out.push(f); }
    return out;
  }
  const makeUp = field => { const ks = ['hero'].concat(field); return (ks.some(k => roleOf(k) === 'tank') ? 't' : '') + (ks.some(k => roleOf(k) === 'support') ? 's' : ''); };
  const sameSet = (a, b) => a.length === b.length && a.every(k => b.includes(k));
  const sameCells = (a, b, keys) => keys.every(k => a && b && a[k] && b[k] && a[k].col === b[k].col);
  // Stable order: score, then the field you have now, then ids (spec 5.4: ties keep the current party).
  const byScore = curKey => (a, b) => {
    const d = b.score - a.score;
    if (Math.abs(d) > 1e-9 * Math.max(1, Math.abs(a.score), Math.abs(b.score))) return d;
    if ((a.key === curKey) !== (b.key === curKey)) return a.key === curKey ? -1 : 1;
    return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
  };

  // ---------------- the why line ----------------
  const hasRole = (e, role) => e.field.some(k => R(k).role === role);
  function reasons(best, evals, ctx) {
    const fk = foeKey(ctx.z), foes = FOE_WORD[fk] || 'foes here';
    const out = [];
    const without = test => evals.filter(e => !e.field.some(test)).sort((a, b) => b.score - a.score)[0] || null;
    const need = (test, text) => {
      if (!best.field.some(test)) return;
      const w = without(test);
      // a reason only when the hold estimate says so: without it the zone does not hold (or holds less)
      if (w && (w.held < best.held || (!w.holds && best.holds))) out.push(text);
    };
    need(k => R(k).role === 'tank', 'tank');
    need(k => R(k).role === 'support', 'healer');
    if (out.length) out.splice(0, out.length, `a ${out.join(' and a ')} for the ${foes}`);
    // a tank the packs do not need, in Front for the boss's heavy hit
    else if (ctx.boss && roleOf('hero') !== 'tank' && best.frontTank && hasRole(best, 'tank')) {
      const w = without(k => R(k).role === 'tank');
      if (w && w.pack >= best.pack) out.push('a tank for the boss');
    }
    // the boss blend picked more single-target damage than the best line-up for packs
    if (ctx.goal === 'push' && ctx.hard && out.length < 2) {
      const pk = evals.slice().sort((a, b) => b.pack - a.pack)[0];
      if (pk && pk.key !== best.key && best.st > pk.st * 1.02) out.push('more single-target damage for the boss');
    }
    if (fk === 'bones' || fk === 'golem') need(k => R(k).role === 'caster', 'a caster for the armour');
    if (fk === 'wraith') need(k => !!STUNS[k], 'a stun for the healers');
    return out.slice(0, 2);
  }
  // One plain line: the top two combos, Kin or Bonds (Bonds with their level), then the reasons.
  function whyLine(best, rs, goal) {
    const nm = s => s.lv && /bond/i.test(s.layer) ? `${s.name} (level ${s.lv})` : s.name;
    const syn = best.synergies.slice().sort((a, b) => b.strength - a.strength).slice(0, 2).map(nm);
    const head = syn.join(' + ');
    const tail = rs.join(' and ');
    if (head && tail) return `${head}, ${tail}`;
    if (head || tail) return head || (tail[0].toUpperCase() + tail.slice(1));
    return goal === 'farm' ? 'The fastest gold here' : best.holds ? 'Your strongest three' : 'Your toughest three';
  }

  // ---------------- search ----------------
  // A generator, so the same search runs at once (bestLineup) or in idle steps (bestLineupLater,
  // autoPlan in the browser). It yields the work units it just did; every unit leaves the save as
  // it found it (withPlace, withLevels restore in finally).
  function* search(job) {
    const { ctx, pins, f0, c0, curKey, cnt, list } = job;
    const groups = {};
    for (const f of pairs(list, pins)) {
      const { out, home } = quickPair(f, ctx);
      cnt.nq += out.length;
      let best = null;
      for (const x of out) if (!best || x.q > best.q) best = x;
      const hk = cellKey(f, home), alts = [{ field: f, cells: best.cells }];
      if (cellKey(f, best.cells) !== hk) alts.push({ field: f, cells: home });
      (groups[makeUp(f)] = groups[makeUp(f)] || []).push({ q: best.q, alts });
      yield 1;
    }
    // shortlist: the best `deep` pairs of each make-up, round-robin so a cap never drops a make-up;
    // their best orders first, then their home orders. One estimate stays for the field you have now.
    const deep = Math.max(1, F('deep')), gs = Object.keys(groups).sort(), picked = [];
    for (const g of gs) groups[g].sort((a, b) => b.q - a.q);
    for (let r = 0; r < deep; r++) for (const g of gs) if (groups[g][r]) picked.push(groups[g][r]);
    const cap = Math.max(1, F('maxEst') - 1), sl = [];
    for (const e of picked) if (sl.length < cap) sl.push(e.alts[0]);
    for (const e of picked) if (sl.length < cap && e.alts[1]) sl.push(e.alts[1]);
    const evals = [];
    for (const x of sl) { evals.push(measure(x.field, x.cells, ctx, cnt)); yield T.estUnits; }
    let cur = evals.find(e => e.key === curKey) || null;
    if (!cur && f0.length && c0 && c0.hero) { try { cur = measure(f0, c0, ctx, cnt); } catch (e) { cur = null; } yield T.estUnits; }
    if (!evals.length) evals.push(measure([], homeCells([]), ctx, cnt));
    evals.sort(byScore(curKey));
    const best = evals[0];
    return { best, rs: reasons(best, evals, ctx), cand: list.length, nq: cnt.nq, cur, curKey, est: cnt.est };
  }

  let cache = new Map(), cacheFor = null;
  function sigOf(o, ctx, by, pins) {
    const step = Math.max(1, T.lvStep);
    let s = [heroCls(), ctx.z, ctx.goal, by, ctx.boss, ctx.w, ctx.tankPen, pins.join('+'), o.key || (typeof o.filter === 'function' ? '' : JSON.stringify(o.filter || null)), S.L, Math.floor((S.blade || 0) / 10)].join('|') + '|';
    for (const k of rosterList()) { const r = charRec(k); s += k + Math.floor(r.lv / step) + '.' + r.rank + '.' + r.wpn + '.' + r.trk + (onExped(k) ? 'x' : '') + ','; }
    return s;
  }
  function ctxOf(o) {
    const goal = o.goal === 'farm' ? 'farm' : 'push';
    const z = Math.max(1, Math.floor(o.zone || (goal === 'farm' ? S.zone : (S.maxZone || 0) + 1) || 1));
    const boss = goal === 'push' && o.boss !== false, hard = boss && bossHard(z);
    const w = goal !== 'push' ? 0 : Number.isFinite(o.bossW) ? o.bossW : boss ? (hard ? F('bossWHard') : F('bossW')) : 0;
    return { z, goal, boss, hard, w, tankPen: boss && bossWiped(z) ? T.bossTankHard : T.bossTank };
  }
  const curField = () => ((P() && P().field) || []).filter(k => R(k) && isRecruited(k)).slice(0, fmax());
  // A job: the options resolved against the save as it is now; job.res set when cached.
  function newJob(opts) {
    const o = opts || {}, by = o.by === 'potential' ? 'potential' : 'now', ctx = ctxOf(o);
    const pass = filterFn(o.filter), pins = pinsOf(o, pass);
    if (cacheFor !== S) { cache = new Map(); cacheFor = S; }
    const sig = typeof o.filter !== 'function' || o.key ? sigOf(o, ctx, by, pins) : null;
    const f0 = curField(), c0 = (P() && P().cells) || {};
    const job = { o, by, ctx, pass, pins, sig, f0, c0, curKey: cellKey(f0, c0), cnt: { est: 0, nq: 0 }, ids: f0.slice(), S, res: sig ? cache.get(sig) || null : null, fresh: false };
    if (!job.res) { job.list = candidates(pass, pins); job.ids = job.list.concat(f0.filter(k => !job.list.includes(k))); job.it = search(job); job.fresh = true; }
    return job;
  }
  // Runs up to `units` of work (Infinity: to the end). True when the search is done.
  function stepJob(job, units) {
    if (job.res) return true;
    let left = units;
    return withLevels(job.by, job.ids, () => {
      for (;;) {
        const r = job.it.next();
        if (r.done) { job.res = r.value; if (job.sig) { if (cache.size > 24) cache.clear(); cache.set(job.sig, job.res); } return true; }
        left -= r.value || 1;
        if (left <= 0) return false;
      }
    });
  }
  // The result: a cached pick is measured fresh with the field you have now (two estimates), so the
  // preview compares like with like and follows your moves.
  function finish(job) {
    const res = job.res, ctx = job.ctx, by = job.by, f0 = curField(), c0 = (P() && P().cells) || {}, curKey = cellKey(f0, c0);
    const same = sameSet(f0, res.best.field) && sameCells(c0, res.best.cells, ['hero'].concat(res.best.field));
    const cnt = { est: 0 };
    let b = res.best, current = null;
    if (!job.fresh) b = withLevels(by, res.best.field, () => measure(res.best.field, res.best.cells, ctx, cnt));
    if (same) current = b;
    else if (job.fresh && res.cur && res.curKey === curKey) current = res.cur;
    else if (f0.length && c0.hero) { try { current = withLevels(by, f0, () => measure(f0, c0, ctx, cnt)); } catch (e) { current = null; } }
    const pc = current ? { score: current.score, dps: current.dps, st: current.st, holds: current.holds, held: current.held } : null;
    return {
      field: b.field.slice(), cells: JSON.parse(JSON.stringify(b.cells)), score: b.score, why: whyLine(b, res.rs, ctx.goal),
      parts: { zone: ctx.z, goal: ctx.goal, by, dps: b.dps, st: b.st, pack: b.pack, holds: b.holds, held: b.held, margin: b.margin, goldPerSec: b.goldPerSec, frontTank: b.frontTank,
        synergies: b.synergies.slice(), reasons: res.rs.slice(), foe: foeKey(ctx.z), bossW: ctx.w, hard: ctx.hard, pins: job.pins.slice(),
        current: pc, gain: pc && pc.score > 0 ? b.score / pc.score : null, same, cand: res.cand, placements: res.nq, est: (job.fresh ? res.est : 0) + cnt.est }
    };
  }
  const live = () => typeof rosterLive === 'function' && rosterLive();
  bestLineup = opts => {
    if (!live()) return null;
    const job = newJob(opts);
    stepJob(job, Infinity);
    return finish(job);
  };
  // Idle steps; a step re-checks that the save is the same one (a load mid-search drops it).
  function runLater(job, cb) {
    const step = () => {
      if (job.S !== S || !live()) { cb(null); return; }
      let done = false;
      try { done = stepJob(job, T.stepUnits); } catch (e) { cb(null); return; }
      if (!done) { idleTask(step); return; }
      let r = null; try { r = finish(job); } catch (e) {}
      cb(r);
    };
    idleTask(step);
  }
  bestLineupLater = (opts, cb) => {
    const done = typeof cb === 'function' ? cb : () => {};
    if (!live()) { done(null); return; }
    if (typeof idleTask !== 'function') { let r = null; try { r = bestLineup(opts); } catch (e) {} done(r); return; }
    const job = newJob(opts);
    if (job.res) { done(finish(job)); return; }
    runLater(job, done);
  };
  lineupScore = (field, opts) => {
    const o = opts || {}, ctx = ctxOf(o);
    const f = (field || []).filter(k => isRecruited(k)).slice(0, fmax());
    return withLevels(o.by, f, () => measure(f, o.cells || homeCells(f), ctx));
  };
  applyLineup = res => {
    if (!res || !Array.isArray(res.field)) return null;
    if (typeof setSlots === 'function' && res.cells && res.cells.hero) {
      const spec = { back: null, mid: null, front: null };
      let ok = true;
      for (const k of ['hero'].concat(res.field)) { const c = res.cells[k]; if (!c || !(c.col >= 0 && c.col <= 2) || spec[COLS[c.col]]) { ok = false; break; } spec[COLS[c.col]] = k; }
      if (ok && setSlots(spec)) return P().field;
    }
    const f = setField(res.field);
    if (res.cells && sameSet(f, res.field) && res.cells.hero) {
      P().cells = JSON.parse(JSON.stringify(res.cells));   // a new object: the stage watches identity
      emit('fieldChange', { field: P().field });
    }
    return f;
  };

  // ---------------- automatic changes (spec 5.4) ----------------
  // clock: game seconds since load (ticks), for the dwell. In memory: after a load the first due
  // plan may change the party at once.
  const AP = { clock: 0, lastAt: -1e9, last: null, pending: null, checked: false, job: null, changes: 0, flipHold: 0 };
  const hasBench = f => rosterList().some(k => !f.includes(k) && !onExped(k));
  // After a fall-back: does the party you have now hold the zone it fell back to? (one estimate)
  const holdsHere = () => { try { return typeof partyHoldEstimate !== 'function' || partyHoldEstimate(S.zone, { one: true }).holds; } catch (e) { return true; } };
  // Apply a finished plan if the rules allow (the field must be the one the plan started from).
  function decide(b, reason, must, now, force, f) {
    if (!b) return { changed: false, wait: 'idle' };
    if (b.parts.same) return { changed: false, res: b, wait: 'same' };
    const gain = b.parts.gain;
    const enough = must || (gain != null && gain >= 1 + (now ? T.nowGain : F('hyst'))) || (gain == null && b.field.length > 0);
    if (!enough) return { changed: false, res: b, wait: 'gain' };
    const back = AP.last && AP.clock - AP.last.at < T.flipT && sameSet(b.field, AP.last.from) && sameSet(f, AP.last.to);
    if (back && !must && !now) { AP.pending = reason; AP.checked = true; AP.flipHold = AP.last.at + T.flipT; return { changed: false, res: b, wait: 'dwell' }; }
    applyLineup(b);
    AP.lastAt = AP.clock; AP.changes++;
    AP.last = { at: AP.clock, reason, from: f.slice(), to: b.field.slice(), why: b.why, gain };
    emit('autoPlan', { reason, from: f.slice(), to: b.field.slice(), cells: b.cells, why: b.why, gain });
    return { changed: true, res: b, forced: !!force };
  }
  autoPlan = (reason, opts) => {
    if (!live()) return null;
    const o = opts || {}, p = P();
    reason = reason || 'poll';
    if (reason === 'poll') { if (!AP.pending) return { changed: false, wait: 'idle' }; reason = AP.pending; }
    const force = !!o.force || reason === 'on';
    if (!p.autoField && !force) { AP.pending = null; return { changed: false, wait: 'off' }; }
    if (AP.job && !force) { AP.pending = reason; return { changed: false, wait: 'planning' }; }
    const f = curField(), pins = pinsOf({}, () => true);
    // must: the party breaks a pin or has an empty place someone can fill; now: better at all
    const must = force || pins.some(k => !f.includes(k)) || (f.length < fmax() && hasBench(f));
    let now = must || !!o.now;
    if (!now && reason === 'wipe' && !AP.checked) now = !holdsHere();
    if (reason === 'stuck') now = true;
    if (!now && AP.clock - AP.lastAt < F('dwell')) { AP.pending = reason; AP.checked = true; return { changed: false, wait: 'dwell' }; }
    AP.pending = null; AP.checked = false;
    const opt = { by: o.by || 'potential' };
    if (typeof idleTask === 'function' && !o.sync && !force) {
      const job = newJob(opt);
      if (!job.res) {
        AP.job = job;
        const sig0 = f.join() + '|' + JSON.stringify(p.cells || {});
        runLater(job, b => {
          AP.job = null;
          // the party or the switch changed while planning: plan again later
          if (!b || !P().autoField || curField().join() + '|' + JSON.stringify(P().cells || {}) !== sig0) { if (P() && P().autoField) AP.pending = AP.pending || reason; return; }
          decide(b, reason, must, now, false, f);
        });
        return { changed: false, wait: 'planning' };
      }
      return decide(finish(job), reason, must, now, force, f);
    }
    return decide(bestLineup(opt), reason, must, now, force, f);
  };
  autoPlanInfo = () => ({ on: !!(P() && P().autoField), pending: AP.pending, planning: !!AP.job, dwellLeft: Math.max(0, F('dwell') - (AP.clock - AP.lastAt)), last: AP.last, changes: AP.changes });

  // Events mark a plan as due; the tick starts it.
  const due = r => { if (!AP.pending || r === 'wipe' || r === 'pin' || r === 'stuck') { AP.pending = r; AP.checked = false; } };
  const fielded = id => !!(P() && P().field && P().field.includes(id));
  on('recruit', () => due('recruit'));
  on('promote', () => due('promote'));
  on('drill', () => due('drill'));
  on('charLevel', ({ id, lv }) => { if (fielded(id) && lv % T.lvStep === 0) due('level'); });
  on('zoneClear', () => { failZone = 0; wipeZone = 0; due('zone'); });
  on('bossFail', ({ zone }) => { failZone = zone; due('boss'); });
  on('wipe', w => { if (!w || w.arena) return; if (w.boss) wipeZone = w.zone; else due('wipe'); });
  on('expedSent', () => due('exped'));
  on('expedBack', () => due('exped'));
  on('classChosen', () => due('class'));
  on('formPin', () => due('pin'));
  // Stuck: the party fights on with members down and kills nothing (the hero outlasts the pack but
  // cannot finish it). The fight showed the line-up does not hold here: plan now, with a tank weighed
  // as after a boss knock-out.
  let sinceKill = 0;
  on('kill', () => { sinceKill = 0; });
  const anyDown = () => typeof cbUnitHp === 'function' && curField().some(k => { const h = cbUnitHp(k); return !!(h && h.down); });
  onTick(dt => {
    // (the dwell clock and boss state are not tied to the S object: tools swap S in and out to try things)
    AP.clock += dt;
    if (S.activity === 'fight' && combatOn() && !arena && P() && P().autoField) {
      sinceKill += dt;
      if (sinceKill >= T.stuckT) { sinceKill = 0; if (anyDown()) { wipeZone = S.zone; stuckZone = S.zone; due('stuck'); AP.checked = false; } }
    } else sinceKill = 0;
    if (!AP.pending || AP.job) return;
    if (AP.checked && (AP.clock - AP.lastAt < F('dwell') || AP.clock < AP.flipHold)) return;   // looked already: wait out the dwell
    try { autoPlan('poll'); } catch (e) { AP.pending = null; }
  });
}
