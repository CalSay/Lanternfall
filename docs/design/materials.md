# Materials: the 15-grade name ladder (MAT1)

Status: name spec, written 2026-09-28, task **MAT1**. Owner-approved (2026-09-28): the full ladder below,
and relabelling today's grades 1-5 (grade-3 ore becomes Silver, Mithril moves to grade 5, Starsteel is
dropped). **Display names only. No id, save field or save shape changes** — `S.mats[fam][grade - 1]`
keeps its meaning, and every grade's index is unchanged. Under the relaxed save rule (CLAUDE.md, wave
log 2026-09-28), that carefulness is a courtesy, not a requirement: a rename never needs a migration or
a save-key bump because nothing about the data shape moves, only what a code table prints.

This file is the reference gear-2.md 1.2, regions-4-5.md and core-2.md 5.2 point to. It replaces every
"placeholder, MAT1" and "superseded by MAT1" marker in those docs.

## 1. The ladder

Six families follow the owner's real-and-standard-fantasy rule directly. Grade = tier (1-15); region
gates it (core-2.md 5.2): 1-3 the Hollow, 4-6 the Coast, 7-9 the Emberwaste, 10-12 the Pale Reach, 13-15
the Gloamvale.

| Grade | Region | Ore (`ore`) | Wood (`wood`) | Cloth (`fibre`) | Hide (`hide`) | Herb (`herb`) | Gem (`crystal`) |
|---|---|---|---|---|---|---|---|
| 1 | Hollow | Copper | Pine | Hemp | Rawhide | Sage | Quartz |
| 2 | Hollow | Iron | Birch | Linen | Leather | Yarrow | Jasper |
| 3 | Hollow | Silver | Oak | Wool | Wolfhide | Foxglove | Amethyst |
| 4 | Coast | Cobalt | Mangrove | Cotton | Sharkskin | Sea Lavender | Pearl |
| 5 | Coast | Mithril | Ash | Silk | Bearhide | Mandrake | Aquamarine |
| 6 | Coast | Orichalcum | Yew | Sea Silk | Basilisk Hide | Saffron | Topaz |
| 7 | Emberwaste | Emberite | Ironwood | Salamander Wool | Wyvernhide | Dragon's Blood | Fire Opal |
| 8 | Emberwaste | Adamantite | Ebony | Spider Silk | Drakehide | Firebloom | Ruby |
| 9 | Emberwaste | Dragonsteel | Bloodwood | Dragonsilk | Dragonhide | Sunpetal | Sunstone |
| 10 | Pale Reach | Moonsilver | Silverbark | Snowfleece | Mammoth Hide | Snowdrop | Moonstone |
| 11 | Pale Reach | Starmetal | Elderwood | Moonsilk | Griffon Hide | Edelweiss | Sapphire |
| 12 | Pale Reach | Arcanite | Moonwood | Starweave | Behemoth Hide | Starflower | Diamond |
| 13 | Gloamvale | Darksteel | Nightwood | Shadowsilk | Chimera Hide | Nightshade | Onyx |
| 14 | Gloamvale | Aetherium | Wraithwood | Voidweave | Manticore Hide | Wolfsbane | Bloodstone |
| 15 | Gloamvale | Voidsteel | Heartwood | Dreamweave | Nightdrake Hide | Gloamlily | Black Diamond |

**Coordinator addition (owner concern, gems vs buff items getting confused):** the `crystal` family's
player-facing label is **Gems**, not "Crystal" (Quartz through Black Diamond; still gathered from Geodes
while mining, gear-2.md row 2.16). The id stays `crystal`; only the family label (`MAT.crystal.n`)
changes. This keeps the raw-material word "Gem" and the buff-item word "Sigil" (section 7) from ever
being confused for one another.

Notes:

- **Grades 1-5 are relabelled** (owner-approved): grade 3 ore is now **Silver** (was Mithril); **Mithril**
  moves to grade 5 (was Emberite); **Starsteel is dropped** entirely (no grade uses it). Grades 1, 2 and 4
  ore, and every grade of wood, cloth, hide, herb and gem at 1-5, take their name straight from this
  table (some also change from today's draft names — see section 4, "What changes in the code").
- **The grade-9 clash is gone.** Today's grade-5 ore was called Emberite; that name now sits at grade 7,
  and nothing is called Emberite at grade 5 any more, so there is no collision left to fix. LORE-R45's
  proposed "Wyrmsteel" for grade 9 is dropped in favour of the owner's **Dragonsteel**.
- **`ess` (Essence) is not on the owner's table** — it is not a physical material, so it keeps its own
  light-intensity naming (grades 1-5: Dim, Glowing, Radiant, Blazing, Starlit — unchanged). Section 3
  proposes an extension to grade 15 in the same spirit, for the owner to approve.
- **Hide names are the full word**, not a modifier plus a unit: "Rawhide" and "Wolfhide" already read as
  hide, and "Leather", "Sharkskin" and "Bearhide" (and every hide name from grade 6 up) never need a
  second word. Code note in section 4: `matName()` must stop appending "Hide" after the hide family's
  short name.
- **Refined goods reuse the raw name** (section 2). Grade-2 raw hide is called Leather; the *refined*
  leather good only exists from grade 4, so a game string never has to write "Leather Leather" — see
  section 5 for the one place this still needs a coder's eye (the `leathers` item kind).

## 2. Refined goods: naming rule

Refining turns a raw material into a refined good from grade 4 up (gear-2.md 1.1, 1.2). The name is
always **`<raw material name> <refined unit>`** — the raw name never changes, only the unit word after it:

| Refined family | Unit word | From | Example (grade 4) | Example (grade 8) |
|---|---|---|---|---|
| `ingot` | Ingot | Ore | Cobalt Ingot | Adamantite Ingot |
| `plank` | Plank | Wood | Mangrove Plank | Ebony Plank |
| `leather` | Leather | Hide | Sharkskin Leather | Drakehide Leather |
| `cloth` | Cloth | Cloth (fibre) | Cotton Cloth | Spider Silk Cloth |
| `tinct` | Tincture | Herb | Sea Lavender Tincture | Firebloom Tincture |

Rule for a coder or writer adding a grade-6-plus refined line: take the raw name from section 1's table
exactly, append the unit word with a space, never contract or invent a compound. A two-word raw name
(Sea Lavender, Fire Opal, Mammoth Hide) still just gets the unit word appended ("Sea Lavender Tincture"),
never re-ordered or abbreviated.

## 3. Essence (the seventh family): proposed grades 6-15 — Owner to approve

Not on the owner's table (it is spirit, not stone). Keeping the existing shape (a single light-intensity
word, one per grade, no unit needed — "Dim", not "Dim Essence" in most UI, though `matName('ess', t)`
still appends "Essence" the way it does today) and carrying it up by region mood:

| Grade | Region | Name |
|---|---|---|
| 1 | Hollow | Dim (unchanged) |
| 2 | Hollow | Glowing (unchanged) |
| 3 | Hollow | Radiant (unchanged) |
| 4 | Coast | Blazing (unchanged) |
| 5 | Coast | Starlit (unchanged) |
| 6 | Coast | Tidal |
| 7 | Emberwaste | Molten |
| 8 | Emberwaste | Scorched |
| 9 | Emberwaste | Ashen |
| 10 | Pale Reach | Frozen |
| 11 | Pale Reach | Frostbound |
| 12 | Pale Reach | Starbound |
| 13 | Gloamvale | Shadowed |
| 14 | Gloamvale | Wraithlit |
| 15 | Gloamvale | Dreaming |

## 4. What changes in the code (grades 1-5 only; this task)

Today's short names at grades 1-5, and what they become. Ids and array indices never move.

| Family | Today | New (this task) |
|---|---|---|
| `ore` | Copper, Iron, Mithril, Starsteel, Emberite | Copper, Iron, **Silver**, **Cobalt**, **Mithril** |
| `wood` | Oak, Yew, Ironbark, Ghostwood, Lanternwood | **Pine**, **Birch**, **Oak**, **Mangrove**, **Ash** |
| `fibre` | Flax, Nettle, Silkgrass, Moonsilk, Gloamsilk | **Hemp**, **Linen**, **Wool**, **Cotton**, **Silk** |
| `hide` | Soft, Tough, Scaled, Dusk, Ember (+" Hide") | **Rawhide, Leather, Wolfhide, Sharkskin, Bearhide** (full names, no appended unit) |
| `herb` | Sage, Wormwood, Bloodmoss, Ghostcap, Lantern Lily | Sage (unchanged), **Yarrow**, **Foxglove**, **Sea Lavender**, **Mandrake** |
| `crystal` | Quartz, Amber, Moonstone, Starglass, Emberglass | Quartz (unchanged), **Jasper**, **Amethyst**, **Pearl**, **Aquamarine** |
| `ess` | Dim, Glowing, Radiant, Blazing, Starlit | unchanged |

Node names (`NODE_NAMES`) keep their existing flavour suffix per slot (Vein/Seam/Crater/Heart for ore,
Grove/Thicket/Stand/Hollow for wood, Geode/Pocket/Grotto/Rift/Heart for crystal, Field/Patch/Meadow/Web/
Hollow for fibre, Bed/Patch/Bank/Ring/Pool for herb) and only the material word in front changes, e.g.
"Mithril Seam" (grade 3) becomes "Silver Seam"; "Starsteel Crater" (grade 4) becomes "Cobalt Crater";
"Emberite Heart" (grade 5) becomes "Mithril Heart".

`matName(k, t)` builds `${MAT[k].short[t-1]} ${MAT[k].unit}`. The hide family's names are already
complete nouns, so its `unit` becomes `''` and its `short` array holds the full names directly ("Rawhide"
not "Raw" + "Hide"). This is a small code shape change to `MAT.hide`, not a save-data change — nothing
reads `MAT.hide.unit` as a save field.

## 5. A naming note for RG1/coders (not a name change, a heads-up)

Item kind `leathers` (the medium-armour body piece) is named `${MAT.hide.short[t-1]} Leathers}` via
`kindName()`. At grade 2 that is "Leather Leathers" — the raw hide name and the item's own noun collide.
This only shows up once the game actually crafts a grade-2 `leathers` piece (today's data already allows
it). Nothing in this task changes `kindName()` or `CRAFT_KINDS`, since that is item-naming code, not
material-naming data — flagging it here so RG1 or a follow-up task can special-case it (e.g. drop the
material word for this one kind, or give `leathers` its own per-grade noun).

## 6. Secondary resources (coal, salt, dye), one name a region — Owner to approve

Region 1 has none (gear-2.md 3.6: Region 1 stays raw). Real names fit well here, as gear-2.md 1.3 already
notes (sea coal, sea salt, madder are real materials):

| Region | Coal (Mining) | Salt (Foraging) | Dye (Foraging) |
|---|---|---|---|
| 2 Coast | Sea Coal | Sea Salt | Madder |
| 3 Emberwaste | Kiln Coal | Glass Salt | Cinderroot |
| 4 Pale Reach | Rime Coal | Rime Salt | Frostbloom |
| 5 Gloamvale | Dead Coal | Grey Salt | Nightbloom |

These replace the LORE-R45 placeholders "Glimmercoal", "Frostsalt" and "Frostbloom Dye" (regions-4-5.md
1.4) and give Regions 3 and 5 names they never had. None of this is built in code yet (gear-2.md 1.3),
so nothing in `src/js` needs to change for this table.

## 7. Buff items: Sigils, one family per region — OWNER DECISION (coordinator, 2026-09-28, applied)

The owner's concern: a buff item must never read like a gem, a stone, glass or any crafting material —
a player should never wonder whether a "Pearl" is the grade-4 gem or the Coast's buff item. The whole
category is renamed, player-facing, to **Sigils**. This replaces "Lantern Pearl", "Ember-glass" /
"Emberglass", "Starshard" and "Wellglass" everywhere in the docs. Family ids stay generic (`pearl`,
`glass`, `star`, `well`, core-2.md 5.4 / gear-2.md 5.1) — this is a display-name decision, not an id
change.

| Region | Family id | Family's player-facing name | Old name it replaces |
|---|---|---|---|
| Coast | `pearl` | **Tide Sigil** | Lantern Pearl |
| Emberwaste | `glass` | **Ember Sigil** | Ember-glass / Emberglass (spelling clash, now moot) |
| Pale Reach | `star` | **Frost Sigil** | Starshard |
| Gloamvale | `well` | **Gloam Sigil** | Wellglass |

**Individual buff items are named `<Boss or theme> Sigil`** (core-2.md 5.4's per-boss buff item, gear-2.md
5.5's "bosses always drop their signature buff item"), not `<family> Sigil` — e.g. the Coast Shroud
Silas the Fogbound drops a **Fogbound Sigil**; a Tide Sigil is the family/category name used on the
Storehouse's Buff Items page and in generic copy ("Set a Tide Sigil"), not an item's own name.

**The old Coast "Pearl" currency becomes Tide Sigils.** Every place gear-2.md, region-2.md or lore.md
used "Lantern Pearl" as a **currency or found item** (Rank 8's 25-Pearl cost, the Storehouse Buff Items
page, "Matched: Lantern Pearls", the away-card "Found a Rare Lantern Pearl") now reads Tide Sigil(s).
"Pearl" on its own, from here on, means only the grade-4 gem (section 1).

Buff items/Sigils are not built in code yet (gear-2.md 0, 1.1): nothing in `src/js` names them today, so
this table is a naming decision for RG1's build, not a `src/js` change in this task. The docs this task
updates (gear-2.md, regions-4-5.md, core-2.md, plan-4.md, lore.md) now use Sigil names in place of the
old placeholders.

## 8. Materials vs Sigils — the rule

Two different kinds of thing sit in the pouch, and they must never look or read alike:

| | **Materials** (ore, wood, cloth, hide, herb, gem, essence, secondaries, refined goods) | **Sigils** (buff items) |
|---|---|---|
| Naming | Plain material nouns (Copper, Silk, Quartz, Cobalt Ingot) | `<Boss or theme> Sigil` for the item; `<Region> Sigil` (Tide/Ember/Frost/Gloam) for the family |
| Where kept | Stack in the **Storehouse**, by family and grade (gear-2.md 1.7) | Their own **Buff Items** page in the Storehouse, counted like Trophies, not capped (gear-2.md 1.7, 5.6) |
| Look | Flat icon per family/grade, no glow | A glowing item icon with its own rarity trim, distinct from any gem or crystal icon shape |
| What they do | Feed recipes, refining and Reforge | Go into gear **sockets** only (core-2.md 5.4); never a recipe ingredient |

A quick check for any future name: if it could be mistaken for something you gather and stack, it is a
material name and belongs in section 1; if it is only ever found, socketed and never spent on a recipe,
it is a Sigil and takes the `<Boss/theme> Sigil` or `<Region> Sigil` shape above.

## 9. Owner to approve — summary

Essence grades 6-15 (section 3) and the four secondary-resource sets (section 6) are new naming proposed
by this task, in the owner's real-or-standard-fantasy style, and need sign-off the way the grade 1-15
ladder itself did. Section 1's ladder, the grade 1-5 relabel, the Gems label and the Sigils rename
(sections 7-8) are already owner/coordinator-approved (wave log, 2026-09-28) and are live in this task's
code and doc changes.
