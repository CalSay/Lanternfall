# Layout, menus and notices

Owner feedback, in order: "The menus definitely need some work. With more being added, they're very
cluttered. Lots of scrolling." Then: menus that "when selected filling the screen is a good thing", but
no forced landscape. This pass makes the game the main view and turns each tab into a full-screen menu
with 2-4 sub-views. The previous pass (bottom tabs, HUD on the stage, quiet toasts with a bell log) stays;
its compact-stage-on-scroll is gone, because a menu no longer shares the screen with the stage in portrait.

## Screens

**Portrait (phones; any viewport taller than wide, or narrower than 600 px).** Max width 560 px, centred.

1. **Header, 48 px.** Portrait with level, name and XP bar, gold and embers, the bell. Always visible.
2. **Game view.** The stage box fills the space (`flex: 1`, at least 180 px), then the control row
   (Fight / Gather / Raid, zone stepper), then the **Next Up chip**: the top goal with its progress along
   the bottom edge, "Ready" or a percent, and "+N" for the other goals (orange when more than one is ready).
   Tap the chip for the full list in a sheet; each row has a Go button.
3. **Tab bar, 54 px, at the bottom.**

Tapping a tab opens its **menu** over the game view (same grid cell, so the header and the tab bar stay):
it slides up from the tab bar in 0.26 s (instant under `prefers-reduced-motion`). It has a title row
(tab icon, name, a close button with a down chevron and a grab handle), the sub-view switcher, then the
scrolling content. It closes on: the close button, tapping the open tab again, Escape, or a swipe down
(on the title row, or on the content while it is scrolled to the top; 110 px, or a quick 36 px flick).
The tab bar stays live, so the player hops between menus without closing them.

**Wide (viewport at least as wide as tall and 600 px or wider: phones turned sideways, tablets, desktop).**
Game on the left (1.4 fr, about 58%), the menu on the right (1 fr, at least 300 px). A menu is always
open; there is no close button or overlay. The header sits over the game column, the tab bar under the
menu column. Below 500 px tall (phones sideways) the menu drops its title row (the tab bar names the
tab) and the tab bar shrinks to 48 px.

| Viewport | Stage box | Menu content (scroll area) |
|---|---|---|
| 360 x 740 | 336 x 526 (71%) | 360 x 528 (was 416-460) |
| 412 x 915 | 388 x 701 (77%) | 412 x 703 (was 503-635) |
| 740 x 360 | 408 x 200 | 306 x 254 |
| 915 x 412 | 510 x 252 | 379 x 306 |
| 1280 x 800 | 723 x 640 | 531 x 640 |

Mid/late save (`tests/fixtures/save-v2-late.json` with a class chosen), Chromium. The portrait stage
fills what the header, control row, chip and tab bar leave (more than the 45-60% first sketched, because
the alternative is empty space under it).

Screenshots (`img/menus-*.png`): `menus-360-game`, `-fight`, `-party`, `-gather`, `-craft`, `-camp`,
`-camp-tavern`, `-nextup`, `-journal`; `menus-412-game`, `-fight` (Bounties), `-party` (Roster),
`-gather` (Pack), `-craft` (Gear), `-camp` (Almanac); `menus-740x360-fight`, `-camp`;
`menus-915x412-party`, `-craft`; `menus-1280x800-fight`, `-gather`.

## Sub-views

| Tab | Views (first is the default) | Holds |
|---|---|---|
| Fight | Upgrades · Bounties · Bestiary | Omen banner, boss gate, hero upgrades, old companions (before the roster) · bounties · zone mastery, bestiary |
| Party | Team · Roster | formation, your hero, fighting beside you, synergies · roster grid, leads |
| Gather | Mining · Wood · Foraging · Pack | skill cards, home ground and a how-to line on each node view · the pack (materials and trophies) |
| Craft | Make · Gear · Powers · Uniques | stations, recipes, Enchanter's Table · your gear, the bag · legendary powers: your powers, the Lantern Book, circle sets (opens with the first legendary power or Circle Sigil) · unique loot |
| Camp | Camp · Tavern · Almanac · Raid | camp, buildings, blessings, roster board · visitor, who is online, hall of heroes, rename · today's Omen and the week · world raid, war horn, relics |

The **Journal** (lifetime stats) and **Achievements** moved to the bell: the bell sheet has
Notices | Journal.

The switcher is one row of equal buttons (40 px tall plus borders). The open view has the lit bottom edge.
A dot marks a view with news while it is not open: Bounties (a bounty is ready to claim), Roster (a
promotion, milestone or new face; same rule as the Party tab's dot), Camp (a build finished), Tavern
(today's visitor can be hired), Almanac (a weekly goal to claim). A tab gets the same dot when one of its
views has news and the tab is not open (unless the tab already shows its own dot).

The last view per tab and the last tab are remembered in `localStorage` key `lanternfall.ui.v1`
(`{ tab, views: { tabId: viewId, log } }`), not in the save. Portrait always starts on the game view;
wide screens reopen the last menu.

## Navigation

- `setTab(tab, sel?)`: `tab` is a tab id, a view id (`'bounties'`, `'raid'`, `'almanac'`, `'make'`) or an
  old part id (`'tav'`). `sel` (selector or node) opens the view that holds it and scrolls to it. If the
  element does not exist yet (rows built in `update()`), the tab's sections are updated once to build it.
- Next Up `go: { tab, view, sel, fn }` goes through `setTab`, then scrolls smoothly and flashes the row.
  All built-in goals were checked to land on a visible target (promote and recruit now go to the Roster;
  they pointed at the retired companion rows).
- `closeMenu()` returns to the game view (portrait only). `S.tab` is `''` while no menu is open, so
  "is this tab open?" checks (`S.tab === 'world'`) stay true only while the player can see it.

## Notices (toasts)

Unchanged rules: `toast(msg, kind, icon, prio)` or `emit('toast', { msg, kind, icon, prio })`.

| Priority | What happens | Use for |
|---|---|---|
| high | Always pops; pushes out an older normal toast. 4.2 s (loot 5 s). | Level up, zone cleared, unique loot, recruit or companion joins, promotion, raid boss reward, Star Chart, a legendary forge, a new feature opening |
| normal | Pops if there is room; otherwise folds into the newest normal toast as "+N" and counts on the bell. 2.6 s. | Boss failed, achievement, bounty done, rare or epic forge, weekly goal, skill level that opens a new tier |
| low | Log only; counts on the bell. | Anything the player just did and can see (equip, salvage, common forge, upgrade, reforge, transmute, brew, switch mode, build queued), routine skill levels, bestiary steps |

- On the game view, toasts sit in the stage box under the HP bar, never over the control row or the
  ability button (right 62 px stay clear). At most 2 on a stage 200 px or taller, else 1.
- While a menu covers the game (portrait), the toast stack moves over the bottom of the menu, just above
  the tab bar, full width, at most 2. Wide screens keep them on the stage (it stays visible).
- Tap or swipe a toast away. Repeats become "+1". Every notice goes to the bell log (last 50, this visit).
- **What's new** (Q1): notices raised in the first 2.5 s of play (old-save catch-ups: achievements, Codex
  Light, retooled gear, the camp and its welcome) fold into one bell notice with a short list, and one toast
  says so (tap it to open the bell; it waits until "Choose your path" closes). A single notice pops as usual.
  `emit('whatsNew', { msg, icon, first })` adds a line later.

## Adding a system: pick a view, never append to a tab's end

1. Decide which existing view your section belongs to, by what the player is doing there
   (upgrading, hunting, managing the team, gathering one skill, making, wearing, camp life, news).
   `registerSection(tab, { id, title, view: 'bounties', mount, update })`.
2. Only if it is a new activity with its own list, make a view: `registerView(tab, { id, label, order, dot })`.
   Keep labels to one short word (4 views fit at 360 px). A tab holds 2-4 views; past that, merge.
3. Without `view` a section joins the tab's first view. That is the busiest one: do not.
4. Things every view of a tab needs are rare; mark them `data-view="*"` (or a space-separated list).
5. Show essentials on a card; put details behind a tap (a sheet via `openSheet`) or a chevron. The chevron
   pattern is `disclose(row, trigger, onToggle)` in 71-ui-fight.js (row gets `dz`/`open`; styles in
   60-disclose.css; `.dz-list` joins rows into one frame). Done for the Fight upgrades and boss gate, the Camp
   Hearth cost and building list, and the Almanac weekly goals (polish pass, 2026-09-28).
6. Give the view a `dot()` only for news the player should act on, and keep it cheap (runs once a second).

## Rules for later UI work

- Size the stage from CSS only. 62-stage reads its container (it re-lays out on resize).
- Nothing new on the game view beyond the stage, the control row and the Next Up chip. New controls go in
  a menu view.
- Keep taps on the stage working: overlays on the stage need `pointer-events: none` unless they are
  buttons that stop propagation (the ability and sound buttons).
- Tap targets stay 44 px or larger. No horizontal scroll at 360 px or in a 300 px wide menu column:
  panel and section grids use `minmax(0, 1fr)` and their children `min-width: 0`.
- Side gutter is `--gut` (12 px). The menu slide and every new motion respect `prefers-reduced-motion`.
- Checks when you touch layout: portrait 360x740 and 412x915 (game view and each tab), landscape 740x360
  and 915x412, desktop 1280x800; no console errors; no horizontal scroll.
