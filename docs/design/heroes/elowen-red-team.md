# Red team: Elowen's kit, first draft (elowen-ability-spec, 2026-10-10)

Opus, read-only, against the first draft of [elowen.md](elowen.md) at `68eb357b`. Its ten findings, most severe first, as
returned. How each was answered is in elowen.md section 11.

1. **"Low vs bright Candles" is not a choice (sections 1, 2, 4).** In Codex's kit, Light was a cost: most cards cost 1-4
   (`hero-abilities-34.json`, hero-16), so the player could hold it low. The draft cut every cost. Attack, Light a Candle, I Will
   Watch and Swing's Perfect all added Candles, and only The Last Lantern (CD 7) spent them. The count just climbs to 4-5 with no
   bonus. Fix: give 1-2 moves an automatic spend; cut Light a Candle or make it the bright route only.
2. **The resource did nothing on its own, and the loop needed 4+ slots.** Every live resource has a built-in effect (`24c:118-121`).
   Candles paid only through a passive (a slot) and the tier-5 finisher; with 3 slots the loop could not be equipped, and she
   would often arrive with Candles that pay nothing. Fix: move the low-flame bonus into Candles; make Keep It Low something else.
3. **The gain-cap row fails by its own design (6.6).** The +50% cap is the uniques' boss cap (`59k:635`). Staff Alight alone is
   x1.5 (`59k:651`); with Keep It Low x1.875, with Mark x2.25, plus One Still Burning. Rally gates run only to zone 34 and hitCap is
   0 from 35 (`59k:139-140`). Fix: her best single action must not beat the others' best in the same run; say which moves are spells.
4. **"While a Ward holds" is a defence check, not a decision.** Only landed hits wear a Ward (`59k:936`); any `turnWard` resets the
   timer and keeps the larger value (`59k:592`). Good players hold the rider always; never-defends players lose it on the first boss
   hit. "Gear's Ward" is wrong: the gear Ward line only turns heals past full HP into a Ward (`59k:597`), dead on a hero with no heals.
5. **The wire list misses code that silently breaks her.** `57e:48` `HEROES=['wren','tobin','pip']` (star sets deleted on load,
   lines 69-70, refused at 155); the `57e:294` resource map leaves Ready Lamp, Spark Guard, Banked Coal, Spite and Bloodscent dead;
   `59k:344` divides by `SOLO_TUNE.heroX[key]` (NaN until `24b:37-38`, `TURN_TUNE.heroX`, `counterX` gain her); `24b:74` looks up
   her starter before 24c adds it; the quest text is code (`56c:169`); `check.mjs:5722` pins `SOLO_ORDER`; `21x:99` gives her
   `regen` (a heal); the tuning order never mentions heroX or heroHitX.
6. **The sims cannot run as written.** W10 checkpoints stop at z17 (`W10-data/lib.mjs:10-18`); `budget-score.mjs:9` and
   `health.mjs:46` hard-code three heroes; `budget.mjs` has no Proving or Deepwell rows; Swift Tide (z70) and Ringing Blow (z48)
   cannot be found in this build; Ringing Blow, Dazed Prey and Shatterpoint never read Blind. Fix: test the Stars that touch her
   (Brimming, Banked Coal with the refund, Spark Guard, Spite, Sanctuary, Perfect Time) and put her talents in the gain rows.
7. **Joining at zone 36 gives her almost no road.** In an M1-scope build she plays only replays, the Provings and the Deepwell. A
   subclass replaces the 8 signature abilities (DECISIONS), yet the draft invites her to take the Proving at once. "1.0 = Chapter 1"
   contradicts DECISIONS:63. The 150-credit poses work against "early game first". Fix: hold the poses until M1b testers reach the
   Fenmother, or open the quest at the Chained Star's candle flare; the judge's call.
8. **The pose list cannot be drawn as written.** A chained hip lantern cannot be lifted high without unhooking; "staff in the same
   hand in every pose" clashes with gathering poses; no hand or hip side named (the root of Auriel's third arm). Fix: name the sides,
   hook the lantern, stow the staff for gathering, put move names beside pose ids, add a lessons line.
9. **Names and theme overlap (moderate).** Daybreak beside the Lightkeeper's Dawnbreak (`24-data-classes.js:141`); "The Last
   Lantern" is her roster title and a Feat title (`23-data-deeds.js:203`); "The Chapel" is her tale title; Daybreak plays like Ring
   of Light and Dazzle like Lantern Flare.
10. **Minor.** "The build adds no new state" contradicts section 8; Lamps Answer's Mark leans on Wren; Kindly Light's Ward is wasted
    while Haven's holds.

**Fun and distinctness:** the defence side repeats Tobin's toolkit; without a Candle spend her real loop is "parry well, then Attack
after a spell", which is Pip's Afterglow loop. Findings 1 and 2 decide whether she is her own hero.
