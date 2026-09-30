# Codex local recovery: paused 30 September 2026

The owner requested finishing active tasks, then imposed a five-minute wrap-up. Codex is paused. Do not resume development, agents or scheduled work until the owner asks. This note preserves the failed cloud session recovery and local follow-up.

## Start here when the owner resumes

Read AGENTS.md, CLAUDE.md and docs/coord/two-agent-split.md from Claude's latest remote checkpoint. Read the latest comments on https://github.com/CalSay/Lanternfall/pull/1 before branching. GitHub issues labelled owner:codex are the work orders; each issue contains approvals and file ownership. Claude integrates, runs combined checks, publishes and closes issues. Codex pushes only codex branches and posts completion handoffs to PR #1. Questions go on the task issue with a mention on PR #1. Suggestions inside and outside scope are authorised, including code, build, balance, story and content; proposals are not approval to change shared balance.

The original cloud chat is Set up Lanternfall, thread 01a0f2b8-5327-7648-b8d0-20e2c7d8f07d, host durable. Its runtime failed, but its transcript was recovered. Do not restart it alongside local workers. Three local agents are stopped after this wrap-up.

## Completed and pushed

- C8 traits: codex/c8-trait-balance @ ceeb63a. Build and full suite 1749 pass, zero failures/skipped browser sections. Claude merged it and announced checkpoint 6bc699e. PR handoff: https://github.com/CalSay/Lanternfall/pull/1#issuecomment-5914954925
- C11 Deeds: codex/c11-deeds-merge @ 5e6b1b1 (implementation e0230cd), based c3c2cf3. Build and full suite 1807 pass, zero failures/skipped browser sections. Independent96-value old/new comparisons pass. All21 old achievements convert quietly to Deeds, preserving rewards and dates; v5 key unchanged. Claude-approved shared fixture helper updates fix11 obsolete comparisons while verifying conversion and every unrelated field. Ready for integration: https://github.com/CalSay/Lanternfall/pull/1#issuecomment-5915272874

## Active work preserved for validation / handoff

- C9 hero registry: codex/c9-hero-registry, based c3c2cf3. Recovered32cards/routes, three playable starters and coming-soon guards, save-code boundary validator, approved old selector changes. Build/core and24 real-browser assertions pass. Root caught and agent fixed an undefined H.range/H.weapon read for stub cards. Full suite was running at wrap-up; consult final PR #1 pause comment for final hash/result. Remaining unpriced routes stay explicitly gated, not invented balance. Review Cass's illustrative900-foe fee versus prose and Anselm's future route before changing them.
- C23 bulk salvage: codex/c23-bulk-salvage @ 0e916c2, based bccdd08. Pushed source is approved by issue24. Build, existing crafting checks,10 C23 core and24 real-browser assertions pass at740x360 and360x740. Full suite NOT RUN due to owner time limit: run it before a completion handoff/merge. Root review fixed live gathering constantly invalidating confirmation; collectible-capacity signature now preserves the same confirmation button while returns still fit. Files: new salvageItems only in51-actions, bag UI75-craft-ui, bag CSS60-craft, own check sections. No save/balance changes. Generated dist excluded.

## Earlier cloud-only work safely recovered to remote WIP branches

These are NOT completion handoffs. Do not merge as finished tasks.

- C12: codex/c12-perf @13af1fd. Serializes procedural gathering-scene warmup to avoid the three-scene cache evicting four concurrent warmups. Source, browser regression and historical report recovered. Syntax checked; local browser/performance/full validation pending. Original cloud raw profiles unavailable; historical measurements explicitly labelled.
- C14: codex/c14-offline-parity @e897afa. Removes duplicate gather stats accounting and improves away report material families/camp/Hans/trade summaries; adds tools/offline-parity.mjs. Local build and focused accounting checks pass. Browser/full and source-by-source parity matrix pending. No50-sim changes. Integrate C11's separate55-stats edit carefully.
- C15: codex/c15-deepwell-solo @123b0fd. Unfinished design draft docs/design/deepwell-solo.md recovered from failed cloud write. Needs fresh source audit, C19/C20 reconciliation and current-solo measurements. Not approved gameplay work.
- C6: codex/c6-campaign-npcs @4fbc218. Design updated with owner decisions, existing people first and dialogue-modal proposal. Build gate after M1 remains. Overlay shell approval pending.
- C20: codex/c20-combat @bb90fa8. Design-only proposal, still awaiting owner and Claude sign-off. No Stage2.
- C19: no written cloud draft was found; research only. Do not claim recovery of a document.

## C10 pending proposal, no source changes

Issue11 has the full audit and latest gate decisions. Claude approved dropping Tent3's Hearth4 requirement: Hands/Hearth2 plus the highest normal-profile zone reached on day1 (zone14 if measurements support it), retain1h build, prove day1 affordability. Tent4 should help the Fenmother push: Hearth4 plus aboutzone30, same-value grade3 inputs, targetday5-7. Put both with early Hearth2/Tam numbers in ONE proposal table for Claude sign-off before balance edits. Existing M1 targets: stations1/5/10/15minutes, Tam sent by60minutes, Tent3day1, Hearth3day2, Hearth4day4-5, Fenmotherday7-10. No Region1 refining. Simulator camp/hiring/downconversion policy exceptions only; no combat/Training policy changes.

## Local locations and tools

- C23: C:/Users/Admin/.codex/worktrees/game-review/Lanternfall
- C9: C:/Users/Admin/.codex/worktrees/c1-gatherer-ui/Lanternfall
- C11: C:/Users/Admin/.codex/worktrees/c1-gatherer-checks/Lanternfall
- This note: C:/Users/Admin/.codex/worktrees/cloud-recovery-docs/Lanternfall
- Original checkout: C:/Users/Admin/Documents/GitHub/Lanternfall; do not switch/reset Claude's checkout.
- Node24, npm.cmd/npx.cmd. LF_PLAYWRIGHT=C:/Users/Admin/.codex/worktrees/game-review/Lanternfall/node_modules/playwright. Managed Chromium installed. Avoid concurrent full browser suites on this Windows host; --jobs=2 took about6minutes. Run node tools/build.mjs before node tools/check.mjs.
- Python: C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe (Windows python alias is unsuitable).
- Temp logs and cloud recovery JSON/scripts are under C:/Users/Admin/AppData/Local/Temp, names lanternfall-cloud-*, lanternfall-c12-*, lanternfall-c14-*, c11-local-full-final.log. Remote branches are the durable source of truth.

Only Claude changes the save key (currently lanternfall.save.v5), merges main or publishes. Do not start paused agents or a fresh queue task without the owner's resume.