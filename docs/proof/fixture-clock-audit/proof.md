# fixture-clock-audit: no check that loads a saved fixture depends on today's date

Tooling only (tools/check.mjs). Nothing a player sees changes.

## What changed

- `loadCore` in tools/check.mjs: a save whose `last` is a fixture's own saved time (any file in tests/fixtures or
  tests/proof-fixtures) loads with the game's clock moved to `FIXTURE_CLOCK_AFTER` (60 s) past that `last`. The clock still
  runs, and `new Date()` follows it as well as `Date.now()`. A load whose prelude sets `Date.now` keeps its own clock (#441's
  'next tier gate' pin is one); a load whose `last` was restamped (`save.last = Date.now()`) is not a fixture time and runs on today.
- Browser contexts (`newContext`) do the same for pages: the page's `Date` runs from the fixture's `last` + 60 s, keeps that clock
  across reloads and tabs while the save's `last` sits nearer it than today (`lanternfall.test.clock`), and gives way to a
  section's own `page.clock.install`. Core loads do the same for a save a pinned game wrote (a reload in the same check).
- New section `fixture-clock` (the guard): all 57 fixtures load with today at `last` + 8 days and `last` + 32 days, each reading
  the clock at `last` + 60 s with the same state (timestamps aside). With the pin off, the same pairs differ for all 57, so the
  guard can see drift. A page loads save-tier-gate.json at +8 and +32 days with the same bag and keeps the clock over a save
  and reload; with `{ fixtureClock: false }` it runs on today. A core game reloaded from the save a pinned game wrote stays on the
  fixture's clock, and a save stamped with today's time runs on today.
- Every assert, bound, timeout and fixture is unchanged.

## Runs (local, 12 Oct 2026)

- All 133 sections that read a fixture, today: 1,774 core asserts green, every browser section green (4 chunks, jobs 4).
- The same 133 sections with today moved 32 days on (node's Date, every core game and every page shifted by a local-only hook,
  not committed): all green. Core at +8 days: green.
- Counterfactual, core only, pin off, today moved 8 and 32 days on: also green. So beyond 'next tier gate' (already pinned
  by #441) no core check would have gone red at those dates; the card's "1-3 more" did not show in core. The browser
  counterfactual was not run.
- `fixture-clock`: 6 asserts green (33 s alone).

## Left as it is

- tools/sim.mjs (spawned by 'craft-curve-skills-report') runs its own sim clock from 2026-01-01; it does not read a fixture there.
- tools/playtest.mjs ('playtest driver (browser)') starts a fresh game, not a fixture.
- Loads that restamp `last` from today (`Date.now()`, or today minus some hours) run on today's clock by design: their away
  gaps are relative to today. Such a gap can still hold a Sunday midnight when a check runs early on a Monday; every one of the
  133 sections passed in these runs, which ran Monday 12 Oct 01:30-03:30 UTC.

## Every fixture load in tools/check.mjs and its clock

| Section | Lines | Fixtures | Clock |
|---|---|---|---|
| ui2-look (browser) | 383 | save-mid, save-early | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| split build (asset-build) | 577 | save-early | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s) |
| load-hold-progress (browser) | 746 | save-mid | page: auto pin (fixture last + 60 s) |
| foe wind-up after a hold (browser) | 839 | save-mid | page: auto pin (fixture last + 60 s) |
| hero packs (hero-packs) | 989 | save-early | page: auto pin (fixture last + 60 s) |
| hero queue (hero-queue) | 1085 | save-early | page: auto pin (fixture last + 60 s) |
| new-style screens (ns-scenery-engine) | 1152 | save-early | core: auto pin (fixture last + 60 s) |
| new-style screens (browser) | 1224 | save-early | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| saves | 1356, 1357 | save-late, every tests/fixtures save | core: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| two tabs | 1392 | save-early | core: auto pin (fixture last + 60 s); some loads pin their own clock (prelude) |
| save export after play | 1461, 1462, 1481, 1482 | save-current, every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| items | 1533, 1534, 1560 | save-early, every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| retool | 1646, 1650 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| goals | 1688, 1689 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| almanac | 1809 | save-early | core: auto pin (fixture last + 60 s); some loads pin their own clock (prelude); some loads restamp last = today (today's clock; gaps relative) |
| crafting | 1953, 1954 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| craft-curve-skills-report | 2017 | save-mid, save-late | core: auto pin (fixture last + 60 s) |
| craft-attribute-grades | 2107 | save-mid, save-late | core: auto pin (fixture last + 60 s) |
| craft-strike-infuse | 2173 | save-mid, save-late | core: auto pin (fixture last + 60 s) |
| balance | 2249, 2255, 2287 | save-early, save-late | core: auto pin (fixture last + 60 s) |
| camp | 2462, 2463 | every tests/fixtures save | core: auto pin (fixture last + 60 s); some loads pin their own clock (prelude) |
| gathering | 2573, 2574 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| tools | 2647, 2648 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| codex | 2675, 2690 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| deepwell | 2753, 2754 | save-early, save-late, every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| onboarding | 2867, 2868 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| stars | 3103, 3329 | save-mid, every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| hold hint | 3381 | save-late | core: auto pin (fixture last + 60 s) |
| regions and the Great Lantern | 3494, 3495 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| tools and Well Rested | 3618, 3624 | save-early, save-late | core: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| cold hearth | 3678, 3740 | every tests/fixtures save | core: auto pin (fixture last + 60 s); some loads pin their own clock (prelude) |
| deeds | 3858, 3859 | save-late, every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| story | 4167, 4289 | save-mid, every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| story cards fit at 740x360 (browser) | 4432 | save-unlit-8log | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| store | 4570, 4571 | save-late, every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| store shelf | 4746 |  | core: auto pin (fixture last + 60 s) |
| refine-queues | 4847 | save-mid | core: auto pin (fixture last + 60 s) |
| smelt-done-says-so | 4904 | save-refine | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| hands | 5091, 5092 | every tests/fixtures save | core: auto pin (fixture last + 60 s); some loads pin their own clock (prelude) |
| nav | 5366, 5369 | save-mid, every tests/fixtures save | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| types and statuses (S1) | 5734, 5735 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| save codes | 5808, 5809 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| econ (ECON-A) | 5916 | save-late | core: auto pin (fixture last + 60 s) |
| cb2 | 5936, 6128 | save-late, every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| solo hero | 6295, 6350 | save-late | core: auto pin (fixture last + 60 s) |
| save codec validation (C5) | 8771 | every tests/fixtures save | core: auto pin (fixture last + 60 s); some loads pin their own clock (prelude) |
| milestone feats (C11) | 9499 |  | core: auto pin (fixture last + 60 s) |
| milestone feats UI (C11, browser) | 9585 | save-early | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| future-dated save | 9951 | save-late | core: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| C14 away card (browser) | 10197 | save-mid | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| zones stay where you put them | 10864, 10877 | save-mid, save-early | core: auto pin (fixture last + 60 s) |
| C29 turn fights (core) | 11228 | save-mid | core: auto pin (fixture last + 60 s) |
| C29 late zones and Wider timing windows (core) | 11267 |  | core: auto pin (fixture last + 60 s) |
| C29 boss pass (core) | 11317 |  | core: auto pin (fixture last + 60 s) |
| C29 mid-game HP and Wren (core) | 11403 |  | core: auto pin (fixture last + 60 s) |
| boss odds (core, Next Up "Boss ready") | 11675 |  | core: auto pin (fixture last + 60 s) |
| hero progression rework (attributes, road, join, bench) | 12434, 12443 | save-late, save-early | core: auto pin (fixture last + 60 s) |
| intro-and-picker | 12629 | save-mid | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s) |
| craft reveal | 12953 | save-mid | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| craft attribute grades (browser) | 13014 | save-mid | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| craft strike infuse (browser) | 13082 | save-mid | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| craft delta | 13167 | save-flow-cold-camp, save-z10-cantor, save-flow-upgrade, save-forge-short | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| craft-odds-before-pay | 13326 | save-pip-z10-ward, save-pre-z7-boss, save-flow-cold-camp | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| upgrade-odds-next-step | 13441 | save-pip-z10-ward | core: auto pin (fixture last + 60 s) |
| tool-speed-adds-up | 13468 | save-flow-cold-camp | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| next tier gate | 13527 | save-tier-gate | core: auto pin (fixture last + 60 s); some loads pin their own clock (prelude) |
| fixture-clock | 13639, 13646 | save-tier-gate | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s) |
| trick read counts (core) | 14025, 14028 | save-early | core: auto pin (fixture last + 60 s) |
| staged guide (browser) | 14274 | save-unlit-8log | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| starters join when met | 14429 | save-pre-champion, save-join-z5 | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| desktop layout (browser, desktop-layout-v1) | 14930 | save-current | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| desktop views 2 (browser, desktop-views-2) | 15081 | save-current | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| desktop tooltips (browser, desktop-tooltips) | 15191 | save-current | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| zone10-clear-moment | 15403, 15473 | save-z10-cantor | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); page.clock.install: own clock |
| moment layer | 15581 | save-mid | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| hero voice | 15709 | save-mid | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| Next Up Go targets (browser) | 16069 | save-early, save-mid | page: auto pin (fixture last + 60 s) |
| fight HUD fit | 16109 | save-mid | page: auto pin (fixture last + 60 s) |
| normal-death-says-so | 16200 | save-early | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s) |
| foe-tricks-say-so | 16379 | save-early | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s) |
| feint-read-clear | 16455 | save-early | page: auto pin (fixture last + 60 s) |
| tell us form | 16686 | save-mid | page: auto pin (fixture last + 60 s) |
| hero join shown once | 16733 |  | core: auto pin (fixture last + 60 s) |
| guide goal after reload | 16817 | save-cold-z2-unlit | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| reload keeps tips | 16889 |  | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| unspent points nudge | 17005 | save-dipper-z4 | core: auto pin (fixture last + 60 s) |
| gear-in-first-25 | 17098 | save-pip-tool-made, save-wren-hunt-open | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| forge-tip-goes-stale | 17207 | save-forge-short | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| forge-line-while-fighting | 17271 | save-forge-short | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| tip-order-and-lateness | 17403 | save-flow-cold-camp | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| tips-pause-says-so | 17513 | save-dipper-z4 | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| tips-hold-740 | 17695 | save-dipper-z4 | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| stale-guide-tips | 17806 | save-forge-short, save-dipper-z4, save-unlit-8log | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| defend-bar-740 | 17931 | save-dipper-z4 | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| camp-build-tap-again | 17989 | save-bench-ready | page: auto pin (fixture last + 60 s); some loads pin their own clock (prelude); some loads restamp last = today (today's clock; gaps relative) |
| boss-spoils-pick | 18037 | save-pre-z7-boss | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| spoils-card-fits-with-unique | 18133 | save-pre-z7-boss | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| look-card-says-why | 18189 | save-pre-z7-boss | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| scroll-spares | 18241 | save-wren-spare-moss | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| craft-shortfall-offer | 18479 | save-refine | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| upgrade-gold-covers-short | 18549 | save-refine | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| menu-tip-room | 18635 |  | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| ability-names-fit | 18712 | save-pip-abilities | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| eyes-placeholder abilities tiles | 18807 | save-wren-spare-moss | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| loadout-odds | 18844 | save-pip-z10-ward | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| cache-pick-order-settles | 18918 | save-pip-z10-ward | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| learn-odds-pump-stops | 18991 | save-pip-z10-ward | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| turn-banner-clears-plate | 19053 | save-mid | page: auto pin (fixture last + 60 s) |
| tier-two-named-for-return | 19140, 19147 | save-min60-tier-gate, save-z13-boss-ready | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s) |
| nu-chip-gate-label-fits | 19235 | save-min60-tier-gate | page: auto pin (fixture last + 60 s) |
| nextup-chip-360 (browser, fallback-font) | 19280 | save-min60-tier-gate | page: auto pin (fixture last + 60 s) |
| side-column-fits-740 | 19340 | save-min60-tier-gate | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| fight-chip-beside-nextup | 19528 | save-min60-tier-gate | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| first-craft-toast-clip | 19621 | save-mid | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| leave-mid-fight-gathers (browser) | 19699 | save-min60-tier-gate | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| deepwell-spillover-keeps-fight | 19745 | save-late | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| deepwell-floor-label-clear | 19810 | save-deep-spill | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| toast-over-menu-foot | 19878 | save-mid | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| away-line-only-when-true | 20001 | save-min60-tier-gate | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s) |
| gate-go-starts-gathering | 20076 | save-min60-tier-gate | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s) |
| space-reopens-next-up | 20192 | save-min60-tier-gate, save-raid, save-late, save-early | page: auto pin (fixture last + 60 s) |
| online-off-clean | 20265 | save-raid, save-late, save-early | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| stage-no-swarm-shrink (browser) | 20366 | save-early, save-late | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| actor-scale (browser) | 20418 | save-late | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| actor-scale-followups (browser) | 20538 | save-late | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| basic-attack-swings | 20632 | save-early | page: auto pin (fixture last + 60 s) |
| realtime-press-swings | 20712 | save-early | page: auto pin (fixture last + 60 s) |
| ability-effects-live | 20768 | save-early | page: auto pin (fixture last + 60 s) |
| fx-timing-fixes | 20875 | save-early | page: auto pin (fixture last + 60 s) |
| bow-slot-wording | 20959 | save-flow-cold-camp | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| pip-cast-recipes | 21026 | save-early | page: auto pin (fixture last + 60 s) |
| wren route S (browser) | 21192 | save-early | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| craft-costs-up-front | 21338 | save-unlit-8log, save-pip-tool-made | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
