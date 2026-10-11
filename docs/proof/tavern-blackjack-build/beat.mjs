// Opening-beat proof for tavern-blackjack-build (docs/design/tavern-blackjack.md 7): the card table opens with no other new
// thing within ONBOARD_TUNE.gap (90 s of play) and no F4 burst (4 new things in any 10 minutes of play).
// Run from the repo root: node docs/proof/tavern-blackjack-build/beat.mjs
//   1. The three starter picks (Tobin, Wren, Pip): tools/sim.mjs --days 1 --blackjack 1 plays a cold new game with the real core
//      (the table player on), and logs every unlock and starter join with its active play second.
//   2. A cold save that builds the Tavern after zone 14: tests/proof-fixtures/save-z15-close.json (zone 15, no Tavern), the Tavern
//      built through campBuild, then 20 minutes of play; every unlock is logged on the guide's play clock.
// tools/walk.mjs plays the first hour, which ends before zone 14, so the long road here is the sim's bot on the same core.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, loadCore, memoryStorage } from '../../../tools/lib/core.mjs';

const GAP = 90, F4 = 600;
let bad = 0;
const judge = (name, rows) => {
  const at = rows.find(r => r[0] === 'blackjack');
  if (!at) { console.log(`FAIL ${name}: the table never opened`); bad++; return; }
  const near = rows.filter(r => r !== at && Math.abs(r[1] - at[1]) < GAP);
  let burst = 0; for (const r of rows) { const n = rows.filter(x => x[1] >= r[1] && x[1] < r[1] + F4).length; if (n >= 4 && Math.abs(r[1] - at[1]) < F4 && at[1] >= r[1] && at[1] < r[1] + F4) burst = Math.max(burst, n); }
  const ok = !near.length && !burst;
  if (!ok) bad++;
  const around = rows.filter(r => Math.abs(r[1] - at[1]) <= F4).map(r => `${r[0]}@${Math.round(r[1])}s z${r[2]}`).join(', ');
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: the table opened at ${Math.round(at[1])} s of play (zone ${at[2]}); within 90 s: ${near.map(r => r[0]).join(', ') || 'nothing'}; F4 burst: ${burst || 'none'} | 10 min around it: ${around}`);
};

for (const [hero, cls] of [['Tobin', 'warden'], ['Wren', 'ranger'], ['Pip', 'lanternmage']]) {
  const out = execFileSync(process.execPath, [path.join(ROOT, 'tools', 'sim.mjs'), '--days', '1', '--class', cls, '--blackjack', '1', '--json', '1'], { maxBuffer: 1 << 26, encoding: 'utf8' });
  const j = JSON.parse(out.split('\n').find(l => l.startsWith('JSON ')).slice(5));
  const tav = j.blackjack.unlocks.find(r => r[0] === 'tavern');
  judge(`${hero} (cold new game, Tavern row at zone ${tav ? tav[2] : '-'})`, j.blackjack.unlocks);
}

{
  const raw = fs.readFileSync(path.join(ROOT, 'tests', 'proof-fixtures', 'save-z15-close.json'), 'utf8');
  const g = loadCore({ seed: 3, storage: memoryStorage({ 'lanternfall.save.v5': raw }), prelude: `Date.__t = ${JSON.parse(raw).last}; Date.now = () => Date.__t;` }), E = s => g.eval(s), rows = [];
  const sec = () => { E('Date.__t += 1000'); g.fn.tick(1); };
  g.fn.on('unlock', ({ id }) => rows.push([id, E('S.onboard.t'), E('S.maxZone')]));
  E('S.auto = false; S.solo && (S.solo.auto = false); S.gold = 1e7; for (const f of Object.keys(S.mats)) S.mats[f] = S.mats[f].map(n => n + 500)');
  for (let i = 0; i < 120; i++) sec();   // settle the rows the fixture already earned
  rows.length = 0;
  const built = E('campBuild("tavern")');
  for (let i = 0; i < 1500 && !E('S.onboard.got.blackjack != null'); i++) sec();
  for (let i = 0; i < 600; i++) sec();
  console.log(`  cold save: Tavern Lv ${E('campLevel("tavern")')}, onboard t ${Math.round(E('S.onboard.t'))}, all ${E('S.onboard.all')}, got ${E('JSON.stringify([S.onboard.got.tavern, S.onboard.got.hands, S.onboard.got.blackjack])')}`);
  if (!built) { console.log('FAIL cold save at zone 15: the Tavern build did not start'); bad++; }
  else judge(`cold save, Tavern built at zone ${E('S.maxZone')} (save-z15-close)`, rows);
}
console.log(bad ? `${bad} beat check(s) failed` : 'all beat checks pass');
process.exit(bad ? 1 : 0);

