# Lanternfall roadmap

Owner decisions (2026-09-27):

- **No prestige or resets.** Progress is permanent. Freshness comes from mastery, collections, build variety and new regions.
- **Single-player first.** World raid and tavern stay optional, light extras.
- **Active + idle mix.** Idle most of the time, with active moments that reward attention.
- **Store launch possible, monetisation undecided.** Keep doors open: original art only, no restrictive third-party assets, nothing pay-to-win designed in.
- **Owner role: player.** The coordinator drives the roadmap and brings playable builds and decisions at milestones.

Beyond these phases, the coordinator's long-term plan (the Camp, Expeditions, the Deepwell, daily Omens, Constellations, the Codex and Lantern Light, regions, festivals) and the wave order are in [docs/design/long-term-vision.md](docs/design/long-term-vision.md).

## Phase 0: modular sprint (done)

- Split the code into modules with extension hooks, a build script, save checks and a headless balance simulator
- Zone mastery and bestiary (permanent, no resets)
- Bounty board and achievements
- Sound effects and an early-game balance pass

## Phase 1: depth and active play

Spec: [docs/design/party-and-classes.md](docs/design/party-and-classes.md) covers hero classes and
abilities, companions as recruits, party combat with boss telegraphs, companion gear and the
save migration, in three build stages (A: classes and visible party, B: recruits and gear,
C: enemy attacks and telegraphs).

Active moments first, because they define the feel:

- **Hero abilities:** 2 to 3 tap skills on cooldowns, such as Lantern Flare (a burst of damage) and Rally (a party speed boost), unlocked through play
- **Boss mechanics:** zone and raid bosses telegraph attacks you can tap to parry or dodge. Missing one costs time, not progress.
- **Expeditions:** short runs with modifiers (monsters heal, no party, double essence) that bring rewards back without resetting anything

Then build depth:

- **Gear:** affixes, set bonuses and more uniques with real trade-offs
- **Talent tree:** points from levels, with free respecs
- **Region 2:** from about zone 35, bringing new materials, monsters and mechanics plus light story beats
- **Onboarding:** a guided first ten minutes

## Phase 2: app-ready foundation

- **Codebase:** TypeScript, a Vite build and automated tests, with the simulator guarding balance
- **Online interface:** the online layer sits behind an interface, so claude.ai capabilities and the app's own backend can be swapped. Cloud saves come with this.
- **Settings and performance:** a settings screen (sound, reduced motion, number format) and a performance pass on low-end Android
- **Android test build:** a Capacitor build installed on the owner's phone

## Phase 3: launch prep (if we go for it)

- **Art and audio polish:** refine the procedural style or commission an artist
- **Store basics:** accessibility, a privacy policy, the store listing and a monetisation decision
- **Closed testing:** Google Play needs roughly 12 testers for 14 days for new personal accounts. Confirm the current rules before relying on this.

## Phase 4: live game

- Seasons and events
- The world raid on our own backend
