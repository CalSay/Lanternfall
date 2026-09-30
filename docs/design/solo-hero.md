# Solo hero: the new direction (owner, 2026-09-29)

Replaces the party. Owner's reasons: party combat was cluttered on screen, hard to read, and kept failing.

## The change

- **No party.** One hero fights on the road at a time. Formation, Bonds (as combat), Tactics, companion slots,
  and hero recruitment into a party are removed from play.
- **The heroes become the playable characters.** They keep their stories. The lamp passes to whoever you
  play (lore: "the one who picked the lamp up").
- **Starters: Wren Hollowmere (archer), Tobin Reed (tank), Pip Cinderly (caster),** the three with new art.
  The other heroes return later as unlockable playable characters.
- **Combat buttons** (no tap-to-attack): Attack, Parry, Dodge, and up to 3 equipped abilities.
  - Shown as an **action bar below the stage** (owner, 2026-09-29), like the League of Legends ability bar:
    square framed slots with a pixel icon each, in two rows under the stage: the bottom row is Parry, Dodge,
    Attack (left to right); the top row is Ability 1, 2, 3. The player chooses which unlocked abilities go in
    the three slots (tap a slot to pick). The bar sits as low as possible on a phone, just above the bottom tabs, for
    thumb comfort; Attack is bottom-right because it is the easiest reach.
    Fight view order, top to bottom (owner): header; everything not directly combat-related (Next Up, the
    Fight/Mining toggle, Switch, zone arrows); the stage; the action bar; the bottom tabs. The ability slots carry art for their ability; the basic three are plainer. Cooldown shown as a dark sweep with the
    seconds left. Parry and Dodge glow when a heavy hit is coming. Keyboard labels on desktop.
  - Parry: harder to time. On a success the enemy is staggered at once, your counter attack lands during the stagger, and the enemy recovers when the counter ends. The counter is always a critical hit (owner). Critical hits show their own damage-number animation: a small pop and sparks, nothing too crazy.
  - Heavy, telegraphed attacks that need Dodge or Parry come mainly from bosses and elites (owner, 2026-09-29).
    Normal foes hit lightly. Dodge avoids the hit but gives no counter or stagger.
  - Dodge: easier to time; avoids the hit.
  - **Active vs idle (owner, SOLO2):** any combat press (Attack, Parry, Dodge, an ability slot, by tap, click or key)
    makes you ACTIVE for 5 s; opening the picker or a long press for info does not. While active nothing fights for
    you: no auto swing, auto-tap or auto-cast; every hit comes from the buttons, and they hit harder (Attack x5, W2-A; it was x3.5 x
    attack speed before Swiftness left; a hand cast x2.5 the auto-cast). The page hidden or backgrounded is idle at once. An "Auto" badge on
    the stage lights while auto-play is in charge. Space dodges (D attacks). The parry's counter is always a crit;
    crit numbers pop, rise a little higher and carry small sparks. Target: an active player reaches zone 10 25-35%
    sooner than idle (sim.mjs --report early, E4).
  - Idle/away play: the hero auto-attacks and uses abilities as they come off cooldown; parry, dodge and
    counters are the reward for active play.

## Abilities (design to write)

- Each hero has an **ability tree of about 10**: about 6 from a shared pool per play style (archer, melee,
  caster, support), flavoured per hero, plus 3-4 signature abilities tied to their story. Equip 3.
- **Hero level** opens tiers of the tree (for example tier 2 at level 10, tier 3 at 20). Level alone never
  unlocks an ability.
- **Unlocking:** specific bosses (and rarely elites and the Deepwell) drop rare items themed on the boss (for
  example the Fenmother drops a drowned-light item). You take them to **Elowen's chapel on the hill**, where the
  Mother Lamp was broken into sparks, to unlock an ability of that kind for your hero. Not region-gated.
- **The star map becomes each hero's upgrade tree:** star points from levelling rank up abilities, the standard
  attack, parry (window, counter) and dodge, with branching choices (for example Fireball splits into three, or
  leaves a burning ground zone).

## Still to design

- Solo combat spec (CB3): **no lane combat** (owner, 2026-09-29: enemies walking in is scrapped with the solo
  change). Packs stand on the right as today; the spec covers bursts, cleaves, lines, single target and short
  ground patches for one hero, and bosses/elites with heavy telegraphed attacks to parry or dodge.
- What heroes not carrying the lamp do (camp work, expeditions, swapping between fights or mid-fight).
- The campaign story told through NPCs around the world map (replaces Bonds, below).

## First build (playtest)

Party removed from play; the three starters are selectable; each has one ability; the combat page has Attack,
Parry, Dodge and the ability as buttons. Built on the current (portrait) layout and current sprites; the new art,
landscape layout and lane combat come after the owner plays this.

## Switching heroes and the road (W1-D, playtest-2 P2-7)

The road (zones cleared, `maxZone`), gold, gear and camp are shared. Each hero also remembers the zone they were fighting in
(`S.solo.zn[hero]`, saved when you switch away). Switching to a hero returns you to that hero's remembered zone (never past
`maxZone`). A hero with no remembered zone (never played) stays in the current zone. If that hero cannot farm the zone, pace
(55-pace) walks them down to one they can ("You fell back to Zone 2 to keep earning") and forgets the old fall-back, so a
weak hero never resets the strong hero's progress: switch back and you are in the strong hero's zone again.

## Removal and rework (owner answers, 2026-09-29)

**Ascension and subclasses (owner).** The Proving stays: a region-boss fight that **Ascends** your hero and
opens their subclasses. Each subclass brings new abilities. The player may also **stay as their current
class** (no penalty beyond not getting the subclass abilities). The six evolutions of classes-2 become the
subclass branches; the per-hero ability tree hangs off the chosen subclass. The Proving is the
subclass upgrade only (or the upgrade of the base class if you stay).

**Hero quests enhance an ability (owner).** The per-hero Awakening in heroes-2 stays separate from Ascension:
finishing a hero's quest enhances one of that hero's current abilities. The name is **Hallowed** (owner):
"Pip's Fireball is Hallowed". How it works (owner, 2026-09-29):
- The player chooses which ability to Hallow, from the hero's **signature abilities** (their unique ones,
  not the shared class pool). One Hallowed ability per hero; it can be moved to another signature ability
  at Elowen's chapel for a cost.
- A Hallowed ability mostly **looks more impactful**: bigger, brighter effects, often in a different colour
  from the original (each signature ability gets its own Hallowed look), plus a white-gold halo mark on its button.
- It is also stronger: about +40% power and a 20% shorter cooldown, plus one bonus by ability shape:
  single target hits a second foe; a line or pierce is longer and hits twice; a burst gets a wider radius;
  a ground patch lasts longer and slows; a self buff or guard also heals a little.

**Bonds become campaign story (owner).** The 21 Bonds, their 42 stories and Sworn lines leave the game.
In their place, a campaign story told through NPCs around the world map that the player gets to know:
the gatherers, the tavern keep and others. Bond writing stays in the repo as source material only.

**Heroes (owner).** 32 playable heroes for 1.0: the 18 in code plus the 14 designed in heroes-2. No more
beyond that for now. Three are starters; the rest unlock through their routes.
They arrive **gradually as the game develops** (owner), a few at a time, not all at once. Each new hero ships
complete: GPT art (poses, palette) plus code animation, a kit (signature abilities and their Hallowed looks,
shared-pool access, subclasses), an unlock route, a hero quest, and their part in the campaign story.

**Remove from the game:** the formation (slots, line-up planner, bench, Party tab team view); Bonds,
combos and Kin; companion XP, caps and promotions; the companion achievements (Full Table, Seasoned
Company, Kindred, Side by Side) and the "party damage" and "companion XP" bonus types; Tavern recruiting
(the visitor and recruit rumours; the Tavern's upgrade tiers need new perks); the old code-drawn companion
sprites once new art replaces them.

**Rework:** recruit routes (quests, Renown, boss tokens, bestiary) become the ways to unlock a playable hero;
the star map becomes each hero's upgrade tree; legendary circle sets are regrouped (the circles were companion
groups); pinnacle bosses and combat-2's backline divers, guards, taunts and interrupts get solo versions (with
lane combat, CB3); expeditions become **trade expeditions run by gatherers** (owner): you send a gatherer away to trade, and
they come back with goods. They no longer use heroes.

Also rework: unique items whose effect is party damage (for example the Rattlebone Charm, "Your party deals 15%
more damage") need solo effects.

**Keep:** gatherers, camp, gear and crafting, Deepwell, mastery, bestiary, the online raid.

## Training: gold levels up your moves (owner idea 2026-09-29; built in W2-A)

Owner: "get rid of the current upgrade things that cost gold or at least change it. It should be paying gold to level up
abilities and the attack... Should probably level cap abilities too." Training replaced Blade, Swiftness and Precision in
the solo game (the dormant party game keeps them until wave 3 deletes it). Code: `55-training.js` (rules),
`75-training-ui.js` (the list and the long-press block), knobs `SOLO_TUNE.train` (24b), the Attack curve `PACE.atk*`
(40-rules), prices `ECON.train` (21w). State: `S.solo.tr[hero][move]` and `S.solo.asc[hero]`; the save key moved to
`lanternfall.save.v4` (a v3 save's Blade and Swiftness power would have vanished, so v3 saves start fresh).

**The split, so systems don't overlap:** gold = numbers (Training); star points = choices (the upgrade tree's branches);
boss items at Elowen's chapel = new abilities; the hero's quest = Hallowed; the Proving = Ascension and subclasses.

**What you train.** Each hero trains Attack, Parry, Dodge and every ability they have unlocked (equipped or not). Levels
belong to the hero: Wren's Echo Shot is Wren's, and switching heroes switches levels. A new move starts at Lv 0.

**What a level gives** (numbers only; timing windows never grow from gold):

| Move | Each level | Every 5th level |
|---|---|---|
| Attack | the hit: `(4 + 6 x Lv) x 1.7` per 5 levels, `x2` per 5 past Lv 25 (`PACE.atkPer`, `atkX`, `atkEvery`, `atkBend`, `atkX2`) | the x1.7 (x2) step |
| Ability | its power: `(4 + 3 x Lv) x 1.55` per 5 levels, `x1.8` past Lv 25, then x the hero's level, gear and damage; it no longer follows Attack | a milestone, in turn: Echo Shot 0.5 s shorter cooldown / Mark +2 s; Shield Bash one more foe (the next ones back, at half power) / Stun +0.5 s; Fireball fire patch +1 s / 0.5 s shorter cooldown. Cooldowns never drop under half their base |
| Parry | counter damage +10% | - |
| Dodge | cooldown x0.97 (1.2 s, never under 0.4 s) | - |

The Attack curve carries what Blade (3-4 levels a hero level) and Swiftness (up to 5 swings a second) gave, at about one
Attack level a hero level. The x2 steps past Lv 25 match the old days 2-10, when Blade kept buying levels and Swiftness hit
its cap.

**Swiftness is gone.** Attack speed is fixed per hero (`SOLO_TUNE.train.aps`, 1 swing a second for all three today). The
Attack button's cooldown (0.6 s) sets a hand's speed; the press hits x5 (it was x3.5 x attack speed).

**Precision moved to the stars.** Its +15% crit damage now comes from each class's crit damage stars, which add to the
crit damage pool (55-econ, still capped at +40%) instead of multiplying on top: Warrior Hard Hits +12% (with Banner Over
Camp +3%), Ranger Barbs +8% and Barbs II +7%, Mage Focused Lens +10% and Clean Cut +5%. Gear keeps its crit damage lines
(helm and the crit affix, `gear().critMult`). No gold buys crit damage any more.

**Caps.** A move can't pass the hero's level, and each class stage has a hard cap (`SOLO_TUNE.train.cap`): **40 on the
base class, 80 after the Proving** (Ascension; `S.solo.asc[hero]` is set when the Proving is passed). Refined from the
draft's 25 / 50: the hero reaches Lv 25 after about 2.5 hours, while the Proving opens at Lv 35 plus the Fenmother (zone
35, day 10+ at today's solo pace), so a cap of 25 would have stopped Training for days. 40 leaves room past the Proving's
level; it binds around day 11 today. W5-A may add a subclass stage.

**Costs.** The price of a move's level n+1 is `base x 1.2` a level to Lv 20, `x1.28` a level to Lv 40, `x1.15` a level
past it (`ECON.train`: base Attack 6, abilities 8, Parry 10, Dodge 8). A move gains about one level a hero level, so the
price follows the time between hero levels: minutes in the first hour, hours on day 1, a day or more past Lv 33. Past 40
the regions after the Fenmother pay x3.4 a region, so it rises gently; Lv 80 costs about 12M (under 1e8, EC10). Attack Lv 1
costs 6, as Blade's did. x1 / x10 / Max like the old upgrades (Max: what your gold buys, within the cap). The ledger
counts it under "up". `mod('trainCost')` is a hook for discounts (audit-1's Omen "Training costs 25% less", a deeds
bonus); nothing uses it yet.

**Where.** Hero tab > Training: one row per move (the action bar's icon, Lv n/cap, what it does now and at the next
level, the next milestone, Train and its price), x1 / x10 / Max, and a line on what caps the moves. A long press on
Attack, Parry or Dodge opens a sheet (what it does, its key, its Training level and a Train button, and "All training");
a long press on an ability slot opens the picker with the slot's ability level and a Train button on top. The game waits
while either is open. The Fight tab's Hero rows are gone; its first view is now called Boss (the boss gate).

**Dependents.** The guide's `upgrade` step teaches Train Attack (Hero > Training; it waits for the Hero tab to be open).
Next Up's `hero-up` goal names the next level to train: the cheapest of Attack and the equipped abilities, Parry and Dodge
only once those are capped ("Train Attack to Lv 6: 40 more gold"). No deed reads `S.blade` (audit-1's note was wrong);
the Hone deed counts item upgrades and is unchanged. New notices: an ability milestone (log) and a move at its stage cap
(bell), in 23n-data-notices.js.

**Warbanner (retune note, not changed: the relics are the raid's shop, the online layer).** +20% damage a level with no
cap now competes with Training. Proposal: cap it at 10 levels (+200%), or trim it to +10% a level, when the raid shop is
reworked.

**Pacing (sim.mjs, W2-A).** `--report early` 6/6 (idle: first boss 1.0-1.2 min, zone 5 8.2-9.6 min, zone 10 26.5-28.6 min;
active 31% sooner). Training binds on hero level in the first hours (Attack = hero level) and on gold from day 2. Over 10
days of normal play Training takes 25% of all gold spent (Blade, Swiftness and Precision took 37%; economy-2 EC4 wants
15-30%). Max zone by day (normal, warden) is within a zone of the pre-W2-A solo game: see the wave-log numbers.
