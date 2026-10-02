# One-chat Codex orchestration

Added 2 October 2026 for the owner's dedicated Codex workspace. Baseline:
`claude/elegant-johnson-m6k00u` at `387fe2d53851624f578dd7f4dc23ad1a0407e7e5`.
Working branch: `codex/orchestration-architecture`.

## Relationship to existing work

[The two-agent agreement](two-agent-split.md) still governs upstream ownership and Claude's integration role.
Codex now coordinates specialists inside its assigned workspace; it does not independently take over all tracks.
Existing `GAME.md`, `DECISIONS.md`, `CLAUDE.md`, architecture, design specs and art packs remain canonical.
The new topic guides are navigation and guardrails, not competing specifications.

## A request from start to finish

1. Main chat converts the request into a bounded deliverable and acceptance criteria. Check branch, working tree,
   base SHA, relevant issue scope and current decisions before editing. Read only the affected systems.
2. Handle a small task directly. For a larger one, send independent questions to the relevant role files in
   `../agents/`. Use at most two workers plus the coordinator, within the available host limit.
3. Give every worker a compact brief: outcome, base SHA, file ownership, source paths, constraints, checks,
   output format and stopping condition. Use a separate worktree for each editor; keep reviewers read-only.
4. Review results against owner decisions and live code. Merge dependent work in order into the assigned Codex
   branch. One coordinator owns shared-file edits and the generated build.
5. Run `node tools/build.mjs`, then `node tools/check.mjs`. For balance changes measure the real affected combat
   mode; for visible changes check landscape, portrait and reduced motion. Run the required quick performance
   check after a merge wave. Record failures and skipped browser sections honestly.
6. Report the outcome, changed paths, measurements, base/head SHAs and remaining decisions in the main chat.
   Push only the authorized Codex branch. Prepare the existing handoff format; send it to Claude only when the
   owner authorizes that communication. Claude handles upstream integration and publishing.

## Cost controls

Durable decisions go in `../DECISIONS.md` only when the owner makes them. Live system descriptions go in
`../GAME.md`; proposal details stay in the existing design area. A main chat should reuse these written facts
rather than copying its whole history to workers. Read role files on demand. Do not run all five roles on
every request or maintain idle workers. Art cycles start with one consistent brief and a bounded draft; stop
for owner pack review before integration. Stronger reasoning is an escalation for uncertainty, not a default
for mechanical edits. Model choice is host-dependent; Markdown cannot switch models or enable unavailable tools.

## Starting a chat in this workspace

Open the repository checkout on this branch and ask: "Use AGENTS.md to coordinate this Lanternfall task:
[desired player outcome]. Keep work on a Codex branch and report specialist results here."
The root file is the entry point; `docs/agents/*.md` are explicit worker briefs, not installed runtime roles.
If the host has no subagent tools, follow the same roles sequentially in the main chat and say so.

## Baseline discrepancies to resolve per task

- `GAME.md` describes real-time Deepwell and Provings, but the newer `combat-turn-build.md` describes their turn
  conversion. Verify `59c-deepwell-combat.js`, `59f-trials.js` and `59k-turn.js` before changing those modes.
- The live build has only two fully integrated C22 zone foes. The full five-region enemy structure is a design
  contract, not evidence that all enemies, Captains and Champions are implemented.
- `art-pipeline.md` retains older instructions about code-added effects. Its freeze notice and `CLAUDE.md` require
  new effects and props to come from the artist's complete pack, with the explicitly approved Hunting exception.
- C27's power curve is labelled a proposal. Its model outputs are not measurements of this checkpoint.

## Deployment stays separate

No pushes to `main` or Claude's accumulation branch, no deployment-trigger commit messages, no publishing.
Do not change Netlify settings. `netlify.toml` currently filters builds by the commit marker; deployment
permissions and external Netlify settings are not established by this repository inspection.
