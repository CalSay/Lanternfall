// 55-story: the story core (task LORE3; docs/design/lore.md 9 and 10). Which arrival line, story
// beat and elder line is due, once per save. CORE FILE: no DOM. UI: 75-story-ui.js.
// Words: 21h-lore-hollow.js (the Hollow, bestiary, elders) and 21b-stories-coast.js (the Coast).
//
// What plays, and when (all once per save):
//   Arrival line  the first time the party FIGHTS in a place (a region's place 0-6, and its boss
//                 zone): HOLLOW_ARRIVAL / HOLLOW_ARRIVAL_BOSS. Coast lines join once the coast
//                 has its own data (REGIONS[1].plugged, task R2-1).
//   Story beat    a beat with `at` plays when the party first fights at that zone. A beat without
//                 `at` (the coast's) plays when its system calls storyBeat(id). A beat the save got
//                 past without standing there (it jumped) plays quiet: its one-line note.
//   Elder line    the first time a boss of a type appears (intro) and its first kill (fall). The
//                 Hollow's zone 35 boss is the Fenmother (lore.md 4.4), with its own lines.
//   Great Lantern the card is 55-lantern's; this file only files its beat (COAST_STORY[beat]) in
//                 the story list so it can be read again, and gives the card its `say` lines.
// Old saves (S.story new to them): everything already behind them (zones below S.maxZone) is marked
// seen, quietly, at the first load. Beats behind them go in the list unread, where the Codex offers
// them as one "Catch up on the story" entry. Nothing pops.
//
// API (the Coast tasks use storyBeat rather than a second system):
//   storyBeat(id, { quiet }) -> 'card' | 'quiet' | false
//        plays beat `id` once: emits storyBeat { id, beat, quiet }. false when it already played or
//        the id is unknown. quiet: true for a save already past the moment (the UI shows its note).
//   storyBeatDef(id) -> { id, region, at, title, text, note, head, say } | null
//   storyHas(id) -> bool (the beat has played, card or quiet)
//   storyList() -> [{ id, region, at, title, text, note, got, read, late }]
//        every beat this save has, in story order. late: filed by the old-save catch-up.
//   storyRead(id) -> marks it read (emits storyRead { id }); storyUnread() -> [ids], storyLate() -> [ids]
//   storyElderKey(zone) -> LORE_ELDERS key for that zone's boss ('listener' at zone 35) | null
//   storyBestiary(typeKey, { foe, elder, champ }) -> [lines] the Codex tile shows (57c-codex)
//   storySync() runs on each tick (cheap when nothing moved) and on zoneClear.
// Events emitted: storyArrival { key, zone, region, head, line }, storyBeat { id, beat, quiet },
//   storyElder { key, kind: 'intro' | 'fall', name, line, zone }, storyRead { id }.
// Listens: spawn (elder intro; the region boss's display name), kill (elder fall), zoneClear,
//   greatLantern (files the chapter's Great Lantern beat).
//
// Save: registerState('story', { v: 1, seen: {}, read: {}, init: 0 }).
//   seen: 'a:<region>:<place>' | 'a:<region>:boss' (arrival), 'b:<beatId>' (ms it played; negative =
//   filed by the catch-up), 'ei:<elderKey>' / 'ef:<elderKey>' (elder intro / fall). read: beatId -> 1.
//   init: 1 once the first-load catch-up ran.

let storyBeat, storyBeatDef, storyHas, storyList, storyRead, storyUnread, storyLate, storyElderKey, storyBestiary, storySync;
{
  registerState('story', { v: 1, seen: {}, read: {}, init: 0 });
  const ST = () => S.story;
  const H = () => (typeof HOLLOW_STORY !== 'undefined' ? HOLLOW_STORY : []);
  const C = () => (typeof COAST_STORY !== 'undefined' ? COAST_STORY : []);

  // Every beat, in story order: the Hollow's, then the Coast's (its Great Lantern beats included).
  let beats = null;
  const all = () => beats || (beats = [
    ...H().map(b => Object.assign({ region: 'hollow' }, b)),
    ...C().map(b => Object.assign({ region: 'coast' }, b))
  ]);
  const def = id => all().find(b => b.id === id) || null;
  storyBeatDef = def;

  // Region story data: arrival lines per place, the boss arrival. Coast only once it has its own foes.
  const regionText = r => {
    if (r.id === 'hollow') return { arr: typeof HOLLOW_ARRIVAL !== 'undefined' ? HOLLOW_ARRIVAL : null, boss: typeof HOLLOW_ARRIVAL_BOSS !== 'undefined' ? HOLLOW_ARRIVAL_BOSS : '' };
    if (r.id === 'coast' && r.plugged) return { arr: typeof COAST_ARRIVAL !== 'undefined' ? COAST_ARRIVAL : null, boss: typeof COAST_ARRIVAL_BOSS !== 'undefined' ? COAST_ARRIVAL_BOSS : '' };
    return null;
  };
  // The arrival key and line for zone z, or null (no line for that zone: not a place's first zone).
  const arrivalOf = z => {
    const r = regionOf(z); if (!r || z > r.z1) return null;
    const tx = regionText(r); if (!tx || !tx.arr) return null;
    if (z === r.z1) return tx.boss ? { key: `a:${r.id}:boss`, region: r.id, line: tx.boss } : null;
    const p = z - r.z0; if (p < 0 || p > 6) return null;           // first entry of each place: the first cycle
    return tx.arr[p] ? { key: `a:${r.id}:${p}`, region: r.id, line: tx.arr[p] } : null;
  };
  // "Mossy Hollow. Home is dark behind you." -> head "Mossy Hollow", line "Home is dark behind you."
  const split = s => { const i = s.indexOf('. '); return i > 0 && i < 32 ? [s.slice(0, i), s.slice(i + 2)] : ['', s]; };

  storyElderKey = z => {
    if (!(z >= 1) || typeof LORE_ELDERS === 'undefined') return null;
    const r = regionOf(z);
    if (r.id === 'hollow' && z === r.z1) return LORE_ELDERS.listener ? 'listener' : null;
    if (z === r.z1) return null;                                     // other region bosses have their own lines (the Fogbound: 21b)
    const t = TYPES[zoneType(z)];
    return t && LORE_ELDERS[t.key] ? t.key : null;
  };

  storyBestiary = (key, got) => {
    const b = typeof LORE_BESTIARY !== 'undefined' && LORE_BESTIARY[key];
    if (!b) return [];
    const out = [];
    if (got.foe) out.push(b.foe);
    if (got.elder) out.push(b.elder);
    if (got.champ) out.push(b.champ);
    if (got.listener && typeof LORE_ELDERS !== 'undefined' && LORE_ELDERS.listener && LORE_ELDERS.listener.line) out.push(LORE_ELDERS.listener.line);
    return out;
  };

  // ---- the beats ----
  const seenAt = id => ST().seen['b:' + id];
  storyHas = id => !!seenAt(id);
  storyBeat = (id, opts) => {
    const b = def(id);
    if (!b || storyHas(id)) return false;
    const quiet = !!(opts && opts.quiet);
    ST().seen['b:' + id] = Date.now();
    emit('storyBeat', { id, beat: b, quiet });
    return quiet ? 'quiet' : 'card';
  };
  storyRead = id => {
    if (!def(id) || ST().read[id]) return;
    ST().read[id] = 1;
    emit('storyRead', { id });
  };
  storyList = () => all().filter(b => storyHas(b.id)).map(b => ({
    id: b.id, region: b.region, at: b.at || 0, title: b.title, text: b.text, note: b.note, head: b.head || '',
    got: Math.abs(seenAt(b.id)), read: !!ST().read[b.id], late: seenAt(b.id) < 0
  }));
  storyUnread = () => all().filter(b => storyHas(b.id) && !ST().read[b.id]).map(b => b.id);
  storyLate = () => all().filter(b => seenAt(b.id) < 0 && !ST().read[b.id]).map(b => b.id);

  // ---- the first load: file what an old save already passed, quietly ----
  function catchUp() {
    const st = ST(); st.init = 1;
    const mz = S.maxZone || 1, now = Date.now();
    for (let z = 1; z < mz; z++) {
      const a = arrivalOf(z); if (a) st.seen[a.key] = 1;
      const k = storyElderKey(z); if (k) { st.seen['ei:' + k] = 1; st.seen['ef:' + k] = 1; }
    }
    for (const b of all()) if (b.at && b.at < mz && !st.seen['b:' + b.id]) st.seen['b:' + b.id] = -now;
    // Great Lanterns already lit: their beats go in the list too (the card or its bell line was shown).
    if (typeof REGIONS !== 'undefined') for (const r of REGIONS) {
      const b = C()[r.beat];
      if (b && mz > r.z1 && !st.seen['b:' + b.id]) st.seen['b:' + b.id] = -now;
    }
  }
  const ready = () => { if (!ST().init) catchUp(); };

  // ---- each tick: arrival and beats for where the party stands ----
  let last = '';
  storySync = () => {
    ready();
    const z = S.zone || 1, mz = S.maxZone || 1, fighting = S.activity === 'fight' && !(typeof arena !== 'undefined' && arena);
    const sig = z + '|' + mz + '|' + (fighting ? 1 : 0);
    if (sig === last) return;
    last = sig;
    const st = ST();
    if (fighting) {
      const a = arrivalOf(z);
      if (a && !st.seen[a.key]) {
        st.seen[a.key] = 1;
        const [head, line] = split(a.line);
        emit('storyArrival', { key: a.key, zone: z, region: a.region, head: head || zoneName(z), line });
      }
    }
    for (const b of all()) {
      if (!b.at || storyHas(b.id)) continue;
      if (fighting && z === b.at) storyBeat(b.id);
      else if (mz > b.at) storyBeat(b.id, { quiet: true });   // got past it without standing there
    }
  };
  on('zoneClear', () => { last = ''; storySync(); });
  onTick(() => storySync());

  // ---- elders ----
  on('spawn', ({ mob, zone }) => {
    if (!mob || !mob.boss || (typeof arena !== 'undefined' && arena)) return;
    ready();
    // the region boss's display name (REGIONS[i].boss.name; the Hollow: "The Fenmother")
    const r = regionOf(zone);
    if (zone === r.z1 && r.boss && r.boss.name) mob.name = r.boss.name;
    const k = storyElderKey(zone); if (!k) return;
    const st = ST();
    if (st.seen['ei:' + k]) return;
    st.seen['ei:' + k] = 1;
    const e = LORE_ELDERS[k];
    emit('storyElder', { key: k, kind: 'intro', name: mob.name || e.name, line: e.intro, zone });
  });
  on('kill', ({ mob, zone }) => {
    if (!mob || !mob.boss) return;
    ready();
    const k = storyElderKey(zone); if (!k) return;
    const st = ST();
    if (st.seen['ef:' + k]) return;
    st.seen['ef:' + k] = 1; st.seen['ei:' + k] = 1;
    const e = LORE_ELDERS[k];
    emit('storyElder', { key: k, kind: 'fall', name: mob.name || e.name, line: e.fall, zone });
  });

  // ---- the Great Lantern: its beat joins the story list (the card itself is 55-lantern's) ----
  on('greatLantern', e => {
    const r = regionById(e.region), b = r && C()[r.beat];
    if (!b || storyHas(b.id)) return;
    ready();
    ST().seen['b:' + b.id] = e.quiet ? -Date.now() : Date.now();
    if (!e.quiet) ST().read[b.id] = 1;   // the card was the reading
  });
}
