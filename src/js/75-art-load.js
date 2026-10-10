// 75-art-load: the split build's area art, loaded one area ahead (card art-loader; docs/design/hosting.md 5, B2). Browser-only.
// The inline page (the Artifact, and every tool's default) has no boot loader (no lfBoot): every pack is in the page, nothing
// here runs, and artZoneReady is always true.
// In the split build (node tools/build.mjs --split) each foe's atlases and each battle background come in a pack file of their
// own. The boot loader (src/boot-loader.html) wrote the tags of the save's zone's packs before the game ran; lfBoot.take hands
// those over here, then every later pack as it arrives. This file:
// - puts a pack's data in FOE_ART (the foe's atlases; its timings are in the page) or BG_ART (the whole background), each image
//   a basE91 getter as 21zz makes them, then emits 'artPack' { id, kind, key } (64j cuts that foe's frames).
// - loads the packs the zone on screen shows first, then those of the zones either side, the rest of its area and the next
//   area: one file at a time, and one more at once for the zone on screen.
// - holds the game (holdGame) while the zone on screen lacks a pack: a plain line covers the stage and the zone number reads
//   "loading". A pack still loading is never drawn as a stand-in (art freeze).
// - when a pack file fails, asks the server for the page (through lfBoot.page: the game's own code makes no network call): if the page no longer names that file (a new deploy took the old
//   hashed files away), the game saves and reloads once the zone on screen needs it; otherwise it tries again later.
//   artZonePacks(z) -> the pack ids zone z shows ([] in the inline page)
//   artZoneReady(z) -> bool: every pack zone z shows is in (and, for one that came after boot, its pictures have decoded)
var artZoneReady = () => true, artZonePacks = () => [];
{
  const LB = typeof lfBoot === 'object' && lfBoot && lfBoot.packs && typeof lfBoot.take === 'function' ? lfBoot : null;
  if (LB && typeof document !== 'undefined') {
    const P = LB.packs, got = {}, ready = {}, failed = {}, stale = {}, broken = {}, busy = {}, keep = [];
    let booted = false;
    const RELOAD_KEY = 'lanternfall.artReloadAt';
    // the build's table (zones 1 to LB.road); past the road the scenery repeats every 35 zones (check.mjs holds it), as in the loader
    const tableZone = z => (z > LB.road ? LB.road - 34 + (z - LB.road - 1) % 35 : z);
    artZonePacks = z => { const q = tableZone(z); return Object.keys(P).filter(id => P[id].z.some(r => q >= r[0] && q <= r[1])); };
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
      const done = () => { got[id] = true; if (!late || kind !== 'foe') ready[id] = true; delete failed[id]; delete stale[id]; emit('artPack', { id, kind, key }); };
      if (kind === 'foe') {
        const F = typeof FOE_ART === 'object' && FOE_ART[key]; if (!F) return;
        for (const p of Object.keys(data.atlases || {})) { F.atlases[p] = data.atlases[p]; lazy(F.atlases, p); }
        done();   // 64j cuts the frames as each atlas loads; isReady waits for them
      } else if (kind === 'bg' && typeof BG_ART === 'object') {
        for (const o of ['land', 'port']) if (data[o]) lazy(data[o], 'src');
        if (!late) { BG_ART[key] = data; done(); return; }
        // decode both shapes first and keep them: 62-stage's own image of the same picture is then complete at once
        got[id] = 'decoding';
        Promise.all(['land', 'port'].filter(o => data[o]).map(o => { const im = new Image(); keep.push(im); im.src = 'data:image/webp;base64,' + data[o].src; return im.decode(); }))
          .then(() => { BG_ART[key] = data; done(); }, () => { broken[id] = true; cover(); });   // a picture that will not decode: a new download would not help
      }
    };
    LB.take(put);
    booted = true;

    const deep = () => typeof deepActive === 'function' && deepActive();
    const screenZone = () => (target() === 'mob' && !deep() ? S.zone : 0);   // only a fight on the road draws a zone's art
    // 90-boot asks every frame, before tick and draw. A zone change inside tick that emits nothing (a retreat after a wipe) is
    // caught by the microtask, which runs after that frame's draw and before the browser paints it: the cover is up in time.
    let coverKey = '';
    const key = () => { const z = screenZone(); return z + ':' + (z >= 1 && !artZoneReady(z)); };
    const recheck = () => { if (coverKey !== key()) cover(); };
    const held = () => { const z = screenZone(), h = z >= 1 && !artZoneReady(z); if (coverKey !== z + ':' + h) cover(); queueMicrotask(recheck); return h; };
    addEventListener('online', () => { for (const id in failed) failed[id].at = 0; pump(); });   // back online: try again now
    holdGame(held);

    // ---- loading ----
    const wanted = () => {
      const z = Math.max(1, S.zone | 0), a0 = zoneAreaIdx(z) * AREA_ZONES + 1, zs = [z, z + 1, z - 1];
      for (let q = a0; q < a0 + 2 * AREA_ZONES; q++) zs.push(q);
      const out = [];
      for (const q of zs) if (q >= 1) for (const id of artZonePacks(q)) if (!out.includes(id)) out.push(id);
      return out;
    };
    const due = id => !got[id] && !busy[id] && !stale[id] && !broken[id] && !(failed[id] && failed[id].at > Date.now());   // a stale file is gone for good
    function pump() {
      const now = screenZone() >= 1 ? artZonePacks(screenZone()) : [], n = Object.keys(busy).length;
      const id = (n < 2 ? now.find(due) : null) || (n < 1 ? wanted().find(due) : null);
      if (!id) return;
      busy[id] = true;
      const s = document.createElement('script');
      const end = ok => { s.remove(); delete busy[id]; if (!ok || !got[id]) gone(id); pump(); };
      s.onload = () => end(true); s.onerror = () => end(false);
      s.src = P[id].f;
      document.body.appendChild(s);
      pump();   // a second file for the zone on screen, if it needs one
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
      try { save(); } catch (e) {}
      setTimeout(() => location.reload(), 400);
      return true;
    }

    // ---- the cover over the stage, and the zone number ----
    let box = null, line = null, btn = null;
    function cover() {
      const z = screenZone(), on = z >= 1 && !artZoneReady(z);
      coverKey = z + ':' + on;
      const stage = document.getElementById('stage');
      if (!on) { if (box) box.hidden = true; return; }
      if (!box && stage) {
        box = document.createElement('div'); box.id = 'artWait'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite');
        box.style.cssText = 'position:absolute;inset:0;z-index:6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:16px;background:#0B0810;color:var(--bone,#EFE6D6);font:600 16px/1.4 var(--body,sans-serif);text-align:center';
        line = document.createElement('span'); box.append(line);
        btn = document.createElement('button'); btn.type = 'button'; btn.textContent = 'Reload'; btn.hidden = true;
        btn.style.cssText = 'padding:8px 16px;border:1px solid var(--line-hi,#4E4060);border-radius:6px;background:var(--panel,#1F1827);color:inherit;font:inherit';
        btn.onclick = () => { try { save(); } catch (e) {} location.reload(); };
        box.append(btn); stage.append(box);
        for (const ev of ['pointerdown', 'pointerup', 'mousedown', 'touchstart', 'click']) box.addEventListener(ev, e => e.stopPropagation());   // no strikes through it
      }
      if (!box) return;
      const ids = artZonePacks(z).filter(id => !isReady(id));
      let t = `Loading ${zoneAreaName(z)}`, ask = false;
      if (reloading || (ids.some(id => stale[id]) && reload())) t = 'The game was updated. Reloading.';
      else if (ids.some(id => stale[id])) { t = 'The game was updated. Reload the page to go on.'; ask = true; }
      else if (ids.some(id => broken[id])) { t = `${zoneAreaName(z)} did not load. Reload the page to go on.`; ask = true; }
      else if (ids.some(id => failed[id])) t = `Waiting for the connection to load ${zoneAreaName(z)}`;
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
    setInterval(pump, 1000);
    pump();
  }
}
