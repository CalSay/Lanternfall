// 75-refine-ui: the stations' order sheets (card refine-queues). Browser-only; the rules live in 55-refine.js.
//   - A button on the Forge, Workbench and Loom cards in Camp (registerCampAction, no 75-camp-ui edit): "Smelt", "Saw",
//     "Weave and Tan", with the running order's rate ("Smelt · Smelting 4 a minute"). It opens that station's sheet:
//     its orders (up to 3, run in turn), each with its rate or why it stopped, and a list to add one (10 or All).
//   - refineUI.where(fam, t): the "where to get it" sheet for coal and the middles (the Storehouse opens it for those).
//   - The old-save card: the first time a save from before refining opens Craft with the Forge built.
// Coal and the middles show their names only (art ruling 2026-10-08): no icon, never a borrowed one.

const refineUI = {};
{
  const btn = (cls, txt, aria) => { const b = el('button', cls, txt); b.type = 'button'; if (aria) b.setAttribute('aria-label', aria); return b; };
  const stName = st => CAMP_B[st].n;
  const verbs = st => [...new Set(refineProducts(st).map(p => REFINE_PRODUCTS[p].verb))];
  const plural = (f, t, n) => matName(f, t) + (n !== 1 && (f === 'ingot' || f === 'plank' || MAT[f].unit === 'Log') ? 's' : '');
  const rateLine = (prod, t) => { const r = refinePerMin(REFINE_PRODUCTS[prod].st, t); return `${REFINE_PRODUCTS[prod].ing}: ${gxPerMin(r)} a minute · ${gxPerHour(r)} an hour`; };
  const inputsTxt = (prod, t) => refineNeed(prod, t).map(([f, tt, n]) => `${n} ${f === 'coal' ? 'Coal' : plural(f, tt, n)}`).join(' and ');
  const keepTxt = o => !o.all || !o.keep ? '' : 'keeps ' + refineNeed(o.prod, o.tier).map(([f, t], i) => `${storeNum(o.keep[i] || 0)} ${f === 'coal' ? 'Coal' : plural(f, t, o.keep[i] || 0)}`).join(' and ');

  // ---- the station sheet ----
  let open = null;   // { st, api, sig, box }
  function orderRow(st, o, i, cur) {
    const s = refineState(st, o), row = el('div', 'rf-order' + (s.k === 'run' && o === cur ? ' run' : s.k === 'done' ? ' done' : ' stop'));
    const tx = el('div', 'rf-otx');
    const amt = o.all ? `All · ${storeNum(o.made)} made` : `${storeNum(Math.min(o.made, o.want))} of ${storeNum(o.want)}`;
    tx.append(el('b', 'rf-oname', `${matName(o.prod, o.tier)} · ${amt}`));
    const line = s.k === 'run' ? (o === cur ? rateLine(o.prod, o.tier) : 'Waits its turn') : s.why;
    tx.append(el('span', 'rf-oline', line));
    if (o.all) tx.append(el('span', 'rf-okeep', keepTxt(o)));
    const rm = btn('mini rf-rm', s.k === 'done' ? 'Clear' : 'Remove', `${s.k === 'done' ? 'Clear' : 'Remove'} the ${matName(o.prod, o.tier)} order`);
    rm.addEventListener('click', () => { refineRemove(st, i); render(true); });
    row.append(tx, rm);
    return row;
  }
  function addRows(st) {
    const box = el('div', 'rf-add'), free = refineSlotFree(st);
    box.append(el('h3', 'cs-h', 'New order'));
    if (!free) { box.append(el('p', 'note', `The ${stName(st)} holds ${REFINE_TUNE.max} orders. Remove one to add another.`)); return box; }
    let rows = 0;
    for (const prod of refineProducts(st)) for (let t = 1; t <= 5; t++) {
      const main = refineNeed(prod, t)[0], held = (S.mats[main[0]] || [])[t - 1] || 0;
      if (held < main[2]) continue;   // a row only for a grade whose main input you hold
      rows++;
      const can = refineMaxUnits(prod, t, false), canAll = refineMaxUnits(prod, t, true), v = REFINE_PRODUCTS[prod].verb;
      const row = el('div', 'rf-prow');
      const tx = el('div', 'rf-ptx');
      tx.append(el('b', null, matName(prod, t)), el('span', 'rf-pmeta', `${inputsTxt(prod, t)} each · ${rateLine(prod, t).split(': ')[1]}`));
      const why = can < 1 ? refineState(st, { prod, tier: t, want: 1, made: 0, all: 0, at: 0 }).why : '';
      if (why) tx.append(el('span', 'rf-pwhy', why));
      const n10 = Math.min(10, can);
      const b1 = btn('mini rf-make', `Make ${n10 || 10}`, `${v} ${n10 || 10} ${matName(prod, t)}`), b2 = btn('mini go rf-make', 'All', `${v} all ${matName(prod, t)}`);
      b1.disabled = can < 1; b2.disabled = canAll < 1;
      b1.addEventListener('click', () => { const r = refineAdd(prod, t, n10); if (!r.ok) emit('toast', { key: 'refine-why', msg: r.why, kind: 'bad', icon: null, prio: 'low' }); render(true); });
      b2.addEventListener('click', () => { const r = refineAdd(prod, t, 'all'); if (!r.ok) emit('toast', { key: 'refine-why', msg: r.why, kind: 'bad', icon: null, prio: 'low' }); render(true); });
      const bs = el('div', 'rf-pbtns'); bs.append(b1, b2);
      row.append(tx, bs); box.append(row);
    }
    if (!rows) box.append(el('p', 'note', refineProducts(st).map(p => `${REFINE_PRODUCTS[p].verb} needs ${inputsTxt(p, 1)} a unit.`).join(' ') + (st === 'forge' ? ' Coal comes with Copper Ore.' : '')));
    return box;
  }
  function render(force) {
    if (!open || open.api.closed) { open = null; return; }
    const st = open.st, l = refineOrders(st), cur = refineCurrent(st);
    // redraw only when something a row shows changed (made counts, states, held stock moves the add list)
    const sig = JSON.stringify([l.map(o => [o.prod, o.tier, o.made, o.want, o.all, refineState(st, o).k]), cur && cur.prod, refineSlotFree(st),
      refineProducts(st).map(p => [1, 2, 3, 4, 5].map(t => refineMaxUnits(p, t, false) > 0 ? 1 : 0).join('')).join(), campLevel(st)]);
    if (!force && sig === open.sig) return;
    open.sig = sig;
    const b = open.box, sc = open.api.body, top = sc.scrollTop; b.textContent = '';
    const lv = campLevel(st);
    b.append(el('p', 'rf-intro', `Orders run in turn while you fight and while you are away. Up to ${REFINE_TUNE.max}.` + (lv > 1 ? ` Lv ${lv}: ${Math.round((refineSpeed(st) - 1) * 100)}% faster.` : '')));
    const list = el('div', 'rf-orders');
    if (!l.length) list.append(el('p', 'note', 'No orders yet.'));
    l.forEach((o, i) => list.append(orderRow(st, o, i, cur)));
    b.append(list, addRows(st));
    sc.scrollTop = top;   // a redraw keeps the player's place in the list
  }
  refineUI.open = st => {
    if (!refineBuilt(st) || typeof openSheet !== 'function') return;
    const api = openSheet(a => {
      a.sheet.classList.add('rf-sheet');
      a.body.append(el('h2', 'rf-title', `${stName(st)}: ${verbs(st).join(' and ')}`));
      const box = el('div', 'rf-box'); a.body.append(box);
      open = { st, api: a, sig: '', box };
      render(true);
    }, { label: `${stName(st)} orders`, onClose() { open = null; } });
    return api;
  };
  let acc = 0;
  onTick(dt => { if (!open) return; acc += dt; if (acc < 0.5) return; acc = 0; render(false); });
  for (const st of REFINE_STATIONS) registerCampAction(st, { label: () => refineLabel(st), show: () => refineBuilt(st), fn: () => refineUI.open(st) });

  // ---- where to get coal and the middles ----
  refineUI.where = (f, t) => {
    if (typeof openSheet !== 'function') return;
    openSheet(api => {
      api.sheet.classList.add('gw-sheet');
      const h = (S.mats[f] || [])[t - 1] || 0, cap = storeCap(f, t);
      const head = el('div', 'gw-head'), tx = el('div');
      tx.append(el('h2', 'gw-name', matName(f, t)), el('small', 'gw-have', Number.isFinite(cap) ? `${storeNum(h)} / ${storeNum(cap)} in the Storehouse` : `${storeNum(h)} in the Storehouse`));
      head.append(tx);
      let where, b;
      if (f === 'coal') {
        where = `Comes with Copper Ore once the Forge is built: about 1 coal for every ${Math.round(1 / REFINE_TUNE.coalDrop)} ore you mine. The Forge smelts it with ore into Ingots.`;
        b = btn('big horn gw-go', 'Mine at the Copper Vein');
        b.addEventListener('click', () => { api.close(true); navGo({ act: 'gather', node: { kind: 'ore', t: 1 }, close: true }); });
      } else {
        const st = REFINE_PRODUCTS[f].st, ok = refineBuilt(st);
        where = `Made at the ${stName(st)} from ${inputsTxt(f, t)} each. Set an order on the ${stName(st)}'s card in Camp.`;
        b = btn('big forge gw-go', ok ? `Open the ${stName(st)}'s orders` : `Build the ${stName(st)} in Camp`);
        b.addEventListener('click', () => { api.close(true); if (ok) refineUI.open(st); else setTab('world', '#camp-b-' + st); });
      }
      api.body.append(head, el('h3', 'cs-h', 'Where to get it'), el('p', 'gw-where', where));
      api.foot.append(b);
    }, { label: 'Where to get ' + matName(f, t), small: true });
  };

  // ---- the old-save card: once, on opening Craft with the Forge built ----
  on('menuView', ({ tab }) => {
    if (tab !== 'forge' || !refineOldCard()) return;
    setTimeout(() => {
      if (typeof openSheet !== 'function') return;
      openSheet(api => {
        api.sheet.classList.add('rf-old');
        api.body.append(el('h2', 'rf-title', 'Refining'), el('p', 'rf-oldtx', "The Forge can smelt now. Find Smelt on the Forge's card in Camp. Your gear is unchanged."));
        const go = btn('big forge', 'Show me'), ok = btn('big', 'Got it');
        go.addEventListener('click', () => { api.close(true); setTab('world', '#camp-b-forge'); });
        ok.addEventListener('click', () => api.close());
        api.foot.append(ok, go);
      }, { label: 'Refining', small: true });
    }, 0);
  });
}
