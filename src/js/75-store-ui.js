// 75-store-ui: the Storehouse view in the Gather tab (task H3, rebuilt by UX-A GX1:
// docs/design/ux-overhaul.md 6.2). Browser-only; the rules live in 55-store.js. The Storehouse's
// building row is the Camp's list (75-camp-ui.js); its icon is registered here.
//   - The view (id 'pack', label "Storehouse"): a top card (level, what it holds, Build or Upgrade ›),
//     filter chips (All, each family with something in it, Fought, Trophies), sort chips (Fullest, Name) and
//     "Show all grades". First view: the shelf, one stack per family at the grade you use (storeShelfGrade
//     below; Essence is one pile), at most 7 stacks (8 once coal lands). "Show all grades" or a family filter:
//     families as rows of every grade with a held/cap bar, empty families folded into one line. Trophies
//     fold. A stack or cell opens "where to get it" (72-ui-gather whereSheet).
//   - The "Storehouse full" warning lives on the Now card and the header pill (72-ui-gather, 75-nav-ui).
//   - storeStage (the stage's held line), storePackLine (the where-to-get sheet), storeSalvageNote
//     (the Craft tab's salvage ask), STORE_ICON (the Camp row).

registerIcons({
  b_store: ['............', '.6666666666.', '.6111111116.', '.6155555516.', '.6111111116.', '.6666666666.', '.6111111116.', '.6111771116.', '.6111771116.', '.6111111116.', '.6666666666.', '............']
});
const STORE_ICON = () => iconURL('b_store', '#8C6A43', { 6: '#4A3220', 5: '#B08A5A', 7: '#F2C14E' });

// ---- the shelf rule (no DOM; tools/check.mjs loads this block into the core) ----
// The grade the Storehouse's first view shows for a family (card cal-0107-storage-and-gather-ui; overhaul spec section 4
// as amended, coordinator sign-off 2026-10-07 after an Opus judge). The cap: for a gathered family the lower of your zone's
// grade (zoneTier(S.maxZone)) and the top grade its skill gathers now; hide also at most Hunting's 3 grounds. The grade
// shown: the cap grade if any is held there; else the largest stack at or below the cap (a leftover handful never hides
// the main stack); else the highest grade held (drops, caches, old saves); else the cap (an empty stack: nothing held).
function storeShelfCap(f) {
  const z = zoneTier(Math.max(1, S.maxZone || 1)), fam = CRAFT_FAMILY[f], sk = fam && fam.skill;
  if (!sk) return z;
  const c = Math.min(z, skillTopTier(sk));
  return f === 'hide' ? Math.min(c, HUNT_BEASTS.length) : c;
}
function storeShelfGrade(f) { return storeShelfGradeOf(S.mats[f] || [], storeShelfCap(f)); }
function storeShelfGradeOf(a, cap) {
  const n = t => Math.max(0, a[t - 1] || 0);
  if (n(cap) > 0) return cap;
  let best = 0;
  for (let t = 1; t <= cap; t++) if (n(t) > 0 && (!best || n(t) >= n(best))) best = t;
  if (best) return best;
  for (let t = 5; t > cap; t--) if (n(t) > 0) return t;
  return cap;
}
// refine-queues: a middle (Ingot, Plank, Cloth, Leather) shares its raw family's stack ("Iron Ore 120 · Iron Ingot 40").
// The grade comes from the raw stacks by the rule above, and the middle of that grade shows beside it; only when the family
// holds no raw at or below its cap does the middle's own grade pick the stack (a few Briar Cloth never hide 15,000 Hemp
// Fibre, and a family holding only middles never shows an empty stack). Coal is the 8th stack, at grade 1 only.
const storeShelfMid = f => (typeof REFINE_MID === 'object' && REFINE_MID[f]) || null;
function storeShelfPick(f) {
  const m = storeShelfMid(f), a = S.mats[f] || [], cap = storeShelfCap(f);
  if (m && !a.slice(0, cap).some(n => n > 0) && (S.mats[m] || []).some(n => n > 0)) return storeShelfGradeOf(S.mats[m], cap);
  return storeShelfGrade(f);
}
// The stacks of the first view, in family order: the gathered families, then coal.
const STORE_SHELF = CRAFT_FAMILIES.concat(['coal']);
// The hide stack waits until Hunting shows, unless you already hold hide. Coal shows once the Forge is built or coal is held.
const storeShelfShows = f => f === 'coal' ? ((S.mats.coal || [])[0] || 0) > 0 || (typeof refineOn === 'function' && refineOn() && typeof campLevel === 'function' && campLevel('forge') >= 1)
  : f !== 'hide' || huntingVisible() || (S.mats[f] || []).some(n => n > 0);
// ---- end of the shelf rule ----

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
  const FOUGHT = f => f !== 'coal' && !REFINE_RAW[f] && !(CRAFT_FAMILY[f] && CRAFT_FAMILY[f].skill);   // essence only (hide is Hunting's since C24); never coal or a middle
  // refine-queues: middles and coal open their own "where to get it" (75-refine-ui), not the gathering one
  const where = (f, t) => (f === 'coal' || REFINE_RAW[f]) && typeof refineUI === 'object' && refineUI ? refineUI.where(f, t) : whereSheet(f, t);
  const famNote = f => {
    if (f === 'coal') return 'from Copper Ore';
    if (REFINE_RAW[f]) return `made at the ${CAMP_B[REFINE_PRODUCTS[f].st].n}`;
    if (FOUGHT(f)) return 'from fights';
    const sk = CRAFT_FAMILY[f].skill, s = S.skills[sk]; return s ? `${SKILL[sk]} ${s.lv}` : SKILL[sk];
  };
  const any = f => (S.mats[f] || []).some(n => n > 0);
  const FILTERS = [['all', 'All'], ...CRAFT_FAMILIES.filter(f => !FOUGHT(f)).map(f => [f, MAT[f].n]), ['fought', 'Fought'], ['troph', 'Trophies']];
  const SORTS = [['full', 'Fullest'], ['name', 'Name']];
  const shelfHas = storeShelfShows;
  const held = (f, t) => f === 'ess' ? essHave() : Math.max(0, S.mats[f][t - 1] || 0);
  const capOf = (f, t) => f === 'ess' ? essCap() : storeCap(f, t);
  let V = null, filter = 'all', sort = 'full', showAll = false, showEmpty = false, showTro = false;

  function cell(f, t) {
    const c = btn('mat sh-cell');
    c.setAttribute('aria-label', `${matName(f, t)}: where to get it`);
    const n = el('span', 'mc', '0'), cap = el('span', 'sh-cap'), bar = el('i', 'sh-bar'), fill = el('b'); bar.append(fill);
    c.append(n, el('div', 'mn', f === 'ess' ? 'Essence' : MAT[f].short[t - 1]), bar);
    c.addEventListener('click', () => where(f, t));
    return { c, n, cap, fill, f, t };
  }
  // A shelf stack: icon, name, held / cap, a bar, and the middle of the same grade beside it (refine-queues). Its grade moves
  // with storeShelfPick, so it is built once per family. Coal has no icon (text only until its art passes).
  function stack(f) {
    const c = btn('sh-stack');
    const ic = img(matIcon(f, 1)), tx = el('span', 'sh-stack-tx'), nm = el('span', 'sh-stack-nm'), n = el('span', 'sh-stack-n');
    const mid = el('span', 'sh-stack-mid'); mid.hidden = true;
    const bar = el('i', 'sh-bar'), fill = el('b'); bar.append(fill);
    tx.append(nm, n, mid, bar); c.append(ic, tx);
    c.dataset.fam = f;
    const x = { c, ic, nm, n, mid, fill, f, t: 1 };
    c.addEventListener('click', () => where(f, x.t));
    return x;
  }
  // A cell's held, cap, bar and warn/full/over marks (shelf stacks and grade cells alike).
  function mark(x, v, cap) {
    const cf = Number.isFinite(cap);
    putHidden(x.fill.parentNode, !cf);
    if (cf) putStyle(x.fill, 'width', Math.min(100, v / Math.max(1, cap) * 100).toFixed(1) + '%');
    putToggle(x.c, 'none', !v);
    putToggle(x.c, 'sh-warn', cf && v >= cap * STORE_TUNE.warn && v < cap);
    putToggle(x.c, 'sh-full', cf && v >= cap && v > 0 && v <= cap);
    putToggle(x.c, 'sh-over', cf && v > cap);
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
    // filter chips (wrap to a second row when narrow; no view swipe), then sort chips and "Show all grades"
    const chips = el('div', 'sh-chips'); chips.dataset.noswipe = '';
    for (const [id, label] of FILTERS) {
      const b = btn('sh-fchip', label); b.setAttribute('aria-pressed', String(id === filter));
      b.addEventListener('click', () => { filter = id; ui(true); });
      chips.append(b); V.chips[id] = b;
    }
    const tools = el('div', 'sh-chips sh-tools'); tools.dataset.noswipe = '';
    V.sortl = el('span', 'sh-sortl', 'Sort'); tools.append(V.sortl);
    V.sorts = {};
    for (const [id, label] of SORTS) {
      const b = btn('sh-fchip sh-sort', label);
      b.addEventListener('click', () => { sort = id; ui(true); });
      tools.append(b); V.sorts[id] = b;
    }
    V.all = btn('sh-fchip sh-all', 'Show all grades');
    V.all.addEventListener('click', () => { showAll = !showAll; ui(true); });
    tools.append(V.all);
    // the shelf: one stack per family
    V.shelf = el('div', 'sh-shelf'); V.stacks = {};
    for (const f of STORE_SHELF) { const x = stack(f); V.shelf.append(x.c); V.stacks[f] = x; }
    // families (then the middles and coal, shown once held)
    const fams = el('div', 'sh-fams');
    for (const f of STOCK_FAMILIES) {
      const s = el('div', 'sec sh-fam'), h = el('div', 'sec-head'), tt = el('h2', 'sec-title', MAT[f].n), nt = el('span', 'note');
      h.append(tt, nt);
      const row = el('div', 'mat-row sh-row'), cells = [];
      for (let t = 1; t <= (f === 'ess' || f === 'coal' ? 1 : 5); t++) { const x = cell(f, t); row.append(x.c); cells.push(x); }   // Essence is one pile; coal one grade
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
    sec.append(card, chips, tools, V.shelf, fams, V.empty, V.tro, V.troRow, note);
    // icons last: 35 cells, only on the view's first show (coal and the middles have none: their names show alone)
    for (const f of CRAFT_FAMILIES) for (const x of V.fams[f].cells) x.c.prepend(img(matIcon(f, x.t)));
  }
  function update() {
    // top card
    const lv = storeLevel(), g = storeCapAt('ore', 1, lv), h = storeCapAt('hide', 1, lv), fin = Number.isFinite(g);
    putText(V.title, lv ? `Storehouse Lv ${lv}` : 'Storehouse');
    const nFull = fin ? storeFullCells().length : 0;
    putText(V.sub, !fin ? 'No limits on materials.' : (lv ? '' : 'Not built yet. ') + `Holds ${gxNum(g)} of each. Hide, essence and refined goods ${gxNum(h)}.` + (nFull ? ` ${nFull === 1 ? '1 pile is' : nFull + ' piles are'} full.` : ''));
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
    // sort and "Show all grades". The shelf is the first view; a family filter (or the toggle) shows every grade.
    for (const [id] of SORTS) { putHidden(V.sorts[id], filter !== 'all'); putAttr(V.sorts[id], 'aria-pressed', String(sort === id)); putToggle(V.sorts[id], 'on', sort === id); }
    putHidden(V.sortl, filter !== 'all');   // sorting only changes the All view
    const fam1 = filter !== 'all' && filter !== 'fought' && filter !== 'troph';
    putHidden(V.all, filter !== 'all');
    putText(V.all, showAll ? 'Show one grade' : 'Show all grades');
    putAttr(V.all, 'aria-pressed', String(showAll));
    putToggle(V.all, 'on', showAll);
    const grades = filter !== 'troph' && (fam1 || (filter === 'all' && showAll));
    const shelf = filter !== 'troph' && !grades;
    // the order: fullest first (by the shelf grade's fill) or by name; empty stacks last; ties keep the family order
    const gradeOf = f => f === 'ess' || f === 'coal' ? 1 : storeShelfPick(f);
    const fillOf = f => { const t = gradeOf(f), c = capOf(f, t), v = held(f, t); return Number.isFinite(c) && c > 0 ? v / c : v > 0 ? 1e-9 : -1; };
    const nameOf = f => f === 'ess' ? 'Essence' : matName(f, gradeOf(f));
    const order = STOCK_FAMILIES.slice();
    if (sort === 'name') order.sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
    else { const fl = Object.fromEntries(order.map(f => [f, fillOf(f)])); order.sort((a, b) => fl[b] - fl[a] || STOCK_FAMILIES.indexOf(a) - STOCK_FAMILIES.indexOf(b)); }
    putHidden(V.shelf, !shelf);
    for (const f of STORE_SHELF) {
      const x = V.stacks[f], show = shelf && shelfHas(f) && (filter === 'all' || (filter === 'fought' && FOUGHT(f)));
      putHidden(x.c, !show);
      if (!show) continue;
      putStyle(x.c, 'order', String(order.indexOf(f)));
      const t = gradeOf(f), v = held(f, t), cap = capOf(f, t), cf = Number.isFinite(cap);
      if (x.t !== t || !x.drawn) { x.t = t; x.drawn = true; const u = matIcon(f, t); putHidden(x.ic, !u); if (u) putAttr(x.ic, 'src', u); }
      putText(x.nm, f === 'ess' ? 'Essence' : matName(f, t));
      putText(x.n, cf ? `${gxNum(v)} / ${gxNum(cap)}` : `${gxNum(v)} held`);
      mark(x, v, cap);
      // the middle of the same grade, beside the raw stack ("Iron Ingot 40")
      const m = storeShelfMid(f), mv = m ? held(m, t) : 0;
      putHidden(x.mid, !(mv > 0)); putText(x.mid, mv > 0 ? `${matName(m, t)} ${gxNum(mv)}` : '');
      if (mv > 0) putToggle(x.c, 'none', false);
      putAttr(x.c, 'aria-label', `${f === 'ess' ? 'Essence' : matName(f, t)}: ${storeNum(v)}${cf ? ' of ' + storeNum(cap) : ''}${mv > 0 ? `, ${matName(m, t)} ${storeNum(mv)}` : ''}. Where to get it`);
    }
    // every grade: families as rows (a middle or coal row only once held; a family filter shows its middle and ore shows coal)
    const empty = [];
    for (const f of STOCK_FAMILIES) {
      const F = V.fams[f], has = any(f), extra = f === 'coal' || !!REFINE_RAW[f], home = f === 'coal' ? 'ore' : REFINE_RAW[f];
      const inFilter = filter === 'all' || filter === f || (extra && filter === home) || (filter === 'fought' && FOUGHT(f));
      if (grades && !has && inFilter && filter === 'all' && !extra && shelfHas(f)) empty.push(f);
      const show = grades && inFilter && (extra ? has : (has || showEmpty || filter !== 'all') && (filter !== 'all' || shelfHas(f)));
      putHidden(F.s, !show);
      if (!show) continue;
      putStyle(F.s, 'order', String(order.indexOf(f)));
      putText(F.nt, famNote(f));
      for (const x of F.cells) {
        const v = held(f, x.t), cap = capOf(f, x.t), cf = Number.isFinite(cap);
        putText(x.n, gxNum(v));
        mark(x, v, cap);
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
    const mir = (S.party && S.party.mirrors) || 0;
    putText(V.troL, `Rare finds: ${troN} of ${CRAFT_TROPHIES.length} Trophy kinds` + (mir ? ` · ${mir} Mirror${mir === 1 ? '' : 's'} of Embers` : ''));   // Trophies and Mirrors are Materials (counters-and-layers)
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
