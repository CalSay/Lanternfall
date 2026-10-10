// Refit ZONE_FOE_TUNE.fit (59l): for each first-hour boss row, the HP that holds the played-well length and each hero's damage that holds
// their casual win rate, kits on against kits off (tools/budget.mjs, 240 fights a cell). About 3 minutes. ROWS=z8-boss:8 for one zone.
//   node docs/proof/ns-foe-kits-z1-10/fit.mjs
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const ROOT = new URL('../../..', import.meta.url).pathname, OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'kitfit-')), H = ['wren', 'tobin', 'pip'];
const rows = (process.env.ROWS || 'z1-boss:1,z3-boss:3,z4-boss:4,z5-boss:5,z6-boss:6,z7-boss:7,z8-boss:8,z9-boss:9,z10-boss:10').split(',').map(s => s.split(':'));
let n = 0;
const run = (id, ev, heroes = H) => {
  const f = `${OUT}/fit2-${id}-${n++ % 8}.json`;
  execFileSync('node', ['tools/budget.mjs', '--only', id, '--heroes', heroes.join(','), '--json', f, ...(ev ? ['--eval', ev] : [])], { cwd: ROOT, stdio: 'pipe' });
  const r = JSON.parse(fs.readFileSync(f, 'utf8')).rows[0].perHero;
  return Object.fromEntries(heroes.map(h => [h, { cw: r[h].casual.win, gt: r[h].good.turns }]));
};
const fits = {};
for (const [id, zs] of rows) {
  const z = +zs, off = run(id, '');
  const ev = f => `ZONE_FOE_TUNE.fit[${z}] = ${JSON.stringify(f)}; zoneFoeArea(0,1); zoneFoeArea(1,1)`;
  const mgt = o => H.reduce((a, h) => a + o[h].gt, 0) / 3;
  let f = [1, 1, 1, 1], on = run(id, ev(f));
  for (let i = 0; i < 3; i++) { f[0] *= mgt(off) / mgt(on); on = run(id, ev(f)); }
  f[0] = Math.round(f[0] * 100) / 100;
  H.forEach((h, j) => {
    if (off[h].cw >= 0.995) return;   // saturated: damage parity
    let lo = 0.4, hi = 3;
    for (let i = 0; i < 8; i++) { const d = Math.sqrt(lo * hi); const g = f.slice(); g[j + 1] = d; const r = run(id, ev(g), [h]); if (r[h].cw > off[h].cw) lo = d; else hi = d; }
    f[j + 1] = Math.round(Math.sqrt(lo * hi) * 100) / 100;
  });
  on = run(id, ev(f));
  fits[z] = f;
  console.log(id, JSON.stringify(f), 'OFF', H.map(h => off[h].cw + '/' + off[h].gt).join(' '), 'ON', H.map(h => on[h].cw + '/' + on[h].gt).join(' '));
}
console.log(JSON.stringify(fits));
