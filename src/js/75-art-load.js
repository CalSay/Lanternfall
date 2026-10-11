// 75-art-load: the split build's area art, loaded one area ahead (card art-loader; docs/design/hosting.md 5, B2). Browser-only.
// Nothing here runs in the inline page (no lfBoot). What it does and its calls: docs/design/hosting/art-load.md.
var artZoneReady = () => true, artZonePacks = () => [], artHeroNeed = () => true, artHeroReady = () => true, artHeroWait = () => {}, artHeroPacks = () => [], artHeroWant = () => {}, artNsWant = () => {}, artHoldTick = () => {}, artBgImg = () => null;
{
  const LB = typeof lfBoot === 'object' && lfBoot && lfBoot.packs && typeof lfBoot.take === 'function' ? lfBoot : null;
  if (LB && typeof document !== 'undefined') {
    const P = LB.packs, got = {}, ready = {}, failed = {}, stale = {}, broken = {}, busy = {}, imgs = {};
    let booted = false;
    const RELOAD_KEY = 'lanternfall.artReloadAt';
    // the build's table (zones 1 to LB.road); past the road the scenery repeats every 35 zones (check.mjs holds it), as in the loader
    const tableZone = z => (z > LB.road ? LB.road - 34 + (z - LB.road - 1) % 35 : z);
    const inZone = (id, q) => P[id].z.some(r => q >= r[0] && q <= r[1]);
    let lastO = LB.boot.map(id => P[id].o).find(Boolean) || 'land';   // a hidden stage keeps the last shape seen
    const shape = () => { const e = document.getElementById('stage'); if (e && e.clientWidth) lastO = e.clientWidth < e.clientHeight ? 'port' : 'land'; return lastO; };
    // the boot loader's next guess: the stage's shape by the window's (a phone's tab sheet can make an upright stage wide)
    const keepShape = () => { try { const e = document.getElementById('stage'), k = 'lanternfall.bgShape', v = JSON.parse(localStorage.getItem(k)) || {}, w = innerWidth >= innerHeight * 1.35 ? 1 : 0;
      if (e && e.clientWidth && v[w] !== shape()) { v[w] = shape(); localStorage.setItem(k, JSON.stringify(v)); } } catch (e) {} };
    artZonePacks = z => { const q = tableZone(z), o = shape(); return Object.keys(P).filter(id => !P[id].n && inZone(id, q) && (!P[id].o || P[id].o === o)); };
    artBgImg = k => imgs[k] || null;
    const nsPacks = z => { const q = tableZone(z); return classicOn() ? [] : Object.keys(P).filter(id => P[id].n && inZone(id, q)); };
    // A pack that came after boot is ready once its pictures have decoded, so the first frame after the hold draws them (the
    // packs the boot loader wrote come in before the game runs and are used as the inline page uses its art)
    const framesDone = key => {
      const F = typeof foeArtFrames === 'function' && foeArtFrames(key); if (!F) return true;
      const pend = x => !!(x && x.c && x.c._pend);
      for (const A of Object.values(F.acts)) for (const f of A.fr) if (pend(f.body) || pend(f.atk) || pend(f.hit)) return false;
      for (const X of Object.values(F.fx || {})) for (const f of X.fr) if (pend(f)) return false;
      return true;
    };
    const isReady = id => ready[id] || (got[id] && id.startsWith('foe:') && framesDone(id.slice(4)) && (ready[id] = true));
    artZoneReady = z => artZonePacks(z).every(isReady);
    // ---- hero packs ----
    const waits = [], need = {};   // need: 'hero move' -> [hero, move, when it was last asked for] while the stage waits for it
    artHeroPacks = (hero, move) => Object.keys(P).filter(id => P[id].h === hero && (!move || P[id].m.includes(move)));
    artHeroWait = fn => { if (typeof fn === 'function') waits.push(fn); };
    // a hero file the Classic art switch turns off (x in the table: Wren's route S, route-s-wren-wire) loads only when asked while it is on
    const classicOn = () => typeof portraitsClassic === 'function' && portraitsClassic();
    const soon = [];   // packs asked for with artHeroWant or artNsWant, loaded after the ones the stage holds for
    // (a new-style ask that queues nothing starts nothing: it must not take the slot a hero move needs)
    const ask = (ids, quiet) => { const n = soon.length; for (const id of ids) if (P[id] && !got[id] && !soon.includes(id)) soon.push(id); if (!quiet || soon.length > n) pump(); };
    artHeroWant = (hero, move) => ask(artHeroPacks(hero, move));
    artNsWant = ps => { if (!classicOn()) ask((ps || []).map(p => 'ns:' + p.replace(':', '.')), true); };
    artHeroReady = (hero, move) => artHeroPacks(hero, move).every(id => got[id]) && waits.every(f => { try { return f(hero, move) !== false; } catch (e) { return true; } });
    artHeroNeed = (hero, move) => {
      if (artHeroReady(hero, move)) return true;
      const k = hero + ' ' + move, first = !need[k];
      need[k] = [hero, move, Date.now()];
      if (first) { queueMicrotask(recheck); setTimeout(pump, 0); }   // the cover goes up before this frame paints
      return false;
    };
    const heroWaiting = () => {
      for (const k in need) if (Date.now() - need[k][2] > 500 || artHeroReady(need[k][0], need[k][1])) delete need[k];
      return Object.keys(need).length > 0;
    };
    const heroNow = () => { const out = []; for (const k in need) for (const id of artHeroPacks(need[k][0], need[k][1])) if (!out.includes(id)) out.push(id); return out; };
    const heroName = h => (typeof ROSTER === 'object' && ROSTER[h] && ROSTER[h].name ? ROSTER[h].name.split(' ')[0] : 'your hero');
    // o[k] holds basE91 text; it reads back as base64, decoded on the first read (21zz's getter, for a field that came late)
    const lazy = (o, k) => {
      const s = o[k]; if (typeof s !== 'string') return;
      Object.defineProperty(o, k, { enumerable: true, configurable: true,
        get() { const v = b91Base64(s); Object.defineProperty(o, k, { value: v, enumerable: true, configurable: true, writable: true }); return v; },
        set(v) { Object.defineProperty(o, k, { value: v, enumerable: true, configurable: true, writable: true }); } });
    };
    const put = (id, data) => {
      if (got[id] || !P[id] || !data) return;
      const i = id.indexOf(':'), kind = id.slice(0, i), key = id.slice(i + 1), late = booted;
      const done = more => { got[id] = true; if (!late || kind !== 'foe') ready[id] = true; delete failed[id]; delete stale[id]; emit('artPack', Object.assign({ id, kind, key }, more)); };
      if (kind === 'hero') {
        if (typeof LB.putHero !== 'function' || !LB.putHero(id, data)) return;
        done({ hero: P[id].h, moves: Object.keys(data) });
      } else if (kind === 'foe') {
        const F = typeof FOE_ART === 'object' && FOE_ART[key]; if (!F) return;
        for (const p of Object.keys(data.atlases || {})) { F.atlases[p] = data.atlases[p]; lazy(F.atlases, p); }
        done();   // 64j cuts the frames as each atlas loads; isReady waits for them
      } else if (kind === 'ns' && typeof NS_ART === 'object') {   // basE91 pictures (64m decodes them)
        const i = key.indexOf('.'), G = NS_ART[key.slice(0, i)], e = G && G[key.slice(i + 1)]; if (!e) return;
        e.img = Object.assign(e.img || {}, data.img); done();
      } else if (kind === 'bg' && typeof BG_ART === 'object') {   // key '<theme>:<shape>'
        const [th, o] = key.split(':'), E = data[o]; if (!E) return;
        lazy(E, 'src');
        const add = () => { (BG_ART[th] = BG_ART[th] || {})[o] = E; done(); };
        if (!late) return add();
        // decoded before the hold lifts; 62-stage draws this image (artBgImg)
        got[id] = 'decoding';
        const im = imgs[th + o] = new Image(); im.src = 'data:image/webp;base64,' + E.src;
        im.decode().then(add, () => { broken[id] = true; cover(); });   // a picture that will not decode: a new download would not help
      }
    };
    LB.take(put);
    booted = true;

    // ---- the queue's hero moves (card hero-queue) ----
    const FIRST = ['attack', 'hit', 'parry', 'dodge'], OPENING = FIRST.slice(0, 2);
    const shows = id => !(P[id].x && classicOn());   // a file the Classic art switch turns off waits until asked for
    const moveOf = (hero, ab) => { try { return typeof heroArtMove === 'function' ? heroArtMove(hero, ab) || ab : ab; } catch (e) { return ab; } };
    const movePacks = (hero, moves) => moves.flatMap(m => (m ? artHeroPacks(hero, m) : [])).filter(shows);
    // the hero's three slots, read only (S.solo.eq, as 59j soloEquipped keeps it; not the accessor, which tidies the row as it reads):
    // a stale id only asks for a move early, or for nothing
    const slots = h => { const r = S.solo && S.solo.eq && S.solo.eq[h], d = typeof SOLO_HEROES === 'object' && SOLO_HEROES[h] && SOLO_HEROES[h].eq; return Array.isArray(r) ? r : Array.isArray(d) ? d : []; };
    // the first hour's moves: with a hero, its Attack, Hit, Parry, Dodge and slots; with none yet, every hero's Attack and Hit
    const firstMoves = h => h ? movePacks(h, FIRST.concat(slots(h).filter(ab => typeof ab === 'string').map(ab => moveOf(h, ab))))
      : [...new Set(Object.keys(P).map(id => P[id].h).filter(Boolean))].flatMap(x => movePacks(x, OPENING));
    const wantAbility = p => { if (p && p.hero && p.id && p.hero === soloHero()) ask(movePacks(p.hero, [moveOf(p.hero, p.id)])); };
    on('soloEquip', wantAbility);
    on('abilityLearned', wantAbility);
    on('soloHero', () => pump());

    const deep = () => typeof deepActive === 'function' && deepActive();
    const screenZone = () => (target() === 'mob' && !deep() ? S.zone : 0);   // only a fight on the road draws a zone's art
    // 90-boot asks every frame, before tick and draw. A zone change inside tick that emits nothing (a retreat after a wipe) is
    // caught by the microtask, which runs after that frame's draw and before the browser paints it: the cover is up in time.
    // A move the stage asked for (artHeroNeed) holds the game too, wherever the stage is.
    let coverKey = '';
    const key = () => { const z = screenZone(); return z + ':' + (z >= 1 && !artZoneReady(z)) + ':' + heroWaiting(); };
    function recheck() { if (coverKey !== key()) cover(); }
    // gathering under the line runs on (load-hold-progress); a fight, and the raid (the online layer: unchanged), hold
    const runs = () => target() === 'node';
    const held = () => { const k = key(); if (coverKey !== k) cover(); queueMicrotask(recheck); return !k.endsWith(':false:false') && !runs(); };
    addEventListener('online', () => { for (const id in failed) failed[id].at = 0; pump(); });   // back online: try again now
    addEventListener('resize', () => pump());   // a turn may want a background's other shape
    holdGame(held);
    // a held fight or raid: the orders, tonics and Rested keep the frame clock, unless another hold (a story scene, a card) stops the game as the inline page does
    const others = () => GAME_HOLDS.some(f => { if (f === held) return false; try { return !!f(); } catch (e) { return false; } });
    artHoldTick = dt => { if (held() && !others()) for (const f of [refineTick, tonicBurn, restTick]) f(dt); };   // the Forge, tonic time and Rested keep wall time (hold-tonic-rested-clock)

    // ---- loading ----
    const wanted = () => {
      const z = Math.max(1, S.zone | 0), a0 = zoneAreaIdx(z) * AREA_ZONES + 1, near = [z, z + 1, z - 1], area = [];
      for (let q = a0; q < a0 + 2 * AREA_ZONES; q++) area.push(q);
      // the save's hero's core (with no hero yet, every hero's core), its first hour's moves (firstMoves), the zones either side,
      // then the hero's other moves (table order), then the rest of the area and the next one
      const h = typeof soloHero === 'function' ? soloHero() : null, mine = Object.keys(P).filter(id => P[id].h && (h ? P[id].h === h : P[id].c) && shows(id));
      const out = mine.filter(id => P[id].c), add = ids => { for (const id of ids) if (!out.includes(id)) out.push(id); };
      add(firstMoves(h));
      add(soon.filter(id => P[id].n));   // what the new-style screens asked for (artNsWant): below the first fights' moves, never urgent
      for (const q of near) if (q >= 1) add(artZonePacks(q));
      add(mine);
      for (const q of near) if (q >= 1) add(nsPacks(q));
      for (const q of area) { add(artZonePacks(q)); add(nsPacks(q)); }
      return out;
    };
    const due = id => !got[id] && !busy[id] && !stale[id] && !broken[id] && !(failed[id] && failed[id].at > Date.now());   // a stale file is gone for good
    // What the stage waits for (and the zone on screen, and artHeroWant; not artNsWant, which wanted() queues) goes first, in its
    // order, while fewer than four files load: the queue never takes the last slot, and nothing from the queue starts while one of
    // these waits. Then the queue (wanted), in its order: a hero file while fewer than three load and no other pack does, any
    // other pack only alone.
    const small = id => !!P[id].h;
    function pump() {
      const now = heroNow().concat(screenZone() >= 1 ? artZonePacks(screenZone()) : [], soon.filter(id => !P[id].n)), n = Object.keys(busy).length;
      let id = now.find(due);
      if (id) { if (n >= 4) return; }
      else { id = wanted().find(due); if (!id || !(small(id) ? n < 3 && Object.keys(busy).every(small) : n < 1)) return; }
      busy[id] = true;
      const s = document.createElement('script');
      const end = ok => { s.remove(); delete busy[id]; if (!ok || !got[id]) gone(id); pump(); };
      s.onload = () => end(true); s.onerror = () => end(false);
      s.src = P[id].f;
      document.body.appendChild(s);
      pump();   // another file, if one may go now
    }
    // A failed file: wait a little longer each time. A new deploy names other files, so ask the server for the page: at most
    // once every two minutes for all packs together (the page is about 1 MB on the wire), and every failed pack it no longer
    // names is stale (never fetched again; the zone that needs one reloads the page).
    let askedAt = -Infinity;
    function gone(id) {
      const f = failed[id] = failed[id] || { n: 0 }; f.n++; f.at = Date.now() + Math.min(30, 2 ** f.n) * 1000;
      if (typeof LB.page !== 'function' || Date.now() - askedAt < 120000) return;
      askedAt = Date.now();
      LB.page(t => { for (const k in failed) if (!got[k] && !t.includes(P[k].f)) stale[k] = true; cover(); });   // the boot loader asks (the game page makes no network call)
    }
    let reloading = false;
    function reload() {
      let last = 0;
      // reloaded a minute ago, or no session storage to tell: never loop; the line asks the player instead
      try { last = +sessionStorage.getItem(RELOAD_KEY) || 0; if (Date.now() - last < 60000) return false; sessionStorage.setItem(RELOAD_KEY, String(Date.now())); } catch (e) { return false; }
      reloading = true;
      try { bootAwayNow(); save(); } catch (e) {}   // the away gains first, as pagehide does (90-boot): a save stamps S.last
      setTimeout(() => location.reload(), 400);
      return true;
    }

    // ---- the cover over the stage, and the zone number ----
    let box = null, line = null, btn = null;
    function cover() {
      const z = screenZone(), zw = z >= 1 && !artZoneReady(z), hw = heroWaiting(), on = zw || hw;
      coverKey = z + ':' + zw + ':' + hw;
      const stage = document.getElementById('stage');
      if (!on) { if (box) box.hidden = true; return; }
      if (!box && stage) {
        box = document.createElement('div'); box.id = 'artWait'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite');
        box.style.cssText = 'position:absolute;inset:0;z-index:6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:16px;background:#0B0810;color:var(--bone,#EFE6D6);font:600 16px/1.4 var(--body,sans-serif);text-align:center';
        line = document.createElement('span'); box.append(line);
        btn = document.createElement('button'); btn.type = 'button'; btn.textContent = 'Reload'; btn.hidden = true;
        btn.style.cssText = 'padding:8px 16px;border:1px solid var(--line-hi,#4E4060);border-radius:6px;background:var(--panel,#1F1827);color:inherit;font:inherit';
        btn.onclick = () => { try { bootAwayNow(); save(); } catch (e) {} location.reload(); };
        box.append(btn); stage.append(box);
        for (const ev of ['pointerdown', 'pointerup', 'mousedown', 'touchstart', 'click']) box.addEventListener(ev, e => e.stopPropagation());   // no strikes through it
      }
      if (!box) return;
      const ids = (zw ? artZonePacks(z) : []).concat(heroNow()).filter(id => !isReady(id));
      const what = zw ? zoneAreaName(z) : heroName(P[ids[0]] ? P[ids[0]].h : Object.values(need)[0][0]);
      let t = `Loading ${what}`, ask = false;
      if (reloading || (ids.some(id => stale[id]) && reload())) t = 'The game was updated. Reloading.';
      else if (ids.some(id => stale[id])) { t = 'The game was updated. Reload the page to go on.'; ask = true; }
      else if (ids.some(id => broken[id])) { t = `${what} did not load. Reload the page to go on.`; ask = true; }
      else if (ids.some(id => failed[id])) t = `Waiting for the connection to load ${what}`;
      box.hidden = false;
      if (line.textContent !== t) line.textContent = t;
      btn.hidden = !ask;
    }
    uiHooks.push(() => {
      cover();
      const z = screenZone(), el = document.getElementById('zNum');
      if (el && z >= 1 && !artZoneReady(z)) putText(el, `Zone ${z} · loading`);   // 70-ui wrote "Zone N" just before
    });
    on('artPack', () => { cover(); pump(); });
    on('sceneReset', () => { cover(); pump(); });
    setInterval(() => { pump(); keepShape(); }, 1000);
    pump();
  }
}
