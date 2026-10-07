# Foe moves by type (card foe-moves-by-type)

Each ordinary foe type fights its own way in turn fights, and every hero has an answer for it. Boss move sets stay as
they are (boss-tiers owns them). Zone 1 and 2's art monsters (Thorn Imp, Gloomjaw) keep their own moves (59l).

## Rules

1. **Same threat per second as before, different shape.** A type's average move damage times its Speed matches the old
   Strike/Flurry foe (about 0.18 of the reference hero HP a second). Slow foes hit big and rarely. Fast foes chip.
   Rides (venom, chill, weaken, bleed) are paid for with a smaller hit. Normal foes stay in the 90-100% band.
2. **Move shape tells the type.** Slime: one slow heavy glob, then a two-part lash. Bat: quick chips, a four-hit
   flurry. Rattlebones: ranged shots and volleys. Beetle: one very slow shell bash. Spore Cap: ranged poison cloud that
   weakens. Quarry Golem: slowest, biggest hit. Wraith: ranged frost wails, low damage, chills.
3. **An elite swaps the generic Crushing Blow for its type's signature move**, about 1.5 times the type's biggest
   move, on top of its trait. Elites are the part of this card that raises the threat (they are 100% casual wins today,
   against a 75-97% band).
4. **Counters are existing abilities, named per type** (`FOE_COUNTERS`). Every starter has at least two types they are
   good against, and every type has an answer from every starter. The tip shows in the Codex entry for the type.
5. Coast foe types keep the generic moves until the Coast's turn kits exist (follow-up).

## Types

| type | Speed | moves (wind s, share of reference HP) | elite signature | counters |
|---|---|---|---|---|
| Moss Slime | 0.80 | Engulf 1.5s 0.24 poison; Ooze Lash 1.1s/0.8s 0.11x2 poison, venom on 2nd | Great Engulf 1.6s 0.34 poison, venom | Pip fire (plant); Tobin Brace; Wren Pinning Shot |
| Cave Bat | 1.00 | Nip 0.8s 0.11; Wing Flurry 0.75/0.6/0.6s 0.07x3; Dive 0.7/0.6s 0.11x2 | Dive Storm 0.7/0.55x3 0.08x4, bleed last | Tobin Brace; Pip Arcane Ward; Wren Shadow Step |
| Rattlebones | 0.95 | Bone Shot 1.1s 0.20 ranged; Bone Volley 0.9/0.65/0.65s 0.065x3 ranged | Bone Barrage 0.9/0.6x3 0.085 ranged | Tobin Sunder; Pip Nova (holy); Wren Pinning Shot |
| Barrow Beetle | 0.70 | Shell Bash 1.4s 0.27; Mandibles 1.1/0.8s 0.13x2 | Rolling Charge 1.8s 0.42 | Tobin Shield Bash; Pip Frost Shard; Wren Sonic Arrow |
| Spore Cap | 0.90 | Spore Puff 1.1s 0.15 ranged poison, weaken; Cloud 1.0/0.8s 0.10x2 ranged poison, venom 2nd | Spore Storm 1.0/0.7/0.7s 0.10x3 ranged poison, venom last | Pip fire (plant) and Arcane Ward; Tobin Iron Will; Wren Shadow Step |
| Quarry Golem | 0.60 | Stone Fist 1.5s 0.32; Quarry Slam 1.8s 0.26 | Quarry Smash 2.0s 0.50 | Tobin Sunder; Pip Frost Shard (construct); Wren Pinning Shot |
| Marsh Wraith | 1.00 | Wail 0.9/0.7s 0.08x2 ranged frost; Chill Touch 1.2s 0.17 frost, chill | Drowning Wail 0.9/0.65/0.65s 0.10x3 ranged frost, chill last | Pip Nova and Lantern Flare (holy); Tobin Riposte; Wren Bat Swarm |

## Judge rulings (Opus, 2026-10-07)

1. Threat a second is within 20% of the old foe for every type (check.mjs holds it). Wraith's Chill Touch went 0.14 to 0.17;
   the Cave Bat went from Speed 1.1 to 1.0 with chips of 0.11/0.07/0.11 (a 1.1 bat elite was a wall at zone 30).
2. An elite keeps its type's pace (Speed x elite/normal), so a golem elite is still slow. Signatures are about 1.4-1.6x the
   type's best move (bat 0.08 x4, bones 0.075 x4, wraith 0.08 x3).
3. Elite scaling is two single numbers, `TURN_TUNE.eliteHitX` 1.4 and `eliteHpX` 2.5, not a zone line (a zone line fits
   today's power curve, which mid-zone-wall and boss-tiers will change). The Cave Bat has `eliteHp` 0.4: fast chip foes are glass cannons.
4. Zone 15 and 20 elites stay easy for the casual starters (100% and 88-95%): that is hero power at zones 5-15, owned by boss-tiers.
   Tobin at 100% on elites is accepted (his +10 casual allowance is for bosses only).
5. Counters: Wren's answer to the beetle is Pinning Shot or Sonic Arrow (Sonic needs a Pinned or Marked foe); Frost Shard
   Freezes on the second cast. The Bestiary tell (15 kills) names the moves and the tip; the per-hero list is data for now.

Follow-ups: a move-name label on the stage (the warn banner covers the foe, so it was left out); Coast foe move sets;
show the player's own hero's counters in the Bestiary.

## Boss tricks (boss-tiers-pr4, 2026-10-07)

Zone bosses from zone 4 to 15 play `TURN_BOSS_TRICKS` sets (24d): Captain four moves (a, b, charge, c), Champion five (an extra long string `d`).

- `hold` (s) on a hit: the wind-up stalls for `hold`, then runs the last (dodge window + `tricks.tell`). Holds are 0.4-0.6 s; winds at least 0.6 s.
- `feint: true` on a hit: it winds up like a hit, breaks at the tell and deals nothing. A press on it fools the hero (`m.fooled`); the next hit
  starts with `usedDefense` set and `flinch`, so it cannot be defended. Feints start at zone 7.
- The sampler reads a feint or a hold with `read` (default 0.3 + 0.6 x avoid rate); a misread presses early and wastes the press.
- Switch off: `TURN_TUNE.tricks.on = 0` (old move sets only; the refit knots stay, revert them to restore the old fight). Gates: `TURN_TUNE.boss.gate`. Own-HP floor: `TURN_TUNE.boss.hpFloor`.

