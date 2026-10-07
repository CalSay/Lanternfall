# Owner decisions

Every standing owner decision, by topic, with its date. A later decision wins over an earlier one. The last section
lists decisions that a later owner decision replaced, so the history behind a rule stays readable. Rules that live in
`CLAUDE.md` (save wipes, landscape, art freeze, online data) are not repeated here.

Older design specs were retired on 2026-10-02. Read any of them with `git show 1536ffa:docs/design/<file>.md`.

## The game

- **Claude decided: hero barks (card hero-voice, 2026-10-06; Cal can veto).** Only the three starters speak, one line each
  at nine moments (first boss, later boss, boss loss, unique, level, ability, first Star, first craft, Hollow Great Lantern);
  no class lines and no lines for the other 31 heroes; at most one bark a fight end, strongest first. Opus judge (red team,
  then judge) rewrote "hole" out of the first-boss lines (the player may not have heard Hesketh say it yet), kept bible 4.6's
  lantern lines verbatim, and approved cutting the fire-lit bark: Hesketh's talk owns that moment. The hero sheet's record
  is headed "On the road" ("With you" read like companion language). Scores: Hero arc 3, Fit 4, Clarity 4.

- **No prestige or resets.** Progress is permanent. Freshness comes from mastery, collections, build variety and new
  regions. (2026-09-27)
- **Single-player first.** The world raid and Tavern stay optional, light extras. (2026-09-27)
- **Store launch possible; the money model is set** (see [Money](#money)). Original art only, no restrictive
  third-party assets, nothing pay-to-win. (2026-10-06)
- **Owner role: player.** The coordinator drives the roadmap and brings playable builds and decisions at milestones.
  Decisions that belong to the owner (art direction; anything that takes real money: store accounts, payment code,
  live prices, business and legal set-up; anything irreversible) are asked, not guessed. Money design is Claude's,
  within the Lantern Rules. (2026-09-27, narrowed 2026-10-06)
- **Combat is active only.** No Auto, no idle fighting, no away combat earnings. Gathering stays idle. (2026-10-01)
- **Version 1.0 is a complete Season 1:** five regions, the story to the first fight with the Voice, 32 heroes, two
  named gatherers per resource job. The story continues in Season 2. (2026-09-28)
- **1.0 also includes:** a polished first hour, save safety (export and import at least), an in-game guide and
  glossary, accessibility (colour-blind-safe damage types, text size, volume mixer), sound and music, hero quests,
  fishing and the Kitchen, challenge modes, and a shareable camp card. Guilds and bigger social features come after
  launch. (2026-09-28)
- **Length:** depends on how fun and replayable the loop is; players must stay committed. (2026-09-28)
- **After 1.0:** the Lantern Festival, titles visible to other players, a second evolution tier. (2026-09-28)
- **Art commissions wait** until the game is ready for launch. (2026-09-28)
- **Rejected:** the lantern network. **Maybe:** factions and reputation, once the world map has real places.
  (2026-09-28)

## The hero

- **Solo hero.** One hero fights at a time; there is no party. The starters are Wren Hollowmere (archer), Tobin Reed
  (tank) and Pip Cinderly (caster). Heroes keep their stories, and the lamp passes to whoever you play. (2026-09-29)
- **32 heroes for 1.0**, arriving a few at a time. Each ships complete: art, kit, Hallowed looks, subclasses, an unlock
  route, a hero quest and a part in the story. (2026-09-29)
- **Ascension:** the Proving is a region-boss fight that Ascends the hero into a subclass with new abilities. A hero may
  stay in its class. (2026-09-29) A subclass replaces the 8 signature abilities; the 6 shared stay. (2026-10-01)
- **The Proving opens once the Region 1 boss is defeated** (a milestone; no level-60 gate). Every region boss should
  bring a big moment like it. (2026-09-28)
- **Hallowed:** finishing a hero's quest Hallows one signature ability: bigger, brighter effects, often a new colour,
  a halo mark on its button, about +40% power, -20% cooldown and one bonus by shape. One per hero, movable for a cost.
  (2026-09-29; not built)
- **Bonds become campaign story** told through NPCs on the world map (gatherers, the tavern keep and others). Bond
  writing stays only as source material. (2026-09-29)
- **Removed from the game:** formation, Bonds, combos and Kin, companion XP and promotions, companion achievements,
  "party damage" bonuses, Tavern recruiting. (2026-09-29)
- **Rework for solo:** recruit routes become hero unlock routes; party-damage uniques get solo effects; pinnacle bosses
  and legendary circle sets need solo versions; expeditions become trade runs by gatherers. (2026-09-29)
- **No Training for Attack, Parry and Dodge.** They come from hero level, star points and abilities. Hero level carries
  the power curve, and the XP for a level follows the road. Each level gives attribute points to spend, with a respec.
  Weapons scale with the attributes you chose. (2026-10-06; `docs/design/hero-progression.md`)
- **Classes:** three base classes by armour weight: Warrior (heavy), Ranger (medium), Mage (light). Evolutions: Warrior
  to Reaver (damage) or Warden (utility); Ranger to Venomstalker or Trapper; Mage to Warlock or Priest. Each evolution
  must feel special and clearly stronger. The Warlock's title is the Shadowbinder. (2026-09-28) The support class is
  the Lightkeeper, not the Chaplain. (2026-09-27)
- **The evolution choice is permanent,** with a costly respec, and one free switch within 10 minutes of choosing.
  (2026-09-28)
- **Playing a tank or support must not be weaker** than a damage class. (2026-09-28)
- **A new hero joins at the road's level** (the level the road expects where you are). The same floor applies whenever
  a hero takes the lamp, so rotating never slows progression. Benched heroes earn half XP. No other catch-up. (2026-10-06)
- **Region 2 expects a trained-up, stronger hero,** with a hint when the hero hits its limit. (2026-09-28)
- **Hero fatigue:** yes, but rotating heroes must never slow progression. (2026-09-28)
- **Tactics:** yes ("tower defense vibes"), once combat is substantial. (2026-09-28)

### Hero progression: judge rulings (2026-10-06)

- **A switch is judged by the joining hero's own budget.** The new hero spends the lamp's Scrolls first, as a player
  would. Normal fights stay within 10 points of the hero who left. Played well, the zone boss is won 60% or more.
  Heroes differ on purpose, so the new hero is not held to the old one's rate. (2026-10-06)
- **The boss gap after a switch is gear, not level.** The lamp's gear follows the hero who earned it. The `gear-weight`
  and `tobin-safety-margin` cards close the gap, and `switch-row` checks it for every hero. No catch-up. (2026-10-06)
- **Level gaps: at most 3 zones' play with no level-up in zones 20 to 30** (good play). 2 zones is the target. Tobin's
  longer gaps are walls at zones 27 and 29, so `mid-zone-wall` owns them; the XP curve stays. (2026-10-06)
- **Pace bands count only where the old game did not wall.** Casual Tobin reaching zone 25 sooner than before is a
  wall removed, not levels given away. (2026-10-06)
- **A farm build is allowed.** Focus kills normal foes faster and wins fewer bosses. A reset costs gold after the
  first, so farming and bossing builds are a real choice, not a free swap each fight. (2026-10-06)
- **Might waits for weapons that scale with attributes.** A weapon that scales with Might lifts all of its damage.
  The `craft-attribute-grades` card must put Might in a winning build. (2026-10-06)
- **The early road is not sped up to fill an unlock gap.** A faster road makes the first hour's dry stretch longer.
  Until `story-unlock-gates` spaces the early unlocks, something new comes at least every 4 minutes in the first 10,
  not every 3.5. (2026-10-06)
- **A boss off its band is fixed at the boss, not by weakening heroes.** Attack and health now rise smoothly, so a
  Lv 29 hero is 15% stronger than on the old step and a Lv 27 hero 10% weaker. The zone 20 Captain is too easy for the
  hero who keeps up; `boss-tiers` fixes it. Heroes are not cut to fit one checkpoint while zones 25 to 34 are walls.
  (2026-10-06)
- **The unlock governor sets the warm early pace.** A warm hero now reaches the camp, the first star and the Tavern
  sooner. Those open at once and restart the one-a-minute clock, so Gather and Bounties wait their turn. The warm check
  asks for Gather by 5:30, Bounties by 7:30, and no wait longer than the gap. It asked for 4:00 and 5:00 before. New games
  are cold and still open Gather by about 2 minutes. Review by 2026-11-15. (2026-10-06)

## Abilities

- **14 abilities a hero: 6 shared (by play style) + 8 signature.** Equip 3; a 4th slot comes later with a bag button
  (a turn to drink or eat). (2026-10-01)
- **Passives** take a slot, have no button and are always on: one per shared pool and one per signature set.
  (2026-10-01)
- **Timed abilities:** 4 a hero (12 in all). Press again as a ring closes: Perfect adds a bonus, Good is the ability as
  written, a Miss hits weaker. (2026-10-01)
- **Aim** is Wren's resource. **Base crit damage is x2.5.** (2026-10-01)
- **Scrolls unlock abilities,** dropped by zone bosses by zone band. (2026-10-02, the C29 build)
- **Talents:** each ability, and Attack, Parry and Dodge, has two talents to pick from. (2026-10-02) **No suggested
  builds:** finding what works should be hard and rewarding. (2026-10-02)

## Combat

- **Turn-based, one enemy at a time.** Enemies are stronger to make up for it. No click-spamming. (2026-09-30)
- **Defence is one choice per hit.** Parry (harder: blocks, refunds) or dodge (easier: only avoids). No ability makes
  the choice and no attack is parry-only or dodge-only; abilities may only make an option easier or more rewarding.
  (2026-10-01)
- **Every successful parry takes 1 turn off every cooldown** (per hit). The counter (a sure crit) only comes when
  every hit of the move was parried. (2026-10-01)
- **Parry window 0.18 s, dodge 0.35 s** to start; both are tuning knobs. (2026-09-30)
- **Cooldowns reset every fight.** (2026-09-30)
- **Speed sets how often each side acts** (Expedition 33 style), not only who opens. A Speed gear line is wanted.
  (2026-10-01) The old gear stat Haste (shorter cooldowns) is called **Focus**. (2026-10-01)
- **Enemy profiles:** after the first fight an enemy gets a profile; the more you fight it, the more you learn.
  (2026-09-30)
- **More Essence per kill,** so fewer kills do not starve Essence. (2026-09-30)
- **Bosses:** no timer and no Enrage; a boss fight lasts until one side falls. (2026-10-01)
- **Bosses are special** fights with their own moves, and enemies and bosses hit much harder than the old idle game.
  (2026-09-28) Elite traits: yes. (2026-09-28)
- **Zones advance only on a win:** 5 fights, then the zone boss, then the next zone. Losing never moves you. Entering an
  earlier zone starts at fight 1 of 5. (2026-10-01)
- **Fight feel:** a pause between turns with a whose-turn banner, a bigger labelled timing bar, hit-stop and shake on
  big hits, damage numbers that say their source, ability numbers shown only outside a fight. (2026-10-02)
- **Versus header:** fighting-game HP bars across the top, hero left, foe right. (2026-10-01)
- **A zone foe resets after every attack** (hop in, attack, hop home, rest), so approved animations play in full.
  (2026-10-02)
- **No telegraph of the foe's next move:** it makes combat easier. (2026-10-02)
- **No suggested builds or combos in the game.** Finding what works should be hard and rewarding. (2026-10-02)
- **No healing between fights.** (2026-10-02)
- **Elite traits in turn fights,** but Speed never gives a foe endless turns (2 in a row at most, a boss 3). (2026-10-02)
- **Talents** (Codex's star forks): two picks per ability and for Attack, Parry and Dodge. (2026-10-02)
- **The Deepwell and the Provings fight in turns** like the zones. (2026-10-02)
- **An Assist setting** that widens the timing windows: yes, low priority. A late-zone balance pass: yes. (2026-10-02)
- **Rework the Stars like E33's Pictos:** "Rework them. Make them feel actually useful without breaking the balance of the
  game. 1% damage feels unrewarding. Maybe let them add to the abilities and combos. Think of this section like pictos
  from E33." Built as the Stars: rule-changing effects that are found, set (3), learned in 4 won fights and then lit by
  any hero for star points (2); the old star map and its keystones are gone. (2026-10-02)
- **More stars, better menus, and the star map back:** "Yeah that's fine. Might need more of them though. We also need
  much better menus for abilities and stars. I kinda miss the star map too :/ idk how you'd incorporate it though."
  Built as 18 more stars (43), found in later places (zones 37 to 70, elites from zone 36, Deepwell floors, a second
  pass of each Proving), and the Stars view as a star map: six constellations, one per place stars are found, with the
  loadout always in view; a complete constellation gives a star point and quicker learning. (2026-10-02)
- **Tobin survives best and kills a little slower,** but never boringly: a balance pass yes, balanced around that
  (the safest hero, about 15-30% more turns a fight than Wren and Pip, his turns full of Grit, counters and Shield Bash).
  (2026-10-02)
- **Bosses take longer and still hit hard:** "Yes make the bosses take longer and still hit hard. We should feel it
  necessary to scale ourselves with crafting higher level gear. With that said, it should always be very bad for us to
  get hit by a boss. Regular monsters we should be able to take a few bits but bosses should be serious." Like
  Expedition 33: basic enemies die quickly, bosses take a lot of hits. Built as the boss pass (`combat-turn-build.md`).
  (2026-10-02)
- **Gear stats work in turn fights** (owner: "Gear stats should be looked at then I guess?"). Built as the gear pass: every
  line a player can roll does something in a turn fight. Threat reads as Counter (counter damage), Area as Damage over time, Attack speed
  as Speed (the Speed gear line), Spell power as spell damage (fire, frost, holy); Control staggers bosses, Pierce
  ignores armour, Healing and Ward work on heals and Wards, Focus is a steady cooldown refund, and the Golemfist doubles
  the Attack only. Each Cinder Pip holds adds 4% to her fire damage (the passive Claude offered; the owner has not ruled on it yet), so she kills
  bosses about as fast as Wren; bosses and Tobin's Grit were retuned to keep the boss bands and Tobin a little slower.
  (2026-10-02; `combat-turn-build.md` "Gear stats in turn fights")
- **Explain each hero's resource** (Aim, Grit, Cinders) in the game. Pip's resource is called **Cinders**, not Embers,
  so it does not clash with the raid's Embers. (2026-10-02)
- **The Fenmother may be hard:** about 25-30% casual wins for a hero who keeps up is fine for a region boss. (2026-10-02)
- **The difficulty budget** (Claude decided, judge 2026-10-06; veto if you disagree): every fight kind has a casual and a good win band for each starter who keeps up with the road (normal 90-100% casual, elite 75-97%, zone bosses 1-3 85-100%, 4-10 70-90%, Captains 60-80%, Champions 40-60%, Elders 20-40%; Tobin +10 on bosses), and `health.mjs --compare` gates on it with owned, dated known gaps. `docs/design/difficulty-budget.md`.
- **Gear stats must work in turn fights;** Pip's slow late kills come from dead caster lines. (2026-10-02)
- **Stars:** 3 set and 2 lit is fine; learning in 4 wins is fine; there should be more stars. The Abilities and Stars
  menus need to be much better, and the owner misses the old star map. (2026-10-02)
- **Leftovers:** a local raid fight is accepted; Deep Elders give at most one buff item a run; Hollow bosses give no
  buff items. (2026-09-28)

## Enemies and the world

- **World structure:** 5 regions (Hollow, Sunken Coast, Emberwaste, Pale Reach, Gloamvale) x 7 areas x 5 zones. Each
  area is played once. Each zone has its own monster: 5 fights, then its Shadowborn Captain. Each area ends in a
  Champion of Darkness, each region in an Elder of Darkness. 43 unique enemies a region, 215 in all. (2026-10-01)
- **Enemies come from the darkness.** They are not corrupted creatures. Lean into fantasy. Fewer, better enemies,
  fought again and again. (2026-10-01)
- **Bosses never repeat.** A return must be a new, stronger encounter with a reason. The Voice is one big fight in
  phases. (2026-10-01)
- **Rewards:** enemies drop gold, Essence and relics; some bosses drop uniques; elders keep their Trophies. Enemies
  never drop crafting materials. (2026-10-01)
- **Design the full roster and its moves first;** poses follow the moves, and existing art never limits a monster.
  (2026-10-01)
- **Zone 1 is the Thorn Imp, zone 2 Gloomjaw;** zones 1 and 2 send only their own monster. Zones 1-7 use the Mossy
  Hollow scenery. (2026-10-01 to 2026-10-02)
- **Region bosses are agents of the darkness** (the Voice's Shrouds). They are never tied to lanterns or lamps.
  (2026-09-28)
- **Region 5 is its own place** with its own look, not the Deepwell continued. The Deepwell must still tie into the
  story. The Voice's reveal speaks of darkness enduring. (2026-09-28)
- **Random events and secrets** at launch. (2026-09-28)

## Gathering, gatherers and the camp

- **Hunting** is on, with Codex's interim art (see `CLAUDE.md`). Hunting beasts are ordinary animals the darkness
  drove into a rage, never fought as enemies. Hide comes only from Hunting; the tool is a spear. One beast at a time:
  it falls in place and a fresh one fades in. (2026-10-01)
- **Gathering tiers come slower:** a tier only 4 levels away was too fast. (2026-09-28)
- **The Storehouse caps what you hold** from every source, active gathering included. Skill XP keeps counting when a
  pile is full. It must scale up fast enough for an idle game. (2026-09-28)
- **Gear needs its own building,** the Armoury (bag size, loadouts, lock, auto-salvage, display rack). (2026-09-28)
- **A cold Hearth start** with stations you build; tools shown in the hero's hands; the hero gathers alone. (2026-09-28)
- **Gatherers (Hands):** live at camp and show there; tap one to talk, then send them on a job of their profession.
  Hired with gold, with rarity. The cap is the number of Tents (2 at the start). No daily wage: a fixed fee per shift
  by resource grade. Unpaid gatherers stop working; they never leave or lose levels. Two named gatherers per resource
  job for 1.0, each with different benefits. A Hunter job: yes. Upgrade trees per gatherer. (2026-09-28)
- **Trade runs:** gatherers go away to trade and come back with goods. (2026-09-29)
- **The camp grows sideways** (swipe to pan), with an overview zoom. Buildings get upgrade trees inside them.
  (2026-09-28)
- **Campaign NPCs (C6):** a keeper and a practical host; a proper dialogue screen, a popup that dims the game.
  (2026-09-30)
- **Early pacing targets (C10a):** Hearth 2 and the first gatherer shift in about 30 minutes; about double the early
  gold an hour; gathering levels 1-14 in about half the time. (2026-10-01)
- **Slower pace overall:** the damage ramp stays flat and party-era recruit pacing is gone. (2026-09-27)

## Gear, resources and economy

- **Uniques are weaker on stats and rarer;** their effect is the draw. Uniques are boss drops themed to the boss type.
  (2026-09-27, 2026-09-28)
- **Crafting:** random affix lines by rarity, Reforge one line at the Enchanter's Table, Trophies gate +8 to +10.
  Essence stays fight-only. (2026-09-27)
- **15 material tiers, 3 per region; resources are gated by region.** (2026-09-28)
- **Material names are real, standard fantasy materials,** never invented compounds. (2026-09-28) The approved 15-grade
  names for all seven families are in `art/resources/regional-audit/complete-ladder.json`. (2026-10-01)
- **Gear by class:** two materials per item, about 70/30: Warrior armour metal + leather, weapon metal + wood; Ranger
  armour leather + cloth, weapon wood + metal; Mage armour cloth + leather, weapon wood + gem. (2026-09-28)
- **Production chains** run in the background at stations (for example ore + coal to ingots). A Tannery: yes. The
  Still is benched until after 1.0. (2026-09-28)
- **Sockets and enchanting:** gear sockets are class-specific, and every gathering skill feeds a socket family, not
  only mining. Enchanting applies buff items to gear and unlocks in Region 2. Bosses always drop their signature buff
  item. A finder perk on gatherers is about +5%, and active gathering finds more. Taking a buff item out of gear breaks
  it; salvage has a 50% loss chance (a Salvage Rune makes it 0%). (2026-09-28; not built)
- **Gold economy:** gold stops inflating (gold per foe steps up by region); gold is the camp's budget and hero power
  comes from gear, materials and XP. Gold-gain stays as a low gear line; other gold-gain sources became crit damage.
  (2026-09-28)

## Achievements

- **Really hard achievements with cool rewards:** titles and accessories drawn on the hero. (2026-09-28)
- **Earned looks stay earned.** A look from a Deed, a Feat, a boss or a secret is never sold. Store looks are a separate
  catalogue and never copy or recolour an earned look. The Wardrobe marks each look Earned or Store, and its collection
  count counts earned looks only. No look gives power. (2026-10-06)
- **The top tier is Everflame** (Bronze, Silver, Gold, Everflame). **Titles are short epithets** a person would be
  known by: one or two words, at most 14 characters. (2026-09-28)
- **Online titles:** yes, but not for 1.0. (2026-09-28)

## Money

Claude decided after a red team and the Opus judge, on Cal's delegation (2026-10-06, "I don't want to be involved").
Plan, evidence and rulings: `docs/design/monetisation.md` and `docs/design/monetisation-records/`. Store accounts,
payment code, live prices and business and legal set-up stay with Cal.

- **The model:** free to play, Season 1's story free for good, no ads of any kind (rewarded ads included), no premium
  currency (real prices; where a store charges a flat fee per sale, looks sell in sets). Later seasons may be paid
  expansions, and the store page says so from day one. (2026-10-06)
- **What is sold:** looks (the existing slots plus a parry spark and, later, camp pieces), hero outfits (the three
  starters first, then one per new hero), outfits by armour weight, critters, the Lantern Keeper and one supporter pack.
  A free and paid Road Pass (looks only, earned by normal play, never expiring) comes after 1.0. Heroes are never sold.
  Every new look, spark or outfit comes as a complete Codex art pack vetted as a whole set (art freeze); agents never
  draw them in code. (2026-10-06)
- **The Lantern Keeper:** one purchase, no membership at launch. Loadout slots past the Armoury's maximum (a late Deed
  gives the same), a look set and credits. It also adds 2 hours to the away cap you have built (gathering only, never
  past 24) only if a free bot run reaches the 24-hour cap within 40 hours of play; otherwise it ships without that.
  Armoury room, order queues, time skips, boosts, Hands and Tents are never sold. (2026-10-06)
- **Supporter packs:** one tier at launch. Two more tiers and the soundtrack only once 30 or more store looks exist and
  the music ships. A supporter mark shown in the Tavern changes room presence and needs online sign-off. (2026-10-06)
- **Lantern Caches:** the gacha feeling comes only from caches earned in play (boss wins, Contracts with a Dare, first
  clears, Codex milestones). Odds are printed on the cache from the same table the code rolls; a visible pity counter;
  no duplicate looks; no crafting materials. Caches and keys are never sold, and nothing bought is random. (2026-10-06)
- **Where to sell:** Steam first, as a single-player build (the online layer runs only on the claude.ai page), after a
  landscape mouse-and-keyboard playtest of parry and dodge timing passes. Phones second. No itch or Ko-fi pack.
  (2026-10-06)
- **When:** no store code is switched on before the early-game milestone is called done. Then Cal is asked once, with a
  one-page checklist (business, merchant of record, privacy, terms, refunds, age rating). All store code sits behind
  one switch that ships off; the Keeper's away bonus has its own setting, default 0 hours. (2026-10-06)
- **Prediction:** at least 75% of Steam reviews that mention money are positive in the first 90 days after the store
  opens, tagged the way the plan tagged IdleOn's (IdleOn: 53 of 86, about 62%). Missed below 65%; a miss reopens the
  Keeper's away bonus and the supporter tiers first. (2026-10-06)

### Mid-zone wall: judge rulings (2026-10-07)

- **Captains at zones 25 to 34 are fixed at the boss, with the boss knots only.** The kept-up hero's Attack and health sit
  at 0.2-0.4 of the reference hero from zone 25 (1.0 at zone 20), so `boss.hpX` and `boss.hitX` now fall to 1.0/0.55 at 25,
  0.52/0.34 at 27, 1.55/0.72 at 30 and 0.94/0.52 at 34. Wren and Pip win 56-80% casual and 100% played well. Zones 21-24 ramp linearly from zone 20 to the zone 25 knot (the hero falls behind the reference over those zones); there is no budget row there. Normal foes,
  elites, zone 20 and zones 35+ keep their numbers. The `refAtk` table stays: changing it would speed every normal fight
  and the gold per hour. (2026-10-07)
- **The zone 27 knot** was the mid fixture's hero (Attack 1.15M, Lv 34) against a foe curve that grows x1.48 a zone to 27
  and x1.22 after, with the Quarry Golem's armour. The late fixture's hero at the same zone hits 1.8x harder. The knots are
  fitted to the weaker hero, so a stronger one wins more. (2026-10-07)
- **Tobin's late boss share drops to 0.2** (was 0.6) so his Captain fights run 1.0-1.25x as long as Wren's and Pip's. He
  still wins every Captain casually: a +10 gap owned by `boss-tiers` until 2026-11-15.
- **Open: Tobin stalls at zone 20, not 25 to 34.** In the good-persona sim (seeds 41, 42) he sits 10-12 h at zone 20 and
  never reaches 21, the same on the base build. Wipes come at zones 17 to 20, in the fights before the Captain. The
  level-gap acceptance (zones 20-30) cannot be tested until that is fixed; follow-up card `tobin-z17-20-stall`.

### The Lantern Rules

Every card that adds a price, a currency, a timer or a gate passes all ten. (2026-10-06)

1. Never sell power or chance. Time may be sold only up to a ceiling every player reaches in play, and must also be
   earnable in play.
2. Never sell anything random. Random rewards come only from play.
3. Never take back: nothing free becomes paid, nothing earned is locked, nothing bought expires or lapses.
4. Never build friction to sell its removal: no energy, no starved bag, no timer added so a purchase can skip it.
5. Never interrupt: the shop lives in one place; no pop-ups, no offer on opening the game, no sale dots.
6. Never sell a core convenience: Repeat, auto-salvage, sorting, Assist timing and every accessibility option stay free.
7. Earned prestige stays earned.
8. Show real prices; no bundles priced to strand a leftover.
9. Same game on every paid build: a purchase shows on every build that sells, and no paying platform gets an item late.
10. Purchases are never lost, and the game never needs an account: purchases live with the platform (or an optional
    account on the web), never only in the save.

## Screen and menus

- **Game-first layout:** the game is the main view; each tab opens a full-screen menu over it. (2026-09-27)
  Landscape only on mobile: see `CLAUDE.md` and `docs/design/layout.md`.
- **Fight view order:** header; everything not combat (Next Up, switches, zone arrows); the stage; the action bar; the
  tabs. The action bar is two rows of square slots: abilities on top, Parry, Dodge and Attack below, Attack
  bottom-right. (2026-09-29)
- **Hints stay docked** and never jitter. The game pauses while a tutorial step is open. The early game must not be
  spammed with notifications. Skill levels sit above the resource lists. (2026-09-28 to 2026-09-29)
- **One new thing a minute:** in the first hour at most one tab, view, bar or strip opens per 60 s of play
  (`ONBOARD_TUNE.gap`), the first ready one in `FEATURES` order; one the player's own act or a drop opened (walking to
  gather, the fire, the Workbench, the Tavern, the first star, the first unique) opens at once. Every unlock rule is
  unchanged. Claude decided (story-unlock-gates, red team and Opus judge, 2026-10-06; `docs/design/unlock-pace.md`).
- **Fonts:** Handjet (pixel display) with Barlow Semi Condensed (body). (2026-09-28)
- **Icons:** the approved C26 icon packs (resources, gear, actions, menus, statuses). (2026-10-01)

## Story

- **There is a reason to fight:** the dark exists to destroy light and the Voice wants the land wholly dark. The hero
  is the child Elowen's spark was lit for. (2026-09-28)
- **Season 1 ends with the first fight against the Voice:** the hero wins, the Voice retreats, and a reveal sets up
  Season 2. (2026-09-28)
- **The current story lines feel meaningless in context:** story C28 answers this (proposal). (2026-10-01)
- **Owner-chosen names are never replaced** by a naming pass. (2026-09-28)
- **The story bible is canon:** `docs/design/story-bible.md` replaces `lore.md` and the C28 spine; story work passes the
  `docs/review/story.md` depth bar. (Claude, for Cal's story request, 2026-10-05)

### Story: Claude decided (story judge, 2026-10-05; Cal can veto any line)

- **The opening is three pictures, then "Who are you?", then Hesketh's fire (intro-and-picker, story judge, 2026-10-06).** Delivery
  change to bible 8.1; the words stay. The region card's three lines show over two stills (line 1 over the lamp on its hook,
  lines 2 and 3 over the dark coming up through the moss), one line a tap, before the hero picker. Hesketh's roadside fire
  (3 lines, was 4, ending "Wood first. Then we talk.") plays after the pick over a third still, the road at night. His talk (the four lines, after a one-line card, "Every road needs a place to come back to.") moves from the Hollow's
  door to the moment the player lights their own camp fire (8 Pine Log), which pays off "Wood first. Then we talk."
  The fire's first line now says "a ring of cold ash" so the roadside fire is not the camp fire. The picker speaks in second
  person (bible 4.1: you are the one you pick) and `BIOS.tobin` no longer says "your spare sword". Stills 2 and 3 are not in
  bible 10.3's seven; until the first-hour-art pack is vetted they show the approved Mossy Hollow night background, darkened,
  with the lamp icon, which 10.3 allows. Drawing them makes the pack nine stills: Cal's call.

- **Elders 2 and 3 are the dark wearing a man's shape.** The Fogbound is the sea-fog in Silas Penrow's shape; the Pyre
  Knight is the held fire in Ser Durand's. Both men are found alive. "Never tied to lanterns or lamps" is read as: no Elder
  is or fights with a lamp, lens or lantern, and beating one never lights a lantern; the hero does that.
- **Shadowborn emerge whole, in a copied shape** (bible rule 4), never a corrupted real thing; a line claims a likeness only
  where the sprite shows it.
- **Story names for three roster proposals:** the Mile Judge (Mile-Crowned Adjudicator), the Cinderveil (Sable Vesper),
  Sable of the Mere (Sable, the Deep Listener).
- **The Voice's two phase-change cards** are the one exception to "nothing during a fight": between turns, at the roster's
  move-end queue, never changing fight state, always with Skip.
- **A hero can't be unlocked before their first story scene;** heroes a save owns are kept. The gate opens from the zone
  where the scene can have played (a scene on a Champion's post: once that Champion falls), from `STORY_MEET`, which a
  check holds equal to the chapter script, and it holds whether or not the scene's encounter is built yet. The camp's All
  heroes sheet says when (the zone in your chapter, else the chapter number); a won hero token is a bell line. Claude
  decided (story-unlock-gates, red team and Opus judge, 2026-10-06; `docs/design/unlock-pace.md`).
- **Ada and Pell come home when the Fenmother is beaten,** not after the Coast's Great Lantern.
- **Story choices are saved as new keys under `story`** (`starter`, `litFor`, `coldhearth`) with defaults; no save-key
  bump; Opus save review before merge.
- **Chapter 1 delivery readings** (story-hollow-script, 2026-10-06): C28's per-area budget counts beats (area title, zone
  and Captain lines, Champion pre and post, each NPC scene: at most 15, at most 2 NPC scenes, at most 2 pauses), so every
  Chapter 1 person speaks on a Champion's or the Fenmother's post. A Captain line waits for the Captain itself on screen
  (`ZONE_FOES[z].captain`). A story card nobody touches for 45 s files itself to the Journal to catch up on, and counts
  no skip; a choice in it (the Great Lantern) takes no default and waits in its Journal entry until the player makes it. The Chained Star sinks rather than goes out (bible 11.2 over 8.1's sample). At one stop, the area's people
  talk first and the caption (area title and zone line) plays last, just before the fight; the scenes of one stop play
  back to back, even while the guide holds the game.

## Art

- **Art direction B1** (16-bit, bold outline) for the code-drawn kit, plus more lanterns and lamps on the maps.
  (2026-09-27) New art matches the three heroes and follows the art freeze in `CLAUDE.md`. (2026-09-30)
- **Hero art:** GPT or Codex draws each key pose as one full sprite. Heroes are less chibi than the reference packs.
  Heights may differ (Pip about 86 px) but are drawn natively. Keep the design brief light. Heroes have a ready idle
  for fights and a relaxed idle for camp and menus. (2026-09-29)
- **Wren** keeps her violet, magenta and gold palette, with a bat-eared hood and a bat-wing cloak. (2026-09-29,
  2026-09-30) **Pip's code fire** is approved. (2026-09-29)
- **Third-party asset packs are reference only.** No pixels copied; they stay out of the repo. (2026-09-29)
- **Equipment art:** equipped gear shows on the hero; each hero's approved art becomes their first outfit (a look only);
  heroes start dressed in a grade 0 starter set. (2026-10-01; `docs/design/equipment-art.md`)
- **Backgrounds:** the painted Mossy Hollow night background is approved and in the game. (2026-10-02)
- **Map:** a hybrid (A's map, C's night, light and landmarks): "light in the dark". (2026-09-28; not built)
- **Who vets art (2026-10-06):** the Opus art judge under the Autopilot gates, after a red team, using the art
  freeze's own standard (whole packs, every piece matching, no stopgaps, no code-drawn art). Cal may veto from the
  digest. Character art ships on, with a "Classic art" switch for one release. Icons must fit the live meaning, not the
  name. Only Codex makes art; Claude vets it and answers for anything broken or ugly in a Monday build; anything
  doubtful stays out. (Cal 2026-10-05 gates; 2026-10-06 18:30, 18:41 and 19:35: "Art should only be made by Codex.
  ... If it gets into a Monday build and it's broken or looks bad, you will be held responsible".)
- **Codex art packs, judge verdicts (2026-10-06, art-pack-triage):** ability icons: wire 36 of Codex's drafts for the
  live 42 abilities (keep the C26 Echo Shot and Fireball; Shield Bash moves to Codex's red-gold one), a hero's icons go
  in only when all 14 are whole, so Pip first; Power Shot, Barbed Arrow, Pinning Shot and Shield Throw go back to Codex
  (due Fri 2026-10-09). Resource nodes (c26): re-brief, Codex finishes the scene pack (four gather backgrounds) before
  they go in. Starting equipment (c27): shelved until heroes can show gear. Hunting drafts (c24): superseded by the live
  interim. Enemies (c22): already in. Hero concept boards: re-brief as a matched portrait pack. Reasons and red team:
  `/mnt/project-files/autopilot/reports/art-pack-triage.md`. (built: not yet; cards `wire-ability-icons` and others)
  Coverage areas: 6 Combat feel and 1 First 10 minutes (icons), 10 Skills and crafting (nodes), 14 Heroes (portraits).
  Prediction: lettered ability tiles across the three heroes fall from 39 of 42 to 26 when `wire-ability-icons` merges
  (Pip 13 to 0) and to 0 of 42 in the 2026-10-19 build; measured by counting lettered tiles (`.ab-list .ab-mono`)
  on each hero's Hero > Abilities screen in `wire-ability-icons`' proof route (an `expect` line CI replays); missed if
  any tile stays lettered for a hero whose icons are wired, or if Cal's note "ability icons missing" is not "fixed" in
  that week's Sunday review. Switch off: removing a hero's ids from the generated `act` icon
  pack brings back the lettered tiles (the existing `noIcon` path); gather scenes go back to the code-drawn ones by
  reverting their wiring commit; portraits have the Classic art switch. Saves: unaffected (art only; the Classic art
  switch adds one settings flag with a default).

## Early game (Opus judge on the early-game plan, 2026-10-06; Cal can veto any line)

Plan and rulings: `/mnt/project-files/early-game/plan.md`, `plan-judge.md`. Beat map: `docs/design/first-hour.md`.

- **No telegraph stands.** There are no foe intent icons. The Foe tab shows only what you have learned: moves after a
  kill, weakness at 5 kills, "Watch for" at 15.
- **The PR #53 dock cuts are final.** The combat log is dropped: on a 360 px screen it is clutter, and the turn strip and
  numbers carry the same information. "Next" chips stay dropped. The Bag tab belongs to `bag-slot-and-steady-charges`.
- **Lantern Caches.** A zone boss's first clear opens a Lantern Cache that reveals that win's drops. Its only new reward
  is a look roll, with its odds and a pity counter printed. Replays give no cache. Caches, keys and pity are never sold.
  Caches hold no relics and no time skips. This narrows the Money line's "boss wins" to a boss's first clear. Its other
  sources (Contracts with a Dare, Codex milestones) stay, each added later by its own card through the economy gate.
- **Looks.** Deed looks stay Deed-only. Cache looks are their own catalogue, drawn by Codex and vetted as a set. The
  first-clear caches of zones 1 to 3 and 7 to 9 each give a Deepwell lantern colour the save does not own yet (Ember Red
  first), print it as a certain look, and relight the stage. This is the cache's look, not an extra reward; a save that
  owns all six gets none. The Wardrobe tags each look Deed, Cache or (later) Store, and counts earned looks only.
- **Moments.** Big moments (the first boss win, a Champion's first clear with its post scene in the card and the join
  when an unpicked starter is met there, a cache with a look or unique, a unique, a new hero, the first Star, a Great
  Lantern) and medium moments (the first and every 5th level, a new ability, a look, a Rare-or-better craft) sit
  outside the pop budget, under their own cap. Big: one card at a time at fight end, holding the game. Medium: at most
  one per fight end, in the notices slot. At most 8 big plus medium in the first 20 minutes. This refines "the early
  game must not be spammed". A cache that holds a look is a big card, even when it opens automatically. `STORY_TUNE.champMoment = false` (card `champion-moment`)
  switches the Champion card off: the post scene plays as a story card and the cache opens on its own, as before.
- **Starters join on the road.** You start with the hero you picked. The other two join where the story puts them: Tobin
  at the zone 5 Champion (the cellars), Wren at the zone 10 Champion (the Cantor's cave), Pip at the zone 15 Champion
  (the Marshal's graves), per story bible 4.4. Each join is a scene, never a bare toast. Old saves keep every starter
  they own (an all-met default). `STORY_TUNE.joinOnMeet = false` switches back to all three at the start. A join counts as a new thing for the
  spacing governor, so the next queued unlock (the Codex at zone 10) waits at least 1:30. Coverage
  areas 1, 4, 14 and 15.
- **F3, the big-moment pace** (amends the self-improving plan's scorecard). Minutes 0 to 20: a big moment at least every
  5 minutes, no gap over 8. From minute 20 to the zone 10 Champion (or minute 60, if that comes first): a big moment at
  every zone's first clear from 5 to 10, no gap over 8 on the casual walk. The 2026-11-02 review sets the pace after
  zone 10. Why: big moments are tied to bosses, so their minutes follow play speed, and zone 10 closes the first hour.
  Prediction: the nightly walk shows no gap over 8 minutes between big moments up to the zone 10 Champion, for every
  starter pick; missed if any seed shows one. Coverage areas 2 and 3. No save change; the colour grants switch off
  with `CACHE_TUNE.on` (card `cache-core`).
- **The guide is Old Hesketh, with a face.** Landscape: the side column's notices slot. Portrait: docked above the
  action bar. Never over the fighters or the HP bars.
- **Bounties.** A finished bounty can be claimed from Next Up and from its ready notice, and the board also shows at
  Camp. An open menu never pauses foe turns.
- **The opening.** Three stills, then "Who are you?", then Hesketh's fire. His talk plays when the camp fire is lit. The
  first fight comes within 45 s for a player who taps through. Hero lines are for starters only, from `STORY_BEATS.hero`
  (story bible 4.4).
- **First-hour art.** Two packs, `first-hour-art` and `cache-art`. Star icons are parked. Approved assets (the Mossy
  Hollow background, roster portraits, Deepwell colours) may be reused as they are.
- **Hit feel (card hit-feel, Opus judge 2026-10-06).** Number tiers by priority counter, crit, big (a hit of a fifth of the
  foe's HP, the hit-stop's own test), normal; each has its size and sting. A *clean* parry or dodge is one pressed in the
  last `min(half the window, 0.10 s)` before the hit; it stamps PARRIED! or DODGED! in gold. Never "Perfect" on a defence:
  that word means a real bonus on timed abilities. Five lamps count clean defences in a row and go out on a landed hit, a
  failed press or a loose defence. All of it is display only: no window, hit-stop, pace or save change, and no telegraph
  of the foe's next move.

## Working process

- **Claude builds, Codex reviews.** Claude does the majority of the work. Codex is a third-party reviewer that is
  free to slate Claude's work where it needs to; it reviews from PR #1
  (`docs/handoff/claude-to-codex/reviewer/README.md`). Codex still draws new raster art when a card needs it.
  (2026-10-05)
- **Autopilot:** Claude plans, builds and merges into the integration branch on its own from an approved backlog,
  with a daily digest. Cal approves batches, taps gated items (new systems, economy targets, saves,
  story canon; art packs moved to the judge 2026-10-06) and says "ship it" before anything reaches `main` or the live artifact. (2026-10-05)
- **Speed and smoothness are checked constantly:** run `node tools/perf.mjs --quick` after each merge wave and fix any
  budget failure before new features. (2026-09-27)
- **Pace:** steady on weekdays (2 build threads at once), full at weekends (4). On "pause", launch nothing new.
  (2026-09-28, 2026-10-05)
- **Model routing:** set per thread by work type: Haiku runs and gathers, Sonnet makes, Opus decides and signs off.
  The table lives in the project instructions. (2026-10-05)
- **Deploys:** one Netlify deploy a week, at 00:00 UK time on Monday, only if something merged that week and the
  build is green. Netlify still builds only commits with "[deploy]" in the message. (2026-09-28, 2026-10-05)
- **Preview:** after each merge wave the owner gets a private preview artifact with its own save key. Preview builds
  never go to the live artifact. (2026-09-27)

## Replaced decisions

Kept only to explain current rules. Each line: the old decision, then what replaced it.

- Hero gates at the first zone of the scene's area, only once the scene is in the game (2026-10-06, story-opening) -> from the
  zone the scene can have played, built or not (2026-10-06, story-unlock-gates).
- Hesketh's talk plays before the first fight (story bible 8.1, audit A1) -> the talk plays when the camp fire is lit;
  the first fight comes within 45 s (early game, 2026-10-06).
- Store launch possible, monetisation undecided (2026-09-27); monetisation waits for launch, with a free and paid battle
  pass, a membership with capped convenience perks and skins (2026-09-28); every cosmetic is earned, never sold
  (2026-09-28) -> the money model (2026-10-06).
- Training: gold levels up each hero's Attack, Parry, Dodge and abilities, with caps (2026-09-29, 2026-10-02) -> no
  Training; level, star points, abilities and attribute points (2026-10-06).
- No rapid catch-up XP for heroes (2026-09-28) -> a new hero joins at the road's level; benched heroes earn half XP
  (2026-10-06).
- Netlify deploys up to four times a day (2026-09-28) -> one deploy a week, Monday 00:00 UK (2026-10-05).
- Two agents, with Codex owning the feature track (2026-09-30) -> Claude builds, Codex reviews (2026-10-05).
- Steady mode of 3 agents per 5-hour window; opus/sonnet/haiku routing by difficulty (2026-09-28) -> pace by weekday
  and weekend, routing by work type (2026-10-05).
- Idle fighting, an Auto toggle with auto parry and dodge odds, offline combat at Auto's rate (2026-09-29, 2026-09-30)
  -> combat is active only (2026-10-01).
- The party: companions, rarity power, packs of 3, formation, roles, the hero as one of three, Lanternbearer naming
  (2026-09-27, 2026-09-28) -> the solo hero (2026-09-29).
- Bigger packs (up to 10 foes, sizes by pack) and parryable heavy hits only from bosses and elites (2026-09-28,
  2026-09-29) -> one enemy at a time and every hit parryable or dodgeable (2026-10-01).
- Lane combat (2026-09-29) -> scrapped the same day.
- About 10 abilities a hero, unlocked with boss items at Elowen's chapel; the star map as each hero's upgrade tree
  (2026-09-29) -> 14 abilities (2026-10-01), Scrolls and talents (2026-10-02).
- Haste checks who goes first, then turns alternate; Haste bought with gold; a versus card (2026-09-30) -> Speed sets
  turn frequency (2026-10-01) and a versus header (2026-10-01).
- The boss Enrage timer (2026-09-28) -> no timer and no Enrage (2026-10-01).
- The Stars as a per-class star map of small stat stars and keystones -> rule-changing stars like E33's Pictos
  (2026-10-02).
- The auto-Finisher at 50% and swarms with 1.25x HP (2026-09-28) -> active only, one enemy per fight (2026-10-01).
- Awakenings (2026-09-28) -> Hallowed (2026-09-29).
- Bench gathering jobs (2026-09-27) -> Hands (2026-09-28).
- Hide and Essence fight-only, no Hunting node (2026-09-27) -> Hide only from Hunting; enemies drop no materials
  (2026-10-01). Essence stays fight-only.
- Gatherer daily wages, then the Bunkhouse as the bed cap (2026-09-28) -> one-off hire, shift fees, Tents (2026-09-28).
- Expeditions with heroes and trade caravans (2026-09-28) -> trade runs by gatherers (2026-09-29).
- The MAT1 name ladder (2026-09-28) -> the C26 ladder (2026-10-01); ore keeps MAT1's names.
- No forced landscape (2026-09-27) -> landscape only on mobile (2026-09-29).
- Season 1 ending at the bottom of the Deepwell (2026-09-28) -> the finale is in the Gloamvale, its Region 5, and the
  Voice retreats into the Deepwell (2026-09-28, after the owner's feedback on LORE-R45).
- Background art paused (2026-09-29) -> the Mossy Hollow background approved (2026-10-02).
- Art freeze signer: "No art goes into the game until the owner has vetted the whole pack ... The owner still vets the
  whole set before it ships" (2026-09-30), and art packs as a Cal-tapped Autopilot gate (2026-10-05) -> the Opus art
  judge vets under the Autopilot gates, same standard (2026-10-06, Cal 19:35). Why: Cal's 2026-10-05 gates already put art packs
  with the judge but `CLAUDE.md` was never aligned, and Codex packs (426 icons, 25 nodes) sat unwired for days waiting
  on a sign-off nobody owned; Cal 2026-10-06 18:30 "I don't want to be involved" and 18:41 any repo rule may change if
  it serves the goals.
- Weekday and weekend usage rules (2026-09-28) -> steady mode (2026-09-28 evening).

## Foe moves by type: judge rulings (2026-10-07)

Each Hollow foe type has its own moves (`TURN_FOE_TYPES`, `docs/design/foe-moves.md`); elites swap the Crushing Blow for a
type signature and keep the type's pace; every foe type names an answer for each starter (`FOE_COUNTERS`). Elite scaling is
`eliteHitX` 1.4 and `eliteHpX` 2.5 (the Cave Bat's elite has 0.4 of that HP). Zone 15 and 20 elites remain easy for casual
Wren and Pip: that is zone 5-15 hero power, owned by boss-tiers. No save state changes.
