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
| Hero (`party`) | Hero, Gear (worn gear and the bag), Abilities, Build (attributes; Training while `HERO_TUNE.training` is 1), Stars |
| Gather (`gat`) | Mining, Wood, Forage, Hunting, Store |
| Craft (`forge`) | Make, Uniques |
| Camp (`world`) | Camp, Tavern, Almanac, Raid |

The bell opens Notices, the Journal and Settings. Achievements (Deeds) and the Codex open from the Journal. Browser first
(owner, 2026-10-08): the design size is a desktop browser at 1280x720 CSS px with mouse and keyboard; it must look good
at 1920x1080 and fit 1366x640. Landscape phones (740x360) and tablets (1024x768) still play without clipping; phones held
upright (360x740) must not break, but new features need not be designed for them. On a desktop screen (1200x600 and up) text and chrome grow, an item's detail opens
beside the list in its menu, and the number keys 1 to 5 open Fight, Hero, Gather, Craft and Camp (the open tab's number closes it;
Escape closes the detail, then the menu). Two-press buttons (spend a Scroll, a camp build, a reset) say "Confirm" on the second press.

Menu sub-tabs keep their labels and show the drawn menu icons. Action buttons show small Ready, Cooldown,
Locked or Unavailable badges; the ability picker marks the selected action. Icons use native pixel sizes.

## The hero

- **Three playable heroes:** Wren (archer, Ranger class), Tobin (tank, Warrior class, Warden kit) and Pip (caster, Mage
  class, Lanternmage kit). Data: `24b-data-solo.js`; runtime: `59j-solo.js`; picker and switch: `76-create.js`,
  `75-solo-ui.js`. A new game starts with the one you pick; the other two join on the road, at the first clear of the
  Champion where you meet them (Tobin zone 5, Wren zone 10, Pip zone 15), named on that Champion's card. Until then All
  heroes shows them locked with where you meet them. Saves from before this (`S.party.unlock.startedAs` `''`) keep all
  three. Rule and field: `56c-unlocks.js`; rollback `STORY_TUNE.joinOnMeet`.
- **The road is shared.** Gold, gear, the camp and the furthest zone (`maxZone`) belong to the save. Each hero has its
  own level and remembers its own zone (`S.solo.zn`).
- **The roster** holds 32 heroes (`56-roster.js`); only the three with complete kits can carry the lamp. Unlock routes,
  Renown and boss tokens: `56c-unlocks.js`.
- **Levels and attributes** (`24g-data-hero.js`, `55-attributes.js`, `75-attributes-ui.js`; [hero-progression-build.md](design/hero-progression-build.md)):
  Attack, Parry, Dodge and ability power come from the hero's level: a move acts as trained to one below it (so a Lv 1
  hero hits for 4), up to 40 before the Proving and 80 after it, then half a level a level past that. Each level after
  Lv 1 also gives 4 attribute points, and the hero spends them on Hero > Build: Might (Attack), Focus (abilities),
  Guard (counters and up to 60 ms more parry window) and Vigour (health). A point adds 3% (Might, Guard), 1% (Focus) or
  1.5% (Vigour), and each level gives the rest of the old 4%; points in one attribute past half of all the hero has
  count half. Spread evenly, the points give the old +4% a level. Points belong to the
  hero. Adding them is free; Spread evenly places the free ones in one tap; the first Reset points is free and later
  ones cost gold (two taps). A fight takes them as it starts. The build only changes turn fights: away, raid and
  farm power read the level as if spread evenly. Unspent points do nothing, so Next Up says when there are some, and two levels' points or more unspent puts "Spend N attribute points" first, above every Ready row (the goal has its own system, so Learn never hides it). A
  level costs what the road expects (`xpNeed` follows the road, fights a zone rise by a steady ratio), and a hero more
  than 4 levels past the road's level at the furthest zone earns 0.6x XP a level further. A hero who takes the
  lamp joins at the road's level (2 above the road table, where players stand) at least (keeping their XP short of a level; a hero above it keeps theirs), and every
  other hero earns half the XP of each won fight. Away time earns no bench XP.
- **Training** (Hero > Training, `55-training.js`): off by default. With `HERO_TUNE.training = 1` gold levels up Attack,
  Parry, Dodge and ability power again (the game as it was: no attributes, no join level, no bench XP). On a save
  played with attributes, switching it on raises each hero's Training once to what their level gave them.
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
  "Passive". While the turn banner or the Versus card plays (and on the foe's turn), Attack and the abilities dim, their
  gold frame goes dull and an ability says "Wait"; a press then is refused with a short red outline (reduced motion keeps
  it) and is not queued (fight-input-during-banner). **Skills**: each slot's ability and cooldown; tap one to change it. **Foe**: its kind, an elite's trait and
  the moves you have learned (a zone boss shows the ones your lost tries taught you, one more a try; a beaten boss shows all). Parry and Dodge (A, S) sit under the dock on every tab and glow while a
  hit winds up. Short landscape keeps the names under small tiles. The turn order shows on the Versus card only.
- **Abilities** (`24c-data-abilities.js`, `56e-abilities.js`, `75-abilities-ui.js`): 14 a hero; the signature is free
  and the rest cost a Scroll of their tier (or a higher one) from zone bosses; a Moss Scroll teaches one move per hero, so spares
  wait for Tobin and Pip, and Abilities' Can learn list says who they are for. "Scroll found." shows only for a Scroll the hero in play
  can use now. On a zone 6 to 10 boss's first clear, the Lantern Cache card asks "Learn one now:" with up to three moves the dropped
  Scroll can teach the hero in play (only when two or more can be learned): a pick learns it and fills a free slot, or opens Abilities on
  it when the slots are full; "Keep the Scroll" keeps it (`75-caches-ui.js`, boss-spoils-pick). **Talents** (`24e-data-talents.js`): two choices for each
  ability and for Attack, Parry and Dodge. **Ability icons** (Codex's drawings, `art/abilities/`, converted by
  `tools/art/abilityicons.py`, embedded by `tools/art/embed-icons.mjs` under the live ability id): Pip's 14 are drawn on
  the bar, the picker and the Abilities list. Wren and Tobin keep lettered tiles until all 14 of theirs are drawn (whole
  packs only); `check.mjs` lists the complete heroes.
- **Stars** change the rules of a fight on top: up to 3 set and 2 lit a hero (see The hero).
- **Zones:** 5 won fights, then the zone boss, then the next zone (`ZONE_FIGHTS` in `40-rules.js`). Losing never moves
  you: a normal loss says so on the stage for the few seconds before the next fight ("Beaten. You're back to full HP for the
  next fight.", with one line on what helps this save: unspent attribute points, a craft you can make, or an easier zone), and
  three normal losses in ten fights in one zone add one bell line, once per zone a session; a boss loss opens the Try again
  card. Every fight in a zone (normal, elite or boss) starts at full HP, whether you won or lost the last one
  (`TURN_TUNE.normalFull`); in the Deepwell and the Provings your HP carries from foe to foe and each kill heals 15% of max
  HP (times the Healing gear line; the Deepwell's floor heal is its own). Bosses have no timer. In zones 1 to 15 no single boss hit takes more than 40% of your max HP, so one missed parry never
  ends a fight from full health; in zones 16 to 34 the cap is 75%. Zone bosses from 4 to 6 are tuned to a hero in the zone's first gear (common, +0),
  and from 7 to 24 to the hero a first-time player arrives with (the arrival footing: tier 1 common +0, the level the zones before give).
  Zone bosses 4 to 34 play move tricks (held swings, feints) and rally: at two thirds and a third of their HP in zones 4 to 6, and at three
  quarters, half and a quarter from zone 7. The boss's HP bar marks each rally point from the start of the fight. When your damage reaches
  a mark, the boss holds there until it has finished its next move (the mark turns gold and a line says so; damage past the mark is lost),
  then a line says the rally is over and the bar fades that mark. A rally that comes while the boss gathers a charged move means only a
  Stun breaks that charge. A boss you left part-way and meet again keeps the rallies it has already passed. On a boss you have not beaten,
  health above the zone's own gear does not shrink its hits (from zone 16 that gear is rare +5).
  Zone 16 to 34 numbers are provisional until the skilling and crafting balance pass.
- **After a boss beats you** (`55-boss-try.js`, `75-boss-try-ui.js`): the game stops on a Try again card. It names the hit
  that won and why (a charged move, a hit you did not parry or dodge, a try with bad timing, damage over time, or "so
  close"), the boss's weakness and resists, the moves you now know, and the ways forward that exist today. **Try again**
  starts the boss; closing the card keeps you fighting in the zone. The boss then waits behind the Fight tab's gate
  ("The zone boss is waiting") and does not start by itself, while the zone's fights keep paying as normal. The Auto switch
  (Fight tab, shown only while a boss waits) lets it come back on its own once you have a fair chance. Each lost try shows one
  more of the boss's moves in the Foe tab. State: `S.bossTry` (`hold`, `tries`, `rev`, `last`). Adds no power.
  **The chance decides** (turn fights, a loss at the frontier; boss-retry-reads-odds): the card says your chance to win now
  (`bossOdds`, worked out as the card opens; its buttons wait up to 1.5 s for it). Under `BOSS_ODDS.close` the big button is
  **Keep fighting here** and Try again is the small one; Next Up shows the chance as you level and gear up (keeping a row of
  its own unless the craft goal holds one for a tier gate) and says Try again only once the chance reaches `BOSS_ODDS.close`.
  Auto waits for that chance for `COMBAT_TUNE.bossWait` s; a weak held boss stays held after a return from away. A replayed
  boss below the frontier and the old real-time fight keep the old rule (15% more damage than the failed try).
- **Foes:** zone 1 is the Thorn Imp and zone 2 Gloomjaw, from the C22 roster with approved art (`59l-zone-foes.js`,
  `64j-foe-art.js`). Other zones still use the old foe types with turn move sets (`24d-data-turnfoes.js`). From zone
  15 about one fight in five is an elite with one trait.
- **Foe tricks say what they did** (foe-tricks-say-so): when a foe's rider lands on you, the stage line names it ("Chilled:
  you're slower", "Venom: you take damage for 2 turns", "Weakened: your next move hits softer"), and "Chilled: <foe> goes again"
  when Chill is why it acts twice. Rattlebones getting back up floats "Back up!"; the first resisted or armoured hit of a fight
  says "Resists <element>" or "Armoured" (Burn and Ignite numbers carry the ▼ too); a frozen foe's lost turn reads "Frozen".
  Nothing warns before a move. The Foe tab and the Bestiary add a line for each trick once it has landed on you
  (`S.mastery.tricks`, `55-mastery.js`); a boss's riders never teach an ordinary foe's entry.
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
- **The Gather menu** (`72-ui-gather.js`) is Gather A, the Command ledger Cal picked: per skill a head ("Mining Lv
  12", your tool and what it adds, the XP bar), a Now card that always says what you do (gathering here, at another
  skill's node, or fighting) with a minute, an hour, held of the cap and when it fills, then one row per node (held of
  the cap with a bar, a minute and an hour, Working on the node you work). Lower tiers fold into one tap; the next
  locked tier says what it needs and further locked tiers are one line.
- **Tools** (`55-tools.js`): pickaxe, axe, sickle and spear, made at the Workbench. The right tool is a speed bonus,
  never a gate. A tool you make and wear says on its craft card what it is faster than and why: the right-tool
  bonus (+25% while its tier is at least the node's) and its speed line, multiplying to the total. Each tool kind has its own mastery.
- **The Storehouse** (`55-store.js`): a cap per material and grade, from every source. Skill XP keeps counting at the
  cap. Its view (Gather > Store, `75-store-ui.js`) opens on a shelf: one stack per family at the grade you use (the
  lower of your zone's grade and your skill's top node; the largest stack at or below it when that grade is empty;
  Essence one pile; hide once Hunting shows), sorted Fullest or by Name, filtered by family. "Show all grades" or a
  family filter shows every grade. A refined good shares its raw family's stack ("Iron Ore 120" with "Iron Ingot 40"
  under it) and coal is its own stack once the Forge is built (at most 8 stacks). Coal and the refined goods show their
  names only, no icon, until their art pack passes.
- **Gatherers (Hands)** (`57f-hands.js`, `21f-data-hands.js`, `74-ui-hands.js`): open at Hearth 2 with a Tavern.
  Applicants appear on the Tavern board with a rarity and traits; named gatherers arrive by their routes. Tents cap the
  crew (2 to start). A send prepays one or two 4-hour shifts. Gatherers stand in the camp scene; tap one to talk and
  send it. Every random applicant carries one "Lit for ..." line. Named gatherers arrive by story: Tam comes up out of the cellars when Hands open, Rook after the zone 30 boss, Ada and Pell the morning (06:00) after the Hollow's Elder falls, Sister Fennel names Elowen's chapel only once that Elder is down.
- **Trade runs** (`57k-trade.js`, `74b-ui-trade.js`): from Tavern 2 a gatherer can carry goods away for 2 hours and
  bring back gold.
- **Tavern perks** (`57g-tavern-perks.js`): Omen forecasts, applicant timing, rumours, bounty bonuses.

## The camp

- **Hollow's Rest** (`57-camp.js`, `75-camp-ui.js`, scene `63d-scenery-camp.js`): the Hearth, Watchtower, Forge,
  Workbench, Loom, Enchanter's Table, Tavern, Storehouse, Tents, Library and Shrine. Builds run on the wall clock. A Build
  button asks twice: the first tap turns it into "Tap again" for 6 seconds. When Hesketh's step asks for the Workbench,
  the Forge or the Storehouse, one tap on that station's Build button builds it. Cancel always asks twice.
- **A new game starts cold** (`55-hearth.js`): the hero lights the fire, then builds the Workbench, the first tool and
  the Forge. Until the fire is lit (and once Gather is open), Next Up keeps a row for it: "Chop Pine Log for Hesketh's
  fire: 3/8", then "Light Hesketh's fire: ready" with 8 logs in hand. Go sends the hero to the Pine Grove, where the fire is.
  The row survives a reload and a closed tip. Hesketh's "Bring me Pine Log" line, if you reloaded before reading it,
  comes back once at the next boot.
- **Shrine Blessings** open as Codex pages fill.

## Gear and crafting

- **Crafting** (`55-crafting.js`, `41-items.js`, `21-data-craft.js`, `75-craft-ui.js`): class gear at the camp's
  stations, grades 1-5. Items roll affix lines by rarity. Upgrades go to +10 (Trophies gate +8 to +10). Reforge,
  Masterwork is in the Craft tab; worn gear, the bag, upgrades, reforge and salvage are on the Hero tab's Gear view. Every combat line works in a turn fight (59k `turnMakeProfile`; the audit
  is [combat-turn-build.md](design/combat-turn-build.md) "Gear stats in turn fights"): Spell power is fire, frost and
  holy damage, Damage over time (the old Area) Burn and Bleed, Control boss Stagger, Counter (the old Threat) counter
  damage, Speed (the old Attack speed) how often you act, Focus a steady cooldown refund.
  The result card after a craft (`craft-delta`): a tool that beats the worn one (or fills an empty slot) goes on by itself
  and the card says how much faster you gather; gear always asks. A weapon, off-hand or charm the hero can wear gets one
  line on how often you'd beat the boss at your furthest zone with it (or, when you win nearly every time, how many turns a
  win takes); head and body pieces say how much of your health a boss hit takes. The line comes from 80 scratch turn
  fights a side (`55-fight-delta.js`, as the boss-odds readout samples) and is left out when the numbers barely change.
- **Refining** (`55-refine.js`, `75-refine-ui.js`, `REFINE_TUNE` in `21-data-craft.js`; card refine-queues): the Forge
  smelts ore and coal into Ingots (Copper, Iron, Silver, Cobalt, Mithril Ingot), the Workbench saws logs into Planks
  (Pine, Birch, Oak, Mangrove, Tideash Plank), and the Loom weaves fibre into Cloth (Hemp Cloth, Linen, Briar Cloth,
  Kelp Cloth, Stormgrass Cloth) and tans 2 hide and 1 log of the same grade into Leather (Bristle, Duskfang, Fenscale,
  Riptide, Kelpie Leather). Each takes 2 of its raw input; an Ingot also takes 1 to 4 coal by grade. From grade 2, crafts
  take the middles (every ore, wood, fibre and hide count becomes the middle at half, rounded up); every upgrade's
  material does too (a Copper Warblade +1 takes 1 Copper Ingot). Tools, charms and trinkets, crystal, herbs and Essence
  stay raw. Each station's card in Camp has a button (Smelt, Saw, Weave and Tan) that opens its order list: up to 3
  orders, run in turn, each 10 units or All (All keeps 20% of each input). A running order shows its rate; a stopped one
  says why (done, out of an input, Storehouse full). Orders run while you fight and while you are away (the away report
  has a line per station). An order of 10 that finishes while you play puts one line in the bell ("The Forge made 10 Copper
  Ingots."; orders done back to back share one line) and lights the Camp tab's dot; an All order and the away run add none
  (card smelt-done-says-so). Station levels refine 10% faster a level. Next Up offers "Smelt 1 Copper Ingot for your
  Warblade +1" when a worn piece's upgrade or next craft waits only on a middle, or says where to get the missing coal or
  ore. **Coal** comes with Copper Ore once the Forge is built: about 1 for every 2 ore the hero mines (live, away, the
  Glint, Spillover); gatherers bring none until the Coal Seam (card coal-seam-integrate). A save from before refining
  sees one card the first time it opens Craft with the Forge built. Tent 5's tier 4 plank, cloth and leather now exist.
- **Uniques** (`UNIQ` in `20-data.js`): rare zone-boss drops with a strong effect and modest stats. The zone 1 unique (and every 7th zone after it) is Briar Sprig, a charm any hero can wear; the Sproutblade it replaced is retired (`retired: 1`): it no longer drops, old saves keep theirs, and the trophy wall, Codex and totals show it only to a player who found one (`uniqKeys()`). Each Hollow unique carries one flavour line naming the Champion and place it came from (`21ka-story-hollow-items.js`); it shows on the Codex tile and the item card once that area's Champion is in the game.
- **Economy** (`55-econ.js`, `21w-data-econ.js`): gold per foe steps up by region; every price follows that curve.
  Gold-gain beyond gear became crit damage, capped.

## Side systems

- **Deepwell** (`57d-deepwell.js`, `59c-deepwell-combat.js`, `75-deepwell-ui.js`): from zone 20 and Hearth 3. Each
  floor is a turn fight. Runs floor by floor on Oil, with boons, Depth Marks and a weekly Trial. A run never changes main progress. Its Deep Lore pages follow the story's rule that the dark copies shapes.
- **Bounties** (`55-bounties.js`): three short goals that pay gold, materials or Essence, and Renown.
- **Mastery and the Bestiary** (`55-mastery.js`): zone stars and per-foe perks from kills. The Codex Bestiary also shows one line for each Hollow monster you have reached that is in the game, saying what shape it copied (`LORE_FOES` in `21h-lore-hollow.js`). Foe tells use solo wording.
- **Almanac** (`55-almanac.js`): a daily Omen, optional Dares and a weekly board. Each Omen's "Best today" line has a Go button; on Cheap Reforge and Salvager's Luck days it opens Hero, Gear (Craft until the Hero tab opens). Omen lines name no person or place you have not met; Oriel's line comes after Chapter 4.
- **Codex** (`57c-codex.js`, `75-codex-ui.js`): the collection book. Lantern Light gives titles, cosmetics and small
  capped perks.
- **Deeds** (`23-data-deeds.js`, `58-deeds.js`, `75-deeds-ui.js`): tracks, Feats, titles and looks drawn on the hero
  (`12g-art-accessories.js`, `64-looks.js`), and the Trophy Wall at camp (`63e-scenery-wall.js`).
- **Next Up** (`55-goals.js`): the goals closest to done, with Go buttons. A weapon or armour craft goal names the boss it is for ("Craft a Pine Bow for the zone 2 boss"); when you can pay for an upgrade to a worn piece and no craft is ready, it offers "Upgrade your Pine Bow to +1", and Go opens the piece on Hero, Gear. From the first tool made until a weapon is worn, the weapon holds a row of its own above every unfinished row, names where its short material comes from ("Pine Staff for the zone 4 boss: mine 3 Quartz at the Quartz Geode"; Go opens that Gather view), and no upgrade is offered. After the zone 10 clear, Next Up offers the camp's step up, Hearth 2 and then the Tavern, naming each part of the cost still short and where it comes from ("Build Hearth 2: 20 Pine Log at the Pine Grove, 20 Copper Ore at the Copper Vein, 5 Essence from fights"). While a gathered part is short and you are elsewhere the row is Ready and Go sends you to that node; once you have what that node gave, it offers "Back to the fight", and with everything in hand it reads "Hearth 2: ready to build" (or the camp's own build row offers it).
  **"Boss ready"** means you would usually win the zone boss. The game tries 30 scratch fights of that boss with your
  hero as they stand now, judged from your own Parry and Dodge record (a new player counts as casual), and says "Boss
  ready" at 70% or better. Under that it says "a close fight" (35% to 70%) or "too strong", and Go opens
  Build when you have points to spend, else the fight. While it works it says "The Zone N boss is next". It only judges; you can still challenge any time
  (`59m-boss-odds.js`, `bossOdds()`).
- **Story** (`55-story.js`, `75-story-ui.js`, `21k-story-hollow.js`, `21h-lore-hollow.js`, `21b-stories-coast.js`, `21j-lore-omens.js`): one system that plays the region card, area titles, zone and Captain lines, Champion and Elder scenes, NPC and Voice cards and choices from `STORY_BEATS`, once per save, between fights, silent where the game is not ready (no monster or encounter, no data). Skip always works; everything read is in the Journal (Codex). A story card waits for a tap, but files itself to the Journal under "Catch up on the story" after 45 s untouched, and the game runs again; a choice in it waits in the Journal entry until you make it. Settings > Story switches it off. Close the game while a story card is up (or still waiting for its gap) and it opens again at the page you were on, at the first gap after you come back; a card that can no longer be built (a hero who is now in it) goes to the Journal instead (`S.story.open`). On a landscape phone a story card is a wide bottom sheet no taller than 60% of the screen, with Continue and Skip in a column beside the text, so every Chapter 1 card shows all its lines without scrolling. A new game opens on the Chapter 1 card, then two Old Hesketh cards (the fire, then what is in the ground), all before the first fight; a save already past zone 1 finds them in the Journal. The hero picker shows bios for the three starters only; every other hero says "Locked" and who you meet. No new hero can unlock before their first scene can have played (`STORY_MEET` in `56c-unlocks.js`; a scene on a Champion's post plays when that Champion falls, so Bram and Thessaly join from zone 36); heroes a save already owns are kept. At camp, All heroes says when a held hero joins: the zone in your chapter ("You meet Bram when the Hollow is won, at zone 36."), else the chapter ("You meet Kestrel in Chapter 4."). A won hero token is a bell line that says when that hero joins. The story bible is [story-bible.md](design/story-bible.md); [lore.md](design/lore.md) is the older lore. The Journal also holds "Who answers to whom", a page that adds a row the first time you meet each rank (Shadowborn, Captain, Champion, Elder, the Voice). Once an Elder is down, the Tavern shows Vesper's verse for it.

## Onboarding and notices

- **Unlocks** (`FEATURES` in `55-onboard.js`): a new game shows the Fight tab only. Tabs and views open as the player
  reaches them: Hero at the first level-up (hero level 2), Gather after the first boss, Bounties at zone 4, Camp at zone 5, Craft and the
  Bestiary around zone 6, the Almanac at 7 minutes, Uniques, the Tavern, the Codex (zone 10), the Raid (zone 12),
  Stars (hero level 10), the Deepwell (zone 20 and Hearth 3) and Hands (Hearth 2 and a Tavern). Once open, a feature stays open.
  One new thing every 90 s (`ONBOARD_TUNE.gap`, 90 s of play): ready rows queue and open in table order, so after the first
  boss Hero comes first, then Gather, Next Up and the away strip (row `awaynote`), 90 s apart. A row the player's own act
  or a drop opened skips the queue: walking to gather, the fire lit (Camp), the Workbench (Craft), the Tavern built, the first
  star (Stars), the first unique (Uniques); the raid opens as before.
- **The guide** (`GUIDE_STEPS` in `55-onboard.js`, UI `75-onboard-ui.js`): one hint at a time, spoken by Old Hesketh (his face on the left) from a panel that never covers the stage: in landscape the side column's notices slot (it stands in for Next Up while it speaks), in portrait a slot above the Act / Skills / Foe bar, and over an open menu the bottom of the menu panel. The Got it / Go button has its own row. After the first ability the guide asks you to add a point to Might on Hero > Build, then, once the points are spent, offers Back to the fight (it closes the menu). A tool or first weapon that is in the bag but not worn gets its own step: the tip names it, rings the card's Equip button and carries an Equip button of its own. A weapon you only own does not count as made until it is worn. Wren and Pip make their first weapon at the Workbench, so its steps come right after the tool and before the Forge, and the materials line names the place ("Mine 2 Copper Ore at the Copper Vein for your first weapon (0/2)."); Tobin's Warblade still waits for the Forge. A materials line ("You still need these for the Forge: Copper Ore 0/25 at the Copper Vein, Pine Log 2/10 at the Pine Grove.") shows on Camp, on Gather and on the game screen while you gather, never over Hero, Craft or another menu; a line for two or more materials names each one's place. On a wide view (a laptop, a desktop, a phone on its side) it also shows on Camp and Gather while you fight, beside the menu, steady between foes and with no button, so Attack, Parry and Dodge stay in view. A fighter who never opens Camp or Gather hears it once instead, held in the gap after a kill ("The Forge needs Copper Ore 0/25 from the Copper Vein and Pine Log 2/10 from the Pine Grove."), with a Go to the first node and ×: never in the first minute after you open the game, at most one such line a minute, never over a menu, never for gold or essence alone, and never once you have seen the live line. A press step (build, make) waits until its materials are in hand, so closing a materials line with × never puts an "Open Camp." in its place while you are short. Under a recipe short of a gathered material, the Craft card says where it comes from ("Bristlehide: from Hunting, which opens at zone 5."). Old Hesketh's unread lines (a new tab, your first Scroll, a new move's slot) survive a reload (`S.onboard.sayQ`); the boss-loss line does not. Closing his tip that your weapon or tool is still in your bag, or his Gather tip for the cold fire, with × (or leaving it for a minute) hides it until the next time you open the game, while the job is still undone; wearing the piece, or going to gather, ends it for good. The Storehouse tip says the packs are near full only when a pile is at 80% of what the packs hold; otherwise it says the Forge is up.
  A step pauses the game only while it waits for a press; a step that needs game time shows live progress instead.
  The first fight is a lesson (cal-0107-staged-guide): each press is taught the first time it comes up, with the fight held until you
  press it: Attack on your first turn, Dodge on the foe's first swing (the foe's clock stops as the Dodge window opens, so the press
  lands), your ability on your next turn, Parry on the next swing (or the next foe's first). While a lesson holds, only the button it
  names works. After that, in a fight, no line shows: every
  other tip, and each unlock line from Hesketh, waits for the gap between fights, and an unlock line holds the game with a Got it.
  The Hero tab opens at the first level-up and the guide's next line says so; the first Scroll and a second ability's slot each get
  a line. Empty ability slots stay dim and silent until a learned move waits for one. Lighting the camp fire keeps you at the grove,
  where Hesketh's talk plays.
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
- **Two tabs** (save-two-tabs): the newest open tab holds the save. A tab whose save another tab has since written stops saving and shows "Lanternfall is open in another tab. Reload to keep playing here." with Reload, so it never writes over newer progress (`30-state.js` `saveCheck`, `75-tabs-ui.js`).
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
