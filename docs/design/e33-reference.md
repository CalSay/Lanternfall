# Expedition 33 combat reference (for the balance patch)

Research, 1 October 2026. Step 3 of `balance-roadmap.md` uses this as a guide, not a copy.

**Caveat:** the wikis and guide sites were blocked from this environment, so these figures come from search-result
summaries of those pages. Each figure names its source. **[est]** marks an inference; **[unverified]** marks a single
source or forum post. Normal-enemy HP, the exact Speed formula, counter multipliers and mid/late player HP were not found.

## The number scale

- **Starting hero:** Gustave at level 1 has 150 HP, 49 Attack, 212 Speed, 8% crit (Fextralife, Gustave).
- **Levels:** 1-99, 3 attribute points a level (Vitality = HP, Might = attack, Agility = Speed, Defense, Luck = crit).
- **Damage cap:** 9,999 a hit until the end of Act 2, when it is lifted; endgame builds reach millions to billions.

| Stage | Enemy | HP | Attack | Speed |
|---|---|---|---|---|
| First boss | Eveque | 4,524 | 97 | 366 |
| Act 1 elite | Chromatic Lancelier | 2,285 | — | — |
| Act 1 boss | Goblu | 22,815 | 208 | 496 |
| End of Act 1 (level ~28) | Lampmaster | 42,678 | 798 | 516 |
| End of Act 2 (level ~45) | Paintress | 482,157 | 3,550 | 1,556 |
| Superboss (level 85+) | Simon | ~7.5M + 45M | — | — |

(Expert difficulty, Fextralife tables as quoted in search results.)

**Shape:** boss HP grows about 100x from the first boss to the end of Act 2; boss attack about 37x. The first boss has
about 92x the starting hero's attack in HP: about 8-15 party turns **[est]**. Normal fights last 1-3 rounds **[est]**.

## Turns and Speed

- Speed sets how often a unit acts, relative to everyone in the fight; a big gap gives two or more turns in a row. The
  formula is hidden; players compare it to Honkai: Star Rail (action value = 10000 / Speed), so **about 2x Speed is about
  2x the turns [unverified]**.
- A player acts at most twice in a row; a boss can act about four times in a row against a slow party **[unverified]**.

## Enemy moves

- **Normal enemies have about 2 moves:** a quick hit and a delayed one (a feint). Example: Lancelier.
- **Elites have about 3,** one of them multi-hit: Chromatic Lancelier has a 2-hit attack (slow, then fast), a delayed
  single hit and a quick single hit.
- **Bosses have many more:** Eveque (first boss) has 4: two basic attacks, a summon, and a 3-hit spell whose charged
  version is 8 hits plus a party hit. **You can shoot its core to stop the charge.** The Paintress has about 12, with
  3-7 hits each. Late bosses run 10-15-hit combos.
- Most enemy turns are one action; long combos and Speed make the "many hits" feel.
- Special attacks: unblockable attacks you must jump; Gradient attacks with their own counter.

## Defence

| | Window (Story / normal / Expert) | Reward |
|---|---|---|
| Parry | 0.35 / 0.15 / 0.15 s | +1 AP per hit parried |
| Dodge | 0.5 / 0.22 / 0.22 s | nothing (a Picto adds +1 AP on a perfect dodge) |

- **Parry every hit of a sequence: a counter.** Miss one: no counter, and that hit lands in full.
- A missed defence hurts: on Expert, "mobs mostly one-shot"; one missed parry in a late boss combo can kill.

## Resources and skills

- **AP:** cap 9; +1 from a basic attack, +1 per parry; skills cost 2-5.
- **Multipliers:** basic attack 1.0x; normal skills about 1.4-1.7x; a setup payoff (Stain) x1.5; conditional
  finishers far above.
- **Statuses:** Mark +50% to the next hit only; Defenceless +25% damage taken; Powerful +25% dealt; Burn stacks and
  ticks each turn.
- **Break bar:** every hit fills it; when full, a "can Break" skill deals big damage and stuns (the enemy loses a turn).

## What this means for Lanternfall (proposals for step 3)

1. **Small numbers.** Start a hero at about 100-150 HP and 10-50 attack, not thousands. Let numbers grow
   about 100x over the whole game, not millions.
2. **Defence is the main skill.** A normal enemy's turn is 1-3 hits, a boss's up to 5-9. Each avoided hit matters, and
   a full parry pays the counter (already our rule).
3. **Hits hurt.** Combat is active only (owner, 2026-10-01): no Auto or idle fighting. So we can follow Expedition 33
   closely: a missed defence against a normal foe takes about 20-35% of HP, a boss's full combo undefended can be
   lethal. Defence is the skill the game tests.
4. **Our parry refund is our AP.** Expedition 33 gives +1 AP per parried hit; we take 1 turn off every cooldown per
   parried hit (owner rule). Same rhythm: defending well powers the next turn.
5. **Modest multipliers.** Basic attack 1.0; abilities about 1.4-2.0; a setup payoff about x1.5; only finishers above
   about 3. (The C19 table is close to this.)
6. **Fight length.** Normal foes die in 3-5 hero actions; elites 6-8; zone bosses 10-15.
7. **Enemy design (C22).** Normal: 2 moves (a quick one and a delayed or feint one). Elite: 3, one multi-hit. Boss: 3-4
   (the owner's number), including one charged attack the player can interrupt and one telegraphed big hit.
8. **Speed.** About 2x Speed is about 2x the turns; cap a side at 2 actions in a row (bosses maybe 3).

## Sources

Fextralife (Gustave, Eveque, Lampmaster, Paintress, Simon, Speed, Vitality), Game8 (combat, statuses, Break), Maxroll
(combat guide), Gamepressure (enemies, damage cap), Gameranx (boss guides), Nexus Mods (datamined parry/dodge windows),
ResetEra (patch 1.3.0), PC Gamer (endgame damage), GameFAQs and Steam discussions ([unverified] items).
