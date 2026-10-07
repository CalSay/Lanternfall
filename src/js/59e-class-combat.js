// 59e-class-combat: the six evolutions on party combat (Classes 2.0 slice S3; docs/design/classes-2.md 2.3-2.8).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Data: 24-data-classes.js (EVO_DEFS, CLASS_ABILITIES, CLS_TUNE). State: 55-classes.js (clsEvo, clsStrength).
//
// The kit that runs is still the base class's (55-party.js, by legacy kit key: a Reaver or Warden plays the
// Warrior's taps and Shield Wall, a Warlock the Lanternmage's, a Lightkeeper the legacy Lightkeeper kit). This
// file adds what each evolution brings on top, through events and a few hooks 59-combat calls:
//   Reaver       Fury (replaces Grit: clsNoGrit), Cinder Edge, Unstoppable, Blood Price; Rend
//   Warden       Bulwark, Holy Sparks, Oath of the Order (Middle and Back take 10% less); Stand Fast
//   Venomstalker the Venom ramp, Seep, Patient Hunter, status damage +25%; Deathcap
//   Trapper      Focus Marks 30% (clsMarkAdd), traps (2 charges, laid on every pack), Tripwire; Snare Field
//   Warlock      Hex (3 Embers or a Flare curse), Creeping Hex, Held Light, Dark Turned (Witchfire); Witchfire
//   Lightkeeper  (the legacy kit: Given Light, Blessing, Rally Hymn) + ward 30%, Vows; Sanctuary
// A path not yet proven (3.7) runs its new parts at
// CLS_TUNE.unproven (0.6) and keeps the base stats; the evolution line (bucket C) and stats wait for the Proving.
// Stagger (`f.stag`) is only counted until S6 adds the bar; clsStagX() is the Warden's +30% for S6 to read.
//
// Exposed:
//   hooks  clsHeroStats() -> { role, hp, hpX, armour, block, ward, threat, area, ctrl, healX } | null (59-combat
//          statUnit; null = the base kit's stats), clsDr(u, kind, f) -> damage-taken multiplier (59-combat
//          cbHitUnit), clsHeroHitX(f, tags) -> the hero's damage multiplier on foe f and clsHeroHit(f, dealt, tags)
//          (59-combat cbStrike), clsNoGrit(), clsMarkAdd() (55-party), clsStagX()
//   ab2    castAb2(opts) -> bool, ab2Info() -> { id, name, desc, cd, left, ready, auto, autoOn, unlocked, str } | null,
//          ab2Auto(on) (S.cls.auto.ab2; S.party.autoCast stays the master switch)
//   ui     clsMeter() -> { id, name, v, max } | null, clsFinisher() -> the Finisher's CLASS_ABILITIES row (S6),
//          evoLamp() -> '#hex' | null (the lamp colour look), CLS_STATS (counters for checks and the sim)
// Events: ability2 { evo, id, name, auto }. Titles: codexTitles() gains c_<evo> (classes-2 D5).

var clsHeroStats, clsDr, clsHeroHitX, clsHeroHit, clsNoGrit, clsMarkAdd, clsStagX, castAb2, ab2Info, ab2Auto,
  clsMeter, clsFinisher, evoLamp, CLS_STATS;

{
  const TU = CLS_TUNE, A = CLASS_ABILITIES;
  const tn = k => bonus('tune:' + k);
  const ks = id => bonus('ks:' + id) > 0;
  const on_ = () => typeof partyCombatOn === 'function' && partyCombatOn() && target() === 'mob';
  const alive = f => f && !f.dead && f.hp > 0 && !f.gone;
  const foes = () => (typeof combatFoes === 'function' ? combatFoes() : []);
  const hero = () => { const u = typeof combatUnits === 'function' ? combatUnits()[0] : null; return u && u.live && u.key === 'hero' ? u : null; };
  const anyFoe = () => { for (const f of foes()) if (alive(f)) return true; return false; };
  const ST = CLS_STATS = { ab2: 0, auto: 0, fury: 0, stops: 0, cinder: 0, leech: 0, bulwark: 0, sparks: 0, standfast: 0, venom: 0, seep: 0, bloom: 0,
    traps: 0, wires: 0, snare: 0, curses: 0, creep: 0, dets: 0, nova: 0, sanct: 0, sanctHeal: 0, sanctShield: 0, rend: 0, dmg: 0 };

  // ---- the evolution now (cheap reads, refreshed each tick) ----
  let evo = null, str = 0, proven = false, def = null;
  function readEvo() {
    evo = typeof clsEvo === 'function' ? clsEvo() : null;
    def = evo ? EVO_DEFS[evo] : null;
    str = evo && typeof clsStrength === 'function' ? clsStrength() : 0;
    proven = str >= 1;
  }
  // The hero's hit power for abilities: its attack.
  const P = () => heroAtk();

  // ---- runtime (never saved) ----
  let clock = 0;
  let fury = 0, lastHit = -9, stopT = 0, stopCd = 0, leechT = 0, leechGot = 0;
  let bulwark = 0, guardUntil = -1, empUntil = -1;
  let hitN = 0, volleyUntil = -1;
  let charges = TU.traps.charges, backT = 0, laid = [], nextKind = 0;
  let heldT = 0, heldGot = 0;
  let sancUntil = -1, sancBeat = 0;
  let ab2Cd = 0, readyFor = 0, ab2For = null;
  let heroK = 1, partyK = 1;
  const reset = () => { fury = 0; bulwark = 0; charges = TU.traps.charges; backT = 0; laid = []; stopT = 0; stopCd = 0; sancUntil = -1; guardUntil = -1; empUntil = -1; ab2Cd = 0; readyFor = 0; };

  // ---------------- hooks for 59-combat and 55-party ----------------
  const HS = { role: '', hp: 0, hpX: 1, armour: 0, block: 0, ward: 0, threat: 1, area: 0, ctrl: 1, healX: 1 };
  clsHeroStats = () => {
    const e = typeof clsEvo === 'function' ? clsEvo() : null;
    if (!e || !(typeof clsProven === 'function' && clsProven())) return null;
    const d = EVO_DEFS[e];
    HS.role = d.role; HS.hp = d.hp; HS.armour = d.armour; HS.ward = d.ward; HS.threat = d.threat; HS.area = d.area;
    HS.block = Math.min(0.5, d.block + (e === 'warden' ? tn('wBlock') : 0));
    HS.hpX = 1 + (d.hpX || 0) + (e === 'warden' ? tn('wHp') : 0);
    HS.ctrl = d.ctrl + (e === 'trapper' ? tn('trapCtrl') : 0);
    HS.healX = 1 + (d.healX || 0);
    return HS;
  };
  clsNoGrit = () => (typeof clsEvo === 'function' ? clsEvo() : null) === 'reaver';
  clsMarkAdd = () => (evo === 'trapper' && proven ? CLASS_ABILITIES.focus.var.trapper.v - 0.25 : 0);
  clsStagX = () => (evo === 'warden' ? 1 + TU.bulwark.stag * str : 1);
  // Damage taken (59-combat cbHitUnit, after the tank cut).
  clsDr = (u, kind, f) => {
    if (!evo) return 1;
    let m = 1;
    if (u.i === 0) {
      if (evo === 'reaver' && proven) m *= 1 - COMBAT_TUNE.tankDr * def.tankDr;   // half the tank cut: heavy armour, no shield
      if (evo === 'reaver' && ks('bloodrage')) m *= 1 + TU.fury.rageTaken;
      if (evo === 'warlock' && ks('pactcinder')) m *= 1 + TU.fury.rageTaken;
      if (evo === 'warden' && guardUntil > clock) m *= 1 - A.standfast.guard;
    } else if (evo === 'warden' && u.col < 2) {
      const h = hero(); if (h && !h.down) m *= 1 - TU.bulwark.backDr * str;   // Oath of the Order
    }
    return m;
  };
  // The hero's hit on foe f (before it lands): Patient Hunter.
  clsHeroHitX = (f, tags) => {
    if (evo === 'venomstalker' && f) { const n = stStacks(f, 'venom'); if (n > 0) return 1 + Math.min(TU.venom.perStackMax, TU.venom.perStack * n); }
    return 1;
  };
  const stX = () => (evo === 'venomstalker' && proven ? 1 + def.stX + tn('stDmg') : 1);
  const venomOn = (f, n) => { if (alive(f) && stApply(f, 'venom', n, P() * stX(), 0)) { ST.venom += n; return true; } return false; };
  // After the hero's hit landed: Cinder Edge, Blood Price, the Venom ramp and Volley's Spore-tipped arrows.
  clsHeroHit = (f, dealt, tags) => {
    if (!evo || !f) return;
    lastHit = clock;
    const tg = tags | 0;
    if (evo === 'reaver') {
      if ((tg & ST_HEAVY) && fury >= TU.fury.cinderAt + tn('cinderAt')) cinder(f);
      const h = hero();
      if (h && !h.down && dealt > 0 && h.hp < h.maxHp * (TU.bloodPrice.at + tn('bloodAt'))) {
        if (clock - leechT >= 1) { leechT = clock; leechGot = 0; }
        const room = h.maxHp * TU.bloodPrice.leechCap - leechGot, amt = Math.min(room, dealt * TU.bloodPrice.leech);
        if (amt > 0) { leechGot += amt; ST.leech += cbHealUnit(h, amt, null); }
      }
    } else if (evo === 'venomstalker' && alive(f)) {
      if ((tg & ST_AB) && clock < volleyUntil) { venomOn(f, TU.venom.volley); return; }
      hitN++;
      const every = tn('venomQuick') > 0 && f.markUntil > (typeof partyClock === 'function' ? partyClock() : 0) ? 2 : TU.venom.every;
      if (hitN % every === 0) venomOn(f, 1);
    }
  };
  function cinder(f) {
    ST.cinder++;
    const p = P() * TU.fury.cinder;
    for (const o of foes()) if (o !== f && alive(o) && o.row === f.row) cbDamageFoe(o, p, 0, 'magic', 'fire');
    if (alive(f)) stApply(f, 'burn', 1, P(), 0);
  }
  const addFury = n => { if (evo !== 'reaver') return; fury = Math.min(100, fury + n); ST.fury += n; };
  const bulMax = () => TU.bulwark.max + tn('bulwarkMax');
  const addBulwark = n => { if (evo !== 'warden') return; const b = bulwark; bulwark = Math.min(bulMax(), bulwark + n * str); ST.bulwark += bulwark - b; };

  // ---------------- events ----------------
  on('classTap', ({ cls, kind, auto }) => {
    if (!evo || !on_()) return;
    const m = typeof mob !== 'undefined' ? mob : null;
    if (kind === 'parry') { addFury(TU.fury.heavy); addBulwark(TU.bulwark.parry); lastHit = clock; return; }
    if (evo === 'reaver' && kind === 'heavy') addFury(auto ? TU.fury.heavyAuto : TU.fury.heavy);
    else if (evo === 'venomstalker' && kind === 'mark' && alive(m)) venomOn(m, TU.venom.focus);
    else if (evo === 'warlock' && kind === 'ember' && alive(m) && (m.embers || 0) >= TU.hex.embersToCurse) curse(m, 0);
  });
  on('ability', ({ cls }) => {
    if (!evo || !on_()) return;
    const m = typeof mob !== 'undefined' ? mob : null;
    if (evo === 'venomstalker' && cls === 'ranger') volleyUntil = clock + 2.3;
    else if (evo === 'warlock' && cls === 'lanternmage' && alive(m)) curse(m, 0);   // the cursing Flare (var.warlock)
  });
  on('unitHit', ({ key, kind, foe, blocked }) => {
    if (!evo || !on_()) return;
    const dot = kind === 'poison' || kind === 'burn' || kind === 'bleed';
    if (key === 'hero' && !dot) { addFury(TU.fury.hit + tn('furyHit')); lastHit = clock; }
    if (evo === 'warden' && blocked && (key === 'hero' || ks('aegis'))) {
      addBulwark(TU.bulwark.block);
      if (key === 'hero' && alive(foe)) { ST.sparks++; cbDamageFoe(foe, (TU.bulwark.spark + tn('spark')) * P() * str, 0, 'magic', 'holy'); }
    }
  });
  on('foeDown', ({ mob: f }) => {
    if (!evo || !f) return;
    addFury(TU.fury.kill);
    if (evo === 'venomstalker' && !ks('lingering')) seep(f);
    if (evo === 'warlock' && f.hexOn) { f.hexOn = 0; detonated(f); creep(f); }
  });
  on('packSpawn', () => {
    if (!evo) return;
    if (evo === 'trapper') layTraps();
  });
  on('telegraphStart', ({ kind, foe }) => {
    // A laid trap springs under the boss on its heavy or slam wind-up: 24 stagger and the boss's slow.
    if (evo !== 'trapper' || !(kind === 'heavy' || kind === 'slam') || !alive(foe)) return;
    const t = laid.shift() || (charges > 0 ? (charges--, { kind: 0 }) : null);
    if (!t) return;
    spring(foe, 0);
    foe.stag = (foe.stag || 0) + TU.traps.bossStag;
  });
  on('classChosen', () => { reset(); readEvo(); });
  on('evoChosen', () => { reset(); readEvo(); });
  on('wipe', () => { fury = 0; laid = []; });

  // ---------------- Venomstalker: Seep ----------------
  function nearest(f, ok) {
    let b = null, bd = 1e9;
    for (const o of foes()) if (o !== f && alive(o) && (!ok || ok(o))) { const d = Math.abs((o.row || 0) - (f.row || 0)); if (d < bd) { bd = d; b = o; } }
    return b;
  }
  function seep(f) {
    const v = f.ss && f.ss.venom, n = v ? v.n : 0, j = f.seepJ || 0;
    if (!(n > 0) || j >= TU.venom.seepJumps) return;
    const k = Math.floor(n * (TU.venom.seep + tn('seep'))); if (k <= 0) return;
    const o = nearest(f); if (!o) return;
    if (stApply(o, 'venom', k, v.p || P(), 0)) { o.seepJ = j + 1; ST.seep++; }
  }

  // ---------------- Trapper: traps ----------------
  const frontFoe = () => { let r = -1, b = null; for (const f of foes()) if (alive(f) && (f.row > r || (f.row === r && b && f.hp < b.hp))) { r = f.row; b = f; } return b; };
  function layTraps() {
    laid = [];
    while (charges > 0) { charges--; laid.push({ f: null, t: TU.traps.springAfter * (1 + laid.length * 0.5), kind: nextKind }); nextKind = 1 - nextKind; }
  }
  const ctrl = () => { const h = hero(); return h ? h.ctrl : 1; };
  // kind 0: Frost Snare (1.5 P frost, Root 3 s, Chill 4 s); 1: Spore Pit (1 P poison to its line, Venom 4 each)
  function spring(f, kind) {
    if (!alive(f)) return;
    ST.traps++;
    const p = P() * str;
    if (kind === 0) {
      cbDamageFoe(f, TU.traps.snare * p, 0, 'magic', 'frost', ST_AB);
      if (alive(f)) { stApply(f, 'root', 1, 0, 0, { dur: TU.traps.rootT * ctrl() }); stApply(f, 'chill', 1, 0, 0, { dur: TU.traps.chillT * ctrl() }); }
    } else {
      for (const o of foes()) if (alive(o) && o.row === f.row) {
        cbDamageFoe(o, TU.traps.pit * p, 0, 'magic', 'poison', ST_AB);
        if (alive(o)) stApply(o, 'venom', TU.traps.pitVenom + tn('pitVenom'), P(), 0);
      }
    }
  }
  function trapTick(dt) {
    const bossy = foes().some(f => alive(f) && (f.boss || f.elite));
    const back = bossy && ks('killground') ? TU.traps.backBoss : Math.max(2, TU.traps.back + tn('trapBack'));
    if (charges + laid.length < TU.traps.charges) { backT += dt; if (backT >= back) { backT = 0; if (anyFoe()) laid.push({ f: null, t: TU.traps.springAfter, kind: (nextKind = 1 - nextKind) }); else charges++; } }
    else backT = 0;
    // Tripwire: a diver in the air springs a charge where it is (a Root ends the dive).
    for (const f of foes()) if (alive(f) && f.diveT > 0 && !f.wired && (laid.length || charges > 0)) {
      f.wired = 1; ST.wires++;
      if (laid.length) laid.shift(); else charges--;
      stApply(f, 'root', 1, 0, 0, { dur: TU.traps.rootT * ctrl() });
      if (tn('wireMark') > 0) stApply(f, 'mark', 1, 0, 0, { v: 0.15, dur: 4 });
    }
    // Laid traps spring on the front foe after a moment (the first to step in); bosses spring them on a wind-up.
    for (let i = laid.length - 1; i >= 0; i--) {
      const t = laid[i]; t.t -= dt;
      if (t.t > 0) continue;
      const f = frontFoe(); if (!f) continue;
      if (f.boss) { t.t = 0; continue; }   // waits for the boss's heavy or slam wind-up
      laid.splice(i, 1);
      spring(f, t.kind);
    }
  }

  // ---------------- Warlock: Hex ----------------
  function curse(f, j) {
    if (!alive(f) || stHas(f, 'curse')) return false;
    if (!stApply(f, 'curse', 1, P(), 0, { dur: TU.hex.curseT })) return false;
    f.hexJ = j || 0; f.hexOn = 1; ST.curses++;
    return true;
  }
  function creep(f) {
    const j = (f.hexJ || 0) + 1;
    if (j > TU.hex.creepJumps && !ks('pactcinder')) return;
    const o = nearest(f, x => !stHas(x, 'curse'));
    if (o && curse(o, j)) ST.creep++;
  }
  // A Curse went off (it ran out, or its foe died): Held Light brings the abilities closer (at most 30% a second).
  function detonated(f) {
    ST.dets++;
    if (ks('pactcinder') && f) for (const o of foes()) if (alive(o)) stApply(o, 'burn', 1, P(), 0);
    if (clock - heldT >= 1) { heldT = clock; heldGot = 0; }
    const x = Math.min(TU.hex.heldCap - heldGot, (TU.hex.heldLight + tn('held')) * str);
    if (x <= 0) return;
    heldGot += x;
    const p = S.party; if (p && p.abilityCd > 0 && typeof abilityInfo === 'function') { const ai = abilityInfo(); if (ai) p.abilityCd = Math.max(0, p.abilityCd - ai.cd * x); }
    if (ab2Cd > 0) ab2Cd = Math.max(0, ab2Cd - cdMax() * x);
  }
  function hexTick() {
    for (const f of foes()) {
      if (!alive(f)) continue;
      if ((f.embers || 0) >= TU.hex.embersToCurse && !stHas(f, 'curse')) curse(f, 0);
      if (f.hexOn && !stHas(f, 'curse')) { f.hexOn = 0; detonated(f); }
    }
  }
  // Dark Turned: Witchfire treats fire resistance as neutral (a weakness still counts).
  const darkX = f => { const x = typeX(f, 'fire'); return x < 1 ? 1 / x : 1; };

  // ---------------- the second ability slot (ab2) ----------------
  const cdMax = () => { const a = def && A[def.ab2]; return a ? a.cd * mod('abilityCd') * (evo === 'warden' && ks('aegis') ? 1.3 : 1) : 1; };
  const stag = (f, n) => { f.stag = (f.stag || 0) + n * clsStagX(); };
  const AB2_EV = { evo: '', id: '', name: '', auto: false };
  castAb2 = opts => {
    if (!evo || !def || ab2Cd > 0 || !on_() || !anyFoe()) return false;
    const auto = !!(opts && opts.auto), p = P(), h = hero(), m = typeof mob !== 'undefined' && alive(mob) ? mob : null;
    const list = foes().filter(alive);
    if (evo === 'reaver') {
      let r = -1; for (const f of list) if (f.row > r) r = f.row;
      const hot = fury >= TU.fury.cinderAt + tn('cinderAt');
      for (const f of list) {
        if (f.row !== r) continue;
        cbDamageFoe(f, 2.5 * p, 0, 'phys', 'phys', ST_HEAVY | ST_AB);
        if (alive(f)) stApply(f, 'bleed', 3 + tn('rendBleed'), p, 0);
        if (alive(f) && hot) { cbDamageFoe(f, TU.fury.cinder * p, 0, 'magic', 'fire'); if (alive(f)) stApply(f, 'burn', 1, p, 0); }
        stag(f, 10);
      }
      addFury(TU.fury.rend); ST.rend++;
    } else if (evo === 'warden') {
      if (h) cbTaunt(h, list, 4);
      guardUntil = clock + 4; empUntil = clock + 6;
      const n = bulwark; bulwark = 0;
      let holy = 0;
      for (const f of list) { holy += cbDamageFoe(f, 0.6 * n * p * str, 0, 'magic', 'holy', ST_AB); stag(f, 3 * n); }
      const sh = 0.15 * n * p * str + (ks('aegis') ? 0.2 * holy : 0);
      if (sh > 0) for (const u of combatUnits()) if (u.live && !u.down) cbShield(u, sh, TU.sanctuary.shieldCap);
      ST.standfast++;
    } else if (evo === 'venomstalker') {
      const f = m || list[0], v = f.ss && f.ss.venom, n = v && v.t > 0 ? v.n : 0;
      if (n > 0) cbDamageFoe(f, (0.4 + tn('bloom')) * p * n * (1 + 0.1 * n) * stX(), 0, 'magic', 'poison', ST_AB);
      if (alive(f) && v && v.t > 0) { v.n = ks('lingering') ? Math.ceil(n / 2) : 0; if (!v.n) v.t = 0; }
      if (alive(f) && !ks('lingering')) venomOn(f, 3);
      for (const o of list) if (o !== f) venomOn(o, 4);
      ST.bloom++;
    } else if (evo === 'trapper') {
      const c = ctrl();
      for (const f of list) {
        cbDamageFoe(f, 1.0 * p, 0, 'magic', 'frost', ST_AB);
        if (!alive(f)) continue;
        if (!ks('killground')) stApply(f, 'root', 1, 0, 0, { dur: 3 * c });
        stApply(f, 'chill', 1, 0, 0, { dur: 4 * c });
        stApply(f, 'mark', 1, 0, 0, { v: 0.2, dur: 8 + tn('snareMark') });
        stag(f, 15);
      }
      charges = TU.traps.charges; laid = []; layTraps(); ST.snare++;
    } else if (evo === 'warlock') {
      const x = 1.5 * (1 + tn('hexDet'));
      for (const f of list) {
        const c = f.ss && f.ss.curse;
        if (!c || !(c.t > 0)) continue;
        const amt = c.v * x; c.t = 0; c.v = 0; f.hexOn = 0;
        if (amt > 0) {
          if (alive(f)) cbDamageFoe(f, amt * darkX(f), 0, 'dot', 'fire');
          for (const o of list) if (o !== f && alive(o)) cbDamageFoe(o, amt * 0.5 * darkX(o), 0, 'dot', 'fire');
        }
        detonated(f);
      }
      for (const f of list) if (alive(f)) cbDamageFoe(f, (1.2 + tn('nova')) * p * darkX(f), 0, 'magic', 'fire', ST_AB);
      for (const f of list) curse(f, 0);
      ST.nova++;
    } else if (evo === 'priest') {
      sancUntil = clock + TU.sanctuary.t; sancBeat = 0;
      for (const f of list) stag(f, 10);
      ST.sanct++;
    }
    ab2Cd = cdMax(); readyFor = 0; ST.ab2++; if (auto) ST.auto++;
    AB2_EV.evo = evo; AB2_EV.id = def.ab2; AB2_EV.name = A[def.ab2].name; AB2_EV.auto = auto;
    emit('ability2', AB2_EV);
    return true;
  };
  // When auto-cast fires ab2 (it never wastes it: Deathcap waits for Venom, Stand Fast for Bulwark).
  function autoWants() {
    const m = typeof mob !== 'undefined' && alive(mob) ? mob : null;
    if (evo === 'venomstalker') return !!m && (stStacks(m, 'venom') >= 7 || readyFor > cdMax());
    if (evo === 'warden') return bulwark >= Math.min(4, bulMax()) || readyFor > cdMax();
    if (evo === 'warlock') { let n = 0; for (const f of foes()) if (alive(f) && stHas(f, 'curse')) n++; return n > 0 || readyFor > cdMax(); }
    if (evo === 'priest') { for (const u of combatUnits()) if (u.live && !u.down && u.hp < u.maxHp * 0.85) return true; return readyFor > cdMax(); }
    return true;
  }
  const autoOn = () => !!(S.party && S.party.autoCast && S.cls && S.cls.auto && S.cls.auto.ab2);
  const autoUnlocked = () => S.maxZone >= 10;   // the ab1 rule (55-party autoCastZone)
  ab2Info = () => {
    if (!evo || !def) return null;
    const a = A[def.ab2];
    return { id: a.id, name: a.name, desc: a.desc, cd: cdMax(), left: Math.max(0, ab2Cd), ready: ab2Cd <= 0, auto: autoUnlocked() && autoOn(), autoOn: autoOn(), unlocked: autoUnlocked(), str, evo };
  };
  ab2Auto = v => { if (!S.cls || !S.cls.auto) return false; S.cls.auto.ab2 = (v === undefined ? !S.cls.auto.ab2 : !!v) ? 1 : 0; return !!S.cls.auto.ab2; };

  // ---------------- meters, finisher, lamp ----------------
  const METER = { id: '', name: '', v: 0, max: 0 };
  clsMeter = () => {
    if (!evo) return null;
    if (evo === 'reaver') { METER.id = 'fury'; METER.name = 'Fury'; METER.v = Math.round(fury); METER.max = 100; }
    else if (evo === 'warden') { METER.id = 'bulwark'; METER.name = 'Bulwark'; METER.v = Math.floor(bulwark); METER.max = bulMax(); }
    else if (evo === 'trapper') { METER.id = 'traps'; METER.name = 'Traps'; METER.v = charges + laid.length; METER.max = TU.traps.charges; }
    else return null;
    return METER;
  };
  clsFinisher = () => { const c = typeof lbClass === 'function' ? lbClass() : null; if (!c || !c.base) return null; return A[c.evo && EVO_DEFS[c.evo] ? EVO_DEFS[c.evo].finisher : CLASS_DEFS[c.base].finisher] || null; };
  evoLamp = () => { const e = typeof clsEvo === 'function' ? clsEvo() : null; return e ? EVO_DEFS[e].col : null; };

  // ---------------- damage modifiers ----------------
  // Hero-only (the A1 trick: dmg x k, party x 1/k): the evolution line, Fury, Blood Price. Party-wide: Stand Fast.
  addModifier('dmg', () => heroK * partyK);
  addModifier('party', () => (heroK !== 1 ? 1 / heroK : 1));
  function readK() {
    let k = 1, pk = 1;
    if (evo) {
      if (proven && def.dmg) k *= 1 + def.dmg;
      if (evo === 'reaver') {
        k *= 1 + TU.fury.per10 * Math.floor(fury / 10);
        const h = hero(); if (h && !h.down && on_() && h.hp < h.maxHp * (TU.bloodPrice.at + tn('bloodAt'))) k *= 1 + TU.bloodPrice.dmg;
      }
      if (evo === 'warden' && empUntil > clock) pk *= 1 + (A.standfast.emp + tn('sfEmp')) * str;
    }
    heroK = k; partyK = pk;
  }

  // ---------------- the tick ----------------
  onTick(dt => {
    clock += dt;
    readEvo();
    if (ab2For !== S) { ab2For = S; reset(); }
    if (!evo) { heroK = 1; partyK = 1; return; }
    if (ab2Cd > 0) { ab2Cd = Math.max(0, ab2Cd - dt); readyFor = 0; } else readyFor += dt;
    const live = on_() && anyFoe();
    if (evo === 'reaver') {
      if (clock - lastHit > TU.fury.idleAfter) fury = Math.max(ks('bloodrage') && live ? Math.min(fury, TU.fury.rageFloor) : 0, fury - TU.fury.drain * dt);
      if (stopCd > 0) stopCd -= dt;
      if (fury >= TU.fury.stopAt && stopCd <= 0 && live) { stopT = TU.fury.stopT; stopCd = TU.fury.stopCd; ST.stops++; }
      if (stopT > 0) { stopT -= dt; const h = hero(); if (h && h.us) { if (h.us.stun) h.us.stun.t = 0; if (h.us.root) h.us.root.t = 0; } }
    } else if (evo === 'warden') {
      if (!live && bulwark > 0) bulwark = Math.max(0, bulwark - TU.bulwark.drainOut * dt);
    } else if (evo === 'trapper' && live) trapTick(dt);
    else if (evo === 'warlock' && live) hexTick();
    else if (evo === 'priest' && sancUntil > clock && live) {
      sancBeat += dt;
      if (sancBeat >= 1) {
        sancBeat -= 1;
        const p = P() * str, heal = TU.sanctuary.regen * p;
        for (const u of combatUnits()) {
          if (!u.live || u.down) continue;
          const got = cbHealUnit(u, heal, null); ST.sanctHeal += got;
          const over = heal * (u.healIn || 1) - got;
          if (over > 0) ST.sanctShield += cbShield(u, over, TU.sanctuary.shieldCap);
        }
        for (const f of foes()) if (alive(f)) cbDamageFoe(f, TU.sanctuary.smite * p, 0, 'magic', 'holy', ST_AB);
      }
    }
    readK();
    if (live && ab2Cd <= 0 && autoOn() && autoUnlocked() && readyFor >= cdMax() * TU.ab2AutoWait && autoWants()) castAb2({ auto: true });
  });

  // ---------------- Next Up (3.1): the Proving is open, or the choice waits (55-goals loads before this file) ----------------
  registerGoal({
    id: 'proving', sys: 'class', prio: 2, cap: 1,
    label: () => (evoChoice() ? 'Choose your path' : provingInfo() && provingInfo().prove ? 'Prove your path: take the Proving' : 'Take the Proving'),
    pct: () => { const p = typeof provingInfo === 'function' ? provingInfo() : null; return p && (p.open || p.choice) ? 1 : 0; },
    go: () => ({ tab: 'party', fn: () => { if (typeof partySheet === 'object' && partySheet && partySheet.openHero) partySheet.openHero(); } }),
    icon: { ic: ['orb', '#F2C14E'] }
  });

  // ---------------- titles (classes-2 D5): c_<evo>, earned once proven ----------------
  if (typeof codexTitles === 'function') {
    const base = codexTitles;
    codexTitles = () => base().concat(Object.keys(EVO_DEFS).map(e => ({ id: 'c_' + e, n: EVO_DEFS[e].title.replace(/^the /, 'The '), src: `The ${EVO_DEFS[e].name}'s Proving`, got: !!(S.cls && S.cls.proven && S.cls.proven[e]) })));
  }
}
