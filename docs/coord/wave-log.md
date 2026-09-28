# Coordinator wave log

## Wave 1

- K1 crafting data merged. Notes for K4: item fields `a: [[affixId,q]]`, `mw`, `rf` (Focus `f` dropped).
  Haste per point (0.05% cd) looks too small vs the trinket base line; tune in sim. `gainSkill`
  unlock message in 50-sim.js is hard-wired to ore/wood (K5). Tonic Mending Draught needs a `heal`
  modifier key (Stage C).
- K2 crafting icons merged (12x12, `iconURL(...craftIcon(name,t))`), gather node rigs `node:crystal|fibre|herb`.
  Renamed K2's `CRAFT_NODES` to `CRAFT_NODE_RIGS` (clash with K1). Polish later: `mat_fibre` reads as a
  bone, `mat_hide` a little turtle-like.
- Q1 away report + Journal merged. New systems add offline lines via `on('away', r => ...)` or
  `registerAwayLine(r => {icon, txt, sub})`. `S.stats` added. Tavern "Lifetime" block moved to the
  Journal (local stats only; no online code touched). Journal sits 3rd in World: consider a shortcut.
- B6 merged: rigs for all 18 companions, `STORIES`, `BIOS`, `JOIN_LINES`, `QUOTES`, `RARITY_FRAME` in
  21-stories.js; preview prototypes/roster.html. Grenna/Anselm/Vesper wield maul/handbell/lute as their
  role weapons (brief wins over the generic shield/tome rule). Polish backlog: shared skin ramp shades
  faces very red at 1x; Vesper's lute body hidden; Corvin needs more bone-white.

## Art direction reset (owner feedback, 2026-09-27)

Owner dislikes the current character art: "too thin and tall", clothing/armour "doesn't feel right",
maybe the overall style. Art work is paused. A style study (A chibi ~3 heads, B 16-bit JRPG ~4-4.5,
C sturdy storybook ~5, D art director's wildcard) with redesigned layered costumes goes to the owner
as a phone-viewable page; the pick then drives a conversion wave. Logic work is unaffected.

- D1 specs merged (camp, expeditions, deepwell, almanac, codex, constellations); decisions recorded in the vision.
- B0 shared core done by the coordinator (addBonus/bonus, deviceDay/deviceWeek, awayHours, skillXp:<k>, yield:<fam>).
- B1+B3 roster merged. T1 ok (Lightkeeper 1 zone fast: Stage A hero-damage transfer), T2 fails (forge
  runaway, M6), T10 fails (caps every ~8 zones), T9/T11 pass. Full Party achievement now counts roster.

## Wave 2 (launched)

B2 synergies, B7 unlock avenues, B5 Party tab, K4 items core, M6 pacing + `--days` sim, Next Up, Almanac.
The art style study is still running (owner leans 16-bit; wants clear section definition).
- K4 items core merged (41-items.js). Exact dps equality on all 4 fixtures. Bag = 50 unequipped
  (coordinator aligned the forge UI to bagFull()/bagCount()). K5-K8 notes are in the K4 report; key
  ones: trophy gate unenforced, equipChar + one-wearer rule, unequip on class change, iconFor/slotStats
  need the CRAFT_KINDS path, nodeTime treats non-ore as wood, spell power not applied to abilities,
  roster should use charGear(id) once companion gear is live.
- B2 synergies merged. ISSUE: `SYN_TUNE.today = 0.1` scales every synergy to 10% of its design value
  (texts still show design numbers), because full strength (about x2.3) broke T1. Synergies are nearly
  cosmetic until retuned. Plan: after M6 lands, a retune task lowers `ROSTER_TUNE.base`, raises
  `today` to about 0.5 to 1, and makes texts show the numbers the player actually gets. autoField ignores
  synergies. The K4 exact-dps check now runs with `SYN_TUNE.on = 0`.
- Next Up merged (55-goals.js registerGoal/topGoals, strip on Fight tab, away-card block with Go buttons via a small generic edit to 75-away.js: lines may carry group and go).
- B5 Party tab merged. Coordinator fix: the sheet now reads B2's SYNERGIES array (it expected an object), so 'needs X' chips show.
- Art style study merged (A chibi, B1 16-bit bold outline, B2 16-bit soft outline, C storybook,
  D lamplit) and published for the owner: https://claude.ai/artifact/4w567kZ5vdzP6dsw1ahagB
  Art director recommends B1 + D's lantern lighting. Conversion is about 6-8 agent-days: outfits
  rewritten relative to body anchors; bones, poses, tiers and lights stay. Waiting on the owner's pick.
- B7 unlock avenues merged (56c-unlocks.js; leads(), Renown, tokens with pity, Tavern visitor, joining
  overlay). T17 passes. T16: Rare 17-23m ok, Epic 1.5-2h ok after moving 4 gates (UNLOCK_TUNE, marked
  `(sim)`), Legendary 2.1-2.6h (want 6-12h) because gold runs away: fix through M6 pacing, then recheck.
  The sim now claims bounties (needed for Renown), which pushes T1 above band (16/23/34); M6 retune must
  use the new sim. Sim `Date.now` follows sim time; `--day N`, `--unlock path=v`, `--bounties 0`.
- Almanac merged (19 Omens live, 16 deferred until their systems exist; 4 Dares; weekly board).
  Coordinator fixes: heroDps keeps the exact old expression when nonCrit = 1 (K4 bit-equality), the
  crate test sums every material family, weekly goals register with Next Up's shape (sys, go -> {tab}),
  and the boss timer bar divides by the real boss time. Reward stand-ins (Essence for Trophy/Renown,
  a 1.5x crate for Depth Marks) should be revisited when K5/Deepwell land.

## Owner decision: art direction B1 (2026-09-27)

B1 (16-bit, about 4 heads, full ink outline, section lines, flat 3-tone materials) is the owner's pick.
Plus more lanterns and lamps dotted around the maps. Art conversion wave follows.

## Wave 3a (launched)

AR1 B1 art foundation (baker port, per-circle outfit files, 4 classes, 5 study companions ported,
interim B1 for the other 13, 2x stage, portraits, lantern lighting, new art-direction.md).
AR-S B1 scenery with lanterns in every theme. K6 crafting actions (55-crafting.js; companion gear
goes live). K7 Craft tab UI. M6 pacing still running. Next: AR2 companion polish per circle file,
enemy pass, K5/K8 gathering, Camp, Expeditions, Deepwell, Codex, synergy retune after M6.

## Standing orders from the owner (2026-09-27)

- Keep iterating overnight until the owner says stop (hourly check-in routine at :38).
- When the current plan is finished, write the next one: play-test the build (sim `--days`, browser
  screenshots of a new game and the fixture saves), find what is weakest for long-term enjoyment,
  write `docs/design/plan-<n>.md`, record it here and in the vision, then execute it.
- Priority: finish the B1 art conversion under way (foundation, scenery, companion polish, enemies),
  then focus on gameplay. Art comes after, except the art a new gameplay system needs.
- Speed and smoothness are checked constantly (owner, 2026-09-27). After each merge wave run
  `node tools/perf.mjs --quick` (once the PERF task lands) and fix any budget failure before new features;
  every agent brief says to keep per-frame and per-tick work cheap.
- Preview build for the owner: https://claude.ai/artifact/JHKGxG17HxZyA2Prit4BxS (private, no online
  capabilities, its own save). After each merge wave: build, copy dist with title "Lanternfall Preview" to
  the scratchpad preview/lanternfall-preview.html, and republish to that URL. Never publish the live artifact.
- Decisions that belong to the owner (art direction, monetisation, anything irreversible) go under
  "Waiting on the owner" below instead of being guessed.

## PAUSE REQUESTED BY THE OWNER (2026-09-28)

When the three running tasks (C4 combat visuals, BAL2 balance, R0 regions) are merged: do NOT launch
any new tasks. Build, check, republish the preview, and show the owner the latest version with a short
summary. Resume only when the owner says so.

## Queued for after the pause (owner feedback)

- Expeditions feel locked with no explanation: until the Map Room exists, the Roster board (and the
  bench sheet) should say "Build the Map Room (Hearth 2) to send companions on expeditions", with a Go
  to the building. Consider a Next Up goal for it once Hearth 2 is reached.

## Waiting on the owner

- Late-game direction for plan 2 (asked 2026-09-27): which of these to prioritise? Region 2 with new
  rules (tides), legendary build-defining effects + circle sets, Oaths (player-chosen zone difficulty),
  pinnacle bosses (after Stage C), a visibly relit world map, a companion endgame (Lanternborn forms,
  bond stories), Deepwell heat levels. Coordinator recommendation: Region 2 + Oaths + legendary effects/sets.
  If there is no answer by the time the current plan ends, go with the recommendation.
  -> Plan 2 went ahead with the recommendation (Coast, then Oaths + legendaries, then pinnacles). Also
  decided by the coordinator on the designer's advice: a one-time welcome for old live saves (the Hearth
  is built up to what their zone allows), a real-clock tide, rank 8 at the Coast lantern, saves past
  zone 35 move to the Coast at once, Oaths give no extra XP. Still owner-gated: the first festival and
  the companion endgame.

PR: https://github.com/CalSay/Lanternfall/pull/1 (draft; update its description at milestones).
- Owner bug: upgrade buttons ignored taps. Cause: setPrice rebuilt the price spans about 5x/s, and
  a press on the price lost its target. Fixed (update in place, `button * {pointer-events:none}`);
  slow-press test 0/20 -> 20/20. The same bug is live on main until this PR merges.
- K6 crafting actions merged (55-crafting.js: craftItem/canCraft, upgrade with trophy gate, reforge,
  transmute, equipChar with one-wearer rule, tonics, Star Chart -> Oriel; companion weapons use
  charGear). Notes: transmute-down chains are exploitable (1 tier-5 -> 16 tier-1): limit it in K9.
  Hide has no source until K5, which blocks G1/G2 for three classes. The Oriel hint text in 56c still
  says "The table is not built yet". The T1 sim was already above band (16/26/34) before K6.
- AR-S scenery merged: 10 themes in B1 at 2x with lanterns, scene.lights, moths; no stage edits.
- K7 Craft tab merged ("Forge" renamed "Craft", tab id stays `forge`). Coordinator fix: the away report
  names new item kinds (it used SLOT[slot].n). TODO (small, for K8 or a polish task): the Next Up forge
  goal still suggests legacy Sword/Helm via SLOTS/craftCost; switch it to class kinds via canCraft/fits.
- M6 pacing finished (PACE table in 40-rules.js; R1 boss day 1.8-2.8, R2 boss day 10.8-13.8; T2 fixed;
  T10 still fails and needs a roster design change; Region 3 needs new power: ranks past 7, tier 6,
  Constellations). Merge conflicted with K6/K7, so M6 is re-merging in its worktree and applying the
  Elowen tune. FOLLOW-UP: live saves at zones 2-59 face much more HP after M6 (x10 at zone 35); add a
  gentle "drop to the best zone you can farm" on load or with auto-progress so idle income doesn't stall.
- Owner feedback: the menu area is too small (lots of scrolling) and toasts cover the menus. A UX agent
  owns layout and notifications (bottom tab bar, shorter/collapsing stage, overlays, toast priority and log).
- Owner feedback: uniques overshadow crafted gear. Cause: every unique rolled Legendary power (x3.2,
  above a crafted Epic's x2.5) on top of its effect, and dropped 35% on first kill / 12% on every
  rematch. Change (`UNIQ_TUNE` in 20-data.js): base power at Rare level (x1.8), drops 15% first /
  4% rematch, and half chance when you already own it at that tier or higher. The effect is now the draw.
  Existing uniques lose raw power (deliberate balance change the owner asked for; no item is removed).
  The K4 exact-dps check pins `UNIQ_TUNE.pow = 3.2` for its pre-change baselines.
- Owner bug: "quests" (bounties) never moved. Mining/chopping bounties only counted your best
  unlocked tier and ignored away gathering. Fixed: any tier counts, away gathering counts, and new
  families don't count as logs. Regression check added.
- M6 merged after re-merge. `--targets`: T2, P1, P2, P4 pass; T1 fails for Warden only (15/25/35: the
  warblade is crafted at the fast Smithing station, a K6 class-gear parity issue); T10 fails (structural);
  P3 needs Region 3 power. Warden curve: d1 35, d2 46, d7 57, d12 70, d16 77, then plateaus at 78-79.
- AR1 B1 foundation merged. Outfits now live in per-circle files: 12a body kit (art lead), 12b heroes,
  12c hedgefolk, 12d oath, 12e dusk, 12f wayfarers. 12-art-rigs.js is deleted. Interim-quality
  companions: Wren, Hesketh, Pip, Bram, Aldric, Anselm (bell reads as a sack), Caedmon (shield hidden),
  Kestrel, Isolde (mask hides face), Oriel (faint collar), Thessaly, Morwen, Vesper. Enemies are old
  rigs at half scale. Stage issue seen in stage-b1.png: the four party members overlap into a clump,
  so they need more spacing. Agents must use their own scratchpad subfolders.
- Camp core merged (57-camp.js, 75-camp-ui.js; the World tab is now the Camp tab, id still `world`).
  Opens at zone 5 with a free Hearth 1; the Watchtower is the first build; full camp in about 16+ days
  (estimated without `--days`: retune with the M6 sim in a later balance pass). Families without a
  source yet cost ore, wood or essence until CAMP_LIVE flips (K5 should flip crystal/fibre/herb/hide/troph).
  Hooks for Expeditions (registerBenchStatus/Send, bonus('expSlots'), registerCampAction('maproom')),
  Codex (setBlessingGate, Library action) and camp scene art (CAMP_SPOTS, campBuilds) are documented in its report.

## Owner decision: slower pace (2026-09-27)

"The pace still feels far too quick. Party members are far too easy to get. Damage ramps so fast."
(The owner plays the live game, which has neither M6 nor the roster, but the direction applies to
the branch too.) New targets, handed to the balance pass (BAL1):
- T1: zones 6-9 / 10-13 / 15-19 at 30m / 1h / 2h; end of day 1 around zones 20-26; T2 <= 24 at 3h.
- Region 1 boss on day 4-8; Region 2 boss in 3-6 weeks; P4 (never more than 3 empty check-ins) kept.
- Recruits: first after the starter at 15-30 min, first Rare 1.5-3h, first Epic day 2-4, first Legendary week 2-3.
- Damage ramp: flatten the exponential milestone steps (x2 per 25 upgrade levels, x2 per rank,
  +5% per hero level, gear tier jumps) and steepen costs, without creating dead time.
- AR2b merged: Kestrel, Isolde, Oriel, Thessaly, Morwen, Vesper at reference quality (Vesper's lute moved to her front so it reads; accepted).
- AR2a merged: Wren, Hesketh, Pip, Bram, Aldric, Anselm (real bell now), Caedmon (burning shield reads). All 18 companions at B1 quality.
- K5 gathering merged (55-gathering.js: crystal/fibre/herb nodes, Foraging, hide + signature drops,
  home ground, champions from zone 20, trophies, Glint, offline credits). G1 and G9 pass; G2 spread and
  G6 (Ranger blocked on wood) need K9 sim work. Class runs now push much faster (Warden zone 48-64 at 2h)
  because class gear is craftable: BAL1 was told. Coordinator flipped CAMP_LIVE on for crystal, fibre,
  herb, hide and trophies. K8 Gather tab redo and Glint-on-stage are still to do.
- UX layout merged: panel 36% -> 56% of a 360x740 screen (62% scrolled), bottom tab bar, zone/HP/DPS
  overlaid on the stage, one mode + zone row, stage collapses to a 124px strip on scroll, toasts only
  over the stage with prio (high/normal/low), "+N" merging and a bell log. The compact stage assumes the
  ground line at 80% of the stage height (update `.app.compact .stage` translateY if 62-stage moves it).
- Owner feedback: menus are cluttered with lots of scrolling as systems pile up. Next: an information
  architecture pass (sub-tabs per tab, one section at a time, progressive disclosure).

## Owner decision: game-first layout, no forced landscape (2026-09-27)

The owner first picked landscape-only, then withdrew it: don't force landscape. Direction: the game
scene is the main view in portrait; each tab opens as a full-screen menu over the game (with sub-views);
landscape and desktop show the game left and the menu right, responsively.
The owner's "wait" stopped two agents: the menu restructure (IA, no work saved) and the enemy + stage
spacing pass (AR3, 6 uncommitted files left in its worktree). The owner then said "restart everything, I only meant wait about landscape": all four stopped tasks
(menus, AR3, BAL1, Expeditions) were relaunched; AR3 and BAL1 continue from WIP commits on their old branches.
- Owner bug: a Ranger could equip a sword. Cause: K4 made legacy Sword/Helm fit every class to protect
  saves. Fix in progress (RETOOL agent): on load/class choice, legacy swords and helms become the class's
  own kinds (same id, tier, rarity, +N; never less damage), only class kinds fit, legacy can't be crafted,
  and a Mirror of Embers switch retools instead of unequipping. Weapon/helm uniques stay usable by every class.
- Owner: speed and smoothness must be checked constantly. PERF agent builds tools/perf.mjs (throttled-phone
  frame times, load time, long tasks, heap growth, tap latency), a budget in docs/design/perf.md, and a first pass.
- RETOOL merged: old non-unique swords and helms become the class's kinds on load and on class change
  (the `rt` field keeps the old base lines, so dps is identical); only class kinds fit; legacy kinds
  can't be crafted; the sim needs `--class` to forge weapons now. Coordinator fix: a blank stage after
  long absences (ellipse radii could go negative and throw every frame; three guards in 62-stage.js
  and 61-anim.js).
- Owner idea: with full-screen menus the game view has room for a proper combat HUD: party and enemy
  health bars, hero and companion ability cooldowns (spec 7.4). Queue it as the next stage task after
  AR3 and the menu restructure land, and fold it into Stage C (party combat), where HP actually matters.
- AR3 merged: all enemies, elders, the wyrm and nodes in B1; the stage zooms in whole-pixel steps
  (2/3/5 CSS px per art px by size); formation spaced out; floating text stacks and stays under the header.
  B1 art conversion is DONE. From here: gameplay first.
- Expeditions merged (57b-expeditions.js, 18 routes, seeded hauls, repeats, Call back, shortcuts; tuned
  slower: an 8h Good run is about 22 min of active gathering). Coordinator: characters on an expedition
  can't be fielded. Still open: an "Out" line on Party tiles, expedition sim policy (E1-E10), route icons, lore texts.
- Owner bug: party sorting. The single Rarity/Level toggle read as random, locked characters never
  sorted, and the whole grid was rebuilt on every level change (eating taps). Fixed: Power/Level/Rarity
  chips (default Power); Rarity mixes locked and recruited; Power/Level put locked ones by closeness to
  joining; tiles rebuild only on structural change, and levels update in place.
- Menus merged: portrait is game-first (the stage fills the free space: 71-77% of the height), each tab
  opens a full-screen menu with sub-views (Fight: Upgrades/Bounties/Bestiary; Party: Team/Roster; Gather:
  Mining/Wood/Foraging/Pack; Craft: Make/Gear/Uniques; Camp: Camp/Tavern/Almanac/Raid), the bell sheet
  has Notices | Journal (with Achievements), wide screens split game left / menu right. API:
  registerView(tab, {id, label, order, dot}), registerSection(..., {view}), setTab(tabOrView, sel),
  closeMenu(). Not done yet: card-level progressive disclosure (hero rows, camp list, almanac cards).
  Follow-up: on tall portrait stages the sprites are small with empty sky; scale the party and foes with
  height, and use the room for a combat HUD (party/enemy HP bars, ability cooldowns) (HUD task).
- HUD merged: height-aware zoom (phones now 3 CSS px per art px), party/foe HP bars, ability gauges,
  status chips (Guard, Blessing, Focus, Embers, buffs), boss "!" telegraph with a wind-up ring, a Glint
  sparkle, a 60px ability button with a cooldown sweep, and a HUD toggle (S.settings.hud). Stage C
  hooks to fill: unitHp(key), unitCd(key), bossTelegraph() (defaults in 55-party.js).
- PERF merged: `node tools/perf.mjs` (full, ~7 min) and `--quick` (phone, ~40s); budget in
  docs/design/perf.md. Phone fight fps 40-43 -> 49-54, Party first open 1.1s -> 0.4-0.5s; the scenery
  vignette/fog is cached, frames bake lazily with idleTask, the next zone prewarms during boss fights,
  and autosave is skipped while hidden. Behaviour fix: background tabs no longer eat away gains. Still
  over budget on phones: Party/World tab first open, long tasks while fighting (70-ui ui()/uiFight
  rewriting unchanged DOM 5x/s, setHp forcing layout per kill). PERF2 task launched for those hotspots.
- Codex merged (57c-codex.js: 12 pages, 930 Light today, milestones with titles/hints/+1 expedition slot,
  Seals capped at 5% per stat, Blessings gated by pages; UI is a 90% sheet opened from the Journal, the
  Library and Next Up). The hero title line on Party cards is still to do (75-party.js owner).
- `perf.mjs --quick` after the Codex/HUD merges: 9 metrics over budget on phones (fight frame-gap p95
  about 50ms, long tasks, tap about 190-260ms, camp-roster update up to 84ms). The machine was busy
  (BAL1 and PERF2 running), so the numbers are noisy. PERF2 was given these numbers; nothing new is
  started in its files until it lands.
- PERF2 merged: guarded DOM writes (putText/putStyle/... helpers in 70-ui.js), only visible views
  update, HP bar via transform, cached stage rect, chunked roster/camp builds, recipe rows reused.
  Every tab opens under 150ms on the throttled phone; ui() p95 about 3.3ms. Still over budget on phones:
  steady-fight frame gap (the canvas raster: 63-scenery scales 5 parallax layers per frame; hotspot 7),
  the boss-kill spike (hotspot 10) and first frame on the late save (hotspot 11). PERF3 launched.
- Deepwell merged (57d-deepwell.js: unlock at zone 20 + Hearth 3, a Deepwell view on the Fight tab, 37
  boons plus 6 live sets (9 [C] boons wait for party combat), Oil, landings, Marks shop, 12-rule weekly
  Trial). Coordinator APPROVED the scaling change: foe HP anchors on "a foe your party kills in 3.75s
  at run start" with 0.7 zones per floor (runs 8-12 min, about 75 Marks). Follow-ups: D8 miss (Deep Lore
  adds only about 3%: add a Deepwell-only damage or drain upgrade); stage owner adds a real `well` theme,
  hides the zone HUD natively, a cold foe palette, lantern colour/trail from S.deep.eq, and camp
  decorations from S.deep.cos. Note: runs set S.activity = 'fight' and restore it on exit.
- BAL1 merged (the owner's slower pace). --targets: 8/9 pass. T1 warden 9/11/16; Region 1 boss day
  5.3-7.3; Region 2 boss day 28-32; recruits: first 17-25m, Rare 1.5-2h, Epic day 2.3-2.8, Legendary
  day 15-17. Damage flattened (companion x1.06/level, promotion x1.5, blade x1.5 per 25, hero +4%/level,
  gear 10/22/42/75/130). Synergies at full strength with truthful texts (the best line-up is about 2.5x a
  random one). Class parity 0.86-1.09. Drills every 5 levels (x1.1). Transmute-down no longer chains.
  55-pace.js falls back to a farmable zone. Camp re-costed (first build 17-36m, full camp day 21-24).
  Companion XP now tracks time fighting (banks up to 25 levels at cap).
  Coordinator decisions: ACCEPT D1 at about 18-19 (target 20-26; the owner wants slower, and every lever
  broke another band). Follow-ups: autoField ignores synergies; the Warden aura gives no damage until
  Stage C; Region 3 needs new power (plan 2); the Ranger camp sim doesn't refarm Soft Hide.
- Next: Stage C party combat (unblocked now).
- UI polish merged: "Away" badges and an "Out: route, 4h" line for expedition characters (their Field
  button is disabled), the Codex title under the hero name, a shared disclose() helper (tap for details)
  for hero upgrades, the boss gate, camp buildings, Hearth costs, the Roster board and weekly goals
  (scroll -14% to -54%), tidier Gather views with a status strip and "where to get it" material sheets.
  Follow-up: check.mjs has date-dependent tests (today's Omen changed Reforge prices); pin the Omen for
  the whole check run so a new day never breaks CI. Small targets left: Omen Go (36px), synergy chips
  (36px), the Expeditions section.
- Onboarding merged (55-onboard.js FEATURES table, isUnlocked(id), `feature` on views/sections; a
  10-step hint guide; old saves see everything). A new game unlocks something every 1-2 min early; the
  first recruit lands at about 22 min. The first boss falls at 0:35-1:00, which is zone-1 difficulty (a
  pacing note, not a bug). "Skip tips" / "Show every tab now" live in the Journal.
- Constellations merged (57e: 4 maps x 31 stars, 4 keystones each, max 2 lit, 2 layouts, free reset;
  the Party > Stars view unlocks at hero level 10). Best builds add about +7/+20/+34% at L20/40/60.
  Hooks for the combat owner: route the `tune:<knob>` bonuses in 55-party.js through tn() (guardT, wallT,
  wallPause, wall, flare, flarePerEmber, hasteT, bless, hymn, hymnT, lkShare, lkAura, autoEff, autoCd) and
  implement the keystone flags (starKeystone(id), STAR_KS). Until then Dawnbringer is too strong, Pack
  Leader has no cost, Sanctuary Hymn has no upside, and Glass Lantern lacks its Flare bonus. Forwarded
  to Stage C. Coordinator fix: onboarding treated a feature unlocked at play time 0 as locked (!= null).
- PERF3 merged: packed 1:1 scene plates and cached glows (phone/new fight 31 -> 55 fps, 0 long tasks;
  phone/late 26 -> 42 fps), a prewarm that now actually hits (the kill frame drops from about 150ms to
  about 20ms), and lazy tab mounts (first frame about 1.1-1.3s). phone/new and desktop are within
  budget; phone/late still over (fight frame-gap p95 about 40ms, the scene build on a player zone jump,
  Camp first open up to 154ms). CONTRACT CHANGE: a section's mount() now runs on its tab's first open;
  keep on() handlers outside mount. Coordinator resolved a 70-ui.js conflict (lazy mounts + onboarding
  `feature`) and smoke-tested every tab (no errors).

## Plan 2 (started 2026-09-28)

See docs/design/plan-2.md. Wave 1 started: D2 pinnacle spec and Q1+D3 quality fixes plus the old-save welcome, now;
C4, C6, AF, R0 and BAL2 after Stage C lands.
- D2 pinnacles.md merged (Hollow King, Lurelight, First Fire, the Climber; open after the Drowned Keeper + Oath 15, about day 33-40). Coordinator accepts its recommendations: live-play kills only, an Assist switch (1.5x wind-ups, full rewards), Boss of the Week pays a Seal + stamp only. Section 12 lists hooks Stage C needs in 59-combat/59b-enemies.
- Q1 + D3 merged: the out-of-reach upgrade hint ("Best spent on recruits now"), the Watchtower hint via
  partyHoldEstimate (it guessed the return shape: verify when Stage C lands), one "What's new" bell
  notice for old saves (emit('whatsNew', ...)), 44px targets (Omen, weekly board, synergy chips,
  Expeditions), the Omen pinned for the whole check run, and 55-welcome.js (old saves without a camp get
  the Hearth up to what their zone allows, free, once; save-v2-late gets Hearth 8 with 2 builders).
- R2-6 Coast writing merged (21b-stories-coast.js: COAST_ARRIVAL, COAST_STORY beats 0-5 with notes, head
  and say lines, KEEPER_LINES, COAST_LORE bands VI-X, COAST_BOUNTY_TEXT {crab, pearl, beam},
  COAST_OMEN_TEXT {springTide, calmSea, pearlMoon}). Canon: the Keeper is Silas Penrow, writing to Old
  Hallam. R2-3/R2-7 must use these keys. The PB4 writer should know the Keeper's name and the light
  Lurelight foreshadowing. The Codex must settle the "Letters from the Coast" title clash.
- PB0 + PB4 merged (21d-data-pinnacle.js, 21e-stories-pinnacle.js; checked for fairness caps and
  timings). Coordinator accepts its gap fills: Lure Song charm 3s, Ash Fall 8s, riders capped, Weight
  of the Crown at most 1 stack/2s, 8 named Oath sets (levels 10-14) for Boss of the Week, and PIN_POWERS
  living in 21d until 21c-data-legend.js exists (L1 imports them).
- L1 + L5 merged (21c-data-legend.js: 43 powers incl. the 4 pinnacle ones by reference, 4 circle
  sets, costs, caps; 11b-art-legend.js: icons, sigils, orange frame). DESIGN ISSUE: the section-6 caps
  (+30/+45/+70% at rank I/III/V) cannot hold if 6-piece circle sets (+12-18%) stack on top of the
  powers; the data check passes only with sets counted at 0. COORDINATOR DECISION for L2: enforce the
  caps at RUNTIME. All legendary power + set damage multipliers are summed into one legend budget and
  clamped to the cap for the player's highest rank, and the UI shows "capped" when a build hits it.
  Sets stay valuable through their non-damage effects and by letting weaker powers reach the cap.
  L6's sim verifies L4/L5. Pick one legendary colour: use #FF8A3D and update --r-legendary.
- 02:5x UTC: the account usage limit stopped all three agents (Stage C, PERF4, L2); it reset at 03:50.
  At 04:39 all three were resumed with their context and uncommitted work intact (Stage C had 4 commits
  plus WIP, PERF4 12 changed files). Nothing was lost.
- PERF4 merged: a two-lane idle queue that runs even when busy, scene builds in small steps, lazy enemy
  bakes, a 12-35% faster rasterize, a lighter boot (away gains after the first frame), and staggered
  mounts. Found and fixed: the Deepwell's drawScene wrapper dropped arguments and silently disabled
  PERF3's fast path for everyone (perf.md rule 14: wrappers must pass every argument). Phone medians:
  fight 52/48 fps, 0 long tasks, first frame about 1.05-1.08s; almost everything within budget (the boss
  zone jump on late saves sits at the edge).
- L2 merged (55-legend.js: Book, drops (an unknown power drops as a wearable/learnable item, a known one
  becomes an Echo or a rank), Learn/Inscribe/Mark/Sigils, the 2-power hero limit, the runtime cap via
  legendBudget/legendScale (raw +50-76% clamps to +30/37.5/45/57.5/70%), owed rolls). Pearls are not
  charged until Region 2 adds them; the coast-elder grant is for Region 2/O1 to call. L3 (combat) and
  L4 (UI) needs are listed in its report: L4 launched now; L3 after Stage C. ARCHITECTURE.md still needs
  the 55-legend row and events (L4 adds them).
- STAGE C merged (59-combat.js, 59b-enemies.js): packs of 3, HP/armour/shields, reach, threat,
  healing, CC, KO/revive, wipe -> retreat one zone and push back, zone-type behaviours, elites from
  zone 15, boss telegraphs with tap parries, partyHoldEstimate() driving away gains/fall-back/hints,
  live combat gear stats, partyCombatOn() (Deepwell [C] boons now in the pool), Constellation knobs and
  keystones wired. --targets 12/20. Coordinator calls: ACCEPT T4 (35% vs a 20-35% band, a rounding
  miss). T11/T18/D1/P4 go to BAL2 (BAL1 tuning). T6 (no-tank line-ups still hold) and T12 (attrition line-up
  too slow) are REAL role-design gaps: BAL2 must make tanks and supports matter (COMBAT_TUNE hp/atk/heal).
  C4 (stage visuals for packs, threat, heals, KO, telegraph colours) waits for the Deepwell-visuals agent
  to release 62-stage/61-anim. Save: S.combat {on, back, tip}.
- L4 merged: Craft > Powers view (your powers, the Lantern Book, Inscribe sheet, circle sets and Sigils,
  a Capped chip), item-sheet Learn/Inscribe/Mark, the 2-power "Take off X?" question, Party pips, Sets
  chips, the Codex Legendaries page (page 16). Powers opens on the first legendary or Sigil (a "late"
  feature, so it stays hidden on old saves until then). --r-legendary is now #FF8A3D. Also fixed: the
  hero card showed off-hand/body as "coming soon" even when worn. L3 should mark combat-only powers
  "with party combat" until wired.
- Deepwell visuals merged: the `well` theme (stone shaft, stair, rope and pulley, ladder, lanterns on
  brackets, a cold glow below, drips and rising motes via the packed-plate path; bakeOnly glows), the
  stage natively hides the zone HUD during runs, cold recoloured well foes (colder every 7 floors), and
  Deepwell decorations as icons on the Hearth card. Coordinator ACCEPTS lantern colour/trail showing
  everywhere (a bought cosmetic should show). Perf within noise.
- AF line-up planner merged (56d-autofield.js bestLineup/lineupScore/applyLineup; autoField uses it;
  Team view "Best line-up" button with a preview and a why line, e.g. "Hedgefolk, a tank for the
  bruisers. +60% damage over yours."). It shifts pacing: T2 26/24/24/24 (FAIL), P1 4.3-8.8 (FAIL), P2
  22-24, P4 PASS, T4 PASS. BAL2 was told to retune with the planner merged.
- C4 combat visuals merged: all 3 pack foes with bars (champion crown, elite mark), threat pips and
  dotted lines with a red "left the tank" flash and a Show targets toggle (S.settings.targets), pooled
  party numbers (hits, heals, shields, BLOCK/PARRY/DODGE/STOPPED), dashes, Kestrel's leap, bat dives
  with a tank intercept, casts, heal motes, knockback, KO/stand-up, a wipe "Fall back!" retreat, all
  telegraph colours, and reduced-motion variants. JS/frame unchanged; frame gap noisy on a busy machine.
  Follow-ups: unitHeal could carry `from`; pack foes overlap somewhat at 360px.
- R0 merged: REGIONS (Hollow 1-35, Sunken Coast 36-70 with placeholder types/names until R2-1 plugs
  REGION_COAST into 22-data-coast.js), region-aware zone functions and readers, 55-lantern.js (S.lantern),
  the Great Lantern card at the zone 35 boss (a What's new line for old saves), Constellations' +4 points
  through emit('greatLantern'), and the Lantern Road strip on the Camp view. Coordinator resolved a
  62-stage.js conflict: kept C4's pack drawing and applied R0's zoneHue for foe sprites. R2-2/R2-3/R2-7
  notes are in the R0 report (BEH_EST length, coast champion trophies, the Coast card rewards, the Codex
  zones page).
- BAL2 merged: --targets 19/20 on seed 1 (only D1, which was accepted). Roles matter: no tank is 3
  zones lower, no support 4 lower; attrition reaches zone 20 at 1.20x. Supports Smite; tanks take 40%
  less; wipes retry the push with backoff; catch-up 8.6 min; T18 6-8 min. Knobs are in pacing.md section 11.
  Queued follow-ups: the planner should weigh single-target damage when a zone boss is next (Lanternmage
  lags on seed 2); planner field flapping; the Warden T2 surge at 2-3h; the day-30-35 roster cap plateau
  (Region 3 power, plan 2).
- PAUSED as the owner asked: all three tasks (C4, R0, BAL2) are merged. No new agents until the owner resumes.
## Plan 3 (started 2026-09-28)
The owner resumed with seven asks (tools shown, solo gathering, gathering scenes, a party of 3 with the hero
as Front/Middle/Back, a cold Hearth start with stations you build, NPC gatherers, a Storehouse). Owner
decisions: the hero is one of the three; the Storehouse caps what you HOLD from every source, active
gathering included, but skill XP keeps counting. The remainder of plan 2 is folded in, in build order:
see docs/design/plan-3.md. Wave 1: D6, D7, G1, G2, W6b.
- D7 hearth-and-hands.md merged. Coordinator accepts all 15 section-9 recommendations: rough tools are the
  empty slot; mastery per tool kind; no tool affixes; "right tool" is +25%, not a gate; all tools at the
  Workbench; gifts/refunds may exceed the cap (a softening of the owner's rule for rewards only, noted to
  the owner); salvage asks in-page before discarding; migration may give Storehouse 8 and lock an over-cap
  material; Hands REPLACE the never-built bench jobs (told to the owner); Tavern beds, no upkeep, Tam the
  free starter; applicants every 8h (max 3 waiting); off-skill half share; Spiced Broth +5% within +15% camp
  cap; the rod covers Tide Pools (R2 decides); cold start = no progress and no S.camp. Wave 2 merge order:
  H2, H1, H3. The Map Room hint goes with H1.
- D6 formation.md merged. Coordinator accepts all section-9 recommendations: hero floor; damage-only trioX
  1.35 phased in over zones 8-12; old named synergies become Bonds (old saves seeded to level 3/4); circle
  synergies become 2-companion Kin (Hedgefolk gold +5%); migration keeps the planner's best 2 and never pulls
  from the bench; the 12 new Bonds; lanes dropped (cells keep lane: 1). World raid: raiders.dps keeps its
  formula and shape; late values read about 10% lower. That is a value drift, not a shape change, so it is
  accepted without touching the online layer. The festival is renamed LF1 (F1 is the formation core).
  Wave 2 formation: F1 first; F2, F3, F4 in parallel once F1's API is in; then BAL3.
- G1 merged: 11c-art-tools.js (pickaxe, woodaxe, sickle, rod by tier; own swings), toolFor(skill) is a `let`
  for H2 to repoint at equippedTool; the hero gathers alone; 55-rested.js Well Rested (REST_TUNE rate 0.5,
  cap 180s, +10% dmg, zone fights only). NODE_HIT strike fractions in 62-stage heroHome (G2 told).
  Perf noisy, no regression read.
- W6b merged: 59c-deepwell-combat.js (a floor is one pack, HP carried with 25% per cleared floor, a wipe
  ends the run, Oil +5s refunds and +2s per parried wind-up, Taunt Drill any class, Lifeline once per floor,
  D8 Deep Edge +20%/rank). Median depth 19, runs 7-8 min. Follow-ups queued: Overflow boon is dead in packs
  (rework); the arena wipe animation plays behind the run-end card (62-stage); Deep Lore total 10,070 Marks
  (retune in BAL3); run length below the 8-15 min target (BAL3). Perf phone/late noisy on a busy machine.
- H2 merged: 55-tools.js / 75-tools-ui.js (tools at the Workbench, rough tools = empty slot, rare finds, +25%
  right tool, mastery 1-20 per kind). Coordinator wired G1's stage toolFor to equippedTool (rough draws as a
  plain tier 1; the rod falls back to the art rule until the Coast). Accepted: +1% per mastery level from Lv 1;
  find cap 8% on the item plus the Lv 5 point.
- OWNER: gathering levels come too fast; "the next tier up only 4 levels away is too fast". Today NODE_REQ
  [1,8,18,30,45], SMITH_REQ [1,4,9,16,25], skillNeed 25 x 1.12^(lv-1). GP1 launched to re-pace skill tiers.
- LORE1 lore.md merged (story bible: the Lanternfall, monsters are the land soaked by the dark and drawn to
  the light, "a light lit for someone cannot be stolen", Elowen's sparks explain other players, the mystery
  ladder, the sealed ending in 8.6). Fixed Pip's pronoun in 56-roster.js. WRITING TASKS (LORE2-12) ON HOLD
  until the owner steers the premise and answers section 12's four questions.
- OWNER STANDING ORDER: pause all progress when the owner's weekly usage reaches 90%. The coordinator cannot
  read the usage meter; the owner will say "pause". On "pause": launch nothing new, let running agents finish
  and merge (or stop them if asked), disable the hourly trigger, push, and report.
- OWNER USAGE RULE (2026-09-28): the owner uses Claude for work during the week. Weekdays: no new agents,
  no hourly check-ins; only answer the owner. Weekends: full speed (any usage left is fair game). The
  current batch (G2, H3, F1, GP1, H1) finishes now, on the tail of this week's allowance; then pause until
  the weekend.
- USAGE RULE REVISED (owner, UK time, BST): weekdays are LIGHT, not off: at most one agent at a time, small
  contained tasks, check-ins at 09:38, 13:38, 17:38 and 21:38 Mon-Fri (trigger trig_01Hmtoxf9F4T3FVAQFC94RMj).
  Weekends are FULL SPEED: up to 5 agents, hourly check-ins Sat-Sun (trig_01CmvFeTWLdv9v9sL5jeoSTC). The
  weekly allowance resets Monday 16:00 UK time. Big tasks (BAL3, multi-agent waves) wait for the weekend.
- H1 merged: 55-hearth.js, 63d-scenery-camp.js (new games start at a cold fire: 8 Oak lights it at ~0:16;
  Workbench 2:19, first tool 3:00, Forge 5:08; stations Lv 0 for new games only; old saves untouched, one
  What's new line); the Map Room Next Up goal and Roster line; sim --cold (default 1); perf new-game lights
  the fire first. --targets 17/20 (P1 now passes; T6 no-support 5 lower vs 2-4, likely noise; T16, D1 as
  before). Follow-ups: Hesketh partly cut off at 360px; station stakes crowd the oak; new-game Camp tab
  12.6ms vs 12 budget.
- Coordinator fix: 55-almanac.js needsMet probed later files' `let`s during boot (TDZ throw:
  "Cannot access 'craftItem' before initialization", date-dependent). Probes that throw now count as met.
- Owner asked to reset their preview progress. The preview copy now uses its own save key
  (sed: lanternfall.save.v1 -> lanternfall.preview.r1; bump r1 -> r2 to reset again). Future republishes
  must keep the swap: sed -e '1s#<title>Lanternfall</title>#<title>Lanternfall Preview</title>#'
  -e 's#lanternfall\.save\.v1#lanternfall.preview.r1#' dist/lanternfall.html > <preview path>.
- LORE1b merged: the dark hunts and smothers light (the Voice wants the land wholly dark); "a light lit for
  someone cannot be stolen" kept (smothered, never taken); the hero is the child Elowen's spark was lit for;
  Region 3 Listener = the Pyre Knight (Ser Hadric), Caedmon's shield-brother; the Hollises (Bram's family)
  as later optional Hands; the Voice is a 5-phase final boss at the bottom of the Deepwell (8.7). Its spec
  task is renamed DV (D7 is the hearth spec). Writing tasks LORE2, LORE4, LORE5 are unblocked (weekday
  light mode: one at a time).
- GP1 merged (owner: gathering tiers came too fast). SKILL_TUNE in 20-data: NODE_REQ 1/14/30/64/112,
  SMITH_REQ 1/10/22/36/54, gathering skillNeed 10 x lv^2.2, crafting its own curve, nodeXp 7 x t.
  Focused time to tier (tooled): 50m / 5.2h / 30h / 105h (was 1m / 3m / 7m / 18m). Normal play: tier 3 day
  2.5-3.5, tier 4 day 5.5-9.5, tier 5 day 13.5-17. Old saves keep every tier they had (55-skillpace.js).
  --targets 17/20 (P1 misses Warden/Ranger at day 8.3 vs 4-8; T16, D1 as before). Heavy crafters still open
  station tiers early (sim re-rolls a lot); revisit in BAL3. Coordinator resolved conflicts with H1
  (55-crafting: the station-built gate AND the tier rule; check.mjs What's new filters).
- USAGE RULE RAISED (owner, 2026-09-28: only 2% of weekly usage moved): weekdays now allow up to 4 agents
  at once (the weekday check-ins stay at 09:38, 13:38, 17:38, 21:38). BAL3 still waits for the weekend.
  LORE2 launched (4 running: G2, H3, F1, LORE2).
- OWNER INPUT (a friend who loves idle games): achievements and goals are what bring him back ("numbers
  going up"). Today: 23 achievements from the original game (56-achievements.js, none for newer systems),
  Next Up (25 goals), Codex milestones, the weekly board, bounties. QUEUED next free slot: AC1 achievements
  and goals spec (tiered tracks across every system, big lifetime numbers, near-miss nudges, titles and
  small capped bonuses, a trophy wall at camp, story-driven chapter goals; old 23 kept by id with their
  bonuses). Then AC2 core, AC3 UI.
- OWNER INPUT for AC1: the friend loves REALLY HARD achievements with cool rewards: titles and accessories.
  AC1 must include a top tier of rare, long-haul feats (weeks to months) whose rewards are visible
  cosmetics drawn on the hero in B1 style (capes, hats, lantern skins and flame colours, auras, a small
  companion critter), plus rare titles shown on the hero card and in the tavern/raid name line (display
  only; the online data shape does not change). Show rarity (how few reach it is local-only; no online
  stats). Every cosmetic is earned, never sold, and never gives power.
- LORE2 merged: 21h-lore-hollow.js (Hollow arrivals and 4 beats, 14 bestiary entries incl. the Coast's,
  15 elders incl. the Listener, 6 raid lines as client data only, LORE_LIMITS, LORE_BANNED). NOTE for R2-1:
  coast foe keys must be crab, gull, deckhand, kelp, jelly, witch, coral, or add bestiary entries under the
  chosen keys (check.mjs fails otherwise). LORE3 (delivery code) is next in the lore line. AC1 launched.
- AC1 achievements.md merged: 92 tracks (368 tiers), 22 Classic kept, 16 secrets, 21 Feats (hard tier,
  title + accessory each; capstone "Lanternfall"), 68 titles, 36 accessories, points ladder, chapters 1-2,
  bonus caps (at most +9.2% party damage, nothing on day 1). Coordinator accepts section 14 items 1, 2, 4-9;
  decides O2 yes (hats hide helms, with a Show helm switch), O3 yes (endless stars, points only), O4 yes
  only for clock secrets that never pressure (no streaks, no "log in at"). ASKED THE OWNER: O1 (an optional
  `title` id in raiders/<userId> and room presence so others see titles) and item 10 (your own title on your
  own Tavern row: online-layer UI file, no data change). Until then titles show locally only.
  AC2 launched.
- OWNER: the top achievement tier is EVERFLAME, not Lantern (Bronze, Silver, Gold, Everflame; stars after
  it). achievements.md updated; AC2 told. The accessory slot named "Lantern" and Feat names are unchanged.
- OWNER: titles must be short epithets "a person would be known by" (1-2 words, <= 14 chars, read after the
  name: "Wren the Unmoved", "Wren, Wyrmslayer"). Coordinator renamed display text only (ids unchanged, saves
  safe) in 57c-codex.js (milestones and page titles), 57d-deepwell.js (shop titles), 21c-data-legend.js,
  21e-stories-pinnacle.js (title list), and every title in achievements.md (style rule in 4.2). AC2 told.
- INCIDENT: the owner's interrupt at ~09:30 UTC stopped G2, H3 and F1; the coordinator did not notice and
  reported them as running until 13:00. Their WIP was committed on their old branches (518bf66, eea113e,
  8f27ee1) and, on the owner's go-ahead, three new agents resumed from it (4 running: G2, H3, F1, AC2).
  RULE: before any status report, verify agents with ListAgents; after any owner interrupt, check at once.
- Owner wants a friend to play-test. builds/lanternfall-test.html: dist wrapped with a doctype, charset and
  viewport (standards mode, no page errors from file://). Queued: P1 installable web app (PWA build target,
  hosted link, Export/Import save), host to be chosen by the owner.
- Netlify project `lanternfall` created in the owner's team (https://lanternfall.netlify.app, no deploy
  yet). The container's network policy blocks api.netlify.com and netlify-mcp.netlify.app, so deploys run
  on Netlify from GitHub instead: root netlify.toml (command `node tools/site.mjs site`, publish `site`).
  Waiting on the owner to link CalSay/Lanternfall, branch claude/elegant-johnson-m6k00u, in Netlify. Then
  every push (only after a merge passes build + check) deploys automatically.
- Merged claude/trusting-hopper-5v9927 (the owner's crash-fix session): its Almanac fix replaces the coordinator's (an early probe never caches the day's Omen), bounties skip the Omen bonus at load, plus a regression test. That branch is now redundant.
- F1 merged: 56e-formation.js (FORM_SLOTS back/mid/front, homeSlot/slotOf/whoIn/offSlot/adjacentKeys,
  setSlots/swapSlots/fieldTo/setPin, trioMult 1 -> 1.35 over zones 8-12 (damage only), heroFloorDps /
  heroCombatDps, offSlotMult 0.9, cover 15%/10%, Front +10 armour, divers go for the Back), migration to a
  field of 2 (+ hero) with S.party.formV/pin/formOld, fixture save-v3-four.json. KNOWN REGRESSION until
  F2/F3/BAL3: --targets 12/20 (was 16): T3, P1, P2 (Lightkeeper stuck at zone 36 days 10-40), P4, T12 fail;
  C9 power ratio 0.75-1.37 across fixtures. Accepted to unblock F2/F3/F4; BAL3 retunes trioX, trioFrom
  and the hero floor. F2 also owns: 56b hearth -> "support in Back", legendary markMax 10 -> 8.
- G2 merged: 63c-scenery-gather.js (mine with timbers, rails and a filling ore cart; woods with a growing
  woodpile; meadow with a windmill; crystal glade), 3-5 nodes in view that crack, deplete and regrow, the hero
  walks between them, gatherRight(x) keeps H1's plots clear. Perf level with the old single node within
  noise (machine load 28-36). Follow-ups: far nodes crowd at 360px; cold-Hearth third stake under a canopy;
  the Hearth tip covers part of the cold scene.
- OWNER (class balance): a damage class has built-in progress; playing a tank or support should buff the
  party instead. Today: the Warden's aura only helps OTHER tanks (+40% HP, +20 armour; with 2 companions
  there often is none), so a Warden hero adds no offence; the Lightkeeper gives companions +25% damage.
  BAL3 brief: "leader auras" that turn defence into party offence: Warden "Hold the Line" (while the Warden
  stands in Front and holds threat, the other two deal +X% and the Front takes the hits), Lightkeeper
  Blessing scaled so a support hero lifts the party as much as a striker hero adds; strikers/casters keep
  personal damage. New PARITY target: all four classes within 1 zone of each other at 2h, day 1 and day 7,
  and within 15% on days to the Region 1 and 2 bosses; tanks/supports stay best on walls (bosses, pinnacles,
  the Deepwell).
- OWNER: some numbers and letters in the font don't look right. Font picker published (https://claude.ai/artifact/2cekhj1fcR1iiujUjPSDcw): pixel font A Pixelify Sans (now) vs Silkscreen, Jersey 10, Tiny5, DotGothic16, VT323, Handjet; reading font 1 IBM Plex Sans Condensed (now) vs Sofia Sans Condensed, Barlow Semi Condensed. Waiting on the owner's pick; the swap is a small task (--display/--body in 10-base.css, the shell's font link, fontPx in 62-stage.js, then fix any clipped widths).
- OWNER picked Handjet (G) as the pixel font; reading font 1 (IBM Plex Sans Condensed) or 3 (Barlow Semi Condensed), leaning 3. FONT1 launched (Handjet, body font a one-line switch, default Barlow until confirmed). The font page has a G+1 vs G+3 pairing section. Ran 5 agents briefly (AC2, H3, F2, F3, FONT1): FONT1 is small and owner-requested.
- AC2 merged cleanly: 23-data-deeds.js, 58-deeds.js (92 tracks with 15 dormant until their systems land,
  21 Feats, 16 secrets, points and ladder, capped bonuses <= x1.092 party damage, local titles a_*, looks
  state with wearGet, the Codex bridge by wrapping, setNumFormat letters/scientific, registerGoal cap:1).
  f_hit recalibrated to 2T before launch. AP 3/8 (sim skips Deepwell/expeditions/raid tracks). --targets
  16/20: P1 Lanternmage 9.8 days because the sim earns ~12 Gold crafting tiers by day 8 (skillXp bonuses):
  BAL3 raises crafting Gold thresholds or fixes the sim's craft policy. AD1 exception: "the Last Lantern"
  (16 chars, 3 words) kept by the coordinator as the capstone. AP6: the nudge never shows because the sim
  keeps 3 Ready goals (unspent star points); AC3 should give the nudge a reserved row. Owner confirmed fonts
  G+3: Handjet + Barlow Semi Condensed (FONT1 told).
- FONT1 merged: Handjet (--display, x1.2 via --display-k across 196 rules; stage text TXT_K 1.15, re-bakes when the font loads) and Barlow Semi Condensed (--body). No new clipping vs Pixelify; Barlow wraps less than Plex. Perf overlaps base under heavy load. Follow-up: check variable weights on the live page.
- F2 merged: 56b rewritten (12 slot jobs, 8 combos incl. Lifeline = tank Front + support Back, 4 Kin, 21
  Bonds; 33 SYNERGIES with `layer`; caps +40% dmg/member, 20% DR), 56f-bonds.js (S.bond, levels 0.5/3/12/
  36/150h, 50-130%), 21f-stories-bonds.js shape for LORE7, markMax 8. Accepted: L25 pairs 150% -> 115%
  (spec 9.1.3); away gathering grows companion Bonds at Hearth x away rate. --targets: P1 and P2 now PASS
  (Lightkeeper fixed), T1/T3/T14/T18 fail (Ranger fast, Lightkeeper 1.19): BAL3. Coordinator updated the
  AC2 dormant-track check (bonds/together live now: 79 live). Next: F4 Party UI; F3 is running with
  formQuick available.
- OWNER: the Storehouse must scale up quickly (idle game): never 'only worth idling 10 minutes', meaningful but not ridiculous. H3 told to re-derive caps from real rates: Lv 1 holds a full 8 h away session of the best open node; later levels keep pace with the away cap (up to 24 h) and tiers; active play fills a cell in ~1-3 h; upgrades quick early. Spec table (100..10,000) was far too small.
- OWNER: gathering menus need work; switching should be fluid; fight <-> gather takes too many steps (back
  to the main screen first). Then: "a general look at overhauling the menus might be wise, down the line".
  Coordinator review at 360x740: about 2/3 of the Gather tab is header before the first node; stale copy
  "Your party is fighting"; nothing marks the current or best node; a wall of identical "MINE Go" buttons; no
  Stop / Back to fight; held without caps.
  PLAN: UX2 menu overhaul spec (docs only: audit every tab, view and sheet at 360px; information
  architecture; global navigation incl. the activity pill + quick switcher; patterns for lists, cards,
  headers, sheets, toasts; per-screen wireframes; a phased build plan). Launch it once the Storehouse, Party
  screen and achievements screen have merged so the audit covers them. GX1 (the gather rework and quick
  switcher) becomes UX2's first build task. GX1 brief so far:
  1. An activity pill in the header, visible inside full-screen menus, showing what you're doing ("Fighting
     · Zone 37" / "Mining · Copper Vein"); tap: a quick sheet with Fight (your zone), each skill's last node
     and recent nodes; one tap switches and closes menus.
  2. Remember the last node per skill; swipe between Mining / Wood / Foraging.
  3. A "Now gathering" card (node, per hour, held vs cap, time to full, Stop, Back to fight); only the current
     skill with its next-tier bar; the tool card as a one-row chip; compact tap-to-go rows with a held/cap
     bar; "Best for you"; lower tiers folded; copy fixed; Pack becomes the Storehouse view.
- AC3 merged (committed by the coordinator with the owner's explicit approval: the agent's permission
  checks stopped responding before its commit). 75-deeds-ui.js (hidden tab `deeds`: Deeds, Tracks, Feats,
  Looks), the Feat card, title picker, 75-stats-ui.js stats wall with Letters|Scientific, registerTab hidden,
  registerGoal `reserve: 1` (nudge row), deeds.wear() fix for the Deepwell l_moon id clash. Build + check
  pass after the merge. Follow-ups: A/B perf; AP6 may overshoot 20-60% now; the "top pair" stats tile guesses
  S.bond.t keys (F2 is merged: verify); hide has no lifetime counter. AC4 hooks: lookIconURL, looksPreview;
  AC5: featTrophyURL.
- F4 merged: Party screen (three slot cards Back/Middle/Front with slot jobs and Out of place chips, tap and
  drag swaps, bench, combos/Kin chips and See all, Bond rows and Bond sheet, Sworn frames, bondLevel toasts,
  "Old Friend", 75-bonds-ui.js, 60-formation.css). Also renamed the onboarding feature to "Combos and Bonds".
- F3 merged: planner v3 (pair x order search via formQuick, push score with boss blend w 0.35/0.6, Front-tank
  rule and a "stuck" rule, autoPlan with event-only re-plans, 6% gain, 300 s dwell, no return within 10 min,
  pins; bestLineupLater in idle steps; sim --lineup takes 2 companions with slots). --targets 9/20 (T3, T14
  now pass; T4, T6 fail). SERIOUS: the Lanternmage stalls at the zone 70 boss: benched companions earn no XP
  and partyLevel() still averages the top 3 companions with a field of 2. Also found: a combat soft-lock
  (companions stay down forever while a healer hero survives: no kill, no wipe); the hold estimate overrates
  a hero in Front. F5 launched for these before BAL3.
- LORE3 merged: 55-story.js, 75-story-ui.js, 60-story.css (arrival banners, elder intro/fall lines, story
  beat chips and cards with a companion line, Codex Story row with "Catch up on the story" for old saves,
  bestiary lines, "The Listener" at zone 35, Great Lantern character lines; storyBeat API for the Coast;
  S.story). Class screen now reads "You carry one of the last lanterns." RAID_LORE unused: needs the owner's
  sign-off to edit 74-ui-raid.js (online-layer UI, no data change) = LORE9.
- AC4 merged: 12g-art-accessories.js (6 capes, 6 hats, 7 lantern skins, 5 flames, 6 auras, 4 frames as B1
  kit pieces), 13b-art-critters.js (6 critters), 64-looks.js (stage aura/critter, portrait frames, bake on
  wear change, lookIconURL/looksPreview/lookCritterDraw). Coordinator kept both new check sections (looks,
  story). Follow-ups: Company Cape reads weakly; flames read mainly through stage light; critter sleeping by
  the camp fire waits for a camp scene; gather JS p95 maybe +1-2 ms with looks worn (noisy): re-measure.
- H3 merged: 55-store.js, 75-store-ui.js (every credit through stashAdd: flow / parcel / preview / gift;
  skill XP and tool mastery keep counting at the cap; "Storehouse full" chip with Switch and Spillover; held
  vs cap on rows and the Pack). Caps (owner's idle rule, from sim rates), gathered per cell by level 0-8:
  5,000 / 40,000 / 50,000 / 100,000 / 200,000 / 300,000 / 750,000 / 1,250,000 / 2,500,000 (fought: half).
  Builds 90 s, 10 m, 30 m, 2 h, 6 h, 12 h, 18 h, 24 h. HS19 check: a full away session fits at each expected
  level. Owner rule 3 (active fills a cell in 1-3 h) cannot hold with rules 1-2 (active only ~2x away):
  rules 1-2 kept; told to the owner. Not built: the expedition send-sheet "haul would not fit" warning.
- F5 merged: partyLevel over the field of 2, benched companions get 25% kill XP (quiet), combat get-up after
  15 s mid-pack and a 90 s stall counts as a wipe/retreat, hold estimate uses real power for the hero's HP.
  --targets 15/20 (P1, P2, P4, T4, T6, T11 pass). Bench XP may be strong (L1 -> L19 in 2 min): BAL3.
- LORE4+5 merged: 21i-lore-exped.js (28 Lore pages, 12 keepsakes), 21j-lore-omens.js (35 Omens, 7 Dares,
  omenLine), shown in the Codex and on the Almanac card.
- OWNER: the Storehouse should be for materials; gear needs its own building ("an armoury"). Today the
  Storehouse already covers only S.mats (Trophies and gear are outside it); gear sits in a flat bag of
  CRAFT_BAG_MAX = 50 unequipped items (bagFull()). QUEUED AR1 "the Armoury" (camp building, spec + build):
  levels raise the bag (50 base, so old saves are unchanged; an over-cap bag never loses items); gear sets /
  loadouts per class and per companion (swap in one tap: boss set, Deepwell set, gathering tools); lock and
  favourite items; the auto-salvage filter from the vision (by rarity/tier/"worse than worn"); a display
  rack for uniques and legendaries in the camp scene; sort and filter. Fits UX2's Craft/Camp structure, so it
  follows the UX2 spec. Also noted for the Storehouse: Trophies may want their own shelf later.
- OWNER: benched party members get no XP. benchXp 0.25 -> 0 (56-roster.js); check updated; recruits catch up
  once fielded (catchGap/catchMax); expeditions still give their XP. --targets re-run to confirm no stall.
- OWNER: rename in player-facing copy: companions -> HEROES; the player's own character -> the LANTERNBEARER
  (owner's pick over "Leader"/"You"); the group is still "the party" (you + two heroes). Display text only:
  code ids, save fields and events keep their names. QUEUED NM1 copy pass across all UI, toasts, story, lore
  and docs (watch 360px widths; "Hero level" -> "Lanternbearer level" or "Level"; companion XP -> hero XP).
  Run it before UX2's build phases so new screens use the new words.
- OWNER: no rapid catch-up XP for heroes either ("an achievement for maxing all heroes shouldn't be
  spoonfed"). CU1 launched: drop catchGap/catchStep/catchMax/catchPromo multipliers, planner scores recruits at
  real level, redefine T11/T18 to "levelling a new hero is an investment", keep P1/P2/P4 passing without
  needing recruits; the Full Company Feat stays months away.
- Bench XP off: --targets confirms no stall (P2 PASS, P4 PASS). Fails: T1, T16, D1, P1, T6, T8, T11 (catch-up target, being redefined by CU1), T12, T18: all BAL3/CU1 territory.
- OWNER: cap the number of gatherers (Hands) and let the cap grow late game; expand resources with production
  chains, e.g. copper ore needs smelting into ingots, which needs coal, so a Hand can be a coal miner.
  Today: beds above the Tavern cap Hands at 1-5 (+1 at Hearth 8, max 6); crafting uses raw materials.
  QUEUED K13 "production chains" spec (after N1 merges): secondary resources (coal, sand/flux, resin, dye,
  salt...), refining stations (Smelter: ore + coal -> ingots; Sawmill: logs -> planks; Loom: fibre -> cloth;
  Tannery: hide -> leather; still: herbs -> tinctures), timed refining that suits idle play, Hands as refiners
  as well as gatherers, a bed cap that grows with a Bunkhouse/Tavern and late-game regions, Storehouse effects
  (refined goods are denser), recipes moving from raw to refined from tier 2 up (tier 1 stays simple for the
  first ten minutes), migration so no save loses items or recipes, and 360px UI.
- UX2 ux-overhaul.md merged (63 images incl. 11 mockups): top problems (no in-menu switching, Gather buries
  nodes 80% down, identical Go rows, stale copy, Camp 7 screens long, duplication, 9 tab bar styles, Journal
  3 taps deep, no pattern kit, chrome 210/740 px). Tabs: Fight (Zone, Bounties, Deepwell, Raid*), Party (Team,
  Heroes, Stars), Gather (Mining, Wood, Foraging, Storehouse), Craft (Make, Armoury, Powers), Camp (Build,
  Expeditions, Almanac, Tavern), Journal via the portrait (Deeds, Tracks, Feats, Codex). Phases UX-A..G.
  Q4 answered (bench XP 0 shipped). ASKED THE OWNER: 9.1 Raid under Fight (UI only, online-layer file),
  9.2 rename box to the Journal, 9.3 the pill replaces the name in the header (UX-A ships "name kept" by flag).
  UX-A launched.
- OWNER: Hands should live at camp with us -> beds come from a new camp building, the Bunkhouse (hire at the
  Tavern); N1 told (data-driven bed cap so it can grow late game).
- OWNER deferred the open questions to the relevant designers' recommendations. Coordinator decisions:
  UX2 9.1 Raid moves under Fight (UI only, no online data change; done in UX-E); 9.2 the rename box moves to
  the Journal's Lanternbearer card (UX-B); 9.3 the activity pill replaces the name in the header (UX-A told,
  flag kept). LORE9 (raid flavour lines in 74-ui-raid.js, display only) approved on the same basis.
  K13 production chains: the Lanternbearer CAN gather secondary resources (coal, dye, salt) so the game is
  playable without Hands, but they are low-value for the hero and ideal Hand jobs; refining runs in the
  background at stations (timed), worked faster by Hand refiners.
- AC5 merged: 63e-scenery-wall.js (Trophy Wall card on the Camp view: 4 stages, 21 Feat trophies, pennants,
  12 group medals, the worn critter asleep by the fire, day/dusk/night; featTrophyURL; trophyWall.paint for
  the future camp panorama at plot p13). Coordinator kept both check sections (store, wall).
- OWNER: relax the Netlify deploys: four times a day (or at the end of the 5-hour usage cycles; the
  coordinator cannot see those, so fixed times). netlify.toml now has `ignore`: Netlify skips any push whose
  newest commit message lacks "[deploy]". DEPLOY RULE: only at the 09:38, 13:38, 17:38 and 21:38 UK check-ins
  (weekday and weekend), and only if something merged since the last deploy: put "[deploy]" in that check-in's
  wave-log commit message. Never add "[deploy]" at other times.
- OWNER: a WORLD tab for everything that isn't basic gameplay (fighting and gathering): pick the Tavern,
  camp and so on from it; enter zone dungeons and find the zone raid from the world map; start expeditions
  from the map. UX2b launched to revise ux-overhaul.md's IA around a World map (it absorbs the Camp tab,
  the Deepwell, Raid, expeditions and the plan-2 Lantern Road map idea).
- OWNER: a campfire showed in the woods. Cause: 63d/63c drew the opening camp scene (fire, Hesketh, plots) on
  EVERY wood node for any save that started cold (hearthCold stays set). Coordinator fix: new hearthScene()
  = a cold-start save before the fire is lit or before the Forge stands; only at the Oak Grove (wood t1).
- OWNER: hint pop-ups jump around when the screen moves. QUEUED HINT1 (onboarding/tip bubbles: dock them to a
  fixed band instead of tracking moving targets; reposition only on real layout changes, no jitter).
- OWNER: skill levels should sit above the resource tabs. UX-A told: the Gather sub-tabs carry the level
  ("Mining 52") with a thin XP bar under each, so all skills show at once above the lists.
- UX2b merged: bottom tabs Fight · Gather · Party · Craft · World (world id kept); World = a vertical map strip
  (regions stacked, road rows of lamps per band, Hollow's Rest place view, Tavern sheet, Deepwell place,
  raid pin, Almanac post, Great Lanterns, band sheets to travel, expedition bar); 9 small sprites; no per-frame
  work. Phases: A, B, then W1 (shell + map + registerPlace; absorbs plan-2 RD), W2 (Rest/Tavern/Almanac),
  W3 (Deepwell/raid/expeditions), D, E, F, then G. Coordinator decisions on 10: raid pin in the foe's home
  region; UX-A does not reorder the tab bar (W1 does); the Tavern is a sheet.
- OWNER: the icons look amateurish ('like an 8 year old made them on paint'). Today: 12x12 maps, 2-3 flat colours, no outline or shading. ICON0 style study launched (16 icons in 3 styles vs current, tab bar and list-row mocks; count of all icons; renderer change; recommendation). Owner picks, then ICON1 full redraw.
- USAGE (owner, evening 2026-09-28): the allowance is nearly spent with 2+ hours to go (the owner has a free
  reset available). Coordinator: stopped the two newest tasks (ICON0 icon study, HINT1 hints) and saved their
  WIP on their branches (relaunch from worktree-agent-a4c131b5aff330e50 / -a470a57b3ab7f632b); told N1, CU1
  and UX-A to commit checkpoints now and finish lean. No new launches until the owner says; the weekday
  check-in is merge-only until then.
- N1 merged: 21f-data-hands.js, 57f-hands.js (hire at the Tavern, beds in the Bunkhouse camp building, 1-5
  +1 at Hearth 8, data-driven cap; 10-24.75% of the hero's live rate; 2-8 h shifts; parcels into the
  Storehouse; own RNG; no harvest, no skill XP, no mastery; Tam; old saves at Hearth 2+ get Bunkhouse 1).
  HS9/HS11/HS12 miss because the sim reaches Hearth 2 on day 2-3 (spec ~1 h): BAL3. N2/N3 (art, UI) next.
- CU1 merged: rapid catch-up removed; the planner scores real levels; T11 redefined (pacing.md 13).
  CONSEQUENCE: P2 fails (Lanternmage/Ranger stall at zone 69-70 with their first Common pair at the cap), P4
  fails for 3 classes. Owner/coordinator decision needed for BAL3 (options in pacing.md 13: retune Region 2
  for a capped Common pair; make players invest in a better hero for Region 2; a small far-behind rule).
  Full Company Feat now ~6-7 months (text says 3-5).
- UX-A merged: 55-nav.js (S.nav), 75-nav-ui.js, 60-nav.css (activity pill replacing the name, quick
  switcher, swipe between views), Gather rebuilt (Now card, level tabs with XP bars, Best for you, compact
  rows, lower tiers folded), Storehouse view, tool sheet, Raid button removed from the control row.
  NAV_TUNE.pillReplacesName = true. Perf needs one quiet re-run.
- MODEL ROUTING (owner approved 2026-09-28; the coordinator may adjust if issues appear). Pass `model` on
  every Agent launch:
  - opus: hard cross-system engineering and balance (BAL3, formation/planner, K13 production chains, the
    World map shell UX-W1, anything sim-tuned or with tricky merges).
  - sonnet: well-specified builds and UI screens (N2/N3 Hands UI and camp art, Armoury screens, HINT1,
    UX-B..G screens after the kit exists), art from an approved style guide (ICON1 after the owner picks),
    writing and docs (LORE6-8, bond stories, Hand talk lines, the NM1 heroes/Lanternbearer copy pass),
    style studies (ICON0).
  - haiku: small mechanical, low-risk jobs (narrow text swaps, lookups).
  Review merges as usual; if a sonnet/haiku task misses edge cases, re-route that kind of task to opus.
- OWNER (2026-09-28): art commissions and monetisation wait until the game is ready for initial launch
  (fix art only if something is hideous). Monetisation direction noted for later: fair model (a free + paid
  battle pass, a membership with capped convenience perks: longer away time, faster builds, an extra builder,
  camp skin/effects; skins; never exclusive power; no claw-backs); needs accounts + server-side purchase
  checks; the vision's fairness pillar gets rewritten then.
- VERSION 1.0 (owner): four regions fully fleshed out with complex mechanics, 32 heroes (18 today), and
  "2*" different gatherers per resource type (clarifying the number). Queued: a Road to 1.0 roadmap
  (plan-4) that maps every remaining task to that target.
- OWNER: gatherers for 1.0 = 2 per resource type, each with different benefits (a named cast, not random
  applicants). N1 built random applicants with rarities, pity and 5 named Legendaries: REDESIGN queued as
  N1b (a named roster: 2 per resource type incl. K13's secondary resources and the Coast's, each a character
  with a distinct perk pair, a lore hook and a way to recruit them; keep levels/shifts/beds/parcels; migrate
  Tam and any hired Hands). N3 (gatherer screens) follows N1b.
- OWNER (2026-09-28): (1) sort out the crafting and gear menus (Craft/Armoury organisation); (2) enemies,
  and definitely bosses, must hit harder; (3) much deeper synergies and real reasons to pick one class over
  another; each class must feel good and exciting; (4) CLASS EVOLUTIONS at a level plus other requirements,
  e.g. the Lightkeeper evolving into holy damage, the Ranger into poison. QUEUED CL1 "Classes 2.0" spec
  (opus): class identity and fantasy, damage types and statuses (holy, poison, fire, frost...), enemy
  resistances/weaknesses by region, two evolution branches per class (level + trial/boss/quest
  requirements), new abilities per branch, synergy depth through types and statuses, hero (companion)
  interplay, enemy/boss damage targets for BAL3, and a build plan. (1) goes to UX-F (Craft + Armoury) right
  after the style kit; (2) to BAL3 with CL1's targets.
- OWNER (2026-09-28, more for 1.0): (a) upgrade trees for gatherers and for camp buildings (inside each
  building, not just its level); (b) random events and secrets; (c) a deeper revision of the uniques;
  (d) an ACTIVE COMBAT overhaul beyond parry, more fun and rewarding, especially for dungeons and raid fights.
  Plan: (d) = CB2 "active combat 2.0" spec right after CL1 (it builds on CL1's abilities, types and statuses);
  (a) joins N1b (gatherer trees) and a camp spec (building trees); (b) an events/secrets spec; (c) a uniques
  2.0 spec. All go into the Road to 1.0 roadmap in build order.
- OWNER: VERSION 1.0 = FIVE regions (the Voice, the final boss, at the end of Region 5 as lore.md has it), so
  1.0 ships a complete story. Also approved for 1.0: a polished first hour, save safety (export/import at
  least, ideally cloud), an in-game guide/glossary, accessibility (colour-blind-safe damage types, text size,
  volume mixer), sound and music, hero quests (per-hero chains unlocking top Bonds and hero evolutions),
  fishing + the Kitchen, challenge modes (boss rush, Oath replays, weekly Deepwell trial), a shareable camp
  card. Guilds/bigger social stay post-launch.
- OWNER on 1.0 system ideas: (1) TACTICS for heroes: yes ("tower defense vibes"), after the combat overhaul
  makes combat substantial. (2) ELITE TRAITS: yes, part of the combat overhaul (special boss fights).
  (3) Lantern network: NO. (4) Factions/reputation: maybe, needs a world-map/areas overhaul; not before the
  World map exists. (5) Trade caravans: fold into EXPEDITIONS (trade routes). (6) GEMS, owner's design:
  crafted weapons/armour have gem slots (otherwise base stats only); uniques come pre-socketed with gems a
  little better than a crafted item of the same rarity could get; gatherers can have +5%-style gem-find
  perks; active gathering finds more; gems come from mines (the Mining geodes line fits); bosses are
  encrusted with signature gems that give powers and always drop that gem type. Gems may tie into
  monetisation later (coordinator note: keep sold gems cosmetic or convenience, never exclusive power).
  (7) HERO FATIGUE: yes, but tuned so rotating heroes never slows progression (frame it as losing a rested
  bonus, recovery at camp, away time counts as rest).
- OWNER: sockets must not be mining-only; every gathering skill should feed something like gems (idea:
  totems made by "the gods"). Coordinator proposal (awaiting the owner's reaction): SOCKETS 2.0: Mining ->
  Gems (weapon slots: power and the Classes 2.0 damage types), Woodcutting -> Heartwood Totems carved in the
  likeness of the Hollow's old hearth-spirits (armour slots: resistances, thorns, regen), Foraging -> woven
  Charms of fibre and herbs (trinket slots: utility, statuses, gold/XP), Fishing (Coast) -> Pearls (rare,
  flexible, any slot or upgrading another socket); worked at existing stations (Enchanter's Table cuts
  gems, Workbench carves totems, Loom weaves charms); bosses carry a signature piece of one family and always
  drop it; Resonance: a matching gem + totem + charm of one element gives a set bonus; each gatherer pair has a
  finder for its family.
- OWNER (big direction): sockets and gear must be CLASS-SPECIFIC, leading to a RESOURCE OVERHAUL around
  armour weights: HEAVY (tanks) centres on mining/metal; MEDIUM (warriors, archers) on wood and leather;
  LIGHT (mages, priests) on cloth and enchantments; all three interact in each other's builds; socket items
  (gems etc.) come from gathering in each region. Owner floated: the Priest (Lightkeeper) becomes a subclass
  of the Mage. Coordinator proposal (awaiting confirmation): three base classes by weight (Heavy Warden,
  Medium Ranger, Light Lanternmage), each with evolutions; Medium can evolve into a melee warrior or an
  archer; Light into fire, frost or the Lightkeeper (holy/priest); existing Lightkeeper saves migrate to Light
  with the Lightkeeper evolution already chosen (nothing lost). Two linked specs: CL1 (classes, evolutions,
  damage types) and RG1 (resources by weight, production chains K13, cross-weight recipes, socket families
  by weight and region, crafted slots vs uniques 2.0).
- OWNER DECISION (classes 2.0): three base classes by armour weight: WARRIOR (heavy), RANGER (medium),
  MAGE (light). Each evolves into two playstyles, one damage-focused and one utility-focused:
  Warrior -> Warden (utility/tank) or a damage branch (name TBD); Ranger -> two branches (names TBD; owner's
  earlier idea: poison); Mage -> Priest (utility: holy, heals) or Warlock (damage). Existing saves migrate
  without loss (Warden -> Warrior with the Warden evolution granted; Ranger -> Ranger; Lanternmage -> Mage;
  Lightkeeper -> Mage with Priest granted). Names proposed to the owner; CL1 briefs from this.
- OWNER (gear 2.0): Warrior gear = metals + leather; Ranger = wood + leather; Mage = wood + cloth.
  ENCHANTING is the method of applying the buff items (socket items) to gear. Buff items unlock in REGION 2.
  RESOURCES ARE GATED BY REGION (coordinator: natural fit = material tier N from region N across 5 regions;
  balance around it; existing saves keep every material/item they hold even if above their region).
- OWNER: evolution names: Warrior -> Reaver (damage) / Warden (utility); Ranger -> Venomstalker (damage over
  time) / Trapper (utility); Mage -> Warlock (damage) / Priest (utility). Each evolution must feel special and
  clearly stronger than its base, and change how the game plays. MORE MATERIAL TIERS so crafting stays
  meaningful (coordinator recommends 3 per region, 15 in all, with old tiers mapped without loss; RG1 decides).
- OWNER: the six evolutions are the FIRST evolution tier; a second tier of subclasses comes in a post-1.0 version (design CL1 so a second tier can branch from each evolution later: save fields, UI and trees must allow it).
- Road to 1.0 written by the coordinator: docs/design/plan-4.md (every owner decision to 2026-09-28, in phases A-F, plus fixes, post-1.0 and open questions). RD1 now keeps it current instead of writing it.
- OWNER ANSWERS: (1) Region 2 expects a trained-up stronger hero: YES (BAL3 builds option 2, with a hint when
  the pair hits its limit). (2) Online titles: yes, but not for 1.0. (3) Netlify is already linked (deploys
  follow the [deploy] rule). (4) The festival comes AFTER 1.0.
- Coordinator review of plan-4: docs/design/roadmap-review.md (Core 2.0 designed as one package then 7 slices; BAL2.5 now, BAL3 per slice; SAVE1 early; accessibility/guide inside Core 2.0; LORE-R45; 1.0 pacing targets; hero Awakenings; filled-out designs for evolutions, damage types, gear/tiers/chains/enchanting/uniques, active combat, gatherer roster, building trees, fatigue, tactics, events, trade routes, hero quests, challenge modes, first hour, sound; 6 owner questions).
- 21:38 check-in: no agents running; deploy window used for today's merges (first Netlify deploy).
- OWNER on the review: (3) evolution choice permanent with a costly respec: YES. (5) Hunter gatherer job and a
  Tannery: YES. (2) 1.0 length depends on how fun and replayable the loop is; players must stay committed
  (coordinator proposal sent: story to the Voice in ~2-3 months of normal play, completion goals 6-9 months).
  (1), (4), (6) explained to the owner in plainer terms; awaiting answers.
- OWNER: (1) YES to designing classes, gear and combat together, with several agents on it (glossary first,
  then CL1/RG1/CB2 in parallel), built in slices. (2) 1.0 = a COMPLETE SEASON 1; the story continues in
  Season 2 (the 2.0 release). Coordinator note: lore.md's ending must be split into a Season 1 arc that
  resolves plus a hook for Season 2 (question to the owner: does the Voice fight close Season 1 or wait for a
  later season?). (4) Hero AWAKENINGS: yes (heroes keep their character; one Awakening each for 1.0).
  (6) Uniques are boss drops themed to the boss type (owner likes this); keep the merge simple: each boss has
  a themed unique carrying a power, duplicates (Echoes) upgrade it, the Lantern Book collects them.
- OWNER: Season 1 (1.0) ENDS with the first confrontation with the Voice at the bottom of the Deepwell: the
  party wins, the Voice retreats deeper, and a reveal sets up Season 2 (2.0). lore.md's sealed ending is to be
  reworked to that (writer task). Also: a SECONDARY UPDATE after Core 2.0 redesigns and fleshes out the
  playable characters (the three base classes and six evolutions as characters: looks, personality,
  backstory tied to the lore, how the heroes react to each).
- Build map written: docs/design/build-map.md (task list with dependencies, models and sizes; ~35 sessions to Season 1; gap found: full building catalogue, camp scene, map growth across 5 regions/outposts -> new WC1 World and Camp 2.0 spec).
- plan-4.md rewritten as the full Season 1 scope (owner: the build map had compressed the combat and resource overhauls): every discussed item, grouped, with its task ID; build-map.md keeps the order.
- OWNER: smaller models, more enemies per pack (today max 3). Added to plan-4 2.10 / CB2: variable pack sizes (3 brutes, 5-6 normal, 8-10 swarms), zoom step for big packs, smaller swarm sprites, bars only on focus/elites/bosses plus one pack bar, perf budget with 10 foes.
- STEADY MODE (owner, 2026-09-28 evening, after the reset): work steadily across each 5-hour window without tanking the weekly allowance: at most 3 agents at once. Session 1 started: CORE-G (opus), MAP0 (opus), HINT1 (sonnet). Next as slots free: CL1 + CB2 (after CORE-G), LORE-R45 (sonnet), then RG1.
- CORE-G merged: docs/design/core-2.md (the shared rulebook). Coordinator decisions: "reactions" is the
  player word for Blight/Shatter/Judgement (combo stays the Party term); Mage gear = cloth main, wood second
  (plan-4 fixed); the parry's vulnerability is "Reeling" in copy; the `warden` id is reused for the Warrior
  evolution via the migration map. Q13: MERGE fatigue into the existing Rested system (one per-hero Rested
  meter; resting at the Hearth while the Lanternbearer gathers fills it; save key `rested` extended with
  defaults). Q14: yes. Guidance to the specs: CL1: the Mage's base type is FIRE (today's Embers, the lantern
  flame), Warlock adds dark/curses, Priest holy; Ranger Focus becomes the standard Mark unless CL1 shows a
  reason; hero types and the +35% split are CL1's. RG1: keep today's material names for existing materials
  (no relabelling), new names only for new grades, rename the draft grade that clashes with Emberite; buff
  items live in the Storehouse (a Buff Items page); enchant 100% at a level RG1 sets. CB2: its questions are
  its own (auto-cast efficiency, swarm HP, interrupt limits, the boss timer vs the kill target).
- CL1 launched (opus). Running: MAP0, HINT1, CL1. Next when a slot frees: CB2 (opus), then LORE-R45 (sonnet), then RG1 (opus).
- MAP0 merged: docs/design/map-study.md + docs/design/img/map/ (A Dusk overworld, B Lampwright's chart, C Lamplit terraces; the artist recommends C with two tweaks; A runner-up). Prototype in prototypes/map-study/. OWNER PICKS. CB2 launched (opus).
- HINT1 merged: the onboarding hint no longer repositions on every poll; it docks in the toast band
  (--toast-h), reposition only on real layout events; build + check pass.
- CONTAINER RESTART (evening 2026-09-28): CL1 and CB2 agents stopped. CL1 had a near-complete classes-2.md
  (all 8 sections + appendix): saved as WIP 4c46d90 on its branch; relaunched to finish from it. CB2 had
  no work yet: relaunched fresh.
- OWNER MAP PICK: a HYBRID. A's layout (the top-down 16-bit overworld: geography, forests, cliff, stream,
  paths) with C's lighting and ambience and C's icons/landmarks. Mood: light in the dark: small warm pools of
  light that fall off fast (like fireflies and lamps), everything outside them dark and a little spooky;
  fireflies/motes drifting. Lit progress = pools of light along the road; the unlit land stays in deep
  shadow (silhouettes only). UX-W1 builds this; MAP0's artist notes (palette-index baking, lamp-box palette
  swaps, no per-frame work except a few cheap firefly sprites) apply. A short MAP1 refine study (one screen +
  closeups of the hybrid) comes first so the owner can confirm before W1.
- CL1 merged: docs/design/classes-2.md (Reaver "the Red Lamp", Warden "the Unmoved", Venomstalker "the Quiet
  Thorn", Trapper "the Pathfinder", Warlock "the Lamp-Thief", Priest "the Given Light"; the Proving; star maps
  for 3 classes; hero types; parity; migration; S2/S3 build split). Coordinator signed off core-2 change-log
  rows 8.2-1..9 and wrote the fatigue-into-Rested row (S.fatigue withdrawn). Coordinator calls: D2 "the
  Proving" yes; D4 yes (new parts at 60% until the Proving); D6 Dark Turned yes; D7 Saint Elowen's signature
  shown as "Chapel Light"; D8 Blessing unchanged unless BAL3 needs it. ASKED THE OWNER: D1 evolution gate
  (recommend level 35 + the Region 1 boss beaten, not 60), D3 a one-off free switch within 10 minutes of
  choosing, D5 the six titles. For HER: 2 poison heroes and a physical support needed; CHAR1 gets the
  choice-card copy, visual notes and hero reaction lines; RG1 handles Priest/Warlock gear lines.
- LORE-R45 merged: docs/design/regions-4-5.md + lore.md. Region 4 THE PALE REACH (over the pass past the
  Emberwaste, Kestrel's homeland, candlelit whites; Starfall gathering -> Starshard buff items; boss "the
  Star-Fallen", working name). Region 5 THE LONG STAIR (the Deepwell continued down to the Bottom of the
  Stair; Wellglass buff items, the last grade; no Listener or Great Lantern per canon: a "Last Landing" beat).
  Season 1 ending: the Voice is driven back, not destroyed; reveal line "There were lamps before this one."
  (lore.md 8.6-8.8). New grade names 6-15 (grade-9 renamed Wyrmsteel). ASKED THE OWNER: the Star-Fallen's
  name, the Last Landing beat, Deepwell vs Region 5 content, the material-name batch, an optional Whiteout
  hazard for Region 4. RG1 launched (opus).
