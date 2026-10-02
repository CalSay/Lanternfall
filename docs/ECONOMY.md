# Economy: current sources and measurement rules

Live pricing and tuning: `src/js/21w-data-econ.js`, `55-econ.js`, `21-data-craft.js`, `55-crafting.js`,
`41-items.js` and `55-training.js`. [GAME.md](GAME.md) explains the loops; [DECISIONS.md](DECISIONS.md) fixes intent.
These shared economy/crafting files require Claude's sign-off under [the ownership agreement](coord/two-agent-split.md).

Fights pay gold and progression rewards; gathering supplies materials, Hunting supplies hide. The Storehouse
caps each material/grade; new material credits go through `stashAdd` in `55-store.js`. Hands and trade routes
use prepaid shifts/trips and exact-once settlement. Check live and away behaviour together when changing rewards.
Crafted gear has rarity affixes, upgrades and Reforge; higher grade expansion is planned, not fully live.

[balance-roadmap.md](design/balance-roadmap.md) tracks the sequence.
[balance-c27-power-curve.md](design/balance-c27-power-curve.md) is explicitly a proposal: its number squish,
15-grade scale and toy-model outputs must not be described as measured behaviour of this branch.

Every balance report gives base SHA, hero, gear, zone, combat mode, seed, policy, elapsed time and measured outcome.
`tools/sim.mjs` remains useful for supported scenarios; first verify that its policy exercises the relevant mode.
Tick-only or legacy real-time simulations cannot establish the pace of active turn fights. Compare baseline and
proposal with the same setup, separate measurements from assumptions, and recommend one bounded change.
Do not silently change currency curves, add monetisation or make idle combat profitable.
