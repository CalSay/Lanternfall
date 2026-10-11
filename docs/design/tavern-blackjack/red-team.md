# Tavern Blackjack: red team

- **Date:** 2026-10-10. **Reviewer:** red team, Opus high.
- **Reviewed:** `docs/design/tavern-blackjack.md` with the 64-foe highest bet and the 320-foe purse and loss stop, the
  real section 6 report lines, and `bj-econ.mjs` (re-run: `node docs/design/tavern-blackjack/bj-econ.mjs 200000 5000`,
  edges -0.94% / -5.5% / -8.1%, day shares as the spec says). Checked against the code at 3937d6c5.

## Blocking

1. **The economy prediction can't be measured.** (blocking)
   Evidence: EC2's "gold earned a day" counts only `fight`, `away` and `bounty` (`tools/sim.mjs:1738`), so table gold
   can't move it, except slightly through pace. The spec's own section 6 lines show no profile reaching zone 35 in 14
   days (idle 24, normal 28, active 33), so "the day each profile reaches zone 35" has nothing to measure. Section 12
   fails the design-doc hard check "a number and how it will be measured" (`docs/review/design-doc.md:12`).
   Fix: measure what the table actually changes. (a) The sim table policy's net gold a day, as a share of EC2 income, per
   profile: missed if the mean loss is over 2% or the p90 day's loss is over 1.5 H. (b) The EC5 share moves by less than
   5 points. (c) Each profile's zone at day 14 moves by less than 1 zone, or the day it reaches zone 25 (all three
   profiles reach it) moves by less than half a day.

2. **The ledger plan breaks the spec's own rule and the health gate.** (blocking)
   Evidence: section 8 books every bet as spend `table` and every payout as earn `table`. `tools/health.mjs:99` sums all
   of `econ.earned` and all of `econ.spent`, so table wins do count in the health metrics, which section 1 says must never
   happen. EC4's spend split divides by every spend category (`tools/sim.mjs:1764`). The casual policy stakes 30 x 64 =
   1,920 foes a day, against about 6,655 foes of income, so every EC4 share (camp 25-40%, upgrades 15-30%) falls by about
   a fifth, and EC4 passes today. Rewriting the health baseline needs Cal (lessons, Economy line 1).
   Fix: book only the day's **net** result, once per hand, into one `table` category. Or keep the table's books in
   `S.blackjack` only and add `table` to the exclusions in health.mjs and sim.mjs. Add a build-card check that health
   `earned` and `spent` are unchanged with the sim table policy on.

3. **"One new thing, at a beat with no other new thing" is false.** (blocking)
   Evidence: the gate `S.maxZone >= 11` fires on the zone 10 Champion clear. On that same clear, Wren joins for a Tobin
   or Pip pick (`src/js/56c-unlocks.js:13`), and lessons (Process) say a join counts as a new thing for every pick. Codex
   opens at zone 10 (`55-onboard.js:73`). In a new (cold Hearth) game, Next Up's step after zone 10 is "Hearth 2, then
   the Tavern" (`55-goals.js:491-506`). Building the Tavern opens the Tavern view (`now`), Hands (`handsOpen`: Hearth 2 plus
   the Tavern, `57f-hands.js:142`) and Tam's arrival, and now the table too. Those are three or four new things, 90 s apart
   (`ONBOARD_TUNE.gap`), against compass anti-goal Overwhelm and F4 ("4 in any 10 minutes"). Section 7's "the first
   Tavern visit is spent on Hands" is backwards: Hands and the table open on the same build.
   Fix: give the table its own beat, for example the first Tavern visit at least 20 minutes of play after Hands opened,
   or zone 13 or later with the Tavern built. Prove it with `tools/walk.mjs` and the health F4 burst for all three picks,
   and name the beat in the spec.

## Should fix

4. **Reloading can re-roll a hand, and the save shows Hesketh's hidden card.** (should fix)
   Evidence: cards come from `Math.random` (`40-rules.js:67`). The spec saves only at the deal; the autosave runs every
   5 s (`90-boot.js:40`). Killing the tab after a bad Hit, before the next save, and reloading restores the hand before
   the hit, with a fresh random card. The dealer's peek needs the hole card drawn at the deal, so it sits in the
   localStorage JSON and in the save code: a hole-carding edge, which contradicts "a card is drawn only when it is needed".
   Fix: call `save()` synchronously after every draw and after settling, before anything renders. Use the no-peek rule
   (European no-hole-card, original bet only): Hesketh's second card is drawn only after you stand, and on his blackjack
   you lose only the first bet. The edge is the same, the copy line is unchanged, and nothing secret is saved.

5. **Double and the clamp are not specified.** (should fix)
   Evidence: nothing in the spec stops a Double with less gold than the bet, so `S.gold` goes negative. The mockup turns
   Double off (`wick.html:248`). The clamp `[lowest, min(highest, gold, room before the loss stop)]` is empty when the
   room or the gold is under the lowest bet. With the clamp, the worst day is 6 highest bets, not 7. The probe's `day()`
   ignores the clamp.
   Fix: Double is off when gold held < bet. The table closes (loss stop copy) when the room left is under the lowest bet.
   Correct the worst day and model the clamp in the probe.

6. **The units are mislabelled, and the early numbers are about half the truth.** (should fix)
   Evidence: `ECON.hourFoes` is "an hour of normal play (24 h average)" (`21w-data-econ.js:21`), not "an hour of
   fighting". The table unit includes `earlyGold` (x2 to zone 20), but every price is `econH` without it
   (`21w-data-econ.js:115`). At zone 11 the purse is 4,800 = 2.05 price-hours (econH(11) = 2,340), and the worst day,
   6,720, is 2.9. Section 6 compares 1 boosted H against 21 base H of income, so up to zone 20 the purse is about 10% of
   a day's income, not 5%, and the casual player's loss is about 2.2%, not 1.1%. EC5 is also misread: "normal 62%"
   means 62% of check-ins bank *under* a day's income, so 38% bank more. And EC5 is not reported by zone, so "at zone
   25" has no source. That misreading is the stated reason for 64 foes.
   Fix: state every limit in econH (prices the player knows). Re-justify the 64-foe bet from a correct EC5 reading, or
   from Training and camp prices at zones 11, 25 and 50.

7. **The limits fall from zone 21 to 35.** (should fix)
   Evidence: in the probe's table the highest bet is 1,200 at zones 20 and 25 and 860 at zone 35, as `earlyGold` fades
   faster than the curve rises. Section 1 promises "the numbers rise with your zone": a broken promise (compass).
   Fix: base the unit on the running maximum of foe gold up to `S.maxZone`, or on `econH` with a fixed multiplier.

8. **No gold multiplier may touch a payout.** (should fix)
   Evidence: `goldMult()` (`40-rules.js:143`) applies gear gold and Omens: Gold Rain +30%, the Gold Fever Dare +80%
   (`55-almanac.js:60`). If a payout goes through any helper that applies it, the edge becomes strongly positive.
   Fix: one line in the spec ("payouts are bet x odds, never multiplied") and a check with Gold Fever active.

9. **The UI hooks are wrong for this codebase.** (should fix)
   Evidence: `registerSection('world', …)` appends to `#p-world` after the raid part (`70-ui.js:922-931`), so the section
   lands at the bottom, not "at the top". Every existing Tavern section uses `registerSection('tav', …)`. With no
   `feature: 'blackjack'`, the section shows before the unlock. The FEATURES row has no `when` and no `late: true`. Without
   `late`, "Show every tab now" (`75-onboard-ui.js:668`, `isUnlocked` at `55-onboard.js:324`) opens the table at zone 1,
   and a save with `O().all` set gets it with no notice. The notice needs an `OPEN_TXT` entry (`75-onboard-ui.js:45`).
   Putting it above "In the tavern now" and "Hall of heroes" also reorders the online Tavern.
   Fix: `registerSection('tav', { …, feature: 'blackjack' })`, placed below the online boxes (or above them only with
   coordinator sign-off). Row: `{ id, tab: 'world', view: 'tav', late: true, when: () => BJ_TUNE.on && … }`, plus an
   `OPEN_TXT` line.

10. **The art plan can't be built as written.** (should fix)
    Evidence: there is no text glyph for a lantern or a thorn. A crown or a blade exists only as a chess king or a
    dagger, or as emoji. Emoji draw as OS colour art: it differs on every platform, and no Codex pack vets it. Plain ♠♥♦♣
    shown under the names Lanterns, Crowns, Blades and Thorns would be a broken promise. A gold coin icon does exist
    (`ICON.coin`, `10-art.js:28`, used by Gold Rain and the Deeds), so the "if no icon exists" hedge is moot. "Lantern
    Brass" is the mockup's palette name, not a game CSS token.
    Fix: plain cards show the rank only, with the suit as its colour plus its name in the result and aria text. Or use
    standard suits and names until `codex-cards-tavern` lands. Use `ICON.coin`. Name the game's own colour tokens.

11. **Cal's own art suggestion is parked, not asked.** (should fix)
    Evidence: Cal at 19:00: "We could probably find some fantasy playing card digital assets". The spec says this goes
    to him as a question only "if Cal wants found assets", but he has already said he does. The standing rule is
    "Art should only be made by Codex" (CLAUDE.md, Cal 10-06).
    Fix: ask Cal now with a decision card (found assets with a licence check, or a Codex pack), and record the answer.
    Don't assume Codex.

12. **Hesketh is a poor fit as the house.** (should fix)
    Evidence: story bible 6.1 makes Hesketh the grieving mentor, the lamplighter and the guide's voice (`S.onboard.sayQ`).
    The Tavern belongs to Vesper (bible, systems table: "Vesper's song and rumours"), and Tam, Hesketh's nephew, arrives
    with the Tavern and Hands. The mentor taking a house edge off the hero, with a "purse" (he is a poor lamplighter),
    cuts against his arc, and the spec bans the table from the guide while the guide's own voice deals.
    Fix: get a story-owner ruling. Tam deals ("Uncle's rule of thumb: …") and keeps Hesketh's line as advice. Or keep
    Hesketh, since Cal saw him in the mockup, but ask Cal in the same card as finding 11.

13. **The rating switch fails open.** (should fix)
    Evidence: `BJ_TUNE.on` is a source constant, and the build option is deferred, so the first store build ships the
    table unless someone remembers it. Under the 2026-10-08 business-model ruling, the free public web build (from
    20 Nov, road to the zone 15 Champion) includes zone 11. The PEGI and App Store claims in section 9 cite no sources.
    Fix: add a ship-checklist line and a DECISIONS line ("store builds: table state to be confirmed by Cal before any
    rating survey"). Have `check.mjs` print the flag's state in the build summary. Cite sources for the rating facts.

14. **"It cannot mint" and "it cannot wreck" hold only in honest play.** (should fix)
    Evidence: `deviceDay()` follows the device clock (`00-util.js:93-99`), so moving the date resets the purse and the
    loss stop. Save-code import (`75-savecode-ui.js`) restores gold, so a player can keep only the winning hands. Both
    holes are single-player and accepted elsewhere, but the spec states the bounds as absolute.
    Fix: scope both claims ("with an honest clock and no save import"). On a save-code import, clear `hand` and keep the
    larger of the stored and imported `net` for today.

15. **Double taps.** (should fix)
    Evidence: in the mockup, Deal, Hit and Next hand share one spot. The lessons (UI, craft-strike-infuse) say a press
    target must ignore presses for a beat after it resolves. A double tap on Next hand then Deal stakes a second bet.
    Fix: a 300 ms guard after Deal, Next hand and each result. Hit must not sit where Deal sat.

## Minor

16. The copy "Come back tomorrow" prompts a daily return, close to the Chores anti-goal (compass 6), and "tonight" is
    wrong at noon. Use "The table's closed for today." Framing the purse as something to empty invites a daily chase.
17. Section 2's loop step: 30 to 60 hands take 10 to 20 minutes, which is not "a 5-minute visit". Pillar 2 is "calm, low
    pressure" (P13). Say why the table still fits.
18. Section 7's "Tavern open from zone 8 or minute 14" is the warm-save rule. New games open it when it's built
    (`55-onboard.js:72`).
19. The names clash with names already in the game: Squire (Tobin, "the Hedge Squire"; Oswin, "the Ash Squire"), Crowns
    (the Elders' crowns in the story), Blades (the Blade upgrade).
20. The card adds a gate and a daily timer, so DECISIONS (Lantern Rules) needs all ten checked, not two. "Nothing you can
    buy can be bet" is too absolute: the Keeper's away bonus feeds gathering, and trade runs turn materials into gold.
    Say "gold is never sold".
21. Fun prediction: testers must reach zone 11 with the Tavern built (name the staged save). With no pointer, finding the
    table is mixed into the result. The hit line (2 of 3, and Cal says fun) and the miss line (fewer than half) leave a
    gap. Cal's verdict has no miss case.
22. Lessons (Economy): "Give a budget one limit, not two". The table has five bounds (lowest, highest, gold held, purse,
    loss stop). Say which one does the job: the purse stops wall-skipping, the loss stop stops ruin.
23. New save fields may need a systems-map Kind entry (`tools/systems-map.mjs` tags save counters). List `blackjack`
    there as a meter or stat.

## Verdict

The core design is sound and close to what Cal asked for: clear blackjack, gold only, a bet the player picks and can
lower, nothing sold, a negative edge everywhere, and daily caps that keep a lucky or unlucky run bounded. The verified
names (`econSig`, `deviceDay`, `registerState`, `ECON.spendCats` and `earnCats`, free file numbers, `S.totalGold`
written only by fights, away and bounties) hold up. It is not ready to judge as "go". Three findings block. The economy
prediction measures numbers the table can't move, or that the 14-day run never reaches. The gross ledger booking puts
table gold into the health metrics the spec swears to keep it out of, and dilutes EC4. The opening beat stacks the table
on top of a starter join, the Codex, the Tavern build and Hands. Behind those sit an off-by-two unit error that
understates the early stakes and rests the 64-foe raise on a misread EC5. There is also a reload re-roll, an
unspecified Double, wrong UI hooks, and an art plan with no buildable glyphs. Fix the three blockers and findings 4
to 9, ask Cal one card covering found art and the dealer, and the spec can go to the judge.
