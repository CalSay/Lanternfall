---
name: verify
description: Build and check a Lanternfall change before handoff. Use when finishing any code change, or when asked to verify, test or run the checks.
---

1. `git status -sb` and note the base SHA (`git merge-base HEAD origin/claude/elegant-johnson-m6k00u`).
2. Delegate the run to the `qa-runner` agent (cheapest model) unless the task is trivial: `node tools/build.mjs`, then `node tools/check.mjs --only="<sections for this change>"`, then the full `node tools/check.mjs` once before handoff.
3. Balance or economy change: also `node tools/sim.mjs --policy mixed --hours 2 --seed 1` before and after. Record seed, policy, duration and hero.
4. Visible change: look at it in Chromium (landscape, portrait 360px wide, reduced motion) and check the console is clean.
5. Perf-sensitive change (stage, frame loop, ticks): `node tools/perf.mjs --quick`.
6. Report honestly: skipped browser sections are not passes; never relax a check or budget. If a check fails twice, stop and escalate to `systems-reviewer` with the failure output.
