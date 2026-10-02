# Lanternfall: notes for Codex

Read `CLAUDE.md` first: it holds the project rules (single-file artifact, save key, online layer, copy style).
Then read `docs/coord/two-agent-split.md`: you work side by side with Claude, who is lead developer and
integration coordinator. It says which files you own, the shared-file rules, where your task queue lives (GitHub
issues) and the handoff format. `docs/GAME.md` describes the game as it is now; `docs/DECISIONS.md` lists every owner
decision. Branch from the checkpoint Claude names, work in your own worktree on `codex/<task>` branches, never push
to `claude/*` branches or `main`, and never publish the artifact.

Before handing off: `node tools/build.mjs`, then `node tools/check.mjs` (sharded, about 2 minutes; see
"How the checks work" in `docs/ARCHITECTURE.md`).

## Codex orchestration workspace (owner request, 2026-10-02)

On `codex/orchestration-architecture` and its explicitly assigned child task branches, the main Codex chat
coordinates the owner's requests and specialist subagents. Claude remains the upstream integration coordinator;
this does not transfer ownership of Claude's files, economy sign-off, save-key changes or publishing.
The owner may assign a different scope directly. Outside this workspace, keep the two-agent workflow above.

### Read only what the task needs

Read `CLAUDE.md`, this file and `docs/coord/codex-orchestration.md` first. Use `docs/GAME_BIBLE.md` to locate
the relevant canonical doc and code. `docs/GAME.md` maps the live build; `docs/DECISIONS.md` records owner intent.
Later direct owner instructions win. Distinguish live code, accepted design, proposals and retired systems.
Do not revive party combat, auto fighting or obsolete art rules from historical specs.

### Route work through one chat

Keep small, clear tasks in the main chat. Delegate only independent work with a useful deliverable:

| Need | Specialist instructions |
|---|---|
| Systems, abilities, progression or story | `docs/agents/designer.md` |
| Measured power, costs, pacing or rewards | `docs/agents/balance-reviewer.md` |
| Consistent packs, art briefs and visual review | `docs/agents/art-director.md` |
| Implementation, defects and validation | `docs/agents/engineer.md` |
| Dependencies, ownership, milestones and handoff | `docs/agents/producer.md` |

Read the selected role file and include its instructions in the subagent assignment; role files are not
automatically registered agents. Include the exact base SHA, question, owned files, relevant docs, acceptance
criteria, validation and a stopping condition. Specialists report to the main chat, which reconciles results.

### Usage and parallel work

Use the configured model by default. If the host supports per-agent model selection and the owner authorizes it,
use the cheapest capable worker for bounded mechanical work; reserve stronger reasoning for ambiguous,
cross-system or balance decisions. Never claim a fixed usage saving or silently change account settings.
Respect steady mode: at most three agents including the coordinator, subject to the host's lower limit.
Start with one worker; add another only for independent work. No recursive delegation without coordinator approval.
Avoid full-history copies, repeated repository scans, duplicate reviewers and endless art critique loops.
Escalate after one failed attempt with the failure evidence; agree a new bounded attempt instead of blind retries.

Each editing worker uses its own branch/worktree and explicit file ownership. Review-only workers do not edit.
Serialize changes to shared files and generated outputs. The coordinator integrates only into its Codex task
branch, reviews the diff, updates the existing canonical docs when authorized, and runs required checks.
Never fabricate approvals, measurements or skipped test results. On pause, launch nothing new.

### Branch and deployment boundary

Base this workspace on `claude/elegant-johnson-m6k00u`, never the stale `main`. Record the SHA in every handoff.
Push only the assigned `codex/...` branch when authorized. Do not push to Claude's branch or `main`, merge a PR,
publish an Artifact, invoke deployment tools, change `netlify.toml` or put the deployment trigger token in commit
messages. This workspace is for review, not deployment. Posting to Claude's inbox or issues requires explicit
owner authorization; prepare a handoff locally until then.
