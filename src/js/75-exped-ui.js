// 75-exped-ui: Expeditions in the Camp tab (tab id 'world', Camp part). One section, #sec-exped,
// placed after the building cards: the slots out now (timers, Collect, Repeat, Call back), then
// the open routes as compact cards grouped by band, then the log. Tapping a route opens the send
// sheet (openSheet from 75-party-sheet): length, a team of up to 3 benched companions, Best team,
// the grade with a hint for the next one, the haul preview, Send. Browser-only; the rules live in
// 57b-expeditions.js.
{
  const R = id => EXPED_ROUTES[id];
  const btn = (cls, txt) => { const b = el('button', cls, txt); b.type = 'button'; return b; };
  const setTxt = (e, t) => { if (e.textContent !== t) e.textContent = t; };
  const safe = (f, d) => { try { return f(); } catch (e) { console.error('[lanternfall] expeditions ui', e); return d; } };
  const first = id => ROSTER[id].name.replace(/^(Ser|Old|Brother|Saint) /, '').split(' ')[0];
  const left = s => { const m = Math.ceil(Math.max(0, s.end - Date.now()) / 60000); return m <= 0 ? 'Back' : m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60 ? ' ' + (m % 60) + 'm' : ''}`; };
  const hasArt = id => typeof portraitURL === 'function' && typeof RIG === 'object' && RIG.COMPANIONS && !!RIG.COMPANIONS[id];
  function portrait(id) {
    if (hasArt(id)) { try { const u = portraitURL(id); if (u) return u; } catch (e) {} }
    const c = ROSTER[id], i = c.idx, col = i >= 0 ? COMPS[i].col : CHAR_RARITY[c.rarity].col, helm = i >= 0 ? COMPS[i].helm : '#3A2F47';
    return spriteURL('camp:' + id, SPR.hero, { ...HERO_PAL, 1: col, 2: helm });
  }
  const famName = f => (MAT[f] && MAT[f].n) || f;
  const troIc = i => iconURL(...craftIcon('tro_' + TYPES[i].key, 1));
  // The route's icon: its main focus.
  function routeIcon(r) {
    const d = R(r), t = EXPED_BANDS[d.b].t, fam = Object.entries(d.f || {}).sort((a, b) => b[1] - a[1])[0];
    if (d.ks) return iconURL('sword', '#E0524F');
    if (d.K) return iconURL('banner', CHAR_RARITY[ROSTER[d.K].rarity].col);
    if (d.T) return troIc(d.T === 'any2' ? 5 : d.T[0]);
    if (d.L) return iconURL('b_book', '#5A7AB8', { 5: '#EFE6D6' });
    if (fam) return matIcon(fam[0], t);
    return iconURL('banner', '#F2C14E');
  }
  const focusText = r => {
    const d = R(r), out = [];
    if (d.ks) out.push('Kingslayer');
    if (d.K) out.push('Token');
    if (d.T) out.push('Trophies');
    for (const f of Object.keys(d.f || {})) out.push(famName(f));
    if (d.L) out.push('Lore');
    if (d.R) out.push('Renown');
    if (d.xp2) out.push('XP x2');
    return out.join(' · ');
  };
  const kinds = r => { const d = R(r), k = []; if (d.f) k.push('mat'); if (d.T) k.push('troph'); if (d.K) k.push('tok'); if (d.L || d.R || d.ks) k.push('lore'); return k; };
  const FILTERS = [['all', 'All'], ['mat', 'Materials'], ['troph', 'Trophies'], ['tok', 'Tokens'], ['lore', 'Lore']];
  let filter = 'all', pendingId = null;

  // Best team and grade per route, recomputed only when the bench or slots change.
  let bestSig = '', bestMap = {};
  function bests() {
    const sig = JSON.stringify([rosterList().map(k => [k, charRec(k).lv, charRec(k).rank]), S.party.field, S.exped.slots.map(s => s.team), S.maxZone]);
    if (sig === bestSig) return bestMap;
    bestSig = sig; bestMap = {};
    for (const r of expedRoutes()) { const t = safe(() => expedBest(r), []); bestMap[r] = { team: t, g: t.length ? expedGrade(r, t) : null }; }
    return bestMap;
  }

  // ---------------- the section ----------------
  let sec, head, slotBox, filtBox, routeBox, logBox, note, sigSlots = '', sigRoutes = '', sigLog = '';
  const armed = { key: null, at: 0 };
  const isArmed = k => armed.key === k && Date.now() - armed.at < 4000;
  sec = registerSection('camp', {
    id: 'exped', title: 'Expeditions', feature: 'exped',
    mount(s) {
      head = el('p', 'note');
      slotBox = el('div', 'ex-slots');
      filtBox = el('div', 'ex-filters');
      routeBox = el('div', 'ex-routes');
      logBox = el('details', 'ex-log');
      s.append(head, slotBox, filtBox, routeBox, logBox);
      for (const [k, n] of FILTERS) {
        const b = btn('ex-chip', n); b.dataset.k = k;
        b.addEventListener('click', () => { filter = k; sigRoutes = ''; ui(true); });
        filtBox.append(b);
      }
    },
    update() {
      const open = expedOpen();
      sec.hidden = !open || !campOpen(); if (sec.hidden) return;
      const n = expedSlots(), used = S.exped.slots.length;
      setTxt(head, pendingId ? `Pick a route for ${first(pendingId)}.` : used ? `Slots ${used}/${n}. Teams earn while you are away.` : `Slots 0/${n}. Send benched companions on a route you have cleared. Nothing can go wrong: the grade shows before you send.`);
      head.classList.toggle('warn', !!pendingId);
      drawSlots(n);
      for (const b of filtBox.children) b.classList.toggle('on', b.dataset.k === filter);
      drawRoutes();
      drawLog();
    }
  });
  // After the building cards, before the Blessings and the Roster board.
  { const b = document.getElementById('sec-camp-bless') || document.getElementById('sec-camp-roster'); if (b && b.parentNode === sec.parentNode) b.before(sec); }

  // ---------------- slots out now ----------------
  function drawSlots(n) {
    const sl = S.exped.slots, rep = safe(() => campMapRoom().repeat, false);
    const sig = JSON.stringify([n, rep, sl.map(s => [s.r, s.team, s.grade, s.repOn, s.rep, s.end <= Date.now(), left(s)]), [...Array(sl.length)].map((_, i) => isArmed('recall' + i))]);
    if (sig !== sigSlots) {
      sigSlots = sig; slotBox.textContent = '';
      sl.forEach((s, i) => {
        const G = EXPED_GRADES[s.grade], back = s.end <= Date.now();
        const row = el('div', 'ex-slot' + (back ? ' back' : ''));
        const pts = el('div', 'ex-pts');
        for (const id of s.team) { const p = el('span', 'ex-pt r-' + ROSTER[id].rarity); p.append(img(portrait(id))); pts.append(p); }
        const mid = el('div', 'ex-mid');
        const nm = el('div', 'ex-nm'); nm.append(el('span', null, R(s.r).n)); const gr = el('b', 'ex-g', G.n); gr.style.color = G.col; nm.append(gr);
        const bar = el('div', 'bar'), fill = el('i'); bar.append(fill); fill.dataset.slot = i;
        const foot = el('div', 'ex-foot');
        const sub = el('div', 'ex-sub', back ? 'Back!' : `${left(s)} left${s.repOn ? ` · run ${s.rep + 1}/${EXPED_TUNE.repMax}` : ` · ${s.h}h trip`}`);
        const acts = el('div', 'ex-acts');
        foot.append(sub, acts);
        mid.append(nm, bar, foot);
        if (back) { const c = btn('mini go', 'Collect'); c.addEventListener('click', () => { const x = expedCollect(i); if (x) showBack(x); ui(true); }); acts.append(c); }
        else {
          if (rep) { const t = btn('mini' + (s.repOn ? ' on' : ''), s.repOn ? 'Repeat on' : 'Repeat'); t.setAttribute('aria-pressed', String(!!s.repOn)); t.addEventListener('click', () => { expedRepeat(i, !s.repOn); ui(true); }); acts.append(t); }
          const k = 'recall' + i, c = btn('mini' + (isArmed(k) ? ' warn armed' : ''), isArmed(k) ? 'Tap again: half haul' : 'Call back');
          c.addEventListener('click', () => { if (isArmed(k)) { armed.key = null; const x = expedRecall(i); if (x) showBack(x); } else { armed.key = k; armed.at = Date.now(); } ui(true); });
          acts.append(c);
        }
        row.append(pts, mid);
        slotBox.append(row);
      });
      if (sl.length < n) {
        const b = btn('ex-free', `+ Send a team (${n - sl.length} slot${n - sl.length > 1 ? 's' : ''} free)`);
        b.addEventListener('click', () => { const r = pickRoute(); if (r) openSend(r); });
        slotBox.append(b);
      }
    }
    for (const f of slotBox.querySelectorAll('.bar > i')) { const s = sl[+f.dataset.slot]; if (s) f.style.width = Math.min(100, Math.max(0, (Date.now() - s.start) / (s.end - s.start) * 100)).toFixed(1) + '%'; }
  }
  // "+ Send a team": the open route whose best team reaches the highest grade.
  function pickRoute() {
    const b = bests(); let best = null;
    for (const r of expedRoutes()) { const x = b[r]; if (!x || !x.g) continue; if (!best || x.g.g > best.g) best = { r, g: x.g.g }; }
    return best ? best.r : expedRoutes()[0];
  }

  // ---------------- route cards ----------------
  function drawRoutes() {
    const b = bests(), rum = expedRumour(), routes = expedRoutes().filter(r => filter === 'all' || kinds(r).includes(filter));
    const sig = JSON.stringify([filter, rum, routes, routes.map(r => b[r] && b[r].g ? [b[r].g.g, b[r].g.needs.map(x => x.met)] : 0), expedFree()]);
    if (sig === sigRoutes) return; sigRoutes = sig; routeBox.textContent = '';
    if (!routes.length) { routeBox.append(el('p', 'note', expedRoutes().length ? 'No open route with this focus yet.' : 'Beat the zone 7 boss to open the first routes.')); return; }
    let band = 0;
    for (const r of routes) {
      const d = R(r);
      if (d.b !== band) {
        band = d.b; const B = EXPED_BANDS[band], h = el('div', 'ex-band');
        h.append(el('b', null, B.n), el('span', null, `Zones ${B.z0}-${B.z1}`), el('span', 'ex-pow', `Power ${fmt(expedR(band))}`));
        routeBox.append(h);
      }
      const x = b[r] || {}, G = x.g;
      const card = btn('ex-route');
      const ic = el('span', 'ic'); ic.append(img(routeIcon(r)));
      const mid = el('span', 'ex-rmid');
      const nm = el('span', 'ex-rnm'); nm.append(el('span', null, d.n));
      if (rum === r) nm.append(el('small', 'ex-rum', 'Rumour +50%'));
      const needs = el('span', 'ex-needs');
      const gNeeds = G ? G.needs : expedGrade(r, []).needs;
      d.needs.forEach((nd, i) => { const met = gNeeds[i] && gNeeds[i].met; needs.append(el('span', 'ex-need' + (met ? ' met' : ''), (met ? '✓ ' : '') + (gNeeds[i] && gNeeds[i].label || ''))); });
      mid.append(nm, el('span', 'ex-focus', focusText(r)), needs);
      const gr = el('span', 'ex-gr');
      if (G) { gr.textContent = G.name; gr.style.color = EXPED_GRADES[G.g].col; } else { gr.textContent = 'No team'; gr.classList.add('none'); }
      card.append(ic, mid, gr);
      card.setAttribute('aria-label', `${d.n}. ${focusText(r)}. Best grade ${G ? G.name : 'none'}.`);
      card.addEventListener('click', () => openSend(r));
      routeBox.append(card);
    }
  }

  // ---------------- log ----------------
  function drawLog() {
    const L = S.exped.log, sig = JSON.stringify(L.map(x => [x.r, x.at]));
    if (sig === sigLog) return; sigLog = sig; logBox.textContent = '';
    logBox.hidden = !L.length; if (!L.length) return;
    logBox.append(el('summary', null, `Log (last ${L.length})`));
    for (const x of L) {
      const row = el('div', 'ex-lrow');
      const g = EXPED_GRADES.find(q => q.n === x.grade) || EXPED_GRADES[1];
      const t = el('div', 'ex-lt'); t.append(el('span', null, R(x.r).n), el('b', null, x.grade)); t.lastChild.style.color = g.col;
      row.append(t, el('div', 'ex-lh', (x.recall ? 'Called back. ' : '') + (expedHaulText(x.haul) || 'Home safe.')));
      logBox.append(row);
    }
  }

  // A short "back" notice with the haul.
  function showBack(x) { toast(`${R(x.r).n} (${x.grade}): ${expedHaulText(x.haul) || 'home safe'}.`, 'good', { ic: ['boot', '#6B4A2E'] }, 'normal'); }

  // ---------------- the send sheet ----------------
  let sh = null;
  function openSend(r, team) {
    if (typeof openSheet !== 'function') return;
    const lens = expedLengths(), d = R(r);
    const st = { r, h: d.only || (lens.includes(8) ? 8 : lens[lens.length - 1]), team: (team || []).slice(0, 3), pick: -1 };
    if (pendingId && !st.team.includes(pendingId)) st.team.unshift(pendingId);
    pendingId = null;
    const api = openSheet(() => {}, { label: d.n, onClose: () => { if (sh && sh.api === api) sh = null; ui(true); } });
    api.sheet.classList.add('ex-sheet');
    sh = { api, st };
    renderSend();
  }
  function renderSend() {
    if (!sh) return;
    const { api, st } = sh, d = R(st.r), B = EXPED_BANDS[d.b], body = api.body, foot = api.foot;
    body.textContent = ''; foot.textContent = '';
    // title
    const top = el('div', 'ex-stop');
    const ic = el('span', 'ic'); ic.append(img(routeIcon(st.r)));
    const tt = el('div'); tt.append(el('h3', 'ex-sh', d.n), el('div', 'ex-ssub', `${B.n} · Zones ${B.z0}-${B.z1} · ${focusText(st.r)}`));
    top.append(ic, tt); body.append(top);
    // length
    const lenBox = el('div', 'ex-len'); lenBox.setAttribute('role', 'radiogroup'); lenBox.setAttribute('aria-label', 'Length');
    const MAPNEED = { 1: 1, 4: 1, 8: 3, 12: 5 };
    for (const h of EXPED_TUNE.lengths) {
      const ok = expedLengths().includes(h) && (!d.only || d.only === h);
      const b = btn('ex-seg' + (st.h === h ? ' on' : ''), `${h}h`);
      b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(st.h === h));
      if (!ok) { b.disabled = true; b.append(el('small', null, d.only ? '' : `Map Room ${MAPNEED[h]}`)); }
      b.addEventListener('click', () => { st.h = h; renderSend(); });
      lenBox.append(b);
    }
    body.append(lenBox);
    // team slots
    const teamBox = el('div', 'ex-team');
    for (let i = 0; i < 3; i++) {
      const id = st.team[i], b = btn('ex-tslot' + (id ? ' has r-' + ROSTER[id].rarity : '') + (st.pick === i ? ' picking' : ''));
      if (id) { b.append(img(portrait(id)), el('span', null, first(id)), el('small', null, `Lv ${charRec(id).lv} · ${fmt(ePow(id))}`)); b.setAttribute('aria-label', `${ROSTER[id].name}. Tap to change.`); }
      else b.append(el('span', 'plus', '+'), el('small', null, 'Add'));
      b.addEventListener('click', () => { st.pick = st.pick === i ? -1 : i; renderSend(); });
      teamBox.append(b);
    }
    const bestB = btn('mini ex-best', 'Best team');
    bestB.addEventListener('click', () => { st.team = expedBest(st.r); st.pick = -1; renderSend(); });
    body.append(teamBox, bestB);
    // bench picker (only benched, free companions), sorted by needs met then lowest level
    if (st.pick >= 0) {
      const list = el('div', 'ex-bench');
      const cur = st.team[st.pick];
      const others = st.team.filter((_, j) => j !== st.pick);
      const pool = rosterList().filter(id => !S.party.field.includes(id) && (!expedOut(id)) && (typeof campFree !== 'function' || campFree(id)) && !others.includes(id));
      const metOf = {}; for (const id of pool) metOf[id] = expedGrade(st.r, [id]).needs.filter(x => x.met).map(x => x.label);
      const needsOf = id => metOf[id].length;
      pool.sort((a, b) => needsOf(b) - needsOf(a) || charRec(a).lv - charRec(b).lv);
      if (!pool.length) list.append(el('p', 'note', 'No one is free. Only benched companions who are resting can go. Fielded companions stay with the party.'));
      if (cur) { const rm = btn('mini', `Take ${first(cur)} out`); rm.addEventListener('click', () => { st.team.splice(st.pick, 1); st.pick = -1; renderSend(); }); list.append(rm); }
      for (const id of pool) {
        const c = ROSTER[id], row = btn('ex-brow' + (id === cur ? ' on' : ''));
        const pt = el('span', 'ex-pt r-' + c.rarity); pt.append(img(portrait(id)));
        const met = metOf[id];
        const txt = el('span', 'ex-btxt'); txt.append(el('b', null, c.name), el('small', null, `Lv ${charRec(id).lv} ${ROLE_STATS[c.role].n} · ${CHAR_CIRCLES[c.circle]} · Power ${fmt(ePow(id))}`));
        if (met.length) txt.append(el('small', 'ex-bmet', '✓ ' + met.join(', ')));
        row.append(pt, txt);
        row.addEventListener('click', () => { if (st.pick < st.team.length) st.team[st.pick] = id; else st.team.push(id); st.pick = -1; renderSend(); });
        list.append(row);
      }
      body.append(list);
    }
    // grade meter and haul preview
    const pv = expedPreview(st.r, st.team, st.h), G = pv.grade;
    const meter = el('div', 'ex-meter');
    const pips = el('span', 'ex-pips');
    for (let i = 0; i < 4; i++) { const p = el('i'); if (st.team.length && i <= G.g) p.style.background = EXPED_GRADES[G.g].col; pips.append(p); }
    const gname = el('b', null, st.team.length ? G.name : 'No team'); if (st.team.length) gname.style.color = EXPED_GRADES[G.g].col;
    meter.append(pips, gname, el('span', 'ex-mult', st.team.length ? `haul x${EXPED_GRADES[G.g].mult}` : ''));
    body.append(meter);
    const nb = el('div', 'ex-nbox');
    G.needs.forEach(x => nb.append(el('span', 'ex-need' + (x.met ? ' met' : ''), (x.met ? '✓ ' : '✗ ') + x.label)));
    nb.append(el('span', 'ex-need' + (G.pow >= G.R ? ' met' : ''), `${G.pow >= G.R ? '✓' : '✗'} Power ${fmt(G.pow)}/${fmt(G.R)}`));
    nb.append(el('span', 'ex-need' + (G.pow >= 1.5 * G.R ? ' met' : ''), `${G.pow >= 1.5 * G.R ? '✓' : '✗'} Power ${fmt(1.5 * G.R)}`));
    body.append(nb);
    if (st.team.length && G.hint) body.append(el('p', 'note ex-hint', `${G.name}: ${G.hint.charAt(0).toLowerCase() + G.hint.slice(1)}.`));
    if (st.team.length) {
      const hb = el('div', 'ex-haul');
      hb.append(el('div', 'ex-hh', `You bring home (${st.h}h)`));
      for (const l of pv.lines) {
        const row = el('div', 'ex-hl');
        const u = l.k === 'mat' ? matIcon(l.key, l.t) : l.k === 'troph' ? troIc(l.key === 'any' ? 5 : l.key) : l.k === 'tok' ? iconURL('banner', CHAR_RARITY[ROSTER[l.key].rarity].col) : l.k === 'lore' ? iconURL('b_book', '#5A7AB8', { 5: '#EFE6D6' }) : l.k === 'ks' ? iconURL('sword', '#E0524F') : l.k === 'xp' ? iconURL('heart', '#6FCB6A') : iconURL('banner', '#F2C14E');
        row.append(img(u), el('span', null, l.txt));
        hb.append(row);
      }
      if (pv.rolls) hb.append(el('div', 'ex-hl bonus', `+ ${pv.rolls} bonus roll${pv.rolls > 1 ? 's' : ''} (more haul, a Trophy, Lore or a Keepsake)`));
      body.append(hb);
    }
    // send
    const can = expedCan(st.r, st.team, st.h);
    const send = btn('mini go ex-send', st.team.length ? `Send (${G.name})` : 'Send');
    send.disabled = !can.ok;
    send.addEventListener('click', () => { if (expedSend(st.r, st.team, st.h)) { api.close(); ui(true); } else renderSend(); });
    if (!can.ok && st.team.length) foot.append(el('p', 'note warn', can.why));
    else if (!st.team.length) foot.append(el('p', 'note', 'Pick up to 3 benched companions, or tap Best team.'));
    foot.append(send);
  }

  // ---------------- hooks ----------------
  const goSec = () => emit('campGoto', { tab: 'world', sel: '#sec-exped' });
  on('expedGoto', goSec);
  on('expedPick', ({ id }) => { pendingId = id; goSec(); ui(true); });
  on('expedBack', p => { if (S.tab !== 'world' && p && !p.recall) $('raidDot').hidden = false; });
  // Keep the sheet fresh when a slot frees or the roster changes while it is open.
  on('expedSent', () => { bestSig = ''; });
  on('fieldChange', () => { bestSig = ''; if (sh) renderSend(); });
}
