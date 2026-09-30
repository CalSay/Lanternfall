# C14 offline accounting recovery

Recovered and rebased onto checkpoint `3c0208e` (C12 merged) on 30 September 2026. The implementation is ready for coordinator integration; combat parity remains a separate C20 concern.

The recovery corrects hero harvest accounting and reports, worker/trade/build away lines, named Tavern arrivals, all-family material display, hero-cap copy and offline notices. `tools/offline-parity.mjs` compares matched live/away credited durations while retaining full wall-clock schedule snapshots; it reports raw and boost-normalized hero yield, workers, queues, trade, Camp, Tavern and Well Rested separately. Its Auto fixture explicitly calls `soloSetAuto(true)`.

The approved mastery correction awards tool mastery during gathering-only away simulation, uses boundary-batched time steps rounded to preserve the former one-second reference behavior, and prevents the end hook from awarding the same interval again. It does not change combat simulation, away caps, rare finds or the offline yield boost. The 24-hour maximum-cap away calculation fell from 2.83 s before batching to 2.78 ms after batching on Node 24.19.0; the default four-hour call measured 5.74 ms.

Matched live/away parity checks passed at 30m, 2h, 4h, 8h and 24h, plus cap and repeated-claim cases. Live-minus-away mastery timing was -0.40s, -0.50s, -1.00s, -0.90s and 0.00s respectively. Boost-normalized yield drift was +0.09%, +0.20%, -1.28%, -1.96% and -2.25%. At the cap both fixtures reached `[20, 0]`; a zero-time second claim added nothing. Combat rows remain diagnostic and C20-dependent.

Validation on this branch: Node 24.19.0 build passed; focused C14 accounting and Hands checks passed; `git diff --check` passed. Full `tools/check.mjs --jobs=2 --times` passed with 2,003 assertions and zero browser sections skipped. The complete latest run log is `%TEMP%/lanternfall-c14-current-full-rerun.log`.

The notices unread-cap browser check was variable on this host. An earlier full run had one W1-B max-unread failure (6); the isolated current branch run at seed 7 passed, while a clean `3c0208e` baseline at seed 7 hit the same condition at 7. A later fixed-seed full run and the latest unseeded full run passed. Treat these observations as a non-deterministic notice flake; do not claim the full suite establishes deterministic stability.

The existing Hands test was updated only to match the approved `Gatherers` report text. Its exact haul-log and final-stock equality assertions remain. Claude approved the narrow matcher update in issue #15 comment `5919697902` and PR #1 comment `5919695504`.

Changed source and check areas: `23n-data-notices.js`, `50-sim.js`, `55-stats.js`, `55-tools.js`, `57-camp.js`, `57f-hands.js`, `57k-trade.js`, `75-away.js`, `tools/check.mjs`, and the offline parity runner/documentation. The change adds no save schema or migration. Generated `dist/lanternfall.html` is not committed.
