# Tavern Blackjack

Spec for card `tavern-blackjack-spec` (Opus high, judge gate). It is the source for the build card `tavern-blackjack-build`
and the Codex art card `codex-cards-tavern`.

- **Cal's ask** (10 Oct 2026, thread "Mini game ideas"):
  - 18:44: "I want a mini game, something simple with some risk. I was thinking maybe like fantasy themed blackjack."
  - 18:53: "more clearly blackjack. It is in a tavern after all. I think being able to choose your bet would be good too."
  - 19:00: "Yeah that's pretty good... We also need to be able to reduce the bet too."
- **Mockup v3**, the one Cal saw: https://claude.ai/artifact/4csKr6KFbecvicQdX7NsWy. The rules below are that mockup's, with
  the table limits, daily purse, save and switch this spec adds.
- **Numbers**: [tavern-blackjack/bj-econ.mjs](tavern-blackjack/bj-econ.mjs) (house edge and swing against the shipped gold
  curve) and the 14-day `sim.mjs --report econ` run, both summarised in section 6.
- **Records**: red team [tavern-blackjack/red-team.md](tavern-blackjack/red-team.md) and judge
  [tavern-blackjack/judge.md](tavern-blackjack/judge.md).

## 1. What the player sees

1. After the zone 10 Champion, with the Tavern built, one notice says: "Hesketh has a card table at the Tavern."
2. Camp > Tavern has a new section at the top called **Blackjack**. Hesketh deals there. A first-use hint says:
   "Bet gold and beat Hesketh's hand without going over 21."
3. You set your bet with − and + (one step each), or tap a gold coin to add more. The bet stays between the table's
   lowest and highest bet, and never goes over the gold you hold. A line under it says
   "Table: 30 to 960 gold" (the numbers rise with your zone).
4. Deal takes your bet and deals two cards each. One of Hesketh's cards is face down.
5. You Hit, Stand or Double. Hesketh then turns his card and draws until he has 17.
6. You win, lose or tie, and the line says how much: "19 beats 17. You win 960 gold." Next hand keeps the same bet.
7. Win enough in a day and Hesketh's purse runs dry: "Hesketh is out of coin. He'll deal again tomorrow." Lose enough
   in a day and he stops you: "That's enough for tonight. Come back tomorrow."
8. Nothing at the table ever costs real money, and nothing you can buy can be bet.

**Never**

- Never sell gold, coins, table access, extra hands or a refilled purse. Gold is never sold (Lantern Rules 1 and 2).
- Never put the table in Next Up, in the guide, in a reward, or in a pop-up. You only find it by opening the Tavern.
- Never make the table a goal: no Deed, Feat, streak, bounty or daily task asks you to play.
- Never let table wins count as gold earned for Deeds, the Codex hoard lines or health metrics.
- Never touch the online layer: the online Tavern board, presence, the raid or the shared data.

## 2. Why, and where it fits

- **Problem.** Cal wants a short, risky break between fights (his words above). Today, every choice in the game is about
  progress, and nothing lets a player gamble a little of what they won for a thrill. The mockup got a "pretty good" from
  Cal at 19:00.
- **Evidence.** This comes from Cal's ask and his read of the mockup, plus the review data in
  [monetisation.md](monetisation.md). In IdleOn's money reviews, "paid odds, pets, companions, gambling" drew 10 one-
  and two-star reviews against 4 good ones. The anger is at *paid* chance, so this table sells nothing. No playtest
  evidence exists yet. The prediction in section 12 is how we get some.
- **Compass.** Loop step: "A 5-minute visit, step 3" (spend what you won). Pillar 2 (camp and away), coverage-map area
  9, side content. Goal: Fun.
- **Ceilings.** It adds no new currency (gold only, so it stays within the 8 core counters), no building and no camp-tour
  tap (the table sits in the Tavern view, which the tour does not visit). It is one new thing, at a beat with no other
  new thing (section 7).

## 3. The rules

Hesketh deals standard blackjack, the way a player already knows it.

| Rule | Value |
|---|---|
| Cards | Four 52-card decks, **shuffled fresh before every hand** (so counting cards does nothing) |
| Card values | 2 to 10 as shown; Squire, Queen and King count 10; an Ace counts 1 or 11 |
| Deal | Two cards each. One of Hesketh's is face down |
| Blackjack | An Ace and a ten-card on the deal. It pays 3 to 2 (rounded down to whole gold). Both blackjack: a tie |
| Dealer blackjack | With an Ace or ten-card up, Hesketh checks his face-down card before you act. On blackjack the hand ends and you lose only the bet |
| Your moves | Hit (take a card), Stand (keep your hand), Double (on your first two cards only: double the bet, take exactly one card) |
| Not offered | Split, insurance, surrender (one hand on screen, three buttons) |
| Dealer | Draws to 17, and stands on every 17, soft 17 included |
| Results | Over 21 loses. Higher total wins even money. A tie returns the bet |
| Suits | Lanterns, Crowns, Blades, Thorns. The Jack is called the Squire |

Hesketh's rule of thumb, shown under the table in small print: "Stand on 12 to 16 when I show a 2 to 6. Always hit 11 or
less." This is a fixed tip, not live advice on each hand.

## 4. Bets, table limits and Hesketh's purse

All amounts are gold. The table unit is one normal foe's gold at the player's highest zone, the same gold a fight pays
(`foeGoldBase(z) * earlyGold(z)`, before gear gold and Omens), so the table keeps step with the road.

| Limit | Rule | At zone 11 | At zone 50 | At zone 140 |
|---|---|---|---|---|
| Lowest bet | 2 foes' gold, at least 10 | 30 | 58 | 1,100 |
| Highest bet | 64 foes' gold (about 12 minutes of fighting, 0.2 H) | 960 | 1,800 | 36,000 |
| Hesketh's purse | The table closes for the day once you are up 5 highest bets (320 foes, about one hour of fighting) | 4,800 | 9,000 | 180,000 |
| Loss stop | The table closes for the day once you are down the same amount | 4,800 | 9,000 | 180,000 |

- Every amount is rounded to two significant figures with `econSig`, like every price the player reads.
- The purse and the loss stop count **net** gold for the day: wins minus bets. Both reset at the device day
  (`deviceDay()`, the same day the Almanac and Tavern use). A hand that crosses a limit is paid in full; the table closes
  after it.
- Missing a day costs nothing. The purse does not carry over or grow, so the table is never a daily duty.
- The limits are read when a hand is dealt, so pushing to a new zone in the middle of a day raises them from the next hand.
- **Bet controls** come from the mockup. − and + step by one lowest bet. Four gold coins add 1, 2, 5 and 10 lowest bets
  ("+30", "+60", "+150", "+300" at zone 11). Clear goes back to the lowest bet. The bet is clamped to
  [lowest, min(highest, gold held, what's left before the loss stop)]. The last bet is remembered.
- If you hold less than the lowest bet, Deal is off and the line says "You need 30 gold to sit down."

## 5. Gold or chips

The default is **plain gold**: the coins are gold coins and every amount reads "gold", as in the mockup. This is the
Foreman's default, picked because it adds nothing to name or count, needs fewer art pieces, and reads less like a
casino. Cal can veto it with **"Use fantasy chips at the table"**. Chips would then be a picture of gold, never a
second currency: they appear only at the table and are converted back to gold when the hand ends.

## 6. The economy check

Run `node docs/design/tavern-blackjack/bj-econ.mjs`. It uses 2,000,000 hands for each strategy and 20,000 days for each
player type, and reads the gold curve from the shipped core.

**The house edge, per hand:**

| How you play | Edge | Spread (sd, in bets) |
|---|---|---|
| By the chart (no split) | −0.93% | 1.11 |
| Like the dealer: hit to 17, never double | −5.69% | 0.98 |
| Never risk a bust: stand on 12 and up | −7.90% | 0.99 |

**A day at the table, net.** H is one hour of fighting gold. A normal day's income is about 21 H: the 14-day econ report
below gives 6,655 foe-equivalents a day.

| Player | Average a day | As a share of a day's income | Purse emptied | Loss stop hit |
|---|---|---|---|---|
| Keen: the chart, highest bet, up to 60 hands | −4.5% of H | −0.2% | 45% of days | 50% |
| Casual: hits to 17, highest bet, 30 hands | −24% of H | −1.1% | 23% | 45% |
| Careful: hits to 17, a quarter of the highest bet, 30 hands | −8.6% of H | −0.4% | 0% | 0% |
| Timid: stands on 12+, highest bet, 60 hands | −40% of H | −1.9% | 28% | 66% |

**What this means for the gold economy:**

- **It cannot mint gold.** Every hand loses on average, and the purse and loss stop are fixed amounts, so no way of
  betting or stopping comes out ahead over time. That includes doubling up after a loss and leaving while ahead.
  Fresh shuffles stop card counting. The best day possible is the purse plus one doubled hand: 7 highest bets, about
  1.4 H, or 7% of a normal day's income.
- **It cannot wreck a player.** The worst day is the loss stop plus one doubled hand: also about 1.4 H. It scales with
  the zone, so it never falls to pocket change late. It is real money early, though. Near zone 11 a worst day (about
  6,700 gold) can be most of what a new player holds, and that is the risk Cal asked for. The loss stop bounds it, and
  the table opens only after the first hour.
- **Why the highest bet is 64 foes, not 16.** A bet must feel like something. At zone 25 the normal player banks more
  than a day of income at 62% of check-ins (EC5 below), so a 16-foe (290 gold) top bet would be pocket change. The
  first draft used 16 foes and was raised for this reason.
- **Against a normal day's gold**, a keen player loses about 0.2% of a day's income and a casual one about 1.1%. That
  makes the table a mild gold sink. Gold is the mid-game choke (systems map), so the sink stays small on purpose, and
  it is the player's choice.

14-day `node tools/sim.mjs --report econ --days 14` (Warden; idle, normal and active profiles), at 3937d6c5:

```text
EC2 income a day (foe-equivalents, 24 h average, from day 2): idle Hollow 9,377; normal Hollow 6,655; active Hollow 7,032
EC5 banked gold under 1 day of income at 90% of check-ins: idle 4%, normal 62%, active 15% (FAIL before this card)
idle   day 14: zone 24, gold a day d1 40,452 d3 66,269 d8 81,745
normal day 14: zone 28, gold a day d1 26,333 d3 65,180 d8 68,979
active day 14: zone 33, gold a day d1 67,002 d3 79,122 d8 95,314
```

On these numbers the purse (one hour of fighting gold) is about 5% of a normal day's income, and a full day's average
loss is under 2% of it. EC2, EC3, EC5, EC6 and EC9 fail on the integration branch before this card, since the table is
not built yet. The build card's acceptance is to change none of these by more than section 12 allows.

## 7. When it opens

- **Gate:** the zone 10 Champion beaten (`S.maxZone >= 11`) and the Tavern built (`campLv('tavern') >= 1`). It's a
  `FEATURES` row: `{ id: 'blackjack', tab: 'world', view: 'tav', name: 'Blackjack', why: 'the zone 10 Champion, with the
  Tavern built' }`.
- **Why then:** after the first hour. The first hour belongs to fights, the camp and the first hero build (F3, the
  one-new-thing rule). The zone 10 Champion is the first-hour finish line. By then the player holds gold worth risking,
  and the Tavern (open from zone 8 or minute 14) is a place they have already seen. The first Tavern visit is spent on
  Hands, which keeps the table from landing on the same beat.
- **How it shows:** one bell notice ("Hesketh has a card table at the Tavern.") and the Tavern view's dot until the first
  visit. Not in Next Up, not on the guide, no pop-up.

## 8. Save

- New state `registerState('blackjack', { v: 1, day: 0, net: 0, bet: 0, hand: null, n: { hands: 0, won: 0, lost: 0, tied: 0, bj: 0 } })`,
  with defaults filled by `fresh()` through `registerState`. **The save key stays `lanternfall.save.v5`**: one new field
  with defaults breaks no old save.
- `day` and `net` drive the purse and loss stop. `bet` is the last bet. `n` is the counts for a Journal stats line
  (later, not in the build card).
- **The bet is paid when the hand is dealt and the save is written at once.** The hand in play is saved in `hand` (cards
  dealt, the bet, doubled or not). A reload shows the same hand, so you can't reload your way out of a loss. A card is
  drawn only when it is needed, so a reload cannot reveal a future card.
- **Gold books.** A bet goes in the econ ledger as spend category `table`, and a payout as earn category `table` (new
  entries in `ECON.spendCats` and `ECON.earnCats`). Payouts do not add to `S.totalGold` (lifetime gold earned), so Deeds,
  hoard lines and health metrics see only fight and camp gold. The systems map gets the table as a gold source and a
  gold sink.
- **Away:** the table does nothing while you are away, and offline parity is unaffected.

## 9. The store-build switch

- **`BJ_TUNE.on`** (1 = the table exists) sits at the top of the new core file. With it at 0, the `FEATURES` row never
  opens, the section and notice never show, and a saved hand in play refunds its bet the next time the game loads. The
  save field stays.
- **Default: on** for the web build and Steam.
- **Why it exists.** A clear blackjack table with gold bets is simulated gambling under the age-rating boards' rules. PEGI
  rated Overboard 18 for one blackjack scene. It brought Balatro down to 12 on appeal because of its fantasy elements,
  and has announced a 12 category while keeping 18 for casino simulations. On the App Store, simulated gambling is 13+
  when infrequent and 18+ when frequent. This would set the rating for **the whole game**, not just the table.
- **Who decides: Cal**, before any rating submission, for each store build. This spec does not decide it. Making the flag
  a build option (such as `node tools/build.mjs --no-blackjack`) belongs to that later card, not the build card.

## 10. Art

- **Until `codex-cards-tavern` is vetted**, the table uses plain UI cards. A card is a flat light panel with a 1 px
  border, the rank in the corner and centre, and the suit as a text glyph in the suit's colour. There are no drawn
  pictures, no faces, and no suit icons drawn in code. The card back is a flat panel in the Lantern Brass colours. The
  gold coins are the game's existing gold coin icon, or plain text in a round button if no icon exists.
- The judge rules whether this counts as UI or as art drawn in code under the art freeze (see the judge record). The
  mockup's SVG suit icons and patterned card back are **not** carried into the build. They wait for Codex.
- **The Codex pack** (`codex-cards-tavern`, Codex lane, its own cap): a card frame and back, four suit icons, Squire,
  Queen and King faces, a gold coin stack, and (optional) Hesketh dealing. It goes through the usual
  `integrate: <pack>` card, red team and Opus art judge. Found or stock card art is never used. If Cal wants found
  assets, that goes to him as a question with a licence check.

## 11. Player-facing copy

| Where | Text |
|---|---|
| Section title | Blackjack |
| Sub line | Hesketh deals. Dealer stands on 17. Blackjack pays 3 to 2. |
| First-use hint | Bet gold and beat Hesketh's hand without going over 21. |
| Unlock notice | Hesketh has a card table at the Tavern. |
| Limits line | Table: {min} to {max} gold |
| Buttons | Deal {bet} · Hit · Stand · Double · Next hand · Clear |
| Start of hand | You have {n}. Hesketh shows {card}. |
| Results | {p} beats {d}. You win {x} gold. / {d} beats {p}. You lose {x} gold. / Both on {n}. Your bet comes back. / Blackjack! You win {x} gold. / Bust at {n}. You lose {x} gold. / Hesketh busts at {n}. You win {x} gold. / Hesketh turns over blackjack. You lose {x} gold. |
| Short of gold | You need {min} gold to sit down. |
| Purse empty | Hesketh is out of coin. He'll deal again tomorrow. |
| Loss stop | That's enough for tonight. Come back tomorrow. |
| Rule of thumb | Hesketh's rule of thumb: stand on 12 to 16 when I show a 2 to 6. Always hit 11 or less. |

## 12. Prediction, and how it's measured

- **Fun.** In the first playtest-lab or tester session after the table opens, at least 2 of 3 testers play 10 or more
  hands without being asked, and Cal calls it fun. **Missed** if fewer than half play 10 hands. A miss means the table
  becomes a re-brief card, not more tuning.
- **Economy.** In the 14-day econ report with a table policy added (a build-card acceptance line: the casual player
  above, 30 hands a day at the highest bet), gold earned per day moves by **less than 5%** for every profile, and the
  day each profile reaches zone 35 moves by **less than half a day**. **Missed** if either is broken. The fix then is
  to cut the highest bet, not the edge.
- **Rating.** No measure. Cal decides (section 9).

## 13. Switch it off

- `BJ_TUNE.on = 0`. The table, notice and FEATURES row go away, a hand in play refunds its bet, and the `blackjack` save
  field stays unused. Nothing else reads it.
- To remove it fully, delete the two new files and the CSS file, the FEATURES row, the `ECON` ledger categories and the
  systems-map lines. Old saves keep a harmless `blackjack` field.

## 14. Alternatives weighed

| Option | Why not |
|---|---|
| "Wick": blackjack rules with rune stones in a lantern, five foes, bank or push on (mockup v1) | Cal (18:53) wants it to be clear blackjack, because it's in a tavern |
| Cellar Doors (push your luck through doors) / Higher or Lower / Liar's dice | Pitched at 18:44. Cal picked blackjack |
| A fixed 10 to 250 table (mockup v3) | It's worth about 20 foes at zone 5 and nothing in Region 4. The table limits must follow the gold curve |
| No daily purse or loss stop | The edge alone limits gold only on average. A lucky week could skip a gold wall, and an unlucky night could empty the camp's budget. Fixed daily caps bound both |
| A shoe dealt down to 20 cards (mockup) | A deep shoe can be counted for a player edge with a bet spread of 1 to 16. A fresh shuffle each hand closes that |
| Split, insurance and surrender | Each adds a button and a rule to explain. Leaving out split costs the chart player about 0.4% edge, which is fine for a pastime |

## 15. Build cards

1. **`tavern-blackjack-build`** (Claude, Opus medium; the Foreman refines it from this spec):
   - **Files**: core `src/js/57t-blackjack.js` (rules, limits, purse, save, ledger), UI `src/js/75-blackjack-ui.js`
     (`registerSection('world', { id: 'blackjack', view: 'tav', ... })` at the top of the Tavern view), and
     `src/styles/60-blackjack.css`. Extension points: the `FEATURES` row and FIRST_USE line (55-onboard), `ECON`
     ledger categories (21w), the systems-map registry, and a `sim.mjs` table policy for the econ check.
   - **Checks**: rules, payouts and dealer play; limits by zone; purse and loss stop across a day change; the bet is
     paid at the deal and survives a reload; `BJ_TUNE.on = 0` refunds a hand in play; payouts stay out of
     `S.totalGold`. Views at 1280x720, 740x360 and 360x740, plus reduced motion.
   - **Out of scope**: art and the store-build option.
2. **`codex-cards-tavern`** (Codex lane): the art pack in section 10.
3. **`integrate: codex-cards-tavern`**, then a wire card if the judge rules "wire".
4. **Later, if Cal wants them**: a Journal stats line from `n`, chips (the veto), and the store-build option
   (section 9).

## 16. Out of scope

Any game code (that's the build card), the art pack, the rating submission and the store-build decision (Cal), the
online Tavern, and paid anything.
