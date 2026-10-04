# Revised hero dossier and Brynja review

Open [the offline hero dossier](revised-hero-dossier.html). Select a hero for identity, equipment,
resource, twelve proposed signatures, six shared tools, three build pages, relevant Star definitions
and existing proposed subclass growth. The directory includes 20 retained candidates plus Brynja's
new review proposal. NPC/held-character directions have their own page. Native fragment links work
without JavaScript; scripts only filter the directory. No external dependencies or requests.

Owner-confirmed direction: all characters carry lanterns; mage combat equipment is staff+tome.
Carried lanterns add no free combat stat or slot. Current Mage gear still uses Staff/Lantern; recipes,
eligibility/stats and investment-preserving migration remain future work in
[the skills/crafting equipment scope](equipment-crafting-revision-scope.md).

## Brynja: a heavy woman worth playing

**Brynja Berg, the Doorward — Warrior.** Broad, visibly powerful adult woman, practical heavy plate,
square weather cloak, large shield and weighty warblade. Lantern safely at her hip. Keep the woman
who held the Silent Village's doorway for three nights and later chooses to open a threshold again.
Blunt hospitality, rather than permanent grimness: “Come inside. I'll hold this.” Her door-bar and
brazier are historical objects, not compulsory new weapon types.

Her combat promise: **plant the shield, hold the line, then choose when to give up protection for a
weighty sword release.** This changes the old door-bar/fire kit into a preparation-and-commitment
fighter. She differs from Tobin's defended counters, Maren's Ward conversion, Grenna's armour breaking
and Caedmon's Heat venting. The distinction must still earn its place in a real-core prototype.

Hearth is 0–4 and ordinary Attack earns one. One Set position lasts two subsequent hero actions.
Set alone grants no protection; Guard has its own duration, and both defence styles stay manual.
Opening clears Set and remaining Guard before contact, without natural-expiry rewards. Refresh does
not reset the once-per-establishment defence reward. There is no extra stance button/fourth slot.

The three routes are:

- **Plant, prepare, release:** Close the Door / Open the Line / Measure the Weight. Fund a heavy strike;
  keep protection or consume it for more impact.
- **A threshold worth holding:** Keep the Threshold / Shoulder Forward / Warm Hands. Sustain a finite
  position, weaken the foe and choose when paid recovery is worth an action.
- **Stand, answer, stand again:** Doorward's Habit / Heavy Footing / Still Here. Attack establishes its
  own position, preserves it for Weaken or opens it for damage. A two-Hearth release strengthens that
  opening; full manual defence can fund it earlier. No unselected active is required.

The dossier shows all nine actives and three passives, costs/CDs, source-clearing rules and relevant
optional Stars. Pilgrim's Guard rewards zero-cost defensive preparation; Tempered Edge requires a
paid defensive active; Open Guard requires actual whole-move defence. Passive spending receives no
Banked Coal refund. No fire tick engine or reward for getting hit.

Designer review endorsed the distinct hold/open identity. Qualitative balance review caught the
original passive resource outlet being too weak; the paid release gives Still Here a useful choice.
Opening Set is snapshotted, so one Attack cannot open and re-establish it; defence eligibility is used
even at resource cap. These are structural design findings, **not measured or approved balance**.

## Evidence and editing

`hero-dossier.json` freezes existing proposed card/guide/Star inputs from source checkpoint
`219ba99882bf24959850130ef61479c4c0fc7421`, plus current profile/equipment overrides and Brynja's replacement
proposal. Old Brynja fire/door-bar cards are excluded. Aldric's Banner Stroke/A Banner Is Cloth become
Oathbound Cut/Release the Vow in this new dossier; those display/design revisions do not alter live IDs.
The legacy 32-hero proposal is not silently presented as the accepted roster.

`hero-dossier-profiles.json` records new identity/equipment briefs; `brynja-doorward-revision.json` records
her full replacement design and three routes. Export HTML with `python3 tools/hero-dossier.py`.
The exporter validates cardinality and ability/Star references. Non-Brynja numerical cards and curated
routes are carried-forward proposals; added alternate/passive routes are unmeasured workshop examples.
For deliberate non-Brynja card changes update the frozen dossier inputs. The exporter always reloads
current profile briefs and Brynja's revision JSON, overriding their frozen copies for presentation.
No runtime/game/save/approved-art edits are part of this deliverable.

## Validation

`hero-dossier-validation.json` records 21 hero pages, all 63 build pages, fragment target integrity,
Star navigation, search/class filters, portrait layout and navigation with JavaScript disabled.
No page errors or external requests. Managed Chromium blocks direct `file://` navigation, so the
embedded document was exercised with Playwright `setContent`. Build and all 2,300 game checks passed;
zero browser sections skipped. These checks do not measure the new Brynja kit's combat balance.
