# Campaign NPCs: people along the Lantern Road

**C6 / issue #7 — design decisions recorded, implementation gated on M1, 30 September 2026.**
Audited against Claude checkpoint `3ddba26361c4a069b983c7ae00f1a9a397909398`.
This document proposes encounters and their delivery. It does not authorize story data, UI,
new NPC implementation, professions, rewards, or later regions. Build work waits for owner review
and the coordinator's M1 schedule. Owner answers are recorded in §9; the modal mounting proposal still needs Claude's sign-off. No save-key change is proposed.

## 1. What the campaign should feel like

The player returns to places because someone there has something to say. A gatherer remembers
the quarry before it walked. A pedlar knows which doors still open. Hesketh knows the sound of
every lamp hinge. Their stories make progress visible in people's lives.

Use the existing road and camp, with one short conversation at a time. Start with a practical
need, let the player see its place in the world, then let someone trust them with a little more.
Conversation progress comes from discoveries and completed actions. It does not depend on
repeating dialogue, waiting for a real-world appointment, or keeping two heroes in a party.

The owner replaced Bonds with campaign NPCs in [solo-hero.md, Removal and rework](solo-hero.md#removal-and-rework-owner-answers-2026-09-29).
The old pair stories are writing sources only. No Bond levels, paired combat requirements,
Sworn bonuses or companion party return through this design. Hero unlocks and Hallowed quests
remain their own work orders; a conversation does not grant a playable kit.

For M1, the emotional result is simple: the player knows who uses the materials they bring home,
and why the Hollow getting its mornings back matters to those people.

## 2. Canon and current-build boundaries

Story authority is [lore.md](lore.md), especially §§1–7, 8.1–8.5 and 11. Current solo decisions
take precedence over its older party and Bond mechanics. Exact current routes come from
[21f-data-hands.js](../../src/js/21f-data-hands.js) and
[57f-hands.js](../../src/js/57f-hands.js); [gatherers-2.md](gatherers-2.md) contains both current
and future professions. Proposed conversations below are new writing, not quotations of canon.

Keep these facts straight:

- The dark hunts lamps to put them out. Fire warms people; lantern light pushes the dark back.
  An early villager can describe what they saw without knowing the rules behind it.
- The Hollow's boss is **the Fenmother**, at zone 35. The existing internal beat and elder key
  `listener` still names that encounter. Do not turn it into Region 3's knight or restore an old
  boss name from an earlier draft of the lore.
- Hesketh is Tam's uncle. Nan knew Grenna at the quarry. Bracken worked with **Bram's father**.
  Fennel tended Elowen's chapel garden. Ashby is one of the families Caedmon got out of Emberlea.
- Bram's missing family is Ada, his wife, and Pell, their son. No Hollow dialogue tells the
  player where they are. Their reunion belongs after the Coast is relit, with Bram known.
- Morwen's candle ingredients stay secret. Her family connection to Maud is a later reveal.
  Elowen's choice, the giver of the player's light, and the identity behind Isolde's contract
  must not be explained by an early camp NPC.
- Old Hallam is the Coast's ferryman and Silas's friend. He is not the Hollow's Tavern keeper.
  No established name for that keeper was found in the audited lore or current story data.
- The Coast's authored locations and beats exist in writing, but `REGIONS.coast` currently
  uses placeholder gameplay data until its region plug is present. Region 3 is only
  `ROAD_BEYOND.id = 'ember'`; Regions 4–5 are plans. A large `maxZone` must not expose them.

The current living named gatherers are Tam and the available routes for Loy, Nan, Bracken,
Rook, Ashby, Fennel and Dorrie. Loy and Dorrie currently use `forage`; Fennel and Ashby also use
`forage`. Their biographical spinning, selling and gardening do not add new jobs. `jory` has
`live:false` for new recruitment, while old Jory records remain valid. `ada` and `pell` are
disabled in `HANDS_LATER`. Nothing here activates those entries.

## 3. Meeting someone and finding them again

**Proposed map treatment:** an available person has a named marker at a reached landmark.
Selecting the marker opens their short conversation and, where already supported, an action
such as opening their gatherer card. The first implementation can use a named entry on the
existing road/place view; a new illustrated map is not a prerequisite for the writing.

The camp scene and the map entry refer to the same person and conversation history. A hired
gatherer moves to Hollow's Rest. Their home-place entry can say “At Hollow's Rest” and take the
player there. It must not show them standing in the quarry while their job says they are away.
An unread conversation waits while they work. There is no need to recall them to save a story.

Named board visitors can be met before hiring (owner-approved D2). Meeting someone
does not consume a Tent, charge gold, or grant their working bonus. Hiring and trade retain their
existing controls and rules. A full crew must not make the main campaign unreadable.

Opening a person shows, in order: their name and present situation; the next ready conversation;
previous conversations; then relevant existing actions. “Talk” never silently starts a shift,
buys materials, accepts a price, or replaces a reviewed trade quote.

At roughly 740×360, one card contains 2–5 short sentences and one Continue button. A Close button
remains visible. Closing preserves readiness; reading marks only that conversation complete.
The larger scene keeps its place when the card closes. The 360px fallback must remain readable
until the coordinator retires it. These are proposed behavior requirements, not shell edits.

## 4. The Hollow cast and proposed homes

Locations in this table are **proposed encounter placement**, unless an existing beat is named.
The route column records current mechanics; it does not move a hiring gate.

| Person / existing key | Where the player meets or revisits them | Existing availability | Campaign thread and what it may reveal in the Hollow |
|---|---|---|---|
| Old Hesketh / `hesketh` | Cold Hearth; the road-lamp route near the caves; Hollow's Rest | Existing opening and camp narration | Forty years of lamps, the route he finished when nothing caught, then the valley holding light. His hidden hill lamp remains private. |
| Tam / `tam` | Hollow's Rest woodpile | `handsOpen()`; free first worker | He heard about the fire from his uncle. His first returned load becomes a useful piece of the town. He supplies an early human payoff without explaining the mystery. |
| Gammer Loy / `loy` | Tavern visitor, then a working corner of camp | Loom 2 or zone 15, with Hands open | Working by touch in the dark; doing an ordinary job where she can see it again. No new spinning mechanic. |
| Nan Tarrow / `nan` | Quarry Ruins route entry; Tavern visitor; camp | Quarry elder route, or zone 25 | The quarry before the stone woke; recognizing Grenna's work. Her testimony adds a human scale to the existing golem lore. |
| Old Bracken / `bracken` | A Hollow woodcutting landmark; Tavern visitor; camp | Registered Bram route when available, or zone 25 | Felling songs and Bram's father. He does not know or reveal where Ada and Pell are. |
| Rook / `rook` | Quarry cracks entry; Tavern visitor; camp | Registered quarry rumour when available, or zone 30 | Ten years in the cracks; hearing work above him again. Avoid inventing what he found in the deep or linking him to the Voice. |
| Sister Fennel / `fennel` | Chapel garden entry, after the chapel is discovered; camp | Registered chapel route when available, or zone 30 | Keeping the garden in pots. She knows the work she did there, not Elowen's private choice. A fallback arrival does not count as completing the chapel quest. |
| Mother Ashby / `ashby` | Camp table, after her Kitchen route | Kitchen built; no zone fallback in current route data | A place kept for Caedmon. She can acknowledge that someone got her family out; the offer in the fire and the Pyre Knight wait for later regions. |
| Dorrie Fitch / `dorrie` | Tavern doorway; a reached road-market entry | Registered pedlar rumour when available, or zone 32 | Doors she knocked on while selling thread. Her optional trade conversation concerns bringing cargo home as gold, not opening a new economy. |
| Tavern keeper / proposed `tavern_keeper` | Hollow's Rest Tavern | **Approved role:** Tavern built; name and art not yet selected | Knows who is waiting and what practical help the town needs. A practical host, with no hidden identity. Name and appearance remain to be selected. |

The keeper can introduce existing Word on the Road information without replacing its unlock
logic or making the keeper the source of every story. If the owner defers this new person,
Dorrie can carry the optional market conversation once her existing route is available; the
first M1 arc remains complete without the keeper.

## 5. A concrete M1 arc: a road worth coming home to

All `c6.*` identifiers below are proposed editorial IDs, not registered game IDs. Existing
`wisps`, `crowns`, `chapel`, `listener` and `greenLight` beats remain the chapter's spine.
These conversations add personal moments around them. They do not repeat those cards or grant
another copy of a milestone reward.

| Proposed conversation | Ready when | What the player does / sees | Payoff and next lead |
|---|---|---|---|
| `c6.hesketh.route` — Every Hinge | Hearth is lit and the cave place has been discovered | Return to Hesketh; hear about the route he knows by sound | Makes lampkeeping an ordinary person's work. Points toward the road, with no promise of a new reward. |
| `c6.tam.first-load` — Somewhere Dry | Tam has been met; his first gathering return has happened | Talk after he returns, or later when he is home | Tam has brought something useful back. If its pack still waits, use waiting-pack wording rather than claiming delivery. |
| `c6.tam.in-use` — A Piece of the Town | First-load read; a subsequent existing camp build or upgrade completes | Revisit the woodpile | Connect work to a warmer, working town. Do not claim Tam's exact logs paid for a recipe unless the game tracks that fact. |
| `c6.nan.quarry` — Tools Left Standing | Nan met; Quarry Ruins discovered; the golem's existing elder-fall fact recorded | Talk at Nan's current location | Someone remembers the place before it stood up. Optional Grenna recognition waits until Grenna is actually known. |
| `c6.loy.daylight` — By Feel | Loy met; at least one of her ordinary gathering returns | Talk at camp | Her trade existed before the player's upgrades. Use her current job; no loom task or new material requirement. |
| `c6.bracken.mark` — The Fork | Bracken met; `crowns` available; Bram's fork-mark story has been learned if Bram is included | Hear a short felling-song recollection | Bracken's history with Bram's father. Bram's missing-family clue is optional and cannot reveal their destination. |
| `c6.fennel.pots` — What She Brought | Fennel met; `chapel` discovered or filed; prior chapel beat read | Meet at her pots | Someone kept an ordinary part of the chapel alive. Elowen's mystery stays hers to tell. |
| `c6.dorrie.market` — A Door That Opens | Dorrie met; C4 installed and trade open | Ask about the route; optional follow-up after a settled trade | Explains that trading spends stored cargo and returns gold. Reading is free; buying or sending is not a campaign requirement. |
| `c6.hesketh.morning` — All the Way Home | Great Lantern I lit; existing `greenLight` chapter card read/filed and subsequently read; Hesketh route conversation read | Return to Hollow's Rest | The lamps hold through the night. People can plan a journey and expect a lit road home. This completes the M1 conversation arc. |

The required short arc is Hesketh → Tam → an existing build → the Hollow relit → Hesketh.
Nan and the other named workers deepen it when available. It must still finish for a player who
never hires an optional legendary worker. No story condition changes the Fenmother fight,
the Proving, the Great Lantern's rewards, C4's Tavern 2 gate, or a later approved C10 material-loop design.

The chronology uses durable actions, not predicted days. The lore's “days 0–7” and old gatherer
timelines are pacing estimates, not unlock timers. A future refining scene may use C10's first
completed order after that system and its numbers are approved; it is not an M1 dependency here.

### Sample cards for owner review

These are proposed final-length cards. Context and conditions above keep their claims true.

**Every Hinge — Hesketh**

Hesketh closes the road lamp without looking. "That hinge always catches." He lifts it a little,
and it shuts. "Forty years. You learn where to lift."

**Somewhere Dry — Tam, delivered-load version**

Tam brushes bark from his sleeve. "Uncle said there was a fire. He forgot to mention the work."
He looks toward the woodpile. "Still. Good to know where it goes."

**Somewhere Dry — Tam, waiting-pack version**

Tam sets his pack by the Storehouse. "Brought the wood. Now the wood needs a bed." He leaves it
under cover. "It can wait."

**A Piece of the Town — Tam**

Tam stops beside the finished work. "Wasn't there when I arrived." He rubs a splinter from his
thumb. "Starting to look like a place people mean to stay."

**Tools Left Standing — Nan**

Nan looks toward the quarry. "Stone used to stay where you left it." She rests her hands on her
pick. "I liked that about stone."

**By Feel — Loy**

Loy holds a thread up to the light. "Could do this with my eyes shut." She keeps them open.
"Done enough of that."

**What She Brought — Fennel**

Fennel turns a pot toward the light. "Couldn't bring the garden." She brushes a little soil
back over the roots. "Brought what would fit."

**A Door That Opens — Dorrie**

"Used to knock and wait," Dorrie says. "Some doors opened." She looks along the road.
"More of them might, now."

**All the Way Home — Hesketh**

Hesketh stands by the fire when morning comes. "Lamps held." He sets his pole against the wall.
For once, there is nothing to relight.

Short return barks, each under 60 characters: Tam, "Wood's dry. Can't promise the boots.";
Nan, "Stone's staying put today."; Fennel, "Mind the pots. They came a long way.";
Loy, "The dark is no excuse for a loose thread." The last line is already in the gatherer design.
They are optional rotation text, never substitutes for a persistent unread conversation.

## 6. Story readiness that survives leaving

Proposed contract for the later data/UI task:

1. **Known:** a person has been met or an eligible existing record establishes that meeting.
   A proposed map marker can be visible earlier with a practical location hint, without exposing
   their private biography or making a planned person live.
2. **Ready:** world facts and required earlier readings make a particular conversation available.
   Record this once. A later job, hero switch, full pack, closed menu, or trip to another region
   cannot take it away. If the person is away, keep the card waiting at their current home entry.
3. **Read:** the player completes that conversation. Only then can a follow-up that relies on its
   revelation become ready. Reopening a read card gives no repeated rewards or fresh notices.

Do not use map selection as evidence that a story was read. Distinguish reaching a place,
winning its elder fight, meeting a person, and learning a revelation. When several are ready,
show the earliest unread prerequisite first; never stack a chain of automatic story cards.
The game keeps running under the chosen existing story policy. A short conversation should
not become a way to cancel combat or manufacture offline time.

Readiness must persist in the game's normal save and save codes. Extend the existing story
records rather than rebuilding a relationship meter. A proposed record needs a stable
conversation ID, ready fact/time and read flag; where an event cannot be reconstructed, keep
its small durable fact. Exact schema and validation belong to the later reviewed task.

An older valid v5 save already beyond a landmark receives available entries quietly, with
unread status intact. Infer only facts actually recorded: `S.maxZone` can establish road
progress; it cannot prove that Tam personally delivered a load or that the player read a
particular page. For missing personal history, offer a neutral current-situation introduction,
then use future actions for its follow-up. Never fabricate earned intimacy from elapsed time.

Current useful facts include `S.hands.met`, named board/crew keys, stored route milestones,
the worker's `hrs`/`back`/`pack`, and `S.story.seen/read`. Audit their exact semantics before
choosing a condition: for example, a recalled shift is not automatically a completed shift.
`handsBack` and `handsUnload` describe different moments. C4 trade settlement also differs
from a gathering return. Persistent criteria must work in both live and offline completion.

The main story never requires paying a fee to read, rolling a random applicant, fielding a
specific hero, being online, or arriving at a real-world hour. A choice to talk later remains
available. No new quest currency or material reward is proposed.

## 7. Reusing character and Bond writing without restoring Bonds

The three stories per character in [21-stories.js](../../src/js/21-stories.js) remain source
canon. The pair-story titles in [formation.md §2.3](formation.md) are also sources, but they
are not all completed prose in the current tree. Do not claim that 42 finished cards have been
ported. Retain their relationships and open questions; replace only their obsolete access
conditions when the owner approves the campaign version.

| Existing source | Proposed campaign treatment | Earliest safe reveal / remaining decision |
|---|---|---|
| Hesketh's Forty Years / The Unlit Road; `unlit` | A route conversation and a later return to its lamps | Hollow for his work and loss. “The Last Lamp Lit” stays later; no early explanation of why it held. |
| Maren's Eleven Winters; `lampward` | Meet at the Barrow Lamp, then compare two keepers' experiences once both are known | Hollow for her care of the dead; the full rule of given light waits for Region 3. |
| Bram's Empty Cottage / Where the Road Forks; `hunting`, `mossy` | A cottage and fork-mark thread; optional recollections with Wren or Tobin | Hollow clues only. Ada and Pell's location and reunion remain Coast-end content. |
| Pip's Torn Chapter; `page`, `kindlestar`, `waxkindle` | Book, candle and sky conversations attached to relevant places and known people | Missing last line waits for the Emberwaste. Do not assert the selected hero already owns it. |
| Anselm's Patience; `bellsong` | Chapel visit and an optional song at camp | Bell history can come in the Hollow; his last toll and Vesper's last verse remain late. |
| Grenna's Quarry Woke; `quarry` | Nan's quarry testimony first; Grenna and Vesper's shared version later | Their actual character availability, without requiring a combat pair. |
| Aldric's banner; `oldoath`, `banner`, `oldenemies` | A person keeping an old promise, then encounters with those who challenge its meaning | Do not reopen removed pinnacle fights as campaign requirements. Replacement milestones need their own approval. |
| Isolde and Corvin; `signed`, `asked` | Separate introductions before an eventual shared account | Contract identity is a later earned reveal, not a public Tavern rumour. |
| Kestrel and Wren; `markleap`, `twobows` | Different ways of trusting what cannot be seen | Hollow can retain Wren's sound/fruit memories; Kestrel's lost comrade belongs to the Pale Reach. |
| Thessaly and Maren; `mirelamp` | Compare water and lamp memories after their places are known | Drowned village in the Hollow; the lantern-holder in the vision remains finale material. |
| Caedmon and Elowen; `lasttwo`, `chosen`, `candles` | Separate accounts that eventually meet on the same night | No early account of the offer, Elowen's full choice, or the player's origin. |
| Tobin's borrowed sword; `sword` | A small personal account rather than a Warden-class bond | Hero identity adaptation is D4 below; do not put two Tobins in one conversation. |

Named heroes who become NPC participants keep their existing voices and routes. The campaign
does not make an unfinished hero selectable. If the selected hero is a participant, write a
specific player-side version or defer the optional scene; never make the hero meet a second
copy of themselves. Mandatory plot must have a version that works for every supported hero.

## 8. Beyond the Hollow: planned content only

Source boundaries: [region-2.md](region-2.md),
[21b-stories-coast.js](../../src/js/21b-stories-coast.js), lore.md §8.3, and the later
[regions-4-5.md](regions-4-5.md) revision. Current implementation status comes from
[22-data-regions.js](../../src/js/22-data-regions.js), not the presence of an authored story.

| Region | People and places already in the writing | Campaign purpose | What must exist before this can ship |
|---|---|---|---|
| Sunken Coast, planned zones 36–70 | Hallam at Grey Shingle / Hallam's Landing; Silas's letters in the Coral Nave; Ada and Pell after the Coast is relit | Learn what happened to the Coast's light; let Bram's marks finally bring his family home | Actual Coast data and landmarks, adapted solo routes, owner-approved reunion delivery; existing `ferryman`, `chart`, `saltreach`, `letters`, `coastLantern` remain authoritative beat IDs |
| Emberwaste, planned 71–105 | Ashby and Caedmon's table; Pip's missing chapter; Grenna at the glass flats; Cobb and Sparrow in the region plan | Recover the held light; give the people who escaped a place to return to | Region 3 spec and gameplay; authored hero availability; approved NPC/profession work. Ser Durand is a working name, not a C6 naming decision |
| Pale Reach, planned Region 4 | Kestrel's spear and lost comrade; Silent Village survivors; Sten and Runa as working gatherer names | Learn what people kept for each other when the sky and road were lost | Region 4, the Whitehush encounter, and approved roster. The Whitehush is not the raid's Pale Tyrant |
| Gloamvale, planned Region 5 | Existing late threads for Elowen, Hesketh, Thessaly, Anselm and Vesper; Pale Reach survivors reaching the Last Fire | Pay off the people already known, at the first confrontation with the Voice | Region 5/finale approval. Use the later Gloamvale revision: Haldor and Liv are working names, superseding the older Amos/Sable descent draft; do not recruit native villagers from an uninhabited valley |

These are writer-facing signposts, not dialogue for locked map pins. Do not expose the finale's
identity or retreat through a collectible list or NPC subtitle. Follow lore.md's mystery ladder,
not the mere presence of an endgame name in a data file. The Coast's tide continues after its
story changes; conversation copy cannot promise that an ongoing game system stops.

## 9. Recorded decisions and remaining review

Owner answers relayed by Claude on [PR #1](https://github.com/CalSay/Lanternfall/pull/1#issuecomment-5914765444), 30 September 2026. These approve design direction, not implementation before M1.

**D1 — M1 cast and scope: approved.** Start with the Hesketh/Tam arc and optional existing named gatherers in §5. Broader character stories remain later content.

**D2 — Conversation before hiring: approved.** Named visitors can talk while waiting at the Tavern. Read history remains accessible after they leave the active crew; no hiring fee, capacity or working bonus changes.

**D3 — Tavern keeper: approved role.** A recurring practical host who knows who is waiting, with no hidden identity. Keep the role label until name and appearance are approved. Hallam remains the ferryman.

**D4 — Playable hero identity: deferred by the owner.** Do not invent a universal new origin or a duplicate of the selected hero. Defer conflicting optional scenes until the adaptation has been reviewed; mandatory story must still work for every supported hero.

**D5 — Hollow milestone: delegated to Claude and Codex.** Both recommend paying off existing people and the cleared road first. No Gil/Hunter introduction, invented family link or second Storehouse unlock in M1. A later arrival remains a separate approved content task. This preserves the emotional consequence of the Fenmother without adding another unfinished system.

**D6 — Replacing Bond gates: owner agrees; Codex concurs.** Use discoveries and stories actually read, not a hidden relationship grind. For “He Stops Carving”, require Bram known, the Coast relit, Bram's fork-mark story read and the reunion read. These are explicit persistent story facts; a hiring fallback or combat pairing never substitutes for them. The player can revisit unread prerequisites without losing the ending. Quiet catch-up can make an earned conversation available, but must not mark an unseen personal revelation as read. Individual scenes still ship with their reviewed character content.

**D7 — Dialogue delivery: owner requires a modal.** Show a proper conversation popup that dims the game behind it, with an in-page Close button. It must work at 740×360 landscape and 360 px portrait. Camp Talk, Tavern rumours and map entries share conversation state rather than creating separate histories.

### Proposed modal layer — awaiting Claude's shell approval

Propose one reusable `#campaign-dialog` mounted as a sibling immediately after `#app`, before the script marker in `src/shell.html`. This avoids clipping by the scrolling Camp panel or scaled stage. Claude owns the shell insertion and stacking order; C6 must not edit them before sign-off. The story module supplies the dialog contents and uses the agreed open/close interface.

Use a viewport-fixed dim backdrop and an accessible labelled modal (`role="dialog"`, `aria-modal="true"`). Fade the backdrop briefly; reduced-motion preference removes the transition. Dim visually without implying that idle progression pauses. The modal blocks gameplay pointer/keyboard input while open; gameplay hotkeys must respect it, through a Claude-approved shell hook. No second popup may steal focus: another story remains available in history instead.

Keep speaker/name, Close and Continue visible; long text scrolls inside the dialog. At 740×360 use the available width rather than a tall portrait card; at 360 px allow text reflow with no horizontal scrolling and account for safe-area insets. Keyboard focus enters the dialog, stays inside with Tab/Shift+Tab, Escape closes it, and closing restores the invoking control if it still exists (otherwise a stable place heading). The background becomes inert to assistive interaction while the dialog is open, using the existing modal policy if Claude provides one.

Closing a partial scene preserves its readiness; only the explicit completion action marks that scene read. Tests must cover keyboard dismissal, focus recovery after a gatherer departs, repeated openings, a pending away report, and both required viewports. Exact stacking relative to save recovery, away reports and existing sheets is a shell decision: ask Claude to nominate the shared modal host if a sibling mount would conflict.

## 10. Acceptance for a later implementation handoff

- All owner choices above are resolved or explicitly deferred; only approved scenes are live.
- Hesketh/Tam's short arc is readable with a fresh supported hero and with every optional
  named worker skipped. Hiring costs, bonuses, trade prices and recipe gates are unchanged.
- Required earlier revelations are read before later scenes reveal their answers. Reaching a
  fallback recruitment zone does not complete a chapel, hero or story quest.
- A ready story survives save-code export/import, reload, offline returns, region changes and
  an away gatherer. Pack-waiting and completed-delivery copy describe the state truthfully.
- An existing late save gets quiet unread entries, no invented personal history and no chain
  of forced popups. Repeated visits and readings cannot duplicate rewards or notifications.
- Choosing a hero who participates in a scene produces the approved variant, never a duplicate
  person. Incomplete heroes and unimplemented Coast/later-region content remain unavailable.
- Cards meet lore.md's length and voice limits; barks stay under 60 characters. They fit the
  supported landscape and fallback layouts with visible Close/Continue controls and keyboard focus.
- The finale, the contract, the missing page, the hidden lamp and Bram's family remain behind
  their proper revelations. No dark-that-craves-light language or new owner-gated canon slips in.

Doc-stage review checks: source names, current route keys and fallbacks, beat IDs, region plug
status, the old Bond-title table, and conflicts listed in §9. No production code, tests, state,
art, economy or online data are changed by this document.
