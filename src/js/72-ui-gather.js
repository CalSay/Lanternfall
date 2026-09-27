// 72-ui-gather: the Gather tab (skills, nodes, pack).

// ================= Gather panel =================
const skillCards = ['mine', 'wood', 'smith'].map(k => {
  const c = el('div', 'skill');
  const sn = el('span', 'sn');
  sn.append(img(k === 'mine' ? iconURL('pick', '#A9B1BD') : k === 'wood' ? iconURL('axe', '#A9B1BD') : iconURL('anvil', '#6E6878')), el('span', null, SKILL[k]));
  const sl = el('span', 'sl'); const bar = el('div', 'bar'); const bi = el('i'); bar.append(bi);
  c.append(sn, sl, bar); $('skillCards').append(c);
  return { k, lv: sl, bar: bi };
});
const nodeRows = { ore: [], wood: [] };
for (const kind of ['ore', 'wood']) {
  for (let t = 1; t <= 5; t++) {
    const r = makeRow($(kind === 'ore' ? 'oreRows' : 'woodRows'), NODE_NAMES[kind][t - 1], false, matIcon(kind, t));
    r.btn.classList.add('work');
    r.btn.addEventListener('click', () => {
      if (!setNode(kind, t)) return;
      if (S.activity !== 'gather') setActivity('gather'); else { toast(`Your party moves to the ${NODE_NAMES[kind][t - 1]}.`, 'good', null, 'low'); ui(true); }
    });
    nodeRows[kind].push(r);
  }
}
const matCells = {};
for (const k of ['ore', 'wood', 'ess']) {
  const row = el('div', 'mat-row'); matCells[k] = [];
  for (let t = 1; t <= 5; t++) {
    const c = el('div', 'mat'); c.title = matName(k, t);
    const n = el('span', 'mc', '0');
    c.append(img(matIcon(k, t)), n, el('div', 'mn', MAT[k].short[t - 1]));
    row.append(c); matCells[k].push(n);
  }
  $('matGrid').append(row);
}

function uiGather() {
  for (const c of skillCards) {
    const sk = S.skills[c.k];
    c.lv.textContent = 'Lv ' + sk.lv;
    c.bar.style.width = Math.min(100, sk.xp / skillNeed(sk.lv) * 100) + '%';
  }
  for (const kind of ['ore', 'wood']) {
    nodeRows[kind].forEach((r, i) => {
      const t = i + 1, req = NODE_REQ[i], lv = S.skills[skillOf(kind)].lv, open = lv >= req;
      const here = S.activity === 'gather' && S.node.kind === kind && S.node.t === t;
      const prevOpen = i === 0 || lv >= NODE_REQ[i - 1];
      r.row.hidden = !open && !prevOpen;
      r.row.classList.toggle('locked', !open);
      r.row.classList.toggle('active', here);
      r.ic.classList.toggle('ghost', !open);
      r.own.textContent = open ? `${fmt(S.mats[kind][i])} held` : `Needs Lv ${req}`;
      const per = nodeTime(kind, t), yieldAvg = nodeYieldAvg(kind);
      r.desc.textContent = open ? `${per.toFixed(1)}s per swing · ${fmt(60 / per * yieldAvg)} per minute · ${nodeXp(t)} xp` : `Reach ${SKILL[skillOf(kind)]} level ${req} to work here.`;
      r.qty.textContent = here ? 'Working' : open ? (kind === 'ore' ? 'Mine' : 'Chop') : 'Locked';
      r.btn.querySelector('.price').textContent = here ? '...' : open ? 'Go' : `Lv ${req}`;
      r.btn.disabled = !open || here;
    });
  }
  for (const k of ['ore', 'wood', 'ess']) matCells[k].forEach((n, i) => { n.textContent = fmt(S.mats[k][i]); });
}
