// 75-party: the Party tab. Browser-only. Spec: docs/design/formation.md 6 (Team view, plan-3 F4) and
// party-and-classes.md 7.2. Team view, top to bottom: the three slot cards (Back, Middle, Front) with
// the Best line-up button (56d, F3 owns its logic and why line) and the one amber warning, combos and
// Kin chips, Bond rows (75-bonds-ui.js), the bench, the hero card, the fielded companions' cards.
// Roster view: the roster grid and leads. Tapping a companion card or roster tile opens the character
// sheet (75-party-sheet.js). A red dot on the tab marks an unread camp or Bond story, or a promotion.
// Reads the roster API (56-roster.js) and the formation API (56e); synergies (56b) and leads (56c).
{
  const { safe, live, C, heroClass, heroCol, portrait, frameCol, first, pip, costText, weaponNoun, gearOf, slotTile,
    traits, synergiesFor, missingText, leadList, pctOf, xpInfo, inField, needsYou, HERO_GEAR_NOUN, HERO_SLOTS, COL_NAME, fnActive, outOf, heroTitle } = PTY;
  const RAR_ORDER = { legendary: 0, epic: 1, rare: 2, common: 3 };
  const P = () => S.party;
  const fieldMax = () => (typeof ROSTER_TUNE === 'object' && ROSTER_TUNE.fieldMax) || 2;
  const field = () => (live() && Array.isArray(P().field) ? P().field.filter(isRecruited).slice(0, fieldMax()) : []);
  const setT = (n, t) => { if (n.textContent !== t) n.textContent = t; };
  const saveUi = () => { try { save(); } catch (e) {} ui(true); };
  const btn = (cls, text, fn) => { const b = el('button', cls, text); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; };

  // ================= the three slots (plan-3 F4, formation.md 6.1) =================
  // Back, Middle and Front, left to right as on the stage. Tap a card to lift it, then tap another
  // card to swap, or a bench companion to put them in that slot. Or tap a bench companion first, then
  // a slot. Or hold a card or a bench tile for 150 ms and drag it onto a slot (a companion's card
  // dropped on the bench goes to the bench). The lock pins a companion (the planner keeps them).
  // Every change goes through 56e-formation: swapSlots, fieldTo, setPin; benching through benchChar.
  registerIcons({
    f_lock: ['............', '....2222....', '...2....2...', '...2....2...', '...2....2...', '..11111111..', '..11111111..', '..11155111..', '..11155111..', '..11111111..', '..11111111..', '............'],
    f_home: ['............', '.....11.....', '....1111....', '...111111...', '..11111111..', '.1111111111.', '..11111111..', '..111..111..', '..11.22.11..', '..11.22.11..', '..11.22.11..', '............']
  });
  const FT_ = () => (typeof FORM_TUNE === 'object' && FORM_TUNE) || { offSlot: 0.1, maxPins: 2 };
  const offPct = () => Math.round((FT_().offSlot || 0.1) * 100);
  const SLOT_TIP = { front: 'Front takes the hits.', mid: 'Middle strikes and covers both sides.', back: 'Back is safe from blades. Heal and cast from here.' };
  const cellsNow = () => (P().cells && typeof P().cells === 'object' ? P().cells : {});   // the planner preview reads it
  const nameOf = k => k === 'hero' ? 'You' : first(k);
  const fullName = k => k === 'hero' ? S.name : C(k).name;
  // lift: null | { slot } (a slot card is lifted) | { id } (a bench companion is lifted)
  let lift = null, say = '', sayT = 0, formSig = '', formRefs = null, flash = {};
  const tell = msg => { say = msg; sayT = performance.now(); formSig = ''; };
  const pinned = k => typeof isPinned === 'function' && isPinned(k);
  // After a change: save, redraw, and flash the cards that changed (a colour flash, kept in reduced motion).
  function changed(slots) {
    const now = performance.now();
    for (const s of slots) flash[s] = now;
    lift = null; formSig = ''; benchSig = '';
    saveUi();
    setTimeout(() => { flash = {}; formSig = ''; try { updateForm(); } catch (e) {} }, 700);
  }
  function moveSlots(a, b) {
    if (a === b) return false;
    if (swapSlots(a, b)) { changed([a, b]); return true; }
    return false;
  }
  function putIn(id, slot) {
    if (whoIn(slot) === 'hero') { tell(FORM_TEXT.heroStays); lift = null; return false; }
    const o = outOf(id); if (o) { tell(`${first(id)} is on an expedition. They can join when they are back.`); lift = null; return false; }
    if (fieldTo(id, slot)) { changed([slot]); return true; }
    lift = null; formSig = '';
    return false;
  }
  function toBench(k) {
    if (k === 'hero') { tell(FORM_TEXT.heroStays); return false; }
    const s = slotOf(k);
    if (benchChar(k)) { tell(`${first(k)} is on the bench.`); changed(s ? [s] : []); return true; }
    return false;
  }
  function tapSlot(slot) {
    if (!live()) return;
    const k = whoIn(slot);
    if (lift && lift.id) putIn(lift.id, slot);
    else if (lift && lift.slot === slot) lift = null;
    else if (lift && lift.slot) moveSlots(lift.slot, slot);
    else lift = { slot };   // an empty slot lifts too: then a bench companion fills it
    formSig = ''; benchSig = ''; ui(true);
  }
  function tapBench(id) {
    if (!live()) return;
    if (lift && lift.slot) {
      if (whoIn(lift.slot) === 'hero') tell(FORM_TEXT.heroStays);
      else putIn(id, lift.slot);
    } else if (lift && lift.id === id) lift = null;
    else if (outOf(id)) tell(`${first(id)} is on an expedition. They can join when they are back.`);
    else lift = { id };
    formSig = ''; benchSig = ''; ui(true);
  }
  function togglePin(k) {
    const on = !pinned(k);
    if (on && ((P().pin || []).length >= (FT_().maxPins || 2))) { tell(`You can lock ${FT_().maxPins || 2} companions at most.`); ui(true); return; }
    if (typeof setPin === 'function' && setPin(k, on)) { tell(on ? `${first(k)} stays in the party.` : `The planner can move ${first(k)} again.`); saveUi(); }
  }

  // ---- drag: hold 150 ms, then drag onto a slot card (or a companion card onto the bench) ----
  let drag = null, eatClick = 0;
  const dragEat = () => performance.now() < eatClick;
  function dragFrom(node, get) {
    node.addEventListener('pointerdown', e => {
      if ((e.button || 0) > 0 || drag || e.target.closest('.fs-lock')) return;
      const src = get(); if (!src) return;
      drag = { src, node, x: e.clientX, y: e.clientY, on: false, pid: e.pointerId, over: null, ghost: null };
      drag.t = setTimeout(dragStart, 150);
      window.addEventListener('pointermove', dragMove);
      window.addEventListener('pointerup', dragUp);
      window.addEventListener('pointercancel', dragCancel);
    });
    // Once a drag is on, the page must not scroll under the finger.
    node.addEventListener('touchmove', e => { if (drag && drag.on && e.cancelable) e.preventDefault(); }, { passive: false });
    node.addEventListener('contextmenu', e => { if (drag) e.preventDefault(); });
    node.addEventListener('dragstart', e => e.preventDefault());   // no native image drag (it cancels the pointer)
  }
  function dragStart() {
    if (!drag) return;
    drag.on = true;
    const g = el('div', 'fdrag'); g.append(img(portrait(drag.src.key)));
    g.style.transform = `translate(${drag.x - 28}px, ${drag.y - 28}px)`;
    document.body.append(g); drag.ghost = g;
    drag.node.classList.add('dragging');
    lift = null;
    putText(formRefs.hint, `Drop ${nameOf(drag.src.key) === 'You' ? 'your hero' : nameOf(drag.src.key)} on a slot${drag.src.slot && drag.src.key !== 'hero' ? ', or on the bench' : ''}.`);
  }
  function dragMove(e) {
    if (!drag || e.pointerId !== drag.pid) return;
    if (!drag.on) { if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 10) dragCancel(); return; }
    drag.ghost.style.transform = `translate(${e.clientX - 28}px, ${e.clientY - 28}px)`;
    const t = document.elementFromPoint(e.clientX, e.clientY);
    let over = t && (t.closest('.fslot') || t.closest('#sec-party-bench'));
    if (over && over === drag.node) over = null;
    if (over && over.id === 'sec-party-bench' && !drag.src.slot) over = null;
    if (over !== drag.over) { if (drag.over) drag.over.classList.remove('dover'); if (over) over.classList.add('dover'); drag.over = over; }
  }
  function dragEnd() {
    if (!drag) return null;
    const d = drag; drag = null;
    clearTimeout(d.t);
    window.removeEventListener('pointermove', dragMove);
    window.removeEventListener('pointerup', dragUp);
    window.removeEventListener('pointercancel', dragCancel);
    if (d.ghost) d.ghost.remove();
    d.node.classList.remove('dragging');
    if (d.over) d.over.classList.remove('dover');
    return d;
  }
  function dragCancel() { const d = dragEnd(); if (d && d.on) { formSig = ''; ui(true); } }
  function dragUp(e) {
    if (!drag || e.pointerId !== drag.pid) return;
    const d = dragEnd();
    if (!d.on) return;
    eatClick = performance.now() + 400;
    const o = d.over;
    if (o && o.classList.contains('fslot')) { if (d.src.slot) moveSlots(d.src.slot, o.dataset.slot); else putIn(d.src.key, o.dataset.slot); }
    else if (o && d.src.slot) toBench(d.src.key);
    formSig = ''; benchSig = ''; ui(true);
  }

  function buildForm(sec) {
    const head = el('div', 'sec-head');
    const h = sec.querySelector('.sec-title'); head.append(h);
    const auto = btn('mini pf-auto', 'Auto', () => { lift = null; if (live()) { autoPlace(); saveUi(); } });
    auto.setAttribute('aria-label', 'Place everyone in their home slots');
    const best = btn('mini pf-best', 'Best line-up', () => { lift = null; openLineup(); });
    best.setAttribute('aria-label', 'Show the best line-up for your best zone');
    const btns = el('div', 'pf-btns'); btns.append(auto, best);
    head.append(btns); sec.prepend(head);
    const row = el('div', 'fslots');
    const cards = {};
    for (const slot of FORM_SLOTS) {
      const c = el('div', 'fslot'); c.tabIndex = 0; c.setAttribute('role', 'button'); c.dataset.slot = slot;
      c.title = SLOT_TIP[slot];
      c.addEventListener('click', () => { if (!dragEat()) tapSlot(slot); });
      c.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === c) { e.preventDefault(); tapSlot(slot); } });
      dragFrom(c, () => { const k = live() && whoIn(slot); return k ? { slot, key: k } : null; });
      row.append(c); cards[slot] = c;
    }
    const hint = el('p', 'note f-hint'); hint.setAttribute('aria-live', 'polite');
    const warn = el('p', 'note f-warn');
    const why = el('p', 'note lu-why'); why.hidden = true;
    const prev = el('div', 'lu-prev'); prev.hidden = true;
    sec.append(row, warn, hint, why, prev);
    formRefs = { cards, hint, warn, auto, best, why, prev };
  }
  function fillCard(c, slot) {
    const k = whoIn(slot), up = !!lift && lift.slot === slot;
    c.textContent = '';
    c.className = 'fslot' + (k ? ' occ' : ' empty') + (k === 'hero' ? ' hero' : k ? ' comp' : '') + (up ? ' up' : '') + (lift && !up ? ' drop' : '') + (flash[slot] ? ' flash' : '');
    const top = el('span', 'fs-slot', SLOT_NAME[slot]);
    if (k && !offSlot(k)) { const hm = img(iconURL('f_home', '#F2C14E', { 2: '#6B4A2E' }), 'fs-home'); hm.alt = 'home slot'; top.append(hm); }
    c.append(top);
    c.removeAttribute('aria-pressed');
    if (!k) {
      c.append(el('span', 'fs-empty', 'Empty. Tap a companion below to field them.'));
      c.setAttribute('aria-label', `${SLOT_NAME[slot]}: empty.${up ? ' Lifted: tap a bench companion to field them here.' : lift ? ' Tap to put them here.' : ''}`);
      c.setAttribute('aria-pressed', String(up));
      return;
    }
    const pt = el('span', 'fs-pt' + (k !== 'hero' && C(k).rarity === 'legendary' ? ' leg' : '') + (bondsUI && bondsUI.swornAny(k) ? ' sworn' : ''));
    pt.style.setProperty('--rc', k === 'hero' ? 'var(--ember-deep)' : frameCol(k));
    pt.append(img(portrait(k)));
    const role = memberRole(k), cls = heroClass();
    const roleTxt = k === 'hero' ? (cls ? cls.name : 'Hero') : PTY.ROLE_NAME[role];
    c.append(pt, el('b', 'fs-nm', nameOf(k)), el('span', 'fs-role r-' + role, roleTxt));
    const job = typeof slotJob === 'function' ? safe(() => slotJob(k), null) : null;
    if (job) { const j = el('span', 'fs-job', job.label); j.title = `${job.name}: ${job.text}`; c.append(j); }
    const off = offSlot(k);
    if (off) c.append(el('span', 'fs-off', `Out of place -${offPct()}%`));
    if (k === 'hero') c.append(el('span', 'fs-stay', 'Always in'));
    else {
      const on = pinned(k);
      const lk = btn('fs-lock' + (on ? ' on' : ''), null, e => { e.stopPropagation(); togglePin(k); });
      lk.append(img(iconURL('f_lock', on ? '#F2C14E' : '#6E6280', { 2: on ? '#C9A040' : '#6E6280', 5: on ? '#2A1E07' : '#1A1420' })));
      lk.setAttribute('aria-label', on ? `Let the planner move ${first(k)}` : `Keep ${first(k)} in the party`);
      lk.setAttribute('aria-pressed', String(on));
      lk.addEventListener('pointerdown', e => e.stopPropagation());
      c.append(lk);
    }
    c.setAttribute('aria-label', `${SLOT_NAME[slot]}: ${k === 'hero' ? 'your hero, ' + S.name : fullName(k)}, ${roleTxt}${job ? ', ' + job.label : ''}${off ? `, out of place` : ', home slot'}${k === 'hero' ? ', always in the party' : ''}${up ? '. Lifted: tap another slot to swap' : ''}.`);
    c.setAttribute('aria-pressed', String(up));
  }
  function hintText() {
    if (say && performance.now() - sayT < 4000) return say;
    say = '';
    if (lift && lift.id) return `Tap a slot to field ${first(lift.id)} there.`;
    if (lift && lift.slot) {
      const k = whoIn(lift.slot);
      return !k ? 'Tap a companion on the bench to field them here.' : k === 'hero' ? 'Tap another slot to swap. Your hero stays in the party.' : 'Tap another slot to swap, or a bench companion to take this slot.';
    }
    return 'Tap a slot to move someone, or hold and drag.';
  }
  function updateForm() {
    const r = formRefs; if (!r || !live()) return;
    if (lift && lift.id && (!isRecruited(lift.id) || inField(lift.id))) lift = null;
    const line = formLine();
    const sig = JSON.stringify(line.map(x => [x.key, x.off])) + JSON.stringify(lift) + JSON.stringify(P().pin || []) + S.name + P().cls + typeof portraitURL + Object.keys(flash).join() + (bondsUI ? bondsUI.sig() : '') + say;
    if (sig !== formSig) {
      formSig = sig;
      for (const s of FORM_SLOTS) fillCard(r.cards[s], s);
      const w = formWarning(); putText(r.warn, w); putHidden(r.warn, !w);
    }
    putText(r.hint, drag && drag.on ? r.hint.textContent : hintText());
    if (say && performance.now() - sayT >= 4000) formSig = '';
  }

  // ================= the bench (companions not in the party) =================
  let benchSig = '', benchRefs = null, benchGen = 0, benchBuilt = false;
  function buildBench(sec) {
    const grid = el('div', 'fbench');
    sec.append(grid);
    benchRefs = { grid };
  }
  function updateBench() {
    const r = benchRefs; if (!r || !live()) return;
    const ids = rosterList().filter(k => !inField(k));
    ids.sort((a, b) => (charRec(b).lv - charRec(a).lv) || ROSTER_KEYS.indexOf(a) - ROSTER_KEYS.indexOf(b));
    const outs = ids.map(k => { const o = outOf(k); return o ? o.id + o.back : ''; });
    const sig = ids.join() + '|' + outs.join() + '|' + JSON.stringify(lift) + typeof portraitURL + (bondsUI ? bondsUI.sig() : '') + ids.map(k => charRec(k).lv).join();
    if (sig === benchSig) return; benchSig = sig;
    r.grid.textContent = '';
    if (!ids.length) { r.grid.append(el('p', 'note', 'Nobody on the bench. New companions join from the Roster.')); return; }
    // Tiles build in time-boxed chunks (a portrait can need baking), as the Roster grid does.
    const gen = ++benchGen, queue = ids.map((k, i) => [k, i]);
    const chunk = () => {
      if (gen !== benchGen) return;
      const t0 = performance.now();
      do benchTile(...queue.shift()); while (queue.length && performance.now() - t0 < 10);
      if (queue.length) setTimeout(chunk, 0);
    };
    const benchTile = (k, i) => {
      const c = C(k), out = !!outs[i], up = !!lift && lift.id === k;
      const t = btn('fb-tile' + (up ? ' up' : '') + (out ? ' out' : '') + (lift && lift.slot ? ' drop' : ''), null, () => { if (!dragEat()) tapBench(k); });
      const fr = el('span', 'fb-pt' + (c.rarity === 'legendary' ? ' leg' : '') + (bondsUI && bondsUI.swornAny(k) ? ' sworn' : ''));
      fr.style.setProperty('--rc', frameCol(k));
      fr.append(img(portrait(k)), el('i', 'rp r-' + c.role));
      t.append(fr, el('span', 'fb-nm', first(k)), el('span', 'fb-sub', out ? 'Away' : `Lv ${charRec(k).lv} · ${SLOT_NAME[homeSlot(k)]}`));
      t.setAttribute('aria-label', `${c.name}, ${PTY.ROLE_NAME[c.role]}, level ${charRec(k).lv}, home slot ${SLOT_NAME[homeSlot(k)]}${out ? ', on an expedition' : ''}${up ? '. Lifted: tap a slot to field them' : ''}.`);
      t.setAttribute('aria-pressed', String(up));
      if (!out) dragFrom(t, () => ({ key: k }));
      r.grid.append(t);
    };
    // The first build waits for its own task (portraits may bake), so opening the tab stays smooth.
    if (!benchBuilt) { benchBuilt = true; setTimeout(chunk, 0); } else chunk();
  }

  // ================= best line-up (AF, 56d-autofield.js) =================
  // The line under the formation explains the best line-up for your best zone in one line; the
  // button opens a preview of the change (who comes in, who goes out, the new places, damage and
  // hold) and applies it only on "Use this line-up". Planned at most every few seconds, cached by 56d.
  let luRes = null, luT = -1e9, luOpen = false, luSig = '', luField = null, luCells = null;
  const luOk = () => typeof bestLineup === 'function' && live() && rosterList().length >= 1;
  // Background refreshes run in their own task (never inside a ui() pass, so opening the tab stays
  // smooth); a tap on the button or a manual move plans at once.
  let luQueued = false;
  const luRun = () => {
    luT = performance.now();
    try { luRes = bestLineup({ goal: 'push' }); } catch (e) { luRes = null; console.error('[lanternfall] bestLineup', e); }
    return luRes;
  };
  const luPlan = force => {
    if (force) return luRun();
    if ((!luRes || performance.now() - luT >= 5000) && !luQueued) {
      luQueued = true;
      setTimeout(() => { luQueued = false; if (formRefs && formRefs.why.isConnected) { luRun(); luSig = ''; try { updateWhy(); } catch (e) {} } }, 60);
    }
    return luRes;
  };
  const pctTxt = g => { const p = Math.round((g - 1) * 100); return p > 0 ? `+${p}%` : `${p}%`; };
  function updateWhy() {
    const r = formRefs; if (!r) return;
    putHidden(r.best, !luOk());
    if (!luOk()) { r.why.hidden = true; r.prev.hidden = true; return; }
    const moved = !!luRes && (luField !== P().field || luCells !== P().cells);   // a manual move: plan again now (the pick is cached, so this is cheap)
    luField = P().field; luCells = P().cells;
    const b = luPlan(moved);
    if (!b) { r.why.hidden = true; return; }
    // The gain in the words of the preview: damage when yours holds too, else the hold itself.
    const g = b.parts.gain, cur = b.parts.current;
    const dz = cur ? (b.parts.held || 0) - (cur.held || 0) : 0;
    const more = !g || g <= 1.005 || !cur ? '' : dz >= 10 ? ' Yours cannot hold these zones.' : dz > 0 ? ` It holds ${dz} more zone${dz === 1 ? '' : 's'} than yours.` : b.parts.dps > cur.dps * 1.005 ? ` ${pctTxt(b.parts.dps / Math.max(1e-9, cur.dps))} damage over yours.` : '';
    const t = b.parts.same ? `Best line-up: ${b.why}. You have it.` : `Best line-up: ${b.why}.` + more;
    setT(r.why, t); r.why.hidden = false;
    putToggle(r.best, 'go', !b.parts.same && !!g && g > 1.02);
    if (luOpen) renderPrev(b);
  }
  function openLineup() {
    luOpen = !luOpen;
    if (luOpen) luPlan(true);
    luSig = '';
    const r = formRefs; if (!r) return;
    r.prev.hidden = !luOpen;
    putAttr(r.best, 'aria-expanded', String(luOpen));
    if (luOpen && luRes) renderPrev(luRes);
  }
  function renderPrev(b) {
    const r = formRefs, box = r.prev;
    const now = field(), sig = JSON.stringify([b.field, b.cells, b.why, now, cellsNow(), Math.round((b.parts.gain || 0) * 100)]);
    if (sig === luSig) return; luSig = sig;
    box.textContent = ''; box.hidden = false;
    box.append(el('b', 'lu-t', `Best line-up to push zone ${b.parts.zone}`), el('p', 'lu-line', b.why + '.'));
    const ins = b.field.filter(k => !now.includes(k)), outs = now.filter(k => !b.field.includes(k));
    const ch = el('div', 'lu-ch');
    if (b.parts.same) ch.append(el('span', 'lu-same', 'Your line-up is already the best one.'));
    else if (!ins.length && !outs.length) ch.append(el('span', 'lu-same', 'Same three, new places.'));
    for (const k of ins) { const c = el('span', 'lu-chip in'); c.append(img(portrait(k)), el('span', null, 'In: ' + first(k))); ch.append(c); }
    for (const k of outs) { const c = el('span', 'lu-chip out'); c.append(img(portrait(k)), el('span', null, 'Out: ' + first(k))); ch.append(c); }
    box.append(ch);
    // The new formation, Back | Mid | Front.
    const grid = el('div', 'lu-grid'); grid.setAttribute('aria-label', 'New places');
    for (const n of COL_NAME) grid.append(el('div', 'pf-h', n));
    const at = (col, lane) => Object.keys(b.cells).find(k => b.cells[k].col === col && b.cells[k].lane === lane);
    for (let lane = 1; lane < 2; lane++) for (let col = 0; col < 3; col++) {   // F1: one line (lane 1)
      const o = at(col, lane), was = o && cellsNow()[o];
      const moved = o && (!was || was.col !== col || was.lane !== lane || (o !== 'hero' && !now.includes(o)));
      const d = el('div', 'lu-cell' + (o ? ' occ' : '') + (moved ? ' new' : ''));
      if (o) { d.append(img(portrait(o)), el('span', null, o === 'hero' ? S.name : first(o))); if (o !== 'hero') d.append(el('i', 'rp r-' + C(o).role)); }
      grid.append(d);
    }
    box.append(grid);
    const p = b.parts, cur = p.current;
    const stats = el('p', 'note lu-stats');
    stats.textContent = (cur && !p.same ? `Damage ${fmt(cur.dps)} → ${fmt(p.dps)}` + (p.gain ? ` (${pctTxt(p.dps / Math.max(1e-9, cur.dps))})` : '') + '. ' : '') +
      (p.holds ? `Holds zone ${p.zone}.` : p.held >= 1 ? `Holds zone ${p.held}, not ${p.zone} yet.` : `Cannot hold zone ${p.zone} yet.`);
    box.append(stats);
    const row = el('div', 'lu-row');
    const use = btn('mini go lu-use', 'Use this line-up', () => { if (live() && typeof applyLineup === 'function') { applyLineup(b); luOpen = false; box.hidden = true; putAttr(r.best, 'aria-expanded', 'false'); luPlan(true); formSig = ''; saveUi(); } });
    use.disabled = !!p.same;
    const keep = btn('mini lu-keep', 'Keep mine', () => { luOpen = false; box.hidden = true; putAttr(r.best, 'aria-expanded', 'false'); });
    row.append(use, keep); box.append(row);
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
    const ctl = el('small', 'pc-ctitle'); ctl.hidden = true;   // the Codex title (57c), when the player picked one
    const sub = el('small');
    const tags = el('div', 'pc-tags'); if (c) tags.append(pip(c.role)); if (c && c.tapName && !soloOn()) tags.append(el('small', null, 'Tap: ' + c.tapName));
    who.append(nm, ctl, sub, tags);
    top.append(pt, who, el('span', 'pc-more', '›'));
    card.append(top);
    const refs = { card, nm, sub, ctl };
    if (c && c.ability) {
      const ab = el('div', 'pc-ab');
      const line = el('div', 'pc-abline');
      const sa = soloOn() && typeof abilityInfo === 'function' ? abilityInfo() : null;   // SOLO1: the hero's own ability
      const t = el('div'); t.append(el('em', null, sa ? sa.name : c.ability.name)); const cdTxt = el('small', 'pc-cdtxt'); t.append(cdTxt);
      const cast = btn('mini go pc-cast', 'Cast', e => { e.stopPropagation(); if (typeof castAbility === 'function' && castAbility()) ui(true); });
      line.append(t, cast);
      const cd = el('div', 'pc-cd'); cd.append(el('i'));
      ab.append(line, cd); card.append(ab);
      Object.assign(refs, { cast, cdBar: cd.firstChild, cdTxt });
    }
    const gearBox = el('div', 'pc-gear');
    const nouns = HERO_GEAR_NOUN[P().cls] || {};
    for (const s of HERO_SLOTS) {
      const pos = s.old || s.id, open = pos in S.equip;   // off-hand and body are hero positions since crafting (K4)
      const it = open ? equipped(pos) : null;
      const d = el('div', 'pc-slot' + (open ? '' : ' soon'));
      const tile = it ? slotTile(it) : slotTile(null, SLOT[pos] ? SLOT[pos].icon : pos === 'body' ? 'plate' : pos === 'off' ? 'banner' : 'helm');
      d.append(tile, el('small', null, nouns[s.id] || s.n));
      d.title = it ? itemName(it) : open ? 'Empty' : 'Coming with crafting';
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
    const ct = heroTitle(); setT(r.ctl, ct); putHidden(r.ctl, !ct);
    if (r.cdBar) {
      const sa = soloOn() && typeof abilityInfo === 'function' ? abilityInfo() : null;
      const cdMax = (sa ? sa.cd : c.ability.cd) || 30, left = Math.max(0, +P().abilityCd || 0);
      putStyle(r.cdBar, 'width', (100 - Math.min(100, left / cdMax * 100)) + '%');
      setT(r.cdTxt, left > 0 ? ` · ready in ${Math.ceil(left)}s` : ' · ready');
      putDisabled(r.cast, left > 0 || typeof castAbility !== 'function');
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
    for (let i = 0; i < fieldMax(); i++) {
      const k = keys[i];
      if (!k) {
        const e = el('div', 'pcard empty');
        e.append(el('b', null, 'Open place'), el('small', null, 'Tap an empty slot above, then a companion on the bench.'));
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
      putStyle(r.fill, 'width', (x.pct * 100).toFixed(1) + '%');
      putToggle(r.bar, 'cap', x.atCap);
      putAttr(r.bar, 'title', x.atCap ? 'At the level cap' : `${Math.floor(x.pct * 100)}% to Lv ${x.r.lv + 1}`);
      const cu = Math.round(x.catchUp * 100);
      putHidden(r.badge, !(cu > 0) || x.atCap); setT(r.badge, `+${cu}% XP`);
      const showP = x.atCap && !x.maxRank;
      putHidden(r.prom, !showP);
      if (showP) {
        const pc = promoteCost(r.k), ps = pc.gold + ':' + canPromote(r.k);
        if (ps !== r.pSig) { r.pSig = ps; setPrice(r.prom, pc.gold); r.prom.disabled = !canPromote(r.k); r.prom.title = costText(pc); }
      }
      putHidden(r.dot, !needsYou(r.k));
    }
  }

  // ================= combos and Kin (formation.md 6.2) =================
  // A row of chips for the combos and Kin active now (combos steel blue, Kin green), and "See all":
  // a sheet with all 8 combos and 4 Kin, dim when not active, with the one-line need.
  const SHAPE = () => (typeof SYNERGIES === 'object' && Array.isArray(SYNERGIES) ? SYNERGIES.filter(d => d.layer === 'combo' || d.layer === 'kin') : []);
  const LAYER_NAME = { combo: 'Combo', kin: 'Kin' };
  let synSig = '';
  const activeShape = () => (fnActive() ? safe(() => fnActive()(), []) : []).filter(s => s.layer === 'combo' || s.layer === 'kin');
  function comboSheet(id) {
    const d = SHAPE().find(x => x.id === id); if (!d) return;
    const a = activeShape().find(x => x.id === id);
    openSheet(api => {
      const b = api.body;
      b.append(el('h2', 'cb-name ' + d.layer, d.name), el('small', 'cb-layer', LAYER_NAME[d.layer] + (a ? ': on' : ': off')));
      b.append(el('p', 'cb-fx', a ? a.effectText : d.text));
      b.append(el('p', 'cb-need', 'Needs ' + d.needs.replace(/^./, m => m.toLowerCase()) + '.'));
      if (d.layer === 'kin') b.append(el('p', 'note', 'Kin with a Common companion is 25% stronger.'));
    }, { label: d.name, small: true });
  }
  function comboList() {
    const act = {}; for (const s of activeShape()) act[s.id] = s;
    const st = typeof synergyStatus === 'function' ? synergyStatus : null;
    openSheet(api => {
      const b = api.body;
      b.append(el('h2', 'cb-name', 'Combos and Kin'), el('p', 'note', 'Combos come from who stands where. Kin comes from two companions of one circle.'));
      for (const layer of ['combo', 'kin']) {
        const box = el('div', 'cb-all');
        const list = SHAPE().filter(d => d.layer === layer).sort((x, y) => (!!act[y.id] - !!act[x.id]));
        for (const d of list) {
          const on = !!act[d.id];
          const row = el('div', 'cb-item ' + layer + (on ? ' on' : ''));
          const top = el('div'); top.append(el('b', null, d.name), el('small', null, on ? 'On' : (st ? safe(() => st(d.id).text, '') : '') || d.needs));
          row.append(top, el('p', null, on ? act[d.id].effectText : d.text));
          if (!on && st) row.append(el('small', 'cb-needs', d.needs + '.'));
          box.append(row);
        }
        const s = el('div', 'cs-sec'); s.append(el('h3', 'cs-h', layer === 'combo' ? 'Combos' : 'Kin'), box);
        b.append(s);
      }
    }, { label: 'Combos and Kin' });
  }
  function updateSyn(sec) {
    const on = !!fnActive();
    putHidden(sec, !on); if (!on) return;
    const list = activeShape();
    const sig = list.map(s => s.id + ':' + Math.round((s.strength || 0) * 100)).join();
    if (sig === synSig) return; synSig = sig;
    const row = sec.querySelector('.syn-row');
    row.textContent = '';
    if (!list.length) row.append(el('p', 'note cb-none', 'No combos in this party. Put a tank in Front and a healer in Back for Lifeline.'));
    for (const s of list) {
      const b = btn('syn-chip on cb-chip ' + s.layer, null, () => comboSheet(s.id));
      b.append(el('i'), el('span', null, s.name));
      b.setAttribute('aria-label', `${LAYER_NAME[s.layer]}: ${s.name}, on. Open for details.`);
      row.append(b);
    }
    const all = btn('mini cb-all-btn', 'See all', () => comboList());
    all.setAttribute('aria-label', 'See all combos and Kin');
    row.append(all);
  }

  // ================= roster grid =================
  const FILTERS = ['all', 'tank', 'striker', 'caster', 'support'];
  const SORTS = ['power', 'level', 'rarity'], SORT_NAME = { power: 'Power', level: 'Level', rarity: 'Rarity' };
  let filt = 'all', sortBy = 'power', rosSig = '', rosRefs = null, rosTiles = {};
  try { const v = JSON.parse(localStorage.getItem('lanternfall.party.ui') || '{}'); if (FILTERS.includes(v.f)) filt = v.f; if (SORTS.includes(v.s)) sortBy = v.s; } catch (e) {}
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
    sec.prepend(head);
    // Sort chips (owner bug: the old single toggle read as random and gave no sense of what it did).
    const so = el('div', 'ros-sortbar'); so.setAttribute('role', 'group'); so.setAttribute('aria-label', 'Sort by');
    so.append(el('span', 'ros-sortlbl', 'Sort'));
    const sort = SORTS.map(k => { const b = btn('', SORT_NAME[k], () => { sortBy = k; keepUi(); rosSig = ''; ui(true); }); so.append(b); return b; });
    sec.append(so);
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
      return { k, i, rec, fielded: inField(k), how: rec ? '' : shortHow(k, leadsById), ready: !rec && !!recruitCost(k), flag: rec && needsYou(k), out: rec ? outOf(k) : null, sworn: !!rec && !!bondsUI && bondsUI.swornAny(k) };
    });
    const pw = x => { try { return x.rec ? charDps(x.k) : 0; } catch (e) { return 0; } };
    const shownPre = rows.filter(x => filt === 'all' || C(x.k).role === filt);
    const rarP = x => RAR_ORDER[C(x.k).rarity];
    const by = { power: (a, b) => pw(b) - pw(a) || rarP(a) - rarP(b), level: (a, b) => (b.rec ? b.rec.lv - a.rec.lv : 0) || rarP(a) - rarP(b), rarity: (a, b) => rarP(a) - rarP(b) || (b.rec ? b.rec.lv - a.rec.lv : 0) };
    // Locked characters sort too (owner bug): Rarity mixes everyone by rarity (recruited first within a
    // rarity); Power and Level list recruits first, then locked ones by how close they are to joining.
    const near = x => x.ready ? 2 : (pctOf(leadsById[x.k]) || 0);
    shownPre.sort((a, b) => sortBy === 'rarity'
      ? rarP(a) - rarP(b) || (!!b.rec - !!a.rec) || (a.rec && b.rec ? b.rec.lv - a.rec.lv : near(b) - near(a)) || a.i - b.i
      : (!!b.rec - !!a.rec) || (a.rec ? by[sortBy](a, b) : near(b) - near(a) || rarP(a) - rarP(b)) || a.i - b.i);
    // Rebuild tiles only when something structural changes; levels update in place so taps are never lost.
    const sig = [filt, sortBy, typeof portraitURL, shownPre.map(x => x.k).join(), JSON.stringify(rows.map(x => [x.k, !!x.rec, x.rec && x.rec.rank, x.fielded, x.how, x.ready, x.flag, x.out && x.out.id + x.out.back, x.sworn]))].join('|');
    for (const x of rows) {
      const t = rosTiles[x.k]; if (!t || !x.rec) continue;
      if (t.lv) setT(t.lv, 'Lv ' + x.rec.lv);
      if (t.out && x.out) setT(t.out, x.out.txt);     // "Out: Route, 3h 12m" counts down in place
    }
    if (sig === rosSig) return; rosSig = sig; rosTiles = {};
    r.cnt.textContent = `${rows.filter(x => x.rec).length}/${rows.length}`;
    r.sort.forEach((b, i) => b.setAttribute('aria-pressed', String(SORTS[i] === sortBy)));
    r.fb.forEach((b, i) => b.setAttribute('aria-pressed', String(FILTERS[i] === filt)));
    const shown = shownPre;
    r.grid.textContent = '';
    // Tiles are built in time-boxed chunks (a portrait can need baking): the first screenful now, the
    // rest in the next tasks, so opening the Roster never stalls the game. A newer rebuild wins.
    const gen = ++rosGen, queue = shown.slice();
    const chunk = () => {
      if (gen !== rosGen) return;
      const t0 = performance.now();
      while (queue.length && (performance.now() - t0 < 25 || r.grid.children.length < 6)) addTile(queue.shift());
      if (queue.length) setTimeout(chunk, 0);
    };
    chunk();
    if (!shown.length) r.grid.append(el('p', 'note', 'Nobody with that role yet.'));
  }
  let rosGen = 0;
  function addTile(x) {
    const r = rosRefs, c = C(x.k);
    const t = btn('rtile' + (x.rec ? (x.fielded ? ' fielded' : ' bench') : ' locked') + (c.rarity === 'legendary' ? ' leg' : '') + (x.ready ? ' ready' : '') + (x.out ? ' out' : ''));
    t.style.setProperty('--rc', frameCol(x.k));
    const fr = el('span', 'rt-fr' + (x.sworn ? ' sworn' : '')); fr.append(img(portrait(x.k)));   // the Sworn frame (formation.md 6.3)
    if (x.rec) {
      const lv = el('span', 'rt-lv', 'Lv ' + x.rec.lv); rosTiles[x.k] = { lv };
      fr.append(lv, el('i', 'rp r-' + c.role));
      if (x.fielded) fr.append(el('span', 'rt-in', 'In party'));
      else if (x.out) fr.append(el('span', 'rt-in rt-away', 'Away'));
      if (x.flag) fr.append(el('span', 'ndot'));
    } else fr.append(el('i', 'rp r-' + c.role));
    t.append(fr, el('span', 'rt-nm', first(x.k)));
    if (x.out) { const o = el('span', 'rt-how rt-out', x.out.txt); rosTiles[x.k].out = o; t.append(o); }
    if (!x.rec) { t.append(el('span', 'rt-ti', c.title), el('span', 'rt-how', x.how)); }
    t.setAttribute('aria-label', `${c.name}, ${c.title}. ${PTY.rarityName(x.k)} ${PTY.ROLE_NAME[c.role]}. ` + (x.rec ? `Level ${x.rec.lv}${x.fielded ? ', in the party' : x.out ? `, ${x.out.txt}` : ', on the bench'}.` : `Not recruited. ${recruitHow(x.k)}`));
    t.addEventListener('click', () => partySheet.open(x.k));
    r.grid.append(t);
  }

  // ================= leads =================
  let leadSig = '';
  function updateLeads(sec) {
    if (!live()) { sec.hidden = true; return; }
    const list = leadList();
    const sig = JSON.stringify(list.map(l => [l.id, l.name, l.how, l.sub, pctOf(l) != null ? Math.floor(pctOf(l) * 100) : null, l.action && l.action.label, l.ready]));
    putHidden(sec, !list.length);
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
    if (!live() || (typeof soloOn === 'function' && soloOn())) { pdot.hidden = true; return; }
    const any = rosterList().some(needsYou) || bondNews();
    putHidden(pdot, !any || S.tab === 'party');
    if (tabBtn) putAttr(tabBtn, 'aria-label', 'Party' + (any ? ', something new' : ''));
  }
  // An unread Bond story (56f) marks the Team view.
  const bondNews = () => typeof bondUnreadAll === 'function' && safe(() => bondUnreadAll(), 0) > 0;
  // SOLO1: the party is gone. The tab is the hero's (its card, gear and the star map); no roster, bench or Bonds.
  const SOLO = typeof soloOn === 'function' && soloOn();
  registerView('party', { id: 'team', label: SOLO ? 'Hero' : 'Team', order: 10, dot: () => !SOLO && live() && bondNews() });
  // The same news marks the Roster sub-view (70-ui registerView).
  if (!SOLO) registerView('party', { id: 'roster', label: 'Roster', order: 20, dot: () => !SOLO && live() && rosterList().some(needsYou) });
  let dotT = 0;
  onTick(dt => { dotT -= dt; if (dotT <= 0) { dotT = 1; try { updateDot(); } catch (e) {} } });
  for (const ev of ['milestone', 'promote', 'recruit', 'storiesRead', 'bondLevel', 'bondStory']) on(ev, () => { try { updateDot(); } catch (e) {} });
  if (tabBtn) tabBtn.addEventListener('click', () => updateDot());

  // ================= sections =================
  const guard = (name, fn) => (...a) => { try { fn(...a); } catch (e) { console.error('[lanternfall] party ' + name, e); } };
  if (!SOLO) registerSection('party', { id: 'party-form', title: 'Your party', mount: buildForm, update: guard('formation', () => { updateForm(); updateWhy(); }) });
  if (!SOLO) registerSection('party', {
    id: 'party-syn', title: 'Combos', feature: 'synergy', mount(sec) { sec.hidden = true; sec.append(el('div', 'syn-row')); },
    update: guard('combos', () => {
      const sec = document.getElementById('sec-party-syn'); updateSyn(sec);
    })
  });
  if (!SOLO) registerSection('party', {
    id: 'party-bonds', title: 'Bonds', feature: 'synergy', mount(sec) { sec.append(el('div', 'bd-rows')); },
    update: guard('bonds', () => { if (live() && bondsUI) bondsUI.rows(document.querySelector('#sec-party-bonds .bd-rows')); })
  });
  if (!SOLO) registerSection('party', { id: 'party-bench', title: 'Bench', mount: buildBench, update: guard('bench', updateBench) });
  registerSection('party', {
    id: 'party-hero', title: 'Your hero', mount(sec) { sec.append(el('div', 'pc-herobox')); },
    update: guard('hero', () => updateHero(document.querySelector('#sec-party-hero .pc-herobox')))
  });
  if (!SOLO) registerSection('party', {
    id: 'party-field', title: 'Fighting beside you', mount(sec) { sec.append(el('div', 'pcards')); },
    update: guard('companions', () => { if (live()) updateComps(document.querySelector('#sec-party-field .pcards')); })
  });
  if (!SOLO) registerSection('party', { id: 'party-roster', title: 'Roster', view: 'roster', mount: buildRosterHead, update: guard('roster', updateRoster) });
  if (!SOLO) registerSection('party', {
    id: 'party-leads', title: 'Leads', view: 'roster', mount(sec) { sec.append(el('div', 'leads')); },
    update: guard('leads', () => updateLeads(document.getElementById('sec-party-leads')))
  });
  // Keep an open sheet live while the tab updates.
  registerSection('party', { id: 'party-live', title: '', view: '*', mount(sec) { sec.hidden = true; }, update: guard('sheet', () => partySheet.refresh()) });
}
