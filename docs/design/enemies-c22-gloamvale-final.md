# C22 final-count proposal — The Gloamvale

**Design only, for owner/Claude approval.** Uses the confirmed [world structure](world-structure.md), read at checkpoint 2dea55a (including the named 2a61322 update). The count and hierarchy are settled; names, numerical tuning, status translations, Champion Trophy mapping and boss phase details remain proposals. This document supersedes this region's old pools, variants, gauntlets and I–V cycles. It changes no runtime, art or save state.

## Structure and shared card rules

Seven areas, five distinct zone monsters per area: **35 normal designs + 7 Champions of Darkness + the Voice as the one regional Elder of Darkness = 43 unique designs**. Each of the 35 zones also has a named **Shadowborn Captain**, a recolour/enhancement of that same zone monster with one extra move, not another unique design. Zones are 141–175. Each zone contains five individually entered regular fights against its monster, then its Captain. After five completed zones comes that area's Champion; after the seventh Champion comes the separate regional Elder. Thus 175 regular fights + 35 Captains + 7 Champions + 1 Elder = **218 encounters**. This is progression accounting, not a queued fight or one continuous gauntlet.

Every encounter has one hero and one enemy, entered through explicit active choice. No automatic next fight, simultaneous adds, offline combat or unattended kill/reward resolution. Pause freezes timeline/input windows; resume cannot reroll or replay committed rewards. Cooldowns/resources reset per encounter as C19 specifies; a boundary does not grant a new undocumented heal. Repeated regular encounters are the five authored encounters in a zone, not infinite boss farming. Captains, Champions and regional Elders are cleared once; a later return requires a separately justified stronger encounter. Preserve unique progression ledgers for all six zone fights.

All roster creatures below are **born/emerged with the darkness**, not corrupted wildlife, ghosts of villagers, possessed tools, trees or furniture. Corrupted existing wildlife belongs only to Hunting, which remains separate. The Voice's established story is the explicit exception; no replacement origin is invented.

**Statistics.** Toughness is neutral, uncritical ordinary Attack actions at suitable zone gear, with ordinary physical armour reflected; combos/crit/resistance change the actual result and need three-hero testing. Speed is relative to reference hero 1.0: above 1 sometimes doubles, below 1 sometimes gives the hero a double; ordinary/Captain cap 2, boss-tagged Champion/Elder cap 3. No extra action is injected at a fixed cadence. Damage is a percentage of reference max HP before temporary defence and type mitigation, converted to **fixed zone damage**, never damage scaling with the player's purchased HP. Each row lists individual hits and their whole direct total. Only phys/holy/poison/fire/frost are types; armour is separate from resistance. Unlisted types are neutral; no immunity.

**Defence and timing.** Each real hit independently accepts parry or dodge. Each parry refunds 1 from all active ability cooldowns immediately; exactly one guaranteed-critical counter follows only a fully parried, completed move. A mixed sequence retains individual refunds but gets no counter. A cancelled sequence gets none. Quick means a compact readable anticipation, not an unspecified instant hit; delayed/held means a visible pause; a feint has no damage or false actionable ring. All contacts have clear cues, including reduced motion. Speed and phases do not shrink reaction windows. Ordinary monsters alternate moves 1/2.

**Shared incoming-status proposals needing C19 harmonisation.** Bleed/Venom are 2% reference HP per next hero start, 2 ticks (4% maximum extra), strongest refresh without stacking; Venom has no ramp/anti-heal. Chill is one -10% reference-Speed stack for 2 subsequent hero opportunities, max 2 on hero, never Freeze. Weaken is -25% direct output for 1 hero opportunity. Status applies once on the named final contact when it lands through the chosen defence; Ward absorption alone does not prevent it. Parry and dodge prevent both contact and rider. An HP-damage-only rider requires an explicit move-specific exception. Burn is 4% reference HP at each of 2 subsequent hero starts (8% total). Blind gives a 30% miss chance on the next direct hero action, never on a reaction or its input window. None means none, with no ambient or reflected damage. Status clocks pause; defeat clears them under the C19 encounter reset.

**Charge contract.** A Champion/Elder charge commits one zero-hit opportunity; release is a separate next eligible opportunity only after at least one real hero opportunity. Hold a ready boss if necessary without adding moves, aging clocks or looping on readiness. Actual HP damage since commitment counts toward the printed threshold; real DoT counts, forecast damage and Ward damage do not. Accepted non-locked Stun/Freeze contributes boss stagger and cancels charge; the pending release becomes one recovery, which is also the full-stagger skip if both occur. Never grant two skipped opportunities. Preserve the shared 3-opportunity control lock. One ordinary move separates charges. Every released hit can still be defended if interruption failed. Phase changes queue at move end, preserve gauges/HP damage, never erase the guaranteed response and never alter an already announced release.

**Rewards.** Gold and zone-grade Essence; relics only under existing eligibility, not a random relic from every new foe. The old area-elder Trophy role moves to the **Champions**, with existing Trophy semantics preserved and exact ID mapping coordinator-owned. Preserve story and first-clear flags. **Unique-drop distribution is OPEN** now that bosses do not repeat; do not promise chances, guaranteed uniques or a farming source. No ore/wood/hide/herb/fibre/gem/Sigil/material-cache kill rewards.

**Move-first art rule.** Design each creature and its intended moves first, then inventory every required idle, wind-up, held anticipation, contact/release, recovery, hurt, defeat and phase pose. Existing art and seven-key estimates are not limits. A Captain recolours the same anatomy and shares the complete monster/Captain pack; Captain-specific third-move poses and effects are allowed and must be planned up front. Reuse is optional where it preserves the intended action, never a reason to weaken a move. Captain names identify enhancements, not additional unique designs. No art is generated here.

**Region and Captain palette:** ink-dark bodies, bone-grey edges and dim violet inner tissue; Captains recolour those same frames with deeper indigo and muted violet edges. Warm gold remains the hero lamp. The Heart of the Gloamvale is the full seventh area (zones171–175) before the separately entered Voice arena, confirmed by Claude PR#1 comment5940265643 / world-structure checkpoint b41592c. The Seam is a story landmark, never a Great Lantern or resource source.

## Area 1: The Last Descent — zones 141–145

Five zones are played once in this order. Each has five regular fights and its Captain, all individually entered; then comes the separate Champion encounter.

### Zone 141: Riftmaw

**Darkness-born anatomy:** Five legs brace two independently turning jaw rings; the darkness made this low hunter whole, never from a hound. **Profile:** 3 ordinary Attack actions; Speed 1.25× (sometimes acts twice, normal cap 2); armour 0% physical reduction; weak **fire**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| First Mouth | 1 hit: 23% = **23% phys**; quick.  | Front jaw opens sideways and locks before turning forward. None. |
| Mouth Behind | 2 hits: 12% + 12% = **24% phys**; quick-held.  | Front jaw closes; the larger rear ring waits visibly open before its bite. None. |

**Lesson:** One closed mouth does not end the two-hit move. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Backbite:** 6 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Closures | 3 hits: 10% + 10% + 12% = **32% phys**; quick-held-quick.  | Replay front-rear-front jaw contacts with complete reopenings. None. |

**Art/rewards:** starting pose families: idle; First Mouth hold/contact; Mouth Behind hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 142: Dusk Herald

**Darkness-born anatomy:** Four ring-jointed arms surround a headless neck aperture and vertical chest slit; this born emissary has no former face or clothes. **Profile:** 4 ordinary Attack actions; Speed 1.00× (alternates at equal effective Speed); armour 5% physical reduction; weak **fire**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Ringed Palm | 1 hit: 22% = **22% phys**; delayed.  | An elbow loop unfolds before the opaque palm strikes. None. |
| Breath of Dusk | 1 hit: 24% = **24% poison**; held.  | Chest slit widens, holds, then compresses around one visible ribbon. Final landed contact: Venom, 2% reference HP at each of the next 2 hero starts (4% additional total); no ramp or anti-heal. |

**Lesson:** The chest opening is preparation, not a poison aura. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Hollowaddress:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Paired Breath | 2 hits: 15% + 17% = **32% poison**; slow-delayed.  | Reuse the chest release twice with full reopenings. Final landed contact: Venom, 2% reference HP at each of the next 2 hero starts (4% additional total); no ramp or anti-heal. |

**Art/rewards:** starting pose families: idle; Ringed Palm hold/contact; Breath of Dusk hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 143: Nightlash

**Darkness-born anatomy:** Four whip-arms with broad jaw-hooks coil around a long body on one thick bracing leg; it emerged from road-dark without animal ancestry. **Profile:** 4 ordinary Attack actions; Speed 1.15× (sometimes acts twice, normal cap 2); armour 0% physical reduction; weak **fire**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Near Hook | 1 hit: 25% = **25% phys**; quick.  | Near arm unfolds until its broad hook is plainly visible. None. |
| Coiled Pair | 2 hits: 12% + 15% = **27% phys**; slow-held.  | Two hooks uncurl separately; the second stays raised before striking. Final landed contact: Bleed, 2% reference HP at each of the next 2 hero starts (4% additional total), strongest refresh only. |

**Lesson:** Track solid hooks rather than the coiling idle body. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Lastlash:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Returning Hooks | 3 hits: 10% + 11% + 13% = **34% phys**; quick-held-delayed.  | Replay near-far-near arm contacts with distinct holds. None. |

**Art/rewards:** starting pose families: idle; Near Hook hold/contact; Coiled Pair hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 144: Gloom Behemoth

**Darkness-born anatomy:** Two huge forearms carry a horizontal abdominal mouth over three low balancing fins; its shell is dark-born flesh, not inhabited stone. **Profile:** 5 ordinary Attack actions; Speed 0.75× (slower, sometimes permits two hero opportunities; no natural foe double); armour 20% physical reduction; weak **fire**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Belly Press | 1 hit: 34% = **34% phys**; slow.  | Mouth opens flat, forearms straighten, then the front edge presses. None. |
| Heavy Palms | 2 hits: 13% + 15% = **28% phys**; slow-delayed.  | Left and right palms rise and strike separately. None. |

**Lesson:** A large body has no unlisted collision damage. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Deepweight:** 8 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Press Again | 2 hits: 17% + 18% = **35% phys**; held-slow.  | The belly press repeats after a full reset. None. |

**Art/rewards:** starting pose families: idle; Belly Press hold/contact; Heavy Palms hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 145: Hollow Skitter

**Darkness-born anatomy:** Five short legs carry a hollow sensory ring above two folding mouth plates; it emerged whole between the road's shadows. **Profile:** 3 ordinary Attack actions; Speed 1.20× (sometimes acts twice, normal cap 2); armour 0% physical reduction; weak **fire**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Eye-edge | 1 hit: 22% = **22% phys**; quick.  | Ring tilts edge-first and shows its solid ridge before cutting. None. |
| Underbite | 2 hits: 11% + 13% = **24% phys**; quick-held.  | Two mouth plates unfold and close separately. None. |

**Lesson:** The hollow centre remains targetable. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Shadowborn Captain — Lowring:** 6 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Edges | 3 hits: 9% + 11% + 12% = **32% phys**; quick-held-quick.  | Repeat the ring sweep three times, visibly returning between hits. None. |

**Art/rewards:** starting pose families: idle; Eye-edge hold/contact; Underbite hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Champion of Darkness: Vark, the Gate of Teeth — The Last Descent

Vark is an enormous many-legged creature with three nested jaw arches; its gate-like anatomy grew with the darkness, not from a road structure. **Profile:** 12 ordinary Attack actions; Speed 1.05×, rate-driven occasional consecutive opportunities, boss cap 3; armour 15%; weak fire; resists none; others neutral. Boss control applies.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| First Arch | 1 hit: 31% = **31% phys**; delayed.  | Outer jaw lifts until its rim is fully visible. None. |
| Inner Teeth | 3 hits: 10% + 12% + 14% = **36% phys**; slow-held-quick.  | Three inner plates close in their announced order. Final landed contact: Bleed, 2% reference HP at each of the next 2 hero starts (4% additional total), strongest refresh only. |
| Close the Road — charged | 3 hits: 20% + 20% + 22% = **62% phys**; held-slow-delayed. Charge start: 0 hits / 0 damage; values are the separate release. | All arches stay open throughout commitment before three separate closures. None. |

**Script/answer:** move 1 → move 2 → charge commitment → release or recovery → repeat during this one fight. The charge guarantees a real hero response and is interrupted by accepted non-locked control or **6% actual Champion max-HP damage** since commitment; no duplicate recovery/skip. One missed release contact costs20–22%, not62%. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits fire weakness with Spark/Fireball. Either defence remains legal for every hit.

**Presence/art/rewards:** a larger, separate Champion silhouette, not an enlarged normal sprite. Inventory idle, each ordinary move's distinct hold/contact/recovery, charge hold/release, every multi-hit contact, hurt and defeat. Nine-key estimates are not caps; author every pose needed for clear anatomy and timing. Preserve the former area-elder **Trophy role**, existing progression/first-clear flags, gold, Essence and already-eligible relic rewards. The unique-drop policy is OPEN; no new unique chance is assigned. One encounter, no farming replay.

## Area 2: The Stillwood — zones 146–150

Five zones are played once in this order. Each has five regular fights and its Captain, all individually entered; then comes the separate Champion encounter.

### Zone 146: Manyjaw Chimera

**Darkness-born anatomy:** An asymmetrical body emerged with a head mouth, downward shoulder mouth and toothed tail bend on four uneven legs; no animals were combined. **Profile:** 4 ordinary Attack actions; Speed 1.20× (sometimes acts twice, normal cap 2); armour 5% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Shoulder Bite | 1 hit: 24% = **24% phys**; quick.  | Back rises to expose the shoulder mouth while the head stays shut. None. |
| Three Hungers | 3 hits: 8% + 8% + 9% = **25% phys**; slow-slow-held.  | Head, shoulder and tail mouths close in fixed visible order. None. |

**Lesson:** Its three mouths belong to one opponent. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Threehunger:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Hunger Returns | 3 hits: 10% + 11% + 13% = **34% phys**; held-quick-delayed.  | Reuse shoulder-head-tail contacts in that announced order. None. |

**Art/rewards:** starting pose families: idle; Shoulder Bite hold/contact; Three Hungers hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 147: Hollow Antler

**Darkness-born anatomy:** Eight thin legs support a hollow cage, downward jaw and branching sensory bones; the darkness grew a new creature, not a deer or tree. **Profile:** 5 ordinary Attack actions; Speed 0.75× (slower, sometimes permits two hero opportunities; no natural foe double); armour 20% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Cagefall | 1 hit: 33% = **33% phys**; slow.  | Legs straighten and the cage presents a solid leading edge before falling. None. |
| Antler Fold | 2 hits: 13% + 13% = **26% phys**; slow-delayed.  | Left and right sensory branches fold separately. None. |

**Lesson:** Environmental branches remain harmless scenery. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Darkcage:** 8 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Folding Crown | 2 hits: 16% + 18% = **34% phys**; held-slow.  | Reuse branch folds after a longer open-cage hold. None. |

**Art/rewards:** starting pose families: idle; Cagefall hold/contact; Antler Fold hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 148: Veil Mantis

**Darkness-born anatomy:** Four crescent forearms frame a narrow body with a horizontal split head; its hanging membrane is grown tissue, not a cloak or insect ancestor. **Profile:** 4 ordinary Attack actions; Speed 1.10× (sometimes acts twice, normal cap 2); armour 5% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Veil Cut | 1 hit: 26% = **26% phys**; feint.  | Rear arms flutter harmlessly; the opaque near crescent cuts. None. |
| Upper Pair | 2 hits: 12% + 15% = **27% phys**; quick-held.  | Upper arms rise together but release after separate shoulder turns. Final landed contact: Bleed, 2% reference HP at each of the next 2 hero starts (4% additional total), strongest refresh only. |

**Lesson:** The two-hit move never secretly uses all four arms. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Stillcut:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Crescents | 3 hits: 10% + 11% + 13% = **34% phys**; quick-delayed-quick.  | Reuse alternating upper-arm contacts with a full third reopening. None. |

**Art/rewards:** starting pose families: idle; Veil Cut hold/contact; Upper Pair hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 149: Duskworm

**Darkness-born anatomy:** A broad segmented body with an upper mouth seam and two paddle-limb rows emerged from canopy-dark, never from dead wood or a natural worm. **Profile:** 4 ordinary Attack actions; Speed 0.90× (slower, sometimes permits two hero opportunities; no natural foe double); armour 10% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Seam Bite | 1 hit: 29% = **29% phys**; held.  | The upper seam opens fully and closes as one contact. None. |
| Paddle Folds | 2 hits: 13% + 14% = **27% phys**; slow-quick.  | Left and right paddle groups fold as two separate hits. None. |

**Lesson:** Many paddles form grouped contacts, not a swarm. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Sunder its physical armour or use Bash for control; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Longseam:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Two Seams | 2 hits: 16% + 17% = **33% phys**; slow-delayed.  | Repeat the seam bite with a clear reopening. None. |

**Art/rewards:** starting pose families: idle; Seam Bite hold/contact; Paddle Folds hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 150: Crown of Eyes

**Darkness-born anatomy:** A living dark ring holds five sensory bulbs on fleshy spokes, with three supporting limbs and a separate central mouth; it was born here, not assembled. **Profile:** 4 ordinary Attack actions; Speed 1.00× (alternates at equal effective Speed); armour 0% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Central Gaze | 1 hit: 26% = **26% holy**; delayed.  | The central mouth opens around one pale pulse; eyes stay harmless. None. |
| Watching Hands | 2 hits: 12% + 14% = **26% phys**; slow-held.  | Two side spokes stiffen and sweep separately. Final landed contact: Weaken, -25% direct power for the next 1 hero opportunity. |

**Lesson:** A gaze is a defendable projectile, never petrification. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Fivesight:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Gaze Return | 2 hits: 15% + 17% = **32% holy**; held-quick.  | Reuse the central pulse twice with full mouth reopenings. None. |

**Art/rewards:** starting pose families: idle; Central Gaze hold/contact; Watching Hands hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Champion of Darkness: Vorra, the Hunger Between — The Stillwood

Vorra is a high-backed born chimera with an underside spine-jaw and two tail-mouths; no woodland animals were combined into it. **Profile:** 13 ordinary Attack actions; Speed 1.1×, rate-driven occasional consecutive opportunities, boss cap 3; armour 10%; weak holy; resists none; others neutral. Boss control applies.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Underjaw | 1 hit: 32% = **32% phys**; slow.  | Back rises to reveal the large underside mouth before closure. None. |
| Tail Hungers | 3 hits: 11% + 12% + 14% = **37% phys**; slow-quick-held.  | Two tail mouths bite, then one visibly repeats after a hold. None. |
| Open the Hunger — charged | 4 hits: 17% + 18% + 18% + 19% = **72% phys**; slow-held-quick-delayed. Charge start: 0 hits / 0 damage; values are the separate release. | Spine-mouth holds open during commitment; four broad plates close separately. None. |

**Script/answer:** move 1 → move 2 → charge commitment → release or recovery → repeat during this one fight. The charge guarantees a real hero response and is interrupted by accepted non-locked control or **6% actual Champion max-HP damage** since commitment; no duplicate recovery/skip. Four release plates are four choices against the same opponent. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Sunder its physical armour or use Bash for control; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Presence/art/rewards:** a larger, separate Champion silhouette, not an enlarged normal sprite. Inventory idle, each ordinary move's distinct hold/contact/recovery, charge hold/release, every multi-hit contact, hurt and defeat. Nine-key estimates are not caps; author every pose needed for clear anatomy and timing. Preserve the former area-elder **Trophy role**, existing progression/first-clear flags, gold, Essence and already-eligible relic rewards. The unique-drop policy is OPEN; no new unique chance is assigned. One encounter, no farming replay.

## Area 3: The Blind Mere — zones 151–155

Five zones are played once in this order. Each has five regular fights and its Captain, all individually entered; then comes the separate Champion encounter.

### Zone 151: Shadow Manticore

**Darkness-born anatomy:** Four hooked legs support an obsidian arch-body, splitting eyeless head and twin fin-tails; it emerged from pool-dark, distinct from the Hunting source beast. **Profile:** 4 ordinary Attack actions; Speed 1.20× (sometimes acts twice, normal cap 2); armour 5% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Shore Rake | 1 hit: 24% = **24% phys**; quick.  | Near leg rises above the bank line before its broad hook turns. None. |
| Twin Tails | 2 hits: 11% + 11% = **22% poison**; slow-held.  | Tails arch separately; the second fin holds visibly before release. Final landed contact: Venom, 2% reference HP at each of the next 2 hero starts (4% additional total); no ramp or anti-heal. |

**Lesson:** Two tails are two contacts, not one cloud. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Blackhook:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Tail Return | 3 hits: 10% + 11% + 13% = **34% poison**; slow-quick-delayed.  | Replay near-far-near tail releases with individual cues. None. |

**Art/rewards:** starting pose families: idle; Shore Rake hold/contact; Twin Tails hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 152: Blackwater Maw

**Darkness-born anatomy:** A vertical mouth with six palm-like fins and a thick keel emerged whole from the black water; no drowned person or corpse supplies its body. **Profile:** 4 ordinary Attack actions; Speed 1.00× (alternates at equal effective Speed); armour 0% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Open Hunger | 1 hit: 24% = **24% frost**; delayed.  | Upper seam spreads to a pale edge before one contraction. None. |
| Six Fins | 2 hits: 12% + 12% = **24% frost**; slow-held.  | Three left fins close together, then three right fins. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |

**Lesson:** Six fins make two base hits, not six surprises. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Deeprim:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Closures | 3 hits: 10% + 10% + 13% = **33% frost**; slow-held-quick.  | Repeat grouped-fin contractions with three numbered contacts. None. |

**Art/rewards:** starting pose families: idle; Open Hunger hold/contact; Six Fins hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 153: Mire Herald

**Darkness-born anatomy:** Two vertical crest fins rise above a narrow torso with four elbow loops; it was born under the mere and braces its lower arms on the shore. **Profile:** 4 ordinary Attack actions; Speed 0.95× (slower, sometimes permits two hero opportunities; no natural foe double); armour 0% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Crest Ray | 1 hit: 27% = **27% frost**; held.  | Crests align around one broad throat aperture before release. None. |
| Looped Reach | 2 hits: 12% + 15% = **27% phys**; quick-delayed.  | Two loops unfold into opaque palms and strike separately. None. |

**Lesson:** The surrounding water cannot deal extra damage. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Longcrest:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Paired Rays | 2 hits: 16% + 17% = **33% frost**; slow-delayed.  | Reuse throat releases with visibly reopening crests. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |

**Art/rewards:** starting pose families: idle; Crest Ray hold/contact; Looped Reach hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 154: Deep Hunger

**Darkness-born anatomy:** Six thick radial arms support a heavy rotating cylindrical mouth; the darkness made it as a predator, not a drowned leviathan. **Profile:** 5 ordinary Attack actions; Speed 0.80× (slower, sometimes permits two hero opportunities; no natural foe double); armour 15% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Turning Maw | 1 hit: 33% = **33% phys**; slow.  | Mouth rotates until a thick tooth plate faces forward, then closes. None. |
| Underarms | 2 hits: 13% + 16% = **29% phys**; slow-held.  | Two low arms lift clear of water and strike separately. None. |

**Lesson:** Only an armed tooth plate hits, not idle rotation. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Deepturn:** 8 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Two Turns | 2 hits: 17% + 18% = **35% phys**; held-slow.  | Repeat the rotating-maw contact after a full reset. None. |

**Art/rewards:** starting pose families: idle; Turning Maw hold/contact; Underarms hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 155: Nightfin

**Darkness-born anatomy:** Two spear-fins brace a small dark body around a coiled ring mouth; this newly emerged creature is neither a fish nor a preserved echo. **Profile:** 3 ordinary Attack actions; Speed 1.25× (sometimes acts twice, normal cap 2); armour 0% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Fin Thrust | 1 hit: 23% = **23% phys**; quick.  | One fin unfolds fully and points before thrusting. None. |
| Coiled Pulse | 2 hits: 11% + 13% = **24% frost**; slow-quick.  | Inner and outer mouth rings contract separately. None. |

**Lesson:** Low hovering never makes it unreachable to melee. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Fineye:** 6 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Pulses | 3 hits: 9% + 11% + 12% = **32% frost**; quick-held-quick.  | Replay ring releases three times with a held middle cue. None. |

**Art/rewards:** starting pose families: idle; Fin Thrust hold/contact; Coiled Pulse hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Champion of Darkness: Sable, the Deep Listener — The Blind Mere

Sable is a vertical maw on six radial fins with two tall sensory crescents; the pool-dark made it whole, not from a drowned person or carcass. **Profile:** 12 ordinary Attack actions; Speed 1.15×, rate-driven occasional consecutive opportunities, boss cap 3; armour 5%; weak holy; resists none; others neutral. Boss control applies.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Listening Fin | 1 hit: 30% = **30% frost**; delayed.  | One broad fin turns opaque before its pulse. None. |
| Blackwater Measure | 3 hits: 11% + 12% + 13% = **36% frost**; slow-held-quick.  | Three fin groups contract separately; splashing water is harmless. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |
| Close the Mere — charged | 4 hits: 17% + 17% + 18% + 18% = **70% frost**; slow-delayed-slow-quick. Charge start: 0 hits / 0 damage; values are the separate release. | Crescents curl around an aperture during commitment; four contractions mark release. None. |

**Script/answer:** move 1 → move 2 → charge commitment → release or recovery → repeat during this one fight. The charge guarantees a real hero response and is interrupted by accepted non-locked control or **6% actual Champion max-HP damage** since commitment; no duplicate recovery/skip. All contacts stay at the reachable bank, with no swimming or positioning. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Presence/art/rewards:** a larger, separate Champion silhouette, not an enlarged normal sprite. Inventory idle, each ordinary move's distinct hold/contact/recovery, charge hold/release, every multi-hit contact, hurt and defeat. Nine-key estimates are not caps; author every pose needed for clear anatomy and timing. Preserve the former area-elder **Trophy role**, existing progression/first-clear flags, gold, Essence and already-eligible relic rewards. The unique-drop policy is OPEN; no new unique chance is assigned. One encounter, no farming replay.

## Area 4: The Long Dusk Fields — zones 156–160

Five zones are played once in this order. Each has five regular fights and its Captain, all individually entered; then comes the separate Champion encounter.

### Zone 156: Scythefiend

**Darkness-born anatomy:** Three crescent forearms grow from a reverse-jointed body with a hooked head plate; the dark formed these blades as tissue, never from farm tools. **Profile:** 4 ordinary Attack actions; Speed 1.00× (alternates at equal effective Speed); armour 5% physical reduction; weak **frost**; resists **poison**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Underblade | 1 hit: 24% = **24% phys**; delayed.  | Central arm unfolds under the head before cutting upward. None. |
| Crooked Pair | 2 hits: 12% + 12% = **24% phys**; quick-held.  | Outer arms lift together; one waits visibly raised after the first cuts. None. |

**Lesson:** Three arms do not add a hit to the base pair. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits frost weakness with Frost Shard. Either defence remains legal for every hit.

**Shadowborn Captain — Longreap:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Cuts | 3 hits: 10% + 11% + 13% = **34% phys**; quick-held-quick.  | Reuse central-left-central blade contacts with full releases. Final landed contact: Bleed, 2% reference HP at each of the next 2 hero starts (4% additional total), strongest refresh only. |

**Art/rewards:** starting pose families: idle; Underblade hold/contact; Crooked Pair hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 157: Dusk Strider

**Darkness-born anatomy:** Four needle legs carry a disc body and downward jaw; a fifth punching limb folds inside its frame, a new form born between crop shadows. **Profile:** 3 ordinary Attack actions; Speed 1.25× (sometimes acts twice, normal cap 2); armour 0% physical reduction; weak **frost**; resists **poison**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Fifth Limb | 1 hit: 21% = **21% phys**; quick.  | Inner limb unfolds fully, points, then thrusts. None. |
| Bent Steps | 2 hits: 11% + 11% = **22% phys**; held-quick.  | Front legs bend into elbows and sweep separately; rear legs stay planted. None. |

**Lesson:** Walking is not an unlisted attack. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits frost weakness with Frost Shard. Either defence remains legal for every hit.

**Shadowborn Captain — Longstep:** 6 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Steps | 3 hits: 10% + 10% + 12% = **32% phys**; quick-held-delayed.  | Reuse front-leg sweeps with a delayed third repetition. None. |

**Art/rewards:** starting pose families: idle; Fifth Limb hold/contact; Bent Steps hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 158: Hunger Kite

**Darkness-born anatomy:** Three hinged mouth edges surround a triangular membrane body with two bracing hooks; it emerged in dark air and fights at hero height. **Profile:** 4 ordinary Attack actions; Speed 1.15× (sometimes acts twice, normal cap 2); armour 0% physical reduction; weak **frost**; resists **poison**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Folded Edge | 1 hit: 26% = **26% phys**; feint.  | Two corners flutter harmlessly; the opaque near edge cuts. None. |
| Tri-mouth | 2 hits: 12% + 15% = **27% poison**; slow-held.  | Two mouth edges release visible ribbons; the third stays closed. Final landed contact: Venom, 2% reference HP at each of the next 2 hero starts (4% additional total); no ramp or anti-heal. |

**Lesson:** Three sides are not three invisible hits. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits frost weakness with Frost Shard. Either defence remains legal for every hit.

**Shadowborn Captain — Blackfold:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Edge Return | 2 hits: 15% + 17% = **32% phys**; slow-quick.  | Repeat the near-edge fold and cut with full reopening. None. |

**Art/rewards:** starting pose families: idle; Folded Edge hold/contact; Tri-mouth hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 159: Gloam Ravager

**Darkness-born anatomy:** Two shoulder jaws flank a narrow face aperture above four thick forearms; this born predator pulls itself forward without a conventional animal body. **Profile:** 5 ordinary Attack actions; Speed 0.85× (slower, sometimes permits two hero opportunities; no natural foe double); armour 15% physical reduction; weak **frost**; resists **poison**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Shoulder Crush | 1 hit: 32% = **32% phys**; slow.  | Both jaws open and close together as one broad impact. None. |
| Four Knuckles | 2 hits: 13% + 15% = **28% phys**; quick-delayed.  | Forearms strike as two clearly grouped pairs. None. |

**Lesson:** Supporting arms never collide for free damage. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits frost weakness with Frost Shard. Either defence remains legal for every hit.

**Shadowborn Captain — Broadjaw:** 8 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Crush Again | 2 hits: 17% + 18% = **35% phys**; held-slow.  | Replay the shoulder crush after fully reopening the jaws. None. |

**Art/rewards:** starting pose families: idle; Shoulder Crush hold/contact; Four Knuckles hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 160: Bone Crescent

**Darkness-born anatomy:** A curved body of grown ivory tissue stands on four short legs around a dark core; it contains no collected bones or former creature. **Profile:** 4 ordinary Attack actions; Speed 1.00× (alternates at equal effective Speed); armour 10% physical reduction; weak **frost**; resists **poison**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Crescent Cut | 1 hit: 28% = **28% phys**; delayed.  | Upper tip turns its broad edge toward the hero before sweeping. None. |
| Open Arc | 2 hits: 12% + 14% = **26% frost**; slow-quick.  | Near and far arc sides contract for separate pulses. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |

**Lesson:** The hollow remains targetable, not immune. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Sunder its physical armour or use Bash for control; Pip exploits frost weakness with Frost Shard. Either defence remains legal for every hit.

**Shadowborn Captain — Whitearc:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Arc Reprise | 3 hits: 10% + 11% + 13% = **34% frost**; slow-held-quick.  | Replay the existing arc pulse three times with a held middle side. None. |

**Art/rewards:** starting pose families: idle; Crescent Cut hold/contact; Open Arc hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Champion of Darkness: Kharos, the Threefold Reaper — The Long Dusk Fields

Kharos has three crescent forearms around a hollow spindle torso; those grown blades belong to a new fiend, not a farmhand or possessed tool. **Profile:** 13 ordinary Attack actions; Speed 1×, rate-driven alternation/hero doubles, boss cap 3; armour 15%; weak frost; resists poison; others neutral. Boss control applies.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Central Blade | 1 hit: 32% = **32% phys**; held.  | Middle blade rises into a broad visible hook. None. |
| Three Measures | 3 hits: 11% + 12% + 14% = **37% phys**; slow-held-quick.  | Each arm turns its leading edge toward the hero before cutting. Final landed contact: Bleed, 2% reference HP at each of the next 2 hero starts (4% additional total), strongest refresh only. |
| Triangle of Night — charged | 3 hits: 20% + 22% + 24% = **66% phys**; held-slow-quick. Charge start: 0 hits / 0 damage; values are the separate release. | Blades hold an open triangle during commitment then cut in fixed order. None. |

**Script/answer:** move 1 → move 2 → charge commitment → release or recovery → repeat during this one fight. The charge guarantees a real hero response and is interrupted by accepted non-locked control or **6% actual Champion max-HP damage** since commitment; no duplicate recovery/skip. Its triangle is a charge tell, never a terrain trap. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits frost weakness with Frost Shard. Either defence remains legal for every hit.

**Presence/art/rewards:** a larger, separate Champion silhouette, not an enlarged normal sprite. Inventory idle, each ordinary move's distinct hold/contact/recovery, charge hold/release, every multi-hit contact, hurt and defeat. Nine-key estimates are not caps; author every pose needed for clear anatomy and timing. Preserve the former area-elder **Trophy role**, existing progression/first-clear flags, gold, Essence and already-eligible relic rewards. The unique-drop policy is OPEN; no new unique chance is assigned. One encounter, no farming replay.

## Area 5: Coldhearth — zones 161–165

Five zones are played once in this order. Each has five regular fights and its Captain, all individually entered; then comes the separate Champion encounter.

### Zone 161: Ashmouth

**Darkness-born anatomy:** Two rotating chest jaws and blunt finger-fans form a broad headless predator; its ash-grey tissue grew with the darkness, not from masonry or residents. **Profile:** 5 ordinary Attack actions; Speed 0.75× (slower, sometimes permits two hero opportunities; no natural foe double); armour 20% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Chest Crush | 1 hit: 34% = **34% phys**; slow.  | Inner jaws open and hold before closing forward as one contact. None. |
| Empty Breath | 1 hit: 23% = **23% poison**; delayed.  | Finger fans flatten as the cavity contracts around one visible ribbon. Final landed contact: Venom, 2% reference HP at each of the next 2 hero starts (4% additional total); no ramp or anti-heal. |

**Lesson:** An open cavity is not a lasting poison cloud. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Wideash:** 8 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Paired Breath | 2 hits: 16% + 17% = **33% poison**; held-quick.  | Replay the chest contraction twice with a full reopening. None. |

**Art/rewards:** starting pose families: idle; Chest Crush hold/contact; Empty Breath hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 162: Gloam Envoy

**Darkness-born anatomy:** A crescent head hangs by a spinal veil over a triangular shoulder frame and three arms; this dark-born emissary never wore a human body. **Profile:** 4 ordinary Attack actions; Speed 1.00× (alternates at equal effective Speed); armour 0% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Silent Address | 1 hit: 24% = **24% frost**; held.  | Head turns edge-on and the veil tightens before a wave. None. |
| Two Invitations | 2 hits: 12% + 12% = **24% phys**; slow-held.  | Outer palms strike in order; the central arm stays tucked. Final landed contact: Weaken, -25% direct power for the next 1 hero opportunity. |

**Lesson:** A gesture cannot choose the player's action. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Stilladdress:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Addresses | 3 hits: 10% + 11% + 13% = **34% frost**; slow-quick-held.  | Repeat the same wave with a longer final veil hold. None. |

**Art/rewards:** starting pose families: idle; Silent Address hold/contact; Two Invitations hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 163: Hollow Regent

**Darkness-born anatomy:** Four broad shoulder arches surround a downward mouth and ribbed core; it emerged as a new creature, never a ruler hidden under armour. **Profile:** 5 ordinary Attack actions; Speed 0.85× (slower, sometimes permits two hero opportunities; no natural foe double); armour 15% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Arch Press | 1 hit: 32% = **32% phys**; slow.  | Near arch tips its solid edge toward the hero before pressing. None. |
| Rib Count | 3 hits: 9% + 10% + 11% = **30% phys**; slow-slow-quick.  | Three front ribs extend one at a time with pale tips. None. |

**Lesson:** Idle arches grant neither contact damage nor immunity. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Deepregent:** 8 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Returning Ribs | 3 hits: 11% + 11% + 13% = **35% phys**; held-quick-delayed.  | Reuse the same extensions in the announced reverse order. None. |

**Art/rewards:** starting pose families: idle; Arch Press hold/contact; Rib Count hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 164: Grief Eater

**Darkness-born anatomy:** A broad sensory eye sits in a vertically hinged body supported by four gripping hands; it arose from darkness, not a mourner's soul or a dead person's grief. **Profile:** 4 ordinary Attack actions; Speed 1.10× (sometimes acts twice, normal cap 2); armour 0% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Hinged Palm | 1 hit: 26% = **26% phys**; quick.  | One hand turns opaque before extending from the near body half. None. |
| Open Silence | 2 hits: 12% + 15% = **27% frost**; slow-delayed.  | The body halves open separately around visible cold pulses. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |

**Lesson:** Its name introduces no fear or forced-input mechanic. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Deepsilence:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Two Palms | 2 hits: 15% + 17% = **32% phys**; slow-held.  | Replay the two palm contacts with a held second hand. None. |

**Art/rewards:** starting pose families: idle; Hinged Palm hold/contact; Open Silence hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 165: Veiljaw

**Darkness-born anatomy:** Three elbow-spines suspend a grown umbrella membrane over lower jaw rings; it emerged whole, with no cloth, wearer or household object in its origin. **Profile:** 3 ordinary Attack actions; Speed 1.20× (sometimes acts twice, normal cap 2); armour 0% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Lower Ring | 1 hit: 23% = **23% phys**; quick.  | Lower jaws open to a pale rim before contracting. None. |
| Veil Snap | 2 hits: 11% + 13% = **24% phys**; slow-held.  | Two membrane sections stretch taut and snap forward separately. None. |

**Lesson:** Loose flutter stays harmless; only taut edges contact. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Tautjaw:** 6 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Triple Snap | 3 hits: 10% + 10% + 12% = **32% phys**; quick-held-quick.  | Reuse the taut-section contacts three times with full resets. Final landed contact: Bleed, 2% reference HP at each of the next 2 hero starts (4% additional total), strongest refresh only. |

**Art/rewards:** starting pose families: idle; Lower Ring hold/contact; Veil Snap hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Champion of Darkness: Mora, the Unwelcome — Coldhearth

Mora has a huge triangular shoulder frame, six broad palms and a crescent head on a spinal veil; it was born to enter lightless places, not from a dead host. **Profile:** 14 ordinary Attack actions; Speed 0.95×, rate-driven alternation/hero doubles, boss cap 3; armour 10%; weak holy; resists none; others neutral. Boss control applies.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Silent Palm | 1 hit: 32% = **32% phys**; delayed.  | Near shoulder rises until the whole palm is opaque. None. |
| Empty Welcome | 3 hits: 11% + 12% + 14% = **37% frost**; slow-held-quick.  | Three palm pairs each close around a distinct pulse. Final landed contact: Weaken, -25% direct power for the next 1 hero opportunity. |
| Unmake the Warmth — charged | 4 hits: 18% + 18% + 20% + 20% = **76% frost**; held-slow-quick-delayed. Charge start: 0 hits / 0 damage; values are the separate release. | Head draws into the chest throughout commitment, then four hands release pulses. None. |

**Script/answer:** move 1 → move 2 → charge commitment → release or recovery → repeat during this one fight. The charge guarantees a real hero response and is interrupted by accepted non-locked control or **6% actual Champion max-HP damage** since commitment; no duplicate recovery/skip. The name does not strip Ward, cancel healing or introduce a Lamp bar. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Sunder its physical armour or use Bash for control; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Presence/art/rewards:** a larger, separate Champion silhouette, not an enlarged normal sprite. Inventory idle, each ordinary move's distinct hold/contact/recovery, charge hold/release, every multi-hit contact, hurt and defeat. Nine-key estimates are not caps; author every pose needed for clear anatomy and timing. Preserve the former area-elder **Trophy role**, existing progression/first-clear flags, gold, Essence and already-eligible relic rewards. The unique-drop policy is OPEN; no new unique chance is assigned. One encounter, no farming replay.

## Area 6: The Closed Orchard — zones 166–170

Five zones are played once in this order. Each has five regular fights and its Captain, all individually entered; then comes the separate Champion encounter.

### Zone 166: Nightcrown Behemoth

**Darkness-born anatomy:** Four arms and four short legs support a segmented body with hooked head plates; it was born under the closed sky, never from a fruit husk or tree. **Profile:** 5 ordinary Attack actions; Speed 0.80× (slower, sometimes permits two hero opportunities; no natural foe double); armour 15% physical reduction; weak **holy**; resists **poison**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Crownfall | 1 hit: 33% = **33% phys**; slow.  | Plates form one broad upper edge before the raised body drops. None. |
| Plate Bite | 2 hits: 13% + 13% = **26% phys**; slow-held.  | Left and right plate wheels open and close separately. None. |

**Lesson:** The armoured pose is not invulnerability. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Closedcrown:** 8 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Crown Returns | 2 hits: 17% + 18% = **35% phys**; held-slow.  | Repeat the same crown drop after fully reopening. None. |

**Art/rewards:** starting pose families: idle; Crownfall hold/contact; Plate Bite hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 167: Skyless Wyrm

**Darkness-born anatomy:** Open membrane rings surround four shoulder hooks and three lateral jaw prongs; it descended as a new dark creature, distinct from the separate Skyless Drake Hunting source. **Profile:** 4 ordinary Attack actions; Speed 1.20× (sometimes acts twice, normal cap 2); armour 5% physical reduction; weak **holy**; resists **poison**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Broken Halo | 1 hit: 24% = **24% phys**; quick.  | Near ring folds into a wedge; the far ring stays harmless. None. |
| Hook and Maw | 2 hits: 12% + 12% = **24% phys**; slow-held.  | One shoulder hook extends, then the held-open mouth closes separately. None. |

**Lesson:** Its long tail is decoration, not hidden damage. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Blackhalo:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Halo Reprise | 3 hits: 10% + 11% + 13% = **34% phys**; quick-held-delayed.  | Replay the same wedge contact three times with full unfolding. None. |

**Art/rewards:** starting pose families: idle; Broken Halo hold/contact; Hook and Maw hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 168: Threefold Maw

**Darkness-born anatomy:** Three thick mouth tubes converge on a low radial body with six blunt legs; the darkness made one predator, not a cluster of trapped souls or animals. **Profile:** 4 ordinary Attack actions; Speed 1.00× (alternates at equal effective Speed); armour 0% physical reduction; weak **holy**; resists **poison**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Near Mouth | 1 hit: 26% = **26% phys**; delayed.  | Lowest tube opens to a solid inner ring before biting. None. |
| Triad Breath | 3 hits: 8% + 9% + 11% = **28% poison**; slow-held-quick.  | Three tubes contract in fixed order, releasing one visible pulse each. Final landed contact: Venom, 2% reference HP at each of the next 2 hero starts (4% additional total); no ramp or anti-heal. |

**Lesson:** Three mouths remain one target, with no summons. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Deeptriad:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Returning Breath | 3 hits: 10% + 11% + 13% = **34% poison**; held-quick-delayed.  | Reuse the three releases in their announced reverse order. None. |

**Art/rewards:** starting pose families: idle; Near Mouth hold/contact; Triad Breath hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 169: Gloam Seraph

**Darkness-born anatomy:** Six membrane blades radiate around a hollow throat on two jointed lower fins; it emerged from the covered sky rather than falling from a divine or human form. **Profile:** 4 ordinary Attack actions; Speed 1.15× (sometimes acts twice, normal cap 2); armour 5% physical reduction; weak **holy**; resists **poison**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| High Membrane | 1 hit: 27% = **27% phys**; feint.  | Outer blades flutter; only the taut near blade turns edge-first to cut. None. |
| Throat Pair | 2 hits: 12% + 15% = **27% frost**; slow-held.  | Upper and lower diaphragms release separate cold pulses. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |

**Lesson:** An impressive silhouette cannot hide additional hits. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Veilcrown:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Pulses | 3 hits: 10% + 11% + 13% = **34% frost**; quick-held-quick.  | Replay the diaphragm releases three times, without extra blade contacts. None. |

**Art/rewards:** starting pose families: idle; High Membrane hold/contact; Throat Pair hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 170: Thorn Tyrant

**Darkness-born anatomy:** A wide downward jaw walks on two heavy forearms and rear hooks beneath branching spinal bone; it is a born predator, never the orchard animated. **Profile:** 5 ordinary Attack actions; Speed 0.75× (slower, sometimes permits two hero opportunities; no natural foe double); armour 20% physical reduction; weak **holy**; resists **poison**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Heavy Jaw | 1 hit: 35% = **35% phys**; slow.  | Forearms straighten and raise the whole jaw before one closure. None. |
| Spine Fold | 2 hits: 13% + 16% = **29% phys**; slow-delayed.  | Two broad spinal branches fold forward separately. None. |

**Lesson:** Surrounding trees and roots cannot attack. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Hardthorn:** 8 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Two Jaws | 2 hits: 17% + 19% = **36% phys**; held-slow.  | Replay the jaw closure twice with complete reopenings. None. |

**Art/rewards:** starting pose families: idle; Heavy Jaw hold/contact; Spine Fold hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Champion of Darkness: Neris, the Crown Without Dawn — The Closed Orchard

Neris is a four-legged dark-born monster with seven grown head plates around a narrow jaw; the plates are neither fruit nor branches. **Profile:** 15 ordinary Attack actions; Speed 0.9×, rate-driven alternation/hero doubles, boss cap 3; armour 20%; weak holy; resists poison; others neutral. Boss control applies.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Crown Edge | 1 hit: 34% = **34% phys**; slow.  | Seven plates align into one broad falling edge. None. |
| Parting Crown | 4 hits: 10% + 11% + 12% + 13% = **46% phys**; slow-held-quick-delayed.  | Four clearly grouped plate folds make four contacts. None. |
| Night Unfolding — charged | 4 hits: 18% + 18% + 20% + 20% = **76% phys**; slow-slow-held-quick. Charge start: 0 hits / 0 damage; values are the separate release. | Crown opens around its core during commitment, then releases four grouped contacts. None. |

**Script/answer:** move 1 → move 2 → charge commitment → release or recovery → repeat during this one fight. The charge guarantees a real hero response and is interrupted by accepted non-locked control or **6% actual Champion max-HP damage** since commitment; no duplicate recovery/skip. Seven plates do not secretly turn four advertised hits into seven. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Presence/art/rewards:** a larger, separate Champion silhouette, not an enlarged normal sprite. Inventory idle, each ordinary move's distinct hold/contact/recovery, charge hold/release, every multi-hit contact, hurt and defeat. Nine-key estimates are not caps; author every pose needed for clear anatomy and timing. Preserve the former area-elder **Trophy role**, existing progression/first-clear flags, gold, Essence and already-eligible relic rewards. The unique-drop policy is OPEN; no new unique chance is assigned. One encounter, no farming replay.

## Area 7: The Heart of the Gloamvale — zones 171–175

Five zones are played once in this order. Each has five regular fights and its Captain, all individually entered; then comes the separate Champion encounter.

### Zone 171: Void Herald

**Darkness-born anatomy:** A crescent head and concentric shoulder rings hold four palms around an open chest; this dark-born servant is not another Voice or a remembered person. **Profile:** 4 ordinary Attack actions; Speed 1.00× (alternates at equal effective Speed); armour 5% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Crescent Word | 1 hit: 28% = **28% frost**; delayed.  | Head turns edge-on above a narrowing aperture before one pulse. None. |
| Ringed Hands | 2 hits: 13% + 15% = **28% phys**; slow-held.  | Outer-ring palms strike together, then the inner pair after its own hold. Final landed contact: Weaken, -25% direct power for the next 1 hero opportunity. |

**Lesson:** No spoken command steals input. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Hollowword:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Words | 3 hits: 10% + 11% + 13% = **34% frost**; slow-quick-held.  | Replay the head-and-chest pulse with an explicit final hold. None. |

**Art/rewards:** starting pose families: idle; Crescent Word hold/contact; Ringed Hands hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 172: Rift Chimera

**Darkness-born anatomy:** Two offset torso cavities share four hooked legs and a long split jaw; the darkness made this asymmetrical body whole rather than fusing existing animals. **Profile:** 4 ordinary Attack actions; Speed 1.20× (sometimes acts twice, normal cap 2); armour 5% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Split Jaw | 1 hit: 25% = **25% phys**; quick.  | Near jaw half opens and becomes solid before biting. None. |
| Paired Hollows | 2 hits: 12% + 15% = **27% frost**; slow-delayed.  | Torso cavities contract independently around visible pulses. None. |

**Lesson:** Asymmetry means readable different organs, not random timing. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Twinrift:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Hollow Return | 3 hits: 10% + 11% + 13% = **34% frost**; held-quick-delayed.  | Replay near-far-near cavity releases with their own cues. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |

**Art/rewards:** starting pose families: idle; Split Jaw hold/contact; Paired Hollows hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 173: Deepveil Horror

**Darkness-born anatomy:** Six curved ribs suspend an inverted cone body with a transverse mouth and four small support arms; it emerged near the Heart without a borrowed corpse. **Profile:** 5 ordinary Attack actions; Speed 0.85× (slower, sometimes permits two hero opportunities; no natural foe double); armour 15% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Rim Crush | 1 hit: 33% = **33% phys**; slow.  | The cone tips to show a broad mouth edge before closing. None. |
| Veil Ribs | 2 hits: 13% + 16% = **29% phys**; slow-held.  | Two near ribs sweep separately while all others stay still. None. |

**Lesson:** A broad held silhouette stays targetable. **Hero answers:** Wren uses Mark or Barbed Arrow; Bleed bypasses armour; Tobin can Sunder its physical armour or use Bash for control; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Tightrim:** 8 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Crush Again | 2 hits: 17% + 18% = **35% phys**; held-slow.  | Repeat the same rim closure with a full visible reset. None. |

**Art/rewards:** starting pose families: idle; Rim Crush hold/contact; Veil Ribs hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 174: Night Devourer

**Darkness-born anatomy:** Thick jaw segments surround a dark aperture held at ground height by three hooks; it was born as a mouth, not a portal or captured celestial object. **Profile:** 3 ordinary Attack actions; Speed 1.25× (sometimes acts twice, normal cap 2); armour 0% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Near Segment | 1 hit: 24% = **24% phys**; quick.  | One jaw segment rises above the ring, locks, then closes. None. |
| Closing Night | 2 hits: 12% + 13% = **25% frost**; slow-held.  | Opposing segment groups make two separate pulse contractions. None. |

**Lesson:** The aperture never summons another actor or removes melee access. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Bash or earn Grit from individual parries; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Blackring:** 6 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Third Closure | 3 hits: 10% + 11% + 13% = **34% frost**; quick-held-quick.  | Reuse those grouped pulses for a third advertised contact. None. |

**Art/rewards:** starting pose families: idle; Near Segment hold/contact; Closing Night hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Zone 175: Seam Hunter

**Darkness-born anatomy:** Four opposing arms brace a thin double-spined body under a vertical jaw crown; it emerged to stalk the daylight seam with no earlier species or weapon identity. **Profile:** 4 ordinary Attack actions; Speed 1.10× (sometimes acts twice, normal cap 2); armour 10% physical reduction; weak **holy**; resists **none**; all other types neutral.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Seam Cut | 1 hit: 28% = **28% phys**; delayed.  | One forearm straightens into a broad pale edge before cutting. None. |
| Opposing Arms | 2 hits: 13% + 15% = **28% phys**; quick-held.  | Left and right arm pairs sweep separately with a held second pair. Final landed contact: Bleed, 2% reference HP at each of the next 2 hero starts (4% additional total), strongest refresh only. |

**Lesson:** It cannot extinguish or move the story's Seam. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Sunder its physical armour or use Bash for control; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Shadowborn Captain — Stillseam:** 7 ordinary Attack actions; same Speed, armour, types and both base moves. Recolour the same anatomy using the regional Captain treatment below and share one complete monster/Captain art pack. Plan any Captain-specific attack poses and effects up front; this remains one unique design. Add only this third move; rotate base move 1 → base move 2 → third move.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Three Cuts | 3 hits: 10% + 11% + 14% = **35% phys**; quick-delayed-quick.  | Replay the same forearm contacts three times with full returns. None. |

**Art/rewards:** starting pose families: idle; Seam Cut hold/contact; Opposing Arms hold/contact; hurt; dissipation. Each actual contact is distinct. Add all needed in-betweens, recovery and separate release/contact frames, with no seven-key cap. Inventory the Captain's named third-move wind-up, hold and contacts in this same pack; dedicated new poses/effects are allowed even where the timing can reuse a base motion. Gold, zone-grade Essence and existing eligible relic rules only; no material drops or automatic relic roll.

### Champion of Darkness: Sevrin, the Silent Gate — The Heart of the Gloamvale

Sevrin is a tall four-armed creature with a rectangular chest-mouth and crescent skull; it emerged as the last Champion, not a second Voice or a haunted gate. **Profile:** 15 ordinary Attack actions; Speed 1.1×, rate-driven occasional consecutive opportunities, boss cap 3; armour 10%; weak holy; resists none; others neutral. Boss control applies.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Outer Reach | 1 hit: 34% = **34% phys**; delayed.  | Outer arm straightens to show its whole leading edge. None. |
| Four Silences | 4 hits: 10% + 11% + 12% + 13% = **46% frost**; slow-held-quick-delayed.  | Four chest folds release pulses in a fixed shown order. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |
| Close the Approach — charged | 4 hits: 18% + 20% + 20% + 22% = **80% frost**; held-slow-quick-delayed. Charge start: 0 hits / 0 damage; values are the separate release. | Arms brace around the open chest during commitment before four contractions. None. |

**Script/answer:** move 1 → move 2 → charge commitment → release or recovery → repeat during this one fight. The charge guarantees a real hero response and is interrupted by accepted non-locked control or **6% actual Champion max-HP damage** since commitment; no duplicate recovery/skip. Victory unlocks the separate Voice encounter without a competing revelation or finale. **Hero answers:** Wren uses Mark and Pinned for a controlled damage/defence loop; Tobin can Sunder its physical armour or use Bash for control; Pip exploits holy weakness with Lantern Flare. Either defence remains legal for every hit.

**Presence/art/rewards:** a larger, separate Champion silhouette, not an enlarged normal sprite. Inventory idle, each ordinary move's distinct hold/contact/recovery, charge hold/release, every multi-hit contact, hurt and defeat. Nine-key estimates are not caps; author every pose needed for clear anatomy and timing. Preserve the former area-elder **Trophy role**, existing progression/first-clear flags, gold, Essence and already-eligible relic rewards. The unique-drop policy is OPEN; no new unique chance is assigned. One encounter, no farming replay.

## Regional Elder of Darkness: the Voice

**One big continuous fight with phases, not five appearances or five fights.** One HP bar, one target, one entry and one victory ledger. Preserve the established story exception: the Voice is the old dark that learned to speak, waits in this valley and is driven back rather than destroyed. The Climber stays a separate Deepwell figure; no Climber combatant or second regional Elder appears here. Sevrin is a subordinate Champion, not another climax.

**Profile proposal:**26 neutral uncritical ordinary Attack actions across the whole HP bar; armour10%; weak holy, no resistance, other types neutral. Proposed phase thresholds are two-thirds and one-third HP, with Speed1.0/1.2/1.5 and boss cap3. One tall dark body has a hollow face, layered arms and a torso aperture. Phases change how that same body opens and moves, not its identity or number of appearances. Thresholds, tuning and phase count need approval.

| Move | Per-hit damage, total and rhythm | Tell and status |
|---|---|---|
| Decree | 1 hit: 32% = **32% phys**; delayed.  | One high hand becomes solid and bends down after a visible hold. None. |
| Borrowed Song | 4 hits: 9% + 9% + 10% + 10% = **38% frost**; slow-held-quick-delayed.  | Four torso folds open separately around visible pulses; the song cannot charm or command player input. Final landed contact: 1 Chill, -10% reference Speed for 2 subsequent hero opportunities; max 2 stacks, no Freeze. |
| Held Light | 2 hits: 14% + 16% = **30% fire**; feint-held.  | A borrowed bright core rises harmlessly, settles, then two hands release separate broad contacts. None. |
| Snuff — charged | 4 hits: 16% + 16% + 16% + 16% = **64% phys**; slow-held-quick-delayed. Charge start: 0 hits / 0 damage; values are the separate release. | Hands remain open around the torso aperture throughout commitment; four shown hands close in order at release. None. |

**Script:** Decree → Borrowed Song → Held Light → Snuff commitment → release/recovery → repeat during this one encounter. Phase transitions queue at move end, preserving script position, HP damage, cooldowns and gauges without a free attack. Large hits may cross multiple thresholds without discarding overflow or adding invulnerability gates. A pending charge retains its announced release and damage ledger; no transition cancels the guaranteed hero response.

| Proposed phase | Changes for newly committed moves only |
|---|---|
|1, Above two-thirds HP|Use the four rows above. Snuff is4×16%=64%phys. The stable script teaches all four move families.|
|2, Two-thirds to one-third|Decree becomes34%; Song remains38%; Held Light becomes12%+12%+16%=40%fire, slow-held-quick; Snuff becomes5×16%=80%phys, with a visible held fifth hand.|
|3, Below one-third|Decree becomes36%; Song remains the same four-hit38% move; Held Light retains three-hit40%; Snuff becomes7×16%=112%phys, slow-held-quick-delayed-slow-held-quick, all seven hands shown before commitment.|

**Snuff interruption:**6% actual whole-bar Elder HP since commitment, equivalent to1.56 neutral reference Attack actions at the26-action target, or accepted non-locked Stun/Freeze contribution. Real DoT HP loss counts, forecast Burn/Ward damage does not. Guarantee a real hero opportunity even if Speed selects the Voice first. Interrupt consumes the pending release as one recovery; full stagger uses that same skip. An ordinary move must resolve before another charge. One missed final-phase contact costs16%, two32%; all seven undefended can be lethal. Both defences work on every hit. No extra DoT, anti-heal or Lamp penalty accompanies Snuff. Seven parries earn seven refunds and one completed-move counter.

**Hero answers:** Wren uses legal Mark/Pinned→Sonic Arrow control or prepared Deadeye/finisher damage; Pinned widens every hit of the selected move, with boss slow halved. Tobin uses unlocked Bash, prepared damage and individual parries; Last Stand keeps its C19 active-defence behavior, never automatic retaliation. Pip uses holy Flare, actual Burn/Ignite damage or Freeze contribution; Held Light does not create fire immunity. No mandatory hero, consumable, positional answer, adds, timer, separate Lamp touch or world-raid mechanic.

**Story outcome:** zero HP resolves the one victory and cancels remaining contacts. The body unthreads and the dark sinks away, saying the existing line, “Every flame goes out. I can wait.” Held lights return home; the sky opens to ordinary night. Preserve the warm Hollow's Rest beat and Hesketh's established closing line. The Voice retreats into the Deepwell beneath camp for the first time; this does not automatically unlock a replay. Any return requires a new, stronger, justified encounter. Already earned progress stays earned.

**Art and rewards:** one coherent Voice body and complete pack, with all move-specific wind-ups, holds, releases, individual contact keys, hurt/defeat and phase-transition poses inventoried before production. Seven contact hands must each be visibly authored, never invisible extra damage. Preserve gold, Everlasting Essence, existing relic eligibility and exactly-once story/first-clear flags. Unique-drop distribution is OPEN; promise no chance, farming route or guaranteed unique. No materials/Sigils. Preserve any existing regional Trophy entitlement pending coordinator mapping, without inventing a new currency.

## Verification and implementation gates

35 zone monsters +7 named Champions +1 regional Elder =43 unique designs;35 same-anatomy Captains add no unique designs.175 regular fights +35 Captains +7 Champions +1 Elder =218 encounters. Zones141–175 each appear once. Each normal has2 moves, each Captain inherits those unchanged plus1 third move. Seven areas are played once; no I–V cycles, queues, automatic next fights or repeat farming. The Heart's seven-area mapping is confirmed in world-structure checkpoint b41592c.

Verify hit sums/status additions, fixed damage with changed max HP, all three hero kits, attainable sustain without invented healing, full/mixed defence, per-hit refunds and one counter, consecutive opportunity limits, control-lock rejection, actual-damage charge thresholds, pending-charge phase changes and exactly-once progression/rewards. Preserve Champion Trophies and approved first-clear flags; no material drop or universal relic roll. Incoming status numbers and enemy Venom need final C19 harmonisation. Art follows the intended monsters and moves, not the frames currently available. This is a complete proposal, not implemented or measured balance.
