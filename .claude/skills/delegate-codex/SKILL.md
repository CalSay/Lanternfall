---
name: delegate-codex
description: Hand a Lanternfall task card to Codex through GitHub (issue, branch, PR #1 inbox), then review what Codex pushes. Use when a card is ready to build.
---

Claude plans and reviews; Codex builds. Codex works in the owner's own Codex session and reads GitHub, so the hand-off is a task issue, a branch and a note on PR #1. This is the existing protocol in `docs/coord/two-agent-split.md`.

**Before anything outward:** Codex may be mid-task. Do not create issues, branches or comments for Codex, and never post on PR #1, until the owner says go for this card. Drafts live in `docs/coord/cards/` on Claude's branch.

1. **Check the queue.** Read the open `owner:codex` issues and the latest comments on PR #1. If Codex says it is in progress or blocked, add the card to the queue and do not wake it.
2. **Write the card** from the template in `docs/coord/production-line.md` (base SHA, owned files, acceptance, checks, stop condition). Pin the base to a pushed SHA on the accumulation branch.
3. **Publish it (owner go required):** open an issue titled `C<n>: <name>` with label `owner:codex` and the card as its body; create `codex/c<n>-<name>` from the base SHA; post one line on PR #1: `Claude: C<n> queued (#issue), start from <sha>. Finish the task in hand first.`
4. **Wait.** Codex pushes its branch and posts the handoff on PR #1. Do not poll; PR events wake this session. Never message mid-task.
5. **Review.** Fetch the branch, read the handoff, then the diff. Check owned files only, save impact, art freeze, online layer untouched. Re-run `node tools/build.mjs` and `node tools/check.mjs` (via `qa-runner`); never accept a reported green. Balance, save or cross-system risk goes to `systems-reviewer`.
6. **Answer on #1:** merged (with the new checkpoint SHA) or one bounded change request with evidence. A second failed round goes to the owner.
7. **Integrate** into the accumulation branch only with the owner's say-so. Never publish the artifact.

Limits: one card at a time per Codex session unless the owner says otherwise; no recursive delegation. The Codex CLI route (`codex exec`) is on hold: it needs an API key and network access this environment lacks.
