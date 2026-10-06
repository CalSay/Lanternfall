// node arms.mjs <snapDir> [fights]
// Prediction 1 (the switch) and the judge's dominance arms, from saves the sim wrote (tools/sim.mjs --snapday D:path):
//   <snapDir>/<class>-d2.json  (the good persona's save near zone 20)
//   <snapDir>/<class>-d12.json (near zone 30)
// Switch: on each starter's zone-20 save, the hero playing and each other starter (lifted to the road's level, points
// spread evenly, the lamp's stock Scrolls spent on its abilities, signature plus the first two learned equipped) fight the
// save's furthest zone; win rates in points, and the joining hero on its own zone-20 save for comparison.
// Each fight is its own sample with a hashed seed (judge 2026-10-06: one LCG stream correlates long fights).
// Arms: on each starter's own saves, even, the four pure builds and the six half/half pairs fight normal foes and the
// zone boss; win rate (good and casual skill) and, for normal foes, kills an hour.
import { loadCore, memoryStorage } from '../../../tools/lib/core.mjs';
import fs from 'node:fs';

const dir = process.argv[2], N = +(process.argv[3] || 300);
const KEY = 'lanternfall.save.v5';
const CLS = { ranger: 'wren', warden: 'tobin', lanternmage: 'pip' };
const SKILL = { good: { parry: 0.6, dodge: 0.9, perfect: 0.4, good: 0.45 }, casual: { parry: 0.25, dodge: 0.5, perfect: 0.1, good: 0.4 } };
const ATTR = ['might', 'focus', 'guard', 'vigour'];
const ARMS = [['even', null]];
for (const a of ATTR) ARMS.push([a, { [a]: 1 }]);
for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) ARMS.push([ATTR[i] + '/' + ATTR[j], { [ATTR[i]]: 1, [ATTR[j]]: 1 }]);

function boot(file) {
  const g = loadCore({ seed: 7, storage: memoryStorage({ [KEY]: fs.readFileSync(file, 'utf8') }) });
  const E = s => g.eval(s);
  E(`loadSave(); gearDirty(); 0`);
  return { g, E };
}
// split: null = even (attrSpread), else weights; all free points placed
function build(E, split) {
  E(`(() => { const k = soloHero(), r = attrRec(k); for (const id of ATTR_IDS) r[id] = 0; gearDirty(); return 0; })()`);
  if (!split) { E(`attrSpread(); gearDirty(); 0`); return; }
  const ids = Object.keys(split);
  E(`(() => { const ids = ${JSON.stringify(ids)}, free = attrPoints().free; let i = 0; for (let n = 0; n < free; n++) attrAdd(ids[n % ids.length], 1); gearDirty(); return 0; })()`);
}
// a well-mixed 32-bit seed from (arm, fight): never small adjacent integers
const hseed = (a, b) => { let x = (Math.imul(a + 1, 0x9e3779b1) ^ Math.imul(b + 1, 0x85ebca6b)) >>> 0; x ^= x >>> 16; x = Math.imul(x, 0x7feb352d) >>> 0; x ^= x >>> 15; x = Math.imul(x, 0x846ca68b) >>> 0; x ^= x >>> 16; return (x | 0) || 1; };
function sample(E, z, boss, skill, seed) {
  return JSON.parse(E(`(() => { setZone(${z}); S.activity = 'fight'; arena = null; fightBoss = ${boss}; spawn();
    const p = turnCombatProfile(), seeds = ${JSON.stringify(Array.from({ length: N }, (_, i) => hseed(seed, i)))};
    let kills = 0, deaths = 0, secs = 0;
    for (const sd of seeds) { const r = turnCombatSample({ profile: p, seconds: 3600, seed: sd, skill: ${JSON.stringify(skill)}, fights: 1 }); kills += r.kills; deaths += r.deaths; secs += r.totalFightSeconds; }
    return JSON.stringify({ win: kills / Math.max(1, kills + deaths), kph: kills / Math.max(1, secs) * 3600 }); })()`));
}
// the lamp's stock Scrolls go on the joining hero's abilities, as a player would; then the signature and the first two learned
function kit(E) {
  E(`(() => { const k = soloHero(); for (const id of HERO_ABILITIES[k]) if (!abilityOwned(k, id) && !abLearnInfo(k, id).why) abilityLearn(k, id);
    const sig = SOLO_HEROES[k].eq[0], rest = soloAbilities(k).filter(id => id !== sig).slice(0, 2);
    soloEquip(0, sig); rest.forEach((id, i) => soloEquip(i + 1, id)); gearDirty(); return 0; })()`);
}
const pct = x => (100 * x).toFixed(0);

console.log(`# Switch (prediction 1): zone-20 saves, ${N} fights an arm, good skill`);
for (const cls of Object.keys(CLS)) {
  const f = `${dir}/${cls}-d2.json`; if (!fs.existsSync(f)) continue;
  const { E } = boot(f), z = E('S.maxZone'), from = E('soloHero()'), L = E('S.L');
  build(E, null);
  const base = { n: sample(E, z, false, SKILL.good, 11), b: sample(E, z, true, SKILL.good, 12) };
  console.log(`${from} Lv ${L} at zone ${z}: normal ${pct(base.n.win)}%, boss ${pct(base.b.win)}%`);
  for (const to of Object.values(CLS)) {
    if (to === from) continue;
    const s = boot(f);
    s.E(`soloPick('${to}', { now: true }); ${process.env.SAMELV ? 'S.L = ' + L + '; S.xp = 0;' : ''} 0`);
    kit(s.E); build(s.E, null);
    const n = sample(s.E, z, false, SKILL.good, 11), b = sample(s.E, z, true, SKILL.good, 12);
    const own = Object.keys(CLS).find(c => CLS[c] === to), of = `${dir}/${own}-d2.json`;
    let ownTxt = '';
    if (fs.existsSync(of)) { const o = boot(of); build(o.E, null); const oz = o.E('S.maxZone'), ob = sample(o.E, oz, true, SKILL.good, 12); ownTxt = ` | own save Lv ${o.E('S.L')} zone ${oz}: boss ${pct(ob.win)}%`; }
    const dn = (n.win - base.n.win) * 100;
    console.log(`  -> ${to} joins at Lv ${s.E('S.L')}: normal ${pct(n.win)}% (${dn.toFixed(0)} points), boss ${pct(b.win)}%${ownTxt} | normal ${dn >= -10 ? 'ok' : 'MISS'}, boss ${b.win >= 0.6 ? 'ok' : 'MISS'} (judge: normal within 10 points, boss 60%+)`);
  }
}

console.log(`\n# Dominance arms: ${N} fights an arm`);
for (const cls of Object.keys(CLS)) for (const d of ['d2', 'd12']) {
  const f = `${dir}/${cls}-${d}.json`; if (!fs.existsSync(f)) continue;
  const { E } = boot(f), z = E('S.maxZone'), hero = E('soloHero()');
  console.log(`${hero} Lv ${E('S.L')} zone ${z}`);
  const rows = [];
  for (const [name, split] of ARMS) {
    build(E, split);
    const n = sample(E, z, false, SKILL.casual, 21), bg = sample(E, z, true, SKILL.good, 22), bc = sample(E, z, true, SKILL.casual, 23);
    rows.push({ name, n, bg, bc });
  }
  for (const r of rows) console.log(`  ${r.name.padEnd(14)} normal(casual) ${pct(r.n.win).padStart(3)}% ${r.n.kph.toFixed(0).padStart(5)}/h | boss good ${pct(r.bg.win).padStart(3)}% | boss casual ${pct(r.bc.win).padStart(3)}%`);
  for (const k of ['n', 'bg', 'bc']) {
    const key = r => k === 'n' ? r.n.win * 1000 + r.n.kph / 1000 : r[k].win;
    const best = rows.reduce((a, b) => key(b) > key(a) ? b : a), even = rows[0];
    console.log(`  best on ${k}: ${best.name} (${pct(best[k].win)}% vs even ${pct(even[k].win)}%)`);
  }
}
