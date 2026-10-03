# Claude orchestration (proposal)

Drafted 2026-10-03 for the owner's review. Baseline: `claude/elegant-johnson-m6k00u` at `387fe2d`.
This is the Claude counterpart of [codex-orchestration.md](codex-orchestration.md) (on `codex/orchestration-architecture`).
Nothing here changes game code or existing config. It adds `.claude/agents/`, `.claude/skills/` and this page.

## Lanes (owner, 2026-10-03)

Codex is stronger at characters, abilities and character visuals. Claude is stronger at core mechanics and UI.

| Lane | Owns | Typical files |
|---|---|---|
| **Claude: mechanics** | rules, economy, crafting, gathering, camp, Hands, items, offline gains, combat engine and turn resolution, status effects, save state | `40-rules`, `41-items`, `50-sim`, `51-actions`, `55-econ`, `55-crafting`, `55-gathering`, `55-hearth`, `57-camp`, `57f-hands`, `59-combat`, `59a-status`, `59k-turn`, `30-state` |
| **Claude: UI** | shell, layout (landscape), navigation, panels, onboarding, goals, notices, toasts, settings, away summary, responsive and reduced motion | `70-ui`, `71`-`74` panels, `75-nav-ui`, `75-onboard-ui`, `75-goals-ui`, `75-craft-ui`, `75-away`, `src/shell.html`, `src/styles/*` |
| **Codex: characters** | heroes, classes, abilities, talents, stars (design and data), enemies and bosses (design and data), story and NPC content | `24-data-classes`, `24c-data-abilities`, `24d-data-turnfoes`, `24e/f`, `55-classes`, `56e-abilities`, `59e-class-combat`, `59b/h/i/l` enemy data, `55-story`, `21-stories*` |
| **Codex: visuals** | hero and enemy art, animation, ability and equipment art, backgrounds, art packs | `12*-art-*`, `13*-art-*`, `61-anim`, `64h-hero-sprites`, `64i/j`, `21y/z*` art data, `art/`, `tools/art/`, `tools/heroart.mjs` |

Seams, where one lane's code meets the other's. Resolve by contract, not by editing the other lane's files:

- **Ability kits (Codex) run on the combat engine (Claude).** Codex defines abilities as data in `24c`. Claude provides engine hooks (status, cooldowns, turn order). If a kit needs a new engine capability, Codex files the ask in its handoff with the exact behaviour; Claude builds the hook; Codex then uses it.
- **Ability and character screens (UI, Claude) show Codex's data.** Codex supplies fields and icon keys; Claude lays them out. UI never hardcodes ability text.
- **Stage drawing (`62-stage`) draws Codex's art.** Claude owns the drawing code; Codex owns the sprite data and rig timings. Neither retunes the other's half. The art freeze in `CLAUDE.md` still applies.
- **Enemies:** Codex designs and writes enemy data and art. Claude owns how enemies resolve in combat and how they pay out.
- **Balance:** Codex proposes numbers for kits and enemies. Claude measures with `tools/sim.mjs` and signs off. Neither relaxes a check.
- **Shared files** keep the rules in `two-agent-split.md`: small edits at extension points only.

Open question for the owner: `two-agent-split.md` (2026-09-30) currently gives Codex gatherers, the camp, gathering and save codes, and gives Claude hero art wiring (`62-stage`, `61-anim`, `64h`). The lanes above move those the other way. Until the owner confirms, the old table wins for those files.

## A request, start to finish

1. **Scope.** Turn the request into one bounded outcome with acceptance criteria. Check branch, base SHA, working tree and `docs/DECISIONS.md`. Read only the affected systems.
2. **Route.** Small task: do it in the main chat. Otherwise brief one worker (see routing). Add a second only for independent work. Never more than the coordinator plus two workers, and no worker spawns workers.
3. **Brief.** Outcome, base SHA, owned files, docs to read, acceptance criteria, checks, stopping condition. Reference docs by path; never paste history.
4. **Build in a worktree or branch** named `claude/<task>`. One coordinator makes shared-file edits and rebuilds `dist/`.
5. **Verify** with the `verify` skill: build, targeted checks, full checks once, sim for balance, browser for visible changes.
6. **Hand off** with the `handoff` skill. Cross-lane needs go in the note, addressed to the Codex lane, naming the file or data shape wanted.

## Model routing

The session default (Sonnet 5.5) does the work. Cheaper or stronger models are used only where the task shape calls for it.

| Task shape | Agent | Model |
|---|---|---|
| Run build, checks, perf; summarise output; grep and file lookups | `qa-runner` (read-only) | Haiku 4.5 |
| Implement mechanics from a clear spec | `mechanics-engineer` | Sonnet 5.5 |
| Implement or fix UI | `ui-engineer` | Sonnet 5.5 |
| Save-compat, balance sign-off, cross-system risk, a bug that survived one fix attempt, lane disputes | `systems-reviewer` (read-only) | Opus 5.5 |
| Ambiguous design with owner-facing trade-offs | main chat; escalate to Opus only if still unclear | Opus 5.5 |

Rules of thumb: start low, escalate on evidence. One failed attempt means stop and escalate with the failure output, not a blind retry. The agent files set the model in frontmatter, so the routing is enforced where the host supports it. This page cannot promise a fixed usage saving; measure it over a few tasks before claiming one.

Cost controls: no idle workers; no full-history copies; read role files and docs on demand; no duplicate reviewers; reviewers never edit; checks run once per wave with `--only` filters in between.

## Guardrails (from `CLAUDE.md`, restated for agents)

- Never push to `main`, another lane's branch, or the online layer; never publish the artifact or merge a PR without the owner.
- Never bump the save key; report save-breaking changes. New state gets `fresh()` or `registerState` defaults.
- Art freeze: do not wire, convert, retune or redraw art.
- Do not edit existing code or config outside your task's owned files without the owner's say-so.
- Report honestly: skipped browser sections are not passes.

## Proposed follow-ups (not done; need the owner's OK)

1. Add three lines to `CLAUDE.md` pointing at this page, the agents and the skills.
2. Update `two-agent-split.md` with the lane table above once confirmed, including which lane integrates and publishes (today: Claude).
3. A `.claude/settings.json` allowlist for `node tools/*.mjs` and read-only git, so workers stop prompting. Use the `fewer-permission-prompts` skill after a few real sessions.
4. A `PostToolUse`-style hook that runs `node tools/build.mjs` after edits under `src/`. Skip unless builds prove cheap enough.
