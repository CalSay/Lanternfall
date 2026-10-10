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
// - when a pack file fails, asks the server for the page: if the page no longer names that file (a new deploy took the old
//   hashed files away), the game saves and reloads once the zone on screen needs it; otherwise it tries again later.
//   artZonePacks(z) -> the pack ids zone z shows ([] in the inline page)
//   artZoneReady(z) -> bool: every pack zone z shows has arrived
var artZoneReady = () => true, artZonePacks = () => [];
{
  const LB = typeof lfBoot === 'object' && lfBoot && lfBoot.packs && typeof lfBoot.take === 'function' ? lfBoot : null;
  if (LB && typeof document !== 'undefined') {
    const P = LB.packs, ready = {}, failed = {}, stale = {}, busy = {};
    const RELOAD_KEY = 'lanternfall.artReloadAt';
    // the build's table (zones 1 to LB.road); past the road, the same two functions the build asked (59l, 22)
    const live = z => { const f = ZONE_FOES[z], t = zoneTheme(z); return [f && 'foe:' + f.key, 'bg:' + t].filter(id => id && P[id]); };
    artZonePacks = z => (z > LB.road ? live(z) : Object.keys(P).filter(id => P[id].z.some(r => z >= r[0] && z <= r[1])));
    artZoneReady = z => artZonePacks(z).every(id => ready[id]);
    // o[k] holds basE91 text; it reads back as base64, decoded on the first read (21zz's getter, for a field that came late)
    const lazy = (o, k) => {
      const s = o[k]; if (typeof s !== 'string') return;
      Object.defineProperty(o, k, { enumerable: true, configurable: true,
        get() { const v = b91Base64(s); Object.defineProperty(o, k, { value: v, enumerable: true, configurable: true, writable: true }); return v; },
        set(v) { Object.defineProperty(o, k, { value: v, enumerable: true, configurable: true, writable: true }); } });
    };
    const put = (id, data) => {
      if (ready[id] || !P[id] || !data) return;
      const i = id.indexOf(':'), kind = id.slice(0, i), key = id.slice(i + 1);
      if (kind === 'foe') {
        const F = typeof FOE_ART === 'object' && FOE_ART[key]; if (!F) return;
        for (const p of Object.keys(data.atlases || {})) { F.atlases[p] = data.atlases[p]; lazy(F.atlases, p); }
      } else if (kind === 'bg' && typeof BG_ART === 'object') {
        for (const o of ['land', 'port']) if (data[o]) lazy(data[o], 'src');
        BG_ART[key] = data;
      } else return;
      ready[id] = true; delete failed[id]; delete stale[id];
      emit('artPack', { id, kind, key });
    };
    LB.take(put);

    const deep = () => typeof deepActive === 'function' && deepActive();
    const screenZone = () => (target() === 'mob' && !deep() ? S.zone : 0);   // only a fight on the road draws a zone's art
    // 90-boot asks every frame, before it draws: a zone change that emits nothing (a retreat after a wipe) is covered in time
    let coverKey = '';
    const held = () => { const z = screenZone(), h = z >= 1 && !artZoneReady(z); if (coverKey !== z + ':' + h) cover(); return h; };
    holdGame(held);

    // ---- loading ----
    const wanted = () => {
      const z = Math.max(1, S.zone | 0), a0 = zoneAreaIdx(z) * AREA_ZONES + 1, zs = [z, z + 1, z - 1];
      for (let q = a0; q < a0 + 2 * AREA_ZONES; q++) zs.push(q);
      const out = [];
      for (const q of zs) if (q >= 1) for (const id of artZonePacks(q)) if (!out.includes(id)) out.push(id);
      return out;
    };
    const due = id => !ready[id] && !busy[id] && !(failed[id] && failed[id].at > Date.now());
    function pump() {
      const now = screenZone() >= 1 ? artZonePacks(screenZone()) : [], n = Object.keys(busy).length;
      const id = (n < 2 ? now.find(due) : null) || (n < 1 ? wanted().find(due) : null);
      if (!id) return;
      busy[id] = true;
      const s = document.createElement('script');
      const end = ok => { s.remove(); delete busy[id]; if (!ok || !ready[id]) gone(id); pump(); };
      s.onload = () => end(true); s.onerror = () => end(false);
      s.src = P[id].f;
      document.body.appendChild(s);
      pump();   // a second file for the zone on screen, if it needs one
    }
    // A failed file: wait a little longer each time. A new deploy names other files, so ask the server for the page.
    function gone(id) {
      const f = failed[id] = failed[id] || { n: 0 }; f.n++; f.at = Date.now() + Math.min(30, 2 ** f.n) * 1000;
      if (typeof fetch !== 'function') return;
      fetch(location.href, { cache: 'no-store' }).then(r => (r.ok ? r.text() : null))
        .then(t => { if (t && !t.includes(P[id].f)) { stale[id] = true; cover(); } }, () => {});
    }
    let reloading = false;
    function reload() {
      let last = 0;
      try { last = +sessionStorage.getItem(RELOAD_KEY) || 0; } catch (e) {}
      if (Date.now() - last < 60000) return false;   // reloaded a minute ago: never loop; the line asks the player instead
      try { sessionStorage.setItem(RELOAD_KEY, String(Date.now())); } catch (e) {}
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
      const ids = artZonePacks(z).filter(id => !ready[id]);
      let t = `Loading ${zoneAreaName(z)}`, ask = false;
      if (reloading || (ids.some(id => stale[id]) && reload())) t = 'The game was updated. Reloading.';
      else if (ids.some(id => stale[id])) { t = 'The game was updated. Reload the page to go on.'; ask = true; }
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
