// 60n-nicons: native-size icon images from the approved C26 packs (ACTION_ICONS 21s, NAV_ICONS 21t, GEAR_ICONS 21u).
// Each pack has every icon at a few native sizes. An element given an icon shows the native image that best fills
// the box its CSS gives it, never squeezed or stretched by a fraction: the largest size n x m that fits (n a native
// size, m a whole number; ties go to the larger n). An <img> draws it unscaled and centred (object-fit: none), and
// at m > 1 doubles it with a transform (pixels stay square). A <canvas> gets the native image as its backing
// store. The choice follows the box when it changes (layout, landscape, a hidden element shown).
//   nicHas(pack, id) -> bool                       pack: 'act' | 'nav' | 'gear'
//   nicURL(pack, id, px) -> data URL | ''          the largest native image that fits px
//   nicSet(el, pack, id, px) -> bool               show it on an <img> or <canvas> (px: the size to use while el has
//                                                  no layout yet); false = no such icon (keep the old art)
//   nicTag(pack, id) -> URL | ''                   a URL for code that only passes strings around (itemIcon): the
//                                                  48-ish image with '#nic:pack:id' on the end. nicPut (img, setIc in
//                                                  60-gfx / 70-ui) turns it into nicSet; anywhere else it still shows,
//                                                  smoothly scaled (10-base.css img[src*="#nic:"]).
//   nicPut(img, url) -> void                       set an img's source, honouring a nicTag
var nicHas, nicURL, nicSet, nicTag, nicPut;
{
  const packs = () => ({ act: typeof ACTION_ICONS === 'object' ? ACTION_ICONS : null, nav: typeof NAV_ICONS === 'object' ? NAV_ICONS : null,
    gear: typeof GEAR_ICONS === 'object' ? GEAR_ICONS : null });
  const sizesOf = new Map();
  const sizes = set => { let ks = sizesOf.get(set); if (!ks) { ks = Object.keys(set).map(Number).sort((a, b) => a - b); sizesOf.set(set, ks); } return ks; };
  nicHas = (pack, id) => { const p = packs()[pack]; return !!(p && id && p[id]); };
  // { n, m }: native size n drawn m times over, the largest n x m <= px (the smallest native size if none fits)
  const best = (ks, px, scale) => {
    let b = { n: ks[0], m: 1 }, r = 0;
    for (const n of ks) for (let m = 1; m <= (scale ? 4 : 1); m++) { const s = n * m; if (s <= px && (s > r || (s === r && n > b.n))) { b = { n, m }; r = s; } }
    return b;
  };
  nicURL = (pack, id, px) => { const p = packs()[pack], set = p && p[id]; return set ? set[best(sizes(set), px, false).n] : ''; };
  nicTag = (pack, id) => { const p = packs()[pack], set = p && p[id]; if (!set) return ''; const ks = sizes(set); return set[ks[ks.length - 1]] + '#nic:' + pack + ':' + id; };
  const imgs = new Map();   // data URL -> decoded Image (for canvases)
  const imgFor = (u, then) => { let im = imgs.get(u); if (!im) { im = new Image(); im.src = u; imgs.set(u, im); } if (im.complete && im.naturalWidth) then(im); else im.addEventListener('load', () => then(im), { once: true }); };
  // the layout box (offsetWidth ignores our own transform); 0 when hidden
  const boxOf = e => e.offsetWidth || (e.getBoundingClientRect ? Math.round(e.getBoundingClientRect().width) : 0) || 0;
  function fit(e) {
    if (!e._nic) return;
    const { pack, id, px } = e._nic, p = packs()[pack], set = p && p[id]; if (!set) return;
    const canvas = e.tagName === 'CANVAS', b = best(sizes(set), boxOf(e) || px, !canvas), u = set[b.n], sig = u + '|' + b.m;
    if (e._nicU === sig) return;
    e._nicU = sig;
    if (canvas) imgFor(u, im => {
      if (e._nicU !== sig) return;
      if (e.width !== im.naturalWidth) { e.width = im.naturalWidth; e.height = im.naturalHeight; }
      const g = e.getContext('2d'); g.clearRect(0, 0, e.width, e.height); g.imageSmoothingEnabled = false; g.drawImage(im, 0, 0);
    });
    else {
      e.src = u; e.style.objectFit = 'none';
      if (b.m > 1) e.style.transform = `scale(${b.m})`; else if (e.style.transform) e.style.transform = '';
    }
  }
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(es => { for (const en of es) fit(en.target); }) : null;
  const drop = e => { if (e._nic) { e._nic = null; e._nicU = ''; if (ro) ro.unobserve(e); if (e.style) { e.style.objectFit = ''; if (e.style.transform) e.style.transform = ''; } } };
  nicSet = (e, pack, id, px) => {
    if (!e || !nicHas(pack, id)) { if (e) drop(e); return false; }
    const same = e._nic && e._nic.pack === pack && e._nic.id === id;
    e._nic = { pack, id, px: px || 24 };
    if (!same) e._nicU = '';
    if (ro && !same) ro.observe(e);
    fit(e);
    return true;
  };
  nicPut = (im, url) => {
    if (im._nicReq === url) return;
    im._nicReq = url;
    const i = typeof url === 'string' ? url.indexOf('#nic:') : -1;
    if (i >= 0) { const [, pack, id] = url.slice(i + 1).split(':'); if (nicSet(im, pack, id, 28)) return; }
    drop(im);
    if (im.getAttribute('src') !== url) im.src = url;
  };
}
