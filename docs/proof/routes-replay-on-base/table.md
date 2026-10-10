# Every proof route, replayed on the base (routes-replay-on-base, 10 Oct 2026)

Base: `claude/elegant-johnson-m6k00u` at 1227f94f (the #340 split build, after #343). Command: `node tools/build.mjs && node tools/ci/eyes.mjs --all`
(142 routes, 360x740 portrait and 740x360 landscape, four browsers side by side as CI's eyes job runs them; 40 min on 4 cores).

**First replay: 120 pass, 22 fail.** After the route fixes below, a second full replay (35 min) left only the five routes that show a game bug red (four bugs), plus one
load-only miss (ability-names-fit, fixed after). Every fixed route then passed every run alone (at least 2 in each view), and the PR's eyes job
replays every changed route in both views.

Two new runner pieces:
- `node tools/ci/eyes.mjs --all [k/n]` replays every route (or the k-th of n even slices) in the two gating views. The same summary and causes as PR eyes.
- `unless "<text|css>" <command>` in `tools/playtest.mjs` runs a play command only while that text or selector is not on screen. A fight loop now
  waits on game state: `unless "No weapon on" tap-if "Attack"` stops pressing once the line is up, and `unless .sty-sheet parry-clean 3` stops at
  the win's story card. Spare rounds cost nothing, so a route can carry a wide margin without running long.
  `if "<text|css>" <command>` is the same the other way round: `if "Press Parry now" tap-if "Parry"` answers a guide prompt that holds a
  boss's swing. Both run play commands only, never an `expect` or a `shot`.
- `wait-for "<text|css>" <secs>` runs game time until that text or selector is on screen (at most that long) and never fails by
  itself; the `expect` after it does. Added when the base moved under this card (#348 hits on impact, #349 title screen, #351, #353
  bigger heroes): cards, lines and the Hero tab now come a beat later than a fixed `wait 2`, so PR 1's eight routes wait for them.

## Failures and what was done

| Route | Views | Cause | Breaking change | Done |
|---|---|---|---|---|
| starters-join-when-met | both | Stale. A Champion holds at each gate until its charged move is parried; Attack-only rounds never won. | #261 rally-gates-live (8ecff0e4) | Fixed: Attack + ability, then `parry-clean 3` x3 per round, 16 rounds, each under `unless .sty-sheet`. 170 s to 95 s. |
| walk-fixture-start | both | Stale, as above. Its "1 of 3" had passed only by matching the "Aim 1 of 3" button. | #261 | Fixed, as above. |
| cache-ui-zone10-crash | both | Stale, as above (the Cantor's Rattle hits 3 times, so 3 parries a round). | #261 | Fixed, as above. |
| reload-keeps-tips | both | Stale, as above. | #261 | Fixed, as above. |
| uniques-first-four | both | Stale. With no capability host the Craft wall hides the raid's 6 uniques: "3 / 8 uniques". | #312 online-off-clean (0038328d) | Fixed: expect the new count, with a note. |
| zone-1-unique-hero-fit | both | Stale, as above. | #312 | Fixed, as above. |
| gold-without-training | both | Stale. The new-hero card can eat the second Continue; the gold-cover row pushed the +8 rows below the fold. | upgrade-gold-covers-short (dca4960a) | Fixed: one more `tap-if "Continue"`; taps that bring the rows on screen. |
| playtester-code-bugs | both | Stale. Two lines reworded on purpose: "Your lantern burns Ember Red now." and "+2: +0.3% crit chance". | look-card-says-why (64fa91d5), craft-shortfall-offer (0520499a) | Fixed: the new wording, cited; Power 20 read after reopening the sheet. |
| refine-queues | both | Stale. The away card folds Camp under More. | #283 away-card-next-up-first (9a68c5b8) | Fixed: `tap "More"`. |
| next-tier-gate-goal | both | Stale. The row names the nearest piece's furthest gate ("Birch Bow: Mining 5 of 14 opens Iron Ore") and its Go starts mining. | #304 (ab9ca1ec), gear-in-first-25 (9bfde79d), gate-go-starts-gathering (2c79eafa) | Fixed: expects follow the later cards (gate named, then the Mining view at its gate). |
| z16-wall | both | Stale. A Ready "Build Hearth 2" row puts the boss row 4th. | #263 hearth-two-next-up (ebae64bc) | Fixed: take the Hearth row's Go, reopen Next Up. |
| cal-0107-storage-and-gather-ui | both | Stale. "Show all grades" is now "Show all tiers". | craft-shortfall-offer (0520499a) | Fixed: the new wording, cited. |
| unspent-points-nudge | both | Stale. The Ready first weapon ranks over other Ready rows, so the chip shows the Pine Bow. | gear-in-first-25 (9bfde79d) | Fixed: chip expects the bow; "Learn Power Shot" is expected in the open list. |
| staged-guide-followups | both | Stale. The points pile brings the spend line first; in landscape the kill took 5 to 7 presses and an extra press closed his line. | spend-points-before-nextup (c5569a02) | Fixed: `tap-if "Spread evenly"`; presses under `unless` his line. |
| loss-help-gear-first | both | Route race since its own merge: the 7th press could start the next fight and clear the loss line. | none (d5def6cd) | Fixed: 16 rounds under `unless "No weapon on"`. |
| guide-goal-after-reload | both | Route race since its own merge: presses 1.5 s apart landed on the foe's turn. | none (6ce14d37) | Fixed: 10 rounds under `unless` his Pine Log line. |
| foe-tricks-say-so | landscape | Route race: auto boss could bring the zone 7 boss, whose loss card hid the Foe tab (1 run in 2 at its own merge). | none (8b1c40f2) | Fixed: stop pressing and clear that card before `tap "Foe"`. |
| ability-names-fit | landscape (2nd replay only) | A story card covered the fight by 3 s on a loaded run. | none | Fixed: `tap-if "Continue"` before the first expect. |
| **z13-unstick** | both | **Game find.** Next Up drops "Boss ready in Zone 13" (odds 100%): at load the boss odds are not worked out, the rows shown first get the sticky bonus, and the boss row never gets back in. | #304 tier-two-named-for-return (ab9ca1ec; its parent passes) | Not changed. Card for the Foreman. |
| **defeat-card-guide-tip** | both | **Game find.** After the boss-loss card, his "No shame in that..." line never comes: the points step holds every gap while the hero has points. | tips-pause-says-so (97be854e; its parent passes) | Not changed. Card for the Foreman. |
| **craft-delta** | portrait | **Game find.** Right after crafting the Copper Pickaxe, the list scrolls to the Pine Bow row (Hesketh's tip target) within 1 s, so the fresh craft card goes off screen. | craft-odds-before-pay (a8025456; its parent passes) | Not changed. Card for the Foreman. |
| **cal-0107-flow-bugs** | portrait (landscape: route race) | **Game find** in portrait: the same scroll as craft-delta hides "Copper Pickaxe on.". Landscape missed "Back to the fight" under load (12 fixed presses). | a8025456 | Not changed here; the landscape fix (`unless` his line, 24 rounds) is ready in the project files at `autopilot/proof/routes-replay-on-base/cal-0107-flow-bugs.route.patch`, to go in with the game fix. |
| **forge-line-while-fighting** | landscape (portrait: route race) | **Game find** at 740x360: Hesketh's held Forge line is cut short. Only "The Forge needs Copper Ore 0/25" shows; "from the Copper Vein and Pine Log 2/10 from the Pine Grove" is clipped, so the text reader cannot see it. The route also raced: since tips-pause-says-so a fight press answers his held line. | #282 tips-pause-says-so (97be854e) for the race; the clip not bisected | Not changed here; the race fix (`unless .ob-txt tap-if "Attack"`, passes portrait) is in the project files at `autopilot/proof/routes-replay-on-base/forge-line-while-fighting.route.patch`, to go in with the game fix. |

Unconfirmed, not carded: on the tier-gate save Next Up reads "Mining 5 of 14" and the Mining view reads "Lv 6" two seconds later. Probably a
level-up from the mining that the Go starts; worth one look in the next-tier-gate card.

## Keeping it true: a nightly replay (proposal for the Foreman)

PR eyes replays only the routes a PR changes, so a route that rots on the base stays green until someone touches it. The cheapest fix runs
with the nightly walk: GitHub already starts `walk.yml` at 03:00 UK on the integration head, so a `routes` job there adds no trigger and no
per-PR minutes. Six slices side by side, each about a sixth of the 35-40 min replay (6-7 min plus setup), under a 20 min limit, no retry.
A red slice names its routes and causes in the job summary. Proposed job (this card did not add it: workflow schedules are the Foreman's to card):

```yaml
  routes:
    needs: plan
    if: needs.plan.outputs.go == 'true'
    runs-on: ubuntu-24.04
    timeout-minutes: 20
    strategy:
      fail-fast: false
      matrix:
        slice: [1, 2, 3, 4, 5, 6]
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ needs.plan.outputs.ref }}
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - id: image
        run: echo "os=$ImageOS" >> "$GITHUB_OUTPUT"
      - uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ steps.image.outputs.os }}-${{ hashFiles('package-lock.json') }}
      - run: npx playwright install --with-deps chromium
      - run: node tools/build.mjs
      - name: Replay slice ${{ matrix.slice }}/6 of the proof routes
        run: node tools/ci/eyes.mjs --all "${{ matrix.slice }}/6"
      - if: always()
        run: '[ -f eyes-out/summary.md ] && cat eyes-out/summary.md >> "$GITHUB_STEP_SUMMARY" || true'
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: routes-slice-${{ matrix.slice }}
          path: eyes-out/
          retention-days: 14
```

Like the walk, it takes effect only once `walk.yml` reaches `main`. Until then, run `node tools/ci/eyes.mjs --all` locally after any merge
that changes the first fight, fixtures, bosses or Next Up.
