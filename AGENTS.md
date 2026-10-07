# Lanternfall: notes for Codex

**Your roles from 2026-10-05:** builder of self-contained low-risk cards (rules: `docs/handoff/codex-build/README.md`), outside reviewer of Claude's work, plus new raster art when asked. Start with
`docs/handoff/claude-to-codex/reviewer/README.md`; it overrides the build queue described below.
When Claude hands you a `codex-build: <card id>` issue, follow `docs/handoff/codex-build/README.md` for that task.

Read `CLAUDE.md` first: it holds the project rules (single-file artifact, save key, online layer, copy style).
Then read `docs/coord/two-agent-split.md`: you work side by side with Claude, who is lead developer and
integration coordinator. It says which files you own, the shared-file rules, where your task queue lives (GitHub
issues) and the handoff format. `docs/GAME.md` describes the game as it is now; `docs/DECISIONS.md` lists every owner
decision. Branch from the checkpoint Claude names, work in your own worktree on `codex/<task>` branches, never push
to `claude/*` branches or `main`, and never publish the artifact.

Before handing off: `node tools/build.mjs`, then `node tools/check.mjs` (sharded, about 2 minutes; see
"How the checks work" in `docs/ARCHITECTURE.md`).

## Code Review Rules

These apply to every pull request Codex reviews in this repo, whether triggered automatically or by `@codex review`.
Most PRs come from Claude's Autopilot (`claude/ap-*` branches into `claude/elegant-johnson-m6k00u`). The owner wants a
tough outside reviewer: report real problems plainly and don't pass work you don't believe in.

- Use the rubric the PR body names (`Rubric: <type>`) from `docs/review/` (`README.md` there says how to pick one and
  gives the verdict layout). Run its hard checks and score each criterion from 1 to 5. A score of 1 or 2 is a P1
  finding. A failed hard check is P1, or P0 if it matches the P0 list below.
  The P0, P1 and P2 lists below take precedence: a failure they name keeps that severity. Copy criteria in any rubric (`ui.md` "Copy clarity", `content.md` "Clarity and plain copy") are scored,
  and a 1 or 2 on them is P2, not P1.
- **P0:** an old v5 save that would lose data or fail to load; a renamed or repurposed save field; a change to the
  online layer (`80-online.js`, `52-raid.js`, `74-ui-raid.js`, the db/room/user shapes in `CLAUDE.md`); a save key change.
- **P1:** a new save field without a `registerState`/`fresh()` default; different rewards for active and away play, or a
  reward paid twice; a check weakened, skipped or deleted, or a performance budget relaxed; a shared file edited outside
  its extension point (`docs/ARCHITECTURE.md`); `dist/lanternfall.html` not rebuilt; a choice that is always best; a
  menu or layout that breaks at 360px wide or ignores reduced motion; an acceptance line in the PR body that the diff
  doesn't meet.
- **P2:** player-facing copy that isn't short, plain and active; names a player wouldn't use; dead code; small UI rough edges that score a 3 or better on the UI rubric. UI
  so unclear that it scores a 1 or 2 is P1.
- Don't flag formatting or lint; CI covers those.
