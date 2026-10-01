# C22 brief: the enemy overhaul for one-on-one turn combat

Status: **brief for Codex** (owner, 2026-10-01). Design only: no art, no runtime. Step 2 of `balance-roadmap.md`.
Read with `hero-abilities.md` §2a (the binding combat rules) and `e33-reference.md` (the reference game).

## 1. What the owner asked for

1. **Review the enemies in the game now** and decide whether each is cool enough for one-on-one combat. A foe that
   only made sense in a pack of six (a swarm, a "hits the party" foe) is reworked or retired.
2. **Build a deep pool of enemies per area and per region.** Today each area has one foe type (Mossy Hollow: Moss
   Slime). Fighting the same foe 300 times is what the overhaul fixes.
3. **Start building each enemy's attacks:** basic enemies 1-2 moves, bosses 3-4, enemies may attack more than once in a
   turn cycle, attacks may be several hits.

Numbers come later (step 3, the balance patch). Give **relative** values: damage as a share of a hero's HP at that
zone, HP as hero actions to kill, Speed relative to the hero.

## 2. The world you are filling

| Region | Zones | Areas (the 7-place cycle; each area repeats 5 times, I to V) | Status |
|---|---|---|---|
| 1. The Hollow | 1-35 | Mossy Hollow, Batwing Caves, The Bonefield, Beetle Barrows, Fungal Deep, Quarry Ruins, Wraithmarsh; region boss the Fenmother (zone 35) | in game: 7 foes, 7 elders |
| 2. The Sunken Coast | 36-70 | Grey Shingle, Gullcliffs, The Wrecks, Kelp Shallows, Glimmer Lagoon, Drowned Saltreach, The Coral Nave; boss Silas the Fogbound | designed (`region-2.md` §4), not built: plays the Hollow's foes |
| 3. The Emberwaste | 71-105 | `lore.md` (suggested zone types) | sketched |
| 4. The Pale Reach | 106-140 | `regions-4-5.md` §1.5 | designed |
| 5. The Gloamvale | 141-175 | `regions-4-5.md` §2.5 | designed |

Also in scope: **elites** (7 traits today: Shielded, Leeching, Explosive, Summoner, Enraged, Ice-Clad, Cursed),
**champions**, **zone elders** (one per area), **region bosses**, **Deepwell** floors and the three **Hunting beasts**
(Enraged Boar, Bristleback Wolf, Fen Lizard: they have art; give them moves too). The **world raid stays out** (online).

Lore rule (`lore.md` 4.1): every monster is a creature or person the dark sat on too long. Beaten, they go back to
what they were. Keep that tone.

## 3. Combat rules every enemy follows

- **One hero against one enemy at a time.** No packs on the stage in turn mode. A "pack" becomes a short **gauntlet**
  of foes fought one after another (proposal: a zone fight is 3-5 foes in a row from the area's pool).
- **Speed timeline** (`hero-abilities.md` §2a): a faster enemy sometimes acts twice before the hero acts again. No side
  acts more than twice in a row (bosses up to 3).
- **One enemy action = one move.** A move is 1-5 hits (bosses up to 7). Each hit is its own parry-or-dodge choice.
  **Every parried hit takes 1 turn off every hero cooldown. The counter only comes if every hit of that move was
  parried.** No hit is parry-only or dodge-only.
- **Timing patterns are the enemy's personality.** Use them: quick, slow, delayed (a pause before the hit), feint
  (a fake start), a rhythm change mid-combo (slow-slow-fast), a long charge. The telegraph (C25 profile "tell") must make
  each pattern learnable.
- **Moves per tier:**

| Tier | Moves | Shape |
|---|---|---|
| Normal | 1-2 | one bread-and-butter move plus, often, one with a twist (a delayed hit, a status, a 2-3-hit combo) |
| Elite | 2-3 + its trait | a normal foe's moves, harder, plus the elite trait (§5) |
| Elder (zone boss) | 3-4 | one teaching move (the fight's lesson), one combo, one charged or telegraphed big hit, optional phase change |
| Region boss | 4 + phases | as an elder, with 2-3 phases and the region's story beat |

- **Every boss has one charged move the player can interrupt** (E33's Eveque core): a Stun, Freeze or enough damage
  during the charge stops it. Bosses take Stun as Stagger (`hero-abilities.md`).
- **Enemy statuses** may hit the hero: Burn, Bleed, Venom, Chill, Weaken, Blind, and new ones if a foe needs them. Each
  one must be answerable by play (parry it, dodge it, cleanse it, or kill the foe first).
- **Auto/idle must survive.** Auto parries 10% and dodges 25%. Every normal foe must be farmable on Auto at its zone;
  only bosses demand hand play. Say for each foe how Auto fares.

## 4. Deliverables

### 4.1 Audit of the current foes

For each of the 7 Hollow foes, the 7 Hollow elders, the Fenmother, the 7 elite traits, the 7 designed Coast foes and
elders, and the 3 Hunting beasts:

- **Keep / rework / retire** for one-on-one, with one line why.
- What makes it cool alone (or what is missing).

### 4.2 The pool per area

For **every area of the Hollow and the Coast**, in full:

- **4 normal foes** (the area's current foe, reworked, plus 3 new). They fit the area's place and lore, differ from
  each other in how they fight (one fast and light, one slow and heavy, one tricky, one that sets up a status), and
  share the area's damage-type lean so the area still teaches something. Each foe also gets a rarer **variant**
  (a tougher cousin) that can roll as an elite base.
- **The elder** (zone boss), 3-4 moves.
- The area's **gauntlet mix**: which foes appear together, and in what order.

For **the Emberwaste, the Pale Reach and the Gloamvale**: names, one-line concepts and move lists for the same counts,
without full detail. Region bosses for all five: full detail for the Fenmother and Silas; outlines for the rest.

That is 28 + 28 normal foes in full detail (Hollow and Coast), 84 in outline, plus elders and bosses.

### 4.3 Each foe's card

| Field | Content |
|---|---|
| Name, area, tier | |
| Concept | one line, the lore rule in mind |
| Speed | slower / equal / faster than the hero, and how often it acts twice |
| Toughness | HP in hero actions to kill (normal foes 3-5, elites 6-8, elders 10-15; per `e33-reference.md`) |
| Armour, weak to, resists | damage types from `21x-data-types.js` (phys, holy, poison, fire, frost) |
| Moves | name, hits, timing pattern (e.g. "slow-slow-fast"), damage per hit as % hero HP, status, telegraph |
| What it tests | the one thing the hero must do well against it |
| Auto | how Auto/idle fares (must farm, for normal foes) |
| Hero matchups | which of Wren, Tobin, Pip it favours or punishes, and which abilities answer it |
| Drops | its signature drop (keep the existing material families: `21-data-craft.js`, `region-2.md`) |
| Art note | the poses it needs: idle, each move's wind-up and hit, hurt, defeated (art comes later; this sizes the job) |

### 4.4 Elites, champions, Deepwell

- **Elite traits** reworked for one-on-one (a Summoner cannot fill the stage; a Leeching foe needs counterplay).
- **Champions**: what makes one different from an elite.
- **Deepwell**: how its floors draw from the pools.

## 5. Constraints

- **In reach of the engine.** Moves are hits with timings, statuses, buffs on the foe, a charge, a heal, a summon that
  joins the gauntlet queue (not the stage). No positioning, no terrain.
- **No art yet**, but keep the pose count per foe small (about 5-7 poses), and reuse a skeleton within an area where it
  fits.
- **Keep material drops and region identities** as designed. Do not change shared online data.
- **Plain names** a player would say. Hard-to-pronounce names only for bosses.

## 6. How to deliver

A branch `codex/c22-enemies` with `docs/design/enemies-c22-*.md` (one file per region is fine). Post a summary on PR #1.
Claude merges and takes it to the owner, then step 3 (the number squish) balances heroes and foes together.
