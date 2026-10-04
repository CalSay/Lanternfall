# Carried lanterns, combat gear and future crafting scope

Owner-approved design direction, 4 October 2026: **every character carries a lantern; mages equip staff
and tome**. This document plans the implementation; the game, item table and saves remain unchanged.
Lantern carriage is identity/world logic, not an extra free stat slot. NPC lanterns may hang at belt,
on a yoke or nearby work station as appropriate; combat heroes need one clearly retained lantern.

Current inspected equipment table (`src/js/21-data-craft.js:206`) has Warblade/Shield, Bow/Quiver,
Staff/Lantern and Censer/Tome class families. The named Tome currently belongs to Lightkeeper and
has healing stats. No Grimoire kind exists. Mage staff+tome therefore needs a class eligibility,
recipe/stat and migration design; merely drawing a book does not implement it.

## Future skills/crafting overhaul work item

- Distinct combat axe, greatsword/duelling blade, combat spear, hooked spear variant, hammer/maul,
  dagger and compatible sigil folio. Their categories and eligible classes remain proposals.
- Combat Spear and Hunting Spear must have distinct names/icons/inventory filters and use different
  stat pools. Gathering Woodaxe is likewise not automatically a combat axe. Preserve current tools.
- Every hero carries a lantern without automatically adding spell power. Mage combat off-hand
  becomes a tome; define its offensive/control/protection affixes rather than inheriting healing blindly.
- Preserve existing lantern investment: inventory IDs, tier, rarity, upgrades, affixes and equipped
  eligibility need a deliberate conversion/retention plan. No item is deleted, converted or rebalanced here.
- Proposed two-handed weapons occupy both hands. An attached seal/focus is visual identity until a
  deliberate accessory rule replaces/rebalances the current off-hand contribution. Do not add a ninth
  free equipment slot. Bow/quiver and staff/stowed-tome ergonomics need explicit handling too.
- Specify crafting stations, skill gates, materials, unlock order, salvage, upgrade costs, UI, save
  compatibility and regression checks before implementation. Coordinate any economy/save changes under
  existing shared-file and upstream rules.

## Immediate design consequence

Brynja can use the supported Warblade/Shield family; her carried lantern does not power a hidden
extra equipment engine. The door-bar and brazier remain historical story objects rather than new
weapon categories. Hesketh, Oriel, Thessaly, Linnet, Inga, Ragna, Pip and Elowen receive distinct tome
briefs; their universal lantern remains clearly attached/carried. Aldric's banner is optional lore,
not a compulsory combat item. No throwing assets are proposed.

No production weapon-dependent master should be locked until its hand use and legal equipment
layout are resolved. No runtime, recipe, save migration or approved artwork changes in this milestone.
