# Milestones

Version 2, 2026-10-07 (card `m1-define`; red team and Opus judge applied). Owner: Claude. Cal can veto any line; nothing
waits for him. Rulings: `docs/DECISIONS.md`, "Milestone 1 (2026-10-07)". Records: `docs/design/milestone-records/`.

Work goes in milestones. A milestone is a slice of the game that must feel finished, with exit criteria a script or a panel
can check. Every card names its milestone in a `Milestone:` line. Without one, a planner may not start it.

## The line-up

| Milestone | Slice | Closes when |
|---|---|---|
| **M0 "The first hour"** | Minutes 0 to 60 (zones 1 to about 10), `docs/design/first-hour.md` | F1 to F9 hold on two Monday builds, every 18:16 Cal note reads "fixed" or "better" in the Sunday review, the leaky replay finds 7 of 12 (playbook, "Self-improving system"). Opens the store gate (P6, the scorecard's store-ready rule). |
| **M1a "The Hollow, first three areas"** | Zones 1 to 15 (Mossy Hollow, Batwing Caves, the Bonefield); Champions: the Briar Regent (5), the Hollow Cantor (10), the Ossuary Marshal (15) | E1 to E8 below, measured at zone 15, then the close steps. |
| **M1b "The Hollow, finished"** | Zones 16 to 35 and the Fenmother | The same eight criteria with the zone numbers moved to 35 (Elder band 20 to 40% casual; E3 adds the Fenmother). Written out as its own section when M1a closes, or when two M1b packs are vetted, whichever comes first. |
| M2 and later | Not planned. The Sunken Coast is the likely next slice. | Written from M1b's "what's left" note. |

M1a contains M0: the first hour is the opening of the Hollow. M1a does not close before M0 does.

## Why this slice

The Hollow is all of Chapter 1 and the only region with real content (the Coast reuses its foes and scenery). A player who
finishes it has met every loop step (the four timescales in the Compass, section 3), every core system and a complete story. It is the smallest slice
that tests the hook, and it leaves a part of the game a store page can show.

Why split in two: the art lane is paused (0 packs a week today), and one milestone that waits on 40 or more packs lets a
stalled lane freeze every planner. M1a is measurable with today's tools and closable on a realistic art bill. M1b keeps
the goal "The Hollow, finished" and the Fenmother in M1, not M2.

Alternatives rejected: Regions 1 and 2 together (doubles the art and balance bill, adds no loop step); the first hour only
(already M0; cannot test the day and week timescales); breadth across five regions (the audit's finding: wide and thin).

## What M1 is not

No Coast content, no new heroes' kits (the three starters carry the lamp), no new online features, no new currency (the
Compass ceiling of 8 core counters holds), no sold item. Money stays gated by P6 and Cal.

## The eight exit criteria (M1a, at zone 15)

All eight hold on the same Monday build, no earlier than M0's second Monday build. **Earliest close: 2026-10-19, if the art lands.** The
2026-10-07 walk still missed F3, F4 and F5.

| # | Criterion | Check |
|---|---|---|
| E1 | **M0 is closed.** | Playbook M0 line; scorecard F1 to F9; `walk.mjs --strict`. |
| E2 | **Health in band, with no open gaps.** Every difficulty-budget band to zone 15 is met for each starter; **zero rows in `difficulty-budget.json` "gaps" at or below zone 15** (renewing a dated gap does not pass); no stall (`stallCount` 0, casual and active). Bare heroes lose to bosses and gear decides the win (Cal, 2026-10-07): gate `z5-boss-bare`, `z10-boss-bare` and a new `z15-boss-bare`. Judge numbers: z10 and z15 bare casual 5 to 25%, good play at most 70%; z5 bare casual 20 to 50%; kept-up casual minus bare casual at least 40 points at z10 and z15; first-crafts row minus bare at least 25. The boss-tiers-pr2 judge may tune them with a DECISIONS line. boss-tiers-pr4 (move sets) leaves kept-up at z8-15 as a dated gap (DECISIONS "Boss tiers, move sets (PR 4)"). Champions: z5 60 to 85% casual, z10 and z15 40 to 60%. | `node tools/health.mjs --compare` (it runs the `budget.mjs` band gate, `tools/budget.mjs` line 17); new: `budget.mjs --slice 15` and `health.mjs --slice 15` exit 1 on any open gap or stall. |
| E3 | **Every fight kind in the slice runs as a turn fight.** The world raid is outside the slice. | Existing `check.mjs` sections "C29 turn fights (core)" and "C29 Deepwell and Provings in turns (core)"; new section `slice-turn-check`: spawn a zone foe, an elite, a Captain, each slice Champion and a Deepwell floor; assert `turnCombatOn() && mob.turn` and that the hero takes damage only in foe phases. M1b adds the Fenmother. |
| E4 | **Every fight and place in the slice has vetted art, wired.** A zone keeps today's live art until its pack is vetted and wired; "a decided stand-in" never counts as a pass. | `node tools/art/embed-foes.mjs --check` and `embed-bg.mjs --check`; new section `slice-art-manifest`: every zone up to 15 resolves its foe, its Captain and the area Champion to a `FOE_ART` key and each area theme to a `BG_ART` key, and each pack has a "wire" ruling in DECISIONS (Art). Fails today by design. Walk F10 = 0 covers icon tiles only. |
| E5 | **Every system that opens in the slice is explained once, and none arrives too fast.** Every hero who can join in the slice has a playable kit, or is not offered until one exists (old saves keep anyone they already have). | New section `unlock-tip-coverage`: every `FEATURES` unlock reachable at or below zone 15 has a guide line or first-use hint (base: "first-use lines (ap-first-use-hints)"); F4 on `walk.mjs --strict` for the first hour; an unlock-spacing metric in `health.mjs` (active persona) for zones 10 to 15. |
| E6 | **Clean at 360px and 740x360, no page errors, rarity shown.** | `node tools/eyes.mjs --strict` at both sizes, 0 findings; `walk.mjs --strict` for each of the three heroes in portrait and one landscape run; new `walk.mjs --fixture early` from save-early (zone 8) to zone 15 with 0 page errors (R4). |
| E7 | **Chapter 1's first three areas play end to end.** The opening, every scripted scene on a post to zone 15, the three Champion scenes, each person who meets you at the right post. | `docs/review/story.md` hard checks; walk shows the story beats; new `champion-scene-check`. |
| E8 | **A cold panel finds no blocker, a late leg holds, saves are safe.** E8a: panel report on the release candidate (F7 to F9, and R1: it wins 4 of 5 against last week's build). E8b: 5 cold players start from a new zone-13 fixture, play 20 minutes, and at least 3 of 5 want to keep playing. A targeted play prompt goes to Cal (his answer is never a gate). | `playtest.mjs new <fixture>` (a new `save-z13` fixture file in `tests/fixtures`; the command already takes a fixture name); `check.mjs` "saves" section loads all three fixtures; Opus save-risk review. |

## Close steps

A weekly design review (cross-system), a cut-or-merge review (the two weakest systems by use and connection get a card),
the targeted play prompt and a "what's left" note that seeds M1b or M2. The digest reports the close.

## Content budget

### Needs

| Unit | M1a (zones 1 to 15) | M1 whole Hollow | 1.0 (five regions) | Done today |
|---|---|---|---|---|
| Zone monsters | 15 | 35 | 175 | 2 (Thorn Imp, Gloomjaw; area 1 has 5 foes, 3 new) |
| Captains (own looks and moves) | 15 | 35 | 175 | 0 (neither pack supplies one) |
| Champions | 3 | 7 | 35 | 0 |
| Elders | 0 | 1 (the Fenmother) | 5 | 0 |
| Area backgrounds | 3 | 7 | 35 | 1 (Mossy Hollow night) |
| Playable heroes with kits | 3 | 3 | 32 (design) | 3 |

The first-hour and cache packs, the Wren and Tobin ability icons, the starter portraits and the three intro stills are
already carded and count toward E1 and E4.

### What Codex delivers

**Codex throughput is unmeasured. The lane is paused.** Two monster packs landed on
2026-10-01 and 2026-10-02, then nothing, and `codex-art-ability-icons-4` is blocked on the same fault. The first 4 weeks
after the lane resumes set the rate. Art cards start first, because they set the close date.

**Re-plan trigger.** If the lane is still paused on 2026-10-21, or fewer than 2 vetted packs land in the first 4 weeks after
it resumes, the judge re-cuts M1a's E4 to zones 1 to 10. Zones 11 to 15 keep their live art and move to M1b. The change goes
in DECISIONS.

### The stand-in: kin inside whole packs, drawn by Codex

The art freeze stands (`CLAUDE.md`: whole vetted packs, no stopgaps, no code-drawn art, no wiring or retuning of existing
art). Under it:

1. **Codex draws everything:** monsters, kin, Captain looks and moves, Champions, the Fenmother and background versions.
   Claude writes the briefs, wires each pack (one `integrate:` card per pack, S) and runs the art judge pass.
2. **Area pack:** an area's zone monsters plus their five Captains. Codex may draw a monster as kin of another monster in
   the same area: the same body with its own palette, marking or prop, and any pose its moves need.
3. **Champion packs:** one per Champion, a different creature with its roster name and story.
4. **Backgrounds:** one backgrounds pack per milestone: Codex paints each area's palette and light version of the Mossy
   Hollow night painting. The Wraithmarsh is a new painting.
5. **No agent recolours or tints art in code.** The Deepwell cold palette stays the only runtime recolour. Zones keep today's
   live art until their pack lands.

**The honest bill** (each item is one Codex card, then one Claude `integrate:` S card):

- M1a, 7 packs: the area-1 sheet (Briarbound Ravager, Thornwing, Nightseed Sorcerer, plus Captain looks and moves for all
  five area-1 foes); the Batwing Caves area pack; the Bonefield area pack; the Briar Regent, Hollow Cantor and Ossuary
  Marshal packs; one backgrounds pack (Caves and Bonefield).
- M1b, 10 packs: 4 area packs, 4 Champion packs, the Fenmother, one backgrounds pack (three versions and the Wraithmarsh).
- The Hollow is 17 packs. 1.0 is about 3 packs an area (area pack, Champion pack, background share) plus one Elder pack a
  region: roughly 110 packs, not 215 species. This is a scope estimate, not a commitment. All 215 named enemies and their
  moves stay in the data.

The heroes stay at 32 in the design. Kits for the other 29 are decided region by region when each region's milestone is
written. Until a hero has a kit they are not offered in a slice (Bram, who can join from zone 10, is the one case in M1a).

## The gap list (M1a)

Sizes: S one small PR, M one feature PR, L a stream or design plus build.

| Criterion | Existing cards | Cards to write |
|---|---|---|
| E1 | unlock-gap-trial, unlock-voice (running), walk-bot-follow-up (running), first-hour-art, cache-art, cache-looks, early-polish | none |
| E2 | boss-tiers-pr3 (running), pr2 (carries the budget extras and `z15-boss-bare`), pr4, tobin-safety-margin, gear-weight, resolve-bag-ways, gold-without-training, craft-attribute-grades, weapon-profiles, refine-queues, first-gold-and-camp-strip, active-gold-direction, crafting-levelling-spec | `budget.mjs --slice` and `health.mjs --slice` (S) |
| E3 | none (deepwell-turns and provings-turns closed) | `slice-turn-check` (S) |
| E4 | codex-art-ability-icons-4, wire-ability-icons-wren-tobin (both wait on the Codex lane), starter-portrait-sprite-match, hero-portraits (running) | 7 Codex packs, 7 `integrate:` (S), `slice-art-manifest` (S) |
| E5 | unlock-voice, ap-first-use-hints, abilities-stars-menus, gather-tip-spacing-stall | `unlock-tip-coverage` (S), `later-heroes-hidden` (S) |
| E6 | portrait-banner-over-hero, moment-cap-headroom (running), craft-moments-show-rarity (card file missing: write it), early-polish | `walk-fixture-start` (M) |
| E7 | starters-join-when-met (blocked), story-systems-fixes, story-encounter-hooks | `starter-meet-scenes` (S, unblocks the first), `champion-scene-check` (S) |
| E8 | none | `fixture-z13` (S), `m1-panel` (M), `save-risk-review` (S) |

About 45 Claude cards (roughly 6 L, 14 M, 25 S) and 7 new Codex packs.

**Pace.** Time is set by one chain, not the card count. About a dozen cards share the foes, econ-sim and craft areas and run one
after another: boss-tiers-pr3, pr2, pr4, tobin-safety-margin, gear-weight, resolve-bag-ways, gold-without-training,
craft-attribute-grades, weapon-profiles, refine-queues, first-gold-and-camp-strip and story-encounter-hooks. That takes about
3 to 4 weeks with one slot; the other five slots carry everything else. The art lane sets the close date.

## Card tags

Every `ready`, `running` or `blocked` card, as of 2026-10-07. **IN** moves an exit criterion and takes slots first.
**SUPPORT** is tooling the milestone is measured with (at most one slot in six). **OUT** does not move a criterion: parked,
not deleted; a planner may start it only when no IN card can use the slot, and says why in its `Milestone:` line. **CLOSE**
is stale or superseded; the Foreman closes it with the reason.

| Card | Tag | Criterion or reason |
|---|---|---|
| walk-bot-follow-up | IN | E1 |
| boss-tiers-pr3, boss-tiers-pr2, boss-tiers-pr4, tobin-safety-margin, gear-weight, resolve-bag-ways | IN | E2 |
| gold-without-training, craft-attribute-grades, weapon-profiles, refine-queues, first-gold-and-camp-strip, active-gold-direction, crafting-levelling-spec | IN | E2 (crafting matters, Cal 2026-10-07); the two design cards may close once the builds supersede them |
| unlock-gap-trial, unlock-voice, ap-first-use-hints, abilities-stars-menus, gather-tip-spacing-stall | IN | E1, E5 |
| first-hour-art, cache-art, cache-looks, early-polish, hero-portraits, starter-portrait-sprite-match, codex-art-ability-icons-4, wire-ability-icons-wren-tobin | IN | E1, E4 (the last two wait on the paused Codex lane) |
| portrait-banner-over-hero, moment-cap-headroom, craft-moments-show-rarity | IN | E6 (the moments check wants rarity shown; the last has no card file yet, write it) |
| m1-define | IN | This card |
| starters-join-when-met, story-systems-fixes, story-encounter-hooks | IN | E7 (the first after `starter-meet-scenes`) |
| ap-error-watch, perf-on-ci-runner, cleanup-unlock-tune, f-rubric-edits-canary-2026-10-05, craft-reveal-flake-watch | SUPPORT | E6 and CI health |
| ui-gather-ledger, ap-collection-counts, menu-polish | OUT | E5 is measured by tip coverage; menu-polish depends on ui-gather-ledger |
| bag-slot-and-steady-charges | OUT | M1b; needs refine-queues and boss-tiers, and the Compass overwhelm check |
| omen-dares-and-contracts | OUT | Touches online-adjacent Tavern UI, which needs coordinator sign-off |
| story-choices | OUT | A new system; revisit at M1a close |
| story-scripts-2-5 | OUT | Chapters 2 to 5 are Regions 2 to 5 |
| story-stills | OUT | Seven season stills; the three first-hour stills are in first-hour-art |
| hero-voice-variety, hero-voice-fire-lit | OUT | Cut by the hero-voice ruling (starters only, nine moments) |
| deepwell-turns, provings-turns | CLOSE | Already built; proved by `check.mjs` "C29 Deepwell and Provings in turns (core)" |
| budget-extras-from-boss-tiers-review | CLOSE | Folded into boss-tiers-pr2 |
| bossodds-chunk-seeds | CLOSE | Merged as #93 |
| hero-training-policy | CLOSE | Training was removed by hero-progression-rework |
| moments-feel-spec | CLOSE | Superseded by moment-layer (early-game judge, R4) |

## How planners use this

- The Foreman picks only IN cards (and one SUPPORT at most) until an exit criterion has no IN card left that can start.
- A new card needs a `Milestone:` line: `M1a (E#)`, `M1b`, `M1 support`, or `Later (reason)`. The idea gate scores milestone fit.
- Art cards start first: they set the close date.
- When a criterion cannot be met as written, the card says so and the judge changes the criterion in this file, with the
  change recorded in DECISIONS. A criterion is never dropped silently.
