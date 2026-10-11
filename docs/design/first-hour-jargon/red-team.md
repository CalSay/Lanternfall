# Red team: first-hour-jargon (draft 1)

Opus red team, 2026-10-11, read-only, against draft 1 of `../first-hour-jargon.md`. Its objections, worst first, and
what draft 2 did with each.

1. **Card F cannot keep the check bounds as written.** `tools/check.mjs:2873-2875` also asserts `stall <= ONBOARD_TUNE.gap + 3`
   up to Bounties; a clock that starts at the reveal adds the wait for the gap to every queued step, so it likely fails.
   `guidePhase()` (55-onboard.js:186) reads 'between' whenever a menu is open, so a reveal behind the Hero menu (phone 32)
   is not fixed by it. Fix: hold only the display (one reveal per gap, clock still at release; Next Up and `featOk` read
   "shown"), or hold the release and get the stall bound signed off.
   **Draft 2:** takes option (a), names the stall bound, and tests "no live foe on the stage", not `guidePhase`.
2. **Proposed fight lines were false.** Exposed pays off only on Tobin's payoff hits (Attack, Heavy Strike, Hammerfall,
   Last Stand; 59k-turn.js:524, 649, 737, 750, 754). Guard lasts 3 turns on a Perfect Bash (59k:744), 1 from talents.
   Armour cuts every physical hit, abilities too (59k:520).
   **Draft 2:** lines are built from the move that landed (its own numbers and turns); Armoured says "physical hits".
3. **Ring "Off time" teaches no direction.** The grade uses `abs(now - until)` (59k:1068); early, late and no press all
   grade "miss". Fix: "Early" / "Late" by the sign, like the parry card's cues; add 75-abilities-ui.js:289 to card B.
   **Draft 2:** adopted.
4. **Pile-up at 1:00.** The first Bash lands Stunned, Exposed and Guard at once, right after the Grit tip (0:53).
   `trickSay` overwrites itself, shows 1.6-1.8 s and is blocked by `warnSticky` (75-turn-ui.js:285). Fix: one explain line
   per fight at most, and say whether a line holds the game.
   **Draft 2:** one first-landing line per fight, the rest queue to later landings; lines never hold the game; and every
   status pop and chip answers a tap or hover with the same line (the red team's alternative, below).
5. **Card E loses one-time notices.** `bountyReady` fires once on the edge (55-bounties.js:134) and its toast is the claim
   button (141); the weekly "Claim it in the Almanac" toast fires once (55-almanac.js:393); the Codex half-page toast
   carries "Blessing open at the Shrine" (57c-codex.js:351). The bounty Next Up row survives via `GOAL_FEATURE`.
   **Draft 2:** each row, when it opens, says once what is already waiting.
6. **The cache line became false.** "Bosses drop it 15% of the time" generalises this win's chance with its modifiers;
   "rare gear" clashes with the Rare rarity and the card's own "A unique." line. The optimiser got a unique at 2:11, so
   Uniques are not past minute 30. Fix: "No unique this time (15% chance on this win)."; keep "lantern".
   **Draft 2:** adopted; Uniques moved out of the late set.
7. **Factual errors.** Renown shows on locked heroes' routes ("Earn 25 Renown on the bounty board", 56c-unlocks.js:171),
   so cutting it breaks that link. Vigour's boss rule is a real effect (the footing floor, 59k:918). The optimiser wants
   numbers, so keep one on the parry window.
   **Draft 2:** Renown kept; Vigour says the boss rule plainly; the parry line keeps its number.
8. **Collisions and missed words.** Guard is both an attribute and a status; Switch has three meanings (place picker,
   Switch hero, a full Storehouse cell). Missed: the boss-odds line "about 2 turns a win, now 1" (desk 60), "Quartz: from
   Mining geodes" (phone 44), the away note's Spillover branch (71-ui-fight.js:73-74), "Dim Essence" in bounty rewards.
   **Draft 2:** rows added; the status pop reads "Guarded"; the place picker gets its own name.
9. **The Essence line competes with the staged guide** at 1:37 (level-up, Hero step). Fix: explain it where it is first
   needed. Coal piling up silently is still a word in the Storehouse. Card D needs 55-goals.js for a Next Up hook.
   **Draft 2:** Essence is told on the first weapon's line; coal's where-line stays on its stock row; 55-goals.js named,
   with the clash.
10. **Overlapping cards.** `picker-ability-gloss` (proposed) has card A's outcome; `ap-first-use-hints` (done) wrote the
    open lines E edits; `ui2-fight` owns 71-ui-fight.js; `fight-numbers-honest` also edits 75-turn-ui.js; away cards own
    away copy. **Draft 2:** A folds into `picker-ability-gloss`; each clash is named.
11. **The prediction was unfair.** The 22 counted Moss Scroll (explained 2 s later) and Next tier (a covered-badge
    complaint); four words belonged to card G, outside the "A to F" gate; a different hero changes the count by itself.
    Fix: fixed seeds and heroes, a 20-word baseline, new words reported apart, G inside the gate.
    **Draft 2:** adopted.
12. **Smaller points.** Desk 63 was in Craft and phone 32 in a paused menu, not "mid-fight". The picker's "stops its next
    attack" and the fight's "loses its next turn" are two wordings for one rule, and bosses stagger instead.
    **Draft 2:** wording fixed; one phrase for both.

Checked by the red team and found clean: no proposed line uses a solo-copy banned word (W1C_RE, check.mjs:7270),
telegraphs a foe move or suggests a build; the Omen example (Gold Rain) and the Bestiary threshold (5 kills) are true.

**Strongest alternative:** skip the timed one-time lines; make every status pop, chip, resource meter and reward word
tappable or hoverable with its one-line meaning (desk 66 asked for this on Grit), and gate the unlock release on "no live
fight" with the clock bound change signed off. Draft 2 takes the tap half and keeps one first-landing line per fight; it
keeps the release clock (option 1a) so no check bound moves.
