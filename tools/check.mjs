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
    g.eval('SYN_TUNE.on = 0; gearDirty()'); // pre-K4 baselines predate synergies (B2)
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
    g2.eval('SYN_TUNE.on = 0; gearDirty()');
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
    assert(E(`fits("shield", "wpn", "tank") && fits("shield", "off", "warden") && !fits("shield", "off", "ranger") && fits("weapon", "weapon", "lightkeeper") && fits("helm", "helm", "ranger") && fits("trinket", "trk", "tobin") && !fits("trinket", "weapon", "any")`), 'fits(): class, role, character and legacy rules');
    assert(E('upgradeCost({ slot: "bow", t: 1, r: "common", plus: 7 }).troph === 1 && !("troph" in upgradeCost({ slot: "bow", t: 1, r: "common", plus: 6 })) && !("troph" in upgradeCost({ slot: "bow", t: 1, r: "common", plus: 10 }))'), 'upgrades to +8, +9 and +10 name a Trophy');
    assert(E('itemName(newItem("bow", 2, "rare")) === "Yew Bow" && itemColor("bow", 2) === MAT.wood.col[1] && craftCost("bow", 2).wood === 9'), 'names, colours and costs for new kinds');
    assert(Object.keys(E('newItem("weapon", 1, "common")')).join() === 'id,slot,t,r,plus', 'legacy forge items carry no new fields');
    assert(!g.errors.length, 'no items handler errors' + (g.errors.length ? ': ' + g.errors[0] : ''));
  }
} catch (e) { fail('items crashed: ' + (e.stack || e)); }

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

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
