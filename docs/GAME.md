# Lanternfall: the game as it is now

A short map of what is in the game on 2026-10-06, with the files that hold each system. The code is the truth: when
this page and a file disagree, the file wins and this page needs a fix. Owner decisions are in
[DECISIONS.md](DECISIONS.md); file-level details are in [ARCHITECTURE.md](ARCHITECTURE.md).

## The loop

The player picks one hero and climbs the Lantern Road zone by zone. Fights pay gold, XP, Essence, relics, Scrolls,
uniques and Trophies. Gathering and gatherers bring materials. Materials and gold build the camp and craft gear. Every
fight is played by hand. Gathering, gatherer shifts and camp builds keep running while the game is closed.

## Screen

Five tabs, each a full-screen menu over the stage ([layout.md](design/layout.md)):

| Tab | Views |
|---|---|
| Fight (`adv`) | Boss, Bounties, Bestiary, Deepwell |
| Hero (`party`) | Hero, Abilities, Training, Stars |
| Gather (`gat`) | Mining, Wood, Forage, Hunting, Store |
| Craft (`forge`) | Make, Gear, Uniques |
| Camp (`world`) | Camp, Tavern, Almanac, Raid |

The bell opens Notices, the Journal and Settings. Achievements (Deeds) and the Codex open from the Journal. Landscape
(740x360 and up) is the main target; portrait still works at 360 px wide.

## The hero

- **Three playable heroes:** Wren (archer, Ranger class), Tobin (tank, Warrior class, Warden kit) and Pip (caster, Mage
  class, Lanternmage kit). Data: `24b-data-solo.js`; runtime: `59j-solo.js`; picker and switch: `76-create.js`,
  `75-solo-ui.js`.
- **The road is shared.** Gold, gear, the camp and the furthest zone (`maxZone`) belong to the save. Each hero has its
  own level and remembers its own zone (`S.solo.zn`).
- **The roster** holds 32 heroes (`56-roster.js`); only the three with complete kits can carry the lamp. Unlock routes,
  Renown and boss tokens: `56c-unlocks.js`.
- **Training** (Hero > Training, `55-training.js`): gold levels up Attack, Parry, Dodge and ability power. A move never
  passes the hero's level, nor 40 before the Proving and 80 after it.
- **Classes and the Proving** (`55-classes.js`, `59e-class-combat.js`, `59f-trials.js`, `75-class-ui.js`): after the
  Fenmother (zone 35) and hero level 35 the hero can take the Proving and choose an evolution path. Changing class uses
  the Mirror of Embers. In turn fights an evolution gives its stats and its damage line; its own powers were built for the
  real-time fight, and each one's turn-fight effect is now a star that passing the Proving finds.
- **Stars** (`24f-data-stars.js`, `57e-stars.js`, `75-stars-ui.js`; [combat-turn-build.md](design/combat-turn-build.md)
  "Stars"): 43 small rule changes for turn fights ("A parried hit adds 1 Chill"), found on zone bosses' first wins
  (zones 6 to 70), elites, Deepwell floors and the Provings (a third star on a second pass). A hero sets 3; 4 won fights
  with a star set learn it, and then any hero can light it with star points (a point every 3 levels, 4 per Great
  Lantern), up to 2. The view is a star map: six constellations, one per place stars are found, with the loadout
  (points, 3 set, 2 lit) always in view, a card per star, filters and a list. Learn a whole constellation for a star
  point and quicker learning (4 wins, then 3, then 2). The view opens with the first star or at hero level 10.
- **Well Rested** (`55-rested.js`): gathering banks a short damage bonus for the next fights.

## Fights

- **Every zone fight is a turn fight** (`59k-turn.js`, UI `75-turn-ui.js`). The full rules are in
  [combat-turn-build.md](design/combat-turn-build.md). In short: one foe, a Speed timeline, Attack or one of three
  abilities on your turn, a parry or a dodge for every enemy hit, statuses, cooldowns in turns, no Auto.
- **The fight screen is Stage and dock** (Cal, 2026-10-05; `75-solo-ui.js`, `75-turn-ui.js`). The stage shows the hero and
  foe, a turn banner and the timing bar along its bottom edge while a hit winds up. Under it, the dock has three tabs.
  **Act**: Attack and the three ability slots as tiles (D, Q, W, E), each with its name and "Ready", turns left or
  "Passive". **Skills**: each slot's ability and cooldown; tap one to change it. **Foe**: its kind, an elite's trait and
  the moves you have learned (a zone boss shows the ones your lost tries taught you, one more a try; a beaten boss shows all). Parry and Dodge (A, S) sit under the dock on every tab and glow while a
  hit winds up. Short landscape keeps the names under small tiles. The turn order shows on the Versus card only.
- **Abilities** (`24c-data-abilities.js`, `56e-abilities.js`, `75-abilities-ui.js`): 14 a hero; the signature is free
  and the rest cost a Scroll of their tier from zone bosses. **Talents** (`24e-data-talents.js`): two choices for each
  ability and for Attack, Parry and Dodge. **Ability icons** (Codex's drawings, `art/abilities/`, converted by
  `tools/art/abilityicons.py`, embedded by `tools/art/embed-icons.mjs` under the live ability id): Pip's 14 are drawn on
  the bar, the picker and the Abilities list. Wren and Tobin keep lettered tiles until all 14 of theirs are drawn (whole
  packs only); `check.mjs` lists the complete heroes.
- **Stars** change the rules of a fight on top: up to 3 set and 2 lit a hero (see The hero).
- **Zones:** 5 won fights, then the zone boss, then the next zone (`ZONE_FIGHTS` in `40-rules.js`). Losing never moves
  you. Bosses have no timer.
- **After a boss beats you** (`55-boss-try.js`, `75-boss-try-ui.js`): the game stops on a Try again card. It names the hit
  that won and why (a charged move, a hit you did not parry or dodge, a try with bad timing, damage over time, or "so
  close"), the boss's weakness and resists, the moves you now know, and the ways forward that exist today. **Try again**
  starts the boss; closing the card keeps you fighting in the zone. The boss then waits behind the Fight tab's gate
  ("The zone boss is waiting") and does not start by itself, while the zone's fights keep paying as normal. The Auto switch
  (Fight tab, shown only while a boss waits) lets it come back on its own once you are stronger. Each lost try shows one
  more of the boss's moves in the Foe tab. State: `S.bossTry` (`hold`, `tries`, `rev`, `last`). Adds no power.
- **Foes:** zone 1 is the Thorn Imp and zone 2 Gloomjaw, from the C22 roster with approved art (`59l-zone-foes.js`,
  `64j-foe-art.js`). Other zones still use the old foe types with turn move sets (`24d-data-turnfoes.js`). From zone
  15 about one fight in five is an elite with one trait.
- **Regions in code** (`22-data-regions.js`): the Hollow (zones 1-35, the Fenmother) and the Sunken Coast (36-70). The
  Coast reuses the Hollow's foes and scenery until its content lands. The first kill of a region boss relights a
  Great Lantern (`55-lantern.js`).
- **Turn fights everywhere but the raid.** The Deepwell (`59c-deepwell-combat.js`) and the Provings (`59f-trials.js`,
  `TRIAL_TUNE.turn`) are turn fights too: one foe at a time, limits counted in turns, no clock
  ([combat-turn-build.md](design/combat-turn-build.md) "The Deepwell and the Provings"). Only the world raid keeps its
  real-time fight (`59-combat.js`, `59g-active.js`, `59h-bosses.js`, `59i-elites.js`).
- **Away:** gathering (and a raid hit) keeps earning; fights stop and earn nothing (`50-sim.js` `awayGains`). The away cap is 4 hours, raised by the
  Hourglass and the Watchtower, up to 24 hours. While you gather, a chip under the Fight / Gather row says "Leave now: about N <material> in 4 hours" (a floor: it ignores level-ups, and it caps at the Storehouse room and says so when it fills and Spillover moves on). A fighter sees the notice instead.

## Gathering and gatherers

- **Skills:** Mining (ore, gems), Woodcutting, Foraging (fibre, herbs) and Hunting (hide) (`55-gathering.js`,
  `72-ui-gather.js`, scenes in `63c-scenery-gather.js`). Node tiers open at skill levels (`SKILL_TUNE`). Hunting uses
  Codex's interim art (`HUNT_TUNE` in `21-data-craft.js`; numbers in [hunting-c24.md](design/hunting-c24.md)).
- **Tools** (`55-tools.js`): pickaxe, axe, sickle and spear, made at the Workbench. The right tool is a speed bonus,
  never a gate. Each tool kind has its own mastery.
- **The Storehouse** (`55-store.js`): a cap per material and grade, from every source. Skill XP keeps counting at the
  cap.
- **Gatherers (Hands)** (`57f-hands.js`, `21f-data-hands.js`, `74-ui-hands.js`): open at Hearth 2 with a Tavern.
  Applicants appear on the Tavern board with a rarity and traits; named gatherers arrive by their routes. Tents cap the
  crew (2 to start). A send prepays one or two 4-hour shifts. Gatherers stand in the camp scene; tap one to talk and
  send it. Every random applicant carries one "Lit for ..." line. Named gatherers arrive by story: Tam comes up out of the cellars when Hands open, Rook after the zone 30 boss, Ada and Pell the morning (06:00) after the Hollow's Elder falls, Sister Fennel names Elowen's chapel only once that Elder is down.
- **Trade runs** (`57k-trade.js`, `74b-ui-trade.js`): from Tavern 2 a gatherer can carry goods away for 2 hours and
  bring back gold.
- **Tavern perks** (`57g-tavern-perks.js`): Omen forecasts, applicant timing, rumours, bounty bonuses.

## The camp

- **Hollow's Rest** (`57-camp.js`, `75-camp-ui.js`, scene `63d-scenery-camp.js`): the Hearth, Watchtower, Forge,
  Workbench, Loom, Enchanter's Table, Tavern, Storehouse, Tents, Library and Shrine. Builds run on the wall clock.
- **A new game starts cold** (`55-hearth.js`): the hero lights the fire, then builds the Workbench, the first tool and
  the Forge.
- **Shrine Blessings** open as Codex pages fill.

## Gear and crafting

- **Crafting** (`55-crafting.js`, `41-items.js`, `21-data-craft.js`, `75-craft-ui.js`): class gear at the camp's
  stations, grades 1-5. Items roll affix lines by rarity. Upgrades go to +10 (Trophies gate +8 to +10). Reforge,
  Masterwork and salvage are in the Craft tab. Every combat line works in a turn fight (59k `turnMakeProfile`; the audit
  is [combat-turn-build.md](design/combat-turn-build.md) "Gear stats in turn fights"): Spell power is fire, frost and
  holy damage, Damage over time (the old Area) Burn and Bleed, Control boss Stagger, Counter (the old Threat) counter
  damage, Speed (the old Attack speed) how often you act, Focus a steady cooldown refund.
- **Uniques** (`UNIQ` in `20-data.js`): rare zone-boss drops with a strong effect and modest stats. Each Hollow unique carries one flavour line naming the Champion and place it came from (`21ka-story-hollow-items.js`); it shows on the Codex tile and the item card once that area's Champion is in the game.
- **Economy** (`55-econ.js`, `21w-data-econ.js`): gold per foe steps up by region; every price follows that curve.
  Gold-gain beyond gear became crit damage, capped.

## Side systems

- **Deepwell** (`57d-deepwell.js`, `59c-deepwell-combat.js`, `75-deepwell-ui.js`): from zone 20 and Hearth 3. Each
  floor is a turn fight. Runs floor by floor on Oil, with boons, Depth Marks and a weekly Trial. A run never changes main progress. Its Deep Lore pages follow the story's rule that the dark copies shapes.
- **Bounties** (`55-bounties.js`): three short goals that pay gold, materials or Essence, and Renown.
- **Mastery and the Bestiary** (`55-mastery.js`): zone stars and per-foe perks from kills. The Codex Bestiary also shows one line for each Hollow monster you have reached that is in the game, saying what shape it copied (`LORE_FOES` in `21h-lore-hollow.js`). Foe tells use solo wording.
- **Almanac** (`55-almanac.js`): a daily Omen, optional Dares and a weekly board. Omen lines name no person or place you have not met; Oriel's line comes after Chapter 4.
- **Codex** (`57c-codex.js`, `75-codex-ui.js`): the collection book. Lantern Light gives titles, cosmetics and small
  capped perks.
- **Deeds** (`23-data-deeds.js`, `58-deeds.js`, `75-deeds-ui.js`): tracks, Feats, titles and looks drawn on the hero
  (`12g-art-accessories.js`, `64-looks.js`), and the Trophy Wall at camp (`63e-scenery-wall.js`).
- **Next Up** (`55-goals.js`): the goals closest to done, with Go buttons.
  **"Boss ready"** means you would usually win the zone boss. The game tries 30 scratch fights of that boss with your
  hero as they stand now, judged from your own Parry and Dodge record (a new player counts as casual), and says "Boss
  ready" at 70% or better. Under that it says "a close fight" (35% to 70%) or "too strong". Go opens the Fight tab. While it works it says "The Zone N boss is next". It only judges; you can still challenge any time
  (`59m-boss-odds.js`, `bossOdds()`).
- **Story** (`55-story.js`, `75-story-ui.js`, `21k-story-hollow.js`, `21h-lore-hollow.js`, `21b-stories-coast.js`, `21j-lore-omens.js`): one system that plays the region card, area titles, zone and Captain lines, Champion and Elder scenes, NPC and Voice cards and choices from `STORY_BEATS`, once per save, between fights, silent where the game is not ready (no monster or encounter, no data). Skip always works; everything read is in the Journal (Codex). A story card waits for a tap, but files itself to the Journal under "Catch up on the story" after 45 s untouched, and the game runs again; a choice in it waits in the Journal entry until you make it. Settings > Story switches it off. A new game opens on the Chapter 1 card, then two Old Hesketh cards (the fire, then what is in the ground), all before the first fight; a save already past zone 1 finds them in the Journal. The hero picker shows bios for the three starters only; every other hero says "Locked" and who you meet. No new hero can unlock before their first scene can have played (`STORY_MEET` in `56c-unlocks.js`; a scene on a Champion's post plays when that Champion falls, so Bram and Thessaly join from zone 36); heroes a save already owns are kept. At camp, All heroes says when a held hero joins: the zone in your chapter ("You meet Bram when the Hollow is won, at zone 36."), else the chapter ("You meet Kestrel in Chapter 4."). A won hero token is a bell line that says when that hero joins. The story bible is [story-bible.md](design/story-bible.md); [lore.md](design/lore.md) is the older lore. The Journal also holds "Who answers to whom", a page that adds a row the first time you meet each rank (Shadowborn, Captain, Champion, Elder, the Voice). Once an Elder is down, the Tavern shows Vesper's verse for it.

## Onboarding and notices

- **Unlocks** (`FEATURES` in `55-onboard.js`): a new game shows the Fight tab only. Tabs and views open as the player
  reaches them: Hero at hero level 3, Gather after the first boss, Bounties at zone 4, Camp at zone 5, Craft and the
  Bestiary around zone 6, the Almanac at 7 minutes, Uniques, the Tavern, the Codex (zone 10), the Raid (zone 12),
  Stars (hero level 10), the Deepwell (zone 20 and Hearth 3) and Hands (Hearth 2 and a Tavern). Once open, a feature stays open.
  One new thing a minute (`ONBOARD_TUNE.gap`, 60 s of play): ready rows queue and open in table order, so after the first
  boss Hero comes first, then Gather, Next Up and the away strip (row `awaynote`), a minute apart. A row the player's own act
  or a drop opened skips the queue: walking to gather, the fire lit (Camp), the Workbench (Craft), the Tavern built, the first
  star (Stars), the first unique (Uniques); the raid opens as before.
- **The guide** (`GUIDE_STEPS` in `55-onboard.js`, UI `75-onboard-ui.js`): one hint at a time, docked in the toast band.
  A step pauses the game only while it waits for a press; a step that needs game time shows live progress instead.
- **Notices** (`23n-data-notices.js`, `notify()`): every message goes to a channel (card, pop, bell, log or none),
  with a quiet start and a cap on pops a minute.
- **Moments** (`75-moments-ui.js`): big moments (the first boss, any unique, a new hero; the cache hook is ready for
  `lantern-cache`) show as a card that holds the game until the player taps Continue, with a burst and a sting. Medium
  moments (the first level up and every 5th level, a new ability, a new Star, a look found) show as one banner in the
  notices slot, at least 2.6 s, at most 2 in any 3 minutes of the first 30. All wait for the end of the fight, never show
  in a turn, and are never only a bell line. Several at one fight end fold into one card or banner.

## Currencies

Every currency, material and token, with its sources and sinks, is in [design/systems-map.md](design/systems-map.md)
(made by `node tools/systems-map.mjs --write`; `check.mjs` fails on a currency with no source or no sink).

## Saves and tools for players

- **Save:** `localStorage` key `lanternfall.save.v5` (`30-state.js`, `05-platform.js`).
- **Save codes** (`55-savecode.js`, `75-savecode-ui.js`): export and import, with a strict check and an in-page confirm.
- **Feedback** (`55-errors.js`, `75-feedback-ui.js`): local error capture and a Send feedback button.
- **Away report** (`75-away.js`) and the stats wall (`55-stats.js`, `75-stats-ui.js`). The report leads with what happened; a fighter sees "gathering continues, fighting stops" first, and the work-limit bar sits after the results.

## Online (do not change without a task that says so)

The world raid (`52-raid.js`, `74-ui-raid.js`), the Tavern's online parts (`74-ui-tavern.js`) and presence
(`80-online.js`). Shapes are frozen in `CLAUDE.md`.

## Not in the game

Designed or decided but not built: the rest of the C22 roster (173 zone monsters, the Shadowborn Captains, Champions
and new Elders); subclasses and Hallowed; hero quests; the 29 other heroes' kits; Regions 2-5 content; grades 6-15,
production chains, sockets, enchanting and the Armoury; the world map; campaign NPCs; equipment art on the hero.
Removed from the code: the party, formation and Bonds, expeditions, legendary powers and pinnacle bosses. Oaths were
never built.
