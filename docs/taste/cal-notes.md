# Cal's notes about playing

Every note Cal has written about how the game plays, feels or should feel. Dated, quoted, tied to the screen, with what we did.

**Rule:** any new Cal message about playing is added here by whoever receives it, in the same PR or (if you have no PR) to
`/mnt/project-files/taste/cal-notes-pending.md`, which the next card moves in. Keep the quote exact. Add the screen it was about.
Cal's Eyes (`cal-eyes.md`) and the golden cases (`golden/`) are rebuilt from this file.

Source notes: sources marked `msg` are project-chat messages; `memory` means Cal's wording is recorded in team memory, not re-read.
The 13 notes of 2026-10-06 18:16 are the regression set (golden cases G01 to G13).

## Before 2026-10-06 18:16 (the judge's seed)

| Date | Source | What Cal said | Screen or system | What we did |
|---|---|---|---|---|
| 2026-10-03 10:32 | msg | "more active things to do that are fun and can help the player progress ... outside of the core gameplay of E33 the extra content was lacking ... Maybe something active that earns gold?" Story carried E33 through the slow parts; ours is weaker, so be creative with what the player does. | Side content, gold sources | Ideas in `/mnt/project-files/ideas/`; active-gold card; Tavern contracts |
| 2026-10-05 17:43 | msg | "I've decided to remove animation from the live game ... we will use Icons and still images ... well designed menus and focusing on systems, mechanics and balance." Wants text menus with icons and still art for combat and gathering. | Combat and gather menus | Stage and dock (combat C), Command ledger (gather A) |
| 2026-10-05 18:49 | msg | "we go straight from gathering to having final materials. There's no processing ... mine coal to smelt raw ore into ingots. Smithing could therefore be a skill. Look at RuneScape." Potions too. | Gather, craft | Crafting spec card; processing chain |
| 2026-10-05 20:58 | msg | "Our story is really quite weak at the moment. Some of the popups that give context of the world don't even make sense." Build and review the story until each section has depth and excitement, building to area 5 and "The Voice", with room to continue. | Guide tips, world popups, story cards | Story bible, story cards (see 18:16 note 2) |
| 2026-10-05 20:59 | msg | "include NPCs that either appear once or become recurring characters" | Story cast | Story bible cast |
| 2026-10-06 (day) | memory | Weapons scale with attributes. NO idle combat. Wants min-maxing (cites Idleon; no auto-gather). Every boss tier should feel intense and scale. Tavern contracts on bosses with a Dare bonus. | Combat, gear, bosses | Hero progression rework; boss tiers card |
| 2026-10-06 12:01 | msg (memory) | Ask "is this the right system?" before tuning any system. Keep the core: hand-played fights with parry and dodge, a camp that works while away, building your own hero, pushing light down a dark road. | Whole game | Why review |
| 2026-10-06 12:50 | msg (memory) | Drop Training. Attack, Parry and Dodge come from hero level, star points and abilities; per-hero attribute points with respec. New heroes join at the road's level. | Hero screen | Hero progression rework (PR #58) |
| 2026-10-06 | memory | Camp art is placeholder; art cost matters. 34-hero roster, so no per-hero authored content. Rejected: perks from gear, abilities from bosses, per-hero camp scenes, aimed weak points. | Camp, roster | Design docs |

## 2026-10-06 18:16 (preview eb7f732), the 13 regression notes

Message `cmsg_01AYPNgUeMrmxpJNQMppEbk9SgmdmoU54BZPMo8tyDVWtY`, thread "Early game, all hands". Cal played the preview for a while and
wrote what he remembered. His closing line: "There are probably many more things from my play through that I would add comments on
but I can't remember them all." So the 13 are a floor, not the list.

| # | Quote | Screen | Kind | Escape row | Status |
|---|---|---|---|---|---|
| 1 | "It didn't really capture that level of fun that I want. As frustrating as the gatcha elements of games is, it does give you some amount of easy dopamine." | Whole first hour: kills, level ups, loot | judgement | 1 | open (early-game lead) |
| 2 | "The story still feels weird and not particularly compelling." | Chapter cards, guide lines, area names | judgement | 2 | open |
| 3 | "The training guide was a bit jagged and some boxes weren't lined up properly ... Some of the training tips didn't fit with what was happening." | Guide tip boxes over the stage | exact | 3 | open |
| 4 | "I got a unique and I didn't even know it until I looked at my gear." | Unique drop, no announcement | exact | 4 | open |
| 5 | "We don't have the ability icons in game that Codex built." | Ability buttons and lists | exact | 5 | open |
| 6 | "Combat was good and I'm worried it'll lose that fun when we remove art ... think of ways to keep it fun and improve it further still without the art." | Fight stage | judgement | 6 | open |
| 7 | "Things unlocked at a weird pace." | Tabs, abilities, systems opening | exact | 7 | open |
| 8 | "You have to click fight to see bounties ... I get a notification saying I can collect the reward for a bounty and I might be forced into a fight to collect it." | Bounties, Fight tab | judgement | 8 | open |
| 9 | "Ability and star menus feel overwhelming and cluttered but equally I wouldn't want to scroll for ages." | Hero > Abilities, Stars | judgement | 9 | open |
| 10 | "Crafting doesn't feel rewarding and you don't know what level of item you've crafted until you check inventory so I was making 5 at a time before checking." | Craft result, bag sheet | exact | 10 | open |
| 11 | "I don't feel connected to the game or the characters/heroes that I play as." | Hero pick, hero sheet, fights | judgement | 11 | open |
| 12 | "an intro which is different drawn images explaining the story ... art for NPCs like a guide that offers us the training that pops up and talks to us." | First screen, guide | judgement | 12 | open |
| 13 | "I feel like there's some work missing from what the threads have been working on." | The build as a whole | not seen in play | 13 | open |

Also in that message: "I feel like we've done so much auditing but missed so much" and the early game "decides whether someone keeps playing or ditches it for something else."

## What Cal values (read this before judging a screen)

1. A reward he can feel: a pop, a name, a reveal. Counting is not enough, it has to be shown.
2. A screen that says what is happening now. A tip about the wrong thing is worse than none.
3. Art or icon he was promised, present in the build.
4. Menus that are readable at a glance and short, not long and not a wall.
5. A reason to care: a hero, a voice, a story beat.
6. Not being forced: no fight to collect a reward, no wall of waiting.
7. Honest about what is in the build.
