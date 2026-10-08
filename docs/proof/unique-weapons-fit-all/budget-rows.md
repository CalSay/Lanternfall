# Golemfist on Wren and Pip, zones 6-8 (card acceptance 4)

Report only, no retune in this card. `node tools/budget.mjs --heroes wren,pip --only z6-boss,z7-boss,z8-normal,z8-boss`,
240 fights a row, the same fight seeds, once as is (plain: the kept-up common +0 Bow or Staff) and once with
`--eval` wearing a Golemfist in the weapon position (the zone's tier, +0 as it drops, retooled to the hero's weapon).

| row | Wren casual plain | Wren casual Golemfist | change | Pip casual plain | Pip casual Golemfist | change |
|---|---|---|---|---|---|---|
| z6-boss | 80 | 90 | +10 | 99 | 100 | +1 |
| z7-boss | 73 | 83 | +10 | 95 | 97 | +2 |
| z8-normal | 100 | 100 | 0 | 100 | 100 | 0 |
| z8-boss | 74 | 91 | +17 | 96 | 96 | 0 |

Good player: 100 on every row, both ways.

Wren is over the card's +8 limit on all three boss rows (+10, +10, +17), so the numbers go to the uniques thread for a
later retune. Pip has no headroom to show a change (95-100 plain). Part of the lift is the unique's base power (a legendary
at the zone's tier against a common +0), not only Attack x2.

--eval used:
`(() => { const it = { id: S.nextId++, slot: uniqKindFor("golemfist", S.party.cls), t: zoneTier(S.zone), r: "legendary", plus: 0, u: "golemfist" }; if (uniqKindFor("golemfist", S.party.cls) !== "weapon") it.rt = "weapon"; S.items.push(it); S.equip.weapon = it.id; gearDirty(); })()`
