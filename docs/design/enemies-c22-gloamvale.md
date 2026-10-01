# C22 — The Gloamvale: enemies and the Voice

> **Superseded selection draft (1 October 2026):** see [the fantasy review](enemies-c22-fantasy-review.md). The owner now requires darkness-born combat enemies, one enemy per fight with no queues, and Hunting kept separate. Elders retain Trophies. Final roster count is pending the owner and Claude. Do not implement this earlier roster or its gauntlet/Hunting combat proposals as written.

Status: **complete regional design proposal, awaiting owner and Claude review**. Design only; no runtime or art. Based on `c4542cf`, the active-only C19 handoff `c26ed05`, `enemies-c22.md`, `regions-4-5.md` §2, `lore.md` §§4.1 and 8.6–8.8, and the approved resource ladder in `art/resources/regional-audit/complete-ladder.json`. Relative numbers below are proposed test targets, not measured balance.

Read with [the shared C22 contract](enemies-c22-contract.md), which owns common scheduler, charge, reward and status rules. Explicit regional overrides below are proposals; the refined C19 handoff takes precedence over superseded text still present in the base checkout.

## Reading these cards

The Gloamvale is an outdoor valley under a closed grey-violet sky. Nothing here forms a healthy living population: beasts are echoes of what lived here, people are remnants, crops and timber are preserved dead matter. Defeat releases the dark's hold; it does not make killing villagers or harvesting souls the reward loop. Ordinary foes leave an ordinary remnant. The Voice alone withdraws rather than becoming a restored creature. No extra Shroud, Great Lantern, Region 5 boss, Climber encounter or world-raid content is added.

There are **six areas, 24 normal cards, 24 named elite-base variants, six elders and one five-phase Voice encounter**. Each fight has one hero and one foe. A gauntlet is an ordered queue, never simultaneous combat; every next fight needs deliberate player confirmation. All attacks require active play; there is no automatic hero selection, unattended repeat loop or offline combat reward. Pausing freezes the pending move and input clock; resuming cannot reroll it or grant elapsed-time damage/refunds.

### Numerical and timing contract

- `S` is Speed divided by the equal-progression reference hero's unmodified Speed. At S0.75–0.90 the foe usually alternates but the hero periodically doubles; it does not naturally double. S1.00 alternates. S1.20 gives about six foe opportunities per five hero opportunities; S1.25 gives five per four; S1.40 seven per five; S1.50 three per two. These are long-run ratios before control and the sequence cap, not a scripted promise that a particular move follows itself. Ordinary foes/variants cap at two consecutive opportunities; elders and the Voice cap at three. The cap matters against a slowed hero; a faster foe never resolves an extra move inside a multi-hit sequence. Every card's listed S also specifies its expected consecutive pattern through this paragraph.
- Toughness is the target number of neutral, uncritical ordinary Attack actions to defeat at equal progression, with reference physical armour reflected, as in the shared contract. Listed type weaknesses/resistances change a particular kit's realised action count; also measure each active kit separately. No assumed perfect-counter streak. N3–5, V6–8, E10–15. Wren/Tobin physical kits and Pip's elemental kit each need separate calibration; type resistance must not turn an ordinary encounter into an unintended wall. Armour is a proposed **physical damage reduction**, shown independently of elemental resistance: light 0–5%, medium 10%, heavy 20%. Listed weakness uses the existing 1.5 multiplier and resistance 0.6; all unlisted types are neutral. Types are only phys, holy, poison, fire, frost. No immunity.
- Damage is percent of the equal-progression reference hero's maximum HP **before Guard/Ward and the hero's damage-type mitigation**, matching the shared reference-HP convention. Engine coefficients must be calibrated to those outputs as fixed zone stats, not installed as true percent damage; raising the player's max HP never raises the same foe's damage. `12+12=24% phys` means two separate hits, 12% each, 24% if both land. No hidden second full-strength hit. Status budgets are additional and always shown. Single normal hits cost 20–35%; multi-hits divide a comparable budget. Variant/elder single hits remain survivable; the Voice's optional charged full sequence is the only proposed greater-than-full-HP direct budget.
- `t[0.80,1.35]` gives impact times in fight-presentation seconds after the move begins. Time gaps are intentional; every real hit gets its own parry/dodge input windows and visible ordinal; each defence retains its C19 width across hits, with dodge wider than parry. A feint is a readable preparation with **no false actionable ring** or damage. The animation itself consumes no defence input; a player pressing early still follows C19 early-input handling. Both defence choices work on every actual hit. Timings do not shrink with Speed, phases or hero HP. Reduced motion retains rings, ordinals and stationary silhouette tells. No sound-only cues.
- A successful parry refunds **1 from every active ability cooldown for each hit**, even if later hits are dodged/missed. Exactly one guaranteed-critical counter follows only an entirely parried move. Missed hits do not cancel successful earlier refunds. An interrupted/cancelled sequence never grants an all-parry counter. Hit count is therefore a deliberate cooldown/resource reward; variants do not gain hits merely to become statistically harder.
- Hero-target **Bleed/Venom/Burn** below are explicit Gloamvale C22 magnitude overrides: 2% reference max HP per tick for two subsequent hero starts, one instance of each type, refresh not stack, no immediate tick; maximum combined damage 4% HP per hero start. Apply only on the stated hit actually damaging HP, once per move; Ward fully absorbing it prevents the rider. A kill clears the remaining hostile status before a fresh foe. No Venom ramp, anti-heal or spreading. Hero-target **Weaken** is -25% direct power for the next one hero opportunity; **Chill** is -10% reference Speed for two subsequent hero opportunities per listed stack, at most two stacks under the shared contract and never hero Freeze; neither narrows timing windows. Hero-target Blind is omitted to avoid taking the selected action away through random failure. All duration clocks pause with combat.
- Elders' three moves rotate A→B→C; C is a zero-hit charge commitment followed by its release at the next eligible elder opportunity. Charge initiation and release are separate opportunities of one authored move; the zero-hit start never qualifies for a counter. Release must wait until at least one real hero opportunity has occurred. If the boss is ready first, hold it without aging clocks or choosing a substitute attack. **Any accepted Stun/Freeze contribution while not control-locked, or actual cumulative HP damage equal to 6% of elder maximum HP during the charge, interrupts it.** Existing DoT counts only when it actually deals HP damage; forecast damage, Ward damage and overheal do not. On interrupt, cancel release; the pending release opportunity becomes zero-damage recovery, then continue at A. If stagger independently reaches 100, its one skip and this recovery are the same opportunity, never two. The shared three-opportunity control lock includes that recovery/skip. At least one ordinary move resolves before a new charge. Missed interruption remains answerable by parry or dodge.
- Normal/variant selection alternates its two moves, starting with the first. Thus no hidden RNG chooses a long/short timing at the last instant. A named variant is a **base**, not a mandatory elite modifier plus a champion plus another damage multiplier. Shared elite modifiers must remain within the displayed card budget or be separately retuned. Every new gauntlet foe resets cooldowns, resources and statuses under C19; HP carries without a new free heal. No finisher starts pre-opened.

### Existing-design audit

| Existing foe | Decision | Solo purpose and necessary change |
|---|---|---|
| Lurcher | Rework | Keep the low dusk-hound silhouette; replace pack hunting with a readable doubled jaw rhythm. It is an echo, not a breeding predator. |
| Stillwalker | Rework | Keep its arrested movement. Replace “moves only when unobserved” with a fixed held pose and delayed blow; no camera, blink or looking-away detection. |
| Merewight | Keep, specify | Its rippleless rise makes a strong quiet feint; the raised hand, not an invisible water disturbance, announces the real hit. |
| Scarecrow | Rework | Keep the dark-filled empty farmhand. Give it a hooked arm and deliberate stutter; no extra summoned flock. |
| Hearthless | Keep, specify | The human absence is the region's emotional centre. A reaching hand and empty grate provide separate clear timings, never stolen player controls. |
| Orchard Husk | Rework | Keep the heavy fallen-fruit idea, but make its descent an attack animation. It is always targetable, never waits for a specific damage type or a mandatory strike to become hittable. |

**Owner reward direction:** enemy victories award gold and zone-grade Essence (Undimmed/Unbroken/Everlasting). Relics retain their existing encounter eligibility, unlock conditions and reward rules; this roster does not give every foe a new random relic roll. Bosses may award occasional uniques only through their approved reward tables. Kills award no ore, wood, hide, herbs, fibre, gems, Sigils or material caches. Exact quantities and rates remain for the balance patch. Preserve existing story unlocks and first-clear flags, paid once; do not invent a new currency. Remnants, tools, timber and plant remains mentioned in concepts or art are scenery only, never loot. Resource gathering and the approved resource ladder remain separate from enemy rewards.

## 1. The Last Descent

Loose scree and road furniture make the first lesson legible against the valley sky. Its family lean is physical attacks and fire weakness. Nothing requires leaving the fixed combat stage.

### Lurcher — normal beast echo

A former road hound's stretched shadow still tries to bring a traveller to heel; defeat leaves an old collar. **S1.25, N3; armour 0%; weak fire; resists none.** It sometimes doubles (about one extra opportunity per four hero opportunities).

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Low Bite | 1 × 23% phys; t[0.75] | Forelegs fold, jaw opens level with the road; no status. |
| Backward Snap | 12+12=24% phys; t[0.80,1.55] | Head turns away, then both jaws show in two clear poses; no status. |

**Tests:** keeping the second defence choice after a deceptively small first hit. **Wren:** Pinning Shot eases both snap windows; a mixed defence still preserves cooldown refunds. **Tobin:** Brace/Bulwark reward both parries without demanding them; Bash interrupts its next opportunity. **Pip:** Fireball exploits fire weakness, Frost Shard buys space. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7 poses:** idle crouch, jaw wind-up, forward bite, turned-head wind-up, backward snap, hurt, collapsed collar-shadow.

### Scree Lurcher — named elite-base beast echo

A broad road-hound echo wears loose stones caught in its outline. **S1.25, V6; armour 10%; weak fire; resists none.** Same occasional doubles; speed is not increased with its durability.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Stone Jaw | 1 × 29% phys; t[1.00] | Jaw opens under an unmistakable hanging stone; no status. |
| Broken Step | 10+10+10=30% phys; t[0.85,1.35,2.10] | Three foot lifts, with a longer final hold; final HP-damaging hit adds Bleed, 2% × 2 hero starts (maximum move cost 34%). |

**Tests:** the held third beat, not a faster reflex requirement. **Wren:** Mark→Deadeye shortens its armoured fight. **Tobin:** Sunder then Attack is reliable; parrying one/two hits remains useful. **Pip:** Burn can keep dealing damage through the longer pattern. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** Lurcher skeleton; stone-jaw wind-up/hit and stepped-snap wind-up/hit, idle, hurt, defeat; third hit reuses the snap pose.

### Milestone Bearer — normal construct

A road marker lifted by the dark swings its broken pointing arm; it falls back as a readable stone. **S0.75, N5; armour 20%; weak fire; resists poison.** Slow, no natural foe double.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Point the Way | 1 × 32% phys; t[1.45] | The carved pointing arm rises fully before falling; no status. |
| Gravel Knuckles | 13+13=26% phys; t[1.00,1.95] | Both square fists open before alternating strikes; no status. |

**Tests:** waiting through a long visible hold rather than mashing defence. **Wren:** Mark boosts damage without needing a holy weapon. **Tobin:** Sunder is the direct armour answer. **Pip:** Fireball fits its weakness; Frost Shard also delays the slow actor. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** upright idle, pointing wind-up/hit, fists wind-up/hit, chipped hurt, ordinary fallen marker.

### Last Milestone — named elite-base construct

The final double-sided marker has been pointing both ways for centuries. **S0.80, V8; armour 20%; weak fire; resists poison.** Slow; no natural double.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Both Ways | 15+15=30% phys; t[1.10,2.10] | Two carved hands point opposite ways before each blow; no status. |
| Road's End | 1 × 34% phys; t[1.75] | The top slab tilts, pauses visibly and falls; Weaken -25% direct power for one hero opportunity if HP is damaged. |

**Tests:** confidence during a long pause. **Wren:** Pinning Shot and Mark keep a safe three-slot route. **Tobin:** Sunder→Heavy Strike; Ward covers one mistaken defence. **Pip:** fire weakness remains even on the heavier cousin. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** marker rig, two-arm tell/hit and slab tell/hit, idle, hurt, fallen stone.

### Toll Shadow — normal gloam remnant

The remnant of a toll collector extends a hand for a coin that is no longer there. **S1.00, N4; armour 5%; weak fire; resists none.** Equal, alternating.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Open Palm | 1 × 22% phys; t[0.95] | Open fingers close before the palm pushes; no status. |
| Empty Purse | 1 × 24% poison; t[1.50] | A flattened purse is shaken once, held, then sheds a narrow grey trail; Venom 2% × 2 hero starts if HP hit (28% maximum). |

**Tests:** distinguishing the open-hand quick strike from the purse's delayed release. **Wren:** Echo Shot applies Mark without spending a turn merely identifying the move. **Tobin:** Bash cancels a dangerous next opportunity; Guard reduces the direct part. **Pip:** Fireball is the weakness answer, Ward buffers the rider's carrier hit. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** idle, palm tell/hit, purse tell/hit, hurt, folded cloak and purse.

### Last Tollkeeper — named elite-base gloam remnant

A taller remnant still holds two empty purses, but takes no gold from the player. **S1.00, V7; armour 10%; weak fire; resists none.** Alternating.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Count Twice | 14+14=28% phys; t[0.85,1.70] | Two counting fingers fold one at a time; no status. |
| Unpaid Due | 1 × 30% poison; t[1.65] | Both purses pull taut before one visible stream; Venom 2% × 2 hero starts if HP hit (34% maximum). |

**Tests:** repeating a learnt rhythm while resisting a new cosmetic distraction. **Wren:** Pinning Shot handles the count. **Tobin:** Iron Will can absorb the poison carrier, preventing its rider. **Pip:** Ignite cashes stored Burn before it can repeat the debt. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** toll rig with paired-purse silhouette; idle, each move's tell/hit, hurt, cloak defeat.

### Switchback Crow — normal beast echo

A crow-shaped scrap of an old travelling cloak hops along the abandoned road. **S1.20, N3; armour 0%; weak fire; resists none.** Occasional doubles, about one extra per five hero opportunities.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Beak Stitch | 1 × 21% phys; t[0.70] | The cloth beak points directly at the hero; no status. |
| False Take-off | 11+11=22% phys; t[1.25,1.80] | Wings lift as a non-actionable feint, settle, then two visible pecks; no status. |

**Tests:** ignoring preparation while following the real rings. **Wren:** Attack builds Aim quickly against its low toughness. **Tobin:** every true parry is useful; the fake lift earns no Grit. **Pip:** one Fireball setup, then Attack, avoids over-investing in a short fight. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** folded idle, beak tell/hit, wing feint/peck, hurt, inert cloth.

### Ragwing Crow — named elite-base beast echo

A torn banner gives the same echo a long forked tail. **S1.40, V6; armour 0%; weak fire; resists none.** Frequent doubles, roughly two extra opportunities per five hero opportunities, cap two.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Banner Beak | 1 × 26% phys; t[0.85] | Tail wraps the raised head, then unfurls at impact; no status. |
| Three Stitches | 9+9+10=28% phys; t[1.20,1.75,2.55] | Wings fold between pecks; final peck is delayed, not quicker; no status. |

**Tests:** handling consecutive moves without counting all their hits as one counter sequence. **Wren:** Pinned slows and widens one full move. **Tobin:** Bulwark capitalises on three separate refunds, but dodge remains safe. **Pip:** Frost Shard restrains its Speed while Burn pays on foe starts. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** crow skeleton with forked banner tail; idle, two tell/hit pairs, hurt, fallen banner.

### Elder: the Road That Walks

A bent former guide is held upright by all the boundary stones it once set. When released, the stones fall into a road edge around an old walking stick. **S0.90, E12; armour 20%; weak fire; resists poison.** Usually alternating with periodic hero doubles; up to three foe opportunities only if the hero becomes substantially slower.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| A. Measure | 1 × 30% phys; t[1.25] | Stick held crosswise, stone shoulder turns; no status. |
| B. Down the Steps | 10+10+12=32% phys; t[0.90,1.60,2.55] | Three separate leaning stones light at their edges in order; no status. |
| C. Close the Pass | Charge 0 hits; release 3 × 16%=48% phys, t[1.05,1.90,2.85] | The guide braces under three lifted slabs. Show “Break the hold: control or 6% HP”; release follows the common hero-response rule. No status. |

**Tests:** saving a useful attack/control action for the charge rather than assuming slow means harmless. **Wren:** Mark→Sonic Arrow supplies control; a trained Deadeye can meet the HP threshold. **Tobin:** Bash supplies control or Sunder→Heavy Strike supplies damage. **Pip:** Perfect Frost Shard contributes Freeze, or Fireball/Ignite supplies actual damage. Every hero may instead defend all three release hits, with one miss costing 16%. **Rewards:** Gold and zone-grade Essence; existing eligible relics and occasional boss uniques only through approved tables. **Art, 7:** idle, stick tell, stick hit, slab charge, slab release, hurt, stones/stick defeat; the step combo reuses the stick hit with three timed stone props.

**Gauntlet:** Lurcher → Milestone Bearer → Toll Shadow → Switchback Crow. Later circuits replace exactly one with its named variant; elder circuits append the Road That Walks as the fifth encounter. The order moves from two-hit reading to a slow hold, then a status carrier, then a feint. No reward until each actual individual defeat; abandonment cannot replay already paid entries.

## 2. The Stillwood

The forest never rustles. Dead vines and arrested animal outlines move only when the dark pulls them. Holy weakness is the area identity; physical resistance belongs to two spectral bodies, not every foe.

### Stillwalker — normal gloam remnant

A woodcutter-shaped hollow in the dead trees changes pose in deliberate, visible stops. **S1.00, N4; armour 0%; weak holy; resists phys.** Alternating.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Held Hand | 1 × 25% phys; t[1.40] | Hand lifts, freezes, then shoulder drops to announce the real strike; no status. |
| Two Places | 12+12=24% phys; t[0.95,1.90] | Two sharply different arm silhouettes; no invisibility or position change; no status. |

**Tests:** fixed delays, not watching/not-watching detection. **Wren:** Mark and Bleed help her physical kit; neutral toughness remains N4; measure her resisted kit separately. **Tobin:** Bash→Exposed payoff is useful even though Sunder does not remove resistance. **Pip:** Lantern Flare hits holy weakness. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** idle, held-hand tell/hit, doubled-arm tell/hit, hurt, ordinary tree shadow.

### Rootbound Stillwalker — named elite-base gloam remnant

The woodcutter's outline is laced into a wide dead root fan. **S0.90, V7; armour 5%; weak holy; resists phys.** Slow, no natural double.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Root Hand | 1 × 31% phys; t[1.60] | Root fan folds like fingers, then the wrist drops; no status. |
| Held in Three | 9+9+12=30% phys; t[1.10,1.65,2.70] | Three roots rise separately; long hold before the broad last root; no status. |

**Tests:** resisting an early press on the third impact. **Wren:** marked Moonlit Volley supplies Bleed. **Tobin:** control and Riposte still work through reduced direct physical output. **Pip:** holy Flare plus a fire Burn avoids physical resistance. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** Stillwalker rig widened by a root fan; idle, two tell/hit pairs, hurt, released dead roots.

### Stillchimera — normal beast echo

One dim outline remembers three animals imperfectly; only one head moves at a time. **S1.20, N4; armour 5%; weak holy; resists none.** Occasional doubles.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Wrong Jaw | 1 × 24% phys; t[0.90] | The active head alone lowers and opens; no status. |
| Three Memories | 8+8+9=25% phys; t[0.95,1.60,2.40] | Left, centre, right head each raises before its bite; no status. |

**Tests:** tracking hit identity without multiple targetable enemies. **Wren:** Pinning Shot covers the whole three-hit move. **Tobin:** Bulwark benefits from parries, or Ward covers a single missed bite. **Pip:** Flare exploits holy weakness; Frost Shard limits extra opportunities. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** joined-body idle, single-jaw tell/hit, three-head tell/hit, hurt, fading outline over undisturbed ground; no three separate actors.

### Crowned Stillchimera — named elite-base beast echo

Dead antlers join its three heads into one unmistakable forked silhouette. **S1.25, V7; armour 10%; weak holy; resists none.** Occasional doubles, cap two.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Antler Hook | 1 × 30% phys; t[1.10] | Central antler tips down before a hooking lift; no status. |
| Remember Again | 8+8+8+8=32% phys; t[0.90,1.50,2.30,2.95] | Three heads, then the centre again; four ordinals are visible from commitment; no status. |

**Tests:** knowing there are four beats, not assuming one per head. **Wren:** Pinned and Shadow Step provide flexible defence. **Tobin:** four successful parries refill CDs/Grit but are not necessary to survive. **Pip:** burn plus holy direct damage answers its longer body. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** same joined-body rig with antler crown, two attack pairs, idle, hurt, faded echo.

### Hollow Trunk — normal deadwood construct

An empty dead trunk rocks on the roots that once held it. **S0.75, N5; armour 20%; weak holy; resists poison.** Slow, no natural double.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Whole Weight | 1 × 33% phys; t[1.70] | The hollow opening tilts toward the hero, visibly stops, then falls; no status. |
| Bark Knocks | 13+13=26% phys; t[1.00,2.10] | Two bark slabs spring open one after the other; no status. |

**Tests:** holding a defence through a heavy wind-up. **Wren:** Mark increases all damage before her payoff. **Tobin:** Sunder directly answers its armour. **Pip:** holy Flare or neutral fire works; no need to invent holy Attack. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** rooted idle, tilt tell/hit, bark tell/hit, hurt, fallen hollow timber.

### Split Trunk — named elite-base deadwood construct

Two halves of one tree remain joined by pale dead roots. **S0.80, V8; armour 20%; weak holy; resists poison.** Slow.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Closing Cleft | 16+16=32% phys; t[1.20,2.20] | Left half then right half falls; both targets are the same hero, no lane selection. |
| Root Knots | 10+10+10=30% phys; t[0.95,1.55,2.35] | Three raised knots shake in order; last HP hit inflicts Weaken 25% for one hero opportunity. |

**Tests:** changing from equal beats to a slower last beat. **Wren:** Pinned is valuable even without the holy weakness. **Tobin:** Sunder/Bash keep the armoured fight manageable. **Pip:** Flare rewards the correct type without bypassing the timing test. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** split-tree idle, closing tell/hit, knot tell/hit, hurt, separated inert timber.

### Vine Mourner — normal gloam remnant

A bundle of dead stillvine holds the shape of someone who once tied it up. **S1.00, N4; armour 0%; weak holy; resists none.** Alternating.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Loose End | 1 × 22% phys; t[0.90] | One loose vine rises high enough to see against the trunk; no status. |
| Dry Dust | 1 × 21% poison; t[1.35] | The bundle shakes and opens a narrow gap; Venom 2% × 2 hero starts on HP hit (25% maximum). |

**Tests:** recognising the status-carrying move before its release. **Wren:** safe damage while Pinning Shot widens a dangerous move. **Tobin:** Iron Will can absorb the carrier and prevent Venom. **Pip:** Flare supplies holy weakness; finishing with Ignite avoids a second application. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** hanging idle, loose-end tell/hit, dust tell/hit, hurt, ordinary dead vine bundle.

### Knotted Mourner — named elite-base gloam remnant

An old carrying frame is tightly wrapped in the same vine. **S1.00, V7; armour 10%; weak holy; resists none.** Alternating.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Pull the Knot | 1 × 30% phys; t[1.55] | Both arms draw one clearly visible knot tight; no status. |
| Unwinding | 14+14=28% poison; t[1.00,2.00] | Two strands uncoil separately; final HP hit applies Venom 2% × 2 hero starts (32% maximum). |

**Tests:** prioritising defence on the final carrier without making it compulsory to parry. **Wren:** Shadow Step protects a chosen dodge, not an automatic answer. **Tobin:** Guard softens direct loss, Ward stops the rider if sufficient. **Pip:** Ward or holy damage suits the two-action loop. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** frame-and-vine silhouette, idle, knot tell/hit, uncoil tell/hit, hurt, empty frame.

### Elder: the Last Woodcutter

The largest Stillwalker still holds its axe against an untouched grey tree. Releasing it leaves the axe resting where it should have fallen. **S1.00, E13; armour 10%; weak holy; resists phys.** Alternating at equal Speed; capped three under slow effects.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| A. First Cut | 1 × 30% phys; t[1.45] | Axe reaches the shoulder, held still, then wrist turns; no status. |
| B. Count the Rings | 10+10+12=32% phys; t[0.95,1.65,2.65] | Three trunk rings show one after another; last HP hit gives Weaken 25% for one hero opportunity. |
| C. Fell the Silence | Charge 0; release 18+18+18=54% phys; t[1.15,2.10,3.05] | Axe held over a bent dead trunk; control or actual 6% elder HP damage during the charge interrupts after the guaranteed hero response. No status. |

**Tests:** using a setup to create actual interruption damage instead of banking on permanent CC. **Wren:** Mark→Sonic Arrow works when the shared lock allows; otherwise marked damage. **Tobin:** Bash contribution interrupts, Sunder cannot remove phys resistance so use Exposed/Riposte honestly. **Pip:** Flare exploits holy, Frost Shard's Freeze contribution interrupts. **Rewards:** Gold and zone-grade Essence; existing eligible relics and occasional boss uniques only through approved tables. **Art, 7:** idle, axe tell/hit, overhead charge/release, hurt, axe/tree defeat; ring combo reuses axe hit with exact rings. **Gauntlet:** Stillwalker → Stillchimera → Vine Mourner → Hollow Trunk; replace one slot by its matching named variant on later circuits, append the elder only on elder circuits. This teaches delay, three beats, status carrier and heavy hold before combining them.

## 3. The Blind Mere

The black water reflects no sky. Every encounter rises at the reachable bank; it cannot force melee heroes to attack a distant platform. Holy weakness joins the pool; the Merewight alone carries its established frost resistance.

### Merewight — normal spirit

A drowned outline rises without a ripple but always lifts a visible hand before striking. **S1.00, N4; armour 0%; weak holy; resists frost.** Alternating.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Still Palm | 1 × 24% frost; t[1.10] | Raised open hand turns palm-out; no status. |
| Water Left Behind | 12+12=24% frost; t[0.95,1.95] | Its two sleeves empty separately; final HP hit applies Chill 10% for two hero opportunities. |

**Tests:** seeing the sleeve cue without depending on water ripples. **Wren:** neutral physical damage and Pinned are strong here. **Tobin:** Bash contributes control without using frost damage. **Pip:** Fireball or holy Flare avoids frost resistance; Frost Shard may still control but is not the damage answer. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** bank idle, palm tell/hit, sleeve tell/release, hurt, empty water-stained cloak.

### Deep Merewight — named elite-base spirit

Its long waterlogged sleeves contain the shape of two missing hands. **S1.20, V7; armour 0%; weak holy; resists frost.** Occasional doubles.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Empty Hands | 14+14=28% frost; t[0.90,1.75] | Each sleeve points before its contact; no status. |
| Soundless Fall | 1 × 31% frost; t[1.60] | Both sleeves rise, remain open, then fold down; Chill 10% for two hero opportunities on HP hit. |

**Tests:** the one slow impact after an established two-hit move. **Wren:** Mark→Deadeye avoids its resistance. **Tobin:** Guard softens the heavy release, Bash prevents a future action. **Pip:** Lantern Flare is the type payoff, Ward buffers a missed hit. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** long-sleeve Merewight rig, two tell/contact pairs, idle, hurt, cloak settling on bank.

### Mere Manticore — normal beast echo

A low body and one raised thorn tail are reflected in water that otherwise shows nothing. **S1.20, N4; armour 5%; weak holy; resists none.** Occasional doubles.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Shore Claw | 1 × 24% phys; t[0.85] | Paw lifts above the bank line; no status. |
| Thorn Return | 11+11=22% poison; t[1.00,1.90] | Tail bends forward then visibly curls back; final HP hit adds Venom2% × 2 hero starts (26% maximum). |

**Tests:** distinguishing the tail's return from its initial flick. **Wren:** Pinned makes either defence easier; do not expect one dodge to cover both hits. **Tobin:** Ward can prevent the final status carrier. **Pip:** Flare and Fireball avoid an overlong Venom exchange. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** low idle, claw tell/contact, bent-tail tell/return, hurt, empty beast outline.

### Blackwater Manticore — named elite-base beast echo

A longer tail ends in three blunt thorns whose shadows arrive together. **S1.25, V7; armour 10%; weak holy; resists none.** Occasional doubles, no triples.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Bank Rake | 14+14=28% phys; t[0.95,1.70] | Two shoulders roll distinctly; no status. |
| Three Thorns | 9+9+10=28% poison; t[1.05,1.65,2.55] | Tail points, curls, then pauses before the final flick; final HP hit adds Venom2% × 2 hero starts (32% maximum). |

**Tests:** budgeting risk on a three-hit status move; two dodges and one parry still earn one refund. **Wren:** Pinned and Shadow Step are useful without forcing a class-specific answer. **Tobin:** Bulwark can build Grit from the early safer beats. **Pip:** Ward and holy Flare offer mitigation and damage. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** manticore rig with longer tail, idle, two attack pairs, hurt, faded echo.

### Reed Drag — normal dead-plant remnant

A bundle of dead reeds is pulled along by the darkness threaded between them. **S0.80, N5; armour 10%; weak holy; resists poison.** Slow, no natural doubles.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Draw the Bank | 1 × 31% phys; t[1.55] | Reeds bow toward the hero, straighten, then fall; no repositioning or status. |
| Dry Rattle | 13+13=26% phys; t[0.95,1.85] | Two reed fans open in sequence; no status. |

**Tests:** a named “drag” is a timed hit, not a demand for movement controls. **Wren:** Mark supplies efficient damage. **Tobin:** Sunder cuts physical armour. **Pip:** holy Flare answers the family; ordinary fire is neutral, not a surprise immunity. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** reed idle, bow tell/fall, fan tell/contact, hurt, loose dead reeds.

### Rooted Drag — named elite-base dead-plant remnant

A dead submerged root anchors a wider fan of reeds at the shore. **S0.80, V8; armour 20%; weak holy; resists poison.** Slow.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Root Lever | 1 × 34% phys; t[1.75] | Root rises with the whole bank-facing fan; no status. |
| Bank to Bank | 15+15=30% phys; t[1.10,2.20] | Left then right half folds; both contacts stay within the single stage; no status. |

**Tests:** defending a second slow hit without assuming the move ended. **Wren:** Mark→Deadeye, with Pinned for the longer pattern. **Tobin:** Sunder is the armour answer. **Pip:** Flare bypasses armour; Burn persists between slow opportunities but does not tick in wall time. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** anchored reed rig, idle, two tell/contact pairs, hurt, inert root and reeds.

### Reed Fisher — normal gloam remnant

A lost fisher's outline winds a line that has had no hook for generations. **S1.00, N4; armour 0%; weak holy; resists none.** Alternating.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Empty Cast | 1 × 23% phys; t[1.05] | The pole bends and stops; release follows the visible wrist turn; no status. |
| Reel Twice | 11+12=23% frost; t[0.95,1.85] | Two wide spool turns each pull a drop of black water; final HP hit gives Chill 10% for two hero opportunities. |

**Tests:** the hands rather than an almost invisible line show the timing. **Wren:** neutral attacks and Pinned are sufficient. **Tobin:** Bash stops a pending move without requiring line cutting. **Pip:** Flare punishes holy weakness; Frost Shard is neutral on this foe. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** pole idle, cast hold/release, reel tell/contact, hurt, pole/net on the bank.

### Last Fisher — named elite-base gloam remnant

An old net wraps the fisher's body, its weights plainly visible. **S1.00, V7; armour 5%; weak holy; resists none.** Alternating.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Lead Cast | 1 × 31% phys; t[1.45] | One heavy weight swings outward, is held, then released; no status. |
| Empty Catch | 10+10+10=30% frost; t[0.90,1.65,2.50] | Three net weights rise in order; final HP hit gives Chill 10% for two hero opportunities. |

**Tests:** a gradual rhythm instead of a visually misleading net swarm. **Wren:** Pinned covers all three weights. **Tobin:** parry refunds are per weight, a mixed sequence does not grant a counter. **Pip:** holy damage or Ward is reliable; no cleanse is required. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** fisher rig with net silhouette, idle, two tell/contact pairs, hurt, empty net.

### Elder: the Mere's Witness

A larger Merewight carries the outline of someone who waited on this bank for another to return. **S1.20, E12; armour 5%; weak holy; resists frost.** Occasional doubles; three only when actual Speed ratios and the boss cap permit.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| A. Raised Hand | 1 × 29% frost; t[1.30] | One arm is held straight above the waterline, then bends; no status. |
| B. No Reply | 10+10+12=32% frost; t[0.90,1.55,2.50] | Three successive open palms, last held longer; final HP hit gives Chill 10% for two hero opportunities. |
| C. Close the Water | Charge 0; release 16+16+18=50% frost; t[1.10,1.95,2.90] | Two sleeves form an open circle; a visible core contracts. Control or 6% actual boss HP damage interrupts under the shared charge/recovery rule. No status. |

**Tests:** keeping the guaranteed response opportunity distinct from the eventual three-hit defence. **Wren:** Mark/Sonic Arrow control or trained Deadeye damage. **Tobin:** Bash while unlocked, otherwise physical burst. **Pip:** holy Flare contributes damage; Freeze contribution can interrupt despite frost resistance, but its damage is reduced. One failed release defence costs at most18%, not the full50%. **Rewards:** Gold and zone-grade Essence; existing eligible relics and occasional boss uniques only through approved tables. **Art, 7:** idle, hand tell/contact, circle charge/release, hurt, water and empty sleeve; combo reuses contact. **Gauntlet:** Reed Fisher → Merewight → Mere Manticore → Reed Drag; later replace one matching entry with its named variant; elder route appends Witness. The sequence teaches hands, cold, carrier-tail and heavy bank rhythm without adding a second body.

## 4. The Long Dusk Fields

The standing crop neither ripened nor rotted. Empty work shapes continue the harvest. Frost weakness/poison resistance distinguishes their dry constructed bodies from the forest's holy-weak shadows.

### Scarecrow — normal construct

The dark fills an empty coat where a farmhand should stand. **S1.00, N4; armour 5%; weak frost; resists poison.** Alternating.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Hooked Sleeve | 1 × 24% phys; t[0.95] | One sleeve lifts until the wooden hook is fully visible; no status. |
| Late Harvest | 12+12=24% phys; t[0.85,1.95] | First arm swings, second hangs motionless before the clear final shoulder twitch; no status. |

**Tests:** slow second beat. **Wren:** Pinning Shot then ordinary damage. **Tobin:** Bash creates a useful opening without needing frost. **Pip:** Frost Shard exploits weakness and approaches Freeze. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** coat idle, hook tell/hit, hanging-arm tell/hit, hurt, empty crossbar and coat.

### Harvest Scarecrow — named elite-base construct

Three old harvesting hooks hang from a broad wooden shoulder bar. **S1.00, V7; armour 10%; weak frost; resists poison.** Alternating.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Crossbar | 1 × 30% phys; t[1.35] | Whole shoulder bar tilts before the sweep; no status. |
| Three Hooks | 10+10+10=30% phys; t[0.90,1.65,2.70] | Hooks lift one at a time; final HP hit adds Bleed2% × 2 hero starts (34% maximum). |

**Tests:** the delayed final hook, with damage split fairly. **Wren:** full-move Pinned helps a longer sequence. **Tobin:** Sunder softens its armour; mixed parries remain useful. **Pip:** Frost Shard supplies both type and control. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** scarecrow rig with broad bar, idle, two attack pairs, hurt, inert coat/tools.

### Furrow Hare — normal beast echo

A paper-thin hare outline repeats the last leap it made through the grey crop. **S1.25, N3; armour 0%; weak frost; resists none.** Occasional doubles.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Last Kick | 1 × 21% phys; t[0.75] | Ears flatten and the nearer hind foot rises; no status. |
| Stop and Spring | 11+11=22% phys; t[1.10,1.85] | A held crouch, then two feet strike visibly; no status. |

**Tests:** small does not mean harmless; no hidden collision hit. **Wren:** Attack/Aim efficiently ends a light foe. **Tobin:** Brace can ease the two timings while Attack builds Grit. **Pip:** Frost Shard is the direct weakness and Speed answer. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** crouch idle, kick tell/hit, spring tell/hit, hurt, fading outline in a furrow.

### Longshadow Hare — named elite-base beast echo

Its ears and rear feet stretch into separate long shadows, still one target. **S1.40, V6; armour 0%; weak frost; resists none.** Frequent doubles, cap two.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Far Kick | 1 × 26% phys; t[0.85] | The same flattened ears cue a longer leg extension; no status. |
| Three Bounds | 9+9+10=28% phys; t[0.95,1.55,2.35] | Three crouch-to-contact beats, last held longer; no status. |

**Tests:** separate move boundaries during Speed doubles. **Wren:** Pinned slows, Shadow Step protects one chosen dodge. **Tobin:** three per-hit refunds can fund Bash, but no infinite skip chain. **Pip:** Frost Shard restrains frequency; fire remains neutral. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** hare rig with stretched silhouette; idle, two attack pairs, hurt, ordinary empty furrow.

### Buried Plough — normal construct

A dead root turns an abandoned plough as though an unseen hand still held it. **S0.75, N5; armour 20%; weak frost; resists poison.** Slow.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Iron Share | 1 × 34% phys; t[1.65] | Blade rises completely clear of the soil before its held fall; no status. |
| Turn the Row | 13+13=26% phys; t[1.00,2.15] | Two handles tilt in sequence; no status or positional push. |

**Tests:** one late press beats premature repeated input. **Wren:** Mark boosts a full damage sequence. **Tobin:** Sunder answers armour. **Pip:** Frost Shard bypasses armour and exploits weakness. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** buried idle, blade tell/hit, handles tell/hit, hurt, inert plough.

### Deep Plough — named elite-base construct

A heavier double-share frame carries compacted soil that never dried properly. **S0.80, V8; armour 20%; weak frost; resists poison.** Slow.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Double Share | 16+16=32% phys; t[1.15,2.20] | Two distinct blades rise and fall, one at a time; no status. |
| Hard Ground | 1 × 34% phys; t[1.80] | Frame lifts on both handles then drops; Weaken 25% for one hero opportunity on HP hit. |

**Tests:** different long holds have explicit contact cues. **Wren:** Pinned and Mark remain viable. **Tobin:** Sunder and Guard serve separate attack/defence roles. **Pip:** Frost Shard or Ward; no mandatory spell slot. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** plough rig with second share, idle, two attack pairs, hurt, grounded frame.

### Seed Sifter — normal gloam remnant

A farmhand's empty smock shakes a sieve full of seeds that will never sprout. **S1.00, N4; armour 0%; weak frost; resists poison.** Alternating.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Sieve Rim | 1 × 22% phys; t[1.00] | Rim turns edge-on before swinging; no status. |
| Dead Seed | 1 × 22% poison; t[1.45] | The sieve stops shaking before one narrow stream; Venom2% × 2 hero starts on HP hit (26% maximum). |

**Tests:** the active hit is the released stream, not the shaking preparation. **Wren:** ordinary direct damage is neutral. **Tobin:** Ward can prevent Venom. **Pip:** Frost Shard exploits weakness; Ward is an optional safer slot. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** sieve idle, rim tell/hit, shake tell/release, hurt, empty smock and sieve.

### Last Sifter — named elite-base gloam remnant

Its apron carries three closed seed pockets, opened deliberately in sequence. **S1.00, V7; armour 5%; weak frost; resists poison.** Alternating.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Empty Measure | 1 × 30% phys; t[1.25] | Sieve rises like a shallow shield, turns, then strikes; no status. |
| Three Pockets | 9+9+10=28% poison; t[1.00,1.70,2.60] | One grey seed stream per opened pocket; final HP hit adds Venom2% × 2 hero starts (32% maximum). |

**Tests:** managing the final rider without requiring flawless defence. **Wren:** Shadow Step can insure the final chosen dodge. **Tobin:** early parries restore Ward/Bash cooldowns. **Pip:** Frost Shard and direct burst avoid repeated applications. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** sifter rig with pocketed apron, idle, two attack pairs, hurt, fallen sieve.

### Elder: the Unfinished Harvest

A vast scarecrow carries a farmhand's bent coat and the last uncut sheaf. The coat empties when the dark leaves. **S1.00, E13; armour 15%; weak frost; resists poison.** Alternating; boss cap three only under altered ratios.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| A. Hook the Row | 1 × 31% phys; t[1.30] | One high hook pauses before the shoulder turns; no status. |
| B. Four Sheaves | 8+8+8+10=34% phys; t[0.90,1.60,2.40,3.00] | Four tied sheaves tilt; fourth is faster than third but has its own full window; final HP hit gives Bleed2% × 2 starts (38% maximum). |
| C. Lay the Field Down | Charge 0; release 18+18+18=54% phys; t[1.10,2.00,2.90] | Sheaf and crossbar lift overhead; control or 6% actual HP damage interrupts, then shared recovery. No status. |

**Tests:** recognising slow-slow-fast without increasing per-hit punishment. **Wren:** Mark→Sonic Arrow or charged damage threshold. **Tobin:** Sunder→Heavy Strike or unlocked Bash. **Pip:** Frost Shard is strong here; Freeze is still stagger on a boss. **Rewards:** Gold and zone-grade Essence; existing eligible relics and occasional boss uniques only through approved tables. **Art, 7:** idle, hook tell/hit, sheaf charge/release, hurt, coat/sheaf defeat; four-hit move shares hook contact and four authored prop states. **Gauntlet:** Furrow Hare → Scarecrow → Seed Sifter → Buried Plough; one variant substitution on later circuits, elder fifth when scheduled. Begin with a light moving silhouette, finish with slow tools; no unseen seeds persist into another fight.

## 5. Coldhearth

This settlement failed long before the hero's time. Its inhabitants are remnants of ordinary tasks, never a fresh faction of evil villagers. Holy weakness is common; only the two thinnest silhouettes resist physical damage.

### Hearthless — normal gloam remnant

A person-shaped absence warms its hands over an empty grate. **S1.00, N4; armour 0%; weak holy; resists phys.** Alternating.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Empty Warmth | 1 × 24% frost; t[1.20] | Hands cup together, then open toward the hero; no status. |
| Leave the Fire | 12+12=24% phys; t[0.90,1.90] | One beckoning hand, then the other; final HP hit gives Weaken 25% for one hero opportunity. |

**Tests:** a beckon is a defence cue, never charm or forced input. **Wren:** Mark and Bleed counter reduced physical output; test the physical kit's action count separately from neutral N4. **Tobin:** Bash→Exposed damage, with no false promise Sunder removes resistance. **Pip:** Lantern Flare exploits holy weakness. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** cupped idle, warmth tell/release, beckon tell/contact, hurt, ordinary empty grate.

### Ashen Hearthless — named elite-base gloam remnant

Old hearth ash settles inside the same empty outline; it carries no fire or living ember. **S1.00, V7; armour 5%; weak holy; resists phys.** Alternating.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Cold Embrace | 1 × 31% frost; t[1.55] | Both arms open fully before meeting; no status. |
| Three Invitations | 9+9+12=30% phys; t[1.00,1.70,2.75] | Three separate palm turns, the last held; final HP hit gives Weaken 25% for one hero opportunity. |

**Tests:** a final held cue after two familiar beckons. **Wren:** Pinned plus marked damage remains a viable physical route. **Tobin:** Guard or Ward softens mistakes; control respects the lock. **Pip:** Flare and neutral fire avoid physical resistance. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** wider ash-filled hearthless silhouette, idle, two attack pairs, hurt, settled cold ash.

### Door Knocker — normal construct

An iron hand on a fallen door continues knocking into the empty street. **S1.25, N3; armour 10%; weak holy; resists poison.** Occasional doubles.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| One Knock | 1 × 22% phys; t[0.80] | Iron hand lifts from its plate before contact; no status. |
| Anyone Home | 11+12=23% phys; t[0.90,1.70] | Two full lifts; second follows a visible hold; no status. |

**Tests:** quick but substantial anticipation on a small silhouette. **Wren:** short fight suits Attack/Aim. **Tobin:** Sunder is optional at this modest armour, not a compulsory setup tax. **Pip:** holy Flare bypasses physical armour. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** door idle, one-knock tell/hit, two-knock tell/hit, hurt, ordinary door and fitting.

### Iron Knocker — named elite-base construct

A large ring knocker drags a heavier piece of door behind it. **S1.40, V6; armour 15%; weak holy; resists poison.** Frequent doubles, cap two.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Ring Strike | 1 × 27% phys; t[0.95] | Ring rises until its full circle is visible; no status. |
| Knock Again | 9+9+10=28% phys; t[0.95,1.55,2.40] | Three complete ring lifts, delayed last; no status. |

**Tests:** distinct move boundaries during a frequent double. **Wren:** Pinned makes the next whole move easier. **Tobin:** Sunder and per-hit refunds give a useful damage loop. **Pip:** Frost Shard slows the fast construct; holy Flare exploits weakness. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** door rig with large ring, idle, two attack pairs, hurt, ring and boards settling.

### Cold Oven — normal construct

The dark bends an old bread oven forward on broken bricks. **S0.75, N5; armour 20%; weak holy; resists poison.** Slow.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Fallen Door | 1 × 34% phys; t[1.70] | Heavy door hinges completely open before dropping; no status. |
| Ash Draw | 1 × 23% poison; t[1.35] | Oven cavity contracts around a visible grey dust ribbon; Venom2% × 2 starts on HP hit (27% maximum). |

**Tests:** different door and cavity cues, not an unreadable dark blob. **Wren:** Mark improves the heavy target's damage window. **Tobin:** Sunder is the armour answer; Ward prevents the dust rider when it absorbs the hit. **Pip:** holy Flare or neutral fire damage; the oven has no hidden fire immunity. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** brick idle, door tell/fall, cavity tell/dust release, hurt, harmless broken oven.

### Kiln-Cold Oven — named elite-base construct

A communal bread oven's two doors hang from the same wide dark cavity. **S0.80, V8; armour 20%; weak holy; resists poison.** Slow; this is Coldhearth masonry, not an Emberwaste machine.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Both Doors | 16+16=32% phys; t[1.20,2.25] | Each heavy door opens fully before its fall; no status. |
| Last Ash | 1 × 30% poison; t[1.60] | Cavity draws the dust into one small visible knot before release; Venom2% × 2 starts on HP hit (34% maximum). |

**Tests:** a slow second contact and a single status carrier. **Wren:** Pinned or Shadow Step provides insurance. **Tobin:** Sunder; Ward and direct mitigation have separate roles. **Pip:** Flare efficiently crosses armour; no real flame heals this foe. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** widened oven with paired doors, idle, two attack pairs, hurt, ordinary cold masonry.

### Window Watcher — normal gloam remnant

A half-seen resident holds a broken shutter where a window used to be. **S1.00, N4; armour 0%; weak holy; resists none.** Alternating.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Open Shutter | 1 × 23% phys; t[1.00] | Shutter opens to a clearly lit outline, then swings; no status. |
| Last Draught | 12+12=24% frost; t[0.95,1.95] | A sleeve passes through each shutter gap; last HP hit gives Chill 10% for two hero opportunities. |

**Tests:** two gaps belong to one body and two real hits. **Wren:** neutral attacks and Pinned. **Tobin:** Bash interrupts ordinary timing; Brace helps parry without choosing it. **Pip:** Flare or Frost Shard, both useful without needing a cleanse. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** shutter idle, opening tell/hit, draught tell/release, hurt, shutter and empty box.

### Last Window — named elite-base gloam remnant

Two shutters frame an outline that never saw morning. **S1.00, V7; armour 5%; weak holy; resists none.** Alternating.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Shut Out | 15+15=30% phys; t[1.05,2.10] | Left shutter closes, then right; no status. |
| Long Draught | 1 × 30% frost; t[1.70] | Both gaps close to one visible slit before release; Chill 10% for two hero opportunities on HP hit. |

**Tests:** two contacts versus one, announced before input. **Wren:** Shadow Step protects one selected dodge, not the full double. **Tobin:** Iron Will buffers a heavy frost strike. **Pip:** Lantern Flare exploits holy; elemental hits ignore its small physical armour. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** watcher rig with full shutter frame, idle, two attack pairs, hurt, empty window.

### Elder: the Last Host

The Hearthless of the settlement's common room still holds a place for someone at a table that has rotted to stone. It releases an empty chair, not a captive soul item. **S1.00, E14; armour 10%; weak holy; resists phys.** Alternating; three-opportunity boss cap under altered ratios.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| A. Pull Up a Chair | 1 × 31% phys; t[1.40] | Chair turns sideways before the arm draws it forward; no actual forced movement. |
| B. Empty Places | 11+11+12=34% frost; t[0.95,1.70,2.65] | Three open-handed invitations; final HP hit gives Weaken 25% for one hero opportunity. |
| C. Close the Hearth | Charge 0; release 17+17+18=52% frost; t[1.10,2.05,3.00] | Both hands close around a cold grate's dark opening; control or 6% actual HP damage interrupts, then shared recovery. No status. |

**Tests:** meeting an interruption threshold despite physical resistance; no mandatory cleanse or holy-equipped hero. **Wren:** Mark→Sonic Arrow when unlocked, otherwise marked burst. **Tobin:** Bash contribution or Exposed payoff; measure his resisted damage separately from the neutral toughness target. **Pip:** Flare/Freeze contribution; fire is neutral. One missed charge contact costs17–18%, leaving room to recover. **Rewards:** Gold and zone-grade Essence; existing eligible relics and occasional boss uniques only through approved tables. **Art, 7:** idle, chair tell/hit, grate charge/release, hurt, chair and cold hearth; invitation combo reuses hand contact. **Gauntlet:** Door Knocker → Hearthless → Cold Oven → Window Watcher; one variant replacement on later circuits, Host fifth on elder circuits. It alternates short, resistant, heavy and delayed opponents rather than stacking four physical-resist walls.

## 6. The Closed Orchard

Dead fruit hangs like stone. The Seam appears above the road before its final bend: real daylight briefly seen, not a damage buff, tier unlock or Great Lantern. Holy weakness binds the area. The Skyless Drake remains an ordinary echo/hunting-source relative, never a second finale boss.

### Orchard Husk — normal undead remnant

One heavy preserved fruit husk draws up dead roots into the suggestion of limbs. **S0.80, N5; armour 15%; weak holy; resists poison.** Slow. Always targetable, even before its first fall.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Deadfall | 1 × 33% phys; t[1.55] | Stalk straightens and fruit tips visibly before impact; no status. |
| Split Skin | 13+13=26% phys; t[1.00,2.00] | Two dry lobes open separately; no status. |

**Tests:** a heavy held attack without an invulnerable hanging state. **Wren:** Mark and damage are enough; no mandatory fire arrow. **Tobin:** Sunder removes part of its armour. **Pip:** holy Flare or neutral fire. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** rooted idle, fall tell/contact, skin tell/contact, hurt, ordinary dead fruit.

### Ironfruit Husk — named elite-base undead remnant

A larger fruit has a mineral-hard outer rind with broad visible splits. **S0.80, V8; armour 20%; weak holy; resists poison.** Slow; “Ironfruit” names a foe, not a new metal or resource.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Whole Rind | 1 × 34% phys; t[1.80] | Entire husk rises a little and visibly tilts; no status. |
| Three Splits | 10+10+12=32% phys; t[1.00,1.75,2.70] | Three broad cracks open sequentially; final HP hit gives Bleed2% × 2 starts (36% maximum). |

**Tests:** reading the final split while accepting that a partial defence is useful. **Wren:** Pinned eases three hits. **Tobin:** Sunder is efficient against the heavy rind. **Pip:** holy direct damage and Ward both help. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** large husk rig, idle, whole-rind tell/hit, split tell/contact, hurt, empty rind.

### Skyless Drake — normal beast echo

A low drake outline is held under folded wings by a sky it can no longer reach. **S1.20, N4; armour 5%; weak holy; resists none.** Occasional doubles. It remains on the reachable stage, never an aerial immunity check.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Folded Wing | 1 × 24% phys; t[0.95] | One folded wing lifts like a shoulder before the strike; no status. |
| Tail and Jaw | 12+12=24% phys; t[1.00,1.85] | Tail coils visibly, then jaw opens after the first contact; no status. |

**Tests:** changing silhouette tells across two hits. **Wren:** Mark/Pinned suits the two-hit move. **Tobin:** every parry builds Grit, or Guard lets one error remain survivable. **Pip:** Flare takes advantage of holy weakness; Frost Shard slows extra opportunities. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** folded idle, wing tell/contact, coil tell/jaw contact, hurt, fading outline over undisturbed ground.

### Bentwing Drake — named elite-base beast echo

Its longer broken wing forms an arch over the body, with a clearly separated tail. **S1.25, V7; armour 10%; weak holy; resists none.** Occasional doubles, never boss triples.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Wing Weight | 1 × 30% phys; t[1.20] | The bent arch raises then flattens; no status. |
| Tail, Claw, Jaw | 10+10+12=32% phys; t[0.95,1.60,2.50] | Three named limbs telegraph in order; no status. |

**Tests:** three separate active choices, not one long dodge animation. **Wren:** Pinned and Shadow Step allow mixed defence. **Tobin:** Bulwark rewards but does not require an all-parry sequence. **Pip:** Flare/Frost Shard give damage and frequency answers. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** drake rig with bent arch, idle, two move tell/contact pairs, hurt, faded echo; claw contact reuses the wing contact with authored limb layer.

### Pruning Hand — normal construct

An old pair of pruning shears hangs inside a remnant's empty glove. **S1.25, N3; armour 5%; weak holy; resists poison.** Occasional doubles.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| One Cut | 1 × 22% phys; t[0.80] | Shears open fully before a visible thumb twitch; no status. |
| Uneven Pair | 10+11=21% phys; t[0.95,1.90] | Blades reopen between cuts; final HP hit gives Bleed2% × 2 starts (25% maximum). |

**Tests:** second cut's longer interval. **Wren:** light toughness rewards finishing with Attack rather than over-setting up. **Tobin:** Ward prevents the Bleed carrier; Bash buys an opening. **Pip:** holy Flare or neutral Fireball; no need for poison. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** glove idle, cut tell/contact, reopen tell/contact, hurt, harmless shears/glove.

### Orchard Pruner — named elite-base construct

A long-handled pruning tool has drawn an empty gardener's coat around itself. **S1.40, V6; armour 10%; weak holy; resists poison.** Frequent doubles, cap two.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Long Cut | 1 × 27% phys; t[1.05] | Handles spread fully before both draw together; no status. |
| Three Branches | 9+9+10=28% phys; t[0.95,1.60,2.50] | Three complete reopenings; final HP hit adds Bleed2% × 2 starts (32% maximum). |

**Tests:** preserving attention across a frequent second move; no early carried defence input. **Wren:** Pinned slows and widens. **Tobin:** Bash respects the control lock; Ward covers the final carrier. **Pip:** Frost Shard controls frequency, Flare exploits holy. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** long-tool coat silhouette, idle, two attack pairs, hurt, coat and tool on ground.

### Orchard Sleeper — normal gloam remnant

A fruit-picker's empty basket and shawl sit under a dead tree; the shawl rises only to keep repeating one last reach. **S1.00, N4; armour 0%; weak holy; resists none.** Alternating.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Reach Up | 1 × 23% phys; t[1.15] | Arm rises above the basket then bends toward the hero; no status. |
| Bitter Dust | 1 × 22% poison; t[1.50] | Basket tilts after a held rattle; Venom2% × 2 hero starts on HP hit (26% maximum). |

**Tests:** a quiet foe still presents explicit cues; no sleep spell or player-action loss. **Wren:** Mark/direct damage. **Tobin:** Ward for the carrier or Bash for the next opportunity. **Pip:** holy Flare and neutral fire. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** seated idle, reach tell/contact, basket tell/release, hurt, empty basket and shawl.

### Last Picker — named elite-base gloam remnant

Two old baskets weigh down the broad shawl of the last orchard worker. **S1.00, V7; armour 5%; weak holy; resists none.** Alternating.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| Heavy Baskets | 15+15=30% phys; t[1.10,2.10] | Each basket lifts separately and settles after contact; no status. |
| Fruit That Stayed | 1 × 30% poison; t[1.75] | Both baskets tip into one held mass of dry dust; Venom2% × 2 starts on HP hit (34% maximum). |

**Tests:** two physical contacts versus one long status carrier, not surprise extra damage. **Wren:** Shadow Step insures the selected risky dodge. **Tobin:** Iron Will can stop the poison hit from reaching HP. **Pip:** Ward/Flare; no fictional cleanse assumed in her three-slot base kit. **Rewards:** Gold and zone-grade Essence under the reward contract above. **Art, 7:** sleeper rig with two baskets, idle, two attack pairs, hurt, empty baskets.

### Elder: the Last Orchard

One old fruit tree is held in the outline of the keeper who tended it. Its branches carry the entire unfallen harvest; none are living growth. **S0.90, E15; armour 20%; weak holy; resists poison.** Mostly alternating with periodic hero doubles; boss cap three only under large slow differences.

| Move | Hits, damage, timing | Tell and rider |
|---|---|---|
| A. Heavy Branch | 1 × 33% phys; t[1.55] | Broad branch lifts, holds, and releases with a visible downward bend; no status. |
| B. Fruit by Fruit | 8+8+8+10=34% phys; t[1.00,1.75,2.55,3.20] | Four named fruits tilt in order, final gap slightly quicker; no status. |
| C. Nothing Falls | Charge 0; release 14+14+14+14=56% phys; t[1.10,1.95,2.85,3.70] | Four heavy clusters lift together and remain visible. Control or 6% actual HP damage interrupts; shared recovery replaces any simultaneous stagger skip. No status. |

**Tests:** longest regional elder sequence without requiring four perfect parries; one failed charge contact costs14%. **Wren:** marked Sonic Arrow or Deadeye damage. **Tobin:** Bash while unlocked; Sunder→Heavy Strike for damage. **Pip:** holy Flare and Freeze contribution, or actual Burn/Ignite damage during charge. **Rewards:** Gold and zone-grade Essence; existing eligible relics and occasional boss uniques only through approved tables. **Art, 7:** tree-person idle, branch tell/contact, lifted-fruit charge/release, hurt, ordinary dead tree with fallen fruit; both fruit patterns use distinct visible prop order. **Gauntlet:** Pruning Hand → Orchard Husk → Orchard Sleeper → Skyless Drake; one matching variant substitution in later circuits, Last Orchard fifth on elder circuits. After the elder, the Seam is a safe story/save beat before the Voice, not a sixth surprise fight.

## 7. The Heart of the Gloamvale — the Voice

**One region boss and the Season 1 finale, not two encounters.** The closed sky presses low; the same narrow Seam seen in the orchard remains overhead. The Voice wears things the hero remembers, then lets the disguise go. It is the dark that learned to speak, not a king, a god, a lamp-keeper or the Climber itself.

### What survives the old finale design

Keep the existing final-zone plus four-pinnacle completion unlock as a proposal to reconcile with the campaign gate, with no attempt fee. Preserve the five phases expressly required by `lore.md` §8.7: Court, Song, Hoard, Stair, Last Dark. **Five is the deliberate lore exception to a typical two/three-phase region boss.** Preserve the four borrowed appearances and retreat outcome. The player controls one of Wren, Tobin or Pip; no companion, formation slot or taunter is required.

Retire the old 150-second wall-clock limit/enrage, Lamp meter and Lantern-touch minigame, Front/Middle/Back targeting, adds, forced swaps, party resurrection, charms, healing denial and per-second drains. They depend on the superseded party/realtime design and would make the active-only input contract unfair. Their memory survives in the four move families below. No off-screen contact, terrain hazard, attack that can only be dodged, separate interrupt button or compulsory holy spell replaces them.

**Toughness:** proposed 24–28 neutral, uncritical ordinary Attack actions for the whole HP bar at expected finale training; roughly 5 actions' worth of HP per phase. Ability combos and counters shorten this. No five separate full-health bosses, phase healing or reset of hero cooldowns/resources. **Armour 10%; weak holy; no resistances.** All five damage types stay usable. The Voice does not copy a borrowed shape's type immunities, HP or elder modifiers. Its five phase appearances keep a consistent target centre and reach for melee.

| Phase | HP band and appearance | Relative Speed and expected consecutive actions | First visible beat |
|---|---|---|---|
| 1. The Court | 100–80%; empty coat, crown and a hanging curtain | S1.00, alternates at reference Speed | Crown tilts; its empty sleeve issues the first Decree. |
| 2. The Song | 80–60%; borrowed lure hovering at the bank-height target anchor | S1.20, occasional doubles, around one extra per five hero opportunities | The lure opens like an empty mouth; no charm or forced attack. |
| 3. The Hoard | 60–40%; borrowed Wyrm contour with the stolen light inside | S1.00, alternates | Its chest lights from within, recalling the held fire. |
| 4. The Stair | 40–20%; the long-armed silhouette once used by the Climber | S1.40, frequent doubles; it is a recalled shape, not the Climber moved here | Fingers open high against the sky; no stair geometry appears. |
| 5. The Last Dark | Below20%; tall dark outline, hollow face, many hands | S1.60, roughly eight opportunities per five hero opportunities; naturally mostly singles/doubles, can reach cap three against a slowed hero | The borrowed rim collapses inward, leaving only the hero's lamp and the small Seam. |

HP thresholds queue a **non-damaging presentation change at move end**. C19 gauges, cooldowns, statuses, control lock and charge damage ledger persist. Speed changes affect future fill only. A big hit may cross several thresholds; preserve all actual HP damage, show a concise transition to the resulting phase and do not manufacture invulnerable intermediate health bars. If that hit occurred during a charge, complete its interrupt/phase bookkeeping once; never replace a pending response with an immediate release. A charge that survives a phase change retains the **announced old-phase** hit count, damage and timings. New-phase values begin with the next selected move. No transition steals the guaranteed hero response.

### Four move families, fully authored for each phase

The teaching script is **A → B → C → D charge → D release → repeat** in phases 1–4, with the shared recovery replacing an interrupted D release. Phase changes do not reset the script cursor or cause an immediate action. Phase 5 begins at the next script slot, then cycles the same four families. The phase 5 family tells deliberately recall Court → Song → Fire → Hands. No random attacks or hidden enrage are needed for this proposal. The last phase adds longer sequences, not shorter reaction windows.

**A. Decree — one committed heavy blow.** The crown/sleeve, lure's stem, Wyrm's forelimb or one long hand lifts vertically before the attack. Phase 5 briefly forms the crown shape above that hand. The initial raised shape is preparation; its final downward bend is the real contact cue. No status rider in any phase.

| Phase | Hits and total | Type | Impact times |
|---|---|---|---|
| Court | 1 × 32%=32% | phys | t[1.35] |
| Song | 1 × 30%=30% | frost | t[1.45] |
| Hoard | 1 × 34%=34% | fire | t[1.40] |
| Stair | 1 × 32%=32% | phys | t[1.50] |
| Last Dark | 1 × 35%=35% | phys | t[1.50] |

**B. Borrowed Song — a deliberate chain of reaching shapes.** Open sleeves, lure lobes, Wyrm ribs and long fingers each show the coming contact, one after another. The Song never charms the hero: the given light cannot be called away. Phase 5 uses the lure outline in the raised hand. Status belongs only to the final HP-damaging contact, once per move; earlier hits carry none.

| Phase | Per-hit and whole-move damage | Type | Impact times and rhythm | Final rider, additional maximum |
|---|---|---|---|---|
| Court | 12+12+12=36% | phys | t[1.00,1.80,2.80], slow–slow–held | Weaken 25% next one hero opportunity; no added damage. |
| Song | 12+12+12=36% | frost | t[1.05,1.90,2.65], slow–slow–quicker | Chill 10%, two hero opportunities; no added damage. |
| Hoard | 10+10+10+10=40% | fire | t[1.00,1.80,2.70,3.35], held third then quicker fourth | Burn2% × 2 subsequent hero starts;44% maximum including ticks. |
| Stair | 10+10+10+10=40% | phys | t[0.95,1.65,2.55,3.30], quick–held–regular | Weaken 25% next one hero opportunity; no added damage. |
| Last Dark | 8+8+8+8+8=40% | frost | t[1.00,1.70,2.60,3.35,4.20], familiar held third | Chill 10%, two hero opportunities; no added damage. |

**C. Held Light — a false lift followed by separately released impacts.** The shape gathers the thin rim of stolen light into an obvious held bundle, relaxes once as a non-actionable feint, then opens at each contact. Phase 5 shows the Wyrm's chest contour. The attack never removes the hero's lamp, equipment, Aim, Grit, Embers or ability input. Every impact is separately avoidable. No status rider; the feint does not secretly damage or drain anything.

| Phase | Per-hit and total damage | Type | Impact times |
|---|---|---|---|
| Court | 18+18=36% | phys | t[1.55,2.45] |
| Song | 12+12+12=36% | frost | t[1.55,2.35,3.30] |
| Hoard | 15+15+15=45% | fire | t[1.55,2.35,3.30] |
| Stair | 11+11+11+11=44% | phys | t[1.55,2.30,3.20,3.90] |
| Last Dark | 10+10+10+10+10=50% | fire | t[1.55,2.30,3.20,3.90,4.80] |

**D. Snuff — the interruptible charge.** Both arms close around a borrowed bright core, held still while the hero gets a real action. A persistent non-colour-only label shows **“Snuff charging — interrupt: control or 6% HP”**, hit count, remaining actual HP-damage threshold, and the upcoming release in the timeline. At release, long hands unfold one at a time; phase 5 is the remembered Climber reach, never the Climber as an additional enemy.

Charge start deals **0 damage and 0 hits**. An accepted non-locked Stun/Freeze contribution or cumulative actual HP damage of **6% Voice max HP** after charge commitment cancels it. The default 6% is 1.44–1.68 neutral uncritical Attack actions at this HP target: a calibrated damage ability can reach it, a plain Attack alone normally cannot. Actual DoT ticks can contribute, never predicted future ticks. Release remains valid if neither answer succeeded, with both active defences legal on every hit. Interruption leads to the shared recovery opportunity, not an extra recovery plus a full stagger skip. At least one ordinary move occurs before another charge; charge damage cannot leak across attempts. Do not require unlocked Hallowed/subclass skills or a particular weapon type to interrupt.

| Phase | Per-hit and total direct damage if entirely undefended | Type | Release impact times |
|---|---|---|---|
| Court | 20+20+20=60% | phys | t[1.10,2.00,2.95] |
| Song | 15+15+15+15=60% | frost | t[1.10,1.95,2.90,3.70] |
| Hoard | 18+18+18+18=72% | fire | t[1.10,1.95,2.90,3.70] |
| Stair | 16+16+16+16+16=80% | phys | t[1.10,1.95,2.90,3.70,4.60] |
| Last Dark | 16+16+16+16+16+16+16=112% | phys | t[1.10,1.95,2.90,3.70,4.60,5.45,6.35] |

The final fully ignored release can be lethal, but **one missed contact is 16% and two are 32%**, not 112%. Mixed parry/dodge can survive without earning a counter. At full health, avoiding just one of seven prevents the raw 112% total from landing in full; this is not a demand for seven perfects. Prior HP loss matters, and Guard/Ward/Weaken give additional room. No Burn, anti-heal, missing-input penalty or phase damage is added to Snuff. Seven parries refund seven from every active cooldown, build Grit per hit, and grant exactly one guaranteed-critical counter after the seventh; do not nerf the reward covertly. Step 3 must test whether the post-counter burst shortens Last Dark appropriately rather than making this long move an infinite loop.

### What the encounter tests and how the three heroes answer

- **Wren:** distinguish the held Decree, Song rhythm and feinted Held Light. Pinned eases a full dangerous move; Shadow Step guarantees only a dodge she actually selects. During Snuff, prior Mark→Sonic Arrow can supply control, while a properly trained marked Deadeye or other burst can meet the actual damage threshold. A three-slot setup without Sonic Arrow must still be able to defend the release. Physical damage is neutral apart from modest armour; a holy weapon is not required.
- **Tobin:** decide when to take safe per-hit parries and when to dodge. Brace/Bulwark reward the former but never turn the latter off. Bash contributes stagger and interrupts when not locked; Sunder→Heavy Strike/Hammerfall can meet a damage threshold when control is unavailable. Last Stand follows C19: two foe opportunities, one use, no automatic retaliation; it is neither a required skill nor a way to make a paused charge expire into a free heal.
- **Pip:** choose between a present Burn payoff and keeping ticks for later. Holy Flare has the explicit type advantage; Frost Shard contributes control, including a Perfect Freeze attempt, without implying that raw frost damage is special in Song. Fireball→Ignite can supply actual charge damage; future hypothetical Burn ticks cannot. Ward protects a missed contact. Her fire is usable even while the Voice wears the Wyrm; no shape-only fire immunity forces a mid-fight loadout swap.

The primary lesson is **read the currently announced move, then use the response opportunity deliberately**. There is no forced answer by hero, status immunity that invalidates a whole kit, or extra opponent to kill. Loadout changes remain between fights. The four-pinnacle gate, full-HP entry policy and recovery at the Seam must be confirmed with the shared campaign/sustain design; do not assume invented consumables to make a 28-action fight possible.

### Art pack and narrative resolution

Budget **seven logical pose keys per borrowed/own appearance**, not seven total bitmap images for five visibly different bodies: idle, raised tell, contact, charge hold, release, hurt, relinquish. Four established pinnacle skeleton concepts plus one final silhouette give **35 silhouette-specific keys before animation in-betweens**, requiring explicit art planning; this is the justified finale exception to ordinary5–7-pose pack size. B and C reuse the raised/contact/release families with matching artist-made hands/ribs/lure/held-light props. Every hit still has a distinct visible contact. Phase 5's crown/lure/Wyrm/hand cues need matching prop states in its complete pack, not code-drawn stopgaps. No assets are generated or old assets rewired by this document. A colour swap alone cannot substitute for five recognisable borrowed forms.

On zero HP, finish the current actual hit, cancel remaining queued contacts and reward the encounter **once**. The borrowed body unthreads; the dark sinks into the ground at the valley's heart. It is driven back, not destroyed. Preserve the exact existing line: **“Every flame goes out. I can wait.”** The closed sky thins to ordinary night. Held lights rise and go home; this release remains true despite the retreat. Only after combat, the warm beat returns to Hollow's Rest: lamps brighten, Patience rings, the existing characters' concluding beats land, and Hesketh says **“Every road needs a place to come back to.”** Do not force absent companions into the combat stage to deliver those lines.

The Voice's retreat goes into the Deepwell **for the first time in the story**, beneath the safe camp. A future rematch opens beyond the existing Deepwell content under its own design; this document does not relocate Maud, the spring or the Climber. No raid or online data is touched. No second Region 5 boss is placed after the Voice, and the Seam does not become a Great Lantern.

**Rewards:** Gold and Everlasting Essence. Preserve existing relic eligibility and approved occasional boss-unique rewards; no new guaranteed relic or random relic roll is introduced. No material, Sigil or material-cache reward. Existing story unlocks and first-clear flags remain distinct from repeat combat payment. Reloading the warm beat or reopening a rematch cannot pay the first completion twice. Exact first-win and repeat quantities stay coordinator-owned.

## 8. Regional acceptance cases and tuning gates

1. **Coverage and identities:** six area pools each contain four normals, four named variants and one elder; all cards have two normal/variant moves or three elder moves. Voice has four families and five lore phases. No live fauna/green regrowth, separate Gloam Shroud, local recruit, imported Climber or unreachable aerial/water target appears. Verify every reward table gives only gold, zone-grade Essence, already-eligible relics and approved occasional boss uniques. No material/Sigil drop or new universal relic roll is allowed. Scenery and resource gathering remain distinct; existing story unlocks and first-clear flags persist exactly once.
2. **Fixed-number calibration:** convert each displayed damage percentage to a fixed zone coefficient, then double player max HP and verify the enemy's actual damage number does not double. Measure neutral uncritical Attack-action toughness and separate Wren/Tobin/Pip active fights at entry/mid/end gear. Apply armour/resistance once; physical-resist Stillwalkers/Hearthless cannot quietly become10-action normals. Measure the proposed 24–28-action whole Voice bar independently from five phase counters.
3. **Skill bands:** replay explicit beginner/intermediate/expert player choices and timing traces, not an automated live chooser. Include0/50/80/95% successful per-hit defence traces, mixtures of parry and dodge, a single missed late carrier and one failed charge. Report remaining HP, fight actions, damage distribution, status ticks and cooldown refunds. A normal's three-hit 25% move must not become75%; a passed dodge prevents that hit's status with no counter/refund. No all-perfect gate is accepted.
4. **Timeline/control:** at S0.75/1/1.25/1.40 and Voice1.60, inspect actual six-opportunity previews and consecutive caps. Two ordinary moves produce independent full-parry counters. A 7-hit Voice move never gives seven counterattacks. Apply Chill/Pinning at partial gauge and verify only future fill changes. No wall-clock pause ages a status or fills a gauge.
5. **Charge:** for each elder and each Voice phase, test a ready boss immediately after commitment, direct damage just below/at/above6%, non-locked accepted control, locked rejected control, DoT during charge, full 100 stagger simultaneous with interrupt, and phase transition across the response. Require a real hero opportunity before release, one recovery/skip total, no fake tick, no double reward. Actual damage threshold and announced release values survive a phase transition. Interrupted/cancelled hit sequences cannot grant all-parry counters.
6. **Statuses:** one designated HP-damaging contact applies a rider once. Ward absorption, parry/dodge and defeat suppress it. Hero starts tick the specified two-turn DoT, never seconds. No hidden Venom ramp, anti-heal, hero Freeze, resource theft or random Blind lockout. Test strongest-refresh and combined tick cap across two statuses. Hero Weaken expires after its specified one opportunity, including a selected buff action.
7. **Gauntlets/absence:** stop between every pair of members, continue deliberately, pause mid-pattern, close the page and resume/reload. There is no unattended next enemy, offline hit, kill, Essence or queue advancement. Every new foe resets ability/resources/statuses without an invented full heal; a previously paid victory is never replayed. Shared sustain review must confirm that a four-member normal queue and five-member elder queue work with the available healing model.
8. **Voice outcome:** a high-damage multi-hit crosses two phase thresholds, overkills the final HP, or kills with a DoT during a charged opportunity. Preserve actual damage, cancel remaining contacts, award once and show the retreat once. The Voice remains a future threat; no text claims the dark is permanently destroyed. No content gives Season 2 answers beyond the established retreat.
9. **Readable art:** review silhouettes and all actual contacts at the landscape target size and reduced motion; label hit count before a move begins. Feints may challenge anticipation, never conceal the actionable cue. Review the finale's35-key minimum honestly before promising a seven-frame asset pack. No artwork or engine implementation is approved merely because this specification is complete.

All exact timings, relative HP targets, damage budgets and new hero-target status translations require owner/Claude approval and step 3 playtesting. Repository build/check validation cannot validate encounters that do not yet exist in runtime.
