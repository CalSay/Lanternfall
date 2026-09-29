// 59c-deepwell-combat: the Deepwell on party combat (plan-2 W6, plan-3 W6b; deepwell.md 8.2).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// With party combat on (partyCombatOn()), a Deepwell run changes like this:
//  - Packs: each fight floor is one pack, all of its foes at once (normal: 3 foes, elite: the elite
//    and a normal foe, boss: the Deep Elder, which keeps its Elder telegraphs and adds from 59b).
//    Floor HP, First Strike and the cold palette come from 57d's own spawn, one foe at a time.
//  - Party HP carries from floor to floor. Clearing a pack stands the fallen up and heals as in the
//    main game (COMBAT_TUNE.revive, packHealF); a cleared floor heals floorHeal more, a Quiet Landing
//    landingHeal. A saved run resumes a floor with the HP it began with (run.hpAt), like its Oil.
//  - A wipe (every fielded member down) ends the run: reason 'wipe', the floors cleared count and pay.
//  - Oil stays: refunds are refund seconds higher, and a parried Elder wind-up gives parryOil back.
//  - The [C] boons: Thorn Plate, Iron Wall, Deep Ward, Mending Light, Wildfire, Duelist and Quick
//    Parry are wired in 59-combat.js / 59b-enemies.js; here: Taunt Drill for a hero who is not a
//    Warden (the front tank taunts), and Lifeline's once-a-floor limit (dcLifeline). The Guard set
//    (tanks take 25% less) and the Mend set (healing +30%) are read in 59-combat.js.
//  - Deep Edge (D8): a Deep Lore upgrade, damage while below, off in the Trial.
// Everything reads "the fielded party" from combatUnits() (u.live): no fixed party size.
//
// Exposed: DEEP_COMBAT_TUNE (knobs), deepCombatOn(), dcLifeline(u) (59-combat), DWC { hpAt(), tune }.
// Save: registerState('deepCombat', { tip: 0 }) (the one-time tip); run.hpAt (inside S.deep.run:
//   unit key -> HP fraction when the floor began; missing = full).

const DEEP_COMBAT_TUNE = {
  atk: 1,             // foe attack below, x the 59-combat arena attack (COMBAT_TUNE.atk x the foe's floor HP)
  floorHeal: 0.1,     // a cleared floor heals this share of max HP, on top of the pack heal (packHealF 0.15): 25% in all
  landingHeal: 0.6,   // a Quiet Landing heals this share of max HP
  refund: 5,          // Oil refunds this many seconds higher (HP is run health too now)
  parryOil: 2,        // Oil back for each parried (or Shield Wall-blocked) Elder wind-up
  // S6-F (combat-2 6.1): Oil for answers: an interrupt +2 s, a perfect dodge +1 s (+2 with The Dance), a Finisher
  // +3 s; answers (parries too) give at most answerCap s a floor
  intrOil: 2, perfOil: 1, danceOil: 2, finOil: 3, answerCap: 12,
  tauntT: 2,          // Taunt Drill: seconds a class tap makes the front tank taunt (a Warden hero: 59-combat)
  lifeSaves: 1,       // Lifeline: saves a floor, for the whole party
  edge: 0.2,          // Deep Edge (D8): damage below per rank. Full Deep Lore vs none: about +20% depth (D8 band 15-25%)
  edgeCost: [150, 400, 800, 1400]   // 2,750 Marks: Deep Lore 7,320 -> 10,070
};

let deepCombatOn, dcLifeline, DWC;

{
  const T = DEEP_COMBAT_TUNE;
  registerState('deepCombat', { tip: 0 });
  const R = () => (typeof DW === 'object' && DW ? DW.run() : null);
  deepCombatOn = () => typeof deepActive === 'function' && deepActive() && partyCombatOn();
  const units = () => (typeof combatUnits === 'function' ? combatUnits() : []);
  const foes0 = () => { const f = typeof combatFoes === 'function' ? combatFoes() : null; return f && f.length ? f[0] : null; };

  // ---------------- packs: the whole floor at once ----------------
  const baseSpawn = DEEP_ARENA.spawn, baseKill = DEEP_ARENA.onKill;
  DEEP_ARENA.spawn = function () {
    if (!partyCombatOn()) return baseSpawn.call(this);
    const r = R();
    if (!r || r.phase !== 'fight') return null;
    if (mob && mob.deep && !mob.dead && mob.run === r.id) return mob;
    const n = DW.floorFoes(r.floor).length;
    if (!n) return null;
    const pack = [];
    for (let i = 0; i < n; i++) { r.foeI = i; const m = baseSpawn.call(this); if (m) pack.push(m); }
    r.foeI = 0;
    if (!pack.length) return null;
    const lead = pack.find(m => m.boss) || pack[0];
    lead.pack = pack;
    return lead;
  };
  // One pack is the floor: its clear is the floor's last kill.
  DEEP_ARENA.onKill = function (m, over) {
    const r = R();
    if (partyCombatOn() && r && m && m.deep) r.foeI = Math.max(r.foeI, DW.floorFoes(r.floor).length - 1);
    return baseKill.call(this, m, over);
  };

  // ---------------- HP carried between floors ----------------
  let lifeLeft = T.lifeSaves, packFor = '';
  dcLifeline = () => { if (!deepCombatOn() || lifeLeft <= 0) return false; lifeLeft--; return true; };
  function snapshot(r) {
    const o = {};
    for (const u of units()) if (u.live) o[u.key] = u.down ? 0 : Math.round(1e4 * u.hp / Math.max(1e-9, u.maxHp)) / 1e4;
    r.hpAt = o;
  }
  function healAll(frac) {
    for (const u of units()) {
      if (!u.live) continue;
      if (u.down) { u.down = false; u.hp = 0; }
      if (typeof cbHealUnit === 'function') cbHealUnit(u, u.maxHp * frac, null);
      else u.hp = Math.min(u.maxHp, u.hp + u.maxHp * frac);
    }
  }
  // A new deep pack: its attack, and the party's HP from when the floor began (the same state in a
  // normal descent; after a reload, the HP the floor was saved with).
  on('packSpawn', p => {
    const list = p.foes, lead = list && list[0];
    if (!lead || !lead.deep) return;
    for (const f of list) if (f.deep && !f.dcA) { f.dcA = 1; f.atk *= T.atk; if (f.elite && !f.boss && !f.tr && typeof eliteRollDeep === 'function') eliteRollDeep(f, f.floor || 0); }   // S6-F: traits from floor 8
    const r = R(); if (!r) return;
    const k = r.id + ':' + r.floor;
    if (packFor === k) return;
    packFor = k; lifeLeft = T.lifeSaves;
    const at = r.hpAt || {};
    for (const u of units()) {
      if (!u.live) continue;
      const f = typeof at[u.key] === 'number' ? Math.max(0.05, Math.min(1, at[u.key])) : 1;
      u.down = false; u.hp = u.maxHp * f;
    }
  });
  on('deepFloor', ({ kind }) => {
    if (!deepCombatOn()) return;
    const r = R(); if (!r) return;
    healAll(kind === 'landing' ? T.landingHeal : T.floorHeal);
    snapshot(r);
  });
  on('deepFloorStart', () => {
    lifeLeft = T.lifeSaves;
    if (!partyCombatOn() || S.deepCombat.tip) return;
    S.deepCombat.tip = 1;
    toast(soloOn() ? 'Your health carries from floor to floor. Each floor you clear heals a little. If you fall, the run ends.' : "Your party's health carries from floor to floor. Each floor you clear heals a little. If everyone falls, the run ends.", 'good', { ic: ['orb', '#7FB2FF'] }, 'normal');
  });
  // Going below or coming back up (57d emits sceneReset in both): the party is whole, and the pack
  // of the world just left is set aside (no zone foe under the arena, no well foe in the zone).
  let below = false;
  on('sceneReset', () => {
    const now = typeof deepActive === 'function' && deepActive();
    if (now === below) return;
    below = now;
    if (!partyCombatOn() || typeof cbRestore !== 'function') return;
    const f = foes0();
    cbRestore(!!f && (now ? !f.deep : !!f.deep));
  });

  // ---------------- a wipe ends the run ----------------
  let fell = false;
  on('wipe', p => { if (p.arena && deepCombatOn()) fell = true; });
  onTick(() => {
    if (!fell) return;
    fell = false;
    if (deepCombatOn()) DW.fall();
  });

  // ---------------- Oil: parries ----------------
  let oilFloor = '', oilGot = 0;
  function answerOil(s) {
    const r = R(), f = foes0();
    if (!deepCombatOn() || !r || r.phase !== 'fight' || !f || !f.deep) return;
    const k = r.id + ':' + r.floor; if (k !== oilFloor) { oilFloor = k; oilGot = 0; }
    const add = Math.min(s, T.answerCap - oilGot); if (!(add > 0)) return;
    oilGot += add; r.oil = Math.min(DW.oilMax(), r.oil + add);
  }
  on('telegraphResolve', p => { if (p.result === 'parry') answerOil(T.parryOil); });
  on('interrupt', () => answerOil(T.intrOil));
  on('dodge', p => { if (p && p.perfect) { const r = R(); answerOil(T.perfOil + (r && typeof DW.setProgress === 'function' && (DW.setProgress().find(x => x.id === 'dance') || {}).on ? T.danceOil : 0)); } });
  on('finisher', () => answerOil(T.finOil));
  // An active Deep Elder kill (59g, combat-2 3.8): the next draft shows four cards, all Rare or better.
  on('activeKill', () => { const r = R(); if (deepCombatOn() && r) r.actKill = 1; });
  addBonus('deepRefund', () => partyCombatOn() && R() ? T.refund : 0);

  // ---------------- Taunt Drill for every class ----------------
  on('classTap', p => {
    if (!deepCombatOn() || p.kind === 'parry' || p.kind === 'answer' || p.cls === 'warden') return;
    const r = R(); if (!r || !r.boons.taunt || !mob || mob.dead || !mob.deep) return;
    let tank = null;
    for (const u of units()) if (u.live && !u.down && u.role === 'tank' && (!tank || u.col > tank.col)) tank = u;
    if (tank && typeof cbTaunt === 'function') cbTaunt(tank, [mob], T.tauntT * (p.auto ? 0.5 : 1));
  });

  // ---------------- D8: Deep Edge, a below-only damage Lore ----------------
  DEEP_SHOP.edge = { id: 'edge', cat: 'lore', n: 'Deep Edge', cost: T.edgeCost, fx: k => `+${Math.round(100 * T.edge * k)}% damage while below` };
  addModifier('dmg', () => {
    if (typeof deepActive !== 'function' || !deepActive()) return 1;
    const r = R(), k = r && !r.trial ? S.deep.lore.edge || 0 : 0;
    return 1 + T.edge * k;
  });

  DWC = { hpAt: () => { const r = R(); return r ? r.hpAt || null : null; }, tune: T };
}
