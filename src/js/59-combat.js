// 59-combat: party combat (Stage C, task C1 + C3). Packs of foes with HP and threat tables, a
// party with HP, armour, formation reach, healing, shields, crowd control, knock-outs, wipes
// with a retreat, and the closed-form hold estimate for away gains and auto-push.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Spec: docs/design/party-and-classes.md 4.1-4.11 and the owner decisions (packs of 3; a wipe
// retreats one zone and pushes back up once the party can hold it; roles define combat).
// Foe behaviours, bosses and telegraphs live in 59b-enemies.js (this file calls its hooks).
//
// Exposed names (everything else is private, inside the block below):
//   data    COMBAT_TUNE (knobs; sim --combat k=v), CB_STATS (counters for the sim and checks)
//   state   partyCombatOn(), combatUnits() -> the 4 party unit records (read only),
//           combatFoes() -> the live foe list (read only; `mob` is the one the stage shows)
//   loop    combatTick(dt), cbSpawn(boss) (50-sim spawn), cbStrike(amount, src, at, label, color, big)
//           (50-sim strike), cbHeroUp(), cbPush() (auto-push check), cbArena(mob) (a Deepwell pack),
//           cbRestore(clear) (the party whole, the arena pack set aside: 59c-deepwell-combat.js)
//   hooks   cbUnitHp(key), cbUnitCd(key) (55-party unitHp / unitCd read them)
//   helpers cbHitUnit(u, amount, kind, foe), cbHealUnit(u, amount, from), cbShield(u, amount, cap),
//           cbDamageFoe(f, amount, src, kind), cbUnitByKey(key), cbTaunt(u, foes, secs),
//           cbStun(f, secs), cbDebug()
//   offline partyHoldEstimate(zMax, opts) -> { zone, holds, dps, packSecs, packsPerSec, goldPerSec,
//           tgt, inc, sus, margin }; partyHolds(z) -> bool
//
// Model (short): each unit keeps HP, shield and a damage-reduction stack. Companions swing at
// their role speed; a swing deals charDps x (1 - abF) / speed (their average damage today, so
// pacing keeps its curve) and the signature ability, cast on its own cooldown, deals the rest as
// a burst (charDps x abF x cooldown) plus its real effect (taunt, heal, stun, slow, shield...).
// Supports heal (heal x power per second) and Smite the focus foe for their charDps (BAL2:
// ROSTER_TUNE.supDps x power, magic). Tanks take tankDr less damage. The hero keeps its own swings
// (50-sim heroSwing), routed here by cbStrike. Foes pick the highest-threat member they can
// reach and switch only past +20%. Physical hits on armoured foes deal armourX.
//
// Events (payload objects are REUSED: copy what you keep; the stage can listen to them):
//   packSpawn { foes }                        a new pack (or boss and its adds) is on the field
//   unitHit   { key, amount, kind, foe, blocked, shield }   kind: hit | heavy | cloud | slam | dive | poison | burn
//   unitHeal  { key, amount, shield }         healing done (shield: part that became a shield)
//   unitDown  { key }                         a member was knocked out
//   unitUp    { key, hp }                     a downed member stands up (between packs or after a wipe)
//   foeDown   { mob, src }                    a foe in the pack died (the `kill` event is per pack)
//   wipe      { zone, to, boss, arena }       every member is down (boss: the attempt failed)
//   telegraphStart / telegraphResolve         59b-enemies.js
//
// Economy: a pack is one "foe" for every listener. `kill` fires once per pack (the lead foe,
// gold = the pack's total); the pack's HP and gold total packHp / packGold of one old foe, so
// bounties, drops, the bestiary and companion XP keep their pace. S.kills (boss progress)
// counts packs: 10 packs unlock the boss. S.totalKills counts packs too (every kill-count threshold keeps its pace).
//
// Save: registerState('combat', { on: 1, back: 0 }). on: party combat is on (every save, old
// ones merge it in); back: the zone a wipe retreated from (0 = none), for the auto push back.

// Party combat is on for every save (S.combat.on, merged into old saves) unless COMBAT_TUNE.on is 0.
function partyCombatOn() { return !(COMBAT_TUNE && !COMBAT_TUNE.on) && !(S && S.combat && !S.combat.on); }
// var: other files (56-roster at load, 55-party) may ask before this file has run.
var COMBAT_TUNE, CB_STATS, combatUnits, combatFoes, combatTick, cbSpawn, cbStrike, cbHeroUp, cbPush,
  cbUnitHp, cbUnitCd, cbHitUnit, cbHealUnit, cbShield, cbDamageFoe, cbUnitByKey, cbTaunt, cbStun, cbDebug,
  partyHoldEstimate, partyHolds, cbClock, cbWallOn, cbArena, cbBossUp, cbBossReady, cbRestore;

{
  const T = {
    on: 1,
    // packs (4.1): 3 foes; the pack totals packHp / packGold of one old foe (spec: 0.4 each = 1.2)
    packSize: 3, packHp: 1.2, packGold: 1.2, mixP: 0.72,
    eliteFrom: 15, eliteP: 0.2, eliteHp: 2, eliteGold: 2,
    // foe attack per hit = atk x mobHp(z) (spec: 1.2 x 1.55^(z-1) = 0.12 x mobHp; tuned to this game's
    // party power); zones below easeZone hit softer (x (z / easeZone)^easePow) so a class and its starter hold.
    // BAL2: atk 0.006 -> 0.025 (sustain binds near the push zone, so a missing tank or healer costs 2-4 zones,
    // T6); bossAtk 2.5 -> 0.75 keeps a boss's hits (and 4x heavy hits) near their Stage C size
    atk: 0.025, easeZone: 12, easePow: 1.5, spd: 0.8, bossAtk: 0.75, bossSpd: 0.6,
    armourX: 0.85,                       // physical hits on armoured foes (Rattlebones, Golems; spec 0.5, softened for class parity, T3)
    aoeOther: 0.5, lmSplash: 0.15,       // caster hits on the other foes; the Lanternmage's splash
    hp: { tank: 12, striker: 5, caster: 4, support: 6 },
    heroPow: 1.4, hpClamp: [0.15, 6],   // the hero's power = its damage / heroPow (a striker's 1.4 x power); see hpPow
    heroHp: { warden: 12, lanternmage: 4, ranger: 5, lightkeeper: 6 },
    armour: { tank: 20, striker: 0, caster: 0, support: 10 }, heroArmour: { warden: 30, lanternmage: 0, ranger: 0, lightkeeper: 10 },
    aldricArmour: 20, braced: 10, redMax: 0.6, tankDr: 0.4,   // (BAL2) tankDr: tanks take 40% less (no-tank line-ups hold 2-4 zones lower)
    wardenTankHp: 0.4, wardenTankArmour: 20, wardenDr: 0.1, wardenThreat: 6,
    lkHeal: 1.2, lkAura: 0.4, lkCd: 0.25, heal: 0.8,   // heal: a support heals 0.8 x power a second (spec 1.2; T6 wants a support worth 2-4 zones of hold)
    // (BAL2) packHealF 0.1 -> 0.15 (no-support line-ups 4-5 -> 3-4 zones lower); estSafety 1.25 -> 1 and support
    // ability heals counted (the estimate walled pushes the live party held); estEff 1 -> 1.08 (T8; away only)
    cover: 0.15, backRanged: 0.2,
    regen: 0.005, packHealF: 0.15, revive: 0.3, reviveVigil: 0.6, respawn: 0.45, wipeT: 5,
    threat: { tank: 4, striker: 1, caster: 1.2, support: 0.5 }, healThreat: 0.5, opening: 10, switchX: 1.2,
    tauntT: 3, tauntX: 1.2, shieldT: 6,
    abF: 1 / 6,                          // share of a companion's damage its ability deals (SYN_TUNE.abShare 0.2 of 1.2)
    abCd: { tobin: 12, wren: 10, hesketh: 8, pip: 10, bram: 11, maren: 16, aldric: 15, kestrel: 14, thessaly: 12, anselm: 15,
      grenna: 14, isolde: 9, oriel: 18, morwen: 16, vesper: 20, elowen: 20, caedmon: 16, corvin: 10 },
    cdMin: 0.5,                          // cooldown reductions stop at -50%
    fieldSupport: 2,                     // autoField (56-roster): 2 a support when the party cannot hold its max zone without one, 1 always, 0 never
    bossGate: 1, bossWait: 600,          // auto-challenge when the boss would die within the timer x bossGate (or after bossWait s)
    refresh: 0.25, pushEvery: 5, pushRetry: 60, holdSecs: 120, estSafety: 1, estEff: 1.08, awayRate: 0.75, autoCast: 1.05,
    // kit numbers (3.2, 3.5)
    guardDr: 0.4, guardT: 4, trustStep: 0.01, trustMax: 0.2, mend: 0.25, warmCap: 0.2, longRoute: 0.2,
    beacon: 0.2, beaconLamp: 0.3, beaconSh: 0.1, burnBack: 0.1, keeper: 0.15, sturdy: 0.1,
    intercept: 3, interceptAt: 0.25, oathHeal: 0.1, bashStun: 1.5, leapKnock: 1, leapUntarg: 1,
    mireSlow: 0.4, mireT: 3, sinkSlow: 0.5, sinkT: 5, sinkStun: 2, deepWater: 0.1, thessTrait: 0.3,
    tollP: 10, tollP10: 8, tollSh: 0.1, tollAt: 0.3, arms: 0.12,
    rock: 0.02, rockT: 5, rockMax: 0.2, bedrock: 0.25, shatterStun: 1.5,
    execTh: 0.3, execTh20: 0.4, duskExec: 0.1,
    starStun: 1, starSlow: 0.3, starSlowT: 4, burnT: 3, vigilBurn: 1.5, vigilT: 6, vigilSlow: 0.2,
    verseP: 6, verseWard: 0.1, verseMend: 0.05,
    sanct: 0.2, sanctHot: 0.03, sanctT: 5, lowFlame: 4, oathCd: 5, lastLight: 0.1,
    unburnt: 0.08, vowT: 5, pyre: 0.3, pyreT: 4, pyreSh: 0.15,
    hearthDr: 0.1, hearthHeal: 0.2, hedgeSh: 0.1, chosenHeal: 0.03,
    wall: 0.6, wallT: 6, hymnHeal: 0.4, hymnCd: 0.5, lkTap: 0.08, wardenTaunt: 3,
    blockX: 0.5, poison: 0.02, poisonT: 4
  };
  COMBAT_TUNE = T;
  const ST = CB_STATS = { enemySecs: 0, tankSecs: 0, wipes: 0, packs: 0, kos: 0, revives: 0, healed: 0, shielded: 0, heroDmg: 0, compDmg: 0,
    tele: 0, parries: 0, dodges: 0, blocked: 0, hitByHeavy: 0, interrupts: 0, abilities: 0, bossTries: 0, bossWins: 0, pushes: 0, taken: 0 };

  registerState('combat', { on: 1, back: 0, tip: 0 });

  // BAL2: the Lightkeeper's aura (supports heal 40% more) also makes their Smite 40% stronger, so a
  // party of healers still kills (the attrition line-up of spec 4.13, T12).
  if (typeof addCharModifier === 'function') addCharModifier(id => partyCombatOn() && S.party && S.party.cls === 'lightkeeper' && ROSTER[id] && ROSTER[id].role === 'support' ? 1 + T.lkAura : 1);
  // Haste gear (K11): the hero's ability comes back sooner too (capped at -30% in gear()).
  addModifier('abilityCd', () => partyCombatOn() ? 1 - gear().haste / 100 : 1);

  const ROLE_ROW = { tank: 2, striker: 1, caster: 0, support: 0 };
  const CLASS_ROLE = { warden: 'tank', lanternmage: 'caster', ranger: 'striker', lightkeeper: 'support' };
  const OATH = { maren: 1, aldric: 1, elowen: 1, anselm: 1, caedmon: 1 };
  const HEDGE = k => !!ROSTER[k] && ROSTER[k].circle === 'hedgefolk';
  const red = a => Math.min(T.redMax, Math.max(0, a) / (Math.max(0, a) + 100));

  // ---------------- units (pre-allocated) ----------------
  function mkUnit(i) {
    return {
      i, key: '', id: null, live: false, role: 'tank', cls: null, col: 2, lane: 0, melee: true, ranged: false,
      pow: 0, hpP: 0, maxHp: 1, hp: 1, sh: 0, shT: 0, armour: 0, thX: 1, dps: 0, spd: 1, swing: 0, heal: 0, healT: 0, healX: 1, healIn: 1,
      down: false, cd: 0, cdMax: 0, cdRate: 1, lv: 1, blockP: 0, ward: 0, pierce: 0, area: 0, ctrl: 1,
      drT: 0, drV: 0, untarg: 0, strikeT: 0, trust: 0, stubborn: false, vow: false, ashenT: 0, rock: 0, rockT: 0,
      icLeft: 0, icFor: -1, icUsed: 0, poisonT: 0, poisonDps: 0, reflT: 0, hotT: 0, hotV: 0, fight: 0, lifeline: false,
      dmg: 0, healed: 0, taken: 0, verse: 0, verseT: 0, tollT: 0
    };
  }
  const U = [mkUnit(0), mkUnit(1), mkUnit(2), mkUnit(3)];
  const EST = [mkUnit(0), mkUnit(1), mkUnit(2), mkUnit(3)];   // scratch units for partyHoldEstimate
  let nU = 0;                      // live units in U
  let foes = [];                   // foe objects (mob-shaped), rebuilt per pack
  const FOE_MAX = 6;
  let clock = 0, refreshT = 0, pushT = 0, wipeT = 0, wipeBoss = false, fieldSig = '', packDown = false, packT = 0;
  let packGold = 0, lead = null, partyAcc = 0, partyTickT = 0, focusIdx = -1, showT = 0, inArena = false;
  cbClock = () => clock;
  combatUnits = () => U;
  combatFoes = () => foes;
  cbUnitByKey = key => { for (let i = 0; i < nU; i++) if (U[i].key === key) return U[i]; return null; };

  const fieldIds = () => (S.party && S.party.field || []).filter(k => ROSTER[k] && typeof charRec === 'function' && charRec(k)).slice(0, 3);
  const has = id => { for (let i = 0; i < nU; i++) if (U[i].id === id) return U[i]; return null; };
  const upHas = id => { const u = has(id); return u && !u.down ? u : null; };
  const synOn = id => { try { return typeof synergyStatus === 'function' && synergyStatus(id).active; } catch (e) { return false; } };
  const deep = () => typeof deepActive === 'function' && deepActive() && typeof DW === 'object' && DW.run() ? DW.run() : null;
  const boon = id => { const r = deep(); return r && r.boons ? (r.boons[id] || 0) : 0; };
  let setsCache = null, setsT = -1;
  const setOnC = s => {
    if (!deep()) return false;
    if (setsT !== clock) { setsT = clock; try { setsCache = DW.setProgress(); } catch (e) { setsCache = null; } }
    if (!setsCache) return false;
    for (const x of setsCache) if (x.id === s) return !!x.on;
    return false;
  };
  const lvOf = id => { const r = charRec(id); return r ? r.lv : 0; };
  // Constellation keystones (57e-constellations.js STAR_KS): bonus('ks:<id>') > 0.
  const ks = id => bonus('ks:' + id) > 0;
  let emberBurn = 0, challUntil = -1;

  // ---------------- per-unit stats ----------------
  // Fills u from the current field; keeps hp as a fraction of max when max changes.
  const synFlags = { hearthTank: null, hedge3: false, oldoath: false, lampward: false, chosen: false, mirelamp: false, oldenemies: false, markleap: false, hunting: false, dusk: false, bellsong: false, wayfarers: false };
  function readSyn() {
    synFlags.hearthTank = null;
    const act = typeof activeSynergies === 'function' ? activeSynergies() : [];
    for (const k in synFlags) if (k !== 'hearthTank') synFlags[k] = false;
    for (const a of act) {
      if (a.id === 'hearth') synFlags.hearthTank = a.members[0];
      else if (a.id === 'hedgefolk') synFlags.hedge3 = a.members.length >= 3;
      else if (a.id in synFlags) synFlags[a.id] = true;
    }
  }
  function statUnit(u, key, keepHp) {
    const p = S.party, cells = (p && p.cells) || {}, cell = cells[key] || { col: key === 'hero' ? 2 : 1, lane: 0 };
    u.key = key; u.live = true; u.col = cell.col; u.lane = cell.lane;
    let maxHp, role;
    if (key === 'hero') {
      const cls = p && p.cls && HERO_CLASSES[p.cls] ? p.cls : 'warden';
      role = CLASS_ROLE[cls]; u.cls = cls; u.id = null; u.lv = S.L;
      const g = gear(), hp0 = heroAtk() * aps() / (cls === 'lightkeeper' ? 0.2 : 1);
      u.pow = hp0 / T.heroPow;
      u.hpP = hpPow(u.pow);
      maxHp = T.heroHp[cls] * u.hpP * (1 + g.hp / 100);
      u.armour = T.heroArmour[cls] + g.armour + 0.1 * (equipped('helm') ? itemPower(equipped('helm')) : 0);
      // Unbroken: each guard stack also gives 2 armour. Slow Burn / Everburn: Embers burn their foe.
      if (cls === 'warden' && ks('unbroken') && typeof heroGuardN === 'function') u.armour += 2 * heroGuardN();
      emberBurn = cls === 'lanternmage' ? heroAtk() * (ks('everburn') ? STAR_KS.everburn.perEmber : ks('slowBurn') ? STAR_KS.slowBurn.perEmber : 0) : 0;
      u.thX = (cls === 'warden' ? T.wardenThreat : T.threat[role]) * (1 + g.threat / 100);
      u.melee = cls === 'warden'; u.ranged = !u.melee;
      u.dps = 0; u.spd = aps();
      u.heal = cls === 'lightkeeper' ? T.lkHeal * u.hpP * (1 + g.heal / 100) : 0;
      u.blockP = Math.min(0.4, g.block / 100); u.ward = Math.min(0.4, g.ward / 100); u.pierce = Math.min(1, g.pierce / 100);
      u.area = Math.min(0.5, g.area / 100); u.ctrl = 1 + Math.min(1, g.control / 100);
      u.cdMax = 0;
    } else {
      const R = ROSTER[key], g = charGear(key), lv = lvOf(key);
      role = R.role; u.cls = null; u.id = key; u.lv = lv;
      u.pow = charPow(key);
      u.hpP = hpPow(u.pow);
      maxHp = T.hp[role] * u.hpP * (1 + g.hp / 100);
      u.armour = T.armour[role] + g.armour;
      if (key === 'aldric') u.armour += T.aldricArmour + (lv >= 10 ? 20 : 0);
      u.thX = T.threat[role] * (1 + g.threat / 100) * (key === 'aldric' ? 1.1 : 1);
      u.melee = role === 'tank' || (role === 'striker' && !R.ranged); u.ranged = !u.melee;
      u.dps = charDps(key);   // BAL2: supports strike too (Smite, ROSTER_TUNE.supDps)
      u.spd = ROLE_STATS[role].spd;
      let hx = 1 + g.heal / 100;
      const innate = R.rarity === 'epic' || R.rarity === 'legendary';
      if (role === 'support') {
        if (innate && lv >= 10) hx *= 1.15;
        if (lv >= 50) hx *= 1 + 0.25 * Math.floor((lv - 25) / 25);
        if (p && p.cls === 'lightkeeper') hx *= 1 + T.lkAura;
      }
      u.heal = role === 'support' ? T.heal * u.hpP * hx : 0;
      u.blockP = Math.min(0.4, g.block / 100); u.ward = Math.min(0.4, g.ward / 100); u.pierce = Math.min(1, g.pierce / 100);
      u.area = Math.min(0.5, g.area / 100); u.ctrl = 1 + Math.min(1, g.control / 100);
      if (key === 'maren') { maxHp *= 1 + T.sturdy; if (lv >= 10) { let n = 0; for (const k of fieldIds()) if (k !== 'maren' && OATH[k]) n++; if (p && p.cls === null) n += 0; maxHp *= 1 + T.keeper * n; } }
      // cooldown: Encore (Vesper), Wayfarers, the Lightkeeper's Blessing, Haste gear, Low Flame and The Old Oath
      let base = T.abCd[key] || 12;
      if (key === 'elowen') base -= T.lowFlame + (synFlags.oldoath ? T.oathCd : 0);
      let cut = g.haste / 100 + (upHas('vesper') && key !== 'vesper' || key === 'vesper' ? 0.1 : 0);
      if (synFlags.wayfarers) cut += 0.1;
      if (p && p.cls === 'lightkeeper') cut += T.lkCd;
      u.cdMax = Math.max(1, base * (1 - Math.min(T.cdMin, cut)));
    }
    u.role = role;
    // class auras and party-wide shapes
    // The Warden's aura (Oathsworn doubles it: +80% HP, +40 armour).
    if (p && p.cls === 'warden' && role === 'tank' && key !== 'hero') { const k = ks('oathsworn') ? 2 : 1; maxHp *= 1 + T.wardenTankHp * k; u.armour += T.wardenTankArmour * k; }
    if (role === 'tank' && u.col === 2) u.armour += T.braced;
    if (upHas('elowen') || has('elowen')) maxHp *= 1 + T.lastLight;
    if (role === 'tank' && boon('iron')) maxHp *= 1 + 0.2 * boon('iron');
    u.healIn = (has('elowen') ? 1 + T.lastLight : 1) * (synFlags.hearthTank === key ? 1 + T.hearthHeal : 1) * (setOnC('mend') ? 1.3 : 1);
    if (!(maxHp > 0) || !Number.isFinite(maxHp)) maxHp = 1;
    if (keepHp && u.maxHp > 0) { const f = u.hp / u.maxHp; u.maxHp = maxHp; u.hp = u.down ? 0 : Math.max(0, Math.min(maxHp, f * maxHp)); }
    else { u.maxHp = maxHp; u.hp = maxHp; }
    return u;
  }
  // HP and healing scale with the party's power, not only the member's own (4.1 uses each member's
  // power; here a member's HP power is the geometric mean of its own and the party's average, own
  // clamped to 0.15-6x the average). So HP keeps pace with the damage that sets the zone curve (party
  // synergies and the hero's share move it), and a new recruit is weaker but never paper.
  let partyP = 1;
  const hpPow = own => partyP * Math.sqrt(Math.max(T.hpClamp[0], Math.min(T.hpClamp[1], own / partyP)));
  function readPartyP(ids) {
    let sum = 0, n = 0;
    const cls = S.party && S.party.cls;
    sum += heroAtk() * aps() / (cls === 'lightkeeper' ? 0.2 : 1) / T.heroPow; n++;
    for (const k of ids) { sum += charPow(k); n++; }
    partyP = sum > 0 && Number.isFinite(sum) ? sum / n : 1;
  }
  // Rebuild the unit list when the field, cells or class change; else refresh the stats in place.
  function refreshUnits(force) {
    const p = S.party; if (!p) return;
    const ids = fieldIds();
    readPartyP(ids);
    let sig = (p.cls || '') + '|' + ids.join(',') + '|';
    const cells = p.cells || {};
    for (const k of ids) sig += (cells[k] ? cells[k].col + '' + cells[k].lane : '-');
    readSyn();
    if (sig !== fieldSig || force) {
      const old = {};
      for (let i = 0; i < nU; i++) old[U[i].key] = { f: U[i].maxHp > 0 ? U[i].hp / U[i].maxHp : 1, down: U[i].down, cd: U[i].cd, sh: U[i].sh };
      fieldSig = sig;
      nU = 0;
      for (const key of ['hero'].concat(ids)) {
        const u = U[nU++];
        resetUnit(u);
        statUnit(u, key, false);
        const o = old[key];
        if (o) { u.hp = u.maxHp * o.f; u.down = o.down; u.cd = o.cd; u.sh = o.sh; if (u.down) u.hp = 0; }
        else u.cd = u.cdMax * 0.5;
      }
      for (let i = nU; i < 4; i++) U[i].live = false;
      for (const f of foes) if (f.th) f.th.fill(0);
    } else for (let i = 0; i < nU; i++) statUnit(U[i], U[i].key, true);
  }
  function resetUnit(u) {
    u.down = false; u.sh = 0; u.shT = 0; u.drT = 0; u.drV = 0; u.untarg = 0; u.strikeT = 0; u.trust = 0; u.stubborn = false; u.vow = false;
    u.ashenT = 0; u.rock = 0; u.rockT = 0; u.icLeft = 0; u.icFor = -1; u.icUsed = 0; u.poisonT = 0; u.poisonDps = 0; u.reflT = 0;
    u.hotT = 0; u.hotV = 0; u.fight = 0; u.swing = Math.random() / Math.max(0.1, u.spd || 1); u.healT = 0; u.dmg = 0; u.healed = 0; u.taken = 0;
    u.verse = 0; u.verseT = 0; u.tollT = 0; u.lifeline = false;
  }

  // ---------------- foes ----------------
  // Foe attack per hit at zone z (4.1, tuned: see T.atk).
  const zoneAtk = z => T.atk * mobHp(z) * Math.pow(Math.min(1, z / T.easeZone), T.easePow);
  function mkFoe(ti, hp, gold, xp, z, boss, name, cyc) {
    const t = TYPES[ti], b = FOE_BEH[t.key] || FOE_BEH.slime;
    return {
      key: t.key + cyc, type: t.key, rows: SPR[t.key], pal: shiftPal(t.pal, zoneHue(z)), boss: !!boss, hp, max: hp,
      name, gold, xp, hit: 0, dead: 0, born: 0,
      ti, row: b.row, ranged: !!b.ranged, armoured: !!b.armoured, atk: zoneAtk(z) * (boss ? T.bossAtk : b.atk), spd: boss ? T.bossSpd : T.spd * b.spd,
      swing: 0.6 + Math.random() * 0.8, th: new Float64Array(4), tgt: -1, forceT: 0, forceU: -1,
      stunT: 0, slowT: 0, slowV: 0, knockT: 0, burnT: 0, burnDps: 0, markT: 0, focusT: 0, vulnT: 0, bx: 1, elite: false,
      bt: 0, b2: 0, diveT: 0, diveU: -1, diveX: 1, chanT: 0, hits: 0, again: false, first: 0, split: false, z, adds: false, gone: false
    };
  }
  // Called by 50-sim spawn() in place of its single foe. Returns the foe the stage shows.
  cbSpawn = boss => {
    const z = S.zone, cyc = zoneCycle(z), zt = zoneType(z);
    foes = []; packDown = false; packT = 0; focusIdx = -1; lead = null; packGold = 0; inArena = false;
    refreshUnits(false);
    if (boss) {
      const hp = mobHp(z) * bossHpMult(z) * mod('bossHp') * mod('foeHp');
      const f = mkFoe(zt, hp, mobHp(z) * 0.05 * goldMult() * 6, Math.ceil(1.5 * z) * 5, z, true, 'Elder ' + TYPES[zt].name, cyc);
      foes.push(f); lead = f;
      bossStart(f);
    } else {
      const n = T.packSize, tot = mobHp(z) * T.packHp * mod('foeHp');
      for (let i = 0; i < n; i++) {
        const ti = Math.random() < T.mixP ? zt : zoneNextType(z);
        const hp = tot / n * (0.9 + Math.random() * 0.2);
        const f = mkFoe(ti, hp, mobGold(z) * T.packGold / n, 0, z, false, TYPES[ti].name, cyc);
        foes.push(f);
      }
      // the lead (champion roll, the `kill` event, its drops) is the first foe: zone type 72% of the time, as before packs
      lead = foes[0];
      lead.xp = Math.ceil(1.5 * z * T.packHp);
      if (z >= T.eliteFrom && Math.random() < T.eliteP) {
        const e = foes[1 + ((Math.random() * (n - 1)) | 0)] || foes[0];   // never the lead (it may be a champion)
        e.elite = true; e.bx = 2; e.hp *= T.eliteHp; e.max = e.hp; e.gold *= T.eliteGold; e.name = 'Elite ' + e.name;
      }
    }
    sortFoes();
    openThreat();
    ST.packs++;
    mob = lead;
    emit('spawn', { mob: lead, zone: z });   // 55-gathering may make the lead a champion
    for (const f of foes) f.max = Math.max(f.max, f.hp);
    packGold = 0;
    for (const f of foes) packGold += f.gold;
    showFoe();
    emitPack();
    return mob;
  };
  // Deepwell arena: its foe becomes a pack (m.pack: the floor's foes, 59c-deepwell-combat.js; else a pack of one).
  cbArena = m => { if (m && !m.th) adoptArena(m); };
  function adoptArena(m) {
    const list = Array.isArray(m.pack) && m.pack.length ? m.pack.slice(0, FOE_MAX) : [m];
    if (!list.includes(m)) list.unshift(m);
    for (const x of list) adoptFoe(x);
    foes = list; sortFoes(); lead = m; packDown = false; packT = 0; focusIdx = 0; inArena = true;
    refreshUnits(false);
    if (m.boss) bossStart(m);
    openThreat();
    showFoe();
    emitPack();
  }
  function adoptFoe(m) {
    const t = TYPES.findIndex(x => x.key === m.type), b = FOE_BEH[m.type] || FOE_BEH.slime;
    const base = m.max / (m.boss ? 8 : m.champ ? 3 : 1);
    Object.assign(m, { ti: Math.max(0, t), row: b.row, ranged: !!b.ranged, armoured: !!b.armoured, atk: T.atk * base * (m.boss ? T.bossAtk : b.atk),
      spd: m.boss ? T.bossSpd : T.spd * b.spd, swing: 0.8, th: new Float64Array(4), tgt: -1, forceT: 0, forceU: -1, stunT: 0, slowT: 0, slowV: 0, knockT: 0,
      burnT: 0, burnDps: 0, markT: 0, focusT: 0, vulnT: 0, bx: m.champ ? 2 : 1, elite: !!m.champ, bt: 0, b2: 0, diveT: 0, diveU: -1, diveX: 1, split: false, chanT: 0, hits: 0, again: false, first: 0,
      z: S.zone, adds: false, gone: false });
  }
  const PACK_EV = { foes: null };
  function emitPack() { PACK_EV.foes = foes; emit('packSpawn', PACK_EV); }
  // Front foes first (the stage shows mob; a sorted list keeps melee reach cheap).
  function sortFoes() { foes.sort((a, b) => b.row - a.row); }
  function openThreat() {
    for (const f of foes) {
      f.th.fill(0);
      for (let i = 0; i < nU; i++) {
        const u = U[i];
        if (u.role !== 'tank') continue;
        const hit = (u.key === 'hero' ? heroAtk() : u.dps / Math.max(0.1, u.spd)) || 1;
        f.th[i] = hit * T.opening * u.thX * (u.key === 'hero' && u.cls === 'warden' ? 10 : 1);
      }
    }
  }
  const alive = f => f && !f.dead && f.hp > 0 && !f.gone;
  function anyFoe() { for (const f of foes) if (alive(f)) return true; return false; }
  // The foe the stage shows: the party's focus, else the first living foe.
  function showFoe() {
    const f = lead && lead.boss && alive(lead) ? lead : focusFoe();
    if (f) mob = f;
  }
  // A boss fight is on while the Elder lives (its adds do not count).
  cbBossUp = () => !!(lead && lead.boss && alive(lead));
  // Party focus (4.3): a marked / focused foe, else the foe hitting the most hurt ally, else the most hurt foe.
  function focusFoe() {
    let best = null, bv = Infinity, marked = null;
    let low = -1, lf = 2;
    for (let i = 0; i < nU; i++) { const u = U[i]; if (!u.down && u.hp / u.maxHp < lf) { lf = u.hp / u.maxHp; low = i; } }
    let atLow = null;
    for (const f of foes) {
      if (!alive(f)) continue;
      if ((f.focusT > 0 || f.markT > 0) && !marked) marked = f;
      if (low >= 0 && f.tgt === low && !atLow) atLow = f;
      const v = f.hp / f.max;
      if (v < bv) { bv = v; best = f; }
    }
    if (!marked && lead && lead.boss && alive(lead)) return lead;
    return marked || atLow || best;
  }
  // Melee reach into the enemy formation: the front-most occupied column.
  function frontRow() { let r = -1; for (const f of foes) if (alive(f) && f.row > r) r = f.row; return r; }
  function meleeTarget(pref) {
    const r = frontRow();
    if (pref && alive(pref) && pref.row === r) return pref;
    let best = null, bv = Infinity;
    for (const f of foes) if (alive(f) && f.row === r && f.hp < bv) { bv = f.hp; best = f; }
    return best;
  }
  const foeIdx = f => foes.indexOf(f);

  // ---------------- damage to foes ----------------
  // src: unit index (0 hero) or -1. kind: 'phys' | 'magic' | 'burn' | 'true'. Returns damage dealt.
  const FOE_EV = { mob: null, src: '' };
  cbDamageFoe = (f, amount, src, kind) => {
    if (!alive(f) || !(amount > 0)) return 0;
    let a = amount;
    if (f.armoured && kind === 'phys' && !(f.markT > 0)) { const pr = src >= 0 && U[src] ? U[src].pierce : 0; a *= T.armourX + (1 - T.armourX) * pr; }
    if (f.vulnT > 0) a *= 1.5;
    // Deepwell Duelist: each striker's first hit on a foe always crits (x3 over the average x1.3).
    if (src >= 0 && U[src] && U[src].role === 'striker' && !(f.duel & (1 << src)) && boon('duel')) { f.duel = (f.duel || 0) | (1 << src); a *= 2.3; }
    f.hp -= a; f.hit = 0.08;
    if (src >= 0 && U[src]) {
      const u = U[src];
      f.th[src] += a * u.thX;
      u.dmg += a;
      if (u.key === 'hero') ST.heroDmg += a; else ST.compDmg += a;
    } else ST.compDmg += a;
    if (f.hp <= 0) {
      const over = -f.hp;
      foeDies(f, src, kind);
      // Overkill carries to the next foe (a pack is one old foe's HP split three ways: no hit is wasted
      // on a small foe). Burns, splashes and AoE shares do not carry (carry = false while they land).
      if (carry && over > 0 && !f.hp && anyFoe()) { const n = focusFoe(); if (n && n !== f) { carry = false; cbDamageFoe(n, over / (kind === 'phys' && n.armoured && !(n.markT > 0) ? 1 : 1), src, kind); carry = true; } }
    }
    return a;
  };
  let carry = true;
  function foeDies(f, src, kind) {
    if (typeof onFoeDeath === 'function' && onFoeDeath(f, src, kind)) return;   // 59b: Rattlebones reassemble
    f.over = -f.hp; f.hp = 0; f.dead = 0.001;
    if (!inArena && !f.boss) {
      const g = f.gold; S.gold += g; S.totalGold += g;
      if (g > 0) addFloat('+' + fmt(g) + 'g', '#F2C14E', false, 0.68, 0.3);
    }
    burst(0.68, 0.62, f.pal[1] || f.pal[5] || f.pal[3], 10);
    // Wildfire (a keystone): Embers spread to every foe in the pack at half the count. Deepwell Wildfire:
    // Embers and burns jump to the next foe.
    if ((f.embers > 0 || f.burnT > 0) && (ks('wildfire') || boon('wild'))) {
      const cap = 5 + bonus('tune:embersMax');
      if (ks('wildfire') && f.embers > 0) { for (const o of foes) if (o !== f && alive(o)) o.embers = Math.min(cap, (o.embers || 0) + Math.ceil(f.embers / 2)); }
      else { const o = focusFoe(); if (o && o !== f) { if (f.embers > 0) o.embers = Math.min(cap, (o.embers || 0) + f.embers); if (f.burnT > 0) burn(o, f.burnDps, f.burnT); } }
    }
    // Next in Line (a notable): when a marked foe dies, the next foe starts marked for 4s.
    if (ks('nextMark') && typeof partyClock === 'function' && f.markUntil > partyClock()) { const o = focusFoe(); if (o && o !== f && !(o.markUntil > partyClock())) { o.markUntil = partyClock() + STAR_KS.nextMark.secs; o.markV = f.markV; } }
    FOE_EV.mob = f; FOE_EV.src = src >= 0 && U[src] ? U[src].key : '';
    emit('foeDown', FOE_EV);
    if (typeof onFoeDown === 'function') onFoeDown(f, src);
    // Corvin Cold Work, Isolde reset, Wax Seal are in the damage averages (56b); nothing more here.
    if (f.boss) { for (const o of foes) if (o !== f && alive(o)) { o.gone = true; o.hp = 0; o.dead = 0.001; } }
    if (!anyFoe()) packCleared(f);
    else if (mob === f) showFoe();   // the next foe steps up at once (the hero and taps never wait)
  }

  // Hero hits (50-sim strike -> here). src 'hero' or 'party' (the Lightkeeper's lost damage).
  let heroCrit = false;
  cbStrike = (amount, src, at, label, color, big) => {
    if (!anyFoe()) return;
    const hero = U[0];
    let f = mob && alive(mob) ? mob : focusFoe();
    const isHero = src !== 'party';
    if (isHero && hero && hero.melee) f = meleeTarget(f) || f;
    if (!f) return;
    const kind = isHero && hero && hero.cls === 'lanternmage' ? 'magic' : 'phys';
    const idx = isHero ? 0 : -1;
    // Warden taps taunt their target (a class tap: see the classTap listener).
    const d = cbDamageFoe(f, amount, idx, kind);
    if (isHero && hero && hero.cls === 'lanternmage') {
      const sp = (T.lmSplash + hero.area) * amount;
      carry = ks('overflow');   // Overkill (a notable): the splash's overkill carries too
      for (const o of foes) if (o !== f && alive(o)) cbDamageFoe(o, sp, 0, 'magic');
      carry = true;
    }
    addFloat(label || fmt(d || amount), color, big, at ? at.x : undefined, at ? at.y : undefined);
    burst(0.66, 0.6, big ? '#FFD27A' : '#FFFFFF', big ? 8 : 3, 0.5);
  };

  // ---------------- party actions ----------------
  function companionTick(u, dt) {
    // basic attack
    if (u.dps > 0) {
      u.swing -= dt;
      if (u.swing <= 0) {
        u.swing += 1 / u.spd;
        // supports have no damage ability: their Smite is all of their damage (magic, ignores armour)
        const hit = u.dps * (u.role === 'support' ? 1 : 1 - T.abF) / u.spd;
        if (u.role === 'support') { const f = focusFoe(); if (f) cbDamageFoe(f, hit, u.i, 'magic'); }
        else if (u.role === 'caster') {
          const f = focusFoe(); if (f) {
            cbDamageFoe(f, hit, u.i, 'magic');
            const o = (T.aoeOther + u.area) * hit;
            carry = false;
            for (const x of foes) if (x !== f && alive(x)) cbDamageFoe(x, o, u.i, 'magic');
            carry = true;
            if (u.id === 'thessaly') { cbSlow(f, T.mireSlow, T.mireT * (1 + T.thessTrait) * u.ctrl); }
          }
        } else {
          let f = u.id === 'corvin' ? lowestFoe() : focusFoe();
          if (u.melee && u.id !== 'corvin') { f = meleeTarget(f); u.strikeT = 0.5; }
          // Wren's Mark (56b Marked, real here): strikers deal +20% to the marked foe.
          const mk = f && f.markT > 0 && u.role === 'striker' && SYN_TUNE.real ? 1 + SYN_TUNE.marked : 1;
          if (f) cbDamageFoe(f, hit * mk, u.i, u.id === 'isolde' && f.hp / f.max < T.execTh ? 'true' : 'phys');
          // Bram's Cleave: a second front-row foe takes 50% (Hunting Party: the whole front row, on the marked foe).
          if (f && u.id === 'bram' && SYN_TUNE.real) { const all = synFlags.hunting && f.markT > 0; for (const o of foes) if (o !== f && alive(o) && o.row === f.row) { cbDamageFoe(o, hit * SYN_TUNE.cleave, u.i, 'phys'); if (!all) break; } }
        }
        partyAcc += hit;
      }
    }
    if (u.strikeT > 0) u.strikeT -= dt;
    // healing (supports, and the Lightkeeper hero)
    if (u.heal > 0) {
      u.healT -= dt;
      if (u.healT <= 0) {
        u.healT += 1;
        let amt = u.heal * (u.id === 'hesketh' && u.lv >= 10 && u.fight >= 10 ? 1 + T.longRoute : 1);
        const t = lowestAlly();
        if (t && t.hp < t.maxHp) cbHealUnit(t, amt, u);
      }
    }
    // signature ability
    if (u.id && u.cdMax > 0) {
      u.cd -= dt * u.cdRate;
      if (u.cd <= 0 && anyFoe() && abilityReady(u)) { u.cd = u.cdMax; castAbility_(u); }
    }
    specialTick(u, dt);
  }
  function lowestFoe() { let b = null, v = Infinity; for (const f of foes) if (alive(f) && f.hp / f.max < v) { v = f.hp / f.max; b = f; } return b; }
  function lowestAlly(skip) { let b = null, v = 2; for (let i = 0; i < nU; i++) { const u = U[i]; if (u.down || u === skip) continue; const x = u.hp / u.maxHp; if (x < v) { v = x; b = u; } } return b; }
  function tankUnit() { let b = null; for (let i = 0; i < nU; i++) { const u = U[i]; if (!u.down && u.role === 'tank' && (!b || u.col > b.col)) b = u; } return b; }

  // Heals: overheal becomes a shield only with Warm Light (Hesketh), Ward gear or the Deep Ward boon.
  const HEAL_EV = { key: '', amount: 0, shield: 0 };
  cbHealUnit = (t, amount, from) => {
    if (!t || t.down || !(amount > 0)) return 0;
    if (t.ashenT > 0) return 0;   // Caedmon's Cinder Vow: no healing while Ashen
    const a = amount * t.healIn;
    const room = t.maxHp - t.hp, got = Math.min(room, a);
    t.hp += got;
    let sh = 0;
    const over = a - got;
    if (over > 0 && from) {
      let cap = from.ward;
      if (from.id === 'hesketh') cap = Math.max(cap, (t.id === 'maren' && synFlags.lampward) ? 10 : T.warmCap);
      if (boon('dward')) cap = Math.max(cap, 0.2);
      if (cap > 0) sh = cbShield(t, over, cap);
    }
    ST.healed += got;
    if (from) { from.healed += got + sh; threatSplit(from, (got + sh) * T.healThreat); }
    HEAL_EV.key = t.key; HEAL_EV.amount = got; HEAL_EV.shield = sh;
    if (got + sh > 0) emit('unitHeal', HEAL_EV);
    return got;
  };
  // Adds a shield up to cap x max HP (cap >= 10 means no cap). Returns the shield added.
  cbShield = (t, amount, cap) => {
    if (!t || t.down || !(amount > 0)) return 0;
    const lim = cap >= 10 ? Infinity : cap * t.maxHp;
    const add = Math.max(0, Math.min(amount, lim - t.sh));
    t.sh += add; t.shT = cap >= 10 ? 1e9 : T.shieldT;
    ST.shielded += add;
    return add;
  };
  function threatSplit(from, amt) {
    let n = 0; for (const f of foes) if (alive(f)) n++;
    if (!n || from.i >= 4) return;
    for (const f of foes) if (alive(f)) f.th[from.i] += amt / n;
  }
  function healAll(frac, from) { for (let i = 0; i < nU; i++) if (!U[i].down) cbHealUnit(U[i], U[i].maxHp * frac, from); }
  function shieldAll(frac) { for (let i = 0; i < nU; i++) if (!U[i].down) cbShield(U[i], U[i].maxHp * frac, frac); }
  function cleanse(u) { u.poisonT = 0; u.poisonDps = 0; }

  // Taunt: threat 120% of the top and a forced target for secs, on foes that can reach u.
  cbTaunt = (u, list, secs) => {
    for (const f of list || foes) {
      if (!alive(f)) continue;
      if (!f.ranged && !canReach(f, u)) continue;
      let top = 0; for (let i = 0; i < nU; i++) if (f.th[i] > top) top = f.th[i];
      f.th[u.i] = Math.max(f.th[u.i], top * T.tauntX + 1);
      f.forceT = secs; f.forceU = u.i;
      if (f.diveT > 0 && typeof endDive === 'function') endDive(f);
    }
  };
  cbStun = (f, secs) => {
    if (!alive(f)) return;
    const d = secs;
    f.stunT = Math.max(f.stunT, d);
    if (typeof onFoeStun === 'function') onFoeStun(f);
  };
  function cbSlow(f, v, secs) { if (!alive(f)) return; f.slowV = Math.max(f.slowV, v); f.slowT = Math.max(f.slowT, secs); }
  function knock(f, secs) { if (!alive(f)) return; f.knockT = Math.max(f.knockT, secs); if (f.diveT > 0 && typeof endDive === 'function') endDive(f); }
  function burn(f, dps, secs) { if (!alive(f)) return; f.burnDps = Math.max(f.burnDps, dps); f.burnT = Math.max(f.burnT, secs); }
  const isDiver = f => f.type === 'bat';

  // When should a companion hold its ability? (Aldric keeps Shield Bash for a boss wind-up.)
  function abilityReady(u) {
    const id = u.id;
    if (id === 'hesketh') { const l = lowestAlly(); return !!l && l.hp / l.maxHp < 0.75; }
    if (id === 'elowen' || id === 'anselm') { let hurt = 0; for (let i = 0; i < nU; i++) if (!U[i].down && U[i].hp / U[i].maxHp < 0.7) hurt++; return hurt >= 1; }
    if (id === 'aldric') {
      if (typeof bossTelegraph === 'function') { const t = bossTelegraph(); if (t) return true; }
      if (lead && lead.boss && alive(lead) && typeof nextWindIn === 'function' && nextWindIn() < u.cdMax * 0.6) return false;
      return true;
    }
    // Grenna's Earthshatter stuns: she spends it on a healer's channel (a Marsh Wraith, the Elder Wraith's
    // green wind-up) before she thinks of taunting.
    if (id === 'grenna') {
      if (typeof bossTelegraph === 'function') { const t = bossTelegraph(); if (t && t.kind === 'heal') return true; }
      for (const f of foes) if (alive(f) && f.chanT > 0) return true;
    }
    if (id === 'isolde') { const th = execTh(u); for (const f of foes) if (alive(f) && f.hp / f.max < th) return true; return u.cd < -2; }
    // Tanks taunt when a foe is on a non-tank ally (never off another tank, e.g. a Warden hero), or to save themselves.
    if (u.role === 'tank') { for (const f of foes) if (alive(f) && f.tgt >= 0 && U[f.tgt] && U[f.tgt].role !== 'tank') return true; return u.hp / u.maxHp < 0.5; }
    return true;
  }
  const execTh = u => (u.lv >= 20 ? T.execTh20 : T.execTh) + (synFlags.dusk ? T.duskExec : 0);
  const reach = u => { const l = []; for (const f of foes) if (alive(f) && (f.ranged || canReach(f, u))) l.push(f); return l; };
  const CAST_EV = { key: '', id: '', name: '' };
  function castAbility_(u) {
    ST.abilities++;
    const id = u.id, burstD = u.dps * T.abF * u.cdMax, f0 = focusFoe();
    const hitOne = (f, m, kind) => { if (f) { cbDamageFoe(f, burstD * (m || 1), u.i, kind || 'phys'); partyAcc += burstD * (m || 1); } };
    const hitAll = (m, kind) => { let n = 0; for (const f of foes) if (alive(f)) n++; carry = false; for (const f of foes) if (alive(f)) cbDamageFoe(f, burstD * (m || 1) / Math.max(1, n) * (1 + (n - 1) * 0.5), u.i, kind || 'magic'); carry = true; partyAcc += burstD * (m || 1); };
    switch (id) {
      case 'tobin': {
        cbTaunt(u, reach(u), T.tauntT); u.drV = Math.max(u.drV, T.guardDr); u.drT = T.guardT;
        if (u.lv >= 20) { const a = adjacent(u); if (a) { a.drV = Math.max(a.drV, T.guardDr); a.drT = T.guardT; } }
        if (synFlags.hedge3) for (let i = 0; i < nU; i++) { const x = U[i]; if (x.id && HEDGE(x.id)) cbShield(x, x.maxHp * T.hedgeSh, T.hedgeSh); }
        break;
      }
      case 'wren': { const f = f0; hitOne(f, 1); if (f) { f.markT = (synFlags.hunting ? 8 : 5) * u.ctrl; } if (u.lv >= 20) { const o = foes.find(x => x !== f && alive(x)); hitOne(o, 0.5); } break; }
      case 'hesketh': { const a = lowestAlly(); if (a) cbHealUnit(a, a.maxHp * T.mend * healMul(u), u); if (u.lv >= 20) { const b = lowestAlly(a); if (b) cbHealUnit(b, b.maxHp * T.mend * healMul(u), u); } break; }
      case 'pip': { hitAll(1, 'magic'); for (const f of foes) burn(f, u.dps * 0.2, T.burnT * u.ctrl); break; }
      case 'bram': { const f = meleeTarget(f0); hitOne(f, 1); if (u.lv >= 10 && f) knock(f, 1 * u.ctrl); if (u.lv >= 20) for (const o of foes) if (o !== f && alive(o) && f && o.row === f.row) hitOne(o, 0.5); break; }
      case 'maren': {
        cbTaunt(u, foes, 4); cbHealUnit(u, u.maxHp * (synFlags.lampward ? T.beaconLamp : T.beacon), u);
        if (u.lv >= 20) shieldAll(T.beaconSh);
        break;
      }
      case 'aldric': {
        const f = (lead && lead.boss && alive(lead)) ? lead : meleeTarget(f0) || f0;
        if (typeof resolveParry === 'function' && f && f.boss) resolveParry('bash');   // before the stun: a bash is a parry, not an interrupt
        if (u.lv >= 20) hitAll(1, 'phys'); else hitOne(f, 1);
        if (f) cbStun(f, T.bashStun * u.ctrl);
        break;
      }
      case 'kestrel': {
        let f = null; for (const x of foes) if (alive(x) && isDiver(x) && (x.diveT > 0 || x.row < 2)) { f = x; break; }
        if (synFlags.markleap) for (const x of foes) if (alive(x) && x.markT > 0) { f = x; break; }
        f = f || f0;
        hitOne(f, synFlags.markleap ? 1.5 : 1); if (u.lv >= 20) hitOne(f, 1);
        for (const x of foes) knock(x, T.leapKnock * u.ctrl);
        u.untarg = T.leapUntarg;
        break;
      }
      case 'thessaly': {
        for (const f of foes) { cbSlow(f, T.sinkSlow, T.sinkT * (1 + T.thessTrait) * u.ctrl); if (f.diveT > 0 && typeof endDive === 'function') endDive(f); if (u.lv >= 20 && isDiver(f)) cbStun(f, T.sinkStun * u.ctrl); }
        hitAll(1, 'magic');
        break;
      }
      case 'anselm': { healAll(T.arms * healMul(u), u); if (u.lv >= 20) for (let i = 0; i < nU; i++) cleanse(U[i]); break; }
      case 'grenna': {
        cbTaunt(u, foes, T.tauntT); const r = frontRow();
        for (const f of foes) if (alive(f) && (f.row === r || (u.lv >= 20 && f.row === r - 1))) { cbStun(f, T.shatterStun * u.ctrl); }
        hitAll(1, 'phys');
        break;
      }
      case 'isolde': {
        const th = execTh(u); let f = null; for (const x of foes) if (alive(x) && x.hp / x.max < th) { f = x; break; }
        const tg = f || f0; const hpBefore = tg ? tg.hp : 0;
        hitOne(tg, f ? 2 : 0.6, 'true');
        if (f && tg && tg.hp <= 0 && hpBefore > 0) u.cd = 0.5;   // Unfinished Business
        break;
      }
      case 'oriel': { hitAll(1, 'magic'); for (const f of foes) { cbSlow(f, T.starSlow, T.starSlowT * u.ctrl); cbStun(f, T.starStun * u.ctrl); } break; }
      case 'morwen': { for (const f of foes) { burn(f, u.dps * 0.5, T.vigilT * u.ctrl); if (u.lv >= 20) cbSlow(f, T.vigilSlow, T.vigilT * u.ctrl); } hitAll(0.5, 'magic'); break; }
      case 'vesper': {
        for (let i = 0; i < nU; i++) { const x = U[i]; if (x.down) continue; cbShield(x, x.maxHp * T.verseWard * 2, T.verseWard * 2); cbHealUnit(x, x.maxHp * T.verseMend * 2 * healMul(u), u); }
        if (u.lv >= 20) { let b = null; for (let i = 0; i < nU; i++) if (U[i].id && U[i] !== u && (!b || U[i].cd > b.cd)) b = U[i]; if (b) b.cd = 0; }
        break;
      }
      case 'elowen': { healAll(T.sanct * healMul(u), u); for (let i = 0; i < nU; i++) { U[i].hotT = T.sanctT; U[i].hotV = T.sanctHot * healMul(u); if (u.lv >= 20 || synFlags.oldoath && false) cleanse(U[i]); } break; }
      case 'caedmon': {
        cbTaunt(u, foes, 4); u.reflT = T.pyreT;
        if (u.lv >= 20) { const a = adjacent(u); if (a) cbShield(a, a.maxHp * T.pyreSh, T.pyreSh); }
        break;
      }
      case 'corvin': {
        const f = lowestFoe(); const before = f ? f.hp : 0; hitOne(f, 1.2, 'phys');
        if (f && f.hp <= 0 && before > 0) u.cd = u.cdMax / 2;
        if (u.lv >= 20) { const g = lowestFoe(); hitOne(g, 0.6, 'phys'); }
        break;
      }
      default: hitOne(f0, 1);
    }
    CAST_EV.key = u.key; CAST_EV.id = id; CAST_EV.name = id;
    emit('unitAbility', CAST_EV);
  }
  const healMul = u => u.heal > 0 && u.hpP > 0 ? u.heal / (T.heal * u.hpP) : 1;
  // Adjacent (4.2): same lane next column, or same column other lane.
  function adjacent(u) {
    for (let i = 0; i < nU; i++) { const x = U[i]; if (x === u || x.down) continue; if ((x.lane === u.lane && Math.abs(x.col - u.col) === 1) || (x.col === u.col && x.lane !== u.lane)) return x; }
    return null;
  }
  // Per-unit timers and specialities that tick.
  function specialTick(u, dt) {
    u.fight += dt;
    if (u.id === 'anselm') {
      u.tollT += dt;
      const per = u.lv >= 10 ? T.tollP10 : T.tollP;
      if (u.tollT >= per) { u.tollT = 0; for (let i = 0; i < nU; i++) { const x = U[i]; if (!x.down && x.hp / x.maxHp < T.tollAt) cbShield(x, x.maxHp * T.tollSh, T.tollSh); } }
    }
    if (u.id === 'vesper') {
      u.verseT += dt;
      if (u.verseT >= T.verseP / 3) {
        u.verseT = 0; u.verse = (u.verse + 1) % 3;
        const m = synFlags.bellsong ? 1.5 : 1;
        if (u.verse === 1) shieldAll(T.verseWard * m);
        else if (u.verse === 2) healAll(T.verseMend * m * healMul(u), u);
      }
    }
  }

  // ---------------- foes act ----------------
  // Can foe f attack unit u (melee reach, 4.2)? Melee reaches the party's front-most occupied column
  // (melee strikers count as Front while they strike); Corvin cannot be hit by melee while he strikes.
  function partyFront() {
    let c = -1;
    for (let i = 0; i < nU; i++) { const u = U[i]; if (u.down || u.untarg > 0) continue; const col = u.strikeT > 0 ? 2 : u.col; if (col > c) c = col; }
    return c;
  }
  let frontC = 2;
  function canReach(f, u) {
    if (u.down || u.untarg > 0) return false;
    if (f.ranged || f.diveT > 0) return true;
    if (u.id === 'corvin') { for (let i = 0; i < nU; i++) if (U[i] !== u && !U[i].down) return false; }
    const col = u.strikeT > 0 ? 2 : u.col;
    return col >= frontC;
  }
  function pickTarget(f) {
    if (f.forceT > 0 && f.forceU >= 0 && U[f.forceU] && !U[f.forceU].down && canReach(f, U[f.forceU])) return f.forceU;
    if (f.diveT > 0 && f.diveU >= 0 && U[f.diveU] && !U[f.diveU].down) return f.diveU;
    // Bruisers go for a tank that holds threat (4.7).
    let best = -1, bv = -1;
    const cur = f.tgt >= 0 && U[f.tgt] && canReach(f, U[f.tgt]) ? f.tgt : -1;
    for (let i = 0; i < nU; i++) {
      const u = U[i];
      if (!canReach(f, u)) continue;
      let v = f.th[i] + 1e-9 * (u.role === 'tank' ? 2 : 1);
      if (f.type === 'beetle' && u.role === 'tank') v *= 2;
      if (v > bv) { bv = v; best = i; }
    }
    if (cur >= 0 && best !== cur && !(bv > f.th[cur] * T.switchX)) return cur;
    return best;
  }
  function foeTick(f, dt) {
    if (f.dead) { f.dead += dt; return; }
    f.born += dt; if (f.hit > 0) f.hit -= dt;
    if (f.burnT > 0) { f.burnT -= dt; carry = false; cbDamageFoe(f, f.burnDps * dt, -1, 'burn'); carry = true; if (!alive(f)) return; }
    if (emberBurn > 0 && f.embers > 0) { carry = false; cbDamageFoe(f, f.embers * emberBurn * dt, 0, 'burn'); carry = true; if (!alive(f)) return; }
    if (f.markT > 0) f.markT -= dt;
    if (f.focusT > 0) f.focusT -= dt;
    if (f.vulnT > 0) f.vulnT -= dt;
    if (f.forceT > 0) f.forceT -= dt;
    if (f.slowT > 0) { f.slowT -= dt; if (f.slowT <= 0) f.slowV = 0; }
    if (f.stunT > 0) { f.stunT -= dt; return; }
    if (typeof onEnemyTick === 'function' && onEnemyTick(f, dt)) return;   // 59b: behaviours, channels, boss mechanics
    if (f.knockT > 0) { f.knockT -= dt; return; }
    f.swing -= dt * (1 - f.slowV);
    const t = pickTarget(f);
    f.tgt = t;
    if (t >= 0) {
      ST.enemySecs += dt; if (U[t].role === 'tank') ST.tankSecs += dt;
    }
    if (f.swing > 0) return;
    f.swing += 1 / f.spd;
    if (t < 0) return;
    if (typeof onFoeAttack === 'function' && onFoeAttack(f, U[t])) return;   // 59b: slams, dives
    cbHitUnit(U[t], f.atk * (f.diveT > 0 ? f.diveX || 1 : 1), f.ranged ? 'ranged' : 'hit', f);
  }

  // ---------------- damage to the party ----------------
  const HIT_EV = { key: '', amount: 0, kind: '', foe: null, blocked: false, shield: 0 };
  const DOWN_EV = { key: '' }, UP_EV = { key: '', hp: 0 };
  // kind: hit | ranged | heavy | cloud | slam | dive | poison | burn. Returns the HP lost.
  cbHitUnit = (u, amount, kind, f) => {
    if (!u || u.down || !(amount > 0)) return 0;
    // Aldric's Intercept: he takes the hits meant for an ally below 25% (3 hits, once per ally per pack).
    if (f && (kind === 'hit' || kind === 'ranged' || kind === 'dive' || kind === 'heavy')) {
      const al = upHas('aldric');
      if (al && al !== u && al.icFor === u.i && al.icLeft > 0) { al.icLeft--; u = al; }
    }
    let a = amount;
    const area = kind === 'cloud' || kind === 'slam';
    if (kind !== 'poison' && kind !== 'burn') a *= 1 - red(u.armour);
    // damage reduction stack
    let dr = 1;
    if (S.party && S.party.cls === 'warden') dr *= 1 - T.wardenDr;
    if (has('caedmon')) dr *= 1 - T.unburnt;
    if (wallUntil > clock) dr *= 1 - T.wall;
    if (u.i === 0 && challUntil > clock) dr *= 1 - 0.2;   // Challenger: 20% less while taunting
    if (u.drT > 0) dr *= 1 - u.drV;
    if (u.id === 'tobin') dr *= 1 - Math.min(T.trustMax, u.trust);
    if (u.id === 'grenna') { dr *= 1 - u.rock; if (kind === 'heavy' || kind === 'slam') dr *= 1 - T.bedrock; }
    if (synFlags.hearthTank === u.key) dr *= 1 - T.hearthDr;
    if (u.role === 'tank') dr *= 1 - T.tankDr;   // BAL2: tanks shrug off hits (a no-tank line-up holds 2-4 zones lower, T6)
    if (u.role === 'tank' && setOnC('guard')) dr *= 1 - 0.25;
    if (f && f.slowT > 0 && upHas('thessaly') && upHas('thessaly').lv >= 10) dr *= 1 - T.deepWater;
    if ((kind === 'ranged' || area) && u.col === 0) dr *= 1 - T.backRanged;
    // Cover: a tank in Front covers the ally right behind it (same lane).
    if (u.role !== 'tank' && u.col < 2) { for (let i = 0; i < nU; i++) { const x = U[i]; if (!x.down && x.role === 'tank' && x.col === 2 && x.lane === u.lane) { dr *= 1 - T.cover; break; } } }
    if (kind === 'burn' && has('caedmon')) dr = 0;
    a *= dr;
    let blocked = false;
    if (u.blockP > 0 && kind !== 'poison' && kind !== 'burn' && Math.random() < u.blockP) { a *= T.blockX; blocked = true; ST.blocked++; }
    let sh = 0;
    if (u.sh > 0) { sh = Math.min(u.sh, a); u.sh -= sh; a -= sh; }
    u.hp -= a; u.taken += a + sh; ST.taken += a + sh;
    // reflects and burns back
    if (f && alive(f)) {
      let back = 0;
      if (u.id === 'maren' || u.id === 'caedmon') back += (a + sh) * T.burnBack * (u.id === 'maren' && synFlags.mirelamp && f.slowT > 0 ? 2 : 1);
      if (u.reflT > 0) back += (a + sh) * T.pyre;
      if (u.role === 'tank' && boon('thorn')) back += (a + sh) * 0.3;
      if (back > 0) { carry = false; cbDamageFoe(f, back, u.i, 'burn'); carry = true; }
    }
    if (u.id === 'grenna') { u.rock = Math.min(T.rockMax, u.rock + T.rock); u.rockT = T.rockT; }
    if (u.hp <= 0) {
      if (u.ashenT > 0) u.hp = 1;
      else if (u.id === 'tobin' && u.lv >= 10 && !u.stubborn) { u.stubborn = true; u.hp = 1; }
      else if (u.id === 'caedmon' && !u.vow) { u.vow = true; u.hp = 1; u.ashenT = T.vowT; cbTaunt(u, foes, T.vowT); }
      else if (boon('life') && !u.lifeline && (typeof dcLifeline !== 'function' || dcLifeline(u))) { u.lifeline = true; u.hp = 1; }
      else knockOut(u);
    } else if (u.hp < u.maxHp * T.interceptAt) {
      const al = upHas('aldric');
      if (al && al !== u && !(al.icUsed & (1 << u.i)) && (u.col >= 1 || synFlags.oldenemies && u.id === 'corvin' || isAdj(al, u))) {
        al.icUsed |= 1 << u.i; al.icFor = u.i; al.icLeft = T.intercept;
        if (synFlags.oldoath) cbHealUnit(u, u.maxHp * T.oathHeal, al);
      }
    }
    HIT_EV.key = u.key; HIT_EV.amount = a; HIT_EV.kind = kind; HIT_EV.foe = f; HIT_EV.blocked = blocked; HIT_EV.shield = sh;
    emit('unitHit', HIT_EV);
    return a;
  };
  const isAdj = (a, b) => (a.lane === b.lane && Math.abs(a.col - b.col) === 1) || (a.col === b.col && a.lane !== b.lane);
  function knockOut(u) {
    u.hp = 0; u.down = true; u.sh = 0; packDown = true; ST.kos++;
    for (const f of foes) { f.th[u.i] = 0; if (f.tgt === u.i) f.tgt = -1; }
    DOWN_EV.key = u.key; emit('unitDown', DOWN_EV);
    let up = 0; for (let i = 0; i < nU; i++) if (!U[i].down) up++;
    if (!up) wipe();
  }
  function standUp(u, frac) {
    if (!u.down) return;
    u.down = false; u.hp = u.maxHp * frac; ST.revives++;
    UP_EV.key = u.key; UP_EV.hp = u.hp; emit('unitUp', UP_EV);
  }

  // ---------------- pack end, wipe, push back ----------------
  function packCleared(last) {
    const vigil = upHas('elowen');
    for (let i = 0; i < nU; i++) {
      const u = U[i];
      if (u.down) standUp(u, vigil ? T.reviveVigil : T.revive);
      else u.hp = Math.min(u.maxHp, u.hp + u.maxHp * T.packHealF * (vigil ? 2 : 1));
      if (u.id === 'tobin') u.trust = packDown ? 0 : Math.min(T.trustMax, u.trust + T.trustStep);
      u.stubborn = false; u.vow = false; u.icUsed = 0; u.icLeft = 0; u.icFor = -1; u.fight = 0;
    }
    packDown = false;
    if (inArena) { mob = last; last.hp = -(last.over || 0); kill(); return; }
    S.totalKills++;   // a pack counts as one foe (Foes slain, achievements, the Bestiary unlock)
    // the pack pays as one foe: 50-sim killPack does the rest of the old kill()
    const m = lead || last;
    if (m.boss) { S.gold += m.gold; S.totalGold += m.gold; addFloat('+' + fmt(m.gold) + 'g', '#F2C14E', false, 0.68, 0.3); }
    mob = last;
    killPack(m, m.boss ? m.gold : packGold);
  }
  const WIPE_EV = { zone: 0, to: 0, boss: false, arena: false };
  function wipe() {
    ST.wipes++;
    const z = S.zone;
    WIPE_EV.zone = z; WIPE_EV.boss = !!fightBoss; WIPE_EV.arena = !!inArena;
    wipeT = T.wipeT; wipeBoss = !!fightBoss;
    if (inArena) { WIPE_EV.to = z; emit('wipe', WIPE_EV); return; }   // 59c-deepwell-combat ends the run
    if (fightBoss) {
      fightBoss = false; failDps = totalDps();
      toast('Your party fell to the zone boss. Grow stronger and try again.', 'raid');
      emit('bossFail', { zone: z, dps: failDps });
      WIPE_EV.to = z;
    } else {
      const to = Math.max(1, z - 1);
      if (to < z) { S.combat.back = Math.max(S.combat.back || 0, z); S.zone = to; }
      backWipes = backZone === z ? backWipes + 1 : 1; backZone = z; backAt = clock;
      WIPE_EV.to = to;
      toast('Your party fell back to regroup.', 'raid', null, 'normal');
    }
    for (const f of foes) { f.gone = true; f.dead = f.dead || 0.001; }
    if (mob && !mob.dead) mob.dead = 0.001;
    emit('sceneReset');
    emit('wipe', WIPE_EV);
  }
  function endWipe() {
    for (let i = 0; i < nU; i++) { const u = U[i]; u.down = false; u.hp = u.maxHp; u.sh = 0; u.poisonT = 0; u.fight = 0; UP_EV.key = u.key; UP_EV.hp = u.hp; emit('unitUp', UP_EV); }
    if (inArena) return;
    spawn();
  }
  // The party whole again (59c-deepwell-combat: a Deepwell run starts or ends). clear: the arena's foes
  // are set aside too (a wipe ends the run with the pack still standing).
  cbRestore = clear => {
    wipeT = 0;
    if (clear) { for (const f of foes) { if (typeof onFoeDown === 'function') onFoeDown(f); f.gone = true; f.hp = 0; f.dead = f.dead || 0.001; } foes = []; lead = null; inArena = false; }
    for (let i = 0; i < nU; i++) { const u = U[i], was = u.down; u.down = false; u.hp = u.maxHp; u.sh = 0; u.poisonT = 0; u.lifeline = false; if (was) { UP_EV.key = u.key; UP_EV.hp = u.hp; emit('unitUp', UP_EV); } }
  };
  let backZone = 0, backAt = 0, backWipes = 0;
  // After a wipe the party climbs back one zone at a time, up to where it fell, once it can hold the next zone.
  cbPush = () => {
    const back = S.combat && S.combat.back || 0;
    if (!back || fightBoss || arena || target() !== 'mob') return 0;
    if (S.zone >= Math.min(back, S.maxZone)) { S.combat.back = 0; return 0; }
    // BAL2: the estimate is careful, so the party also tries again after pushRetry s (doubling with each
    // wipe at that zone, up to 8x): a zone it can hold live is never walled by a pessimistic estimate.
    if (!partyHolds(S.zone + 1) && !(S.zone + 1 === backZone && clock - backAt >= T.pushRetry * Math.min(8, Math.pow(2, backWipes - 1)))) return 0;
    ST.pushes++;
    setZone(S.zone + 1);
    if (S.zone >= Math.min(back, S.maxZone)) S.combat.back = 0;
    return S.zone;
  };

  // ---------------- the tick ----------------
  cbHeroUp = () => !partyCombatOn() || !(nU > 0) || (!U[0].down && wipeT <= 0);
  combatTick = dt => {
    clock += dt;
    if (arena && mob && mob.deep && !mob.th && !mob.dead) adoptArena(mob);
    if (wipeT > 0) { wipeT -= dt; for (const f of foes) if (f.dead) f.dead += dt; if (wipeT <= 0) endWipe(); return; }
    refreshT -= dt;
    if (refreshT <= 0) { refreshT = T.refresh; refreshUnits(false); }
    if (!nU) refreshUnits(true);
    pushT += dt;
    if (pushT >= T.pushEvery) { pushT = 0; cbPush(); }
    if (!anyFoe()) { for (const f of foes) if (f.dead) f.dead += dt; return; }
    packT += dt;
    frontC = partyFront();
    // party
    for (let i = 0; i < nU; i++) {
      const u = U[i];
      if (u.down) continue;
      if (u.hp < u.maxHp) u.hp = Math.min(u.maxHp, u.hp + u.maxHp * T.regen * dt);
      if (u.shT > 0) { u.shT -= dt; if (u.shT <= 0) u.sh = 0; }
      if (u.drT > 0) u.drT -= dt;
      if (u.untarg > 0) u.untarg -= dt;
      if (u.reflT > 0) u.reflT -= dt;
      if (u.ashenT > 0) u.ashenT -= dt;
      if (u.rockT > 0) { u.rockT -= dt; if (u.rockT <= 0) u.rock = 0; }
      if (u.hotT > 0) { u.hotT -= dt; cbHealUnit(u, u.maxHp * u.hotV * dt, null); }
      if (u.poisonT > 0) { u.poisonT -= dt; cbHitUnit(u, u.poisonDps * dt, 'poison', null); if (u.down) continue; }
      if (i === 0) heroTick(u, dt); else companionTick(u, dt);
      if (!anyFoe()) break;
    }
    if (!anyFoe()) return;
    // foes
    for (let i = 0; i < foes.length; i++) foeTick(foes[i], dt);
    if (!(mob && alive(mob))) showFoe();
    partyTickT += dt;
    if (partyTickT >= 0.6) { if (partyAcc > 0) addFloat(fmt(partyAcc), '#B58CFF', false, 0.76 + (Math.random() - 0.5) * 0.1, 0.55); partyAcc = 0; partyTickT = 0; }
  };
  function heroTick(u, dt) {
    u.fight += dt;
    // Sanctuary Hymn: while Rally Hymn is up it heals the party 5% of max HP a second.
    if (u.cls === 'lightkeeper' && ks('sanctuary') && typeof partyHymnOn === 'function' && partyHymnOn()) for (let i = 0; i < nU; i++) if (!U[i].down) cbHealUnit(U[i], U[i].maxHp * 0.05 * dt, u);
    if (u.heal > 0) {
      u.healT -= dt;
      if (u.healT <= 0) { u.healT += 1; const t = lowestAlly(); if (t && t.hp < t.maxHp) cbHealUnit(t, u.heal, u); }
    }
  }

  // ---------------- hero class hooks (55-party events) ----------------
  let wallUntil = -1;
  cbWallOn = () => wallUntil > clock;
  on('ability', ({ cls }) => {
    if (!partyCombatOn() || !nU) return;
    if (cls === 'warden') { wallUntil = clock + T.wallT; if (typeof resolveParry === 'function') resolveParry('wall'); }
    else if (cls === 'lightkeeper') { healAll(T.hymnHeal, U[0]); for (let i = 1; i < nU; i++) if (U[i].cdMax) U[i].cd -= U[i].cdMax * T.hymnCd; }
    else if (cls === 'lanternmage' && synFlags.chosen) { let n = 0; for (const f of foes) if (alive(f)) n++; healAll(T.chosenHeal * n, U[0]); }
  });
  on('classTap', ({ cls, kind, auto }) => {
    if (!partyCombatOn() || !nU || kind === 'parry') return;
    if (cls === 'warden' && mob && alive(mob)) {
      cbTaunt(U[0], [mob], (T.wardenTaunt + (boon('taunt') ? 2 : 0)) * (auto ? 0.5 : 1));
      if (ks('challenger')) { cbTaunt(U[0], foes, 2); challUntil = clock + 2; }   // Challenger: taps taunt every foe for 2s
    }
    else if (cls === 'lightkeeper') { const t = lowestAlly(); if (t && t.hp / t.maxHp < (auto ? 0.6 : 1)) cbHealUnit(t, t.maxHp * T.lkTap * (auto ? 0.5 : 1), U[0]); }
    else if (cls === 'ranger' && mob && alive(mob)) mob.focusT = 8;
  });
  on('deepFloor', () => { const m = boon('mend'); if (m && nU) healAll(0.1 * m, null); for (let i = 0; i < nU; i++) U[i].lifeline = false; });
  on('fieldChange', () => { refreshT = 0; });
  on('classChosen', () => { refreshT = 0; fieldSig = ''; });
  on('sceneReset', () => { showT = 0; });

  // ---------------- HUD hooks ----------------
  const HP_OUT = {}, CD_OUT = {};
  cbUnitHp = key => {
    const u = cbUnitByKey(key); if (!u) return null;
    const o = HP_OUT[key] || (HP_OUT[key] = { hp: 0, max: 1, shield: 0, down: false });
    o.hp = Math.max(0, u.hp); o.max = u.maxHp; o.shield = u.sh; o.down = u.down;
    return o;
  };
  cbUnitCd = key => {
    const u = cbUnitByKey(key); if (!u || !u.id || !(u.cdMax > 0)) return null;
    const o = CD_OUT[key] || (CD_OUT[key] = { t: 0, max: 1 });
    o.t = Math.max(0, u.cd); o.max = u.cdMax;
    return o;
  };
  cbDebug = () => {
    let s = 'units ';
    for (let i = 0; i < nU; i++) { const u = U[i]; s += `${u.key}:${u.role[0]} ${Math.round(100 * u.hp / u.maxHp)}%${u.down ? 'X' : ''} `; }
    s += `| foes ${foes.filter(alive).length} | tank ${(ST.tankSecs / Math.max(1, ST.enemySecs) * 100).toFixed(0)}% wipes ${ST.wipes} kos ${ST.kos}`;
    return s;
  };

  // ---------------- closed-form hold estimate (4.11, C3) ----------------
  // For z = zMax down to zMax - 10 (or just z with opts.one): damage rate, who gets hit, incoming
  // damage and sustain; the highest z that holds (and can be farmed) wins. Also drives auto-push.
  const EST_OUT = { zone: 1, holds: false, dps: 0, packSecs: 0, packsPerSec: 0, goldPerSec: 0, tgt: '', inc: 0, sus: 0, margin: 0 };
  function estUnits() {
    readSyn();
    const ids = fieldIds();
    readPartyP(ids);
    let n = 0;
    for (const key of ['hero'].concat(ids)) { const u = EST[n++]; statUnit(u, key, false); u.down = false; }
    for (let i = n; i < 4; i++) EST[i].live = false;
    return n;
  }
  // Behaviour table per zone type (4.11), from FOE_BEH: dmg (attack x speed vs a plain foe, plus the
  // Golem's slam), ranged (hits any row by threat), arm (armoured: physical damage x armourX), aoe
  // (party-wide damage per foe per second, as a share of its attack: spore clouds), heal (enemy
  // healers add effective HP), dive (Cave Bats: extra damage on the back row).
  const BEH_EST = [
    { dmg: 1, ranged: 0, arm: 0, aoe: 0, heal: 0, dive: 0 }, { dmg: 1, ranged: 0, arm: 0, aoe: 0, heal: 0, dive: 0.3 },
    { dmg: 1, ranged: 1, arm: 1, aoe: 0, heal: 0.1, dive: 0 }, { dmg: 1.8 * 0.75, ranged: 0, arm: 0, aoe: 0, heal: 0, dive: 0 },
    { dmg: 1, ranged: 1, arm: 0, aoe: 0.8 / 6, heal: 0, dive: 0, pois: 1 }, { dmg: 2.5 * 0.5 * 1.33, ranged: 0, arm: 1, aoe: 0, heal: 0, dive: 0 },
    { dmg: 1, ranged: 1, arm: 0, aoe: 0, heal: 0.15, dive: 0 }
  ];
  const AB_HEAL = { hesketh: u => T.mend * (u.lv >= 20 ? 1.5 : 1), anselm: () => T.arms, elowen: () => T.sanct + T.sanctHot * T.sanctT,
    vesper: () => 2 * (T.verseMend + T.verseWard) };
  const thrRate = (u, i) => (i === 0 ? heroDps() : u.dps) * u.thX * (u.role === 'tank' ? 3 : 1) + u.heal * T.healThreat;
  const EST_T = [null, null];
  partyHoldEstimate = (zMax, opts) => {
    if (!(zMax >= 1)) zMax = Math.max(1, S.maxZone || 1);   // no zone: from the best zone down (the Watchtower hint)
    const o = opts || {}, n = estUnits();
    const hero = EST[0];
    const heroD = heroDps() * T.autoCast * (hero.cls === 'lanternmage' ? 1 + (T.lmSplash + hero.area) * 0.9 : 1);
    let compPhys = 0, compMagic = 0, heal = 0, top = null, topT = -1, front = null, frontT = -1, fc = -1;
    for (let i = 1; i < n; i++) {
      const u = EST[i];
      if (u.role === 'caster') compMagic += u.dps * (1 + (T.aoeOther + u.area) * 0.9); else if (u.role === 'support') compMagic += u.dps; else compPhys += u.dps;
    }
    for (let i = 0; i < n; i++) { heal += EST[i].heal; if (EST[i].col > fc) fc = EST[i].col; }
    // BAL2: support abilities heal a share of the target's max HP per cast (Mend, Call to Arms, Sanctuary,
    // Verse), and the Lightkeeper's auto-cast Rally Hymn heals everyone: a share of max HP a second.
    let abHeal = 0;
    for (let i = 1; i < n; i++) { const u = EST[i], f = AB_HEAL[u.id]; if (f && u.cdMax > 0) abHeal += f(u) * healMul(u) / u.cdMax; }
    if (hero.cls === 'lightkeeper' && S.maxZone >= 10) abHeal += T.hymnHeal / (HERO_CLASSES.lightkeeper.ability.cd * mod('abilityCd') * 2);
    // who gets hit: melee foes the highest-threat member of the front-most column, ranged foes the highest threat overall
    for (let i = 0; i < n; i++) {
      const u = EST[i], tr = thrRate(u, i);
      if (tr > topT) { topT = tr; top = u; }
      if (u.col === fc && tr > frontT) { frontT = tr; front = u; }
    }
    let dr0 = 1;
    if (S.party && S.party.cls === 'warden') dr0 *= 1 - T.wardenDr;
    for (let i = 1; i < n; i++) if (EST[i].id === 'caedmon') dr0 *= 1 - T.unburnt;
    const drOf = u => dr0 * (synFlags.hearthTank === u.key ? 1 - T.hearthDr : 1) * (u.role === 'tank' ? 1 - T.tankDr : 1);
    EST_T[0] = front; EST_T[1] = top === front ? null : top;
    let best = null;
    const lo = o.one ? zMax : Math.max(1, zMax - 10);
    for (let z = zMax; z >= lo; z--) {
      const b = BEH_EST[zoneType(z)], mix = BEH_EST[zoneNextType(z)], w = k => T.mixP * b[k] + (1 - T.mixP) * mix[k];
      const physX = 1 - w('arm') * (1 - T.armourX), fheal = w('heal');
      const heroPhys = hero.cls === 'lanternmage' ? 1 : physX;
      const D = (heroD * heroPhys + compPhys * physX + compMagic) * T.estEff;
      const packHp = mobHp(z) * T.packHp * mod('foeHp') * (1 + fheal);
      let packSecs = D > 0 ? packHp / D + T.respawn : Infinity;
      const atk = zoneAtk(z), alive = 1.5, rng = w('ranged'), dmgX = w('dmg');
      // melee share on `front`, ranged share on `top` (the back row takes 20% less from ranged), spread on everyone
      const spread = w('aoe') * atk * alive * T.spd;
      // spore poison: a share of max HP per second while any Spore Cap's cloud is on (it does not stack)
      const pois = w('pois') ? ENEMY_TUNE.poison * Math.min(1, alive * w('pois') * ENEMY_TUNE.poisonT / ENEMY_TUNE.cloudEvery) : 0;
      let holds = true, worst = 99, incMax = 0;
      for (let k = 0; k < 2; k++) {
        const u = EST_T[k]; if (!u) continue;
        let inc = spread + pois * u.maxHp + w('dive') * atk * (u.col === 0 ? 1 : 0), share = 0;
        if (u === front) { inc += alive * atk * T.spd * dmgX * (1 - rng) * (1 - red(u.armour)) * drOf(u); share += 1 - rng; }
        if (u === top) { inc += alive * atk * T.spd * dmgX * rng * (1 - red(u.armour)) * drOf(u) * (u.col === 0 ? 1 - T.backRanged : 1); share += rng; }
        // healing follows the damage: a support heals whoever is hit, in proportion
        const sus = (heal * Math.min(1, share) + abHeal * u.maxHp) * u.healIn + u.maxHp * (T.regen + T.packHealF / packSecs);
        const net = inc * T.estSafety - sus;   // estSafety: headroom for bad packs (elites, three spore clouds at once)
        if (!(net <= 0 || u.maxHp / net >= T.holdSecs)) holds = false;
        worst = Math.min(worst, inc > 0 ? sus / inc : 99); incMax = Math.max(incMax, inc);
      }
      // The rest of the party only meets the spread (spore clouds): a member it knocks out is down for
      // the rest of each pack (they stand up between packs), so its damage is lost for that share.
      let lost = 0;
      if (spread > 0) for (let i = 0; i < n; i++) {
        const u = EST[i]; if (u === front || u === top) continue;
        const net = spread * (u.col === 0 ? 1 - T.backRanged : 1) + u.maxHp * (pois - T.regen);
        const ttd = net > 0 ? u.maxHp / net : Infinity;
        if (ttd < packSecs) lost += (i === 0 ? heroD * heroPhys : u.dps * (u.role === 'caster' ? 1 : physX)) * (1 - ttd / packSecs);
      }
      if (lost > 0) { const D2 = Math.max(D * 0.1, D - lost * T.estEff); packSecs = packHp / D2 + T.respawn; }
      // opts.sustain: sustain only (T6 compares line-ups by what they survive, not by how fast they kill)
      if (!o.sustain) holds = holds && packSecs - T.respawn <= PACE.farmSecs * T.packHp;
      if (holds || o.one) {
        const z0 = S.zone; S.zone = z;   // gold bonuses read the current zone (mastery stars)
        let g = mobGold(z) * T.packGold;
        S.zone = z0;
        if (z >= T.eliteFrom) g *= 1 + T.eliteP * (T.eliteGold - 1) / T.packSize;
        if (typeof champChance === 'function') g *= 1 + champChance(z) * 2 / T.packSize;
        best = EST_OUT;
        best.zone = z; best.holds = holds; best.dps = D; best.packSecs = packSecs; best.packsPerSec = Number.isFinite(packSecs) && packSecs > 0 ? 1 / packSecs : 0;
        best.goldPerSec = best.packsPerSec * g; best.tgt = (front || hero).key; best.inc = incMax; best.sus = heal;
        best.margin = worst;
        break;
      }
    }
    if (!best) return partyHoldEstimate(1, { one: true });
    return best;
  };
  partyHolds = z => !partyCombatOn() || partyHoldEstimate(z, { one: true }).holds;
  // Auto-challenge (50-sim) and the sim: is the zone boss worth trying? The party's single-target
  // damage on the boss (armour and the Lanternmage's magic counted) against its HP over the timer
  // x bossGate. After waiting bossWait seconds boss-ready it tries anyway (the first try counts).
  let readyFor = 0, readyZone = 0;
  cbBossReady = () => {
    if (!partyCombatOn()) return true;
    const z = S.zone, zt = zoneType(z), b = FOE_BEH[TYPES[zt].key] || FOE_BEH.slime;
    if (readyZone !== z) { readyZone = z; readyFor = clock; }
    if (clock - readyFor >= T.bossWait) return true;
    const n = estUnits(), hero = EST[0], phys = b.armoured ? T.armourX : 1;
    let D = heroDps() * T.autoCast * (hero.cls === 'lanternmage' ? 1 : phys);
    for (let i = 1; i < n; i++) D += EST[i].dps * (EST[i].role === 'caster' || EST[i].role === 'support' ? 1 : phys);
    const hp = mobHp(z) * bossHpMult(z) * mod('bossHp') * mod('foeHp');
    return D * Math.max(5, 30 + bonus('bossTime')) * T.bossGate >= hp;   // BAL2: estEff tunes the away estimate only
  };
}
