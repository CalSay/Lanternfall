// 75-party: the Party tab. Browser-only. Spec: docs/design/party-and-classes.md 7.2.
// Top to bottom: formation editor, hero card, the 3 fielded companions, synergies, the roster
// grid (bench and locked), leads. Tapping a card or tile opens the character sheet
// (75-party-sheet.js). A red dot on the tab marks an unread camp story or a promotion ready.
// Reads the roster API (56-roster.js); synergies (56b) and leads (56c) only when present.
{
  const { safe, live, C, heroClass, heroCol, portrait, frameCol, first, pip, costText, weaponNoun, gearOf, slotTile,
    traits, synergiesFor, missingText, leadList, pctOf, xpInfo, inField, needsYou, HERO_GEAR_NOUN, HERO_SLOTS, COL_NAME, fnActive } = PTY;
  const RAR_ORDER = { legendary: 0, epic: 1, rare: 2, common: 3 };
  const P = () => S.party;
  const field = () => (live() && Array.isArray(P().field) ? P().field.filter(isRecruited).slice(0, 3) : []);
  const setT = (n, t) => { if (n.textContent !== t) n.textContent = t; };
  const saveUi = () => { try { save(); } catch (e) {} ui(true); };
  const btn = (cls, text, fn) => { const b = el('button', cls, text); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; };

  // ================= formation =================
  let picked = null, formSig = '', formRefs = null;
  const cellsNow = () => (P().cells && typeof P().cells === 'object' ? P().cells : {});
  const nameOf = k => k === 'hero' ? S.name : C(k).name;
  const occupant = (col, lane) => Object.keys(cellsNow()).find(k => cellsNow()[k].col === col && cellsNow()[k].lane === lane && (k === 'hero' || inField(k)));
  // The hero stays in their class column; companions may stand anywhere (the warning line says when it is unwise).
  function canMove(k, col, lane) {
    const cells = cellsNow(), from = cells[k]; if (!from) return false;
    if (k === 'hero' && col !== heroCol()) return false;
    const o = occupant(col, lane);
    if (o === 'hero' && from.col !== heroCol()) return false;
    return true;
  }
  function moveTo(k, col, lane) {
    if (!canMove(k, col, lane)) return false;
    const cells = { ...cellsNow() }, o = occupant(col, lane);
    if (o === k) return false;
    if (o) cells[o] = { ...cells[k] };
    cells[k] = { col, lane };
    P().cells = cells;                 // a new object: the stage watches identity
    emit('fieldChange', { field: P().field });
    return true;
  }
  function warning() {
    const cells = cellsNow(), f = field();
    const at = k => cells[k] ? cells[k].col : -1;
    for (const k of f) { const r = C(k).role; if ((r === 'support' || r === 'caster') && at(k) === 2) return `${first(k)} is a ${r} in the Front row. ${r === 'support' ? 'Supports' : 'Casters'} are safer at the back.`; }
    const front = ['hero'].concat(f).some(k => at(k) === 2);
    if (!front && f.length) return 'Nobody stands in the Front row to hold the enemy back.';
    const frontFree = !occupant(2, 0) || !occupant(2, 1);
    if (frontFree) for (const k of f) if (C(k).role === 'tank' && at(k) !== 2) return `${first(k)} is a tank in the ${COL_NAME[at(k)] || 'wrong'} row. Tanks hold the Front.`;
    return '';
  }
  function buildForm(sec) {
    const head = el('div', 'sec-head');
    const h = sec.querySelector('.sec-title'); head.append(h);
    const auto = btn('mini pf-auto', 'Auto', () => { picked = null; if (live()) { autoPlace(); saveUi(); } });
    auto.setAttribute('aria-label', 'Place everyone by role');
    head.append(auto); sec.prepend(head);
    const grid = el('div', 'pform');
    for (const n of COL_NAME) grid.append(el('div', 'pf-h', n));
    const cells = [];
    for (let lane = 0; lane < 2; lane++) for (let col = 0; col < 3; col++) {
      const b = btn('pf-cell');
      b.addEventListener('click', () => tapCell(col, lane));
      grid.append(b); cells.push({ b, col, lane });
    }
    const hint = el('p', 'note pf-hint');
    const warn = el('p', 'note warn pf-warn');
    sec.append(grid, hint, warn);
    formRefs = { cells, hint, warn, auto };
  }
  function tapCell(col, lane) {
    const o = occupant(col, lane);
    if (!picked) { if (o) picked = o; }
    else if (picked === o) picked = null;
    else if (canMove(picked, col, lane)) { moveTo(picked, col, lane); picked = null; try { save(); } catch (e) {} }
    else if (o) picked = o;
    formSig = ''; ui(true);
  }
  function updateForm() {
    const r = formRefs; if (!r) return;
    const sig = JSON.stringify(cellsNow()) + field().join() + picked + S.name + P().cls + typeof portraitURL;
    if (sig === formSig) return; formSig = sig;
    if (picked && picked !== 'hero' && !inField(picked)) picked = null;
    for (const c of r.cells) {
      const o = occupant(c.col, c.lane), b = c.b;
      b.textContent = '';
      b.className = 'pf-cell' + (o ? ' occ' : '') + (o === 'hero' ? ' hero' : '') + (picked && o === picked ? ' picked' : '') +
        (picked && picked !== o && !canMove(picked, c.col, c.lane) ? ' dim' : '') + (picked && picked !== o && canMove(picked, c.col, c.lane) ? ' drop' : '');
      if (o) {
        b.append(img(portrait(o)), el('span', 'who', o === 'hero' ? S.name : first(o)));
        if (o !== 'hero') { const d = el('i', 'rp r-' + C(o).role); b.append(d); }
      }
      const where = `${COL_NAME[c.col]} row, ${c.lane ? 'lower' : 'upper'} lane`;
      b.setAttribute('aria-label', o ? `${nameOf(o)}, ${where}${picked === o ? ', picked up' : ''}` : `Empty, ${where}`);
      b.setAttribute('aria-pressed', String(!!picked && picked === o));
      b.disabled = !o && !picked;
    }
    r.hint.textContent = picked ? `Moving ${picked === 'hero' ? S.name : first(picked)}. Tap a lit cell${picked === 'hero' ? ' in your class row' : ''}, or tap again to cancel.` : 'Tap someone, then tap a cell to move or swap them.';
    const w = warning(); r.warn.textContent = w; r.warn.hidden = !w;
  }

  // ================= hero card =================
  let heroRefs = null, heroSig = '';
  function buildHero(box) {
    box.textContent = '';
    const c = heroClass();
    const card = el('div', 'pcard hero tap'); card.tabIndex = 0; card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${S.name}, open hero sheet`);
    const top = el('div', 'pc-top');
    const pt = el('div', 'pt big'); pt.append(img(portrait('hero')));
    const who = el('div', 'pc-who');
    const nm = el('b', null, S.name);
    const sub = el('small');
    const tags = el('div', 'pc-tags'); if (c) tags.append(pip(c.role)); if (c && c.tapName) tags.append(el('small', null, 'Tap: ' + c.tapName));
    who.append(nm, sub, tags);
    top.append(pt, who, el('span', 'pc-more', '›'));
    card.append(top);
    const refs = { card, nm, sub };
    if (c && c.ability) {
      const ab = el('div', 'pc-ab');
      const line = el('div', 'pc-abline');
      const t = el('div'); t.append(el('em', null, c.ability.name)); const cdTxt = el('small', 'pc-cdtxt'); t.append(cdTxt);
      const cast = btn('mini go pc-cast', 'Cast', e => { e.stopPropagation(); if (typeof castAbility === 'function' && castAbility()) ui(true); });
      line.append(t, cast);
      const cd = el('div', 'pc-cd'); cd.append(el('i'));
      ab.append(line, cd); card.append(ab);
      Object.assign(refs, { cast, cdBar: cd.firstChild, cdTxt });
    }
    const gearBox = el('div', 'pc-gear');
    const nouns = HERO_GEAR_NOUN[P().cls] || {};
    for (const s of HERO_SLOTS) {
      const it = s.old ? equipped(s.old) : null;
      const d = el('div', 'pc-slot' + (s.old ? '' : ' soon'));
      d.append(it ? slotTile(it) : slotTile(null, s.old ? SLOT[s.old].icon : s.id === 'off' ? 'banner' : 'helm'), el('small', null, nouns[s.id] || s.n));
      d.title = it ? itemName(it) : s.old ? 'Empty' : 'Coming with crafting';
      gearBox.append(d);
    }
    card.append(gearBox);
    const open = () => partySheet.openHero();
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); open(); } });
    box.append(card);
    heroRefs = refs;
  }
  function updateHero(box) {
    const c = heroClass();
    const sig = [P().cls, typeof portraitURL, JSON.stringify(S.equip), S.name].join('|');
    if (sig !== heroSig || !heroRefs) { heroSig = sig; buildHero(box); }
    const r = heroRefs;
    setT(r.sub, (c ? c.name : 'Wanderer') + ' · Lv ' + S.L);
    if (r.cdBar) {
      const cdMax = c.ability.cd || 30, left = Math.max(0, +P().abilityCd || 0);
      r.cdBar.style.width = (100 - Math.min(100, left / cdMax * 100)) + '%';
      setT(r.cdTxt, left > 0 ? ` · ready in ${Math.ceil(left)}s` : ' · ready');
      r.cast.disabled = left > 0 || typeof castAbility !== 'function';
    }
  }

  // ================= companion cards =================
  let compSig = '', compRefs = [];
  function abilityName(k) {
    const t = traits(k); if (!t) return '';
    const a = t.find(x => x && /abil/i.test(x.kind || '')); return a ? a.name : '';
  }
  function buildComps(box, keys) {
    box.textContent = ''; compRefs = [];
    for (let i = 0; i < 3; i++) {
      const k = keys[i];
      if (!k) {
        const e = el('div', 'pcard empty');
        e.append(el('b', null, 'Open place'), el('small', null, 'Tap someone on the bench below to field them.'));
        box.append(e); continue;
      }
      const c = C(k);
      const card = el('div', 'pcard comp tap'); card.tabIndex = 0; card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `${c.name}, open character sheet`);
      card.style.setProperty('--rc', frameCol(k));
      const top = el('div', 'pc-top3');
      const pt = el('div', 'pt rf' + (c.rarity === 'legendary' ? ' leg' : '')); pt.append(img(portrait(k)));
      const dot = el('span', 'ndot'); dot.hidden = true; pt.append(dot);
      const who = el('div', 'pc-who');
      who.append(el('b', null, c.name), el('small', null, c.title));
      const meta = el('div', 'pc-tags'); const lv = el('span', 'pc-lv'); meta.append(pip(c.role), lv);
      const abn = abilityName(k); if (abn) meta.append(el('small', 'pc-abn', abn));
      who.append(meta);
      const gear = el('div', 'pc-g2');
      for (const [w, noun, ic] of [['wpn', weaponNoun(k), 'sword'], ['trk', 'Trinket', 'charm']]) {
        const it = gearOf(k, w); const t = slotTile(it, ic); t.title = it ? itemName(it) : `${noun}: coming soon`; gear.append(t);
      }
      top.append(pt, who, gear);
      const xr = el('div', 'pc-xrow');
      const bar = el('div', 'xbar'); const fill = el('i'); bar.append(fill);
      const badge = el('span', 'pc-badge'); badge.hidden = true;
      const prom = btn('buy pc-prom', null, e => { e.stopPropagation(); if (promoteChar(k)) saveUi(); });
      prom.append(el('span', 'qty', 'Promote'), el('span', 'price'));
      prom.hidden = true;
      xr.append(bar, badge, prom);
      card.append(top, xr);
      const open = () => partySheet.open(k);
      card.addEventListener('click', open);
      card.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); open(); } });
      box.append(card);
      compRefs.push({ k, lv, fill, bar, badge, prom, dot, pSig: '' });
    }
  }
  function updateComps(box) {
    const keys = field();
    const sig = keys.join(',') + '|' + typeof portraitURL + '|' + keys.map(k => { const r = charRec(k); return r.wpn + ':' + r.trk; }).join() + (fnActive() ? 1 : 0);
    if (sig !== compSig) { compSig = sig; buildComps(box, keys); }
    for (const r of compRefs) {
      const x = xpInfo(r.k); if (!x) continue;
      setT(r.lv, `Lv ${x.r.lv}/${x.cap} · ${ROSTER_RANKS[x.r.rank]}`);
      r.fill.style.width = (x.pct * 100).toFixed(1) + '%';
      r.bar.classList.toggle('cap', x.atCap);
      r.bar.title = x.atCap ? 'At the level cap' : `${Math.floor(x.pct * 100)}% to Lv ${x.r.lv + 1}`;
      const cu = Math.round(x.catchUp * 100);
      r.badge.hidden = !(cu > 0) || x.atCap; setT(r.badge, `+${cu}% XP`);
      const showP = x.atCap && !x.maxRank;
      r.prom.hidden = !showP;
      if (showP) {
        const pc = promoteCost(r.k), ps = pc.gold + ':' + canPromote(r.k);
        if (ps !== r.pSig) { r.pSig = ps; setPrice(r.prom, pc.gold); r.prom.disabled = !canPromote(r.k); r.prom.title = costText(pc); }
      }
      r.dot.hidden = !needsYou(r.k);
    }
  }

  // ================= synergies =================
  let synSig = '', synOpen = null;
  function updateSyn(sec) {
    const on = !!fnActive();
    sec.hidden = !on; if (!on) return;
    const list = synergiesFor(null) || [];
    const sig = JSON.stringify(list.map(s => [s.id, s.active, s.missing])) + synOpen;
    if (sig === synSig) return; synSig = sig;
    const row = sec.querySelector('.syn-row'), det = sec.querySelector('.syn-det');
    row.textContent = '';
    if (!list.length) { row.append(el('p', 'note', 'No synergies yet. Field characters who share a circle or a story.')); det.hidden = true; return; }
    for (const s of list) {
      const b = btn('syn-chip' + (s.active ? ' on' : ''), null, () => { synOpen = synOpen === s.id ? null : s.id; synSig = ''; updateSyn(sec); });
      b.append(el('i'), el('span', null, s.name));
      if (!s.active) b.append(el('small', null, missingText(s.missing)));
      b.setAttribute('aria-expanded', String(synOpen === s.id));
      row.append(b);
    }
    const cur = list.find(s => s.id === synOpen);
    det.hidden = !cur;
    if (cur) { det.textContent = ''; det.append(el('b', null, cur.name + (cur.active ? '' : ' (inactive)')), el('span', null, ' ' + (cur.text || ''))); if (cur.stageC) det.append(el('small', 'cs-soon', ' with party combat')); }
  }

  // ================= roster grid =================
  const FILTERS = ['all', 'tank', 'striker', 'caster', 'support'];
  let filt = 'all', sortBy = 'rarity', rosSig = '', rosRefs = null;
  try { const v = JSON.parse(localStorage.getItem('lanternfall.party.ui') || '{}'); if (FILTERS.includes(v.f)) filt = v.f; if (v.s === 'level' || v.s === 'rarity') sortBy = v.s; } catch (e) {}
  const keepUi = () => { try { localStorage.setItem('lanternfall.party.ui', JSON.stringify({ f: filt, s: sortBy })); } catch (e) {} };
  const SHORT = { quest: 'Quest', renown: 'Renown', token: 'Boss token', bestiary: 'Bestiary', achievement: 'Feat', tavern: 'Tavern visitor', craft: 'Crafting' };
  function shortHow(k, leadsById) {
    const cost = recruitCost(k), rt = C(k).route, l = leadsById[k], p = pctOf(l);
    if (cost) return cost.gold ? `Ready: ${fmt(cost.gold)} gold` : 'Ready to join';
    let s = rt.type === 'progress' ? `Reach zone ${rt.zone}` : SHORT[rt.type] || 'Locked';
    if (p != null && rt.type !== 'progress') s += ` · ${Math.floor(p * 100)}%`;
    return s;
  }
  function buildRosterHead(sec) {
    const head = el('div', 'sec-head');
    const h = sec.querySelector('.sec-title'); const cnt = el('span', 'ros-count'); h.append(cnt); head.append(h);
    const sort = btn('mini ros-sort', '', () => { sortBy = sortBy === 'rarity' ? 'level' : 'rarity'; keepUi(); rosSig = ''; ui(true); });
    head.append(sort); sec.prepend(head);
    const fl = el('div', 'ros-filt'); fl.setAttribute('role', 'group'); fl.setAttribute('aria-label', 'Show role');
    const fb = FILTERS.map(f => { const b = btn('', f === 'all' ? 'All' : PTY.ROLE_NAME[f], () => { filt = f; keepUi(); rosSig = ''; ui(true); }); fl.append(b); return b; });
    const grid = el('div', 'rgrid');
    sec.append(fl, grid);
    rosRefs = { cnt, sort, fb, grid };
  }
  function updateRoster() {
    const r = rosRefs; if (!r || !live()) return;
    const leadsById = {}; for (const l of leadList()) leadsById[l.id] = l;
    const rows = ROSTER_KEYS.map((k, i) => {
      const rec = charRec(k);
      return { k, i, rec, fielded: inField(k), how: rec ? '' : shortHow(k, leadsById), ready: !rec && !!recruitCost(k), flag: rec && needsYou(k) };
    });
    const sig = [filt, sortBy, typeof portraitURL, JSON.stringify(rows.map(x => [x.k, x.rec && x.rec.lv, x.rec && x.rec.rank, x.fielded, x.how, x.ready, x.flag]))].join('|');
    if (sig === rosSig) return; rosSig = sig;
    r.cnt.textContent = `${rows.filter(x => x.rec).length}/${rows.length}`;
    r.sort.textContent = sortBy === 'rarity' ? 'Sort: Rarity' : 'Sort: Level';
    r.sort.setAttribute('aria-label', `Sorted by ${sortBy}. Tap to sort by ${sortBy === 'rarity' ? 'level' : 'rarity'}.`);
    r.fb.forEach((b, i) => b.setAttribute('aria-pressed', String(FILTERS[i] === filt)));
    const shown = rows.filter(x => filt === 'all' || C(x.k).role === filt);
    const rar = x => RAR_ORDER[C(x.k).rarity];
    shown.sort((a, b) => (!!b.rec - !!a.rec) ||
      (sortBy === 'rarity' ? rar(a) - rar(b) || (b.rec ? b.rec.lv - a.rec.lv : 0) : (b.rec ? b.rec.lv - a.rec.lv : 0) || rar(a) - rar(b)) || a.i - b.i);
    r.grid.textContent = '';
    for (const x of shown) {
      const c = C(x.k);
      const t = btn('rtile' + (x.rec ? (x.fielded ? ' fielded' : ' bench') : ' locked') + (c.rarity === 'legendary' ? ' leg' : '') + (x.ready ? ' ready' : ''));
      t.style.setProperty('--rc', frameCol(x.k));
      const fr = el('span', 'rt-fr'); fr.append(img(portrait(x.k)));
      if (x.rec) {
        fr.append(el('span', 'rt-lv', 'Lv ' + x.rec.lv), el('i', 'rp r-' + c.role));
        if (x.fielded) fr.append(el('span', 'rt-in', 'In party'));
        if (x.flag) fr.append(el('span', 'ndot'));
      } else fr.append(el('i', 'rp r-' + c.role));
      t.append(fr, el('span', 'rt-nm', first(x.k)));
      if (!x.rec) { t.append(el('span', 'rt-ti', c.title), el('span', 'rt-how', x.how)); }
      t.setAttribute('aria-label', `${c.name}, ${c.title}. ${PTY.rarityName(x.k)} ${PTY.ROLE_NAME[c.role]}. ` + (x.rec ? `Level ${x.rec.lv}${x.fielded ? ', in the party' : ', on the bench'}.` : `Not recruited. ${recruitHow(x.k)}`));
      t.addEventListener('click', () => partySheet.open(x.k));
      r.grid.append(t);
    }
    if (!shown.length) r.grid.append(el('p', 'note', 'Nobody with that role yet.'));
  }

  // ================= leads =================
  let leadSig = '';
  function updateLeads(sec) {
    if (!live()) { sec.hidden = true; return; }
    const list = leadList();
    const sig = JSON.stringify(list.map(l => [l.id, l.name, l.how, l.sub, pctOf(l) != null ? Math.floor(pctOf(l) * 100) : null, l.action && l.action.label, l.ready]));
    sec.hidden = !list.length;
    if (sig === leadSig) return; leadSig = sig;
    const box = sec.querySelector('.leads'); box.textContent = '';
    for (const l of list) {
      const card = el('div', 'lead');
      if (C(l.id)) card.style.setProperty('--rc', frameCol(l.id));
      const pt = el('button', 'lead-pt' + (C(l.id) && !isRecruited(l.id) ? ' locked' : '')); pt.type = 'button';
      pt.setAttribute('aria-label', `Open ${l.name}`);
      if (C(l.id)) { pt.append(img(portrait(l.id))); pt.addEventListener('click', () => partySheet.open(l.id)); } else pt.disabled = true;
      const tx = el('div', 'lead-tx');
      tx.append(el('b', null, l.name), el('small', null, l.how || ''));
      const p = pctOf(l);
      if (p != null) { const bar = el('div', 'xbar xlead'); const i = el('i'); i.style.width = (p * 100).toFixed(1) + '%'; bar.append(i); tx.append(bar); if (l.sub) tx.append(el('small', 'lead-sub', l.sub)); }
      card.append(pt, tx);
      if (l.action) {
        const b = btn('mini go lead-go', l.action.label, () => { safe(() => l.action.fn()); leadSig = ''; saveUi(); });
        if (l.builtIn && l.ready === false) b.disabled = true;
        card.append(b);
      }
      box.append(card);
    }
  }

  // ================= tab dot =================
  const tabBtn = document.querySelector('.tab[data-tab="party"]');
  const pdot = el('span', 'dot pdot'); pdot.id = 'partyDot'; pdot.hidden = true;
  if (tabBtn) { tabBtn.append(pdot); }
  function updateDot() {
    if (!live()) { pdot.hidden = true; return; }
    const any = rosterList().some(needsYou);
    pdot.hidden = !any || S.tab === 'party';
    if (tabBtn) tabBtn.setAttribute('aria-label', 'Party' + (any ? ', something new' : ''));
  }
  // The same news marks the Roster sub-view (70-ui registerView).
  registerView('party', { id: 'roster', label: 'Roster', order: 20, dot: () => live() && rosterList().some(needsYou) });
  let dotT = 0;
  onTick(dt => { dotT -= dt; if (dotT <= 0) { dotT = 1; try { updateDot(); } catch (e) {} } });
  for (const ev of ['milestone', 'promote', 'recruit', 'storiesRead']) on(ev, () => { try { updateDot(); } catch (e) {} });
  if (tabBtn) tabBtn.addEventListener('click', () => updateDot());

  // ================= sections =================
  const guard = (name, fn) => (...a) => { try { fn(...a); } catch (e) { console.error('[lanternfall] party ' + name, e); } };
  registerSection('party', { id: 'party-form', title: 'Formation', mount: buildForm, update: guard('formation', updateForm) });
  registerSection('party', {
    id: 'party-hero', title: 'Your hero', mount(sec) { sec.append(el('div', 'pc-herobox')); },
    update: guard('hero', () => updateHero(document.querySelector('#sec-party-hero .pc-herobox')))
  });
  registerSection('party', {
    id: 'party-field', title: 'Fighting beside you', mount(sec) { sec.append(el('div', 'pcards')); },
    update: guard('companions', () => { if (live()) updateComps(document.querySelector('#sec-party-field .pcards')); })
  });
  registerSection('party', {
    id: 'party-syn', title: 'Synergies', mount(sec) { sec.hidden = true; sec.append(el('div', 'syn-row'), el('p', 'syn-det')); },
    update: guard('synergies', () => updateSyn(document.getElementById('sec-party-syn')))
  });
  registerSection('party', { id: 'party-roster', title: 'Roster', view: 'roster', mount: buildRosterHead, update: guard('roster', updateRoster) });
  registerSection('party', {
    id: 'party-leads', title: 'Leads', view: 'roster', mount(sec) { sec.append(el('div', 'leads')); },
    update: guard('leads', () => updateLeads(document.getElementById('sec-party-leads')))
  });
  // Keep an open sheet live while the tab updates.
  registerSection('party', { id: 'party-live', title: '', view: '*', mount(sec) { sec.hidden = true; }, update: guard('sheet', () => partySheet.refresh()) });
}
