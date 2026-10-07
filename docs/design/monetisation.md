# How Lanternfall earns money

Copy of `/mnt/project-files/monetisation/plan.md` (2026-10-06). The rulings are in `docs/DECISIONS.md` under Money. The
research, red team and judge records are in [monetisation-records/](monetisation-records/).

2026-10-06. Asked by Cal in the thread "fun, profitable and well reviewed". Design only: no store, no payment code,
no live prices, no outside contact. Those wait for Cal.

**Status: decided.** Cal delegated the open calls (18:30, "I don't want to be involved"). A red team and the Opus judge
ruled on all seven (section 10, with [the red team](monetisation-records/decisions-red-team.md) and [the rulings](monetisation-records/decisions-judge.md));
the rulings are in `docs/DECISIONS.md` under **Money**. Only real-money and legal steps stay with Cal: store accounts,
payment code, live prices, business and legal set-up.

**Sources.** The fun library's review corpus (56 games, 12,006 review texts in `tools/research/raw/`, re-tagged for money
themes for this plan), IdleOn's 421 App Store reviews read one by one for money talk, web research on IdleOn, Melvor,
OSRS, Shop Titans, Path of Exile, Warframe and others ([web-games.md](monetisation-records/web-games.md)), web research on fair odds,
loot-box law and store fees ([web-fairness.md](monetisation-records/web-fairness.md)), `docs/DECISIONS.md`, `docs/lessons.md`, the
Why review and its answers, and the game's code (the looks in `12g-art-accessories.js`, `64-looks.js`).

Every point below has the same shape: **why** (what is true now, with evidence), **options**, **pick**.

---

## The short answer

1. **Free to play, Season 1's story free for good, no ads of any kind.** The money comes from things players want to
   show and things that save them time, never from power or chance. A time saver is allowed only when a free player
   reaches the same ceiling through play (earn or buy, the Soda Dungeon 2 rule).
2. **Four things to sell, in this order:**
   - **Looks**, bought outright at a shown price: capes, hats, lanterns, flame colours, auras, critters, portrait
     frames, plus two new slots (the parry spark and camp pieces). The game already has 7 look slots and
     bakes looks onto the hero, so a new look needs art, not new code. Under the art freeze every new look comes as a
     complete pack drawn by Codex in the heroes' style and vetted as a whole before it ships; agents never draw it in
     code.
   - **The Lantern Keeper**, one purchase, once: loadout slots beyond the Armoury's maximum, a Keeper look set and
     supporter credits, plus a head start on the away cap (+2 hours on whatever you have built, never past the 24 hours
     every player can reach) only if a free bot run reaches the 24-hour cap within 40 hours of play.
   - **One supporter pack** at launch for players who want to give more: looks and a name in the credits. Two higher
     tiers and the soundtrack come only once the shelf holds 30 or more store looks and the music ships.
   - **The Road Pass**, after 1.0: a free and a paid track of looks only, earned by normal play, never expiring. It is
     the recurring income line.
3. **Heroes stay earned.** All 34 come through the story (32 at 1.0). "Characters" money comes from hero outfits
   (the three starters first, then each new hero as it ships), outfits by armour weight, and critter companions.
4. **The gacha feeling comes from earned Lantern Caches**: opened after boss wins, odds shown on the cache, a pity
   counter you can see, no duplicates. Caches and their keys are never sold, and nothing bought is random.
5. **The fastest way to bad reviews** is the path IdleOn took after year two: power in paid bundles, paid odds with
   empty results, offers that pop up, and a new pack every update. We write ten rules (the Lantern Rules) that forbid
   each of those, and every card that touches money is checked against them.
6. **Before we can sell anything** we need a home that can take money (the claude.ai artifact cannot; Steam first), a safe
   place for purchases outside `localStorage` without forcing an account, a Wardrobe screen, an early game that keeps people, and Cal's
   business and legal set-up. The early-game work can start the earned half now (caches, collection meters, looks as
   rewards) with no money involved.

---

## 1. What players reward and punish (evidence)

### 1.1 The pattern across 56 games

**Why it matters.** Money complaints are the second-loudest reason people leave idle and RPG games on phones, and a
quieter but real reason committed players quit.

| Theme | Negative reviews | Long-play quits (50h+) | Loudest in | Source |
|---|---|---|---|---|
| Ads | 454 | 7 | AdVenture Capitalist 85, Idle Miner Tycoon 49, Tiny Tower 35 | fun library Q3 |
| Pay-to-win and paywalls | 292 | 29 | RAID 49, Idle Heroes 39, Hero Wars 21, AFK Arena 20, Shop Titans 19 | fun library Q4 |
| Energy, timers, wait gates | 155 | 22 | RAID 40, Hero Wars 23 | fun library Q7 |

On the other side, about 200 positive reviews praise having no forced ads, and 249 praise fair money (fun library P2
and P3: "Best of all, there's no pay to win or 'speed up' boosts", Melvor, 2,264 h; "free to play with no paywalls,
no ads, and no P2W", Orna). Players say why they pay, too: about 38 positive reviews talk about paying or watching ads to support the developer
(Cell to Singularity, Idle Slayer, Melvor, Shop Titans), and the IdleOn reviews below show the same.

What each game's players say about its model (from the corpus, quotes verbatim):

| Game | Model | Praised | Punished |
|---|---|---|---|
| **Orna** | F2P; cosmetics, item packs, dungeon keys | "The cash shop is only cosmetics, item packs, dungeon keys. The latter two being obtainable in-game already. Those things alone nets this 5 stars" | the grind, not the shop |
| **Idle Slayer** | F2P; optional rewarded ads, a few purchases | "the only in-app purchases are hidden away, and not shoved in your face" | slow late progress |
| **Melvor Idle** | Free base, one-time Full Version, paid expansions | "with the new expansion ... the best bang of the buck I've ever purchased" | locking skills players had already levelled: "I'm in the 'Demo Mode' and I'm locked out of skills I've been training (some of which I have gotten to 99)" |
| **Shop Titans** | F2P; gems, a $9.99 monthly membership, packs | the membership "is also fine" | "$20 and $50 to unlock workers who provide powerful buffs"; "monthly item packs for $15 each that introduce new blueprints that surpass what is available for free" |
| **AFK Arena** | gacha heroes | free diamonds early | "requiring an excessive amount of duplicates to be pulled in order to make any real progress"; a borrowed hero that is "gone for good" if not bought |
| **RAID** | gacha heroes, energy | the art | "Spent an entire month to acquire my first Sacred Shard, finally open it and get a poor quality epic" |
| **Idle Berserker, Hero Wars** | skins with stats | the look of the skins | "each skin you acquire boosts your stats significantly"; "since the update for costume upgrades ... it's become heavily P2W" |
| **OSRS** | monthly membership | the members' game | locked areas and skills for free players; 49 of the 79 reviews that mention membership are negative |

### 1.2 IdleOn, the key case

**Why.** Cal cites IdleOn, and its reviews show both the best and the worst of idle monetisation in one game, made by
one developer.

Of IdleOn's 421 App Store reviews, 86 talk about money. 53 of those are 4 or 5 stars and 29 are 1 or 2 stars. The split
by topic is the lesson:

| Topic in a money review | 4-5 stars | 1-2 stars |
|---|---|---|
| "fair", "you don't have to pay", "gems for free" | 17 | 5 |
| support the developer | 8 | 4 |
| packs and bundles | 7 | 13 |
| paid odds, pets, companions, gambling | 4 | 10 |

The early game earned the praise: "Genuinely fair monetization where paying money feels more like donating to the
developer than anything else." "I've bought a couple packs to support LAVA but I've gotten almost as many gems just
playing the game." "you can still reach EVERY goal without spending a penny."

The later game earned the 1-stars, and every one names a specific change:
- **Power in packs:** "you get a bad feeling seeing weeks of your progress get eclipsed in a new mtx paid bundle that
  gives larger stat multipliers than is possible from anything else."
- **A basic feature sold for cash:** "adding auto loot, a basically necessary feature ... as a dollar only purchase.
  This conflicts with most other things in the game that are gem purchases, and gems can be earned in game."
- **Paid odds with nothing on a miss:** "Most of the time with buying treats in the pet system you will get nothing.
  No consolation prizes."; "For just $900 dollars you can have a 9/10 chance to get a singular companion."
- **Odds that did not match the code:** "a 1% chance ... he's lying and saying it's a higher chance than 1% even though
  his own code proves he's lying."
- **Price creep and pace:** "Every update releases a new pay to 'win' bundle that costs more every release. The most
  recent was $40."; "multiple of these $20-30 packs out a month."
- **Offers in the way:** "when I log on yall gotta shove a offer in my face ... I ACCIDENTALLY PRESSED YOUR DUMB OFFERS."
- **Platforms out of step:** 16 of the 1-2 star money reviews are about the iOS build lagging Steam, so paid items and
  events were missing on phones ("people have spent money on a game they literally cannot play").

**The lesson.** Players accept paying when the free player can reach everything and the purchase feels like thanks.
They turn when a purchase beats what play can earn, when chance is sold, or when the shop interrupts. IdleOn did not
start unfair; it drifted. Our rules have to stop drift, not only a bad launch.

**What IdleOn sells (web, partly unverified; see [web-games.md](monetisation-records/web-games.md)).** Its Steam page says "All
classes, maps, skills, bosses, and activities are available without purchase". Gems are the premium currency, sold
($1.99 for 200 up to $29.99 for 6,500) and also earned (about 30 a day early, 800 to 1,000 a week later). The gem shop
is mostly permanent room: card slots, storage, bag space, food slots, a few cosmetic chat rings. Guides rank those as
good value and players defend them ("There is nothing to 'win'", "The game is perfectly playable without buying any of
it."). The anger is aimed at three later layers: a $5 cash-only auto-loot ("If the game was worth $5 then put that
price on the game"), weekly $20 to $30 bundles with stat bonuses free players cannot get, and a 2023 pet gacha whose
best pet started at 0.28% to 0.85% a pull. Lava later added a 200-pull pity, free daily pets and a free token, a partial
retreat, after players were banned from the Discord for calling it predatory. Steam sits at about 75 to 79% positive.
A third-party estimate puts IdleOn at about $1M a month (unverified). So the drift paid, and it still cost the game its
reputation. RuneScape 3 is the same story at scale: in January 2026 Jagex removed Treasure Hunter and its direct-XP
items after a poll, with its CEO saying "Our MTX approach is harming RuneScape".

---

## 2. The Lantern Rules (the fairness line)

**Why.** Every bad case above came from one decision that looked small at the time. A written line that every card is
checked against is cheaper than a review bomb. DECISIONS.md already says "nothing pay-to-win" and "never exclusive
power, nothing taken back when it lapses"; these rules make that testable.

**Options.** (a) Judge each item when it comes up. (b) A short public promise plus internal checks. (c) The rules
below, kept in `DECISIONS.md`, checked by reviewers on every card that adds a price, a currency, a timer or a gate, and
a short version shown on the store page and in the game's shop.

**Pick: (c).** The public version is a selling point; Orna and Melvor reviewers name "no pay to win" as the reason for
5 stars.

1. **Never sell power or chance; sell time only up to a shared ceiling.** Nothing bought changes a fight, a drop, a
   gather rate, a craft or the raid. A time saver may only bring forward something every player reaches in play (the
   same away ceiling, the same loadout maximum), and must be earnable in play too. Test: a free player who keeps
   playing ends with the same numbers as a buyer.
2. **Never sell anything random.** Every purchase shows exactly what you get. Random rewards come only from play.
3. **Never take back.** Nothing free becomes paid, nothing earned is locked, nothing bought expires or lapses.
4. **Never build friction to sell its removal.** No energy, no starved bag, no timer added so a purchase can skip it.
   Test: a free player never hits a limit the shop removes before they have the in-game way to raise it.
5. **Never interrupt.** The shop lives in one place. No pop-ups, no offer on opening the game, no red dot for a sale.
6. **Never sell a core convenience.** Repeat, auto-salvage, sorting, the Assist timing setting and every
   accessibility option stay free (IdleOn's paid auto-loot is the warning).
7. **Earned prestige stays earned.** A look from a Deed, a Feat, a boss or a secret is never sold, so it still means
   you did it.
8. **Show real prices.** No premium currency to blur them; no bundles priced so a leftover is stranded.
9. **Same game on every paid build.** A purchase shows on every build that sells; no paying platform gets an item
   late. (The free web build may stay unsold.)
10. **Purchases are never lost, and the game never needs an account.** Purchases live with the platform (or an
   optional account on the web), not in the save, and can always be restored.

---

## 3. What to sell

### 3.1 Looks (cosmetics)

**Why.** Looks are the one thing every fair game in the corpus sells without complaint, and Lanternfall is unusually
ready for them: `12g-art-accessories.js` already draws 33 looks in 7 slots in code (5 capes, 5 hats, 6 lanterns, 4
flame colours, 5 auras, 4 critters, 4 portrait frames), baked onto the hero by `64-looks.js`, with reduced motion
handled. Today all 33 are earned from Deeds. The slots, the baking and reduced motion already work, so a new look is
art only. The art freeze (`CLAUDE.md`) says agents do not draw art in code and effects such as sparks come from the
artist's pack, so every store look is a Codex art pack (themed sets of 4 to 6 pieces), vetted as a whole set before it
ships. Small sets keep art cost (Cal's concern) moderate. The flame colour also lights the stage (`lookFlameCol`), so
it is on screen the whole time.

**Options.**

| Option | Fit | Cost per item | Risk |
|---|---|---|---|
| A. Looks in the existing 7 slots | Every hero, every class | A Codex art pack; no new code | None; slots exist |
| B. A parry spark slot: the colour and shape of the flash on a perfect parry or dodge | The most-seen moment in the game, every hit | The slot is code; every spark, the default included, is a Codex art pack | Must never change timing or readability; same size, same moment |
| C. Camp pieces: banners, a fire style, Trophy Wall frames | Pillar 2, the camp; shows on the camp card | Low to medium | Wait for the camp layout to settle (camp art is placeholder) |
| D. Themed sets ("Sunken Coast set": cape, lantern, flame, spark) | Region launches and the Road Pass | Sum of parts | None |
| E. Per-hero outfits | Strong pull for a favourite hero; DECISIONS already gives each hero art that becomes its first outfit, so the pipeline exists | Medium to high: per-hero art | Art cost scales with heroes; see 3.2 |
| F. Interface themes, number fonts | Cheap | Low | Readability; low value |

**Pick: A + B first, D for each region, C once the camp art pack is vetted, E as in 3.2.** Store looks are a
separate catalogue from earned looks (Rule 7): a store look is never a recolour of a Deed look.

**Price bands for planning only (not live prices):** one look in the price of a coffee (about £1 to £3), a set of four
around £4 to £6. Cal sets real prices later.

### 3.2 Heroes and characters

**Why.** Cal named characters as something people pay for, and in gacha games heroes are the main seller. But in
Lanternfall a hero is power (its kit, its evolutions) and a story beat: no hero unlocks before their first scene
(DECISIONS, story gate). Only 3 heroes can carry the lamp today (32 planned for 1.0, 34 in the roster). In the corpus, paid heroes are the single most
punished thing (AFK Arena's duplicates, RAID's shards).

**Options.**

| Option | Why for | Why against |
|---|---|---|
| A. Sell heroes | The biggest earner in hero games | Power (Rule 1); breaks the story gate; the most-punished model in the corpus |
| B. Sell an early unlock of a story-gated hero | A time saver | Spoils the story; still power earlier |
| C. Sell outfits by armour weight (heavy, medium, light) | One drawing per weight dresses every hero of that weight; the gear art already does this | Less personal than a per-hero skin |
| D. Sell critter companions | The game has 4 critters (cat, moss, moth, wisp) that follow the hero and sleep at camp; companions are a proven seller and carry no power | Each needs a small pose set in a Codex art pack |
| E. Guest heroes outside the story, sold | Characters without breaking the gate | Still power; a sidegrade is hard to prove across 34 heroes |
| F. Per-hero outfits | Attachment to a hero (Cal wants more of it); each hero already gets art and a first outfit (DECISIONS, equipment art) | Per-hero art for every hero |

**Pick: F for the three starters at launch, then one outfit per new hero as it ships; C and D alongside; never A, B or
E.** All heroes stay earned through the story. This also helps Cal's "no attachment to heroes" note: a hero you dressed is a hero you care about.

### 3.3 Time savers

**Why.** Cal wants time savers. They are where most idle games go wrong, because a time saver either saves taps
(players thank you) or saves progress (players call it pay-to-win). Lanternfall's standing decisions narrow it
further: no idle combat, no auto-gather, min-maxing wanted, the away cap is a goal you raise in play (4 hours, up to
24 through the Hourglass and the Watchtower), and the world raid has a damage leaderboard.

**The test: a time saver may bring forward what every player reaches, and must also be earnable in play.**

| Candidate | What it saves | Verdict |
|---|---|---|
| Away-cap head start: +2 hours on top of what you have built, never past 24 | Output while away, for busy players | **Sell, in the Keeper.** The ceiling is the same for everyone; a free player gets there through the Hourglass and the Watchtower, and the edge shrinks to nothing as they do. Gathering only; no fights. Gated: ships only if a free bot reaches 24 h within 40 hours of play (ruling 2) |
| Loadout slots beyond the Armoury's maximum | Taps; the min-maxer's favourite tool | **Sell, and earn** (a late Deed gives the same slots). The Armoury keeps its own loadouts and room as a camp goal (DECISIONS, 2026-09-28) |
| More Armoury or bag room | Sorting time | **Don't sell.** The Armoury building already sells this for gold; selling it too would gut the building |
| Longer order queues at the camp | More output per check-in | **Don't sell.** Make queue length a camp upgrade earned in play |
| A second save slot | Little; save export and import already does this, and two saves would fight over one raid entry | **Don't sell** |
| Time skips ("2 hours of gathering now") | Progress | **Don't sell.** RuneScape 3 removed its direct-XP items in January 2026 after a player vote, and Assassin's Creed Odyssey's XP boost read as selling the grind back. Some IdleOn fans accept its time candy, so this is a judgement call; we keep skips as rare earned prizes |
| XP, gold or gather boosts | Progress | **Never** (Rule 1) |
| More Hands or Tents | Output | **Never** |
| Instant builds or crafts | Progress | **Never** |
| Retry or revive in a boss | Skill | **Never**; the core is hand-played fights |
| Repeat for Hands, auto-salvage, sorting, Assist timing | Core comfort | **Free forever** (Rule 6) |

**Options for how to sell them.** (a) One by one. (b) A monthly membership (the 2026-09-28 direction: "a membership
with capped convenience perks ... nothing taken back when it lapses"). (c) One purchase, once. (d) Both (c) and a
monthly look subscription.

**Pick: (c), the Lantern Keeper,** about the price of a paperback: the extra loadout slots, a Keeper look set and
supporter credits, and the away head start behind a gate (judge): it ships only if a free bot run reaches the 24-hour
cap within 40 hours of play, so the edge really does close; otherwise the Keeper ships without it. Why one purchase: a short list of comforts reads as "buy the game if you like
it", which is how Melvor's Full Version reviewers talk about it, and nothing can lapse. A membership is not unfair (OSRS
and Shop Titans players accept theirs; OSRS's complaints are about locked areas, not perks), but with only two comforts
to offer it would be thin. Recurring income comes from the Road Pass (3.4). If Cal prefers the membership he named in
September, option (b) fits the rules as long as perks stay for good. Ruled (section 10): the Keeper, no membership at launch.

### 3.4 The Road Pass (later)

**Why.** Season passes are the steadiest earner in live games and give players a goal at the days range (coverage area
3). They draw anger when rewards expire, when the paid track holds power, or when progress needs daily chores (Q11).

**Options.** (a) No pass. (b) A free track only, as a goal ladder. (c) Free and paid tracks, looks only, earned by
normal play, never expiring, any old pass buyable later. (d) A timed pass with daily tasks.

**Pick: (c), after 1.0**, launched with the Lantern Festival (already planned for after 1.0). It needs a content
pipeline of about 10 to 15 looks a season, so it waits until the look store has proven that pipeline.
Evidence: Halo Infinite's pass never expires and is accepted, but slow progress
still drew weeks of backlash until it was sped up; Deep Rock Galactic's free seasons, where anything missed can be
earned later, are praised; Overwatch 2's pass, with its slow grind and thin free rewards, was part of what drew
"Overwhelmingly Negative" Steam reviews (alongside balance and missing PvE). So the pass must also be quick enough at a
relaxed pace, with a free track worth having.

### 3.5 Story and expansions

**Why.** Melvor sells expansions and its reviewers call them good value; Cal's 1.0 is Season 1, with Season 2 after.

**Options.** (a) All story free forever. (b) Season 2 as a paid expansion. (c) A free first region and a paid full road
(Melvor's model).

**Pick: Season 1 free forever, and say on day one that later seasons may be paid expansions.** The story is what pulls
players forward (fun library P10) and a paywall mid-road would be the same wall players quit over (Q2, Q4). Saying it up
front keeps (b) open without a Melvor-style "Demo Mode" surprise; a free first region with a paid road (c) is ruled out
because Season 1 is already promised free.

### 3.6 Ads

**Why.** Cal said no ads. The corpus agrees on forced ads (454 negatives) but is kind to optional rewarded ads (Idle
Slayer, Cell to Singularity: "every advertisement that you can watch helps double your offline earnings").

**Options.** (a) No ads. (b) Optional rewarded ads for a bonus.

**Pick: (a), no ads at all.** A rewarded ad pays out progress, which breaks Rule 1, and "no ads" is a line on the store
page that sells the game.

### 3.7 Supporter packs and the soundtrack

**Why.** A fair model gives up the few big spenders who carry gacha games. Fair games still serve them with looks: Path
of Exile sells supporter packs from about $30 to several hundred, upgradable from one tier to the next; Leaf Blower
Revolution sells a supporter pack; many indies sell the soundtrack. Without a top tier, a payer's spend tops out around
the price of the Keeper and a few looks.

**Options.** (a) No high tier. (b) Tiered supporter packs: looks, credits, a Tavern mark. (c) Packs plus the soundtrack
once music ships (it is on the 1.0 list).

**Pick (judge, after the red team): one tier at launch (planning band about £5 to £10); tiers two and three (about £25
and £50, upgradable by paying the difference) and the soundtrack only once 30 or more store looks exist and the music
ships.** A £50 tier with a thin shelf invites "greedy" reviews, and an early ladder looks like bundle creep. Every item in them is a look, a credit or music; none of it is power. The Tavern mark shows to other
players, which changes room presence, so it waits for sign-off (section 7, item 9).

### 3.8 Giving light (an idea of our own, later)

**Why.** The story's heart is Elowen breaking the Oath by giving the Mother Lamp away in sparks, each lit for a
stranger; "every lamp you light is given, not kept". A purchase can echo that.

**The idea.** Any look bought can also light a spark for a stranger: a new player somewhere gets a small earned-style
gift (a starter flame colour) with your name on it, and you get a Journal line saying who received it. Buying feels
generous, not selfish, and new players meet the community on day one.

**Pick: park it for after the store exists.** It touches the online layer (who receives, a new shared doc), which waits
for Cal.

---

### 3.9 Real prices or a premium currency

**Why.** Most free-to-play games sell a premium currency (IdleOn's gems, Shop Titans' gems) and price the shop in it.
It lets a store sell packs of currency, absorbs per-sale fees and regional pricing, and can be dripped in play. But it
also hides what a thing costs, strands leftovers (Rule 8), and adds a currency to a game that the Why review already
caps at 8. EU consumer authorities' principles on in-game virtual currencies (March 2025) ask that prices be shown in
real money too, which removes most of the currency's convenience while keeping its cost.

**Options.**

| Option | Why for | Why against |
|---|---|---|
| A. Real prices, no premium currency | Clearest for players; nothing stranded; no new currency; matches the EU principles | Flat per-sale fees bite on small items; regional prices set per item |
| B. A sold premium currency (gems) | Industry norm; one price list; packs absorb fees | Hides costs; leftovers push extra buys; the corpus punishes it when it buys power; a 9th currency |
| C. An earned mark that part-pays store looks | Drip-earned currencies review well (NGU, Warframe); rewards play | Blurs earned and bought looks (Rule 7); a 9th currency; tempts selling the mark later |
| D. Hold the call until a store is chosen | Keeps options open | Leaves the shop design unsettled while looks and the Keeper are designed |

**Pick: A.** Show real prices on every item. Where a store charges a flat fee per sale, sell looks in themed sets
(3.1 option D) rather than add a currency. Live and regional prices stay with Cal (section 10, ruling 3).

## 4. How it fits the core loop and Cal's standing decisions

| Standing line | What the plan does |
|---|---|
| Pillar 1: every fight hand-played | Nothing bought touches a fight. The parry spark is colour only: same size, same timing, never on the hit window |
| Pillar 2: a camp that works while away | The only output sold is the Keeper's away head start, capped at the 24-hour ceiling every player reaches; queues and room stay earned camp goals |
| Pillar 3: building your own hero | Loadouts help min-maxers swap builds; they never add a build. Outfits and critters make the hero yours |
| Pillar 4: pushing light down the road | Flames, lanterns and the spark are light itself; the Giving-light idea is the story's own theme |
| No idle combat, no auto-gather | No auto-anything is sold |
| Min-maxing wanted | The min-maxer's edge stays knowledge and play; paid loadout slots only go past the Armoury's maximum and are also earnable |
| 34 heroes (32 at 1.0), no per-hero authored content in designs | Hero outfits ride the per-hero art each hero already gets (DECISIONS, equipment art); armour-weight outfits and critters scale to all |
| No prestige or resets | Nothing sold resets or speeds a reset |
| At most 8 named currencies (Why review ceiling) | No premium currency; prices are real money; caches add no currency (no duplicates) |
| Every cosmetic is earned, never sold (Achievements, 2026-09-28) | Replaced (ruling 1): earned looks stay earned forever (Rule 7); store looks are a separate catalogue that never copies them |
| Membership with capped convenience perks (2026-09-28) | Replaced (ruling 2): the one-time Lantern Keeper carries the perks; the Road Pass carries recurring income |
| Armoury gives bag size and loadouts (2026-09-28) | Room is never sold; only loadout slots past the Armoury's maximum |
| Enemies never drop crafting materials (2026-10-01) | Caches pay no materials (section 5) |
| Online layer untouched | Store looks and supporter marks show only on your own screen at first; showing them in the Tavern changes room presence, which waits for sign-off. The raid runs on the claude.ai page's online layer, so a Steam build ships single-player until the online layer has a plan there |

---

## 5. The reward feeling: gacha-like, but fair

**Why.** Cal wants the dopamine of a pull. The corpus shows what players love about it (a drop worth opening, a
collection filling) and what they hate (paying for it, empty pulls, needing duplicates, hidden odds). Today
Lanternfall's drops are quiet: a unique can drop without an announcement (Cal, 18:16), and boss wins pay numbers.

**Options.**

| Option | Feeling | Fair? |
|---|---|---|
| A. Plain drops, louder (announce uniques, a sound) | Small | Yes |
| B. Earned Lantern Caches with a reveal, shown odds, a pity counter, no duplicates | Strong: the open is the moment | Yes: no money touches it |
| C. Pick one of three (Hades boons, already in the Deepwell) for the biggest caches | Choice adds a second hit | Yes |
| D. Paid gacha | Strongest pull for spenders | No: Rule 1 and 2; loot-box law; the IdleOn 1-stars |

**Pick: A now, then B with C for Champion and Elder caches.** The design:

- **Where caches come from:** every boss win (a Captain cache, a Champion cache, an Elder cache, rising with the boss
  tiers card), Contracts won with their Dare, first clears, Codex milestones. Never bought; no key is ever sold.
- **What is in them:** always something useful (Essence or relics sized to where you are; never crafting materials,
  since enemies never drop them, and little gold, since gold is the flat camp budget), plus a chance at a look from the
  cache catalogue, a rare time skip of gathering (capped by the Storehouse, tuned through the economy-targets gate),
  and on bosses that boss's unique.
- **The open:** one tap, a burst of light in the rarity's colour, a short sting, the item's still. Skip opens all.
  Reduced motion shows the item with no burst.
- **The odds:** printed on the cache ("Look: 1 in 8. Rare look: 1 in 40.").
- **Pity:** a visible counter, "A rare look is certain within 6 more caches". Uniques get their own per-boss pity
  (already in the Why review's item 7).
- **No duplicates:** a cache only rolls looks you do not own, so there is no duplicate currency. Once a cache's
  looks are all owned, it pays extra Essence and says so.
- **Saved safely:** pity counters and cache state are new save keys with defaults in `fresh()`, merged into old saves.
- **The collection:** a Wardrobe with silhouettes of earned looks not yet found and where they come from (a hint, not
  a map), and a count ("Looks 14 of 60") that counts **earned looks only**. Store looks appear only in the shop, so
  the meter never becomes a reason to pay. It feeds the collection-counts card already in the backlog.
- **Store and caches never share looks,** so a buyer still has reasons to open caches and a free player is never
  short of the cache's best.

---

## 6. What would get us bad reviews

Each is a real case from the corpus or the web, and each maps to a rule.

| What | Real case | Rule |
|---|---|---|
| Forced ads | 454 negative reviews; AdVenture Capitalist 85 | no ads (3.6) |
| A purchase that beats what play can earn | IdleOn's stat bundles; Shop Titans' $15 blueprints that "surpass what is available for free" | 1 |
| Paid randomness, empty results, dupes needed | IdleOn's pet treats; AFK Arena's duplicates; RAID's shards | 2 |
| Odds that do not match the code | IdleOn's 1% coolers | 2, and odds shown come from the same table the code rolls |
| Locking what was free | Melvor's "Demo Mode" | 3 |
| Cosmetics with stats | Idle Berserker's costume upgrades; Hero Wars skins | 1 |
| Time-limited power or characters | AFK Arena's borrowed hero "gone for good"; IdleOn's 8-month chip rotation | 1, 3; looks may rotate but always come back |
| Offers in the way | IdleOn's half-screen offers | 5 |
| A pack every update, rising prices | IdleOn's $10 to $40 packs | 1; the shelf grows by looks only |
| A paid feature that should be basic | IdleOn's paid auto-loot | 6 |
| Purchases lost or stuck on one platform | IdleOn's iOS lag; "charged but no item" | 9, 10 |
| Energy and waits sold back | RAID energy (40 negatives) | 4 |

Outside the corpus, the same triggers show up at scale ([web-fairness.md](monetisation-records/web-fairness.md) section 5): power
sold through chance (Diablo Immortal, Metacritic user score 0.2; Star Wars Battlefront II, reversed hours before
launch), a new money layer on a game that was fair (Marvel Snap), a time saver that looks like it sold the grind back
(Assassin's Creed Odyssey's XP boost), and a forced account on a game people already owned (Helldivers 2, reversed in
days). The last one matters for us: purchases need a home, but **the game itself must never need an account**.

---

## 7. What the game needs before it can sell anything

In order. Nothing here starts a store; items 2, 3, 7 and 9 need Cal.

1. **A first hour that keeps people.** Why: nobody pays for a game they leave; the long-play quits are walls and
   empty loops, not prices. Cal's all-hands push is this. Measure: before any store, cold playtests (bots and real
   testers) should show players returning for a second session. Pick: no money work ships before the early-game
   milestone is called done.
2. **A home that can take money.** Why: the live game is a claude.ai artifact, a single HTML page with no network
   fetches; it cannot take a payment or check one. Options and pick in 7.1.
3. **Safe purchases, with no forced account.** Why: the save is `localStorage` only, which a cleared browser loses
   (Rule 10). Purchases must live with the platform (Steam DLC ownership, App Store receipts) or, on the web, an
   optional account, be restorable, and never sit only in the save. The game itself never needs an account
   (Helldivers 2). This touches the online layer and saves, so it needs an Opus save
   review and Cal's sign-off. The 1.0 list already wants save export and import.
4. **The Wardrobe.** A screen to see, try on and wear looks, with the collection count and silhouettes. Today looks
   live in the Deeds menu. This is also the earned half, so it can come first.
5. **A look pipeline.** About 30 store looks at launch and 10 to 15 a season after, all drawn by Codex as complete
   packs and vetted as whole sets (art freeze). Each new slot (the parry spark) needs an art and readability check.
6. **Heroes that can wear them.** Only 3 heroes carry the lamp today. Outfits by armour weight sell better once more
   heroes are in.
7. **Business and legal (Cal).** A business set-up, tax (a merchant of record handles VAT and sales tax), a privacy
   policy once there are accounts, terms and refunds, an age rating. No paid randomness keeps the rating and the law
   simple. Paid randomness is now regulated or banned in several markets (Belgium; Brazil
for games minors can reach, from March 2026, fines up to 10% of Brazilian revenue; Australia rates it M at least;
Apple and Google require odds before purchase; the US FTC fined Genshin's publisher $20M in January 2025 over hidden
odds). Earned-only chance with no real-money link falls outside every one of these that the research found. This is a
second reason for Rule 2, besides reviews.
8. **Trust.** The Lantern Rules on the store page; a changelog; a place to hear players (the open question about
   who the Netlify testers are). Contacting anyone outside the project waits for Cal.
9. **The online layer, if looks are shown to others.** Room presence carries `{hero, lvl, zone, act, raiding}`;
   adding a look changes its shape, which needs sign-off.

### 7.1 Where to sell

**Why.** The artifact cannot sell, so Lanternfall needs a second home. Fees and figures are from
[web-fairness.md](monetisation-records/web-fairness.md) section 3 (search summaries; verify before acting).

| Option | Cut | What it gives us | Against |
|---|---|---|---|
| A. Steam (the same HTML in a desktop wrapper) | 30% | Steam is the merchant (tax, refunds); DLC ownership holds purchases with no account system of ours; the idle audience is there (IdleOn, Melvor, NGU); reviews we can earn | Desktop, while the game is built mobile-first; $100 app fee |
| B. Our own site (Netlify) with Paddle or Stripe | Paddle about 5% + $0.50; Stripe 2.9% + $0.30 | Highest share; quick to try | We need accounts and a purchase record (a backend, and Netlify beyond the weekly deploy); Stripe leaves tax to us; $0.50 hurts £1 looks |
| C. iOS and Android (Capacitor wrapper) | 15% under the small-business programmes; US apps may link to web checkout | Where the game is designed to live | Store review (Apple rejects thin web wrappers), two more builds to keep in step (IdleOn's iOS lag cost it reviews) |
| D. CrazyGames (web portal, purchases through Xsolla) | reported about 30% | A browser audience with no install | Little control; untested for idle RPGs |
| E. itch.io or Ko-fi supporter pack | 0 to 10% plus card fees | Earliest, no code: a "thank you" pack for friends and testers | itch has no in-game purchase API; a pure tip, nothing to unlock |

**Pick: A first, then C.** Steam solves purchases, tax and refunds without us building accounts, and Rule 9 is easiest
with one paying platform at a time. The catch: the raid, Tavern and leaderboard run on the claude.ai page's online
layer (`80-online.js`), which a desktop wrapper does not have, so the first Steam build is single-player unless the
online layer gets a plan there (Cal's area). Phones follow once the Steam build is stable, using the 15% programmes;
they are where the game is designed to live, so they are the second step, not an afterthought. The free web build
stays as it is. Gate (judge): a landscape playtest with mouse and keyboard, timing parry and dodge, must pass before
the Steam build goes further. No itch or Ko-fi pack: it is outside contact with nothing to unlock. E is a reasonable early step only if Cal wants friends to be able to chip in before
a store exists; it needs no game code but is outside contact and money, so it is Cal's call.

---

## 8. Rough numbers (illustration, not a forecast)

**Why this section is short.** No public data splits indie idle RPG revenue into cosmetics, comfort and premium
price, and aggregator figures contradict each other. Commonly quoted, but unverified: 1 to 5% of free players ever
pay, and in gacha games about half of revenue comes from about 0.2% of players. A fair model gives up most of that
0.2% by design, and wins some back with supporter packs (3.7).

| Monthly players | Payers (3%) | Spend a payer a year | Gross a year | After a 30% store cut |
|---|---|---|---|---|
| 2,000 | 60 | £15 | £900 | £630 |
| 20,000 | 600 | £15 | £9,000 | £6,300 |
| 100,000 | 3,000 | £15 | £45,000 | £31,500 |

The lever is players, not price: the fair model earns through reviews and word of mouth that bring more players, not
through a few big spenders. A £50 supporter tier lifts the average without touching fairness; the table's £15 is
deliberately low. For scale, IdleOn's estimated $1M a month (unverified) came with its drift. Melvor (a one-time Full
Version and paid expansions) and NGU Idle show a fairer end of the same audience; Leaf Blower Revolution (94% positive)
shows that some paid comfort is tolerated, though it sells packs our rules would not.

---

## 9. Order of work

**Now, with the early game (no money involved):** louder drops and a unique announcement; earned Lantern Caches with
shown odds and pity; the Wardrobe with collection counts; earned looks as early rewards, starting with the 33 that exist (for example a
flame colour from the first boss), and new earned looks only from a vetted Codex art pack. These are fun on their own and build the shelves the store will later sit beside.

**Before a store (design cards, no code that takes money):** the Lantern Rules into `DECISIONS.md` (Cal can veto); the
platform choice (Cal); accounts and purchase safety (Opus high, saves and online layer, Cal); the store screen behind
a switch that is off (Sonnet medium); the parry spark slot (Sonnet medium, code only, with a readability check) and its first sparks as a Codex art pack.

**At launch:** the look store, the Lantern Keeper and the supporter packs.

**After 1.0:** the Road Pass with the Lantern Festival; Giving light; per-hero skins where play data shows demand.

---

## 10. Rulings (Opus judge, after a red team; Cal delegated)

| # | Decision | Ruling | Stays with Cal |
|---|---|---|---|
| 1 | Store looks next to earned looks | **Yes, narrowed.** No store look copies or recolours an earned look; the Wardrobe marks each look Earned or Store; the count counts earned looks only. Replaces "Every cosmetic is earned, never sold" | Nothing |
| 2 | The Lantern Keeper | **One purchase, no membership at launch.** The +2 h away head start ships only if a free bot reaches the 24 h cap within 40 hours of play | The price; any recurring billing |
| 3 | Premium currency (3.9) | **None.** Real prices; where a store charges a flat fee per sale, sell looks in sets | Live and regional prices |
| 4 | Ads | **None, including rewarded ads** | Nothing |
| 5 | Where to sell | **Steam first (single-player), then phones; no itch or Ko-fi pack.** A landscape mouse-and-keyboard playtest must pass first | Store accounts and fees, identity and tax, payment code, phone store timing |
| 6 | Supporter packs | **One tier at launch;** two more once 30+ store looks and the soundtrack exist | The price; the Tavern mark (online sign-off) |
| 7 | Business and legal set-up | **Asked of Cal once, when the early-game milestone is called done,** with a one-page checklist | All of it |

**Prediction.** At least 75% of Steam reviews that mention money are positive in the first 90 days after the store
opens, tagged the way this plan tagged IdleOn's (IdleOn: 53 of 86, about 62%). **Miss below 65%;** a miss reopens
rulings 2 and 6 first.

**Switching off.** All store code sits behind one store switch that ships off; the Keeper's away bonus has its own
setting, default 0 hours. After a sale, switching off only stops new sales (Rule 3); taking back anything bought means
refunds, which are Cal's. The earned side (caches, the Wardrobe, earned looks) needs no switch beyond the normal save
rules (new keys with defaults in `fresh()`).

---

## 11. Red team (what changed)

An Opus red team attacked the first draft against the research, `DECISIONS.md` and the code. Taken: the draft sold no
real time saver (now the Keeper's away head start, inside the shared ceiling); it had no top tier (supporter packs
added); it ruled out per-hero outfits on a rule that is not in `DECISIONS.md` (now starters first); a paid order queue
sold output, and paid Armoury room clashed with the Armoury building (both dropped); the second save slot was nearly
worthless and would fight over one raid entry (dropped); caches paid crafting materials against "enemies never drop
crafting materials" (now Essence and relics); the collection meter counted store looks (now earned only); Steam's build
has no online layer (now single-player first); four evidence lines were overstated (IdleOn's time candy quote, Overwatch
2's cause, the payer figures, Leaf Blower Revolution as the fair end), all corrected. Not taken: dropping Steam as the
first store; making the membership the default (kept as Cal's option).
