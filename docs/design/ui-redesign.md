# UI redesign: a sleeker look to match the new hero art

Status: **proposed, waiting on Cal's pick.** Docs and a mockup only; no game file changes.
Ask: Cal, 10 Oct 2026 16:58: "Can we plan a full UI redesign to match the new hero artwork. I think what we have suits the
original 16bit vibe but we need something a bit sleeker."
Mockup page (all four screens at 1280x720, 740x360 and 360x740, both looks): https://claude.ai/artifact/ByLSRghC3o64DRhoraqg7F

Builds on, and does not change: the browser-first layout (`docs/design/layout.md`, `docs/design/desktop-layout.md`: the rail,
top row, stage, side column, the two desktop tiers, docked detail, the number keys) and the new art style plan
(`docs/design/new-style/plan.md`: scenery, nodes and monsters in the heroes' style; icons stay Codex's). This plan is the
layer those two leave alone: fonts, colours, panels, buttons, the fight HUD and the menus' look.

## 0. The plan in plain words

- **What is wrong.** The heroes (route S Wren, Tobin, Pip, Auriel) are detailed, painted pixel art at about 190 px, lit by
  lanterns against night-blue scenes. The screen around them is 16-bit: a pixel display font (Handjet), opaque purple-black
  boxes with 2 px square borders and hard drop shadows, and ember orange on borders, tabs, labels and buttons alike. The
  art reads as a different game from its frame.
- **The pick: Lantern Brass.** Night-ink glass panels that let the scene show through, 1 px brass hairlines, small brass
  diamonds on the main panels, a carved serif (Cinzel) for titles and names only, Barlow Semi Condensed (already in the game)
  for everything else, and ember kept for the one thing you can act on now. It takes its colours from the art itself: Wren's
  gold trim, the lantern light and the moonlit sky.
- **The alternative: Night Glass.** The same layout with no ornament: soft white edges, round corners, pill buttons, one
  sans font and a cool moon-blue accent. Sleeker in a generic way; it reads like many mobile games and loses the lantern
  identity. Cal can pick it with "Go with Night Glass".
- **What stays.** The layout and every size rule above, the status colours, the rarity colours, the 14 px desktop text
  floor, the 3-tap camp, every Codex icon at its native size, and every player-facing word.
- **What it costs.** CSS only: no images for chrome, no Scenario credits, no page bytes beyond the CSS. One new Google
  font family (Cinzel) in the same stylesheet request as Barlow. Portrait busts (stage 5) are a conversion of approved
  frames, so the art judge rules on them; nothing is drawn.
- **Rollout.** Five stages, each shown in the preview for Cal's OK before it goes to the weekly build (section 4).

## 1. The two directions

Both use the same tokens with different values, so either can be built from one stage 1 card.

| Token | Today (`src/styles/10-base.css`) | Lantern Brass (pick) | Night Glass |
|---|---|---|---|
| Ground | `--bg #140F1A` purple-black, a 4 px dot grid | `#080B12` night ink, no grid | `#070A12` |
| Panel | `--panel #1F1827`, opaque | `rgba(11,15,24,.82)` with `backdrop-filter: blur(10px)` | `rgba(16,21,34,.60)`, same blur |
| Line | `--line #3A2F47`, 2 px | `rgba(205,163,92,.38)`, 1 px; highlight `#E0BC76` | `rgba(255,255,255,.10)`, 1 px |
| Accent (chrome) | `--ember #FF9E3D` | brass `#D8B068`, text `#F3DCA4` | moon blue `#A4C0FF` |
| Action ("ready", Go) | ember | ember `#FF9E3D`, unchanged | ember, unchanged |
| Corners | 0 | 6 px panels, 4 px buttons | 14 px panels, pill buttons |
| Titles | Handjet 700, `--display-k 1.2` | Cinzel 600, capitals, letter-spacing .07em | Barlow Semi Condensed 700 |
| Body and numbers | Barlow Semi Condensed | Barlow Semi Condensed, tabular numbers | same |
| Primary button | flat ember | brass gradient `#EDCB86` to `#B98F45`, dark text | ember gradient, soft glow |
| Ornament | none | a 7 px brass diamond at the top corners of main panels (CSS pseudo-elements) | none |

Kept as they are in both: `--hp`, `--xp` roles, the five rarity colours (`--r-common` to `--r-legendary`), the status colours
(Bleed red, Burning orange, Chilled blue, Marked gold, Cursed magenta, Starlight night blue and pale gold), `--muted`'s role.

**Why Brass over Glass.** Lanternfall's own nouns are lanterns, brass, embers and night; Brass says them, Glass does not.
The heroes' trim is gold on all four (Wren's bow, Tobin's buckle and shield rim, Pip's staff fittings, Auriel's star staff),
so a brass line ties every panel to the art next to it. Glass is the safer modern look and would also work; it is the
fallback if Brass feels too ornate in play.

## 2. What changes, point by point

Numbered to match the mockup page.

### 2.1 Type
- **Now:** Handjet sets every title, name, number and button (287 uses of `var(--display)` across `src/styles`, most in
  `60-deeds.css`, `60-craft.css`, `60-solo.css`), and the stage's canvas text draws in it too (`62-stage.js:40` `fontPx`,
  damage numbers; `62b-fx.js:509`, ability names). It is the strongest 16-bit signal on screen.
- **We'd do:** `--display` becomes a title role: Cinzel 600, used for screen titles, the place name, hero and foe names, the
  zone label, the turn banner and big card titles. Everything else that uses `--display` today (numbers, buttons, slot
  labels, pills, counts) moves to Barlow Semi Condensed 600-700 with `font-variant-numeric: tabular-nums`. Canvas damage
  numbers move to Barlow 700 with the same dark stroke. `--display-k` goes to 1 for Cinzel (it reads at its px size).
- **Options:** (a) Cinzel plus Barlow (pick); (b) Barlow alone (Night Glass); (c) keep Handjet for numbers only. (c) keeps
  the 16-bit read on the most-seen text, so no.
- **Watch:** Cinzel is wider than Handjet and has no lowercase (lowercase draws as small capitals), so it never goes in a
  fixed-width box (slot labels, the zone pill, pills): those use Barlow. The lesson "a name in a fixed-width box must fit the
  fallback font too" applies; Cinzel's fallback is Georgia. `check fonts` (`tools/check.mjs:280`) asserts `--display` draws in
  Handjet from `tests/fonts`; stage 1 adds Cinzel's OFL files there and changes the assert. The `local-fonts` card
  (`docs/design/hosting.md` 389) gains Cinzel. One `css2` link carries both families, so the cold-load font timing stays one
  stylesheet.

### 2.2 Panels
- **Now:** opaque boxes (`--panel`), 2 px borders, `box-shadow: inset 0 0 0 2px #0B0810` and hard offset shadows
  (`10-base.css:52`, `30-panels.css`, `40-components.css`).
- **We'd do:** one panel recipe: the glass fill with a 10 px blur, a 1 px line, 6 px corners, a soft 28 px shadow and a faint
  top highlight. The brass diamonds go only on main panels (Next Up, the foe plate, an open menu's frame), never on rows.
  Where `backdrop-filter` is missing the fill is opaque enough (0.82) to read without it.
- **Pick:** as drawn.

### 2.3 Colour
- **Now:** the purple-black ground fights the night-blue scenes, and ember marks tabs, borders, labels and buttons, so
  nothing stands out as "act now".
- **We'd do:** a night-ink ground; brass for chrome (lines, lit tabs, titles, the XP line); ember only for a ready ability,
  Next Up's "Ready" and the primary Go. Rarity and status colours unchanged.
- **Pick:** as drawn.

### 2.4 Fight HUD (stage)
- **Now:** two wide boxed health plates across the top of the stage, a boxed turn label under the place name, and the
  timing bar in a box (see `desktop-layout/before/fight-1280x720.png`).
- **We'd do:** the place name and wave diamonds in the sky top left (Cinzel), one compact foe plate top right (name, HP bar,
  numbers on desktop, status chips with their Codex icons), a slim HP bar over the hero, the turn banner as a ribbon with no
  box, and the timing bar as a slim track. Statuses keep their colours as the chip's outline and text. This keeps the rule in
  `layout.md` (combat info in the sky, hero HP over the hero) and gives back about 50 px of sky.
- **Watch:** the turn banner and the foe plate must never overlap the place line (the mockup drops the banner at 740x360 and
  360x740, where the slot glow says it is your turn). Lessons: "measure the turn banner by its face and words".

### 2.5 Action bar
- **Now:** square tiles with labels cut to "Par..." and "Dod...", and the key letter over the icon.
- **We'd do:** rimmed tiles with the key in a small chip in the corner, the cooldown as a CSS `conic-gradient` sweep with the
  turns left in the middle, a soft ember glow on ready moves, a gold-tinted rim on Parry and a blue one on Dodge (their
  timing-bar colours). Labels show only where the slot fits the whole word (desktop); the upright phone uses each ability's
  existing `short` name (Echo, Mark, Bats), never a cut word.
- **Pick:** as drawn. Same slot sizes as `desktop-layout.md` (116 and 132 at the desktop tiers, 60 on phones).

### 2.6 Menus
- **Now:** sub-tabs are boxed buttons; lists are rows of equal grey boxes, so a ready build and a locked one look alike.
- **We'd do:** underline tabs (the lit one gets a brass line under it), cards only where something stands out (the Hearth,
  a bounty you can finish, the docked item), plain divided rows elsewhere, and locked rows dimmed. Section labels are small
  spaced capitals with a fading brass rule.
- **Hero gear:** the full new hero stands in the middle of the Gear view with the worn slots down the left and the tools
  down the right (desktop only; phones keep the grid). The art is the reason for the redesign, so the Hero menu should show
  it. The hero image is the idle frame the stage already loads; no new art.
- **Star map:** the six constellations on a night-sky panel in Starlight's own colours (night blue, pale gold); learned
  stars glow, set stars ringed, the selected star's card beside it.
- **Pick:** underline tabs, and the hero in the Gear view.

### 2.7 Portraits
- **Now:** 64 px portraits cut from the old concept boards (`21yc-data-portraits.js`), in the old style, on the rail and
  in menus.
- **We'd do:** round busts cut from each hero's approved route S idle frame, in a brass ring. Cutting is a conversion, so
  under the art rules (CLAUDE.md, "Who signs") the busts go to the art judge as one pack (all heroes in the game at once)
  before they are wired. The mockup's busts are crops made for the page only.
- **Pick:** cut busts, judged as a pack. If the judge shelves them, the old portraits stay in the new ring.

### 2.8 What does not change
Layout and tiers (`layout.md`), the number and bracket keys, docked detail, tooltips, the bell, the guide's docking rules,
every icon and its native size (the C26 check: boxes grow, icons do not scale; the mockup shows nav icons at 2x for
legibility, the build keeps 22 px), copy, and the online layer's screens beyond their shared tokens.

## 3. Rules every stage keeps

- CSS and the existing art only. No image chrome, no SVG ornament beyond simple shapes, no drawn art (the art freeze).
- Text floor 14 px at the desktop tiers; `scaleText` keeps working because sizes stay in px.
- Checked at 1280x720 first, then 740x360 and 1024x768; 360x740 must not break; 1920x1080 must look good.
- `prefers-reduced-motion`: no new motion beyond 150 ms fades and the existing slide-ins.
- Contrast: body text on glass at least 4.5:1 over the brightest part of the Mossy Hollow painting (the lantern pools);
  stage 1 measures it on the game's own shots.
- `backdrop-filter` is measured in `tools/perf.mjs` on the late save before stage 1 merges; if it costs frames, panels go
  opaque at the same colour.
- No "Classic look" switch. The tokens make the old look easy to restore in git, and two themes would double every menu
  check. (The "Classic art" switch for characters is separate and stays.)

## 4. Rollout, one screen at a time

Each stage is one build card (Opus medium; stage 1 high because it touches every screen). Each goes to the preview
artifact first; Cal's OK on the preview lets it into the weekly build. Card ids are suggestions for the Foreman.

| Stage | Card | What | Files (main) | Cal OKs |
|---|---|---|---|---|
| 1 | `ui2-look` | Tokens, fonts, panel, button, pill, tab and bar recipes applied everywhere at once; canvas text to Barlow | `src/shell.html` (font link), `10-base.css`, `30-panels.css`, `40-components.css`, `60-tabs.css`, `60-nav.css`, `62-stage.js:40`, `62b-fx.js:509`, `tests/fonts`, `tools/check.mjs` (check fonts) | The fight screen and one menu in the preview |
| 2 | `ui2-fight` | The sky HUD, foe plate, ribbon, timing track, action bar, Next Up, notices, rail and top row | `20-stage.css`, `60-turn.css`, `60-combat2.css`, `80-landscape.css` (desktop tiers only), `71-ui-fight.js` markup if a class is missing | A fight at 1280x720 and 740x360 |
| 3 | `ui2-hero` | Hero, Gear with the hero in the middle, Abilities, Build, the star map | `60-party.css`, `60-abilities.css`, `60-attributes.css`, `60-stars.css`, the Gear view's markup | Each view in the preview |
| 4 | `ui2-menus` | Camp first, then Gather, Craft, the bell (notices, journal, settings), story cards, the guide, the away card, the boss-try and cache cards | `60-camp.css`, `60-gathering.css`, `60-craft.css`, `60-story.css`, `60-tips.css`, `60-away.css`, the rest of `60-*.css` | Camp, then the rest as one pass |
| 5 | `ui2-busts` | Busts cut from the approved idle frames, judged as a pack, then wired | `tools/portraits.mjs`, `21yc-data-portraits.js` | The art judge rules; Cal can veto |
| Later | (Cal starts it) | A new-style icon set, if the Codex icons look old beside the new UI | Codex | Cal's call, no date |

Each card's check: `node tools/build.mjs`, `node tools/check.mjs`, shots of its screens at 1280x720, 740x360, 360x740 and
1920x1080 beside the mockup, and the independent tester on the first-hour route for stages 1 and 2.

## 5. Open questions for Cal

1. **Lantern Brass or Night Glass?** Pick: Brass.
2. **The hero in the Gear view?** Pick: yes, desktop only.
3. **Start stage 1 now, or after the Sunday release?** Pick: after Sunday, so v8 ships on the look players already have and
   stage 1 lands in the next preview with nothing else changing.

Veto phrases, if Cal says nothing: "Keep the pixel font", "Go with Night Glass", "No hero in the gear view".
