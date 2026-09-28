# Plan 4: Season 1 (version 1.0): full scope (coordinator, rewritten 2026-09-28)

Everything the owner asked for or approved, grouped by area, with the build task that delivers it
(the IDs are listed in build-map.md, which holds the order and dependencies). Items marked **(done)**
are already in the game. docs/coord/wave-log.md has the dated decisions, and roadmap-review.md has the
worked numbers.

## 1. What 1.0 is

- **Season 1: five regions**, fully fleshed out with complex mechanics. The story continues in Season 2
  (the 2.0 release).
- **Season 1 ends with the first fight against the Voice** at the bottom of the Deepwell: the party wins,
  the Voice retreats deeper, and a reveal sets up Season 2. (LORE-R45, VOICE)
- **32 heroes** (18 today). Each hero gets one **Awakening**; they keep their character and style. (HQ1, HER)
- **Two named gatherers per resource job**, each with different benefits. (N1b)
- **Length:** the story (reaching the Voice) takes about **2-3 months** of normal play. Completion (all
  heroes maxed, hard Feats, challenge modes) takes **6-9 months**. It gets tuned to how fun and replayable
  the loop proves with testers. (BAL-F)
- **Deferred until after launch:** art commissions and monetisation (section 12). Art only gets fixed
  before then if something is hideous.

## 2. Combat overhaul (CB2 design, then slices S1, S6, S7)

**2.1 Enemies and bosses hit much harder** (owner). Normal packs deal about 2-3× today's damage. A boss can
kill an unprepared party in about 30-40 s at its intended power level. Fights become a real test of your
line-up, gear and play. (S6, BAL3)

**2.2 Active combat beyond parry** (owner: "much more fun and rewarding", "especially dungeons and raids").
Everything works one-handed and is optional; idle zones stay idle.

| Mechanic | How it works |
|---|---|
| Parry | Kept (done). |
| Dodge | Telegraphed attacks show a danger zone; tap to step out. A perfect dodge gives +20% damage for 3 s. |
| Stagger bar | On bosses and elites. Heavy hits, stuns and combos fill it. When full, the enemy is staggered for 5 s and takes ×1.5 damage, and a **Finisher** tap lands a class-specific big hit. |
| Interrupts | Casters show a cast bar. Tapping your ability interrupts; interrupting a boss's signature cast skips that attack. |
| Ability timing | Abilities charge. Firing into a stagger or a combo window gives a bonus. |
| Rewards | A boss beaten with active play (3+ dodges or interrupts) drops +1 buff item and more XP. Idle kills are never punished. |

**2.3 Bosses become special** (owner). Each boss gets:
- 2-3 **phases**, each with one new mechanic (adds, a wind-up, an arena hazard);
- a **signature buff item** visibly set into its body, which always drops (section 4.6);
- its own **themed unique** (section 4.7).

The Deepwell and the raid get the full boss kit first.

**2.4 Elite traits** (owner: yes). Elites roll traits: Shielded, Vampiric, Explosive on death, Summoner,
Enraged, Frozen-armour, Cursed. They get 1 trait from Region 2 and 2 traits from Region 4. Each trait has
a counter (for example holy beats Cursed, fire beats Frozen-armour), so line-up and class choice matter
zone by zone. (S6)

**2.5 Damage types and statuses** (owner: evolutions bring holy, poison and so on). The types are
physical, holy, poison, fire and frost.

| Status | Effect |
|---|---|
| Bleed | Damage over time |
| Venom | Stacking damage over time that ramps |
| Burn | Spreads on death |
| Chill | Slows the target |
| Stun | Stops the target acting |
| Mark | Target takes more damage |
| Curse | No healing; detonates |

- **Combos:** Venom + Burn = Blight, Chill + a heavy hit = Shatter, Mark + holy = Judgement.
- **Enemy weaknesses and resistances by region:** undead are weak to holy, drowned things resist frost,
  the Emberwaste resists fire, and so on.
- **Colour-blind safe:** every type has its own icon shape. (CORE-G, S1, A11Y)

**2.6 Formation** (done): the party is the Lanternbearer plus 2 heroes in Front / Middle / Back slots, with
slot jobs, combos, Kin and Bonds.

**2.7 Tactics** (owner: "tower defense vibes", after combat is substantial).
- Each hero has 3 **IF / THEN** rules; the Lanternbearer has 2.
- Conditions: boss HP, ally HP, statuses, elite traits, stagger full, cast bar showing.
- Actions: use an ability, focus a target, hold for stagger, taunt, cleanse, swap slot.
- Rules unlock through evolutions and Awakenings. There are presets for Boss, Farm and Deepwell.
- Tactics run while idle; active play still beats them. (S7)

**2.8 Hero fatigue** (owner: yes, but it must not slow progression).
- A **Rested** meter gives +10% while above half. It fades over about 10 h of fighting and refills at camp
  (away time counts).
- It is **never a penalty below normal.** Rested heroes coming back get +25% XP for an hour, so rotating
  4-5 heroes pays. (S7)

**2.9 Class balance rule** (owner). Playing a tank or support must not be weaker. Utility evolutions
(Warden, Trapper, Priest) must visibly lift the party's progress, not just survive. Parity target: all
classes within 1 zone at 2 h, day 1 and day 7, and within 15% on the days to each region boss.
Tanks and supports stay best on hard walls: bosses, pinnacles and the Deepwell. (CL1, BAL3)

**2.10 Bigger packs** (owner: reduce model size and allow more enemies; today packs cap at 3). Pack
sizes vary by foe type: 3 for big brutes, 5-6 for normal packs, 8-10 for swarms of small foes (bats, rats,
wisps). This makes area damage (Warlock, Trapper, Reaver cleaves, burns and spreads) a real class identity.
- **Scale:** the stage zooms out a step for big packs instead of shrinking everything. Swarm foes are drawn
  as smaller sprites so the party stays readable.
- **Clutter:** only the focused target, elites and bosses show full bars. A pack gets one combined bar.
  Damage numbers merge per pack.
- **Perf:** a budget per unit, pooled numbers, and baked sprites. perf.mjs must hold with 10 foes on a
  mid-range phone.
- **Balance:** pack HP and damage are spread across the members; the sim retunes. (CB2, S6)

## 3. Classes 2.0 (CL1 design, then S2 and S3)

**3.1 Three base classes by armour weight** (owner): **Warrior** (heavy), **Ranger** (medium),
**Mage** (light).

**3.2 First evolutions: damage or utility** (owner-named):

| Base | Damage evolution | Utility evolution |
|---|---|---|
| Warrior | **Reaver**: Bloodlust (hits build fury, lower HP hits harder); *Rend* causes bleeds | **Warden**: Bulwark (blocked hits store a counter); *Stand Fast* taunts and returns the stored hits |
| Ranger | **Venomstalker** (damage over time): ramping venom stacks; *Toxic Bloom* bursts them | **Trapper**: traps ahead of packs, marks that make everyone hit harder; *Snare Field* roots a pack |
| Mage | **Warlock**: spreading curses and dark fire (turning the dark's power on itself); *Hex Nova* detonates the curses | **Priest**: holy heals that overflow into shields and smite undead; *Sanctuary* |

**3.3 Evolution rules:**
- The trial opens at the **Region 1 boss** (level 60+): a solo challenge for the Lanternbearer.
- Evolving gives a **felt power spike** (about +35%): a new core mechanic, a second ability slot, a new
  look and title, and a party role.
- The choice is **permanent**, with a costly respec through the Mirror of Embers (owner: yes).

**3.4 A second evolution tier** comes after 1.0. The save format and screens leave room for it now.

**3.5 Deeper synergies and reasons to pick a class** (owner): damage types, statuses, combos, elite
counters, hero types, and Bonds that react to the Lanternbearer's class.

**3.6 Migration:** Warden saves become Warrior with Warden granted, Ranger stays Ranger, Lanternmage becomes
Mage, and Lightkeeper becomes Mage with Priest granted. Nothing is lost.

**3.7 Characters follow-up (CHAR1):** a secondary update after Core 2.0 redesigns and fleshes out the
playable characters: looks, personality, backstories tied to the lore, and how heroes react to each class.

## 4. Resource and gear overhaul (RG1 design, then S4 and S5)

**4.1 Gear by weight** (owner). Each class's gear uses two families:

| Class | Main family | Second family |
|---|---|---|
| Warrior | metal | leather |
| Ranger | wood | leather |
| Mage | wood | cloth |

The main family makes up about 70% of a recipe, the second about 30%, and small accents cross over. Every
gathering line matters a bit to every class and a lot to one.

**4.2 More tiers** (owner): **15 tiers, 3 per region**, so crafting never becomes pointless. There are
sample names per region; old tiers map across without loss.

**4.3 Resources gated by region** (owner): each region brings its three tiers. Balance is tuned per region.
Skill levels still matter for speed, yield and rare finds. Existing saves keep everything.

**4.4 Production chains** (owner): one step, running in the background at stations:

| Inputs | Station | Output |
|---|---|---|
| ore + coal | Smelter / Forge | ingots |
| hide + salt | **Tannery** (owner: yes) | leather |
| fibre + dye | Loom | cloth |
| log | Sawmill / Workbench | planks |

- **Secondary resources** (coal, dye, salt): the Lanternbearer can gather them, but they are low value for
  the hero and ideal gatherer jobs.
- Each station has a queue that runs while you are away. Gatherers can work stations as **refiners**.
- Region 1 recipes stay raw so the first hour stays simple.

**4.5 Enchanting** (owner): the way buff items are applied to gear. It unlocks in **Region 2**.
- Crafted gear has sockets by rarity (0 / 1 / 1 / 2 / 3) and otherwise only base stats.
- The Enchanting skill sets how strongly a buff applies.
- Removing a buff item destroys it unless a Salvage Rune is used.

**4.6 Buff items** (owner: class-specific, from gathering in each area; gems for mining, but not
mining-only).
- **One family per region:** Pearls on the Coast (fishing, Tide Pools), Ember-glass in the Emberwaste
  (mining); Regions 4-5 come from LORE-R45.
- **Each family has a version per weight:** heavy (sturdiness, resists), medium (speed, statuses) and light
  (power, casting).
- Rarities apply. Gatherer finder perks raise find rates (owner: about +5%), and active gathering finds
  more (owner).
- **Bosses always drop their signature buff item** (owner).

**4.7 Uniques 2.0** (owner: boss drops themed to the boss type).
- Every boss has a **themed unique**: for example a spore boss drops a poison-spreading item.
- It carries a **power** (merged with the legendary powers) and comes **pre-socketed** with that boss's
  buff item, slightly better (about +10%) than a crafted equivalent.
- Killing the boss again drops **Echoes** that raise the power.
- The **Lantern Book** collects every one.
- About 6 uniques per region, 30 for 1.0.
- Crafted gear stays within about 10% on raw stats, so a unique wins on its effect (owner rule: uniques
  weaker and rarer, 2026-09-27).

**4.8 Storehouse** (done): holds materials only, with caps sized so a full night away fits and upgrades
keep pace. The owner's rules are logged.

**4.9 Armoury** (owner): a separate building for gear. (UX-F, BT1)
- A bigger bag per level (50 base; nothing lost).
- Gear sets and loadouts for the Lanternbearer and heroes.
- Lock and favourite; an auto-salvage filter; sort and filter.
- A display rack at camp.

**4.10 Gathering pace** (done): slower levels and wider gaps between tiers.
**4.11 Tools and tool mastery** (done).

**4.12 Trade routes inside expeditions** (owner): send surplus to a town in a region you've reached. Each
town has a weekly demand list, and prices run 60-160% of base. Returns are gold or goods you can't make.
(UX-W3, WC1)

## 5. Gatherers (Hands) (N1b design, then N3, S4 and BT1)

- **Two named gatherers per job** (owner). The jobs are Miner, Coal-digger, Woodcutter, **Hunter** (hides;
  owner: yes), Herbalist, Weaver-gatherer (fibre, dye), Salter, Fisher and Gem-seeker. That is 18 now,
  about 22 by Region 5.
  - Each pair splits **Steady vs Lucky** (reliability vs rare and buff-item finds).
  - Each gatherer has a name, a lore hook, and a recruit route (Tavern, a hero quest, a secret, a region).
  - The Hollises are a pair; Tam is the free starter.
- **Upgrade trees per gatherer** (owner): 3 branches × 4 nodes, paid for with hours worked plus materials.
- **They live at camp in the Bunkhouse** (owner, done). There is a **cap on gatherers that grows later**
  (owner; data-driven beds, done).
- **No skill XP or tool mastery for the Lanternbearer** (owner, done). Gatherers earn a share of your rate,
  so your own skill still matters.
- **Gatherer screens:** Tavern board, cards, send and return, Bunkhouse, and chips on node rows. (N3)

## 6. Camp and world (WC1 design, then UX-W1-3, BT1, N2)

**6.1 Building catalogue** (gap found while mapping): every building's purpose, unlocks, costs, tree, plot
and region gate. New buildings: Armoury, Tannery, Smelter (or a Forge branch), Kitchen, Trophy Wall
(done), and fatigue rest in the Bunkhouse or an Infirmary. Weak buildings (Garden, Library, Shrine) get
merged or cut.

**6.2 Building upgrade trees** (owner: inside each building, not just its level). Each level gives one
point into 3 branches × 4 nodes, with free respec while idle. For example the Forge has Weaponsmith,
Armourer and Smelter branches. Damage nodes are capped. (BT1)

**6.3 The camp as a place** (N2):
- A drawn panorama with plots; buildings grow visibly.
- Gatherers and resting heroes at the fire; critters; day and night.
- The Trophy Wall moves into the scene.

**6.4 The World tab** (owner). Tabs are Fight · Gather · Party · Craft · **World**. World is a map for
everything that isn't fighting or gathering:
- Hollow's Rest, the Tavern, dungeons (the Deepwell, and one per region), the raid site, the Almanac post
  and the Great Lanterns;
- expeditions and trade routes sent from the map;
- travel to lit zones.

The layout is designed (ux-overhaul.md). **The map must be designed well** (owner): an art study with
3 styles for its landmarks and icons comes first. (MAP0, UX-W1-3)

**6.5 Map across five regions** (gap): does each region get an **outpost** (a forward camp with a local
town and a dungeon entrance)? Also to settle: where trade towns, dungeons and raids sit, how secrets and
events appear, and what locked regions look like. (WC1)

**6.6 Factions and reputation** (owner: maybe, once the map has real places). Optional for 1.0.

**6.7 Random events and secrets** (owner). There are 12 events at launch, at most 1 active at a time and
2-4 a day. **They wait for you** (no FOMO). Examples: a wandering merchant, a golden beetle, a lost
pilgrim, a strange light leading to a hidden mini-zone, storms, letters. Secrets are hidden zones and
bosses behind odd actions, hinted by Tavern rumours. They tie into the secret achievements. (EV1)

**6.8 Kitchen and fishing:** meals as buffs; the fishing rod as a tool. (R2)

## 7. Heroes (HQ1, HER)

- Grow from **18 to 32 heroes**, each with a home slot, a type, Bonds and a role.
- **Hero quests** (3 steps each) end in an **Awakening**: a new passive, an upgraded signature, a new look
  and title, and their Sworn Bond story. Owner: Awakenings, not branching, so heroes keep their character.
- **No XP on the bench, no rapid catch-up** (owner, done). Levelling a new hero is an investment.
- **Region 2 expects a trained-up stronger hero** (owner: yes), with a hint when your pair hits its limit.
  (BAL2.5)
- The **Full Company Feat** text changes to about 6-9 months.

## 8. Story and regions (LORE-*, R2-R5, VOICE)

- Why we fight (done): the dark hunts and smothers light, and the Voice wants the world dark.
- The Hollow's story on screen (done). Expedition lore and Omen lines (done).
- **Region 2, the Sunken Coast** is built on Core 2.0 (tide, foes, elders, the Drowned Keeper, pearls,
  fishing, the Kitchen).
- **Region 3, the Emberwaste**, with the Pyre Knight (Ser Hadric) and the Caedmon duel.
- **Regions 4 and 5** get themes, materials and bosses (LORE-R45, owner approves), then specs and builds.
- **The Voice finale** closes Season 1.
- **Writing:**
  - Hearth opening, Bond stories (42 plus 21 Sworn), gatherer talk and fire stories, the Hollises
  - Raid lines (approved)
  - Region stories and class backstories
  - Hero quests and Awakenings
- **Chapter goals** per region. (AC6)
- Plan-2 carry-overs:
  - **Oaths** become challenge modes.
  - **Pinnacle bosses** become Season 1 endgame fights.
  - The **legendary powers** combat side folds into Uniques 2.0.

## 9. Menus (UX-B...G, HINT1, NM1)

- Done:
  - the one-tap activity switcher
  - remembered nodes and swipe
  - the rebuilt Gather screen with skill levels on the tabs
  - the Storehouse view
- The **shared style kit**, a slimmer header, and the **Journal** from the portrait (Deeds, Tracks, Feats,
  Codex; the rename box moves there).
- **Crafting and gear menus sorted** (owner priority): Craft becomes Make · Armoury · Powers.
- The **World tab** (section 6.4). Then Party, Fight (boss gate restyle) and polish.
- **Steady hint pop-ups** (owner): docked, with no jitter.
- **Rename:** companions become **heroes**; the player's character becomes the **Lanternbearer** (owner).
- **Map icons redesigned** in the map art study (owner: map icons only; other icons are fine for now).

## 10. Achievements (done, with follow-ups)

- **Done:** 92 tracks with Everflame as the top tier, 21 Feats, 16 secrets, short epithet titles (owner),
  accessories, the Trophy Wall, and the stats wall.
- **Follow-ups:**
  - Dormant tracks go live as their systems land.
  - Chapter goals.
  - The Full Company text.

## 11. Launch readiness (Phase F)

- **Save safety:** export/import codes plus automatic backups before migrations (SAVE1, early). Cloud save
  needs a backend (post-1.0 unless the backend comes sooner). **An installable web app** (PWA) on Netlify,
  deployed at most 4 times a day (done: the deploy rule).
- **In-game guide and glossary** (GUIDE). **Accessibility**: colour-blind-safe types, text size, reduced
  motion (done), volume mixer (A11Y).
- **Sound and music:** synthesised sound effects and a chiptune loop per region (SFX1, MUS1).
- **Challenge modes:** boss rush, Oath replays, the weekly Deepwell trial. Rewards are cosmetic only (CH1).
- **Shareable camp card** (CARD1).
- **First-hour polish** with a testers' checklist (FH1). **Final balance** (BAL-F).
- **Testers:** a send-feedback button plus local error capture (FB1). A size and speed budget
  (dist ≤ 4 MB, first frame ≤ 2.5 s on a mid-range phone).

## 12. After 1.0

- **Season 2 (2.0):** the story continues past the Voice's retreat; a **second evolution tier** for every
  class; hero branching maybe.
- **Art:** commission the three classes and six evolutions (one signature look each; capes, hats and auras
  layer on top), then the 32 heroes. The **asset gallery** doubles as the artist's brief; a build step swaps
  in PNGs. Commercial-use licences required.
- **Monetisation** (owner direction). The vision's fairness pillar gets rewritten when this starts.
  - A free plus paid **battle pass**.
  - A **membership** with capped convenience: longer away time, faster builds, an extra builder, a camp skin
    and effects, and the premium pass included; nothing is taken back when it lapses.
  - **Skins**, a Founder pack, and gems as cosmetic or convenience only; never exclusive power.
  - Needs accounts, server-side purchase checks and payments.
- **Online:** titles for other players (owner: yes, post-1.0), guilds and social features, and a backend
  for the standalone version.
- **The Lantern Festival** (owner: after 1.0).

## 13. Rejected or parked

- The lantern network (owner: no).
- A general icon redraw (owner: other icons are fine for now).
- Bench XP and rapid catch-up (owner: no).
