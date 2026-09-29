// 30-state: the save (S), load/migrate, save(), registered feature fields, and
// runtime (non-saved) shared-world state.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Save compatibility is sacred: never rename or repurpose a field below.

// ================= save =================
// ECON-A (economy-2 9): the save key moved to v2 (S.v 3) with the gold economy. An old v1 save is never
// read (a new game starts) and never touched: its key stays in storage as it was.
const KEY = 'lanternfall.save.v2';
// Feature save fields added with registerState(key, defaults). Kept in registration order.
const STATE_DEFAULTS = {};
const cloneJSON = v => v === undefined ? v : JSON.parse(JSON.stringify(v));
const isPlainObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
function fillDefaults(target, defs) {
  for (const [k, v] of Object.entries(defs)) {
    if (target[k] === undefined) target[k] = cloneJSON(v);
    else if (isPlainObj(v) && isPlainObj(target[k])) fillDefaults(target[k], v);
  }
  return target;
}
const fresh = () => Object.assign({
  v: 3, name: 'Wanderer', L: 1, xp: 0, gold: 0, embers: 0, zone: 1, maxZone: 1, kills: 0,
  blade: 0, swift: 0, fortune: 0, precision: 0, comp: [0, 0, 0, 0, 0, 0, 0], relic: { banner: 0, coin: 0, heart: 0, glass: 0, edge: 0 },
  auto: true, activity: 'fight', raid: { gen: 0, dmg: 0, maxHp: 0, name: '' }, wyrms: 0,
  totalKills: 0, totalGold: 0, amt: '1', tab: 'adv', last: Date.now(), hintDone: false,
  skills: { mine: { lv: 1, xp: 0 }, wood: { lv: 1, xp: 0 }, smith: { lv: 1, xp: 0 },
    forage: { lv: 1, xp: 0 }, bench: { lv: 1, xp: 0 }, loom: { lv: 1, xp: 0 }, ench: { lv: 1, xp: 0 } },
  mats: { ore: [0, 0, 0, 0, 0], wood: [0, 0, 0, 0, 0], ess: [0, 0, 0, 0, 0],
    crystal: [0, 0, 0, 0, 0], fibre: [0, 0, 0, 0, 0], herb: [0, 0, 0, 0, 0], hide: [0, 0, 0, 0, 0] },
  node: { kind: 'ore', t: 1 }, gProg: 0,
  items: [], equip: { weapon: null, off: null, helm: null, body: null, charm: null, pick: null, axe: null, sickle: null }, nextId: 1,
  found: {}, fSlot: 'weapon', fTier: 1
}, cloneJSON(STATE_DEFAULTS));
const BASE_KEYS = Object.keys(fresh());
let S = fresh();
function loadSave() {
  try {
    const raw = storage.get(KEY);
    if (raw) {
      const o = JSON.parse(raw);
      S = Object.assign(fresh(), o);
      S.relic = Object.assign(fresh().relic, o.relic || {});
      S.raid = Object.assign(fresh().raid, o.raid || {});
      S.skills = Object.assign(fresh().skills, o.skills || {});
      S.mats = Object.assign(fresh().mats, o.mats || {});
      S.equip = Object.assign(fresh().equip, o.equip || {});
      while (S.comp.length < 7) S.comp.push(0);
      if (!o.activity) S.activity = o.raiding ? 'raid' : 'fight';
      delete S.raiding;
      for (const [k, d] of Object.entries(STATE_DEFAULTS)) if (isPlainObj(d) && isPlainObj(S[k])) fillDefaults(S[k], d);
    }
  } catch (e) {}
}
loadSave();
function save() { S.last = Date.now(); try { storage.set(KEY, JSON.stringify(S)); } catch (e) {} }

// registerState('achievements', { got: {}, seen: 0 }): adds a top-level save field.
// Defaults merge into fresh() and into the loaded save (missing keys only, recursively
// for plain objects); existing values are never overwritten. Call from a 55-*.js file.
function registerState(key, defaults) {
  if (BASE_KEYS.includes(key) || key in STATE_DEFAULTS) throw new Error(`registerState: "${key}" is already a save field`);
  STATE_DEFAULTS[key] = cloneJSON(defaults);
  if (S[key] === undefined) S[key] = cloneJSON(defaults);
  else if (isPlainObj(defaults) && isPlainObj(S[key])) fillDefaults(S[key], defaults);
  return S[key];
}

// ================= runtime shared-world state (not saved) =================
// Filled in by 80-online.js. Core only reads it (raid target, raid rewards).
const online = { ready: false, checked: false, db: null, user: null, room: null, uid: null, canWrite: true, world: null, bossLoaded: false, raiders: [], peers: [], flushKey: '', flushing: false, advancing: false, hornOk: true, hornAt: 0, presKey: '' };
let rallyUntil = 0;
