# Lanternfall roadmap

Owner decisions (2026-09-27), still standing:

- **No prestige or resets.** Progress is permanent. Freshness comes from mastery, collections, build variety and new regions.
- **Single-player first.** World raid and tavern stay optional, light extras.
- **Store launch possible, monetisation undecided.** Keep doors open: original art only, no restrictive third-party assets, nothing pay-to-win designed in.
- **Owner role: player.** The coordinator drives the roadmap and brings playable builds and decisions at milestones.

The 2026-09-27 "active + idle mix" now applies to gathering only: combat is active only (owner, 2026-10-01).
Every other owner decision is in [docs/DECISIONS.md](docs/DECISIONS.md). What the game has today is in
[docs/GAME.md](docs/GAME.md).

## The target: 1.0 is Season 1

Five regions (the Hollow, the Sunken Coast, the Emberwaste, the Pale Reach, the Gloamvale), each 7 areas x 5 zones,
ending with the first fight against the Voice. 32 heroes, two named gatherers per resource job, and the 1.0 extras in
[DECISIONS.md](docs/DECISIONS.md) ("The game").

## Now: the combat overhaul (owner order, 2026-10-01)

Each step finishes before the next starts ([balance-roadmap.md](docs/design/balance-roadmap.md)):

1. **Hero abilities:** built (C29, 2026-10-02): 42 abilities, Scrolls, talents.
2. **Enemy overhaul:** the 215-enemy roster is designed ([enemies-c22-final-contract.md](docs/design/enemies-c22-final-contract.md));
   zones 1 and 2 have their monsters in the game. The rest wait for art packs.
3. **Number squish and balance:** first numbers are in the turn build; the full pass is proposed in
   [balance-c27-power-curve.md](docs/design/balance-c27-power-curve.md). Progression gaps: [progression-stalls.md](docs/design/progression-stalls.md).

## Next

- The turn fight for the Deepwell and the Provings (they still use the real-time fight).
- Ascension and subclasses, Hallowed, hero quests, more playable heroes.
- The story rewrite proposed in [story-c28.md](docs/design/story-c28.md).
- Region 2 content, then Regions 3-5.
- Gear and resources: grades 6-15, production chains, sockets and enchanting, the Armoury.
- Equipment art on the heroes ([equipment-art.md](docs/design/equipment-art.md)).

## Open polish (from the 2026-10-01 menu audit)

- Camp > Raid is a dead screen when offline (online layer: needs a task that allows it).
- Hero > Team repeats Craft > Gear; merge it into Training or give it hero switching.
- Stars: a dot on the Hero tab while points are unspent.
- The bell badge can count a notice the sheet does not show.

## Later

- **App-ready foundation** (2026-09-27 plan): TypeScript and a Vite build, the online layer behind an interface (cloud
  saves), a settings screen, an Android test build.
- **Launch prep:** an installable web app, accessibility, sound and music, store basics, closed testing (Google Play
  needs about 12 testers for 14 days for new personal accounts; check the current rules first).
- **After 1.0:** Season 2, the Lantern Festival, online titles, a second evolution tier, monetisation.
