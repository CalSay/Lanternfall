# Rubric: mechanic

For new or changed mechanics, systems, hero kits and combat rules. Coverage-map areas 4, 5, 6, 10, 14.

## Hard checks

- Build passes: `node tools/build.mjs`.
- Full `node tools/check.mjs` passes, with a check section added for the new behaviour. Skipped sections are named.
- Save safety: every new field has a default in `fresh()` or `registerState`; an old save loads without loss; no
  existing field renamed or repurposed; the save key is unchanged unless the card says otherwise.
- Active and away parity: the same gold, essence and materials whether watched or not.
- Exact-once payouts: no duplicate or lost rewards on tab switch, reload or away return.
- Online layer untouched (`world/boss`, `raiders`, room, `80-online`).
- Rules in `CLAUDE.md` and `docs/DECISIONS.md` hold (combat active only, solo hero, no prestige).
- Shared files edited only at the extension points in `docs/ARCHITECTURE.md`.

## Scored criteria

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| Fit with the Compass | Works against a pillar | Fits, adds nothing the pillars asked for | Serves a named pillar and the card's player problem |
| Connects to other systems | Stands alone; its outputs are used by nothing | One output feeds one other system | Feeds and is fed by existing systems; nothing is dead |
| No dominant option | One choice always wins | A best choice exists but others win in some cases | Sim shows each option wins somewhere |
| Complexity added | A new currency or menu with no clear reason | One new idea, explained once | Simpler to play than before, or adds one idea cheaply |
| Player clarity | Player can't tell what happened or why | Clear after one try | Result and cause are visible in the moment |
| Reversibility | Can't be switched off without a save break | Can be hidden behind a flag | One flag turns it off cleanly |

Until `docs/design/compass.md` exists, score "Fit with the Compass" against `docs/DECISIONS.md` instead: 1 = breaks a standing decision, 3 = follows every decision and adds nothing the card's player problem needed, 5 = follows every decision and solves the card's player problem.

## Blocking

Any failed hard check; a score of 1 or 2; a way to lose or duplicate rewards; a dominant option that makes other
choices pointless.
