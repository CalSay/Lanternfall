# Lanternfall: notes for Codex

**Your role from 2026-10-05:** outside reviewer of Claude's work, plus new raster art when asked. Start with
`docs/handoff/claude-to-codex/reviewer/README.md`; it overrides the build queue described below.

Read `CLAUDE.md` first: it holds the project rules (single-file artifact, save key, online layer, copy style).
Then read `docs/coord/two-agent-split.md`: you work side by side with Claude, who is lead developer and
integration coordinator. It says which files you own, the shared-file rules, where your task queue lives (GitHub
issues) and the handoff format. `docs/GAME.md` describes the game as it is now; `docs/DECISIONS.md` lists every owner
decision. Branch from the checkpoint Claude names, work in your own worktree on `codex/<task>` branches, never push
to `claude/*` branches or `main`, and never publish the artifact.

Before handing off: `node tools/build.mjs`, then `node tools/check.mjs` (sharded, about 2 minutes; see
"How the checks work" in `docs/ARCHITECTURE.md`).
