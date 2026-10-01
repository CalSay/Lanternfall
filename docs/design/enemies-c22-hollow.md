# C22: the Hollow

> **Superseded selection draft (1 October 2026):** see [the fantasy review](enemies-c22-fantasy-review.md). The owner now requires darkness-born combat enemies, one enemy per fight with no queues, and Hunting kept separate. Elders retain Trophies. Final roster count is pending the owner and Claude. Do not implement this earlier roster or its gauntlet/Hunting combat proposals as written.

Design proposal for owner review, 1 October 2026. Read [the shared encounter contract](enemies-c22-contract.md) for clocks, damage units, charge interruption, variant inheritance, active-only combat and art conventions. This region contains 28 normal foes, 28 tougher variants, seven elders and the Fenmother. No runtime or art changes.

## Audit of the current roster

| Existing foe / elder | Decision and reason |
|---|---|
| Moss Slime / Elder Moss Slime | Keep the moss body; rework pack splitting into a single swelling body and interruptible Engulf. A visible core makes the first duel readable. |
| Cave Bat / Elder Cave Bat | Rework swarm into one oversized fruit bat and its known Bat Queen. Dives become distinct contacts; retire simultaneous colony actors. The Queen returns to an ordinary bat on defeat. |
| Rattlebones / Elder Rattlebones | Keep the old battle dead. Replace repeated revives/party volleys with an audible weapon rhythm; the captain rallies himself rather than spawning bodies on stage. |
| Barrow Beetle / Elder Barrow Beetle | Keep the grave-door carapace; rework unavoidable thorns and burrowing zones into readable mandible and emergence moves. |
| Spore Cap / Elder Spore Cap | Rework passive clouds into visible puffs with real contact windows. No unavoidable room damage; the elder is Morwen’s overgrown garden standing up. |
| Quarry Golem / Elder Quarry Golem | Keep the quarry stones and first-cut heart. Rework party-wide rockfalls into individual falling stones with distinct cues. |
| Marsh Wraith / Elder Marsh Wraith | Keep the drowned-light people. Replace heal loops and party silence with a bounded mend and interruptible light-drain. |
| Fenmother | Keep the first marsh light and voice mystery. Rework summons into echoes within one body’s four move families; no separate actors or party-wide silence. |

No named Hollow identity is retired; simultaneous packs, untimed clouds, party positioning, forced defence types and repeat resurrection are retired mechanics. Enemy rewards follow the owner’s latest gold/Essence/relic/boss-unique rule; material drops are removed. All new beasts are local creatures or remains distorted by the dark, not random foreign species.

## Mossy Hollow

Plant life; poison lean. All four cards use weakness **fire**, resistance **poison** unless stated. Neutral types remain neutral. Each variant inherits its base moves, drops, matchups and pose plan except the stated changes.

### Moss Slime — normal

Pond moss curls around a stolen lamp glow. Speed **0.8×**; target **3 hero actions**; armour **0% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Soft Bump: 1 hit, slow, 20% phys; no status; core leans backward then compresses. Moss Spit: 1 hit, delayed, 20% poison; no tick; mouth-ring swells and flashes before release.
- **Script / lesson:** alternate the two moves, beginning with the first. Wait for compression rather than the first wobble.
- **Hero answers:** At first entry use the available starter signatures: Wren Echo Shot, Tobin Shield Bash and Pip Fireball, with ordinary Attack and either defence. No relic-unlocked skill is required.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, distinct wind-up/contact for each listed move, hurt, restored/defeated. Reuse contacts only for visibly repeated strikes.
- **Variant — Lantern Moss Slime:** 6 actions, Speed 0.9; Moss Spit adds Venom 2% for 2 hero opportunities only if it lands; core glows twice but only the second flash is a hit. This is the area’s tougher cousin, not a second actor; defeat budget6–8 actions.

### Briar Hare — normal

A woodland hare is wrapped in an attacking briar body; the plant weakness belongs to that parasitic body, and defeat frees the ordinary hare. Speed **1.15×**; target **3 hero actions**; armour **0% phys reduction**. Occasional two-foe opportunities; cap 2.

- **Moves:** Thorn Kick: 2 hits, quick-quick, 11%+11% phys (22%); no status; two distinct rear-leg stamps. Briar Bound: 1 hit, delayed, 24% poison; no tick; ears flatten before the leap.
- **Script / lesson:** alternate the two moves, beginning with the first. Count two contacts without panic parrying the return hop.
- **Hero answers:** At first entry, Attack and the starter signatures suffice; defend both kick contacts. Later Wren Pinning Shot, Tobin Brace and Pip Frost Shard widen the options, not the entry requirement.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, distinct wind-up/contact for each listed move, hurt, restored/defeated. Reuse contacts only for visibly repeated strikes.
- **Variant — Crownthorn Hare:** 6 actions, Speed 1.25; Thorn Kick becomes 11%+11%+8% with a clearly lifted final heel, quick-quick-delayed. This is the area’s tougher cousin, not a second actor; defeat budget6–8 actions.

### Rootling — normal

An uprooted sapling drags the dark in its root ball. Speed **0.7×**; target **3 hero actions**; armour **15% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Root Club: 1 hit, slow, 25% phys; no status; root lifts above its crown. Seed Rattle: 2 hits, slow-fast, 10%+12% poison (22%); no tick; two seedpods shake in order.
- **Script / lesson:** alternate the two moves, beginning with the first. Separate the heavy wind-up from the seed rhythm.
- **Hero answers:** At entry Wren Echo Shot and Tobin Shield Bash with Attacks fit the three-hit target despite this light armour; Pip Fireball exploits fire weakness. Later Barbed Arrow and Sunder are optional answers.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, distinct wind-up/contact for each listed move, hurt, restored/defeated. Reuse contacts only for visibly repeated strikes.
- **Variant — Knotted Rootling:** 7 actions, Speed 0.75; armour 20%; Root Club 30%, with a long creaking hold unchanged release cue. This is the area’s tougher cousin, not a second actor; defeat budget6–8 actions.

### Dewcap Newt — normal

A small marsh newt is encased in an animated fungus hood; the fungus is the attacking body, accounting for its plant type. Defeat sheds it without killing the newt. Speed **1.0×**; target **3 hero actions**; armour **0% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Tongue Flick: 1 hit, quick, 20% phys; no status; throat pouch contracts. Dew Puff: 1 hit, delayed, 18% poison plus Venom 2% for 2 hero opportunities (22% full exposure); hood opens before a visible puff.
- **Script / lesson:** alternate the two moves, beginning with the first. Recognise the puff as the status move.
- **Hero answers:** At entry Wren Echo Shot, Tobin Shield Bash’s Guard and Pip Fireball work without shared relic unlocks; the puff can always be dodged or parried. Later Shadow Step is optional.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, distinct wind-up/contact for each listed move, hurt, restored/defeated. Reuse contacts only for visibly repeated strikes.
- **Variant — Glowthroat Newt:** 6 actions, Speed 1.05; Dew Puff 22%+Venom 3% for 2 hero opportunities; the throat glow changes to a double ring, no extra hit. This is the area’s tougher cousin, not a second actor; defeat budget6–8 actions.

## Batwing Caves

Beasts and echoing stone; phys lean. All four cards use weakness **poison**, resistance **none** unless stated. Neutral types remain neutral. Each variant inherits its base moves, drops, matchups and pose plan except the stated changes.

### Cave Bat — normal

A darkened fruit bat aims for the hero’s lamp. Speed **1.2×**; target **3 hero actions**; armour **0% phys reduction**. Occasional two-foe opportunities; cap 2.

- **Moves:** Low Dive: 1 hit, quick, 23% phys; no status; ears fold and wing tip points forward. Hanging Bite: 2 hits, delayed-fast, 11%+13% phys (24%); no status; it hangs for one beat then opens its jaw twice.
- **Script / lesson:** alternate the two moves, beginning with the first. Do not defend on the silent hanging pose.
- **Hero answers:** Wren: Mark then Deadeye catches a light target; Tobin: Bulwark rewards the bite pair; Pip: Frost Shard reduces its tempo.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, distinct wind-up/contact for each listed move, hurt, restored/defeated. Reuse contacts only for visibly repeated strikes.
- **Variant — Bellwing Bat:** 6 actions, Speed 1.3; Hanging Bite 11%+11%+10%, delayed-fast-fast; third contact has a separate wing snap. This is the area’s tougher cousin, not a second actor; defeat budget6–8 actions.

### Cave Cockatrice — normal

A cave bird grows chalk spurs where the dark gathered. Speed **0.85×**; target **4 hero actions**; armour **5% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Spur Peck: 1 hit, slow, 28% phys; no status; neck draws into an S. Chalk Glare: 1 hit, delayed, 23% holy; Weaken 1 hero opportunity on landing; eyes brighten after its head stops moving.
- **Script / lesson:** alternate the two moves, beginning with the first. Read eye brightness, not the head feint.
- **Hero answers:** Wren: Sonic Arrow after Mark/Pinned setup interrupts the setup; Tobin: Brace tolerates a slow peck; Pip: Arcane Ward catches the glare.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, distinct wind-up/contact for each listed move, hurt, restored/defeated. Reuse contacts only for visibly repeated strikes.
- **Variant — Crowned Cockatrice:** 7 actions, Speed 0.9; Spur Peck 33%; Chalk Glare Weaken 2 hero opportunities with same contact cue. This is the area’s tougher cousin, not a second actor; defeat budget6–8 actions.

### Echo Moth — normal

A cave moth repeats the last lamp flicker it saw. Speed **1.05×**; target **3 hero actions**; armour **0% phys reduction**. Occasional two-foe opportunities; cap 2.

- **Moves:** Wing Cut: 2 hits, quick-delayed, 10%+14% phys (24%); no status; one clipped wing beat then a broad return. False Flutter: 1 hit, feint, 25% phys; no status; a small harmless flutter precedes a bright underside flash.
- **Script / lesson:** alternate the two moves, beginning with the first. Ignore the false flutter while watching the contact flash.
- **Hero answers:** Wren: Pinned widens either reaction; Tobin: Riposte needs only one landed parry; Pip: Spark ends the short duel.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, distinct wind-up/contact for each listed move, hurt, restored/defeated. Reuse contacts only for visibly repeated strikes.
- **Variant — Mirrorwing Moth:** 6 actions, Speed 1.15; False Flutter 29%, with two harmless flutter beats but unchanged final underside cue. This is the area’s tougher cousin, not a second actor; defeat budget6–8 actions.

### Blindfang — normal

A pale cave lizard hunts by tapping its teeth on stone. Speed **0.95×**; target **4 hero actions**; armour **0% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Stone Tap: 1 hit, delayed, 24% phys; no status; three audible tooth taps then jaw release. Raking Teeth: 2 hits, slow-fast, 9%+13% phys (22%); final hit Bleed 2% for 2 hero opportunities; jaw remains open for second contact.
- **Script / lesson:** alternate the two moves, beginning with the first. Learn the tap count and the bleeding second bite.
- **Hero answers:** Wren: Bat Swarm reduces pressure; Tobin: Shield Bash interrupts; Pip: Ward absorbs residual damage.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, distinct wind-up/contact for each listed move, hurt, restored/defeated. Reuse contacts only for visibly repeated strikes.
- **Variant — Deepfang:** 7 actions, Speed 1.0; Raking Teeth 11%+15%, Bleed 3% for 2 hero opportunities; teeth brighten before the second bite. This is the area’s tougher cousin, not a second actor; defeat budget6–8 actions.

## The Bonefield

Old battle dead; phys lean. All four cards use weakness **holy**, resistance **poison** unless stated. Neutral types remain neutral. Each variant inherits its base moves, drops, matchups and pose plan except the stated changes.

### Rattlebones — normal

A forgotten soldier stands because its burial lamp went out. Speed **1.0×**; target **4 hero actions**; armour **5% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Rusty Cut: 1 hit, quick, 25% phys; no status; sword catches light at shoulder height. Loose Joint: 2 hits, slow-delayed, 11%+15% phys (26%); no status; elbow drops before the delayed follow-through.
- **Script / lesson:** alternate the two moves, beginning with the first. Wait for the loose arm to complete its fall.
- **Hero answers:** Wren: Bleed bypasses armour; Tobin: Sunder into Heavy Strike; Pip: Lantern Flare supplies holy damage.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, distinct wind-up/contact for each listed move, hurt, restored/defeated. Reuse contacts only for visibly repeated strikes.
- **Variant — Graveguard:** 7 actions, Speed 1.0; armour 15%; Loose Joint 13%+17% with the same audible joint click. This is the area’s tougher cousin, not a second actor; defeat budget6–8 actions.

### Grave Hound — normal

Bones settle into the shape of a dog that never left its owner. Speed **1.2×**; target **3 hero actions**; armour **0% phys reduction**. Occasional two-foe opportunities; cap 2.

- **Moves:** Bone Rush: 2 hits, quick-quick, 12%+12% phys (24%); no status; each paw strike throws a distinct dust puff. Jaw Lock: 1 hit, delayed, 26% phys; no status; jaw opens past its ordinary bite.
- **Script / lesson:** alternate the two moves, beginning with the first. Separate the paws from the jaw.
- **Hero answers:** Wren: Pinning Shot slows the rush; Tobin: Bulwark turns paired hits into Grit; Pip: Frost Shard stalls its pace.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, distinct wind-up/contact for each listed move, hurt, restored/defeated. Reuse contacts only for visibly repeated strikes.
- **Variant — Ossuary Hound:** 6 actions, Speed 1.3; Bone Rush 10%+10%+12%, quick-quick-delayed; last impact comes from its tailbone. This is the area’s tougher cousin, not a second actor; defeat budget6–8 actions.

### Shield Husk — normal

An empty shield harness remembers holding a battle line. Speed **0.7×**; target **5 hero actions**; armour **20% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Rim Blow: 1 hit, slow, 30% phys; no status; shield edge turns toward the lamp. Open Guard: 1 hit, feint, 24% phys; no status; shield lowers, pauses, then thrusts its boss.
- **Script / lesson:** alternate the two moves, beginning with the first. Strike through armour, defend on the actual shield thrust.
- **Hero answers:** Wren: Barbed Arrow supplies armour-independent Bleed; Tobin: Sunder is direct counterplay; Pip: holy Lantern Flare avoids physical armour.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, distinct wind-up/contact for each listed move, hurt, restored/defeated. Reuse contacts only for visibly repeated strikes.
- **Variant — Kingshield Husk:** 8 actions, Speed 0.75; armour 25%; Rim Blow 35%; no damage reflection or physical immunity. This is the area’s tougher cousin, not a second actor; defeat budget6–8 actions.

### Gravebell — normal

A burial bell rocks inside a rib cage. Speed **0.9×**; target **4 hero actions**; armour **5% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Bell Swing: 1 hit, delayed, 24% holy; no status; the clapper becomes visible before the toll. Rib Prick: 2 hits, slow-fast, 9%+13% phys (22%); final hit Bleed 3% for 2 hero opportunities. Two ribs open separately.
- **Script / lesson:** alternate the two moves, beginning with the first. Parry the clapper cue; bleeding belongs to the second rib.
- **Hero answers:** Wren: Sonic Arrow after Mark/Pinned setup interrupts the bell; Tobin: Guard supports a missed rib; Pip: holy damage exploits its family weakness.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, distinct wind-up/contact for each listed move, hurt, restored/defeated. Reuse contacts only for visibly repeated strikes.
- **Variant — Mourning Bell:** 7 actions, Speed 1.0; Bell Swing 30%; Rib Prick 10%+15% with unchanged 2 tickBleed. This is the area’s tougher cousin, not a second actor; defeat budget6–8 actions.

## Beetle Barrows

Buried beasts and grave soil; phys lean. Weakness **poison**, resistance **none** for these darkened local bodies; unlisted types neutral. Variants inherit unspecified fields.

### Barrow Beetle — normal

A beetle’s shell has grown like a buried door. Speed **0.8×**; target **5 hero actions**; armour **20% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Mandible Clamp: 1 hit, slow, 30% phys; no status; jaws spread to their full width before closing. Earth Shove: 2 hits, slow-fast, 12%+14% phys (26%); no status; forelegs scrape separately.
- **Script / lesson:** alternate the two moves, starting with the first. Read shell and mandible motion rather than stage distance.
- **Hero answers:** Wren: Bleed avoids armour; Tobin: Sunder halves it; Pip: Frost Shard buys a safe opening.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, two move wind-ups, two visible contact/release keys, hurt, restored/defeated. Every repeated contact has its own timing cue.
- **Variant — Stonegate Beetle:** 8 actions, Speed 0.85; armour 25%; Mandible Clamp 34%, with a longer audible shell creak. Target 6–8 actions; no additional actor.

### Lantern Mite — normal

A giant grave mite wears bright dust on its feelers. Speed **1.25×**; target **3 hero actions**; armour **0% phys reduction**. Occasional two-foe opportunities; cap 2.

- **Moves:** Feelerslash: 2 hits, quick-quick, 11%+12% phys (23%); no status; feelers glow one after the other. Lamp Lunge: 1 hit, delayed, 25% phys; no status; its glowing abdomen dips before springing.
- **Script / lesson:** alternate the two moves, starting with the first. React to each feeler, not the continuous glow.
- **Hero answers:** Wren: Pinned widens reactions; Tobin: Brace handles its two contacts; Pip: Spark ends a low-toughness fight.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, two move wind-ups, two visible contact/release keys, hurt, restored/defeated. Every repeated contact has its own timing cue.
- **Variant — Emberbelly Mite:** 6 actions, Speed 1.35; Feelerslash 9%+10%+12%, quick-quick-delayed; abdomenflash marks last hit. Target 6–8 actions; no additional actor.

### Cairn Toad — normal

A toad carries pebbles the dark has stacked like a crown. Speed **0.75×**; target **5 hero actions**; armour **15% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Cairn Drop: 1 hit, delayed, 31% phys; no status; throat inflates then stones briefly lift. Mud Tongue: 1 hit, feint, 25% poison; no status; one harmless mouth twitch precedes a full tongue curl.
- **Script / lesson:** alternate the two moves, starting with the first. Wait through the floating-stone hold.
- **Hero answers:** Wren: Mark into Deadeye for a long duel; Tobin: Shield Bash opens Heavy Strike; Pip: Ward protects a missed heavy blow.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, two move wind-ups, two visible contact/release keys, hurt, restored/defeated. Every repeated contact has its own timing cue.
- **Variant — Barrow King Toad:** 8 actions, Speed 0.8; Cairn Drop 35%; Mud Tongue adds Weaken 1 hero opportunity, announced by black mud at the lips. Target 6–8 actions; no additional actor.

### Grave Silkspider — normal

A barrow spider trails burial cloth from its legs. Speed **1.0×**; target **4 hero actions**; armour **0% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Needle Feet: 2 hits, slow-fast, 10%+14% phys (24%); no status; front feet lift in sequence. Black Thread: 1 hit, delayed, 21% poison; Venom 3% for 2 hero opportunities; spinnerets draw a visible thread before release.
- **Script / lesson:** alternate the two moves, starting with the first. Defend the thread to avoid the tick; it never locks a button.
- **Hero answers:** Wren: Shadow Step reserves a safe chosen dodge; Tobin: Riposte follows any parried needle; Pip: Frost Shard interrupts thread setup.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, two move wind-ups, two visible contact/release keys, hurt, restored/defeated. Every repeated contact has its own timing cue.
- **Variant — Shroudweaver:** 7 actions, Speed 1.1; Black Thread 25% plus sameVenom; Needle Feet 12%+16%. Target 6–8 actions; no additional actor.

## Fungal Deep

Living fungus; poison lean. Weakness **fire**, resistance **poison** for these darkened local bodies; unlisted types neutral. Variants inherit unspecified fields.

### Spore Cap — normal

Morwen’s lost garden pushes a cap through the dark. Speed **0.85×**; target **4 hero actions**; armour **0% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Cap Knock: 1 hit, slow, 26% phys; no status; cap tips sideways before the stem snaps straight. Spore Puff: 1 hit, delayed, 22% poison; Venom 3% for 2 hero opportunities; pores light from bottom to top.
- **Script / lesson:** alternate the two moves, starting with the first. Use the last lit pore as the release tell.
- **Hero answers:** Wren: Sonic Arrow after Mark/Pinned setup breaks a setup; Tobin: Brace absorbs a missed puff; Pip: Fireball attacks its weakness.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, two move wind-ups, two visible contact/release keys, hurt, restored/defeated. Every repeated contact has its own timing cue.
- **Variant — Crowned Spore Cap:** 7 actions, Speed 0.9; Spore Puff becomes two 14% poison puffs, slow-delayed; only second appliesVenom. Target 6–8 actions; no additional actor.

### Moss Pixie — normal

A woodland insect wears a person-shaped film of moss. Speed **1.2×**; target **3 hero actions**; armour **0% phys reduction**. Occasional two-foe opportunities; cap 2.

- **Moves:** Needle Dance: 2 hits, quick-delayed, 11%+13% phys (24%); no status; wandlike thorn pauses on the return. Pollen Wink: 1 hit, feint, 23% poison; no status; falsewingflash then a visible pollen bead.
- **Script / lesson:** alternate the two moves, starting with the first. Watch the thorn tip rather than its glittering wings.
- **Hero answers:** Wren: Mark supports fast precision; Tobin: any parry opens Riposte; Pip: Spark exploits fire weakness.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, two move wind-ups, two visible contact/release keys, hurt, restored/defeated. Every repeated contact has its own timing cue.
- **Variant — Briar Pixie:** 6 actions, Speed 1.3; Needle Dance 10%+10%+12%, quick-delayed-fast; third thorn is visibly raised. Target 6–8 actions; no additional actor.

### Rotback Tortoise — normal

A tortoise is carried inside an attacking garden of shelf fungus; the fungal body supplies the plant type and falls away on defeat. Speed **0.65×**; target **5 hero actions**; armour **20% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Shelf Slam: 1 hit, slow, 32% phys; no status; shelf cap hinges upward. Root Breath: 2 hits, slow-slow, 13%+13% poison (26%); no status; two nostrils flash in turn.
- **Script / lesson:** alternate the two moves, starting with the first. A long hold does not imply two hits.
- **Hero answers:** Wren: Barbed Arrow ignores physical armour; Tobin: Sunder opens the shell; Pip: Wildfire rewards this long fire-weak fight.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, two move wind-ups, two visible contact/release keys, hurt, restored/defeated. Every repeated contact has its own timing cue.
- **Variant — Gardenback Tortoise:** 8 actions, Speed 0.7; armour 25%; Shelf Slam 35%; breath 15%+15% with unchangedrhythm. Target 6–8 actions; no additional actor.

### Lantern Morel — normal

A hollow fungus mimics the holes of a lamp housing. Speed **1.0×**; target **4 hero actions**; armour **0% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Spore Spark: 1 hit, quick, 23% poison; no status; one hole lights before the seed flies. Smother Puff: 1 hit, delayed, 20% poison; Weaken 1 hero opportunity; all holes dim except one pointed at the hero.
- **Script / lesson:** alternate the two moves, starting with the first. Identify the single remaining lit hole.
- **Hero answers:** Wren: Deadeye converts Mark before weakening; Tobin: Shield Bash denies the puff; Pip: Fireball followed by Ignite spends Burn before it fades.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, two move wind-ups, two visible contact/release keys, hurt, restored/defeated. Every repeated contact has its own timing cue.
- **Variant — Hollowlight Morel:** 7 actions, Speed 1.05; Smother Puff 25% and Weaken 2 hero opportunities; tell stays fully visible. Target 6–8 actions; no additional actor.

## Quarry Ruins

Awakened stone; phys lean. Weakness **frost**, resistance **poison** for these darkened local bodies; unlisted types neutral. Variants inherit unspecified fields.

### Quarry Golem — normal

The first cut stones walk back toward their old seam. Speed **0.7×**; target **5 hero actions**; armour **20% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Stone Fist: 1 hit, slow, 33% phys; no status; shoulder seam brightens before impact. Chipfall: 3 hits, slow-slow-fast, 8%+8%+12% phys (28%); no status; three loose chips detach with distinct flashes.
- **Script / lesson:** alternate the two moves, starting with the first. Count three stones while saving damage for the slow body.
- **Hero answers:** Wren: Bleed bypasses armour; Tobin: Sunder supports Heavy Strike; Pip: Frost Shard attacks its weakness.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, two move wind-ups, two visible contact/release keys, hurt, restored/defeated. Every repeated contact has its own timing cue.
- **Variant — Deepcut Golem:** 8 actions, Speed 0.75; armour 25%; Chipfall 10%+10%+14%; no extra unseen rock. Target 6–8 actions; no additional actor.

### Flint Imp — normal

Stone chips gather into a sharp little quarry sprite. Speed **1.25×**; target **3 hero actions**; armour **5% phys reduction**. Occasional two-foe opportunities; cap 2.

- **Moves:** Flint Scrape: 2 hits, quick-quick, 12%+12% phys (24%); no status; both arms spark before their contacts. Spark Kick: 1 hit, delayed, 24% fire; no Burn; heel grinds against the floor before lifting.
- **Script / lesson:** alternate the two moves, starting with the first. A spark is a cue, not an unavoidable damage field.
- **Hero answers:** Wren: Pinned slows the rush; Tobin: Bulwark rewards the pair; Pip: Frost Shard strikes its weak stone body.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, two move wind-ups, two visible contact/release keys, hurt, restored/defeated. Every repeated contact has its own timing cue.
- **Variant — Sparksplit Imp:** 6 actions, Speed 1.3; Spark Kick 29%; Flint Scrape 10%+10%+12%, quick-quick-delayed. Target 6–8 actions; no additional actor.

### Slate Gargoyle — normal

A quarry offcut remembers the statue it never became. Speed **1.0×**; target **4 hero actions**; armour **10% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Broken Wing: 1 hit, feint, 27% phys; no status; one false stone twitch then a full wingedge lift. Chisel Beak: 2 hits, slow-fast, 12%+15% phys (27%); no status; two separate beak openings.
- **Script / lesson:** alternate the two moves, starting with the first. Separate settling rubble from the attacking wing.
- **Hero answers:** Wren: Mark and a timed Power Shot; Tobin: Brace widens the deceptive blow; Pip: cold Spark branch or Frost Shard.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, two move wind-ups, two visible contact/release keys, hurt, restored/defeated. Every repeated contact has its own timing cue.
- **Variant — Cathedral Gargoyle:** 7 actions, Speed 1.05; armour 15%; Broken Wing 32%; the feint never conceals the liftcue. Target 6–8 actions; no additional actor.

### Seam Serpent — normal

A vein of dark mineral uncoils through a stone body. Speed **0.9×**; target **4 hero actions**; armour **10% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Seam Bite: 1 hit, delayed, 26% phys; no status; crack-light runs from tail to jaw. Dust Coil: 2 hits, slow-delayed, 10%+14% phys (24%); last hit Weaken 1 hero opportunity; the coil tightens twice.
- **Script / lesson:** alternate the two moves, starting with the first. Track the travelling crack rather than its tail.
- **Hero answers:** Wren: Sonic Arrow after Mark/Pinned setup stops the coil; Tobin: Sunder opens its plates; Pip: Frost Shard provides weakness and control.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, two move wind-ups, two visible contact/release keys, hurt, restored/defeated. Every repeated contact has its own timing cue.
- **Variant — Ironseam Serpent:** 7 actions, Speed 1.0; Dust Coil 12%+16%; Weaken 2 hero opportunities and a darker dusttell. Target 6–8 actions; no additional actor.

## Wraithmarsh

Lost marsh lights; frost lean. Weakness **holy**, resistance **phys** for these darkened local bodies; unlisted types neutral. Variants inherit unspecified fields.

### Marsh Wraith — normal

A person who followed a green light repeats the last beckoning gesture. Speed **0.95×**; target **4 hero actions**; armour **0% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Cold Hand: 1 hit, delayed, 27% frost; no status; fingers become solid before reaching. Reed Whisper: 2 hits, slow-fast, 10%+14% frost (24%); last hit Chill 1 for 2 hero opportunities; two green pulses leave the mouth.
- **Script / lesson:** alternate the two moves, starting with the first. Defend the solid hand and second whisper, not the drifting robe.
- **Hero answers:** Wren: Mark offsets physical resistance; Tobin: Sunder cannot remove resistance, use guaranteed Riposte; Pip: Lantern Flare supplies holy weakness.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, two move wind-ups, two visible contact/release keys, hurt, restored/defeated. Every repeated contact has its own timing cue.
- **Variant — Firstlight Wraith:** 7 actions, Speed 1.05; Cold Hand 32%; Reed Whisper 12%+15%, sameChill. Target 6–8 actions; no additional actor.

### Willow Wisp — normal

The echo of a vanished marsh insect’s glow stretches into a spirit false lantern; it is no longer a flesh beast. Speed **1.25×**; target **3 hero actions**; armour **0% phys reduction**. Occasional two-foe opportunities; cap 2.

- **Moves:** Light Dart: 1 hit, quick, 24% frost; no status; its centre contracts to a white point. Double Glimmer: 2 hits, feint-delayed, 10%+15% frost (25%); no status; faintfalseflash then two full bright pulses.
- **Script / lesson:** alternate the two moves, starting with the first. Do not confuse the faint lure with a real pulse.
- **Hero answers:** Wren: Pinned makes both choices easier; Tobin: any parry lights Riposte; Pip: holy Lantern Flare avoids physical resistance.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, two move wind-ups, two visible contact/release keys, hurt, restored/defeated. Every repeated contact has its own timing cue.
- **Variant — Widowlight:** 6 actions, Speed 1.35; Double Glimmer 12%+17%; centrewhitecue unchanged despite darkerhalo. Target 6–8 actions; no additional actor.

### Fen Lanternback — normal

A trapped marsh light has taken the echo-shape of a tortoise beneath reeds; it is a spirit imitation, not a live animal with unexplained physical resistance. Speed **0.7×**; target **5 hero actions**; armour **15% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Reed Hammer: 1 hit, slow, 32% phys; no status; reeds stiffen into a single raised bundle. Cold Lantern: 1 hit, delayed, 25% frost; Chill 1 for 2 hero opportunities; light travels through the shell toward its mouth.
- **Script / lesson:** alternate the two moves, starting with the first. Choose steady damage over trying to race the wind-up.
- **Hero answers:** Wren: Bleed bypasses armour but not resistance; Tobin: Sunder handles its armour layer; Pip: holy Flare and Ward support the duel.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, two move wind-ups, two visible contact/release keys, hurt, restored/defeated. Every repeated contact has its own timing cue.
- **Variant — Drowned Lanternback:** 8 actions, Speed 0.75; armour 20%; Cold Lantern 30%, unchangedsingleChill. Target 6–8 actions; no additional actor.

### Reed Mourner — normal

A bundle of reeds keeps the shape of someone waiting on the bank. Speed **1.0×**; target **4 hero actions**; armour **0% phys reduction**. Equal or slower than the reference hero; no authored extra turns.

- **Moves:** Reed Fingers: 2 hits, slow-delayed, 11%+14% phys (25%); no status; handlike reeds uncurl separately. Borrowed Breath: 1 hit, delayed, 23% frost; Weaken 1 hero opportunity; chestlight draws inward then releases a visible ribbon.
- **Script / lesson:** alternate the two moves, starting with the first. The inward breath is safe; the outward ribbon is the hit.
- **Hero answers:** Wren: Sonic Arrow after Mark/Pinned setup interrupts the breath; Tobin: Brace supports the delayed rhythm; Pip: holy Flare punishes its spirit body.
- **Rewards:** gold and Essence; relics only where existing eligibility permits. No materials. Variant inherits this rule.
- **Art:** seven keys: idle, two move wind-ups, two visible contact/release keys, hurt, restored/defeated. Every repeated contact has its own timing cue.
- **Variant — Last Mourner:** 7 actions, Speed 1.1; Borrowed Breath 28%; Weaken 2 hero opportunities; no healing suppression or silenced buttons. Target 6–8 actions; no additional actor.

## The seven area elders

All are boss-tagged for control/stagger and cap 3 consecutiveopportunities. Charges use the shared 6% max HP interruption threshold and guaranteed hero response; their damage list is the release only. Standard rotation is move1, move2, charge(move3), release/recovery, move4, repeat. First phase begins unchanged, second begins at 50% HP after current move finishes.

### Elder Moss Slime — elder, Mossy Hollow

The oldest pond moss wears the first lost crown. Speed 0.8×; toughness 10 ordinary hero actions; armour 5%; weakfire; resistspoison. No guaranteed extra turns; normal scheduler and cap 3apply.

- Core Bump — 1 hit, slow, 30% phys; no status; the core drops then springs.
- Ooze Ring — 2 hits, slow-delayed, 15%+18% poison (33%); final hit Venom 3% for 2 hero opportunities; the outer moss ring pulses twice.
- Engulf — charge, then 3 hits, slow-slow-fast, 18%+18%+24% poison (60%); no added tick; its body cups around a bright core before release.
- Gather Moss — 1 hit, delayed, 27% phys; then gain Ward 4% max HP for 1 foe opportunity; the visible core retracts, no healing or splitting.

**Phase:** At 50% HP add a visible crownlift before Ooze Ring; same rhythm, +2% per hit (37% total). **Lesson / failure budget:** One wrong early bump costs 30%; Engulf punishes ignoring the announced charge, not a surprise speed spike. **Matchups:** Wren: Mark/Deadeye break the core; Tobin: Shield Bash can interrupt Engulf; Pip: Fireball plus Ignite uses the fire weakness. **Rewards:** gold, Essence and eligible relics; occasional existing boss unique, no materials. **Art:** idle, shared normal wind-up/contact, multi-hit wind-up/contact, charge hold/release, utility gesture, hurt, defeat (10 keys; shared base skeleton reduces unique drawing, not required cues).

### Elder Cave Bat — elder, Batwing Caves

The Bat Queen Wren once fed guards her darkened roost. Speed 1.15×; toughness 11 ordinary hero actions; armour 0%; weakpoison; resistsnone. Occasional consecutive foe turns; cap 3.

- Royal Bite — 2 hits, slow-fast, 17%+19% phys (36%); no status; ears and jaw cue each contact.
- Crown Dive — 1 hit, delayed, 38% phys; last wingfold is the cue.
- Call the Colony — charge, then 4 echo dives, slow-slow-fast-delayed, 15%+15%+18%+20% phys (68%); no adds; four wing echoes stay attached to her silhouette.
- Rending Wing — 1 hit, feint, 29% phys; Bleed 3% for 2 hero opportunities; a false wingflick precedes the wide edged sweep.

**Phase:** At 50% HP Speed 1.25; first phase change grants no instant opportunity. **Lesson / failure budget:** Punishes confusing a false wingflick with a hit, but every real dive still has a separate cue. **Matchups:** Wren: Pinned slows her and broadens reactions; Tobin: Bulwark uses four earned parries; Pip: Frost Shard interrupts the colony charge. **Rewards:** gold, Essence and eligible relics; occasional existing boss unique, no materials. **Art:** idle, shared normal wind-up/contact, multi-hit wind-up/contact, charge hold/release, utility gesture, hurt, defeat (10 keys; shared base skeleton reduces unique drawing, not required cues).

### Elder Rattlebones — elder, The Bonefield

The old captain still raises his broken sword for a battle already over. Speed 1.0×; toughness 12 ordinary hero actions; armour 15%; weakholy; resistspoison. No guaranteed extra turns; normal scheduler and cap 3apply.

- Grave Blow — 1 hit, slow, 37% phys; sword settles overhead before falling.
- Bone Volley — 3 hits, slow-fast-delayed, 12%+12%+18% phys (42%); shoulder bones lift in order.
- Last Muster — charge, then 3 hits, slow-slow-fast, 20%+20%+25% phys (65%); no summons; the captain lifts his sword as silent standards rise behind him.
- Rally the Dead — 1 hit, delayed, 28% holy; next Grave Blow +5% once; crownshine announces the buff and it expires if not used within 2 foe opportunities.

**Phase:** At 50% HP Bone Volley changes to slow-delayed-fast with identical 42% total and a visible broken-arm pause. **Lesson / failure budget:** The changed rhythm is taught once with a held pose; the buff cannot stack into an unmarked lethal hit. **Matchups:** Wren: Mark and Bleed help physical damage through armour; Tobin: Sunder then heavy timing; Pip: Lantern Flare exploits holy weakness. **Rewards:** gold, Essence and eligible relics; occasional existing boss unique, no materials. **Art:** idle, shared normal wind-up/contact, multi-hit wind-up/contact, charge hold/release, utility gesture, hurt, defeat (10 keys; shared base skeleton reduces unique drawing, not required cues).

### Elder Barrow Beetle — elder, Beetle Barrows

Its shell is carved like a king’s burial door. Speed 0.75×; toughness 13 ordinary hero actions; armour 25%; weakpoison; resistsnone. No guaranteed extra turns; normal scheduler and cap 3apply.

- Royal Mandibles — 2 hits, slow-fast, 19%+21% phys (40%); both jaw tips flash separately.
- Burrow Rise — 1 hit, delayed, 40% phys; shell remains visible and dirt rises before contact; no untargetable phase.
- Barrow Crush — charge, then 2 hits, slow-delayed, 30%+35% phys (65%); grave-door shell lifts and waits before falling.
- Shell Brace — no hit; physical armour becomes 35% until its next attack completes, then returns 25%; hollow knock and tucked head signal it.

**Phase:** At 50% HP Burrow Rise releases two 20% contacts (40% total), with two visible dirt heaves. **Lesson / failure budget:** Slow but heavy; player can use the harmless brace opportunity to set up rather than wait for random damage. **Matchups:** Wren: Bleed continues through Shell Brace; Tobin: Sunder directly answers armour; Pip: spells bypass the physical layer and Frost Shard answers the charge. **Rewards:** gold, Essence and eligible relics; occasional existing boss unique, no materials. **Art:** idle, shared normal wind-up/contact, multi-hit wind-up/contact, charge hold/release, utility gesture, hurt, defeat (10 keys; shared base skeleton reduces unique drawing, not required cues).

### Elder Spore Cap — elder, Fungal Deep

Morwen’s lost garden has stood up under a crown of fungus. Speed 0.85×; toughness 12 ordinary hero actions; armour 5%; weakfire; resistspoison. No guaranteed extra turns; normal scheduler and cap 3apply.

- Cap Hammer — 1 hit, slow, 35% phys; its cap folds around the stem before falling.
- Spore Burst — 3 hits, slow-slow-fast, 11%+11%+15% poison (37%); last hit Venom 3% for 2 hero opportunities; pores flash left, right, centre.
- Spore Bloom — charge, then 4 hits, slow-delayed-slow-fast, 15%+17%+15%+20% poison (67%); no unavoidable cloud; four rings each have a release cue.
- Garden Breath — 1 hit, delayed, 26% poison; Weaken 1 hero opportunity; stems bend toward the mouth, then snap outward.

**Phase:** At 50% HP Spore Burst’s last hit becomes 19% (41% total), announced by an extra bright centre pore. **Lesson / failure budget:** There is no room-wide unavoidable damage; every tick comes from an actually landed status hit. **Matchups:** Wren: Sonic Arrow after Mark/Pinned setup controls the bloom; Tobin: Brace handles the burst rhythm; Pip: Fireball/Ignite punishes its fire weakness. **Rewards:** gold, Essence and eligible relics; occasional existing boss unique, no materials. **Art:** idle, shared normal wind-up/contact, multi-hit wind-up/contact, charge hold/release, utility gesture, hurt, defeat (10 keys; shared base skeleton reduces unique drawing, not required cues).

### Elder Quarry Golem — elder, Quarry Ruins

Grenna’s first-cut quarry heart carries all the weight of the old pit. Speed 0.7×; toughness 15 ordinary hero actions; armour 25%; weakfrost; resistspoison. No guaranteed extra turns; normal scheduler and cap 3apply.

- Crushing Fist — 1 hit, slow, 42% phys; shoulder seam brightens and holds.
- Rockfall — 3 hits, slow-slow-fast, 13%+13%+18% phys (44%); three visible rocks detach in sequence.
- Seam Break — charge, then 2 hits, delayed-fast, 35%+35% phys (70%); chest seam opens completely before both fists release.
- Stone Set — no hit; Ward 5% max HP for 1 foe opportunity, once per rotation; stones audibly lock together. No self-heal.

**Phase:** At 50% HP Stone Set no longer grants Ward but gives next Crushing Fist +6% once; seam glows red-white to show the swap. **Lesson / failure budget:** A missed heavy strike hurts; the harmless reset gives all three heroes setup time. No endless repair loop. **Matchups:** Wren: Bleed avoids armour but needs long-fight sustain; Tobin: Sunder makes attacks matter; Pip: Frost Shard both exploits weakness and interrupts. **Rewards:** gold, Essence and eligible relics; occasional existing boss unique, no materials. **Art:** idle, shared normal wind-up/contact, multi-hit wind-up/contact, charge hold/release, utility gesture, hurt, defeat (10 keys; shared base skeleton reduces unique drawing, not required cues).

### Elder Marsh Wraith — elder, Wraithmarsh

It took the first light from this marsh and has waited beside it ever since. Speed 1.0×; toughness 13 ordinary hero actions; armour 0%; weakholy; resistsphys. No guaranteed extra turns; normal scheduler and cap 3apply.

- Cold Touch — 1 hit, delayed, 36% frost; fingers solidify one by one.
- Drowned Words — 3 hits, slow-delayed-fast, 12%+14%+16% frost (42%); last hit Chill 1 for 2 hero opportunities; mouthlight pulses each syllable.
- Drown the Light — charge, then 3 hits, slow-slow-delayed, 22%+22%+28% frost (72%); no resource theft or silenced abilities; gathered light contracts before release.
- Mend — no hit; heals 4% max HP once per fight, never above the phase threshold already crossed; a pale ring closes visibly. Later uses become harmless recovery.

**Phase:** At 50% HP Cold Touch becomes a feint with the same 36% contact; Drowned Words unchanged to retain a reliable lesson. **Lesson / failure budget:** The bounded Mend cannot stall the fight; charge and feint test attention without stealing input. **Matchups:** Wren: Mark improves resisted arrows; Tobin: parries feed Riposte but Sunder does not erase type resistance; Pip: holy Flare and Ward suit the duel. **Rewards:** gold, Essence and eligible relics; occasional existing boss unique, no materials. **Art:** idle, shared normal wind-up/contact, multi-hit wind-up/contact, charge hold/release, utility gesture, hurt, defeat (10 keys; shared base skeleton reduces unique drawing, not required cues).

## Area gauntlets

All queues are sequential and visible before entry. Normal members reset temporary states and cooldowns without an invented heal. Variants are opt-in tougher replacement rolls in later visits, never part of the first teaching queue. The elder is a separate marked encounter after the area's required progress, not an unannounced fourth enemy.

| Area | First teaching queue | Later five-foe mix |
|---|---|---|
| Mossy Hollow | Moss Slime → Rootling → Dewcap Newt; all three target 3 ordinary hits | Moss Slime → Briar Hare → Rootling → Dewcap Newt → Moss Slime |
| Batwing Caves | Cave Bat → Cave Cockatrice → Echo Moth | Blindfang → Cave Bat → Echo Moth → Cave Cockatrice → Cave Bat |
| The Bonefield | Rattlebones → Shield Husk → Gravebell | Grave Hound → Rattlebones → Gravebell → Shield Husk → Grave Hound |
| Beetle Barrows | Barrow Beetle → Lantern Mite → Grave Silkspider | Cairn Toad → Lantern Mite → Grave Silkspider → Barrow Beetle → Lantern Mite |
| Fungal Deep | Spore Cap → Moss Pixie → Lantern Morel | Rotback Tortoise → Spore Cap → Moss Pixie → Lantern Morel → Spore Cap |
| Quarry Ruins | Quarry Golem → Flint Imp → Slate Gargoyle | Seam Serpent → Flint Imp → Quarry Golem → Slate Gargoyle → Flint Imp |
| Wraithmarsh | Marsh Wraith → Willow Wisp → Reed Mourner | Fen Lanternback → Willow Wisp → Marsh Wraith → Reed Mourner → Willow Wisp |

The queue alternates heavy and light bodies; no more than two status specialists in succession. Gate any variant substitution behind its base's first defeat. A five-foe queue is not assumed sustainable until the active healing budget is measured; the initial three-foe queue is the safer launch proposal.

## The Fenmother — region boss, zone35

**Concept:** the old marsh presence around the first stolen light. Keep her mystery and the restored marsh ending; do not make her a generic giant lizard or a second raider boss. Her echo shapes belong to her own silhouette.

**Stats:** Speed 1.0× in phase 1,1.1× in phase 2,1.2× in phase 3; occasional consecutive foe opportunities after phase 1, cap 3. Target 18 ordinary hero actions (six per phase before payoff skills), armour 5%, weakholy, resistsfrost. These are proposed boss-specific type values, overriding the ordinary spirit row; all other types neutral.

| Move | Hits, damage, status, rhythm and tell |
|---|---|
| Cold Hand | 1 hit,35% frost; no status. Delayed: one long translucent arm becomes solid from shoulder to fingertips; contact follows the lit fingertips. |
| Borrowed Voices | 3 hits,16%+16%+20% frost (52%); final hit Chill 1 for 2 hero opportunities. Slow-slow-fast; three lights pass through her mouth, each sound paired with a visible pulse. |
| Smother | Charge then 4 hits,24%+24%+24%+30% frost (102% total, lethal if wholly undefended). Slow-delayed-slow-fast. Her chestlight shrinks to a single bead during the charge, with four distinct expanding rings on release. Interrupt by control contribution or 6% bossmax HP during charge; one hero opportunity guaranteed. No Lamp bar, silence, stolen cooldowns or unavoidable global damage. |
| Remembered Shore | 2 hits,feint-delayed,18%+22% holy (40%); Weaken 1 hero opportunity only on second. A false reflection moves first, then both real arms light in sequence. Neither reflection is a separate enemy. |

**Script and phases:** phase 1 above 66% uses Cold Hand → Borrowed Voices → Smother → release/recovery → Cold Hand. At 66% unlock Remembered Shore; rotation Hand → Shore → Voices → charge/release. At 33% keep the four moves, increase Borrowed Voices to 18%+18%+22% (58%) and make Smother's last interval shorter while retaining its distinct pulse. Announce each phase with a held breathing pose; no free transition hit or concealed fifth move. Smother interruption gives the shared recovery opportunity and cannot simultaneously award a second stagger skip.

**What the fight tests:** keep damage for the visible charge and distinguish an echo feint from the real hands. Mixed parry/dodge is valid: parry some hits for refunds, dodge the difficult last beat; only an all-parry move counters. The lethal full Smother is avoidable with either defence on every hit, and interruptible by damage without requiring a particular equipped skill. No mandatory perfect timing bonus is assumed.

**Hero matchups:** Wren's Mark/Deadeye and Final Echo can break the light bead; Shadow Step guarantees only her next chosen dodge, not the entire Smother. Tobin can use Shield Bash to interrupt and build Grit through individual parries; Last Stand buys two opportunities but expires, and missed hits do not create counters. Pip's Lantern Flare exploits holy weakness; Frost Shard's damage is resisted but its accepted control still interrupts, while Fireball/Ignite turns stored Burn into a damage-threshold answer. If threshold damage proves unreachable at entry gear, lower the threshold before widening every timing window.

**Drops / story:** gold, Essence, eligible relics and an occasional existing boss unique; preserve the Great Lantern/first-clear story flag separately, with no material drops. The marsh releases its held lights. A defeated held pose gives the story beat room rather than spawning loot under another enemy.

**Art budget:** 12 keys: idle, Cold Handhold/contact, Voiceshold/pulse, Smothercharge/release, Shorefeint/contact, phasebreath, hurt, defeated; echoes and rings are authored effects attached to those keys. No new art yet. Her hands/rings need readable contact alignment at the hero, and reduced-motion cues must retain hit counts.

## Region-specific review notes

Mossy Hollow's four normal bodies all target 3 hits to protect the requested opening. Later 5actionbodies reward setup skills, while elders support the H3finishers. Normal move totals lie around 20–35% HP; the first area sits at the low end. Perfect play is not required for normal survival, but ignoring every enemy cue is no longer an idle strategy. Armour/resistance values and each Speed ratio need the step 3 joint hero/enemy balance pass; none is claimed measured.
