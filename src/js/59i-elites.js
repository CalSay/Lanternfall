// 59i-elites: elite traits (Core 2.0 slice S6-D; docs/design/core-2.md 6.5, combat-2.md 5). Seven traits, each with
// its counter: Shielded (heavy hits x2 on the shield), Leeching (Curse, Venom 5+), Explosive (dodge the blast, or kill
// it Chilled), Summoner (interrupt), Enraged (Chill, burst), Ice-Clad (fire), Cursed (holy, a cleanse). Region 1
// elites keep today's rules (no trait); the Coast and the Emberwaste roll 1, the Pale Reach and the Gloamvale 2; the
// Deepwell 1 from floor 8 and 2 from floor 20. Two traits never share a counter (Explosive + Enraged never roll).
// Data: 21g-data-bosses.js (ELITE_TRAITS, ELITE_WEIGHTS, ELITE_LEANS, ELITE_TUNE).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Exposed names:
//   eliteRoll(f, k) (59-combat makeElite), eliteRollDeep(f, floor) (the Deepwell), eliteTraits(z) -> [[id, w]] weights
//   hooks 59-combat calls: eliteHit(f, a, src, kind, dt, tags) -> the damage after the trait (shield, ice, holy),
//   eliteDealt(f, dealt, u) (Leeching, Cursed), eliteTick(f, dt) (timers), eliteDies(f) (the blast)
//   ELITE_STATS counters
// Runtime on the foe (never saved): tr (trait ids), esh / eshMax / eshT (shield), ice / iceN / iceT, sumT, curseOff, leech.

var eliteRoll, eliteRollDeep, eliteTraits, eliteHit, eliteDealt, eliteTick, eliteDies, ELITE_STATS;

{
  const K = ELITE_TUNE;
  ELITE_STATS = { rolled: {}, shieldAbs: 0, leech: 0, blasts: 0, fizzles: 0, summons: 0, iceBreaks: 0, curses: 0 };
  for (const id of ELITE_ORDER) ELITE_STATS.rolled[id] = 0;
  const alive = f => f && !f.dead && f.hp > 0 && !f.gone;
  const never = (a, b) => ELITE_NEVER.some(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a));

  // The weights at zone z: the region's row, x lean on the two traits its place in the 7-zone cycle leans to.
  const W = [];
  eliteTraits = (z, deep) => {
    const r = deep ? 'deep' : typeof regionIdx === 'function' ? regionIdx(z) : 0;
    const row = ELITE_WEIGHTS[r] || ELITE_WEIGHTS[4];
    W.length = 0;
    const lean = !deep && ELITE_LEANS[r] && typeof REGIONS === 'object' && REGIONS[r] ? ELITE_LEANS[r][((z - REGIONS[r].z0) % 7 + 7) % 7] : null;
    for (let i = 0; i < ELITE_ORDER.length; i++) { const id = ELITE_ORDER[i]; W.push([id, row.w[i] * (lean && lean.includes(id) ? K.lean : 1)]); }
    return W;
  };
  function pick(z, have, deep) {
    const w = eliteTraits(z, deep);
    let tot = 0;
    for (const [id, v] of w) if (v > 0 && !have.includes(id) && !have.some(h => never(h, id))) tot += v;
    if (!(tot > 0)) return null;
    let r = Math.random() * tot;
    for (const [id, v] of w) { if (!(v > 0) || have.includes(id) || have.some(h => never(h, id))) continue; r -= v; if (r <= 0) return id; }
    return null;
  }
  function give(f, n, deep) {
    const tr = [];
    for (let i = 0; i < n; i++) { const id = pick(f.z, tr, deep); if (id) tr.push(id); }
    if (!tr.length) return;
    f.tr = tr;
    for (const id of tr) {
      ELITE_STATS.rolled[id]++;
      if (id === 'shielded') { f.eshMax = f.max * K.shielded.share; f.esh = f.eshMax; f.eshT = 0; }
      else if (id === 'frozen') { f.ice = true; f.iceN = 0; f.iceT = 0; }
      else if (id === 'summoner') f.sumT = K.summoner.first;
      else if (id === 'cursed') f.curseOff = 0;
      if (typeof actSeen === 'function') actSeen('tr_' + id, ELITE_TRAITS[id].first);
    }
    f.name = ELITE_TRAITS[tr[0]].name + ' ' + f.name.replace(/^Elite /, '');
  }
  eliteRoll = (f, k) => {
    const r = typeof regionIdx === 'function' ? regionIdx(f.z) : 0, row = ELITE_WEIGHTS[r] || ELITE_WEIGHTS[4];
    if (row.n > 0) give(f, row.n, false);
  };
  eliteRollDeep = (f, floor) => {
    const d = ELITE_WEIGHTS.deep;
    if (!(floor >= d.from)) return;
    give(f, floor >= d.n2From ? 2 : 1, true);
  };
  const has = (f, id) => !!(f.tr && f.tr.includes(id));

  // ---------------- hooks ----------------
  eliteHit = (f, a, src, kind, dt, tags) => {
    // Ice-Clad: half from physical and frost while iced; 3 fire hits (Burn ticks count) break it
    if (f.ice) {
      if (dt === 'phys' || dt === 'frost' || (!dt && kind === 'phys')) a *= K.frozen.x;
      if (dt === 'fire' || kind === 'burn') { f.iceN = (f.iceN || 0) + 1; if (f.iceN >= K.frozen.hits) { f.ice = false; f.iceN = 0; f.iceT = K.frozen.back; ELITE_STATS.iceBreaks++; } }
    }
    // Cursed: holy damage turns its aura off for 5 s
    if (dt === 'holy' && has(f, 'cursed')) f.curseOff = K.cursed.holyOff;
    // Shielded: the shield takes the hit first; heavy hits deal x2 to it
    if (f.esh > 0) {
      const heavy = typeof ST_LAST === 'object' && ST_LAST.heavy, x = heavy ? K.shielded.heavyX : 1;
      const take = Math.min(f.esh, a * x);
      f.esh -= take; a -= take / x; ELITE_STATS.shieldAbs += take;
    }
    if (has(f, 'shielded')) f.eshT = 0;
    return a;
  };
  eliteDealt = (f, dealt, u) => {
    if (!(dealt > 0) || !alive(f)) return;
    if (has(f, 'vampiric')) {
      const now = typeof cbClock === 'function' ? cbClock() : 0;
      if (!(now - (f.leechAt || -9) < 1)) { f.leechAt = now; f.leechGot = 0; }
      const room = f.max * K.vampiric.capPerSec - (f.leechGot || 0);
      const h = Math.min(room, dealt * K.vampiric.share) * (typeof stHealX === 'function' ? stHealX(f) : 1);
      if (h > 0) { f.leechGot = (f.leechGot || 0) + h; f.hp = Math.min(f.max, f.hp + h); ELITE_STATS.leech += h; }
    }
    if (has(f, 'cursed') && !(f.curseOff > 0) && u && !u.down && typeof stUnitApply === 'function') { stUnitApply(u, 'curse', 1, { dur: K.cursed.secs }); ELITE_STATS.curses++; }
  };
  eliteTick = (f, dt) => {
    if (!alive(f)) return;
    if (f.curseOff > 0) f.curseOff -= dt;
    // Shielded: 5 s after it last took damage the shield comes back full
    if (has(f, 'shielded') && f.esh < f.eshMax) { f.eshT = (f.eshT || 0) + dt; if (f.eshT >= K.shielded.back) f.esh = f.eshMax; }
    // Ice-Clad re-forms 8 s after breaking
    if (has(f, 'frozen') && !f.ice) { f.iceT -= dt; if (f.iceT <= 0) { f.ice = true; f.iceN = 0; } }
    // Enraged: under 50% it attacks 50% faster and hits 20% harder, unless Chilled
    if (has(f, 'enraged')) {
      const on = f.hp < f.max * K.enraged.at && !(f.chillT > 0);
      f.spdX = on ? K.enraged.spd : 1; f.atkX = on ? K.enraged.dmg : 1; f.rage = on;
    }
    // Summoner: every 12 s a 2 s summon cast (the tap, an ability or a stun stops it); at most 4 of its adds alive
    if (has(f, 'summoner') && !(f.stunT > 0) && !(f.stgT > 0)) {
      f.sumT -= dt;
      if (f.sumT <= 0) {
        f.sumT = K.summoner.every;
        let n = 0; for (const o of combatFoes()) if (o.sumBy === f && alive(o)) n++;
        if (n < K.summoner.max && typeof actWarn === 'function') {
          actWarn({ kind: 'summon', id: 'eliteSummon', name: 'Summon', foe: f, dur: K.summoner.cast, src: 'elite', hint: BOSS_COPY.first.summon,
            land: () => summon(f), interrupted: () => { f.sumT = K.summoner.every; } });
        }
      }
    }
  };
  eliteDies = f => {
    if (!has(f, 'explosive')) return;
    // killed while Chilled: it freezes and fizzles
    if (f.chillT > 0) { ELITE_STATS.fizzles++; return; }
    const t = f.tgt >= 0 ? combatUnits()[f.tgt] : null, col = t && t.live ? t.col : 2;
    ELITE_STATS.blasts++;
    const atk = f.atk * K.explosive.x;
    actWarn({ kind: 'zone', id: 'blast', name: 'Blast', foe: f, dead: true, slots: 1 << col, dur: K.explosive.wind, src: 'elite', hint: BOSS_COPY.first.zone,
      land: w => { for (const u of combatUnits()) if (u.live && !u.down && (w.slots & (1 << u.col))) cbHitUnit(u, atk, 'blast', null); } });
  };
  // Two adds of the pack's type, 8% of its max HP each; no gold or XP.
  function summon(f) {
    if (!alive(f)) return;
    const list = combatFoes(), b = FOE_BEH[f.type] || FOE_BEH.slime;
    ELITE_STATS.summons++;
    for (let i = 0; i < K.summoner.n && list.length < 12; i++) {
      const hp = f.max * K.summoner.share;
      const a = Object.assign({}, f, { hp, max: hp, elite: false, tr: null, esh: 0, eshMax: 0, ice: false, gold: 0, xp: 0, name: f.name.replace(/^\S+ /, ''),
        th: new Float64Array(4), tgt: -1, forceT: 0, forceU: -1, swing: 1 + Math.random(), stunT: 0, dead: 0, born: 0, bx: 1, adds: true, sumBy: f, ss: null,
        atk: f.atk / (f.bx || 1) * 0.5, stag: 0, stag0: 0, sb: 0, stgT: 0, cast: null, diveT: 0, chanT: 0, again: true, champ: false, sumT: 0, hit: 0, gone: false });
      a.row = b.row;
      list.push(a);
    }
  }
}
