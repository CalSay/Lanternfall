# Plan 2: the late game

Status: the next plan after [long-term-vision.md](long-term-vision.md) waves 1-5, written
2026-09-28 by the senior game designer after a play-test of the merged build (party combat,
Stage C, is still being built). It answers the owner's question "What kind of things could we do
to make late game exciting?" with the coordinator's recommendation, since the owner has not picked
yet (wave log, "Waiting on the owner"): **Region 2 + Oaths + legendary powers and circle sets
first, then pinnacle bosses.**

Specs: [region-2.md](region-2.md) (the Sunken Coast), [oaths.md](oaths.md),
[legendaries.md](legendaries.md). Owner decisions this plan keeps: slower pace (BAL1), gameplay
first and art only where a system needs it, constant performance checks, no prestige, fair with no
FOMO power, game-first layout.

---

## 1. Play-test findings

How: `node tools/sim.mjs --targets` and `--days 45` for each class (seed 1); Chromium at 360 x 740
on a new game and the four fixtures, every tab and every view (no page errors).

### 1.1 Dead zones in the curve

1. **After the Region 2 boss the game stops.** The boss falls on day 28-31; from day 31 to 45 the
   front moves 72 to 74 (Lightkeeper 77). The Warden has **17 empty check-ins in a row** and 54 of
   135 in all; the longest gaps without a meaningful upgrade are 269 (Warden) to 505 (Lanternmage)
   active minutes. Only the level-200 cap binds.
2. **Region 2 is Region 1 recoloured.** Days 7-30 are the longest stretch of the game, and zones
   36-70 cycle the same 7 foes with a hue shift (the late fixture at zone 37 is "Batwing Caves
   VI"). The Region 1 boss is an Elder Marsh Wraith V; its Great Lantern is one toast.
3. **P4 fails again:** Lightkeeper 5 empty check-ins in a row before the Region 2 boss (78 active
   minutes), Ranger 3 (at the limit). D1 is 18-19 (accepted by the coordinator).
4. **The Camp ends on day 21-24** and is static after (the Ranger stops at 48/53: the sim never
   walks back for Soft Hide).

### 1.2 Choices that do not matter

5. **Gold after Region 1 buys little.** Promotions cost `60 x (rank + 1)` foes' worth (under half
   an hour of fighting). The Blade's price grows x1.18 a level, so a new zone's income buys about
   one Blade level (about +2%). The late fixture holds 6B gold with Blade priced at 12.5Qa and
   Fortune at 240T, with no hint why.
6. **Gathering after mid-game.** Gathering skills reach 110-120 by day 30; Emberite comes at 60 a
   minute against an 18-unit recipe, and Hearth 10's 200 Lanternwood is 6 minutes.
7. **The bench.** On day 45, 9 of 15 recruits are still level 1. `autoField` picks by raw power
   and ignores synergies, though the best line-up is about 2.5x a random one.
8. **Nothing new drops after zone 42** (Starlit gear). The 13 uniques are stat lines. The 6
   companion uniques (party spec 5.3, task B4) were never built, though the Codex counts them.

### 1.3 Systems that do not connect

9. Expeditions stop at band V (all open by day 7). The Codex, the Omens and the uniques know only
   Region 1. Nothing past zone 35 feeds a system.
10. Old live saves (the late fixture at zone 38) start every new system from zero: Hearth 1, the
    Deepwell locked behind Hearth 3, Foraging 1, no guidance for why.

### 1.4 Confusing screens (360 x 740)

11. Long scrolls on a late save (content area 528 px): Party Team 1,221 px, Roster 1,573,
    Craft Make 1,412, Camp 1,296.
12. Fight > Upgrades late: three rows, one maxed, two priced far past your gold. It reads as broken.
13. Old saves open on two long notices stacked over the top of the stage (retool and Codex).

What works well: the first hour (onboarding, first recruit at about 20 minutes), the game-first
layout, the HUD, the B1 art, class parity (T3 0.86-1.09), recruit pacing (T16), and the Deepwell
as a weekly lab.

---

## 2. Goals for plan 2

| # | Goal | Measured by |
|---|---|---|
| G1 | A named goal every week from day 7 to day 60: a coast cycle, Silas the Fogbound, an Oath level, a legendary power, a pinnacle boss | the `--days 60` run's goal log |
| G2 | No dead stretch: at most 3 empty check-ins in a row to day 45 for every class, **including after the Region 2 boss** (today 17) | P4, R2, R9, O7 |
| G3 | Line-ups matter: the tide and the Vows make the best line-up differ by situation, and `autoField` plans for synergies and roles | R3, O-examples, AF targets |
| G4 | Build variety: 3+ viable hero power pairs per class, 4 circle sets, Constellation keystones with their [C] parts | L4, L5 |
| G5 | Fair forever: no new currency for sale, no timed power; the only clock is the tide, which repeats every 24 minutes | review |
| G6 | Fast and smooth: every merge passes `perf.mjs --quick`; art only for the coast and the pinnacle bosses | perf budget |

Not in plan 2 (proposed to the owner, not chosen): a companion endgame (Lanternborn forms, bond
stories) and Deepwell heat levels. Oaths cover most of what heat levels would give.

---

## 3. Waves

Rules for every task: its own worktree and branch; own the files named; touch shared files only
at the extension points in docs/ARCHITECTURE.md with small edits; `node tools/build.mjs` and
`node tools/check.mjs` pass; `node tools/perf.mjs --quick` passes on the phone profile; per-frame
and per-tick work stays cheap (cache on events, never rebuild DOM per tick).

**Every wave ends with the same checks** (coordinator): `sim --targets`, `sim --days 45` per class
(`--days 60` from wave 3), `perf.mjs` full, a play-test of a new game and the fixtures at 360 x 740,
the preview republished, the wave log updated.

### Wave 1: party combat lands, and its follow-ups

Stage C (C1-C3, and C5 if it is not in the current branch) merges first. Then:

| Task | Work | Owns | Small edits in |
|---|---|---|---|
| **C4** Combat visuals | Packs of 3, per-unit hit and heal numbers, shields as white bar segments, threat pips, dives, dashes, intercepts, telegraph colours (red heavy hit, blue dive, green heal, grey shell), wipes and the retreat, reduced motion | `src/js/61-anim.js`, `src/js/62-stage.js` | - |
| **C6** Class follow-ups | Route the Constellation `tune:` knobs through `tn()` (guardT, wallT, wallPause, wall, flare, flarePerEmber, hasteT, bless, hymn, hymnT, lkShare, lkAura, autoEff, autoCd); keystone [C] parts (`STAR_KS`); the Warden aura (tanks +40% HP, +20 armour); the Mending Draught `heal` key | `src/js/55-party.js` | `src/js/55-crafting.js` (tonic key) |
| **W6** Deepwell on party combat | Packs, HP carried between floors, wipes end the run, Elder telegraphs, the 9 [C] boons and the Guard and Mend sets; D8: a below-only damage Lore rank; the `well` theme, cold palette, lantern colour and trail from `S.deep.eq` | `src/js/59c-deepwell-combat.js` | `src/js/57d-deepwell.js`, `src/js/63-scenery.js` (theme), `src/js/62-stage.js` (lantern colour) |
| **AF** Line-up planner | `autoField` v2: scores synergies, roles (a tank and a support when the hold estimate needs them), formation cells and the zone's foe behaviours; "Best line-up" explains itself in one line ("Hedgefolk + Shield and Hearth"). Used by the Tide Chart and the Oath rules later | `src/js/56d-autofield.js` | `src/js/56-roster.js` (call it), `src/js/75-party.js` (the explanation line) |
| **R0** Regions and the Great Lantern moment | `REGIONS`, `zoneType`/`zonePlace`/`zoneCycle`/`zoneName` region-aware, the reader audit (region-2.md 12.3), the full-screen Great Lantern card for zone 35 (old saves: a bell notice), the Lantern Road strip on the Camp view | `src/js/22-data-regions.js`, `src/js/75-lantern-ui.js` | `src/js/40-rules.js`, the readers in region-2.md 12.3, `src/js/57e-constellations.js` |
| **Q1** Quality fixes | The Watchtower hold hint uses `partyHoldEstimate`; Fight > Upgrades says "Best spent on promotions now" when the next Blade level is over 100x your gold; old-save notices collapse into one "What's new" notice; Omen Go and synergy chips to 44 px; check.mjs pins the Omen for the whole run (if not already) | - | `src/js/57-camp.js`, `src/js/71-ui-fight.js`, `src/js/70-ui.js`, `src/js/55-almanac.js`, `src/js/56b-synergy.js` UI, `tools/check.mjs` |
| **BAL2** Balance after Stage C | Retune T1-T3, T16, P1, P2 with combat on; fix P4 for the Lightkeeper; the sim's Ranger walks back for Soft Hide (camp C1); `--days 60` report | `tools/sim.mjs` | the tuning tables (`PACE`, `ROSTER_TUNE`, `COMBAT_TUNE`) |
| **D2** Pinnacle bosses spec | Four pinnacle bosses (section 4) at the rigour of region-2.md | `docs/design/pinnacles.md` | - |
| **D3** Live-save welcome (if the owner agrees, question 2) | A one-time "Welcome back" for saves that predate the Camp: the Hearth is built up to the level their max zone allows (buildings stay as they are) | `src/js/55-welcome.js` | - |

Order: Stage C, then C4, C6, AF, R0 and Q1 in parallel (separate files), BAL2 last. D2 runs any time.

### Wave 2: the Sunken Coast (region-2.md)

| Task | Owns | Small edits in |
|---|---|---|
| **R2-1** Coast data | `src/js/22-data-coast.js` | `src/js/30-state.js` (`mats.pearl`) |
| **R2-2** Tide, 7 foes, 7 elders, Silas the Fogbound, the tide in the hold estimate | `src/js/59d-coast.js` | `src/js/59b-enemies.js` (behaviour registry), `src/js/59-combat.js` (tide multipliers, estimate option) |
| **R2-3** Pearls, Tide Pools, settings, Tide Chart, beats, the Coast lantern, rank 8 Lanternlit, goals, bounties | `src/js/55-coast.js` | `src/js/55-gathering.js`, `src/js/56-roster.js` (rank cap), `src/js/55-bounties.js` |
| **R2-4** Coast UI: tide chip and sheet, Tide Chart row, Set a pearl, beat cards | `src/js/75-coast-ui.js`, `src/styles/60-coast.css` | `src/js/62-stage.js` (HUD slot) |
| **R2-5** Art: 7 foe rigs, the Keeper, the Tide Pool node, icons; `shore`, `wreck`, `drowned`, `lighthouse` themes, the water band, the relit lamps | `src/js/13b-art-coast.js`, `src/js/63b-scenery-coast.js` | `src/js/63-scenery.js` (`registerTheme`) |
| **R2-6** Writing: arrival lines, 5 beats, Keeper lines, 10 Lore pages | `src/js/21b-stories-coast.js` | - |
| **R2-7** Wiring: expedition bands VI-X, Codex rows, 3 Omens, the `tide` feature | - | `src/js/57b-expeditions.js`, `src/js/57c-codex.js`, `src/js/55-almanac.js`, `src/js/55-onboard.js` |
| **R2-8** Sim and balance: `--chart`, `--settings`, R1-R9, fixture `save-v3-coast.json` | `tools/sim.mjs`, `tests/fixtures/save-v3-coast.json` | `tools/check.mjs` |

Perf focus: the coast scenes (four new themes, a dry and a flooded ground bake, the cross-fade) and
the new rigs' lazy bake. Budget R8: at most +1 ms JS per frame p95 on the phone.

### Wave 3: Oaths, legendary powers and circle sets (oaths.md, legendaries.md)

| Task | Owns | Small edits in |
|---|---|---|
| **O1** Oath core | `src/js/55-oaths.js` | `src/js/59-combat.js` (foe modifiers, pack composition, estimate option), `src/js/56-roster.js` (autoField filter), `src/js/55-onboard.js` |
| **O2** Oath UI | `src/js/75-oaths-ui.js`, `src/styles/60-oaths.css` | `src/js/70-ui.js` (zone-row slot), `src/js/62-stage.js` (flame ring) |
| **O3** Codex and stats | - | `src/js/57c-codex.js`, `src/js/55-stats.js` |
| **L1** Powers and sets data | `src/js/21c-data-legend.js` | - |
| **L2** Legend core: Book, drops, Echoes, Learn, Inscribe, Mark, Sigils, limits, sets | `src/js/55-legend.js` | `src/js/41-items.js`, `src/js/55-crafting.js`, `src/js/57b-expeditions.js` |
| **L3** Combat powers | `src/js/59l-legend-combat.js` | `src/js/55-party.js`, `src/js/59-combat.js` |
| **L4** Legend UI | `src/js/75-legend-ui.js`, `src/styles/60-legend.css` | `src/js/57c-codex.js`, `src/js/75-party.js` |
| **L5** Icons | `src/js/11b-art-legend.js` | - |
| **O4 + L6** Sim and checks: `--oath`, `--legend`, O1-O9, L1-L8, caps | `tools/sim.mjs` | `tools/check.mjs` |

O1 and L2 meet at `legendDrop(rank, source)`; either may merge first (oaths.md 8).

### Wave 4: pinnacle bosses and the long tail

| Task | Work | Owns |
|---|---|---|
| **PB1-PB3** Pinnacle bosses (from D2's spec) | Core fights, UI, art (4 boss rigs) | `src/js/59f-pinnacle.js`, `src/js/75-pinnacle-ui.js`, `src/js/13c-art-pinnacle.js` |
| **RD** The Lantern Road | The strip becomes a small map sheet: regions, lit lanterns, each zone type with its best Oath Seal and mastery stars, tap to travel. The owner's "visibly relit world map", light | `src/js/75-road-ui.js`, `src/styles/60-road.css` |
| **CD** Cosmetics drawn | Camp decorations (Codex, Deepwell, the Saltreach Lens) in the camp scene; lantern colours and trails on the stage | owners of the camp scene and 62-stage (small edits) |
| **D4** Region 3 spec | The Emberwaste (zones 71-105): heat, ash, the Ashen Wyrm's home, tier 6 gear, what completes P3 | `docs/design/region-3.md` |

### Wave 5: the horizon (owner-gated)

| Task | Work |
|---|---|
| **F1** The first festival | The Lantern Festival in midwinter (vision system 8): a festival currency, cosmetics and a themed Deepwell, back every year. To land before December, it starts after wave 3 at the latest (question 3) |
| **D5** Companion endgame spec | Lanternborn forms and bond stories (owner option 6), for plan 3 |

---

## 4. Pinnacle bosses (brief for D2)

- **What:** four hand-made boss fights that use every Stage C mechanic at once (heavy hits,
  row attacks, dives, heals, adds, the tide), each with 3 phases and a 90s timer.
- **Unlock:** after Silas the Fogbound and an Oath of 15 kept. Always open; no weekly lockout and
  no timed rewards.
- **Pick your pressure:** each pinnacle takes the Oath sheet's Vows (oaths.md), so its difficulty
  climbs with the player.
- **Rewards:** first kill: a pinnacle-only legendary power (4 in all) and a title; every kill: a
  rank V roll with pity and Echoes; a personal best time per Oath level (bragging, local).
- **Art:** four boss rigs (the only new art in wave 4) and one arena variant each.
- **Story:** each ties a loose thread: the Hollow King's fall (Corvin), the Ashen Wyrm's first fire
  (Caedmon), the voice under the water (the coast), who dug the Deepwell.

---

## 5. Known follow-ups carried into plan 2 (from the wave log)

| Follow-up | Where it lands |
|---|---|
| Constellation `tune:` knobs and keystone [C] parts; Dawnbringer too strong, Pack Leader free, Sanctuary Hymn no upside, Glass Lantern Flare bonus | C6 |
| Warden aura (no damage until Stage C) | C6 |
| Mending Draught needs a `heal` key | C6 |
| Deepwell [C] boons, D8 miss, `well` theme, hide the zone HUD natively, cold palette, lantern colour and trail, camp decorations from `S.deep.cos` | W6, CD |
| `autoField` ignores synergies | AF |
| Hold hint before and after Stage C | Q1 |
| check.mjs date-dependent tests (pin the Omen) | Q1 |
| Small targets: Omen Go (36 px), synergy chips (36 px), the Expeditions section | Q1 |
| Card-level progressive disclosure left: hero rows, camp list, almanac cards | Q1 (the long scrolls in 1.4) |
| Expedition sim policy (E1-E10), route icons, lore texts | R2-6 (coast Lore), R2-8 (sim policy) |
| The Ranger camp sim does not refarm Soft Hide | BAL2 |
| D1 about 18-19 (accepted) | no change |
| P3 needs Region 3 power: ranks past 7, tier 6 | rank 8 in R2-3; tier 6 in D4 |
| Companion uniques (B4) never built | legendaries.md 3.5 (L1-L3) |
| Art polish backlog (fibre and hide icons, skin ramp, Vesper's lute) | only if a wave touches those files |

---

## 6. Risks

- **Stage C slips:** waves 2 and 3 depend on it (rows, HP, telegraphs). Wave 1's R0, AF and Q1 and
  the D-specs can run before it; O1's Vows can start on today's combat for HP, damage and timer
  Vows only.
- **Pacing drift:** three new power sources (Pearl settings, legendary powers and sets, rank 8).
  Each has a cap or a target in its spec, and BAL-style checks run at the end of every wave.
- **Performance:** four coast themes with a flooded variant each double those scenes' cache
  memory. R8 and the perf budget guard it; the fallback is a single ground bake with the water band
  drawn as one cached strip.
- **Scope:** wave 2 is the largest (8 tasks). If it must shrink, cut to 4 coast types (Shingle,
  Wrecks, Lagoon, Coral Nave) and 2 themes, keep the tide, the Keeper and Pearls.

---

## 7. Open questions for the owner

1. **Late-game order.** No pick has come in, so this plan uses the coordinator's recommendation:
   **the Sunken Coast, then Oaths with legendary powers and circle sets, then pinnacle bosses.**
   Recommended: **confirm it**. Each step fixes a finding: the coast fills days 7-30, Oaths and
   powers fill the weeks after the Region 2 boss, and pinnacles give the top end a goal.
2. **A welcome for old live saves.** Players on the live game who are past zone 20 will meet the
   Camp at Hearth 1 with its first builds priced for their zone. Recommended: **yes, a one-time
   welcome that builds the Hearth to the level their max zone allows** (only the Hearth; other
   buildings are still theirs to build), so they reach the Deepwell and Oaths without a week of
   catch-up.
3. **The first festival.** The Lantern Festival is midwinter. Recommended: **build it right after
   wave 3**, cosmetic rewards only, so it lands before December and comes back every year.
