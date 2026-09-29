# Hero accessories register (crafting and forging)

Every item a hero visibly carries in their art becomes a **craftable gear piece** for that hero. Recorded as we
build each hero (art pipeline: docs/design/art-pipeline.md), so gear follows the art: if Tobin carries a sword,
Tobin's weapon slot takes a sword.

Materials follow gear-2's two-material rule (owner, "Owner answers to 9.3"): Ranger-line weapons wood + metal,
armour leather + cloth; Warrior-line weapons metal + wood, armour metal + leather; Lanternmage-line weapons
wood + gem, armour cloth + leather. Material names come from docs/design/materials.md.

| Hero | Accessory | Gear slot | Crafted at | Materials (main + second) | Look changes with grade? |
|---|---|---|---|---|---|
| Wren Hollowmere | Longbow | Weapon | Workbench | Wood + metal (fittings) | Yes: palette swap on the wood and trim |
| Wren Hollowmere | Quiver | Off-hand | Tannery / Workbench | Leather + cloth | Yes: leather and fletching colours |
| Wren Hollowmere | Bat-eared hood | Head | Loom | Cloth + leather | Trim colour only (keeps her silhouette) |
| Wren Hollowmere | Arrows | None (ammo is free) | - | - | Glow colour could follow the bow's Sigil |
| Tobin Reed | Borrowed sword, too big for him | Weapon | Forge | Metal + wood (grip) | Yes: blade metal colour. Awakening adds its scabbard |
| Tobin Reed | Kite shield with a wheat emblem | Off-hand | Forge | Metal + wood | Yes: rim and face colour. Tank's block pose uses it |
| Tobin Reed | Baker's cap (cream, red stripe) | Head | Loom | Cloth + leather | Trim only (his story look) |
| Tobin Reed | Apron-tabard with a wheat emblem | Body | Loom | Cloth + leather | Trim only |
| Pip Cinderly | Twisted staff with an ember orb | Weapon | Workbench | Wood + gem (the orb) | Yes: wood and orb colour. Flame is code |
| Pip Cinderly | Singed spellbook (torn last chapter) | Off-hand (Tome) | Loom | Cloth + leather | Cover colour only (story item) |
| Pip Cinderly | Witch hat with a gold charm | Head | Loom | Cloth + leather | Trim only |

Not craftable (character, not gear): Wren's scarf, chest strap and bat companion; Tobin's red scarf and cape.

## Open design points (for S4, the gear build)

1. **Hero gear slots grow to match the art.** Today heroes have 2 positions (`wpn` by role, plus a trinket), and
   a tank's `wpn` is a Shield. Proposal: a hero's weapon kind is what they carry (Tobin: sword; Wren: bow), and
   heroes gain the off-hand or head slot when their art shows one (Wren: quiver and hood). This also covers the
   owner's playtest note that tanks should be able to hold a sword (playtest-1.md, item 6).
2. **Grade shows on the sprite.** Each hero's palette is locked, so a crafted item's grade can recolour just
   that item's pixels (e.g. oak to ebony to heartwood on the bow). That's cheap in code and makes upgrades visible.
3. **Uniques keep their own look.** A boss unique could be a separate GPT-drawn prop that replaces the base
   item in the sprite. That's decided per unique, and is optional for 1.0.
