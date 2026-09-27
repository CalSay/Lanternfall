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
  const CLASSES = ['warden', 'lanternmage', 'ranger', 'lightkeeper'];
  const gearDiff = (gs, want) => OLD_KEYS.map(k => [k, gs[k], want[k] !== undefined ? want[k] : k === 'tap' ? 1 : 0]).filter(([, a, b]) => a !== b).map(([k, a, b]) => `${k} ${a} != ${b}`);
  for (const [f, want] of Object.entries(BASE)) {
    const raw = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', f), 'utf8');
    const old = JSON.parse(raw);
    const g = loadCore({ storage: memoryStorage({ [KEY]: raw }) });
    g.eval('SYN_TUNE.on = 0; UNIQ_TUNE.pow = 3.2; RETOOL.on = 0; gearDirty()'); // pre-K4 baselines predate synergies (B2), the unique rebalance and the retool (legacy Sword/Helm fit any class)
    const S = JSON.parse(JSON.stringify(g.eval('S')));
    const matsOk = Object.keys(old.mats).every(k => JSON.stringify(old.mats[k]) === JSON.stringify(S.mats[k])) && ['crystal', 'fibre', 'herb', 'hide'].every(k => JSON.stringify(S.mats[k]) === '[0,0,0,0,0]');
    const itemsOk = !deepDiff(old.items, S.items) && S.items.map(i => i.id).join() === old.items.map(i => i.id).join();
    const eqOk = Object.keys(old.equip).every(k => S.equip[k] === old.equip[k]) && ['off', 'body', 'sickle'].every(k => S.equip[k] === null);
    const skOk = ['forage', 'bench', 'loom', 'ench'].every(k => S.skills[k] && S.skills[k].lv === 1 && S.skills[k].xp === 0) && ['mine', 'wood', 'smith'].every(k => !deepDiff(old.skills[k], S.skills[k]));
    assert(matsOk && itemsOk && eqOk && skOk, `${f}: materials, ${S.items.length} items, ids, equip and skills identical after load (new ones empty)`);
    const gd = gearDiff(g.fn.gear(), want.gear);
    assert(!gd.length, `${f}: gear() exactly equal to pre-K4` + (gd.length ? ': ' + gd.slice(0, 3).join('; ') : ''));
    const hd = g.fn.heroDps(), td = g.fn.totalDps();
    assert(hd === want.hero && td === want.total, `${f}: heroDps ${hd} and totalDps ${td} exactly equal to pre-K4`);
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
    g2.eval('SYN_TUNE.on = 0; UNIQ_TUNE.pow = 3.2; RETOOL.on = 0; gearDirty()');
    const d2 = deepDiff(JSON.parse(saved), JSON.parse(JSON.stringify(g2.eval('S'))));
    assert(!d2 && g2.fn.heroDps() === want.hero && g2.fn.totalDps() === want.total && !gearDiff(g2.fn.gear(), want.gear).length, `${f}: load-save-load round trip lossless` + (d2 ? ': ' + d2 : ''));
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

// ---- 7. synergies, kits, Common Cause and Bond (56b-synergy.js, B2) ----
console.log('synergy');
try {
  const g = loadCore({ seed: 6 });
  const E = s => g.eval(s);
  E('chooseClass("warden"); ROSTER_KEYS.forEach(k => unlockChar(k, "test", true))');
  const lv = (ids, n) => E(`${JSON.stringify(ids)}.forEach(k => { charRec(k).lv = ${n}; })`);
  const field = ids => E(`setField(${JSON.stringify(ids)})`);
  const act = () => E('activeSynergies()');
  const syn = id => act().find(s => s.id === id) || null;
  E('ROSTER_KEYS.forEach(k => { charRec(k).lv = 1; })');
  // line-ups
  field(['tobin', 'wren', 'pip']);
  assert(syn('hedgefolk') && syn('hedgefolk').members.length === 3 && !syn('kindlestar'), 'Hedgefolk x3 active, Kindle and Starfall not');
  field(['pip', 'oriel', 'kestrel']);
  assert(syn('kindlestar') && syn('dusk') && !syn('hedgefolk'), 'Pip + Oriel + Kestrel: Kindle and Starfall, Dusk Company');
  field(['corvin', 'aldric', 'elowen']);
  assert(syn('oldenemies') && syn('oldoath') && !syn('chosen'), 'Corvin + Aldric + Elowen: Old Enemies, The Old Oath; no Chosen for a Warden');
  assert(E('synergyStatus("chosen").text') === 'needs a Lanternmage hero', `Chosen status: ${E('synergyStatus("chosen").text')}`);
  field(['wren', 'bram', 'kestrel']);
  assert(syn('hunting') && syn('markleap') && syn('hedgefolk'), 'Wren + Bram + Kestrel: Hunting Party, Mark and Leap, Hedgefolk x2');
  assert(/A third Hedgefolk/.test(E('synergyStatus("hedgefolk").text')), 'Hedgefolk x2 asks for a third');
  // Shield and Hearth reads the cells: tank in Front, support next behind in the same lane
  field(['tobin', 'hesketh', 'pip']);
  E('S.party.cells = { hero: { col: 1, lane: 1 }, tobin: { col: 2, lane: 0 }, hesketh: { col: 0, lane: 0 }, pip: { col: 0, lane: 1 } }');
  assert(syn('hearth') && syn('hearth').stageC && syn('hearth').members.join() === 'tobin,hesketh', 'Shield and Hearth: Tobin in front, Hesketh behind (Mid empty)');
  E('S.party.cells = { hero: { col: 1, lane: 0 }, tobin: { col: 2, lane: 0 }, hesketh: { col: 0, lane: 0 }, pip: { col: 0, lane: 1 } }');
  assert(!syn('hearth') && E('synergyStatus("hearth").text') === 'needs a support right behind your tank', 'Shield and Hearth off when someone else stands between');
  // Common Cause and Bond
  field(['kestrel', 'oriel', 'maren']);
  assert(syn('dusk') && syn('dusk').strength === 1, 'Dusk Company (Rare + Epic, below 25): strength 1');
  const d1 = E('synergyMods().party');
  lv(['kestrel'], 25); field(['kestrel', 'oriel', 'maren']);
  assert(syn('dusk').strength === 1.5, 'Bond at level 25: strength 1.5');
  const d2 = E('synergyMods().party');
  assert(Math.abs((d2 - 1) / (d1 - 1) - 1.5) < 1e-9, `Bond scales the effect by 1.5 (${d1.toFixed(4)} -> ${d2.toFixed(4)})`);
  field(['tobin', 'wren', 'maren']);
  assert(syn('hedgefolk').strength === 1.25, 'Common Cause: Hedgefolk strength 1.25');
  lv(['tobin', 'wren'], 25); field(['tobin', 'wren', 'maren']);
  assert(syn('hedgefolk').strength === 1.875, 'Common Cause x Bond: 1.875 (Bond counts once)');
  field(['corvin', 'aldric', 'maren']);
  assert(syn('oldenemies').strength === 1.5, 'Legendary Bond from level 1');
  // removing a member deactivates and removes the effect
  E('ROSTER_KEYS.forEach(k => { charRec(k).lv = 30; })');
  const ev = []; g.fn.on('synergyChange', p => ev.push(p));
  field(['pip', 'oriel', 'morwen']);
  const om = E('synergyMods().char.oriel'), cd = g.fn.compDps();
  assert(syn('kindlestar') && syn('waxkindle') && om > 1, `Pip + Oriel + Morwen active (Oriel x${om.toFixed(3)})`);
  field(['tobin', 'oriel', 'morwen']);
  assert(!syn('kindlestar') && !syn('waxkindle') && E('synergyMods().char.oriel') < om && ev.some(p => p.lost.includes('kindlestar')), 'benching Pip ends both synergies and emits synergyChange');
  assert(E('synergyMods().char.tobin') >= 1 && E('synergyMods().char.pip') === undefined, 'benched characters get no multiplier');
  // synergies only add: compDps with effects >= without
  field(['pip', 'oriel', 'morwen']);
  const on = g.fn.compDps(); E('SYN_TUNE.on = 0'); const offD = g.fn.compDps(); E('SYN_TUNE.on = 1');
  assert(Math.abs(on / cd - 1) < 1e-9 && on > offD, `effects add damage (x${(on / offD).toFixed(3)}); switching off restores the base`);
  // no NaN: every character at levels 1 / 25 / 100, in varied line-ups, for every class
  const bad = [];
  for (const cls of ['warden', 'lanternmage', 'ranger', 'lightkeeper']) {
    E(`S.party.cls = ${JSON.stringify(cls)}`);
    for (const n of [1, 25, 100]) {
      E(`ROSTER_KEYS.forEach(k => { charRec(k).lv = ${n}; charRec(k).rank = Math.floor((${n} - 1) / 25); })`);
      const keys = E('ROSTER_KEYS');
      keys.forEach((k, i) => {
        field([k, keys[(i + 5) % 18], keys[(i + 11) % 18]]);
        const v = E(`[charDps(${JSON.stringify(k)}), compDps(), totalDps(), goldMult(), critChance(), mod('compXp')]`);
        if (!v.every(x => Number.isFinite(x) && x > 0)) bad.push(`${cls} ${k} L${n}: ${v.join(',')}`);
      });
    }
  }
  assert(!bad.length, 'charDps finite for all 18 at levels 1/25/100' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  // kit data for the UI
  const kit = E(`ROSTER_KEYS.map(k => { const t = charTraits(k); return [k, t.length, t.some(x => x.kind === 'speciality'), t.some(x => x.kind === 'bond'), t.every(x => x.text && x.name && typeof x.active === 'boolean' && typeof x.stageC === 'boolean')]; })`);
  assert(kit.every(([, n, sp, bd, okT]) => n >= 4 && sp && bd && okT), 'every character has a speciality, a bond and well-formed traits');
  assert(E("['kestrel','maren','aldric','thessaly','anselm'].every(k => charTraits(k).some(t => t.kind === 'trait')) && ['elowen','caedmon','corvin'].every(k => charTraits(k).some(t => t.kind === 'aura'))"), 'Rares have a trait, Legendaries an aura');
  assert(E('SYNERGIES.length === 14 && SYNERGIES.every(s => synergyStatus(s.id) && synergyStatus(s.id).text)'), '14 synergies, each with a status line');
  field(['pip', 'tobin']);
  assert(E('synergyStatus("markleap").text') === 'needs Wren and Kestrel' && E('synergyStatus("dusk").text') === 'needs 2 more Dusk Company', `missing text (${E('synergyStatus("markleap").text')} / ${E('synergyStatus("dusk").text')})`);
  field(['wren', 'kestrel']);
  assert(E('synergyStatus("markleap").text') === 'Active, 88% stronger.', `active text (${E('synergyStatus("markleap").text')})`);
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
    E('S.maxZone = UNLOCK_TUNE.quests.elowen.from; S.gold = UNLOCK_TUNE.quests.elowen.gold + 5e7; S.mats.ess[3] = 25');
    assert(E('recruit("elowen")') && E('S.gold') === 5e7 && E('S.mats.ess[3]') === 5, `Elowen: ${E('fmt(UNLOCK_TUNE.quests.elowen.gold)')} gold + 20 Blazing Essence handed in at zone ${E('UNLOCK_TUNE.quests.elowen.from')}`);
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
  E('globalThis.__crafted = []; on("crafted", p => { globalThis.__crafted.push(p.kind + ":" + p.t); })');
  E('chooseClass("lanternmage")');
  const mats = () => E('JSON.stringify(S.mats)');
  // gates and player-facing reasons
  const why0 = E('canCraft("robe", 1).why');
  assert(why0 === '7 more Flax Fibre, 1 more Quartz Shard, 1 more Sage Sprig, 2 more Dim Essence', `canCraft names what is missing (${why0})`);
  assert(E('canCraft("robe", 2).why') === 'Needs Tailoring 4' && E('craftItem("robe", 2)') === null, 'station tier gate: Needs Tailoring 4');
  assert(E('canCraft("charm", 3).why') === 'Needs Enchanting 9', "Charm gates on the Enchanter's Table...");
  E('S.skills.smith.lv = 9');
  assert(E('canCraft("charm", 3).why') !== 'Needs Enchanting 9', '...or Smithing, so old saves keep the recipe (camp N4)');
  E('S.skills.smith.lv = 1');
  // pays exactly, rolls affixes, station XP, events
  E('for (const k of CRAFT_FAMILIES) S.mats[k] = [200, 200, 200, 200, 200]');
  const m0 = JSON.parse(mats()), n0 = E('S.items.length');
  const it = E('craftItem("robe", 1)');
  const m1 = JSON.parse(mats());
  const paid = Object.fromEntries(Object.keys(m0).map(k => [k, m0[k][0] - m1[k][0]]).filter(([, n]) => n));
  assert(it && it.slot === 'robe' && Array.isArray(it.a) && it.a.length >= 1 && E('S.items.length') === n0 + 1, `craftItem makes a Robe with ${it && it.a.length} affix line(s)`);
  assert(JSON.stringify(paid) === JSON.stringify({ ess: 2, crystal: 1, fibre: 7, herb: 1 }), `craft pays the recipe exactly (${JSON.stringify(paid)})`);
  assert(E('S.skills.loom.xp') === 20 && E('globalThis.__crafted.join()') === 'robe:1', 'Tailoring XP 20 (no catch-up when level) and a crafted event');
  E('S.skills.smith.lv = 10; S.skills.loom.lv = 1; S.skills.loom.xp = 0'); E('craftItem("mitre", 1)');
  assert(E('craftXpFor("loom", 20)') === 40 && E('S.skills.loom.lv') === 2 && E('S.skills.loom.xp') === 40 - 25, 'catch-up: x2 XP while below Smithing');
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
  assert(E('canReforge(S.items[S.items.length - 1].id, 0).why') === 'Needs Enchanting 4', 'Reforge needs Enchanting for the tier');
  // Transmute
  E('S.skills.ench.lv = 1; S.mats.ore = [8, 0, 0, 0, 0]');
  assert(E('canTransmute("ore", 1, "ore").why') === 'Needs Enchanting 4' && !E('transmute("ore", 1, 2)'), 'Transmute up needs Enchanting for the new tier');
  E('S.skills.ench.lv = 4');
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
  const cnt = E('S.items.length'), ids0 = E('S.items.map(i => i.id).join()'), gear0 = E('JSON.stringify(gear())'), hd0 = g.fn.heroDps();
  const toasts = []; g.fn.on('toast', t => toasts.push(t.msg));
  E('S.party.mirrors = 1; useMirror(); chooseClass("warden")');
  const sl = id => E(`itemById(${id}).slot`);
  assert(E(`S.equip.weapon === ${up} && S.equip.off === ${lan} && S.equip.helm === ${helm}`) && sl(up) === 'warblade' && sl(lan) === 'shield' && sl(helm) === 'greathelm' && sl(hood) === 'greathelm' && sl(bow) === 'bow',
    `class change retools: Staff -> Warblade, Lantern -> Shield, old Helm -> Greathelm (worn), bag Hood -> Greathelm, bag Bow (companion kind) kept (${[up, lan, helm, hood, bow].map(sl).join(',')})`);
  assert(E('S.items.length') === cnt && E('S.items.map(i => i.id).join()') === ids0 && E(`itemById(${up}).rt === "staff" && itemById(${helm}).rt === "helm" && itemById(${up}).plus === 4`), 'class change: same ids, count, +N; rt keeps the original kind');
  assert(E('JSON.stringify(gear())') === gear0 && g.fn.heroDps() >= hd0, `class change keeps every gear() line (hero dps ${hd0.toFixed(1)} -> ${g.fn.heroDps().toFixed(1)})`);
  assert(toasts.includes('Your old helm was reforged into Warden gear.') && toasts.includes('Your Lanternmage gear was reforged into Warden gear.'), 'class change tells the player once: ' + toasts.filter(t => /reforged/.test(t)).join(' | '));
  // Star Chart -> Oriel
  E('S.skills.ench.lv = 8');
  assert(E('canCraft("starChart", 3).why') === 'Needs Enchanting 9', 'Star Chart needs Enchanting 9');
  E('S.skills.ench.lv = 9; S.mats.crystal[2] = 40; S.mats.ess[2] = 20; S.craft.troph = [0, 0, 0, 0, 0, 0, 0]');
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

// ---- pacing table (40-rules.js PACE, M6). The balance targets: node tools/sim.mjs --targets ----
console.log('pacing');
try {
  const g = loadCore({ seed: 3 }), E = s => g.eval(s);
  const hp = E('Array.from({ length: 140 }, (_, i) => mobHp(i + 1))');
  assert(hp.every((h, i) => Number.isFinite(h) && (i === 0 || h > hp[i - 1])), 'mob HP rises every zone to 140');
  assert(E('mobHp(35) / mobHp(34)') > E('mobHp(36) / mobHp(35)'), 'region 1 step lands on zone 35 and stays');
  assert(E('[1, 6, 7, 19, 35, 36, 200].map(zoneTier).join()') === '1,1,2,4,4,5,5', 'essence tiers by zone (Starlit from 36)');
  assert(E('paceXp(1) === 1 && paceXp(PACE.compLv) === 1 && paceXp(200) === PACE.compXpMax'), 'companion XP curve: 1 up to compLv, capped at compXpMax');
  // Hero XP while away: quiet level-ups, no toasts.
  E('chooseClass("warden"); S.maxZone = S.zone = 20; S.activity = "fight"');
  let toasts = 0; g.fn.on('toast', () => toasts++);
  const L0 = E('S.L'); g.fn.awayGains(4 * 3600);
  assert(E('S.L') > L0 && !toasts && !g.errors.length, `away time levels the hero quietly (L${L0} -> L${E('S.L')}, ${toasts} toasts)`);
} catch (e) { fail('pacing crashed: ' + (e.stack || e)); }

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
  assert(rate > expect * 0.7 && rate < expect * 1.6, `Barrow Beetle zone drops Hide on kills (${hide} in 400 kills, ${rate.toFixed(2)}/kill, base ${expect.toFixed(2)} before stars)`);
  // home ground
  E('S.zone = 2; S.mastery.zones[2] = 0');
  assert(E('homeFamily()') === 'crystal' && E('homeBonus("crystal")') === 0.25 && E('mod("yield:crystal")') === 1.25 && E('homeBonus("ore")') === 0, 'Batwing Caves: Crystal +25% (home ground), Ore +0%');
  E('S.mastery.zones[2] = MASTERY_STARS[2]');
  assert(E('homeBonus("crystal")') === 0.5, 'home ground +50% with 3 mastery stars');
  // champions and trophies
  E('S.craft.troph = [0, 0, 0, 0, 0, 0, 0]; S.craft.champ = 0; S.maxZone = 30; S.zone = 22; fightBoss = false');
  E('{ const r = Math.random; Math.random = () => 0; spawn(); Math.random = r; }');
  const ch = E('({ champ: !!mob.champ, name: mob.name, ratio: mob.hp / mobHp(22) })');
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

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
