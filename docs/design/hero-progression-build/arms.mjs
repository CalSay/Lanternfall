// node arms.mjs <snapDir> [fights]
// Prediction 1 (the switch) and the judge's dominance arms, from saves the sim wrote (tools/sim.mjs --snapday D:path):
//   <snapDir>/<class>-d2.json  (the good persona's save near zone 20)
//   <snapDir>/<class>-d12.json (near zone 30)
// Switch: on each starter's zone-20 save, the hero playing and each other starter (lifted to the road's level, points
// spread evenly, signature kit) fight the save's furthest zone; win rates in points.
// Arms: on each starter's own saves, even, the four pure builds and the six half/half pairs fight normal foes and the
// zone boss; win rate (good and casual skill) and, for normal foes, kills an hour.
import { loadCore, memoryStorage } from '../../../tools/lib/core.mjs';
import fs from 'node:fs';

const dir = process.argv[2], N = +(process.argv[3] || 150);
const KEY = 'lanternfall.save.v6';
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
function sample(E, z, boss, skill, seed) {
  return JSON.parse(E(`(() => { setZone(${z}); S.activity = 'fight'; arena = null; fightBoss = ${boss}; spawn();
    const r = turnCombatSample({ profile: turnCombatProfile(), seconds: 36000, seed: ${seed}, skill: ${JSON.stringify(skill)}, fights: ${N} });
    return JSON.stringify({ win: r.kills / Math.max(1, r.kills + r.deaths), kph: r.kills / Math.max(1, r.totalFightSeconds) * 3600, turns: r.totalHeroTurns / Math.max(1, r.completedFights) }); })()`));
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
    build(s.E, null);
    const n = sample(s.E, z, false, SKILL.good, 11), b = sample(s.E, z, true, SKILL.good, 12);
    const d = Math.min((n.win - base.n.win) * 100, (b.win - base.b.win) * 100);
    console.log(`  -> ${to} joins at Lv ${s.E('S.L')}: normal ${pct(n.win)}%, boss ${pct(b.win)}% (worst gap ${d.toFixed(0)} points) ${d >= -10 ? 'ok' : 'MISS'}`);
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
