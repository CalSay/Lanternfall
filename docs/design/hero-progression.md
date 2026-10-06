# Hero progression (decided 2026-10-06)

Owner decisions from the "Is hero XP the right progression" review. The full review, with sims, the red team and the
options Cal turned down, is in the project folder at `design-reviews/hero-progression-2026-10-06.md`.

## Why it changed

- Hero level today is mostly a permission. Its real job is the cap on Training, and Training is where the power is:
  Attack Training 33 hits about 5,700 against 4 untrained (`40-rules.js:71`, `:96`), while Lv 33 gives x2.28
  (`40-rules.js:89`).
- Switching hero on a zone-20 save sends the new hero back to about zone 6. In scratch sims a Lv 1 hero with Training 33
  won 91-100% at zones 20 and 25, and a Lv 33 hero with no Training lost every fight at zone 20.
- The Training screen's only real choice is "Attack to the next multiple of 5", and talent and star points stop mattering
  by level 13 to 18 (Why review, 2026-10-06).
- Research (fun library): walls are the top reason long-play players leave; build depth is the most praised theme;
  players of roster games praise shared or flexible levels (AFK Arena's Resonating Crystal) and dislike re-levelling
  every hero (Idle Champions).

## The design

1. **No Training for Attack, Parry and Dodge.** They come from hero level, star points and abilities.
2. **Hero level carries the power curve.** The XP needed for a level follows the road: a hero reaches the level a zone
   expects by playing that zone, so the curve never walls on its own.
3. **Each level gives attribute points** to spend (E33-style), so two players' copies of a hero can be built
   differently. Attributes give shape, a fixed pool across a few stats with real trade-offs, not plain extra damage.
   A respec is available.
4. **Weapons scale with chosen attributes,** so crafting makes weapons that fit a build. This rides the Why review's
   crafting card (Smithing sets a rarity floor).
5. **A new hero joins at the road's level:** the level the road expects where the player is when the hero joins.
   **Benched heroes earn half XP.** No other catch-up.
6. The story never restarts. It belongs to the save; a hero who joins takes the lamp where you stand.

## Left to the build card

- The level curve by zone, and the level -> Attack, Parry and Dodge formulas, tuned so level alone wins at the zone
  it is meant for (sim at the casual and good personas).
- The attribute list and points per level; respec cost.
- What star points buy so the budget binds (Why review card `build-layers`); talents as a free toggle.
- Ability Training: Cal named only Attack, Parry and Dodge. Default: ability power also follows hero level, so the
  Training screen goes entirely. The judge may keep ability Training if it is the better gold sink.
- Gold: owned by the Why review card `gold-without-training` ("gold buys means, not stats": Forge +1 to +10 upgrades as
  the main sink, then crew, supplies and buildings). Not designed here.
- Save: Training fields are dropped. Per the saves rule, bump the save key rather than migrate.

## Turned down

One lamp level shared by the save (too large a rewrite, removes per-hero builds); shared Training per save (replaced by
no Training); perks learned by wearing gear, abilities learned from bosses, per-hero camp scenes that unlock skills
(too many heroes: the roster is 34).
