// 56e-formation: the party of three (plan-3 task F1). The hero and up to 2 companions stand in
// one line of three slots, Back, Middle and Front (left to right on the stage). Where someone
// stands decides who melee foes reach, who covers whom and who divers go for.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Spec: docs/design/formation.md sections 1, 3 and 4 (F1). F2 (combos, Kin, Bonds), F3 (planner v3)
// and F4 (the Party UI) build on the API below.
//
// Save (all under S.party; field and cells keep their names and meaning):
//   field  [ids]                    the fielded companions, at most 2 (ROSTER_TUNE.fieldMax)
//   cells  { key: { col, lane } }   'hero' and each fielded id; one member per col (0 Back, 1 Middle,
//                                   2 Front); lane is always 1 now (old values are never read)
//   formV  0 | 1                    formation version: 0 = not migrated yet, the migration sets 1
//   pin    [ids]                    companions the player pinned (F3's planner keeps them; F4's lock)
//   formOld null | { field, cells } the party of 3 as it stood before the migration (F2 seeds Bonds
//                                   from it; nothing else reads it)
//
// Exposed names:
//   data     FORM_SLOTS ['back', 'mid', 'front'] (index = col; spec 'SLOTS', renamed: 20-data owns SLOTS), SLOT_COL { back: 0, mid: 1, front: 2 },
//            SLOT_NAME { back: 'Back', mid: 'Middle', front: 'Front' }, HOME_SLOT { id: slot },
//            CLASS_HOME { cls: slot }, FORM_TUNE (every formation knob, spec 7), FORM_TEXT (copy)
//   read     homeSlot(key) -> slot        key: 'hero' or a character id (no class yet: Front, as a Warden)
//            slotOf(key) -> slot | null   null = not in the party
//            whoIn(slot) -> key | null
//            offSlot(key) -> bool         in the party, outside the home slot
//            adjacentKeys(key) -> [keys]  the members in the next slots (the Middle touches both)
//            formLine() -> [{ slot, col, key, home, off }] x 3, Back to Front (key null = empty)
//            formWarning() -> ''          the one amber line (spec 1.3), most serious first
//   change   setSlots({ front, mid, back }) -> bool   keys or null; the hero must be one of them;
//                                   sets field and cells together, one fieldChange
//            swapSlots(a, b) -> bool      slot names; the hero moves too; an empty slot is a move
//            fieldTo(id, slot) -> bool    a bench companion takes the slot, whoever stood there goes
//                                   to the bench; refused on the hero's slot (FORM_TEXT.heroStays).
//                                   A fielded id just swaps. Clears S.party.autoField (a manual pick)
//            placeSlots(keep) -> cells    re-place the hero and field (keep: current slots when free,
//                                   else home, else the nearest free slot toward Middle; a newcomer's
//                                   home beats someone standing there off-home). No event
//            slotsFor(keys, pre, cur) -> cells   the same rule as a pure function (the planner):
//                                   keys in priority order, pre { key: col | {col} } fixed, cur cells to keep
//   power    trioMult()                   party damage x (FORM_TUNE.trioX ramped over zones 8-12); never HP
//            heroFloorDps()               the hero's damage floor (spec 4.2), before trio
//            heroCombatDps()              max(heroDps, floor) x trio x Out of place: the hero's party-combat damage
//            heroStand(tap) -> >= ~1      heroCombatDps / heroDps: 50-sim heroSwing multiplies the
//                                   hero's hits on foes by it (taps by 1 + (x - 1) x tapStand)
//            offSlotMult(key)             1 - FORM_TUNE.offSlot out of place, else 1 (damage and healing)
//   save     formNoLoss() -> { before, after, ratio, old, field } | null   this save's migration: party
//                                   damage (hero + companions) under the old rules vs the new (T9, C9)
//            formEnsure(arm)              runs the migration once per save (56-roster rosterLive() calls
//                                   it; 59b-enemies arms it once the combat estimate exists)
//
// Events: fieldChange { field } (existing, once per change); formMigrated { old, field, benched,
//         cells, oldCells, before, after } (once, when an old save becomes a party of three; 'whatsNew' follows on
//         the first tick).
// Hooks used: addCharModifier (trio and Out of place on companion damage, 56-roster), on('classChosen')
//   (the hero walks to the class home), on('fieldChange') (repairs cells that break one per slot,
//   e.g. from the old two-lane grid until F4 replaces it).
//
// In combat (59-combat): melee foes reach the front-most standing member; a tank in Front covers
// the Middle (COMBAT_TUNE.cover), a tank in the Middle covers the Back (FORM_TUNE.bulwark), and
// such a tank takes the first hit of a dive on the member it covers (59b); anyone in Front gets
// +FORM_TUNE.bracedAll armour; adjacency is the next slot; Out of place costs offSlot of damage
// and healing. Slot jobs, combos, Kin and Bonds are F2 (56b / 56f).

const FORM_SLOTS = ['back', 'mid', 'front'];
const SLOT_COL = { back: 0, mid: 1, front: 2 };
const SLOT_NAME = { back: 'Back', mid: 'Middle', front: 'Front' };
// Spec 1.2: 6 Front, 7 Middle, 5 Back.
const HOME_SLOT = {
  tobin: 'front', maren: 'front', aldric: 'front', grenna: 'front', caedmon: 'front', bram: 'front',
  wren: 'mid', kestrel: 'mid', isolde: 'mid', corvin: 'mid', thessaly: 'mid', anselm: 'mid', vesper: 'mid',
  hesketh: 'back', elowen: 'back', pip: 'back', oriel: 'back', morwen: 'back'
};
const CLASS_HOME = { warden: 'front', ranger: 'mid', lanternmage: 'back', lightkeeper: 'back' };
const FORM_TEXT = {
  heroStays: "Your hero stays in the party. Pick a companion's slot.",
  noFront: 'Nobody in Front. Foes will hit your Middle.',
  noFront2: 'Nobody in Front or Middle. Foes will hit your Back.',
  healerFront: 'Your healer is in Front.',
  whatsNew: 'Your party is now three: you and two companions, in Front, Middle and Back.'
};
// Knobs (spec 7). F1 reads offSlot, bulwark, bracedAll, heroFloor, tapStand, trio*; the rest are
// here so F2 / F3 / BAL3 tune one table.
const FORM_TUNE = {
  offSlot: 0.10, bulwark: 0.10, bracedAll: 10,
  job: { tank: { front: 0.25, mid: 0, back: 0 }, striker: { front: 0.10, mid: 0.10, back: 0.15 },
    caster: { front: 0.05, mid: 0.15, back: 0.10 }, support: { front: 0.10, mid: 0.10, back: 0.10 } },
  synCap: 0.40, drCap: 0.20,
  bondH: [0.5, 3, 12, 36, 150], bondX: [0.5, 0.75, 1, 1.15, 1.3],
  bondAway: 0.75, bondCamp: 0.5, bondExped: 1, oldFriend: 1.5,
  seedActive: 12, seedStrong: 36, seedPerLv: 0.1,
  heroFloor: { warden: 1.0, ranger: 0.7, lanternmage: 1.0, lightkeeper: 0 }, tapStand: 1,
  trioX: 1.35, trioFrom: 8, trioTo: 12,
  bossW: 0.35, bossWHard: 0.6, hyst: 0.06, dwell: 300, deep: 4, maxEst: 32, maxPins: 2
};
// var: 56-roster (rosterLive, placeCells), 50-sim (heroSwing) and 59-combat ask for these by typeof.
var formEnsure, placeSlots, slotsFor, heroStand, heroCombatDps, heroFloorDps, trioMult, offSlotMult;
let formNoLoss, homeSlot, slotOf, whoIn, offSlot, adjacentKeys, formLine, formWarning, setSlots, swapSlots, fieldTo;

{
  const T = FORM_TUNE;
  const FORM_DEF = { formV: 0, pin: [], formOld: null };
  fillDefaults(STATE_DEFAULTS.party, FORM_DEF);

  const P = () => S.party;
  const R = id => ROSTER[id];
  const max = () => (ROSTER_TUNE && ROSTER_TUNE.fieldMax) || 2;
  const combatOn = () => typeof partyCombatOn === 'function' && partyCombatOn();
  const onExped = id => { try { return typeof expedOut === 'function' && !!expedOut(id); } catch (e) { return false; } };
  const clsOf = () => { const p = P(); return p && p.cls && HERO_CLASSES[p.cls] ? p.cls : null; };
  const CLS_ROLE = { warden: 'tank', ranger: 'striker', lanternmage: 'caster', lightkeeper: 'support' };
  const roleOf = k => k === 'hero' ? CLS_ROLE[clsOf() || 'warden'] : (R(k) ? R(k).role : 'striker');
  const fieldIds = () => ((P() && P().field) || []).filter(k => R(k) && isRecruited(k)).slice(0, max());
  const members = () => ['hero'].concat(fieldIds());
  const nameOf = k => {
    if (k === 'hero') return 'You';
    const n = R(k).name, w = n.split(' ');
    return ['Ser', 'Saint', 'Old', 'Brother'].includes(w[0]) ? n : w[0];
  };
  const colOf = v => v == null ? -1 : typeof v === 'number' ? v : v.col;
  const okCol = c => c === 0 || c === 1 || c === 2;

  // ---------------- homes and reads ----------------
  homeSlot = key => key === 'hero' ? CLASS_HOME[clsOf() || 'warden'] : HOME_SLOT[key] || ({ tank: 'front', striker: 'mid', caster: 'back', support: 'back' })[roleOf(key)] || 'mid';
  // Slot preference: home, then the nearest free slot toward Middle (from the Middle: Front for
  // tanks and strikers, Back for casters and supports).
  const order = k => {
    const h = SLOT_COL[homeSlot(k)];
    if (h === 2) return [2, 1, 0];
    if (h === 0) return [0, 1, 2];
    const r = roleOf(k);
    return r === 'caster' || r === 'support' ? [1, 0, 2] : [1, 2, 0];
  };
  // Keeping current slots: members already at home stay; then newcomers (no current slot) take their
  // home when it is free; then the others keep their current slot when free; the rest go by order().
  // So a recruit stepping in finds its home unless someone stands there at home already.
  slotsFor = (keys, pre, cur) => {
    const cells = {}, used = [false, false, false];
    const take = (k, c) => { cells[k] = { col: c, lane: 1 }; used[c] = true; };
    const list = (keys || []).filter((k, i, a) => a.indexOf(k) === i);
    if (pre) for (const k of list) { const c = colOf(pre[k]); if (okCol(c) && !used[c]) take(k, c); }
    if (cur) {
      const at = k => { const c = colOf(cur[k]); return okCol(c) ? c : -1; };
      for (const k of list) if (!cells[k] && at(k) === SLOT_COL[homeSlot(k)] && !used[at(k)]) take(k, at(k));
      for (const k of list) { const h = SLOT_COL[homeSlot(k)]; if (!cells[k] && at(k) < 0 && !used[h]) take(k, h); }
      for (const k of list) if (!cells[k] && at(k) >= 0 && !used[at(k)]) take(k, at(k));
    }
    for (const k of list) { if (cells[k]) continue; for (const c of order(k)) if (!used[c]) { take(k, c); break; } }
    return cells;   // a 4th key and beyond gets no cell
  };
  placeSlots = keep => { const p = P(); p.cells = slotsFor(members(), null, keep ? p.cells : null); return p.cells; };
  slotOf = key => {
    const p = P(); if (!p) return null;
    if (key !== 'hero' && !fieldIds().includes(key)) return null;
    const c = p.cells && p.cells[key];
    return c && okCol(c.col) ? FORM_SLOTS[c.col] : null;
  };
  whoIn = slot => { for (const k of members()) if (slotOf(k) === slot) return k; return null; };
  offSlot = key => { const s = slotOf(key); return !!s && s !== homeSlot(key); };
  offSlotMult = key => combatOn() && !legacy && offSlot(key) ? 1 - T.offSlot : 1;
  adjacentKeys = key => {
    const s = slotOf(key); if (!s) return [];
    const c = SLOT_COL[s], out = [];
    for (const k of members()) { const t = slotOf(k); if (k !== key && t && Math.abs(SLOT_COL[t] - c) === 1) out.push(k); }
    return out;
  };
  formLine = () => FORM_SLOTS.map((slot, col) => { const key = whoIn(slot); return { slot, col, key, home: key ? homeSlot(key) : null, off: key ? offSlot(key) : false }; });
  formWarning = () => {
    const f = whoIn('front'), m = whoIn('mid');
    if (!f && fieldIds().length) return m ? FORM_TEXT.noFront : FORM_TEXT.noFront2;
    if (f && roleOf(f) === 'support') return FORM_TEXT.healerFront;
    for (const k of members()) if (offSlot(k)) return k === 'hero' ? `You are out of place and fight ${Math.round(T.offSlot * 100)}% worse there.` : `${nameOf(k)} is out of place and fights ${Math.round(T.offSlot * 100)}% worse there.`;
    return '';
  };

  // ---------------- changes ----------------
  let repairing = false;
  const commit = (field, cells) => {
    const p = P();
    p.field = field.slice();   // new objects: the stage watches identity
    p.cells = cells;
    lastGood = colsOf(cells);
    emit('fieldChange', { field: p.field });
    return true;
  };
  setSlots = spec => {
    if (!rosterLive() || !spec) return false;
    const keys = {}, seen = [];
    for (const s of FORM_SLOTS) {
      const k = spec[s] || null; if (!k) continue;
      if (seen.includes(k)) return false;
      if (k !== 'hero' && (!R(k) || !isRecruited(k) || onExped(k))) return false;
      seen.push(k); keys[k] = SLOT_COL[s];
    }
    if (!seen.includes('hero') || seen.length - 1 > max()) return false;
    const old = fieldIds(), ids = seen.filter(k => k !== 'hero');
    ids.sort((a, b) => (old.includes(a) ? old.indexOf(a) : 9) - (old.includes(b) ? old.indexOf(b) : 9));
    const cells = {};
    for (const k of seen) cells[k] = { col: keys[k], lane: 1 };
    return commit(ids, cells);
  };
  swapSlots = (a, b) => {
    if (!rosterLive() || !(a in SLOT_COL) || !(b in SLOT_COL) || a === b) return false;
    const ka = whoIn(a), kb = whoIn(b);
    if (!ka && !kb) return false;
    const cells = {};
    for (const k of members()) { const s = slotOf(k); cells[k] = { col: k === ka ? SLOT_COL[b] : k === kb ? SLOT_COL[a] : SLOT_COL[s], lane: 1 }; }
    return commit(fieldIds(), cells);
  };
  fieldTo = (id, slot) => {
    if (!rosterLive() || !(slot in SLOT_COL) || !R(id) || !isRecruited(id) || onExped(id)) return false;
    const cur = slotOf(id);
    if (cur) return cur === slot ? false : swapSlots(cur, slot);
    const occ = whoIn(slot);
    if (occ === 'hero') return false;   // FORM_TEXT.heroStays
    let f = fieldIds();
    if (occ) f = f.map(k => k === occ ? id : k);
    else if (f.length < max()) f.push(id);
    else return false;
    const cells = {};
    for (const k of ['hero'].concat(f)) cells[k] = k === id ? { col: SLOT_COL[slot], lane: 1 } : { col: P().cells[k].col, lane: 1 };
    P().autoField = false;
    return commit(f, cells);
  };

  // ---------------- one member per slot ----------------
  // The old grid (75-party, until F4) can drop a member into the second lane of a used column.
  // Whoever moved keeps the new slot; whoever stood there takes the mover's old one (a swap).
  let lastGood = null, goodFor = null;
  const colsOf = cells => { const o = {}; for (const k in cells) o[k] = cells[k].col; return o; };
  function repair() {
    const p = P(); if (!p || !(p.formV >= 1)) return false;
    if (goodFor !== S) { goodFor = S; lastGood = null; }
    const keys = members(), cells = p.cells || {}, used = {};
    let bad = keys.length > 3 || Object.keys(cells).some(k => k !== 'hero' && !keys.includes(k));
    for (const k of keys) { const c = cells[k]; if (!c || !okCol(c.col) || c.lane !== 1 || used[c.col]) bad = true; else used[c.col] = 1; }
    if (!bad) { lastGood = colsOf(cells); return false; }
    const pre = {};
    if (lastGood) for (const k of keys) { const c = cells[k]; if (c && okCol(c.col) && lastGood[k] !== c.col && !Object.values(pre).includes(c.col)) pre[k] = c.col; }
    const fixed = slotsFor(keys, pre, lastGood || cells);
    p.cells = fixed; lastGood = colsOf(fixed);
    return true;
  }
  on('fieldChange', () => {
    if (repairing || !rstReady || !rosterLive()) return;
    if (!repair()) return;
    repairing = true;
    try { emit('fieldChange', { field: P().field }); } finally { repairing = false; }
  });
  // Choose your path: the hero walks to the class home (a swap when someone stands there). On the
  // first choice, companions then step into their own homes when those are free (the starter).
  on('classChosen', ({ from }) => {
    if (!rstReady || !rosterLive()) return;
    const home = homeSlot('hero'), cur = slotOf('hero'), keys = members();
    const cols = {};
    for (const k of keys) { const s = slotOf(k); cols[k] = s ? SLOT_COL[s] : -1; }
    if (cur !== home) {
      const occ = whoIn(home);
      if (occ) cols[occ] = cur ? SLOT_COL[cur] : -1;
      cols.hero = SLOT_COL[home];
    }
    if (from == null) for (const k of keys) {
      if (k === 'hero' || cols[k] === SLOT_COL[homeSlot(k)]) continue;
      const h = SLOT_COL[homeSlot(k)];
      if (!keys.some(o => cols[o] === h)) cols[k] = h;
    }
    const cells = slotsFor(keys, cols, null);
    commit(fieldIds(), cells);
  });

  // ---------------- power (spec 4.2, 4.3) ----------------
  const ROLE_D = { tank: 0.5, striker: 1.82, caster: 1.0, support: 0 };
  let legacy = false;   // true while the migration measures the old party of 3 (no trio, floor or slots)
  trioMult = () => {
    if (!combatOn() || legacy) return 1;
    const span = T.trioTo - T.trioFrom, z = S.maxZone || 1;
    const r = span > 0 ? Math.max(0, Math.min(1, (z - T.trioFrom) / span)) : z >= T.trioTo ? 1 : 0;
    return 1 + (T.trioX - 1) * r;
  };
  heroFloorDps = () => {
    if (!combatOn() || legacy || !rosterLive()) return 0;
    const cls = clsOf() || 'warden', fl = T.heroFloor[cls] || 0, f = fieldIds();
    if (!(fl > 0) || !f.length) return 0;
    let sum = 0; for (const k of f) sum += charPow(k);
    return fl * (sum / f.length) * (ROLE_D[CLS_ROLE[cls]] || 0);
  };
  heroCombatDps = () => {
    const d = heroDps();
    if (!combatOn()) return d;
    return Math.max(d, heroFloorDps()) * trioMult() * offSlotMult('hero');
  };
  heroStand = tap => {
    if (!combatOn()) return 1;
    const d = heroDps(), s = d > 0 ? heroCombatDps() / d : 1;
    return tap ? 1 + (s - 1) * T.tapStand : s;
  };
  // Companions: trio and Out of place on damage (charDps, fieldCompDps, supports' Smite). HP and
  // healing read charPow, which this does not touch; 59-combat applies Out of place to healing.
  addCharModifier(id => combatOn() ? trioMult() * offSlotMult(id) : 1);

  // ---------------- migration (spec 3.2) ----------------
  // Old saves: hero + 3 becomes hero + 2. Nobody leaves the roster; the best 2 of the old field
  // stay (the planner, else a tank, a support, then value); the third waits on the bench.
  const valueOf = k => { const s = ROLE_STATS[R(k).role]; return charPow(k) * (R(k).role === 'support' ? ROSTER_TUNE.supEq : s.dps * (1 + (s.crit || 0) * ((s.critX || 1) - 1))); };
  function fallbackPick(old) {
    const hr = roleOf('hero'), out = [];
    const best = list => list.slice().sort((a, b) => valueOf(b) - valueOf(a))[0];
    const tank = best(old.filter(k => R(k).role === 'tank'));
    if (hr !== 'tank' && tank) out.push(tank);
    const sup = best(old.filter(k => R(k).role === 'support'));
    if (hr !== 'support' && sup && out.length < max()) out.push(sup);
    for (const k of old.slice().sort((a, b) => valueOf(b) - valueOf(a))) if (out.length < max() && !out.includes(k)) out.push(k);
    return old.filter(k => out.includes(k));
  }
  let news = null, newsFor = null, noLoss = null, noLossFor = null;
  // Party damage (hero + companions) with the old rules and the old field of 3, and with the new.
  const partyDmg = ids => { let d = heroCombatDps(); for (const k of ids) d += charDps(k); return d; };
  function migrate() {
    const p = P();
    const old = (p.field || []).filter(k => R(k) && isRecruited(k)).slice(0, 3);
    const oldCells = JSON.parse(JSON.stringify(p.cells || {}));
    legacy = true;
    let before = 0;
    try { before = partyDmg(old); } finally { legacy = false; }
    let keep = old.slice(), cells = null;
    if (old.length > max()) {
      try {
        const b = typeof bestLineup === 'function' ? bestLineup({ goal: 'push', by: 'now', filter: old.slice() }) : null;
        if (b && b.field.length === max() && b.field.every(k => old.includes(k))) { keep = b.field.slice(); cells = b.cells; }
      } catch (e) {}
      if (keep.length > max()) { keep = fallbackPick(old); cells = null; }
    }
    const keys = ['hero'].concat(keep);
    p.field = keep;
    p.cells = slotsFor(keys, cells, null);
    p.formOld = { field: old, cells: oldCells };
    p.formV = 1;
    lastGood = colsOf(p.cells); goodFor = S;
    const benched = old.filter(k => !keep.includes(k));
    const after = partyDmg(keep);
    noLoss = { before, after, ratio: before > 0 ? after / before : 1, old: old.slice(), field: keep.slice() }; noLossFor = S;
    if (rosterList().length) {
      news = FORM_TEXT.whatsNew + (benched.length ? ` ${benched.map(nameOf).join(' and ')} waits on the bench, with every level kept.` : '');
      newsFor = S;
    }
    emit('formMigrated', { old, field: p.field.slice(), benched, cells: p.cells, oldCells, before, after });
    emit('fieldChange', { field: p.field });
  }
  let armed = false, formFor = null, busy = false;
  formEnsure = arm => {
    if (arm) armed = true;
    if (!armed || busy || formFor === S || !rstReady || !S || !S.party) return;
    if (!(S.party.rv >= 1)) return;   // the roster migration (56-roster) runs first
    formFor = S;
    fillDefaults(S.party, FORM_DEF);
    busy = true;
    try {
      if (!(S.party.formV >= 1)) migrate();
      else {
        // An old caller or a stored snapshot may hold 3: keep the first 2 and re-place.
        const f = (S.party.field || []).filter(k => R(k) && isRecruited(k));
        if (f.length > max() || f.length !== (S.party.field || []).length) { S.party.field = f.slice(0, max()); placeSlots(true); }
        else if (!S.party.cells || !S.party.cells.hero) placeSlots(true);
        repair();
      }
    } finally { busy = false; }
  };
  // The last migration's party damage, before (old rules, field of 3) and after (T9 / C9), or null.
  formNoLoss = () => noLossFor === S ? noLoss : null;
  // What's new goes out on the first tick (the bell listens from 70-ui, which loads later).
  onTick(() => {
    if (!news) return;
    if (newsFor === S) emit('whatsNew', { msg: news, icon: { ic: ['banner', '#F2C14E'] }, first: true });
    news = null; newsFor = null;
  });
}
