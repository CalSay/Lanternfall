// 73-ui-forge: the Forge tab (equipped, forge card, bag, trophy wall).

// ================= Forge panel =================
SLOTS.forEach(s => { const b = el('button', null, s.n); b.dataset.slot = s.id; b.addEventListener('click', () => { S.fSlot = s.id; ui(true); }); $('slotSeg').append(b); });
for (let t = 1; t <= 5; t++) { const b = el('button', null, MAT.ore.short[t - 1]); b.dataset.tier = t; b.addEventListener('click', () => { S.fTier = t; ui(true); }); $('tierSeg').append(b); }
$('forgeBtn').addEventListener('click', () => { if (forgeItem(S.fSlot, S.fTier)) ui(true); });

const eqRows = {};
SLOTS.forEach(s => {
  const row = el('div', 'row has-ic');
  const tile = icTile(itemIcon(s.id, 1)); tile.classList.add('ghost');
  const body = el('div');
  body.innerHTML = '<div class="slotname"></div><div class="iname"></div><div class="row-desc"></div><div class="row-fx"></div><div class="costs" style="margin-top:6px"></div>';
  const btns = el('div', 'btns'); const btn = el('button', 'mini go', 'Upgrade'); btns.append(btn);
  row.append(tile, body, btns);
  body.querySelector('.slotname').textContent = s.n;
  btn.addEventListener('click', () => { if (upgradeEquipped(s.id)) ui(true); });
  $('eqRows').append(row);
  eqRows[s.id] = { row, tile, name: body.querySelector('.iname'), desc: body.querySelector('.row-desc'), fx: body.querySelector('.row-fx'), costs: body.querySelector('.costs'), btn };
});

const bagRows = new Map();
function renderBag() {
  const box = $('bagRows');
  const list = S.items.filter(i => !Object.values(S.equip).includes(i.id)).sort((a, b) => itemPower(b) - itemPower(a));
  $('bagCount').textContent = `${bagCount()} / ${CRAFT_BAG_MAX}`;
  const keep = new Set(list.map(i => i.id));
  for (const [id, r] of bagRows) if (!keep.has(id)) { r.row.remove(); bagRows.delete(id); }
  const empty = box.querySelector(':scope > .note');
  if (!list.length) { if (!empty) box.append(el('p', 'note', 'Forged gear and boss loot land here.')); return; }
  if (empty) empty.remove();
  const order = list.map(i => i.id).join(',');
  const reorder = order !== renderBag.order; renderBag.order = order;
  list.forEach(it => {
    let r = bagRows.get(it.id);
    if (!r) {
      const row = el('div', 'row has-ic');
      const tile = icTile(itemIcon(it.slot, it.t, it.u), it.r);
      const body = el('div'); body.innerHTML = '<div class="slotname"></div><div class="iname"></div><div class="row-desc"></div><div class="row-fx"></div>';
      const btns = el('div', 'btns'); const eq = el('button', 'mini go', 'Equip'); const sv = el('button', 'mini warn', 'Salvage'); btns.append(eq, sv);
      row.append(tile, body, btns);
      eq.addEventListener('click', () => { if (equipItem(it.id)) ui(true); });
      sv.addEventListener('click', () => {
        if (sv.dataset.arm && Date.now() - +sv.dataset.arm < 3000) { if (salvageItem(it.id)) ui(true); return; }
        sv.dataset.arm = Date.now(); sv.textContent = 'Confirm';
        setTimeout(() => { if (sv.isConnected) { sv.textContent = 'Salvage'; delete sv.dataset.arm; } }, 3000);
      });
      r = { row, slot: body.querySelector('.slotname'), name: body.querySelector('.iname'), desc: body.querySelector('.row-desc'), fx: body.querySelector('.row-fx') };
      bagRows.set(it.id, r);
    }
    if (reorder || !r.row.isConnected) box.append(r.row);
    const cur = equipped(it.slot), d = itemPower(it) - (cur ? itemPower(cur) : 0);
    r.row.className = 'row has-ic' + (it.u ? ' rb-legendary' : '');
    r.slot.textContent = '';
    r.slot.append(el('span', null, `${SLOT[it.slot].n} · ${RAR[it.r].n} `), el('span', 'delta ' + (d > 0 ? 'up' : 'down'), d > 0 ? `+${fmt(d)} power vs equipped` : d < 0 ? `${fmt(d)} power` : 'same power'));
    r.name.textContent = itemName(it); r.name.className = 'iname rar-' + it.r;
    r.desc.textContent = slotStats(it.slot, itemPower(it));
    r.fx.textContent = it.u ? UNIQ[it.u].txt : ''; r.fx.hidden = !it.u;
  });
}
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
    e.c.className = 'trophy' + (f ? ' found' : '');
    setIc(e.tile, itemIcon(u.slot, f || 3, key), f ? 'legendary' : null, f ? '' : 'ghost');
    e.tn.textContent = f ? u.name : '???'; e.tn.className = 'tn' + (f ? ' rar-legendary' : '');
    e.ts1.textContent = f ? `${SLOT[u.slot].n} · best ${MAT.ore.short[f - 1]} tier` : u.src;
    e.ts2.textContent = f ? u.txt : 'Not found yet';
  }
  $('trophyCount').textContent = `${n} / ${Object.keys(UNIQ).length} uniques`;
}

function uiForge() {
  const sm = S.skills.smith;
  $('smithLbl').textContent = `Smithing Lv ${sm.lv}`;
  $('smithBar').style.width = Math.min(100, sm.xp / skillNeed(sm.lv) * 100) + '%';
  for (const s of SLOTS) {
    const r = eqRows[s.id], it = equipped(s.id);
    if (!it) {
      setIc(r.tile, itemIcon(s.id, 1), null, 'ghost');
      r.name.textContent = 'Empty'; r.name.className = 'iname'; r.name.style.color = 'var(--muted)';
      r.desc.textContent = `Forge a ${s.n.toLowerCase()} below.`; r.fx.hidden = true; r.costs.textContent = ''; r.btn.hidden = true; r.row.className = 'row has-ic';
      continue;
    }
    setIc(r.tile, itemIcon(s.id, it.t, it.u), it.r);
    r.name.style.color = '';
    r.name.textContent = itemName(it); r.name.className = 'iname rar-' + it.r;
    r.row.className = 'row has-ic' + (it.u ? ' rb-legendary' : '');
    r.desc.textContent = `${RAR[it.r].n} · ${slotStats(s.id, itemPower(it))}`;
    r.fx.textContent = it.u ? UNIQ[it.u].txt : ''; r.fx.hidden = !it.u;
    r.btn.hidden = false;
    if (it.plus >= 10) { r.costs.textContent = ''; r.btn.textContent = 'Max +10'; r.btn.disabled = true; continue; }
    const c = upgradeCost(it);
    costChips(r.costs, c.mats, it.t, c.gold);
    r.btn.textContent = `Upgrade to +${it.plus + 1}`;
    r.btn.disabled = !hasMats(c.mats, it.t) || S.gold < c.gold;
  }
  document.querySelectorAll('#slotSeg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.slot === S.fSlot)));
  document.querySelectorAll('#tierSeg button').forEach(b => {
    const t = +b.dataset.tier; b.setAttribute('aria-pressed', String(t === S.fTier));
    b.textContent = sm.lv >= SMITH_REQ[t - 1] ? MAT.ore.short[t - 1] : `${MAT.ore.short[t - 1]} (Lv ${SMITH_REQ[t - 1]})`;
  });
  const t = S.fTier, slot = S.fSlot, cost = craftCost(slot, t);
  const preview = { slot, t, r: 'common', plus: 0 };
  setIc($('fIc'), itemIcon(slot, t));
  $('fName').textContent = itemName(preview);
  $('fStat').textContent = `Common ${slotStats(slot, TIER_POW[t])} · up to x2.5 at Epic`;
  costChips($('fCost'), cost, t);
  const w = rarityWeights(), tot = Object.values(w).reduce((a, b) => a + b, 0);
  const odds = $('fOdds'); odds.textContent = '';
  for (const [k, v] of Object.entries(w)) odds.append(el('span', 'rar-' + k, `${RAR[k].n} ${(v / tot * 100).toFixed(0)}%`));
  const locked = sm.lv < SMITH_REQ[t - 1];
  const fb = $('forgeBtn');
  fb.disabled = locked || !hasMats(cost, t) || bagFull();
  fb.textContent = locked ? `Needs Smithing Lv ${SMITH_REQ[t - 1]}` : bagFull() ? 'Bag is full' : `Forge ${itemName(preview)}`;
  renderBag();
  renderTrophies();
}
