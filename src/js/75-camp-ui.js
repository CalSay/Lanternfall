// 75-camp-ui: the Camp part of the Camp tab (tab id 'world'): the Hearth card, the builders,
// one card per building, the Blessings and the Roster board. The Tavern and the World raid parts
// follow it unchanged. Browser-only; the rules live in 57-camp.js. A clean list UI: the drawn
// camp scene (camp.md 4) is a later task and mounts above these sections.
{
  // ---------------- icons (12x12, the ICON format) ----------------
  registerIcons({
    b_fire: ['............', '.....7......', '....717.....', '....7117....', '...711517...', '...7155117..', '..71555517..', '...155551...', '.6.666666.6.', '..66666666..', '.6........6.', '............'],
    b_tower: ['..1.1.1.1...', '..1111111...', '...12221....', '...12521....', '...12221....', '...12221....', '...12221....', '..1122211...', '..1222221...', '..1222221...', '.666666666..', '............'],
    b_book: ['............', '.2111111112.', '.2155555512.', '.2111111112.', '.2157777512.', '.2111111112.', '.2155555512.', '.2111111112.', '.2157777512.', '.2111111112.', '.2222222222.', '............'],
    b_map: ['............', '.6666666666.', '.6555555556.', '.6515555156.', '.6551551556.', '.6555115556.', '.6555515516.', '.6551555556.', '.6515555756.', '.6555555556.', '.6666666666.', '............'],
    b_bell: ['.....66.....', '....1111....', '...111111...', '...115111...', '...115111...', '..11111111..', '..11111111..', '.1111111111.', '.2222222222.', '.....77.....', '............', '............'],
    // Deepwell camp decorations (S.deep.cos), shown on the Hearth card
    dc_crystal: ['............', '.....1......', '....151.....', '....151.....', '.1..151..1..', '151.151.151.', '151.151.151.', '1511151.151.', '1511151.1511', '111111111111', '.2222222222.', '............'],
    dc_moss: ['............', '............', '....3.......', '...111..3...', '..11311111..', '.1111113111.', '.1311111111.', '111111131111', '266666666662', '.2666666662.', '..22222222..', '............'],
    dc_wlamp: ['............', '66..........', '..66........', '...6666.....', '...6..6666..', '...6.....666', '..222....6..', '..272...222.', '..252...272.', '..272...252.', '..222...272.', '.........222'],
    dc_skull: ['............', '...7.7.7....', '...77777....', '..1111111...', '.111111111..', '.112111211..', '.122111221..', '.111121111..', '..1111111...', '...15151....', '...11111....', '............'],
    dc_arch: ['............', '....1111....', '...1....1...', '..1......1..', '..2......2..', '.1........1.', '.1........1.', '.2........2.', '.1........1.', '.1........1.', '666......666', '666......666'],
    dc_brazier: ['.....3......', '....353.....', '...35553.3..', '...355553...', '..33555533..', '.1111111111.', '.2111111112.', '..21111112..', '....2112....', '.....11.....', '...222222...', '............'],
    dc_bridge: ['............', '1..........1', '11........11', '1.1......1.1', '1..11..11..1', '1....11....1', '666666666666', '6.6.6.6.6.6.', '............', '............', '............', '............']
  });
  const FIRE = { 5: '#FFF3C4', 7: '#FFB347' };
  const ICONS = {
    hearth: () => iconURL('b_fire', '#E0524F', FIRE),
    watch: () => iconURL('b_tower', '#8C8474', { 5: '#FFD27A' }),
    forge: () => iconURL('anvil', '#8A8FA0'),
    bench: () => iconURL('log', '#8C6A43', { 6: '#4A3220', 7: '#8C6A43' }),
    loom: () => iconURL(...craftIcon('robe', 2)),
    ench: () => iconURL('orb', '#B58CFF', { 7: '#6E6878' }),
    tavern: () => iconURL('mug', '#8C6A43', { 1: '#6B4A2E', 7: '#F2C14E', 5: '#EFE6D6' }),
    library: () => iconURL('b_book', '#5A7AB8', { 5: '#EFE6D6' }),
    maproom: () => iconURL('b_map', '#E0524F', { 5: '#EFE6D6', 6: '#8C6A43' }),
    shrine: () => iconURL('b_bell', '#9FD8C9', { 6: '#6B4A2E' })
  };
  const icon = id => (ICONS[id] || ICONS.hearth)();
  // Deepwell decorations bought with Marks (DEEP_SHOP kind 'decor', owned in S.deep.cos). The Camp is
  // a list today, so they show as small icons on the Hearth card; the drawn camp scene (camp.md 4,
  // future work) should place them in the camp itself.
  const DECO_IC = {
    d_crystal: () => iconURL('dc_crystal', '#7FB2FF', { 2: '#3F5F9A' }), d_moss: () => iconURL('dc_moss', '#3E8A6E', { 3: '#9FF0D8', 6: '#5A5A66', 2: '#2E3A40' }),
    d_wlamp: () => iconURL('dc_wlamp', '#FFD27A', { 2: '#3A3444', 6: '#9A8260', 5: '#FFF3C4' }), d_skull: () => iconURL('dc_skull', '#D8D0C0', { 2: '#2A2230' }),
    d_arch: () => iconURL('dc_arch', '#9AA0B4', { 2: '#5A6070', 6: '#5A5A66' }), d_brazier: () => iconURL('dc_brazier', '#4A5064', { 3: '#7FB2FF', 5: '#EAF6FF', 2: '#2A2E3A' }),
    d_bridge: () => iconURL('dc_bridge', '#B89A6A'), d_bell: () => iconURL('b_bell', '#4F8A7A', { 5: '#9FD8C9', 6: '#2E4A44', 7: '#8C7A4A' })
  };
  const famIcon = (f, t) => ['ore', 'wood', 'ess'].includes(f) ? matIcon(f, t) : iconURL(...craftIcon('mat_' + f, t));
  const trophyIcon = i => iconURL(...craftIcon('tro_' + TYPES[i === 'any' ? 5 : i].key, 1));
  const shortName = (f, t) => MAT[f].short[t - 1];
  const bname = (id, to) => id === 'hearth' ? `Hearth ${to}` : `${CAMP_B[id].n} Lv ${to}`;
  const left = x => Math.max(0, x.end - Date.now()) / 1000;
  // "2h", "1h 30m", "3m", "45s": no zero parts.
  const dur = secs => { secs = Math.ceil(secs); const h = Math.floor(secs / 3600), m = Math.floor(secs % 3600 / 60); return secs < 60 ? secs + 's' : h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`; };
  const btn = (cls, txt) => { const b = el('button', cls, txt); b.type = 'button'; return b; };

  // ---------------- cost chips (rebuilt only when their text changes) ----------------
  function chips(box, c) {
    const items = [];
    if (c.gold) items.push({ u: iconURL('coin', '#F2C14E'), t: `${fmt(Math.min(S.gold, c.gold))}/${fmt(c.gold)}`, s: S.gold < c.gold, n: 'gold' });
    for (const [f, t, n] of c.mats) { const h = S.mats[f][t - 1] || 0; items.push({ u: famIcon(f, t), t: `${fmt(Math.min(h, n))}/${fmt(n)} ${shortName(f, t)}`, s: h < n, n: matName(f, t) }); }
    for (const [i, n] of c.troph) { const tr = S.craft.troph, h = i === 'any' ? tr.reduce((a, b) => a + b, 0) : tr[i] || 0; items.push({ u: trophyIcon(i), t: `${Math.min(h, n)}/${n} ${i === 'any' ? 'Trophies' : CRAFT_TROPHIES[i].n}`, s: h < n, n: 'Trophy' }); }
    const sig = items.map(x => x.t + x.s).join('|');
    if (box._sig === sig) return; box._sig = sig; box.textContent = '';
    for (const x of items) { const e = el('span', 'cost' + (x.s ? ' short' : '')); e.title = x.n; e.append(img(x.u), el('span', null, x.t)); box.append(e); }
  }
  const setTxt = (e, t) => { if (e.textContent !== t) e.textContent = t; };
  // How many of a cost's parts the player already has: { have, all }.
  function costCount(c) {
    let have = 0, all = 0;
    if (c.gold) { all++; if (S.gold >= c.gold) have++; }
    for (const [f, t, n] of c.mats) { all++; if ((S.mats[f][t - 1] || 0) >= n) have++; }
    for (const [i, n] of c.troph) { all++; const tr = S.craft.troph; if ((i === 'any' ? tr.reduce((a, b) => a + b, 0) : tr[i] || 0) >= n) have++; }
    return { have, all };
  }

  // ---------------- confirm buttons (in-page, no confirm()) ----------------
  // First tap arms the button for 4 seconds; the second tap acts.
  let armed = null, armedAt = 0;
  const isArmed = key => armed === key && Date.now() - armedAt < 4000;
  function arm(key) { armed = key; armedAt = Date.now(); ui(true); }
  function disarm() { armed = null; }

  // A timer bar for a pending build.
  function timer() {
    const w = el('div', 'cb-timer'), bar = el('div', 'bar'), fill = el('i'), txt = el('span', 'cb-left');
    bar.append(fill); w.append(bar, txt);
    return {
      el: w, set(x) {
        putHidden(w, !x); if (!x) return;
        const p = x.start ? Math.min(100, (Date.now() - x.start) / Math.max(1, x.end - x.start) * 100) : 0;
        putStyle(fill, 'width', p + '%');
        setTxt(txt, x.start ? `Lv ${x.to} ready in ${dur(left(x))}` : `Lv ${x.to} is queued. It starts when the builder is free.`);
        putToggle(w, 'queued', !x.start);
      }
    };
  }

  // The action area of a card: Build / Queue / Confirm, or Cancel for a pending build.
  // quick: the building cards' compact row button (it lives in the row, not in this box).
  function actions(id, quick) {
    const box = el('div', 'cb-act'), go = quick ? quick.b : btn('big cb-go'), cancel = btn('mini warn cb-cancel'), why = el('p', 'note cb-why');
    if (quick) box.append(why, cancel); else box.append(why, go, cancel);
    go.addEventListener('click', () => {
      const c = campCan(id); if (!c.ok) return;
      if (!isArmed('b:' + id)) { arm('b:' + id); return; }
      disarm(); campBuild(id); ui(true);
    });
    cancel.addEventListener('click', () => {
      if (!isArmed('c:' + id)) { arm('c:' + id); return; }
      disarm(); campCancel(id); ui(true);
    });
    return {
      el: box, set(c, pend) {
        const done = c.max;
        putHidden(go, !!pend || done || !!c.need); putHidden(cancel, !pend);
        if (pend) setTxt(cancel, isArmed('c:' + id) ? `Tap again: refund ${pend.start ? 'half' : 'all'} of the cost` : 'Cancel build');
        if (!pend && !done) {
          const verb = c.queue ? 'Queue' : 'Build', armd = isArmed('b:' + id);
          if (quick) { setTxt(quick.q, `Lv ${c.to} · ${dur(c.dur / 1000)}`); setTxt(quick.p, armd ? 'Sure?' : verb); putAttr(go, 'aria-label', armd ? `Tap again to ${verb.toLowerCase()} Lv ${c.to}` : `${verb} Lv ${c.to}, ${dur(c.dur / 1000)}`); }
          else setTxt(go, armd ? `Tap again to ${verb.toLowerCase()} (${dur(c.dur / 1000)})` : `${verb} ${id === 'hearth' ? 'Hearth' : 'Lv'} ${c.to} · ${dur(c.dur / 1000)}`);
          putDisabled(go, !c.ok); putToggle(go, 'armed', armd);
        }
        const w = pend || done ? '' : c.ok ? (c.queue ? 'Your builder is busy. This starts when the current build ends.' : '') : (c.miss ? '' : c.why);
        setTxt(why, w); putHidden(why, !w);
      }
    };
  }

  // The Hearth card's decoration row: rebuilt only when the owned set changes.
  function updDeco() {
    const cos = S.deep && S.deep.cos, shop = typeof DEEP_SHOP !== 'undefined' ? DEEP_SHOP : {};
    const ids = cos ? Object.keys(DECO_IC).filter(id => cos[id] && shop[id]) : [];
    const sig = ids.join();
    if (sig === H.decoSig) return;
    H.decoSig = sig; H.deco.textContent = ''; putHidden(H.deco, !ids.length);
    if (!ids.length) return;
    H.deco.append(el('span', null, 'From the Deepwell:'));
    for (const id of ids) {
      const i = img(DECO_IC[id]()); i.style.cssText = 'width:24px;height:24px';
      i.title = shop[id].n; i.alt = shop[id].n; H.deco.append(i);
    }
  }

  // ---------------- the camp part ----------------
  let head, closed, closedBar, closedTxt, hearthCard, H = {}, buildersBox, bSig = '';
  registerSection('camp', {
    id: 'camp', title: null,
    mount(sec) {
      // The Camp part leads the tab, above the Almanac (which prepends itself when it mounts).
      const part = sec.parentNode; part.parentNode.prepend(part);
      head = el('h2', 'world-head', "Hollow's Rest");
      closed = el('div', 'card camp-closed');
      closedTxt = el('p', 'note');
      const bar = el('div', 'bar'); closedBar = el('i'); bar.append(closedBar);
      closed.append(el('h3', null, 'No camp yet'), closedTxt, bar);
      hearthCard = el('div', 'card camp-hearth'); hearthCard.id = 'camp-b-hearth';
      const top = el('div', 'ch-top'), ic = el('div', 'ic ch-ic'); ic.append(img(icon('hearth')));
      const who = el('div', 'ch-who');
      H.name = el('div', 'ch-name'); H.lv = el('div', 'ch-lv'); H.fx = el('div', 'ch-fx');
      who.append(H.name, H.lv, H.fx); top.append(ic, who);
      H.next = el('div', 'ch-next'); H.nextT = el('div', 'ch-next-t'); H.nextO = el('div', 'ch-next-o'); H.next.append(H.nextT, H.nextO);
      H.costs = el('div', 'costs cb-costs'); H.timer = timer(); H.act = actions('hearth');
      // The cost: one summary line ("Cost: 2 of 5 ready"); the chips open on a tap.
      H.cost = el('div', 'ch-cost'); H.costT = el('span', 'ch-cost-t'); H.cost.append(H.costT);
      H.dz = disclose(hearthCard, H.cost, () => ui(true)); H.cost.append(H.dz.chev);
      // Deepwell decorations: a row of small icons, only when the player owns any
      H.deco = el('div', 'ch-deco'); H.deco.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;font-size:12.5px;color:var(--muted)';
      H.deco.hidden = true; H.decoSig = '';
      hearthCard.append(top, H.deco, H.next, H.cost, H.costs, H.timer.el, H.act.el);
      buildersBox = el('div', 'camp-builders');
      sec.append(head, closed, hearthCard, buildersBox);
    },
    update() {
      const open = campOpen();
      putHidden(closed, open); putHidden(hearthCard, !open); putHidden(buildersBox, !open);
      if (!open) {
        setTxt(closedTxt, `Old Hesketh is looking for a place to rest. Reach zone ${CAMP_TUNE.openZone} and he makes camp. You are at zone ${S.maxZone}.`);
        putStyle(closedBar, 'width', Math.min(100, S.maxZone / CAMP_TUNE.openZone * 100) + '%');
        return;
      }
      const l = campLevel('hearth'), c = campCan('hearth'), pend = campPending('hearth'), nx = campNextUnlock();
      setTxt(H.name, CAMP_HEARTH_NAMES[l - 1]);
      setTxt(H.lv, `Hearth ${l}/10`);
      setTxt(H.fx, campEffects('hearth', l).join(' · '));
      putHidden(H.next, !nx);
      if (nx) {
        const rename = nx.name !== CAMP_HEARTH_NAMES[l - 1] ? `: the ${nx.name}` : '';
        setTxt(H.nextT, `Next: Hearth ${nx.to}${rename}` + (S.maxZone < nx.zone ? ` (needs zone ${nx.zone})` : ''));
        setTxt(H.nextO, nx.opens.length ? 'Opens ' + nx.opens.join(', ') + '.' : `+3% away gains.`);
      }
      const showCost = !pend && !c.max && !!c.cost;
      putHidden(H.cost, !showCost); putHidden(H.costs, !showCost || !H.dz.open);
      if (showCost) {
        const n = costCount(c.cost);
        setTxt(H.costT, n.have === n.all ? 'Cost: all ready' : `Cost: ${n.have} of ${n.all} ready`);
        putToggle(H.cost, 'short', n.have < n.all);
        if (H.dz.open) chips(H.costs, c.cost);
      }
      H.timer.set(pend); H.act.set(c, pend);
      putToggle(hearthCard, 'new', S.camp.news.some(x => x.id === 'hearth'));
      updDeco();
      // builders
      const rows = [], n = campBuilders(), all = campBuilds();
      for (let b = 0; b < n; b++) {
        const run = all.find(x => x.b === b && !x.queued), q = all.find(x => x.b === b && x.queued);
        rows.push({ run, q, b });
      }
      const sig = JSON.stringify(rows.map(r => [r.run && [r.run.id, r.run.to], r.q && [r.q.id, r.q.to]]));
      if (sig !== bSig) {
        bSig = sig; buildersBox.textContent = '';
        for (const r of rows) {
          const row = el('div', 'bld-row'); row.dataset.b = r.b;
          const ic = el('div', 'ic'); ic.append(img(r.run ? icon(r.run.id) : iconURL('pick', '#8A8FA0')));
          const body = el('div', 'bld-body'), t = el('div', 'bld-t'), bar = el('div', 'bar'), fill = el('i'), q = el('div', 'bld-q');
          bar.append(fill); body.append(t, bar, q); row.append(ic, body);
          row._t = t; row._fill = fill; row._bar = bar; row._q = q;
          buildersBox.append(row);
        }
      }
      [...buildersBox.children].forEach((row, i) => {
        const r = rows[i]; if (!r) return;
        const who = n > 1 ? `Builder ${i + 1}: ` : '';
        setTxt(row._t, r.run ? `${who}${bname(r.run.id, r.run.to)} · ${dur(left(r.run))}` : `${who}Free. Pick a building below.`);
        putHidden(row._bar, !r.run);
        if (r.run) putStyle(row._fill, 'width', Math.min(100, (Date.now() - r.run.start) / Math.max(1, r.run.end - r.run.start) * 100) + '%');
        setTxt(row._q, r.q ? `Next: ${bname(r.q.id, r.q.to)}` : r.run ? 'Queue empty. You can queue one build.' : '');
        putHidden(row._q, !row._q.textContent);
        putToggle(row, 'idle', !r.run);
      });
    }
  });

  // ---------------- building cards ----------------
  const openCards = new Set();
  const cards = new Map();
  let listBox, listSig = '';
  // One row per building: icon, name, level, state or timer, and the Build/Queue button. A tap on the
  // row opens the effects now -> next, the cost chips, Cancel and the building's own actions.
  function card(id) {
    const d = CAMP_B[id], w = el('div', 'cb'); w.id = 'camp-b-' + id;
    const row = el('div', 'cb-row'), hit = el('div', 'cb-hit');
    const ic = el('div', 'ic'); ic.append(img(icon(id)));
    const mid = el('div', 'cb-mid'), nm = el('div', 'cb-nm'), lvl = el('span', 'cb-lv'), line = el('div', 'cb-line');
    nm.append(el('span', null, d.n), lvl); mid.append(nm, line);
    hit.append(ic, mid);
    const qb = btn('buy cb-quick'), q = el('span', 'qty'), p = el('span', 'price'); qb.append(q, p);
    row.append(hit, qb);
    const body = el('div', 'cb-body'); body.hidden = true;
    const table = el('div', 'cb-fx'), costs = el('div', 'costs cb-costs'), extra = el('div', 'cb-extra'), tm = timer(), act = actions(id, { b: qb, q, p });
    body.append(table, costs, tm.el, act.el, extra);
    w.append(row, body);
    const dz = disclose(w, hit, on => { if (on) openCards.add(id); else openCards.delete(id); ui(true); });
    nm.append(dz.chev);
    hit.setAttribute('aria-label', `${d.n}: show details`);
    return { w, row, hit, dz, qb, lvl, line, body, table, costs, extra, tm, act, fxSig: '', exSig: '' };
  }
  function effectsTable(k, id, l) {
    const max = CAMP_B[id].max, sig = id + l + max;
    if (k.fxSig === sig) return; k.fxSig = sig; k.table.textContent = '';
    const now = el('div', 'cb-fxrow now'), nxt = el('div', 'cb-fxrow next');
    now.append(el('b', null, l ? `Lv ${l}` : 'Now'), el('span', null, campEffects(id, l).join(' · ')));
    k.table.append(now);
    if (l < max) { nxt.append(el('b', null, `Lv ${l + 1}`), el('span', null, campEffects(id, l + 1).join(' · '))); k.table.append(nxt); }
  }
  // Extra content: Tavern rumours, Shrine Blessings hint, actions other systems add (Open Codex, Expeditions).
  function extras(k, id) {
    const acts = campActions(id);
    const rum = id === 'tavern' ? campRumours() : [];
    const sig = JSON.stringify([acts.map(a => a.label), rum.map(r => r.txt)]);
    if (k.exSig === sig) return; k.exSig = sig; k.extra.textContent = '';
    if (rum.length) {
      const box = el('div', 'rumours');
      box.append(el('div', 'rum-h', 'Rumours'));
      for (const r of rum) {
        const line = el('div', 'rum');
        if (r.ic) line.append(img(iconURL(...r.ic)));
        else if (r.char) line.append(img(iconURL('mug', '#8C6A43', { 1: '#6B4A2E', 7: '#F2C14E', 5: '#EFE6D6' })));
        line.append(el('span', null, r.txt));
        box.append(line);
      }
      k.extra.append(box);
    } else if (id === 'tavern' && campLevel('tavern') < 2) k.extra.append(el('p', 'note', 'At Lv 2 the Tavern hears rumours about who visits next.'));
    for (const a of acts) { const b = btn('mini go', a.label); b.addEventListener('click', () => { try { a.fn(); } catch (e) { console.error('[lanternfall] camp action', e); } ui(true); }); k.extra.append(b); }
  }
  registerSection('camp', {
    id: 'camp-buildings', title: 'Buildings',
    mount(sec) { listBox = el('div', 'cb-list'); sec.append(listBox); },
    update() {
      const sec = listBox.parentNode; putHidden(sec, !campOpen()); if (!campOpen()) return;
      const ids = campList().filter(x => x !== 'hearth');
      const sig = ids.join();
      if (sig !== listSig) { listSig = sig; listBox.textContent = ''; for (const id of ids) { if (!cards.has(id)) cards.set(id, card(id)); listBox.append(cards.get(id).w); } }
      for (const id of ids) {
        const k = cards.get(id), l = campLevel(id), max = CAMP_B[id].max, c = campCan(id), pend = campPending(id), isOpen = openCards.has(id);
        setTxt(k.lvl, l ? `Lv ${l}/${max}` : 'Not built');
        // The row's one line: what is happening now, or what stops the next level.
        const line = pend ? `Building Lv ${pend.to} · ${pend.start ? dur(left(pend)) : 'queued'}`
          : c.max ? 'Fully built'
          : c.need ? `Lv ${c.to} needs ${c.need.hearth ? 'Hearth ' + c.need.hearth : 'zone ' + c.need.zone}`
          : c.ok ? (c.queue ? 'Ready to queue' : 'Ready to build')
          : c.miss ? `Lv ${c.to}: ${(o => `${o.have} of ${o.all} costs ready`)(costCount(c.cost))}` : c.why;
        setTxt(k.line, line);
        putHidden(k.qb, !!pend || !!c.max || !!c.need);
        putToggle(k.w, 'locked', !!c.need && !l);
        putToggle(k.w, 'busy', !!pend);
        putToggle(k.w, 'can', c.ok && !pend);
        putToggle(k.w, 'new', S.camp.news.some(x => x.id === id));
        if (k.dz.open !== isOpen) { k.dz.open = isOpen; putToggle(k.w, 'open', isOpen); putAttr(k.hit, 'aria-expanded', String(isOpen)); }   // opened from elsewhere (campGoto)
        putHidden(k.body, !isOpen);
        if (!isOpen) { if (!pend && !c.max && !c.need) k.act.set(c, pend); continue; }
        effectsTable(k, id, l);
        putHidden(k.costs, !!pend || !!c.max || !c.cost);
        if (!k.costs.hidden) chips(k.costs, c.cost);
        k.tm.set(pend); k.act.set(c, pend);
        extras(k, id);
      }
    }
  });

  // ---------------- Blessings ----------------
  let blessBox, blessNote, blessSig = '';
  registerSection('camp', {
    id: 'camp-bless', title: 'Blessings',
    mount(sec) { blessNote = el('p', 'note'); blessBox = el('div', 'bless-grid'); sec.append(blessNote, blessBox); },
    update() {
      const sec = blessBox.parentNode, n = blessSlots();
      putHidden(sec, !campOpen() || n < 1); if (sec.hidden) return;
      const ids = Object.keys(CAMP_BLESS).filter(blessOpen), on = S.camp.bless, sw = blessCanSwap();
      setTxt(blessNote, `The Shrine holds ${n === 1 ? '1 Blessing' : n + ' Blessings'}. Tap one to choose it. Swapping is free${sw.ok ? '.' : ', but ' + sw.why.toLowerCase()}`);
      const sig = JSON.stringify([ids, on, blessPower(), sw.ok]);
      if (sig === blessSig) return; blessSig = sig; blessBox.textContent = '';
      for (const id of ids) {
        const d = CAMP_BLESS[id], b = btn('bless' + (on.includes(id) ? ' on' : ''));
        b.setAttribute('aria-pressed', String(on.includes(id)));
        b.append(el('b', null, d.n), el('span', null, d.fx(d.v * blessPower())));
        putDisabled(b, !sw.ok);
        b.addEventListener('click', () => { blessToggle(id); ui(true); });
        blessBox.append(b);
      }
    }
  });

  // ---------------- the Roster board ----------------
  const hasArt = id => typeof portraitURL === 'function' && typeof RIG === 'object' && RIG.COMPANIONS && !!RIG.COMPANIONS[id];
  function portrait(id) {
    if (hasArt(id)) { try { const u = portraitURL(id); if (u) return u; } catch (e) {} }
    const c = ROSTER[id], i = c.idx, col = i >= 0 ? COMPS[i].col : CHAR_RARITY[c.rarity].col, helm = i >= 0 ? COMPS[i].helm : '#3A2F47';
    return spriteURL('camp:' + id, SPR.hero, { ...HERO_PAL, 1: col, 2: helm });
  }
  const ORDER = { rest: 0, job: 1, exped: 2 };
  let rosBox, rosNote, rosSig = '';
  registerSection('camp', {
    id: 'camp-roster', title: 'Roster board',
    mount(sec) { rosNote = el('p', 'note'); rosBox = el('div', 'ros-list'); sec.append(rosNote, rosBox); },
    update() {
      const sec = rosBox.parentNode, live = campOpen() && rosterLive();
      putHidden(sec, !live); if (!live) return;
      const list = benchList().map(id => ({ id, s: campStatus(id), r: charRec(id) }))
        .sort((a, b) => (ORDER[a.s.status] || 9) - (ORDER[b.s.status] || 9) || b.r.lv - a.r.lv);
      setTxt(rosNote, list.length ? 'Companions on the bench live at camp. Each one is in one place at a time.' : 'Everyone on your roster is in the party. Benched companions rest here.');
      const sig = JSON.stringify(list.map(x => [x.id, x.r.lv, x.s.status, x.s.label, x.s.sub || '', benchSends(x.id).map(s => s.ok)]));
      if (sig === rosSig) return; rosSig = sig; rosBox.textContent = '';
      // Rows are built in time-boxed chunks (a portrait can need baking), so the Camp tab's first open
      // never stalls the game. A newer rebuild wins.
      const gen = ++rosGen, queue = list.slice();
      const chunk = () => {
        if (gen !== rosGen) return;
        const t0 = performance.now();
        while (queue.length && performance.now() - t0 < 20) rosRow(queue.shift());
        if (queue.length) setTimeout(chunk, 0);
      };
      chunk();
    }
  });
  let rosGen = 0;
  // One compact row: portrait, name, status (a tap opens the character sheet), then the actions.
  function rosRow(x) {
    const c = ROSTER[x.id], row = el('div', 'ros-row ' + x.s.status);
    const hit = el('div', 'ros-hit'); hit.setAttribute('role', 'button'); hit.tabIndex = 0;
    hit.setAttribute('aria-label', `${c.name}, open character sheet`);
    const pt = el('div', 'ros-pt r-' + c.rarity); pt.append(img(portrait(x.id)));
    const body = el('div', 'ros-body');
    const nm = el('div', 'ros-nm'); nm.append(el('span', null, c.name), el('small', null, `Lv ${x.r.lv} · ${ROLE_STATS[c.role].n}`));
    const st = el('div', 'ros-st', x.s.label + (x.s.sub ? ' · ' + x.s.sub : ''));
    body.append(nm, st); hit.append(pt, body);
    const open = () => { try { partySheet.open(x.id); } catch (e) { setTab('party'); } };
    hit.addEventListener('click', open);
    hit.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === hit) { e.preventDefault(); open(); } });
    const acts = el('div', 'ros-acts');
    if (x.s.action) { const b = btn('mini', x.s.action.label); b.addEventListener('click', () => { x.s.action.fn(); ui(true); }); acts.append(b); }
    for (const s of benchSends(x.id)) { const b = btn('mini go', s.label); b.disabled = !s.ok; if (s.why) b.title = s.why; b.addEventListener('click', () => { s.fn(); ui(true); }); acts.append(b); }
    row.append(hit, acts);
    rosBox.append(row);
  }

  // ---------------- tab dot, Go buttons, "finished" glow ----------------
  const dot = () => { if (S.tab !== 'world') $('raidDot').hidden = false; };
  on('campOpen', dot);
  on('campBuilt', dot);
  on('campGoto', ({ tab, sel }) => {
    setTab(tab, sel);
    const t = sel && document.querySelector(sel); if (!t) return;
    const id = sel.replace('#camp-b-', ''); if (CAMP_B[id] && id !== 'hearth') { openCards.add(id); ui(true); }
    const box = $('panels');
    box.scrollTop = Math.max(0, t.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 12);
  });
  // The glow on finished buildings clears after the player has had the Camp tab open for a few seconds.
  let seenFor = 0;
  onTick(dt => {
    if (S.tab !== 'world' || document.hidden || !S.camp.news.length) { seenFor = 0; return; }
    seenFor += dt; if (seenFor > 5) { campSeen(); seenFor = 0; }
  });
}
