# Hero progression: judge rulings on five open calls (Opus judge, 2026-10-06; card `hero-progression-rework`)

## New evidence

`arms.mjs` runs an arm's fights on one LCG stream (`fights: N`), which the difficulty-budget judge found correlates long
fights (sd about 23 points). It also skipped part of my ruling 5: the joiner's kit includes **the Scrolls the save holds
unspent**. Every zone-20 lamp holds plenty (3 moss, 19-40 hollow, 3-8 barrow), yet the joiner fought with one ability
against three. Stars are not the gap: they belong to the lamp, and the joiner had the same three active. Re-measured on
the same seed-41 saves (400 fights an arm, a hashed seed per fight, even spread, good skill, zone boss):

| From (own save) | To | PR's run | Stock Scrolls spent | Joiner's own save |
|---|---|---|---|---|
| Wren z21 Lv 30: 91% | Tobin / Pip | 100% / 78% | 100% / **88% (-3)** | 100% / 65% |
| Tobin z20 Lv 28: 100% | Wren / Pip | 33% / 36% | **44% (-56) / 54% (-46)** | 91% / 65% |
| Pip z20 Lv 29: 65% | Wren / Tobin | 27% / 97% | **44% (-21)** / 98% | 91% / 100% |

Normal fights: 99-100% everywhere. The rest is **gear**, which the lamp shares. On Tobin's save the joining Wren has
0.93x his Attack and 0.42x his health (tank health, by design), but 0.35x the Attack of her own zone-21 save: Tobin's and
Pip's lamps carry about half the gear power of Wren's. A gear tier behind costs Wren and Pip 60-80 points, Tobin about 5.

## 1. The switch misses on bosses: A (measure it right, this PR), then B (card `switch-row`)

**Ruling.** Prediction 1 is re-stated. A hero who takes the lamp spends the lamp's stock Scrolls first, as a player
would, and is held to its own budget, not the leaving hero's rate. Normal fights stay within 10 points of the hero who
leaves. Played well, the zone boss is won at least 60% (the budget's `behind` floor). No catch-up and no free learns.
**Why.** Heroes have different bands on purpose (Tobin +10 on bosses), so "within 10 of Tobin" asks Wren to be Tobin.
The rest is shared gear: a slow-killing hero's lamp falls a tier behind without that hero feeling it. `gear-weight`
and `tobin-safety-margin` own that. With 34 heroes planned, the switch needs a standing check, not a one-off script.
**In this PR (A)**, in `docs/design/hero-progression-build/arms.mjs`:
- After `soloPick`, learn what the lamp's Scrolls pay for:
  `for (const id of HERO_ABILITIES[k]) if (!abilityOwned(k, id) && !abLearnInfo(k, id).why) abilityLearn(k, id)`.
  Then equip the signature plus the first two learned in `HERO_ABILITIES` order, the shape every leaving hero uses.
- `sample()`: N calls with `fights: 1`, each with a hashed 32-bit seed from (arm, fight index), never small adjacent
  integers; N defaults to 300 (drop once `sampler-independence` lands). Add a column for the joiner's own save.
- Verify: `node docs/design/hero-progression-build/arms.mjs <snapDir> 300` matches the table above within noise.
  Re-record `arms-split.txt` and section 6. The misses (44%, 44%, 54%) do not block: record them open, owner `switch-row`.
**Card (B): `switch-row`, "A hero who takes the lamp can win the zone boss".** Lane claude. Class E + F. Model
sonnet-medium. Gate judge. After `sampler-independence`, `gear-weight`, `tobin-safety-margin`. Outcome: When I switch
heroes partway along the road and spend the lamp's Scrolls on the new hero, they win the road's normal fights straight
away. With good play they can beat the zone boss, even in gear the old hero made.
- `tools/budget.mjs` has `switch` rows at zones 20 and 30 on each starter's good-persona save (`sim.mjs --snapday`, real
  gear). Every other playable hero joins through `soloPick`, spends the stock Scrolls, spreads evenly; 240 hashed-seed
  fights for each row, hero and player. A new roster hero gets these rows with no per-hero setup.
- Normal fights within 10 points of the leaving hero (casual and good). Zone boss: 0.60+ with good play; casual, at most
  0.60 below the joiner's own kept-up row.
- Today's misses (Tobin to Wren 44%, Pip to Wren 44%, Tobin to Pip 54%) go in `difficulty-budget.json` as gaps (owner
  `gear-weight`, until 2026-12-01). All are closed at the card's end, with `health.mjs --compare` green.

## 2. Tobin's level gaps and the bar: C (no curve change); the gate is 3 zones

**Ruling.** The gate is **at most 3 zones' play** with no level-up in zones 20-30 (good persona); 2 is the target,
reported. Wren (1.9-2.4) and Pip (2.2-2.5) pass. The XP curve stays: Tobin's 5.8-5.9 is a gap owned by `mid-zone-wall`
until 2026-11-15. Casual Tobin's 0.63x to zone 25 stands.
**Why.** At about 0.85 levels a zone, even steady levels leave a longest gap near 2 zones (old game 2.2-2.9), so 2 fails
on noise; Cal's own miss line was 3. Tobin's gap is a wall: 10 h at zone 27 and 13 h at zone 29 (`n10-warden-good-s41`),
the knot `mid-zone-wall` names; the XP brake never applied (Lv 32, below the road). Cheaper levels would hide the wall
and speed casual Tobin further. His 0.63x is a wall removed (the old casual Tobin sat 15-20 h at zones 23-24), and he
still reaches zone 25 1.5-4x slower than Wren and Pip. Pace bands count only up to zones the old run reached unwalled.
**In this PR:** doc edits; must-hold 8 reads "3 zones' play or less (Wren and Pip); Tobin is a gap, owner
`mid-zone-wall`". **Add to `mid-zone-wall`:** "Tobin, good persona, seeds 41-43 (`run.sh`, `an.mjs`): longest
no-level-up stretch in zones 20-30 at most 3 zones' play; no zone from 20 to 30 over 6 active hours (2026-10-06: 10 h
and 13 h)." Watch, not a block: casual Pip reaches zone 25 at 1.27x the old hours (16.1 h against 12.7 h).

## 3. Wren's pure Focus farm: C, allowed min-maxing

**Ruling.** Allowed: a Focus farm build against a Vigour-leaning boss build is a real choice. Respec pricing stays.
**Why.** Re-measured (300 hashed fights), pure Focus kills normal foes 1.6x as fast as even at zone 21 and 2.5x at
zone 31 (the PR's 2.1-3.2x was partly the sampler). It costs where progress is decided: 82-90% on the boss, Vigour 97%.
It shapes only hand-fought fights (away, raid and farm power use `attrNeutral`), and the XP brake caps over-levelling.
A reset after the free first costs about 30 foes' gold: too dear per fight, cheap per session, the Idleon farm-preset
pattern Cal cites. **Guard:** a card changing Focus, ability power or reset price (never below a zone run's gold) re-runs
the arms; one build best for a starter on kills an hour and boss wins at both checkpoints goes back to the judge.

## 4. Might is the weakest attribute: B, folded into `craft-attribute-grades` (no retune now)

**Ruling.** Leave Might (`ATTRS` `base 0.01`, `per 0.03`); its job comes with weapons that scale with attributes.
**Why.** Might touches only Attack (`attrRel('atk')`), and abilities carry most of a turn fight's damage. With base
plus per fixed at 4%, even `per 0.04` lifts pure Might only from x1.81 to x2.07 Attack. `heroAtk()` multiplies the gear's
Attack line, which Attack, abilities and counters all read, so a Might-scaled weapon lifts all damage, with no per-hero
content. Testers who try Might have the free first reset. **Add to `craft-attribute-grades`:** "A weapon's scaling
attribute raises its Attack line (`gear().attack`)." "Dominance arms (`arms.mjs`, hashed seeds, 300 fights, zone 20
and 30): Might is in a winning arm for a starter; no build is best for every starter on both foe types."

## 5. Onboarding check moved from 210 s to 240 s (Codex P1): C, keep 240 with an owner and an expiry

**Ruling.** Keep 240 s and the early road at zones 7/10/12/15 = 10.8/15/18/22.3. Keep the monotone cubic and zone 17
at 24.4 (no x2 cost jump at Lv 25) only if `health.mjs --compare` stays green; the tree's 11.1/15.5/18.6/22.6 road
fails it. The check's comment names owner `story-unlock-gates` and expiry 2026-11-15; then the bar is 210 s again.
**Why.** The 29 s gain costs 2-3 minutes of extra dry play later (`active.longestDrySec` 560-625 against 432; Wren
stalls at zone 13), the worse harm in the first hour (`first-hour.md`: no gap over 8 minutes). The 239 s gap comes from
an unlock keyed to zone 10 (the Codex at 7:46). The early-game plan gives unlock timing to `story-unlock-gates`, keyed to
beats, not zones. Codex is right that a moved bar needs a record; this is it. The Lv 20-30 per-level cost ratio of about
1.49 is accepted: the 25% rule is per zone and holds, and the fights table (132 to 390, zones 20-25) sets it.
**Verify:** `check.mjs` onboarding (gap at most 240 s, 8+ unlocks), `health.mjs --compare` (longestDrySec at most
baseline + 130). **Add to `story-unlock-gates`:** "check.mjs onboarding: something new every 210 s or less in the first
10 minutes, with no early-road change (Tavern 3:47 to Codex 7:46 is 239 s today)."

## Lines for `docs/DECISIONS.md` (under "## The hero", after "A new hero joins at the road's level")

```
### Hero progression: judge rulings (2026-10-06)

- **A switch is judged by the joining hero's own budget.** The new hero spends the lamp's Scrolls first, as a player
  would. Normal fights stay within 10 points of the hero who left. Played well, the zone boss is won 60% or more.
  Heroes differ on purpose, so the new hero is not held to the old one's rate. (2026-10-06)
- **The boss gap after a switch is gear, not level.** The lamp's gear follows the hero who earned it. The `gear-weight`
  and `tobin-safety-margin` cards close the gap, and `switch-row` checks it for every hero. No catch-up. (2026-10-06)
- **Level gaps: at most 3 zones' play with no level-up in zones 20 to 30** (good play). 2 zones is the target. Tobin's
  longer gaps are walls at zones 27 and 29, so `mid-zone-wall` owns them; the XP curve stays. (2026-10-06)
- **Pace bands count only where the old game did not wall.** Casual Tobin reaching zone 25 sooner than before is a
  wall removed, not levels given away. (2026-10-06)
- **A farm build is allowed.** Focus kills normal foes faster and wins fewer bosses. A reset costs gold after the
  first, so farming and bossing builds are a real choice, not a free swap each fight. (2026-10-06)
- **Might waits for weapons that scale with attributes.** A weapon that scales with Might lifts all of its damage.
  The `craft-attribute-grades` card must put Might in a winning build. (2026-10-06)
- **The early road is not sped up to fill an unlock gap.** A faster road makes the first hour's dry stretch longer.
  Until `story-unlock-gates` spaces the early unlocks, something new comes at least every 4 minutes in the first 10,
  not every 3.5. (2026-10-06)
```
