// Tavern Blackjack: house edge, swing and the table limits against the gold curve (docs/design/tavern-blackjack.md 5).
// Run from the repo root: node docs/design/tavern-blackjack/bj-econ.mjs [hands=2000000] [days=20000]
// Reads the gold curve from the shipped core (foeGoldBase, earlyGold, ECON.hourFoes); the table rules are the spec's.
import { loadCore } from '../../../tools/lib/core.mjs';

const HANDS = +(process.argv[2] || 2e6), DAYS = +(process.argv[3] || 2e4);
let seed = 12345;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

// ---- one hand: 4 decks shuffled fresh every hand, dealer stands on all 17s, blackjack 3:2, double on any first two, no split ----
const SHOE = []; for (let d = 0; d < 4; d++) for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) SHOE.push(Math.min(10, r));
function dealer() { const shoe = SHOE.slice(); let n = shoe.length; return () => { const i = Math.floor(rnd() * n); const c = shoe[i]; shoe[i] = shoe[--n]; return c; }; }
const val = h => { let t = 0, a = 0; for (const c of h) { t += c === 1 ? 11 : c; if (c === 1) a++; } while (t > 21 && a) { t -= 10; a--; } return { t, soft: a > 0 }; };
// Strategies: 'basic' (the no-split chart), 'mimic' (hit to 17 like the dealer, never double), 'nobust' (stand on 12 and up).
function decide(strat, h, up) {
  const { t, soft } = val(h), two = h.length === 2, u = up === 1 ? 11 : up;
  if (strat === 'mimic') return t < 17 ? 'H' : 'S';
  if (strat === 'nobust') return t < 12 ? 'H' : 'S';
  if (soft) {
    if (t >= 19) return 'S';
    if (t === 18) return two && u >= 3 && u <= 6 ? 'D' : u <= 8 ? 'S' : 'H';
    if (t === 17) return two && u >= 3 && u <= 6 ? 'D' : 'H';
    if (t >= 15) return two && u >= 4 && u <= 6 ? 'D' : 'H';
    return two && u >= 5 && u <= 6 ? 'D' : 'H';
  }
  if (t >= 17) return 'S';
  if (t >= 13) return u <= 6 ? 'S' : 'H';
  if (t === 12) return u >= 4 && u <= 6 ? 'S' : 'H';
  if (t === 11) return two && u <= 10 ? 'D' : 'H';
  if (t === 10) return two && u <= 9 ? 'D' : 'H';
  if (t === 9) return two && u >= 3 && u <= 6 ? 'D' : 'H';
  return 'H';
}
// Net result of one hand, in bets (+1.5 blackjack, +2/-2 a won or lost double).
function hand(strat) {
  const draw = dealer();
  const p = [draw(), draw()], d = [draw(), draw()];
  const pbj = val(p).t === 21, dbj = val(d).t === 21;
  if (pbj || dbj) return pbj && dbj ? 0 : pbj ? 1.5 : -1;
  let bet = 1;
  for (;;) {
    const a = decide(strat, p, d[0]);
    if (a === 'S') break;
    p.push(draw());
    if (a === 'D') { bet = 2; break; }
    if (val(p).t >= 21) break;
  }
  const pt = val(p).t; if (pt > 21) return -bet;
  while (val(d).t < 17) d.push(draw());
  const dt = val(d).t;
  return dt > 21 || pt > dt ? bet : pt === dt ? 0 : -bet;
}
const per = {};
for (const s of ['basic', 'mimic', 'nobust']) {
  let m = 0, q = 0;
  for (let i = 0; i < HANDS; i++) { const r = hand(s); m += r; q += r * r; }
  const mean = m / HANDS; per[s] = { mean, sd: Math.sqrt(q / HANDS - mean * mean) };
}
console.log(`Per hand, in bets (${HANDS.toLocaleString('en-GB')} hands each):`);
for (const s in per) console.log(`  ${s.padEnd(7)} edge ${(100 * per[s].mean).toFixed(2)}%  sd ${per[s].sd.toFixed(3)}`);

// ---- the table limits by zone (spec 4): min = 2 foes' gold, max = 64 foes, Hesketh's purse and the loss stop = 5 max bets ----
const g = loadCore({ seed: 1 }), E = s => g.eval(s);
const sig = x => E(`econSig(${x})`);
const foe = z => E(`foeGoldBase(${z}) * (${z} >= ECON.early.end ? 1 : ${z} <= ECON.early.full ? ECON.early.x : ECON.early.x - (ECON.early.x - 1) * (${z} - ECON.early.full) / (ECON.early.end - ECON.early.full))`);
const hourFoes = E('ECON.hourFoes');
const LIM = { min: 2, max: 64, purse: 320 };   // in foes' gold
// The 14-day econ report (sim.mjs --report econ, EC2) puts a normal day's income at 6,655 foe-equivalents: about 21 H.
const DAY_FOES = 6655;
console.log(`\nTable limits by zone (gold; H = one hour of fighting = ${hourFoes} foes):`);
console.log('  zone  foe gold   min    max   purse/stop   purse as H');
for (const z of [11, 15, 20, 25, 35, 36, 50, 70, 71, 105, 140, 175]) {
  const f = foe(z), mn = Math.max(10, sig(LIM.min * f)), mx = sig(LIM.max * f), pu = 5 * mx;
  console.log(`  ${String(z).padStart(4)}  ${f.toFixed(1).padStart(8)}  ${String(mn).padStart(5)}  ${String(mx).padStart(5)}  ${String(pu).padStart(10)}   ${(pu / (hourFoes * f)).toFixed(2)}`);
}

// ---- a day at the table, in max bets: play up to N hands, stop at +5 (purse empty) or -5 (loss stop) ----
function day(strat, nHands, betFrac) {
  let net = 0; const cap = 5;
  for (let i = 0; i < nHands; i++) {
    net += betFrac * hand(strat);
    if (net >= cap || net <= -cap) break;
  }
  return net;
}
console.log(`\nA day at the table (${DAYS.toLocaleString('en-GB')} days each), net in max bets; purse and stop at +/-5 (${LIM.purse} foes, ${(LIM.purse / hourFoes).toFixed(2)} H, ${(100 * LIM.purse / DAY_FOES).toFixed(1)}% of a normal day's income):`);
for (const [s, n, b, who] of [['basic', 60, 1, 'keen: basic chart, max bet, up to 60 hands'], ['mimic', 30, 1, 'casual: hits to 17, max bet, 30 hands'], ['mimic', 30, 0.25, 'careful: hits to 17, quarter bet, 30 hands'], ['nobust', 60, 1, 'timid: stands on 12+, max bet, 60 hands']]) {
  let m = 0, win = 0, lose = 0; const xs = [];
  for (let i = 0; i < DAYS; i++) { const r = day(s, n, b); m += r; xs.push(r); if (r >= 5) win++; if (r <= -5) lose++; }
  xs.sort((a, b) => a - b);
  const pct = p => xs[Math.floor(p * (xs.length - 1))].toFixed(2);
  const mf = LIM.max * m / DAYS;
  console.log(`  ${who}\n    mean ${(m / DAYS).toFixed(2)} (${mf.toFixed(1)} foes, ${(mf / hourFoes * 100).toFixed(1)}% of H, ${(100 * mf / DAY_FOES).toFixed(2)}% of a day's income)  p10 ${pct(0.1)}  p50 ${pct(0.5)}  p90 ${pct(0.9)}  purse emptied ${(100 * win / DAYS).toFixed(1)}%  stopped ${(100 * lose / DAYS).toFixed(1)}%`);
}
