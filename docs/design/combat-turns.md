# Turn-based combat: the owner's decisions (2026-09-30 to 2026-10-02)

Status: built (C29, 2 October 2026). How the fight works now: [combat-turn-build.md](combat-turn-build.md). This page
keeps the owner's decisions behind it. The full register is [DECISIONS.md](../DECISIONS.md).

## Standing

- **Turn-based, one enemy at a time.** Enemies are stronger to make up for it. No click-spamming. (2026-09-30)
- **Combat is active only.** No Auto, no idle fighting, no away combat earnings. (2026-10-01)
- **Timed parry:** press as the hit lands. It blocks the hit and takes **1 turn off every cooldown**. Harder than a
  dodge. (2026-09-30) The window starts at 0.18 s. (2026-09-30)
- **Timed dodge:** easier (0.35 s to start). It avoids the hit, with no counter and no refund. (2026-09-30)
- **Per hit, not per attack.** An attack can be several hits and an enemy can act more than once in a cycle. Each hit is
  its own parry-or-dodge choice; each parried hit refunds. The counter (a sure crit) comes only when every hit of the
  move was parried. (2026-10-01)
- **Speed sets turn frequency**, not only who opens. The old cooldown gear stat Haste is called **Focus**. (2026-10-01)
- **Cooldowns reset every fight.** (2026-09-30)
- **Enemy profiles:** after the first fight with an enemy it gets a profile of strengths and weaknesses; the more you
  fight it, the more you learn. (2026-09-30)
- **More Essence per kill**, so fewer kills an hour do not starve Essence. (2026-09-30)
- **Gatherers come earlier.** Gatherers and kills are the two main gold sources. (2026-09-30)
- **Hunting** (C24) gives Hide outside fights, from hostile beasts. (2026-09-30)
- **No boss timer and no Enrage.** (2026-10-01)
- **Fight feel** (2026-10-02): a pause with a whose-turn banner between turns; a bigger timing bar.

## Replaced

- An Auto toggle with auto parry (10%) and dodge (25%) odds, enchantments raising them, auto parries without a refund,
  and offline progress at Auto's rate (2026-09-30): replaced by active-only combat (2026-10-01).
- A haste check that only picks who opens, then alternating turns; haste bought with gold (2026-09-30): replaced by
  the Speed timeline (2026-10-01).
- A versus card before every fight (2026-09-30): the game has a versus header with HP bars (2026-10-01) and a turn
  strip.

## Still open

- Whether gear carries Speed (a Speed gear line is wanted, 2026-10-01).
