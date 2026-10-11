// Tallies Tavern Blackjack's BJ-a, BJ-b and BJ-c over many seeds (card blackjack-odds-multiseed).
// Usage: node docs/proof/blackjack-odds-multiseed/tally.mjs <dir>, where <dir> holds s<seed>.txt, each the output of
//   node tools/sim.mjs --report econ --days 14 --seed <seed> --blackjack 1
// Prints the per-seed table and, for BJ-b and BJ-c, the paired change (table on minus off) per profile: its mean, its
// standard error and the spread of the table-off baseline across seeds.
import fs from 'node:fs';
import path from 'node:path';
const dir = process.argv[2];
const profs = ['idle', 'normal', 'active'];
const rows = fs.readdirSync(dir).filter(f => /^s\d+\.txt$/.test(f)).map(f => {
  const seed = +f.slice(1, -4), t = fs.readFileSync(path.join(dir, f), 'utf8');
  const line = id => { const i = t.indexOf(`  ${id} `); if (i < 0) throw new Error(`${f}: no ${id} line`); const ls = t.slice(i).split('\n'); return { pass: t.slice(t.lastIndexOf('\n', i) + 1, i) === 'PASS', detail: ls[1].trim() }; };
  const a = line('BJ-a'), b = line('BJ-b'), c = line('BJ-c'), e = line('BJ-e');
  const r = { seed, a: a.pass, b: b.pass, c: c.pass, e: e.pass, loss: {}, p90: {}, ec5: {}, zone: {} };
  for (const p of profs) {
    let m = new RegExp(`${p} (-?[\\d.]+)% of [\\d,]+ foes a day, p90 loss (-?[\\d.]+) H`).exec(a.detail); r.loss[p] = +m[1]; r.p90[p] = +m[2];
    m = new RegExp(`${p} (\\d+)% -> (\\d+)%`).exec(b.detail); r.ec5[p] = [+m[1], +m[2]];
    m = new RegExp(`${p} (\\d+) -> (\\d+)`).exec(c.detail); r.zone[p] = [+m[1], +m[2]];
  }
  return r;
}).sort((x, y) => x.seed - y.seed);
const pf = b => b ? 'pass' : 'FAIL', mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const sd = a => { const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, a.length - 1)); };
const f1 = x => (x > 0 ? '+' : '') + x.toFixed(1);
console.log('| Seed | BJ-a loss % (idle / normal / active), p90 H | BJ-a | BJ-b EC5 % off -> on (idle / normal / active) | BJ-b | BJ-c zone off -> on (idle / normal / active) | BJ-c | BJ-e |');
console.log('|---|---|---|---|---|---|---|---|');
for (const r of rows) console.log(`| ${r.seed} | ${profs.map(p => r.loss[p].toFixed(2)).join(' / ')}, p90 ${Math.max(...profs.map(p => r.p90[p])).toFixed(2)} | ${pf(r.a)} | ${profs.map(p => r.ec5[p].join(' -> ')).join(', ')} | ${pf(r.b)} | ${profs.map(p => r.zone[p].join(' -> ')).join(', ')} | ${pf(r.c)} | ${pf(r.e)} |`);
const n = rows.length, cnt = k => rows.filter(r => r[k]).length;
console.log(`\nSeeds ${n}. Pass: BJ-a ${cnt('a')}/${n}, BJ-b ${cnt('b')}/${n}, BJ-c ${cnt('c')}/${n}, BJ-e ${cnt('e')}/${n}.`);
console.log('\n| Profile | BJ-a mean loss % (max) | BJ-b EC5 change: mean ± s.e. (min, max) | EC5 off across seeds: mean ± s.d. | BJ-c zone change: mean ± s.e. (min, max) | Zone off across seeds: mean ± s.d. |');
console.log('|---|---|---|---|---|---|');
for (const p of profs) {
  const L = rows.map(r => r.loss[p]), dB = rows.map(r => r.ec5[p][1] - r.ec5[p][0]), dC = rows.map(r => r.zone[p][1] - r.zone[p][0]);
  const B0 = rows.map(r => r.ec5[p][0]), C0 = rows.map(r => r.zone[p][0]), se = a => sd(a) / Math.sqrt(a.length);
  console.log(`| ${p} | ${mean(L).toFixed(2)} (${Math.max(...L).toFixed(2)}) | ${f1(mean(dB))} ± ${se(dB).toFixed(1)} (${f1(Math.min(...dB))}, ${f1(Math.max(...dB))}) | ${mean(B0).toFixed(0)} ± ${sd(B0).toFixed(0)} | ${f1(mean(dC))} ± ${se(dC).toFixed(1)} (${f1(Math.min(...dC))}, ${f1(Math.max(...dC))}) | ${mean(C0).toFixed(1)} ± ${sd(C0).toFixed(1)} |`);
}
