// 59g-active: active combat (Core 2.0 slice S6-B; docs/design/combat-2.md 3, 7.2, 8.4). One answer warning at a
// time (the scheduler), parry, dodge (perfect dodge and Keen), cast bars and interrupts, the stagger bar, the
// Lanternbearer's Finisher (tap, or by itself at half strength), Reeling, the pack heavy of brutes and elites
// (owner D8), the active counters and the active boss reward, and the read-only snapshot cbState().
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Exposed names:
//   data    ACT_TUNE (knobs), ACT_STATS (counters for the sim and checks)
//   warn    actWarn(spec) -> bool   start an answer warning now, or queue it (one at a time, ACT_TUNE.gap s apart;
//                                   a queued one waits up to waitMax s, then is skipped once)
//             spec { kind: heavy | zone | slam | sig | heal | summon | line | hard | dive, foe, unit (index), slots
//                    (bitmask of party columns 1 back, 2 middle, 4 front), dur, x, name, id, passive, land(w, mult),
//                    miss(w, res) }   passive: a warning that never needs a tap (line, hard, dive): it runs beside
//                    the answer warning and lands on its own timer
//           actWarning() -> the showing answer warning (a kept object) or null; actBusy(f) -> f is winding up or casting
//   player  actTap() -> '' | 'finisher' | 'parry' | 'dodge' | 'interrupt' | 'early' (55-party classTap asks first:
//                       the tap priority of combat-2 3.1); actHold() -> auto-cast waits for a close Stagger (3.6)
//   stagger actStag(f, pts, src) (fills the bar; the stat and the Warden's +30% apply), actHeavy(f, src) (a heavy hit:
//           +5, at most 4 a second per unit); 59a and 59e keep adding to f.stag and the bar reads the difference
//   loop    actTick(dt) (59-combat combatTick, once a frame)
//   ui      cbState() -> one reused snapshot { tele, cast, stag, fin, phase, packN, ans, enrage, rxWin, elites }
// Runtime fields on foes (never saved): sb (the bar), sbIdle, stgT (Staggered seconds left), stgN (Staggers this
// fight), reelT (Reeling), cast { kind, id, name, left, dur } (a cast bar), keenT on units.
// Events: parry { foe, by, active }, dodge { foe, perfect, active }, interrupt { foe, kind, by, active },
//   stagger { foe, n }, finisher { key, fin, foe, dmg, auto }, activeKill { n }, and telegraphStart / telegraphResolve
//   (59b's shapes) so the stage flashes and rings every warning. Payloads are reused objects.
// Save: registerState('cb2', { v, haptic, left, seen, n }) (combat-2 8.4; Assist timing is parked, owner D5).

var ACT_TUNE, ACT_STATS, actWarn, actWarning, actBusy, actTap, actParry, actDodge, actAnswer, actHold, actStag, actHeavy, actTick, cbState, actSeen, actStagMax;

{
  const T = ACT_TUNE = {
    gap: 1.0, waitMax: 3,                                   // answer warnings >= 1 s apart; a later one waits up to 3 s
    parryWin: 0.8, heavyWind: 1.5, dodgeWind: 1.8, dodgeWin: 1.0, perfWin: 0.5, windMin: 1.2, castMin: 1.5,
    earlyX: 0.5,                                            // a heavy tapped before the window: half damage (kept)
    keen: 0.2, keenT: 3,                                    // perfect dodge: Keen, +20% damage for 3 s (bucket T)
    reelT: 2,                                               // parry: Reeling 2 s (does nothing, takes x1.5: 59-combat vulnT)
    stag: { boss: 100, elite: 60, heavy: 5, heavyRate: 4, parry: 25, intr: 15, perfect: 10, idle: 4, drain: 5,
      t: 5, eliteT: 3, x: 1.5, step: 0.25, stepMax: 2, statCap: 0.5 },
    fin: { autoAt: 2.5, eliteAutoAt: 1.5, autoEff: 0.5 },   // owner D6: the Finisher fires by itself at 50%
    hold: { at: 0.9, max: 1.5 },                            // auto-cast waits up to 1.5 s when a Stagger is at 90%+
    packHeavy: { from: 15, every: 12, x: 2.5 },             // owner D8: brutes and elites get a parry-able heavy
    reward: { answers: 3, xp: 0.5 }                         // 3.8: 3 of the player's own answers: +50% XP on that kill
  };
  const ST = ACT_STATS = { warns: 0, queued: 0, skipped: 0, parries: 0, early: 0, dodges: 0, perfect: 0, intr: 0, staggers: 0,
    fins: 0, finAuto: 0, finDmg: 0, packHeavy: 0, activeKills: 0, landed: 0, overlap: 0, minGap: 99, fill: {} };
  registerState('cb2', { v: 1, haptic: 1, left: 0, seen: {}, n: { parry: 0, dodge: 0, perfect: 0, intr: 0, fin: 0, act: 0 } });

  const alive = f => f && !f.dead && f.hp > 0 && !f.gone;
  const units = () => combatUnits();
  const foes = () => combatFoes();
  const bar = f => f && (f.boss || f.elite);
  let clock = 0;
  const N = () => (S.cb2 && S.cb2.n) || (S.cb2.n = { parry: 0, dodge: 0, perfect: 0, intr: 0, fin: 0, act: 0 });
  // S6-F: the Deepwell's active boons (57d DEEP_BOONS feet, breaker, coup, silence, lward), 0 outside a run
  const dboon = id => { try { const r = typeof deepActive === 'function' && deepActive() && DW.run(); return r && r.boons ? r.boons[id] || 0 : 0; } catch (e) { return 0; } };

  // ---------------- the warning showing (one answer at a time) ----------------
  const W = { on: false, kind: '', id: '', name: '', left: 0, dur: 0, win: 0, perf: 0, foe: null, unit: -1, target: null, slots: 0,
    x: 1, res: '', wait: 0, cast: false, src: '', land: null, miss: null, spec: null };
  let lastEnd = -9;
  const queue = [];
  const PASSIVE = [];   // passive warnings running beside W: { kind, left, dur, foe, land, spec }
  const START_EV = { kind: '', dur: 0, target: null, foe: null }, RES_EV = { kind: '', result: '', by: '', foe: null };
  const CAST = { heal: 1, summon: 1, sig: 1, hard: 1 };
  const DODGE = { zone: 1, slam: 1 };
  actWarning = () => (W.on ? W : null);
  actBusy = f => (W.on && W.foe === f) || !!(f && f.cast && f.cast.left > 0);
  // Parry window (59b's rule: Maren +0.3 s, the Deepwell's Quick Parry +0.4 s).
  const parryWin = () => (typeof ENEMY_TUNE === 'object' ? ENEMY_TUNE.parryWin : T.parryWin)
    + (units().some(u => u.live && u.id === 'maren') ? ENEMY_TUNE.marenWin : 0)
    + (typeof deepActive === 'function' && deepActive() && DW.run() && DW.run().boons && DW.run().boons.parry ? 0.4 : 0);
  // W1-C: the Deepwell's Quick Parry and Steady Feet boons reach the solo buttons (the wider windows are smaller than the party's)
  const soloParryWin = () => SOLO_TUNE.parryWin + (dboon('parry') ? 0.15 : 0);
  const soloDodgeWin = () => SOLO_TUNE.dodgeWin + (dboon('feet') ? 0.2 : 0);
  const heavyLead = () => (units().some(u => u.live && u.id === 'maren') ? ENEMY_TUNE.marenLead : 0);

  function start(spec) {
    const k = spec.kind;
    W.on = true; W.kind = k; W.id = spec.id || k; W.name = spec.name || ''; W.foe = spec.foe || null; W.unit = spec.unit == null ? -1 : spec.unit;
    const u = W.unit >= 0 ? units()[W.unit] : null;
    W.target = u ? u.key : null; W.slots = spec.slots || 0; W.x = spec.x || 1; W.res = ''; W.wait = 0; W.src = spec.src || '';
    W.cast = !!CAST[k]; W.land = spec.land || null; W.miss = spec.miss || null; W.spec = spec;
    const minD = W.cast ? T.castMin : T.windMin;
    W.dur = Math.max(minD, spec.dur || (k === 'heavy' ? T.heavyWind + heavyLead() : DODGE[k] ? T.dodgeWind : 2));
    W.left = W.dur;
    W.win = k === 'heavy' ? parryWin() : DODGE[k] ? T.dodgeWin + (dboon('feet') ? 0.3 : 0) : 0; W.perf = DODGE[k] ? T.perfWin + (dboon('feet') ? 0.2 : 0) : 0;
    // SOLO1: Parry and Dodge are buttons. A heavy takes either (Parry in the tight window, Dodge in the long one);
    // a slam or a ground zone takes Dodge only. W.win is the parry window on a heavy (the banner marks both).
    if (soloOn()) { W.win = k === 'heavy' ? soloParryWin() : 0; W.dwin = k === 'heavy' || DODGE[k] ? soloDodgeWin() : 0; W.perf = DODGE[k] ? T.perfWin : 0; }
    else W.dwin = 0;
    if (W.cast && W.foe) W.foe.cast = { kind: k, id: W.id, name: W.name, left: W.dur, dur: W.dur };
    ST.warns++;
    const g = clock - lastEnd; if (g < ST.minGap) ST.minGap = g;
    START_EV.kind = k; START_EV.dur = W.dur; START_EV.target = W.target; START_EV.foe = W.foe;
    emit('telegraphStart', START_EV);
    hint(W.kind, spec.hint);
  }
  function end(result, by) {
    if (!W.on) return;
    RES_EV.kind = W.kind; RES_EV.result = result; RES_EV.by = by || ''; RES_EV.foe = W.foe;
    if (W.foe && W.foe.cast) W.foe.cast = null;
    W.on = false; W.foe = null; W.target = null; W.land = null; W.miss = null; W.spec = null;
    lastEnd = clock;
    emit('telegraphResolve', RES_EV);
  }
  actWarn = spec => {
    if (!spec || !spec.kind) return false;
    if (spec.passive) {
      if (PASSIVE.length >= 4) return false;
      const d = Math.max(CAST[spec.kind] ? T.castMin : T.windMin, spec.dur || 2);
      PASSIVE.push({ kind: spec.kind, left: d, dur: d, foe: spec.foe || null, land: spec.land || null, spec });
      if (CAST[spec.kind] && spec.foe) spec.foe.cast = { kind: spec.kind, id: spec.id || spec.kind, name: spec.name || '', left: d, dur: d };
      if (spec.id !== 'roar') { START_EV.kind = spec.kind; START_EV.dur = d; START_EV.target = null; START_EV.foe = spec.foe || null; emit('telegraphStart', START_EV); }
      hint(spec.kind, spec.hint);
      return true;
    }
    if (!W.on && clock - lastEnd >= T.gap && !queue.length) { start(spec); return true; }
    if (queue.length >= 4) { ST.skipped++; return false; }
    queue.push({ spec, t: 0 }); ST.queued++;
    return true;
  };
  function hint(id, text) {
    if (!text || !S.cb2) return;
    const s = S.cb2.seen || (S.cb2.seen = {});
    if (s[id]) return;
    s[id] = 1;
    toast(text, 'raid', null, 'normal');
  }
  actSeen = hint;

  // What happens when a warning's wind-up or cast ends.
  function land() {
    const w = W, f = w.foe, res = w.res;
    if (f && !alive(f) && !w.spec.dead) { end('interrupt', 'kill'); return; }
    if (w.kind === 'heavy') {
      if (res === 'parry') { parried(f, 'tap', true); return; }
      if (typeof cbWallOn === 'function' && cbWallOn() && (w.target === 'hero' || bonus('ks:bastion') > 0)) { parried(f, 'wall', false); return; }
    }
    if (DODGE[w.kind] && (res === 'dodge' || res === 'perfect')) { if (w.miss) w.miss(w, res); end(res, 'tap'); return; }
    if (w.kind === 'heavy' && res === 'dodge' && soloOn()) { end('dodge', 'tap'); return; }   // SOLO1: a dodged heavy misses
    ST.landed++;
    const mult = (w.kind === 'heavy' && res === 'early' ? T.earlyX : 1) * (dboon('lward') ? 0.7 : 1);   // Lamplight Ward
    if (w.land) { try { w.land(w, mult); } catch (e) { console.error('[lanternfall] warning land failed', e); } }
    end(res === 'early' ? 'dodge' : w.cast ? (w.kind === 'heal' ? 'heal' : 'cast') : 'hit', '');
    if (f && alive(f) && f.swing < 0.5) f.swing = 0.5;
  }
  function parried(f, by, active) {
    ST.parries++; CB_STATS.parries++;
    end('parry', by);
    if (f && alive(f)) {
      // SOLO1 (owner): the parry staggers the foe at once for the counter's length; the counter lands inside it (59j)
      if (soloOn() && active) { stApply(f, 'stagger', 1, 0, 0, { dur: SOLO_TUNE.counterT }); f.swing = Math.max(f.swing, 0.3); actStag(f, T.stag.parry, 0); if (typeof soloCounter === 'function') soloCounter(f); }
      else { f.reelT = T.reelT; f.vulnT = Math.max(f.vulnT || 0, ENEMY_TUNE.vulnT); f.swing = Math.max(f.swing, 0.5); actStag(f, T.stag.parry, 0); }
    }
    if (active) { N().parry++; answered(); }
    PARRY_EV.foe = f; PARRY_EV.by = by; PARRY_EV.active = !!active; emit('parry', PARRY_EV);
  }
  const PARRY_EV = { foe: null, by: '', active: false }, DODGE_EV = { foe: null, perfect: false, active: true }, INT_EV = { foe: null, kind: '', by: '', active: false };
  // Interrupt the showing cast (a `hard` cast cannot be stopped; a boss's `sig` only by an ability or a stun).
  function interrupt(by, active) {
    const f = W.foe, k = W.kind;
    ST.intr++; CB_STATS.interrupts++;
    end('interrupt', by);
    if (f && alive(f) && bar(f)) actStag(f, T.stag.intr, 0);
    if (W.spec && W.spec.interrupted) W.spec.interrupted();
    if (active) { N().intr++; answered(); }
    INT_EV.foe = f; INT_EV.kind = k; INT_EV.by = by; INT_EV.active = !!active; emit('interrupt', INT_EV);
    return true;
  }
  function canInterrupt(by) {
    if (!W.on || !W.cast || W.kind === 'hard') return false;
    if (W.kind === 'sig') return by === 'ab' || by === 'stun' || by === 'bash';
    return true;
  }

  // ---------------- the tap (combat-2 3.1, priorities 1-4) ----------------
  actTap = () => {
    if (FIN.on && FIN.f && alive(FIN.f)) { fireFinisher(false); return 'finisher'; }
    if (W.on && W.foe && (alive(W.foe) || W.spec.dead)) {
      if (W.kind === 'heavy') {
        if (W.left <= W.win) { W.res = 'parry'; land(); return 'parry'; }
        if (!W.res) { W.res = 'early'; ST.early++; }
        return 'early';
      }
      if (DODGE[W.kind]) {
        if (W.res) return '';   // already stepped out: the tap is a class tap again
        if (W.left <= W.win) {
          W.res = W.left <= W.perf ? 'perfect' : 'dodge';
          ST.dodges++; CB_STATS.dodges++; N().dodge++;
          if (W.res === 'perfect') { ST.perfect++; N().perfect++; keenPatch(W.slots); if (W.foe && alive(W.foe) && bar(W.foe)) actStag(W.foe, T.stag.perfect, 0); }
          answered();
          DODGE_EV.foe = W.foe; DODGE_EV.perfect = W.res === 'perfect'; emit('dodge', DODGE_EV);
          return 'dodge';
        }
        W.wait = 0.4;   // "wait": the banner shows a small tick; the tap is a class tap
        return '';
      }
      if ((W.kind === 'heal' || W.kind === 'summon') && W.foe && !W.foe.boss && canInterrupt('tap')) return interrupt('tap', true) && 'interrupt';
    }
    // a pack healer's channel (the Marsh Wraith): the tap stops it
    for (const f of foes()) if (alive(f) && f.chanT > 0) { f.chanT = 0; f.bt = 0; ST.intr++; CB_STATS.interrupts++; N().intr++; INT_EV.foe = f; INT_EV.kind = 'heal'; INT_EV.by = 'tap'; INT_EV.active = true; emit('interrupt', INT_EV); return 'interrupt'; }
    // 59b's own wind-ups (bosses without a kit)
    if (typeof resolveParry === 'function' && resolveParry('tap')) return 'parry';
    return '';
  };
  // ---------------- SOLO1: the Parry, Dodge and Attack buttons ----------------
  // actParry(forgive) -> 'parry' | 'miss' | ''   '' = no heavy hit showing (the press still misses: 59j opens you up)
  // actDodge(forgive) -> 'dodge' | 'perfect' | 'early' | ''
  // actAnswer() -> 'finisher' | 'interrupt' | ''   what the Attack button does first (a Finisher, stop a heal or a summon)
  // forgive: the guide's first Parry / Dodge (the game paused on the warning): any press inside the wind-up counts.
  const heavyOn = () => W.on && W.kind === 'heavy' && W.foe && (alive(W.foe) || W.spec.dead);
  actParry = forgive => {
    if (heavyOn()) {
      if (W.res === 'dodge') return '';
      if (W.left <= W.win || forgive) { W.res = 'parry'; land(); return 'parry'; }
      return 'miss';
    }
    // 59b's own wind-ups (a boss without a kit)
    const t = typeof cbTelegraph === 'function' ? cbTelegraph() : null;
    if (t && t !== W && t.on && t.foe && alive(t.foe) && t.kind !== 'heal') {
      if (t.left <= soloParryWin() || forgive) { const f = t.foe; if (resolveParry('tap')) { if (typeof soloCounter === 'function') soloCounter(f); stApply(f, 'stagger', 1, 0, 0, { dur: SOLO_TUNE.counterT }); N().parry++; answered(); return 'parry'; } }
      return 'miss';
    }
    return '';
  };
  actDodge = forgive => {
    if (W.on && W.foe && (alive(W.foe) || W.spec.dead) && (W.kind === 'heavy' || DODGE[W.kind])) {
      if (W.res) return '';
      if (W.left <= (W.dwin || T.dodgeWin) || forgive) {
        W.res = W.kind !== 'heavy' && W.left <= W.perf ? 'perfect' : 'dodge';
        ST.dodges++; CB_STATS.dodges++; N().dodge++;
        if (W.res === 'perfect') { ST.perfect++; N().perfect++; keenPatch(W.slots); if (W.foe && alive(W.foe) && bar(W.foe)) actStag(W.foe, T.stag.perfect, 0); }
        answered();
        DODGE_EV.foe = W.foe; DODGE_EV.perfect = W.res === 'perfect'; emit('dodge', DODGE_EV);
        return W.res;
      }
      W.wait = 0.4;
      return 'early';
    }
    const t = typeof cbTelegraph === 'function' ? cbTelegraph() : null;
    if (t && t !== W && t.on && t.foe && alive(t.foe) && t.kind !== 'heal') {
      if (t.res) return '';
      if (t.left <= soloDodgeWin() || forgive) { t.res = 'dodge'; N().dodge++; answered(); DODGE_EV.foe = t.foe; DODGE_EV.perfect = false; emit('dodge', DODGE_EV); return 'dodge'; }
      return 'early';
    }
    return '';
  };
  actAnswer = () => {
    if (FIN.on && FIN.f && alive(FIN.f)) { fireFinisher(false); return 'finisher'; }
    if (W.on && W.foe && alive(W.foe) && (W.kind === 'heal' || W.kind === 'summon') && !W.foe.boss && canInterrupt('tap')) return interrupt('tap', true) && 'interrupt';
    for (const f of foes()) if (alive(f) && f.chanT > 0) { f.chanT = 0; f.bt = 0; ST.intr++; CB_STATS.interrupts++; N().intr++; INT_EV.foe = f; INT_EV.kind = 'heal'; INT_EV.by = 'tap'; INT_EV.active = true; emit('interrupt', INT_EV); return 'interrupt'; }
    return '';
  };

  // Keen on each member standing in the struck slots (proposal 8.2-11).
  function keenPatch(slots) {
    for (const u of units()) if (u.live && !u.down && (!slots || (slots & (1 << u.col)))) u.keenT = T.keenT;
  }
  // The player's own answers during a boss fight (3.8).
  let bossAns = 0, bossFoe = null;
  function answered() { if (bossFoe && alive(bossFoe)) bossAns++; }

  // Abilities: the Lanternbearer's ab1 / ab2 stop a cast on the foe (a boss `sig` included); stuns stop casts too.
  on('ability', p => { if (W.on && canInterrupt('ab')) { interrupt('ab', !(p && p.auto)); if (dboon('silence') && S.party) S.party.abilityCd *= 0.7; } });   // Silence: 30% back
  on('ability2', p => { if (W.on && canInterrupt('ab')) interrupt('ab', !(p && p.auto)); });
  // A hero signature tagged interrupt (none yet) or a stun (59a onFoeStun -> 59b -> here through stunned()).
  on('telegraphResolve', p => {
    // 59b's own wind-ups: a parry there fills the bar and counts like one here
    if (p === RES_EV || !p || !p.foe) return;
    if (p.result === 'parry') { if (bar(p.foe)) actStag(p.foe, T.stag.parry, 0); if (p.by === 'tap') { N().parry++; answered(); } }
    else if (p.result === 'interrupt' && p.by === 'tap') { N().intr++; answered(); }
  });
  on('unitAbility', p => { if (p && (p.id === 'aldric') && W.on) { if (W.kind === 'heavy' && W.foe && W.foe.boss) parried(W.foe, 'bash', false); else if (canInterrupt('bash')) interrupt('bash', false); } });
  const stunned = f => { if (W.on && W.foe === f && canInterrupt('stun')) interrupt('stun', false); if (f && f.cast && f.cast.kind !== 'hard' && f.cast.kind !== 'sig' && !(W.on && W.foe === f)) f.cast = null; };
  on('stunned', p => stunned(p && p.foe));
  // Shield Wall blocks the heavy hit on the hero (59b resolveParry('wall') for its own; here at land time).

  // ---------------- stagger (3.4) ----------------
  const stagMax = actStagMax = f => (f.boss ? T.stag.boss : T.stag.elite) * Math.min(T.stag.stepMax, 1 + T.stag.step * (f.stgN || 0));
  const stagX = () => { let x = typeof clsStagX === 'function' ? clsStagX() : 1; try { x *= 1 + Math.min(T.stag.statCap, (gear().stag || 0) / 100); } catch (e) {} return x * (dboon('breaker') ? 1.3 : 1); };
  actStag = (f, pts, src, why) => { if (!bar(f) || !alive(f) || f.stgT > 0 || !(pts > 0)) return; const v = pts * stagX(); f.stag = (f.stag || 0) + v; f.stagMine = (f.stagMine || 0) + v; ST.fill[why || 'other'] = (ST.fill[why || 'other'] || 0) + v; };
  // A unit's heavy hits fill at most heavyRate points a second in all (proposal 8.2-2: tap speed alone cannot stagger).
  actHeavy = (f, src) => {
    if (!bar(f) || f.stgT > 0) return;
    const u = src >= 0 ? units()[src] : null;
    let v = T.stag.heavy;
    if (u) {
      const b = Math.min(T.stag.heavyRate, (u.hvB == null ? T.stag.heavyRate : u.hvB) + (clock - (u.hvAt || 0)) * T.stag.heavyRate);
      u.hvAt = clock; v = Math.min(v, b); u.hvB = b - v;
    }
    if (v > 0) actStag(f, v, src, 'heavy');
  };
  function stagTick(f, dt) {
    const d = (f.stag || 0) - (f.stag0 || 0);
    f.stag0 = f.stag || 0;
    if (d > (f.stagMine || 0)) ST.fill.raw = (ST.fill.raw || 0) + d - (f.stagMine || 0);
    f.stagMine = 0;
    if (f.stgT > 0) { f.stgT -= dt; if (f.stgT <= 0) { f.stgT = 0; if (FIN.f === f) FIN.on = false; } return; }
    if (d > 0) { f.sb = (f.sb || 0) + d; f.sbIdle = 0; }
    else { f.sbIdle = (f.sbIdle || 0) + dt; if (f.sbIdle > T.stag.idle && f.sb > 0) f.sb = Math.max(0, f.sb - T.stag.drain * dt); }
    if (f.sb >= stagMax(f)) staggered(f);
  }
  const STAG_EV = { foe: null, n: 0 };
  function staggered(f) {
    f.sb = 0; f.stgN = (f.stgN || 0) + 1; f.stgT = f.boss ? T.stag.t : T.stag.eliteT; f.sbIdle = 0;
    ST.staggers++;
    if (W.on && W.foe === f) end('stagger', '');   // cancelled, not counted as an answer
    for (let i = PASSIVE.length - 1; i >= 0; i--) if (PASSIVE[i].foe === f && PASSIVE[i].kind !== 'hard') PASSIVE.splice(i, 1);
    if (f.cast && f.cast.kind !== 'hard') f.cast = null;
    if (typeof clsFinisher === 'function' && clsFinisher() && U0up()) { FIN.on = true; FIN.f = f; FIN.t = 0; FIN.auto = f.boss ? T.fin.autoAt : T.fin.eliteAutoAt; }
    STAG_EV.foe = f; STAG_EV.n = f.stgN; emit('stagger', STAG_EV);
    hint('stagger', FIRST.stagger);
  }
  const U0up = () => { const u = units()[0]; return u && u.live && !u.down; };

  // ---------------- the Finisher (3.4) ----------------
  const FIN = { on: false, f: null, t: 0, auto: 2.5 };
  const FIN_EV = { key: '', fin: '', foe: null, dmg: 0, auto: false };
  function fireFinisher(auto) {
    const f = FIN.f; FIN.on = false; FIN.f = null;
    const row = typeof clsFinisher === 'function' ? clsFinisher() : null;
    if (!row || !alive(f) || !U0up()) return 0;
    const P = heroAtk() * (typeof heroStand === 'function' ? heroStand(!auto) : 1), eff = auto ? (dboon('coup') ? 0.8 : T.fin.autoEff) : 1;
    let coef = 0;
    for (const fx of row.fx) if (fx[0] === 'dmg') coef += fx[1];
    // Red Harvest: +perBleed for each Bleed on the foe, and it uses them up
    if (row.perBleed && typeof stStacks === 'function') { const b = stStacks(f, 'bleed'); coef += row.perBleed * b; if (b && f.ss && f.ss.bleed) { f.ss.bleed.t = 0; f.ss.bleed.n = 0; } }
    const fx = dboon('coup') ? 1.5 : 1;   // the Deepwell's Coup de Grace (S6-F)
    const kind = row.type === 'phys' ? 'phys' : 'magic';
    const dmg = cbDamageFoe(f, P * coef * eff * fx, 0, kind, row.type, typeof ST_HEAVY === 'number' ? ST_HEAVY : 0);
    riders(row, f, P * eff);
    ST.fins++; if (auto) ST.finAuto++; ST.finDmg += dmg || 0; N().fin++;
    FIN_EV.key = 'hero'; FIN_EV.fin = row.id; FIN_EV.foe = f; FIN_EV.dmg = dmg || 0; FIN_EV.auto = !!auto;
    emit('finisher', FIN_EV);
    emit('float', { txt: row.name + ' ' + fmt(dmg || 0), color: '#FFD27A', big: true, dt: row.type });
    emit('shake', 0.25);
    return dmg;
  }
  // The riders a Finisher's data carries (classes-2): statuses, shields, heals, a cleanse, a taunt, the knock-back delay.
  function riders(row, f, P) {
    const U = units();
    for (const x of row.fx) {
      const o = x[3] || x[2] || {};
      if (x[0] === 'apply' && typeof stApply === 'function') {
        const list = o.to === 'pack' ? foes() : [f];
        for (const g of list) if (alive(g)) stApply(g, x[1], typeof x[2] === 'number' ? x[2] : 1, P, 0, { dur: o.dur, v: o.v });
      } else if (x[0] === 'shield') { for (const u of U) if (u.live && !u.down) cbShield(u, u.maxHp * x[1], x[1]); }
      else if (x[0] === 'heal') { for (const u of U) if (u.live && !u.down) cbHealUnit(u, P * x[1], U[0]); }
      else if (x[0] === 'cleanse') { for (const u of U) if (u.live && !u.down && typeof stCleanse === 'function') stCleanse(u, x[1]); }
      else if (x[0] === 'taunt' && U[0]) cbTaunt(U[0], foes(), x[1]);
      else if (x[0] === 'delay') { for (const g of foes()) if (alive(g)) g.swing += x[1]; }
    }
  }

  // Auto-cast (3.6): hold a ready ability up to 1.5 s when the focus foe's bar is at 90% or more.
  let holdT = 0;
  actHold = () => {
    const f = typeof mob !== 'undefined' ? mob : null;
    if (!bar(f) || !alive(f) || f.stgT > 0 || !(f.sb >= T.hold.at * stagMax(f))) { holdT = 0; return false; }
    return holdT < T.hold.max;
  };

  // ---------------- the pack heavy (owner D8) ----------------
  let packHeavyT = 0;
  function packHeavy(dt) {
    const list = foes(); if (!list.length || list[0].boss || (typeof cbBossUp === 'function' && cbBossUp())) { packHeavyT = 0; return; }
    packHeavyT += dt;
    if (packHeavyT < T.packHeavy.every || W.on) return;
    let f = null;
    for (const g of list) if (alive(g) && (g.sz === 'brute' || g.elite) && g.z >= T.packHeavy.from && g.born >= 0.3 && !(g.stunT > 0) && !(g.stgT > 0) && g.tgt >= 0) { f = g; break; }
    if (!f) return;
    packHeavyT = 0;
    const u = units()[f.tgt];
    if (!u || !u.live || u.down) return;
    ST.packHeavy++;
    actWarn({ kind: 'heavy', id: 'packHeavy', foe: f, unit: u.i, x: T.packHeavy.x, src: 'pack', hint: FIRST.packHeavy,
      land: (w, m) => { const t = units()[w.unit]; const v = t && t.live && !t.down ? t : (f.tgt >= 0 ? units()[f.tgt] : null); if (v && !v.down && alive(f)) cbHitUnit(v, cbFoeAtk(f) * w.x * m, 'heavy', f); } });
  }

  // ---------------- the tick ----------------
  actTick = dt => {
    clock += dt;
    // Keen and Reeling timers
    for (const u of units()) if (u.keenT > 0) u.keenT -= dt;
    const list = foes();
    for (const f of list) {
      if (!f || f.dead) continue;
      if (f.reelT > 0) f.reelT -= dt;
      if (bar(f)) stagTick(f, dt);
      if (f.cast && f.cast.left > 0 && !(W.on && W.foe === f)) { f.cast.left -= dt; }
    }
    // the answer warning
    if (W.on) {
      if (W.foe && !alive(W.foe) && !W.spec.dead) end('interrupt', 'kill');
      else {
        W.left -= dt; if (W.wait > 0) W.wait -= dt;
        if (W.foe && W.foe.cast) W.foe.cast.left = W.left;
        if (W.left <= 0) land();
      }
    }
    // passive warnings
    for (let i = PASSIVE.length - 1; i >= 0; i--) {
      const p = PASSIVE[i];
      if (p.foe && !alive(p.foe) && !p.spec.dead) { PASSIVE.splice(i, 1); if (p.foe.cast) p.foe.cast = null; continue; }
      p.left -= dt;
      if (p.foe && p.foe.cast) p.foe.cast.left = p.left;
      if (p.left <= 0) { PASSIVE.splice(i, 1); if (p.foe && p.foe.cast) p.foe.cast = null; if (p.land) { try { p.land(p, 1); } catch (e) { console.error('[lanternfall] warning land failed', e); } } }
    }
    // the queue: the next answer warning 1 s after the last; one that waited too long is skipped once
    for (let i = queue.length - 1; i >= 0; i--) { queue[i].t += dt; const q = queue[i]; if (q.t > T.waitMax || (q.spec.foe && !alive(q.spec.foe) && !q.spec.dead)) { queue.splice(i, 1); ST.skipped++; if (q.spec.skip) q.spec.skip(); } }
    if (!W.on && queue.length && clock - lastEnd >= T.gap) start(queue.shift().spec);
    // the Finisher: by itself at half strength after 2.5 s (elites 1.5 s)
    if (FIN.on) { FIN.t += dt; if (!alive(FIN.f) || !(FIN.f.stgT > 0)) FIN.on = false; else if (FIN.t >= FIN.auto && !(typeof soloActive === 'function' && soloActive())) fireFinisher(true); }   // SOLO2: not while the solo player is active
    // auto-cast hold
    const m = typeof mob !== 'undefined' ? mob : null;
    if (bar(m) && alive(m) && m.sb >= T.hold.at * stagMax(m)) holdT += dt; else holdT = 0;
    packHeavy(dt);
  };

  // ---------------- fights: reset, the active reward ----------------
  const ACT_EV = { n: 0 };
  on('packSpawn', p => {
    // an Explosive elite's blast outlives its pack (spec.dead): it still lands on the party
    if (!(W.on && W.spec && W.spec.dead)) { W.on = false; W.foe = null; lastEnd = clock - T.gap; }
    for (let i = queue.length - 1; i >= 0; i--) if (!queue[i].spec.dead) queue.splice(i, 1);
    PASSIVE.length = 0; FIN.on = false; FIN.f = null; packHeavyT = 0;
    const L = p && p.foes; bossFoe = null; bossAns = 0;
    if (L) for (const f of L) if (f && f.boss) { bossFoe = f; break; }
  });
  on('sceneReset', () => { W.on = false; queue.length = 0; PASSIVE.length = 0; FIN.on = false; });
  on('foeDown', p => {
    const f = p && p.mob;
    if (!f || f !== bossFoe) return;
    if (bossAns >= T.reward.answers) {
      f.xp = Math.ceil((f.xp || 0) * (1 + T.reward.xp));
      N().act++; ST.activeKills++;
      ACT_EV.n = bossAns; emit('activeKill', ACT_EV);
      toast(FIRST.activeKill || 'Played it well: +50% XP.', 'good', null, 'normal');
    }
    bossFoe = null;
  });

  // ---------------- the snapshot (7.2) ----------------
  const SNAP = { tele: { kind: '', left: 0, dur: 0, win: 0, perf: 0, foe: null, res: '', wait: 0, name: '' }, cast: { kind: '', left: 0, dur: 0, foe: null, name: '' },
    stag: { v: 0, max: 0, on: false, left: 0 }, fin: { on: false, left: 0 }, phase: 0, packN: 0, ans: 0, enrage: false, rxWin: false, elites: [] };
  cbState = () => {
    const s = SNAP, t = s.tele, c = s.cast;
    t.kind = W.on ? W.kind : ''; t.left = W.left; t.dur = W.dur; t.win = W.win; t.dwin = W.dwin || 0; t.perf = W.perf; t.foe = W.on ? W.foe : null; t.res = W.res; t.wait = W.wait; t.name = W.name;
    c.kind = ''; c.foe = null;
    const list = foes();
    let boss = null;
    for (const f of list) if (alive(f) && f.boss) { boss = f; break; }
    const focus = boss || (typeof mob !== 'undefined' && alive(mob) ? mob : null);
    for (const f of list) if (alive(f) && f.cast && f.cast.left > 0 && (f === focus || !c.foe)) { c.kind = f.cast.kind; c.left = f.cast.left; c.dur = f.cast.dur; c.foe = f; c.name = f.cast.name; }
    const sf = bar(focus) ? focus : null;
    s.stag.on = !!(sf && sf.stgT > 0); s.stag.v = sf ? (sf.stgT > 0 ? stagMax(sf) : sf.sb || 0) : 0; s.stag.max = sf ? stagMax(sf) : 0; s.stag.left = sf ? Math.max(0, sf.stgT || 0) : 0;
    s.fin.on = FIN.on; s.fin.left = FIN.on ? Math.max(0, FIN.auto - FIN.t) : 0;
    s.phase = boss ? boss.ph || 1 : 0;
    s.packN = 0; s.elites.length = 0;
    for (const f of list) if (alive(f)) { s.packN++; if (f.elite && f.tr) for (const k of f.tr) s.elites.push(k); }
    s.ans = bossFoe ? bossAns : 0; s.enrage = !!(boss && boss.enr >= 0);
    s.rxWin = !!(focus && (focus.rxT > 0 || focus.stgT > 0));
    return s;
  };

  // First-use lines (S6-H copy in 21g BOSS_COPY when present).
  const FIRST = typeof BOSS_COPY === 'object' && BOSS_COPY.first ? BOSS_COPY.first : {};
}
