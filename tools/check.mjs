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
  const bossKill = (E, z) => E(`emit('kill', { mob: { key: 'x0', boss: true }, zone: ${z}, gold: 1, ess: 0, tier: 1 })`);
  // Renown: +1 per claimed bounty; Aldric at 15 then 25K gold; Vesper free at 60; Caedmon 80 + zone 35 boss, wyrms count 5.
  {
    const { E, recs, tick } = game(10);
    for (let i = 0; i < 14; i++) E("emit('bountyDone', { k: 'kill' })");
    E('S.gold = 1e6');
    assert(E('renown()') === 14 && !E('canRecruit("aldric")'), 'Renown 14: Aldric not yet');
    E("emit('bountyDone', { k: 'kill', elite: true })");
    assert(E('renown()') === 17 && E('canRecruit("aldric") && recruit("aldric")') && E('S.gold') === 1e6 - 25000 && !E('recruit("aldric")') && recs.aldric === 1, 'Renown 15 + 25K gold recruits Aldric once (elite bounty = 3)');
    E('addRenown(43, "test")'); tick(11);
    assert(E('isRecruited("vesper") && charRec("vesper").src === "renown"') && recs.vesper === 1, 'Vesper joins free at Renown 60');
    E('S.maxZone = 36; S.wyrms = 3'); tick(11);
    assert(!E('isRecruited("caedmon")') && E('caedmonRenown()') === 75, 'Caedmon waits: Renown 60 + 3 raid kills x 5 = 75 of 80');
    E('S.wyrms = 4'); tick(11);
    assert(E('isRecruited("caedmon")') && recs.caedmon === 1, 'Caedmon joins at 80 with the zone 35 boss beaten');
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
    setDay(aday); E('S.gold = 1e6; S.mats.ess[1] = 30');
    assert(E('visitorToday().kind === "hire" && canRecruit("anselm") && recruit("anselm")') && E('S.gold') === 1e6 - 60000 && E('S.mats.ess[1]') === 10 && recs.anselm === 1, 'Anselm hired on his day for 60K + 20 Glowing');
    const vt = E('visitorToday()');
    assert(E('S.party.unlock.visitor.hired') === true && vt.kind === 'trade' && !vt.done, 'a hired visitor is replaced by a trader');
    const t = E('zoneTier(S.maxZone)'), e0 = E(`S.mats.ess[${t - 1}]`);
    assert(E('buyTrade()') && E(`S.mats.ess[${t - 1}]`) === e0 + 10 && !E('buyTrade()'), 'the trader sells 10 essence of the top tier, once a day');
    setDay(aday + 1); E('visitorToday()');
    assert(E('S.party.unlock.visitor.day') === aday + 1 && E('S.party.unlock.visitor.hired') === false && E('S.party.unlock.visitor.bought') === false, 'a new device day resets the visitor');
    const kday = week.find(d => rot[d % 7] === 'kestrel');
    setDay(kday); E('S.maxZone = 8; S.gold = 1e6');
    assert(E('recruitCost("kestrel").gold') === 90000 && E('recruit("kestrel")') && E('S.gold') === 1e6 - 90000, 'Kestrel hires early at 3x gold before zone 12');
    setDay(aday + 7);
    assert(E('visitorToday().kind') === 'trade' && E('daysUntilVisit("anselm")') === 0, 'a recruited visitor leaves a trader on their day');
    E('S.maxZone = 3');
    assert(E('visitorToday().kind') === 'closed', 'no visitors before zone 6');
  }
  // Quests: hand-in consumes the items; Morwen's condition.
  {
    const { E, recs, tick } = game(5);
    E('S.mats.wood = [40, 30, 0, 0, 0]');
    assert(E('canRecruit("bram") && recruit("bram")') && E('S.mats.wood.join()') === '0,10,0,0,0' && recs.bram === 1, 'Bram: 60 Oak Logs handed in (better logs count, Oak first)');
    const mn = E('UNLOCK_TUNE.quests.maren.ess[1]');
    E(`S.mats.ess = [0, ${mn - 1}, 0, 0, 0]`);
    assert(!E('canRecruit("maren")') && E('leads().some(l => l.id === "maren" && l.action === null && l.pct < 1)'), `Maren waits for ${mn} Glowing Essence`);
    E('S.mats.ess[1]++');
    const lm = E('leads().find(l => l.id === "maren")');
    assert(lm && lm.action && lm.action.label === 'Hand in' && E('leads().find(l => l.id === "maren").action.fn()') && E('S.mats.ess[1]') === 0 && recs.maren === 1, 'Maren: the Leads "Hand in" consumes the essence');
    E('S.maxZone = 28; S.gold = 2e8; S.mats.ess[3] = 25');
    assert(E('recruit("elowen")') && E('S.gold') === 5e7 && E('S.mats.ess[3]') === 5, 'Elowen: 150M gold + 20 Blazing Essence handed in');
    const mz = E('UNLOCK_TUNE.quests.morwen.zone');
    E(`S.maxZone = ${mz + 1}; unlockChar("hesketh", "test", true); setField(["hesketh", "bram"])`);
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

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
