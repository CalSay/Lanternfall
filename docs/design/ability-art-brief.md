# Ability art brief: Wren, Tobin and Pip

Status: design and production brief for owner and Claude review, 1 October 2026. It accompanies [Hero ability trees](hero-abilities.md); it does not authorise integration or replace that document's gameplay tables. The owner has set six shared and eight signature abilities per hero (42 base abilities), and a 2.5× base critical hit. This brief covers their art, including the eight possible Hallowed looks per hero. A hero can select only one Hallowed signature at a time; these looks are variants, not 24 more abilities. Subclass abilities from C21 will need their own art budget.

## What an ability pack contains

Each of the 23 active pose families below needs a readable wind-up, release or held action, and recovery. That is a **minimum planning envelope of 23 × 3 = 69 keyed moments before validated reuse**, not a claim that 69 new PNGs are needed or that any new art is ready. Six of the 42 abilities are always-on passives and need no activation pose: A6 Twin Shot, M4 Momentum, C5 Afterglow, W7 Night Hunter, T7 Bulwark and P7 Ember Heart. Each takes a loadout slot, has no button, and never chooses a combat action. Reuse a current key only when its anatomy, prop grip, contact direction and timing visibly fit the action. In particular, Wren's existing full draw is already a held draw; her hurt kneel cannot be used as a combat shot. Tobin's overhead wind-up exists but an overhead impact does not. His block is not a shield-bash impact. The shield throw also needs departure, travel and catch or a clearly single-action return.

Draw on the established transparent 224 × 192 canvas, facing right, with feet at (96, 132), the current hero scale, a strict pixel grid, compact colour ramps and a one-pixel dark outline. Preserve the approved face, silhouette and signature clothing. For each keyed moment, supply a clean body base, front-hand grip layer, outfit composite and compatible removable gear layers. Equipment follows [Equipment art](equipment-art.md): weapon, offhand, head and body use named anchors, angle and front/behind order per pose. The approved starting outfit may show its complete pose, but equipped gear must still line up. Include a keyed rig record for the weapon grip, offhand grip, head, back/quiver, projectile origin, hit/contact and effect origin; flag hidden slots. Author each required weapon angle rather than rotating an existing sprite in code. Keep the shield and lantern on a single offhand, with no duplicate prop or third hand.

**Author the effects and moving props in the art pack.** Deliver matched bowstrings, arrows and arrowheads, shield flight, sparks, flame, frost, sound rings, bat silhouettes, status marks, ward shapes, impact arcs and other listed effects as transparent pixel assets with attachment and timing metadata. Code may place, tint within approved ramps and animate these assets; it must not invent or draw the pixels. This follows the newer owner art rule in CLAUDE.md, which supersedes the older procedural-effect wording in art-pipeline.md. Each asset needs a restrained peak frame for reduced motion. At small combat scale, distinguish effects by shape and timing as well as colour.

## Name and activity cross-check

This is the art inventory's name key for all 42 base abilities. A passive is equipped in one of the three ability slots but has no combat button, action pose or timed prompt.

| Hero | Six shared abilities | Eight signature abilities |
|---|---|---|
| Wren | A1 Power Shot; A2 Barbed Arrow; A3 Pinning Shot; A4 Hunter's Mark; A5 Volley; A6 Twin Shot (passive) | W1 Echo Shot; W2 Bat Swarm; W3 Deadeye; W4 Sonic Arrow; W5 Shadow Step; W6 Moonlit Volley; W7 Night Hunter (passive); W8 Final Echo |
| Tobin | M1 Heavy Strike; M2 Cleave; M3 Sunder; M4 Momentum (passive); M5 Brace; M6 Lunge | T1 Shield Bash; T2 Riposte; T3 Iron Will; T4 Taunting Roar; T5 Hammerfall; T6 Shield Throw; T7 Bulwark (passive); T8 Last Stand |
| Pip | C1 Spark; C2 Frost Shard; C3 Arcane Ward; C4 Hex; C5 Afterglow (passive); C6 Nova | P1 Fireball; P2 Kindle; P3 Ignite; P4 Searing Eye; P5 Wildfire; P6 Lantern Flare; P7 Ember Heart (passive); P8 Lanternburst |
## Pose-family inventory

| Hero | Family and ability IDs | Existing key or art to make |
|---|---|---|
| Wren | Draw and release: A1, A2, W1, W4 | Reuse current full draw and release after gear/anchor validation. Add distinct arrowheads and sound effects. Twin Shot (A6) reuses Attack's action; its paired arrows need distinct hit timing, not a new pose. |
| Wren | Long held draw: W3, W8 | Reuse the existing full-draw body key; author longer anticipation and a decisive release/effect. Do not count this as a new held-draw pose. |
| Wren | Sky draw: A5, W6 | New upward aim, bow/string geometry and falling-arrow paths. |
| Wren | Combat kneel-shot: A3 | New supported aiming kneel and release. The existing kneeling pose belongs to hurt/death. |
| Wren | Marking point: A4 | New deliberate target gesture with bow safely carried and a separate mark effect. |
| Wren | Whistle: W2 | New free-hand whistle action; use authored bat swarm rather than duplicating her single companion. |
| Wren | Backstep: W5 | New weight shift and recovery; retain bow/quiver. The cast prepares her next player-chosen Dodge on one hit within two foe opportunities; do not show an automatic dodge of a whole attack. |
| Tobin | Overhead: M1, M3, T5 | Reuse one-handed overhead wind-up, add overhead contact/recovery. Heavy Strike keeps the shield in hand; no two-handed sword grip. |
| Tobin | Wide swing: M2 | New level arc with a readable blade path and shield clearance. |
| Tobin | Shout: T4 | New command/brace key for Taunting Roar. Momentum (M4) is passive and adds no shout or activation effect. |
| Tobin | Block: M5 | Reuse braced block where it reads as a shield guard. Bulwark (T7) modifies normal parries as a passive; it adds no stance. |
| Tobin | Lunge: M6, T2 | New forward step, blade contact and retreat. |
| Tobin | Shield bash: T1 | New forward shield contact. Existing block is not a bash. |
| Tobin | Plant: T3 | New rooted Iron Will stance, shield and sword both held. |
| Tobin | Throw: T6 | New single-shield release and catch keys, a separately authored shield flight, and a defined return before guard resumes. |
| Tobin | Shield raise: T8 | New high shield protection pose, held for Last Stand without hiding his face or sword. |
| Pip | Small cast: C1, C2, P2 | Reuse wind-up and cast if grip and effect origins work; fire, frost and Kindle effects remain distinct. |
| Pip | Big cast: P1, P5 | Reuse Fireball's broad cast where feasible; author separate fireball and Wildfire shapes. |
| Pip | Lantern raise: C3, P6 | New offhand lift and lower. The lantern must be physically present in ready, cast and recovery states and in gear looks. Ember Heart (P7) is passive and adds no raise. |
| Pip | Point: C4 | New Hex targeting gesture with staff and lantern accounted for. |
| Pip | Channel: P4 | New sustained stance for Searing Eye, with staff, lantern, hands and held effect consistent through recovery. Afterglow (C5) is passive and uses the ordinary Attack pose and damage-type assets when it triggers. |
| Pip | Snap: P3 | New close hand release for Ignite, with a distinct Burn-consumption effect. |
| Pip | Burst: C6, P8 | New centred release or validated cast reuse; author Nova's force ring and Lanternburst's ember/lantern burst separately. |

Pip's physical staff **and** lantern are the approved C27 equipment direction. Today's Pip sprite shows the staff but no lantern; adding one only on lantern-raise would make it appear from nowhere. The art pack must establish her offhand lantern across idle, cast, hurt and relevant new poses, with a matching starter outfit and the gear layers. If that full package proves unworkable, a staff-raise with a lantern-shaped magical effect is a **fallback proposal requiring owner review**, not a silent change. Wren's current arrow art also needs to be checked against the approved v4 bow before reuse. Tobin's shield must not remain on his arm while an identical one flies; shield flight and guard timing need one coherent visual contract.

## Timed action keys and contact

Binding §2a names **12 timed abilities**, four per hero. For each, author a stable wind-up/hold key and a release key, with the timing ring aligned to the decisive contact. Shield Throw is the exception: its single ring closes on the catch after release. Supply the ring artwork, reduced-motion still, contact/catch frame and a metadata timestamp or frame marker. Perfect (about 0.12 seconds) may add an accent only when earned; Good (about 0.3 seconds) is the written effect; Miss uses the same action with reduced power, not a false successful hit flourish. Combat is active-only; no automatic Good timing is shown. The ring is checked only on the hero's own turn. For multi-hit shots, give every arrow its own authored travel/contact cue and timing check; do not turn one volley into a single timing press. A branch that splits a cast into hits also needs one prompt per hit.

| Timed ID | Hold, release and contact requirement |
|---|---|
| A1 Power Shot | Maintain a strained full draw; release when the ring closes, with one contact flash. Reserve the sure-crit accent for Perfect. |
| A5 Volley | Hold the upward aim, then release three distinct arrows, each with its own ring-close/contact marker and optional Perfect Aim cue. |
| W3 Deadeye | Hold the existing full-draw pose with a narrow sight line; release and resolve the one hit before showing whether Mark remains on Perfect. |
| W6 Moonlit Volley | Hold sky draw, then release five separately readable descending arrows and five timing/contact markers; Perfect Bleed cues occur only for those arrows earned. |
| M1 Heavy Strike | Hold the one-handed overhead wind-up with shield retained; show overhead impact on the closing ring, not a two-handed grip. |
| T1 Shield Bash | Hold shield forward, then key one forward shield contact. A Perfect extra Guard duration is shown by the status UI, not another bash. |
| T5 Hammerfall | Hold the overhead blade while Grit is visible in the UI; release into the new overhead impact. Perfect retains half Grit without inventing another swing. |
| T6 Shield Throw | Show the shield leaving the hand, one authored flight path, and a distinct return/catch key for its **single** ring prompt. There is no release prompt: hold the hit value until the catch grade resolves. Perfect's cooldown reduction is shown in UI. The same shield returns before guard art resumes. |
| C2 Frost Shard | Hold a contained shard at the staff tip; release one projectile/contact at ring close. Perfect's extra Chill uses the existing status icon. |
| P1 Fireball | Hold a growing but bounded fireball, then release one shot at ring close. Scattered Cinders splits that release into three authored hits with one timing prompt each; if any hit is Perfect, extend Burn only once. Ember spending and Burn application remain once per cast. |
| P3 Ignite | Hold a small compression of the target's existing Burn, then snap and resolve one detonation. Perfect changes the stored-Burn coefficient from 1.25 to 2.0 while the direct 0.8 U stays unchanged; show one stronger contained peak, not a second explosion. |
| P8 Lanternburst | Hold the physical offhand lantern and gathering Embers, then key a single centred release at ring close. Perfect's retained Embers remain in the UI; the lantern does not leave her hand. |

The other 24 active abilities still need keyed sequences and contact timing, but **no timed ring** unless a later approved design adds one. The six passives have neither an activation sequence nor a ring. Twin Shot's two Attack arrows need separate travel and contact cues even though its passive does not create a timed-ability check. Multihit attacks from enemies are a separate defence interaction: each enemy hit offers one parry-or-dodge choice, so ability art must not preselect defence or show an unearned counter.
## All 24 signature Hallowed treatments

The following are Hallowed treatments for the eight existing signatures per hero. The 21 active signatures need distinct base and Hallowed effects, plus a consistent white-gold halo mark in their loadout icons. The three passive signatures (W7, T7, P7) gain **numbers only** when Hallowed: no new pose, cast, combat effect or extra trigger. Their Hallowed selection is shown in the loadout UI, where passives have icons but no combat button. Preserve each active ability's silhouette and timing so the stronger look still reads as the same action. Avoid full-screen glow; the added detail must survive the small combat view and reduced-motion still frame.

| ID | Signature | Distinct Hallowed look |
|---|---|---|
| W1 | Echo Shot | A white-gold second sound ring follows the first arrow's existing echo path. |
| W2 | Bat Swarm | Pale-edged bats cross in a wider, layered silhouette; Blind retains its own readable mark. |
| W3 | Deadeye | A narrow moonlit sight line closes on the target before the single arrow lands. |
| W4 | Sonic Arrow | Two separated crescent sound fronts trail one arrow; the control mark remains one event. |
| W5 | Shadow Step | A moon-rimmed backstep prepares the next chosen Dodge; only a successful Dodge on one hit earns the Keen accent. No automatic evasion or whole-combo skip is pictured. |
| W6 | Moonlit Volley | Five falling arrows carry pale tips and a shared moon arc, without implying extra arrows. |
| W7 | Night Hunter (passive) | No Hallowed combat visual or pose. The loadout icon alone shows the shared Hallowed halo; ordinary marked-Attack art stays unchanged. |
| W8 | Final Echo | A deep central impact sends concentric moon-sound rings, keyed to spent Aim and Bleed. |
| T1 | Shield Bash | A bright rim catches on the shield's one contact point and settles into Guard. |
| T2 | Riposte | A narrow gold blade glint follows the parry into one decisive lunge. |
| T3 | Iron Will | Linked shield and boot-edge highlights root Tobin in place around the Ward. |
| T4 | Taunting Roar | A firm forward call arc and shield sigil mark Weaken and Pinned without making him feral. |
| T5 | Hammerfall | A compact falling blade arc and cracked impact mark show the spent Grit. |
| T6 | Shield Throw | One gold-rimmed shield traces the out-and-back path; return and catch remain visible. |
| T7 | Bulwark (passive) | No Hallowed combat visual or stance. The loadout icon alone shows the shared Hallowed halo; ordinary parry art stays unchanged. |
| T8 | Last Stand | A steady white-gold shield edge marks the two-opportunity 1 HP floor. A wider parry cue and one accent on a completed all-parry counter show the reward; no automatic retaliation is pictured. |
| P1 | Fireball | A white-hot core within Pip's orange flame separates the direct hit from its Burn mark. |
| P2 | Kindle | Two clear ember motes spiral toward the same flame, with no implied extra resource grant. |
| P3 | Ignite | The target's existing Burn collapses into one bright contained detonation. |
| P4 | Searing Eye | A thin gold pupil/line holds on the burning target; crits share its small flare. |
| P5 | Wildfire | A forked white-orange flame grows along the existing Burn effect, not an extra patch. |
| P6 | Lantern Flare | The raised lantern casts a pale cone with a distinct Blind glyph and optional Mark glyph. |
| P7 | Ember Heart (passive) | No Hallowed combat visual or lantern raise. The loadout icon alone shows the shared Hallowed halo; ordinary Burn-tick and Ember indicators stay unchanged. |
| P8 | Lanternburst | A lantern-centred ring opens with an ember-count motif, then returns to the held lantern. |

The Hallowed mechanical contract remains narrow: an active signature uses at most **+40% of its own audited numerical power** and a cooldown of **ceil(base cooldown × 0.8)**. A Hallowed passive strengthens existing numbers only and has no cooldown to shorten. Apply the power increase once to the selected base contribution; do not re-amplify stored Burn, Bleed or Curse damage, a derived detonation, a guaranteed crit, or a retaliation already scaled by another effect. Existing caps still apply. Do not infer another control turn, an extra skipped foe opportunity, additional arrows or targets, a second shield, duplicate Burn, automatic retaliation, or longer Last Stand invulnerability from a brighter visual. For a signature with no independent numerical power (for example Shadow Step or Searing Eye), do not invent a damaging value or lengthen its status to force a 40% gain; the bounded rider proposed below needs balance approval. Hallowed does not raise the owner's 2.5× base critical multiplier by itself. The power-locus table below specifies each mixed move; no row multiplies every component.

## Whole-pack handoff and review

Submit for each hero: a contact sheet covering every active pose family used by that hero, keyed transparent body and front-hand sprites, the original outfit composite, removable gear/look layers, palette and rig/anchor data; effects and timing strips for its 12 active abilities; seven active-signature Hallowed effect variants, one passive-signature loadout halo, and the shared halo treatment; reduced-motion peak frames; and a small-size preview with all gear/offhand combinations used by the pack. Include a passive icon and status/resource indicator review, but no passive activation art. List reused keys and missing keys explicitly. The bow, sword, staff, shield and physical lantern must keep their identity and grip through attack, guard, hurt, recovery and equipment looks. The owner vets the **complete matched pack** before normal art integration; no partial pose or effect set should be presented as production-ready.

## Exact proposed Hallowed power loci

This table completes the balance proposal; it is not permission to infer extra effects from brighter art. For scalable rows, apply the factor once to the named contribution only. Other parts of the same ability remain unchanged. For non-scaling active buffs, the listed modest rider replaces a percentage increase. Passive rows only adjust an existing numeric hook; their exact rounding needs C21 balance sign-off. All proposed values require C21 balance sign-off. With Focus, use `max(2, ceil(baseCD * 0.8 * (1 - min(Focus,30)/100)))`; do not round two reductions separately. Last Stand remains once per fight.

| ID | Proposed gameplay change |
|---|---|
| W1 |Primary and echo direct coefficients ×1.4; Mark unchanged.|
| W2 |Swarm damage snapshot ×1.4; Blind unchanged. If Dark Wings replaces the damage, gain Ward 5% on cast instead.|
| W3 |Direct coefficient ×1.4; crit multiplier and Mark consumption unchanged.|
| W4 |Direct coefficient ×1.4; control strength/duration unchanged.|
| W5 |Proposed heal 5% max HP after its empowered, player-chosen Dodge succeeds, once per fight. No automatic dodge, extra defence choice or longer duration; C21 sign-off required.|
| W6 |Each direct arrow coefficient ×1.4; still five arrows and max five Bleed.|
| W7 |Passive numbers only: strengthen its existing +1 Aim gain on eligible marked Attacks within the 40% cap; proposed fractional carry: add 1.4 to a fight-local accumulator per qualifying event, award its integer part under the resource cap, retain the fraction; clear on foe reset or unequip; tuning needs approval. No cast, Ward or new trigger.|
| W8 |Final direct coefficient after resource calculation ×1.4; no extra resource gains or retained stacks.|
| T1 |Direct coefficient ×1.4; Guard and control unchanged.|
| T2 |Direct coefficient ×1.4; crit multiplier unchanged.|
| T3 |Ward amount ×1.4; Grit grant unchanged, Ward cap applies.|
| T4 |Ward 5% on cast; Weaken and Pinned unchanged.|
| T5 |Direct coefficient after Grit calculation ×1.4; no extra Grit multiplier.|
| T6 |Direct coefficient ×1.4; control and return riders unchanged.|
| T7 |Passive numbers only: increase only the existing +25% parry-counter bonus by 40%, giving ×1.35 total; no cast, heal, Guard or extra parry reward.|
| T8 |Strengthen only its own completed all-parry counter coefficient from ×2 to at most ×2.8. The parry window cap, 1 HP floor, two-opportunity duration, once-per-fight limit and ending heal remain unchanged; no automatic retaliation.|
| P1 |Direct coefficient ×1.4; Burn snapshot and Ember multiplier unchanged.|
| P2 |Direct coefficient ×1.4; Ember gain and Burn extension unchanged.|
| P3 |Only direct0.8 U component ×1.4; consumed Burn portion unchanged.|
| P4 |Ward 5% after first eligible direct crit, once per fight; no additional empowered actions or crit multiplier.|
| P5 |Wildfire's per-tick growth contribution ×1.4; existing Burn and maximum tick ceiling unchanged.|
| P6 |Direct holy coefficient ×1.4; Blind/Mark unchanged.|
| P7 |Passive numbers only: strengthen its existing +1 Ember per qualifying Burn tick within the 40% cap; proposed fractional carry: add 1.4 to a fight-local accumulator per qualifying event, award its integer part under the resource cap, retain the fraction; clear on foe reset or unequip; tuning needs approval. No cast, Ward or reactive Burn.|
| P8 |Final direct coefficient after Ember/Burn condition ×1.4; no second generic Ember or stored Burn multiplier.|
