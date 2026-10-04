# Claude handoff: official 34-hero concepts and ability designs

Owner Cal explicitly authorized this handoff on 4 October 2026. All **34/34 selected playable hero concepts are officially signed off**: 11 Warriors, 8 Rangers, 15 Mages. The roster is 21 retained heroes plus 13 selected additions. This supersedes earlier pending concept-review language and correction requests, including the accepted residual notes in earlier passes.

Branch: `codex/official-34-hero-handoff`. Based on `22d111d98593f81b2da335845f1d423e83035ed0`; ability-design checkpoint `227bda460a6c89f03da3cafb2ad6278431e24c14`. Latest remote references were fetched without merging. Claude remains the upstream integration coordinator. This is an art/design handoff, not a request to publish or deploy.

## Official art

- [All 34 concepts by class](concept-list.md).
- [Machine-readable official catalog](official-concepts.json): exact source PNG, SHA-256, direct owner decision, class, ID and originating kit for every hero.
- Repository approval registry: `docs/design/hero-concept-approvals.json`. Hash validation: `tools/hero_concept_approvals.py`.
- Self-contained profiles: `docs/design/selected-34-heroes.html`; concept gallery and historical comparisons: `docs/design/hero-concept-corrections-review.html`.

Use the catalog's exact files as official design references. Older drafts remain as history; do not choose a different revision by filename or regenerate approved concepts. All heroes carry lanterns. The mage design direction is staff plus tome. Grenna and Bram retain the future crafting/skilling dependency. Two-handed equipment/offhand handling and new weapon compatibility still need implementation decisions. Existing accepted reviewer notes are recorded in the registry and historical pass files; they are not unfulfilled owner concept-approval gates.

Concept approval does **not** approve production poses or complete animation packs. Mandatory pose lock and Sprite Forge rules still apply. Establish a compliant owner-approved native master/kit before production pose work; these large presentation boards are not 224×192 pose-lock masters. Preserve frozen approved Wren, Tobin and Pip game packs. No artwork was wired into runtime by this handoff.

## New heroes and complete ability reworks

The thirteen additions are Nerys Fleet, Mab Vale, Peregrine Clocks, Tamsin Rook, Sable Quill, Ione Hart, Adela Wych, Ysabet Fen, Eamon Grey, Celandine Orr, Flint Mercer, Merrick Low and Gideon March. Canonical aliases preserve the owner's input spellings Tasmin, Celadine and Merrick Lowe; no new runtime rename is implied.

All source files below are on this branch; [data-index.json](data-index.json) records paths and checksums.

| Data | Authoritative file / purpose |
|---|---|
| Roster, IDs, classes, aliases and exclusions | `docs/design/roster-34.json` |
| Thirteen new heroes | `docs/design/hero-new-abilities.json`: lore, visual design, equipment, core mechanics, tokens, all cards and three-slot routes |
| Original 21 reworked heroes | `docs/design/hero-dossier.json`: full kits, resource/timing rules, shared tools, Stars, subclasses, growth and NPC/bench/retired dispositions |
| Consolidated all-34 kits | `docs/design/hero-abilities-34.json`: generated complete dataset used by the HTML |
| Brynja exporter override | `docs/design/brynja-doorward-revision.json`; keep aligned with the original dossier |
| Historical candidate pool and class-gap rationale | `docs/design/hero-gap-candidates.json`, `hero-gap-review.md`, `hero-roster-revision-plan.md`; shortlist sketches are superseded by the full kits |
| Equipment direction | `docs/design/hero-accessories.md` and current direct owner instructions |
| Design summary and integration balance gate | `docs/design/hero-ability-expansion.md`, `hero-ability-balance-contract.md` |
| Independent audit evidence | `docs/design/reviews/new-hero-ability-audit.md`, `whole-roster-ability-audit.md`, `whole-roster-changes.json` |

Totals: **408 signatures** (306 actives, 102 passives), 18 distinct shared class tools, 136 optionally timed signatures, 102 three-slot workshop routes, 72 proposed Star definitions and six subclass paths. Each hero has 12 signatures plus six class tools available; only **three total selectable active/passive slots**. Basic Attack, manual Parry and manual Dodge remain core actions. Passives consume slots. No unarmed heroes, thrown equipment, fourth ability slot, automated defence or revived party combat.

The new-hero audit closed after four passes with zero actionable design findings. The independent all-34 comparison also closed with zero actionable design findings after structural/timing revisions. Revisions cover both original and new heroes: passive setup/fallbacks, resource starts/costs, status expiry, armour relevance, held-charge arbitration, queued arrivals, refund exceptions and proc-loop prevention. Read the actual contracts rather than only tooltip damage coefficients.

**Ability designs remain proposals.** Only Wren, Tobin and Pip are current implemented starters; expanded pools and other heroes are not live. Neither design-audit closure nor art sign-off establishes numerical balance. Before gameplay integration, prototype equal-budget kits in the real turn core and compare pressure, survival, recovery, setup, resource economy, control and input effort across the common foe/defence panel. Preserve the actual per-hit Parry refund. Weapon/crafting eligibility, expanded runtime pools/resources, progression/unlocks, save compatibility and production art remain separate work. Claude decides integration; no automatic merge or release is authorized here.

## Reproduce and validate

From the repository root:

```sh
python tools/hero-abilities-34.py
python tools/hero-roster-page.py
python tools/hero-concept-review.py
python tools/hero-handoff.py
node tools/build.mjs
LF_PLAYWRIGHT=/workspace/Lanternfall/node_modules/playwright LF_CHROMIUM=/usr/bin/chromium node tools/check.mjs
```

Playwright paths above describe this cloud checkout; use locally installed Playwright/Chromium selectors in Claude's environment. [validation.json](validation.json) records this handoff's actual results. No game state fields or save keys changed in the final sign-off work. No production art, gameplay abilities, shared check hook or deployment configuration was edited. No push to `main`/`claude/*`, upstream merge, game publishing or deployment is authorized or performed.

Next useful integration step: Claude reads the official catalog and full kit contracts, then selects a bounded real-core prototype milestone before converting approved concepts into complete production packs.

## Delivery status

The complete payload is pushed to the dedicated Codex branch and its remote SHA was verified. After Cal saved the API-domain network change, the notification was delivered to [Claude’s inbox](https://github.com/CalSay/Lanternfall/pull/1#issuecomment-5985301027). `INBOX_MESSAGE.md` preserves the sent message; `delivery.json` records the confirmed Git delivery and successful notification. No game publication was performed.
