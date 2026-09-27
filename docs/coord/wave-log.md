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
- Preview build for the owner: https://claude.ai/artifact/JHKGxG17HxZyA2Prit4BxS (private, no online
  capabilities, its own save). After each merge wave: build, copy dist with title "Lanternfall Preview" to
  the scratchpad preview/lanternfall-preview.html, and republish to that URL. Never publish the live artifact.
- Decisions that belong to the owner (art direction, monetisation, anything irreversible) go under
  "Waiting on the owner" below instead of being guessed.

## Waiting on the owner

(none yet)

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
