// 59b-enemies: foe behaviours by zone type, elites, the zone bosses' mechanics and their
// telegraphs, and parry / dodge / interrupt resolution (Stage C, task C2).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Spec: docs/design/party-and-classes.md 4.7 (behaviours) and 4.8 (bosses and telegraphs).
//
// Exposed names:
//   data   FOE_BEH (type -> { row, atk, spd, ranged, armoured }), ENEMY_TUNE (knobs)
//   hooks  (called by 59-combat.js) onEnemyTick(f, dt) -> true while the foe is busy (channel,
//          wind-up), onFoeAttack(f, u) -> true when the attack was a special (slam, dive hit),
//          onFoeDeath(f, src, kind) -> true when the foe got back up (Rattlebones), onFoeDown(f),
//          onFoeStun(f), endDive(f), bossStart(f), nextWindIn()
//   player resolveParry(source) -> bool   source: 'tap' (the class tap: parry in the last
//          ENEMY_TUNE.parryWin seconds, earlier a Dodge), 'bash' (Aldric's Shield Bash: a parry),
//          'wall' (Shield Wall cast: blocks the next heavy hit). true when a telegraph took it.
//          cbTelegraph() -> the kept telegraph object or null (55-party bossTelegraph reads it)
//
// Behaviours (4.7; elites from zone 15 carry them at double strength, bx = 2):
//   Moss Slime   plain melee (Front)
//   Cave Bat     skirmisher (Mid): every 10s dives the most hurt back-row member for 3s, ignoring
//                threat; from cycle II (zone 8+) an assassin: 5s at x2 damage. A stun, knockback or
//                taunt ends a dive; a tank in Front takes the first hit of a dive on the ally behind it
//   Rattlebones  armoured archer (Mid): ranged; gets back up once at 20% HP unless the killing blow
//                is caster damage or a burn
//   Beetle       bruiser (Front): x1.8 attack at 0.6/s, goes for a tank that holds threat (59-combat)
//   Spore Cap    caster (Back): every 6s a spore cloud hits the whole party for 0.8x attack and
//                poisons for 2% max HP a second for 4s
//   Quarry Golem armoured bruiser (Front): x2.5 attack at 0.4/s; every 3rd hit slams the whole Front column
//   Marsh Wraith healer (Back): every 5s channels 1.5s ("+"), then heals its most hurt ally 15% max HP;
//                a stun interrupts it
// Bosses (4.8): the heavy hit every 8s: a 1.5s wind-up (red "!"), then 4x attack on its target.
// Parry = the class tap in the last 0.8s (1.1s with Maren; the Deepwell's Quick Parry +0.4s): no
// damage, the boss is staggered 2s and takes +50%. An earlier tap = Dodge: half damage. Aldric's
// Shield Bash, a stun and Shield Wall count as parries. Missing costs HP (time), never progress.
// Second mechanics: Elder Slime splits at 50%, Elder Bat dives the back row every 12s (blue "!"),
// Elder Rattlebones raises 2 adds every 15s, Elder Beetle's heavy hit comes every 6s, Elder Spore's
// heavy hit is a party-wide cloud (1.5x), Elder Golem's heavy hit is 6x, Elder Wraith channels a
// 20% self-heal every 10s (green; a stun or a tap interrupts it).
//
// Events (payload objects are reused): telegraphStart { kind, dur, target, foe },
//   telegraphResolve { kind, result: 'parry' | 'dodge' | 'hit' | 'interrupt' | 'heal', by }.

const FOE_BEH = {
  slime: { row: 2, atk: 1, spd: 1 },
  bat: { row: 1, atk: 1, spd: 1 },
  bones: { row: 1, atk: 1, spd: 1, ranged: true, armoured: true },
  beetle: { row: 2, atk: 1.8, spd: 0.75 },
  spore: { row: 0, atk: 1, spd: 1, ranged: true },
  golem: { row: 2, atk: 2.5, spd: 0.5, armoured: true },
  wraith: { row: 0, atk: 1, spd: 1, ranged: true }
};
// S1 (combat-2 2.1, core-2 6.1): each foe's pack size, members, family and hit type ride along from
// 21x-data-types FOE_TYPE (FOE_BEH[k].size, .n, .fam, .dt, .quota). Sizes and quotas do nothing until S6.
for (const k in FOE_BEH) { const r = FOE_TYPE[k]; if (r) Object.assign(FOE_BEH[k], { size: r.size, n: r.n, fam: r.fam, dt: r.dt, quota: r.quota }); }
const ENEMY_TUNE = {
  diveEvery: 10, diveT: 3, diveT2: 5, diveX2: 2, diveFrom: 8,
  cloudEvery: 6, cloud: 0.8, poison: 0.02, poisonT: 4, venom: 3,   // S1: the cloud's poison is Venom (venom stacks, poisonT s)
  slamEvery: 3, healEvery: 5, healChan: 1.5, heal: 0.15, reassemble: 0.2,
  heavyEvery: 8, heavyWind: 1.5, heavyX: 4, parryWin: 0.8, marenWin: 0.3, marenLead: 0.4, stagger: 2, vulnT: 2, dodgeX: 0.5,
  beetleEvery: 6, golemX: 6, cloudBossX: 1.5, batDiveEvery: 12, batDiveX: 2, bonesEvery: 15, bonesAdds: 2, addHp: 0.08,
  splitAt: 0.5, splitHp: 0.12, wraithEvery: 12, wraithHeal: 0.1, firstHeavy: 4, first2: 6   // (Elder Wraith: spec 20% every 10s; every region boss is a Wraith, so it is softer)
};

var onEnemyTick, onFoeAttack, onFoeDeath, onFoeDown, onFoeStun, endDive, bossStart, nextWindIn, resolveParry, cbTelegraph, onPackTick;

{
  const E = ENEMY_TUNE;
  // The telegraph showing now (one at a time). A kept object: the stage reads it every frame.
  const TELE = { kind: '', left: 0, dur: 0, target: null, foe: null, on: false, res: '', win: 0, unit: -1 };
  const START_EV = { kind: '', dur: 0, target: null, foe: null }, RES_EV = { kind: '', result: '', by: '', foe: null };
  let boss = null;
  // S6-B: the answer warning of 59g (kits, pack heavies, elites) first, else this file's own wind-up
  cbTelegraph = () => (typeof actWarning === 'function' && actWarning()) || (TELE.on ? TELE : null);
  const units = () => combatUnits();
  const upUnits = () => { let n = 0; for (const u of units()) if (u.live && !u.down) n++; return n; };
  const alive = f => f && !f.dead && f.hp > 0 && !f.gone;
  const fielded = id => { for (const u of units()) if (u.live && u.id === id) return u; return null; };
  const parryWindow = () => E.parryWin + (fielded('maren') ? E.marenWin : 0) + (typeof deepActive === 'function' && deepActive() && DW.run() && DW.run().boons && DW.run().boons.parry ? 0.4 : 0);
  const windDur = () => E.heavyWind + (fielded('maren') ? E.marenLead : 0);

  function startTele(kind, f, u) {
    TELE.kind = kind; TELE.dur = kind === 'heal' ? E.healChan : windDur(); TELE.left = TELE.dur; TELE.foe = f; TELE.on = true; TELE.res = '';
    TELE.unit = u ? u.i : -1; TELE.target = u ? u.key : null; TELE.win = parryWindow();
    CB_STATS.tele++;
    START_EV.kind = kind; START_EV.dur = TELE.dur; START_EV.target = TELE.target; START_EV.foe = f;
    emit('telegraphStart', START_EV);
    // The first wind-up a player sees explains the parry once (S.combat.tip).
    if (S.combat && !S.combat.tip && kind !== 'heal') { S.combat.tip = 1; toast('The boss winds up a heavy hit. Tap the stage as the red ! ends to parry it.', 'raid', null, 'high'); }
  }
  function endTele(result, by) {
    RES_EV.kind = TELE.kind; RES_EV.result = result; RES_EV.by = by || ''; RES_EV.foe = TELE.foe;
    TELE.on = false; TELE.foe = null; TELE.target = null;
    emit('telegraphResolve', RES_EV);
  }

  // ---------------- normal behaviours ----------------
  function pickDive() {
    let b = null, v = 2;
    for (const u of units()) { if (!u.live || u.down || u.col !== 0) continue; const x = u.hp / u.maxHp; if (x < v) { v = x; b = u; } }
    if (!b) for (const u of units()) { if (!u.live || u.down || u.col === 2) continue; const x = u.hp / u.maxHp; if (x < v) { v = x; b = u; } }
    return b;
  }
  // Two Walls (56b synParty().diveTaunt): once per pack, the Middle tank taunts the first foe that would dive.
  let twPack = null;
  on('packSpawn', () => { twPack = null; });
  function twoWalls(f) {
    const k = typeof synParty === 'function' ? synParty().diveTaunt : null;
    if (!k || twPack === 'used') return false;
    const t = typeof cbUnitByKey === 'function' ? cbUnitByKey(k) : null;
    if (!t || t.down || typeof cbTaunt !== 'function') return false;
    twPack = 'used';
    cbTaunt(t, [f], COMBAT_TUNE.tauntT);
    return true;
  }
  endDive = f => { f.diveT = 0; f.diveU = -1; f.diveX = 1; f.bt = 0; };
  function mostHurtFoe() { let b = null, v = 1; for (const o of combatFoes()) if (alive(o) && o.hp / o.max < v) { v = o.hp / o.max; b = o; } return b; }

  // ---------------- S6-A pack cadences (combat-2 2.3) ----------------
  // A behaviour that is fine on one foe in three becomes a wall on six, so behaviours run per pack: one timer per
  // behaviour, and each time it fires one eligible member does it. Quotas are FOE_BEH[k].quota (21x FOE_TYPE).
  // COMBAT_TUNE.sizes 0 keeps today's per-foe timers.
  const PK = { t: 0, dive: 0, cloud: 0, gap: 0, chan: false, rise: 0 };
  on('packSpawn', () => { PK.t = 0; PK.dive = 0; PK.cloud = 0; PK.gap = 0; PK.chan = false; PK.rise = 0; });
  const quotas = () => COMBAT_TUNE.sizes > 0;
  const q = (k, id, d) => { const b = FOE_BEH[k]; return b && b.quota && b.quota[id] != null ? b.quota[id] : d; };
  function startDive(f) {
    const u = pickDive(); if (!u) return false;
    if (twoWalls(f)) return true;   // F2 Two Walls: the Middle tank taunts the pack's first diver
    const two = f.z >= E.diveFrom;
    f.diveU = u.i; f.diveT = (two ? E.diveT2 : E.diveT); f.diveX = (two ? E.diveX2 : 1) * f.bx; f.first = 1; f.swing = Math.min(f.swing, 0.3);
    return true;
  }
  onPackTick = dt => {
    if (!quotas()) return;
    const list = combatFoes();
    PK.t += dt; PK.dive += dt; PK.cloud += dt;
    let diving = 0, diver = null, spores = 0, spore = null, chan = false, healer = null;
    for (const f of list) {
      if (!alive(f) || f.boss || f.born < COMBAT_TUNE.bornAct || f.stunT > 0) continue;
      if (f.type === 'bat') { if (f.diveT > 0) diving++; else if (!diver && !(f.rootT > 0) && !(f.stgT > 0)) diver = f; }
      else if (f.type === 'spore') { spores++; if (!spore || f.elite) spore = f; }
      else if (f.type === 'wraith') { if (f.chanT > 0) chan = true; else if (!healer || f.elite) healer = f; }
    }
    // dives: every 5 s one diver, at most 2 diving at once
    if (PK.dive >= q('bat', 'every', E.diveEvery)) { PK.dive = 0; if (diver && diving < q('bat', 'dive', 2)) startDive(diver); }
    // spore cloud: every 6 s one cloud for the pack, x1.5 when 3+ Spore Caps stand
    if (spore && PK.cloud >= q('spore', 'every', E.cloudEvery)) {
      PK.cloud = 0;
      const str = spores >= 3 ? 1.5 : 1, a = (typeof cbFoeAtk === 'function' ? cbFoeAtk(spore) : spore.atk) / (spore.share || 1);   // one old foe's cloud
      for (const u of units()) {
        if (!u.live || u.down) continue;
        cbHitUnit(u, a * E.cloud * spore.bx * str, 'cloud', spore);
        if (!u.down) stUnitApply(u, 'venom', Math.round(E.venom * spore.bx * str), { dur: E.poisonT, floor: true });
      }
    } else if (!spore) PK.cloud = 0;
    // heal channels: one at a time; the next starts 2 s after the last ends (the first after healEvery)
    if (chan) { PK.chan = true; PK.gap = 0; }
    else {
      if (PK.chan) { PK.chan = false; PK.gap = 0; }
      PK.gap += dt;
      if (healer && PK.t >= E.healEvery && PK.gap >= q('wraith', 'gap', 2) && mostHurtFoe()) { healer.chanT = E.healChan; PK.chan = true; }
    }
  };

  onEnemyTick = (f, dt) => {
    if (f.boss) return bossTick(f, dt);
    f.bt += dt;
    const t = f.type;
    if (t === 'bat') {
      if (f.diveT > 0) { f.diveT -= dt; if (f.diveT <= 0) endDive(f); }
      else if (quotas()) f.bt = 0;   // S6-A: the pack starts dives
      else if (f.bt >= E.diveEvery && !(f.rootT > 0)) {   // S1: a Rooted foe cannot dive
        const u = pickDive();
        if (u && twoWalls(f)) { f.bt = 0; return false; }   // F2 Two Walls: the Middle tank taunts the pack's first diver
        if (u) { const two = f.z >= E.diveFrom; f.diveU = u.i; f.diveT = (two ? E.diveT2 : E.diveT); f.diveX = (two ? E.diveX2 : 1) * f.bx; f.first = 1; f.swing = Math.min(f.swing, 0.3); }
        f.bt = 0;
      }
    } else if (t === 'spore') {
      if (!quotas() && f.bt >= E.cloudEvery) {
        f.bt = 0;
        for (const u of units()) {
          if (!u.live || u.down) continue;
          cbHitUnit(u, f.atk * E.cloud * f.bx, 'cloud', f);
          // S1 (core-2 3.1: "the Spore cloud becomes Venom"): 3 stacks for 4 s, about today's 2% max HP a second.
          // A cloud raises Venom to its stacks (floor) instead of adding, until S6 makes clouds a pack cadence.
          if (!u.down) stUnitApply(u, 'venom', E.venom * f.bx, { dur: E.poisonT, floor: true });
        }
      }
    } else if (t === 'wraith') {
      if (f.chanT > 0) {
        f.chanT -= dt;
        if (f.chanT <= 0) { const o = mostHurtFoe(); if (o) o.hp = Math.min(o.max, o.hp + o.max * E.heal * f.bx * stHealX(o)); f.bt = 0; }   // S1: Curse / Venom 5+ anti-heal
        return true;
      }
      if (!quotas() && f.bt >= E.healEvery) { const o = mostHurtFoe(); if (o) { f.chanT = E.healChan; return true; } }
    }
    return false;
  };
  onFoeAttack = (f, u) => {
    if (f.boss) return false;
    if (f.type === 'golem') {
      f.hits++;
      if (f.hits % E.slamEvery === 0) {
        let c = -1; for (const x of units()) if (x.live && !x.down && x.col > c) c = x.col;
        for (const x of units()) if (x.live && !x.down && x.col === c) cbHitUnit(x, f.atk * f.bx, 'slam', f);
        return true;
      }
    }
    // F2 Rearguard (a tank in Back, formation.md 2.1): it takes every dive hit meant for an ally.
    if (f.diveT > 0) { const rg = units().find(x => x.live && !x.down && x.role === 'tank' && x.col === 0 && x !== u); if (rg) { f.first = 0; cbHitUnit(rg, f.atk * (f.diveX || 1), 'dive', f); return true; } }
    if (f.diveT > 0 && f.first) {
      f.first = 0;
      // Cover (F1): the tank one slot in front of the dive target (Front covers the Middle, the Middle the Back) takes the first hit.
      for (const x of units()) if (x.live && !x.down && x.role === 'tank' && x.col === u.col + 1 && x !== u) { cbHitUnit(x, f.atk * (f.diveX || 1), 'dive', f); return true; }
      cbHitUnit(u, f.atk * (f.diveX || 1), 'dive', f);
      return true;
    }
    return false;
  };
  onFoeDeath = (f, src, kind) => {
    if (E.reassemble > 0 && f.type === 'bones' && !f.again && !f.boss && kind !== 'magic' && kind !== 'burn' && !(quotas() && PK.rise >= q('bones', 'rise', 2))) {
      f.again = true; f.hp = f.max * E.reassemble; f.hit = 0.2; PK.rise++;   // S6-A: the first 2 that fall get up
      return true;
    }
    return false;
  };
  onFoeDown = f => {
    if (TELE.on && TELE.foe === f) endTele('interrupt', 'kill');
    if (f === boss) boss = null;
  };
  const STUN_EV = { foe: null };
  onFoeStun = f => {
    STUN_EV.foe = f; emit('stunned', STUN_EV);   // S6-B (59g): a stun stops a cast (a boss's `sig` too, proposal 8.2-7)
    if (f.chanT > 0) { f.chanT = 0; f.bt = 0; CB_STATS.interrupts++; }
    if (TELE.on && TELE.foe === f) resolve('interrupt', 'stun');
    if (f.diveT > 0) endDive(f);
  };

  // ---------------- bosses ----------------
  bossStart = f => {
    boss = f; TELE.on = false;
    if (typeof kitStart === 'function' && kitStart(f)) { CB_STATS.bossTries++; return; }   // S6-C: a kit boss (59h)
    f.bt = E.firstHeavy; f.b2 = E.first2; f.split = false; f.addsT = 0;
    CB_STATS.bossTries++;
  };
  nextWindIn = () => {
    if (!boss || !alive(boss)) return 99;
    if (boss.kit && boss.kitM) { let m = 99; for (let i = 0; i < boss.kitM.length; i++) if (boss.kitM[i].tele === 'heavy' && boss.kitM[i].ph <= boss.ph) m = Math.min(m, boss.kt[i]); return Math.max(0, m); }
    return Math.max(0, boss.bt);
  };
  const every = f => f.type === 'beetle' ? E.beetleEvery : E.heavyEvery;
  function bossTick(f, dt) {
    if (f.kit) return kitTick(f, dt);   // S6-C: the kit interpreter (59h)
    if (TELE.on && TELE.foe === f) {
      TELE.left -= dt;
      if (TELE.left > 0) return true;
      land(f);
      return true;
    }
    if (TELE.on && TELE.foe && !alive(TELE.foe)) TELE.on = false;
    f.bt -= dt; f.b2 -= dt;
    // second mechanics
    const t = f.type;
    if (t === 'slime' && !f.split && f.hp <= f.max * E.splitAt) { f.split = true; addFoes(f, 'slime', 2, E.splitHp); }
    if (t === 'bones' && f.b2 <= 0) { f.b2 = E.bonesEvery; addFoes(f, 'bones', E.bonesAdds, E.addHp); }
    if (!TELE.on) {
      if (f.bt <= 0) {
        f.bt = every(f) + windDur();
        const u = f.tgt >= 0 ? units()[f.tgt] : null;
        startTele(t === 'spore' ? 'cloud' : 'heavy', f, u && !u.down ? u : null);
        return true;
      }
      if (t === 'bat' && f.b2 <= 0) { f.b2 = E.batDiveEvery; const u = pickDive(); if (u) { startTele('dive', f, u); return true; } }
      if (t === 'wraith' && f.b2 <= 0 && f.hp < f.max) { f.b2 = E.wraithEvery; startTele('heal', f, null); return true; }
    }
    return false;
  }
  function addFoes(f, type, n, share) {
    const ti = TYPES.findIndex(x => x.key === type), list = combatFoes();
    for (let i = 0; i < n && list.length < 12; i++) {   // S6-A: the foe list holds 12
      const b = FOE_BEH[type], cyc = zoneCycle(f.z);
      const a = {
        key: type + cyc, type, rows: SPR[type], pal: shiftPal(TYPES[ti].pal, zoneHue(f.z)), boss: false, hp: f.max * share, max: f.max * share,
        name: TYPES[ti].name, gold: 0, xp: 0, hit: 0, dead: 0, born: 0, ti, row: b.row, ranged: !!b.ranged, armoured: !!b.armoured,
        atk: f.atk / COMBAT_TUNE.bossAtk * b.atk, spd: COMBAT_TUNE.spd * b.spd, swing: 1, th: new Float64Array(4), tgt: -1, forceT: 0, forceU: -1,
        stunT: 0, slowT: 0, slowV: 0, knockT: 0, burnT: 0, burnDps: 0, markT: 0, focusT: 0, vulnT: 0, bx: 1, elite: false,
        bt: 0, diveT: 0, diveU: -1, chanT: 0, hits: 0, again: true, first: 0, z: f.z, adds: true, gone: false,
        dt: b.dt || 'phys', chillT: 0, rootT: 0, rxT: 0, mkV: 0, stag: 0, ss: null, blight: false   // S1 (59a)
      };
      for (let k = 0; k < 4; k++) a.th[k] = f.th[k] * 0.5;
      list.push(a);
    }
  }
  // The wind-up ends: parried (no damage), dodged (half) or taken in full.
  function land(f) {
    const kind = TELE.kind, res = TELE.res;
    if (kind === 'heal') {
      f.hp = Math.min(f.max, f.hp + f.max * E.wraithHeal * stHealX(f));   // S1: anti-heal
      endTele('heal', '');
      return;
    }
    if (res === 'parry') { resolve('parry', 'tap'); return; }
    if (typeof cbWallOn === 'function' && cbWallOn() && wallBlocks()) { resolve('parry', 'wall'); return; }
    const x = res === 'dodge' ? E.dodgeX : 1;
    if (res === 'dodge') CB_STATS.dodges++;
    CB_STATS.hitByHeavy++;
    if (kind === 'cloud') {
      for (const u of units()) if (u.live && !u.down) cbHitUnit(u, f.atk * E.cloudBossX * x, 'cloud', f);
    } else if (kind === 'dive') {
      const u = TELE.unit >= 0 ? units()[TELE.unit] : null;
      if (u && u.live && !u.down) cbHitUnit(u, f.atk * E.batDiveX * x, 'dive', f);
    } else {
      let u = TELE.unit >= 0 ? units()[TELE.unit] : null;
      if (!u || u.down) { const t = f.tgt >= 0 ? units()[f.tgt] : null; u = t && !t.down ? t : null; }
      if (u) cbHitUnit(u, f.atk * (f.type === 'golem' ? E.golemX : E.heavyX) * x, 'heavy', f);
    }
    endTele(res === 'dodge' ? 'dodge' : 'hit', '');
    f.swing = Math.max(f.swing, 0.5);
  }
  // Parry / interrupt now: no damage; a parried or interrupted heavy hit staggers the boss.
  function resolve(result, by) {
    const f = TELE.foe, kind = TELE.kind;
    if (!TELE.on) return;
    if (result === 'parry') CB_STATS.parries++;
    else if (result === 'interrupt') CB_STATS.interrupts++;
    endTele(kind === 'heal' ? 'interrupt' : result, by);
    if (f && alive(f) && kind !== 'heal') { f.stunT = Math.max(f.stunT, E.stagger); if (result === 'parry') f.vulnT = E.vulnT; f.swing = Math.max(f.swing, 0.5); }
  }
  // Shield Wall blocks a heavy hit (or the Elder Spore's cloud) aimed at the hero; with Lantern Bastion
  // (a crown keystone) on anyone.
  const wallBlocks = () => (TELE.kind === 'heavy' || TELE.kind === 'cloud') && (TELE.kind === 'cloud' || TELE.target === 'hero' || bonus('ks:bastion') > 0);
  resolveParry = source => {
    if (!TELE.on || !TELE.foe || !alive(TELE.foe)) return false;
    if (source === 'wall') { if (wallBlocks()) { resolve('parry', 'wall'); return true; } return false; }
    if (source === 'bash') { resolve(TELE.kind === 'heal' ? 'interrupt' : 'parry', 'bash'); return true; }
    // the class tap: inside the window = parry, earlier = dodge (a later tap can still parry)
    if (TELE.kind === 'heal') { resolve('interrupt', 'tap'); return true; }
    if (TELE.left <= TELE.win) { resolve('parry', 'tap'); return true; }
    TELE.res = 'dodge';
    return true;
  };
}
// F1: the combat estimate exists now, so the formation migration (56e) can use the planner.
if (typeof formEnsure === 'function') formEnsure(true);
