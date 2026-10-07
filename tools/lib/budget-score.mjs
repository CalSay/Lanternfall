// The difficulty budget's scoring (docs/design/difficulty-budget.md): bands for each hero, the gated value of a row
// (a win rate, or a "behind" row's drop against its ref row), and the --compare verdicts. Shared by tools/budget.mjs
// (prints the bands) and tools/health.mjs (gates on them). No side effects.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './core.mjs';

export const BUDGET_FILE = path.join(ROOT, 'docs', 'design', 'difficulty-budget.json');
export const HEROES = ['wren', 'tobin', 'pip'];
export const GATED_PLAYERS = ['casual', 'good', 'none'];   // none (boss-tiers-pr5): only the kinds that carry a `none` band
export const BOSS_KINDS = ['firstBoss', 'firstChampion', 'earlyCaptain', 'captain', 'champion', 'elder'];
export const loadTargets = () => JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'));
const r2 = x => Math.round(x * 100) / 100;
const num = x => typeof x === 'number' && Number.isFinite(x);
const mean = l => l.reduce((a, b) => a + b, 0) / l.length;

// the band a hero is held to: the kind's band, and Tobin's casual band on a boss sits T.tobinBoss higher (capped at 1)
// ("Tobin is the safest hero", DECISIONS.md). A "behind" row's casual band is a drop against its ref row.
export function bandFor(T, kind, hero, pl) {
  const K = T.kinds[kind]; if (!K) throw new Error(`difficulty budget: no kind ${kind} in docs/design/difficulty-budget.json`);
  const b = K[pl === 'casual' && K.casualDrop ? 'casualDrop' : pl];
  if (pl === 'casual' && hero === 'tobin' && BOSS_KINDS.includes(kind)) return [Math.min(1, b[0] + T.tobinBoss), Math.min(1, b[1] + T.tobinBoss)];
  return b;
}
// a row's distance outside a band (0 inside; below is negative)
export const offBand = (v, b) => v < b[0] ? r2(v - b[0]) : v > b[1] ? r2(v - b[1]) : 0;

// The gated value of one row, hero and player from a run's rows ({ id -> row }): the win rate, or for a "behind" row's
// casual player the drop from its ref row (ref win - this win). null when it cannot be computed.
export function gatedValue(T, rows, id, hero, pl) {
  const r = rows[id]; if (!r || !r.perHero[hero]) return null;
  const v = r.perHero[hero][pl] && r.perHero[hero][pl].win;
  if (pl === 'casual' && T.kinds[r.kind] && T.kinds[r.kind].casualDrop) {
    const ref = rows[r.ref]; if (!ref) return null;
    return r2(ref.perHero[hero].casual.win - v);
  }
  return num(v) ? v : null;
}
// every gated cell of a run: [{ id, kind, hero, pl, value, band }] plus the three-hero mean as hero 'mean' (its band the
// mean of the heroes' bands)
export function cells(T, rep) {
  const rows = Object.fromEntries(rep.rows.map(r => [r.id, r])), out = [];
  for (const r of rep.rows) for (const pl of GATED_PLAYERS) {
    if (pl === 'none' && !(T.kinds[r.kind] && T.kinds[r.kind].none)) continue;
    const rp = !!T.kinds[r.kind].report;   // a report-only kind: printed against its band, never fails
    const hs = HEROES.map(h => ({ id: r.id, kind: r.kind, hero: h, pl, value: gatedValue(T, rows, r.id, h, pl), band: bandFor(T, r.kind, h, pl), ...(rp ? { report: true } : {}) }));
    out.push(...hs);
    const ok = hs.filter(c => num(c.value));
    if (pl !== 'none' && ok.length === HEROES.length) out.push({ id: r.id, kind: r.kind, hero: 'mean', pl, value: r2(mean(ok.map(c => c.value))),
      band: [r2(mean(hs.map(c => c.band[0]))), r2(mean(hs.map(c => c.band[1])))], ...(rp ? { report: true } : {}) });
  }
  return out;
}
// Gear must help (boss-tiers PR 2): a kept-up row's casual win rate may not sit below its ref row's (the same boss on the first-hour
// set) by more than the tolerance, for any hero. Returns the heroes that break it: [{ id, hero, value, ref, refValue }].
export function gearHelpFails(T, rep) {
  const rows = Object.fromEntries(rep.rows.map(r => [r.id, r])), out = [];
  for (const r of rep.rows) if (T.kinds[r.kind] && T.kinds[r.kind].gearHelps && rows[r.ref]) for (const h of HEROES) {
    const v = gatedValue(T, rows, r.id, h, 'casual'), w = gatedValue(T, rows, r.ref, h, 'casual');
    if (num(v) && num(w) && v < w - T.tolerance) out.push({ id: r.id, hero: h, value: v, ref: r.ref, refValue: w });
  }
  return out;
}
// the binomial noise of one run of a cell (fights a row, hero and player): sqrt(p(1-p)/n); a drop adds its ref row's
export function binomialSd(T, rows, id, hero, pl, fights) {
  const r = rows[id]; if (!r || !r.perHero[hero]) return 0;
  const v = p => p * (1 - p) / fights, w = r.perHero[hero][pl].win;
  if (pl === 'casual' && T.kinds[r.kind] && T.kinds[r.kind].casualDrop && rows[r.ref]) return Math.sqrt(v(w) + v(rows[r.ref].perHero[hero].casual.win));
  return Math.sqrt(v(w));
}
export const cellKey = c => `${c.id}|${c.hero}|${c.pl}`;
export function gapFor(T, c) {
  return (T.gaps || []).find(g => g.row === c.id && g.player === c.pl && (g.hero === c.hero || (g.hero === '*' && c.hero !== 'mean')));
}

// Report-only kinds ("report": true in the JSON) print against their band and never fail.
// The --compare verdict of one cell against the accepted baseline cell ({ value, sd }) (judge ruling 2026-10-06):
//   heroes: inside the band ok; a gap entry covers it while it stays on the gap's side no further out than limit + tol;
//     no gap: out of band by more than tol fails; a boss kind with casual wins under 0.05 (a wall) fails unless a gap
//     covers it; an expired gap fails, naming its owner.
//   mean: its distance from its band must not grow by more than max(meanTol, 2.5 x sd) against the baseline.
export function verdict(T, c, b, today) {
  const tol = c.hero === 'mean' ? Math.max(T.meanTol, 2.5 * ((b && b.sd) || 0)) : Math.max(T.tolerance, 2.5 * ((b && b.sd) || 0));
  if (c.report) { const o = num(c.value) ? offBand(c.value, c.band) : 0; return { label: o ? `report: out of band by ${r2(Math.abs(o))}` : 'report: in band', fail: false }; }
  if (!num(c.value)) return { label: 'FAIL (no value)', fail: true };
  const off = offBand(c.value, c.band);
  if (c.hero === 'mean') {
    if (!b || !num(b.value)) return { label: off ? 'out of band (no baseline)' : 'ok', fail: false };
    const was = Math.abs(offBand(b.value, c.band));
    return Math.abs(off) > was + tol ? { label: `FAIL (mean moved further from its band: ${r2(was)} -> ${r2(Math.abs(off))}, allowed +${r2(tol)})`, fail: true }
      : { label: off ? (Math.abs(off) < was ? 'out of band (closer)' : 'out of band') : 'ok', fail: false };
  }
  const g = gapFor(T, c);
  if (g && today && g.until && today > g.until) return { label: `FAIL (gap expired ${g.until}; owner ${g.owner})`, fail: true };
  if (!off) return { label: g && b && num(b.value) && !offBand(b.value, c.band) ? 'ok (gap closed in the baseline: remove its entry)' : 'ok', fail: false };
  const wall = c.pl === 'casual' && BOSS_KINDS.includes(c.kind) && c.value < 0.05;
  if (g) {
    const onSide = g.side === 'below' ? off < 0 : off > 0;
    if (!onSide) return Math.abs(off) > tol ? { label: `FAIL (crossed its band: now ${off > 0 ? 'above' : 'below'} by ${r2(Math.abs(off))})`, fail: true } : { label: 'ok (edge)', fail: false };
    const past = g.side === 'below' ? c.value < g.limit - tol : c.value > g.limit + tol;
    return past ? { label: `FAIL (gap grew past its limit ${g.limit} +- ${r2(tol)}; owner ${g.owner})`, fail: true } : { label: `gap (${g.owner})`, fail: false };
  }
  if (wall) return { label: `FAIL (a wall: ${r2(c.value)} casual wins)`, fail: true };
  return Math.abs(off) > tol ? { label: `FAIL (out of band by ${r2(Math.abs(off))}, allowed ${r2(tol)})`, fail: true } : { label: 'ok (edge)', fail: false };
}
