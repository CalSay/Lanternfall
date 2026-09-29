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
    square framed slots with a pixel icon each, in the order Attack, Parry, Dodge, ability 1-3. The ability
    slots carry art for their ability; the basic three are plainer. Cooldown shown as a dark sweep with the
    seconds left. Parry and Dodge glow when a heavy hit is coming. Keyboard labels on desktop.
  - Parry: harder to time. On a success the enemy is staggered at once, your counter attack lands during the stagger, and the enemy recovers when the counter ends.
  - Heavy, telegraphed attacks that need Dodge or Parry come mainly from bosses and elites (owner, 2026-09-29).
    Normal foes hit lightly. Dodge avoids the hit but gives no counter or stagger.
  - Dodge: easier to time; avoids the hit.
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

**Keep:** gatherers, camp, gear and crafting, Deepwell, mastery, bestiary, the online raid.
