# Codex as Lanternfall's outside reviewer

From 2026-10-05 the owner wants Claude to do the majority of the work, and Codex to act as a third-party reviewer
"that has no issue slating" Claude's work where it needs to. This page is Codex's brief for that role. It replaces
the build queue in `docs/coord/two-agent-split.md` for everything except new raster art.

## What you review

Claude builds on its own (Autopilot) and merges small PRs into `claude/elegant-johnson-m6k00u`. When some have
merged, Claude posts on PR #1:

```
Codex review request: #<pr>, #<pr> (merged into claude/elegant-johnson-m6k00u). Brief: docs/handoff/claude-to-codex/reviewer/README.md
```

Each PR body carries the card's outcome and acceptance lines. Review the PR's diff against them and against the live
game on the integration branch. When the queue is empty you may also audit any part of the integration branch on
your own initiative; post those findings the same way, with `PR: none (audit)`.

## How to review

Be blunt. A pass you don't believe in is worse than no review. Look hardest at:

1. **Does it do what the card says?** Check each acceptance line. Try it: `node tools/build.mjs`, `node tools/check.mjs`,
   `node tools/sim.mjs` for balance, a browser look at 360px portrait, landscape and reduced motion for UI.
2. **Save safety.** New fields need `registerState`/`fresh()` defaults; old v5 saves must load without loss; no field
   renamed or repurposed.
3. **Active and away parity, exact-once payouts, the economy.** Gold, essence and materials earned the same whether
   watched or not; no duplicate rewards.
4. **Rules in `CLAUDE.md` and `docs/DECISIONS.md`.** Online layer untouched; no prestige; combat active only; solo hero;
   copy plain and short.
5. **Quality.** Bugs, dead code, shared files edited outside their extension points, checks weakened or skipped,
   performance (`node tools/perf.mjs --quick`).
6. **Is it any good for the player?** Confusing menus, grind walls, pointless choices. Say so.

## How to report

One comment per PR on PR #1, starting with `Codex review:` so Claude's listener picks it up:

```
Codex review: #<pr> (<card id>)   Verdict: pass | changes needed
Checked: build ok/failed, check passed/failed/skipped N, sim/browser/perf as run
Findings:
- [blocking] <what is wrong>, <evidence: file:line, command output, steps>, <what right looks like>
- [minor] ...
```

`blocking` = wrong behaviour, broken saves, rule breaches, failing checks, or a clearly bad player experience.
`minor` = everything worth fixing that isn't. You may also leave line comments on the PR itself.

## What happens next

Claude turns every blocking finding into a fix card at the top of its queue. If Claude thinks a finding is wrong it
replies on PR #1 with evidence and the owner decides; it never quietly drops one. Nothing ships to `main` while a
blocking finding is open.

## What you don't do

Don't push to `claude/*` branches or `main`, don't fix the work yourself (report it), don't publish the artifact.
If the owner asks you for new art, the old card flow applies: an `owner:codex` issue, a `codex/<id>-<name>` branch
and a handoff on PR #1.
