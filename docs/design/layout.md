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

**Landscape (UX-L1, 2026-09-30; viewport at least as wide as tall and 600 px or wider: phones on their side,
tablets, desktop).** The main target now (owner: mobile is landscape only). From the approved mock-up (removed 2026-10-02; in git history).
Styles: `src/styles/80-landscape.css`; `isWide()` in 70-ui is this layout.

```
+------+----------------------------------------------+-------------+
| port | gold  [Fight|Gather] [Switch] [< Zone 14 >]              bell|  top row 44 (48 on screens 600+ tall)
|------+----------------------------------------------+-------------|
| Fight|                                              | Next Up     |
| Hero |  the stage; combat info in its sky:          | notices     |
| ...  |  place top left, foe plate top right         | [Q] [W] [E] |
| rail |                                              | [A] [S] [D] |  the bar: Attack in the corner
+------+----------------------------------------------+-------------+
```

- **Rail** (52 px; 64 on tall screens): the portrait and level on top, then the five tabs (54 px each, 62 tall).
  The left thumb navigates, the right thumb fights; the bottom edge stays free, so the stage gets the full height.
- **Top row**: everything not combat: gold and embers, Fight / Gather, Switch, the zone arrows, the bell. The XP
  bar is its 3 px bottom line. The activity pill is hidden (Switch does the same).
- **Stage**: everything between. Whole-pixel zoom only (62-stage `LAND_ZOOMS`): the largest of x1-x4 that
  leaves at least 360 x 280 logical px, so the heroes keep their ~96 art px: x1 on phones, x2 at 1280 x 720 and
  1024 x 768, x3 at 1920 x 1080. The sky carries the combat info: the place on the left, the foe's plate (name,
  HP, the boss strip under it) on the right; the hero's HP sits over the hero.
- **Side column** (clamp(208 px, 20vw, 272 px)): Next Up at the top (eyebrow, status and +N on one line, the goal
  under it), notices under it, the action bar in the bottom-right corner (two rows; slots 60 px on phones, 75 on
  desktop; labels and key letters only where the slots are big enough).
- **Safe areas**: the app is padded by the left and right insets (a notch pushes the rail or the side column in);
  the rail and the bar keep the bottom inset.

**Menus in landscape: a panel over the right part of the stage** (decision, UX-L1). A tab opens its menu as a
panel between the stage's left strip and the side column: width `min(560px, max(320px, stage - 120px))`
(360 px at 740 x 360, 464 at 844 x 390, 560 at 1280 x 720). Why this and not the other options:
- The bar, Next Up and notices stay live on the right, so a boss's heavy hit can still be parried or dodged
  with a menu open (keys too). Covering the bar would make every menu visit a gamble in a boss fight.
- The strip on the left is where the hero stands: you still see them fight and their HP over their head. The
  foes' side is what the panel covers; the turn fight waits for your input as usual.
- A true split (stage shrunk beside a menu) would re-lay out and re-zoom the stage on every open and close, and
  at 740 px it leaves neither a readable stage nor a 300 px menu.
- The top row stays too: gold is in view while you spend it, and Fight / Gather / Switch work from any menu.

The panel slides in from the right (0.2 s; none under reduced motion). Its head is one row: the view switcher
and a close button (a right chevron); with one view, the title shows instead. It closes with that button, the lit
tab, or Escape (no swipe down in landscape). Every layout now starts on the game view (landscape used to reopen
the last menu). Picking a new activity (the quick switcher, "Go" buttons) closes the menu in both layouts, so you
see the change. Guide hints dock at the bottom of the panel while it is open (on the stage under the sky
otherwise); a hint whose target is on the covered stage points at the lit tab instead ("Close this menu...").
The guide scrolls a target inside a menu into view. Sheets (the picker, the Attack sheet, bottom sheets) are
centred and capped to the screen height, scrolling inside.

| Viewport | Stage box (zoom, logical) | Menu panel (scroll area) | Slot |
|---|---|---|---|
| 740 x 360 | 480 x 316 (x1, 480 x 316) | 360 x 316 (358 x 266) | 60 |
| 844 x 390 | 584 x 346 (x1) | 464 x 346 (462 x 296) | 60 |
| 915 x 412 | 655 x 368 (x1) | 535 x 368 (533 x 318) | 60 |
| 1024 x 768 | 752 x 720 (x2, 376 x 360) | 560 x 720 (558 x 670) | 60 |
| 1280 x 720 | 960 x 672 (x2, 480 x 336) | 560 x 672 (558 x 622) | 75 |

Screenshots: `docs/coord/uxl1-shots/` (fight, a boss, each menu, Training, the Tavern's gatherer board, the
picker, the Attack sheet at 740 x 360 and 1280 x 720; the first guide step at 740 x 360; 844 x 390; portrait).

**Portrait (secondary until the owner drops it)** is unchanged:

| Viewport | Stage box | Menu content (scroll area) |
|---|---|---|
| 360 x 740 | 336 x 526 (71%) | 360 x 528 (was 416-460) |
| 412 x 915 | 388 x 701 (77%) | 412 x 703 (was 503-635) |

Mid/late save (`tests/fixtures/save-late.json`), Chromium. The portrait stage
fills what the header, control row, chip and tab bar leave (more than the 45-60% first sketched, because
the alternative is empty space under it).

Screenshots (`img/menus-*.png`, portrait): `menus-360-game`, `-fight`, `-party`, `-gather`, `-craft`, `-camp`,
`-camp-tavern`, `-nextup`, `-journal`; `menus-412-game`, `-fight` (Bounties), `-party` (Roster),
`-gather` (Pack), `-craft` (Gear), `-camp` (Almanac). (The old wide-layout shots, `menus-740x360-*`,
`menus-915x412-*`, `menus-1280x800-*`, show the layout UX-L1 replaced.)

## Sub-views

| Tab | Views (first is the default) | Holds |
|---|---|---|
| Fight (`adv`) | Boss · Bounties · Bestiary · Deepwell | Omen banner, the zone's fight count and boss · bounties · zone mastery, bestiary · Deepwell runs |
| Hero (`party`) | Hero · Abilities · Training · Stars | the hero card and gear row · Scrolls, slots, abilities and talents · Training · the star map |
| Gather (`gat`) | Mining · Wood · Forage · Hunting · Store | skill views with nodes and the Now card · the Storehouse |
| Craft (`forge`) | Make · Gear · Uniques | stations and recipes · your gear and the bag · unique loot |
| Camp (`world`) | Camp · Tavern · Almanac · Raid | camp scene, buildings, gatherers, Blessings · gatherer board and Tavern perks · today's Omen and the week · world raid |

The **Journal** (lifetime stats, Achievements, the Codex) and **Settings** sit in the bell sheet: Notices | Journal |
Settings.

The switcher is one row of equal buttons (40 px tall plus borders). The open view has the lit bottom edge.
A dot marks a view with news the player should act on while it is not open: for example a bounty to claim, a
finished build, a weekly goal to claim. A tab gets the same dot when one of its
views has news and the tab is not open (unless the tab already shows its own dot).

The last view per tab and the last tab are remembered in `localStorage` key `lanternfall.ui.v1`
(`{ tab, views: { tabId: viewId, log } }`), not in the save. Every layout starts on the game view
(UX-L1; `tab` is still written but no longer reopened).

## Navigation

- `setTab(tab, sel?)`: `tab` is a tab id, a view id (`'bounties'`, `'raid'`, `'almanac'`, `'make'`) or an
  old part id (`'tav'`). `sel` (selector or node) opens the view that holds it and scrolls to it. If the
  element does not exist yet (rows built in `update()`), the tab's sections are updated once to build it.
- Next Up `go: { tab, view, sel, fn }` goes through `setTab`, then scrolls smoothly and flashes the row.
  Every built-in goal must land on a visible target.
- `closeMenu()` returns to the game view (both layouts since UX-L1). `S.tab` is `''` while no menu is open, so
  "is this tab open?" checks (`S.tab === 'world'`) stay true only while the player can see it.

## Notices (toasts)

W1-B (audit-1 3b): `toast(msg, kind, icon, prio)` or `emit('toast', { key, msg, kind, icon, prio, go })`.
Every notice takes ONE path (70-ui.js `notify`). The channel comes from ONE table,
`NOTICES` in src/js/23n-data-notices.js (by `key`, or a pattern on the message); `prio` only matters for a
message no rule knows (tools/check.mjs fails if a source has no rule).

| Channel | What happens | Examples |
|---|---|---|
| card | A full-screen moment its own UI draws. | Great Lantern relit, a Feat |
| pop | A toast (or a caption over the stage). At most 1 per 20 s and 3 a minute of play (a place title or an elder's line needs 40 s of quiet); never while a guide step shows or a card is up. A pop that cannot show goes to the bell (captions to the bell list); some wait up to their rule's `wait` for the next slot first. A reply to a press ("Chop more Pine Log first") always shows. | A new unique, the Stars unlock, a boss that beat you, a new kind of attack, a place's title the first time, a story page |
| bell | A quiet line that counts on the bell. Unread lines of one rule merge ("New: Bounties, Foraging."). | New views, Codex milestones, Deeds at Gold, every 25th level |
| log | Listed in the bell, never counted. | Level ups, zones cleared, the fire lit, Bestiary steps, Deeds Bronze and Silver |
| none | Dropped: the screen shows it. | "You head to...", Equipped, Salvaged, "Work starts on...", the old achievements |

To tune: change a rule's `ch` in NOTICES (or `NOTICE_TUNE` for the budget). A new message needs a rule.

- On the game view, toasts sit in the stage box under the HP bar, never over the control row or the
  ability button (right 62 px stay clear). At most 2 on a stage 200 px or taller, else 1.
- While a menu covers the game (portrait), the toast stack moves over the bottom of the menu, just above
  the tab bar, full width, at most 2. Landscape: toasts always sit in the side column, above the action bar.
- Tap or swipe a toast away. Repeats become "+1". Every notice but `none` goes to the bell log (last 50, this visit).
- **What's new** (Q1): notices raised in the first 2.5 s of play (old-save catch-ups: achievements, Codex
  Light, retooled gear, the camp and its welcome) fold into one bell notice with a short list, and one toast
  says so (tap it to open the bell; it waits until "Choose your path" closes; a pop like any other). A single notice takes its own channel.
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
- Checks when you touch layout: landscape 740x360, 844x390 and desktop 1280x720 (tools/check.mjs `landscape ...
  (browser, UX-L1)`), portrait 360x740 and 412x915 (game view and each tab); no console errors; no horizontal scroll.
- Landscape: new controls never go on the stage or the side column; the side column holds Next Up, notices and
  the bar only.
