# Turn-based combat (owner direction, 2026-09-30)

Status: direction agreed with the owner, not yet built. Replaces the real-time solo combat and supersedes C20's
real-time spec (`docs/design/combat-3.md` on `codex/c20-combat`) once signed off. Prototype first, behind a switch.

## Decided by the owner

- **Turn-based, one enemy at a time.** Enemies are stronger to make up for it. No click-spamming.
- **Timed parry, when you play by hand.** Press at the moment the hit lands, on the enemy's turn. The window is
  tighter than today. A parry blocks the hit, keeps the counter (a sure crit), and takes **1 turn off every
  cooldown**: your abilities and Attack.
- **Timed dodge, when you play by hand.** Also harder than today. It avoids the hit, with no counter and no refund.
- **Enemy profiles.** After the first fight with an enemy it gets a profile: its strengths and weaknesses. The
  more you fight it, the more you learn.
- **Gatherers come earlier.** Gatherers and kills are the two main sources of gold (see C10: Tam within an hour).
- **Auto is a toggle.** An Auto button switches auto-fighting on or off. This replaces "auto takes over after
  5 seconds without a press".
- **Auto parries and dodges by chance:** 10% parry and 25% dodge to start. Gear enchantments raise both.
- **Haste decides who goes first.** Each fight opens with a haste check between the hero and the enemy. Before the
  fight starts it must be very clear who goes first.
- **Haste can be bought with gold** in the hero's upgrade tree (the stat tree, not abilities), once that tree is
  designed.

## Proposed details (for owner sign-off)

- **Auto rolls, per enemy attack:** roll parry first (10%). If that misses, roll dodge (25%). If that misses too,
  the hit lands. Together that avoids about 32% of hits. An auto parry works like a timed one: counter, and
  1 turn off every cooldown.
- **Caps so playing by hand stays better:** auto parry at most 30%, auto dodge at most 50%. Aim for hand play to
  beat Auto by about 25-40% through perfect timing, refunds and weaknesses.
- **Auto's choices:** abilities as soon as they are ready, in bar order; otherwise Attack. It also plays the
  enemy's weakness once the profile shows it (so a profile helps idle play too).
- **Offline progress** runs at Auto's rate.
- **Haste check:** the higher haste goes first, and a tie goes to the hero. After that, turns alternate.
  - Haste doesn't give extra turns. It only decides the opening. (Open question: a speed bar, where haste also
    gives extra turns, would be a later option.)
  - Enemy haste rises by zone. Bosses have high haste, so building haste matters for bosses.
- **Showing who goes first:** a short card before each fight: "You go first" or "Mire Hag goes first", with both
  haste numbers side by side. Plus a small turn strip over the stage showing the next 4 turns (hero and enemy
  portraits), always visible during the fight.
- **Profile tiers**, per enemy kind:

  | Kills | You learn |
  |---|---|
  | 1 | HP, attack and haste |
  | 5 | its weakness (and its resistance) |
  | 15 | its heavy-attack tell (the wind-up to watch for) |
  | 50 | a permanent +5% damage against it |

- **Pace:** about 1.5-2 s per round when you play by hand, faster in Auto.

## Open questions

1. Does an auto parry give the full cooldown refund, or half?
2. Do enchantments that raise parry/dodge also widen the timing window for hand play, or only raise Auto's odds?
3. Is haste only a skill-tree purchase, or can gear carry it too?

## Build plan

1. A prototype in the preview: one zone, turn loop, timed parry and dodge, the Auto toggle with the rolls, the
   haste card and turn strip, and a basic profile. Behind a switch, for the owner to play.
2. After sign-off: rewrite C20 as the turn-based spec; the balance sim and offline progress move to turns;
   C19 abilities get cooldowns counted in turns.
