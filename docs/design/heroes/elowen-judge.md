# Judge: Elowen's kit (elowen-ability-spec, Opus high, 2026-10-10)

Ruled on the second draft of [elowen.md](elowen.md), after the [red team](elowen-red-team.md). All nine amendments are applied in
the spec (section 11 summarises them).

**Ruling:** approve with 9 amendments. (1) The kit is approved. (2) She joins by option (a): her chapel quest opens when the
Fenmother falls (zone 36), and her evolution pick stays hidden until her subclass exists. (3) The numbers, sims and pose list are
enough once the amendments are in.

**Why:**
- The choice is real. Kindly Light can be cast at 3-4 Candles for a hit and a Ward, or she keeps attacking toward Swing the
  Lantern's +50% and Full Flame's +50% per Candle; holding 4-5 costs the low-flame bonus. The trade comes every turn and is made only
  by what she casts, so red-team findings 1 and 2 are fixed. The starter alone cycles 0 to 3 (checked against `turnGain`, cap 5,
  `59k-turn.js:600`).
- It runs on the game's rules: Guard (`guardX` 0.6), the Ward refresh with the larger value kept (`59k:592`), Blind, Mark, Cursed;
  the finisher gate (`59k:609`) and a "need 3" check like `lanternburst` (`59k:616`). No move reads a Ward, which fixes finding 4.
  4 timed moves; one passive in each set; no heal, cleanse or mid-turn choice.
- She plays differently: Pip's Cinders always reward holding more (`59k:518`); Candles reward holding 1-3. Full Flame works like
  Lanternburst, which hero-kits section 1 allows. Finding 9 is fixed, but the group name "Shelter" clashed with Tobin's Bulwark
  talent (`24e:41`).
- Option (a) fits the story: the bible has her come out of the chapel on the Fenmother's post (8.1); at the Chained Star a candle
  only flares in a dark window (`21k-story-hollow.js:211`). (b) would make her playable before she comes out and needs a new scene
  and a `STORY_MEET` change. Neither zone helps the early game, and (a) lets the 150-credit pose pack wait until M1b.
- Code gaps the spec missed: `TURN_SIG` (`59k:221`) falls back to `'echo'` (`59k:352`); `STARS_TUNE.fx.ready` (`24f:34`) has no
  `candles` key, so Ready Lamp would set Candles to NaN (`57e:296`); `turnWard` always sets `wardT = 3`, so Keep It Low's extra Ward
  turn had nowhere to go.

**Veto phrase:** "Elowen joins at the Chained Star".

**Risks:** her road may be thin if 1.0 is Chapter 1 only (playtest time with her after the Fenmother would show it); she may not
ship on time if `elowen-subclass` slips (her join flag stays off); her three Ward sources and Guard may carry weak players (if she
is the top never-defends hero on a boss row, the kit needs another ruling). Not checked: the concept image (its branch is not in
this clone), so which hand holds the staff; no sims were run.

**Amendments (all applied):**
1. Section 8: `TURN_SIG.elowen = 'kindlylight'`, `STARS_TUNE.fx.ready.candles` (starting value 2), a duration argument for
   `turnWard`.
2. The low-flame bonus and Staff Alight add, they do not multiply: an Attack is x1.8 at most before Mark and Cupped Flame.
3. Row 6 split like against like (6a Attacks, 6b abilities); row 7 tests Banked Coal with all four spenders (`57e:333`).
4. "Wholly defended" defined: a foe move with at least 1 real hit, none landed, every real hit parried or dodged; feints, Blind
   misses, charge turns and skipped turns light nothing.
5. "One Still Burning" becomes Cupped Flame (id `stillburning` kept); the group "Shelter" becomes Keeping Watch.
6. The card's lessons line, word for word.
7. The hidden evolution pick is for tester builds only; her join flag on for players waits for `elowen-subclass` or Cal's word.
8. The art thread names the hand near the viewer (facing right) from the concept before generating.
9. New names everywhere, this ruling recorded, status "judge ruled 2026-10-10".
