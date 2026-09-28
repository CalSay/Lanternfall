// 75-stars-ui: the Stars view on the Party tab (docs/design/constellations.md section 4).
// Browser-only. Rules and state: 57e-constellations.js. Unlocks at hero level 10 (55-onboard FEATURES 'stars').
// One section: points and keystones, the Farm/Push layout chips (hold or Rename to rename, Reset with
// an in-page confirm), a Map | List switch, the 400x400 SVG star map (tap a star: nearest star within
// reach, so taps stay clean on a 336px map) with its detail card, and the list view (56px rows).
{
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const KIND_R = { hearth: 13, minor: 7, bridge: 7, notable: 10, key: 13, crown: 13 };
  const UI = { mode: 'map' };
  try { const m = JSON.parse(localStorage.getItem('lanternfall.stars.ui') || '{}'); if (m.mode === 'list') UI.mode = 'list'; } catch (e) {}
  const saveUi = () => { try { localStorage.setItem('lanternfall.stars.ui', JSON.stringify({ mode: UI.mode })); } catch (e) {} };
  const ICON_OF = c => iconURL('constel', c ? STAR_MAPS[c].color : '#F2C14E');
  // SVG elements: className is read-only there, so write the attribute (on change only).
  const svgClass = (e, c) => { if (e._c !== c) { e._c = c; e.setAttribute('class', c); } };
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

  registerView('party', { id: 'stars', label: 'Stars', order: 30, feature: 'stars',
    dot: () => !!(starCls() && S.stars && starPoints() > S.stars.seen && starFree() > 0) });
  on('menuView', ({ view }) => { if (view === 'stars' && S.stars) S.stars.seen = Math.max(S.stars.seen, starPoints()); });
  on('unlock', ({ id, quiet }) => {
    if (id !== 'stars' || quiet) return;
    toast('New on the Party tab: Stars. Spend star points on your class.', 'good', ICON_OF(starCls()), 'high');
  });

  let R = null;      // DOM refs
  let sel = null;    // selected star id
  let builtFor = '', sig = '';

  function mount(sec) {
    sec.classList.add('st-sec');
    R = {};
    const head = el('div', 'st-head');
    R.title = el('h3', 'st-title');
    R.pts = el('span', 'st-pts');
    head.append(R.title, R.pts);
    R.sub = el('div', 'st-sub');
    R.keys = el('span', 'st-keys');
    R.how = el('p', 'note st-how', 'You earn a star point every 3 hero levels, and 4 for each region boss. Unlighting is free.');
    // layouts, rename, reset
    const bar = el('div', 'st-bar');
    R.chips = el('div', 'seg st-chips'); R.chips.setAttribute('role', 'group'); R.chips.setAttribute('aria-label', 'Layouts');
    R.chipBtns = [0, 1].map(i => {
      const b = el('button', 'st-chip'); b.type = 'button';
      b.addEventListener('click', () => { if (b._held) { b._held = false; return; } if (starUseLayout(i)) { sel = null; save(); } else flashLock(); refresh(true); });
      let t = null;
      const cancel = () => { if (t) { clearTimeout(t); t = null; } };
      b.addEventListener('pointerdown', () => { cancel(); t = setTimeout(() => { t = null; b._held = true; openRename(i); }, 550); });
      b.addEventListener('pointerup', cancel); b.addEventListener('pointerleave', cancel); b.addEventListener('pointercancel', cancel);
      b.addEventListener('contextmenu', e => e.preventDefault());
      R.chips.append(b); return b;
    });
    R.renBtn = el('button', 'mini st-mini', 'Rename'); R.renBtn.type = 'button';
    R.resetBtn = el('button', 'mini st-mini warn', 'Reset'); R.resetBtn.type = 'button';
    R.renBtn.addEventListener('click', () => openRename(starCls() ? S.stars.maps[starCls()] ? S.stars.maps[starCls()].active : 0 : 0));
    R.resetBtn.addEventListener('click', () => { closePanels(); R.confirm.hidden = false; putText(R.confirmTxt, `Unlight every star in ${starLayout().name}? It is free.`); R.confirmYes.focus(); });
    const btns = el('div', 'st-btns'); btns.append(R.renBtn, R.resetBtn);
    bar.append(R.chips, btns);

    R.rename = el('form', 'st-panel st-rename'); R.rename.hidden = true;
    R.renInput = el('input', 'st-input'); R.renInput.maxLength = STAR_TUNE.nameMax; R.renInput.setAttribute('aria-label', 'Layout name'); R.renInput.autocomplete = 'off';
    const rs = el('button', 'mini go', 'Save'); rs.type = 'submit';
    const rc = el('button', 'mini', 'Cancel'); rc.type = 'button';
    R.rename.append(R.renInput, rs, rc);
    R.rename.addEventListener('submit', e => { e.preventDefault(); if (starRename(R.renIdx, R.renInput.value)) save(); R.rename.hidden = true; refresh(true); });
    rc.addEventListener('click', () => { R.rename.hidden = true; });

    R.confirm = el('div', 'st-panel st-confirm'); R.confirm.hidden = true;
    R.confirmTxt = el('p', 'note');
    R.confirmYes = el('button', 'mini go', 'Unlight all'); R.confirmYes.type = 'button';
    const cn = el('button', 'mini', 'Keep them'); cn.type = 'button';
    const cb = el('div', 'st-btns'); cb.append(R.confirmYes, cn);
    R.confirm.append(R.confirmTxt, cb);
    R.confirmYes.addEventListener('click', () => { if (starReset()) { toast('Every star is dark again. Your points are back.', 'good', ICON_OF(starCls()), 'low'); save(); } else flashLock(); R.confirm.hidden = true; sel = null; refresh(true); });
    cn.addEventListener('click', () => { R.confirm.hidden = true; });

    R.lock = el('p', 'note warn st-lock'); R.lock.hidden = true;

    R.mode = el('div', 'seg st-mode'); R.mode.setAttribute('role', 'group'); R.mode.setAttribute('aria-label', 'Show as');
    R.modeBtns = ['map', 'list'].map(m => {
      const b = el('button', null, m === 'map' ? 'Map' : 'List'); b.type = 'button';
      b.addEventListener('click', () => { UI.mode = m; saveUi(); refresh(true); });
      R.mode.append(b); return b;
    });

    R.mapBox = el('div', 'st-map');
    R.card = el('div', 'st-card'); R.card.setAttribute('aria-live', 'polite');
    R.cName = el('div', 'st-cname'); R.cKind = el('div', 'st-ckind'); R.cText = el('p', 'st-ctext'); R.cC = el('p', 'st-cc');
    R.cBtn = el('button', 'buy st-cbtn'); R.cBtn.type = 'button';
    R.cWhy = el('p', 'st-cwhy');
    const cl = el('div', 'st-cl'); cl.append(R.cName, R.cKind, R.cText, R.cC, R.cWhy);
    R.card.append(cl, R.cBtn);
    R.cBtn.addEventListener('click', () => act(sel));

    R.list = el('div', 'st-list');
    R.none = el('p', 'note', 'Choose a class to see its stars.'); R.none.hidden = true;
    R.sub.append(R.keys, R.mode);
    sec.append(head, R.sub, bar, R.rename, R.confirm, R.lock, R.mapBox, R.card, R.list, R.how, R.none);
  }

  // After a tap on the map, bring the card into view if it is below the fold (the map stays mostly on screen).
  function showCard() {
    const box = $('panels'); if (!box || !R.card.getClientRects().length) return;
    const b = box.getBoundingClientRect(), c = R.card.getBoundingClientRect();
    const over = c.bottom - b.bottom + 8; if (over <= 0) return;
    const y = box.scrollTop + over;
    if (!reduced) { try { box.scrollTo({ top: y, behavior: 'smooth' }); return; } catch (e) {} }
    box.scrollTop = y;
  }
  function closePanels() { R.rename.hidden = true; R.confirm.hidden = true; }
  function openRename(i) {
    if (!starCls()) return;
    closePanels();
    R.renIdx = i; R.renInput.value = starLayouts()[i].name; R.rename.hidden = false;
    try { R.renInput.focus(); R.renInput.select(); } catch (e) {}
  }
  function flashLock() { const w = starLocked(); if (w) toast(w, 'raid', null, 'normal'); }
  function act(id) {
    if (!id) return;
    const c = starCheck(id);
    if (!c.ok) { flashLock(); return; }
    const s = starMap(starCls()).stars[id];
    const done = c.act === 'light' ? starLight(id) : starUnlight(id);
    if (done) {
      save();
      if (!reduced && c.act === 'light' && R.nodes && R.nodes[id]) { const g = R.nodes[id].g; g.classList.remove('pop'); void g.getBoundingClientRect(); g.classList.add('pop'); }
      if (c.act === 'light' && (s.kind === 'key' || s.kind === 'crown')) toast(`${s.name} is lit.`, 'good', ICON_OF(starCls()), 'low');
    }
    refresh(true);
  }

  // ---- the SVG map (built once per class) ----
  function buildMap(cls) {
    const map = starMap(cls);
    R.mapBox.textContent = '';
    const [vx, vy, vw, vh] = STAR_GEO.view, cx = STAR_GEO.cx, cy = STAR_GEO.cy;
    const svg = sv('svg', { viewBox: STAR_GEO.view.join(' '), class: 'st-svg', role: 'group', 'aria-label': `${HERO_CLASSES[cls].name} star map` });
    svg.style.setProperty('--role', map.color);
    // backdrop: faint rings and dust (seeded, static)
    const bg = sv('g', { class: 'st-bg', 'aria-hidden': 'true' });
    for (const r of [STAR_GEO.ring, 184]) bg.append(sv('circle', { cx, cy, r, class: 'st-orbit' }));
    // faint dividers between the three arms
    for (const a of STAR_GEO.axes) { const t = (a + 60) * Math.PI / 180; bg.append(sv('line', { x1: cx + 70 * Math.cos(t), y1: cy + 70 * Math.sin(t), x2: cx + 200 * Math.cos(t), y2: cy + 200 * Math.sin(t), class: 'st-div' })); }
    const rnd = rng(7);
    for (let i = 0; i < 46; i++) bg.append(sv('circle', { cx: (vx + rnd() * vw).toFixed(1), cy: (vy + rnd() * vh).toFixed(1), r: (0.6 + rnd() * 0.9).toFixed(2), class: 'st-dust' }));
    svg.append(bg);
    const eg = sv('g', { class: 'st-edges', 'aria-hidden': 'true' });
    R.edges = map.edges.map(([a, b]) => {
      const [x1, y1] = map.stars[a].pos, [x2, y2] = map.stars[b].pos;
      const ln = sv('line', { x1, y1, x2, y2, class: 'st-edge' }); eg.append(ln); return { a, b, ln };
    });
    svg.append(eg);
    const ng = sv('g', { class: 'st-nodes' });
    R.nodes = {};
    for (const id of map.order) {
      const s = map.stars[id], [x, y] = s.pos, r = KIND_R[s.kind];
      const g = sv('g', { class: `st-star k-${s.kind}`, transform: `translate(${x} ${y})`, tabindex: '0', role: 'button', 'data-id': id, 'aria-label': `${s.name}, ${starText(s)}` });
      const glow = sv('circle', { r: r + 9, class: 'st-glow' });
      const ring = sv('circle', { r: r + 5, class: 'st-ring' });
      let body;
      if (s.kind === 'key' || s.kind === 'crown' || s.kind === 'hearth') {
        const pts = []; for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 4, rr = i % 2 ? r * 0.45 : r; pts.push((rr * Math.cos(a)).toFixed(1) + ',' + (rr * Math.sin(a)).toFixed(1)); }
        body = sv('polygon', { points: pts.join(' '), class: 'st-body' });
      } else if (s.kind === 'notable') body = sv('rect', { x: -r * 0.78, y: -r * 0.78, width: r * 1.56, height: r * 1.56, transform: 'rotate(45)', class: 'st-body' });
      else body = sv('circle', { r, class: 'st-body' });
      const lock = sv('g', { class: 'st-lockic', transform: `translate(${r * 0.7} ${-r * 0.9})` });
      lock.append(sv('rect', { x: -4, y: -1, width: 8, height: 6, rx: 1 }), sv('path', { d: 'M-2.5 -1 v-2 a2.5 2.5 0 0 1 5 0 v2', fill: 'none' }));
      g.append(glow, ring, body, lock);
      ng.append(g);
      R.nodes[id] = { g, s };
    }
    svg.append(ng);
    // Tap: the nearest star within reach (the map is 336px wide on a phone, so stars are about 40px apart).
    svg.addEventListener('click', e => {
      const r = svg.getBoundingClientRect(); if (!r.width) return;
      const k = vw / r.width, x = vx + (e.clientX - r.left) * k, y = vy + (e.clientY - r.top) * (vh / r.height);
      let best = null, bd = 34 * Math.max(1, k * 0.9);
      for (const id of map.order) { const [sx, sy] = map.stars[id].pos, d = Math.hypot(sx - x, sy - y); if (d < bd) { bd = d; best = id; } }
      if (best) { sel = best; closePanels(); refresh(true); showCard(); }
    });
    svg.addEventListener('keydown', e => {
      const id = e.target && e.target.getAttribute && e.target.getAttribute('data-id');
      if (!id || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      if (sel === id) act(id); else { sel = id; refresh(true); showCard(); }
    });
    R.svg = svg;
    // legend: which arm points where, and how many of its stars are lit
    R.legend = el('div', 'st-legend');
    R.legBits = map.armNames.map((n, a) => { const b = el('span', 'st-leg'); b.append(el('i', 'st-arrow', ['↑', '↘', '↙'][a]), el('b', null, n), el('span', 'st-legn')); R.legend.append(b); return b; });
    const rb = el('span', 'st-leg'); rb.append(el('i', 'st-arrow', '○'), el('b', null, 'Ring'), el('span', 'st-legn')); R.legend.append(rb); R.legBits.push(rb);
    R.mapBox.append(svg, R.legend);
  }

  // ---- the list view (built once per class) ----
  function buildList(cls) {
    const map = starMap(cls);
    R.list.textContent = '';
    R.list.style.setProperty('--role', map.color);
    R.rows = {};
    const group = (title, ids) => {
      const box = el('div', 'st-group');
      box.append(el('h4', 'st-gtitle', title));
      for (const id of ids) {
        const s = map.stars[id];
        const row = el('div', 'st-row k-' + s.kind);
        const dot = el('i', 'st-dot');
        const txt = el('div', 'st-rtxt');
        const nm = el('div', 'st-rname'); const nmT = el('span', null, s.name); const kd = el('span', 'st-rkind', starText(s)); nm.append(nmT, kd);
        const d = el('div', 'st-rdesc', s.text);
        const why = el('div', 'st-rwhy');
        txt.append(nm, d, why);
        const b = el('button', 'mini st-rbtn'); b.type = 'button';
        b.addEventListener('click', () => { sel = id; act(id); });
        row.addEventListener('click', e => { if (e.target === b) return; sel = id; refresh(true); });
        row.append(dot, txt, b);
        if (s.kind === 'hearth') b.remove();
        box.append(row);
        R.rows[id] = { row, b, why };
      }
      R.list.append(box);
    };
    group('Hearthstar', ['hearth']);
    map.armNames.forEach((n, a) => group(n, [1, 2, 3, 4, 5, 6, 7, 8].map(k => `a${a}s${k}`)));
    group('Crown ring', ['b0', 'b1', 'b2', 'b3', 'b4', 'crown']);
  }

  // ---- update ----
  function refresh(force) {
    if (!R) return;
    const cls = starCls();
    putHidden(R.none, !!cls);
    for (const n of [R.mode, R.mapBox, R.card, R.list, R.lock]) if (!cls) putHidden(n, true);
    putDisabled(R.renBtn, !cls); putDisabled(R.resetBtn, !cls);
    if (!cls) { putText(R.title, 'Stars'); putText(R.pts, ''); putText(R.keys, ''); R.chipBtns.forEach(b => putHidden(b, true)); return; }
    if (builtFor !== cls) { builtFor = cls; sel = null; buildMap(cls); buildList(cls); sig = ''; }
    const map = starMap(cls), lay = starLayout(), lays = starLayouts(), ai = S.stars.maps[cls] ? S.stars.maps[cls].active : 0;
    const pts = starPoints(), free = starFree(), keys = starKeysLit(), lock = starLocked();
    if (!sel || !map.stars[sel]) {
      // default: the cheapest star you can light, else the Hearthstar
      let best = null;
      for (const id of map.order) { const s = map.stars[id]; if (id !== 'hearth' && !starIsLit(id) && starCheck(id).ok && (!best || s.cost < map.stars[best].cost)) best = id; }
      sel = best || 'hearth';
    }
    const s2 = [cls, ai, lay.lit.join(','), pts, lock || '', sel, UI.mode, lays[0].name, lays[1].name].join('|');
    if (!force && s2 === sig) return;
    sig = s2;
    putText(R.title, `${HERO_CLASSES[cls].name} stars`);
    putText(R.pts, `${free} of ${plural(pts, 'point')} left`);
    putToggle(R.pts, 'has', free > 0);
    putText(R.keys, `Keystones ${keys} of ${STAR_TUNE.keyMax}`);
    putToggle(R.keys, 'full', keys >= STAR_TUNE.keyMax);
    R.chipBtns.forEach((b, i) => { putHidden(b, false); putText(b, lays[i].name); putAttr(b, 'aria-pressed', String(i === ai)); putAttr(b, 'title', 'Hold to rename'); });
    putHidden(R.lock, !lock); if (lock) putText(R.lock, lock + ' Your stars stay as they are until it ends.');
    putHidden(R.mode, false);
    R.modeBtns.forEach((b, i) => putAttr(b, 'aria-pressed', String((i === 0) === (UI.mode === 'map'))));
    putHidden(R.mapBox, UI.mode !== 'map'); putHidden(R.card, UI.mode !== 'map'); putHidden(R.list, UI.mode !== 'list');

    // star states
    const litSet = new Set(['hearth', ...lay.lit]);
    const state = {};
    for (const id of map.order) {
      const s = map.stars[id], lit = litSet.has(id);
      const c = lit ? null : starCheck(id);
      const keyBlocked = !lit && (s.kind === 'key' || s.kind === 'crown') && keys >= STAR_TUNE.keyMax;
      state[id] = { lit, open: !lit && c.ok, keyBlocked, near: !lit && map.adj[id].some(n => litSet.has(n)) };
    }
    if (UI.mode === 'map') {
      for (const id of map.order) {
        const n = R.nodes[id], st = state[id];
        svgClass(n.g, `st-star k-${n.s.kind}${st.lit ? ' lit' : st.open ? ' open' : st.near ? ' near' : ' dim'}${st.keyBlocked ? ' kblock' : ''}${sel === id ? ' sel' : ''}`);
      }
      const cnt = [0, 0, 0, 0];
      for (const id of lay.lit) { const s = map.stars[id]; if (s) cnt[s.arm >= 0 ? s.arm : 3]++; }
      R.legBits.forEach((b, i) => putText(b.lastChild, `${cnt[i]}/${i < 3 ? 8 : 6}`));
      for (const e of R.edges) svgClass(e.ln, 'st-edge' + (litSet.has(e.a) && litSet.has(e.b) ? ' lit' : litSet.has(e.a) || litSet.has(e.b) ? ' half' : ''));
      // detail card
      const s = map.stars[sel], st = state[sel], c = sel === 'hearth' ? null : starCheck(sel);
      putText(R.cName, s.name);
      putText(R.cKind, starText(s) + (s.arm >= 0 ? ` · ${map.armNames[s.arm]}` : ''));
      putText(R.cText, s.text);
      putHidden(R.cC, !s.c); if (s.c) putText(R.cC, 'With party combat: ' + s.c);
      putHidden(R.cBtn, !c);
      if (c) {
        putText(R.cBtn, st.lit ? 'Unlight' : c.ok ? `Light (${s.cost})` : 'Locked');
        putDisabled(R.cBtn, !c.ok);
        putToggle(R.cBtn, 'off', st.lit);
      }
      const why = c && !c.ok ? c.why : st.lit && sel !== 'hearth' ? 'Lit. Unlighting is free.' : '';
      putText(R.cWhy, why); putHidden(R.cWhy, !why);
      putToggle(R.card, 'is-lit', st.lit);
    } else {
      for (const id of map.order) {
        const r = R.rows[id], st = state[id]; if (!r) continue;
        putClass(r.row, `st-row k-${map.stars[id].kind}${st.lit ? ' lit' : st.open ? ' open' : ' dim'}${sel === id ? ' sel' : ''}`);
        if (id === 'hearth') continue;
        const c = st.lit || st.open ? null : starCheck(id);
        putText(r.b, st.lit ? 'Unlight' : st.open ? `Light (${map.stars[id].cost})` : 'Locked');
        putDisabled(r.b, !st.lit && !st.open);
        putToggle(r.b, 'go', st.open);
        const w = c ? c.why : '';
        putText(r.why, w); putHidden(r.why, !w);
      }
    }
  }

  registerSection('party', { id: 'stars', title: '', view: 'stars', feature: 'stars', mount, update: force => refresh(force) });
  on('classChosen', () => { sel = null; refresh(true); });
}
