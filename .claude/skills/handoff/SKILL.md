---
name: handoff
description: Write a handoff note for finished Lanternfall work, to the owner, the integrator, or the Codex lane. Use when a task is done or needs something from the other lane.
---

Use the existing template from `docs/coord/two-agent-split.md`, adapted for Claude's lane:

```
Task: <id> <name>    Branch: <branch>    Head: <sha>    Based on: <checkpoint sha>
Lane: Claude (mechanics/UI)    Needs from Codex: <none | files, data or art wanted>
Changed files: ...
New state fields (fresh() defaults): ...    Save-breaking: yes/no
node tools/build.mjs: ok    node tools/check.mjs: executed/passed/failed/skipped (counts)
Browser checks: <what was looked at, or "not run: reason">
Left over / decisions for the owner: ...
```

Rules: write it as a local file or a PR comment on the task branch's PR. Post to issues, PR #1 or another lane's inbox only when the owner has authorised it. Cross-lane asks name the exact file, event or data shape wanted and the player outcome.
