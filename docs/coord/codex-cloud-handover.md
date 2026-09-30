# Codex cloud handover — 30 September 2026

## Mission and authority

Continue as the owner's Codex coordinator for CalSay/Lanternfall, alongside Claude, who is lead developer and integration/publishing coordinator. The owner explicitly authorises delegating work to subagents and selecting their models to suit the work. Use separate worktrees or strictly disjoint file ownership; the previous local team used an Astra coordinator/engine/checks and Sol UI worker. Recreate agents as needed; live local agents and their context do not transfer.

The owner also explicitly invites suggestions both INSIDE AND OUTSIDE current scope: code quality, bugs, efficiency, build/tooling, balance, player experience, project scope, game design, story, content, art and pacing. Send useful observations to Claude with evidence, player impact and a concrete recommendation. Keep suggestions separate from task handoffs; do not silently implement scope expansion or changes to Claude-owned files. Ask Claude for the appropriate work order/ownership or balance approval. The owner remains the decision-maker for owner-gated content.

Local implementation has stopped for this handover. Do not run two coordinators against the same queue. No cloud task has been created by this handover itself.

## First actions

1. Read `AGENTS.md`, `CLAUDE.md`, and the LATEST `docs/coord/two-agent-split.md` from `origin/claude/elegant-johnson-m6k00u`. Read `docs/ARCHITECTURE.md` and relevant design docs before edits.
2. Fetch origin; read PR #1's latest comments and each issue's full body AND comments. Those comments contain approved changes and exceptions newer than the split document.
3. Obtain the newest checkpoint Claude posts, or the remote Claude branch tip if no newer explicit checkpoint exists. NEVER start from `main`, which is far behind.
4. Resume C5's handoff/integration, then the C2 repair, then C4 and C8. Preserve the checkpointed work below rather than rebuilding it from scratch.

At handover preparation, the last explicitly announced game checkpoint is `1d17382ee638e36e356e267b3dd2721f5010ae09` (C1+C3 merged). The fetched remote tip is `d86d2e9ffbfa647f76d2e3eed7a5f7610ba66ff1`: only coordination docs changed after 1d17382; it records C9-C13 and C2 held back. Neither C2 nor C4 nor C5 was merged at this snapshot. Recheck rather than relying on this snapshot forever.

## Find work orders and communicate with Claude

Repository: https://github.com/CalSay/Lanternfall
Work queue: https://github.com/CalSay/Lanternfall/issues?q=is%3Aissue+is%3Aopen+label%3Aowner%3Acodex
Coordination inbox / handoffs: https://github.com/CalSay/Lanternfall/pull/1

Useful GitHub CLI commands (authenticate using the cloud environment's own supported credentials; never copy local credentials):

```sh
gh issue list --repo CalSay/Lanternfall --state open --label owner:codex --limit 100
gh issue view 6 --repo CalSay/Lanternfall --comments
gh pr view 1 --repo CalSay/Lanternfall --comments
git fetch origin
```

- Claude subscribes to PR #1. A handoff comment there wakes its session. Push the task branch FIRST, then comment with the exact branch/head, base, changed files, state/save changes, test results and leftovers. This is the agreed inbox; no separate task PR is required unless Claude asks.
- Task questions and proposals go on the task ISSUE. Then post a short mention/link on PR #1 so Claude sees them.
- Claude merges, rebuilds, checks the combined game, updates the preview, closes the issue and replies on #1 with the next checkpoint. Codex never closes the task as a substitute for Claude's integration.
- Carry on to the next independent open issue without waiting for a merge. Respect `After: Cn` dependencies, approval gates, and newer priority instructions. Normally issue-number order; currently Claude explicitly prioritised C5 -> C2 repair -> C4 -> C8 -> #10 onward. C6/C7 remain open but gated; confirm their scheduling when relevant.
- If no work remains, comment `Codex: queue empty` on #1. If blocked, comment `Codex: blocked on ...` with the exact cause and what is needed. Work on independent authorised tasks while waiting.
- Use UTF-8 body files with `gh issue comment ... --body-file ...` / `gh pr comment ... --body-file ...` for multiline comments.

Handoff template:

```text
Task: C<n> <name> (#issue)
Branch: codex/...    Head: <full sha>    Based on: <checkpoint>
Changed files: ...
New state fields / defaults: ...    Save-breaking: yes/no
node tools/build.mjs: ...
node tools/check.mjs: exact executed/passed/failed/skipped results
Manual/browser validation: ...
Left over / needs Claude: ...
```

Never describe skipped browser tests as passed. Record actual failures and environmental limits.

## Working boundaries

- Only push `codex/...` branches. Never push Claude's branch or main; never merge into main or publish the artifact.
- Claude's integration ownership overrides the older generic CLAUDE.md sentence saying workers never push: the owner and split doc explicitly authorise Codex task branch pushes and handoff comments.
- Only Claude changes the save key. Current key is `lanternfall.save.v5`. No online layer changes unless explicitly authorised.
- Shared checks: own task blocks before `removed systems (W2-C)`; do not rewrite existing sections except explicit C5/C2 exceptions below. Append notice rules; architecture doc new-file rows only. Wave log is Claude-owned.
- Economy/crafting balance changes need Claude sign-off. C6 requires owner review before story data/UI. Background wiring is paused.
- Preserve the single self-contained HTML artifact and in-page confirmations. Build output is generated; Claude rebuilds on merge. Do not publish this handover's local generated artifact.

## Branch checkpoints (all pushed for cloud recovery)

| Branch | Head before this handover doc | Meaning |
|---|---|---|
| `codex/c5-saves-windows` | `1f5091b` | Integrated C5 production, tooling and tests; this handover doc is committed on top |
| `codex/c5-save-ui` | `edb1b42` | Original UI worker checkpoint; already integrated into C5 |
| `codex/c5-tooling` | `52c589a` | Tooling/checks worker checkpoint, includes test copies of codec/UI; already integrated into C5 |
| `codex/c2-camp-gatherers` | `b6a29d3` | C2 initial implementation; NOT merged, needs fixes |
| `codex/c4-trade-runs` | `d3b9e936fb6f96e796e6b074b5c197449e787319` | C4 core and design docs; includes original C2 merge, not C5 |
| `codex/c4-trade-ui` | `5fcce850fc66fd72d7e0c706669d0810848c0387` | C4 UI only; not integrated into C4 root branch |
| `codex/c4-trade-checks` | `b7dc1da09427ae2cb6e931f365b2d7277b58ffa3` | C4 test checkpoint; includes test dependencies; cherry-pick its test commit, not entire history blindly |

C1 `codex/c1-gatherer-gaps` (`60900e8`) and C3 `codex/c3-tavern-perks` (`a14274d`) were pushed and merged by Claude. Issues #2 and #4 are closed. Older worker branches contain no unique unfinished work needed beyond the checkpoints above.

## C5 (#6): implemented; hand off honestly, then fix C2

Base: 1d17382. Code/test head: 1f5091b. Source changes:
`src/js/55-savecode.js`, `src/js/75-savecode-ui.js`, `tools/savecode.mjs`, `tools/check.mjs`, `tools/lib/browser.mjs` (new), `tools/site.mjs`, `tools/perf.mjs`, `package.json`, `package-lock.json`, `tools/README.md`.

- Pure strict save validation before storage/load: canonical Base64, strict UTF-8, bounded size/depth/node count, v5 schema and current item/skill/camp/gatherer shapes; no mutation. Missing optional feature defaults and legitimate fractional/negative sentinel values are allowed. CLI validates JSON before loading into core. Selected hero in preview.
- Import captures a recovery snapshot, verifies candidate bytes, suppresses only game KEY writes while reload is pending, and provides verified retry/cancel restore plus copy-backup recovery. No live loadSave fallback that leaves cached state stale. Other storage keys keep working.
- Portable fileURLToPath paths, shared browser discovery, explicit authoritative LF_PLAYWRIGHT/LF_CHROMIUM overrides, managed Chromium/system Windows browser/Linux fallback paths. Discovery does not install software. Browser skip counts are explicit and aggregate across shards.
- Pinned Playwright 1.63.0 with lockfile and portable documented scripts. No fresh state fields; save key unchanged. Existing valid v5 saves should remain accepted. Invalid saves fail closed.
- Independent codec and import UI reviews found no material blocker. New focused portability assertions (15) and import UI/recovery assertions (23) passed, alongside codec tests including real camp/gear/training/queued-shift fixtures.

Validation on Windows Node 24.16, managed Playwright Chromium:
- `node tools/build.mjs`: PASS, 2421.8 KB.
- Final full default sharded `node tools/check.mjs`: 1,523 passing assertions, ONE failure, ZERO skipped browser sections.
- Exact failure: `1280x720: every guide step's target is on screen and on top ...` for `tool|forge|make`, detail `{ "ok": false, "why": "no target" }` (24 states). Do not misreport this final failure as merely marker drift. Investigate fixture/target availability as well as movement in C2.
- Earlier full baseline on the same C1+C3+C5 tree, WITHOUT C2/C4, had two guide-ring `marked:false` failures: bench at 844x390 and tool at 1280x720, with zero browser skips. This establishes a pre-existing/intermittent guide family problem, but the final missing-target symptom still needs diagnosis. No other failures in those runs.
- Real in-app browser smoke 740x360: Wren level 3 -> imported Pip level 7, real reload and second reload preserve Pip; invalid LF1 code shows error; no horizontal overflow or console errors. Recovery/lifecycle fault paths tested with actual import/boot handlers in harness.
- Local full log was `%TEMP%/lanternfall-c5-final-check.log`; it is not needed for recovery and not present in cloud. The exact summary above is the retained evidence.

Claude approved C5 shared-tooling changes: https://github.com/CalSay/Lanternfall/issues/6#issuecomment-5912576252
Baseline report: https://github.com/CalSay/Lanternfall/issues/6#issuecomment-5912815736

Cloud setup, from C5 branch:
```sh
npm ci
npx playwright install --with-deps chromium
node tools/build.mjs
node tools/check.mjs
```
Use environment-appropriate browser installation permissions; if a preinstalled browser is needed, set the documented overrides. Zero skipped browser sections is required for normal completion. Do not relax checks/perf budgets to obtain a green result.

## C2 (#3): approved repair, not yet started

Initial branch implements camp sprites/tap targets, conversation/job picker, crew-first Tavern list, status strip and 41 checks. Claude tried a Linux merge, found failures, backed it out and did NOT push it.

Repair approvals:
- Priority and minimal landscape fit-helper edit: https://github.com/CalSay/Lanternfall/pull/1#issuecomment-5912556038
- `src/js/75-onboard-ui.js` ownership exception: https://github.com/CalSay/Lanternfall/issues/3#issuecomment-5912702786

Plan:
1. Incorporate C5 and latest Claude checkpoint into C2 so full browser checks run.
2. The crew-first list moves `#sec-hands` below the viewport. Existing landscape sideways-fit helper must scroll the anchor into view before measuring (`scrollIntoView({block:'nearest'})`); retain the actual fit predicates.
3. Fix menu guide ring tracking with a passive `#panels` scroll listener and cheap active-target rect comparison on the existing 250ms tick. Preserve cached stage-target behavior. Avoid scrolling the user back to the target on ordinary scroll/layout drift; only initial target/view changes should bring it into view.
4. Add regression coverage at 740x360 and 844x390: scroll while target remains visible, content reflow above the SAME target node, ring within ~2px; also preserve stage caching. Existing hint static check expects the early-return cache structure.
5. Diagnose the C5 final `tool|forge|make` missing-target symptom too; do not assume a ring-only patch fixes it.
6. Build and run the full browser suite with zero skips, then push C2 and re-handoff. Do not rely on the earlier serial run that skipped browsers.

Potential delegation: UI worker owns only 75-onboard-ui; checks worker owns approved fit helper/new C2 checks; coordinator integrates/reviews. No repair commits exist yet.

## C4 (#5): checkpointed mid-integration

Read approved design: https://github.com/CalSay/Lanternfall/issues/5#issuecomment-5912281073

Approved: handsOpen + Tavern level 2, one idle worker, 2 hours, up to 5,000 units/3 cargo lines of profession-supported unlocked grade 1-3 goods, zero additional fee. GOLD ONLY; no trophy conversion before M1. Deterministic weekly wanted/glut prices, frozen quote on send, exactly-once live/offline settlement. No XP/find/rarity/free Tam shift; no queues. Recall original cargo before completion (overflow waits in pack); overdue completion pays gold. Repeat uses a fresh quote and preserves prior gathering assignment.

Root/core branch has new `21o-data-trade.js`, `57k-trade.js`, narrow `57f-hands.js` hooks, design §15 in gatherers-2 and architecture rows. Registered state `trade:{v:1,trips:0,sold:0,gold:0,log:[]}` (verify actual defaults in source). Quote/start atomic at weekly boundary; corrupted quote bounds and safe credit checks; invalid jobs refund valid cargo without minting gold; trade-refund pack marker prevents inflating gather stats. C2 conversation role fix included.

UI checkpoint 5fcce85 changes `74-ui-hands.js`, adds `74b-ui-trade.js`; separate stable cargo section and explicit review/send. Root caught/fixed quote.gold display and focus churn during previous review. Still MUST merge C2 and add Trade action to Camp conversation.

Tests checkpoint b7dc1da adds own C4 section (90 focused assertions passed against core through d3b9e93 plus UI5fcce85). Root has NOT integrated these UI/check commits. Review history before cherry-picking; worker test branch carries dependencies copied for testing. Full build/browser integration NOT done.

Next: finish C2; update C4 with latest C2/C5/Claude; cherry-pick UI and tests appropriately; resolve shared check insertion preserving all sections; add Camp Trade action; test C5 codec round-trip of active trade jobs; full browser and economy validation; hand off. Current C5 validator intentionally rejects active trade saves if the trade module is absent.

Diagnostic already sent, do not duplicate: https://github.com/CalSay/Lanternfall/issues/5#issuecomment-5912505700 . Tam stock-funded 5,000 Pine trade = 1,500 gold/2h; raw gross gold/hour comparison is misleading because it consumes existing cargo. Including production time gives ~82 gold/hour in that fixture. Approved prices retained; no fabricated parity assertion.

## Remaining queue and gates

| Issue | Task / next action |
|---|---|
| #9 C8 | Trait balance: propose numbers for Claude sign-off first. Homebody +40% currently dominates. Preserve old IDs/readability; model Early Riser send-time snapshots across queued shifts, Friendly multiplicative effects, and utility traits separately from raw yield. No final numbers committed. |
| #10 C9 | Hero registry/unlock routes moved to Codex: 56-roster,56c-unlocks,76-create and picker/switch ONLY in75-solo-ui; action bar remains Claude's. 32 entries, incomplete kits stay Coming soon. Read issue's specific ownership. |
| #11 C10 | Region 1 M1 refining loop: proposal and Claude balance sign-off BEFORE touching crafting/economy. Audit missing material chains and use existing sim without editing Claude-owned sim. |
| #12 C11 | Merge old achievements into Deeds. Preserve before/after total bonuses; inspect notice/state dependencies, save-key decision remains Claude's. |
| #13 C12 | Perf pass after C5. Profile real bottlenecks; propose changes in Claude-owned render files, do not edit without exception or relax budgets. |
| #14 C13 | Playtest report, QA only, after C5 AND C2 MERGED. Landscape+desktop, three heroes, first hour and late fixture. File P0/P1 issues with ownership; don't implement fixes in report task. |
| #7 C6 | Campaign NPC design doc ONLY until owner review and M1 allows data. No new NPC/tier/profession implementation now. Canon matters; short warm/dry dialogue, earned reveals, persistent story readiness. |
| #8 C7 | Mossy Hollow road art, backgrounds paused. Check current authorisation before resuming; do not wire assets. Raster edits require imagegen skill/tool. |

Read the issues rather than treating this table as complete acceptance criteria.

Broader feedback already accepted by Claude: crew-first UI became C2; trait balance became C8; Region 1 end-to-end milestone became M1/C10. See https://github.com/CalSay/Lanternfall/pull/1#issuecomment-5911901008 . Continue suggesting improvements inside and outside scope with the same evidence-based approach.
