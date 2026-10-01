// 75-codex-ui: the Codex sheet (docs/design/codex.md 5). Browser-only; reads 57c-codex.js.
// Where it lives (docs/design/layout.md): the Camp tab already has 4 views, so the Codex is a
// 90% bottom sheet opened from (1) a compact card at the top of the bell sheet's Journal,
// (2) the Library's "Open Codex" action in camp, (3) Next Up and the away card (event codexOpen).
// Home: Lantern Light, the next milestone, 2 columns of page cards with progress rings.
// A page: back arrow, Blessing and Seal, entries as a picture grid or text rows; tap one for
// its details in the sheet's footer. Entries found since the last visit glow once.
{
  const btn = (cls, txt) => { const b = el('button', cls, txt); b.type = 'button'; return b; };
  const safe = (fn, d) => { try { return fn(); } catch (e) { console.error('[lanternfall] codex ui', e); return d; } };
  const LANTERN = () => iconURL(...craftIcon('lantern', 3));
  const FLAME = () => iconURL('flame', '#F2C14E', { 5: '#FFB347', 7: '#FFF3C4' });
  const SVGNS = 'http://www.w3.org/2000/svg';
  const GRID_PAGES = { bestiary: 1, uniques: 1, companions: 1, materials: 1 };
  const PAGE_IC = {
    bestiary: () => spriteURL('best:slime', SPR.slime, TYPES[0].pal), zones: () => iconURL('banner', '#F2C14E'),
    uniques: () => itemIcon('weapon', 3, 'sproutblade'), armoury: () => iconURL('anvil', '#A9B1BD'),
    companions: () => iconURL('mug', '#8C6A43', { 1: '#6B4A2E', 7: '#F2C14E', 5: '#EFE6D6' }), stories: () => iconURL('charm', '#B58CFF'),
    materials: () => matIcon('crystal', 3), camp: () => iconURL('flame', '#E0524F', { 5: '#FFB347', 7: '#FFF3C4' }),
    deepwell: () => iconURL('orb', '#7FB2FF'), seals: () => iconURL('coin', '#F2C14E'),
    omens: () => iconURL('orb', '#B58CFF'), achievements: () => iconURL('banner', '#E0524F', { 7: '#FFB347' }), wardrobe: () => iconURL('helm', '#C9B8FF')
  };
  const pct = p => Math.floor(p * 100) + '%';
  // Entries whose names are no secret (a zone, a building, an achievement): shown even while blank.
  const OPEN_NAMES = { zones: 1, camp: 1, achievements: 1, seals: 1, armoury: 1 };
  const known = (p, t) => !!t.got || !!OPEN_NAMES[p.id];
  const lightTxt = n => (Math.round(n * 2) / 2).toString();

  // ---- a progress ring (SVG), 0..1 ----
  function ring(size, p, cls) {
    const s = document.createElementNS(SVGNS, 'svg'), r = size / 2 - 3, c = 2 * Math.PI * r;
    s.setAttribute('viewBox', `0 0 ${size} ${size}`); s.setAttribute('width', size); s.setAttribute('height', size);
    s.setAttribute('class', 'cx-ring' + (cls ? ' ' + cls : '')); s.setAttribute('aria-hidden', 'true');
    const bg = document.createElementNS(SVGNS, 'circle'), fg = document.createElementNS(SVGNS, 'circle');
    for (const k of [bg, fg]) { k.setAttribute('cx', size / 2); k.setAttribute('cy', size / 2); k.setAttribute('r', r); }
    bg.setAttribute('class', 'bg'); fg.setAttribute('class', 'fg');
    fg.setAttribute('stroke-dasharray', `${(c * Math.max(0, Math.min(1, p))).toFixed(2)} ${c.toFixed(2)}`);
    fg.setAttribute('transform', `rotate(-90 ${size / 2} ${size / 2})`);
    s.append(bg, fg);
    return s;
  }
  function pips(got, max) {
    const w = el('span', 'cx-pips');
    if (max > 6) { const b = el('span', 'cx-bar'); const f = el('i'); f.style.width = pct(got / max); b.append(f); w.append(b); return w; }
    for (let i = 0; i < max; i++) w.append(el('i', i < got ? 'on' : null));
    return w;
  }
  function tileImg(t) {
    return safe(() => {
      if (t.mob) { const ty = TYPES.find(x => x.key === t.mob); return spriteURL('best:' + ty.key, SPR[ty.key], ty.pal); }
      if (t.item) return itemIcon(t.item.slot, t.item.t, t.item.u);
      if (t.char) return (typeof portraitURL === 'function' && portraitURL(t.char)) || iconURL('mug', '#8C6A43');
      if (t.mat) return matIcon(t.mat[0], t.mat[1]);
      if (t.troph != null) return iconURL(...craftIcon('tro_' + TYPES[t.troph].key));
      if (t.ic) return iconURL(...t.ic);
      if (t.zone) return iconURL('banner', t.got >= 5 ? '#F2C14E' : '#A597B4');
      if (t.bld) return iconURL('anvil', t.got ? '#D08A4E' : '#6E6878');
      if (t.syn) return iconURL('heart', '#FF9E3D');
      return iconURL('charm', t.got ? '#F2E27A' : '#6E6878');
    }, iconURL('charm', '#6E6878'));
  }

  // ---------------- the sheet ----------------
  let api = null, mode = 'home', pageId = null, gainChip = null, lightNum = null;
  function openCodex(page) {
    if (typeof openSheet !== 'function') return;
    codexRefresh(true);
    mode = page ? 'page' : 'home'; pageId = page || null;
    api = openSheet(a => { a.sheet.classList.add('cx-sheet'); render(a); }, { label: 'Codex', onClose() { api = null; } });
  }
  function render(a) {
    a = a || api; if (!a) return;
    a.body.textContent = ''; a.foot.textContent = ''; a.body.scrollTop = 0;
    if (mode === 'page' && codexPage(pageId)) renderPage(a, codexPage(pageId));
    else if (mode === 'miles') renderMiles(a);
    else if (mode === 'titles') renderTitles(a);
    else { mode = 'home'; renderHome(a); }
  }
  const go = (m, id) => { mode = m; pageId = id || null; render(); };
  function backRow(label) {
    const r = el('div', 'cx-back');
    const b = btn('cx-backbtn', '‹ Codex'); b.setAttribute('aria-label', 'Back to the Codex');
    b.addEventListener('click', () => go('home'));
    r.append(b, el('h2', 'cx-ptitle', label));
    return r;
  }

  // ---- home ----
  function headBlock() {
    const h = el('div', 'cx-head');
    const ic = el('span', 'cx-lamp'); ic.append(img(LANTERN()));
    const tx = el('div', 'cx-htx');
    lightNum = el('b', 'cx-light', String(codexLight()));
    gainChip = el('span', 'cx-gain'); gainChip.hidden = true;
    const n = el('div', 'cx-lrow'); n.append(lightNum, el('span', 'cx-lunit', 'Lantern Light'), gainChip);
    tx.append(el('span', 'cx-eye', 'Codex'), n);
    const tb = btn('cx-titlebtn', codexTitle() ? codexTitle() : 'No title');
    tb.prepend(el('span', 'cx-tlbl', 'Title'));
    tb.addEventListener('click', () => go('titles'));
    h.append(ic, tx, tb);
    return h;
  }
  function nextBlock() {
    const nx = codexNext(), L = codexLight();
    const w = btn('cx-next'); w.setAttribute('aria-label', 'Lantern Light milestones');
    const prev = CODEX_MILESTONES.filter(m => m.at <= L).reduce((a, m) => Math.max(a, m.at), 0);
    const bar = el('span', 'cx-nbar'), fill = el('i'); bar.append(fill);
    const newM = CODEX_MILESTONES.some(m => S.codex.got[m.at] && m.at > (S.codex.mSeen || 0));
    if (nx) {
      fill.style.width = pct((L - prev) / Math.max(1, nx.at - prev));
      w.append(el('span', 'cx-ntx', `${nx.at}: ${nx.rw[0].n}${nx.rw.length > 1 ? ` +${nx.rw.length - 1}` : ''}`), bar);
    } else { fill.style.width = '100%'; w.append(el('span', 'cx-ntx', 'Every milestone reached.'), bar); }
    const more = el('span', 'cx-nmore', 'Milestones'); if (newM) more.append(el('span', 'cx-dot'));
    w.append(more);
    w.addEventListener('click', () => go('miles'));
    return w;
  }
  function pageCard(p) {
    const news = codexNews().includes(p.id);
    const c = btn('cx-card' + (p.locked ? ' locked' : '') + (p.seal ? ' sealed' : '') + (news ? ' news' : ''));
    const rw = el('span', 'cx-rw'); rw.append(ring(42, p.locked ? 0 : p.pct, p.seal ? 'done' : p.half ? 'half' : ''));
    const ic = img(PAGE_IC[p.id] ? safe(PAGE_IC[p.id], '') : '', 'px cx-cic'); rw.append(ic);
    const tx = el('span', 'cx-ctx');
    tx.append(el('span', 'cx-cn' + (p.n.length > 10 ? ' long' : ''), p.n));
    if (p.locked) tx.append(el('span', 'cx-cs', p.lockTxt));
    else {
      tx.append(el('span', 'cx-cs', `${lightTxt(p.light)} / ${lightTxt(p.lightMax)} Light`));
      const tags = el('span', 'cx-tags');
      tags.append(p.seal ? el('span', 'cx-tag seal', 'Sealed') : el('span', 'cx-tag', pct(p.pct)));
      // The Blessing's name: lit once open (50%), dim before.
      if (p.bless) { const b = el('span', 'cx-tag' + (p.half ? ' bl' : ' dim'), p.bless.n); b.title = p.half ? 'Blessing open' : 'Blessing at 50%'; tags.append(b); }
      tx.append(tags);
    }
    c.append(rw, tx);
    if (news) c.append(el('span', 'cx-dot'));
    c.setAttribute('aria-label', p.locked ? `${p.n}: ${p.lockTxt}` : `${p.n}, ${pct(p.pct)}`);
    if (!p.locked) c.addEventListener('click', () => go('page', p.id));
    else c.disabled = true;
    return c;
  }
  function renderHome(a) {
    a.body.append(headBlock(), nextBlock());
    if (typeof storyUI === 'object' && storyUI.codexRow) { const r = safe(() => storyUI.codexRow(), null); if (r) a.body.append(r); }   // LORE3: the story so far
    const grid = el('div', 'cx-pages');
    const pages = codexPages();
    for (const p of pages.filter(x => !x.locked)) grid.append(pageCard(p));
    for (const p of pages.filter(x => x.locked)) grid.append(pageCard(p));
    a.body.append(grid, el('p', 'note cx-note', 'Lantern Light only goes up. Half a page opens its Blessing at the Shrine; a full page earns a Seal: a title and a tiny bonus.'));
  }

  // ---- a page ----
  function renderPage(a, p) {
    const fresh = new Set(codexSeen(p.id));
    const top = backRow(p.n);
    const rw = el('span', 'cx-rw sm'); rw.append(ring(40, p.pct, p.seal ? 'done' : p.half ? 'half' : ''), el('span', 'cx-rpct', pct(p.pct)));
    top.append(rw);
    const info = el('div', 'cx-info');
    if (p.bless) {
      const row = el('div', 'cx-irow' + (p.half ? ' on' : ''));
      row.append(el('b', null, 'Blessing'), el('span', null, `${p.bless.n}: ${p.bless.fx}`), el('span', 'cx-ist', p.half ? 'Open' : 'at 50%'));
      info.append(row);
    }
    const srow = el('div', 'cx-irow' + (p.seal ? ' on' : ''));
    srow.append(el('b', null, 'Seal'), el('span', null, (p.sealTxt ? p.sealTxt + '. ' : '') + `Title: ${p.title}`), el('span', 'cx-ist', p.seal ? 'Earned' : 'at 100%'));
    info.append(srow, el('p', 'cx-ilight', `${lightTxt(p.light)} of ${lightTxt(p.lightMax)} Lantern Light`));
    a.body.append(top, info);
    // groups in order; picture grid or text rows
    const groups = [];
    p.tiles.forEach((t, i) => { const g = t.grp || ''; let G = groups.find(x => x.g === g); if (!G) groups.push(G = { g, list: [] }); G.list.push([t, i]); });
    for (const G of groups) {
      const pics = GRID_PAGES[p.id] && G.list.every(([t]) => t.mob || t.item || t.char || t.mat || t.troph != null);
      if (G.g && groups.length > 1) a.body.append(el('h3', 'cx-grp', `${G.g} · ${G.list.filter(([t]) => t.got >= t.max).length} of ${G.list.length}`));
      const box = el('div', pics ? 'cx-grid' : 'cx-rows');
      for (const [t, i] of G.list) box.append(pics ? gridTile(a, p, t, i, fresh.has(i)) : rowTile(a, p, t, i, fresh.has(i)));
      a.body.append(box);
    }
    if (!codexExact()) a.body.append(el('p', 'note cx-note', 'Hints get exact at Library Lv 3, or at 100 Lantern Light.'));
  }
  function mark(node, t, isNew) {
    if (t.got >= t.max) node.classList.add('full');
    else if (!t.got) node.classList.add('blank');
    if (isNew) node.classList.add('glow');
  }
  function gridTile(a, p, t, i, isNew) {
    const b = btn('cx-tile');
    const im = img(tileImg(t), 'px cx-timg'); b.append(im);
    b.append(t.max > 1 ? pips(t.got, t.max) : el('span', 'cx-tn', t.got ? t.n : '?'));
    mark(b, t, isNew);
    b.setAttribute('aria-label', t.got ? `${t.n}, ${t.got} of ${t.max}` : `Unknown entry. ${t.hint || ''}`);
    b.addEventListener('click', () => detail(a, p, t, b));
    return b;
  }
  function rowTile(a, p, t, i, isNew) {
    const b = btn('cx-row');
    const ic = el('span', 'cx-ric'); ic.append(img(tileImg(t))); b.append(ic);
    const tx = el('span', 'cx-rtx');
    tx.append(el('span', 'cx-rn', known(p, t) ? t.n : '???'));
    const line = t.got >= t.max ? (t.sub || '') : (t.hint || t.sub || '');
    if (line) tx.append(el('span', 'cx-rs' + (t.got >= t.max ? '' : ' hint'), line));
    b.append(tx, t.max > 1 ? pips(t.got, t.max) : el('span', 'cx-chk' + (t.got ? ' on' : ''), t.got ? '✓' : ''));
    mark(b, t, isNew);
    b.addEventListener('click', () => detail(a, p, t, b));
    return b;
  }
  // Details in the sheet's footer (one at a time; tap again or × to close).
  let openTile = null;
  function detail(a, p, t, node) {
    a.foot.textContent = '';
    if (openTile) openTile.classList.remove('sel');
    if (openTile === node) { openTile = null; return; }
    openTile = node; node.classList.add('sel');
    const d = el('div', 'cx-det');
    const hd = el('div', 'cx-dh');
    const ic = el('span', 'cx-dic' + (t.got ? '' : ' blank')); ic.append(img(tileImg(t))); hd.append(ic);
    const nm = el('div', 'cx-dn');
    nm.append(el('b', null, known(p, t) ? t.n : 'Not found yet'), el('span', null, `${lightTxt(t.pts / 2)} of ${lightTxt(t.ptsMax / 2)} Light`));
    hd.append(nm, t.max > 1 ? pips(t.got, t.max) : el('span'));
    const x = btn('cx-dx', '×'); x.setAttribute('aria-label', 'Close details');
    x.addEventListener('click', () => { a.foot.textContent = ''; node.classList.remove('sel'); openTile = null; });
    hd.append(x);
    d.append(hd);
    for (const l of t.lore || []) d.append(el('p', 'cx-dlore', l));
    if (t.sub) d.append(el('p', 'cx-dsub', t.sub));
    if (t.titles && t.titles.length) d.append(el('p', 'cx-dsub', 'Read: ' + t.titles.join(', ') + '.'));
    if (t.kills != null) d.append(el('p', 'cx-dsub', `${fmt(t.kills)} slain.`));
    if (t.hint) { const h = el('p', 'cx-dhint'); h.append(el('b', null, 'Where: '), document.createTextNode(t.hint)); d.append(h); }
    if (t.char && p.id === 'stories' && t.got && typeof partySheet === 'object' && partySheet.open) {
      const g = btn('mini go cx-dgo', `Open ${t.n.split(' ')[0]}'s sheet`);
      g.addEventListener('click', () => safe(() => partySheet.open(t.char), null));
      d.append(g);
    }
    if (t.zone && t.zone <= S.maxZone) {
      const g = btn('mini go cx-dgo', `Go to zone ${t.zone}`);
      g.addEventListener('click', () => { safe(() => { setActivity('fight'); if (S.zone !== t.zone) setZone(t.zone); }, null); if (api) api.close(); ui(true); });
      d.append(g);
    }
    a.foot.append(d);
  }

  // ---- milestones ----
  function renderMiles(a) {
    codexMilestonesSeen();
    a.body.append(backRow('Milestones'));
    const L = codexLight(), nx = codexNext();
    a.body.append(el('p', 'cx-mintro', `${L} Lantern Light. Rewards give titles, looks and comfort, never raw power.`));
    const list = el('ol', 'cx-miles');
    for (const m of CODEX_MILESTONES) {
      const got = !!S.codex.got[m.at], li = el('li', 'cx-mile' + (got ? ' got' : nx === m ? ' next' : ''));
      const at = el('span', 'cx-mat'); at.append(el('b', null, String(m.at)));
      if (nx === m) at.append(el('span', null, `${m.at - L} to go`));
      const rw = el('div', 'cx-mrw');
      for (const r of m.rw) {
        const line = el('div', 'cx-mr ' + r.kind);
        line.append(el('span', 'cx-mk', r.kind === 'qol' ? 'Comfort' : r.kind === 'title' ? 'Title' : 'Look'), el('b', null, r.n.replace(/^Title: /, '')));
        if (r.txt) line.append(el('span', 'cx-mtx', r.txt));
        if (got && !r.live && r.later) line.append(el('span', 'cx-mlater', r.later));
        rw.append(line);
      }
      li.append(at, rw, el('span', 'cx-mchk', got ? '✓' : ''));
      list.append(li);
    }
    a.body.append(list);
    requestAnimationFrame(() => { const n = list.querySelector('.next'); if (n) a.body.scrollTop = Math.max(0, n.offsetTop - 140); });
  }

  // ---- titles (local only) ----
  function renderTitles(a) {
    a.body.append(backRow('Titles'));
    a.body.append(el('p', 'cx-mintro', 'Your title shows in your Codex. Only you see it.'));
    const list = el('div', 'cx-titles');
    const cur = S.codex.title;
    const add = (id, n, src, got) => {
      const b = btn('cx-trow' + (cur === id || (!cur && id == null) ? ' on' : '') + (got ? '' : ' locked'));
      const tx = el('span', 'cx-ttx'); tx.append(el('b', null, n), el('span', 'cx-tsrc', got ? src : `Locked: ${src}`));
      b.append(el('span', 'cx-tbox'), tx);
      b.disabled = !got;
      b.addEventListener('click', () => { if (codexSetTitle(id)) go('home'); });
      list.append(b);
    };
    add(null, 'None', 'Always there', true);
    const ts = codexTitles();
    for (const t of ts.filter(x => x.got)) add(t.id, t.n, t.src, true);
    for (const t of ts.filter(x => !x.got)) add(t.id, t.n, t.src, false);
    a.body.append(list);
  }

  // ---------------- live updates ----------------
  let gainT = 0;
  on('codexLight', ({ light, gain }) => {
    if (api && lightNum && document.contains(lightNum)) {
      lightNum.textContent = String(light);
      gainChip.textContent = `+${gain}`; gainChip.hidden = false;
      clearTimeout(gainT); gainT = setTimeout(() => { if (gainChip) gainChip.hidden = true; }, 2600);
    } else if (S.tab === 'world') emit('float', { txt: `+${gain} Lantern Light`, color: '#F2C14E', x: 0.3, y: 0.35 });
    jSig = '';
  });
  on('codexPage', () => { jSig = ''; if (api && mode === 'home') render(); });
  on('codexMilestone', () => { jSig = ''; if (api && mode === 'home') render(); });
  on('codexOpen', ({ page } = {}) => openCodex(page || null));

  // ---------------- the Library's action (57-camp) ----------------
  if (typeof registerCampAction === 'function') registerCampAction('library', { label: 'Open Codex', show: () => campLevel('library') > 0, fn: () => openCodex(null) });

  // ---------------- the Journal card (bell sheet, first in the Journal view) ----------------
  let jSig = '', jAt = 0, jr = {};
  registerSection('log', {
    id: 'codex-card', feature: 'codex',
    mount(sec) {
      sec.classList.add('cx-jsec');
      queueMicrotask(() => sec.parentNode.prepend(sec));   // first in the Journal, above the lifetime stats (which prepend at load)
      const c = el('div', 'cx-jcard');
      const ic = el('span', 'cx-lamp sm'); ic.append(img(LANTERN()));
      const tx = el('div', 'cx-jtx');
      jr.light = el('b', 'cx-jl'); jr.sub = el('span', 'cx-js');
      const top = el('div', 'cx-jtop'); top.append(el('span', 'cx-eye', 'Codex'));
      jr.bar = el('span', 'cx-nbar'); jr.fill = el('i'); jr.bar.append(jr.fill);
      tx.append(top, jr.light, jr.sub, jr.bar);
      jr.open = btn('mini go cx-jopen', 'Open');
      jr.dot = el('span', 'cx-dot'); jr.dot.hidden = true;
      jr.open.append(jr.dot);
      jr.open.addEventListener('click', () => openCodex(null));
      c.addEventListener('click', e => { if (e.target === c || tx.contains(e.target) || ic.contains(e.target)) openCodex(null); });
      c.append(ic, tx, jr.open);
      sec.append(c);
    },
    update(force) {
      const t = Date.now(); if (!force && t - jAt < 1000) return; jAt = t;
      const L = codexLight(), nx = codexNext(), news = codexNews().length, newM = CODEX_MILESTONES.some(m => S.codex.got[m.at] && m.at > (S.codex.mSeen || 0));
      const sig = [L, nx && nx.at, news, newM, S.codex.title].join('|');
      if (sig === jSig) return; jSig = sig;
      jr.light.textContent = `${L} Lantern Light`;
      const prev = CODEX_MILESTONES.filter(m => m.at <= L).reduce((a, m) => Math.max(a, m.at), 0);
      jr.sub.textContent = nx ? `Next at ${nx.at}: ${nx.rw[0].n.replace(/^Title: /, 'Title ')}` : 'Every milestone reached.';
      jr.fill.style.width = nx ? pct((L - prev) / Math.max(1, nx.at - prev)) : '100%';
      jr.dot.hidden = !(news || newM);
    }
  });
}
