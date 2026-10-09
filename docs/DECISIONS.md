# Owner decisions

Every standing owner decision, by topic, with its date. A later decision wins over an earlier one. The last section
lists decisions that a later owner decision replaced, so the history behind a rule stays readable. Rules that live in
`CLAUDE.md` (save wipes, browser first, art freeze, online data) are not repeated here.

Older design specs were retired on 2026-10-02. Read any of them with `git show 1536ffa:docs/design/<file>.md`.

## The game

- **Claude decided: the first fight is a staged lesson, and the roadside fire's last line leads into it (card cal-0107-staged-guide,
  2026-10-07; Cal can veto).** Cal's play note 3: "You need to have the game pause so it can explain dodging and parrying before you're
  just dropped in it." One verb a fight left the first foe hitting you with nothing taught, so the verbs moved into fight 1: each is taught
  the first time it comes up, with the fight held (Attack on your first turn, Dodge on the foe's first swing, the ability on your next
  turn, Parry on the next swing or the next foe's first). The hold is decided every frame in core: the foe's clock stops as the Dodge or
  Parry window opens, so the press always lands; key presses still pass, and while a lesson holds only the button it names works. After the lessons nothing speaks in a fight: other tips and
  Hesketh's unlock lines wait for the gap between fights, and an unlock line holds the game with a Got it. Cal's note 2 ("'Wood first'
  and then we're fighting? Makes no sense"): the fire's last line is now "Something's coming up the road. Keep that lamp behind you.",
  and his ask for wood moves to when Gather opens. Also: the Hero tab opens at level 2 (the first points), announced once by the upgrade
  step; the first Scroll and a second ability's slot get his lines; empty slots are silent until a move waits for one (note 4); lighting
  the fire keeps you at the grove for his talk (note 10). Cost: with Hero first in the unlock queue, Gather opens sooner (warm walk
  1:40, was 5:11) and Next Up later (5:19, was 0:11); the warm check's Next Up bound moves from 2:00 to the cold walk's 6:00.
  Nothing saved (marks already exist).
- **Claude decided: the guide teaches in Hesketh's voice (card guide-voice, 2026-10-07; Cal can veto).** Every guide
  step names the phases it may start in (your turn, a wind-up, the foe's turn, between fights); a step in the wrong phase waits.
  Camp and menu tips start in a break and then stay up (cal-0107-staged-guide: hidden while a foe is on the field, back in the gap).
  The fight's verbs are the staged lesson above. Hero tab and Next Up notes wait a minute after the last guide line.
  A tip nobody answers for 60 s of play retires: `onboard.done[id]` becomes 2 (it was always 1; every reader treats it as truthy),
  and the Journal's Tips lists it as "Tips you missed". Opus judge and a Sonnet red team: the turn-fight boss line says "Watch the
  bar" because only the legacy fight draws red rings; "stretch" and "strings" cut as jargon; the legacy Parry line no longer claims a
  stagger it cannot show. Save risk read (Opus): safe, no new field. Camp and gather tips stay plain until `unlock-voice`.
- **Claude decided: materials lines show on Camp, on Gather and while gathering, never over other menus (card forge-tip-goes-stale,
  2026-10-08; Cal can veto with "keep the Forge tip on every menu").** This narrows "camp and menu tips stay up" above for Hesketh's
  materials lines only ("You still need these for the Forge: ..."): a fighter saw one on every menu for 15 minutes and it covered the hero
  list. The step stays current while hidden, so nothing behind it starts and nothing is marked done. A line for two or more materials names
  each one's place ("Copper Ore 0/25 at the Copper Vein"; essence and gold "from fights"). A press step (Workbench, tool, first weapon,
  Forge, Storehouse) now waits for its materials in hand, so × on a materials line no longer brings up "Open Camp." while you are short.
  Missed prediction: "the walk builds the Forge no later" held on seed 2 (5:02, now 5:06) but not seed 1 (6:35, now 14:17). The line
  no longer sends the line-following bot back from Craft to gather, and Next Up's tool upgrades spent the Forge's copper meanwhile (22/25 ore
  at 6:27, 2/25 at 12:30). An Opus judge ruled ship anyway: Craft is where the complaint was, and the fix is Next Up guarding the Forge's
  materials (the camp-build goal), a card of its own.
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
  Decisions that belong to the owner (anything that takes real money: store accounts, payment code, live prices,
  business and legal set-up; anything irreversible) are asked, not guessed. Money design and art direction are
  Claude's judge calls, within the Lantern Rules. (2026-09-27, narrowed 2026-10-06, 2026-10-07)
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
- **Spare Scrolls are explained, not removed (scroll-spares, Opus judge 2026-10-08; Cal can veto with
  "Veto spare-Moss copy: change the drops instead (b)").** Zones 1-4 keep their sure Moss drops (4, of which a full game uses 3: one Tier I
  move per starter, and joining starters arrive without it). The Can-learn list says truthfully why nothing is learnable, the drawer says
  Moss teaches one move per hero, "Scroll found." toasts only when the hero in play can use it, and a full-slot learn detail says "Swap it
  in for:". No drop, trade or save change.

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
- **After a boss loss, the chance decides** (planner on #213, 2026-10-08; Cal can veto with "retry after every level"). The Try
  again card and Next Up say the chance to win (`bossOdds`). Under `BOSS_ODDS.close` the card's big button is Keep fighting here,
  and auto-challenge waits for that chance, not for 15% more damage; a weak held boss no longer comes back after a return from
  away. Turn fights off and replayed bosses keep the old rule. Builder's addition: a weak chance keeps its own Next Up row
  (its bar sits near 0), unless the craft goal holds that row for a tier gate.
- **Fight feel:** a pause between turns with a whose-turn banner, a bigger labelled timing bar, hit-stop and shake on
  big hits, damage numbers that say their source, ability numbers shown only outside a fight. (2026-10-02)
- **The banner pause is shown, not buffered (fight-input-during-banner, planner 2026-10-08; Cal can veto
  with "queue presses during the banner").** While the turn banner or VS card plays, Attack and ability tiles dim and say "Wait"; a press
  is refused with a visible answer that reduced motion keeps. Presses are not queued; Parry and Dodge are never queued.
- **Versus header:** fighting-game HP bars across the top, hero left, foe right. (2026-10-01)
- **A zone foe resets after every attack** (hop in, attack, hop home, rest), so approved animations play in full.
  (2026-10-02)
- **No telegraph of the foe's next move:** it makes combat easier. (2026-10-02)
- **Foe tricks say so when they land, never before (foe-tricks-say-so, Opus judge 2026-10-08; Cal can veto with "warn before
  foe tricks").** A word for Chill and its second turn, Venom, Weaken, the get-up, resist, armour and Frozen, and the Foe tab
  learns a trick the first time it lands. No telegraph stands.
- **No suggested builds or combos in the game.** Finding what works should be hard and rewarding. (2026-10-02)
- **Every zone fight starts at full HP:** normal, elite and boss, win or lose; no Rest button and no regen between fights. The Deepwell and the Provings still carry HP from foe to foe (a kill heals 15%, times the Healing gear line). (judge, normal-death-says-so, 2026-10-08; replaces "No healing between fights" (2026-10-02), which the code never matched: each kill healed 15% and a loss gave full HP, so losing was the better heal. Cal can veto with "carry HP between fights again", which sets `TURN_TUNE.normalFull = 0`.)
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
  Hollow scenery. (2026-10-01 to 2026-10-02) Amended 2026-10-07: zones 6 and 7 move to the Batwing Caves painting once it
  is wired; until then they keep the Mossy Hollow painting ("Scenery for zones 6 to 10" below).
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

- **Uniques are rarer, boss drops themed to the boss type, and their rule is the draw.** (2026-09-27, 2026-09-28) Replaced
  2026-10-07 (Cal: uniques must be exciting, powerful and rare): a unique keeps the Rare-level base (1.8x), drops at the
  zone's tier, and carries one fixed health line at the median Rare roll for its slot, so it is as strong as a crafted Rare
  (without it a unique starts 4-7 casual points behind at zone 16). Its rule changes how a build plays and has a stated cost.
  A unique never counts toward a set. Crafted sets add stats; uniques add rules. The health line is a coordinator call and
  Cal can veto it. Nothing is sold. Design and sizing: `docs/design/uniques.md` (PR 138), reviews in project files
  `codex-uniques-review/`.
- **Crafting:** random affix lines by rarity, Reforge one line at the Enchanter's Table, Trophies gate +8 to +10.
  Essence stays fight-only. (2026-09-27)
- **Grades replace the rarity die, behind a switch (craft-attribute-grades, 2026-10-09; Cal's answer 7, overhaul spec section 5):**
  with `CRAFT_TUNE.grades` on, a craft's grade (D to S) comes from the station level, its lines come in a fixed order and
  Reforge on a graded piece is a pick. The switch stays off in the weekly release until the balance pass. Items made before
  keep their rarity, lines and power. Infuse's "any Essence" drift is card craft-strike-infuse's.
- **The Strike and Infuse, behind their switches (craft-strike-infuse, 2026-10-09; overhaul spec sections 5 and 7b):** a timing
  press on the bar (the Strike) or Essence on the recipe row (Infuse) lifts a graded craft one grade, never above A; one lift a craft.
  `CRAFT_TUNE.strike` and `CRAFT_TUNE.infuse` stay off in the weekly release until the balance pass. Infuse spends the one Essence
  pile (any Essence pays; the spec's "Essence of the piece's tier" no longer fits since counters-and-layers made Essence one pile).
- **15 material tiers, 3 per region; resources are gated by region.** (2026-09-28)
- **Material names are real, standard fantasy materials,** never invented compounds. (2026-09-28) The approved 15-grade
  names for all seven families are in `art/resources/regional-audit/complete-ladder.json`. (2026-10-01)
- **Gear by class:** two materials per item, about 70/30: Warrior armour metal + leather, weapon metal + wood; Ranger
  armour leather + cloth, weapon wood + metal; Mage armour cloth + leather, weapon wood + gem. (2026-09-28)
- **The Bow is wood + metal, as decided 28 Sep (gear-in-first-25 Step 0, Opus high judge, 2026-10-08):** the bow's
  recipe changes from wood 6 + hide 2 to wood 6 + ore 2 (essence 2 unchanged), so Wren makes her first weapon from the
  Copper Vein right after her first tool, not after Hunting opens at zone 5. From tier 2 it takes Iron Ingots at the
  Forge, which gives Wren's Forge a job; hide stays her Quiver, Hood and Leathers material. Economy sim read before merge.
- **Production chains** run in the background at stations (for example ore + coal to ingots). A Tannery: yes. The
  Still is benched until after 1.0. (2026-09-28)
- **Sockets and enchanting:** gear sockets are class-specific, and every gathering skill feeds a socket family, not
  only mining. Enchanting applies buff items to gear and unlocks in Region 2. Bosses always drop their signature buff
  item. A finder perk on gatherers is about +5%, and active gathering finds more. Taking a buff item out of gear breaks
  it; salvage has a 50% loss chance (a Salvage Rune makes it 0%). (2026-09-28; not built)
- **Gold economy:** gold stops inflating (gold per foe steps up by region); gold is the camp's budget and hero power
  comes from gear, materials and XP. Gold-gain stays as a low gear line; other gold-gain sources became crit damage.
  (2026-09-28)
- **Gold buys means, not stats (gold-without-training, #180, 2026-10-07; prices provisional until the crafting
  overhaul spec, due 16 Oct):** gear upgrades +1 to +10 are gold's main sink. Each step costs 1.5x the last, the only
  material is a token of the item's main one (no essence; no Hide when there is another), +8 to +10 still take a
  Trophy, and salvage pays back half the gold an item's upgrades cost (Trophies do not come back). Opus high judge:
  ship; casual players reaching zone 14 by day 3 (was 11.7) and more essence unspent (optimiser 0.27 -> 0.44) are the
  expected result, not regressions. Cal approved accepting both in the health baseline (2026-10-07). Open asks for
  the overhaul: give essence a sink so it is not dead stock; crew and supplies take little gold (Hands 0 in the first
  10 hours, about 10% by hour 50).
- **Refining (refine-queues, 2026-10-08; numbers provisional until the one balance pass):** the Forge smelts ore and coal
  into Ingots, the Workbench saws logs into Planks, the Loom weaves fibre into Cloth and tans hide into Leather. Each
  station runs up to 3 orders in turn (a shortfall amount or All, which keeps 20% of each input), while you fight and
  while you are away. From grade 2 every craft's ore, wood, fibre and hide count becomes the middle at half, rounded up,
  and every upgrade's material converts the same way at every grade (Copper Warblade +1 = 1 Copper Ingot). On an upgrade
  only, gold may cover the material a hero is short, at 9 foes of the tier's foe gold for each raw unit (a Plank is 2), once
  its gathering tier is open and its station built; covered units give no skill XP (gold-covers-material ruling,
  2026-10-08). Crafts always take their materials. Tools, charms and trinkets stay raw. `REFINE_TUNE.on = false` puts every cost back to raw and keeps stored middles. Refining
  is never for sale (Lantern Rule 4).
  - **Names** (planner's, kept by the build): Ingot: Copper, Iron, Silver, Cobalt, Mithril Ingot. Plank: Pine, Birch,
    Oak, Mangrove, Tideash Plank. Cloth: Hemp Cloth, Linen, Briar Cloth, Kelp Cloth, Stormgrass Cloth. Leather: Bristle,
    Duskfang, Fenscale, Riptide, Kelpie Leather. Coal: Coal (one grade).
  - **The leather rule (a change from the overhaul spec):** Leather takes 2 hide and 1 log **of the same grade** (the
    spec said a log of any grade, lowest first). One grade keeps the All reserve and the order row honest.
  - **Coal is a drop until the Coal Seam (Opus high judge, coordinator sign-off 2026-10-08 00:27):** once the Forge is
    built, Copper Ore brings about 1 coal for every 2 ore the hero mines (live, away, the Glint, Spillover), with the
    fraction carried, never floored away. It stands in for Cal's chosen Coal Seam node until Codex's art is vetted; the
    Seam is deferred, not dropped (card `coal-seam-integrate`). Gatherers bring no coal until then. Cal can veto with
    "wait for the Seam".
  - **Text only (the same ruling):** coal and the four middles show their names, never a borrowed icon, an Essence orb
    or an empty image box, until the art pack `art-refined-materials` passes the art judge.

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
- **Business model: PROPOSED, not decided; the lines above stand until Cal says yes.** Opus judge on card
  `business-model-judge`, from the W3 money research: Lanternfall sells as a paid Steam game at about £5 to £8 plus one
  supporter pack of looks, with no store screen; the Lantern Keeper is folded in and never built. The public web build is
  free and ends the road at the zone 15 Champion from its first public day (the camp keeps running), on its own URL; the
  friends link keeps the full road. How much of the road stays free for good is ruled on 14 Dec from stranger data. The
  20 Nov post calls it "a free early build", never "free forever", "free full game", "free to play" or "demo". Veto
  phrase: "Stay free with looks." Ruling: project files `autopilot/rulings/2026-10-08-business-model.md`. (2026-10-08)

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

### Boss tiers, first hour: judge rulings (2026-10-07)

PR 1 of `boss-tiers` (zones 1-12). Opus judge after measuring; Cal can veto any line. Later PRs: tiers (`bossTierOf`, a Champion
stat multiplier, labels, pay), zones 13-24 for a kept-up hero, move sets by tier.

- **One missed parry never kills a full-health hero in zones 1-15.** `TURN_TUNE.boss.hitCap` 0.4: one zone-boss hit (each hit
  of a charged move on its own) takes at most 40% of the hero's max HP, capped on the boss's side before armour, Guard, Ward
  and the Stars. Off from zone 16, and off for Elders, the Deepwell, Provings, normal foes and elites. It sits in `turnLand`, so
  Boss ready and the budget see it. Switch off: `hitCap: [[1, 0]]`.
- **Why the wall.** Boss hits scale with the reference hero's HP, which grows about 1.9x a zone from zone 8 to 11; a first-hour
  hero (the zone's tier at common +0) grows 1.3-1.5x. HP against the reference: 2.2 at zone 5, 0.6 at zone 10, 0.4 at zones 11-12.
  One table made for a kept-up hero made zones 3-6 a pat on the head and zones 9-11 a wall. Speed and move order are not the cause.
- **Footing.** Zones 5-12 are gated on the first-hour set (zone tier, common +0, five pieces, early fixture, typical abilities and
  Stars). The kept-up rows at 8, 10 and 12 are report-only ("gear never makes a boss harder"), and their "too easy" gaps are gone.
  Floors (report only): nothing worn at zone 5 (casual 40%+) and zone 10 (casual 15%+, good 95%+). 10-30% casual at the first gear
  check is a wall and not acceptable.
- **Bands.** New `firstChampion` (zone 5): casual 60-85, good 97-100. Zone 10 uses `champion` (40-60). Tune the weaker of Wren and
  Pip into the band. The stronger may sit above it under `wren-first-hour-parity` gaps (until 2026-11-15); Tobin sits above under
  `tobin-safety-margin` gaps.
- **Knots** (zones up to 12 only): hitX 1.6/3.4/2.4/1.5/1.0/1.05/0.95/0.85 at zones 4/5/6/8/9/10/11/12; hpX 1.5/3.7/2.2/1.9/1.5/1.9/1.4/1.8
  at 4/5/6/8/9/10/11/12. The zone 5 and 10 peaks are interim: the Champion multiplier replaces them in PR 2.
- **Zone 11 hitX is 0.95, not the ruling's 0.8** (a Wren at 87% casual read above the 60-80 band). Boss gold and XP in zones 4-12 pay on the old fight length, so the longer first-hour fights do not move first-hour income. Zones 13 and 14 interpolate between the zone 12 and 15 knots (hitX 1.1, 1.35): unmeasured, zones 13-24 are PR 3.
- **The walk bot is not the yardstick yet.** It wears nothing and has one ability. Its numbers are reported; the walk's
  "zone 10 in an hour, no boss over 5 losses" becomes the gate once walk-bot-follow-up equips and trains it.

### Boss tiers, zones 13-24: judge rulings (2026-10-07)

PR 3 of `boss-tiers`. Opus judge after measuring (the cap question) and a tuning pass; Cal can veto any line.

- **Cap 0.4 to zone 15, 0.75 for zones 16-24.** `TURN_TUNE.boss.hitCap` `[[1,0.4],[15,0.4],[16,0.75],[24,0.75],[25,0]]`. A Captain is a
  test: one missed parry costs most of a full-health hero's HP and never kills them. Cap off (the old rule from zone 16) let
  the zone 18 boss take 96% of Wren's health in one hit before armour. Holding 0.4 to zone 24 only reached the band by raising every
  light hit (hitX 2.35 against 1.78 at zone 17), which made the telegraphed heavy blow cost the same as a jab. At 0.75 the cap bites
  only at zone 18 (about 22% off Wren's heaviest hit). Elders, the Deepwell, Provings, normal foes and elites stay uncapped.
  No Captain (zones 11-34) may take more than 75% of max HP with one hit before armour; the budget's `big` JSON field shows each
  boss's heaviest hit against that. Switch off: `hitCap: [[1, 0]]`.
- **Zone 25 breaks that rule today** (the Barrow Beetle hits for 1.23 of Wren's health, 1.0 of Pip's). Not fixed here: mid-zone-wall
  ruled zone 25. Judge's preferred fix: extend 0.75 through zone 34 and re-measure zone 25. Carded as a follow-up.
- **Footing.** Zones 13-15 stay on the first-hour footing (tier at common +0, mid fixture), gated; `z13` and `z15` kept-up rows are
  report-only. Zones 16-24 are gated on the kept-up hero (rare +5), as the card said. At common +0 zones 16-24 are walls (casual
  0-20%): gear is the lever there and `gear-weight` owns it.
- **Knots** (hitX / hpX per zone, 13 to 24): hitX 1.1/0.77/0.84/2.1/1.78/1.2/3.15/1.85/1.17/0.84/0.7/0.63, hpX 2.4/2.4/3.4/4.0/3.0/3.0/4.8/2.8/1.9/2.1/1.5/1.1.
  Fitted so Wren and Pip casual sit near 70-80% and a good player wins in about 6 hero turns (was 3-6, with z13-16 and z19 at 100%).
  The wide hitX swings follow each zone's boss kit (a golem's many small hits against a beetle's one big one).
- **Geared heroes are still threatened in zones 16-24** (power-curve-reference.md, 2026-10-07): at the kept-up footing a weaker casual
  (parry 15%, dodge 40%) wins 20-58% and a stronger one (35%, 70%) 95-97%, so defence decides it. Zones 13 and 15 kept-up (rare +5)
  still win 100% (report-only rows): gear trivialises them. Fixing that needs the gear-curve card or looser bare floors, as
  `boss-tiers-pr2-proposal.md` says; not done here.
- **Pay is unchanged.** Boss gold and XP in zones 4-24 use the old length curve; the longer fights do not move income.
- **Bands.** The z16-34 boss rows are a new kind `captainMid` (Captain band 60-80, Tobin +10, never-defends under 10%); the z20, 25 and 30 Champion-tier fifths sit on it, not the 40-60 Champion band.
- **Gaps.** The z15 and z20 "too easy" gaps for Wren and Pip are closed. Tobin sits above his band at every new row under
  `tobin-safety-margin` gaps (until 2026-12-01).

### Boss tiers, Champions: judge rulings (2026-10-07)

PR 2 of `boss-tiers`. Opus judge after measuring (`/mnt/project-files/early-game/boss-tiers-pr2/data.md`); Cal can veto any line.
Cal's card at 07:19, "Harder without gear", is the direction: bosses tougher across the board, crafting matters more, no gear-curve card.

- **Tier.** `bossTierOf(z)` (40-rules): zone 35 and its multiples Elder, every fifth zone Champion, the rest Captain. Only the zone 5 and
  zone 10 Champions get a stat multiplier now (`TURN_TUNE.boss.champHpX`, `champHitX`); Champions from zone 15 keep their PR 3 knots and sit
  on the Captain band. Boss names, loot and pay by tier are not changed here: boss names are still "Elder <type>", pay stays on the old
  length curve (the Champion HP does not feed gold or XP), and the story cards own Champion scenes.
- **Smoothed Captain line, Champion on top.** Zone 5 hpX 1.85 / hitX 2.0 (was 3.7 / 3.4), zone 10 hpX 1.45 / hitX 0.98 (was 1.9 / 1.05).
  Champion x: zone 5 hp 2.4 / hit 1.6 (effective 4.4 / 3.2), zone 10 hp 1.25 / hit 1.6 (effective 1.8 / 1.57). Hits past about 2.0 saturate
  against the 40% cap; more HP is longer, not harder (z5 3.0/1.25 matches 2.4/1.6 in wins and takes 8 turns against 6.4).
  Fallbacks if the nightly walk loses more than 5 times: zone 10 hp 1.0 (hit stays 1.6), zone 5 hit 1.25.
- **Bands.** `firstChampion` casual 60-80 (the old top, 85, would pass the easy build). Zone 10 `champion` stays 40-60 and speaks for the
  casual player on the first-hour set; `casualLow` at 19% is a wall on purpose, gear is the way through. This supersedes the PR 1 line
  "10-30% casual at the first gear check is not acceptable" for nothing-worn and weaker-defender rows only.
- **Floors (report-only, nothing worn).** Zone 5 casual 35%+ (was 40; not 30, because the first-hour map has the first Forge weapon after zone 5),
  zone 10 casual 10%+ (was 15). Good stays 95%+.
- **Kept-up heroes still win 100% at zones 8-15; accepted, report-only, no knot retune.** A global x1.25 on Captain HP and hits drops
  the first-hour hero (z13 35/36, z15 Pip 30) and leaves the kept-up hero at 99-100. Sizing hits to the hero's own HP moved it 0-1 points.
  The cause is tempo: a kept-up hero kills a boss in 2.5-4 hero turns. Owner: move sets (pr4: chains, delayed hits, feints), until 2026-12-01.
- **Gear must help is gated** (`gearHelps`, health --compare): a kept-up row's casual wins may not sit below its first-hour row's by more
  than the tolerance, for any hero. The absolute kept-up band stays report-only.
- **Closest to death is a report column, not a gate.** The share of a good player's wins that dip under half HP reads 0-7% at every
  setting (a good player avoids about 96% of hits under a 40% cap); the 20-35% aim is not reachable without breaking the cap. Move sets set a target.
- **Gaps.** Removed: z20-elite, z35-elder and z38-elite Wren. z10-boss Pip is kept at 0.70 (the 5-seed baseline reads 68). The re-baseline ratchet
  tightened z35-elder Pip to 0.53 (it read 52-53; the Fenmother pass owns it), z5-boss Pip to 0.98 and z38-boss-behind Pip to 0.80.
- **Tools.** The wide run adds a `bot` player (the walk bot's parry 55%, dodge 50%) and a good-player close-to-death column; `hpr` per row.

### Boss tiers, move sets (PR 4) (2026-10-07)

PR 4 of `boss-tiers`. Opus judge after measuring (`/mnt/project-files/early-game/boss-tiers-pr4/judge.md`, data beside it); Cal can veto any line.
The aim was tempo: a kept-up hero kills a boss in 2.5-4 hero turns, so wins sat at 99-100%. Cal's "Harder without gear" and the E33 curve are the direction.

- **Tricks.** Zone 4-15 Captains and Champions play new move sets (`TURN_BOSS_TRICKS`, `TURN_TUNE.tricks`; `tricks.on = 0` brings back the old move sets only; with `gate.on = 0` and `hpFloor` `[[1, 0]]` it also drops the
  gates and floor, and the refit z4-15 knots come back only by reverting them). A **delayed hit** (`hold`) winds up, stalls 0.4-0.6 s, then runs the last dodge window plus 0.25 s; the bar stalls so a player who
  waits is safe and one who presses at the first sign wastes the press. A **feint** (zone 7+) shows a wind-up that breaks at the tell and deals
  nothing; pressing on it fools the hero, and the next hit of that move cannot be defended. The Champion has a fifth move (a long string).
  Move ids and names stay stable (`bossTry.rev`); total damage per move is about the old total.
- **Windows keep their size.** Base parry 0.18 s, dodge 0.35 s and Wider are untouched. Fallback if a playtest finds the tricks unfair: windows
  about 10% narrower on Champion and Captain hits only, never zones 1-3.
- **Rally gates (tempo floor).** `TURN_TUNE.boss.gate`: a boss cannot be burst below 67/33% (Captain) or 75/50/25% (Champion) in one move; it
  rallies and finishes its next move first. Cost on first-hour fights is 7-10 turns, kept-up 4.5-5.9. Off with `gate.on = 0`.
- **Own-HP hit floor.** `boss.hpFloor` makes a boss hit cost at least a share of the hero's own max HP. It is set to the non-binding floors
  (it binds nothing on first-hour heroes) and is the lever to pull if kept-up stays too easy. Off with `[[1, 0]]`.
- **Refit knots.** Zone 4-15 `hpX` and `hitX` were refit so Wren and Pip casual on the first-hour set match the old sets (z5 73/100/92,
  z10 59/100/54, nothing worn z5 28/100/49, z10 17/100/12). Hit scales are 0.46-0.9 of the old values; effective z10-15 `hitX` (0.3-0.5) sits
  under the judge's 0.8 rule of thumb because the tricks carry the difficulty now. Zones 1-3 and 16+ are unchanged.
- **Honest result.** Kept-up heroes still win 92-100% at z8-15 (good play 100%, casualHigh 100%). The tricks and gates move the
  first-hour bosses' length and shape but the 96% defender cannot be made to lose without breaking the hit cap. The kept-up gap stays, owner
  `boss-tiers-pr5` (zones 16-34 tricks, hit-floor and gate retune) until 2026-11-15; the first-hour bands and gear-helps gate hold. **Closed for zones 4-15 by the pr5 build (below).**
- **Known limit: gated charges.** While a boss sits at a gate and gathers a charge, hits deal 0 and do not count toward breaking it (the review
  pass found it). Counting the clipped damage raised first-hour casual by 6-24 points (z10 59 to 67 Wren, 54 to 78 Pip), so the fit
  keeps the current rule. Follow-up card: `boss-tiers-pr5` re-fits with clipped damage counted.
- **Report columns.** Boss Ready (59m) skips held and flinched hits in its tally. The Foe tab and move chips show "delayed" and "feints".
- **Milestone E2.** The z5-15 Champion bands are met on the first-hour set; the kept-up row stays report-only and is a dated gap, not a pass.
- **Captain moves** (z4-14 outside every fifth zone) arrive through `bossTierOf`; the slice-turn-check card sees them.

### Boss tiers, kept-up heroes (PR 5 judge) (2026-10-07)

PR 5 of `boss-tiers` (kept-up heroes, zones 4-15). Opus judge before the build, after a red team (it changed r, frontier-only,
gates from zone 7 and the passive floor). Ruling with each point's why and the options:
`/mnt/project-files/autopilot/reviews/boss-tiers-pr5-judge.md`; data in `/mnt/project-files/early-game/boss-tiers-pr5/`.
Cal can veto any line. This closes the pr4 "Honest result" gap line.

- **Why gear erased the danger.** A z4-15 boss fight is decided by the total damage let through (a landed hit costs 5-11% of
  max HP). Rare +5 against common +0 at the same tier gives 2.5-3.6x the HP and 1.4-2x the Attack; the pr4 floor gave back
  only part of the HP edge and two Captain gates let a kill come in about 3 boss moves. Kept-up casual read 92-100%, and a
  kept-up hero who never defends won 73-100% at zone 8 and 43-100% at zone 12. The 40% hit cap and the per-hit defence model
  are not the blocker; both stay.
- **Footing floor.** On a zone boss the hero has not beaten (zones 4-15), a hit costs at least its base x r x (max HP / the
  hero's own max HP wearing the zone's tier at common +0: class set and Charm, base lines only). r starts at 0.9 (fit
  0.85-1.0, never above 1). It never binds the first-hour set or a bare hero. Armour, Guard, Ward, block, Stars and timing
  still cut the hit; Attack still shortens the fight. Beaten bosses replayed keep today's numbers. The pr4 `hpFloor` knots stay
  as a second floor (they bind Tobin and partly Pip).
- **Passive floor.** Armour times class damage reduction cuts a zone boss hit (zones 4-15) to no less than 55% of itself.
- **Gates.** Captains rally at 75/50/25% from zone 7 (replaces the pr4 Captain 67/33 line there; zones 4-6 keep 67/33).
  While a boss rallies, hits still do not break its charge (counting them made a no-defence kept-up Pip win 100%); the rally
  line says only a Stun breaks it. This replaces the pr4 "Known limit" follow-up; fallback if playtests read it as a bug:
  count clipped damage at half.
- **Zone 15 is a real Champion**: first-hour casual moves from the Captain band to Champion 40-60 (M1 E2), superseding the pr2
  line that kept Champions from zone 15 on the Captain band.
- **Gates in the budget.** These replace the report-only kept-up lines in the pr1, pr2 and pr3 entries (the `keptUp` kind is
  retired). Kept-up casual: learning Captain (z8) 80-97, Captain (z12, z13) 75-95, Champion (z5, z10, z15) 60-85, all at
  least the first-hour row. New player `none` (never parries or dodges): at most 10% on kept-up rows for Wren and Pip.
  casualHigh report-only, no ceiling; the E33 "good player 85-95%" aim is dropped for `good` (good 97-100 stays the no-walls
  guard; the aim maps to casual and bot). z12 kept-up moves to the early save like its first-hour row. Pip cells ride the
  `wren-first-hour-parity` gaps (until 2026-11-15) where her first-hour cell has one; Tobin's ride `tobin-safety-margin`
  (until 2026-12-01). E2 still needs both of those cards before it can pass.
- **Live saves.** A rare +5 Wren at zone 10 drops from about 92% to about 80% casual. It goes in the patch note. No save change.
- **Switch off.** `TURN_TUNE.boss.footFloor: [[1, 0]]` and `passiveMin: 0` remove the new floors; the gates revert
  with `gate.captainFrom` past zone 15. This is pr4 logic with pr5 numbers: the hitX refit (z7, 9, 11-14), the z13/z14
  `hpFloor` knots and the z15 `champHitX` 1.25 stay. A full rollback also reverts those three tables.
- **Tobin** shares the symptom but not the lever (class HP and damage reduction at the footing, not gear); the passive floor
  is the cheap half, the rest stays with `tobin-safety-margin`.
- **Set bonuses and uniques** (Cal, 2026-10-07). At zones 4-15 the gates absorb burst: all damage x2 or x3 moves kept-up casual
  at most +15 and the no-defence player stays at 0. Uniques may not skip or shorten a rally, and a boss still faces at most two
  hero actions in a row. Passive cuts to boss damage from a set plus a unique stay at 10% or less against zone bosses. At
  16-34 there is no floor or gate yet: kept-up players will wear the set, so it ships with or after
  `boss-tiers-pr5b`, which refits those zones with the set worn. **The grade 4 set** is the same as wearing +0.10 x TIER_POW[t] Might and
  +0.15 x TIER_POW[t] health gear lines (about +2% damage and +2% health at grade 4). Measured on the official rows it adds
  +1 to +4 casual on 7 of 8 cells (z20, z25, z30, z34); the z34 Wren +13 cliff belongs to pr5b. An earlier note read it as
  +7.5% damage and +11% health and quoted "+7 to +15"; that was a units error (corrected 2026-10-07, uniques judge).
  Grades 1-3 have no set bonus until pr5b.
- **Zones 16-34** get tricks in `boss-tiers-pr5b` (M1b; moved here from the pr4 "Honest result" owner line), with the zone 25
  cap fix and the set-worn refit.

### Boss tiers, kept-up heroes: the build (boss-tiers-pr5-build) (2026-10-07)

Built to the ruling above; the fit is on the budget's own rows, 3 seeds a cell for the search and 5 seeds (1,200 fights a cell) for the table.

- **Fit.** `footFloor` r is 1.0 on every zone 4-15 (the top of the 0.85-1.0 range; at 0.9 Wren at z10 kept-up read 75 and Pip 95, at 1.0 64
  and 88). First-hour `hitX` moved to z7 1.5, z9 0.632, z11 0.407, z12 0.403, z13 0.539, z14 0.461 (the rest as they were);
  `champHitX` at z15 is 1.25 (first-hour z15 Wren 44, Pip 48). The pr4 `hpFloor` knots at z13 and z14 fell to 0.81 and 0.84: they bound
  Pip's first hour there (she sat at 40-46 against 60-80) and are class-neutral. `passiveMin` 0.55, Captain gates 75/50/25 from z7.
- **Result** (5-seed means, casual / never defends, Wren then Pip):

| row | first-hour | kept-up |
|---|---|---|
| z5 Champion | 71, 89 | 75/0, 99/0 |
| z8 learning Captain | 71, 97 | 95/0, 99/0 |
| z10 Champion | 53, 52 | 64/0, 88/0 |
| z12 Captain | 70, 99 | 88/0, 100/100 |
| z13 Captain | 64, 58 | 92/7, 99/0 |
| z15 Champion | 44, 48 | 76/0, 88/0 |

  Wren is in band on every gated row. z8 holds (first-hour Wren 71, kept-up 95) with no `hpX` change. First-hour z4-15 rows are in
  their bands for the weaker of Wren and Pip (z13 Pip reads 58, 2 under). Good players win 99-100% everywhere; casualHigh 92-100.
- **Honest gaps.** Pip kept-up sits above band at z5, z8 and z12 (her first-hour cell is in a `wren-first-hour-parity` gap) and just over
  at z10, z13, z15 (88-99 against 85-95); Pip who never defends wins the z12 kept-up boss 100%, as the ruling allowed. Tobin's kept-up
  cells (casual 100, never defends 55-100 at z5, z8, z10, z12, z15) ride `tobin-safety-margin`. E2 still needs both cards.
- **First hour holds.** z4-z15 first-hour rows moved by hitX only where the table above shows; the personas' pacing metrics
  (`health.mjs --compare`) are all inside tolerance and boss pay stays on the old length curve.
- **Footing key.** The floor needs the boss to be new: the budget's boss rows set `S.maxZone` to the zone, and the fixture saves'
  higher `maxZone` had been reading z5 and z15 kept-up as beaten bosses.
- **Copy.** The rally line reads "Rally! Only a Stun breaks its charge." (the judge's longer line wrapped to five lines on the 360 px stage; the boss's name is on its bar); the Vigour line reads "More
  health. Bosses you have not beaten hit for a share of it." Guide or defeat-card tip (copy owner): "Boss hits grow with your health.
  Armour, Guard and good timing keep you standing." Patch note (Foreman): "Bosses now hit for a share of your health, so a big health
  pool no longer makes them harmless. Armour, Guard and good timing still cut their hits." A rare +5 Wren at zone 10 drops from about
  92% to about 64% casual on a first meeting (about 80% was the sketch; the fit lands lower because z10's first-hour row sits at 53).

### Boss tiers, zones 16-34 (boss-tiers-pr5b) (2026-10-07; numbers provisional until the skilling and crafting balance pass)

Ruled SHIP WITH CHANGES by an Opus high judge (`autopilot/reviews/pr5b/boss-tiers-pr5b-judge.md`); Cal can veto any line.

- **Built.** Move tricks, rally gates 75/50/25, the footing floor (r 1) and the 0.75 hit cap run to zone 34 (`tricks.to`, `gate.to`, `footFloor`, `hitCap`).
  From zone 16 the footing is the kept-up set, rare +5 base lines (`footRare`), with no crafted-set lines: the set's health is cancelled at the
  frontier and its damage stays. `hitX` and Tobin's `heroHitX` for 16-34 are refitted (casual mean of Wren and Pip 70, Tobin 80) with the G4 set worn.
- **Measured** (480 fights a cell, 2 seeds): casual 60-83 on every row, never-defends 0-1%, casualHigh 95-100. +50% health moves casual 0-2 points with
  the floor and +20-35 without. Damage x2 moves casual to 88-100 with the gates and to 100 on every row without them, which is why gates ship here.
- **Gaps.** z25 Wren (above, ruled 0.87, ratcheted to the measured 0.82) and Pip (below, ruled 0.54, ratcheted to 0.55), owner `boss-balance-pass`, until 2026-12-01.
- **Replays at 16-34 are easier** than before (the hit scale is 0.2-0.4 of the old one and the floor is frontier only). Accepted; flagged to the balance pass.
- **Rules for uniques and the set at 16-34:** nothing skips, ignores or shortens a rally; at most two hero actions in a row; boss-fight damage gain +50% at most;
  passive cuts to zone-boss damage from the set and uniques stacked 10% at most (the 0.55 floor does not reach 16-34); no max-health cost or gain counted as safety;
  Crown of the Burrow at most once per gate; each unique gets a kept-up budget row (set worn) at z16, 20, 25, 30 in the PR that ships it (this PR measured stand-ins: damage x2, +50% health, foe damage x0.8). `gearCalc(over)` must never add set lines.

### Zone 13 arrival footing (z13-arrival-footing) (2026-10-08)

Ruled MERGE by an Opus high judge (PR for card `z13-arrival-footing`); Cal can veto any line.

- **The z13, z14 and z15 boss rows measure the hero a first-time player arrives with:** level from the game's own XP for `ZONE_FIGHTS`
  fights and the boss a zone (`arrivalLv`: 18, 19, 19, matching the walk), tier 1 common +0 (tier 2 needs gathering 14), zone kills capped
  at 10 (no mastery stars), Bestiary kills a kind at 12. Casual reads 0% a try there, as the walk does. The kept-up rows stay the report rows (1-2 tries).
- **Zones 10-12 stay on their footing.** They read the walk within 15 points as they are; at the arrival footing the sampler reads Wren and
  Pip 54-78 under the walk (33-56 on Wren's own walk save), a sampler gap, not a footing one. They move once that gap is fixed.
  (Superseded by "Rally gates are live": the gap was the live fight skipping the rally gates; zones 7-12 moved to the arrival footing there.)
- **Gaps:** z13-15 casual and good, low side, owner `boss-balance-pass`, until 2026-12-01; Tobin's in-band z13 good cell stays gated.
  The boss refit (`TURN_TUNE.boss` hitX/hpX to casual 60-80 at this footing) is a balance-pass row; until it lands the `gearHelps` gate on
  the z13 and z15 kept-up rows passes trivially (first-hour casual is 0).

### Zone 13 unstick (z13-unstick) (2026-10-08)

Ruled MERGE with option B2 by an Opus high judge (PR for card `z13-unstick`); Cal can veto any line. Data: the builder's
measurements, re-run by the judge at 160 fights a row on the same build (same numbers within a few points).

- **The pick: B2.** The zone 13, 14 and 15 boss knots in `TURN_TUNE.boss` change, and nothing else: hitX 0.539/0.461/0.491 to
  0.10/0.085/0.05, hpX 1.848/1.656/1.7 to 0.36/0.38/0.12, hpFloor 0.81/0.84/0.76 to 1.0/1.0/0.9. Moves, timing windows, parry and
  dodge rules, the hit cap, rally gates, Champion tables and boss pay do not change (zones 4-24 pay on a fixed length).
- **Why not A.** Tier 2 gear at the arrival footing reads casual 0-2% at all three bosses with today's knots. To open tier 2 by
  zone 13 the gathering gate would drop from 14 to about 6-7, which also moves tier 2 for zones 7-12.
- **Why not C.** With tier 2 worn the bosses still need cuts of 4-5x on hitX and 3x on hpX (z13 0.12/0.65), Pip at z13 and Tobin
  at z15 still sit under band, and it moves the gathering gate and the economy of zones 7-12. More change for less result.
- **Why B2 and not B1.** B1 (hitX and hpX only) gets the arrival rows in band, but a kept-up hero who never parries or dodges then
  wins 45-100% at zones 13-15 (z13 45/52/0, z14 58/56/100, z15 100/0/0). That breaks the owner's rule "it should always be very bad
  for us to get hit by a boss". With hitX that low every landed hit sits on the hpFloor, so the hpFloor is the hit; raising it is
  how the hit stays hard. The card's Never line names hitX and hpX only; its purpose is that no boss move changes, and B2 keeps
  that. pr5 refit the same three tables.
- **What a first-time player gets** (level 18-19, tier 1 common +0, no mastery stars; casual Wren/Tobin/Pip): z13 75/74/80,
  z14 81/73/75, z15 55/50/43 (Champion band 40-60, Tobin 50-70: the card's 60-80 is the Captain band and does not apply at z15).
  Good players 100. A weaker casual 35-61 at z13. A player who never defends wins 0-6%. Walks: seed 1 Wren cleared zone 13 on the
  first try at 31:04 (was 30 tries lost), seed 2 Tobin at 36:38 (was 6 tries, cleared at 41-44 min). Neither lost a try at 14 or 15.
- **How the fight feels.** A landed hit at zones 13-15 now costs a fixed share of your health, about a fifth for Wren and Pip (Tobin's own boss-hit share, heroHitX 1.6-2.55, lifts his toward the 40% cap), and a landed
  charge nearly half (check reads z15 19-20% and 45-48%). Gear health no longer shrinks it; armour, Guard and timing still do. The
  old hits sat on the 40% cap. Fights at the arrival footing last about 6 turns played well, as zone 12 does (z12 5.9/7.4/4.7, z13
  5.9/7.8/5.7, z15 4.9/4.7/4.8); they were 17-24 turns and unwinnable.
- **Cost, accepted for now.** In reference Attacks the zone 13-15 bosses carry less HP than zone 12's (5.8, 6.1 and 1.9 against
  16.1), so fight length is flat from 12 to 15 and the z15 Champion is the shortest of them. Rally gates hold every fight to about
  5 turns, kept-up too (z13 5.0, z15 4.8). Restoring the length ramp belongs to the balance pass's full refit.
- **Kept-up z15 Champion is too easy for a geared casual:** 100/91/99 against 60-85 (was 76/83/88). A kept-up hero who never
  defends still wins 0%. No z15 knot puts both rows in band: hpX 0.2 with hpFloor 0.9 drops the arrival row to 40 (Tobin 37) and
  kept-up still reads 95; hpFloor 1.1 drops arrival to 39 and kept-up reads 86. The first-time player wins; this goes in a gap
  (owner `boss-balance-pass`, until 2026-12-01). Kept-up z13 reads 99/98/98, inside tolerance of 75-95; no gap.
- **Zones 1 to 12 are unchanged.** No knot, gate or pay below zone 13 moved, and the zone tables read whole zones, so zone 12
  reads its own knot. The z11 and z12 rows give the same numbers on the old and new knots on the same seeds (z12 65/78/98). Margin
  accepted: zero on the knots, and the gate's own tolerance (6 points or 2.5 sd) on any zone 1-12 budget cell or pre-zone-13
  pacing metric. Both walks lost no boss try in zones 1-12.
- **The wall moves to zone 16.** The walks reach zone 16 at 35-41 min and lose 28-57 tries there by 60:00 (the bot always presses
  Try again). The active persona now reaches zone 16 (Wren, Pip) and dies there (wipes per hour 14.3 to 27.7; hero parity 0.07 to 0.22, as Wren and Pip end the hour at zone 16 and Tobin at 12). The 50-hour bots stall
  3.6-5.5 h at zone 16 and reach zone 29 earlier (Wren sits there 24 h). These are existing walls met sooner, not new ones. They
  stay the balance pass's; the health baselines are re-set to the new run with no tolerance change.
- **Long-run empty-endgame watch.** long.postNewThingShare `abs` goes from 0.1 to 0.13 (each hero may move up to 0.26). At seed
  offset 0, which CI runs, Wren now reaches the existing zone 29 wall at hour 26 and sits there 24 h: 0.48 against her 3-offset
  baseline of 0.24. Offsets 1 and 2 do not stall there. Owner `boss-balance-pass`; back to 0.1 when the zone 29 wall is fixed. This is
  the one tolerance change; the other re-baselines change no tolerance.
- **Gaps.** The seven low-side z13-15 gaps from z13-arrival-footing are removed (all cells in band; z14 Wren casual 81 is an edge).
  One gap added: z15-boss-keptup casual, above, all heroes.
- **Switch off.** Put the nine knots back (hitX 0.539/0.461/0.491, hpX 1.848/1.656/1.7, hpFloor 0.81/0.84/0.76), restore the
  seven gaps, the old baselines and long.postNewThingShare abs 0.1. No save change.

Veto phrase for Cal: "put the zone 13 bosses back" (undoes the pick; "hold zone 13 for the balance pass" still undoes the timing
and has the same effect).

### Zone 16 wall (z16-wall) (2026-10-08)

Ruled MERGE with option D (B2-style knots plus a rider knot) by an Opus high judge (PR for card `z16-wall`); Cal can veto any line.
Data: the builder's runs (240 fights a row), re-run by the judge at 160 fights on other seeds (offsets 1-3; same numbers within a few
points). Walks confirm (60 game min, with the bot that keeps fighting after a loss): on the base build seed 1 Wren reached zone 16
at 29:55 and seed 2 Tobin at 47:48, and neither cleared it by 60:00. On the fix, seed 1 Wren cleared zones 16, 17 and 18 at
35:04, 37:49 and 47:03 and reached zone 19 at 55:04. Seed 2 Tobin cleared them at 45:46, 48:11 and 56:51 and reached zone 19 at
59:38. Neither lost a try in zones 1 to 19.

- **Why it walls.** A first-time hero reaches zone 16 at level 20 on tier 1 common +0, with about 0.06 of the reference HP (a kept-up
  hero has 1.22). Casual reads 0% a try at the zone 16, 17 and 18 bosses on that footing; the base walks lost 8 and 17 tries at zone 16
  and never cleared it. Two things cause it: the hit knots were fitted to the kept-up hero, and the boss's Bleed ticks a share of the
  reference HP (`TURN_TUNE.heroDot`), which no hit knot, floor or cap touches. One Bleed tick took a third of a first-time hero's health.
- **The pick: D.** In `TURN_TUNE.boss`, zones 16, 17 and 18 only: hpX 4/3/3 to 0.15/0.15/0.12, hitX 0.738/0.7/0.481 to 0.03/0.03/0.03
  (dormant: every landed hit sits on the hpFloor, as at zones 13-15), hpFloor 0/0/0 to 0.95/1.0/0.95 (0 again from zone 19), Tobin's
  heroHitX 6.36/5.48/5.51 to 2.75/2.75/2.6. New zone table `riderX` `[[1,1],[15,1],[16,0.2],[17,1],[18,0.2],[19,1]]`: a zone boss's
  Bleed, Burn and Venom ticks on the hero x this. Zone 17's boss has no ticking rider. Moves, timing windows, parry and dodge rules,
  the hit cap, rally gates and boss pay do not change.
- **riderX is a knot, not a move change.** The Bleed still lands on the same hits, ticks twice and shows the same. Only its size
  changes, as hitX changes a hit's size. The card's Never line names hitX and hpX; its purpose is that no boss move changes, and #223's
  judge read hpFloor the same way. This stretches the line further than hpFloor did (it is a new table and one multiply in the tick),
  so it is named here for Cal's veto.
- **Why not A.** Tier 2 or even tier 3 rare +5 at level 20 reads 0% at zone 16 with today's knots. Both walks end the hour with the
  gathering gate still shut (11-12 of 14), so opening it before zone 16 also moves tier 2 into zones 7-15.
- **Why not B (knots only).** The ticks cap it. The builder's knots with riderX off read 31/31/39 (Wren/Tobin/Pip), good 94-97. The
  best knots-only fit (hpX 0.06, hpFloor 0.9, Tobin 3.5) reads 37/49/45. hpFloor 0.8 lifts it to 38/53/50 but a kept-up hero who never
  defends then wins 84% (Wren) and 96% (Pip), which breaks "it should always be very bad for us to get hit by a boss".
- **Why not C.** Tier 2 common worn plus the knots, riderX off, reads 36/48/53 at zone 16. More change (the gathering gate and the zone
  7-15 economy) for less result.
- **Why 0.2.** riderX 0.3 reads 64/52/74, 0.1 reads 78/58/84 and lets a first-time hero who never defends win 5%. At 0.2 a Bleed tick
  costs a first-time hero about 7% of their health (was about 33%); it still hurts.
- **What a first-time player gets** (casual Wren/Tobin/Pip, arrival footing): z16 70/57/80 (73/55/79 on other seeds), z17 83/52/69,
  z18 83/62/66. Good players 100. The walk bot's player 91-97. A weaker casual 45-54 (Tobin 22-24). A player who never defends wins
  0%. Expected tries 1.2-1.9. Fights last about 5-7 turns played well, as at zones 13-15.
- **z17 and z18 are fixed here.** The budget leads and both read 0% at the arrival footing on the old knots, so a zone 16 fix alone
  moves the wall one zone. Their arrival rows become gated Captain rows (kind `captain`, not report rows), so the fix is held.
- **z19 is out of scope.** Its arrival row reads 0% and stays a report row. It is the next wall: a follow-up card `z19-wall`, same
  method (arrival knots, riderX for its Venom), for the coordinator to card; until then `boss-balance-pass` owns it.
- **Kept-up z16-18 are too easy for a geared casual:** 97-100 against 60-80 (was 59-82). A kept-up hero who never defends still
  wins 0% (four seed sets). No knot puts both rows in band: hpX 0.3 drops arrival to 53/43/31 and kept-up stays 98; hpFloor 1.1 drops
  arrival to 62/39/66 and kept-up reads 92. The first-time player wins; this goes in gaps, as z15-boss-keptup did.
- **Tobin sits under his arrival band** (55-62 against 70-90; he still clears in about 2 tries). His heroHitX is the trade: 2.5 lifts
  z16 arrival to 62 but a kept-up Tobin who never defends wins 34%; 2.2 reads 73 and 46-48%. The never-defends rule wins; his arrival
  cells go in gaps under `tobin-safety-margin`.
- **Zones 1 to 15 are unchanged.** No knot below zone 16 moved and riderX is 1 there, so #223's z13-15 ruling stands. The z5-z15 rows,
  z15 kept-up included, read the same on the old and new knots on the same seeds. Zones 19+ keep their knots (hpFloor and riderX are
  back to 0 and 1 from zone 19). Normal foes, elites, region bosses, the Deepwell and Provings tick as before.
- **Cost, accepted for now.** Rally gates hold every zone 13-18 fight to about 5 turns, so the length ramp stays flat from zone 12 to
  18. Replays of the zone 16-18 bosses get easier. Both belong to the balance pass's full refit.
- **Gaps (all until 2026-12-01).** z16-boss, z17-boss and z18-boss casual, above, all heroes, limit 1, owner `boss-balance-pass`.
  z16-boss-arrival, z17-boss-arrival and z18-boss-arrival Tobin casual, below, limits 0.5, 0.45 and 0.55, owner `tobin-safety-margin`.
- **Health: re-baselined, no tolerance change.** The bots pass zones 16 to 18 and meet the zone 19 wall sooner. The 10 h optimiser's
  longest stall rises from 18,300 s to 26,429 s and its wipes from 39 to 58.6 an hour; all three heroes end at zone 19 (was 18.87).
  In the long run Pip now has 8 stalls of 3 hours or more (was 5.67). Her new ones are at zones 19 (5.9 h) and 20 (4.3 h), and she
  stalls at zones 25 to 30 as before. Tobin's longest stall is now 13 h at zone 19. The z16-18 kept-up budget means (0.98-0.99) are
  covered by the new gaps, but a hero `*` gap does not cover the three-hero mean cell, so the re-baseline takes them, as #223 did for z15.
  The active and casual personas do not move. These are existing walls met sooner. The `z19-wall` card should bring the stall counts back down.
- **Switch off.** Put the zone 16-18 knots back (hpX 4/3/3, hitX 0.738/0.7/0.481, hpFloor 0 from zone 16, Tobin heroHitX
  6.36/5.48/5.51) and set `riderX: [[1, 1]]`; drop the six gaps and make the z17 and z18 arrival rows report rows. No save change.

Veto phrase for Cal: "put the zone 16 bosses back" (undoes the whole pick). "No rider knot" undoes only riderX: the knots stay and
zone 16 reads about 31-39% a try for a first-time player.

### Zone 19 wall (z19-wall) (2026-10-08)

Ruled MERGE with option D (B2-style knots plus a rider knot), zone 19 only, by an Opus high judge (PR for card `z19-wall`); Cal can
veto any line. Data: the builder's runs (240 and 160 fights a row, seed offsets 0-3), re-run by the judge at 160 fights on offsets
1, 2, 4, 5 and 6. The judge changed two of the builder's zone 19 knots (hpFloor and hpX) and dropped his zone 20 knots.

Walks confirm (the final build, 90 game min, the bot that keeps fighting after a loss): seed 1 Wren reached zone 19 at 47:34 and
cleared it on the first try at 56:51; seed 2 Tobin reached it at 54:00 and cleared it on the first try at 57:50. Neither lost a try in
zones 1 to 19. Both then lost a try at the zone 20 boss and were still there at 90:00 (the next wall, as expected). Both reached zone 19
sooner than the z16-wall walks (55:04 and 59:38) with nothing before zone 19 changed: the walk's later minutes vary between machines.

- **Why it walls.** A first-time hero reaches zone 19 at level 22 on tier 1 common +0 (the z16-wall walks: 55:04 and 59:38, gathering
  gate still shut). They have 0.02-0.05 of the reference HP (Wren 0.021, Tobin 0.054, Pip 0.025); a kept-up hero has 1.3-4.5, about 65
  times more. The zone 19 knots were fitted to the kept-up hero, so the boss's biggest hit is 13.5 times Wren's health before the cap.
  The boss (Elder Spore Cap) also rides Venom, which ticks 0.02 of the reference HP twice (`TURN_TUNE.heroDot`): one tick took 97% of a
  first-time Wren's health. Casual and good players read 0% a try.
- **The pick.** In `TURN_TUNE.boss`, zone 19 only: hpX 4.8 to 0.07, hitX 1.04 to 0.015 (dormant: every landed hit sits on the hpFloor,
  as at zones 13-18), hpFloor 0 to 1.35 (0 again from zone 20), Tobin's heroHitX 4.99 to 2.4, and riderX 1 to 0.07
  (`[[1, 1], [15, 1], [16, 0.2], [17, 1], [18, 0.2], [19, 0.07], [20, 1]]`). Moves, timing windows, parry and dodge rules, the hit cap,
  rally gates and boss pay do not change. As at zone 16, riderX changes only a tick's size: Venom lands on the same hits and ticks twice.
- **Why hpFloor 1.35 and hpX 0.07, not the builder's 1.25 and 0.09.** At zone 19 the never-defends rule sits on a cliff. A kept-up
  hero who never defends wins 0% at hpFloor 1.25, but Wren wins 100% at 1.15 and Tobin 47% at 1.2. 1.25 sits 0.05 above the cliff;
  a little healing or shielding the budget hero lacks (a Ward, a unique) could tip a real player over it. 1.35 with hpX 0.07 keeps
  0.15 of room. On the same five seed sets it reads the same first-time mean (64 against 65), Tobin 1-8 points up, Pip 4-8 down, and a
  tighter spread between heroes (5-16 points against 16-30).
- **Why not A (a gear step).** Tier 2 common, tier 3 rare +5 and even tier 4 rare +5 at level 22 read 0% at zones 19 and 20 on the old
  knots. Arriving at the road level (28) on tier 1 also reads 0%. Opening the gathering gate would also move zones 7-18.
- **Why not B (knots only).** Venom caps it. The best knots-only fits read 16-31% a hero (mean 19-24), and the lower ones let a kept-up
  hero who never defends win 55-100%. The picked knots with riderX 1 read 16/6/16.
- **Why riderX 0.07.** A Venom tick now costs a first-time Wren about 7% of her health (Pip 6%, Tobin 3%), as z16's Bleed does, twice a
  Venom. It still hurts. On the builder's knots (offset 5), 0.1 reads 57/42/68, 0.15 reads 41/35/53 and 0.2 reads 33/29/43. On a
  kept-up hero a tick was already about 0.1% of their health.
- **Tobin at 2.4.** 2.2 lifts his first-time row about 10 points but lets a kept-up Tobin who never defends win 48% (2.0: 52%). The
  never-defends rule wins; his arrival cell goes in a gap under `tobin-safety-margin`, as at zones 16-18.
- **What a first-time player gets** (casual Wren/Tobin/Pip, arrival footing, five seed sets): Wren 63-70, Tobin 53-65, Pip 66-74,
  mean 61-68. Good players 100. The walk bot's player 84-93. A weaker casual 38-46/24-31/31-40. A player who never defends wins 0%.
  Expected tries 1.3-1.9. Fights last about 5 turns played well. A landed Cap Slam costs about a quarter of your health (Wren 25%,
  Pip 27%, Tobin 29%), the charged Bloom over half (54-61%), and each Venom tick about 7% more.
- **z19-boss-arrival becomes a gated Captain row** (kind `captain`, was `reportArrival`), as z17 and z18 did, so the fix is held.
- **Zone 20 is not fixed here.** Its arrival row reads 0% and stays a report row (`z20-boss-arrival`, kind `reportArrival`, new in
  this card). The builder's zone 20 knots (hitX 0.02, hpX 0.065, hpFloor 1.0, Tobin 2.75) read 76-79 for a first-time player, but they
  cost far more than zones 17 and 18 did in z16-wall:
  - Two `check.mjs` asserts fail ("C29 mid-game HP"). A kept-up hero should win zone 20 bosses 20-85% casually in 6-12 turns; it wins
    98-100% in 4.8. A tier behind, a zone 20 hit should cost over a fifth of your health and a tier ahead under 15%; it reads 24% and
    20%. Neither assert can move to zone 21: the check's hero wins zone 21 100% casually too.
  - `z20-boss` kept-up reads 99-100 (band 60-80) and `z20-boss-behind` a drop of 0-5 (band 10-60): a tier behind no longer costs wins.
    `z20-boss` is also the reference row for the joined row and the three build rows, which would then read against 100%.
  - It buys one zone. The bots then stall at zone 21 for 5-8 hours (z21 on the arrival footing is unmeasured and expected near 0%).

  These are the only instruments that watch whether gear matters in the mid game. The same loss is already true at zones 13-19 (a
  landed hit sits on the hpFloor whatever you wear), with nothing watching it there. Blinding them for one zone is the wrong trade. A
  follow-up card (proposed `z20-wall`) fits zone 20 onward in one pass and first decides where the "gear matters" checks live once the
  arrival knots reach zone 20: a zone still on kept-up knots, or a check that knows the footing. It should also weigh ticking a zone
  boss's Bleed, Burn and Venom as a share of the hero's own health instead of a `riderX` row per zone. Until carded,
  `boss-balance-pass` owns zone 20.
- **Kept-up z19 is too easy for a geared casual:** 94-100 against 60-80 (was 59/78/77). A kept-up hero who never defends wins 0-1%
  (five seed sets). No knot puts both rows in band: every knot tried that lets a first-time casual win more than 40% reads kept-up
  98-100, hpX 0.15 included. The first-time player wins; this goes in a gap, as at zones 15-18.
- **The footing fix in `tools/budget.mjs` is right.** The arrival footing is tier 1 common +0 with no mastery stars. The crafted set is
  a grade 4 craft the game does not ship, and a first-time player cannot have it. The z16-18 arrival rows are grade 3 and never wore
  it, so z19 was the only arrival row wearing it, an oversight in #229. It was worth about 9 points to Wren. Kept-up rows keep the set.
- **Zones 1 to 18 are unchanged.** No knot below zone 19 moved and riderX is the same below 19, so the #223 and #229 rulings stand.
  z18-boss-arrival reads 81/66/69 and 85/54/61 on two seed sets, inside its noise and gaps. Zones 20 and up keep their knots and gaps.
- **Gaps (all until 2026-12-01).** z19-boss casual, above, all heroes, limit 1, owner `boss-balance-pass`. z19-boss-arrival Tobin
  casual, below, limit 0.55, owner `tobin-safety-margin`. The re-baseline ratcheted them to 0.99 and 0.59.
- **Health: re-baselined, one tolerance change.** The bots pass zone 19 and meet the zone 20 wall inside the 10 hours: every
  optimiser stall over an hour is at zone 20, the existing wall met one zone later. Passing one more zone adds short stalls, so
  `optimiser.stallCount` rises from 4 (#229) to 4.93, and its spread over the five seed offsets widens (6, 4.33, 5, 4 and 5.33; sd
  0.8). CI reads offset 0 one stall higher than the builder's machine (6.33). That is +1.4 against an allowed +1.3, so CI fails by 0.1.
  - **The ruling: `optimiser.stallCount` abs goes from 1.3 to 2.4.** `docs/design/health.md` asks for at least three standard
    deviations over the five offsets (3 x 0.8 = 2.4), and 1.3 no longer meets that. Each hero is then held at 4.8 against their own
    baseline. Nothing else moves, and the baseline stays the 5-offset mean.
  - **Why not a knot.** The extra stalls are at zone 20, which this card leaves alone. Fixing zone 20 to pass CI is the trade this
    ruling turned down.
  - **Why it is safe.** The walls this metric watches still show elsewhere. `longestStallSec` (allowed +5,700 s or 30%),
    `zoneEnd`, `zonePerHour` and the long run's `stallsOver1h` keep their bands, and a new wall moves them.
  - **Temporary.** Owner `boss-balance-pass` (the zone 20 follow-up). When the zone 20 wall is fixed, set it back to the larger of 1.3
    and three standard deviations of the then 5-offset spread.
  - **Watch items.** `docs/design/health.md` says a seed repeats exactly, but CI and this machine differ by one stall at offset 0. A
    tooling card should find the source. Pip's optimiser run at offset 0 also stalls 2.97 h at zone 17, which #229 fixed for a
    first-time hero. Nothing below zone 19 changed here, so it is a reshuffle, but `boss-balance-pass` should check it.
  - The active and casual personas do not move, and the long run passes. If either persona moves, or a new stall over an hour
    appears below zone 19, re-judge.
- **Walks.** Run both walks (seeds 1 and 2, 75 game min) on the final build. Walks run on the builder's first build (zone 20 knots,
  hpFloor 1.25) do not count. Pass: each walk reaches zone 19 at the z16-wall times (55:04 and 59:38; nothing before zone 19 changed),
  loses no try in zones 1-18, and clears zone 19 within 4 tries. If a walk needs 5 or more tries at zone 19, or has not cleared it by
  75:00, do not merge: re-judge. A walk that reaches zone 20 will lose there; record it as the follow-up's evidence, not as a fail.
- **Switch off.** Put the zone 19 knots back (hpX 4.8, hitX 1.04, hpFloor 0 from zone 19, Tobin heroHitX 4.99, riderX 1 at zone 19),
  drop the two gaps and make z19-boss-arrival a report row again. No save change.

Veto phrase for Cal: "put the zone 19 boss back" (undoes the whole pick). "No rider knot at zone 19" undoes only riderX: the knots
stay and zone 19 reads about 13% a try for a first-time player (16/6/16), still a wall.

### Zone 20 wall (z20-wall) (2026-10-08)

Ruled by an Opus high judge in three rulings (PR for card `z20-wall`); Cal can veto any line. Data: the builder's runs (100-240 fights a
row, seed offsets 0-4), re-run by the judge on offsets 1-5. The card first had to decide where the "gear matters" checks live once the
first-time knots reach zone 20, as the z19 ruling asked.

- **Why it walls.** Every boss from zone 20 to 26 read 0% a try for a first-time hero (level 23 at zones 20-22 and 24 at 23-26, tier 1
  common +0, no mastery stars): the zone 20-24 knots were fitted to the kept-up hero. The z19-wall walks lost at the zone 20 boss and were
  still there at 90:00; the 10-hour bot stalled there 5.3-7.2 hours.
- **Ruling 1: fit zones 20 to 24 in one pass, stop before the zone 25 Champion.** Fixing zone 20 alone moves the 5-7 hour wall to zone 21
  (the "buys one zone" trade the z19 judge turned down). In `TURN_TUNE.boss`: hpX 2.8/1.9/2.1/1.5/1.1 to 0.01625/0.01125/0.00775/0.0055/
  0.00375 (a 1.44-a-zone ladder; the fight is gate-bound at about 4.8 turns, so hpX barely moves wins), hitX 0.751/0.424/0.314/0.238/
  0.255 to 0.023/0.0161/0.01067/0.0067/0.00611, hpFloor 0 to 1.3 at zones 20-24 (0 from 25), Tobin's heroHitX 6.3-8.4 to 2.75/2.75/2.4/
  2.4/2.75. Moves, timing windows, parry and dodge, the hit cap, rally gates and boss pay do not change. Zone 25 on keeps its knots.
- **A tick cap instead of a riderX row per zone (`dotCap` 0.07, zones 20-24).** A boss's Bleed, Burn or Venom tick costs at most 7% of the
  hero's own max HP, the "about 7% a tick" the z16 and z19 rulings chose. On knots alone z22 (Venom) and z23 (Bleed, Blind) read 36/18/38
  and 30/13/37; with the cap 63/47/69 and 63/51/71. On a kept-up hero a tick is about 1.5% of their health, so the cap does not bind.
  riderX stays 1 from zone 20; the z16 and z19 riderX rows do not change.
- **Floor room.** At hpFloor 1.0 a kept-up Wren who never defends wins zone 21 100%; at 1.15 every hero reads 0 at zones 20-24. 1.3 keeps
  0.15 of room, as z19 took. With every floor 0.15 lower a player who never defends wins 7% at most (Tobin, zone 23).
- **Ruling 2: Pip's boss-hit share 0.9 at zones 20, 22 and 23** (`heroHitX.pip` `[[1, 1], [19, 1], [20, 0.9], [21, 1], [22, 0.9],
  [23, 0.9], [24, 1]]`). Without it a first-time Pip read 52-57 at zone 23 whatever hpX did, and 54-61 at zones 20 and 22, on the edge of
  the gate. A per-hero knot like Tobin's ("heroes differ on purpose"): a landed hit still costs her 1.17 of its share of her health. Not
  picked: a lower dotCap at zone 23 only (lifts Wren and Tobin more than Pip, and halves the 7% tick), Pip at zone 23 only, or a Pip gap.
- **What a first-time player gets** (casual Wren/Tobin/Pip, arrival footing, 5-offset baseline): z20 70/81/69, z21 78/72/74, z22
  68/68/69, z23 71/60/64, z24 80/67/71. Good players 100. A player who never defends 0. The walk bot's player 88-97. `z20-boss-arrival` to
  `z24-boss-arrival` are gated Captain rows; z25 and z26 stay report rows (0%, the next wall, left to `boss-balance-pass`).
- **Where the gear checks live: both a gated check at the first kept-up zone and a report row on the arrival footing.** Once a zone fits
  the first-time hero, every landed hit sits on the hpFloor (a share of the hero's own health) for everyone, so a kept-up hero a tier
  behind loses almost nothing there (z20 drop 3/3/7 against a 10-60 band).
  - `z20-boss-behind` becomes a report row (kind `reportBehind`) and its three `gear-weight` gaps go. A gated `z25-boss-behind` replaces
    it: a tier behind costs 72/72/54 points at the zone 25 Champion, as it cost at zone 20 before (gaps above for Wren and Tobin,
    `gear-weight`, until 2026-12-01).
  - The joined row and the three build rows move from z20-boss to z25-boss (`z25-boss-joined`, `-might`, `-vigour`, `-focus`; report
    only). `z20-normal-focus` stays.
  - New report rows at zones 20 and 24 (kind `arrivalGear`) show what gear is worth on the arrival footing: nothing worn costs 29/4/20
    points at zone 20 (29/5/18 at 24); tier 2 common or tier 1 rare +5 adds up to 12 (nothing for Tobin).
  - `check.mjs` C29 "mid-game HP": the first assert (a boss hit's cost by zone band) stays and passes with zone 20 in its list (27-29% a
    hit, 60-65% a charge). The played and gear asserts move to zone 26 on the hero as built (not scaled to the reference Attack), with
    their thresholds unchanged: zone 26 is the first kept-up Captain past the fitted span. A card that fits zone 26 re-judges where they
    live; their margins are thin (a tier behind's charge 50.9% against "over half", Tobin casual 92.9 against 95).
- **Kept-up z20-24 is too easy for a geared casual:** 79-98 against 60-80. Gaps above, all heroes, `boss-balance-pass`, until 2026-12-01,
  as at zones 15-19 (ratcheted to 0.92/0.98/0.91/0.89/0.95). Good 100 and never-defends 0 stay gated. Tobin's arrival cells at zones 22-24
  sit under his band (gaps below, `tobin-safety-margin`, limits 0.68/0.6/0.67, the baseline).
- **Zones 1-19 and 25 on are unchanged.** No knot, riderX row or gate outside zones 20-24 moved.
- **Risks the judge named.** Gear barely matters from zones 13 to 24 (a landed hit sits on the floor whatever you wear; 5-20 points on
  the arrival footing); making gear count under the floor belongs to `boss-balance-pass`, and if testers say crafting feels pointless in
  the mid game, this is the reason. Kept-up Pip gets a little easier at zones 20, 22 and 23 (81-85 to 90-91). If a Pip who never defends
  ever wins at zones 20-24, or a boss move or rider there changes, refit or drop the Pip knot.
- **Ruling 3: health re-baselined, the stall band at 2.9, the next wall carded.** The bots now pass the zone 20-24 bosses: zoneEnd 20
  to 22.67, longest stall 25,137 to 15,637 s, and no stall over an hour is at a zone 20-24 boss. They meet the next wall at zones 21-23:
  ordinary foes the hero cannot beat at level 25-27 on tier 2-3 gear (on the arrival footing they read 0% casual at zones 21-24, 0-46 at
  18-20; kept up on tier 4 rare +5, 98-100). The 10-hour bot's gear tier stays at 2.4-2.6 all ten hours. It is an existing wall met sooner,
  as at z19. More, shorter stalls raise `optimiser.stallCount` from 4.93 to 7.33 (offsets 0-4: 8, 5.67, 8, 7.67, 7.33; sd 0.97; the
  judge's offset 5: 8.33). Wipes an hour 49 to 79.7 (report only; mostly Wren and Pip on those foes).
  - **`optimiser.stallCount` abs goes from 2.4 to 2.9**, the larger of 1.3 and three standard deviations, as `docs/design/health.md`
    and the z19 ruling ask. The card's prediction (the band back to its old value) is missed for this reason.
  - **The offset-0 "longest stall under 4 hours" target is waived** (Tobin 5.68 h at zone 22, ordinary foes), on the condition that no
    stall over 4 hours sits at a zone 20-24 boss.
  - **Not picked: fitting ordinary foes (`normHitX`) here.** It is not this card's lever, and the cause may be the gear climb or the
    bot: its `farmZone` never farms the frontier tier (`tools/sim.mjs`), so a bot that cannot kill at its top zone may never earn tier 4.
  - **Owner: a new card, `z21-foe-climb`** (until 2026-12-01). It first decides whether the game (no reachable tier 4 by zone 21), the bot
    or the ordinary-foe knots are wrong, then sets the band back to max(1.3, 3 sd) and holds every hero's longest optimiser stall under 4 h.
  - **The 50-hour run, re-baselined** (3 offsets): the same story. Zone at hour 10 goes from 20 to 22.11 and falls an hour from 61 to
    84 (both past their old tolerance, so the long section is re-baselined; tolerances unchanged). Zone at the end 28.56 (was 29), the
    longest stall 64,208 s (was 59,975), stalls over an hour 7.56 (was 7.55): the zone 25 Champion is the long wall, as before.
  - **Watch items, carried forward.** Stalls of 1.0-1.5 h at zone 19 (Wren offsets 0 and 5, Pip offset 4) and Pip's 2.2-3 h at zones
    17-18 predate this card (nothing below zone 20 changed); if the old code had no zone 19 stall over an hour at those offsets, re-judge.
- **Walks** (90 game min, the bot that keeps fighting after a loss; this card's knots on the integration branch at b79b3f65): seed 1 Wren
  reached zone 19 at 47:30 and zone 20 at 56:53 and cleared it on the first try at 68:44; seed 2 Tobin reached zone 20 at 72:18 and
  cleared it on the first try at 87:49. Neither lost a try in zones 1 to 20. Both end in zone 21 at level 23.
- **Switch off.** Put the zone 20-24 knots back (the old hpX, hitX and Tobin heroHitX above, hpFloor 0 from zone 20, Pip's heroHitX 1,
  dotCap off), make z20-z24-boss-arrival report rows and z20-boss-behind gated again with its old gaps, move the joined and build rows and
  C29's two asserts back to zone 20. No save change.

Veto phrases for Cal: "put the zone 20 bosses back" (undoes the whole pick). "Keep the stall band at 2.4" undoes only the tolerance. "No tick cap" undoes only dotCap: zones 22 and 23 then read
about 30-36% a try for a first-time player. "No Pip boss knot" sets Pip back to 1: zone 23 then reads about 52-57 for a first-time Pip.
Follow-up: the card `z21-foe-climb` found the health bot defended only a move's first hit; see "Zone 21 foe climb" below.

### Zone 21 foe climb (z21-foe-climb) (2026-10-08)

Follow-up to "Zone 20 wall" ruling 3, ruled by an Opus high judge (PR for card `z21-foe-climb`); Cal can veto. Evidence:
`docs/proof/z21-foe-climb/evidence.md` (optimiser and 50-hour runs on five offsets each, before and after).

- **The bot was wrong; the rest of the wall is the gear climb, sent to the balance pass.** The health bot (`tools/sim.mjs`
  `turnPlayer`) keyed its defence on the turn, so it defended only the first hit of a move of several hits (`59k-turn.js` keeps
  turn `n` across a move's hits). The walks (`walk.mjs`) and the budget sampler defend every hit and were never affected, so the
  z13-z20 boss fits stand. The fix keys the defence on the hit too. Pressing every hit then made the bot press every boss feint
  (fooled every time) and time every held swing perfectly, so it now reads a trick as the sampler and the walks do (read 0.3 +
  0.6 x avoidance, about 0.78; else it presses early). No game file changes.
- Optimiser, five offsets: longest stall 15,637 to 12,568 s; runs with a stall over 4 h 7/15 to 3/15 (offset 0 Tobin 241 min z24,
  offset 2 Wren 267 min z23, offset 3 Pip 315 min z23); zoneEnd 22.67 to 24.67; wipes an hour 79.7 to 51.3. The bot no longer
  stalls at zones 17-19 (the z20-wall watch items).
- Health is re-baselined for every persona and the long run (the game did not change; the first-hour game measures held: active
  first boss 68 s, casual zoneEnd 12.33, active zoneEnd 16.33). `optimiser.stallCount` 7.20, abs 2.9 to 2.1 (three sample sd of
  the five offsets). 50-hour, three offsets: zoneEnd 30.67, longest stall 50,219 s, stalls over 3 h 5.22.
- **Missed:** the card's prediction (stallCount back near 4.93): the bot passes more zones, so it meets more stall points. The
  offset-0 "longest stall under 4 hours" target (offset 0 is 225/241/220 min; 3/15 runs over 4 h, all at zones 23-24). The
  acceptance "no 3 h+ stall at zones 21-24": 9 of 15 optimiser runs (3.0-5.3 h); the 50-hour run's offset 0 still stalls 3.5-4.4 h
  at zones 21-24 and 16-17 h at zone 25.
- A first ruling (same day, before the PR review found the feint problem) had read 0/15 runs over 4 h and the target restored;
  this ruling replaces it.
- **Cause of what is left:** ordinary foes from zone 19 scale to a tier 4 rare +5 hero at road level (`refHpX`, `refAtk`). Tier 4
  needs gathering 64 and a station at 36, and a 10-hour player has 22-24; from level 25 a level takes 390 fights.
- **Not picked:** a 0.25 cap on an ordinary foe's hit at zones 21-24. It moves the wall to zone 25 (5/15 runs over 4 h, offset-0
  Wren 4.8 h) and makes gear count for less.
- Report rows `z20-normal-bot` to `z24-normal-bot` (kind `reportBot`: arrival level + 2, tier 2 rare +5, with the bot's own
  defence) show the wall.
- **Owner `boss-balance-pass`** (the overhaul balance pass), until 2026-12-01: refit `refHpX`/`refAtk` for ordinary foes at zones
  19-24 to the gear a 10-hour player can reach after the crafting overhaul, or open tier 4 sooner, so that every optimiser run's
  longest stall is under 4 h and none is 3 h+ at zones 21-24. Pull it ahead if players get stuck there first.
- Watch: Tobin's active hour fell after the trick read (zoneEnd 14.2 to 13, longest active stall 701 to 1007 s). Re-judge if a walk
  shows a Tobin stall of 15 min or more before zone 14.

Veto phrases for Cal: "cap the zone 21-24 foes" (adds the 0.25 hit cap at zones 21-24 on top of the bot fix). "Bot presses every
feint" drops the trick read and puts back the earlier numbers (abs 2.0).

### Rally gates are live (rally-gates-live) (2026-10-08)

Ruled C by an independent Opus high judge (`autopilot/rulings/2026-10-08-rally-gates-live.md`); Cal can veto.

- **Rally gates are live (rally-gates-live, judge 2026-10-08; Cal can veto).** Since #160 the live fight skipped every gate
  (59k:1164 read the previous foe's HP). The gates stay, the order is fixed, the rally shows on the boss bar, and z7-12 are
  refit on the arrival footing with gates on. z13-34 keep their sampler-fitted knots, are re-measured, and wait for the balance
  pass. This supersedes "a sampler gap, not a footing one" (z13-arrival-footing). Veto: "Turn the rally gates off".
- **The rally on screen.** The boss bar marks each gate from the start of the fight; the mark it holds at turns gold and a passed one
  fades. The line says "Rally! It holds at the mark until its next move ends." (with "Only a Stun breaks its charge." only while it
  gathers a charged move), and "Rally over. Your hits land again." when it opens. While it holds, the turn label reads "Rally: it
  holds at the mark" unless a charged move's own line needs it.
- **The refit (zones 7-12 only).** hitX, hpX, hpFloor and Tobin's heroHitX, fitted with the gates on to arrival-footing casual in band;
  no move, window, gate share or pay change. Landed hits sit on or near the hpFloor, which holds the kept-up never-defends player under 10% (0% measured).
  Tobin's heroHitX moved at 8, 10, 11 and 12 (1.7 to 1.5, 2 to 1.8, 1.25 to 1.5, 1.75 to 1.6) to keep him in his +10 band.
  Knots z7-12: hpX 0.95/0.7/0.4/0.35/0.4/0.2, hitX 0.9/0.5/0.3/0.25/0.2/0.12, hpFloor 1.03/1/1.1/1.3/0.95/1.2 (were hpX
  1.075/0.95/0.75/0.725/0.882/1.008, hitX 1.5/1.055/0.632/0.45/0.407/0.403, hpFloor 1.03/0.84/0.92/0.95/0.94/0.82). The zone 10
  Champion keeps the most HP of zones 7-12 (the Champion peak check). Arrival-footing casual Wren/Tobin/Pip, 240 fights a row: z7
  82/88/85, z8 80/81/90, z9 82/88/76, z10 53/52/48, z11 65/80/74, z12 62/75/66; good 100 on every row. Numbers: `docs/design/difficulty-budget.md`.
- **Walks** (seeds 1-3, Wren, Tobin and Pip, 90 game minutes; each stopped on the 60-minute clock budget at game minute 81-83):
  every boss from zone 4 to the last one reached (zone 20, 22 and 19) started at gate 0, played all its rallies and fell on the
  first try. Zones 7-12 took minutes 18-31. Zone 20 at 62:38 (Wren), 49:18 (Tobin) and 65:40 (Pip), against the z20-wall walks'
  56:53 (Wren) and 72:18 (Tobin). Movement at zones 13 and up goes to the balance-pass row "Rally gates were off on live bosses".
- **Health parity baselines are the mean of each offset's parity, not the parity of the mean** (rally-gates-live, judge 2026-10-08;
  the tolerance is unchanged; the 50h section keeps the old value until its Pip goldSpentShare fail is fixed). This raises the
  active parity reference from 0.21 to the offsets' mean. The 50h section is not rewritten here: it did not move, and a rewrite would bake in
  Pip's goldSpentShare 0.87 (a real fail, already on the base build). Rewrite it when that fail is fixed. Veto: "Put the old parity baseline back".

Veto phrase for Cal: **"Turn the rally gates off"**: set `gate.on = 0` and refit every boss from z4 to z34 in the balance pass.

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

- **Browser first** (Cal, 2026-10-08, plan "Go" at 11:59): design for a desktop browser at 1280x720 CSS px with mouse
  and keyboard; it must look good at 1920x1080 and fit 1366x640. Landscape phones (740x360) and tablets (1024x768) play
  without clipping; phones held upright (360x740) must not break, but new features need not be designed for them.
  Why: "Browser will be our primary. It means our art can be more detailed and our menus can be better structured."
  Rule in `CLAUDE.md` (#234); sizes in `docs/design/layout.md`.
- **Game-first layout:** the game is the main view; each tab opens a full-screen menu over it. (2026-09-27)
  Landscape only on mobile (2026-09-29): replaced by **Browser first** (2026-10-08, above).
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
- **Desktop layout (desktop-layout-spec, Opus high judge, 2026-10-08; Cal can veto):** On screens 1200 px and wider, text and chrome grow in two tiers. Desktop 1 is landscape at 1200x600 or more: text x1.15, never under 14 px. Desktop 2 is 1600x900 or more: text x1.3, never under 15 px. The rail, top row, side column and action bar grow with each tier; icons stay at their native sizes. Phones (740x360, 360x740) and 1024x768 do not change. Text grows through one build step (`scaleText` in tools/build.mjs), not CSS zoom, so pixel art stays on whole pixels. The menu stays a panel over the stage, two thirds of its width (560 to 1040 px). A sheet opened from Hero > Gear, the bag, the hero card or a gather node docks into the panel's right half next to the list and blocks nothing. Gather and Craft > Make show the list and detail side by side. The bag at 48 px and the gear row at 96 px start at Desktop 2. Keys 1 to 5 open and close Fight, Hero, Gather, Craft and Camp; letters stay fight keys. Every "Tap again" becomes "Confirm: ...". Hover tooltips (next, P1), the upright tablet and the other menus' desktop layouts wait for their own cards; this departs from the approved browser-first plan. Spec: `docs/design/desktop-layout.md`. Veto phrases: "Hand-write the desktop text sizes", "Floor back to 13", "Big icons from 1440", "Split the stage for menus", "Rebuild the menus inline", "Tooltips and tablet in v1", "Tablet gets the landscape menus now", "Letters for tabs", "Keep Tap again".
- **Claude decided: a fighter is told what the Forge needs (card forge-line-while-fighting,
  Opus judge, 2026-10-08; Cal can veto with "no Forge line while fighting").** On a wide view, Hesketh's materials line shows on Camp
  and Gather even with the fight beside the menu, and never pauses it. A fighter who has not seen a materials step's line hears it
  once, held in the gap after a kill, with its Go (a say: mark, no save field, at most one a minute, never for gold or essence alone).
  It still never shows over Hero, Craft or other menus.

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
- **Art unblock: one trial pack, result: dropped (Cal's ruling 2026-10-07 19:28 "Trial one pack"; judge ruling 2026-10-07):** Claude
  could draw ONE whole area pack alongside Codex (area 1, Mossy Hollow: its battle background and five zone monsters), if the Opus
  art judge passed it within 2 rounds and `@codex review` found no style mismatch, behind the Classic art switch. Round 1: re-brief
  (flat shading, foe contrast on the lit road, designs, effects). Round 2: **fail** (scores: background 6, Thorn Imp 6, Gloomjaw 5,
  Ravager 4, Thornwing 3, Sorcerer 3). Reasons: the monsters did not reach the heroes' level of detail and three of the five (Ravager,
  Thornwing, Sorcerer) were clearly below the bar; the background was judged a step up on the Codex painting but still had brick-like
  trunks, sausage branches and a regular cobble grid. So the pack is dropped and Codex keeps art; nothing was wired into the game and
  CLAUDE.md is unchanged. The generator source stays in `art/area-1` (not wired, not embedded) as a starting point; the wired version
  is in this branch's history (commit "full wired pack as judged in round 2"). Judge notes for any polish: real faces and anatomy,
  recognisable weapons, a real opening and snapping Gloomjaw mouth, tapered forked branches, irregular cobbles, a darker floor band.
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
- **gear-icons-48 (Opus art judge, 2026-10-08): wire.** Cal said the 24 px gear icons lose the epic feel. Codex already exported
  every gear icon at 48 px with the owner-approved game-v2 pack, so 48 joins the GEAR_ICONS sizes for grades 1-5 (110 icons), bytes
  as exported, nothing redrawn. Worn gear shows at native 48 px in a 56 px tile (Hero card row and the Gear view); the item card
  shows 96 px (48 at x2, hard pixels); the bag stays at 32. The judge checked all 110 at 48: sharper and easier to read than 24 or
  32, and they match the rest of the pack. Flag: staff-g4 (the red staff) has stray specks at every size; Codex should re-export
  it, and it ships as is until then. The page grows about 365 KB (to about 8.3 MB of 16 MB). The 32 px fallback was turned down
  because it keeps the blur Cal complained about. Switch off: take 48 out of the sizes list in `tools/art/embed-icons.mjs` and
  the tiles fall back to 24 at x2.

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
- **Captain spoils are a move pick, not a reward pick (boss-spoils-pick, Opus judge 2026-10-08;
Cal can veto with "No move pick at Captains").** A zone boss's first clear in zones 6 to 10 that drops a Scroll lets you learn one of up to
three moves it can teach now, or keep it; there is no pick when fewer than two can be learned. Caches still pay no materials and add
nothing; no economy or save change. A cache with a pick is a big card.
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
  Built (starters-join-when-met, 2026-10-08): the save field is `S.party.unlock.startedAs`, default `''`. Only the picker's Begin on a
  real new game writes it (`heroBegin`: no hero chosen, no kills, zone 1, nothing recorded), so every old save and every Mirror of Embers
  keeps `''` and all three starters. Any other value reads as `''`. A starter is yours when `startedAs` is `''`, you began as them,
  `S.party.unlock.heroes[id]` is set, their Champion's zone is cleared (`S.maxZone` above it), `joinOnMeet` is false, or they carry the
  lamp now. The Champion's zone comes from the meet scene's data (`STORY_BEATS.npc[id].at`), so the join sits where the scene plays.
  The join line rides the Champion card. Exception: with the Champion card or the story off, or for a Champion cleared while away, a
  toast says it instead ("Tobin joined your camp while you were away."). The meet scene of the starter you began as never plays.
  Each join holds the spacing governor for `ONBOARD_TUNE.gap` (the first opens a `switch` row, later ones stamp the clock). The Codex
  opens on arriving at zone 10, before the Cantor falls, so the zone 10 join holds the unlock after it, not the Codex.
- **Unlock gap 90 s, F4 counts released unlocks (unlock-gap-trial, Opus judge 2026-10-07; Cal can veto).**
  `ONBOARD_TUNE.gap` goes from 60 to 90. F4 (at most 2 new things in any 3 minutes of the first 30, 4 in any 10 after)
  now counts only what the spacing governor releases; a thing a player act or a drop opened (its row's `now()` true) is
  listed, not counted. Player acts and drops never wait. Why: no gap spaces the player's own acts, so the old F4 stayed
  red whatever the gap (gap 120 still showed 4 in 3 minutes, a found Star). 60 s allowed 3 released unlocks in 3 minutes;
  90 s is the smallest gap that allows at most 2. Check bounds: Gather within gap + 4 s of the first boss (94 s), the fire
  stays within 150 s (measured 93 s), Next Up within 6:00 (was 3:00; measured 5:32), warm Bounties by 8:30, Bestiary and
  Almanac by 13:00. Cost: Next Up arrives about 2 minutes later and the first ten minutes hold fewer tabs. Outside
  evidence (inference only; the wikis could not be fetched): idle games such as Cookie Clicker, Melvor and IdleOn gate
  unlocks on player action or thresholds, never a wall clock, and show about 4 to 6 new things in 10 minutes (90 s gives
  8, one silent; 60 s gave 11). It supports keeping acts off the clock and decided nothing else. Replaces the 60 s gap
  of story-unlock-gates. Files: `docs/design/unlock-pace/judge.md` (prior), walk data in the PR.
- **F3, the shape of the first hour** (f3-restate, Opus high judge 2026-10-08; Cal can veto: "put the five-minute moments
  back"). Zones 1 to 10; replaces the 2026-10-06 wording. (a) **No dead stretch.** On the casual walk, never more than 8
  minutes without a progress moment, up to the zone 10 Champion (or minute 60, if that comes first). A progress moment is a
  zone's first clear, a new ability, a Star, a hero joining or a unique. Level cards, hero lines, looks and crafts do not
  count: a grind or a wall makes those on its own. (b) **Three peaks, rising.** The first boss win and its cache (F2), the
  zone 5 Champion with the first companion, and the zone 10 Champion closing the chapter. Each has its own big card that says
  what it gave. A casual person reaches the zone 5 Champion by minute 30 and the zone 10 Champion by minute 60. Later is a
  miss; earlier is never a miss and never a reason to slow the game. (c) **Every big card says what it gave.** A tester can
  name what each big card gave them. F3 sets nothing past zone 10 (the 2026-11-02 review does). "5 to 10" in older cards means
  zones, never minutes. F3 alone is never a reason to keep, add or fold a card. Why: no source gives a big-moment interval,
  and the 8-minute cap is well supported; every gap the old floor flagged was a stall with its own fix, and the floor was being
  used to defend cards. Level cards and hero lines fire during grinds and losses, so they cannot reset the cap. Until the
  walk scores (a), the Sunday hold reads F3 by the longest gap to the zone 10 clear and the 5:00 floor is report-only.
  Prediction: on the walk after `rally-gates-live`, seeds 1 to 3 show no gap over 8 minutes between progress moments up to the
  zone 10 Champion; the next desk, panel or human run clears zone 10 by minute 60 and asks what a big card gave 0 times (desk
  run: 2). Coverage areas 2 and 3. Docs only, no save change. Ruling and red team:
  `docs/design/first-hour-records/2026-10-08-f3-restate.md`.
- **F1 after the staged lesson** (coordinator, 2026-10-08, on the planner's recommendation; Cal may veto). Cal's staged first fight
  (#197) holds fight 1 for its lessons, so the first gold lands at about 0:19. Keep the lesson. F1 now reads: "the first press gets a
  hit with its sound within 10 s of the first tap, and the first loot (gold, loot or XP) within 30 s". Why: F1 exists so something
  good happens fast, and a hit with its sound inside 10 s does that; the lesson was Cal's own ask. Measured by `tools/walk.mjs`
  (`first-hour-map-two-clocks`).
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
- **Cal delegates design calls to Claude** (an Opus judge after a red team); Cal keeps shipping, the online layer, money
  and outside contact, and can veto any recorded call later. (2026-10-05)
- **Autopilot:** Claude plans, builds and merges into the integration branch on its own from the backlog, with a daily
  digest. No batch waits for Cal. Only these wait for him: "ship it" (merge to `main`, publish the live artifact), the
  online layer, Netlify beyond the weekly deploy, money or legal, network settings and contacting anyone outside.
  (2026-10-05, updated 2026-10-07)
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

- Guide: "one thing a fight: one paused step a fight; Dodge waits for a later fight than the ability, Parry for a later fight than
  Dodge" (guide-voice, 2026-10-07) -> the staged first-fight lesson, every verb as it first comes up, with the fight held
  (cal-0107-staged-guide, 2026-10-07, Cal's play notes 3 and 12).
- Opening: Hesketh's fire ends "Wood first. Then we talk." (intro-and-picker, 2026-10-06) -> it ends on the foe coming up the road;
  the wood-then-talk promise is his Gather line (cal-0107-staged-guide, 2026-10-07, Cal's play note 2).

- F3: "Minutes 0 to 20: a big moment at least every 5 minutes, no gap over 8. From minute 20 to the zone 10 Champion (or minute
  60): a big moment at every zone's first clear from 5 to 10" (early-game judge, 2026-10-06) -> F3, the shape of the first hour:
  an 8-minute cap on progress moments, three peaks, every big card says what it gave (f3-restate, 2026-10-08).
- Autopilot: "Cal approves batches and taps gated items" (2026-10-05) -> no batch waits for Cal; design calls go to the Opus judge
  (2026-10-05, Cal's autonomy request; recorded 2026-10-07).
- Owner role: art direction asked of Cal (2026-09-27) -> art direction is a judge call (2026-10-06).

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
- No forced landscape (2026-09-27) -> landscape only on mobile (2026-09-29) -> browser first, phones and tablets still
  work (2026-10-08).
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

## Compass: judge rulings (2026-10-07)

Claude decided (card f-compass; Cal can veto any line). Page: `docs/design/compass.md`. Records:
`docs/design/compass-records/redteam.md` (21 attacks) and `judge.md` (Opus judge, four rulings).

- **The hook** is the first-hour hook with its second sentence made true at every first boss clear: a Lantern Cache opens
  with what you won, a chance at a new look, and the next stretch of road. No text may promise a relight or new gear at
  every boss. The camp line is the promise behind the hook, not part of it. `first-hour.md` points to the Compass.
- **The core loop** has four timescales (a fight, a 5-minute visit, a day, a week), four player steps each, each step naming
  its systems. Steps match the standing rules: no telegraph, Assist only widens windows, a loss keeps your place. The week's
  last step is going deeper (Deepwell, later challenge modes), not a weekly-build visit.
- **The test every card passes:** it names its loop step and pillar; it hits no anti-goal; its score has Compass fit at
  least 3, Value (Impact + Evidence + Fit) at least 9 and Total at least 14. A save change counts once, under
  Reversibility. Bug fixes and broken promises skip scoring.
- **Anti-goals** add the settled no's, the currency and camp-tour ceilings (no new named currency, no added camp tap; the game is
  already over both), and "chore" means an expiring reward, not a fee the player chooses.
- **Pillar 3** does not ban per-hero content (heroes ship complete); a design that needs it says it costs 32 times over.
- **Rejected:** an "early game first" tie-breaker double-counts nothing, so it stays.

## Counters and layers: judge rulings (2026-10-07)

Opus judge, card `counters-and-layers`. No save field changes, no save key bump: every merge is display-only or a rule
change over existing fields.

1. **Eight core counters** the player sees as points or money: Gold, Essence, Materials, Level (XP), Attribute points,
   Star points, Scrolls, Embers (online, untouched). Ore, wood, crystal, fibre, herb and hide read as Materials (grades
   stay: they are item tiers). Trophies and Mirrors of Embers sit in a "Rare finds" row. Talent points are dropped. The
   rest are not money: meters (Skill XP, Gatherer XP, Tool mastery, Renown), scores (Achievement points, Lantern Light,
   Stamps), flags (boss tokens), a timer (Oil), gear (Relics, Uniques) and Depth Marks (a Deepwell-only token, a 9th
   currency inside the Deepwell; folding it in needs a save step, so it waits).
2. **Essence is one pile.** Any grade pays any Essence cost, lowest grade first (`essHave`, `essPay`, `matOwn`, `matPay`
   in `40-rules.js`). Grade gates nothing; costs keep their unit counts. A drop into a full grade spills into the next
   grade with room. Transmute is retired for Essence only. Cost lines say "Essence", never a grade.
3. **Talents are a free A | B toggle** (no talent points). `S.abil.tal` is kept as is; no default pick is written.
   `budget.mjs` now fights with talent A on every owned slot (`--talents none` is the old talentless hero). Measured
   (240 fights a row, PR 2): casual means move 0 to +4 points (z30 Captain Wren 65 to 68, z38 Captain 78 to 82), turns a
   won fight fall 3 to 10%, no row changes band, so no boss was retuned.
4. **Star points are a per-hero budget and the only limit on lit stars** (PR 3, built). `starPoints(hero)` = 2 + 1 per 10
   hero levels + 1 per Great Lantern + 1 per complete constellation (`STARS_TUNE.budget`); `litMax` is gone. Measured with
   `budget.mjs` (typical Stars): no casual or good number moves more than 1 point. The 2-lit cap goes and income is
   re-curved. Old saves keep every lit star; one the points cannot pay for shows as dim with a Put out button.
5. Build order: Essence fungible (#123), free talents (#128), star budget (#130), layer and display cleanup. The last one
   tags every currency in `tools/systems-map.mjs` with a Kind (the check fails on an untagged currency or a core set that
   is not these eight), registers Attribute points, and shows Mirrors of Embers beside Trophies as "Rare finds" in the
   Storehouse. The top bar already shows only Gold and Embers; no screen needed a cut.

## Milestone 1 (2026-10-07)

Card `m1-define`; Sonnet red team and Opus judge in `docs/design/milestone-records/`. Page: `docs/design/milestones.md`. Claude
decided; Cal can veto any line.

- **M1 is "The Hollow, finished", split in two.** M1a is zones 1 to 15 (three areas, three Champions); M1b is zones 16 to 35 and
  the Fenmother. M1a contains the first hour (M0) and has eight exit criteria with named checks. Earliest close 2026-10-19.
  The split lets a paused art lane stall the art, not every planner. Re-plan trigger: if the Codex lane is still paused on
  2026-10-21, or fewer than 2 vetted packs land in the first 4 weeks after it resumes, M1a's art criterion is cut to zones 1 to 10.
- **Monsters may share a body within their area (Claude decided; Cal can veto).** Each zone keeps its own named monster, moves and
  look. Codex may draw it as kin of another monster in the same area: the same body with its own palette, marking or prop, and any
  pose its moves need. Champions stay their own creatures. Only Codex draws kin, Captains, Champions and background versions,
  inside whole vetted packs, and Claude only wires them. No agent recolours or tints art in code; the Deepwell cold palette stays
  the only runtime recolour. This narrows "Each zone has its own monster" (2026-10-01) to "its own named foe, not a new species".
  "Poses follow the moves" and the art freeze are unchanged. This also relaxes "one pack per monster" in `art-backlog.md`: a pack may be an area sheet. `CLAUDE.md` is unchanged. The Hollow costs 17 packs; 1.0 is estimated at about 110 packs
  instead of 215 species (an estimate, not a commitment).
- **Bare heroes lose to bosses (Cal's 2026-10-07 direction, made a gate).** Judge numbers at Champions 10 and 15: bare casual 5 to
  25%, good play at most 70%; gear opens a gap of at least 40 points, first crafts at least 25. Zone 5 bare casual 20 to 50%.
  `boss-tiers-pr2` may tune them with a DECISIONS line.
- **A slice passes only with zero open budget gaps** at or below its last zone; renewing a dated gap does not pass.
- **Heroes without a kit are not offered in a slice** (Bram, from zone 10, today). Saves keep anyone already joined.
- **Cards:** deepwell-turns, provings-turns (already built), budget-extras (folded into pr2), bossodds-chunk-seeds (#93),
  hero-training-policy (Training was removed) and moments-feel-spec (moment-layer replaced it) closed; ui-gather-ledger, ap-collection-counts, menu-polish, bag-slot-and-steady-charges,
  omen-dares-and-contracts, story-choices, story-scripts-2-5, story-stills and the two hero-voice proposals are OUT of M1.

## Moment cap: judge ruling (2026-10-07, Opus high; Cal can veto any line)

The check "big and medium moments in a fresh game's first 10 minutes (at most 8)" passed on some runs and failed (9) on others.

- **Cause.** Three things, none a pacing fault. (1) A Champion card could show before its cache opened, so one clear made two big cards (the fix of PR #121, now in). (2) The check drew from one seeded random stream that the page's own frame loop also drew from, and ran on the machine's clock, so drops (a unique makes a cache a big card) changed from run to run. (3) The banner window (`midRoom`) ran on `Date.now()` while the rest of the layer ran on game seconds, so on a fake clock no banner could ever show and the check could not see banners at all.
- **Ruling: the cap stays at 8; no moment is trimmed or merged.** A unique already joins its cache card, zone 1's boss and the first Star already join their cache card, and the zone 1 to 3 look caches are F3's "big every 5 minutes". Merging them would break F3.
- **The bot is not a person.** It reaches zone 14 in 10 minutes; a person is at zone 5 near minute 18, so cards a person sees apart fold into one on the bot's walk. The check now judges the shape: at most 8 big cards, at most 3 banners in any 3 minutes, at most one big card per zone clear, no Champion card while its cache is still pending, and at most one moment per zone cleared. Each of these fails on real card spam.
- **Code.** `midRoom` and its entries use game seconds. `momentShow` carries the card's zone. The check seeds drops only while the bot steps and runs the page on the bot's own clock.
- **If the banner assert ever fails,** that is real spam for a person: tighten the medium list (for example level banners only at 2, 10 and 20), not the cap.
- **Moment cap, revised (2026-10-08, Opus high judge, card staged-guide-followups; Cal can veto).** The fixed cap of 8 big cards is dropped: it held only because a 20 s guide wait folded the zone 2 and 3 look caches into zone 1's card. Without the wait the walk shows F3's nine (zones 1-3 and 5-10), one per clear. The check now judges the shape: one big card per zone clear, never a Champion before its cache, and at most 2 big cards past the zone 10 Champion or with no zone (a unique's cache, a Feat). If that fails, look for a cache or kind that turned big; do not fold first-hour cards.

## Scenery for zones 6 to 10 (2026-10-07, Opus high judge; Cal can veto any line)

Card `scenery-z6-10-judge`, from the `slice-art-manifest` open point. Record and options:
`docs/design/milestone-records/scenery-z6-10-judge.md`; red team: `scenery-z6-10-redteam.md` beside it.

- **Scenery follows the area.** Zones 6 to 10 show the Batwing Caves painting, all five, once it is vetted and wired. In
  the Hollow, a zone whose area has its own painting shows that painting; the 7-zone cycle no longer decides it. The area
  title and the scenery change together at zone 6, where the first Star lands. Splitting the area (6-7 forest, 8-10 caves),
  keeping forest to zone 7, and hard-coding zones 6-10 to `cave` were rejected.
- **This overrides Cal's 2026-10-02 call for zones 6 and 7** ("Zones 1-7 use the Mossy Hollow scenery", above), from the day
  the Caves painting is wired. His reason is inferred (the painting was the only approved background); it still holds,
  because no zone drops from a painting to procedural scenery.
- **Until an area's painting is wired, its zones keep today's scenery:** zones 6-8 the Mossy Hollow painting, zone 9 the
  procedural cave, zone 10 the procedural bone. Areas without their own painting keep the cycle, the Coast included; a
  theme with a painting draws it there, as the Mossy Hollow painting does today at zones 15, 22, 29 and the Coast's 36,
  43, 50, 57 and 64. So once wired, the Caves painting also replaces the procedural cave at zones 16, 23, 30 and the
  Coast's cave places (37, 44, ...): the same theme with approved art, outside M1a.
- **No recolour:** `zoneHue` never tints a painting. **The pack boundary is unchanged:** the Caves painting covers zones 6
  to 10 and stays in scope after the 2026-10-21 cut.
- **Code:** card `scenery-follows-areas` (S, Sonnet medium) adds `SCENERY_BY_AREA` (default on; off gives today's rule
  exactly) and moves the theme checks to a per-zone table. It merges before or with the Caves `integrate:` card; the
  painting is not wired without it. No save impact.
- **Prediction:** zones 1-15 showing their area's scenery go from 6 to 10 when the Caves painting is wired, and no zone
  1-70 changes before then. Measured by the `slice-art-manifest` check (E4, to be built) and a zones 1-70 theme assertion that
  `scenery-follows-areas` adds. Coverage area 15,
  Compass pillar 4.

- **Tobin survives best: deferred to the balance pass.** After #176, a casual Tobin wins zone bosses about as often as Wren and Pip (+1.7 points over their mean, behind both at 4 bosses). Whether he should survive best is decided in the single balance pass after the skilling and crafting overhaul (held card `tobin-margin-retune`). No numbers change now. (2026-10-07)
