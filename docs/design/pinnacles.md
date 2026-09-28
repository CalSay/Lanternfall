# Pinnacle bosses

Status: design spec D2 for plan 2 ([plan-2.md](plan-2.md) section 4, built in wave 4 as PB1-PB5),
written 2026-09-28. Four hand-made boss fights for the top of the game. Each has three phases, a
90-second timer and 3 to 5 telegraphed mechanics. Each one asks for a role or a tap. Built on party
combat (Stage C: `59-combat.js`, `59b-enemies.js`, [party-and-classes.md](party-and-classes.md)
section 4), the tide ([region-2.md](region-2.md)), the Vows ([oaths.md](oaths.md)) and legendary
powers ([legendaries.md](legendaries.md)). All numbers are starting values for `tools/sim.mjs` to
tune. The ratios and rules are the design.

Owner constraints this spec obeys: no prestige or resets, slower pace (BAL1), gameplay first with
art only where a system needs it, constant performance checks, fair with no FOMO power, idle by
default and rewarded for attention, playable at 360px, and the online layer is not touched.

Design rules:

1. **Every mechanic has two answers:** a tap you can make, and a line-up that makes it for you. A
   tapping player wins earlier. An idle party with the right members wins later. Nobody is locked
   out by reflexes.
2. **Missing costs time, not progress.** No stamina, keys or energy. A failed attempt costs its
   90 seconds, and your front keeps farming meanwhile. Nothing is ever taken away.
3. **One thing to answer at a time.** Two telegraphs that need the player never overlap. Every
   telegraph shows a word and a shape as well as a colour.
4. **No one-shots.** A missed answer costs at most 35% of a member's max HP per hit, or about 8 seconds
   of the timer. Only piled-up misses lose the fight.
5. **Power comes only through systems that already have caps.** Pinnacles pay legendary powers,
   Echoes, Trophies and Pearls (all capped by [legendaries.md](legendaries.md) 6 and the gear
   tiers), plus cosmetics, titles, a Codex page and best times.
6. **Art only where it reads the fight:** one large sprite per boss, one arena overlay each, and
   small props.

---

## 0. Why (what the play-test and plan 2 need)

- After the Region 2 boss, the curve flattens (plan-2 1.1). Oaths and legendary powers fill days
  30-45. Pinnacles give days 35-60 four named goals, about one a week (goal G1).
- Stage C adds heavy hits, dives, heals, adds, taunts, stuns and cleanses, but no single fight
  asks for all of them. Region bosses have 2 mechanics; the Drowned Keeper has 6 but only one of
  them (the Green Beam) asks for a specific answer.
- The four loose story threads (plan-2 4) have no pay-off: the Hollow King's fall (Corvin), the
  Ashen Wyrm's fire (Caedmon), the voice under the water (the Keeper's letters), and who is at the
  bottom of the Deepwell (Maud, Deep Lore pages 5-10).

---

## 1. Fantasy and loop

**Fantasy:** four things the Great Lanterns could not reach. A dead king who still holds court
behind a curtain. The green light that drowned the coast. The fire Caedmon walked into. The thing
under Hollow's Rest that Maud has kept down with one lantern for a hundred years. You go to each
with your best party and bring the light back out.

**Loop (active, 2 to 20 minutes, any day after the unlock):**

1. Open **Fight > Bestiary > Pinnacles** (or the Next Up goal). Four boss tiles; one is the
   **Boss of the Week**.
2. Tap a boss. Its sheet shows the mechanics you have seen, what counters them, your best time
   and the Vows you want to add (the Oath sheet's list).
3. Tap **Best line-up** (the planner reads the boss's needs) or keep your own, then **Fight**.
4. The encounter fills the screen: 90 seconds, three phases, one telegraph at a time.
5. Win: rewards, a best time, maybe a legendary power. Lose: one line on what beat you and a
   **Try again** button. Either way you go back to your front, which kept farming.

**Unlock:** the Drowned Keeper beaten (`coastLit()`) **and** an Oath of 15 kept (`S.oath.maxL >=
15`). Both are needed, as the brief says. Expected on day 33-40 (P2 day 28-32; oaths.md O2 puts Oath
15 at about day 33-38). All four bosses open together. Their **suggested power** differs (section
6), so there is a natural order but no gate between them. Old saves use the same rule.

After the unlock, pinnacles are always open. There is no weekly lockout, no attempt limit and no
timed reward.

---

## 2. Attempt rules

| Rule | Value |
|---|---|
| Cost to try | Nothing. No stamina, keys, energy or gold |
| Where from | Any time you are not in a Deepwell run or the raid. An active Oath stays sworn; you return to it |
| Length | 90s timer (**Short Wick** Vow: -8s a rank), plus a 3s intro you can skip with a tap |
| Your front | Paused on the stage. When you leave, the attempt's real seconds are credited with `awayGains(secs)`, the same rule as the Deepwell (deepwell.md 7) |
| Win | Boss HP reaches 0 before the timer |
| Fail | The timer runs out, or all four members are down at once (a wipe). There is no retreat and no zone loss: you are back at your front |
| After a fail | One line on the biggest cost, from the attempt's counters: "Kneel stunned your party 3 times. A stun or a tap on the King stops it." Buttons: **Try again** (same line-up and Vows), **Change line-up**, **Leave** |
| Leave mid-fight | A **Leave** button in the top bar, no confirm (nothing is lost) |
| Practice | On the boss sheet, once you have seen phase 2: **Practice phase 2** or **phase 3** starts there, at 70% or 35% HP, with no rewards and no best time |
| Reload mid-fight | The attempt ends. `S.pin.at` (start time) is cleared on load; time since the last save goes through the normal away card |
| Idle | Pinnacle kills happen only live. They are never credited while away and never auto-attempted |

**While sworn to an Oath:** entering a pinnacle does not break the Oath. The party's Oath zone is
restored when you leave.

---

## 3. Shared encounter rules

### 3.1 The fight

| Part | Rule |
|---|---|
| Party | Your hero and 3 fielded companions in your formation (or the boss's saved line-up, 5.3). Downed members stand up at 30% HP when a phase ends (not at pack ends: there are no packs) |
| Boss HP | `PIN_TUNE.hp` (2.4) x the zone boss HP at the boss's **anchor zone** (section 6), x Vows |
| Boss attack | `PIN_TUNE.atk` (3.5) x the normal foe attack at the anchor zone, x Vows |
| Phases | Phase 1 at 100-70% HP, phase 2 at 70-35%, phase 3 below 35%. Each change: a 1.5s pause (the boss roars or turns; no damage either way), a banner "Phase 2", then new mechanics |
| Adds | Some mechanics call adds. Adds use Stage C foe rules (threat, reach, armour) with HP as a share of the boss's (listed per mechanic) |
| Heavy hit | Every boss keeps the Stage C heavy hit (party spec 4.8): parry in the last 0.8s, Dodge earlier. Each boss renames and retimes it |
| Enrage | At **70s elapsed** (timer - 20s), each boss's enrage rule starts. It makes the last 20 seconds hard, never instant |
| Tide | Only the Lurelight has its own fast tide. Other bosses get the tide only from the **Rising Water** Vow (20s High, 20s Low) |

### 3.2 Telegraph grammar (the five answers)

Pinnacles use five kinds of answer. Each has a tap, and each has a line-up answer that works idle.
Stage C already has the first two; pinnacles add three.

| Answer | Telegraph (banner word, shape, colour) | Tap answer | Line-up answer (idle) |
|---|---|---|---|
| **Parry** | "PARRY", a red "!" and the shrinking ring | Tap the boss in the last 0.8s (1.1s with Maren); earlier is a Dodge (half damage) | Shield Wall, Aldric's Shield Bash, a Lightkeeper ward (party spec 4.8) |
| **Interrupt** | "INTERRUPT", a purple "~" and a filling bar over the boss | Tap the boss any time during the channel | Any stun: Aldric's Bash, Grenna's Earthshatter, Oriel's last Starfall pulse, the Lanternmage's tap flash |
| **Cleanse** | "CLEANSE", a teal drop over the marked ally's portrait | Tap that ally's portrait (a **Lantern touch**, 3.3) | Anselm or Elowen at level 20+, the Hymnal of the Road power, the Lightkeeper's auto heal-tap on a marked ally |
| **Swap** | "SWAP", a gold crown with stack pips over the target's portrait | Tap the marked ally's portrait: they **step back** (threat -50% for 3s), so the next member takes over | A second taunt: any other member's taunt (Tobin, Maren, Grenna, Caedmon, a Warden tap, the Tidewall power) moves the boss and clears the stacks |
| **Scatter** | "SCATTER", an orange double arrow, the struck cells lit on the party side | Tap the **Scatter** button: for 4s the party takes the layout with the fewest members in the struck cells, then steps back | A saved line-up whose formation already avoids the struck pattern (the boss sheet shows which cells each Scatter mechanic strikes) |

**Timing rules** (the scheduler in `59f-pinnacle.js`):

- At most one player-answered telegraph at a time. The next one starts at least 1.0s after the
  last one ends. When two are due together, the later one waits (up to 3s, then it is skipped
  once).
- Wind-ups are at least 1.2s, even under Restless and the enrage. Default wind-ups are 1.5s
  (heavy), 2.0s (channels) and 1.8s (Scatter).
- Passive rules (auras, debuffs already on a member, add attacks) run alongside telegraphs. They
  never need a tap in the same second as one.
- **Reading the fight:** each mechanic's first use in your first attempt shows a one-line hint
  under the banner ("Tap the King while he speaks"). Later attempts do not.

### 3.3 Lantern touch (ally taps for every class)

In party combat only the Lightkeeper taps allies. In a pinnacle every class gets the **Lantern
touch** on the portrait rail (5.2):

- Tap a portrait: cleanse that ally (the Cleanse telegraphs) or make them step back (a Swap). With
  nothing to answer, a touch does nothing and uses no charge.
- **2 charges, 1 back every 5s.** The rail shows the charges as two small flames.
- The Lightkeeper keeps his own ally tap (direct heal plus ward). In a pinnacle that tap also
  cleanses. He gets the touch charges too, so the support class has the most answers.
- Idle auto-play never spends touches. That is the attention reward.

### 3.4 What a miss costs (fairness caps)

| Missed answer | Cost cap |
|---|---|
| A heavy hit not parried | Stage C damage, at most 35% of the target's max HP after armour (a cap, not a floor) |
| An interrupt missed | One effect of at most 3s (a stun or a lost buff), or 8% boss HP healed back |
| A cleanse missed | The debuff runs its time: at most 25% max HP over 6s on one or two members |
| A swap missed | The target becomes **Crushed** for 3s (takes x1.5). No instant death |
| A scatter missed | At most 30% max HP to each member in the struck cells |

These caps are asserted by `tools/check.mjs` against the boss data (section 11.4).

---

## 4. The four bosses

Ids: `king`, `lure`, `fire`, `below`. Recommended order by suggested power: King, Lurelight, First
Fire, Climber.

### 4.1 The Hollow King (the Hollow)

**Arena:** the Hollow Court, a throne room under the barrows. It uses the `barrow` theme with a
cached overlay: a throne, a torn red curtain and two rows of kneeling stone courtiers.

**Story:** Corvin served the Hollow King for twenty years and never saw his face. When the King
fell, the court knelt to whoever came next. Something came next. It still speaks through the
curtain. In phase 3 the curtain falls, and there is no face: an empty coat and a crown held up by
nothing. If Corvin is fielded, he says one line when it falls, and he is immune to Kneel (he did
not kneel then either). He is not needed.

**Teaches:** interrupts, peel and taunt swaps.

| Phase | HP | What changes |
|---|---|---|
| 1. Behind the Curtain | 100-70% | The King stands in the enemy **Back** column behind the curtain: melee cannot reach him (party spec 4.2 reach). Two **Kneeling Courtiers** (adds, each 6% of the King's HP, Front, melee, soak) stand before him. Ranged strikers, casters and the Ranger hit the King |
| 2. The Court Speaks | 70-35% | Courtiers keep coming (2 every 20s, as long as fewer than 2 stand). **The King's Blade** starts |
| 3. The Curtain Falls | below 35% | The King steps into the Front column: every member reaches him and he takes +20% damage. **The Weight of the Crown** starts. The courtiers stop coming |

| Mechanic | When | Telegraph | Effect | Tap answer | Line-up answer | Role |
|---|---|---|---|---|---|---|
| **Royal Decree** (heavy hit) | every 9s, all phases | PARRY, 1.5s | 4x attack on his target (at most 35% max HP) | Parry: the King is staggered 2s and takes +50% | Shield Wall, Bash, ward | tank or any tap |
| **Kneel** | every 16s, from 0:08 | INTERRUPT, 2.0s channel | When it lands, every member except Corvin is stunned 2.5s (heavy hits still come) | Tap the King in the channel | Any stun on the King. Phase 1: only ranged stuns reach him (Oriel, the Lanternmage's flash); Aldric and Grenna reach him from phase 3 | caster or stun |
| **The King's Blade** | phase 2+, every 14s | a blue "!" over the Back-column member with the least HP, 1.5s | An unseen assassin (an add, 4% HP, untargetable during the leap) dives that member for 5s at x2 damage | Tap the assassin once it lands: the Warden taunts it, the Ranger focuses it, the Lanternmage flashes it, the Lightkeeper wards the target | Peel: Kestrel's Leap, Thessaly's Sinking Mire, any taunt; a tank in Front covers the ally behind it (Cover rule) | tank, peel striker |
| **The Weight of the Crown** | phase 3 | SWAP, stack pips 1-4 on the target's portrait | Each hit of the King on his target adds a stack. At 4 stacks the target is Crushed (stunned 3s, takes x1.5) and the stacks clear | Tap the crowned ally at 3 stacks: they step back and the next highest threat takes the King | Two taunters: when the second tank or a Warden taunts, the crown moves and its stacks clear | two tanks |

**Enrage, "The Court Rises"** (from 70s): every stone courtier in the overlay stands; courtier
adds attack 50% faster and Royal Decree comes every 5s.

**Counters:**

| Strong | Weak |
|---|---|
| Two tanks (a Warden hero with Tobin or Maren; Grenna with Aldric); a ranged stun (Oriel, a Lanternmage hero); peel (Kestrel, Thessaly); ranged damage for phase 1 (Wren, a Ranger hero, casters) | All-melee parties (slow phase 1); one tank with no peel (the Blade reaches the back row); no stun at all (every Kneel needs a tap) |

### 4.2 The Lurelight (the Coast)

**Arena:** Saltreach Reef at night. The `lighthouse` theme's night variant with the flooded ground
layer (region-2.md 3.6). The lighthouse is dark. Out on the reef a green light bobs in the swell.

**Story:** the green light that drew ships onto the reef was never a lamp. It is the lure of
something under the water, and it has a voice. It promised the Saltreach keeper that his light
would never go out if he gave it to the sea. It kept the promise in its own way: it swallowed the
lens, and it has been shining ever since. The fight is the voice under the water, named at last.

**Teaches:** cleanses, scatter and the tide.

**Its own tide:** 15s High, 15s Low, starting at the world tide's phase (region-2.md 3.1). The
tide's normal rules apply: Wading, Firm footing, Damp, Soaked. Tidefast and Shellbreaker work.

| Phase | HP | What changes |
|---|---|---|
| 1. The Song | 100-70% | Only the head and the lure show above the water. The Lurelight counts as a Back-column foe |
| 2. Two Lights | 70-35% | A second lure rises: a **Lure add** (10% of the boss's HP, Mid column, does not attack). While it lives, Lure Song comes twice as often. Kill it to stop that |
| 3. Low Water | below 35% | The water drops for good (the fight stays at Low tide). The body is exposed: +25% damage taken, and it counts as Front. **Riptide** comes every 9s |

| Mechanic | When | Telegraph | Effect | Tap answer | Line-up answer | Role |
|---|---|---|---|---|---|---|
| **Swallow** (heavy hit) | every 8s | PARRY, 1.5s | 4x attack on its target. At High tide, if not parried, the target is also **Swallowed**: gone for 4s, taking 3% max HP a second, back at the end | Parry | Shield Wall, Bash, ward | any tap, tank |
| **Lure Song** | every 15s (7.5s while the Lure add lives) | INTERRUPT, 2.0s, the lure glows | The member with the lowest HP% is **Charmed** for 4s: walks to the Front column and attacks the nearest ally | Tap the lure in the channel. Too late: a Lantern touch on the charmed ally frees them | Any stun that reaches the Back column (Oriel, the Lanternmage's flash); Kestrel's knockback; a cleanse frees a charmed member | caster, stun |
| **Brine Rot** | every 12s, on 2 members | CLEANSE, teal drops on 2 portraits | 1.5% max HP a second and healing received -40%, a new stack every 3s (up to 3) until cleansed or 9s pass | Two Lantern touches (the two charges) | Anselm or Elowen L20, the Hymnal power, a Lightkeeper | support |
| **Riptide** | every 14s in phases 1-2, every 9s in phase 3 | SCATTER, 1.8s, the lane with more members lit | A wave down one **lane** (upper or lower): 2.5x attack to each member in it (x1.5 at High tide, Soaked +50%) | Scatter: the party spreads so the lit lane holds at most 1 member | A formation with 2 members per lane (a spread layout); Shield Wall or a ward halves it, like a Surge brace | formation |

**Enrage, "The Flood"** (from 70s): the water rises for good (High tide rules, even in phase 3),
every Front member is Soaked, and Riptide comes every 6s.

**Counters:**

| Strong | Weak |
|---|---|
| A cleanser (Anselm, Elowen, a Lightkeeper hero); Tidefast Front members; ranged and non-fire casters (Oriel, Thessaly, Wren); a 2-and-2 lane formation | Burn casters at High tide (Damp); a stacked lane; no cleanse and no taps (Brine Rot stacks) |

### 4.3 The First Fire (the Emberwaste, a memory)

**Arena:** Emberlea Road, the night of the fire. The `forest` theme with a cached ember recolour
(a burning village road, red sky), a falling-ash layer of at most 12 particles (none under reduced
motion), and a cart of villagers behind the party (a prop).

**Story:** Caedmon held the road out of Emberlea for one hour while every family got out. He walked
into the Ashen Wyrm's fire, and a voice in it knew his name. This fight is that hour: you stand
where he stood, against the Wyrm as it was on the first night. If Caedmon is fielded, he is
immune to burns (his Unburnt aura) and says one line at phase 3. He is not needed.

This fight is a memory. It uses nothing from the world raid: no `world/boss` doc, no raid
generation, no shared state. The raid's Ashen Wyrm is untouched.

**Teaches:** holding a target (taunts), burns and cleanses, and scatter.

| Phase | HP | What changes |
|---|---|---|
| 1. The Road | 100-70% | The Wyrm lands on the road in the enemy Front column |
| 2. The Sky | 70-35% | It takes off: it counts as Back for 6s of every 20s (only ranged hits it then). **Ash Fall** starts |
| 3. The Last Cart | below 35% | The villagers' cart (a prop with its own HP, 30% of your tank's max HP) is behind your Back column. **Hunt the Cart** starts |

| Mechanic | When | Telegraph | Effect | Tap answer | Line-up answer | Role |
|---|---|---|---|---|---|---|
| **Talon** (heavy hit) | every 8s on the ground | PARRY, 1.5s | 4x attack; if not parried, the target is knocked back one column for 3s (the Front line breaks) | Parry | Shield Wall, Bash, ward; Grenna's Bedrock takes 25% less | tank, any tap |
| **Flame Breath** | every 13s | SCATTER, 1.8s, one **column** lit | 2.5x attack to each member in that column, and a burn of 3% max HP a second for 5s | Scatter: members step out of the lit column (a column holds at most 2) | A formation with at most one member per column where the breath lands (the sheet shows it favours the column with most members); Caedmon's aura makes the burn do nothing | formation |
| **Ash Fall** | phase 2+, every 18s | CLEANSE, embers on 2 portraits | **Smouldering**: a burn stacking every 2s (1% max HP a second a stack, up to 4) until cleansed. At High tide (Rising Water) it is halved (Damp) | Two Lantern touches | Anselm or Elowen L20, the Hymnal power, a Lightkeeper; Caedmon's immunity | support |
| **Hunt the Cart** | phase 3, every 12s | a blue "!" over the cart, 1.5s | The Wyrm dives the cart. If nothing pulls it, it deals 35% of the cart's HP. If the cart falls, the Wyrm gains +30% damage for the rest of the fight (a soft fail, not a loss) | Warden tap on the Wyrm, a Ranger focus plus a hit, a Lanternmage flash (a stun ends the dive) | Any taunt in the wind-up pulls it back; a tank in the Back column covers the cart | tank |

**Enrage, "The Fire Spreads"** (from 70s): burns no longer expire and Flame Breath comes every
8s.

**Counters:**

| Strong | Weak |
|---|---|
| Caedmon (burn immunity); taunting tanks (Tobin, Maren, Grenna); a cleanser; casters and ranged for the sky windows | A single column of melee; no taunt in phase 3 (the cart falls); burn-heavy parties: the Wyrm takes only 50% from burns |

### 4.4 The Climber (the Deepwell)

**Arena:** the bottom of the Deepwell, the `well` theme (task W6) with a cached overlay: the last
landing, worn steps rising out of view, and **Maud's Lantern** on its hook (a prop on the party's
side).

**Story:** Maud Tallow went down after the miners with the brightest lantern she had, and stayed
to keep it lit so the dark would stay down there (Deep Lore pages 5-10). The stair was worn by
something climbing it for a thousand years. It is still climbing. Its voice is the one the keeper
heard under the water and Caedmon heard in the fire. If Morwen is fielded, she says one line
about the name on the lantern (she is a Tallow too; the writer may drop this if it does not fit).

**Teaches:** everything at once, and keeping a light lit (a support fight).

**Maud's Lantern** has **Light** from 0 to 100, shown as a bar under the boss's HP bar. It starts
at 100.

| Light | Effect |
|---|---|
| 50+ | Normal |
| below 50 | Telegraph wind-ups are 20% shorter (never under 1.2s); the party deals 10% less |
| 0 | **Dark**: the party deals 30% less and the Climber heals 1% max HP a second until Light is back above 20 |

Light comes back three ways: a **Lantern touch on the lantern** (+15 Light; the lantern is a 64px
target on the portrait rail), each parry (+5), and each heal from a support on a member below 50%
HP (+1, at most +3 a second). So a Lightkeeper or a support-heavy party keeps it lit by playing
normally.

| Phase | HP | What changes |
|---|---|---|
| 1. The Stair | 100-70% | The Climber climbs into view (Front column). Grasping Hands start |
| 2. The Dark Floods | 70-35% | Light drains 1 a second. **Snuff** starts |
| 3. Maud's Light | below 35% | While Light is 50+, the lantern flares: the Climber takes +40% damage. Every mechanic runs |

| Mechanic | When | Telegraph | Effect | Tap answer | Line-up answer | Role |
|---|---|---|---|---|---|---|
| **Grasp** (heavy hit) | every 8s | PARRY, 1.5s | 4.5x attack on its target | Parry (+5 Light) | Shield Wall, Bash, ward | tank, any tap |
| **Grasping Hands** | every 15s | a blue "!" over 2 Back or Mid members, 1.5s | 2 Hand adds (3% HP each) rise under them and hold them: the held member cannot act for 4s or until the Hand dies | Tap a Hand to focus it (every class tap targets it) | AoE (Pip, Oriel, Morwen, a Lanternmage hero), peel (Kestrel, Thessaly) | caster, peel |
| **Snuff** | phase 2+, every 17s | INTERRUPT, 2.0s, the Climber reaches for the lantern | -30 Light | Tap the Climber in the channel | Any stun on the Climber (it is Front: Aldric and Grenna reach it) | stun |
| **Lightless** | phase 2+, every 14s | CLEANSE, a black drop on 1 portrait | That member cannot be healed or shielded for 6s, and loses 2% max HP a second | A Lantern touch | Anselm or Elowen L20, the Hymnal power, a Lightkeeper | support |
| **Many-Handed Swipe** | phase 3, every 12s | SWAP, stack pips on the target | Each Grasp on the same target adds a stack; at 3 the target is Crushed (3s, takes x1.5) | Step back at 2 stacks | A second taunter | two tanks |

**Enrage, "The Lantern Gutters"** (from 70s): Light drains 3 a second and Grasp comes every 5s.

**Counters:**

| Strong | Weak |
|---|---|
| A Lightkeeper hero or two supports (Light and cleanses); a stunner that reaches Front (Aldric, Grenna); an AoE caster for the Hands; a second taunter for phase 3 | Glass cannons (the Hands and Lightless stall them); no support (Light runs out in phase 2) |

### 4.5 How each boss covers Stage C

| Stage C mechanic | King | Lurelight | First Fire | Climber |
|---|---|---|---|---|
| Heavy hit and parry | Royal Decree | Swallow | Talon | Grasp |
| Row or lane attack | - | Riptide (lane) | Flame Breath (column) | - |
| Dive | The King's Blade | - | Hunt the Cart | Grasping Hands |
| Heals and channels | Kneel (channel) | Lure Song (channel) | - | Snuff (channel), heals in the Dark |
| Adds | Courtiers, the assassin | the Lure add | - | Hands |
| Tide | Rising Water only | its own fast tide | Rising Water only | Rising Water only |
| Taunt swap | Weight of the Crown | - | (taunts for the cart) | Many-Handed Swipe |
| Cleanse | - | Brine Rot | Ash Fall | Lightless |
| Scatter | - | Riptide | Flame Breath | - |
| Answers needed | parry, interrupt, peel, swap | parry, interrupt, cleanse, scatter | parry, scatter, cleanse, taunt | parry, interrupt, cleanse, swap, keep the Light |

---

## 5. Line-ups

### 5.1 No one is required

The class is fixed (party spec 2.1), so every boss must be winnable by every class with the roster
a day-35 save has: the 10 Commons and Rares, most Epics, and Elowen (day 15-17). Caedmon, Corvin
and Morwen add lines and immunities. None of them is ever required.

Sample line-ups that the sim checks (target PN7). Hero first, then 3 companions:

| Boss | Warden | Lanternmage | Ranger | Lightkeeper |
|---|---|---|---|---|
| King | Warden, Maren, Oriel, Wren (two tanks, a ranged stun) | Lanternmage, Tobin, Aldric, Anselm (flash stuns, two tanks) | Ranger, Maren, Kestrel, Oriel (peel, ranged stun) | Lightkeeper, Tobin, Grenna, Oriel |
| Lurelight | Warden (Tidefast), Anselm, Oriel, Wren | Lanternmage, Maren (Tidefast), Elowen, Thessaly | Ranger, Tobin (Tidefast), Anselm, Oriel | Lightkeeper, Grenna, Wren, Thessaly |
| First Fire | Warden, Tobin, Anselm, Oriel | Lanternmage, Maren, Elowen, Wren | Ranger, Grenna, Tobin, Anselm | Lightkeeper, Maren, Tobin, Kestrel |
| Climber | Warden, Aldric, Elowen, Pip | Lanternmage, Grenna, Anselm, Hesketh | Ranger, Aldric, Elowen, Maren | Lightkeeper, Grenna, Tobin, Morwen (or Pip) |

### 5.2 What each role does in a pinnacle

| Role | Job here |
|---|---|
| Tank | Takes the heavy hit, taunts divers back, and swaps with a second tank |
| Striker | Kills adds that hold or dive (the Blade, the Lure add, Hands), bursts the phase 3 windows |
| Caster | Stuns channels from range, clears Hands and courtiers with AoE |
| Support | Cleanses, heals through missed answers, keeps Maud's Lantern lit |

### 5.3 The boss sheet's line-up tools

- **Saved line-up per boss** (`S.pin.lu[boss] = { field, cells }`), like the Tide Chart
  (region-2.md 3.5). Opening the fight fields it (except members away on expeditions; `autoField`
  fills gaps and says so).
- **Best line-up** calls the planner (task AF, `56d-autofield.js`) with the boss's needs as tags,
  from `PIN[boss].needs`, for example `{ taunts: 2, stun: 'back', cleanse: 1, peel: 1 }`. The
  planner's one-line reason reads like "Two tanks for the crown, Oriel stuns Kneel".
- **Counter chips** on the sheet: one per mechanic you have seen, green when your line-up answers
  it idle, grey when only a tap will ("Kneel: Oriel stuns it" / "Kneel: tap the King").
- A **Scatter preview**: a 3x2 grid of your formation with the cells each Scatter mechanic strikes.

---

## 6. Difficulty

### 6.1 Anchors and suggested power

Each boss is anchored to a zone. Its HP and attack use that zone's numbers (3.1). The sheet shows
"Suggested: your party holds zone 78" from `partyHoldEstimate`, and a hold line like the Oath
sheet's (green: you should win with good play; amber: close; red: not yet).

| Boss | Anchor zone | Suggested order | Its hardest part |
|---|---|---|---|
| The Hollow King | 74 | 1st | Kneel with no stun |
| The Lurelight | 78 | 2nd | Brine Rot and Riptide at High tide |
| The First Fire | 82 | 3rd | Flame Breath plus Ash Fall |
| The Climber | 86 | 4th | everything, with Light draining |

Zones past 70 are real content until Region 3 (region-2.md 2.1). The anchors are `PIN_TUNE`
numbers; the sim retunes them against PN2.

### 6.2 Vows ("pick your pressure")

A pinnacle takes the Oath sheet's Vows (oaths.md 2.2). The **Vow level** (0 to 30) is the same
sum. What each Vow means in a pinnacle:

| Vow | In a pinnacle |
|---|---|
| Hardened | Boss and adds +35% HP a rank |
| Fierce | Boss and adds +30% damage a rank |
| Restless | Mechanics come 10% more often a rank (wind-ups never under 1.2s) |
| Elders Stir | Rank 1: adds are elites (x2 HP). Rank 2: plus one extra heavy hit per phase change |
| Bitter Water | Party healing and shields -20% a rank |
| Short Wick | Timer -8s a rank (90 to 74). The enrage starts 20s before the end |
| Rising Water | The fight tide (20s High, 20s Low); the Lurelight's High tide lasts 20s of 30 |
| Choir of the Dark | A healer add each phase (a Marsh Wraith, or a Brine Witch on the Lurelight) |
| No Rest | Downed members stand up only at phase 3, not at every phase change |
| One Circle | Every fielded companion shares one circle |
| Unlit Lamp | Your hero ability does not auto-cast; its cooldown is 30% longer |
| Thin Line | You field 2 companions, not 3 |

- **Cap:** the same swearable cap as Oaths, `max(6, S.oath.maxL + 4)`. Since the unlock needs Oath
  15 kept, a new player can add up to 19.
- Pinnacle kills do **not** raise `S.oath.maxL`. The two ladders stay separate, so pinnacles never
  change Oath rewards.
- The sheet remembers the last Vows per boss (`S.pin.vows[boss]`). The Oath presets (I to X) are
  there as chips.

---

## 7. Rewards

### 7.1 Per kill

| Reward | First kill of this boss | Every kill |
|---|---|---|
| **Pinnacle power** (7.2) | Learned into the Lantern Book at **rank III** | 1 Echo of it (3 Echoes a rank, under the legendaries.md 2.2 Echo cap: one band above your highest Oath kept) |
| **Rank V legendary roll** | Rolls too | `legendDrop(5, 'pin')`: chance `2% + 0.1% x V` (V = Vow level) plus **pity** +0.5% a miss, shared across the four bosses, reset on a drop. The power follows the legendaries.md 2.1 rule (60% your class, unknown powers count double) |
| Trophies | 5, the kinds you hold fewest of | 2 (+1 at Vow 10+, +1 at 20+) |
| Lantern Pearls (tier 5) | 5 | 2 (+1 per 10 Vow levels) |
| Title | The boss's title (7.3) | - |
| Cosmetic | The boss's lantern colour (7.3) | Higher Vow levels unlock more (7.3) |
| Best time | Recorded | A new best per Vow level: a `high` toast "New best: 1:04 at Vow 12" |
| Story | The boss's kill card (3-5 sentences, one tap) | - |

- A rank V drop "sets the rank directly and keeps the Echoes" (legendaries.md 2.2), so it can pass
  the Echo cap. The chance is low on purpose. Target PN8 is about one rank V drop a week for a
  player who fights 3 to 5 pinnacles a day.
- Everything here goes into systems with caps: the legendary build cap (+70% at all rank V,
  legendaries.md 6, which now counts the 4 pinnacle powers), Trophies and Pearls (gear tiers,
  settings, inscriptions). Pinnacles add no new stat and no new currency.

### 7.2 The four pinnacle powers

Hero powers that fit **any class**, on any hero position (weapon, off-hand, head, body). They count
toward the hero's limit of 2 (legendaries.md 2.3). They drop only from their boss.

| Id | Power | Boss | Rank I (V) | p1 / p5 | Wiring |
|---|---|---|---|---|---|
| `nokneel` | **Crown of No One** | King | Your party ignores the first stun, bind, charm or kneel every 20s (12s). Each one ignored gives the party +5% (+10%) damage for 4s | 5 / 10% | CC hook in 59-combat (`cbStun` on a party unit, binds, charms) |
| `lurebreak` | **Lurebreaker's Hook** | Lurelight | Every interrupt and cleanse by anyone in the party heals the party 3% (6%) max HP and takes 1s off your hero ability | 5 / 10% | `telegraphResolve` (interrupt), cleanse hook |
| `onehour` | **One More Hour** | First Fire | Once per boss fight, when your party would wipe, every member stands at 30% (60%) HP and the boss timer gains 5s (10s) | 4 / 8% | wipe hook in 59-combat |
| `maudlamp` | **Maud's Lantern** | Climber | Wind-ups show 0.3s (0.5s) earlier and your parry window grows by the same. Each parry gives the party +2% (+4%) damage for 6s, stacking 3 times | 6 / 12% | `ENEMY_TUNE` parry window via `bonus('lg:maudlamp')`, `telegraphResolve` |

The powers are useful everywhere (zone bosses, Oath elders, the Keeper, the Deepwell), not only in
pinnacles. They are data rows in `21c-data-legend.js` (L1), with `fits: 'hero'` and no class. The
Codex Legendaries page grows from 39 to 43 powers.

### 7.3 Titles and cosmetics (no power)

| Boss | First kill: title and lantern colour | Vow 10: hero trail | Vow 20: camp trophy | Vow 30: title |
|---|---|---|---|---|
| King | "the Unkneeling" · Crown Violet | Curtain Motes | The Hollow Crown (on a post by the Hearth) | "Uncrowned" |
| Lurelight | "Lurebreaker" · Deep Green, the colour of the lure, turned to your side | Sea Spray | The Lure Lamp (hangs at the camp gate) | "the Undrowned" |
| First Fire | "Held the Road" · Emberlea Red | Cinders | A Wyrm Scale (a shield on the Hearth wall) | "the Hour Kept" |
| Climber | "Maud's Heir" · Well Gold | Lantern Dust | Maud's Hook (a lantern hook by the Well) | "the Light Below" |

- All four first kills: title **"Pinnacle"**. All four at Vow 20: **"Lampbearer of the Four"**.
  All four at Vow 30: **"Against the Dark"**.
- Lantern colours and trails use the Deepwell cosmetic slots (`S.deep.eq` style; the stage owner
  draws them, task CD). Camp trophies are camp decorations (task CD). The Codex Wardrobe page
  counts them (+16).
- **Pinnacle frame:** your portrait in the header gets a thin frame for your best all-four Vow
  level: bronze 10, silver 20, gold 30. A switch in the hero sheet turns it off.

### 7.4 Codex page 15: Pinnacles

| Entries | Light each | Total |
|---|---|---|
| 4 first kills | 10 | 40 |
| 4 bosses x 5 Vow bands (kills at Vow 1+, 6+, 11+, 16+, 21+) | 2 | 40 |
| 4 kill cards read, plus the last card "The Voice" (after all four) | 2 | 10 |
| **Page total** | | **90** |

Derived from `S.pin.first`, `S.pin.top` and `S.pin.seen`. The Page Seal title is "Lampbearer",
with no power bonus (the Codex caps are unchanged). The Seals page gets a third row, **Pinnacle
Seals** (7.5), up to 52, 1 Light each.

### 7.5 Boss of the Week

A weekly highlight, never a lockout and never power.

- **Which boss:** `deviceWeek() % 4` picks one, in the order King, Lurelight, First Fire, Climber
  (same device-date rule as the Deepwell Trial and the Tavern).
- **The Week's Oath:** a fixed set of Vows at level 10 to 14, seeded by the week number from a bag
  of 8 sets (each a small puzzle, for example "Thin Line + Short Wick 1 + Fierce 2" or "One Circle
  + Rising Water + Hardened 2"). Everyone gets the same set that week. It ignores the swearable cap
  (it is at most 14, and the unlock needs Oath 15).
- **The reward:** the first kill at the Week's Oath gives a **Pinnacle Seal** (the Codex Seals
  page, any week counts, 1 Light) and a stamp on the boss tile. The week's best time shows on the
  tile. That is all.
- **What it does not do:** no extra drops, no extra rank V chance, no weekly cosmetic you can
  only get that week. Missing a week costs nothing (Seals count any week, codex.md 1).
- The Almanac weekly board gains one goal kind: "Beat the Boss of the Week" (a stamp toward the
  Almanac's own weekly goals; almanac.md rules).

---

## 8. UI on a 360px phone

### 8.1 Where it lives

- **Fight > Bestiary**, a new section at the top: **Pinnacles** (`registerSection('adv', { id:
  'pinnacles', view: 'bestiary', feature: 'pinnacles' })`). The Fight tab already has 4 views, so
  no new view. Bosses belong with the foe records. The card is a 2x2 grid of boss tiles (each
  at least 150 x 96px): the portrait, the name, best Vow and time, a lock or a green hold dot, and a
  "This week" ribbon on the Boss of the Week.
- **Next Up** goals: "The Hollow King: your party can win now", "Boss of the Week: the Lurelight".
- **The Lantern Road** (task RD) shows the four bosses as marks off the road. Tapping one opens its
  sheet.
- Before the unlock, the section shows one line: "Pinnacles: beat the Drowned Keeper and keep an
  Oath of 15" with the two parts ticked as you do them (from `coastLit()` and `S.oath.maxL`).

### 8.2 The boss sheet (90% bottom sheet)

```
The Hollow King                          Best: Vow 12 · 1:04     [x]
[portrait 96px]  "Something still holds court behind the curtain."
Suggested: holds zone 74 · Your party: holds (green)
-----------------------------------------------------------------
Mechanics you have seen           (unseen ones show "?")
[PARRY] Royal Decree      Warden's Shield Wall      (green)
[~] Kneel                 Oriel stuns it            (green)
[!] The King's Blade      tap the assassin          (grey)
[crown] Weight of the Crown  Maren taunts            (green)
-----------------------------------------------------------------
Line-up  [Saved]  [Best line-up]  [Edit]    Scatter grid (if any)
Vows     [0][I][II][III]...  Vow 12 of 19            (Oath sheet rows)
[ Practice phase 2 ] [ Practice phase 3 ]              40px
[ Fight ]                                              48px, full width
```

- Mechanic rows are 48px, each with its answer chip. The Vow rows reuse the Oath sheet's row
  builder (a small export from `75-oaths-ui.js`).
- The sheet opens in under 150 ms (target PN10): the boss portrait is prebaked (8.5).

### 8.3 The encounter (full screen)

The encounter takes the whole app in portrait: the header, control row, Next Up chip and tab bar
hide (a `pin` class on the app root), and the stage box grows to the full height (62-stage already
re-lays out on resize). No menu can open during it. Toasts are held until it ends (except a `high`
legendary drop, shown after the win).

```
+--------------------------------------------------------------+  360 x 740
| The Hollow King   (o)(o)( )   ##########------   1:12  [Leave]|  44px top bar: name, phase pips,
|                                                               |  HP bar (full width, 10px), timer
|        [   INTERRUPT   ~   Kneel   ======|==   ]              |  40px telegraph banner, centred;
|                                                               |  the bar shows the wind-up, the
|                                                               |  parry window lit in gold
|                    (boss, 3x, the upper half)                 |
|                    tap anywhere in this area =                |  boss tap area: the whole stage
|                    the class tap on the boss                  |  above the party (at least 300px)
|                                                               |
|   party sprites on the left, adds on the right                |
|---------------------------------------------------------------|
| [Hero 64] [Comp 64] [Comp 64] [Comp 64]   flames: * *         |  96px portrait rail: HP bar,
|  HP ####   HP ###    HP #####   HP ##      (touch charges)    |  shield segment, debuff icons,
|                                                               |  stack pips; tap = Lantern touch
| [ SCATTER 72 ]                         [ Ability 72 ]         |  72px buttons; Scatter is dim
+--------------------------------------------------------------+  until a Scatter telegraph
```

- **Tap targets:** the boss area is most of the stage. Portraits are 64 x 80px. Scatter and the
  ability button are 72px. The Climber's lantern is a 64px button at the right end of the rail.
  Nothing on the stage needs a precise tap on a small sprite: adds that need a tap (the Blade's
  assassin, Hands) get a 56px hit ring while they need one.
- **Readable telegraphs:** one banner, one word, one shape, one colour (3.2), and the shape also
  appears over the boss or the portrait. The wind-up bar fills left to right; the parry window is
  the last lit segment. A rising tone plays (existing audio), different per answer kind.
- **Colour choices** for the answers: red (parry), purple (interrupt), teal (cleanse), gold (swap),
  orange (scatter). The words and shapes carry the meaning, so colour is never the only cue.
- **Landscape and wide screens:** the stage on the left, the rail as a column on the right (the
  layout.md split), the banner over the stage.
- **Reduced motion:** no shake, no rings, no sweeps; the boss does not lunge. Banners appear
  without sliding; wind-ups show only as the bar. Scatter moves are instant swaps (party spec 7.5).
  The ash layer is off.
- **Win and fail cards** use the joining-moment style: time, Vow level, rewards list (win), or the
  one-line lesson and three buttons (fail).

### 8.4 Hints and onboarding

- `FEATURES` row `pinnacles` (55-onboard): unlocks with the rule in section 1. One guide step on
  unlock: "Four great foes wait off the road. Fight > Bestiary > Pinnacles."
- The first time you enter any pinnacle, a 3-card tip overlay (skippable): the banner, the portrait
  rail (Lantern touch), and "Missing costs time, not progress."

### 8.5 Art needs (B1, minimal)

| Piece | Owner file | Notes |
|---|---|---|
| The Hollow King | `src/js/13c-art-pinnacle.js` | Character kit (like the Keeper), 2x: long coat, high collar, a crown floating over an empty hood (no face). Poses: idle0, idle1, wind, strike, channel (the wind pose with raised hand) |
| The Lurelight | same | New rig, about 40 x 32: a wide head and jaw rising from the water band, a stalk with the lure (a green glow material, gold after the kill on rematches). Only the upper half is drawn at High tide |
| The First Fire | same | The existing wyrm rig (`ENEMY_RIGS.wyrm`) with a new palette object defined in this file (young: smaller horns, red-orange scales, a white-hot throat glow). `WYRM_GENS` and the raid are not changed |
| The Climber | same | New rig, about 32 x 44: pale, thin, too many long arms, a head bowed like it is still climbing. The Hands reuse one arm as a small add sprite |
| Props | same | Maud's Lantern on its hook (16 x 20, glow material), the villagers' cart (24 x 14), the curtain (drawn in the arena overlay) |
| Arena overlays | same file (painters), registered via `registerTheme` variants in `63-scenery.js` | `court` (barrow + throne, curtain, kneeling stone courtiers), `reefNight` (lighthouse dark, green glow), `emberRoad` (forest recoloured to fire, cached), `wellBottom` (well + last landing, stair) |
| Icons | same | 5 answer glyphs (12 x 12: "!", "~", drop, crown, double arrow), 4 power icons (recoloured existing specs, L5 style), 4 boss tile portraits (the rigs' idle frame, baked) |

No new character art. The rigs follow the enemy baking path: lazy bake, prewarmed with `idleTask`
when the boss sheet opens.

---

## 9. Balance targets (tools/sim.mjs)

New flags: `--pin auto|off` (auto: from the unlock, at each evening check-in the sim fights the
lowest unbeaten boss its party holds, using `PIN[boss].needs` with the planner, at Vow 0; after
all four are beaten it raises the Vow level of the Boss of the Week by 2 per win), `--pintap
idle|good|perfect` (idle: no taps and no touches, only line-up answers; good: answers 70% of
telegraphs, parries 60% of heavy hits, touches within 1.5s; perfect: every answer), and a harness
`--pinfight <boss> --power <zone> --lineup a,b,c` that runs 50 seeded attempts and prints the win
rate, the median time and the cost of each mechanic.

| Id | Target | Band |
|---|---|---|
| PN1 | Unlock (Keeper + Oath 15 kept), `--oath auto` | day 33-40 |
| PN2 | First kills, `--pintap good`, every class | King day 35-43, Lurelight 41-49, First Fire 47-55, Climber 53-62: a new pinnacle about every 6 days (goal G1) |
| PN3 | Idle first kills (`--pintap idle`, the counter line-up) | at most 8 days after `good` for each boss |
| PN4 | Skill matters, within reason: `perfect` vs `good` | 2-4 days earlier |
| PN5 | Tension at first-kill power, `good` | winning time 65-85s of 90; at +2 zones of power: 45-65s |
| PN6 | Every mechanic is real: with its answer removed (`--pinignore <id>`), win rate at first-kill power | below 30% (each mechanic matters) |
| PN7 | Line-ups: the section 5.1 samples | each wins at first-kill power +1 zone with `good`; for each boss at least 3 line-ups differing by 2+ members win; each class's first kill within 0.85-1.15x the median day |
| PN8 | Rank V drops, `--pin auto` with 3-5 kills a day after all four | about 1 a week (0.6-1.5); the L3 caps hold at every point |
| PN9 | P4 after the Keeper, to day 60 (a first kill and a new Vow band count as meaningful) | at most 3 empty check-ins in a row, every class |
| PN10 | Performance (phone, x4 CPU) | encounter frame gap p95 inside the fight budget (34 ms) and at most +1 ms JS per frame over a normal boss fight; entering the encounter and each phase change with no long task over 50 ms; the boss sheet opens under 150 ms |
| PN11 | Fairness caps (3.4) | check.mjs asserts every mechanic's damage and stun caps from the data |

Knobs: `PIN_TUNE` in `21d-data-pinnacle.js`: `hp` 2.4, `atk` 3.5, `timer` 90, `enrageAt` 70,
`phases` [0.7, 0.35], `anchor` { king 74, lure 78, fire 82, below 86 }, `touchCharges` 2,
`touchBack` 5, `gap` 1.0, `windMin` 1.2, `lgBase` 0.02, `lgPer` 0.001, `pity` 0.005, `echo` 1,
`firstRank` 3, rewards per kill, and each mechanic's cadence, wind-up, multiplier and cap in
`PIN[boss].mech`.

---

## 10. Save state

```js
registerState('pin', {
  v: 1,
  open: 0,        // time the pinnacles unlocked (0 = locked); the unlock toast plays once
  at: 0,          // start time of a live attempt (0 = none); cleared on load
  seen: {},       // boss -> bitmask: 1 intro card, 2 kill card, 4 phase 2 seen (Practice), 8 phase 3 seen
  mech: {},       // mechanic id -> 1 once seen (sheet rows and first-use hints)
  first: {},      // boss -> time of the first kill
  kills: {},      // boss -> kill count
  top: {},        // boss -> highest Vow level killed
  best: {},       // boss -> { [vowLevel]: ms }  best time per Vow level (only levels killed)
  vows: {},       // boss -> last Vow set { hard: 2, ... }
  lu: {},         // boss -> saved line-up { field: [ids], cells }
  pity: 0,        // rank V pity in percent points (shared)
  wk: { w: 0, done: 0, best: 0 },  // Boss of the Week: week number, Week's Oath kept, best ms
  seals: 0,       // Pinnacle Seals earned (one per week at most; Codex Seals row)
  frame: 1,       // show the pinnacle portrait frame
  tries: 0, wins: 0, fails: {}     // stats; fails: mechanic id -> times it was the fail reason
});
```

- Every field is new. Nothing existing is renamed or repurposed. Old saves merge the defaults.
- Pinnacle powers live in `S.legend.book` and `S.legend.echo` like every power (new ids only).
- Cosmetics: lantern colours and trails join the cosmetic list the stage reads (the key shape the
  Deepwell uses for `S.deep.cos`); PB1 records them in `S.pin` if the shared list is not generic
  yet, with `cos: {}` added then.
- `best` stays small: at most 31 numbers a boss.
- No online data. No leaderboard: best times are local (as Oaths, oaths.md 3.1).

---

## 11. Performance notes

- **One big sprite, baked once.** Each boss rig bakes its frames lazily and is prewarmed with
  `idleTask` when its sheet opens. The first bake must stay under 40 ms on the phone; the four rigs
  are never baked at load.
- **Arenas are cached plates.** Each overlay is painted once into the scene plate (PERF3's 1:1
  plates). The ember recolour and the night variant are cached variants, like the coast's relit
  lamps. The ash layer is at most 12 particles, drawn as 1-2px rects.
- **Telegraphs draw with a few primitives:** the ring, one line or a cell highlight, and the glyph
  from a cached icon. The banner is DOM, written only on `telegraphStart` and `telegraphResolve`
  and with `putStyle` for the bar width (4 times a second), never rebuilt.
- **The portrait rail** is built once on entry. HP bars use transforms (PERF2 rule); debuff icons
  and stack pips toggle with `putHidden`/`putText`.
- **No per-tick allocation:** mechanics are a fixed array of timers per boss; event payloads are
  reused (the Stage C rule).
- **Phase changes** swap no plates and bake nothing (everything for all three phases is baked
  before the fight starts), so they cannot cause a long task.
- **Leaving** restores the stage and the scene without a rebuild: the front's scene plate stays
  cached during the attempt.
- `tools/perf.mjs` gains a pinnacle scenario: open the King's sheet, enter, 30s of fighting with
  scripted taps, a phase change, leave. Budget PN10.

---

## 12. Stage C hooks this needs

Checked against the Stage C work in progress (`59-combat.js`, `59b-enemies.js`, 2026-09-28):

| Need | What exists | Small edit |
|---|---|---|
| A boss with adds in an arena | `cbArena(m)` adopts one Deepwell foe; `cbSpawn(boss)`; boss adds exist (Elder Rattlebones) | `59-combat.js`: `cbArenaPack(foes)` to start an arena with a boss and its adds, and `cbAddFoe(f)` for adds mid-fight |
| Pinnacle mechanics on the boss | `onEnemyTick(f, dt)` in 59b drives boss telegraphs | `59b-enemies.js`: one line: `if (f.pin) return pinEnemyTick(f, dt)` (59f owns the rest) |
| Telegraph kinds and results | `TELE` (one kept telegraph), `telegraphStart { kind, dur, target, foe }`, `telegraphResolve { kind, result, by }`, `resolveParry('tap'|'bash'|'wall')`; heal channels are interrupted by a tap or a stun | `59b-enemies.js`: accept kinds `kneel`, `song`, `snuff` (channels, like `heal`), `scatter`, `swap`, `cleanse`; results `cleanse`, `scatter`, `swap`; sources `touch` and `scatter` in `resolveParry` |
| Debuffs on units and cleanse | poison (`poisonT`, `poisonDps`) and a private `cleanse(u)`; Anselm and Elowen cleanse at L20 | `59-combat.js`: export `cbCleanse(u)` and a general `cbDebuff(u, id, { dps, healX, noHeal, secs, stack })` that the existing cleanse clears |
| Moving members (scatter, charm, knockback) | reach and cells exist; region-2 Undertow drags a member to Front (R2-2) | `59-combat.js`: `cbMove(u, cell, secs)` (shared with R2-2's Undertow; whoever lands first adds it) |
| Stuns and binds on party members (Kneel, Crown of No One) | `cbStun(f)` for foes | `59-combat.js`: `cbStunUnit(u, secs)` with a hook for `lg:nokneel` |
| Wipe hook (One More Hour) | `wipe` event after the fact | `59-combat.js`: a `beforeWipe` check that may cancel it once |
| Taunts and threat | `cbTaunt(u, foes, secs)`, threat tables, Warden taps | none: "step back" is threat x0.5 for 3s through the existing table |
| Counters for the fail line | `CB_STATS` | 59f keeps its own per-attempt counters |

C4 (combat visuals) draws the stage side: the ring, cell highlights and the new glyph colours
(purple, teal, gold, orange) beside its red, blue, green and grey. 75-pinnacle-ui draws the banner
and the rail.

---

## 13. Build plan (plan 2, wave 4)

Every task runs `node tools/build.mjs`, `node tools/check.mjs` and `node tools/perf.mjs --quick`
before finishing; per-frame and per-tick work stays cheap.

| Task | Owns | Small edits in | Depends on |
|---|---|---|---|
| **PB0** Data: `PIN` (4 bosses: anchors, phases, mechanics with cadence, wind-up, multipliers, caps, answers, `needs`), `PIN_TUNE`, the Week's Oath bag, cosmetics and titles | `src/js/21d-data-pinnacle.js` (data only) | `src/js/21c-data-legend.js` (4 power rows, `fits: 'hero'`) | L1 |
| **PB1** Core: state, unlock, attempts (enter, leave, credit `awayGains`), the scheduler and 17 mechanics, Maud's Light, the cart, Vows, the fight tide, rewards (`legendDrop(5, 'pin')`, Echoes, pity, Trophies, Pearls), best times, the Boss of the Week, the fail lesson, goals, the 4 power effects | `src/js/59f-pinnacle.js` | `59-combat.js` and `59b-enemies.js` (section 12), `src/js/55-onboard.js` (`FEATURES` row), `src/js/56d-autofield.js` (accept `needs` tags), `src/js/57c-codex.js` (page 15, the Seals row, Wardrobe +16), `src/js/55-almanac.js` (one weekly goal kind) | Stage C, R0, R2-2, O1, L2, L3, AF |
| **PB2** UI: the Pinnacles section, the boss sheet, the full-screen encounter (top bar, banner, rail, Scatter, Leave), win and fail cards, tips, reduced motion, landscape | `src/js/75-pinnacle-ui.js`, `src/styles/60-pinnacle.css` | `src/js/70-ui.js` (a `pin` mode on the app root that hides the chrome), `src/js/62-stage.js` (hide the normal HUD in `pin` mode; stage-side telegraph shapes if C4 has not added them), `src/js/75-oaths-ui.js` (export the Vow row builder) | PB1, O2 |
| **PB3** Art: 4 rigs, props, 4 arena painters, icons, tile portraits | `src/js/13c-art-pinnacle.js` | `src/js/63-scenery.js` (`registerTheme` variants) | R2-5 (`lighthouse`), W6 (`well`) |
| **PB4** Writing: 4 intro cards, 4 kill cards, "The Voice" (the last card after all four, pointing to the Emberwaste), boss lines (Corvin, Caedmon, Morwen), 17 first-use hints, fail lessons, titles | `src/js/21e-stories-pinnacle.js` (data) | - | - |
| **PB5** Sim and checks: `--pin`, `--pintap`, `--pinfight`, `--pinignore`, PN1-PN11, the perf scenario | `tools/sim.mjs` | `tools/check.mjs` (caps, save round trip, Vow cap, `S.pin.at` cleared on load, dps unchanged at load on every fixture), `tools/perf.mjs` (scenario) | PB1 |

Order: PB0 and PB4 any time; PB3 once the themes exist; PB1 after Stage C, the Oaths and the
legend core; PB2 after PB1; PB5 last, and it retunes `PIN_TUNE` and the anchors.

Plan-2 wave 4 named three files (`59f`, `75-pinnacle-ui`, `13c-art-pinnacle`). This spec adds two
data files (`21d-data-pinnacle.js`, `21e-stories-pinnacle.js`) so data, writing and code can run in
parallel, as on the coast.

---

## 14. Open questions for the owner

1. **Pinnacle kills are live only.** They are never credited while you are away and never
   auto-attempted, unlike Oath elders (1 per 20 minutes away). Rank V powers still come idle from
   high Oaths. Recommended: **yes, live only**. Pinnacles are the game's active moment, and
   crediting them offline would make the fights optional in the wrong way.
2. **An Assist setting for timing.** A switch on the boss sheet that makes every wind-up 1.5x
   longer (and the parry window with it), for players who find the timing hard. Kills with Assist
   earn every reward; best times get a small lantern mark. Recommended: **yes, with full rewards**.
   It is fair to everyone, costs one multiplier, and nobody loses anything by it.
3. **The Boss of the Week pays only a Seal and a stamp** (Codex Light and bragging), with no extra
   drops, even though a bonus would bring players back weekly. Recommended: **Seal only**. It keeps
   "fair, no FOMO power": a player who misses a week loses nothing that counts.
