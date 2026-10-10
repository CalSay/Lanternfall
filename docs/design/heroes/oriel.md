# Oriel Vess, the Starcaller: fight kit, how a player meets her, pose list

Card `oriel-ability-spec` (Cal, 10 Oct 09:51: "Shall we work on adding a different hero into the game with the new art? I'd like to see
Oriel I think"; 09:56: "We have an ability list that codex already made"). Status: **spec, judge ruled 2026-10-10 (section 10).**
No code here: `route-s-oriel-wire` builds it, the art thread draws it.

Starting list: Codex's hero-13 kit in `docs/design/hero-abilities-34.json` (branch `codex/hero-animation-icons`, commit 227bda46;
copy at `/mnt/project-files/heroes/oriel/hero-abilities-34.json`). It is the older 12-card shape with its own rules (U, H/F
counts, snapshots, alignment charges). This doc fits it to today's game: 6 shared caster moves + 8 of her own (DECISIONS,
Abilities), her type data (frost damage, Stun status: `21x-data-types.js:96`), the 1.0 build (Chapter 1, zones 1-35) and
damage-on-impact (#348: a hero action lands in its 'strike' phase after `fxImpactIn(id)`).

Facts checked at `6e534acc`: she exists as roster data only (`56-roster.js:33`, Epic caster, Dusk circle), unlocked by crafting
the Star Chart (`55-crafting.js:92`: item tier 3, so Enchanting 22 (`20-data.js:49` `stationReq`), 40 Crystal, 20 Essence, 1 Wraith
Veil) and gated by her story scene at zone 116, Chapter 4 (`56c-unlocks.js:81` `STORY_MEET`). Lines and tales exist
(`21-stories.js:30, 82, 115, 184-187`). Her Omen line waits for zone 141 (`21j-lore-omens.js:75`). She has no fight moves.

## 1. Her loop, and how she plays differently from Pip

**Call a star, hold out until it lands, and bring it down early when the fight turns.** One star at a time: Falling Star calls
it, and it lands after her next 2 turns for a big frost hit and a Stun. While it falls she builds Bearings with Attack and
softens the foe with Chill and Weaken. When a boss starts gathering a charged move (which the game shows as it starts, never
before: "No telegraph", DECISIONS, The hero), she can Call It Down and drop the star on it now.

**Pip burns; Oriel stops.** Pip's damage comes over time: she sets a Burn, feeds it and cashes it in, and her defence is Arcane
Ward. Oriel's damage comes late and in one piece, and her defence is taking the foe's turns away: the star's Stun, Freeze from
Chill, Weaken and Pin from Ill Omen. Pip asks "is the fire still going?"; Oriel asks "is my star still up there, and is now the
moment to pull it down?". On a boss a Stun is a Stagger and a charge-breaker rather than a lost turn, so her boss play is
reactive: keep a star falling, and spend it on the charge you can see.

## 2. Her resource: Bearings

`HERO_RESOURCE.oriel = { name: 'Bearings', txt: 'Bearings: each Attack gives 1, up to 4. Your falling star hits harder for each one
you hold when it lands. Starfall spends them all for a big blast.' }`

- Attack gives 1 after contact (as Aim, Grit and Cinders). Take a Bearing gives 2. Starbolt gives 1 when no star is falling.
- Cap 4 (`turnGain` caps every resource but Aim and Grit at 5 today: the build adds Bearings' cap). Resets every fight. The star
  reads Bearings and does not spend them; only Starfall spends them.
- Spark keeps Pip's Cinder rider for Pip. For Oriel it gives nothing (no resource hook: Pip's text and numbers do not change).

## 3. The falling star (the rule the build adds to 59k)

- **Falling Star** queues one star: `h.fall = 2`. It counts down after each of Oriel's own completed actions (Attack or an
  ability; Parry and Dodge happen in the foe's turn and do not count). After the action that takes it to 0, the star lands.
- **What the star reads, all at landing, nothing at cast:** ability power (level, Focus, gear) at that moment; base 220%, plus
  20% for each Bearing held then (added, not multiplied: at most 300%); one crit roll; type frost. **No one-action boost rides
  it:** not Take a Bearing's +30%, Keen, Afterglow, News Arrives, uniques' one-action gains or the Stars' (lessons, Combat: never
  let a one-action boost ride stored damage). A Blind on the hero does not make it miss (it is not her swing).
- **Then it Stuns** (`turnControl(m, io, 'stun')`): an ordinary foe loses its next turn; a boss Staggers (25) and a gathering
  charge breaks under the usual rules, rallies included. **When the control lock blocks the Stun** (a Stun or Freeze in the foe's
  last 3 turns), the star adds 1 Chill instead, and the countdown chip says "No Stun yet" while the lock holds, so the trade is
  visible.
- **One star at a time.** While one falls, Falling Star is not usable ("Your star is still falling."). A star still falling when
  the fight ends is lost.
- **The chip** on the foe reads "Falls in 2", "Falls in 1" in the frost colour (Chilled blue). Text calls it "your star"; never
  "Star 2" (it would read as the Stars system, the Star Chart or the Chained Star).
- **Rally gates:** the landing counts as part of the action it lands after, so the gate that caps one move caps the star too.
- **Afterglow and Hex:** the landing counts as a spell that hits (Afterglow arms for the next Attack; a Cursed foe stores 20% of it).
- **Live fight (damage-on-impact):** the action's pose plays and lands at its strike as usual. If the star is due, `turnHeroDone`
  then runs a **second strike**: it plays the fx recipe `oriel:star` (a bolt of light falling from above the foe's aim point, on
  Moonlit Volley's `rainAt`/`rainFly` timing), waits `fxImpactIn('oriel:star')`, applies the hit and Stun, and only then hands the
  turn to the foe. Reduced motion shows it as a still light, as every recipe does.

## 4. The kit: 6 shared + 8 her own

Fields as `24c-data-abilities.js` `A(hero, code, id, name, short, kind, tier, pow, cd, dt, desc, line)`. Power is a share of
ability power. Cooldowns count her turns. Numbers are starting values for the sims in section 6; the judge ruled on the shape.
Ids equal the art thread's pose ids, so each move finds its frames by name.

### Shared caster pool (6, unchanged)

The same six as Pip, same ids, numbers and text: Spark (C1, fire), Frost Shard (C2, timed), Arcane Ward (C3), Hex (C4),
Afterglow (C5, passive), Nova (C6). Spark stays a fire bolt for her too (the pool is shared, so its type and its 62b recipe stay).

### Her own 8

**Display names (Cal, 10 Oct 11:12, "Can you rename the abilities officially"):** players see star names; the ids stay Codex's
(they key saves, art and fx). `fallingletter` Falling Star, `pullreading` Call It Down, `bearing` Take a Bearing (kept),
`clearnight` Starbolt, `badnews` Ill Omen, `letters` Shooting Star, `slivershum` Starfall, `newsarrives` News Arrives (kept).
The shared caster moves and her damage type belong to `hero-themed-kits` (Cal 11:10: no intentionally shared abilities).

| Code | Id | Name | Short | Kind | Tier | Power | CD | Type | Timed | Effect (desc) | Line |
|---|---|---|---|---|---|---|---|---|---|---|---|
| O1 | `fallingletter` | Falling Star | Star | damage | 0 (starter) | 2.2 | 4 | frost | no | Call down a star. It lands after your next 2 turns for 220% power, plus 20% for each Bearing you hold then, and Stuns the foe. One star at a time. | A star lands in 2 turns and Stuns. |
| O2 | `pullreading` | Call It Down | Call | damage | 2 | 1.0 | 3 | frost | no | If your star is falling, pull it down now at 80% of its power. It still Stuns. If not, a frost hit for 100% power. | Brings your star down now. |
| O3 | `bearing` | Take a Bearing | Bearing | buff | 2 | 0 | 4 | frost | no | Gain 2 Bearings. Your next ability that hits directly hits 30% harder (not your star, even when you pull it down). | 2 Bearings. Next hit +30%. |
| O4 | `clearnight` | Starbolt | Bolt | damage | 3 | 1.4 | 3 | frost | yes | A star bolt for 140% power that adds 1 Chill. If no star is falling, gain 1 Bearing. | A bolt. Chill, and a Bearing. |
| O5 | `badnews` | Ill Omen | Omen | debuff | 3 | 0.8 | 5 | frost | no | Read the foe its fate: 80% power, and it is Weakened for 2 turns (25% less damage). If your star is falling, it is also Pinned: its next attack is easier to read, and it slows. | Weakens. Pins while a star falls. |
| O6 | `letters` | Shooting Star | Shooting | damage | 4 | 1.5 | 5 | frost | yes | A sweep of force for 150% power. If your star is falling, it falls 1 turn sooner (with 1 turn left, it lands after this). | Hurries your star. |
| O7 | `newsarrives` | News Arrives | Arrives | passive | 4 | 0 | 0 | frost | no | Passive. While your star is falling, your Attacks hit 25% harder. | Passive: Attacks hit harder while a star falls. |
| O8 | `slivershum` | Starfall | Starfall | finisher | 5 | 1.6 | 7 | frost | yes | Finisher, from your third turn. 160% power, plus 40% for each Bearing; uses them all. Needs 2 Bearings. | Spends all Bearings for a blast. |

Perfect presses (`ABILITY_PERFECT`): `clearnight: '1 more Chill'`, `letters: '1 Bearing'`, `slivershum: '2 Bearings come back'`
(the refund lands after the spend, so a star landing after Starfall reads 2). With the shared Frost Shard that is 4 timed moves,
as every hero has (DECISIONS, Abilities).

Order inside one action, for the readers that care: the action's own hit and riders, then its resource gain or spend (Starfall's
spend, then its Perfect refund), then the countdown, then the star if it is due. So Starfall before a landing leaves the
star at 0 to 2 Bearings: spending them first or letting the star read them is the player's call.

Statuses she uses all exist: Stun, Chill (3 = Freeze), Weaken, Pin. Stun and Freeze share the control lock (section 3).

Abilities screen groups (`HERO_PATHS.oriel`, 4/5/5 like Pip's):
- **The Star:** fallingletter, pullreading, letters, newsarrives
- **Clear Sky:** clearnight, frostshard, bearing, slivershum, spark
- **Omens:** badnews, hex, arcaneward, nova, afterglow

### What changed from Codex's kit, and why

| Codex card | Here | Why |
|---|---|---|
| Falling Letter | O1, the starter, now Stuns | Her type data is frost/Stun; the starter carries the identity (as Bash, Fireball, Echo do: W10 found the signature moves win most). Holy becomes frost. |
| Pull the Reading | O2, kept | The early-landing choice is Codex's core decision, and it is how she meets a charge. |
| Take a Bearing | O3, kept | "Alignment charge" becomes a plain next-hit boost, kept off the star. |
| Clear Night | O4, kept, adds Chill | Gives her the frost path to Freeze. |
| Bad News | O5, kept, untimed, Pin rider | Codex's "no reveal" stays (no telegraph); Pin is the existing "easier to read". 3 own timed + Frost Shard = 4. |
| Letters Unsent | O6, simplified | Codex's two-branch choice needs a choice screen mid-turn. Now it only hurries the star. |
| Sliver's Hum | O8, now the finisher | Its two-hand lunge pose reads as her biggest move; it spends Bearings as Final Echo, Hammerfall and Lanternburst spend theirs. It no longer lands the star (red team: star + Hum in one action was 7.2 of ability power). |
| Fold the Chart | **cut** | Cancelling your own star for a Ward overlaps Arcane Ward and feels bad. |
| Someone Looks Up | **cut** | A mid-fight heal is a rule no other hero has outside Last Stand; every boss table would need re-fitting. |
| News Arrives | O7, her one passive | The simplest of the three, and it rewards waiting. |
| Chart by Hand, Sky Answers | **cut** | One passive per signature set (DECISIONS). Sky Answers made Attack queue stars: a second source of the one rule. |

Codex's U, H/F, snapshot and alignment rules are not carried over: the game's own rules (59k) apply.

## 5. How a player meets her in the 1.0 build

**Pick (judge): (b). She joins the way the starters do: her scene plays on the zone 20 Champion's card (the Sepulchre Engine, end
of the Beetle Barrows), and she joins at the first clear of that Champion, at the road's level** (`STORY_BEATS.npc.oriel.at =
'champPost:engine'`, beside Maren's scene there, Maren's first; `STORY_MEET.oriel = [21, 1]`). She is the fourth hero who can carry the lamp. **The Star Chart
stops being her gate and becomes her hero quest** (DECISIONS: every hero ships with a quest): same recipe and cost, crafted after
she joins; the quest card decides what burning it gives.

- **Why not (c), the Star Chart as the gate:** the chart is an item-tier-3 craft, so it needs Enchanting 22, and the Enchanter's
  Table lags every gate (a casual player has about 10 at zone 15: `skilling-crafting-overhaul/curve.md` miss 2). Under (c) many
  players would never meet her in 1.0. Cutting the cost instead would change the economy for a story reason.
- **Why not (a), a pick at the start:** the first hour comes first; a fourth starter adds a choice to the very first screen with a
  hero no first-hour route has measured, and spends her Chapter 4 scene on minute one.
- **Why zone 20, not zones 5-15, 25 or 30:** zones 5, 10 and 15 are the starters' joins and the first two hours are already
  tight. Zones 20 to 30 are where every hero stalls (`pacing-turn-era.md`): a casual player reaches zone 20 on about day 5 but zone
  25 only on days 15 to 27, so zone 20 puts a new toy where the game is thinnest, for most players, and keeps the 5, 10, 15, 20
  join rhythm. Her scene is about the star she has come to watch fall in the Quarry Ruins ahead (the Chained Star, zone 30
  Champion), which plants that fight; she then has the zone 25 and 30 Champions and the Fenmother to use her charge-breaking star
  on. (Zone 25 and 30 were the other candidates; the judge chose 20 for the day-5 reach.)
- **Story cost, and how it is kept small:** Chapter 4 area 3 (The Starscar) stays the reveal: "It's your lamp, seen from above. I
  could always see it. I think the dark just learned to look." Her Chapter 1 scene does not say the new star is yours; it is about
  the Chained Star she has come to see fall. Her tale "What the Stars Want" (`21-stories.js:187`) already notices a new star "the night you took up the
  road", and stays the only plant. Chapter 3's "I know where your fire is" is untouched. Her Omen lines still wait for Chapter 4.
  The canon change (she travels with you from Chapter 1) goes in the digest for Cal's veto.
- **What "ships complete" still needs (DECISIONS, The hero: art, kit, Hallowed looks, subclasses, an unlock route, a hero quest, a
  part in the story):** this card gives the kit and the route. A story card writes her zone 20 scene and Quarry lines; the quest
  card gives the Star Chart its reward; Hallowed looks and her subclass follow the other three's cards. The wire card ships her
  kit and join; she is not "1.0 complete" until those land, and the M1a tracker should say so.
- **Data the wire card sets:** `SOLO_HEROES.oriel = { key: 'oriel', base: 'mage', kit: 'lanternmage', weapon: 'Staff', role:
  'Caster', range: 'Ranged, frost', abs: ['fallingletter'], eq: ['fallingletter', null, null] }` (`heroHasKit` needs
  `CLASS_DEFS[base].kit === kit`, `56-roster.js:68`, and the mage's kit is `lanternmage`); `SOLO_ORDER` gains her; the route in
  `56c-unlocks.js` joins on meet as the starters do. She arrives with Falling Star and spends the lamp's spare Scrolls first, as
  any joining hero does (DECISIONS, hero progression).
- **Money:** she is earned in play. Whether later heroes are ever sold is Cal's call, not this card's.

## 6. Numbers: the balance-pass shape and the sims a build card must run

She must land inside the band the other three set; she is not tuned to beat them. Measure on the live turn rules at the build's
own head, **with Wren, Tobin and Pip in the same run** (the W10 numbers predate the foe kits, #341, and Pip's corrected figure),
arrival and kept-up footing (`tools/budget.mjs buildCore`), casual (parries 25%, dodges half the rest), good (60%, 90%) and
never-defends players, 240 fights a cell, every fight its own seed, `almanac.force('none')`. Her slots on arrival are what a
joining player has: Falling Star plus the moves the lamp's spare Scrolls teach, from a walk save at zone 20.

1. **Where she plays:** the zone 20 Champion (her join fight is the next one), the zone 21-24 Captains, the zone 25 Champion,
   the zone 26-29 Captains, the zone 30 Champion, the zone 31-34 Captains and the Fenmother. Pass: casual inside the three starters' spread on each row, good 95-100, never-defends no
   higher than the highest starter.
2. **Ordinary and elite fights** at zones 21-34 (bands: normal 90-100, elite 75-97, DECISIONS, Combat), and the **switch row**:
   swapped in for the hero who leaves, her normal fights stay within 10 points of theirs (DECISIONS, hero progression). Short
   trash fights are where a 2-turn star is weakest: if she is under band there, tune Starbolt and News Arrives, not the star.
3. **The W10 loadout table** (`autopilot/reports/why/W10-data/abilities.mjs`, every 3-move set in its best slot order) at the
   zone 20, 25 and 30 Champions: her best / median / worst sets inside the starters' range from the same run.
4. **Her default slots** against her best set: the gap no wider than Pip's in the same run.
5. **Gain cap pairs:** every pair of rules one hero can wear in one move stays under the boss-fight damage gain cap (+50%) and
   never passes a rally gate in one move: Take a Bearing then Starfall with 4 Bearings; the star with 4 Bearings after Shooting
   Star; Call It Down at 80% after Take a Bearing (the boost must not reach it); Starfall with Swift Tide (finisher from turn 1); and the Stars
   rules Ringing Blow, Dazed Prey, Snare and Shatterpoint against the star's Stun and Chill (`docs/lessons.md`, Combat).
6. **The bot's policy** (the sampler casts the first ready move in slot order, which is wrong for her): never Falling Star while a
   star falls; Call It Down when a boss starts a charge with a star falling, or when the foe would die before the star lands;
   Shooting Star when the star has 2 turns left; Starfall at 4 Bearings or with no star falling. A test asserts each.
7. `node tools/health.mjs --compare` before and after: no change for Wren, Tobin and Pip.
8. **The sampler matches the live fight:** the same seeded fight through `turnCombatSample` and through the live turn loop lands
   the star on the same turn, for the same damage and Stun. A test asserts it (the odds readouts come from the sampler, and the
   star is the first hit that lands in a second strike phase).

Tuning order if she is out of band: Falling Star's base power, then the star's per-Bearing bonus, then Starfall's
per-Bearing power, then Starbolt and News Arrives for trash fights. Never the Stun, the one-star rule or the shared pool.

## 7. Pose list for the art thread

All 8 frames (Cal 09:51), facing right, from the pack at `/mnt/project-files/experiments/2d-poses-scenario/oriel-moves/`. The
impact frame is the art thread's "release" frame: damage-on-impact lands the act there. The emit point is where the game draws the
effect from, as a fraction of that cut frame's box (x from her back edge, y from the top), read from the impact frame; the wire
card re-measures on the packed frames. No effect is drawn in the art: bolts, rings, wards and the falling star are the game's
(62b recipes).

| Move id | Used by | Frames | Impact frame | Emit point (frame: x, y) | Effect the game draws |
|---|---|---|---|---|---|
| `attack` | Attack | 8 | 5 | staff star, 5: 0.91, 0.25 | a small frost bolt to the foe (62-stage `oriel: ['bolt', '#C8C0FF']`) |
| `fallingletter` | O1 | 8 | 5 | raised fingertip, 5: 0.54, 0.03 | a thin light going up; the "Falls in 2" chip appears on the foe |
| (no pose) `oriel:star` | the star landing | 0 | landing | above the foe's aim point | a bolt of light falling onto the foe, frost burst, Stun |
| `pullreading` | O2 | 8 | 4 | the star falls from above the foe (fist 4: 0.96, 0.67 only for the no-star frost hit) | the star yanked down, or a frost hit |
| `bearing` | O3 | 8 | 5 | staff star, 5: 0.89, 0.06 (a buff, no hit on the foe) | a glint on the staff star; a buff ring on her |
| `clearnight` | O4 | 8 | 4 | open palm, 4: 0.97, 0.28 | a pale-blue star bolt, Chill on hit |
| `badnews` | O5 | 8 | 5 | staff star, 5: 0.92, 0.08 | a wave from the staff; Weaken (and Pin) marks on the foe |
| `letters` | O6 | 8 | 5 | open book, 5: 0.91, 0.27 | a sweep of force from the pages; the chip ticks down |
| `slivershum` | O8 | 8 | 5 | staff star, 5: 0.92, 0.24 | the big charged blast (finisher) |
| `spark` | C1 | 8 | 4 | two fingers, 4: 0.99, 0.27 | Pip's Spark fire bolt (shared recipe) |
| `frostshard` | C2 | 8 | 4 | staff star, 4: 0.91, 0.21 | Pip's Frost Shard recipe |
| `arcaneward` | C3 | 8 | 6 | her body centre, 6: 0.45, 0.55 (book 0.90, 0.23) | Pip's Ward recipe |
| `hex` | C4 | 8 | 5 | clawed hand, 5: 0.92, 0.19 | Pip's Curse recipe |
| `nova` | C6 | 8 | 4 | staff butt on the ground, 4: 0.87, 0.99 | Pip's Nova recipe (shared; a ground ring only if the shared recipe changes for both) |
| `parry` | Parry | 8 | 3 (the block) | staff middle | parry flash |
| `dodge` | Dodge | 8 | 3 (in the air) | none | none |
| `hit`, `idle`, `defeat`, `victory` | | 8 each | none | none | none |
| `mining`, `woodcut`, `forage`, `hunt` | gathering | 8 each | mining 5, woodcut 5, forage 4, hunt 5 | tool head | the game-placed axe on `woodcut` (empty fists) |

Passives (Afterglow, News Arrives) have no pose. **Cut, not used:** `foldchart`, `looksup` (drawn, kept on file, not wired).
Nothing needs redrawing for the kit: every kept move keeps its drawn pose. The art judge still vets the whole pack.

## 8. What the wire card must change outside 24c (found by the red team)

- The caster pool is shared: today its ids carry `hero: 'pip'`, and the hero checks (`56e-abilities.js:40, 50`,
  `75-abilities-ui.js:280`) and the per-hero save blank (`56e-abilities.js:36`) know only the three starters. Add a `pool` field the
  checks accept; keep one `path` per hero by reading `HERO_PATHS[hero]` rather than the single `ABILITIES[id].path` field.
- `FX_RECIPES` are keyed by ability id, so the shared moves use Pip's recipes; Oriel's own 8 and `oriel:attack`, `oriel:star` get new ones.
- `turnHeroDone` gets the star's second strike (section 3); `turnGain` gets Bearings' cap; `turnUsable` gets the one-star rule.
- `HERO_RESOURCE.oriel`, `ABILITY_PERFECT` lines, `HERO_PATHS.oriel`, the bot policy (section 6), and talents for her 8 (two each,
  as every ability has: the wire card's planner writes them).

## 9. Out of scope

Code (`route-s-oriel-wire`), the art and its vetting, Scenario credits, the scene's words (a story card), the Star Chart quest's
reward (a quest card), Hallowed looks and her subclass.

## 10. Judge ruling (Opus high, 2026-10-10; red team first)

1. **The kit: approved as written.** Stun, Pin, Weaken and Chill are existing 59k states; 4 timed moves and one signature passive
   match DECISIONS; reading every star value at landing, with no one-action boost riding it, keeps the stored-damage lesson. "Burns
   vs stops" is a real difference from Pip, and Call It Down trades a turn's damage for timing. The cuts are right, and every
   kept move fits a drawn pose. Numbers stay starting values.
2. **How she joins: (b), at the zone 20 Champion, not 25.** Casual players reach zone 20 on about day 5 and zone 25 on days 15 to
   27, so zone 20 meets them in the stall. The story cost is the same; the Chapter 4 reveal is untouched. (c) is out on Enchanting
   22. The Star Chart becomes her hero quest.
3. **Numbers and sims: enough,** with the zone 20 rows and the sampler-matches-live row (8) added.

Veto phrase for Cal: **"Oriel joins at zone 25"**. Red team findings and how each was answered: this card's thread; the changes
are in sections 3 to 8.

## 11. Design-doc rubric lines

- **Player problem and evidence:** Cal asked to see Oriel with the new art (10 Oct 09:51). Every hero stalls between zones 20 and
  30 for days (`pacing-turn-era.md`), and the 50-hour run shows a 12-hour wall near zones 24-25 (lessons, Economy: "No hard
  progress walls"). A new hero at the start of the stall gives the player something new to try there.
- **Coverage-map areas:** 14 (heroes and build variety), 7 (progression curve), 21 (long-term retention).
- **Predicted effect:** her casual win rates sit inside the starters' spread on every section 6 row (pass), and swapped in for the
  hero who leaves, her normal fights stay within 10 points. Missed means any row outside the spread after the tuning order in
  section 6 is spent; then the wire card stops and a judge re-rules.
- **Switch off and saves:** the wire card puts her join behind one flag (as `STORY_TUNE.joinOnMeet` is for the starters). Off:
  she stays roster-only, and a save where she already carries the lamp hands it back to the hero who last carried it. Her state is
  new fields with defaults in `fresh()`; no save key bump. Nothing here touches the Cal-only list.
