#!/usr/bin/env node
// C14: reproducible live/away audit. Runs the real core with a pinned wall clock and seed.
// node tools/offline-parity.mjs --json=/tmp/lanternfall-offline-parity.json
// node tools/offline-parity.mjs --refine   the station orders (refine-queues): Forge and Loom orders, no Hands, inputs that run out
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadCore, memoryStorage } from './lib/core.mjs';

export const AUDIT_START = Date.UTC(2026, 8, 28, 12);
export const AUDIT_SPANS = [1800, 7200, 14400, 28800, 86400];
const KEY = 'lanternfall.save.v5';
export function offlineGame(raw) {
  const g = loadCore({ seed: 1414, prelude: `Date.__t=${AUDIT_START};Date.now=()=>Date.__t`, storage: memoryStorage(raw ? { [KEY]: raw } : {}) });
  g.eval("almanac.force('none');globalThis.__auditUnits=0;on('harvest',e=>__auditUnits+=e.n)");
  return g;
}
export function offlineFixture(mode = 'gather') {
  const g = offlineGame();
  g.eval("hearthWarm();soloPick('wren');soloSetAuto(true);S.camp.b.store=8;");
  if (mode.startsWith('gather')) g.eval(`S.maxZone=12;S.camp.open=true;S.camp.b.hearth=2;S.camp.b.tavern=3;S.camp.b.tent=3;
    S.gold=1e8;for(const a of Object.values(S.mats))a.fill(1e5);S.craft.troph.fill(100);S.skills.mine.lv=20;S.skills.wood.lv=20;tick(1.2);
    S.hands.list.push({...JSON.parse(JSON.stringify(handsGet('tam'))),id:'trade-worker',n:'Trader',key:null,tr:[],job:null,pack:[]});
    S.hands.list.push({...JSON.parse(JSON.stringify(handsGet('tam'))),id:'nan-probe',n:'Nan Tarrow',key:'nan',tr:[],job:null,pack:[]});
    tavernHearRumour('rook');handsSend('tam','wood',1,{shifts:2});handsTradeSend('trade-worker',[['wood',1,1000]]);
    campBuild('bench');campBuild('forge');S.mats.ore.fill(0);setNode('ore',2);setActivity('gather');`);
  else if (mode === 'refine') g.eval(`S.maxZone=12;S.camp.open=true;S.camp.b.forge=2;S.camp.b.loom=1;S.camp.b.bench=1;
    for(const a of Object.values(S.mats))a.fill(0);S.mats.ore[0]=4000;S.mats.ore[1]=600;S.mats.coal[0]=1200;S.mats.fibre[0]=600;
    S.skills.mine.lv=20;refineAdd('ingot',2,30);refineAdd('ingot',1,'all');refineAdd('cloth',1,'all');setNode('crystal',1);setActivity('gather');`);
  else {
    if (mode === 'fight-fixed') g.eval('S.L=100;S.xp=0;gearDirty()');
    g.eval("setActivity('fight');spawn()");
  }
  if (mode === 'gather-mastered') g.eval('S.tools.m.pick=[20,0]');
  g.eval('save()');
  return g.storage.get(KEY);
}
export function offlineSnapshot(g) {
  // Copy snapshots: engine status/estimate objects and state maps are live references.
  return JSON.parse(g.eval(`JSON.stringify({gold:S.gold,kills:S.totalKills,level:S.L,xp:S.xp,heroUnits:__auditUnits,gathered:S.stats.gathered,
    mine:S.skills.mine,tools:S.tools.m,rest:S.rested.left,workerHours:S.hands.hrs,workerUnits:S.hands.got,
    worker:handsGet('tam'),trade:S.trade,builds:S.camp.builds,camp:S.camp.b,
    applicants:S.hands.board.apps.map(a=>({id:a.id,key:a.key,at:a.at})),
    hands:S.hands.list.map(h=>({id:h.id,n:h.n,role:h.job&&h.job.role,jobEnd:h.job&&h.job.end,hrs:h.hrs,got:h.got})),rook:S.tavernLeads.rookSecs,
    cap:(4+2*S.relic.glass+bonus('awayHours'))*3600,boost:mod('offline')*(1+gear().offline/100),
    hold:S.activity==='fight'?partyHoldEstimate(S.zone):null,
    refined:STOCK_FAMILIES.filter(f=>REFINE_RAW[f]).reduce((a,f)=>a+S.mats[f].reduce((x,y)=>x+y,0),0),
    middles:Object.fromEntries(REFINED_FAMILIES.map(f=>[f,S.mats[f].slice()])),coal:S.mats.coal[0],
    refine:JSON.parse(JSON.stringify(S.refine.st))})`));
}
export function offlineLiveUntil(g, from, until) {
  g.eval(`for(let i=${Math.round(from * 10)};i<${Math.round(until * 10)};i++){Date.__t=${AUDIT_START}+(i+1)*100;tick(.1)}
    handsCatchUp(Date.now());campCatchUp(Date.now());`);
}
export function offlineRun(raw, secs, maxCap = false) {
  const g = offlineGame(raw);
  if (maxCap) g.eval('S.relic.glass=10');
  const report = g.eval(`Date.__t=${AUDIT_START + secs * 1000};awayGains(${secs})`);
  return { state: offlineSnapshot(g), report, errors: g.errors };
}
export function offlineAudit(progress = () => {}, modes = ['gather', 'fight', 'fight-fixed']) {
  const result = { seed: 1414, start: AUDIT_START, step: .1, rows: [] };
  for (const mode of modes) {
    const raw = offlineFixture(mode), live = offlineGame(raw); live.eval('spawn()');
    const initial = offlineSnapshot(live), snapshots = new Map([[0, initial]]); let from = 0;
    for (const secs of AUDIT_SPANS) {
      offlineLiveUntil(live, from, secs); from = secs;
      const liveState = offlineSnapshot(live); snapshots.set(secs, liveState);
      const off = offlineRun(raw, secs);
      const matchedSecs = Math.min(secs, off.report.t), liveHeroMatched = snapshots.get(matchedSecs) || null;
      result.rows.push({ mode, secs, matchedSecs, initial, live: liveState, liveHeroMatched,
        offline: off.state, report: off.report, errors: [...live.errors, ...off.errors] });
      progress(mode, secs);
    }
    const off = offlineRun(raw, 86400, true);
    const liveState = offlineSnapshot(live), matchedSecs = Math.min(86400, off.report.t);
    result.rows.push({ mode, secs: 86400, maximumCap: true, matchedSecs, initial, live: liveState,
      liveHeroMatched: snapshots.get(matchedSecs) || (matchedSecs === 86400 ? liveState : null),
      offline: off.state, report: off.report, errors: [...live.errors, ...off.errors] });
  }
  return result;
}
const delta = (state, initial, key) => (state[key] || 0) - (initial[key] || 0);
const num = n => Number.isFinite(n) ? n.toFixed(2) : 'n/a';
export function offlineAuditTable(audit) {
  const rows = ['| Mode | Wall hours | Credited hero hours | Source | Live | Away | Hero away delta¹ |',
    '|---|---:|---:|---|---:|---:|---:|'];
  const add = (r, source, live, away, heroDelta = '—') => rows.push(
    `| ${r.mode}${r.maximumCap ? ' (max cap)' : ''} | ${r.secs / 3600} | ${r.report.t / 3600} | ${source} | ${live} | ${away} | ${heroDelta} |`);
  for (const r of audit.rows) {
    const a = r.initial, l = r.live, m = r.liveHeroMatched, o = r.offline;
    if (r.mode.startsWith('gather')) {
      const liveUnits = m ? delta(m, a, 'heroUnits') : null, awayUnits = delta(o, a, 'heroUnits');
      const normalized = awayUnits / Math.max(o.boost, 0.000001);
      const pct = liveUnits ? `${num((normalized / liveUnits - 1) * 100)}% after ÷${num(o.boost)}` : 'n/a';
      add(r, 'Hero harvest units', m ? num(liveUnits) : 'missing matched snapshot', num(awayUnits), pct);
    } else {
      const liveGold = m ? delta(m, a, 'gold') : null, awayGold = delta(o, a, 'gold');
      const normalized = awayGold / Math.max(o.boost, 0.000001);
      const pct = liveGold ? `${num((normalized / liveGold - 1) * 100)}% after ÷${num(o.boost)}` : 'n/a';
      add(r, `${r.mode === 'fight-fixed' ? 'Fight gold (initial L=100)' : 'Fight gold'}`, m ? num(liveGold) : 'missing matched snapshot', num(awayGold), pct);
    }
    const handLine = (s, base) => {
      const hours = num(s.workerHours - base.workerHours), units = num(s.workerUnits - base.workerUnits);
      const jobs = (s.hands || []).filter(h => h.role === 'gather').length;
      return `${hours}h, ${units} units; ${jobs} gathering jobs, ${s.builds.length} build queues`;
    };
    add(r, 'Workers / queues', handLine(l, a), handLine(o, a));
    // refine-queues: station orders, live (at the credited away time) against away; the absence runs them up to the away limit
    const refinedL = m ? delta(m, a, 'refined') : null, refinedA = delta(o, a, 'refined');
    add(r, 'Refined units', m ? num(refinedL) : 'missing matched snapshot', num(refinedA), refinedL ? `${num((refinedA / refinedL - 1) * 100)}%` : '—');
    add(r, 'Trade', `${l.trade.trips - a.trade.trips} trips, ${num(l.trade.gold - a.trade.gold)} gold`,
      `${o.trade.trips - a.trade.trips} trips, ${num(o.trade.gold - a.trade.gold)} gold`);
    const camp = s => `Bench ${s.camp.bench}, Forge ${s.camp.forge}; ${s.builds.length} pending`;
    add(r, 'Camp', camp(l), camp(o));
    const tavern = (s, base) => {
      const added = s.applicants.length - base.applicants.length;
      return `${added} arrivals, Rook ${num((s.rook - base.rook) / 60)}m`;
    };
    add(r, 'Tavern', tavern(l, a), tavern(o, a));
    const restLine = s => {
      const change = (s.rest - a.rest) / 60;
      return `${num(Math.abs(change))}m ${change < 0 ? 'spent' : 'banked'}, ${num(s.rest / 60)}m left`;
    };
    add(r, 'Well Rested', restLine(l), restLine(o));
  }
  rows.push('', '¹ Hero comparison uses live progress at the credited away duration; normalized away values divide the raw away gain by the recorded offline boost. Raw values remain in JSON. Other schedules use the full wall-clock span. Fight-fixed starts at level 100 but can still level; all combat rates are provisional pending C20.');
  return rows.join('\n');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const audit = offlineAudit((mode, secs) => console.error(`${mode}: ${secs / 3600} hours`), process.argv.includes('--mastered') ? ['gather-mastered'] : process.argv.includes('--refine') ? ['refine'] : undefined);
  const arg = process.argv.find(a => a.startsWith('--json='));
  if (arg) fs.writeFileSync(arg.slice(7), JSON.stringify(audit, null, 2) + '\n');
  console.log(offlineAuditTable(audit));
  if (audit.rows.some(r => r.errors.length)) { console.error('Core handler errors occurred'); process.exitCode = 1; }
}
