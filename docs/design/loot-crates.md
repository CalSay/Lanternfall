# Loot crates: five tiers for boss wins

Status: proposed. The paid version is decided (below); the tiers wait on Cal's OK (thread "Loot crates", 2026-10-10). Owner of the wire-up: a card written after the OK.
Builds on: Lantern Caches (`55-caches.js`, `75-caches-ui.js`, DECISIONS "Lantern Caches" and "Looks"), the planned
`cache-art` and `cache-looks` cards, and the monetisation plan (`/mnt/project-files/monetisation/plan.md`, section 5).

## The idea in one line

Codex's crates become the Lantern Cache you already open on a boss's first clear. The boss's rank sets the crate's tier,
and a higher tier holds rarer looks.

## What the player sees

1. A boss falls for the first time. A crate drops in the colour of its tier.
2. The crate shakes, then opens with a burst of light in that colour.
3. Inside is what the win paid (gold, Essence, a Scroll, a Star, the unique) and, from its tier's pool, a chance at a look.
4. The crate prints its odds and its pity line: "Rare look: 1 in 2. Certain within 2 more Rare crates."
5. At an Epic or Legendary crate you pick one of three looks.
6. With reduced motion on, the crate shows already open, with no shake and no burst.

## The five tiers (Chapter 1, 35 first clears)

The tier comes from the boss's rank (`bossTierOf(z)` in `40-rules.js`) and how far into the chapter it stands. Names
and looks are Codex's pack (`art/loot-crates/` on `codex/sovereign-crate-reveal`, 8f432095). Each crate's look rarity
uses the game's rarity colours (`MOMENT_RARITY` in `75-moments-ui.js`).

| Tier | Crate | Boss | Chapter 1 zones | Crates | Look roll |
|---|---|---|---|---|---|
| I | Roadworn (worn timber, iron) | Captain | 1-4, 6-9, 11-14 | 12 | Common look, 1 in 3, certain within 4 |
| II | Ironbound (green timber, bronze) | Captain | 16-19, 21-24, 26-29, 31-34 | 16 | Uncommon look, 1 in 2, certain within 3 |
| III | Gilded (walnut, gold leaf) | Champion | 5, 10, 15 | 3 | Rare look, certain |
| IV | Sovereign (plum-black, amethyst) | Champion | 20, 25, 30 | 3 | Pick one of three Epic looks |
| V | Hallowed (ivory, gold sunburst) | Elder | 35 (later every Elder and the Voice) | 1 | Pick one of three Legendary looks |

The first hour (zones 1 to 10) shows two kinds: Roadworn crates at every Captain and a Gilded crate at both Champions.
That gives the "three peaks, rising" shape a bigger crate at each peak. The odds and pity numbers above are placeholders:
the Opus economy judge sets them after a sim pass, as `cache-looks` already requires.

## What a crate holds, and what it never holds

- The win's own drops, exactly as today. A higher tier never pays more gold, Essence, materials or relics, and never raises
  the unique's chance. Rarer loot means rarer looks, so the tiers add no power and need no economy change.
- One look roll, drawn only from looks of that tier the save does not own. There are no duplicates, so no duplicate currency.
  When a tier's pool is all owned, the crate says so and pays nothing extra.
- Each tier has its own pity counter, printed on the crate.
- The zone 1 to 3 and 7 to 9 lantern colours stay as they are: a certain look, shown in the crate.
- Replays open no crate. Crates, keys and pity are never sold.

## Looks the tiers need

The tiers only feel different if each one has its own looks. Codex draws a cache-look catalogue, vetted as a set, sized
for 35 crates with no duplicates. Suggested pools: Common 8 (flame and trail swatches), Uncommon 8, Rare 4 (cape
recolours), Epic 6, Legendary 3 (one hero outfit for each starter). None copies a Deed look, a Deepwell colour or a future
store look. The Wardrobe counts these as Cache looks.

## Art and loading

- Codex's pack has all five crates closed and open, and one reveal: Sovereign's, eight lid poses and its light effects.
  The other four tiers need their own reveals before the pack ships (no partial packs).
- Frame check of the Sovereign reveal (2026-10-10, before Cal saw it):
  - The body is held still from pose 0, which is good. The lid is a crossfade between eight separately drawn poses, so
    from about 1.6 to 2.2 s it shows two sets of straps and then a see-through lid
    (`/mnt/project-files/loot-crates/sovereign-lid-ghosting.png`). In the game the poses play as hard frames, like the
    heroes' moves, with no crossfade.
  - The lantern hangs from the lid's hasp in poses 0 and 1 and sits on the body from pose 2. The lid crest shrinks
    between poses 3 and 5. Both need Codex's cleanup pass, which Codex's own README already calls for.
  - Poses 2 and 3 have a few stray pixels on the bottom row from the sheet cut. The conversion trims them.
- Each tier has its own effects from Codex, in its own colours and growing grander tier by tier, matching Sovereign's
  two effect sheets (Cal, 2026-10-10 19:47). The game plays and places them, with no recolouring of one tier's effects
  for another. A Scenario attempt at the four reveals and Hallowed's effects (95 credits) was shelved: Cal said "all of
  them suck" and left the reveals to Codex.
- Bytes: each pose is about 330 KB as PNG, so five tiers of eight poses is about 13 MB. The pack must be compressed
  (the Codex byte rule: lossless WebP), checked for banding, and then sized against the art-loader judge's area budget.
- Crate art stays out of the boot set (zone 1 sits at the 3.50 MB warn line). The loader fetches a tier's crate when its
  boss fight starts. If the art is not in yet, the cache card shows as it does today and never waits.
- Reduced motion shows the open crate and the reward, with no shake and no burst.

## Wire-up, after Cal's OK (one card)

- Files: `55-caches.js` (tier from rank and zone, the look roll, pity per tier), `75-caches-ui.js` (the crate picture and
  its opening), a crate data file from the pack, the art loader's lazy list, and `tools/check.mjs`.
- Save: `S.cache.looks` and `S.cache.pity` (one counter per tier), registered with defaults. Save key stays
  `lanternfall.save.v5`. No crates are granted for bosses beaten before the update.
- Check: a walk from a fresh save opens a Common crate at zone 1 and a Rare crate at zone 5, and the Wardrobe count rises.

## Out of scope

- Any purchase, store page, price or payment code (see "The paid version" below).
- The online layer: the world raid pays Embers as today and opens no crate.
- New currencies, keys, timers or buildings.

## The paid version (Cal, 2026-10-10)

Cal's call: paid crates are standard gacha. A crate shows every look it can hold and the odds, but which one you get
is random. A pity counter makes the crate's top tier certain after a set number of opens without it. DECISIONS.md
(Money, and Lantern Rules 1 and 2) records the change.

- Paid crates hold looks only, never power, and they come from the store catalogue. Earned crates keep their own
  looks, so a free player is never short of an earned crate's best.
- They use the same five tiers, the same open and the same printed odds and pity line as earned crates.
- Nothing is built yet. Store code still waits for the early-game milestone, behind its one switch.
- A legal check per country comes before launch. Belgium bans paid loot boxes, so crates are not sold there. Brazil
  bars them for minors, and Australia rates games that have them M or higher. Apple and Google require the odds to be shown,
  which the design already does.
