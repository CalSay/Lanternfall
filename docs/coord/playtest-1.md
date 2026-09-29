# Playtest 1: owner notes on preview v49 (2026-09-29)

Raw notes from the owner, triaged by the coordinator. Nothing here is built yet; work is paused.

| # | Note | Triage | Where it goes |
|---|---|---|---|
| 1 | The tutorial should freeze the game so you can follow the menu and task before playing; otherwise new tutorial tasks overlap. | Bug/UX, high. Onboarding steps pause the sim (fight, timers, spawns) until the step's menu action is done; one step at a time, queued. Respect idle/offline: the pause only applies while a tutorial step is open. | TUT1 (new, sonnet): 55-onboard.js + hint UI |
| 2 | The direction pointer for the tutorial points at the wrong tabs, and some highlight boxes are in the wrong place. | Bug, high. Tab ids changed in UX-A/nav rebuilds; re-map every onboarding target to the current DOM and add a check that each target exists and is visible at 360px. | TUT1 |
| 3 | Active fighting feels very strong; considering removing tap-to-attack and adding combat buttons for spells and moves instead. | Design change, owner deciding. Option: stage taps no longer attack; a button row (class tap move, ab1, ab2, parry/dodge, Finisher) replaces them, which also fixes "active too strong" by moving power into timing, not tap rate. Needs a short design note (CB3) before building. | CB3 (opus, design first) |
| 4 | Building flow doesn't align with the starter class: a Ranger waits a long time before it can make gear. | Design/pacing, high. The Workbench/Forge/Loom order favours metal; each class's first gear station and materials should open in its first ~10 minutes (Ranger: wood + leather; Lanternmage: cloth + wood; Warrior: metal + leather). | S4 (gear) + BT1, flag in BAL |
| 5 | Could equip a unique sword while using a bow. | Bug. Weapon kinds must follow the wearer's class/weight (gear-2); the Lanternbearer's weapon slot should filter by class. | S4, quick fix earlier (FIX1) |
| 6 | Maybe expand heroes' equipables so a tank can hold a sword. | Design, medium. Heroes get a weapon slot by class (tank: sword and shield, etc.) in S4's weight model. | S4 / HER |
| 7 | Didn't seem to get any raw hide. | Bug or pacing, check. Rawhide source: fighting drops for the Lanternbearer (gear-2 O13) and Hunters; check drop rates after MAT1's rename (MAT.hide.unit '' change) and ECON-A. | FIX1 (sonnet): investigate first |
| 8 | Level 1 buildings should take less time to build. | Pacing, easy. Cut Lv 1 build times (and first Lv 2) sharply; ties to EC6 (Hearth 2 at 72 h). | BAL3 follow-up / BAL-E |

Order when work resumes: FIX1 (items 5, 7), TUT1 (1, 2), BAL item 8, CB3 design note (3), then S4 with 4 and 6 in its brief.
