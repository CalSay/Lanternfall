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
| ui2-look (browser) | 385 | save-mid, save-early | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| split build (asset-build) | 579 | save-early | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s) |
| load-hold-progress (browser) | 748 | save-mid | page: auto pin (fixture last + 60 s) |
| foe wind-up after a hold (browser) | 841 | save-mid | page: auto pin (fixture last + 60 s) |
| hero packs (hero-packs) | 991 | save-early | page: auto pin (fixture last + 60 s) |
| hero queue (hero-queue) | 1087 | save-early | page: auto pin (fixture last + 60 s) |
| new-style screens (ns-scenery-engine) | 1154 | save-early | core: auto pin (fixture last + 60 s) |
| new-style screens (browser) | 1226 | save-early | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| saves | 1358, 1359 | save-late, every tests/fixtures save | core: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| two tabs | 1394 | save-early | core: auto pin (fixture last + 60 s); some loads pin their own clock (prelude) |
| save export after play | 1463, 1464, 1483, 1484 | save-current, every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| items | 1535, 1536, 1562 | save-early, every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| retool | 1648, 1652 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| goals | 1690, 1691 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| almanac | 1811 | save-early | core: auto pin (fixture last + 60 s); some loads pin their own clock (prelude); some loads restamp last = today (today's clock; gaps relative) |
| crafting | 1955, 1956 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| craft-curve-skills-report | 2019 | save-mid, save-late | core: auto pin (fixture last + 60 s) |
| craft-attribute-grades | 2109 | save-mid, save-late | core: auto pin (fixture last + 60 s) |
| craft-strike-infuse | 2175 | save-mid, save-late | core: auto pin (fixture last + 60 s) |
| balance | 2251, 2257, 2289 | save-early, save-late | core: auto pin (fixture last + 60 s) |
| camp | 2464, 2465 | every tests/fixtures save | core: auto pin (fixture last + 60 s); some loads pin their own clock (prelude) |
| gathering | 2575, 2576 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| tools | 2649, 2650 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| codex | 2677, 2692 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| deepwell | 2755, 2756 | save-early, save-late, every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| onboarding | 2869, 2870 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| stars | 3105, 3331 | save-mid, every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| hold hint | 3383 | save-late | core: auto pin (fixture last + 60 s) |
| regions and the Great Lantern | 3496, 3497 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| tools and Well Rested | 3620, 3626 | save-early, save-late | core: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| cold hearth | 3680, 3742 | every tests/fixtures save | core: auto pin (fixture last + 60 s); some loads pin their own clock (prelude) |
| deeds | 3860, 3861 | save-late, every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| story | 4169, 4291 | save-mid, every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| story cards fit at 740x360 (browser) | 4434 | save-unlit-8log | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| store | 4572, 4573 | save-late, every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| store shelf | 4748 |  | core: auto pin (fixture last + 60 s) |
| refine-queues | 4849 | save-mid | core: auto pin (fixture last + 60 s) |
| smelt-done-says-so | 4906 | save-refine | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| hands | 5093, 5094 | every tests/fixtures save | core: auto pin (fixture last + 60 s); some loads pin their own clock (prelude) |
| nav | 5368, 5371 | save-mid, every tests/fixtures save | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| types and statuses (S1) | 5736, 5737 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| save codes | 5810, 5811 | every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| econ (ECON-A) | 5918 | save-late | core: auto pin (fixture last + 60 s) |
| cb2 | 5938, 6130 | save-late, every tests/fixtures save | core: auto pin (fixture last + 60 s) |
| solo hero | 6297, 6352 | save-late | core: auto pin (fixture last + 60 s) |
| save codec validation (C5) | 8773 | every tests/fixtures save | core: auto pin (fixture last + 60 s); some loads pin their own clock (prelude) |
| milestone feats (C11) | 9501 |  | core: auto pin (fixture last + 60 s) |
| milestone feats UI (C11, browser) | 9587 | save-early | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| future-dated save | 9953 | save-late | core: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| C14 away card (browser) | 10199 | save-mid | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| zones stay where you put them | 10866, 10879 | save-mid, save-early | core: auto pin (fixture last + 60 s) |
| C29 turn fights (core) | 11230 | save-mid | core: auto pin (fixture last + 60 s) |
| C29 late zones and Wider timing windows (core) | 11269 |  | core: auto pin (fixture last + 60 s) |
| C29 boss pass (core) | 11319 |  | core: auto pin (fixture last + 60 s) |
| C29 mid-game HP and Wren (core) | 11405 |  | core: auto pin (fixture last + 60 s) |
| boss odds (core, Next Up "Boss ready") | 11677 |  | core: auto pin (fixture last + 60 s) |
| hero progression rework (attributes, road, join, bench) | 12436, 12445 | save-late, save-early | core: auto pin (fixture last + 60 s) |
| intro-and-picker | 12631 | save-mid | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s) |
| craft reveal | 12955 | save-mid | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| craft attribute grades (browser) | 13016 | save-mid | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| craft strike infuse (browser) | 13084 | save-mid | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| craft delta | 13169 | save-flow-cold-camp, save-z10-cantor, save-flow-upgrade, save-forge-short | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| craft-odds-before-pay | 13328 | save-pip-z10-ward, save-pre-z7-boss, save-flow-cold-camp | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| upgrade-odds-next-step | 13443 | save-pip-z10-ward | core: auto pin (fixture last + 60 s) |
| tool-speed-adds-up | 13470 | save-flow-cold-camp | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| next tier gate | 13529 | save-tier-gate | core: auto pin (fixture last + 60 s); some loads pin their own clock (prelude) |
| fixture-clock | 13641, 13648 | save-tier-gate | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s) |
| trick read counts (core) | 14027, 14030 | save-early | core: auto pin (fixture last + 60 s) |
| staged guide (browser) | 14276 | save-unlit-8log | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| starters join when met | 14431 | save-pre-champion, save-join-z5 | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| desktop layout (browser, desktop-layout-v1) | 14932 | save-current | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| desktop views 2 (browser, desktop-views-2) | 15083 | save-current | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| desktop tooltips (browser, desktop-tooltips) | 15193 | save-current | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| zone10-clear-moment | 15405, 15475 | save-z10-cantor | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); page.clock.install: own clock |
| moment layer | 15583 | save-mid | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| hero voice | 15711 | save-mid | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| Next Up Go targets (browser) | 16071 | save-early, save-mid | page: auto pin (fixture last + 60 s) |
| fight HUD fit | 16111 | save-mid | page: auto pin (fixture last + 60 s) |
| normal-death-says-so | 16202 | save-early | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s) |
| foe-tricks-say-so | 16381 | save-early | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s) |
| feint-read-clear | 16457 | save-early | page: auto pin (fixture last + 60 s) |
| tell us form | 16688 | save-mid | page: auto pin (fixture last + 60 s) |
| hero join shown once | 16735 |  | core: auto pin (fixture last + 60 s) |
| guide goal after reload | 16819 | save-cold-z2-unlit | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| reload keeps tips | 16891 |  | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| unspent points nudge | 17007 | save-dipper-z4 | core: auto pin (fixture last + 60 s) |
| gear-in-first-25 | 17100 | save-pip-tool-made, save-wren-hunt-open | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| forge-tip-goes-stale | 17209 | save-forge-short | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| forge-line-while-fighting | 17273 | save-forge-short | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| tip-order-and-lateness | 17405 | save-flow-cold-camp | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| tips-pause-says-so | 17515 | save-dipper-z4 | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| tips-hold-740 | 17697 | save-dipper-z4 | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| stale-guide-tips | 17808 | save-forge-short, save-dipper-z4, save-unlit-8log | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| defend-bar-740 | 17933 | save-dipper-z4 | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| camp-build-tap-again | 17991 | save-bench-ready | page: auto pin (fixture last + 60 s); some loads pin their own clock (prelude); some loads restamp last = today (today's clock; gaps relative) |
| boss-spoils-pick | 18039 | save-pre-z7-boss | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| spoils-card-fits-with-unique | 18135 | save-pre-z7-boss | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| look-card-says-why | 18191 | save-pre-z7-boss | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| scroll-spares | 18243 | save-wren-spare-moss | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| craft-shortfall-offer | 18481 | save-refine | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| upgrade-gold-covers-short | 18551 | save-refine | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| menu-tip-room | 18637 |  | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| ability-names-fit | 18714 | save-pip-abilities | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| eyes-placeholder abilities tiles | 18809 | save-wren-spare-moss | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| loadout-odds | 18846 | save-pip-z10-ward | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| cache-pick-order-settles | 18920 | save-pip-z10-ward | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| learn-odds-pump-stops | 18993 | save-pip-z10-ward | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| turn-banner-clears-plate | 19055 | save-mid | page: auto pin (fixture last + 60 s) |
| tier-two-named-for-return | 19142, 19149 | save-min60-tier-gate, save-z13-boss-ready | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s) |
| nu-chip-gate-label-fits | 19237 | save-min60-tier-gate | page: auto pin (fixture last + 60 s) |
| nextup-chip-360 (browser, fallback-font) | 19282 | save-min60-tier-gate | page: auto pin (fixture last + 60 s) |
| side-column-fits-740 | 19342 | save-min60-tier-gate | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| fight-chip-beside-nextup | 19530 | save-min60-tier-gate | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| first-craft-toast-clip | 19623 | save-mid | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| leave-mid-fight-gathers (browser) | 19701 | save-min60-tier-gate | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| deepwell-spillover-keeps-fight | 19747 | save-late | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| deepwell-floor-label-clear | 19812 | save-deep-spill | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| toast-over-menu-foot | 19880 | save-mid | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| away-line-only-when-true | 20003 | save-min60-tier-gate | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s) |
| gate-go-starts-gathering | 20078 | save-min60-tier-gate | core: auto pin (fixture last + 60 s); page: auto pin (fixture last + 60 s) |
| space-reopens-next-up | 20194 | save-min60-tier-gate, save-raid, save-late, save-early | page: auto pin (fixture last + 60 s) |
| online-off-clean | 20267 | save-raid, save-late, save-early | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| stage-no-swarm-shrink (browser) | 20368 | save-early, save-late | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| actor-scale (browser) | 20420 | save-late | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| actor-scale-followups (browser) | 20540 | save-late | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| basic-attack-swings | 20634 | save-early | page: auto pin (fixture last + 60 s) |
| realtime-press-swings | 20714 | save-early | page: auto pin (fixture last + 60 s) |
| ability-effects-live | 20770 | save-early | page: auto pin (fixture last + 60 s) |
| fx-timing-fixes | 20877 | save-early | page: auto pin (fixture last + 60 s) |
| bow-slot-wording | 20961 | save-flow-cold-camp | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| pip-cast-recipes | 21028 | save-early | page: auto pin (fixture last + 60 s) |
| wren route S (browser) | 21194 | save-early | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
| craft-costs-up-front | 21340 | save-unlit-8log, save-pip-tool-made | page: auto pin (fixture last + 60 s); some loads restamp last = today (today's clock; gaps relative) |
