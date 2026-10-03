# Production line (proposal)

Drafted 2026-10-03 for the owner's review. Baseline: `claude/elegant-johnson-m6k00u` at `387fe2d`; Codex's
orchestration workspace is `codex/orchestration-architecture` (latest commits 2026-10-02: role files, one-chat workflow,
Sprite Forge). This page builds on both: [codex-orchestration.md](codex-orchestration.md) (on that branch),
[two-agent-split.md](two-agent-split.md) and [claude-orchestration.md](claude-orchestration.md).

**Roles (owner, 2026-10-03).** Codex is the main worker. Claude organises and reviews it: intake, specs, task cards,
review, integration, publishing. Claude hands Codex one card at a time through GitHub (see the `delegate-codex` skill and section 8): one card in, one branch out,
then Claude reviews the diff and re-runs the checks itself.
This supersedes the lane table in `claude-orchestration.md`, which now only describes what Claude reviews and the rare things it builds.

**Status:** no card has been handed to Codex yet. Codex is busy; the first card is a draft.

## 1. The game as it is now

Source of truth is code, then [GAME.md](GAME.md) (on Codex's branch) and DECISIONS.md. Systems and where each is built:

| Line | What is live | Core files | Builder | Sign-off |
|---|---|---|---|---|
| Combat | Turn fights, Speed timeline, parry/dodge, statuses, 43 Stars, elites; real-time Deepwell, Provings, raid | `59k-turn`, `59-combat`, `59a-status`, `59l-zone-foes`, `57e-stars` | Codex | Claude (engine, perf) |
| Heroes | Wren, Tobin, Pip; 32-hero roster registry; 14 abilities each, talents, Training, classes and Proving | `24b/24c/24e`, `55-classes`, `56e`, `56-roster`, `59j` | Codex | Claude (balance) |
| World | Hollow and Sunken Coast in code; only Thorn Imp and Gloomjaw fully integrated; story and lantern | `22-data-regions`, `55-story`, `55-lantern`, `21*-lore` | Codex | Owner (story) |
| Gather and camp | Mining, wood, forage, Hunting; tools, Storehouse, Hands, trade runs, camp builds | `55-gathering`, `55-store`, `57f-hands`, `57-camp`, `55-hearth` | Codex | Claude (economy) |
| Craft and economy | Class gear, affixes, upgrades, uniques, gold curve | `55-crafting`, `41-items`, `21-data-craft`, `55-econ`, `21w-data-econ` | Codex proposes | **Claude signs off** |
| Meta | Bounties, mastery, Almanac, Codex, Deeds, Next Up | `55-bounties`, `55-mastery`, `55-almanac`, `58-deeds`, `55-goals` | Codex | Claude |
| Shell and UI | Five tabs, landscape layout, onboarding, notices, away report, settings | `70-ui`, `75-nav-ui`, `55-onboard`, `23n-data-notices`, `75-away`, `shell.html` | Claude | Owner |
| Visuals | Hero, enemy, icon, background and Hunting art packs, packed into data modules | `art/`, `tools/art/`, `tools/heroart.mjs`, `62-stage`, `61-anim`, `64*` | Codex | **Owner vets whole packs** |
| Saves and tools | Save key `lanternfall.save.v5`, save codes, check/sim/perf tools | `30-state`, `55-savecode`, `tools/*` | Claude | Claude only bumps the key |
| Online | World raid, Tavern online, presence | `52-raid`, `74-ui-raid`, `80-online` | nobody | Owner |

Not built yet (Season 1 gap, from GAME.md "Not in the game" and DECISIONS.md): 173 zone monsters plus Captains, Champions
and Elders; Regions 2-5 content; subclasses and Hallowed; hero quests; 29 more heroes' kits; grades 6-15, refining chains,
sockets, enchanting and the Armoury; world map; campaign NPCs; equipment art on heroes; fishing and the Kitchen;
challenge modes; accessibility and audio mixer; shareable camp card. Never describe these as live.

## 2. The line: seven stages

Every change moves through the same stages. Skipping a stage needs an owner reason, recorded on the task.

| # | Stage | Who | Output | Gate to leave |
|---|---|---|---|---|
| 1 | **Intake** | Claude | A task card on a GitHub issue (template below), labelled `owner:codex` or `owner:claude` | Owner request or an owner-approved roadmap item |
| 2 | **Spec** | Claude (Codex for design-first items) | Acceptance criteria, owned files, class (A-F), risk, dependencies, base SHA | Owner sign-off if the card says "owner decision" |
| 3 | **Build** | Codex, handed the card through GitHub, `codex/<id>-<name>`, own worktree | Commits, new state defaults, own check section | `node tools/build.mjs` ok |
| 4 | **Verify** | Codex, then `qa-runner` | Full `check.mjs` result with skips counted, sim run for balance, browser look for UI | No failing section; skips stated |
| 5 | **Review** | Claude `systems-reviewer` (read-only) | Verdict on save compat, active/away parity, economy, perf, lane and shared-file rules | No blocking finding |
| 6 | **Integrate** | Claude | Merge into the accumulation branch, rebuild `dist/`, full check, `perf.mjs --quick` after each merge wave | Green on the combined game |
| 7 | **Release and record** | Claude, owner for publish | Preview artifact; GAME.md and DECISIONS.md updated; issue closed | Owner plays and approves; the artifact is published only on their word |

Work classes pick the route:

| Class | Examples | Route notes |
|---|---|---|
| A Content | enemies, heroes' kits, items, story, region data | Data-first, uses extension API. Codex designs, builds, tests. Review light unless it moves balance. |
| B Mechanic | combat rules, crafting chains, sockets, Armoury, fishing | Spec has a written rule, edge cases, save impact. Full review (stage 5). |
| C UI | menus, map, dialogue, accessibility | Claude specs layout; Codex builds; browser check in landscape, portrait and reduced motion. |
| D Art pack | hero, enemy, backgrounds, equipment | Art director brief, one bounded draft, whole pack, contact sheet, **owner vets before any wiring**. Art freeze applies. |
| E Balance | pacing, costs, power curve | Measure with `tools/sim.mjs` on the real mode; record SHA, hero, seed, policy. Claude signs off. |
| F Tooling and docs | checks, perf, build, docs | Small, reviewed by Claude, integrated quickly. |

## 3. Adding future features

A new feature is one column down the table, never a special case.

1. **Place it.** Pick the class (A-F) and the line (section 1). If it needs a new engine capability, split the task: a Claude (or Codex) engine hook first, then the content that uses it.
2. **Write the card.** Outcome in player words, acceptance criteria that can be measured, files owned, shared files touched, new state, dependencies ("after: Cn"), checks, stopping condition.
3. **Build as its own files** using the extension API (`55-<name>.js`, `75-<name>-ui.js`, `60-<name>.css`) and `registerState`, `addModifier`, `onTick`, events. Shared files get small edits at extension points only.
4. **Add a check section** marked with the task id, before "removed systems (W2-C)".
5. **Record it.** One row in ARCHITECTURE.md, a line in GAME.md when live, a DECISIONS.md entry only when the owner decided something.

Standing constraints on every card: solo, active combat only, no prestige, no pay-to-win, cosmetics earned, original art, art freeze, online layer untouched, save key bumped only by Claude.

## 4. Backlog order (proposal, for the owner to reorder)

Reconcile with the open `owner:codex` issues (#7 to #27, last updated 2026-10-01; several have branches on `origin` such as
`codex/c19-abilities`, `codex/c22-enemies`, `codex/c24-hunting`, so confirm what is merged before re-queuing). Suggested order, each stage a gated milestone:

1. **Close Region 1 (M1):** C22 Hollow foes and Captains/Champions/Fenmother, refining chains (C10), Hunting finish, enemy profiles (C25), Elowen's chapel (C23). Class B and A, Codex.
2. **Hero depth:** Ascension and subclasses, Hallowed, hero quests, Training overhaul. Class B, Codex builds, Claude signs off balance.
3. **Craft depth:** grades 6-15, sockets, enchanting, Armoury, Tannery. Class B and E. Economy changes are proposals; Claude signs off.
4. **World and story:** world map, campaign NPCs (C6), story C28, Region 2 (Coast) content. Class A and C, owner reviews story.
5. **Art programme (C26)** runs in parallel: one pack in review at a time, owner vets whole packs. Class D.
6. **Regions 3-5, remaining heroes, Season 1 close:** Voice fight, 32 heroes, accessibility, audio, fishing, Kitchen, challenge modes, camp card. Then Phase 2 (TypeScript, Vite, Capacitor) from ROADMAP.md.

## 5. Claude builds directly

Rarely. Codex builds by default; Claude edits only these, and only when a card for Codex would cost more than the edit: the shell and layout (`70-ui`, `75-nav-ui`, `shell.html`, landscape CSS); onboarding and notices policy;
engine hooks Codex asks for (`59k-turn`, `59a-status`); save state and the save key; `tools/check.mjs` structure, `sim.mjs`, `perf.mjs`; integration and `dist/`.
Everything else goes to a Codex card, even when Claude could do it faster, unless the owner says otherwise.

## 6. Templates

**Task card (Claude to Codex)**
```
Task: <id> <name> (#issue)   Class: A-F   Line: <section 1 row>   Base: <sha>   Branch: codex/<id>-<name>
Outcome (player words): ...
Acceptance (measurable): ...
Owned files: ...    Shared files touched (extension point): ...
New state: ...    Save impact: none | needs key bump (Claude)
After: <tasks>    Owner decision needed: yes/no
Checks: build, check --only="...", sim (seed, policy, hero) | browser | perf
Stop when: ...
```
**Handoff (Codex to Claude):** the existing template in `two-agent-split.md`. Claude replies with the next checkpoint SHA.

## 7. Cadence and cost

- Steady mode: at most three agents at once (coordinator plus two), no recursive delegation. Start with one worker.
- Claude's routing: `qa-runner` (Haiku) for checks, `systems-reviewer` (Opus) for stage 5, Sonnet for the rest. Codex routes by its own role files; use the cheapest capable worker for mechanical edits and escalate on evidence.
- Full `check.mjs` once per merge wave, `perf.mjs --quick` after each wave, `--only` filters in between.
- Wave = a small set of independent cards merged together. Claude posts the new checkpoint SHA on #1 after each wave.
- Weekly: Claude reconciles issues against `GAME.md`, closes finished cards and flags stale ones. No timers or schedules start without the owner's OK.

## 8. Driving Codex through GitHub

Codex works in the owner's own Codex session and reads GitHub, so the hand-off is the existing protocol: one `owner:codex`
issue per card, a `codex/<id>-<name>` branch from a pushed base SHA, a one-line note on PR #1, and Codex's handoff comment back.
Claude then reviews the diff, re-runs build and checks itself, and answers on #1 (details: `.claude/skills/delegate-codex/SKILL.md`).

Rules: never interrupt a Codex task in progress; nothing is created for Codex or posted on #1 until the owner says go for that card;
drafts wait in `docs/coord/cards/`. The first draft is `cards/C-first-trial.md`. The Codex CLI route (`codex exec`) is on hold: it
needs an API key and an allowed OpenAI host in this environment. If the owner wants it later, store the key as an environment variable,
allow `api.openai.com`, and add `npm install -g @openai/codex` to the setup script.

## 9. Open questions for the owner

1. Confirm the backlog order in section 4, and whether the C26 art programme keeps running in parallel.
2. Claude stays integrator and publisher, with you publishing the artifact. Correct?
3. Should the issue list (#7-#27) be refreshed against the code now? Claude can do it read-only.
