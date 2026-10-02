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
  (Tobin), Embers (Pip).
- **Its turn:** one move, of one or more hits. Every hit can be parried or dodged. A parry is harder, blocks the hit and
  takes 1 turn off every cooldown. Parry every hit of a move and you counter (a sure crit). A dodge is easier and only
  avoids the hit.
- **Bosses** have four moves in turn: two attacks, a charged move, a third attack. A charged move takes a turn to gather
  (a red banner says so) and lands on its next turn as a string of big hits. Stun or Freeze it, or hit it for 6% of its
  max HP while it gathers, and it breaks: it loses its next turn instead. Below half HP a boss gets faster. You meet a
  boss at full health.

## Where the abilities sit

- **On the action bar:** three ability slots (Q, W, E) above Parry, Dodge and Attack. This is the bar the game already
  had. A passive takes a slot, has no button and is always on; its slot shows blue. A slot shows its cooldown in turns,
  "T3" for a finisher before your third turn, and "!" when it needs something first (a Burn, 2 Grit, 3 Embers, a parry).
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
cards at the bottom. They are named talents, not stars, so they do not clash with the Stars view (the old talent map).

There are no suggested builds (owner: finding what works should be hard and rewarding).

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
- The reference hero's max HP: 1.2 x `mobHp` to zone 34, then 0.95 at 35, 0.6 at 38 and 0.4 from 42 (`TURN_TUNE.refHpX`).
  Both still grow every zone in absolute terms (Attack about 11-13% a zone from 33 to 42), so the Deepwell's
  `turnPowerZone` still works.
- A normal foe has about 5 Attacks of HP (the Thorn Imp and Gloomjaw 4), an elite 9, a zone boss 16, a region boss 30.
  With abilities that is 2 to 4 of your turns for a normal foe and 5 to 9 for a boss. The first three zone bosses are
  easier (65%, 80%, 90% of that HP) while you learn to parry and dodge.
- A normal move does about 20% of the reference HP, split across its hits. Boss moves do 25-50%, often in strings of 2
  to 4 hits with uneven rhythm.
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

Sim pass (`node tools/sim.mjs --report turns`, 2 seeds; the late rows from the late-zone pass; "good" parries 60% of
hits and dodges 90% of the rest, "casual" 25% and 50%; the bot acts at once, so real fights take longer):

| Profile | Foe | Good: win %, hero turns | Casual: win %, hero turns |
|---|---|---|---|
| Fresh Wren, zone 1 | normal | 100%, 2.1 | 94%, 2.6 |
| Fresh Wren, zone 1 | boss | 99%, 5.0 | 59%, 5.8 |
| Fresh Tobin, zone 1 | boss | 100%, 6.0 | 100%, 7.7 |
| Fresh Pip, zone 1 | boss | 100%, 3.9 | 85%, 4.5 |
| Early fixture (Wren, zone 8) | boss | 100%, 4.1 | 91%, 4.9 |
| Mid fixture (Tobin, zone 20) | boss | 100%, 6.4 | 100%, 8.0 |
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
played casually. Zones 1-34 are unchanged, and so are their rows.

## Art

No new art. The three starters keep their approved icons; the other 39 abilities show a lettered tile on the bar and
the Abilities view until their icons are drawn. Hero poses reuse what the hero already has (their attack and ability
poses). The boss and normal foe moves reuse the foe's current art. Status chips use Codex's approved status icons. The
ability art brief (`ability-art-brief.md`) is the list of what is still needed.

## Not in this build yet

- **Captains, Champions and Elders of Darkness** with their own moves and art: the zone bosses are still the old Elders,
  with new turn move sets.
- **Balance** beyond first numbers: the turn-based pacing sim (`tools/sim.mjs --report turns`) needs rewriting for
  active-only play.
