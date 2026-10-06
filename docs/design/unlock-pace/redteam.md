# Red team: story-unlock-gates (part 1, option D) and first-hour unlock schedule (part 2)

Checked on c1af26c plus the uncommitted whenLine edit in src/js/56c-unlocks.js (someone is already building D in the tree).
I ran `node tools/check.mjs --only=onboarding` (passes today). Sim timeline: nextup 0:02, party 0:45, gather 0:45, bounties 2:34,
camp 3:08, craft 3:55, bestiary 3:55, almanac 6:48, stars 6:48, tavern 11:43, uniques 12:01.

## Part 1: hero gates (option D)

### 1. Facts wrong or missing
- F2 is wrong about the anchor. STORY_MEET uses the FIRST zone of the area (56c-unlocks.js:63-64 comment, :66-72), but the scene plays at
  the Champion post, the LAST zone of the area (21k-story-hollow.js:157-191: regent 5, cantor 10, marshal 15, engine 20, oracle 25,
  star 30, halo 35). Anselm gate 11, scene 15 (npc.anselm, 21k:232). Maren 16 vs 20 (:245). Morwen 21 vs 25. Grenna 26 vs 30.
  Bram and Thessaly 31 vs 35 (:271, :277). So the gate opens up to 4 zones BEFORE the scene, which breaks the rule it claims.
- F5 contradicts the table: it says the starters are met at zones 5, 10, 15 (the posts), while STORY_MEET anchors at area starts.
  Amending DECISIONS to "the gate keys on the scene's zone" would codify an anchor the code does not use.
- D's "zone N" line would therefore print the wrong zone ("Bram joins at zone 31", scene at 35). Fix the table first, or print no zone.
  Fixing the table moves Bram 31 to 35, so the proposal's level list changes and tests at check.mjs:6906, 7001, 8605-8609 need bumps.
- F2 says Hesketh has two scenes at zone 1. True (area:0, 21k:43-49). But Hob is STORY_MEET [1,1] and has NO scene at all (only a line in
  Tam's, 21k:214). Hob's "met at zone 1" is a gate with nothing behind it. Hesketh's third scene is at the Fenmother post (21k:289, zone 35).
- F4 is right (nothing listens to heroToken, 56c:187), but it is understated. Isolde's token rolls from zone 31 (pity 10, so it is won
  within 10 bosses) and her gate is 81. A pull is won, hidden, and pays out about 50 zones later. That is the only gacha-like mechanic
  in the game and it is wasted. Ferrin 71 vs 91, Ragna 106 vs 131 are the same.
- F3: the zone 20-30 wall means zones 41, 81, 106, 156 are never reached by casual players (pacing doc). Most gates never open.
  D polishes copy for content that most players never see, while Cal asked for the first hour.
- Missing: the new-game picker (76-create.js:78) shows `info.meet` for all 29 locked heroes. lessons.md:44 says that screen must show
  who, not where. D must leave `meet` on the old lines. Check 6990 requires /You meet (him|them) / on the picker; D's "You meet Isolde ..."
  names a hero and fails it if `meet` is ever switched. Check 8605 asserts the exact old "You meet them in the Hollow." text.
- Missing: starters bypass the gate entirely (heroUnlocked, 56c:151). The bible (4.4) says the other two starters are people you meet.
  Today all three are free at minute 1 (76-create.js:26 even promises a free switch). D leaves that canon gap open.

### 2. Strongest case for a different option (E-lite plus token fix)
- D answers "when does Maren join?" for heroes nobody can play (F1) and nobody reaches. Cal's notes 1, 7, 11 are about the first hour:
  easy reward, pace, connection. The only real hero beat in reach is a starter. E (gate the two unpicked starters until zones 5/10/15)
  is canon (bible 4.4), needs no new kit, and gives a "Tobin is waiting at camp" moment at minute ~12 and ~30. That is attachment plus
  a guaranteed reward, the cheap version of a gacha pull.
- The proposal's objection to E "scenes do not play until encounters ship" is avoidable: key E on the zone and fire a toast plus a
  short card from `heroUnlocked`. It does not need the Champion encounter. Saves: add one new field (e.g. S.story.met) with default
  "all met" in STATE_DEFAULTS so every old save keeps all three; only `fresh()` games start with the picked starter alone.
- "Removes a choice every existing player has" is wrong under that default; and for a new player the choice is the pick screen.
- Token fix: announce the win (toast: "You won the Dusk Contract. Isolde joins in Chapter 3."). That is a reward moment now and the
  held-token line needs no region name. Or start the roll at the meet zone (tokens[id].from = max(from, meet)): pity then lines up with
  the unlock. Existing {miss,won} state is untouched. D defers both until a kit ships, which is the wrong order for a dopamine goal.
- Hob is the first non-starter with a gate and no scene; fix by adding a Hob scene or not listing him as "met at zone 1".

### 3. Failure risks of D as written
- Save compatibility: D itself adds no field (good). Paid routes not yet claimed (Bram 80 logs, Maren) are held back on live saves;
  already accepted in #54, but "grandfather" only covers saves that ran heroProbe after the route completed.
- Tests: 8605 (exact text), 6990 (regex), 6906/7001 (Bram at 31) fail if anchors move or lines change. check.mjs:8610 only checks the
  table has every hero, not that the zone matches the scene, so a wrong anchor passes. Add a check comparing STORY_MEET to the champ post zone.
- whenLine (working tree) uses `ch !== here` with here = ceil(maxZone/35). A day-1 player sees "in Chapter 5" for Corvin: it tells
  them the game has five chapters, and "Chapter 3/4" teases canon; low risk but it is a spoiler of structure.
- Online layer: unaffected (no raiders/world doc touched). Good.
- Players who never reach a trigger: see F3. D adds copy for them, not a path to them.

### 4. Verdict
Do not ship D as its own card. Fix the anchors (post zones) first, keep `meet` text as is for the picker, announce token wins now,
and hand E-lite to the early-game lead as the first-hour hero beat with the save default above. The when-line is fine as copy, but it is
the least valuable piece. Option B is still wrong (spoilers); C is a canon rewrite for nothing.

## Part 2: spread out the first-hour unlocks

### 1. Facts wrong or missing
- D2 and the proposal's zone 6 claim use the WARM-save timeline. unlock-timeline.md says so itself ("Times assume a warm save"). On a new
  (cold) save, Craft opens when the Workbench is built (55-onboard.js craft row, coldH branch) and Camp when the fire is lit. So zone 6 is
  Bestiary plus the star, two things, not three. D2 is mostly fixed already for new players.
- "Time triggers land inside the zone 2 flood": Almanac is O().t >= 420 and Uniques O().t >= 720. O().t only counts un-paused play seconds
  (onboard tick; 90-boot skips paused ticks), so for cold B (zone 2 at min 6, pauses on every step) the 7 minute trigger lands near min 8-9
  in the camp chain, and the 12 minute trigger lands near min 14+. Neither is in the zone 2 flood. Dropping them removes the only
  catch-up for slow players (cold B: zone 5 at min 25, zone 9 at min 44, vs the sim's zone 5 at 3:08).
- The proposal quotes `party` as "hero level 3 or zone 2". Code: `S.L >= 3 || S.maxZone >= 2` (55-onboard.js party row). Moving it to
  zone 3 removes the level route. Training (the first spend, Cal note 1) lives behind this tab. The 'upgrade' step requires
  isUnlocked('party') (GUIDE_STEPS upgrade). So gold sits unspendable until zone 3, about min 12 for cold B, which is the opposite of
  "easy reward".
- The away strip is not a FEATURES row. uiGateRule (71-ui-fight.js:50-60) shows it whenever the Gather button is visible. Moving it to
  zone 4 is new code in a UI file, so "one revert of the FEATURES rows" is false. The strip also says that fighting stops when you
  leave; cold B left for 2 h at t17m (playtest-coldB/08).
- The Fight/Gather/Switch row (applyFeatures modes, 75-onboard-ui.js:~30) is tied to Gather. Gather stays at zone 2, so the row that
  eats stage height stays at zone 2. The 60% stage-height prediction is unproven; the shrink is a layout cost, not an unlock count.

### 2. Strongest case for a different schedule (option F: a spacing governor, not later zones)
- Zone numbers are a poor clock: sim player zone 5 at 3:08, cold B at 25 min (8x). A fixed zone schedule is fast for experts and slow
  for the player most at risk of leaving.
- Keep every rule. Add one governor in onboardCheck (55-onboard.js): after any unlock, hold the next non-urgent unlock for N seconds of
  O().t (60 to 90), in FEATURES order. Time and zone triggers stay as catch-up. A guarantee ("at most one arrival a minute") instead of a
  hope, and it works for any pace. One new default field (O().lastU) merges into old saves; got stays sticky.
- Fix the flood at its cause: put the away strip into the Gather sheet or a one-line chip, and make the Next Up bar collapse to a chip
  while a guide step is open. This addresses D1/D3 without delaying Hero.
- Tie arrivals to the guide beat that teaches them: Hero opens when the 'upgrade' step shows, Next Up when the first point is spent.
  That keeps Hero at zone 2 / level 3 and keeps tips matching what is on screen (Cal note 3).

### 3. Failure risks of the proposal
- Guide pile-up (Cal note 3, tips not matching): at zone 3 for cold B (min ~12) the player gets the Hero toast, the 'upgrade' pause
  ("You have gold. Open Hero to train."), then 'tab:party' (needs zone 3 and a lit fire), then Next Up on the first point plus its Got it
  step (needs upgrade done and zone 3). That is 3-4 arrivals in a minute, and it lands on top of bench/tool/forge pauses (min 7-12), since
  'upgrade' sits before them in GUIDE_STEPS. The "at most 2 per minute" prediction fails by design.
- Tests: check.mjs:1377 (party and nextup < 120 s) and 1380-1383 (camp, craft, bestiary, almanac all by 660 s; >= 8 unlocks and gap
  <= 210 s in 10 minutes) are tuned to the old rules. With zone 3 / 7 / 8 triggers they must be rerun; at least 1377 is at risk. The
  proposal does not name them. Section 1353 and the save fixtures are fine (got is sticky).
- Next Up gone until zone 3-4 for cold players: the goal nudge is absent for the first 12-18 minutes, the weakest point of the funnel.
- Uniques on "first unique found": the unlock toast ("New on the Craft tab: Uniques") fires with the unique-loot toast; playtest-coldB/16
  already shows that toast overlapping the level-up. Cal note 4 (did not know they got a unique) wants a bigger moment, not a second small toast.
- Bestiary loses its 60-kill route; Thessaly, Linnet and Corvin routes read bestiary pages, so a player is told to fill pages in a view that
  is hidden. Mastery still counts while hidden, so no data loss, but the Next Up goal 'bestiary' is gated by it.
- Live saves: stricter rules only affect features not yet in got, which is none for any save past those zones (rules are checked each
  second). Low risk. Online layer: unchanged (raid row left alone). Good.

### 4. Verdict
Keep Hero at level 3 or zone 2 and keep Next Up on the first point. Do not push features later by zone. Build the governor (F) plus the
layout fix for the strip and bar, keep the time catch-ups, and add a check that walks a COLD save with the guide (not the sim's
shortcut buys) and asserts at most 2 arrivals in any 60 s. Take the proposal's one good idea, spreading Bestiary/Almanac/Uniques/Codex
apart by a zone each, as extra rows under the governor.
