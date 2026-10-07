// 75-store-ui: the Storehouse view in the Gather tab (task H3, rebuilt by UX-A GX1:
// docs/design/ux-overhaul.md 6.2). Browser-only; the rules live in 55-store.js. The Storehouse's
// building row is the Camp's list (75-camp-ui.js); its icon is registered here.
//   - The view (id 'pack', label "Storehouse"): a top card (level, what it holds, Upgrade ›),
//     filter chips (All and each family with something in it, Fought, Trophies), families as rows of
//     5 cells with a held/cap bar in each, empty families folded into one line, trophies folded.
//     A cell opens "where to get it" (72-ui-gather whereSheet).
//   - The "Storehouse full" warning lives on the Now card and the header pill (72-ui-gather, 75-nav-ui).
//   - storeStage (the stage's held line), storePackLine (the where-to-get sheet), storeSalvageNote
//     (the Craft tab's salvage ask), STORE_ICON (the Camp row).

registerIcons({
  b_store: ['............', '.6666666666.', '.6111111116.', '.6155555516.', '.6111111116.', '.6666666666.', '.6111111116.', '.6111771116.', '.6111771116.', '.6111111116.', '.6666666666.', '............']
});
const STORE_ICON = () => iconURL('b_store', '#8C6A43', { 6: '#4A3220', 5: '#B08A5A', 7: '#F2C14E' });

// The stage's held line: "640/1,000 stored", "1,000/1,000 · Full".
function storeStage(k, t) {
  const h = S.mats[k][t - 1] || 0, cap = storeCap(k, t);
  if (!Number.isFinite(cap)) return `${fmt(h)} stored`;
  const n = h < 1e5 ? storeNum(h) : fmt(h), c = cap < 1e5 ? storeNum(cap) : fmt(cap);
  return `${n}/${c} ` + (h > cap ? '· Over the cap' : h >= cap ? '· Full' : 'stored');
}
// The "where to get it" sheet's first line.
function storePackLine(k, t) {
  const h = S.mats[k][t - 1] || 0, cap = storeCap(k, t);
  if (!Number.isFinite(cap)) return `${storeNum(h)} in the Storehouse · Tier ${t}`;
  return `${storeNum(h)} / ${storeNum(cap)} in the Storehouse · Tier ${t}` + (h > cap ? `. Over the cap: spend below ${storeNum(cap)} to gather more.` : h >= cap ? '. Full.' : '');
}
// Salvage: "Only 5 of 8 Copper Ore fit. Salvage anyway?" (preview: { fam: n } at tier t), or ''.
function storeSalvageNote(preview, t) {
  const lines = Object.entries(preview || {}).map(([f, n]) => [f, t, n]);
  const short = stashPreview(lines).filter(([, , n, fit]) => fit < n);
  if (!short.length) return '';
  return short.map(([f, tt, n, fit]) => `Only ${storeNum(fit)} of ${storeNum(n)} ${matName(f, tt)} fit.`).join(' ') + ' The rest is lost. Salvage anyway?';
}

{
  const btn = (cls, txt) => { const b = el('button', cls, txt); b.type = 'button'; return b; };
  const FOUGHT = f => !GATHER_KINDS.includes(f);                     // hide, essence (and later fish, pearls)
  const famNote = f => {
    if (FOUGHT(f)) return 'from fights';
    const sk = skillOf(f); return `${SKILL[sk]} ${S.skills[sk].lv}`;
  };
  const any = f => (S.mats[f] || []).some(n => n > 0);
  const FILTERS = [['all', 'All'], ...CRAFT_FAMILIES.filter(f => !FOUGHT(f)).map(f => [f, MAT[f].n]), ['fought', 'Fought'], ['troph', 'Trophies']];
  let V = null, filter = 'all', showEmpty = false, showTro = false;

  function cell(f, t) {
    const c = btn('mat sh-cell');
    c.setAttribute('aria-label', `${matName(f, t)}: where to get it`);
    const n = el('span', 'mc', '0'), cap = el('span', 'sh-cap'), bar = el('i', 'sh-bar'), fill = el('b'); bar.append(fill);
    c.append(n, el('div', 'mn', f === 'ess' ? 'Essence' : MAT[f].short[t - 1]), bar);
    c.addEventListener('click', () => whereSheet(f, t));
    return { c, n, cap, fill, f, t };
  }
  function build(sec) {
    V = { fams: {}, chips: {} };
    // top card
    const card = el('div', 'sh-card');
    const tx = el('div', 'sh-card-tx');
    V.title = el('h3', 'sh-title'); V.sub = el('div', 'sh-sub');
    tx.append(V.title, V.sub);
    V.up = btn('mini sh-up', 'Upgrade ›');
    V.up.addEventListener('click', () => setTab('world', '#camp-b-store'));
    card.append(tx, V.up);
    // filter chips (wrap to a second row when narrow; no view swipe)
    const chips = el('div', 'sh-chips'); chips.dataset.noswipe = '';
    for (const [id, label] of FILTERS) {
      const b = btn('sh-fchip', label); b.setAttribute('aria-pressed', String(id === filter));
      b.addEventListener('click', () => { filter = id; ui(true); });
      chips.append(b); V.chips[id] = b;
    }
    // families
    const fams = el('div', 'sh-fams');
    for (const f of CRAFT_FAMILIES) {
      const s = el('div', 'sec sh-fam'), h = el('div', 'sec-head'), tt = el('h2', 'sec-title', MAT[f].n), nt = el('span', 'note');
      h.append(tt, nt);
      const row = el('div', 'mat-row sh-row'), cells = [];
      for (let t = 1; t <= (f === 'ess' ? 1 : 5); t++) { const x = cell(f, t); row.append(x.c); cells.push(x); }   // Essence is one pile
      s.append(h, row); fams.append(s);
      V.fams[f] = { s, nt, cells };
    }
    // the empty families, folded into one line
    V.empty = btn('gx-fold sh-empty'); V.emptyL = el('span', 'gx-fold-l'); V.emptyR = el('span', 'gx-fold-r'); V.empty.append(V.emptyL, V.emptyR);
    V.empty.addEventListener('click', () => { showEmpty = !showEmpty; ui(true); });
    // trophies, folded
    V.tro = btn('gx-fold sh-tro'); V.troL = el('span', 'gx-fold-l'); V.troR = el('span', 'gx-fold-r'); V.tro.append(V.troL, V.troR);
    V.tro.addEventListener('click', () => { showTro = !showTro; ui(true); });
    V.troRow = el('div', 'mat-row sh-row gat-tro'); V.troCells = [];
    CRAFT_TROPHIES.forEach((tr, i) => {
      const c = el('div', 'mat'); c.title = `${tr.n}: from champions and zone bosses (zone ${CRAFT_TROPHY_SRC.firstBossFrom} on).`;
      const n = el('span', 'mc', '0');
      c.append(img(iconURL(...craftIcon('tro_' + TYPES[i].key))), n, el('div', 'mn', tr.n.split(' ')[1] || tr.n));
      V.troRow.append(c); V.troCells.push({ c, n });
    });
    const note = el('p', 'note', 'Tap a material to see where it comes from.');
    sec.append(card, chips, fams, V.empty, V.tro, V.troRow, note);
    // icons last: 35 cells, only on the view's first show
    for (const f of CRAFT_FAMILIES) for (const x of V.fams[f].cells) x.c.prepend(img(matIcon(f, x.t)));
  }
  function update() {
    // top card
    const lv = storeLevel(), g = storeCapAt('ore', 1, lv), h = storeCapAt('hide', 1, lv), fin = Number.isFinite(g);
    putText(V.title, lv ? `Storehouse Lv ${lv}` : 'Storehouse');
    const nFull = fin ? storeFullCells().length : 0;
    putText(V.sub, !fin ? 'No limits on materials.' : (lv ? '' : 'Not built yet. ') + `Holds ${gxNum(g)} of each. Hide and essence ${gxNum(h)}.` + (nFull ? ` ${nFull === 1 ? '1 pile is' : nFull + ' piles are'} full.` : ''));
    const camp = typeof campOpen === 'function' && campOpen();
    putHidden(V.up, !fin || !camp);
    putText(V.up, lv ? 'Upgrade ›' : 'Build ›');
    // chips: All, every family with something in it, Fought, Trophies (when there are any)
    const troN = (S.craft.troph || []).filter(n => n > 0).length;
    for (const [id] of FILTERS) {
      const has = id === 'all' ? true : id === 'fought' ? CRAFT_FAMILIES.some(f => FOUGHT(f) && any(f)) : id === 'troph' ? troN > 0 : any(id);
      putHidden(V.chips[id], !has && filter !== id);
      putAttr(V.chips[id], 'aria-pressed', String(filter === id));
      putToggle(V.chips[id], 'on', filter === id);
    }
    // families
    const empty = [];
    for (const f of CRAFT_FAMILIES) {
      const F = V.fams[f], has = any(f);
      const inFilter = filter === 'all' || filter === f || (filter === 'fought' && FOUGHT(f));
      if (!has && inFilter && filter === 'all') empty.push(f);
      const show = inFilter && filter !== 'troph' && (has || showEmpty || filter !== 'all');
      putHidden(F.s, !show);
      if (!show) continue;
      putText(F.nt, famNote(f));
      for (const x of F.cells) {
        const v = f === 'ess' ? essHave() : S.mats[f][x.t - 1] || 0, cap = f === 'ess' ? essCap() : storeCap(f, x.t), cf = Number.isFinite(cap);
        putText(x.n, gxNum(v));
        putToggle(x.c, 'none', !v);
        putHidden(x.fill.parentNode, !cf);
        if (cf) putStyle(x.fill, 'width', Math.min(100, v / cap * 100).toFixed(1) + '%');
        putToggle(x.c, 'sh-warn', cf && v >= cap * STORE_TUNE.warn && v < cap);
        putToggle(x.c, 'sh-full', cf && v >= cap && v > 0 && v <= cap);
        putToggle(x.c, 'sh-over', cf && v > cap);
        putAttr(x.c, 'title', cf ? `${costName(f, x.t)}: ${storeNum(v)} / ${storeNum(cap)}` : `${costName(f, x.t)}: ${storeNum(v)}`);
      }
    }
    putHidden(V.empty, !empty.length);
    if (empty.length) {
      const names = empty.map(f => MAT[f].n.toLowerCase()), s = names.join(', ');
      putText(V.emptyL, `${s[0].toUpperCase()}${s.slice(1)}: none yet`);
      putText(V.emptyR, showEmpty ? 'Hide' : 'Show');
      putToggle(V.empty, 'open', showEmpty);
    }
    // trophies
    const troShow = filter === 'troph' || filter === 'all';
    putHidden(V.tro, !troShow || filter === 'troph');
    putText(V.troL, `Trophies: ${troN} of ${CRAFT_TROPHIES.length} kinds`);
    putText(V.troR, showTro ? 'Hide' : 'Show');
    putToggle(V.tro, 'open', showTro);
    putHidden(V.troRow, !(filter === 'troph' || (troShow && showTro)));
    V.troCells.forEach(({ c, n }, i) => { const v = S.craft.troph[i] || 0; putText(n, gxNum(v)); putToggle(c, 'none', !v); });
  }
  registerSection('gat', {
    id: 'store', view: 'pack',
    mount(sec) { sec.classList.add('sh-view'); },
    update() { if (!V) build($('sec-store')); update(); }
  });
}
