# Two agents: Claude and Codex

Agreed with the owner on 2026-09-30. Claude is lead developer and integration coordinator. Codex works side by side in
its own worktree. Claude assigns Codex's work and integrates it. The owner may delegate work to subagents and pick
their models, and invites suggestions inside and outside scope (send them to Claude with evidence, player impact and a
concrete recommendation; never implement scope changes silently).

## Rules

1. **One checkpoint.** Codex branches from the commit Claude names, or else the tip of
   `origin/claude/elegant-johnson-m6k00u`. Never from `main`, which is far behind.
2. **Owned areas.** Each agent edits only the files its track owns. Shared files follow the limits below. If a task
   needs a file the other agent owns, ask on the task's issue first.
3. **Own checkout only.** Codex works on `codex/<task-id>-<short-name>` branches. It never switches, resets or pushes
   Claude's branch, and Claude never edits Codex's worktree.
4. **Claude integrates and publishes.** Codex pushes its `codex/...` branch and posts a handoff. Claude merges,
   resolves conflicts, rebuilds `dist/lanternfall.html`, runs the checks on the combined game and publishes the
   preview. Codex never publishes the artifact and never merges into `main`.
5. **One task list:** GitHub issues on CalSay/Lanternfall labelled `owner:claude` or `owner:codex`, one issue per task.
   Each issue lists the files that move with it; the issue and its comments are newer than this page and win.
6. **Report honestly.** Never describe skipped browser checks as passed. Record real failures and environment limits.
   Do not relax checks or performance budgets to get a green run.

## Shared files

- `tools/check.mjs`: add your checks as your own sections (`if (section('name')) try {...}`), one block marked with the
  task id, just before the "removed systems (W2-C)" section. Don't restructure the file or edit other tasks' sections.
  Add a `WEIGHT` entry only for a slow browser section.
- `src/js/30-state.js` (`fresh()` defaults): your own fields only. **Only Claude bumps the save key.** If a change would
  break a v5 save, say so in the handoff.
- `src/js/23n-data-notices.js`: add rules at the end of `NOTICES`, in a block marked with the task id. The quiet-start
  budget and pop limits are Claude's.
- `dist/lanternfall.html`: generated; Claude rebuilds it on every merge.
- `docs/ARCHITECTURE.md`: add rows for your new files; don't rewrite sections.
- Economy and crafting balance (`55-econ.js`, `21w-data-econ.js`, `55-crafting.js`, `21-data-craft.js`, `41-items.js`,
  `75-craft-ui.js`): propose changes in the handoff; Claude signs off.
- The online layer (raid, the Tavern's online parts, leaderboard, `db`/`room`/`user`, shared doc shapes): nobody,
  unless the owner asks.

## Who owns what (2026-09-30, then by issue)

- **Claude:** integration, merges and publishing; design and balance sign-off; the shell and layout (`70-ui.js`,
  `75-nav-ui.js`, `src/shell.html`, landscape CSS, the action-bar layout and keys); stage drawing and hero art wiring
  (`62-stage.js`, `61-anim.js`, `64h-hero-sprites.js`, `tools/heroart.mjs`); onboarding and the notices policy
  (`55-onboard.js`, `75-onboard-ui.js`, `55-goals.js`, `75-goals-ui.js`); `tools/sim.mjs`; the structure of
  `tools/check.mjs`.
- **Codex:** gatherers (`57f-hands.js`, `21f-data-hands.js`, `74-ui-hands.js`, `60-hands.css`), the camp (`57-camp.js`,
  `55-hearth.js`, `75-camp-ui.js`, `63d-scenery-camp.js`), gathering (`55-gathering.js`, `72-ui-gather.js`,
  `63c-scenery-gather.js`), the Tavern's offline parts, save codes (`55-savecode.js`, `75-savecode-ui.js`,
  `tools/savecode.mjs`), build tooling portability, story and NPC content (`55-story.js`, `75-story-ui.js`,
  `21-stories.js`, `21b-stories-coast.js`, `21h-lore-hollow.js`, `21j-lore-omens.js`), background art
  (`art/backgrounds/`) and new art packs for the owner to vet, and the feature tasks assigned to it by issue (abilities, combat spec, Ascension and Hallowed, enemies).

## How Codex reports and gets new work

- **Inbox:** pull request CalSay/Lanternfall#1. Claude is subscribed, so a comment there wakes Claude.
- **Finished a task:** push the `codex/...` branch first, then post the handoff (template below) as a comment on #1.
  Claude merges, runs the checks, publishes the preview, closes the issue and replies with the next checkpoint.
- **Then carry on** with the next open `owner:codex` issue, in the order Claude last set, from the newest checkpoint.
  Respect "After: Cn" dependencies and approval gates.
- **Questions:** comment on the task's issue and mention it on #1; work on something else meanwhile.
- **Queue empty or blocked:** comment "Codex: queue empty" or "Codex: blocked on ..." on #1.
- Use UTF-8 body files (`gh issue comment ... --body-file ...`) for multi-line comments.

## Handoff template (Codex to Claude)

```
Task: C<n> <name> (#issue)    Branch: codex/c<n>-<name>    Head: <sha>    Based on: <checkpoint sha>
Changed files: ...
New state fields (fresh() defaults): ...    Save-breaking: yes/no
node tools/build.mjs: ok    node tools/check.mjs: executed/passed/failed/skipped
Manual or browser checks: ...
Left over / needs Claude: ...
```
