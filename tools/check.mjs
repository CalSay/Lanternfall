#!/usr/bin/env node
// Checks: (1) dist script parses, (2) headless smoke test of the real core,
// (3) old-save fixture migrates without data loss. No dependencies. Exits 1 on failure.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT, loadCore, memoryStorage, badNumbers, deepDiff, subsetDiff } from './lib/core.mjs';

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
  E('S.maxZone = 2; S.gold = 200');
  assert(E('recruit("wren")') && E('S.gold') === 80 && E('S.party.field.includes("wren")'), 'recruited Wren by name');
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
  const it = fn.forgeItem('weapon', 1);
  assert(it && E('S.items.length') >= 1, 'forged an item');
  if (it) assert(fn.equipItem(it.id) && fn.gear().might > 0, 'equipped forged weapon');

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
  g4.fn.playerTap({ x: 0.6, y: 0.5 });
  assert(g4.eval('mob.markUntil > 0'), 'class tap marks the mob');
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
  assert(g.eval('S.party.newGame === false && S.party.chosen === false && S.party.field.join() === "tobin,wren,pip"'), 'existing save fields its top 3 companions, tank first');
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
    const oldDps = g.eval('oldCompDps()'), newDps = g.fn.compDps();
    assert(newDps >= oldDps * 0.999, `${f}: compDps() ${newDps.toFixed(0)} >= old formula ${oldDps.toFixed(0)}`);
    const bad = badNumbers(S);
    assert(!bad.length && Number.isFinite(g.fn.totalDps()), `${f}: no NaN/Infinity` + (bad.length ? ': ' + bad.slice(0, 3).join(', ') : ''));
    const shape = g.eval(`Object.entries(S.party.rec).every(([k, r]) => ROSTER[k] && r.lv >= 1 && r.lv <= levelCap(r.rank) && r.rank >= 0 && r.rank <= 7 && r.xp >= 0 && 'wpn' in r && 'trk' in r && 'seen' in r)`);
    assert(shape, `${f}: roster records valid`);
    const fld = S.party.field;
    assert(fld.length >= 1 && fld.length <= 3 && fld.every(k => S.party.rec[k]) && S.party.cells.hero && fld.every(k => S.party.cells[k]), `${f}: field ${fld.join(',')} placed`);
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
    g.eval('unlockChar("thessaly", "test", true)');
    assert(g.eval('S.party.field.join()') === f0 && !g.eval('S.party.field.includes("elowen")'), `late save: promote and recruit keep the field (${g.eval('S.party.field.join()')})`);
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
    for (let i = 0; i < 3000; i++) g.fn.tick(0.1);
    assert(E('charRec("wren").lv') > 1 && ms.includes(5), `fielded Wren levels from kills (L${E('charRec("wren").lv')}, milestones ${ms.join(',')})`);
    assert(E('storyState("wren").unread') >= 1 && E('markStoriesRead("wren") && storyState("wren").unread === 0'), 'camp stories unlock and can be marked read');
    E('S.maxZone = Math.max(S.maxZone, 3)'); g.fn.tick(1.1);
    assert(E('isRecruited("tobin") && isRecruited("hesketh")'), 'Tobin and Hesketh join free at zone 3');
    E('benchChar("hesketh")');
    const hk = E('charRec("hesketh").lv'); for (let i = 0; i < 1200; i++) g.fn.tick(0.1);
    assert(E('charRec("hesketh").lv') === hk && !E('S.party.field.includes("hesketh")'), 'benched characters earn no XP');
    E('charRec("wren").lv = 25; charRec("wren").xp = 0');
    E('addCharXp("wren", 1e9)');
    assert(E('charRec("wren").lv') === 25 && E('charRec("wren").xp') <= E('cxpNeed(25)') + 1e-9, 'level cap holds and XP banks one level');
    E('S.gold = 1e12; S.mats.ess = [0, 0, 50, 0, 0]');
    assert(E('canPromote("wren") && promoteChar("wren")') && E('charRec("wren").rank') === 1 && E('charRec("wren").lv') > 25, 'promotion: rank up, cap +25, banked XP spent, higher-tier essence accepted');
    assert(E('S.mats.ess[2]') === 45, 'Common promotion costs half essence (5)');
    E('charRec("wren").lv = 26');
    const d0 = g.fn.compDps(); E('charRec("wren").rank = 2'); const d1 = g.fn.compDps();
    assert(d1 > d0 * 1.5, 'rank doubles power');
    E('S.activity = "fight"; S.zone = S.maxZone');
    const before = E('charRec("tobin").lv'), res = g.fn.awayGains(3600);
    assert(E('charRec("tobin").lv') > before && res.lines.some(l => /Tobin/.test(l.txt)), `offline XP for the field (Tobin L${before} -> L${E('charRec("tobin").lv')})`);
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

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
