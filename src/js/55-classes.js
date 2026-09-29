// 55-classes: Classes 2.0, slice S2 (docs/design/classes-2.md 3.4-3.5, 7, 8.3). The class state S.cls,
// the one-time migration from the four old classes, the class accessors, the base-class choice and the
// one free "second thoughts" switch. Data: 24-data-classes.js. The kits themselves run in 55-party.js.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// How the class is kept (S2):
//   S.cls = { v, base, evo, evo2, proven, trials, respec, free, at, slots, auto, mig, from } (3.5).
//   S.party.cls keeps its legacy values ('warden' | 'ranger' | 'lanternmage' | 'lightkeeper'): it names the
//   kit that runs (CLS_KIT(base, evo)), so every reader written before S2 keeps working. 55-classes writes
//   it; nothing else should. When the two disagree (an old save, a tool that sets S.party.cls), the legacy
//   key wins and S.cls follows it through LEGACY_CLS (lbSync). New code reads lbClass() / lbHas().
//
// API:
//   lbClass()  -> { base, evo, evo2 } (a kept object: copy what you keep)
//   lbHas(tag) -> bool   'base:warrior', 'evo:priest', 'cls:warden' (the legacy data tag: every Warrior),
//                        'cls:lanternmage', 'cls:ranger', 'cls:lightkeeper'
//   lbRole()   -> 'tank' | 'striker' | 'caster' | 'support' | null (the evolution's role, else the base's)
//   lbHome()   -> 'front' | 'mid' | 'back' | null
//   lbKit()    -> the legacy kit key or null
//   clsResolve(key) -> { base, evo, kit } | null   key: a base id or a legacy class key
//   chooseBase(base, opts) -> bool   the player's choice (the picker): a first choice, a Mirror's choice,
//                        or the free switch within CLS_TUNE.secondThoughtsMin minutes (once per save)
//   clsSwitchInfo(now) -> { ok, left (ms), used }   the free switch
//   clsInfo()  -> the class card's facts (76-create.js draws them)
//   clsSet(base, evo, opts)  55-party's chooseClass writes the class through this (no rules)
// Events: classMigrated { from, base, evo, proven } (once per save).

//
// S3 (classes-2 2, 3.1-3.7): the evolutions on top of the kits.
//   clsEvo() -> the evolution whose kit runs (granted or chosen) or null; clsProven(); clsStrength() -> 1 proven,
//     CLS_TUNE.unproven (0.6) for a granted path not yet proven (3.7), 0 none; clsGate() -> { lv, lvOk, bossOk, open }
//   provingInfo() -> { id, trial, n, won, best, prove, gate, open, choice, why }; provingStart(opts) (59f-trials runs it)
//   evoChoice() -> bool (the choice card is open: a Proving passed and no evolution yet)
//   chooseEvo(evo, opts) (the choice card; or the one free change inside its window)
//   respecCost('evo' | 'base') -> { mirrors, ess: { t, n }, esc, have, needM, needE, ok, why }
//   respecEvo(evo, opts), respecBase(base, opts) (the Mirror of Embers, 3.4); useMirror (55-party) pays the base cost
//   clsTactics() -> { slots, conds, acts, presets } (3.6, for S7)
// State added: S.cls.lm (Great Lanterns that paid a Mirror). Events: evoChosen { evo, from, base, free },
//   evoProven { evo }, provingPassed { base, respec } (the UI opens the choice card).

let lbClass, lbHas, lbRole, lbHome, lbKit, clsResolve, chooseBase, clsSwitchInfo, clsInfo, clsSet, lbSync;
let clsEvo, clsProven, clsStrength, clsGate, provingInfo, provingStart, evoChoice, chooseEvo, respecCost, respecPay, respecEvo, respecBase, clsTactics;

{
  registerState('cls', {
    v: 1, base: null, evo: null, evo2: null, proven: {}, trials: {}, respec: 0, free: 1, at: 0,
    slots: { ab1: null, ab2: null, ab3: null }, auto: { ab1: 1, ab2: 1, ab3: 1 }, mig: 0, from: null, lm: 0
  });
  const C = () => S.cls;
  const OUT = { base: null, evo: null, evo2: null };
  const clsNow = () => Date.now();
  const pastBoss = () => lanternsLitAt(S.maxZone) >= 1;   // the Fenmother (zone 35, the Hollow's boss) beaten once

  clsResolve = key => {
    if (!key) return null;
    if (CLASS_DEFS[key]) return { base: key, evo: null, kit: CLS_KIT(key, null) };
    const l = LEGACY_CLS[key];
    return l ? { base: l.base, evo: l.evo, kit: key } : null;
  };

  // The one-time migration (7.1) and the repair that keeps S.cls in step with the kit key.
  let syncFor = null, syncKey, said = null;
  lbSync = () => {
    const p = S.party, c = C();
    if (!p || !c) return;
    const key = p.cls || null;
    if (syncFor === S && syncKey === key && CLS_KIT(c.base, c.evo) === key) return;
    syncFor = S; syncKey = key;
    if (!key || !LEGACY_CLS[key]) {
      // No class yet (a new game, or "choose your path"). An S.cls left from a tool resetting the class clears.
      if (c.base && !key) { c.base = null; c.evo = null; }
      return;
    }
    if (CLS_KIT(c.base, c.evo) === key) return;
    const l = LEGACY_CLS[key];
    if (!c.base && !c.mig) {
      // An old save: its class becomes a base class (and the Warden or Lightkeeper path, granted).
      c.base = l.base; c.evo = l.evo; c.mig = 1; c.from = key; c.at = 0;
      const proven = !!(l.evo && pastBoss());
      if (proven) c.proven[l.evo] = 1;
      // Said on the first tick (the UI listens by then; a toast in the first seconds folds into What's new).
      said = { from: key, base: l.base, evo: l.evo, proven };
      return;
    }
    // The kit key changed under us (a tool or an older code path set it): follow it.
    c.base = l.base; c.evo = l.evo;
  };

  lbClass = () => { lbSync(); const c = C(); OUT.base = c.base; OUT.evo = c.evo; OUT.evo2 = c.evo2; return OUT; };
  lbKit = () => { lbSync(); return S.party && LEGACY_CLS[S.party.cls] ? S.party.cls : null; };
  lbHas = tag => {
    const i = String(tag).indexOf(':'), k = String(tag).slice(0, i), v = String(tag).slice(i + 1);
    const c = lbClass();
    if (k === 'base') return c.base === v;
    if (k === 'evo') return c.evo === v;
    if (k === 'cls') {
      // Legacy data tags (item kinds, powers, boons, Bonds keep their cls fields): the kit they belonged to.
      if (v === 'warden') return c.base === 'warrior';
      if (v === 'lanternmage') return c.base === 'mage';
      if (v === 'lightkeeper') return c.base === 'mage' && c.evo === 'priest';
      return c.base === v;
    }
    return false;
  };
  lbRole = () => { const c = lbClass(); return c.evo && EVO_NAMES[c.evo] ? EVO_NAMES[c.evo].role : c.base ? CLASS_DEFS[c.base].role : null; };
  lbHome = () => { const c = lbClass(); return c.base ? CLASS_DEFS[c.base].home : null; };

  // Writes the class (55-party's chooseClass calls it; no rules here). Changing base clears the evolution
  // (3.4), unless the new class is a legacy key that carries one. Returns the kit key.
  clsSet = (base, evo, opts) => {
    const c = C(), o = opts || {};
    if (!CLASS_DEFS[base]) return null;
    const same = c.base === base;
    c.base = base;
    c.evo = evo !== undefined ? evo : same ? c.evo : null;
    if (!same || o.stamp) c.at = o.now || clsNow();
    const kit = CLS_KIT(c.base, c.evo);
    if (S.party) S.party.cls = kit;
    syncFor = S; syncKey = kit;
    return kit;
  };

  clsSwitchInfo = now => {
    const c = C(), t = now || clsNow(), win = CLS_TUNE.secondThoughtsMin * 60e3;
    const left = c.at > 0 ? c.at + win - t : 0;
    const ok = !!(S.party && S.party.chosen && c.base && c.free > 0 && left > 0);
    return { ok, left: ok ? left : 0, used: !(c.free > 0) };
  };

  // The player's choice from the picker. opts: { name, now }.
  chooseBase = (base, opts) => {
    lbSync();
    const o = opts || {}, c = C(), p = S.party;
    if (!CLASS_DEFS[base] || !p || typeof chooseClass !== 'function') return false;
    if (p.chosen && c.base) {
      if (c.base === base) return true;
      if (c.evo && c.proven[c.evo] && !c.mig) return false;   // S3: once evolved, the free change is for the path (chooseEvo)
      const sw = clsSwitchInfo(o.now);
      if (!sw.ok) return false;
      c.free = 0;
      const okd = chooseClass(base, o.name, { now: o.now, free: true });
      if (okd) c.at = 0;   // the window closes once used
      return okd;
    }
    return chooseClass(base, o.name, { now: o.now });
  };

  // The class card's facts: base, evolution (granted or locked), tier 2 (locked), the free switch.
  clsInfo = now => {
    const c = lbClass(), s = C();
    if (!c.base) return null;
    const d = CLASS_DEFS[c.base], ev = c.evo ? EVO_NAMES[c.evo] : null;
    const gateLv = S.L >= CLS_TUNE.evoLv, gateBoss = pastBoss();
    return {
      base: c.base, name: d.name, weight: d.weight, home: d.home, role: lbRole(), col: d.col,
      evo: c.evo, evoName: ev ? ev.name : null, evoTitle: ev ? ev.title : null,
      proven: !!(c.evo && s.proven[c.evo]), migrated: !!s.mig, from: s.from,
      paths: d.evos.map(id => ({ id, name: EVO_NAMES[id].name, kind: EVO_NAMES[id].kind, line: EVO_NAMES[id].line })),
      gate: { lv: CLS_TUNE.evoLv, lvOk: gateLv, bossOk: gateBoss, open: gateLv && gateBoss },
      sw: clsSwitchInfo(now),
      // S3: the evolution's kit and strength, the Proving, the choice card
      str: typeof clsStrength === 'function' ? clsStrength() : 0,
      proving: typeof provingInfo === 'function' ? provingInfo() : null,
      choice: typeof evoChoice === 'function' ? evoChoice() : false
    };
  };

  // ================= S3: the evolutions, the Proving, the respec (classes-2 2, 3) =================
  const now0 = o => (o && o.now) || clsNow();
  const trialRec = id => { const t = C().trials; return t[id] && typeof t[id] === 'object' ? t[id] : { n: 0, won: 0, best: 0 }; };
  clsGate = () => ({ lv: CLS_TUNE.evoLv, lvOk: S.L >= CLS_TUNE.evoLv, bossOk: pastBoss(), open: S.L >= CLS_TUNE.evoLv && pastBoss() });
  clsProven = () => { const c = lbClass(); return !!(c.evo && C().proven[c.evo]); };
  // The strength of the evolution's new parts: 1 proven, CLS_TUNE.unproven for a granted path (3.7), 0 none.
  clsStrength = () => { const c = lbClass(); return !c.evo || !EVO_DEFS[c.evo] ? 0 : C().proven[c.evo] ? 1 : CLS_TUNE.unproven; };
  // The evolution whose kit runs (granted or chosen), or null.
  clsEvo = () => { const c = lbClass(); return c.evo && EVO_DEFS[c.evo] ? c.evo : null; };
  const anyWon = () => { const t = C().trials; for (const k in t) if (t[k] && t[k].won) return true; return false; };
  // The choice card is open: a Proving passed (any, 3.4: a base change keeps it) and no evolution yet.
  evoChoice = () => { const c = lbClass(); return !!(c.base && !c.evo && S.party && S.party.chosen && anyWon()); };
  provingInfo = () => {
    const c = lbClass(); if (!c.base) return null;
    const tr = CLASS_TRIALS[CLASS_DEFS[c.base].trial], rec = trialRec(tr.id), g = clsGate();
    const prove = !!(c.evo && !C().proven[c.evo]);   // a granted path proves itself (3.7)
    const need = prove || (!c.evo && !anyWon());
    return { id: tr.id, trial: tr, n: rec.n || 0, won: !!rec.won, best: rec.best || 0, prove, gate: g, open: g.open && need, choice: evoChoice(),
      why: !need ? '' : !g.bossOk ? 'Beat the Fenmother first.' : !g.lvOk ? `Reach level ${g.lv} first.` : '' };
  };
  provingStart = opts => {
    const p = provingInfo();
    if (!p || !p.open || typeof trialStart !== 'function') return false;
    return trialStart(p.id, Object.assign({ kind: 'proving' }, opts || {}));
  };
  on('trialEnd', e => {
    if (!e || e.kind !== 'proving') return;
    const c = C(), r = Object.assign({ n: 0, won: 0, best: 0 }, trialRec(e.id));
    r.n++; r.best = Math.max(r.best || 0, Math.round(e.pct || 0)); if (e.won) r.won = 1;
    c.trials[e.id] = r;
    if (!e.won) return;
    const lc = lbClass();
    if (lc.evo && !c.proven[lc.evo]) {
      c.proven[lc.evo] = 1;
      const d = EVO_DEFS[lc.evo];
      toast(`You passed the Proving. You are ${d.title} now: the ${d.name} at full strength.`, 'good', null, 'high');
      emit('evoProven', { evo: lc.evo });
    } else if (evoChoice()) {
      toast('You passed the Proving. Choose your path.', 'good', null, 'high');
      emit('provingPassed', { base: lc.base });
    }
  });

  // Choose an evolution (the choice card, 3.3), or use the one free change within the window (3.4).
  // opts: { now }. Returns true when the evolution changed (or was already this one).
  const setEvo = (evo, o, free) => {
    const c = C(), lc = lbClass(), from = lc.evo, fromKit = S.party.cls;
    c.proven[evo] = 1;
    c.at = now0(o);
    const kit = clsSet(lc.base, evo, { now: c.at, stamp: true });
    const d = EVO_DEFS[evo], ab = CLASS_ABILITIES[d.ab2];
    emit('evoChosen', { evo, from, base: lc.base, free: !!free });
    emit('classChosen', { cls: kit, from: fromKit, base: lc.base, evo, free: !!free });
    toast(`You are a ${d.name} now. ${ab.name} is ready.`, 'good', null, 'high');
    return true;
  };
  chooseEvo = (evo, opts) => {
    lbSync();
    const c = C(), lc = lbClass(), d = EVO_DEFS[evo];
    if (!d || !lc.base || d.base !== lc.base) return false;
    if (lc.evo === evo) return true;
    if (!lc.evo) return evoChoice() ? setEvo(evo, opts, false) : false;
    const sw = clsSwitchInfo(now0(opts));
    if (!sw.ok) return false;
    c.free = 0;
    setEvo(evo, opts, true);
    c.at = 0;   // the window closes once used
    return true;
  };

  // ---- the Mirror of Embers (3.4) ----
  // Essence worth `hours` of fighting at the farm zone: packs an hour at the pace farm time x the Essence chance.
  const essFor = hours => {
    const z = typeof farmableZone === 'function' ? Math.max(1, Math.min(S.maxZone, farmableZone())) : S.maxZone;
    const perH = 3600 / (PACE.farmSecs + 0.45) * essChance();
    return { t: zoneTier(z), n: Math.max(1, Math.ceil(perH * hours)) };
  };
  // kind: 'evo' (switch path, same base) | 'base' (change class). -> { kind, mirrors, ess: { t, n }, esc, have, needM, needE, ok, why }
  respecCost = kind => {
    const k = kind === 'base' ? 'base' : 'evo', row = CLS_TUNE.respec[k], c = C();
    const esc = Math.min(CLS_TUNE.respec.escMax, 1 + CLS_TUNE.respec.esc * (c.respec || 0));
    const e = essFor(row.essHours * esc), mirrors = row.mirrors;
    const haveM = (S.party && S.party.mirrors) || 0, haveE = (S.mats && S.mats.ess && S.mats.ess[e.t - 1]) || 0;
    const needM = Math.max(0, mirrors - haveM), needE = Math.max(0, e.n - haveE);
    const why = needM ? `You need ${needM} more Mirror${needM > 1 ? 's' : ''} of Embers.` : needE ? `You need ${fmt(needE)} more ${MAT.ess.short[e.t - 1]} Essence.` : '';
    return { kind: k, mirrors, ess: e, esc, have: { mirrors: haveM, ess: haveE }, needM, needE, ok: !why, why };
  };
  const pay = cost => { S.party.mirrors -= cost.mirrors; S.mats.ess[cost.ess.t - 1] -= cost.ess.n; C().respec = (C().respec || 0) + 1; };
  respecPay = kind => { const c = respecCost(kind); if (!c.ok) return false; pay(c); return true; };
  // Switch to the other evolution of the same base: the free change inside its window, else 1 Mirror + Essence.
  respecEvo = (evo, opts) => {
    lbSync();
    const lc = lbClass(), d = EVO_DEFS[evo];
    if (!d || !lc.evo || d.base !== lc.base || evo === lc.evo) return false;
    if (clsSwitchInfo(now0(opts)).ok) return chooseEvo(evo, opts);
    const cost = respecCost('evo'); if (!cost.ok) return false;
    pay(cost);
    setEvo(evo, opts, false);
    return true;
  };
  // Change base class: 2 Mirrors + Essence. Gear retools (55-crafting on classChosen), each class keeps its
  // star layouts, the evolution clears; a save that passed a Proving picks the new class's path at once.
  respecBase = (base, opts) => {
    lbSync();
    const lc = lbClass();
    if (!CLASS_DEFS[base] || !lc.base || base === lc.base || typeof chooseClass !== 'function') return false;
    const cost = respecCost('base'); if (!cost.ok) return false;
    pay(cost);
    const okd = chooseClass(base, undefined, { now: now0(opts), respec: true });
    if (okd && evoChoice()) emit('provingPassed', { base, respec: true });
    return okd;
  };

  // Tactics (3.6, for S7): rule slots and the conditions and actions this class has.
  clsTactics = () => {
    const c = lbClass(); if (!c.base) return null;
    const A = CLS_TACTICS.all, B = CLS_TACTICS[c.base], ev = c.evo && C().proven[c.evo] ? EVO_DEFS[c.evo] : null;
    return { slots: ev ? 2 : 1, conds: A.conds.concat(B.conds, ev ? ev.tactics.conds : []), acts: A.acts.concat(B.acts, ev ? ev.tactics.acts : []),
      presets: [B.preset].concat(ev ? [ev.tactics.preset] : []) };
  };

  // Mirrors from Great Lanterns (3.4): one on each relit from Region 2 on (a quiet catch-up pays too, once).
  on('greatLantern', e => {
    if (!e || !(e.n >= CLS_TUNE.mirrorFromRegion) || !S.party) return;
    const c = C();
    if ((c.lm || 0) >= e.n) return;
    const add = e.n - Math.max(c.lm || 0, CLS_TUNE.mirrorFromRegion - 1);
    c.lm = e.n;
    if (add <= 0) return;
    S.party.mirrors = (S.party.mirrors || 0) + add;
    if (e.rewards && !e.quiet) e.rewards.push({ txt: `+${add} Mirror of Embers`, ic: ['orb', '#FF9E3D'] });
  });

  // Once per loaded save, and whenever the class may have changed.
  onTick(() => {
    lbSync();
    if (!said) return;
    const m = said; said = null;
    emit('classMigrated', m);
    const nm = CLASS_DEFS[m.base].name;
    toast(m.evo
      ? `Classes changed. You are a ${nm} on the ${EVO_NAMES[m.evo].name}'s path. Nothing was lost.`
      : `Classes changed. You are still a ${nm}. Your Proving opens at the Fenmother.`, 'good', null, 'normal');
  });
  on('classChosen', () => lbSync());
  lbSync();
}
