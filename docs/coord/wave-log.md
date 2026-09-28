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
