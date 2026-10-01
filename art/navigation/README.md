# C26 menu and navigation icons — whole-pack review

Status: OWNER REVIEW PENDING.32 designs,256 native PNG candidates. Nothing wired into the game. Branch codex/c26-menu-icons, base2b379cf.

## Contents

review-v1/navigation.png and submenus.png are unchanged generated transparent source sheets. Prompt records and measured per-icon rectangles are retained. Neutral charcoal, steel, ivory, brass and natural material colours; no hero-specific purple UI palette.

game-v1 exports each design at12,16,18,20,22,24,36,48px, with transparent padding and <=24visible colours.12/18px match activity pill variants;20/22px match current landscape rail; larger sizes cover other menu contexts.256PNGs total259574bytes; complete embedded NAV_ICONS[id][size] bundle354693bytes. Production integration can embed only consumed sizes.

Run node art/navigation/game-v1/preview-server.cjs. The preview shows actual exported PNGs, a22px rail sample and a labelled filterable inventory. index.html also opens directly.

## Source inventory and mapping

Current shell has five main tabs, not eight: adv->fight, party->hero, gat->gather, forge->craft, world->camp. Tavern is a Camp subview. Adventure/map is reserved art, not a new tab; Journal belongs to the existing notices/Journal UI. Existing IDs/saves/layout stay unchanged.

Activity views: mine->mining, wood->woodcutting, forage->foraging, pack->storehouse, raid->raid, deep->deepwell. Hunting is available as art for its later approved hookup.

Subview reuse: upgrades->boss; bounties, bestiary, training, stars, gear, uniques, almanac use matching names; make uses craft; team uses hero; camp/tav use camp/tavern. ach-deeds->deeds, ach-tracks->tracks, ach-feats->feats, ach-looks->looks. Achievements overall may reuse feats/deeds after renderer review. Codex remains distinct from Journal/Almanac. Shared controls: notices bell, next-up signpost, switch-view panels, close X.

These are navigational symbols, not graded item icons. Mining/wood/forage/hunting equipment here does not replace the future full tool-and-weapon pack.

## Export and validation

python tools/art/navicons.py uses Pillow. Measured frames, premultiplied-alpha resize, binary alpha, no-dither palette quantization of visible pixels, aspect-preserving centred padding. No art is drawn procedurally. Source art remains unchanged. Manifest records source/PNG hashes, rectangles, palettes and embedded data.

Exporter checks all256PNG dimensions, alpha, palette count and padding. Build passed2755.8KB. Unchanged gameplay source already passed full suite with0browser skips earlier this session. Preview32cards,16-card submenu filter, loaded images and360px no-horizontal-overflow checked. Native12px examples necessarily simplify more than larger variants; preserve adjacent readable labels. Larger review sources remain available if the owner requests a redesign.

## Integration boundary

Wait for whole-pack owner approval. Then ask Claude for exact hooks in70-ui.js TAB_IC/TAB_ICON and bell,75-nav-ui.js ICON_OF,75-goals-ui.js fallback Next Up only, and any submenu icon additions. New embedded data fragment and own checks are possible; shell/layout/state code stays Claude-owned. Do not replace goal-specific material/enemy icons wholesale with Next Up. Native images and data are prepared; no live runtime hook exists yet.