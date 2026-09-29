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

let lbClass, lbHas, lbRole, lbHome, lbKit, clsResolve, chooseBase, clsSwitchInfo, clsInfo, clsSet, lbSync;

{
  registerState('cls', {
    v: 1, base: null, evo: null, evo2: null, proven: {}, trials: {}, respec: 0, free: 1, at: 0,
    slots: { ab1: null, ab2: null, ab3: null }, auto: { ab1: 1, ab2: 1, ab3: 1 }, mig: 0, from: null
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
  let syncFor = null, syncKey;
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
      emit('classMigrated', { from: key, base: l.base, evo: l.evo, proven });
      const nm = CLASS_DEFS[l.base].name;
      const msg = l.evo
        ? `Classes changed. You are a ${nm} on the ${EVO_NAMES[l.evo].name}'s path. Nothing was lost.`
        : `Classes changed. You are still a ${nm}. Your Proving opens at the Fenmother.`;
      toast(msg, 'good', null, 'normal');
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
      sw: clsSwitchInfo(now)
    };
  };

  // Once per loaded save, and whenever the class may have changed.
  onTick(() => lbSync());
  on('classChosen', () => lbSync());
  lbSync();
}
