# Turn combat: the build (C29)

Status: built on `claude/elegant-johnson-m6k00u`, 2 October 2026, for the owner to play in the preview. This is how the
turn fight now works in the game. It follows the owner's decisions in `combat-turns.md` and the C19/C22 designs
(`hero-abilities.md`, `ability-tree-details.md`, `enemies-c22-final-contract.md`). Where those left a choice open, this
page says what was picked.

## What changed for the player

- **Every zone fight is a turn fight** for the solo hero: zones 1 and up, regular foes, elites and zone bosses. The
  Deepwell and the Provings are turn fights too (below). The world raid keeps its own fight.
- **Active only** (owner, 2026-10-01). There is no Auto in a turn fight. The fight waits for your turn, and a hidden page
  pauses it. Time away earns nothing from fights; gathering still works while you are away. The away screen says so.
- **One foe at a time.** Speed decides the turn order. The strip at the top shows the next six turns.
- **Your turn:** Attack, or one of your three abilities (Q, W, E). Attack builds your hero's resource: Aim (Wren), Grit
  (Tobin), Cinders (Pip). Each hero's resource explains itself (24c HERO_RESOURCE): on Hero > Abilities, when you tap
  its pips in a fight, and once on its own the first time you gain one. Pip's was called Embers until 2026-10-02; it was
  renamed so it does not share a name with the raid's Embers.
- **Its turn:** one move, of one or more hits. Every hit can be parried or dodged. A parry is harder, blocks the hit and
  takes 1 turn off every cooldown. Parry every hit of a move and you counter (a sure crit). A dodge is easier and only
  avoids the hit.
- **Bosses** have four moves in turn: two attacks, a charged move, a third attack. A charged move takes a turn to gather
  (a red banner says so) and lands on its next turn as a string of big hits. Stun or Freeze it, or hit it for 6% of its
  max HP while it gathers, and it breaks: it loses its next turn instead. Below half HP a boss gets faster. You meet a
  boss at full health. Since the boss pass (below) a boss fight grows longer as the game goes on, and a boss hit you do
  not parry or dodge costs about a quarter to a third of your health; a charged move most of it. Since the mid-game
  HP pass (below) that holds from zone 8 to the end for a hero whose gear keeps up with the zones.

## Where the abilities sit

- **On the action bar:** three ability slots (Q, W, E) above Parry, Dodge and Attack. This is the bar the game already
  had. A passive takes a slot, has no button and is always on; its slot shows blue. A slot shows its cooldown in turns,
  "T3" for a finisher before your third turn, and "!" when it needs something first (a Burn, 2 Grit, 3 Cinders, a parry).
- **On the Hero tab, a new Abilities view** (between Hero and Training): your Scrolls, your three slots, and all 14 of the
  hero's abilities in their three groups (for Wren: True Aim, Blood Trail, Night Wings). Each card has the name, kind,
  cooldown, tier and what it does, and either Slot 1/2/3 buttons, a Learn button, or what it still needs.
- **A long press on a slot** still opens the quick picker with the hero's learned abilities.

## How the player unlocks them

- Each hero starts with their signature: Echo Shot, Shield Bash, Fireball.
- The other 13 each need a **Scroll** of their tier, and the hero's level for that tier:

  | Tier | Scroll | Hero level | Abilities per hero | Where it drops |
  |---|---|---|---|---|
  | I | Moss Scroll | 1 | 1 | zone bosses 1 to 4 |
  | II | Hollow Scroll | 8 | 4 | zone bosses 5 to 12 |
  | III | Barrow Scroll | 16 | 4 | zone bosses 13 to 20 |
  | IV | Roadlight Scroll | 25 | 3 | zone bosses 21 and on |
  | V | Mother Scroll | 35 | 1 (the finisher) | the Fenmother (zone 35) and other region bosses |

- **Drops:** the first win over each zone boss always drops its Scroll. A replay win drops one 1 time in 5, and never
  more than 5 replays in a row without one (a dry streak per Scroll kind).
- **A higher Scroll can pay for a lower tier**, so a hero who is ahead never waits on an early boss.
- **Scrolls belong to the lamp**, shared by every hero. One hero's first clears unlock most of their own set by about
  zone 30; the other heroes fill theirs from replays. That gives old zones a reason to be played again.
- **Learning takes two taps** on the card ("Learn", then "Tap again to spend a Hollow Scroll") and drops the new ability
  into a free slot.
- The C19 tiers and paths are Codex's (`ability-tree-details.md` 11). The C19 relic plan named old Elder bosses; with a
  boss at the end of every zone, Scrolls by zone band replace it. The names avoid the shop's existing Relics.

## Talents (owner, 2026-10-02: "Sure let's do it")

Codex's C19 forks, built as **talents** (24e-data-talents.js, 56e-abilities.js). Each learned ability has two talents,
and so do the hero's Attack, Parry and Dodge: pick one of the two for 2 talent points. A hero earns 1 point a level after
level 1, so a level 35 hero has 34: enough for 17 of the 17 picks. Choices can be changed or given back any time; a fight
takes them as it starts. They show on each ability card on Hero > Abilities, and Attack, Parry and Dodge have their own
cards at the bottom. They are named talents, not stars, so they do not clash with the Stars view (below).

There are no suggested builds (owner: finding what works should be hard and rewarding).

## Stars (owner, 2026-10-02: "Think of this section like pictos from E33")

The owner's direction: "Rework them. Make them feel actually useful without breaking the balance of the game. 1% damage
feels unrewarding. Maybe let them add to the abilities and combos. Think of this section like pictos from E33."

**What was there.** Hero > Stars was the old per-class star map (31 stars a class, built for the real-time party fight).
In turn fights its stat stars still worked (+1.5% damage, +5% Attack, +3% crit chance, crit damage into the capped pool,
-4% cooldowns), but every keystone and most notables hooked the real-time kit (taps, seconds, Shield Wall, Flare, Volley,
auto-cast) through `bonus('ks:<id>')` and `bonus('tune:<knob>')`, which the turn fight never reads: Unbroken, Crushing
Blow, Challenger, Bastion, Twin Spark, Slow Burn, Wildfire, Overkill, Everburn, Kindling Storm, Glass Lantern, Next in
Line, Pack Leader, Quickdraw, Hawk Eye, Deadeye, Rain of Arrows, Afterglow, Finisher and the like did nothing. The six
evolutions' rings (8 stars each) and their passives and second abilities (Fury, Bulwark, Venom, traps, Hex, Sanctuary)
were the same: in turn fights an evolution gives only its stats and its damage line. No save fixture had a star lit.

**What it is now.** A star is one small rule change in a turn fight. 43 of them (24f-data-stars.js, rules in
57e-stars.js): 25 from the rework, and 18 more from the second pass (owner, 2026-10-02, below).

- **Find** each star once. It belongs to the lamp, so every hero can use it.
- **Set** up to 3 on a hero (Hero > Stars). A star found while a slot is free is set at once.
- **Learn** a star by winning 4 fights with it set (any fight in turns: zones, the Deepwell, a Proving). Each of the
  first two complete constellations cuts that by 1 (3, then 2).
- **Light** a learned star with star points, on any hero, up to 2. Star points are the old ones: a point every 3 hero
  levels and 4 for each Great Lantern, plus 1 for each complete constellation (`starPoints()`). A star costs 1 to 3.
- A fight takes the 3 set and the 2 lit stars as it starts: 5 at most. With fewer points (a lower level), the lit stars
  the points no longer pay for stay home.
- No new currency. Each hero keeps its own slots and lit stars; finding and learning are shared.

The full list, by constellation (the star map, below). Kit: whose kit the star plays with (the view's filter).

| Star | Cost | Kit | Found | What it does |
|---|---|---|---|---|
| **The Hollow** | | | | |
| Ready Lamp | 1 | any | zone 6 boss | Start each fight with 2 Aim, 3 Grit or 2 Cinders. |
| Spark Guard | 2 | any | zone 8 | A parried hit gives you 1 Aim, Grit or Cinder. |
| Turning Point | 2 | any | zone 10 | When the foe falls below a third of its health, your next ability is a sure crit. |
| Hunter's Step | 1 | Wren | zone 12 | A dodge Marks the foe for 2 turns. |
| Serrated | 2 | Wren | zone 14 | A critical hit adds 1 Bleed. |
| Cold Steel | 2 | Pip | zone 16 | A parried hit adds 1 Chill. At 3 Chill the foe Freezes. |
| Quick Return | 2 | Tobin | zone 18 | A counter makes your shortest cooldown ready. |
| **The Fen** | | | | |
| Ember Edge | 2 | Pip | zone 20 | A critical hit sets the foe alight: a small Burn (30% power) for 2 turns. |
| Open Veins | 2 | Wren | zone 23 | Bleed ticks can crit. |
| Brand | 1 | Pip | zone 26 | Setting a foe alight also Marks it for 2 turns. |
| Slip and Strike | 2 | any | zone 29 | After a dodge, your next ability hits 30% harder. |
| Dazed Prey | 1 | any | zone 32 | A Stun or Freeze also Marks the foe for 3 turns. On a boss, so does a Stagger. |
| Killing Mark | 2 | Wren | zone 34 | Your critical hits on a Marked foe deal 30% more. |
| Encore | 3 | any | the Fenmother | The third ability you use each fight is ready again at once. |
| **The Coast** (new) | | | | |
| Bloodscent | 2 | Wren | zone 37 | Each Bleed tick on the foe gives you 1 Aim, Grit or Cinder. |
| Spite | 1 | any | zone 40 | A hit that lands on you gives you 1 Aim, Grit or Cinder. |
| Evil Eye | 1 | Pip | zone 44 | A Cursed foe is Marked for as long as the Curse lasts. |
| Ringing Blow | 2 | Tobin | zone 48 | Your Stuns build twice the Stagger on a boss. |
| Frostfire | 2 | Pip | zone 53 | Spending Cinders chills the foe: 1 Chill for every 2 you spend. |
| Riptide | 2 | any | zone 60 | Dodge every hit of an attack and you strike back for half a counter. |
| Swift Tide | 2 | any | zone 70 (the Coast's boss) | Finishers are ready from your first turn, and come back 2 turns sooner. |
| **The Wild Hunt** | | | | |
| Cinder Riposte | 2 | Tobin | elites, zone 15+ | A counter sets the foe alight for 3 turns. |
| Open Guard | 1 | Tobin | elites, zone 15+ | A counter leaves the foe Exposed: your next payoff hits 25% harder. |
| Perfect Time | 2 | any | elites, zone 15+ | A Perfect press takes 1 turn off your other cooldowns (once an ability). |
| Banked Coal | 2 | any | elites, zone 15+ | When an ability spends your Aim, Grit or Cinders, 1 comes back. |
| Crushing Blow | 2 | any | elites, zone 15+ | Every 4th Attack in a fight hits twice as hard. |
| Brimming (new) | 2 | any | elites, zone 36+ | Aim, Grit or Cinders you gain past full strike the foe for 50% power each. |
| Mending Steel (new) | 2 | Tobin | elites, zone 36+ | A counter heals you for 6% of your max health. |
| Avalanche (new) | 2 | Tobin | elites, zone 36+ | Spending 5 Grit or more at once Stuns the foe. |
| **The Deepwell** (new) | | | | |
| Full Draw | 2 | Wren | floor 3 | At 3 Aim, your next ability is a sure crit. It spends 1 Aim. |
| Kindling | 2 | Pip | floor 6 | Burn ticks can crit. |
| Stoneskin | 1 | Tobin | floor 9 | A hit that lands on you spends 2 Grit to take half the damage. |
| Scarred | 1 | Wren | floor 12 | When a Mark wears off, it leaves 2 Bleed. |
| Last Light | 3 | any | floor 15 | Once a fight, a hit that would fell you leaves you at 1 health. |
| **The Provings** | | | | |
| Blood Price | 2 | any | Warrior's Proving (Reaver) | Below half health you deal 25% more. |
| Holy Sparks | 2 | Tobin | Warrior's Proving (Warden) | A parried hit strikes back for 20% of your ability power, as holy damage. |
| Shatterpoint (new) | 2 | any | Warrior's Proving, a second pass | Breaking a boss's charge strikes back with a full counter. |
| Deep Wounds | 2 | Wren | Ranger's Proving (Venomstalker) | Bleed holds up to 8 stacks (was 5) and lasts 1 turn longer. |
| Tripwire | 1 | any | Ranger's Proving (Trapper) | Each fight starts with the foe Pinned. |
| Snare (new) | 1 | Wren | Ranger's Proving, a second pass | A Stun or Freeze also Pins the foe: its next attack is easier to read. |
| Witchfire | 2 | Pip | Mage's Proving (Warlock) | When a Curse bursts, the foe catches fire for 3 turns. |
| Sanctuary | 2 | any | Mage's Proving (Lightkeeper) | Each fight starts with a Ward worth 12% of your max health. |
| Thermal Shock (new) | 2 | Pip | Mage's Proving, a second pass | Your fire hits on a Chilled foe deal 25% more for each Chill. |

- **Zone bosses:** the first win over the boss of zones 6, 8, ... 34, the Fenmother, and zones 37 to 70 (the Coast's
  boss) finds that zone's star.
- **Elites:** from zone 15 an elite win finds one of the elite stars not yet found 1 time in 8, and never more than 12
  in a row without one. Brimming, Mending Steel and Avalanche join the draw from zone 36. Never in the Deepwell or a
  Proving.
- **The Deepwell:** the first time you clear (or pass) floors 3, 6, 9, 12 and 15, any run.
- **Provings:** passing a class's Proving finds both of its paths' stars. These carry each evolution's real-time idea into
  turns (Blood Price, Holy Sparks, Venom's stacks, Tripwire, Witchfire, Sanctuary). Passing it a second time finds its
  third star (Shatterpoint, Snare, Thermal Shock; `S.stars.pw` counts the passes, and a save that had passed one counts
  1). Subclasses (Ascension) are a later task; the evolution choice itself is unchanged.
- A critical hit counts a counter (a sure crit) too; Bleed and Burn ticks never set off Serrated or Ember Edge, so no
  star feeds itself.
- Combos are for the player to find (owner: no suggested builds). A few that the rules allow: Ember Edge with Brand and
  Killing Mark (crits Burn, the Burn Marks, crits on the Mark hit harder); Cold Steel with Dazed Prey; Hunter's Step
  with Wren's Sonic Arrow; Open Guard with Tobin's Heavy Strike; Serrated with Deep Wounds, Open Veins and Final Echo;
  Bloodscent with Full Draw (Bleed refills the Aim the sure crit spends); Frostfire or Cold Steel with Thermal Shock;
  Evil Eye with Witchfire; Ready Lamp with Swift Tide (a finisher on the first turn).
- No star feeds itself: Riptide and Shatterpoint strike back without counting as a counter (Quick Return, Cinder
  Riposte and Mending Steel do not fire from them), Brimming's hit gives nothing back, and a Stun from Avalanche or a
  Freeze from Frostfire still meets the control lock (no new control for 3 of the foe's turns).

**The second pass** (owner, 2026-10-02: "Yeah that's fine. Might need more of them though. We also need much better
menus for abilities and stars. I kinda miss the star map too :/ idk how you'd incorporate it though").

- **18 more stars** (the table's "new" rows), on the same rules: each changes how a fight plays, none is a flat stat.
  They cover each kit (Wren: Bloodscent, Full Draw, Scarred, Snare; Tobin: Ringing Blow, Mending Steel, Avalanche,
  Stoneskin; Pip: Evil Eye, Frostfire, Kindling, Thermal Shock) and six work for anyone (Spite, Riptide, Swift Tide,
  Brimming, Last Light, Shatterpoint). They come from later places: zone bosses 37 to 70, elites from zone 36, the
  Deepwell's floors and a second pass of each Proving. New hooks in 59k, all behind `m.sf`: `turnStarsMove` (a move
  over), `turnStarsHurt` (a landed hit), `turnStarsBreak` (a charge broken), `turnStarsMarkOut` (a Mark wore off), and
  flags it reads (`e.snare`, `e.ring`, `e.burnCrit`, `h.brim`, `m.sf.swifttide`).
- **The star map is back** as the Stars view: a night sky with six constellations, one for each place stars are found
  (the Hollow, the Fen, the Coast, the Wild Hunt, the Deepwell, the Provings; `STAR_SKY` in 24f gives each star a fixed
  spot and its lines). A star not found is a faint dot, found is bright, set glows gold, lit shines with a four-point
  glint (it twinkles unless the player asks for reduced motion), and lines join learned stars; a complete constellation
  turns gold. It is an SVG of dots, lines and glows: interface, not art (the art freeze). Tap a star (or Enter on it) to
  open its card. The old map's layouts stay in `S.stars.maps`, unused.
- **A complete constellation** (every star in it learned) gives +1 star point, and each of the first two cuts the wins
  to learn a star by 1 (4, 3, then 2; stars already that close are learned at once). It pops a line ("The Hollow is
  complete: +1 star point, and stars now learn in 3 won fights."; notice `stars:sky`, held to the log). The reward is
  outside the fight: the 3 set and 2 lit limits stay, so a fight never takes more than 5 stars.
- **The menu.** Before (screenshots at 740x360 and 360x740): the view opened on a paragraph of rules; in landscape the
  panel was 338 px wide and 266 px tall, so the slots were the only thing in view and the 25 cards ran 4,000 px down; a
  card for each star (25 tall cards, 19 of them "Not found yet") was the only way to see or compare stars; slots only
  showed name tiles; there was no filter; the set and lit slots scrolled away as soon as you looked at a star. Now:
  - the loadout strip sits at the top and stays there as the view scrolls: star points (free of total), the 3 set
    stars (and how far each is from learned) and the 2 lit (and their cost). Tap one to open its card; an empty slot
    lights up when the open star can go there, and a tap puts it there;
  - the map, then the open star's card: name, whose kit, learned or how many wins to go, what it does, where it is
    found and its constellation, Slot 1/2/3 (each names the star it holds now, to compare; on a phone on its side, its 2-letter tile) and Light / Put out;
  - filters (whose kit: All, Wren, Tobin, Pip, Any hero; and All, Found, Learned) narrow the list and dim the map;
  - the list: one compact row a star with its rule, to scan and compare; a tap opens its card and brings it into view;
  - the rules moved into a "How stars work" fold at the bottom;
  - landscape: the menu takes the whole stage while Stars is open (the side column, the bar and Next Up stay live), the
    strip on top, the map on the left (it shrinks to the height left, so the whole sky shows at 740x360) and the card on
    the right with its buttons first.
  - Next Up opens the map on its star's card (`starsUiPick`).

**Old saves.** The save key stays `lanternfall.save.v5`. `S.stars` gains `own`, `wins`, `learned`, `set`, `lit`, `dry`,
`seenN`, `pw` (the second pass: Provings passed) and `v: 3`. An old save's star-map layouts stay in `S.stars.maps` and do nothing; star points were always
derived, so every point is free again (the refund). A save that had lit stars gets one bell line saying so. On load a
save finds, quietly, the stars of every zone boss behind it, of every Proving it passed (a third star needs a second pass
from now) and of the Deepwell floors it reached (`S.deep.best`), and a bell line counts them.
Nothing is set for it: the player chooses. The Deeds track Stargazer now counts stars found (3, 8, 15, 25), the
Keystones track stars learned (1, 5, 12, 25), and the feat Stars in Every Sky asks for every star learned (43 now). The old map's
crit damage stars (Precision's +15% a class) are gone with it; no fixture had them lit.

**Balance.** `node tools/sim.mjs --report turns --seeds 2`, before and with `--stars typical` (each profile carries the
stars its zone has found, learned: a typical strong set of 3 and 2 lit; a fresh hero at zone 1 has none). Hero turns a
fight, played well and casually, and the casual boss win rate:

| Profile | Foe | Before: good / casual turns | Stars: good / casual turns | Casual win, before -> stars |
|---|---|---|---|---|
| Fresh heroes, zone 1 | all | unchanged (no star found yet) | | |
| Early (Wren, zone 8: Ready Lamp) | boss | 4.0 / 4.9 | 3.8 / 4.6 | 93% -> 95% |
| Mid (Tobin, zone 20) | normal | 2.9 / 3.0 | 2.9 / 3.0 | 100% -> 100% |
| Mid (Tobin, zone 20) | boss | 6.6 / 8.0 | 5.3 / 6.7 | 100% -> 100% |
| Late kept up, zone 35 | normal | 2.0 / 2.1 | 1.6 / 1.8 | 100% -> 100% |
| Late kept up, the Fenmother | region boss | 9.4 / 10.1 | 6.9 / 7.9 | 73% -> 83% |
| Late kept up, zone 38 | normal | 2.7 / 2.8 | 2.1 / 2.5 | 100% -> 100% |
| Late kept up, zone 38 | boss | 6.9 / 7.3 | 5.1 / 5.6 | 90% -> 97% |
| Late fixture (undergeared), zone 38 | boss | 10.4 / 11.6 | 8.0 / 9.0 | 30% -> 42% |

Mid: Turning Point, Serrated, Quick Return set, Ready Lamp and Spark Guard lit. Late (Pip): Turning Point, Brand,
Killing Mark set, Ready Lamp and Spark Guard lit. One star alone shortens a boss fight by up to about a quarter for the hero
it suits (on the mid Tobin, who parries a lot: Holy Sparks 24%, Cinder Riposte 19%, Ember Edge 15%, Slip and Strike 14%,
Turning Point 12%) and often by nothing for a hero it does not suit. A strong set
of five makes bosses about 20-30% shorter, which keeps a hero who keeps up inside the bands (bosses 5 to 9 turns, normal
foes about 2); casual players win more bosses. Two changes came from these runs: Turning Point fires at a third of the
foe's health, not half (at half it took a fifth off the mid Tobin's bosses on its own), and 2 lit stars, not 3 (three put a kept-up
Pip's zone 38 bosses at 4.7 turns). The boss pass (below) made bosses longer; a strong set still takes about a quarter
off them (zone 38: 10.0 to 7.5 turns). No star gives a turn: the most turns in a row (2, a boss 3) still holds with every
star at once (tools/check.mjs "stars").

**Balance, second pass.** `node tools/sim.mjs --report turns --stars typical --seeds 2` before and after: the same, row
for row (the typical sets carry the first 25 stars, and the 59k hooks change nothing without a star that uses them).
The new stars on builds that use them: `node tools/sim.mjs --report stars --seeds 2` (a kept-up hero at zone 38, boss
fights; good play: hero turns; casual: wins):

| Star | Hero, build | Boss turns, good | Casual boss wins | Best pair |
|---|---|---|---|---|
| Bloodscent | Wren, Barbed + Echo + Final Echo | 12.9 -> 10.5 (18%) | 25 -> 39% | + Full Draw 34% |
| Spite | Pip, Fireball + Ignite + Lanternburst | 11.1 -> 11.0 | 26 -> 42% | + Spark Guard 14% |
| Evil Eye | Pip, Hex + Fireball + Ignite | 11.9 -> 10.7 (10%) | 28 -> 46% | + Holy Sparks 22% |
| Ringing Blow | Tobin, Bash + Shield Throw + Sunder | 15.6 -> 16.1 | 100% | + Brimming 15% |
| Frostfire | Pip, Frost Shard + Fireball + Spark | 12.2 -> 12.7 | 84 -> 81% | + Dazed Prey 11% |
| Riptide | Wren, Echo + Deadeye + Final Echo | 11.6 -> 11.2 (4%) | 16 -> 19% | + Killing Mark 17% |
| Swift Tide | Wren, Final Echo + Echo + Barbed | 13.4 -> 13.5 | 20 -> 17% | + Spark Guard 21% |
| Brimming | Wren, Echo + Deadeye + Power Shot | 10.2 -> 10.1 | 27 -> 31% | + Killing Mark 16% |
| Mending Steel | Tobin, Bash + Hammerfall + Heavy Strike | 11.3 -> 11.3 | 100% | + Dazed Prey 13% |
| Avalanche | Tobin, Heavy Strike + Bash + Hammerfall | 10.8 -> 10.9 | 100% | + Cinder Riposte 10% |
| Full Draw | Wren, Power Shot + Barbed + Final Echo | 10.3 -> 10.2 | 37 -> 42% | + Bloodscent 11% |
| Kindling | Pip, Fireball + Kindle + Spark | 11.6 -> 11.2 (3%) | 60 -> 57% | + Holy Sparks 11% |
| Stoneskin | Tobin, Bash + Hammerfall + Heavy Strike | 11.3 -> 11.0 (2%) | 100% | + Dazed Prey 11% |
| Scarred | Wren, Hunter's Mark + Echo + Barbed | 15.6 -> 15.3 (2%) | 14% | + Serrated 19% |
| Last Light | Pip, Fireball + Ignite + Lanternburst | 11.1 -> 11.1 | 26 -> 47% | + Spark Guard 9% |
| Shatterpoint | Tobin, Bash + Hammerfall + Heavy Strike | 11.3 -> 10.4 (8%) | 100% | + Dazed Prey 20% |
| Snare | Wren, Sonic Arrow + Echo + Deadeye | 14.6 -> 14.5 | 14 -> 21% | + Serrated 14% |
| Thermal Shock | Pip, Frost Shard + Fireball + Spark | 12.2 -> 11.6 (5%) | 84 -> 82% | + Dazed Prey 16% |

No star alone takes more than a fifth off a boss, and no pair more than 34% (Bloodscent with Full Draw: 8.5 turns, in
the bosses' band); the report flags a star over 25% or a pair over 40%. Many second-pass stars are about staying alive
rather than speed: they lift casual boss wins by up to 20 points (Last Light, Spite, Evil Eye) and leave a good
player's turns alone. Some only show in the play they ask for, which the bot does not do: Avalanche needs Grit banked
for a big Hammerfall, Brimming a full bar, Swift Tide an opener (Ready Lamp), Ringing Blow is safety (more boss turns
lost; Tobin's counters come from the boss's turns, so his own count barely moves). Five were tuned on these runs:
Thermal Shock first spent the Chill for a burst (it cost Pip her Freezes: casual wins fell), Full Draw first fired
only when Aim filled (about once a fight), Avalanche needed 6 Grit (rarely banked), Brimming hit for 30%, and Swift Tide
only opened finishers early (it now also brings them back 2 turns sooner). Every star at once still gives no hero more than 2 turns in a row (tools/check.mjs "stars").

## Fight feel (owner, 2026-10-02)

- **A pause between turns** (0.9 s) with a banner saying whose turn it is.
- **A bigger timing bar**, labelled, with a moving marker; it glows blue in the dodge window and gold in the parry
  window. The parry band sits inside the dodge band: you can still dodge there.
- **Hits land:** a crit, a hit for a fifth of the foe's HP, a counter, a Perfect ring and a broken charge stop the clock
  for a beat, shake the stage, and the bigger ones flash.
- **Damage says where it came from:** a Burn tick is orange with the Burn icon and its turns left, Bleed is red with
  its stacks, the bats and a Curse burst have their own icon and colour.
- **Numbers only out of a fight:** each ability card on Hero > Abilities says what it hits for at your power now. The
  fight itself never shows them.

## Elite traits

From zone 15, about one regular fight in five is an elite with one trait (24d TURN_TRAITS). The first of each kind
says what it does.

| Trait | In a turn fight | Its answer |
|---|---|---|
| Shielded | a shield worth 30% of its HP soaks hits first | big hits (8% of its HP or more) count twice on it |
| Leeching | heals half the damage its hits do | Curse it, or keep 3 Bleed on it |
| Enraged | under half HP it is 30% faster and hits 20% harder | Chill slows it; it still never takes 3 turns in a row |
| Ice-Clad | its ice halves every hit but fire | fire hits it x1.5 and breaks the ice |
| Cursed | its hits Weaken you | holy damage hurts it x1.5 |

The old Explosive and Summoner traits stay out: one blasts after it dies and the other adds a second foe, which the
turn fight does not have.

## The Deepwell and the Provings (owner, 2026-10-02: "move them to turn based")

**The Deepwell** (59c-deepwell-combat.js, 57d):

- A floor's foes come **one at a time**, each a turn fight: a normal floor is 3 foes, an elite floor the elite (with a
  trait) and a normal foe, a boss floor the Deep Elder with its boss moves (charge, half-HP phase). Your health carries
  from foe to foe and floor to floor, as before; a boss floor does not heal you to full.
- **Depth:** floor f is fought at zone `z0 - 4 + 1.2 x (f - 1)`, where z0 is the zone whose reference hero hits as hard
  as you do when the run begins (Deep Edge left out, so it still takes you deeper). Every hero meets the same curve, as
  the real-time Deepwell did. Foe HP: 4 Attacks (normal), 8 (elite), 14 (boss) of that zone's reference hero.
- **Oil burns only while the foe acts**, at half speed, and never while the fight waits on you, so thinking costs
  nothing. A parried hit gives 1 s back, a broken charge 2 s, a counter 3 s (12 s a floor at most).
- **Boons:** 23 boons that need the real-time fight (the old class boons, Attack Rhythm, Wildfire, Duelist, Thorn
  Plate and the like) stay out of the draft while you fight in turns. Quick Parry and Steady Feet widen the turn
  windows. Damage, crit, Oil, Executioner, First Strike and Overflow work as written.
- Balance probe (bot, every foe acted on at once, greedy picks): the mid save reaches floor 15 played well and 14
  played casually; the late save 18 and 13. The real-time Deepwell's median was 19.

**The Provings** (59f-trials.js): one foe at a time at zone 35's reference (the Fenmother's), foe hits a share of
your own health (as before). No clock: limits count turns, so the time you take to choose never counts.

| Proving | In turns | Fails on |
|---|---|---|
| Hold the Bridge | 4 foes, then the Bridge Beetle (boss moves). A hit you do not parry or dodge burns the lamp (14 of 100) | the lamp goes out, or 40 of your turns |
| The Running Wraith | the herald (16 Attacks of HP). At its 3rd, 6th and 9th turn it stops at a lamp: it takes x1.5 until its next turn | its 13th turn (it escapes) |
| The Cursed Wave | a bat, a spore cap, then a Leeching wraith. A spore cap's turn curses you for 2 of your turns (5% health a turn, no healing); otherwise your lamp heals 6% a turn | 26 of your turns |

The banner sits where the Next up chip was, off the fight. A Proving with a second unit (the Stand, not built) keeps
the real-time fight.

## The rules as built (59k-turn.js)

- **Speed gauges:** each side fills a gauge at its Speed and acts at 100; ties go to the hero. Nobody gets more than
  2 turns in a row (a boss 3). Hero Speed: Wren 10, Tobin 9, Pip 10, plus gear initiative. Foes: Thorn Imp 9,
  Gloomjaw 8, other normals 9, elites 10, zone bosses 10.5, region bosses 11.
- **Cooldowns** count your turns and reset every fight. Focus (the ability-cooldown gear line) shortens them, never
  under 2 turns.
- **Power:** an ability's power is a share of the hero's own Attack (Power Shot 180% means 1.8 Attacks), so abilities
  never fall behind as Attack Training and gear grow. The signature's Training line is now "Ability power" on the Training
  view: +2% for every ability a level. (Measured on the sim's saves, the old per-ability Training left a geared hero's
  abilities at a fifth of their Attack.) Dodge Training now widens the dodge window (+4 ms a level).
- **Crits:** base x2.5. Aim adds 5% crit chance a point. Keen adds +0.5 to one cast (cap x3).
- **Statuses on the foe:** Burn (40% power a turn, 3 turns), Bleed (12% a stack a turn, up to 5), Chill (3 stacks
  Freeze it), Stun and Freeze (it loses its next turn, then no new control for 3 of its turns; a boss Staggers instead,
  25 or 35 toward 100), Exposed (the next payoff hits 25% harder), Mark (+20% damage taken), Sunder (half armour),
  Weaken (25% less damage), Pinned (its next move's windows 50% wider, and it slows), Blind (it can miss), Curse
  (stores 20% of damage taken and bursts).
- **On the hero:** Guard (40% less), Ward (a shield, up to 30% max HP), Keen; and the boss riders Bleed, Burn, Venom
  (damage at your turn start), Chill (you slow), Weaken, Blind (your next action can miss).
- **Timed abilities** (owner, 2026-10-01): twelve abilities (four a hero) show a ring when cast, one ring per arrow or
  blow. Press the ability (or Attack) again as it closes: Perfect (within 0.06 s) adds the ability's bonus, Good (within
  0.15 s) is the ability as written, a Miss or no press hits for 70%. The Abilities screen says what each Perfect adds.
  They are Power Shot, Volley, Deadeye, Moonlit Volley, Heavy Strike, Shield Bash, Hammerfall, Shield Throw, Frost Shard,
  Fireball, Ignite and Lanternburst (Codex's list, `hero-abilities.md` 2a.4).
- **The parry window** is 0.18 s and the dodge window 0.35 s. Pinned and Brace widen them, Last Stand doubles the
  parry, under caps of 0.35 s and 0.5 s.
- **Wider timing windows** (owner, 2026-10-02: an assist, "yes, but not high priority"): a setting in Settings > Combat,
  off by default, saved as `S.turn.assist`. On, every fight from the next one has parry and dodge windows x1.5
  (`TURN_TUNE.assistX`, in `turnMakeProfile`), under the same caps: 0.27 s and 0.5 s. Rewards do not change. The
  Deepwell and the Provings take it too, since they build the same profile.

## Numbers (the reference hero)

Foe HP and hits are set against a **reference hero for the zone**, measured from the balance sim's saves at each
hero's frontier (three heroes, 25 days each, 2 October 2026):

- One Attack of the reference hero: a share of the zone's old foe HP (`mobHp`), 0.7 up to zone 10, then falling to 0.22 by
  zone 34, 0.12 at zone 35, 0.09 at 38 and 0.065 from 42 (`TURN_TUNE.refAtk`). Gear gets harder to keep up as zones
  climb, and the sim shows it.
- The reference hero's max HP (`TURN_TUNE.refHpX`): since the mid-game HP pass (below) the max HP of a hero who keeps up:
  1.2 x `mobHp` to zone 3, 2.5 at 8, 3 at 15, 4 at 20, 2.9 at 30, 1.85 at 34, then 0.95 at 35, 0.6 at 38 and 0.4 from
  42 (it was 1.2 to zone 34). The Deepwell keeps the first table (`TURN_TUNE.deep.refHpX`). Both still grow every zone
  in absolute terms (Attack about 11-13% a zone from 33 to 42), so the Deepwell's
  `turnPowerZone` still works.
- A normal foe has about 5 Attacks of HP (the Thorn Imp and Gloomjaw 4), an elite 9, a zone boss 16, a region boss 30.
  With abilities that is 2 to 4 of your turns for a normal foe. The first three zone bosses are easier (65%, 80%, 90% of
  that HP) while you learn to parry and dodge. The boss pass (below) multiplies a zone boss's HP by zone (x1 to zone 3,
  up to x3.3 by zone 30, x1.5 from zone 36) and the region boss's by 1.25, so a boss takes 5-7 turns to zone 10, 8-10 to
  25 and 10-14 after.
- A normal move does about 20% of the reference HP, split across its hits, x0.7 from zone 8 to 34 since the mid-game HP
  pass (`TURN_TUNE.normHitX`). Boss moves do 25-50%, often in strings of 2 to 4 hits with uneven rhythm, and since the
  boss pass and the mid-game HP pass x1.4 at zone 6, x1.6 from 8 to 15, x1.5 at 20, x1.3 from 26 to 34 and x1.9 from 35
  (charged moves x1.3 more, x1.35 from 35).
- Rewards per fight are higher, since fights are fewer: gold x3, XP x2.5, Essence chance x1.6 (`TURN_TUNE`).
  These are first numbers, to be set from the owner's play and a turn-based sim pass.

### Late zones (balance pass, 2 October 2026; owner: "late-zone balance: yes")

The late fixture (Pip, level 49, zone 38) had 0.21 of the reference Attack and 0.40 of its HP. Two things made it weak:

1. **The fixture is undergeared.** Its Attack Training is stuck at 40, the base class's cap, at level 49: it never did
   the Proving after the Fenmother. Training to its level (about 0.5M gold; it holds 7.3M) is x2.44 Attack. Its gear
   (class pieces and Charm) is rare or uncommon tier 4 +10; epic is x1.29 more. It slots only Fireball (it predates
   Scrolls). Made whole, its Attack is 0.66 of the old reference.
2. **The old reference was wrong past zone 34.** `mobHp` steps x1.7 at zone 35 (the region step, so x2.07 from 34 to 35)
   and grows x1.22 a zone after. The old table's 0.2 at zone 35 matched a hero against `mobHp` without that step (0.2 /
   1.7 = 0.12), and it stayed flat past 35. Measured on a hero who keeps up (a full epic tier-4 +10 set, Training at
   their level, level 40 at zone 35): their Attack is 0.09-0.15 of `mobHp` at zone 35 (Pip 0.09, Wren 0.15; Tobin 0.07
   with twice their HP; the legacy sim's Wren at her zone 35 frontier: 0.10-0.12) and 0.04-0.08 at zone 38. That hero
   barely grows there: turn fights give a level every 2,000-8,000 kills at levels 40-45, Training never passes the
   hero's level, and Starlit (tier 5) gear opens at zone 42. Their HP falls the same way (Pip: 1.4 x `mobHp` at zone 35,
   0.8 at 38).

So from zone 35 the reference follows that hero: refAtk and refHpX are zone tables that fall after the region step.
Zones 1-34 are unchanged. Foe HP in reference Attacks (`TURN_FOE_HP`: normal 5, elite 9, boss 16, region 30) and the
move shares are unchanged; the Fenmother (zone 35) takes 30 Attacks of a lower reference. The coast past zone 42 keeps
the 0.065 / 0.4 shares, so its foes grow x1.22 a zone again: the coast needs its own pass with its own foes.
The Provings fight at zone 35's reference, so their foes now have 40% less HP (their hits are shares of your own
health, so those stay). The Deepwell finds its depth from the same table (`turnPowerZone`), so it follows on its own.

Sim pass (`node tools/sim.mjs --report turns`, 2 seeds; the late rows from the late-zone pass, before the boss pass; "good" parries 60% of
hits and dodges 90% of the rest, "casual" 25% and 50%; the bot acts at once, so real fights take longer):

| Profile | Foe | Good: win %, hero turns | Casual: win %, hero turns |
|---|---|---|---|
| Fresh Wren, zone 1 | normal | 100%, 2.1 | 94%, 2.6 |
| Fresh Wren, zone 1 | boss | 99%, 5.0 | 59%, 5.8 |
| Fresh Tobin, zone 1 | boss | 100%, 5.0 | 100%, 6.2 |
| Fresh Pip, zone 1 | boss | 100%, 3.9 | 85%, 4.5 |
| Early fixture (Wren, zone 8) | boss | 100%, 4.1 | 91%, 4.9 |
| Mid fixture (Tobin, zone 20) | boss | 100%, 5.5 | 100%, 6.8 |
| Late fixture (Pip, zone 38) | normal | 100%, 3.8 | 88%, 4.5 |
| Late fixture (Pip, zone 38) | boss | 99%, 10.4 | 30% |
| Late fixture kept up, zone 35 | normal | 100%, 2.0 | 100%, 2.1 |
| Late fixture kept up, the Fenmother (zone 35) | region boss | 100%, 9.4 | 73%, 10.1 |
| Late fixture kept up, zone 38 | normal | 100%, 2.7 | 100%, 2.8 |
| Late fixture kept up, zone 38 | boss | 100%, 6.9 | 90%, 7.3 |

"Kept up" (`late-kept-35`, `late-kept-38` in the sim): the late fixture's Pip at level 40 (zone 35) or 41 (zone 38),
Attack Training at her level, her gear (four class pieces and the Charm) epic +10, and Fireball, Spark and Nova slotted.
Before the late-zone pass the same hero won 38% of Fenmother fights played casually (15.4 hero turns played well), and
at zone 38 took 4.9 turns for a normal foe and 14.5 for a boss (30% casual). The raw late fixture stays behind on
purpose: it is undergeared (above), and before the pass it won 71% of zone 38 bosses played well (22 turns) and none
played casually. Zones 1-34 are unchanged, and so are their rows. The two Tobin rows are from after the Tobin pass
(below); before it they were 6.0 / 7.7 and 6.4 / 8.0 turns.

### Tobin (balance pass, 2 October 2026; owner: "tobin should have better survivability but take longer to kill ... We don't want it to be boringly slower")

The aim: Tobin is the safest hero by far, and the slowest killer by a moderate margin, about 15-30% more hero turns a
fight than the mean of Wren and Pip, inside the bands above. His turns should be Grit, counters and Shield Bash, not
Attack after Attack.

**Measured on the same footing** (`node tools/sim.mjs --report heroes`, 3 seeds x 1 h a set): each stage puts all three
heroes on one save with the same level, Attack and signature Training, gear (the lamp's, refitted to the hero) and
zone, and fights with three natural ability sets each, from what they could have learned by then (zone 1: the
signature alone). Zones 8-30 scale every hero's Attack and HP alike so the stage's middle hero is the zone's reference
hero; zone 1 and kept up (the `late-kept` setup, for every hero) are the game's own numbers. Hero turns are each hero's
mean over their sets; "x" is Tobin's turns over the Wren and Pip mean. The kept-up zone 35 boss is the Fenmother
(a region boss, 30 Attacks of HP).

| Stage, foe | Good: Wren, Pip turns | Good: Tobin before -> after | Casual: Wren, Pip turns (win %) | Casual: Tobin before -> after (win %) |
|---|---|---|---|---|
| Zone 1, normal | 2.0, 1.4 | 3.2 (x1.90) -> 3.1 (x1.85) | 2.5, 1.7 (97, 100) | 3.5 (x1.70) -> 3.4 (x1.65) (100) |
| Zone 1, boss | 4.8, 3.6 | 5.8 (x1.38) -> 4.9 (x1.17) | 5.7, 4.3 (67, 88) | 7.7 (x1.53) -> 6.2 (x1.25) (100) |
| Zone 8, normal | 1.9, 1.9 | 1.7 (x0.91) -> 1.7 (x0.91) | 2.0, 2.1 (100, 100) | 2.3 (x1.13) -> 2.3 (x1.13) (100) |
| Zone 8, boss | 4.2, 4.2 | 5.4 (x1.27) -> 5.0 (x1.20) | 5.0, 5.0 (72, 83) | 7.1 (x1.43) -> 6.7 (x1.35) (100) |
| Zone 20, normal | 2.0, 2.2 | 2.9 (x1.34) -> 2.1 (x1.00) | 2.2, 2.3 (100, 100) | 2.9 (x1.28) -> 2.2 (x0.99) (100) |
| Zone 20, boss | 4.7, 4.9 | 5.8 (x1.21) -> 4.8 (x1.00) | 6.1, 5.5 (72, 88) | 7.5 (x1.29) -> 6.5 (x1.13) (100) |
| Zone 30, normal | 1.7, 1.4 | 2.5 (x1.59) -> 1.9 (x1.26) | 1.7, 1.7 (100, 100) | 2.7 (x1.58) -> 2.1 (x1.25) (100) |
| Zone 30, boss | 3.1, 3.8 | 4.2 (x1.24) -> 3.4 (x0.98) | 3.6, 4.7 (91, 94) | 6.1 (x1.47) -> 4.8 (x1.16) (100) |
| Kept up zone 35, normal | 1.9, 2.0 | 2.5 (x1.31) -> 2.3 (x1.20) | 2.1, 2.1 (100, 100) | 3.1 (x1.48) -> 2.9 (x1.37) (100) |
| Kept up zone 35, the Fenmother | 8.4, 9.7 | 12.3 (x1.36) -> 10.2 (x1.13) | 10.2, 11.5 (56, 61) | 17.3 (x1.59) -> 14.3 (x1.32) (95 -> 98) |
| Kept up zone 38, normal | 2.6, 2.2 | 3.9 (x1.62) -> 3.3 (x1.40) | 3.1, 2.9 (100, 100) | 5.0 (x1.67) -> 4.4 (x1.47) (100) |
| Kept up zone 38, boss | 7.0, 7.0 | 10.1 (x1.44) -> 8.5 (x1.21) | 8.7, 8.6 (71, 82) | 13.7 (x1.59) -> 11.6 (x1.34) (100) |

Played well every hero wins every fight. **Survival:** played casually Tobin wins 98-100% of fights everywhere (Wren
56-91% of bosses, Pip 61-94%), and loses 6-15% of his max HP a boss fight (Wren 23-56%, Pip 20-50%; he lost 7-19%
before). Over the whole table Tobin went from about 1.43 times the Wren and Pip mean to about 1.24 (1.19 played
well, 1.28 casually). Wren and Pip did not change.

**Why he was slow:** not his Attack. On the same save Tobin's Attack is within 10% of Wren's and Pip's. It was his kit:

- Wren crits (25% base, +5% an Aim, Deadeye's sure crit), and Pip's Fireball adds a Burn and spends Cinders. Tobin's
  damage was flat: Shield Bash 160%, Heavy Strike 200%, Hammerfall 140% + 25% a Grit, and an Attack worth +3% a Grit.
  Played casually he parries less, so he had less Grit, fewer counters and fewer cooldown refunds: his casual gap
  (x1.3-1.7) was wider than his good one.
- Grit came only from Attacks and parries, and his best sets cast an ability almost every turn, so Hammerfall usually
  spent 2-3 Grit.
- His counters hit the softest of the three (1.5 Attacks against Wren's 2.0), though he is the hero who parries.
- Shield Bash's opening (Exposed) only paid off with Heavy Strike or Hammerfall, so a fresh Tobin (Bash alone) wasted it.
- Sunder (100%) and Shield Throw (140%) were the weakest hits in his kit, so his armour-breaking sets were the slowest.

**What changed** (`TURN_TUNE` and 24c; `heroX` is unchanged, so this is his kit, not a flat bump):

- **Shield Bash** gives 2 Grit (`bashGrit`), hits for 170% (was 160%), and Tobin's own Attack now takes its opening
  (Exposed: 25% harder), so Bash, then Attack, is a combo from his first fight.
- **Grit pays more:** each Grit adds 6% to his Attack (was 3%, `gritDmg`) and 45% to Hammerfall (was 25%, `gritHammer`).
- **His counters hit 20% harder** (`counterX.tobin` 1.2): the parry hero's payoff.
- **Sunder** hits for 140% (was 100%) and **Shield Throw** for 200% (was 140%).

His Grit damage reduction, HP, Speed (9) and Guard are unchanged, so his survival edge stays whole.

**Left open:** the stages do not agree. At zones 20-30 played well he now kills as fast as Wren and Pip (x1.0), while
at zone 38 he is still x1.4 on normal foes, and 4.4 turns a normal foe played casually (one set over the band of 4; his
best set, Bash, Hammerfall and Heavy Strike, takes 4.0). Part of it is Last Stand: his finisher does no damage, while
Wren's and Pip's do, so his late sets trail. A look at Last Stand (a Grit payoff, say) is the next lever, not more
power across the board.

### Boss pass (2 October 2026; owner: "make the bosses take longer and still hit hard")

The owner's direction: "Yes make the bosses take longer and still hit hard. We should feel it necessary to scale
ourselves with crafting higher level gear. With that said, it should always be very bad for us to get hit by a boss.
Regular monsters we should be able to take a few bits but bosses should be serious." Like Expedition 33: basic enemies
die quickly, bosses take a lot of hits.

**Before:** a boss took 3-10 hero turns with no rise through the game (zone 30: 3.1-3.7), a landed boss hit cost the
kept-up and fixture heroes 14-17% of their max HP (Wren and Pip at their zone's reference: 14-34%), and played casually
they won 84-100% of bosses.

**What changed** (`TURN_TUNE.boss` in 59k; normal foes, elites, the reference tables and zones 1-3 are unchanged):

- **Longer bosses.** A zone boss's HP (16 reference Attacks) x `hpX`, a zone table: 1 to zone 3, 1.45 at 10, 1.85 at 20,
  3.3 at 30-34, 1.5 from 36 (the reference Attack's region step at 35 already makes zones 35+ longer). The region boss
  (30 Attacks) x `regionHpX` 1.25.
- **Harder hits.** Every boss hit x `hitX`: 1 to zone 3, 1.3 from zone 6, 1.95 from zone 35 (the late-zone pass set the
  reference HP below a kept-up hero's there). A charged move x `chargeX` on top: 1.3, 1.35 from zone 35. A charge can
  still be broken (a Stun, a Freeze, or 6% of the boss's HP while it gathers). The basic boss set's Heavy Blow (the
  Coast's elders) hits for 0.3 of the reference HP (was 0.28), like the other sets' big single hits.
- **Boss pay.** Gold and XP x (1 + half the boss's extra length): a longer boss pays more, and an hour of zone play pays
  about as before (bot, good play, a zone of 5 foes and its boss: zone 8 -3%, zone 20 -11%, zone 38 -5% gold an hour).
- **Not the Deepwell or the Provings.** Their bosses pass a move set (59c, 59f), so the Deep Elders (14 Attacks, HP
  carried) and the Bridge Beetle (hits as shares of your own health) keep their numbers; runs still end where they did.
- **The sim** meets a zone boss at full health, as the game does (it carried HP from one boss to the next before: casual
  boss wins were too low by up to 30 points). The turns report has a column for what a landed hit, a landed charge and
  a fight cost in max HP, and four gear profiles: the mid save a gear tier behind and ahead (tier 2 or 4 for its tier 3),
  and the kept-up zone 38 Pip a tier behind and ahead (tier 3 or 5 for her tier 4; tier 5 opens at zone 42).

**After** (`node tools/sim.mjs --report turns --seeds 2` and `--report heroes --seeds 2`; good / casual; "hit" and
"charge": one landed, undefended, as a share of max HP; before -> after):

| Profile | Boss turns, good | Boss win, casual | Boss hit / charge | Normal turns, hit |
|---|---|---|---|---|
| Fresh heroes, zone 1 | 3.7-5.0 (unchanged) | 92-100% (unchanged) | 26-34% / 47-64% (Tobin 6 / 10) | 1.4-3.0, 18-25% |
| Early fixture (Wren, zone 8) | 4.0 -> 5.0 | 100% | 17 / 32% -> 23 / 54% | 1.3, 12% |
| Zone 8 stage (Wren, Pip, Tobin) | 4.2-4.9 -> 5.2-6.3 | 92, 100, 100 -> 63, 94, 100% | Wren 44%, Pip 33%, Tobin 7% | 1.7-1.9 |
| Mid fixture (Tobin, zone 20) | 5.5 -> 9.9 | 100% | 1 / 2% -> 2 / 3% | 2.7, 1% |
| Zone 20 stage | 4.8-4.9 -> 8.1-8.3 | 98, 100, 100 -> 39, 85, 100% | 38%, 28%, 6% | 2.0-2.2 |
| Zone 30 stage | 3.1-3.7 -> 9.1-11.2 | 100 -> 48, 54, 100% | 30%, 22%, 5% | 1.4-1.9 |
| Kept up, the Fenmother (Pip) | 9.4 -> 11.6 | 99 -> 51% | 14 / 26% -> 27 / 69% | 2.0, 9% |
| Kept up, zone 35 stage | 8.5-10.1 -> 10.4-12.3 | 84, 94, 100 -> 15, 27, 99% | 37%, 27%, 6% | 1.9-2.3 |
| Kept up, zone 38 (Pip) | 6.9 -> 10.0 | 100 -> 76% | 14 / 26% -> 28 / 68% | 2.7, 10% |
| Kept up, zone 38 stage | 6.9-8.4 -> 9.9-12.0 | 94, 100, 100 -> 21, 50, 100% | 39%, 28%, 7% | 2.2-3.3 |
| Late fixture (undergeared, zone 38) | 10.4 -> 15.4 | 42 -> 0% (good: 95%) | 28 / 50% -> 55 / 133% | 3.8, 19% |

Stage rows are Wren, Pip, Tobin from `--report heroes` (the stage's middle hero at the zone's reference Attack and HP).
Played well every kept-up hero wins 100% of bosses. Normal foes did not change: 2-4 turns, and a landed hit costs a
kept-up hero 9-13% (the reference hero 13-25%). Tobin stays the safest (99-100% of bosses played casually, 6-7% a hit)
and a little slower (x0.97-1.20 played well, x1.08-1.36 casually).

**Gear matters** (good: turns, win %; casual win %; a landed boss hit):

| Hero | A tier behind | As is | A tier ahead |
|---|---|---|---|
| Kept-up Pip, zone 38 boss | 15.3 turns, 85%; casual 0%; 84% | 10.0, 100%; 76%; 28% | 6.5, 100%; 100%; 9% |
| Kept-up Pip, zone 38 normal | 3.7 turns; casual 84%; 29% | 2.7; 100%; 10% | 1.9; 100%; 3% |
| Mid Tobin, zone 20 boss | 12.8 turns, 100%; 100%; 3% | 9.9, 100%; 100%; 2% | 7.1, 100%; 100%; 1% |

A tier behind, a boss hit takes most of your health and its charge kills you outright: casual play loses every boss
and good play loses 1 in 7. A tier ahead, bosses take a third fewer turns and barely hurt. Tobin's save carries eight
times the reference HP, so on him gear shows only in the turns.

**Stars** (`--stars typical`): a strong set still takes about a quarter off a boss (zone 38 10.0 -> 7.5 turns, the
Fenmother 11.6 -> 8.8, the mid Tobin 9.9 -> 8.0) and lifts casual wins (zone 38 76 -> 97%, the Fenmother 51 -> 72%).

**Left open:**

- **Mid-game HP** and **Wren is fragile**: done in the mid-game HP pass (below).
- **The Fenmother** sits mid-band (11.6 turns, Wren-Pip-Tobin 10.4-12.3), not at the top: longer cost too many casual
  wins (51% for the kept-up Pip).

### Mid-game HP and Wren (2 October 2026; owner: "it should always be very bad for us to get hit by a boss")

The boss pass met the owner's direction for kept-up late heroes but left two gaps (its "Left open" list): the
reference HP sat at 1.2 x `mobHp` for zones 1-34, far below a real hero's, so mid-game boss hits landed at a third to a
half of their designed share; and Wren lost far more of her health to a boss hit than Pip did.

**Measured: a hero who keeps up** (`node tools/sim.mjs --report heroes`, whose zone 8-34 stages are now these heroes):
their own class set and a Charm at the zone's gear tier, rare +5, Training at their level, Attack scaled to the zone's
reference Attack and HP by the same factor (HP grows with Attack in the game: it is `heroAtk` x the class's HP). Max HP
as a share of `mobHp` (Wren before her x1.2 below in brackets):

| Zone | Wren | Tobin | Pip | `refHpX` before -> after |
|---|---|---|---|---|
| 5 | 1.79 (1.49) | 4.73 | 1.93 | 1.2 -> 1.72 |
| 8-10 | 2.63 (2.19) | 7.52 | 2.85 | 1.2 -> 2.5-2.64 |
| 15 | 3.00 (2.50) | 9.02 | 3.24 | 1.2 -> 3.0 |
| 20 | 3.93 (3.28) | 12.2 | 4.25 | 1.2 -> 4.0 |
| 25 | 3.22 (2.68) | 10.0 | 3.49 | 1.2 -> 3.45 |
| 30 | 2.48 (2.07) | 7.73 | 2.69 | 1.2 -> 2.9 |
| 34 | 1.82 (1.52) | 5.67 | 1.97 | 1.2 -> 1.85 |

The same hero in epic +10 has about 1.7-2x these. HP rises to zone 20 as each gear tier adds HP lines, then falls with
the reference Attack (tier 4 lasts from zone 19 to 41). The fixtures as they are: the early Wren (zone 8, tier 1 common,
a tier behind) 1.6, the mid Tobin (zone 20) 9.9, the late Pip (zone 38) 0.48.

**Why Wren was fragile.** Her HP comes from her Attack (`heroAtk` in 59-combat `statUnit`), and her Attack still carries
the real-time fight's damage parity (`SOLO_TUNE.heroX`: Wren 0.76, Pip 1.15, Tobin 1.2). Turn fights give that back to
her damage (`TURN_TUNE.heroX`) but not to her HP. At the same level, Training and gear she had 1/1.5 of Pip's max HP;
her armour (20 to Pip's 10) gave a little back, so a hit cost her about 1.4x. Her kit has no Ward, Guard or Grit.

**What changed** (`TURN_TUNE` in 59k; zones 1-3, the Provings and the Deepwell's numbers are unchanged):

- **Reference HP** (`refHpX`): the Wren and Pip middle of the table above: 1.2 to zone 3, 2.5 at 8, 3 at 15, 4 at 20,
  2.9 at 30, 1.85 at 34, then as before (0.95 at 35, 0.6 at 38, 0.4 from 42). It still grows every zone in absolute
  terms.
- **Normal foes** hit x0.7 from zone 8 to 34 (`normHitX`), so a landed normal hit costs a kept-up hero 10-11% (it was
  4-11%, and would have been 15-17% without this).
- **Bosses** (`boss.hitX`, `boss.hpX`): with HP at the kept-up hero, the old x1.3 put a landed boss hit at 27% and casual
  players still won 97% of bosses at zones 8-15. Boss hits are now x1.4 at zone 6, x1.6 from 8 to 15, x1.5 at 20 and
  x1.3 from 26 to 34; x1.9 from 35 (was 1.95, which with Wren's new HP put the kept-up zone 38 Pip's hit at 24%). Boss HP
  is x1.8 at zone 10 (was 1.45), 2.3 at 15, 2.2 at 20 (was 1.85), 2.4 at 25, then as before (3.3 at 30-34, 1.5 from 36),
  so zone 15 bosses reach the 8-10 turn band.
- **Wren:** her max HP in turn fights is x1.2 (`heroHpX`; the real-time fight is unchanged), and a kit trait, **Out of
  Reach**: after she dodges a hit, the rest of that move hits her 30% softer (`reach`). It shows on her Dodge card
  (Hero > Abilities) and in the Dodge help. Strings and charged moves are where it counts.
- **The Deepwell** keeps the first reference HP (`deep.refHpX`, 1.2 to zone 34) and its foes' hits as written: its depth
  curve and Oil were set against it. Runs end where they did (probe below).
- **The Provings** are unaffected: their foes hit for shares of your own health, and the normal-foe factor skips them.

**After** (`--report heroes --seeds 2`, before -> after; Wren, Pip, Tobin; "hit": one landed boss hit, undefended, as a
share of max HP; good play wins 100% of bosses everywhere, before and after):

| Stage | Boss turns, good | Boss win, casual | Boss hit (charge) | Normal hit |
|---|---|---|---|---|
| Zone 1 (fresh) | 4.9, 3.7, 5.0 (same) | 95, 100, 100 -> 98, 100, 100 | Wren 34 -> 29 (64 -> 53), Pip 26, Tobin 6 | Wren 25 -> 20 |
| Zone 8 | 5.1, 5.5, 6.4 -> 6.0, 6.3, 7.5 | 100, 100, 100 -> 84, 89, 100 | 16, 13, 2 -> 34, 34, 5 (81) | 9, 7, 1 -> 10, 11, 2 |
| Zone 15 | 5.3, 5.9, 7.0 -> 7.0, 8.0, 9.5 | 100, 100, 100 -> 73, 74, 100 | 13, 11, 2 -> 34, 34, 5 (81) | 7, 6, 1 -> 11, 11, 2 |
| Zone 20 | 6.7, 8.6, 8.2 -> 7.7, 10.1, 9.7 | 100, 100, 100 -> 61, 61, 100 | 10, 8, 1 -> 32, 32, 5 (72) | 5, 4, 1 -> 10, 10, 2 |
| Zone 25 | 6.9, 10.9, 8.3 -> 6.6, 10.3, 7.9 | 100, 99, 100 -> 86, 39, 100 | 11, 9, 1 -> 28, 28, 4 (65) | 6, 5, 1 -> 10, 10, 2 |
| Zone 30 | 7.0, 11.9, 10.0 (same) | 99, 96, 100 -> 83, 31, 100 | 14, 11, 2 -> 27, 27, 4 (74) | 8, 7, 1 -> 11, 11, 2 |
| Zone 34 | 9.2, 11.9, 12.8 (same) | 72, 77, 100 -> 57, 36, 100 | 21, 18, 3 -> 28, 27, 4 (62) | 11, 9, 1 -> 10, 10, 2 |
| Kept up, the Fenmother | 10.4, 11.6, 12.3 (same) | 15, 27, 99 -> 25, 30, 99 | 37, 27, 6 -> 30, 26, 6 (77) | 12, 9, 2 -> 10, 9, 2 |
| Kept up, zone 38 | 10.2, 9.9, 12.0 (same) | 21, 50, 100 -> 41, 51, 100 | 39, 28, 7 -> 31, 27, 6 (76) | 13, 10, 2 -> 11, 10, 2 |

Normal foes: 100% won, played well or casually, in 1.2-2.5 hero turns (kept-up heroes kill them quicker than the 2-4
band; unchanged). Tobin stays the safest (99-100% of bosses casually, a boss hit 4-6% of his health) and a little slower
(x1.05-1.33). Before the pass, on the old footing (the lamp's gear refitted, HP at the reference), Wren won 15-63% of
bosses casually and Pip 27-94%; now Wren and Pip are level on a hit (within 1 point to zone 34, 27-31% to Pip's 26-27%
after), and Wren's casual wins sit within 5 points of Pip's to zone 20 and above them after, where she kills faster.

**Gear matters** (`--tier -1` and `--tier 1`: every worn piece a tier behind or ahead, the stage's scale kept; Wren and
Pip; good turns, good win %, casual win %, a boss hit):

| Stage | A tier behind | As is | A tier ahead |
|---|---|---|---|
| Zone 8 | 7.5-8.1, 99%, 19-22%, 66% (charge 158%) | 6.0-6.3, 100%, 84-89%, 34% | 4.3-4.9, 100%, 100%, 15% |
| Zone 20 | 11.3-14.0, 88-91%, 1%, 78% (177%) | 7.7-10.1, 100%, 61%, 32% | 5.4-7.0, 100%, 100%, 12% |
| Zone 30 | 10.6-16.5, 87-96%, 0-4%, 68% (183%) | 7.0-11.9, 100%, 31-83%, 27% | 4.4-8.1, 100%, 100%, 10% |
| Kept up, zone 38 | 15.2-15.3, 85-88%, 0%, 82-94% | 9.9-10.2, 100%, 41-51%, 27-31% | 6.5-6.7, 100%, 100%, 8-10% |

A tier behind, a boss's charge kills you outright and its plain hits take two thirds of your health: casual play loses
nearly every boss and good play loses 1 in 10. A tier ahead, bosses take a third fewer turns and barely hurt. On the real
saves (`--report turns`): the early Wren (a tier behind at zone 8) takes 48% a hit and 116% a charge, and wins 59% of
bosses casually (was 100%); the mid Tobin takes 6% (was 2%), 13% a tier behind; the kept-up zone 38 Pip 27% and 66% (was
28% and 68%), 82% and 200% a tier behind.

**Stars** (`--stars typical`) still take a noticeable chunk off a boss: the kept-up zone 38 Pip 10.0 -> 7.5 turns, the
Fenmother 11.6 -> 8.8, the mid Tobin 11.5 -> 9.4, the early Wren 5.8 -> 5.5.

**The Deepwell** (a probe bot: acts at once, parries and dodges at the good and casual rates, takes the first boon,
Refill at landings; 4 runs): the mid save reaches floor 18.8 played well and 11.5 casually, the late save 21.3 and 17.5,
the same before and after (the Deepwell keeps its own reference). **The Provings**: unchanged (`tools/check.mjs` "C29
Deepwell and Provings in turns").

**Left open:**

- **Zones 6-10 stay kinder.** Kept-up heroes win 84-89% of zone 8 bosses casually, above the 40-70% aim, at the top of
  the hit band (34%) and in the 5-7 turn band. Going lower would break one of those bands; the early fixture (a tier
  behind) wins 59%.
- **Kill speed, not HP, splits Wren and Pip from zone 25.** On the same Attack Wren kills a boss in 6.6-9.2 turns and
  Pip in 10.3-11.9, so Pip wins 31-39% casually at zones 25-30 and Wren 83-86%. Wren's quiver gives crit, and her
  striker lines (Attack, crit) work in turn fights; Pip's lantern gives spell power, and the caster lines (spell, area,
  control) are not read by turn fights at all. A damage parity look (what spell power does in turns), not an HP one.
- **The Fenmother** still sits below the casual band (25-30%); the region boss is the hardest fight of the Hollow.

## Art

No new art. The three starters keep their approved icons; the other 39 abilities show a lettered tile on the bar and
the Abilities view until their icons are drawn. Hero poses reuse what the hero already has (their attack and ability
poses). The boss and normal foe moves reuse the foe's current art. Status chips use Codex's approved status icons. The
ability art brief (`ability-art-brief.md`) is the list of what is still needed. The 25 Stars show a two-letter tile (the art freeze); they
need an icon each when their pack is drawn.

## Not in this build yet

- **Captains, Champions and Elders of Darkness** with their own moves and art: the zone bosses are still the old Elders,
  with new turn move sets.
- **Balance** beyond first numbers: the turn-based pacing sim (`tools/sim.mjs --report turns`) needs rewriting for
  active-only play.
