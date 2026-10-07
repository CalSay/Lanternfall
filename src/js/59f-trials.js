// 59f-trials: the solo fight runner and the three Provings (Classes 2.0 slice S3; classes-2.md 3.2).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Data: CLASS_TRIALS (24-data-classes.js). The Proving's state and what a pass does: 55-classes.js.
//
// The runner is reusable (heroes-2.md 1.4: HER's "the Stand" runs on it with a second unit): a fight on the
// normal party-combat loop (59-combat), with its own arena (50-sim `arena`, like the Deepwell's), its own
// field (trialField(): only the units it names; the Lanternbearer always), and a template that spawns the
// foes, runs the twist each tick and decides the pass. Free and repeatable; the farm pauses while it runs
// and resumes after (no gold, XP or kills are paid; the field and the zone are untouched).
//
// Fixed strength (3.2): foe health is set from a reference Lanternbearer who just beat the Fenmother, not from
// the player: trialRefDps(base) = the reference party's damage at zone TRIAL_TUNE.refZone (a pack in
// PACE.farmSecs) x the base class's share of it. So the Proving gets easier as you grow. Foe hits are a share of
// your own health, so the fight stays a fight at any power (idle passes from about 1.25x the reference).
//
// Templates (TRIAL_TPL; heroes-2 1.4 names the same three, plus keep and duel for HER):
//   hold  (Warrior)     packs cross; a foe you have not hit (or taunted) for `slip` s walks past you and hits
//                       the lamp behind you; the last pack's lead is a boss with heavy wind-ups. Pass: the lamp
//                       is lit and you stand at the end (or every pack is down).
//   hunt  (Ranger)      a fleeing quarry and its screen; it stops at 3 lamps (takes x1.5 for 2 s). Pass: it
//                       falls before it escapes.
//   wave  (Lanternmage) three waves; spore caps curse you (no healing, a slow drain), your lamp heals you while
//                       you are not cursed, wraiths heal each other (59b). Pass: every wave down in time.
//
// API: trialStart(id, opts) -> bool   id: a CLASS_TRIALS key (or any id with opts.def); opts: { kind: 'proving'
//        | 'stand' | ..., units: [heroId] (default none: solo), def: a trial row (the Stand's), ref: foe health x }
//      trialEnd(won, reason) -> the record | null; trialLive() -> the run | null (read only);
//      trialInfo() -> { id, name, tpl, kind, t, secs, left, pct, lamp, lampMax, wave, waves, goal } | null;
//      trialField() -> [heroIds] while a run is live (59-combat fieldIds), else null; trialRefDps(base)
// Events: trialStart { id, kind }, trialEnd { id, kind, won, pct, reason, secs }. Runtime only: nothing saved.

var TRIAL_TUNE, TRIAL_ARENA, TRIAL_TPL, TRIAL_TURN, trialStart, trialEnd, trialLive, trialInfo, trialField, trialRefDps;

{
  const T = TRIAL_TUNE = {
    refZone: 35,                                      // the Fenmother's zone
    share: { warrior: 0.1, ranger: 0.5, mage: 0.2 },  // the base class's share of its party's damage at the reference
    hold: { foeSecs: 10, bossSecs: 35, hitPct: 0.03, bossHitPct: 0.05, lampHit: 5.8 },
    hunt: { quarrySecs: 52, markX: 1.25, screenSecs: 1.5, hitPct: 0.02, stops: [9, 20, 31], stopX: 1.5 },
    wave: { secs: { bat: 4.2, spore: 8.4, wraith: 14 }, hitPct: 0.008, curseEvery: 4, curseT: 3, drain: 0.015, lampHeal: 0.03 },
    // turn fights (owner, 2026-10-02): foes one at a time at refZone's reference (59k turnFoeSetup), HP in Attacks of
    // that reference hero (hpA). No clock: limits count turns, so the time you take to choose never counts.
    turn: {
      hold: { foes: 4, hpA: 4, bossHpA: 12, lampHit: 14, turns: 40 },
      hunt: { hpA: 16, escape: 12, stops: [3, 6, 9], stopX: 1.5 },
      wave: { list: [['bat', 4, 0], ['spore', 5, 0], ['wraith', 7, 'vampiric']], turns: 26, curseT: 2, drain: 0.05, lampHeal: 0.06 }
    }
  };
  const alive = f => f && !f.dead && f.hp > 0 && !f.gone;
  const foes = () => (typeof combatFoes === 'function' ? combatFoes() : []);
  const hero = () => { const u = typeof combatUnits === 'function' ? combatUnits()[0] : null; return u && u.live ? u : null; };
  const cbT = () => (typeof cbClock === 'function' ? cbClock() : 0);
  trialRefDps = base => mobHp(T.refZone) * COMBAT_TUNE.packHp / PACE.farmSecs * (T.share[base] || 0.2);

  let run = null;
  trialLive = () => run;
  trialField = () => (run ? run.units : null);

  // A foe of the given type at the reference zone's look; health in seconds of the reference damage.
  function foe(type, secs, o) {
    const ti = Math.max(0, TYPES.findIndex(x => x.key === type)), t = TYPES[ti], z = T.refZone;
    const hp = Math.max(1, run.ref * secs * run.refDps);
    return Object.assign({
      key: type + zoneCycle(z), type, rows: SPR[type], pal: shiftPal(t.pal, zoneHue(z)), boss: false, champ: false,
      hp, max: hp, name: t.name, gold: 0, xp: 0, hit: 0, dead: 0, born: 0, trial: run.id
    }, o || {});
  }
  const pack = list => { const lead = list.find(m => m.boss) || list[0]; lead.pack = list; return lead; };

  // ---------------- templates ----------------
  TRIAL_TPL = {
    hold: {
      init(r) { r.lamp = r.lampMax = r.def.lamp || 100; r.packs = 0; },
      spawn(r) {
        const d = r.def, n = d.packs || 4;
        if (r.packs >= n) return null;
        r.packs++;
        const ty = d.types || ['bones', 'beetle'], last = r.packs === n, list = [];
        for (let i = 0; i < 3; i++) list.push(foe(ty[(i + r.packs) % ty.length], T.hold.foeSecs));
        if (last) list[0] = foe('beetle', T.hold.bossSecs, { boss: true, name: 'Bridge Beetle' });
        return pack(list);
      },
      hitPct: f => (f.boss ? T.hold.bossHitPct : T.hold.hitPct),
      tick(r, dt) {
        const now = cbT(), slip = r.def.slip || 4;
        for (const f of foes()) {
          if (!alive(f) || f.boss) continue;
          const held = now - Math.max(f.hHit || 0, f.tIn || 0) < slip || (f.forceT > 0 && f.forceU === 0);
          f.slip = held ? 0 : 1;
          if (!held) { f.knockT = Math.max(f.knockT || 0, 0.25); r.lamp -= T.hold.lampHit * dt; }
        }
        if (r.lamp <= 0) { r.lamp = 0; return 'lamp'; }
        if (r.t >= r.secs) return 'won';
        return null;
      },
      cleared(r) { return r.packs >= (r.def.packs || 4) ? 'won' : null; },
      pct: r => Math.round(100 * Math.min(1, r.t / r.secs) * (r.lamp > 0 ? 1 : 0.5)),
      goal: r => `Keep the lamp lit: ${Math.ceil(r.lamp)} of ${r.lampMax}`
    },
    hunt: {
      init(r) { r.quarry = null; r.stop = -1; },
      spawn(r) {
        if (r.quarry) return null;
        const d = r.def, list = [];
        r.quarry = foe(d.quarry || 'wraith', T.hunt.quarrySecs * T.hunt.markX, { champ: true, name: "The Fenmother's Herald", quarry: 1 });
        list.push(r.quarry);
        for (let i = 0; i < (d.screenN || 3); i++) list.push(foe(d.screen || 'bat', T.hunt.screenSecs));
        return pack(list);
      },
      hitPct: f => (f.quarry ? 0 : T.hunt.hitPct),
      tick(r, dt) {
        const q = r.quarry;
        if (q && !alive(q) && q.th) return 'won';
        if (q && alive(q)) {
          q.bt = 0; q.chanT = 0;   // the herald flees: it never stops to heal
          for (let i = 0; i < T.hunt.stops.length; i++) {
            const at = T.hunt.stops[i];
            if (r.t >= at && r.stop < i) { r.stop = i; q.vulnT = r.def.stopT || 2; emit('trialStop', { i }); }
          }
        }
        if (r.t >= r.secs) return 'escaped';
        return null;
      },
      cleared: () => 'won',
      pct: r => (r.quarry ? Math.round(100 * Math.max(0, Math.min(1, 1 - r.quarry.hp / r.quarry.max))) : 0),
      goal: r => (r.quarry && alive(r.quarry) && r.quarry.vulnT > 0 ? 'It stopped at a lamp. Hit it now!' : 'Bring down the herald before it escapes')
    },
    wave: {
      init(r) { r.wave = 0; r.waves = (r.def.waves || []).length; r.curseT = 0; },
      spawn(r) {
        const w = (r.def.waves || [])[r.wave]; if (!w) return null;
        r.wave++;
        const [type, n] = w, list = [];
        for (let i = 0; i < Math.min(6, n); i++) list.push(foe(type, T.wave.secs[type] || 2));
        return pack(list);
      },
      hitPct: () => T.wave.hitPct,
      tick(r, dt) {
        const h = hero(); if (!h || h.down) return null;
        let spores = 0; for (const f of foes()) if (alive(f) && f.type === 'spore') spores++;
        r.curseT += dt;
        if (spores && r.curseT >= T.wave.curseEvery) { r.curseT = 0; stUnitApply(h, 'curse', 1, { dur: T.wave.curseT }); }
        if (stUnitNoHeal(h)) cbHitUnit(h, h.maxHp * T.wave.drain * dt, 'poison', null);
        else if (h.hp < h.maxHp) cbHealUnit(h, h.maxHp * T.wave.lampHeal * dt, null);
        if (r.t >= r.secs) return 'time';
        return null;
      },
      cleared(r) { return r.wave >= r.waves ? 'won' : null; },
      pct: r => Math.round(100 * (r.wave - (foes().some(alive) ? 1 : 0)) / Math.max(1, r.waves)),
      goal: r => `Wave ${Math.max(1, r.wave)} of ${r.waves}`
    }
  };

  // ---------------- the same three in turns ----------------
  // One foe at a time; 'turn' and 'foeContact' (59k) drive the twists. Info adds timeTxt (turns left, or '').
  const TT = T.turn;
  function tfoe(type, hpA, o) {
    o = o || {};
    const f = foe(type, 1, o.f), b = typeof FOE_BEH === 'object' ? FOE_BEH[type] : null;
    f.ranged = !!(b && b.ranged); f.armoured = !!(b && b.armoured);
    turnFoeSetup(f, T.refZone, { elite: !!o.trait, trait: o.trait || '', set: f.boss ? type : '', hpA });
    f.hp *= run.ref; f.max *= run.ref; f.gold = 0; f.xp = 0;
    return f;
  }
  const liveFoe = () => foes().find(alive) || null;
  TRIAL_TURN = {
    hold: {
      init(r) { r.lamp = r.lampMax = r.def.lamp || 100; r.n = 0; r.total = TT.hold.foes + 1; r.heroT = 0; },
      spawn(r) {
        if (r.n >= r.total) return null;
        r.n++;
        const ty = r.def.types || ['bones', 'beetle'];
        if (r.n === r.total) return tfoe('beetle', TT.hold.bossHpA, { f: { boss: true, name: 'Bridge Beetle' } });
        return tfoe(ty[r.n % ty.length], TT.hold.hpA);
      },
      turn(r, who) { if (who === 'hero') r.heroT++; },
      contact(r, res) { if (res === 'hit') { r.lamp = Math.max(0, r.lamp - TT.hold.lampHit); emit('trialLamp', { lamp: r.lamp }); } },
      tick(r) { return r.lamp <= 0 ? 'lamp' : r.heroT > TT.hold.turns ? 'time' : null; },
      cleared(r) { return r.n >= r.total ? 'won' : null; },
      pct: r => { const f = liveFoe(), part = f ? 1 - f.hp / f.max : 1; return Math.round(100 * Math.max(0, r.n - 1 + part) / r.total * (r.lamp > 0 ? 1 : 0.5)); },
      goal: r => `Keep the lamp lit: ${Math.ceil(r.lamp)} of ${r.lampMax}. Hits you take reach it.`,
      timeTxt: r => `Foe ${Math.max(1, r.n)}/${r.total}, ${Math.max(0, TT.hold.turns - r.heroT)} turns`
    },
    hunt: {
      init(r) { r.quarry = null; r.foeT = 0; },
      spawn(r) {
        if (r.quarry) return null;
        r.quarry = tfoe(r.def.quarry || 'wraith', TT.hunt.hpA, { f: { champ: true, name: "The Fenmother's Herald", quarry: 1 } });
        return r.quarry;
      },
      turn(r, who) {
        const q = r.quarry; if (who !== 'foe' || !q || !alive(q)) return;
        r.foeT++;
        const stop = TT.hunt.stops.indexOf(r.foeT);
        q.turnX = stop >= 0 ? TT.hunt.stopX : 1;   // at a lamp it takes more until its next turn (59k foeX)
        if (stop >= 0) emit('trialStop', { i: stop });
      },
      tick(r) {
        const q = r.quarry;
        if (q && !alive(q)) return 'won';
        return r.foeT > TT.hunt.escape ? 'escaped' : null;
      },
      cleared: () => 'won',
      pct: r => (r.quarry ? Math.round(100 * Math.max(0, Math.min(1, 1 - r.quarry.hp / r.quarry.max))) : 0),
      goal: r => (r.quarry && alive(r.quarry) && r.quarry.turnX > 1 ? 'It stopped at a lamp. Hit it now!' : 'Bring down the herald before it escapes'),
      timeTxt: r => `${Math.max(0, TT.hunt.escape - r.foeT)} turns`
    },
    wave: {
      init(r) { r.wave = 0; r.waves = TT.wave.list.length; r.cursed = 0; r.heroT = 0; },
      spawn(r) {
        const w = TT.wave.list[r.wave]; if (!w) return null;
        r.wave++;
        return tfoe(w[0], w[1], { trait: w[2] || '' });
      },
      // a spore cap's turn curses you: no healing and a drain for 2 of your turns; else your lamp heals you
      turn(r, who) {
        const h = hero(); if (!h || h.down) return;
        if (who === 'foe') { const f = liveFoe(); if (f && f.type === 'spore') { r.cursed = TT.wave.curseT; if (typeof stUnitApply === 'function') stUnitApply(h, 'curse', 1, { dur: 3 }); } return; }
        r.heroT++;
        if (r.cursed > 0) { r.cursed--; cbTurnHitHero(h.maxHp * TT.wave.drain, false, 'dot'); }
        else if (h.hp < h.maxHp) { const d = Math.min(h.maxHp - h.hp, h.maxHp * TT.wave.lampHeal); h.hp += d; emit('unitHeal', { key: h.key, amount: d }); }
      },
      tick(r) { return r.heroT > TT.wave.turns ? 'time' : null; },
      cleared(r) { return r.wave >= r.waves ? 'won' : null; },
      pct: r => Math.round(100 * (r.wave - (foes().some(alive) ? 1 : 0)) / Math.max(1, r.waves)),
      goal: r => `Wave ${Math.max(1, r.wave)} of ${r.waves}` + (r.cursed > 0 ? ': cursed, no healing' : ''),
      timeTxt: r => `${Math.max(0, TT.wave.turns - r.heroT)} turns`
    }
  };
  on('turn', p => { if (run && run.turn && run.tpl.turn && p) run.tpl.turn(run, p.who); });
  on('foeContact', p => { if (run && run.turn && run.tpl.contact && p) run.tpl.contact(run, p.res); });

  // ---------------- the arena (50-sim calls it) ----------------
  TRIAL_ARENA = {
    spawn() {
      if (!run) return null;
      if (mob && mob.trial === run.id && !mob.dead) return mob;
      return run.tpl.spawn(run);
    },
    onKill() {
      if (!run) return;
      const r = run.tpl.cleared(run);
      if (r) run.pending = r;
    }
  };
  // Foe hits: a share of the hero's own health (set once the pack is adopted by 59-combat).
  on('packSpawn', p => {
    const list = p.foes, lead = list && list[0];
    if (!run || run.turn || !lead || lead.trial !== run.id) return;   // a turn fight's foes hit with their moves (59k)
    const h = hero(), hp = h ? h.maxHp : 1, now = cbT();
    for (const f of list) { if (f.trialAtk) continue; f.trialAtk = 1; f.atk = hp * run.tpl.hitPct(f); f.tIn = now; }
  });
  // Hold: Shield Wall taunts every foe (classes-2 1.2's ['taunt', 3]), and a heavy tap turns the foe that is
  // about to walk past (the one you left alone longest) back onto you. Auto-taps turn it for half as long.
  on('ability', ({ cls }) => {
    if (!run || cls !== 'warden' || run.def.tpl !== 'hold') return;
    const h = hero(); if (h && typeof cbTaunt === 'function') cbTaunt(h, foes().filter(alive), 3);
  });
  on('classTap', ({ kind, auto }) => {
    if (!run || run.def.tpl !== 'hold' || kind !== 'heavy') return;
    const h = hero(); if (!h || typeof cbTaunt !== 'function') return;
    let b = null, bt = Infinity;
    for (const f of foes()) { if (!alive(f) || f.boss) continue; const t = Math.max(f.hHit || 0, f.tIn || 0, f.forceT > 0 && f.forceU === 0 ? Infinity : 0); if (t < bt) { bt = t; b = f; } }
    if (b) cbTaunt(h, [b], auto ? 1.5 : 3);
  });
  on('wipe', p => { if (run && p && p.arena) run.pending = 'fell'; });
  on('awayBegin', () => { if (run) trialEnd(false, 'away'); });

  const retire = () => { if (mob && !mob.dead) { mob.hp = 0; mob.dead = 0.001; } };
  trialStart = (id, opts) => {
    const o = opts || {}, def = o.def || CLASS_TRIALS[id];
    if (run || !def || !TRIAL_TPL[def.tpl]) return false;
    if (typeof deepActive === 'function' && deepActive()) return false;
    if (!(typeof partyCombatOn === 'function' && partyCombatOn())) return false;
    const base = def.base || id, units = (o.units || []).slice(0, 2);
    // the hero fights in turns (59k): so does a Proving (one with a second unit keeps the real-time fight)
    const turn = !units.length && typeof turnArenaNow === 'function' && turnArenaNow() && !!TRIAL_TURN[def.tpl];
    run = { id, def, kind: o.kind || 'trial', turn, tpl: turn ? TRIAL_TURN[def.tpl] : TRIAL_TPL[def.tpl], t: 0, secs: def.secs || 60, units,
      act: S.activity || 'fight', ref: o.ref > 0 ? o.ref : 1, refDps: trialRefDps(base), pending: null };
    run.tpl.init(run);
    S.activity = 'fight'; fightBoss = false;
    retire();
    if (typeof cbRestore === 'function') cbRestore(true);
    arena = TRIAL_ARENA;
    emit('sceneReset');
    emit('trialStart', { id, kind: run.kind });
    spawn();
    return true;
  };
  trialEnd = (won, reason) => {
    if (!run) return null;
    const r = run, pct = won ? 100 : Math.max(0, Math.min(99, r.tpl.pct(r) || 0));
    const rec = { id: r.id, kind: r.kind, won: !!won, pct, reason: reason || (won ? 'won' : 'lost'), secs: Math.round(r.t), turn: !!r.turn };
    run = null;
    retire();
    if (typeof cbRestore === 'function') cbRestore(true);
    if (arena === TRIAL_ARENA) arena = null;
    fightBoss = false;
    S.activity = r.act === 'raid' && !(online.ready && online.canWrite) ? 'fight' : r.act;
    emit('sceneReset');
    if (S.activity === 'fight') spawn();
    emit('trialEnd', rec);
    emit('activity', { activity: S.activity });
    return rec;
  };
  const INFO = { id: '', name: '', tpl: '', kind: '', t: 0, secs: 0, left: 0, pct: 0, lamp: 0, lampMax: 0, wave: 0, waves: 0, goal: '', turn: false, timeTxt: '' };
  trialInfo = () => {
    if (!run) return null;
    const r = run;
    INFO.id = r.id; INFO.name = r.def.name || ''; INFO.tpl = r.def.tpl; INFO.kind = r.kind; INFO.t = r.t; INFO.secs = r.secs;
    INFO.left = Math.max(0, r.secs - r.t); INFO.pct = r.tpl.pct(r) || 0; INFO.lamp = r.lamp || 0; INFO.lampMax = r.lampMax || 0;
    INFO.wave = r.wave || 0; INFO.waves = r.waves || 0; INFO.goal = r.tpl.goal(r);
    INFO.turn = !!r.turn; INFO.timeTxt = r.turn && r.tpl.timeTxt ? r.tpl.timeTxt(r) : `${Math.ceil(INFO.left)}s`;
    return INFO;
  };

  onTick(dt => {
    if (!run) return;
    if (arena !== TRIAL_ARENA || target() !== 'mob') { trialEnd(false, 'left'); return; }
    run.t += dt;
    let res = run.pending || run.tpl.tick(run, dt);
    // Nothing on the field (between packs): the next one steps up at once.
    if (!res && !foes().some(alive) && !(mob && mob.trial === run.id && !mob.dead)) { const m = TRIAL_ARENA.spawn(); if (m) { mob = m; cbArena(m); } }
    if (!res) return;
    trialEnd(res === 'won', res);
  });
}
