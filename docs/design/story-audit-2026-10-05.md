# Story audit, 2026-10-05: what the player actually reads

Read-only audit of every piece of story and world text in the integration branch, judged against what the screen
shows at that moment and against `docs/DECISIONS.md`. It answers Cal's note that "some of the popups that give context
of the world don't even make sense". The full inventory (about 330 rows, exact quotes, file:line, trigger, verdict)
is in the project folder at `/mnt/project-files/story/audit-inventory-2026-10-05.md`. The fix is the new
[story bible](story-bible.md); the work is in Autopilot cards (bible section 13).

## The short answer

The story text was written for a game that no longer exists: a party, seven foe types cycling through the zones,
crowned type-Elders and a "the dark soaks into animals" rule. The game moved on (solo hero, roster monsters,
Champions and Elders, enemies born from the dark) and the text stayed. `story-c28.md` diagnosed this on 2026-10-01 and
proposed a fix, but none of it was built. So today:

1. **Nothing tells a new player why they fight.** In the first ten minutes there is no premise, no word on what the
   dark is, who Elowen is, or what the hero is. The only story voice is Hesketh, introduced by a toast about wood.
2. **Captions describe things the screen doesn't show.** Zones 1 to 7 all use the forest background, but their
   arrival lines talk about a cave roof, graves, barrows, a garden, a quarry and a marsh.
3. **The foe on screen is not the foe in the text.** Zone 1 shows Thorn Imps; the caption says "the moss is moving",
   the boss is "Elder Moss Slime", and the Bestiary files the kills under Moss Slime ("Pond moss the dark soaked
   through").
4. **Text breaks owner canon.** Bestiary lines say foes are soaked or corrupted animals and woken dead. The Fenmother is
   "the first wraith the marsh ever took". Region bosses are tied to lamps. Party language remains ("hits everyone",
   "the most hurt hero", "the Lanternbearer", "the heroes").
5. **Names and spoilers arrive with no setup.** The Hero tab names the Fenmother from zone 2, 33 zones early. The hero
   picker shows 32 cards, most of them locked, with bios that spoil Regions 2 to 5 and developer notes ("still being
   designed").
6. **Promised payoffs never come.** Hesketh's "Wood first. Then we talk." is never followed by a talk. The chapel
   candle (zone 28) is never explained. The coast's green light leads to a placeholder coast of Hollow foes with sea
   names and "Silas the Fogbound" drawn as a Marsh Wraith.
7. **A lot of written text never shows.** About 60% of the Coast writing, the Keeper's barks, raid lore, companion
   stories, join lines, quotes, `say` lines and every Elder "fall" line are unreachable.

## The structural blocker

The code still runs the old 7-place cycle (zone 1 Mossy Hollow, 2 Batwing Caves, ..., 8 Mossy Hollow II), not the
decided 7 areas of 5 zones (zones 1-5 Mossy Hollow, 6-10 Batwing Caves, ...). Only zones 1 and 2 have their roster
monsters. Every area, Champion and zone line in the bible assumes the decided structure. Until the code matches it, the
story system must stay silent rather than describe the wrong place (bible section 10.5). Moving zone names and
backgrounds to the area structure is cheap and is the first thing the story needs; the roster monsters and the
Champion encounters are bigger and belong to Milestone 1's content plan (`m1-define`).

## Top 15, ranked by how many players meet it and how hard it jars

| # | What | Where | Verdict | Fix (card) |
|---|---|---|---|---|
| 1 | Hero picker: locked bios spoil Regions 2-5; "still being designed" in player copy; routes name zones that don't exist | `21-stories.js` BIOS, `56-roster.js`, `56c-unlocks.js` | No setup; dev notes | Show only the three playable heroes' bios and a plain "Locked" line for the rest (`story-opening`) |
| 2 | Zone 1-7 arrival lines describe places the forest background doesn't show | `21h-lore-hollow.js:47-55` | Contradicts screen | Area structure first, then area titles (`story-delivery`) |
| 3 | Zone 1 and 2 captions, bosses and Bestiary pages talk about Moss Slimes and Cave Bats over Thorn Imps and Gloomjaws | `21h`, `21g-data-bosses.js`, `57c-codex.js` | Contradicts screen and canon | Zone and Captain lines from the roster; Bestiary by roster monster (`story-delivery`, `story-hollow-script`) |
| 4 | Hesketh dropped in cold by a toast; "Then we talk" never paid off | `63d-scenery-camp.js:152`, `55-hearth.js:116` | No setup | The opening card and Hesketh's talk (bible 8.1) (`story-opening`) |
| 5 | Hero tab names the Fenmother from zone 2 | `76-create.js:156`, `75-class-ui.js:66` | No setup | "Two paths open after the Hollow's Elder" until she is met (`story-opening`) |
| 6 | Bestiary: corrupted-creature lines; "Wren left her fruit" for every hero | `21h` LORE_BESTIARY | Contradicts canon | Retire; rule-4 lines per roster monster (`story-hollow-script`) |
| 7 | The Fenmother as "the first wraith the marsh ever took" | `21h` arrival, beat, elder | Contradicts canon | Elder scene (bible 8.1) (`story-hollow-script`) |
| 8 | Great Lantern panel: "Beat its last boss to light it again"; a green light leading to a placeholder coast | `75-lantern-ui.js`, `21b` | Ties the boss to a lantern; no setup | "Beat the region's Elder. Then light it with your flame." Hook plays only once the Coast is real (`story-delivery`) |
| 9 | Wisps card: a marsh and Hesketh at zone 7, in a forest, in a solo fight | `21h:59-62` | Contradicts screen | Retire (`story-delivery`) |
| 10 | Party-era Bestiary tells ("the most hurt hero", "hits everyone") | Bestiary tell lines | Contradicts canon | Solo wording (`story-systems-hollow`) |
| 11 | Coast placeholder: sea names on Hollow foes, Silas drawn as a Marsh Wraith | `22-data-regions.js:36` | Contradicts screen | No Coast story text until the Coast is built (`story-delivery`) |
| 12 | Zone 14 "Crowns" and zone 28 "Chapel" beats over marsh backgrounds; "whatever listens longest" | `21h:63-70` | Contradicts screen and canon | Retire; the chapel candle moves to the Chained Star (bible 8.1) |
| 13 | Warrior Proving defends a lamp; Ranger Proving chases "the Fenmother's herald" | `59f-trials.js` | Contradicts canon | Re-theme with `provings-turns` (Elowen's chapel trials, bible 7) |
| 14 | Deep Lore: Deep Elders are "what the dark makes of things that stay below too long" | `57d-deepwell.js` DEEP_PAGES[6] | Contradicts canon | Rewrite to rule 4; add the Season 2 seed line (`story-systems-hollow`) |
| 15 | Tam's arrival: "the Lanternbearer's lamp", "gathers for the heroes" | `57f-hands.js` | Retired terms; no setup | Tam is the first villager out of a Mossy Hollow cellar (bible 6) (`story-systems-hollow`) |

Also: Omen lines naming unmet people and places ("Oriel says it means you", "the sky over the Emberwaste"); Tavern
gatherer lines naming unmet heroes; a Bestiary toast's grammar ("the Rattlebones's weakness"). All are in the inventory.
