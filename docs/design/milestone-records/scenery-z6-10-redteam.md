# Scenery for zones 6 to 10: red team

Sonnet red team against the first draft of [scenery-z6-10-judge.md](scenery-z6-10-judge.md), 2026-10-07. Verdict on the
draft: "The facts hold, but the zone-8 contradiction ... makes the card unbuildable, and the override of Cal's owner call is
not properly recorded. Send it back." Each finding and what the final ruling did with it:

| # | Severity | Finding | Answer |
|---|---|---|---|
| 1 | Blocking | Draft line 3 listed zone 8 as keeping the Mossy Hollow painting, against line 1 (zone 8 is a Caves zone); the card asked for both `cave` and `zoneTheme(8) === 'forest'`. | Fixed. Line 3 now covers only areas without their own painting. The card keeps `zoneTheme(8) === 'forest'` only while no Caves painting exists. |
| 2 | Blocking | `tools/check.mjs` asserts the 7-cycle theme for zones 1-35 and `zoneTheme(8) === 'forest'`; wiring the real painting breaks both. | Fixed. The card moves the check to a per-zone table with and without the cave painting, so the `integrate:` card flips one table. |
| 3 | Blocking | The owner call "Zones 1-7 use the Mossy Hollow scenery" is overridden without being recorded as an override; Cal's reason was inferred. | Fixed. The ruling has its own section on the override, says the reason is inferred, amends the DECISIONS line and names the veto path (flag off). |
| 4 | Should fix | "No zone loses approved art" ignored the Coast's forest places (36, 43, 50, 57, 64). | Fixed. Line 3 says those zones are unchanged. |
| 5 | Should fix | The list of cave places stops at 65; the Coast keeps cycling past 70. | Fixed ("and every seventh zone after"). |
| 6 | Should fix | Missed option D (hard-code zones 6-10 to `cave`); foes still follow the cycle. | Option D added and rejected (it would drop zones 6-8 to procedural scenery today). Foes are named as left alone, for the area pack's `integrate:` card. |
| 7 | Should fix | Switch-off was vague; "unwire the painting" is not a switch-off. | Fixed. `SCENERY_BY_AREA`, default on; what the game shows with it off, painting wired or not. |
| 8 | Should fix | The prediction was a count the code fixes, with no player effect; the player problem had no evidence. | Partly. The prediction now names what a player sees and the miss threshold covers all zones to 70. The ruling states plainly that the only evidence is the code and the manifest: the mismatch shows the day the painting is wired, so it is settled first. |
| 9 | Should fix | The card was not clearly one S thread: no screenshot-diff tool exists; `BG_ART` is a `const`. | Fixed. Screenshot diff dropped for `zoneTheme` equality over zones 1-70; the stub adds a key through `g.eval`. |
| 10 | Nit | The WebP decodes after the first frame, so a procedural scene can flash. | Named and accepted (the Mossy Hollow painting does the same today). |
| 11 | Nit | "Wired" and `integrate:` are insider words. | "Wired" is defined at first use. |
| 12 | Nit | The Cal-only check was not stated. | Stated: nothing here touches a Cal-only item. |
