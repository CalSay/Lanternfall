# 75-art-load: what it does and the calls it gives

Moved here from the header of `src/js/75-art-load.js` (bg-pack-by-shape, 2026-10-11): comments in src ship in the split page's boot set (docs/lessons.md, CI and tooling).

```text
75-art-load: the split build's area art, loaded one area ahead (card art-loader; docs/design/hosting.md 5, B2). Browser-only.
The inline page (the Artifact, and every tool's default) has no boot loader (no lfBoot): every pack is in the page, nothing
here runs, and artZoneReady is always true.
In the split build (node tools/build.mjs --split) each foe's atlases and each battle background come in a pack file of their
own. The boot loader (src/boot-loader.html) wrote the tags of the save's zone's packs before the game ran; lfBoot.take hands
those over here, then every later pack as it arrives. This file:
- puts a pack's data in FOE_ART (the foe's atlases; its timings are in the page) or BG_ART (one shape of a background), each
  image a basE91 getter as 21zz makes them, then emits 'artPack' { id, kind, key } (64j cuts that foe's frames).
- loads the packs the zone on screen shows first, then those of the zones either side, the rest of its area and the next
  area: a zone's pack alone, hero files up to three at once (the queue below), and one more for what the stage waits for.
- holds the game (holdGame) while the zone on screen lacks a pack: a plain line covers the stage and the zone number reads
  "loading". A pack still loading is never drawn as a stand-in (art freeze).
- when a pack file fails, asks the server for the page (through lfBoot.page: the game's own code makes no network call): if the page no longer names that file (a new deploy took the old
  hashed files away), the game saves and reloads once the zone on screen needs it; otherwise it tries again later.
  artZonePacks(z) -> the pack ids zone z shows ([] in the inline page), a background's in the stage's shape only
  artZoneReady(z) -> bool: every pack zone z shows is in (and, for one that came after boot, its pictures have decoded)
  artBgImg(theme + o) -> a late background's decoded image (62-stage draws it), or null
Background shapes (card bg-pack-by-shape): a background ships one pack per shape (bg:<theme>:land, bg:<theme>:port; o in the
table). The boot loader writes the one for the stage's shape, as it was last seen with a window of this shape (localStorage
lanternfall.bgShape, { 1: wide window, 0: other } -> 'land' | 'port', kept here every second), else guessed from the window
(wide when innerWidth >= 1.35 x innerHeight). A turn, or a tab sheet that changes the stage's shape, makes the zone on screen
lack the other shape's pack: the game holds under the line until it is in and decoded, and 62-stage's bgArtDraw draws the
backdrop alone meanwhile (never the procedural scenery in its place). The other shape is never loaded ahead.
Hero packs (card hero-packs; tools/build.mjs heroPacks): a hero file's moves come by hero. The boot loader wrote the save's
hero's core pack; after boot that hero's first-hour moves come first (the queue below), its other moves after the zones either
side, and another hero's when the save has that hero (a new game, with no hero yet, loads every hero's core). Each move goes in its hero's moves (lfBoot.putHero: <file's constant>.moves, or
.heroes.<hero>.moves, merged into what the page kept of it). The save's hero's core is in the constant as soon as its file runs,
as in the inline page; a move that comes later emits 'artPack' { id, kind: 'hero', key, hero, moves }, and a drawer that must
prepare its data (basE91 text, cutting frames) does it there (the boot packs emit it too, when this file runs).
The code that draws a hero asks before it draws a move, every frame it draws it:
  artHeroNeed(hero, move) -> bool: true when the move is in (draw it); false: draw nothing for it (never a stand-in): the game
                             holds under a plain line over the stage, and the move loads before anything else, until it is in
                             or nothing has asked for it for half a second (the stage moved on: another hero, another screen)
  artHeroReady(hero, move) -> bool: the same answer, with no hold (true in the inline page, and for a move no pack holds)
  artHeroWait(fn)          -> fn(hero, move) returns false while a move that is in is not ready to draw yet (pictures decoding);
                             it must turn true once it gives up (a picture that never decodes), or the hold never ends
  artHeroPacks(hero, move) -> the hero's pack ids (those holding that move, when named)
  artHeroWant(hero, move)  -> load the move's pack soon, with no hold (a screen off the stage that can wait for it: the hero
                             picker's figure; route-s-wren-wire); its 'artPack' says when it is in
The queue (card hero-queue; loading-screen-judge.md): the moves a new player's first fights draw come before the next zones.
With a hero: its Attack, Hit, Parry and Dodge, then the moves its three slots draw (64h heroArtMove maps an ability to its
move). A new game, with no hero yet: every hero's Attack and Hit after the cores, so whichever starter is picked can swing and
take a hit at once. Slotting or learning an ability asks for its move (artHeroWant). Hero files are small (one move, about
0.1 MB), so up to three load at once; a zone's pack loads alone, as before. What the stage waits for always has a slot more.
New-style packs (n in the table; docs/design/new-style/engine.md) never hold the game: they load by zone after its own packs,
or when 64m asks: artNsWant(pieces) (none while Classic art is on).
Time held (card load-hold-progress): both builds give the same camp, craft and hands progress for the same wall time. A hold
stops only the fight. Camp builds and Hands' jobs run on the wall clock; the Forge, Bench and Loom orders run on the frame
clock, so the frame loop hands each held frame here and they run as in tick:
  artHoldTick(dt) -> 90-boot, every frame the game is held: runs the orders' dt while this file's hold is the only one up
Gathering is not played by hand: under the line the game runs on. The raid holds as before (the online layer is not this card's).
```
