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

Be blunt. A pass you don't believe in is worse than no review.

Each PR names its rubric on a `Rubric:` line. Open that file in `docs/review/` (`mechanic`, `balance`, `ui`, `content`,
`tools`, `art`, `design-doc`; `docs/review/README.md` says how to pick one if the line is missing). Run every hard
check, then score each criterion from 1 to 5 using the anchors. Back each score with evidence. Also look at what the
rubrics may miss:

1. **Does it do what the card says?** Check each acceptance line. Try it: `node tools/build.mjs`, `node tools/check.mjs`,
   `node tools/sim.mjs` for balance, a browser look at 360px portrait, landscape and reduced motion for UI.
2. **Save safety, parity, payouts, rules.** New fields have defaults; old v5 saves load; active and away match;
   rewards pay once; the online layer is untouched; rules in `CLAUDE.md` and `docs/DECISIONS.md` hold.
3. **Is it any good for the player?** Confusing menus, grind walls, pointless choices. Say so.

## How to report

One comment per PR on PR #1, starting with `Codex review:` so Claude's listener picks it up:

```
Codex review: #<pr> (<card id>)   Rubric: <name>   Verdict: pass | changes needed
Checked: build ok/failed, check passed/failed/skipped N, sim/browser/perf as run
Hard checks: <check> pass | <check> FAIL (<evidence>) ...
Scores: <criterion> <1-5> (<evidence>) | <criterion> <1-5> (<evidence>) ...
Findings:
- [blocking] <what is wrong>, <evidence: file:line, command output, steps>, <what right looks like>
- [minor] ...
```

`blocking` = a failed hard check, a score of 1 or 2 on any criterion, wrong behaviour, broken saves, rule breaches,
failing checks, or a clearly bad player experience. `minor` = everything worth fixing that isn't. Verdict is `pass`
only when every hard check passes and no score is below 3. You may also leave line comments on the PR itself.

## What happens next

Claude turns every blocking finding into a fix card at the top of its queue. If Claude thinks a finding is wrong it
replies on PR #1 with evidence and the owner decides; it never quietly drops one. Nothing ships to `main` while a
blocking finding is open.

## What you don't do

Don't push to `claude/*` branches or `main`, don't fix the work yourself (report it), don't publish the artifact.
If the owner asks you for new art, the old card flow applies: an `owner:codex` issue, a `codex/<id>-<name>` branch
and a handoff on PR #1.
