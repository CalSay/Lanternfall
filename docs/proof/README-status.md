# Proof route status

Every `docs/proof/<card>/route.txt` first replayed on the integration branch at f8123154 (after #219), then again after merging bd70a995 (#221 to #227), seed from the route
(default 1), in both views: portrait 360x740 and landscape 740x360
(`grep -v '^#' <route> | node tools/playtest.mjs batch --seed 1`, and the same with `--landscape`). A run passes when
playtest exits 0 (every tap made, every `expect` true). Card: proof-routes-rot, 2026-10-08.

Before: 89 of 136 runs passed (24 of 68 routes failed in at least one view).
After (on bd70a995, #221 to #227 merged in): 144 of 146 runs pass (73 routes: 72 pass both views and hit-feel fails both since #225, see its row; 6 routes were added while this card ran); 1 route retired. No route failed because the game is broken.

Retired routes live in `docs/proof/_retired/<card>/route.txt` with the reason on their first line. CI's eyes job does not
replay them.

| Route | Before (portrait/landscape) | Portrait | Landscape | Action |
|---|---|---|---|---|
| almanac-forge-points-to-gear | pass/pass | pass | pass | Kept |
| away-card-claim-button | pass/pass | pass | pass | Kept |
| banner-gather-raid-portrait | pass/pass | pass | pass | Kept (comment only, no commands; see cards workbench-cost-route and eyes-empty-route) |
| boss-tiers | pass/pass | pass | pass | Kept |
| boss-tiers-pr3 | pass/pass | pass | pass | Kept |
| boss-tiers-pr5-build | pass/pass | pass | pass | Kept |
| boss-tiers-pr5b | pass/pass | pass | pass | Kept |
| bounties-anywhere | pass/pass | pass | pass | Kept |
| cache-core | fail/fail | pass | pass | Fixed: presses Dodge in the first fight (the staged lesson holds the foe's first swing for it) |
| cache-ui-zone10-crash | pass/pass | pass | pass | Kept |
| cal-0107-flow-bugs | fail/fail | pass | pass | Fixed: finishes the fight so between-fight tips show; a made tool is now worn on its own, so note 17 is checked on the Pine Bow |
| cal-0107-gear-and-rates | fail/fail | pass | pass | Fixed: closes the Refining tip over Craft |
| cal-0107-hesketh-voice | pass/pass | pass | pass | Kept |
| cal-0107-staged-guide | pass/pass | pass | pass | Kept |
| cal-0107-storage-and-gather-ui | pass/pass | pass | pass | Kept |
| counters-and-layers | pass/pass | pass | pass | Kept |
| craft-delta | fail/fail | pass | pass | Fixed: saws a Pine Plank first (the Bow +1 now takes one) |
| craft-reveal | fail/fail | pass | pass | Fixed: opens the mid save cleanly; crafts Copper pieces (Iron now needs ingots and planks the save lacks) |
| defeat-card-guide-tip | pass/pass | pass | pass | Kept |
| early-foes-three-hits | pass/pass | pass | pass | Kept |
| fight-hud-fit | pass/pass | pass | pass | Kept |
| fight-labels-fit | pass/pass | pass | pass | Kept |
| first-gold-and-camp-strip | pass/pass | pass | pass | Kept |
| foe-weak-resists | pass/pass | pass | pass | Kept |
| gold-without-training | fail/fail | pass | pass | Fixed: +7 takes 6 Silver Ingot: mines coal and smelts while away first |
| guide-bubble-clear-of-controls | pass/pass | pass | pass | Kept |
| guide-panel | fail/fail | pass | pass | Fixed: skips the new intro story before the picker |
| guide-phase-guards | fail/fail | pass | pass | Fixed: skips the new intro story before the picker |
| guide-target-guard | pass/pass | pass | pass | Kept |
| guide-voice | fail/fail | retired | retired | Retired: "one tip a fight" was replaced on purpose by the staged first-fight lesson (bf1fb1c9); cal-0107-staged-guide proves it. Moved to `_retired/`. |
| hero-portraits | pass/pass | pass | pass | Kept |
| hero-progression-rework | pass/fail | pass | pass | Fixed: closes the timed new-hero card before tapping Wren; adds expect "Lv 29" |
| hero-sheet-ability-cover | pass/pass | pass | pass | Kept |
| hero-voice | pass/pass | pass | pass | Kept |
| hero-voice-banner-under-guide | pass/pass | pass | pass | Kept |
| hit-feel | pass/pass | fail | fail | Game change, follow-up: since #225 (merged while this card ran) a lost boss waits on its card for fair odds, so the route's fight stops. Tapping Try again fixes that, but a clean parry is a press in the last 0.1 s of a swing, so the route only lands one reliably with 160 rounds (175 s, too close to eyes' 240 s limit). Left unchanged here; draft in the project files (proof-routes-rot/hit-feel-route-draft.txt). |
| intro-and-picker | fail/fail | pass | pass | Fixed: the fire's last line was rewritten on purpose (staged guide); expects the new line |
| moment-layer | fail/fail | pass | pass | Fixed: presses Dodge; the first-boss moment is now folded into the Lantern Cache card ("First boss down"), so it checks the card, burst and Wren's first-boss line |
| next-tier-gate-goal | pass/pass | pass | pass | Kept |
| next-up-equip | pass/pass | pass | pass | Kept |
| playtest-minor-fixes | pass/pass | pass | pass | Kept |
| playtester-code-bugs | fail/fail | pass | pass | Fixed: presses Dodge; Gear moved to Hero; a Unique +1 takes a Copper Ingot, so it loads the refine save and smelts first |
| portrait-banner-over-hero | pass/pass | pass | pass | Kept |
| portrait-labels-fit | pass/pass | pass | pass | Kept |
| refine-queues | pass/pass | pass | pass | Kept |
| save-code-validation | fail/fail | pass | pass | Fixed: closes the New hero card after the first fight |
| save-two-tabs | pass/pass | pass | pass | Kept |
| small-text-clips | pass/pass | pass | pass | Kept |
| staged-guide-followups | pass/pass | pass | pass | Kept |
| starter-meet-scenes | pass/pass | pass | pass | Kept |
| starters-join-when-met | pass/pass | pass | pass | Kept |
| story-card-landscape-fit | pass/pass | pass | pass | Kept |
| story-unlock-gates | pass/pass | pass | pass | Kept |
| sys-proof-ci | pass/pass | pass | pass | Kept |
| tell-us-form | pass/pass | pass | pass | Kept |
| tobin-safety-margin | pass/pass | pass | pass | Kept |
| top-bar-compact | fail/fail | pass | pass | Fixed: skips the mid save's story card and the Hero-tab tip in landscape |
| unique-weapons-fit-all | fail/fail | pass | pass | Fixed: a Bow upgrade now reads Pine Plank, not Pine Log |
| unique-weapons-wall-icon | pass/pass | pass | pass | Kept |
| uniques-first-four | fail/fail | pass | pass | Fixed: closes the Refining tip over Craft |
| unlock-gap-trial | fail/fail | pass | pass | Fixed: the first Attack tip was reworded ("Press Attack and hit it") |
| unlock-voice | fail/fail | pass | pass | Fixed: the point-to-spend step was reworded ("Open Hero and spend your new points") |
| upgrade-goal-chip-order | fail/fail | pass | pass | Fixed: saws a Pine Plank first; the route-only save-upgrade-skip.json gains 1 Pine + 5 Birch Plank so the Birch Bow goal shows again |
| walk-fixture-start | fail/fail | pass | pass | Fixed: presses Dodge in the first fight |
| wire-ability-icons | fail/fail | pass | pass | Fixed: closes the New hero card after the first fight |
| wire-menu-icons | fail/fail | pass | pass | Fixed: closes the New hero card and the Refining tip; Training is gone (Build in its place); Gear is checked on Hero |
| workbench-cost | pass/pass | pass | pass | Kept (comment only, no commands; see cards workbench-cost-route and eyes-empty-route) |
| zone-1-unique-hero-fit | fail/fail | pass | pass | Fixed: closes the Refining tip over Craft |
| guide-goal-after-reload | (new) | pass | pass | Kept (merged while this card ran) |
| hero-build-tab-blank | (new) | pass | pass | Kept (merged while this card ran) |
| unspent-points-nudge | (new) | pass | pass | Kept (merged while this card ran) |
| z13-unstick | (new) | pass | pass | Kept (merged while this card ran) |
| boss-retry-reads-odds | (new) | pass | pass | Kept (merged while this card ran) |
| gear-icons-48 | (new) | pass | pass | Kept (merged while this card ran) |
