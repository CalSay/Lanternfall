# Tavern Blackjack: judge

- **Date:** 2026-10-10. **Judge:** Opus high.
- **Card:** `tavern-blackjack-spec` (gate: judge).
- **Ruled on:** `docs/design/tavern-blackjack.md` as revised after the red team (commit 33287a54), the red team's
  case (`red-team.md`), the probe (`bj-econ.mjs`), the mockup Cal saw (`/mnt/project-files/mini-game/wick.html`) and
  Cal's three messages of 10 Oct (18:44, 18:53, 19:00).
- **Checked against:** the integration code at 3937d6c5 (this branch's base), `CLAUDE.md`, `docs/DECISIONS.md` (Art,
  the Lantern Rules) and `docs/lessons.md` (Economy).

## 1. The spec as a whole

- **Ruling:** **Send back for five exact edits** (listed below). They are small and docs-only. Once the author
  makes them, the spec merges as the source for `tavern-blackjack-build`. It needs no new red team or judge round.
  The Foreman checks the five edits against this list.
- **Why:**
  - The three blockers are answered, and I checked the code myself:
    - Blocker 1: section 12 now measures numbers the table can move.
    - Blocker 2: no ledger booking. `tools/health.mjs:99` sums only `econ.earned` and `econ.spent`, and EC2 reads
      only fight, away and bounty (`tools/sim.mjs:1738`).
    - Blocker 3: the zone 14 gate sits in a quiet stretch. Raid is at 12, the Codex at 10, joins at 5, 10 and 15
      (`55-onboard.js:73-74`, `21k-story-hollow.js:186,192`).
  - Should-fix 4 to 13 and 15 hold up in the code:
    - `save()` is synchronous, with no throttle (`30-state.js:73`).
    - `econH` never falls, zones 1 to 400. I re-ran it: the probe prints no fall.
    - `registerSection('tav')` appends below the static online boxes (`shell.html:141-160`, `70-ui.js:922-932`).
    - `late` keeps "Show every tab" from opening the table (`55-onboard.js:324,343`).
    - The art pieces exist: `ICON.coin` (`10-art.js:28`), and `--panel`, `--panel-2` and `--gold`
      (`10-base.css:4,5,13`).
  - Should-fix 14 has a bug. "Keeps the **larger** of the stored and imported `net`" (section 8) does the opposite of
    what it means. After a day lost to the limit (net −2,550), importing a morning code (net 0) keeps 0, and the
    table opens again. That is exactly the reset the sentence says it stops.
  - The notice plan fails a check. `check.mjs:2608-2612` (unlock-voice) needs a Hesketh `SAY_TXT` line for every row
    that has an `OPEN_TXT` toast. Section 1's Never ("never ... the guide") forbids that line, so the build cannot
    pass `check.mjs` as written.
  - The probe re-run matches the spec within noise:
    - House edge: −0.94%, −5.54% and −8.13% (spec: −0.93%, −5.69%, −7.90%).
    - Limits at zone 14: 26, 510 and 2,550 gold.
    - Casual player: −0.216 H a day.
    - The 14-day econ report reproduces section 6 line for line (EC2 9,377 / 6,655 / 7,032; EC5 4% / 62% / 15%;
      zones 24, 28 and 33).
- **Veto phrase:** "Merge the blackjack spec as it is".
- **Risks:**
  - **A late Tavern stacks the opening.** A cold save that skips Next Up's Tavern step and builds the Tavern after
    zone 14 gets these together: the Tavern build, the Tavern unlock (`now`), Hands (90 s later) and the table
    (90 s after that). That is 4 in 10 minutes, at the F4 cap, and 5 if Hearth 2 is built close by. The walk bot
    follows Next Up, so it would never show this. Edit 4 closes it.
  - **The day's limits may annoy.** The keen player hits one on 96% of days (44% win, 52% loss). If testers call the
    closed table "rigged" or "annoying", the fun prediction shows it as a miss.
  - **Cal hasn't seen the changes.** Cal saw Crowns, Blades and the Squire, and a fixed 10 to 250 table. The renames
    and the scaling are sound reasons (name clashes, the price curve), but they come from us, not from Cal.

### The five edits (exact)

1. **Section 8, Save codes.** Replace "keeps the larger of the stored and imported `net` for today" with "keeps the
   **lower** of the stored and imported `net` for today (a `net` saved on another day counts as 0)". Also say that no
   import hook exists today (`75-savecode-ui.js` `doImport` writes the code's JSON and reloads). The build adds a
   small one there, which is a shared UI file.
2. **The unlock line (sections 1, 7, 11 and 16).**
   - In section 1's Never, change "the guide" to "a guide step".
   - Add one Hesketh `SAY_TXT` line: plain, no invitation, at most 90 characters. Proposed: "I've put a card table
     in the Tavern. Blackjack, for gold."
   - Add that line to the copy table in section 11.
   - List `SAY_TXT` (75-onboard-ui) among the extension points in section 16. It is needed because
     `check.mjs:2608-2612` asks for one Hesketh line for every row with an `OPEN_TXT` toast.
   - The toast itself goes to the bell list without counting (23n `unlock` rule, ch `log`), so the arrival stays
     quiet.
3. **Section 14, Rule 8 row.** Replace "Every bet and limit is shown in gold before you Deal" with "Every bet and the
   table's range are shown in gold before you Deal. The day's limits are not shown. They close the table with one
   plain line." As written, the row contradicts sections 1 and 11.
4. **Section 7, the gate and the proof.**
   - Add to `when`: the table also waits until the Tavern row and (if it is open) the Hands row unlocked at least
     600 s of `S.onboard.t` ago. The wait is skipped once `S.onboard.all` is set, because `S.onboard.t` stops then
     (`55-onboard.js:469-474`).
   - Add to the proof: a cold save that builds the Tavern after zone 14, with Hearth 2 built, opens the table at
     least 10 minutes of play after Hands.
5. **Section 12, Economy.** Add: "The table-on run must show every profile reaching the table (Tavern built, zone 14)
   and playing at least 100 hands over the 14 days. Otherwise the measure is void and the build card fails." Without
   it, a sim player who never builds the Tavern passes (a) to (d) by doing nothing.

**Nits (fix if convenient, not required):**

- Section 7 says the Codex comes with the zone 10 Champion clear. It opens on reaching zone 10 (`55-onboard.js:73`).
- The zone 14 boss drops the Serrated star for every hero (`24f-data-stars.js:52`), so "zone 14 has nothing else" is
  slightly off. It is a moment, not an unlock, so F4 doesn't count it.
- Section 12(a)'s "90th-percentile losing day at most 1.1 H" can't fail while the loss limit is 1 H. Keep it as a bug
  catch, or drop it.
- Name the four suit tokens for the build. Proposed: Lanterns `--ember`, Keys `--gold`, Cups `--r-rare`, Thorns
  `--xp`, all on `--panel`.

## 2. Art freeze: plain UI cards

- **Ruling:** **These are UI, not art drawn in code.** Allowed: a flat `--panel` card with a 1 px `--line` border, the
  rank as text, the suit's name in small capitals in a suit-colour token, a flat `--panel-2` face-down card, and the
  existing `ICON.coin` at its existing look. Everything pictorial waits for Codex (`codex-cards-tavern`):
  - suit icons, a card frame or card back pattern
  - the Knave, Queen and King faces
  - coin stacks or chips
  - felt texture
  - a Hesketh dealing sprite
  A plain slide or flip is fine (the game draws motion, DECISIONS Art, 10 Oct), and it respects reduced motion.
- **Why:**
  - It is text and CSS boxes, the same kind of thing as a button or a lettered tile. The lettered ability tiles are
    the standing no-art fallback (DECISIONS Art, `wire-ability-icons`: "the existing `noIcon` path").
  - The freeze bans drawn pictures: pixel maps, SVG, emoji (`CLAUDE.md`, Art freeze). Section 10 drops the mockup's
    SVG suits (`wick.html:183-186`) and its patterned back.
  - `ICON.coin` already stands for gold (Gold Rain, the Deeds). Here it means gold too, so it passes "fits the live
    meaning". Nothing about it is redrawn, retuned or converted.
- **Veto phrase:** "No cards until Codex draws them".
- **Risks:**
  - A build that sneaks in a glyph (♠, ♥, 🏮), an inline SVG or a CSS-drawn picture is breaking the freeze. A reviewer
    can grep the new blackjack JS and CSS for `<svg`, emoji code points or the four suit symbols. The build card
    should name this as an acceptance line.
  - If Cal picks a found deck, a licence check (commercial use, Steam) comes before any wiring.

## 3. Dealer

- **Ruling:** **Hesketh deals.**
- **Why:**
  - Cal saw Hesketh deal in the mockup (`wick.html:134`, "Hesketh deals at the corner table") and called it "pretty
    good" at 19:00.
  - The fixed tip ("Hesketh's rule of thumb: stand on 12 to 16...") is a mentor teaching a game. That fits the
    lamplighter of story bible 6.1.
  - The copy has no purse and no house. The lost gold goes nowhere: it is a sink, not his takings.
  - Tam already fronts Hands in the same view ("Hire gatherers", `74-ui-hands.js:116`; Tam's notice). Two jobs for
    Tam in one view would blur his role.
  - Vesper only arrives at the chapter's end (bible 6.4, Ch1 end). That is about zone 35, long after the zone 14
    table.
  - With edit 2, Hesketh's own voice brings the unlock line, so the dealer and the voice match.
- **Veto phrase:** "Let Tam deal the cards" (or "Let Vesper deal the cards", once she has arrived).
- **Risks:**
  - The story judge or Cal could feel that the grieving mentor taking the hero's gold undercuts his arc.
  - Watch the copy: any line that makes him gloat, keep a purse or say "the house" breaks this ruling. Changing the
    dealer is a copy and name swap only (sections 1, 3 and 11), with no code shape.

## 4. Gold or chips

- **Ruling:** **Plain gold is the default.** Bets, payouts and the coins read "gold" and use `ICON.coin`. There is no
  chip, token or second counter.
- **Why:**
  - Cal offered both at 19:00 ("some fantasy chips too, or we just use gold").
  - Gold adds no named counter: the currency ceiling and the counters-and-layers Kind rule (DECISIONS) stay as they
    are.
  - It needs no new art, so nothing waits on Codex.
  - It reads less like a casino, which helps the rating question Cal still owns (spec section 9).
  - The ledger-free design (section 8) stays simple: gold changes in `S.gold` only.
- **Veto phrase:** "Use fantasy chips at the table". Chips would then be a Codex-drawn picture of gold amounts at the
  table only, never a second currency. They join the `codex-cards-tavern` brief.
- **Risks:**
  - If testers or Cal say the table feels flat, plain gold may be part of the reason. The fun prediction (section 12)
    or Cal's first sitting would show it.

## What I verified

- **Re-ran the probe:** `node docs/design/tavern-blackjack/bj-econ.mjs 300000 5000`.
  - Edges: −0.94%, −5.54% and −8.13%.
  - Limits at zones 14, 25, 50 and 140: 510, 690, 1,800 and 35,000 gold.
  - The highest bet never falls.
  - Day results match the spec within noise.
- **Re-ran** `node tools/sim.mjs --report econ --days 14`. EC2, EC4 and EC5 and the day 14 zones match section 6
  exactly, and so does "3/8 pass".
- **`econH` never falls** for zones 1 to 400: checked through `loadCore`, the same for the highest bet after
  `econSig`.
- **55-onboard.js**:
  - the FEATURES table (`:60-85`) and the `late` semantics (`:324`, `:343`, `:466-471`)
  - the spacing governor (`ONBOARD_TUNE.gap` 90, `:59`, `:340`)
  - `S.onboard.t` stops once `all` is set (`:469-474`)
  - FIRST_USE needs one line per row (check.mjs `:2592-2596`)
- **75-onboard-ui.js:**
  - `OPEN_TXT` (`:45`)
  - `SAY_TXT`, with check.mjs asking for it on every toasted row (`:2608-2612`)
  - the toast's notice rule (23n `unlock`, ch `log`)
- **70-ui.js:** `registerSection` appends to `p-tav` (`:922-932`). The online boxes are static markup above it
  (`shell.html:141-160`). The other Tavern sections (Hands, perks, trade, verse) move themselves.
- **21w-data-econ.js:** `econH` (`:115`), `econSig` (`:117`), `ECON.hourFoes` 312 (`:21`).
- **health.mjs:** sums `econ.earned` and `econ.spent` (`:99`); the F4 burst counts only unlocks and camp builds
  (`:106-109`); the caps (`health-baseline.json:407-421`: at most 4 in 10 minutes, report only).
- **sim.mjs:** EC2 reads only fight, away and bounty (`:1738`); EC4 reads the spend categories (`:1764`).
- **10-art.js:28** `ICON.coin`. **10-base.css:4,5,13** `--panel`, `--panel-2`, `--gold`.
- **Zones 10 to 16:**
  - Codex on reaching 10, raid on reaching 12.
  - Starter joins at the zone 5, 10 and 15 Champions (`56c-unlocks.js:12-14`, `21k-story-hollow.js:235-261`).
  - The Serrated star from the zone 14 boss (`24f-data-stars.js:52`).
  - Aldric, visitors and Maren's quest from 16 (`56c-unlocks.js:22,27,40`).
  - No FEATURES row at 13 or 14.
- **Camp:** warm saves start with the Tavern built (`57-camp.js:123`); cold saves get the plot at zone 8
  (`55-hearth.js:62`).
- **Saves:** `save()` is synchronous (`30-state.js:73`); `deviceDay` (`00-util.js:96`); `registerState` fills
  defaults (`30-state.js:82`); save-code import has no hook (`75-savecode-ui.js:123-160`).
- **Free names:** the file names `57t-blackjack.js`, `75-blackjack-ui.js` and `60-blackjack.css` are free, and the
  core has `goldMult`, `campLv` and `deviceDay`.
- **The mockup:** Hesketh deals, − and + already lower the bet, a fixed 10 to 250 table, SVG suit icons.

## What I could not verify

- The rating sources in section 9 (askaboutgames.com, gamereactor.eu, newly.app). Not fetched. Cal decides the
  store-build switch either way.
- The walk proof for all three starter picks (`tools/walk.mjs`). It needs the build.
- Whether the sim's profiles build the Tavern on a cold Hearth by zone 14. Edit 5 makes the build card prove it.
- Cal's answer on the Codex-or-found-deck card (still open).

## DECISIONS.md line (combined, ready to paste)

- **Tavern Blackjack (judge 2026-10-10, Opus high; Cal can veto):** the spec goes to build after 5 named edits. Hesketh deals ("Let Tam deal the cards"); bets in plain gold ("Use fantasy chips at the table"); plain text cards are UI, all card art waits for Codex; opens at zone 14 with the Tavern; bets and day limits scale by price-hour.
