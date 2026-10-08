#!/usr/bin/env node
// CI `eyes` job: replays each docs/proof/<card>/route.txt that this PR changed, on the built game, at phone portrait and
// landscape, and writes eyes-out/ (shots, bursts, output) plus eyes-out/summary.md (the PR comment body). Each route also plays
// at 1920x1080 with a mouse for the Bar's big shot (report only: a miss there is listed, never failed; desktop routes are a later
// card). Player eyes (tools/eyes.mjs --quick) reads the desktop view (1280x720, mouse) first, then 740x360 and 360x740.
//   node tools/ci/eyes.mjs <base-sha> <head-sha> "<comma-separated PR labels>"
//   node tools/ci/eyes.mjs --local [labels]     the same check on your branch against origin/claude/elegant-johnson-m6k00u
//                                               (build first: node tools/build.mjs). Works with no CI. Paste eyes-out/summary.md in the PR.
//   node tools/ci/eyes.mjs --gate <base> <head> prints `go=true` if src/ or a route changed (CI uses it to skip the browser install)
// Exit 1 when an `expect` fails, a route cannot run, or src/ changed with no changed route.txt (unless the PR carries
// the `no-visible-change` label). A route may start with a comment line `# seed: <n>` (default 1).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';

let [base, head, labelStr = ''] = process.argv.slice(2);
const gate = base === '--gate';
if (gate) [base, head] = [head, labelStr];
if (base === '--local') {
  labelStr = head || process.env.LABELS || '';
  const INTEGRATION = 'origin/claude/elegant-johnson-m6k00u';
  try { base = execFileSync('git', ['merge-base', INTEGRATION, 'HEAD'], { encoding: 'utf8' }).trim(); } catch { console.error(`no ${INTEGRATION}: git fetch origin claude/elegant-johnson-m6k00u`); process.exit(2); }
  head = null;   // the working tree: committed, staged, changed and new files
}
if (!base || (!head && head !== null)) { console.error('usage: eyes.mjs <base-sha> <head-sha> "<labels>"'); process.exit(2); }
const labels = labelStr.split(',').map(s => s.trim()).filter(Boolean);
const git = a => execFileSync('git', a, { encoding: 'utf8' }).split('\n').filter(Boolean);
const changed = head ? git(['diff', '--name-only', base, head]) : [...git(['diff', '--name-only', base]), ...git(['ls-files', '-o', '--exclude-standard'])];
const routes = changed.filter(f => /^docs\/proof\/[^/]+\/route\.txt$/.test(f) && fs.existsSync(f));
const srcChanged = changed.some(f => f.startsWith('src/'));
if (gate) { console.log(`go=${srcChanged || routes.length > 0}`); process.exit(0); }
const out = 'eyes-out';
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });

const lines = ['<!-- lanternfall-eyes -->', '### Eyes: the change, played', ''];
let failed = false;
// Every failure gets one cause so a red run says why: missing-route-txt (src/ changed, no route), timeout-under-load (the
// route run hit its time limit and was killed), expect-false (an `expect` missed, or a tap could not be made), run-error
// (anything else, e.g. the driver crashed). Printed as `  FAIL <cause> ...` lines (retry-once.sh quotes them) and
// appended to the job summary.
const causes = [];
const fail = (cause, where, detail = '') => { failed = true; causes.push({ cause, where, detail: detail.replace(/\s+/g, ' ').slice(0, 160) }); };
if (srcChanged && !routes.length && !labels.includes('no-visible-change')) {
  fail('missing-route-txt', 'PR');
  lines.push('**FAIL.** This PR changes `src/` but no `docs/proof/<card-id>/route.txt`. Play the change with `tools/playtest.mjs`, commit the route, or add the `no-visible-change` label if a player cannot see it.', '');
} else if (!routes.length) {
  lines.push(srcChanged ? 'No route changed. Label `no-visible-change` is set.' : 'No `src/` change and no route changed. Nothing to play.', '');
}
// The routes' gating views stay today's two phone views (desktop-view-in-checks); hd is the Bar's 1920x1080 shot, report only.
const VIEWS = [['portrait', ['--view', 'portrait'], true], ['landscape', ['--view', 'landscape'], true], ['hd', ['--view', 'hd'], false]];
// Every (route, view) run is its own browser, so they run side by side (up to 4 at once); the report keeps route order.
const run = (cmd, args, opts) => new Promise(res => {
  const c = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] }); let out = '', err = '', done = false, timedOut = false;
  const fin = status => { if (!done) { done = true; clearTimeout(t); res({ status, stdout: out, stderr: err, timedOut }); } };
  const t = setTimeout(() => { timedOut = true; c.kill('SIGKILL'); fin(null); }, opts.timeout);
  c.stdout.on('data', d => (out += d)); c.stderr.on('data', d => (err += d));
  c.on('close', code => fin(code)); c.on('error', () => fin(1));
  c.stdin.on('error', () => {}); c.stdin.end(opts.input || '');
});
const POOL = 4; let slots = POOL; const waiting = [];
const limited = fn => new Promise((ok, no) => { const go = () => { slots--; fn().then(ok, no).finally(() => { slots++; waiting.shift()?.(); }); }; slots > 0 ? go() : waiting.push(go); });
const jobs = routes.map(r => {
  const card = r.split('/')[2], text = fs.readFileSync(r, 'utf8');
  const seed = (text.match(/^#\s*seed:\s*(\d+)/m) || [])[1] || '1';
  return { card, seed, views: VIEWS.map(([view, extra, gates]) => {
    const dir = path.join(out, card, view);
    fs.mkdirSync(dir, { recursive: true });
    return { view, dir, gates, run: limited(() => run('node', ['tools/playtest.mjs', 'batch', '--seed', seed, '--session', path.join('.proof-session', card, view), '--shots', dir, '--quiet', ...extra], { input: text, timeout: 240000 })) };
  }) };
});
// qa-player-eyes: the wider read of what a player sees (tools/eyes.mjs --quick), one run per view side by side, desktop first.
// Report only: it never fails this job.
const PE_VIEWS = [['desktop', 'd'], ['landscape', 'l'], ['portrait', 'p']];
const peRuns = srcChanged ? PE_VIEWS.map(([view, code]) => { const md = path.join(out, 'player-eyes', view + '.md');
  return { view, md, run: limited(() => run('node', ['tools/eyes.mjs', '--quick', '--sizes', code, '--out', md], { timeout: 240000 })) }; }) : [];
for (const { card, seed, views } of jobs) {
  lines.push(`**${card}** (seed ${seed})`, '', '| View | Step | Result |', '|---|---|---|');
  for (const { view, dir, gates, run: p } of views) {
    const res = await p;
    fs.writeFileSync(path.join(dir, 'output.txt'), (res.stdout || '') + (res.stderr || ''));
    const ex = fs.existsSync(path.join(dir, 'expects.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'expects.json'), 'utf8')) : [];
    const shots = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.png')) : [];
    if (!gates) {   // the 1920x1080 shot: listed, never failed
      const miss = ex.filter(e => !e.ok).length, ran = res.status === 0 || (miss > 0 && !/no button labelled/.test(res.stdout + res.stderr));   // a missed expect still plays on; a failed tap stops the route
      lines.push(`| ${view} 1920x1080 | shots (report only) | ${shots.length} (${shots.slice(0, 8).map(s => s.replace('.png', '')).join(', ')}${shots.length > 8 ? ', ...' : ''})${miss ? `; ${miss} expect(s) missed here` : ''}${ran ? '' : `; did not finish: ${((res.stdout + res.stderr).trim().split('\n').pop() || '').slice(0, 120).replace(/\|/g, '/')}`} |`);
      continue;
    }
    for (const e of ex) { lines.push(`| ${view} | expect "${e.want}" | ${e.ok ? 'pass' : '**FAIL**'} |`); if (!e.ok) fail('expect-false', `${card} ${view}`, `expect "${e.want}"`); }
    lines.push(`| ${view} | shots | ${shots.length} (${shots.slice(0, 8).map(s => s.replace('.png', '')).join(', ')}${shots.length > 8 ? ', ...' : ''}) |`);
    if (res.status !== 0 && !ex.some(e => !e.ok)) {
      const tail = (res.stdout + res.stderr).trim().split('\n').slice(-2).join(' ');
      if (res.timedOut) fail('timeout-under-load', `${card} ${view}`, 'the route run hit its time limit and was killed');
      else if (/no button labelled/.test(res.stdout + res.stderr)) fail('expect-false', `${card} ${view}`, tail);   // a tap that could not be made
      else fail('run-error', `${card} ${view}`, `exit ${res.status}: ${tail}`);
      lines.push(`| ${view} | run | **FAIL** exit ${res.status}: ${((res.stdout + res.stderr).trim().split('\n').slice(-2).join(' ') || '').slice(0, 160).replace(/\|/g, '/')} |`); }
  }
  lines.push('');
}
if (srcChanged) {
  lines.push('**Player eyes** (report only; `node tools/eyes.mjs` runs it on your machine)', '');
  for (const { view, md, run: p } of peRuns) {
    const res = await p;
    try {
      const f = JSON.parse(fs.readFileSync(md.replace(/\.md$/, '') + '.json', 'utf8')).findings;
      const by = {}; for (const x of f) by[x.check] = (by[x.check] || 0) + 1;
      lines.push(`*${view}*: ` + (f.length ? `${f.length} finding(s): ${Object.entries(by).map(([k, n]) => `${k} ${n}`).join(', ')}.` : 'nothing found.'), '');
      for (const x of f.slice(0, 8)) lines.push(`- ${x.scenario}: ${x.what}`);
      if (f.length > 8) lines.push(`- ... ${f.length - 8} more in \`player-eyes/${view}.md\` in the \`eyes-out\` artifact`);
      lines.push('');
    } catch (e) { lines.push(`*${view}*: did not run (${((res.stderr || res.stdout || '').trim().split('\n').pop() || 'no output').slice(0, 120)}).`, ''); }
  }
}
if (causes.length) {
  lines.push('**Why it failed**', '', '| Cause | Where | Detail |', '|---|---|---|', ...causes.map(c => `| ${c.cause} | ${c.where} | ${c.detail.replace(/\|/g, '/')} |`), '');
  for (const c of causes) console.log(`  FAIL ${c.cause} ${c.where}${c.detail ? ': ' + c.detail : ''}`);
  try { fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY || os.devNull, `### Eyes failure causes\n\n${causes.map(c => `- \`${c.cause}\` ${c.where}`).join('\n')}\n`); } catch (e) { /* no summary file */ }
}
lines.push(failed ? '**Result: FAIL.**' : '**Result: pass.**', '', 'Shots, bursts and output are in the `eyes-out` workflow artifact on this run.');
fs.writeFileSync(path.join(out, 'summary.md'), lines.join('\n') + '\n');
console.log(lines.join('\n'));
process.exit(failed ? 1 : 0);
