// 00-util: pure helpers, the event bus and the extension registries.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.

// ================= numbers =================
const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 1000) return n < 10 && n % 1 ? n.toFixed(1) : String(Math.floor(n));
  let i = 0; while (n >= 1000 && i < SUF.length - 1) { n /= 1000; i++; }
  return (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : Math.floor(n)) + SUF[i];
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
// toast(msg, kind, icon): icon is a URL string or an icon spec ({ item }, { mat: [k, t] }, { ic: [name, main, extra] })
const toast = (msg, kind, icon) => emit('toast', { msg, kind, icon });

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
