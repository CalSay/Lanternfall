#!/usr/bin/env node
// Performance benchmark: loads dist/lanternfall.html in headless Chromium (Playwright) and measures
// load, frame times while fighting, each menu tab, a toast burst and a boss kill, heap growth,
// DOM size, ui() cost and tap-to-response latency. Budget and method: docs/design/perf.md.
//
//   node tools/perf.mjs            full run (~6 min): phone (360x740, CPU x4) and desktop (1280x800), new game + late save
//   node tools/perf.mjs --quick    ~40 s: phone only, shorter windows (run after every merge)
//   S6: scenarios swarm10 (a swarm of 10 with Burns and an Explosive elite, vs packs of 3 at the same zone) and bossKit
//   (a kit boss through its phases, a summon, a Stagger and its Finisher); the quick run measures them on the late save
//   options: --json out.json (write raw results)  --only phone|desktop  --save new|late
//            --compare base.html [--runs 3]  judge this dist against another build run on the SAME machine: both builds run --runs times
//            (alternating), per-metric medians; a metric fails only when over budget AND over 1.25x the base build's median (+5% of budget)
//            --html file (benchmark another build, e.g. an older commit's dist, for before/after)
//            --trace dir (write a Chrome trace of each steady-fight window, open in DevTools Performance)
//
// Uses shared browser discovery (LF_PLAYWRIGHT / LF_CHROMIUM overrides, local packages, Linux
// fallbacks and installed Windows browsers). Builds/installs nothing: run `node tools/build.mjs` first.
// The page is an instrumented copy of dist: a small hook is appended inside the game's IIFE that
// wraps frame/tick/animate/draw/ui with timers and exposes a few test helpers. dist is not changed.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { findBrowser } from './lib/browser.mjs';
import { ROOT } from './lib/core.mjs';

const args = process.argv.slice(2);
const QUICK = args.includes('--quick');
const argVal = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const ONLY = argVal('--only'), ONLY_SAVE = argVal('--save'), JSON_OUT = argVal('--json'), TRACE = argVal('--trace'), HTML = argVal('--html'), COMPARE = argVal('--compare'), RUNS = Math.max(1, +(argVal('--runs') || 3));
const KEY = 'lanternfall.save.v5';   // W3-A

// ---------------- budget (keep in sync with docs/design/perf.md) ----------------
// Times are for this harness: headless Chromium, software canvas, phone CPU slowed x4.
const BUDGET = {
  phone: { firstFrame: 1500, jsP95: 8, jsP99: 16.7, over16: 1, gapP95: 34, longPer10s: 1, uiP95: 8, tabJsP95: 12, tabLong: 150, eventLong: 150, heapMin: 2, dom: 5000, tap: 150, swarmOver: 1.5 },
  desktop: { firstFrame: 600, jsP95: 4, jsP99: 8, over16: 0.5, gapP95: 20, longPer10s: 0, uiP95: 2, tabJsP95: 6, tabLong: 50, eventLong: 50, heapMin: 2, dom: 5000, tap: 50, swarmOver: 1.5 }
};

// ---------------- windows ----------------
const W = QUICK
  ? { warm: 1500, fight: 7000, tab: 1500, toast: 2000, boss: 1500, heap: 12000, taps: 3, gather: 3000 }
  : { warm: 3000, fight: 20000, tab: 4000, toast: 4000, boss: 3000, heap: 60000, taps: 7, gather: 6000 };

// ---------------- playwright ----------------
const browserTools = findBrowser();

// ---------------- instrumented page ----------------
const HOOK = `
;{
  const P = window.__lfp = { frames: [], ui: [], firstFrameEnd: 0, bootEnd: performance.now(), mark: null };
  const wrap = (f, arr) => function () { const t = performance.now(); try { return f.apply(this, arguments); } finally { arr.push(performance.now() - t); } };
  ui = wrap(ui, P.ui);
  // ui() breakdown: the built-in panels and every registered section (registerSection/registerTab).
  P.sec = {};
  const part = (name, f) => function () { const t = performance.now(); try { return f.apply(this, arguments); } finally { (P.sec[name] = P.sec[name] || []).push(performance.now() - t); } };
  for (const n of ['uiFight', 'uiGather', 'uiForge', 'uiRaid', 'uiTavern']) { try { eval(n + ' = part(n, ' + n + ')'); } catch (e) {} }
  for (const s of SECTIONS) if (s.update) s.update = part(s.tab + ':' + s.id, s.update);
  // boot already queued the first frame with the unwrapped function: time the first draw directly.
  const d0 = draw;
  draw = function () { const r = d0.apply(this, arguments); if (!P.firstFrameEnd) P.firstFrameEnd = performance.now(); return r; };
  const f0 = frame;
  frame = function (now) {
    const t = performance.now(); f0(now); const e = performance.now();
    P.frames.push([t, e - t]);
  };
  window.__lf = {
    S: () => S, setTab, emit, toast,
    // A frontier boss fight: bossUp() (10 kills, challenge), then bossKill() a couple of seconds later.
    bossUp() {
      if (S.activity !== 'fight') setActivity('fight');
      S.zone = S.maxZone; S.kills = 10; fightBoss = false;
      challenge();
    },
    bossKill() { if (mob && mob.boss && !mob.dead) mob.hp = 1e-9; },
    stage: () => (typeof stageStats === 'function' ? stageStats() : null),
    // Evaluate code inside the game's scope (experiments: reassign draw, drawAtmosphere, ...).
    x: src => eval(src)
  };
}
`;
function instrumented(over) {
  const file = over ? path.resolve(over) : HTML ? path.resolve(HTML) : path.join(ROOT, 'dist', 'lanternfall.html');
  if (!fs.existsSync(file)) throw new Error(file + ' missing: run node tools/build.mjs');
  let html = fs.readFileSync(file, 'utf8');
  const end = html.lastIndexOf('})();\n</script>');
  if (end < 0) throw new Error('could not find the end of the game IIFE in dist');
  // The artifact host wraps the page in a document skeleton with a device-width viewport; do the
  // same, or a mobile viewport lays the page out 980 px wide and zooms it out.
  const skel = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n';
  return skel + html.slice(0, end) + HOOK + html.slice(end);
}
function serve(html) {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => { rsp.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); rsp.end(html); });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}

// ---------------- stats ----------------
const pct = (arr, p) => { if (!arr.length) return 0; const a = [...arr].sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(p / 100 * a.length))]; };
const r1 = n => Math.round(n * 10) / 10, r2 = n => Math.round(n * 100) / 100;
function frameStats(frames, t0, t1) {
  const fr = frames.filter(f => f[0] >= t0 && f[0] < t1);
  const js = fr.map(f => f[1]);
  const gaps = []; for (let i = 1; i < fr.length; i++) gaps.push(fr[i][0] - fr[i - 1][0]);
  return {
    n: fr.length, fps: r1(fr.length / ((t1 - t0) / 1000)),
    jsMed: r2(pct(js, 50)), jsP95: r2(pct(js, 95)), jsP99: r2(pct(js, 99)), jsMax: r1(Math.max(0, ...js)),
    over16: r1(js.filter(x => x > 16.7).length / Math.max(1, js.length) * 100),
    over33: r1(js.filter(x => x > 33.3).length / Math.max(1, js.length) * 100),
    gapMed: r1(pct(gaps, 50)), gapP95: r1(pct(gaps, 95)), gapP99: r1(pct(gaps, 99)),
    gapOver25: r1(gaps.filter(x => x > 25).length / Math.max(1, gaps.length) * 100)
  };
}

// ---------------- one scenario ----------------
async function runScenario(browser, base, { dev, save }) {
  const phone = dev === 'phone';
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  let seed = null;
  if (save === 'late') {
    seed = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'save-late.json'), 'utf8'));
  }
  await ctx.addInitScript(([key, raw]) => {
    // Seed the save before the page's scripts run (the away card stays closed: last = now).
    try { if (raw) { const o = JSON.parse(raw); o.last = Date.now(); localStorage.setItem(key, JSON.stringify(o)); } else localStorage.removeItem(key); } catch (e) {}
    window.__lt = [];
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true }); } catch (e) {}
  }, [KEY, seed ? JSON.stringify(seed) : null]);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.route('**/*', r => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
  const cdp = await ctx.newCDPSession(page);
  if (phone) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('HeapProfiler.enable');

  const out = { dev, save, errors };
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__lfp && window.__lfp.firstFrameEnd > 0, null, { timeout: 30000 });
  const ld = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    return { boot: window.__lfp.bootEnd, first: window.__lfp.firstFrameEnd, dcl: nav ? nav.domContentLoadedEventEnd : 0, lt: window.__lt.filter(l => l[0] < window.__lfp.firstFrameEnd + 50) };
  });
  out.load = { boot: Math.round(ld.boot), firstFrame: Math.round(ld.first), longTasks: ld.lt.length, longest: Math.round(Math.max(0, ...ld.lt.map(l => l[1]))) };

  // Character creation (new game) or "Choose your path" (old save): click through like a player.
  // A new game opens on the drawn opening first (intro-and-picker) and plays Hesketh's fire after the pick: tap through those too.
  // Every harness click goes through safeClick: it taps away any card over the game first, and on an interception closes it
  // and tries again within a few seconds instead of waiting Playwright's full 30 s on an overlay (perf-late-save-moment-crash).
  const OVERLAYS = '.mm-ov, .join-ov, .sty-sheet .sty-done, .bsheet-ov .sty-done';
  out.closed = [];   // the moment cards the harness tapped away (shown under the report)
  const overlayUp = () => page.$(OVERLAYS).then(h => !!h);
  // Close what is up now, as a player taps it away. A moment card ignores taps for its first MOMENT_TUNE.tapLockMs (75-moments-ui),
  // so wait that out, then tap Continue. Returns true if anything was up.
  const closeOverlays = async () => {
    let any = false;
    for (let k = 0; k < 6; k++) {
      if (await page.$('.mm-ov')) {
        const m = await page.evaluate(() => { try { return window.__lf.x('JSON.stringify({ left: MOMENT_TUNE.tapLockMs - (Date.now() - MOMENT_UI.shownAt), what: [...document.querySelectorAll(".mm-ov .mm-eye, .mm-ov .mm-head")].map(e => e.textContent).join(": ") })'); } catch (e) { return null; } }).then(j => { try { return JSON.parse(j); } catch (e) { return null; } });
        const what = (m && m.what) || 'moment card';
        if (out.closed[out.closed.length - 1] !== what) out.closed.push(what);
        await page.waitForTimeout(Math.max(0, m && m.left > -1e6 ? m.left + 50 : 750));
        await page.click('.mm-ov .mm-go', { timeout: 2000 }).catch(() => page.click('.mm-ov', { timeout: 1000, position: { x: 5, y: 5 } }).catch(() => {}));
      } else if (await page.$('.join-ov')) await page.click('.join-ov', { timeout: 2000, position: { x: 5, y: 5 } }).catch(() => {});
      else if (await page.$('.sty-sheet .sty-done, .bsheet-ov .sty-done')) await page.click('.sty-sheet .sty-done, .bsheet-ov .sty-done', { timeout: 2000 }).catch(() => {});
      else break;
      any = true; await page.waitForTimeout(300);
    }
    return any;
  };
  const isOverlayHit = e => /intercepts pointer events/.test(String(e && e.message));
  const safeClick = async (sel, tries = 4) => {
    for (let k = 1; ; k++) {
      await closeOverlays();
      try { return await page.click(sel, { timeout: 4000 }); } catch (e) {
        if (k >= tries || !(isOverlayHit(e) || await overlayUp())) throw e;
      }
    }
  };
  await page.waitForTimeout(300);
  for (let i = 0; i < 14; i++) {
    const intro = await page.$('#introScreen .intro-go'), go = intro || await page.$('#createScreen .create-go');
    if (!go) break;
    await safeClick(intro ? '#introScreen .intro-go' : '#createScreen .create-go'); await page.waitForTimeout(intro ? 400 : 150);
  }
  // A new game starts with no gold; give it some so the upgrade button can be tapped.
  if (save === 'new') await page.evaluate(() => { const S = window.__lf.S(); S.gold = Math.max(S.gold, 1e6); });
  // A new game shows its tabs one by one (55-onboard.js); open them all so every tab is measured.
  if (save === 'new') await page.evaluate(() => { try { window.__lf.x('onboardUnlockAll()'); } catch (e) {} });
  // A new game starts at a cold Hearth (H1): light the fire as a player does in the first half minute,
  // so the measured fight is the zone-1 fight it walks out to (the grove scene is left behind).
  if (save === 'new') await page.evaluate(() => { try { window.__lf.x('typeof hearthCold === "function" && hearthCold() && !hearthLit() && (S.story.seen["n:heskethTalk"] = Date.now(), S.mats.wood[0] += 8, hearthLight())'); } catch (e) {} });   // Hesketh\'s talk plays at the fire and would pop up mid-window: file it as seen
  await page.evaluate(() => window.__lf.setTab('adv'));

  const now = () => page.evaluate(() => performance.now());
  // A new game plays story cards (the opening, a companion's line) and any save can earn a moment card. A player taps them away,
  // so do the same before a measured window: a card covers the game UI and would intercept the click. Not part of the measure.
  // A second card can follow the first, so wait until none has shown for STORY_QUIET ms (capped at STORY_CAP ms a call).
  const STORY_QUIET = 1000, STORY_CAP = 15000;
  const closeStory = async () => {
    const end = Date.now() + STORY_CAP;
    for (let quiet = Date.now(); Date.now() - quiet < STORY_QUIET && Date.now() < end;) {
      if (await closeOverlays()) quiet = Date.now(); else await page.waitForTimeout(200);
    }
  };
  // A measured window. A harness click inside it can still meet a card that showed after closeStory (on the late save a moment card
  // pops up during the tab loop): the click then fails fast, the card is closed, and the window starts again with a fresh t0, so the
  // closing never counts and the window keeps its full length.
  const tapIn = async sel => { if (await overlayUp()) throw new Error('overlay up: intercepts pointer events'); await page.click(sel, { timeout: 4000 }); };
  const window_ = async (ms, fn) => {
    for (let k = 1; ; k++) {
      await closeStory();
      const ui0 = await page.evaluate(() => window.__lfp.ui.length), t0 = await now();   // ui() calls made while closing a card stay out too
      try { if (fn) await fn(); } catch (e) {
        if (k < 4 && isOverlayHit(e)) { out.restarts = (out.restarts || 0) + 1; continue; }
        throw e;
      }
      await page.waitForTimeout(ms); const t1 = await now();
      return page.evaluate(([a, b, u]) => ({ frames: window.__lfp.frames.filter(f => f[0] >= a && f[0] < b), ui: [], lt: window.__lt.filter(l => l[0] >= a && l[0] < b), t0: a, t1: b, ui0: u }), [t0, t1, ui0]);
    }
  };
  const summarize = w => ({ ...frameStats(w.frames, w.t0, w.t1), long: w.lt.length, longMax: Math.round(Math.max(0, ...w.lt.map(l => l[1]))) });
  const uiSince = async fromIdx => page.evaluate(i => window.__lfp.ui.slice(i), fromIdx);

  await page.waitForTimeout(W.warm);

  // ---- menu tabs (first visit mounts, then steady updates) ----
  out.tabs = {};
  const tabIds = await page.evaluate(() => [...document.querySelectorAll('.tab')].map(b => b.dataset.tab));
  for (const id of tabIds) {
    const w = await window_(W.tab, () => tapIn(`.tab[data-tab="${id}"]`));
    const uis = await uiSince(w.ui0);
    out.tabs[id] = { ...summarize(w), uiMed: r2(pct(uis, 50)), uiP95: r2(pct(uis, 95)) };
  }
  await closeStory();   // a moment card (.mm-ov) can pop up during the tab loop on the late save and would cover the tab bar
  await safeClick('.tab[data-tab="adv"]'); await page.waitForTimeout(300);

  // ---- toast burst ----
  out.toasts = summarize(await window_(W.toast, () => page.evaluate(() => {
    const kinds = ['good', 'loot', 'raid', ''], prios = ['high', 'normal', 'low', 'normal'];
    for (let i = 0; i < 16; i++) setTimeout(() => window.__lf.toast('Burst notice number ' + i + '.', kinds[i % 4], { ic: ['coin', '#F2C14E'] }, prios[i % 4]), i * 60);
  })));
  // ---- boss kill (frontier: clears the zone, new scene) ----
  out.boss = summarize(await window_(W.boss, async () => {
    await page.evaluate(() => window.__lf.bossUp());
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.__lf.bossKill());
  }));

  // ---- steady fight + leak check ----
  await page.waitForTimeout(500);
  const heap = async () => { await cdp.send('HeapProfiler.collectGarbage'); return (await cdp.send('Runtime.getHeapUsage')).usedSize; };
  const h0 = await heap(), tH0 = Date.now();
  if (TRACE) await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline,v8.execute,blink,cc,gpu,toplevel', transferMode: 'ReturnAsStream' });
  const wf = await window_(W.fight);
  if (TRACE) {
    const done = new Promise(r => cdp.once('Tracing.tracingComplete', r));
    await cdp.send('Tracing.end'); const { stream } = await done;
    let data = ''; for (;;) { const c = await cdp.send('IO.read', { handle: stream }); data += c.data; if (c.eof) break; }
    fs.mkdirSync(TRACE, { recursive: true }); fs.writeFileSync(path.join(TRACE, `fight-${dev}-${save}.json`), data);
  }
  const uis = await uiSince(wf.ui0);
  out.fight = { ...summarize(wf), uiMed: r2(pct(uis, 50)), uiP95: r2(pct(uis, 95)), uiCalls: uis.length };
  // ---- S6 (combat-2 2.8, 8.5): swarm10 and bossKit ----
  // swarm10: the highest Cave Bat zone the save has, packs of 10, Burns on every foe, an Explosive elite in each pack,
  // against the same zone with packs of 3 (COMBAT_TUNE.sizes 0); bossKit: a kit boss (the Fenmother on the late save)
  // through its phase changes, a summon, a Stagger and its Finisher.
  if (!QUICK || save === 'late') {
    await page.evaluate(() => window.__lf.x(`(() => {
      if (S.activity !== 'fight') setActivity('fight');
      S.auto = false; let z = 2; for (let k = S.maxZone; k >= 1; k--) if (TYPES[zoneType(k)].key === 'bat') { z = k; break; }
      window.__sw = { z, on: false };
      on('packSpawn', p => { if (!window.__sw.on || !p.foes || !p.foes[1] || p.foes[0].boss) return; const e = p.foes[1]; e.elite = true; e.tr = ['explosive']; });
      window.__swT = setInterval(() => { if (!window.__sw.on) return; for (const f of combatFoes()) if (!f.dead && f.hp > 0) stApply(f, 'burn', 1, heroAtk(), 0); }, 2000);
      return z; })()`));
    out.base3 = summarize(await window_(W.fight, () => page.evaluate(() => window.__lf.x("COMBAT_TUNE.sizes = 0; fightBoss = false; setZone(window.__sw.z)"))));
    out.swarm10 = summarize(await window_(W.fight, () => page.evaluate(() => window.__lf.x("COMBAT_TUNE.sizes = 1; FOE_BEH.bat.n = 10; window.__sw.on = true; fightBoss = false; setZone(window.__sw.z)"))));
    out.swarm10.n = await page.evaluate(() => window.__lf.x('combatFoes().length'));
    await page.evaluate(() => window.__lf.x('window.__sw.on = false; clearInterval(window.__swT); FOE_BEH.bat.n = 9'));
    // (the boss starts before the window: its first bake is the boss kill row's business, not a phase change's)
    await page.evaluate(() => window.__lf.x(`(() => { S.zone = Math.min(S.maxZone, 35); S.kills = 10; fightBoss = false; addModifier('bossHp', () => 50); challenge(); return mob && mob.name; })()`));
    out.bossKitName = await page.evaluate(() => window.__lf.x('mob && mob.name'));
    await page.waitForTimeout(1500);
    out.bossKit = summarize(await window_(W.fight, async () => {
      await page.evaluate(() => window.__lf.x('mob && mob.boss && (mob.hp = mob.max * 0.6)'));
      await page.waitForTimeout(1500); await page.evaluate(() => window.__lf.x('mob && mob.boss && (mob.hp = mob.max * 0.3)'));
      await page.waitForTimeout(1000); await page.evaluate(() => window.__lf.x('typeof actStag === "function" && mob && mob.boss && actStag(mob, 500, 0)'));
    }));
    out.bossKitStats = await page.evaluate(() => window.__lf.x('typeof KIT_STATS === "object" ? JSON.stringify({ phases: KIT_STATS.phases, adds: KIT_STATS.adds, staggers: ACT_STATS.staggers, fins: ACT_STATS.fins }) : "-"'));
    await page.evaluate(() => window.__lf.x('fightBoss = false; spawn()'));
  }
  const rest = W.heap - (Date.now() - tH0); if (rest > 0) await page.waitForTimeout(rest);
  const h1 = await heap(), mins = (Date.now() - tH0) / 60000;
  const dom = await cdp.send('Memory.getDOMCounters');
  out.mem = { heapMB: r1(h1 / 1048576), growthMBmin: r2((h1 - h0) / 1048576 / mins), dom: dom.nodes, listeners: dom.jsEventListeners };

  // ---- tap to response on the Attack button (W3-A: the hero upgrade rows are gone) ----
  await page.evaluate(() => {
    const T = window.__tap = { list: [], cur: null };
    // The Attack button acts on pointerdown, so one capture listener times it: handled = after the game's own handlers ran
    // (a 0 ms timeout), painted = after the next frame.
    addEventListener('pointerdown', e => {
      const c = { down: e.timeStamp, before: window.__lf.x('SOLO_STATS.attacks + SOLO_STATS.trash'), onBtn: !!(e.target.closest && e.target.closest('.sbtn.sb-atk')) };
      setTimeout(() => {
        c.handled = performance.now(); c.changed = window.__lf.x('SOLO_STATS.attacks + SOLO_STATS.trash') !== c.before;
        requestAnimationFrame(() => setTimeout(() => { c.painted = performance.now(); T.list.push(c); }, 0));
      }, 0);
    }, true);
  });
  const btn = page.locator('.sbtn.sb-atk').first();
  // The Attack button greys out between packs, so a tap can land on the panel behind it: count only taps that hit the button and try again.
  const hits = () => page.evaluate(() => window.__tap.list.filter(t => t.onBtn).length);
  for (let i = 0, tries = 0; await hits() < W.taps && tries < W.taps * 4; i++, tries++) {
    await page.evaluate(() => window.__lf.x("S.activity === 'fight' || setActivity('fight'); soloPick && !soloHero() && soloPick('wren')"));
    await page.evaluate(() => { const t = document.querySelector('.tab[data-tab=adv]'); if (t) t.click(); });
    await page.waitForTimeout(1200); // let the Attack cooldown end
    await page.waitForSelector('.sbtn.sb-atk:not(.off)', { timeout: 6000 }).catch(() => {});   // a new game's cooldown is longer: a tap on a greyed button measures nothing
    // Close story pop-ups (a companion joins, ...): one tap anywhere continues. Not part of the measure.
    await closeStory();   // also taps away a companion's .join-ov
    await btn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300); // scrolling can shrink the stage (compact mode, 0.22 s): let the button settle
    await closeOverlays();   // a card that showed while the button settled would take the tap
    const b = await btn.boundingBox();
    if (phone) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
    else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    await page.waitForTimeout(350);
  }
  const taps = (await page.evaluate(() => window.__tap.list)).filter(t => t.onBtn);
  out.tap = {
    n: taps.length, changed: taps.filter(t => t.changed).length,
    handledMed: r1(pct(taps.map(t => t.handled - t.down), 50)),
    paintMed: r1(pct(taps.map(t => t.painted - t.down), 50)), paintMax: r1(Math.max(0, ...taps.map(t => t.painted - t.down)))
  };
  // ---- gathering scenes (G2): the switch to each (its longest task), then steady gathering ----
  out.gather = {};
  for (const kind of ['ore', 'wood', 'herb', 'crystal']) {
    const sw = await window_(2000, () => page.evaluate(k => window.__lf.x(`setNode('${k}', 1); if (S.activity !== 'gather') setActivity('gather')`), kind));
    out.gather[kind] = { ...summarize(await window_(W.gather)), switchLong: Math.round(Math.max(0, ...sw.lt.map(l => l[1]))) };
  }
  await page.evaluate(() => window.__lf.x("setActivity('fight')"));
  out.stage = await page.evaluate(() => window.__lf.stage());
  out.sections = await page.evaluate(() => Object.entries(window.__lfp.sec).map(([k, a]) => {
    const s = [...a].sort((x, y) => x - y);
    return { k, n: a.length, med: s[a.length >> 1], p95: s[Math.floor(a.length * 0.95)], max: s[a.length - 1], sum: a.reduce((x, y) => x + y, 0) };
  }).sort((a, b) => b.max - a.max));
  await ctx.close();
  return out;
}

// ---------------- report ----------------
function judge(o) {
  const B = BUDGET[o.dev], c = [];
  const chk = (name, val, lim, unit = '') => c.push({ name, val, lim, unit, ok: val <= lim });
  chk('load: first frame', o.load.firstFrame, B.firstFrame, 'ms');
  chk('fight: JS/frame p95', o.fight.jsP95, B.jsP95, 'ms');
  chk('fight: JS/frame p99', o.fight.jsP99, B.jsP99, 'ms');
  chk('fight: frames with JS > 16.7ms', o.fight.over16, B.over16, '%');
  chk('fight: frame gap p95', o.fight.gapP95, B.gapP95, 'ms');
  chk('fight: long tasks', o.fight.long, Math.round(B.longPer10s * W.fight / 10000));
  chk('fight: ui() p95', o.fight.uiP95, B.uiP95, 'ms');
  for (const [id, t] of Object.entries(o.tabs)) {
    chk(`tab ${id}: JS/frame p95`, t.jsP95, B.tabJsP95, 'ms');
    chk(`tab ${id}: longest task (open + updates)`, t.longMax, B.tabLong, 'ms');
  }
  chk('toast burst: longest task', o.toasts.longMax, B.eventLong, 'ms');
  if (o.swarm10) {   // S6 (combat-2 2.8)
    chk('swarm10: JS/frame p95', o.swarm10.jsP95, B.jsP95, 'ms');
    chk('swarm10: JS/frame p95 over packs of 3', r2(o.swarm10.jsP95 - o.base3.jsP95), B.swarmOver, 'ms');
    chk('swarm10: frame gap p95', o.swarm10.gapP95, B.gapP95, 'ms');
    chk('swarm10: longest task', o.swarm10.longMax, 50, 'ms');
    chk('bossKit: frame gap p95', o.bossKit.gapP95, B.gapP95, 'ms');
    chk('bossKit: longest task', o.bossKit.longMax, 50, 'ms');
  }
  chk('boss kill: longest task', o.boss.longMax, B.eventLong, 'ms');
  for (const [k, g] of Object.entries(o.gather || {})) {
    chk(`gather ${k}: JS/frame p95`, g.jsP95, B.jsP95, 'ms');
    chk(`gather ${k}: frame gap p95`, g.gapP95, B.gapP95, 'ms');
    chk(`gather ${k}: long tasks`, g.long, Math.round(B.longPer10s * W.gather / 10000));
    chk(`gather ${k}: switch, longest task`, g.switchLong, B.eventLong, 'ms');
  }
  chk('heap growth', Math.max(0, o.mem.growthMBmin), B.heapMin, 'MB/min');
  chk('DOM nodes', o.mem.dom, B.dom);
  chk('tap to paint (median)', o.tap.paintMed, B.tap, 'ms');
  c.push({ name: 'taps changed state', val: `${o.tap.changed}/${o.tap.n}`, lim: `${W.taps}/${W.taps}`, unit: '', ok: o.tap.n >= W.taps - 1 && o.tap.changed >= o.tap.n - 1 });
  c.push({ name: 'page errors', val: o.errors.length, lim: 0, unit: '', ok: !o.errors.length });
  return c;
}
function table(rows, head) {
  const w = head.map((h, i) => Math.max(h.length, ...rows.map(r => String(r[i]).length)));
  const line = r => r.map((v, i) => (i ? String(v).padStart(w[i]) : String(v).padEnd(w[i]))).join('  ');
  return [line(head), w.map(n => '-'.repeat(n)).join('  '), ...rows.map(line)].join('\n');
}
function report(all) {
  const label = o => `${o.dev}/${o.save}`;
  const head = ['metric', ...all.map(label)];
  const row = (name, f) => [name, ...all.map(o => { try { return f(o); } catch (e) { return '-'; } })];
  const rows = [
    row('boot script done (ms)', o => o.load.boot),
    row('first frame (ms)', o => o.load.firstFrame),
    row('load long tasks (n / max ms)', o => `${o.load.longTasks} / ${o.load.longest}`),
    row('fight fps', o => o.fight.fps),
    row('fight JS/frame med/p95/p99', o => `${o.fight.jsMed}/${o.fight.jsP95}/${o.fight.jsP99}`),
    row('fight frames >16.7 / >33 (%)', o => `${o.fight.over16}/${o.fight.over33}`),
    row('fight frame gap med/p95/p99', o => `${o.fight.gapMed}/${o.fight.gapP95}/${o.fight.gapP99}`),
    row('fight long tasks (n / max)', o => `${o.fight.long} / ${o.fight.longMax}`),
    row('ui() med/p95 (ms)', o => `${o.fight.uiMed}/${o.fight.uiP95}`),
    ...Object.keys(all[0].tabs).map(id => row(`tab ${id} JS p95/max, ui p95`, o => `${o.tabs[id].jsP95}/${o.tabs[id].jsMax}, ${o.tabs[id].uiP95}`)),
    ...Object.keys(all[0].tabs).map(id => row(`tab ${id} gap p95, long (n/max)`, o => `${o.tabs[id].gapP95}, ${o.tabs[id].long}/${o.tabs[id].longMax}`)),
    row('toast burst JS p95, long n/max', o => `${o.toasts.jsP95}, ${o.toasts.long}/${o.toasts.longMax}`),
    row('boss kill JS max, long n/max', o => `${o.boss.jsMax}, ${o.boss.long}/${o.boss.longMax}`),
    row('S6 packs of 3 JS p95, gap p95', o => o.base3 ? `${o.base3.jsP95}, ${o.base3.gapP95}` : '-'),
    row('S6 swarm10 foes, JS p95/p99, gap p95, long n/max', o => o.swarm10 ? `${o.swarm10.n}, ${o.swarm10.jsP95}/${o.swarm10.jsP99}, ${o.swarm10.gapP95}, ${o.swarm10.long}/${o.swarm10.longMax}` : '-'),
    row('S6 bossKit JS p95, gap p95, long n/max', o => o.bossKit ? `${o.bossKit.jsP95}, ${o.bossKit.gapP95}, ${o.bossKit.long}/${o.bossKit.longMax} (${o.bossKitName}; ${o.bossKitStats})` : '-'),
    ...Object.keys(all[0].gather || {}).map(k => row(`gather ${k} fps, JS p95/p99, gap med/p95`, o => `${o.gather[k].fps}, ${o.gather[k].jsP95}/${o.gather[k].jsP99}, ${o.gather[k].gapMed}/${o.gather[k].gapP95}`)),
    ...Object.keys(all[0].gather || {}).map(k => row(`gather ${k} long (n / max), switch max`, o => `${o.gather[k].long} / ${o.gather[k].longMax}, ${o.gather[k].switchLong}`)),
    row('heap MB, growth MB/min', o => `${o.mem.heapMB}, ${o.mem.growthMBmin}`),
    row('DOM nodes / listeners', o => `${o.mem.dom} / ${o.mem.listeners}`),
    row('tap: handled / paint med / max', o => `${o.tap.handledMed} / ${o.tap.paintMed} / ${o.tap.paintMax}`),
    row('errors', o => o.errors.length)
  ];
  console.log('\n' + table(rows, head));
  for (const o of all) {
    const top = (o.sections || []).slice(0, 10).map(x => [x.k, x.n, r2(x.med), r2(x.p95), r1(x.max)]);
    if (top.length) console.log(`\nui() parts, slowest first (${label(o)}; ms per call)\n` + table(top, ['part', 'calls', 'med', 'p95', 'max']));
  }
  let fails = 0;
  for (const o of all) {
    const c = judge(o);
    const bad = c.filter(x => !x.ok);
    fails += bad.length;
    console.log(`\n${label(o)}: ${bad.length ? 'FAIL' : 'PASS'} (${c.length - bad.length}/${c.length} within budget)`);
    for (const x of bad) console.log(`  FAIL ${x.name}: ${x.val}${x.unit} (budget ${x.lim}${x.unit})`);
    if (o.errors.length) console.log('  page errors: ' + o.errors.slice(0, 3).join(' | '));
    if (o.closed && o.closed.length) console.log('  cards tapped away (outside the measured windows): ' + o.closed.slice(0, 6).join(' | ') + (o.restarts ? ` (${o.restarts} window(s) restarted)` : ''));
  }
  console.log(`\n${fails ? 'FAIL' : 'PASS'}: ${fails} metric(s) over budget${QUICK ? ' (quick run)' : ''}`);
  return fails;
}

// ---------------- main ----------------
const { pw, exe, reason } = browserTools;
if (!pw || !exe) { console.error(reason); process.exit(2); }
const srv = await serve(instrumented());
const base = `http://127.0.0.1:${srv.address().port}/`;
const srvBase = COMPARE ? await serve(instrumented(COMPARE)) : null;
const browser = await pw.chromium.launch({ executablePath: exe, args: ['--enable-precise-memory-info', '--no-sandbox'] });
const scenarios = [];
for (const dev of QUICK ? ['phone'] : ['phone', 'desktop']) for (const save of ['new', 'late']) {
  if (ONLY && dev !== ONLY) continue; if (ONLY_SAVE && save !== ONLY_SAVE) continue;
  scenarios.push({ dev, save });
}
const all = [];
const t0 = Date.now();
const med = a => { const v = a.filter(x => typeof x === 'number').sort((x, y) => x - y); return v.length ? v[v.length >> 1] : a[0]; };
// Same-machine comparison: judge() values per run, medians per metric, candidate vs base build.
function compare(cand, ref) {
  const key = o => `${o.dev}/${o.save}`;
  let fails = 0;
  for (const s of scenarios) {
    const k = `${s.dev}/${s.save}`, B = BUDGET[s.dev];
    const runsOf = set => set.filter(o => key(o) === k).map(judge);
    const cr = runsOf(cand), br = runsOf(ref);
    console.log(`\n${k} (medians of ${cr.length} runs each; base build vs this build)`);
    const rows = [], bad = [];
    cr[0].forEach((c, i) => {
      const cv = med(cr.map(r => r[i].val)), bv = med(br.map(r => r[i].val));
      if (typeof cv !== 'number') { if (!cr.every(r => r[i].ok)) bad.push(`${c.name}: ${cv} (budget ${c.lim})`); return; }
      const slack = typeof c.lim === 'number' ? c.lim * 0.05 : 0;
      const over = cv > c.lim, worse = cv > bv * 1.25 + slack;
      rows.push([c.name, bv, cv, c.lim, over ? (worse ? 'FAIL' : 'noise') : 'ok']);
      if (over && worse) bad.push(`${c.name}: ${cv}${c.unit} vs base ${bv}${c.unit} (budget ${c.lim}${c.unit})`);
    });
    console.log(table(rows.filter(r => r[4] !== 'ok'), ['metric', 'base', 'this', 'budget', 'verdict']) || '(all within budget)');
    console.log(`${k}: ${bad.length ? 'FAIL' : 'PASS'} (${rows.length - bad.length}/${rows.length} ok; ${rows.filter(r => r[4] === 'noise').length} over budget on both builds)`);
    for (const x of bad) console.log('  FAIL ' + x);
    fails += bad.length;
  }
  console.log(`\n${fails ? 'FAIL' : 'PASS'}: ${fails} metric(s) slower than the base build${QUICK ? ' (quick run)' : ''}`);
  return fails;
}
try {
  if (COMPARE) {
    const refBase = `http://127.0.0.1:${srvBase.address().port}/`, refAll = [];
    for (let r = 0; r < RUNS; r++) for (const s of scenarios) {
      process.stdout.write(`run ${r + 1}/${RUNS} ${s.dev}/${s.save}: base ... `); refAll.push(await runScenario(browser, refBase, s));
      process.stdout.write('this ... '); all.push(await runScenario(browser, base, s)); console.log('done');
    }
    if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify({ this: all, base: refAll }, null, 1));
    console.log(`(${Math.round((Date.now() - t0) / 1000)} s, Chromium ${exe.replace(/.*pw-browsers\//, '')}, ${os.cpus().length} CPUs)`);
    await browser.close(); srv.close(); srvBase.close();
    process.exit(compare(all, refAll) ? 1 : 0);
  }
  for (const s of scenarios) { process.stdout.write(`running ${s.dev}/${s.save} ... `); const o = await runScenario(browser, base, s); all.push(o); console.log('done'); }
} finally { await browser.close().catch(() => {}); srv.close(); }
if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify(all, null, 1));
console.log(`(${Math.round((Date.now() - t0) / 1000)} s, Chromium ${exe.replace(/.*pw-browsers\//, '')}, ${os.cpus().length} CPUs)`);
process.exit(report(all) ? 1 : 0);
