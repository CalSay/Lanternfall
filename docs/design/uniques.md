# Uniques: design and measured review draft

Draft for Claude and the economy/balance judge. **Do not merge. No items or effects are wired.**
Checkpoint: integration branch `claude/elegant-johnson-m6k00u`, `601a37a8`, 7 October 2026.

**The list is not stable for art.** This draft contains 21 proposals. Four have no legal starter fixture, and the remaining results inherit substantial above-band baseline gaps. Every good-persona result is above the requested 85–95% first-clear aim. None is claimed approved or ready to ship. Do not start PR 2 from this version. Changing the boss curve to make these pass is outside this docs-only task.

## Card test

Loop step: one fight, steps 2–3 (choose an action, defend); 5-minute visit, step 3 (equip what you won); week, step 3 (chase a build piece). Pillars: 1, 3, 5 and 6. Proposed scores: Impact 3, Evidence 4 for the measured combat proposals / 2 for gathering yield and unsupported fittings, Fit 4, Cost 1 (a complete authored icon pack), Reversibility 5. Measured proposals: Value 11, Total 17. Unmeasured proposals: Value 9, Total 15. Scores are design estimates, not a judge ruling. The dominance and balance gates below still bind; a numerical score cannot waive them.

## Scope and save compatibility

New items use the existing `{id, slot, t, r, plus, u}` model and `S.found[u]` ownership. Existing defaults already handle an absent new key. No renamed field, save key, new currency, inventory position or menu. Trigger state lasts for one fight, inside the combat model, and resets on victory, defeat, retreat or a new fight. It is never saved.

Old unique definitions and earned instances remain readable. Do not rewrite an old item's `slot` or repurpose an old `u` key. New proposals receive new IDs (the hyphenated IDs below); old IDs remain distinct. An eventual implementation must have an explicit item-model test before any old drop pool is retired. No online, world raid, Tavern, leaderboard or capability changes belong here.

## Current uniques: keep, rework or replace

These are all 13 entries of `UNIQ` in `src/js/20-data.js`. The current drop item has no random affixes; `UNIQ_TUNE.pow = 1.8` gives rare base power, despite the `legendary` rarity label reading “Unique”. Current ordinary first-clear chance is 15%, repeats 4%, multiplied by 0.5 when the item has been found at that tier or higher. Deeds/modifiers can raise these odds. The “all classes” comment in old item code is not a fittings rule: `fits` and `CRAFT_FITS` are the authority.

| Existing key | Current effect | Proposed disposition and reason |
|---|---|---|
| sproutblade | 10% extra Essence on a kill | Replace future single-player drops with Oath of the Hollow after review; retain earned Sproutblade and its old key. An always-on farm bonus is outside the skill-reward direction. |
| echocowl | Crits echo for 50% | Replace future drops with new Veil of the Unheard ID; earned legacy version retained. An unconditional extra hit has no timing tradeoff. |
| rattlecharm | Ability damage +20% | Replace future drops with new The Final Answer ID; legacy retained. Flat ability power is too broad. |
| carapacepick | 25% extra ore per swing | Rework future drops as new Burrower's Promise ID, rare-find tradeoff; legacy retained. Do not silently remove earned ore yield. |
| sporeheart | Away gains +50% | Replace future drops with Harvest of Whispers; legacy retained. An away-only advantage encourages loadout maintenance and obscures the cap. |
| golemfist | Attack damage doubled | Replace future drops with Gate of the Deep; legacy retained. Double Attack can carry a fight without defence. |
| wispaxe | Chopping speed +30%, 20% extra log | Rework future drops as new Reed of Remembrance ID, rare-find tradeoff; legacy retained. |
| wyrmscale | Raid damage +25% | Keep untouched, online source excluded. Not certified balanced by this draft. |
| hollowcrown | Gold +10% | Keep untouched, online source excluded. Not certified balanced. |
| colossuspick | All gathering +40% speed | Keep untouched, online source excluded. Not certified balanced. |
| hydraglass | Crit chance +10 percentage points | Keep untouched, online source excluded. Not certified balanced. |
| eaterfang | Might +30%, counters +100% | Keep untouched, online source excluded. Not certified balanced. |
| tyrantaxe | 30% extra logs, all gathering +20% | Keep untouched, online source excluded. Not certified balanced. |

### Current legacy numbers (unchanged)

Current base power is `1.8 × TIER_POW[t] × (1 + 0.15plus)`: 18 / 39.6 / 75.6 / 135 / 234 at G1–G5 +0, equal to rare base and 180% of common. Legacy drops have no rolled affixes; the effect lines below are fixed while base lines scale with grade/upgrades. The table evaluates the current formula at G1+0, including effects, even for raid items whose actual first drop has a higher grade; these are not proposed new-item stats. Head/weapon legacy kinds must not be compared as if their class-specific successor had the same base lines.

| Existing ID | Kind | Source | Actual G1+0 lines, effect included | Existing base drop chance |
|---|---|---|---|---|
| sproutblade | weapon | Zone boss · Mossy Hollow | might 18; essExtra 0.1 | first 15%, repeat 4%, owned ×0.5; existing modifiers |
| echocowl | helm | Zone boss · Batwing Caves | crit 2.16; critMult 0.09; armour 1.8; echo 0.5 | first 15%, repeat 4%, owned ×0.5; existing modifiers |
| rattlecharm | charm | Zone boss · The Bonefield | gold 0.72; ess 5.4; abil 20 | first 15%, repeat 4%, owned ×0.5; existing modifiers |
| carapacepick | pick | Zone boss · Beetle Barrows | mineSpd 10.8; oreDbl 1.8; oreFind 0.216; oreExtra 0.25 | first 15%, repeat 4%, owned ×0.5; existing modifiers |
| sporeheart | charm | Zone boss · Fungal Deep | gold 0.72; ess 5.4; offline 50 | first 15%, repeat 4%, owned ×0.5; existing modifiers |
| golemfist | weapon | Zone boss · Quarry Ruins | might 18; tap 2 | first 15%, repeat 4%, owned ×0.5; existing modifiers |
| wispaxe | axe | Zone boss · Wraithmarsh | woodSpd 40.8; woodDbl 1.8; woodFind 0.216; woodExtra 0.2 | first 15%, repeat 4%, owned ×0.5; existing modifiers |
| wyrmscale | helm | World raid · The Ashen Wyrm | crit 2.16; critMult 0.09; armour 1.8; raid 25 | share ≥25%: 100%; otherwise 35% + 2×share; no owned scaling |
| hollowcrown | helm | World raid · The Hollow King | crit 2.16; critMult 0.09; armour 1.8; gold 10 | share ≥25%: 100%; otherwise 35% + 2×share; no owned scaling |
| colossuspick | pick | World raid · The Mire Colossus | mineSpd 10.8; oreDbl 1.8; oreFind 0.216; gather 40 | share ≥25%: 100%; otherwise 35% + 2×share; no owned scaling |
| hydraglass | charm | World raid · The Glass Hydra | gold 0.72; ess 5.4; crit 10 | share ≥25%: 100%; otherwise 35% + 2×share; no owned scaling |
| eaterfang | weapon | World raid · The Lantern Eater | might 48; counter 100 | share ≥25%: 100%; otherwise 35% + 2×share; no owned scaling |
| tyrantaxe | axe | World raid · The Pale Tyrant | woodSpd 10.8; woodDbl 1.8; woodFind 0.216; woodExtra 0.3; gather 20 | share ≥25%: 100%; otherwise 35% + 2×share; no owned scaling |

World raid items are paid on generation rollover after contributing damage, not per road boss clear. Their grade is min(5, generation); the six bosses cycle by generation. The share formula is 1 at 25%+ contribution, otherwise min(1, 0.35 + 2share); ordinary owned scaling does not apply. This is a read-only audit of 52-raid.js, not an online change or a proposal to import that generous chance into road drops. Ordinary road grades come from zoneTier. No cooldown or resource cost is attached to the legacy effects. Their flat effects and broad gathering bonuses are not certified sidegrades by this draft.

Legacy raid uniques receive owner-authorized visual concepts and proposed display names in the registry below. No solo budget results are claimed for them. This PR changes no earned effects or runtime definitions.

## Proposed item list

Zones use today's actual road area and region; boss type still cycles every seven zones. Those are different tables. Do not infer a boss type from the area name. Today's boss labels are “Elder <type>”; the Captain/Champion label work is not assumed. A proposal can first drop after winning its listed zone. Later repeat sources of the same type may offer the same fixed-grade item; it does not auto-scale upward. No region beyond the Hollow is assumed.

| ID / name | Kind / position | Fits | First zone / area / region | Boss type | Fixed grade |
|---|---|---|---|---|---|
| moss-sword / Oath of the Hollow | warblade / weapon | Warrior / warden | 1 / Mossy Hollow / the Hollow | Moss Slime | G1 |
| bat-bow / Vesper's Reach | bow / weapon | Ranger | 2 / Mossy Hollow / the Hollow | Cave Bat | G1 |
| wisp-staff / The Wandering Light | staff / weapon | Mage / lanternmage | 7 / Batwing Caves / the Hollow | Marsh Wraith | G2 |
| bone-censer / Requiem Bell | censer / weapon | Mage / lightkeeper (held) | 3 / Mossy Hollow / the Hollow | Rattlebones | G1 |
| quarry-shield / Gate of the Deep | shield / off | Warrior / warden | 6 / Batwing Caves / the Hollow | Quarry Golem | G1 |
| bat-quiver / Night's Reserve | quiver / off | Ranger | 9 / Batwing Caves / the Hollow | Cave Bat | G2 |
| wisp-lantern / Mercy of the Fen | lantern / off | Mage / lanternmage | 14 / The Bonefield / the Hollow | Marsh Wraith | G3 |
| bone-tome / The Unfinished Prayer | tome / off | Mage / lightkeeper (held) | 10 / Batwing Caves / the Hollow | Rattlebones | G2 |
| beetle-helm / Crown of the Burrow | greathelm / helm | Warrior / warden | 4 / Mossy Hollow / the Hollow | Barrow Beetle | G1 |
| echo-cowl / Veil of the Unheard | hood / helm | Ranger | 2 / Mossy Hollow / the Hollow | Cave Bat | G1 |
| spore-circlet / The Scarlet Vigil | circlet / helm | Mage / lanternmage | 5 / Mossy Hollow / the Hollow | Spore Cap | G1 |
| bone-mitre / Last Rites | mitre / helm | Mage / lightkeeper (held) | 17 / Beetle Barrows / the Hollow | Rattlebones | G3 |
| quarry-plate / Mountain's Covenant | plate / body | Warrior / warden | 13 / The Bonefield / the Hollow | Quarry Golem | G3 |
| marsh-leathers / The Drowned Huntsman | leathers / body | Ranger | 7 / Batwing Caves / the Hollow | Marsh Wraith | G2 |
| spore-robe / Mantle of the Red Moon | robe / body | Mage / lanternmage | 12 / The Bonefield / the Hollow | Spore Cap | G2 |
| bone-vestments / Vestments of the Last Dawn | vestments / body | Mage / lightkeeper (held) | 24 / Fungal Deep / the Hollow | Rattlebones | G4 |
| rattlebone-charm / The Final Answer | charm / charm | All hero classes | 3 / Mossy Hollow / the Hollow | Rattlebones | G1 |
| carapace-pick / Burrower's Promise | pick / pick | All hero classes | 4 / Mossy Hollow / the Hollow | Barrow Beetle | G1 |
| wisp-axe / Reed of Remembrance | axe / axe | All hero classes | 7 / Batwing Caves / the Hollow | Marsh Wraith | G2 |
| spore-sickle / Harvest of Whispers | sickle / sickle | All hero classes | 5 / Mossy Hollow / the Hollow | Spore Cap | G1 |
| moss-spear / Thorn of the First Grove | spear / spear | All hero classes | 8 / Batwing Caves / the Hollow | Moss Slime | G2 |

The four lightkeeper proposals are **held**. The three starter fixtures cannot legally equip their kinds, so Pip is not used as a fake proxy. Trinity-style support gear remains part of the catalogue proposal, pending a real hero fitting and budget fixture. Trinket is not added: it has companion position `trk`, not a solo hero slot. Heroes only equip the kind they can wear; no universal unique weapon or per-hero authored effect is proposed.

## Mechanics and costs

All percentage bonuses multiply the named action's damage, not the hero's global Attack stat. They cannot widen a timing window, auto-defend, prevent a status or grant immunity. Armour and HP receive no new defensive proc. Existing 40% boss-hit cap in zones 1–15 remains on the boss side before mitigations. No item changes that cap or offers a one-shot exemption.

Three deliberately narrow rule families are used so each item does not introduce a new subsystem:

* **P — complete parry:** parry every hit of one foe move. Its ordinary counter deals B% more. Your next successful Attack deals C% less. Repeated counters refresh the pending Attack penalty; they do not stack it. The counter remains physical and uses the existing Guard counter multiplier. A partially parried combo earns no bonus. Player change: finish the whole defence, then decide whether to pay the weaker Attack or use an ability first. The liability does not expire while waiting or defending.
* **D — complete dodge:** dodge every hit of one foe move. Your next successful Attack deals B% more, and your next successful ability deals C% less. Each is consumed separately; another clean dodge refreshes, never stacks. An unsuccessful action does not consume it. Player change: use an Attack to cash out a safe defence; ability-heavy builds prefer crafted gear. Mixed parry/dodge moves do not qualify.
* **T — Perfect ability:** all timing rings of a damaging ability must be Perfect, and at least one ring must exist. That direct cast deals B% more; the next successful Attack deals C% less. Untimed abilities, status ticks, healing, warding and misses receive no bonus. Player change: pursue the timed cast, then accept its weaker Attack. Focus multiplies the ability through the existing formula; the bonus adds no attribute points.

No real-time cooldown, daily limit or resource cost. The cost is weaker raw gear plus a combat action liability. Pending rewards/costs persist until their action or fight end. A failure to defend still has its normal consequence. No stacking across items is certified: combination tests remain a hard hold, described below.

**G — tools:** normal gathering speed and double-yield lines are 80% of the equivalent common crafted tool, while its rare-find line is 120% of that common line, still subject to the existing 8% cap. Equivalently, start at 80% and multiply only the find line by 1.5. All normal gathered units, skill XP, offline caps, Glints, Storehouse limits and fees retain their live rules. The effect applies to the tool's existing gathering skill, including away work, and never to Hands as a new global multiplier. No tap, timer or resource is added. Player change: choose rare finds over bulk output. The spear remains a hunting tool, not a combat weapon; only the three live hunt grades are usable.

## Numbers and working

For grade t and upgrade n, let `B = TIER_POW[t] × (1 + 0.15n)`. Today G1–G5 are 10, 22, 42, 75, 130 at +0. Crafted common base power is B; rare is 1.8B; epic 2.5B. Proposed unique base power is **0.8B** (20% below common, 55.56% below rare). It has no rolled affixes or Masterwork bonus; an implementation must prevent accidental legendary affix rolls. Use per-definition base-power metadata for new IDs; do not change UNIQ_TUNE.pow globally, which would weaken earned legacy items. This is definition data, not a new saved item field. No 3.2× legendary multiplier. Reforge is unavailable because it has no random line. Normal upgrade costs and Trophy gates stay; effects do not grow with upgrades. A new drop is +0.

The comparison below is at +0 with no affixes. Weapon Might is a percentage input to `heroAtk`, not flat Attack. Head/body/off-hand quantities are the actual `craftBaseLines` stat units. The same grade alone is not enough for a comparison: rare affixes and upgrades make the crafted alternative stronger still.

| Unique | Common crafted base lines | Rare crafted base lines | Unique base lines | B / C payoff | Scaling | Base first / repeat odds; owned |
|---|---|---|---|---|---|---|
| Oath of the Hollow | might 10 | might 18 | might 8 | P: +16% / −12% | Guard (counter); Might (Attack cost) | 15% / 4% pool; ×0.5 selected-owned |
| Vesper's Reach | might 10 | might 18 | might 8 | D: +16% / −12% | Might (Attack); Focus (ability cost) | 15% / 4% pool; ×0.5 selected-owned |
| The Wandering Light | might 22 | might 39.6 | might 17.6 | T: +12% / −10% | Focus (ability); Might (Attack cost) | 15% / 4% pool; ×0.5 selected-owned |
| Requiem Bell | might 10 | might 18 | might 8 | T: +10% / −8% | Focus (ability); Might (Attack cost) | 15% / 4% pool; ×0.5 selected-owned |
| Gate of the Deep | hp 10 | hp 18 | hp 8 | P: +12% / −8% | Guard (counter); Might (Attack cost) | 15% / 4% pool; ×0.5 selected-owned |
| Night's Reserve | crit 2.64 | crit 4.752 | crit 2.112 | D: +12% / −10% | Might (Attack); Focus (ability cost) | 15% / 4% pool; ×0.5 selected-owned |
| Mercy of the Fen | spell 8.4 | spell 15.12 | spell 6.72 | T: +10% / −8% | Focus (ability); Might (Attack cost) | 15% / 4% pool; ×0.5 selected-owned |
| The Unfinished Prayer | heal 22 | heal 39.6 | heal 17.6 | T: +8% / −6% | Focus (ability); Might (Attack cost) | 15% / 4% pool; ×0.5 selected-owned |
| Crown of the Burrow | hp 5 | hp 9 | hp 4 | P: +10% / −8% | Guard (counter); Might (Attack cost) | 15% / 4% pool; ×0.5 selected-owned |
| Veil of the Unheard | hp 5 | hp 9 | hp 4 | D: +10% / −8% | Might (Attack); Focus (ability cost) | 15% / 4% pool; ×0.5 selected-owned |
| The Scarlet Vigil | hp 5 | hp 9 | hp 4 | T: +8% / −6% | Focus (ability); Might (Attack cost) | 15% / 4% pool; ×0.5 selected-owned |
| Last Rites | hp 21 | hp 37.8 | hp 16.8 | T: +12% / −10% | Focus (ability); Might (Attack cost) | 15% / 4% pool; ×0.5 selected-owned |
| Mountain's Covenant | hp 42 | hp 75.6 | hp 33.6 | P: +20% / −16% | Guard (counter); Might (Attack cost) | 15% / 4% pool; ×0.5 selected-owned |
| The Drowned Huntsman | hp 22 | hp 39.6 | hp 17.6 | D: +20% / −16% | Might (Attack); Focus (ability cost) | 15% / 4% pool; ×0.5 selected-owned |
| Mantle of the Red Moon | hp 22 | hp 39.6 | hp 17.6 | T: +16% / −12% | Focus (ability); Might (Attack cost) | 15% / 4% pool; ×0.5 selected-owned |
| Vestments of the Last Dawn | hp 75 | hp 135 | hp 60 | T: +16% / −12% | Focus (ability); Might (Attack cost) | 15% / 4% pool; ×0.5 selected-owned |
| The Final Answer | gold 0.4; ess 3 | gold 0.72; ess 5.4 | gold 0.32; ess 2.4 | P: +8% / −6% | Guard (counter); Might (Attack cost) | 15% / 4% pool; ×0.5 selected-owned |
| Burrower's Promise | mineSpd 6; oreDbl 1; oreFind 0.12 | mineSpd 10.8; oreDbl 1.8; oreFind 0.216 | mineSpd 4.8; oreDbl 0.8; oreFind 0.144 | G: find 120% of common | Find line grows with B; cap 8% | 15% / 4% pool; ×0.5 selected-owned |
| Reed of Remembrance | woodSpd 13.2; woodDbl 2.2; woodFind 0.264 | woodSpd 23.76; woodDbl 3.96; woodFind 0.4752 | woodSpd 10.56; woodDbl 1.76; woodFind 0.3168 | G: find 120% of common | Find line grows with B; cap 8% | 15% / 4% pool; ×0.5 selected-owned |
| Harvest of Whispers | forageSpd 6; forageDbl 1; forageFind 0.12 | forageSpd 10.8; forageDbl 1.8; forageFind 0.216 | forageSpd 4.8; forageDbl 0.8; forageFind 0.144 | G: find 120% of common | Find line grows with B; cap 8% | 15% / 4% pool; ×0.5 selected-owned |
| Thorn of the First Grove | huntSpd 13.2; huntDbl 2.2; huntFind 0.264 | huntSpd 23.76; huntDbl 3.96; huntFind 0.4752 | huntSpd 10.56; huntDbl 1.76; huntFind 0.3168 | G: find 120% of common | Find line grows with B; cap 8% | 15% / 4% pool; ×0.5 selected-owned |

Example: G2 weapon: common Might 22%, rare 39.6%, unique 17.6%. At +5 these are 38.5%, 69.3%, 30.8%. A P16/C12 effect multiplies the ordinary Guard-scaled counter by 1.16 and a later Might-scaled Attack by 0.88; it does not add 16 points of Might. Attribute coefficients and soft caps remain those of `55-attributes.js`; never multiply Attack, ability and counter by the same new global factor.

Rarity is a display label and source distinction. Crafting's common/uncommon/rare/epic weights in `rarityWeights` stay unchanged; crafting never rolls a unique. Current uniques have 1.8B base and therefore this is a deliberate *new-item* raw-stat reduction, not a claim the existing items are already weak.

### Drop pool, no extra rolls

Preserve one unique chance roll per boss win, never one roll per catalogue item. First clear 15%, repeat 4%, before existing modifiers. From items unlocked for that boss type, choose uniformly among legal class kinds and shared tools/charm, then apply the existing selected item's `found >= t` owned multiplier 0.5. There is no guaranteed unique, no extra cache chance, no paid reroll and no new pity counter. First-clear caches reveal the boss roll instead of rolling again.

If N eligible entries are unlocked, one specified unowned item has 15/N% first-clear chance and 4/N% repeat chance. Already owning that item at its grade or higher makes these 7.5/N% and 2/N%. At N=2: 7.5%/2%, or 3.75%/1% owned. At N=3: 5%/1.3333%, or 2.5%/0.6667% owned. These are base probabilities; the existing modifier must be quoted separately in player odds. The sum of all item chances cannot exceed the current pool roll. Fixed grade prevents a first-clear lower-zone farm from supplying next-grade gear.

The weighting is a proposal, not current `zoneUnique` behaviour (which picks one ID). Changing that pool requires a later code review and economy judge. No probability below is misrepresented as already live.

### Per-item odds at its first source

The entries below show unmodified odds for the relevant legal class at the item's listed first source. Shared entries show the range across warrior, ranger, lanternmage and lightkeeper; exact displayed odds must use the player's class. An item only enters a same-type pool after its listed zone has been cleared. Owned scaling is per selected item, not a new pool-wide penalty.

| Item | Eligible N at first source | Unowned first / repeat | Owned first / repeat |
|---|---|---|---|
| Oath of the Hollow | 1 | 15.0% / 4.0% | 7.5% / 2.0% |
| Vesper's Reach | 2 | 7.5% / 2.0% | 3.8% / 1.0% |
| The Wandering Light | 2 | 7.5% / 2.0% | 3.8% / 1.0% |
| Requiem Bell | 2 | 7.5% / 2.0% | 3.8% / 1.0% |
| Gate of the Deep | 1 | 15.0% / 4.0% | 7.5% / 2.0% |
| Night's Reserve | 3 | 5.0% / 1.3% | 2.5% / 0.7% |
| Mercy of the Fen | 3 | 5.0% / 1.3% | 2.5% / 0.7% |
| The Unfinished Prayer | 3 | 5.0% / 1.3% | 2.5% / 0.7% |
| Crown of the Burrow | 2 | 7.5% / 2.0% | 3.8% / 1.0% |
| Veil of the Unheard | 2 | 7.5% / 2.0% | 3.8% / 1.0% |
| The Scarlet Vigil | 2 | 7.5% / 2.0% | 3.8% / 1.0% |
| Last Rites | 4 | 3.8% / 1.0% | 1.9% / 0.5% |
| Mountain's Covenant | 2 | 7.5% / 2.0% | 3.8% / 1.0% |
| The Drowned Huntsman | 2 | 7.5% / 2.0% | 3.8% / 1.0% |
| Mantle of the Red Moon | 3 | 5.0% / 1.3% | 2.5% / 0.7% |
| Vestments of the Last Dawn | 5 | 3.0% / 0.8% | 1.5% / 0.4% |
| The Final Answer | 1–2 | 7.5%–15.0% / 2.0%–4.0% | 3.8%–7.5% / 1.0%–2.0% |
| Burrower's Promise | 1–2 | 7.5%–15.0% / 2.0%–4.0% | 3.8%–7.5% / 1.0%–2.0% |
| Reed of Remembrance | 1–2 | 7.5%–15.0% / 2.0%–4.0% | 3.8%–7.5% / 1.0%–2.0% |
| Harvest of Whispers | 1–2 | 7.5%–15.0% / 2.0%–4.0% | 3.8%–7.5% / 1.0%–2.0% |
| Thorn of the First Grove | 1–2 | 7.5%–15.0% / 2.0%–4.0% | 3.8%–7.5% / 1.0%–2.0% |

### Gathering tradeoff, not a universal upgrade

For an uncapped crafted tool with speed S and find chance F, compare expected rare finds per base-time unit: crafted `(1+S/100)F`; unique `(1+0.8S/100)1.2F`. The ratio is `1.2(1+0.8S/100)/(1+S/100)`, approaching 0.96 at extreme speed. At G1+0, S=6: ratio 1.1864; at G4+0, S=45: ratio 1.1255. This can make the unique best for a rare-find goal but not for bulk materials, XP pacing, or every player. Double-yield chance is also lower. At the 8% find cap the niche disappears; fall back to crafted tools. No unique must become necessary for a craft or node unlock. These are isolated expectation formulas; full economy, mastery and cap interactions are unvalidated.

## Budget experiment

240 independent seeded boss fights for each item, legal starter and persona at the drop zone and next two zones. Casual: parry 25%, dodge 50% of remaining hits, ability timing 10% Perfect / 40% Good. Good: 60% / 90%, 40% Perfect / 45% Good. Seeds and `measure` are from `tools/budget.mjs`; no copied damage formulas. Body/head/off gear is actually equipped through `fits`. The new drop stays at its drop grade and +0 at all three zones. Common +0 crafted fixture through zone 12, rare +5 beyond; typical Stars, talents and road-level attributes. A paired no-unique baseline uses exactly the same boss spawn seed 31415 and independent per-fight seeds. Tools do not alter combat.

**This is a prototype measurement, not live implementation validation.** The review-only hook scales base lines, replaces the legal slot, resets boss generation to the paired seed and wraps `turnHeroAct` / `turnContact` to implement P/D/T in memory. No tracked runtime file changes. T uses all-Perfect timed casts; certify damaging-only semantics separately before implementation. The harness is reproduced below. The stock Windows direct-entry guard returns without executing; importing `runBudget`/the exposed measurement is used instead. A zero-output CLI invocation is not counted as a successful budget run.

The table shows baseline and unique win rates with exact bands from the checked-in JSON, including Tobin's +10-point casual boss allowance. “Above/below” uses the bands themselves; it does not silently claim a dated gap is a pass. No band, gap limit, owner or expiry was changed. Means are not used to conceal an individual failure.

| Item | Zone / hero | Baseline casual / good | Unique casual / good | Casual / good band | Result |
|---|---|---|---|---|---|
| Oath of the Hollow | 1 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 95.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Oath of the Hollow | 2 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 95.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Oath of the Hollow | 3 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 95.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Vesper's Reach | 2 / wren | 100.0% / 100.0% | 100.0% / 100.0% | 85.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Vesper's Reach | 3 / wren | 100.0% / 100.0% | 100.0% / 100.0% | 85.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Vesper's Reach | 4 / wren | 100.0% / 100.0% | 100.0% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| The Wandering Light | 7 / pip | 97.9% / 100.0% | 97.9% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| The Wandering Light | 8 / pip | 99.6% / 100.0% | 99.6% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| The Wandering Light | 9 / pip | 94.6% / 100.0% | 93.8% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| Requiem Bell | 3 / pip | 100.0% / 100.0% | Not measured | 85.0%–100.0% / 97.0%–100.0% | HELD: illegal starter fixture |
| Requiem Bell | 4 / pip | 100.0% / 100.0% | Not measured | 70.0%–90.0% / 97.0%–100.0% | HELD: illegal starter fixture |
| Requiem Bell | 5 / pip | 99.2% / 100.0% | Not measured | 60.0%–85.0% / 97.0%–100.0% | HELD: illegal starter fixture |
| Gate of the Deep | 6 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 80.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Gate of the Deep | 7 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 80.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Gate of the Deep | 8 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 80.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Night's Reserve | 9 / wren | 72.5% / 100.0% | 71.3% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Night's Reserve | 10 / wren | 99.6% / 100.0% | 99.6% / 100.0% | 40.0%–60.0% / 90.0%–100.0% | casual above |
| Night's Reserve | 11 / wren | 97.9% / 100.0% | 97.9% / 100.0% | 60.0%–80.0% / 95.0%–100.0% | casual above |
| Mercy of the Fen | 14 / pip | 100.0% / 100.0% | 100.0% / 100.0% | 60.0%–80.0% / 95.0%–100.0% | casual above |
| Mercy of the Fen | 15 / pip | 100.0% / 100.0% | 100.0% / 100.0% | 60.0%–80.0% / 95.0%–100.0% | casual above |
| Mercy of the Fen | 16 / pip | 99.2% / 100.0% | 96.3% / 100.0% | 60.0%–80.0% / 95.0%–100.0% | casual above |
| The Unfinished Prayer | 10 / pip | 100.0% / 100.0% | Not measured | 40.0%–60.0% / 90.0%–100.0% | HELD: illegal starter fixture |
| The Unfinished Prayer | 11 / pip | 97.5% / 100.0% | Not measured | 60.0%–80.0% / 95.0%–100.0% | HELD: illegal starter fixture |
| The Unfinished Prayer | 12 / pip | 100.0% / 100.0% | Not measured | 60.0%–80.0% / 95.0%–100.0% | HELD: illegal starter fixture |
| Crown of the Burrow | 4 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 80.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Crown of the Burrow | 5 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 70.0%–95.0% / 97.0%–100.0% | casual above |
| Crown of the Burrow | 6 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 80.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Veil of the Unheard | 2 / wren | 100.0% / 100.0% | 100.0% / 100.0% | 85.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Veil of the Unheard | 3 / wren | 100.0% / 100.0% | 100.0% / 100.0% | 85.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Veil of the Unheard | 4 / wren | 100.0% / 100.0% | 100.0% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| The Scarlet Vigil | 5 / pip | 99.2% / 100.0% | 99.2% / 100.0% | 60.0%–85.0% / 97.0%–100.0% | casual above |
| The Scarlet Vigil | 6 / pip | 97.9% / 100.0% | 97.9% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| The Scarlet Vigil | 7 / pip | 97.9% / 100.0% | 97.9% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| Last Rites | 17 / pip | 96.3% / 100.0% | Not measured | 60.0%–80.0% / 95.0%–100.0% | HELD: illegal starter fixture |
| Last Rites | 18 / pip | 77.9% / 100.0% | Not measured | 60.0%–80.0% / 95.0%–100.0% | HELD: illegal starter fixture |
| Last Rites | 19 / pip | 100.0% / 100.0% | Not measured | 60.0%–80.0% / 95.0%–100.0% | HELD: illegal starter fixture |
| Mountain's Covenant | 13 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 70.0%–90.0% / 95.0%–100.0% | casual above |
| Mountain's Covenant | 14 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 70.0%–90.0% / 95.0%–100.0% | casual above |
| Mountain's Covenant | 15 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 70.0%–90.0% / 95.0%–100.0% | casual above |
| The Drowned Huntsman | 7 / wren | 75.4% / 100.0% | 71.7% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| The Drowned Huntsman | 8 / wren | 87.5% / 100.0% | 86.7% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| The Drowned Huntsman | 9 / wren | 72.5% / 100.0% | 70.4% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Mantle of the Red Moon | 12 / pip | 100.0% / 100.0% | 100.0% / 100.0% | 60.0%–80.0% / 95.0%–100.0% | casual above |
| Mantle of the Red Moon | 13 / pip | 100.0% / 100.0% | 100.0% / 100.0% | 60.0%–80.0% / 95.0%–100.0% | casual above |
| Mantle of the Red Moon | 14 / pip | 100.0% / 100.0% | 100.0% / 100.0% | 60.0%–80.0% / 95.0%–100.0% | casual above |
| Vestments of the Last Dawn | 24 / pip | 37.9% / 99.6% | Not measured | 60.0%–80.0% / 95.0%–100.0% | HELD: illegal starter fixture |
| Vestments of the Last Dawn | 25 / pip | 66.7% / 100.0% | Not measured | 60.0%–80.0% / 95.0%–100.0% | HELD: illegal starter fixture |
| Vestments of the Last Dawn | 26 / pip | 84.2% / 100.0% | Not measured | 60.0%–80.0% / 95.0%–100.0% | HELD: illegal starter fixture |
| The Final Answer | 3 / wren | 100.0% / 100.0% | 100.0% / 100.0% | 85.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| The Final Answer | 3 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 95.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| The Final Answer | 3 / pip | 100.0% / 100.0% | 100.0% / 100.0% | 85.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| The Final Answer | 4 / wren | 100.0% / 100.0% | 100.0% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| The Final Answer | 4 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 80.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| The Final Answer | 4 / pip | 100.0% / 100.0% | 100.0% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| The Final Answer | 5 / wren | 70.0% / 100.0% | 70.0% / 100.0% | 60.0%–85.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| The Final Answer | 5 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 70.0%–95.0% / 97.0%–100.0% | casual above |
| The Final Answer | 5 / pip | 99.2% / 100.0% | 99.2% / 100.0% | 60.0%–85.0% / 97.0%–100.0% | casual above |
| Burrower's Promise | 4 / wren | 100.0% / 100.0% | 100.0% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| Burrower's Promise | 4 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 80.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Burrower's Promise | 4 / pip | 100.0% / 100.0% | 100.0% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| Burrower's Promise | 5 / wren | 70.0% / 100.0% | 70.0% / 100.0% | 60.0%–85.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Burrower's Promise | 5 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 70.0%–95.0% / 97.0%–100.0% | casual above |
| Burrower's Promise | 5 / pip | 99.2% / 100.0% | 99.2% / 100.0% | 60.0%–85.0% / 97.0%–100.0% | casual above |
| Burrower's Promise | 6 / wren | 81.7% / 100.0% | 81.7% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Burrower's Promise | 6 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 80.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Burrower's Promise | 6 / pip | 97.9% / 100.0% | 97.9% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| Reed of Remembrance | 7 / wren | 75.4% / 100.0% | 75.4% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Reed of Remembrance | 7 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 80.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Reed of Remembrance | 7 / pip | 97.9% / 100.0% | 97.9% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| Reed of Remembrance | 8 / wren | 87.5% / 100.0% | 87.5% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Reed of Remembrance | 8 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 80.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Reed of Remembrance | 8 / pip | 99.6% / 100.0% | 99.6% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| Reed of Remembrance | 9 / wren | 72.5% / 100.0% | 72.5% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Reed of Remembrance | 9 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 80.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Reed of Remembrance | 9 / pip | 94.6% / 100.0% | 94.6% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| Harvest of Whispers | 5 / wren | 70.0% / 100.0% | 70.0% / 100.0% | 60.0%–85.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Harvest of Whispers | 5 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 70.0%–95.0% / 97.0%–100.0% | casual above |
| Harvest of Whispers | 5 / pip | 99.2% / 100.0% | 99.2% / 100.0% | 60.0%–85.0% / 97.0%–100.0% | casual above |
| Harvest of Whispers | 6 / wren | 81.7% / 100.0% | 81.7% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Harvest of Whispers | 6 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 80.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Harvest of Whispers | 6 / pip | 97.9% / 100.0% | 97.9% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| Harvest of Whispers | 7 / wren | 75.4% / 100.0% | 75.4% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Harvest of Whispers | 7 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 80.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Harvest of Whispers | 7 / pip | 97.9% / 100.0% | 97.9% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| Thorn of the First Grove | 8 / wren | 87.5% / 100.0% | 87.5% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Thorn of the First Grove | 8 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 80.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Thorn of the First Grove | 8 / pip | 99.6% / 100.0% | 99.6% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| Thorn of the First Grove | 9 / wren | 72.5% / 100.0% | 72.5% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Thorn of the First Grove | 9 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 80.0%–100.0% / 97.0%–100.0% | Within JSON bands; first-clear aim unresolved |
| Thorn of the First Grove | 9 / pip | 94.6% / 100.0% | 94.6% / 100.0% | 70.0%–90.0% / 97.0%–100.0% | casual above |
| Thorn of the First Grove | 10 / wren | 99.6% / 100.0% | 99.6% / 100.0% | 40.0%–60.0% / 90.0%–100.0% | casual above |
| Thorn of the First Grove | 10 / tobin | 100.0% / 100.0% | 100.0% / 100.0% | 50.0%–70.0% / 90.0%–100.0% | casual above |
| Thorn of the First Grove | 10 / pip | 100.0% / 100.0% | 100.0% / 100.0% | 40.0%–60.0% / 90.0%–100.0% | casual above |

Items with at least one measured cell outside its JSON band: **Vesper's Reach, The Wandering Light, Night's Reserve, Mercy of the Fen, Crown of the Burrow, Veil of the Unheard, The Scarlet Vigil, Mountain's Covenant, Mantle of the Red Moon, The Final Answer, Burrower's Promise, Reed of Remembrance, Harvest of Whispers, Thorn of the First Grove**. These are above-band cells, with their baseline comparisons printed alongside. The Drowned Huntsman is an early G2 drop, compared with the player's common +0 body; its three measured casual cells are within their bands. No extra health, immunity or boss floor change was used. A fixed-grade +0 unique must not replace a later rare+5 body as a supposed direct upgrade; the crafted piece is deliberately stronger in that situation.

Good-persona rates across the remaining proposals still sit around 100%, often matching their paired baseline. No evidence supports the user's 85–95% first-clear aim on these fixtures. The current JSON permits 97–100% on early bosses and 95–100% on Captains: that is a real conflict with the new target, recorded here instead of silently changing the bands. Bare-hero floor loosening is requested but is not incorporated by this design experiment. A rare drop cannot serve as an excuse to restore that floor. The fallback is hold the effects and art until the integration balance checkpoint and judge have settled the target.

No-parry/no-dodge, 10%-parry, maximum-Guard/Focus/Might, all legal multi-unique combinations, optional bosses and zones 16+ burst risks are not certified. The output does not establish absence of dominant choices. A 240-fight result has sampling error (about ±5 percentage points at 50% wins for a simple 95% interval); one seed offset and one generated boss profile cannot justify close tuning.

## Anti-goal check, item by item

Every row: no new currency, expiring reward, mandatory login, fee, camp tap, menu, auto-combat or shop offer. The dominance answer is a hypothesis with a concrete losing use case; budget failures above remain holds, not passes.

| Item | Dominant choice? / crafted alternative | Currency? | Chore? | Disposition |
|---|---|---|---|---|
| Oath of the Hollow | Not intended: partial parries earn nothing and later Attacks lose damage; crafted gear wins for Attack-heavy / inconsistent defence. | No | No; no expiring benefit | Hold: dominance / target not certified |
| Vesper's Reach | Not intended: mixed defences earn nothing, and abilities lose damage; crafted gear wins for ability-heavy play. | No | No; no expiring benefit | Hold: dominance / target not certified |
| The Wandering Light | Not intended: Good/missed/untimed casts earn nothing and Attacks lose damage; crafted gear wins without all-Perfect casts. | No | No; no expiring benefit | Hold: dominance / target not certified |
| Requiem Bell | Not intended: Good/missed/untimed casts earn nothing and Attacks lose damage; crafted gear wins without all-Perfect casts. | No | No; no expiring benefit | Held: legal fixture needed |
| Gate of the Deep | Not intended: partial parries earn nothing and later Attacks lose damage; crafted gear wins for Attack-heavy / inconsistent defence. | No | No; no expiring benefit | Hold: dominance / target not certified |
| Night's Reserve | Not intended: mixed defences earn nothing, and abilities lose damage; crafted gear wins for ability-heavy play. | No | No; no expiring benefit | Hold: dominance / target not certified |
| Mercy of the Fen | Not intended: Good/missed/untimed casts earn nothing and Attacks lose damage; crafted gear wins without all-Perfect casts. | No | No; no expiring benefit | Hold: dominance / target not certified |
| The Unfinished Prayer | Not intended: Good/missed/untimed casts earn nothing and Attacks lose damage; crafted gear wins without all-Perfect casts. | No | No; no expiring benefit | Held: legal fixture needed |
| Crown of the Burrow | Not intended: partial parries earn nothing and later Attacks lose damage; crafted gear wins for Attack-heavy / inconsistent defence. | No | No; no expiring benefit | Hold: dominance / target not certified |
| Veil of the Unheard | Not intended: mixed defences earn nothing, and abilities lose damage; crafted gear wins for ability-heavy play. | No | No; no expiring benefit | Hold: dominance / target not certified |
| The Scarlet Vigil | Not intended: Good/missed/untimed casts earn nothing and Attacks lose damage; crafted gear wins without all-Perfect casts. | No | No; no expiring benefit | Hold: dominance / target not certified |
| Last Rites | Not intended: Good/missed/untimed casts earn nothing and Attacks lose damage; crafted gear wins without all-Perfect casts. | No | No; no expiring benefit | Held: legal fixture needed |
| Mountain's Covenant | Not intended: partial parries earn nothing and later Attacks lose damage; crafted gear wins for Attack-heavy / inconsistent defence. | No | No; no expiring benefit | Hold: dominance / target not certified |
| The Drowned Huntsman | Not intended: mixed defences earn nothing, and abilities lose damage; crafted gear wins for ability-heavy play. | No | No; no expiring benefit | Hold: dominance / target not certified |
| Mantle of the Red Moon | Not intended: Good/missed/untimed casts earn nothing and Attacks lose damage; crafted gear wins without all-Perfect casts. | No | No; no expiring benefit | Hold: dominance / target not certified |
| Vestments of the Last Dawn | Not intended: Good/missed/untimed casts earn nothing and Attacks lose damage; crafted gear wins without all-Perfect casts. | No | No; no expiring benefit | Held: legal fixture needed |
| The Final Answer | Not intended: partial parries earn nothing and later Attacks lose damage; crafted gear wins for Attack-heavy / inconsistent defence. | No | No; no expiring benefit | Hold: dominance / target not certified |
| Burrower's Promise | Not intended: bulk speed/double yield are lower; crafted gear wins for bulk resources and XP. A rare-find specialist may prefer this deliberately. | No | No; no expiring benefit | Hold: dominance / target not certified |
| Reed of Remembrance | Not intended: bulk speed/double yield are lower; crafted gear wins for bulk resources and XP. A rare-find specialist may prefer this deliberately. | No | No; no expiring benefit | Hold: dominance / target not certified |
| Harvest of Whispers | Not intended: bulk speed/double yield are lower; crafted gear wins for bulk resources and XP. A rare-find specialist may prefer this deliberately. | No | No; no expiring benefit | Hold: dominance / target not certified |
| Thorn of the First Grove | Not intended: bulk speed/double yield are lower; crafted gear wins for bulk resources and XP. A rare-find specialist may prefer this deliberately. | No | No; no expiring benefit | Hold: dominance / target not certified |

Raw-stat and action tradeoffs are the reason a specialist preference is acceptable; rarity alone does not justify being strictly better for everyone. If a combination removes both liabilities, reduce its reward or reject it. Do not add a named resource or a “visit camp before leaving” trigger as a workaround.

## First hour

At the first-hour zone-10 target a player can encounter Oath of the Hollow, Vesper's Reach, Requiem Bell (eligible class only), Gate of the Deep, Night's Reserve, The Unfinished Prayer (held), Crown of the Burrow, Veil of the Unheard, The Scarlet Vigil, The Final Answer, Burrower's Promise, Reed of Remembrance, Harvest of Whispers and Thorn of the First Grove, plus The Wandering Light and The Drowned Huntsman. Availability does not promise a drop. The Uniques view and item reveal use the existing unlock/moment flow; no second tutorial or crafting dependency is added. No unique is required to beat a Captain or obtain a material. The first-hour “first unique by chance at 25–40 minutes” remains a target, not a guaranteed result. Preserve the existing early reveal rate unless the judge changes it. **The balance and dominant-choice holds mean this draft cannot yet confirm the first-hour contract.**

## Money check

None of the proposed items, effects, chance rolls or upgrade power is sold, bundled, obtainable through a paid cache/key or converted from a cosmetic purchase. There is no player gold-sale system proposed, no trading and no buyback. Existing salvage returns earned materials/Essence under current rules; it is not a sale and adds no new source in this docs PR. Do not introduce a gold resale price. A separately sold cosmetic can only change pixels and carries **zero** effect. All effects here are earned gameplay power, never disguised as looks. Legacy paid/raid systems are untouched, not endorsed.

## Art list for PR 2, review concepts

The owner authorized visual design on 7 October 2026, including legacy items. These are review concepts; art does not approve the held mechanics. Proposed filenames: `art/uniques/<id>-<size>.png` for size 16, 18, 20, 24, 32, 48. Table gives the exact 32px filename; all other sizes use the same ID. Keep `sources/<id>.png`, exact per-item prompt, generation provenance, measured crop rectangle and source/export SHA-256 in the manifest. No hero overlays, motion or animated effects.

Each silhouette must retain the actual runtime grade's approved main/secondary materials; the note's boss detail is one accent, not a replacement material. Grade is an equipment tier, not the boss zone or current road area. Use the richer game-v2 finish, upper-left highlight, cooler shadows, hard alpha, ≤24 visible colours, existing export padding. Long weapons/tools lie lower-left to upper-right. Do not draw generic purple gear unless the grade's material calls for it. Export through the shared authored-art crop/bake/isolation routines used by `gear15icons.py`; do not procedurally draw substitute art or modify canonical gear tooling.

| Exact 32px filename | Nearest crafted icon | Silhouette / boss signature |
|---|---|---|
| moss-sword-32.png | warblade-g1-32.png | A diagonal grade-matched sword with one broad moss frond at the guard. |
| bat-bow-32.png | bow-g1-32.png | A grade-matched bow with short bat-wing tips. |
| wisp-staff-32.png | staff-g2-32.png | A grade-matched staff holding one pale sealed glass bead. |
| bone-censer-32.png | censer-g1-32.png | A grade-matched censer with a single ivory rib cage. |
| quarry-shield-32.png | shield-g1-32.png | An angular grade-matched shield with one grade-matched boss. |
| bat-quiver-32.png | quiver-g2-32.png | A grade-matched quiver with a scalloped bat-wing lip. |
| wisp-lantern-32.png | lantern-g3-32.png | A grade-matched lantern with an asymmetrical marsh reed handle. |
| bone-tome-32.png | tome-g2-32.png | A grade-matched-bound book with one ivory clasp. |
| beetle-helm-32.png | greathelm-g1-32.png | A grade-matched helm with a broad beetle shell ridge. |
| echo-cowl-32.png | hood-g1-32.png | A grade-matched cowl with a pointed bat-ear crown. |
| spore-circlet-32.png | circlet-g1-32.png | A grade-matched circlet with a small red mushroom boss. |
| bone-mitre-32.png | mitre-g3-32.png | A grade-matched mitre with an ivory rib-shaped front seam. |
| quarry-plate-32.png | plate-g3-32.png | grade-matched plates with a single cracked jasper shoulder. |
| marsh-leathers-32.png | leathers-g2-32.png | Grade-matched hide armour with a pale reed collar. |
| spore-robe-32.png | robe-g2-32.png | A grade-matched robe with one red spore-cap shoulder. |
| bone-vestments-32.png | vestments-g4-32.png | grade-matched vestments with one ivory rib clasp. |
| rattlebone-charm-32.png | charm-g1-32.png | An ivory jaw suspended below a dim essence bead. |
| carapace-pick-32.png | pick-g1-32.png | A diagonal grade-matched pick with a broad shell socket. |
| wisp-axe-32.png | axe-g2-32.png | A diagonal grade-matched woodaxe with a single reed-shaped blade eye. |
| spore-sickle-32.png | sickle-g1-32.png | A diagonal grade-matched sickle with a mushroom-cap pommel. |
| moss-spear-32.png | spear-g2-32.png | A diagonal grade-matched spear with a single moss frond collar. |

PR 2 contains only `art/uniques/`: README, manifest, source PNGs, prompts, six exports per stable item and `preview.html`. Compare each to its crafted neighbour at native 32/48 and greyscale; inspect 740×360 and 360px layouts, image loading, silhouettes, palette/alpha/padding, material identity and hashes. The README/description must distinguish deterministic export checks from the independent art judge. The owner has authorized this review pack while balance remains held. No runtime wiring is included.

## Where I'm not sure

1. **85–95% good first clears versus JSON allowing 97–100% early / 95–100% Captains.** Both are visible; no unilateral band relaxation. Fallback: wait for the integration/judge checkpoint and rerun.
2. **Raw 0.8× common may be too severe.** It is deliberately weaker even than a common craft; a fixed-grade drop becomes a poor replacement for later crafted gear. Fallback: reduce the sacrifice and payoff together; never use a flat immunity/floor bonus.
3. **Timing reward numbers 8–20%, costs 6–16%.** Proposed, not derived from a proven economy. The measured outcomes do not establish fun or dominance. Fallback: zero effect / no release until persona and combination sweeps agree.
4. **Four lightkeeper fittings.** No legal starter proxy. Fallback: hold gameplay approval until a real eligible hero fixture is supplied; visual concepts remain review-only and do not broaden fittings.
5. **Stacking several named items.** Not measured; each item is tested alone, with liabilities not stacked within itself. Fallback: hold rather than introduce an unreviewed equip restriction or claim combinations are safe.
6. **Rare-find tradeoff.** The expectation formula omits mastery, caps, Hands/offline and depletion effects. Fallback: no new tool effect until gathering economy tests confirm the 120% find line is safe; caps do not move.
7. **Drop-pool dilution.** Uniform legal selection preserves the aggregate roll but changes acquisition times for any one item. Fallback: retain old single-item pool until class-weighting and expected attempts are judged. Base odds are not a guarantee.
8. **Legacy ownership.** Existing effects may already dominate. Fallback: keep them readable and earned; a separate approved transition is required before withdrawing old sources. This draft does not take away items or reinterpret IDs.
9. **Boss naming and theme.** Today's seven-type cycle disagrees with the new area names; the source uses current type, not a promised future named boss. Fallback: update sources only after actual encounter data lands.
10. **Prototype fidelity.** In-memory wrappers are not implementation tests, and T's direct-damage-only restriction needs an exact hook. Fallback: repeat with actual approved wiring before merging a gameplay PR. No rigged timing probabilities, no altered boss budget.

11. **Catalogue and Curator.** More found IDs may accelerate the 3/7/10/13 collection thresholds and their unique-chance modifier, especially when a player already owns legacy versions. Fixed base odds do not prove unchanged acquisition pace. Fallback: hold the new drop pool until an acquisition simulation includes those modifiers and old-save ownership; never silently erase found entries or earned Deeds.

12. **Browser QA.** Two complete browser-enabled runs failed in different existing sections; both sections passed in isolation. The moment-count discrepancy and Windows screenshot write failure are not caused by a tracked runtime/test change in this branch. Fallback: do not call the full suite passed or merge; rerun on a healthy QA environment without changing thresholds or game code in this docs-only PR.

## Reproducing the review-only experiment

The following is the exact effect hook used with the exposed `measure` function of `tools/budget.mjs`. It runs after the standard fixture is built, so the gear change ends with a fresh boss spawn (lessons.md). Replace `__DEF__` with the table's kind/grade/family and decimal B/C values. Expose `measure` in a temporary untracked copy beside the original tool, and add a setter for its local argv so `opt('eval')` receives this string. Use a paired baseline hook `Math.random=rng(31415); gearDirty(); fightBoss=true; spawn();`. Do not edit `src/`, commit the experiment, or count an illegal class as equipped.

```js
(() => {
const d=__DEF__, pos=kindPos(d.kind);
const it=newItem(d.kind,d.t,'common'); it.plus=0; it.a=[];
if(!fits(it,pos,heroWho())) throw new Error('Illegal unique fitting '+d.id);
S.items.push(it); S.equip[pos]=it.id;
const lines=itemLines;
itemLines=x=>x&&x.id===it.id?craftBaseLines(d.kind,TIER_POW[d.t]*0.8):lines(x);
Math.random=rng(31415); gearDirty(); fightBoss=true; spawn();
if(d.family==='G') return;
const act=turnHeroAct, contact=turnContact;
turnHeroAct=function(m,io,id,slot,grades){
 const A=m.p.A,U=m.p.U;
 const state=m.h._unique||(m.h._unique={attack:0,ability:0});
 if(id==='attack'&&state.attack) m.p.A*=1+state.attack;
 if(id!=='attack'&&state.ability) m.p.U*=1+state.ability;
 const perfect=d.family==='T'&&id!=='attack'&&grades&&grades.length&&grades.every(x=>x==='perfect');
 if(perfect) m.p.U*=1+d.b;
 const did=act(m,io,id,slot,grades);
 m.p.A=A; m.p.U=U;
 if(did){ if(id==='attack') state.attack=0; else state.ability=0;
  if(perfect) state.attack=-d.c;
 }
 return did;
};
turnContact=function(m,io){
 const last=m.hitI===m.move.hits.length-1;
 const fullP=last&&m.defense==='parry'&&m.parried===m.move.hits.length-1;
 const state=m.h._unique||(m.h._unique={attack:0,ability:0,dodges:0});
 if(m.hitI===0) state.dodges=0;
 if(m.defense==='dodge') state.dodges++;
 const fullD=last&&state.dodges===m.move.hits.length;
 const counter=m.p.counter;
 if(d.family==='P'&&fullP) m.p.counter*=1+d.b;
 contact(m,io); m.p.counter=counter;
 if(d.family==='P'&&fullP) state.attack=-d.c;
 if(d.family==='D'&&fullD){state.attack=d.b;state.ability=-d.c;}
};
})()
```

Checkpoint recipe: `['z'+z+'-boss', z, 'boss', {st:'kept', gear:z<=12?'common':undefined, fx:z<10?'early':z<35?'mid':'late'}]`. Measure each z from drop through drop+2 for Tobin (warrior), Wren (ranger), Pip (lanternmage), all three for shared charm/tools. Lightkeeper rows are deliberately not executed. Find-line effects have no combat path and are checked by their gathering formula, not fabricated as combat damage.

## Checks and handoff

Budget experiment: executed, results above; **balance not passed**. Art: owner-authorized review pack in a separate art-only draft PR. Build passed (7658.8 KB). The default check run passed with 40 browser sections skipped. With bundled Playwright and Chrome, the first full run executed every browser section and failed the first-ten-minutes moment check (10 big/medium moments, limit 8); that section then passed in isolation (7 moments). The final two-worker full run failed only a Windows UNKNOWN file-open error writing docs/proof/moment-layer/level-banner-740x360.png; the entire moment-layer section then passed in isolation. All browser-enabled runs reported zero skipped sections. A clean complete browser-suite pass has not been achieved. Runtime, tools and tests have zero diff from integration checkpoint 601a37a8. No failure is waived; the PR remains a draft. No source, online file, save key, hosting config or canonical art changed. This document is the only intended tracked change. Claude reviews the numbers, the Opus judge rules on economy/balance, and a later stable pack goes to the art judge. Neither PR may be merged by Codex.

## Unique display names and visual identity

These are proposed display names. Existing saved IDs, effects and ownership remain unchanged. Legacy audit names above describe the currently shipped items; this registry supplies their new display names. All 34 items receive separate icons; legacy grade is a representative first-source grade.

| Stable ID | Existing / working name | Proposed display name | Set | Visual identity |
|---|---|---|---|---|
| moss-sword | Moss Sword | Oath of the Hollow | Proposed | broad copper sword, leaf-shaped blade and moss wrapped antler guard |
| bat-bow | Bat Bow | Vesper's Reach | Proposed | pine recurve bow, swept bat wing tips and amber string fittings |
| wisp-staff | Wisp Staff | The Wandering Light | Proposed | birch staff curled around a sealed pale green spirit bead |
| bone-censer | Bone Censer | Requiem Bell | Proposed | copper hanging censer inside an ivory rib cage with a heavy bell silhouette |
| quarry-shield | Quarry Shield | Gate of the Deep | Proposed | massive angular copper shield, dark stone central boss with a glowing fault line |
| bat-quiver | Bat Quiver | Night's Reserve | Proposed | iron trimmed leather quiver with scalloped bat wing mouth and three broad arrow heads |
| wisp-lantern | Wisp Lantern | Mercy of the Fen | Proposed | silver lantern, amethyst glass, bent marsh reed handle and trapped pale spirit flame |
| bone-tome | Bone Tome | The Unfinished Prayer | Proposed | iron bound dark tome with broad ivory jaw clasp and parchment page edges |
| beetle-helm | Beetle Helm | Crown of the Burrow | Proposed | copper closed helmet with oversized beetle shell crest and short mandible cheek guards |
| echo-cowl | Echo Cowl | Veil of the Unheard | Proposed | dark hide hood with swept bat ear crown and copper crescent brow |
| spore-circlet | Spore Circlet | The Scarlet Vigil | Proposed | copper circlet with one scarlet mushroom jewel and branching fungal prongs |
| bone-mitre | Bone Mitre | Last Rites | Proposed | tall silver trimmed ceremonial mitre, ivory rib seam and dark amethyst inset |
| quarry-plate | Quarry Plate | Mountain's Covenant | Proposed | silver plate torso with broad layered shoulders and one cracked stone shoulder inset |
| marsh-leathers | Marsh Leathers | The Drowned Huntsman | Proposed | dark leather torso armour, iron clasps and asymmetric pale reed collar |
| spore-robe | Spore Robe | Mantle of the Red Moon | Proposed | dark woven robe with iron trim, broad scarlet mushroom cap shoulder and pale hem |
| bone-vestments | Bone Vestments | Vestments of the Last Dawn | Proposed | blue cobalt trimmed ceremonial vestments with ivory rib clasp and pale pearl centre |
| rattlebone-charm | Rattlebone Charm | The Final Answer | Proposed | ivory jaw pendant cradling a dim amber soul bead, copper chain |
| carapace-pick | Carapace Pick | Burrower's Promise | Proposed | copper pickaxe with a beetle shell socket and hooked mandible pick ends |
| wisp-axe | Wisp Axe | Reed of Remembrance | Proposed | iron wood axe, birch handle, broad crescent blade with reed shaped eye and pale spirit inset |
| spore-sickle | Spore Sickle | Harvest of Whispers | Proposed | copper crescent sickle, pine handle, scarlet mushroom cap pommel |
| moss-spear | Moss Spear | Thorn of the First Grove | Proposed | iron spear with broad leaf head, birch shaft and moss frond collar |
| sproutblade | Sproutblade | The Green Promise | Legacy | copper short sword with living green shoot curled around the blade base |
| echocowl | Echo Cowl | Vesper's Shroud | Legacy | copper helmet with shadowed face and broad bat wing cheek flares |
| rattlecharm | Rattlebone Charm | Saint's Last Tooth | Legacy | single large ivory fang relic in a copper cage, amber bead at crown |
| carapacepick | Carapace Pick | Mandible of the Barrow | Legacy | copper pickaxe with asymmetrical beetle mandible head and dark shell binding |
| sporeheart | Sporeheart | Heart of the Sleeping Grove | Legacy | scarlet heart shaped mushroom relic nested in copper roots and pale gills |
| golemfist | Golemfist | The Quarry's Verdict | Legacy | heavy copper stone edged cleaver sword with blocky golem fist guard |
| wispaxe | Wisp Axe | The Mourning Bough | Legacy | iron axe on twisted birch branch, broad pale spirit shaped blade inset |
| wyrmscale | Wyrmscale Helm | Crown of the Cinder Wyrm | Legacy | copper helm with dark dragon scale crown, swept horns and ember inset |
| hollowcrown | Crown of Hollows | The Vacant Throne | Legacy | iron royal helmet crowned by tall broken prongs, hollow black centre and amber eye slit |
| colossuspick | Colossus Pick | Worldroot Breaker | Legacy | huge silver pickaxe with gnarled oak handle and mossy stone root socket |
| hydraglass | Hydra Glass | Prism of the Seven Hungers | Legacy | cobalt framed pale glass prism with three serpentine neck silhouettes and pearl core |
| eaterfang | Lantern Eater's Fang | Light's Last Refuge | Legacy | mithril fang sword with lantern shaped guard, dark beast tooth edge and pale blue trapped light |
| tyrantaxe | Pale Tyrant's Axe | The King's Silence | Legacy | mithril double crescent axe, tideash handle and ivory crowned skull socket |
