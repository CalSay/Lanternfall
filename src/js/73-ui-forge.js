// 73-ui-forge: the Craft tab's shell (tab id stays 'forge'). The old Forge picker, equipped rows
// and bag list are retired: 75-craft-ui.js (K7) builds stations, recipes, gear, bag and the item
// sheet as sections of this tab (registerSection). This file keeps the wall of uniques.

// Retire the old Forge markup in src/shell.html (equipped rows, forge card, bag list).
for (const id of ['eqRows', 'bagRows']) { const n = $(id); const sec = n && n.closest('#p-forge > .sec'); if (sec) sec.remove(); }
{ const b = $('forgeBtn'); const card = b && b.closest('.card'); if (card) card.remove(); }
// "Trophies" now means boss trophies (crafting material), so the uniques wall gets a plainer name.
{ const h = $('trophies').closest('.sec').querySelector('.sec-title'); if (h) h.textContent = 'Unique loot'; }

const trophyEls = {};
for (const [key, u] of Object.entries(UNIQ)) {
  const c = el('div', 'trophy');
  const tile = icTile(itemIcon(u.slot, 3, key), null, 'ghost');
  const tn = el('span', 'tn'), ts1 = el('span', 'ts'), ts2 = el('span', 'ts');
  c.append(tile, tn, ts1, ts2); $('trophies').append(c);
  trophyEls[key] = { c, tile, tn, ts1, ts2 };
}
function renderTrophies() {
  let n = 0;
  for (const [key, u] of Object.entries(UNIQ)) {
    const f = S.found[key], e = trophyEls[key]; if (f) n++;
    putClass(e.c, 'trophy' + (f ? ' found' : ''));
    setIc(e.tile, itemIcon(u.slot, f || 3, key), f ? 'legendary' : null, f ? '' : 'ghost');
    putText(e.tn, f ? u.name : '???'); putClass(e.tn, 'tn' + (f ? ' rar-legendary' : ''));
    putText(e.ts1, f ? `${SLOT[u.slot].n} · best ${MAT.ore.short[f - 1]} tier` : u.src);
    putText(e.ts2, f ? u.txt : 'Not found yet');
  }
  putText($('trophyCount'), `${n} / ${Object.keys(UNIQ).length} uniques`);
}

function uiForge() { renderTrophies(); }
