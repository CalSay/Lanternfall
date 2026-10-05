#!/usr/bin/env node
// Game health metrics: three player personas play the real core on fixed seeds and the run is scored against a
// committed baseline (docs/design/health-baseline.json). Every balance, economy or pacing change can be measured
// before and after against the same numbers.
//
//   node tools/health.mjs                    run, print the report, write tools/.health/latest.json
//   node tools/health.mjs --compare          also compare with the baseline; exit 1 when a metric moves past its
//                                            tolerance in the bad direction (exit 2 if the run itself failed)
//   node tools/health.mjs --write-baseline   write the run as the new baseline (keeps tolerances already in the file)
//   --json PATH     where to write the full report      --only casual,active   run some personas
//   --jobs N        parallel sim processes (default 4)   --seed-offset N       shift every fixed seed (for noise checks)
//
// The personas are policies of tools/sim.mjs (it drives the real game core in a vm, turn fights on), run through its
// --health telemetry. Hero parity comes from running each persona once per starter (Wren, Tobin, Pip).
//   casual     three 5-minute visits a day (08, 13, 19h) for 3 in-game days; the game's own away gains run between
//              visits (gathering only; fights earn nothing while away)
//   active     one 60-minute session, plays turns well (parries and dodges most hits, casts abilities)
//   optimiser  10 hours of the same bot: always buys the best gain per gold, crafts the next class piece, builds the camp
// Event times are ACTIVE seconds (game ticks the player was there for), so away gaps do not count as play.
// The balance targets themselves are in docs/DECISIONS.md and docs/design/combat-turn-build.md; this tool only
// watches that the numbers a change moves stay inside the bands the last accepted baseline had.
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = path.join(ROOT, 'docs', 'design', 'health-baseline.json');
const argv = process.argv.slice(2);
const flag = n => argv.includes('--' + n);
const opt = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };

{ const known = ['compare', 'write-baseline', 'json', 'only', 'jobs', 'seed-offset', 'baseline-seeds'], bad = argv.filter(a => a.startsWith('--') && !known.includes(a.slice(2)));
  if (bad.length) { console.error('health: unknown option ' + bad.join(', ') + '; known: ' + known.map(k => '--' + k).join(' ')); process.exit(2); } }
if (flag('compare') && flag('write-baseline')) { console.error('health: --compare and --write-baseline do not mix; write the baseline, then compare'); process.exit(2); }
// sim.mjs class names for the three starters
const HEROES = [['wren', 'ranger'], ['tobin', 'warden'], ['pip', 'lanternmage']];
const SEED_OFFSET = Number(opt('seed-offset', 0));
const PERSONAS = {
  casual: { seed: 11, args: ['--days', '3', '--checkins', '8,13,19', '--session', '5', '--first', '5'], visitSec: 300 },
  active: { seed: 21, args: ['--policy', 'mixed', '--hours', '1', '--every', '600'] },
  optimiser: { seed: 31, args: ['--policy', 'mixed', '--hours', '10', '--every', '3600'] }
};
// Events that count as something the player feels. Not 'train' or 'soloEquip': those are the player spending,
// not being given anything.
const REWARD = new Set(['zoneClear', 'level', 'campBuilt', 'crafted', 'upgraded', 'trophy', 'scrollDrop', 'starFound', 'starLearned',
  'provingPassed', 'handsHire', 'deedTier', 'skillUp', 'unlock']);
const STALL_SEC = 600;   // no new zone for 10 active minutes is a stall point
const sum = o => Object.values(o).reduce((a, b) => a + b, 0);
const mean = l => l.reduce((a, b) => a + b, 0) / l.length;
const median = l => { const s = l.slice().sort((a, b) => a - b), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const r2 = x => Math.round(x * 100) / 100;

function simRun(persona, hero, cls, tmp, offset) {
  const out = path.join(tmp, `${persona}-${hero}-${offset}.json`);
  const p = PERSONAS[persona];
  const a = ['tools/sim.mjs', ...p.args, '--class', cls, '--active', '1', '--turns', '1', '--seed', String(p.seed + offset), '--health', out];
  return new Promise((res, rej) => execFile(process.execPath, a, { cwd: ROOT, maxBuffer: 1 << 28 }, (e, stdout, stderr) => {
    if (e) return rej(new Error(`${persona}/${hero}: sim failed: ${(stderr || e.message).split('\n').slice(0, 6).join(' | ')}`));
    try { res({ persona, hero, data: JSON.parse(fs.readFileSync(out, 'utf8')) }); } catch (x) { rej(new Error(`${persona}/${hero}: no telemetry (${x.message})`)); }
  }));
}
async function pool(jobs, n) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, jobs.length) }, async () => { while (i < jobs.length) { const k = i++; out[k] = await jobs[k](); } }));
  return out;
}

// ---- one run -> numbers ----
function analyse(persona, hero, d) {
  const act = d.activeSec, hours = act / 3600;
  const rewards = d.ev.filter(e => REWARD.has(e.k));
  const stamps = [0, ...rewards.map(e => e.a), act].sort((a, b) => a - b);
  let dry = 0; for (let i = 1; i < stamps.length; i++) dry = Math.max(dry, stamps[i] - stamps[i - 1]);
  // new zones: the run starts on zone 1; zoneClear { zone } fires on the first win of a zone
  const clears = d.ev.filter(e => e.k === 'zoneClear').map(e => ({ a: e.a, zone: Number(e.id) }));
  const gaps = []; let prev = 0, zone = 1;
  for (const c of clears) { gaps.push({ gap: c.a - prev, zone }); prev = c.a; zone = c.zone + 1; }
  gaps.push({ gap: act - prev, zone });
  const stalls = gaps.filter(g => g.gap >= STALL_SEC);
  const longest = gaps.reduce((m, g) => g.gap > m.gap ? g : m, { gap: 0, zone: 1 });
  const atHour = h => { const s = d.samples.filter(x => x.a <= h * 3600 + 1); return act >= h * 3600 - 1 && s.length ? s[s.length - 1].maxZone : null; };
  const earned = sum(d.econ.earned), spent = sum(d.econ.spent);
  const mats = Object.fromEntries(Object.entries(d.mats).map(([k, v]) => [k, v.reduce((a, b) => a + b, 0)]));
  const made = {}; for (const part of Object.values(d.harvest)) for (const [k, n] of Object.entries(part)) made[k] = (made[k] || 0) + n;
  const kept = k => (made[k] ? Math.min(1, (mats[k] || 0) / made[k]) : 0);
  const fam = Object.keys(made).filter(k => made[k] >= 50);   // ignore families too thin to judge
  const casts = sum(d.casts), top = (o) => { const v = Object.values(o), t = sum(o); return t ? Math.max(...v) / t : 0; };
  const tiers = Object.values(d.gear).filter(g => !['pick', 'axe', 'sickle'].includes(g.slot)).map(g => g.t);
  const unlocks = d.ev.filter(e => e.k === 'unlock' || e.k === 'campBuilt');
  let burst = 0; for (const u of unlocks) burst = Math.max(burst, unlocks.filter(v => v.a >= u.a && v.a < u.a + 600).length);
  const m = {
    activeMin: r2(act / 60), zoneEnd: d.end.maxZone, zoneAt1h: atHour(1), zoneAt10h: atHour(10), zonePerHour: r2(d.end.maxZone / Math.max(hours, 1 / 60)),
    levelEnd: d.end.L, firstGoalSec: clears.length ? Math.round(clears[0].a) : null, firstRewardSec: rewards.length ? Math.round(rewards[0].a) : null,
    longestDrySec: Math.round(dry), stallCount: stalls.length, longestStallSec: Math.round(longest.gap), longestStallZone: longest.zone,
    wipesPerHour: r2(d.wipes.length / Math.max(hours, 1 / 60)), killsPerHour: Math.round(d.kills / Math.max(hours, 1 / 60)),
    goldEarned: Math.round(earned), goldSpent: Math.round(spent), goldSpentShare: earned ? r2(spent / earned) : 0, goldBankedShare: earned ? r2(d.end.gold / earned) : 0,
    spendShares: Object.fromEntries(Object.entries(d.econ.spent).filter(([, v]) => v > 0).map(([k, v]) => [k, r2(v / (spent || 1))])),
    essMade: d.killEss, essHeldShare: d.killEss ? r2(Math.min(1, mats.ess / d.killEss)) : 0,
    matsHeldShare: fam.length ? r2(sum(Object.fromEntries(fam.map(k => [k, mats[k] || 0]))) / sum(Object.fromEntries(fam.map(k => [k, made[k]])))) : 0,
    matsWorstFamily: fam.length ? fam.reduce((w, k) => kept(k) > kept(w) ? k : w, fam[0]) : null, matsWorstHeldShare: fam.length ? r2(Math.max(...fam.map(kept))) : 0,
    deadFamilies: fam.filter(k => kept(k) >= 0.9).length, deadFamilyList: fam.filter(k => kept(k) >= 0.9),
    abilityCasts: casts, abilityTopShare: r2(top(d.casts)), abilitiesUsed: Object.keys(d.casts).length, abilityMix: d.casts,
    trainTopShare: r2(top(d.training)), training: d.training, starsSet: ((d.stars.set || {})[d.hero] || []).filter(Boolean).length,
    zoneByHour: Array.from({ length: Math.floor(hours) }, (_, i) => atHour(i + 1)),
    mechanicsByHour: Array.from({ length: Math.max(1, Math.ceil(hours)) }, (_, i) => unlocks.filter(e => e.a >= i * 3600 && e.a < (i + 1) * 3600).length),
    gearTierMean: tiers.length ? r2(mean(tiers)) : 0, mechanicsPerHour: r2(unlocks.length / Math.max(hours, 1 / 60)), mechanicsBurst10min: burst,
    parries: d.solo.parries, dodges: d.solo.dodges, counters: d.solo.counters, errors: d.errors
  };
  if (PERSONAS[persona].visitSec) {
    const n = Math.floor(act / PERSONAS[persona].visitSec), v = PERSONAS[persona].visitSec;
    let hit = 0; for (let i = 0; i < n; i++) if (rewards.some(e => e.a > i * v && e.a <= (i + 1) * v)) hit++;
    m.visits = n; m.visitsWithRewardShare = n ? r2(hit / n) : 0;
  }
  return m;
}

// ---- metric registry: how each aggregate is built, and which way is bad ----
// bad: 'up' = a rise is a regression, 'down' = a fall is, 'both' = pacing, any drift is. tol: allowed move,
// max(abs, rel * |baseline|). Sim runs are repeatable for a seed but chaotic: any code change that touches a random draw
// reshuffles them. So each band is at least 3 standard deviations of the metric over five seed offsets (--seed-offset 0..4,
// 2026-10-05), or a design band where that is wider. Widen a band only with a reason; a regression must clear the noise.
const METRICS = [
  // [persona, key, from-runs aggregate, bad, abs, rel, note]
  ['casual', 'firstGoalSec', 'mean', 'up', 10, 0.2, 'seconds of play to the first zone boss win'],
  ['casual', 'longestDrySec', 'mean', 'up', 140, 0.3, 'longest active stretch without a reward'],
  ['casual', 'visitsWithRewardShare', 'mean', 'down', 0.12, 0, 'share of 5-minute visits that gave something'],
  ['casual', 'zoneEnd', 'mean', 'both', 2, 0, 'zone after 3 days of 3 short visits'],
  ['casual', 'mechanicsPerHour', 'mean', 'both', 4, 0.2, 'new unlocks and camp builds per active hour'],
  ['active', 'firstGoalSec', 'mean', 'up', 18, 0, 'seconds to the first zone boss win'],
  ['active', 'firstRewardSec', 'mean', 'up', 10, 0.5, 'seconds to the first reward of any kind'],
  ['active', 'longestDrySec', 'mean', 'up', 130, 0.3, 'longest active stretch without a reward'],
  ['active', 'zoneEnd', 'mean', 'both', 1.8, 0, 'zone after one 60-minute session'],
  ['active', 'stallCount', 'mean', 'up', 1.1, 0, 'stalls (10 active minutes without a new zone)'],
  ['active', 'longestStallSec', 'mean', 'up', 550, 0.3, 'longest stretch without a new zone'],
  ['active', 'wipesPerHour', 'mean', 'up', 10, 0.35, 'times the hero fell, per hour'],
  ['active', 'goldSpentShare', 'mean', 'down', 0.16, 0, 'share of gold earned that was spent'],
  ['active', 'abilityTopShare', 'mean', 'up', 0.1, 0, 'dominance: the most-cast ability, share of casts'],
  ['active', 'mechanicsPerHour', 'mean', 'both', 6, 0.2, 'new unlocks and camp builds per active hour'],
  ['active', 'mechanicsBurst10min', 'mean', 'up', 2, 0, 'most unlocks and camp builds inside any 10 minutes'],
  ['active', 'heroParity', 'parity', 'up', 0.15, 0, 'widest gap of a starter from the median zone (share)'],
  ['optimiser', 'zoneEnd', 'mean', 'both', 2, 0, 'zone after 10 hours of best-value play'],
  ['optimiser', 'zoneAt1h', 'mean', 'both', 1.8, 0, 'zone after the first hour'],
  ['optimiser', 'zonePerHour', 'mean', 'both', 0.2, 0, 'zones gained per active hour'],
  ['optimiser', 'longestDrySec', 'mean', 'up', 900, 0.3, 'longest active stretch without a reward'],
  ['optimiser', 'stallCount', 'mean', 'up', 1.3, 0, 'stalls (10 active minutes without a new zone)'],
  ['optimiser', 'longestStallSec', 'mean', 'up', 5700, 0.3, 'longest stretch without a new zone'],
  ['optimiser', 'wipesPerHour', 'mean', 'up', 8, 0, 'times the hero fell, per hour'],
  ['optimiser', 'goldSpentShare', 'mean', 'down', 0.1, 0, 'share of gold earned that was spent (a sink gap if it falls)'],
  ['optimiser', 'essHeldShare', 'mean', 'up', 0.18, 0, 'essence made but still unspent at the end'],
  ['optimiser', 'deadFamilies', 'mean', 'up', 1, 0, 'dead stock: material families with 90% or more of what was gathered still unspent'],
  ['optimiser', 'abilityTopShare', 'mean', 'up', 0.05, 0, 'dominance: the most-cast ability, share of casts'],
  ['optimiser', 'trainTopShare', 'mean', 'up', 0.1, 0, 'dominance: the most-trained move, share of Training levels'],
  ['optimiser', 'gearTierMean', 'mean', 'both', 0.75, 0, 'average tier of worn class gear'],
  ['optimiser', 'mechanicsPerHour', 'mean', 'both', 2, 0.2, 'new unlocks and camp builds per active hour'],
  ['optimiser', 'mechanicsBurst10min', 'mean', 'up', 2, 0, 'most unlocks and camp builds inside any 10 minutes'],
  ['optimiser', 'heroParity', 'parity', 'up', 0.15, 0, 'widest gap of a starter from the median zone (share)']
];
const num = x => typeof x === 'number' && Number.isFinite(x);

function aggregate(runs) {
  const by = {};
  for (const r of runs) (by[r.persona] ||= {})[r.hero] = r.metrics;
  const out = {};
  for (const [persona, key, how, bad, abs, rel, note] of METRICS) {
    const hs = by[persona]; if (!hs) continue;
    let vals, value;
    if (how === 'parity') {
      vals = Object.fromEntries(Object.entries(hs).map(([h, m]) => [h, m.zoneEnd]));
      const med = median(Object.values(vals));
      value = r2(Math.max(...Object.values(vals).map(v => Math.abs(v - med) / Math.max(1, med))));
    } else {
      vals = Object.fromEntries(Object.entries(hs).map(([h, m]) => [h, m[key]]));
      const l = Object.values(vals).filter(num);
      if (!l.length) { out[`${persona}.${key}`] = { key: `${persona}.${key}`, how, value: null, bad, abs, rel, note, perHero: vals }; continue; }
      value = how === 'mean' ? r2(mean(l)) : how === 'max' ? Math.max(...l) : Math.min(...l);
    }
    out[`${persona}.${key}`] = { key: `${persona}.${key}`, how, value, bad, abs, rel, note, perHero: vals };
  }
  return out;
}

function printReport(runs, agg, base) {
  const f = x => x == null ? 'n/a' : typeof x === 'number' ? String(r2(x)) : String(x);
  console.log('Lanternfall health: casual (3 days of 3 short visits), active (60 min), optimiser (10 h); Wren, Tobin and Pip on fixed seeds, turn fights on');
  console.log('');
  console.log('metric'.padEnd(34) + 'value'.padStart(9) + '  per hero (wren / tobin / pip)'.padEnd(34) + (base ? 'baseline   verdict' : ''));
  for (const [k, a] of Object.entries(agg)) {
    const ph = HEROES.map(([h]) => f(a.perHero[h])).join(' / ');
    let tail = '';
    if (base) {
      const b = base.metrics[k], v = verdict(a, b);
      tail = (b ? f(b.value).padStart(8) : '     new') + '   ' + v.label;
    }
    console.log(k.padEnd(34) + f(a.value).padStart(9) + '  ' + ph.padEnd(32) + tail);
  }
  console.log('');
  for (const persona of Object.keys(PERSONAS)) {
    const rs = runs.filter(r => r.persona === persona);
    if (!rs.length) continue;
    const m = Object.fromEntries(rs.map(r => [r.hero, r.metrics]));
    console.log(`${persona}: stall points ` + HEROES.map(([h]) => m[h] ? `${h} ${m[h].stallCount} (longest ${Math.round(m[h].longestStallSec / 60)} min on zone ${m[h].longestStallZone})` : '').join(', '));
    console.log(`${persona}: gold earned/spent ` + HEROES.map(([h]) => m[h] ? `${h} ${m[h].goldEarned}/${m[h].goldSpent} ${JSON.stringify(m[h].spendShares)}` : '').join(' | '));
    console.log(`${persona}: dominant choices ` + HEROES.map(([h]) => m[h] ? `${h} casts ${JSON.stringify(m[h].abilityMix)}, training top ${m[h].trainTopShare}, stars set ${m[h].starsSet}, gear tier ${m[h].gearTierMean}` : '').join(' | '));
    console.log(`${persona}: material kept (most hoarded family, dead families) ` + HEROES.map(([h]) => m[h] ? `${h} ${m[h].matsWorstFamily || '-'} ${m[h].matsWorstHeldShare} [${m[h].deadFamilyList.join(' ') || 'none'}]` : '').join(', '));
    if (persona === 'optimiser') {
      console.log(`${persona}: zone by hour ` + HEROES.map(([h]) => m[h] ? `${h} ${m[h].zoneByHour.join('/')}` : '').join(' | '));
      console.log(`${persona}: new mechanics by hour ` + HEROES.map(([h]) => m[h] ? `${h} ${m[h].mechanicsByHour.join('/')}` : '').join(' | '));
    }
  }
}

// allowed move = max(abs, rel * |baseline|). The aggregate is held to it, and so is each starter on its own against its
// own baseline value, at twice the band (one hero's number is noisier than the mean of three), so one hero cannot slip.
// A current metric with no baseline entry fails: it has no accepted value, so nothing would watch it.
function verdict(cur, b) {
  if (!b) return { label: 'FAIL (not in the baseline; run --write-baseline)', fail: true };
  if (!num(cur.value) || !num(b.value)) return num(cur.value) === num(b.value) ? { label: 'ok', fail: false } : { label: 'FAIL (value missing)', fail: true };
  const bad = (b.bad || cur.bad), abs = b.abs ?? cur.abs, rel = b.rel ?? cur.rel;
  const off = (d, allow) => bad === 'up' ? d > allow : bad === 'down' ? d < -allow : Math.abs(d) > allow;
  const allow = Math.max(abs, rel * Math.abs(b.value)), d = cur.value - b.value;
  if (off(d, allow)) return { label: `FAIL (${d > 0 ? '+' : ''}${r2(d)}, allowed ${r2(allow)}${bad === 'both' ? ' either way' : bad === 'up' ? ' up' : ' down'})`, fail: true };
  if (!/\.heroParity$/.test(cur.key || '')) for (const [h, v] of Object.entries(cur.perHero || {})) {
    const bv = (b.perHero || {})[h];
    if (num(v) !== num(bv)) return { label: `FAIL (${h} value ${num(v) ? v : 'missing'} against baseline ${num(bv) ? bv : 'missing'})`, fail: true };
    if (!num(v)) continue;
    const a2 = 2 * Math.max(abs, rel * Math.abs(bv));
    if (off(v - bv, a2)) return { label: `FAIL (${h} ${v} against ${bv}, allowed ${r2(a2)})`, fail: true };
  }
  return { label: 'ok', fail: false };
}

// ---- main ----
const only = opt('only') ? opt('only').split(',') : Object.keys(PERSONAS);
for (const p of only) if (!PERSONAS[p]) { console.error('unknown persona ' + p + '; use ' + Object.keys(PERSONAS).join(', ')); process.exit(2); }
const t0 = Date.now(), tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lf-health-'));
async function runOnce(offset) {
  const jobs = only.flatMap(p => HEROES.map(([h, c]) => () => simRun(p, h, c, tmp, offset)));
  const rs = (await pool(jobs, Number(opt('jobs', 4)))).map(r => ({ persona: r.persona, hero: r.hero, metrics: analyse(r.persona, r.hero, r.data) }));
  if (rs.some(r => r.metrics.errors)) throw new Error('the game logged errors during a run: ' + rs.filter(r => r.metrics.errors).map(r => `${r.persona}/${r.hero}`).join(', '));
  return rs;
}
let runs;
try { runs = await runOnce(SEED_OFFSET); } catch (e) { console.error('health: ' + e.message); process.exit(2); }
process.on('exit', () => fs.rmSync(tmp, { recursive: true, force: true }));
const agg = aggregate(runs);
const base = flag('compare') && fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : null;
if (flag('compare') && !base) { console.error('health: no baseline at docs/design/health-baseline.json; run with --write-baseline first'); process.exit(2); }
printReport(runs, agg, base);

const report = { version: 1, personas: only, seedOffset: SEED_OFFSET, seconds: Math.round((Date.now() - t0) / 1000),
  metrics: Object.fromEntries(Object.entries(agg).map(([k, a]) => [k, { value: a.value, bad: a.bad, abs: a.abs, rel: a.rel, note: a.note, perHero: a.perHero }])),
  runs: runs.map(r => ({ persona: r.persona, hero: r.hero, ...r.metrics })) };
const outPath = path.resolve(ROOT, opt('json', 'tools/.health/latest.json'));
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
console.log(`\nwrote ${path.relative(ROOT, outPath)} (${report.seconds}s)`);

// The baseline is the mean of --baseline-seeds (default 5) seed offsets, so one unlucky seed is not the yardstick.
async function averaged() {
  const n = Number(opt('baseline-seeds', 5)), aggs = [agg];
  console.log(`\nbaseline: averaging ${n} seed offsets (${SEED_OFFSET}..${SEED_OFFSET + n - 1})`);
  for (let i = 1; i < n; i++) aggs.push(aggregate(await runOnce(SEED_OFFSET + i)));
  const out = {};
  for (const k of Object.keys(agg)) {
    const ph = {};
    for (const h of Object.keys(agg[k].perHero)) { const l = aggs.map(a => a[k].perHero[h]).filter(num); ph[h] = l.length ? r2(mean(l)) : null; }
    const l = Object.values(ph).filter(num);
    let value = agg[k].value;
    if (agg[k].how === 'parity') { const med = median(l); value = r2(Math.max(...l.map(v => Math.abs(v - med) / Math.max(1, med)))); }
    else if (l.length) value = r2(mean(l));
    out[k] = { ...agg[k], value, perHero: ph };
  }
  return out;
}
if (flag('write-baseline')) {
  const old = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : { metrics: {} };
  const metrics = { ...old.metrics };   // --only rewrites just the selected personas' entries
  const accepted = await averaged();
  for (const [k, a] of Object.entries(accepted)) {
    const o = old.metrics[k] || {};
    metrics[k] = { value: a.value, bad: o.bad || a.bad, abs: o.abs ?? a.abs, rel: o.rel ?? a.rel, note: a.note, perHero: a.perHero };
  }
  const baseline = { version: 1, about: 'Accepted health numbers. Regenerate with: node tools/health.mjs --write-baseline. node tools/health.mjs --compare exits 1 when a metric moves past max(abs, rel * |value|) in its bad direction (bad: up, down, both). See tools/health.mjs for the personas.',
    seeds: Object.fromEntries(Object.entries(PERSONAS).map(([p, v]) => [p, v.seed])), metrics };
  fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
  fs.writeFileSync(BASELINE, JSON.stringify(baseline, null, 2) + '\n');
  console.log('wrote ' + path.relative(ROOT, BASELINE));
}
if (base) {
  const bad = Object.entries(agg).filter(([k, a]) => verdict(a, base.metrics[k]).fail);
  const missing = Object.keys(base.metrics).filter(k => !(k in agg) && only.includes(k.split('.')[0]));
  if (bad.length || missing.length) {
    console.log(`\nHEALTH FAIL: ${bad.length} metric(s) past tolerance${missing.length ? `, ${missing.length} missing` : ''}`);
    for (const [k, a] of bad) console.log(`  ${k}: ${f2(a.value)} against ${base.metrics[k] ? f2(base.metrics[k].value) : 'no baseline'} (${a.note}); ${verdict(a, base.metrics[k]).label}`);
    process.exit(1);
  }
  console.log('\nhealth ok: every metric is inside its tolerance');
}
function f2(x) { return x == null ? 'n/a' : String(r2(x)); }
