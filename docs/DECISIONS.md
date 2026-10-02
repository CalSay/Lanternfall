# Owner decisions

Every standing owner decision, by topic, with its date. A later decision wins over an earlier one. The last section
lists decisions that a later owner decision replaced, so the history behind a rule stays readable. Rules that live in
`CLAUDE.md` (save wipes, landscape, art freeze, online data) are not repeated here.

Older design specs were retired on 2026-10-02. Read any of them with `git show 1536ffa:docs/design/<file>.md`.

## The game

- **No prestige or resets.** Progress is permanent. Freshness comes from mastery, collections, build variety and new
  regions. (2026-09-27)
- **Single-player first.** The world raid and Tavern stay optional, light extras. (2026-09-27)
- **Store launch possible, monetisation undecided.** Original art only, no restrictive third-party assets, nothing
  pay-to-win. (2026-09-27)
- **Owner role: player.** The coordinator drives the roadmap and brings playable builds and decisions at milestones.
  Decisions that belong to the owner (art direction, monetisation, anything irreversible) are asked, not guessed.
  (2026-09-27)
- **Combat is active only.** No Auto, no idle fighting, no away combat earnings. Gathering stays idle. (2026-10-01)
- **Version 1.0 is a complete Season 1:** five regions, the story to the first fight with the Voice, 32 heroes, two
  named gatherers per resource job. The story continues in Season 2. (2026-09-28)
- **1.0 also includes:** a polished first hour, save safety (export and import at least), an in-game guide and
  glossary, accessibility (colour-blind-safe damage types, text size, volume mixer), sound and music, hero quests,
  fishing and the Kitchen, challenge modes, and a shareable camp card. Guilds and bigger social features come after
  launch. (2026-09-28)
- **Length:** depends on how fun and replayable the loop is; players must stay committed. (2026-09-28)
- **After 1.0:** the Lantern Festival, titles visible to other players, a second evolution tier. (2026-09-28)
- **Art commissions and monetisation wait** until the game is ready for launch. Monetisation direction for later: a
  free and paid battle pass, a membership with capped convenience perks, skins; never exclusive power, nothing taken
  back when it lapses. (2026-09-28)
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
- **Training:** gold levels up each hero's Attack, Parry, Dodge and abilities, with level caps. It replaced the gold
  upgrades. (2026-09-29)
- **Classes:** three base classes by armour weight: Warrior (heavy), Ranger (medium), Mage (light). Evolutions: Warrior
  to Reaver (damage) or Warden (utility); Ranger to Venomstalker or Trapper; Mage to Warlock or Priest. Each evolution
  must feel special and clearly stronger. The Warlock's title is the Shadowbinder. (2026-09-28) The support class is
  the Lightkeeper, not the Chaplain. (2026-09-27)
- **The evolution choice is permanent,** with a costly respec, and one free switch within 10 minutes of choosing.
  (2026-09-28)
- **Playing a tank or support must not be weaker** than a damage class. (2026-09-28)
- **No rapid catch-up XP** for heroes: levelling a new hero is an investment. (2026-09-28)
- **Region 2 expects a trained-up, stronger hero,** with a hint when the hero hits its limit. (2026-09-28)
- **Hero fatigue:** yes, but rotating heroes must never slow progression. (2026-09-28)
- **Tactics:** yes ("tower defense vibes"), once combat is substantial. (2026-09-28)

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

- **Really hard achievements with cool rewards:** titles and accessories drawn on the hero. Every cosmetic is earned,
  never sold, and never gives power. (2026-09-28)
- **The top tier is Everflame** (Bronze, Silver, Gold, Everflame). **Titles are short epithets** a person would be
  known by: one or two words, at most 14 characters. (2026-09-28)
- **Online titles:** yes, but not for 1.0. (2026-09-28)

## Screen and menus

- **Game-first layout:** the game is the main view; each tab opens a full-screen menu over it. (2026-09-27)
  Landscape only on mobile: see `CLAUDE.md` and `docs/design/layout.md`.
- **Fight view order:** header; everything not combat (Next Up, switches, zone arrows); the stage; the action bar; the
  tabs. The action bar is two rows of square slots: abilities on top, Parry, Dodge and Attack below, Attack
  bottom-right. (2026-09-29)
- **Hints stay docked** and never jitter. The game pauses while a tutorial step is open. The early game must not be
  spammed with notifications. Skill levels sit above the resource lists. (2026-09-28 to 2026-09-29)
- **Fonts:** Handjet (pixel display) with Barlow Semi Condensed (body). (2026-09-28)
- **Icons:** the approved C26 icon packs (resources, gear, actions, menus, statuses). (2026-10-01)

## Story

- **There is a reason to fight:** the dark exists to destroy light and the Voice wants the land wholly dark. The hero
  is the child Elowen's spark was lit for. (2026-09-28)
- **Season 1 ends with the first fight against the Voice:** the hero wins, the Voice retreats, and a reveal sets up
  Season 2. (2026-09-28)
- **The current story lines feel meaningless in context:** story C28 answers this (proposal). (2026-10-01)
- **Owner-chosen names are never replaced** by a naming pass. (2026-09-28)

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

## Working process

- **Two agents:** Claude leads and integrates; Codex works in its own worktree. The feature track (abilities, combat,
  Ascension, the chapel) moved to Codex on 2026-09-30. (2026-09-30; `docs/coord/two-agent-split.md`)
- **Speed and smoothness are checked constantly:** run `node tools/perf.mjs --quick` after each merge wave and fix any
  budget failure before new features. (2026-09-27)
- **Steady mode:** at most 3 agents at once across each 5-hour window. On "pause", launch nothing new. (2026-09-28)
- **Model routing:** opus for hard cross-system and balance work; sonnet for well-specified builds, UI, writing and
  art from an approved guide; haiku for small mechanical jobs. (2026-09-28)
- **Deploys:** Netlify deploys only commits with "[deploy]" in the message, at most four times a day. (2026-09-28)
- **Preview:** after each merge wave the owner gets a private preview artifact with its own save key. Preview builds
  never go to the live artifact. (2026-09-27)

## Replaced decisions

Kept only to explain current rules. Each line: the old decision, then what replaced it.

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
- Weekday and weekend usage rules (2026-09-28) -> steady mode (2026-09-28 evening).
