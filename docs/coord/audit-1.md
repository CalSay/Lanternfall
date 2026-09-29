# Audit 1: every system after the solo-hero pivot (AUDIT1, 2026-09-29)

Read-only audit of `claude/elegant-johnson-m6k00u`, done at 6365c96. Line numbers and the gathering repro were
checked again on 76cc929 (after SOLO2 and the Training draft). Source at 6365c96:
41,290 lines of JS in 118 files (2.76 MB), 3,060 lines of CSS, 8,768 lines of tools. Direction:
docs/design/solo-hero.md. Evidence came from reading the code, `tools/sim.mjs`, and Playwright runs against
`dist/lanternfall.html` (scripts are in the session scratchpad, not the repo).

## Summary

- **The idle gathering bug is the guide, not the art.** After you light the fire, the guide shows "The fire burns.
  Open Camp to build." That step pauses the whole game (`ONBOARD.paused`, 90-boot skips `tick`). The Workbench needs
  20 logs and you have 0, and gathering only moves by tapping. An idle player stays stuck until they tap 170 times or
  close the tip. Details in 3.1.
- **About 23% of the game code is dormant party code or has no way in.** About 9,500 JS lines, 700 CSS lines and
  2,800 tool lines can go. Saves can be wiped, so delete it; don't keep it behind `SOLO_TUNE.on`.
- **The tests mostly check the dormant game.** `check.mjs` loads the party build (`__SOLO = 0`) by default. Only
  about 500 of its 6,541 lines run the solo game, so a passing check says little about what the owner plays.
- **Legendary powers never drop.** No drop source calls `legendDrop`, and most of the 43 powers have no combat
  wiring (`bonus('lg:<id>')` has no reader).
  Pinnacle bosses are 587 lines of data with no engine.
- **Notifications:** a fresh game shows 36 pop-up toasts, 15 stage captions and 9 guide steps in its first 5
  minutes, 9+ on the bell after 1 minute, and 118 toasts in 30 minutes (section 3b).

---

## 1. System map

Lines = JS lines (files named). Verdicts: **KEEP**, **REWORK** (for solo), **REMOVE**, **MERGE**.

| System | What it does | Files | Lines | Verdict | Why |
|---|---|---|---|---|---|
| Core loop | Save, rules, tick, kills, harvest, away gains, boot | 00, 05, 10, 20, 30, 40, 41, 50, 51, 90 | 1,245 | KEEP, trim | Drop `S.comp`, `COMPS`, `compDpsOne`, `hireComp` (Stage A companions) |
| Online layer | Raid maths, db/room/user, raid and tavern tabs | 52, 80, 74-ui-raid, 74-ui-tavern | 221 | KEEP untouched | Owner rule; only copy outside it (50-sim raid toast) changes |
| Solo hero | Starters, buttons, parry/dodge/counter, 3 ability slots | 24b, 59j, 75-solo-ui | 620 | KEEP (in flight) | The new core; another agent owns it now |
| Gold upgrades | Blade, Swiftness, Precision (`HERO_UPS`, `buyHero`) | 20-data, 40-rules, 51, 71-ui-fight | ~60 | REWORK into Training | Owner: gold trains Attack, Parry, Dodge and abilities (solo-hero.md "Training") |
| Relics | Warbanner, Loaded Die, Ember Heart, Hourglass (embers) | 20-data, 51, 74-ui-raid | ~40 | KEEP, retune | The raid's reward shop. Warbanner (+20% a level, no cap) competes with Training, so cap it or trim it in the retune. Hourglass copy says "Your party works" |
| Combat engine | Packs, HP, threat, heals, knock-outs, wipes, hold estimate | 59-combat | 1,379 | REWORK (slim) | Solo runs it as a party of one. Threat, heals, cover, formation reach and the multi-unit hold estimate are dead weight |
| Active combat | Warnings, parry/dodge, cast bars, stagger, Finisher | 59g, 59b, 75-combat2-ui | 920 | KEEP, trim | Solo buttons sit on it; drop the party-only parts (dives picking a target, per-member Keen) |
| Bosses and elites | Boss kits, elite traits | 59h, 59i, 21g | 563 | KEEP | Heavy telegraphs are the heart of solo combat |
| Types and statuses | Damage types, 8 statuses, reactions | 59a, 21x, 61b | 578 | KEEP, trim | Party-side statuses (`stUnit*`) shrink to one unit |
| Classes (base) | Warrior/Ranger/Mage, kits, Mirror respec | 24-data-classes, 55-classes, 55-party, 76-create | 1,538 | REWORK | Heroes, not classes, carry kits now. `55-party.js` still runs the four Stage A kits (Flare, Volley, Blessing) |
| Evolutions and the Proving | 6 evolutions, ab2, Tactics, trials | 59e, 59f, 75-class-ui | 979 | REWORK | Owner: the Proving becomes Ascension. Evolutions become subclasses; ab2 and Tactics go |
| Star map | 4 class maps of 31 stars, keystones | 57e, 75-stars-ui | 971 | REWORK | Becomes each hero's upgrade tree (branches); keystones route through the old kits |
| Roster | 18 characters, levels, promotions, recruiting | 56-roster, 21-stories | 800 | REWORK | Becomes the hero registry (32 heroes, 3 starters). Levels and promotions go; bios stay |
| Unlock routes | Quests, Renown, tokens, bestiary, Kingslayer, Star Chart, visitor | 56c, 75-unlocks-ui | 511 | REWORK | Owner: these become the ways to unlock a playable hero |
| Synergy and Bonds | Slot jobs, combos, Kin, 21 Bonds, traits | 56b, 56f, 21f-stories-bonds, 75-bonds-ui | 1,382 | REMOVE | Owner: Bonds, combos and Kin leave the game |
| Formation and planner | Slots, line-up planner, pins | 56e, 56d | 991 | REMOVE | Owner: formation removed. Solo calls only `heroStand` (always 1) |
| Party tab | Team, bench, roster, character sheet | 75-party, 75-party-sheet | 1,329 | REWORK (cut ~75%) | Keep the hero card, gear rows and the star map entry |
| Well Rested | Party rests while the hero gathers | 55-rested | 70 | REWORK | Dead in solo (`restParty()` needs a fielded companion). Make the hero rest: gathering banks rest |
| Expeditions | Companions on timed routes, Crests, keepsakes | 57b, 75-exped-ui, 21i-lore-exped | 920 | REMOVE, then rebuild in Hands | Owner: gatherer trade runs. Hidden in solo already (`maproom.needs`) |
| Hands and gatherers | Townsfolk gather at a share of your rate | 57f, 21f-data-hands | 709 | KEEP, extend | Gets trade runs |
| Camp and Hearth | Buildings, builders, Blessings, cold start | 57, 55-hearth, 75-camp-ui, 63d, 55-welcome | 1,406 | KEEP, trim | Tavern tiers, Map Room, Library "companion XP" and the Kin Blessing need solo perks. `55-welcome` is a v1-save welcome: remove |
| Storehouse | Caps, parcels, Spillover | 55-store, 75-store-ui | 468 | KEEP | Its old-save migration can go |
| Gathering and tools | Nodes, drops, Glint, tools, mastery, scenes | 55-gathering, 55-tools, 72, 75-tools-ui, 63c, 11c, 55-skillpace | 1,818 | KEEP, fix | Fix the guide pause (3.1) and the hero's gather pose. `55-skillpace` is an old-save rule: remove |
| Crafting | Stations, recipes, affixes, Reforge, companion gear | 21-data-craft, 55-crafting, 75-craft-ui, 73, 11-art-craft | 1,775 | KEEP, trim | Drop companion gear, role trinkets and the "For your party" block. Recipes follow the hero's weapon family |
| Economy | Gold curve, prices, crit damage pool, ledger, pace | 21w, 55-econ, 55-pace | 244 | KEEP | Training reprices on this curve |
| Deepwell | Runs, boons, Oil, Marks, weekly Trial | 57d, 59c, 75-deepwell-ui | 1,473 | KEEP, fix | "Company Week" makes the hero x0.01 (3.5); party HP between floors and Taunt Drill go |
| Legendary powers and circle sets | Lantern Book, Inscribe, Mark, Sigils, sets | 55-legend, 75-legend-ui, 21c, 11b | 1,636 | REMOVE | Nothing drops them (3.7); most powers have no wiring; sets are companion circles. The chapel's boss items replace them |
| Pinnacle bosses | Four endgame bosses, data and writing only | 21d, 21e | 587 | REMOVE from src | No engine ever landed; mechanics assume a party. Keep pinnacles.md for a solo redo after CB3 |
| Achievements (old) | 22 milestones with small bonuses | 56-achievements | 70 | MERGE into Deeds | Two achievement systems toast side by side ("Achievement: First Spark" and "Crownbreaker I") |
| Deeds (achievements) | 92 tracks, feats, looks, Trophy Wall | 23, 58, 75-deeds-ui, 63e | 2,438 | KEEP, trim | Companion and expedition tracks are hidden in solo but the feats still list "Sworn Bonds 0/21" |
| Looks | Capes, hats, lantern skins, critters | 12g, 13b, 64-looks | 818 | REWORK later | They draw on the B1 body; the new art needs its own overlay points |
| Codex | Pages, Lantern Light, milestones, Page Seals | 57c, 75-codex-ui | 915 | KEEP, trim | Companions and Bonds pages go; 15 of 22 milestone rewards are not live ("saved for later") |
| Story and lore | Arrivals, beats, elder lines, Great Lanterns, regions | 55-story, 75-story-ui, 21h, 21b, 21j, 55-lantern, 75-lantern-ui, 22 | 1,058 | KEEP, extend | Gets the NPC campaign story. Elder intro and fall captions add to the noise (3b) |
| Almanac | Daily Omen, Dare, weekly board | 55-almanac, 75-almanac-ui | 717 | KEEP, fix copy | Omens and weekly goals name companions |
| Bounties | 3 short goals | 55-bounties, 75-bounties-ui | 158 | KEEP | Renown feeds hero unlocks |
| Mastery and bestiary | Zone stars, bestiary perks | 55-mastery, 75-mastery-ui | 121 | KEEP | The golem perk says "tap damage": call it Attack damage |
| Next Up | Goals across systems | 55-goals, 75-goals-ui | 401 | KEEP | Roster, recruit and promote goals become hero-unlock and Training goals |
| Onboarding | Unlocks and the guide | 55-onboard, 75-onboard-ui | 499 | REWORK now | The pause bug (3.1), the notification policy (3b). Drop `PARTY_STEPS` |
| Navigation and UI shell | Tabs, views, toasts, bell, pill, switcher | 70, 71, 55-nav, 75-nav-ui | 1,354 | KEEP | The toast policy lives in `showToast` (70-ui) |
| Away and stats | Away card, lifetime stats, Journal | 75-away, 55-stats, 75-stats-ui | 591 | KEEP, fix copy | "Your party worked", companion stats rows |
| Save codes | Export and import | 55-savecode, 75-savecode-ui | 282 | KEEP | |
| Feedback and errors | Error ring, Send feedback | 55-errors, 75-feedback-ui | 223 | KEEP | |
| Audio | WebAudio sounds | 76-audio | 113 | KEEP | |
| B1 art kit | Body kit and baker (enemies, critters, NPCs) | 12a, 60b | 865 | KEEP | Enemies, critters and Hesketh still use it |
| B1 hero and companion outfits | 4 class outfits, 18 procedural companions | 12b-12f | 1,079 | REMOVE (mostly) | New GPT art replaces them. Keep Hesketh, and the others only until each hero ships new art |
| Hero art | GPT poses, runtime animation | 21y, 64h | 423 | KEEP, extend | Needs gather poses (art backlog) and a stopgap gather motion now |
| Enemy art | B1 enemy, boss and node rigs | 13 | 568 | KEEP | Until the GPT enemy art lands |
| Stage and scenery | Stage canvas, anim pools, backgrounds, gather/camp/wall scenes | 60, 61, 62, 63, 63c, 63d, 63e | 4,838 | KEEP, trim | `62-stage` draws packs for 3 party members (order, lanes, heal motes, cast-on-ally) |
| Tools | build, check, sim, perf, heroart, savecode, serve | tools/ | 8,768 | REWORK | check and sim default to the party build; perf fails in this container |

## 2. Party-removal fallout (live solo paths and text)

Each row is something a solo player can still hit, and its replacement.

| Where (file) | What still assumes a party | Solo replacement |
|---|---|---|
| Rattlebone Charm (20-data.js:80) | "Your party deals 15% more damage." `fx.party` only feeds `compDps`, which is 0 in solo. **The zone-3 unique does nothing** | "Your abilities deal 20% more damage." (`fx.abil`, read by `soloAbility`) |
| Lantern Eater's Fang (20-data.js:89) | "+30% damage and your party deals 20% more" | "+30% damage. Counters after a parry deal double." |
| Golemfist, golem bestiary perk | "Your taps deal double damage", "tap damage" (taps are the Attack button now) | "Your Attack deals double damage", "Attack damage" |
| Hourglass relic (20-data.js:123) | "Your party works for Xh while you're away" | "You keep working for Xh while you're away" |
| 56-achievements "Full Party" | Recruit 7 companions, +3% party damage | Delete (merge into Deeds, below) |
| Deeds: companion group (23-data-deeds.js:137-141) | Full Table, Promoted, Top Rank, Seasoned Company (hidden in solo). Feats "Sworn Bonds 0/21", Kindred and Side by Side still show | A **Heroes** group: heroes unlocked (3/8/16/32), heroes at level 25, abilities Hallowed, heroes Ascended. The feat becomes "the Road's People" (campaign chapters finished) |
| Deeds bonus keys `compXp`, `expHaul` | Companion XP, expedition haul | `train` (Training costs -X%), `trade` (trade-run goods +X%) |
| Legendary circle sets (21c:272) | Sets = companion circles; "worn by your hero and fielded companions" | Remove with legendaries. If sets return, group them by **region bosses** (2 or 4 pieces of the Hollow's elders' gear) |
| Tavern tiers (57-camp.js:363) | 1 daily visitor; 2-3 rumours of visitors and recruits | 1: the keep's gossip (tomorrow's Omen). 2: a trader's daily offer and Hands applicants. 3: rumours say where your next hero waits (unlock leads). 4-5 stay (bounty pay, Renown) |
| Tavern visitor (56c `visitorToday`, 75-unlocks-ui) | A companion comes to hire on | The visitor is a campaign NPC. Visits carry a story beat and sometimes a hero-unlock lead |
| Library Lv 2+ (57-camp.js:364) | "Companion XP +5%" | "Resting heroes gain X% of your XP" (the two starters you are not playing) |
| Kin Blessing (57-camp.js:108) | +15% companion XP (Codex Companions page) | **Heroes** Blessing: +15% XP for heroes not carrying the lamp. The page becomes "Heroes" |
| Map Room, Wayfarer Blessing, Codex "+1 expedition slot" | Expeditions (hidden in solo) | Trade Post (Map Room renamed): trade-run slots. Wayfarer: trade runs bring +15% |
| Watchtower Lv 2 (57-camp.js:376, 551) | "the zone your party could hold" | "the zone you could hold" |
| Next Up (55-goals.js:148-177) | Promote, recruit (filtered in solo by `SOLO_NO_GOAL`) | `hero-unlock` ("Tobin's route: 3 of 5 Fenmother tokens"), `train` (a move can level), `chapel` (a boss item is ready for Elowen) |
| Almanac (55-almanac.js:75, 235, 281-282) | Omen "Companions earn +50% XP", "Set your party up", weekly "Gain 20 companion levels", "Promote a companion" | Omen "Training costs 25% less"; weekly "Train 10 levels", "Parry 30 heavy hits", "Counter 20 times" |
| Pinnacles (21d, 21e) | Kneel/charm the party, "Your whole party fell. More healing, or a tank in front" | Rebuild after CB3 as solo exams: the King (a parry chain), the Lure (dodge the pull, then interrupt), One Hour (a damage race), Below (a Deepwell floor 50 boss) |
| Combat-2 threats (59b, 59g) | Backline divers pick a member, taunts and threat, cover, guards on allies | Dive = a leap heavy at you (Dodge). Taunt and threat go. Cover becomes Tobin's Shield Bash guard. Guards shield a foe until a counter breaks them. Interrupts stay (Attack) |
| Deepwell (57d:69, 86-141, 633-645; 59c) | Company boons (filtered), **Company Week** rule, "The party heals", "Your party fills the stagger bar", Taunt Drill, party HP | Company Week becomes **Echo Week** (cooldowns x0.5, Attack x0.5). Boons say "you". Taunt Drill becomes Parry Drill (+0.05 s window in the Deepwell) |
| Well Rested (55-rested, 72-ui-gather.js:247) | "Your party rests at the Hearth" | Gathering banks rest for the hero: +10% damage for the next fight, same numbers |
| Proving and evolutions (75-class-ui.js:40, 55-classes.js:310) | "Your party waits while you fight alone", "Your Proving is open: Party, your class card" | Ascension copy: "The Fenmother has fallen. Wren can Ascend: Hero tab." |
| Stars (75-stars-ui.js:23, 311) | "New on the Party tab: Stars", "With party combat:" | "New on the Hero tab: Stars" and drop the stale suffix |
| Craft (75-craft-ui.js:205-834) | "For your party", "Hide companions", companion gear, "(active with party combat)" | Remove companion gear and role trinkets. Recipes filter by the hero's weapon family. Drop the stale "party combat arrives" lines (it has) |
| Raid (50-sim.js:14) | "Your party marches to the raid" (not solo-gated) | "You march to the raid." |
| Away card (75-away.js:89, 94), Deepwell fall (75-deepwell-ui.js:236), lantern strip "Your party is here" (75-lantern-ui.js:100) | Party copy | "You worked", "You fell", "You are here" |
| Stats wall (75-stats-ui.js:87-91) | Companions, Companion levels, Hours fielded together | Parries, dodges, counters, abilities cast (`SOLO_STATS` has them), heroes unlocked |
| Raid presence `{hero, lvl, zone, act, raiding}` | Fine as is (`hero` is a name) | No shape change. Optional: put the playing hero's name in `hero` |
| Story (21-stories, 21f-stories-bonds, 76-create "A companion joins") | Join lines and bios written for recruits | Bios stay as hero bios. Join lines become the hero-unlock card. Bond writing stays in docs only (owner) |
| Hero picker (75-solo-ui.js:238, 76-create) | Draws the old B1 companions (a green-hooded Wren) next to the new art | Use `heroArtPortraitURL` or a camp-pose crop |
| Hero tab "Roster" view (75-party.js:699) | Registered even in solo; empty when forced open | Don't register it in solo |

## 3. Broken or suspicious

### 3.1 Idle gathering stops (the owner's bug)

**Cause:** guide steps that wait for an action pause the whole game, gathering included, while that action needs
gathered materials.

- `90-boot.js` frame(): `if (!(ONBOARD.paused || soloPickerOpen() || ...)) tick(dt)`. Gathering progress (`S.gProg`)
  only moves in `tick` (50-sim.js:172).
- `75-onboard-ui.js:204` sets `ONBOARD.paused = !!step.pause` whenever a step shows.
- `55-onboard.js:97-100`: `bench`, `tool`, `forge` and `store` all have `pause: 1`. Right after the fire is lit, `bench`
  shows ("The fire burns. Open Camp to build."). The Workbench costs 20 Pine Log (55-hearth.js:50), and the 8 logs
  just went into the fire.
- Taps still work (`tapNode` runs from the stage's pointerdown, outside `tick`). The bubble's × ends the step and
  unpauses the game (75-onboard-ui.js:105), but nothing tells the player that; the next build step pauses again.

Repro (Playwright, 360x740): new game, first boss, Gather, 8 logs, light the fire. `S.gProg` stays at 0.382 for 10 s
with 0 wood. 30 taps give 3 logs. A bot that plays the guide but does not tap sat on the `bench` step for 7.5 real
minutes, with the game clock stuck at 44 s. Same result on 76cc929. By the same rule `tool` (needs ore) and `store` stall too. `nextup`
(done only by tapping the chip) and `tab:party` also pause while you stand in the grove.

The core is fine: in Node, 60 s of `tick` at the Pine Grove gives normal progress, and 2 h of away time gathers
+4,300 logs (`awayBase`). Offline gathering works.

**Why it looks like missing art:** `64h-hero-sprites.js:336` plays `campIdle` (bow slung, arms relaxed) whenever
`target() === 'node'`, and ignores the stage's `lunge` swings. The hero never moves while chips fly off the tree.

**Fix:** pause only while a step's target is a button the player can press right now. Never pause while
`S.activity === 'gather'`, or when the step's build or recipe is short of materials; let the guide say "Chop 20
Pine Log for the Workbench" instead. Stopgap art: on each `lunge` at a node, play the `attack` frames with the tool
drawn over the weapon until the GPT gather poses land.

### 3.2 Other bugs

| # | Bug | Evidence | Fix |
|---|---|---|---|
| 3.3 | Guide and camp say **Oak**, but tier-1 wood is **Pine** | 20-data.js:36 `short: ['Pine', ...]`; 75-onboard-ui.js:137, 147 "chop Oak"; 75-camp-ui.js:154 "Light the fire · 8 Oak", 183; 56-roster.js:79 Bram's quest "Oak Logs" | Say Pine (Oak is tier 3) |
| 3.4 | New game pops "Your Codex holds 1 Lantern Light from your past deeds" at 2 s | 57c-codex.js:470-473 (`past` = any kill); seen in the Playwright run | Only for imported saves, or drop it |
| 3.5 | Deepwell weekly Trial **Company Week** cannot be won solo | 57d-deepwell.js:633 hero `dmg` x0.01; companions x200 (645) do nothing; comes up one week in 12 (`trialRule`) | Replace the rule (section 2) |
| 3.6 | Party-damage uniques are empty drops | Rattlebone Charm, Lantern Eater's Fang: `gear().party` is read only by `compDpsOne` (40-rules.js:105) and `sharedMult` (56-roster.js:227); `fieldCompDps()` returns 0 in solo | New effects (section 2) |
| 3.7 | Legendary powers never drop, and most do nothing | `legendDrop` is only called to pay owed rolls (55-legend.js:377). Owed rolls come from the Oath (`S.oath`, never created). Sigils come from expeditions and bond level 25 (both dead). `bonus('lg:<id>')` (55-legend.js:216) has no reader: the combat file (59e/59l-legend-combat) never landed. Only about 8 powers and set tiers work (55-legend.js:530-560) | Remove (plan wave 2) |
| 3.8 | The guide's `nextup` step pauses the game until you tap the chip | 55-onboard.js:102 `done: () => false`, `pause: 1` | Make it a Got it step that doesn't pause |
| 3.9 | Two Wrens | The picker and create screen draw B1 sprites (75-solo-ui.js:238); the stage and header use the new art | Use the new art |
| 3.10 | Tests check the dormant game | tools/check.mjs:16-26: `loadCore` adds `var __SOLO = 0` unless a section passes `{ solo: true }` (10 core loads, all after line 6035). Browser sections at 5381 and 5704 load `partyDist`. check passes with 3.1 in the game | Wave 2: solo becomes the default; party sections are deleted with their code |
| 3.11 | Well Rested never fires | 55-rested.js:29 `restParty()` needs a fielded companion | Section 2 |
| 3.12 | Two achievement systems | 56-achievements (22) and 58-deeds (92) both toast; 3 old achievements fired in the first 30 min | Merge |
| 3.13 | Codex promises | 15 of 22 `CODEX_MILESTONES` rewards are not live ("Saved for later"); "+1 expedition slot" is dead in solo | Swap them for live rewards or drop them |
| 3.14 | In the sim, "You fell back to Zone N to keep earning" 26 times in 30 min | 55-pace.js:38, normal priority. The sim's mixed policy walks up and down; not seen in the Playwright run | Rate-limit it (one line a session) |
| 3.15 | `tools/perf.mjs` fails in this container, before and after SOLO1 | wave-log | Out of scope; it only matters if perf budgets gate merges |

### 3b. Notifications in the first 30 minutes

**Measured:** a fresh solo game (Wren) in Chromium at 360x740, played by a bot that follows the guide, presses
Attack, casts, parries, buys upgrades and builds, at about 4x speed. Numbers are per **game** minute; the bot reached
zone 11, level 19 in 31 minutes, in line with the sim's pace. A 30-minute `sim.mjs --active --policy mixed` run agrees
(211 toast emits, 88 that pop).

| Source | Where | First 5 min | 30 min | Pops? |
|---|---|---|---|---|
| Level up toast "Level N. Your hero hits 4% harder." | 50-sim.js:135 (high) | 11 | 18 | Yes, every level |
| Stage captions: arrival + elder intro + elder fall | 55-story, 75-story-ui | 15 | 15 | Over the stage, 2 per boss |
| Guide steps | 75-onboard-ui | 9 | 9 | Bubble, and they pause the game |
| Unlocks: "New tab: X" (high), "New on the X tab" (normal), Next Up | 75-onboard-ui.js:69 | 11 | 12 | Yes, while the guide points at the same tab |
| Zone cleared "X is cleared. Y lies ahead." | 50-sim.js:120 (high) | 7 | 10 | Yes |
| "You head to / return to / move to X" | 50-sim.js:14, 55-nav (low) | 11 | 19 | Bell only |
| Skill level "Woodcutting level N. Next tier at 14." | 50-sim.js:155 (low) | 9 | 13 | Bell only |
| Bestiary tiers, mastery stars, weekly goals | 55-mastery, 55-almanac | 7 | 14 | Bell or pop |
| Combat tips ("A red ring means...", "Nothing stops this one") | 59b, 59g (normal) | 3 | 6 | Yes |
| Made / Forged / Equipped / Salvaged, "Work starts on X" | 55-crafting, 57-camp (low) | 4 | 4 | Bell only |
| Codex: "past deeds", Light, milestones | 57c (high/normal) | 3 | 4 | Yes |
| Deeds tiers "Crownbreaker I (Bronze)", secrets | 58-deeds | 3 | 8 | Some |
| Old achievements "Achievement: X +1%" | 56-achievements | 2 | 3 | Yes |
| Star points "+1 star point. You have N" | 57e (normal) | 2 | 4 | Yes |
| Hesketh and fire lines | 55-hearth (high) | 2 | 2 | Yes |
| Unique loot | 51-actions (loot) | 1 | 2 | Yes |
| Floats (damage, +gold, +logs, LEVEL UP) | stage | hundreds | ~3,200 in the sim | Stage only |

The bot cleared zones faster at the start than the sim's early pace (7 bosses in 5 minutes), so the first-5-minute
column is an upper bound. The 30-minute totals match the sim.

- **Toasts:** 118 in 30 minutes, 56 of them popping. They pop 12, 10, 9, 5 a minute in the first four minutes (36 in
  the first 5), then about 1 a minute.
- **The bell:** 9+ unread after 63 seconds, and it stays there, because every folded or low toast counts.
- **"New" badges:** 3 of the 5 tabs (Hero, Gather, Camp) show "New" at once, 25 s into the game (screenshot).
- **Stacking:** at 22-23 s the player got "Mossy Hollow is cleared", "New tab: Hero", "New tab: Gather", Hesketh's
  line, an arrival caption, an elder fall caption and a guide step, all within about a second.

**Proposed policy** (one gate in `showToast`, 70-ui.js, plus priority fixes at the sources):

1. **Four channels.**
   - **Moment:** a full card for the fire lit, a Great Lantern, a hero unlocked or Ascension. At most one per
     5 minutes, never while a guide step shows.
   - **Pop:** things you act on or will remember: zone cleared, unique loot, a build finished, a Training level ready
     for the first time. At most 1 pop per 20 s and 3 a minute. The rest go to the bell.
   - **Bell (quiet):** worth reading later: story beats, deeds at Gold or better, Codex milestones, weekly goals.
   - **Nothing:** the rest. Show state, don't announce it.
2. **While the guide runs** (the first session): only the guide and the Moment of the fire pop. Unlock toasts are
   deleted, because the guide already points at the tab. Captions wait until the step closes.
3. **The bell counts only bell-channel items**, not folded pops or low toasts. It never shows "9+" in the first
   session.
4. **"New" badges:** one badge at a time, on the tab the guide or Next Up points to next.
5. **Delete outright:** "You head to / return to" toasts (the pill shows it); Made / Forged / Equipped / Salvaged /
   Transmuted (the sheet shows it); skill level-ups without a new tier (the level shows on the Gather view); the
   level-up toast (keep the LEVEL UP float; toast only when the level opens something, like a Training cap or a star
   point); the Codex "past deeds" line on new games; old achievements (merged into Deeds); Deeds Bronze and Silver
   toasts (bell only); mastery-star and bestiary-tier toasts (the Bestiary view dot); the elder **fall** caption
   (keep the intro); the pace fall-back toast after the first one each session.
6. **Test it:** a browser check plays the first 10 minutes and fails if more than 12 pops or 1 Moment happen, or
   any 20 s window has 2 pops (apart from the guide).

## 4. Efficiency and size

Estimates are JS lines unless noted. Risk: **L** = delete and fix the call sites; **M** = other live systems call
in; **H** = the live solo game runs through it.

| Item | Files | Removable | Risk | Notes |
|---|---|---|---|---|
| Synergy, Bonds, traits | 56b, 56f, 21f-stories-bonds, 75-bonds-ui | 1,382 | M | Callers: `synUnit` / `synParty` in 59-combat and 59b, `charTraits` in the party sheet, codex `markSyn`, deeds probe F2, 55-legend bond Sigils |
| Formation and planner | 56e, 56d | 991 | M | Callers: `heroStand` (50-sim, 59j), `offSlot`, `trioMult`, `placeSlots` (56-roster), sim `autoPlan` |
| Party tab and sheet | 75-party, 75-party-sheet | ~1,000 | L | Keep the hero card, gear and the star map link |
| Legendary powers | 55-legend, 75-legend-ui, 21c, 11b | 1,636 | L | Craft item fields `lg`/`lr`/`cm`, the Powers view, codex page, `keenSource('set')` |
| Pinnacle data | 21d, 21e | 587 | L | Only `PIN_POWERS` getters in 21c (going too) and a deeds probe |
| Expeditions | 57b, 75-exped-ui, (21i to the Codex) | 815 | L | Already hidden in solo; trade runs rebuild in Hands |
| Roster internals (levels, drills, promotions, recruiting, `migrateParty`) | 56-roster | ~450 | M | Keep the character table (names, circle, route, bio) as the hero registry |
| Stage A companions (`S.comp`, `COMPS`, `hireComp`, `compDpsOne`) | 20-data, 30-state, 40-rules, 51 | ~40 | L | Dead since the roster |
| Old-save migrations | 55-welcome, 55-skillpace, 55-classes (legacy classes), 55-store, 56e `formOld`, 56f seeds, 58-deeds credit, 55-onboard `oldSave`, 55-hearth warm notes, 57c retro credit | ~400 | L | Save key v3 never reads v1/v2 saves. Bump to v4 when this lands. `tests/fixtures/save-*-v1/v2` go too |
| Old achievements | 56-achievements | 70 | L | Merge its handful of useful bonuses into Deeds |
| Party combat internals | 59-combat (threat, heals, cover, reach, knock-outs, wipe retreat, multi-unit hold estimate), 59c, 59e (ally heals, taunts, Tactics), 55-party (Stage A kits) | ~1,000 | H | After CB3 (the solo combat spec): rewrite as one hero against a pack. `partyHoldEstimate` becomes a closed form for one unit |
| B1 companion and class outfits | 12b-12f (keep Hesketh), parts of 60b and 75-party-sheet | ~900 | L | The picker switches to the new art first. 15 heroes lose their placeholder sprite, but they aren't playable yet |
| Duplicate UI patterns | 75-party-sheet, 75-craft-ui item sheet, 75-deeds-ui sheets, 75-codex-ui sheet | ~300 | M | Four hand-rolled bottom sheets; one `sheet()` helper in 70-ui |
| Party CSS | 60-party, 60-formation, 60-exped, 60-lineup, 60-unlocks, 60-legend | ~700 CSS | L | With their JS |
| check.mjs party sections | roster, synergy, unlocks, expeditions, legendary x2, pinnacle, line-up planner, formation x2, bonds, party ui, party combat parts, evolutions, classes S2 | ~2,300 tool lines | M | Port the useful asserts (combat maths, deepwell, economy, onboarding) to solo first |
| sim.mjs roster policies | `--roster`, `--train`, `--t11`, `--syn`, `--tune`, T10/T11/T16/T17, party targets | ~500 tool lines | M | `--party 1` goes |

**Total:** about 9,500 JS lines (23% of 41k, roughly 600 KB of the 2.76 MB source), 700 CSS lines and 2,800 tool
lines. The rest of the game (economy, gathering, camp, Deepwell, deeds, codex) gets smaller and simpler once it stops
guarding for a party.

**Recommendation: delete the dormant party code outright.** Keeping it costs every agent context (every combat
change has to keep `__SOLO = 0` passing), and check keeps testing a game nobody plays. Saves are wipeable, git keeps
the history, and the design docs stay. Order:

1. First, make **check.mjs and sim.mjs run solo by default**, and add the first-session browser walk (3.1).
2. Delete the leaf systems nothing live calls: legendary, pinnacle, expeditions, old achievements.
3. Delete formation, planner, synergy and Bonds, then the party tab sections (callers in combat become constants).
4. Delete the migrations and bump the save key to v4.
5. Then slim the combat engine (after CB3), and the roster into the hero registry.

## 5. Work plan

At most 3 agents a wave; agents in a wave own disjoint files. Merge in the order listed. Every task runs build and
check and ends with a Playwright look at 360 px portrait.

### Wave 1: unblock the playtest (now)

| Task | Model | Owns | Scope |
|---|---|---|---|
| **W1-A Guide and gathering** | sonnet | 55-onboard.js, 75-onboard-ui.js, 90-boot.js (the pause line), 64h-hero-sprites.js (gather motion only), 75-camp-ui.js (Oak copy), 56-roster.js:79 (copy) | Fix 3.1 (pause rules, "Chop 20 Pine Log" guidance), 3.3, 3.8. Stopgap gather swing on the new art. Add a solo browser check: a fresh game reaches a built Workbench with no taps, only waiting. Coordinate 64h with the solo-combat agent |
| **W1-B Notification policy** | opus | 70-ui.js (`showToast`, bell count), 75-story-ui.js, 56-achievements.js (merge into deeds), 58-deeds.js / 75-deeds-ui.js (toast tiers), 57c-codex.js (3.4), 55-mastery.js, 50-sim.js (level-up and skill toasts, 3.14 via 55-pace.js) | Section 3b in full, with the 10-minute browser check. 75-onboard-ui's unlock toasts belong to W1-A: pass the rule over |
| **W1-C Solo copy and dead effects** | sonnet | 20-data.js, 57d-deepwell.js, 59c-deepwell-combat.js, 75-deepwell-ui.js, 55-rested.js, 72-ui-gather.js (rest line), 55-almanac.js, 57-camp.js (copy only), 75-away.js, 75-lantern-ui.js, 75-stars-ui.js, 75-class-ui.js, 55-classes.js (copy), 75-stats-ui.js | Every row of section 2 that is copy or a one-line effect: Rattlebone, Fang, Golemfist, Hourglass, Company Week, Well Rested for the hero, stats rows, "party" strings in live paths (including the 50-sim raid toast; ask W1-B to take that line). Not the online layer |

### Wave 2: tests on the real game, Training, and the first deletions

| Task | Model | Owns | Scope |
|---|---|---|---|
| **W2-A Training** | opus (spec, build), then sonnet for the sim retune | 20-data.js `HERO_UPS`, 40-rules.js (`heroAtk`, `aps`), 51-actions.js `buyHero`, 71-ui-fight.js, new 55-training.js and 75-training-ui.js, 55-goals `hero-up`, 55-onboard `upgrade` step (after W1-A), 21w-data-econ.js rows | solo-hero.md "Training". Attack, Parry, Dodge and abilities level with gold, capped by hero level and class stage. Blade becomes Attack; Swiftness goes (`aps` fixed, the Attack cooldown rules); Precision moves to gear and stars. Depends on: the damage curve (`PACE.blade*`, sim targets), ECON rows for blade/swift/precision (55-econ, check "econ" section), the onboarding upgrade step, the Next Up `hero-up` goal, deeds tracks that read `S.blade`. Relic retune (Warbanner). Ends with `sim --report early` in band |
| **W2-B Solo-first tests** | sonnet | tools/check.mjs, tools/sim.mjs, tools/lib/core.mjs, tests/fixtures | Solo is the default everywhere. Port the useful party-era asserts (combat maths, Deepwell, economy, store, gathering, onboarding) to solo. Mark the party sections that wave 3 deletes. Fix or skip perf.mjs in the container |
| **W2-C Delete leaf systems** | sonnet | 55-legend, 75-legend-ui, 21c, 11b, 21d, 21e, 57b, 75-exped-ui, 21i (move its Lore pages into the Codex data), 57c-codex.js pages, 23-data-deeds (exped and pin tracks), 58-deeds probes, 57-camp Map Room row, 75-craft-ui Powers bits, CSS | Legendary, pinnacle and expeditions out; the Codex and Deeds lose their pages and tracks. Merge after W2-B |

### Wave 3: remove the party

| Task | Model | Owns | Scope |
|---|---|---|---|
| **W3-A Formation, planner, synergy, Bonds** | sonnet | 56b, 56d, 56e, 56f, 21f-stories-bonds, 75-bonds-ui, 75-party.js, 75-party-sheet.js, 60-party/60-formation/60-lineup.css; call sites in 59-combat, 59b, 50-sim, 59j (`heroStand`) | Delete; the Hero tab keeps the hero card, gear and Stars. Remove their check and sim parts |
| **W3-B Roster into hero registry** | opus | 56-roster, 56c-unlocks, 75-unlocks-ui, 21-stories, 57-camp (Tavern tiers, Library), 55-goals (roster goals), 76-create | `HEROES` table of 32 (3 playable, the rest locked with a route). Unlock routes unlock heroes. New Tavern perks. Hero-unlock card. Next Up `hero-unlock` |
| **W3-C Migrations and leftovers** | haiku | 55-welcome, 55-skillpace, 55-classes legacy code, 55-store migration, 30-state (`S.comp`, bump to v4), 20-data `COMPS`, 51 `hireComp`, 12b-12f outfits (keep Hesketh), 75-solo-ui picker art (after the solo agent) | Mechanical deletes from section 4, and the save key bump |

### Wave 4: the solo systems (design first, each a spec then a build)

| Task | Model | Owns | Scope |
|---|---|---|---|
| **W4-A Solo combat engine** | opus | 59-combat, 59b, 59c, 59e (combat hooks), 55-party | After CB3: one hero against a pack. Drop threat, heals, cover and multi-unit maths; a solo away estimate; keep kits, statuses and bosses |
| **W4-B Ability trees and stars** | opus | 24b-data-solo (with the solo agent), 57e, 75-stars-ui, new 21k-data-abilities.js | About 10 abilities per hero (6 shared-pool + 3-4 signature), level tiers, the star map as each hero's branches (Fireball splits in three) |
| **W4-C Trade runs** | sonnet | 57f-hands, new 57g-trade.js, 75-trade-ui.js, 57-camp (Trade Post) | Send a gatherer to trade; goods come back. Reuse the expedition timing rules from git history |

### Wave 5: the new progression

| Task | Model | Owns | Scope |
|---|---|---|---|
| **W5-A Ascension and subclasses** | opus | 24-data-classes, 55-classes, 59e, 59f, 75-class-ui | The Proving Ascends; the six evolutions become subclass branches with their own abilities; stay-as-base allowed |
| **W5-B Elowen's chapel and boss items** | opus | new 55-chapel.js, 75-chapel-ui.js, 21g boss kit `drop` fields, 57-camp (a chapel plot) | Boss-themed items unlock abilities; Hallowed abilities move here for a cost |
| **W5-C Campaign story (design)** | opus | docs/design/campaign.md, then 55-story and 21* writing | NPCs around the world map (gatherers, the tavern keep, Elowen, Hesketh). Hero quests and Hallowed hang off it |

Later, and not in this plan: landscape layout (UX-L1), new heroes one at a time (art, kit, route, quest), deeds,
codex and almanac content for heroes, and looks on the new art.
