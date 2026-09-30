# Two agents: Claude and Codex

Agreed with the owner on 2026-09-30. Claude is lead developer and integration coordinator. Codex works side by
side in its own worktree on the tasks listed under "Codex track". Claude assigns Codex's work and integrates it.

## Rules

1. **One checkpoint.** Codex branches from the commit Claude names (below), never from `main`, which is far
   behind. Each new Codex task starts from the latest checkpoint Claude posts.
2. **Owned areas.** Each agent edits only the files its track owns. A file listed as shared follows the shared
   rules below. If a task needs a file the other agent owns, stop and ask Claude (through the owner, or the task
   list), don't edit it.
3. **Own checkout only.** Codex works in its own worktree on branches named `codex/<task-id>-<short-name>`. It never
   switches, resets or pushes Claude's branch (`claude/elegant-johnson-m6k00u`), and Claude never edits Codex's
   worktree.
4. **Claude integrates and publishes.** A finished Codex task is pushed to its `codex/...` branch with: the commits,
   the changed files, `node tools/build.mjs` and `node tools/check.mjs` results, and anything left over. Claude merges
   it, resolves conflicts, rebuilds `dist/lanternfall.html`, runs the checks on the combined game and publishes the
   preview. Codex never publishes the artifact and never merges into `main`.
5. **One task list.** Ownership lives in GitHub issues on CalSay/Lanternfall, labelled `owner:claude` or
   `owner:codex`, one issue per task. (Until the issues exist, this file is the list; read it from
   `origin/claude/elegant-johnson-m6k00u`, which Claude keeps current.)

## Shared files (both agents may touch, with these limits)

- `tools/check.mjs`: add new checks as your own sections (`if (section('name')) try {...}`), each in one block
  marked with the task id, placed just before the "removed systems (W2-C)" section. Don't restructure the file or
  edit other tasks' sections. Add a `WEIGHT` entry only for a slow browser section.
- `src/js/30-state.js` (`fresh()` defaults): add your own fields only. **Only Claude bumps the save key.** If a Codex
  change would break a v5 save, say so in the handoff and Claude bumps it on merge.
- `src/js/23n-data-notices.js`: add your rules at the end of `NOTICES` in a block marked with the task id. The
  quiet-start budget and the pop limits are Claude's.
- `dist/lanternfall.html`: generated. Commit it if you like, but Claude rebuilds it on every merge.
- `docs/ARCHITECTURE.md`: add rows for your new files; don't rewrite sections.
- `docs/coord/wave-log.md`: Claude only. Codex reports in the handoff and the issue.
- The online layer (raid, tavern online parts, leaderboard, `db`/`room`/`user`, shared doc shapes): nobody, unless
  the owner asks.

## Claude track (hero, combat, progression, the shell)

Owns: `24b-data-solo.js`, `59j-solo.js`, `75-solo-ui.js`, `55-training.js`, `75-training-ui.js`, `55-classes.js`,
`59e-class-combat.js`, `59f-trials.js`, `75-class-ui.js`, `24-data-classes.js`, `57e-constellations.js`,
`75-stars-ui.js`, `56-roster.js`, `56c-unlocks.js`, `76-create.js`, `55-party.js`, `75-party.js`,
`75-party-sheet.js`, combat (`59-combat.js`, `59a`, `59b`, `59g`, `59h`, `59i`, `21g-data-bosses.js`,
`21x-data-types.js`), `50-sim.js`, `40-rules.js`, the stage and hero art (`62-stage.js`, `61-anim.js`,
`64h-hero-sprites.js`, `21y-data-heroart.js`, `tools/heroart.mjs`), the shell and layout (`70-ui.js`,
`75-nav-ui.js`, `src/shell.html`, `src/styles/80-landscape.css`, `60-solo.css`), onboarding and notices policy
(`55-onboard.js`, `75-onboard-ui.js`, `55-goals.js`, `75-goals-ui.js`), `tools/sim.mjs`, the structure of
`tools/check.mjs`.

Queue, in order:
1. ~~Hero registry and unlock routes~~: moved to Codex as C9 (#10), with `56-roster.js`, `56c-unlocks.js`, `76-create.js` and the picker/switch code in `75-solo-ui.js` for that task.
2. **Ability trees and per-hero upgrade trees** (W4-B): about 10 abilities per hero, the star map per hero.
3. **Solo combat spec** (CB3): attack shapes, short ground patches, boss and elite heavy attacks.
4. **Ascension and subclasses** (W5-A) through the Proving; **Hallowed** from hero quests.
5. **Elowen's chapel**: boss items that unlock abilities.
6. **Art wiring** as it lands: gathering poses, Wren's death poses, enemies.
7. Owner layout decisions (menus panel, portrait, Next Up, Attack size).

## Codex track (camp, gatherers, economy side, tooling, story content)

Owns: gatherers (`57f-hands.js`, `21f-data-hands.js`, `74-ui-hands.js`, `src/styles/60-hands.css`), the camp
(`57-camp.js`, `55-hearth.js`, `75-camp-ui.js`, `63d-scenery-camp.js`), gathering (`55-gathering.js`,
`72-ui-gather.js`, `63c-scenery-gather.js`), the Tavern's offline parts (the hiring board and Tavern perks; not
`74-ui-tavern.js`'s online parts), save codes (`55-savecode.js`, `75-savecode-ui.js`, `tools/savecode.mjs`),
build tooling portability (`tools/build.mjs` and scripts, for Windows), story and NPC content (`55-story.js`,
`75-story-ui.js`, `21-stories.js`, `21b-stories-coast.js`, `21h-lore-hollow.js`, `21j-lore-omens.js`), background
art (`art/backgrounds/`).

Needs Claude's sign-off first (shared balance): `55-econ.js`, `21w-data-econ.js`, crafting (`55-crafting.js`,
`21-data-craft.js`, `41-items.js`, `75-craft-ui.js`). Propose changes in the handoff; Claude merges.

Queue, in order:
1. **C1 Gatherer engine gaps:** building Tents 3-10, flat 4-hour shifts, send again, recall, an Empty pack button,
   named gatherers arriving by their routes (docs/design/gatherers-2.md).
2. **C2 Gatherers in the camp scene:** they stand in camp; tap one to talk, then send them on a job.
3. **C3 Tavern perks:** new perks for the Tavern's upgrade tiers now that recruiting is gone (audit-1.md).
4. **C4 Trade runs:** gatherers go away to trade and come back with goods (replaces expeditions; solo-hero.md).
5. **C5 Save import and Windows tooling:** save code import/export polish; build and check scripts that run on
   Windows.
6. **C6 Campaign NPCs:** a design doc, then the data, for the story told through NPCs on the world map
   (gatherers, the tavern keep and others), replacing Bonds (solo-hero.md).
7. **C7 Mossy Hollow road fix** (art only, for when backgrounds resume).

## How Codex reports and gets new work

- **Tasks:** one GitHub issue each, labelled `owner:codex`: C1 #2, C2 #3, C3 #4, C4 #5, C5 #6, C6 #7, C7 #8, C8 #9, C9 hero registry #10, C10 M1 refining #11, C11 deeds merge #12, C12 perf #13, C13 playtest #14, C14 offline parity #15, C15 Deepwell solo #16 (Codex owns `57d-deepwell.js`, `59c-deepwell-combat.js`, `75-deepwell-ui.js` for it), C16 progress menus #17 (Codex owns the Almanac, Codex, Mastery, Bounties and Stats files for it), C17 accessibility #18, C18 docs and dead code #19.
- **Order (owner gave Codex extra capacity, 2026-09-30):** C2 → C4 → C8 → C9 → C10 → C11 → C14 → C15 → C16 → C12 → C17 → C13 → C18; C6 and C7 fill gaps while waiting on sign-offs.
- **Finished a task:** push the `codex/...` branch, then post the handoff (template below) as a comment on
  CalSay/Lanternfall#1. Claude is subscribed to that pull request, so the comment wakes Claude, who merges the
  branch, runs the checks, publishes the preview, closes the issue and replies there.
- **Then carry straight on** with the next open `owner:codex` issue in number order, branching from the newest
  checkpoint Claude posts in the reply (or, if none yet, from the tip of `origin/claude/elegant-johnson-m6k00u`).
  Don't wait for the merge unless the next task says "After: Cn" and Cn isn't merged yet.
- **Queue empty, or blocked:** comment on #1 ("Codex: queue empty" or "Codex: blocked on ..."). Claude opens new
  `owner:codex` issues and replies with the checkpoint to start from.
- **A question or a file you need that Claude owns:** comment on the task's issue and mention it on #1; work on
  something else meanwhile.

## Handoff template (Codex to Claude)

```
Task: C<n> <name>    Branch: codex/c<n>-<name>    Based on: <checkpoint sha>
Changed files: ...
New state fields (fresh() defaults): ...    Save-breaking: yes/no
node tools/build.mjs: ok    node tools/check.mjs: <n> runs, all pass (or failures with names)
Left over / needs Claude: ...
```

## Checkpoints

| Date | Commit | Notes |
|---|---|---|
| 2026-09-30 | the commit that added this file (see the wave log, "Two-agent split") | After the overnight clean-up: solo hero, Training, landscape, party code deleted, save key v5 |

## 2026-09-30 update: feature track moved to Codex (owner)

Codex now owns the remaining feature work: C19 abilities and upgrade trees (#20), C20 solo combat spec (#21), C21
Ascension, subclasses and Hallowed (#22), C22 Elowen's chapel (#23). Each issue lists the files that move with it.
Each is design first (owner and Claude sign-off), then build.

Claude keeps: integration, merges and publishing; design and balance sign-off; the shell and layout (`70-ui.js`,
`75-nav-ui.js`, landscape CSS, the action-bar layout and keys); stage drawing and hero art (`62-stage.js`,
`61-anim.js`, `64h-hero-sprites.js`, `tools/heroart.mjs`); onboarding and the notices policy; the check harness
structure; landscape check flakes; wiring new art.
