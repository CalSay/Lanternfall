# Playtest 2: QA pass on the solo build (2026-09-29)

Build tested: `claude/elegant-johnson-m6k00u` at 76cc929 (SOLO2 merged), `node tools/build.mjs`, dist wrapped in Playwright
Chromium (the check.mjs way, `window.__t.x` for state reads and `tick(dt)` for fast-forward). Sizes: 360x740, 740x360, 1280x720.
Screenshots: `docs/coord/playtest-2-shots/` (JPEG, about 2.6 MB). No game code was changed.

**How to read the evidence.** "Real time" means I clicked or waited with the normal frame loop. "FF" means I fast-forwarded with
`tick()` and a scripted player (it presses the guide's targets, buys upgrades, and never idles on a menu), so FF timings are
game seconds and a real person is slower, not faster. Where a finding came only from FF I say so. Scripts are in `scratch/` (not committed).

## P0: blocks play

### P0-1. The first-session Ability step hard-locks the game (Wren, about half of new games)
- Steps: pick Wren, press Attack on the first hint, then read the second hint ("Echo Shot is ready. Press it.").
- What happens: the game is paused for the hint. Wren's Attack already dropped every foe in the pack to 0 HP, and the respawn
  timer (0.45 s) is frozen by the pause. Echo Shot needs a live foe, so pressing it does nothing (the slot shakes,
  class `nope`). The step only completes on a cast, so the game waits forever. State at the lock: `ONBOARD.paused true`,
  `combatFoes()` all hp 0, `respawn 0.45`, `O().casts 0`, ability `ready true`.
- Frequency: Wren 7 of 16 fresh starts (real clicks on the guide targets, 0.5 s apart). Tobin 0 of 6, Pip 0 of 6 (their Attack does not clear the pack).
- Escape: the hint's small "x" skips the step, and the ability lesson with it. A player who does not spot the x is stuck on the first screen.
- Should: the step must never wait on something the paused game cannot make happen. Let the sim run one tick to respawn, or
  only pause once a foe is alive, or accept the press with no target.
- Screenshot: `P0-ability-lock.jpg` (hint up, Echo ready, foes gone), `t10-stuck-ability-0.jpg`.

### P0-2 (lower confidence). The Dodge step can also hang
- 1 of 8 Wren starts: the Dodge hint showed with a heavy hit at 0.8 s and `inDodge true`, dodge on cooldown, `O().dodges 0`,
  game paused, so the warning never resolved and the step never completed. Escape is again the x.
- Screenshot: `t10-stuck-dodge-1.jpg`. I could not reproduce it on Tobin or Pip.

## P1: bad experience

### P1-1. Gatherers cannot be hired (there is no UI for Hands)
- Steps: state grant to Hearth 3+, Tavern Lv 3, Bunkhouse Lv 1 (or play there), open Camp > Tavern, every view.
- Happens: Tam exists (`handsList()`), one applicant waits (`handsBoard()`, "No free bed" or 5,100 gold), and I could send Tam out
  by API: a 2 h wood shift paid 309 wood on catch-up, so the engine works. But no screen shows Hands. Camp > Tavern says
  "The tavern opens when you play from the game's Claude link" plus Hall of Heroes and a name field. Searching every tab and view
  text for hand/hire/applicant/Tam finds nothing. Bell notice says "Tam ... has a bed in the Bunkhouse. He gathers for the heroes.
  Hire more Hands at the Tavern." (which cannot be done). The Bunkhouse (20M gold for Lv 2 at zone 45) buys beds nobody can fill.
- Should: either a Hands screen (the N3 task in the wave log was never built) or remove the copy and the Bunkhouse until it lands.
- Screenshot: `c1-tavern-p.jpg`.

### P1-2. Idle resource gathering: what I measured (owner report, see the full investigation below)
Short version: gathering itself works live and away. What does not work is everything around it: the guide freezes it, the fire
switches you back to Fight, nothing gathers while you fight, and there are no idle gatherers (P1-1).

### P1-3. Old party text is all over the solo build
Details and screenshots in section "Old party leftovers". Highest impact: every hero's class card still describes party aura, "your
party takes 60% less damage", Bonds and "Tap:" attacks; the weekly goals include "Send 3 expeditions" and "Gain 20 companion levels".

### P1-4. Notification spam in the first minutes
Numbers in the notification table below. Worst points: a toast for every level (15 to 16 in 15 minutes, all "Your hero hits 4%
harder"), three toasts and a hint at the first boss clear, a "Codex holds 1 Lantern Light from your past deeds" toast at second 3 of a brand-new game, and toasts painted over the open Camp/Craft panels.

### P1-5. Landscape 740x360: the action bar is off screen
- Steps: open at 740x360, pick a hero. The game view is 312 px tall inside a 360 px screen; the stage takes 180 px and the bar starts at y=282
  and ends at y=412. Only the top 10 px of Parry, Dodge and Attack show. `#game` does not scroll (overflow visible, document height 360).
- The first guide step points at Attack at y=350 to 404 (`L1-first-step-l.jpg`). Keys work (D attacked), touch does not reach the buttons.
- The CLAUDE.md target device is 740x360, so as-is a phone in landscape cannot play actively. UX-L1 is the known fix; logged here because it is the stated target.
- Screenshots: `tour-l-fight.jpg`, `t11-fight-scrolled-l.jpg`. Desktop 1280x720 is fine (`t11-fight-d.jpg`).

### P1-6. Idle play stalls hard at the zone 9 boss
- FF, fresh start, same upgrade spending, 600 s: idle Wren reached zone 9 at 420 s and sat there to 600 s (Tobin idle: zone 9 at 480 s, still 9 at 600 s;
  Pip idle: 9 at 300 s, 9 at 600 s). The scripted active player (Attack every 0.65 s, ability when ready) reached zone 10 at 240 to 300 s and
  zone 11 to 12 at 600 s. Idle is well over 2x slower to zone 10, not the 25 to 35% in the design note. A 60 minute idle-ish Tobin run
  (guide presses only) was zone 13, level 21 (zone 9 at 450 s, 10 at 1050 s, 11 by 1950 s, 12 by 2400 s, 13 by 3150 s).
- Likely tuning, not a bug; flagged for the balance pass (sim.mjs --report early).

### P1-7. Journal spams the console every 200 ms
- Steps: bell > Journal. `[lanternfall] section feedback update failed TypeError: Cannot read properties of null (reading 'querySelector')`
  fires on every ui() refresh (14 errors in 1.5 s). Cause: `75-feedback-ui.js` update() reads `$('log')` which is null while the bell sheet is open.
  The same errors then land in the "Copy report" text for testers.

### P1-8. Class card and Proving text describe removed mechanics (see old party list) and Wren/Tobin/Pip Proving needs upgrades
- The Proving itself works for all three (with a few hundred upgrade levels bought: idle wins in 19 to 33 s, active in 5 to 7 s; with zero upgrades at level 50 idle fails
  ("You fell", "The lamp went out", "Time ran out") and only Tobin active won). Not a bug, just note: nothing tells a player to buy upgrades first.

## P2: polish

- P2-1. Wren looks different in the picker (green hood, purple scarf) than on the stage and header (purple hood). `t7-fight-wren.jpg` vs `L1-create-l.jpg`.
- P2-2. Sub-view tab labels cut off at 360 px: "Upgrad...", "Bounti...", "Bestia...", "Deepwe...", "Mining...", "Foragi...", "Storeh..." (`tour-montage-portrait-360x740.jpg`).
  The header activity pill reads "Fighting · ..." and "Woodcutting..." instead of the hero name at 360 px. The Next Up chip label is clipped ("Blade Lv 1: ready to ...").
- P2-3. In the mid-game grant state (Zone 45) the zone step arrows (`.zstep`, `.navbtn`) end at x=381 on a 360 px screen, past the right edge. The fresh Fight view fits.
- P2-4. The stage story chip ("New story: Wisps, Read") sits over the foes and stays until tapped (visible in every 740 and 1280 shot). Toasts also cover the zone name banner.
- P2-5. "COUNTER 1.51K" floats up in the Gather scene after a fight parry (`n15-pip-p-busy3-t41.jpg`); a fight number carried into the woodcutting scene.
- P2-6. Bounty "Tap the stage 100 times" (Next Up chip showed 7/100): there is no tap attack any more. Stage taps in Fight only bump `O().taps`
  (25 taps, 0 attacks). It still counts, so it is doable, but it teaches the old control.
- P2-7. Hero switch: switching to a level 1 hero drops you to "Zone 2" ("You fell back to Zone 2 to keep earning") and the strong hero
  comes back to Zone 2 too, not the zone they left. Copy: "What's new: 1 things since your last visit."
- P2-8. Weak point in `#app`: it has 1,332 px of scrollable height in a 740 px screen (the closed menu below the fold). Any programmatic scroll
  (`scrollIntoView`, focus) leaves the header and Gather button off screen with a blank band below the tab bar and no way back on touch. I hit this only through
  Playwright's own click auto-scroll, so treat it as fragile, not a confirmed player bug.
- P2-9. Deepwell trial blurb: "Damage x2. Your most Oil is 60s." (sentence looks broken). Draft boon: "Thorn Plate: Your tanks reflect 30%...".
- P2-10. Heavy hits do very little (Tobin L12: 8 damage of 282 HP, 3%). Parry and Dodge only matter as timing rewards; no fail state.
  Parry window measured: too early (0.4 s or more before landing) is a miss and the hit lands; 0.35 s to 0 is a parry; dodge lands from 0.8 s out and
  1.0 s is "early". Both work as described.
- P2-11. Settings text "Buttons on the left: Off ... Moves the ability buttons to the left side" exists in the Journal but `S.settings` only holds `sound`. Not tested further.
- P2-12. Bosses at zone 1 to 5 (Elder Moss Slime, Spore Cap) throw about one heavy hit per 45 s, so the first boss teaches little. Fine, but the first boss hint promises "red rings".

## Everything that worked
- Hero pick for all three, Wren/Tobin/Pip art and Auto badge (lit idle, dims when a button is pressed, back after 5 s; `t17-active-badge.jpg`).
- Guide steps to zone 2 (attack, ability, upgrade, boss, gather, chop, light, bench) apart from P0-1; all targets exist, one hint at a time, the game waits.
- Ability picker (tap empty slot; equip; clear), hero switch at camp (needs a second tap, "Tap again"), keyboard keys (D, A, S, Space, Q/W/E).
- Class limits on gear: Wren equips bow and quiver only, Tobin blade/shield/helm/plate, Pip staff only (playtest-1 note 5 is fixed).
- Crafting (made a Pine Bow), Deepwell run (floor 1 cleared, boon draft), star map (a star lights, points drop 20 to 19), Legendary powers view
  (4 drops learnable), Proving for all three heroes, pinned fight numbers with crit pop. Text scans at all three sizes found no NaN, undefined, Infinity or `[object`.
- Pinnacle bosses: only data exists (`21d-data-pinnacle.js`); there is no fight file or UI in `src/js`, so they are not reachable. Expected (PB1/PB2 not built).

# Notification count table (first 15 minutes of a fresh game, 360x740)

Method: an instrument hooked `#toasts` (every toast that popped), the bell log (every notice, including low priority that only bumps the
bell), the bell count, popups added to `body` (cards and sheets), `.sty-cap` stage captions, guide steps and hint bubbles, and `.is-new` / `.dot` marks.
Time is game seconds (FF, 900 s, scripted player that follows the guide and buys upgrades). One run per hero; the numbers are close between runs.
"Notices" = entries in the bell log; "toasts" = the ones that popped on screen.

| Hero | Window (s) | Toasts | Notices logged | Bell changes | Captions | Popup cards | Guide steps | Hint bubbles | New/dot changes |
|---|---|---|---|---|---|---|---|---|---|
| Wren | 0-60 | 9 | 13 | 3 | 2 | 0 | 5 | 5 | 3 |
| Wren | 60-180 | 12 | 25 | 8 | 1 | 1 | 4 | 1 | 3 |
| Wren | 180-300 | 5 | 14 | 8 | 0 | 0 | 3 | 0 | 1 |
| Wren | 300-600 | 7 | 8 | 1 | 0 | 0 | 8 | 0 | 1 |
| Wren | 600-900 | 4 | 9 | 3 | 0 | 0 | 2 | 0 | 0 |
| **Wren total** | 0-900 | **37** | **69** | bell ends at 32 | 3 | 1 | 22 | 6 | 8 |
| Tobin | 0-60 | 9 | 13 | 4 | 2 | 0 | 6 | 6 | 2 |
| Tobin | 60-180 | 11 | 21 | 8 | 5 | 0 | 1 | 1 | 2 |
| Tobin | 180-300 | 3 | 12 | 8 | 1 | 0 | 0 | 0 | 1 |
| Tobin | 300-600 | 6 | 6 | 0 | 0 | 0 | 0 | 0 | 0 |
| Tobin | 600-900 | 5 | 5 | 0 | 0 | 0 | 0 | 0 | 1 |
| **Tobin total** | 0-900 | **34** | **57** | bell ends at 23 | 8 | 0 | 7 | 7 | 6 |
| Pip | 0-60 | 11 | 17 | 6 | 1 | 0 | 9 | 8 | 7 |
| Pip | 60-180 | 13 | 25 | 9 | 0 | 1 | 2 | 1 | 2 |
| Pip | 180-300 | 4 | 13 | 9 | 0 | 0 | 0 | 0 | 0 |
| Pip | 300-600 | 6 | 7 | 1 | 0 | 0 | 0 | 0 | 0 |
| Pip | 600-900 | 6 | 11 | 3 | 0 | 0 | 0 | 0 | 0 |
| **Pip total** | 0-900 | **40** | **73** | bell ends at 33 | 1 | 1 | 11 | 9 | 9 |

Reading it:
- About 2.5 toasts a minute for 15 minutes, and 4 to 5 notices a minute counting the bell log. The first 3 minutes carry 20 to 24 of the 34 to 40 toasts.
- The bell badge shows "9+" (capped) from about minute 2, so it stops carrying information; the real unread count reaches 23 to 33 by minute 15.
- The 60 minute Tobin run added up to 57 toasts, 99 logged notices and 35 bell changes.
- Guide steps: Wren's 22 includes about 14 re-shows of the Parry step (FF artifact: the scripted player presses Parry at the first frame of the hint, and the step reappears at each heavy). Tobin/Pip show 7 to 11.
- "Popup cards" were the Next Up sheet (the guide's Next Up step opens it) and, in the mid-game tours, the "Great Lantern burns again" region card, which needs a Continue tap.

Repeats and copy problems in the toast list:
- 15 to 16 toasts are the same line: "Level N. Your hero hits 4% harder." (one per level, high priority, so they push older toasts out). Two often stack together.
- t=3 s: "Next Up shows your best next goal." (while the guide's own Next Up hint is on screen later) and "Your Codex holds 1 Lantern Light from your past deeds. Open it from the bell, then Journal." A new game has no past deeds.
- t=30 s (first boss clear): "Mossy Hollow is cleared...", "New tab: Hero...", "New tab: Gather...", "Level 3...", plus the Gather guide hint, plus 3 tabs marked "New".
- "Old Hesketh's lamp has gone out. 'Wood first. Then we...'" arrives as a toast on top of the "Tap the fire to light it" hint and two other toasts.
- Tutorial lines are sent as bell notices (kind "raid"): "A red ring means a heavy hit...", "Nothing stops this one...", "It is calling help...", "It is healing. Press Attack to stop it." Nine of them in 15 minutes, all counted on the bell.
- Toasts float over the open Camp, Craft and Hero panels and hide their text (e.g. the Campfire "Next: Hearth 2 (needs zone" line).

Worst-moment screenshots:
- `n15-pip-p-busy1-t2.jpg`: two toasts, the zone banner and the stage caption all at second 2, with the hint.
- `n15-wren-p-busy2-t22.jpg`: two toasts over the first fight.
- `n15-pip-p-busy3-t41.jpg`: Gather scene with the "Tap the tree" hint, two toasts, and floating damage numbers.
- `n15-wren-p-busy4-t63.jpg`: "LEVEL UP" banner plus two "Level N. Your hero hits 4% harder." toasts.
- `n15-pip-p-busy5-t82.jpg`: Camp panel with toasts over it.

# Gathering investigation (owner: "idle resource gathering isn't working")

Fresh save, Wren, 360x740. `S.mats`, `S.gProg` and `S.activity` read from the page. Node: Pine Grove (wood tier 1, 2.5 s a swing).

| Test | Result |
|---|---|
| **A. Watching the gather scene, real time, guide done** (`S.activity gather`, tips off) | Ore Vein: 0 to 7 ore in 20 s, 8 to 21 in the next 32 s: about 0.4 ore/s (gProg cycles 0 to 1 every 2.5 s). Skill 1 to 3 in 52 s. **Works.** |
| **B. Same, on another menu tab (Hero, Gather)** | Ore kept rising at the same rate with the Hero tab open (8 to 16 in 20 s) and the Gather tab (17 to 21 in 12 s). **Works.** |
| **C. Real second browser tab (page not hidden in headless)** | The page stays `document.hidden false` but its frame loop is throttled: 15 s gave +0 ore (gProg 0.15 to 0.27). The game only pays that time back through the visibility handler, which headless Chromium did not fire. In a real browser hiding the tab fires it (test D). |
| **D. Tab hidden 30 min (visibilitychange, clock moved)** | Gather: 1 ore to 785 ore (+783 Copper Ore), Mining 1 to 10; away card "You worked 30m of 4h". Fight: 88 foes, +557 gold, level 1 to 6. **Works.** (`g4-*-card.jpg`) |
| **E. Closed and reopened after 2 h (save with `last` 2 h ago)** | wood 1 to 3,410 (+3.41K Pine), Woodcutting 1 to 16, 2 achievements; away cap "of 4h". **Works.** (`g5-wren-gather-2h-boot.jpg`) |
| **F. First-session flow, idle watching the scene** | wood 0 to 8 in 20 s (real time), then **frozen at 8/5,000**: the guide's "Tap the fire to light it" step pauses the whole game (`ONBOARD.paused true`, gProg stuck at 0.06 for 16+ s of watching). Nothing gathers until the player finds the fire. (`g6-idle-watch-end-p.jpg`) After 10 min hidden it caught up (+249 logs, Woodcutting 3 to 7) and the hint cleared. |
| **G. Lighting the fire** | The hearth code calls `setActivity('fight')`: the hero walks back to zone 1 and gathering stops (toast "You return to Mossy Hollow."). Anyone who leaves the game "on gather" after lighting it comes back to a fight, and the reload/away report is a fight report. |
| **H. What the fire unlocks** | Workbench costs 20 Pine Log; Forge 25 ore + 10 wood; Store 30 wood + 20 ore; Tavern 40 wood + 20 sage. After the fire the hero is fighting, the mats are 0, and the guide's "bench" step says "Open Camp to build" but the build shows "20 more Pine Log". FF for 3,600 s: no Workbench, no tool step, no forge step (the guide never got past `bench`). The player must find Gather again unaided. Next Up does list "Chop 30 logs (8/30)". |
| **I. Taps** | Tapping the gather stage triples yield: 8 wood in 20 s idle, 23 wood in 20 s with 90 taps. |
| **J. Hired gatherers (Hands)** | Engine works (2 h shift = +309 wood), but there is no screen to hire, send or see them (P1-1). |

Conclusion for the owner's report:
1. The hero's own gather loop pays live and away, when the hero is in Gather mode.
2. A new player will not experience that: the guide pauses it at 8 logs, the fire switches them to Fight, and the fight loop never gathers.
3. The true "idle gatherers" (Hands) exist as code only. So "idle gathering" reads as broken.
4. Storehouse cap did not interfere (5,000 on a fresh game; wood/ore hit 5,000 only after more than 2 h).

# Old party leftovers (anywhere a player can see it)

Checked by scanning menu and sheet text at all three sizes, all tabs and sub-views, the bell notices, the Journal, and each hero's class card (mid-game state, level 30 to 50).

| Where | Text | Shot |
|---|---|---|
| Hero tab > tap the hero card (class card), all three heroes | "Shield Wall ... your party takes 60% less damage and deals 30% more", "Class aura: Tanks in your party get +40% health", Wren "Your whole party deals 25% more", "your party attacks 50% faster", Pip "Casters in your party get +30% attack"; "Tap: Heavy hit / Tap a foe ..." (tap attack removed); "Cast it for me when idle" | `l2-sheet-tobin-p.jpg` |
| Same card, lower | Section **BONDS**: "The Borrowed Sword, Not met yet, NOT YET", "The Banner" (Tobin); "Two Bows", "Asked" (Wren); "Lantern's Chosen", "The Missing Page" (Pip) | `ev-classcard-bonds-p.jpg` |
| Same card, Proving block | "Your party waits while you fight alone." | `ev-classcard-bonds-p.jpg` |
| Same card | "Class change: Mirror of Embers" also talks of "Two paths" that open "after the Fenmother: Reaver or Warden" (Tobin) | `l2-sheet-tobin-p.jpg` |
| Craft > Make | Filter row "For you / **For your party** / All"; "2 more recipes here for other classes and **companions**"; Pine Bow "also weapon for Strikers" | `ev-craft-forparty-p.jpg` |
| Camp > Camp | **ROSTER BOARD**: "Everyone on your roster is in the party. Benched companions rest here." | `ev-camp-roster-p.jpg` |
| Camp > Almanac | Weekly goals **"Send 3 expeditions"** and **"Gain 20 companion levels"** (can never progress; SWAP is the only way out) | `ev-almanac-companion-p.jpg` |
| Camp > Raid | Relic Hourglass: "Your party works for 4h while you're away." | `ev-raid-hourglass-p.jpg` |
| Bell > Journal | Empty stat headings **COMPANIONS** and **EXPEDITIONS** (with a stray "0 Perfect") | `ev-journal-companions-p.jpg` |
| Hero > Stars | "Boss Stalker: Your party deals +6% to bosses"; the first star text "Focus lasts 2s longer" | `ev-stars-party-p.jpg` |
| Craft > Powers | "For you / For your party / All"; "Marked pieces worn by your hero and fielded companions count."; "Expeditions with 2 or more of one circle bring its Crests." | (text, `l6-powers-wren-p.jpg`) |
| Deepwell draft | "Thorn Plate: Your tanks reflect 30% of the damage they take" | (text) |
| Bell notices | "Your Proving is open: **Party**, your class card." (the tab is Hero); "Tam ... Hire more Hands at the Tavern." | `ev-camp-roster-p.jpg` (toasts) |
| Header markup | `aria-label="What your party is doing"` on the Fight/Gather switch | (DOM) |
| First-session hint wording | Stale in code paths but not shown: `STEP_UI` still holds "New tab: Party", "meet your team", "recruit" (unused in solo) | (code) |
| Tavern recruiting, formation, Bonds tab, roster tab | Not visible: no Roster, formation, bench or recruit UI anywhere | `tour-montage-*.jpg` |
| Solo Hero tab | Clean: one hero card, Cast button, five gear slots | `tour-montage-portrait-360x740.jpg` |

# Other notes

- Console: the only error class seen was the Journal feedback error (P1-7). Two Chromium warnings: `Canvas2D ... willReadFrequently` (x2 at load). Font requests fail in the test harness only (network blocked).
- Text scan: no `NaN`, `undefined`, `Infinity` or `[object` in any tab or sub-view at 360x740, 740x360 or 1280x720 (mid-game grant state).
- The `#soloBar` stays the lowest element on the Fight view at 360x740 and at 1280x720 (square 106 px slots at 360 px wide).
- Late-game checks used state grants (`S.L 50`, `S.maxZone 60`, gold and mats granted), so they show the systems run, not that the economy reaches them.
- Not covered: audio, the online layer (tavern needs the Claude link; raid shows "out of reach" offline), reduced-motion, a real phone.
