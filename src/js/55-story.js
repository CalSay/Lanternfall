// 55-story: the story core (story-delivery; docs/design/story-bible.md section 10, story-c28.md 4 and 7.1). Which story
// card or caption is due, once per save, and never during a fight. CORE FILE: no DOM. UI: 75-story-ui.js.
// Words: 21k-story-hollow.js (STORY_BEATS, one file per chapter). Limits and banned words: 21h-lore-hollow.js.
//
// One system, silent where the game is not ready: a slot with no data plays nothing. A zone line needs its zone's monster in
// ZONE_FOES; a Captain line needs the Captain itself on screen (ZONE_FOES[z].captain, set by a Captain card; none yet, the zone
// boss is still "Elder <type>"); a Champion or Elder scene needs its encounter (STORY_ENC + mob.encounter, below). Silent is silent
// everywhere: the catch-up files nothing for them, the Road log lists nothing for them, the Bestiary shows nothing for them.
// Nothing plays on a replay (every key is kept in S.story.seen), during a fight, or while the hero gathers, raids or dives.
//
// Channels (STORY_BEATS slots, 21k-story-hollow.js):
//   R region card, A area title, Z zone line, C Captain line, P Champion scene, E Elder sequence, N NPC scene, V Voice line,
//   choice card, hero line, J Journal page and letters, H camp line (storyHearthLine), I item flavour (storyItemLine),
//   Vesper's verse (storyVerse).
// Presentation: a scene is a `caption` (A, Z, C: a line or two on the stage, held at most 3 s) or a `card` sequence (the rest:
// one card a tap, Skip always shown). The game holds while a scene is up (storyHeld(), asked by 90-boot's frame), so a scene
// only comes in a gap: after a kill, or in the first second of a spawn. Scenes wait their turn in a queue.
//
// Gates: STORY_ON (dev switch, below) and the player's option S.story.off ("Story cards: on / off" in Settings). Off plays
// no scene and files nothing new; the Journal keeps what was read and the `story` keys stay (turning it on loses nothing).
//
// API (core):
//   storyOn() -> bool                      scenes may play
//   storyHeld() -> bool                    a scene is on screen: the frame loop does not tick (90-boot)
//   storyClaim(id)                         the UI shows scene `id` (so the hold lasts until it ends; without a claim it lapses in 30 s)
//   storyClose(id, how)                    how: 'done' (the last card closed) | 'skipped' (Skip or Close ended it early) | 'auto'
//                                          (nobody touched the card for 45 s, or it waited behind another overlay for 28 s: 75-story-ui).
//                                          Files the scene's page, applies unchosen choice defaults, sets S.story.ends[id] ('auto'
//                                          sets none, so the skip rate of bible 12a stays honest, and files the scene's own key and its
//                                          page as late so the Journal offers "Catch up on the story"; a choice in an unattended
//                                          Champion or Elder scene stays open, and its Journal entry offers it until it is made).
//   storyChoose(choiceId, optionId) -> bool   saves a choice (once); the default if optionId is missing
//   storyChosen(choiceId) -> bool          the choice is saved
//   storyChoiceDef(id) -> { prompt, options: [{ id, label, line }], def } | null   (the choice card reads it)
//   storyList() -> [{ id, kind, region, zone, title, got, read, late }]   the Journal, in story order (an NPC scene dropped by `not`
//                                          is never listed; Champion and Elder NPCs read inside their Champion's or Elder's entry)
//   storyEntry(id) -> { id, kind, region, zone, title, cards: [{ lines, who?, choice? }] } | null   (a choice card only while it is open)
//   storyRead(id), storyUnread() -> [ids], storyLate() -> [ids]   (late: filed by the catch-up, unread)
//   storyJournalOpened()                   counts one Journal open (S.story.journalOpens, bible 12a)
//   storyRoadLog() -> [{ zone, head, line }]   area titles, and the zone and Captain lines already seen whose monster is in the game
//   storyFile(kind, id) -> bool            files a letter or note (kind 'letter' | 'note') in the Journal, once
//   storyHeroLine(id) -> string            bible 4.4: the active hero's line if it is a starter (wren/tobin/pip), else the stored
//                                          starter's (S.story.starter), else the shared `_` line, else ''
//   storyHearthLine() -> string            the camp voice: the newest Champion or Elder line the save has earned
//   storyVerse(elderId) -> [lines] | null  Vesper's verse, once that Elder is down
//   storyItemLine(uniqueKey) -> string     a Hollow unique's flavour line; '' until its area's Champion is in the game
//   storyRanks() -> [{ id, who, line }]    the ranks the player has met, in chain order (the Journal's "Who answers to whom" page)
//   storyVerseLatest() -> { id, lines } | null   the newest Elder's verse Vesper may sing in the Tavern
//   storyEncounter(kind, id, on = true)    an encounter card says its Champion or Elder is in the game (kind 'champ' | 'elder');
//                                          its spawn listener also sets mob.encounter = { kind, id }
//   storyFoes() -> [{ zone, name, line, type }] the Hollow monsters in the game whose zone the hero has reached (21h LORE_FOES); the
//                                          Codex Bestiary lists each as its own entry (57c-codex)
//   storyIntroClaim()                      75-intro-ui.js plays the drawn opening itself: the engine leaves the Chapter 1 card to it
//   storyIntro(part) -> { part, beats | who, lines, still } | null   what the opening still owes: part 'open' (the lamp stills, before the
//                                          hero picker; a new game only) or 'fire' (Hesketh's roadside fire over still 3, after the pick)
//   storyIntroDone(part, how)              part 'open' | 'fire' | 'release' (the picker closed with no fire due); how: opened ('shown') or closed ('done' | 'skipped'); files the Chapter 1 card or the fire scene in the Journal
//   storySync() runs on each tick (cheap when nothing moved).
// Events emitted: storyScene { id, ch, kind: 'caption' | 'card', title, head, lines, cards, zone, region, hold, page },
//   storyEnd { id, how }, storyChoice { id, option }, storyRead { id }, storyFiled { kind, id }.
// Listens: spawn (the region boss's display name; Captains and Champions), kill (post scenes), awayBegin / awayEnd.
// Data keys: an npc entry may carry `not: 'wren' | 'tobin' | 'pip'` (a starter met as a person): the scene is dropped when that
// starter is the story hero (the active hero if it is a starter, else S.story.starter).
//
// Save: registerState('story', { v: 1, seen: {}, read: {}, init: 0, off: 0, starter: '', litFor: {}, coldhearth: '', ends: {},
//   journalOpens: 0 }). v, seen, read, init are the old fields, kept. `seen` keys: 'r:<region>' (R), 'a:<areaIdx>' and 'z:<zone>'
//   (A, Z), 'c:<zone>' (C), 'p:<id>:pre|post' (P), 'e:<id>:pre|post' (E), 'n:<id>' (N), 'v:<id>' (V), 'ch:<id>' (choice),
//   'j:<id>' (page), 'l:<id>' and 'o:<id>' (letter, note); value = ms played (negative = filed by the catch-up). The old
//   keys ('a:<region>:<place>', 'b:', 'ei:', 'ef:') are kept and ignored. `read`: Journal entry id -> 1.
//   off: 1 = Story cards off. ends: scene key -> 'done' | 'skipped' (12a; never 'auto'). journalOpens: Journal opens (12a).
//   starter, litFor (Great Lantern -> name), coldhearth: for story-opening and story-choices.
//   'i:open' (the drawn opening was shown or skipped), 'n:<id>' for the opening's NPC scenes (heskethFire, over the stills; heskethTalk, at the camp fire).
// A save that is past a slot when it loads, or reaches it with the story off, files it quietly: captions are marked seen,
// cards go in the Journal unread (late), where the Codex offers them as "Catch up on the story". Nothing pops. Only slots the game
// can show are filed (a zone line with its monster, a Captain line with its Captain, a Champion or Elder with its encounter, an
// NPC scene at an area's door); a Champion's or Elder's NPCs ride that scene and are not filed on their own.

const STORY_ON = true;   // dev switch (bible 10.4): false plays no story at all; the data files can also be deleted

let storyOn, storyHeld, storyInGap, storyChoiceDef, storyChosen, storyClaim, storyClose, storyChoose, storyList, storyEntry, storyRead, storyUnread, storyLate, storyJournalOpened,
  storyRoadLog, storyFile, storyHeroLine, storyHearthLine, storyVerse, storyVerseLatest, storyItemLine, storyRanks, storyEncounter, storyFoes, storySync,
  storyIntroClaim, storyIntro, storyIntroDone;
const STORY_ENC = { champ: {}, elder: {} };   // encounters in the game: STORY_ENC.champ.<id> = true (storyEncounter)
{
  registerState('story', { v: 1, seen: {}, read: {}, init: 0, off: 0, starter: '', litFor: {}, coldhearth: '', ends: {}, journalOpens: 0 });
  const ST = () => S.story;
  const D = k => (typeof STORY_BEATS === 'object' && STORY_BEATS && STORY_BEATS[k]) || {};
  const foeIn = z => typeof ZONE_FOES === 'object' && !!ZONE_FOES[z];
  const captainIn = z => foeIn(z) && !!ZONE_FOES[z].captain;   // the Captain itself is on screen (a Captain card sets ZONE_FOES[z].captain)
  const heroKey = () => (typeof soloHero === 'function' && soloHero()) || '';
  // the story hero (bible 4.4): the active hero if it is a starter, else the starter the save began with, else ''
  const STARTERS = ['wren', 'tobin', 'pip'];
  const storyHero = () => { const h = heroKey(), s = ST().starter; return STARTERS.includes(h) ? h : STARTERS.includes(s) ? s : ''; };
  const present = (kind, id) => !!(STORY_ENC[kind] && STORY_ENC[kind][id]);
  const seenAt = k => ST().seen[k];
  const has = k => !!seenAt(k);
  const mark = (k, late) => { if (!ST().seen[k]) ST().seen[k] = late ? -Date.now() : Date.now(); };
  const regionIdOf = z => { const r = typeof regionOf === 'function' ? regionOf(z) : null; return r ? r.id : 'hollow'; };

  storyOn = () => STORY_ON && !ST().off && typeof STORY_BEATS === 'object';
  // ---- the drawn opening (intro-and-picker) ----
  // The opening is the Hollow's region card, shown by 75-intro-ui.js over two stills BEFORE the hero picker, then Hesketh's roadside fire over a
  // third still AFTER the pick (STORY_BEATS.intro names the stills and which lines show over each). The UI claims it at load; a core with no UI
  // (Node tools) keeps the old flow, the region card at the first walk-in. Only a new game plays it: a save past zone 1, or one that already read
  // the card, files nothing new.
  let introOn = false, introUp = false;   // introUp: an opening screen is on top, so nothing walks in under it
  const introData = () => D('intro');
  storyIntroClaim = () => { introOn = true; };
  storyIntro = part => {
    const I = introData(), R = I.region && D('region')[I.region];
    if (!introOn || !storyOn() || !R || !I.open) return null;
    if (part === 'open') {
      if (has('i:open') || has('r:' + I.region) || (S.maxZone || 1) > 1 || S.totalKills > 0) return null;
      return { part, region: I.region, beats: I.open.map(b => ({ still: b.still, line: R.lines[b.line] || '' })).filter(b => b.line) };
    }
    const n = part === 'fire' && D('npc')[I.fire];
    if (!n || !has('i:open') || has('n:' + I.fire)) return null;
    return { part, id: I.fire, who: n.who || '', still: I.fireStill || '', lines: n.lines.map(lineText).filter(Boolean) };
  };
  storyIntroDone = (part, how) => {
    if (how === 'shown') introUp = true;   // the opening stays up through the picker, until the fire scene ends (or the picker closes with none due: part 'release')
    const I = introData(), end = k => { if (how !== 'shown') ST().ends[k] = how === 'skipped' ? 'skipped' : 'done'; };   // 'shown': the screen just opened (filed now, like every scene, so a reload does not replay it)
    if (part === 'open' && I.region) { mark('i:open'); mark('r:' + I.region); end('r:' + I.region); }
    else if (part === 'fire' && I.fire) { mark('n:' + I.fire); end('n:' + I.fire); }
    if (how !== 'shown' && part !== 'open') { introUp = false; storySync(); }   // what waited under the screens (the area caption) is due now, even if the guide holds the ticks
  };
  storyEncounter = (kind, id, on) => { if (STORY_ENC[kind]) STORY_ENC[kind][id] = on !== false; };
  storyHeroLine = id => { const h = D('hero')[id]; return h ? h[storyHero()] || h._ || '' : ''; };
  // An item entry is a line, or { area, line }: a line with an area waits until an encounter card has put a Champion of that area in
  // the game (the line names it, and the player must have met it).
  storyItemLine = key => {
    const it = D('item')[key];
    if (!it) return '';
    if (typeof it === 'string') return it;
    const champ = D('champ');
    return Object.keys(champ).some(id => zoneAreaIdx(champ[id].zone) === it.area && present('champ', id)) ? it.line : '';
  };
  storyChoiceDef = id => { const c = D('choice')[id]; return c && c.options ? { prompt: c.prompt, options: c.options.map(o => ({ id: o.id, label: o.label, line: o.line || '' })), def: c.def } : null; };

  // ---- lines and cards ----
  const lineText = l => typeof l === 'string' ? l : l && l.hero ? storyHeroLine(l.hero) : '';
  // a list of lines (strings, { hero: id } or { choice: id }) -> cards. tap: one card a line; else all lines on one card.
  function cardsOf(items, tap, who) {
    const out = [], lines = [];
    const flush = () => { if (lines.length) { out.push({ lines: lines.splice(0), who: who || '' }); } };
    for (const it of items || []) {
      if (it && it.choice) { flush(); if (D('choice')[it.choice]) out.push({ choice: it.choice, lines: [] }); continue; }
      const t = lineText(it); if (!t) continue;
      lines.push(t); if (tap) flush();
    }
    flush();
    return out;
  }
  const npcCards = id => { const n = D('npc')[id]; return n && !(n.not && n.not === storyHero()) ? cardsOf(n.lines, false, n.who || '') : []; };   // `not`: a starter met as a person is not in his own story
  const npcAt = at => Object.keys(D('npc')).filter(id => D('npc')[id].at === at);

  // ---- scenes: what a trigger builds ----
  const mk = (id, ch, over) => Object.assign({ id, ch, kind: 'card', title: '', head: '', lines: [], cards: [], zone: 0, region: '', hold: 0, page: '' }, over);
  function regionScene(id) {
    const r = D('region')[id]; if (!r) return null;
    return mk('r:' + id, 'R', { title: r.title, cards: [{ lines: r.lines.slice() }], region: id });
  }
  function champScene(id, phase) {
    const c = D('champ')[id]; if (!c) return null;
    const cards = cardsOf(phase === 'pre' ? c.pre : c.post, false);
    if (phase === 'post') for (const nid of npcAt('champPost:' + id)) cards.push(...npcCards(nid));
    return cards.length ? mk(`p:${id}:${phase}`, 'P', { title: c.name || (c.page && c.page.title) || '', cards, zone: c.zone, region: regionIdOf(c.zone), page: phase === 'post' && c.page ? id : '' }) : null;
  }
  function elderScene(id, phase) {
    const e = D('elder')[id]; if (!e) return null;
    let cards;
    if (phase === 'pre') {
      cards = cardsOf(e.pre, true);
      for (const nid of npcAt('elderPre:' + id)) cards.push(...npcCards(nid));
    } else {
      cards = cardsOf(e.post, true);
      for (const nid of npcAt('elderPost:' + id)) cards.push(...npcCards(nid));
      cards.push(...cardsOf(e.after, true));
      const h = e.hero ? storyHeroLine(e.hero) : ''; if (h) cards.push({ lines: [h], who: '' });
    }
    return cards.length ? mk(`e:${id}:${phase}`, 'E', { title: e.name || (e.page && e.page.title) || '', cards, zone: e.zone, region: regionIdOf(e.zone), page: phase === 'post' && e.page ? id : '' }) : null;
  }
  const voiceScene = id => { const v = D('voice')[id]; const cards = v ? cardsOf(v.lines, false) : []; return cards.length ? mk('v:' + id, 'V', { title: v.title || 'A voice', cards, zone: v.zone, region: regionIdOf(v.zone) }) : null; };
  const npcScene = id => { const cards = npcCards(id); return cards.length ? mk('n:' + id, 'N', { title: D('npc')[id].who || '', cards }) : null; };
  const choiceScene = id => { const c = D('choice')[id]; return c ? mk('ch:' + id, 'K', { title: c.prompt, cards: [{ choice: id, lines: [] }], zone: c.zone || 0, region: c.zone ? regionIdOf(c.zone) : '' }) : null; };
  const caption = (ids, head, lines, zone) => mk(ids.join(' '), ids[0][0].toUpperCase(), { kind: 'caption', head, lines, zone, hold: 3000, region: regionIdOf(zone) });

  // ---- who answers to whom (bible 5): a Journal page that gains a row the first time each rank is met ----
  const RANKS = [
    { id: 'voice', who: 'The Voice', line: 'The dark that was here first. Every Elder answers to it.', met: () => Object.keys(ST().seen).some(k => k.startsWith('v:')) },
    { id: 'elder', who: 'Elders of Darkness', line: 'The dark set over a whole region. Its Champions answer to it.', met: () => Object.keys(ST().seen).some(k => /^e:.+:pre$/.test(k)) },
    { id: 'champ', who: 'Champions of Darkness', line: 'Dark-born. Each rules one area. Its Captains and Shadowborn answer to it.', met: () => Object.keys(ST().seen).some(k => /^p:.+:pre$/.test(k)) },
    { id: 'captain', who: 'Shadowborn Captains', line: 'The strongest Shadowborn of a zone. Each holds one seam open.', met: () => Object.keys(ST().seen).some(k => k.startsWith('c:')) },
    { id: 'shadowborn', who: 'Shadowborn', line: 'What climbs out of the ground. Each one copies a shape it found.', met: () => Object.values((S.mastery && S.mastery.zones) || {}).some(n => n > 0) }
  ];
  storyRanks = () => RANKS.filter(r => r.met()).map(r => ({ id: r.id, who: r.who, line: r.line }));

  // ---- the journal: every entry the data can make, in story order ----
  // key: the seen key that files it. cards() builds what a re-read shows (a Champion or Elder entry grows with its post scene).
  const readable = sc => (sc ? sc.cards.filter(c => !c.choice || !storyChosen(c.choice)) : []);   // a re-read shows the words; a choice only while it is still open
  function defs() {
    const out = [];
    const add = (id, kind, key, zone, title, cards, also) => out.push({ id, kind, key, zone, region: regionIdOf(zone || 1), title, cards, keys: [key, ...(also || [])] });   // also: keys whose lateness is this entry's (a post scene)
    for (const id in D('region')) { const r = regionById(id); if (r) add('r:' + id, 'region', 'r:' + id, r.z0, D('region')[id].title, () => [{ lines: D('region')[id].lines.slice() }]); }
    for (const id in D('champ')) { const c = D('champ')[id];
      add('p:' + id, 'champion', `p:${id}:pre`, c.zone, c.name || (c.page && c.page.title) || id, () => [...readable(champScene(id, 'pre')), ...(has(`p:${id}:post`) ? readable(champScene(id, 'post')) : [])], [`p:${id}:post`]);
      if (c.page) add('j:' + id, 'page', 'j:' + id, c.zone, c.page.title, () => [{ lines: [c.page.text] }]); }
    for (const id in D('elder')) { const e = D('elder')[id];
      add('e:' + id, 'elder', `e:${id}:pre`, e.zone, e.name || (e.page && e.page.title) || id, () => [...readable(elderScene(id, 'pre')), ...(has(`e:${id}:post`) ? readable(elderScene(id, 'post')) : [])], [`e:${id}:post`]);
      if (e.page) add('j:' + id, 'page', 'j:' + id, e.zone, e.page.title, () => [{ lines: [e.page.text] }]); }
    for (const id in D('voice')) add('v:' + id, 'voice', 'v:' + id, D('voice')[id].zone, D('voice')[id].title || 'A voice', () => cardsOf(D('voice')[id].lines));
    for (const id in D('npc')) if (/^(area:|intro|hearth)/.test(D('npc')[id].at) && npcCards(id).length) add('n:' + id, 'npc', 'n:' + id, npcZone(D('npc')[id].at), D('npc')[id].who || id, () => npcCards(id));   // the others read inside their Champion's or Elder's entry
    add('k:ranks', 'ranks', 'k:ranks', 0, 'Who answers to whom', () => storyRanks().map(r => ({ who: r.who, lines: [r.line] })));
    for (const [slot, pre] of [['letter', 'l'], ['note', 'o']]) for (const id in D(slot)) { const x = D(slot)[id];
      add(`${pre}:${id}`, slot, `${pre}:${id}`, x.zone || 0, x.title, () => [{ lines: [x.text] }]); }
    return out.sort((a, b) => (a.zone || 0) - (b.zone || 0));
  }
  // the zone an NPC scene belongs to (its area's first zone, or its Champion's or Elder's zone)
  function npcZone(at) {
    const [k, v] = String(at).split(':');
    if (k === 'intro' || k === 'hearth') return 1;   // the opening's own scenes (the roadside fire, the camp fire talk)
    if (k === 'area') return (+v) * (typeof AREA_ZONES === 'number' ? AREA_ZONES : 5) + 1;
    const x = (k === 'champPost' ? D('champ') : D('elder'))[v];
    return x ? x.zone : 0;
  }
  storyEntry = id => { const d = defs().find(x => x.id === id); return d && has(d.key) ? { id: d.id, kind: d.kind, region: d.region, zone: d.zone, title: d.title, cards: d.cards() } : null; };
  storyList = () => defs().filter(d => has(d.key)).map(d => ({ id: d.id, kind: d.kind, region: d.region, zone: d.zone, title: d.title, got: Math.abs(seenAt(d.key)), read: !!ST().read[d.id], late: d.keys.some(k => seenAt(k) < 0) })).map(e => e.read && storyEntry(e.id).cards.some(c => c.choice) ? { ...e, read: false } : e);   // an open choice keeps its entry unread
  storyUnread = () => storyList().filter(e => !e.read).map(e => e.id);
  storyLate = () => storyList().filter(e => e.late && !e.read).map(e => e.id);
  storyRead = id => { if (!storyEntry(id) || ST().read[id]) return; ST().read[id] = 1; emit('storyRead', { id }); };
  storyJournalOpened = () => { ST().journalOpens = (ST().journalOpens || 0) + 1; };
  storyRoadLog = () => {
    const out = [], st = ST().seen, A = D('area'), Z = D('zone'), C = D('captain'), n = typeof AREA_ZONES === 'number' ? AREA_ZONES : 5;
    for (const i in A) if (st['a:' + i] > 0) out.push({ zone: i * n + 1, head: zoneAreaName(i * n + 1), line: A[i] });
    for (const z in Z) if (st['z:' + z] > 0 && foeIn(+z)) out.push({ zone: +z, head: zoneName(+z), line: Z[z] });
    for (const z in C) if (st['c:' + z] > 0 && captainIn(+z)) out.push({ zone: +z, head: C[z].title, line: C[z].line });
    return out.sort((a, b) => a.zone - b.zone);
  };
  storyFile = (kind, id) => {
    const pre = kind === 'letter' ? 'l' : kind === 'note' ? 'o' : '';
    if (!pre || !D(kind)[id] || has(`${pre}:${id}`)) return false;
    mark(`${pre}:${id}`); emit('storyFiled', { kind, id }); return true;
  };
  storyHearthLine = () => {
    let best = null;
    for (const [slot, ph] of [['champ', 'p'], ['elder', 'e']]) for (const id in D(slot)) { const x = D(slot)[id];
      if (x.hearth && has(`${ph}:${id}:post`) && (!best || x.zone > best.zone)) best = x; }
    return best ? best.hearth : '';
  };
  storyVerse = id => (has(`e:${id}:post`) && D('vesper')[id]) || null;
  storyVerseLatest = () => {
    let best = null;
    for (const id in D('vesper')) { const e = D('elder')[id], v = storyVerse(id); if (v && v.length && (!best || ((e && e.zone) || 0) > best.zone)) best = { id, lines: v, zone: (e && e.zone) || 0 }; }
    return best ? { id: best.id, lines: best.lines.slice() } : null;
  };

  // The Hollow monsters the hero has reached that are in the game, each with its Bestiary line (21h LORE_FOES): the Codex lists each as its own entry.
  storyFoes = () => {
    const out = [], mz = S.maxZone || 1, last = REGIONS[0].z1;   // the Hollow's zones: 1 to 35
    if (typeof LORE_FOES !== 'object' || typeof zoneType !== 'function') return out;
    for (let z = 1; z <= last && z <= mz; z++) {
      const f = LORE_FOES[z];
      if (f && foeIn(z)) out.push({ zone: z, name: f.name, line: f.line, type: TYPES[zoneType(z)].key });
    }
    return out;
  };

  // ---- choices ----
  storyChosen = id => { const c = D('choice')[id], st = ST(); if (!c) return true; return c.store === 'litFor' ? st.litFor[c.key || id] !== undefined : c.store === 'coldhearth' ? !!st.coldhearth : true; };
  storyChoose = (id, opt) => {
    const c = D('choice')[id], st = ST();
    if (!c || !c.options) return false;
    const o = c.options.find(x => x.id === opt) || c.options.find(x => x.id === c.def); if (!o) return false;
    const key = c.key || id;
    if (c.store === 'litFor') { if (st.litFor[key] !== undefined) return false; st.litFor[key] = o.id; }
    else if (c.store === 'coldhearth') { if (st.coldhearth) return false; st.coldhearth = o.id; }
    else return false;
    emit('storyChoice', { id, option: o.id });
    return true;
  };

  // ---- the queue: scenes wait for a gap, one at a time ----
  let cur = null, claimed = false, heldAt = 0;
  const queue = [];
  holdGame(() => storyHeld());   // 00-util's pause registry: the frame loop does not tick while a scene is up
  storyInGap = () => inGap();
  storyHeld = () => !!cur && (claimed || (!!cur.chain && Date.now() - heldAt < 3000));   // only a scene the player can see holds the game (and, for 3 s, the next one of
  // the same stop while the last sheet closes); one waiting behind another overlay does not
  storyClaim = id => { if (cur && cur.id === id) claimed = true; };
  storyClose = (id, how) => {
    if (!cur || cur.id !== id) return;
    const sc = cur, shown = claimed; cur = null; claimed = false;
    const st = ST();
    const auto = how === 'auto';   // nobody touched it: filed as a page to catch up on, and no `ends` entry (bible 12a)
    // skipped: the default. Left alone in a Champion's or Elder's scene, a choice stays open: its Journal entry offers it to catch up on
    if (!(auto && /^[pe]:/.test(sc.id))) for (const c of sc.cards) if (c.choice) storyChoose(c.choice);
    if (sc.kind === 'card' && !auto && !st.ends[sc.id]) st.ends[sc.id] = how === 'done' ? 'done' : 'skipped';
    if (sc.page) mark('j:' + sc.page, auto);
    if (auto) for (const k of [sc.id, sc.page && 'j:' + sc.page]) if (k && st.seen[k] > 0) st.seen[k] = -st.seen[k];   // late, unread (a caption's joined id is no key)
    const post = auto && /^([pe]:[^:]+):post$/.exec(sc.id); if (post) delete st.read[post[1]];   // its Journal entry (pre and post together) is unread again
    emit('storyEnd', { id, how });
    // the next scene of the same stop plays now, even while the guide holds the game (no tick runs to pump it), once the UI has closed this one
    // (not tied to the gap: the shown scene held the game, so this is still the same stop)
    if (shown && queue.length && typeof setTimeout === 'function') setTimeout(() => { if (!cur && storyOn() && live()) pump(true); }, 0);
  };
  // a caption for a zone the hero has left is dropped (it belonged to that moment)
  const stale = sc => sc.kind === 'caption' && sc.zone && sc.zone !== S.zone;
  function pump(chain) {
    while (!cur && queue.length) {
      const sc = queue.shift();
      if (stale(sc)) continue;
      if (chain) sc.chain = true;   // follows a shown scene: the UI plays it once the last sheet has closed, gap or not
      cur = sc; claimed = false; heldAt = Date.now();
      emit('storyScene', sc);
    }
  }
  const push = sc => { if (sc) queue.push(sc); };

  // ---- time and gaps ----
  let clock = 0, spawnT = -99, gapNow = true, inAway = false, swept = 0, last = '', spawned = null;
  const live = () => storyOn() && !inAway && !introUp && S.activity === 'fight' && !(typeof arena !== 'undefined' && arena);
  const inGap = () => gapNow || clock - spawnT < 1;

  // ---- the catch-up: a save past a slot (or one that played it with the story off) files it quietly ----
  // A slot is passed when its zone is below the best zone reached. Captions are marked seen; cards go in the Journal unread.
  function sweep(mz) {
    const n = typeof AREA_ZONES === 'number' ? AREA_ZONES : 5;
    for (const id in D('region')) { const r = regionById(id); if (r && r.z0 < mz) mark('r:' + id, true); }
    for (const i in D('area')) if (i * n + 1 < mz) mark('a:' + i);
    for (const z in D('zone')) if (+z < mz && foeIn(+z)) mark('z:' + z);   // silent is silent: no line for a monster that is not in the game
    for (const z in D('captain')) if (+z < mz && captainIn(+z)) mark('c:' + z);
    for (const id in D('champ')) if (present('champ', id) && D('champ')[id].zone < mz) { mark(`p:${id}:pre`, true); mark(`p:${id}:post`, true); if (D('champ')[id].page) mark('j:' + id, true); }
    for (const id in D('elder')) if (present('elder', id) && D('elder')[id].zone < mz) { mark(`e:${id}:pre`, true); mark(`e:${id}:post`, true); if (D('elder')[id].page) mark('j:' + id, true); }
    for (const id in D('voice')) if (D('voice')[id].zone < mz) mark('v:' + id, true);
    for (const id in D('npc')) if (/^area:/.test(D('npc')[id].at) && npcZone(D('npc')[id].at) < mz && npcCards(id).length) mark('n:' + id, true);   // a Champion's or Elder's NPCs ride its scene
    for (const id in D('choice')) { const c = D('choice')[id]; if (c.zone && c.zone < mz && !has('ch:' + id)) { mark('ch:' + id, true); storyChoose(id); } }
  }

  // ---- each tick: what is due where the hero stands ----
  storySync = early => {
    const mz = S.maxZone || 1;
    if (!storyOn()) { queue.length = 0; if (cur && !claimed) storyClose(cur.id, 'skipped'); return; }   // off: nothing plays and nothing is filed or defaulted; the catch-up runs when it is turned back on
    if (mz !== swept) { swept = mz; sweep(mz); }
    if (!has('k:ranks') && storyRanks().length) mark('k:ranks');
    if (!ST().starter && STARTERS.includes(heroKey())) ST().starter = heroKey();   // bible 4.4: the cold-start hero, stored once (an old save: its hero now)
    if (!live()) { last = ''; return; }
    const z = S.zone || 1, gap = inGap();
    if (gap && spawned && !early) { const sp = spawned; spawned = null; if (sp.zone === z) onSpawn(sp.mob, z); }
    const sig = z + '|' + (gap ? 1 : 0);
    if (gap && sig !== last) { last = sig; walkIn(z); }
    if (gap) pump();
  };
  function walkIn(z) {
    const n = typeof AREA_ZONES === 'number' ? AREA_ZONES : 5, rid = regionIdOf(z), r = regionById(rid), ai = zoneAreaIdx(z);
    if (r && z === r.z0 && !has('r:' + rid) && D('region')[rid] && !storyIntro('open')) { mark('r:' + rid); push(regionScene(rid)); }   // a new game's card is the drawn opening's
    const ids = [], lines = [];
    if (z === ai * n + 1 && D('area')[ai] && !has('a:' + ai)) { mark('a:' + ai); ids.push('a:' + ai); lines.push(D('area')[ai]); }
    if (D('zone')[z] && foeIn(z) && !has('z:' + z)) { mark('z:' + z); ids.push('z:' + z); lines.push(D('zone')[z]); }
    // an area's people talk first; the caption names the place and its monster just before the fight
    if (z === ai * n + 1) for (const id of npcAt('area:' + ai)) if (!has('n:' + id) && npcCards(id).length) { mark('n:' + id); push(npcScene(id)); }
    if (ids.length) push(caption(ids, zoneName(z), lines, z));
    for (const id in D('voice')) if (D('voice')[id].zone === z && !has('v:' + id)) { mark('v:' + id); push(voiceScene(id)); }
    for (const id in D('choice')) if (D('choice')[id].zone === z && !has('ch:' + id)) { mark('ch:' + id); push(choiceScene(id)); }
  }
  // the lead foe has spawned: a Captain's line (its Captain on screen), or the pre scene of a Champion or Elder
  function onSpawn(mob, z) {
    if (!mob || !mob.boss) return;
    const enc = mob.encounter;
    if (enc && present(enc.kind, enc.id)) {
      const key = `${enc.kind === 'elder' ? 'e' : 'p'}:${enc.id}:pre`;
      if (!has(key)) { mark(key); push(enc.kind === 'elder' ? elderScene(enc.id, 'pre') : champScene(enc.id, 'pre')); }
      return;
    }
    const c = D('captain')[z];
    if (c && captainIn(z) && !has('c:' + z)) { mark('c:' + z); push(caption(['c:' + z], c.title, [c.line], z)); }
  }

  on('spawn', ({ mob, zone }) => {
    if (!mob || (typeof arena !== 'undefined' && arena)) return;
    spawnT = clock; gapNow = false;
    // the region boss's display name (REGIONS[i].boss.name; the Hollow: "The Fenmother")
    const r = regionOf(zone);
    if (mob.boss && zone === r.z1 && r.boss && r.boss.name) mob.name = r.boss.name;
    spawned = { mob, zone };   // read next tick: an encounter card may set mob.encounter after this listener
    storySync(true);   // the walk-in scenes are due now: they open (and hold the game) before the first tick can fight
  });
  on('kill', ({ mob, zone }) => {
    gapNow = true;
    if (!mob || !mob.boss || !live()) return;
    const enc = mob.encounter;
    if (!enc || !present(enc.kind, enc.id)) return;
    const key = `${enc.kind === 'elder' ? 'e' : 'p'}:${enc.id}:post`;
    if (has(key)) return;
    mark(key);
    push(enc.kind === 'elder' ? elderScene(enc.id, 'post') : champScene(enc.id, 'post'));
  });
  on('awayBegin', () => { inAway = true; });
  on('awayEnd', () => { inAway = false; last = ''; });
  on('zoneClear', () => { last = ''; });
  // Hesketh's talk plays when the camp fire is lit (the 8 Pine Log fire), which pays off "Wood first. Then we talk." It waits for a gap like any scene.
  on('hearthLit', () => {
    if (!storyOn()) return;
    for (const id of Object.keys(D('npc')).filter(k => D('npc')[k].at === 'hearth')) if (!has('n:' + id) && npcCards(id).length) { mark('n:' + id); push(npcScene(id)); }
  });
  onTick(dt => { clock += dt; storySync(); });
}
