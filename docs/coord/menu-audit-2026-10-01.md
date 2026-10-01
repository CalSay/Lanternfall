# Lanternfall menu audit (2026-10-01)

Read-only audit of every tab, sub-view and sheet. Driven with Playwright at 740x360 (main target), 390x844 and 1280x800,
on two saves: the late Region 1 save (Wren Lv 40, zone 35, `late-r1.json`) and a fresh game (Wren, 20 game minutes).
All screenshots are in this folder. `*-full.png` files are the whole view stitched, at 740x360 panel width (358 px).

**Build note.** The lead developer rebuilt `dist/lanternfall.html` twice during the audit (uncommitted work on the
Camp hero cards, then on bounties). To keep numbers stable I snapshotted the builds:
`snap-head.html` (HEAD, commit 6b008f1), `snap-working.html` (13:38, hero cards moved into an "All heroes" sheet), and
`snap-wip.html` (13:45, new bounty pool). Unless stated, numbers below come from `snap-working.html`.

**What "a screen" means here.** In landscape at 740x360 the menu panel scrolls in a 358 x 266 px area. One "screen" is
266 px. 8 of the 22 views run past 3.5 screens there. The panel is short, so every section above the useful content
costs a lot.

---

## Must fix

### 1. Camp > Tavern is the longest menu: 13.5 screens, and nine of them are hire cards
- **Measured:** 3,582 px at 740x360 (13.5 screens); 3,292 px at 390x844 (5.2 screens). "Hire gatherers" alone runs from
  509 px to 3,000 px: **9.4 screens** of hire cards (6 Legendary candidates + 3 Job board applicants), each with a bio, a
  yield line and a full-width orange "Hire for 20.0K gold" button. The player has **1 free tent** (Tents 1/2).
- The one gatherer you already own (Tam) has **5 stacked full-width buttons** (Talk, Send on a job, Trade run, Send again,
  Let go), and the header repeats "Send shifts again: 4.70K gold" above it. Two "send again" buttons on one card.
- "Rumours and perks" (Omens ahead, Gatherer leads) sits at 3,264 px, 12 screens down. "Gatherer leads" just repeats
  two of the candidates already listed above ("Dorrie Fitch is waiting at the Tavern").
- "Your hero's name" (rename) sits in the Tavern at 3,177 px. Players will not look for it there.
- Offline, "In the tavern now" and "Hall of heroes" show an empty table and a sentence each.
- **Why it matters:** the Tavern is a daily stop (send shifts, check the visitor). Every visit is a long scroll past
  people you cannot afford a tent for.
- **Fix (74-ui-hands.js, 74a-ui-tavern-perks.js, 74b-ui-trade.js, 74-ui-tavern.js):**
  1. Order: Your gatherers, then Hire, then Rumours. Put one "Send all again (4.70K gold)" button at the top; drop the
     per-card "Send again" when the top one exists.
  2. Gatherer card: one primary button (Send on a job / Send again), and a "..." (More) row that reveals Talk, Trade run,
     Let go. Let go stays behind an in-page confirm.
  3. Hire list: compact rows (icon, name, rarity, trait chips, "~12.4K Amethyst / 4h", price button). Bio text moves to a
     tap-to-open detail. Show at most 3 rows, best first, with "Show all 9". When tents are full, collapse the whole list
     to one line: "Tents full (2/2). Build a tent to hire." with a Go to Camp button.
  4. Merge "Gatherer leads" into the hire rows (a small "Lead" tag), and remove the duplicate list.
  5. Move "Your hero's name" to the Settings sheet (see item 4). Hide offline-only sections when offline; show one line
     "Online features work from the game's Claude link" instead of three empty blocks.
- Screenshots: `late-740-world-tav-full-0.png`, `late-740-world-tav-full-1.png`.

### 2. Camp > Camp is still 8.4 screens, and the camp itself starts below the fold
- **Measured:** HEAD build: **7,758 px at 740x360 (29 screens)**, 7,386 px at 390x844 (the owner's ~30 hero cards with
  bios). The lead's in-progress fix (bios moved into an "All heroes" sheet) cuts this to 2,225 px (8.4 screens) at 740x360,
  2,171 px at 390x844. Still long.
- Order today (working build): Your hero picker, 7 cards + "All heroes (32)" (0-386 px, 1.5 screens) > region chips >
  camp scene > gatherer status > Hearth card > two "Builder N: Free. Pick a building below." boxes > Trophy Wall art
  (4 empty hooks, ~250 px) > **Buildings at 1,460 px (5.5 screens down)** > **Blessings at 2,015 px (7.6 screens down)**.
- The first screen of Camp at 740x360 is all hero picker (`late-740-screen-world.png`). The camp is not visible.
- **Blessings are unused:** this Lv 40 save has `S.camp.bless = []`. A free +8% damage sits unpicked because it is the
  last thing in the longest Camp view.
- 8 of 10 buildings say "Ready to build" with identical "LV 4 · 16H Build" buttons, and both builders are idle. The
  list does not sort or highlight what to do.
- The Hearth "Build Hearth 7 · 24h" button is red (the colour used for danger elsewhere, e.g. "Let go", "Reset").
- **Why it matters:** the owner's "camp screen is cluttered". The actions a player came for (build, bless) are the last
  things on the page.
- **Fix (75-solo-ui.js `solo-hero`, 75-camp-ui.js, 75-lantern-ui.js):**
  1. Remove "Your hero" from Camp. Hero switching belongs on the Hero tab (Team view) or behind the header portrait. Leave
     a one-line link "Switch hero (3 unlocked)" if needed.
  2. New order: Builders strip (2 slots: "Free" + the top 1-2 suggested builds, each with Build) > Buildings (sorted:
     ready first, then "x of 4 costs ready", then locked) > Blessings > Hearth > camp scene and Trophy Wall last (or
     collapsible; they are decoration with no action).
  3. Drop the two "Builder N: Free. Pick a building below." boxes; the Builders strip replaces them.
  4. Blessing slot empty: show it at the top as "Pick a Blessing (free)" until one is picked. Mark the chosen one.
  5. Make the Hearth button the same orange as other Build buttons.
- Screenshots: `late-740-world-camp-full.png`, `late-740-screen-world.png`, `late-390-world-camp-top.png`.

### 3. Bounties: 7 templates on a loop (HEAD), and the WIP pool still repeats early on
- **Measured (60 claims per run, `bty.mjs`, `bounty-samples*.json`):**

  | Build | Save | Kinds seen | Distinct bounty texts in 60 | Same kind again within 3 |
  |---|---|---|---|---|
  | HEAD | late (zone 35) | 7 | **7** | 8 |
  | HEAD | fresh (zone 2) | 7 | **7** | 7 |
  | WIP (`snap-wip.html`) | late | 15 | 27 | 0 |
  | WIP | fresh | 9 | **13** | 0 |

  On HEAD every text is fixed for a 10-zone band: "Press Attack 100 times", "Land 25 critical hits", "Chop 55 logs",
  "Mine 55 ore", "Beat 2 zone bosses", "Defeat 70 foes in zone 32 or beyond", "Forge 2 items". The pick is uniform,
  so "Press Attack 100 times" is 1 in 7 of all bounties. Need scales only by +25% per 10 zones, so numbers never change
  between bounties.
- The WIP (lead's uncommitted 55-bounties.js) helps a lot late game (hunt a named foe, gems, forage, make at a station,
  gatherer jobs, Deepwell floors, Contracts). It does not fix: the fresh-game pool (9 kinds, still "Defeat 40 foes in
  zone 1 or beyond" and "Press Attack 100 times"); fixed numbers per kind; no reason to pick one over another.
- Many bounties finish by themselves (kills, crits, ore/logs while away), so the board becomes "open menu, press Claim".
- Rewards are flat: gold is ~4 minutes of income (384 gold with 203K in the bank), materials are 45 of your own top
  tier ore. Nothing to look forward to.
- UI: the right-hand box "BOUNTY 16%" looks like a button but is a disabled progress label. Progress shows three times
  (4/25 in text, a bar, and the %). "Swap (free)" on each row, with no clue what swap costs later (1 per hour).
- **Why it matters:** the owner's complaint. A bounty board that never surprises stops being read.
- **Fix (55-bounties.js, 75-bounties-ui.js, 60-bounties.css):**
  1. Keep the WIP pool and the "recent kinds wait their turn" rule. Add content-tied kinds that use names the game
     already has: "Beat the Wraithmarsh boss", "Defeat 3 champions", "Beat Quarry Golems in Wraithmarsh V", "Craft a
     Tier 4 item", "Upgrade an item to +11", "Find 20 rare finds", "Reach floor 10 in the Deepwell", "Finish a shift at
     the Silver Seam". Early game: kill a named foe in your zone, reach zone N+1, train a move, chop at a named node.
  2. One board = one Quick (5-10 min), one Standard, one Long/Contract. Label the size. Randomise need within +-30% and
     scale the reward with it, so two "Chop logs" bounties are not identical.
  3. Remove "Press Attack N times" and "Land N critical hits" from the pool, or cap them at one per day. They need no
     choice and complete passively.
  4. Rewards worth reading: lead with the reward ("Reward: 2 Tidelit Essence + 1 Trophy"), add Renown, Depth Marks,
     trophies, a better unique roll on boss bounties; claim 3 in a row for a small crate (streak).
  5. Row layout: the button only appears when done ("Claim"); otherwise show a "Go" button that takes you there, like
     Next Up does. Progress once (bar with "4/25" on it). "Swap (free)" becomes "Swap" with "1 free swap per hour" in
     the section note.
- Screenshots: `late-740-adv-bounties-full.png`, `late-390-adv-bounties-top.png`.

### 4. Settings are hidden at the bottom of the Journal (13 screens of stats)
- **Measured:** bell > Journal is a 3,842 px scroll inside a 292 px sheet body at 740x360 (13 screens; 3,970 px at
  390x844). After all the lifetime stats come: Numbers format (2,889 px), Tips on/off (2,889), Combat settings (2,971),
  Send feedback (3,151), **Save code export/import (3,426)**, and the Test "Turn-based fights" switch (3,751).
- Other settings are elsewhere: hero name in the Tavern, "Nudges in Next Up" in Achievements > Deeds, sound on the stage.
- The Codex (Lantern Light, Story with "4 pages, 4 new" unread) opens only from the Journal or a Library camp action.
- **Why it matters:** the save code is how testers move saves. Nobody looks for settings under "Journal".
- **Fix (70-ui.js bell sheet, 75-stats-ui.js, 75-savecode-ui.js, 75-feedback-ui.js, 75-onboard-ui.js, 75-turn-ui.js,
  75-combat2-ui.js):** add a third bell tab, **Settings**: Name, Numbers, Tips, Next Up nudges, Combat, Sound, Save code,
  Feedback, Test. Journal keeps stats only. Give the Codex its own entry (a button on the Hero tab or the header
  portrait menu next to Achievements), with a dot when Story pages are unread.
- Screenshots: `late-740-journal-settings.png`, `late-740-pop-journal.png`, `late-740-pop-codex.png`.

### 5. Next Up misses free power the player is leaving on the table
- In the late save, Next Up lists only: Boss ready, "Tam is at camp: send again", "197 rare finds to Lucky Strike III".
  It does not mention: **13 of 13 star points unspent** (Hero > Stars), **no Blessing picked**, **2 idle builders with 8
  buildings ready**, **Parry Lv 0 trainable for 10 gold** (with 203K gold).
- **Why it matters:** these are the biggest free power gains in the save, each buried in a different menu.
- **Fix (55-goals.js):** add "free power" goals with high priority: unspent star points, empty Blessing slot, idle
  builder with a ready build, a move that trains for under 1% of your gold. Each with Go to the exact view.
- Screenshots: `late-740-pop-nextup.png`, `late-740-party-stars-full.png`, `late-740-party-training-full.png`.

---

## Should fix

### 6. Achievements > Feats: 14 screens, finished feats first
- **Measured:** 3,713 px at 740x360 (14 screens), 3,532 at 390x844. The first ~12 cards are COMMON feats already done
  (25/25, 3/3...). In-progress and locked feats come after.
- **Fix (75-deeds-ui.js, Feats view):** sort in-progress by % done first; collapse finished feats into one line "18 done
  (show)". Show the reward on one line under the name. One column of compact rows at 358 px width reads better than the
  two narrow columns that wrap every title.
- Screenshot: `late-740-deeds-ach-feats-full-0.png`.

### 7. Item detail sheet shows ~2 stat lines at 740x360
- **Measured:** the sheet body is 220 px tall over 744 px of content (3.4 screens) at 740x360. The header (icon, name,
  rarity, tier, "Weapon for you · Power 337", "You wear it") uses most of the height. Only "+337% damage" and one bonus
  line are visible.
- **Fix (75-craft-ui.js `openItem`, sheet CSS in 80-landscape.css):** in landscape, use a two-column sheet: icon, name
  and actions on the left; stats scrolling on the right. Or shrink the header to one line (name + "+10 · Rare T4 Bow").
- Screenshot: `late-740-pop-item.png`.

### 8. Fight > Deepwell: the weekly Trial is shown twice
- **Measured:** 1,746 px (6.6 screens). The top card already lists "This week's Trial: Glass Week · Damage x2..." and
  then a full "Weekly Trial" card repeats it. The shop (8 rows) uses the same lantern icon on every row.
- **Fix (75-deepwell-ui.js):** keep the start buttons in the top card; move Trial detail (floor rewards, best, seals)
  into a "Trial details" expander. Shop rows: put affordable rows first, maxed rows last.
- Screenshot: `late-740-adv-deep-full.png`.

### 9. Craft > Make: masterwork chips and an unusable default tier
- **Measured:** 1,427 px (5.4 screens). "For you" opens on Tier 5, where all 5 recipes are missing materials (all red).
  The Masterwork picker takes 4 rows of chips (~230 px, almost a full screen) before the first recipe.
- Station names truncate ("Workben...", "Enchant...").
- **Fix (75-craft-ui.js, 73-ui-forge.js):** default to the highest tier with at least one craftable recipe; show "Tier 5:
  need Tide Kelpie Hide (from fights in ...)" as a single line. Masterwork becomes one dropdown row ("Masterwork: None
  ▾"). Station tiles: short labels (Forge, Bench, Loom, Enchant).
- Screenshot: `late-740-forge-make-full.png`.

### 10. Gather: the same node listed twice, and truncated names
- **Measured:** Mining 870 px (3.3 screens), Foraging 872 px. "Best for you" lists Silver Seam and Amethyst Grotto, then
  the Veins and Geodes lists show them again. Truncated: "Kelp Sha...", "Flax Pat...", "Briar Th..." (the "Home +25%" tag
  eats the name), "308 a min · rarest ore you c...". Pack: 9 labels cut ("Mangro...", "Hemp F...", "Storm...",
  "Tide Ke..."), and the filter row is cut off at "Herb".
- **Fix (72-ui-gather.js, 75-store-ui.js):** drop "Best for you"; instead mark the best row in each list with a "Best"
  tag and sort it first. Move "Home +25%" under the name. Pack: two-line labels or a 4-column grid at 358 px; let the
  filter chips wrap or scroll with a fade.
- Screenshots: `late-740-gat-mine-full.png`, `late-740-gat-forage-full.png`, `late-740-gat-pack-full.png`.

### 11. View switcher is cramped in landscape, and the close button looks like "more"
- At 740x360, Fight shows "Boss | Bounties | Bestiary | Deepwell" squeezed into 4 tabs with "Deepwell" and Camp's
  "Almanac" clipped by their neighbours. The close button is a right chevron (>) at the end of the row, which reads as
  "more tabs".
- The first Fight view is labelled "Boss" (id `upgrades`) and holds only the Omen banner, the Boss gate and one checkbox
  (266 px).
- **Fix (70-ui.js, 80-landscape.css):** use an X (or a down chevron, as portrait does) for close. Allow the switcher to
  scroll horizontally with a fade, or shorten labels (Boss, Bounty, Beasts, Deep). Consider merging Boss into Bounties
  (Boss gate on top, bounties under it) so Fight has 3 views.
- Screenshots: `late-740-screen-adv.png`, `late-740-screen-world.png`.

### 12. Almanac: a wall of text after a week, and an Omen shown in two places
- After a week rolls over, a 180 px yellow box lists every reward in one sentence ("40 Amethyst Shard, 40 Silver Ore,
  40 Sea Lavender Sprig, 20 Depth Marks; 100 Amethyst Shard...").
- The day's Omen ("Cheap Reforge · 1 TO CLAIM") also tops Fight > Boss, so the same claim appears in two menus.
- Fresh game: the Omen is "Cheap Reforge... Best today: the Forge" before the player can craft or reforge.
- **Fix (75-almanac-ui.js):** summarise: "Last week: 3 goals done. Rewards added to your pack. (Details)". Show the Omen
  banner on Fight only when it affects fighting. Pick a fallback Omen the player can use when its feature is locked.
- Screenshots: `late-740-world-almanac-full.png`, `fresh-740-world-almanac-full.png`.

### 13. Camp > Raid offline is a dead screen
- Offline: "The shared world is out of reach", "-" and zeros, a disabled "March to the raid", and four Relic rows whose
  disabled "FORGE" buttons are near-unreadable purple-on-purple.
- **Fix (74-ui-raid.js; online layer frozen, so copy and layout only):** offline, collapse to one card: "Raids work from
  the game's Claude link. Your Relics:" plus the relic list. Give disabled buttons the shared disabled style.
- Screenshot: `late-740-world-raid-full.png`.

---

## Nice to have

14. **Bestiary (5.4 screens):** every card ends with "You know it well: +5% damage to it." Show that once in the section
    note; sort foes of the current zone first; collapse other zones. (75-mastery-ui.js)
15. **Uniques:** found items are mixed among nine "???" cards. Sort found first; group "???" by source ("Zone bosses: 1
    left · World raid: 7 left"). (75-craft-ui.js uniques section)
16. **Hero > Team** is one card (283 px) whose gear row repeats Craft > Gear. If hero switching moves here (item 2), this
    view earns its place; otherwise merge Team into Training. (75-party.js, 75-solo-ui.js)
17. **Training:** "Dodge · Train 9.6" shows a decimal gold price. Round prices to whole gold. "Lv 40 is the most a base
    class can train. Pass the Proving..." repeats on every maxed move: say it once above the list. (75-training-ui.js)
18. **Stars:** "13 of 13 points left" is easy to miss. Add a dot on the Hero tab while points are unspent (same rule as
    other tab dots). (75-stars-ui.js)
19. **"New" badges** on every tab (Hero, Gather, Craft, Camp) on a Lv 40 save until each is visited. Fine for real
    players, but consider suppressing them when the save is far past the unlock. (75-onboard-ui.js)
20. **Bell badge "1" with "Nothing yet"** in Notices after collecting the away report: the badge counts something the
    sheet does not show. (70-ui.js / 23n-data-notices.js)
21. **Achievements > Tracks:** the track tabs overflow at 358 px ("Wealth" cut). Wrap them or use a select.
22. **Gear > Bag:** worn items fill the bag grid (7 of 11 tiles have the portrait badge). Default the bag filter to
    "Spare". (75-craft-ui.js)

---

## Per-menu scorecard

Screens = scroll height / visible panel height. 740x360 panel: 266 px; 390x844: 631 px. Late save, working build.

| Menu > view | 740x360 | 390x844 | Verdict |
|---|---|---|---|
| Fight > Boss | 1.0 | 1.0 | Thin (Omen + Boss gate). Merge with Bounties (11). |
| Fight > Bounties | 1.8 | 1.0 | Short, but repetitive content and a fake-button % (3). |
| Fight > Bestiary | 5.4 | 2.1 | Long; repeated line per card (14). |
| Fight > Deepwell | 6.6 | 2.6 | Trial shown twice (8). |
| Hero > Team | 1.1 | 1.0 | Fine, thin (16). |
| Hero > Training | 2.1 | 1.0 | Fine; repeated cap text, decimal price (17). |
| Hero > Stars | 2.8 | 1.3 | Fine; unspent points not flagged (5, 18). |
| Gather > Mining | 3.3 | 1.4 | Duplicate rows, truncation (10). |
| Gather > Wood | 2.2 | 1.0 | OK; same duplicate pattern. |
| Gather > Foraging | 3.3 | 1.4 | Truncated names (10). |
| Gather > Pack | 3.9 | 1.7 | Truncated labels, cut filter row (10). |
| Craft > Make | 5.4 | 2.1 | Chip wall, empty default tier (9). |
| Craft > Gear | 2.3 | 1.0 | OK; bag mixes worn items (22). |
| Craft > Uniques | 3.3 | 1.3 | OK; sort found first (15). |
| Camp > Camp | **8.4** (HEAD **29.2**) | 3.4 (HEAD 11.7) | Must fix (2). |
| Camp > Tavern | **13.5** | 5.2 | Must fix (1). |
| Camp > Almanac | 3.3 | 1.3 | Text wall after a week (12). |
| Camp > Raid | 3.2 | 1.3 | Dead offline (13). |
| Achievements > Deeds | 2.9 | 1.2 | Good. |
| Achievements > Tracks | 3.2 | 1.3 | Tabs overflow (21). |
| Achievements > Feats | **14.0** | 5.6 | Should fix (6). |
| Achievements > Looks | 4.4 | 1.9 | OK. |
| Bell > Notices | fits | fits | Badge/count mismatch (20). |
| Bell > Journal | **13.2** (sheet) | 5.6 | Settings buried (4). |
| Next Up sheet | fits | fits | Misses free power (5). |
| Switch activity sheet | fits | fits | Good: clear rows, one button each. |
| Item detail sheet | 3.4 (sheet) | 1.3 | Header crowds stats (7). |
| Codex sheet | 2.5 (sheet) | - | Good, but hard to find (4). |
| All heroes sheet (WIP) | - | - | Lead's fix; 3 cards per row with bios. |

## Files in this folder

- Scripts: `lib.mjs` (loader; `SNAP=` picks a build), `measure.mjs`, `full.mjs`, `pops.mjs`, `pops2.mjs`, `sheets.mjs`,
  `journal.mjs`, `secs.mjs`, `trunc.mjs`, `bty.mjs`, `stitch.py`.
- Data: `measure-late.json`, `late-740-texts.json`, `fresh-740-texts.json`, `bounty-samples.json` (HEAD and working),
  `bounty-samples-wip.json`.
- Screenshots: `late-740-*-full.png` (every view, stitched), `late-390-*-top.png` / `late-740-*-top.png` (first screen of
  every view), `late-740-screen-*.png` (whole screen with each tab open), `late-740-pop-*.png` (sheets),
  `fresh-740-*.png` (fresh game).
