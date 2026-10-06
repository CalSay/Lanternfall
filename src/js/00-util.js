// 00-util: pure helpers, the event bus and the extension registries.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.

// ================= numbers =================
const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
// Number format (achievements.md 5.1): 'letters' (default) or 'sci', set from S.settings.num by
// setNumFormat (58-deeds at load and on change). Letters past Dc go on aa, ab, ... az, ba, ...
let NUM_FMT = 'letters';
const setNumFormat = v => (NUM_FMT = v === 'sci' ? 'sci' : 'letters');
const sufAt = i => i < SUF.length ? SUF[i] : String.fromCharCode(97 + Math.floor((i - SUF.length) / 26) % 26, 97 + (i - SUF.length) % 26);
function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 1000) return n < 10 && n % 1 ? n.toFixed(1) : String(Math.floor(n));
  if (NUM_FMT === 'sci') { let e = Math.floor(Math.log10(n)), m = n / Math.pow(10, e); if (m < 1) { m *= 10; e--; } if (m >= 9.995) { m /= 10; e++; } return m.toFixed(2) + 'e' + e; }
  let i = 0;
  if (n < 1e36) while (n >= 1000) { n /= 1000; i++; }   // (the old loop, kept exact below 1e36)
  else { i = Math.floor(Math.log10(n) / 3); n /= Math.pow(10, 3 * i); if (n >= 999.9999999) { n /= 1000; i++; } else if (n < 0.9999999) { n *= 1000; i--; } }
  return (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : Math.floor(n)) + sufAt(i);
}
function fmtTime(s) { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? `${h}h ${m}m` : m ? `${m}m ${s % 60}s` : `${s}s`; }
const roman = n => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n - 1] || String(n);

// seeded PRNG (mulberry32); returns a function giving floats in [0, 1)
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ================= event bus =================
// Core emits, render/UI/features subscribe. Handlers run synchronously in the
// order they subscribed. A throwing handler is logged and skipped so one broken
// feature cannot stall the game loop. See docs/ARCHITECTURE.md for the event list.
const BUS = new Map();
function on(evt, fn) {
  if (!BUS.has(evt)) BUS.set(evt, []);
  BUS.get(evt).push(fn);
  return () => off(evt, fn);
}
function off(evt, fn) { const l = BUS.get(evt); if (l) { const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); } }
function emit(evt, payload) {
  const l = BUS.get(evt); if (!l || !l.length) return;
  for (const fn of l.slice()) { try { fn(payload); } catch (e) { console.error(`[lanternfall] handler for "${evt}" failed`, e); } }
}
// toast(msg, kind, icon, prio): icon is a URL string or an icon spec ({ item }, { mat: [k, t] }, { ic: [name, main, extra] }).
// prio: 'high' (always pops), 'normal' (pops; extras fold into the bell), 'low' (bell log only).
// Omitted: by kind ('loot' high, others normal). Rules: docs/design/layout.md.
const toast = (msg, kind, icon, prio) => emit('toast', { msg, kind, icon, prio });

// ================= storage adapter =================
// { get(key) -> string|null, set(key, string) }. The browser adapter is installed by
// 05-platform.js; the Node tools install an in-memory one.
let storage = { get: () => null, set: () => {} };
const useStorage = s => { storage = s; };

// ================= modifiers =================
// mod(key) is the product of every registered multiplier for that key (1 when none).
// Formulas multiply by it at the END of their expression so a neutral 1 is exact.
const MODS = new Map();
function addModifier(key, fn) {
  if (!MODS.has(key)) MODS.set(key, []);
  MODS.get(key).push(fn);
  return () => { const l = MODS.get(key), i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); };
}
function mod(key) {
  const l = MODS.get(key); if (!l || !l.length) return 1;
  let m = 1; for (const f of l) m *= f();
  return m;
}

// ================= tick hooks =================
// onTick(fn): fn(dt) runs at the end of every core tick (in the browser and in the Node tools).
const TICK_HOOKS = [];
const onTick = fn => { TICK_HOOKS.push(fn); return () => { const i = TICK_HOOKS.indexOf(fn); if (i >= 0) TICK_HOOKS.splice(i, 1); }; };
// Pause registry: a feature that must stop the game while its screen is up calls holdGame(() => bool). The browser frame loop (90-boot) skips tick() while any predicate is true. Never used by the core sim or the away gain.
const GAME_HOLDS = [];
const holdGame = fn => { GAME_HOLDS.push(fn); return () => { const i = GAME_HOLDS.indexOf(fn); if (i >= 0) GAME_HOLDS.splice(i, 1); }; };
const gameHeld = () => { for (const f of GAME_HOLDS) { try { if (f()) return true; } catch (e) {} } return false; };

// ================= additive bonuses =================
// bonus(key) is the SUM of every registered value for that key (0 when none). Use it for
// hours, slots, counts and flat knobs that do not fit a product of multipliers.
// Keys: awayHours (added to the away cap).
const BONUSES = new Map();
function addBonus(key, fn) {
  if (!BONUSES.has(key)) BONUSES.set(key, []);
  BONUSES.get(key).push(fn);
  return () => { const l = BONUSES.get(key), i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); };
}
function bonus(key) {
  const l = BONUSES.get(key); if (!l || !l.length) return 0;
  let s = 0; for (const f of l) s += f();
  return s;
}

// ================= device calendar =================
// deviceDay(): the local date as whole days since 2026-01-01 (the Tavern visitor's epoch).
// deviceWeek(): weeks start on Monday (2026-01-01 was a Thursday).
// Single-player only: changing the device clock only affects the player's own game.
function deviceDay(now) {
  const d = now === undefined ? new Date() : new Date(now);
  return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 0, 1)) / 864e5);
}
const deviceWeek = now => Math.floor((deviceDay(now) + 3) / 7);
