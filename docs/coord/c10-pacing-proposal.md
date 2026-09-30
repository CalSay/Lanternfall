# C10 Region 1 pacing: measured proposal

Status: unshipped proposal for Claude's sign-off, 30 September 2026. No gameplay balance has changed.

## Hearth 2 and Tam

Current Hearth 2 requires zone 10, 9,000 gold, 120 grade-1 Wood, 100 grade-1 Ore, 30 Essence and a two-hour build. Its build duration alone prevents Tam's first shift within an hour.

The measured candidate keeps zone 10, changes the price to 0.05 income-hours (110 gold at the current scale), 20 Wood, 20 Ore and 5 Essence, and uses a five-minute build. Tam's existing free arrival at Hearth 2 plus Tavern, and first three free shifts, remain unchanged.

A cost-only candidate passed 8/9 established hero-key runs. Pip seed 2 lacked Ore because the sim did not prioritize the next Hearth requirement. A temporary policy additionally gathers missing Hearth 2 materials once zone 10 is reached, even when builder slots are full. Camp order checks Hearth before Watch and uses Tent instead of the retired Bunkhouse. With these policy changes:

| Hero | Seed 1 first shift | Seed 2 | Seed 3 |
|---|---:|---:|---:|
| Wren / ranger | 42 min | 42 min | 42 min |
| Tobin / warden | 42 min | 42 min | 42 min |
| Pip / lanternmage | 43 min | 57 min | 43 min |

These are continuous one-hour mixed-policy runs. In the normal day profile, Hands are dispatched at session end, so the first shift is at minute 60 rather than immediately after Tam arrives. Arrival and first dispatch are separate measurements.

## Day-one Tent 3 constraints

Normal profile: sessions at 08:00, 13:00 and 19:00; first session 60 minutes, later sessions 15 minutes; capped away gains between sessions. Same unshipped Hearth candidate and material-priority policy.

| Hero | Seed 1 max zone / final gold | Seed 2 | Seed 3 |
|---|---:|---:|---:|
| Wren | 17 / 3,310 | 16 / 16,347 | 18 / 7,301 |
| Tobin | 13 / 1,230 | 14 / 11,251 | 14 / 9,737 |
| Pip | 16 / 14,582 | 16 / 15,807 | 16 / 14,273 |

The proposed zone-14 Tent 3 gate misses Tobin seed 1. Zone 13 covers these nine runs, but that is a recommendation for review, not an approved gate. Current Tent 3 costs 23,000 gold, more than every final bank here. Final bank alone is not an affordability proof: the policy spends along the way, and spending priority must be evaluated with the proposed price.

Seed-1 runs end at Hearth 2 and Tent 2. Their grade-2 Wood/Fibre/Hide inventories are Wren 1283/7/644, Tobin 2/183/2, Pip 1690/679/38. Current Tent 3's 120/80/40 requirements therefore depend on gathering choices as well as unlocks. C24's approved Hunting source is not present in these measurements; its integration is required before final Tent material costs.

For Tent 4, a same-value grade-4 to grade-3 conversion using current base values 17/8 converts 150 Wood, 100 Fibre and 60 Hide into 319 Wood, 213 Fibre and 128 Hide (rounded up). This is an arithmetic candidate only. Keep the proposed Hearth 4 / around zone 30 gate, 42,000 gold and two-hour build under review; day-5–7 reachability has not been demonstrated.

## Evidence and limits

Core provenance: e0f3e0266672d2b7f8f6ced3bcf5c70bced36588, the documentation-only Hunting proposal based on b334967. These are earlier-checkpoint probes, not validation of the current f46c990 combined game. The report branch starts from f46c990; no code from the earlier checkpoint is copied into it.

Node 24, seeded headless core. Temporary copy of tools/sim.mjs with the policy changes above and guards for two end-of-report day-range summaries that otherwise assume a run of at least seven days. Cost constants are injected in memory with --evalfile. The source game is unchanged.

Reproduction inputs: --hours 1 --policy mixed --class ranger|warden|lanternmage --seed 1|2|3; for day-one probes, --days 1 --profile normal with the same classes/seeds. Use the actual class keys: warrior/mage aliases select heroes but the old crafting policy does not normalize those aliases, so those misleading runs were excluded.

Raw local evidence is in the OS temporary directory: lanternfall-c10-priority-summary.json, lanternfall-c10-priority-<hero>-<seed>.log, lanternfall-c10-day1-<hero>.log/json (seed 1), and lanternfall-c10-day1-<hero>-<seed>.log/json (seeds 2–3). Candidate injection is lanternfall-c10-candidate2-probe.js and temporary policy is lanternfall-c10-hearth-priority.mjs. Its absolute core import followed the old checkout during these runs; reruns must restore the evidence checkpoint explicitly.

## Coordinator decisions and remaining work

Claude approved the documentation-only gate and these starting values in issue #11 comment 5919363072:

1. Hearth 2: zone 10, 110 gold, 20 grade-1 Wood, 20 grade-1 Ore, 5 Essence, five-minute build, and explicit Hearth 2 material priority in the sim.
2. Tent 3: zone 13. Propose a day-one price after C20 and C24 are integrated.
3. Tent 4: grade-3 materials 319 Wood / 213 Fibre / 128 Hide, 42,000 gold, two-hour build, Hearth 4 and zone 30, pending integrated affordability.
4. Sim: normalize warrior/mage aliases once, fix the two short-run summaries and track the first actual gatherer shift rather than first paid hire.

Finish C20 and C24, then run integrated C10 and submit the final numbers table. The user subsequently set first combat enemies to about three starting hits; that supersedes the earlier C20 opening fight-length target and must be reflected in integrated pacing.

No claim of full C10 completion, no shipped balance changes, no save-key changes.
