# Hero kits: every ability belongs to one hero

Card `hero-themed-kits` (P1 spec). Status: **spec, judge ruled 2026-10-10 (section 9).** No code here: the build cards in
section 7 and the wire cards build it.

Cal, 10 Oct 11:10: "I think I want to remove the shared abilities. At least intentionally sharing. I don't mind if abilities do
similar things across heroes. But I think it causes theme issues when we have a star mage or a fire mage casting frost shard
for example." 12:02: "I still think we need to change the shared abilities into Oriel specific abilities."

Facts checked at `6658f2a5`: `src/js/24c-data-abilities.js`, `24d-data-turnfoes.js`, `24e-data-talents.js`, `24f-data-stars.js`,
`21x-data-types.js`, `21s-data-actionicons.js`, `59k-turn.js`, `62b-fx.js`, `56e-abilities.js`, `55-savecode.js`,
`tools/check.mjs`, `tools/sim.mjs`, `tools/budget.mjs` and `docs/design/heroes/oriel.md` (#350, names #352). A red team argued
against the first draft; its ten findings and the answers are in section 9.

## 1. The rule

**Every hero has 14 abilities of their own. No ability id or name appears in two heroes' lists.** Two heroes' moves may work
alike (a quick bolt, a ward, a curse); each hero's version has its own name, effect look and talents, and fits that hero.

- The kit keeps its shape: **6 style moves + 8 signature moves.** The style six are a template of mechanics that a style's heroes
  start from (archer, melee, caster), so a new hero is quick to build and stays in balance. They are no longer a shared pool.
- Everything else in DECISIONS, Abilities stays: 3 slots, at most 2 passives (one in the style six, one in the signature eight),
  4 timed moves a hero, Scrolls by tier, two talents an ability.
- **Talents follow their ability's theme.** A talent may change what a move does, and may swap its damage type only to another
  type that fits the hero (Pip's lantern light is holy). Never a frost talent on a fire hero.
- **Stars stay shared.** They belong to the lamp and any hero can set any star (24f: "think of this section like pictos"). A
  frost star on Pip is a build the player chooses, not a theme the game gives her. Statuses (Bleed, Chill, Stun, Pin, Cursed)
  are rules words that every hero shares.
- Future heroes (Elowen next, per Cal 12:02) get 14 of their own under this rule from the start.

## 2. What it changes, hero by hero

Today only Pip and Oriel break the rule. Wren's and Tobin's style six were only ever theirs (`hero: 'wren'`, `hero: 'tobin'`, all
physical) and fit them. Pip's include a frost move on a fire mage. Oriel (not in the game yet) borrows Pip's six outright.

- **Wren: no change.** Power Shot, Barbed Arrow, Pinning Shot, Hunter's Mark, Volley and Twin Shot are a night archer's
  arrows. Her 20 wired moves (#346) are untouched.
- **Tobin: no change.** Heavy Strike, Cleave, Sunder, Momentum, Brace and Lunge fit a sword-and-shield guard.
- **Pip: three style moves renamed, one of them reworked; three kept.** Spark, Hex and Afterglow stay. Frost Shard becomes
  Smoke Bolt (fire). Arcane Ward becomes Ashen Ward and Nova becomes Ring of Light (her lantern's holy light, as Lantern Flare
  is). Three talents lose their frost.
- **Oriel: six style moves of her own,** on her drawn poses, in place of the six she borrowed from Pip.

**Pip burns; Oriel stops** (oriel.md section 1) gets sharper: Chill and Freeze leave Pip's kit and live in Oriel's. Pip's new
control is smoke: a short Weaken, longer on a burning foe, and no lost turn.

## 3. The table

Fields as `24c` `A(hero, code, id, name, short, kind, tier, pow, cd, dt, desc, line)`. **Ids never change for moves already in
the game** (they key saves, talents, fx recipes, icons, poses and checks); only names, words and, where the table says so, rules
and types change. Numbers not named stay as they are. New numbers are starting values for the sims in section 6.

### Pip (ids kept)

| Code | Old id / name | New name (short) | Kind, tier, power, CD | Type | Status | Effect (desc) | Line | Pose | Icon |
|---|---|---|---|---|---|---|---|---|---|
| C1 | `spark` Spark | Spark (Spark) | damage, 1, 1.3, 2 | fire | none | unchanged | unchanged | `spark`, as drawn | keep |
| C2 | `frostshard` Frost Shard | **Smoke Bolt** (Smoke) | damage, 2, 1.1, 3, timed | **fire** (was frost) | Weaken | A smoky fire bolt for 110% power. The foe is Weakened for 1 turn (25% less damage), or 2 turns if it is burning. | Weakens. Longer on a burning foe. | `frostshard` (staff orb, level), as drawn | **new** (today's is a frost shard) |
| C3 | `arcaneward` Arcane Ward | **Ashen Ward** (Ward) | buff, 2, 0, 5 | holy (no hit; unchanged) | Ward | A ring of warm ash and ember guards you: a Ward worth 20% of your max HP for 3 enemy turns. | A Ward for 20% of your HP. | `arcaneward` (arms spread), as drawn | art judge re-checks fit |
| C4 | `hex` Hex | Hex (Hex) | debuff, 3, 0, 5 | holy (unchanged) | Cursed | unchanged | unchanged | `hex` (clawed hand), as drawn | keep |
| C5 | `afterglow` Afterglow | Afterglow (Glow) | passive, 3 | fire | none | unchanged | unchanged | none (passive) | keep |
| C6 | `nova` Nova | **Ring of Light** (Ring) | damage, 4, 1.6, 4 | holy (unchanged) | none | A ring of lantern light bursts from your staff for 160% power. | A strong blast of light. | `nova` (staff butt on the ground; the ring spreads from her feet), as drawn | art judge re-checks fit |

- Smoke Bolt: `ABILITY_PERFECT.frostshard` becomes `'the Weaken lasts 1 turn longer'`. Pip keeps 4 timed moves.
- Why Ring of Light stays holy: it is Pip's lantern light (her Lantern Keeper side), and it keeps her holy answer to the foes
  weak to holy (undead, spirit, drowned, deep: `21x-data-types.js:48-57`); as fire it would drop from 1.5x to 0.6x on drowned.
- Why Hex stays: it names no element, Pip is drawn as a hedge witch (pointed hat, spellbook), and the Witchfire and Evil Eye
  stars already tie Curse to her. Its burst stays holy for her (section 3, Oriel, on the burst's type).
- Hex, Spark and Afterglow's icons, names and rules do not change.

Pip's talents that change (same ids and A/B slots, so a saved pick carries to the new talent in its slot):

| Talent | Today | New (default; the build card's planner may reword) |
|---|---|---|
| `spark` B | Cold Spark: frost instead of fire, 1 Chill, no Cinder | **Lamp Spark:** holy instead of fire, the foe is Blinded for 1 turn, no Cinder |
| `frostshard` A | Rime Needle: also Weakens 1 turn | **Choking Smoke:** a burning foe is also Blinded for 1 turn |
| `frostshard` B | Thaw Point: a Freeze keeps Exposed 1 more turn | **Kindled Smoke:** on a burning foe, the Burn lasts 1 turn longer instead of the longer Weaken |
| `nova` A | Rime Ring: frost instead of holy, 1 Chill | **Fire Ring:** fire instead of holy, and it gives 1 Cinder |
| `pip:attack` B | Frost Touch: first Attack each fight Chills | **Warm Hands:** your first Attack each fight gives 1 more Cinder |

Kept: Bank the Spark, Mending Light, Hard Shell, Long and Short Sentence, Banked Flame, Clear Mind, Sheltering Ring. Pip's
Abilities groups keep their names and members (Lantern Keeper now holds Smoke Bolt, Ashen Ward, Ring of Light, Lantern Flare,
Cinder Heart).

### Oriel (new ids; she is in no save yet)

Her own 8 stay as oriel.md section 4 has them (names from #352), with one change: Starbolt no longer adds Chill (below). These
six replace the borrowed Pip moves, with the caster template's mechanics fitted to her. Her type is frost (section 4). Codes
continue her own.

| Code | Replaces | New id | Name (short) | Kind, tier, power, CD | Type | Status | Effect (desc) | Line | Pose | Icon |
|---|---|---|---|---|---|---|---|---|---|---|
| O9 | spark | `pointoflight` | Point of Light (Point) | damage, 1, 1.3, 2 | frost | none | A quick bolt of starlight for 130% power. | A quick bolt. | `spark` (two fingers) | new |
| O10 | frostshard | `hush` | Hush (Hush) | damage, 2, 1.1, 3, timed | frost | Chill (3 = Freeze) | A hushed bolt of cold starlight for 110% power that adds 2 Chill (it slows). At 3 Chill the foe Freezes: it loses its next turn and is Exposed. | 2 Chill. At 3 the foe Freezes. | `frostshard` (staff star, level; frame 6's breath puff suits the cold) | new |
| O11 | arcaneward | `duskmantle` | Dusk Mantle (Mantle) | buff, 2, 0, 5 | frost (no hit) | Ward | The dusk sky wraps round you: a Ward worth 20% of your max HP for 3 enemy turns. | A Ward for 20% of your HP. | `arcaneward` (arms spread) | new |
| O12 | hex | `foretold` | Foretold (Fate) | debuff, 3, 0, 5 | frost (no hit) | Cursed | Tell the foe how it ends: it is Cursed for 3 turns. It stores 20% of the damage it takes and takes it again when the Curse ends. | Curses: stores damage, then it lands again. | `hex` (clawed hand) | new |
| O13 | afterglow | `oldlight` | Old Light (Old Light) | passive, 3 | frost | none | Passive. After a spell that hits, your next Attack within 2 turns hits 50% harder. | Passive: an Attack after a spell hits harder. | none (passive) | new |
| O14 | nova | `turningsky` | Turning Sky (Sky) | damage, 4, 1.6, 4 | frost | none | The sky wheels round you: a ring of starlight for 160% power. | A strong blast. | `nova` (staff butt on the ground) | new |

- **Point of Light gives no Bearing.** A cooldown-2 Bearing source would keep her at the 4 cap, so the star would always land at
  300%. Her Bearings stay as oriel.md section 2 has them (Attack, Take a Bearing, Starbolt).
- **Hush is her one Chill move, and Starbolt drops its Chill.** Two timed cooldown-3 Chill bolts would not read apart. Starbolt
  (`clearnight`) becomes: "A star bolt for 140% power. If no star is falling, gain 1 Bearing." Its Perfect becomes
  `'a sure crit'`. Hush is her road to Freeze. `ABILITY_PERFECT.hush = '1 more Chill'`.
- Her 4 timed moves: Hush, Starbolt, Shooting Star, Starfall. Her passives: Old Light (style) and News Arrives (signature).
- **The Curse burst takes the type of the move that set it** (today 59k:1021 hard-codes holy). Pip's Hex stays holy;
  Oriel's Foretold bursts as frost. The rule change is one foe field, `curseDt`, defaulting to `'holy'` in the foe blank
  (59k:418-419); Hex's Short Sentence 30% hit reads it too. Pip's numbers do not move. (Witchfire keys on the burst's `kind`,
  not its type, `57e-stars.js:370`, so it still fires.)
- `HERO_PATHS.oriel`: **The Star:** fallingletter, pullreading, letters, newsarrives. **Clear Sky:** clearnight, hush, bearing,
  slivershum, pointoflight. **Omens:** badnews, foretold, duskmantle, turningsky, oldlight.
- Talents (two each, as every ability): her planner writes them, starting from Pip's talent in the same slot in her words and
  resource (Banked Flame becomes "1 more Bearing"). Where Pip's talent swaps the element, hers adds a rider instead (a Pin, a
  Mark or a Weaken): she has one element.
- oriel.md section 3 reads "Afterglow" and "Hex" as Old Light and Foretold: the star's landing counts as a spell that hits, and a
  foe under Foretold stores 20% of the landing.

**Names.** Checked unused in `src/js` at `6658f2a5`: Smoke Bolt, Ashen Ward (Codex's own name for Pip's ward in
`hero-abilities-34.json`), Ring of Light, Point of Light, Hush, Dusk Mantle (she is of the Dusk circle, `56-roster.js:33`),
Foretold, Old Light, Turning Sky, Lamp Spark, Choking Smoke, Kindled Smoke, Fire Ring (as a talent), Warm Hands. Avoided:
Glint, Halo, Cold Light, Lingering Light, Hearth (gathering, lore, story, class and camp words), "Night" (Wren's: Night Hunter,
Night Wings), "Chill" in a name (the status word), and "Star" beyond the four #352 names.

## 4. Oriel's damage type: frost (pick), not a new starlight type

**Pick: her rules type stays frost, and her moves are drawn and named as cold starlight.** Her effects are pale silver-blue light,
stars and a falling star, never ice shards; her move names say star, dusk and fate, never frost. Her statuses are Chill, Freeze,
Stun, Weaken and Pin. Her falling-star chip uses the frost colour (Chilled blue, `#56B4E9`), as oriel.md section 3 says. **No new
status colour is needed.**

What still says frost, plainly: the type icon on each of her damage numbers (the flake, `DT_INFO.frost`), "Resists frost" on a
frost-resistant foe, and the Chill badge Hush leaves. These are shared rules readouts, as they are for the other frost heroes and
as "Physical" is for Wren and Tobin. A star mage whose cold light chills is the theme; a star mage casting Frost Shard was not.

Why not a sixth type, "Starlight":
- The five types are pinned in the rules and checks: `DMG_TYPES` ("ids never change"), `check.mjs:5098` pins
  `'phys,holy,poison,fire,frost'`, and `check.mjs:8852` pins the 32-hero roster at 7/7/6/6/6 (Oriel frost, `21x-data-types.js:96`).
- Every foe family's weakness and resistances are written against those five (`FOE_FAMS`). A sixth type is neutral to every
  foe, so it adds a word and an icon but no choice; giving it weaknesses means re-fitting every family and the boss budget.
- The type colours are Okabe-Ito, chosen to read for colour-blind players. The set's two unused colours are a second blue
  (`#0072B2`) and a second orange (`#E69F00`), which sit beside Frost and Fire; neither gives starlight its own reading.

Holy was weighed again (Codex drew Falling Letter as holy): it fits light, but it is the priests' type (Maren, Hesketh, Elowen),
and it moves the roster split for no gain in play. If Cal wants starlight as its own type, that is a type-system card
(`DMG_TYPES`, `FOE_FAMS`, the roster split, icons, colour), not a rename.

## 5. Save impact

**No save key bump, no migration.**
- Wren and Tobin: nothing changes.
- Pip: every id is kept, so `S.abil.unl.pip`, `S.solo.eq.pip`, `S.abil.tal.pip` and save codes load as they are. Learned moves
  keep working under their new names and rules. A pick on a rewritten talent carries to the new talent in the same A/B slot; the
  patch note says Pip's frost talents changed. Picks are free toggles (DECISIONS, Abilities), so nothing is lost.
- Oriel: her ids are new and she is in no save yet. The wire card adds `oriel` to the save blank in `56e-abilities.js:36`
  (`unl`, `tal`) with defaults; an old save without those keys gets them from the blank (no key bump; lessons, Saves: "Add new
  per-item fields as optional").
- Save codes check every learned id against `ABILITIES[id].hero` (`55-savecode.js:236`); one hero per id keeps that check
  whole. The oriel.md section 8 plan for a shared `pool` field is dropped.

## 6. What a build must measure

- `node tools/health.mjs --compare` before and after the Pip build: Wren and Tobin unchanged.
- `tools/budget.mjs` boss rows for Pip at casual, good and never-defends, at every row it has for her (including the zone 30 and
  38 loadouts that use `nova`, `budget.mjs:114-115`): **predicted within 5 points of today's on every row, either way.** Missed: a
  row more than 5 points off. Then tune Smoke Bolt (Weaken length, power) in that order; never give Pip Chill back.
- The W10 loadout table for Pip at the zone 15, 20 and 25 bosses: Smoke Bolt's sets inside today's Frost Shard sets' range.
- The loadout-odds asserts (`check.mjs:17419-17544`) pin today's Learn order ("Ignite, Frost Shard, Arcane Ward" at zone 11).
  The build re-derives that order from the new sim output, writes the one exact new order into the assert (never an any-order
  check), and says so in its PR. A new expected order from new rules is not a loosened check; a renamed word is a rename.
- Thermal Shock: card 2 reports its FIT gain (`sim.mjs:2066`) with Smoke Bolt in place of Frost Shard. If the gain is under 3%
  on every Pip row, the Foreman cards a Thermal Shock rework for a judge: before 1.0 its only Chill source left is Cold Steel
  (Frostfire is found at zone 53), and a Pip-tagged star that never pays is a trap.
- Oriel's rows: every row in oriel.md section 6, re-run with her six style moves, is a pass condition for her wire card.
- A test asserts the rule: every `ABILITIES` id has one hero, every hero's `HERO_ABILITIES` has 14 distinct ids, and no two
  heroes' lists share a name.

## 7. Cards this needs

The Foreman writes them; the wire cards pick them up.

1. **`pip-icons-rethemed` (Codex), first.** A Smoke Bolt icon, and the art judge's ruling on whether today's `arcaneward` and
   `nova` icons fit Ashen Ward and Ring of Light (DECISIONS, Art: an icon goes in only if it fits the live ability's meaning),
   with Codex redrawing any that do not. Pip is a complete icon hero (`check.mjs:9695`, `COMPLETE = ['pip']`): every Pip move
   must have a vetted icon, so card 2 cannot ship before this one.
2. **`pip-themed-kit` (build, Opus medium; balance review Opus high), after card 1.** The Pip rows and talents above in `24c`
   and `24e`; the rules in `59k-turn.js` (the `frostshard` case: Weaken 1 turn, 2 on a burning foe, no Chill; the `spark` B,
   `nova` A and `pip:attack` B talents; the Curse burst reading a stored type); the 62b recipes (Smoke Bolt: smoke and fire, no
   frost shards; Ring of Light: a lantern-light ring; Ashen Ward: warm ash ring); the counter tips in `24d-data-turnfoes.js:70-76`
   (beetle and golem list `frostshard` with "Chill it twice to Freeze it" and "Freeze it": Pip's answer becomes Smoke Bolt and
   the tip says "or Weaken it"); the sims' loadouts (`sim.mjs:2062, 2066` pair Thermal Shock and Frostfire with `frostshard`);
   the 24c header comment ("6 from their style's shared pool"); `docs/GAME.md`; and the section 6 measures. Stars keep their
   `kit` tags (`check.mjs:2694` allows only wren, tobin, pip and all, and needs 8 for Pip; Thermal Shock and Frostfire read
   fire hits and Cinders, `57e-stars.js:338, 359`, so they stay Pip's). Thermal Shock gets weaker for Pip: her Chill now comes
   only from the Cold Steel and Frostfire stars (section 6 says what to measure). Card 2 also owns the section 6 rule test.
   Its patch note says Pip's frost talent picks now point to new talents. Card 1 gates when card 2 ships, not when it is built.
3. **`route-s-oriel-wire`** (already carded) builds her six from section 3 with new ids, Starbolt without Chill, and packs her
   drawn `spark`, `frostshard`, `arcaneward`, `hex` and `nova` frames under `pointoflight`, `hush`, `duskmantle`, `foretold` and
   `turningsky` (a file mapping at pack time, nothing redrawn).
4. **`oriel-fx-recipes`** (with the wire card or before it): 62b recipes for her 14 moves, `oriel:attack` and `oriel:star`, in
   cold starlight. The art thread's scratch star effects in the gallery are the reference; no effect is drawn into the art.
5. **`oriel-icons` (Codex):** icons for her 14 moves. She is not a complete icon hero until all 14 are vetted, so she ships with
   none of Codex's (the `COMPLETE` rule), as Wren and Tobin do today.

No new poses are needed for any hero: every changed move keeps a drawn pose whose motion fits, and the effects are the game's.
Nothing goes to the art thread for drawing; it gets this spec as the reference for her effects' look.

Wire card notes (added to each card file): `route-s-oriel-wire` builds the six new ids and drops the `pool` field plan;
`route-s-pip-wire` packs Pip's poses under unchanged ids, with effects that follow `pip-themed-kit`; `route-s-tobin-wire` renames
nothing.

## 8. Design-doc rubric lines

- **Player problem and evidence:** Cal's words (10 Oct 11:10, 12:02). Counted at `6658f2a5`: Pip has 1 frost ability and 3
  frost talents (Cold Spark, Rime Ring, Frost Touch) on a fire mage; Oriel's spec borrowed 6 of her 14 moves from Pip, so a star
  mage would cast Frost Shard and Nova. Codex's 34-hero list (`hero-abilities-34.json`) gives each hero 12 of their own but keeps
  six shared class tools each, so the clash would grow with every hero added.
- **Alternatives weighed:** (a) keep the pool and rename per hero at display time: rejected, because talents, fx, icons and poses
  are keyed by id, so the look and talents would still be shared; (b) 14 wholly new mechanics per hero: rejected for balance cost
  and Cal's "I don't mind if abilities do similar things"; (c) **the pick:** own ids, names, looks and talents on a template of
  mechanics, with live ids kept so no save changes.
- **Coverage-map areas:** 14 (heroes and build variety), 15 (world and story: a hero's moves say who they are). Compass pillar 3,
  Your hero.
- **Predicted effect:** after the builds, 0 ability ids or names shared between heroes (the section 6 test); Pip's boss rows
  within 5 points of today either way; Oriel's rows inside the starters' spread. Missed: any shared name, or a Pip row more than 5
  points off after the tuning order in section 6.
- **Switch off:** the Pip build is a data and rules change on unchanged ids; reverting its commit restores Frost Shard, and saves
  load either way. Oriel's six ship with her and her join flag.
- Nothing here touches the Cal-only list.

## 9. Red team and judge

Red team (Opus, read-only, on the first draft), ten findings, each answered in this draft:
1. Smoke Bolt "plain tile" breaks the complete-icons check for Pip: card 1 (icons) now goes before card 2 (build).
2. Retagging Thermal Shock, Cold Steel and Frostfire fails the Stars check and they do nothing for frost Oriel: tags stay.
3. Making Nova fire cost Pip her holy hits and left the counter tips stale: Ring of Light stays holy; 24d tips are in card 2.
4. Smoke Bolt (Weaken 2 + Pin, cooldown 3) copied Ill Omen and outclassed Tobin's Roar: now Weaken 1 (2 on a burning foe), no
   Pin; the miss threshold is two-sided.
5. The Curse burst is hard-coded holy: it now takes the setting move's type (Hex holy, Foretold frost).
6. The type reasoning had wrong refs and a false palette claim, and "cold starlight" hid the flake: refs fixed (the 7/7/6/6/6 is
   the 32-hero roster, `check.mjs:8852`), the palette line corrected, the flake stated plainly, Night Chill renamed Hush.
7. Point of Light's Bearing kept the star at 300%: it gives none, and her section 6 rows are a pass condition.
8. Name clashes (Hearth, Night, a repeated fate line, Smoke Touch beside Dim Its Eyes, two Chill bolts): Ashen Ward, Dusk
   Mantle, a new Foretold line, Warm Hands, and Starbolt drops its Chill.
9. Wrong check refs and stale tool loadouts: loadout-odds lines, `sim.mjs` and `budget.mjs` rows named in sections 6 and 7.
10. Wren and Tobin need no move changes (agreed); the 24c header and DECISIONS' "6 shared" lines are replaced.

**Judge (Opus high, 2026-10-10): approved, with four amendments, all applied above.**
1. **The rule: approved.** It matches Cal's "I don't mind if abilities do similar things." DECISIONS' 2026-10-01 Abilities
   bullets are reworded, not added to.
2. **Pip: approved.** Smoke Bolt fixes the theme and still costs Pip control overall; Ring of Light staying holy keeps her holy
   answer. Amendments: the loadout-odds assert keeps one exact re-derived order (A); card 2 reports Thermal Shock's gain and a
   rework is carded if it is under 3% (B).
3. **Oriel's six: approved,** with Starbolt losing Chill and Point of Light giving no Bearing. Amendment: the burst type is a
   `curseDt` foe field defaulting to holy, and Short Sentence reads it (C).
4. **Damage type: frost, drawn as cold starlight, approved.** A sixth type adds a word but no choice, breaks two pinned checks,
   and has no free colour; holy is the priests'. This is the most contestable call, so it carries the veto.
5. **Save impact: sound.** No key bump; the patch note says Pip's frost talent picks now point to new talents.
6. **Buildable: yes.** Card 2 owns the rule test, the 24c header and `docs/GAME.md` (D).

Veto phrase for Cal: **"Give Oriel her own Starlight damage type"**.
