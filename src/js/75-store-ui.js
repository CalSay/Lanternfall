// 75-store-ui: the Storehouse in the Gather tab (task H3, docs/design/hearth-and-hands.md 4.4).
// Browser-only; the rules live in 55-store.js. The Storehouse's own card is the Camp's building
// list (75-camp-ui.js); its icon is registered here.
//   - Node views: a "Storehouse full" chip under the status strip, with Switch (the next node of the
//     same skill that is not full) and, from Lv 3, the Spillover toggle.
//   - Node rows and pack cells: "Oak 300/300", amber from 90%, red and "Full" at the cap, amber
//     "Over" above it (72-ui-gather.js calls storeHeld / storeCell / storePackLine).
//   - Pack view: one line with the level and the caps.
//   - Salvage: storeSalvageNote(preview, t) for the Craft tab's in-page ask.

registerIcons({
  b_store: ['............', '.6666666666.', '.6111111116.', '.6155555516.', '.6111111116.', '.6666666666.', '.6111111116.', '.6111771116.', '.6111771116.', '.6111111116.', '.6666666666.', '............']
});
const STORE_ICON = () => iconURL('b_store', '#8C6A43', { 6: '#4A3220', 5: '#B08A5A', 7: '#F2C14E' });

// "Oak 300/300" (the node rows' held line). No cap (sim --store 0): "Oak 300 held".
function storeHeld(k, t) {
  const h = S.mats[k][t - 1] || 0, cap = storeCap(k, t), nm = MAT[k].short[t - 1];
  if (!Number.isFinite(cap)) return `${nm} ${storeNum(h)} held`;
  return `${nm} ${storeNum(h)}/${storeNum(cap)}` + (h > cap ? ' · Over the cap' : h >= cap ? ' · Full' : '');
}
function storeLvl(e, k, t) {
  const h = S.mats[k][t - 1] || 0, cap = storeCap(k, t);
  putToggle(e, 'st-warn', h >= cap * STORE_TUNE.warn && h < cap);
  putToggle(e, 'st-full', h >= cap && h > 0 && h <= cap);
  putToggle(e, 'st-over', h > cap);
}
// The stage's held line: "640/1,000 in pack", "1,000/1,000 · Full".
function storeStage(k, t) {
  const h = S.mats[k][t - 1] || 0, cap = storeCap(k, t);
  if (!Number.isFinite(cap)) return `${fmt(h)} in pack`;
  const n = h < 1e5 ? storeNum(h) : fmt(h), c = cap < 1e5 ? storeNum(cap) : fmt(cap);
  return `${n}/${c} ` + (h > cap ? '· Over the cap' : h >= cap ? '· Full' : 'in pack');
}
// A pack cell: a cap line and a thin bar under the count.
function storeCell(c, k, t, v) {
  if (!c._st) {
    const cap = el('span', 'st-cap'), bar = el('i', 'st-bar'), fill = el('b'); bar.append(fill);
    c.querySelector('.mc').after(cap, bar);
    c._st = { cap, fill };
  }
  const cap = storeCap(k, t), fin = Number.isFinite(cap);
  putHidden(c._st.cap, !fin); putHidden(c._st.fill.parentNode, !fin);
  if (!fin) return;
  putText(c._st.cap, v > cap ? 'Over' : v >= cap ? 'Full' : '/' + storeNum(cap));
  putStyle(c._st.fill, 'width', Math.min(100, v / cap * 100) + '%');
  storeLvl(c, k, t);
}
// The "where to get it" sheet's first line.
function storePackLine(k, t) {
  const h = S.mats[k][t - 1] || 0, cap = storeCap(k, t);
  if (!Number.isFinite(cap)) return `${storeNum(h)} in your pack · Tier ${t}`;
  return `${storeNum(h)}/${storeNum(cap)} in your pack · Tier ${t}` + (h > cap ? `. Over the cap: spend below ${storeNum(cap)} to gather more.` : h >= cap ? '. Storehouse full.' : '');
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
  // ---- the full chip on the node views ----
  let chip = null;
  registerSection('gat', {
    id: 'store-chip', view: 'mine wood forage',
    mount(sec) {
      sec.classList.add('st-sec');
      if (typeof gNow === 'object' && gNow.box) gNow.box.after(sec);
      chip = { box: el('div', 'st-chip'), txt: el('div', 'st-txt'), acts: el('div', 'st-acts') };
      const ic = el('span', 'st-ic'); ic.append(img(STORE_ICON()));
      chip.sw = btn('mini go', 'Switch');
      chip.sw.addEventListener('click', () => { storeSwitch(); ui(true); });
      chip.sp = btn('mini st-spill', 'Spillover');
      chip.sp.addEventListener('click', () => { storeSpill(!S.store.spill); ui(true); });
      chip.acts.append(chip.sw, chip.sp);
      chip.box.append(ic, chip.txt, chip.acts);
      sec.append(chip.box);
    },
    update() {
      const sec = chip.box.parentNode;
      const on = S.activity === 'gather', k = S.node.kind, t = S.node.t;
      const full = on && stashFull(k, t), lv3 = storeLevel() >= STORE_TUNE.spill;
      putHidden(sec, !full);
      if (!full) return;
      const over = stashOver(k, t);
      putText(chip.txt, over ? `${matName(k, t)}: ${storeWhy(k, t)} ${SKILL[skillOf(k)]} XP still counts.`
        : `Storehouse full: ${matName(k, t)}. ${SKILL[skillOf(k)]} XP still counts.`);
      putToggle(chip.box, 'over', over);
      const nx = storeNextNode(k);
      putHidden(chip.sw, !nx);
      if (nx) putAttr(chip.sw, 'aria-label', `Switch to the ${NODE_NAMES[nx.kind][nx.t - 1]}`);
      putHidden(chip.sp, !lv3);
      if (lv3) { putText(chip.sp, S.store.spill ? 'Spillover on' : 'Spillover off'); putToggle(chip.sp, 'on', !!S.store.spill); putAttr(chip.sp, 'aria-pressed', String(!!S.store.spill)); }
    }
  });

  // ---- the pack view: level and caps ----
  let sum = null;
  registerSection('gat', {
    id: 'store-sum', view: 'pack',
    mount(sec) {
      sec.classList.add('st-sec');
      // inside the Pack's own block, which already shows only on the pack view
      const grid = $('matGrid'); if (grid) { grid.before(sec); delete sec.dataset.view; sec.classList.remove('off-view'); }
      sum = { p: el('p', 'note st-sum'), go: btn('mini go', 'Storehouse') };
      sum.go.addEventListener('click', () => setTab('world', '#camp-b-store'));
      const row = el('div', 'st-sumrow'); row.append(sum.p, sum.go);
      sec.append(row);
    },
    update() {
      const lv = storeLevel(), g = storeCapAt('ore', 1, lv), h = storeCapAt('hide', 1, lv);
      if (!Number.isFinite(g)) { putText(sum.p, 'No limits on materials.'); putHidden(sum.go, true); return; }
      const n = storeFullCells().length;
      putText(sum.p, (lv ? `Storehouse Lv ${lv}: holds ${storeNum(g)} of each, ${storeNum(h)} hide and essence.` : `Your packs hold ${storeNum(g)} of each, ${storeNum(h)} hide and essence.`) + (n ? ` ${n === 1 ? '1 pile is' : n + ' piles are'} full.` : ''));
      putHidden(sum.go, !(typeof campOpen === 'function' && campOpen()));
    }
  });
}
