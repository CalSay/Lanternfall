# State when paused (2026-10-06 14:50 UTC, Cal asked all threads to pause)

Branch `claude/hero-progression-rework-3xh8jh`. Work in progress; not ready to merge.

## Done
- Design draft: `../hero-progression-build.md` (attributes, road-based XP, join at the road's level, bench XP, flag, save v6).
- Contract files: `src/js/24g-data-hero.js` (HERO_TUNE, ATTRS), `src/js/55-attributes.js` (attrOn, attrX, attrRel, attrAdd, attrReset...).
- Core integration (Sonnet builder, verified): 40-rules (lvlMult, smooth atkSteps, roadLv/roadZone/roadLevel/roadFoeXp/roadFights,
  xpNeed), 55-training (Training inert when attrOn; moves follow the level), 59k (U, counter, parry window), 59-combat (HP),
  59j (join lift, soloBenchXp), 50-sim (bench XP from killPack, level toast), 30-state (key v6), 55-savecode (S.attr, v6),
  tools/offline-parity.mjs and tools/savecode.mjs key. Flag `HERO_TUNE.training = 1` matches today's numbers exactly (checked).
- Sim: `tools/sim.mjs` --skill good|casual, --attrs even|might|focus|guard|vigour|w/x/y/z, attribute spender, telemetry.
- Red team done: `red-team.md`. Lead's proposed responses: `lead-response.md`.
- Old-game runs (seed 41, good 17 days x 3h, casual 60 days x 45 min): `old-game-runs.txt` (Pip runs were cut by the pause).

## In progress when paused (redo on resume)
- UI builder was stopped mid-way: `src/js/75-attributes-ui.js`, `src/styles/60-attributes.css`, edits to 75-training-ui,
  75-solo-ui, 55-goals, 55-onboard, 75-onboard-ui, 23n-data-notices, docs/GAME.md are partial. Re-check each and finish
  (it last saw a bottom sheet covering the Attributes view in its screenshot).
- Opus judge ruling on `lead-response.md` was stopped: re-run it.

## Next
1. Re-run the judge; apply the ruling in 55-attributes/24g (soft cap, Guard window cap, build-neutral heroAtk with
   attrRel('atk') in the turn profile, priced respec after the first, post-cap half levels, keep XP on lift).
2. Builder note: with the flag off a Lv 1 hero hits 2.5x today's (Training level = hero level). Use L - 1 for the moves.
3. tools/check.mjs: v5 -> v6 (lines 106, 216, 3853-3857, 5347, 7600, 7633, 7693, 7781), fixtures `tests/fixtures/save-*.json`
   "v": 6, perf.mjs:29, playtest.mjs:25, story-stats.mjs:16 keys; Training section runs with HERO_TUNE.training = 1; new
   attributes/road/join/bench section; W1-D switch test expects the join lift.
4. Tune `HERO_TUNE.road` and `fights` with `run.sh` (good + casual, 3 heroes, seed 41) against the bands in lead-response 3a;
   switch prediction at zone 20 (100+ fights per arm); health compare and `--write-baseline` with reasons.
5. Opus save/balance review, PR into claude/elegant-johnson-m6k00u, "@codex review", NEEDS CAL LABEL to the coordinator.
