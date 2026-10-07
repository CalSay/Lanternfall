# Slice art manifest (Milestone 1a, zones 1 to 15)

Card: `slice-art-manifest`. Source: `docs/design/milestones.md` (E4, "Content budget", "The stand-in") and
`docs/design/milestone-records/judge.md`. Docs only. This file lists what the slice needs, what exists, and which Codex
pack makes the rest. The `slice-art-manifest` check in E4 reads the same list from the game data.

## Rules that apply (M1 rulings)

- Only Codex makes art. Claude writes briefs, wires each pack (one `integrate:` S card per pack) and runs the art judge pass.
- Kin bodies are allowed only inside whole Codex packs: one monster drawn as kin of another in the same area (same body,
  its own palette, marking or prop, any pose its moves need). No agent recolours or tints art in code. The Deepwell cold
  palette stays the only runtime recolour.
- Whole vetted packs only. A stand-in never counts as a pass. A zone keeps today's live art until its pack is wired.
- **Re-plan trigger:** if the Codex lane is still paused on 2026-10-21, the judge re-cuts E4 to zones 1 to 10 (DECISIONS
  line). The **Zones 1-10** column below marks what stays in M1a after that cut. Zones 11 to 15 move to M1b.
- Today's key names: `FOE_ART` (`src/js/21za-data-foeart.js`, built by `tools/art/embed-foes.mjs`) holds `imp` and
  `gloomjaw`. `BG_ART` (`src/js/21zb-data-bgart.js`, built by `tools/art/embed-bg.mjs`) holds `forest`.

## 1. Zone monsters (15)

Names and moves: `docs/design/enemies-c22-hollow-final.md`. Each pack also carries the Captains in section 2.

| Zone | Monster | Area | Exists today | Missing | Codex pack | Zones 1-10 |
|---|---|---|---|---|---|---|
| 1 | Thorn Imp | Mossy Hollow | Yes: `art/enemies/thorn-imp/approved-v2`, `FOE_ART.imp` | none | (done) | yes |
| 2 | Gloomjaw | Mossy Hollow | Yes: `art/enemies/gloomjaw/approved-v1`, `FOE_ART.gloomjaw` | none | (done) | yes |
| 3 | Briarbound Ravager | Mossy Hollow | No | whole monster | Area-1 sheet | yes |
| 4 | Thornwing | Mossy Hollow | No | whole monster | Area-1 sheet | yes |
| 5 | Nightseed Sorcerer | Mossy Hollow | No | whole monster | Area-1 sheet | yes |
| 6 | Riftwing | Batwing Caves | No | whole monster | Batwing Caves area pack | yes |
| 7 | Maw Cantor | Batwing Caves | No | whole monster | Batwing Caves area pack | yes |
| 8 | Cave Devourer | Batwing Caves | No | whole monster | Batwing Caves area pack | yes |
| 9 | Glassfang Fiend | Batwing Caves | No | whole monster | Batwing Caves area pack | yes |
| 10 | Echoblade | Batwing Caves | No | whole monster | Batwing Caves area pack | yes |
| 11 | Ossuary Knight | The Bonefield | No | whole monster | Bonefield area pack | no (M1b) |
| 12 | Pall Reaper | The Bonefield | No | whole monster | Bonefield area pack | no (M1b) |
| 13 | Gravetyrant | The Bonefield | No | whole monster | Bonefield area pack | no (M1b) |
| 14 | Boneweft Seer | The Bonefield | No | whole monster | Bonefield area pack | no (M1b) |
| 15 | Skullmaw | The Bonefield | No | whole monster | Bonefield area pack | no (M1b) |

"Area-1 sheet" is the pack that adds the three area-1 monsters. The Thorn Imp and Gloomjaw already ship, so that pack
adds only Ravager, Thornwing, Nightseed Sorcerer and the area-1 Captains.

## 2. Captains (15, own look and moves)

Done today: 0. Neither shipped pack supplies a Captain. Each Captain shares its monster's anatomy and adds a third move
and a fixed visible marking (roster, `enemies-c22-hollow-final.md`). They are drawn in the same pack as their monster.
The Thorn Imp pack has Captain-only keys but the Captain look (ivory mask, crimson blade edges) is outstanding; Gloomjaw
has none.

| Zones | Captains | Codex pack | Zones 1-10 |
|---|---|---|---|
| 1-5 | Crownthorn Imp, plus the Gloomjaw, Ravager, Thornwing and Sorcerer Captains | Area-1 sheet (all five Captains, including the two shipped monsters) | yes |
| 6-10 | Five Captains | Batwing Caves area pack | yes |
| 11-15 | Five Captains | Bonefield area pack | no (M1b) |

## 3. Champions (3)

One pack each. A Champion is a different creature with its roster name and story, not kin of a zone monster.

| Champion | Posts at | Exists today | Codex pack | Zones 1-10 |
|---|---|---|---|---|
| The Briar Regent | zone 5 | No (zone boss uses the generic "Elder <type>" art) | Briar Regent pack | yes |
| The Hollow Cantor | zone 10 | No | Hollow Cantor pack | yes |
| The Ossuary Marshal | zone 15 | No | Ossuary Marshal pack | no (M1b) |

## 4. Backgrounds

One backgrounds pack for M1a: Codex paints each area's palette and light version of the Mossy Hollow night painting.

| Area | Theme key | Exists today | Codex pack | Zones 1-10 |
|---|---|---|---|---|
| Mossy Hollow (zones 1-5) | `forest` | Yes: `art/backgrounds/mossy-hollow/outlined-night-v1`, `BG_ART.forest` | none | yes |
| Batwing Caves (6-10) | `cave` | No | Backgrounds pack (Caves and Bonefield) | yes |
| The Bonefield (11-15) | `bone` | No | Backgrounds pack (Caves and Bonefield) | no (M1b) |

Open point for the `integrate:` card. `zoneTheme(z)` (`src/js/22-data-regions.js`) returns `forest` for zones 1 to 7
(`MOSSY_ZONES`, set 2026-10-02), and then follows the 7-zone cycle, not the 5-zone areas. So zones 6 and 7 show the
Mossy Hollow painting today, and the Caves painting would reach zones 8 and up. Rule on whether to align scenery to the
areas, or keep `forest` to zone 7, before wiring; that is a design call for the judge, not this card.

If the pack must split for the zones 1-10 cut, the Caves painting alone is the in-scope part.

## 5. Heroes and icons (known gaps)

| Asset | Used where | State today | Missing | Pack / card | Zones 1-10 |
|---|---|---|---|---|---|
| Four ability icons: Wren's Power Shot, Barbed Arrow and Pinning Shot, and Tobin's Shield Throw | Ability lists and loadouts | Lettered tiles. Pip's icons merged (#75); Wren and Tobin hold back until all 14 are whole | 4 icons x 4 sizes, judged | `codex-art-ability-icons-4` (due Fri 2026-10-09 18:00 UK, at risk: Codex environment blocked), then `wire-ability-icons-wren-tobin` | yes |
| Intro stills (3, 320x180) and Hesketh's bust (96x96) | The opening and the guide | Placeholders: the dimmed Mossy Hollow background with the lamp icon; Hesketh shows his roster portrait. `art/first-hour/` does not exist | all four pictures | `first-hour-art` (card ready), wired by the `intro-and-picker` or `guide-voice` thread | yes (E1) |
| Cache icons, about 10 cache looks, parry spark | Lantern Caches, wardrobe, parry | None: `art/cache/` does not exist | whole pack | `cache-art` (after `first-hour-art`), then `cache-looks` wires | yes (E1) |
| Starter portraits (Pip, Tobin, Wren) | Banner, hero sheet, party row (16x16 head crop) | In game, with sprite mismatches (below) | the three portraits matched to the sprites | `starter-portrait-sprite-match`, with `hero-portraits` (running) | yes |

Known portrait mismatches (as carded; verify against screenshots when the card starts):

- Pip: the portrait shows a hood, the sprite wears a hat.
- Tobin: the sprite has a cap the portrait lacks.
- Wren: the portrait reads dark at 32 px.

The intro stills and Hesketh's bust set the style sheet that later packs follow (`story-stills`, `codex-art-hero-portraits`).

## 6. Pack list

Seven new Codex packs for M1a (each: one Codex card, then one Claude `integrate:` S card, then the art judge's "wire"
ruling in DECISIONS, Art):

1. Area-1 sheet (Ravager, Thornwing, Nightseed Sorcerer, five area-1 Captains). Zones 1-10.
2. Batwing Caves area pack (five monsters, five Captains). Zones 1-10.
3. Bonefield area pack (five monsters, five Captains). **Falls out at the 2026-10-21 cut.**
4. Briar Regent pack. Zones 1-10.
5. Hollow Cantor pack. Zones 1-10.
6. Ossuary Marshal pack. **Falls out at the cut.**
7. Backgrounds pack (Caves and Bonefield). Caves part stays; Bonefield part falls out.

Already carded and counted toward E1/E4 (not among the seven): `first-hour-art`, `cache-art`,
`codex-art-ability-icons-4`, and the starter portrait work.

After the cut, packs 1, 2, 4 and 5 stay, and pack 7 shrinks to the Caves painting.

## 7. What the E4 check needs from this list

Each zone 1 to 15 resolves its monster, its Captain and the area Champion to a `FOE_ART` key, and each area theme to a
`BG_ART` key. Keys do not exist for rows marked missing; the check fails by design until each pack is wired. The
Captain key naming is for the area-1 sheet's `integrate:` card to set (monster key plus a Captain key per zone).
