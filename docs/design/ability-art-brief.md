# Ability art brief: Wren, Tobin and Pip

Status: design and production brief for owner and Claude review, 1 October 2026. It accompanies [Hero ability trees](hero-abilities.md); it does not authorise integration or replace that document's gameplay tables. The owner has set six shared and eight signature abilities per hero (42 base abilities), and a 2.5× base critical hit. This brief covers their art, including the eight possible Hallowed looks per hero. A hero can select only one Hallowed signature at a time; these looks are variants, not 24 more abilities. Subclass abilities from C21 will need their own art budget.

## What an ability pack contains

Each of the 24 pose families below needs a readable wind-up, release or held action, and recovery. That is a **minimum planning envelope of 24 × 3 = 72 keyed moments before validated reuse**, not a claim that 72 new PNGs are needed or that any new art is ready. Reuse a current key only when its anatomy, prop grip, contact direction and timing visibly fit the action. In particular, Wren's existing full draw is already a held draw; her hurt kneel cannot be used as a combat shot. Tobin's overhead wind-up exists but an overhead impact does not. His block is not a shield-bash impact. The shield throw also needs departure, travel and catch or a clearly single-action return.

Draw on the established transparent 224 × 192 canvas, facing right, with feet at (96, 132), the current hero scale, a strict pixel grid, compact colour ramps and a one-pixel dark outline. Preserve the approved face, silhouette and signature clothing. For each keyed moment, supply a clean body base, front-hand grip layer, outfit composite and compatible removable gear layers. Equipment follows [Equipment art](equipment-art.md): weapon, offhand, head and body use named anchors, angle and front/behind order per pose. The approved starting outfit may show its complete pose, but equipped gear must still line up. Include a keyed rig record for the weapon grip, offhand grip, head, back/quiver, projectile origin, hit/contact and effect origin; flag hidden slots. Author each required weapon angle rather than rotating an existing sprite in code. Keep the shield and lantern on a single offhand, with no duplicate prop or third hand.

**Author the effects and moving props in the art pack.** Deliver matched bowstrings, arrows and arrowheads, shield flight, sparks, flame, frost, sound rings, bat silhouettes, status marks, ward shapes, impact arcs and other listed effects as transparent pixel assets with attachment and timing metadata. Code may place, tint within approved ramps and animate these assets; it must not invent or draw the pixels. This follows the newer owner art rule in CLAUDE.md, which supersedes the older procedural-effect wording in art-pipeline.md. Each asset needs a restrained peak frame for reduced motion. At small combat scale, distinguish effects by shape and timing as well as colour.

## Pose-family inventory

| Hero | Family and ability IDs | Existing key or art to make |
|---|---|---|
| Wren | Draw and release: A1, A2, A6, W1, W4 | Reuse current full draw and release after gear/anchor validation. Add distinct arrowheads and sound effects. |
| Wren | Long held draw: W3, W8 | Reuse the existing full-draw body key; author longer anticipation and a decisive release/effect. Do not count this as a new held-draw pose. |
| Wren | Sky draw: A5, W6 | New upward aim, bow/string geometry and falling-arrow paths. |
| Wren | Combat kneel-shot: A3 | New supported aiming kneel and release. The existing kneeling pose belongs to hurt/death. |
| Wren | Marking point: A4 | New deliberate target gesture with bow safely carried and a separate mark effect. |
| Wren | Whistle: W2 | New free-hand whistle action; use authored bat swarm rather than duplicating her single companion. |
| Wren | Backstep: W5 | New weight shift and recovery; retain bow/quiver and a readable evasive afterimage. |
| Wren | Hood stance: W7 | New hood/shoulder set; keep the face readable and the bow available for the next Attack. |
| Tobin | Overhead: M1, M3, T5 | Reuse one-handed overhead wind-up, add overhead contact/recovery. Heavy Strike keeps the shield in hand; no two-handed sword grip. |
| Tobin | Wide swing: M2 | New level arc with a readable blade path and shield clearance. |
| Tobin | Shout: M4, T4 | New command/brace key. Battle Cry and Taunting Roar share the body action but have distinct call and status effects. |
| Tobin | Block: M5, T7 | Reuse braced block where it reads as a shield guard; add the held Bulwark stance if needed. |
| Tobin | Lunge: M6, T2 | New forward step, blade contact and retreat. |
| Tobin | Shield bash: T1 | New forward shield contact. Existing block is not a bash. |
| Tobin | Plant: T3 | New rooted Iron Will stance, shield and sword both held. |
| Tobin | Throw: T6 | New single-shield release and catch keys, a separately authored shield flight, and a defined return before guard resumes. |
| Tobin | Shield raise: T8 | New high shield protection pose, held for Last Stand without hiding his face or sword. |
| Pip | Small cast: C1, C2, P2 | Reuse wind-up and cast if grip and effect origins work; fire, frost and Kindle effects remain distinct. |
| Pip | Big cast: P1, P5 | Reuse Fireball's broad cast where feasible; author separate fireball and Wildfire shapes. |
| Pip | Lantern raise: C3, P6, P7 | New offhand lift and lower. The lantern must be physically present in ready, cast and recovery states and in gear looks. |
| Pip | Point: C4 | New Hex targeting gesture with staff and lantern accounted for. |
| Pip | Channel: C5, P4 | New sustained stance with staff, lantern, hands and held effect consistent through recovery. |
| Pip | Snap: P3 | New close hand release for Ignite, with a distinct Burn-consumption effect. |
| Pip | Burst: C6, P8 | New centred release or validated cast reuse; author Nova's force ring and Lanternburst's ember/lantern burst separately. |

Pip's physical staff **and** lantern are the approved C27 equipment direction. Today's Pip sprite shows the staff but no lantern; adding one only on lantern-raise would make it appear from nowhere. The art pack must establish her offhand lantern across idle, cast, hurt and relevant new poses, with a matching starter outfit and the gear layers. If that full package proves unworkable, a staff-raise with a lantern-shaped magical effect is a **fallback proposal requiring owner review**, not a silent change. Wren's current arrow art also needs to be checked against the approved v4 bow before reuse. Tobin's shield must not remain on his arm while an identical one flies; shield flight and guard timing need one coherent visual contract.

## All 24 signature Hallowed looks

The following are alternative **visuals** for the eight existing signatures per hero. Draw a base and Hallowed effect set for each, plus a consistent white-gold halo mark on its button. Preserve the base ability's silhouette and timing so the stronger look still reads as the same action. Avoid full-screen glow; the added detail must survive the small combat view and reduced-motion still frame.

| ID | Signature | Distinct Hallowed look |
|---|---|---|
| W1 | Echo Shot | A white-gold second sound ring follows the first arrow's existing echo path. |
| W2 | Bat Swarm | Pale-edged bats cross in a wider, layered silhouette; Blind retains its own readable mark. |
| W3 | Deadeye | A narrow moonlit sight line closes on the target before the single arrow lands. |
| W4 | Sonic Arrow | Two separated crescent sound fronts trail one arrow; the control mark remains one event. |
| W5 | Shadow Step | A moon-rimmed afterimage marks the same dodge path, then fades into Keen. |
| W6 | Moonlit Volley | Five falling arrows carry pale tips and a shared moon arc, without implying extra arrows. |
| W7 | Night Hunter | A restrained white-gold edge traces hood and bow; subsequent Attack marks share the motif. |
| W8 | Final Echo | A deep central impact sends concentric moon-sound rings, keyed to spent Aim and Bleed. |
| T1 | Shield Bash | A bright rim catches on the shield's one contact point and settles into Guard. |
| T2 | Riposte | A narrow gold blade glint follows the parry into one decisive lunge. |
| T3 | Iron Will | Linked shield and boot-edge highlights root Tobin in place around the Ward. |
| T4 | Taunting Roar | A firm forward call arc and shield sigil mark Weaken and Pinned without making him feral. |
| T5 | Hammerfall | A compact falling blade arc and cracked impact mark show the spent Grit. |
| T6 | Shield Throw | One gold-rimmed shield traces the out-and-back path; return and catch remain visible. |
| T7 | Bulwark | A layered shield-face pattern brightens on successful parries, without extra counter silhouettes. |
| T8 | Last Stand | A steady white-gold shield edge and grounded feet remain through the existing two-turn protection. |
| P1 | Fireball | A white-hot core within Pip's orange flame separates the direct hit from its Burn mark. |
| P2 | Kindle | Two clear ember motes spiral toward the same flame, with no implied extra resource grant. |
| P3 | Ignite | The target's existing Burn collapses into one bright contained detonation. |
| P4 | Searing Eye | A thin gold pupil/line holds on the burning target; crits share its small flare. |
| P5 | Wildfire | A forked white-orange flame grows along the existing Burn effect, not an extra patch. |
| P6 | Lantern Flare | The raised lantern casts a pale cone with a distinct Blind glyph and optional Mark glyph. |
| P7 | Ember Shield | An amber ward shell carries three small ember facets and one reactive ignition spark (not reflected damage). |
| P8 | Lanternburst | A lantern-centred ring opens with an ember-count motif, then returns to the held lantern. |

The Hallowed mechanical contract remains narrow: use at most **+40% of the chosen ability's own audited numerical power** and a cooldown of **ceil(base cooldown × 0.8)**. Apply the power increase once to the selected base contribution; do not re-amplify stored Burn, Bleed or Curse damage, a derived detonation, a guaranteed crit, or a retaliation already scaled by another effect. Existing caps still apply. Do not infer another control turn, an extra skipped foe opportunity, additional arrows or targets, a second shield, duplicate Burn, or longer Last Stand invulnerability from a brighter visual. For a signature with no independent numerical power (for example Shadow Step or Searing Eye), do not invent a damaging value or lengthen its status to force a 40% gain; the bounded rider proposed below needs balance approval. Hallowed does not raise the owner's 2.5× base critical multiplier by itself. The power-locus table below specifies each mixed move; no row multiplies every component.

## Whole-pack handoff and review

Submit for each hero: a contact sheet covering every pose family used by that hero, keyed transparent body and front-hand sprites, the original outfit composite, removable gear/look layers, palette and rig/anchor data; every base ability effect and its timing strip; all eight signature Hallowed effect variants and button halo; reduced-motion peak frames; and a small-size preview with all gear/offhand combinations used by the pack. List reused keys and missing keys explicitly. The bow, sword, staff, shield and physical lantern must keep their identity and grip through attack, guard, hurt, recovery and equipment looks. The owner vets the **complete matched pack** before normal art integration; no partial pose or effect set should be presented as production-ready.

## Exact proposed Hallowed power loci

This table completes the balance proposal; it is not permission to infer extra effects from brighter art. For scalable rows, apply the factor once to the named contribution only. Other parts of the same ability remain unchanged. For non-scaling buffs, the listed modest rider replaces a percentage increase. All require C21 balance sign-off. With Focus, use `max(2, ceil(baseCD * 0.8 * (1 - min(Focus,30)/100)))`; do not round two reductions separately. Last Stand remains once per fight.

| ID | Proposed gameplay change |
|---|---|
| W1 |Primary and echo direct coefficients ×1.4; Mark unchanged.|
| W2 |Swarm damage snapshot ×1.4; Blind unchanged. If Dark Wings replaces the damage, gain Ward 5% on cast instead.|
| W3 |Direct coefficient ×1.4; crit multiplier and Mark consumption unchanged.|
| W4 |Direct coefficient ×1.4; control strength/duration unchanged.|
| W5 |Heal 5% max HP on successful automatic evasion, once per fight; no extra dodge or duration.|
| W6 |Each direct arrow coefficient ×1.4; still five arrows and max five Bleed.|
| W7 |Ward 5% on cast; no extra Aim or enhanced actions.|
| W8 |Final direct coefficient after resource calculation ×1.4; no extra resource gains or retained stacks.|
| T1 |Direct coefficient ×1.4; Guard and control unchanged.|
| T2 |Direct coefficient ×1.4; crit multiplier unchanged.|
| T3 |Ward amount ×1.4; Grit grant unchanged, Ward cap applies.|
| T4 |Ward 5% on cast; Weaken and Pinned unchanged.|
| T5 |Direct coefficient after Grit calculation ×1.4; no extra Grit multiplier.|
| T6 |Direct coefficient ×1.4; control and return riders unchanged.|
| T7 |Heal 5% on first successful parry during Bulwark, once per fight; Guard and counter bonus unchanged.|
| T8 |Each permitted retaliation coefficient ×1.4; floor duration, once-per-fight limit and ending heal unchanged.|
| P1 |Direct coefficient ×1.4; Burn snapshot and Ember multiplier unchanged.|
| P2 |Direct coefficient ×1.4; Ember gain and Burn extension unchanged.|
| P3 |Only direct0.8 U component ×1.4; consumed Burn portion unchanged.|
| P4 |Ward 5% after first eligible direct crit, once per fight; no additional empowered actions or crit multiplier.|
| P5 |Wildfire's per-tick growth contribution ×1.4; existing Burn and maximum tick ceiling unchanged.|
| P6 |Direct holy coefficient ×1.4; Blind/Mark unchanged.|
| P7 |Initial Ward amount ×1.4, capped 30% max HP; reactive Burn unchanged.|
| P8 |Final direct coefficient after Ember/Burn condition ×1.4; no second generic Ember or stored Burn multiplier.|
