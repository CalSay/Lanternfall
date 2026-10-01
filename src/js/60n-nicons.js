// 60n-nicons: native-size icon images from the approved C26 packs (ACTION_ICONS 21s, NAV_ICONS 21t).
// Each pack has every icon at a few native sizes. An element given an icon shows the size that matches how big the
// CSS draws it (exact, else the largest that fits), and swaps when that size changes (layout, landscape, a hidden
// element shown). So pixels stay whole: no 48 px image squeezed into 36 px.
//   nicHas(pack, id) -> bool                       pack: 'act' | 'nav'
//   nicURL(pack, id, px) -> data URL | ''          the native image for a box px wide
//   nicSet(el, pack, id, px) -> bool               show it on an <img> or <canvas> (px: the size to use while el has
//                                                  no layout yet); false = no such icon (keep the old art)
var nicHas, nicURL, nicSet;
{
  const packs = () => ({ act: typeof ACTION_ICONS === 'object' ? ACTION_ICONS : null, nav: typeof NAV_ICONS === 'object' ? NAV_ICONS : null });
  const sizesOf = new Map();
  nicHas = (pack, id) => { const p = packs()[pack]; return !!(p && id && p[id]); };
  nicURL = (pack, id, px) => {
    const p = packs()[pack], set = p && p[id]; if (!set) return '';
    let ks = sizesOf.get(set); if (!ks) { ks = Object.keys(set).map(Number).sort((a, b) => a - b); sizesOf.set(set, ks); }
    let k = ks[0]; for (const n of ks) if (n <= px) k = n;
    return set[k];
  };
  const imgs = new Map();   // data URL -> decoded Image (for canvases)
  const imgFor = (u, then) => { let im = imgs.get(u); if (!im) { im = new Image(); im.src = u; imgs.set(u, im); } if (im.complete && im.naturalWidth) then(im); else im.addEventListener('load', () => then(im), { once: true }); };
  const boxOf = e => { const r = e.getBoundingClientRect ? e.getBoundingClientRect() : null; return r && r.width ? Math.round(r.width) : 0; };
  function fit(e) {
    if (!e._nic) return;
    const { pack, id, px } = e._nic, u = nicURL(pack, id, boxOf(e) || px); if (!u || e._nicU === u) return;
    e._nicU = u;
    if (e.tagName === 'CANVAS') imgFor(u, im => {
      if (e._nicU !== u) return;
      if (e.width !== im.naturalWidth) { e.width = im.naturalWidth; e.height = im.naturalHeight; }
      const g = e.getContext('2d'); g.clearRect(0, 0, e.width, e.height); g.imageSmoothingEnabled = false; g.drawImage(im, 0, 0);
    });
    else e.src = u;
  }
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(es => { for (const en of es) fit(en.target); }) : null;
  nicSet = (e, pack, id, px) => {
    if (!e || !nicHas(pack, id)) { if (e && e._nic) { e._nic = null; e._nicU = ''; if (ro) ro.unobserve(e); } return false; }
    const same = e._nic && e._nic.pack === pack && e._nic.id === id;
    e._nic = { pack, id, px: px || 24 };
    if (!same) e._nicU = '';
    if (ro && !same) ro.observe(e);
    fit(e);
    return true;
  };
}
