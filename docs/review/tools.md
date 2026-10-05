# Rubric: tools and checks

For `tools/`, checks, CI, perf budgets and build scripts. Coverage-map areas 19, 20.

## Hard checks

- `node tools/build.mjs` and full `node tools/check.mjs` pass.
- No check is weakened, skipped, loosened or deleted to get green. Budgets are not relaxed without a ruling linked
  in the PR.
- The output file `dist/` changes only through the build.
- The tool runs on a clean checkout with no setup beyond what the PR says.
- Exit codes are right: non-zero on a real failure, zero otherwise.
- Documented where the next person looks (`docs/ARCHITECTURE.md` or the tool's header).

## Scored criteria

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| Usefulness | Catches nothing that wasn't already caught | Catches one real class of problem | Catches a problem that has hurt before; the PR shows it doing so |
| Run time | Slows the common loop by minutes | Under a minute extra | Fast enough to run every time |
| Trust | Flaky or hard to tell why it failed | Mostly steady, messages fair | Repeatable on fixed seeds; failures name the cause |
| Output clarity | Wall of text | Readable | A short summary with detail on request |
| Maintenance cost | Needs hand edits whenever the game changes | Occasional edits | Reads the game's own data |

## Blocking

Any failed hard check; a score of 1 or 2; a tool that can fail silently; a weakened check.
