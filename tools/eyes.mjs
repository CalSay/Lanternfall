#!/usr/bin/env node
// Eyes: plays the built game in headless Chromium and checks what a player SEES (card qa-player-eyes).
//
//   node tools/build.mjs && node tools/eyes.mjs            both screen sizes, all four checks, report only (exit 0)
//
//   --strict            exit 1 when anything is found       --quick   portrait only, shorter sampling
//   --html <file>       check another build (a build without LF_EYES gets the hook patched in, so an old commit can be checked)
//   --sizes p,l         p = 360x740 portrait, l = 740x360 landscape (default both); or any WxH, e.g. 360x640,390x844
//   --only a,b          checks to run: layout, tipphase, moments, placeholders (default all)
//   --out <file>        where the findings go (default tools/.eyes/latest.md, plus a .json next to it and screenshots)
//   --json              print the findings as JSON
//
// Checks (every one reads the page the way a player does; nothing is changed except by pressing what the guide points at,
// or, for the moments, by making the game do the thing a player would have done):
//   1 layout        the guide tip covers (or comes within 6 px of) a hero, foe, boss or HP box, or a page box covers one by more than 4 px; page boxes overlap by more
//                   than 4 px where neither holds the other (ALLOW lists the ones that are meant); clipped text; the tip's pointer
//                   more than 8 px off its target; the page scrolls sideways.
//   2 tipphase      a tip that asks for an action the game cannot take now (Attack while the foe winds up, Dodge on your own turn),
//                   or that names a greyed or hidden button.
//   3 moments       each big moment (first boss win, unique drop, rare craft, a plain craft's grade, level up, new ability, new
//                   Star, new hero, new look) is forced while a guide step and a level up compete for the screen: a card, toast
//                   or stage text with its name (and rarity where it has one) must stay up for 2 s, and a sound must be asked for.
//   4 placeholders  visible two-letter tiles where an icon should be (`.mono`, `.sp-mono`, `.ab-mono`).
// Needs LF_EYES (src/js/89-eyes-hook.js). Method and findings format: docs/review/eyes.md. Not a CI gate yet: report only.
import fs from 'node:fs';
import path from 'node:path';
import { findBrowser } from './lib/browser.mjs';
import { ROOT } from './lib/core.mjs';

const argv = process.argv.slice(2);
const flag = n => argv.includes('--' + n);
const opt = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
{ const known = ['strict', 'quick', 'html', 'sizes', 'only', 'out', 'json'], bad = argv.filter(a => a.startsWith('--') && !known.includes(a.slice(2)));
  if (bad.length) { console.error('eyes: unknown option ' + bad.join(', ') + '; known: ' + known.map(k => '--' + k).join(' ')); process.exit(2); } }
const QUICK = flag('quick'), STRICT = flag('strict');
const SIZES = (opt('sizes', QUICK ? 'p' : 'p,l')).split(',').map(s => s.trim()).filter(Boolean).map(s => { const m = /^(\d+)x(\d+)$/.exec(s); return m ? { id: s, w: +m[1], h: +m[2] } : s === 'l' ? { id: 'landscape', w: 740, h: 360 } : { id: 'portrait', w: 360, h: 740 }; });
const ONLY = new Set((opt('only', 'layout,tipphase,moments,placeholders')).split(','));
const OUT = path.resolve(ROOT, opt('out', 'tools/.eyes/latest.md'));
const SHOTS = path.join(path.dirname(OUT), 'shots');
const htmlFile = path.resolve(ROOT, opt('html', 'dist/lanternfall.html'));

const bt = findBrowser();
if (!bt.pw || !bt.exe) { console.log('eyes: skipped: ' + (bt.reason || 'no browser found')); process.exit(0); }
if (!fs.existsSync(htmlFile)) { console.error('eyes: ' + htmlFile + ' is missing: run node tools/build.mjs'); process.exit(2); }

// ---------------- the page ----------------
// The artifact host wraps the page in a document skeleton with a device-width viewport; do the same. `window.__t.x` evaluates
// inside the game's scope, to make the game do what a player would have done (a drop, a craft) and to read its state.
// A build from before the hook gets stageRects (62-stage) and 89-eyes-hook.js patched in, so an older commit can be checked.
function pageHtml() {
  let h = fs.readFileSync(htmlFile, 'utf8');
  if (!h.includes('LF_EYES')) {
    const a = 'let resize, animate, draw, stageStats, warmScene;', b = '  stageStats = () => ({ critFloats';
    const stage = fs.readFileSync(path.join(ROOT, 'src/js/62-stage.js'), 'utf8');
    const i = stage.indexOf('  // The eyes hook (89-eyes-hook.js'), j = stage.indexOf(b);
    if (!h.includes(a) || !h.includes(b) || i < 0 || j < i) { console.error('eyes: this build has no LF_EYES and cannot be patched'); process.exit(2); }
    h = h.replace(a, 'let resize, animate, draw, stageStats, stageRects, warmScene;').replace(b, stage.slice(i, j) + b);
    const end = h.lastIndexOf('})();\n</script>');
    h = h.slice(0, end) + '\n' + fs.readFileSync(path.join(ROOT, 'src/js/89-eyes-hook.js'), 'utf8') + '\n' + h.slice(end);
    patched = true;
  }
  const end = h.lastIndexOf('})();\n</script>');
  return '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n' + h.slice(0, end) + '\n;window.__t = { x: src => eval(src) };\n' + h.slice(end);
}
let patched = false;
const HTML = pageHtml();
const KEY = 'lanternfall.save.v5';
const fixture = name => JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', `save-${name}.json`), 'utf8'));

// ---------------- findings ----------------
const findings = new Map();   // key -> { check, scenario, size, what, detail, n, shot }
let shotN = 0;
async function note(page, f) {
  const key = [f.check, f.scenario, f.size, f.what].join('|');
  const old = findings.get(key);
  if (old) { old.n++; return; }
  let shot = '';
  try { fs.mkdirSync(SHOTS, { recursive: true }); shot = `${String(++shotN).padStart(2, '0')}-${f.check}-${f.scenario}-${f.size}.png`; await page.screenshot({ path: path.join(SHOTS, shot) }); } catch (e) { shot = ''; }
  findings.set(key, { ...f, n: 1, shot });
}

import { LINT, TIPPHASE, PLACEHOLDERS, ALLOW } from './lib/eyes-readers.mjs';   // the in-page readers (strings that run in the page)

// ---------------- driving ----------------
async function openGame(size, { save } = {}) {
  const ctx = await browser.newContext({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  if (save) { const raw = JSON.stringify({ ...save, last: Date.now() }); await page.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch (e) {} }, [KEY, raw]); }
  await page.route('**/*', r => r.request().url() === 'http://lf.test/' ? r.fulfill({ status: 200, body: HTML, headers: { 'content-type': 'text/html; charset=utf-8' } }) : r.abort());
  await page.goto('http://lf.test/'); await page.waitForTimeout(700);
  if (!save) {   // the drawn opening comes first (Skip), then the picker, then Hesketh's fire (Skip)
    if (await page.$('#introScreen .intro-skip')) { await page.click('#introScreen .intro-skip'); await page.waitForSelector('#createScreen .ccard[data-hero="wren"]'); }
    await page.click('#createScreen .ccard[data-hero="wren"]'); await page.click('#createScreen .create-go'); await page.waitForTimeout(500);
    if (await page.$('#introScreen .intro-skip')) { await page.click('#introScreen .intro-skip'); await page.waitForTimeout(300); }
  }
  const X = s => page.evaluate(s => window.__t.x(s), s);
  return { ctx, page, errs, X };
}
// A player reads the story cards and presses Continue (Begin on the first); the first fight waits behind them.
async function dismissCards(page, max = 8) {
  for (let i = 0; i < max; i++) {
    const b = await page.$('.bsheet-ov .sty-done, .bsheet-ov .big:has-text("Begin"), .bsheet-ov .big:has-text("Continue"), .away-ov button');
    if (!b) break; try { await b.click({ timeout: 800 }); } catch (e) { break; } await page.waitForTimeout(400);
  }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Samples every `step` ms for `ms` ms. `bot(page, t, tip)` may press things. Runs the layout / tip-phase readers.
async function watch(page, { scenario, size, ms, step = 100, bot, checks = ONLY }) {
  const t0 = Date.now(), run = new Map();   // run: tip-phase condition -> first time seen
  while (Date.now() - t0 < ms) {
    const t = Date.now() - t0;
    if (checks.has('layout')) {
      for (const f of await page.evaluate(LINT)) {
        if (f.pair && ALLOW[f.pair]) continue;
        await note(page, { check: 'layout', scenario, size, what: f.what, detail: f.detail });
      }
    }
    if (checks.has('tipphase')) {
      const r = await page.evaluate(TIPPHASE), now = new Set();
      for (const [what, detail] of r.bad) {
        now.add(what); if (!run.has(what)) run.set(what, t);
        if (t - run.get(what) >= 500) await note(page, { check: 'tipphase', scenario, size, what, detail });   // held for half a second: not a frame of change-over
      }
      for (const k of [...run.keys()]) if (!now.has(k)) run.delete(k);
    }
    if (bot) await bot(page, t);
    await sleep(step);
  }
}

// A player who follows the tip: reads it for 1.2 s, then presses the button it names if that button can be pressed (Got it on a
// reading step). `st` keeps what the player is looking at between samples.
async function followTip(page, st, t) {
  const tp = await page.evaluate('LF_EYES.tip()');
  const key = tp ? tp.action + '|' + tp.text : '';
  if (key !== st.key) { st.key = key; st.since = t; if (st.trail) st.trail.push((tp ? tp.action : 'no tip') + ' at ' + (t / 1000).toFixed(1) + ' s (' + await page.evaluate('LF_EYES.phase()') + ')'); return; }
  if (!tp || t - st.since < 1200) return;
  if (tp.button && !tp.button.hidden && !tp.button.greyed) { try { await page.click(tp.button.sel, { timeout: 500 }); } catch (e) { /* off screen or moving: next sample */ } st.since = t; return; }
  if (tp.action === 'boss') { const ok = await page.$('.ob-ok:not([hidden])'); if (ok) { try { await ok.click({ timeout: 500 }); } catch (e) { /* ignore */ } st.since = t; } }
}

// ---------------- scenarios ----------------
let browser; const trails = [];
async function firstFight(size) {
  const { ctx, page, errs } = await openGame(size);
  await dismissCards(page);
  // A player who reads each tip, then presses what it points at: Attack, the ability, Dodge, Parry.
  const st = { trail: [] };
  await watch(page, { scenario: 'first fight', size: size.id, ms: QUICK ? 20000 : 40000, bot: async (p, t) => { await dismissCards(p, 1); await followTip(p, st, t); } });
  trails.push(`${size.id} first fight, the tips in order: ${st.trail.join(', ')}`);
  if (ONLY.has('placeholders')) for (const p of await page.evaluate(PLACEHOLDERS)) await note(page, { check: 'placeholders', scenario: 'first fight', size: size.id, what: 'placeholder tile', detail: p });
  for (const e of errs) await note(page, { check: 'errors', scenario: 'first fight', size: size.id, what: 'page error', detail: e.slice(0, 160) });
  await ctx.close();
}
// A foe that is faster than the hero opens the fight (a later foe can be): the guide still says Attack while it strikes.
async function foeOpens(size) {
  const { ctx, page } = await openGame(size);
  // armed before the story cards close: the frame the fight starts, the foe is made the first to act (set inside the wait, so
  // the hero's turn has not begun)
  const armed = page.waitForFunction(() => window.__t.x(`(() => { const m = typeof TURN_LIVE !== 'undefined' && TURN_LIVE; if (!m || m.ended || m.phase !== 'intro') return false; m.gF = 100; m.gH = 0; return true; })()`), null, { polling: 'raf', timeout: 12000 });
  armed.catch(() => {});
  await dismissCards(page);
  let forced = true;
  try { await armed; } catch (e) { forced = false; }
  if (!forced) { await note(page, { check: 'tipphase', scenario: 'foe opens the first fight', size: size.id, what: 'could not make the foe open the fight', detail: 'the fight did not reach its intro' }); await ctx.close(); return; }
  await watch(page, { scenario: 'foe opens the first fight', size: size.id, ms: QUICK ? 7000 : 9000, bot: p => dismissCards(p, 1) });
  await ctx.close();
}
async function firstBoss(size) {
  const { ctx, page, X } = await openGame(size);
  await dismissCards(page);
  await X(`S.onboard.done.attack = S.onboard.done.ability = S.onboard.done.dodge = S.onboard.done.parry = 1; S.onboard.atk = 1; S.onboard.casts = 1; S.onboard.dodges = 1; S.onboard.parries = 1; S.kills = ZONE_FIGHTS; challenge(); true`);
  await watch(page, { scenario: 'first boss', size: size.id, ms: QUICK ? 6000 : 10000 });
  await ctx.close();
}
async function firstUnique(size) {
  const { ctx, page, X } = await openGame(size);
  await dismissCards(page);
  await X(`dropUnique(zoneUnique(1), 1); true`);
  await watch(page, { scenario: 'first unique', size: size.id, ms: QUICK ? 5000 : 8000 });
  await ctx.close();
}
async function firstCraft(size) {
  const { ctx, page, X } = await openGame(size, { save: fixture('mid') });
  await dismissCards(page);
  await X(`onboardUnlockAll(); true`);
  await X(`(() => { const k = Object.keys(CRAFT_KINDS).find(k => { for (const e of Object.keys(S.mats)) S.mats[e] = S.mats[e].map(() => 5000); S.gold = 1e9; return canCraft(k, 1).ok; }); if (k) craftItem(k, 1); return k; })()`);
  await watch(page, { scenario: 'first craft', size: size.id, ms: QUICK ? 4000 : 6000 });
  await ctx.close();
}

// ---------------- moments (check 3) ----------------
// Each force makes the game do what a player's play would have done. `ret` gives { name, rarity } to look for on screen.
const MOMENTS = [
  // a control: a toast drawn straight on screen (past the notice policy) must be seen for 2 s, or the reader is broken
  { id: 'control (a plain toast)', control: true, noRival: true, force: `(() => { S.onboard.tips = false; popToast('Eyes control toast', 'good', null, 2); return { name: 'Eyes control toast' }; })()` },
  { id: 'first boss win', rarity: null, force: `(() => { S.zone = 1; S.maxZone = 1; killPack({ boss: true, xp: 1, gold: 0, name: 'Elder', pal: [] }, 0); return { name: 'first boss down' }; })()` },
  { id: 'unique drop', force: `(() => { const k = zoneUnique(S.zone); dropUnique(k, 1); return { name: UNIQ[k].name, rarity: 'unique|legendary' }; })()` },
  { id: 'rare craft', force: `(() => { const k = Object.keys(CRAFT_KINDS).find(k => canCraft(k, 1).ok); const mr = Math.random; let it = null; for (const v of [0.0001, 0.5, 0.9999]) { Math.random = () => v; it = craftItem(k, 1); if (it && /rare|epic|legendary/.test(it.r)) break; } Math.random = mr; return it ? { name: itemName(it), rarity: 'rare|epic|legendary' } : { name: 'NOCRAFT' }; })()` },
  { id: 'craft grade (a plain craft)', force: `(() => { const k = Object.keys(CRAFT_KINDS).find(k => canCraft(k, 1).ok); const mr = Math.random; Math.random = () => 0.9999; const it = craftItem(k, 1); Math.random = mr; return it ? { name: itemName(it), rarity: RAR[it.r].n } : { name: 'NOCRAFT' }; })()` },
  { id: 'level up', force: `(() => { S.L = 9; S.xp = 0; gainXp(xpNeed() * 1.01); return { name: 'Level ' + S.L + '|level up' }; })()`, noRival: true },
  { id: 'new ability', force: `(() => { const h = S.solo.hero; const id = HERO_ABILITIES[h].find(i => ABILITIES[i].tier && !abilityOwned(h, i)); if (!id) return { name: 'NOABILITY' }; for (const s of SCROLL_ORDER) S.abil.scrolls[s] = 3; const lv = soloLevels()[h]; if (lv) lv.L = Math.max(lv.L, 99); const ok = abilityLearn(h, id); return { name: ABILITIES[id].name, ok }; })()` },
  { id: 'new Star', force: `(() => { const id = STAR_ORDER.find(i => !S.stars.own[i]); starGrant(id); return { name: STARS[id].name }; })()` },
  { id: 'new hero', force: `(() => { const id = ROSTER_KEYS.find(k => ROSTER[k].route.type !== 'starter' && !heroUnlocked(k)); if (!id) return { name: 'NOHERO' }; S.party.unlock.heroes[id] = 1; emit('heroUnlocked', { id }); return { name: ROSTER[id].name }; })()` },
  { id: 'new look', force: `(() => { S.totalGold = Math.max(S.totalGold, 6e9); S.stats.gold = Math.max(S.stats.gold || 0, 6e9); for (let i = 0; i < 60; i++) tick(0.2); return { name: 'Dragon|Goldwyrm|New look|gilded|coin' }; })()` },
];
// Reads, every 100 ms, which visible surface shows the moment: toasts, cards, banners, sheets, or a big stage text.
const WATCH = (name, rarity) => `(() => {
  const nm = new RegExp(${JSON.stringify(name)}, 'i'), ra = ${rarity ? `new RegExp(${JSON.stringify(rarity)}, 'i')` : 'null'};
  const vis = n => { for (let e = n; e && e !== document.body; e = e.parentElement) { if (e.hidden) return false; const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.1) return false; } const r = n.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth; };
  const SURF = '.toast, .gl-card, .cb-banner, .tv-banner, .bsheet-ov, .modal, .away-ov, .dw-ov, [role=status], [role=dialog], .dd-feat, .feat-card, .mm-card';
  let named = '', both = '', surf = '';
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let t; (t = tw.nextNode());) { const s = t.textContent; if (!nm.test(s) || !t.parentElement || !vis(t.parentElement)) continue;
    if (t.parentElement.closest('.ob-bub')) continue;
    const box = t.parentElement.closest(SURF); if (!box) continue;   // a name in a list or a counter is not an announcement
    named = s.trim().slice(0, 60); surf = box.className.toString().split(' ')[0] || box.tagName; if (!ra || ra.test(box.textContent)) both = named; }
  for (const f of LF_EYES.floats()) if (nm.test(f.txt) && f.left > 0.1) { named = named || f.txt; surf = surf || 'stage text'; if (!ra || ra.test(f.txt)) both = both || f.txt; }
  return { named, both, surf };
})()`;
const SOUNDS = new Set(['loot', 'level', 'skill', 'zone', 'forge', 'momentBig', 'momentMid']);   // the moment layer's stings

async function moments(size) {
  for (const m of MOMENTS) {
    const { ctx, page, X } = await openGame(size, { save: fixture('mid') });
    try {
      await dismissCards(page);
      await X(`if (NEWS.open) newsFlush(); for (const t of [...$('toasts').children]) t.remove(); true`);   // an old save's What's new has been read
      await X(`onboardUnlockAll(); S.onboard.tips = true; S.onboard.done = {}; for (const e of Object.keys(S.mats)) S.mats[e] = S.mats[e].map(() => 5000); S.gold = 1e10; true`);   // a guide step is up
      await page.waitForTimeout(500);
      await page.evaluate('LF_EYES.sfx()');
      let r;
      if (!m.noRival) await X('gainXp(xpNeed() * 1.01); true');   // a level up competes (a level up moment forces its own)
      await sleep(300); await page.evaluate('LF_EYES.sfx()');   // the rival's sound is not the moment's
      await X(`try { if (typeof TURN_LIVE !== 'undefined' && TURN_LIVE && !TURN_LIVE.ended) TURN_LIVE.ended = true; } catch (e) {} true`);   // the fight is over, as it is when a player's win lands (moments wait for the fight's end)
      r = await X(m.force);
      if (!r || /^NO/.test(r.name)) { await note(page, { check: 'moments', scenario: m.id, size: size.id, what: 'could not force this moment', detail: JSON.stringify(r) }); continue; }
      let first = 0, last = 0, aboth = 0, lastBoth = 0, surf = '', named = '';
      const t0 = Date.now();
      while (Date.now() - t0 < 7500) {   // a moment may wait for the boot, a guide step and the fight end first
        const w = await page.evaluate(WATCH(r.name, r.rarity));
        const t = Date.now() - t0;
        if (w.named) { if (!first) first = t; last = t; named = w.named; surf = w.surf; }
        if (w.both) { if (!aboth) aboth = t; lastBoth = t; }
        await sleep(100);
      }
      const snd = await page.evaluate('LF_EYES.sfx()');
      const heard = snd.some(s => SOUNDS.has(s.name));
      const dwell = lastBoth - aboth + (aboth ? 100 : 0), dwellName = last - first + (first ? 100 : 0);
      const what = [];
      if (!first) what.push('nothing on screen names it');
      else if (r.rarity && !aboth) what.push('shown without its rarity (' + r.rarity.replace(/\|/g, ' / ') + ')');
      else if ((r.rarity ? dwell : dwellName) < 2000) what.push('on screen only ' + ((r.rarity ? dwell : dwellName) / 1000).toFixed(1) + ' s (needs 2 s)');
      if (!heard) what.push('no sound asked for' + (snd.length ? ' (only ' + [...new Set(snd.map(s => s.name))].join(', ') + ')' : ''));
      if (m.control) { const bad = what.filter(w => !/sound/.test(w)); if (bad.length) await note(page, { check: 'errors', scenario: m.id, size: size.id, what: 'the moments reader did not see a plain toast', detail: bad.join('; ') }); continue; }
      for (const w of what) await note(page, { check: 'moments', scenario: m.id, size: size.id, what: w, detail: `name "${r.name}"${r.rarity ? ', rarity "' + r.rarity + '"' : ''}; surface: ${surf || 'none'}${named ? ' ("' + named + '")' : ''}` });
    } catch (e) { await note(page, { check: 'moments', scenario: m.id, size: size.id, what: 'check crashed', detail: String(e.message || e).slice(0, 160) }); }
    await ctx.close();
  }
}

// ---------------- run ----------------
const t0 = Date.now();
browser = await bt.pw.chromium.launch({ executablePath: bt.exe, args: ['--no-sandbox'] });
const ran = [];
try {
  for (const size of SIZES) {
    const steps = [];
    if (ONLY.has('layout') || ONLY.has('tipphase') || ONLY.has('placeholders')) steps.push(['first fight', firstFight], ['foe opens', foeOpens], ['first boss', firstBoss], ['first unique', firstUnique], ['first craft', firstCraft]);
    if (ONLY.has('moments')) steps.push(['moments', moments]);
    for (const [name, fn] of steps) {
      if (QUICK && name === 'first craft' && SIZES.length > 1) continue;
      process.stderr.write(`eyes: ${size.id} ${name}\n`);
      try { await fn(size); ran.push(`${size.id} ${name}`); } catch (e) { findings.set('crash|' + name + size.id, { check: 'errors', scenario: name, size: size.id, what: 'the check itself crashed', detail: String(e.stack || e).slice(0, 300), n: 1, shot: '' }); }
    }
  }
} finally { await browser.close(); }

// ---------------- report ----------------
const list = [...findings.values()];
const byCheck = c => list.filter(f => f.check === c);
const NAMES = { layout: 'Layout', tipphase: 'Tip against the fight', moments: 'Moments shown', placeholders: 'Placeholder tiles', errors: 'Errors' };
const md = [];
md.push(`# Eyes report`, '', `Build: \`${path.relative(ROOT, htmlFile)}\`${patched ? ' (LF_EYES patched in)' : ''}. Sizes: ${SIZES.map(s => `${s.w}x${s.h}`).join(', ')}. ${Math.round((Date.now() - t0) / 1000)} s. Ran: ${ran.join('; ')}.`, '');
md.push(`**${list.length} finding${list.length === 1 ? '' : 's'}** (${Object.keys(NAMES).map(c => `${NAMES[c].toLowerCase()} ${byCheck(c).length}`).join(', ')}). Report only${STRICT ? '' : ' (exit 0)'}.`, '');
for (const c of Object.keys(NAMES)) {
  const l = byCheck(c); if (!l.length) continue;
  md.push(`## ${NAMES[c]} (${l.length})`, '');
  for (const f of l) md.push(`- **${f.scenario}, ${f.size}:** ${f.what}${f.n > 1 ? ` (seen ${f.n} times)` : ''}. ${f.detail}${f.shot ? ` Screenshot: \`shots/${f.shot}\`.` : ''}`);
  md.push('');
}
if (!list.length) md.push('Nothing found.', '');
if (trails.length) md.push('## What the player bot did', '', ...trails.map(t => '- ' + t), '');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, md.join('\n'));
fs.writeFileSync(OUT.replace(/\.md$/, '') + '.json', JSON.stringify({ build: path.relative(ROOT, htmlFile), patched, findings: list }, null, 2) + '\n');
if (flag('json')) console.log(JSON.stringify(list, null, 2)); else console.log(md.join('\n'));
console.log(`eyes: wrote ${path.relative(ROOT, OUT)}`);
process.exit(STRICT && list.length ? 1 : 0);
