# pip-staff-odds-mismatch: W10 and the fight sampler agree on Pip's staff

**Verdict: both tools are right, and W10 needs no correction.** On the same footing they give the same numbers: the staff from +0
to +5 (or tier 2) takes Pip's casual wins at the z10 Champion from about 45% to about 64% (W10 +18 points, sampler +20). The
"barely changes at any level from +1 to +10" reading came from how the sampler was asked, not from what it measures. There are
three causes, and none is a bug in either tool.

Run it again: `node docs/proof/pip-staff-odds-mismatch/measure.mjs` from the repo root (about 8 s, base 2327400f). It copies W10's
`play`/`poolFor`/`ownAll`/`refresh` (`autopilot/reports/why/W10-data/lib.mjs`) and reads the sampler raw with 55-fight-delta's own
profile, seeds and skill (footing C pins the day to 9 Oct 2026). The real `fightDelta(..., { scratch: true })` gives the line column.

## Side by side (casual player, z10 Champion, Pip L15, tier 1 common gear)

Footing B is the #316 check's save `tests/proof-fixtures/save-pip-z10-ward.json` with no Omen. Its loadout is Fireball, Spark and
Kindle, which is W10's Fireball-first set.

| Staff | W10 play, 240 fights | Sampler raw, 80 fights (240) | Line from worn +0 |
|---|---|---|---|
| +0 | 46% | 43% (48%) | - |
| +1 | 46% | 43% (48%) | none |
| +2, +3 | 54% | 54% (57%) | 4 in 10 -> 5 |
| +4, +5 | 64% | 63% (66%) | 4 in 10 -> 6 |
| +10 | 64% | 63% (65%) | 4 in 10 -> 6 |
| tier 2 +0 | 64% | 63% (66%) | 4 in 10 -> 6 |

Footing A (W10's own budget z10 arrival row) gives the same W10 column and, with the loadout set to Fireball first, the same sampler
column (43, 54, 63).

## Why the sampler seemed to say "barely"

1. **The win curve is stepped, and the Upgrade line compares one press.** On footing B the staff moves the fight only at +2 (+11
   points) and +4 (+9). +1, +3 and +5 to +10 change nothing. Fights are whole turns, and a rally gate holds the boss until it
   finishes a move (`src/js/59k-turn.js:537-540`). Extra damage likely counts only when it saves a whole turn between gates. That
   is inferred, not traced: measure.mjs shows only that with gates off Pip wins 100% at every staff level, so the gates make this
   fight. The Upgrade button compares the worn piece with one step on (`preUp`, `src/js/75-craft-ui.js:330`). Pressed one at a time from +0, it shows a line on the +1 -> +2 press ("4 -> 5") and the
   +3 -> +4 press ("5 -> 6"), and none on the other eight. W10 measured +0 -> +5 in one jump.
2. **The #316 check asks only about the +0 -> +1 press**, which sits on a flat stretch (`tools/check.mjs:11705` `up1`, asserted at
   11709 and in the browser at 11792). The check is right that this press shows no line. It does not show that +1 to +10 is flat.
3. **An Omen with a fight lift hides the steps.** Every game in check.mjs loads with `almanac.force('none')` (`tools/check.mjs:41`).
   A save loaded without it gets the real day's Omen. On 9 Oct 2026 that is Hunter's Feast, +15% damage through `mod('dmg')`
   (`src/js/40-rules.js:140`). measure.mjs pins that day. With the Omen, Pip starts at 63% and +1 to +3 change nothing. The
   +3 -> +4 press **costs** wins: 63% -> 56% in 80 fights, 64% -> 59% in 600. The line stays hidden because both round to 6 in
   10. So no press from +0 to +10 shows a line. W10's footing is clean: budget pins the day to 5 Oct (Blood Moon, Trophies only).

A fourth trap exists on W10's footing only. `tools/budget.mjs` buildCore plus W10's `ownAll` unlock the abilities but leave the
game's own loadout at Fireball alone. W10's `play` replaces the loadout (`p.eq = SET`), but 55-fight-delta reads the game's
(`soloEquipped()`, `src/js/59k-turn.js:349`). Asked on that core, the sampler plays a Fireball-only Pip at 23-25% whatever the
staff. W10's own numbers are unaffected.

## What this means

- W10 section 3 and its balance-pass rows stand: Pip's weapon +5 / tier 2 is worth +17/+18 casual points at the z10 Champion. One
  refinement for the balance pass: the gain comes in two steps (+2 and +4), and +5 to +10 add nothing at this fight.
- The odds line is honest but uneven for Pip's staff. A player upgrading from +0 sees a line on 2 of 10 presses, and from +4 on
  sees none. The recipe row for a tier 2 staff does show "4 -> 6". This is a design question for the Foreman (for example,
  measuring the Upgrade line to the next step that changes the fight). This card changes nothing.
- On a +15% damage day a staff upgrade can lower Pip's odds (+4: about 5 points fewer wins). The cause is not traced. It is likely
  the same gate stepping, where more damage reaches a gate at a worse moment. A balance-pass question, not a tool bug.
- No proposed patch: neither tool has a bug.
