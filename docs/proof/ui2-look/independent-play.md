# ui2-look: independent play

Tester: an independent Claude agent, 2026-10-11, with `tools/playtest-human.mjs` at 1280x720 (desktop), seed 1, as Wren.
120 actions, about 17 game minutes: intro, hero pick, story cards, the fight (Act, Skills, Foe), Hero (Hero, Gear,
Abilities, Build), learning a move and a talent, boss rewards, Gather (wood, mining), Camp, Craft (recipes and a
result), Switch, Next Up, Notices, Settings. Zone 1 and zone 2 bosses beaten; stopped in zone 3. Nothing got stuck; every
button worked. The tool blocks Google Fonts, so this run shows the fallback fonts (the check covers the real ones).

The same seed and actions were replayed on the base build to sort new finds from old ones.

| Find | On base? | Done |
|---|---|---|
| Sheets (Settings, Notices, Switch) show the fight through their text | **new** | fixed: panel colours are opaque; the check asserts it |
| The fight's PAUSED badge sits over open menus (Abilities, Gather, Camp) | yes | out of scope (stage chrome) |
| Parry/Dodge text touches the borders; "Attack" clipped with fallback fonts | yes | out of scope (fight bar slots, stage 3) |
| The Skills tab's third row is half under Parry/Dodge | yes | out of scope (stage 3) |
| The fight's corner icons draw over Camp and Craft | yes | out of scope |
| Power Shot's cooldown number over "Po"; "NUMBERS" in capitals in Settings | yes | out of scope |

Result: no broken screen from this change once the sheets were made solid.
