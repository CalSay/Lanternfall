// 59h-bosses: the boss kit interpreter (Core 2.0 slice S6-C; docs/design/combat-2.md 4). Every boss is one data row
// in BOSS_KITS (21g-data-bosses.js) read by one scheduler: phases at HP shares (a 1.5 s `hard` roar clears the
// warning showing; the boss is never invulnerable), each mechanic on its own cadence, every answer warning through
// 59g's one-at-a-time queue (a `line`, `hard` or `dive` runs beside it), the region bosses (the Fenmother, Silas),
// the Deep Elders' depth rules (4.4), adds, and the signature drop event.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Exposed names:
//   kitOf(f) -> the BOSS_KITS row a boss uses (or null: 59b's own mechanics run)
//   kitStart(f) -> bool (59b bossStart hands a boss here), kitTick(f, dt) (59b onEnemyTick for a kit boss)
//   KIT_STATS counters (casts by kind, phases, adds)
//   KIT_FX[id](f, v, mech) what a cast does when it lands (venomAll, curseLow, curseTop, healSelf, smother, squall,
//                          bind, coils, shell, reefWall, oil, none)
// Runtime on the boss (never saved): kit, ph (phase), kt (timers per mechanic), kat (one-shots done), physX, shellT.
// Events: phase { foe, ph }, bossSig { foe, sig, heart } (on the kill: the signature buff item id, or the
//   heart-light colour of a Hollow boss; owner D2: no buff item from the Hollow).

var kitOf, kitStart, kitTick, KIT_STATS, KIT_FX;

{
  KIT_STATS = { starts: 0, phases: 0, adds: 0, casts: {}, landed: {} };
  const alive = f => f && !f.dead && f.hp > 0 && !f.gone;
  const units = () => combatUnits();
  const upUnits = () => units().filter(u => u.live && !u.down);
  const PH_EV = { foe: null, ph: 1 }, SIG_EV = { foe: null, sig: null, heart: null };

  // Which kit: a region boss by its zone, else its foe type's (a Deep Elder too).
  kitOf = f => {
    if (!f || !f.boss || typeof BOSS_KITS !== 'object') return null;
    if (f.kit) return f.kit;
    if (!f.deep && typeof isRegionBoss === 'function' && isRegionBoss(f.z)) {
      const r = typeof regionIdx === 'function' ? regionIdx(f.z) : 0;
      const id = r === 0 ? 'fenmother' : r === 1 ? 'silas' : null;
      if (id && BOSS_KITS[id]) return BOSS_KITS[id];
    }
    return BOSS_KITS[f.type] || null;
  };
  // A Deep Elder from floor 20 has a third phase with Snuff the Lamp; from floor 40 every mechanic comes 15% sooner.
  function mechList(f, kit) {
    const list = kit.mech.slice();
    let phases = kit.phases.slice();
    if (f.deep && f.floor >= BOSS_DEEP.snuffFrom) {
      if (phases.length < 2) phases = phases.concat([BOSS_DEEP.phase3]);
      list.push(Object.assign({}, BOSS_DEEP.snuff, { ph: phases.length + 1 }));
    }
    return { list, phases };
  }
  kitStart = f => {
    const kit = kitOf(f);
    if (!kit) return false;
    const m = mechList(f, kit);
    f.kit = kit; f.kitM = m.list; f.kitP = m.phases; f.ph = 1; f.kat = {}; f.physX = 1; f.shellT = 0; f.shellH = 0;
    f.kt = m.list.map(x => x.first != null ? x.first : 6);
    f.name = f.deep ? 'Deep ' + kit.name.replace(/^The /, '') : kit.name;
    if (kit.atk && kit.atk !== 1) f.atk *= kit.atk;
    KIT_STATS.starts++;
    return true;
  };
  const fast = f => (f.deep && f.floor >= BOSS_DEEP.fastFrom ? BOSS_DEEP.fast : 1);

  kitTick = (f, dt) => {
    // phases (each later phase adds one mechanic; a 1.5 s roar clears the warning showing)
    const P = f.kitP;
    if (f.ph <= P.length && f.hp <= f.max * P[f.ph - 1]) {
      f.ph++;
      KIT_STATS.phases++;
      const w = typeof actWarning === 'function' ? actWarning() : null;
      if (w && w.foe === f && w.kind !== 'hard') w.left = Math.min(w.left, 0.001), w.res = w.res || 'phase';
      actWarn({ kind: 'hard', id: 'roar', name: BOSS_COPY.roar, foe: f, dur: 1.5, passive: true });
      PH_EV.foe = f; PH_EV.ph = f.ph; emit('phase', PH_EV);
      // the new phase's mechanics start a little later
      for (let i = 0; i < f.kitM.length; i++) if (f.kitM[i].ph === f.ph && f.kitM[i].every) f.kt[i] = Math.max(f.kt[i], 1.5 + (f.kitM[i].first || 3));
    }
    // Shell Up (the crab): 10% damage, regains HP
    if (f.shellT > 0) { f.shellT -= dt; f.hp = Math.min(f.max, f.hp + f.max * 0.02 * dt); if (f.shellT <= 0) f.physX = 1; }
    if (f.wallT > 0) { f.wallT -= dt; if (f.wallT <= 0) f.physX = 1; }
    const M = f.kitM;
    for (let i = 0; i < M.length; i++) {
      const x = M[i];
      if (x.ph > f.ph) continue;
      // one-shots at an HP share (the Split, Shell Up)
      if (x.at != null) {
        if (!f.kat[x.id] && f.hp <= f.max * x.at) { f.kat[x.id] = 1; request(f, x, i); }
        continue;
      }
      f.kt[i] -= dt;
      if (f.kt[i] <= 0) { f.kt[i] = x.every * fast(f) + (x.wind || 1.5); request(f, x, i); }
    }
    return false;   // the boss swings between its mechanics (59g actBusy stops it while it winds up or casts)
  };

  // ---------------- a mechanic becomes a warning ----------------
  const PASSIVE = { line: 1, hard: 1, dive: 1 };
  function request(f, x, i) {
    const t = x.tele;
    KIT_STATS.casts[t] = (KIT_STATS.casts[t] || 0) + 1;
    const spec = { kind: t, id: x.id, name: x.name, foe: f, dur: x.wind, x: x.x || 1, src: 'kit', passive: !!PASSIVE[t], hint: BOSS_COPY.first[t] };
    if (t === 'heavy') { const u = f.tgt >= 0 ? units()[f.tgt] : null; spec.unit = u && u.live && !u.down ? u.i : -1; }
    if (t === 'zone' || t === 'slam') spec.slots = pickSlots(f, x);
    if (t === 'dive') { const u = backUnit(); if (!u) return; spec.unit = u.i; }
    spec.land = (w, mult) => landMech(f, x, w, mult);
    spec.interrupted = () => { if (x.every) f.kt[i] = x.every * fast(f); };
    actWarn(spec);
  }
  // Which slots a zone strikes: occupied columns, the Back and Middle first for a burrow; a slam is the Front.
  function pickSlots(f, x) {
    const cols = [];
    for (const u of upUnits()) if (!cols.includes(u.col)) cols.push(u.col);
    if (!cols.length) return 0;
    if (x.tele === 'slam') return 1 << Math.max(...cols);
    const n = Math.min(cols.length, f.ph >= 2 && x.slots2 ? x.slots2 : x.slots || 1);
    cols.sort((a, b) => x.back ? a - b : Math.random() - 0.5);
    let m = 0; for (let k = 0; k < n; k++) m |= 1 << cols[k];
    return m;
  }
  function backUnit() { let b = null; for (const u of upUnits()) if (!b || u.col < b.col || (u.col === b.col && u.hp / u.maxHp < b.hp / b.maxHp)) b = u; return b && b.col < 2 ? b : null; }
  function lowUnit() { let b = null; for (const u of upUnits()) if (!b || u.hp / u.maxHp < b.hp / b.maxHp) b = u; return b; }
  function topUnit() { let b = null; for (const u of upUnits()) if (!b || (u.dmg || 0) > (b.dmg || 0)) b = u; return b; }
  const atkOf = f => (typeof cbFoeAtk === 'function' ? cbFoeAtk(f) : f.atk);
  function applyTo(u, a) { if (a && u && !u.down && typeof stUnitApply === 'function') stUnitApply(u, a[0], a[1], { dur: a[2] }); }

  function landMech(f, x, w, mult) {
    if (!alive(f)) return;
    const t = x.tele, a = atkOf(f) * (x.x || 1) * (mult || 1);
    KIT_STATS.landed[t] = (KIT_STATS.landed[t] || 0) + 1;
    if (t === 'heavy') {
      let u = w.unit >= 0 ? units()[w.unit] : null;
      if (!u || !u.live || u.down) { const g = f.tgt >= 0 ? units()[f.tgt] : null; u = g && g.live && !g.down ? g : lowUnit(); }
      if (u) cbHitUnit(u, a, 'heavy', f);
    } else if (t === 'zone' || t === 'slam') {
      for (const u of upUnits()) if (w.slots & (1 << u.col)) { cbHitUnit(u, a, t, f); applyTo(u, x.apply); }
    } else if (t === 'line') {
      if (x.x > 0) for (const u of upUnits()) { cbHitUnit(u, a, 'line', f); applyTo(u, x.apply); }
    } else if (t === 'dive') {
      const u = w.unit >= 0 ? units()[w.unit] : null;
      if (u && u.live && !u.down) { f.diveU = u.i; f.diveT = x.secs || 5; f.diveX = x.x || 2; f.first = 1; f.swing = Math.min(f.swing, 0.3); }
    }
    if (x.fx && KIT_FX[x.fx[0]]) KIT_FX[x.fx[0]](f, x.fx[1], x);
    if (x.adds) spawnAdds(f, x.adds[0] === 'self' ? f.type : x.adds[0], x.adds[1], x.adds[2]);
  }

  // ---------------- what a cast does ----------------
  KIT_FX = {
    none: () => {},
    venomAll: (f, n) => { for (const u of upUnits()) stUnitApply(u, 'venom', n, { dur: 8 }); },
    curseLow: (f, s) => { const u = lowUnit(); if (u) stUnitApply(u, 'curse', 1, { dur: s }); },
    curseTop: (f, s) => { const u = topUnit(); if (u) stUnitApply(u, 'curse', 1, { dur: s }); },
    healSelf: (f, v) => { f.hp = Math.min(f.max, f.hp + f.max * v * (typeof stHealX === 'function' ? stHealX(f) : 1)); },
    // the Fenmother's Smother: every timed buff on the party ends (Keen, the Wall's pause) and everyone is Marked 5 s
    smother: (f, s) => { for (const u of upUnits()) { u.keenT = 0; u.drT = 0; stUnitApply(u, 'mark', 1, { dur: s, v: 0.2 }); } },
    // Squall: strips every shield; each member's next swing waits 1 s
    squall: (f, s) => { for (const u of upUnits()) { u.sh = 0; u.swing = (u.swing || 0) + s; } },
    bind: (f, s) => { let n = 0; for (const u of upUnits()) if (n < 2 && u.col < 2) { stUnitApply(u, 'stun', 1, { dur: s }); n++; } },
    coils: (f, x) => { for (const u of upUnits()) if (typeof stUnitStunned === 'function' && stUnitStunned(u)) cbHitUnit(u, atkOf(f) * x, 'sig', f); },
    shell: (f, s) => { f.shellT = s; f.physX = 0.1; },
    reefWall: (f, s) => { f.wallT = s; f.physX = 0.3; },
    oil: (f, s) => { try { const r = typeof DW === 'object' && DW.run && DW.run(); if (r) r.oil = Math.max(0, r.oil - s); } catch (e) {} }
  };

  // Adds stand in front of the boss (up to 4 alive; the list holds 12). They pay nothing (today's rule).
  function spawnAdds(f, type, n, share) {
    const ti = TYPES.findIndex(x => x.key === type);
    const k = ti >= 0 ? type : f.type, T0 = TYPES[ti >= 0 ? ti : Math.max(0, TYPES.findIndex(x => x.key === f.type))];
    const b = FOE_BEH[k] || FOE_BEH.slime, list = combatFoes();
    let live = 0; for (const o of list) if (o.adds && alive(o)) live++;
    for (let i = 0; i < n && list.length < 12 && live < 4 + (n > 4 ? n - 4 : 0); i++, live++) {
      const hp = f.max * share;
      const a = {
        key: k + zoneCycle(f.z), type: k, rows: SPR[k], pal: shiftPal(T0.pal, zoneHue(f.z)), boss: false, hp, max: hp,
        name: T0.name, gold: 0, xp: 0, hit: 0, dead: 0, born: 0, ti: Math.max(0, ti), row: b.row, ranged: !!b.ranged, armoured: !!b.armoured,
        atk: f.atk / COMBAT_TUNE.bossAtk * b.atk * (b.size === 'swarm' ? 0.4 : 1), spd: COMBAT_TUNE.spd * b.spd, swing: 1 + Math.random(), th: new Float64Array(4), tgt: -1, forceT: 0, forceU: -1,
        stunT: 0, slowT: 0, slowV: 0, knockT: 0, burnT: 0, burnDps: 0, markT: 0, focusT: 0, vulnT: 0, bx: 1, elite: false,
        bt: 0, b2: 0, diveT: 0, diveU: -1, diveX: 1, chanT: 0, hits: 0, again: true, first: 0, z: f.z, adds: true, gone: false, split: false,
        dt: b.dt || 'phys', chillT: 0, rootT: 0, rxT: 0, mkV: 0, stag: 0, ss: null, blight: false, sz: b.size || 'normal', tr: null, share: 1,
        deep: f.deep, floor: f.floor
      };
      for (let j = 0; j < 4; j++) a.th[j] = f.th[j] * 0.5;
      list.push(a);
      KIT_STATS.adds++;
    }
  }
  // A kit boss takes physical x physX (Shell Up, Reef Wall); nothing is immune (core-2 2.3).
  on('foeDown', p => {
    const f = p && p.mob;
    if (!f || !f.boss || !f.kit) return;
    SIG_EV.foe = f; SIG_EV.sig = f.kit.sig || null; SIG_EV.heart = f.kit.heart || null;
    emit('bossSig', SIG_EV);
  });
}
