// Loads the real game core (src/js/00-59, minus the browser adapter 05-platform.js)
// into a Node vm context. No copies of formulas: the tools run the shipped code.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const JS_DIR = path.join(ROOT, 'src', 'js');
export const CSS_DIR = path.join(ROOT, 'src', 'styles');

// Browser-only files below 60 that Node replaces with its own adapters.
export const BROWSER_ONLY_CORE = ['05-platform.js'];

export const listDir = (dir, ext) => fs.readdirSync(dir).filter(f => f.endsWith(ext)).sort();
export const fileNum = f => parseInt(f, 10);
export const jsFiles = () => listDir(JS_DIR, '.js');
export const coreFiles = () => jsFiles().filter(f => fileNum(f) < 60 && !BROWSER_ONLY_CORE.includes(f));

// A simple Map-backed storage adapter with the same shape as the browser one.
export function memoryStorage(initial = {}) {
  const m = new Map(Object.entries(initial));
  return { get: k => (m.has(k) ? m.get(k) : null), set: (k, v) => { m.set(k, String(v)); }, dump: () => Object.fromEntries(m) };
}

/**
 * loadCore({ seed, storage, onConsoleError }) -> api
 *   api.eval(src)        evaluate an expression inside the game scope (reads/writes S, mob, ...)
 *   api.set(name, value) assign a top-level game binding (e.g. api.set('S', obj))
 *   api.fn               handy function refs (tick, spawn, buyHero, ...)
 *   api.storage          the storage adapter in use
 *   api.errors           console.error calls captured from the game (handler failures etc.)
 * seed: if given, Math.random inside the game is replaced by the game's own rng(seed).
 * prelude: source run before the first game file (e.g. pin Date.now so file-load code sees that day).
 */
export function loadCore({ seed, storage = memoryStorage(), files = coreFiles(), extraSource = '', prelude = '' } = {}) {
  const parts = [];
  let src = "(function (__host) {\n'use strict';\n";
  let line = 3;
  const pushPart = (name, text) => {
    parts.push({ name, start: line });
    src += text.endsWith('\n') ? text : text + '\n';
    line += (text.endsWith('\n') ? text : text + '\n').split('\n').length - 1;
  };
  if (prelude) pushPart('<prelude>', prelude);
  let injected = false;
  for (const f of files) {
    if (!injected && fileNum(f) >= 5) { pushPart('<node adapters>', 'useStorage(__host.storage);\n'); injected = true; }
    pushPart('src/js/' + f, fs.readFileSync(path.join(JS_DIR, f), 'utf8'));
  }
  if (!injected) pushPart('<node adapters>', 'useStorage(__host.storage);\n');
  if (extraSource) pushPart('<extra>', extraSource);
  pushPart('<exports>', 'return { eval: src => eval(src), set: (name, v) => eval(name + " = v") };\n');
  src += '})';

  const errors = [];
  const con = {
    log: (...a) => console.log(...a), info: (...a) => console.info(...a), warn: (...a) => console.warn(...a),
    error: (...a) => { errors.push(a.map(x => (x && x.stack) || String(x)).join(' ')); }
  };
  const ctx = vm.createContext({ console: con });
  const mapLine = n => { let p = parts[0]; for (const q of parts) if (q.start <= n) p = q; return `${p.name}:${n - p.start + 1}`; };
  const mapStack = e => { if (e && e.stack) e.stack = e.stack.replace(/core\.js:(\d+)/g, (_, n) => mapLine(+n)); return e; };
  let fnFactory;
  try { fnFactory = new vm.Script(src, { filename: 'core.js' }).runInContext(ctx); }
  catch (e) { throw mapStack(e); }
  let inner;
  try { inner = fnFactory({ storage }); } catch (e) { throw mapStack(e); }
  if (seed !== undefined && seed !== null) inner.eval(`Math.random = rng(${Number(seed) | 0})`);
  const fn = inner.eval(`({ tick, spawn, save, loadSave, fresh, gearDirty, setActivity, setZone, setNode, challenge,
    playerTap, buyHero, hireComp, buyRelic, forgeItem, equipItem, salvageItem, upgradeEquipped, awayGains,
    on, emit, mod, addModifier, onTick, registerState, plan, totalDps, heroDps, compDps, goldMult, gear,
    itemPower, equipped, craftCost, upgradeCost, hasMats, bossReady, zoneTier, target, nodeTime, xpNeed })`);
  return { eval: inner.eval, set: inner.set, fn, storage, errors, mapStack, source: src };
}

// Walk a value and return paths of any non-finite numbers.
export function badNumbers(v, p = 'S', out = []) {
  if (typeof v === 'number') { if (!Number.isFinite(v)) out.push(`${p} = ${v}`); }
  else if (Array.isArray(v)) v.forEach((x, i) => badNumbers(x, `${p}[${i}]`, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) badNumbers(x, `${p}.${k}`, out);
  return out;
}

// Deep equality ignoring key order. Returns null if equal, else the first differing path.
export function deepDiff(a, b, p = '') {
  if (a === b) return null;
  if (typeof a === 'number' && typeof b === 'number' && Number.isNaN(a) && Number.isNaN(b)) return null;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return `${p || '(root)'}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`;
  if (Array.isArray(a) !== Array.isArray(b)) return `${p}: array vs object`;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) { const d = deepDiff(a[k], b[k], p ? `${p}.${k}` : k); if (d) return d; }
  return null;
}

// Every key/value in `sub` exists identically in `sup` (extra keys in sup are fine).
export function subsetDiff(sub, sup, p = '') {
  if (sub === sup) return null;
  if (sub === null || typeof sub !== 'object') return deepDiff(sub, sup, p);
  if (sup === null || typeof sup !== 'object') return `${p}: missing object`;
  if (Array.isArray(sub)) return deepDiff(sub, sup, p);
  for (const k of Object.keys(sub)) { const d = subsetDiff(sub[k], sup[k], p ? `${p}.${k}` : k); if (d) return d; }
  return null;
}
