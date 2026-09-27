// 72-ui-gather: the Gather tab (skills, nodes for every family, home ground, pack, trophies).
// K5 kept this minimal; K8 redoes the tab (pouch, camp).

// ================= Gather panel =================
const skillCards = ['mine', 'wood', 'forage'].map(k => {
  const c = el('div', 'skill');
  const sn = el('span', 'sn');
  const ic = k === 'mine' ? iconURL('pick', '#A9B1BD') : k === 'wood' ? iconURL('axe', '#A9B1BD') : iconURL(...craftIcon('sickle', 1));
  sn.append(img(ic), el('span', null, SKILL[k]));
  const sl = el('span', 'sl'); const bar = el('div', 'bar'); const bi = el('i'); bar.append(bi);
  c.append(sn, sl, bar); $('skillCards').append(c);
  return { k, lv: sl, bar: bi };
});

// Home ground: which family the camp's zone boosts.
const homeNote = el('p', 'note gat-home');
$('skillCards').after(homeNote);

// Foraging section, built here so shell.html stays as it is.
{
  const sec = el('div', 'sec');
  sec.append(el('h2', 'sec-title', SKILL.forage), Object.assign(el('div', 'sec'), { id: 'forageRows' }));
  $('woodRows').parentElement.after(sec);
}
const NODE_VERB = { ore: 'Mine', crystal: 'Mine', wood: 'Chop', fibre: 'Cut', herb: 'Pick' };
const NODE_BOX = { ore: 'oreRows', crystal: 'oreRows', wood: 'woodRows', fibre: 'forageRows', herb: 'forageRows' };
const nodeRows = {};
for (const kind of GATHER_KINDS) {
  const box = $(NODE_BOX[kind]);
  if (kind !== 'wood') box.append(el('div', 'gat-sub', CRAFT_NODES[kind].row)); // Veins / Geodes, Fibre patches / Herb beds
  nodeRows[kind] = [];
  for (let t = 1; t <= 5; t++) {
    const r = makeRow(box, NODE_NAMES[kind][t - 1], false, matIcon(kind, t));
    r.btn.classList.add('work');
    r.btn.addEventListener('click', () => {
      if (!setNode(kind, t)) return;
      if (S.activity !== 'gather') setActivity('gather'); else { toast(`Your party moves to the ${NODE_NAMES[kind][t - 1]}.`, 'good'); ui(true); }
    });
    nodeRows[kind].push(r);
  }
}

// Pack: every family by tier, then trophies.
const matCells = {};
for (const k of CRAFT_FAMILIES) {
  const row = el('div', 'mat-row'); matCells[k] = [];
  for (let t = 1; t <= 5; t++) {
    const c = el('div', 'mat'); c.title = whereToGet(k, t);
    const n = el('span', 'mc', '0');
    c.append(img(matIcon(k, t)), n, el('div', 'mn', MAT[k].short[t - 1]));
    row.append(c); matCells[k].push({ c, n });
  }
  $('matGrid').append(row);
}
const trophyCells = [];
{
  const row = el('div', 'mat-row gat-tro');
  CRAFT_TROPHIES.forEach((tr, i) => {
    const c = el('div', 'mat'); c.title = `${tr.n}: from champions and zone bosses (zone ${CRAFT_TROPHY_SRC.firstBossFrom} on).`;
    const n = el('span', 'mc', '0');
    c.append(img(iconURL(...craftIcon('tro_' + TYPES[i].key))), n, el('div', 'mn', tr.n.split(' ')[1] || tr.n));
    row.append(c); trophyCells.push({ c, n });
  });
  $('matGrid').append(el('div', 'gat-sub', 'Trophies'), row);
  $('matGrid').nextElementSibling.textContent = 'Hide and essence drop from monsters while you fight. Higher zones drop better tiers. Champions and zone bosses leave Trophies.';
}

function uiGather() {
  for (const c of skillCards) {
    const sk = S.skills[c.k];
    c.lv.textContent = 'Lv ' + sk.lv;
    c.bar.style.width = Math.min(100, sk.xp / skillNeed(sk.lv) * 100) + '%';
  }
  const home = homeFamily(), hb = homeBonus(home);
  homeNote.textContent = `Camp: ${zoneName(S.zone)}. ${MAT[home].n} gathered here gives +${Math.round(hb * 100)}%.` + (hb < CRAFT_HOME_BONUS.starred ? ` ${CRAFT_HOME_BONUS.stars} mastery stars here make it +${CRAFT_HOME_BONUS.starred * 100}%.` : '');
  for (const kind of GATHER_KINDS) {
    const lv = S.skills[skillOf(kind)].lv, ym = mod('yield:' + kind), hk = homeBonus(kind);
    nodeRows[kind].forEach((r, i) => {
      const t = i + 1, req = NODE_REQ[i], open = lv >= req;
      const here = S.activity === 'gather' && S.node.kind === kind && S.node.t === t;
      const prevOpen = i === 0 || lv >= NODE_REQ[i - 1];
      r.row.hidden = !open && !prevOpen;
      r.row.classList.toggle('locked', !open);
      r.row.classList.toggle('active', here);
      r.ic.classList.toggle('ghost', !open);
      r.own.textContent = open ? `${fmt(S.mats[kind][i])} held` : `Needs Lv ${req}`;
      const per = nodeTime(kind, t), yieldAvg = nodeYieldAvg(kind) * ym;
      r.desc.textContent = open ? `${per.toFixed(1)}s per swing · ${fmt(60 / per * yieldAvg)} per minute${hk ? ` · home +${Math.round(hk * 100)}%` : ''}` : `Reach ${SKILL[skillOf(kind)]} level ${req} to work here.`;
      r.qty.textContent = here ? 'Working' : open ? NODE_VERB[kind] : 'Locked';
      r.btn.querySelector('.price').textContent = here ? '...' : open ? 'Go' : `Lv ${req}`;
      r.btn.disabled = !open || here;
    });
  }
  for (const k of CRAFT_FAMILIES) matCells[k].forEach(({ c, n }, i) => { const v = S.mats[k][i] || 0; n.textContent = fmt(v); c.classList.toggle('none', !v); });
  trophyCells.forEach(({ c, n }, i) => { const v = S.craft.troph[i] || 0; n.textContent = fmt(v); c.classList.toggle('none', !v); });
}
