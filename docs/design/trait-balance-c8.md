# C8: gathering trait balance after fixed shifts

Approved by Claude on 2026-09-30: [issue #9 sign-off](https://github.com/CalSay/Lanternfall/issues/9#issuecomment-5913813701).
Four-hour shifts removed the old duration trade-offs. Equal-worker engine probes gave Homebody
27.27% more material per day than Steady and 21.74% more than Packmule. Packmule also beat Steady
unconditionally. This pass gives them different jobs without changing shifts, fees or worker shares.

| Trait | Approved effect |
|---|---|
| Steady | +10% yield everywhere |
| Homebody | +15% yield on grades 1–2 |
| Packmule | +15% haul on grades 3–5 |
| Stonecutter | +20% yield on Crystal |
| Green Thumb | +20% yield on Fibre and Herbs |
| Early Riser | +20% when initially sent from 05:00 inclusive to 11:00 exclusive; includes queued shifts |
| Friendly | +10% during overlap with another Friendly gatherer, multiplying the stored rate |

New applicants cannot roll Packmule until **any** supported gathering skill opens grade 3 (currently
skill level 30). The gate applies only to new rolls: existing applicants and workers are not removed,
rejected or stripped of their traits. **Every new send uses the approved grade conditions**, including
sends by existing workers. Running and queued jobs keep their stored rates, even if those were
calculated before this pass. All trait IDs remain readable, including retired Strong Back, Night Owl
and Wanderer. No new saved fields or save-key change.

## Approved margins

For an equal worker, node, affordable 24-hour schedule, partner overlap and storage availability,
replacing one current direct-yield trait slot while holding the second slot constant must give
`max(expected units) / min(expected units) <= 1.20`. Compare only positive-output schedules.
An entire two-trait roll is separately bounded by `1.40 ×` that worker's output without traits.
This does **not** assert that every pair of whole two-trait rolls lies within 20%.

The baseline holds rarity, level, profession, tools and hero progression constant. Common shares run
from 10% at level 1 to 14.75% at level 20; Legendary shares run from 20% to 24.75%. Off-profession
gathering pays half. Hero gathering levels 1/14/30/64/112 open grades 1/2/3/4/5; workers do not bypass
those gates. Enough gold and Storehouse room isolate the trait effect. Full packs can stop queues;
this is a production limit, not evidence of equal trait value. Legendary callings and outside crew
bonuses must be held constant rather than counted as random trait value.

## Daily evidence and snapshot rules

Real-engine Common level-20 Woodcutter probes with grade-1 Wood, hero skill level 1 and no calling
gave a baseline rate of 206.273076923 units/hour. Six 4-hour shifts expected 4950.553846 units;
before this pass Homebody expected 6930.775385, Steady 5445.609231 and Packmule 5693.136923.
Seeded integer payouts differ slightly from expectations because the engine rounds stochastically.

Early Riser is sampled at the **initial send**, not each hour or each queued departure. A 10:59
two-shift order keeps its +20% for the second shift starting at 15:29; a 04:59 order gets no bonus
even though its second shift starts at 09:29. Worker level-ups likewise do not reprice the saved rate.

| Repeatable daily schedule | Hours worked | Early Riser increase |
|---|---:|---:|
| Single shifts at 05/09/13/17/21/01 | 24 | 6.6667% |
| Two-shift queues at 05 and 17 | 16 | 10% |
| One two-shift morning queue | 8 | 20% |
| Two-shift queues at 11 and 23 | 16 | 0% |

Each row is a 24-hour window starting at its first send, so all listed shifts finish in the window.
Queued shifts include the existing 30-minute rest. A simple “six morning hours out of 24” weighting
would not describe these schedules.

Friendly uses actual paired gathering overlap, including recall and queued rests. Full overlap with
the new eligible Homebody gives `1.15 × 1.10 = 1.265`, not 1.25; half overlap gives 1.2075. An eligible
+20% trait with full Friendly overlap gives 1.32. Trade jobs do not provide Friendly gathering overlap.
Count the partner's benefit separately when discussing crew value.

The C8 check section enumerates 3,750 rate environments across rarities, endpoint levels, professions,
families, grades and local send hours. It also sends and settles **392 actual daily schedules**,
including single and double shifts, on/off-profession jobs, all current gathering families,
eligible/ineligible grade conditions, a fixed second slot and real Friendly partners. The per-slot
maximum reaches 1.20 and the whole-roll maximum reaches 1.40. Checks compare actual seeded settlements
against their expected rounding range, equal fees and fixed 4h duration. Boundary sends and save/reload
verify chronological live/offline queue payouts and preservation of old stored rates.

## Utilities remain separate

Keen Eye retains its 2% grade-up finds: grades 1–4 replace some units with the next grade; at grade 5
the current engine adds 2% same-grade units instead. Lucky retains a 2% chance of one Trophy per full
shift (0.12 expected trophies for six shifts). Neither is honestly a generic +2% material-value bonus.

Old Hand retains +25% XP; Chatterbox at camp grants other Hands +10% XP. Their effects multiply if
combined. A first-day six-single-shift probe from Common level 1 gave Old Hand about +0.3953% material
yield through earlier leveling, not +25%; its leveling benefit ends at level 20. Cook retains +25%
meal duration and Storyteller +2% hero away gains while at camp. Their usefulness depends on meals,
progression and the idle worker's opportunity cost. No invented gold conversion establishes parity.

Retired Wanderer's legacy -10% yield is retained and excluded from the competitive current-roll
margin; 1.20/0.90 would exceed it. Utilities and legacy IDs have separate behavior/readability checks.
