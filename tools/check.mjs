#!/usr/bin/env node
// Checks: (1) dist script parses, (2) headless smoke test of the real core,
// (3) old-save fixture migrates without data loss. No dependencies. Exits 1 on failure.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT, loadCore as loadCoreRaw, memoryStorage, badNumbers, deepDiff, subsetDiff } from './lib/core.mjs';

// Every game this run loads has no Omen (almanac.force('none')), so a new real-world day never
// changes prices, drops or odds under a check. The Almanac checks restore the calendar with
// almanac.force(undefined) where they test it.
// A new game starts at a cold Hearth (55-hearth, H1). Sections written before it play the old warm
// start (hearthWarm() undoes a pristine cold start; loaded saves are untouched): pass { cold: true }
// to keep the cold start (the 'cold hearth' section).
function loadCore(opts) {
  const g = loadCoreRaw(opts);
  try { g.eval("typeof almanac === 'object' && almanac.force && almanac.force('none')"); } catch (e) {}
  if (!(opts && opts.cold)) try { g.eval("typeof hearthWarm === 'function' && hearthWarm()"); } catch (e) {}
  return g;
}

let failed = 0;
const ok = msg => console.log('  ok   ' + msg);
const fail = msg => { failed++; console.log('  FAIL ' + msg); };
const assert = (cond, msg) => (cond ? ok(msg) : fail(msg));
const E2 = (g, src) => g.eval(src);
const KEY = 'lanternfall.save.v1';

// ---- 1. dist syntax ----
console.log('dist');
const distFile = path.join(ROOT, 'dist', 'lanternfall.html');
if (!fs.existsSync(distFile)) fail('dist/lanternfall.html missing (run node tools/build.mjs)');
else {
  const html = fs.readFileSync(distFile, 'utf8');
  assert(html.startsWith('<title>'), 'starts with <title>');
  assert(!/<!doctype|<(html|head|body)[\s>]/i.test(html), 'no doctype/html/head/body tags');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  assert(scripts.length === 1, 'one inline <script>');
  try { new vm.Script(scripts[0], { filename: 'dist-script.js' }); ok('script parses'); } catch (e) { fail('script syntax: ' + e.message); }
}

// ---- 2. smoke test ----
console.log('smoke');
try {
  const g = loadCore({ seed: 12345 });
  const { fn } = g;
  const E = s => g.eval(s);
  const start = JSON.parse(JSON.stringify(E('S')));
  let bossFails = 0, zoneClears = 0;
  fn.on('bossFail', () => bossFails++);
  fn.on('zoneClear', () => zoneClears++);
  const run = (secs, dt = 0.1) => { for (let t = 0; t < secs; t += dt) fn.tick(dt); };
  // The roster (56-roster.js) replaced the per-count hire: recruit by name, promote at the cap.
  const buyAll = () => {
    let b = 0; while (b < 200 && fn.buyHero('blade', '1')) b++;
    E('ROSTER_KEYS.forEach(k => { recruit(k); promoteChar(k); })');
  };

  assert(E('rosterLive() && S.party.rv === 1'), 'new game starts on the roster');
  E('S.gold = 50'); assert(!fn.hireComp(0, '1') && E('S.comp[0]') === 0, 'old hire is retired');
  E('S.maxZone = ROSTER.wren.route.zone; S.gold = recruitCost("wren").gold + 80');
  assert(E('recruit("wren")') && E('S.gold') === 80 && E('S.party.field.includes("wren")'), `recruited Wren by name (zone ${E('ROSTER.wren.route.zone')}, ${E('fmt(routeGold(ROSTER.wren.route))')} gold, read from her route)`);
  E('S.maxZone = 1');
  for (let m = 0; m < 30; m++) { run(60); buyAll(); if (E('bossReady()')) fn.challenge(); }
  assert(E('S.maxZone') > 1 || bossFails > 0, `boss attempted (maxZone ${E('S.maxZone')}, fails ${bossFails}, clears ${zoneClears})`);
  E('S.zone = S.maxZone; S.kills = 10'); const tried = fn.challenge() || E('fightBoss'); run(35);
  assert(tried, 'boss fight in progress after challenge');
  assert(E('S.totalKills') > start.totalKills && E('S.L') > 1, `fight progress (L${E('S.L')}, kills ${E('S.totalKills')})`);

  fn.setActivity('gather');
  const ore0 = E('S.mats.ore[0]');
  run(600);
  assert(E('S.mats.ore[0]') > ore0 && E('S.skills.mine.lv') > 1, `gathering progress (ore ${E('S.mats.ore[0]')}, mine lv ${E('S.skills.mine.lv')})`);

  E('S.mats.ore[0] += 50; S.mats.wood[0] += 50; S.mats.ess[0] += 50');
  assert(fn.forgeItem('weapon', 1) === null, 'the legacy Sword is no longer forged');
  const it = fn.forgeItem('pick', 1);
  assert(it && E('S.items.length') >= 1, 'forged an item');
  if (it) assert(fn.equipItem(it.id) && fn.gear().mineSpd > 0, 'equipped forged pickaxe');

  const bad = badNumbers(E('S'));
  assert(!bad.length, 'no NaN/Infinity in state' + (bad.length ? ': ' + bad.slice(0, 5).join(', ') : ''));
  assert(Number.isFinite(fn.totalDps()), 'dps finite');

  fn.save();
  const saved = JSON.parse(g.storage.get(KEY));
  const g2 = loadCore({ storage: memoryStorage({ [KEY]: g.storage.get(KEY) }) });
  const d = deepDiff(saved, JSON.parse(JSON.stringify(g2.eval('S'))));
  assert(!d, 'save/load round-trip lossless' + (d ? ': ' + d : ''));
  assert(!g.errors.length, 'no handler errors' + (g.errors.length ? ': ' + g.errors[0] : ''));

  // extension points
  const g3 = loadCore({ seed: 1 });
  const dps0 = g3.fn.totalDps();
  g3.fn.addModifier('dmg', () => 2);
  assert(Math.abs(g3.fn.totalDps() / dps0 - 2) < 1e-9, 'addModifier(dmg) doubles dps');
  const st = g3.fn.registerState('zz_test', { a: 1, b: { c: 2 } });
  assert(st.a === 1 && g3.eval('fresh().zz_test.b.c') === 2, 'registerState merges into S and fresh()');
  let ticks = 0; g3.fn.onTick(() => ticks++); g3.fn.tick(0.1);
  assert(ticks === 1, 'onTick fires');
  // zone mastery / bestiary (55-mastery.js)
  assert(g3.eval('S.mastery && typeof S.mastery.zones === "object"'), 'mastery state registered');
  g3.eval("emit('kill', { mob: { key: 'slime0', boss: false }, zone: 1, gold: 1, ess: 0, tier: 1 })");
  assert(g3.eval('S.mastery.zones[1] === 1 && S.mastery.types.slime === 1'), 'kill increments mastery and bestiary');
  // classes (55-party.js)
  const g4 = loadCore({ seed: 2 });
  assert(g4.eval('S.party.newGame === true && S.party.chosen === false'), 'new game flagged newGame');
  assert(g4.eval('chooseClass("ranger", "Tess")') && g4.eval('S.party.cls === "ranger" && S.party.chosen && S.name === "Tess"'), 'class chosen');
  assert(g4.eval('isRecruited("tobin") && S.party.field[0] === "tobin" && S.comp.every(n => n === 0)'), 'starter granted and fielded first');
  for (let i = 0; i < 20; i++) g4.fn.tick(0.1);
  assert(g4.eval('castAbility()') && g4.eval('S.party.abilityCd === HERO_CLASSES.ranger.ability.cd') && !g4.eval('castAbility()'), 'ability cast starts cooldown');
  const tapped = g4.eval('(() => { const m = mob; playerTap({ x: 0.6, y: 0.5 }); return m.markUntil > 0; })()');   // (a pack foe may die to the tap: check the one tapped)
  assert(tapped, 'class tap marks the mob');
  assert(!g4.errors.length, 'no party handler errors' + (g4.errors.length ? ': ' + g4.errors[0] : ''));
} catch (e) { fail('smoke crashed: ' + (e.stack || e)); }

// ---- 3. fixture migration ----
console.log('migration');
try {
  const raw = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'save-v2.json'), 'utf8');
  const old = JSON.parse(raw);
  const g = loadCore({ storage: memoryStorage({ [KEY]: JSON.stringify(old) }), extraSource: "registerState('zz_feature', { n: 0 });\n" });
  const S = JSON.parse(JSON.stringify(g.eval('S')));
  const d = subsetDiff(old, S);
  assert(!d, 'every old field preserved' + (d ? ': ' + d : ''));
  assert(S.zz_feature && S.zz_feature.n === 0, 'registered feature field added to old save');
  assert(g.fn.equipped('helm') && g.fn.equipped('helm').u === 'echocowl', 'equipped unique still equipped');
  assert(Number.isFinite(g.fn.totalDps()) && g.fn.totalDps() > 0, 'dps finite for migrated save');
  // Stage C: a support joins only when the party could not hold its max zone without one (this save holds).
  // F1: B3 still picks the old top 3 (kept in S.party.formOld); the party of three keeps the best 2 of them.
  assert(g.eval('S.party.newGame === false && S.party.chosen === false && S.party.formOld.field.join() === "tobin,wren,pip" && S.party.field.length === 2 && S.party.field.every(k => S.party.formOld.field.includes(k))'),
    `existing save: B3 fields its top 3 companions, tank first (${g.eval('S.party.formOld.field.join()')}); the party of three keeps ${g.eval('S.party.field.join()')}`);
  // a pre-activity save (raiding flag) still migrates
  const legacy = { ...old }; delete legacy.activity; legacy.raiding = true;
  const g2 = loadCore({ storage: memoryStorage({ [KEY]: JSON.stringify(legacy) }) });
  assert(g2.eval('S.activity') === 'raid' && g2.eval('S.raiding') === undefined, 'legacy raiding flag migrates');
} catch (e) { fail('migration crashed: ' + (e.stack || e)); }

// ---- 4. craft data tables (21-data-craft.js) ----
console.log('craft data');
try {
  const g = loadCore({ seed: 3 });
  const r = g.eval(`(() => {
    const bad = [], fam = new Set(CRAFT_FAMILIES);
    if (CRAFT_FAMILIES.some(k => !MAT[k] || MAT[k].short.length !== 5 || MAT[k].col.length !== 5)) bad.push('family missing from MAT');
    for (const [k, d] of Object.entries(CRAFT_KINDS)) {
      for (const m of Object.keys(d.rec)) if (!fam.has(m)) bad.push(k + ' recipe uses ' + m);
      if (!CRAFT_STATIONS[d.st]) bad.push(k + ' station ' + d.st);
      if (!fam.has(d.pre)) bad.push(k + ' prefix ' + d.pre);
      for (const [s] of d.base) if (!CRAFT_STATS[s]) bad.push(k + ' base stat ' + s);
      const rows = Object.entries(CRAFT_FITS).filter(([, row]) => Object.values(row).some(l => l.includes(k))).map(([p]) => p);
      if (!rows.length) bad.push(k + ' has no FITS row');
      for (const p of [d.pos, d.comp].filter(Boolean)) if (!rows.includes(p)) bad.push(k + ' missing from FITS.' + p);
      if (d.role && !craftAffixPool(k).length) bad.push(k + ' empty affix pool');
    }
    for (const row of Object.values(CRAFT_FITS)) for (const l of Object.values(row)) for (const k of l) if (!CRAFT_KINDS[k]) bad.push('FITS names unknown kind ' + k);
    for (const [r, l] of Object.entries(CRAFT_ROLE_POOL)) {
      if (!l.length) bad.push(r + ' pool empty');
      for (const a of l) if (!CRAFT_AFFIXES[a] || CRAFT_AFFIXES[a].give.some(([s]) => !CRAFT_STATS[s])) bad.push('affix ' + a);
    }
    for (const tr of CRAFT_TROPHIES) for (const s of Object.values(tr.mw)) if (s && !(CRAFT_STATS[s] && CRAFT_MW.per[s])) bad.push('trophy ' + tr.key + ' line ' + s);
    for (const d of Object.values(CRAFT_SIG_DROPS)) if (!fam.has(d.fam)) bad.push('sig drop ' + d.fam);
    for (const d of Object.values(CRAFT_TONICS)) for (const m of Object.keys(d.rec)) if (!fam.has(m)) bad.push('tonic uses ' + m);
    for (const k of Object.keys(CRAFT_NODES)) if (!NODE_NAMES[k] || NODE_NAMES[k].length !== 5 || !SKILL[skillOf(k)]) bad.push('node ' + k);
    if (CRAFT_TROPHIES.length !== TYPES.length || CRAFT_HOME.length !== TYPES.length || TYPES.some(t => !CRAFT_SIG_DROPS[t.key])) bad.push('per-type tables not 7 long');
    // spec 1 demand check: tier-1 units for a full class set (4 class kinds + Charm)
    const want = { warden: 48, lanternmage: 45, ranger: 43, lightkeeper: 44 };
    for (const [c, n] of Object.entries(want)) {
      const set = ['weapon', 'off', 'helm', 'body'].map(p => CRAFT_FITS[p][c][0]).concat('charm');
      const got = set.reduce((a, k) => a + Object.values(CRAFT_KINDS[k].rec).reduce((x, y) => x + y, 0), 0);
      if (got !== n) bad.push(c + ' set needs ' + got + ', spec says ' + n);
    }
    for (const k of Object.keys(RECIPE)) if (CRAFT_KINDS[k].rec !== RECIPE[k]) bad.push('legacy recipe ' + k + ' changed');
    return bad;
  })()`);
  assert(!r.length, 'craft tables consistent' + (r.length ? ': ' + r.slice(0, 5).join('; ') : ''));
  assert(g.eval("skillOf('ore') === 'mine' && skillOf('wood') === 'wood' && skillOf('crystal') === 'mine' && skillOf('herb') === 'forage'"), 'skillOf is table-driven');
} catch (e) { fail('craft data crashed: ' + (e.stack || e)); }

// ---- 5. roster and migration (56-roster.js, B1 + B3) ----
console.log('roster');
try {
  const FIX = ['save-v2.json', 'save-mid-v2.json', 'save-v2-late.json', 'save-a-v1.json'];
  // Stage A's own fields that the roster now owns: their values may change on migration.
  const OWNED = ['field', 'cells'];
  for (const f of FIX) {
    const raw = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
    const old = JSON.parse(raw);
    const g = loadCore({ storage: memoryStorage({ [KEY]: raw }) });
    const S = JSON.parse(JSON.stringify(g.eval('S')));
    const cmp = JSON.parse(raw);
    if (cmp.party) for (const k of OWNED) { delete cmp.party[k]; }
    const d = subsetDiff(cmp, S);
    assert(!d, `${f}: every old field preserved` + (d ? ': ' + d : ''));
    const nl = g.eval('rosterNoLoss()');
    assert(S.party.rv === 1 && nl.ratio >= 1 && nl.ratio <= 1.3, `${f}: T9 field damage vs old compDps ${nl.ratio.toFixed(3)} (old ${nl.old.toFixed(0)}, now ${nl.now.toFixed(0)}; want 1.00-1.30)`);
    // F1: the party of three drops a companion; its no-loss check is the formation section's C9 (hero + field).
    const oldDps = g.eval('oldCompDps()'), b3Dps = g.eval('formNoLoss() ? formNoLoss().before - heroDps() : compDps()');
    assert(b3Dps >= oldDps * 0.999, `${f}: B3's field of 3 ${b3Dps.toFixed(0)} >= old formula ${oldDps.toFixed(0)}`);
    const bad = badNumbers(S);
    assert(!bad.length && Number.isFinite(g.fn.totalDps()), `${f}: no NaN/Infinity` + (bad.length ? ': ' + bad.slice(0, 3).join(', ') : ''));
    const shape = g.eval(`Object.entries(S.party.rec).every(([k, r]) => ROSTER[k] && r.lv >= 1 && r.lv <= levelCap(r.rank) && r.rank >= 0 && r.rank <= 7 && r.xp >= 0 && 'wpn' in r && 'trk' in r && 'seen' in r)`);
    assert(shape, `${f}: roster records valid`);
    const fld = S.party.field;
    assert(fld.length >= 1 && fld.length <= 2 && fld.every(k => S.party.rec[k]) && S.party.cells.hero && fld.every(k => S.party.cells[k]), `${f}: field ${fld.join(',')} placed`);
    const mapped = old.comp.map((n, i) => n > 0 ? i : -1).filter(i => i >= 0)
      .map(i => (i === 0 && old.party && old.party.newGame && old.party.cls === 'lightkeeper') ? 'bram' : g.eval(`COMP_CHAR_KEYS[${i}]`));
    assert(mapped.every(k => S.party.rec[k] && S.party.rec[k].src === 'migrated') && (old.maxZone < 3 || S.party.rec.hesketh), `${f}: old companions migrated (${mapped.join(',')}), Hesketh from zone 3`);
    // round trip: save, reload, nothing lost, migration not run again
    g.fn.save();
    const saved = g.storage.get(KEY);
    const g2 = loadCore({ storage: memoryStorage({ [KEY]: saved }) });
    const d2 = deepDiff(JSON.parse(saved), JSON.parse(JSON.stringify(g2.eval('S'))));
    assert(!d2 && Math.abs(g2.fn.compDps() / g.fn.compDps() - 1) < 1e-9, `${f}: save/load round-trip lossless` + (d2 ? ': ' + d2 : ''));
    // play a minute: S.comp is never written again
    const comp0 = JSON.stringify(old.comp);
    E2(g, 'S.gold += 1e6'); g.fn.hireComp(0, '1');
    for (let i = 0; i < 600; i++) g.fn.tick(0.1);
    assert(JSON.stringify(g.eval('S.comp')) === comp0, `${f}: S.comp untouched after play`);
    assert(!g.errors.length, `${f}: no handler errors` + (g.errors.length ? ': ' + g.errors[0] : ''));
  }
  // promotions and recruits never reshuffle the rest of a migrated field
  {
    const g = loadCore({ storage: memoryStorage({ [KEY]: fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'save-v2-late.json'), 'utf8') }) });
    const f0 = g.eval('S.party.field.join()');
    g.eval('S.gold = 1e15; S.mats.ess = [999, 999, 999, 999, 999]; promoteChar(S.party.field[0])');
    const fp = g.eval('S.party.field.join()');
    const plan = g.eval('JSON.stringify(bestLineup({ by: "potential" }).field.slice().sort())');
    g.eval('unlockChar("thessaly", "test", true)');
    // F3: a recruit re-plans through the planner (autoPlan): the field stays, or becomes the planner's pick.
    const a = f0.split(','), b = g.eval('S.party.field.slice()');
    const stays = b.join() === f0, planned = JSON.stringify(b.slice().sort()) === g.eval('JSON.stringify(bestLineup({ by: "potential" }).field.slice().sort())');
    assert(fp === f0 && (stays || planned) && !b.includes('elowen'), `late save: promote keeps the field; a recruit leaves it or applies the planner's pick (${f0} -> ${b.join()}; plan before the recruit ${plan})`);
  }
  // spec example: save-v2.json -> Tobin rank 1 lv 25+, Wren 14+, Pip 6+, Hesketh 1
  {
    const g = loadCore({ storage: memoryStorage({ [KEY]: fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'save-v2.json'), 'utf8') }) });
    const r = g.eval('S.party.rec');
    assert(r.tobin.rank >= 1 && r.tobin.lv >= 25 && r.wren.lv >= 14 && r.pip.lv >= 6 && r.hesketh.lv === 1, `save-v2 mapping (Tobin r${r.tobin.rank} L${r.tobin.lv}, Wren L${r.wren.lv}, Pip L${r.pip.lv}, Hesketh L${r.hesketh.lv})`);
  }
  // new games: starter per class, XP from use, caps, promotions, milestones, offline XP
  const want = { warden: 'wren', lanternmage: 'tobin', ranger: 'tobin', lightkeeper: 'bram' };
  for (const [cls, st] of Object.entries(want)) {
    const g = loadCore({ seed: 3 });
    g.eval(`chooseClass(${JSON.stringify(cls)})`);
    assert(g.eval(`S.party.field.join() === ${JSON.stringify(st)} && charRec(${JSON.stringify(st)}).lv === 1 && S.comp.every(n => n === 0)`), `${cls}: starter ${st} joins at level 1`);
  }
  {
    const g = loadCore({ seed: 4 });
    const E = s => g.eval(s);
    E('chooseClass("warden")');
    const ms = [], lv = [];
    g.fn.on('milestone', p => ms.push(p.lv)); g.fn.on('charLevel', p => lv.push(p.id));
    for (let i = 0; i < 9000; i++) g.fn.tick(0.1);   // BAL1: levels follow time spent fighting, so 15 minutes (was 5)
    assert(E('charRec("wren").lv') > 1 && ms.includes(5), `fielded Wren levels from kills (L${E('charRec("wren").lv')}, milestones ${ms.join(',')})`);
    assert(E('storyState("wren").unread') >= 1 && E('markStoriesRead("wren") && storyState("wren").unread === 0'), 'camp stories unlock and can be marked read');
    E('S.maxZone = Math.max(S.maxZone, ROSTER.tobin.route.zone, ROSTER.hesketh.route.zone)'); g.fn.tick(1.1);
    assert(E('isRecruited("tobin") && isRecruited("hesketh")'), `Tobin and Hesketh join free at their zones (${E('ROSTER.tobin.route.zone')}, ${E('ROSTER.hesketh.route.zone')})`);
    E('benchChar("hesketh")');
    const hk = E('charRec("hesketh").lv'); for (let i = 0; i < 1200; i++) g.fn.tick(0.1);
    assert(E('charRec("hesketh").lv') === hk && !E('S.party.field.includes("hesketh")'), 'benched characters earn no XP');
    E('charRec("wren").lv = 25; charRec("wren").xp = 0');
    E('addCharXp("wren", 1e9)');
    assert(E('charRec("wren").lv') === 25 && E('charRec("wren").xp') <= E('bankXp(25)') + 1e-9 && E('charRec("wren").xp') > E('cxpNeed(25)'), `level cap holds and XP banks ${E('ROSTER_TUNE.bankLv')} levels (BAL1)`);
    E('S.gold = 1e12; S.mats.ess = [0, 0, 50, 0, 0]');
    assert(E('canPromote("wren") && promoteChar("wren")') && E('charRec("wren").rank') === 1 && E('charRec("wren").lv') >= 40, `promotion: rank up, cap +25, banked XP spent at once (L${E('charRec("wren").lv')}), higher-tier essence accepted`);
    assert(E('S.mats.ess[2]') === 45, 'Common promotion costs half essence (5)');
    E('charRec("wren").lv = 26');
    const d0 = E('charPow("wren")'); E('charRec("wren").rank = 2'); const d1 = E('charPow("wren")');
    assert(Math.abs(d1 / d0 - E('ROSTER_TUNE.rankX')) < 1e-9, `a rank multiplies power by ROSTER_TUNE.rankX (x${E('ROSTER_TUNE.rankX')})`);
    E('S.activity = "fight"; S.zone = S.maxZone');
    // F3: the planner may field Hesketh over Tobin (the Warden hero is the tank): the first fielded companion
    const fk = E('S.party.field.find(k => k !== "wren") || S.party.field[0]'), fnm = E(`ROSTER[${JSON.stringify(fk)}].name.split(' ')[0]`);
    const before = E(`charRec(${JSON.stringify(fk)}).lv`), res = g.fn.awayGains(3600);
    assert(E(`charRec(${JSON.stringify(fk)}).lv`) > before && res.lines.some(l => l.txt.includes(fnm)), `offline XP for the field (${fnm} L${before} -> L${E(`charRec(${JSON.stringify(fk)}).lv`)})`);
    assert(E('supportBuff()') >= 0 && Number.isFinite(g.fn.totalDps()), 'support buff finite');
    assert(E('!canRecruit("oriel") && recruitCost("oriel") === null && recruitHow("oriel").length > 0'), 'non-progress routes stay locked with a how line');
    let off = null; E('S.maxZone = 30');
    off = g.eval('addRecruitRoute("maren", { source: "quest", ready: () => true, cost: () => ({ gold: 10, ess: [2, 3] }), how: () => "test" })');
    assert(E('canRecruit("maren") && recruit("maren") && charRec("maren").src === "quest"'), 'addRecruitRoute: a new avenue recruits without editing the roster');
    off();
    assert(E('Object.keys(ROSTER).length === 18') && E('Object.values(ROSTER).every(c => CHAR_RARITY[c.rarity] && ROLE_STATS[c.role] && c.how && c.title)'), '18 characters with rarity, role, title and how');
    assert(!g.errors.length, 'no roster handler errors' + (g.errors.length ? ': ' + g.errors[0] : ''));
  }
} catch (e) { fail('roster crashed: ' + (e.stack || e)); }

// ---- 6. items core (41-items.js, K4; gathering spec 7 / G11) ----
console.log('items');
try {
  // Measured with the pre-K4 code (commit 5c6c186) on each fixture right after load.
  // gear() keys not listed were 0 (tap 1). K4 must reproduce these exactly.
  const BASE = {
    'save-v2.json': { gear: { might: 65.52, crit: 3.84, critMult: 0.16, tap: 1, echo: 0.5, score: 97.52 }, hero: 1429.9470853022208, total: 3121.288117110944 },
    'save-mid-v2.json': { gear: { might: 65.52, crit: 3.84, critMult: 0.16, gold: 12.42, ess: 4.6575, mineSpd: 16.8, oreDbl: 2.8000000000000003, tap: 1, echo: 0.5, score: 141.045 }, hero: 7767.596499399474, total: 21767.801063696992 },
    'save-v2-late.json': { gear: { might: 760, crit: 44.943999999999996, critMult: 1.456, gold: 334.08, ess: 125.27999999999999, mineSpd: 353.28, woodSpd: 90.72000000000001, oreDbl: 58.879999999999995, woodDbl: 15.120000000000003, tap: 1, oreExtra: 0.25, score: 2208.7999999999997 }, hero: 114042445.98411426, total: 195938176.23101446 },
    'save-a-v1.json': { gear: { might: 65.52, crit: 3.84, critMult: 0.16, tap: 1, echo: 0.5, score: 97.52 }, hero: 432.1058201711884, total: 3964.2446024889095 }
  };
  const OLD_KEYS = ['might', 'crit', 'critMult', 'gold', 'ess', 'mineSpd', 'woodSpd', 'oreDbl', 'woodDbl', 'party', 'tap', 'echo', 'offline', 'raid', 'essExtra', 'oreExtra', 'woodExtra', 'gather', 'score'];
  // The formulas as they were before these changes; the item maths itself is what K4 must keep exact.
  const PRE_K4 = 'SYN_TUNE.on = 0; UNIQ_TUNE.pow = 3.2; RETOOL.on = 0; TIER_POW.splice(0, 6, 0, 10, 28, 70, 160, 360); PACE.heroLv = 0.05; PACE.bladeX = 2; gearDirty()';
  const CLASSES = ['warden', 'lanternmage', 'ranger', 'lightkeeper'];
  const gearDiff = (gs, want) => OLD_KEYS.map(k => [k, gs[k], want[k] !== undefined ? want[k] : k === 'tap' ? 1 : 0]).filter(([, a, b]) => a !== b).map(([k, a, b]) => `${k} ${a} != ${b}`);
  for (const [f, want] of Object.entries(BASE)) {
    const raw = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
    const old = JSON.parse(raw);
    const g = loadCore({ storage: memoryStorage({ [KEY]: raw }) });
    g.eval(PRE_K4); // pre-K4 baselines predate synergies (B2), the unique rebalance, the retool (legacy Sword/Helm fit any class) and the BAL1 ramp (gear tiers, Blade, hero level)
    const S = JSON.parse(JSON.stringify(g.eval('S')));
    const matsOk = Object.keys(old.mats).every(k => JSON.stringify(old.mats[k]) === JSON.stringify(S.mats[k])) && ['crystal', 'fibre', 'herb', 'hide'].every(k => JSON.stringify(S.mats[k]) === '[0,0,0,0,0]');
    const itemsOk = !deepDiff(old.items, S.items) && S.items.map(i => i.id).join() === old.items.map(i => i.id).join();
    const eqOk = Object.keys(old.equip).every(k => S.equip[k] === old.equip[k]) && ['off', 'body', 'sickle'].every(k => S.equip[k] === null);
    const skOk = ['forage', 'bench', 'loom', 'ench'].every(k => S.skills[k] && S.skills[k].lv === 1 && S.skills[k].xp === 0) && ['mine', 'wood', 'smith'].every(k => !deepDiff(old.skills[k], S.skills[k]));
    assert(matsOk && itemsOk && eqOk && skOk, `${f}: materials, ${S.items.length} items, ids, equip and skills identical after load (new ones empty)`);
    const gd = gearDiff(g.fn.gear(), want.gear);
    assert(!gd.length, `${f}: gear() exactly equal to pre-K4` + (gd.length ? ': ' + gd.slice(0, 3).join('; ') : ''));
    const hd = g.fn.heroDps(), td = g.fn.totalDps();
    // totalDps = heroDps + compDps; companions follow the roster formulas (BAL1 changed them), checked by T9 in the roster section.
    assert(hd === want.hero && td === hd + g.fn.compDps(), `${f}: heroDps ${hd} exactly equal to pre-K4 (total ${td} = hero + party)`);
    assert(g.eval('gear().attack === 0 && gear().spell === 0'), `${f}: no new live stats on old gear`);
    // every equipped item fits its position for every class, and gear() does not depend on the class
    const fitBad = [];
    for (const cls of CLASSES.concat('any')) {
      for (const [pos, id] of Object.entries(S.equip)) if (id != null && !g.eval(`fits(itemById(${id}), ${JSON.stringify(pos)}, ${JSON.stringify(cls)})`)) fitBad.push(`${pos}#${id} as ${cls}`);
      g.eval(`S.party.cls = ${cls === 'any' ? 'null' : JSON.stringify(cls)}; gearDirty()`);
      const d = gearDiff(g.fn.gear(), want.gear); if (d.length) fitBad.push(`gear as ${cls}: ${d[0]}`);
    }
    g.eval(`S.party.cls = ${JSON.stringify(S.party.cls)}; gearDirty()`);
    assert(!fitBad.length, `${f}: equipped items fit for every class` + (fitBad.length ? ': ' + fitBad.slice(0, 3).join('; ') : ''));
    assert(g.eval('S.items.every(i => !("a" in i) && !("mw" in i) && itemName(i) && itemColor(i.slot, i.t, i.u))'), `${f}: old items gain no fields and keep names and colours`);
    // load -> save -> load loses nothing
    g.fn.save();
    const saved = g.storage.get(KEY);
    const g2 = loadCore({ storage: memoryStorage({ [KEY]: saved }) });
    g2.eval(PRE_K4);
    const d2 = deepDiff(JSON.parse(saved), JSON.parse(JSON.stringify(g2.eval('S'))));
    assert(!d2 && g2.fn.heroDps() === want.hero && g2.fn.totalDps() === g.fn.totalDps() && !gearDiff(g2.fn.gear(), want.gear).length, `${f}: load-save-load round trip lossless` + (d2 ? ': ' + d2 : ''));
  }

  // an old save over the bag limit keeps every item on load
  {
    const old = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'save-v2.json'), 'utf8'));
    let id = old.nextId; for (let i = 0; i < 70; i++) old.items.push({ id: id++, slot: 'charm', t: 1, r: 'common', plus: 0 });
    old.nextId = id;
    const g = loadCore({ storage: memoryStorage({ [KEY]: JSON.stringify(old) }) });
    assert(g.eval('S.items.length') === old.items.length && g.eval('bagCount()') === old.items.length - 2 && g.eval('bagFull()'), `loading ${old.items.length} items deletes none; equipped ones are not in the bag`);
  }

  // affix rolls: deterministic under the seeded rng, distinct lines, within ranges
  {
    const g = loadCore({ seed: 7 });
    const r = g.eval(`(() => {
      const bad = [], R = ['common', 'uncommon', 'rare', 'epic'];
      const roll = seed => { const rnd = rng(seed), out = []; for (const k of Object.keys(CRAFT_KINDS)) for (const r of R) for (const ro of [undefined, 'tank', 'striker', 'caster', 'support']) out.push(rollAffixes(k, r, 2, ro, rnd)); return out; };
      if (JSON.stringify(roll(11)) !== JSON.stringify(roll(11))) bad.push('not deterministic');
      if (JSON.stringify(roll(11)) === JSON.stringify(roll(12))) bad.push('seed ignored');
      const rnd = rng(5);
      for (const [k, d] of Object.entries(CRAFT_KINDS)) for (const r of R) for (let n = 0; n < 20; n++) {
        const role = d.role === 'any' ? ['tank', 'striker', 'caster', 'support'][n % 4] : undefined;
        const a = rollAffixes(k, r, 1 + n % 5, role, rnd), pool = craftAffixPool(k, role);
        const want = Math.min(craftAffixLines(r, null), pool.length);
        if (a.length !== want) bad.push(k + ' ' + r + ' has ' + a.length + ' lines, want ' + want);
        if (new Set(a.map(l => l[0])).size !== a.length) bad.push(k + ' duplicate affix');
        if (a.some(([id, q]) => !pool.includes(id) || !(q >= 0 && q <= 1))) bad.push(k + ' affix out of pool or range');
        if (!d.role && a.length) bad.push(k + ' should roll nothing');
        const it = { id: -1, slot: k, t: 1 + n % 5, r, plus: n % 11, a, mw: n % 3 ? undefined : n % 7 };
        const p = itemPower(it), lines = itemLines(it);
        let j = craftBaseLines(k, p).length;
        for (const [id] of a) {
          const lo = craftAffixValue(id, p, 0), hi = craftAffixValue(id, p, 1);
          lo.forEach(([s, v], i) => { const [ls, lv] = lines[j++]; if (ls !== s || lv < v - 1e-9 || lv > hi[i][1] + 1e-9) bad.push(k + ' ' + s + ' value out of range'); });
        }
      }
      return bad;
    })()`);
    assert(!r.length, 'affix rolls deterministic, distinct and within range' + (r.length ? ': ' + [...new Set(r)].slice(0, 4).join('; ') : ''));
    // Reforge: never duplicates a stat, never touches mw, cost rises
    const rf = g.eval(`(() => {
      const bad = [], rnd = rng(9);
      for (const k of ['warblade', 'bow', 'staff', 'tome', 'trinket', 'plate']) for (const r of ['common', 'rare', 'epic']) {
        let it = newItem(k, 3, r, { role: k === 'trinket' ? 'caster' : undefined, mw: 3, rnd });
        const n0 = it.a.length; let last = 0;
        for (let i = 0; i < 60; i++) {
          const idx = i % it.a.length, res = reforgeLine(it, idx, rnd);
          if (!res) { bad.push(k + ' reforge refused'); break; }
          if (res.cost.gold <= last) bad.push(k + ' cost does not rise'); last = res.cost.gold;
          if (res.a.some((l, j) => j !== idx && (l[0] !== it.a[j][0] || l[1] !== it.a[j][1]))) bad.push(k + ' touched another line');
          it = Object.assign({}, it, { a: res.a, rf: res.rf });
          if (new Set(it.a.map(l => l[0])).size !== it.a.length) bad.push(k + ' duplicate stat after reforge');
          if (it.mw !== 3 || it.a.length !== n0) bad.push(k + ' mw or line count changed');
          if (!craftAffixPool(k, it.ro).includes(res.line[0])) bad.push(k + ' reforged out of pool');
        }
      }
      if (reforgeLine({ slot: 'charm', t: 1, r: 'rare', plus: 0 }, 0) !== null) bad.push('reforged an item with no affixes');
      return bad;
    })()`);
    assert(!rf.length, 'reforge keeps lines distinct, leaves mw alone, cost rises per reforge' + (rf.length ? ': ' + [...new Set(rf)].slice(0, 4).join('; ') : ''));
  }

  // new positions, class fits, attack feeds hero damage, companion gear, trophy gate
  {
    const g = loadCore({ seed: 8 });
    const E = s => g.eval(s);
    E('chooseClass("ranger")');
    const d0 = g.fn.heroDps();
    E('S.items.push(newItem("bow", 1, "rare", { rnd: rng(1) }), newItem("quiver", 1, "common", { rnd: rng(2) }), newItem("warblade", 1, "common"), newItem("leathers", 1, "epic", { mw: 0 }))');
    const [bow, quiver, blade, leath] = E('S.items.map(i => i.id)');
    assert(E(`equipItem(${bow}) && equipItem(${quiver}) && !equipItem(${blade}) && equipItem(${leath}, 'body')`) && E(`S.equip.weapon === ${bow} && S.equip.off === ${quiver} && S.equip.body === ${leath}`), 'Ranger wears Bow, Quiver, Leathers; not a Warblade');
    const gs = E('gear()'), want = E(`(() => { const s = {}; for (const id of [${bow}, ${quiver}, ${leath}]) for (const [k, v] of itemLines(itemById(id))) s[k] = (s[k] || 0) + v; return s; })()`);
    assert(Object.entries(want).every(([k, v]) => Math.abs(gs[k] - v) < 1e-9) && gs.hp > 0, 'gear() adds base, affix and Masterwork lines over the new positions');
    assert(g.fn.heroDps() > d0, `class gear raises hero dps (${d0.toFixed(1)} -> ${g.fn.heroDps().toFixed(1)})`);
    E('S.party.cls = "warden"; gearDirty()');
    assert(E('gear().might === 0 && gear().score === 0'), 'gear that no longer fits the class is ignored');
    E('S.party.cls = "ranger"; gearDirty()');
    assert(E(`bagCount() === 1 && isEquipped(${bow})`), 'equipped items do not count towards the bag');
    // companion gear (wpn/trk): Tobin is the Ranger's starter tank
    E('S.items.push(newItem("shield", 2, "rare"), newItem("staff", 2, "rare"), newItem("trinket", 2, "uncommon", { role: "tank" }))');
    const [sh, st, tk] = E('S.items.slice(-3).map(i => i.id)');
    E(`charRec("tobin").wpn = ${sh}; charRec("tobin").trk = ${tk}`);
    const cg = E('charGear("tobin")');
    assert(cg.hp > 0 && cg.haste > 0 && cg.score > 0 && E(`bagCount() === 2 && isEquipped(${tk})`), 'charGear reads wpn/trk; companion-equipped items leave the bag');
    E(`charRec("tobin").wpn = ${st}`);
    assert(E('charGear("tobin").score') === E(`itemPower(itemById(${tk}))`), 'a Staff does not fit a tank companion');
    assert(E(`fits("shield", "wpn", "tank") && fits("shield", "off", "warden") && !fits("shield", "off", "ranger") && !fits("weapon", "weapon", "lightkeeper") && !fits("helm", "helm", "ranger") && fits("weapon", "weapon", "any") && fits("helm", "helm", "any") && fits({ slot: "weapon", t: 1, r: "legendary", plus: 0, u: "sproutblade" }, "weapon", "ranger") && fits({ slot: "helm", t: 1, r: "legendary", plus: 0, u: "echocowl" }, "helm", "warden") && fits("trinket", "trk", "tobin") && !fits("trinket", "weapon", "any")`), 'fits(): class, role, character rules; legacy Sword/Helm only without a class; uniques fit every class');
    assert(E('upgradeCost({ slot: "bow", t: 1, r: "common", plus: 7 }).troph === 1 && !("troph" in upgradeCost({ slot: "bow", t: 1, r: "common", plus: 6 })) && !("troph" in upgradeCost({ slot: "bow", t: 1, r: "common", plus: 10 }))'), 'upgrades to +8, +9 and +10 name a Trophy');
    assert(E('itemName(newItem("bow", 2, "rare")) === "Yew Bow" && itemColor("bow", 2) === MAT.wood.col[1] && craftCost("bow", 2).wood === 9'), 'names, colours and costs for new kinds');
    assert(Object.keys(E('newItem("weapon", 1, "common")')).join() === 'id,slot,t,r,plus', 'legacy forge items carry no new fields');
    assert(!g.errors.length, 'no items handler errors' + (g.errors.length ? ': ' + g.errors[0] : ''));
  }
} catch (e) { fail('items crashed: ' + (e.stack || e)); }

// ---- 6b. retool: class gear only (owner bug "I was able to equip a sword as a ranger") ----
console.log('retool');
try {
  const FIX = ['save-v2.json', 'save-mid-v2.json', 'save-v2-late.json', 'save-a-v1.json'];
  const CLASSES = ['warden', 'lanternmage', 'ranger', 'lightkeeper'];
  const legacyLeft = 'S.items.filter(i => !i.u && (i.slot === "weapon" || i.slot === "helm")).length';
  for (const f of FIX) {
    const raw = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8'), old = JSON.parse(raw);
    const row = [];
    for (const cls of CLASSES) {
      const q = JSON.stringify(cls);
      // before: the same load + chooseClass with the retool off (legacy gear fits any class)
      const g0 = loadCore({ storage: memoryStorage({ [KEY]: raw }) });
      g0.eval(`RETOOL.on = 0; chooseClass(${q})`);
      const hd0 = g0.fn.heroDps(), td0 = g0.fn.totalDps();
      // after: load + chooseClass
      const g = loadCore({ storage: memoryStorage({ [KEY]: raw }) }), E = x => g.eval(x);
      const eq0 = E('JSON.stringify(S.equip)');
      const toasts = []; g.fn.on('toast', t => toasts.push(t.msg));
      E(`chooseClass(${q})`);
      const hd = g.fn.heroDps(), td = g.fn.totalDps();
      const ids = E('S.items.map(i => i.id).join()') === old.items.map(i => i.id).join();
      const same = E(`JSON.stringify(S.items.map(i => [i.t, i.r, i.plus, i.u || null]))`) === JSON.stringify(old.items.map(i => [i.t, i.r, i.plus, i.u || null]));
      assert(E(legacyLeft) === 0 && ids && same && E('JSON.stringify(S.equip)') === eq0, `${f} ${cls}: no legacy Sword/Helm left; ${old.items.length} items, ids, tier, rarity, +N and equip unchanged`);
      assert(hd >= hd0 && td >= td0, `${f} ${cls}: heroDps ${hd0.toFixed(2)} -> ${hd.toFixed(2)}, totalDps ${td0.toFixed(2)} -> ${td.toFixed(2)} (never lower)`);
      const w = E('itemById(S.equip.weapon)');
      if (w && !w.u) assert(w.slot === E(`CRAFT_FITS.weapon[${q}][0]`) && w.rt === 'weapon', `${f} ${cls}: the worn Sword is now a ${E(`CRAFT_KINDS[${JSON.stringify(w.slot)}].noun`)} (${E('itemName(itemById(S.equip.weapon))')})`);
      const legN = old.items.filter(i => !i.u && (i.slot === 'weapon' || i.slot === 'helm')).length;
      const note = toasts.filter(t => /reforged/.test(t));
      assert(legN ? note.length === 1 && note[0].endsWith(`into ${E(`HERO_CLASSES[${q}].name`)} gear.`) : !note.length, `${f} ${cls}: one notice (${note.join(' | ') || 'none needed'})`);
      // load -> save -> load: lossless, no second retool, same dps
      g.fn.save();
      const saved = g.storage.get(KEY);
      const g2 = loadCore({ storage: memoryStorage({ [KEY]: saved }) });
      g2.eval('retoolItems(true)');   // what the first tick would do: nothing left to convert
      const d2 = deepDiff(JSON.parse(saved).items, JSON.parse(JSON.stringify(g2.eval('S.items'))));
      const r2 = g2.fn.heroDps() / hd;
      assert(!d2 && g2.eval('JSON.stringify(S.equip)') === E('JSON.stringify(S.equip)') && g2.eval('JSON.stringify(gear())') === E('JSON.stringify(gear())') && Math.abs(r2 - 1) < 1e-9, `${f} ${cls}: round trip lossless` + (d2 ? ': ' + d2 : '') + (Math.abs(r2 - 1) >= 1e-9 ? ` (dps ratio ${r2})` : ''));
      assert(!g.errors.length && !g2.errors.length, `${f} ${cls}: no handler errors` + (g.errors.length ? ': ' + g.errors[0] : ''));
      row.push(`${cls} ${hd0.toFixed(1)}->${hd.toFixed(1)}`);
    }
    console.log(`       ${f} heroDps: ${row.join(', ')}`);
  }
  // a save that already has a class retools on load (first tick)
  {
    const raw = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'save-a-v1.json'), 'utf8');
    const g = loadCore({ storage: memoryStorage({ [KEY]: raw }) }), E = x => g.eval(x);
    const hd0 = g.fn.heroDps(), td0 = g.fn.totalDps(), toasts = [];
    g.fn.on('toast', t => toasts.push(t.msg));
    g.fn.tick(0.1);
    assert(E('itemById(3).slot === "censer" && itemById(3).rt === "weapon" && S.equip.weapon === 3 && itemById(7).slot === "helm" && S.equip.helm === 7'), 'save-a-v1 (Lightkeeper): the worn Sword becomes a Censer on load; the Echo Cowl (unique) stays');
    assert(g.fn.heroDps() >= hd0 && g.fn.totalDps() >= td0 * (1 - 1e-12), `save-a-v1 on load: dps kept (${hd0.toFixed(2)} -> ${g.fn.heroDps().toFixed(2)})`);
    assert(toasts.includes('Your old sword was reforged into Lightkeeper gear.'), 'on load: one notice');
    const n = toasts.length; g.fn.tick(0.1); E('retoolItems(true)');
    assert(toasts.length === n, 'retool runs once: nothing left to convert');
  }
  // Ranger: no Warblade, no new Sword; a class switch retools the Bow
  {
    const raw = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'save-mid-v2.json'), 'utf8');
    const g = loadCore({ storage: memoryStorage({ [KEY]: raw }) }), E = x => g.eval(x);
    E('chooseClass("ranger")');
    const wb = E('(() => { const it = newItem("warblade", 1, "common"); S.items.push(it); return it.id; })()');
    const sw = E('(() => { const it = newItem("weapon", 1, "common"); S.items.push(it); return it.id; })()');
    assert(!E(`equipItem(${wb})`) && !E(`equipItem(${sw})`) && E('S.equip.weapon') === 3 && E('itemById(3).slot') === 'bow', 'a Ranger cannot equip a Warblade or a Sword; the old Sword is a Bow');
    assert(E('equipItem(7)') && E('S.equip.helm') === 7, 'a Ranger still wears the Echo Cowl (unique)');
    E(`S.items = S.items.filter(i => i.id !== ${wb} && i.id !== ${sw})`);
    const gs0 = E('JSON.stringify(gear())');
    E('S.party.mirrors = 1; useMirror(); chooseClass("warden")');
    assert(E('itemById(3).slot === "warblade" && itemById(3).rt === "weapon" && S.equip.weapon === 3') && E('JSON.stringify(gear())') === gs0, 'Mirror of Embers: the Bow becomes a Warblade, still worn, gear() unchanged');
    assert(!g.errors.length, 'no retool handler errors' + (g.errors.length ? ': ' + g.errors[0] : ''));
  }
} catch (e) { fail('retool crashed: ' + (e.stack || e)); }

// ---- 7. synergies in three layers: slot jobs, combos and Kin, Bonds (56b-synergy.js; B2, rebuilt by plan-3 F2, formation.md 2) ----
console.log('synergy');
try {
  const g = loadCore({ seed: 6 });
  const E = s => g.eval(s);
  E('chooseClass("warden"); ROSTER_KEYS.forEach(k => unlockChar(k, "test", true))');
  const lv = (ids, n) => E(`${JSON.stringify(ids)}.forEach(k => { charRec(k).lv = ${n}; })`);
  // F1: autoPlace puts everyone in the home rule, so a line-up's slots (Out of place) do not depend on the one before.
  const field = ids => E(`setField(${JSON.stringify(ids)}); autoPlace()`);
  const act = () => E('activeSynergies()');
  const syn = id => act().find(s => s.id === id) || null;
  E('ROSTER_KEYS.forEach(k => { charRec(k).lv = 1; })');
  // the list: 8 combos, 4 Kin, 21 Bonds; the 14 old ids first, in their old order (the Codex keeps one tile each)
  const OLD14 = ['hearth', 'hedgefolk', 'oldoath', 'lampward', 'kindlestar', 'markleap', 'dusk', 'chosen', 'hunting', 'bellsong', 'waxkindle', 'mirelamp', 'oldenemies', 'wayfarers'];
  const layers = E('(() => { const n = { combo: 0, kin: 0, bond: 0 }; for (const s of SYNERGIES) n[s.layer]++; return n; })()');
  assert(E('SYNERGIES.length') === 33 && layers.combo === 8 && layers.kin === 4 && layers.bond === 21 && E('SYNERGIES.slice(0, 14).map(s => s.id).join()') === OLD14.join() &&
    E('SYNERGIES.every(s => s.name && s.needs && s.text && synergyStatus(s.id) && synergyStatus(s.id).text && (s.layer !== "bond" || (s.pair.length === 2 && s.stories.length === 2)))'),
  `33 entries (${layers.combo} combos, ${layers.kin} Kin, ${layers.bond} Bonds), old ids first, each with a need, a text and a status line`);
  assert(E('ROSTER_KEYS.every(k => SYNERGIES.some(s => s.layer === "bond" && s.pair.includes(k)))') && E('["warden", "ranger", "lanternmage", "lightkeeper"].every(c => SYNERGIES.filter(s => s.cls === c).length === 2)'),
    'every companion has a Bond; every class has 2 hero Bonds');
  // Kin: two companions of one circle (Common Cause: +25% with a Common)
  field(['tobin', 'wren']);
  assert(syn('hedgefolk') && syn('hedgefolk').members.length === 2 && syn('hedgefolk').strength === 1.25 && syn('hedgefolk').layer === 'kin', 'Tobin + Wren: Hedgefolk (Kin), 25% stronger with Commons');
  assert(Math.abs(E('synergyMods().gold') - (1 + 0.05 * 1.25)) < 1e-9, `Hedgefolk gold is +5% with 2 (x${E('synergyMods().gold').toFixed(4)}, Common Cause included)`);
  field(['oriel', 'kestrel']);
  assert(syn('dusk') && syn('dusk').strength === 1, 'Oriel + Kestrel: Dusk Company (Rare + Epic: strength 1)');
  field(['maren', 'aldric']);
  assert(syn('oathkin') && E('synUnit("hero").dr') < 1, `Maren + Aldric: The Oath (Kin): the party takes less (hero x${E('synUnit("hero").dr').toFixed(3)})`);
  // Bonds: off until level 1 (Met), then bondX of the level, x Common Cause
  field(['pip', 'oriel']);
  assert(!syn('kindlestar') && /^Not yet\. 30m 0s more together to Met\.$/.test(E('synergyStatus("kindlestar").text')), `a Bond at level 0 is off: "${E('synergyStatus("kindlestar").text')}"`);
  const st = [];
  for (const n of [1, 2, 3, 4, 5]) { E(`bondSet("kindlestar", ${n})`); st.push(syn('kindlestar') ? syn('kindlestar').strength : 0); }
  assert(st.map(x => x.toFixed(4)).join() === [0.5, 0.75, 1, 1.15, 1.3].map(x => (x * 1.25).toFixed(4)).join() && syn('kindlestar').lv === 5 && syn('kindlestar').layer === 'bond',
    `Pip + Oriel: Kindle and Starfall by level: ${st.map(x => x.toFixed(3)).join(', ')} (bondX x Common Cause)`);
  // old named synergies do not get weaker for old saves: level 3 (the seed of an active pair) = the old strength (1 x Common Cause)
  const weak = [];
  for (const id of OLD14.filter(i => E(`SYNERGIES.find(s => s.id === "${i}").layer`) === 'bond')) {
    const d = E(`SYNERGIES.find(s => s.id === "${id}")`), comps = d.pair.filter(k => k !== 'hero');
    if (d.cls) E(`S.party.cls = "${d.cls}"`); else E('S.party.cls = "warden"');
    field(comps.length === 2 ? comps : comps.concat(comps[0] === 'wren' ? 'tobin' : 'wren'));
    E(`bondSet("${id}", 3)`);
    const cc = comps.some(k => E(`ROSTER.${k}.rarity`) === 'common') ? 1.25 : 1, s = syn(id);
    if (!s || Math.abs(s.strength - cc) > 1e-9) weak.push(`${id} ${s ? s.strength : 'off'} vs ${cc}`);
  }
  E('S.party.cls = "warden"');
  assert(!weak.length, 'the 9 old named pairs and Lantern\'s Chosen at level 3 have exactly their old strength (1 x Common Cause)' + (weak.length ? ': ' + weak.join('; ') : ''));
  field(['aldric', 'elowen']);
  assert(E('synergyStatus("chosen").text') === 'needs a Lanternmage hero', `Chosen for a Warden: "${E('synergyStatus("chosen").text')}"`);
  // combos read roles and slots; the hero counts as its class role
  field(['tobin', 'hesketh']);
  E('setSlots({ front: "tobin", mid: "hero", back: "hesketh" })');
  assert(syn('hearth') && syn('hearth').name === 'Lifeline' && syn('hearth').members.join() === 'tobin,hesketh' && Math.abs(E('synUnit("tobin").healIn') - 1.2) < 1e-9 && E('synUnit("tobin").dr') < 1,
    `Lifeline: Tobin in Front, Hesketh in Back (tank healed x${E('synUnit("tobin").healIn')}, takes x${E('synUnit("tobin").dr').toFixed(2)})`);
  E('setSlots({ front: "tobin", mid: "hesketh", back: "hero" })');
  assert(!syn('hearth') && E('synergyStatus("hearth").text') === 'needs a support in Back', `Lifeline off with the support in the Middle: "${E('synergyStatus("hearth").text')}"`);
  E('setSlots({ front: "hero", mid: "tobin", back: "hesketh" })');
  assert(syn('hearth') && syn('hearth').members.join() === 'hero,hesketh' && syn('twowalls') && E('synParty().diveTaunt') === 'tobin', 'a Warden in Front: Lifeline with Hesketh, Two Walls with Tobin (Tobin taunts the first diver)');
  field(['wren', 'pip']);
  E('setSlots({ front: "hero", mid: "wren", back: "pip" })');
  assert(['anvil', 'killbox', 'crossfire'].every(syn) && E('synUnit("pip").ctrl') > 1, 'Warden, Wren, Pip at home: Hammer and Anvil, Kill Box, Crossfire (3 combos at most)');
  // slot jobs: 12 names; a member's job follows its slot; Out of place and jobs are outside the caps
  const jobs = E('(() => { const o = []; for (const r in SLOT_JOBS) for (const s in SLOT_JOBS[r]) o.push(SLOT_JOBS[r][s].name); return o; })()');
  assert(jobs.length === 12 && new Set(jobs).size === 12, `12 slot jobs: ${jobs.join(', ')}`);
  assert(E('slotJob("hero").label') === 'Threat +25%' && E('slotJob("wren").label') === 'Crit +10%' && E('slotJob("pip").label') === 'Splash +10%' && Math.abs(E('synUnit("hero").th') - 1.25 * 1.1) < 1e-9,
    `jobs: ${['hero', 'wren', 'pip'].map(k => E(`slotJob("${k}").name + " (" + slotJob("${k}").label + ")"`)).join(', ')}; the Warden's threat x${E('synUnit("hero").th').toFixed(3)} with Hammer and Anvil`);
  field(['hesketh', 'wren']); E('setSlots({ front: "hesketh", mid: "wren", back: "hero" })');
  assert(Math.abs(E('synUnit("hesketh").hp') - 1.1) < 1e-9 && E('slotJob("hesketh").name') === 'Stand Firm', 'a support in Front: Stand Firm, +10% max HP');
  // the caps (2.5): combos, Kin and Bonds add at most +40% to one member's damage, and at most 20% damage reduction
  field(['tobin', 'wren']); E('setSlots({ front: "tobin", mid: "wren", back: "hero" })');
  // a new cells object: the evaluation is cached per field and cells (a tune change alone does not refresh it)
  const capOf = () => E('(() => { const bust = () => { S.party.cells = Object.assign({}, S.party.cells); }; bust(); const on = charDps("wren"); const a = SYN_TUNE.anvil; SYN_TUNE.anvil = 0; SYN_TUNE.hedgeSpeed = 0; bust(); const off = charDps("wren"); SYN_TUNE.anvil = a; SYN_TUNE.hedgeSpeed = 0.15; bust(); return on / off; })()');
  const r0 = capOf(); E('SYN_TUNE.anvil = 3'); const r1 = capOf(); E('SYN_TUNE.anvil = 0.1');
  assert(r0 > 1 && r0 < 1.4 && Math.abs(r1 - 1.4) < 1e-6, `synCap: Wren's layer bonus x${r0.toFixed(3)} today; with Hammer and Anvil at +300% it stops near x1.4 (x${r1.toFixed(3)})`);
  E('SYN_TUNE.twoWallsDr = 0.9'); field(['tobin', 'aldric']); E('setSlots({ front: "tobin", mid: "aldric", back: "hero" })');
  assert(Math.abs(E('synUnit("hero").dr') - 0.8) < 1e-9, `drCap: Two Walls at 90% still leaves x${E('synUnit("hero").dr')} (20% at most)`);
  E('SYN_TUNE.twoWallsDr = 0.08');
  // removing a member deactivates and removes the effect
  E('ROSTER_KEYS.forEach(k => { charRec(k).lv = 30; })');
  E('bondSet("kindlestar", 3); bondSet("waxkindle", 3)');
  const ev = []; g.fn.on('synergyChange', p => ev.push(p));
  field(['pip', 'oriel']);
  const om = E('synergyMods().char.oriel'), cd = g.fn.compDps();
  assert(syn('kindlestar') && om > 1, `Pip + Oriel active (Oriel x${om.toFixed(3)})`);
  field(['pip', 'morwen']);
  assert(syn('waxkindle') && !syn('kindlestar'), 'Pip + Morwen: Wax and Kindle');
  field(['tobin', 'oriel']);
  assert(!syn('kindlestar') && !syn('waxkindle') && E('synergyMods().char.oriel') < om && ev.some(p => p.lost.includes('waxkindle')), 'benching Pip ends his Bonds and emits synergyChange');
  assert(E('synergyMods().char.tobin') >= 1 && E('synergyMods().char.pip') === undefined, 'benched characters get no multiplier');
  // synergies only add: compDps with effects >= without
  field(['pip', 'oriel']);
  const on = g.fn.compDps(); E('SYN_TUNE.on = 0'); const offD = g.fn.compDps(); E('SYN_TUNE.on = 1');
  assert(Math.abs(on / cd - 1) < 1e-9 && on > offD, `effects add damage (x${(on / offD).toFixed(3)}); switching off restores the base`);
  // no NaN: every character at levels 1 / 25 / 100, in varied line-ups, for every class, every Bond at Sworn
  E('BOND_IDS.forEach(id => bondSet(id, 5))');
  const bad = [];
  for (const cls of ['warden', 'lanternmage', 'ranger', 'lightkeeper']) {
    E(`S.party.cls = ${JSON.stringify(cls)}`);
    for (const n of [1, 25, 100]) {
      E(`ROSTER_KEYS.forEach(k => { charRec(k).lv = ${n}; charRec(k).rank = Math.floor((${n} - 1) / 25); })`);
      const keys = E('ROSTER_KEYS');
      keys.forEach((k, i) => {
        field([k, keys[(i + 5) % 18], keys[(i + 11) % 18]]);
        const v = E(`[charDps(${JSON.stringify(k)}), compDps(), totalDps(), goldMult(), critChance(), mod('compXp'), mod('abilityCd'), synUnit('hero').dr, synUnit(${JSON.stringify(k)}).healIn]`);
        const sup = E(`ROSTER[${JSON.stringify(k)}].role === 'support'`), allSup = E(`S.party.field.every(x => ROSTER[x].role === 'support')`);
        if (!v.every((x, j) => Number.isFinite(x) && (x > 0 || (j === 0 && sup) || (j === 1 && allSup)))) bad.push(`${cls} ${k} L${n}: ${v.join(',')}`);
      });
    }
  }
  assert(!bad.length, 'charDps finite for all 18 at levels 1/25/100, every class, every Bond at Sworn' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  // kit data for the UI; the L25 milestone is Old Friend
  const kit = E(`ROSTER_KEYS.map(k => { const t = charTraits(k); return [k, t.length, t.some(x => x.kind === 'speciality'), t.some(x => x.kind === 'bond' && x.name === 'Old Friend' && /Bonds grow 50% faster/.test(x.text)), t.every(x => x.text && x.name && typeof x.active === 'boolean' && typeof x.stageC === 'boolean')]; })`);
  assert(kit.every(([, n, sp, bd, okT]) => n >= 4 && sp && bd && okT), 'every character has a speciality, Old Friend ("Bonds grow 50% faster") and well-formed traits');
  assert(E("['kestrel','maren','aldric','thessaly','anselm'].every(k => charTraits(k).some(t => t.kind === 'trait')) && ['elowen','caedmon','corvin'].every(k => charTraits(k).some(t => t.kind === 'aura'))"), 'Rares have a trait, Legendaries an aura');
  E('S.party.cls = "warden"');
  field(['pip', 'tobin']);
  assert(E('synergyStatus("markleap").text') === 'needs Wren and Kestrel' && E('synergyStatus("dusk").text') === 'needs 2 more Dusk Company', `missing text (${E('synergyStatus("markleap").text')} / ${E('synergyStatus("dusk").text')})`);
  field(['wren', 'kestrel']); E('bondSet("markleap", 3)');
  assert(E('synergyStatus("markleap").text') === 'Active. Trusted: 125% strength.', `active text (${E('synergyStatus("markleap").text')})`);
  assert(!g.errors.length, 'no synergy handler errors' + (g.errors.length ? ': ' + g.errors[0] : ''));
} catch (e) { fail('synergy crashed: ' + (e.stack || e)); }

// ---- 6. Next Up goals (55-goals.js) ----
console.log('goals');
try {
  // built-in goals evaluate on every fixture without errors
  for (const f of ['save-v2.json', 'save-mid-v2.json', 'save-v2-late.json']) {
    const raw = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
    const g = loadCore({ storage: memoryStorage({ [KEY]: raw }) });
    for (let i = 0; i < 300; i++) g.fn.tick(0.1);
    const list = g.eval('topGoals(3)');
    const bad = g.eval('GOALS.filter(x => { try { const p = x.pct(); return p != null && !isFinite(p); } catch (e) { return true; } }).map(x => x.id)');
    assert(list.length >= 1 && list.length <= 3 && list.every(x => x.label && x.pct > 0 && x.pct <= 1) && !bad.length && !g.errors.length,
      `${f}: topGoals -> ${list.map(x => x.id + ' ' + Math.round(x.pct * 100) + '%').join(', ')}` + (bad.length ? ' bad: ' + bad : ''));
  }
  const g = loadCore();
  g.eval('GOALS.length = 0; globalThis.gv = {}');
  const add = (id, sys, prio) => g.eval(`registerGoal({ id: '${id}', sys: '${sys}', prio: ${prio || 0}, label: () => '${id}', pct: () => gv['${id}'] })`);
  const ids = (opts) => g.eval(`topGoals(3, ${opts || '{ sticky: false }'}).map(x => x.id).join()`);
  add('a1', 'a'); add('a2', 'a'); add('a3', 'a'); add('b1', 'b'); add('c1', 'c'); add('r1', 'r', 1); add('r2', 'r');
  g.eval("Object.assign(gv, { a1: 0.9, a2: 0.85, a3: 0.8, b1: 0.3, c1: 0.2, r1: 0, r2: null })");
  assert(ids() === 'a1,b1,c1', 'diversity: one per system first (a1,b1,c1): ' + ids());
  g.eval('gv.c1 = 0');
  assert(ids() === 'a1,a2,b1', 'a second goal from the same system fills a gap: ' + ids());
  g.eval('gv.r2 = 1.2; gv.r1 = 1');
  assert(ids() === 'r1,a1,b1', 'ready goals first, then by pct; prio breaks ready ties: ' + ids());
  const rd = g.eval('topGoals(3, { sticky: false })[0]');
  assert(rd.ready && rd.pct === 1, 'ready goal pct clamps to 1');
  g.eval('gv.r1 = 0; gv.r2 = 0; gv.a2 = 0; gv.a3 = 0; gv.a1 = 0.5; gv.b1 = 0.4; gv.c1 = 0.3');
  let now = 1e6;
  const sticky = () => { now += 1000; return ids(`{ now: ${now} }`); };
  { const s0 = sticky(); assert(s0 === 'a1,b1,c1', 'sticky baseline ' + s0); }
  g.eval('gv.b1 = 0.52');
  assert(sticky() === 'a1,b1,c1', 'hysteresis: a small lead does not reorder');
  g.eval('gv.b1 = 0.7');
  assert(sticky() === 'b1,a1,c1', 'a clear lead reorders');
  g.eval("registerGoal({ id: 'd1', sys: 'd', label: 'd1', pct: () => 0.33 })");
  assert(sticky() === 'b1,a1,c1', 'hysteresis: a newcomer barely ahead does not replace a shown goal');
  g.eval("registerGoal({ id: 'd1', sys: 'd', label: 'd1', pct: () => 0.45 })");
  assert(sticky() === 'b1,a1,d1', 'a newcomer clearly ahead replaces the weakest (registerGoal replaces by id)');
  g.eval('gv.a1 = 0.99');
  const cached = ids(`{ now: ${now + 100} }`);
  assert(cached === 'b1,a1,d1', 'cached within 450 ms');
  const off = g.eval("registerGoal({ id: 'x', sys: 'x', label: 'x', pct: () => { throw new Error('boom'); } })");
  assert(ids() === 'a1,b1,d1', 'a throwing goal is skipped');
  off();
  assert(g.eval("GOALS.every(x => x.id !== 'x')"), 'remove fn unregisters');
} catch (e) { fail('goals crashed: ' + (e.stack || e)); }

// ---- 6. unlock avenues (56c-unlocks.js, B7) ----
console.log('unlocks');
try {
  // A started game at a given zone; Date.now is pinned so setDay(d) picks the device day.
  const game = (zone, seed = 7) => {
    const g = loadCore({ seed });
    g.eval('chooseClass("warden"); Date.__t = Date.now(); Date.now = () => Date.__t');
    g.eval(`S.maxZone = ${zone}; S.zone = ${zone}`);
    const recs = {}; g.fn.on('recruit', ({ id }) => { recs[id] = (recs[id] || 0) + 1; });
    return { g, E: s => g.eval(s), recs, setDay: d => g.eval(`Date.__t = new Date(2026, 0, 1 + ${d}, 12).getTime()`), tick: n => { for (let i = 0; i < n; i++) g.fn.tick(0.1); } };
  };
  const E0 = s => loadCore({ seed: 1 }).eval(s);
  const bossKill = (E, z) => E(`emit('kill', { mob: { key: 'x0', boss: true }, zone: ${z}, gold: 1, ess: 0, tier: 1 })`);
  // Renown: +1 per claimed bounty (elite 3); Aldric at his Renown then gold; Vesper free at hers;
  // Caedmon at his Renown + the zone 35 boss, wyrms count 5. Values read from UNLOCK_TUNE (BAL1 retuned them).
  {
    const { E, recs, tick } = game(10);
    const T = E('UNLOCK_TUNE'), ag = E('recruitCost("aldric") || { gold: -1 }').gold;
    for (let i = 0; i < T.aldric.renown - 1; i++) E("emit('bountyDone', { k: 'kill' })");
    E('S.gold = 1e30');
    assert(E('renown()') === T.aldric.renown - 1 && !E('canRecruit("aldric")'), `Renown ${T.aldric.renown - 1}: Aldric not yet`);
    E("emit('bountyDone', { k: 'kill', elite: true })");
    const g0 = E('S.gold'), gold = E('recruitCost("aldric").gold');
    assert(E('renown()') === T.aldric.renown + 2 && E('canRecruit("aldric") && recruit("aldric")') && E('S.gold') === g0 - gold && gold > 0 && !E('recruit("aldric")') && recs.aldric === 1 && E('recruitHow("aldric")').includes(E(`fmt(${gold})`)), `Renown ${T.aldric.renown} + ${E(`fmt(${gold})`)} gold recruits Aldric once (elite bounty = 3; the how line shows the price)`);
    E(`addRenown(${T.vesperRenown - E('renown()')}, "test")`); tick(11);
    assert(E('isRecruited("vesper") && charRec("vesper").src === "renown"') && recs.vesper === 1, `Vesper joins free at Renown ${T.vesperRenown}`);
    const need = T.caedmon.renown - E('renown()'), wy = Math.ceil(need / T.wyrmRenown);
    E(`S.maxZone = ${T.caedmon.zone + 1}; S.wyrms = ${wy - 1}`); tick(11);
    assert(!E('isRecruited("caedmon")') && E('caedmonRenown()') < T.caedmon.renown, `Caedmon waits below Renown ${T.caedmon.renown} (${E('caedmonRenown()')})`);
    E(`S.wyrms = ${wy}`); tick(11);
    assert(E('isRecruited("caedmon")') && recs.caedmon === 1, `Caedmon joins at Renown ${T.caedmon.renown} with the zone ${T.caedmon.zone} boss beaten`);
  }
  // Old save backfill: Renown from the bounties already claimed, once.
  {
    const old = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'save-v2.json'), 'utf8'));
    old.bounties = { slots: [], claimed: 12, seq: 12 };
    const g = loadCore({ storage: memoryStorage({ [KEY]: JSON.stringify(old) }) });
    assert(g.eval('renown() === 12 && S.party.unlock.rb === true'), 'old save: 12 claimed bounties backfill 12 Renown');
    g.eval("emit('bountyDone', { k: 'kill' })"); g.fn.save();
    const g2 = loadCore({ storage: memoryStorage({ [KEY]: g.storage.get(KEY) }) });
    assert(g2.eval('renown()') === 13, 'backfill runs once (13 after reload, not 25)');
    const cmp = JSON.parse(JSON.stringify(old)); delete cmp.bounties.slots; delete cmp.bounties.seq; delete cmp.last; if (cmp.party) { delete cmp.party.field; delete cmp.party.cells; }
    const d = subsetDiff(cmp, JSON.parse(JSON.stringify(g.eval('S'))));
    assert(!d, 'old save fields kept with the unlock state added' + (d ? ': ' + d : ''));
  }
  // Tokens: pity guarantees (worst case 12 / 10), right bosses only.
  {
    const { E, recs } = game(40);
    let n = 0; while (!E('isRecruited("grenna")') && n < 50) { n++; E('unlockTokenRoll("grenna", 0.999999)'); }
    let m = 0; while (!E('isRecruited("isolde")') && m < 50) { m++; E('unlockTokenRoll("isolde", 0.999999)'); }
    assert(n === 12 && m === 10 && recs.grenna === 1 && recs.isolde === 1, `T17 worst-case pity: Grenna ${n} (want 12), Isolde ${m} (want 10)`);
    assert(E('unlockTokenRoll("grenna", 0) === null'), 'no rolls once won');
  }
  {
    const { E } = game(60);
    const gz = E('UNLOCK_TUNE.tokens.grenna.from'), iz = E('UNLOCK_TUNE.tokens.isolde.from');
    const quarry = E(`(() => { for (let z = Math.max(${gz}, ${iz}); ; z++) if (zoneType(z) === 5) return z; })()`);
    bossKill(E, gz - 7); bossKill(E, iz - 1);   // a Quarry Ruins boss below the token zone, and the zone below the Dusk Contract
    assert(E('(S.party.unlock.tokens.grenna || { miss: 0 }).miss') === 0 && E('(S.party.unlock.tokens.isolde || { miss: 0 }).miss') === 0, 'no token roll below the token zones');
    E('Math.random = () => 0.999999'); bossKill(E, quarry); bossKill(E, quarry); bossKill(E, quarry + 1);
    assert(E('S.party.unlock.tokens.grenna.miss') === 2 && E('S.party.unlock.tokens.isolde.miss') === 3, 'Quarry Ruins bosses roll the token (repeat kills count); every boss from the zone rolls the Dusk Contract');
    assert(Math.abs(E('tokenChance("grenna")') - 0.24) < 1e-9 && E('addTokenProgress("isolde", 100)') === 1, 'pity shown as the next chance; addTokenProgress caps at a sure roll');
  }
  // Tavern visitor: rotation by device day, hire once, trader for recruited visitors.
  {
    const { E, setDay, recs } = game(20);
    const rot = E('UNLOCK_TUNE.rotation'), week = [280, 281, 282, 283, 284, 285, 286];
    const ids = week.map(d => { setDay(d); return E('visitorToday().id'); });
    assert(ids.join() === week.map(d => rot[d % 7]).join() && E('unlockDay()') === 286, `rotation follows the device day (${ids.join(',')})`);
    const aday = week.find(d => rot[d % 7] === 'anselm');
    const av = E('UNLOCK_TUNE.visitors.anselm');
    E(`S.maxZone = Math.max(S.maxZone, ${av.from}, UNLOCK_TUNE.visitorFrom)`);
    setDay(aday); E(`S.gold = 1e30; S.mats.ess = [0, 0, 0, 0, 0]; S.mats.ess[${av.ess[0] - 1}] = ${av.ess[1] + 10}`);
    const ac = E('recruitCost("anselm")');
    assert(E('visitorToday().kind === "hire" && canRecruit("anselm") && recruit("anselm")') && E('S.gold') === 1e30 - ac.gold && E(`S.mats.ess[${av.ess[0] - 1}]`) === 10 && recs.anselm === 1, `Anselm hired on his day for ${E(`fmt(${ac.gold})`)} gold + ${av.ess[1]} tier-${av.ess[0]} Essence`);
    const vt = E('visitorToday()');
    assert(E('S.party.unlock.visitor.hired') === true && vt.kind === 'trade' && !vt.done, 'a hired visitor is replaced by a trader');
    const t = E('zoneTier(S.maxZone)'), e0 = E(`S.mats.ess[${t - 1}]`);
    assert(E('buyTrade()') && E(`S.mats.ess[${t - 1}]`) === e0 + 10 && !E('buyTrade()'), 'the trader sells 10 essence of the top tier, once a day');
    setDay(aday + 1); E('visitorToday()');
    assert(E('S.party.unlock.visitor.day') === aday + 1 && E('S.party.unlock.visitor.hired') === false && E('S.party.unlock.visitor.bought') === false, 'a new device day resets the visitor');
    const kday = week.find(d => rot[d % 7] === 'kestrel');
    const kv = E('UNLOCK_TUNE.visitors.kestrel'), kz = E('ROSTER.kestrel.route.zone');
    setDay(kday); E(`S.maxZone = ${Math.max(kv.from, E('UNLOCK_TUNE.visitorFrom'))}; S.gold = 1e30`);
    const kc = E('recruitCost("kestrel").gold');
    assert(kv.from < kz && kc === E(`foesGold(${kv.from}, ${kv.kills})`) && E('recruit("kestrel")') && E('S.gold') === 1e30 - kc, `Kestrel hires early at the Tavern (${E(`fmt(${kc})`)} gold) before zone ${kz}`);
    setDay(aday + 7);
    assert(E('visitorToday().kind') === 'trade' && E('daysUntilVisit("anselm")') === 0, 'a recruited visitor leaves a trader on their day');
    E('S.maxZone = UNLOCK_TUNE.visitorFrom - 1');
    assert(E('visitorToday().kind') === 'closed', `no visitors before zone ${E('UNLOCK_TUNE.visitorFrom')}`);
  }
  // Quests: hand-in consumes the items; Morwen's condition.
  {
    const { E, recs, tick } = game(Math.max(E0('UNLOCK_TUNE.quests.bram.from'), E0('UNLOCK_TUNE.quests.maren.from')));
    const bw = E('UNLOCK_TUNE.quests.bram.wood');   // [tier, n]
    E(`S.mats.wood = [0, 0, 0, 0, 0]; S.mats.wood[${bw[0] - 1}] = ${bw[1] - 20}; S.mats.wood[${bw[0]}] = 30`);
    assert(E('canRecruit("bram") && recruit("bram")') && E(`S.mats.wood[${bw[0] - 1}]`) === 0 && E(`S.mats.wood[${bw[0]}]`) === 10 && recs.bram === 1, `Bram: ${bw[1]} tier-${bw[0]} logs handed in (better logs count, the named tier first)`);
    const [mt, mn] = E('UNLOCK_TUNE.quests.maren.ess');
    E(`S.mats.ess = [0, 0, 0, 0, 0]; S.mats.ess[${mt - 1}] = ${mn - 1}`);
    assert(!E('canRecruit("maren")') && E('leads().some(l => l.id === "maren" && l.action === null && l.pct < 1)'), `Maren waits for ${mn} tier-${mt} Essence`);
    E(`S.mats.ess[${mt - 1}]++`);
    const lm = E('leads().find(l => l.id === "maren")');
    assert(lm && lm.action && lm.action.label === 'Hand in' && E('leads().find(l => l.id === "maren").action.fn()') && E(`S.mats.ess[${mt - 1}]`) === 0 && recs.maren === 1, 'Maren: the Leads "Hand in" consumes the essence');
    E('S.maxZone = UNLOCK_TUNE.quests.elowen.from'); const eg = E('recruitCost("elowen").gold'), ee = E('UNLOCK_TUNE.quests.elowen.ess');
    E(`S.gold = ${eg} + 5e7; S.mats.ess = [0, 0, 0, 0, 0]; S.mats.ess[${ee[0] - 1}] = ${ee[1] + 5}`);
    assert(eg > 0 && E('recruit("elowen")') && E('S.gold') === 5e7 && E(`S.mats.ess[${ee[0] - 1}]`) === 5 && E('recruitHow("elowen")').includes(E(`fmt(${eg})`)), `Elowen: ${E(`fmt(${eg})`)} gold + ${ee[1]} tier-${ee[0]} Essence handed in at zone ${E('UNLOCK_TUNE.quests.elowen.from')}`);
    const mz = E('UNLOCK_TUNE.quests.morwen.zone');
    E(`S.maxZone = ${mz + 1}; unlockChar("hesketh", "test", true); S.party.autoField = false; setField(["hesketh", "bram"])`);   // F3: the planner would re-plan on the boss kills
    bossKill(E, mz); tick(11);
    assert(!E('isRecruited("morwen")'), 'Morwen: no join with a support fielded');
    E('setField(["bram"])'); bossKill(E, mz - 7); tick(11);
    assert(!E('isRecruited("morwen")'), 'Morwen: only her Fungal Deep boss counts');
    bossKill(E, mz); bossKill(E, mz); tick(11);
    assert(E('isRecruited("morwen")') && recs.morwen === 1, `Morwen joins once after the zone ${mz} boss with no support`);
  }
  // Bestiary, Kingslayer, Star Chart, Leads.
  {
    const { E, recs, tick } = game(30);
    E('S.mastery.types.wraith = 999'); tick(11);
    assert(!E('isRecruited("thessaly")'), 'Thessaly waits for the full Marsh Wraith page');
    E('S.mastery.types.wraith = 1000'); tick(11);
    assert(E('isRecruited("thessaly")') && recs.thessaly === 1, 'Thessaly joins at the Marsh Wraith tier 3 page');
    E('TYPES.forEach(t => S.mastery.types[t.key] = 100); S.stats.bosses = 120'); tick(11);
    assert(!E('isRecruited("corvin")'), 'Corvin waits for 150 boss kills');
    E("emit('kingslayerCredit', { n: 80 })"); tick(11);
    assert(E('S.party.unlock.ks') === 50 && E('isRecruited("corvin")') && recs.corvin === 1, 'Kingslayer: expedition credit (capped at 50) completes Corvin');
    assert(!E('canRecruit("oriel")') && /Star Chart/.test(E('recruitHow("oriel")')), 'Oriel waits for a Star Chart');
    E('grantStarChart()');
    assert(E('isRecruited("oriel") && charRec("oriel").src === "craft"') && recs.oriel === 1, 'grantStarChart() brings Oriel');
    const L = E('leads()');
    assert(Array.isArray(L) && L.length > 0 && L.every(l => l.id && l.name && typeof l.how === 'string' && l.pct >= 0 && l.pct <= 1 && (l.action === null || (l.action.label && typeof l.action.fn === 'function'))), `leads() shape (${L.map(l => l.id).join(',')})`);
    assert(E('ROSTER_KEYS.every(k => isRecruited(k) || recruitHow(k).length > 0)'), 'every locked character has a how line');
  }
  // Fixtures: unlock state merged, migrated Oriel kept, no errors after a minute of play.
  for (const f of ['save-v2.json', 'save-v2-late.json', 'save-a-v1.json']) {
    const raw = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
    const g = loadCore({ seed: 5, storage: memoryStorage({ [KEY]: raw }) });
    const u = g.eval('S.party.unlock');
    assert(u && typeof u.renown === 'number' && u.visitor && 'bought' in u.visitor && 'starChart' in u, `${f}: unlock state merged`);
    const hadOriel = (JSON.parse(raw).comp || [])[5] > 0;
    for (let i = 0; i < 600; i++) g.fn.tick(0.1);
    assert((!hadOriel || g.eval('isRecruited("oriel")')) && !g.errors.length, `${f}: plays a minute with the unlock avenues` + (g.errors.length ? ': ' + g.errors[0] : ''));
  }
} catch (e) { fail('unlocks crashed: ' + (e.stack || e)); }

// ---- 6. the Almanac (55-almanac.js) ----
console.log('almanac');
try {
  const at = (day, h = 12) => new Date(2026, 0, 1 + day, h, 0, 0).getTime();
  const secs = (g, n) => { for (let i = 0; i < n * 10; i++) g.fn.tick(0.1); };
  const g = loadCore({ seed: 7 });
  const E = s => g.eval(s);
  const gB = loadCore({ seed: 99 });
  const days = [...Array(700).keys()];
  assert(days.every(d => E(`almanac.omenFor(${d}).id`) === gB.eval(`almanac.omenFor(${d}).id`)), 'Omen pick is deterministic per day (two games agree over 700 days)');
  E(`Date.now = () => ${at(271, 9)}`); const o1 = E('almanac.today().id'); E(`Date.now = () => ${at(271, 21)}`);
  assert(E('almanac.today().id') === o1, `same Omen all day (${o1})`);
  const counts = {}; let same = 0;
  for (let d = 0; d < 350; d++) { const id = E(`almanac.scheduled(${d}).id`); counts[id] = (counts[id] || 0) + 1; }
  for (let d = 1; d < 700; d++) if (E(`almanac.scheduled(${d}).cat === almanac.scheduled(${d - 1}).cat`)) same++;
  assert(Object.keys(counts).length === 35 && Object.values(counts).every(n => n === 10), 'A1: each of 35 Omens scheduled 10 times in 350 days');
  assert(same === 0, `A1: no category twice in a row over 700 days, cycle edges included (${same} repeats)`);
  assert(days.every(d => E(`almanac.usable(almanac.omenFor(${d}))`)), 'daily pick never plays an Omen whose system is missing');
  const upside = E(`OMENS.flatMap(o => [...Object.entries(o.mod || {}).filter(([k, v]) => almanac.lowerBetter.has(k) ? !(v > 0 && v <= 1) : !(v >= 1)), ...Object.entries(o.bonus || {}).filter(([, v]) => !(v >= 0))].map(([k]) => o.id + ':' + k))`);
  assert(!upside.length, 'every Omen is pure upside; only Dares carry a twist' + (upside.length ? ': ' + upside.join(', ') : ''));
  const twist = ['foeHp', 'bossHp', 'nonCrit', 'bossTime', 'champHp', 'oilDrain'];
  assert(E(`OMENS.every(o => !Object.keys(Object.assign({}, o.mod, o.bonus)).some(k => ${JSON.stringify(twist)}.includes(k)))`), 'twist keys appear only in Dares');
  // Dares: take, check, drop
  E(`Date.now = () => ${at(271, 12)}`);
  E('almanac.force("none")'); const noOmen = E('mod("gold")');
  E('almanac.force("goldRain")');
  const gm = () => E('mod("gold")') / noOmen;
  assert(Math.abs(gm() - 1.3) < 1e-9 && E('mod("foeHp")') === 1, 'Gold Rain: +30% gold, foes unchanged');
  assert(E('almanac.setDare(true)') && E('almanac.dareOn()') && Math.abs(gm() - 1.8) < 1e-9 && E('mod("foeHp")') === 1.3, 'Dare on: gold +80% and foes +30% HP together');
  assert(E('almanac.setDare(false)') && !E('almanac.dareOn()') && Math.abs(gm() - 1.3) < 1e-9 && E('mod("foeHp")') === 1, 'Dare dropped: twist and reward both off');
  E('almanac.setDare(true)'); E(`Date.now = () => ${at(272, 12)}`);
  assert(!E('almanac.dareOn()'), 'a Dare ends at midnight');
  E('almanac.force("longNight")');
  assert(!E('almanac.setDare(true)'), 'Omens without a Dare refuse one');
  E('almanac.force(undefined)');
  // away uses the Omen of the day you left, never a Dare
  const leftDay = days.find(d => E(`almanac.omenFor(${d}).id`) === 'longNight' && E(`almanac.omenFor(${d} + 1).id`) !== 'longNight');
  E(`Date.now = () => ${at(leftDay + 1, 10)}; S.last = ${at(leftDay, 22)}; S.activity = 'fight'`);
  let seenAway = null; g.fn.on('away', () => { seenAway = E('almanac.active().id + ":" + almanac.dareOn()'); });
  const r = g.fn.awayGains(3600);
  assert(seenAway === 'longNight:false' && r.omen === 'longNight' && r.omenHelped, `away time plays the Omen of the day you left (${seenAway})`);
  assert(E('almanac.active().id') === E('almanac.today().id'), "after away, today's Omen is back");
  const awayGold = id => { const h = loadCore({ seed: 5 }); h.eval(`S.maxZone = 12; S.zone = 12; almanac.force(${JSON.stringify(id)})`); const g0 = h.eval('S.gold'); h.fn.awayGains(8 * 3600); return h.eval('S.gold') - g0; };
  const ratio = awayGold('longNight') / awayGold('none');
  assert(Math.abs(ratio - 1.25) < 1e-9, `A7: 8h away on Long Night is exactly x1.25 (${ratio.toFixed(6)})`);
  // weekly board: draw, count, swap, auto-claim at week's end
  const w = loadCore({ seed: 11 }), W = s => w.eval(s);
  W(`Date.now = () => ${at(271)}; S.last = Date.now()`); secs(w, 1);
  const wk = W('deviceWeek(Date.now())');
  assert(W('S.almanac.week') === wk && W('S.almanac.goals.length') === 5 && W('S.almanac.goals.filter(g => g.tier === "easy").length') === 3, 'board: 3 Easy + 2 Steady for this week');
  assert(W(`JSON.stringify(almanac.drawBoard(${wk}))`) === W(`JSON.stringify(almanac.drawBoard(${wk}))`) && W('new Set(S.almanac.goals.map(g => WEEKLY_GOALS[g.k].kind)).size') === 5, 'board draw is deterministic per week, no two of a kind');
  assert(W('S.almanac.goals.every(g => almanac.goalOk(g.k))'), 'board only draws goals this save can progress');
  const k0 = W('S.almanac.goals[1].k');
  assert(W('almanac.swap(1)') && W('S.almanac.goals[1].k') !== k0 && W('S.almanac.swaps') === 1, 'swap replaces an unfinished goal and uses one of 2 swaps');
  W('S.almanac.goals = [{ k: "wBoss", tier: "easy", need: 2, have: 0, done: false, claimed: false }, { k: "wKill", tier: "easy", need: 5, have: 0, done: false, claimed: false }]');
  for (let i = 0; i < 2; i++) W("emit('kill', { mob: { key: 'slime0', boss: true }, zone: 1, gold: 1, ess: 0, tier: 1 })");
  assert(W('S.almanac.goals[0].done && S.almanac.goals[1].have === 2'), 'live kills count toward weekly goals');
  const matSum = () => W('Object.values(S.mats).flat().reduce((a, b) => a + b)');
  const m0 = matSum();
  W(`Date.now = () => ${at(271 + 7)}`); secs(w, 1.1);
  assert(W('S.almanac.week') === wk + 1 && W('S.almanac.auto && S.almanac.auto.week') === wk && W('S.almanac.auto.n') === 1 && W('S.almanac.swaps') === 2, 'week rollover claims finished goals for you and draws a new board');
  assert(matSum() - m0 === 180, `auto-claimed Easy goal paid its crate (3 x 60 before the Deepwell; got ${matSum() - m0})`);
  assert(W('S.almanac.goals.every(g => !g.claimed && g.have === 0)'), 'new week starts at 0');
  // old saves
  const old = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'save-v2.json'), 'utf8');
  const go = loadCore({ storage: memoryStorage({ [KEY]: old }) });
  assert(go.eval('S.almanac && S.almanac.v === 1 && S.almanac.week === -1 && S.almanac.swaps === 2 && S.almanac.dare.on === false && typeof S.almanac.seen === "object"'), 'old save gets Almanac defaults');
  const part = JSON.parse(old); part.almanac = { week: 3, goals: [] };
  const gp = loadCore({ storage: memoryStorage({ [KEY]: JSON.stringify(part) }) });
  assert(gp.eval('S.almanac.week === 3 && S.almanac.dare.day === -1 && S.almanac.stamps === 0'), 'partial Almanac state merges without loss');
  for (const x of [g, w, go]) assert(!x.errors.length, 'no almanac handler errors' + (x.errors.length ? ': ' + x.errors[0] : ''));
} catch (e) { fail('almanac crashed: ' + (e.stack || e)); }

// ---- 7. crafting actions (55-crafting.js, K6) ----
console.log('crafting');
try {
  const g = loadCore({ seed: 5 }), E = s => g.eval(s);
  E("almanac.force('none')");   // the calendar Omen (e.g. Cheap Reforge) would change the prices below
  E('globalThis.__crafted = []; on("crafted", p => { globalThis.__crafted.push(p.kind + ":" + p.t); })');
  E('chooseClass("lanternmage")');
  const mats = () => E('JSON.stringify(S.mats)');
  // gates and player-facing reasons
  const why0 = E('canCraft("robe", 1).why');
  assert(why0 === '7 more Flax Fibre, 1 more Quartz Shard, 1 more Sage Sprig, 2 more Dim Essence', `canCraft names what is missing (${why0})`);
  const RQ = t => E(`CRAFT_STATION_REQ[${t - 1}]`);   // GP1: the gates are SKILL_TUNE.stationReq
  assert(E('canCraft("robe", 2).why') === `Needs Tailoring ${RQ(2)}` && E('craftItem("robe", 2)') === null, `station tier gate: Needs Tailoring ${RQ(2)}`);
  assert(E('canCraft("charm", 3).why') === `Needs Enchanting ${RQ(3)}`, "Charm gates on the Enchanter's Table...");
  E(`S.skills.smith.lv = ${RQ(3)}`);
  assert(E('canCraft("charm", 3).why') !== `Needs Enchanting ${RQ(3)}`, '...or Smithing, so old saves keep the recipe (camp N4)');
  E('S.skills.smith.lv = 1');
  // pays exactly, rolls affixes, station XP, events
  E('for (const k of CRAFT_FAMILIES) S.mats[k] = [200, 200, 200, 200, 200]');
  const m0 = JSON.parse(mats()), n0 = E('S.items.length');
  const it = E('craftItem("robe", 1)');
  const m1 = JSON.parse(mats());
  const paid = Object.fromEntries(Object.keys(m0).map(k => [k, m0[k][0] - m1[k][0]]).filter(([, n]) => n));
  assert(it && it.slot === 'robe' && Array.isArray(it.a) && it.a.length >= 1 && E('S.items.length') === n0 + 1, `craftItem makes a Robe with ${it && it.a.length} affix line(s)`);
  assert(JSON.stringify(paid) === JSON.stringify({ ess: 2, crystal: 1, fibre: 7, herb: 1 }), `craft pays the recipe exactly (${JSON.stringify(paid)})`);
  assert(E('(() => { let x = S.skills.loom.xp; for (let l = 1; l < S.skills.loom.lv; l++) x += skillNeed(l, "loom"); return x; })()') === 20 && E('globalThis.__crafted.join()') === 'robe:1', 'Tailoring XP 20 (no catch-up when level) and a crafted event');
  E('S.skills.smith.lv = 10; S.skills.loom.lv = 1; S.skills.loom.xp = 0'); E('craftItem("mitre", 1)');
  const lx = E('(() => { let lv = 1, xp = 40; while (xp >= skillNeed(lv, "loom")) { xp -= skillNeed(lv, "loom"); lv++; } return [lv, xp]; })()');
  assert(E('craftXpFor("loom", 20)') === 40 && E('S.skills.loom.lv') === lx[0] && E('S.skills.loom.xp') === lx[1], 'catch-up: x2 XP while below Smithing');
  const tk = E('craftItem("trinket", 1, { role: "caster" })');
  assert(tk && tk.ro === 'caster' && tk.a.every(([id]) => ['spell', 'area', 'control', 'hp'].includes(id)), 'Trinket rolls from the chosen role');
  assert(E('!!forgeItem("staff", 1)') && E('S.items[S.items.length - 1].slot') === 'staff', 'forgeItem delegates new kinds to craftItem');
  assert(E('forgeItem("weapon", 1) === null && craftItem("helm", 1) === null') && /no longer made/.test(E('canCraft("weapon", 1).why')), 'the legacy Sword and Helm are no longer made');
  const sx = E('S.skills.smith.xp'); E('forgeItem("pick", 1)');
  assert(E('S.skills.smith.xp') > sx, 'forgeItem keeps the old Pickaxe path (Smithing XP)');
  // Masterwork
  assert(E('canCraft("robe", 1, { mw: 0 }).why') === 'Needs 1 Moss Heart', 'Masterwork needs its Trophy');
  E('S.craft.troph[0] = 1');
  const mw = E('craftItem("robe", 1, { mw: 0 })');
  assert(mw && mw.mw === 0 && E('S.craft.troph[0]') === 0, 'Masterwork craft spends the Trophy and marks the item');
  // bag rule
  E('while (bagCount() < CRAFT_BAG_MAX) S.items.push(newItem("weapon", 1, "common"))');
  const mb = mats();
  assert(/bag is full/.test(E('canCraft("robe", 1).why')) && E('craftItem("robe", 1)') === null && mats() === mb, 'full bag: no craft, nothing paid');
  // salvage is generic
  const robe = E('S.items.find(i => i.slot === "robe").id');
  const f0 = E('S.mats.fibre[0]');
  assert(E(`salvageItem(${robe})`) && E('S.mats.fibre[0]') - f0 === Math.floor(7 * 0.4), 'salvage returns 40% of a Robe');
  E('S.items = S.items.filter(i => i.slot !== "weapon")');
  // Reforge
  const staff = E('S.items.find(i => i.slot === "staff")');
  E('S.gold = 1e6; S.skills.ench.lv = 1');
  const rc = E(`canReforge(${staff.id}, 0)`);
  assert(rc.ok && rc.cost.mats.ess === 3 && rc.cost.gold === 150, `Reforge cost: 3 essence and 150 gold (${JSON.stringify(rc.cost)})`);
  const e0 = E('S.mats.ess[0]');
  assert(E(`reforgeItem(${staff.id}, 0)`) && E(`itemById(${staff.id}).rf`) === 1 && E('S.mats.ess[0]') === e0 - 3 && E('S.gold') === 1e6 - 150, 'reforgeItem pays and counts');
  const a = E(`itemById(${staff.id}).a`);
  assert(new Set(a.map(l => l[0])).size === a.length, 'a reforged line never duplicates a stat');
  assert(E(`canReforge(${staff.id}, 0).cost.gold`) === 225, 'the next Reforge costs more');
  E('S.items.push(newItem("staff", 2, "rare"))');
  assert(E('canReforge(S.items[S.items.length - 1].id, 0).why') === `Needs Enchanting ${RQ(2)}`, 'Reforge needs Enchanting for the tier');
  // Transmute
  E('S.skills.ench.lv = 1; S.mats.ore = [8, 0, 0, 0, 0]');
  assert(E('canTransmute("ore", 1, "ore").why') === `Needs Enchanting ${RQ(2)}` && !E('transmute("ore", 1, 2)'), 'Transmute up needs Enchanting for the new tier');
  E(`S.skills.ench.lv = ${RQ(2)}`);
  assert(E('transmute("ore", 1, "ore")') && E('JSON.stringify(S.mats.ore)') === '[4,1,0,0,0]', 'Transmute up: 4 Copper -> 1 Iron');
  assert(E('transmute("ore", 2, "down")') && E('JSON.stringify(S.mats.ore)') === '[6,0,0,0,0]', 'Transmute down: 1 Iron -> 2 Copper');
  assert(!E('transmute("ore", 1, "wood")') && !E('transmute("hide", 5, 6)') && E('JSON.stringify(S.mats.ore)') === '[6,0,0,0,0]', 'Transmute never crosses families or goes past tier 5');
  // Upgrades: trophies gate +8..+10
  const up = E('S.items.find(i => i.slot === "staff").id');
  E(`itemById(${up}).plus = 7; for (const k of CRAFT_FAMILIES) S.mats[k] = [500, 500, 500, 500, 500]; S.gold = 1e9; S.craft.troph = [0, 0, 0, 0, 0, 0, 0]`);
  assert(E(`canUpgrade(${up}).why`) === 'Needs 1 Trophy of any kind' && !E(`upgradeItem(${up})`), '+8 needs a Trophy');
  E('S.craft.troph[3] = 1');
  assert(E(`upgradeItem(${up})`) && E(`itemById(${up}).plus`) === 8 && E('S.craft.troph[3]') === 0, '+8 spends one Trophy');
  E(`S.equip.weapon = ${up}; itemById(${up}).plus = 9`);
  assert(!E('upgradeEquipped("weapon")') && E(`itemById(${up}).plus`) === 9, 'upgradeEquipped honours the gate too');
  E(`itemById(${up}).plus = 3`);
  assert(E('upgradeEquipped("weapon")') && E(`itemById(${up}).plus`) === 4, 'below +8 no Trophy is needed');
  // companion gear and the one-wearer rule
  assert(E('rosterLive()'), 'roster is live in a new game');
  const caster = E('ROSTER_KEYS.find(k => ROSTER[k].role === "caster" && !isRecruited(k) && k !== "oriel")'), q = JSON.stringify(caster);
  E(`unlockChar(${q}, 'test', true)`);
  E('S.equip.weapon = null; gearDirty()');   // hero Might is party-wide: measure without it
  const d0 = E(`charDps(${q})`);
  E(`S.equip.weapon = ${up}; gearDirty()`);
  assert(E(`equipChar(${q}, ${up}, 'wpn')`) && E('S.equip.weapon') === null && E(`charRec(${q}).wpn`) === up, 'equipChar moves the Staff off the hero');
  const d1 = E(`charDps(${q})`);
  assert(d1 > d0 * 1.1, `companion weapon power is live through charGear (${d0.toFixed(1)} -> ${d1.toFixed(1)})`);
  assert(E('bagCount()') === E('S.items.length') - E('equippedIds().size'), 'items a companion wears leave the bag count');
  const bow = E('(() => { const it = newItem("bow", 1, "common"); S.items.push(it); return it.id; })()');
  assert(!E(`equipChar(${q}, ${bow}, 'wpn')`), 'a Bow does not fit a caster');
  assert(E(`equipItem(${up}, 'weapon')`) && E(`charRec(${q}).wpn`) === null, 'equipping on the hero takes it off the companion');
  E(`equipChar(${q}, ${up}, 'wpn')`);
  assert(E(`unequipChar(${q}, 'wpn')`) && E(`charRec(${q}).wpn`) === null && E(`!!itemById(${up})`), 'unequipChar returns the item to the bag');
  // class change (Mirror of Embers): the hero's class gear is retooled, never unequipped or deleted
  E(`equipItem(${up}, 'weapon')`);
  const lan = E('(() => { const it = newItem("lantern", 1, "common"); S.items.push(it); equipItem(it.id, "off"); return it.id; })()');
  const hood = E('(() => { const it = newItem("hood", 2, "rare"); S.items.push(it); return it.id; })()');
  const helm = E('(() => { const it = newItem("helm", 1, "common"); S.items.push(it); return it.id; })()');
  assert(!E(`equipItem(${helm}, 'helm')`), 'a classed hero cannot equip a legacy Helm');
  E(`S.equip.helm = ${helm}; gearDirty()`);   // as an old save wears it
  const cnt = E('S.items.length'), ids0 = E('S.items.map(i => i.id).join()'), gear0 = E('JSON.stringify(gear())'), hd0 = E('(() => { SYN_TUNE.on = 0; const d = heroDps(); SYN_TUNE.on = 1; return d; })()');   // F2: slot jobs and combos follow the class; gear is what this compares
  const toasts = []; g.fn.on('toast', t => toasts.push(t.msg));
  E('S.party.mirrors = 1; useMirror(); chooseClass("warden")');
  const sl = id => E(`itemById(${id}).slot`);
  assert(E(`S.equip.weapon === ${up} && S.equip.off === ${lan} && S.equip.helm === ${helm}`) && sl(up) === 'warblade' && sl(lan) === 'shield' && sl(helm) === 'greathelm' && sl(hood) === 'greathelm' && sl(bow) === 'bow',
    `class change retools: Staff -> Warblade, Lantern -> Shield, old Helm -> Greathelm (worn), bag Hood -> Greathelm, bag Bow (companion kind) kept (${[up, lan, helm, hood, bow].map(sl).join(',')})`);
  assert(E('S.items.length') === cnt && E('S.items.map(i => i.id).join()') === ids0 && E(`itemById(${up}).rt === "staff" && itemById(${helm}).rt === "helm" && itemById(${up}).plus === 4`), 'class change: same ids, count, +N; rt keeps the original kind');
  const hd1 = E('(() => { SYN_TUNE.on = 0; const d = heroDps(); SYN_TUNE.on = 1; return d; })()');
  assert(E('JSON.stringify(gear())') === gear0 && hd1 >= hd0, `class change keeps every gear() line (hero dps ${hd0.toFixed(1)} -> ${hd1.toFixed(1)}, synergies aside)`);
  assert(toasts.includes('Your old helm was reforged into Warden gear.') && toasts.includes('Your Lanternmage gear was reforged into Warden gear.'), 'class change tells the player once: ' + toasts.filter(t => /reforged/.test(t)).join(' | '));
  // Star Chart -> Oriel
  E(`S.skills.ench.lv = ${RQ(3) - 1}`);
  assert(E('canCraft("starChart", 3).why') === `Needs Enchanting ${RQ(3)}`, `Star Chart needs Enchanting ${RQ(3)}`);
  E(`S.skills.ench.lv = ${RQ(3)}; S.mats.crystal[2] = 40; S.mats.ess[2] = 20; S.craft.troph = [0, 0, 0, 0, 0, 0, 0]`);
  assert(E('canCraft("starChart", 3).why') === '1 more Wraith Veil', 'Star Chart needs a Wraith Veil');
  E('S.craft.troph[6] = 1');
  assert(E('!!craftItem("starChart", 3)') && E('S.party.unlock.starChart') === true && E('S.craft.starChart') === 1 && E('S.mats.crystal[2]') === 0 && E('S.craft.troph[6]') === 0, "Star Chart pays and grants Oriel's route");
  assert(E('isRecruited("oriel")') && !E('canCraft("starChart", 3).ok'), 'Oriel joins; no second Star Chart');
  // Tonics (K6b)
  E('almanac.force("none")'); const dm = E('mod("dmg")');
  E('S.mats.herb[0] = 10; S.mats.ess[0] = 10');
  assert(E('brewTonic("vigor", 1) && drinkTonic("vigor", 1)') && Math.abs(E('mod("dmg")') / dm - 1.15) < 1e-9, 'Vigor Tonic: +15% damage');
  E('emit("away", { secs: 1300, t: 1300, lines: [] })');
  assert(E('tonicActive()') === null && E('mod("dmg")') === dm, 'the Tonic timer runs offline');
  assert(!g.errors.length, 'no crafting errors' + (g.errors.length ? ': ' + g.errors[0] : ''));
  // old saves: defaults only, nothing else touched
  for (const f of ['save-v2.json', 'save-mid-v2.json', 'save-v2-late.json', 'save-a-v1.json']) {
    const raw = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8'), old = JSON.parse(raw);
    const go = loadCore({ storage: memoryStorage({ [KEY]: raw }) });
    const ok = go.eval('JSON.stringify(S.craft)') === JSON.stringify({ v: 1, troph: [0, 0, 0, 0, 0, 0, 0], tonic: null, tonics: {}, jobs: [], champ: 0, starChart: 0, tmd: {} })
      && go.eval('S.items.length') === old.items.length && Object.keys(old.equip).every(k => go.eval(`S.equip.${k}`) === old.equip[k]);
    go.eval('save(); loadSave()');
    assert(ok && go.eval('S.craft.v === 1 && S.items.length') === old.items.length, `${f}: craft defaults added, items and equip untouched, round trip ok`);
  }
} catch (e) { fail('crafting crashed: ' + (e.stack || e)); }

// ---- bounties: gathering counts at any tier and while away (owner bug report) ----
console.log('bounties');
try {
  const g = loadCore({});
  const E = x => g.eval(x);
  E("S.bounties.slots[0] = { k: 'mine', need: 10, have: 0, t: 3, id: 99, rr: 0 }");
  E("emit('harvest', { kind: 'ore', t: 1, n: 2 })");
  assert(E('S.bounties.slots[0].have') === 2, 'mining a lower tier than your best still counts');
  E("emit('harvest', { kind: 'crystal', t: 1, n: 5 })");
  assert(E('S.bounties.slots[0].have') === 2, 'other families do not count as ore');
  E("S.activity = 'gather'; S.node = { kind: 'ore', t: 1 }; awayGains(3600)");
  assert(E('S.bounties.slots[0].have') === 10, 'gathering while away counts');
} catch (e) { fail('bounties crashed: ' + (e.stack || e)); }

// ---- load on an Omen day with bounty slots to fill (bug: ReferenceError at load) ----
// Omens that wait for K6, B7 or the Deepwell probe `let`s declared in later files. Loading a save
// whose bounty slots need filling used to read bonus() at 55-bounties load, reach those probes
// in their temporal dead zone and throw. The clock is pinned before any file runs (prelude).
console.log('omen-day load');
try {
  const at = d => new Date(2026, 0, 1 + d, 12, 0, 0).getTime();
  const g = loadCore({ seed: 3 });
  g.eval('almanac.force(undefined)');
  const pick = {};
  for (let d = 0; d < 400; d++) { const n = g.eval(`almanac.scheduled(${d}).needs || ''`); if (['K6', 'B7', 'Deepwell'].includes(n) && pick[n] === undefined) pick[n] = d; }
  const base = JSON.parse(g.eval('JSON.stringify(S)'));
  for (const [need, d] of Object.entries(pick)) {
    const sv = JSON.parse(JSON.stringify(base));
    sv.bounties.slots = [{ k: null, wait: at(d) + 3600e3 }, { k: null, wait: at(d) - 1 }, null];  // one waiting, one expired, one missing
    let h, err = '';
    try { h = loadCoreRaw({ seed: 3, prelude: `Date.now = () => ${at(d)};`, storage: memoryStorage({ [KEY]: JSON.stringify(sv) }) }); }
    catch (e) { err = e.message; }
    if (err) { fail(`${need} Omen day ${d}: load throws: ${err}`); continue; }
    const want = h.eval(`almanac.omenFor(${d}).id`), got = h.eval('almanac.active().id');
    h.fn.tick(0.1);
    const filled = h.eval('S.bounties.slots.filter(b => b && b.k).length');
    assert(got === want && filled >= 2 && !h.errors.length, `${need} Omen day ${d}: loads, plays ${want} as after load (got ${got}), first tick fills ${filled} bounty slots` + (h.errors.length ? ': ' + h.errors[0] : ''));
  }
  assert(Object.keys(pick).length === 3, 'found an Omen day for each of K6, B7, Deepwell: ' + JSON.stringify(pick));
} catch (e) { fail('omen-day load crashed: ' + (e.stack || e)); }

// ---- pacing table (40-rules.js PACE, M6). The balance targets: node tools/sim.mjs --targets ----
console.log('pacing');
try {
  const g = loadCore({ seed: 3 }), E = s => g.eval(s);
  const hp = E('Array.from({ length: 140 }, (_, i) => mobHp(i + 1))');
  assert(hp.every((h, i) => Number.isFinite(h) && (i === 0 || h > hp[i - 1])), 'mob HP rises every zone to 140');
  assert(E('mobHp(35) / mobHp(34)') > E('mobHp(36) / mobHp(35)'), 'region 1 step lands on zone 35 and stays');
  const et = E('PACE.essTier'), zt = E(`[1, ${et[1] - 1}, ${et[1]}, ${et[3]}, ${et[4] - 1}, ${et[4]}, 200].map(zoneTier).join()`);
  assert(zt === '1,1,2,4,4,5,5', `essence tiers by zone (Starlit from ${et[4]}): ${zt}`);
  assert(E('paceXp(1) === 1 && paceXp(PACE.compLv) === 1 && paceXp(200) === PACE.compXpMax'), 'companion XP curve: 1 up to compLv, capped at compXpMax');
  // Hero XP while away: quiet level-ups, no toasts.
  E('chooseClass("warden"); S.maxZone = S.zone = 20; S.activity = "fight"');
  let toasts = 0; g.fn.on('toast', () => toasts++);
  const L0 = E('S.L'); g.fn.awayGains(4 * 3600);
  assert(E('S.L') > L0 && !toasts && !g.errors.length, `away time levels the hero quietly (L${L0} -> L${E('S.L')}, ${toasts} toasts)`);
} catch (e) { fail('pacing crashed: ' + (e.stack || e)); }

// ---- balance pass BAL1: drills, transmute limit, farm fall-back, craft goal, synergy texts ----
console.log('balance');
try {
  // Item 3 (T10): a drill every stepEvery levels between promotions, power x stepX, one event each.
  {
    const g = loadCore({ seed: 21 }), E = s => g.eval(s);
    E('chooseClass("warden")');
    const T = E('ROSTER_TUNE');
    assert(E('drillsAt(4) === 0 && drillsAt(5) === 1 && drillsAt(24) === 4 && drillsAt(25) === 4 && drillsAt(30) === 5 && isDrillLv(20) && !isDrillLv(25)'), 'drills at levels 5, 10, 15, 20, 30... (the 25s are promotions)');
    const drills = []; g.fn.on('drill', p => drills.push(p.lv));
    E('charRec("wren").lv = 9; charRec("wren").xp = 0');
    const p9 = E('charPow("wren")'); E('addCharXp("wren", cxpNeed(9) / ((ROSTER.wren.rarity === "common" ? ROSTER_TUNE.commonXp : 1) * (1 + catchUpBonus("wren")) * mod("compXp")) + 1e-6, true)');
    const p10 = E('charPow("wren")');
    assert(E('charRec("wren").lv') === 10 && drills.join() === '10' && Math.abs(p10 / p9 - T.growth * T.stepX) < 1e-6, `level 10 is a drill: one event, power x${(p10 / p9).toFixed(3)} (growth ${T.growth} x drill ${T.stepX})`);
    let tst = 0; g.fn.on('toast', () => tst++);
    E('charRec("wren").lv = 14; charRec("wren").xp = cxpNeed(14) * 0.999999');
    E('addCharXp("wren", cxpNeed(14), false)');
    assert(E('charRec("wren").lv') >= 15 && tst >= 1, 'a drill shows a toast when you are playing');
  }
  // Item 4: transmute-down chains stop after one step (a tier-5 unit used to become 16 tier-1).
  {
    const g = loadCore({ seed: 22 }), E = s => g.eval(s);
    E('chooseClass("ranger"); S.skills.ench.lv = 30; S.mats.ore = [0, 0, 0, 0, 1]');
    assert(E('transmute("ore", 5, "down")') && E('S.mats.ore.join()') === '0,0,0,2,0', '1 tier-5 ore breaks into 2 tier-4');
    assert(!E('transmute("ore", 4, "down")') && E('S.mats.ore.join()') === '0,0,0,2,0' && /cannot be broken down again/.test(E('canTransmute("ore", 4, "down").why')), 'broken-down ore cannot be broken down again (with a plain reason)');
    E('S.mats.ore[3] += 1');
    assert(E('transmute("ore", 4, "down")') && E('S.mats.ore.join()') === '0,0,2,2,0' && !E('transmute("ore", 3, "down")'), 'a gathered unit of that tier still breaks down, once');
    E('S.mats.ore[3] = 0'); E('S.mats.ore[3] = 3');
    assert(E('canTransmute("ore", 4, "down").ok'), 'spending the flagged units frees the pile (the flag never exceeds the pile)');
    assert(E('transmute("ore", 1, "up") || true') && E('JSON.stringify(S.craft.tmd.ore).length > 0'), 'the flag is saved in S.craft.tmd');
    const raw = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'save-v2.json'), 'utf8');
    const go = loadCore({ storage: memoryStorage({ [KEY]: raw }) });
    assert(go.eval('JSON.stringify(S.craft.tmd)') === '{}', 'old saves get an empty flag table');
  }
  // Item 6: idle income never stalls. A zone whose foe takes > farmSecs drops to the best farmable zone.
  {
    const raw = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'save-v2-late.json'), 'utf8');
    const old = JSON.parse(raw), stuck = 60;   // far past what this save can farm under the new curve
    old.zone = stuck; old.maxZone = Math.max(old.maxZone, stuck); old.activity = 'fight'; old.auto = true;
    const g = loadCore({ seed: 23, storage: memoryStorage({ [KEY]: JSON.stringify(old) }) }), E = s => g.eval(s);
    // Stage C: the fall-back zone is also one the party can hold (partyHolds, 59-combat.js).
    const secs = E(`mobHp(${stuck}) * mod('foeHp') / totalDps()`);
    const msgs = []; g.fn.on('toast', t => msgs.push(t.msg || t));
    for (let i = 0; i < 40; i++) g.fn.tick(0.1);
    const best = E(`(() => { let z = farmableZone(${stuck}, totalDps() / mod('foeHp')); while (z > 1 && !partyHolds(z)) z--; return z; })()`);
    const fell = msgs.filter(m => /fell back to Zone/.test(m));
    // (the hold estimate reads the party's buffs of the moment, so the zone may sit one below the one computed after)
    const at = E('S.zone');
    assert(secs > E('PACE.farmSecs') && at <= best && at >= best - 1 && best < stuck && fell.length === 1 && fell[0] === `Your party fell back to Zone ${at} to keep earning.`, `old save stuck at zone ${stuck} (a foe takes ${secs.toFixed(0)}s) falls back to zone ${at} (holds up to ${best}) with one toast`);
    for (let i = 0; i < 100; i++) g.fn.tick(0.1);
    assert(msgs.filter(m => /fell back/.test(m)).length === 1 && E('S.maxZone') >= stuck && E('S.pace.fell') === stuck, 'no second toast; the max zone and the save are untouched (fell back from is remembered)');
    const g2 = loadCore({ seed: 23, storage: memoryStorage({ [KEY]: JSON.stringify(old) }) }), E3 = s => g2.eval(s);
    E3('S.auto = false');   // away gains alone: no live fall-back first
    const gold0 = E3('S.gold'), r = g2.fn.awayGains(4 * 3600);
    const held = E3(`partyHoldEstimate(${stuck}).zone`);
    assert(E3('S.gold') > gold0 && r.note.includes(E3(`zoneName(${held})`)) && held <= best + 2, `away gains farm zone ${held} (the best zone <= S.zone the party holds): +${E3(`fmt(${E3('S.gold') - gold0})`)} gold`);
    // Climbing back: once the next zone is easy again, auto-progress walks up to where it fell from.
    E('S.zone = ' + best + '; S.pace.fell = ' + (best + 1));
    E('S.gold = 0; const __boost = addModifier("dmg", () => 1000)');
    E('paceCheck()');
    assert(E('S.zone') === best + 1 && E('S.pace.fell') === 0, 'with power to spare it climbs back to the zone it fell from');
    // A new game never falls back (every early foe dies fast).
    const g3 = loadCore({ seed: 24 }); let n = 0; g3.fn.on('toast', t => { if (/fell back/.test(t.msg || t)) n++; });
    g3.eval('chooseClass("warden")'); for (let i = 0; i < 1200; i++) g3.fn.tick(0.1);
    assert(n === 0 && !g3.errors.length && !g.errors.length && !g2.errors.length, 'a new game never falls back; no errors');
  }
  // Item 5: the Next Up craft goal names the class kind and opens its recipe.
  {
    const g = loadCore({ seed: 25 }), E = s => g.eval(s);
    E('chooseClass("ranger"); S.maxZone = S.zone = 3; S.mats.wood[0] = 5; S.mats.hide[0] = 1; S.mats.ess[0] = 1');
    const goal = E('topGoals(20, { sticky: false }).find(x => x.id === "forge")');
    assert(goal && /Bow|Quiver|Hood|Leathers|Charm|Pickaxe|Axe|Sickle/.test(goal.label) && !/Sword|Helm\b/.test(goal.label), `craft goal names a class item (${goal && goal.label})`);
    const n0 = E('forgeGoalPicks');
    E('GOALS.find(x => x.id === "forge").go.fn()');
    assert(E('CRAFT_KINDS[S.fSlot] && !CRAFT_KINDS[S.fSlot].legacy && fits(S.fSlot, kindPos(S.fSlot), "hero")') && E('forgeGoalPicks') === n0 + 1 && E('GOALS.find(x => x.id === "forge").go.sel') === '#forgeBtn', `Go picks ${E('S.fSlot')} tier ${E('S.fTier')} and focuses #forgeBtn in the Craft tab`);
    const g2 = loadCore({ seed: 26 }); g2.eval('S.maxZone = 3; S.mats.ore[0] = 99; S.mats.wood[0] = 99; S.mats.ess[0] = 99');
    const lab = g2.eval('(topGoals(20, { sticky: false }).find(x => x.id === "forge") || {}).label || ""');
    assert(!/Sword|Helm\b/.test(lab), `no class: the goal never suggests the legacy Sword or Helm (${lab || 'none'})`);
  }
  // Item 1: synergies at full strength, and the texts show what you get.
  {
    const g = loadCore({ seed: 27 }), E = s => g.eval(s);
    assert(E('SYN_TUNE.today') >= 0.5, `SYN_TUNE.today ${E('SYN_TUNE.today')} (>= 0.5)`);
    E('chooseClass("warden"); for (const k of ["tobin", "pip", "hesketh"]) unlockChar(k, "t", true); S.party.autoField = false; setField(["wren", "tobin", "pip"])');
    const a = E('activeSynergies().find(x => x.id === "hedgefolk")');
    const want = Math.round(15 * a.strength * E('SYN_TUNE.today'));
    assert(a && a.effectText.includes(`attacks ${want}% faster`), `Hedgefolk with a Common shows its real number (${a && a.effectText})`);
    const mods = E('synergyMods()');
    assert(Math.abs(mods.party - (1 + E('SYN_TUNE.hedgeSpeed') * a.strength * E('SYN_TUNE.today'))) < 0.2 + 1e-9 && mods.party > 1.1, `and the party gets it (x${mods.party.toFixed(3)} damage, Kindle included)`);
    E('SYN_TUNE.today = 0.5');
    const half = E('activeSynergies().find(x => x.id === "hedgefolk").effectText');
    assert(half.includes(`attacks ${Math.round(15 * a.strength * 0.5)}% faster`) && E('SYNERGIES.find(x => x.id === "dusk") && true'), `a lower SYN_TUNE.today changes the text too (${half})`);
    E('SYN_TUNE.today = 1');
    const dusk = E('(() => { const d = SYNERGIES.find(x => x.id === "dusk"); return d.text; })()');
    assert(/below 50% HP/.test(dusk), 'thresholds such as "below 50% HP" are never scaled');
  }
} catch (e) { fail('balance crashed: ' + (e.stack || e)); }

// ---- art: every outfit builds in Node (12a-12f, B1) ----
console.log('art');
try {
  const g = loadCore({});
  const r = g.eval(`(() => {
    const bad = [], cnt = {}, roster = typeof ROSTER === 'object' ? Object.keys(ROSTER) : [];
    const poses = [{}, { bob: 1 }, AK.DOWN].concat(Object.values(AK.ANIMS).flatMap(a => [a.wind, a.strike]));
    const num = s => s.t === 'p' ? s.pts.every(Number.isFinite) : [s.cx, s.cy, s.x1, s.y1, s.x2, s.y2, s.x, s.y].filter(v => v !== undefined).every(Number.isFinite);
    const run = (id, def, call) => { for (const pose of poses) { const k = AK.makeKit(def, pose); call(k); if (k.parts.length < 15 || !k.parts.every(p => p.m && p.m.hex && num(p.s))) bad.push(id); cnt[id] = k.parts.length; } };
    for (const id in AK.CLASSES) for (const [t, rr] of [[1, 0], [3, 1], [5, 3]]) {
      const def = AK.CLASSES[id], gg = {};
      for (const s in def.slots) gg[s] = AK.gearMats(def.slots[s], t, rr);
      run(id, def, k => def.build(k, gg, { skin: AK.m(AK.SKINS[0], 'skin'), hair: AK.m(AK.HAIRS[0], 'hair') }));
      run(id + ':bare', def, k => def.build(k, { weapon: null, off: null, head: null, body: null, charm: null }, { skin: AK.m(AK.SKINS[2], 'skin'), hair: AK.m(AK.HAIRS[1], 'hair') }));
    }
    for (const id in AK.CHARS) { const def = AK.CHARS[id]; for (const [t, rr] of [[def.wpn.t, def.wpn.r], [1, 0], [5, 3]]) run(id, def, k => def.build(k, AK.gearMats(def.wpn, t, rr, def.wpn.glow))); }
    return { bad: [...new Set(bad)], classes: Object.keys(AK.CLASSES), chars: Object.keys(AK.CHARS), missing: roster.filter(k => !AK.CHARS[k]) };
  })()`);
  assert(r.classes.join() === 'warden,lanternmage,ranger,lightkeeper', 'four hero classes drawn: ' + r.classes.join(', '));
  assert(r.chars.length === 18 && !r.missing.length, `every roster character has an outfit (${r.chars.length}${r.missing.length ? ', missing ' + r.missing.join(', ') : ''})`);
  assert(!r.bad.length, 'every outfit builds in every pose and tier without bad numbers' + (r.bad.length ? ': ' + r.bad.join(', ') : ''));
  assert(!g.errors.length, 'no art errors' + (g.errors.length ? ': ' + g.errors[0] : ''));
} catch (e) { fail('art crashed: ' + (e.stack || e)); }

// ---- camp (57-camp.js) ----
console.log('camp');
try {
  const g = loadCore({ seed: 11 });
  const E = s => g.eval(s);
  let clock = new Date(2026, 8, 28, 12, 0, 0).getTime();
  const setNow = t => { clock = t; E(`Date.now = () => ${t}`); };
  setNow(clock);
  const secs = n => { for (let i = 0; i < n * 10; i++) g.fn.tick(0.1); };
  const rich = () => E(`S.gold = 1e12; for (const k of Object.keys(S.mats)) S.mats[k] = [1e5, 1e5, 1e5, 1e5, 1e5]; S.craft.troph = [50, 50, 50, 50, 50, 50, 50]`);
  assert(E('S.camp.open') === false && E('["forge","bench","loom","ench","tavern"].every(k => campLevel(k) === 1)') && E('campLevel("hearth")') === 0, 'new game: camp closed, stations and Tavern at Lv 1');
  E('S.maxZone = 5'); secs(1.2);
  assert(E('S.camp.open && campLevel("hearth") === 1'), 'camp opens at zone 5 with Hearth 1');
  assert(E('almanac.needs.Camp()') && E('OMENS.filter(o => o.needs === "Camp").every(o => almanac.usable(o))'), "the Almanac's camp Omens switch on");
  // costs are paid
  E('S.gold = 0'); assert(!E('campBuild("watch")') && E('campCan("watch").miss.length') > 0, 'no build without the cost');
  rich();
  const before = JSON.parse(E('JSON.stringify({ g: S.gold, m: S.mats })')), cost = JSON.parse(E('JSON.stringify(campCost("watch", 1))'));
  assert(E('campBuild("watch")') && E('S.gold') === before.g - cost.gold && cost.mats.every(([f, t, n]) => E(`S.mats.${f}[${t - 1}]`) === before.m[f][t - 1] - n), `Watchtower Lv 1 paid (${cost.gold} gold, ${cost.mats.map(m => m.join(' ')).join(', ')})`);
  assert(!E('campBuild("watch")') && E('campCan("watch").why') === 'Already building.', 'one build per building at a time');
  assert(E('campCan("library").need.hearth') === 2, 'the Library needs Hearth 2');
  E('S.camp.b.hearth = 2'); const g0 = E('S.gold');
  assert(E('campBuild("forge")') && E('campBuilds().find(x => x.id === "forge").queued') && E('S.gold') < g0, 'a second build queues behind the first and is paid now');
  assert(!E('campBuild("tavern")') && E('campCan("tavern").full'), 'one builder with one queued build: the third is refused');
  // cancel: 100% before it starts
  const gq = E('S.gold'), fc = JSON.parse(E('JSON.stringify(campPending("forge").cost)'));
  assert(E('campCancel("forge")') && E('S.gold') === gq + fc.gold, 'cancelling a queued build refunds it all');
  E('campBuild("forge")');
  // timers run offline
  const wEnd = E('campPending("watch").end'), fDur = E('campPending("forge").dur');
  setNow(wEnd + 1000);
  const r = JSON.parse(E('JSON.stringify(awayGains(3600))'));
  assert(E('campLevel("watch")') === 1 && E('campPending("forge").start') === wEnd && E('campPending("forge").end') === wEnd + fDur, 'finished while away; the queued build started at the old end');
  assert(r.extra.some(l => /Watchtower Lv 1 is finished/.test(l.txt)), 'the away report lists the finished build');
  setNow(wEnd + fDur + 5);
  E('globalThis.__cb = []; on("campBuilt", p => globalThis.__cb.push(p))'); secs(1.2);
  assert(E('campLevel("forge")') === 2 && E('JSON.stringify(globalThis.__cb)') === '[{"id":"forge","lv":2}]', "the tick finishes builds; 'campBuilt' {id, lv} fires");
  // cancel: 50% once started
  E('S.camp.b.hearth = 4'); rich();
  const gs = E('S.gold'), cc = JSON.parse(E('JSON.stringify(campCost("library", 1))'));
  E('campBuild("library")'); E('campCancel("library")');
  assert(E('S.gold') === gs - cc.gold + Math.floor(cc.gold / 2), 'cancelling a started build refunds half');
  // perks apply
  E('S.relic.glass = 0; S.camp.b.watch = 3');
  assert(E('bonus("awayHours")') === 6, 'Watchtower Lv 3: +6h away');
  E('S.relic.glass = 5; S.camp.b.watch = 5'); E('addBonus("awayHours", () => 7)');
  const r2 = JSON.parse(E('JSON.stringify(awayGains(48 * 3600))'));
  assert(r2.t === 24 * 3600 && r2.cap === 24 * 3600, `away cap never above 24h (Hourglass 5 + Watchtower 5 + another +7h: ${r2.t / 3600}h)`);
  E('S.camp.b.hearth = 0; S.camp.b.watch = 0; S.relic.glass = 0');
  E('almanac.force("none")'); E('Object.assign(S.camp.b, { hearth: 0, forge: 1, bench: 1, loom: 1, ench: 1, library: 0, tavern: 1 })');
  const base = JSON.parse(E('JSON.stringify({ sx: mod("skillXp:smith"), sv: mod("salvage"), rf: mod("reforge"), ts: bonus("transmuteSave"), rw: mod("rareW"), off: mod("offline"), gx: mod("skillXp:mine"), cx: mod("compXp"), bp: mod("bountyPay") })'));
  E('Object.assign(S.camp.b, { hearth: 10, forge: 5, bench: 5, loom: 5, ench: 5, library: 5, tavern: 4 })');
  const hi = JSON.parse(E('JSON.stringify({ sx: mod("skillXp:smith"), sv: mod("salvage"), rf: mod("reforge"), ts: bonus("transmuteSave"), rw: mod("rareW"), off: mod("offline"), gx: mod("skillXp:mine"), cx: mod("compXp"), bp: mod("bountyPay") })'));
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  assert(near(hi.sx / base.sx, 1.3) && near(hi.sv / base.sv, 1.25) && near(hi.rf / base.rf, 0.8) && hi.ts - base.ts === 1 && near(hi.rw / base.rw, 1.1), 'station Lv 5 perks: XP +30%, salvage, reforge, transmute, rarity');
  assert(near(hi.off / base.off, 1.3) && near(hi.gx / base.gx, 1.25) && near(hi.cx / base.cx, 1.2) && near(hi.bp / base.bp, 1.15), 'Hearth 10 +30% away, Library 5 XP, Tavern 4 bounties');
  E('almanac.force("hearthDay")'); assert(near(E('mod("offline")') / base.off, 1.6), 'Hearth Day doubles the Hearth bonus');
  E('almanac.force("none")');
  // perks never gate recipes
  const craftSig = () => E('Object.keys(CRAFT_KINDS).flatMap(k => [1,2,3,4,5].map(t => canCraft(k, t).ok ? 1 : 0)).join("")');
  E('S.skills.smith.lv = 9; S.skills.bench.lv = 4');
  E('Object.assign(S.camp.b, { forge: 1, bench: 1, loom: 1, ench: 1 })'); const lo = craftSig();
  E('Object.assign(S.camp.b, { forge: 5, bench: 5, loom: 5, ench: 5 })'); const hiC = craftSig();
  assert(lo === hiC && lo.includes('1'), 'station levels never gate a recipe');
  // Blessings
  E('S.camp.b.shrine = 0'); assert(!E('blessToggle("blade")'), 'no Blessing without the Shrine');
  E('S.camp.b.shrine = 1'); const d0 = E('mod("dmg")');
  E('if (S.codex) Object.assign(S.codex.half, { bestiary: 1, zones: 1 })');   // the Codex gate (57c): their pages are half full
  assert(E('blessToggle("blade")') && near(E('mod("dmg")') / d0, 1.08) && E('blessToggle("coin")') && E('S.camp.bless.join()') === 'coin', 'Shrine 1: one Blessing, swapping replaces it');
  E('S.camp.b.shrine = 3; blessSet(["blade", "coin"])'); assert(near(E('mod("dmg")') / d0, 1.1) && E('S.camp.bless.length') === 2, 'Shrine 3: two Blessings, 25% stronger (Blade +10%)');
  E('S.camp.bless = []');
  // builders
  E('S.camp.b.hearth = 5'); assert(E('campBuilders()') === 2, 'Hearth 5 adds a second builder');
  // Roster board status hook
  E('S.maxZone = 30; S.gold = 1e12; ["tobin","wren","pip","hesketh","kestrel"].forEach(k => recruit(k))');
  const bench = JSON.parse(E('JSON.stringify(benchList())'));
  assert(bench.length >= 1 && bench.every(id => E(`campStatus("${id}").status`) === 'rest' && E(`campFree("${id}")`)), `bench rests at camp (${bench.join(', ')})`);
  const who = bench[0];
  E(`globalThis.__rm = registerBenchStatus(id => id === "${who}" ? { status: 'job', label: 'Job: Oak Grove' } : null)`);
  assert(E(`campStatus("${who}").status`) === 'job' && !E(`campFree("${who}")`) && E(`campStatus(S.party.field[0]).status`) === 'field', 'registerBenchStatus: one status per character, from the owning system');
  E('globalThis.__rm()'); assert(E(`campStatus("${who}").status`) === 'rest', 'removing the hook frees the character');
  // Next Up
  E('S.camp.builds = []'); rich();
  assert(E('topGoals(8, { sticky: false }).some(x => x.id === "camp-build" && x.ready)'), 'Next Up: "ready to build"');
  assert(E('campBuild("hearth")'), 'Hearth 6 started');
  assert(E('topGoals(60, { sticky: false }).some(x => x.id === "camp-timer" && /finishes in/.test(x.label))'), 'Next Up: "build finishes in <time>"');
  const bad = badNumbers(E('S'));
  assert(!bad.length, 'no NaN in the camp state' + (bad.length ? ': ' + bad[0] : ''));
  assert(!g.errors.length, 'no camp errors' + (g.errors.length ? ': ' + g.errors[0] : ''));
  // old saves get the defaults; dps unchanged; round trip keeps S.camp
  for (const f of ['save-v2.json', 'save-mid-v2.json', 'save-v2-late.json', 'save-a-v1.json']) {
    const raw = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8'), old = JSON.parse(raw);
    const go = loadCore({ seed: 5, storage: memoryStorage({ [KEY]: raw }) });
    const def = go.eval('S.camp.open === false && S.camp.builds.length === 0 && ["forge","bench","loom","ench","tavern"].every(k => S.camp.b[k] === 1)');
    for (let i = 0; i < 12; i++) go.fn.tick(0.1);
    const opened = go.eval('S.camp.open') === (old.maxZone >= 5);
    // the opened camp changes neither damage nor gear (compare with the camp's levels removed)
    const dps1 = go.fn.totalDps(), gear1 = JSON.stringify(go.fn.gear()), keep = go.eval('JSON.stringify(S.camp.b)');
    go.eval('S.camp.b = { hearth: 0, watch: 0, forge: 0, bench: 0, loom: 0, ench: 0, tavern: 0, library: 0, maproom: 0, shrine: 0 }');
    const dps0 = go.fn.totalDps(), same = dps1 === dps0 && JSON.stringify(go.fn.gear()) === gear1;
    go.eval(`S.camp.b = ${keep}`);
    const cs = go.eval('JSON.stringify(S.camp)'); go.eval('save(); loadSave()');
    const rt = go.eval('JSON.stringify(S.camp)') === cs;
    assert(def && opened && same && rt, `${f}: camp defaults, opens by zone, dps and gear unchanged, round trip keeps S.camp` + (def && opened && same && rt ? '' : `: ${JSON.stringify({ def, opened, same, rt, dps0, dps1 })}`));
  }
} catch (e) { fail('camp crashed: ' + (e.stack || e)); }

// ---- 8. gathering, fight drops, trophies, offline (55-gathering.js, K5) ----
console.log('gathering');
try {
  const fresh = seed => { const g = loadCore({ seed }); g.eval('almanac.force("none")'); return g; };
  const g = fresh(21), E = s => g.eval(s);
  const run = (secs, h = g) => { for (let t = 0; t < secs; t += 0.1) h.fn.tick(0.1); };
  // every family harvestable at its tier, behind its skill gate
  for (const kind of ['ore', 'crystal', 'wood', 'fibre', 'herb']) {
    const sk = E(`skillOf(${JSON.stringify(kind)})`);
    for (const t of [1, 3]) {
      E(`S.skills.${sk}.lv = ${t === 1 ? 1 : 'NODE_REQ[2] - 1'}`);
      const locked = t > 1 && !E(`setNode(${JSON.stringify(kind)}, ${t})`);
      E(`S.skills.${sk}.lv = NODE_REQ[${t - 1}]`);
      const set = E(`setNode(${JSON.stringify(kind)}, ${t})`); E('setActivity("gather")');
      const n0 = E(`S.mats.${kind}[${t - 1}]`), x0 = E(`S.skills.${sk}.xp + S.skills.${sk}.lv * 1e6`);
      run(20);
      assert(set && (t === 1 || locked) && E(`S.mats.${kind}[${t - 1}]`) > n0 && E(`S.skills.${sk}.xp + S.skills.${sk}.lv * 1e6`) > x0,
        `${kind} tier ${t}: ${t > 1 ? 'locked below ' + SKILL_NAME(sk) + ' ' + E(`NODE_REQ[${t - 1}]`) + ', ' : ''}harvested ${E(`S.mats.${kind}[${t - 1}]`) - n0}, ${sk} XP gained`);
    }
  }
  function SKILL_NAME(k) { return E(`SKILL[${JSON.stringify(k)}]`); }
  E('S.skills.mine.lv = 1; S.skills.forage.lv = 1');
  assert(Math.abs(E('nodeTime("crystal", 2) / nodeTime("ore", 2)') - 1.25) < 1e-9 && Math.abs(E('nodeTime("fibre", 2) / nodeTime("herb", 2)') - 0.9) < 1e-9, 'Geodes take x1.25 the vein time, Fibre x0.9 the herb time');
  assert(E('nodeXpFor("crystal", 1)') === E('nodeXp(1)') * 1.25, 'Crystal XP x1.25');
  E('S.skills.mine.lv = 10; S.skills.wood.lv = 10; S.skills.forage.lv = 2; S.skills.forage.xp = 0');
  assert(E('mod("skillXp:forage")') === 2, 'Foraging catch-up: x2 XP while below Mining/Woodcutting');
  E('S.skills.forage.lv = 12');
  assert(E('mod("skillXp:forage")') === 1, '...and x1 once level');
  // Hide and essence come only from fights
  E('S.mats.hide = [0, 0, 0, 0, 0]; S.mats.ess = [0, 0, 0, 0, 0]; S.skills.forage.lv = 1; setNode("fibre", 1); setActivity("gather")');
  run(300);
  assert(E('S.mats.hide.every(n => n === 0) && S.mats.ess.every(n => n === 0)') && E('!CRAFT_NODES.hide && !CRAFT_NODES.ess'), 'gathering never gives Hide or Essence');
  E('S.maxZone = 5; S.zone = 4; S.auto = false; setActivity("fight"); S.mastery.zones[4] = 0');
  const k0 = E('S.totalKills');
  for (let i = 0; i < 400; i++) E('spawn(); kill()');
  const hide = E('S.mats.hide[0]'), rate = hide / (E('S.totalKills') - k0);
  const expect = E('0.72 * CRAFT_SIG_DROPS.beetle.p + 0.28 * CRAFT_SIG_DROPS.spore.p * 0') ;
  // GP1: the upper bound was 1.6x; 400 kills earn mastery stars (+10% each) and packs of 3 land near
  // 0.40/kill on most seeds (0.39-0.43 on seeds 1-3, 21, 22), so a new random stream tipped it over.
  assert(rate > expect * 0.7 && rate < expect * 1.9, `Barrow Beetle zone drops Hide on kills (${hide} in 400 kills, ${rate.toFixed(2)}/kill, base ${expect.toFixed(2)} before stars)`);
  // home ground
  E('S.zone = 2; S.mastery.zones[2] = 0');
  assert(E('homeFamily()') === 'crystal' && E('homeBonus("crystal")') === 0.25 && E('mod("yield:crystal")') === 1.25 && E('homeBonus("ore")') === 0, 'Batwing Caves: Crystal +25% (home ground), Ore +0%');
  E('S.mastery.zones[2] = MASTERY_STARS[2]');
  assert(E('homeBonus("crystal")') === 0.5, 'home ground +50% with 3 mastery stars');
  // champions and trophies
  E('S.craft.troph = [0, 0, 0, 0, 0, 0, 0]; S.craft.champ = 0; S.maxZone = 30; S.zone = 22; fightBoss = false');
  E('{ const r = Math.random; Math.random = () => 0; spawn(); Math.random = r; }');
  // Stage C: the champion is the pack's lead foe (a third of the pack's HP before the x3).
  const ch = E('({ champ: !!mob.champ, name: mob.name, ratio: mob.hp / (mobHp(22) * COMBAT_TUNE.packHp / COMBAT_TUNE.packSize) })');
  const zt = E('zoneType(22)'), sig = E(`CRAFT_SIG_DROPS[TYPES[${zt}].key]`), before = E(`S.mats.${sig.fam}[3]`);
  E('kill()');
  assert(ch.champ && /^Champion /.test(ch.name) && ch.ratio > 2.6, `champion spawns with x3 HP (${ch.name})`);
  assert(E(`S.craft.troph[${zt}]`) === 1 && E('S.craft.champ') === 1 && E(`S.mats.${sig.fam}[3]`) - before >= 5, 'champion kill: 1 Trophy of its type, 5 signature drops, counted');
  E('S.zone = 25; S.maxZone = 25; S.kills = 10; challenge(); kill()');
  const bt = E('zoneType(25)');
  assert(E(`S.craft.troph[${bt}]`) === E('CRAFT_TROPHY_SRC.firstBoss') + (bt === zt ? 1 : 0) && E('S.maxZone') === 26, 'first kill of a zone boss (zone 20+) gives a Trophy');
  const tot = E('trophies()');
  E('S.zone = 25; fightBoss = true; spawn(); kill()');
  assert(E('trophies()') === tot, 'a boss rematch gives no Trophy');
  E('S.zone = 5; S.maxZone = 5; S.kills = 10; challenge(); kill()');
  assert(E('trophies()') === tot, 'bosses below zone 20 give no Trophy');
  E('S.zone = 5; spawn()'); let champLow = false;
  for (let i = 0; i < 300; i++) { E('spawn()'); if (E('!!mob.champ')) champLow = true; }
  assert(!champLow && E('champChance(5)') === 0, 'no champions below zone 20');
  // the Glint
  E('S.skills.mine.lv = 1; setNode("ore", 1); setActivity("gather"); S.zone = 1');
  let on = false; for (let i = 0; i < 300 && !on; i++) { run(0.1); on = E('glint().on'); }
  const o0 = E('S.mats.ore[0]'); E('emit("tap", { node: true })');
  assert(on && E('S.mats.ore[0]') - o0 >= 2 && !E('glint().on'), `a Glint shows within 25s; tapping it gives ${E('S.mats.ore[0]') - o0} ore`);
  const o1 = E('S.mats.ore[0]'); E('emit("tap", { node: true })');
  assert(E('S.mats.ore[0]') === o1, 'no Glint, no bonus');
  assert(!g.errors.length, 'no gathering errors' + (g.errors.length ? ': ' + g.errors[0] : ''));

  // offline credits vs live, 1h (G10-ish): gathering per family, and fight signature drops
  const setup = (h, kind) => h.eval(`S.skills.mine.lv = 20; S.skills.wood.lv = 20; S.skills.forage.lv = 20; S.zone = 3; S.maxZone = 3; setNode(${JSON.stringify(kind)}, 2); setActivity("gather")`);
  for (const kind of ['ore', 'crystal', 'wood', 'fibre', 'herb']) {
    const live = fresh(31); setup(live, kind); const a = live.eval(`S.mats.${kind}[1]`); run(3600, live); const liveN = live.eval(`S.mats.${kind}[1]`) - a;
    const away = fresh(31); setup(away, kind); const b = away.eval(`S.mats.${kind}[1]`); away.fn.awayGains(3600); const awayN = away.eval(`S.mats.${kind}[1]`) - b;
    assert(Math.abs(awayN / liveN - 1) <= 0.15, `offline ${kind} 1h within 15% of live (${awayN} vs ${liveN})`);
  }
  const fsetup = h => h.eval('PACE.farmSecs = 1e9; S.maxZone = 5; S.zone = 4; S.auto = false; S.mastery.zones[4] = 5000; S.mats.hide = [0, 0, 0, 0, 0]; setActivity("fight"); spawn()');
  const live = fresh(41); fsetup(live); const lk = live.eval('S.totalKills'); run(3600, live);
  const liveRate = live.eval('S.mats.hide[0]') / (live.eval('S.totalKills') - lk);
  const away = fresh(41); fsetup(away); const ak = away.eval('S.totalKills'); const r = away.fn.awayGains(3600);
  const awayRate = away.eval('S.mats.hide[0]') / (away.eval('S.totalKills') - ak);
  assert(Math.abs(awayRate / liveRate - 1) <= 0.15, `offline Hide per kill within 15% of live (${awayRate.toFixed(3)} vs ${liveRate.toFixed(3)})`);
  assert(r.mats.some(m => m.k === 'hide'), 'the away report lists the Hide');
  const cz = fresh(43); cz.eval('addModifier("dmg", () => 1e6); S.maxZone = 30; S.zone = 29; S.auto = false; setActivity("fight"); addModifier("champion", () => 30)');
  const r2 = cz.fn.awayGains(3600);
  assert(cz.eval('trophies()') > 0 && cz.eval('S.craft.champ') > 0 && r2.extra.some(l => / (Heart|Fang|Knuckle|Horn|Crown|Core|Veil)$/.test(l.txt)), `offline champions credit Trophies with an away line (${cz.eval('trophies()')})`);

  // old saves: forage and the new families default in; ore/wood node maths is the old formula exactly
  for (const f of ['save-v2.json', 'save-mid-v2.json', 'save-v2-late.json', 'save-a-v1.json']) {
    const raw = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8'), old = JSON.parse(raw);
    const go = loadCore({ storage: memoryStorage({ [KEY]: raw }) });
    go.eval('TOOL_TUNE.on = 0');   // H2 (55-tools) adds right tool and mastery speed on top; off = the K5 maths
    const defaults = go.eval('S.skills.forage.lv === 1 && ["crystal", "fibre", "herb", "hide"].every(k => S.mats[k].length === 5) && S.craft.troph.length === 7');
    const same = ['ore', 'wood', 'ess'].every(k => JSON.stringify(go.eval(`S.mats.${k}`)) === JSON.stringify(old.mats[k]));
    const exact = go.eval(`[1, 2, 3, 4, 5].every(t => {
      const g = gear(), m = S.skills.mine.lv, w = S.skills.wood.lv;
      const ot = 2.6 * (1 + 0.3 * (t - 1)) / ((1 + 0.02 * (m - 1)) * (1 + (g.mineSpd + g.gather) / 100)) / mod('gatherSpeed');
      const wt = 2.6 * (1 + 0.3 * (t - 1)) / ((1 + 0.02 * (w - 1)) * (1 + (g.woodSpd + g.gather) / 100)) / mod('gatherSpeed');
      return nodeTime('ore', t) === ot && nodeTime('wood', t) === wt;
    }) && nodeYieldAvg('ore') === 1 + Math.min(60, gear().oreDbl) / 100 + gear().oreExtra && nodeYieldAvg('wood') === 1 + Math.min(60, gear().woodDbl) / 100 + gear().woodExtra`);
    assert(defaults && same && exact && !go.errors.length, `${f}: Foraging and new families default in, old materials untouched, ore/wood node maths unchanged`);
  }
} catch (e) { fail('gathering crashed: ' + (e.stack || e)); }

// ---- tools and tool mastery (55-tools.js, H2; hearth-and-hands.md 2 and 8.3) ----
console.log('tools');
try {
  const fresh = seed => { const g = loadCore({ seed }); g.eval('almanac.force("none")'); return g; };
  const run = (h, secs) => { for (let t = 0; t < secs; t += 0.1) h.fn.tick(0.1); };
  const M1 = JSON.stringify({ v: 1, m: { pick: [1, 0], axe: [1, 0], sickle: [1, 0] }, finds: 0 });
  {
    const g = fresh(71), E = s => g.eval(s);
    // data: every tool at the Workbench with three lines; the Woodaxe noun
    assert(E('["pick", "axe", "sickle"].every(k => CRAFT_KINDS[k].st === "bench" && CRAFT_KINDS[k].base.length === 3 && CRAFT_KINDS[k].base[2][2] === TOOL_TUNE.findCap)') && E('CRAFT_KINDS.axe.noun') === 'Woodaxe' && E('kindName("axe", 1)') === 'Copper Woodaxe',
      'Pickaxe, Woodaxe and Sickle are made at the Workbench with speed, double and rare find lines');
    assert(E('JSON.stringify(equippedTool("mine"))') === '{"kind":"pick","tier":0,"item":null}' && E('toolName("wood")') === 'Flint Hatchet (rough)' && E('toolName("forage")') === 'Bone Sickle (rough)',
      'an empty slot is the rough tool (tier 0): Stone Pick, Flint Hatchet, Bone Sickle');
    assert(E('JSON.stringify(S.tools)') === M1, 'a new game starts every tool kind at mastery 1');
    // the right tool: a tier-matched common Copper Pickaxe vs the rough tool (HS15: +30% to +45%)
    E('setNode("ore", 1); setActivity("gather")');
    const rough = E('nodeTime("ore", 1)');
    const pk = E('(() => { const it = newItem("pick", 1, "common"); addItem(it); equipItem(it.id, "pick"); return it.id; })()');
    const ratio = rough / E('nodeTime("ore", 1)');
    assert(pk && E('equippedTool("mine").tier') === 1 && ratio >= 1.3 && ratio <= 1.45 && Math.abs(E('toolRight("mine", 1)') - 1.25) < 1e-12,
      `right tool: a common Copper Pickaxe mines a Copper vein ${((ratio - 1) * 100).toFixed(1)}% faster than the Stone Pick (HS15)`);
    assert(E('toolRight("mine", 2)') === 1 && E('toolRight("wood", 1)') === 1, 'no right-tool bonus on a higher-tier node or another skill (a bonus, never a gate)');
    E('TOOL_TUNE.on = 0');
    const off = E('nodeTime("ore", 1)');
    E('TOOL_TUNE.on = 1');
    assert(Math.abs(off / E('nodeTime("ore", 1)') - 1.25 * 1.01) < 1e-9, 'TOOL_TUNE.on = 0 restores the old node maths (right tool and mastery speed off)');
    // Sickle moved from the Forge: Woodcraft XP, gate on max(Woodcraft, Smithing)
    E('S.skills.smith.lv = CRAFT_STATION_REQ[2]; S.skills.bench.lv = 1; S.skills.bench.xp = 0; S.skills.smith.xp = 0; S.mats.ore[2] = 99; S.mats.wood[2] = 99');
    const sk = E('!!craftItem("sickle", 3)');
    assert(sk && E('S.skills.bench.xp + S.skills.bench.lv') > 1 && E('S.skills.smith.xp') === 0 && E('stationLevel("sickle")') === E('CRAFT_STATION_REQ[2]'), `a Sickle made at the Workbench: tier 3 with Smithing ${E('CRAFT_STATION_REQ[2]')}, Woodcraft XP only`);
    // mastery: seconds spent gathering, even when nothing is credited (a full Storehouse)
    E('S.equip.pick = null; gearDirty(); setNode("ore", 1); setActivity("gather")');
    const m0 = E('S.mats.ore[0]');
    E('globalThis.__stop = addModifier("gatherSpeed", () => 1e-9)');
    run(g, 5 * 60 + 2);
    assert(E('S.tools.m.pick[0]') === 2 && E('S.mats.ore[0]') === m0, `mastery XP counts with nothing gathered (Pickaxe mastery 2 after 5 min, ${E('Math.round(S.tools.m.pick[1])')} s into it)`);
    E('globalThis.__stop()');
    assert(Math.abs(E('mod("gatherSpeed:mine")') - 1.02) < 1e-12 && E('mod("gatherSpeed:wood")') === 1.01, 'mastery speed: +1% a level, on that tool kind only');
    const r = g.fn.awayGains(3 * 3600);
    assert(E('S.tools.m.pick[0]') > 2 && r.extra.some(l => /^Pickaxe mastery \d+ \(\+\d+\)$/.test(l.txt)), `away gathering adds mastery 1:1 (Pickaxe mastery ${E('S.tools.m.pick[0]')} after ${r.t / 3600} h) with an away line`);
    E('toolMasteryAdd("pick", 1e9)');
    assert(E('JSON.stringify(toolMastery("pick"))') === JSON.stringify({ lv: 20, secs: 0, need: 0, max: true, pct: 1, left: 0 }) && E('Array.from({ length: 19 }, (_, i) => TOOL_TUNE.masteryMins * (i + 1)).reduce((a, b) => a + b)') === 950, 'mastery caps at 20 (950 minutes in all)');
    // perks
    E('globalThis.yieldUp = () => { const a = mod("yield:ore"); TOOL_TUNE.on = 0; const b = mod("yield:ore"); TOOL_TUNE.on = 1; return a / b; }; S.tools.m.pick = [4, 0]');
    const p4 = E('[bonus("find:mine"), bonus("glint:mine"), yieldUp()].join()');
    E('S.tools.m.pick = [15, 0]');
    const p15 = E('[bonus("find:mine"), bonus("glint:mine"), Math.round(yieldUp() * 100) / 100, toolHandsMult("mine")].join()');
    E('S.tools.m.pick = [20, 0]; S.equip.pick = ' + pk + '; gearDirty()');
    assert(p4 === '0,0,1' && p15 === '1,1,1.05,1' && E('toolHandsMult("mine")') === 1.1 && E('toolName("mine")') === 'Master Copper Pickaxe' && E('toolPerks("pick").every(p => p.on)'),
      'perks: Lv 5 rare find +1, Lv 10 Glint +1 s, Lv 15 +5% yield, Lv 20 Master (Hands +10%)');
    // rare finds: 1 of the next tier per find; 2 more of tier 5 on a tier-5 node
    E(`S.tools.m.pick = [1, 0]; Object.assign(itemById(${pk}), { t: 5, r: "epic", plus: 10 }); gearDirty()`);
    const ch = E('toolFind("mine")');
    const a0 = E('S.mats.ore[1]'), c0 = E('S.mats.crystal[1]'), t50 = E('S.mats.ore[4]'), f0 = E('S.tools.finds');
    E('emit("harvest", { kind: "ore", t: 1, n: 2000, away: true }); emit("harvest", { kind: "crystal", t: 1, n: 2000 }); emit("harvest", { kind: "ore", t: 5, n: 1000, away: true })');
    const ore2 = E('S.mats.ore[1]') - a0, cr2 = E('S.mats.crystal[1]') - c0, ore5 = E('S.mats.ore[4]') - t50;
    assert(ch === 0.08 && Math.abs(ore2 - 160) <= 1 && cr2 > 110 && cr2 < 210 && Math.abs(ore5 - 160) <= 2 && E('S.tools.finds') - f0 === ore2 + cr2 + ore5,
      `rare find 8% (tier 5 Epic +10): +${ore2} Iron from 2000 Copper away, +${cr2} tier-2 crystal live, +${ore5} Emberite on tier 5`);
    E('TOOL_TUNE.on = 0'); const b = E('S.mats.ore[1]'); E('emit("harvest", { kind: "ore", t: 1, n: 2000, away: true })');
    assert(E('S.mats.ore[1]') === b, 'TOOL_TUNE.on = 0: no rare finds');
    E('TOOL_TUNE.on = 1');
    assert(E('toolBest("mine").cur') === 5 && !E('toolBest("mine").ok') && E('toolBest("wood").t') >= 1, `toolBest: nothing to make over a tier-5 pick; a tier-${E('toolBest("wood").t')} Woodaxe for Woodcutting`);
    assert(!g.errors.length, 'no errors' + (g.errors.length ? ': ' + g.errors[0] : ''));
  }
  // old saves: mats and dps exact, every tool recipe open at the same tiers, S.tools defaults in, round trip
  for (const f of ['save-v2.json', 'save-mid-v2.json', 'save-v2-late.json', 'save-a-v1.json']) {
    const raw = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8'), old = JSON.parse(raw);
    const g = loadCore({ storage: memoryStorage({ [KEY]: raw }) }), E = s => g.eval(s);
    const same = Object.keys(old.mats).every(k => JSON.stringify(E(`S.mats.${k}`)) === JSON.stringify(old.mats[k]));
    const dps = [g.fn.heroDps(), g.fn.totalDps()];
    E('TOOL_TUNE.on = 0; gearDirty()');
    const dpsOff = [g.fn.heroDps(), g.fn.totalDps()];
    E('TOOL_TUNE.on = 1; gearDirty()');
    // Before H2: Pickaxe and Sickle at the Forge (Smithing), Woodaxe max(Woodcraft, Smithing).
    const oldLv = { pick: E('S.skills.smith.lv'), sickle: E('S.skills.smith.lv'), axe: E('Math.max(S.skills.bench.lv, S.skills.smith.lv)') };
    const gate = Object.entries(oldLv).every(([k, lv]) => [1, 2, 3, 4, 5].every(t => lv < E(`CRAFT_STATION_REQ[${t - 1}]`) || E(`stationLevel("${k}") >= CRAFT_STATION_REQ[${t - 1}]`)));
    const lines = E(`["pick", "axe"].every(p => { const it = itemById(S.equip[p]); if (!it) return true;
      const l = itemLines(it), pw = itemPower(it), f = TOOL_KINDS[p].find;
      return l[2][0] === f && l[2][1] === Math.min(8, pw * 0.012) && gear()[f] === l[2][1]; })`);
    assert(same && dps[0] === dpsOff[0] && dps[1] === dpsOff[1] && gate && lines,
      `${f}: materials exact, dps unchanged, every tool recipe open at the same tiers, old tools gain the rare find line` + (E('S.equip.pick') != null ? ` (pick ${E('gear().oreFind').toFixed(2)}%)` : ''));
    const tools = E('JSON.stringify(S.tools)');
    g.fn.save();
    const g2 = loadCore({ storage: memoryStorage({ [KEY]: g.storage.get(KEY) }) });
    assert(!('tools' in old) && tools === M1 && g2.eval('JSON.stringify(S.tools)') === tools && !g.errors.length, `${f}: S.tools defaults in (mastery 1) and survives a round trip`);
  }
} catch (e) { fail('tools crashed: ' + (e.stack || e)); }

// ---- expeditions (57b-expeditions.js) ----
console.log('expeditions');
try {
  const mk = seed => {
    const g = loadCore({ seed }), E = s => g.eval(s);
    g.clock = new Date(2026, 8, 28, 12, 0, 0).getTime();
    g.setNow = t => { g.clock = t; E(`Date.now = () => ${t}`); };
    g.setNow(g.clock);
    E('almanac.force("none")');
    E('S.maxZone = 36; ["tobin","wren","hesketh","pip","bram","maren","aldric","kestrel","thessaly","anselm","oriel"].forEach((k, i) => { unlockChar(k, "test", true); charRec(k).lv = 20 + 5 * i; })');
    E('S.party.autoField = false; charRec("tobin").lv = charRec("wren").lv = charRec("kestrel").lv = 90');
    E('setField(["tobin","wren","kestrel"])');
    E('S.camp.open = true; S.camp.b.hearth = 8; S.camp.b.maproom = 5; S.camp.b.tavern = 1');
    return g;
  };
  const g = mk(71), E = s => g.eval(s);
  const H = 3600 * 1000;
  assert(E('expedOpen() && expedSlots() === 3 && expedLengths().join() === "1,4,8,12" && expedRoutes().length === 18'), 'Map Room 5: 3 slots, 1h to 12h, all 18 Region 1 routes open at zone 36');
  E('S.camp.b.maproom = 1'); assert(E('expedSlots() === 1 && expedLengths().join() === "1,4"'), 'Map Room 1: 1 slot, 1h and 4h');
  E('S.camp.b.maproom = 0'); assert(!E('expedOpen()') && !E('expedSend("r1a", ["pip"], 1)'), 'no Map Room: closed, nothing sends');
  E('S.camp.b.maproom = 5');
  E('S.maxZone = 10'); assert(E('expedRoutes().every(r => EXPED_ROUTES[r].b === 1)') && !E('expedSend("r3a", ["pip"], 1)'), 'a band opens only after its last boss');
  E('S.maxZone = 36');
  // fielded characters are blocked
  assert(!E('expedSend("r1a", ["wren"], 4)') && /in the party/.test(E('expedCan("r1a", ["wren"], 4).why')), 'a fielded character cannot go');
  // grade shown before sending = grade stored
  const team = JSON.parse(E('JSON.stringify(expedBest("r3a"))'));
  const pv = JSON.parse(E(`JSON.stringify(expedPreview("r3a", ${JSON.stringify(team)}, 8))`));
  const s1 = JSON.parse(E(`JSON.stringify(expedSend("r3a", ${JSON.stringify(team)}, 8))`) || 'null');
  assert(s1 && s1.grade === pv.grade.g && E('EXPED_GRADES[S.exped.slots[0].grade].n') === pv.grade.name, `the grade matches the preview (${pv.grade.name}, team ${team.join(', ')})`);
  assert(team.every(id => E(`campStatus("${id}").status`) === 'exped' && !E(`campFree("${id}")`)), 'the team shows "exped" on the Roster board and is not free');
  assert(!E(`expedSend("r1a", ["${team[0]}"], 1)`), 'a character out on one route cannot go on another');
  // preview amounts match the fixed haul (floor or ceil of the expected value)
  const fam = s1.pay.mats.map(m => m[2]), exp = pv.lines.filter(l => l.k === 'mat').map(l => l.n);
  assert(fam.length === exp.length && fam.every((n, i) => n === Math.floor(exp[i]) || n === Math.ceil(exp[i])), `haul fixed at send matches the preview (${fam.join(', ')} vs ${exp.map(x => x.toFixed(1)).join(', ')})`);
  // not back yet: no collect; the timer runs offline (away phase collects)
  assert(E('expedCollect(0)') === null, 'no Collect before the timer ends');
  const before = JSON.parse(E('JSON.stringify(S.mats)'));
  g.setNow(g.clock + 8 * H + 1000);
  E('globalThis.__eb = []; on("expedBack", p => globalThis.__eb.push(p))');
  const r = JSON.parse(E('JSON.stringify(awayGains(8 * 3600 + 1))'));
  const gained = s1.pay.mats.every(([f, t, n]) => E(`S.mats.${f}[${t - 1}]`) - before[f][t - 1] >= n);
  assert(E('S.exped.slots.length') === 0 && gained && E('globalThis.__eb.length') === 1 && E('S.exped.done.r3a') === 1, 'finished while the game was closed: paid on load, team freed, expedBack fired');
  assert(r.extra.some(l => /Expedition back: Wraithmarsh Reeds/.test(l.txt)), 'the away card lists the expedition');
  // the same seed pays the same haul, open or closed
  const runOnce = (closed) => {
    const h = mk(72), X = s => h.eval(s);
    X('S.exped.seq = 40'); X('Math.random = () => 0.5');
    const s = JSON.parse(X('JSON.stringify(expedSend("r2b", ["hesketh", "pip", "thessaly"], 4))'));
    h.setNow(h.clock + 4 * H + 5);
    if (closed) h.fn.awayGains(4 * 3600); else { for (let i = 0; i < 12; i++) h.fn.tick(0.1); X('expedCollect(0)'); }
    return JSON.stringify([s.seed, X('JSON.stringify(S.exped.log[0].haul)')]);
  };
  assert(runOnce(false) === runOnce(true), 'same seed: identical haul with the game open or closed');
  // open game: a finished run waits for Collect (no failure: Fair still pays)
  E('S.exped.log = []');
  E('expedSend("r4a", ["hesketh"], 1)');
  const fairG = E('S.exped.slots[0].grade');
  g.setNow(g.clock + 1 * H + 2000); for (let i = 0; i < 12; i++) g.fn.tick(0.1);
  assert(E('S.exped.slots.length') === 1 && E('topGoals(60, { sticky: false }).some(x => x.id === "exped-ready")'), 'open game: the run waits; Next Up says "ready to collect"');
  const c = JSON.parse(E('JSON.stringify(expedCollect(0))'));
  assert(fairG === 0 && c && c.haul.mats.reduce((a, m) => a + m[2], 0) > 0, `a Fair run still brings something home (${c && expedHaulText_(c)})`);
  function expedHaulText_(x) { return E(`expedHaulText(${JSON.stringify(x.haul)})`); }
  // Next Up timer
  E('expedSend("r1a", ["hesketh"], 4)');
  assert(E('topGoals(60, { sticky: false }).some(x => x.id === "exped-timer" && /back in/.test(x.label))'), 'Next Up: "Expedition back in <time>"');
  E('S.exped.slots = []');
  // repeats: at most 3 runs in a row, even over a long absence
  E('expedSend("r1a", ["hesketh", "pip"], 1); expedRepeat(0, true)');
  g.setNow(g.clock + 10 * H);
  const d0 = E('S.exped.done.r1a || 0');
  g.fn.awayGains(10 * 3600);
  assert(E('(S.exped.done.r1a || 0)') - d0 === 3 && E('S.exped.slots.length') === 0, `Repeat: 3 runs in a row while away, then the team comes home (${E('(S.exped.done.r1a || 0)') - d0} runs)`);
  E('S.camp.b.maproom = 4'); E('expedSend("r1a", ["hesketh"], 1)'); assert(!E('expedRepeat(0, true)'), 'Repeat needs Map Room 5');
  E('S.exped.slots = []; S.camp.b.maproom = 5');
  // call back: half the haul for the time spent, no bonus rolls
  E('expedSend("r1a", ["hesketh", "pip", "bram"], 8)');
  const full = E('S.exped.slots[0].pay.mats.reduce((a, m) => a + m[2], 0)');
  g.setNow(g.clock + 4 * H);
  const rc = JSON.parse(E('JSON.stringify(expedRecall(0))'));
  const got = rc.haul.mats.reduce((a, m) => a + m[2], 0);
  g.setNow(g.clock + 12 * H);
  assert(E('S.exped.slots.length') === 0 && got <= Math.ceil(full * 0.25) + 1 && got >= Math.floor(full * 0.25) - 2, `Call back at half time pays a quarter (${got} of ${full})`);
  // XP is capped at party level - 5
  E('charRec("hesketh").lv = Math.floor(partyLevel()) - 6; charRec("hesketh").xp = 0; charRec("hesketh").rank = 7');
  E('S.exped.slots = []; expedSend("r2d", ["hesketh"], 12)');
  g.setNow(g.clock + 30 * H); g.fn.awayGains(3600);
  assert(E('charRec("hesketh").lv') <= E('Math.floor(partyLevel()) - 5') && E('charRec("hesketh").lv') >= E('Math.floor(partyLevel()) - 6'), `expedition XP stops at party level - 5 (Hesketh ${E('charRec("hesketh").lv')}, party ${E('partyLevel().toFixed(1)')})`);
  // shortcuts: token rolls, Kingslayer credit, Renown through the unlock API
  const h = mk(73), X = s => h.eval(s);
  X('globalThis.__tok = []; on("token", p => globalThis.__tok.push(p)); globalThis.__ks = 0; on("kingslayerCredit", p => globalThis.__ks += p.n)');
  const ren0 = X('renown()');
  assert(!X('expedCan("r5d", ["oriel"], 8).ok') && /Aldric/.test(X('expedCan("r5d", ["oriel"], 8).why')), 'The Hollow Court needs Aldric');
  X('expedSend("r3b", ["maren", "pip"], 12)');
  X('expedSend("r5d", ["aldric", "oriel", "thessaly"], 8)');
  const tokPlanned = X('S.exped.slots[0].pay.tok');
  X('expedSend("r1c", ["hesketh", "anselm"], 12)');
  h.setNow(h.clock + 13 * H); h.fn.awayGains(13 * 3600);
  const toks = JSON.parse(X('JSON.stringify(globalThis.__tok)'));
  assert(tokPlanned > 0 && toks.length >= 1 && toks.every(t => t.id === 'grenna') && (X('S.party.unlock.tokens.grenna.miss') > 0 || X('isRecruited("grenna")')), `Quarry Night Shift rolls Grenna's token through unlockTokenRoll (${toks.length} rolls${X('isRecruited("grenna")') ? ', won' : ''})`);
  assert(X('globalThis.__ks') > 0 && X('S.party.unlock.ks') === X('globalThis.__ks') && X('S.exped.court') === X('globalThis.__ks'), `The Hollow Court credits Kingslayer (${X('S.party.unlock.ks')})`);
  assert(X('renown()') > ren0 && X('Object.values(S.exped.lore).some(q => q > 0)'), `Lore routes add Renown (+${X('renown()') - ren0}) and Lore`);
  X('S.exped.court = 48; S.party.unlock.ks = 48; S.exped.slots = []; expedSend("r5d", ["aldric", "oriel"], 8)');
  h.setNow(h.clock + 30 * H); h.fn.awayGains(3600);
  assert(X('S.exped.court') === 50 && X('S.party.unlock.ks') === 50, 'Kingslayer credit stops at 50');
  // Almanac hooks: Fair Winds raises the haul at send; the weekly counters hear the events
  const w = mk(74), W = s => w.eval(s);
  const base = W('expedPreview("r1a", ["hesketh", "pip"], 4).lines[0].n');
  W('almanac.force("fairWinds")');
  const fw = W('expedPreview("r1a", ["hesketh", "pip"], 4).lines[0].n');
  assert(Math.abs(fw / base - 1.3) < 1e-9, 'Fair Winds: +30% for teams sent that day (mod expHaul)');
  const bad = badNumbers(E('S')).concat(badNumbers(X('S')));
  assert(!bad.length, 'no NaN in the expedition state' + (bad.length ? ': ' + bad[0] : ''));
  const errs = g.errors.concat(h.errors, w.errors);
  assert(!errs.length, 'no expedition errors' + (errs.length ? ': ' + errs[0] : ''));
  // old saves get the defaults and round-trip
  for (const f of ['save-v2.json', 'save-mid-v2.json', 'save-v2-late.json', 'save-a-v1.json']) {
    const raw = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
    const go = loadCore({ seed: 5, storage: memoryStorage({ [KEY]: raw }) });
    const def = go.eval('S.exped.v === 1 && S.exped.slots.length === 0 && S.exped.log.length === 0 && S.exped.court === 0 && S.exped.seq === 0');
    for (let i = 0; i < 12; i++) go.fn.tick(0.1);
    const cs = go.eval('JSON.stringify(S.exped)'); go.eval('save(); loadSave()');
    const rt = go.eval('JSON.stringify(S.exped)') === cs;
    assert(def && rt && !go.errors.length, `${f}: empty expeditions by default, round trip keeps S.exped`);
  }
} catch (e) { fail('expeditions crashed: ' + (e.stack || e)); }




// ---- codex and Lantern Light (57c-codex.js) ----
console.log('codex');
try {
  const FIX = ['save-v2.json', 'save-mid-v2.json', 'save-v2-late.json', 'save-a-v1.json'];
  const ticks = (g, n) => { for (let i = 0; i < n; i++) g.fn.tick(0.1); };
  const recompute = g => g.eval('Math.floor(codexPages().filter(p => !p.locked).reduce((a, p) => a + p.pts, 0) / 2)');
  // new game: defaults, nothing earned, no toast
  const g = loadCore({ seed: 21 }), E = s => g.eval(s);
  assert(E('S.codex.v === 1 && S.codex.init === false && S.codex.lightMax === 0 && Object.keys(S.codex.rec).join() === "champ,aff,mw,syn,mat,dare"'), 'new game: codex defaults');
  const toasts = []; g.fn.on('toast', t => toasts.push(t.msg));
  ticks(g, 25);
  assert(E('S.codex.init') && E('codexLight()') <= 1 && !toasts.some(t => /Codex/.test(t)), `new game: first load credits only today's Omen (${E('codexLight()')}) and stays quiet`);
  assert(E('codexPage("deepwell").locked && codexPage("wardrobe").locked && codexPage("deepwell").lightMax === 0'), 'Deepwell and Wardrobe pages are locked until the Deepwell exists');
  const maxL = E('codexPages().filter(p => !p.locked).reduce((a, p) => a + p.lightMax, 0)');
  assert(maxL > 800 && maxL < 1105, `Region 1 Light available today: ${maxL} (spec 1,105 with every system)`);
  // old saves: defaults, one-time retro credit, exact against a fresh computation, twice
  for (const f of FIX) {
    const raw = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
    const lights = [];
    for (let k = 0; k < 2; k++) {
      const o = loadCore({ seed: 5, storage: memoryStorage({ [KEY]: raw }) });   // F1: one seed, so 25 s of kills (bestiary tiers) match
      const tt = []; o.fn.on('toast', t => tt.push(t.msg));
      const def = o.eval('S.codex.v === 1 && !S.codex.init && S.codex.title === null');
      ticks(o, 25);
      const L = o.eval('codexLight()'), fresh = recompute(o);
      lights.push(L);
      if (k === 0) {
        const retro = tt.filter(t => /Codex holds \d+ Lantern Light/.test(t)).length;
        assert(def && o.eval('S.codex.init') && L === fresh && L > 0 && retro === 1 && !o.errors.length, `${f}: backfilled ${L} Lantern Light = a fresh computation, one retro toast` + (o.errors.length ? ': ' + o.errors[0] : ''));
        const cs = o.eval('JSON.stringify(S.codex)'); o.eval('save(); loadSave()');
        assert(o.eval('JSON.stringify(S.codex)') === cs && o.eval('codexLight()') === L, `${f}: round trip keeps S.codex`);
      }
    }
    assert(lights[0] === lights[1], `${f}: the same Light on a second load (${lights.join(' = ')})`);
  }
  // recorders: affixes and Masterwork on arrival, synergies, harvest, trophies, champions
  E('emit("itemAdded", { item: { id: 9999, slot: "bow", t: 3, r: "rare", plus: 0, a: [["pierce", 0.5], ["hp", 0.2]], mw: 2 } })');
  assert(E('S.codex.rec.aff.pierce === 4 && S.codex.rec.aff.hp === 4 && S.codex.rec.mw[2] === 1'), 'itemAdded records affix tiers (bitmask) and the Masterwork line');
  E('emit("synergyChange", { active: ["dusk"], gained: ["dusk"], lost: [] }); emit("harvest", { kind: "herb", t: 2, n: 1 }); emit("trophy", { i: 3, n: 1, source: "boss" })');
  E('emit("kill", { mob: { key: "golem3", champ: true }, zone: 20, gold: 0, ess: 0, tier: 4 })');
  assert(E('!!S.codex.rec.syn.dusk && S.codex.rec.mat.herb === 2 && !!(S.codex.rec.mat.troph & 8) && !!S.codex.rec.champ.golem'), 'synergies, materials, trophies and champion kills are recorded');
  // Lantern Light only rises
  E('S.mastery.types.slime = 10000; S.found.sproutblade = 2'); ticks(g, 55);
  const L1 = E('codexLight()');
  assert(L1 > 0 && E('S.codex.lightMax') === L1, `events raise Light within the refresh window (${L1})`);
  E('S.found = {}; S.mastery.types = {}; S.mats.herb = [0, 0, 0, 0, 0]'); E('codexRefresh(true)');
  assert(E('codexLight()') === L1 && E('S.codex.rec.mat.herb') === 2, 'Light never goes down (items lost, materials spent)');
  let rises = true, prev = E('codexLight()');
  for (let i = 0; i < 6; i++) { E(`S.mastery.zones[${i + 1}] = 3000; S.maxZone = Math.max(S.maxZone, ${i + 3}); codexRefresh(true)`); const n = E('codexLight()'); if (n < prev) rises = false; prev = n; }
  assert(rises && prev > L1, `Light only rises as pages fill (${L1} -> ${prev})`);
  // Blessing gate: a Blessing opens when its page reaches 50%, and stays open
  const b = loadCore({ seed: 22 }), B = s => b.eval(s); ticks(b, 25);
  B('S.camp.open = true; S.camp.b.shrine = 1');
  assert(!B('blessOpen("blade")') && !B('blessToggle("blade")'), 'Blade Blessing closed while the Bestiary is under 50%');
  const bt = []; b.fn.on('toast', t => bt.push(t.msg));
  B('for (const t of TYPES) S.mastery.types[t.key] = 1000; S.maxZone = 8; codexRefresh(true)');
  assert(B('codexPage("bestiary").pct') >= 0.5 && B('blessOpen("blade")') && bt.some(t => /Blade Blessing is open/.test(t)), `Bestiary at ${Math.round(B('codexPage("bestiary").pct') * 100)}%: Blade opens, with a toast`);
  B('S.mastery.types = {}; codexRefresh(true)');
  assert(B('blessOpen("blade")') && !B('blessOpen("coin")'), 'an opened Blessing stays open; others stay closed');
  // milestones: rewards, the expedition slot, titles
  const s0 = B('bonus("expSlots")');
  B('S.codex.lightMax = 205; codexRefresh(true)');
  assert(B('[25, 50, 75, 100, 150, 200].every(k => S.codex.got[k]) && !S.codex.got[250]') && B('codexHas("expslot") && codexExact()'), 'milestones up to 200 granted; exact hints on');
  assert(B('bonus("expSlots")') === s0 + 1 && B('bonus("bag")') === 0, '+1 expedition slot at 200 Light; Bag +10 waits for 350');
  assert(!B('codexSetTitle("t_keeper")') && B('codexSetTitle("t_lamplighter") && codexTitle() === "Lamplighter"') && B('codexSetTitle(null) && codexTitle() === ""'), 'only earned titles can be picked; None always');
  // Seal bonuses are tiny and capped per stat, forever
  assert(B('Object.keys(CODEX_CAP).every(k => CODEX_CAP[k] <= 0.05)') && B('Object.values(CODEX_PAGES).filter(p => p.seal && p.seal.key).every(p => p.seal.v <= 0.03)'), 'every Seal is 3% or less; every cap is 5%');
  const d0 = B('mod("dmg")');
  B('CODEX_PAGES.xa = { id: "xa", n: "Test A", seal: { key: "dmg", v: 0.04, txt: "" }, title: "A", tiles: () => [{ key: "a", n: "a", got: 1, max: 1, pts: 2, ptsMax: 2 }] }; CODEX_PAGES.xb = Object.assign({}, CODEX_PAGES.xa, { id: "xb" }); CODEX_PAGE_IDS.push("xa", "xb")');
  B('for (const t of TYPES) { S.mastery.types[t.key] = 1e5; S.craft.troph[TYPES.indexOf(t)] = 1; } S.codex.rec.champ = Object.fromEntries(TYPES.map(t => [t.key, 1])); S.maxZone = 40; codexRefresh(true)');
  assert(B('!!(S.codex.seal.bestiary && S.codex.seal.xa && S.codex.seal.xb)') && Math.abs(B('codexBonus("dmg")') - 0.05) < 1e-12, 'Seal bonuses add up but stop at the 5% cap (dmg 0.02 + 0.04 + 0.04 -> 0.05)');
  assert(Math.abs(B('mod("dmg")') / d0 - 1.05) < 1e-9, 'mod("dmg") carries exactly the capped Codex bonus');
  B('delete CODEX_PAGES.xa; delete CODEX_PAGES.xb; CODEX_PAGE_IDS.splice(CODEX_PAGE_IDS.indexOf("xa"), 2)');
  // performance: with no events, ticks do not recompute the pages
  const q = loadCore({ seed: 24 }), Q = s => q.eval(s); ticks(q, 25);
  Q('S.activity = "raid"; globalThis.__pg = codexPages()'); ticks(q, 60);
  assert(Q('codexPages() === globalThis.__pg'), 'no events, no recompute (the page cache is reused)');
  // away: quiet, then a line on the card
  const w = loadCore({ seed: 23 }), W = s => w.eval(s); ticks(w, 25);
  W('chooseClass("warden"); S.maxZone = S.zone = 12');
  const wt = []; w.fn.on('toast', t => wt.push(t.msg));
  W('for (const t of TYPES) S.mastery.types[t.key] = 1000'); const r = w.fn.awayGains(3600);
  assert(!wt.some(t => /Codex|Lantern/.test(t)) && r.extra.some(l => /Codex/.test(l.txt)), 'away: no Codex toasts; the away card lists the Codex news');
  const errs = g.errors.concat(b.errors, w.errors, q.errors);
  assert(!errs.length, 'no codex errors' + (errs.length ? ': ' + errs[0] : ''));
} catch (e) { fail('codex crashed: ' + (e.stack || e)); }

// ---- the Deepwell (57d-deepwell.js) ----
console.log('deepwell');
try {
  const FIX = ['save-v2.json', 'save-mid-v2.json', 'save-v2-late.json', 'save-a-v1.json'];
  const rawOf = f => fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
  const ticks = (g, n, dt = 0.1) => { for (let i = 0; i < n; i++) g.fn.tick(dt); };
  const errs = [];
  // new game and old saves: defaults, no run, locked until zone 20 (and Hearth 3)
  const n0 = loadCore({ seed: 31 }), N = s => n0.eval(s);
  assert(N('S.deep.v === 1 && S.deep.run === null && S.deep.marks === 0 && S.deep.trial.week === -1 && !deepUnlocked() && arena === null'), 'new game: S.deep defaults, no run, locked');
  assert(N('DW.start(false)') === false && N('S.deep.run') === null, 'a locked Deepwell cannot start a run');
  errs.push(...n0.errors);
  for (const f of FIX) {
    const o = loadCore({ seed: 32, storage: memoryStorage({ [KEY]: rawOf(f) }) });
    const d = o.eval('JSON.stringify(S.deep)'), keys = o.eval('Object.keys(S.deep).join()');
    assert(o.eval('S.deep.run === null && S.deep.best === 0 && S.deep.eq.lantern === null') && keys === 'v,best,marks,marksTotal,lore,cos,pages,trial,seen,runs,run,floors,tips,fav,eq,last', `${f}: gets the Deepwell defaults`);
    o.eval('save(); loadSave()');
    assert(o.eval('JSON.stringify(S.deep)') === d, `${f}: round trip keeps S.deep`);
    errs.push(...o.errors);
  }
  const part = JSON.parse(rawOf('save-v2.json')); part.deep = { v: 1, marks: 57, lore: { breath: 2 } };
  const pg = loadCore({ storage: memoryStorage({ [KEY]: JSON.stringify(part) }) });
  assert(pg.eval('S.deep.marks === 57 && S.deep.lore.breath === 2 && S.deep.trial.week === -1 && S.deep.run === null'), 'a partial S.deep keeps its values and gains the missing fields');

  // a run on the late save, started from Gather
  const g = loadCore({ seed: 33, storage: memoryStorage({ [KEY]: rawOf('save-v2-late.json') }) }), E = s => g.eval(s);
  E('chooseClass("warden")'); ticks(g, 30);
  E('S.camp.b.hearth = 2'); assert(!E('deepUnlocked()'), 'zone 38 but Hearth 2: still locked');
  E('S.camp.b.hearth = 3'); assert(E('deepUnlocked()'), 'zone 20+ and Hearth 3: open');
  g.fn.setActivity('gather'); ticks(g, 5);
  const main = () => E('JSON.stringify([S.gold, S.totalGold, S.xp, S.L, S.totalKills, S.maxZone, S.zone, S.kills, S.mats, S.items.length, S.found, S.comp])');
  const before = main(), dps0 = E('totalDps()');
  const kills = []; g.fn.on('kill', () => kills.push(1));
  assert(E('DW.start(false)') && E('S.activity') === 'fight' && E('DW.run().act') === 'gather' && E('arena === DEEP_ARENA') && E('mob.deep && mob.floor === 1'), 'start: the arena supplies floor 1; your own activity (gather) is kept in the run');
  assert(E('DW.run().oil') === 60 && E('DW.oilMax()') === 120, 'starting Oil 60s, most Oil 120s');
  // Oil drains while a foe stands
  E('mob.hp = mob.max * 1e6; mob.max = mob.hp'); const o0 = E('DW.run().oil'); ticks(g, 20);
  assert(Math.abs(o0 - E('DW.run().oil') - 2) < 0.05, `Oil drains 1 per second while a foe stands (${(o0 - E('DW.run().oil')).toFixed(2)} in 2s)`);
  // clear the floor: 3 foes
  let guard = 0;
  // (Stage C: a Rattlebones may get back up once, so count the Oil from the last strike.)
  let oLast = o0 - 2;
  while (E('DW.run().phase') === 'fight' && guard++ < 10) { oLast = E('DW.run().oil'); E('mob.hp = 1; strike(10, "#fff")'); ticks(g, 6); }
  assert(E('DW.run().phase') === 'draft' && E('DW.run().top') === 1 && E('DW.run().floor') === 2, 'three kills clear floor 1 and open the draft');
  const rf = E('DW.refundFor("normal")');
  assert(Math.abs(E('DW.run().oil') - (oLast + rf)) < 1 && rf === 15 + E('DEEP_COMBAT_TUNE.refund'), `a normal floor refunds ${rf}s of Oil (15s, +5s with party combat)`);
  const offer = E('DW.offerView().cards.map(c => c.id)');
  assert(offer.length === 3 && new Set(offer).size === 3, `the draft offers 3 different boons (${offer.join(', ')})`);
  assert(E('DW.reroll()') && E('DW.run().rr') === 0 && !E('DW.reroll()'), 'one reroll a run; then none');
  const pickId = E('DW.offerView().cards[0].id');
  assert(E(`DW.pick("${pickId}")`) && E(`DW.run().boons["${pickId}"]`) === 1 && E('DW.run().phase') === 'fight' && E('mob.floor') === 2, `picking ${pickId} starts floor 2`);
  assert(!kills.length, 'arena kills fire no kill event');
  assert(main() === before, 'main progress is untouched while below (gold, XP, zones, kills, materials, items)');
  // the boon modifiers work only while a run is live
  E('DW.run().boons.whet = 3'); const m1 = E('mod("dmg")');
  // resume after reload: save mid-floor, reload
  E('DW.run().oil -= 5'); const oilStart = E('DW.run().oilAtStart'), boons = E('JSON.stringify(DW.run().boons)');
  E('save()');
  const g2 = loadCore({ seed: 34, storage: memoryStorage({ [KEY]: g.storage.get(KEY) }) }), E2 = s => g2.eval(s);
  assert(E2('!!S.deep.run && S.deep.run.paused && S.deep.run.floor === 2 && S.activity === "gather" && arena === null'), 'reload: the run is kept, paused on floor 2; your activity is gather again');
  assert(E2('S.deep.run.oil') === oilStart && E2('JSON.stringify(S.deep.run.boons)') === boons, 'reload: Oil is back to what the floor began with, boons kept');
  E2('chooseClass("warden")');
  assert(E2('DW.resume()') && E2('S.activity === "fight" && arena === DEEP_ARENA && mob.deep && mob.floor === 2 && DW.run().oil === DW.run().oilAtStart'), 'resume: the same floor restarts with the same Oil');
  errs.push(...g2.errors);
  // climb out: only between floors; marks paid; activity back; away credit for the time below
  assert(E('DW.climbOut()') === null && !!E('DW.run()'), 'no climbing out mid-floor');
  guard = 0; while (E('DW.run().phase') === 'fight' && guard++ < 10) { E('mob.hp = 1; strike(10, "#fff")'); ticks(g, 6); }
  const exp = E('DW.marksNow()'), secs = E('DW.run().secs');
  let endEv = null; g.fn.on('deepEnd', p => { endEv = p; });
  const sum = E('DW.climbOut()');
  assert(sum && sum.reason === 'leave' && E('S.deep.run') === null && E('S.activity') === 'gather' && E('arena') === null, 'climb out: the run ends and gather resumes');
  assert(E('S.deep.marks') === exp && exp > 0 && E('S.deep.best') === 2 && E('S.deep.runs') === 1, `climb out pays ${exp} Depth Marks and sets the best floor`);
  assert(endEv && endEv.away && Math.abs(endEv.away.secs - secs) < 1e-6 && endEv.away.t > 0, `the ${secs.toFixed(1)}s below are credited as away gains`);
  assert(E('mod("dmg")') < m1 && Math.abs(E('totalDps()') / dps0 - 1) < 0.25, 'boons stop when the run ends');
  // Oil runs out
  E('S.deep.marks = 0'); E('DW.start(false)'); E('DW.run().oil = 0.3; mob.hp = mob.max = 1e30'); ticks(g, 5);
  assert(E('S.deep.run') === null && E('S.deep.last.reason') === 'oil', 'out of Oil ends the run');
  // the shop: Marks buy only Deepwell things; nothing touches power outside a run
  assert(E('Object.values(DEEP_SHOP).every(x => ["lore", "look", "title", "page"].includes(x.cat))'), 'the shop sells Deep Lore, looks, titles and Lore pages only');
  E('S.deep.marks = 1e6; S.deep.best = 50'); const dA = E('totalDps()'), gA = E('goldMult()');
  let bought = 0; for (let i = 0; i < 80; i++) { const id = E('(DW.shop().find(r => r.can) || {}).id'); if (!id) break; if (E(`DW.buy("${id}")`)) bought++; }
  assert(bought > 30 && E('S.deep.lore.breath') === 5 && E('S.deep.pages') === 10 && !E('DW.buy("nope")'), `bought all ${bought} shop rows`);
  assert(E('totalDps()') === dA && E('goldMult()') === gA, 'a full Deep Lore changes nothing outside the Deepwell (dps, gold)');
  assert(E('codexTitles().some(t => t.id === "dt_walker" && t.got)') && E('codexSetTitle("dt_walker") && codexTitle() === "Wellwalker"'), 'bought titles are picked in the Codex');
  E('codexRefresh(true)');
  assert(!E('codexPage("deepwell").locked') && E('codexPage("deepwell").tiles.filter(t => t.grp === "Deep Lore").every(t => t.got)'), 'the Codex Deepwell page opens and shows the bought Lore pages');
  E('DW.start(false)'); assert(Math.abs(E('DW.run().oil') - Math.min(150, 60 + 50 + E('bonus("deepOil")'))) < 1e-9 && E('DW.run().rr') >= 4 && E('DW.run().ban') === 2 && E('DW.oilMax()') === 150, 'Deep Lore works below: Oil, rerolls, banish, Deep Pockets');
  const gS = E('S.gold + S.totalKills'); ticks(g, 30);
  assert(E('S.gold + S.totalKills') === gS && E('!mob || mob.dead'), 'a run that opens on a draft sets the zone foe aside (no gold, no kills)');
  assert(E('DW.run().floor') === 11 && E('DW.run().phase') === 'draft' && E('DW.run().queue.length') === 1 && E('DW.run().top') === 10, 'Lantern Stair II: starts on floor 11 after two Common picks, floors 1-10 paid');
  assert(E('DW.offerView().cards.every(c => c.r === "c")'), 'the Stair picks offer Commons');
  guard = 0; while (E('DW.run().phase') !== 'fight' && guard++ < 5) E('DW.pick(DW.offerView().cards[0].id)');
  E('DW.abandon()'); // mid-floor: refused
  assert(E('DW.run().phase') === 'fight' && E('DW.run().floor') === 11, 'no abandoning mid-floor while live');
  errs.push(...g.errors);
  // the weekly Trial: seeded by the week, same offers and foes for everyone
  const tA = loadCore({ seed: 35, storage: memoryStorage({ [KEY]: rawOf('save-v2-late.json') }) });
  const tB = loadCore({ seed: 99, storage: memoryStorage({ [KEY]: rawOf('save-v2-late.json') }) });
  const trialOf = t => { const X = s => t.eval(s); X('chooseClass("ranger"); S.camp.b.hearth = 3'); ticks(t, 5); X('DW.start(true)');
    let gg = 0; while (X('DW.run().phase') === 'fight' && gg++ < 10) { X('mob.hp = 1; strike(10, "#fff")'); ticks(t, 6); }
    return X('JSON.stringify([DW.run().seed, DW.run().rule, DW.offerView().cards.map(c => c.id), DW.floorFoes(7), DW.run().rr])'); };
  const a = trialOf(tA), b = trialOf(tB);
  assert(a === b, 'the Trial gives the same seed, rule, foes and offers on two saves in the same week');
  assert(tA.eval('DW.run().trial && DW.oilMax() === (DW.run().rule === "glass" ? 60 : DW.run().rule === "drought" ? 150 : 120)'), 'the Trial ignores Deep Lore');
  const rules = tA.eval('Array.from({ length: 12 }, (_, i) => DW.trialRule(24 + i).id)');
  assert(new Set(rules).size === 12 && tA.eval('DW.trialRule(40).id') === tA.eval('DW.trialRule(40).id'), 'every rule once in each 12-week cycle; the same week always gives the same rule');
  // a Trial from an earlier week is scored on resume
  tA.eval('DW.run().paused = true; DW.run().week -= 1'); ticks(tA, 12);
  assert(tA.eval('S.deep.run === null && S.deep.last.reason === "closed"'), 'a Trial run from an earlier week is scored');
  errs.push(...tA.errors, ...tB.errors, ...pg.errors);
  assert(!errs.length, 'no deepwell errors' + (errs.length ? ': ' + errs[0] : ''));
} catch (e) { fail('deepwell crashed: ' + (e.stack || e)); }

// ---- the Deepwell on party combat (59c-deepwell-combat.js; plan-2 W6, plan-3 W6b; deepwell.md 8.2) ----
console.log('deepwell combat');
try {
  const FIX = ['save-v2.json', 'save-mid-v2.json', 'save-v2-late.json', 'save-a-v1.json'];
  const rawOf = f => fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
  const ticks = (g, n, dt = 0.1) => { for (let i = 0; i < n; i++) g.fn.tick(dt); };
  const errs = [];
  for (const f of FIX) {
    const o = loadCore({ seed: 41, storage: memoryStorage({ [KEY]: rawOf(f) }) });
    const ok0 = o.eval('S.deepCombat.tip === 0 && Object.keys(S.deepCombat).join() === "tip" && S.deep.run === null');
    o.eval('save(); loadSave()');
    assert(ok0 && o.eval('S.deepCombat.tip === 0'), `${f}: gets S.deepCombat { tip: 0 } and keeps it on a round trip`);
    errs.push(...o.errors);
  }
  // A Ranger (not a tank) with Tobin (tank) and Wren (striker) on the late save (F1: the hero is the third).
  const setup = (seed, storage) => {
    const g = loadCore({ seed, storage: storage || memoryStorage({ [KEY]: rawOf('save-v2-late.json') }) }), E = s => g.eval(s);
    if (!storage) {
      E('chooseClass("ranger"); S.camp.b.hearth = Math.max(3, S.camp.b.hearth)');
      E('for (const id of ["tobin", "hesketh", "wren"]) if (!charRec(id)) unlockChar(id, "test", true)');
      E('S.party.autoField = false; setField(["tobin", "wren"])');
    }
    E('COMBAT_TUNE.regen = 0');
    ticks(g, 30);
    return { g, E };
  };
  const clearPack = E => E('combatFoes().forEach(f => { for (let i = 0; i < 3 && f.hp > 0 && !f.dead; i++) cbDamageFoe(f, f.hp + 1, -1, "magic"); })');
  const heroF = E => E('cbUnitByKey("hero").hp / cbUnitByKey("hero").maxHp');
  const { g, E } = setup(42);
  const up = () => E('combatUnits().filter(u => u.live).length');
  assert(E('DW.start(false)') && E('DW.run().floor === 1 && DW.floorKind(1) === "normal"'), 'a run starts on floor 1');
  assert(E('combatFoes().filter(f => f.deep && !f.dead && f.hp > 0).length') === 3 && E('combatFoes().every(f => f.deep && f.run === DW.run().id)'), 'a normal floor is one pack: its 3 foes fight at once');
  assert(up() >= 2 && E('S.deepCombat.tip') === 1, `the fielded party fights below (${up()} members); the HP tip shows once`);
  // HP carries: the hero at 50%, the floor cleared: the pack heal and the floor heal, no more
  E('combatFoes().forEach(f => f.atk = 0); cbUnitByKey("hero").hp = cbUnitByKey("hero").maxHp * 0.5');
  clearPack(E); ticks(g, 2);
  const hf = heroF(E), expHf = 0.5 + E('COMBAT_TUNE.packHealF') + E('DEEP_COMBAT_TUNE.floorHeal');
  assert(E('DW.run().phase') === 'draft' && Math.abs(hf - expHf) < 0.01, `a cleared floor heals a little: hero 50% -> ${(100 * hf).toFixed(0)}% (${(100 * expHf).toFixed(0)}% expected)`);
  assert(Math.abs(E('DWC.hpAt().hero') - hf) < 0.001, 'the run keeps the HP each member starts the next floor with');
  E('DW.pick(DW.offerView().cards[0].id)');
  const hf2 = heroF(E);
  assert(E('DW.run().floor') === 2 && E('mob.deep && mob.floor === 2') && Math.abs(hf2 - hf) < 0.01, `HP carries into floor 2 (hero ${(100 * hf2).toFixed(0)}%, not refilled)`);
  // a reload mid-floor: the floor restarts with the HP (and Oil) it began with
  E('combatUnits().forEach(u => { if (u.live) u.hp = u.maxHp * 0.2; }); save()');
  const r2 = setup(43, memoryStorage({ [KEY]: g.storage.get(KEY) }));
  r2.E('chooseClass("ranger")');
  assert(r2.E('DW.resume()') && r2.E('mob.deep && mob.floor === 2'), 'resume: floor 2 restarts');
  const hf3 = heroF(r2.E);
  assert(Math.abs(hf3 - hf) < 0.02, `resume: the hero starts floor 2 at ${(100 * hf3).toFixed(0)}% (as saved when the floor began)`);
  errs.push(...r2.g.errors);
  // Oil: refunds are higher; a parry gives Oil back
  assert(E('DW.refundFor("boss")') === 35 + E('DEEP_COMBAT_TUNE.refund'), 'Oil refunds are 5s higher with party combat');
  // the [C] boons
  const B = s => E('DW.run().boons.' + s);
  const mh0 = E('cbUnitByKey("tobin").maxHp'), mw0 = E('cbUnitByKey("wren").maxHp'); B('iron = 2'); ticks(g, 3);
  assert(Math.abs(E('cbUnitByKey("tobin").maxHp') / mh0 - 1.4) < 0.01 && Math.abs(E('cbUnitByKey("wren").maxHp') / mw0 - 1) < 1e-9, 'Iron Wall II: tanks +40% max HP, others unchanged');
  const hitTank = () => E('(() => { const u = cbUnitByKey("tobin"); u.hp = u.maxHp; u.sh = 0; const a = cbHitUnit(u, u.maxHp * 0.01, "poison", null); u.hp = u.maxHp; return a; })()');
  const t0 = hitTank(); B('thorn = 1'); B('taunt = 1'); ticks(g, 1);
  assert(E('DW.setProgress().find(s => s.id === "guard").on') && Math.abs(hitTank() / t0 - 0.75) < 0.01, 'the Guard set (Thorn Plate, Iron Wall, Taunt Drill): tanks take 25% less');
  const thorn = E('(() => { const f = combatFoes().find(x => !x.dead && x.hp > 0); const u = cbUnitByKey("tobin"); u.hp = u.maxHp; u.sh = 0; const h0 = f.hp; cbHitUnit(u, u.maxHp * 0.01, "poison", f); u.hp = u.maxHp; return h0 - f.hp; })()');
  assert(thorn > 0, 'Thorn Plate: a tank hurts the foe that hits it');
  E('mob.forceU = -1; mob.forceT = 0; mob.ranged = true; classTap({ target: "mob" })');
  assert(E('mob.forceU === cbUnitByKey("tobin").i && mob.forceT > 0.5'), 'Taunt Drill: a Ranger\'s tap makes the front tank taunt');
  const hi0 = E('cbUnitByKey("hero").healIn'); B('dward = 1'); B('mend = 1'); B('life = 1'); ticks(g, 3);
  assert(E('DW.setProgress().find(s => s.id === "mend").on') && Math.abs(E('cbUnitByKey("hero").healIn') / hi0 - 1.3) < 0.01, 'the Mend set (Deep Ward, Mending Light, Lifeline): healing +30%');
  E('cbHitUnit(cbUnitByKey("hero"), 1e300, "poison", null)');
  assert(!E('cbUnitByKey("hero").down') && E('cbUnitByKey("hero").hp') === 1, 'Lifeline: a member who would fall stays at 1 HP');
  E('cbHitUnit(cbUnitByKey("wren"), 1e300, "poison", null)');
  assert(E('cbUnitByKey("wren").down'), 'Lifeline: once a floor for the whole party');
  // Deep Edge (D8): damage below only
  const dm0 = E('mod("dmg")'); E('S.deep.lore.edge = 4');
  assert(Math.abs(E('mod("dmg")') / dm0 - 1.8) < 1e-6 && E('DW.shop("lore").some(r => r.id === "edge" && r.max === 4)'), 'Deep Edge IV: +80% damage below; sold in the Deep Lore shop');
  // a wipe ends the run: the floors cleared count and pay; the party stands up whole above
  const top = E('DW.run().top'), marks = E('DW.marksNow()'), m0 = E('S.deep.marks');
  E('for (let i = 0; i < 4; i++) combatUnits().forEach(u => { if (u.live && !u.down) { u.lifeline = true; cbHitUnit(u, 1e300, "poison", null); } })');
  ticks(g, 2);
  assert(E('S.deep.run === null && S.deep.last.reason === "wipe" && arena === null'), 'a party wipe ends the run (reason "wipe")');
  assert(E('S.deep.last.floor') === top && E('S.deep.best') >= top && E('S.deep.marks') - m0 === marks, `the run's depth counts: floor ${top}, ${marks} Depth Marks paid`);
  assert(E('combatUnits().filter(u => u.live).every(u => !u.down && u.hp === u.maxHp)') && E('combatFoes().every(f => !f.deep)') && E('mod("dmg")') < dm0 * 1.0001, 'back above: the party is whole, no well foe is left, boons and Deep Edge are off');
  assert(E('S.activity') === 'fight' && E('!!mob && !mob.deep'), 'the zone fight resumes');
  // Elder floors: the Deep Elder winds up its telegraphs; a parry gives Oil back
  E('S.deep.lore.edge = 0'); E('DW.start(false)'); ticks(g, 1);
  E('combatFoes().forEach(f => f.atk = 0)'); clearPack(E); ticks(g, 2);
  E('DW.run().floor = 5; DW.run().oil = 100; DW.pick(DW.offerView().cards[0].id)');
  let tele = null; g.fn.on('telegraphStart', p => { if (!tele) tele = { kind: p.kind, deep: !!(p.foe && p.foe.deep) }; });
  E('combatFoes().forEach(f => f.atk = 0)');
  let guard = 0; while (!E('cbTelegraph() && cbTelegraph().left <= cbTelegraph().win - 0.05') && guard++ < 150) ticks(g, 1);
  assert(E('mob.deep && mob.boss && DW.run().floor === 5') && tele && tele.deep, `floor 5: a Deep Elder, and it winds up a telegraph (${tele && tele.kind})`);
  const oilP = E('DW.run().oil'); E('resolveParry("tap")');
  assert(Math.abs(E('DW.run().oil') - Math.min(E('DW.oilMax()'), oilP + E('DEEP_COMBAT_TUNE.parryOil'))) < 1e-9, 'parrying the Elder gives 2s of Oil back');
  E('DW.run().oil = 0.05'); ticks(g, 3);
  assert(E('S.deep.run === null && S.deep.last.reason === "oil" && !cbTelegraph()'), 'Oil still ends a run; no Elder telegraph is left above');
  errs.push(...g.errors);
  assert(!errs.length, 'no deepwell combat errors' + (errs.length ? ': ' + errs[0] : ''));
} catch (e) { fail('deepwell combat crashed: ' + (e.stack || e)); }

// ---- party combat (59-combat.js, 59b-enemies.js; Stage C tasks C1, C2, C3) ----
console.log('combat');
try {
  const rawOf = f => fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
  const secs = (g, s, dt = 0.1) => { for (let i = 0; i < s / dt; i++) g.fn.tick(dt); };
  // A party of these characters at level lv, fielded, on a fresh game of class cls.
  const party = (seed, cls, field, lv) => {
    const g = loadCore({ seed }), E = s => g.eval(s);
    E('almanac.force("none")');
    E(`chooseClass(${JSON.stringify(cls)})`);
    E(`(() => { const f = ${JSON.stringify(field)}; for (const id of f) { unlockChar(id, 'test', true); charRec(id).lv = ${lv}; charRec(id).rank = Math.min(7, Math.floor((${lv} - 1) / 25)); } S.party.autoField = false; setField(f); S.auto = false; S.L = ${lv}; S.blade = ${lv}; })()`);
    return { g, E };
  };
  // the highest zone this party holds (closed form), up to 60
  const holdZone = E => E('(() => { S.maxZone = 60; let b = 1; for (let z = 1; z <= 60; z++) if (partyHoldEstimate(z, { one: true }).holds) b = z; return b; })()');
  const errs = [];

  // on for every save; old saves load with it, keep every field and stay finite
  {
    const g = loadCore({ seed: 1 });
    assert(g.eval('partyCombatOn() && S.combat.on === 1 && S.combat.back === 0'), 'party combat is on for a new game (S.combat.on)');
    for (const f of ['save-v2.json', 'save-mid-v2.json', 'save-v2-late.json', 'save-a-v1.json']) {
      const old = JSON.parse(rawOf(f));
      const h = loadCore({ seed: 2, storage: memoryStorage({ [KEY]: JSON.stringify(old) }) });
      const cmp = JSON.parse(JSON.stringify(old)); if (cmp.party) { delete cmp.party.field; delete cmp.party.cells; }   // the roster migration re-picks the field
      const d = subsetDiff(cmp, JSON.parse(JSON.stringify(h.eval('S'))));
      h.eval('S.activity = "fight"; spawn()'); secs(h, 60);
      const bad = badNumbers(h.eval('S')).concat(badNumbers(h.eval('combatUnits().map(u => [u.hp, u.maxHp, u.sh])')));
      assert(!d && h.eval('partyCombatOn() && S.combat.on === 1') && !bad.length && !h.errors.length, `${f}: loads with party combat on, keeps every field, a minute of fighting stays finite` + (d ? ': ' + d : bad.length ? ': ' + bad[0] : h.errors.length ? ': ' + h.errors[0] : ''));
      errs.push(...h.errors);
    }
  }

  // threat holds on the tank at par (T13), healers heal, packs of 3
  {
    const { g, E } = party(51, 'lanternmage', ['tobin', 'hesketh'], 40);   // F1: two companions; the Lanternmage is the third
    const par = holdZone(E);
    E(`S.maxZone = ${par}; setZone(${par})`);
    assert(E('combatFoes().length') === 3 && E('combatFoes().every(f => f.th && f.max > 0)'), `a pack of 3 foes with threat tables (zone ${par}, the highest this party holds)`);
    E('Object.keys(CB_STATS).forEach(k => CB_STATS[k] = 0)');
    secs(g, 180);
    const st = E('CB_STATS'), share = st.tankSecs / Math.max(1e-9, st.enemySecs);
    assert(share >= 0.85, `threat: the tank holds ${(100 * share).toFixed(0)}% of foe attention at par (T13, want >= 85%)`);
    const hes = E('cbUnitByKey("hesketh")');
    // BAL2: supports also Smite for ROSTER_TUNE.supDps x power, well below a striker.
    const wrenDmg = E('cbUnitByKey("hero").dmg');   // F1: the hero (a real third now, 56e heroStand) in Wren's old place
    assert(st.healed > 0 && hes.healed > 0 && hes.dmg > 0 && hes.dmg < wrenDmg, `Hesketh heals (${E('fmt(cbUnitByKey("hesketh").healed)')} HP in 3 min) and Smites softly (${E('fmt(cbUnitByKey("hesketh").dmg)')} damage, the Lanternmage ${E(`fmt(${wrenDmg})`)})`);
    assert(st.wipes === 0 && st.packs > 10, `no wipe at the zone it holds (${st.packs} packs, ${st.kos} knock-outs)`);
    errs.push(...g.errors);
  }

  // knock-out and stand-up between packs; Elowen's Vigil stands them up at 60%
  for (const [ids, frac] of [[['hesketh', 'wren'], 0.3], [['elowen', 'wren'], 0.6]]) {
    const { g, E } = party(52, 'warden', ids, 20);
    E('S.maxZone = 10; setZone(10)'); secs(g, 1);
    E('cbHitUnit(cbUnitByKey("wren"), 1e30, "hit", null)');
    const down = E('cbUnitByKey("wren").down');
    E('combatFoes().forEach(f => { if (!f.dead) cbDamageFoe(f, 1e30, 1, "magic"); })');
    const u = E('cbUnitByKey("wren")');
    assert(down && !u.down && Math.abs(u.hp / u.maxHp - frac) < 0.01, `a knocked-out member stands up at ${frac * 100}% when the pack dies${frac > 0.3 ? ' (Elowen fielded)' : ''}`);
    errs.push(...g.errors);
  }

  // wipe: retreat one zone, a full heal after 5s, then push back once it holds
  {
    const { g, E } = party(53, 'warden', ['hesketh', 'wren'], 20);
    const ev = []; g.fn.on('wipe', w => ev.push(Object.assign({}, w))); const ups = []; g.fn.on('unitUp', u => ups.push(u.key));
    E('S.maxZone = 12; S.zone = 12; setZone(12)'); secs(g, 1);
    E('for (let k = 0; k < 3; k++) combatUnits().forEach(u => { if (u.live && !u.down) cbHitUnit(u, 1e30, "hit", null); })');
    assert(ev.length === 1 && ev[0].zone === 12 && ev[0].to === 11 && E('S.zone') === 11 && E('S.combat.back') === 12, 'a wipe retreats one zone (12 -> 11) and remembers where it fell');
    secs(g, 5.2);
    assert(E('combatUnits().filter(u => u.live).every(u => !u.down && u.hp === u.maxHp)') && E('combatFoes().some(f => !f.dead)'), 'after 5s the party stands up at full HP and fights on');
    E('addModifier("dmg", () => 1e4)'); secs(g, 12);
    assert(E('S.zone') === 12 && E('S.combat.back') === 0, 'once the party can hold it again, it pushes back up to the zone it fell from');
    // a wipe in a boss fight is a failed attempt, not a retreat
    const fails = []; g.fn.on('bossFail', x => fails.push(x));
    E('S.kills = 10; challenge()');
    E('for (let k = 0; k < 3; k++) combatUnits().forEach(u => { if (u.live && !u.down) cbHitUnit(u, 1e30, "hit", null); })');
    assert(fails.length === 1 && E('S.zone') === 12 && !E('fightBoss'), 'a wipe against the zone boss fails the attempt (bossFail) without a retreat');
    errs.push(...g.errors);
  }

  // bosses: every zone type shows its telegraphs; a tap in the window parries, an early tap dodges
  {
    const kinds = {};
    for (let zt = 0; zt < 7; zt++) {
      const { g, E } = party(60 + zt, 'warden', ['hesketh', 'wren'], 30);
      const seen = new Set(); g.fn.on('telegraphStart', t => seen.add(t.kind));
      const z = 8 + zt;   // zone types 0-6, cycle II
      E(`S.maxZone = ${z}; S.zone = ${z}; S.kills = 10; addModifier('bossHp', () => 1e3); challenge()`);
      for (let i = 0; i < 300 && E('fightBoss'); i++) g.fn.tick(0.1);
      kinds[E(`TYPES[zoneType(${z})].key`)] = [...seen].sort().join('+');
      errs.push(...g.errors);
    }
    const want = { slime: 'heavy', bat: 'dive+heavy', bones: 'heavy', beetle: 'heavy', spore: 'cloud', golem: 'heavy', wraith: 'heal+heavy' };
    assert(Object.keys(want).every(k => kinds[k] === want[k]), 'each Elder shows its telegraphs: ' + Object.entries(kinds).map(([k, v]) => `${k} ${v}`).join(', '));
    // parry: the class tap in the window; the stage hook returns one kept object
    const { g, E } = party(70, 'warden', ['hesketh', 'wren'], 30);
    const res = []; g.fn.on('telegraphResolve', r => res.push(Object.assign({}, r)));
    E("S.maxZone = 8; S.zone = 8; S.kills = 10; addModifier('bossHp', () => 1e3); challenge()");
    let t1 = null, t2 = null;
    for (let i = 0; i < 200 && !t1; i++) { g.fn.tick(0.1); t1 = E('bossTelegraph()'); }
    t2 = E('bossTelegraph() === bossTelegraph()');
    for (let i = 0; i < 40 && E('bossTelegraph() && bossTelegraph().left > bossTelegraph().win'); i++) g.fn.tick(0.1);
    const hp0 = E('combatUnits().map(u => u.hp).join()'), tapKinds = []; g.fn.on('classTap', c => tapKinds.push(c.kind));
    g.fn.playerTap({ x: 0.66, y: 0.5 });
    assert(t1 && t1.kind === 'heavy' && t2 && res.length === 1 && res[0].result === 'parry' && tapKinds[0] === 'parry' && E('!bossTelegraph()') && E('mob.boss && mob.stunT > 1.5 && mob.vulnT > 0'), 'a tap in the last moments of the wind-up parries: no hit, the boss is staggered and takes +50%');
    // an early tap dodges (half damage)
    const hits = []; g.fn.on('unitHit', h => { if (h.kind === 'heavy') hits.push(h.amount); });
    for (let i = 0; i < 200 && !E('bossTelegraph()'); i++) g.fn.tick(0.1);
    g.fn.playerTap({ x: 0.66, y: 0.5 });
    const dodged = E('bossTelegraph() && bossTelegraph().res === "dodge"');
    for (let i = 0; i < 40 && E('!!bossTelegraph()'); i++) g.fn.tick(0.1);
    assert(dodged && res[res.length - 1].result === 'dodge' && hits.length === 1, 'an early tap is a Dodge: the heavy hit lands at half');
    // Aldric's Shield Bash counts as a parry
    const a = party(71, 'lanternmage', ['aldric', 'hesketh'], 30);
    const ra = []; a.g.fn.on('telegraphResolve', r => ra.push(Object.assign({}, r)));
    a.E("S.maxZone = 8; S.zone = 8; S.kills = 10; addModifier('bossHp', () => 1e3); challenge()");
    for (let i = 0; i < 300 && !ra.some(r => r.by === 'bash'); i++) a.g.fn.tick(0.1);
    assert(ra.some(r => r.by === 'bash' && r.result === 'parry'), "Aldric's Shield Bash parries a boss wind-up by itself");
    errs.push(...g.errors, ...a.g.errors);
  }

  // HUD hooks: kept objects, companion cooldowns simulated
  {
    const { g, E } = party(80, 'ranger', ['tobin', 'wren'], 10);
    E('S.maxZone = 5; setZone(5)'); secs(g, 3);
    assert(E('unitHp("hero") === unitHp("hero") && unitHp("tobin").max > 0 && unitHp("tobin").hp <= unitHp("tobin").max'), 'unitHp(key) returns a kept { hp, max, shield } per unit');
    const cd = E('unitCd("wren")');
    assert(cd && cd.max > 0 && cd.t >= 0 && cd.t <= cd.max && E('unitCd("wren") === unitCd("wren")') && E('unitCd("hero").max > 0'), `unitCd(key): companion abilities are on a real cooldown (Wren ${cd && cd.t.toFixed(1)} / ${cd && cd.max.toFixed(1)}s)`);
    errs.push(...g.errors);
  }

  // no NaN for any character: each of the 18 with a tank or a support, a minute at a zone they hold
  {
    const bad = [];
    for (const id of loadCore({ seed: 1 }).eval('ROSTER_KEYS')) {
      const f = [id]; for (const k of ['tobin', 'hesketh', 'wren', 'maren']) if (f.length < 2 && !f.includes(k)) f.push(k);   // F1: the hero is the third
      for (const cls of ['warden', 'lightkeeper']) {
        const { g, E } = party(90, cls, f, 30);
        E('S.maxZone = 18; setZone(15)'); secs(g, 60);
        const b = badNumbers(E('combatUnits().filter(u => u.live).map(u => [u.hp, u.maxHp, u.sh, u.dmg, u.healed, u.cd])')).concat(badNumbers(E('S')));
        if (b.length || g.errors.length) bad.push(`${cls} ${f.join()}: ${b[0] || g.errors[0]}`);
      }
    }
    assert(!bad.length, 'every character, as a Warden or Lightkeeper party: a minute of combat stays finite, no errors' + (bad.length ? ': ' + bad[0] : ''));
  }

  // offline estimate (C3) within 15% of 30 min of live fighting, XP and mastery frozen
  {
    const { g, E } = party(95, 'warden', ['hesketh', 'wren'], 35);
    const par = holdZone(E) - 1;
    E(`S.maxZone = ${par}; setZone(${par}); addBonus("masteryMult", () => -1); addModifier("compXp", () => 0); addModifier("xp", () => 0)`);
    secs(g, 1);
    const est = E(`(() => { const e = partyHoldEstimate(S.zone, { one: true }); return { g: e.goldPerSec, holds: e.holds }; })()`);
    let gold = 0; g.fn.on('kill', k => { if (!k.mob.boss) gold += k.gold; });
    secs(g, 1800);
    const ratio = est.g * 1800 / Math.max(1, gold);
    assert(est.holds && ratio >= 0.85 && ratio <= 1.15, `offline estimate vs 30 min live at zone ${par}: ${ratio.toFixed(2)} (T8, want 0.85-1.15)`);
    // away gains use it and never pay more than live
    const h = party(95, 'warden', ['hesketh', 'wren'], 35);
    h.E(`S.maxZone = ${par}; setZone(${par}); S.activity = "fight"`);
    const g0 = h.E('S.gold'); const r = h.g.fn.awayGains(1800);
    const away = h.E('S.gold') - g0;
    assert(away > 0 && away <= gold * 1.05 && r.note.startsWith('Your party held'), `away gains (30 min): ${h.E(`fmt(${away})`)} gold, at most live (${h.E(`fmt(${gold})`)}); "${r.note}"`);
    errs.push(...g.errors, ...h.g.errors);
  }

  // Constellations (57e) in combat: every class knob goes through tn(), keystone flags do what STAR_KS says
  {
    const src = loadCore({ seed: 1 }).source;
    const knobs = ['guardT', 'wallT', 'wallPause', 'wall', 'flare', 'flarePerEmber', 'hasteT', 'bless', 'hymn', 'hymnT', 'lkShare', 'lkAura', 'autoEff', 'autoCd'];
    const miss = knobs.filter(k => !src.includes(`tn('${k}')`));
    assert(!miss.length, 'every star knob is read through tn() in 55-party.js' + (miss.length ? ': missing ' + miss.join(', ') : ''));
    // Lantern Flare reads tune:flare
    const lm = party(101, 'lanternmage', ['tobin', 'hesketh'], 20);
    lm.E('S.maxZone = 10; setZone(10); Math.random = () => 0.99'); secs(lm.g, 1);
    const flare = () => lm.E('(() => { const m = mob; m.hp = m.max = 1e12; m.embers = 0; S.party.abilityCd = 0; castAbility(); return 1e12 - m.hp; })()');
    const f0 = flare(); lm.E('addBonus("tune:flare", () => 20)'); const f1 = flare();
    assert(f1 / f0 > 1.9 && f1 / f0 < 2.1, `Lantern Flare reads the flare knob (x${(f1 / f0).toFixed(2)} with +20)`);
    // Wildfire: Embers spread to every other foe at half the count when their foe dies
    lm.E('setZone(10); addBonus("ks:wildfire", () => 1)'); secs(lm.g, 0.1);
    const spread = lm.E('(() => { const fs = combatFoes().filter(f => !f.dead); if (fs.length < 3) return null; fs.forEach(f => f.embers = 0); fs[0].embers = 4; cbDamageFoe(fs[0], fs[0].hp, 0, "magic"); return fs.slice(1).map(f => f.embers).join(); })()');
    assert(spread === '2,2', `Wildfire: a foe with 4 Embers dies, the other two get 2 each (${spread})`);
    // Pack Leader: the Ranger loses its own crit bonus on marked foes
    const rg = party(102, 'ranger', ['tobin', 'hesketh'], 20);
    rg.E('S.maxZone = 10; setZone(10)'); secs(rg.g, 1);
    rg.E('classTap({ target: "mob" })');
    const c0 = rg.E('mod("crit")'); rg.E('addBonus("ks:pack", () => 1)'); const c1 = rg.E('mod("crit")');
    assert(c1 < c0, `Pack Leader: no crit bonus on the marked foe (crit x${c0.toFixed(2)} -> x${c1.toFixed(2)})`);
    // Unbroken: each guard stack gives 2 armour
    const wd = party(103, 'warden', ['hesketh', 'wren'], 20);
    wd.E('S.maxZone = 10; setZone(10)'); secs(wd.g, 1);
    for (let i = 0; i < 5; i++) wd.E('classTap({ target: "mob" })');
    const a0 = wd.E('cbUnitByKey("hero").armour'); wd.E('addBonus("ks:unbroken", () => 1)'); secs(wd.g, 0.3);
    const a1 = wd.E('cbUnitByKey("hero").armour'), n = wd.E('heroGuardN()');
    assert(n >= 1 && Math.abs(a1 - a0 - 2 * n) < 1e-6, `Unbroken: ${n} guard stacks give ${a1 - a0} armour`);
    // Sanctuary Hymn: the Hymn heals 5% of max HP a second
    const lk = party(104, 'lightkeeper', ['tobin', 'wren'], 20);
    lk.E('S.maxZone = 10; setZone(10); addBonus("ks:sanctuary", () => 1); COMBAT_TUNE.regen = 0; COMBAT_TUNE.atk = 0'); secs(lk.g, 1);
    lk.E('combatUnits().forEach(u => { if (u.live) u.hp = u.maxHp * 0.5; }); S.party.abilityCd = 0; castAbility()');
    lk.E('combatUnits().forEach(u => { if (u.live) u.hp = u.maxHp * 0.5; })'); secs(lk.g, 1);
    const hp = lk.E('cbUnitByKey("wren").hp / cbUnitByKey("wren").maxHp');
    assert(hp >= 0.54, `Sanctuary Hymn heals about 5% a second while the Hymn is up (Wren 50% -> ${(100 * hp).toFixed(0)}% in 1s)`);
    errs.push(...lm.g.errors, ...rg.g.errors, ...wd.g.errors, ...lk.g.errors);
  }

  // Deepwell: the [C] boons join the pool now
  {
    const g = loadCore({ seed: 1 });
    assert(g.eval('deepStageC() && DEEP_BOON_IDS.filter(id => DEEP_BOONS[id].c).length === 9'), 'deepStageC() is true: the 9 party-combat boons are in the Deepwell pool');
  }
  assert(!errs.length, 'no combat errors' + (errs.length ? ': ' + errs[0] : ''));
} catch (e) { fail('combat crashed: ' + (e.stack || e)); }
// ---- onboarding (55-onboard.js): progressive unlocks and the guide ----
console.log('onboarding');
try {
  const errs = [];
  // old saves: any progress and no S.onboard -> everything open, guide finished
  for (const f of ['save-a-v1.json', 'save-v2.json', 'save-mid-v2.json', 'save-v2-late.json']) {
    const g = loadCore({ storage: memoryStorage({ [KEY]: fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8') }) });
    const E = s => g.eval(s);
    E('ONBOARD.gate = true');
    assert(E('S.onboard.all && !S.onboard.tips && FEATURES.every(x => x.late || isUnlocked(x.id)) && onboardStep() === null && GUIDE_STEPS.every(x => S.onboard.done[x.id])'),
      `${f}: every feature open, no tips`);
    assert(E('topGoals(60, { sticky: false }).length') === E('(ONBOARD.gate = false, topGoals(60, { sticky: false }).length)'), `${f}: Next Up hides nothing`);
    errs.push(...g.errors);
  }
  // a save made after this change keeps its onboarding state
  {
    const st = memoryStorage();
    const g = loadCore({ storage: st });
    g.eval('chooseClass("warden"); S.onboard.got.party = 30; S.onboard.done.tap = 1; S.maxZone = 3; save()');
    const g2 = loadCore({ storage: st });
    assert(g2.eval('!S.onboard.all && S.onboard.got.party === 30 && S.onboard.done.tap === 1 && S.onboard.tips'), 'a new game with progress stays guided after a reload');
  }
  // a new game: Fight only, then things open as the player goes
  const g = loadCore({ seed: 7 });
  const E = s => g.eval(s);
  E('chooseClass("warden")');
  assert(E('!S.onboard.all && S.onboard.tips && FEATURES.every(x => !isUnlocked(x.id)) && isUnlocked(null) && isUnlocked("nope")'), 'new game: every feature starts hidden (unknown ids are open)');
  E('ONBOARD.gate = true');
  const shown = () => E('topGoals(60, { sticky: false }).map(x => x.sys)');
  assert(!shown().some(s => ['bounty', 'bestiary', 'skill', 'forge', 'camp', 'roster'].includes(s)), 'Next Up hides goals of hidden systems: ' + shown().join(','));
  assert(E('onboardStep().id') === 'tap', 'the guide starts with "tap the foe"');
  E('emit("tap", {}); emit("tap", {}); emit("tap", {})');
  assert(E('onboardStep().id') === 'ability', 'three taps -> "your ability"');
  E('castAbility()');
  // play like a new player: fight, buy the cheapest upgrade, gather now and then, craft what Next Up offers
  const got = {}, log = [];
  g.fn.on('unlock', e => { got[e.id] = E('Math.round(S.onboard.t)'); log.push(e.id); });
  let firstUp = null;
  const buy = () => E(`{ let n = 0; for (let k = 0; k < 50; k++) { const c = HERO_UPS.map(u => ({ u, p: plan(u.base, u.r, S[u.id], S.gold, u.cap, '1') })).filter(o => o.p.n > 0 && o.p.cost <= S.gold).sort((a, b) => a.p.cost - b.p.cost)[0]; if (!c) break; buyHero(c.u.id, '1'); n++; } n }`);
  for (let sec = 0; sec < 12 * 60; sec++) {
    for (let i = 0; i < 10; i++) g.fn.tick(0.1);
    if (firstUp === null && E('S.gold >= 10')) firstUp = sec;
    if (sec % 5 === 0) buy();
    if (sec > 240 && sec % 150 === 0) { E('S.node = { kind: "ore", t: 1 }; setActivity("gather")'); for (let i = 0; i < 600; i++) g.fn.tick(0.1); E('setActivity("fight")'); }
  }
  const at = id => got[id] === undefined ? Infinity : got[id];
  const mmss = t => t === Infinity ? 'never' : `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  console.log('       timeline: ' + Object.entries(got).map(([k, t]) => `${k} ${mmss(t)}`).join(', '));
  assert(firstUp !== null && firstUp < 60, `first upgrade affordable in under a minute (${firstUp}s)`);
  assert(at('party') < 120 && at('nextup') < 120, `Party and Next Up open in the first 2 minutes (${mmss(at('party'))}, ${mmss(at('nextup'))})`);
  assert(at('gather') < 240 && at('bounties') < 300, `Gather and Bounties open by 4-5 minutes (${mmss(at('gather'))}, ${mmss(at('bounties'))})`);
  assert(['camp', 'forage', 'craft', 'bestiary', 'almanac', 'roster'].every(k => at(k) <= 660), 'Camp, Foraging, Craft, Bestiary, Almanac and Roster open by 11 minutes');
  const early = Object.values(got).filter(t => t <= 600).sort((a, b) => a - b);
  let gap = early[0] || 0; for (let i = 1; i < early.length; i++) gap = Math.max(gap, early[i] - early[i - 1]);
  assert(early.length >= 8 && gap <= 180, `something new at least every 3 minutes in the first 10 (${early.length} unlocks, longest gap ${gap}s)`);
  // the guide ends; skip and "show every tab" work
  assert(E('onboardTips(false) === false && onboardStep() === null'), 'Skip tips: no hint shows');
  E('onboardTips(true); onboardUnlockAll()');
  assert(E('S.onboard.all && FEATURES.every(x => x.late || isUnlocked(x.id))'), 'Show every tab: everything opens');
  assert(E('!isUnlocked("powers")'), 'a late feature (Powers) stays hidden after "Show every tab" until its rule holds');
  E('S.legend.sig[2] = 1'); for (let i = 0; i < 12; i++) g.fn.tick(0.1);
  assert(E('isUnlocked("powers")'), 'Powers opens with a first Circle Sigil, also on an all-open save');
  assert(E('GOALS.every(x => goalGate(x))'), 'Next Up shows every system again once it is open');
  assert(E('(onboardReveal("deep"), true)'), 'reveal after all is harmless');
  errs.push(...g.errors);
  assert(!errs.length, 'no onboarding errors' + (errs.length ? ': ' + errs[0] : ''));
} catch (e) { fail('onboarding crashed: ' + (e.stack || e)); }

// ---- constellations: the talent star map (57e-constellations.js) ----
console.log('constellations');
try {
  const { coreFiles } = await import('./lib/core.mjs');
  const FIX = ['save-v2.json', 'save-mid-v2.json', 'save-v2-late.json', 'save-a-v1.json'];
  const rawOf = f => fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
  const errs = [];
  // points from hero levels and Great Lanterns
  const g = loadCore({ seed: 41 }), E = s => g.eval(s);
  assert(E('JSON.stringify(S.stars)') === '{"v":1,"maps":{},"seen":0}', 'new game: S.stars defaults');
  const pts = (L, z) => E(`S.L = ${L}; S.maxZone = ${z}; starPoints()`);
  assert(pts(1, 1) === 0 && pts(3, 1) === 1 && pts(20, 20) === 6 && pts(35, 35) === 11, 'a star point every 3 hero levels');
  assert(pts(35, 36) === 15 && pts(54, 71) === 26 && E('greatLanternsLit()') === 2, 'a Great Lantern (+4) for each region boss: the zone 35 boss first');
  assert(E('Object.values(STAR_MAPS).every((_, i) => true) && ["warden","lanternmage","ranger","lightkeeper"].every(c => starMap(c).order.length === 31 && starMap(c).edges.length === 33)'), 'four maps of 31 stars (Hearthstar, 3 arms of 8, 5 ring stars, crown)');
  assert(E('["warden","lanternmage","ranger","lightkeeper"].every(c => { const m = starMap(c); return Object.values(m.stars).filter(s => s.kind === "key" || s.kind === "crown").length === 4 && Object.values(m.stars).reduce((a, s) => a + s.cost, 0) === 44; })'), 'each map: 4 keystones, 44 points to light it all');
  assert(E('["warden","lanternmage","ranger","lightkeeper"].every(c => { const st = Object.values(starMap(c).stars); for (let i = 0; i < st.length; i++) for (let j = i + 1; j < st.length; j++) if (Math.hypot(st[i].pos[0] - st[j].pos[0], st[i].pos[1] - st[j].pos[1]) < 44) return false; return true; })'), 'stars sit at least 44 map units apart (clean taps at 360px)');
  // allocation rules
  E('chooseClass("warden"); S.L = 30; S.maxZone = 20; S.stars.maps = {}');
  assert(E('starPoints()') === 10 && E('starFree()') === 10, 'warden at level 30: 10 points');
  assert(!E('starLight("a0s2")') && E('starCheck("a0s2").why') === 'Light a star next to it first.', 'a star needs a lit neighbour');
  assert(E('starLight("a0s1") && starLight("a0s2") && starLight("a0s3")') && E('starFree()') === 6, 'lighting spends points (notable = 2)');
  assert(!E('starUnlight("a0s1")') && /hang from this one/.test(E('starCheck("a0s1").why')), 'cannot unlight a star others hang from');
  assert(E('starLight("a0s4") && starLight("a0s5") && starLight("a0s8")') && E('starFree()') === 1 && E('starKeysLit()') === 1, 'the cheapest keystone costs 9 (spine 6 + 3)');
  assert(E('bonus("tune:guardMax")') === 7 && E('bonus("tune:guard")') < 0 && E('starKeystone("unbroken") && bonus("ks:unbroken") === 1'), 'stars feed tune: bonuses and ks: flags');
  assert(!E('starLight("a1s1") && starLight("a1s2")') || E('starFree()') >= 0, 'never below 0 points');
  E('starReset()');
  assert(E('starLayout().lit.length') === 0 && E('starFree()') === 10 && !E('starKeystone("unbroken")') && E('bonus("tune:guardMax")') === 0, 'reset (respec) refunds every point');
  // modifiers
  const d0 = E('mod("dmg")'), dps0 = E('totalDps()');
  E('starLight("a1s1"); starLight("a1s2")');
  assert(Math.abs(E('mod("dmg")') / d0 - 1.015) < 1e-9 && E('mod("tap")') > 1.049, 'Edge adds +1.5% damage, Heavy Arm +5% taps');
  assert(E('totalDps()') > dps0, 'dps rises with damage stars');
  E('starReset()');
  // keystone limit and the crown's need
  E('S.L = 120');
  for (const a of [0, 1, 2]) E(`["a${a}s1","a${a}s2","a${a}s3","a${a}s4","a${a}s5"].forEach(id => starLight(id))`);
  assert(E('starLight("a0s8") && starLight("a1s8")') && E('starKeysLit()') === 2, 'two keystones lit');
  assert(!E('starLight("a2s8")') && /^Unlight a keystone first/.test(E('starCheck("a2s8").why')), 'a third keystone: "Unlight a keystone first"');
  E('starUnlight("a1s8")');
  assert(/ring stars/.test(E('(starLight("b0"), starCheck("crown").why)')), 'the crown needs 3 ring stars');
  E('starLight("b1"); starLight("b4")');
  assert(E('starLight("crown")') && E('starKeysLit()') === 2, 'crown: 3 ring stars and 3 stars in every arm');
  assert(/needs this star/.test(E('starCheck("b4").why')) || /hang/.test(E('starCheck("b4").why')), 'cannot unlight a ring star the crown needs');
  assert(!E('starUnlight("a2s3")'), 'cannot drop an arm under the crown\'s need');
  // oathsworn: hero-only trick leaves companions at x1.1
  E('starReset(); ["a2s1","a2s2","a2s3","a2s4","a2s5","a2s8"].forEach(id => starLight(id))');
  const dm = E('mod("dmg")'), dp = E('mod("dmg") * mod("party")');
  E('starUnlight("a2s8")');
  assert(Math.abs(dm / E('mod("dmg")') - 0.75) < 1e-9 && Math.abs(dp / E('mod("dmg") * mod("party")') - 1.1) < 1e-9, 'Oathsworn: the hero deals x0.75, companions x1.1 (hero-only trick)');
  E('starReset()');
  E('starReset()');
  // boss fight and Deepwell lock
  E('fightBoss = true; spawn()');
  assert(E('starCheck("a0s1").why') === 'Not during a boss fight.' && !E('starReset()') && !E('starUseLayout(1)'), 'no changes during a boss fight');
  E('fightBoss = false; spawn()');
  assert(E('starCheck("a0s1").ok'), 'free again after the fight');
  // layouts
  E('starLight("a0s1"); starLight("a0s2")');
  assert(E('starUseLayout(1)') && E('starLayout().lit.length') === 0 && E('starLayout().name') === 'Push', 'switch to the Push layout: empty');
  E('starLight("a1s1")');
  assert(E('starRename(1, "  Boss rush forever  ")') && E('starLayout().name') === 'Boss rush fo', 'rename (12 characters)');
  assert(E('starUseLayout(0)') && E('starLayout().lit.join()') === 'a0s1,a0s2', 'back to Farm: its stars are kept');
  E('save()');
  const g2 = loadCore({ seed: 42, storage: memoryStorage({ [KEY]: g.storage.get(KEY) }) });
  assert(g2.eval('JSON.stringify(S.stars)') === E('JSON.stringify(S.stars)') && g2.eval('starLayouts("warden")[1].lit.join()') === 'a1s1', 'layouts survive save and load');
  // Mirror of Embers: another class starts empty, warden keeps its map
  E('S.party.chosen = false; chooseClass("ranger")');
  assert(E('starLayout().lit.length') === 0 && E('starEffects().m.dmg') === undefined && E('starLayouts("warden")[0].lit.length') === 2, 'changing class keeps each class\'s map');
  // Next Up
  E('S.onboard.t = 5; onboardReveal("stars")');
  const gl = E('(topGoals(60, { sticky: false }).find(x => x.id === "stars") || {}).label');
  assert(/^You have \d+ star points?$/.test(gl || ''), `Next Up: "${gl}"`);
  errs.push(...g.errors, ...g2.errors);
  // old saves: defaults, dps unchanged, the points they earned; broken layouts repaired
  const noStars = coreFiles().filter(f => !f.startsWith('57e'));
  for (const f of FIX) {
    const o = loadCore({ seed: 43, storage: memoryStorage({ [KEY]: rawOf(f) }) });
    const b = loadCore({ seed: 43, storage: memoryStorage({ [KEY]: rawOf(f) }), files: noStars });
    const raw = JSON.parse(rawOf(f)), want = Math.floor(raw.L / 3) + 4 * Math.floor((raw.maxZone - 1) / 35);
    assert(o.eval('JSON.stringify(S.stars)') === '{"v":1,"maps":{},"seen":0}' && o.eval('starPoints()') === want, `${f}: empty star maps and the ${want} points it earned`);
    assert(Math.abs(o.eval('totalDps()') / b.eval('totalDps()') - 1) < 1e-12, `${f}: totalDps unchanged`);
    errs.push(...o.errors);
  }
  const bad = JSON.parse(rawOf('save-v2.json'));
  bad.stars = { v: 1, maps: { warden: { layouts: [{ name: 'X', lit: ['a0s2', 'zzz', 'a0s1', 'a0s1', 'a0s3', 'a0s4'] }], active: 5 }, nope: {} }, seen: 2 };
  bad.party = Object.assign({}, bad.party || {}, { cls: 'warden', chosen: true });
  const v = loadCore({ seed: 44, storage: memoryStorage({ [KEY]: JSON.stringify(bad) }) });
  assert(v.eval('S.stars.maps.warden.layouts.length === 2 && S.stars.maps.warden.active === 0 && S.stars.maps.nope !== undefined'), 'a broken map gets 2 layouts and a valid active one (unknown classes kept)');
  assert(v.eval('starLayouts("warden")[0].lit.join()') === 'a0s2,a0s1' && v.eval('starSpent("warden") <= starPoints()'), `over-budget layout trimmed from the tips to fit ${v.eval('starPoints()')} points (${v.eval('starLayouts("warden")[0].lit.join()')})`);
  errs.push(...v.errors.filter(e => !/toast/.test(e)));
  // power: the best build stays inside the pace caps (docs/design/pacing.md; owner wants a slower game)
  const out = [];
  for (const c of ['warden', 'lanternmage', 'ranger', 'lightkeeper']) {
    const r = [6, 17, 28].map(p => E(`starBest("${c}", ${p}).p`));
    out.push(`${c} ${r.map(x => '+' + ((x - 1) * 100).toFixed(0) + '%').join('/')}`);
    assert(r[0] <= 1.15 && r[1] <= 1.25 && r[2] <= 1.35, `best build at 6/17/28 points (L20/L40/L60) within +15/+25/+35%: ${out[out.length - 1]}`);
  }
  assert(!errs.length, 'no constellation errors' + (errs.length ? ': ' + errs[0] : ''));
} catch (e) { fail('constellations crashed: ' + (e.stack || e)); }

// ---- Q1 quality fixes and the D3 live-save welcome (55-welcome.js) ----
console.log('welcome');
try {
  const rawOf = f => fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
  const ticks = (g, secs) => { for (let i = 0; i < secs * 10; i++) g.fn.tick(0.1); };
  const DEF = { watch: 0, forge: 1, bench: 1, loom: 1, ench: 1, tavern: 1, library: 0, maproom: 0, shrine: 0 };
  const errs = [];
  // The Omen pin holds for every game this run loads.
  assert(loadCore({ seed: 3 }).eval('almanac.active() === null'), 'the Omen is pinned to none for the whole check run');
  for (const f of ['save-v2.json', 'save-a-v1.json', 'save-mid-v2.json', 'save-v2-late.json']) {
    const old = JSON.parse(rawOf(f));
    const g = loadCore({ seed: 8, storage: memoryStorage({ [KEY]: JSON.stringify(old) }) });
    const E = s => g.eval(s);
    const allow = E('CAMP_HZ.filter(z => S.maxZone >= z).length'), welcomed = allow >= 2;
    const news = [], toasts = [];
    g.fn.on('whatsNew', w => { if (!/^(The Great Lantern|Your stations were already built|Skills now level more slowly|Your party is now three|Pairs who fight side by side|Your old friends kept)/.test(w.msg)) news.push(w.msg); }); g.fn.on('toast', t => toasts.push(t.msg));   // the Great Lantern line: R0's own section; the stations line: H1's ('cold hearth'); the skill pace line: GP1's; the party of three: F1's ('formation'); Bonds: F2's ('bonds')
    // at load, before any tick: the Hearth only, no cost
    const same = E('S.gold') === old.gold && JSON.stringify(E('S.mats')) === JSON.stringify(Object.assign(E('fresh().mats'), old.mats));
    assert(same && E('S.camp.builds.length') === 0 && E(`campLevel("hearth")`) === (welcomed ? allow : 0), `${f} (zone ${old.maxZone}): ${welcomed ? `Hearth built to ${allow}` : 'no welcome (Hearth 1 comes with the camp)'}, nothing charged`);
    ticks(g, 2);
    const b = E('S.camp.b');
    assert(E('S.camp.open') && b.hearth === Math.max(1, allow) && Object.entries(DEF).every(([k, v]) => b[k] === v), `${f}: camp open at Hearth ${b.hearth}; every other building as a new camp has it`);
    if (welcomed) {
      assert(E('S.welcome.at') > 0 && E('S.welcome.hearth') === allow && E('S.welcome.zone') === old.maxZone && E('S.welcome.said') === 1, `${f}: welcome recorded and said once`);
      assert(news.length === 1 && /Welcome back/.test(news[0]) && news[0].includes(`level ${allow}`) && !toasts.some(m => /made camp/.test(m)), `${f}: one What's new line, no second camp notice: "${news[0]}"`);
    } else assert(E('S.welcome.at') === 0 && !news.length && toasts.some(m => /made camp/.test(m)), `${f}: no welcome; the usual camp notice`);
    // one time only: reload the saved game
    g.fn.save();
    const g2 = loadCore({ seed: 9, storage: memoryStorage({ [KEY]: g.storage.get(KEY) }) });
    const n2 = []; g2.fn.on('whatsNew', w => n2.push(w)); ticks(g2, 2);
    assert(g2.eval('campLevel("hearth")') === Math.max(1, allow) && g2.eval('S.welcome.at') === E('S.welcome.at') && !n2.length && g2.eval('welcomeNote()') === null, `${f}: reload gives no second welcome`);
    errs.push(...g.errors, ...g2.errors);
  }
  // a new game gets nothing, even past zone 38
  const n = loadCore({ seed: 4 }); n.eval('S.maxZone = 38; S.zone = 38'); ticks(n, 2);
  assert(n.eval('S.welcome.at === 0 && campLevel("hearth") === 1'), 'new game: no welcome (the camp opens at Hearth 1)');
  // a save that already has a camp keeps it as it is
  const withCamp = JSON.parse(rawOf('save-v2-late.json'));
  withCamp.camp = { v: 1, open: true, b: { hearth: 2, watch: 1, forge: 1, bench: 1, loom: 1, ench: 1, tavern: 1, library: 0, maproom: 0, shrine: 0 }, builds: [], bless: [], news: [], bty: 0, talk: {}, deco: {} };
  const c = loadCore({ seed: 5, storage: memoryStorage({ [KEY]: JSON.stringify(withCamp) }) }); ticks(c, 2);
  assert(c.eval('S.welcome.at === 0 && campLevel("hearth") === 2 && campLevel("watch") === 1'), 'a save that has a camp: nothing changes (Hearth 2 stays 2)');
  // an old save still below zone 5 is not welcomed now, and not later when it reaches the camp
  const low = JSON.parse(rawOf('save-v2.json')); low.maxZone = 3; low.zone = 3;
  const l = loadCore({ seed: 6, storage: memoryStorage({ [KEY]: JSON.stringify(low) }) }); ticks(l, 1);
  l.eval('S.maxZone = 20; S.zone = 20'); ticks(l, 2);
  assert(l.eval('S.welcome.at === 0 && campLevel("hearth") === 1'), 'old save below zone 5: no welcome, the camp opens at Hearth 1');
  errs.push(...n.errors, ...c.errors, ...l.errors);
  // Watchtower hold hint: partyHoldEstimate() (party combat, 59-combat.js); the stubs below replace it (assignments: it is a var)
  const hz = extra => { const h = loadCore({ seed: 7, storage: memoryStorage({ [KEY]: rawOf('save-v2-late.json') }), extraSource: extra }); return h.eval('campHoldZone()'); };
  const base = hz(''), rule = hz('partyHoldEstimate = undefined;');
  assert(base >= 1 && base <= 38 && rule >= 1 && rule <= 38, `hold hint with party combat: zone ${base}; without it (3-second kills): ${rule}`);
  assert(hz('partyHoldEstimate = () => ({ zone: 12 });') === 12 && hz('partyHoldEstimate = () => 30.6;') === 30, 'hold hint reads partyHoldEstimate() ({ zone } or a number)');
  assert(hz('partyHoldEstimate = () => 99;') === 38 && hz('partyHoldEstimate = () => { throw new Error("x"); };') === rule, 'hold hint: capped at your best zone; falls back if the estimate fails');
  assert(!errs.length, 'no welcome errors' + (errs.length ? ': ' + errs[0] : ''));
} catch (e) { fail('welcome crashed: ' + (e.stack || e)); }

// ---- coast writing (21b-stories-coast.js): every entry there, non-empty, inside UI limits ----
console.log('coast writing');
try {
  const g = loadCore(), E = x => g.eval(x);
  const str = (s, max) => typeof s === 'string' && s.trim().length > 0 && s.length <= max;
  const sents = s => (s.match(/[.!?]+["']?(?=\s|$)/g) || []).length;
  const arr = E('COAST_ARRIVAL'), story = E('COAST_STORY'), keep = E('KEEPER_LINES'), lore = E('COAST_LORE');
  const bty = E('COAST_BOUNTY_TEXT'), omen = E('COAST_OMEN_TEXT');
  assert(arr.length === 7 && arr.every(s => str(s, 80)) && str(E('COAST_ARRIVAL_BOSS'), 80), 'coast: 7 arrival lines and the boss arrival, each under 80 chars');
  const beatBad = story.filter(b => !str(b.title, 40) || !str(b.text, 420) || sents(b.text) < 2 || sents(b.text) > 5 || !str(b.note, 80)
    || (b.head !== undefined && !str(b.head, 60)) || (b.say && !Object.values(b.say).every(s => str(s, 60))));
  assert(story.length === 6 && !beatBad.length && story[0].head && story[5].head && story[5].say.caedmon && story[3].say.thessaly,
    'coast: beats 0-5, text 2-5 sentences, notes, Great Lantern heads, character lines' + (beatBad.length ? ': ' + beatBad[0].id : ''));
  const kKeys = ['intro', 'swing', 'beam', 'undertow', 'bell', 'feed', 'rocks', 'win', 'fall', 'rematch'];
  const kBad = kKeys.filter(k => !Array.isArray(keep[k]) || !keep[k].length || !keep[k].every(s => str(s, 59)));
  assert(!kBad.length, 'coast: Keeper lines for every moment, barks under 60 chars' + (kBad.length ? ': ' + kBad.join(', ') : ''));
  const pages = [6, 7, 8, 9, 10].flatMap(b => lore[b] || []);
  const lBad = pages.filter(p => !str(p.title, 32) || !str(p.text, 420) || sents(p.text) < 2 || sents(p.text) > 5 || !['keeper', 'hallam', 'found'].includes(p.by));
  assert(pages.length === 10 && [6, 7, 8, 9, 10].every(b => lore[b].length === 2) && !lBad.length && new Set(pages.map(p => p.title)).size === 10,
    'coast: 10 Lore pages (2 per band VI-X), unique titles, 2-5 sentences' + (lBad.length ? ': ' + lBad[0].title : ''));
  const bOk = ['crab', 'pearl', 'beam'].every(k => typeof bty[k] === 'function' && str(bty[k]({ need: 40 }), 40) && str(bty[k]({ need: 1 }), 40) && bty[k]({ need: 40 }).includes('40'));
  assert(bOk, 'coast: 3 bounty texts (one and many) under 40 chars');
  const oOk = ['springTide', 'calmSea', 'pearlMoon'].every(k => omen[k] && str(omen[k].n, 24) && str(omen[k].fx, 60) && str(omen[k].say, 60));
  assert(oOk, 'coast: 3 Omen texts (name, effect, line) inside limits');
} catch (e) { fail('coast writing crashed: ' + (e.stack || e)); }

// ---- Hollow writing (21h-lore-hollow.js, LORE2; lore.md 4, 8.1, 9): every foe and elder has its lines, limits, verbs ----
console.log('hollow writing');
try {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'js', '21h-lore-hollow.js'), 'utf8');
  assert(!/\b(document|window|localStorage)\.|\bS\.[a-z]|registerState\(/.test(src.replace(/\/\/.*$/gm, '')), 'hollow: 21h-lore-hollow.js is data only (no DOM, no state)');
  const g = loadCore(), E = x => g.eval(x);
  const L = E('LORE_LIMITS'), roster = E('ROSTER_KEYS');
  const str = (s, max) => typeof s === 'string' && s.trim().length > 0 && s.length <= max;
  const sents = s => (s.match(/[.!?]+["']?(?=\s|$)/g) || []).length;
  const sayOk = say => !say || Object.entries(say).every(([k, s]) => roster.includes(k) && str(s, L.say));
  const arr = E('HOLLOW_ARRIVAL');
  assert(arr.length === 7 && arr.every(s => str(s, L.arrival)) && str(E('HOLLOW_ARRIVAL_BOSS'), L.arrival)
    && arr.every((s, i) => s.startsWith(E(`ZONES[${i}]`))), `hollow: 7 arrival lines (one per place, named first) and the zone 35 line, each ${L.arrival} chars or less`);
  const story = E('HOLLOW_STORY');
  const beatBad = story.filter(b => !str(b.id, 20) || !(b.at >= 1 && b.at <= 35) || !str(b.title, L.title) || !str(b.text, L.text)
    || sents(b.text) < 2 || sents(b.text) > 5 || !str(b.note, L.note) || !sayOk(b.say));
  assert(story.length === 4 && story.map(b => b.id).join() === 'wisps,crowns,chapel,listener' && story.every((b, i) => !i || b.at > story[i - 1].at) && !beatBad.length,
    'hollow: beats wisps, crowns, chapel, listener in zone order; cards 2-5 sentences, notes, say lines by real characters' + (beatBad.length ? ': ' + beatBad[0].id : ''));
  assert(sayOk(E('HOLLOW_LANTERN_SAY')) && str(E('HOLLOW_LANTERN_SAY.hesketh'), L.say), 'hollow: Hesketh\'s line for the Great Lantern I card');
  // Every Hollow foe family: the TYPES the Hollow uses, the behaviours (59b FOE_BEH) and the rigs (13 ENEMY_RIGS, not the wyrm or nodes)
  const hollowKeys = E('REGIONS[0].types.map(i => TYPES[i].key)');
  const fams = [...new Set([...hollowKeys, ...E('Object.keys(FOE_BEH)'), ...E('Object.keys(ENEMY_RIGS).filter(k => k !== "wyrm" && !k.startsWith("node:"))'), ...E('TYPES.map(t => t.key)')])];
  const B = E('LORE_BESTIARY'), EL = E('LORE_ELDERS'), names = E('Object.fromEntries(TYPES.map(t => [t.key, t.name]))');
  const bBad = fams.filter(k => !B[k] || !['foe', 'elder', 'champ'].every(p => str(B[k][p], L.bestiary)) || (names[k] && B[k].name !== names[k]));
  const eBad = fams.filter(k => !EL[k] || !str(EL[k].name, 32) || !str(EL[k].intro, L.elder) || !str(EL[k].fall, L.elder));
  assert(fams.length >= 7 && !bBad.length, `hollow: every foe family (${fams.length}: ${fams.join(' ')}) has bestiary lines for the foe, its Elder and its champion, ${L.bestiary} chars or less` + (bBad.length ? ': missing or long ' + bBad.join(', ') : ''));
  assert(!eBad.length, `hollow: every foe family's Elder has an intro and a fall line, ${L.elder} chars or less` + (eBad.length ? ': ' + eBad.join(', ') : ''));
  const all = Object.values(B), coast = all.filter(b => b.region === 'coast');
  const cBad = Object.keys(EL).filter(k => k !== 'listener' && !B[k]).concat(Object.keys(B).filter(k => !EL[k]));
  assert(all.length === 14 && all.filter(b => b.region === 'hollow').length === 7 && coast.length === 7 && !cBad.length
    && all.every(b => ['foe', 'elder', 'champ'].every(p => str(b[p], L.bestiary))), 'hollow: 14 bestiary entries (7 Hollow, 7 Coast), each with its Elder\'s lines' + (cBad.length ? ': ' + cBad[0] : ''));
  const ls = EL.listener || {};
  assert(str(ls.name, 32) && str(ls.intro, L.elder) && str(ls.fall, L.elder) && str(ls.line, L.bestiary), 'hollow: the Listener (zone 35) has its name, intro, fall and bestiary line');
  const R = E('RAID_LORE'), bosses = E('BOSSES');
  assert(bosses.every(n => str(R[n], L.raid)) && Object.keys(R).length === bosses.length, `hollow: a raid line for each of the ${bosses.length} great foes, ${L.raid} chars or less`);
  // The verbs of the dark (lore.md 9.5): nothing is drawn to, hungry for or aching for light
  const lines = [];
  const walk = v => { if (typeof v === 'string') lines.push(v); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
  ['HOLLOW_ARRIVAL', 'HOLLOW_ARRIVAL_BOSS', 'HOLLOW_STORY', 'HOLLOW_LANTERN_SAY', 'LORE_BESTIARY', 'LORE_ELDERS', 'RAID_LORE'].forEach(n => walk(E(n)));
  const banned = E('LORE_BANNED'), hits = lines.filter(s => banned.some(re => re.test(s)));
  const probe = ['It is drawn to your lamp.', 'It aches for light.', 'It wants the light.', 'Hungry for flame.'].every(s => banned.some(re => re.test(s)));
  assert(lines.length > 60 && probe && !hits.length, `hollow: none of ${lines.length} lines uses a banned verb of the dark` + (hits.length ? ': ' + hits[0] : ''));
} catch (e) { fail('hollow writing crashed: ' + (e.stack || e)); }

// ---- pinnacle data and writing (21d-data-pinnacle.js, 21e-stories-pinnacle.js; pinnacles.md 3-7, PN11) ----
console.log('pinnacle data');
try {
  for (const f of ['21d-data-pinnacle.js', '21e-stories-pinnacle.js']) {
    const src = fs.readFileSync(path.join(ROOT, 'src', 'js', f), 'utf8');
    assert(!/\b(document|window|localStorage)\.|\bS\.[a-z]|registerState\(/.test(src.replace(/\/\/.*$/gm, '')), `pinnacle: ${f} is data only (no DOM, no state)`);
  }
  const g = loadCore(), E = x => g.eval(x);
  const ids = E('PIN_IDS'), P = E('PIN'), T = E('PIN_TUNE'), K = E('PIN_KINDS'), C = E('PIN_CAPS'), M = E('PIN_MECH');
  const V = E('PIN_VOW_RULES'), W = E('PIN_WEEK'), R = E('PIN_REWARDS'), PW = E('PIN_POWERS'), CO = E('PIN_COSMETICS'), CX = E('PIN_CODEX');
  const roster = E('ROSTER_KEYS'), classes = E('Object.keys(HERO_CLASSES)');
  const eps = 1e-9, str = (s, max) => typeof s === 'string' && s.trim().length > 0 && s.length <= max;
  const sents = s => (s.match(/[.!?]+["']?(?=\s|$)/g) || []).length;
  const is3 = a => Array.isArray(a) && a.length === 3;

  // every boss has every field
  const bossKeys = ['id', 'n', 'area', 'theme', 'overlay', 'rig', 'anchor', 'order', 'cols', 'takeX', 'phases', 'mech', 'enrage', 'needs', 'counters', 'samples', 'friend', 'reward'];
  const bBad = ids.filter(b => { const x = P[b];
    return !x || bossKeys.some(k => x[k] === undefined) || x.id !== b || !str(x.n, 24) || !str(x.area, 24) || x.anchor !== T.anchor[b]
      || !is3(x.cols) || !x.cols.every(c => ['front', 'mid', 'back'].includes(c)) || !is3(x.takeX) || !is3(x.phases) || !x.phases.every(p => str(p.n, 24))
      || !str(x.enrage.id, 24) || !str(x.enrage.n, 24) || !Object.keys(x.enrage.every).every(m => x.mech[m])
      || !classes.every(c => Array.isArray(x.samples[c]) && x.samples[c].length === 3 && x.samples[c].every(k => roster.includes(k)))
      || !Object.keys(x.friend).every(k => roster.includes(k)); });
  assert(ids.length === 4 && ids.join() === 'king,lure,fire,below' && !bBad.length, 'pinnacle: 4 bosses, every field, anchors match PIN_TUNE, sample line-ups use real characters' + (bBad.length ? ': ' + bBad[0] : ''));
  assert(P.lure.tide && P.fire.sky && P.fire.cart && P.below.light && P.below.light.start === 100, 'pinnacle: each boss rule block (the Lurelight tide, the sky and the cart, Maud\'s Light)');

  // every mechanic has every field; 17 in all; one heavy hit per boss
  const mKeys = ['id', 'n', 'kind', 'ph', 'every', 'first', 'wind', 'target', 'fx', 'cap', 'tap', 'idle', 'role'];
  const mIds = Object.keys(M);
  const mBad = mIds.filter(id => { const m = M[id];
    return mKeys.some(k => m[k] === undefined) || m.id !== id || !K[m.kind] || !C[m.kind] || !str(m.n, 24) || !is3(m.ph) || !is3(m.every)
      || !m.ph.some(Boolean) || !Array.isArray(m.idle) || !m.idle.length || !m.role.length
      || (m.kind === 'swap' ? m.every.some(Boolean) || !(m.fx.stacks > m.fx.tapAt && m.fx.tapAt > 0)
        : m.ph.some((on, i) => (on ? !(m.every[i] > 0) : m.every[i] !== 0)) || !(m.first >= 0)); });
  const heavy = ids.map(b => Object.values(P[b].mech).filter(m => m.kind === 'parry').length);
  assert(mIds.length === 17 && ids.reduce((n, b) => n + Object.keys(P[b].mech).length, 0) === 17 && !mBad.length && heavy.every(n => n === 1),
    'pinnacle: 17 mechanics with every field, unique ids, one heavy hit per boss' + (mBad.length ? ': ' + mBad[0] : ''));

  // telegraph windows: positive, over the floor, parryable, and room for the next one, normal and Assist
  const restless = 1 + V.restless.often * V.restless.max;
  const tBad = [];
  for (const id of mIds) { const m = M[id], b = P[m.boss];
    const shrinks = [1].concat(b.light ? [b.light.lowWindX] : []);
    for (const ax of [1, T.assist]) {
      if (m.kind === 'swap') {       // the tap window is the time between two stacking hits
        const gapS = m.fx.stackOn === 'bossHit' ? m.fx.stackEvery : Math.min(...M[m.fx.stackOn].every.filter(Boolean), b.enrage.every[m.fx.stackOn] || 1e9) / restless;
        if (!(gapS >= T.windMin)) tBad.push(`${id} swap window ${gapS}`);
        continue;
      }
      if (!(m.wind >= T.windMin)) tBad.push(`${id} wind ${m.wind} under the floor`);
      for (const sh of shrinks) {
        const w = Math.max(T.windMin, m.wind * sh) * ax;
        const win = T.parryMaren * ax;
        if (!(w > 0)) tBad.push(`${id} wind not positive`);
        if (m.kind === 'parry' && !(win < w - eps && T.parry * ax < win + eps)) tBad.push(`${id} parry window ${win} not inside wind-up ${w}`);
        let cad = Math.min(...m.every.filter(Boolean), b.enrage.every[id] || 1e9) * (m.fx.addAliveX || 1) / restless;
        if (!(cad >= w + T.gap - eps)) tBad.push(`${id} cadence ${cad.toFixed(2)} < wind-up ${w} + gap (Assist x${ax})`);
      }
    }
  }
  assert(!tBad.length, `pinnacle: every wind-up >= ${T.windMin}s, parry window inside it, cadence leaves the gap (normal, Assist x${T.assist}, Restless, low Light)` + (tBad.length ? ': ' + tBad[0] : ''));

  // fairness caps (3.4, PN11), from the data
  const worst6 = f => { const dps = t => (f.stackEvery ? Math.min(f.stacks, 1 + Math.floor(t / f.stackEvery)) : 1) * f.dps;
    let best = 0; for (let s = 0; s <= f.secs; s += 0.25) { let d = 0; for (let t = s; t < Math.min(f.secs, s + 6); t += 0.01) d += dps(t) * 0.01; best = Math.max(best, d); } return best; };
  const cBad = mIds.filter(id => { const m = M[id], c = C[m.kind], f = m.fx;
    switch (m.kind) {
      case 'parry': return !(m.cap.hit <= c.hit + eps) || (f.hitCap || m.cap.hit) + (f.swallowed ? f.swallowed.secs * f.swallowed.dps : 0) > c.hit + eps;
      case 'interrupt': return (f.stun || 0) > c.stun || (f.charm || 0) > c.stun || Math.abs(Math.min(0, f.light || 0)) > c.light || (f.heal || 0) > c.heal;
      case 'cleanse': return !(worst6(f) <= c.dot + eps) || !(f.secs > 0) || !(f.count >= 1 && f.count <= 2);
      case 'swap': return !(f.crushed.secs <= c.crushed && f.crushed.takeX <= c.takeX + eps);
      case 'scatter': return (f.hitCap || m.cap.hit) + (f.burn ? f.burn.dps * f.burn.secs : 0) > c.hit + eps;
      case 'dive': return (m.cap.hit || 0) > (c.hit + eps) || (f.hold || 0) > c.stun || (f.cartHit || 0) > c.hit + eps;
      default: return true;
    } });
  assert(!cBad.length, 'pinnacle: every mechanic inside the fairness caps (hit 35%, stun 3s, dot 25% in 6s, scatter 30%, Crushed 3s x1.5)' + (cBad.length ? ': ' + cBad[0] : ''));

  // Vows, the Week's Oath, rewards, powers, cosmetics
  assert(Object.values(V).reduce((n, v) => n + v.w * v.max, 0) === 30, 'pinnacle: Vow rules sum to level 30');
  const lv = W.bag.map(s => W.level(s));
  const wBad = W.bag.filter(s => Object.keys(s.vows).some(k => !V[k] || s.vows[k] < 1 || s.vows[k] > V[k].max));
  const combos = new Set(); for (let w = 0; w < 32; w++) combos.add(W.boss(w) + ':' + W.oath(w).id);
  assert(W.bag.length === 8 && lv.every(l => l >= 10 && l <= 14) && !wBad.length && new Set(W.bag.map(s => s.id)).size === 8 && combos.size === 32 && W.boss(0) === 'king' && W.boss(3) === 'below',
    `pinnacle: Week's Oath bag of 8 at level 10-14 (${lv.join(', ')}), every boss meets every set in 32 weeks`);
  assert(R.legend.base === T.lgBase && R.legend.per === T.lgPer && R.legend.pity === T.pity && R.first.rank === T.firstRank && R.every.echo === T.echo && W.seal === 1,
    'pinnacle: rewards match PIN_TUNE; the Boss of the Week pays one Seal');
  const pBad = ids.filter(b => { const rw = P[b].reward, pw = PW[rw.power];
    return !pw || pw.boss !== b || pw.fits !== 'hero' || !str(pw.n, 24) || !Object.values(pw.v).every(a => a.length === 5) || ![1, 2, 3, 4, 5].every(r => str(pw.txt(r), 180))
      || !['colour', 'trail', 'trophy'].every(k => CO[rw[k]] && CO[rw[k]].boss === b && CO[rw[k]].vow === { colour: 0, trail: R.vow.trail, trophy: R.vow.trophy }[k]); });
  assert(Object.keys(PW).length === 4 && Object.keys(CO).length === 12 && !pBad.length && Object.values(CO).every(c => str(c.n, 24)),
    'pinnacle: 4 powers (5 ranks, text), 12 cosmetics, each boss\'s rewards exist' + (pBad.length ? ': ' + pBad[0] : ''));
  assert(CX.first * 4 + CX.band * 4 * T.vowBands.length + CX.card * 5 === CX.total && CX.total === 90, 'pinnacle: Codex page 15 totals 90 Light');

  // writing (21e): every string there, non-empty, inside UI limits
  const ST = E('PIN_STORY'), VO = E('PIN_VOICE'), LN = E('PIN_LINES'), SAY = E('PIN_SAY'), HI = E('PIN_HINTS'), CH = E('PIN_CHIPS');
  const LE = E('PIN_LESSONS'), CT = E('PIN_COUNTER_TEXT'), TI = E('PIN_TITLES'), WN = E('PIN_WEEK_NAMES'), UI = E('PIN_UI_TEXT');
  const card = (c, lo) => c && str(c.title, 32) && str(c.text, 420) && sents(c.text) >= lo && sents(c.text) <= 5;
  const sBad = ids.filter(b => !ST[b] || !str(ST[b].quote, 60) || !card(ST[b].intro, 2) || !card(ST[b].kill, 3));
  assert(!sBad.length && card(VO, 3) && str(VO.note, 80) && /Emberwaste/.test(VO.text), 'pinnacle: intro and kill cards (3-5 sentences), sheet quotes, The Voice points to the Emberwaste' + (sBad.length ? ': ' + sBad[0] : ''));
  const bark = a => Array.isArray(a) && a.length > 0 && a.every(s => str(s, 59));
  const lBad = ids.filter(b => !LN[b] || !['intro', 'phase2', 'phase3', 'enrage', 'win', 'fall', 'rematch'].every(k => bark(LN[b][k]))
    || !Object.keys(P[b].mech).every(id => bark(LN[b].mech[id])));
  const sayBad = ids.filter(b => !SAY[b] || Object.keys(SAY[b]).some(k => !P[b].friend[k] || !str(SAY[b][k].line, 59)) || Object.keys(P[b].friend).some(k => !SAY[b][k]));
  assert(!lBad.length && !sayBad.length && SAY.king.corvin && SAY.fire.caedmon, 'pinnacle: barks under 60 chars for every moment and mechanic; Corvin, Caedmon and Morwen lines' + (lBad.concat(sayBad).length ? ': ' + lBad.concat(sayBad)[0] : ''));
  const hBad = mIds.filter(id => !str(HI[id], 44) || !CH[id] || !str(CH[id].idle, 36) || !str(CH[id].tap, 36) || typeof LE[id] !== 'function' || !str(LE[id](3), 100) || !LE[id](3).includes('3') || !str(LE[id](1), 100));
  assert(!hBad.length && Object.keys(HI).length === 17 && str(E('PIN_LESSON_TIME'), 100) && str(E('PIN_LESSON_WIPE'), 100), 'pinnacle: 17 first-use hints (44 chars), counter chips (36), fail lessons (100)' + (hBad.length ? ': ' + hBad[0] : ''));
  const tags = ids.flatMap(b => P[b].counters.strong.concat(P[b].counters.weak));
  const titleIds = ids.flatMap(b => [P[b].reward.title, P[b].reward.title30]).concat(Object.values(CX.allFour), CX.pageSeal);
  assert(tags.every(t => str(CT[t], 32)) && titleIds.every(t => TI[t] && str(TI[t].n, 24) && str(TI[t].how, 48)) && W.bag.every(s => str(WN[s.id], 24)),
    'pinnacle: counter texts, every title (name, how), Week\'s Oath names');
  assert(str(UI.locked, 64) && UI.lockParts.length === 2 && str(UI.guide, 80) && UI.tips.length === 3 && UI.tips.every(t => str(t.title, 24) && str(t.text, 100))
    && str(UI.goalReady('The Hollow King'), 48) && str(UI.goalWeek('The First Fire'), 48) && str(UI.newBest('1:04', 12), 40), 'pinnacle: UI texts inside limits');
} catch (e) { fail('pinnacle data crashed: ' + (e.stack || e)); }

// ---- legendary powers, circle sets and their icons (21c-data-legend.js, 11b-art-legend.js; legendaries.md 3-6) ----
console.log('legendary data');
try {
  for (const f of ['21c-data-legend.js', '11b-art-legend.js']) {
    const src = fs.readFileSync(path.join(ROOT, 'src', 'js', f), 'utf8');
    assert(!/\b(document|window|localStorage)\.|\bS\.[a-z]|registerState\(/.test(src.replace(/\/\/.*$/gm, '')), `legend: ${f} is data only (no DOM, no state)`);
  }
  const g = loadCore(), E = x => g.eval(x);
  const P = E('LEG_POWERS'), ids = E('LEG_IDS'), CI = E('LEG_CLASS_IDS'), CO = E('LEG_COMP_IDS'), PI = E('LEG_PIN_IDS');
  const FITS = E('LEG_FITS'), WIRE = E('LEG_WIRE'), SETS = E('LEG_SETS'), CAPS = E('LEG_CAPS'), CIRC = E('LEG_CIRCLES'), CLS = E('LEG_CLASSES');
  const R = E('ROSTER'), keys = E('ROSTER_KEYS'), ICON = E('ICON'), SPEC = E('LEG_ICON_SPEC'), PW = E('PIN_POWERS');
  const str = (s, max) => typeof s === 'string' && s.trim().length > 0 && s.length <= max;
  const num = x => typeof x === 'number' && isFinite(x);

  // one list: 24 class (6 a class), 15 companion, the 4 pinnacle powers by reference
  const all = CLS.flatMap(c => CI[c]).concat(CO, PI);
  assert(CLS.join() === E('Object.keys(HERO_CLASSES)').join() && CLS.every(c => CI[c].length === 6) && CO.length === 15 && PI.length === 4
    && ids.length === 43 && new Set(all).size === 43 && all.every(id => ids.includes(id)) && PI.every(id => P[id] === PW[id]),
    'legend: 43 powers in one list (24 class, 15 companion, the 4 pinnacle rows are PIN_POWERS itself)');

  // every power has every field
  const heroPos = FITS.hero;
  const fBad = ids.filter(id => { const p = P[id], pin = PI.includes(id);
    return !p || p.id !== id || !str(p.n, 26) || !FITS[p.fits] || !num(p.p1) || !num(p.p5) || p.p1 < 0 || p.p5 < p.p1 || p.p5 > 0.2
      || !p.v || !Object.keys(p.v).length || Object.values(p.v).some(a => !Array.isArray(a) || a.length !== 5 || !a.every(num))
      || typeof p.txt !== 'function' || !WIRE[p.wire]
      || (pin ? p.fits !== 'hero' || p.cls !== null
        : !['class', 'comp'].includes(p.src) || !str(p.at, 60)
          || (p.src === 'class' ? p.fits !== 'hero' || !CLS.includes(p.cls) || !CI[p.cls].includes(id) : p.fits === 'hero' || p.cls !== null || !CO.includes(id)))
      || (p.only && (!R[p.only] || R[p.only].role !== p.fits))
      || (p.per && (!CIRC.includes(p.per) || typeof p.pPer !== 'boolean'))
      || (p.down && !p.down.every(k => p.v[k])); });
  assert(!fBad.length && heroPos.join() === 'weapon,off,helm,body' && FITS.trinket.join() === 'trk' && ['tank', 'striker', 'caster', 'support'].every(r => FITS[r].join() === 'wpn'),
    'legend: every power has id, name, fits, class, p1 <= p5, 5-rank values, text, wiring; hero powers on weapon/off/helm/body, role powers on wpn, trinkets on trk' + (fBad.length ? ': ' + fBad[0] : ''));
  assert(new Set(ids.map(id => P[id].n)).size === ids.length, 'legend: power names are unique');

  // values rise with rank (intervals such as `every` and the row's `down` keys fall); each power changes from I to V
  const eps = 1e-9, vBad = [];
  for (const id of ids) { const p = P[id]; let moves = false;
    for (const [k, a] of Object.entries(p.v)) { const dn = (p.down || []).includes(k) || k === 'every';
      for (let i = 1; i < 5; i++) if (dn ? a[i] > a[i - 1] + eps : a[i] < a[i - 1] - eps) vBad.push(`${id}.${k}`);
      if (Math.abs(a[4] - a[0]) > eps) moves = true; }
    if (!moves) vBad.push(id + ' never changes'); }
  const dbl = ['tidewall', 'kindled', 'mossguard', 'echostring', 'compass'].every(id => { const a = Object.values(P[id].v)[0]; return Math.abs(a[4] - 2 * a[0]) < eps && Math.abs(a[1] - 1.25 * a[0]) < eps; });
  assert(!vBad.length && dbl, 'legend: values rise with rank (intervals fall), each power grows from I to V, rank V doubles rank I at 25% a rank' + (vBad.length ? ': ' + vBad[0] : ''));

  // texts: every rank, non-empty, inside the card (180 chars), and the number on the card changes with rank
  const tBad = ids.filter(id => { const t = [1, 2, 3, 4, 5].map(r => P[id].txt(r));
    return !t.every(s => str(s, 180) && !/undefined|NaN/.test(s)) || t[0] === t[4]; });
  assert(!tBad.length && E("legendText('tidewall', 1)").includes('20%') && E("legendText('tidewall', 5)").includes('40%') && E("legendVal('patience', 'mult', 5)") === 9,
    'legend: every power has a text at every rank (under 180 chars), rank I and V read differently' + (tBad.length ? ': ' + tBad[0] : ''));

  // icons: every power, the 4 Sigils, the frame
  const hex = c => typeof c === 'string' && /^(#[0-9A-Fa-f]{6}|hsl\()/.test(c);
  const iBad = ids.filter(id => { const s = SPEC[id], ic = E(`legendIcon('${id}')`);
    return !s || !ICON[s[0]] || ic[0] !== s[0] || !hex(ic[1]) || ![1, 2, 3, 4, 5, 6, 7].every(k => hex(ic[2][k])); });
  const sig = CIRC.map((c, i) => E(`sigilIcon(${i})`));
  const sBad = CIRC.filter((c, i) => { const m = ICON['sigil_' + c]; return !m || m.length !== 12 || m.some(r => r.length !== 12) || sig[i][0] !== 'sigil_' + c || E(`sigilIcon('${c}')[0]`) !== sig[i][0]; });
  const FR = E('LEG_FRAME');
  assert(!iBad.length && Object.keys(SPEC).length === ids.length && !sBad.length && new Set(sig.map(s => s[1])).size === 4
    && FR.col === E('LEG_COL') && FR.map.length === 16 && FR.map.every(r => r.length === 16),
    'legend: every power has an icon (a recoloured ICON map), 4 Sigil icons registered, the 16x16 orange frame' + (iBad.concat(sBad).length ? ': ' + iBad.concat(sBad)[0] : ''));

  // sets: one per real circle (ROSTER), tiers 2/4/6 with text, the 6-piece named, gross 12-18%
  const rc = new Set(keys.map(k => R[k].circle));
  const setBad = CIRC.filter((c, i) => { const s = SETS[c];
    if (!s || s.circle !== c || s.i !== i || !rc.has(c) || !str(s.n, 24) || Object.keys(s.tiers).join() !== '2,4,6') return true;
    const gross = [2, 4, 6].reduce((n, t) => n + s.tiers[t].p, 0);
    return ![2, 4, 6].every(t => str(s.tiers[t].txt, 100) && s.tiers[t].p > 0 && s.tiers[t].fx) || !str(s.tiers[6].n, 24)
      || gross < CAPS.setGross[0] - eps || gross > CAPS.setGross[1] + eps; });
  assert(!setBad.length && rc.size === 4 && [...rc].every(c => CIRC.includes(c)) && Object.keys(SETS).length === 4,
    'legend: 4 circle sets on the ROSTER circles, 2/4/6-piece tiers with text, 6-piece sets +12-18% gross' + (setBad.length ? ': ' + setBad[0] : ''));

  // costs and limits (5, 2.3, 4.1, 7)
  const C = E('LEG_COST'), T = E('LEG_TUNE'), CX = E('LEG_CODEX');
  assert([1, 2, 3, 4, 5].map(r => C.inscribe.pearls(r)).join() === '4,6,8,10,12' && C.inscribe.ess === 5 && C.inscribe.goldFoes === 100 && C.mark.sigil === 1 && C.mark.pearls === 2
    && T.heroMax === 2 && T.compMax === 1 && T.markMax === heroPos.length + 2 * 2 && T.echoPerRank === 3
    && CX.powers === ids.length - PI.length && CX.total === CX.powers * (CX.learn + CX.rank * 4),
    'legend: Inscribe 2 + 2 x rank Pearls, 5 Essence, 100 foes\' gold; Mark 1 Sigil + 2 Pearls; 2 hero powers, 1 a companion, 10 marks; Codex 234 Light');

  // the power budget (6): the best legal build at rank I / III / V stays under the caps
  const M = CAPS.model;
  const pAt = (id, r) => P[id].p1 + (P[id].p5 - P[id].p1) * (r - 1) / 4;
  const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  function legendBest(r) {
    let top = { v: 0 };
    for (let a = 0; a < keys.length; a++) for (let b = a + 1; b < keys.length; b++) for (let c = b + 1; c < keys.length; c++) {
      const line = [keys[a], keys[b], keys[c]], n = {};
      for (const k of line) n[R[k].circle] = (n[R[k].circle] || 0) + 1;
      let cv = 1, cp = [];
      for (const pm of perms) { const used = new Set(); let v = 1; const pick = [];
        for (const i of pm) { const k = line[i];
          const o = CO.filter(id => !used.has(id) && (P[id].fits === R[k].role || P[id].fits === 'trinket') && (!P[id].only || P[id].only === k)).sort((x, y) => pAt(y, r) - pAt(x, r))[0];
          if (o) { used.add(o); pick.push(o); v *= 1 + pAt(o, r) * M.comp; } }
        if (v > cv) { cv = v; cp = pick; } }
      const sv = CIRC.map(ci => { const t = SETS[ci].tiers; return [ci, (t[2].p + t[4].p + t[6].p) * M.setNet, (t[2].p + t[4].p) * M.setNet]; });
      let sb = 1; for (const x of sv) for (const y of sv) if (x !== y) sb = Math.max(sb, (1 + x[1]) * (1 + y[2]));
      for (const cls of CLS) {
        const hv = CI[cls].concat(PI).map(id => [id, pAt(id, r) * (P[id].pPer ? (n[P[id].per] || 0) : 1)]).sort((x, y) => y[1] - x[1]);
        const v = (1 + hv[0][1]) * (1 + hv[1][1]) * cv * sb;
        if (v > top.v) top = { v, d: `${cls} ${hv[0][0]} + ${hv[1][0]}, ${line.join('/')} with ${cp.join('/')}` };
      }
    }
    return top;
  }
  const bb = [1, 3, 5].map(r => [r, legendBest(r)]);
  const capBad = bb.filter(([r, t]) => t.v - 1 > CAPS.best[r] + eps);
  assert(!capBad.length, `legend: the best build stays under the caps (${bb.map(([r, t]) => `rank ${r} +${(100 * (t.v - 1)).toFixed(1)}% <= +${Math.round(100 * CAPS.best[r])}%`).join(', ')})`
    + (capBad.length ? ': ' + capBad[0][1].d : ''));
  // no single best pair (L4) by the estimates: each class has 3+ hero pairs within 10% of its best at rank III
  // (per-member powers with 3 of their circle fielded)
  const pr = CAPS.pairs, pairBad = CLS.filter(cls => {
    const pool = CI[cls].concat(PI), vals = [];
    for (let i = 0; i < pool.length; i++) for (let j = i + 1; j < pool.length; j++) {
      const f = id => 1 + pAt(id, pr.rank) * (P[id].pPer ? 3 : 1); vals.push(f(pool[i]) * f(pool[j])); }
    const best = Math.max(...vals); return vals.filter(v => (v - 1) >= (best - 1) * (1 - pr.within) - eps).length < pr.min; });
  assert(!pairBad.length, 'legend: every class has 3+ hero power pairs within 10% of its best pair at rank III (by the estimates)' + (pairBad.length ? ': ' + pairBad[0] : ''));
} catch (e) { fail('legendary data crashed: ' + (e.stack || e)); }

// ---- legendary powers core (55-legend.js, L2; legendaries.md 2-6, 8; the runtime cap, coordinator decision) ----
console.log('legendary core');
try {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'js', '55-legend.js'), 'utf8').replace(/\/\/.*$/gm, '');
  assert(!/\b(document|window|localStorage)\./.test(src), 'legend core: no DOM');
  const ticks = (g, secs) => { for (let i = 0; i < secs * 10; i++) g.fn.tick(0.1); };
  // old saves: empty Book, defaults merged, identical dps with and without the legend core
  const noLegend = (await import('./lib/core.mjs')).coreFiles().filter(f => f !== '55-legend.js');
  for (const f of ['save-v2.json', 'save-mid-v2.json', 'save-v2-late.json']) {
    const raw = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
    const a = loadCore({ storage: memoryStorage({ [KEY]: raw }) }), b = loadCore({ storage: memoryStorage({ [KEY]: raw }), files: noLegend });
    const L = a.eval('S.legend');
    assert(L && L.v === 1 && !Object.keys(L.book).length && L.sig.length === 4 && Array.isArray(L.owed) && a.fn.totalDps() === b.fn.totalDps() && a.eval('legendBudget().raw') === 0,
      `legend core: ${f} loads with an empty Book, defaults merged, the same dps (${a.fn.totalDps().toFixed(1)})`);
  }
  const mk = () => {
    const g = loadCore({ seed: 5 }), E = x => g.eval(x);
    E('S.party.cls = "warden"; S.maxZone = 40; S.zone = 40; S.gold = 1e15; for (const k of Object.keys(S.mats)) S.mats[k] = S.mats[k].map(() => 5000)');
    E('["tobin","wren","pip","bram","maren","aldric","kestrel","anselm","elowen","caedmon"].forEach(k => unlockChar(k, "test", true)); S.party.autoField = false; setField(["maren","aldric","caedmon"])');
    ticks(g, 1);
    return g;
  };
  const g = mk(), E = x => g.eval(x);
  // drops, Learn, Echoes
  const d1 = JSON.parse(E('JSON.stringify(legendDrop(1, "test", { pool: "class", z: 40 }))'));
  const it1 = d1 && d1.item;
  assert(d1 && d1.kind === 'item' && it1 && E('LEG_CLASS_IDS.warden').includes(it1.lg) && it1.lr === 1 && it1.r === 'epic' && E(`lgFits({ slot: "${it1.slot}" }, "${it1.lg}")`) && it1.t === E('zoneTier(40)'),
    `legend core: a new power drops as a wearable Legendary item (${it1 && it1.lg} on a ${it1 && it1.slot}, Epic, rank I, zone tier)`);
  const id = it1.lg;
  assert(E(`legendLearn(${it1.id})`) && E(`legendKnown("${id}")`) === 1 && !E(`itemById(${it1.id})`), 'legend core: Learn breaks the item down and puts its power in the Book');
  E(`legendDrop(1, "test", { id: "${id}" }); legendDrop(1, "test", { id: "${id}" }); legendDrop(1, "test", { id: "${id}" })`);
  assert(E(`legendKnown("${id}")`) === 1 && E(`legendEchoes("${id}")`) === 3 && E('legendEchoCap()') === 1, 'legend core: a known power drops as an Echo; with no Oath kept Echoes bank at rank I');
  E('S.oath = { maxL: 6 }'); ticks(g, 4);
  assert(E(`legendKnown("${id}")`) === 2 && E(`legendEchoes("${id}")`) === 0 && E('legendEchoCap()') === 3, 'legend core: 3 Echoes rank it up once the cap allows (Oath 6 kept: up to rank III)');
  E(`legendDrop(1, "test", { id: "${id}" }); legendDrop(4, "test", { id: "${id}" })`);
  assert(E(`legendKnown("${id}")`) === 4 && E(`legendEchoes("${id}")`) === 1, 'legend core: a higher-rank drop sets the rank and keeps the Echoes');
  // Inscribe: fits, costs
  E('globalThis.__mk = (kind, t) => { const it = newItem(kind, t || 3, "rare"); S.items.push(it); return it.id; }');
  E('["tidewall", "anvil", "cadence", "banner"].forEach(p => { S.legend.book[p] = 3; })');
  const wb = E('__mk("warblade")'), gh = E('__mk("greathelm")'), pl = E('__mk("plate")'), sh = E('__mk("shield")'), bow = E('__mk("bow")');
  assert(!E(`legendCanInscribe("echostring", ${pl}).ok`) && !E(`legendCanInscribe("huntmoon", ${pl}).ok`) && E(`legendCanInscribe("tidewall", ${pl}).ok`), 'legend core: a power goes only where it fits (a Warden power on Warden gear)');
  const ess0 = E('S.mats.ess[2]'), gold0 = E('S.gold'), cost = JSON.parse(E(`JSON.stringify(legendCanInscribe("tidewall", ${wb}).cost)`));
  assert(E(`legendInscribe("tidewall", ${wb})`) && E(`itemById(${wb}).lg`) === 'tidewall' && E('S.mats.ess[2]') === ess0 - 5 && gold0 - E('S.gold') === cost.gold && cost.pearls === 8,
    'legend core: Inscribe pays Essence and gold (Pearls 2 + 2 x rank once Pearls exist) and writes the power on the crafted item');
  E(`legendInscribe("anvil", ${gh}); legendInscribe("cadence", ${pl}); legendInscribe("banner", ${sh})`);
  // limits: 2 hero powers
  E(`equipItem(${wb}, "weapon"); equipItem(${gh}, "helm")`);
  assert(E('bonus("lg:tidewall")') === 3 && E('bonus("lg:anvil")') === 3 && E('legendActive().hero.length') === 2, 'legend core: worn powers are active at the Book rank (bonus lg:<id>)');
  const hc = JSON.parse(E(`JSON.stringify(legendHeroCheck(${pl}, "body"))`));
  assert(!hc.ok && hc.off != null && /carries 2 legendary powers/.test(hc.why), `legend core: a third power asks first ("${hc.why}")`);
  E(`equipItem(${pl}, "body")`);
  assert(E('S.equip.body') === null && E('legendActive().hero.length') === 2 && E('bonus("lg:cadence")') === 0, 'legend core: a third powered item goes back to the bag; the hero keeps 2 powers');
  E('S.legend.book.tidewall = 5; gearDirty()');
  assert(E('bonus("lg:tidewall")') === 5, 'legend core: an inscribed item follows the Book rank');
  // a save edited to 3 keeps the first 2 by position
  const sv = JSON.parse(E('JSON.stringify(S)')); sv.equip.body = pl;
  const g2 = loadCore({ storage: memoryStorage({ [KEY]: JSON.stringify(sv) }) }); ticks(g2, 1);
  assert(g2.eval('S.equip.body') === null && g2.eval('S.equip.weapon') === wb && g2.eval('S.equip.helm') === gh && g2.eval('S.legend.book.tidewall') === 5,
    'legend core: a save with 3 powers keeps the first 2 by position; the Book survives save and load');
  // companions: 1 power each, role and wearer rules
  E(`S.legend.book.echostring = 2; S.legend.book.knucklebone = 2; legendInscribe("echostring", ${bow})`);
  const tk = E('__mk("trinket")'); E(`legendInscribe("knucklebone", ${tk})`);
  E('setField(["kestrel","maren","aldric"])');
  assert(E(`equipChar("kestrel", ${bow}, "wpn")`) && !E(`equipChar("kestrel", ${tk}, "trk")`) && E('bonus("lg:echostring")') === 2 && E('legendWearers("echostring").join()') === 'kestrel',
    'legend core: a companion carries 1 power (equipChar refuses a second)');
  assert(E(`legendItemState(itemById(${bow}), "maren").why`).includes('striker'), 'legend core: a companion power on the wrong role is off and says why');
  // Sigils (expeditions, Bond), Marks, set counting
  E('emit("expedBack", { g: 3, circles: { hedgefolk: 2, oath: 1 } }); emit("expedBack", { g: 0, circles: { dusk: 2 } }); emit("expedBack", { g: 1, recall: true, circles: { dusk: 2 } })');
  assert(E('S.legend.sig.join()') === '2,0,0,0', 'legend core: an expedition team of 2+ of one circle brings Sigils (2 on Perfect, none on Fair or a recall)');
  E('emit("milestone", { id: "pip", lv: 25 }); emit("milestone", { id: "pip", lv: 25 })');
  assert(E('S.legend.sig[0]') === 4 && E('S.legend.bondCredit.pip') === 1, 'legend core: a first level 25 (Bond) gives 2 Sigils, once');
  E('S.legend.sig = [20, 20, 20, 20]; for (const k of Object.keys(S.skills)) S.skills[k].lv = 99');
  const gold1 = E('goldMult()');
  assert(E('(() => { const c = canCraft("warblade", 2, { cm: 1 }); const it = craftItem("warblade", 2, { cm: 1 }); return c.ok && !!it && it.cm === 1 && S.legend.sig[1] === 19; })()'), 'legend core: Mark at craft takes a Sigil and marks the item');
  assert(!E(`legendCanMark(${wb}, 9).ok`) && E(`legendMark(${wb}, "hedgefolk") && legendMark(${gh}, 0) && itemById(${wb}).cm === 0`), 'legend core: Mark on the item sheet (1 Sigil of the circle)');
  assert(E('legendSets().n[0]') === 2 && E('legendSetTier("hedgefolk")') === 2 && Math.abs(E('goldMult()') / gold1 - 1.1) < 1e-9, 'legend core: 2 marked pieces worn switch on the 2-piece set (+10% gold)');
  const bs = E('__mk("bow")'), bs2 = E('__mk("staff")');
  E(`legendMark(${bs}, 0); legendMark(${bs2}, 0); legendMark(${sh}, 0)`);
  E(`setField(["wren","tobin","pip"]); equipChar("wren", ${bs}, "wpn"); equipChar("pip", ${bs2}, "wpn"); equipChar("tobin", ${sh}, "wpn")`);
  assert(E('legendSets().n[0]') === 4 && E('legendSetTier(0)') === 4, 'legend core: marks worn by fielded companions count (F1: 2 fielded, Pip benched: 4 pieces, the 4-piece tier)');
  E('setField(["maren","aldric","caedmon"])');
  assert(E('legendSets().n[0]') === 2, 'legend core: benched companions\' marks do not count');
  // the runtime cap: Tidewall + Banner with 2 fielded Oath companions wearing a 4-piece Oath set (F1: Caedmon waits on the bench)
  E('for (const k of ["maren", "aldric", "caedmon"]) { const a = __mk("shield"), b = __mk("trinket"); legendMark(a, "oath"); legendMark(b, "oath"); equipChar(k, a, "wpn"); equipChar(k, b, "trk"); }');
  E(`itemById(${gh}).lg = "banner"; for (const k of LEG_IDS) S.legend.book[k] = 5; gearDirty()`);
  const b5 = JSON.parse(E('JSON.stringify(legendBudget())'));
  // Banner's share of mod('party') (other systems, such as synergies, also feed 'party')
  const bannerPart = () => { const on = E('mod("party")'); E(`itemById(${gh}).lg = "anvil"; gearDirty()`); const off = E('mod("party")'); E(`itemById(${gh}).lg = "banner"; gearDirty()`); return on / off; };
  assert(E('legendSetTier("oath")') === 4 && E('legendSetTier("hedgefolk")') === 2 && Math.abs(b5.cap - 0.70) < 1e-9 && !b5.hit && b5.scale === 1 && Math.abs(bannerPart() - (1 + E('legendVal("banner", "dmg", 5)') * 2)) < 1e-9,
    `legend core: two sets at once (Oath 4 + Hedgefolk 2); a rank V build under its +70% cap runs unscaled (raw +${(100 * b5.raw).toFixed(1)}%)`);
  // F1: with 2 fielded companions the hero's two pieces join the Oath set and Aldric carries the Knucklebone
  // (an Oath-marked trinket), Maren's shield holds Mossguard and the blade carries the Anvil (a bigger power than
  // Tidewall), so rank I still runs over its cap
  E(`S.legend.book.anvil = 1; S.legend.book.banner = 1; S.legend.book.knucklebone = 1; S.legend.book.mossguard = 1; itemById(${wb}).lg = "anvil"; itemById(${wb}).cm = 1; itemById(${gh}).cm = 1; itemById(${tk}).cm = 1; equipChar("aldric", ${tk}, "trk"); itemById(charRec("maren").wpn).lg = "mossguard"; gearDirty()`);
  const bu = JSON.parse(E('JSON.stringify(legendBudget())'));
  const party = bannerPart(), exp = 1 + E('legendVal("banner", "dmg", 1)') * 2 * bu.scale;
  assert(bu.raw > bu.cap && bu.capped === bu.cap && Math.abs(bu.cap - 0.30) < 1e-9 && bu.rank === 1 && bu.scale < 1 && bu.hit && Math.abs(party - exp) < 1e-9,
    `legend core: at rank I the budget clamps to +30% (raw +${(100 * bu.raw).toFixed(1)}%, scale ${bu.scale.toFixed(3)}); Banner's party damage is scaled by it`);
  const lb = [1, 2, 3, 4, 5].map(r => JSON.parse(E(`JSON.stringify(legendBest("warden", ${r}))`)));
  assert(lb.every(x => x.capped <= x.cap + 1e-12 && x.raw >= x.capped) && [0.30, 0.375, 0.45, 0.575, 0.70].every((c, i) => Math.abs(lb[i].cap - c) < 1e-9),
    `legend core: legendBest clamps to the cap at every rank (raw ${lb.map(x => '+' + (100 * x.raw).toFixed(0) + '%').join(' / ')})`);
  // owed rolls: nothing can drop yet -> recorded; paid once a source exists
  const g3 = loadCore({ seed: 9 }), X = x => g3.eval(x); ticks(g3, 1);
  X('S.party.cls = null; S.party.rec = {}; S.party.field = []');
  const r0 = X('legendDrop(2, "oath")');
  X('S.oath = { owed: [3, { rank: 1, source: "oath" }] }'); ticks(g3, 4);
  assert(r0 === null && X('S.legend.owed.length') === 1 && X('S.oath.owed.length') === 2 && !Object.keys(X('S.legend.book')).length && !X('S.items.some(i => i.lg)'), 'legend core: a roll with nothing to drop is recorded (S.legend.owed); Oath rolls wait too');
  X('S.party.cls = "ranger"'); ticks(g3, 4);
  assert(X('S.legend.owed.length') === 0 && X('S.oath.owed.length') === 0 && X('S.legend.n.drops') === 3,
    'legend core: owed rolls are paid once a source exists (a class chosen), the Oath core\'s too');
} catch (e) { fail('legendary core crashed: ' + (e.stack || e)); }

// ---- the line-up planner (56d-autofield.js, plan-2 task AF) ----
console.log('line-up planner');
try {
  const rawOf = f => fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
  const mk = (seed, cls, list, hl) => {
    const g = loadCore({ seed }), E = s => g.eval(s);
    E('almanac.force("none")');
    if (cls) E(`chooseClass(${JSON.stringify(cls)})`);
    E(`(() => { for (const [id, lv] of ${JSON.stringify(list)}) { unlockChar(id, 'test', true); charRec(id).lv = lv; charRec(id).rank = Math.min(7, Math.floor((lv - 1) / 25)); } S.party.autoField = false; S.auto = false; S.L = ${hl}; S.blade = ${hl}; S.maxZone = 90; })()`);
    return { g, E, J: s => JSON.parse(E(`JSON.stringify(${s})`)) };
  };
  // legal: recruited, not away, unique, at most 2 (F1: the hero is the third), passes the filter; cells
  // for the hero and each member, one per slot (lane 1); a why line. The hero may stand in any slot.
  const legal = (E, b, pass) => E(`(() => { const b = ${JSON.stringify(b)}, pass = ${pass || '() => true'};
    if (!b || !Array.isArray(b.field) || b.field.length > 2 || new Set(b.field).size !== b.field.length) return 'field shape';
    if (!b.field.every(k => isRecruited(k) && !(typeof expedOut === 'function' && expedOut(k)) && pass(k))) return 'member not allowed';
    const keys = Object.keys(b.cells).sort().join(), want = ['hero'].concat(b.field).sort().join();
    if (keys !== want) return 'cells ' + keys + ' vs ' + want;
    const used = new Set(Object.values(b.cells).map(c => c.col));
    if (used.size !== keys.split(',').length || Object.values(b.cells).some(c => !(c.col >= 0 && c.col <= 2 && c.lane === 1))) return 'cells share a slot or leave the line';
    if (!(typeof b.why === 'string' && b.why.length > 3) || !Number.isFinite(b.score)) return 'no why or score';
    return ''; })()`);
  // every class, a full roster, 8 zones and both goals; the late fixture as it loads
  {
    const all = ['warden', 'lanternmage', 'ranger', 'lightkeeper'];
    const bad = [], whys = new Set();
    let n = 0, ms = 0;
    for (const cls of all) {
      const { E, J } = mk(40 + all.indexOf(cls), cls, [], 60);
      E('ROSTER_KEYS.forEach((k, i) => { unlockChar(k, "test", true); charRec(k).lv = 20 + 7 * (i % 9); charRec(k).rank = Math.floor((charRec(k).lv - 1) / 25); })');
      for (const z of [1, 8, 15, 22, 29, 36, 43, 60]) for (const goal of ['push', 'farm']) {
        const t = Date.now(); const b = J(`bestLineup({ zone: ${z}, goal: '${goal}' })`); ms = Math.max(ms, Date.now() - t); n++;
        const why = legal(E, b); if (why) bad.push(`${cls} z${z} ${goal}: ${why}`);
        whys.add(b.why);
        if (b.parts.cand > 12) bad.push(`${cls}: ${b.parts.cand} candidates (bounded at 12)`);
      }
      const t = Date.now(); for (let i = 0; i < 20; i++) E('bestLineup({ zone: 36 })');
      const hit = (Date.now() - t) / 20;
      if (hit > 20) bad.push(`${cls}: a cached plan took ${hit.toFixed(1)} ms`);
    }
    assert(!bad.length, `bestLineup: ${n} plans (4 classes x 8 zones x push/farm, 18 recruits) are legal, bounded (at most 12 candidates, slowest ${ms} ms) and explain themselves` + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
    console.log('       e.g. ' + [...whys].slice(0, 4).map(w => `"${w}"`).join(', '));
    const h = loadCore({ seed: 3, storage: memoryStorage({ [KEY]: rawOf('save-v2-late.json') }) });
    for (let i = 0; i < 10; i++) h.fn.tick(0.1);
    const b = JSON.parse(h.eval('JSON.stringify(bestLineup())'));
    const w = legal(s => h.eval(s), b);
    assert(!w && !h.errors.length && b.parts.current && b.parts.gain >= 0.999, `save-v2-late.json: a legal plan ("${b.why}"), at least as good as the field it loads with (x${b.parts.gain && b.parts.gain.toFixed(2)})` + (w ? ': ' + w : ''));
  }
  // an active synergy wins when damage is close (within its tie-break), not against a big gap
  {
    const { E, J } = mk(51, 'ranger', [['wren', 120], ['aldric', 120], ['kestrel', 60], ['isolde', 60]], 90);
    E('bondSet("markleap", 3)');   // F2: Mark and Leap is a Bond, on from level 1 (level 3 = its old strength)
    E('globalThis.__afm = 1; addCharModifier(id => id === "isolde" ? globalThis.__afm : 1)');
    const dps = (f, m) => { E(`globalThis.__afm = ${m}`); return J(`lineupScore(${JSON.stringify(f)}, { zone: 5 })`).dps; };
    const syn = ['wren', 'kestrel'], plain = ['wren', 'isolde'];   // F1: pairs (the Ranger hero is the third)
    const at = r => { let lo = 0.01, hi = 100; for (let i = 0; i < 60; i++) { const m = Math.sqrt(lo * hi); if (dps(plain, m) < dps(syn, m) * r) lo = m; else hi = m; } return Math.sqrt(lo * hi); };
    const m1 = at(1.01), m2 = at(1.3);
    E(`globalThis.__afm = ${m1}`); const b1 = J(`bestLineup({ zone: 5, filter: k => ${JSON.stringify(syn.concat('isolde'))}.includes(k) })`);
    E(`globalThis.__afm = ${m2}`); const b2 = J(`bestLineup({ zone: 5, filter: k => ${JSON.stringify(syn.concat('isolde'))}.includes(k) })`);
    assert(b1.field.slice().sort().join() === syn.slice().sort().join() && /Mark and Leap/.test(b1.why) && b2.field.includes('isolde'),
      `with 1% less damage, Mark and Leap wins ("${b1.why}"); with 30% less it does not (${b2.field.join(', ')})`);
  }
  // a tank comes in when the hold estimate says the zone does not hold without one. F3: the hero may stand
  // in any slot, and a high-level Lanternmage or Ranger hero holds the Front for packs; a Lightkeeper cannot.
  {
    const { E, J } = mk(52, 'lightkeeper', [['tobin', 150], ['wren', 150], ['kestrel', 150], ['pip', 150], ['oriel', 150]], 60);
    let found = null;
    for (let z = 10; z <= 80 && !found; z++) {
      const a = J(`bestLineup({ zone: ${z}, boss: false })`), b = J(`bestLineup({ zone: ${z}, boss: false, filter: k => ROSTER[k].role !== 'tank' })`);
      if (a.parts.holds && !b.parts.holds) found = { z, a, b };
    }
    assert(found && found.a.field.includes('tobin') && /a tank for the/i.test(found.a.why) && found.a.cells.tobin.col === 2,
      found ? `zone ${found.z}: no field without a tank holds, so Tobin takes the Front ("${found.a.why}")` : 'no zone where a tank is needed (expected one in 10-80)');
  }
  // F3 (formation.md 5.3): the boss blend and the boss tank rule. Packs at zone 10 hold without a tank; the
  // boss weight is 35% (60% at a region boss or after a failed attempt); once the zone boss has knocked a
  // tankless party out, a tank takes the Front for it.
  {
    const { E, J } = mk(52, 'lanternmage', [['tobin', 150], ['wren', 150], ['kestrel', 150], ['pip', 150], ['oriel', 150]], 60);
    const early = J('bestLineup({ zone: 10, boss: false })'), boss = J('bestLineup({ zone: 10 })');
    assert(!early.field.includes('tobin') && early.parts.holds && boss.parts.bossW === E('FORM_TUNE.bossW') && !boss.parts.hard && boss.parts.st > 0,
      `zone 10: packs hold without a tank (${early.field.join(', ')}); the boss push weighs single-target damage at ${boss.parts.bossW} (${boss.field.join(', ')}: "${boss.why}")`);
    E('emit("bossFail", { zone: 10, dps: 1 })');
    const fail = J('bestLineup({ zone: 10 })');
    E('emit("wipe", { zone: 10, to: 10, boss: true, arena: false })');
    const wiped = J('bestLineup({ zone: 10 })');
    assert(fail.parts.hard && fail.parts.bossW === E('FORM_TUNE.bossWHard') && J('bestLineup({ zone: 36 })').parts.hard && wiped.field.includes('tobin') && wiped.cells.tobin.col === 2 && /a tank for the boss/i.test(wiped.why),
      `after a failed attempt the boss weighs ${fail.parts.bossW} (also at the region boss); after the boss knocks the party out, Tobin takes the Front ("${wiped.why}")`);
    E('emit("zoneClear", { zone: 10 })');
    assert(!J('bestLineup({ zone: 10 })').parts.hard, 'a zone clear resets the boss state');
    // pins: every plan keeps them, at most 2; a pinned companion off the field comes in at once
    E('setPin("pip", true)');
    const p1 = ['push', 'farm'].flatMap(goal => [10, 25, 40].map(z => J(`bestLineup({ zone: ${z}, goal: '${goal}' })`)));
    E('setPin("wren", true)'); const p2 = J('bestLineup({ zone: 25 })');
    E('S.party.autoField = true; S.party.field = ["kestrel", "oriel"]; placeSlots(false)');
    const r = J('autoPlan("pin")');
    const kept = E('S.party.field.slice().sort().join()');
    E('setPin("wren", false); setPin("pip", false)');
    const free = J('bestLineup({ zone: 25 })');
    assert(p1.every(b => b.field.includes('pip') && b.parts.pins.includes('pip')) && p2.field.slice().sort().join() === 'pip,wren' && r && r.changed && kept === 'pip,wren' && !free.parts.pins.length,
      `pins: Pip stays in ${p1.length} plans; with Wren pinned too the plan is Pip and Wren; autoPlan fields both at once (${kept}); unpinned plans are free (${free.field.join(', ')})`);
  }
  // FT7 (formation.md 4.6, 5.4): no flapping. Two hours of play with Auto line-up on and auto-push, on a
  // new game (recruits and promotions as they come) and on the late fixture: at most 2 automatic changes an
  // hour outside recruits, and never A -> B -> A within 10 minutes.
  for (const [name, mkG] of [['new Ranger game', () => { const g = loadCore({ seed: 61 }); g.eval('chooseClass("ranger")'); return g; }],
    ['save-v2-late.json', () => loadCore({ seed: 62, storage: memoryStorage({ [KEY]: rawOf('save-v2-late.json') }) })]]) {
    const g = mkG(), E = s => g.eval(s);
    E('S.party.autoField = true; S.auto = true; S.activity = "fight"');
    const ch = [];
    let t = 0;
    g.fn.on('autoPlan', e => ch.push({ t, from: e.from.slice().sort().join(), to: e.to.slice().sort().join(), reason: e.reason }));
    const z0 = E('S.maxZone');
    for (let m = 0; m < 120; m++) {
      E('S.gold += 2e3 * Math.pow(1.35, S.maxZone); ROSTER_KEYS.forEach(k => { if (canRecruit(k)) recruit(k); if (canPromote(k)) promoteChar(k); })');
      if (E('bossReady()')) g.fn.challenge();
      for (let i = 0; i < 600; i++) { g.fn.tick(0.1); t += 0.1; }
    }
    const auto = ch.filter(c => c.reason !== 'recruit' && c.reason !== 'call');
    const flips = ch.filter((c, i) => ch.slice(0, i).some(d => d.from === c.to && d.to === c.from && c.t - d.t < 600));
    const perH = auto.length / 2;
    assert(perH <= 2 && !flips.length && !g.errors.length,
      `FT7 no flapping, ${name}: ${ch.length} automatic changes in 2h (${auto.length} outside recruits, ${perH.toFixed(1)}/h), ${flips.length} flips within 10 min (zone ${z0} -> ${E('S.maxZone')}, ${E('rosterList().length')} recruited)` + (g.errors.length ? ': ' + g.errors[0] : ''));
  }
  // FT9: bounded work: at most 12 candidates, 396 quick placements and FORM_TUNE.maxEst estimates per search
  {
    const { E, J } = mk(54, 'warden', [], 60);
    E('ROSTER_KEYS.forEach((k, i) => { unlockChar(k, "test", true); charRec(k).lv = 30 + 5 * (i % 7); })');
    const bs = [10, 30, 50].flatMap(z => ['push', 'farm'].map(goal => J(`bestLineup({ zone: ${z}, goal: '${goal}', filter: k => true })`)));
    const mx = bs.reduce((a, b) => Math.max(a, b.parts.est), 0), mq = bs.reduce((a, b) => Math.max(a, b.parts.placements), 0);
    assert(mx <= E('FORM_TUNE.maxEst') && mq <= 396 && bs.every(b => b.parts.cand <= 12), `FT9 bounded: at most ${mx} estimates (cap ${E('FORM_TUNE.maxEst')}) and ${mq} quick placements per search`);
  }
  // filters and expeditions; autoField uses the planner (by potential)
  {
    const { g, E, J } = mk(53, 'warden', [['tobin', 60], ['wren', 60], ['pip', 60], ['maren', 60], ['aldric', 60], ['anselm', 60], ['elowen', 60], ['kestrel', 60], ['oriel', 60], ['hesketh', 60]], 60);
    const oath = J("bestLineup({ zone: 20, filter: { circle: 'oath' } })");
    const arr = J("bestLineup({ zone: 20, filter: ['wren', 'pip'] })");
    const fn = J("bestLineup({ zone: 20, filter: k => ROSTER[k].role !== 'striker', key: 'nostrike' })");
    assert(!legal(E, oath, "k => ROSTER[k].circle === 'oath'") && oath.field.length === 2 && !legal(E, arr, "k => ['wren','pip'].includes(k)") && arr.field.length === 2 && !legal(E, fn, "k => ROSTER[k].role !== 'striker'"),
      `filters: circle-only (${oath.field.join(', ')}: "${oath.why}"), a list, a function`);
    const best = J('bestLineup({ zone: 20 })').field;
    E('S.camp.open = true; S.camp.b.hearth = 8; S.camp.b.maproom = 5; S.maxZone = 36');
    const away = best[0];
    E(`setField(S.party.field.filter(k => k !== '${away}'))`);
    const sent = E(`!!expedSend('r1a', ['${away}'], 1)`);
    const after = J('bestLineup({ zone: 20 })');
    assert(sent && E(`!!expedOut('${away}')`) && !after.field.includes(away) && !legal(E, after), `a character out on an expedition (${away}) is never picked (${after.field.join(', ')})`);
    E('S.party.autoField = true; setField(["hesketh"])'); E('autoField()');
    const pick = J('bestLineup({ by: "potential" })');
    assert(E('S.party.field.slice().sort().join()') === pick.field.slice().sort().join() && E('JSON.stringify(S.party.cells)') === JSON.stringify(pick.cells) && !g.errors.length,
      `autoField() applies the planner's pick and cells (${pick.field.join(', ')}: "${pick.why}")`);
  }
} catch (e) { fail('line-up planner crashed: ' + (e.stack || e)); }

// ---- formation: a party of three (56e-formation.js, plan-3 task F1; formation.md 1, 3, 4; checks C1-C4, C6-C9) ----
console.log('formation');
try {
  const FORM_FIX = ['save-v2.json', 'save-a-v1.json', 'save-mid-v2.json', 'save-v2-late.json', 'save-v3-four.json'];
  const rawOf = f => fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
  const ticks = (g, n) => { for (let i = 0; i < n; i++) g.fn.tick(0.1); };
  const J = (g, s) => JSON.parse(g.eval(`JSON.stringify(${s})`));
  const REC_KEYS = ['lv', 'rank', 'xp', 'wpn', 'trk', 'seen', 'src'];
  const recsOf = g => { const rec = J(g, 'S.party.rec || {}'), o = {}; for (const k of Object.keys(rec).sort()) o[k] = Object.fromEntries(REC_KEYS.map(x => [x, rec[k][x]])); return o; };
  const errs = [];
  // the new fixture is what it says: a chosen class, a field of 3 with gear on all three, a converted synergy active
  const four = JSON.parse(rawOf('save-v3-four.json'));
  assert(four.party && four.party.cls && four.party.rv === 1 && !four.party.formV && four.party.field.length === 3 &&
    four.party.field.every(k => four.party.rec[k] && four.party.rec[k].wpn != null && four.party.rec[k].trk != null) &&
    ['aldric', 'elowen'].every(k => four.party.field.includes(k)),
  `save-v3-four.json: a ${four.party.cls}, a field of 3 (${four.party.field.join(', ')}) with gear on all three, The Old Oath active`);
  const T9 = [];
  for (const f of FORM_FIX) {
    const raw = JSON.parse(rawOf(f));
    const g = loadCore({ seed: 61, storage: memoryStorage({ [KEY]: JSON.stringify(raw) }) });
    const news = []; g.fn.on('whatsNew', w => { if (/^Your party is now three/.test(w.msg)) news.push(w.msg); });
    ticks(g, 20);
    const E = s => g.eval(s);
    // C1: loads without errors or bad numbers
    const bad = badNumbers(J(g, 'S'));
    assert(!g.errors.length && !bad.length && E('S.party.formV') === 1, `C1 ${f}: loads as a party of three without errors` + (g.errors.length ? ': ' + g.errors[0] : bad.length ? ': ' + bad[0] : ''));
    // C2: nobody leaves the roster; every record is kept. For a save the roster migration (B3) already
    // ran on, against the file; otherwise against the same load with the party of three already set.
    // (both loads untouched by play: rosterLive() runs the migrations, no tick)
    let ref;
    if (raw.party && raw.party.rv >= 1) ref = { list: Object.keys(raw.party.rec).filter(k => raw.party.rec[k]).sort(), rec: (() => { const o = {}; for (const k of Object.keys(raw.party.rec).sort()) o[k] = Object.fromEntries(REC_KEYS.map(x => [x, raw.party.rec[k][x]])); return o; })() };
    else {
      const r2 = JSON.parse(JSON.stringify(raw)); r2.party = Object.assign({}, r2.party || {}, { formV: 1 });
      const h = loadCore({ seed: 61, storage: memoryStorage({ [KEY]: JSON.stringify(r2) }) }); h.eval('rosterLive()');
      ref = { list: J(h, 'rosterList()').slice().sort(), rec: recsOf(h) };
      errs.push(...h.errors);
    }
    const g0 = loadCore({ seed: 61, storage: memoryStorage({ [KEY]: JSON.stringify(raw) }) }); g0.eval('rosterLive()');
    const list = J(g0, 'rosterList()').slice().sort(), d = deepDiff(ref.rec, recsOf(g0));
    assert(g0.eval('S.party.formV') === 1, `${f}: the migration runs on the first roster read, before any tick`);
    errs.push(...g0.errors);
    assert(list.join() === ref.list.join() && !d, `C2 ${f}: all ${list.length} companions kept with level, rank, XP, gear, stories and source` + (d ? ': ' + d : ''));
    // C3: at most 2 fielded, both from the old field; one member per slot; formV 1
    const p = J(g, 'S.party'), old = (p.formOld && p.formOld.field) || [];
    const keys = ['hero'].concat(p.field), cols = keys.map(k => p.cells[k] && p.cells[k].col);
    assert(p.field.length <= 2 && p.field.every(k => old.includes(k)) && new Set(cols).size === keys.length && cols.every(c => c === 0 || c === 1 || c === 2) &&
      keys.every(k => p.cells[k].lane === 1) && Object.keys(p.cells).length === keys.length && p.formV === 1 && Array.isArray(p.pin) && !p.pin.length,
    `C3 ${f}: fields ${p.field.join(', ') || 'nobody'} of the old ${old.join(', ')}; ${keys.map(k => `${k} ${['Back', 'Middle', 'Front'][p.cells[k].col]}`).join(', ')}`);
    // C8: one What's new line, naming who waits on the bench
    const benched = old.filter(k => !p.field.includes(k));
    assert(news.length === 1 && (!benched.length || /waits on the bench, with every level kept/.test(news[0])), `C8 ${f}: one What's new line: "${news[0]}"`);
    // C9 / T9: party damage (hero combat damage + field) after vs before
    const nl = J(g, 'formNoLoss()');
    if (nl) T9.push({ f, z: raw.maxZone, ...nl });
    // C4: save, load, save: the party and S.bond (F2) are identical, and no second What's new
    E('save()');
    const g2 = loadCore({ seed: 62, storage: memoryStorage({ [KEY]: g.storage.get(KEY) }) });
    const n2 = []; g2.fn.on('whatsNew', w => { if (/^Your party is now three/.test(w.msg)) n2.push(w.msg); });
    const bond2 = J(g2, 'S.bond || null');   // F2: as loaded (Bonds grow while the party fights, so before any tick)
    ticks(g2, 20);
    const pick = x => ({ field: x.field, cells: x.cells, pin: x.pin, formV: x.formV, formOld: x.formOld });
    const d4 = deepDiff(pick(p), pick(J(g2, 'S.party'))) || deepDiff(J(g, 'S.bond || null'), bond2);
    assert(!d4 && !n2.length && !g2.errors.length, `C4 ${f}: save and load keep the party as it is (field, cells, pin), no second migration` + (d4 ? ': ' + d4 : ''));
    errs.push(...g.errors, ...g2.errors);
  }
  // C9: the ratio. The band (0.90-1.30, T9) is BAL3's to tune: saves below FORM_TUNE.trioFrom get no trio
  // bonus yet and lose their third companion's damage. Hard floor: nobody loses more than a third.
  for (const r of T9) console.log(`       INFO C9 T9 ${r.f} (zone ${r.z}): party damage ${r.ratio.toFixed(2)} (${r.old.join(',')} -> ${r.field.join(',')}; band 0.90-1.30: ${r.ratio >= 0.9 && r.ratio <= 1.3 ? 'in' : 'MISS, BAL3'})`);
  // F2: slot jobs, combos and seeded Bonds add on top of the trio (up to +40% per member, 2.5); the upper bound is 1.6 until BAL3.
  assert(T9.length === FORM_FIX.length && T9.every(r => Number.isFinite(r.ratio) && r.ratio >= 0.7 && r.ratio <= 1.6),
    `C9 party damage after vs before the migration stays within 0.70-1.60 on every fixture (${T9.map(r => r.ratio.toFixed(2)).join(' / ')})`);
  // C6: a new game: the starter and the hero in their homes; one recruit fills the third slot
  {
    const g = loadCore({ seed: 63 }), E = s => g.eval(s);
    const news = []; g.fn.on('whatsNew', w => { if (/^Your party is now three/.test(w.msg)) news.push(w.msg); });
    ticks(g, 5);
    E('chooseClass("warden")'); ticks(g, 5);
    const st = E('S.party.field[0]');
    assert(E('S.party.formV') === 1 && E('S.party.field.length') === 1 && E(`slotOf("hero") === "front" && slotOf("${st}") === homeSlot("${st}")`),
      `C6 a new Warden game: formV 1, ${st} in the ${E(`slotOf("${st}")`)} and the hero in Front`);
    E('unlockChar("pip", "test", true)'); ticks(g, 2);
    const line = J(g, 'formLine()');
    assert(E('S.party.field.length') === 2 && line.every(x => x.key) && E('slotOf("pip")') === 'back', `C6 after one recruit, 3 members in 3 slots: ${line.map(x => `${x.slot} ${x.key}`).join(', ')}`);
    assert(!news.length, 'C8 a new game gets no What\'s new line');
    // the class home: another new game, a Lanternmage (Back) with Tobin (Front)
    const h = loadCore({ seed: 64 }); ticks(h, 5); h.eval('chooseClass("lanternmage")'); ticks(h, 2);
    assert(h.eval('slotOf("hero")') === 'back' && h.eval('slotOf(S.party.field[0])') === 'front', `a new Lanternmage stands in Back, the starter (${h.eval('S.party.field[0]')}) in Front`);
    errs.push(...g.errors, ...h.errors);
  }
  // C7: setField keeps 2; swapSlots moves the hero; fieldTo on the hero's slot is refused
  {
    const g = loadCore({ seed: 65 }), E = s => g.eval(s);
    ticks(g, 3); E('chooseClass("ranger"); ["tobin", "wren", "hesketh", "pip", "bram"].forEach(k => unlockChar(k, "test", true)); S.party.autoField = false');
    E('setField(["tobin", "hesketh", "pip"])');
    assert(E('S.party.field.join()') === 'tobin,hesketh' && E('Object.keys(S.party.cells).sort().join()') === 'hero,hesketh,tobin', 'C7 setField with 3 ids keeps the first 2');
    assert(E('slotOf("hero")') === 'mid' && E('slotOf("tobin")') === 'front' && E('slotOf("hesketh")') === 'back', 'placeSlots: everyone at home (Ranger Middle, Tobin Front, Hesketh Back)');
    let ev = 0; g.fn.on('fieldChange', () => ev++);
    assert(E('swapSlots("mid", "front")') && E('slotOf("hero")') === 'front' && E('slotOf("tobin")') === 'mid' && ev === 1, 'C7 swapSlots moves the hero (one fieldChange)');
    assert(E('offSlot("hero") && offSlot("tobin") && !offSlot("hesketh")') && /out of place/.test(E('formWarning()')), `Out of place: both moved members; the warning: "${E('formWarning()')}"`);
    const heroSlot = E('slotOf("hero")');
    assert(!E(`fieldTo("wren", "${heroSlot}")`) && E('slotOf("hero")') === heroSlot && !E('S.party.field.includes("wren")'), 'C7 fieldTo on the hero\'s slot is refused; the hero stays');
    assert(E('fieldTo("wren", "back")') && E('S.party.field.includes("wren") && !S.party.field.includes("hesketh")') && E('slotOf("wren")') === 'back' && E('S.party.autoField') === false, 'fieldTo: Wren takes the Back, Hesketh goes to the bench');
    assert(E('fieldTo("wren", "mid")') && E('slotOf("wren")') === 'mid' && E('slotOf("tobin")') === 'back', 'fieldTo a fielded companion swaps slots');
    assert(E('setSlots({ front: "bram", mid: "hero", back: "pip" })') && E('S.party.field.slice().sort().join()') === 'bram,pip' && E('whoIn("front")') === 'bram', 'setSlots sets field and cells together');
    assert(!E('setSlots({ front: "bram", mid: "tobin", back: "pip" })') && !E('setSlots({ front: "bram", mid: "hero", back: "bram" })'), 'setSlots refuses a party without the hero, or someone twice');
    assert(E('adjacentKeys("hero").sort().join()') === 'bram,pip' && E('adjacentKeys("pip").join()') === 'hero', 'adjacency: the Middle touches both sides, the Back only the Middle');
    // old two-lane cells (the grid, a stored snapshot) are repaired to one member per slot
    E('S.party.cells = { hero: { col: 1, lane: 1 }, bram: { col: 2, lane: 1 }, pip: { col: 2, lane: 0 } }; emit("fieldChange", { field: S.party.field })');
    const c = J(g, 'S.party.cells');
    assert(new Set(Object.values(c).map(x => x.col)).size === 3 && Object.values(c).every(x => x.lane === 1) && c.pip.col === 2, `a second member dropped on a used slot swaps into it (${Object.entries(c).map(([k, x]) => k + ' ' + x.col).join(', ')})`);
    // the class home on a class change: the hero walks there, whoever stood there swaps
    E('setSlots({ front: "bram", mid: "hero", back: "pip" }); chooseClass("lanternmage")');
    assert(E('slotOf("hero")') === 'back' && E('slotOf("pip")') === 'mid' && E('slotOf("bram")') === 'front', 'a class change: the hero walks to the new class home (Back), Pip swaps to the Middle');
    errs.push(...g.errors);
  }
  // combat: reach, cover, bulwark, Braced, dives, Out of place, the hero floor and the trio ramp
  {
    const g = loadCore({ seed: 66 }), E = s => g.eval(s);
    ticks(g, 3);
    E('almanac.force("none"); chooseClass("ranger"); ["tobin", "hesketh", "wren"].forEach(k => { unlockChar(k, "test", true); charRec(k).lv = 30; charRec(k).rank = 1; }); S.party.autoField = false; S.auto = false; S.L = 30; S.blade = 30; S.maxZone = 12; setZone(10)');
    const place = spec => { E(`setSlots(${JSON.stringify(spec)})`); ticks(g, 1); };   // fieldChange refreshes the units on the next tick
    const hit = (key, kind) => E(`(() => { const u = cbUnitByKey("${key}"); u.hp = u.maxHp; u.sh = 0; u.down = false; u.drT = 0; const a = cbHitUnit(u, u.maxHp * 0.1, "${kind || 'poison'}", null); u.hp = u.maxHp; return a / u.maxHp; })()`);
    place({ front: 'tobin', mid: 'hero', back: 'hesketh' });
    const coverOn = hit('hero'), bulOff = hit('hesketh');
    place({ front: 'hero', mid: 'tobin', back: 'hesketh' });
    const bulOn = hit('hesketh');
    place({ front: 'hesketh', mid: 'hero', back: 'tobin' });
    const coverOff = hit('hero');
    assert(Math.abs(coverOn / coverOff - (1 - E('COMBAT_TUNE.cover'))) < 0.01 && Math.abs(bulOn / bulOff - (1 - E('FORM_TUNE.bulwark'))) < 0.01,
      `cover: a tank in Front covers the Middle (x${(coverOn / coverOff).toFixed(2)}), a tank in the Middle covers the Back (x${(bulOn / bulOff).toFixed(2)})`);
    place({ front: 'hero', mid: 'tobin', back: 'hesketh' });
    const aF = E('cbUnitByKey("hero").armour');
    place({ front: 'tobin', mid: 'hero', back: 'hesketh' });
    const aM = E('cbUnitByKey("hero").armour');
    assert(aF - aM === E('FORM_TUNE.bracedAll'), `Braced: anyone in Front gets +${aF - aM} armour`);
    // reach: melee foes reach the front-most standing member only
    E('combatFoes().forEach(f => { f.ranged = false; f.diveT = 0; f.forceT = 0; f.tgt = -1; })'); ticks(g, 3);
    const tg = E('combatFoes().filter(f => !f.dead && f.hp > 0 && !f.ranged && f.tgt >= 0).map(f => combatUnits()[f.tgt].key).join()');
    assert(tg && tg.split(',').every(k => k === 'tobin'), `melee foes hit the Front member (${tg})`);
    // Out of place: 10% less damage and healing
    place({ front: 'tobin', mid: 'hero', back: 'hesketh' });
    const hHome = E('cbUnitByKey("hesketh").heal / cbUnitByKey("hesketh").hpP'), dHome = E('charDps("hesketh")');   // F2: per HP power (the hero's slot job moves the party's power)
    place({ front: 'tobin', mid: 'hesketh', back: 'hero' });
    const hOff = E('cbUnitByKey("hesketh").heal / cbUnitByKey("hesketh").hpP'), dOff = E('charDps("hesketh")');
    assert(Math.abs(hOff / hHome - 0.9) < 1e-6 && Math.abs(dOff / dHome - 0.9) < 1e-6 && E('offSlotMult("hero")') === 0.9, `Out of place: Hesketh heals x${(hOff / hHome).toFixed(2)} and hits x${(dOff / dHome).toFixed(2)} in the Middle`);
    // the trio ramp over zones 8-12 (damage only)
    const trio = z => E(`(() => { const m = S.maxZone; S.maxZone = ${z}; const t = trioMult(); S.maxZone = m; return t; })()`);
    assert(trio(5) === 1 && trio(8) === 1 && Math.abs(trio(10) - 1.175) < 1e-9 && Math.abs(trio(12) - 1.35) < 1e-9 && Math.abs(trio(40) - 1.35) < 1e-9, 'trioX ramps 1 -> 1.35 over zones 8-12');
    const hp0 = E('cbUnitByKey("tobin").maxHp'); E('S.maxZone = 5'); ticks(g, 2); const hp1 = E('cbUnitByKey("tobin").maxHp'); E('S.maxZone = 12'); ticks(g, 2);
    assert(Math.abs(hp0 / hp1 - 1) < 1e-9, 'trioX never touches HP');
    // the hero's floor: a Ranger with strong companions and a weak blade hits at the floor
    place({ front: 'tobin', mid: 'hero', back: 'hesketh' });
    E('["tobin", "hesketh"].forEach(k => { charRec(k).lv = 120; charRec(k).rank = 4; }); S.L = 1; S.blade = 1');
    const fl = E('heroFloorDps()'), hd = E('heroDps()'), st = E('heroStand()');
    assert(fl > hd && Math.abs(E('heroCombatDps()') - fl * E('trioMult()')) / fl < 1e-9 && Math.abs(st - fl * E('trioMult()') / hd) / st < 1e-9 && E('heroStand(true)') === st,
      `the hero's floor: a Ranger at ${E('fmt(heroDps())')} dps fights at ${E('fmt(heroCombatDps())')} (heroStand x${st.toFixed(1)}, taps too)`);
    E('chooseClass("lightkeeper")');
    assert(E('heroFloorDps()') === 0 && E('HERO_CLASSES.lightkeeper.aura').includes('25%'), 'the Lightkeeper has no floor; its Blessing aura says 25%');
    errs.push(...g.errors);
  }
  assert(!errs.length, 'no formation errors' + (errs.length ? ': ' + errs[0] : ''));
} catch (e) { fail('formation crashed: ' + (e.stack || e)); }

// ---- Bonds: time together, levels, growth, seeds, stories (56f-bonds.js, 21f-stories-bonds.js; plan-3 F2, formation.md 2.3, 3.3, check C5) ----
console.log('bonds');
try {
  const rawOf = f => fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
  const ticks = (g, n, dt = 0.1) => { for (let i = 0; i < n; i++) g.fn.tick(dt); };
  const J = (g, s) => JSON.parse(g.eval(`JSON.stringify(${s})`));
  const HR = 3600, errs = [];
  // levels, events and copy
  {
    const g = loadCore({ seed: 71 }), E = s => g.eval(s);
    ticks(g, 3);
    E('chooseClass("warden"); ["tobin", "bram", "wren", "aldric", "elowen"].forEach(k => unlockChar(k, "test", true)); S.party.autoField = false; S.activity = "fight"');
    assert(E('S.bond.v') === 1 && E('Object.keys(S.bond.t).length') === 0 && E('BOND_IDS.length') === 21, 'a new game: S.bond v 1, nothing seeded, 21 Bonds');
    const lvs = []; g.fn.on('bondLevel', e => lvs.push(e));
    const at = [];
    for (const h of [0.49, 0.5, 2.99, 3, 11.99, 12, 35.99, 36, 149.99, 150, 400]) { E(`S.bond.t.mossy = ${h * HR}`); at.push(E('bondLevel("mossy")')); }
    assert(at.join() === '0,1,1,2,2,3,3,4,4,5,5', `levels at 0.5h / 3h / 12h / 36h / 150h: ${at.join(', ')}`);
    E('S.bond.t.mossy = 0; S.bond.lv = {}');
    E(`bondAdd("mossy", ${0.5 * HR}, false)`); E(`bondAdd("mossy", ${2.5 * HR}, false)`); E(`bondAdd("mossy", ${150 * HR}, false)`);
    assert(lvs.map(e => e.lv).join() === '1,2,5' && lvs[1].story === 1 && lvs[2].sworn && lvs[2].prev === 2, `bondLevel fires once per level reached (${lvs.map(e => e.lv).join(', ')}; Friends opens story 1, Sworn flags sworn)`);
    const tx = [1, 2, 3, 5].map(n => J(g, `bondText("mossy", ${n})`));
    assert(tx[0].msg === 'Tobin and Bram met. Mossy Hollow is on.' && tx[0].prio === 'low' && tx[2].msg === 'Tobin and Bram grew closer. Mossy Hollow is now Trusted.' && tx[3].msg === 'Tobin and Bram are Sworn.' && tx[3].prio === 'high' && J(g, 'bondText("sword", 1)').msg === 'You and Tobin met. The Borrowed Sword is on.',
      `toast copy: "${tx[0].msg}" / "${tx[1].msg}" / "${tx[3].msg}"`);
    assert(E('swornOf("tobin").join()') === 'mossy' && E('bondsOf("tobin").join()') === 'mossy,sword' && E('bondsOf("hero").join()') === 'sword,banner' && E('bondsOf("hero", true).length') === 8,
      'swornOf, bondsOf (the hero\'s Bonds are its class\'s, or all 8)');
    const c = J(g, 'bondCounts()');
    assert(c.total === 21 && c.sworn === 1 && c.met === 1 && c.maxLv === 5 && c.byLv[0] === 20, `bondCounts() for achievements: ${JSON.stringify(c)}`);
    // growth: live, only while both are in the party; benching pauses, never resets
    E('S.bond.t = {}; S.bond.lv = {}; setSlots({ front: "hero", mid: "bram", back: "tobin" })');
    ticks(g, 100);
    const t1 = { sword: E('bondTime("sword")'), mossy: E('bondTime("mossy")'), hunting: E('bondTime("hunting")') };
    assert(Math.abs(t1.sword - 10) < 0.05 && Math.abs(t1.mossy - 10) < 0.05 && t1.hunting === 0 && E('partyBonds().join()') === 'mossy,sword', `fighting 10 s: The Borrowed Sword and Mossy Hollow +10 s; Hunting Party (Wren benched) 0 (${JSON.stringify(t1)})`);
    E('setSlots({ front: "hero", mid: "wren", back: "tobin" })'); ticks(g, 50);
    assert(Math.abs(E('bondTime("mossy")') - t1.mossy) < 1e-9 && Math.abs(E('bondTime("sword")') - 15) < 0.05, 'benching Bram pauses Mossy Hollow; the time is kept');
    E('S.activity = "gather"'); const s0 = E('bondTime("sword")');
    E('setSlots({ front: "hero", mid: "bram", back: "tobin" })'); const m0 = E('bondTime("mossy")'); ticks(g, 100);
    assert(Math.abs(E('bondTime("mossy")') - m0 - 10 * E('FORM_TUNE.bondCamp')) < 0.05 && Math.abs(E('bondTime("sword")') - s0) < 1e-9, 'at the Hearth while the hero gathers: companion pairs x0.5, hero pairs pause');
    E('S.activity = "fight"; charRec("tobin").lv = 25'); const m1 = E('bondTime("mossy")'); ticks(g, 100);
    assert(Math.abs(E('bondTime("mossy")') - m1 - 10 * 1.5) < 0.05 && E('bondOldFriend("mossy")') && E('bondInfo("mossy").rate') === 1.5, 'Old Friend (Tobin L25): Mossy Hollow grows x1.5, once per Bond');
    // away: the fight branch at bondAway
    const a0 = E('bondTime("sword")'); E(`awayGains(${2 * HR})`);
    assert(Math.abs(E('bondTime("sword")') - a0 - 2 * HR * E('FORM_TUNE.bondAway') * 1.5) < 1, `away 2 h fighting: +${((E('bondTime("sword")') - a0) / HR).toFixed(2)} h (x${E('FORM_TUNE.bondAway')}, Old Friend x1.5)`);
    // expeditions: companion pairs on one team grow for the time out
    const e0 = E('bondTime("oldoath")'); E(`emit('expedBack', { r: 'r1a', team: ['aldric', 'elowen'], secs: ${4 * HR}, auto: true })`);
    assert(Math.abs(E('bondTime("oldoath")') - e0 - 4 * HR * 1.5) < 1e-6, 'an expedition team (Aldric, Elowen) grows The Old Oath for its 4 h out (Old Friend: Elowen is Legendary)');
    // stories: titles from SYNERGIES; locked until the level; no text = "Story coming soon" (nothing to read)
    const stp = J(g, 'bondStories("hunting")');
    assert(stp.length === 2 && stp[0].title === 'Bats and Birches' && stp[1].title === 'The Winter Larder' && !stp[0].open && stp[0].lv === 2 && stp[1].lv === 4, 'Hunting Party stories: titles, story 1 at Friends, story 2 at Close');
    E('bondSet("hunting", 4)');
    assert(!E('bondRead("hunting", 0)') && E('bondUnread("hunting")') === 0 && E('bondSworn("hunting")') === null, 'no text yet: nothing to read, no dot');
    E('BOND_STORIES.hunting = [{ title: "Bats and Birches", text: "One." }, { title: "The Winter Larder", text: "Two." }]; BOND_SWORN.hunting = "Three."');
    assert(E('bondUnread("hunting")') === 2 && !E('bondRead("hunting", 1)') && E('bondRead("hunting", 0)') && E('bondRead("hunting", 1)') && !E('bondRead("hunting", 1)') && E('S.bond.seen.hunting') === 2 && E('bondUnread("hunting")') === 0,
      'with text: two unread (the dot), read in order, once each (S.bond.seen)');
    assert(E('bondSworn("hunting")') === null && (E('bondSet("hunting", 5)'), E('bondSworn("hunting")')) === 'Three.' && E('swornOf("wren").includes("hunting")'), 'the Sworn line shows at Sworn; swornOf feeds D5');
    E('delete BOND_STORIES.hunting; delete BOND_SWORN.hunting');
    errs.push(...g.errors);
  }
  // C5: seeds for old saves, from the old field; a new game gets none; one What's new pair of lines
  {
    const FIX = ['save-v2.json', 'save-a-v1.json', 'save-mid-v2.json', 'save-v2-late.json', 'save-v3-four.json'];
    for (const f of FIX) {
      const raw = JSON.parse(rawOf(f));
      const g = loadCore({ seed: 72, storage: memoryStorage({ [KEY]: JSON.stringify(raw) }) });
      const news = []; g.fn.on('whatsNew', w => { if (/Bonds/.test(w.msg)) news.push(w.msg); });
      const quiet = []; g.fn.on('bondLevel', e => quiet.push(e));
      ticks(g, 5);
      const b = J(g, 'S.bond'), old = J(g, 'S.party.formOld && S.party.formOld.field') || [], cls = J(g, 'S.party.cls');
      const max = Math.max(0, ...Object.values(b.t));
      assert(b.v === 1 && max <= 36 * HR + 5 && !g.errors.length, `C5 ${f}: seeded once (v 1); no Bond above 36 h (${(max / HR).toFixed(1)} h); ${Object.keys(b.t).length} Bonds seeded`);
      const conv = J(g, `SYNERGIES.filter(s => s.layer === 'bond' && ${JSON.stringify(['oldoath', 'lampward', 'kindlestar', 'markleap', 'hunting', 'bellsong', 'waxkindle', 'mirelamp', 'oldenemies', 'chosen'])}.includes(s.id)).map(s => ({ id: s.id, pair: s.pair, cls: s.cls || null }))`);
      const active = conv.filter(d => d.pair.every(k => k === 'hero' ? cls === d.cls : old.includes(k)));
      for (const d of active) {
        const s = J(g, `(() => { const r = { t: bondTime("${d.id}"), lv: bondLevel("${d.id}") }; return r; })()`);
        const strong = d.pair.some(k => k !== 'hero' && (J(g, `ROSTER.${k}.rarity`) === 'legendary' || J(g, `charRec("${k}").lv`) >= 25));
        assert(s.t >= 12 * HR && s.lv >= 3 && (!strong || s.lv === 4), `C5 ${f}: ${d.id} was active in the old field: ${(s.t / HR).toFixed(0)} h, ${J(g, `BOND_LV_NAME[${s.lv}]`)}${strong ? ' (it had the L25 Bond strength)' : ''}`);
      }
      assert(news.length === (J(g, 'rosterList().length') ? (Object.values(b.t).some(t => t >= 0.5 * HR) ? 2 : 1) : 0) && quiet.every(e => e.quiet) && Object.keys(b.lv).every(id => b.lv[id] === J(g, `bondLevel("${id}")`)),
        `${f}: What's new: ${news.map(m => `"${m}"`).join(' + ') || 'none'}; seeded levels announced quietly`);
      // not weaker: every converted pair active in the old field that is still together keeps its old strength (1 x Common Cause) or more
      const now = J(g, 'activeSynergies()').filter(a => active.some(d => d.id === a.id));
      assert(now.every(a => a.strength >= (a.members.some(k => k !== 'hero' && J(g, `ROSTER.${k}.rarity`) === 'common') ? 1.25 : 1) - 1e-9), `${f}: converted pairs still fielded are at least as strong as before (${now.map(a => `${a.id} ${a.strength}`).join(', ') || 'none still fielded'})`);
      errs.push(...g.errors);
    }
    const n = loadCore({ seed: 73 }); const nn = []; n.fn.on('whatsNew', w => { if (/Bonds/.test(w.msg)) nn.push(w.msg); }); ticks(n, 5); n.eval('S.L = 5; S.maxZone = 9'); ticks(n, 5);
    assert(n.eval('S.bond.v') === 1 && n.eval('Object.keys(S.bond.t).filter(k => S.bond.t[k] > 1).length') === 0 && !nn.length, 'C5 a new game: nothing seeded, no Bond line');
  }
  // formQuick (F3's quick score): pure, finite, reads combos, Bonds and Out of place
  {
    const g = loadCore({ seed: 74 }), E = s => g.eval(s);
    ticks(g, 3);
    E('chooseClass("warden"); ["tobin", "wren", "hesketh", "pip", "bram", "kestrel", "oriel", "aldric", "elowen", "maren", "anselm", "corvin"].forEach(k => { unlockChar(k, "test", true); charRec(k).lv = 40; }); S.party.autoField = false; S.maxZone = 20; S.L = 30');
    const s0 = E('JSON.stringify(S)');
    const home = J(g, 'formQuick({ front: "hero", mid: "wren", back: "hesketh" })'), away = J(g, 'formQuick({ front: "hesketh", mid: "wren", back: "hero" })');
    assert(E('JSON.stringify(S)') === s0 && home.d > 0 && home.st > 0 && Number.isFinite(home.d) && home.front && home.sup && !away.front && home.syn.some(x => x.id === 'hearth') && home.syn.some(x => x.id === 'anvil'),
      `formQuick: pure; Warden, Wren, Hesketh at home: d ${home.d.toExponential(2)}, st ${home.st.toExponential(2)}, ${home.syn.map(x => x.id).join(' + ')}`);
    assert(away.d < home.d, `out of place and without Lifeline or Hammer and Anvil the same trio scores less (x${(away.d / home.d).toFixed(2)})`);
    const b0 = J(g, 'formQuick({ front: "tobin", mid: "hero", back: "bram" })'); E('bondSet("mossy", 5)'); const b5 = J(g, 'formQuick({ front: "tobin", mid: "hero", back: "bram" })');
    assert(b5.d > b0.d && b5.syn.some(x => x.id === 'mossy' && x.lv === 5), `a Sworn Mossy Hollow raises the score (x${(b5.d / b0.d).toFixed(3)})`);
    const cast = J(g, 'formQuick({ front: "hero", mid: "kestrel", back: "oriel" })');
    assert(cast.d > cast.st, 'a caster adds splash to pack damage, not to single-target damage');
    // speed: a planner's 66 pairs x 6 orders
    const ids = ['tobin', 'wren', 'hesketh', 'pip', 'bram', 'kestrel', 'oriel', 'aldric', 'elowen', 'maren', 'anselm', 'corvin'];
    const ms = E(`(() => { const ids = ${JSON.stringify(ids)}, P = [['front','mid','back'],['front','back','mid'],['mid','front','back'],['mid','back','front'],['back','front','mid'],['back','mid','front']];
      let best = Infinity;
      for (let r = 0; r < 5; r++) {
        const t = Date.now(), q = formQuickPrep();
        for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) for (const o of P) { const tr = {}; tr[o[0]] = 'hero'; tr[o[1]] = ids[i]; tr[o[2]] = ids[j]; formQuick(tr, q); }
        best = Math.min(best, Date.now() - t);
      }
      return best; })()`);
    console.log(`       INFO formQuick: 66 pairs x 6 orders (one formQuickPrep) in ${ms.toFixed(1)} ms (Node, best of 5)`);
    assert(ms < 40, `formQuick with a prep is cheap enough for the planner's quick pass (${ms.toFixed(1)} ms for 396; the same numbers with or without the prep)`);
    const q1 = J(g, 'formQuick({ front: "hero", mid: "wren", back: "hesketh" }, formQuickPrep())');
    assert(Math.abs(q1.d / home.d - 1) < 1e-9, 'a prep gives the same score as a fresh read');
    errs.push(...g.errors);
  }
  // combat: Rearguard takes dives meant for an ally; Two Lights stand allies up at 45%
  {
    const g = loadCore({ seed: 75 }), E = s => g.eval(s);
    ticks(g, 3);
    E('almanac.force("none"); chooseClass("ranger"); ["tobin", "hesketh", "anselm"].forEach(k => { unlockChar(k, "test", true); charRec(k).lv = 30; }); S.party.autoField = false; S.auto = false; S.maxZone = 12; setZone(10)');
    E('setSlots({ front: "hero", mid: "hesketh", back: "tobin" })'); ticks(g, 2);
    const hp = E(`(() => { const f = combatFoes().find(x => x.hp > 0); const m = cbUnitByKey("hesketh"), t = cbUnitByKey("tobin"); m.hp = m.maxHp; t.hp = t.maxHp; f.diveT = 2; f.first = 1; onFoeAttack(f, m); f.diveT = 0; return [m.hp / m.maxHp, t.hp / t.maxHp]; })()`);
    assert(hp[0] === 1 && hp[1] < 1, `Rearguard: a dive on Hesketh hits Tobin in Back instead (${hp.map(x => x.toFixed(3)).join(' / ')})`);
    E('setSlots({ front: "hero", mid: "anselm", back: "hesketh" })'); ticks(g, 2);
    assert(E('synParty().revive') === 0.45 && E('activeSynergies().some(a => a.id === "twolights")'), 'Two Lights (Anselm, Hesketh): allies stand up at 45%');
    errs.push(...g.errors);
  }
  // Bond writing (LORE7 fills 21f): every entry names a Bond, keeps the canon titles, has text and one Sworn sentence
  {
    const g = loadCore({ seed: 76 });
    const bad = J(g, `(() => { const out = [];
      for (const id of Object.keys(BOND_STORIES)) { const d = SYNERGIES.find(s => s.id === id && s.layer === 'bond'), e = BOND_STORIES[id];
        if (!d) { out.push(id + ': not a Bond'); continue; }
        if (!Array.isArray(e) || e.length !== 2 || e.some((x, i) => !x || x.title !== d.stories[i] || !(typeof x.text === 'string' && x.text.trim().length > 20))) out.push(id + ': two stories with the canon titles and text'); }
      for (const id of Object.keys(BOND_SWORN)) { const l = BOND_SWORN[id]; if (!BOND_IDS.includes(id) || !(typeof l === 'string' && l.trim().length > 5 && l.length < 200)) out.push(id + ': Sworn line'); }
      return out; })()`);
    assert(!bad.length, `21f-stories-bonds.js: ${J(g, 'Object.keys(BOND_STORIES).length')} of 21 Bonds written, ${J(g, 'Object.keys(BOND_SWORN).length')} Sworn lines; every entry well-formed` + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
  assert(!errs.length, 'no Bond errors' + (errs.length ? ': ' + errs[0] : ''));
} catch (e) { fail('bonds crashed: ' + (e.stack || e)); }

// ---- regions and the Great Lantern (22-data-regions.js, 40-rules.js, 55-lantern.js; plan-2 task R0) ----
console.log('regions and the Great Lantern');
try {
  const FIX = ['save-v2.json', 'save-a-v1.json', 'save-mid-v2.json', 'save-v2-late.json'];
  const rawOf = f => fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
  const ticks = (g, n) => { for (let i = 0; i < n; i++) g.fn.tick(0.1); };
  const watch = g => { const ev = { gl: [], news: [] }; g.fn.on('greatLantern', e => ev.gl.push(JSON.parse(JSON.stringify(e)))); g.fn.on('whatsNew', w => ev.news.push(w.msg)); return ev; };
  // zone functions: zones 1-35 read exactly as the old 7-zone cycle, with every fixture loaded
  const OLD = `(() => { const out = []; const T = z => (z - 1) % 7, C = z => Math.floor((z - 1) / 7);
    for (let z = 1; z <= 35; z++) {
      const nm = ZONES[T(z)] + (C(z) ? ' ' + roman(C(z) + 1) : '');
      if (zoneType(z) !== T(z) || zonePlace(z) !== T(z) || zoneCycle(z) !== C(z) || zoneName(z) !== nm || zoneNextType(z) !== (T(z) + 1) % 7
        || zoneTheme(z) !== ZONE_THEME[T(z)] || zoneHue(z) !== (C(z) * 70) % 360 || zoneUnique(z) !== ZONE_UNIQ[T(z)] || zoneHome(z) !== CRAFT_HOME[T(z)]) out.push(z);
    }
    return out; })()`;
  for (const f of FIX) {
    const raw = JSON.parse(rawOf(f));
    const g = loadCore({ seed: 61, storage: memoryStorage({ [KEY]: JSON.stringify(raw) }) });
    const bad = g.eval(OLD);
    assert(!bad.length && g.eval('S.maxZone') === raw.maxZone && g.eval('S.zone') === raw.zone && g.eval('JSON.stringify(S.found)') === JSON.stringify(raw.found || {})
      && g.eval('JSON.stringify(S.mastery && S.mastery.zones || {})') === JSON.stringify(raw.mastery && raw.mastery.zones || {}),
      `${f}: zone type, place, cycle, name, next type, theme, hue, unique and home ground for zones 1-35 are the old ones${bad.length ? ' (differs at ' + bad.join(', ') + ')' : ''}; zone, max zone, uniques and mastery kept`);
  }
  const g = loadCore({ seed: 62 }), E = s => g.eval(s);
  // region lookup at the seams
  assert(E('regionOf(1).id') === 'hollow' && E('regionOf(35).id') === 'hollow' && E('regionOf(36).id') === 'coast' && E('regionOf(70).id') === 'coast' && E('regionOf(71).id') === 'coast'
    && E('zonePlace(36)') === 0 && E('zoneCycle(36)') === 0 && E('zonePlace(70)') === 6 && E('zoneCycle(70)') === 4 && E('zoneCycle(71)') === 5
    && E('regionBossZone(35) && regionBossZone(70) && !regionBossZone(36)'), 'regions: 35 is the Hollow, 36 and 70 the Coast (place 0 cycle I, place 6 cycle V), 71 stays on the Coast (cycle VI)');
  // the coast before R2-1 plugs in: the Hollow's types at the same places (the balance stays), its own names
  const plugged = E('REGIONS[1].plugged');
  if (!plugged) {
    assert(E('(() => { for (let z = 36; z <= 90; z++) if (zoneType(z) !== (z - 1) % 7 || zoneNextType(z) !== z % 7 || zoneUnique(z) !== ZONE_UNIQ[(z - 1) % 7]) return false; return true; })()'),
      'coast placeholder: zones 36-90 keep the Hollow foe types, packs and uniques they had');
    const names = E('[36, 37, 43, 70, 71].map(zoneName)');
    assert(names.every(n => n && !/undefined/.test(n) && !E('ZONES').some(h => n.startsWith(h))) && names[0] !== names[1] && /II$/.test(names[2]) && /V$/.test(names[3]) && /VI$/.test(names[4]),
      `coast placeholder names read as their own places: ${names.join(', ')}`);
  } else {
    assert(E('TYPES.length') >= 14 && E('zoneType(36)') >= 7, 'the coast is plugged in (22-data-coast.js): its own types');
  }
  // the Great Lantern: fires once, on the first kill of the zone 35 boss
  const ev = watch(g);
  E('S.L = 40; S.maxZone = 35; S.zone = 35'); ticks(g, 3);
  const pts0 = E('starPoints()');
  assert(E('S.lantern.seen') === 35 && !ev.gl.length && JSON.stringify(E('S.lantern.lit')) === '{}', 'a save at zone 35: no Great Lantern yet');
  E('S.maxZone++; S.zone++; emit("zoneClear", { zone: 35 })');   // what 50-sim does on the first boss kill
  ticks(g, 3);
  const c0 = E('COAST_STORY[0]'), e0 = ev.gl[0] || {};
  assert(ev.gl.length === 1 && e0.quiet === false && e0.region === 'hollow' && e0.n === 1 && e0.zone === 35 && e0.head === c0.head && e0.text === c0.text && !ev.news.length,
    `the zone 35 boss's first kill: one Great Lantern card ("${e0.head}"), story beat 0, no bell line`);
  assert((e0.rewards || []).some(r => r.txt === '+4 star points') && E('starPoints()') === pts0 + 4 && E('greatLanternsLit()') === 1,
    'constellations: the card lists +4 star points and they are granted (greatLanternsLit 1)');
  E('S.zone = 35; emit("zoneClear", { zone: 35 }); S.maxZone = 40; S.zone = 40'); ticks(g, 5);
  const saved = E('save(), 1') && g.storage.get(KEY);
  const g2 = loadCore({ seed: 63, storage: memoryStorage({ [KEY]: saved }) }), ev2 = watch(g2);
  ticks(g2, 5);
  assert(ev.gl.length === 1 && E('starPoints()') === pts0 + 4 && E('S.lantern.lit.hollow') > 0 && !ev2.gl.length && !ev2.news.length && g2.eval('greatLanternsLit()') === 1,
    'it fires once: not on a rematch, not further on, not after a reload; the points stay +4');
  E('S.maxZone = 71; S.zone = 71'); ticks(g, 2);
  assert(ev.gl.length === 2 && ev.gl[1].region === 'coast' && ev.gl[1].n === 2 && ev.gl[1].head === E('COAST_STORY[5].head') && E('greatLanternsLit()') === 2 && !g.errors.length,
    'the zone 70 boss lights the second (the Coast, beat 5)');
  // old saves past zone 35: a bell line, not the card; once
  for (const f of FIX) {
    const raw = JSON.parse(rawOf(f));
    const h = loadCore({ seed: 64, storage: memoryStorage({ [KEY]: JSON.stringify(raw) }) }), hv = watch(h);
    const p0 = h.eval('starPoints()');
    ticks(h, 30);
    const past = raw.maxZone > 35;
    const again = loadCore({ seed: 65, storage: memoryStorage({ [KEY]: (h.eval('save(), 1'), h.storage.get(KEY)) }) }), av = watch(again);
    ticks(again, 30);
    assert(past ? hv.gl.length === 1 && hv.gl[0].quiet === true && hv.news.filter(m => m.startsWith(hv.gl[0].head)).length === 1 && !/star points/.test(hv.news.find(m => m.startsWith(hv.gl[0].head)) || '')
        : !hv.gl.length && !hv.news.some(m => /Great Lantern/.test(m)),
      past ? `${f} (zone ${raw.maxZone}): one bell line, no card: "${hv.news.find(m => /Great Lantern/.test(m))}"` : `${f} (zone ${raw.maxZone}): nothing yet`);
    assert(!av.gl.length && !av.news.some(m => /Great Lantern/.test(m)) && h.eval('starPoints()') === p0 && !h.errors.length,
      `${f}: nothing more after a reload; star points unchanged (${p0})`);
  }
  // the Lantern Road
  const road = E('lanternRoad()');
  assert(road.length === 3 && road[0].lit && road[1].lit && !road[2].lit && road[2].beyond && road[1].here, 'lanternRoad(): Hollow and Coast lit, the Emberwaste dark beyond, the party on the Coast');
} catch (e) { fail('regions and the Great Lantern crashed: ' + (e.stack || e)); }

// ---- G1: tools in hand and Well Rested (11c-art-tools.js, 55-rested.js; plan-3 asks 1 and 2) ----
console.log('tools and Well Rested');
try {
  const g = loadCore({ seed: 31 }), E = s => g.eval(s);
  // tools: the right one per skill, tier from the skill level, and every class builds holding each
  const tf = E(`(() => { S.skills.mine.lv = 1; S.skills.wood.lv = NODE_REQ[2]; S.skills.forage.lv = 99;
    return ['mine', 'wood', 'forage', 'fish', 'smith'].map(k => toolFor(k)); })()`);
  // H2: the stage draws the EQUIPPED tool; an empty slot is the rough tool (drawn as tier 1, plain).
  assert(tf[0].k === 'pick' && tf[0].t >= 1 && /Pick/.test(tf[0].name) && tf[1].k === 'axe' && tf[2].k === 'sickle'
    && tf[3].k === 'rod' && tf[4] === null, `toolFor: ${tf.slice(0, 4).map(t => t.name).join(', ')}; none for Smithing`);
  const art = E(`(() => {
    const bad = [], num = s => s.t === 'p' ? s.pts.every(Number.isFinite) : [s.cx, s.cy, s.x1, s.y1, s.x2, s.y2, s.x, s.y].filter(v => v !== undefined).every(Number.isFinite);
    let n = 0, lamps = 0;
    for (const cls in AK.CLASSES) for (const k of Object.keys(TOOL_ART.KINDS)) for (const t of [1, 3, 5]) {
      const def = TOOL_ART.gatherDef(AK.CLASSES[cls], { k, t, r: t === 5 ? 2 : 0 }), gg = {};
      for (const s in def.slots) gg[s] = s === 'weapon' || s === 'off' ? null : AK.gearMats(def.slots[s], t, 0);
      for (const pose of [{}, { bob: 1 }, AK.ANIMS[def.anim].wind, AK.ANIMS[def.anim].strike]) {
        const kit = AK.makeKit(def, pose); def.build(kit, gg, { skin: AK.m(AK.SKINS[1], 'skin'), hair: AK.m(AK.HAIRS[0], 'hair') }); n++;
        if (kit.parts.length < 15 || !kit.parts.every(p => p.m && p.m.hex && num(p.s))) bad.push(cls + ':' + k + t);
        if (kit.parts.some(p => p.m.kind === 'glow' && !p.o.nolight)) lamps++;
      }
    }
    const same = TOOL_ART.gatherDef(AK.CLASSES.warden, { k: 'pick', t: 2 }) === TOOL_ART.gatherDef(AK.CLASSES.warden, { k: 'pick', t: 2, r: 0 });
    const spec = TOOL_ART.gatherSpec({ cls: 'ranger', skin: 1, gear: { weapon: { t: 3, r: 1 }, off: { t: 1, r: 0 }, head: { t: 2, r: 0 }, body: { t: 1, r: 0 } } }, toolFor('mine'));
    return { bad: [...new Set(bad)], n, lamps, same, spec };
  })()`);
  assert(!art.bad.length && art.n === 4 * 4 * 3 * 4, `every class builds with every tool, tier and swing (${art.n} kits)` + (art.bad.length ? ': ' + art.bad.join(', ') : ''));
  assert(art.lamps === art.n, 'every gathering hero carries a lit lantern (the Lightkeeper gets a hip lantern)');
  assert(art.same && !art.spec.gear.weapon && !art.spec.gear.off && art.spec.gear.head && art.spec.tool.k === 'pick' && art.spec.skin === 1, 'gather spec: no weapon or off-hand, keeps the look, one cached outfit per class, tool and tier');

  // Well Rested: state and defaults
  assert(E('S.rested && S.rested.left === 0 && fresh().rested.left === 0'), 'new game: S.rested = { left: 0 }');
  for (const f of ['save-v2.json', 'save-v2-late.json']) {
    const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8'));
    const h = loadCore({ storage: memoryStorage({ [KEY]: JSON.stringify(raw) }) });
    const d = subsetDiff(raw, JSON.parse(JSON.stringify(h.eval('S'))));
    assert(!raw.rested && h.eval('S.rested.left === 0 && mod("dmg") > 0') && !d && !h.errors.length, `${f}: old save gets Well Rested { left: 0 }, nothing lost` + (d ? ': ' + d : ''));
  }
  {
    const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'save-v2.json'), 'utf8'));
    raw.rested = { left: 77.5, later: 'kept' };
    const h = loadCore({ storage: memoryStorage({ [KEY]: JSON.stringify(raw) }) });
    h.fn.save();
    const back = JSON.parse(h.storage.get(KEY)).rested;
    assert(back.left === 77.5 && back.later === 'kept', 'a saved Well Rested (and any later field in it) survives a load and save');
  }

  // building it: gather with a party fielded; the hero gathers alone, companions do not change
  E('chooseClass("warden", "Tess"); S.maxZone = 6; S.zone = 5; S.auto = false');
  const run = secs => { for (let t = 0; t < secs; t += 0.1) g.fn.tick(0.1); };
  run(20);
  const field = E('S.party.field.slice()'), lv0 = E('JSON.stringify(S.party.field.map(k => charRec(k).lv))');
  // the Well Rested share of mod('dmg'): the same moment with nothing banked
  const restX = () => E('(() => { const a = mod("dmg"), l = S.rested.left; S.rested.left = 0; const b = mod("dmg"); S.rested.left = l; return a / b; })()');
  E('setNode("ore", 1); setActivity("gather")');
  run(120);
  assert(Math.abs(E('S.rested.left') - 60) < 0.5 && E('!wellRested().on') && Math.abs(restX() - 1) < 1e-9, `2 min of gathering banks 1 min (${E('S.rested.left').toFixed(1)} s); no bonus while gathering`);
  run(600);
  assert(E('S.rested.left') === E('REST_TUNE.cap') && E('JSON.stringify(S.party.field.map(k => charRec(k).lv))') === lv0 && E('S.party.field.join()') === field.join(), `capped at ${E('REST_TUNE.cap')} s; the party stays fielded, its levels unchanged`);
  assert(/rests at the Hearth: \+10% damage for 3m 0s in your next fight \(full\)/.test(E('restNote()')), 'Gather tab line: ' + E('restNote()').trim());
  // using it: a fight gets +10%, and it runs down only while fighting
  const toasts = []; g.fn.on('toast', t => toasts.push(t.msg));
  E('setActivity("fight")');
  const ratio = restX();
  assert(Math.abs(ratio - (1 + E('REST_TUNE.dmg'))) < 1e-9 && E('wellRested().on'), `fighting: damage x${ratio.toFixed(2)}`);
  assert(toasts.some(m => m === 'Well Rested: +10% damage for 3 min.'), 'toast on the way to the fight: ' + toasts.find(m => /Well Rested/.test(m)));
  run(60);
  assert(Math.abs(E('S.rested.left') - 120) < 0.5, `a minute of fighting uses a minute (${E('S.rested.left').toFixed(1)} s left)`);
  run(125);
  assert(E('S.rested.left') === 0 && E('!wellRested().on'), 'used up after 3 minutes of fighting: damage back to normal');
  // no party fielded: nothing to bank
  E('S.party.field = []; setActivity("gather")'); run(60);
  assert(E('S.rested.left') === 0 && E('restNote()') === '', 'nobody fielded: no Well Rested');
  E('S.party.field = ' + JSON.stringify(field));

  // away: gathering banks it; away fights never count it and run it down
  E('setActivity("gather"); S.rested.left = 0');
  const ore0 = E('S.mats.ore[0]'), r1 = E('awayGains(3600)');
  assert(E('S.rested.left') === E('REST_TUNE.cap') && E('S.mats.ore[0]') > ore0 && /^You kept working/.test(r1.note), `away gathering: ore +${E('S.mats.ore[0]') - ore0}, Well Rested full; note "${r1.note}"`);
  const snap = E('JSON.stringify(S)');
  const awayGold = left => {
    const h = loadCore({ seed: 5, storage: memoryStorage({ [KEY]: snap }) });
    h.eval(`S.activity = 'fight'; S.rested.left = ${left}; S.last = Date.now()`);
    const g0 = h.eval('S.gold'); h.eval('awayGains(1800)');
    return { gold: h.eval('S.gold') - g0, left: h.eval('S.rested.left'), errs: h.errors.length };
  };
  const a0 = awayGold(0), a1 = awayGold(180);
  assert(a0.gold > 0 && Math.abs(a1.gold - a0.gold) < 1e-6 * a0.gold && a1.left === 0 && !a0.errs && !a1.errs, `away fighting: the same gold with or without Well Rested (${Math.round(a0.gold)}), and it is used up`);
  assert(!g.errors.length, 'no Well Rested errors' + (g.errors.length ? ': ' + g.errors[0] : ''));
} catch (e) { fail('tools and Well Rested crashed: ' + (e.stack || e)); }

// ---- cold hearth (55-hearth.js, H1): a new game starts at an unlit fire and builds each station ----
console.log('cold hearth');
try {
  const errs = [];
  const rawOf = f => fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
  const STN = ['forge', 'bench', 'loom', 'ench', 'tavern'];
  const clock = g => g.eval('Date.__t = Date.now(); Date.now = () => Date.__t');   // camp timers follow the check's clock
  const tickS = (g, secs) => { for (let i = 0; i < secs * 10; i++) { g.fn.tick(0.1); if (i % 10 === 9) g.eval('Date.__t += 1000'); } };
  // a new game is cold
  const g = loadCore({ seed: 21, cold: true }); clock(g);
  const E = s => g.eval(s);
  assert(E('S.hearth.cold === 1 && S.hearth.lit === 0 && hearthCold() && !hearthLit()'), 'a new game starts at a cold Hearth');
  assert(E(`${JSON.stringify(STN)}.every(id => campLevel(id) === 0) && campLevel('hearth') === 0 && !campOpen()`), 'stations and Hearth at 0, no camp yet');
  assert(E('S.activity === "gather" && S.node.kind === "wood" && S.node.t === 1 && target() === "node"'), 'the hero chops the grove by the fire');
  assert(E('!campList().includes("bench") && campCan("bench").why === "Light the fire first."'), 'nothing to build before the fire: ' + E('campCan("bench").why'));
  E('S.mats.ore[0] = 50; S.mats.wood[0] = 50; S.mats.ore[1] = 50');
  assert(E('canCraft("pick", 1).why') === 'Build the Workbench first.' && !E('craftItem("pick", 1)'), 'crafting refused: "Build the Workbench first."');
  assert(/Build the Forge first\./.test(E('canCraft(Object.keys(CRAFT_KINDS).find(k => CRAFT_KINDS[k].st === "forge" && !CRAFT_KINDS[k].legacy), 1).why')), 'the Forge too');
  assert(/Build the Enchanter/.test(E('canTransmute("ore", 2, "down").why')) && !E('brewTonic(Object.keys(CRAFT_TONICS)[0], 1)'), "Transmute and Tonics wait for the Enchanter's Table");
  E('S.mats.ore = [0, 0, 0, 0, 0]; S.mats.wood[0] = 5');
  assert(!E('hearthLight()') && E('hearthCan().why') === '3 more Oak Log', 'the fire needs 8 Oak Log: ' + E('hearthCan().why'));
  const ev = []; g.fn.on('campOpen', e => ev.push('campOpen:' + e.quiet)); g.fn.on('hearthLit', () => ev.push('lit'));
  E('S.mats.wood[0] = 8');
  assert(E('hearthLight()') && E('S.mats.wood[0]') === 0 && E('S.hearth.lit > 0 && campOpen() && campLevel("hearth") === 1 && S.activity === "fight"'), 'hearthLight(): pays 8 Oak, Hearth 1, the camp opens, the hero walks out to fight');
  assert(ev.join() === 'campOpen:false,lit' && !E('hearthLight()'), 'campOpen { quiet: false } and hearthLit, once');
  assert(E('campList().includes("bench") && !campList().includes("forge") && !campList().includes("loom")'), 'the Workbench plot opens with the fire (the Forge and Loom wait)');
  const c1 = E('campCost("bench", 1)');
  assert(c1.gold === 0 && JSON.stringify(c1.mats) === '[["wood",1,20]]' && c1.secs === 30, `Workbench Lv 1: 20 Oak, no gold, 30 s (${JSON.stringify(c1.mats)}, ${c1.gold} gold, ${c1.secs} s)`);
  assert(E('JSON.stringify(campCost("bench", 2))') === E('(() => { const f = hearthFirst; hearthFirst = () => null; try { return JSON.stringify(campCost("bench", 2)); } finally { hearthFirst = f; } })()'), 'Lv 2 keeps the old row');
  E('S.mats.wood[0] = 20');
  assert(E('campBuild("bench")') && E('S.mats.wood[0]') === 0, 'Workbench building');
  tickS(g, 31);
  assert(E('campLevel("bench") === 1 && campList().includes("forge")'), 'Workbench built after 30 s; the Forge plot opens');
  E('S.mats.ore[0] = 4; S.mats.wood[0] = 4');
  let toolDone = false; g.fn.on('onboardStep', e => { if (e.id === 'tool') toolDone = true; });
  assert(E('!!craftItem("pick", 1)') && toolDone, "a Copper Pickaxe made at the Workbench; the guide's tool step is done");
  E('S.mats.ore[0] = 25; S.mats.wood[0] = 10');
  assert(E('campBuild("forge")'), 'the Forge building (25 Copper, 10 Oak)'); tickS(g, 61);
  assert(E('campLevel("forge") === 1 && canCraft(Object.keys(CRAFT_KINDS).find(k => CRAFT_KINDS[k].st === "forge" && !CRAFT_KINDS[k].legacy), 1).why !== "Build the Forge first."'), 'Forge built after 60 s: its recipes open');
  if (E('!!CAMP_B.store')) assert(E('campList().includes("store")'), 'the Storehouse plot opens with the Forge');
  assert(E('!campList().includes("loom") && !campList().includes("ench") && !campList().includes("tavern")'), "Loom, Enchanter's Table and Tavern plots wait for their zones");
  E('S.maxZone = 5'); assert(E('campList().includes("loom") && !campList().includes("ench")'), 'zone 5: the Loom plot');
  E('S.maxZone = 6'); assert(E('campList().includes("ench") && !campList().includes("tavern")'), "zone 6: the Enchanter's Table plot");
  E('S.maxZone = 8'); assert(E('campList().includes("tavern")'), 'zone 8: the Tavern plot');
  E('S.maxZone = 1');
  assert(E('JSON.stringify(campCost("tavern", 1).mats)') === '[["wood",1,40],["herb",1,20]]' && E('campCost("ench", 1).secs') === 180, "Tavern and Enchanter's Table rows as the spec (1.3)");
  // round trip: a cold save stays cold and keeps what it built
  g.fn.save();
  const g2 = loadCore({ seed: 22, cold: true, storage: memoryStorage({ [KEY]: g.storage.get(KEY) }) });
  assert(g2.eval('hearthCold() && hearthLit() && campLevel("bench") === 1 && campLevel("forge") === 1 && campLevel("loom") === 0 && campOpen()'), 'reload: still a cold save, stations as built');
  // a reload before the fire (no progress yet): not set up twice, still cold
  const g3 = loadCore({ seed: 23, cold: true }); g3.eval('S.mats.wood[0] = 3; save()');
  const g4 = loadCore({ seed: 24, cold: true, storage: memoryStorage({ [KEY]: g3.storage.get(KEY) }) });
  assert(g4.eval('hearthCold() && !hearthLit() && S.mats.wood[0] === 3 && campLevel("bench") === 0 && !campOpen()'), 'reload before the fire: the same cold start');
  // tools: a pristine cold start warms back (older sections, sim --cold 0); a lit one never does
  const w = loadCore({ seed: 25 });
  assert(w.eval(`!hearthCold() && ${JSON.stringify(STN)}.every(id => campLevel(id) === 1) && S.activity === 'fight'`) && !E('hearthWarm()'), 'hearthWarm(): the old warm start (tools only); a lit Hearth stays');
  w.eval('S.mats.ore[0] = 50; S.mats.wood[0] = 50');
  assert(w.eval('canCraft("pick", 1).ok'), 'a warm game crafts without building (the gate is for cold saves only)');
  errs.push(...g.errors, ...g2.errors, ...g3.errors, ...g4.errors, ...w.errors);

  // every fixture is warm: stations Lv 1, recipes and camp rows exactly as before, one What's new line
  for (const f of ['save-a-v1.json', 'save-v2.json', 'save-mid-v2.json', 'save-v2-late.json']) {
    const h = loadCore({ seed: 26, storage: memoryStorage({ [KEY]: rawOf(f) }) });
    const H = s => h.eval(s);
    const news = []; h.fn.on('whatsNew', x => news.push(x.msg));
    assert(H(`!hearthCold() && hearthLit() && ${JSON.stringify(STN)}.every(id => campLevel(id) >= 1)`), `${f}: warm, every station built`);
    const same = H(`(() => {
      const kinds = Object.keys(CRAFT_KINDS), all = () => JSON.stringify([kinds.map(k => [1, 2, 3, 4, 5].map(t => { const c = canCraft(k, t); return [c.ok, c.why]; })), canTransmute('ore', 2, 'down').why, campList(), campList().map(id => { const c = campCan(id); return [c.ok, c.why, c.cost]; })]);
      const a = all(), sw = hearthStationWhy, po = hearthPlotOpen, fi = hearthFirst;
      hearthStationWhy = () => ''; hearthPlotOpen = () => true; hearthFirst = () => null;
      try { return a === all(); } finally { hearthStationWhy = sw; hearthPlotOpen = po; hearthFirst = fi; }
    })()`);
    assert(same, `${f}: every recipe, Transmute and camp row exactly as without the Hearth rules`);
    const mats0 = JSON.stringify(H('S.mats')), items0 = H('S.items.length');
    for (let i = 0; i < 20; i++) h.fn.tick(0.1);
    assert(news.filter(m => /^Your stations were already built/.test(m)).length === 1 && H('S.hearth.said') === 1, `${f}: one What's new line: "${news.find(m => /stations/.test(m))}"`);
    const m0 = JSON.parse(mats0), m1 = H('S.mats');
    assert(Object.keys(m0).every(k => m0[k].every((n, i) => m1[k][i] >= n)) && H('S.items.length') >= items0 && H('!GUIDE_STEPS.some(x => ["chop", "light", "bench", "tool", "forge", "store"].includes(x.id) && x.when())'), `${f}: nothing taken, no cold-Hearth tips`);
    h.fn.save();
    const h2 = loadCore({ seed: 27, storage: memoryStorage({ [KEY]: h.storage.get(KEY) }) }); const n2 = []; h2.fn.on('whatsNew', x => n2.push(x.msg));
    for (let i = 0; i < 20; i++) h2.fn.tick(0.1);
    assert(!n2.some(m => /stations/.test(m)), `${f}: the line shows once`);
    errs.push(...h.errors, ...h2.errors);
  }

  // the first ten minutes, driving the core like a new player (warden, mixed play, spec 1.4)
  {
    const p = loadCore({ seed: 7, cold: true }); clock(p);
    const P = s => p.eval(s);
    P('chooseClass("warden"); ONBOARD.gate = true');
    const got = {}, marks = {};
    const now = () => P('Math.round(S.onboard.t)');
    const mark = k => { if (marks[k] === undefined) marks[k] = now(); };
    p.fn.on('unlock', e => { if (got[e.id] === undefined) got[e.id] = now(); });
    p.fn.on('campBuilt', e => mark(e.id + e.lv));
    p.fn.on('zoneClear', e => mark('zone' + (e.zone + 1)));
    p.fn.on('crafted', e => { const d = P(`CRAFT_KINDS[${JSON.stringify(e.kind)}] || {}`); if (d.tool) mark('tool'); if (d.pos === 'weapon') mark('weapon'); });
    const steps = []; p.fn.on('onboardStep', e => steps.push([e.id, now()]));
    const buy = () => P(`{ let n = 0; for (let k = 0; k < 50; k++) { const c = HERO_UPS.map(u => ({ u, p: plan(u.base, u.r, S[u.id], S.gold, u.cap, '1') })).filter(o => o.p.n > 0 && o.p.cost <= S.gold).sort((a, b) => a.p.cost - b.p.cost)[0]; if (!c) break; buyHero(c.u.id, '1'); n++; } n }`);
    const weapon = P('Object.keys(CRAFT_KINDS).find(k => CRAFT_KINDS[k].pos === "weapon" && !CRAFT_KINDS[k].legacy && fits(k, "weapon", "hero"))');
    // what the player gathers for: the next station, then the pickaxe, then the class weapon
    const want = () => P(`(() => {
      const nx = hearthNext(), need = [];
      if (campLevel('bench') >= 1 && !S.items.some(it => CRAFT_KINDS[it.slot] && CRAFT_KINDS[it.slot].tool)) for (const [f, n] of Object.entries(craftRecipe('pick', 1))) if (f !== 'gold') need.push([f, 1, n]);
      if (nx && nx !== 'hearth') { const c = campCan(nx); if (c.cost && !c.busy) for (const [f, t, n] of c.cost.mats) need.push([f, t, n]); }
      if (campLevel('forge') >= 1 && !equipped('weapon')) for (const [f, n] of Object.entries(craftRecipe(${JSON.stringify(weapon)}, 1))) if (f !== 'gold') need.push([f, 1, n]);
      for (const [f, t, n] of need) if (CRAFT_NODES[f] && (S.mats[f][t - 1] || 0) < n && S.skills[skillOf(f)].lv >= NODE_REQ[t - 1]) return [f, t, n];
      return null;
    })()`);
    let firstUp = null, gatherUntil = 0, trip = null;
    for (let sec = 0; sec < 10 * 60; sec++) {
      // taps go through the stage as the browser sends them: the 'tap' event, then the strike or the chop
      if (!P('hearthLit()')) { if (sec % 2 === 0) P('emit("tap", { node: target() === "node" }); playerTap({ x: 0.7, y: 0.5 })'); if (P('hearthCan().ok') && P('hearthLight()')) mark('lit'); }
      else {
        if (sec < 120 && sec % 3 === 0) P('emit("tap", { node: target() === "node" }); playerTap({ x: 0.7, y: 0.5 })');
        if (sec % 20 === 0) P('castAbility()');
        const nx = P('hearthNext()');
        if (nx && nx !== 'hearth' && P(`campCan(${JSON.stringify(nx)}).ok`)) P(`campBuild(${JSON.stringify(nx)})`);
        if (P('campLevel("bench") >= 1 && canCraft("pick", 1).ok && !S.items.some(it => CRAFT_KINDS[it.slot] && CRAFT_KINDS[it.slot].tool)')) { const it = P('craftItem("pick", 1)'); if (it) P(`equipItem(${it.id})`); }
        if (weapon && P(`canCraft(${JSON.stringify(weapon)}, 1).ok && !equipped("weapon")`)) { const it = P(`craftItem(${JSON.stringify(weapon)}, 1)`); if (it) P(`equipItem(${it.id})`); }
        // after the first boss the player gathers what the next build or recipe waits on, in short trips
        if (P('S.activity') === 'fight') {
          if (P('S.maxZone') >= 2 && sec >= gatherUntil) { trip = want(); if (trip && P(`setNode(${JSON.stringify(trip[0])}, ${trip[1]})`)) { P('setActivity("gather")'); gatherUntil = sec + 120; } }
        } else if (!trip || P(`S.mats.${trip[0]}[${trip[1] - 1}]`) >= trip[2] || sec >= gatherUntil) { trip = null; P('setActivity("fight")'); gatherUntil = sec + 20; }
      }
      if (firstUp === null && P('S.gold >= 10')) firstUp = now();
      // the UI asks for the step to show about 4 times a second; the player follows a tab hint and taps Next Up
      const st = P('(s => s && s.id)(onboardStep())');
      if (st && st.startsWith('tab:')) P(`S.onboard.seen[${JSON.stringify(st.slice(4))}] = 1`);
      if (st === 'nextup') P('onboardDone("nextup")');
      if (sec % 5 === 0) buy();
      tickS(p, 1);
    }
    const at = k => marks[k] ?? got[k] ?? Infinity;
    const mmss = t => t === Infinity ? 'never' : `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
    const tl = Object.entries(Object.assign({}, got, marks)).sort((a, b) => a[1] - b[1]);
    console.log('       timeline: ' + tl.map(([k, t]) => `${k} ${mmss(t)}`).join(', '));
    console.log('       guide: ' + steps.map(([k, t]) => `${k} ${mmss(t)}`).join(', ') + ` | zone ${P('S.maxZone')} at 10:00`);
    assert(at('lit') <= 60, `the fire lit under 1:00 (${mmss(at('lit'))})`);
    assert(firstUp !== null && firstUp < 90, `first upgrade affordable under 1:30 (${mmss(firstUp)})`);
    assert(at('party') <= 150 && at('nextup') <= 150, `Party and Next Up by 2:30 (${mmss(at('party'))}, ${mmss(at('nextup'))})`);
    assert(at('gather') <= 1 && at('camp') - at('lit') <= 1 && at('craft') >= at('bench1') && at('craft') <= at('bench1') + 1, `Gather from the start, Camp with the fire, Craft with the Workbench (${mmss(at('camp'))}, ${mmss(at('craft'))})`);
    assert(at('tool') <= 300, `a tool by 5:00 (${mmss(at('tool'))})`);
    assert(at('bench1') <= 240 && at('forge1') <= 600, `Workbench by 4:00, Forge by 10:00 (${mmss(at('bench1'))}, ${mmss(at('forge1'))})`);
    const early = tl.map(x => x[1]).filter(t => t <= 600);
    let gap = early[0] || 0; for (let i = 1; i < early.length; i++) gap = Math.max(gap, early[i] - early[i - 1]);
    assert(early.length >= 8 && gap <= 180, `something new at least every 3 minutes in the first 10 (${early.length} events, longest gap ${gap}s)`);
    const order = steps.map(x => x[0]);
    assert(order.indexOf('chop') >= 0 && order.indexOf('chop') < order.indexOf('light') && order.indexOf('light') < order.indexOf('tap') && ['tab:gat', 'tab:world', 'tab:forge'].every(id => order.includes(id)), 'guide: chop, then light, then tap a foe; the old tab steps are done for a cold save');
    assert(order.includes('bench') && order.includes('tool') && order.includes('forge'), 'guide: bench, tool and forge steps done');
    errs.push(...p.errors);
  }
  assert(!errs.length, 'no cold hearth errors' + (errs.length ? ': ' + errs[0] : ''));
} catch (e) { fail('cold hearth crashed: ' + (e.stack || e)); }
// ---- skill pace (GP1): slower levels, wider tier gates; no save loses a tier, recipe or item ----
console.log('skill pace (GP1)');
try {
  const g = loadCore({ seed: 7 });
  const E = s => g.eval(s);
  assert(E('NODE_REQ === SKILL_TUNE.nodeReq && SMITH_REQ === SKILL_TUNE.stationReq && CRAFT_STATION_REQ === SMITH_REQ'), 'the gates are the SKILL_TUNE table (NODE_REQ, SMITH_REQ, CRAFT_STATION_REQ)');
  const gaps = r => r.slice(1).map((v, i) => v - r[i]);
  const ng = gaps(E('NODE_REQ')), sg = gaps(E('SMITH_REQ'));
  assert(ng.every((d, i) => i === 0 || d > ng[i - 1]) && sg.every((d, i) => i === 0 || d > sg[i - 1]) && ng[0] > 4 && sg[0] > 4,
    `the gaps between tiers widen: gathering ${E('NODE_REQ').join('/')} (gaps ${ng.join('/')}), crafting ${E('SMITH_REQ').join('/')} (gaps ${sg.join('/')})`);
  assert(E('(() => { const f = (c, l) => Math.floor(c[0] * Math.pow(l, c[1]) * Math.pow(c[2] || 1, l - 1)); return [1, 10, 60].every(l => skillNeed(l) === f(SKILL_TUNE.gatherNeed, l) && skillNeed(l, "smith") === f(SKILL_TUNE.craftNeed, l) && skillNeed(l, "mine") === skillNeed(l)); })()'), 'skillNeed reads SKILL_TUNE (gathering and crafting curves)');
  assert(E('nodeXp(3) === Math.round(SKILL_TUNE.nodeXp[0] * Math.pow(3, SKILL_TUNE.nodeXp[1]))'), 'nodeXp reads SKILL_TUNE');
  // A new game keeps nothing: the new gates alone decide.
  assert(E('S.skillPace.v === 1 && Object.keys(S.skillPace.hw).length === 0'), 'a new game is marked at once and keeps no old tier');
  E('S.skills.mine.lv = NODE_REQ[1] - 1');
  assert(!E('skillTierOpen("mine", 2)') && !E('setNode("ore", 2)'), `new game: Mining ${E('NODE_REQ[1] - 1')} cannot work the Iron Vein`);
  E('S.skills.mine.lv = NODE_REQ[1]');
  assert(E('skillTierOpen("mine", 2) && setNode("ore", 2) && skillTopTier("mine") === 2 && skillNextReq("mine") === NODE_REQ[2]'), `new game: Mining ${E('NODE_REQ[1]')} opens it; next tier at ${E('NODE_REQ[2]')}`);
  E('S.skills.smith.lv = SMITH_REQ[1] - 1');
  assert(/^Needs Smithing \d+$/.test(E('canCraft("warblade", 2).why')) && E('canCraft("warblade", 2).why') === `Needs Smithing ${E('SMITH_REQ[1]')}`, 'new game: a tier-2 recipe below the gate says "' + E('canCraft("warblade", 2).why') + '"');
  // Player text reads the tables, not literals.
  assert(E('whereToGet("ore", 3)').includes(`Mining level ${E('NODE_REQ[2]')}`) && E('whereToGet("ess", 5)').includes(`zone ${E('PACE.essTier[4]')}`), 'where-to-get text reads NODE_REQ and PACE.essTier: ' + E('whereToGet("ore", 3)'));
  const toasts = []; g.fn.on('toast', t => toasts.push(t.msg));
  E('S.skills.mine.lv = NODE_REQ[2] - 1; S.skills.mine.xp = 0; gainSkill("mine", skillNeed(S.skills.mine.lv, "mine"))');
  assert(toasts.some(m => m.includes(`Mining level ${E('NODE_REQ[2]')}.`) && m.includes('Mithril Seam')), 'the level-up that opens a tier names it: ' + toasts[toasts.length - 1]);
  E('gainSkill("mine", skillNeed(S.skills.mine.lv, "mine"))');
  assert(toasts[toasts.length - 1].includes(`Next tier at level ${E('NODE_REQ[3]')}.`), 'other level-ups name the next gate: ' + toasts[toasts.length - 1]);
  assert(!g.errors.length, 'no errors (new game)' + (g.errors.length ? ': ' + g.errors[0] : ''));

  // Every fixture: levels and XP unchanged, every tier the OLD gates opened stays open, items kept.
  const OLD_NODE = [1, 8, 18, 30, 45], OLD_STN = [1, 4, 9, 16, 25];
  const oldTop = (req, lv) => req.filter(r => lv >= r).length;
  for (const f of fs.readdirSync(path.join(ROOT, 'tests', 'fixtures')).filter(x => x.endsWith('.json'))) {
    const rawText = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8'), raw = JSON.parse(rawText);
    const h = loadCore({ seed: 3, storage: memoryStorage({ [KEY]: rawText }) });
    const H = s => h.eval(s);
    const lvOf = k => (raw.skills && raw.skills[k] && raw.skills[k].lv) || 1;
    const same = Object.entries(raw.skills || {}).every(([k, v]) => H(`S.skills.${k}.lv`) === v.lv && H(`S.skills.${k}.xp`) === v.xp);
    const lost = [];
    // gathering: every node kind and tier
    for (const kind of H('GATHER_KINDS')) {
      const sk = H(`skillOf(${JSON.stringify(kind)})`);
      for (let t = 1; t <= 5; t++) if (oldTop(OLD_NODE, lvOf(sk)) >= t && !H(`skillTierOpen(${JSON.stringify(sk)}, ${t}) && setNode(${JSON.stringify(kind)}, ${t})`)) lost.push(`${kind}${t}`);
    }
    // crafting: every kind at every tier its station (or Smithing, for kinds that use it) opened
    for (const kind of H('Object.keys(CRAFT_KINDS).filter(k => !CRAFT_KINDS[k].legacy)')) {
      const lv = H(`stationLevel(${JSON.stringify(kind)})`);   // levels are unchanged, so this is the level the old gate read
      for (let t = 1; t <= 5; t++) if (oldTop(OLD_STN, lv) >= t && (!H(`stationTierOpen(${JSON.stringify(kind)}, ${t})`) || /^Needs /.test(H(`canCraft(${JSON.stringify(kind)}, ${t}).why`)))) lost.push(`${kind}${t}`);
    }
    // Enchanting: transmute up, reforge and tonics at every tier it opened
    for (let t = 1; t <= 5; t++) if (oldTop(OLD_STN, lvOf('ench')) >= t && !H(`skillTierOpen('ench', ${t})`)) lost.push('ench' + t);
    const ids = x => JSON.stringify((x.items || []).map(it => [it.id, it.slot, it.t, it.r, it.plus || 0]).sort());
    const itemsKept = ids(raw) === ids(JSON.parse(H('JSON.stringify(S)'))) && JSON.stringify(raw.equip || {}) === JSON.stringify(Object.fromEntries(Object.entries(H('S.equip')).filter(([k]) => raw.equip && k in raw.equip)));
    const kept = H('skillPaceInfo().kept').map(([k, a, b]) => `${k} ${b}->${a}`).join(', ');
    assert(same && !lost.length && itemsKept && !h.errors.length, `${f}: skill levels and XP unchanged, no tier, recipe or item lost` + (kept ? ` (kept above the new gates: ${kept})` : ' (the new gates already open every old tier)') + (lost.length ? ' LOST ' + lost.join(' ') : '') + (h.errors.length ? ' ' + h.errors[0] : ''));
    // round trip and a later load (the sim's --from-save path) keep the mark
    h.eval('save(); loadSave()');
    const stillOpen = Object.keys(raw.skills || {}).every(k => H(`skillTopTier(${JSON.stringify(k)})`) >= oldTop(H('SKILL_TUNE.craftSkills').includes(k) ? OLD_STN : OLD_NODE, lvOf(k)));
    const h2 = loadCore({ seed: 3 }); h2.storage.set(KEY, rawText); h2.eval('loadSave()');
    const late = Object.keys(raw.skills || {}).every(k => h2.eval(`skillTopTier(${JSON.stringify(k)})`) >= oldTop(h2.eval('SKILL_TUNE.craftSkills').includes(k) ? OLD_STN : OLD_NODE, lvOf(k)));
    assert(stillOpen && late && H('S.skillPace.v') === 1, `${f}: the kept tiers survive a save and load, and a save loaded later in a session`);
  }
  // A synthetic old save right at the old gates: Mining 8 and Smithing 4 keep tier 2 under the new gates.
  {
    const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'save-v2.json'), 'utf8'));
    raw.skills = Object.assign({}, raw.skills, { mine: { lv: 8, xp: 0 }, smith: { lv: 4, xp: 0 } }); delete raw.skillPace;
    const h = loadCore({ seed: 3, storage: memoryStorage({ [KEY]: JSON.stringify(raw) }) });
    const tell = []; h.fn.on('whatsNew', w => { if (!/^(Your stations were already built|Your party is now three|Pairs who fight side by side|Your old friends kept)/.test(w.msg)) tell.push(w.msg); });   // H1's, F1's and F2's lines have their own sections
    for (let i = 0; i < 3; i++) h.fn.tick(0.1);
    assert(h.eval('skillTierOpen("mine", 2) && setNode("ore", 2) && stationTierOpen("warblade", 2) && S.skillPace.hw.mine === 2 && S.skillPace.hw.smith === 2'), 'an old save at Mining 8 / Smithing 4 keeps the Iron Vein and tier-2 Forge recipes');
    assert(tell.length === 1 && /stays open/.test(tell[0]), 'one What\'s new line tells the player: ' + tell[0]);
    h.eval('S.skills.mine.xp = 0'); const t0 = []; h.fn.on('toast', t => t0.push(t.msg));
    h.eval('gainSkill("mine", skillNeed(8, "mine"))');
    assert(h.eval('S.skills.mine.lv') === 9 && !t0.some(m => /is open to you/.test(m)), 'a kept tier is not announced again at the next level-up');
  }
} catch (e) { fail('skill pace crashed: ' + (e.stack || e)); }

// ---- deeds: achievements core (23-data-deeds.js, 58-deeds.js; achievements.md 11, AD1-AD8) ----
console.log('deeds');
try {
  const FIX = fs.readdirSync(path.join(ROOT, 'tests', 'fixtures')).filter(x => x.endsWith('.json'));
  const fixText = f => fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
  const g = loadCore({ seed: 5 });
  const E = s => g.eval(s);
  // AD1 data
  const D = E('({ tracks: DEED_TRACKS, feats: DEED_FEATS, secrets: DEED_SECRETS, looks: DEED_LOOKS, groups: DEED_GROUPS, ladder: DEED_LADDER, chapters: DEED_CHAPTERS, cap: DEED_CAP, slots: DEED_SLOTS })');
  const uniq = a => new Set(a).size === a.length;
  const titles = E('deeds.titles()');
  assert(uniq(D.tracks.map(t => t.id)) && uniq(D.feats.map(f => f.id)) && uniq(D.secrets.map(s => s.id)) && uniq(D.looks.map(l => l.id)) && uniq(titles.map(t => t.id)) && uniq(D.groups.map(x => x.id)),
    `AD1 ids unique: ${D.tracks.length} tracks, ${D.feats.length} Feats, ${D.secrets.length} secrets, ${D.looks.length} looks, ${D.groups.length} groups`);
  assert(D.tracks.length === 92 && D.feats.length === 21 && D.secrets.length === 16 && D.looks.filter(l => l.slot !== 'frame').length === 36 && D.looks.filter(l => l.slot === 'frame').length === 4 && D.groups.length === 12, 'AD1 counts: 92 tracks, 21 Feats, 16 secrets, 36 accessories and 4 frames, 12 groups');
  const bad = D.tracks.filter(t => !(t.need.length === 4 && t.need.every((v, i) => i === 0 || v > t.need[i - 1]) && t.need[0] > 0) || !t.g || !D.groups.some(x => x.id === t.g) || (t.bonus && !(t.bonus in D.cap)));
  assert(!bad.length, 'AD1 every track rises tier to tier, sits in a group, and feeds a capped key' + (bad.length ? ': ' + bad.map(t => t.id).join(', ') : ''));
  // every look has exactly one source, and that source names it back
  const giv = {}; const give = (id, src) => { (giv[id] = giv[id] || []).push(src); };
  D.groups.forEach(x => x.look && give(x.look, 'grp:' + x.id)); D.feats.forEach(f => f.look && give(f.look, 'feat:' + f.id)); D.secrets.forEach(s => s.look && give(s.look, 'sec:' + s.id));
  D.ladder.forEach(m => m.look && give(m.look, 'pts:' + m.at)); D.chapters.forEach(c => c.look && give(c.look, 'ch:' + c.id));
  const lookBad = D.looks.filter(l => !giv[l.id] || giv[l.id].length !== 1 || giv[l.id][0] !== l.src || !D.slots.includes(l.slot) || Object.keys(l).some(k => !['id', 'slot', 'n', 'src'].includes(k)));
  const dangling = Object.keys(giv).filter(id => !D.looks.some(l => l.id === id));
  assert(!lookBad.length && !dangling.length, 'AD1 every reward id resolves; every look has exactly one source and carries no modifier' + (lookBad.length || dangling.length ? ': ' + lookBad.map(l => l.id).concat(dangling).join(', ') : ''));
  // "the Last Lantern" (the capstone Feat) is kept by name (coordinator, 2026-09-28): the one exception.
  const EXC = ['the Last Lantern'];
  const long = titles.filter(t => !EXC.includes(t.n) && (t.n.length > 14 || t.n.trim().split(/\s+/).length > 2));
  assert(!long.length && titles.filter(t => /^a_(g|e)_/.test(t.id)).length === 24 && D.feats.every(f => f.title) && D.secrets.every(s => s.title),
    `AD1 titles are short epithets (<= 14 characters, <= 2 words): ${titles.length} listed now` + (long.length ? '; too long: ' + long.map(t => t.n).join(', ') : ''));
  const allTitles = D.groups.flatMap(x => [x.gold, x.ever]).concat(D.feats.map(f => f.title), D.secrets.map(s => s.title), D.chapters.map(c => c.title), D.ladder.filter(m => m.title).map(m => m.title));
  const tooLong = allTitles.filter(n => !EXC.includes(n) && (n.length > 14 || n.split(' ').length > 2));
  assert(allTitles.length === 68 && !tooLong.length, `AD1 all 68 designed titles fit the rule (${allTitles.length}; kept by name: ${EXC.join(', ')})` + (tooLong.length ? ': ' + tooLong.join(', ') : ''));
  const live = E('deeds.tracks().map(t => t.id)'), hidden = D.tracks.filter(t => !live.includes(t.id)).map(t => t.id);
  // F2 (Bonds) is merged, so 'bonds' and 'together' are live; the rest wait for their systems.
  assert(live.length === 79 && hidden.sort().join() === ['fish', 'g_fish', 'g_pearl', 'handhrs', 'hands', 'lanterns', 'meals', 'oath', 'oathseals', 'pinkills', 'store', 'tides', 'vow'].join(), `waiting tracks are hidden until their system exists: ${live.length} live, hidden ${hidden.join(' ')}`);
  E('S.store = { v: 1 }; S.bond = { v: 1, t: { a: 36000 }, lv: { a: 3 } }');
  assert(E('deeds.track("store").live && deeds.track("bonds").live && deeds._cur("together") === 10 && deeds._cur("bonds") === 3'), 'a runtime probe lights a waiting track up when its save field appears (S.store, S.bond)');
  E('delete S.store; delete S.bond');
  assert(E('(() => { try { return deeds.tracks().length === 77; } catch (e) { return false; } })()'), 'probes of later systems never throw');

  // AD7 numbers
  const oldFmt = n => { const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc']; if (!isFinite(n)) return '∞'; if (n < 1000) return n < 10 && n % 1 ? n.toFixed(1) : String(Math.floor(n)); let i = 0; while (n >= 1000 && i < SUF.length - 1) { n /= 1000; i++; } return (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : Math.floor(n)) + SUF[i]; };
  const vals = [0, 0.5, 7.25, 9.99, 999, 999.9, 1000, 1234, 99999, 999999, 4.2e16, 9.9999e35, 1e35, 123456789012, Infinity];
  for (let e = 0; e < 36; e += 0.37) vals.push(Math.pow(10, e) * 1.2345);
  const diff = vals.filter(v => v < 1e36 && E(`fmt(${v})`) !== oldFmt(v));
  assert(!diff.length && E('fmt(4.2e16)') === '42.0Qa' && E('fmt(1e36)') === '1.00aa' && E('fmt(1e39)') === '1.00ab' && E('fmt(1e114)') === '1.00ba', `AD7 letters: every value below 1e36 prints as before; 1e36 = ${E('fmt(1e36)')}, 1e39 = ${E('fmt(1e39)')}, 1e114 = ${E('fmt(1e114)')}` + (diff.length ? ' DIFF ' + diff.join(',') : ''));
  E('deeds.setNum("sci")');
  assert(E('fmt(4.2e16)') === '4.20e16' && E('fmt(12345)') === '1.23e4' && E('fmt(999)') === '999' && E('fmt(1e33)') === '1.00e33' && E('fmt(9.999e20)') === '1.00e21' && E('S.settings.num') === 'sci', `AD7 scientific: 4.2e16 = ${E('fmt(4.2e16)')}, 12,345 = ${E('fmt(12345)')}`);
  E('deeds.setNum("letters")');
  assert(E('fmt(4.2e16)') === '42.0Qa', 'AD7 the switch goes back to letters');

  // AD4 caps: every tier forced on (and 30 stars on every star track)
  E('for (const t of DEED_TRACKS) S.deeds.tier[t.id] = t.star ? 34 : 4; deeds._rebuild()');
  const caps = E('deeds.caps()');
  const over = caps.filter(c => c.v > c.cap + 1e-12);
  const party = E('(1 + deedBonus("dmg")) * (1 + deedBonus("party"))');
  assert(!over.length && party <= 1.092 + 1e-9 && E('deedBonus("dmg")') === 0.05 && caps.find(c => c.key === 'dmg').raw > 0.05,
    `AD4 with every tier on, each key stays at its cap (dmg raw ${(caps.find(c => c.key === 'dmg').raw * 100).toFixed(1)}% -> 5%); party damage from deeds x${party.toFixed(4)} <= 1.092`);
  const m0 = E('mod("dmg")'); E('DEED_TUNE.bonusOn = 0'); const m1 = E('mod("dmg")'); E('DEED_TUNE.bonusOn = 1');
  assert(Math.abs(m0 / m1 - 1.05) < 1e-9 && E('bonus("deepOil")') >= 8 && E('mod("buildTime")') <= 0.97 + 1e-9, `AD4 the cap holds at runtime: mod("dmg") x${(m0 / m1).toFixed(4)} from deeds; deepOil ${E('deedBonus("deepOil")')}s`);
  E('S.deeds.tier = {}; deeds._rebuild()');
  assert(E('deeds.caps().every(c => c.v === 0)'), 'no tier, no bonus (Bronze and Silver pay points only)');

  // goals: cap 1 (55-goals)
  E('registerGoal({ id: "zz1", sys: "zz", cap: 1, prio: 5, pct: () => 0.99, label: "a" }); registerGoal({ id: "zz2", sys: "zz", cap: 1, prio: 5, pct: () => 0.98, label: "b" })');
  const tg = E('topGoals(3, { sticky: false }).map(x => x.sys)');
  assert(tg.filter(s => s === 'zz').length === 1 && E('topGoals(3, { sticky: false }).every(x => !("cap" in x))'), `registerGoal cap: 1 takes one row at most (${tg.join(', ')})`);
  E('GOALS.splice(GOALS.findIndex(x => x.id === "zz1"), 1); GOALS.splice(GOALS.findIndex(x => x.id === "zz2"), 1)');

  // counters, events, secrets on a new game
  const h = loadCore({ seed: 9 });
  const H = s => h.eval(s);
  for (let i = 0; i < 30; i++) h.fn.tick(0.1);
  assert(H('S.deeds.init > 0 && deeds.points() === 0 && Object.keys(S.deeds.tier).length === 0'), 'a new game runs the same first-load path with nothing to grant');
  H('emit("harvest", { kind: "ore", t: 2, n: 7 }); emit("harvest", { kind: "herb", t: 1, n: 3, glint: true }); emit("weeklyClaim", { k: "x" }); emit("raidReward", { embers: 4 }); emit("trophy", { i: 0, n: 2 }); emit("upgraded", { item: { r: "rare", t: 1 } }); emit("expedBack", { r: "x", g: 3, auto: true })');
  H('CB_STATS.parries += 3; CB_STATS.heroDmg += 500; CB_STATS.maxHit = 2e6');
  for (let i = 0; i < 11; i++) h.fn.tick(0.1);
  assert(H('S.deeds.g.ore[1] === 7 && S.deeds.g.herb[0] === 3 && S.deeds.n.glint === 1 && S.deeds.n.weekly === 1 && S.deeds.n.embers === 4 && S.deeds.n.troph >= 2 && S.deeds.n.up === 1 && S.deeds.rec.fine === 2 && S.deeds.n.perfect === 1'), 'event counters: harvest by family and tier, Glints, weekly goals, Embers, Trophies, upgrades, best craft, Perfect grades');
  assert(H('S.deeds.n.parry >= 3 && S.deeds.n.dmg >= 500 && S.deeds.rec.hit === 2e6 && deeds.track("bighit").tier === 1'), `combat counters are read as CB_STATS deltas once a second; the biggest hit is a record (Heavy Hand ${H('deeds.track("bighit").tier')}; ${H('JSON.stringify([S.deeds.n.parry, S.deeds.n.dmg, S.deeds.rec.hit, CB_STATS.maxHit])')})`);
  H('Object.keys(CB_STATS).forEach(k => CB_STATS[k] = 0)'); const p0 = H('S.deeds.n.parry'); h.fn.tick(1.0); h.fn.tick(0.05);
  assert(H('S.deeds.n.parry') === p0, 'a CB_STATS reset never subtracts from a counter');
  const tl = []; h.fn.on('toast', t => tl.push(t.msg));
  H('S.name = "Wren"'); for (let i = 0; i < 11; i++) h.fn.tick(0.1);
  for (let i = 0; i < 300; i++) h.fn.emit('tap', { node: false });
  assert(H('S.deeds.sec.s_name === 1 && S.deeds.sec.s_drum === 1 && deeds.points() >= 30') && tl.some(m => /^Secret found: Namesake/.test(m)), 'secrets: Namesake (a companion\'s name), Drummer (300 taps in a minute), 15 points each, one toast');
  const sc = H('deeds.secrets()');
  assert(sc.filter(s => !s.got).every(s => !s.n && !s.title) && sc.find(s => s.id === 's_name').n === 'Namesake', 'unfound secrets keep their names hidden');
  assert(H('codexTitles().some(t => t.id === "a_s_name" && t.got) && codexSetTitle("a_s_name") && codexTitle() === "Namesake" && !codexSetTitle("a_f_parry")'), 'deeds titles join the Codex picker (S.codex.title); unearned ones cannot be picked');
  // near-miss goal: 90% of a tier, one row, hides after a tier (a new game with no tier yet)
  const k = loadCore({ seed: 11 }); for (let i = 0; i < 30; i++) k.fn.tick(0.1);
  const K = s => k.eval(s);
  K('S.totalKills = 950; S.deeds.follow = null');
  const nearNow = K('deeds.near(3).map(x => x.label)');
  assert(nearNow.some(l => /^50 foes to Slayer I$/.test(l)), `near tiers read plainly: ${nearNow.slice(0, 2).join('; ')}`);
  const shown = K('topGoals(3, { sticky: false }).filter(x => x.id === "deeds-near").map(x => x.label + " " + x.pct.toFixed(2))');
  K('S.totalKills = 1000; deeds.check(true, false); S.totalKills = 9500');
  const hid = !K('topGoals(3, { sticky: false }).some(x => x.id === "deeds-near")') && K('deeds.near(3).some(x => x.id === "slayer")');
  assert(shown.length === 1 && hid, `Next Up shows one nudge (${shown[0]}), capped below Ready; it hides for 3 minutes after a tier`);
  // Feats and the Codex bridge
  const light0 = H('codexRefresh(true)');
  H('S.deeds.n.parry = 25000'); H('deeds.check(true, false)');
  assert(H('S.deeds.feat.f_parry === 1 && deeds.owned("a_steel") && deeds.wear("aura", "a_steel") && wearGet("aura") === "a_steel"'), 'a Feat gives its look; it can be worn (wearGet)');
  assert(H('codexRefresh(true)') >= light0 + 6 && H('codexPage("achievements").tiles.some(t => t.key === "f_parry")') && H('codexPage("wardrobe") && !codexPage("wardrobe").locked'), `Codex bridge: the Feat tile (5 Light) and the Wardrobe entry (1 Light): ${light0} -> ${H('codexLight()')}`);
  assert(!H('deeds.wear("aura", "a_star")') && !H('deeds.wear("hat", "a_steel")') && H('deeds.wear("aura", null) && wearGet("aura") === null'), 'looks: only owned, in their own slot; None always');
  H('S.deep.cos.l_amber = 1; S.deep.eq.lantern = "l_amber"');
  assert(H('wearGet("flame") === "l_amber"') && H('typeof DEEP_SHOP.l_amber !== "object" || deeds.wear("flame", "l_amber")'), 'the Flame slot falls back to the Deepwell lantern colour (S.deep.eq keeps its meaning)');
  assert(!h.errors.length, 'no errors (deeds on a new game)' + (h.errors.length ? ': ' + h.errors[0] : ''));

  // AD2, AD3, AD6 on every fixture
  const ACH0 = [['zone10', 10, 'gold', 0.02], ['zone25', 25, 'dmg', 0.03], ['zone50', 50, 'gold', 0.05], ['lv20', 20, 'xp', 0.03], ['lv50', 50, 'dmg', 0.03], ['kill1k', 1000, 'gold', 0.02],
    ['kill25k', 25000, 'dmg', 0.03], ['kill100k', 100000, 'gold', 0.03], ['gold1m', 1e6, 'gold', 0.02], ['gold1b', 1e9, 'gold', 0.03], ['mine25', 25, 'gatherSpeed', 0.03], ['wood25', 25, 'gatherSpeed', 0.03],
    ['smith25', 25, 'skillXp', 0.03], ['forge1', 1, 'skillXp', 0.02], ['forge25', 25, 'skillXp', 0.03], ['epic', 1, 'crit', 0.03], ['uniq1', 1, 'essence', 0.03], ['uniq3', 3, 'essence', 0.05],
    ['uniq7', 7, 'dmg', 0.05], ['party', 7, 'party', 0.03], ['bty10', 10, 'offline', 0.03], ['bty50', 50, 'gold', 0.03]];
  assert(JSON.stringify(E('ACH_API.list.map(a => [a.id, a.need, a.bonus[0], a.bonus[1]])')) === JSON.stringify(ACH0) && E('ACH_API.list.map(a => ACH_API.bonusText(a)).join("|")').split('|').length === 22,
    'AD2 the Classic 22: ids, thresholds and bonuses unchanged');
  const noDeeds = (await import('./lib/core.mjs')).coreFiles().filter(f => !/^(23-data-deeds|58-deeds)\.js$/.test(f));
  const achSums = h2 => h2.eval('(() => { const s = {}; for (const a of ACH_API.list) if (S.achievements.got[a.id]) s[a.bonus[0]] = (s[a.bonus[0]] || 0) + a.bonus[1]; return JSON.stringify(s); })()');
  const expect = { 'save-v2-late.json': ['slayer:2', 'zones:2', 'level:2', 'gold:1', 'mine:2', 'wood:2'] };
  for (const f of FIX) {
    const raw = fixText(f);
    const a = loadCore({ seed: 3, storage: memoryStorage({ [KEY]: raw }) }), b = loadCore({ seed: 3, storage: memoryStorage({ [KEY]: raw }), files: noDeeds });
    const atLoad = JSON.parse(a.eval('JSON.stringify(S)')), atLoadB = JSON.parse(b.eval('JSON.stringify(S)'));
    delete atLoad.deeds; atLoad.last = atLoadB.last;
    const lines = []; a.fn.on('whatsNew', w => lines.push(w.msg)); a.fn.on('toast', t => lines.push(t.msg));
    let fresh = null;   // computed the moment the first-load credit lands
    a.fn.on('deedsInit', () => { fresh = a.eval('DEED_TRACKS.filter(t => deeds.track(t.id).live && deeds._tierOf(t.id, deeds._cur(t.id)) !== (S.deeds.tier[t.id] || 0)).map(t => t.id)'); });
    for (let i = 0; i < 15; i++) { a.fn.tick(0.1); b.fn.tick(0.1); }
    assert(achSums(a) === achSums(b), `AD2 ${f}: Classic sums match the build without deeds ${achSums(a)}`);
    for (let i = 0; i < 15; i++) a.fn.tick(0.1);
    const A = s => a.eval(s);
    const deedLines = lines.filter(m => /deeds so far|achievement points|\((Bronze|Silver|Gold|Everflame)\)|^Feat:|Everflame ★|every track at/.test(m));
    const tiers = A('S.deeds.tier');
    const want = expect[f] || [];
    const missing = want.filter(x => { const [id, k] = x.split(':'); return (tiers[id] || 0) !== +k; });
    assert(A('S.deeds.init > 0') && fresh && !fresh.length && deedLines.length === 1 && /^Your deeds so far: \d+ tiers?, [\d,]+ points\. See Achievements\./.test(deedLines[0]) && !A('Object.keys(S.deeds.sec).length') && !missing.length && (f !== 'save-v2-late.json' || !A('Object.keys(S.deeds.feat).length')),
      `AD3 ${f}: tiers granted equal a fresh computation, one line ("${deedLines[0]}"), no secret retro` + (want.length ? `, earns ${want.join(' ')} and no Feat` : '') + (!fresh || fresh.length ? ' MISMATCH ' + (fresh || ['no init']).join(' ') : '') + (missing.length ? ' MISSING ' + missing.join(' ') : '') + (deedLines.length !== 1 ? ' LINES ' + deedLines.join(' | ') : ''));
    // second load: nothing granted, no line; AD6 round trip
    A('save()'); const snap = A('JSON.stringify(S)');
    const c = loadCore({ seed: 4, storage: memoryStorage({ [KEY]: a.storage.get(KEY) }) });
    const again = []; c.fn.on('deedTier', x => again.push(x.id)); c.fn.on('deedsInit', () => again.push('init')); c.fn.on('whatsNew', w => { if (/deeds so far/.test(w.msg)) again.push('line'); });
    const back = JSON.parse(c.eval('JSON.stringify(S)'));
    const rt = deepDiff(JSON.parse(snap), back), old = Object.keys(JSON.parse(raw)).map(k => deepDiff(atLoadB[k], atLoad[k], k)).find(Boolean) || null;   // the save's own fields load as they do without deeds
    c.eval('S.activity = "gather"'); for (let i = 0; i < 30; i++) c.fn.tick(0.1);
    assert(!again.length, `AD3 ${f}: a second load grants nothing` + (again.length ? ': ' + again.join(' ') : ''));
    assert(!rt && !old && back.deeds && back.deeds.init > 0, `AD6 ${f}: save and load round-trip with S.deeds; the save's own fields load exactly as they do without deeds` + (rt ? ' RT ' + rt : '') + (old ? ' OLD ' + old : ''));
    assert(!a.errors.length && !c.errors.length, `${f}: no errors` + (a.errors.length ? ': ' + a.errors[0] : c.errors.length ? ': ' + c.errors[0] : ''));
  }

  // AD5 online: the raiders body and presence keys are unchanged
  const on = fs.readFileSync(path.join(ROOT, 'src', 'js', '80-online.js'), 'utf8');
  const lit = re => { const m = on.match(re); return m ? m[1] : null; };
  const body = lit(/const body = (\{[^}]*\});/), pres = lit(/const p = (\{ hero[^}]*\});/);
  const stubKeys = src => Object.keys(new Function('S', 'gear', 'totalDps', `return ${src};`)({ name: 'x', L: 1, maxZone: 1, wyrms: 0, raid: { gen: 0, dmg: 0 }, zone: 1, activity: 'fight' }, () => ({ score: 1 }), () => 1)).join();
  assert(body && pres && stubKeys(body) === 'name,L,maxZone,wyrms,gear,dps,gen,dmg' && stubKeys(pres) === 'hero,lvl,zone,act,raiding' && !/deeds|title/i.test(on),
    `AD5 online shapes unchanged: raiders {${body ? stubKeys(body) : '?'}}, presence {${pres ? stubKeys(pres) : '?'}}; 80-online.js never reads deeds or titles`);

  // AD8 cost: one round-robin pass on the late fixture
  {
    const a = loadCore({ seed: 3, storage: memoryStorage({ [KEY]: fixText('save-v2-late.json') }) });
    for (let i = 0; i < 30; i++) a.fn.tick(0.1);
    a.eval('deeds.check(false, true)');
    const n = 2000, t0 = process.hrtime.bigint();
    a.eval(`for (let i = 0; i < ${n}; i++) deeds.check(false, true)`);
    const ms = Number(process.hrtime.bigint() - t0) / 1e6 / n;
    assert(ms < 0.2, `AD8 one deedsCheck pass (a quarter of the tracks) takes ${ms.toFixed(3)} ms on the late fixture (< 0.2)`);
  }
} catch (e) { fail('deeds crashed: ' + (e.stack || e)); }

// ---- the Party UI for the party of three (75-party.js, 75-bonds-ui.js, 60-formation.css; plan-3 F4, formation.md 6) ----
// The UI runs in the browser only: these check its sources, the dist, and the core calls it makes.
console.log('party ui (F4)');
try {
  const src = f => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8');
  const party = src('js/75-party.js'), sheet = src('js/75-party-sheet.js'), bonds = src('js/75-bonds-ui.js'), css = src('styles/60-formation.css');
  assert(/n: 'Old Friend'/.test(sheet) && !/n: 'Bond' \}/.test(sheet), 'F4 the L25 milestone reads "Old Friend" (the word Bond now means the pair)');
  assert(['swapSlots(', 'fieldTo(', 'setPin(', 'formWarning()', 'slotJob(', 'FORM_TEXT.heroStays', 'benchChar('].every(s => party.includes(s)) && !/pf-cell|function tapCell/.test(party),
    'F4 slot cards change the party only through the 56e API (swapSlots, fieldTo, setPin, benchChar); the interim grid is gone');
  assert(["id: 'party-form'", "id: 'party-syn'", "id: 'party-bonds'", "id: 'party-bench'"].every(s => party.includes(s)), 'F4 Team view sections: slots, combos, Bonds, bench');
  assert(/on\('bondLevel'/.test(bonds) && /bondText\(/.test(bonds) && /ev\.quiet/.test(bonds) && bonds.includes('Story coming soon'), 'F4 Bond toasts use bondText and skip quiet levels; unwritten stories say "Story coming soon"');
  const badFont = css.split('\n').filter(l => /font:[^;]*var\(--display\)/.test(l) && !/var\(--display-k\)/.test(l));
  assert(!badFont.length, 'F4 display text sizes scale with --display-k (FONT1)' + (badFont.length ? ': ' + badFont[0].trim().slice(0, 80) : ''));
  const motion = css.replace(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}/g, '');
  assert(!/(^|[\s;{])(transition|transform):/.test(motion), 'F4 lift and drag motion only under prefers-reduced-motion: no-preference (the colour flash stays)');
  const dist = fs.readFileSync(path.join(ROOT, 'dist', 'lanternfall.html'), 'utf8');
  assert(dist.includes('sec-party-bench') || dist.includes("'party-bench'"), 'F4 is in the dist');

  // The core calls the slot cards make, on a new Warden with two companions.
  const g = loadCore({ seed: 11 });
  const E = s => g.eval(s);
  E('chooseClass("warden", "Ash")'); for (let i = 0; i < 5; i++) g.fn.tick(0.1);
  E('S.maxZone = 40; ["wren", "hesketh", "bram"].forEach(k => unlockChar(k, "progress", true)); setSlots({ front: "hero", mid: "wren", back: "hesketh" })');
  assert(E('whoIn("front") === "hero" && whoIn("mid") === "wren" && whoIn("back") === "hesketh"'), 'F4 the three slots read Back / Middle / Front');
  assert(E('!fieldTo("bram", "front") && whoIn("front") === "hero"'), 'F4 a bench companion cannot take the hero\'s slot (the card shows FORM_TEXT.heroStays)');
  assert(E('swapSlots("mid", "front") && whoIn("mid") === "hero" && whoIn("front") === "wren"'), 'F4 tap-to-swap moves the hero too');
  assert(E('fieldTo("bram", "back") && whoIn("back") === "bram" && !S.party.field.includes("hesketh")'), 'F4 bench-to-slot: the one there goes to the bench');
  assert(E('!!formWarning()') && E('offSlot("hero") && offSlot("wren")'), `F4 Out of place shows one warning ("${E('formWarning()')}")`);
  assert(E('setPin("wren", true) && isPinned("wren") && setPin("wren", false) && !isPinned("wren")'), 'F4 the lock pins and unpins');
  assert(E('!!slotJob("bram") && slotJob("bram").label === "Hits divers" && slotJob("hero").label.startsWith("Covers")'), 'F4 slot job lines (Overwatch, Bulwark)');
  const t1 = E('JSON.stringify(bondText("hunting", 1))'), t2 = E('JSON.stringify(bondText("hunting", 2))'), t5 = E('JSON.stringify(bondText("hunting", 5))');
  assert(/"prio":"low"/.test(t1) && /"prio":"normal"/.test(t2) && /"prio":"high"/.test(t5) && /Sworn/.test(t5), 'F4 Bond toast copy and priorities: Met low, Friends normal, Sworn high');
  assert(E('partyBonds().includes("hunting") && bondInfo("hunting").next.name === "Met"'), 'F4 the Bond rows list the pairs in the party (Wren and Bram), with the next level');
  assert(!g.errors.length, 'F4 no handler errors' + (g.errors.length ? ': ' + g.errors[0] : ''));
} catch (e) { fail('party ui crashed: ' + (e.stack || e)); }

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
