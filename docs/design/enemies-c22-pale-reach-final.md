# C22 final-count proposal — The Pale Reach

> **Story note (2026-10-05, story judge ruling b):** each Shadowborn emerges whole from the dark in a shape copied from the place or from memory, and is never the thing it copies (`story-bible.md` rule 4). A story line may claim a copied likeness only where the sprite shows it.

**Design only, for owner/Claude approval.** Uses the confirmed [world structure](world-structure.md), read at checkpoint 2dea55a (including the named 2a61322 update). The count and hierarchy are settled; names, numerical tuning, status translations, Champion Trophy mapping and boss phase details remain proposals. This document supersedes this region's old pools, variants, gauntlets and I–V cycles. It changes no runtime, art or save state.

## Structure and shared card rules

Seven areas, five distinct zone monsters per area: **35 normal designs + 7 Champions of Darkness + Whitehush as the one regional Elder of Darkness = 43 unique designs**. Each of the 35 zones also has a named **Shadowborn Captain**, a recolour/enhancement of that same zone monster with one extra move, not another unique design. Zones are 106–140. Each zone contains five individually entered regular fights against its monster, then its Captain. After five completed zones comes that area's Champion; after the seventh Champion comes the separate regional Elder. Thus 175 regular fights + 35 Captains + 7 Champions + 1 Elder = **218 encounters**. This is progression accounting, not a queued fight or one continuous gauntlet.

Every encounter has one hero and one enemy, entered through explicit active choice. No automatic next fight, simultaneous adds, offline combat or unattended kill/reward resolution. Pause freezes timeline/input windows; resume cannot reroll or replay committed rewards. Cooldowns/resources reset per encounter as C19 specifies; a boundary does not grant a new undocumented heal. Repeated regular encounters are the five authored encounters in a zone, not infinite boss farming. Captains, Champions and regional Elders are cleared once; a later return requires a separately justified stronger encounter. Preserve unique progression ledgers for all six zone fights.

All roster creatures below are **born/emerged with the darkness**, not corrupted wildlife, ghosts of villagers, possessed tools, trees or furniture. Corrupted existing wildlife belongs only to Hunting, which remains separate. Whitehush's established story is the explicit exception; no replacement origin is invented.

**Statistics.** Toughness is neutral, uncritical ordinary Attack actions at suitable zone gear, with ordinary physical armour reflected; combos/crit/resistance change the actual result and need three-hero testing. Speed is relative to reference hero 1.0: above 1 sometimes doubles, below 1 sometimes gives the hero a double; ordinary/Captain cap 2, boss-tagged Champion/Elder cap 3. No extra action is injected at a fixed cadence. Damage is a percentage of reference max HP before temporary defence and type mitigation, converted to **fixed zone damage**, never damage scaling with the player's purchased HP. Each row lists individual hits and their whole direct total. Only phys/holy/poison/fire/frost are types; armour is separate from resistance. Unlisted types are neutral; no immunity.

**Defence and timing.** Each real hit independently accepts parry or dodge. Each parry refunds 1 from all active ability cooldowns immediately; exactly one guaranteed-critical counter follows only a fully parried, completed move. A mixed sequence retains individual refunds but gets no counter. A cancelled sequence gets none. Quick means a compact readable anticipation, not an unspecified instant hit; delayed/held means a visible pause; a feint has no damage or false actionable ring. All contacts have clear cues, including reduced motion. Speed and phases do not shrink reaction windows. Ordinary monsters alternate moves 1/2.

**Shared incoming-status proposals needing C19 harmonisation.** Bleed/Venom are 2% reference HP per next hero start, 2 ticks (4% maximum extra), strongest refresh without stacking; Venom has no ramp/anti-heal. Chill is one -10% reference-Speed stack for 2 subsequent hero opportunities, max 2 on hero, never Freeze. Weaken is -25% direct output for 1 hero opportunity. Status applies once on the named final contact when it lands through the chosen defence; Ward absorption alone does not prevent it. Parry and dodge prevent both contact and rider. An HP-damage-only rider requires an explicit move-specific exception. Burn is 4% reference HP at each of 2 subsequent hero starts (8% total). Blind gives a 30% miss chance on the next direct hero action, never on a reaction or its input window. None means none, with no ambient or reflected damage. Status clocks pause; defeat clears them under the C19 encounter reset.

**Charge contract.** A Champion/Elder charge commits one zero-hit opportunity; release is a separate next eligible opportunity only after at least one real hero opportunity. Hold a ready boss if necessary without adding moves, aging clocks or looping on readiness. Actual HP damage since commitment counts toward the printed threshold; real DoT counts, forecast damage and Ward damage do not. Accepted non-locked Stun/Freeze contributes boss stagger and cancels charge; the pending release becomes one recovery, which is also the full-stagger skip if both occur. Never grant two skipped opportunities. Preserve the shared 3-opportunity control lock. One ordinary move separates charges. Every released hit can still be defended if interruption failed. Phase changes queue at move end, preserve gauges/HP damage, never erase the guaranteed response and never alter an already announced release.

**Rewards.** Gold and zone-grade Essence; relics only under existing eligibility, not a random relic from every new foe. The old area-elder Trophy role moves to the **Champions**, with existing Trophy semantics preserved and exact ID mapping coordinator-owned. Preserve story and first-clear flags. **Unique-drop distribution is OPEN** now that bosses do not repeat; do not promise chances, guaranteed uniques or a farming source. No ore/wood/hide/herb/fibre/gem/Sigil/material-cache kill rewards.

**Move-first art rule.** Design each creature and its intended moves first, then inventory every required idle, wind-up, held anticipation, contact/release, recovery, hurt, defeat and phase pose. Existing art and seven-key estimates are not limits. A Captain recolours the same anatomy and shares the complete monster/Captain pack; Captain-specific third-move poses and effects are allowed and must be planned up front. Reuse is optional where it preserves the intended action, never a reason to weaken a move. Captain names identify enhancements, not additional unique designs. No art is generated here.

**Region and Captain palette:** cold blue-grey bodies, ivory anatomical edges, restrained violet cores; Captain recolour uses deeper slate-violet bodies and pale silver edges, preserving silhouette and contrast. No green or fire-red body glow competes with the hero lamp. Frostgate Bastion is the confirmed full seventh area (zones136–140), followed by a separate Whitehush encounter; this mapping is confirmed by Claude in PR#1 comment5940265643 / world-structure checkpoint b41592c, without changing counts.

## Area 1: Frostgate Pass — zones 106–110

These five zones are played once in this order, with five explicit regular encounters and one Captain per zone. Then the area's named Champion is available as a separate, individually entered fight.

### Zone 106: Frostmaw

**Darkness-born anatomy:** A five-jointed hunter emerged from a dark seam, its vertical head split into two independent jaw plates and four hooked forearms. **Profile:** 3 ordinary Attack actions; Speed 1.20× (sometimes acts twice, normal cap 2); armour 0% physical reduction; weak **poison**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Split Bite | 2 hits: 12% + 16% = **28% phys**; quick-held.  | Left jaw snaps; right jaw stays visibly open before its own contact. None. |
| Hookfall | 1 hit: 29% = **29% phys**; slow.  | Small arms latch above the mouth before the large forearms drop together. None. |

**Lesson:** Recognise the second jaw as a separate hit. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip uses neutral Fireball or Frost Shard control; no poison ability is required. Either defence remains legal for every hit.

**Shadowborn Captain — Whitebite:** 6 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Jaw Return | 3 hits: 10% + 10% + 12% = **32% phys**; quick-held-quick.  | Replay left bite, held right bite, then left again; three visible jaw closures. None. |

**Art/rewards:** starting pose families: idle; Split Bite hold/contact; Hookfall hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 107: Rime Colossus

**Darkness-born anatomy:** Six thick legs support a headless chest-mouth whose outer plates grew when darkness condensed into rime; it carries no stone or borrowed armour. **Profile:** 5 ordinary Attack actions; Speed 0.75× (slower, sometimes permits two hero opportunities; no natural foe double); armour 20% physical reduction; weak **poison**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Jaw Press | 1 hit: 34% = **34% phys**; slow.  | Chest plates spread horizontally, hold, then compress toward the hero. None. |
| Underclaw | 2 hits: 12% + 16% = **28% phys**; feint-quick.  | A harmless chest contraction precedes two underside claws extending separately. None. |

**Lesson:** Wait for the claws instead of reacting to body decoration. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip uses neutral Fireball or Frost Shard control; no poison ability is required. Either defence remains legal for every hit.

**Shadowborn Captain — Deepjaw:** 8 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Closing Weight | 2 hits: 16% + 18% = **34% phys**; slow-delayed.  | Repeat the chest press, reopen fully, then press again after a longer hold. None. |

**Art/rewards:** starting pose families: idle; Jaw Press hold/contact; Underclaw hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 108: Shiverkin

**Darkness-born anatomy:** A small radial fiend appeared in the first storm-dark: five hooked limbs surround a ring mouth, with no conventional head or animal ancestor. **Profile:** 3 ordinary Attack actions; Speed 1.25× (sometimes acts twice, normal cap 2); armour 0% physical reduction; weak **poison**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Ring Clasp | 1 hit: 22% = **22% phys**; quick.  | Mouth ring opens to a clear pale edge before contracting. None. |
| Fivefold Pulse | 2 hits: 11% + 12% = **23% frost**; held-quick.  | Limbs gather into two distinct fans, each releasing one broad cold pulse. None. |

**Lesson:** Five limbs do not imply five hidden hits. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip uses neutral Fireball or Frost Shard control; no poison ability is required. Either defence remains legal for every hit.

**Shadowborn Captain — Palering:** 6 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Broken Pulse | 3 hits: 9% + 10% + 12% = **31% frost**; slow-quick-held.  | The same fan-release repeats three times; the final contraction is held. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |

**Art/rewards:** starting pose families: idle; Ring Clasp hold/contact; Fivefold Pulse hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 109: Hollowback Horror

**Darkness-born anatomy:** The dark grew a bowed shell over a long empty abdomen; four blunt legs and one wide shovel-shaped jaw make a creature rather than a walking rock. **Profile:** 5 ordinary Attack actions; Speed 0.85× (slower, sometimes permits two hero opportunities; no natural foe double); armour 15% physical reduction; weak **poison**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Shell Bow | 1 hit: 32% = **32% phys**; delayed.  | The back arches and the jaw visibly locks before the forward impact. None. |
| Open Belly | 2 hits: 13% + 14% = **27% phys**; slow-quick.  | Two abdominal plates unfold and strike separately; the hollow between them is harmless. None. |

**Lesson:** Follow solid plates, not the dark space inside them. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip uses neutral Fireball or Frost Shard control; no poison ability is required. Either defence remains legal for every hit.

**Shadowborn Captain — Rimehollow:** 8 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Double Bow | 2 hits: 16% + 18% = **34% phys**; slow-held.  | Use the shell-bow pose twice, with a complete reset before the second impact. None. |

**Art/rewards:** starting pose families: idle; Shell Bow hold/contact; Open Belly hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 110: Needle Pilgrim

**Darkness-born anatomy:** A three-legged stalker emerged below the pass with a tall sensory crown and two long piercing forearms; its hanging sheath is grown skin, not clothing. **Profile:** 4 ordinary Attack actions; Speed 1.00× (alternates at equal effective Speed); armour 5% physical reduction; weak **poison**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Needle Reach | 1 hit: 26% = **26% phys**; delayed.  | One forearm unfolds until its bright tip is plainly visible, then thrusts. None. |
| Crown Breath | 1 hit: 24% = **24% frost**; feint-held.  | Crown tips flutter harmlessly, settle, then open around one visible pulse. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |

**Lesson:** Ignore the crown flutter and defend the released pulse. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip uses neutral Fireball or Frost Shard control; no poison ability is required. Either defence remains legal for every hit.

**Shadowborn Captain — Stillneedle:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Crossed Needles | 2 hits: 15% + 17% = **32% phys**; slow-quick.  | Alternate the existing left and right thrust contacts after a crossed-arm hold. None. |

**Art/rewards:** starting pose families: idle; Needle Reach hold/contact; Crown Breath hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Champion of Darkness: Skarn, the Mountain Maw — Frostgate Pass

Skarn is an enormous eight-legged creature with three nested vertical jaws. The dark made it whole beneath the pass; it is neither an old wolf nor a cairn brought to life. **Profile:** 12 ordinary Attack actions; Speed 1.1×, rate-driven occasional consecutive opportunities, boss cap 3; armour 15%; weak poison; resists none; others neutral. Boss control applies.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Outer Bite | 1 hit: 30% = **30% phys**; delayed.  | The outer jaw rises until its pale rim is fully visible. None. |
| Inner Measure | 3 hits: 10% + 12% + 14% = **36% phys**; slow-held-quick.  | Three jaw sets open in order and close separately. Final landed contact: Bleed, 2% reference HP at each of the next 2 hero starts (4% additional total), strongest refresh only. |
| Swallow the Pass — charged | 3 hits: 20% + 20% + 22% = **62% phys**; slow-slow-held. Charge start: 0 hits / 0 damage; values are the separate release. | All jaw arches stay open during commitment; release closes each visibly in order. None. |

**Script/answer:** move 1 → move 2 → charge commitment → release or recovery → repeat during this one fight. The charge guarantees a real hero response and is interrupted by accepted non-locked control or **6% actual Champion max-HP damage** since commitment; no duplicate recovery/skip. A failed release contact costs at most22%, rather than the full62%. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip uses neutral Fireball or Frost Shard control; no poison ability is required. Either defence remains legal for every hit.

**Presence/art/rewards:** a larger, separate Champion silhouette, not an enlarged normal sprite. Inventory idle, each ordinary move's distinct hold/contact/recovery, charge hold/release, every multi-hit contact, hurt and defeat. Nine-key estimates are not caps; author every pose needed for clear anatomy and timing. Preserve the former area-elder **Trophy role**, existing progression/first-clear flags, gold, Essence and already-eligible relic rewards. The unique-drop policy is OPEN; no new unique chance is assigned. One encounter, no farming replay.

## Area 2: The Eyries — zones 111–115

These five zones are played once in this order, with five explicit regular encounters and one Captain per zone. Then the area's named Champion is available as a separate, individually entered fight.

### Zone 111: Gale Seraph

**Darkness-born anatomy:** Six translucent blade-wings radiate from a vertical throat; this cliff-dark creature stands on two lower wings and has no bird head, beak or feathers. **Profile:** 3 ordinary Attack actions; Speed 1.20× (sometimes acts twice, normal cap 2); armour 0% physical reduction; weak **poison**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Wing Verdict | 1 hit: 27% = **27% phys**; quick.  | Upper wings form an arch; one dark leading edge cuts down. None. |
| Sleet Blades | 2 hits: 13% + 15% = **28% frost**; slow-quick.  | Two wings bow separately and shed one broad blade each. None. |

**Lesson:** Count two authored blades, not decorative sleet. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip uses neutral Fireball or Frost Shard control; no poison ability is required. Either defence remains legal for every hit.

**Shadowborn Captain — Sixfold:** 6 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Returning Blades | 3 hits: 10% + 11% + 13% = **34% frost**; slow-held-quick.  | Repeat the same two release poses, ending with one clearly repeated near-wing blade. None. |

**Art/rewards:** starting pose families: idle; Wing Verdict hold/contact; Sleet Blades hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 112: Rift Skimmer

**Darkness-born anatomy:** A triangular predator slid from a fault in the dark wind; three spinal ribbons end in hooked fins supporting its body and underside mouth. **Profile:** 5 ordinary Attack actions; Speed 0.85× (slower, sometimes permits two hero opportunities; no natural foe double); armour 15% physical reduction; weak **poison**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Broadside | 1 hit: 35% = **35% phys**; slow.  | Body turns edge-on, pauses, then opens flat for one impact. None. |
| Spine and Maw | 2 hits: 12% + 18% = **30% phys**; quick-held.  | One fin hooks forward before the underside mouth closes separately. None. |

**Lesson:** A broad body strike has one contact, not wing plus collision damage. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip uses neutral Fireball or Frost Shard control; no poison ability is required. Either defence remains legal for every hit.

**Shadowborn Captain — Lowrift:** 8 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Broadside Return | 2 hits: 17% + 18% = **35% phys**; slow-delayed.  | The same body turn repeats with an obvious reset between contacts. None. |

**Art/rewards:** starting pose families: idle; Broadside hold/contact; Spine and Maw hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 113: Windspine

**Darkness-born anatomy:** Three long legs hold an open spiral rib cage around a black throat; its ribs rotate because darkness shaped them as joints, not because it is a trapped storm animal. **Profile:** 4 ordinary Attack actions; Speed 1.00× (alternates at equal effective Speed); armour 10% physical reduction; weak **poison**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Spiral Rake | 2 hits: 13% + 14% = **27% phys**; slow-quick.  | Two rib tips rotate forward separately, showing pale edges before contact. None. |
| Hollow Gust | 1 hit: 27% = **27% frost**; held.  | The central throat contracts to a small visible ring before release. None. |

**Lesson:** Distinguish rotating idle ribs from a tip actually armed to strike. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Sunder its physical armour or use Bash for control; Pip uses neutral Fireball or Frost Shard control; no poison ability is required. Either defence remains legal for every hit.

**Shadowborn Captain — Tightcoil:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Broken Spiral | 3 hits: 10% + 11% + 12% = **33% phys**; quick-held-quick.  | Replay the rib-tip contacts three times, holding the middle tip in view. None. |

**Art/rewards:** starting pose families: idle; Spiral Rake hold/contact; Hollow Gust hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 114: Talon Vane

**Darkness-born anatomy:** A narrow flying horror emerged with four jointed membrane vanes and six short gripping hooks below a crescent head; it fights braced at weapon height. **Profile:** 4 ordinary Attack actions; Speed 1.15× (sometimes acts twice, normal cap 2); armour 5% physical reduction; weak **poison**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Vane Cut | 1 hit: 26% = **26% phys**; feint.  | Upper vanes twitch harmlessly; the lower near vane locks into a clear cutting edge. None. |
| Hook Pair | 2 hits: 12% + 15% = **27% phys**; quick-delayed.  | Two lower hooks open and rake one after the other. Final landed contact: Bleed, 2% reference HP at each of the next 2 hero starts (4% additional total), strongest refresh only. |

**Lesson:** The held final hook carries the rider; earlier defence still matters. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip uses neutral Fireball or Frost Shard control; no poison ability is required. Either defence remains legal for every hit.

**Shadowborn Captain — Palehook:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Rakes | 3 hits: 10% + 10% + 12% = **32% phys**; quick-quick-held.  | Reuse the hook contacts, visibly reopening before the delayed third rake. Final landed contact: Bleed, 2% reference HP at each of the next 2 hero starts (4% additional total), strongest refresh only. |

**Art/rewards:** starting pose families: idle; Vane Cut hold/contact; Hook Pair hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 115: Splitwing Horror

**Darkness-born anatomy:** Two hinged wing frames flank an eyeless barrel throat; a third rear membrane steers this darkness-born predator without a feathered or animal body. **Profile:** 4 ordinary Attack actions; Speed 0.95× (slower, sometimes permits two hero opportunities; no natural foe double); armour 0% physical reduction; weak **poison**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Wing Clamp | 2 hits: 14% + 14% = **28% phys**; slow-held.  | Left frame closes, resets, then right frame closes after its own hold. None. |
| Throat Lance | 1 hit: 28% = **28% frost**; delayed.  | Barrel throat points and narrows to a visible aperture before one release. None. |

**Lesson:** Do not confuse a turning membrane with an extra attack. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip uses neutral Fireball or Frost Shard control; no poison ability is required. Either defence remains legal for every hit.

**Shadowborn Captain — Whitecleft:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Twin Lances | 2 hits: 16% + 17% = **33% frost**; held-quick.  | Repeat the existing throat release twice with two separate aperture contractions. None. |

**Art/rewards:** starting pose families: idle; Wing Clamp hold/contact; Throat Lance hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Champion of Darkness: Velka Sixwing — The Eyries

Velka is a vast throat held between six jointed blade-wings, standing on two lower tips. Its four upper membranes fold into a clear fan during the charge. **Profile:** 11 ordinary Attack actions; Speed 1.2×, rate-driven occasional consecutive opportunities, boss cap 3; armour 5%; weak poison; resists none; others neutral. Boss control applies.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| High Edge | 1 hit: 31% = **31% phys**; held.  | One upper wing locks into an edged arch before cutting. None. |
| Wing Steps | 3 hits: 11% + 12% + 13% = **36% frost**; slow-quick-delayed.  | Three separate membrane contractions each release one broad blade. None. |
| Sixfold Gale — charged | 4 hits: 16% + 16% + 17% + 18% = **67% frost**; slow-held-quick-delayed. Charge start: 0 hits / 0 damage; values are the separate release. | Four upper membranes fan out for the commitment and release one blade each. None. |

**Script/answer:** move 1 → move 2 → charge commitment → release or recovery → repeat during this one fight. The charge guarantees a real hero response and is interrupted by accepted non-locked control or **6% actual Champion max-HP damage** since commitment; no duplicate recovery/skip. The supporting two wings do no damage; four advertised blades form the release. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip uses neutral Fireball or Frost Shard control; no poison ability is required. Either defence remains legal for every hit.

**Presence/art/rewards:** a larger, separate Champion silhouette, not an enlarged normal sprite. Inventory idle, each ordinary move's distinct hold/contact/recovery, charge hold/release, every multi-hit contact, hurt and defeat. Nine-key estimates are not caps; author every pose needed for clear anatomy and timing. Preserve the former area-elder **Trophy role**, existing progression/first-clear flags, gold, Essence and already-eligible relic rewards. The unique-drop policy is OPEN; no new unique chance is assigned. One encounter, no farming replay.

## Area 3: The Starscar — zones 116–120

These five zones are played once in this order, with five explicit regular encounters and one Captain per zone. Then the area's named Champion is available as a separate, individually entered fight.

### Zone 116: Prism Devourer

**Darkness-born anatomy:** A darkness-born maw grew three open mineral ribs around itself at the Fall; short legs hang from those ribs, with no statue or human torso beneath. **Profile:** 5 ordinary Attack actions; Speed 0.70× (slower, sometimes permits two hero opportunities; no natural foe double); armour 25% physical reduction; weak **frost**; resists **poison**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Closing Orbit | 1 hit: 35% = **35% phys**; slow.  | Three ribs align into one broad edge, hold, then close as one impact. None. |
| Broken Orbit | 3 hits: 8% + 9% + 13% = **30% phys**; slow-slow-quick.  | Each rib arms a leading plate and releases one solid wedge in order. None. |

**Lesson:** Idle orbiting plates are harmless; only armed wedges carry contacts. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits frost weakness with Frost Shard. Either defence remains legal for every hit.

**Shadowborn Captain — Blackprism:** 8 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Reversed Orbit | 3 hits: 11% + 11% + 14% = **36% phys**; held-quick-delayed.  | The same three plate-release poses run in the announced reverse order. None. |

**Art/rewards:** starting pose families: idle; Closing Orbit hold/contact; Broken Orbit hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 117: Comet Basilisk

**Darkness-born anatomy:** A six-limbed crystal predator emerged beneath fallen light, with a black body channel, sensory plate crown and mouth split into four radial segments. **Profile:** 4 ordinary Attack actions; Speed 1.00× (alternates at equal effective Speed); armour 10% physical reduction; weak **frost**; resists **poison**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Radial Bite | 2 hits: 12% + 15% = **27% phys**; slow-quick.  | Opposing mouth segments close as two visibly grouped pairs. Final landed contact: Bleed, 2% reference HP at each of the next 2 hero starts (4% additional total), strongest refresh only. |
| Crown Ray | 1 hit: 28% = **28% holy**; delayed.  | Crown plates align around the dark channel before one broad ray. None. |

**Lesson:** Four mouth segments are two advertised contacts, not four surprise bites. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Sunder its physical armour or use Bash for control; Pip exploits frost weakness with Frost Shard. Either defence remains legal for every hit.

**Shadowborn Captain — Deepcrown:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Ray and Return | 2 hits: 16% + 18% = **34% holy**; slow-held.  | Replay the same ray release twice; plates reopen fully before the second. None. |

**Art/rewards:** starting pose families: idle; Radial Bite hold/contact; Crown Ray hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 118: Shard Duelist

**Darkness-born anatomy:** A narrow six-armed entity crystallised around a dark axial core; two broad upper blades and four balancing hands are grown anatomy, never carried weapons. **Profile:** 4 ordinary Attack actions; Speed 1.10× (sometimes acts twice, normal cap 2); armour 10% physical reduction; weak **frost**; resists **poison**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Upper Cut | 1 hit: 27% = **27% phys**; feint.  | Balancing hands flutter; only the upper blade with a bright leading edge cuts. None. |
| Crossed Edges | 2 hits: 12% + 15% = **27% phys**; quick-held.  | One upper blade crosses the body; its partner remains visibly raised before following. None. |

**Lesson:** Watch armed blade edges rather than all six hands. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Sunder its physical armour or use Bash for control; Pip exploits frost weakness with Frost Shard. Either defence remains legal for every hit.

**Shadowborn Captain — Paleedge:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Edges | 3 hits: 10% + 11% + 13% = **34% phys**; quick-held-quick.  | Reuse alternate upper-blade contacts with a third fully telegraphed repetition. Final landed contact: Bleed, 2% reference HP at each of the next 2 hero starts (4% additional total), strongest refresh only. |

**Art/rewards:** starting pose families: idle; Upper Cut hold/contact; Crossed Edges hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 119: Lens Leech

**Darkness-born anatomy:** Two broad mouth discs join through a transparent waist around a suspended dark bead; it arose in the crater and has no ordinary leech ancestry. **Profile:** 3 ordinary Attack actions; Speed 1.20× (sometimes acts twice, normal cap 2); armour 0% physical reduction; weak **frost**; resists **poison**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Near Disc | 1 hit: 23% = **23% holy**; quick.  | Near mouth disc flattens into a bright ring before releasing one pulse. None. |
| Throughlight | 2 hits: 11% + 13% = **24% holy**; slow-delayed.  | The two discs open in sequence, each emitting one visible pulse. None. |

**Lesson:** A transparent waist is not a reflector or an invulnerability shield. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits frost weakness with Frost Shard. Either defence remains legal for every hit.

**Shadowborn Captain — Doublelens:** 6 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Pulses | 3 hits: 10% + 10% + 12% = **32% holy**; slow-quick-held.  | Reuse the disc contractions with a final near-disc pulse after a conspicuous pause. None. |

**Art/rewards:** starting pose families: idle; Near Disc hold/contact; Throughlight hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 120: Meteor Imp

**Darkness-born anatomy:** A squat three-legged fiend emerged where the dark met falling light; its wide split head and two oversized fist plates are its own mineral body. **Profile:** 4 ordinary Attack actions; Speed 0.90× (slower, sometimes permits two hero opportunities; no natural foe double); armour 15% physical reduction; weak **frost**; resists **poison**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Plate Fist | 1 hit: 30% = **30% phys**; slow.  | One broad fist rotates flat and holds before striking. None. |
| Split Grin | 2 hits: 13% + 14% = **27% frost**; quick-delayed.  | Head halves open separately and each expels a single visible shard. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |

**Lesson:** Separate the two head releases from harmless falling crystal dust. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits frost weakness with Frost Shard. Either defence remains legal for every hit.

**Shadowborn Captain — Fellgrin:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Paired Fists | 2 hits: 16% + 18% = **34% phys**; slow-held.  | Use left then right fist contact, with each plate flat in view before impact. None. |

**Art/rewards:** starting pose families: idle; Plate Fist hold/contact; Split Grin hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Champion of Darkness: Orris, the Starved Orbit — The Starscar

Orris is a broad annular body enclosing a many-toothed maw. Three asymmetrical mineral ribs grow from its legs; no ruined statue or external stones supply its shape. **Profile:** 15 ordinary Attack actions; Speed 0.8×, rate-driven alternation/hero doubles, boss cap 3; armour 25%; weak frost; resists poison; others neutral. Boss control applies.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Orbital Fist | 1 hit: 34% = **34% phys**; slow.  | A single wide rib flattens before pressing forward. None. |
| Falling Orbit | 3 hits: 11% + 12% + 14% = **37% phys**; slow-slow-quick.  | Three rib tips lock and release distinct wedges. None. |
| Empty the Core — charged | 3 hits: 21% + 22% + 23% = **66% holy**; held-slow-quick. Charge start: 0 hits / 0 damage; values are the separate release. | Ribs align around the open maw throughout commitment; three visible pulses follow. None. |

**Script/answer:** move 1 → move 2 → charge commitment → release or recovery → repeat during this one fight. The charge guarantees a real hero response and is interrupted by accepted non-locked control or **6% actual Champion max-HP damage** since commitment; no duplicate recovery/skip. Sunder and frost are useful, but no particular damage type is needed to interrupt. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits frost weakness with Frost Shard. Either defence remains legal for every hit.

**Presence/art/rewards:** a larger, separate Champion silhouette, not an enlarged normal sprite. Inventory idle, each ordinary move's distinct hold/contact/recovery, charge hold/release, every multi-hit contact, hurt and defeat. Nine-key estimates are not caps; author every pose needed for clear anatomy and timing. Preserve the former area-elder **Trophy role**, existing progression/first-clear flags, gold, Essence and already-eligible relic rewards. The unique-drop policy is OPEN; no new unique chance is assigned. One encounter, no farming replay.

## Area 4: The Blue Caves — zones 121–125

These five zones are played once in this order, with five explicit regular encounters and one Captain per zone. Then the area's named Champion is available as a separate, individually entered fight.

### Zone 121: Crystalwyrm

**Darkness-born anatomy:** Four transparent body chambers slide around a suspended spinal thread; darkness extruded this ring-toothed creature from a blue-ice seam, never from a lizard. **Profile:** 3 ordinary Attack actions; Speed 1.20× (sometimes acts twice, normal cap 2); armour 0% physical reduction; weak **holy**; resists **phys**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Ring Bite | 2 hits: 12% + 13% = **25% phys**; quick-quick.  | Inner and outer tooth rings expand separately before closing. None. |
| Chamber Discharge | 1 hit: 28% = **28% frost**; delayed.  | Light crosses four chambers, stops, then the last releases one broad shard. None. |

**Lesson:** The entire chamber animation resolves one shot unless three are announced. **Hero answers:** Wren uses Mark to support resisted arrows; Bleed still respects physical resistance; Tobin uses Bash, Exposed and Riposte; Sunder cannot remove resistance; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Deepglass:** 6 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Broken Discharge | 3 hits: 10% + 11% + 13% = **34% frost**; slow-held-quick.  | The existing chamber-release pose repeats three times with a held middle release. None. |

**Art/rewards:** starting pose families: idle; Ring Bite hold/contact; Chamber Discharge hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 122: Faceless Hunter

**Darkness-born anatomy:** A crescent head split by a vertical gap sits above a continuous shoulder ring with four folding arms; this newly emerged hunter has no former face or clothing. **Profile:** 4 ordinary Attack actions; Speed 0.95× (slower, sometimes permits two hero opportunities; no natural foe double); armour 0% physical reduction; weak **holy**; resists **phys**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Pale Reach | 1 hit: 29% = **29% frost**; held.  | One six-fingered hand spreads and becomes opaque before extending. None. |
| Fourfold Grip | 2 hits: 12% + 16% = **28% frost**; slow-quick.  | Upper arms close as one pair, then lower arms as another. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |

**Lesson:** Four arms make two grouped contacts, never an input lock. **Hero answers:** Wren uses Mark to support resisted arrows; Bleed still respects physical resistance; Tobin uses Bash, Exposed and Riposte; Sunder cannot remove resistance; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Stillface:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Reaches | 3 hits: 10% + 11% + 13% = **34% frost**; held-quick-delayed.  | Repeat the opaque-hand reach three times; no new arm or invisible grab appears. None. |

**Art/rewards:** starting pose families: idle; Pale Reach hold/contact; Fourfold Grip hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 123: Frost Eidolon

**Darkness-born anatomy:** A tall spiral body emerged from the cave-dark, its hollow centre bounded by two continuous ribbon limbs and a broad jaw suspended above its empty core. **Profile:** 4 ordinary Attack actions; Speed 1.00× (alternates at equal effective Speed); armour 0% physical reduction; weak **holy**; resists **phys**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Ribbon Edge | 1 hit: 26% = **26% phys**; delayed.  | Near ribbon straightens into a pale edge before swinging. None. |
| Core Exhalation | 2 hits: 12% + 14% = **26% frost**; slow-held.  | Two sides of the core constrict separately and release distinct pulses. Final landed contact: Weaken, -25% direct power for the next 1 hero opportunity. |

**Lesson:** Its hollow body is a target, not a ghost that ignores every attack. **Hero answers:** Wren uses Mark to support resisted arrows; Bleed still respects physical resistance; Tobin uses Bash, Exposed and Riposte; Sunder cannot remove resistance; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Bluecoil:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Ribbon Reprise | 2 hits: 15% + 17% = **32% phys**; quick-held.  | Alternate the same ribbon-edge contacts with a full visible hold before the second. None. |

**Art/rewards:** starting pose families: idle; Ribbon Edge hold/contact; Core Exhalation hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 124: Glass Leviathan

**Darkness-born anatomy:** A broad darkness-born body hangs on four downward jaw-hooks; a long horizontal mouth and two high translucent fins make its silhouette unlike a fish or slab of ice. **Profile:** 5 ordinary Attack actions; Speed 0.75× (slower, sometimes permits two hero opportunities; no natural foe double); armour 15% physical reduction; weak **holy**; resists **phys**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Maw Weight | 1 hit: 34% = **34% phys**; slow.  | All four hooks straighten and the mouth turns forward before one heavy drop. None. |
| Fin Pressure | 2 hits: 13% + 16% = **29% frost**; slow-delayed.  | Left then right fin bends around a visibly gathered pulse. None. |

**Lesson:** One body drop is one contact; supporting hooks never trample automatically. **Hero answers:** Wren uses Mark to support resisted arrows; Bleed still respects physical resistance; Tobin uses Bash, Exposed and Riposte; Sunder cannot remove resistance; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Deeppress:** 8 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Paired Weight | 2 hits: 17% + 18% = **35% phys**; held-slow.  | Reuse the hooked rise and maw drop twice with a complete reset. None. |

**Art/rewards:** starting pose families: idle; Maw Weight hold/contact; Fin Pressure hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 125: Rime Prowler

**Darkness-born anatomy:** Three curved legs carry a low disc body with an underside eye and two folding jaw-spears; it emerged between cave shadows rather than growing from an insect. **Profile:** 4 ordinary Attack actions; Speed 1.15× (sometimes acts twice, normal cap 2); armour 5% physical reduction; weak **holy**; resists **phys**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Jaw Spear | 1 hit: 25% = **25% phys**; quick.  | One jaw blade unfolds to full length before thrusting. None. |
| Under-eye | 1 hit: 27% = **27% frost**; feint-held.  | Both jaws twitch harmlessly; the underside aperture then contracts into one pulse. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |

**Lesson:** Do not react to the harmless jaw twitch before the eye pulse. **Hero answers:** Wren uses Mark to support resisted arrows; Bleed still respects physical resistance; Tobin uses Bash, Exposed and Riposte; Sunder cannot remove resistance; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Loweye:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Twin Spears | 2 hits: 15% + 17% = **32% phys**; slow-quick.  | The two existing jaw-spear contacts alternate with separate full extensions. None. |

**Art/rewards:** starting pose families: idle; Jaw Spear hold/contact; Under-eye hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Champion of Darkness: Istra, the Unseen Face — The Blue Caves

Istra is a giant crescent-headed hunter with six folding arms and an empty rectangular chest. It emerged as a predatory form, not a lost traveller or memory. **Profile:** 13 ordinary Attack actions; Speed 1×, rate-driven alternation/hero doubles, boss cap 3; armour 0%; weak holy; resists phys; others neutral. Boss control applies.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| White Reach | 1 hit: 31% = **31% frost**; delayed.  | A lower hand becomes opaque before extending. None. |
| Sixfold Grip | 3 hits: 11% + 12% + 14% = **37% phys**; slow-held-quick.  | Arms close as three visibly grouped pairs. Final landed contact: Weaken, -25% direct power for the next 1 hero opportunity. |
| Open the Hollow — charged | 4 hits: 17% + 17% + 18% + 18% = **70% frost**; slow-delayed-slow-quick. Charge start: 0 hits / 0 damage; values are the separate release. | All hands lift away from the open chest during commitment; four broad rays mark release. None. |

**Script/answer:** move 1 → move 2 → charge commitment → release or recovery → repeat during this one fight. The charge guarantees a real hero response and is interrupted by accepted non-locked control or **6% actual Champion max-HP damage** since commitment; no duplicate recovery/skip. Resisted physical kits can use unlocked control or actual burst; a full holy loadout is never mandatory. **Hero answers:** Wren uses Mark to support resisted arrows; Bleed still respects physical resistance; Tobin uses Bash, Exposed and Riposte; Sunder cannot remove resistance; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Presence/art/rewards:** a larger, separate Champion silhouette, not an enlarged normal sprite. Inventory idle, each ordinary move's distinct hold/contact/recovery, charge hold/release, every multi-hit contact, hurt and defeat. Nine-key estimates are not caps; author every pose needed for clear anatomy and timing. Preserve the former area-elder **Trophy role**, existing progression/first-clear flags, gold, Essence and already-eligible relic rewards. The unique-drop policy is OPEN; no new unique chance is assigned. One encounter, no farming replay.

## Area 5: The Silent Village — zones 126–130

These five zones are played once in this order, with five explicit regular encounters and one Captain per zone. Then the area's named Champion is available as a separate, individually entered fight.

### Zone 126: Hush Herald

**Darkness-born anatomy:** A crescent skull hangs above three chest-throat folds and two broad fingerless hands; the dark sent this reverse-jointed creature after the settlement fell silent. **Profile:** 4 ordinary Attack actions; Speed 0.90× (slower, sometimes permits two hero opportunities; no natural foe double); armour 0% physical reduction; weak **fire**; resists **frost**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Throat of Winter | 1 hit: 29% = **29% frost**; delayed.  | Three throat folds open as one aperture, then contract around one pulse. None. |
| Listening Hands | 2 hits: 12% + 16% = **28% phys**; slow-held.  | Left shoulder rises before its hand; the right stays high until its own contact. None. |

**Lesson:** The village is scenery, not a supply of human victims or spirits. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Stillthroat:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Invitations | 3 hits: 10% + 11% + 13% = **34% phys**; slow-held-quick.  | Reuse the two palm contacts in a three-beat sequence with no new hand. Final landed contact: Weaken, -25% direct power for the next 1 hero opportunity. |

**Art/rewards:** starting pose families: idle; Throat of Winter hold/contact; Listening Hands hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 127: Pale Leech

**Darkness-born anatomy:** A broad translucent predator formed with six hand-shaped fins, an empty longitudinal channel and a ring mouth at each end; it has no natural-animal predecessor. **Profile:** 3 ordinary Attack actions; Speed 1.20× (sometimes acts twice, normal cap 2); armour 0% physical reduction; weak **fire**; resists **frost**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Heat Hook | 1 hit: 27% = **27% phys**; quick.  | One fin spreads into a broad hook before sweeping. None. |
| Empty Pulse | 2 hits: 12% + 15% = **27% frost**; feint-quick.  | A harmless mouth flare precedes two contracting rings and two real contacts. None. |

**Lesson:** A flare is preparation, never a concealed Lamp drain. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Whitechannel:** 6 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Pulse Return | 3 hits: 10% + 11% + 12% = **33% frost**; slow-quick-held.  | Use the existing ring release three times, holding the final contraction visibly. None. |

**Art/rewards:** starting pose families: idle; Heat Hook hold/contact; Empty Pulse hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 128: Veil Fiend

**Darkness-born anatomy:** A floating body grew a broad skin membrane between four long elbows; its small ring mouth hangs below the central mass, with no cloak, wearer or lost person. **Profile:** 4 ordinary Attack actions; Speed 1.00× (alternates at equal effective Speed); armour 0% physical reduction; weak **fire**; resists **frost**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Veil Edge | 1 hit: 26% = **26% phys**; held.  | Near membrane stretches taut and shows a solid pale edge before cutting. None. |
| Open Fold | 2 hits: 13% + 14% = **27% frost**; slow-quick.  | Two elbow pairs spread independently, releasing one cold pulse each. None. |

**Lesson:** Only the taut leading edge contacts; idle flutter is harmless. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Tautveil:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Closing Folds | 2 hits: 16% + 17% = **33% frost**; held-delayed.  | Replay both fold releases with a clear pause and reset between them. None. |

**Art/rewards:** starting pose families: idle; Veil Edge hold/contact; Open Fold hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 129: Hollow Choir

**Darkness-born anatomy:** Six throat openings line a single upright body born in the darkness between houses; two large lower arms support it and there are no singers or captive voices within. **Profile:** 5 ordinary Attack actions; Speed 0.85× (slower, sometimes permits two hero opportunities; no natural foe double); armour 10% physical reduction; weak **fire**; resists **frost**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Low Note | 1 hit: 31% = **31% frost**; slow.  | The lowest throat opens as a broad ring, holds, then contracts. None. |
| Split Chorus | 2 hits: 13% + 14% = **27% frost**; slow-held.  | Upper and middle throat groups each release one visibly separate ring. Final landed contact: Weaken, -25% direct power for the next 1 hero opportunity. |

**Lesson:** A many-mouthed body is still one opponent and one move sequence. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Sunder its physical armour or use Bash for control; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Deepchoir:** 8 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Notes | 3 hits: 10% + 11% + 13% = **34% frost**; slow-held-quick.  | Existing throat-group releases form three advertised beats, not six mouths worth of damage. None. |

**Art/rewards:** starting pose families: idle; Low Note hold/contact; Split Chorus hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 130: Cold Seer

**Darkness-born anatomy:** Three pale sensory discs grow on an eyeless head above six short legs; a narrow vertical body channel formed when darkness learned to seek distant warmth. **Profile:** 4 ordinary Attack actions; Speed 1.05× (sometimes acts twice, normal cap 2); armour 5% physical reduction; weak **fire**; resists **frost**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Disc Cut | 1 hit: 27% = **27% phys**; delayed.  | One sensory disc tilts edge-first, locks, then sweeps. None. |
| Narrow Sight | 1 hit: 25% = **25% frost**; feint-held.  | Side discs blink harmlessly; the central channel opens around one broad ray. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |

**Lesson:** Sight is a timed projectile, never petrification or forced input. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Blindcrown:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Crossed Sight | 2 hits: 15% + 17% = **32% frost**; slow-quick.  | Replay the same ray with two separate channel contractions; no beam persists. None. |

**Art/rewards:** starting pose families: idle; Disc Cut hold/contact; Narrow Sight hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Champion of Darkness: Nera, the Hush Regent — The Silent Village

Nera has four high shoulders, an open crown of listening fins and a long throat with three diaphragms. It came for new light; no villager or monarch once occupied it. **Profile:** 12 ordinary Attack actions; Speed 0.95×, rate-driven alternation/hero doubles, boss cap 3; armour 10%; weak fire; resists frost; others neutral. Boss control applies.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Listening Palm | 1 hit: 30% = **30% phys**; held.  | A broad hand turns flat beneath a raised shoulder. None. |
| Hushed Chorus | 3 hits: 11% + 12% + 13% = **36% frost**; slow-slow-held.  | Three throat diaphragms close separately. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |
| Close Every Voice — charged | 3 hits: 18% + 18% + 20% = **56% frost**; held-slow-delayed. Charge start: 0 hits / 0 damage; values are the separate release. | The fins draw inward throughout commitment before three distinct throat releases. None. |

**Script/answer:** move 1 → move 2 → charge commitment → release or recovery → repeat during this one fight. The charge guarantees a real hero response and is interrupted by accepted non-locked control or **6% actual Champion max-HP damage** since commitment; no duplicate recovery/skip. The move name is metaphor: it never silences abilities or changes the chosen defence. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Sunder its physical armour or use Bash for control; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Presence/art/rewards:** a larger, separate Champion silhouette, not an enlarged normal sprite. Inventory idle, each ordinary move's distinct hold/contact/recovery, charge hold/release, every multi-hit contact, hurt and defeat. Nine-key estimates are not caps; author every pose needed for clear anatomy and timing. Preserve the former area-elder **Trophy role**, existing progression/first-clear flags, gold, Essence and already-eligible relic rewards. The unique-drop policy is OPEN; no new unique chance is assigned. One encounter, no farming replay.

## Area 6: The Rimewood — zones 131–135

These five zones are played once in this order, with five explicit regular encounters and one Captain per zone. Then the area's named Champion is available as a separate, individually entered fight.

### Zone 131: Thorn Seraph

**Darkness-born anatomy:** A suspended rib cage with branching bone and four long leg-spines grew from the canopy-dark; its crown belongs to a new creature, not a tree or deer. **Profile:** 5 ordinary Attack actions; Speed 0.75× (slower, sometimes permits two hero opportunities; no natural foe double); armour 15% physical reduction; weak **fire**; resists **frost**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Crown Descent | 1 hit: 35% = **35% phys**; slow.  | Rib branches align into one broad leading edge before the fall. None. |
| Open Ribs | 2 hits: 13% + 17% = **30% phys**; slow-quick.  | Left and right rib blades fold separately, each with a visible edge. None. |

**Lesson:** Environmental branches remain still and cannot attack. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Whitebriar:** 8 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Rib Reprise | 3 hits: 11% + 12% + 13% = **36% phys**; slow-held-quick.  | Repeat existing left/right blade contacts, reopening fully before the third. None. |

**Art/rewards:** starting pose families: idle; Crown Descent hold/contact; Open Ribs hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 132: Rime Hydra

**Darkness-born anatomy:** Three hollow necks with slit, ring and cross mouths converge on a compact six-legged body born under the closed canopy; it has no ordinary reptile faces. **Profile:** 4 ordinary Attack actions; Speed 1.00× (alternates at equal effective Speed); armour 5% physical reduction; weak **fire**; resists **frost**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Mouths | 3 hits: 8% + 9% + 12% = **29% frost**; slow-slow-quick.  | Slit, ring and cross apertures brighten in a fixed order before each pulse. None. |
| Folded Neck | 1 hit: 28% = **28% phys**; feint-held.  | Two necks recoil harmlessly; the middle remains raised before its single strike. None. |

**Lesson:** The one-hit neck move never gains hidden side bites. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Crossmouth:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Returning Mouths | 3 hits: 10% + 11% + 13% = **34% frost**; held-quick-delayed.  | Replay the same three aperture contacts in the announced reverse order. None. |

**Art/rewards:** starting pose families: idle; Three Mouths hold/contact; Folded Neck hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 133: Briar Maw

**Darkness-born anatomy:** A curved floating body surrounds a toothed central gap, with four short anchoring limbs and grown branching fangs; it emerged between dead roots but is not a plant. **Profile:** 4 ordinary Attack actions; Speed 0.90× (slower, sometimes permits two hero opportunities; no natural foe double); armour 10% physical reduction; weak **fire**; resists **frost**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Fang Close | 1 hit: 30% = **30% phys**; slow.  | Upper and lower fang arcs separate widely before one closure. None. |
| Side Teeth | 2 hits: 12% + 15% = **27% phys**; quick-held.  | Two broad fang plates extend sideways in separate contacts. Final landed contact: Bleed, 2% reference HP at each of the next 2 hero starts (4% additional total), strongest refresh only. |

**Lesson:** Distinguish one complete closure from two extending plates. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Sunder its physical armour or use Bash for control; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Hardbriar:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Fang Return | 2 hits: 16% + 18% = **34% phys**; slow-delayed.  | Use the same fang-close pose twice, reopening clearly before the second bite. None. |

**Art/rewards:** starting pose families: idle; Fang Close hold/contact; Side Teeth hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 134: Spineweaver

**Darkness-born anatomy:** Six jointed limbs radiate from a small dark sphere whose shell grows broad pale spines; it bends its own anatomy into traps without creating webs or terrain hazards. **Profile:** 3 ordinary Attack actions; Speed 1.20× (sometimes acts twice, normal cap 2); armour 5% physical reduction; weak **fire**; resists **frost**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Needle Fan | 1 hit: 24% = **24% phys**; quick.  | Near limbs align three spines into one announced fan contact. None. |
| Closing Loom | 2 hits: 11% + 13% = **24% phys**; slow-held.  | Left and right limb groups fold around the sphere separately. None. |

**Lesson:** The player never needs a movement control to escape its shapes. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Tightweave:** 6 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Folds | 3 hits: 10% + 10% + 12% = **32% phys**; quick-held-quick.  | Replay the same grouped-limb folds three times, not six independent stabs. Final landed contact: Bleed, 2% reference HP at each of the next 2 hero starts (4% additional total), strongest refresh only. |

**Art/rewards:** starting pose families: idle; Needle Fan hold/contact; Closing Loom hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 135: Ivory Devourer

**Darkness-born anatomy:** A huge vertical jaw walks on two broad forearms and balances on a thick hooked tail; its pale plates grew around the dark core rather than being collected bones. **Profile:** 5 ordinary Attack actions; Speed 0.80× (slower, sometimes permits two hero opportunities; no natural foe double); armour 20% physical reduction; weak **fire**; resists **frost**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Walking Bite | 1 hit: 34% = **34% phys**; slow.  | Forearms straighten, raising the open jaw before it closes forward. None. |
| Tail and Palm | 2 hits: 13% + 16% = **29% phys**; quick-delayed.  | The tail tip hooks visibly, then a broad palm follows after a full hold. None. |

**Lesson:** A large body has explicit contact moments, no passive collision damage. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Wideivory:** 8 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Two Bites | 2 hits: 17% + 18% = **35% phys**; slow-held.  | Repeat the walking-bite pose with the mouth fully open between contacts. None. |

**Art/rewards:** starting pose families: idle; Walking Bite hold/contact; Tail and Palm hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Champion of Darkness: Brakka, the White Briar — The Rimewood

Brakka is a suspended cage of branching bone on six thin legs, with a long underside jaw. It grew from canopy-dark, never from a tree or deer. **Profile:** 14 ordinary Attack actions; Speed 0.85×, rate-driven alternation/hero doubles, boss cap 3; armour 20%; weak fire; resists frost; others neutral. Boss control applies.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Briar Descent | 1 hit: 33% = **33% phys**; slow.  | Cage tips and presents a single broad bone edge. None. |
| Branching Teeth | 3 hits: 11% + 12% + 15% = **38% phys**; slow-quick-delayed.  | Three jaw plates extend one at a time. Final landed contact: Bleed, 2% reference HP at each of the next 2 hero starts (4% additional total), strongest refresh only. |
| Winter Cage — charged | 3 hits: 20% + 22% + 24% = **66% frost**; held-slow-quick. Charge start: 0 hits / 0 damage; values are the separate release. | The cage tightens visibly around its core before releasing three broad cold pulses. None. |

**Script/answer:** move 1 → move 2 → charge commitment → release or recovery → repeat during this one fight. The charge guarantees a real hero response and is interrupted by accepted non-locked control or **6% actual Champion max-HP damage** since commitment; no duplicate recovery/skip. Branches outside the creature stay scenery; only its shown body parts hit. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Presence/art/rewards:** a larger, separate Champion silhouette, not an enlarged normal sprite. Inventory idle, each ordinary move's distinct hold/contact/recovery, charge hold/release, every multi-hit contact, hurt and defeat. Nine-key estimates are not caps; author every pose needed for clear anatomy and timing. Preserve the former area-elder **Trophy role**, existing progression/first-clear flags, gold, Essence and already-eligible relic rewards. The unique-drop policy is OPEN; no new unique chance is assigned. One encounter, no farming replay.

## Area 7: Frostgate Bastion — zones 136–140

These five zones are played once in this order, with five explicit regular encounters and one Captain per zone. Then the area's named Champion is available as a separate, individually entered fight.

### Zone 136: Frost Regent

**Darkness-born anatomy:** A four-shouldered creature emerged to command the dark at the pass; an open crown of sensory bone surrounds a headless throat, never a human ruler beneath armour. **Profile:** 4 ordinary Attack actions; Speed 1.00× (alternates at equal effective Speed); armour 10% physical reduction; weak **fire**; resists **frost**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Crown Command | 1 hit: 29% = **29% frost**; delayed.  | Sensory bones fold toward the throat before one visible pulse. None. |
| Four Hands | 2 hits: 13% + 15% = **28% phys**; slow-held.  | Arms close as two clearly grouped pairs, not four surprise impacts. Final landed contact: Weaken, -25% direct power for the next 1 hero opportunity. |

**Lesson:** Its gestures are attacks, not commands that steal the hero's action. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Sunder its physical armour or use Bash for control; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Crownclosed:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Commands | 3 hits: 10% + 11% + 13% = **34% frost**; slow-quick-held.  | The same throat pulse repeats three times; the final crown closure holds longer. None. |

**Art/rewards:** starting pose families: idle; Crown Command hold/contact; Four Hands hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 137: Hushblade

**Darkness-born anatomy:** Three curved forearms grow around a long mouthless skull with a slit under the chin; it stepped from the fortress shadows with its blades already part of its body. **Profile:** 3 ordinary Attack actions; Speed 1.20× (sometimes acts twice, normal cap 2); armour 5% physical reduction; weak **fire**; resists **frost**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Underchin | 1 hit: 24% = **24% phys**; quick.  | Central blade unfolds below the skull, edge visible, before cutting upward. None. |
| Outer Pair | 2 hits: 12% + 14% = **26% phys**; slow-delayed.  | Two outer blades rise together but cut separately after distinct shoulder turns. None. |

**Lesson:** Three blades do not alter the announced two-hit base move. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Palecut:** 6 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Third Measure | 3 hits: 10% + 11% + 12% = **33% phys**; quick-held-quick.  | Repeat the same blade contacts in central-left-central order, shown before release. Final landed contact: Bleed, 2% reference HP at each of the next 2 hero starts (4% additional total), strongest refresh only. |

**Art/rewards:** starting pose families: idle; Underchin hold/contact; Outer Pair hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 138: Rime Sentinel

**Darkness-born anatomy:** A broad six-legged body grew a ring of overlapping face plates and two heavy striking arms; it bars the pass as a dark-born monster, not a possessed guard or lamp keeper. **Profile:** 5 ordinary Attack actions; Speed 0.80× (slower, sometimes permits two hero opportunities; no natural foe double); armour 20% physical reduction; weak **fire**; resists **frost**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Faceplate | 1 hit: 34% = **34% phys**; slow.  | Face ring locks into one broad edge before a forward press. None. |
| Heavy Pair | 2 hits: 13% + 17% = **30% phys**; slow-held.  | Left and right striking arms lift to full height independently. None. |

**Lesson:** Its defensive-looking face never grants unlisted immunity. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Deepplate:** 8 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Closing Rank | 2 hits: 17% + 18% = **35% phys**; held-slow.  | Reuse the faceplate press twice with one complete reopening between impacts. None. |

**Art/rewards:** starting pose families: idle; Faceplate hold/contact; Heavy Pair hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 139: Blackfrost Horror

**Darkness-born anatomy:** An elongated body is suspended between two pairs of reverse-jointed arms, with a wide abdominal mouth and a hollow crest; it emerged from compressed storm-dark. **Profile:** 4 ordinary Attack actions; Speed 1.05× (sometimes acts twice, normal cap 2); armour 10% physical reduction; weak **fire**; resists **frost**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Belly Cry | 1 hit: 28% = **28% frost**; held.  | The abdominal mouth stretches flat, holds, then contracts around a pulse. None. |
| Forearm Crossing | 2 hits: 13% + 15% = **28% phys**; quick-delayed.  | Front arms cross one at a time with separate opaque leading edges. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |

**Lesson:** The crest is decoration; the abdomen tells the actual cold hit. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Sunder its physical armour or use Bash for control; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Blackthroat:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Two Cries | 2 hits: 16% + 17% = **33% frost**; slow-held.  | Repeat the abdominal pulse with a fully visible reopening between releases. None. |

**Art/rewards:** starting pose families: idle; Belly Cry hold/contact; Forearm Crossing hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 140: Sky Scar

**Darkness-born anatomy:** A thin living aperture descended with the darkness: two opposing crescent jaws frame a membrane body, supported at ground level by four hooked tendrils. **Profile:** 3 ordinary Attack actions; Speed 1.25× (sometimes acts twice, normal cap 2); armour 0% physical reduction; weak **fire**; resists **frost**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Crescent Snap | 1 hit: 24% = **24% phys**; quick.  | Near crescent opens sideways and rotates toward the hero before contact. None. |
| Membrane Shiver | 2 hits: 12% + 13% = **25% frost**; slow-held.  | Upper and lower membrane halves contract separately, releasing two pulses. None. |

**Lesson:** A living aperture is one hittable body, not a portal spawning adds. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Closedsky:** 6 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Shivers | 3 hits: 10% + 11% + 12% = **33% frost**; quick-held-delayed.  | The same two membrane-release poses repeat for three clearly marked contacts. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |

**Art/rewards:** starting pose families: idle; Crescent Snap hold/contact; Membrane Shiver hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Champion of Darkness: Korr, the Closed Horizon — Frostgate Bastion

Korr is a fortress-sized silhouette scaled to the stage: four thick limbs hold an open crescent chest and a double crown of grown bone. It is a new dark-born commander, not Whitehush or Rowan. **Profile:** 15 ordinary Attack actions; Speed 1.1×, rate-driven occasional consecutive opportunities, boss cap 3; armour 15%; weak fire; resists frost; others neutral. Boss control applies.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Horizon Edge | 1 hit: 34% = **34% phys**; held.  | Near crown tips forward into one broad leading edge. None. |
| Fourfold Winter | 4 hits: 9% + 10% + 11% + 12% = **42% frost**; slow-held-quick-delayed.  | Four chest folds contract in a fixed displayed order. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |
| Lock the Sky — charged | 4 hits: 18% + 18% + 20% + 20% = **76% frost**; slow-slow-held-quick. Charge start: 0 hits / 0 damage; values are the separate release. | Both crown rings hold open around a chest aperture before four releases. None. |

**Script/answer:** move 1 → move 2 → charge commitment → release or recovery → repeat during this one fight. The charge guarantees a real hero response and is interrupted by accepted non-locked control or **6% actual Champion max-HP damage** since commitment; no duplicate recovery/skip. Korr is the Bastion area Champion; defeating it unlocks the separate Whitehush encounter, not another regional climax. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Presence/art/rewards:** a larger, separate Champion silhouette, not an enlarged normal sprite. Inventory idle, each ordinary move's distinct hold/contact/recovery, charge hold/release, every multi-hit contact, hurt and defeat. Nine-key estimates are not caps; author every pose needed for clear anatomy and timing. Preserve the former area-elder **Trophy role**, existing progression/first-clear flags, gold, Essence and already-eligible relic rewards. The unique-drop policy is OPEN; no new unique chance is assigned. One encounter, no farming replay.

## Regional Elder of Darkness: the Whitehush

**Story preserved:** the dark thing inside the Whiteout killed Rowan. It is not Rowan transformed, Kestrel's rival, a lamp guardian or the online Pale Tyrant. Preserve Kestrel's two existing lore lines, the Great Lantern's new construction after the Shroud falls, and existing first-clear/story flags. No forced companion, online changes, reset or farming rematch. The Bastion Champion is a subordinate encounter, not a substitute for this regional Elder.

**Profile proposal:**24 ordinary Attack actions over one HP bar; armour10%; weak fire, resists frost, others neutral. Speed1.0 above two-thirds HP,1.15 below two-thirds,1.3 below one-third; boss cap3. This three-phase timing proposal is not a new story reveal. Changes queue at move end and never alter an announced release or cancel the guaranteed hero response. No separate phase health bars, free heal, timer or Whiteout-hidden cues.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Snuffing Hand | 1 hit: 36% = **36% frost**; delayed.  | A charcoal-dark arm becomes solid against snow, fingertips lock, then it strikes. None. |
| Storm Steps | 4 hits: 12% + 14% + 16% + 18% = **60% phys**; slow-slow-quick-delayed.  | Four distinct weight shifts and footfall silhouettes mark four contacts; snow is harmless. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |
| Bury the Light — charged | 5 hits: 18% + 18% + 20% + 20% + 22% = **98% frost**; slow-held-slow-quick-delayed. Charge start: 0 hits / 0 damage; values are the separate release. | Chest opens into a dark doorway throughout commitment; five bright-edged snow releases remain fully visible. None. |
| Rowan’s Pass | 2 hits: 22% + 26% = **48% phys**; feint-delayed.  | A harmless spear-shaped shadow passes; two actual arm edges then form in sequence. This is remembrance, not Rowan resurrected. None. |

**Script and phases:** Phase1 rotates Hand → Steps → Bury commitment/release. Phase2 adds Rowan’s Pass after the Bury slot. Phase3 retains those four families, changes Steps to slow-held-quick-quick at the same60% total, and Hand to40%; new rhythm/stronger arm are announced before commitment. This is a proposed numerical progression, not approved tuning. Bury interruption uses6% actual Elder max HP or accepted unlocked Stun/Freeze contribution; shared one-recovery rules apply. Its full release is98%, but a missed individual hit is18–22%; failed interruption still leaves both defence choices.

**Hero answers:** Wren uses Mark and a trained Deadeye/finisher or a legal Sonic Arrow setup during the charge; Tobin uses Bash while unlocked or prepared damage, and per-hit parries restore his tools; Pip exploits fire with Fireball/Ignite, while resisted Frost Shard can still contribute control. No missing potion, holy weapon or forced character is required.

**Art/rewards:** one large Whitehush body; inventory each move's wind-up, hold, every contact/release, recovery, hurt, defeat and phase-transition poses plus authored storm/doorway/spear-shadow effects. Frame counts follow those actions; there is no fixed key cap. Preserve gold, Essence, existing relic eligibility and the existing regional story/first-clear ledger. Unique-drop handling remains OPEN and must be settled without repeat farming. No materials. No new Trophy type is invented for the regional Elder; preserve any existing entitlement pending coordinator mapping.

## Verification and implementation gates

Coverage:35 zone monsters,35 named same-art Captains,7 named Champions,1 regional Elder;43 unique designs and218 separate encounters. Verify zones106–140 each appear once and area-Captain/Champion progression does not turn into a queue or I–V cycle. Every normal has2 moves and its Captain exactly1 added third move; Captain-specific poses/effects are planned in the same anatomy/art pack and add no unique enemy design.

Test per-hit totals and status additions, fixed damage against increased hero HP, all three hero kits at zone-entry gear, partial/full defence, correct per-hit refunds and one counter, double/triple opportunity caps, charge control-lock rejection and actual damage thresholds, phase transitions mid-charge, and exactly-once progression/rewards. Trophy mapping belongs to the Champion role, not removed with materials. New enemy Venom and hero-target status numbers require C19 harmonisation before runtime. Sustain between these independent fights needs the existing healing model; no hidden full heal or invented consumable. This is a design handoff, not measured balance or implemented combat.
