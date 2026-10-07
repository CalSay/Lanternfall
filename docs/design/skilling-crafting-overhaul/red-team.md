# Red team: skilling and crafting overhaul (2026-10-07)

Target: `docs/design/skilling-crafting-overhaul.md` (draft 4ea4a729). Read against the code map, Cal's answers file,
DECISIONS, the compass, the difficulty budget, hero-progression-build and first-hour.

**Method.** Sim rows are `node tools/budget.mjs` on this branch (240 fights a row) with `--eval` models of the spec:
grade base = `RAR.<r>.m = 1.35`; profile = `attrRel(channel) x (1 + scaling x share)` and `TURN_TUNE.heroHaste x
0.9/1/1.1`; tonic = `addModifier('dmg')`. Models, not the build: they show direction and rough size. Cells are casual
win %, Wren/Tobin/Pip. Ranked most severe first: 4 blockers, 11 majors, 10 minors.

---

## Blockers

### B1. The flat 1.35 base is not power-neutral. It breaks the budget both ways.
**Claim:** "Every graded piece has one base multiplier, 1.35 ... That keeps today's boss bands roughly where they are."
**Failure:** The budget measures two footings: first-hour rows (common +0, mult 1.0) and kept-up rows (rare +5, mult 1.8;
`tools/budget.mjs:176`). 1.35 is 35% above the first and 25% below the second.

| Row (band) | Today | All gear at 1.35 |
|---|---|---|
| z10 Champion (40-60) | 56/48/49 | **72/69/67** |
| z15 Champion (40-60) | 46/50/48 | **77/51/74** |
| z8 Captain (70-90) | 74/88/96 | 98/93/100 |
| z16 Captain (60-80) | 85/73/58 | **50/37/24** |
| z20 Captain (60-80) | 65/79/79 | **19/36/19** |
| z30 Captain (60-80) | 69/69/71 | **33/35/22** |
| z36 boss (late fixture epic +10 at 1.35) | 87/70/99 | **6/5/15** |
| z38 boss | 84/77/100 | **5/3/17** |

The mean-roll argument (1.30 at Smithing 10) ignores that a player wears their best roll, and that every gate row since
boss-tiers-pr5 is calibrated on rare and epic gear. Old items outclass new ones: an old T3 Epic (2.5 x 42 = 105) beats a
new T4 at any grade (101), an old T4 Epic (187) a new T5 (175), and `forgeNext` ("worn tier + 1") points live saves at
the downgrade. Uniques (`UNIQ_TUNE.pow` 1.8) become 33% stronger than any craft, against DECISIONS' "as strong as a
crafted Rare". And the section 2 decision "Copper at grade B, or Iron at grade D" is fake: with one base the next tier
always has about 2x the power.

**Fix:** Grade sets the multiplier: D 1.0, C 1.35, B 1.55, A 1.8, S 2.5. That reuses today's rarity values, so the budget
fixture maps onto grades (rare +5 becomes A +5). It also makes S at tier t against D at tier t+1 a real choice, and keeps
old Epics in line with S. Re-run the full budget before card 3 merges, with the fixture rewritten to grades (see M2).

### B2. The slower station curve puts every tier gate hours behind the road.
**Claim:** Tier 3 at Smithing 22 in 3 to 5 h, tier 4 at 36 in 12 to 18 h.
**Failure:** Gear tiers follow `PACE.essTier = [1, 7, 13, 19, 42]`, and the budget's kept-up hero wears the zone's tier.
A good player reaches zone 20 in about 6 h (`pacing-turn-era.md:11`). Under the new curve, Smithing 36 comes 6 to 12 h
after zone 19 opens tier 4. Woodcraft and Tailoring are the same: catch-up only pulls them up to Smithing.

So from zone 19 to about zone 30, every player is a tier behind. That is the budget's `behind` row: z20 boss casual
**4/11/4** (`z20-boss-behind`), which is a wall by the budget's own rule (under 5%). Tier 3 lands 1 to 3 h after zone 13.

**Fix:** Pin the gates to the road, not the curve. Each tier's gate level must be reachable by about the hour its zone
tier opens; check with `sim.mjs --report skills`. Slow down only the levels between gates, where grades now live.
Alternatively, keep today's curve to 36 and slow it after that.

### B3. The profiles make Might worse and Focus dominant. The Might prediction fails.
**Claims:** "Heavy Might wins at least one arm per starter"; "No build or profile best everywhere: still holds."
**Failure:** Grade S scaling (0.55 x share; share uses `attrEff`, so all-in is 0.75):

| Build, profile | z20 boss | z30 boss | z12 kept-up |
|---|---|---|---|
| even, none (today) | 65/79/79 | 69/69/71 | 86/95/100 |
| even, Heavy S | 62/78/80 | 65/69/67 | 74/95/100 |
| even, Balanced S | 70/85/88 | 71/73/75 | 85/95/100 |
| even, Swift S | **48**/82/73 | 63/71/69 | **98**/99/100 |
| all Might, Heavy S | 36/57/65 | **45/43/29** | 60/96/97 |
| all Focus, Balanced S | **78/88/95** | **78/91/82** | **96/97/100** |

- **Heavy is a trap.** Attack is a small share of turn damage (hero-progression-build section 2: "abilities carry most of
  a turn fight's damage"). The -10% Speed costs more than +41% Attack gives. All-Might Heavy S is the worst arm at z30
  for every starter.
- **Balanced plus Focus wins everything.** Focus is already the farm build. With Balanced S it also tops the boss arms at
  z20 and z30 for all three, +13 to +22 against even. That beats the `build` row's ±15 report band and hits the
  dominant-choice anti-goal.
- **Swift's ±10% Speed is not a smooth knob.** Speed alone moves z20 Wren from 65 to 46 (1.05) and z12 Wren from 86 to
  98 (1.1). The turn scheduler (`turnPick`, `59k-turn.js:402`) has step effects. Any Speed profile moves bands by more
  than the spec's "within 5 points".
- The scaling stacks on attrRel. That is fine for Might, which needs it, and bad for Focus, which does not.

**Fix:** No Speed change on profiles. Scale Heavy on Attack *and* counters, so Might gets the parry build's damage too.
Give Balanced a smaller coefficient than Heavy (Focus already leads). Run `arms.mjs` with profiles before card 3's
judge, and gate on "Might in a winning arm" and "Focus/Balanced not best on both foe types".

### B4. A graded item with no rarity crashes the game and fails save codes.
**Claim:** "New crafts have no rarity" (section 5). Section 12 adds only `g` and `pf`.
**Failure:** Without `r`, these throw or refuse:
- `itemPower` reads `RAR[it.r].m` (`40-rules.js:7`).
- The away report reads `RAR[it.r].n` (`75-away.js:136`).
- Save codes run `known(RAR, it.r, 'item.r')` (`55-savecode.js:154`), so any code with a graded item is refused.
- The Deeds read `it.r` (`58-deeds.js:127, 486`).
- `75-craft-ui.js` reads it in 18 places.

A rollback of card 3 would also brick these items.
**Fix:** Graded items keep `r` as the grade's rarity twin (with B1's fix: D common, C uncommon, A rare, S epic, and B
uncommon plus a flag). Old code then reads the same power, save codes pass, and a rollback is safe. `g` drives lines and
scaling only.

---

## Majors

### M1. The 20-unit queue empties in minutes, so away refining is nearly nothing.
**Claim:** The queue "holds 20 units at station level 1 ... runs ... while you are away ... (4 to 24 h)".
**Failure:** A full queue lasts 5 min at tier 1, 8 min at tier 2 and 13 min at tier 3. Station level 5 (100 units) costs
3,400 + 8,700 + 18,000 + 47,000 gold and 6 h to 30 h of build timers, so nobody has it in the first hour.

A 4 h absence refines 2 to 6% of the time; the spec's own away line ("smelted 24 Iron Ingots") exceeds a level-1 queue.
Either the queue idles or the player taps Refill all every 5 to 13 minutes, the "input every few minutes" the research
ranks second. The cap is also a third stop rule against Cal's "stops when input or room runs out", and it undoes the
reason for deferring "a Hand can staff a queue" ("refining runs on its own already"). Scale (section 4's halving rule,
summed to +10): Tobin's set needs 393 ingots through one Forge, at tier 3 4.4 h and 1,179 coal, or 20 refills.

**Fix:** The queue runs until input or room runs out. Station level buys speed (for example +10% a level), not length.

### M2. The four prediction rows cannot see this change, and no card owns the tools that would.
- **Boss bands "within 5 points".** `budget.mjs` builds `newItem(kind, t, 'rare')` (line 176) with no `g` or `pf`: it
  measures nothing of cards 2 and 3, while B1 and B3 show 20 to 80 point moves.
- **Might arm.** `hero-progression-build/arms.mjs` has no profiles.
- **Walk, 6 actions, first refine by minute 25.** The bot presses only Next Up, which has no upgrade goal (code map 9);
  `GO_WORDS` (`walk.mjs:276`) lack smelt, saw, weave, tan, refill; W4: the bot wears nothing until `walk-bot-gear`.
- **Unspent gold.** The `health.mjs` personas never smelt.

**Fix:** A tools card before cards 2 and 3 merge: budget fixture on grades and profiles (plus a Strike rate per
persona), profiles in `arms.mjs`, refine and upgrade logic in the sim personas, an upgrade goal and the bot's words.

### M3. The Vigor Tonic is an untested power lever, and card 4 has no budget gate.
**Claim:** Tonics are "small and steady; a choice before a boss."
**Failure:** +15% damage (tier 1; tier 3 brews +20%):

| Row | z10 Champion | z15 Champion | z20 | z25 | z30 |
|---|---|---|---|---|---|
| Casual win | 56/48/49 → **76/70/71** | 46/50/48 → 67/53/66 | 65/79/79 → 76/91/95 | 80/83/71 → 92/93/88 | 69/69/71 → 83/85/87 |

The zone 10 Champion leaves its 40-60 band. A cheap buy worth 11 to 22 points is always the right buy (the anti-goal
the spec quotes), and gold buying +15% damage is closer to "stats" than to a bag potion that costs a turn.
**Fix:** Card 4 runs `budget.mjs` with the tonic on. Cap strength so bosses stay in band (for example +5%), or point the
tonic at non-damage (gathering, healing) and leave damage to the bag slot when it returns.

### M4. Coal and ingots serve only Tobin. Two of three starters never touch them.
**Claim:** "Mining, chopping and coal finally have a steady customer"; beat row "Iron Warbow ... 6 Iron Ingots".
**Failure:** The main family is `pre` (`21-data-craft.js:207-224`). No Ranger or Mage piece has `pre: 'ore'`:
- Wren: bow (wood), quiver, hood and leathers (hide).
- Pip: staff (wood), lantern and circlet (crystal, stays raw), robe (fibre).

A Warbow takes Birch Planks, not ingots. For Wren and Pip, ore still feeds only tools, which stay raw. Pip's two crystal
pieces never refine at all. Cal's answer 5 asked that "no class's crafting is shallower than another's". Tobin carries
all four pieces through one Forge queue, against two queues for Wren and Pip (M1 numbers).
**Fix:** Rewrite the beat map per starter. Either accept the asymmetry openly, or give each class one ingot piece
(for example the off-hand's second material). Check queue load per class.

### M5. Leather's same-tier log adds a Woodcutting 64 gate to Wren's tier 4 armour.
**Claim:** "Leather: 2 hide + 1 log of the same tier."
**Failure:** Tier 4 hide has no node, so it comes only from Transmute (4:1, Enchanting 36). Tier 4 logs need Woodcutting 64,
about 1.8M XP. A T4 Hood (hide 4, scaled 10, so 5 leather) costs 40 T3 hide, 5 Mangrove logs and the Enchanting gate.
Today's T4 Hood and Leathers need no wood at all. Tier 4 gear opens at zone 19, Woodcutting 64 is about 60 h of
gathering, and the spec's own "tier 5 mismatch" note misses this tier 4 one.
**Fix:** Tan with "1 log of any tier" (bark is bark). Name the hide T4-T5 gap in the spec. Cal's why review lists "fill
the grade 4 and 5 hide gap" as part of the refining item.

### M6. Save shape: six gaps.
1. **Coal as "one pile"** fails save codes (every family must be a 5-array, `55-savecode.js:149`), crashes
   `offline-parity.mjs:21` (`.fill` on each family) and reads 0 in `matOwn`. Use a 5-array (index 0) or Essence-style.
2. **Middles have no Storehouse group** (`55-store.js:50`), so they are uncapped and "stops when full" never fires.
3. **The Retune counter has no field**, and the obvious `rt` already means "retooled-from kind" (`41-items.js`).
4. **The XP-bar carry-over needs a version flag** (like `S.attr.xpv`), or it re-maps every load or never.
5. **Cap 75 against live saves** (no cap today, `50-sim.js:151`): a save above 75 keeps an impossible level or loses
   levels. The station Deeds ask for 150 (`23-data-deeds.js:116-119`), and "Fine Work" needs Uncommon/Rare/Epic crafts
   (`58-deeds.js:127`) that new crafts never have. Map grades to Deed steps; rescale the 150 tier.
6. **Away refining has no parity acceptance.** Add a refine fixture to `offline-parity.mjs`.

### M7. The ceiling check miscounts piles, camp taps and craft taps.
- **Piles.** The ceiling is "Piles on screen: 12, through a grade window (current and next grade)"
  (`why-review-2026-10-06.md:230`). That counts cells. The spec counts rows: 11 rows x 2 tiers is about 22 cells (6 raw
  x 2, plus Essence, plus coal, plus 4 middles x 2). The prediction row quietly changes "31 cells" into "12 rows".
  Admit the breach or fold the middles into their raw family's row.
- **Camp taps.** Refill all is a tap added to today's tour of Hands shifts and builds. The compass anti-goal is "a tap
  added to the camp tour". The "3 to 5, then 2 to 3" prediction assumes the rest of the tour disappears.
- **Craft taps.** The ceiling is "a routine craft: 3 taps, under 15 seconds". Recipe, profile, Craft, Strike or Skip,
  then Equip is 5.

### M8. Minutes 20 to 60 get two new things in one beat, and a crowded 10 minutes.
**Failure:** Row 19 (first weapon, about 22 min) adds the profile pick and the Strike together, against "at most one new
thing per beat". Saw, coal, Smelt, grade milestones, Refill all, Brew and Retune then land beside the Star (20:00),
unique (25-40), Bestiary (28:00), Almanac (31:30), Tavern (35:00), looks (45:00) and Codex (51:30). Minutes 28 to 38
likely hold 5 or more against F4's "4 in any 10", and player acts skip the 90 s governor.
**Fix:** The first weapon is Balanced with no Strike. The profile opens at the second weapon, and the Strike at the first
armour piece. Place Brew and Retune on the map, after minute 60.

### M9. New art is needed and not planned.
Resource icons are approved C26 PNGs (`21r-data-resicons.js`, generated, "Do not edit"). Coal and the four middles need
21 icons. The fallback in `matIcon` (`60-gfx.js:35`) is a code-tinted orb, and M1 rules "No agent recolours or tints
art in code". The Coal Seam needs node art in the Gather scene, which is a Codex pack. **Fix:** Add a Codex art card,
due before card 2's merge, or drop 13 Nov.

### M10. The cards are not sized, not written, and collide with running work.
- **Card 2** is four systems (node, three live and away queues, recipe and upgrade conversion, a Storehouse window that
  does not exist yet: `75-store-ui.js:79` draws all 5 tiers). It needs files it does not own: `55-gathering.js`,
  `72-ui-gather.js`, `57f-hands.js`, `57-camp.js`, `75-camp-ui.js`, `21r`. Split it: 2a coal, middles, save, store;
  2b queues, away, Refill all.
- **Card 3** needs `41-items.js` (`newItem`, `kindName` nouns), owned by card 2. **Card 4** needs `brewTonic`
  (`55-crafting.js`, card 3) and fight HUD files, yet "runs beside 3".
- **`gold-without-training`** (running) owns `55-crafting.js`, `50-sim.js`, shares `40-rules.js`, and claims the same
  50/25/25 split: two owners, one target. **`first-gold-and-camp-strip`** owns `75-craft-ui.js` and wants a profile on the
  first weapon (needs card 3). **`set-bonus-build`** depends on the superseded `craft-attribute-grades`.
- **Not written:** no `refine-middles`, `forged-grades` or `tonic-brew` in `autopilot/cards/`; `craft-delta` not amended;
  no card has measurable acceptance.

### M11. The die is still there.
**Claim:** "Grade comes from your level, not a die."
**Failure:** Which stats roll, and each line's roll q (budget 0.12 to 0.22 x p, `craftAffixValue`), stay random, and
Reforge stays as a re-roll tax. Cal's answer 7 says "Reforge becomes Retune".
**Fix:** Fix q at 0.5 on graded items. Then either retire Reforge for graded items (keep it for old ones), or say why
it stays and give Cal a veto line.

---

## Minors

1. **Copper's grade levels are wrong.** "C at +3, B at +6" over a gate of 1 means Smithing 4 and 7, not 3 and 6 (42 and
   140 XP, not 22 and 101).
2. **The Strike in a fight.** "An open menu never pauses foe turns" (DECISIONS), so it competes with the parry: use
   `holdGame` and Assist's `turnAssistX`, and say if off-hands count. Good players get +1 grade nearly always.
3. **Copy says "Smithing" for everyone.** Wren's and Pip's weapons are made at the Workbench (Woodcraft).
4. **Two deviations from Cal need a veto line.** Armour's secondary stat (answer 7) is deferred, and Hands staffing a
   queue (answer 5's ceiling) is deferred. Both are justifiable for scope, but say so.
5. **The online numbers do move:** the `raiders` doc's `gear` is `gear().score` (`80-online.js:10`), and raid dps reads gear Might.
6. **Tents 5 to 10 open at zones 50 to 141** (`ECON.tents`), outside M1, so option B's quarter cannot come from them.
7. **Refill all can drain raw piles** that camp builds need. Draw input per unit, keep a reserve.
8. **W7's timer rule breaks on the first T2 weapon:** 5 ingots x 25 s = 125 s, about 4 fights.
9. **Tier 2 at 35 to 50 min is optimistic for a fighter:** Mining 14 is about 27 min of active T1 mining with the right
   tool (calc), plus Woodcutting 14. Coal itself is no wall (a T2 weapon's 10 coal is about 25 s; the 5,000 cap is
   never hit in hour 1).
10. **Cal's split is Forge 50, crew 25, supplies and buildings 25**; the spec moves buildings to crew. `CLAUDE.md` says
    save key `v1`; the code is `v5`.

## What holds up
Coal as a node, four middles, leather at the Loom, no fail chance, one refine step, grades shown before crafting, the
Strike's Skip, and switches that lose nothing.
