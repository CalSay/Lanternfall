// Tavern Blackjack: house edge, swing and the table limits against the gold curve (docs/design/tavern-blackjack.md 4, 6).
// Run from the repo root: node docs/design/tavern-blackjack/bj-econ.mjs [hands=2000000] [days=20000]
// Reads the gold curve from the shipped core (econH, econSig, ECON.hourFoes); the table rules are the spec's.
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
// Net result of one hand, in bets (+1.5 blackjack, +2/-2 a won or lost double). Dealer blackjack ends the hand before
// any double: the same as the spec's no-hole-card rule with "original bet only".
function hand(strat, canDouble = true) {
  const draw = dealer();
  const p = [draw(), draw()], d = [draw(), draw()];
  const pbj = val(p).t === 21, dbj = val(d).t === 21;
  if (pbj || dbj) return pbj && dbj ? 0 : pbj ? 1.5 : -1;
  let bet = 1;
  for (;;) {
    let a = decide(strat, p, d[0]);
    if (a === 'D' && !canDouble) a = 'H';
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

// ---- the table limits by zone (spec 4), in price-hours: H(z) = econH(z), the unit every price uses ----
// highest bet = 0.2 H, lowest = highest / 20 (at least 10), the day's limit both ways = 5 highest bets (1 H).
const g = loadCore({ seed: 1 }), E = s => g.eval(s);
const sig = x => E(`econSig(${x})`), H = z => E(`econH(${z})`);
// The 14-day econ report (sim.mjs --report econ, EC2) puts a normal day's income at 6,655 foe-equivalents of the base
// curve: about 21 H (ECON.hourFoes = 312).
const DAY_H = 6655 / E('ECON.hourFoes');
const lim = z => { const hi = sig(0.2 * H(z)); return { H: H(z), lo: Math.max(10, sig(hi / 20)), hi, day: 5 * hi }; };
console.log('\nTable limits by highest zone (gold):');
console.log('  zone        H   lowest  highest   day limit');
let prev = 0;
for (const z of [11, 14, 15, 20, 25, 30, 35, 36, 50, 70, 71, 105, 140, 175]) {
  const L = lim(z);
  console.log(`  ${String(z).padStart(4)}  ${String(Math.round(L.H)).padStart(7)}  ${String(L.lo).padStart(7)}  ${String(L.hi).padStart(7)}  ${String(L.day).padStart(10)}${L.hi < prev ? '  FALLS' : ''}`);
  prev = L.hi;
}
for (let z = 1, last = 0; z <= 175; z++) { const v = lim(z).hi; if (v < last) console.log(`  highest bet falls at zone ${z}: ${last} -> ${v}`); last = v; }

// ---- a day at the table, in highest bets: bets are clamped to the room left before the loss stop, Double is off when
// it would pass it, and the table closes at +5 (the day's win limit) or when the room left is under the lowest bet ----
function day(strat, nHands, betFrac) {
  let net = 0; const cap = 5, lo = 1 / 20;
  for (let i = 0; i < nHands; i++) {
    const room = cap + net;
    if (room < lo || net >= cap) break;
    const bet = Math.min(betFrac, room);
    net += bet * hand(strat, room >= 2 * bet);
  }
  return net;
}
console.log(`\nA day at the table (${DAYS.toLocaleString('en-GB')} days each), net; the day limit is 1 H, about ${(100 / DAY_H).toFixed(1)}% of a normal day's income:`);
for (const [s, n, b, who] of [['basic', 60, 1, 'keen: the chart, highest bet, up to 60 hands'], ['mimic', 30, 1, 'casual: hits to 17, highest bet, 30 hands'], ['mimic', 30, 0.25, 'careful: hits to 17, a quarter of the highest bet, 30 hands'], ['nobust', 60, 1, 'timid: stands on 12+, highest bet, 60 hands']]) {
  let m = 0, win = 0, lose = 0, best = -9, worst = 9; const xs = [];
  for (let i = 0; i < DAYS; i++) { const r = day(s, n, b); m += r; xs.push(r); if (r >= 5) win++; if (r <= -5 + 1 / 20) lose++; best = Math.max(best, r); worst = Math.min(worst, r); }
  xs.sort((a, b) => a - b);
  const pct = p => (xs[Math.floor(p * (xs.length - 1))] * 0.2).toFixed(2);
  const mH = 0.2 * m / DAYS;
  console.log(`  ${who}\n    mean ${mH.toFixed(3)} H (${(100 * mH / DAY_H).toFixed(2)}% of a day's income)  p10 ${pct(0.1)} H  p50 ${pct(0.5)} H  p90 ${pct(0.9)} H  best ${(0.2 * best).toFixed(2)} H  worst ${(0.2 * worst).toFixed(2)} H  win limit ${(100 * win / DAYS).toFixed(1)}%  loss stop ${(100 * lose / DAYS).toFixed(1)}%`);
}
