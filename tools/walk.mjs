#!/usr/bin/env node
// Walk: a casual player plays the first hour of the built game, and the report says what a new player would hit
// (card qa-first-hour-walk; self-improving plan part 4). Report only until milestone M0 closes: exit 0 unless --strict.
//
//   node tools/build.mjs && node tools/walk.mjs --seed 1         one hero, 60 game minutes, 360x740, report in tools/.walk/
//
//   --seed <n>          seeds the game's random numbers and the bot's choices (default 1). The hero follows the seed
//                       (1 Wren, 2 Tobin, 3 Pip, then round again) unless --hero says otherwise.
//   --hero wren|tobin|pip       --size p|l         360x740 portrait (default) or 740x360 landscape
//   --minutes <n>       game minutes to play (default 60)      --html <file>   walk another build (default dist/lanternfall.html)
//   --clock-budget <n>  clock minutes the walk may take (default 30). If the game minutes would not fit it plays on until the
//                       budget is spent, writes the minute reached as the stop, and saves its save as snapshot-min<N>.json.
//   --parry <p>  --dodge <p>    the bot's skill: the share of foe hits it parries, and of the rest it dodges (default 0.55, 0.5)
//   --out <dir>         where the report, json, shots and snapshot go (default tools/.walk)    --date <YYYY-MM-DD>   the report's name
//   --scorecard <file>  add this run's F1-F6, F10 and P4 line to that scorecard (created when missing)
//   --reports <dir>     also copy walk-<date>.md/.json (and the shots) there, e.g. autopilot/reports
//   --strict            exit 1 when a scorecard target is missed         --quiet   no progress lines
//
// The player: reads LF_EYES (src/js/89-eyes-hook.js) and presses what a person presses. It reads each guide tip for 1.2 s and then
// presses what it names; it parries and dodges at the set rates when the foe winds up; it presses the timed ring at the right
// moment at the parry rate; it taps Next Up's Go and presses the one button the panel then offers (Craft, Claim, Equip, Spend, Build,
// Light, Start); it dismisses story cards, moment cards (Continue) and the picker. It never forces the game's state: nothing is set through `eval`, only read.
// Gear (walk-bot-gear): it wears what a casual player wears. It puts on any better bag piece (Craft > Gear > the piece > Equip), crafts the
// weapon, off-hand, head or body piece it is one tier short of (Craft > Make > station > tier > Craft), gathers the missing materials in the
// Gather view for up to 5 minutes (Hunting for hide), builds the station a recipe needs (Camp > Build, two taps), and goes back to the fight.
// It closes a sheet it left over the bar with the X. The report's "Gear and boss tries" table says what it wore in each zone and the boss tries lost there.
// Game time is a paused fake clock stepped in 100 ms frames (33 ms while a foe winds up); the page's frames are timers on it and CSS
// animations are moved by the same steps, so a run is repeatable for a seed and build (two runs give the same timeline).
// The bot waits for the guide: no fight press while it reads a new tip, nor in a turn's first 0.3 s (the guide polls every 250 ms).
//
// What it logs, with game time and a shot: every tip, toast, card and banner, every unlock (S.onboard.got), each zone first clear,
// level, unique, Star, new hero, look and craft. Each new tip, card and moment runs the eyes layout and tip-phase checks.
// The report diffs the run against docs/design/first-hour.md: each beat against the map's walk column (the bot's own time on a named
// build; over 50% off is listed: the game changed pace), and the median of walk / est once (est is a guess for a casual person).
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { findBrowser } from './lib/browser.mjs';
import { ROOT } from './lib/core.mjs';
import { LINT, TIPPHASE, PLACEHOLDERS, ALLOW } from './lib/eyes-readers.mjs';

// ---------------- options ----------------
const argv = process.argv.slice(2);
const flag = n => argv.includes('--' + n);
const opt = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
{ const known = ['snapshot', 'seed', 'hero', 'size', 'minutes', 'html', 'clock-budget', 'parry', 'dodge', 'out', 'date', 'scorecard', 'reports', 'strict', 'quiet'],
    bad = argv.filter(a => a.startsWith('--') && !known.includes(a.slice(2)));
  if (bad.length) { console.error('walk: unknown option ' + bad.join(', ') + '; known: ' + known.map(k => '--' + k).join(' ')); process.exit(2); } }
const num = (n, d) => { const v = Number(opt(n, d)); if (!Number.isFinite(v) || v < 0) { console.error(`walk: --${n} needs a number of zero or more`); process.exit(2); } return v; };
const SEED = num('seed', 1) | 0 || 1, MINUTES = num('minutes', 60), BUDGET_MS = num('clock-budget', 30) * 60e3;
const PARRY = num('parry', 0.55), DODGE = num('dodge', 0.5), READ = num('read', 0.77);   // READ: how often the bot reads a boss trick (a feint, or a held swing); 0.77 is the sampler's bot (0.3 + 0.6 x its 77.5% avoidance)
const HEROES = ['wren', 'tobin', 'pip'], HERO = opt('hero', HEROES[(SEED - 1) % 3]);
if (!HEROES.includes(HERO)) { console.error('walk: --hero is wren, tobin or pip'); process.exit(2); }
const SIZE = opt('size', 'p') === 'l' ? { id: 'landscape', w: 740, h: 360 } : { id: 'portrait', w: 360, h: 740 };
const DATE = opt('date', new Date().toISOString().slice(0, 10));
const OUT = path.resolve(ROOT, opt('out', 'tools/.walk'));
const SHOTS = path.join(OUT, 'shots');
const htmlFile = path.resolve(ROOT, opt('html', 'dist/lanternfall.html'));
const QUIET = flag('quiet');
const say = s => { if (!QUIET) process.stderr.write('walk: ' + s + '\n'); };

const bt = findBrowser();
if (!bt.pw || !bt.exe) { console.log('walk: skipped: ' + (bt.reason || 'no browser found')); process.exit(0); }
if (!fs.existsSync(htmlFile)) { console.error('walk: ' + htmlFile + ' is missing: run node tools/build.mjs'); process.exit(2); }

// ---------------- the page ----------------
// The artifact host wraps the page in a document skeleton with a device-width viewport; do the same. `window.__t.x` evaluates inside
// the game's scope; the walk uses it to READ state (a counter, a list), never to set it.
const KEY = 'lanternfall.save.v5';
function pageHtml() {
  let h = fs.readFileSync(htmlFile, 'utf8');
  if (!h.includes('LF_EYES')) { console.error('walk: this build has no LF_EYES (src/js/89-eyes-hook.js)'); process.exit(2); }
  const end = h.lastIndexOf('})();\n</script>');
  if (end < 0) { console.error('walk: the build has no closing script marker to hook'); process.exit(2); }
  return '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n' + h.slice(0, end) + '\n;window.__t = { x: src => eval(src) };\n' + h.slice(end);
}
const INIT = ([key, seedN]) => {
  let a = seedN >>> 0 || 1;   // mulberry32: the game's own random numbers
  Math.random = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  try { localStorage.removeItem(key); } catch (e) { /* a private window: the game starts fresh anyway */ }
  window.__ptStep = 16;
  const caf = window.cancelAnimationFrame.bind(window), tids = new Set();
  // every frame is a timer on the paused clock, at 16 ms or the walk's step: the clock's own frame grid is set by when the page
  // happened to load, which moved the game's frames by up to 16 ms between runs (first-hour-map-two-clocks)
  window.requestAnimationFrame = cb => { const id = window.setTimeout(() => { tids.delete(id); cb(performance.now()); }, window.__ptStep); tids.add(id); return id; };
  window.cancelAnimationFrame = id => { if (tids.delete(id)) window.clearTimeout(id); else try { caf(id); } catch (e) { /* a timer id the fake clock made */ } };   // a mode switch cancels a frame the 100 ms stepping made with a timer   // the game caps a frame at 0.1 s, so 100 ms frames lose nothing
};

// A small seeded generator for the bot's own choices (the game's random numbers are its own stream).
let botSeed = SEED * 2654435761 >>> 0;
const rnd = () => { botSeed = (botSeed + 0x6D2B79F5) | 0; let t = Math.imul(botSeed ^ (botSeed >>> 15), 1 | botSeed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// ---------------- the log ----------------
const log = [];                  // { t, kind, text, shot, extra }
let gt = 0;                      // game seconds since the page opened
let firstTapAt = null;
let shotN = 0, shotsLeft = 90;
const fmtT = t => { const m = Math.floor(t / 60), s = Math.floor(t % 60); return m + ':' + String(s).padStart(2, '0'); };
async function shot(page, tag) {
  if (shotsLeft <= 0) return '';
  shotsLeft--;
  const f = `${String(++shotN).padStart(2, '0')}-${tag.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 40)}-${fmtT(gt).replace(':', 'm')}.png`;
  try { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, f) }); return f; } catch (e) { return ''; }
}
async function note(page, kind, text, o = {}) {
  const e = { t: Math.round(gt * 10) / 10, kind, text, ...o.extra };
  if (o.shot !== false) e.shot = await shot(page, o.tag || kind + '-' + text);
  log.push(e);
  if (!QUIET && o.say !== false) process.stderr.write(`  ${fmtT(gt).padStart(5)} ${kind.padEnd(8)} ${text.slice(0, 100)}\n`);
  return e;
}

// ---------------- the in-page reader (one round trip per frame) ----------------
const OBS = `(() => {
  const vis = n => { for (let e = n; e && e !== document.body && e !== document.documentElement; e = e.parentElement) { if (e.hidden) return false; const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.1) return false; } const r = n.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
  const tx = n => (n.textContent || '').replace(/\\s+/g, ' ').trim();
  const q = (sel, f) => [...document.querySelectorAll(sel)].filter(vis).map(f || tx);
  const o = { phase: LF_EYES.phase(), tip: LF_EYES.tip(), sfx: LF_EYES.sfx() };
  o.toasts = q('#toasts .toast');
  o.cards = q('.mm-ov, .mm-toast, .bsheet-ov, .tv-card, .cb-banner, .tv-banner, .gl-card, .away-ov, .modal, .dd-feat, .feat-card', n => ({ cls: (n.className || '').toString().split(' ')[0], text: tx(n).slice(0, 160) }));
  o.tabs = q('.tabs .tab');
  o.intro = (n => n && vis(n) ? [n.querySelector('.intro-who'), n.querySelector('.intro-line')].filter(Boolean).map(tx).join(' ') : '')(document.querySelector('#introScreen'));   // the drawn opening: one line a tap
  o.create = !!document.querySelector('#createScreen') && vis(document.querySelector('#createScreen'));
  o.floats = LF_EYES.floats().map(f => f.txt).slice(0, 6);
  let s = {};
  try { s = { zone: S.zone, maxZone: S.maxZone, L: S.L, gold: Math.floor(S.gold), kills: S.totalKills, got: Object.assign({}, S.onboard && S.onboard.got), t: S.onboard && S.onboard.t,
    found: Object.keys(S.found || {}).length, stars: Object.keys((S.stars && S.stars.own) || {}).length, heroes: Object.keys((S.party && S.party.unlock && S.party.unlock.heroes) || {}).length,
    looks: typeof deeds === 'object' ? deeds.looks().filter(l => l.got).length : 0, forged: S.deeds && S.deeds.n ? S.deeds.n.forged : 0, up: S.deeds && S.deeds.n ? S.deeds.n.up || 0 : 0, act: S.activity, tab: S.tab,
    acted: (() => { try { return Object.fromEntries(FEATURES.map(f => [f.id, !!(f.now && f.now())])); } catch (e) { return {}; } })() };
  } catch (e) { s = { err: String(e).slice(0, 80) }; }
  o.s = s;
  // craft-delta: the game's 'choice' and 'firstUse' events, kept in a page array the walk drains each frame (it never assigns to S)
  if (!window.__walkEv) { window.__walkEv = []; try { on('choice', k => window.__walkEv.push(['choice', k])); on('firstUse', k => window.__walkEv.push(['firstUse', k])); } catch (e) {} }
  o.ev = window.__walkEv.splice(0);
  return o;
})()`;

// ---------------- driving ----------------
let browser, ctx, page;
const X = async s => { for (let i = 0; i < 50; i++) { const r = await page.evaluate(s => window.__t ? { v: window.__t.x(s) } : null, s); if (r) return r.v; await new Promise(r => setTimeout(r, 100)); } throw new Error('the game never started (window.__t is missing)'); };
// CSS animations and transitions run on the page's own timeline, which the fake clock does not move: left alone they play in clock
// time, so what the bot sees (a card fading in, a sheet sliding) depended on how fast the machine ran, and one seed gave three first
// fights (first-hour-map-two-clocks). The walk stops that timeline (Animation.setPlaybackRate 0) and moves every animation on by the
// game time it steps (after each runFor chunk of up to 1 s), so a run is the same on any machine. A paused animation stays where the game put it.
const STEP_ANIM = d => { for (const a of document.getAnimations()) { if (a.playState === 'paused' || a.playState === 'finished') continue; try { a.currentTime = (a.currentTime || 0) + d; } catch (e) { /* an animation with no timeline */ } } };
async function advance(ms, step) {
  await page.evaluate(c => { window.__ptStep = c; }, step);
  let left = ms; while (left > 0) { const d = Math.min(left, 1000); await page.clock.runFor(d); await page.evaluate(STEP_ANIM, d); left -= d; }
  gt += ms / 1000;
}
// A real tap at the centre of the first visible match (no actionability waits: they need animation frames, and the clock is fake).
// If something else sits on top of the button, the tap lands on that, as it would for a player: it is logged and not pressed.
const TAP = ([sel, re]) => {
  const rx = re ? new RegExp(re, 'i') : null;
  for (const n of document.querySelectorAll(sel)) {
    if (n.hidden || n.disabled || (rx && !rx.test((n.textContent || '').trim()))) continue;
    let ok = true; for (let e = n; e && e !== document.body; e = e.parentElement) { const s = getComputedStyle(e); if (e.hidden || s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.1) { ok = false; break; } }
    if (!ok) continue;
    n.scrollIntoView({ block: 'nearest' });
    const r = n.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    const x = Math.min(innerWidth - 1, Math.max(1, r.left + r.width / 2)), y = Math.min(innerHeight - 1, Math.max(1, r.top + r.height / 2));
    const top = document.elementFromPoint(x, y);
    if (top && top !== n && !n.contains(top) && !top.contains(n)) return { covered: (top.id ? '#' + top.id : '.' + String(top.className).split(' ')[0]), sheet: !!(top.closest && top.closest('.bsheet-ov')), what: (top.closest && top.closest('.bsheet-ov') || top).textContent.replace(/\s+/g, ' ').trim().slice(0, 50), x, y };
    return { x, y };
  }
  return null;
};
// The text selector `a:text(Fight)` is `a` whose text matches /Fight/.
// Is a sheet up with its X in view and still? (a sheet slides in and out: its X is off screen or moving for a moment)
const SHEET_STATE = () => { const ov = document.querySelector('.bsheet-ov'); if (!ov) return 'none'; const x = ov.querySelector('.bsheet-x'), r = x && x.getBoundingClientRect();
  return ov.getAnimations({ subtree: true }).some(a => a.playState === 'running') || !r || r.top < 0 || r.bottom > innerHeight || r.width < 2 ? 'moving' : 'still'; };
async function click(sel, _to) {
  const [css, re] = sel.split(':text(').map((v, i) => i ? v.replace(/\)$/, '') : v);
  let r = await page.evaluate(TAP, [css, re || '']);
  if (!r) return false;
  if (process.env.WALK_DEBUG) console.error('  tap', css, re || '', JSON.stringify(r));
  // Something sits on the button. A player waits a beat for a toast or a sliding sheet to clear, closes a sheet the bot left open with its
  // X, and presses again. Only a cover that stays after that is a finding.
  for (let i = 0; r.covered && (r.sheet || /toast|bsheet|mm-/.test(r.covered)) && i < 5; i++) {
    if (r.sheet && !css.includes('bsheet-x')) {
      const ss = await page.evaluate(SHEET_STATE);
      if (ss === 'still') {
        const x = await page.evaluate(TAP, ['.bsheet-ov .bsheet-x', '']);
        if (process.env.WALK_DEBUG) console.error('  close-sheet', css, JSON.stringify(x));
        if (x && !x.covered) { await page.mouse.click(x.x, x.y); st.sheetsClosed = (st.sheetsClosed || 0) + 1; }
      }
    }
    await advance(300, 16);
    r = await page.evaluate(TAP, [css, re || '']);
    if (!r) return false;
  }
  if (r.covered) { addCheck('covered', `a button the player needs is covered (${css})`, `a tap at ${Math.round(r.x)},${Math.round(r.y)} would land on ${r.covered}${r.sheet ? ' (a sheet: "' + r.what + '")' : ''}`); return false; }
  await page.mouse.click(r.x, r.y);
  if (firstTapAt === null) firstTapAt = gt;
  if (st.firstPress === null && css.includes('#soloBar')) st.firstPress = gt;   // F1: the player's first fight press
  return true;
}
const DISMISS = '.mm-ov .mm-go, .bsheet-ov .sty-done, .bsheet-ov .sty-skip, .bsheet-ov .big, .bsheet-ov button.ok, .away-ov button, .tv-card button, .gl-card button, .modal .ok, .modal .big';

// ---------------- the player ----------------
const st = { tipKey: '', tipSince: 0, defKey: '', defDo: '', defDone: false, ringKey: '', stuckSince: 0, lastAct: 0, nuAt: -99, panelAt: -99, cardSeen: new Map(), toastSeen: new Set(), got: {}, prev: null, calls: {} };
const BTN_OK = n => `(() => { const n = document.querySelector(${JSON.stringify(n)}); return !!n && !n.hidden && n.getClientRects().length > 0 && !n.disabled && !['off', 'cd', 'cool', 'nope', 'empty'].some(c => n.classList.contains(c)); })()`;
const turnSnap = () => X('(() => { const q = turnCombatSnapshot(); return { now: q.now, phase: q.phase, canDefend: q.canDefend, open: Math.min(q.parryOpensAt || 1e9, q.dodgeOpensAt || 1e9), po: q.parryOpensAt, dopen: q.dodgeOpensAt, close: q.closesAt, feint: q.feint, hf: q.holdFrom, hit: q.move ? q.move.hit : -1, mv: q.move ? q.move.id : "", timing: q.timing }; })()');

// One look at the fight and one press. Returns true when it pressed something.
async function fight(o) {
  const ph = o.phase;
  if (ph !== 'parry or dodge window' && ph !== 'foe wind-up') st.defKey = '';   // each try restarts the fight clock, so the same move can carry the same key: roll for every new foe hit
  if (ph === 'player turn') {
    // the timed ring first (press the lit ability again), then an ability that is ready, else Attack
    const live = await page.evaluate(() => !!document.querySelector('#soloBar .sb-abslot.live'));
    if (live) {
      const q = await turnSnap();
      if (q.timing && st.ringKey !== q.timing.id + q.timing.i) {
        // the ring closes at timing.closesAt: press near the end at the parry rate, otherwise late (a miss)
        if (!st.ringDo) st.ringDo = rnd() < PARRY ? 'good' : 'miss';
        const left = q.timing.closesAt - q.now;
        if ((st.ringDo === 'good' && left < 0.22) || (st.ringDo === 'miss' && left < 0.04)) { st.ringKey = q.timing.id + q.timing.i; st.ringDo = ''; await click('#soloBar .sb-abslot.live', 200); return true; }
      }
      return false;
    }
    for (const b of ['#soloBar .sb-ab0', '#soloBar .sb-ab1', '#soloBar .sb-ab2']) if (await page.evaluate(BTN_OK(b))) return await click(b, 200);
    return await click('#soloBar .sb-atk', 200);
  }
  if (ph === 'parry or dodge window' || ph === 'foe wind-up') {
    const q = await turnSnap();
    if (!q.canDefend) return false;
    const key = q.mv + ':' + q.hit + ':' + q.close;
    if (key !== st.defKey) {
      st.defKey = key; const r = rnd(); st.defDo = r < PARRY ? 'parry' : rnd() < DODGE ? 'dodge' : ''; st.defAt = 0.35 + 0.4 * rnd(); st.defEarly = false;
      // a boss trick (59k TURN_TUNE.tricks): a bot that means to defend reads it with chance READ; else a feint fools it and a held swing meets its press too early
      if (st.defDo && (q.feint || q.hf > 0)) { if (rnd() >= READ) st.defEarly = true; else if (q.feint) st.defDo = ''; }
    }
    if (!st.defDo) return false;
    if (st.defEarly) { if (q.now >= (q.hf || 0)) { const b = st.defDo === 'parry' ? '#soloBar .sb-parry' : '#soloBar .sb-dodge'; st.defDo = ''; return await click(b, 200); } return false; }
    const open = st.defDo === 'parry' ? q.po : q.dopen, w = q.close - open;
    if (q.now >= open + w * st.defAt) { const b = st.defDo === 'parry' ? '#soloBar .sb-parry' : '#soloBar .sb-dodge'; st.defDo = ''; return await click(b, 200); }
  }
  return false;
}

// A player follows the guide: reads the tip for 1.2 s, then presses what it names (or Got it on a reading step).
async function followTip(o) {
  const tp = o.tip, key = tp ? tp.action + '|' + tp.text.replace(/\d+/g, '#') : '';   // live counts (Ore 3/25) do not make a new tip
  if (key !== st.tipKey) {
    if (!tp || tp.action !== st.tipAct) { st.tipTaps = 0; st.tipAct = tp ? tp.action : ''; }   // the count follows the step, not each sentence it shows
    st.tipKey = key; st.tipSince = gt; st.tipFirst = gt;
    if (tp && (key !== st.tipNoted || gt - st.tipNotedAt > 20)) {   // a tip that goes behind a card and comes back is one tip
      st.tipNoted = key; st.tipNotedAt = gt;
      await note(page, 'tip', `${tp.action || 'read'}: ${tp.text}`, { extra: { phase: o.phase, action: tp.action, kills: o.s.kills || 0 }, tag: 'tip-' + tp.action });
      for (const f of await page.evaluate(LINT)) { if (f.pair && ALLOW[f.pair]) continue; addCheck('layout', 'tip "' + tp.text.slice(0, 40) + '": ' + f.what, f.detail); }
      for (const [what, detail] of (await page.evaluate(TIPPHASE)).bad) addCheck('tipphase', what, detail);
    }
    return false;
  }
  if (!tp || gt - st.tipSince < 1.2) return false;
  if (tp.button && !tp.button.hidden && !tp.button.greyed) { st.tipSince = gt; return await click(tp.button.sel, 300); }
  if (await click('.ob-ok', 300)) { st.tipSince = gt; return true; }
  // a step that points at something (a tab, a node, a recipe): tap what the marker rings; if that leads nowhere after two taps,
  // read the sentence like a person and tap the tab or button it names ("Open Training." -> Training)
  if (!tp.button && st.tipTaps < 16 && gt - st.tipSince >= 1.2) {
    st.tipTaps++; st.tipSince = gt;
    // an info notice (unlock-voice: "The Hero tab's open…") has a × and no ring: a player reads it and closes it
    if (!tp.target && /^(say|use):/.test(tp.action) && await click('.ob-bub .ob-x', 300)) { st.tipTaps = 0; return true; }
    if (st.tipTaps >= 2 && st.tipTaps % 2 === 0) {
      const m = /\b(?:[Oo]pen|[Tt]ap|[Pp]ress|[Pp]ick|[Cc]hoose|[Ll]ight|[Bb]uild|[Cc]raft|[Cc]hop|[Mm]ine|[Ss]tart|[Cc]laim|[Ee]quip|[Gg]o to)\s+(?:the\s+|your\s+)?([A-Z]\w*(?:\s[A-Z]\w*)?)/.exec(tp.text);
      if (m && await click('button, [role=tab], .tab:text((^|\\W|New)' + m[1] + '\\s*$)', 300)) return true;
      // a first-use line has no marker and never pauses: it clears itself, so there is nothing to tap (guide-target-guard)
      if (st.tipTaps === 4 && !/^use:/.test(tp.action) && !/\d+\s*\/\s*\d+/.test(tp.text)) addCheck('guide', 'a tip\'s marker leads nowhere: "' + tp.text.slice(0, 60) + '"', `tapped the ringed spot twice and the tip stayed; ring at ${tp.target ? Math.round(tp.target.x) + ',' + Math.round(tp.target.y) + ' ' + Math.round(tp.target.w) + 'x' + Math.round(tp.target.h) : 'none'}`);
    }
    if (tp.target) {
      const x = Math.min(SIZE.w - 1, Math.max(1, tp.target.x + tp.target.w / 2)), y = Math.min(SIZE.h - 1, Math.max(1, tp.target.y + tp.target.h / 2));
      await page.mouse.click(x, y); if (firstTapAt === null) firstTapAt = gt; return true;
    }
  }
  return false;
}
let toolFault = false;
const checks = new Map();
function addCheck(check, what, detail) { const k = check + '|' + what; const c = checks.get(k); if (c) { c.n++; return; } checks.set(k, { check, what, detail, n: 1, t: Math.round(gt), shot: '' }); }

// Picker and story cards. A card is read for 2.4 s (a person's glance) before Continue / Skip.
async function pickHero() {
  if (!(await click(`#createScreen .ccard[data-hero="${HERO}"]`, 600))) return false;
  await advance(200, 16);
  return await click('#createScreen .create-go', 600);
}
async function dismissCards(o) {
  const seen = st.cardSeen, now = new Set();
  for (const c of o.cards) {
    const sig = c.cls + '|' + c.text.slice(0, 50); now.add(sig);
    let r = seen.get(sig);
    if (/beat you/i.test(c.text) && !seen.has(sig)) { st.beaten = (st.beaten || 0) + 1; const bz = st.prev ? st.prev.zone : 0; st.tries = st.tries || {}; st.tries[bz] = (st.tries[bz] || 0) + 1; if (st.beaten === 5) addCheck('wall', 'the casual bot was beaten 5 times by one boss', c.text.slice(0, 80) + ' (parry rate ' + PARRY + ')'); }
    if (!r) { r = { first: gt, last: gt, cls: c.cls, text: c.text, n: 0 }; seen.set(sig, r); await note(page, 'card', c.text, { extra: { cls: c.cls }, tag: 'card-' + c.cls }); }
    r.last = gt;
  }
  for (const [sig, r] of seen) if (!now.has(sig) && !r.done) { r.done = true; r.dwell = Math.round((gt - r.first) * 10) / 10; }
  // a Next Up list left open (its Go was covered by a card) is closed with its X, as a player would
  const nu = [...now].map(g => seen.get(g)).find(r => r.cls === 'bsheet-ov' && /^×Next up/.test(r.text));
  if (nu && gt - nu.last < 1 && gt - nu.first >= 8 && gt - st.lastCard >= 0.6 && ![...now].some(g => seen.get(g).cls === 'mm-ov')) { st.lastCard = gt; if (await click('.bsheet-ov .bsheet-x', 300)) { nu.first = gt; return true; } }
  // any other sheet left open (a gear picker a tip's tap opened, a menu card) is closed with its X after 8 s: a player does not leave one up
  { const sh = [...now].map(g => seen.get(g)).find(r => r.cls === 'bsheet-ov' && gt - r.first >= 8);
    if (sh && !o.tip && ![...now].some(g => { const r = seen.get(g); return r.cls === 'mm-ov' || r.cls === 'mm-toast'; }) && gt - st.lastCard >= 0.6) { st.lastCard = gt; if (await click('.bsheet-ov .bsheet-x', 300)) { sh.first = gt; st.sheetsClosed = (st.sheetsClosed || 0) + 1; return true; } } }
  // press the first thing that closes a card once the oldest visible one has been up 2.4 s
  // the card a player is reading is the one on top (a moment card), not an older sheet beneath it
  const all = [...now].map(s => seen.get(s)), top = all.filter(r => r.cls === 'mm-ov' || r.cls === 'mm-toast').sort((a, b) => b.first - a.first)[0];
  const oldest = top || all.sort((a, b) => a.first - b.first)[0];
  if (oldest && gt - oldest.first >= 2.4 && gt - st.lastCard >= 0.6) { st.lastCard = gt; for (const d of DISMISS.split(', ')) if (await click(d, 300)) return true; }   // the card on top first: a sheet's own button can sit under it
  return false;
}
st.lastCard = -9; st.tabAt = -9; st.phAt = 0; st.phName = ''; st.phStart = 0; st.tipFirst = 0; st.firstPress = null;

// Next Up: when the chip says Ready, open the list, press Go on the first ready goal the bot has not given up on, and press what
// the place Go lands on offers. Since #115 that place is not always a flashed row: Learn opens the ability's detail sheet, whose
// button sits outside .nu-flash, and Spend opens the Attributes view. A goal whose last 4 presses changed nothing is a finding; the
// bot moves on to the next ready goal rather than idling on the chip. A press that changed the save (walk-bot-retry-counts: the
// fingerprint below) sets the goal's count back to 0, so "Spend 28 attribute points" is pressed again each time it comes back.
// It only presses what a player can see.
const GO_WORDS = /^(craft|claim|equip|spend|build|light|start|collect|learn|use|buy|train|upgrade|promote|open|forge|brew|set|wear|cook|hire|send|accept|ok|got it|continue|smelt|saw|weave|tan|strike|infuse|retune)\b/i;
const goalKey = l => l.replace(/\d+/g, '#');
// What a press can change, read (never set) just before Go and just after the press. Gold and materials rise from fights while
// the list is open, so only a drop counts for those.
const PRESS_FP = `(() => { const mats = {}; for (const [k, a] of Object.entries(S.mats || {})) mats[k] = (a || []).reduce((x, n) => x + (n || 0), 0);
  try { mats.ess = essHave(); } catch (e) {}
  return { k: JSON.stringify([S.attr, S.equip, S.items.length, S.abil && S.abil.unl, S.camp.b, S.camp.builds]), gold: S.gold, mats }; })()`;
const pressChanged = (a, b) => a.k !== b.k || b.gold < a.gold || Object.keys(a.mats).some(k => (b.mats[k] || 0) < a.mats[k]);
async function followNextUp(o) {
  const chipReady = await page.evaluate(`(() => { const c = document.getElementById('nuChip'); return !!c && !c.hidden && c.getClientRects().length > 0 && c.classList.contains('ready') ? (c.querySelector('.nu-lbl') || c).textContent.trim() : ''; })()`);
  if (!chipReady) return false;
  if (!(await click('#nuChip', 300))) return false;
  await advance(300, 16);
  const rows = await page.evaluate(() => [...document.querySelectorAll('.nu-row.ready')].filter(r => r.getClientRects().length).map(r => (r.querySelector('.nu-lbl') || r).textContent.trim()));
  const holdFight = st.gear.owns && st.gear.sess && !st.gear.sess.gaveUp;   // gathering for a gear goal: the boss row waits
  const label = rows.find(l => (st.calls[goalKey(l)] || 0) < 4 && !(holdFight && /^boss ready|boss is next|^the zone \d+ boss/i.test(l)));   // a goal the casual player cannot finish is a finding, not a loop
  const closeList = () => click('.bsheet-ov .bsheet-x', 200);
  if (label === undefined) { await closeList(); return false; }
  st.calls[goalKey(label)] = (st.calls[goalKey(label)] || 0) + 1;
  const fpBefore = await X(PRESS_FP);
  const marked = await page.evaluate(l => { for (const r of document.querySelectorAll('.nu-row.ready')) if ((r.querySelector('.nu-lbl') || r).textContent.trim() === l) { const g = r.querySelector('.nu-go'); if (g) { g.setAttribute('data-walk', '1'); return true; } } return false; }, label);
  const eqBefore = await X('JSON.stringify(S.equip)');
  const went = marked && await click('[data-walk="1"]', 300);
  await page.evaluate(() => document.querySelectorAll('[data-walk]').forEach(n => n.removeAttribute('data-walk')));
  if (!went) { await closeList(); return false; }
  await advance(400, 16);
  let did = '';
  if (/^Learn\b/i.test(label)) {   // the detail sheet's Learn takes two taps (the first arms it)
    for (let i = 0; i < 2; i++) {
      if (!(await click('.ab-learn', 300))) break;
      await advance(250, 16); did = i ? 'Learn (twice)' : 'Learn';
    }
  } else if (/^Upgrade your\b/i.test(label)) {   // craft-delta: Go opens the piece's sheet on Hero, Gear; press its Upgrade button, then close it
    if (await click('.bsheet-ov button:text(^Upgrade to \\+)', 300)) { did = 'Upgrade'; await advance(250, 16); }
    await click('.bsheet-ov .bsheet-x', 200);
  } else if (/^Equip\b/i.test(label)) {   // next-up-equip: Go puts the piece on at once, with no panel to press
    did = (await X('JSON.stringify(S.equip)')) !== eqBefore ? 'Go put it on' : '';
  } else if (/attribute point/i.test(label)) {   // a casual player taps Spread evenly
    if (await click('.at-spread', 300)) { did = 'Spread evenly'; await advance(250, 16); }
    for (let i = 0; i < 6 && await page.evaluate(() => [...document.querySelectorAll('.at-add[data-n="1"]')].some(b => !b.disabled && b.getClientRects().length)); i++) { if (!(await click('.at-add[data-n="1"]', 200))) break; await advance(150, 16); did = 'Spread evenly, +1'; }
  } else if (/ready to build$/i.test(label)) {   // camp-build: Go opens the station's card in Camp; press its Build button (two taps, as the gear routine does)
    const nm = label.replace(/:.*$/, '').replace(/\s+Lv\s*\d+$/i, '').trim();
    const id = await page.evaluate(nm => { const f = document.querySelector('.nu-flash[id^="camp-b-"]'); if (f) return f.id.slice(7);
      const c = [...document.querySelectorAll('[id^="camp-b-"]')].find(c => c.getClientRects().length && ((c.querySelector('.cb-nm span') || {}).textContent || '').trim() === nm); return c ? c.id.slice(7) : ''; }, nm);
    if (id && await pressBuild(id)) did = 'Build';
  } else {
    // the flash lasts 1.6 s; find the panel's one button and press it with a real tap (a covered button is then a finding)
    if (/^Craft\b/i.test(label)) {   // Go focuses the Craft list and flashes the row's own Craft button (#forgeBtn): press the .cf-go in the .cf-rec row the goal names
      const nm = label.replace(/:.*$/, '').replace(/^craft\s+(a |an )?/i, '').replace(/\s+for the zone \d+ boss$/i, '').trim();
      const ok = await page.evaluate(nm => { const r = [...document.querySelectorAll('.cf-rec')].find(r => r.getClientRects().length && ((r.querySelector('.cf-rec-n') || {}).textContent || '').trim() === nm);
        const b = r && r.querySelector('.cf-go'); if (!b || b.disabled) return false; b.setAttribute('data-walk', '1'); return true; }, nm);
      if (ok && await click('[data-walk="1"]', 300)) did = 'Craft';
      await page.evaluate(() => document.querySelectorAll('[data-walk]').forEach(n => n.removeAttribute('data-walk')));
    }
    const pick = did ? '' : await page.evaluate(`(() => { const hit = document.querySelector('.nu-flash'); if (!hit) return ''; const bs = [...hit.querySelectorAll('button, [role=button], .btn, .big')].filter(b => !b.disabled && b.getClientRects().length && !b.classList.contains('off'));
      const b = bs.find(b => ${GO_WORDS}.test((b.textContent || '').trim())) || bs[0]; if (!b) return ''; b.setAttribute('data-walk', '1'); return (b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 40) || 'button'; })()`);
    if (!did) did = pick && (await click('[data-walk="1"]', 300)) ? pick : '';
    if (!did) {   // no flashed row: the row in the open menu that names the goal's thing ("Craft a Copper Pickaxe" -> the Copper Pickaxe row)
      const name = label.replace(/:.*$/, '').replace(/^(craft|build|make|claim|equip|light|upgrade)\s+(a |an |the |your )?/i, '').replace(/\s+(lv|level)\s*\d+.*$/i, '').replace(/\s+for the zone \d+ boss$/i, '').replace(/\s+to \+\d+$/, '').trim();   // craft-delta: "Craft a Pine Bow for the zone 2 boss", "Upgrade your Pine Bow to +1"
      const alt = name.length > 3 && await page.evaluate(([nm, re]) => { const rx = new RegExp(re, 'i'), rows = [...document.querySelectorAll('#panels .row, #panels .recipe, #panels li')].filter(r => r.getClientRects().length && r.textContent.includes(nm)).filter((r, _i, all) => !all.some(o => o !== r && r.contains(o)));
        for (const r of rows) { const b = [...r.querySelectorAll('button')].find(b => !b.disabled && b.getClientRects().length && rx.test((b.textContent || '').trim())); if (b) { b.setAttribute('data-walk', '1'); return (b.textContent || '').trim().slice(0, 40); } } return ''; }, [name, GO_WORDS.source]);
      did = alt && (await click('[data-walk="1"]', 300)) ? alt : '';
      await page.evaluate(() => document.querySelectorAll('[data-walk]').forEach(n => n.removeAttribute('data-walk')));
    }
    await page.evaluate(() => document.querySelectorAll('[data-walk]').forEach(n => n.removeAttribute('data-walk')));
  }
  await note(page, 'nextup', `${label}${did ? ' -> pressed "' + did + '"' : ' -> nothing to press'}`, { extra: { goal: label, pressed: did } });
  if (did && pressChanged(fpBefore, await X(PRESS_FP))) st.calls[goalKey(label)] = 0;   // it worked: not a stuck goal
  await advance(500, 16);
  await click('.tabs .tab:text(Fight)', 300);
  return true;
}


// Gear: a casual player crafts what Next Up and the Forge offer and then puts it on. Next Up's craft goal never says "Equip", so a
// crafted piece sits in the bag: the bot opens Craft > Gear, taps the piece and presses Equip. For a gear goal that is short of
// materials it opens the Gather view of the missing material and works there until the goal is ready, then crafts it at its station.
// Reads (the goal, the bag) come from the game's own rules; every change is a tap. The goal: the combat slot (weapon, off-hand, head,
// body) with the lowest tier worn, one tier up, for a station the camp has built and a tier the zone has opened.
const GEAR_Q = `(() => {
  const POS = ['weapon', 'off', 'helm', 'body'], zt = Math.min(5, zoneTier(S.maxZone)), who = heroWho(), worn = equippedIds();
  const kindsFor = pos => { const row = CRAFT_FITS[pos] || {}, own = who !== 'any' ? row[who] || [] : []; return (own.length ? own : row.any || []).filter(k => !CRAFT_KINDS[k].legacy && craftKindVisible(k) && fits(k, pos, 'hero')); };
  const viewOpen = k => k === 'ess' ? false : k === 'hide' ? huntingOn() && isUnlocked('forage') && navSkillOpen('hunt') : k === 'fibre' || k === 'herb' ? isUnlocked('forage') : true;   // Essence comes from fights; Foraging and Hunting open later
  const wear = [];
  for (const pos of Object.keys(S.equip)) {
    const cur = equipped(pos); let best = null;
    for (const it of S.items) { if (worn.has(it.id) || kindPos(it.slot) !== pos || !craftKindVisible(it.slot) || !fits(it, pos, 'hero')) continue; if (cur && itemPower(cur) >= itemPower(it)) continue; if (!best || itemPower(it) > itemPower(best)) best = it; }
    if (best) wear.push({ id: best.id, pos, nm: itemName(best) });
  }
  let goal = null;
  for (const [pi, pos] of POS.entries()) {
    if (!craftKindVisible(pos)) continue;
    const cur = equipped(pos);
    for (const kind of kindsFor(pos)) {
      const have = cur && (cur.slot === kind || cur.u) ? cur.t : 0, t = have + 1;
      if (t > zt) continue;
      const c = canCraft(kind, t), sk = CRAFT_KINDS[kind].st; let g;
      if (c.unbuilt) {   // the station is not built: the goal is to build it (Camp), which costs materials of its own
        const cc = typeof campCan === 'function' ? campCan(sk) : null;
        if (!cc || !cc.cost || !(cc.ok || cc.miss)) continue;
        g = { build: sk, pos, kind, t, st: sk, nm: 'the ' + CRAFT_STATIONS[sk].n, ok: !!cc.ok, miss: (cc.cost.mats || []).map(([k, tt, n]) => ({ k, t: tt, n: n - matOwn(k, tt) })).filter(x => x.n > 0).map(x => ({ ...x, open: viewOpen(x.k) && skillTierOpen(skillOf(x.k), x.t) })) };
      } else {
        if (c.lv < c.need) continue;
        g = { pos, kind, t, st: sk, nm: kindName(kind, t), ok: !!c.ok, miss: (c.miss || []).map(([k, n]) => ({ k, t, n, open: viewOpen(k) && skillTierOpen(skillOf(k), t) })) };
      }
      // ready first; then what gathering alone can finish; then what waits on fight drops (hide, essence); within a group the lower tier, then the slot order
      g.drops = g.miss.some(x => !x.open);
      const rank = x => (x.ok ? 0 : x.drops ? 2000 : 1000) + x.t * 100 + pi;
      if (!goal || rank(g) < rank(goal)) goal = g;
    }
  }
  return { wear, goal, act: S.activity, node: S.node ? { kind: S.node.kind, t: S.node.t } : null };
})()`;
const GATHER_VIEW = { ore: 'mine', crystal: 'mine', wood: 'wood', fibre: 'forage', herb: 'forage', hide: 'hunt' };
st.gear = { sess: null, tries: {}, wearAt: -99, stepAt: -99, wornN: 0, crafted: 0, firstWear: null };
async function openCraft(view) {
  const tab = await click('.tabs .tab[data-tab="forge"]', 300); await advance(450, 16);
  const seg = await click(`#viewSeg button[data-view="${view}"]`, 300); await advance(350, 16);
  return { tab, seg };
}
// Gear and the bag live on Hero, Gear since #195 (cal-0107-gear-and-rates)
async function openHeroGear() {
  const tab = await click('.tabs .tab[data-tab="party"]', 300); await advance(450, 16);
  const seg = await click('#viewSeg button[data-view="gear"]', 300); await advance(350, 16);
  return { tab, seg };
}
// Hero > Gear > the piece > Equip, then close the sheet. Returns true when it tapped.
async function wearGear(w) {
  const nav = await openHeroGear();
  const opened = await click(`.cf-tile[data-item-id="${w.id}"]`, 300); await advance(450, 16);
  const did = opened && await click('.bsheet-ov .cf-wear button:text(^Equip$)', 300);
  await advance(300, 16);
  await click('.bsheet-ov .bsheet-x', 200); await advance(300, 16);
  const ok = await X(`S.equip[${JSON.stringify(w.pos)}] === ${w.id}`);
  if (ok) { st.gear.wornN++; if (st.gear.firstWear === null) st.gear.firstWear = gt; }
  await note(page, 'gear', `${ok ? 'wore' : 'could not wear'} ${w.nm} (${w.pos})`, { extra: { pos: w.pos, ok }, tag: 'gear-wear' });
  if (!ok) addCheck('gear', 'the bot could not put on a piece from the bag', `${w.nm} for ${w.pos}: ${opened ? 'the Equip button did nothing' : !nav.tab ? 'the Hero tab could not be tapped' : !nav.seg ? 'the Gear view button could not be tapped' : 'no bag tile to tap in Hero > Gear'}`);
  return true;
}
// Craft > Make > the goal's station > its tier > the recipe's Craft button.
async function craftGoal(g) {
  await openCraft('make');
  await click(`.cf-st[data-st="${g.st}"]`, 300); await advance(300, 16);
  await click(`.cf-tiers button:text(^Tier ${g.t}\\b)`, 300); await advance(300, 16);
  const btn = `.cf-rec[data-kind="${g.kind}"] .cf-go`;
  const state = await page.evaluate(sel => { const b = document.querySelector(sel); return b ? { dis: b.disabled, vis: b.getClientRects().length > 0 } : null; }, btn);
  const did = state && !state.dis && await click(btn, 300);
  await advance(400, 16);
  await note(page, 'gear', `craft ${g.nm}${did ? ' -> pressed Craft' : ' -> nothing to press' + (state ? (state.dis ? ' (button greyed)' : '') : ' (no recipe row)')}`, { extra: { kind: g.kind, t: g.t, pressed: !!did }, tag: 'gear-craft' });
  if (did) st.gear.crafted++;
  else addCheck('gear', 'a gear goal says "you have the materials" and its Craft button cannot be pressed', `${g.nm}: ${state ? (state.dis ? 'button greyed' : 'hidden') : 'no recipe row in Craft > Make'}`);
  return true;
}
// Camp > the station's building > its Build button (the guide's "Build the Forge" is the same press).
// The two taps on a station's Build button in Camp (Next Up's build goal uses them too). True when both landed.
async function pressBuild(id) {
  const a = await click(`#camp-b-${id} button:text(Build)`, 300); await advance(400, 16);   // the first tap arms the button ("Sure?")
  const b = a && await click(`#camp-b-${id} button:text(Sure|Tap again)`, 300); await advance(500, 16);
  return !!b;
}
async function buildStation(g) {
  await click('.tabs .tab[data-tab="world"]', 300); await advance(500, 16);
  await pressBuild(g.build);
  const built = await X(`S.camp.builds.some(b => b.id === ${JSON.stringify(g.build)}) || !hearthStationWhy(${JSON.stringify(g.build)})`);
  await note(page, 'gear', `build ${g.nm}${built ? ' -> started' : ' -> not started'}`, { extra: { build: g.build }, tag: 'gear-build' });
  if (!built) await advance(1000, 16);
  return true;
}
// Gather > the material's view > its node row > the button.
async function startGather(k, t) {
  const view = GATHER_VIEW[k];
  await click('.tabs .tab[data-tab="gat"]', 300); await advance(450, 16);
  await click(`#viewSeg button[data-view="${view}"]`, 300); await advance(350, 16);
  const did = await click(`.gx-row[data-kind="${k}"][data-t="${t}"] .gx-act`, 300);
  await advance(400, 16);
  return did;
}
async function gearStep(o) {
  const G = st.gear;
  if (gt - G.stepAt < 5 || o.cards.length || o.tip || o.phase !== 'idle' || !o.s.got || !o.s.got.craft) return false;   // the guide goes first; Craft must be open
  G.stepAt = gt;
  const q = await X(GEAR_Q);
  // back to the fight (the Fight/Mining switch at the top) once the bot has nothing left to gather for
  const release = async why => {
    if (!G.owns) return false;
    G.owns = false; G.sess = null;
    if (q.act !== 'gather') return false;
    const did = await click('#modeSeg button[data-act="fight"]', 300); await advance(300, 16);
    await note(page, 'gear', `back to fighting: ${why}`, { shot: false });
    return !!did;
  };
  const w = q.wear.find(x => (G.tries['w' + x.id] || 0) < 8);
  if (w) { G.tries['w' + w.id] = (G.tries['w' + w.id] || 0) + 1; return await wearGear(w); }
  const g = q.goal;
  if (!g) return await release('no gear goal');
  const key = (g.build ? 'build ' : '') + g.kind + g.t;
  if (g.ok) {
    if ((G.tries[key] || 0) >= 3) return await release('could not ' + (g.build ? 'build ' : 'craft ') + g.nm);
    G.tries[key] = (G.tries[key] || 0) + 1;
    const r = g.build ? await buildStation(g) : await craftGoal(g);
    return await release((g.build ? 'built ' : 'crafted ') + g.nm) || r;
  }
  const m = g.miss.filter(x => x.open).sort((a, b) => b.n - a.n)[0];   // what only gathering brings: Essence and hide come from fights
  if (!m) return await release(g.nm + ' needs drops from fights');
  if (!G.sess || G.sess.key !== key) G.sess = { key, start: gt, gaveUp: false };
  if (gt - G.sess.start > 300) {   // a casual player gives up after 5 minutes and fights on
    if (!G.sess.gaveUp) { G.sess.gaveUp = true; await note(page, 'gear', `stopped gathering for ${g.nm}: 5 min and still short`, { shot: false }); }
    return await release('gave up on ' + g.nm);
  }
  if (q.act === 'gather' && q.node && q.node.kind === m.k && q.node.t === m.t) return false;   // already working there
  const did = await startGather(m.k, m.t);
  if (did) G.owns = true;
  await note(page, 'gear', `gathering ${m.k} tier ${m.t} for ${g.nm} (${m.n} more)${did ? '' : ' -> could not start'}`, { extra: { kind: m.k, t: m.t }, tag: 'gear-gather' });
  return true;
}

// ---------------- watching ----------------
const HIT_SOUNDS = new Set(['hit', 'crit', 'big', 'counter', 'kill']);   // F1: the sound of a hit landing (76-audio plays big or counter for those tiers, else hit or crit)
const SOUNDS = new Set(['kill', 'loot', 'level', 'skill', 'zone', 'forge', 'momentBig', 'momentMid']);   // momentBig and momentMid are the moment layer's own stings (76-audio.js)
const sfxLog = [];     // { t, name }
const choices = [], firstUse = {};   // craft-delta: { t, k } for each choice event; the game time of each first use
async function watch(o) {
  for (const s of o.sfx) sfxLog.push({ t: gt, name: s.name });
  for (const [kind, k] of o.ev || []) { if (kind === 'choice') choices.push({ t: gt, k }); else if (firstUse[k] === undefined) { firstUse[k] = gt; await note(page, 'firstuse', k, { shot: false }); } }
  for (const t of o.toasts) if (!st.toastSeen.has(t)) { st.toastSeen.add(t); await note(page, 'toast', t, { shot: false }); }
  for (const t of o.tabs) if (!st.tabSeen.has(t)) { st.tabSeen.add(t); if (st.tabSeen.size > 1) await note(page, 'tab', t, { tag: 'tab-' + t }); }
  const s = o.s, p = st.prev;
  if (!st.heroKeys && s.heroes !== undefined) st.heroKeys = await X('Object.keys((S.party && S.party.unlock && S.party.unlock.heroes) || {})');
  if (s.zone > (st.enterMax || 0)) {   // the first time the hero stands in a zone: what it wears, before that zone's boss tries
    st.enterMax = s.zone; st.enter = st.enter || {};
    st.enter[s.zone] = { t: Math.round(gt), L: s.L, gear: await X(`Object.entries(S.equip).filter(([, v]) => v != null && itemById(v)).map(([k, v]) => k + ' t' + itemById(v).t + ' ' + RAR[itemById(v).r].n).join(', ') || 'nothing'`), crafts: s.forged };
  }
  for (const k of Object.keys(s.got || {})) if (!st.got[k]) { st.got[k] = gt; const byAct = !!(s.acted && s.acted[k]); await note(page, 'unlock', k, { tag: 'unlock-' + k, extra: { play: s.got[k], byAct } }); }
  if (p && s.gold > p.gold && !st.rewardNoted) { st.rewardNoted = 1; await note(page, 'reward', 'first gold: +' + (s.gold - p.gold), { shot: false }); }
  if (p) {
    if (s.maxZone > p.maxZone) await moment('zone', `zone ${p.maxZone} cleared (maxZone ${s.maxZone})`, { big: true, zone: p.maxZone });
    if (s.L > p.L) await moment('level', 'level ' + s.L, { big: false });
    if (s.found > p.found) await moment('unique', 'unique found', { big: true });
    if (s.stars > p.stars) await moment('star', 'new Star', { big: true });
    if (s.heroes > p.heroes) { const ks = await X('Object.keys((S.party && S.party.unlock && S.party.unlock.heroes) || {})'), nw = ks.filter(k => !(st.heroKeys || []).includes(k)); st.heroKeys = ks; await moment('hero', 'a hero joins' + (nw.length ? ' (' + nw.join(', ') + ')' : ''), { big: true }); }
    if (s.looks > p.looks) await moment('look', 'a look found (' + s.looks + ')', { big: false });
    if (s.forged > p.forged) await moment('craft', 'forged (' + s.forged + ')', { big: false });
    if (s.up > p.up) await note(page, 'upgrade', 'upgraded (' + s.up + ')', { shot: false });
  }
  st.prev = s;
}
st.tabSeen = new Set();
const moments = [];   // { t, id, text, big }
async function moment(id, text, o) {
  moments.push({ t: Math.round(gt * 10) / 10, id, text, big: !!o.big, zone: o.zone });
  await note(page, 'moment', `${id}: ${text}`, { tag: 'moment-' + id, extra: { big: !!o.big } });
  for (const p of await page.evaluate(PLACEHOLDERS)) placeholders.add(p);
  // eyes layout lint at the moment
  for (const f of await page.evaluate(LINT)) { if (f.pair && ALLOW[f.pair]) continue; addCheck('layout', 'at ' + id + ': ' + f.what, f.detail); }
}

// ---------------- the run ----------------
async function run() {
  browser = await bt.pw.chromium.launch({ executablePath: bt.exe, args: ['--no-sandbox'] });
  ctx = await browser.newContext({ viewport: { width: SIZE.w, height: SIZE.h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  page = await ctx.newPage();
  { const cdp = await ctx.newCDPSession(page); await cdp.send('Animation.enable'); await cdp.send('Animation.setPlaybackRate', { playbackRate: 0 }); }   // animations follow game time (STEP_ANIM)
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  page.on('crash', () => errs.push('the page crashed'));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await page.clock.install({ time: Date.UTC(2026, 0, 5, 12, 0, 0) });   // a fixed Monday noon: the game's day-keyed content does not move between nights
  // An installed clock still flows with the wall clock between runFor calls, so game time ran ahead of the walk's steps by however long
  // the machine took (1.8 s of steps read 3.2 s on the game's clock): the same seed gave three first fights. Paused, it moves only
  // when the walk steps it (first-hour-map-two-clocks).
  await page.clock.pauseAt(Date.UTC(2026, 0, 5, 12, 0, 1));
  await page.addInitScript(INIT, [KEY, SEED]);
  const HTML = pageHtml();
  await page.route('**/*', r => (r.request().url() === 'http://lf.test/' ? r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: HTML }) : r.abort()));
  await page.goto('http://lf.test/', { waitUntil: 'commit' });
  fs.rmSync(SHOTS, { recursive: true, force: true });
  const t0 = Date.now(); let stop = '';
  await advance(1500, 16);
  const END = MINUTES * 60;
  let lastMin = -1, o = null, idle = 0;
  try {
    while (gt < END) {
      if (Date.now() - t0 > BUDGET_MS) { stop = `clock budget spent at game minute ${(gt / 60).toFixed(1)}`; break; }
      o = await X(OBS);
      await watch(o);
      if (Math.floor(gt / 60) !== lastMin) { lastMin = Math.floor(gt / 60); say(`minute ${lastMin}: zone ${o.s.maxZone}, level ${o.s.L}, gold ${o.s.gold} (${Math.round((Date.now() - t0) / 1000)} s clock)`); }
      if (process.env.WALK_DEBUG && Math.floor(gt) !== st.dbg) { st.dbg = Math.floor(gt); if (process.env.WALK_DEBUG === '2') console.error('  bar', await page.evaluate(() => [...document.querySelectorAll('#soloBar .sbtn')].map(b => b.className.replace('sbtn ', '') + (b.disabled ? ' DIS' : '') + ' ' + (b.getAttribute('aria-disabled') || '') + '|' + b.textContent.replace(/\s+/g, ' ').trim().slice(0, 30)).join(' ;; ')));
      console.error('  dbg', gt.toFixed(1), o.phase, JSON.stringify(o.tip && { a: o.tip.action, b: o.tip.button }), o.cards.length, JSON.stringify(o.s).slice(0, 120)); }
      if (process.env.WALK_SHOT && gt >= +process.env.WALK_SHOT && !st.dbgShot) { st.dbgShot = 1; await page.screenshot({ path: '/tmp/claude-0/dbg.png' }); console.error('  DBG TIP', JSON.stringify(o.tip), JSON.stringify(o.toasts), JSON.stringify(o.cards)); }
      // a stall: nothing that counts has changed for 90 s of game time (the fight, a tip, a card and the menus all count as nothing)
      { const sig = [o.s.kills, o.s.gold, o.s.maxZone, o.s.L, Object.keys(o.s.got || {}).length, o.s.tab].join('|');
        if (sig !== st.sig) { st.sig = sig; st.sigAt = gt; st.stallNoted = false; }
        else if (gt - st.sigAt >= 90 && !st.stallNoted) { st.stallNoted = true; const why = `phase "${o.phase}", tip ${o.tip ? '"' + o.tip.text.slice(0, 60) + '"' : 'none'}, ${o.cards.length} card(s) up, tab "${o.s.tab}"`; await note(page, 'stall', 'nothing moved for 90 s: ' + why, { tag: 'stall' }); addCheck('stall', 'the walk stalled for 90 s', why); } }
      if (gt - st.phAt >= 30) { st.phAt = gt; for (const p of await page.evaluate(PLACEHOLDERS)) placeholders.add(p); }
      for (const c of checks.values()) if (!c.shotTried) { c.shotTried = true; c.shot = await shot(page, 'finding-' + c.check); }   // every finding gets its shot
      let did = false;
      if (o.intro) {   // the opening's stills and Hesketh's fire: the bot taps through without reading, like the picker
        const sig = o.intro.trim();
        if (!st.introSeen) st.introSeen = new Set();
        if (!st.introSeen.has(sig)) { st.introSeen.add(sig); await note(page, 'card', sig, { extra: { cls: 'intro' }, tag: 'card-intro' }); }
        did = await click('#introScreen .intro-go', 300);
        if (did) await advance(300, 16);
      }
      if (!did && o.create) did = await pickHero();
      if (!did) did = await dismissCards(o);
      if (!did) did = await followTip(o);
      // first-hour-map-two-clocks: the bot waits for the guide. No fight press while it reads a new tip (1.2 s from when the tip showed;
      // followTip then presses what the tip names), nor in the first 0.3 s of a turn: the guide shows its line on a 250 ms poll
      // (75-onboard-ui), so a press on a turn's first frame ended the Attack and ability lessons before they were on screen.
      if (o.phase !== st.phName) { st.phName = o.phase; st.phStart = gt; }
      const waitGuide = (o.tip && gt - st.tipFirst < 1.2) || (o.phase === 'player turn' && gt - st.phStart < 0.3);
      if (!did && !waitGuide && (!o.s.tab || (o.s.tab === 'adv' && SIZE.id === 'landscape'))) did = await fight(o);   // a menu that covers the action bar is not a fight the player can press
      // back to the fight once a tip or Next Up has been served: a menu that stays open leaves the foe waiting
      if (!did && o.s.tab && o.s.tab !== 'adv' && !o.tip && o.cards.length === 0 && gt - st.tabAt > 2.5) { st.tabAt = gt; did = await click('.tabs .tab[data-tab="adv"]', 300); }
      if (!did && (o.phase === 'idle') && gt - st.nuAt >= 6 && o.cards.length === 0) { st.nuAt = gt; did = await followNextUp(o); }
      if (!did) did = await gearStep(o);
      // the Fight menu (tab "adv") covers the action bar in portrait: a player whose turn is waiting closes it
      if (!did && o.s.tab === 'adv' && o.phase !== 'idle' && !o.tip && o.cards.length === 0 && gt - st.tabAt > 2.5) { st.tabAt = gt; did = await click('#menuX', 300); }
      const fine = o.phase === 'foe wind-up' || o.phase === 'parry or dodge window' || false;   // the 33 ms step is for the foe's wind-up and the parry window only
      await advance(fine ? 33 : 100, fine ? 16 : 100);
    }
  
  } catch (e) {   // the browser or page went away (a crash, the container's memory): report the run so far instead of a stack trace
    if (!(page.isClosed() || /has been closed|Target crashed|Target page, context or browser|Browser closed|disconnected/i.test(String(e && e.message)))) throw e;
    toolFault = true;
    stop = `the browser closed at game minute ${(gt / 60).toFixed(1)} (${String(e.message).split('\n')[0].slice(0, 80)}); this is a tool fault, not a game error`;
  }
  if (!stop && gt < END) stop = 'ended early';
  const snap = await page.evaluate(k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, KEY).catch(() => null);
  await ctx.close().catch(() => {}); await browser.close().catch(() => {});
  return { stop, errs, snap, clockMs: Date.now() - t0 };
}
// ---------------- the map ----------------
// docs/design/first-hour.md: one row per beat, `| # | est | walk | On screen | ...`. `est` is a guess for a casual person (a range
// takes its middle), `walk` the seed 1 bot's time on the build the map names; both in seconds, null when the cell has no time.
const mapSecs = m => { const r = /^(\d+) to (\d+)$/.exec(m), t = /^(\d+):(\d\d)$/.exec(m); return r ? (+r[1] + +r[2]) / 2 * 60 : t ? +t[1] * 60 + +t[2] : null; };
function readMap() {
  const rows = [];
  let md = ''; try { md = fs.readFileSync(path.join(ROOT, 'docs/design/first-hour.md'), 'utf8'); } catch (e) { return rows; }
  for (const line of md.split('\n')) {
    const c = line.split('|').map(x => x.trim());
    if (c.length < 9 || !/^\d+[a-z]?$/.test(c[1])) continue;
    const m = c[2].replace(/\*/g, ''), w = c[3].replace(/\*/g, '');
    rows.push({ id: c[1], min: m, est: mapSecs(m), wmin: w, walk: mapSecs(w), what: c[4].replace(/\*\*/g, '').slice(0, 70) });
  }
  return rows;
}
// What the walk can see of each beat: the first time something happened that the beat names. null: the walk has no detector yet.
function measureBeats() {
  const at = f => { const e = log.find(f); return e ? e.t : null; };
  const unlock = id => at(e => e.kind === 'unlock' && e.text === id);
  const zone = z => { const m = moments.find(x => x.id === 'zone' && x.zone === z); return m ? m.t : null; };
  const tip = a => at(e => e.kind === 'tip' && e.action === a);
  const nth = (id, n) => { const l = moments.filter(x => x.id === id); return l[n - 1] ? l[n - 1].t : null; };
  return {
    '1': at(e => e.kind === 'card' && /Chapter 1|lamp/i.test(e.text)), '2': firstTapAt, '3': at(e => e.kind === 'card' && /Hesketh/.test(e.text)),
    '4': at(e => e.kind === 'tip' && (e.action === 'attack' || e.action === 'dodge')), '5': tip('ability'), '6': tip('parry'), '8': tip('boss'), '9': zone(1),   // cal-0107-staged-guide: Attack then Dodge are beat 4, the ability 5, Parry 6
    '10': unlock('party'), '11': unlock('gather'), '12': unlock('camp'), '12a': zone(2), '13': unlock('nextup'), '14': unlock('craft') ?? nth('craft', 1),
    '14a': zone(3), '15': unlock('awaynote'), '16': unlock('bounties'), '16a': zone(4), '17': zone(5), '18': nth('star', 1),   // 17 and 25: the Champion's first clear (beatNotes says whether a hero joined)
    '20': nth('unique', 1), '20a': zone(7), '21': unlock('bestiary'), '22': unlock('almanac'), '22a': zone(8), '23': unlock('tavern'), '23a': zone(9),
    '24': nth('look', 1), '25': zone(10)
  };
}
// Beats 17 and 25 name a starter joining at the Champion. Until starters-join-when-met is built all three starters are open from the
// start, so nobody joins: the report says so next to the clear instead of calling the beat missing.
function beatNotes() {
  const out = {};
  for (const [id, z] of [['17', 5], ['25', 10]]) {
    const c = moments.find(x => x.id === 'zone' && x.zone === z); if (!c) continue;
    const j = moments.find(x => x.id === 'hero' && x.t >= c.t - 1 && x.t <= c.t + 30);
    out[id] = j ? j.text.replace(/^a hero joins/, 'a hero joined') + ' at ' + fmtT(j.t) : 'no hero joined';
  }
  return out;
}
// The fight lessons (cal-0107-staged-guide): when each tip first showed, and in which fight (kills before it, plus one).
function lessonLine() {
  const l = ['attack', 'dodge', 'ability', 'parry'].map(a => { const e = log.find(e => e.kind === 'tip' && e.action === a); return e ? `${a === 'ability' ? 'the ability' : a[0].toUpperCase() + a.slice(1)} ${fmtT(e.t)} (fight ${(e.kills || 0) + 1})` : `${a} not seen`; });
  return 'Fight lessons: ' + l.join(', ') + '.';
}

// ---------------- scorecard values ----------------
function scorecard(reached) {
  const sc = {};
  const rewardAt = (() => { const r = log.find(e => (e.kind === 'toast' && /gold|loot|xp|\+\d/i.test(e.text)) || e.kind === 'reward'); return r ? r.t : null; })();
  // F1 (coordinator ruling 2026-10-08, DECISIONS "Early game"): the first fight press gets a hit with its sound within 10 s of the first
  // tap, and the first gold, loot or XP shows within 30 s. The staged lesson holds fight 1, so the first gold comes later than the hit.
  const hit = st.firstPress === null ? null : sfxLog.find(s => s.t >= st.firstPress - 0.05 && HIT_SOUNDS.has(s.name));
  const hitS = hit ? hit.t - (firstTapAt ?? 0) : null, lootS = rewardAt !== null ? rewardAt - (firstTapAt ?? 0) : null;
  sc.F1 = { value: `first hit with its sound ${hitS === null ? 'not seen' : hitS.toFixed(1) + ' s'}; first loot ${lootS === null ? 'not seen' : lootS.toFixed(1) + ' s'}`, pass: hitS !== null && hitS <= 10 && lootS !== null && lootS <= 30,
    target: 'the first press gets a hit with its sound within 10 s of the first tap, and the first gold, loot or XP within 30 s' };
  const z1 = moments.find(m => m.id === 'zone');
  sc.F2 = { value: z1 ? fmtT(z1.t) : 'not reached', pass: !!z1 && z1.t <= 360, target: 'first boss beaten by 6:00' };
  const big = moments.filter(m => m.big).map(m => m.t);
  const gaps = []; let prev = 0;
  for (const t of [...big, reached]) { gaps.push({ from: prev, to: t, gap: t - prev }); prev = t; }
  const zc10 = moments.find(m => m.id === 'zone' && m.zone === 10);
  const lateEnd = zc10 ? Math.min(zc10.t, 3600) : reached;   // the pace after the zone 10 Champion is not set yet (DECISIONS, F3)
  const early = gaps.filter(g => g.from < 1200).map(g => ({ ...g, gap: Math.min(g.to, 1200) - g.from }));
  const late = gaps.filter(g => g.to > 1200 && g.from < lateEnd).map(g => ({ ...g, gap: Math.min(g.to, lateEnd) - Math.max(g.from, 1200) }));
  const mx = l => l.reduce((a, g) => (g.gap > a.gap ? g : a), { gap: 0 });
  const worstEarly = mx(early), worstLate = mx(late), worst = mx([...early, ...late]);
  const z510 = [5, 6, 7, 8, 9, 10].filter(z => reached > 1200 && !moments.some(m => m.id === 'zone' && m.zone === z));
  sc.F3 = { value: `${big.length} big moments; in the first 20 min the longest gap is ${fmtT(worstEarly.gap || 0)}, after it ${fmtT(worstLate.gap || 0)} to ${fmtT(lateEnd)}` + (z510.length ? `; no first clear seen for zones ${z510.join(', ')}` : ''),
    pass: worstEarly.gap <= 300 && worstLate.gap <= 480 && z510.length === 0, target: 'a big moment every 5 min to minute 20; then every zone first clear 5 to 10, no gap over 8 (the 8-minute cap holds in the first 20 too)' };
  // F4: new things = unlocks (S.onboard.got) by the time they landed. unlock-gap-trial (judge): the target counts only what the
  // spacing governor releases; a thing the player's act or a drop opened (its row's now() true) is listed, not counted.
  const unAll = log.filter(e => e.kind === 'unlock'), un = unAll.filter(e => !e.byAct).map(e => e.t), unEvery = unAll.map(e => e.t);
  const win = (list, len, from, to) => { let best = 0, at = 0; for (const t of list.filter(t => t >= from && t < to)) { const n = list.filter(u => u >= t && u < t + len).length; if (n > best) { best = n; at = t; } } return { best, at }; };
  const w3 = win(un, 180, 0, 1800), w10 = win(un, 600, 1800, 3600), w3All = win(unEvery, 180, 0, 1800);
  sc.F4 = { value: `${unAll.length} new things (${un.length} released, ${unAll.length - un.length} by player or drop); most released in 3 min (first 30): ${w3.best}${w3.best ? ' from ' + fmtT(w3.at) : ''}; most released in 10 min after: ${w10.best}; all kinds in 3 min: ${w3All.best}`, pass: w3.best <= 2 && w10.best <= 4, target: 'at most 2 new things the game releases on its own in any 3 min of the first 30, 4 in any 10 after (a thing the player\'s act or a drop opened is listed, not counted)' };
  const lay = [...checks.values()].filter(c => c.check === 'layout' || c.check === 'tipphase' || c.check === 'covered' || c.check === 'guide');
  sc.F5 = { value: lay.length + ' finding' + (lay.length === 1 ? '' : 's') + ' at ' + SIZE.w + 'x' + SIZE.h, pass: lay.length === 0, target: 'no tip off its phase, nothing covering the fighters or bars, no clipped text' };
  // F6: each big or medium moment shows a card, banner or sheet for 2 s with a sound near it
  const bad = [];
  for (const m of moments.filter(m => m.big || m.id === 'look')) {
    const near = [...st.cardSeen.values()].filter(c => c.first >= m.t - 1.5 && c.first <= m.t + 3 && !/^tv-(card|banner)$/.test(c.cls));   // a turn-order banner is not the moment's card
    const want = { zone: ['zone', 'kill', 'momentBig'], unique: ['loot', 'momentBig'], craft: ['forge', 'momentMid'], star: ['skill', 'loot', 'momentMid', 'momentBig'], hero: ['skill', 'zone', 'momentBig'], look: ['loot', 'skill', 'momentMid'] }[m.id] || [...SOUNDS];
    const snd = sfxLog.some(s => want.includes(s.name) && s.t >= m.t - 1 && s.t <= m.t + 3);
    const card = near.find(c => (c.dwell ?? (reached - c.first)) >= 2);
    if (!card || !snd) bad.push(`${m.id} at ${fmtT(m.t)}: ${!near.length ? 'no card or banner' : !card ? 'card up under 2 s' : 'a card'}${snd ? '' : ', no sound'}`);
  }
  sc.F6 = { value: bad.length ? bad.length + ' of ' + moments.filter(m => m.big || m.id === 'look').length + ' not shown right: ' + bad.slice(0, 4).join('; ') + (bad.length > 4 ? '; ...' : '') : 'all shown', pass: bad.length === 0, bad, target: 'every moment a card or banner for 2 s with its sound' };
  sc.F10 = { value: placeholders.size + ' placeholder tile' + (placeholders.size === 1 ? '' : 's') + (placeholders.size ? ': ' + [...placeholders].slice(0, 4).join('; ') : ''), pass: placeholders.size === 0, target: 'no placeholder letters in the first hour' };
  const looks = st.prev ? st.prev.looks : 0;
  sc.P4 = { value: looks + ' look' + (looks === 1 ? '' : 's') + ' found; Wardrobe count not read (the walk opens no Wardrobe yet), so P4 is not measured', pass: false, unmeasured: true, found3: looks >= 3, target: 'at least 3 looks by minute 60, with a Wardrobe count' };
  return sc;
}
const placeholders = new Set();

// ---------------- the report ----------------
function sha() { try { return execSync('git rev-parse --short HEAD', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch (e) { return 'unknown'; } }
// walk-bot-retry-counts: the bot plays about 2.3 times a human's pace, so bot minutes 20-60 are a human's hour 2. The map's window
// is the zone 6 first clear (beat 18, the map's 20:00) to 10 min after the zone 10 first clear (the map's 60:00), or to the minute
// reached when that clear never comes. Next Up presses (the bot's own nextup notes that pressed something) and craft-screen picks
// (choice kind craft) are counted apart.
function mapWindow(reached) {
  const head = 'Map window (zone 6 clear to 10 min after the zone 10 clear';
  const z6 = moments.find(m => m.id === 'zone' && m.zone === 6), z10 = moments.find(m => m.id === 'zone' && m.zone === 10);
  if (!z6) return head + '): not reached (zone 6 never cleared).';
  const from = z6.t, to = z10 ? Math.min(z10.t + 600, reached) : reached;
  const nu = log.filter(e => e.kind === 'nextup' && e.pressed && e.t >= from && e.t <= to).map(e => e.t);
  const cr = choices.filter(c => c.k === 'craft' && c.t >= from && c.t <= to).map(c => c.t);
  const ts = [from, ...[...nu, ...cr].sort((a, b) => a - b), to];
  let g = 0; for (let i = 1; i < ts.length; i++) g = Math.max(g, ts[i] - ts[i - 1]);
  return `${head}, bot ${fmtT(from)} to ${fmtT(to)}${z10 ? '' : ', zone 10 not cleared'}): ${nu.length} Next Up press${nu.length === 1 ? '' : 'es'}, ${cr.length} craft-screen pick${cr.length === 1 ? '' : 's'}, longest gap with neither ${fmtT(g)}.`;
}
function report(res) {
  const reached = Math.round(gt), sc = scorecard(reached), beats = readMap(), meas = measureBeats();
  const out = [];
  out.push(`# First-hour walk, ${DATE}`, '');
  out.push(`Build \`${path.relative(ROOT, htmlFile)}\` at ${sha()}. Seed ${SEED}, ${HERO}, ${SIZE.w}x${SIZE.h}. Bot: parries ${Math.round(PARRY * 100)}% of foe hits, dodges ${Math.round(DODGE * 100)}% of the rest, reads each tip 1.2 s, reads each card 2.4 s.`);
  out.push(`Played ${fmtT(reached)} of ${MINUTES}:00 game time in ${Math.round(res.clockMs / 1000)} s of clock.${res.stop ? ' **Stopped: ' + res.stop + '.**' : ''} Report only: nothing here blocks a merge.`, '');
  const z = st.prev ? st.prev : {};
  if (st.beaten) out.push(`The bot was beaten ${st.beaten} time${st.beaten === 1 ? '' : 's'} by bosses (the "try again" card).`, '');
  out.push(`End state: zone ${z.maxZone}, level ${z.L}, ${z.gold} gold, ${z.kills} kills, ${Object.keys(z.got || {}).length} things unlocked, ${z.found} uniques, ${z.stars} Stars, ${z.heroes} extra heroes, ${z.looks} looks.`, '');
  out.push('## Gear and boss tries', '', `The bot crafted ${st.gear.crafted} piece(s) from its own gear goal, put on ${st.gear.wornN}${st.gear.firstWear === null ? '' : ' (first at ' + fmtT(st.gear.firstWear) + ')'}, and closed ${st.sheetsClosed || 0} sheet(s) it had left over the bar. Forged in all: ${z.forged || 0}.`, '',
    '| Zone | First stood in at | Level | Boss tries lost | Worn then |', '|---|---|---|---|---|');
  for (const [zn, e] of Object.entries(st.enter || {})) out.push(`| ${zn} | ${fmtT(e.t)} | ${e.L} | ${(st.tries || {})[zn] || 0} | ${e.gear} |`);
  out.push('');
  // craft-delta: crafts plus upgrades, first uses, and the longest stretch of minutes 20-60 with no choice (spec target: one every 8 min)
  const ups = log.filter(e => e.kind === 'upgrade'), crafts60 = log.filter(e => e.kind === 'moment' && /^craft:/.test(e.text) && e.t <= 3600).length, ups60 = ups.filter(e => e.t <= 3600).length;
  const cw = [1200, ...choices.map(c => c.t).filter(t => t > 1200 && t < Math.min(3600, reached)), Math.min(3600, reached)];
  let gap = { from: 1200, to: 1200 }; for (let i = 1; i < cw.length; i++) if (cw[i] - cw[i - 1] > gap.to - gap.from) gap = { from: cw[i - 1], to: cw[i] };
  out.push('## Crafting and choices', '', `Crafts and upgrades in the first 60 min: ${crafts60 + ups60} (${crafts60} forged, ${ups60} upgrades; ${z.up || 0} upgrades in all). Choices: ${choices.length} (${['craft', 'nextup'].map(k => k + ' ' + choices.filter(c => c.k === k).length).join(', ')}).`, '',
    reached > 1200 ? `Longest gap with no choice in minutes 20-60: ${fmtT(gap.to - gap.from)} (${fmtT(gap.from)} to ${fmtT(gap.to)}).` : 'Longest gap with no choice in minutes 20-60: not reached.', '',
    mapWindow(reached), '',
    'First uses: ' + (Object.keys(firstUse).length ? Object.entries(firstUse).map(([k, t]) => `${k} at ${fmtT(t)}`).join(', ') : 'none') + '.', '');
  out.push('## Scorecard', '', '| Id | Result | Target | Value |', '|---|---|---|---|');
  for (const [k, v] of Object.entries(sc)) out.push(`| ${k} | ${v.unmeasured ? 'not measured' : v.pass ? 'met' : 'missed'} | ${v.target} | ${v.value} |`);
  out.push('', lessonLine(), '');
  // beats: each against the map's walk column (the bot's own time on the build the map names). More than 50% off (and 10 s, so a
  // second's jitter in the first minute is not a finding) means the game changed pace. est is a guess for a casual person: its ratio
  // to the walk is information, printed once, never a finding (first-hour-map-two-clocks).
  const notes = beatNotes();
  out.push('## Beats against the map', '', 'Each beat against the map\'s **walk** column, the seed 1 bot\'s time on the build the map names in `docs/design/first-hour.md`. More than 50% off is a finding: the game changed pace. **est** is a guess for a casual person; the bot plays faster than a person, so est is not compared.', '',
    '| Beat | est | Map walk | Walk saw | Off the map walk | What |', '|---|---|---|---|---|---|');
  const off = [], ratios = [];
  for (const b of beats) {
    const m = meas[b.id], what = b.what + (notes[b.id] ? ' (' + notes[b.id] + ')' : '');
    if (!(b.id in meas)) { out.push(`| ${b.id} | ${b.min} | ${b.wmin} | not measured | | ${what} |`); continue; }
    if (m === null || m === undefined) { out.push(`| ${b.id} | ${b.min} | ${b.wmin} | not reached in ${fmtT(reached)} | | ${what} |`); if (b.walk !== null && b.walk < reached * 0.8) off.push(`beat ${b.id} (${b.what.slice(0, 40)}) never happened; the map's walk saw it at ${b.wmin}`); continue; }
    if (b.est && !['1', '2', '3'].includes(b.id)) ratios.push(m / b.est);   // the bot taps through the stills and the picker without reading
    const pct = b.walk ? Math.round((m - b.walk) / b.walk * 100) : null, bad = pct !== null && Math.abs(pct) > 50 && Math.abs(m - b.walk) >= 10;
    out.push(`| ${b.id} | ${b.min} | ${b.wmin} | ${fmtT(m)} | ${pct === null ? '' : (pct > 0 ? '+' : '') + pct + '%'}${bad ? ' **!**' : ''} | ${what} |`);
    if (bad) off.push(`beat ${b.id} (${b.what.slice(0, 40)}): map walk ${b.wmin}, this walk ${fmtT(m)} (${pct > 0 ? '+' : ''}${pct}%)`);
  }
  ratios.sort((a, b) => a - b);
  const med = ratios.length ? (ratios.length % 2 ? ratios[(ratios.length - 1) / 2] : (ratios[ratios.length / 2 - 1] + ratios[ratios.length / 2]) / 2) : null;
  out.push('', med === null ? 'Walk against est: no beat to compare.' : `Walk against est (information, not a finding): the median beat came at ${med.toFixed(2)} of its est time over ${ratios.length} beats, so the bot plays about ${(1 / med).toFixed(1)} times a casual person's guessed pace.`, '');
  out.push('### More than 50% off the map\'s walk, for the lead', '', ...(off.length ? off.map(x => '- ' + x) : ['- none']), '');
  // dead air
  const marks = [0, ...log.filter(e => ['unlock', 'moment', 'nextup', 'gear'].includes(e.kind) && !(e.kind === 'moment' && e.text.startsWith('level'))).map(e => e.t), reached].sort((a, b) => a - b);
  const quiet = []; for (let i = 1; i < marks.length; i++) if (marks[i] - marks[i - 1] >= 180) quiet.push({ from: marks[i - 1], to: marks[i] });
  out.push('## Where it dragged', '', ...(quiet.length ? quiet.slice(0, 8).map(q => `- ${fmtT(q.from)} to ${fmtT(q.to)}: ${Math.round((q.to - q.from) / 60 * 10) / 10} min with no unlock, boss win, unique, Star, hero or Next Up result`) : ['- no stretch over 3 minutes without a reward or an unlock']), '');
  // findings
  const fs_ = [...checks.values()];
  out.push('## What a new player would hit', '');
  if (!fs_.length && !res.errs.length) out.push('- nothing found by the eyes checks', '');
  for (const c of fs_) out.push(`- **${c.check}** at ${fmtT(c.t)}${c.n > 1 ? ` (seen ${c.n} times)` : ''}: ${c.what}. ${c.detail}${c.shot ? ' Shot: `shots/' + c.shot + '`.' : ''}`);
  for (const e of [...new Set(res.errs)].slice(0, 6)) out.push(`- **page error**: ${e.slice(0, 200)}`);
  out.push('');
  // timeline
  out.push('## Timeline', '', 'Every tip, card, unlock and moment, with the game time it landed and its shot. Toasts and plain cards are in the json.', '', '| Time | Kind | What | Shot |', '|---|---|---|---|');
  for (const e of log.filter(e => ['tip', 'unlock', 'moment', 'nextup', 'gear', 'stall', 'tab'].includes(e.kind) || (e.kind === 'card' && e.shot))) out.push(`| ${fmtT(e.t)} | ${e.kind} | ${e.text.replace(/\|/g, '/').slice(0, 110)} | ${e.shot ? '`' + e.shot + '`' : ''} |`);
  out.push('');
  return { md: out.join('\n'), sc, beats: beats.map(b => ({ id: b.id, est: b.est, mapWalk: b.walk, walk: meas[b.id] ?? null, measured: b.id in meas, note: notes[b.id] || '' })), off, median: med };
}

// ---------------- scorecard file ----------------
function writeScorecard(file, sc, reached) {
  const cols = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F10', 'P4'];
  const head = '| Date | Build | Seed | Hero | Size | Game min | ' + cols.join(' | ') + ' |\n|---|---|---|---|---|---|' + cols.map(() => '---').join('|') + '|';
  const row = `| ${DATE} | ${sha()} | ${SEED} | ${HERO} | ${SIZE.w}x${SIZE.h} | ${(reached / 60).toFixed(0)} | ` + cols.map(c => (sc[c].unmeasured ? 'not measured' : sc[c].pass ? 'met' : 'MISSED') + ' (' + sc[c].value.replace(/\|/g, '/').split(';')[0].slice(0, 60) + ')').join(' | ') + ' |';
  let txt = ''; try { txt = fs.readFileSync(file, 'utf8'); } catch (e) { /* new file */ }
  if (!txt.includes('Walk (nightly, `tools/walk.mjs`)')) txt += `${txt && !txt.endsWith('\n') ? '\n' : ''}\n## Walk (nightly, \`tools/walk.mjs\`)\n\nOne row per run. F1 to F6, F10 and P4 are measured by the walk; the rest of the scorecard is written by other checks. Report only until milestone M0 closes.\n\n${head}\n`;
  const lines = txt.split('\n'), key = `| ${DATE} | `;
  const i = lines.findIndex(l => l.startsWith(key) && l.includes(`| ${SEED} | ${HERO} | ${SIZE.w}x${SIZE.h} |`));
  if (i >= 0) lines[i] = row; else {
    const h = lines.findIndex(l => l.startsWith('## Walk (nightly')); let j = h + 1, last = -1;
    for (; j < lines.length && !lines[j].startsWith('## '); j++) if (lines[j].startsWith('|')) last = j;
    lines.splice(last >= 0 ? last + 1 : j, 0, row);
  }
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.writeFileSync(file, lines.join('\n').replace(/\n*$/, '\n'));
}

// ---------------- go ----------------
const res = await run();
const rep = report(res);
fs.mkdirSync(OUT, { recursive: true });
const base = path.join(OUT, `walk-${DATE}`);
fs.writeFileSync(base + '.md', rep.md);
fs.writeFileSync(base + '.json', JSON.stringify({ date: DATE, build: sha(), seed: SEED, hero: HERO, size: SIZE.id, gameSeconds: Math.round(gt), clockSeconds: Math.round(res.clockMs / 1000), stop: res.stop,
  scorecard: rep.sc, beats: rep.beats, over50: rep.off, moments, checks: [...checks.values()], errors: [...new Set(res.errs)], log, cards: [...st.cardSeen.values()] }, null, 1) + '\n');
if (res.snap && (res.stop || flag('snapshot'))) fs.writeFileSync(path.join(OUT, `snapshot-min${Math.round(gt / 60)}.json`), res.snap);
if (opt('scorecard', '')) writeScorecard(path.resolve(ROOT, opt('scorecard', '')), rep.sc, Math.round(gt));
if (opt('reports', '')) {
  const dir = path.resolve(ROOT, opt('reports', '')); fs.mkdirSync(dir, { recursive: true });
  for (const ext of ['.md', '.json']) fs.copyFileSync(base + ext, path.join(dir, `walk-${DATE}${ext}`));
  fs.rmSync(path.join(dir, `walk-${DATE}`), { recursive: true, force: true }); fs.cpSync(SHOTS, path.join(dir, `walk-${DATE}`), { recursive: true });
}
console.log(rep.md.split('\n').slice(0, rep.md.split('\n').indexOf('## Beats against the map')).join('\n'));
console.log(`walk: wrote ${path.relative(ROOT, base)}.md`);
const missed = Object.entries(rep.sc).filter(([, v]) => !v.pass && !v.unmeasured).map(([k]) => k);
process.exit(toolFault ? 3 : flag('strict') && missed.length ? 1 : 0);   // a browser that closed mid-run is a tool fault: the report is written, the exit is not 0
