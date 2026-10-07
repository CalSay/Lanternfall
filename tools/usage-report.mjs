#!/usr/bin/env node
// Usage report: what the Claude sessions behind Lanternfall cost, per thread class, per model and per merged change.
// Read-only. It never changes a routine, cap, model setting or plan.json.
//
// Session usage lives in session metadata (get_session / list_sessions, external_metadata.usage), which only an MCP tool can
// read. Node cannot call MCP, so the run is two steps:
//   1. A Claude session calls get_session for every project session. Its tool results are kept verbatim in its transcript
//      (.jsonl, including subagent transcripts). `--collect` reads those transcripts and writes a snapshot, so no number is
//      ever copied by hand:
//        node tools/usage-report.mjs --collect <transcript.jsonl ...> --snapshot <out.json>
//   2. The report reads the snapshot, merged PRs (gh api, falling back to git) and git, and writes usage-<date>.md:
//        node tools/usage-report.mjs --since 2026-10-05 [--snapshot <file>] [--baseline <older snapshot>] [--out <dir>]
// With --baseline, each session counts only its growth since that snapshot, so a weekly run counts one week. Without it, a
// session's whole lifetime is counted and the report says so.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INTEGRATION = 'claude/elegant-johnson-m6k00u';
const REPO = 'CalSay/Lanternfall';
const SHARED_REPORTS = '/mnt/project-files/autopilot/reports';

function args(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { o._.push(a); continue; }
    const k = a.slice(2), next = argv[i + 1];
    if (k === 'collect') { o.collect = []; while (argv[i + 1] && !argv[i + 1].startsWith('--')) o.collect.push(argv[++i]); continue; }
    if (next === undefined || next.startsWith('--')) o[k] = true; else { o[k] = next; i++; }
  }
  return o;
}

const today = () => new Date().toISOString().slice(0, 10);
const defaultDir = () => (fs.existsSync(SHARED_REPORTS) ? SHARED_REPORTS : path.join(ROOT, 'autopilot', 'reports'));

// ---------- step 1: collect session records from transcripts ----------

function toolResultTexts(line) {
  let d;
  try { d = JSON.parse(line); } catch (e) { return []; }
  const c = d && d.message && d.message.content;
  if (d.type !== 'user' || !Array.isArray(c)) return [];
  const out = [];
  for (const x of c) {
    if (!x || x.type !== 'tool_result') continue;
    const t = typeof x.content === 'string' ? x.content : (x.content || []).map(y => (y && y.text) || '').join('');
    out.push({ text: t, at: d.timestamp || null });
  }
  return out;
}

// A get_session result is {"ccr": {id, ...}}; a list_sessions page is {"ccr": {"data": [...]}}. Results may be wrapped in an
// untrusted-data envelope, so the JSON is cut out from the first {"ccr" to the last }.
function sessionsIn(text) {
  const i = text.indexOf('{"ccr"');
  if (i < 0) return [];
  const j = text.lastIndexOf('}');
  let o;
  try { o = JSON.parse(text.slice(i, j + 1)); } catch (e) { return []; }
  const cc = o.ccr || {};
  const arr = Array.isArray(cc.data) ? cc.data : [cc];
  return arr.filter(s => s && typeof s.id === 'string' && s.id.startsWith('session_'));
}

function slim(s, capturedAt) {
  const em = s.external_metadata || {}, ctx = s.session_context || {}, u = em.usage || null;
  const branches = new Set();
  for (const o of ctx.outcomes || []) for (const b of (o.git_repository && o.git_repository.git_info && o.git_repository.git_info.branches) || []) branches.add(b);
  for (const b of Object.values(em.current_branches || {})) branches.add(b);
  return {
    id: s.id, title: s.title || '', origin: s.origin || '', tags: s.tags || [],
    parent: s.parent_session_id || null, created_at: s.created_at || null, updated_at: s.updated_at || null,
    status_bucket: s.status_bucket || '', configured_model: s.configured_model || '', model: ctx.model || em.model || '',
    last_served_model: em.last_served_model || '', effort: ctx.effort_level || em.effort_level || '',
    branches: [...branches],
    hearth: (s.tags || []).includes('config:hearth') || s.origin === 'claude-in-hearth',
    repos: [...(ctx.sources || []), ...(ctx.outcomes || [])].map(x => (x.git_repository && (x.git_repository.url || (x.git_repository.git_info && x.git_repository.git_info.repo))) || '').filter(Boolean),
    usage: u && {
      input_tokens: u.input_tokens || 0, output_tokens: u.output_tokens || 0,
      cache_read_tokens: u.cache_read_tokens || 0, cache_write_tokens: u.cache_write_tokens || 0,
      cost_usd: typeof u.cost_usd === 'number' ? u.cost_usd : null,
    },
    captured_at: capturedAt,
  };
}

// list_thread_sessions rows pair a thread (cmsg_) with its session (cse_X is session_X). PR bodies link the thread, which is
// how a PR finds its session when the thread pushed to a branch other than the one in its metadata.
function threadsIn(text) {
  const out = [];
  for (const m of text.matchAll(/\{[^{}]*"session_id":"cse_(\w+)"[^{}]*"thread_id":"(cmsg_\w+)"[^{}]*\}/g)) out.push(['session_' + m[1], m[2]]);
  return out;
}

function collect(files, outFile) {
  const byId = new Map(), threadOf = new Map();
  for (const f of files) {
    for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
      if (!line.includes('ccr') && !line.includes('thread_id')) continue;
      for (const r of toolResultTexts(line)) for (const [id, th] of threadsIn(r.text)) threadOf.set(id, th);
      for (const r of toolResultTexts(line)) for (const s of sessionsIn(r.text)) {
        const rec = slim(s, r.at), prev = byId.get(s.id);
        // keep the freshest reading; a full get_session beats a list row with no usage
        const newer = (rec.updated_at || '') > (prev && prev.updated_at || '');
        if (!prev || (rec.usage && (!prev.usage || newer)) || (!prev.usage && newer)) byId.set(s.id, rec);
      }
    }
  }
  for (const s of byId.values()) s.thread = threadOf.get(s.id) || null;
  // Only Lanternfall's sessions are kept: project threads, or sessions on the Lanternfall repo. Cal's other work stays out.
  for (const [id, s] of byId) if (!s.hearth && !s.repos.some(r => /lanternfall/i.test(r))) byId.delete(id);
  const snap = { collected_at: new Date().toISOString(), sources: files.map(f => path.basename(f)), sessions: [...byId.values()] };
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(snap, null, 1) + '\n');
  const withUsage = snap.sessions.filter(s => s.usage).length;
  console.log(`collected ${snap.sessions.length} sessions (${withUsage} with usage) -> ${outFile}`);
}

// ---------- step 2: merged PRs ----------

function sh(cmd, a, opts) { return execFileSync(cmd, a, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20, ...opts }); }

function mergedPrs(since) {
  // PR number -> head branch from GitHub when gh works; the git log alone loses the branch of squash merges.
  const prs = new Map();
  let source = 'git';
  try {
    for (let page = 1; page <= 10; page++) {
      const rows = JSON.parse(sh('gh', ['api', `repos/${REPO}/pulls?state=closed&base=${encodeURIComponent(INTEGRATION)}&per_page=100&page=${page}&sort=updated&direction=desc`], { timeout: 60000 }));
      for (const p of rows) if (p.merged_at && p.merged_at >= since) prs.set(p.number, { number: p.number, title: p.title, branch: p.head && p.head.ref, merged_at: p.merged_at, thread: ((p.body || '').match(/thread=(cmsg_\w+)/) || [])[1] || null });
      source = 'gh';
      if (rows.length < 100 || rows.every(p => (p.updated_at || '') < since)) break;
    }
  } catch (e) { /* no gh or no network: git only */ }
  // Files and any PR gh missed come from the integration branch's first-parent history.
  let log = '';
  for (const ref of [`origin/${INTEGRATION}`, INTEGRATION]) { try { log = sh('git', ['log', '--first-parent', `--since=${since}`, '--format=%H%x09%P%x09%cI%x09%s', ref]); break; } catch (e) {} }
  for (const line of log.split('\n').filter(Boolean)) {
    const [sha, parents, at, subject] = line.split('\t');
    const m = subject.match(/^Merge pull request #(\d+)(?: from \S+?\/(\S+))?/) || subject.match(/\(#(\d+)\)\s*$/);
    if (!m) continue;
    const n = Number(m[1]);
    const p = prs.get(n) || { number: n, title: subject, branch: m[2] || null, merged_at: at };
    if (!prs.has(n) && source === 'gh' && at < since) continue;
    const first = parents.split(' ')[0];
    try { p.files = sh('git', ['diff', '--name-only', first, sha]).split('\n').filter(Boolean); } catch (e) { p.files = null; }
    p.sha = sha;
    prs.set(n, p);
  }
  for (const p of prs.values()) p.player_facing = p.files ? p.files.some(f => f.startsWith('src/')) : null;
  return { source, list: [...prs.values()].sort((a, b) => a.number - b.number) };
}

// ---------- classification ----------

const CLASSES = ['build', 'foreman', 'coordinator', 'routine', 'judge', 'research', 'planning', 'outside'];
const CLASS_NAME = {
  build: 'Build threads (opened a PR)', foreman: 'Foreman (incl. its tick, digest, deploy routines)',
  coordinator: 'Coordinator (incl. sweeps, morning report, release-check routines)', routine: 'Routine-only threads (old tick sessions)', judge: 'Judges, reviews, red teams, testers',
  research: 'Research', planning: 'Planning, specs and other threads', outside: 'Not in the project (Cal\'s own sessions)',
};

function classify(s, openedPr) {
  const t = s.title.toLowerCase();
  if (!s.tags.includes('config:hearth') && s.origin !== 'claude-in-hearth') return 'outside';
  if (s.tags.includes('config:hearth-channel-session') || s.tags.includes('hearth-overview') || /^project coordinator/.test(t)) return 'coordinator';
  if (/foreman/.test(t)) return 'foreman';
  if (openedPr.has(s.id)) return 'build';
  if (/\btick\b|hourly check|round-the-clock|routine/.test(t)) return 'routine';
  if (/judge|\breview|red team|audit|canary|tester|panel|playtest|\beyes\b/.test(t)) return 'judge';
  if (/research|scan|catalogue|ideas|compared|better.ways|complaints|\?$|^why |approach|set us apart/.test(t)) return 'research';
  return 'planning';
}

// ---------- report ----------

const ZERO = () => ({ sessions: 0, measured: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0, noCost: 0 });
function add(acc, s) {
  acc.sessions++;
  const u = s.delta;
  if (!u) return;
  acc.measured++;
  acc.input += u.input_tokens; acc.output += u.output_tokens; acc.cacheRead += u.cache_read_tokens; acc.cacheWrite += u.cache_write_tokens;
  if (u.cost_usd == null) acc.noCost++; else acc.cost += u.cost_usd;
}
const fmtN = n => (n >= 1e9 ? (n / 1e9).toFixed(2) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(0) + 'k' : String(n));
const usd = n => '$' + (n >= 100 ? n.toFixed(0) : n.toFixed(2));
const modelName = m => (m || 'unknown').replace(/\[1m\]$/, '').replace(/^claude-/, '');

function delta(s, base) {
  if (!s.usage) return null;
  const b = base && base.usage;
  if (!b) return { ...s.usage };
  const d = {};
  for (const k of ['input_tokens', 'output_tokens', 'cache_read_tokens', 'cache_write_tokens']) d[k] = Math.max(0, (s.usage[k] || 0) - (b[k] || 0));
  d.cost_usd = s.usage.cost_usd == null ? null : Math.max(0, s.usage.cost_usd - (b.cost_usd || 0));
  if (b.cost_usd == null) d.baseNoCost = true;
  return d;
}

function report(o) {
  const since = typeof o.since === 'string' ? o.since : null;
  if (!since || !/^\d{4}-\d{2}-\d{2}$/.test(since)) { console.error('usage: --since YYYY-MM-DD required'); process.exit(2); }
  const date = typeof o.date === 'string' ? o.date : today();
  const dir = typeof o.out === 'string' ? o.out : defaultDir();
  const snapFile = typeof o.snapshot === 'string' ? o.snapshot : path.join(dir, `usage-sessions-${date}.json`);
  if (!fs.existsSync(snapFile)) { console.error(`no snapshot at ${snapFile}; run --collect first (see the header of this file)`); process.exit(2); }
  const snap = JSON.parse(fs.readFileSync(snapFile, 'utf8'));
  const baseSnap = typeof o.baseline === 'string' ? JSON.parse(fs.readFileSync(o.baseline, 'utf8')) : null;
  const baseById = new Map(((baseSnap && baseSnap.sessions) || []).map(s => [s.id, s]));

  const prs = mergedPrs(since);
  // Every PR (any state, any date) marks the session that opened it as a build thread; gh gives open ones too.
  let allPrs = prs.list;
  try {
    const rows = [];
    for (let page = 1; page <= 10; page++) {
      const r = JSON.parse(sh('gh', ['api', `repos/${REPO}/pulls?state=all&per_page=100&page=${page}`], { timeout: 60000 }));
      rows.push(...r);
      if (r.length < 100) break;
    }
    allPrs = allPrs.concat(rows.map(p => ({ number: p.number, branch: p.head && p.head.ref, thread: ((p.body || '').match(/thread=(cmsg_\w+)/) || [])[1] || null })));
  } catch (e) {}

  const sinceIso = since + 'T00:00:00Z';
  const inWindow = snap.sessions.filter(s => (s.updated_at || '') >= sinceIso);
  const inProject = inWindow.filter(s => s.tags.includes('config:hearth') || s.origin === 'claude-in-hearth');

  // A PR's session: the thread its body links (the attribution line), else the session whose branch is the PR's head branch,
  // else one whose branch is the head branch minus a random suffix (claude/ap-x vs claude/ap-x-wjrm5v).
  const byThread = new Map(inProject.filter(s => s.thread).map(s => [s.thread, s]));
  const sessByBranch = new Map();
  for (const s of inProject) for (const b of s.branches) { if (!sessByBranch.has(b)) sessByBranch.set(b, []); sessByBranch.get(b).push(s); }
  const sessionsFor = p => {
    if (p.thread && byThread.has(p.thread)) return [byThread.get(p.thread)];
    if (!p.branch) return [];
    if (sessByBranch.has(p.branch)) return sessByBranch.get(p.branch);
    const stem = p.branch.replace(/-(?=[a-z0-9]*\d)[a-z0-9]{6}$/, '');
    return (stem !== p.branch && sessByBranch.get(stem)) || [];
  };
  const openedPr = new Set();
  for (const p of allPrs) for (const s of sessionsFor(p)) openedPr.add(s.id);

  for (const s of inWindow) { s.cls = classify(s, openedPr); s.delta = delta(s, baseById.get(s.id)); s.before = !baseSnap && (s.created_at || '') < sinceIso; }
  const project = inWindow.filter(s => s.cls !== 'outside');

  const byClass = new Map(CLASSES.map(c => [c, ZERO()]));
  for (const s of inWindow) add(byClass.get(s.cls), s);
  const byModel = new Map();
  for (const s of project) { const m = modelName(s.last_served_model || s.model); if (!byModel.has(m)) byModel.set(m, ZERO()); add(byModel.get(m), s); }
  const total = ZERO();
  for (const s of project) add(total, s);

  // A session that merged several PRs (a long thread) has its cost split evenly across them, so the column adds up.
  const prsPerSession = new Map();
  for (const p of prs.list) for (const s of sessionsFor(p)) prsPerSession.set(s.id, (prsPerSession.get(s.id) || 0) + 1);
  const prRows = prs.list.map(p => {
    const ss = sessionsFor(p);
    const cost = ss.reduce((t, s) => t + ((s.delta && s.delta.cost_usd) || 0) / prsPerSession.get(s.id), 0);
    return { p, ss, cost, shared: ss.some(s => prsPerSession.get(s.id) > 1) };
  });
  const playerPrs = prRows.filter(r => r.p.player_facing);
  const buildCost = byClass.get('build').cost;
  const unmatched = prRows.filter(r => !r.ss.length).length;
  const noUsage = project.filter(s => !s.usage);
  const lifetimeBefore = project.filter(s => s.before);

  const L = [];
  const p = s => L.push(s);
  p(`# Usage report ${date}`);
  p('');
  p(`Window: sessions active since ${since} (snapshot collected ${snap.collected_at}). Generated by \`node tools/usage-report.mjs\`.`);
  p('');
  p('## Method: what was and was not counted');
  p('');
  p('- **Source.** Each Claude Code session\'s own usage counter (`external_metadata.usage` from get_session): input, output, cache-read and cache-write tokens, and `cost_usd`. The numbers were read by tool calls and copied by script, not by hand.');
  p('- **cost_usd is notional.** It is what the tokens would cost at API list prices. Cal pays a subscription, so it is not a bill. It is the right number for comparing threads and models. Cal\'s `/usage` reading is the real share of the plan; add it beside this report.');
  p(baseSnap
    ? `- **Window.** Each session counts only its growth since the baseline snapshot (${baseSnap.collected_at}).`
    : `- **Window.** No baseline snapshot yet, so each session counts its whole lifetime. ${lifetimeBefore.length} session(s) started before ${since} and include earlier usage. From next week, pass last week's snapshot as --baseline to count one week only.`);
  p('- **Routines are not separable.** Every routine fires into an existing session (the Foreman\'s tick, digest and deploy; the coordinator\'s morning report, sweeps and release check; the better-ways thread\'s weekly run). Their cost is inside that session\'s row, not a row of its own.');
  p('- **Subagents.** Workers started with the Agent tool run inside their thread\'s session. Whether the session counter includes their tokens is not documented and was not verified, so treat thread totals as a floor.');
  p(`- **Not counted.** Codex (OpenAI side, no usage data here); GitHub Actions minutes; Netlify. Sessions with no usage counter yet: ${noUsage.length}${noUsage.length ? ' (' + noUsage.map(s => s.title).join('; ') + ')' : ''}. Only sessions whose metadata was collected are counted; the collector fetches every project thread plus each thread's parent (the coordinator sessions that started them).`);
  p(`- **Classes** come from session tags and titles; a thread is "build" when it opened a PR (the PR body links its thread, else its branch is the PR's head branch). Every session and its class is listed at the end, so a wrong class is easy to spot.`);
  p(`- **Merged changes** are PRs merged into ${INTEGRATION} since ${since} (source: ${prs.source === 'gh' ? 'GitHub API plus git' : 'git only'}). "Player-facing" means the PR changed a file under src/. ${unmatched} merged PR(s) have no session on their branch (other branch names, Codex, or older sessions).`);
  p('');
  p('## Headline');
  p('');
  p(`- Project sessions in the window: ${project.length} (${total.measured} with a usage counter). Notional cost ${usd(total.cost)}; output ${fmtN(total.output)} tokens; cache reads ${fmtN(total.cacheRead)}.`);
  p(`- Merged PRs: ${prs.list.length}, of which player-facing: ${playerPrs.length}.`);
  if (playerPrs.length) {
    p(`- Whole project cost per merged player-facing PR: ${usd(total.cost / playerPrs.length)}. Build-thread cost alone, over player-facing PRs: ${usd(buildCost / playerPrs.length)} (this includes build threads whose PRs did not merge in the window).`);
  }
  const overhead = total.cost - buildCost;
  if (total.cost > 0) p(`- Share not spent in build threads (Foreman, coordinator, judges, research, planning): ${Math.round((overhead / total.cost) * 100)}%.`);
  p('');
  p('## By thread class');
  p('');
  p('| Class | Sessions | With usage | Output tokens | Cache reads | Cache writes | Notional cost | Share |');
  p('|---|---:|---:|---:|---:|---:|---:|---:|');
  for (const c of CLASSES) {
    const a = byClass.get(c);
    if (!a.sessions) continue;
    const share = c === 'outside' || !total.cost ? '' : Math.round((a.cost / total.cost) * 100) + '%';
    p(`| ${CLASS_NAME[c]} | ${a.sessions} | ${a.measured} | ${fmtN(a.output)} | ${fmtN(a.cacheRead)} | ${fmtN(a.cacheWrite)} | ${usd(a.cost)} | ${share} |`);
  }
  p(`| **Project total** (excl. outside) | ${total.sessions} | ${total.measured} | ${fmtN(total.output)} | ${fmtN(total.cacheRead)} | ${fmtN(total.cacheWrite)} | ${usd(total.cost)} | 100% |`);
  p('');
  p('## By model (the model that served the latest turn)');
  p('');
  p('A session that switched model mid-way is counted under its latest one; the counter does not split usage by model.');
  p('');
  p('| Model | Sessions | Output tokens | Notional cost | Cost per session |');
  p('|---|---:|---:|---:|---:|');
  for (const [m, a] of [...byModel].sort((x, y) => y[1].cost - x[1].cost)) p(`| ${m} | ${a.sessions} | ${fmtN(a.output)} | ${usd(a.cost)} | ${a.measured ? usd(a.cost / a.measured) : '-'} |`);
  p('');
  p('## Build threads by model');
  p('');
  p('The comparison the model-routing decision needs: what a build thread costs, and what one merged PR costs, on each model. It is not a fair trial: Opus got the harder cards (specs, saves, economy), so part of its higher cost is the work, not the model.');
  p('');
  p('| Model | Build sessions | Merged PRs from them | Player-facing | Notional cost | Per session | Per merged PR |');
  p('|---|---:|---:|---:|---:|---:|---:|');
  const buildByModel = new Map();
  for (const s of project.filter(x => x.cls === 'build')) {
    const m = modelName(s.last_served_model || s.model);
    if (!buildByModel.has(m)) buildByModel.set(m, { acc: ZERO(), prs: new Set() });
    add(buildByModel.get(m).acc, s);
  }
  for (const r of prRows) for (const s of r.ss) if (s.cls === 'build') buildByModel.get(modelName(s.last_served_model || s.model)).prs.add(r.p);
  for (const [m, b] of [...buildByModel].sort((x, y) => y[1].acc.cost - x[1].acc.cost)) {
    const n = b.prs.size, pf = [...b.prs].filter(x => x.player_facing).length;
    p(`| ${m} | ${b.acc.sessions} | ${n} | ${pf} | ${usd(b.acc.cost)} | ${b.acc.measured ? usd(b.acc.cost / b.acc.measured) : '-'} | ${n ? usd(b.acc.cost / n) : '-'} |`);
  }
  p('');
  p('## Per merged PR');
  p('');
  p('Cost of the session that opened the PR (the thread its body links, else the session on its head branch). When one session merged several PRs, its cost is split evenly across them (marked "shared"). Player-facing "?" means the PR\'s commit was not found on the integration branch\'s first-parent history.');
  p('');
  p('| PR | Player-facing | Sessions | Notional cost | Title |');
  p('|---|---|---:|---:|---|');
  for (const r of prRows.sort((a, b) => b.cost - a.cost)) {
    p(`| #${r.p.number} | ${r.p.player_facing == null ? '?' : r.p.player_facing ? 'yes' : 'no'} | ${r.ss.length} | ${r.ss.length ? usd(r.cost) + (r.shared ? ' (shared)' : '') : 'no session'} | ${(r.p.title || '').replace(/\|/g, '/').slice(0, 80)} |`);
  }
  p('');
  p('## Every session counted');
  p('');
  p('| Session | Class | Model | Effort | Output | Notional cost | Note |');
  p('|---|---|---|---|---:|---:|---|');
  for (const s of [...inWindow].sort((a, b) => ((b.delta && b.delta.cost_usd) || 0) - ((a.delta && a.delta.cost_usd) || 0))) {
    const note = [!s.usage && 'no usage counter', s.before && 'started before window', s.delta && s.delta.baseNoCost && 'baseline had no cost; whole lifetime counted'].filter(Boolean).join('; ');
    p(`| ${s.title.replace(/\|/g, '/').slice(0, 60)} | ${s.cls} | ${modelName(s.last_served_model || s.model)} | ${s.effort || '-'} | ${s.delta ? fmtN(s.delta.output_tokens) : '-'} | ${s.delta && s.delta.cost_usd != null ? usd(s.delta.cost_usd) : '-'} | ${note} |`);
  }
  p('');

  fs.mkdirSync(dir, { recursive: true });
  const outFile = path.join(dir, `usage-${date}.md`);
  fs.writeFileSync(outFile, L.join('\n'));
  console.log(`wrote ${outFile}`);
  console.log(`project sessions ${project.length}, notional ${usd(total.cost)}, merged PRs ${prs.list.length} (${playerPrs.length} player-facing)`);
}

const o = args(process.argv.slice(2));
if (o.collect) {
  if (!o.collect.length || typeof o.snapshot !== 'string') { console.error('usage: --collect <transcript.jsonl ...> --snapshot <out.json>'); process.exit(2); }
  collect(o.collect, o.snapshot);
} else report(o);
