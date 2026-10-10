# Saint Elowen, the Last Lantern: fight kit, how a player meets her, pose list

Card `elowen-ability-spec` (Cal, 10 Oct 12:10: "Sure", to the art thread's offer of a design pass on Elowen like Oriel's).
Status: **spec, judge ruled 2026-10-10 (section 11).** No code here: `route-s-elowen-wire` builds it, the art thread
draws it.

Starting list: Codex's hero-16 kit "Given Light" in `hero-abilities-34.json` (copy at
`/mnt/project-files/heroes/oriel/hero-abilities-34.json`): 9 actives and 3 passives on a 0 to 6 resource, marked by Codex as
unbalanced proposals. This doc fits it to today's game: 6 style moves + 8 signature moves, all her own
(`docs/design/hero-kits.md`: no shared abilities), her type (holy, `21x-data-types.js:99`) and damage-on-impact (#348).

Facts checked at `68eb357b`: she exists as roster data only (`56-roster.js:36`: Legendary, support, Oath circle, route `quest`,
"Quest: relight the chapel with gold and Essence"). Her quest is set for Chapter 2 today (`56c-unlocks.js:28`: from zone 57, 3000
kills' gold, 20 Essence; its text is built in code at `56c-unlocks.js:169`); her meet is at zone 36 (`56c-unlocks.js:78`
`STORY_MEET`), and her lines already play on the Fenmother's post (`21k-story-hollow.js:318`, `elderPost:fenmother`). Her join
card and tales exist (`21-stories.js:33, 91-93, 118, 199-203`). The story bible makes her the end of Chapter 1: she lit your lamp,
and she answers "Why does my light still burn?" (`story-bible.md` sections 4 and 8.1). She has no fight moves. Names already
taken, so not used here: "Given Light" (the Lightkeeper evolution's title and a legacy passive, `24-data-classes.js:171, 327`),
"Sanctuary" (a shared Star, `24f-data-stars.js:95`), "Dawnbreak" (the Lightkeeper's finisher), "Steady Flame" (a Deepwell buff),
"Guiding Light" (a Pip talent), "The Chapel" (her tale), and "the Last Lantern" (her title and a Feat title, `23-data-deeds.js:203`).

## 1. Her loop, and how she plays differently

**Give your light away, or keep it and let it burn bright.** Elowen's Attacks light Candles. A low flame (1 to 3 Candles) makes
her Attacks hit harder. Her gifts spend Candles: Kindly Light turns them into a bigger Ward, Cupped Flame into a stronger
next Attack, and Give It Away into a holy hit that keeps her flame low. Or she stops giving: at 4 or 5 Candles she loses the
low-flame bonus, but Swing the Lantern hits half again as hard and Full Flame spends the lot in one blast.

- That is the story's rule in play (bible section 3, rule 2): **given light is safe and steady; kept light is bright and
  costly.** Her own line, "Keep your flame low. It lasts longer." (`21-stories.js:118`), is the low route; the finale, where she
  turns her flame up on purpose (bible 9.2), is the bright one.
- The choice is made by what she casts, never on a choice screen: every spend is automatic and every bonus reads what she holds.
- **Wren** marks and crits. **Tobin** parries and counters behind Guard and Grit. **Pip** burns over time. **Oriel** stores one
  star and takes the foe's turns away. **Elowen** decides each turn whether to give or to keep, and her gifts shelter her: Wards,
  a Guard, a Blind and a Weaken. **She never heals and never cleanses.**

## 2. Her resource: Candles

`HERO_RESOURCE.elowen = { name: 'Candles', txt: 'Candles: each Attack lights 1, up to 5. While you hold 1 to 3, your Attacks hit
15% harder. Kindly Light, Cupped Flame and Give It Away give Candles away. Full Flame needs 3 and spends them all.' }`

- **Its own effect (as Aim's crit, Grit's damage and Cinders' fire damage):** while she holds 1 to 3 Candles, her Attacks hit 15%
  harder. 0, 4 or 5: no bonus. It reads the Candles held as she swings, before that Attack lights one.
- **Lights:** Attack 1 after contact; I Will Watch 1 for each wholly defended enemy move while it lasts; Swing the Lantern's Perfect 1.
  "Wholly defended" (judge): a foe move with at least 1 real hit, none landed, every real hit parried or dodged. Feints, Blind
  misses, charge turns and skipped turns light nothing.
- **Spends:** Kindly Light gives up to 2; Cupped Flame gives 1; Give It Away gives all but 1; Full Flame spends all.
- Cap 5: `turnGain`'s default (`59k-turn.js:600`). Resets every fight. Flicker, her quick bolt, lights none.
- **One fight, walked (casual, starter only):** Attack (0 to 1), Attack (1, +15%, to 2), Kindly Light (gives 2: 20% Ward, to 0),
  Attack (to 1), Attack (+15%, to 2), Attack (+15%, to 3), Kindly Light ready again (gives 2, to 1). With only her starter the
  count cycles 0 to 3: she is in the low window most swings, so the resource pays from her first fight.
- **Bright route, walked (Swing the Lantern and Full Flame slotted):** five Attacks with no gifts reach 5 Candles (three of them
  boosted), then Swing the Lantern at +50%, then Full Flame at 160% + 250%.

## 3. The rules she reads

- **New state the build adds:** `h.candles` (the resource), `h.watch` (I Will Watch's 2 enemy turns), `h.still` (One Still
  Burning's next-Attack charge, cleared at the fight's end). Everything else is an existing 59k state.
- Statuses she uses: Ward (`wardCap` 0.3; a new Ward keeps the larger value and resets to 3 enemy turns, `59k-turn.js:592`, so her
  Ward sources refresh, they do not add), Guard (`guardX` 0.6), Blind (`blindP` 0.3, `blindBossP` 0.15), Mark (`markV` 0.2),
  Weaken (`weakenX` 0.75), Cursed (holy burst, the default `curseDt`).
- **"Spell" for Staff Alight** is the 59k `spell` flag: her damage abilities that hit (Kindly Light, Swing the Lantern, Lamps
  Answer, Give It Away, Flicker, Dazzle, Pillar, Full Flame). Haven, I Will Watch, Cupped Flame and Penance are not spells.
- **Attack bonuses add, they do not multiply** (judge): the low flame (15%, or 30% with Keep It Low) and Staff Alight (50%) add
  to one bonus, so an Attack is x1.8 at most before Mark and Cupped Flame, the same as Pip's Afterglow Attack at 5 Cinders.
- **No one-action boost rides stored damage:** Penance's burst and Full Flame read their own numbers as they land (lessons, Combat).
- **No heal, no cleanse, no mid-turn choice, in her kit or her talents.** Heals stay as they are for other heroes.

## 4. The kit: 6 style moves + 8 signature, all her own

Fields as `24c-data-abilities.js` `A(hero, code, id, name, short, kind, tier, pow, cd, dt, desc, line)`. All holy. Power is a
share of ability power; cooldowns count her turns. Numbers are starting values for the sims in section 6.

### Her own 8

| Code | Id | Name | Short | Kind | Tier | Power | CD | Timed | Effect (desc) | Line |
|---|---|---|---|---|---|---|---|---|---|---|
| E1 | `kindlylight` | Kindly Light | Kindly | damage | 0 (starter) | 1.5 | 4 | no | A beam of holy light for 150% power. Give up to 2 Candles: you gain a Ward worth 10% of your max HP, plus 5% for each Candle given. | A beam of light. Candles become a Ward. |
| E2 | `iwillwatch` | I Will Watch | Watch | buff | 2 | 0 | 5 | no | Guard for 2 enemy turns (40% less damage). Each enemy move you wholly parry or dodge in that time lights 1 Candle. | Guard. Defending lights Candles. |
| E3 | `lanternswing` | Swing the Lantern | Swing | damage | 2 | 1.3 | 3 | yes | Swing your lantern for 130% power. If you hold 4 or 5 Candles, it hits 50% harder. | Hits harder on a bright flame. |
| E4 | `stillburning` | Cupped Flame | Cupped | buff | 3 | 0.8 | 5 | no | Give 1 Candle (if you hold one): your next Attack adds 80% power and gives you a Ward worth 10% of your max HP. | Next Attack hits harder, and a Ward. |
| E5 | `lampsanswer` | Lamps Answer | Lamps | debuff | 3 | 1.0 | 5 | yes | Every lamp in sight flares for 100% power. The foe is Marked for 3 turns: it takes 20% more damage. | Marks the foe for 3 turns. |
| E6 | `giveitaway` | Give It Away | Give | damage | 4 | 1.0 | 4 | no | A gift of holy light for 100% power, plus 30% for each Candle given. Give away all your Candles but 1. | Gives Candles away for a hit. Keeps your flame low. |
| E7 | `keepitlow` | Keep It Low | Low | passive | 4 | 0 | 0 | no | Passive. Your low flame burns brighter: 1 to 3 Candles make your Attacks hit 30% harder instead of 15%, and your Wards last 1 more enemy turn. | Passive: a stronger low flame. |
| E8 | `fullflame` | Full Flame | Full | finisher | 5 | 1.6 | 7 | yes | Finisher, from your third turn. 160% power, plus 50% for each Candle; uses them all. Needs 3 Candles. The foe is Weakened for 2 turns (25% less damage). | Spends all Candles for a blast. |

Perfect presses (`ABILITY_PERFECT`): `lanternswing: '1 Candle'`, `lampsanswer: 'the Mark lasts 1 turn longer'`, `fullflame: '2
Candles come back'` (the refund lands after the spend). With Dazzle (`dazzle: 'the Blind lasts 1 turn longer'`) that is 4 timed
moves, as every hero has (DECISIONS, Abilities).

Order inside one action: the action's own hit and riders (reading the Candles held as it starts), then its Candle gain or spend
(Full Flame's spend, then its Perfect refund), then any Ward it gives. Kindly Light's Ward does nothing while a bigger Ward holds
(the larger value wins), so the bot's policy (section 6) casts it when no Ward or a smaller one holds.

### Her style six (the caster template, made hers)

The caster template's mechanics (hero-kits.md section 1) with her own ids, names, holy type and looks. Codes continue hers.

| Code | Template slot | Id | Name (short) | Kind, tier, power, CD | Timed | Status | Effect (desc) | Line |
|---|---|---|---|---|---|---|---|---|
| E9 | quick bolt | `flicker` | Flicker (Flicker) | damage, 1, 1.3, 2 | no | none | A quick flicker of holy light for 130% power. | A quick bolt. |
| E10 | timed control bolt | `dazzle` | Dazzle (Dazzle) | damage, 2, 1.1, 3 | yes | Blind | A bright bolt for 110% power. The foe is Blinded for 1 turn: it can miss. | Blinds for 1 turn. |
| E11 | ward | `haven` | Haven (Haven) | buff, 2, 0, 5 | no | Ward | A haven of soft light guards you: a Ward worth 20% of your max HP for 3 enemy turns. | A Ward for 20% of your HP. |
| E12 | curse | `penance` | Penance (Penance) | debuff, 3, 0, 5 | no | Cursed | The foe does penance for 3 turns: it stores 20% of the damage it takes and takes it again, as holy, when it ends. | Stores damage, then it lands again. |
| E13 | passive | `staffalight` | Staff Alight (Alight) | passive, 3 | no | none | Passive. After a spell that hits, your staff stays lit: your next Attack within 2 turns hits 50% harder. | Passive: an Attack after a spell hits harder. |
| E14 | big blast | `pillar` | Pillar (Pillar) | damage, 4, 1.6, 4 | no | none | A pillar of holy light falls on the foe for 160% power. | A strong blast. |

- **Dazzle's Blind is 1 turn, not Lantern Flare's 2:** a cooldown-3 timed Blind for 2 turns would favour a player who never
  defends. **Pillar falls on the foe from above,** not a ring from her staff, so it does not read as Pip's Ring of Light.
- Her passives: Staff Alight (style) and Keep It Low (signature). Both can boost one Attack: section 6 row 6 measures it.

### Talents

Two each, as every ability has (her 14, plus Attack, Parry and Dodge): the wire card's planner writes them, starting from Pip's
talent in the same template slot, in her words and resource. **None heals and none cleanses** (Mending Light, Clear Mind and
Warmth Within get no Elowen versions); where Pip's talent heals, hers gives a Ward or a Guard instead. Where Pip's talent swaps the
element, hers adds a rider (a Mark, a Weaken or a Blind): she has one element. Each talent that adds damage goes in section 6 row 6.

### Abilities screen groups (`HERO_PATHS.elowen`, 5/4/5)

- **Keeping Watch:** kindlylight, haven, iwillwatch, stillburning, staffalight
- **Candles:** giveitaway, keepitlow, fullflame, flicker
- **The Lamps:** lanternswing, lampsanswer, dazzle, penance, pillar

### What changed from Codex's kit, and why

| Codex card | Here | Why |
|---|---|---|
| A Light for Someone | E1, the starter, Kindly Light | The starter carries the identity: a hit, and Candles given as a Ward. No cost to cast: she arrives with only her starter. |
| Rest, I Watch | E2, I Will Watch, **heal cut** | A mid-fight heal is not in her kit. The Guard stays, and defending under it lights Candles, which rewards parry and dodge. Codex's Lit for You (Light for defending) lives on here. |
| Spark Offered | E3, Swing the Lantern | Her bright-route hit, keyed to Candles she controls. "Spark" is Pip's move name. |
| One Still Burning | E4, Cupped Flame | Renamed by the judge: "One Still Burning" did not say what the move does (its pose already cups the flame). It now gives a Candle, as Codex's cost did. |
| Lamps Answer | E5, kept, now timed | Mark is an existing status; the name echoes the finale (the road of lamps answering). |
| Given Freely | E6, Give It Away, **choice and heal cut** | Codex's optional spend on Attack was a mid-turn choice. Now it is its own move: give your Candles, keep your flame low. |
| Small Flame | the resource's own effect, and E7 Keep It Low | Codex's low-or-bright decision is built into Candles; the passive makes the low route stronger. |
| The Last Lantern | E8, Full Flame, **choice cut** | Codex's spend-4-or-6 choice needs a choice mid-turn; now it spends all and always Weakens. Renamed: her title and a Feat already use the name. |
| Keep It Low (active) | **cut** | A 5% Ward and 1 Light did too little to take a slot. The name moves to the passive. |
| What They Got Wrong | **cut** | A self-cleanse, and a riddle name. |
| The Choice Again | **cut** | Threshold riders read as a choice and overlap Full Flame; a riddle name. |
| Lit for You | **cut** | One passive per signature set; its idea is in I Will Watch. |

Codex's resource rules (cap 6, "opening Light", replacement charges) are not carried over: the game's own rules (59k) apply.

## 5. How a player meets her

**Pick: she joins through her chapel quest, opened on the Fenmother's post (the end of Chapter 1), at the road's level.** Her
scene there already plays (`21k-story-hollow.js:318`). The quest moves from Chapter 2 to that moment: "Relight the chapel" opens
when the Fenmother falls; bring gold and Essence to the chapel on Lantern Hill, the existing join card plays ("You light the
last candle in the chapel. For a moment, every lamp in the valley flickers.", `21-stories.js:91-93`), and she joins.

- **Why the end of Chapter 1:** she is the answer to Chapter 1's question (bible 4 and 8.1: "I lit that for you. You were very
  small."). Meeting her earlier spends the chapter's reveal; her candle flaring at the Chained Star (zone 30) is the plant. Oriel
  already fills the zone 20-30 stall. Elowen is the reward for finishing the Hollow and the hero for the endgame loop after it.
- **The other option, for the judge:** open the quest at zone 31, when the Chained Star falls and her candle flares, and keep the
  "I lit that for you" reveal on the Fenmother's post. She would play zones 31-35 and the Fenmother. Cost: a `STORY_MEET` change,
  a new scene at the Chained Star, and a hidden saint who comes out before her chapter's reveal.
- **What 1.0 means here:** the end point in `roadmap/road-to-fun-and-profit.md` (2026-10-07) is Chapter 1 (zones 1-35, the
  Fenmother) and one endgame loop; DECISIONS (2026-09-28) still says five regions. Under either, she joins at zone 36.
- **Why a quest, not a free join on meet:** DECISIONS gives every hero an unlock route; hers has always been the chapel (her roster
  line, her join card, Sister Fennel's changed line). The quest is short and sits right after the Elder, so it reads as the
  chapter's last step, not a grind.
- **The Proving:** she joins at the road's level (35 or more), and the story has her open the Proving. A Proving evolution
  replaces a hero's 8 signature moves (DECISIONS, The hero), and her subclasses are not designed. **Until her subclass card lands,
  she cannot take the evolution pick** (the wire card hides it for her and says why). That is for tester builds only: turning her
  join flag on for players waits for `elowen-subclass` or Cal's word (DECISIONS, The hero: each hero "ships complete").
- **Data the wire card sets:** `UNLOCK_TUNE.quests.elowen = { from: 36, kills: 300, ess: [4, 40] }` (starting values) and the text
  in `56c-unlocks.js:169` becomes "Beat the Fenmother and relight the chapel." Pass: a casual walk save at the Fenmother clear pays
  it within 60 minutes of play, and not on arrival with nothing spent. `STORY_MEET.elowen` stays `[36, 1]`. `SOLO_HEROES.elowen =
  { key: 'elowen', base: 'mage', kit: 'lanternmage', weapon: 'Staff', role: 'Support', range: 'Ranged, holy', abs:
  ['kindlylight'], eq: ['kindlylight', null, null] }`; `SOLO_ORDER` gains her. She arrives with Kindly Light and spends the lamp's
  spare Scrolls first, as any joining hero does.
- **Money:** she is earned in play. Heroes are never sold (DECISIONS, Money).

## 6. Numbers: the sims a build card must run

She must land inside the band the other heroes set; she is not tuned to beat them. "Playing a tank or support must not be weaker"
(DECISIONS, The hero). Measure on the live turn rules at the build's own head, **with Wren, Tobin, Pip and Oriel (if wired) in
the same run**, arrival and kept-up footing (`tools/budget.mjs buildCore`), casual (parries 25%, dodges half the rest), good (60%,
90%) and never-defends players, 240 fights a cell, every fight its own seed, `almanac.force('none')`. Her slots on arrival are
what a joining player has: Kindly Light plus the moves the lamp's spare Scrolls teach, from a walk save at the Fenmother clear.

The tools need these first (part of the wire card): `budget.mjs` rows for the Fenmother replay, the Provings and Deepwell floors
1-10 (or a `turnCombatSample` script with the same cells); W10 checkpoints (`W10-data/lib.mjs:10-18` stops at zone 17) at the
Fenmother and two Provings; `tools/lib/budget-score.mjs:9` and `health.mjs:46` taking her as a fourth hero, with the other heroes'
own cells pinned and only the mean cells re-baselined (said in the PR).

1. **Where she plays:** the Fenmother and the zone 31-34 Captains (replayed), the Drowned Halo, the Provings, Deepwell floors 1-10
   (HP carries; a kill heals 15%), and the first zones past 35 the build has. Pass: casual inside the other heroes' spread on each
   row, good 95-100, never-defends no higher than the highest other hero.
2. **Never-defends on its own:** her Wards, Guard and Blind must not carry a player who never parries or dodges. If she is the top
   never-defends hero on any boss row, tune Haven's and Kindly Light's Ward shares first.
3. **The switch row:** swapped in for the hero who leaves, her normal fights stay within 10 points of theirs (DECISIONS, hero
   progression), and her normal-fight length stays within 1.25x of theirs.
4. **The W10 loadout table** at the Fenmother and two Provings: her best / median / worst 3-move sets inside the others' range.
   Her starter-only row is reported on its own: the resource must pay without any other move.
5. **Her default slots** against her best set: the gap no wider than Pip's in the same run.
6. **Her biggest single actions, like against like** (judge), each as a share of the Fenmother's HP in the same run:
   - 6a: her biggest Attack (Keep It Low and Staff Alight, with Cupped Flame, on a Marked foe) no bigger than the others' biggest
     Attack (Pip's Afterglow Attack at 5 Cinders, about x1.8).
   - 6b: her biggest ability (Full Flame at 5 after Lamps Answer; Swing the Lantern at 5 on a Marked foe) no bigger than the others'
     biggest ability (Hammerfall at 10 Grit is 790% power, so this row is a ceiling, not a target).
   - Each damage talent the planner writes goes in 6a or 6b. (The +50% cap is the uniques' boss cap, `59k-turn.js:635`; rally gates
     end at zone 34, so they do not bind where she plays.)
7. **The Stars that touch her** (findable in this build): Brimming; Banked Coal with all four of her spenders (it refunds 1 after
   any spend, `57e-stars.js:333`) and Full Flame's refund; Ready Lamp, Spark
   Guard, Spite, Sanctuary (a Ward from turn 1 with Kindly Light's spend) and Perfect Time. Each changes her rows by no more than it
   changes Pip's.
8. **The bot's policy** (the sampler casts the first ready move in slot order, which is wrong for her): low route when Keep It Low
   is slotted or Full Flame is not (Give It Away at 4 or 5, Kindly Light when no Ward or a smaller one holds, Attack at 1-3);
   bright route otherwise (hold to 5, then Swing the Lantern, then Full Flame); I Will Watch before a boss charge. A test asserts
   each.
9. `node tools/health.mjs --compare` before and after: no change for the other heroes' own cells.
10. **The sampler matches the live fight:** the same seeded fight through `turnCombatSample` and the live turn loop gives the same
    Candles, Ward, Guard and damage each turn, and I Will Watch's Candle reads the live defence (lessons, Combat: assert io-reading
    rules on the live path). A test asserts it.

Tuning order if she is out of band: Swing the Lantern's bright bonus, then the low-flame bonus (15% and Keep It Low's 30%), then
Full Flame's per-Candle power, then Give It Away's per-Candle power, then the Ward shares, then `SOLO_TUNE.heroX` / `heroHp` and,
if her Ward and Guard make bosses too easy, a `heroHitX` line as Tobin has. Never the no-heal rule, the Candle cap or her style
six's mechanics.

## 7. Pose list for the art thread

All 8 frames a move (Cal, 10 Oct 09:51), facing right, drawn by Scenario from Codex's approved concept
(`art/concepts/hero-corrections-v1/elowen.png` on `codex/hero-animation-plan`: staff, tome, hip lantern, ivory-and-gold mantle).
The impact frame is the "release" frame: damage-on-impact lands the act there. Emit points are named on her body here; the wire
card measures them as fractions of the cut frame's box (x from her back edge, y from the top), as oriel.md does. No effect is
drawn in the art: beams, rings, Wards, candles and flares are the game's (62b recipes), in holy gold (`DT_INFO.holy` `#F0E442`,
her attack mote `#F2C14E`, `62-stage.js:307`).

| Move id | Name | Frames | Impact frame | Emit point | What she does | Effect the game draws |
|---|---|---|---|---|---|---|
| `attack` | Attack | 8 | 5 | staff head | a short staff thrust | a small gold mote to the foe |
| `kindlylight` | Kindly Light | 8 | 5 | staff head, held level | staff levelled at the foe | a gold beam; Candle chips empty into a Ward ring round her |
| `iwillwatch` | I Will Watch | 8 | 5 | her body centre | staff planted, braced | a Guard glow on her |
| `lanternswing` | Swing the Lantern | 8 | 5 | the lantern at the end of its swing | free hand swings the lantern on its chain, still hooked | an arc of lantern light, brighter at 4-5 Candles |
| `stillburning` | Cupped Flame | 8 | 5 | free hand at the lantern | free hand cups the lantern's flame, then touches the staff | one flame moves to her staff |
| `lampsanswer` | Lamps Answer | 8 | 5 | the lantern, held high | free hand unhooks the lantern (2-3), holds it high (4-6), hooks it back (7-8) | a flare; the Mark on the foe |
| `giveitaway` | Give It Away | 8 | 5 | free hand, palm up and open | free hand opens toward the foe, as if handing something over | small lights float to the foe and burst |
| `fullflame` | Full Flame | 8 | 6 | the lantern, held high, and the staff head | unhooks the lantern (2-3), lifts it and the staff together (4-6), hooks it back (7-8) | the big blast; the Candle chips empty; Weaken on the foe |
| `flicker` | Flicker | 8 | 4 | free hand, fingers flicked | a quick flick of the free hand | a quick gold bolt |
| `dazzle` | Dazzle | 8 | 4 | staff head, thrust | a sharp staff thrust | a bright flash bolt; Blind on the foe |
| `haven` | Haven | 8 | 6 | her body centre | staff raised, free hand open at her side | a soft dome of light round her |
| `penance` | Penance | 8 | 5 | free hand, palm out | free hand held out, palm to the foe | a gold sign settles on the foe (the Cursed colour) |
| `pillar` | Pillar | 8 | 5 | above the foe | staff raised overhead, then brought down | a pillar of light falls on the foe |
| `parry` | Parry | 8 | 3 (the block) | staff middle | staff held across her | parry flash |
| `dodge` | Dodge | 8 | 3 (in the air) | none | a step back | none |
| `hit`, `idle`, `defeat`, `victory` | | 8 each | none | none | | none |
| `mining`, `woodcut`, `forage`, `hunt` | gathering | 8 each | mining 5, woodcut 5, forage 4, hunt 5 | tool head | **staff stowed on her back** | the game-placed axe on `woodcut` (empty fists) |

Passives (Keep It Low, Staff Alight) have no pose. 23 poses, 184 frames: about 150 Scenario credits at the Oriel rate, which need
Cal's OK (card `route-s-elowen-poses`). She plays only after the Fenmother, so her poses are not needed before M1b testers reach
zone 35; that timing goes to Cal with the ask.

**Art note for the art thread (from Oriel's third-arm and shrinking-staff problems).** Name the sides once, from the approved
concept, and keep them in every frame. Before generating, the art thread writes down which hand is near the viewer (facing
right) from the concept, and uses the move names in the table above (not Codex's old names) to label the gallery and the sheets:
- **The staff hand** holds the staff in every fight pose, and the staff never changes length. In gathering poses the staff is
  stowed on her back and both hands work the tool.
- **The free hand** is the only hand that flicks, cups, opens, or lifts and swings the lantern.
- **The lantern hangs on a hook at the free-hand hip**, on a short chain. Swing the Lantern swings it on the hook. Lamps Answer and
  Full Flame unhook it and hook it back within the 8 frames. Its flame stays low and the same size in the drawing; the game draws
  any flare.
- **The tome is strapped shut at the staff-hand hip from the first frame** of every pose. It is never held, opened or read.
- Two hands only. The mantle keeps one shape per sequence; no glow, rays or halo drawn in.

## 8. What the wire card must change (`route-s-elowen-wire`)

- `24c`: her 14 rows, `HERO_RESOURCE.elowen`, `ABILITY_PERFECT` lines, `HERO_PATHS.elowen`, `HERO_ABILITIES.elowen` (14 distinct
  ids; hero-kits.md section 6's test covers her). The per-hero save blank (`56e-abilities.js:36`) gains `elowen`.
- `24b-data-solo.js`: `SOLO_HEROES.elowen` and `SOLO_ORDER`, with her signature `.ab` looked up after 24c has her moves
  (`24b-data-solo.js:74` runs before 24c today); `SOLO_TUNE.heroX` and `heroHp` gain her (`59k-turn.js:344` divides by
  `heroX[key]`, NaN without it), and so do `TURN_TUNE.heroX` and `counterX`. `TURN_SIG.elowen = 'kindlylight'` (`59k-turn.js:221`;
  without it her ability power reads Wren's Echo Shot, `59k-turn.js:352`).
- `59k-turn.js`: `h.candles`, `h.watch`, `h.still`; `turnWard` gains a duration argument so Keep It Low's extra Ward turn has
  somewhere to go (`59k-turn.js:592` always sets 3); cases for her 12 actives on existing states; the low-flame bonus, Keep It Low
  and Staff Alight in the Attack path; I Will Watch's Candle per wholly defended move; the bot policy (section 6).
- `57e-stars.js`: `HEROES` (line 48) gains her, or her star sets are deleted on load and refused (lines 69-70, 155); the resource
  map (line 294) gains `elowen: 'candles'` and `STARS_TUNE.fx.ready` gains `candles: 2` (`24f-data-stars.js:34`; without it
  Ready Lamp sets her Candles to NaN), so Ready Lamp, Spark Guard, Banked Coal, Spite and Bloodscent work for her; their texts
  that say "Aim, Grit or Cinders" name Candles too.
- `21x-data-types.js:99`: her signature status `regen` (a heal) becomes `shield`.
- `24e`: her talents (section 4), written by the card's planner.
- `56c-unlocks.js`: her quest at zone 36 and its text at line 169 (section 5); the evolution pick hidden for her until her
  subclass card lands.
- `tools/check.mjs:5722` pins `SOLO_ORDER` to the three starters: the build writes the one exact new order into the assert (a new
  expected value, not a loosened check) and says so in its PR. The section 6 tool changes.
- `62b-fx.js`: `FX_RECIPES` for her 12 actives and `elowen:attack` in holy gold (card `elowen-fx-recipes`).
- Behind one flag (as `STORY_TUNE.joinOnMeet` is for the starters): off, she stays roster-only. Her state is new fields with
  defaults in `fresh()` and the save blank; no save key bump.

## 9. Follow-up cards

The Foreman writes them; none starts before this spec's ruling.
1. **`route-s-elowen-poses`** (art thread, Scenario): the 23 poses in section 7. **About 150 credits: waits for Cal's OK**, with the
   note that she is not needed before M1b. The art judge vets the whole pack.
2. **`elowen-icons`** (Codex): icons for her 14 moves under these names and effects. Codex's draft plate (hero-13, Saint Elowen,
   on `codex/hero-animation-icons`) was drawn for the old 12 and is not approved; reuse only where the art judge finds a draft fits
   the live move's meaning (DECISIONS, Art). She ships with no icons until all 14 are vetted (the `COMPLETE` rule).
3. **`elowen-fx-recipes`**: 62b recipes for her 12 actives and Attack, in holy gold.
4. **`route-s-elowen-wire`** (build, Opus medium; balance review Opus high): section 8 and the section 6 sims. The rules and data
   can be built behind the flag before cards 1 to 3 land.
5. **`elowen-chapel-scene`** (story): the words of her quest card and join beat at the chapel, and one line at the Proving (bible
   8.1, "Power"). Her Fenmother lines stay as they are.
6. **`elowen-hero-quest`** (quest): her hero quest and its reward, the Hallowed move (DECISIONS, The hero). Default pick for the
   quest card's planner: Full Flame.
7. **`elowen-subclass`** (spec, later): her Proving evolutions, before she may take the evolution pick.

## 10. Out of scope

Code, the art and its vetting, Scenario credits, icons, the scene's words, the hero quest's reward, Hallowed looks and her
subclass. Nothing touches the online layer.

## 11. Red team and judge

Red team (Opus, read-only, on the first draft), ten findings, each answered in this draft:
1. **Low vs bright was not a choice:** every cost was cut, so Candles only climbed to 4-5. Now three moves give Candles away
   automatically (Kindly Light, Cupped Flame, Give It Away) and two pay for keeping them (Swing the Lantern, Full Flame);
   Light a Candle is cut. Section 2 walks both routes.
2. **The resource did nothing alone, and the loop needed 4 slots:** the low-flame bonus is now built into Candles, the starter
   spends them, and the passive only strengthens the low route. Section 6 row 4 reports the starter-only row.
3. **The gain-cap row could not pass, and gates do not bind past zone 34:** replaced by "her biggest single action must not beat
   the others' biggest" as a share of the Fenmother's HP; "spell" is defined (section 3).
4. **"While a Ward holds" was a defence check, and gear Wards are dead on her:** no move reads a Ward any more; the Ward rules are
   stated as they work (refresh, larger value wins).
5. **Wiring gaps** (Stars' hero list and resource map, heroX, the 24b order, the quest text, the `SOLO_ORDER` assert, `regen`):
   all in section 8.
6. **The sims could not run** (W10 stops at zone 17, three-hero scoring, no Proving rows, unfindable Stars, Stars that never read
   Blind): the tool changes are named, and row 7 lists the Stars that touch her.
7. **Zone 36 leaves her little road, and the Proving would swap her moves:** the zone 31 option is laid out for the judge; the
   evolution pick is hidden for her until her subclass exists; the 1.0 source is cited; the poses ask says she is not needed
   before M1b.
8. **The poses could not be drawn** (a chained lantern lifted high, staff in gathering poses, no sides named): sides named, the
   lantern unhooks and hooks back, the staff is stowed for gathering, names added beside pose ids, and a lessons line added.
9. **Name and theme overlaps** (Daybreak beside Dawnbreak, the Last Lantern as her title and a Feat, "The Chapel", a ring like
   Ring of Light): Pillar falls on the foe, Full Flame, Keeping Watch (the judge changed Shelter, a Tobin talent).
10. **Minor:** the new state is listed in section 3; Kindly Light's Ward under a bigger Ward is handled by the bot policy.

**Judge (Opus high, 2026-10-10): approved, with 9 amendments, all applied above.** Record:
[elowen-judge.md](elowen-judge.md); red team: [elowen-red-team.md](elowen-red-team.md).
1. **The kit: approved.** Holding 4-5 costs the low-flame bonus, and the trade is made only by what she casts, so findings 1 and 2
   are fixed; the starter alone cycles 0 to 3. Every state is live; 4 timed moves; one passive in each set; no heal, cleanse or
   mid-turn choice. Candles reward holding few, where Cinders reward holding many.
2. **How she joins: (a), the chapel quest when the Fenmother falls.** The bible has her come out of the chapel on the Fenmother's
   post; at the Chained Star a candle only flares in a dark window. (b) would make her playable before she comes out and needs a new
   scene. Neither zone helps the early game, and (a) lets the pose credits wait for M1b.
3. **Numbers, sims and poses: enough** with the amendments: `TURN_SIG`, Ready Lamp's `candles`, a Ward duration argument; additive
   Attack bonuses; row 6 split like against like; Banked Coal with every spender; "wholly defended" defined; Cupped Flame and
   Keeping Watch; the join flag waits for her subclass or Cal; the art thread names the near hand; the lessons line.

Veto phrase for Cal: **"Elowen joins at the Chained Star"**.

## 12. Design-doc rubric lines

- **Player problem and evidence:** Cal said yes to a design pass on Elowen (10 Oct 12:10). Codex's kit could not ship: it needs a
  mid-fight heal, a self-cleanse and two mid-turn choices the game does not have, 3 passives where the rules allow 1, and riddle
  names ("What They Got Wrong"). The end of Chapter 1 has a story payoff (her reveal) but no new hero to play after the Elder.
- **Alternatives weighed:** (a) a Ward-keyed kit ("hit harder while a Ward holds"): rejected by the red team, because a Ward only
  breaks on a landed hit, so it measures defence, not a decision; (b) Codex's costs kept as costs: rejected, because a cost with a
  "not enough Light" lockout is a new gate on every move; (c) **the pick:** automatic gives and keeps on one count.
- **Coverage-map areas:** 14 (heroes and build variety), 15 (world and story), 21 (long-term retention).
- **Predicted effect:** her casual win rates sit inside the other heroes' spread on every section 6 row, she is never the top
  never-defends hero on a boss row, and her starter-only row passes. Missed: any row outside after the tuning order in section 6 is
  spent; then the wire card stops and a judge re-rules.
- **Switch off and saves:** one join flag; her state is new fields with defaults; no save key bump. Nothing here touches the
  Cal-only list.
