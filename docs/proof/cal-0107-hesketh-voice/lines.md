# cal-0107-hesketh-voice: every changed line

Text only. Keys, ids, triggers, `via`, line counts and save marks are unchanged. Read each "New" line aloud against the
card's Never list (no fragments, no stage directions, no "the hero", nothing the player has not met yet).

Unchanged on purpose: `heskethHearth` ("Every road needs a place to come back to."), `heskethTalk[1]` and `[2]` (already whole sentences; [1] keeps its unexplained "couldn't", bible 6.1), `heskethFire`,
`SAY_TXT.gather`, `SOLO_UI` fight tips and the `tab:*` pointers (owned by cal-0107-staged-guide), `FIRST_USE.codex` and
`FIRST_USE.stars` (pinned to copies elsewhere), and both camp-open toasts in `57-camp.js` (narration, already whole sentences).
`docs/design/first-hour.md` beat 9a now quotes the new `SAY_MORE.defeat`.

| Key | File | Old | New |
|---|---|---|---|
| SAY party | `75-onboard-ui.js` | party: "The Hero tab's open. Your gear, level and build live there." | party: "The Hero tab is open now. Your level, points and moves are kept there." |
| SAY bounties | `75-onboard-ui.js` | bounties: 'Bounties are posted on the Fight tab. Three goals, and they pay well.' | bounties: "Folk have posted bounties on the Fight tab. They pay well for small jobs." |
| SAY camp | `75-onboard-ui.js` | camp: "That's a camp. The Camp tab is open. Build here." | camp: "There. That's a camp. Build on it from the Camp tab." |
| SAY forage | `75-onboard-ui.js` | forage: "Foraging's open under Gather. Fibre and herbs, mostly." | forage: "You can forage now, under Gather. You'll mostly find fibre and herbs." |
| SAY craft | `75-onboard-ui.js` | craft: "Craft's open. Materials in, gear out." | craft: 'You can make your own gear now. Craft is open.' |
| SAY bestiary | `75-onboard-ui.js` | bestiary: "The Bestiary's open. It remembers every foe you've met." | bestiary: "The Bestiary is open on the Fight tab. It remembers every foe you've met." |
| SAY almanac | `75-onboard-ui.js` | almanac: "The Almanac's open in Camp. It knows today's omen." | almanac: "There's an Almanac at camp now. It tells you today's Omen." |
| SAY uniques | `75-onboard-ui.js` | uniques: "Uniques are open in Craft. Rare gear, strong tricks." | uniques: 'Bosses sometimes drop rare gear. Craft keeps it, under Uniques.' |
| SAY tavern | `75-onboard-ui.js` | tavern: "The Tavern's open in Camp. Other heroes drink there." | tavern: "There's a Tavern at camp now. Folk on the road stop in there." |
| SAY codex | `75-onboard-ui.js` | codex: "The Codex is open in the Journal. It keeps what you've found." | codex: "You've a Codex now, in the Journal. It keeps track of what you've found." |
| SAY raid | `75-onboard-ui.js` | raid: "The World raid's open in Camp. One boss, every player." | raid: 'The World raid is open at camp. Every player fights the same boss there.' |
| SAY stars | `75-onboard-ui.js` | stars: "Stars are open on the Hero tab. Each one changes how you fight." | stars: "You've earned Stars. They're on the Hero tab, and each one changes how you fight." |
| SAY deep | `75-onboard-ui.js` | deep: "The Deepwell's open on the Fight tab. Pick a boon between floors." | deep: 'The Deepwell is open on the Fight tab. You pick a boon between its floors.' |
| SAY_MORE defeat | `75-onboard-ui.js` | defeat: 'That card showed what beat you. Each try shows one more of its moves.' | defeat: 'No shame in that. The card showed what beat you, and each try shows one more of its moves.' |
| stockSpec several | `75-onboard-ui.js` | `${need.some(m => m.fam === 'gold') ? 'Get ready' : 'Gather'} for ${what}: ${need.map | `You still need these for ${what}: ${need.map |
| stockSpec gold | `75-onboard-ui.js` | `Win ${x.n - x.have} more gold for ${what} (${x.have}/${x.n}).` | `Win ${x.n - x.have} more gold in fights for ${what} (${x.have}/${x.n}).` |
| stockSpec essence verb | `75-onboard-ui.js` | x.fam === 'ess' ? 'Win fights for' : 'Gather' | x.fam === 'ess' ? 'Fight for' : 'Gather' |
| STEP chop tail | `75-onboard-ui.js` | 'Tap the tree. It goes faster.' | 'Tap the tree yourself and it goes faster.' |
| STEP back | `75-onboard-ui.js` | text: 'Done here? Close the menu and the fight goes on.' | text: "When you're done here, close the menu and the fight goes on." |
| STEP wear:tool | `75-onboard-ui.js` | `Your ${nm} is in your bag. A tool only works when you wear it.` | `Your ${nm} is still in your bag. A tool only helps once you wear it.` |
| STEP wear:weapon | `75-onboard-ui.js` | `Your ${nm} is in your bag. Put it on to fight with it.` | `Your ${nm} is still in your bag. Put it on and fight with it.` |
| STEP light (menu) | `75-onboard-ui.js` | text: 'Shut that menu, then tap the fire. Light it.' | text: 'Shut that menu, then tap the fire to light it.' |
| STEP light | `75-onboard-ui.js` | text: "Tap the fire. Let's have some light." | text: "Tap the fire and light it. I've missed the warmth." |
| STEP light (gather) | `75-onboard-ui.js` | 'Tap Gather, then light the fire.' : 'Tap Gather. Pine Log burns well.' | 'Tap Gather, and then you can light the fire.' : 'Tap Gather and chop some Pine Log. It burns well.' |
| STEP bench | `75-onboard-ui.js` | ["The fire's burning. Open Camp and build.", 'Open Camp.', 'Build a Workbench. Tools start there.'] | ["The fire's burning now. Open Camp and we'll build.", 'Open Camp.', "Build a Workbench. That's where your tools are made."] |
| STEP tool (tab) | `75-onboard-ui.js` | text: "The Workbench is up. Open Craft." | text: 'The Workbench is up. Open Craft and make your first tool.' |
| STEP tool | `75-onboard-ui.js` | text: "Make a Copper Pickaxe. You'll want it." | text: "Make a Copper Pickaxe. You'll need one for the ore." |
| STEP forge | `75-onboard-ui.js` | ['Open Camp. The Forge makes weapons.', 'Open Camp.', 'Build the Forge. Then you can make a weapon.'] | ["You'll want a weapon of your own. Open Camp.", 'Open Camp.', "Build the Forge. That's where weapons are made."] |
| STEP weapon (tab) | `75-onboard-ui.js` | text: 'Your first weapon is ready to make. Open Craft.' | text: 'You have enough for your first weapon. Open Craft.' |
| STEP weapon | `75-onboard-ui.js` | text: 'Make your first weapon. Then put it on.' | text: 'Make your first weapon, then put it on.' |
| STEP store | `75-onboard-ui.js` | ['Packs are near full. Open Camp.', 'Open Camp.', 'Packs are near full. Build a Storehouse.'] : ['The Forge is up. Open Camp.', 'Open Camp.', 'Build a Storehouse. It holds more.'] | ['Your packs are nearly full. Open Camp.', 'Open Camp.', 'Your packs are nearly full. Build a Storehouse to hold the rest.'] : ["The Forge is up. Open Camp. There's one more to build.", 'Open Camp.', "Build a Storehouse. It holds what your packs can't."] |
| STEP upgrade (attributes) | `75-onboard-ui.js` | ["You've a point to spend. Open Hero.", 'Open Build.', "Put it in Might. You'll hit harder."] | ["You've earned a point to spend. Open Hero.", 'Open Build.', 'Put your point in Might. It makes you hit harder.'] |
| STEP upgrade (training) | `75-onboard-ui.js` | ['You have gold. Open Hero to train.', 'Open Training.', 'Train Attack. Each level hits harder.'] | ["You've gold to spend. Open Hero and train.", 'Open Training.', 'Train Attack. Each level makes you hit harder.'] |
| FIRST_USE party | `55-onboard.js` | party: { text: 'Your Hero: gear, level and abilities.' } | party: { text: 'This is where you grow. Your level, build and abilities are all here.' } |
| FIRST_USE nextup | `55-onboard.js` | text: 'That chip is Next Up. It names your best next goal. Tap it.' | text: 'That chip is Next Up. It shows the best thing to do next, so tap it.' |
| FIRST_USE awaynote | `55-onboard.js` | text: 'While away, gathering continues and fighting stops.' | text: "While you're away, gathering goes on but fighting stops." |
| FIRST_USE gather | `55-onboard.js` | text: 'Pick a node and your hero mines or chops it, even while you are away.' | text: "Pick a place to work and you'll keep chopping or mining it, even while you're away." |
| FIRST_USE bounties | `55-onboard.js` | text: 'Bounties are three short goals. They pay gold, materials and Renown.' | text: 'Folk post three short jobs here. They pay in gold, materials and Renown.' |
| FIRST_USE camp | `55-onboard.js` | text: 'Build stations here. Each one opens a new way to make things.' | text: 'This is your camp. Each thing you build here opens a new way to make things.' |
| FIRST_USE forage | `55-onboard.js` | text: 'Foraging finds fibre and herbs.' | text: 'Out here you can forage for fibre and herbs.' |
| FIRST_USE craft | `55-onboard.js` | text: 'Craft turns materials into gear. Pick a station, then a recipe.' | text: 'This is where you make gear. Pick a station first, then a recipe.' |
| FIRST_USE bestiary | `55-onboard.js` | text: 'The Bestiary lists the foes you have met. Kills earn perks against them.' | text: "Every foe you've met is written here. Kill enough of one and you earn a perk against it." |
| FIRST_USE almanac | `55-onboard.js` | text: "The Almanac shows today's Omen, plus Dares and a weekly board." | text: "The Almanac tells you today's Omen. It has Dares and a weekly board too." |
| FIRST_USE uniques | `55-onboard.js` | text: 'Uniques are rare gear that bosses drop. Each has a strong effect.' | text: 'Bosses sometimes drop rare gear. Each piece here has a strong trick of its own.' |
| FIRST_USE tavern | `55-onboard.js` | text: 'The Tavern shows who is online and the hall of heroes.' | text: "This is the Tavern. You can see who's online, and the hall of heroes." |
| FIRST_USE raid | `55-onboard.js` | text: 'One boss, shared by every player. Your hits add to the same total.' | text: 'Every player fights this one boss together. Your hits add to the same total.' |
| FIRST_USE deep | `55-onboard.js` | text: 'The Deepwell is a run of fight floors. Pick a boon between floors and earn Marks.' | text: 'The Deepwell goes down floor by floor. Pick a boon between floors and earn Marks.' |
| FIRST_USE hands | `55-onboard.js` | text: 'Hire gatherers on the Tavern board. They work shifts while you are away.' | text: "You can hire gatherers on the Tavern board. They work shifts while you're away." |
| GUIDE tip upgrade | `55-onboard.js` | tip: 'Open Hero and make your hero stronger.' | tip: 'You can grow stronger now. Open Hero.' |
| GUIDE tip back | `55-onboard.js` | tip: 'Close the menu to get back to the fight.' | tip: 'Close the menu and get back to the fight.' |
| GUIDE tip wear:weapon | `55-onboard.js` | tip: 'Put on the weapon in your bag.' | tip: 'Your new weapon is in your bag. Put it on.' |
| GUIDE tip wear:tool | `55-onboard.js` | tip: 'Put on the tool you made.' | tip: 'Put on the tool you made. It only works when you wear it.' |
| GUIDE tip nextup | `55-onboard.js` | tip: 'Next Up names the one thing worth doing now.' | tip: 'Next Up shows the one thing most worth doing now.' |
| toast: cold fire | `63d-scenery-camp.js` | 'Old Hesketh's fire is cold. Bring 8 pine logs and light it.' | 'Old Hesketh's fire is cold. Chop 8 Pine Log and light it for him.' |
| Camp view (locked) | `75-camp-ui.js` | `Old Hesketh is looking for a place to rest. Reach zone ${CAMP_TUNE.openZone} and he makes camp. You are at zone ${S.maxZone}.` | `Old Hesketh is looking for a place to rest. He makes camp when you reach zone ${CAMP_TUNE.openZone}. You are at zone ${S.maxZone}.` |
| heskethTalk[0] | `21k-story-hollow.js` | Ten years I've lit dead lamps. Not one took my fire. | Ten years I've lit dead lamps. None of them took my fire. |
| heskethTalk[3] | `21k-story-hollow.js` | Your village is down there. Go back and shut the holes. | Your village is down there. Go home and shut the holes. |
