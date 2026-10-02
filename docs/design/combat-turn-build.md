# Turn combat: the build (C29)

Status: built on `claude/elegant-johnson-m6k00u`, 2 October 2026, for the owner to play in the preview. This is how the
turn fight now works in the game. It follows the owner's decisions in `combat-turns.md` and the C19/C22 designs
(`hero-abilities.md`, `ability-tree-details.md`, `enemies-c22-final-contract.md`). Where those left a choice open, this
page says what was picked.

## What changed for the player

- **Every zone fight is a turn fight** for the solo hero: zones 1 and up, regular foes, elites and zone bosses. The
  Deepwell and the world raid keep their own fights for now.
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

## Numbers (the reference hero)

Foe HP and hits are set against a **reference hero for the zone**, measured from the balance sim's saves at each
hero's frontier (three heroes, 25 days each, 2 October 2026):

- One Attack of the reference hero: a share of the zone's old foe HP (`mobHp`), 0.7 up to zone 10, then falling to 0.2 by
  zone 35. Gear gets harder to keep up as zones climb, and the sim shows it.
- The reference hero's max HP: 1.2 x `mobHp`.
- A normal foe has about 5 Attacks of HP (the Thorn Imp and Gloomjaw 4), an elite 9, a zone boss 16, a region boss 30.
  With abilities that is 2 to 4 of your turns for a normal foe and 5 to 9 for a boss. The first three zone bosses are
  easier (65%, 80%, 90% of that HP) while you learn to parry and dodge.
- A normal move does about 20% of the reference HP, split across its hits. Boss moves do 25-50%, often in strings of 2
  to 4 hits with uneven rhythm.
- Rewards per fight are higher, since fights are fewer: gold x3, XP x2.5, Essence chance x1.6 (`TURN_TUNE`).
  These are first numbers, to be set from the owner's play and a turn-based sim pass.

First sim pass (`node tools/sim.mjs --report turns`, 2 seeds; "good" parries 60% of hits and dodges 90% of the rest,
"casual" 25% and 50%; the bot acts at once, so real fights take longer):

| Profile | Foe | Good: win %, hero turns | Casual: win %, hero turns |
|---|---|---|---|
| Fresh Wren, zone 1 | normal | 100%, 2.1 | 94%, 2.6 |
| Fresh Wren, zone 1 | boss | 99%, 5.0 | 59%, 5.8 |
| Fresh Tobin, zone 1 | boss | 100%, 6.0 | 100%, 7.7 |
| Fresh Pip, zone 1 | boss | 100%, 3.9 | 85%, 4.5 |
| Early fixture (Wren, zone 8) | boss | 100%, 4.1 | 91%, 4.9 |
| Mid fixture (Tobin, zone 20) | boss | 100%, 6.4 | 100%, 8.0 |
| Late fixture (Pip, zone 38) | boss | 66%, 22.6 | 0% |

The late fixture is a weak hero for zone 38 (its Attack is a quarter of the reference); the coast's numbers need their
own pass once the coast has its own foes.

## Art

No new art. The three starters keep their approved icons; the other 39 abilities show a lettered tile on the bar and
the Abilities view until their icons are drawn. Hero poses reuse what the hero already has (their attack and ability
poses). The boss and normal foe moves reuse the foe's current art. Status chips use Codex's approved status icons. The
ability art brief (`ability-art-brief.md`) is the list of what is still needed.

## Not in this build yet

- **Star forks** (two choices per ability): later, with Stars.
- **Captains, Champions and Elders of Darkness** with their own moves and art: the zone bosses are still the old Elders,
  with new turn move sets.
- **The Deepwell and Trials** still use the real-time fight.
- **Balance** beyond first numbers: the turn-based pacing sim (`tools/sim.mjs --report turns`) needs rewriting for
  active-only play.
