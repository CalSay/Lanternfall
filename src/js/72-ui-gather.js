// 72-ui-gather: the Gather tab (skills, nodes for every family, home ground, pack, trophies).
// Node views: a status strip (where the party works, the Glint, home ground), then compact node
// rows. Pack: every material is a button that opens "where to get it".

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

// Status strip on the node views (70-ui sub-views): where the party works, the Glint, home ground.
const gNow = {};
{
  const box = el('div', 'gat-now'); box.dataset.view = 'mine wood forage';
  gNow.box = box;
  gNow.what = el('div', 'gn-what'); gNow.glint = el('div', 'gn-glint'); gNow.home = el('div', 'gn-home');
  box.append(gNow.what, gNow.glint, gNow.home);
  $('skillCards').after(box);
}
const homeNote = gNow.home;

// Foraging section, built here so shell.html stays as it is.
{
  const sec = el('div', 'sec'); sec.dataset.view = 'forage';
  sec.append(el('h2', 'sec-title', SKILL.forage), Object.assign(el('div', 'sec'), { id: 'forageRows' }));
  $('woodRows').parentElement.after(sec);  // before the how-to note, which ends each node view
}
const NODE_VERB = { ore: 'Mine', crystal: 'Mine', wood: 'Chop', fibre: 'Cut', herb: 'Pick' };
const NODE_BOX = { ore: 'oreRows', crystal: 'oreRows', wood: 'woodRows', fibre: 'forageRows', herb: 'forageRows' };
const nodeRows = {};
function goNode(kind, t) {
  if (!setNode(kind, t)) return false;
  if (S.activity !== 'gather') setActivity('gather'); else { toast(`You move to the ${NODE_NAMES[kind][t - 1]}.`, 'good', null, 'low'); ui(true); }
  return true;
}
// Node rows: icon with its tier, name, home-ground tag, time per swing and rate, amount held, and
// the Go button. The node the party works shows as "Here" with a gold frame.
// The rows, the pack grid and the trophies (about 75 icons) are built in idle time after boot, one
// part per task, or all at once when the tab first updates (gatherBuild), not at load.
function buildNodeRows(kind) {
  const box = $(NODE_BOX[kind]);
  if (kind !== 'wood') box.append(el('div', 'gat-sub', CRAFT_NODES[kind].row)); // Veins / Geodes, Fibre patches / Herb beds
  const list = el('div', 'sec dz-list gat-list'); box.append(list);
  nodeRows[kind] = [];
  for (let t = 1; t <= 5; t++) {
    const r = makeRow(list, NODE_NAMES[kind][t - 1], false, matIcon(kind, t));
    r.row.classList.add('gat-node');
    r.ic.append(el('span', 'gt-tier', 'T' + t));
    r.home = el('span', 'gt-home', 'Home'); r.home.hidden = true; r.nm.after(r.home);
    r.held = el('div', 'gt-held'); r.desc.after(r.held);
    r.own.remove();
    r.btn.classList.add('work');
    r.btn.addEventListener('click', () => goNode(kind, t));
    nodeRows[kind].push(r);
  }
}

// Pack: every family by tier, then trophies.
// Every material is a button: a tap opens "where to get it" (55-gathering whereToGet), with a Go
// button to the node when a skill gathers it.
const NODE_VIEW_OF = { ore: 'mine', crystal: 'mine', wood: 'wood', fibre: 'forage', herb: 'forage' };
function whereSheet(k, t) {
  if (typeof openSheet !== 'function') return;
  openSheet(api => {
    api.sheet.classList.add('gw-sheet');
    const head = el('div', 'gw-head'), ic = el('div', 'ic gw-ic');
    ic.append(img(matIcon(k, t)));
    const tx = el('div');
    tx.append(el('h2', 'gw-name', matName(k, t)), el('small', 'gw-have', `${fmt(S.mats[k][t - 1] || 0)} in your pack · Tier ${t}`));
    head.append(ic, tx);
    const w = whereToGet(k, t), i = w.indexOf(': ');
    api.body.append(head, el('h3', 'cs-h', 'Where to get it'), el('p', 'gw-where', i < 0 ? w : w.slice(i + 2)));
    if (GATHER_KINDS.includes(k)) {
      const sk = skillOf(k), req = skillReq(sk, t), open = skillTierOpen(sk, t);
      const here = S.activity === 'gather' && S.node.kind === k && S.node.t === t;
      const b = el('button', 'big horn gw-go', here ? 'You work here' : open ? `${NODE_VERB[k]} at the ${NODE_NAMES[k][t - 1]}` : `Needs ${SKILL[sk]} ${req}`);
      b.type = 'button'; b.disabled = !open || here;
      b.addEventListener('click', () => { if (goNode(k, t)) { api.close(); setTab(NODE_VIEW_OF[k]); } });
      api.foot.append(b);
    } else {
      const b = el('button', 'big forge gw-go', 'Go fight'); b.type = 'button';
      b.addEventListener('click', () => { if (S.activity !== 'fight') setActivity('fight'); api.close(); closeMenu(); });
      api.foot.append(b);
    }
  }, { label: 'Where to get ' + matName(k, t), small: true });
}
const matCells = {};
function buildMatGrid() {
  for (const k of CRAFT_FAMILIES) {
    const row = el('div', 'mat-row'); matCells[k] = [];
    for (let t = 1; t <= 5; t++) {
      const c = el('button', 'mat'); c.type = 'button';
      c.setAttribute('aria-label', `${matName(k, t)}: where to get it`);
      const n = el('span', 'mc', '0');
      c.append(img(matIcon(k, t)), n, el('div', 'mn', MAT[k].short[t - 1]));
      c.addEventListener('click', () => whereSheet(k, t));
      row.append(c); matCells[k].push({ c, n });
    }
    $('matGrid').append(row);
  }
}
const trophyCells = [];
function buildTrophies() {
  const row = el('div', 'mat-row gat-tro');
  CRAFT_TROPHIES.forEach((tr, i) => {
    const c = el('div', 'mat'); c.title = `${tr.n}: from champions and zone bosses (zone ${CRAFT_TROPHY_SRC.firstBossFrom} on).`;
    const n = el('span', 'mc', '0');
    c.append(img(iconURL(...craftIcon('tro_' + TYPES[i].key))), n, el('div', 'mn', tr.n.split(' ')[1] || tr.n));
    row.append(c); trophyCells.push({ c, n });
  });
  $('matGrid').append(el('div', 'gat-sub', 'Trophies'), row);
  $('matGrid').nextElementSibling.textContent = 'Tap a material to see where to get it. Hide and essence drop from monsters while you fight. Champions and zone bosses leave Trophies.';
}
// The parts in page order; each runs once.
const gatherParts = GATHER_KINDS.map(kind => () => buildNodeRows(kind)).concat(buildMatGrid, buildTrophies);
let gatherDone = 0;
function gatherStep() { if (gatherDone < gatherParts.length) gatherParts[gatherDone++](); }
function gatherBuild() { while (gatherDone < gatherParts.length) gatherStep(); }
if (typeof idleTask === 'function') for (let i = 0; i < gatherParts.length; i++) idleTask(gatherStep);
else gatherBuild();

// Writes go through the put* guards (70-ui.js), and only the open view's rows update (a view
// switch calls ui(true), so a view is fresh as soon as it shows).
const NODE_VIEW = { oreRows: 'mine', woodRows: 'wood', forageRows: 'forage' };
// 'Working: Copper Vein with your Copper Pickaxe. Your party rests at the Hearth: ...' (G1: 11c toolFor, 55-rested restNote)
function gatherLine() {
  const tool = typeof toolFor === 'function' ? toolFor(skillOf(S.node.kind)) : null;
  return `Working: ${NODE_NAMES[S.node.kind][S.node.t - 1]}${tool ? ` with your ${tool.name}` : ''}.` + (typeof restNote === 'function' ? restNote() : '');
}
function uiGather() {
  gatherBuild();
  const view = curView('gat'), nodeView = view !== 'pack';
  if (nodeView) {
    for (const c of skillCards) {
      const sk = S.skills[c.k];
      putText(c.lv, 'Lv ' + sk.lv);
      putStyle(c.bar, 'width', Math.min(100, sk.xp / skillNeed(sk.lv, c.k) * 100) + '%');
    }
    const home = homeFamily(), hb = homeBonus(home);
    putText(homeNote, `Home ground: ${MAT[home].n} +${Math.round(hb * 100)}% in ${zoneName(S.zone)}.` + (hb < CRAFT_HOME_BONUS.starred ? ` ${CRAFT_HOME_BONUS.stars} mastery stars there: +${CRAFT_HOME_BONUS.starred * 100}%.` : ''));
    const gathering = S.activity === 'gather', g = gathering ? glint() : null;
    putText(gNow.what, gathering ? gatherLine() : S.activity === 'raid' ? 'Your party is at the raid. Pick a node to gather.' : 'Your party is fighting. Pick a node to gather.');
    putToggle(gNow.box, 'on', gathering);
    putHidden(gNow.glint, !gathering);
    if (gathering) {
      putText(gNow.glint, g.on ? `Glint! Tap the stage now for extra (${Math.ceil(g.left)}s)` : 'Glint: now and then the node sparkles. Tap it then for extra.');
      putToggle(gNow.glint, 'lit', g.on);
    }
  }
  for (const kind of GATHER_KINDS) {
    if (NODE_VIEW[NODE_BOX[kind]] !== view) continue;
    const sk = skillOf(kind), top = skillTopTier(sk), ym = mod('yield:' + kind), hk = homeBonus(kind);
    nodeRows[kind].forEach((r, i) => {
      const t = i + 1, req = skillReq(sk, t), open = t <= top;
      const here = S.activity === 'gather' && S.node.kind === kind && S.node.t === t;
      const prevOpen = t - 1 <= top;
      putHidden(r.row, !open && !prevOpen);
      putToggle(r.row, 'locked', !open);
      putToggle(r.row, 'active', here);
      putToggle(r.ic, 'ghost', !open);
      putHidden(r.home, !(open && hk)); if (hk) putText(r.home, `Home +${Math.round(hk * 100)}%`);
      putText(r.held, open ? `${fmt(S.mats[kind][i])} held` : '');
      putHidden(r.held, !open);
      const per = nodeTime(kind, t), yieldAvg = nodeYieldAvg(kind) * ym;
      putText(r.desc, open ? `${per.toFixed(1)}s a swing · ${fmt(60 / per * yieldAvg)}/min` : `Needs ${SKILL[skillOf(kind)]} ${req}`);
      putText(r.qty, here ? 'Working' : open ? NODE_VERB[kind] : 'Locked');
      putText(r.price || (r.price = r.btn.querySelector('.price')), here ? 'Here' : open ? 'Go' : `Lv ${req}`);
      putToggle(r.btn, 'here', here);
      putDisabled(r.btn, !open || here);
    });
  }
  if (view !== 'pack') return;
  for (const k of CRAFT_FAMILIES) matCells[k].forEach(({ c, n }, i) => { const v = S.mats[k][i] || 0; putText(n, fmt(v)); putToggle(c, 'none', !v); });
  trophyCells.forEach(({ c, n }, i) => { const v = S.craft.troph[i] || 0; putText(n, fmt(v)); putToggle(c, 'none', !v); });
}
