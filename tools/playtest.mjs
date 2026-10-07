#!/usr/bin/env node
// Playtest driver: lets an agent play the built game in headless Chromium the way a player does:
// read the screen, tap buttons by label, wait, come back after hours away. Method: docs/coord/playtest-lab.md.
//
//   node tools/playtest.mjs look                  what is on screen: visible text, tappable buttons, notices, a screenshot path
//   node tools/playtest.mjs tap "<label>"         tap the button with that label (exact, then partial match; scrolls it into view)
//   node tools/playtest.mjs tap-if "<label>"      tap it when it is on screen; carry on without failing when it is not
//   node tools/playtest.mjs wait <seconds>        let the game run that many seconds of game time (fast-forwards the clock)
//   node tools/playtest.mjs away <hours>          close the game for that long, then open it again (the away report appears)
//   node tools/playtest.mjs state                 short save summary: hero, level, zone, gold, skills, play time
//   node tools/playtest.mjs new [fresh|early|mid|late]   start a session: a fresh save, or a fixture from tests/fixtures
//   node tools/playtest.mjs expect "<text|css>"   exit 1 if that text (or CSS selector) is not visible on screen right now
//   node tools/playtest.mjs shot <name>           screenshot named <name>.png in the shots folder
//   node tools/playtest.mjs burst <name>          6 frames over 1.5 s of game time: <name>-1.png .. <name>-6.png
//   node tools/playtest.mjs scroll [down|up]      scroll the biggest scrolling panel on screen (or the page) by most of a screen
//   node tools/playtest.mjs expect-no "<text|css>"   exit 1 if that text (or CSS selector) IS visible on screen right now
//   node tools/playtest.mjs expect-save <f><op><n>   exit 1 unless the stored save's field compares true, e.g. gold>=12345 (ops >= <= > < =)
//   tab new [field=n]   (batch only) open the game in a second tab of the same browser (same storage); the open tab goes to the
//                       background first. field=n edits the stored save just before the new tab loads it (the new tab's progress)
//   tab <n>             (batch only) bring tab n (1 = the first) to the front; the one in front goes to the background
//   tab close [n]       (batch only) close the tab in front (it goes to the background, then pagehide; the last other tab comes to the
//                       front), or tab n while it stays in the background (pagehide only)
//   node tools/playtest.mjs batch                 read one command per line from stdin and run them in one browser launch
//                                                 (a route file is a batch: `new fresh` may open it, and `expect` keeps going after a miss;
//                                                 lines are read as they arrive, so a caller can drive one open game: tools/playtest-human.mjs)
//
// options: --session <dir> (default .playtest: the save, the game clock and the screenshots live there, so one
//          command per call carries on where the last one stopped)   --landscape (740x360 instead of 360x740 portrait)
//          --seed <n> (seed the game's random numbers for the whole run)   --shots <dir> (where shots go; default <session>/shots)
//          --json (machine-readable output)   --html <file> (play another build)   --quiet (tap and wait print one line, not a look)
//          --frozen (the game clock stands still between commands; without it, real time also moves it)
//          --thumb (tap scrolls only what a player can scroll; a button out of reach fails instead of scrolling the page)
//
// Runs dist/lanternfall.html as built: node tools/build.mjs first. Game time is a fake clock: `wait` and `away` cost
// real seconds in proportion to the frames drawn (about 15 real seconds per game minute at the default step).
// Browser discovery is shared with check.mjs (LF_PLAYWRIGHT / LF_CHROMIUM overrides).
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { findBrowser } from './lib/browser.mjs';
import { ROOT } from './lib/core.mjs';

const KEY = 'lanternfall.save.v5';
const ORIGIN = 'http://lanternfall.playtest/';
const raw = process.argv.slice(2);
const flags = { json: false, landscape: false, quiet: false, frozen: false, thumb: false };
let sessionDir = '.playtest', htmlFile = null, shotsOpt = null, seed = null, ranSecs = 0;   // ranSecs: game seconds this call has run (away hours are not play)
const pos = [];
for (let i = 0; i < raw.length; i++) {
  const a = raw[i];
  if (a === '--json') flags.json = true;
  else if (a === '--landscape') flags.landscape = true;
  else if (a === '--quiet') flags.quiet = true;
  else if (a === '--frozen') flags.frozen = true;
  else if (a === '--thumb') flags.thumb = true;
  else if (a === '--session') sessionDir = raw[++i];
  else if (a === '--html') htmlFile = raw[++i];
  else if (a === '--seed') seed = num(raw[++i], '--seed');
  else if (a === '--shots') shotsOpt = raw[++i];
  else pos.push(a);
}
sessionDir = path.resolve(sessionDir);
const sessionFile = path.join(sessionDir, 'session.json');
const shotDir = shotsOpt ? path.resolve(shotsOpt) : path.join(sessionDir, 'shots');

const die = msg => { console.error('playtest: ' + msg); process.exit(1); };
function num(v, name) { const n = Number(v); if (!Number.isFinite(n) || n < 0) die(`${name} needs a number of zero or more (got "${v}")`); return n; }

// ---------------- session ----------------
function fixture(name) {
  if (name === 'fresh') return null;
  let f = path.join(ROOT, 'tests', 'fixtures', `save-${name}.json`);
  if (!fs.existsSync(f)) f = path.join(ROOT, 'tests', 'proof-fixtures', `save-${name}.json`);   // route-only saves the save-code checks must not read
  if (!fs.existsSync(f)) die(`no fixture "${name}": use fresh, early, mid or late`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function newSession(name) {
  fs.mkdirSync(shotDir, { recursive: true }); fs.mkdirSync(sessionDir, { recursive: true });
  for (const f of fs.readdirSync(shotDir)) fs.rmSync(path.join(shotDir, f));
  const save = fixture(name);
  // The save's own clock is virtual: it starts "now", so a fixture's `last` stamp never reads as a long absence.
  const t = Date.now();
  if (save) {
    // A fixture is a snapshot from another day: move every timestamp in it (live job timers, cooldowns, rest stamps) by the
    // same amount as `last`, so the game is in the state it was saved in, as of "now".
    // Calendar counters (Almanac week and day, trial week) move by the same whole days and weeks, or the game would think a week had passed.
    const delta = t - save.last, dayOf = ms => { const d = new Date(ms); return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 0, 1)) / 864e5); };
    const days = dayOf(t) - dayOf(save.last), weeks = Math.floor((dayOf(t) + 3) / 7) - Math.floor((dayOf(save.last) + 3) / 7);
    const shift = o => { for (const k in o) { const v = o[k];
      if (typeof v === 'number') { if (v > 1.5e12 && v < 2.2e12) o[k] = v + delta; else if (k === 'week' && v >= 0) o[k] = v + weeks; else if (k === 'day' && v >= 0) o[k] = v + days; }
      else if (v && typeof v === 'object') shift(v); } };
    shift(save);
  }
  const s = { fixture: name, time: t, start: t, save: save ? JSON.stringify(save) : null, shots: 0, log: [] };
  fs.writeFileSync(sessionFile, JSON.stringify(s));
  return s;
}
function loadSession() {
  if (!fs.existsSync(sessionFile)) return newSession('fresh');
  return JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
}

// ---------------- page ----------------
const bt = findBrowser();
if (!bt.pw || !bt.exe) die(bt.reason || 'no browser found');

function pageHtml() {
  const file = htmlFile ? path.resolve(htmlFile) : path.join(ROOT, 'dist', 'lanternfall.html');
  if (!fs.existsSync(file)) die(file + ' is missing: run node tools/build.mjs');
  // The artifact host wraps the page in a document skeleton with a device-width viewport; do the same.
  return '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n' + fs.readFileSync(file, 'utf8');
}

// Frames: the game caps one frame at 0.1 s of game time, so fast-forwarding steps the frame loop every 100 ms
// instead of every 16 ms. That keeps game time exact and cuts the drawing work six times over.
const INIT = ([key, rawSave, seedN, keep]) => {
  if (seedN !== null) { let a = (seedN >>> 0) || 1; Math.random = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }   // mulberry32
  // The session's save goes in once per tab (a Reload tap keeps what the game stored); a later tab (`tab new`) loads what is stored.
  try { if (!keep && !sessionStorage.getItem('__ptInit')) { sessionStorage.setItem('__ptInit', '1'); if (rawSave) localStorage.setItem(key, rawSave); else localStorage.removeItem(key); } } catch (e) {}
  window.__ptErrors = [];
  addEventListener('error', e => window.__ptErrors.push(String(e.message || e)));
  const raf = window.requestAnimationFrame.bind(window);
  window.__ptStep = 16;
  window.requestAnimationFrame = cb => (window.__ptStep > 16 ? window.setTimeout(() => cb(performance.now()), window.__ptStep) : raf(cb));
};

async function openPage(browser, session, afterAway = false, tab = null) {
  // tab: { ctx, errors, time } opens another tab in that browser context (`tab new`), on the stored save, at that time
  const ctx = tab ? tab.ctx : await browser.newContext(flags.landscape
    ? { viewport: { width: 740, height: 360 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }
    : { viewport: { width: 360, height: 740 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = tab ? tab.errors : [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  const t0 = tab ? tab.time : session.time;
  await page.clock.install({ time: t0 });
  // Playwright's installed clock also runs on with real time. --frozen stops that, so game time moves only on wait, tap and the
  // like: a caller that thinks for a while between commands (tools/playtest-human.mjs) does not lose game seconds it never saw.
  if (flags.frozen) await page.clock.pauseAt(t0 + 1);
  await page.addInitScript(INIT, [KEY, session.save, seed, !!tab]);
  // The page is served from a fake origin (so localStorage works); every other request is refused, so nothing leaves the machine.
  const html = pageHtml();
  await page.route('**/*', r => (r.request().url() === ORIGIN ? r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html }) : r.abort()));
  await page.goto(ORIGIN, { waitUntil: 'commit' });
  // Boot and first frames. A save whose hero is not chosen yet opens the picker on a timer: wait for it, as a player would.
  await run(page, 1.5);
  const chosen = () => page.evaluate(k => { try { const s = JSON.parse(localStorage.getItem(k)); return !!(s && s.party && s.party.chosen); } catch (e) { return false; } }, KEY);
  for (let i = 0; i < 20 && !(await chosen()) && !(await page.$('#createScreen')); i++) await run(page, 0.5);
  // The away report card opens a moment after the first frame.
  if (afterAway) for (let i = 0; i < 8 && !(await page.$('.away-ov')); i++) await run(page, 0.5);
  return { page, errors, ctx, tabs: tab ? null : [page] };
}
// Headless pages always count as visible: a tab that goes to the background is told so the way a browser tells it.
const setHidden = (page, hidden) => page.evaluate(h => {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') });
  document.dispatchEvent(new Event('visibilitychange'));
}, hidden);
const storedSave = page => page.evaluate(k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, KEY);

// After a tap: half a second of game time. A tap that reloads the page (a Reload button) waits for the new page's boot instead.
async function settle(page) {
  try { await run(page, 0.5); }
  catch (e) { if (!/context was destroyed|navigat/i.test(String(e && e.message))) throw e; await page.waitForLoadState('load'); await run(page, 1.5); }
}

// Advance game time. Short waits use real 60 fps frames; long ones step 100 ms frames (see INIT).
async function run(page, secs) {
  if (secs <= 0) return;
  ranSecs += secs;
  let left = secs * 1000;
  const chunk = secs <= 20 ? 16 : 100;
  await page.evaluate(c => { window.__ptStep = c; }, chunk);
  while (left > 0) {
    const d = Math.min(left, 5000);
    await page.clock.runFor(d); left -= d;
  }
  await page.evaluate(() => { window.__ptStep = 16; });
}

// ---------------- reading the screen ----------------
const SCREEN = () => {
  const vw = innerWidth, vh = innerHeight;
  const inView = r => r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < vw && r.top < vh;
  const shown = (el, r) => {
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return false;
    const x = Math.min(vw - 1, Math.max(0, r.left + r.width / 2)), y = Math.min(vh - 1, Math.max(0, r.top + r.height / 2));
    const top = document.elementFromPoint(x, y);
    return !!top && (top === el || el.contains(top) || top.contains(el));
  };
  const clean = s => (s || '').replace(/\s+/g, ' ').trim();
  // A button's label is its aria-label, else its first line of text (a hero card's whole blurb is not its name).
  const label = el => { const first = (el.innerText || '').split('\n').map(clean).find(Boolean); return clean(el.getAttribute('aria-label') || first || el.textContent || el.title).slice(0, 60); };
  // buttons
  const buttons = [], off = [];
  let n = 0;
  for (const old of document.querySelectorAll('[data-pt]')) old.removeAttribute('data-pt');   // stamps from an earlier look would point at the wrong thing
  // Real buttons first, then anything else that shows a pointer cursor (rows and cards the game wires up with listeners).
  const clickables = new Set(document.querySelectorAll('button, [role=button], a[href], [onclick]'));
  for (const el of document.body.querySelectorAll('*')) {
    if (clickables.has(el) || !el.parentElement || /^(HTML|BODY|CANVAS|SCRIPT|STYLE)$/.test(el.tagName)) continue;
    if (getComputedStyle(el).cursor === 'pointer' && getComputedStyle(el.parentElement).cursor !== 'pointer' && !el.closest('button, [role=button], a[href]')) clickables.add(el);
  }
  for (const el of clickables) {
    const lab = label(el); if (!lab) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const dis = el.disabled || el.getAttribute('aria-disabled') === 'true' || el.classList.contains('off') || el.classList.contains('disabled');
    el.setAttribute('data-pt', String(n));
    const rec = { i: n++, label: lab.slice(0, 80), x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), disabled: !!dis };
    if (inView(r) && shown(el, r)) buttons.push(rec); else off.push(rec);
  }
  // visible text, in reading order, one line per row of the screen
  const rows = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let t; (t = walker.nextNode());) {
    const s = clean(t.nodeValue); if (!s) continue;
    const el = t.parentElement; if (!el || /^(SCRIPT|STYLE|TITLE)$/.test(el.tagName)) continue;
    const range = document.createRange(); range.selectNodeContents(t);
    const r = range.getBoundingClientRect();
    if (!inView(r) || !shown(el, r)) continue;
    const key = Math.round(r.top / 10);
    (rows.get(key) || rows.set(key, []).get(key)).push([r.left, s]);
  }
  const lines = [...rows.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v.sort((a, b) => a[0] - b[0]).map(x => x[1]).join('  '));
  // notices: the toast stack and the bell count
  const toasts = [...document.querySelectorAll('#toasts > *')].map(e => clean(e.textContent)).filter(Boolean);
  const bell = document.getElementById('bellBtn');
  const away = document.querySelector('.away-ov');
  const canvas = document.getElementById('stage');
  return {
    viewport: [vw, vh], lines, buttons, offAll: off, offscreen: off.map(b => b.label),
    toasts, bell: bell ? clean(bell.textContent) : '',
    scrollsDown: document.documentElement.scrollHeight > vh + 4,
    away: away && shown(away, away.getBoundingClientRect()) ? clean(away.textContent).slice(0, 400) : '',
    stage: canvas ? [canvas.clientWidth, canvas.clientHeight] : null
  };
};

const expects = [];
async function namedShot(page, name) {
  fs.mkdirSync(shotDir, { recursive: true });
  const f = path.join(shotDir, name.replace(/[^a-z0-9_-]+/gi, '-').slice(0, 60) + '.png');
  await page.screenshot({ path: f });
  return f;
}

async function shot(session, page, tag) {
  fs.mkdirSync(shotDir, { recursive: true });
  const f = path.join(shotDir, `${String(++session.shots).padStart(3, '0')}-${tag.replace(/[^a-z0-9]+/gi, '-').slice(0, 30)}.png`);
  await page.screenshot({ path: f });
  return f;
}

function formatLook(s, shotPath) {
  const out = [];
  out.push(`SCREEN ${s.viewport[0]}x${s.viewport[1]}  screenshot: ${shotPath}`);
  if (s.away) out.push(`AWAY REPORT: ${s.away}`);
  out.push('TEXT', ...s.lines.map(l => '  ' + l));
  out.push('BUTTONS (tap by label)', ...s.buttons.map(b => `  [${b.label}]${b.disabled ? ' (greyed out)' : ''}`));
  if (s.offscreen.length) out.push(`OFF SCREEN (scroll; tap still finds them): ${s.offscreen.slice(0, 40).map(l => `[${l}]`).join(' ')}${s.offscreen.length > 40 ? ` +${s.offscreen.length - 40} more` : ''}`);
  out.push(`NOTICES: bell ${s.bell || '0'}${s.toasts.length ? '; on screen now: ' + s.toasts.join(' | ') : ''}`);
  return out.join('\n');
}

async function look(session, page, tag = 'look') {
  const s = await page.evaluate(SCREEN);
  const f = await shot(session, page, tag);
  return { text: formatLook(s, f), data: { ...s, screenshot: f } };
}

// ---------------- state ----------------
async function readSave(page) {
  // The game saves on pagehide. It also pauses the turn fight there, so pageshow follows to leave the page as it was.
  await page.evaluate(() => { dispatchEvent(new Event('pagehide')); dispatchEvent(new Event('pageshow')); });
  return page.evaluate(k => localStorage.getItem(k), KEY);
}
function summary(session, saveRaw) {
  if (!saveRaw) return { note: 'no save yet (the hero is not chosen)' };
  const S = JSON.parse(saveRaw);
  const skills = {}; for (const [k, v] of Object.entries(S.skills || {})) skills[k] = v.lv;
  return {
    hero: S.name, level: S.L, zone: S.zone, bestZone: S.maxZone, activity: S.activity,
    gold: Math.floor(S.gold), embers: Math.floor(S.embers || 0), kills: S.totalKills, skills,
    playedGameTime: fmtDur((session.played || 0) + ranSecs)
  };
}
const fmtDur = s => s >= 3600 ? `${(s / 3600).toFixed(1)} h` : s >= 60 ? `${(s / 60).toFixed(1)} min` : `${Math.round(s)} s`;
const fmtState = o => Object.entries(o).map(([k, v]) => `${k}: ${typeof v === 'object' ? Object.entries(v).map(([a, b]) => `${a} ${b}`).join(', ') : v}`).join('\n');

// ---------------- tapping ----------------
async function tap(page, wanted) {
  const s = await page.evaluate(SCREEN);
  const all = [...s.buttons, ...s.offAll];
  const labels = {};
  for (const b of [...s.buttons, ...s.offAll]) labels[b.i] = b.label;
  const lc = wanted.toLowerCase();
  const cand = all.map(b => ({ ...b, label: labels[b.i] || b.label }));
  const inV = new Set(s.buttons.map(b => b.i));
  let hit = cand.filter(b => b.label.toLowerCase() === lc);
  // exact, then a label that starts with it, then one that has it as a whole word, then any that contains it
  if (!hit.length) hit = cand.filter(b => b.label.toLowerCase().startsWith(lc));
  if (!hit.length) hit = cand.filter(b => new RegExp('\\b' + lc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(b.label.toLowerCase()));
  if (!hit.length) hit = cand.filter(b => b.label.toLowerCase().includes(lc));
  // on screen first, then the ones a scroll away
  hit.sort((a, b) => (inV.has(b.i) ? 1 : 0) - (inV.has(a.i) ? 1 : 0));
  if (!hit.length) return { ok: false, msg: `no button labelled "${wanted}". Buttons on screen: ${s.buttons.map(b => `[${b.label}]`).join(' ') || '(none)'}. (Each separate call reopens the game: an open menu or sheet closes. Use batch to tap through a menu in one go.)` };
  const b = hit[0];
  const handle = await page.$(`[data-pt="${b.i}"]`);
  if (!inV.has(b.i)) {
    // --thumb: scroll only what a thumb can scroll. scrollIntoView also moves overflow:hidden boxes (the page itself), which
    // leaves the screen stuck half off where no player could put it; those are put back, and a button still out of reach fails.
    const reach = await handle.evaluate((e, thumb) => {
      const fixed = [];
      if (thumb) for (let a = e.parentElement; a; a = a.parentElement) { const o = getComputedStyle(a).overflowY; if ((o === 'hidden' || o === 'clip' || a === document.body || a === document.documentElement) && !/(auto|scroll)/.test(o)) fixed.push([a, a.scrollTop]); }
      if (thumb && document.scrollingElement && !fixed.some(f => f[0] === document.scrollingElement)) fixed.push([document.scrollingElement, document.scrollingElement.scrollTop]);
      e.scrollIntoView({ block: 'center' });
      for (const [a, top] of fixed) a.scrollTop = top;
      const r = e.getBoundingClientRect();
      return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
    }, flags.thumb);
    await page.clock.runFor(50);
    if (!reach) return { ok: false, msg: `"${b.label}" is off screen where a player cannot scroll to it` };
  }
  const box = await handle.boundingBox();
  if (!box) return { ok: false, msg: `"${b.label}" is not on screen` };
  // A real tap at the centre of the visible part: if something covers it, the tap lands on that instead, as it would for a player.
  const x = Math.min(innerW(page), box.x + box.width / 2), y = box.y + box.height / 2;
  const cover = await handle.evaluate((e, [px, py]) => { const t = document.elementFromPoint(px, py); return !t || t === e || e.contains(t) || t.contains(e) ? '' : (t.id ? '#' + t.id : '.' + String(t.className).split(' ')[0]); }, [x, y]);
  if (cover) return { ok: false, msg: `"${b.label}" is covered by something else (${cover}): a menu, dialog or tip is in front of it. Close that first.` };
  await page.mouse.click(x, y);
  const extra = hit.length > 1 ? ` (${hit.length} buttons matched; took the first${inV.has(b.i) ? '' : ', after scrolling'})` : '';
  return { ok: true, msg: `tapped [${b.label}]${b.disabled ? ' (it was greyed out)' : ''}${extra}` };
}
const innerW = page => page.viewportSize().width - 1;

// ---------------- commands ----------------
async function exec(cmd, args, ctx) {
  const { session, page, errors } = ctx;
  switch (cmd) {
    case 'look': { const r = await look(session, page, 'look'); return { text: r.text, data: r.data }; }
    case 'tap': {
      if (!args.length) die('tap needs a button label: tap "Begin as Wren"');
      const r = await tap(page, args.join(' '));
      if (r.ok) await settle(page); else process.exitCode = 1;   // a tap that could not be made is a failed command
      if (flags.quiet || !r.ok) return { text: r.msg, data: r };
      const l = await look(session, page, 'tap'); return { text: r.msg + '\n' + l.text, data: { ...r, look: l.data } };
    }
    case 'tap-if': {   // tap it when it is there, carry on when it is not (story cards come and go with timing)
      if (!args.length) die('tap-if needs a button label: tap-if "Skip"');
      const r = await tap(page, args.join(' '));
      if (r.ok) await run(page, 0.5);
      return { text: r.ok ? r.msg : `tap-if: no [${args.join(' ')}] on screen, carried on`, data: r };
    }
    case 'wait': {
      const secs = num(args[0], 'wait'); await run(page, secs);
      session.time = await page.evaluate(() => Date.now());
      const head = `waited ${fmtDur(secs)} of game time`;
      if (flags.quiet) return { text: head, data: { waited: secs } };
      const l = await look(session, page, 'wait'); return { text: head + '\n' + l.text, data: { waited: secs, look: l.data } };
    }
    case 'state': {
      session.time = await page.evaluate(() => Date.now());
      const o = summary(session, await readSave(page));
      return { text: fmtState(o), data: o };
    }
    case 'expect': {
      if (!args.length) die('expect needs text or a CSS selector: expect "Attack"');
      const want = args.join(' ');
      const ok = await page.evaluate(([w, scr]) => {
        const s = (new Function('return ' + scr))()();
        const sel = /^[#.\[]|^[a-z][a-z0-9-]*[#.\[>]/i.test(w) && !/\s{2}/.test(w);
        if (sel) { try { return [...document.querySelectorAll(w)].some(e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity !== 0; }); } catch (e) { /* not a selector: fall through to text */ } }
        const hay = (s.lines.join(' ') + ' ' + s.buttons.map(b => b.label).join(' ')).replace(/\s+/g, ' ').toLowerCase();
        return hay.includes(w.replace(/\s+/g, ' ').toLowerCase());
      }, [want, '(' + SCREEN.toString() + ')']);
      if (!ok) process.exitCode = 1;
      expects.push({ want, ok, viewport: page.viewportSize().width + 'x' + page.viewportSize().height });
      return { text: `EXPECT ${ok ? 'PASS' : 'FAIL'} "${want}"`, data: { expect: want, ok } };
    }
    case 'expect-no': {
      if (!args.length) die('expect-no needs text or a CSS selector: expect-no "open in another tab"');
      const want = args.join(' ');
      const seen = await page.evaluate(([w, scr]) => {
        const s = (new Function('return ' + scr))()();
        const sel = /^[#.\[]|^[a-z][a-z0-9-]*[#.\[>]/i.test(w) && !/\s{2}/.test(w);
        if (sel) { try { return [...document.querySelectorAll(w)].some(e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity !== 0; }); } catch (e) { /* not a selector: fall through to text */ } }
        const hay = (s.lines.join(' ') + ' ' + s.buttons.map(b => b.label).join(' ')).replace(/\s+/g, ' ').toLowerCase();
        return hay.includes(w.replace(/\s+/g, ' ').toLowerCase());
      }, [want, '(' + SCREEN.toString() + ')']);
      if (seen) process.exitCode = 1;
      expects.push({ want: 'no ' + want, ok: !seen, viewport: page.viewportSize().width + 'x' + page.viewportSize().height });
      return { text: `EXPECT-NO ${seen ? 'FAIL' : 'PASS'} "${want}"`, data: { expectNo: want, ok: !seen } };
    }
    case 'expect-save': {   // reads the stored save as it is (no pagehide save first, unlike `state`)
      const m = /^([A-Za-z_]\w*)(>=|<=|=|>|<)(-?[\d.]+)$/.exec(args.join(''));
      if (!m) die('expect-save needs <field><op><number>: expect-save gold>=12345');
      const o = await storedSave(page), v = o ? Number(o[m[1]]) : NaN, n = +m[3];
      const ok = { '>=': v >= n, '<=': v <= n, '=': v === n, '>': v > n, '<': v < n }[m[2]];
      if (!ok) process.exitCode = 1;
      expects.push({ want: 'save ' + m[0], ok, viewport: page.viewportSize().width + 'x' + page.viewportSize().height });
      return { text: `EXPECT-SAVE ${ok ? 'PASS' : 'FAIL'} ${m[0]} (stored ${m[1]} ${Number.isFinite(v) ? Math.floor(v) : 'missing'})`, data: { expectSave: m[0], ok, value: v } };
    }
    case 'stub-site': {   // pretend this is the Netlify page: window.LF_SITE with a send() that answers ok (default) or fail
      const ok = (args[0] || 'ok') !== 'fail';
      await page.evaluate(ok => { window.LF_SITE = { build: 'proof', send: () => Promise.resolve(ok) }; }, ok);
      return { text: `LF_SITE stubbed: send ${ok ? 'succeeds' : 'fails'}`, data: { stub: ok } };
    }
    case 'type': {   // fill the first visible text box, the way a player types
      if (!args.length) die('type needs the text: type "the first fight felt slow"');
      const box = await page.$('#sec-feedback textarea.feedback-note');
      if (!box) { process.exitCode = 1; return { text: 'type: no text box on screen', data: { ok: false } }; }
      await box.fill(args.join(' ')); await run(page, 0.5);
      return { text: 'typed ' + args.join(' '), data: { ok: true } };
    }
    case 'scroll': {   // scroll the biggest scrolled panel on screen (or the page) by most of a screen, as a thumb would
      const dir = args[0] === 'up' ? -1 : 1;
      const moved = await page.evaluate(([d, thumb]) => {
        const vh = innerHeight;
        const panes = [...document.querySelectorAll('*')].filter(e => { const cs = getComputedStyle(e), r = e.getBoundingClientRect();
          return /(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 4 && r.height > 80 && r.bottom > 0 && r.top < vh; })
          .sort((a, b) => b.clientHeight - a.clientHeight);
        const page = document.scrollingElement, el = panes[0] || (thumb && /hidden|clip/.test(getComputedStyle(document.body).overflowY) ? null : page);
        if (!el) return 0;   // --thumb: the page itself does not scroll for a player
        const before = el.scrollTop;
        el.scrollTop += d * Math.round((el === page ? vh : el.clientHeight) * 0.8);
        return el.scrollTop - before;
      }, [dir, flags.thumb]);
      await run(page, 0.3);
      return { text: moved ? `scrolled ${dir > 0 ? 'down' : 'up'}` : `nothing to scroll ${dir > 0 ? 'down' : 'up'}`, data: { scrolled: moved } };
    }
    case 'shot': {
      if (!args.length) die('shot needs a name: shot first-fight');
      const f = await namedShot(page, args[0]);
      return { text: `shot ${f}`, data: { shot: f } };
    }
    case 'burst': {
      if (!args.length) die('burst needs a name: burst parry');
      const fs6 = [];
      for (let i = 1; i <= 6; i++) { fs6.push(await namedShot(page, `${args[0]}-${i}`)); if (i < 6) await run(page, 0.3); }
      return { text: `burst ${fs6.length} frames: ${fs6[0]} .. ${fs6[5]}`, data: { burst: fs6 } };
    }
    default: die(`unknown command "${cmd}". Commands: look, tap, tap-if, wait, away, state, new, expect, expect-no, expect-save, scroll, shot, burst, stub-site, type, tab, batch`);
  }
}

// `away` and `new` change what the page is loaded from, so they close the page and open a new one.
async function main() {
  const [cmd, ...args] = pos;
  if (!cmd) die('give a command: look, tap "<label>", wait <seconds>, away <hours>, state, new [fresh|early|mid|late], batch');
  if (cmd === 'new') {
    const s = newSession(args[0] || 'fresh');
    console.log(flags.json ? JSON.stringify({ session: sessionDir, fixture: s.fixture }) : `new session (${s.fixture}) in ${sessionDir}`);
    return;
  }
  const session = loadSession();
  const browser = await bt.pw.chromium.launch({ executablePath: bt.exe, args: ['--no-sandbox'] });
  try {
    let ctx = { session, ...(await openPage(browser, session)) }; const allErrors = [];
    const results = [];
    const step = async (c, a) => {
      if (c === 'new') {
        const s = newSession(a[0] || 'fresh'); Object.assign(session, s);
        allErrors.push(...ctx.errors);
        await ctx.ctx.close();
        ctx = { session, ...(await openPage(browser, session)) };
        return { text: `new session (${s.fixture})`, data: { fixture: s.fixture } };
      }
      if (c === 'away') {
        const hours = num(a[0], 'away');
        session.save = await readSave(ctx.page) ?? session.save;
        session.time = await ctx.page.evaluate(() => Date.now()) + hours * 3600e3;
        allErrors.push(...ctx.errors);   // errors from the page being closed still count
        await ctx.ctx.close();
        ctx = { session, ...(await openPage(browser, session, true)) };   // the game opens again `hours` later and works out the away gains
        const l = await look(session, ctx.page, 'away');
        return { text: `away ${hours} h, then opened the game again\n` + l.text, data: { away: hours, look: l.data } };
      }
      if (c === 'tab') {   // two tabs of one game (card save-two-tabs): the same browser, the same storage
        const front = ctx.page, tabs = ctx.tabs, open = () => tabs.filter(Boolean), now = async () => Math.max(...await Promise.all(open().map(p => p.evaluate(() => Date.now()))));   // a closed tab keeps its number (null)
        if (a[0] === 'new') {
          await setHidden(front, true);
          const edits = a.slice(1).map(x => /^([A-Za-z_]\w*)=(-?[\d.]+)$/.exec(x) || die(`tab new takes field=number edits (got "${x}")`));
          if (edits.length) await front.evaluate(([k, ed]) => { const o = JSON.parse(localStorage.getItem(k)); for (const [f, v] of ed) o[f] = v; localStorage.setItem(k, JSON.stringify(o)); }, [KEY, edits.map(m => [m[1], +m[2]])]);
          const t = await openPage(browser, session, false, { ctx: ctx.ctx, errors: ctx.errors, time: await now() });
          tabs.push(t.page); ctx.page = t.page;
          return { text: `opened tab ${tabs.length} (tab ${tabs.indexOf(front) + 1} went to the background)${edits.length ? '; stored save edited first: ' + a.slice(1).join(' ') : ''}`, data: { tab: tabs.length } };
        }
        if (a[0] === 'close') {   // `tab close` closes the tab in front, `tab close <n>` a tab in the background (it is never shown again)
          if (open().length < 2) die('tab close needs another tab left open');
          const n = a[1] ? num(a[1], 'tab close') : tabs.indexOf(front) + 1, gone = tabs[n - 1];
          if (!gone) die(`no open tab ${n}`);
          if (gone === front) await setHidden(front, true);
          await gone.evaluate(() => dispatchEvent(new Event('pagehide')));
          tabs[n - 1] = null; await gone.close();
          if (gone === front) { ctx.page = open().pop(); await ctx.page.bringToFront(); await setHidden(ctx.page, false); await run(ctx.page, 0.5); }
          return { text: `closed tab ${n}; tab ${tabs.indexOf(ctx.page) + 1} is in front`, data: { closed: n } };
        }
        const n = num(a[0], 'tab'), to = tabs[n - 1];
        if (!to) die(`no open tab ${n}`);
        if (to !== front) { await setHidden(front, true); ctx.page = to; await to.bringToFront(); await setHidden(to, false); await run(to, 0.5); }
        return { text: `tab ${n} is in front`, data: { tab: n } };
      }
      return exec(c, a, ctx);
    };
    if (cmd === 'batch') {
      // Lines are read as they arrive, so a caller can keep one browser open and send the next command after reading
      // the last screen (tools/playtest-human.mjs does). A piped route file reads the same as before.
      for await (const rawLine of readline.createInterface({ input: process.stdin, crlfDelay: Infinity })) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const m = line.match(/"[^"]*"|\S+/g).map(t => t.replace(/^"|"$/g, ''));
        console.log(`> ${line}`);
        const was = ctx, seen = ctx.errors.length;
        const r = await step(m[0], m.slice(1)); results.push(r);
        if (flags.json && ctx === was && ctx.errors.length > seen) r.data = { ...r.data, pageErrors: ctx.errors.slice(seen) };   // say which command threw, not only at the end
        console.log(flags.json ? JSON.stringify(r.data) : r.text);
      }
    } else {
      const r = await step(cmd, args); results.push(r);
      console.log(flags.json ? JSON.stringify(r.data) : r.text);
    }
    session.save = await readSave(ctx.page) ?? session.save;
    session.time = await ctx.page.evaluate(() => Date.now());
    allErrors.push(...ctx.errors);
    if (expects.length) console.log(`EXPECTS: ${expects.filter(e => e.ok).length} pass, ${expects.filter(e => !e.ok).length} fail`);
    if (shotsOpt && expects.length) fs.writeFileSync(path.join(shotDir, 'expects.json'), JSON.stringify(expects, null, 1));
    if (allErrors.length) { console.log(`PAGE ERRORS (${allErrors.length}): ${allErrors.slice(0, 3).join(' | ')}`); process.exitCode = 1; }
    session.played = (session.played || 0) + ranSecs;
    fs.writeFileSync(sessionFile, JSON.stringify(session));
  } finally { await browser.close(); }
}
main().catch(e => { console.error('playtest: ' + (e && e.message || e)); process.exit(1); });
