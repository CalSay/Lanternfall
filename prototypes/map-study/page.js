// map-study/page.js: lays out the phone screen, the whole-map scroll and the close-up sheets for one
// style (MAP0 scratch). Query: ?style=A|B|C&view=screen|full|sheet|debug, or ?view=overview.
'use strict';
(() => {
  const Q = new URLSearchParams(location.search);
  const STY = { A: typeof STYLE_A !== 'undefined' && STYLE_A, B: typeof STYLE_B !== 'undefined' && STYLE_B, C: typeof STYLE_C !== 'undefined' && STYLE_C };
  const view = Q.get('view') || 'screen', st = STY[Q.get('style') || 'A'];
  const $ = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const app = document.getElementById('app');
  document.body.dataset.style = st ? st.key : '';

  // ---------- the hero's portrait from the real B1 kit (16 x 16 art px) ----------
  function heroPortrait() {
    try {
      const spec = { cls: 'warden', skin: 0, hair: 1, gear: { weapon: { t: 3, r: 1 }, off: { t: 3, r: 1 }, head: { t: 3, r: 1 }, body: { t: 3, r: 1 }, charm: { t: 3, r: 1 } } };
      const c = ART.portraitCanvas(spec), g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data;
      const s = new MK.Spr(c.width, c.height);
      for (let i = 0; i < c.width * c.height; i++) if (d[i * 4 + 3] > 0) s.c[i] = MK.hex(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
      return s;
    } catch (e) { console.error(e); return null; }
  }
  const PORTRAIT = heroPortrait();
  const iconCv = (rows, pal, scale) => { const s = MK.fromMap(rows, pal); return s.outlined().canvas(scale || 2); };
  const ICONPAL = { 1: '#9A97B3', 2: '#6A6478', 3: '#F2C14E', 5: '#EFE6D6', 6: '#8C6A43', 7: '#F2C14E', 4: '#3A3444' };

  // ---------- chrome: header, region chips, section header, expedition bar, tabs ----------
  function header(save) {
    const h = $('div', 'hdr');
    const pf = $('div', 'pf'); if (PORTRAIT) { const c = PORTRAIT.canvas(2); pf.append(c); } pf.append($('b', '', save.lvl)); h.append(pf);
    const pill = $('div', 'pill'); pill.append(iconCv(ICON.sword, ICONPAL, 2), $('span', '', save.act), $('i', '', '▾')); h.append(pill);
    const purse = $('div', 'purse'); purse.append($('span', 'g', save.gold), $('span', 'e', save.ember)); h.append(purse);
    const xp = $('div', 'xp'); xp.append($('i')); h.append(xp);
    return h;
  }
  function lanternChip(lit, col) {
    const L = ['....6666....', '...66..66...', '....6666....', '.4444444444.', '..43333334..', '..43311334..', '..43155134..', '..41555514..', '..41555514..', '..43155134..', '..43333334..', '.4444444444.', '...444444...', '....4444....'];
    const pal = lit ? { 6: '#8C6A43', 4: '#4A3424', 3: MK.mix(col, '#FFF3C4', 0.55), 1: col, 5: '#FFF8DA' } : { 6: '#4A4E5C', 4: '#2E2A36', 3: '#1C2030', 1: '#262A38', 5: '#30364A' };
    return MK.fromMap(L, pal).canvas(2);
  }
  function chips(save, regs) {
    const row = $('div', 'chips');
    regs.forEach((r, i) => {
      const c = $('div', 'chip' + (i === 0 ? ' on' : '')); c.append(lanternChip(!!save.lit[r.id], r.col), $('span', '', r.short));
      if (r.beyond) c.append($('i', 'rdot'));
      row.append(c);
    });
    row.append($('div', 'close', '⌄'));
    return row;
  }
  function secHead(r, save, extra) {
    const reached = save.reached.includes(r.id), lit = !!save.lit[r.id];
    const h = $('div', 'sec'); h.style.setProperty('--rc', r.col);
    h.append($('b', '', r.name.toUpperCase()), $('span', '', r.beyond ? 'the road ends here' : reached ? `Zones ${r.z0}-${r.z1} · lantern ${lit ? 'lit' : 'dark'}` : `Reach zone ${r.z0}`));
    return h;
  }
  function expBar(save) {
    const b = $('div', 'exp'); const t = $('div', 't'); t.append($('b', '', 'EXPEDITIONS'), $('span', '', save.teams.length + ' out · back in 4h · 2 slots free'));
    b.append(t, $('button', 'send', 'Send a team')); return b;
  }
  function tabs() {
    const t = $('nav', 'tabs');
    const TABI = { Fight: ICON.sword, Gather: ICON.pick, Party: ['............', '...33...33..', '..3333.3333.', '..3333.3333.', '...33...33..', '..111..111..', '.11111111111', '.11111111111', '.1111.11111.', '.11......11.', '............', '............'], Craft: ICON.anvil, World: ['....6666....', '...66..66...', '....6666....', '.4444444444.', '..43333334..', '..43311334..', '..43155134..', '..41555514..', '..43155134..', '..43333334..', '.4444444444.', '............'] };
    for (const k of ['Fight', 'Gather', 'Party', 'Craft', 'World']) {
      const on = k === 'World', b = $('div', 'tab' + (on ? ' on' : ''));
      const pal = on ? { 1: '#F2C14E', 2: '#C8A040', 3: '#FFF3C4', 4: '#6A4A2A', 5: '#FFF8DA', 6: '#8C6A43', 7: '#F2C14E' } : { 1: '#8A7F98', 2: '#6A6078', 3: '#A597B4', 4: '#4A4058', 5: '#C8BCD4', 6: '#6A6078', 7: '#A597B4' };
      b.append(iconCv(TABI[k], pal, 2), $('span', '', k)); t.append(b);
    }
    return t;
  }

  // ---------- one region plate: the baked canvas, glows, and DOM pins over it ----------
  function plateEl(res, save, o) {
    o = o || {};
    const Z = 2, box = $('div', 'plate'); box.style.height = res.H * Z + 'px';
    const cv = res.plate.canvas(1); cv.className = 'art'; cv.style.width = res.W * Z + 'px'; cv.style.height = res.H * Z + 'px'; box.append(cv);
    if (res.under) box.prepend(res.under);
    // glows: every lit light, baked once at art size and scaled smooth by CSS (additive)
    const gl = (res.glowLights || []).slice();
    for (const p of res.pins) for (const l of p.spr.lights) gl.push(Object.assign({}, l, { x: p.at[0] - p.spr.w / 2 + l.x, y: p.at[1] - p.spr.h + 1 + l.y }));
    if (st.glowK !== 0) { const g = MK.glowCanvas(res.W, res.H, gl, st.glowK ?? 1); g.className = 'glow'; g.style.width = res.W * Z + 'px'; g.style.height = res.H * Z + 'px'; box.append(g); }
    // pins: sprite at 2x, bottom centre on its spot; label chip under it; ember dot
    for (const p of res.pins) {
      const el = $('div', 'pin' + (p.dim ? ' dim' : '') + (p.lit ? ' lit' : ''));
      const c = p.spr.canvas(Z); el.append(c);
      el.style.left = (p.at[0] * Z - p.spr.w * Z / 2) + 'px'; el.style.top = ((p.at[1] + 1) * Z - p.spr.h * Z) + 'px'; el.style.width = p.spr.w * Z + 'px';
      if (p.label) { const lb = $('span', 'lbl' + (p.lbl ? ' ' + p.lbl : ''), p.label); el.append(lb); }
      if (p.dot) el.append($('i', 'dot'));
      box.append(el);
    }
    // band flags and zone ranges
    for (const f of res.flags || []) {
      const el = $('div', 'flag' + (f.open ? '' : ' shut'));
      el.append(st.flag(f.open).canvas(Z), $('span', '', MAPDATA.ROMAN[f.band] + (f.open ? ' ' + (f.band < 2 ? 3 : 4) : '')));
      el.style.top = (f.y * Z - (st.flagDy ?? 30)) + 'px'; el.style.left = (st.flagX ?? 4) + 'px'; box.append(el);
      const z0 = f.band * 7 + 1, zr = $('span', 'zr', `zones ${z0}-${z0 + 6}`);
      const leftSide = st.zrSide ? st.zrSide(f.band) : (f.band % 2 === 0);
      zr.style.top = (f.y * Z + (st.zrDy ?? 8)) + 'px'; if (leftSide) zr.style.left = (st.zrX ?? 44) + 'px'; else zr.style.right = (st.zrX ?? 44) + 'px';
      box.append(zr);
    }
    // You and teams out
    const you = res.lamps.find(l => l.zone === save.zone);
    if (you && !o.noYou) {
      const s = st.youFrame(PORTRAIT), el = $('div', 'you'); el.append(s.canvas(Z), $('span', '', 'You'));
      const tip = st.youTip ? st.youTip(you) : [you.x, you.y - 13];
      el.style.left = (tip[0] * Z - s.w * Z / 2) + 'px'; el.style.top = (tip[1] * Z - s.h * Z) + 'px'; box.append(el);
    }
    for (const t of save.teams) {
      const row = res.rows[t.band - (res.bandOff || 0)]; if (row == null) continue;
      const s = st.team(), el = $('div', 'team' + (t.t === 'Back' ? ' back' : ''));
      el.append(s.canvas(Z), $('span', '', t.t)); if (t.t === 'Back') el.append($('i', 'dot'));
      const at = st.teamAt ? st.teamAt(res, t.band - (res.bandOff || 0)) : [60, row];
      el.style.left = (at[0] * Z - s.w * Z / 2) + 'px'; el.style.top = (at[1] * Z - s.h * Z) + 'px'; box.append(el);
    }
    return box;
  }

  function screen(save, full) {
    const ph = $('div', 'phone' + (full ? ' full' : '')); app.append(ph);
    ph.append(header(save), chips(save, MAPDATA.regions));
    const map = $('div', 'map'); ph.append(map);
    const t0 = performance.now();
    const hol = st.paintHollow(save);
    const ms = { hollow: performance.now() - t0 };
    map.append(secHead(MAPDATA.regions[0], save), plateEl(hol, save));
    if (full) {
      let t1 = performance.now(); const co = st.paintCoast(save); co.bandOff = 5; ms.coast = performance.now() - t1;
      map.append(secHead(MAPDATA.regions[1], save), plateEl(co, save));
      t1 = performance.now(); const be = st.paintBeyond(save); ms.beyond = performance.now() - t1;
      map.append(secHead(MAPDATA.regions[2], save), plateEl(be, save, { noYou: 1 }));
    }
    ph.append(expBar(save), tabs());
    document.body.dataset.ms = JSON.stringify(Object.fromEntries(Object.entries(ms).map(([k, v]) => [k, Math.round(v * 10) / 10])));
  }

  function sheet() {
    const wrap = $('div', 'sheet'); app.append(wrap);
    const hd = $('div', 'sh-head'); hd.append($('h1', '', `${st.key}. ${st.name}`), $('p', '', st.pitch + ' Close-ups at 3x (1 art px = 3 CSS px).')); wrap.append(hd);
    const grid = $('div', 'sh-grid'); wrap.append(grid);
    for (const it of st.sheet(PORTRAIT)) {
      const card = $('figure', 'card');
      const sw = $('div', 'sw');
      const sprs = [it.spr, it.spr2, ...(it.more || [])].filter(Boolean), Z = 3;
      const gap = sprs.length > 3 ? 5 : 12, w = Math.max(80, sprs.reduce((a, s) => a + s.w, 0) + gap * (sprs.length - 1) + 16), h = Math.max(...sprs.map(s => s.h)) + 14;
      const bg = st.swatch(w, h, it.dark ? false : true);
      const cv = document.createElement('canvas'); cv.width = w * Z; cv.height = h * Z; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
      g.drawImage(bg.canvas(Z), 0, 0);
      const gls = [];
      const x0 = Math.round((w - (sprs.reduce((a, s) => a + s.w, 0) + gap * (sprs.length - 1))) / 2); let x = x0;
      for (const s of sprs) { const y = h - 6 - s.h; for (const l of s.lights) gls.push(Object.assign({}, l, { x: x + l.x, y: y + l.y })); x += s.w + gap; }
      if (st.glowK !== 0 && gls.length) { const gc = MK.glowCanvas(w, h, gls, st.glowK ?? 1); g.save(); g.globalCompositeOperation = 'screen'; g.imageSmoothingEnabled = true; g.drawImage(gc, 0, 0, w * Z, h * Z); g.restore(); g.imageSmoothingEnabled = false; }
      x = x0; for (const s of sprs) { const y = h - 6 - s.h; g.drawImage(s.canvas(Z), x * Z, y * Z); x += s.w + gap; }
      sw.append(cv); card.append(sw);
      const cap = $('figcaption'); cap.append($('b', '', it.name), $('span', '', `${it.size || sprs.slice(0, 2).map(s => (s.w - (st.rim || 2)) + ' x ' + (s.h - (st.rim || 2))).join(' / ')} art px · ${it.note}`));
      card.append(cap); grid.append(card);
    }
    if (st.regionTile) {
      wrap.append($('h2', 'sh-h2', 'Five regions: a slice of each (lamp lit on the left, dark on the right), then the same slice locked'));
      const row = $('div', 'sh-regions'); wrap.append(row);
      MAPDATA.five.forEach((rg, i) => {
        const f = $('figure', 'rt');
        for (const locked of [false, true]) {
          const t = st.regionTile(i, locked), Z = 3, cv = document.createElement('canvas'); cv.width = t.plate.w * Z; cv.height = t.plate.h * Z;
          const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(t.plate.canvas(Z), 0, 0);
          if (t.glow && t.glow.length && st.glowK !== 0) { const gc = MK.glowCanvas(t.plate.w, t.plate.h, t.glow, st.glowK ?? 1); g.globalCompositeOperation = 'screen'; g.imageSmoothingEnabled = true; g.drawImage(gc, 0, 0, cv.width, cv.height); g.globalCompositeOperation = 'source-over'; g.imageSmoothingEnabled = false; }
          for (const p of t.pins || []) g.drawImage(p.spr.canvas(Z), (p.at[0] - Math.floor(p.spr.w / 2)) * Z, (p.at[1] - p.spr.h + 1) * Z);
          f.append(cv);
        }
        f.append($('figcaption', '', rg.name)); row.append(f);
      });
    }
    if (st.sheetExtra) st.sheetExtra(wrap, $);
  }

  function debug() { for (const it of st.sheet(PORTRAIT)) for (const s of [it.spr, it.spr2].filter(Boolean)) { const c = s.canvas(6); c.style.margin = '6px'; c.style.background = '#556'; app.append(c); } }

  const save = MAPDATA.saves[Q.get('save') || (view === 'full' ? 'late' : 'mid')];
  if (view === 'overview') {
    const wrap = $('div', 'ov'); app.append(wrap);
    wrap.append($('h1', '', 'World map: three styles (MAP0)'));
    const row = $('div', 'ov-row'); wrap.append(row);
    for (const k of ['A', 'B', 'C']) { const s = STY[k]; const f = $('figure'); const im = $('img'); im.src = `../../docs/design/img/map/map-${k.toLowerCase()}-screen.png`; f.append(im, $('figcaption', '', `${k}. ${s.name}`), $('p', '', s.pitch)); row.append(f); }
  } else if (view === 'sheet') sheet();
  else if (view === 'debug') debug();
  else screen(save, view === 'full');
  // keep every label chip inside its plate (a pin near the edge)
  for (const lb of document.querySelectorAll('.pin .lbl')) {
    const plate = lb.closest('.plate'); if (!plate) continue;
    const a = lb.getBoundingClientRect(), b = plate.getBoundingClientRect();
    if (a.left < b.left + 2) lb.style.transform = `translateX(${Math.round(b.left + 2 - a.left)}px)`;
    else if (a.right > b.right - 2) lb.style.transform = `translateX(${Math.round(b.right - 2 - a.right)}px)`;
  }
  document.body.dataset.ready = '1';
})();
