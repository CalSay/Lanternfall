# Text-first combat (proposal)

Status: proposal, 5 October 2026. Mock-up: [text-combat-mock.html](text-combat-mock.html) (open it in a browser; it plays).
Owner's direction: run the game like the old Football Manager match screen. Show the fight as text, numbers and icons until
the art can be paid for. Keep concept art as stills. Nothing is animated.

## What replaces the stage

| Part | What it shows | Why |
|---|---|---|
| Versus cards | A still portrait, name, HP with a damage trail, Ward on the bar's end, the hero's resource pips, status chips with the game's status icons | Everything the sprites and floating numbers used to say |
| Foe's next move | "Next: Gnash · 2 quick bites", or "gathers Hollow Maw · breakable" | Without a wind-up animation you need to see what's coming to plan around it |
| Turn order | The next 8 turns as small portraits; a stunned turn is struck through | Turn order is back on screen during the fight. It was moved to the versus card when the stage showed the fight. The owner should confirm |
| The moment panel | One panel saying what this turn is about: your move, the foe's attack, a charge, a lost turn, the result | Takes the stage's place. It changes with each turn, so there's always one place to look |
| Timing bar | Full width, 30 px high (22 in landscape), dodge and parry windows marked, a pip per hit (gold parried, blue dodged, red hit), a stamp when each hit lands | Parry and dodge are the skill in this game. They need to be the biggest thing on screen during the foe's turn |
| Combat journal | Grouped by turn, newest turn first. Each line has an icon, a headline, a detail and a number on the right | The commentary feed. Coloured by outcome: gold for crits and parries, blue for dodges, red for damage taken |
| Action bar | The same Q W E / A S D bar and icons. Cooldowns are a badge; "Needs 2 Grit"; Parry and Dodge light up on the foe's turn | Unchanged controls |
| Detail line | The highlighted action's full text and its damage at your power now ("about 30") | Shows the numbers the animations used to show |

## Layouts

- Desktop (1280 x 800): tab rail, top row, main column, side column (Next Up, build, bar, detail).
- Landscape phone (740 x 360): the same columns, compressed. The zone header, turn order and status placeholders are
  hidden. During a hit the moment panel shows only the title and the bar. Next Up is one line.
- Portrait (390 wide): one column, with the bar above a bottom tab row.
- Reduced motion: no transitions. The timing bar still moves: it's the mechanic, not decoration.

## Rules the mock-up follows

Tobin's real kit (24c): Shield Bash, Iron Will, Hammerfall, Grit. Parry and dodge use the game's starting windows
(0.18 s and 0.35 s). A boss charge breaks to a stun or to 6% of its max HP. Gloomjaw's moves and numbers are made up for the
mock-up. Pressing too early counts as a miss: the hit lands. Check that this matches 59k before building it.

## Building it (if approved)

- `75-turn-ui.js` (and a new `60-` stylesheet) hold the moment panel, the journal and the intent line. All of them read the
  engine's existing events (`turn`, `foeMove`, `foeCharge`, `chargeBroken`, `parryWindow`, `foeContact`, `timingGrade`).
- The stage is switched off by a setting, not deleted, so the art can come back.
- Open questions: should the art return as a setting later, or only for enemies that have art? Should Gathering and Hunting
  get the same treatment?
