# Onboarding: the guided first ten minutes

ROADMAP Phase 1. A new game starts with the Fight tab only. Tabs, views and a few sections open as
the player reaches them, and a short guide points at what to try next. Old saves see everything.

Code: `src/js/55-onboard.js` (rules and state, core), `src/js/75-onboard-ui.js` (screen),
`src/styles/60-onboard.css`. Checks: the `onboarding` section of `tools/check.mjs`.

## Unlock table (`FEATURES`)

Nothing is deleted: a locked view is left out of the switcher, a tab with no open view is hidden,
a locked section gets `f-off`. Once open, a feature stays open. A tab shows while any of its views
is open (Fight's Upgrades view always is).

| Feature | Where | Opens when |
|---|---|---|
| nextup | Next Up chip | first upgrade bought, or zone 2 |
| party | Party tab (Team) | hero level 3, or zone 2 |
| gather | Gather tab (Mining, Wood, Pack) + the Fight/Gather switch | zone 3 |
| bounties | Fight: Bounties | zone 4 |
| camp | Camp tab (Camp) | zone 5 (the camp opens) |
| forage | Gather: Foraging | zone 5, or Foraging above level 1 |
| craft | Craft tab (Make, Gear) | materials for a first recipe the hero can wear, any item in the bag, or zone 6 |
| bestiary | Fight: Bestiary | zone 6, or 60 kills |
| almanac | Camp: Almanac + the Omen banner | 8 minutes played, or zone 8 |
| roster | Party: Roster | 10 minutes played, zone 7, or someone can be recruited |
| uniques | Craft: Uniques | first unique, 12 minutes played, or zone 10 |
| tavern | Camp: Tavern | 14 minutes played, or zone 8 |
| exped | Camp: Expeditions section | the Map Room opens a slot |
| synergy | Party: Synergies section | two companions in the party |
| codex | Journal: Codex card | zone 10 |
| raid | Camp: Raid + the Raid switch button | zone 12, or any raid damage |
| deep | Fight: Deepwell | zone 18 (it opens at zone 20 and Hearth 3) |

"Minutes played" counts only while the guide runs (`S.onboard.t`).

Safety nets: `setTab` to a locked view (Next Up, an away card, the Almanac, `codexOpen`, switching
to Gather or Raid) opens it for good. Next Up hides goals of hidden systems (`goalGate`, turned on
by the UI only, so the Node tools see every goal). "Show every tab now" in the Journal opens all.

Each opening toasts one line ("New tab: Gather. Mine ore and chop wood."; tabs high, views normal)
and marks the tab ("New") or view button (a gold pip) until it is first opened.

## The guide (`GUIDE_STEPS`)

One hint at a time: a gold marker on the target and one sentence with a dismiss button. The layer
takes no taps except that button, never shows over a sheet or pop-up, and holds still under
`prefers-reduced-motion`. Each step completes by doing the thing; the x also completes it.

| Step | Shows when | Sentence (target) | Done |
|---|---|---|---|
| tap | from the start | Tap the foe to strike. (the foe) | 3 taps (or 25 kills) |
| ability | after tap, ability ready | Shield Wall is ready. Tap it. (ability button) | one cast by hand |
| boss | first boss fight | A boss! Beat it before the timer runs out. (the boss) | zone 2 |
| upgrade | gold for an upgrade | You have gold. Open Fight to spend it. / Open Upgrades. / Buy an upgrade to hit harder. | an upgrade bought |
| tab:party | Party opens | New tab: Party. Tap it to meet your team. | tab opened |
| nextup | after the first upgrade and boss | Next Up shows your best next goal. Tap it. | chip tapped |
| tab:gat | Gather opens | New tab: Gather. Tap it to see what you can mine. | tab opened |
| tab:world | Camp opens | You made camp. Tap Camp to build. | tab opened |
| tab:forge | Craft opens | New tab: Craft. Tap it to make gear. | tab opened |
| recruit | first recruit (or one is possible) | Tobin joined you. Open Party to see your team. / Someone can join you. Open Party. | Party opened after the recruit |

"Skip tips" / "Show tips" is in the bell's Journal (first card while the guide runs).

## Save

`registerState('onboard', { v, all, got, done, seen, tips, t, taps, casts, rec })`. A save with any
progress and no `S.onboard` (every save before this change) gets `all: true`, `tips: false` and
every step done.

## First ten minutes (measured)

Scripted new game in Chromium (warden, fight, cheapest upgrade when affordable, a gather trip
every 2.5 minutes; game time fast-forwarded with the real tick):

| Time | What happens |
|---|---|
| 0:03 | tap hint done, ability hint |
| 0:12 | first upgrade bought; Next Up opens |
| 0:34 | first boss beaten (zone 2); Party tab |
| 1:18 | zone 3; Gather tab |
| 2:14 | zone 4; Bounties |
| 3:21 | zone 5; Camp tab, Foraging |
| 5:20 | Craft tab (materials for a first recipe) |
| 6:08 | Bestiary |
| 8:01 | Almanac |
| 10:00 | Roster |
| 12:00 / 14:00 | Uniques / Tavern |
| 18:43 | zone 7 |
| 21:52 | zone 8: Tobin joins (first recruit); Synergies |

The first boss comes at about 0:35-1:00, earlier than the 3-5 minutes in the brief: that is the
BAL1 zone 1 curve (`node tools/sim.mjs --policy mixed --class warden` idle: zone 2 at 1m, zone 5 at
3m, zone 7 at 15m, first recruit 18m). The unlocks fill the zone 6-7 wall (4-15m) with time rules.
`check.mjs` asserts: first upgrade affordable under 1 minute, Party and Next Up by 2, Gather and
Bounties by 4-5, the rest of the early set by 11, and no gap over 3 minutes in the first 10.

Screenshots: `img/onboard-*.png` (360 x 740; `onboard-wide-*` at 1280 x 800 and 915 x 412;
`onboard-18-old-save` is the late fixture with everything open).

## A cold Hearth (new games since H1)

Since H1 (hearth-and-hands.md 1) a new game opens at an unlit fire (`55-hearth.js`). Warm saves
(every save made before, all fixtures) keep the tables above; the rows below apply only while
`hearthCold()` is true.

| Feature | Opens when (cold saves) |
|---|---|
| gather | from the start |
| camp | the fire is lit |
| craft | the Workbench is built |
| tavern | the Tavern is built |

| Step | Shows when | Sentence (target) | Done |
|---|---|---|---|
| chop | unlit, gathering | Tap the tree to chop faster. (the tree) | 8 Oak, or lit |
| light | unlit, 8 Oak or zone 2 | Tap the fire to light it. (the fire button) / Tap Gather, then light the fire. | lit |
| tap | lit, or fighting | The road is dark. Tap a foe to strike. (the foe) | 3 fight taps or 25 kills (chops do not count) |
| bench | the Workbench plot is open | Build the Workbench. It makes tools. (its card) | Workbench built |
| tool | the Workbench is built | Open Craft. / Open Make. / Tap the Workbench. / Make a Copper Pickaxe. | any tool made (the `crafted` event) |
| forge | the Forge plot is open, tool done | Build the Forge for your weapon. (its card) | Forge built |
| store | the Storehouse plot is open (H3) | Your packs are nearly full. Build a Storehouse. (its card) | Storehouse built |

`tab:gat`, `tab:world` and `tab:forge` are done from the start on a cold save. Measured by the
`cold hearth` section of `check.mjs` (warden, a player who taps, buys the cheapest upgrade and
gathers what the next build waits on, in short trips): fire lit 0:16, Next Up 0:31, zone 2 and
Party 1:12, Workbench 2:19 (Craft tab), first tool 3:00, Forge and first class weapon 5:08, zone 3
5:16, zone 4 and Bounties 6:55, Almanac 8:01, zone 5 and Foraging 8:29. Screenshots:
`img/hearth-*.png`.
