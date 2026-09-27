# Party and classes

Status: design spec for ROADMAP Phase 1. Written 2026-09-27, revision 2 after owner review
the same day. All numbers are starting values for `tools/sim.mjs` to tune; the ratios and
rules are the design.

Revision 2 owner decisions (these override anything below and in ROADMAP):
- The hero class is chosen once, at character creation. No free switching. A rare consumable,
  the Mirror of Embers, allows a change late in the game.
- Companions are named characters with a bio, a speciality and a signature ability.
- Synergies between characters make line-ups play differently.
- A Party tab exists; Raid and Tavern merge into one World tab.
- Characters grow through use: only fielded characters earn XP (catch-up bonus, milestone
  unlocks); promotions are gated by level caps.
- Roles define combat: threat and aggro, healers heal and do not deal damage, casters control,
  strikers finish off targets, enemy behaviours test composition, and each class taps differently.
- Formation matters: Front/Mid/Back rows with reach rules on both sides, a formation editor, and
  movement on the stage that shows it.
- Kept from revision 1: packs of 3, auto-cast at half rate, wipe retreats one zone.

Owner constraints this spec obeys: no prestige or resets, single-player first, idle most of
the time with active moments, playable on a 360px phone, Play Store possible later.

---

## 1. Fantasy and loop

**Fantasy:** you are one lantern-bearer, chosen at the start, gathering a small warband of
people with names and histories. You pick who stands beside you and which of them fight well
together. You watch them hold a line, and step in at the moments that matter.

**Idle check-in (30 to 90 seconds, several times a day)**

1. Open the game. "While you were away" card: gold, essence, companion levels gained.
2. Spend: promote a companion who hit their level cap, recruit a new face, forge one item.
3. Glance at the party: if the Fight tab shows "Party can push", tap Push.
4. Close. The party keeps fighting at the highest zone it can hold.

**Active session (5 to 15 minutes)**

1. Push the zone boss. Boss wind-ups show a red "!" and a ring on the boss. Tap the boss inside
   the window to parry.
2. Fire the hero ability on its button at the right moment (Shield Wall before a heavy hit,
   Lantern Flare into a fresh pack, Rally Hymn when the tank is low).
3. Against a boss that walled you, try a different line-up of companions to find a synergy
   that answers it (section 3.5).

Active play is worth about 1.3x idle progress speed at the push zone (see Balance targets).
Missing everything costs time, never progress.

---

## 2. Hero classes

### 2.1 Choosing a class

- **New games** open on a character-creation screen: name the hero (1-16 characters, default
  "Wanderer", stored in the existing `S.name`), pick one of 4 class cards, tap "Begin". Each card
  shows the class sprite, role, a one-line pitch, the ability and the starting companion. After
  "Begin", the starter's joining moment plays (3.1).
- **Existing saves** get a one-time "Choose your path" screen when the update loads. Warden is
  preselected (it matches today's sword hero), so one tap keeps things as they are.
- The class is permanent. **Mirror of Embers** is the only way to change it: a consumable that
  drops from zone bosses from zone 36 (Region 2) at 2% per boss kill, or can be bought once
  per raid generation for 400 Embers. Using it reopens the class picker; gear, levels and
  upgrades all carry over. Stored as `S.party.mirrors` (count).
- One hero, one loadout. The hero keeps one level, one set of gear and one set of hero
  upgrades (Blade, Swiftness, Fortune). Revision 1's question about per-class loadouts is
  dropped because the class no longer changes day to day.

Hero base values (from existing formulas): `heroAtk()`, `aps()`, `critChance()`, `critMult()`.
Hero power `hp0 = heroAtk() * aps()`.

| Class | Pitch | Role | HP | ATK | Armour | Passive | Aura (companions of that role) | Also |
|---|---|---|---|---|---|---|---|---|
| Warden | "Stand in front. Nothing gets past." | tank (front) | 12 x hp0 | x0.8 | +30 | Threat x6; every pack starts on the Warden; taps taunt | Tanks: +40% HP, +20 armour | Party takes 10% less damage |
| Lanternmage | "Burn the whole pack at once." | caster (back) | 4 x hp0 | x1.0, hits all | 0 | Attacks splash 50% to every other enemy; taps plant Embers that Lantern Flare detonates | Casters: +30% ATK | Overkill carries to the next enemy |
| Ranger | "Find the weak spot. Hit it hard." | striker (mid) | 5 x hp0 | x1.1 | 0 | +10% crit chance, +1.0 crit multiplier; taps set the focus target | Strikers: +10% crit chance, +50% crit damage | Taps deal +50% |
| Chaplain | "Keep them standing." | support (back) | 6 x hp0 | x0.2 (smite only) | +10 | Heals lowest-HP ally for 1.2 x hp0 per second; taps direct heals and wards | Supports: +40% healing | *Blessing*: all companions +20% damage; companion cooldowns -25% |

Because the class is fixed, every class must be able to field a full working party: the roster
has at least 2 characters per role, so a Ranger can still bring a tank and a healer.

### 2.2 Hero abilities (one per class, tap button on the stage)

| Ability | Effect | Cooldown | Auto-cast (idle) |
|---|---|---|---|
| Shield Wall | 6s: party takes 60% less damage; the next boss heavy hit in the window is blocked fully (counts as a parry) | 30s | fires when front member < 50% HP |
| Lantern Flare | Instant 20 x heroAtk to every enemy, then burn 1 x heroAtk per second for 5s | 25s | fires when a new pack spawns |
| Volley | 10 arrows over 2s, each 3 x heroAtk at random enemies, can crit; strikers +50% attack speed for 8s | 30s | fires on cooldown |
| Rally Hymn | Heal party 40% max HP; +30% attack speed for 8s; all companion cooldowns advance 50% | 40s | fires when any member < 40% HP |

Auto-cast unlocks at zone 10 and runs at **double cooldown** (a toggle on the button, on by
default). Manual casting gives about 2x the uptime plus good timing. Offline progress assumes
auto-cast value (a flat 1.05 dps factor; see 4.11).

---

## 3. Companions: the roster

Companions are named characters. Each has a **rarity**, a title, a bio, a role, a **speciality**
(a rule only they have), a signature ability, and milestone unlocks as they level. **3 on the
field plus the hero; the rest wait on the bench.** Characters belong to one of four circles,
used by synergies: **Hedgefolk** (common folk of the hollows), **the Oath** (the old lantern
order), **Dusk Company** (sellswords who work at night), **Wayfarers** (travellers passing through).

### 3.1 Rarity, roster and how each character joins

**Rarity defines strength.** It is fixed per character: there is no rarity upgrading. Finding
the higher-rarity characters is a long-term goal.

| Rarity | Frame colour | Base power | Growth per level | Extra kit | Keeps it useful |
|---|---|---|---|---|---|
| Common | stone `#A9B1BD` | x1 | x1.080 | speciality only | +50% XP, promotions cost x0.5, synergies that include a Common are +25% stronger (*Common Cause*) |
| Rare | blue `#7FB2FF` | x1.5 | x1.081 | speciality + a Rare trait (one small innate bonus) | - |
| Epic | violet `#B58CFF` | x2.2 | x1.082 | speciality + innate passive (their L10 passive is active from level 1; L10 instead gives +15% ability power) | - |
| Legendary | gold `#F2C14E` | x3.2 | x1.083 | Epic kit + a **Legend aura** for the whole party + Bond active from level 1 | - |

The power formula (3.3) multiplies by these. At equal level and rank an Epic out-damages a
Common by 2.2x, so rarity is a real upgrade. Commons stay in line-ups through cheap promotions,
fast catch-up, taunts, heals and shields, and Common-heavy synergies (Hedgefolk).

**Roster (18 characters).** `idx` = old `S.comp` index that seeds this character on
migration (section 6).

| Character | Title | Rarity | Role | Circle | idx | How to recruit (avenue) |
|---|---|---|---|---|---|---|
| Tobin Reed | the Hedge Squire | Common | tank | Hedgefolk | 0 | **Starter** for Lanternmage and Ranger. Others: **progress**, reach zone 3 and he joins free |
| Wren Hollowmere | the Batwing Archer | Common | striker (ranged) | Hedgefolk | 1 | **Starter** for Warden. Others: **progress**, reach zone 2, then 120 gold |
| Old Hesketh | the Lamplighter | Common | support | Hedgefolk | - | **Progress:** beat the Batwing Caves boss (zone 2) once; joins free |
| Pip Cinderly | the Hedge Mage | Common | caster | Hedgefolk | 2 | **Progress:** reach zone 4, then 1,100 gold |
| Bram Hollis | the Woodcutter | Common | striker (melee) | Hedgefolk | - | **Starter** for Chaplain. Others: **quest** "Wood for the Winter", bring 60 Oak Logs to his camp (from zone 3) |
| Maren Ashvale | the Lampwarden | Rare | tank | the Oath | - | **Quest:** "The Barrow Lamp": bring 20 Glowing Essence (from zone 4) |
| Ser Aldric Vane | the Oathbound | Rare | tank | the Oath | 3 | **Renown 15** on the bounty board, then 25K gold |
| Kestrel Thane | the Skyfall Dragoon | Rare | striker (melee) | Dusk Company | 4 | **Progress:** reach zone 12, then 150K gold |
| Thessaly Gloam | the Bog Seer | Rare | caster | Wayfarers | - | **Bestiary:** finish the Marsh Wraith page (all 3 tiers) |
| Brother Anselm | the Bellringer | Rare | support | the Oath | - | **Tavern visitor** (from zone 6): 60K gold + 20 Glowing Essence |
| Grenna Holt | the Stonebreaker | Epic | tank | Wayfarers | - | **Boss drop:** "Stonebreaker's Token" from Quarry Ruins bosses, 8% +8% per miss (guaranteed by the 12th) |
| Isolde Marrow | the Duskblade | Epic | striker (melee) | Dusk Company | - | **Boss drop:** "Dusk Contract" from any zone boss from zone 16, 10% +10% per miss (guaranteed by the 10th) |
| Oriel Vess | the Starcaller | Epic | caster | Dusk Company | 5 | **Crafting:** summon with a Star Chart made at the Enchanter's Table (40 Mithril-tier Crystal, 20 Radiant Essence, 1 Wraith Veil) |
| Morwen Tallow | the Candlewitch | Epic | caster | Wayfarers | - | **Quest with a condition:** beat the Fungal Deep II boss (zone 12) with no support in the party |
| Vesper Lark | the Songweaver | Epic | support | Wayfarers | - | **Tavern visitor** (from zone 18): 20M gold + 30 Radiant Essence. Fallback: joins free at Renown 60 |
| Saint Elowen | the Last Lantern | Legendary | support | the Oath | 6 | **Quest** at zone 28: "Relight the Chapel", 150M gold + 20 Blazing Essence |
| Caedmon the Unburnt | the Ashen Knight | Legendary | tank | the Oath | - | **Region clear + Renown:** clear Region 1 (zone 35 boss) with Renown 80. Optional light route: each Ashen Wyrm raid kill counts as 5 Renown toward him |
| Corvin Black | the Hollow King's Blade | Legendary | striker (melee) | Dusk Company | - | **Achievement:** "Kingslayer": 150 zone boss kills and every bestiary page at tier 2. Optional later route: the "Hollow Court" expedition counts as 50 boss kills |

Per role and rarity:

| Role | Common | Rare | Epic | Legendary |
|---|---|---|---|---|
| tank | Tobin | Maren, Aldric | Grenna | Caedmon |
| striker | Wren, Bram | Kestrel | Isolde | Corvin |
| caster | Pip | Thessaly | Oriel, Morwen | - |
| support | Hesketh | Anselm | Vesper | Elowen |

**Unlock avenues.** No random paid pulls and no gacha. Every character has a deterministic
route, and every chance-based route has a guarantee.

| Avenue | How it works | Characters |
|---|---|---|
| Starter | Joins on "Begin" at character creation, picked by class (below) | Tobin, Wren or Bram |
| Progress | Reach a zone or clear a region; some then cost gold | Tobin, Wren, Hesketh, Pip, Kestrel, Caedmon (region) |
| Character quest | A card in the Party tab with one goal: bring items, or win a boss fight under a condition | Bram, Maren, Morwen, Elowen |
| Boss drop | A named token from zone bosses. Chance rises by a fixed step after every miss and hits 100% (pity shown on the locked card: "Dusk Contract: 30% next boss") | Grenna, Isolde |
| Renown | Each claimed bounty gives 1 Renown (elite bounties 3). Characters join at thresholds | Aldric (15), Vesper fallback (60), Caedmon (80) |
| Achievements and bestiary | A bestiary page or an achievement completes the unlock | Thessaly, Corvin |
| Tavern visitor | One visitor a day in the World tab (Tavern section), from a fixed weekly rotation (below). Hired for gold + essence. Works offline, uses the device date | Anselm, Vesper |
| Crafting | A summoning item from rare materials at the Enchanter's Table (gathering spec) | Oriel |
| Raid and expeditions | Optional and light: they shorten another route and are never the only way | Caedmon (raid), Corvin (expedition, later) |

**Visitor rotation** (day = days since 2026-01-01, mod 7): Anselm, Kestrel, Vesper, Thessaly,
Anselm, Grenna, Vesper. Anselm and Vesper visit twice a week, so each is guaranteed within 4
days. The other slots let you hire a character early, before their normal route, at 3x the
gold (Kestrel, Thessaly) or 5x (Grenna). Visitors already recruited are skipped and the slot
shows a trader selling 10 essence of your top tier. The visitor stays 24 hours.

**Starting companion.** New games start with the hero plus one Common companion who covers
what the class lacks: a ranged hero gets a melee companion, a melee hero gets a ranged one.

| Class | Starter | Why |
|---|---|---|
| Warden (melee, Front) | Wren Hollowmere (ranged striker, Mid) | The Warden holds the pack and Wren kills it from behind: a complete tank + damage pair |
| Lanternmage (ranged caster, Back) | Tobin Reed (melee tank, Front) | Someone to stand in front of the glass cannon and hold threat while the AoE lands |
| Ranger (ranged striker, Mid) | Tobin Reed (melee tank, Front) | Same: Tobin holds, the Ranger focuses and bursts |
| Chaplain (support, Back) | Bram Hollis (melee striker, Front) | The Chaplain deals x0.2 damage, so the pair needs damage more than a second defender. Bram takes hits in Front (5x pow HP, healed by the Chaplain), his Cleave hits two of a pack of 3, and Blessing adds +20%. Tobin would make the pair nearly unkillable but slow, and the first hour would drag |

Joining moments (shown after "Begin", one tap to continue):
- **Wren:** An arrow lands at your feet, then another in the slime behind you. "You stand in the right place, for once. Hold them there." Wren Hollowmere drops from the branches and does not ask to come along.
- **Tobin:** A boy in a pot helm trips over a sword too big for him on the road out of Mossy Hollow. "I'm Tobin. I stand in front. That's the whole job, isn't it?" He does not wait for an answer.
- **Bram:** A woodcutter looks at your lantern for a long time. "Heard a priest was on the road. I've no prayers left, but I can swing." Bram Hollis walks ahead of you, into the dark.

**First 10 minutes with exactly hero + starter.** Every pair has a Front-liner and a damage
dealer, and three of the four have no healer, so zones 1-3 get an early grace: enemy attack
x0.5 and 20% max HP regen between packs (normal 10%). Only Moss Slimes (plain melee) appear in
zone 1; the first bats dive from zone 2, when Hesketh (zone 2 boss) and a second recruit (Wren
or Tobin, zones 2-3) are about to join. The starters not chosen join through their normal early
routes above. Existing saves do not get a starter; they keep their migrated characters. Target
T18 checks the pairs.

Quest cards, token pity, Renown and visitor state live in `S.party.unlock` (section 6).

### 3.2 Bios, specialities, abilities, art briefs

**Tobin Reed, the Hedge Squire** (tank). Tobin carried your spare sword out of Mossy Hollow and
never gave it back. He is not brave, exactly. He just refuses to be the one who runs first.
- Speciality, *Earned Trust*: +1% damage reduction per pack cleared with no one downed, up to 20%. Resets when anyone goes down.
- Ability, *Guard* (12s): taunts every enemy that can reach him for 3s and takes 40% less damage for 4s.
- Art: short, round, oversized pot helm; brown and moss green; a dented buckler and a sword too big for him.

**Wren Hollowmere, the Batwing Archer** (striker). Wren learned to shoot in the caves, where
you aim at sounds. She talks to her arrows. Most of them come back.
- Speciality, *Marked*: Aimed Shot marks its target for 5s; marked enemies take +20% damage from all strikers.
- Ability, *Aimed Shot* (10s): 5 x ATK, always crits, reaches any row, applies Mark (Mark also strips armour and makes the target the party focus).
- Art: slim, hooded, long scarf trailing; dark green and bat-violet; longbow taller than her.

**Old Hesketh, the Lamplighter** (support). Hesketh lit the road lamps for forty years before
the dark came in. He still walks the route every evening. Now he brings you along.
- Speciality, *Warm Light*: overhealing from his heals becomes a shield, up to 20% of the target's max HP.
- Ability, *Mend* (8s): heal the lowest ally for 25% max HP. Hesketh deals no damage.
- Art: stooped, long coat, white beard; soot grey and lamp amber; a lighting pole with a small flame on top.

**Pip Cinderly, the Hedge Mage** (caster). Pip taught herself fire from a book with the last
chapter torn out. She is still looking for it. Nothing near her stays unburnt for long.
- Speciality, *Kindling*: each of her attacks adds a Kindle stack to the target (max 5). Each stack makes the target take +4% damage from everyone (a debuff); Fireball consumes the stacks for +20% damage each.
- Ability, *Fireball* (10s): 4 x ATK to all enemies plus a 3s burn; ignores armour.
- Art: small, wild hair, patched robe; ember orange and purple; a singed book on a strap.

**Maren Ashvale, the Lampwarden** (tank). Maren kept the Barrow Lamp lit for the dead, alone,
for eleven winters. She does not fear the dark. She is only tired of it.
- Speciality, *Lanternlight*: boss wind-ups show 0.4s earlier while she is fielded (the parry window grows from 0.8s to 1.1s). Enemies that hit her take 10% of the hit as burn.
- Ability, *Beacon* (16s): taunts all enemies for 4s and heals herself 20% max HP.
- Art: tall, heavy cloak, face in shadow; ash grey and pale teal light; a tower shield with a lantern hung from it.

**Ser Aldric Vane, the Oathbound** (tank). The last knight of the lantern order, sworn to a
banner nobody else remembers. He has decided the banner is yours now.
- Speciality, *Intercept*: when an ally drops below 25% HP, Aldric takes the next 3 hits aimed at them (once per ally per pack).
- Ability, *Shield Bash* (15s): 4 x ATK, stuns 1.5s, interrupts a boss wind-up (counts as a parry).
- Art: broad, full plate, crested helm; crimson and silver; kite shield with a lantern sigil.

**Kestrel Thane, the Skyfall Dragoon** (striker). Kestrel came down from the mountain wars with
a spear and no stories she will tell. She fights like the ground is a rumour.
- Speciality, *Skyfall*: Leap knocks the pack back; every enemy's next attack is delayed 1s.
- Ability, *Leap* (14s): 8 x ATK to any enemy, untargetable for 1s. Auto-targets a diver on the back row first (peel), else the focus target.
- Art: lean, winged helm, long spear; deep teal and steel blue; cape shaped like a folded wing.

**Isolde Marrow, the Duskblade** (striker). Isolde's contract was signed in the dark, and she
has never read it. She says it only has one word on it, and the word is "finish".
- Speciality, *Unfinished Business*: a kill with Execute resets its cooldown. Execute reaches any row and ignores armour.
- Ability, *Execute* (9s): 12 x ATK if the target is below 30% HP, else 3 x.
- Art: narrow silhouette, twin short blades, mask; black and dusk rose; a torn contract pinned to her belt.

**Oriel Vess, the Starcaller** (caster). Oriel reads the sky the way others read letters, and
most of the news is bad. When the stars answer, they answer all at once.
- Speciality, *Night Sight*: every critical hit by any ally cuts 1s off Starfall's cooldown.
- Ability, *Starfall* (18s): 3 pulses of 3 x ATK to all enemies over 3s; slows them 30% for 4s and the last pulse stuns 1s (interrupts healers and wind-ups).
- Art: tall, star-pricked robe, tall collar; indigo and pale lilac; a staff topped with a hanging star.

**Saint Elowen, the Last Lantern** (support). The land is called Lanternfall because of what
Elowen did the night the lights went out. She will not talk about it. She keeps her flame low.
- Speciality, *Vigil*: while she stands, downed allies stand up at 60% HP (not 30%) and between-pack regen doubles.
- Ability, *Sanctuary* (20s): heal all 20% max HP, then 3% per second for 5s. Elowen deals no damage.
- Art: slender, hooded, glowing halo-lantern; cream and gold; a lantern held in both hands.

**Bram Hollis, the Woodcutter** (Common striker, melee). Bram has felled trees in Mossy Hollow
since he could lift an axe. He says monsters are easier: they fall toward you. He never says
where his family went.
- Speciality, *Cleave*: his attacks also hit a second Front-column enemy for 50%.
- Ability, *Felling Blow* (11s): 6 x ATK to the front enemy; a kill makes his next attack instant.
- Art: stocky, bearded, rolled sleeves; red plaid and brown; a long woodsman's axe over one shoulder.

**Thessaly Gloam, the Bog Seer** (Rare caster). Thessaly lives on stilts in the Wraithmarsh
and reads the future in bog water. She came along because the water showed your face. She has
not said what else it showed.
- Rare trait: her slows last 30% longer.
- Speciality, *Mire*: her attacks slow the target 40% for 3s; slowed enemies take +10% damage from casters.
- Ability, *Sinking Mire* (12s): slows every enemy 50% for 5s and ends any dive in progress (peel).
- Art: thin, stooped, wide reed hat; murky green and grey-teal; a staff hung with little bottles.

**Brother Anselm, the Bellringer** (Rare support, no damage). Anselm rang the chapel bell every
dusk for thirty years. When the chapel fell, he took the bell with him. It is heavier than he
is, and he will not put it down.
- Rare trait: his buffs last 10% longer.
- Speciality, *Toll*: every 10s the bell tolls: the party gets +15% attack speed for 4s, and allies below 30% HP get a 10% max HP shield.
- Ability, *Call to Arms* (15s): heals everyone 12% max HP and gives +20% damage for 6s.
- Art: round, tonsured, brown habit; brown and bronze; a great bell strapped to his back.

**Grenna Holt, the Stonebreaker** (Epic tank). Grenna cut stone until the golems woke and the
quarry turned on the town. She broke the first golem with her bare hands. The rest she broke
with a hammer.
- Speciality, *Rockhide*: every hit she takes gives 2% damage reduction for 5s, stacking to 20%.
- Innate passive (Epic): *Bedrock*: takes 25% less from heavy hits and row slams.
- Ability, *Earthshatter* (14s): taunts all enemies, 3 x ATK and a 1.5s stun to the enemy Front column.
- Art: huge and broad, leather apron, stone dust on her arms; slate and rust; a two-handed maul.

**Morwen Tallow, the Candlewitch** (Epic caster). Morwen makes candles from things she will not
name, and each burns a different colour. She is kind to children and cruel to everything else.
The Fungal Deep was her garden before the spores took it.
- Speciality, *Wick*: burns on enemies she has hit tick 25% faster (Kindle stacks count as burns).
- Innate passive (Epic): *Wax Seal*: an enemy that dies while burning bursts for 1 x ATK to its pack.
- Ability, *Candlelight Vigil* (16s): every enemy burns for 1.5 x ATK per second for 6s; ignores armour.
- Art: hunched, long hair crowned with dripping candles; black and wax white with coloured flames; a candelabra staff.

**Vesper Lark, the Songweaver** (Epic support, no damage). Vesper sings in taverns for a coin and
a bed, and fights for free when the song is good. She knows every road song in Lanternfall. She
wrote half of them, and changed the endings.
- Speciality, *Refrain*: her song cycles every 6s through three verses for the whole party: Haste (+20% attack speed), Ward (10% max HP shield), Mend (5% max HP heal).
- Innate passive (Epic): *Encore*: allies' ability cooldowns -10%.
- Ability, *Crescendo* (20s): all three verses at once at double strength.
- Art: slim, feathered cap, short cape; teal and gold; a lute slung on her back.

**Caedmon the Unburnt, the Ashen Knight** (Legendary tank). Caedmon walked into the Ashen Wyrm's
fire to buy a village one hour. He walked out three days later, still burning. He does not
sleep, and he does not talk about what he saw in the flame.
- Legend aura, *Unburnt*: the party takes 8% less damage and is immune to burns.
- Speciality, *Cinder Vow*: once per pack, when he would fall he turns Ashen for 5s instead: he cannot die, taunts all enemies and takes no healing.
- Innate passive: *Everburn*: enemies that hit him take 10% of the hit as burn.
- Ability, *Pyre Guard* (16s): taunts all enemies for 4s and reflects 30% of damage taken as fire.
- Art: tall, charred black plate with glowing orange seams, ember eyes in the helm; black, ash and ember orange; a greatshield split by a burning crack. Legendary sprites get a 2-frame ember shimmer.

**Corvin Black, the Hollow King's Blade** (Legendary striker, melee). Corvin killed for the
Hollow King for twenty years and never once saw his face. When the King fell, Corvin was the
only one who did not kneel. He fights for you because you asked, and nobody ever had.
- Legend aura, *King's Shadow*: the party gets +8% crit chance, and crits on enemies below 50% HP deal +25%.
- Speciality, *Shadowstep*: ignores formation reach, always attacks the enemy with the lowest HP%, and melee enemies cannot target him while he strikes.
- Innate passive: *Cold Work*: each kill gives +10% damage for 5s, stacking 3 times.
- Ability, *Hollow Cut* (10s): 15 x ATK to the lowest-HP enemy; a kill refunds half the cooldown.
- Art: tall, lean, hooded black coat with a crown-shaped clasp, face never shown; black and bone white with a violet edge; twin curved daggers.

**Rarity notes for the original ten.** Rare traits: Maren +10% max HP, Aldric +10% threat,
Kestrel +10% crit damage. Epic innate passives: Isolde's *Clean Work* and Oriel's
*Constellation* are active from level 1. Legendary: Elowen's Legend aura, *Last Light*: the
party gets +10% max HP and +10% healing received.

### 3.3 Levels: growth comes from use

- **Only fielded characters earn XP**, from kills, boss wins and bounties completed while they
  are fielded. The bench earns nothing.
- XP per enemy killed: `cxpGain(z) = cxpNeed(3z) / 40` (boss x5). A bounty completion gives the
  fielded members 20 kills' worth. At a character's par level (`3 x zone`) that is about 40
  enemies (13 packs) per level; characters below par level much faster, above par slower.
- XP to next level: `cxpNeed(lv) = 10 * 1.12^(lv-1)`.
- **Catch-up bonus:** party level = average of the 3 highest companion levels on the roster. A
  fielded character `d` levels below it earns `+min(100%, 20% x d)` XP (+100% at 5+ behind,
  tapering to 0). With the par curve above, a new level-1 recruit fielded at zone 20 reaches the
  party in about 170 enemies (about 5 minutes of fighting).
- **Offline:** fielded characters earn 75% of the XP of the estimated offline kills (4.11).
- Power: `pow = 4 * rarityMult * rarityGrowth^(lv-1) * 2^rank * (1 + weaponPct/100) * dmgMult() * (1 + gear().party/100) * mod('party')`,
  with `rarityMult` and `rarityGrowth` from the rarity table (3.1). Every new recruit starts at
  level 1 and uses the catch-up bonus; Commons earn +50% XP on top.

### 3.4 Milestones and promotions

**Promotions** are the second axis and are gated by use. Level cap = `25 x (rank + 1)`. At the
cap, XP banks (up to one level's worth) and the card shows **Promote**. Promote cost:
`500 x mobGold(ceil(25 x (rank + 1) / 3))` gold plus `10 x (rank + 1)` essence of tier
`min(5, rank + 1)`. Effect: rank +1, power x2, cap +25. Ranks: Recruit, Veteran, Captain,
Champion, Paragon, Legend, Mythic, Lanternborn (0-7, max level 200). Commons pay half.

**Milestones** make levelling feel like growth. The pattern is the same for everyone: L5 camp
story 1, L10 a second passive, L15 camp story 2, L20 an ability upgrade, L25 camp story 3 plus
**Bond** (all synergies that include this character are 50% stronger). Past 25: every 25 levels
the signature ability deals or heals +25%. Camp stories are 2-4 sentences, shown in the
character sheet under "Stories" with a small toast when unlocked.

| Character | L10 second passive | L20 ability upgrade | Camp stories (L5 / L15 / L25) |
|---|---|---|---|
| Tobin | *Stubborn*: survives one lethal hit per pack at 1 HP | Guard also covers the next ally in line | The Borrowed Sword / Mother's Letter / The Day He Didn't Run |
| Wren | *Echo*: crits on marked enemies fire a free 50% arrow | Aimed Shot pierces to a second enemy | Arrows in the Dark / The Bat Queen / Where the Sound Goes |
| Hesketh | *Long Route*: +20% healing after 10s in the same fight | Mend heals the two lowest allies | Forty Years of Lamps / The Unlit Road / Last Lamp on the Hill |
| Pip | *Short Fuse*: Kindle max stacks 5 -> 8 | Fireball leaves burning ground, 1 x ATK/s for 4s | The Torn Chapter / A Singed Eyebrow / The Missing Page |
| Maren | *Keeper*: +15% max HP for each other Oath member fielded | Beacon also shields the party 10% max HP | Eleven Winters / Names of the Dead / Why the Lamp Stayed Lit |
| Aldric | *Old Guard*: +20 armour | Shield Bash hits all enemies (stun stays single) | The Banner / The Order's End / An Oath Renewed |
| Kestrel | *Updraft*: +25% attack speed for 4s after Leap | Leap lands twice | Down from the Mountain / The Spear's Name / A Story She Tells |
| Isolde | *Clean Work*: +15% crit chance on enemies below 50% HP | Execute threshold 30% -> 40% | The Unread Contract / Who Signed It / Finish |
| Oriel | *Constellation*: +5% ATK per ally crit in the last 5s, max 25% | Starfall adds a 4th pulse | Bad News from the Sky / The Falling Star / What the Stars Want |
| Elowen | *Low Flame*: Sanctuary cooldown -4s | Sanctuary also cleanses poison and burns | The Night the Lights Went Out / The Chapel / Lanternfall |
| Bram | *Timber!*: Felling Blow knocks the target back | Felling Blow cleaves the whole Front column | Split Kindling / The Empty Cottage / Where the Road Forks |
| Thessaly | *Deep Water*: slowed enemies deal 10% less damage | Sinking Mire also stuns divers for 2s | Water Does Not Lie / The Drowned Village / What She Saw |
| Anselm | *Steady Hands*: Toll every 8s instead of 10s | Call to Arms also cleanses | Thirty Years of Dusk / The Bell's Name / The Last Toll |
| Grenna | (Bedrock is innate; L10 gives +15% ability power) | Earthshatter also stuns the Mid column | The Quarry Woke / Bare Hands / Stone Remembers |
| Morwen | (Wax Seal is innate; L10 gives +15% ability power) | Candlelight Vigil also slows 20% | Colours of Wax / The Garden / What the Candles Are Made Of |
| Vesper | (Encore is innate; L10 gives +15% ability power) | Crescendo also resets the longest ally cooldown | A Coin and a Bed / The Changed Ending / Her Own Song |
| Caedmon | (Everburn is innate; L10 gives +15% ability power) | Pyre Guard also shields adjacent allies 15% max HP | One Hour / Three Days in the Flame / The Village He Saved |
| Corvin | (Cold Work is innate; L10 gives +15% ability power) | Hollow Cut strikes a second target | Twenty Years, No Face / The One Who Did Not Kneel / Asked |

Isolde and Oriel (Epic) and Elowen (Legendary) have their L10 passive from level 1 and get
+15% ability power at L10 instead.

### 3.5 Synergies

Active when all named members are in the party (the hero counts where a class is named).
Shown as a banner row on the Party screen: lit when active, dim with "needs X" when one short.

| Synergy | Needs | Effect |
|---|---|---|
| Shield and Hearth | a tank in Front + a support directly behind it (same lane) | The tank takes 10% less damage and receives 20% more healing |
| Hedgefolk | any 2 Hedgefolk (3 for the bonus) | +15% attack speed; with 3, Tobin's Guard also shields each Hedgefolk for 10% max HP, and +10% gold |
| The Old Oath | Aldric + Elowen | Intercept also heals the protected ally 10% max HP; Sanctuary cooldown -5s |
| Lamp and Ward | Maren + Hesketh | Hesketh's shields on Maren have no cap and last until broken; Beacon heals 30% |
| Kindle and Starfall | Pip + Oriel | Starfall consumes Kindle stacks for +30% per stack (Pip sets up, Oriel cashes in) |
| Mark and Leap | Wren + Kestrel | Leap always strikes the marked enemy and always crits; a diver Wren marks is knocked back when Kestrel lands (peel) |
| Dusk Company | any 2 Dusk Company | +25% damage to enemies below 50% HP; with Isolde fielded, Execute threshold +10% |
| Lantern's Chosen | Lanternmage hero + Elowen | Lantern Flare heals the party 3% max HP per enemy hit |
| Hunting Party | Wren + Bram | Mark lasts 8s; Bram's hits on the marked enemy cleave the whole Front column |
| Bell and Song | Anselm + Vesper | All their buffs last 50% longer; each Toll also plays Vesper's current verse |
| Wax and Kindle | Pip + Morwen | Morwen's burns add Kindle stacks; Pip's Kindle stacks tick as burns under Wick |
| Mire and Lamp | Thessaly + Maren | Slowed enemies that hit Maren take double Lanternlight burn |
| Old Enemies | Corvin + Aldric | Both +15% damage; Aldric's Intercept covers Corvin wherever he stands |
| Wayfarers | any 2 Wayfarers | Fielded members earn +10% XP; ability cooldowns -10% |

Common Cause (3.1) makes every synergy that includes a Common 25% stronger, so Common pairs
such as Hunting Party and Lamp and Ward stay worth fielding next to Epics.

**Sample line-ups** (hero + 3):

1. **Hedge Hearth** (Warden + Wren, Hesketh, Pip). Hedgefolk x3 (+speed, +gold) and Shield and
   Hearth with the Warden in front. Steady, cheap, good gold. The early and middle game farm team.
2. **Kindle Battery** (Lanternmage + Pip, Oriel, Hesketh). Pip stacks Kindle, Oriel's Starfall
   cashes it in, the Lanternmage's splash hits the whole pack. Melts packs; weaker on single
   bosses. With nobody in front, melee enemies reach the back row, so Oriel's slows and stuns
   and Hesketh's shields keep them alive: it only works while the pack dies fast.
3. **Night Work** (Ranger + Wren, Kestrel, Isolde). Mark and Leap plus Dusk Company plus the
   Ranger's crit aura. Highest boss burst; no healer or tank, so it wants an active player
   parrying. The boss-push team.
4. **The Last Vigil** (Chaplain + Aldric, Maren, Elowen). The Old Oath, Maren's Keeper passive
   (+30% HP), Elowen's Vigil. Low damage, almost never wipes: the overnight idle team that holds
   the highest zone offline.
5. **Candle and Bell** (Lanternmage + Grenna, Morwen, Anselm). Grenna's Earthshatter stuns the
   Front column while Morwen's burns spread through Wax Seal; Anselm's Toll keeps the tempo.
   The Epic-era pack-clear team.
6. **The Hollow Court** (Warden + Corvin, Aldric, Elowen). Old Enemies, The Old Oath and two
   Legend auras. The endgame boss team.

### 3.6 Role stats

| Role | Damage per second | Max HP | Armour | Speed (attacks/s) | Threat x | Default row |
|---|---|---|---|---|---|---|
| tank | 0.5 x pow (melee) | 12 x pow | 20 (Aldric 40) | 0.8 | 4 | Front |
| striker | 1.4 x pow single target, crit 15% x3 | 5 x pow | 0 | 1.2 | 1 | Mid |
| caster | 1.0 x pow to all enemies, ignores armour | 4 x pow | 0 | 0.7 | 1.2 | Back |
| support | 0 damage; heals 1.2 x pow HP/s to the lowest-% ally | 6 x pow | 10 | 1.0 | 0.5 (of healing) | Back |

Signature ability cooldowns are listed with each character (3.2).

### 3.7 Gear slots and gold

Each character has 2 slots: **role weapon** and **trinket** (section 5). Gold sinks after this
change: hero upgrades (unchanged), recruiting, promotions, forging. The old per-count hire goes.

---

## 4. Combat model

Design rule: **the tank decides who gets hit, strikers decide who dies, casters shape the whole
pack, supports decide who lives.** Each role does something the others cannot.

### 4.1 Units

| Unit | HP | Attack per hit | Speed | Armour |
|---|---|---|---|---|
| Party member | role table (3.6) or class table (2.1) | role DPS / speed | role | role + gear |
| Normal enemy | `0.4 * mobHp(z)` (packs of 3) | `1.2 * 1.55^(z-1)` | 0.8/s | 0 unless armoured (4.7) |
| Zone boss | `8 * mobHp(z)` (unchanged) | `3 * 1.55^(z-1)` | 0.6/s | per type |

`mobHp(z) = 10 * 1.55^(z-1)` is unchanged, so gold (`mobGold` per enemy x0.4, pack total 1.2x),
essence and zone pacing keep their current curve.

**Packs:** normal encounters are packs of 3 enemies side by side (72% zone type, 28% next type,
per enemy; from zone 8, packs can mix any two unlocked types). 10 packs unlock the boss.

### 4.2 Formation and position

**Grid.** Each side has 3 columns (Front, Mid, Back) and 2 lanes (upper, lower): 6 cells, at
most 2 members per column. The party fills 4 cells (hero + 3 companions).

**Where people stand**

| Who | Allowed rows | Auto-placement |
|---|---|---|
| Warden hero | Front | Front |
| Ranger hero | Mid or Back | Mid |
| Lanternmage, Chaplain heroes | Back | Back |
| Tanks (Tobin, Maren, Aldric) | Front or Mid | Front |
| Melee strikers (Kestrel, Isolde) | Front or Mid | Mid (Front if no tank) |
| Ranged striker (Wren) | Mid or Back | Mid |
| Casters (Pip, Oriel), supports (Hesketh, Elowen) | any | Back |

**What position does**

| Rule | Effect |
|---|---|
| Melee reach | Melee enemies can only attack the party's Front column. If Front is empty, the next occupied column becomes their reach. |
| Ranged and casters | Ranged and caster enemies can hit any row, by threat. |
| Divers | Skirmishers and assassins leap over the line to a back-row target for their dive (4.7). |
| Back row | Takes 20% less damage from ranged attacks and area attacks. |
| Area attacks | "Row" attacks hit one column (Golem slam hits Front); "line" attacks hit everyone (spore cloud). |
| Braced | Tanks in Front get +10 armour. |
| Cover | A tank in Front covers the ally directly behind it in the same lane: that ally takes 15% less damage, and the tank intercepts the first hit of any dive on that ally. |
| Adjacency | Adjacent = same lane and neighbouring column, or same column and other lane. Aldric's Intercept and Tobin's L20 Guard only reach adjacent allies. |
| Melee strikers | Kestrel and Isolde attack from Mid by dashing in: while striking (0.5s per attack) they count as Front and can be hit by melee. |

**Party reach into the enemy formation.** Melee attackers (Warden, tanks, Kestrel's and
Isolde's basic attacks) hit the enemy Front column only, until it is empty. Ranged strikers,
casters, the Ranger and the Lanternmage hit any column. Kestrel's Leap and Isolde's Execute
reach any column.

**Enemy formation mirrors this.** Bruisers and armoured enemies stand in front (Slime, Beetle,
Golem), skirmishers and archers in the middle (Bat, Rattlebones), casters and healers at the back
(Spore Cap, Wraith). So an enemy healer must be reached by ranged strikers, casters, a Ranger
focus or a dive.

**Warnings** (formation editor, 7.2): "Nobody in front: melee enemies will reach your mid row."
"Your healer is in the front row." "No tank: enemies will hit whoever hurts them most."

### 4.3 Threat and aggro

Every enemy keeps a threat table: one number per party member (4 numbers, reset when the
enemy dies).

| Source | Threat generated |
|---|---|
| Damage dealt | damage x role multiplier: tank 4, striker 1, caster 1.2 (on every enemy hit), support 0.5 |
| Healing and shields | amount x 0.5, split across all living enemies |
| Taunt | sets the taunter's threat to 120% of the enemy's current top, and forces its target for 3s |
| Warden hero | passive threat multiplier 6 (instead of 4); every pack starts with the Warden on top |
| Opening | each tank starts every new pack with threat equal to 1 hit of its own damage x 10 |

**Targeting rule:** an enemy attacks the highest-threat member **it can reach** (4.2). It
switches only when another reachable member's threat exceeds its current target's by 20%
(stops flicker). Melee enemies choose within the Front column; ranged and caster enemies
choose across the whole party, so a caster who bursts before the tank has threat pulls every
ranged enemy onto themselves.

**What this means in play:** a tank with taunts holds the pack. With two members in Front,
melee enemies split between them by threat, so a Front-row striker can steal aggro from a weak
tank. With no tank, enemies spread across whoever hits hardest. Enemy behaviours (4.7) break the
rule on purpose; taunts pull a diver back once its dive ends, and any stun or knockback ends a
dive early.

**Party targeting:** single-target attacks hit the enemy the party is focused on: by default the
enemy attacking the lowest-HP ally, else the lowest-HP enemy. Ranger taps and Wren's Mark
override this (4.6). AoE hits all.

### 4.4 Damage, healing, crowd control

- `hit = ATK * (crit ? critMult : 1) * mods * (1 - red(target))`
- Party armour: `red = min(0.6, armour / (armour + 100))`. Flat armour from class, role, shields, hero helm (0.1 x helm power).
- Armoured enemies: physical hits (hero Warden/Ranger, tanks, strikers) deal 50% damage. Caster damage, burns and Isolde's Execute ignore armour. Wren's Mark removes armour while it lasts.
- **Healing** goes where it is needed: supports heal the ally with the lowest HP fraction; overheal is lost unless a speciality converts it to shields. Heals scale with incoming damage by design: a support heals only when someone is hurt, so a support's value is measured in damage prevented.
- **Shields/wards** absorb damage before HP, show as a white segment on the HP bar, last 6s.
- **Crowd control:** stun (enemy does nothing, interrupts channels and wind-ups), slow (-30% attack speed), knockback (delays the next attack 1s and ends a dive), burn (damage over time, ignores armour), debuff (Kindle: +4% damage taken per stack).
- Regen: 0.5% max HP/s in combat, plus 10% max HP between packs (the 1s respawn gap).

Par check: at a zone the party can just farm, party DPS about `4 * 1.55^(z-1)` (pack of 3 dies in
about 3s). Tank HP about `9.6 * 1.55^(z-1)`, incoming about 8% of tank HP per second after
armour, one support heals about 8% per second. So at par a balanced party holds; with no
support it wipes after 5 to 8 packs; at 1.5x par anything holds.

### 4.5 Roles in combat

| Role | Job | Kit | Weakness |
|---|---|---|---|
| Tank | Hold aggro, soak | Threat x4, taunts, armour, damage reduction, peel by taunting divers back once their dive ends | Low damage |
| Striker | Kill the right enemy | Single-target burst, crits, executes on enemies below 30%, focus targets (healers, divers) | Fragile if aggro slips; weak into armour (except Isolde's Execute) |
| Caster | Shape the pack | AoE, burns, slows, stuns, Kindle debuff that multiplies everyone's damage, ignores armour | Fragile; draws threat if it bursts before the tank |
| Support | Keep them standing | Heals, shields, cleanses, buffs. **No real damage** (0 for companions) | Nothing dies faster because of them directly |

### 4.6 How the hero's class changes your taps

A tap on the stage does what your class does. Auto-play (idle) performs a competent version at
about 0.5 taps per second; active play is faster and smarter.

| Class | Tap an enemy | Tap an ally | During a boss wind-up | Idle auto-play |
|---|---|---|---|---|
| Warden | Taunt it (forced target 3s, 1s tap cooldown) + tap damage | - | Tap the boss = block/parry | Taunts any enemy not on the Warden, every 4s |
| Lanternmage | Plant an Ember on it (max 5 per enemy); Lantern Flare detonates Embers for +30% each | - | Tap the boss = flash-stun, counts as a parry | Embers the enemy with the most HP |
| Ranger | Focus: hero and all strikers switch to it; tap damage gets +20% crit chance | - | Tap the boss = pinning shot, counts as a parry | Focuses healers, then divers, then lowest HP |
| Chaplain | Smite: 0.3x tap damage and the enemy takes +5% damage for 4s | Direct heal: 8% max HP to that ally (3 charges, 1 back per 2s) | Tap the targeted ally = ward that absorbs the heavy hit, counts as a parry | Heals the lowest ally under 60% |

Hero damage by class: Warden x0.8, Lanternmage x1.0 (hits all), Ranger x1.1, **Chaplain x0.2**.
The Chaplain's damage budget becomes party power instead: *Blessing* aura, all companions
+20% damage, plus the Chaplain's heals free a party slot (a Chaplain party can field 3 damage
dealers and still sustain). Target T3 checks classes stay within 15% of each other.

### 4.7 Enemy behaviours (introduced by zone)

| Type (first zone, enemy row) | Behaviour | Tests | Answer |
|---|---|---|---|
| Moss Slime (1, Front) | Plain melee | Nothing | Anything |
| Cave Bat (2, Mid) | **Skirmisher:** every 10s dives the lowest-HP back-row member for 3s, ignoring threat. From zone 9 (cycle II): **assassin**, dives for 5s at x2 damage | Backline safety | Peel: stun, knockback, slow or kill it fast (Kestrel, Aldric, Ranger focus) |
| Rattlebones (3) | **Armoured archer** (Mid): ranged, hits any row by threat; physical hits deal 50%; reassembles once at 20% HP unless the killing blow is caster damage or a burn | Damage type | Casters, burns, Wren's Mark, Execute |
| Barrow Beetle (4, Front) | **Bruiser:** attack x1.8, speed 0.6, always attacks the tank if one holds threat | Tank sustain | A support, shields, Guard/Shield Wall |
| Spore Cap (5, Back) | **Caster:** every 6s a spore cloud hits every party member for 0.8x attack plus poison 2% max HP/s for 4s | Group healing | Sanctuary, Rally Hymn, cleanses, wards |
| Quarry Golem (6, Front) | **Armoured bruiser:** attack x2.5, speed 0.4, armoured; every 3rd hit is a row slam on the whole Front column | Tank + damage type | Tank with a healer, casters |
| Marsh Wraith (7, Back) | **Healer:** channels 1.5s (shown with a green "+") to heal its most hurt ally 15% max HP, every 5s | Burst and interrupts | Stun (Aldric, Oriel, Lanternmage tap), focus it down (Ranger, Isolde) |

Behaviours stack with zone cycles: from zone 15, one enemy per pack can be an **elite** (x2 HP,
gold x2) carrying its type's behaviour at double strength.

### 4.8 Bosses and telegraphs (the active moment)

Every boss has the **heavy hit**: every 8s a 1.5s wind-up (red "!", shrinking ring, rising
tone) then 4x boss attack on its target. **Parry** = the class action in the last 0.8s (Maren
extends this to 1.1s): no damage, boss staggered 2s and takes +50% damage. Earlier = **Dodge**:
damage halved. Shield Wall, Aldric's Shield Bash and a Chaplain ward also count as parries, so
idle parties with the right members survive bosses without the player.

Each Elder boss adds its type's behaviour as a second telegraph:

| Boss | Second mechanic |
|---|---|
| Elder Slime | Splits into 2 half-HP slimes at 50% |
| Elder Bat | Dives the backline every 12s (blue "!" over the target ally) |
| Elder Rattlebones | Armoured; every 15s raises 2 skeleton adds |
| Elder Beetle | Heavy hit every 6s instead of 8s (a tank-buster) |
| Elder Spore | The heavy hit becomes a party-wide cloud: 1.5x attack to everyone (ward or heal) |
| Elder Golem | Heavy hit is 6x; armoured |
| Elder Wraith | Every 10s channels a 20% self-heal (green ring); any stun or parry-tap interrupts |

Boss timer rises from 30s to 45s. Taps outside a wind-up do the class tap. Hit areas are 44px
minimum. Reduced motion: no shake or ring animation; the "!" and a colour flash stay.

### 4.9 Knock-outs, wipes, retreat

- A member at 0 HP is **down** until the pack dies, then stands up at 30% HP (60% with Elowen).
- All 4 down = **wipe**. Toast: "Your party fell back to regroup." The party retreats one zone
  (`S.zone - 1`, min 1), fully heals after 5s and keeps farming. No gold, items or XP are lost.
- Auto-push returns to the wiped zone once the offline hold check (4.11) says it holds.
- Boss wipe or timeout = fail; `bossFail` fires as today.

### 4.10 Zone scaling

Everything enemy-side scales by `1.55^(z-1)`. Party power scales by levels, ranks, gear, hero
upgrades and relics. Walls come from both too little damage (TTK) and too little sustain
(incoming damage), and zone behaviours decide which one bites.

### 4.11 Offline estimate (closed form)

No simulation. The same function drives offline gains and auto-push. For `z = S.zone` down to
`S.zone - 10`, compute per zone:

```
D      = sum(member dps, armour-adjusted by zone type) * (1 + aoeShare) * 1.05     // damage rate
tgt    = tankHolds ? tank : highest-threat member in the Front column (melee share);  // who gets hit
         ranged share goes to the highest-threat member overall
tankHolds = tank exists AND tankThreatRate >= 1.2 * max(otherThreatRate * rowFactor)
in     = 1.5 * enemyAtk(z)/speed * behaviour(z).dmg * (1 - red(tgt)) * rowFactor                 // 1.5 enemies alive on average
spread = behaviour(z).aoe * enemyAtk(z) * 4 / 6s                                    // spore clouds etc., hit everyone
sus    = sum(heal rates) + shields/6s + regen(tgt) + 10% maxHp(tgt) per pack         // supports + Chaplain
holds(z) = (sus >= in + spread*share(tgt)) OR (hp(tgt) / (in + spread*share(tgt) - sus) >= 120s)
          AND (no backline member dies to spread + dives in 30s)
```

`behaviour(z)` is a small table per zone type (bruiser dmg x1.8, dives add damage to the lowest
back-row member, armour halves physical dps in `D`, healers add 15% effective HP). Use the
highest `z` that holds. Kills = `D * t / mobHp(z) * boost`.

Why composition matters idle: with no tank, `tgt` becomes a striker with 5x pow HP instead of
12x; with no support, `sus` is regen only. Either one drops the holdable zone by about 2 to 4
zones below what a balanced party holds, so the "While you were away" card is lower. The card
says where the party held: "Your party held Batwing Caves II."

Gold and essence from kills as today. **Companion XP offline:** fielded members get 75% of the
XP of those kills (3.3), levelled by a loop capped at the rank cap.

### 4.12 World raid

Keep it simple. The raid boss does not attack, and HP and threat do not matter. Party raid DPS
= `heroDps + fieldCompanionDps`, times `raidMult()`. Supports add their buffs (Blessing,
Hedgefolk speed) but no damage. The `raiders/<id>.dps` value keeps its shape (a number).

### 4.13 Viable line-ups

No class and no character is mandatory. Every class can field a tank and a support from the
roster. The strongest default is balanced: **tank + support + 2 damage**. Niches that must also
progress (checked by sim target T12):

| Niche | Example | Strength | Cost |
|---|---|---|---|
| Balanced | Warden + Hesketh + Wren + Pip | Holds the highest zone for its power | None; the default |
| Double support attrition | Chaplain + Tobin + Hesketh + Elowen | Almost never wipes; best overnight | Slow kills, weak boss timers |
| Glass cannon with a Warden | Warden + Wren + Kestrel + Isolde | Warden holds everything; fastest farm below par | Wipes at a push zone without active Shield Wall and parries |
| Caster pack-clear | Lanternmage + Aldric + Pip + Oriel | Packs melt, stuns cover healers | Low sustain; relies on killing first |

---

## 5. Itemisation

### 5.1 Companion gear (new item slots, same `S.items` bag)

| Slot id | Item | Fits | Recipe (tier 1, scales like hero recipes) | Stat from power `p` |
|---|---|---|---|---|
| `shield` | Shield | tank | ore 5, wood 2, ess 1 | +p% HP, +0.25p armour |
| `bow` | Bow / Spear / Blades (Wren, Kestrel, Isolde) | striker | wood 6, ore 1, ess 1 | +p% damage, +min(20, 0.05p)% crit |
| `staff` | Staff | caster | wood 4, ess 4 | +p% damage |
| `tome` | Tome | support | wood 2, ess 6 | +p% healing, +0.3p% shield strength |
| `trinket` | Trinket | any | ore 2, ess 4 | +0.6p% HP, -min(25, 0.05p)% ability cooldown |

Power, rarity, tiers, `+N` upgrades, salvage and forging all reuse the hero rules
(`itemPower`, `craftCost`, `upgradeCost`, `rollRarity`). The Forge's slot picker gets a second
row: "Party gear". Bag limit rises from 40 to 60.

Bosses: each zone boss kill has a 20% chance to also drop a companion item of the zone tier
(random role weapon or trinket, rolled rarity).

### 5.2 Hero gear stays relevant

- Weapon Might still multiplies the whole party (`dmgMult()` feeds companion power).
- Helm keeps crit and adds hero armour (0.1 x power), which matters for a Warden.
- Charm, Pickaxe, Axe unchanged. Existing uniques unchanged. Rattlebone Charm and
  Lantern Eater's Fang (`party` %) become stronger, which is intended.

### 5.3 Companion uniques (6)

Drop from zone bosses from cycle II (zone 8+), 10% per boss kill, pool by zone type. Raid pool unchanged.

| Unique | Slot | Source | Effect | Trade-off |
|---|---|---|---|---|
| Mossguard | shield | Mossy Hollow II+ | Tank reflects 20% of damage taken | - |
| Echo String | bow | Batwing Caves II+ | Crits fire a second shot for 50% | - |
| Ossuary Staff | staff | The Bonefield II+ | AoE damage +40% | Wielder takes +15% damage |
| Golem Heart | trinket | Quarry Ruins II+ | +50% max HP | -15% attack speed |
| Skyfall Spear | bow | Beetle Barrows II+ | **Kestrel only**: Leap strikes a second enemy | cannot be equipped by others |
| Saint's Wick | trinket | Wraithmarsh II+ | **Elowen only**: once per fight, revives the first downed ally at 60% HP | cannot be equipped by others |

(Fungal Deep II+ drops a guaranteed companion item instead of a unique.)

---

## 6. Save migration (v2 to v3)

Principle: never rename or repurpose a field. `S.comp`, `S.blade`, `S.swift`, `S.fortune`,
`S.items`, `S.equip`, `S.name` stay exactly as they are. New state lives under one new field.
There is one hero loadout: `S.equip` stays the only hero gear record (no `S.loadouts`).

```js
registerState('party', {
  v: 0,                     // 0 = not migrated, 1 = migrated
  cls: null, chosen: false, // class id; false until the creation / "Choose your path" screen is done
  mirrors: 0,               // Mirror of Embers owned
  field: [],                // up to 3 character ids
  cells: {},                // id or 'hero' -> cell 0..5 (col*2 + lane; col 0 Front, 1 Mid, 2 Back)
  rec: {},                  // id -> { lv, xp, rank, wpn: itemId|null, trk: itemId|null, seen: 0 }
  unlock: { renown: 0, quests: {}, tokens: {}, visitor: { day: -1, hired: false } },
                            // quests: id -> progress; tokens: id -> misses since last roll (pity)
  autoCast: true, wipeZone: 0
});
```
`S.v` becomes 3 after migration (a new value; old code never reads it as anything else).

**Mapping rules** (run once when `S.party.v === 0`, in `migrateParty()`):

1. Old index to character: 0 Squire -> `tobin`, 1 Archer -> `wren`, 2 Hedge Mage -> `pip`,
   3 Knight -> `aldric`, 4 Dragoon -> `kestrel`, 5 Starcaller -> `oriel`, 6 Lantern Saint -> `elowen`.
2. For each `i` with `n = S.comp[i] > 0`: recruit that character with `rank = min(7, floor(n / 25))`,
   `lv = min(25 * (rank + 1), max(1, n))`, `xp = 0`, no gear. Milestones already passed unlock
   silently; their camp stories are marked unread (a dot on the Party tab invites reading).
3. Migrated characters are recruited even if `S.maxZone` is below their unlock or their quest is
   not done. Hesketh also joins if `S.maxZone >= 3` (he would have joined at the zone 2 boss).
   No other character is granted, and existing saves get no class starter (3.1). Every
   character keeps their rarity from the roster table (Tobin, Wren, Pip Common; Aldric, Kestrel
   Rare; Oriel Epic; Elowen Legendary); the no-loss check below covers the difference.
4. Field = the 3 recruits with the highest DPS, a tank first if one exists. Cells by auto-placement.
5. **No-loss check:** `old` = the old `compDps()` (per-count formula). If the new field's damage
   is below `old`, add 1 level to every migrated character (ignoring the cap for this step only,
   bumping rank when the cap is passed) and repeat until it is not, max 500 steps.
6. `S.party.v = 1`, `S.v = 3`, `S.party.chosen = false` (the "Choose your path" screen shows
   next, Warden preselected), save.
7. `S.comp` is left untouched (read-only history). New code never writes to it.
8. Items: all existing items keep ids and slots. No companion gear exists yet.

Fixture: `tests/fixtures/save-v2.json` (comp `[25,14,6,0,0,0,0]`, maxZone 5) must migrate to
Tobin rank 1 lv 25+, Wren lv 14+, Pip lv 6+, Hesketh lv 1, with field damage >= old `compDps()`.
Add `tests/fixtures/save-v2-late.json` with all 7 comps > 0 and check the same.

---

## 7. UI on a 360px phone

### 7.1 Tabs and first launch

Five tabs: **Fight, Party, Gather, Forge, World** (World = Raid and Tavern as two sections,
Raid first). New games open on the character-creation screen (2.1); existing saves see
"Choose your path" once. Both are full-screen, one column, 4 class cards of 328 x 88px with
sprite, name, pitch and ability, then a name field and a 48px "Begin" button.

### 7.2 Party tab (loadouts visible)

Top to bottom, 16px side gutter, 328px content width:

1. **Formation** (328 x 140): a 3 x 2 grid mirroring the stage, Back | Mid | Front from left to
   right, upper and lower lanes, each cell 104 x 64 with a 32px portrait. Tap a member then tap a
   cell to move or swap; long-press 150ms to drag. Cells a member may not use are dimmed while it
   is picked up. An "Auto" button places by role (4.2). Warnings show as one amber line under the grid.
2. **Hero card** (328 x 96): portrait 48px, name, class, level, ability name with cooldown, and
   the 5 hero gear icons (32px each). Tap = hero sheet.
3. **Companion cards** x3 (328 x 88 each): portrait 48px, name and title, level and rank, role
   pip, ability name and cooldown, the 2 gear icons (role weapon, trinket) at 32px, an XP bar
   (gold when at the cap: "Promote"). A "+100% XP" badge shows while catch-up applies.
4. **Synergies**: a row of chips (name + icon), lit when active, dim with "needs Pip" when one
   member short. Tap a chip = its effect.
5. **Roster** (bench and locked, 18 slots): 4-per-row grid of 76 x 96px tiles. Each tile has a
   2px **rarity frame** (Common stone, Rare blue, Epic violet, Legendary gold with a slow 2-frame
   shimmer, static under reduced motion), the portrait, level and a role pip. Filter chips above
   the grid: All, Tank, Striker, Caster, Support, plus a rarity sort. Tap = sheet; "Field" swaps
   with a chosen member.
   - **Locked characters** show a black silhouette inside their rarity frame, their name and
     title, and one **how to recruit** line under the tile ("Reach zone 12, then 150K gold",
     "Renown 12/15", "Dusk Contract: 30% next boss", "Visits the Tavern in 3 days"). The bio stays
     hidden until they join. Tap a locked tile = a small sheet with the full route and a progress bar.
6. **Leads**: one card per open recruit route with progress (quests, Renown, token pity, bestiary,
   the Star Chart recipe), each with a progress bar and one button (Hand in, Craft, Go to Tavern).

### 7.3 Character sheet (bottom sheet, 90% height, swipe down or X to close)

```
[ portrait 64 ]  Wren Hollowmere      Common   Lv 34  Veteran
                 the Batwing Archer   Striker   Hedgefolk
                 [#########-----] XP  (+60% catch-up)
-----------------------------------------------------------
Wren learned to shoot in the caves, where you aim at
sounds. She talks to her arrows. Most of them come back.
-----------------------------------------------------------
HP 12.4K  DMG 3.1K/s  Armour 0  Speed 1.2  Crit 25% x3.0
Threat x1   Row: Mid (upper)   Targeted by: 0 enemies
-----------------------------------------------------------
[ Bow 56px ]  [ Trinket 56px ]
-----------------------------------------------------------
Marked (speciality) . Aimed Shot, every 10s . Echo (L10)
-----------------------------------------------------------
Synergies: Hedgefolk (active)  Mark and Leap (needs Kestrel)
Milestones: L5 v  L10 v  L15 v  L20 (next)  L25
Stories: Arrows in the Dark . The Bat Queen
-----------------------------------------------------------
[ Promote 2.1M ]   [ Bench ]
```
The hero sheet swaps the bio for the class pitch, shows the 5 hero gear slots (5 x 56px), the
tap action for the class, and "Mirror of Embers: 0" with a Use button when one is owned.

### 7.4 Stage layout (logical canvas 180 x 100 at P = 2)

On phones the stage is 180-220 CSS px tall, so `P = 2` and the logical canvas is 180 x 100 with
ground line `GY = 84`. Positions are foot-centre x in logical pixels (and fractions of `LW` for
other widths). The upper lane is 8px higher and 4px further back, drawn first.

```
            PARTY                                   ENEMIES
  Back       Mid       Front      gap      Front      Mid       Back
  x=22       x=46      x=70     (86-96)    x=112      x=136     x=160
  (0.12)    (0.26)    (0.39)               (0.62)    (0.76)    (0.89)
  upper lane: x-4, foot y=76      lower lane: foot y=84
  boss: one 24x24 sprite at scale 3, centred x=138
```
- Units are 16 x 16 source pixels at scale 2 (32 logical px). Neighbouring columns overlap by
  about 8px; draw order is upper lane then lower lane, back column to front column.
- HP bar 16 x 2px, 3px above each head: green > 50%, amber > 25%, red below; shields as a white
  segment on the right. Down = grey sprite, no bar.
- **Threat markers:** a 3px pip above each enemy in the colour of its target's role (tank blue,
  striker green, caster violet, support gold) and a 1px dotted line from the enemy to its target
  (40% opacity; setting "Show targets", default on). When an enemy leaves a tank for someone
  else, its pip turns red for 1s and the new target's portrait card flashes an eye icon.
- **Numbers:** damage white (crits orange, as today), heals green "+123" rising over the healed
  ally, shields white "+123" with a small shield glyph, misses/parries "PARRY" in gold.
- Ability button: 56px circle, bottom-right of the stage, cooldown as a pie sweep, gold ring when
  auto-cast is on. Companion ability pips: 6px dots under each HP bar that fill as cooldowns run.
- Boss "!" 12px above the boss (red = heavy hit, blue = dive, green = heal channel); parry ring
  centred on the boss or, for a Chaplain ward, on the targeted ally. 44px minimum hit areas.

### 7.5 Movement on stage (what the art must show)

| Action | Motion |
|---|---|
| Melee striker attack | dash from Mid to 14px short of the enemy Front (200ms), strike frame, dash back (250ms) |
| Tank intercept | step forward 8px on taunt; when a diver lands in the back row, the nearest adjacent tank steps back one column beside the target (200ms), taunts, returns after 2s |
| Assassin/skirmisher dive | parabolic leap over the Front line (400ms, 16px apex), lands 12px in front of its target; leaps back when the dive ends |
| Caster cast | 2-frame cast pose in place, projectile 6px per frame, AoE burst on arrival |
| Healer cast | stays back; 2-frame cast, green motes rise on the target (8 particles) |
| Enemy ranged | arrow or spore projectile on a 6px arc |
| Enemy healer channel | green ring on the Wraith, then motes flow to its ally |
| Knockback | target slides 6px back over 150ms |

Reduced motion: dashes and leaps become instant position swaps with a 1-frame flash; no apex
arcs, no shake.

---

## 8. Art direction

- **Sizes (source pixels):** party and normal enemies 16 x 16; zone bosses 24 x 24; raid wyrm
  unchanged. Draw scale 2 for units, 3 for bosses at P = 2. Party-tab portraits are the same
  sprites cropped to the head and shoulders (16 x 12) at 4x.
- **Frames:** idle 2 (bob 1px, 500ms each); attack 3 (wind-up 120ms, strike 80ms, recover
  150ms); cast 2; hit 1 (white flash 80ms plus 1px knockback); down 1; dash/leap reuse attack
  frame 1. Enemies add wind-up 2 frames (crouch, raised) looped during telegraphs with an outline
  pulse at 4Hz in the telegraph colour.
- **Palette:** max 7 indices per sprite plus outline `#0B0810` (as today). Each character has
  its own palette from its brief (3.2), and a role accent on one index so role reads at a glance:
  tank steel blue `#3E63C9`, striker green `#3E8A4E`, caster violet `#8A4FC9`, support gold
  `#F2C14E`. The 4 hero classes reuse one hero body with a palette swap plus one overlay (Warden
  shield, Lanternmage lantern-staff, Ranger bow, Chaplain censer). Zone cycles keep `shiftPal`.
  Silhouettes must differ at 1x (height, head shape, prop), not only colour.
- **Pipeline extension:** a sprite becomes `{ base: rows[], frames: { idle: [delta, delta], attack: [...], ... } }`
  where a delta is a list of `[x, y, index]` pixel overrides or a whole-row replacement. Frames
  are baked once per `(key, frame, paletteKey)` into an offscreen canvas and cached; drawing
  stays one `drawImage` per unit per frame. Props are separate 8 x 8 maps with a pivot, drawn
  after the body (as the hero tool is today). Movement (dash, leap, knockback) is a position tween
  in the stage code, not extra frames.
- **Motion budget:** at most 10 animated units on screen (4 party, 3 enemies, adds); 60fps
  target, 30fps on low-end. `prefers-reduced-motion`: idle frames freeze, tweens snap, flashes stay.

---

## 9. Balance targets (tools/sim.mjs)

Baseline today (`--policy mixed --seed 1`): zone 14 at 30m, 20 at 1h, 29 at 2h, 51 at 3h.

The simulator gets flags `--class warden|lanternmage|ranger|chaplain`, `--lineup <ids>`,
`--active 0|1` (1 = class taps at 3 per second with good choices, casts on cooldown, parries 80%
of wind-ups) and `--offline-check`.

| # | Target | Pass band |
|---|---|---|
| T1 | Idle mixed policy, balanced line-up, any class: max zone at 30m / 1h / 2h | 12-16 / 18-22 / 26-32 |
| T2 | Late-game runaway: max zone at 3h | <= 42 (today's 51 is a known runaway) |
| T3 | Class spread: time to zone 20 for each class (best line-up for it) vs the median | 0.85-1.15 |
| T4 | Active vs idle (`--active 1` vs `0`): time to zone 20 | active 20-35% faster |
| T5 | Wipes per hour while farming at `maxZone - 2`, balanced line-up | 0 |
| T6 | Offline holdable zone: no-tank or no-support line-up vs balanced | 2-4 zones lower |
| T7 | First boss attempt success rate, idle, balanced | 40-70% |
| T8 | Offline estimate vs simulated 1h of fighting (gold) | within +-15% |
| T9 | Migration of both fixtures: field damage vs old `compDps()` | >= 1.00, <= 1.30 |
| T10 | Top companion hits a level cap (promotion due) at least once per 20 min before 2h | yes |
| T11 | A new level-1 recruit fielded at zone 20 reaches party level - 5 | within 5-10 min |
| T12 | Each niche line-up in 4.13 reaches zone 20 | within 1.5x of balanced |
| T13 | Tank holds aggro (enemy-seconds on the tank / total), balanced party at par | >= 85% |
| T14 | Chaplain-led party: share of party damage from companions | >= 90%, and T3 still passes |
| T15 | Best all-Common line-up vs best available line-up: time from zone 20 to 30 | <= 1.5x |
| T16 | First Rare / first Epic / first Legendary recruited (mixed policy, idle) | 15-40 min / 1.5-3h / 6-12h |
| T17 | Worst-case pity: boss kills to a guaranteed token (Grenna / Isolde) | 12 / 10 |
| T18 | Each class + its starter only, idle: time to zone 5, wipes | 6-12 min, 0 wipes |

---

## 10. Build plan

Every stage ships behind `S.party.v` and a build flag `PARTY_STAGE` (A, B, C) in `00-util.js` so
main stays playable between merges. Each agent runs `node tools/build.mjs` and
`node tools/check.mjs`. Owners below are exclusive for the stage; "small edit" means an
extension-point change of a few lines, reviewed by the coordinator.

### Stage A: class choice, abilities, visible party, tabs

| Task | Owns | Small edits in |
|---|---|---|
| A1 Classes core: class table, one-time choice, Mirror of Embers, auras as `addModifier`, hero abilities and auto-cast, class tap actions (4.6) with idle auto-play, `registerState('party')` | `src/js/55-party.js` | `src/js/50-sim.js` (`playerTap` routes to the class tap) |
| A2 Art data: 16x16 hero body + 4 class overlays, the 7 migrated characters' sprites and portraits, frame deltas | `src/js/12-art-party.js` (core, data only) | - |
| A3 Animation + stage: frame baking/cache, 3x2 formation drawing (hero + top 3 old comps as their characters), position tweens, ability button | `src/js/61-anim.js` | `src/js/62-stage.js` |
| A4 UI: character-creation and "Choose your path" screens, Party tab shell (hero card, formation grid read-only), World tab merging Raid and Tavern | `src/js/75-party.js`, `src/js/76-create.js`, `src/styles/60-party.css` | `src/js/70-ui.js` (tab list), `src/js/74-ui-raid.js`, `src/js/74-ui-tavern.js` (register as World sections) |
| A5 Sim: `--class`, `--active` flags; T1, T3, T4 report | `tools/sim.mjs` | - |

### Stage B: the roster, levels, synergies, companion gear

| Task | Owns | Small edits in |
|---|---|---|
| B1 Roster core: 18 characters with rarity (power, growth, extra kit), starter by class, recruit costs, XP from use only, catch-up bonus, milestones, promotions, field/bench/cells, `fieldCompDps()`; `compDps()` switches to it when `S.party.v >= 1` | `src/js/56-roster.js` | `src/js/40-rules.js` (compDps), `src/js/51-actions.js` (hireComp retired) |
| B2 Specialities and synergies: speciality hooks, Rare traits, innate passives, Legend auras, 14 synergies, Common Cause, Bond, active-synergy query for the UI | `src/js/56b-synergy.js` | - |
| B3 Migration: `migrateParty()`, second fixture, check.mjs asserts T9 | `src/js/57-migrate.js`, `tests/fixtures/save-v2-late.json`, `tools/check.mjs` | `src/js/30-state.js` (call after load) |
| B4 Companion items: `COMP_SLOTS`, recipes, stats, 6 uniques, boss drops, bag 60 | `src/js/58-comp-items.js` | `src/js/20-data.js`, `src/js/40-rules.js` (itemName/itemColor), `src/js/73-ui-forge.js` (second row) |
| B5 Party UI: companion cards with loadouts, formation editor with auto and warnings, roster grid with rarity frames and locked silhouettes, leads, starter joining moment, character sheet with bio, synergies, milestones, stories | `src/js/75-party.js` (continues from A4) | - |
| B6 Writing and art: 11 new sprites and portraits (Hesketh, Bram, Maren, Thessaly, Anselm, Grenna, Isolde, Morwen, Vesper, Caedmon, Corvin), rarity frames, 5 gear icons, 54 camp stories, 3 joining moments (house voice) | `src/js/12-art-party.js`, `src/js/21-stories.js` (data) | `src/js/10-art.js` (ICON entries) |
| B7 Unlock avenues: Renown from bounties, character quests (incl. the no-support boss win), boss tokens with pity, bestiary and achievement unlocks, Tavern visitor rotation and hiring, Star Chart recipe, raid/expedition shortcuts | `src/js/56c-unlocks.js` | `src/js/74-ui-tavern.js` (visitor section); listens to Phase 0 bounty, bestiary and achievement events; Star Chart recipe via the gathering spec's Enchanter's Table (K6) |

### Stage C: party combat

| Task | Owns | Small edits in |
|---|---|---|
| C1 Combat core: HP, packs, formation reach, threat tables, damage, healing, shields, CC, KO, wipe/retreat | `src/js/59-combat.js` | `src/js/50-sim.js` (tick branches to `combatTick` when flag C) |
| C2 Enemy behaviours and bosses: 7 behaviours, elites, 7 boss mechanics, telegraphs, parry/dodge/ward resolution | `src/js/59b-enemies.js` | - (called from C1's hooks) |
| C3 Offline/auto-push estimate: `partyHoldEstimate()` per 4.11 | `src/js/58-offline.js` | `src/js/50-sim.js` (awayGains fight branch calls it) |
| C4 Stage combat visuals: packs, HP bars, threat pips and lines, heal/shield numbers, dives, dashes, intercepts, telegraph colours, reduced motion | `src/js/61-anim.js`, `src/js/62-stage.js` | - |
| C5 Sim: combat in the loop, `--lineup`, T5-T14 | `tools/sim.mjs` | - |

C1 and C3 both touch `50-sim.js`: C1 merges first, C3 rebases. C2 depends on C1's hook names;
agree them first (`onEnemyTick(enemy, dt)`, `onTelegraph(enemy)`, `resolveParry(source)`).

---

## 11. Open questions for the owner

1. **Growth by rarity:** higher rarities also grow slightly faster per level (x1.080 to x1.083),
   so by level 150 a Legendary is about 1.5x further ahead than base power alone gives. Keep it,
   or make rarity a flat base-power multiplier so Commons stay closer late?
2. **Tavern visitor clock:** the rotation uses the device date, so changing the phone clock
   brings a visitor early. It is single-player and harmless; is that acceptable, or should it
   count in-game days (24h of play time) instead?
3. **Legendary pacing:** Caedmon (Region 1 clear + Renown 80) and Corvin (150 boss kills + every
   bestiary page at tier 2) are 10h+ goals; Elowen is about 6-12h. Is that the right length for
   the long hunt?

## Owner decisions (2026-09-27)

These override anything above that disagrees.

1. **Party gets its own tab.** Raid and Tavern merge into one "World" tab, keeping five tabs: Fight, Party, Gather, Forge, World.
2. **Enemies come in packs of 3.** As specified.
3. **Hero ability auto-casts at half rate** once unlocked at zone 10. Casting it manually stays twice as effective.
4. **The class is a starting choice, with one loadout.** The class is chosen at character creation (or once for existing saves) and changes only with a Mirror of Embers. There is one hero loadout (`S.equip`); the earlier per-class `S.loadouts` decision is withdrawn because the class no longer changes day to day.
5. **A party wipe retreats one zone** (coordinator's call), and the party pushes back up automatically once it can hold that zone.
6. **Companions are named characters** with bios, specialities, signature abilities and synergies. They grow through use: only fielded characters earn XP, with a catch-up bonus and milestone unlocks, and promotions gated by level caps.
7. **Roles define combat:** threat and aggro, healers who heal rather than deal damage, formation rows with reach rules, enemy behaviours that test composition, and class-specific taps.

### Owner decisions, round 3 (2026-09-27)

These override the spec above where they conflict.

- **Power curve (changed by the owner in round 4):** rarity defines strength, not unlock order. Common x1, Rare x1.5, Epic x2.2, Legendary x3.2 base power, with slightly faster growth per level and extra kit for higher rarities (3.1). Rarity is fixed per character. Commons stay useful through synergies, utility, cheap promotions and faster XP. The earlier rule "later recruits are stronger, x1.6 per tier" is withdrawn.
- **Round 4:** 18 characters (5 Common, 5 Rare, 5 Epic, 3 Legendary), each with a deterministic unlock route across progress, quests, boss tokens with pity, Renown, achievements and bestiary, the Tavern visitor, crafting, and optional raid or expedition shortcuts. No random paid pulls, no gacha, nothing pay-to-win.
- **Mirror of Embers:** zone boss drop only, 2% from zone 36. It is not sold for raid Embers.
- **Supports and casters:** allowed in any row, with warnings. Auto-placement puts them in the back row.

### Owner decisions, round 5 (2026-09-27)

- **Rarity is a flat base-power multiplier.** Common x1, Rare x1.5, Epic x2.2, Legendary x3.2. Every rarity uses the same per-level growth (x1.080), so the gap never widens with level. Drop the per-rarity growth rates.
- **The Legendary hunt stays long, as designed.** Elowen takes about 6–12 hours; Caedmon and Corvin take 10 hours or more.
- **The Tavern visitor uses the device date** (coordinator's call). Clock changes only affect the player's own single-player game, so there is no play-time gate.
