// 75-legend-ui: legendary powers and circle sets, the UI (docs/design/legendaries.md 7, task L4). Browser-only.
// Reads the L2 core (55-legend.js) only through its API; every action goes through a legendX/legendCanX pair.
//
// Craft tab, view 'powers' (feature 'powers': the first legendary power or Circle Crest, 55-onboard):
//   Your powers   the hero's 2 slots and each fielded companion's power, the legend budget ("capped"
//                 chip when legendBudget().hit), and legendary items waiting to be learned (Learn, in-page confirm)
//   Lantern Book  every power by class / companion (For you / For your party / All): icon, rank pips,
//                 Echoes, where it is inscribed; a tap shows the text by rank and "Inscribe on..." (a sheet
//                 that lists fitting crafted items, lgFits, with costs and an in-page confirm)
//   Circle sets   Sigils by circle, the 4 sets with pieces worn, tiers (2/4/6) and which are on
// Other files call legendUI (all optional, probed with typeof):
//   legendUI.icon(id)              -> the power's icon inside the orange legendary frame (data URL, cached)
//   legendUI.lines(it, who?)       -> a box of the item's power / mark lines (itemLegendLines) or null
//   legendUI.itemBoxes(it, st, re) -> [elements] for the item sheet: Learn, Inscribe, Mark (st: the sheet
//                                     state object, it keeps the armed confirm in st.lgArm; re(): re-render)
//   legendUI.heroLine()            -> { txt, n } "Powers 1/2: Tidewall II" for the hero card, or null
//   legendUI.setsRow(box)          -> fills a Sets chip row (Party tab Synergies), returns true when shown
//   legendUI.openInscribe(id)      -> the "Inscribe on..." sheet for a Book power
// Also: a Powers view dot (a legendary item to learn), and an away-card line for powers found away.

let legendUI = null;
{
  const safe = (fn, d) => { try { const v = fn(); return v == null ? d : v; } catch (e) { console.error('[lanternfall] legend ui', e); return d; } };
  const P = id => LEG_POWERS[id];
  const rn = r => roman(r);
  const on0 = () => typeof legendActive === 'function' && !!S.legend;
  const cls = () => (S.party && S.party.cls) || null;
  const firstName = k => (k === 'hero' ? 'You' : ROSTER[k] ? ROSTER[k].name.replace(/^(Ser|Old|Brother|Saint) /, '').split(' ')[0] : k);
  const circleName = i => LEG_CIRCLE_NAME[LEG_CIRCLES[i]];
  const SHORT = { hedgefolk: 'Hedgefolk', oath: 'Oath', dusk: 'Dusk', wayfarers: 'Wayfarers' };
  const shortName = i => SHORT[LEG_CIRCLES[i]] || circleName(i);
  const cap1 = t => t.charAt(0).toUpperCase() + t.slice(1);
  const roleName = r => (ROLE_STATS[r] ? ROLE_STATS[r].n : r);
  const itemIc = it => safe(() => itemIcon(it.slot, it.t, it.u), iconURL('charm', '#A9B1BD'));
  const frameOf = it => (it.u || it.lr ? 'legendary' : it.r);
  const btn = (cls_, text, fn) => { const b = el('button', cls_, text); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; };
  const act = fn => { const r = safe(fn, false); if (r) { save(); ui(true); } return r; };
  // Rebuilding a list between pointerdown and click would swallow the tap (as in 75-craft-ui).
  let touchAt = 0;
  document.addEventListener('pointerdown', () => { touchAt = Date.now(); }, true);
  const busy = () => Date.now() - touchAt < 1200;

  // ---------------- icons ----------------
  // A power icon inside LEG_FRAME (16x16 frame round a 12x12 icon), one small canvas per power, cached.
  const fURL = new Map();
  function icon(id) {
    if (fURL.has(id)) return fURL.get(id);
    const u = safe(() => {
      const [name, main, extra] = legendIcon(id);
      const c = document.createElement('canvas'); c.width = 18; c.height = 18;
      const g = c.getContext('2d');
      g.drawImage(sprite('legframe', LEG_FRAME.map, { 1: LEG_FRAME.col, 2: LEG_FRAME.lo, 3: LEG_FRAME.hi }), 0, 0);
      const ic = sprite('u:ic:' + name + main + JSON.stringify(extra || {}), ICON[name], icPal(main, extra));
      g.drawImage(ic, Math.round((18 - ic.width) / 2), Math.round((18 - ic.height) / 2));
      return c.toDataURL();
    }, iconURL('charm', LEG_COL));
    fURL.set(id, u); return u;
  }
  const sigURL = i => safe(() => iconURL(...sigilIcon(i)), iconURL('coin', LEG_COL));
  const lgTile = (id, dim) => { const d = el('div', 'lg-ic' + (dim ? ' dim' : '')); d.append(img(icon(id))); return d; };
  function pips(rank) {
    const w = el('span', 'lg-pips'); w.setAttribute('aria-label', rank ? `Rank ${rn(rank)} of V` : 'Not learned');
    for (let i = 1; i <= LEG_TUNE.ranks; i++) w.append(el('i', i <= rank ? 'on' : null));
    return w;
  }

  // ---------------- lookups ----------------
  // Who wears what: item id -> { who: 'hero' | rosterId, pos }.
  function wearers() {
    const m = new Map();
    for (const p of CRAFT_HERO_POS) if (S.equip[p] != null) m.set(S.equip[p], { who: 'hero', pos: p });
    const rec = S.party && S.party.rec;
    if (rec) for (const [k, r] of Object.entries(rec)) for (const p of CRAFT_COMP_POS) if (r && r[p] != null) m.set(r[p], { who: k, pos: p });
    return m;
  }
  // Where each power is inscribed (crafted items only; legendary drops are listed under Learn).
  function inscribed() {
    const w = wearers(), m = {};
    for (const it of S.items) if (it.lg && !it.lr && P(it.lg)) (m[it.lg] || (m[it.lg] = [])).push({ it, wr: w.get(it.id) || null });
    for (const k of Object.keys(m)) m[k].sort((a, b) => (!!b.wr - !!a.wr) || itemPower(b.it) - itemPower(a.it));
    return m;
  }
  const toLearn = () => S.items.filter(it => it.lg && it.lr && P(it.lg));
  const fitsTxt = id => {
    const p = P(id);
    if (p.fits === 'hero') return p.cls && HERO_CLASSES[p.cls] ? `${HERO_CLASSES[p.cls].name} weapon, off-hand, head or body` : 'Any hero weapon, off-hand, head or body';
    if (p.fits === 'trinket') return 'A companion\'s Trinket';
    return `A ${roleName(p.fits).toLowerCase()}'s weapon` + (p.only && ROSTER[p.only] ? ` (${firstName(p.only)} only)` : '');
  };
  const hintTxt = id => {
    const p = P(id);
    if (LEG_PIN_IDS.includes(id)) return 'A pinnacle boss guards it.';
    if (p.only && ROSTER[p.only] && !isRecruited(p.only)) return `Oath elders, level 3+, once ${firstName(p.only)} has joined you.`;
    return `${LEG_CODEX.hint}.`;
  };
  const whereTxt = (id, ins) => {
    const l = ins[id] || [];
    if (!l.length) return 'Not inscribed';
    const a = l[0], who = a.wr ? (a.wr.who === 'hero' ? 'you wear it' : `${firstName(a.wr.who)} wears it`) : 'in your bag';
    return `On ${itemName(a.it)} (${who})` + (l.length > 1 ? ` +${l.length - 1}` : '');
  };

  // ================= Craft tab: the Powers view =================
  registerView('forge', { id: 'powers', label: 'Powers', order: 25, feature: 'powers',
    dot: () => on0() && S.items.some(it => it.lr && it.lg && !isEquipped(it.id)) });

  // ---------------- Your powers ----------------
  let B = null;
  registerSection('forge', {
    id: 'legend-build', title: 'Your powers', view: 'powers',
    mount(sec) {
      const head = el('div', 'sec-head'); head.append(sec.querySelector('.sec-title'));
      const cap = el('span', 'lg-capchip', 'Capped'); cap.hidden = true;
      head.append(cap); sec.prepend(head);
      const card = el('div', 'card lg-build');
      const hero = el('div', 'lg-slots');
      const comp = el('div', 'lg-comps');
      const budget = el('p', 'lg-budget');
      card.append(hero, comp, budget);
      const learn = el('div', 'lg-learn');
      sec.append(learn, card);
      B = { cap, hero, comp, budget, learn, sig: '', lsig: '', arm: null };
    },
    update(force) {
      if (!on0()) return;
      const a = legendActive(), bu = a.budget;
      putHidden(B.cap, !bu.hit);
      const pc = x => `+${Math.round(x * 1000) / 10}%`;
      putText(B.budget, bu.raw <= 0 ? 'Worn powers and sets add to your damage. Inscribe a power on gear you wear.'
        : bu.hit ? `Your powers are at their cap: ${pc(bu.capped)} damage. They would give ${pc(bu.raw)}; higher ranks raise the cap.`
          : `Your powers and sets add about ${pc(bu.raw)} damage (cap ${pc(bu.cap)} at rank ${rn(bu.rank)}).`);
      putToggle(B.budget, 'hit', bu.hit);
      const field = (!soloOn() && S.party && Array.isArray(S.party.field) && typeof rosterLive === 'function' && rosterLive() ? S.party.field.filter(isRecruited).slice(0, 3) : []);
      const sig = [cls(), a.hero.map(x => x.id + x.rank + x.item.id).join(), a.comp.map(x => x.char + x.id + x.rank).join(), field.join(), JSON.stringify(S.legend.book)].join('|');
      if (force || sig !== B.sig) {
        B.sig = sig;
        B.hero.textContent = '';
        B.hero.append(el('div', 'lg-lbl', `Hero · ${a.hero.length}/${LEG_TUNE.heroMax}`));
        for (let i = 0; i < LEG_TUNE.heroMax; i++) {
          const x = a.hero[i], s = el('div', 'lg-slot' + (x ? '' : ' empty'));
          if (x) {
            s.append(lgTile(x.id));
            const t = el('div', 'lg-st'); t.append(el('b', null, P(x.id).n), el('small', null, `Rank ${rn(x.rank)} · ${itemName(x.item)}`));
            s.append(t);
          } else {
            const e = el('div', 'lg-ic empty'); s.append(e);
            s.append(el('small', 'lg-st', cls() ? 'Empty. Inscribe a power from your Book on gear you wear.' : 'Choose a class to use hero powers.'));
          }
          B.hero.append(s);
        }
        if (field.length) {
          B.comp.hidden = false; B.comp.textContent = '';
          B.comp.append(el('div', 'lg-lbl', 'Companions · 1 each'));
          for (const k of field) {
            const x = a.comp.find(c => c.char === k);
            const r = el('div', 'lg-crow');
            r.append(img(safe(() => portraitURL(k), iconURL('mug', '#8C6A43')), 'lg-cpt'));
            r.append(el('span', 'lg-cn', firstName(k)));
            r.append(el('span', 'lg-cp' + (x ? '' : ' none'), x ? `${P(x.id).n} ${rn(x.rank)}` : 'No power'));
            B.comp.append(r);
          }
        } else B.comp.hidden = true;
      }
      // Legendary items to learn (rebuilt only when that list changes, never under a finger)
      const L = toLearn(), w = wearers();
      const lsig = L.map(it => it.id + ':' + legendKnown(it.lg) + ':' + legendEchoes(it.lg) + ':' + (w.get(it.id) ? 1 : 0)).join() + '|' + B.arm;
      if ((force || !busy()) && lsig !== B.lsig) {
        B.lsig = lsig; B.learn.textContent = '';
        if (!L.length) return;
        B.learn.append(el('div', 'lg-lbl', `To learn · ${L.length}`));
        const list = el('div', 'lg-list');
        for (const it of L) list.append(learnRow(it, w.get(it.id), () => { B.lsig = ''; ui(true); }, B));
        B.learn.append(list);
      }
    }
  });
  // One legendary item: what learning it does, and Learn with an in-page confirm (arm lives on holder.arm).
  function learnRow(it, wr, re, holder) {
    const id = it.lg, known = legendKnown(id), echo = known && it.lr <= known, up = known && it.lr > known;
    const r = el('div', 'lg-lrow');
    const t = icTile(itemIc(it), 'legendary'); r.append(t);
    const tx = el('div', 'lg-st');
    tx.append(el('b', 'rar-legendary', `${P(id).n} (rank ${rn(it.lr)})`));
    tx.append(el('small', null, (echo ? `You know it: learning adds an Echo (${Math.min(LEG_TUNE.echoPerRank, legendEchoes(id) + 1)}/${LEG_TUNE.echoPerRank}).`
      : up ? `Raises it from rank ${rn(known)} to ${rn(it.lr)}.` : 'Learn it to keep it forever.') + (wr ? ` ${wr.who === 'hero' ? 'You wear' : firstName(wr.who) + ' wears'} it now.` : '')));
    t.addEventListener('click', () => { if (typeof craftUI === 'object' && craftUI) craftUI.openItem(it.id); });
    r.append(tx);
    const armed = holder.arm === it.id;
    const b = btn('mini ' + (armed ? 'lg-arm' : 'go'), armed ? 'Learn it' : 'Learn', () => {
      if (!armed) { holder.arm = it.id; re(); return; }
      holder.arm = null;
      act(() => legendLearn(it.id)); re();
    });
    r.append(b);
    if (armed) {
      const q = el('div', 'lg-ask');
      q.append(el('p', 'note warn', `${itemName(it)} breaks down and its salvage comes back. ${P(id).n} goes into your Lantern Book${echo ? ' as an Echo' : ''}. Tap Learn it again to confirm.`));
      q.append(btn('mini', 'Keep it', () => { holder.arm = null; re(); }));
      r.append(q);
    }
    return r;
  }

  // ---------------- Lantern Book ----------------
  let K = null, bookFilt = 'you', openId = null;
  try { const v = JSON.parse(localStorage.getItem('lanternfall.legend.ui') || '{}'); if (['you', 'party', 'all'].includes(v.f) && !(soloOn() && v.f === 'party')) bookFilt = v.f; } catch (e) {}
  const keepUi = () => { try { localStorage.setItem('lanternfall.legend.ui', JSON.stringify({ f: bookFilt })); } catch (e) {} };
  function bookIds(f) {
    const c = cls(), known = id => legendKnown(id) > 0;
    const groups = [];
    const clsIds = c => (LEG_CLASS_IDS[c] || []);
    if (f === 'you' || f === 'all') {
      const order = f === 'all' ? [c].concat(LEG_CLASSES.filter(x => x !== c)).filter(Boolean) : c ? [c] : [];
      for (const k of order) groups.push({ n: HERO_CLASSES[k] ? HERO_CLASSES[k].name : k, ids: clsIds(k) });
      const pin = LEG_PIN_IDS.filter(id => P(id) && known(id));
      if (pin.length) groups.push({ n: 'Pinnacle', ids: pin });
    }
    if (!soloOn() && (f === 'party' || f === 'all')) groups.push({ n: 'Companions', ids: LEG_COMP_IDS.slice() });
    for (const g of groups) g.ids.sort((a, b) => (known(b) - known(a)) || (legendKnown(b) - legendKnown(a)));
    return groups;
  }
  registerSection('forge', {
    id: 'legend-book', title: 'Lantern Book', view: 'powers',
    mount(sec) {
      const head = el('div', 'sec-head'); head.append(sec.querySelector('.sec-title'));
      const count = el('span', 'note lg-count'); head.append(count); sec.prepend(head);
      const filt = el('div', 'seg cf-seg lg-filt'); filt.setAttribute('aria-label', 'Show powers');
      for (const [f, n] of [['you', 'For you'], ['party', 'For your party'], ['all', 'All']].filter(x => !(soloOn() && x[0] === 'party'))) {
        const b = btn(null, n, () => { bookFilt = f; keepUi(); K.sig = ''; ui(true); }); b.dataset.f = f; filt.append(b);
      }
      const list = el('div', 'lg-book');
      sec.append(filt, list);
      K = { count, filt, list, sig: '' };
    },
    update(force) {
      if (!on0()) return;
      for (const b of K.filt.children) putAttr(b, 'aria-pressed', String(b.dataset.f === bookFilt));
      const L = S.legend, a = legendActive();
      const nKnown = Object.keys(L.book).filter(id => P(id)).length;
      putText(K.count, `${nKnown} of ${LEG_IDS.length - LEG_PIN_IDS.length} learned`);
      const ins = inscribed();
      const sig = [bookFilt, cls(), JSON.stringify(L.book), JSON.stringify(L.echo), legendEchoCap(), openId,
        Object.entries(ins).map(([k, l]) => k + l.map(x => x.it.id + (x.wr ? x.wr.who : '')).join('.')).join(),
        a.hero.map(x => x.id).join() + a.comp.map(x => x.id).join()].join('|');
      if (sig === K.sig || (!force && busy())) return;
      K.sig = sig;
      K.list.textContent = '';
      const groups = bookIds(bookFilt);
      if (!groups.length) { K.list.append(el('p', 'note', 'Choose a class to find hero powers.')); return; }
      const activeIds = new Set(a.hero.map(x => x.id).concat(a.comp.map(x => x.id)));
      for (const g of groups) {
        const n = g.ids.filter(id => legendKnown(id)).length;
        K.list.append(el('h4', 'lg-gh', `${g.n} · ${n}/${g.ids.length}`));
        const box = el('div', 'lg-list dz-list');
        for (const id of g.ids) box.append(bookRow(id, ins, activeIds.has(id)));
        K.list.append(box);
      }
    }
  });
  function bookRow(id, ins, active) {
    const p = P(id), r = legendKnown(id), e = legendEchoes(id);
    const row = el('div', 'lg-row' + (r ? '' : ' unknown') + (active ? ' active' : ''));
    const hit = el('div', 'lg-hit');
    hit.append(lgTile(id, !r));
    const body = el('div', 'lg-rb');
    const top = el('div', 'lg-rt'); top.append(el('b', null, p.n), pips(r));
    body.append(top);
    const sub = el('small', 'lg-rs');
    if (r) {
      const capR = legendEchoCap(), maxed = r >= LEG_TUNE.ranks;
      const eTxt = maxed ? 'Top rank' : r >= capR && e >= LEG_TUNE.echoPerRank ? `Echoes ${LEG_TUNE.echoPerRank}/${LEG_TUNE.echoPerRank}, waiting` : `Echoes ${e}/${LEG_TUNE.echoPerRank}`;
      sub.append(el('span', 'lg-echo', eTxt), document.createTextNode(' · '), el('span', (ins[id] ? 'lg-on' : '') + (active ? ' act' : ''), whereTxt(id, ins)));
    } else sub.textContent = hintTxt(id);
    body.append(sub);
    hit.append(body);
    row.append(hit);
    const more = el('div', 'lg-more');
    const dz = disclose(row, hit, o => { openId = o ? id : (openId === id ? null : openId); });
    hit.append(dz.chev);
    hit.setAttribute('aria-label', `${p.n}: show details`);
    const cur = r || 1;
    more.append(el('p', 'lg-txt', (r ? `Rank ${rn(r)}: ` : 'Rank I: ') + legendText(id, cur)));
    if (r && r < LEG_TUNE.ranks) more.append(el('p', 'note', `Rank ${rn(r + 1)}: ${legendText(id, r + 1)}`));
    more.append(el('p', 'note', `Goes on: ${fitsTxt(id)}.`));
    if (r) {
      const capR = legendEchoCap();
      if (r < LEG_TUNE.ranks) more.append(el('p', 'note', r >= capR
        ? `Echoes are saved for now. Keep a higher Oath and they raise it to rank ${rn(r + 1)}.`
        : `${LEG_TUNE.echoPerRank - Math.min(e, LEG_TUNE.echoPerRank)} more Echo${LEG_TUNE.echoPerRank - e === 1 ? '' : 'es'} for rank ${rn(r + 1)}. A repeat drop is an Echo.`));
      for (const x of (ins[id] || []).slice(1)) more.append(el('p', 'note', `Also on ${itemName(x.it)}.`));
      if (p.fits === 'hero' && p.cls && p.cls !== cls()) more.append(el('p', 'note warn', `Works for a ${HERO_CLASSES[p.cls].name} hero only.`));
      else more.append(btn('mini go lg-inb', 'Inscribe on...', () => openInscribe(id)));
    } else more.append(el('p', 'note', `Find it: ${hintTxt(id)}`));
    row.append(more);
    if (openId === id) dz.set(true);
    return row;
  }

  // ---------------- Inscribe on... (a sheet) ----------------
  let ins = null;
  function openInscribe(id) {
    if (typeof openSheet !== 'function' || !legendKnown(id)) return;
    const api = openSheet(() => {}, { label: `Inscribe ${P(id).n}`, small: true, onClose: () => { if (ins && ins.api === api) ins = null; } });
    api.sheet.classList.add('cf-sheet', 'lg-sheet');
    ins = { api, id, arm: null, sig: '' };
    renderInscribe();
  }
  function costBox(c) {
    const box = el('div', 'costs');
    const mats = {}; if (c.pearlLive && c.pearls) mats.pearl = c.pearls; mats.ess = c.ess;
    safe(() => costChips(box, mats, c.t, c.gold));
    return box;
  }
  function renderInscribe() {
    if (!ins || ins.api.closed) return;
    const { api, id } = ins, p = P(id), r = legendKnown(id), body = api.body, top = body.scrollTop;
    body.textContent = ''; api.foot.textContent = '';
    const head = el('div', 'lg-ihead');
    head.append(lgTile(id));
    const t = el('div', 'lg-st'); t.append(el('h3', 'lg-ih', p.n), el('small', null, `Rank ${rn(r)} · ${fitsTxt(id)}`));
    head.append(t); body.append(head);
    body.append(el('p', 'lg-txt', legendText(id, r)));
    body.append(el('p', 'note', 'Inscribing keeps the item\'s tier, bonus lines, Masterwork and upgrades. One power per item: a new one replaces the old. The power grows with its rank in your Book.'));
    const w = wearers();
    const list = S.items.filter(it => !it.lr && !it.u && lgFits(it, id))
      .sort((a, b) => ((w.get(b.id) ? (w.get(b.id).who === 'hero' ? 2 : 1) : 0) - (w.get(a.id) ? (w.get(a.id).who === 'hero' ? 2 : 1) : 0)) || itemPower(b) - itemPower(a));
    if (!list.length) {
      body.append(el('p', 'note warn', `Nothing you made fits. ${p.n} goes on: ${fitsTxt(id).toLowerCase()}. Craft one first.`));
      body.append(btn('big forge', 'Go to Make', () => { api.close(true); setTab('make'); }));
    }
    for (const it of list) {
      const c = legendCanInscribe(id, it.id), wr = w.get(it.id), armed = ins.arm === it.id;
      const row = el('div', 'lg-pick' + (it.lg === id ? ' has' : ''));
      const tile = icTile(itemIc(it), frameOf(it), it.lg ? 'lg-pip' : null); row.append(tile);
      tile.addEventListener('click', () => { if (typeof craftUI === 'object' && craftUI) craftUI.openItem(it.id); });
      const tx = el('div', 'lg-st');
      tx.append(el('b', 'rar-' + it.r, itemName(it)));
      const bits = [];
      if (wr) bits.push(wr.who === 'hero' ? 'You wear it' : `${firstName(wr.who)} wears it`);
      bits.push(`Power ${fmt(itemPower(it))}`);
      tx.append(el('small', null, bits.join(' · ')));
      if (it.lg && it.lg !== id && P(it.lg)) tx.append(el('small', 'lg-repl', `Has ${P(it.lg).n}: it would be replaced.`));
      row.append(tx);
      const b = btn('mini ' + (armed ? 'lg-arm' : 'go'), it.lg === id ? 'Has it' : armed ? 'Inscribe' : 'Pick', () => {
        if (!armed) { ins.arm = it.id; renderInscribe(); return; }
        ins.arm = null;
        if (act(() => legendInscribe(id, it.id))) { const a = api; ins = null; a.close(); return; }
        renderInscribe();
      });
      b.disabled = !c.ok && !(it.lg === id);
      if (it.lg === id) b.disabled = true;
      row.append(b);
      if (c.cost && it.lg !== id) row.append(costBox(c.cost));
      if (!c.ok && c.why && it.lg !== id) row.append(el('div', 'lg-why', c.why));
      if (armed) {
        const q = el('div', 'lg-ask');
        q.append(el('p', 'note warn', `Inscribe ${p.n} on ${itemName(it)}?${it.lg && P(it.lg) ? ` ${P(it.lg).n} comes off (it stays in your Book, no refund).` : ''} Tap Inscribe again to confirm.`));
        q.append(btn('mini', 'Cancel', () => { ins.arm = null; renderInscribe(); }));
        row.append(q);
      }
      body.append(row);
    }
    body.scrollTop = top;
    ins.sig = inscSig();
  }
  const inscSig = () => ins ? [JSON.stringify(S.mats.ess), S.gold >= 0 ? Math.floor(Math.log10(S.gold + 1) * 20) : 0, S.items.length, JSON.stringify(S.equip), legendKnown(ins.id)].join('|') : '';
  let insAt = 0;
  onTick(() => {
    if (!ins || ins.api.closed || busy() || Date.now() - insAt < 1000) return;
    insAt = Date.now();
    if (inscSig() !== ins.sig) safe(renderInscribe);
  });

  // ---------------- Circle sets ----------------
  let Z = null, setOpen = new Set();
  registerSection('forge', {
    id: 'legend-sets', title: 'Circle sets', view: 'powers',
    mount(sec) {
      const head = el('div', 'sec-head'); head.append(sec.querySelector('.sec-title'));
      const cap = el('span', 'lg-capchip', 'Capped'); cap.hidden = true;
      head.append(cap); sec.prepend(head);
      const sig = el('div', 'lg-sigils'); sig.setAttribute('aria-label', 'Circle Crests');
      const sigEls = LEG_CIRCLES.map((c, i) => {
        const s = el('div', 'lg-sig'); s.append(img(sigURL(i)));
        const n = el('b'); const t = el('small', null, shortName(i));
        s.setAttribute('aria-label', `${circleName(i)} Sigils`);
        s.append(n, t); sig.append(s); return n;
      });
      const list = el('div', 'lg-sets');
      const note = el('p', 'note', `Mark gear on its item sheet: 1 Circle Crest and ${LEG_COST.mark.pearls} Pearls of its tier. Marked pieces you wear count. Two sets can be on at once. Circle Crests are not on the road yet.`);
      sec.append(sig, list, note);
      Z = { cap, sigEls, list, sig: '' };
    },
    update(force) {
      if (!on0()) return;
      const s = legendSets(), bu = legendBudget();
      putHidden(Z.cap, !bu.hit);
      Z.sigEls.forEach((n, i) => putText(n, String(S.legend.sig[i] | 0)));
      const sig = [s.n.join(), JSON.stringify(s.tier), s.active.join(), [...setOpen].join()].join('|');
      if (sig === Z.sig || (!force && busy())) return;
      Z.sig = sig; Z.list.textContent = '';
      LEG_CIRCLES.forEach((c, i) => Z.list.append(setCard(c, i, s)));
    }
  });
  function setCard(c, i, s) {
    const d = LEG_SETS[c], n = s.n[i], tier = s.tier[c], on = s.active.includes(c);
    const card = el('div', 'lg-set' + (on ? ' on' : '') + (n ? '' : ' none'));
    const hit = el('div', 'lg-sethit');
    hit.append(img(sigURL(i), 'lg-sigic'));
    const t = el('div', 'lg-st');
    const nm = el('b', null, d.n);
    t.append(nm, el('small', null, n ? `${cap1(circleName(i))} · ${n} marked piece${n === 1 ? '' : 's'} worn` : cap1(circleName(i))));
    hit.append(t);
    const chips = el('div', 'lg-tiers');
    for (const k of LEG_TUNE.setTiers) chips.append(el('span', 'lg-tier' + (tier >= k ? ' on' : n >= k ? ' off' : ''), String(k)));
    hit.append(chips);
    card.append(hit);
    const bar = el('div', 'lg-setbar'); const f = el('i'); f.style.width = Math.min(100, n / 6 * 100) + '%'; bar.append(f); card.append(bar);
    const next = LEG_TUNE.setTiers.find(k => k > n);
    const more = el('div', 'lg-more');
    for (const k of LEG_TUNE.setTiers) {
      const tr = d.tiers[k], ln = el('p', 'lg-tl' + (tier >= k ? ' on' : ''));
      ln.append(el('b', null, `${k} pieces${tr.n ? ': ' + tr.n : ''}. `), document.createTextNode(tr.txt));
      more.append(ln);
    }
    if (!on && n >= 2) more.append(el('p', 'note warn', 'Two other sets have more pieces worn. Only the 2 biggest sets are on.'));
    const lead = el('p', 'lg-next note');
    lead.textContent = on ? (next ? `On. ${next - n} more marked piece${next - n > 1 ? 's' : ''} for the ${next}-piece bonus.` : 'On. Every bonus is on.')
      : n ? `Needs ${next - n} more marked piece${next - n > 1 ? 's' : ''}.` : 'No marked pieces worn yet.';
    card.append(lead, more);
    const dz = disclose(card, hit, o => { if (o) setOpen.add(c); else setOpen.delete(c); });
    hit.append(dz.chev);
    hit.setAttribute('aria-label', `${d.n}: show bonuses`);
    if (setOpen.has(c)) dz.set(true);
    return card;
  }

  // ================= item sheet boxes (75-craft-ui calls these) =================
  // The power and mark lines at the top of an item card.
  function lines(it, who) {
    const L = safe(() => itemLegendLines(it, who), []);
    if (!L.length) return null;
    const box = el('div', 'lg-lines');
    for (const x of L) {
      const r = el('div', 'cf-line g-lg' + (x.on ? '' : ' off') + (x.k === 'mark' ? ' mark' : ''));
      r.append(img(x.k === 'power' ? icon(x.id) : sigURL(LEG_CIRCLES.indexOf(x.circle)), 'cf-li lg-li'));
      r.append(el('span', 'cf-lt', x.txt));
      r.append(el('small', 'cf-tag', x.k === 'power' ? (x.on ? 'Legendary' : 'Off') : 'Circle'));
      if (x.sub) r.append(el('small', 'cf-wait lg-sub', x.sub));
      box.append(r);
    }
    return box;
  }
  const secBox = (title, ...kids) => { const s = el('div', 'cf-ss'); if (title) s.append(el('h4', null, title)); s.append(...kids); return s; };
  const markable = it => { const d = CRAFT_KINDS[it.slot]; return !!d && !it.u && ((d.cls && LEG_FITS.hero.includes(d.pos)) || d.comp === 'wpn' || d.comp === 'trk'); };
  function itemBoxes(it, st, re) {
    const out = [];
    if (!on0() || !it) return out;
    const unlocked = typeof isUnlocked !== 'function' || isUnlocked('powers');
    // Learn
    if (it.lg && it.lr && P(it.lg)) {
      const box = el('div', 'lg-ibox');
      const holder = { get arm() { return st.lgArm === 'learn' ? it.id : null; }, set arm(v) { st.lgArm = v ? 'learn' : null; } };
      box.append(learnRow(it, wearers().get(it.id), re, holder));
      const sb = secBox('Lantern Book', box); sb.dataset.top = '1'; out.push(sb);
    }
    if (!unlocked) return out;
    // Inscribe: the Book powers that fit this crafted item
    if (!it.lr && !it.u) {
      const fit = Object.keys(S.legend.book).filter(id => P(id) && lgFits(it, id) && legendKnown(id));
      if (fit.length) {
        const box = el('div', 'lg-ibox');
        const cur = it.lg && P(it.lg) ? it.lg : null;
        if (cur) box.append(el('p', 'note', `It carries ${P(cur).n}. A new power replaces it (no refund).`));
        for (const id of fit) {
          if (id === cur) continue;
          const c = legendCanInscribe(id, it.id), armed = st.lgArm === 'insc:' + id;
          const r = el('div', 'lg-pick');
          r.append(lgTile(id));
          const tx = el('div', 'lg-st'); tx.append(el('b', 'rar-legendary', `${P(id).n} ${rn(legendKnown(id))}`), el('small', null, legendText(id, legendKnown(id))));
          r.append(tx);
          const b = btn('mini ' + (armed ? 'lg-arm' : 'go'), armed ? 'Inscribe' : 'Pick', () => {
            if (!armed) { st.lgArm = 'insc:' + id; re(); return; }
            st.lgArm = null; act(() => legendInscribe(id, it.id)); re();
          });
          b.disabled = !c.ok; r.append(b);
          if (c.cost) r.append(costBox(c.cost));
          if (!c.ok && c.why) r.append(el('div', 'lg-why', c.why));
          if (armed) { const q = el('div', 'lg-ask'); q.append(el('p', 'note warn', `Inscribe ${P(id).n} on this item? Tap Inscribe again to confirm.`), btn('mini', 'Cancel', () => { st.lgArm = null; re(); })); r.append(q); }
          box.append(r);
        }
        if (box.children.length) out.push(secBox('Inscribe a power', box));
      }
    }
    // Mark
    if (markable(it)) {
      const box = el('div', 'lg-ibox');
      const have = S.legend.sig;
      if (it.cm != null && LEG_CIRCLES[it.cm]) box.append(el('p', 'note', `It carries the ${circleName(it.cm)} mark. A new mark replaces it.`));
      if (!have.some(n => n > 0)) box.append(el('p', 'note', 'Marking needs a Circle Crest. They are not on the road yet.'));
      else {
        const row = el('div', 'lg-marks');
        LEG_CIRCLES.forEach((c, i) => {
          const b = btn('lg-mk' + (st.lgArm === 'mark:' + i ? ' armed' : '') + (it.cm === i ? ' cur' : ''), null, () => { st.lgArm = st.lgArm === 'mark:' + i ? null : 'mark:' + i; re(); });
          b.append(img(sigURL(i)), el('b', null, String(have[i] | 0)), el('small', null, shortName(i)));
          b.disabled = it.cm === i || !(have[i] > 0);
          b.setAttribute('aria-label', `${circleName(i)} mark, ${have[i] | 0} Sigils`);
          row.append(b);
        });
        box.append(row);
        const m = /^mark:(\d)$/.exec(st.lgArm || '');
        if (m) {
          const i = +m[1], c = legendCanMark(it.id, i);
          const q = el('div', 'lg-ask');
          const set = LEG_SETS[LEG_CIRCLES[i]];
          q.append(el('p', 'note', `Counts toward ${set.n}. With 2 pieces worn: ${set.tiers[2].txt}${it.cm != null && it.cm !== i ? ` It replaces the ${circleName(it.cm)} mark.` : ''}`));
          if (c.cost && c.cost.pearlLive) q.append(costBox({ pearlLive: true, pearls: c.cost.pearls, ess: 0, t: c.cost.t, gold: 0 }));
          if (!c.ok) q.append(el('div', 'lg-why', c.why));
          const go = btn('mini go', `Mark it (1 ${shortName(i)} Sigil)`, () => { st.lgArm = null; act(() => legendMark(it.id, i)); re(); });
          go.disabled = !c.ok;
          const bs = el('div', 'lg-askb'); bs.append(btn('mini', 'Cancel', () => { st.lgArm = null; re(); }), go); q.append(bs);
          box.append(q);
        }
      }
      out.push(secBox('Circle mark', box));
    }
    return out;
  }

  // ================= Party tab helpers =================
  function heroLine() {
    if (!on0()) return null;
    const a = legendActive();
    if (!a.hero.length && !(typeof isUnlocked !== 'function' || isUnlocked('powers'))) return null;
    return { n: a.hero.length, txt: `Powers ${a.hero.length}/${LEG_TUNE.heroMax}` + (a.hero.length ? ': ' + a.hero.map(x => `${P(x.id).n} ${rn(x.rank)}`).join(', ') : '') };
  }
  // Sets chips for the Synergies section: "Hedgefolk 4/6", lit when a tier is on.
  let rowSig = '';
  function setsRow(box) {
    if (!on0()) return false;
    const s = legendSets();
    const sig = s.n.join() + JSON.stringify(s.tier);
    const shown = s.n.some(n => n > 0);
    if (sig === rowSig && box.childElementCount === (shown ? 1 + s.n.filter(n => n > 0).length : 0)) return shown;
    rowSig = sig; box.textContent = '';
    if (!shown) return false;
    box.append(el('span', 'lg-setslbl', 'Sets'));
    LEG_CIRCLES.forEach((c, i) => {
      const n = s.n[i]; if (!n) return;
      const t = s.tier[c], next = LEG_TUNE.setTiers.find(k => k > n);
      const b = btn('syn-chip lg-schip' + (t ? ' on' : ''), null, () => setTab('powers', '#sec-legend-sets'));
      b.append(el('i'), el('span', null, `${shortName(i)} ${Math.min(n, 6)}/6`));
      if (next && !t) b.append(el('small', null, `needs ${next - n} more marked piece${next - n > 1 ? 's' : ''}`));
      b.setAttribute('aria-label', `${LEG_SETS[c].n}: ${n} of 6 marked pieces${t ? `, ${t}-piece bonus on` : ''}. Open Circle sets.`);
      box.append(b);
    });
    return true;
  }

  // ================= away card =================
  let away = null;
  on('awayBegin', () => { away = { drops: 0, sig: 0 }; });
  on('legendDrop', () => { if (away) away.drops++; });
  on('legendSigil', e => { if (away && e) away.sig += e.n | 0; });
  on('awayEnd', () => { setTimeout(() => { away = null; }, 0); });
  if (typeof registerAwayLine === 'function') registerAwayLine(() => {
    if (!away || !(away.drops || away.sig)) return null;
    const bits = [];
    if (away.drops) bits.push(`${away.drops} legendary power${away.drops > 1 ? 's' : ''} found`);
    if (away.sig) bits.push(`${away.sig} Circle Crest${away.sig > 1 ? 's' : ''}`);
    return { icon: { ic: legendIcon('tidewall') }, txt: bits.join(', '), sub: 'See Craft, then Powers' };
  });

  legendUI = { icon, lines, itemBoxes, heroLine, setsRow, openInscribe };
}
