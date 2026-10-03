# Draft card: first trial of the GitHub loop (not published)

Status: draft on Claude's branch. Do not publish until the owner says go and Codex is free.

```
Task: C-T1 Production-line check section (class F)   Line: Saves and tools
Base: <accumulation-branch SHA at publish time>   Branch: codex/ct1-line-check
Outcome (player words): none. Maintainer outcome: a broken docs link or a missing agent file fails the checks, not a reader.
Acceptance (measurable):
  - New check section "docs and agents (C-T1)" in tools/check.mjs, placed before "removed systems (W2-C)".
  - Fails if any relative markdown link in docs/ARCHITECTURE.md, docs/GAME.md, docs/DECISIONS.md or docs/coord/*.md points at a missing file.
  - Fails if a path in the "Specialist instructions" table of AGENTS.md is missing.
  - Passes on the current tree (fix any real broken link it finds in the docs only).
Owned files: tools/check.mjs (one section only), docs links it flags.
Shared files touched: tools/check.mjs, at the documented extension point.
New state: none.   Save impact: none.
After: none.   Owner decision needed: no.
Checks: node tools/build.mjs; node tools/check.mjs --only="docs and agents"; then the full check.
Stop when: the section passes, the full check is green, and the handoff is posted on PR #1.
```

Why this card: small, no game code, no save or balance risk, touches one shared file at its extension point, and it exercises every step (card, branch, handoff, review, checks).
