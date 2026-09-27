# Coordinator wave log

## Wave 1

- K1 crafting data merged. Notes for K4: item fields `a: [[affixId,q]]`, `mw`, `rf` (Focus `f` dropped).
  Haste per point (0.05% cd) looks too small vs the trinket base line; tune in sim. `gainSkill`
  unlock message in 50-sim.js is hard-wired to ore/wood (K5). Tonic Mending Draught needs a `heal`
  modifier key (Stage C).
- K2 crafting icons merged (12x12, `iconURL(...craftIcon(name,t))`), gather node rigs `node:crystal|fibre|herb`.
  Renamed K2's `CRAFT_NODES` to `CRAFT_NODE_RIGS` (clash with K1). Polish later: `mat_fibre` reads as a
  bone, `mat_hide` a little turtle-like.
