---
name: delegate-codex
description: Hand a Lanternfall task card to the Codex CLI as a worker, then review its branch. Use when a card is ready to build and the owner wants Codex to do the work.
---

Claude plans and reviews; Codex builds. Treat `codex exec` like a subagent: one bounded card in, one branch out.

**Preconditions (stop and tell the owner if any fails):** `command -v codex` works; `OPENAI_API_KEY` is set in the environment (never ask for it in chat, never print it); the card has a base SHA, owned files, acceptance criteria and a stopping condition.

1. **Worktree.** `git fetch origin && git worktree add ../lf-<id> -b codex/<id>-<name> <base-sha>`. One worktree per card; never reuse Claude's branch.
2. **Brief.** Write the card to `../lf-<id>.card.md` (template in `docs/coord/production-line.md`). Point to `AGENTS.md`, `CLAUDE.md` and the role file in `docs/agents/` instead of pasting them. State: no push, no merge, no publish, no deploy, owned files only.
3. **Run.** From the worktree, non-interactive, write-scoped to it:
   `codex exec --cd ../lf-<id> --sandbox workspace-write --output-last-message ../lf-<id>.out.md "$(cat ../lf-<id>.card.md)"`
   Verify the flag names with `codex exec --help` the first time; the CLI changes. Pass `--model` only if the owner chose one. Run long jobs in the background and wait for exit.
4. **Review before trusting.** Read `../lf-<id>.out.md`, then the diff (`git -C ../lf-<id> diff <base-sha>..HEAD --stat`, then the files). Check owned-files-only, save impact, art freeze, online layer untouched. Re-run `node tools/build.mjs` and `node tools/check.mjs` yourself via `qa-runner`; never accept Codex's own claim of green.
5. **Decide.** Blocking findings go back as ONE bounded follow-up `codex exec` with the failure evidence (second attempt only; after that escalate to the owner). Risky or balance-affecting diffs get `systems-reviewer`.
6. **Hand off.** Use the `handoff` skill. Pushing `codex/<id>-<name>` and merging into the accumulation branch need the owner's go-ahead unless they have granted it for this card.

Limits: at most two Codex runs at once; no recursive delegation (Codex does not spawn Codex); stop on pause.
