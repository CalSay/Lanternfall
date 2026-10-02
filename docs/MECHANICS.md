# Mechanics: current contracts

Read [combat-turn-build.md](design/combat-turn-build.md) for the implemented C29 rules and Stars, and
[combat-turns.md](design/combat-turns.md) for owner intent. [GAME.md](GAME.md) maps the systems; validate any stale
description against code. Deepwell and Proving mode descriptions currently differ between those docs.

Zone combat is one hero against one foe on a Speed timeline. Attack generates Aim (Wren), Grit (Tobin) or
Cinders (Pip); three ability slots use turn cooldowns. Every enemy hit permits Parry or Dodge. Parry refunds
cooldowns; a fully parried move counters. Combat waits for input, pauses when hidden and earns nothing away.
Do not restore Auto, parties, timed zone bosses or away combat rewards from older designs.

Abilities and learning: `24c-data-abilities.js`, `56e-abilities.js`; talents: `24e-data-talents.js`.
Stars: `24f-data-stars.js`, `57e-stars.js` (43, three set, up to two lit). Fight engine: `59k-turn.js`;
C22 encounter integration: `59l-zone-foes.js`. UI contracts: `75-turn-ui.js`, `75-abilities-ui.js`, `75-stars-ui.js`.
Proposals and longer-term kits: [hero-abilities.md](design/hero-abilities.md),
[ability-tree-details.md](design/ability-tree-details.md), [enemy contract](design/enemies-c22-final-contract.md).

Use existing event, state and modifier extension points in [ARCHITECTURE.md](ARCHITECTURE.md). New state needs
defaults. Save-key changes belong to Claude; report breaking changes rather than independently bumping the key.
