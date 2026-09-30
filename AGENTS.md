# Lanternfall: notes for Codex

Read `CLAUDE.md` first: it holds the project rules (single-file artifact, save key, online layer, copy style).
Then read `docs/coord/two-agent-split.md`: you work side by side with Claude, who is lead developer and
integration coordinator. It says which files you own, the shared-file rules, your task queue and the handoff
format. Branch from the checkpoint Claude names, work in your own worktree on `codex/<task>` branches, never push
to `claude/*` branches or `main`, and never publish the artifact.

Before handing off: `node tools/build.mjs`, then `node tools/check.mjs` (sharded, about 2 minutes; see
"How the checks work" in `docs/ARCHITECTURE.md`).
