# Tavern Blackjack

Spec for card `tavern-blackjack-spec` (Opus high, judge gate). It is the source for the build card `tavern-blackjack-build`
and the Codex art card `codex-cards-tavern`.

- **Cal's ask** (10 Oct 2026, thread "Mini game ideas"):
  - 18:44: "I want a mini game, something simple with some risk. I was thinking maybe like fantasy themed blackjack."
  - 18:53: "more clearly blackjack. It is in a tavern after all. I think being able to choose your bet would be good too."
  - 19:00: "Yeah that's pretty good... We also need to be able to reduce the bet too."
- **Mockup v3**, the one Cal saw: https://claude.ai/artifact/4csKr6KFbecvicQdX7NsWy. The rules come from that mockup.
  This spec adds the table limits, the day's limits, the save, the switch and the opening beat.
- **Numbers**:
  - [tavern-blackjack/bj-econ.mjs](tavern-blackjack/bj-econ.mjs): the house edge, the swing, and the table limits from
    the shipped gold curve.
  - The 14-day `sim.mjs --report econ` run.
  - Both are summarised in section 6.
- **Records**: the red team, [tavern-blackjack/red-team.md](tavern-blackjack/red-team.md), and the judge,
  [tavern-blackjack/judge.md](tavern-blackjack/judge.md). Section 17 answers the red team item by item. This version
  also carries the judge's five edits:
  - the lower `net` on a save-code import
  - Hesketh's unlock line
  - the Rule 8 row
  - the 600 s wait after the Tavern
  - the sim's reach check

## 1. What the player sees

1. The zone 13 Captain falls and the Tavern is already built. One notice says: "New on the Camp tab: a card table at
   the Tavern."
2. Camp > Tavern has a new section called **Blackjack**. Hesketh deals there. A first-use hint says: "Bet gold and beat
   Hesketh's hand without going over 21."
3. You set the bet with − and +, or tap a gold coin to add more. A line says "Table: 16 to 310 gold". The numbers only
   ever rise, as your road goes further.
4. Deal takes your bet. You get two cards face up, and Hesketh gets one.
5. You Hit, Stand or Double. Hesketh then draws his cards until he has 17 or more.
6. A line says what happened: "19 beats 17. You win 310 gold." The next hand keeps the same bet.
7. A good or bad run ends for the day: "The table's closed for today." The line doesn't say why, or when it opens again.
8. Nothing at the table costs real money, and gold is never sold.

**Never**

- Never sell gold, coins, table access, extra hands, or a reset of the day's limits (Lantern Rules 1 and 2).
- Never put the table in Next Up, a guide step, a reward, a Deed, a Feat, a bounty, a streak or a pop-up. You find it
  by opening the Tavern. Nothing ever asks you to play. Hesketh's one unlock line (section 11) says what opened and
  never invites.
- Never let table gold count as gold earned: not in `S.totalGold`, the econ ledger, Deeds, hoard lines or health metrics.
- Never let a gold bonus touch a payout. A payout is bet x odds, never x `goldMult()`.
- Never touch the online layer: the online Tavern boxes, presence, the raid or the shared data.

## 2. Why, and where it fits

- **Problem.** Cal wants a short, risky break between fights (his words above). Nothing in the game today lets a
  player risk a little of what they won for a thrill. Cal called the mockup "pretty good" at 19:00.
- **Evidence.** This comes from Cal's ask and his read of the mockup, plus the review data in
  [monetisation.md](monetisation.md). In IdleOn's money reviews, "paid odds, pets, companions, gambling" drew 10 one-
  and two-star reviews against 4 good ones. The anger is at *paid* chance, so this table sells nothing. No playtest
  evidence exists yet. Section 12 is how we get some.
- **Compass.**
  - Loop step: "A day, step 3" (fill a collection, or finish a bounty or a Contract). The table is the day's optional
    side thing, the way Bounties are.
  - A hand takes about 20 seconds, and a sitting is as long as the player likes. It is never part of the 5-minute
    visit.
  - Pillar 2 (camp and away), coverage-map area 9, side content. Goal: Fun.
- **Pillar 2's "calm, low pressure" (P13).** The table is opt-in and out of the way. Nothing nags you to play, and the
  day's limits stop a chase both ways.
- **Ceilings.** No new currency (gold only), no building, and no tap on the camp tour (the tour doesn't visit the
  Tavern view). It is one new thing on a beat of its own (section 7).

## 3. The rules

Hesketh deals standard blackjack, the way most players already know it.

| Rule | Value |
|---|---|
| Cards | Four 52-card decks, **shuffled fresh before every hand**, so counting cards does nothing |
| Card values | 2 to 10 as shown; Knave, Queen and King count 10; an Ace counts 1 or 11 |
| Deal | You get two cards face up. Hesketh gets **one** face-up card. His second card is drawn only after you stand, so no hidden card sits in the save |
| Blackjack | An Ace and a ten-card as your first two cards. It pays 3 to 2, rounded down to whole gold. If Hesketh then makes 21 with two cards, it's a tie |
| Hesketh's blackjack | If his first two cards make 21, you lose **your first bet only**. A Double's extra gold comes back, the same as dealers who check for blackjack |
| Your moves | Hit takes a card. Stand keeps your hand. Double works on your first two cards only: it doubles the bet and takes exactly one card. Double is off if you can't cover it, or if it would pass the day's loss limit |
| Not offered | Split, insurance and surrender. One hand on screen, three buttons |
| Hesketh | Draws to 17 and stands on every 17, soft 17 included |
| Results | Over 21 loses. A higher total wins even money. A tie gives the bet back |
| Suits | Lanterns, Keys, Cups and Thorns. The Jack is the **Knave** (Squire, Crowns and Blades are names the game already uses) |

The fine print under the table says: "Hesketh's rule of thumb: stand on 12 to 16 when I show a 2 to 6. Always hit 11 or
less." It's a fixed tip, not advice on each hand.

The no-hole-card rule with "first bet only" has the same edge as a dealer who peeks. With no hole card, nothing secret
sits in the save, and a reload shows nothing new.

## 4. Bets and the day's limits

Every limit is set in **price-hours**. A price-hour is `econH(z)`, the unit every price in the game uses (312
base-curve foes, `ECON.hourFoes`), at the player's highest zone `S.maxZone`. `econH` only rises with the zone, so the
limits only rise. Every amount is rounded with `econSig`, like every price.

| Limit | Rule | Zone 14 | Zone 25 | Zone 50 | Zone 140 |
|---|---|---|---|---|---|
| Highest bet | 0.12 price-hours | 310 | 410 | 1,100 | 21,000 |
| Lowest bet | 1/20 of the highest, at least 10 | 16 | 21 | 55 | 1,100 |
| Day's win limit | Net up 5 highest bets (0.6 price-hours) | 1,550 | 2,050 | 5,500 | 105,000 |
| Day's loss limit | Net down 5 highest bets (0.6 price-hours) | 1,550 | 2,050 | 5,500 | 105,000 |

**Cut at build (judge, 2026-10-10).** The build's sim missed measure (a) of section 12 at 0.2 price-hours on 2 of 3
seeds (up to 2.69% of income), so the highest bet was cut to 0.12, as section 12 says. The day tables and price
comparisons below were worked at 0.2; at 0.12 every amount in them is 0.6 times as big. Evidence:
`docs/proof/tavern-blackjack-build/evidence.md`.

- **Each limit has one job** (lessons, Economy: one limit per budget):
  - The **win limit** stops a lucky run from skipping a gold wall.
  - The **loss limit** stops a bad night from emptying the camp's budget.
  - The **highest bet** sets how big a single hand feels.
  - The **lowest bet** and **gold held** are only there so a bet can be placed at all.
- **The day.** Net is wins minus bets for the device day (`deviceDay()`, the day the Almanac uses). It resets when that
  day changes. Missing a day costs nothing, and nothing carries over or grows.
- **When the table closes.** A hand that crosses the win limit is paid in full, then the table closes. The loss limit
  is never crossed: the bet is clamped to the room left, and Double is off when it would pass it. The table also closes
  when the room left is under the lowest bet. Either way the line is "The table's closed for today."
- **Bet controls** (Cal, 19:00: raise and lower):
  - − and + step by one lowest bet.
  - Four gold coins add 1, 2, 5 and 10 lowest bets ("+16", "+32", "+80", "+160" at zone 14).
  - Clear goes back to the lowest bet.
  - The bet is clamped to [lowest, min(highest, gold held, room left before the loss limit)]. The last bet is
    remembered.
- **Short of gold.** With less than the lowest bet, Deal is off and the line says "You need 16 gold to sit down."
- **Payouts are exact.** Win: the bet back plus the bet. Blackjack: the bet back plus 1.5 x the bet, rounded down. Tie:
  the bet back. No gear gold, Omen or Dare multiplies any of them. A check runs the table with Gold Fever (+80%) active.

## 5. Gold or chips

The default is **plain gold**. The coins are the game's own gold coin (`ICON.coin`, 10-art.js), and every amount reads
"gold", as in the mockup. This is the Foreman's default. It adds nothing to name or count, needs fewer art pieces, and
reads less like a casino. Cal can veto it with **"Use fantasy chips at the table"**. Chips would then be a picture of
gold, never a second currency: they appear only at the table, and gold is what's held.

## 6. The economy check

`node docs/design/tavern-blackjack/bj-econ.mjs` plays 2,000,000 hands for each way of playing and 20,000 days for each
player type. It reads the gold curve from the shipped core.

**The house edge, per hand:**

| How you play | Edge | Spread (sd, in bets) |
|---|---|---|
| By the chart (no split) | −0.93% | 1.11 |
| Like Hesketh: hit to 17, never double | −5.69% | 0.98 |
| Never risk a bust: stand on 12 and up | −7.90% | 0.99 |

**A day at the table, net, in price-hours (H).** The table bets are clamped to the room left before the loss limit,
and Double is off when it would pass it. A normal day's income is about 21 H: the econ report's EC2 gives 6,655
foe-equivalents a day on the base curve, and 312 foes are 1 H.

| Player | Average | As a share of a day's income | Best day | Worst day | Hit the win limit | Hit the loss limit |
|---|---|---|---|---|---|---|
| Keen: the chart, highest bet, up to 60 hands | −0.05 H | −0.2% | +1.35 H | −1.00 H | 44% of days | 52% |
| Casual: hits to 17, highest bet, 30 hands | −0.23 H | −1.1% | +1.20 H | −1.00 H | 23% | 46% |
| Careful: hits to 17, a quarter of the highest bet, 30 hands | −0.09 H | −0.4% | +1.03 H | −1.00 H | 0% | 0% |
| Timid: stands on 12+, highest bet, 60 hands | −0.38 H | −1.8% | +1.25 H | −1.00 H | 27% | 66% |

14-day `node tools/sim.mjs --report econ --days 14` (Warden; idle, normal and active profiles) at 3937d6c5, before
the table exists:

```text
EC2 income a day (foe-equivalents, 24 h average, from day 2): idle Hollow 9,377; normal Hollow 6,655; active Hollow 7,032
EC4 normal play, spend split: Hollow shifts 14%, camp 30%, upgrades 0%, rest 55% of 877,735
EC5 banked gold under 1 day of income at 90% of check-ins: idle 4%, normal 62%, active 15%
idle   day 14: zone 24, gold a day d1 40,452 d3 66,269 d8 81,745
normal day 14: zone 28, gold a day d1 26,333 d3 65,180 d8 68,979
active day 14: zone 33, gold a day d1 67,002 d3 79,122 d8 95,314
3/8 econ targets pass (EC2, EC3, EC5, EC6 and EC9 fail on the integration branch before this card)
```

**What this means:**

- **It can't mint gold in honest play.** Every hand loses on average, and the day's limits are fixed. So no way of
  betting or stopping comes out ahead over time, including doubling after a loss or leaving while ahead. Fresh
  shuffles stop card counting. The best day possible is the win limit plus one doubled hand that crosses it, about
  1.4 H, or 7% of a normal day's income.
- **It can't wreck a player in honest play.** The worst day is exactly the loss limit, 1 H (about 5% of a normal day's
  income). That's real money early: at zone 14 it is 2,550 gold, and the risk is the point. Late, it never falls to
  pocket change, because it follows the price curve.
- **"Honest play" means an honest device clock and no save-code import.** Moving the date resets the day, and a save
  code can undo a loss (section 8 narrows that). Both are single-player holes that the rest of the game accepts too.
- **Against prices:** a highest bet at zone 25 (690) is about 2% of the camp builds the normal player buys around zones
  26 to 28 (26,000 to 57,000 in the econ report). A full day's limit is 6% to 13% of one. So a bet stings, and a
  great day helps without buying a building.
- **A mild gold sink, by choice.** Gold is the mid-game choke (systems map). The average loss is 0.2% to 1.8% of a day's
  income, and only for players who choose to play.

## 7. When it opens

- **Gate:**
  - The zone 13 Captain beaten (`S.maxZone >= 14`).
  - The Tavern built (`campLv('tavern') >= 1`).
  - The Tavern and Hands rows unlocked at least 600 s of `S.onboard.t` ago. This wait is skipped once `S.onboard.all`
    is set, because that clock stops then (`55-onboard.js`).
  - Without the wait, a cold save that builds the Tavern after zone 14 would get the Tavern build, the Tavern, Hands
    and the table within 10 minutes: 4 new things, at the F4 cap.
- **FEATURES row** (55-onboard.js):
  `{ id: 'blackjack', tab: 'world', view: 'tav', name: 'Blackjack', late: true, why: 'zone 14, with the Tavern built 10 minutes before', when: () => BJ_TUNE.on && S.maxZone >= 14 && campLv('tavern') >= 1 && <the 600 s wait above> }`.
  `late: true` keeps "Show every tab now" from opening it at zone 1.
- **Notice:** an `OPEN_TXT` line, "New on the Camp tab: a card table at the Tavern." Hesketh's `SAY_TXT` line, which
  `check.mjs` requires for every row with an unlock toast ("unlock-voice"), is in section 11. A FIRST_USE line carries
  the hint from section 1.
- **Why zone 14.** The zone 10 Champion clear already brings a starter join (Wren, for a Tobin or Pip pick), the Codex
  and, in a new game, the Hearth 2 and Tavern build with Hands and Tam. Zone 12 opens the raid. Zone 15 is a Champion
  with its own join. Zone 14 has nothing else, and by then the player holds gold worth risking.
- **Proof** (a build-card acceptance line): `tools/walk.mjs` for all three starter picks, plus a cold save that builds
  the Tavern after zone 14. Each shows the table opening with no other new thing within `ONBOARD_TUNE.gap` (90 s), and
  no F4 burst (4 in any 10 minutes). If a pick fails, the gate moves to zone 16 (after the Champion's join).
- **How it shows:** the notice, and the Tavern view's dot until the first visit. It is not in Next Up, not on the guide,
  and there is no pop-up.

## 8. Save

- **New state**, with defaults filled by `fresh()` through `registerState`:
  `registerState('blackjack', { v: 1, day: 0, net: 0, bet: 0, hand: null, n: { hands: 0, won: 0, lost: 0, tied: 0, bj: 0 } })`.
  **The save key stays `lanternfall.save.v5`.** One new field with defaults breaks no old save.
- **The fields:**
  - `day` and `net` drive the day's limits.
  - `bet` is the last bet.
  - `hand` is the hand in play: your cards, Hesketh's up card, the bet, and whether you doubled.
  - `n` holds counts for a later Journal stats line. That line is not in the build card.
- **No reload tricks.**
  - The bet is paid when the hand is dealt.
  - `save()` runs synchronously after the deal, after every card drawn, and after the result, before anything renders.
  - A reload shows the same hand. Every card already drawn is saved, and no card is drawn early.
  - So you can't reload your way out of a bad card or a loss.
- **Save codes.** Importing a code clears `hand` (its bet stays paid). It keeps the **lower** of the stored and imported
  `net` for today, and a `net` from another day counts as 0. So loading an old code on the same day can't reopen a
  table closed by a loss. No import hook exists today (`75-savecode-ui.js` `doImport`), so the build adds one.
- **No ledger entries.** Table gold changes `S.gold` directly:
  - It does not book into the econ ledger (`S.econ.earned` and `S.econ.spent`) or add to `S.totalGold`.
  - So health metrics, EC2 and EC4, Deeds and hoard lines see only fight, camp and bounty gold.
  - The table's own books are `net` and `n` in `S.blackjack`.
  - The systems map lists the table as a gold source and a gold sink (code probes in `tools/systems-map.mjs`), with
    `blackjack` as a stat.
- **Away.** The table does nothing while you're away, and offline parity is unaffected.

## 9. The store-build switch

- **`BJ_TUNE.on`** (1 = the table exists) sits at the top of the new core file. At 0:
  - The FEATURES row never opens.
  - The section and the notice never show.
  - A saved hand in play refunds its bet the next time the game loads.
  - The save field stays.
- **Default: on**, for the web build (including the free public road to the zone 15 Champion) and for Steam.
- **Fails safe.** `check.mjs` prints the flag's state in the build summary. Two lines are added:
  - The ship checklist: "Store builds: Cal confirms the blackjack table's state before any rating survey."
  - DECISIONS.md (via the Foreman): the same line.
- **Why it exists.** A clear blackjack table with gold bets is simulated gambling under the rating boards' rules, and
  it would set the rating for **the whole game**:
  - PEGI rated Overboard 18 for one blackjack scene
    ([askaboutgames.com](https://www.askaboutgames.com/news/pegi-rating-for-gambling-is-now-always-18)).
  - PEGI cut Balatro to 12 on appeal for its fantasy elements, and announced a 12 band while keeping 18 for casino
    simulations ([gamereactor.eu](https://www.gamereactor.eu/balatro-wins-its-pegi-rating-battle-to-have-its-18-rating-reduced-1503623/)).
    The final criteria text wasn't found.
  - On the App Store, simulated gambling is 13+ when infrequent and 18+ when frequent
    ([newly.app](https://newly.app/how-to/app-store-age-rating), a copy of Apple's table; Apple's own page wasn't read).
- **Who decides: Cal**, for each store build, before any rating submission. This spec does not decide it. A build
  option such as `node tools/build.mjs --no-blackjack` belongs to that later card.

## 10. Art

- **Until `codex-cards-tavern` is vetted**, the cards are plain UI:
  - A flat panel in the game's own colour tokens (`--panel`, `--panel-2`, `--gold` in 10-base.css), with a 1 px border.
  - The rank, large, in the corner and the centre.
  - The suit as its **name in small capitals** ("THORNS") in that suit's colour.
  - No glyphs, no emoji, no drawn pictures. Emoji are OS art, and no text glyph exists for a lantern or a thorn.
  - The face-down card (shown only while Hesketh draws) is a flat `--panel-2` panel.
  - The coins use the existing `ICON.coin`.
- **The judge ruled these plain cards are UI, not art.** Allowed: the flat card, the rank as text, the suit name in a
  colour token, the flat face-down card, the existing `ICON.coin`, and a plain slide or flip that respects reduced
  motion. Everything else waits for Codex: suit icons, card frame and back, faces, coin stacks or chips, felt texture,
  and a Hesketh dealing sprite. The mockup's SVG suit icons and patterned card back are **not** carried into the build.
  A build acceptance line greps the new files for glyphs, emoji and inline SVG.
- **The Codex pack** (`codex-cards-tavern`, Codex lane, its own cap):
  - A card frame and a card back, four suit icons, and the Knave, Queen and King.
  - A gold coin stack, and (optionally) Hesketh dealing.
  - It goes through the usual `integrate: <pack>` card, red team and Opus art judge.
- **Found art.** Cal suggested found fantasy card assets at 19:00. He has been asked, on a card in the thread, to choose
  between Codex and a licensed found deck. The default until he answers is Codex, per his art rule. If he picks a found
  deck, a licence check (commercial use, Steam) comes before anything is wired.

## 11. Player-facing copy

| Where | Text |
|---|---|
| Section title | Blackjack |
| Sub line | Hesketh deals. He stands on 17. Blackjack pays 3 to 2. |
| First-use hint | Bet gold and beat Hesketh's hand without going over 21. |
| Unlock notice | New on the Camp tab: a card table at the Tavern. |
| Hesketh's unlock line (`SAY_TXT`, at most 90 characters, no invitation) | I've put a card table in the Tavern. Blackjack, for gold. |
| Limits line | Table: {lowest} to {highest} gold |
| Buttons | Deal {bet} · Hit · Stand · Double · Next hand · Clear |
| Start of hand | You have {n}. Hesketh shows {card}. |
| Results | {p} beats {d}. You win {x} gold. / {d} beats {p}. You lose {x} gold. / Both on {n}. Your bet comes back. / Blackjack! You win {x} gold. / Bust at {n}. You lose {x} gold. / Hesketh busts at {n}. You win {x} gold. / Hesketh makes blackjack. You lose {x} gold. |
| Short of gold | You need {lowest} gold to sit down. |
| Day's limit reached | The table's closed for today. |
| Rule of thumb | Hesketh's rule of thumb: stand on 12 to 16 when I show a 2 to 6. Always hit 11 or less. |

The copy never says "come back tomorrow", never counts down to the reset, and never frames the limit as something to
empty.

## 12. Prediction, and how it's measured

- **Fun.**
  - **Test.** Testers start from a staged save at zone 14 with the Tavern built (the build card names the fixture). No
    one points them at the table.
  - **Hit:** at least 2 of 3 testers play 10 or more hands.
  - **Miss:** fewer than 2 of 3.
  - **Cal's own check:** after his first sitting, Cal says whether it's fun. "Not fun" is a miss whatever the testers did.
  - A miss sends the table back as a re-brief card, not more tuning.
- **Economy.** The build card adds a table policy to `sim.mjs`: the casual player, 30 hands a day at the highest bet,
  from zone 14. With it on, against the same run with it off (14 days, every profile):
  - **(a)** The table's mean net loss is at most 2% of EC2 income, and the 90th-percentile losing day is at most 1.1 H.
  - **(b)** The EC5 share moves by less than 5 points.
  - **(c)** Each profile's zone at day 14 moves by less than 1 zone.
  - **(d)** `S.econ.earned` and `S.econ.spent` are unchanged, because the table books nothing.
  - **(e)** Every profile reaches the table and plays at least 100 hands in the run. If one doesn't, the measure is void,
    not passed.
  - **Miss:** any of these fails. The fix then is to cut the highest bet, not to change the edge.
- **Rating.** Not measured here. Cal decides (section 9).

## 13. Switch it off

- `BJ_TUNE.on = 0`. The table, notice and FEATURES row go away, a hand in play refunds its bet, and the `blackjack` save
  field stays unused. Nothing else reads it.
- To remove it fully, delete:
  - the two new JS files and the CSS file
  - the FEATURES row, and the OPEN_TXT, SAY_TXT and FIRST_USE lines
  - the systems-map lines
  - the sim policy

  Old saves keep a harmless `blackjack` field.

## 14. The Lantern Rules, all ten

| Rule | How the table stands |
|---|---|
| 1. Never sell power or chance | Nothing is sold. Gold is never sold |
| 2. Never sell anything random | The table's chance comes only from play |
| 3. Never take back | The day's limits close the table. They never take gold back, and a refund comes if the switch goes off mid-hand |
| 4. No friction to sell its removal | The day's limits can't be bought off, and no purchase touches them |
| 5. Never interrupt | One notice when it opens. No pop-ups, no dots after the first visit |
| 6. Never sell a core convenience | Not applicable: nothing is sold |
| 7. Earned prestige stays earned | No Deeds or titles from the table |
| 8. Show real prices | Every bet, and the table's lowest and highest bets, are shown in gold before you Deal. The day's limits are not shown. They are not prices: they only close the table, with one plain line ("The table's closed for today."), and never take gold |
| 9. Same game on every paid build | The switch is per store build, and Cal decides it before any rating. Nothing paid differs |
| 10. Purchases never lost | Not applicable |

## 15. Alternatives weighed

| Option | Why not |
|---|---|
| "Wick": blackjack rules with rune stones in a lantern, five foes, bank or push on (mockup v1) | Cal (18:53) wants clear blackjack: it's a tavern |
| Cellar Doors / Higher or Lower / Liar's dice | Pitched at 18:44. Cal picked blackjack |
| A fixed 10 to 250 table (mockup v3) | It's huge early and worthless by Region 4. The limits must follow the price curve |
| Limits in foe gold (this spec's first draft) | Early foe gold is doubled while prices aren't, so the stakes were off by 2x. The limits also fell from zone 21 to 35, as the early bonus fades. Price-hours fix both |
| No day's limits | The edge bounds gold only on average. A lucky week could skip a gold wall, and an unlucky night could empty the camp's budget |
| A shoe dealt down to 20 cards (mockup) | A deep shoe can be counted for a player edge. A fresh shuffle every hand closes that |
| A hidden dealer card with a peek (mockup) | The hidden card would sit in the save. No hole card, with first bet only, has the same edge |
| Booking the table in the econ ledger | It would put table wins into the health metrics and dilute EC4's spend shares |
| Split, insurance, surrender | Each adds a button and a rule to explain. No split costs the chart player about 0.4% edge, which is fine for a pastime |

## 16. Build cards

1. **`tavern-blackjack-build`** (Claude, Opus medium; the Foreman refines it from this spec).
   - **Files:**
     - `src/js/57t-blackjack.js` (core): rules, limits, the day, save, `BJ_TUNE`.
     - `src/js/75-blackjack-ui.js`: `registerSection('tav', { id: 'blackjack', title: 'Blackjack', feature: 'blackjack', ... })`.
       It appends below the existing Tavern boxes and doesn't reorder the online Tavern.
     - `src/styles/60-blackjack.css`.
   - **Extension points:**
     - FEATURES row, and the OPEN_TXT, SAY_TXT and FIRST_USE lines (55-onboard, 75-onboard-ui).
     - Systems-map registry.
     - Save-code import hook (section 8).
     - A `sim.mjs` table policy.
     - The `check.mjs` flag line.
   - **Acceptance:**
     - Rules, payouts, and Hesketh's draw and blackjack.
     - Limits by zone, rising only.
     - The clamp, and Double off at the loss limit and when short of gold.
     - The day's reset across `deviceDay`.
     - Synchronous saves and the reload test.
     - Save-code import.
     - `BJ_TUNE.on = 0` refunds a hand in play.
     - Gold Fever doesn't change payouts.
     - Ledger and `S.totalGold` unchanged.
     - A 300 ms press guard after Deal, Next hand and each result, and Hit never placed where Deal sat.
     - The walk proof (section 7) and the economy measures (section 12).
     - Views at 1280x720, 740x360 and 360x740, plus reduced motion.
     - A grep of the new files finds no suit glyph, emoji or inline SVG (the art freeze).
   - **Out of scope:** art, and the store-build option.
2. **`codex-cards-tavern`** (Codex lane): the art pack in section 10, unless Cal picks a found deck.
3. **`integrate: codex-cards-tavern`**, then a wire card if the judge rules "wire".
4. **Later, if Cal wants them:** a Journal stats line from `n`, chips (the veto), and the store-build option.

## 17. Red team answers

| # | Finding | Answer |
|---|---|---|
| 1 | The economy prediction can't be measured | Section 12 now measures the table's net, EC5, the zone at day 14, and the ledger left unchanged |
| 2 | Ledger booking leaks into health and EC4 | The table books nothing in the ledger (section 8) |
| 3 | The opening beat is shared | The gate moves to zone 14, with walk proof for all three picks (section 7) |
| 4 | Reload re-roll and the hidden card in the save | Synchronous saves after every draw, and no hole card (sections 3 and 8) |
| 5 | Double and the clamp | Double is off when short of gold or past the loss limit. The table closes when the room is under the lowest bet, and the probe models it |
| 6 | Units | Limits are in price-hours (`econH`). The EC5 reasoning is withdrawn, and prices justify the bet size instead |
| 7 | The limits fall | `econH` rises with the zone, and the probe prints any fall (none) |
| 8 | Gold multipliers | Payouts are exact, with a Gold Fever check (section 4) |
| 9 | UI hooks | `registerSection('tav')`, `feature`, `late: true`, `when`, OPEN_TXT (sections 7 and 16) |
| 10 | Art can't be built as written | Suit names in small capitals, no glyphs or emoji, `ICON.coin`, the game's tokens (section 10) |
| 11 | Found art not asked | Cal asked on a decision card. The Codex default holds until he answers |
| 12 | Hesketh as the house | The judge ruled that Hesketh deals ("Let Tam deal the cards" vetoes it). The copy never gloats, keeps a purse or says "the house" |
| 13 | The switch fails open | The `check.mjs` flag line, a ship-checklist line, a DECISIONS line, and sources cited (section 9) |
| 14 | Honest play only | Claims scoped, and save-code import keeps the lower `net` (sections 6 and 8, the judge's edit) |
| 15 | Double taps | Press guard and button placement in the build acceptance |
| 16 | Chore-like copy | "The table's closed for today." No "come back", no countdown |
| 17 | Loop step | "A day, step 3", side content, with the reason (section 2) |
| 18 | Tavern opening rule | The gate reads `campLv('tavern')`, which covers both cold and warm saves |
| 19 | Name clashes | Knave, and Lanterns, Keys, Cups and Thorns |
| 20 | All ten Lantern Rules | Section 14. The wording is now "gold is never sold" |
| 21 | Fun prediction | Staged save, no pointer, matching hit and miss lines, and Cal's own check (section 12) |
| 22 | One limit per budget | Each limit's job is named (section 4) |
| 23 | Systems-map kind | `blackjack` listed as a stat (section 8) |

## 18. Out of scope

Out of scope here:

- Any game code (the build card).
- The art pack.
- The rating submission and the store-build decision (Cal).
- The online Tavern.
- Anything paid.
