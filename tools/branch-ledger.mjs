#!/usr/bin/env node
// Branch ledger: every remote branch that is ahead of the integration branch, with a status guess, so the Monday
// notes can say what is in the build and what still waits on a branch.
//
//   node tools/branch-ledger.mjs             markdown table to stdout
//   node tools/branch-ledger.mjs --json      the same rows as JSON
//   --base REF      integration branch (default origin/claude/elegant-johnson-m6k00u)
//   --stale DAYS    days without a commit before a branch counts as stale (default 7)
//   --no-prs        skip the pull request lookup
//
// Reads local git only (run `git fetch` first for fresh data). The open PR number comes from the `gh` CLI when it is
// installed and signed in; otherwise the column shows "?" and the status guess uses commits alone. Touches no game files.
//
// Status guess, first match wins:
//   merged           its PR is merged (needs the PR lookup)
//   open PR          an open PR has this branch as its head
//   review-only art  every changed file sits under art/ or docs/ (a Codex art or review draft; nothing is wired in)
//   stale            last commit more than --stale days ago
//   active           anything else
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const BASE = opt('--base', 'origin/claude/elegant-johnson-m6k00u');
const STALE_DAYS = Number(opt('--stale', '7'));

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 64 << 20 }).trim();
const tryRun = (cmd, a) => {
  try {
    return execFileSync(cmd, a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 30000 }).trim();
  } catch {
    return null;
  }
};

try {
  git('rev-parse', '--verify', BASE);
} catch {
  console.error(`branch-ledger: cannot find ${BASE}. Run "git fetch origin" or pass --base.`);
  process.exit(2);
}

// PR lookup: head branch name -> { number, state }. Open PRs win over older merged or closed ones.
const prs = new Map();
if (!flag('--no-prs')) {
  const out = tryRun('gh', ['pr', 'list', '--state', 'all', '--limit', '300', '--json', 'number,state,headRefName']);
  if (out) {
    for (const p of JSON.parse(out)) {
      const seen = prs.get(p.headRefName);
      if (!seen || (p.state === 'OPEN' && seen.state !== 'OPEN') || (seen.state !== 'OPEN' && p.number > seen.number)) {
        prs.set(p.headRefName, { number: p.number, state: p.state });
      }
    }
  }
}
const prsKnown = prs.size > 0;

const baseShort = BASE.replace(/^origin\//, '');
const refs = git('for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin')
  .split('\n')
  .filter((r) => r && r !== 'origin/HEAD' && r !== BASE && r !== 'origin/main');

const now = Date.now();
const rows = [];
for (const ref of refs) {
  const [behind, ahead] = git('rev-list', '--left-right', '--count', `${BASE}...${ref}`).split(/\s+/).map(Number);
  if (ahead === 0) continue;
  const [date, author, subject] = git('log', '-1', '--format=%cI%x1f%an%x1f%s', ref).split('\x1f');
  const files = git('diff', '--name-only', `${BASE}...${ref}`).split('\n').filter(Boolean);
  const artOnly = files.length > 0 && files.every((f) => f.startsWith('art/') || f.startsWith('docs/'));
  const name = ref.replace(/^origin\//, '');
  const pr = prs.get(name);
  const ageDays = (now - Date.parse(date)) / 86400000;
  let status = 'active';
  if (pr && pr.state === 'MERGED') status = 'merged';
  else if (pr && pr.state === 'OPEN') status = 'open PR';
  else if (artOnly) status = 'review-only art';
  else if (ageDays > STALE_DAYS) status = 'stale';
  rows.push({
    branch: name,
    ahead,
    behind,
    lastCommit: date,
    author,
    subject,
    pr: pr ? pr.number : null,
    status,
  });
}
rows.sort((a, b) => Date.parse(b.lastCommit) - Date.parse(a.lastCommit));

if (flag('--json')) {
  console.log(JSON.stringify({ base: baseShort, prsKnown, branches: rows }, null, 2));
  process.exit(0);
}

const cell = (s) => String(s).replace(/\|/g, '\\|');
const lines = [
  `# Branch ledger`,
  ``,
  `Base: \`${baseShort}\`. ${rows.length} remote branches are ahead of it.` +
    (prsKnown ? '' : ' PR numbers are unknown (no `gh` access), so "merged" and "open PR" are not shown.'),
  ``,
  `| Branch | Ahead / behind | Last commit | Author | Subject | PR | Status |`,
  `|---|---|---|---|---|---|---|`,
];
for (const r of rows) {
  lines.push(
    `| \`${r.branch}\` | +${r.ahead} / -${r.behind} | ${r.lastCommit.slice(0, 10)} | ${cell(r.author)} | ${cell(r.subject)} | ${r.pr ? '#' + r.pr : prsKnown ? '' : '?'} | ${r.status} |`
  );
}
const counts = {};
for (const r of rows) counts[r.status] = (counts[r.status] || 0) + 1;
lines.push('', `Summary: ${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ') || 'none'}.`);
console.log(lines.join('\n'));
