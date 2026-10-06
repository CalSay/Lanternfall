# Fair randomised rewards, regulation, platform economics: research for Lanternfall

Date of research: 2026-10-06. Method note: WebSearch only. WebFetch was blocked (egress proxy) for gov.uk, Wikipedia, macrumors, cravath, CrazyGames docs, and Reddit was skipped. Every claim below comes from search-result summaries of the cited pages, NOT from reading the primary documents. Items marked [UNVERIFIED] rest on a single low-quality or aggregator source. Fees and laws change; confirm against the primary source before shipping anything.

---

## 0. Bottom line for a solo-hero indie

1. Earned-only randomness (loot, boss drops, forge rolls from play) is the safe, loved part. It is outside every loot-box law found, because those laws all key on a real-money payment.
2. Paid randomness is the part that has a rising legal and reputational bill (Brazil ban for minors in force, Australia M rating, Belgium ban, EU Digital Fairness Act coming, store odds-disclosure rules). For an indie selling worldwide, the expected gain is small and the compliance surface is large. Recommendation: do not sell randomness.
3. Sell things that show the exact thing and price: cosmetics, characters (34 heroes: direct purchase or earn), time savers that are not power, and a supporter pack. This is the Warframe/PoE/Deep Rock/Rocket League-after-2019/Fortnite-shop pattern.
4. If any chance-based reward stays tied to spending in any way, publish exact odds, add a visible pity counter, make pity carry over, and block under-18s or exclude those regions. Better: do not tie it to spending at all.
5. A single HTML file cannot sell anything inside the Claude Artifact sandbox (no network). Selling needs a separate host: itch.io, own site with Stripe/Paddle checkout, Steam wrapper, or iOS/Android wrapper.

---

## 1. Fair randomised-reward design

### 1.1 Pity systems (what exists)

- Genshin Impact: base 5-star rate 0.6%, soft pity from about pull 74 (rate ramps each failed pull), hard pity at pull 90. 50/50 on the first 5-star being the featured character; losing guarantees the next one. Pity carries over between banners of the same type, across versions. Consolidated 5-star rate often quoted as 1.6%. Sources: [traveler.gg](https://traveler.gg/soft-pity-vs-hard-pity-in-genshin-impact-what-guaranteed-really-means/), [playaware](https://playaware.gg/guides/genshin-pity), [Genshin wiki Wish](https://genshin-impact.fandom.com/wiki/Wish).
- Genshin "Capturing Radiance": after a lost 50/50 the featured chance rises (reported 33% / 66% / 100% after 1 / 2 / 3 losses; [game8](https://game8.co/games/Genshin-Impact/archives/468191)) [UNVERIFIED numbers]. Studios keep softening the 50/50 because players hate losing it.
- Honkai: Star Rail: character banner hard pity 90, soft pity about 73; same 50/50; the guarantee flag is shared across character banners, so skipping a patch does not lose it. Light Cone banner 75/25 with hard pity 80; separate pity. Every 10 pulls guarantees at least a 4-star. Sources: [The Loadout](https://www.theloadout.com/honkai-star-rail/pity-system), [playaware HSR](https://playaware.gg/guides/hsr-pity).
- Granblue Fantasy "spark": every draw in a banner earns a spark point; 300 draws let you exchange for any featured item. Acts as a price ceiling players can plan around. Unspent sparks convert to a lesser currency at banner end, so they do not carry over. Source: [GBF wiki](https://gbf.wiki/Starting_Granblue_Fantasy) and [pitycalculator](https://pitycalculator.com/granblue-fantasy/pity-calculator).
- Duplicate protection: Path of Exile 2 mystery boxes have no duplicates, so each box opened raises the chance of the others ([keengamer](https://www.keengamer.com/articles/guides/path-of-exile-2-the-last-of-the-druids-mystery-box-guide-free-box-odds-and-rewards/)). Warframe relics are tradeable, so a duplicate is never dead.

### 1.2 What players praise and punish in gacha

Praised (from reviewer and player summaries; mostly forum-grade evidence):
- A pity counter you can see and that persists between banners. Hard and soft pity are "considered good ideas" and players praise transparency ([superjump](https://www.superjumpmagazine.com/gacha-games-a-discussion/), [massivelyop](https://massivelyop.com/2025/05/16/gachapwned-how-gacha-mechanics-use-pity-and-free-content-to-encourage-spending-money/)).
- A guaranteed way to pick the item (spark/exchange). Converts "luck" into "budget".

Punished:
- Odds buried in sub-menus; obfuscated value through currency bundles ([cbr](https://www.cbr.com/playing-gacha-games-downsides-harsh-realities/), [superjump](https://www.superjumpmagazine.com/gacha-games-a-discussion/)).
- Pity set so high that one guaranteed character costs a fortune.
- Losing a 50/50 after a long pity (the reason Capturing Radiance exists).
- Pity that does not carry across banners; expiring unspent currency.
- Regulators now treat concealed odds and cost obfuscation as unfair: US FTC vs Genshin/HoYoverse, $20M, January 2025: "unfairly marketed loot boxes to children that obscured real costs and misled all players about the odds"; terms include odds and virtual-currency exchange-rate disclosure and parental consent for under-16 purchases ([FTC press release](https://www.ftc.gov/news-events/news/press-releases/2025/01/genshin-impact-game-developer-will-be-banned-selling-lootboxes-teens-under-16-without-parental)).

### 1.3 Earned-only randomness and cosmetic-only monetisation

- Warframe: one premium currency (Platinum), tradeable between players, so everything is reachable free; random drops (Void Relics) are earned and tradeable, though randomised relic packs are sold too ([wiki](https://wiki.warframe.com/w/Platinum)).
- Path of Exile: sells cosmetics and storage; mystery boxes exist but publish exact per-item odds and are cosmetic ([PoE 2 mystery box](https://pathofexile2.com/mystery-box), [Engadget interview on ethics](https://www.engadget.com/2014-03-03-grinding-gears-wilson-talks-f2p-ethics-in-path-of-exile.html)). The long-running "ethical" reputation rests on "no gameplay gates, no pay-to-win" (source is a blog roundup, [UNVERIFIED]).
- Deep Rock Galactic: base price plus cosmetic DLC; the season/"Performance Pass" is free; unearned season items can be earned later, explicitly anti-FOMO ([PC Gamer](https://www.pcgamer.com/deep-rock-galactic-adds-robo-baddies-and-a-big-data-heist-as-it-launches-a-free-season-pass/), [TheGamer](https://www.thegamer.com/deep-rock-galactic-free-season-pass-rival-incursion-battle/), [macrotransactions.org](https://macrotransactions.org/deep-rock-galactic)).

### 1.4 Fortnite, Overwatch 2, Rocket League

- Fortnite: Battle Royale never had loot boxes. Save the World had blind "Llamas"; in 2019 Epic made them "X-Ray Llamas" showing contents before purchase, after a suit over undisclosed odds ([Variety](https://variety.com/2019/gaming/news/epic-games-rids-fortnite-of-blind-loot-boxes-1203118046)). Cosmetics sell in a visible rotating item shop. Epic also paid $245M for dark-pattern purchase flows ([FTC](https://www.ftc.gov/news-events/news/press-releases/2023/03/ftc-finalizes-order-requiring-fortnite-maker-epic-games-pay-245-million-tricking-users-making)). Twist: from Jan 2026 Epic lets island creators sell "paid random items" with odds disclosure, blocked in Australia, Netherlands, Belgium, Singapore, Qatar, 18+ only in UK and (from Mar 2026) Brazil ([Kotaku](https://kotaku.com/fortnite-loot-boxes-gambling-roblox-2000642980), [Epic docs](https://dev.epicgames.com/documentation/en-us/fortnite/in-island-transactions-restrictions-in-fortnite)). That is the platform route: geo-block paid randomness per country.
- Overwatch 2: swapped loot boxes for a battle pass and shop (Oct 2022). Many players missed boxes because free earning became grim ([PC Gamer](https://www.pcgamer.com/i-finished-the-overwatch-2-battle-pass-and-now-i-miss-the-loot-boxes/)). On Steam launch (Aug 2023) it went "Overwhelmingly Negative" (about 50k reviews) over F2P monetisation, balance and missing PvE ([GameSpot](https://www.gamespot.com/articles/overwatch-2-on-steam-has-overwhelmingly-negative-reviews/1100-6516805/)). Lesson: removing boxes earns goodwill only if the free player still gets a steady drip of rewards.
- Rocket League: crates removed 4 Dec 2019; replaced by Blueprints (shows the exact item, fixed price in credits) and an item shop ([Engadget](https://www.engadget.com/2019-12-05-rocket-league-removes-loot-boxes.html), [Nintendo Life](https://www.nintendolife.com/news/2019/12/psyonix_removes_loot_crates_from_rocket_league_but_not_everyone_is_happy)). Reception mixed: praised for transparency, criticised because some items cost more and it was harder to get many items for the same spend. Lesson: if you swap random for fixed price, price fairly.

---

## 2. Regulation and platform rules for paid random items

All entries are as summarised in secondary sources unless stated. Earned-only chance rewards are outside the core definitions below.

| Place | Status | Key point for us |
|---|---|---|
| Belgium | Gaming Commission, April 2018: paid loot boxes are illegal gambling (game + wager incl. purchased virtual currency + chance + randomness). Valve, Activision Blizzard, 2K complied; EA removed FIFA packs Jan 2019. Enforcement thin: study found 82% of top 100 iPhone grossers still sold them ([UC Press study](https://online.ucpress.edu/collabra/article/9/1/57641/195100/Breaking-Ban-Belgium-s-Ineffective-Gambling-Law), [NAG](https://www.nag.co.za/2018/04/26/belgium-gaming-commission-says-loot-boxes-in-three-games-violate-local-laws/)) | Geo-block paid chance items |
| Netherlands (and Austria, Dec 2025) | Council of State, 9 Mar 2022, overturned EA's fine: FIFA packs not a standalone game of chance because they sit inside a skill-based mode ([CMS](https://cms-lawnow.com/en/ealerts/2022/03/dutch-court-rules-fifa-loot-boxes-not-a-game-of-chance-revokes-ea-penalty)). Government now pushes an EU-level ban via the Digital Fairness Act ([Franssen Tolboom](https://www.franssentolboom.nl/en/loot-boxes-an-overview-of-recent-developments/)). Epic still blocks paid random items there. | Court win was narrow; do not rely on it |
| UK | Government U-turn, July 2023: no ban; industry-led. 11 principles via DCMS technical working group: tools to stop under-18s buying without a parent, default £0 spending on child accounts, clear odds, disclose loot boxes before purchase/download, lenient refunds for non-consented spend ([Ukie](https://ukie.org.uk/news/new-loot-box-principles-agreed-by-industry), [Lewis Silkin](https://www.lewissilkin.com/insights/2023/07/24/new-uk-principles-and-guidance-on-loot-boxes-published-102ik8a), [Game Developer](https://www.gamedeveloper.com/business/uk-games-industry-issues-new-loot-box-principles-to-help-companies-self-regulate)). 5Rights research reported "non-existent" enforcement ([5Rights](https://5rightsfoundation.com/research-reveals-non-existent-enforcement-of-industry-led-standards-on-loot-boxes/)). | Soft law; disclosure plus parental gating |
| EU level | CPC Network "Key Principles on In-game Virtual Currencies" (Mar 2025) plus action vs Star Stable: show real-money prices, no hiding cost behind currency, withdrawal rights, protect children ([Commission](https://ec.europa.eu/commission/presscorner/api/files/document/print/en/ip_25_831/IP_25_831_EN.pdf)). Digital Fairness Act: proposal expected late 2026; Parliament asks to ban loot boxes and pay-to-progress for minors; enforcement not before about 2028 ([Freshfields](https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/the-eus-proposed-digital-fairness-act-a-game-developers-guide-to-potential-imp-102ltio); provision list from blogs [UNVERIFIED]) | Premium currency is a risk too: show real prices |
| Australia | From 22 Sep 2024: games with in-game purchases linked to chance (paid loot boxes) get at least M (not recommended under 15; advisory, not a legal sale bar). Simulated gambling gets R18+ (legal restriction). Applies to games classified after that date. Chance systems with no real-money link (earned currency) are exempt ([Classification Board](https://www.classification.gov.au/about-us/media-and-news/news/new-classifications-for-gambling-content-video-games), [Game Developer](https://www.gamedeveloper.com/business/games-featuring-paid-loot-boxes-will-soon-receive-a-mandatory-m-rating-in-australia), [PC World](https://www.pcworld.com/article/2464538/all-games-with-loot-boxes-will-be-rated-m-or-higher-in-australia.html)) | Explicit carve-out for earned-only |
| Brazil | Lei 15.211/2025 (Digital ECA), in force 17 Mar 2026: paid "caixas de recompensa" (random items/advantages bought without knowing the content) prohibited in games directed at or likely accessed by under-18s. Free ones from progression are not covered. Fines up to 10% of Brazilian revenue or R$50M per infraction; stores enforce 18+ blocks ([Planalto text](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15211.htm), [Factotum](https://factotumcom.substack.com/p/brazil-digital-eca-bans-loot-boxes), [ASC Jogos](https://www.ascjogos.org.br/en/post/brazil-loot-box-ban-eca-digital-kids-games), [MediaLaws](https://www.medialaws.eu/the-eca-digital-a-game-changer-for-online-gaming-in-brazil/)) | Biggest recent change; "likely accessed by minors" covers a pixel RPG |
| China | Since 1 May 2017 odds disclosure mandatory (first country); 2019 spend limits by age; Dec 2023 NPPA draft would ban paid random draws for minors ([Game Developer](https://www.gamedeveloper.com/game-platforms/online-games-will-be-required-to-disclose-random-loot-box-odds-in-china), [Pillar Legal PDF](https://www.pillarlegalpc.com/wp-content/uploads/2024/07/Deep-Dive-into-Draft-Rules-that-Crashed-China-Game-Stocks-final%5ELJ-2024-1-9.pdf)). Publishing in China also needs a licence anyway. | Skip China |
| South Korea | Since 22 Mar 2024 odds must be shown on the purchase screen, website and ads, for foreign companies too; criminal fines and treble damages from Jan 2025 ([Game World Observer](https://gameworldobserver.com/2024/07/08/266-games-violated-loot-box-rules-south-korea), [Game Industry Act summaries](https://shattered.io/loot-box-odds-disclosure-laws-2026/) [UNVERIFIED detail]) | Needs a local representative for foreign firms ([Transatlantic Law](https://www.transatlanticlaw.com/content/korea-update-foreign-game-companies-to-be-mandated-to-designate-local-representative/)) |
| US federal | FTC acts under unfair/deceptive law: Genshin $20M (Jan 2025, above); Epic $245M for dark patterns (Dec 2022). Hawley's 2019 "Protecting Children from Abusive Games Act" never passed ([PC Gamer](https://www.pcgamer.com/us-senator-introducing-legislation-banning-loot-boxes-in-games-aimed-at-minors/)). No federal ban. State bills: I did not find a verified current list [UNVERIFIED; research gap]. Steam class action alleges Steam-traded loot boxes are gambling ([ClaimDepot](https://www.claimdepot.com/cases/valve-steam-class-action-alleges-loot-boxes-are-illegal-gambling)). | Deceptive odds and kids are the US risk |

### 2.1 Store and rating labels

- Apple App Store Review Guideline 3.1.1: apps offering loot boxes or other mechanisms providing randomised virtual items for purchase must disclose the odds of each item type before purchase (since Dec 2017) ([PC Gamer](https://www.pcgamer.com/apple-now-requires-app-store-games-to-disclose-loot-box-odds/), [Game Developer](https://www.gamedeveloper.com/business/guideline-changes-mean-app-store-devs-must-now-reveal-loot-crate-odds)).
- Google Play: must disclose odds in advance of, and close to, the purchase (from 1 Sep 2019) ([Game Developer](https://www.gamedeveloper.com/business/games-on-the-google-play-store-now-required-to-disclose-loot-box-odds)).
- Steam has no binding platform-wide odds rule, per a 2024 peer-reviewed study ([Taylor & Francis](https://www.tandfonline.com/doi/abs/10.1080/14459795.2024.2390827)). Steam in-game purchases must go through Steam Wallet/MicroTxn ([Steamworks docs](https://partner.steamgames.com/doc/features/microtransactions)).
- PEGI and ESRB label "In-Game Purchases (Includes Random Items)" for loot boxes, packs, prize wheels (Apr 2020) ([Reed Smith](https://www.reedsmith.com/en/perspectives/2020/04/esrb-and-pegi-introduce-loot-box-warnings)). Compliance is poor in practice ([PMC study](https://pmc.ncbi.nlm.nih.gov/articles/PMC10049760/)). Declaring paid random items in IARC would attach it to a mobile release.

### 2.2 What this means

- Paid randomness has to be gated per country (Belgium, Netherlands, Australia M, Brazil under-18, South Korea odds+local rep, China no), per platform (odds on Apple/Google, labels, age gating) and per age (UK parental controls, FTC under-16 consent). A solo dev has to build region detection, age assurance and odds UIs for revenue that a cosmetics shop would earn without any of it.
- Review risk is as large as legal risk: see section 5. The loudest Steam punishments went to power sold through chance.
- Verdict: not worth it. Keep randomness earned-only and label the earned rolls honestly. If the team still wants a "gacha feel", make the pull a free daily/earned currency with visible pity, and sell fixed-price items separately.

---

## 3. Platform economics

### 3.1 Fees

| Channel | Cut | Notes |
|---|---|---|
| Steam | 30% to $10M, 25% $10M-$50M, 20% above, per game, marginal; $100 per-app fee recoverable after sales threshold ([presskit.gg](https://presskit.gg/field-guides/how-much-does-steam-take), [Immutable](https://www.immutable.com/guides/how-much-does-steam-take)). In-game purchases must use Steam Wallet, same cut. | Fee thresholds consistent across sources; the $100 recoup rule is described loosely, check Valve docs |
| Apple App Store | 30% standard; 15% under the Small Business Program (under $1M proceeds prior year, enroll yourself) ([Apple newsroom](https://www.apple.com/newsroom/2020/11/apple-announces-app-store-small-business-program/), [Adapty](https://adapty.io/blog/app-store-small-business-program/)) | $99/year developer fee (not searched, widely known) |
| US iOS link-out | Since 30 Apr 2025 (Judge Gonzalez Rogers, contempt finding) US-storefront apps can link to web checkout with no Apple commission ([MacRumors](https://www.macrumors.com/2025/04/30/apple-app-store-anti-steering-injunction-violation/)). Ninth Circuit, 11 Dec 2025: contempt upheld, but Apple may charge a commission "based on costs genuinely and reasonably necessary" for link coordination; rate remanded ([Justia](https://law.justia.com/cases/federal/appellate-courts/ca9/25-2935/25-2935-2025-12-11.html)). Supreme Court took Apple's petition 30 Jun 2026 on the contempt question only ([MacObserver](https://www.macobserver.com/news/supreme-court-apple-epic-appeal-question-1-narrow/)). | Zero-commission link-out is real now, legally unsettled, US only |
| Apple EU (DMA) | New unified terms from 1 Oct 2026: 26% with Apple IAP (15% small business), 20% with alternative payments, 15% when linking out (10% eligible), plus 5% Core Technology Commission for alt marketplaces/web distribution; Core Technology Fee dropped ([Phiture](https://phiture.com/blog/apple-new-app-store-terms-2026/), [mobilemarketingreads](https://www.mobilemarketingreads.com/apple-replaces-eu-core-technology-fee-with-5-commission-as-new-app-store-terms-take-effect-october-1/)). Secondary sources only [UNVERIFIED figures]. | Small business 15% still best for a tiny seller |
| Google Play | From 30 Jun 2026 in US, UK, EEA: service fee split from billing fee; reported 10% service on first $1M (then 20-25%), plus 5% if using Google Play Billing; alternative billing and external links allowed; after Epic v Google (Ninth Circuit upheld, Jul 2025) ([MacRumors](https://www.macrumors.com/2026/06/24/google-play-store-fee-change/), [Strataigize](https://www.strataigize.com/insights/google-play-external-payments-fee-changes-2026/), [Neon](https://www.neonpay.com/blog/google-plays-new-u.s.-billing-linking-policies-what-game-developers-need-to-know)) [UNVERIFIED: sources conflict on exact numbers] | Previous 15% on first $1M applied before; check Play Console |
| Stripe | 2.9% + $0.30 (US cards) ([outseta](https://www.outseta.com/posts/startup-payment-processing)); you handle VAT/sales tax | Cheapest, most work |
| Paddle | Merchant of record, about 5% + $0.50 all-in ([Paddle](https://www.paddle.com/compare/stripe)) | Handles global tax; $0.50 hurts small items |
| Xsolla | MoR for games, web shops, about 5% ([MoR Finder](https://www.merchantofrecordfinder.com/providers/xsolla)) | Also powers CrazyGames in-game purchases |
| itch.io | Open revenue share, default 10%, you can set 0-100%; plus processor fees (about 2.9% + $0.30) ([Game Developer](https://www.gamedeveloper.com/business/itch-io-launches-open-revenue-sharing), [itch docs](https://itch.io/docs/creators/payments)) | |
| Ko-fi / Patreon | Ko-fi 0% on tips and shop (5% on memberships), Patreon 10%; processor fees extra ([cartmango](https://cartmango.com/ko-fi-fees/), [talks.co](https://talks.co/p/ko-fi-vs-patreon/)) | |

### 3.2 Can a single-HTML web game sell anything?

- Inside the Claude Artifact sandbox: no. CLAUDE.md says no network and no external assets, so no checkout, no payment SDK, no receipt check. A link out to a Ko-fi/itch page is a plain `<a>` link only if the sandbox allows navigation (unverified, test).
- itch.io: HTML5 games take payments only as donations unless set as "Downloadable" (paywalled access); no native in-app purchase API; no rule against doing it yourself, but iframes make third-party calls awkward ([itch HTML5 docs](https://itch.io/docs/creators/html5), [itch forum](https://itch.io/t/373880/does-itchio-support-in-game-purchase)). Fits a "buy the full game / supporter pack" model, not IAP.
- Poki: no in-game purchases allowed; ads only through Poki SDK; 50/50 revenue split, 100% for traffic you bring yourself ([Poki requirements](https://sdk.poki.com/new-requirements), [Cinevva guide](https://app.cinevva.com/guides/publish-game-poki)).
- CrazyGames: allows optional in-game purchases via Xsolla; reported developer share 60% ads, 70% IAP in one 2026 jam's terms [UNVERIFIED]; no exclusivity required ([Cinevva](https://app.cinevva.com/guides/web-game-monetization)).
- Own site + Stripe or Paddle: works for cosmetics, hero unlocks and a supporter pack (account/receipt needs a backend or the Artifact `db` online layer, which is out of scope for the single-player focus).
- Steam / iOS / Android: need a wrapper (Electron/Tauri, Capacitor). Apple Guideline 4.2 rejects thin web wrappers; it wants app-like behaviour and offline function, and reviewers test in Airplane Mode ([Capawesome](https://capawesome.io/blog/11-steps-to-get-your-web-app-on-the-app-store/), [Apple guidelines](https://developer.apple.com/app-store/review/guidelines/)). Lanternfall is local-first with a save in localStorage, which helps.
- Practical order: (1) Ko-fi/itch supporter pack and itch paid "Deluxe" with cosmetic heroes now; (2) own site checkout via Paddle or Stripe once cosmetics exist; (3) Steam release with the 34 heroes as free/earned plus cosmetic DLC; (4) mobile with Small Business 15% and, in the US, a link to the web store.

---

## 4. Battle pass, season pass and membership in solo or mostly solo games

What players accept:
- Passes that never expire: Halo Infinite's premium pass never expires, but weeks of backlash over slow XP forced 343 to speed progression ([GamesRadar](https://www.gamesradar.com/halo-infinite-battle-pass-progression-controversy/), [TechRadar](https://www.techradar.com/news/halo-infinites-controversial-battle-pass-progression-just-got-a-whole-lot-better)). A never-expire pass still fails if progress feels slow.
- Free seasons where anything missed can be earned later (Deep Rock Galactic; see 1.3).
- Subscription tied to the game's identity: Old School RuneScape membership (about £7.99-£10.99/month as of Mar 2026) plus Bonds (buy with money, trade for gold or membership time) is widely seen as fair because no power is sold directly ([Udonis](https://www.blog.udonis.co/mobile-marketing/mobile-games/old-school-runescape), [OSRS wiki](https://oldschool.runescape.wiki/w/Update:Membership_&_Bonds_Price_Change)). Steam users still complain about price ([thread](https://steamcommunity.com/app/1343370/discussions/0/592890632801890720/)).

What draws punishment:
- FOMO: time-limited passes and cosmetics that vanish; weekly play-or-lose rewards, especially in single-player games ([VideoGamer on Marvel Rivals](https://www.videogamer.com/features/marvel-rivals-battle-pass-still-gives-players-massive-fomo-and-it-should-be-fixed/), [Steam threads](https://steamcommunity.com/app/3159330/discussions/0/591769050084864658)). Evidence is forum-level.
- Paid power or paid time savers that the game's grind seems designed to sell: Assassin's Creed Odyssey's permanent +50% XP boost drew "creates the problem to sell the fix" criticism, while others called it optional ([Destructoid on Valhalla](https://www.destructoid.com/ubisoft-cant-help-itself-adds-an-xp-boosting-microtransaction-to-assassins-creed-valhalla/), [Prima Games](https://primagames.com/featured/assassins-creed-odyssey-microtransactions)).
- Free tracks full of filler (Overwatch 2).

Design takeaway for Lanternfall: a "Lantern Pass" should (a) never expire; (b) have a free track that gives real gear-neutral rewards; (c) be completable at a relaxed pace; (d) sell only cosmetics, hero skins, and camp-time convenience capped to what a free player could get with a bit more time; (e) not hide a time-saver's value by deliberately slowing the base game (keep idle gather rates as tuned for the free path).

---

## 5. Review-bomb and backlash case studies (monetisation)

- Diablo Immortal (June 2022): Metacritic PC user score 0.2, lowest ever; legendary gems via crest/rift loot-box chance; estimated about $110,000 to max a character with money, about 10 years for free players. It still earned hundreds of millions ([CGMagazine](https://www.cgmagonline.com/news/diablo-immortal-gets-review-bombed/), [PC Gamer](https://www.pcgamer.com/diablo-immortal-microtransactions-have-sparked-a-brutal-backlash/), [VGC](https://www.videogameschronicle.com/news/diablo-immortal-now-has-blizzards-lowest-ever-user-score-on-metacritic/)). Lesson: review score and revenue can diverge, but the brand damage is real. The $110K figure is from press estimates.
- Star Wars Battlefront II (Nov 2017): hero and Star Card progression tied to paid loot boxes; the "pride and accomplishment" EA comment became Reddit's most downvoted; EA pulled microtransactions hours before launch and later made progression earned-only; the case triggered Belgian action and Apple's odds rule ([Forbes](https://www.forbes.com/sites/insertcoin/2017/11/16/ea-has-removed-star-wars-battlefront-2s-microstransactions-hours-before-launch/), [GameSpot](https://www.gamespot.com/articles/star-wars-battlefront-2s-loot-box-controversy-expl/1100-6455155/)).
- Helldivers 2 (May 2024): not monetisation but an anti-consumer account demand. Sony required PSN linking for Steam players; review bomb, Sony delisted it in 177 countries, then reversed within days ([Game Informer](https://gameinformer.com/news/2024/05/06/playstation-walks-back-helldivers-2-changes-psn-account-linking-no-longer-required), [PCGamesN](https://www.pcgamesn.com/helldivers-2/review-bombing)). Lesson: do not force accounts onto a single-player game; Lanternfall's local save is an asset.
- Overwatch 2 on Steam (Aug 2023): "Overwhelmingly Negative"; F2P monetisation, battle pass grind and missing PvE; see 1.4.
- Marvel Snap (2024-25): Steam reviews turned negative as monetisation shifted from cosmetic-only toward gacha-style character spending ([Android Police](https://www.androidpolice.com/marvel-snap-why-im-quitting/)) [UNVERIFIED which event]. Separately, US takedown Jan 2025 as TikTok-ban collateral (publisher Nuverse is ByteDance).
- Hearthstone: no clean sourced review-bomb event found; only forum complaints about about-$20 Battlegrounds cosmetic packs [UNVERIFIED].
- Assassin's Creed Odyssey: time-saver backlash (section 4).

Patterns: bombs fire when (1) power or progression is sold through chance, (2) the price of "fully built" is absurd and visible, (3) a new monetisation layer lands on something previously fair, (4) the pitch contradicts players' sense of effort, (5) a forced account or connectivity change touches the base game.

---

## 6. Suggested design rules for Lanternfall (derived, not sourced)

1. Randomness stays earned. Boss loot, forge rolls and camp finds come from play. Show drop rates and a pity counter on each boss ("Next guaranteed unique in N kills") that persists in the save and carries across bosses of the same tier. This delivers the gacha feel with no regulatory exposure (Australia and Brazil text both exempt non-paid chance).
2. Never mix currencies: premium currency to roll earned-style loot is the exact thing Belgium and the EU CPC principles target. Sell items directly at real-money prices.
3. Monetise: cosmetic hero skins, new heroes from the 34-hero roster as direct purchase or play-unlock, camp aesthetics, supporter pack, optional never-expiring pass, and capped time savers (idle catch-up that equals what free play yields in one extra day).
4. No fake urgency: no expiring shop timers; leave "retired" cosmetics purchasable or earnable later (DRG model).
5. Ship order for money: itch.io/Ko-fi supporter -> own-site web shop (Paddle/Stripe) -> Steam -> iOS/Android with Small Business 15% and a US web-checkout link.
6. Store labels: declare no paid random items in IARC/ESRB/PEGI questionnaires; that keeps a clean rating and avoids Australia's M and Brazil's rule.

---

## 7. Gaps and caveats

- No primary documents read (fetch blocked); all legal/fee numbers are from search summaries. Re-verify before acting, especially Google Play 2026 fees, Apple EU 1 Oct 2026 terms, Supreme Court/remand status, and Brazil's definition of loot box.
- US state loot box bills: not found in a verifiable form.
- Hearthstone and Marvel Snap review-bomb specifics are weak.
- Poki/CrazyGames terms change often.
- Counsel review is advised before selling in Brazil, EU, South Korea or Australia.
