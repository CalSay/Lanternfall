// 74-ui-hands: the hiring board and your gatherers (task W1-E; docs/design/gatherers-2.md, economy-2.md 4-5).
// Two sections in Camp > Tavern, under the heading and above the online parts. Browser-only, works offline:
// it reads and writes the Hands core (57f-hands.js) only, and never touches online, room or db.
//   #sec-hands       Hire gatherers: Tents used, route arrivals in star spots, then random applicants.
//   #sec-hands-crew  Your gatherers: shifts, queues, recall, packs and send again.
// Two-tap confirms for irreversible choices arm a button for 4 seconds; no confirm().
{
  const RC = r => `var(--r-${r})`;
  const dur = secs => { secs = Math.ceil(secs); const h = Math.floor(secs / 3600), m = Math.floor(secs % 3600 / 60); return secs < 60 ? secs + 's' : h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`; };
  const btn = (cls, txt) => { const b = el('button', cls, txt); b.type = 'button'; return b; };
  const setTxt = (e, t) => { if (e && e.textContent !== t) e.textContent = t; };
  const KIND = { mine: 'ore', wood: 'wood', forage: 'herb', any: 'ore' };
  const skIcon = (sk, t = 1) => { try { return matIcon(KIND[sk] || 'wood', t); } catch (e) { return iconURL('coin', '#F2C14E'); } };
  const gold = n => `${fmt(n)} gold`;
  const matTxt = (kind, t) => { try { return matName(kind, t); } catch (e) { return 'goods'; } };
  const legendAbout = a => { const l = HANDS_LEGENDS.find(x => x.key === a.key); return l ? l.about : ''; };

  let armed = null, armedAt = 0, picking = null, msg = '', msgAt = 0;
  const shiftChoice = Object.create(null);
  const isArmed = k => armed === k && Date.now() - armedAt < 4000;
  const arm = k => { armed = k; armedAt = Date.now(); picking = null; ui(true); };
  const say = t => { msg = t; msgAt = Date.now(); };

  // A gatherer's portrait: the job icon on a frame in the rarity colour, with their initial.
  function portrait(x) {
    const d = el('div', 'hd-pt'); d.style.setProperty('--rc', RC(x.r));
    d.append(img(skIcon(x.sk, Math.min(5, 1 + Math.floor((x.lv || 1) / 5)))), el('b', null, String(x.n || '?').charAt(0)));
    return d;
  }
  function traitChips(x) {
    const box = el('div', 'hd-tr');
    for (const t of handsTraits(x)) { const c = el('span', 'hd-trait' + (t.calling ? ' call' : ''), t.n); c.title = t.txt; box.append(c); }
    return box;
  }

  let B = null, C = null, boardSig = '', crewSig = '';
  registerSection('tav', {
    id: 'hands', title: 'Hire gatherers',
    mount(sec) {
      const panel = sec.parentNode, head = panel.querySelector('.world-head');
      panel.insertBefore(sec, head ? head.nextSibling : panel.firstChild);
      B = { sec, top: el('div', 'hd-top'), note: el('p', 'note hd-note'), stars: el('div', 'hd-list'), list: el('div', 'hd-list'), legends: el('div', 'hd-leg'), msg: el('p', 'hd-msg') };
      B.msg.hidden = true;
      B.msg.setAttribute('role', 'status');
      sec.append(B.top, B.msg, B.stars, B.list, B.note, B.legends);
    },
    update() { if (B) drawBoard(); }
  });
  registerSection('tav', {
    id: 'hands-crew', title: 'Your gatherers',
    mount(sec) {
      const next = B && B.sec && B.sec.nextSibling;
      if (next && next !== sec) sec.parentNode.insertBefore(sec, next);
      C = { sec, top: el('div', 'hd-act'), list: el('div', 'hd-list'), note: el('p', 'note hd-note') };
      sec.append(C.top, C.list, C.note);
    },
    update() { if (C) drawCrew(); }
  });

  function drawBoard() {
    const open = handsOpen();
    B.sec.hidden = !S.camp;
    if (!S.camp) return;
    if (msg && Date.now() - msgAt > 6000) msg = '';
    setTxt(B.msg, msg); B.msg.hidden = !msg;
    if (!open) {
      B.top.textContent = ''; B.stars.textContent = ''; B.list.textContent = ''; B.legends.textContent = ''; boardSig = '';
      setTxt(B.note, 'Gatherers open when your Hearth is Lv 2 and the Tavern is built.');
      return;
    }
    const board = handsBoard(), tents = handsTents(), used = handsList().length;
    const nxt = handsNextApp(), left = Math.max(1, HANDS_TUNE.pity[0] - S.hands.pity[0]);
    setTxt(B.note, (nxt === null ? 'The three random spots are full.' : `Next applicant in ${dur(nxt / 1000)}.`) +
      ` A Rare or better shows up within ${left === 1 ? 'the next applicant' : left + ' applicants'}.`);
    const spots = handsLegendSpots(), named = board.filter(b => b.app.key), random = board.filter(b => !b.app.key);
    const sig = JSON.stringify([tents, used, Math.floor(S.gold / 10), armed, isArmed(armed),
      board.map(b => [b.app.id, b.cost, b.can.why]), spots.map(l => [l.state, l.hint])]);
    if (sig === boardSig) return;
    boardSig = sig;
    B.top.textContent = '';
    const tentTxt = btn('hd-tents', `Tents ${used}/${tents}`); tentTxt.title = 'Each hired gatherer takes one Tent. Open the Tent build at camp.';
    tentTxt.addEventListener('click', () => emit('campGoto', { tab: 'world', view: 'camp', sel: '#camp-b-tent' }));
    const gl = el('span', 'hd-gold'); gl.append(img(iconURL('coin', '#F2C14E')), el('span', null, fmt(S.gold)));
    B.top.append(tentTxt, gl);
    B.stars.textContent = '';
    if (named.length) B.stars.append(el('h3', 'hd-sub', 'Here at the Tavern'));
    for (const b of named) B.stars.append(appCard(b));
    B.list.textContent = '';
    B.list.append(el('h3', 'hd-sub', 'Job board'));
    if (!random.length) B.list.append(el('p', 'note', 'No random applicants are waiting. They walk in every few hours, even while you are away.'));
    for (const b of random) B.list.append(appCard(b));
    B.legends.textContent = '';
    B.legends.append(el('h3', 'hd-sub', 'Word on the Road'));
    const row = el('div', 'hd-leg-row');
    for (const l of spots.filter(l => l.state !== 'board')) {
      const c = el('div', 'hd-star ' + l.state); c.style.setProperty('--rc', RC('legendary'));
      c.append(el('b', null, l.state === 'away' || l.state === 'later' ? '???' : l.n), el('small', null, l.state === 'hired' ? 'Hired' : l.hint || 'Word has not reached them yet.'));
      c.title = l.about || l.hint || 'A named gatherer. They come to the Tavern by their route.';
      row.append(c);
    }
    B.legends.append(row);
  }

  function appCard(b) {
    const a = b.app, card = el('div', 'hd-card'); card.style.setProperty('--rc', RC(a.r));
    const named = !!a.key;
    const head = el('div', 'hd-head'), id = el('div', 'hd-id');
    id.append(el('div', 'hd-name', `${named ? '★ ' : ''}${a.n}`), el('div', 'hd-sub2', `${handsRarName(a)} ${handsSkillName(a)}${a.ret ? ' · Lv ' + a.ret.lv : ''}`));
    head.append(portrait(a), id);
    card.append(head, traitChips(a));
    const pv = handsPreview(Object.assign({ lv: (a.ret && a.ret.lv) || 1 }, a), b.kind, b.t);
    card.append(el('p', 'note hd-line', `A shift at the ${handsNodeName(b.kind, b.t)} brings about ${storeNum(pv.haul)} ${matTxt(b.kind, b.t)} in ${dur(pv.secs)}.`));
    if (named) card.append(el('p', 'note hd-line', a.ret ? 'They remember you. Hiring them again is free.' : legendAbout(a)));
    const price = b.cost ? `Hire for ${gold(b.cost)}` : 'Hire for free';
    const k = 'hire:' + a.id, act = el('div', 'hd-act');
    const hire = btn('mini go', isArmed(k) ? `Tap again: ${price}` : price);
    hire.disabled = !b.can.ok;
    hire.addEventListener('click', () => {
      if (!isArmed(k)) { arm(k); return; }
      armed = null;
      const x = handsHire(b.i);
      say(x ? `${x.n} joined you. They have a tent.` : 'Could not hire.');
      ui(true);
    });
    act.append(hire);
    if (!named) {
      const k2 = 'away:' + a.id;
      const away = btn('mini', isArmed(k2) ? 'Tap again: send them off' : 'Turn away');
      away.addEventListener('click', () => {
        if (!isArmed(k2)) { arm(k2); return; }
        armed = null; handsTurnAway(b.i); say(`${a.n} leaves the Tavern.`); ui(true);
      });
      act.append(away);
    }
    card.append(act);
    if (!b.can.ok) card.append(el('p', 'note hd-why', b.can.why));
    return card;
  }

  // ---------------- your gatherers ----------------
  const packText = x => x.pack.map(([kind, t, n]) => `${storeNum(n)} ${kind === 'troph' ? 'Trophy' : matTxt(kind, t)}`).join(', ');
  const statusText = (x, st) => {
    const q = x.job && x.job.q || 0;
    const next = q ? ` · ${q} more shift${q === 1 ? '' : 's'} queued` : '';
    if (st.st === 'out') return `On shift: ${st.label.replace(/^Out at the /, '')}, ${dur(st.left)} left${next}`;
    if (st.st === 'rest') return `Resting at camp: next shift in ${dur(st.left)}${next}`;
    if (st.st === 'back') return 'Walking home';
    if (st.st === 'pack') return `Pack waits: Storehouse full · ${packText(x)}`;
    if (handsUnpaid(x)) {
      const w = x.last || handsSuggest(x);
      return `Unpaid: needs ${gold(handsFee(x, w.kind, w.t))} for another shift. Waiting at camp.`;
    }
    return 'Idle at camp';
  };
  function drawCrew() {
    const open = handsOpen();
    C.sec.hidden = !open;
    if (!open) return;
    const list = handsList();
    for (const row of C.list.querySelectorAll('[data-left]')) {
      const x = handsGet(row.dataset.left), s = x && handsStatus(x);
      if (s && (s.st === 'out' || s.st === 'rest')) setTxt(row, statusText(x, s));
    }
    const againPlan = handsSendAgainPreview();
    const sig = JSON.stringify([list.map(x => [x.id, x.lv, x.job && [x.job.start, x.job.end, x.job.q], x.pack, x.last, x.sent, handsUnpaid(x), Math.floor(x.xp), shiftChoice[x.id]]), Math.floor(S.gold / 10), againPlan, armed, isArmed(armed), picking]);
    if (sig === crewSig) return;
    crewSig = sig;
    C.top.textContent = '';
    if (againPlan.ready) {
      const all = btn('mini', againPlan.count === againPlan.ready ? `Send all again: ${gold(againPlan.fee)}` : `Send ${againPlan.count} of ${againPlan.ready}: ${gold(againPlan.fee)}`);
      all.setAttribute('aria-label', `Send ${againPlan.count} of ${againPlan.ready} ready gatherers to their last jobs for ${gold(againPlan.fee)}`);
      all.disabled = !againPlan.count;
      all.addEventListener('click', () => { const n = handsSendAgain(); say(n ? `${n} gatherer${n === 1 ? '' : 's'} sent again.` : 'No gatherer could be sent. Check the shift fees and your gold.'); ui(true); });
      C.top.append(all);
    }
    C.list.textContent = '';
    if (!list.length) C.list.append(el('p', 'note', 'Nobody works for you yet. Hire someone above.'));
    for (const x of list) C.list.append(crewCard(x));
    setTxt(C.note, list.length ? 'Each shift costs a fee when you send. A gatherer you cannot pay waits at camp.' : '');
  }

  function crewCard(x) {
    const card = el('div', 'hd-card'); card.style.setProperty('--rc', RC(x.r));
    const head = el('div', 'hd-head'), id = el('div', 'hd-id');
    const st = handsStatus(x), unpaid = handsUnpaid(x);
    id.append(el('div', 'hd-name', x.n), el('div', 'hd-sub2', `${handsRarName(x)} ${handsSkillName(x)} · Lv ${x.lv}${x.lv >= HANDS_TUNE.lvMax ? ' (top)' : ''}`));
    head.append(portrait(x), id);
    card.append(head, traitChips(x));
    const stat = el('p', 'hd-stat');
    stat.className = 'hd-stat ' + ((st.st === 'out' || st.st === 'rest') ? 'out' : st.st === 'pack' ? 'wait' : unpaid ? 'unpaid' : 'idle');
    stat.textContent = statusText(x, st);
    if (st.st === 'out' || st.st === 'rest') stat.dataset.left = x.id;
    card.append(stat);
    if (x.lv < HANDS_TUNE.lvMax) card.append(el('p', 'note hd-line', `Level ${x.lv + 1} after ${dur(Math.max(0, handsLevelNeed(x.lv) - x.xp) * 3600)} more work.`));
    const busy = !!x.job || x.pack.length > 0;
    const act = el('div', 'hd-act');
    const send = btn('mini go', picking === x.id ? 'Close' : 'Send on a job');
    send.disabled = busy;
    send.addEventListener('click', () => { picking = picking === x.id ? null : x.id; armed = null; ui(true); });
    if (!busy && x.last) {
      const plan = handsSendAgainPreview(x.id);
      const again = btn('mini', `Send again: ${gold(plan.fee)}`);
      again.setAttribute('aria-label', `Send ${x.n} again to their last job`);
      again.disabled = !plan.count;
      again.addEventListener('click', () => { const n = handsSendAgain(x.id); say(n ? `${x.n} heads out again.` : `${x.n} could not go. Check the job and shift fee.`); ui(true); });
      act.append(again);
    }
    if (x.job) {
      const k = 'recall:' + x.id, recall = btn('mini warn', isArmed(k) ? 'Tap again: recall' : 'Recall');
      recall.addEventListener('click', () => {
        if (!isArmed(k)) { arm(k); return; }
        armed = null;
        say(handsRecall(x.id) ? `${x.n} is coming home with the haul so far.` : `${x.n} could not be recalled.`);
        ui(true);
      });
      act.append(recall);
      card.append(el('p', 'note hd-line', st.st === 'rest'
        ? 'Recall cancels the next shift and refunds it and any later shifts.'
        : 'Recall brings home the haul so far. This shift is paid; later shifts are refunded.'));
    }
    if (x.pack.length) {
      const k = 'empty:' + x.id, empty = btn('mini warn', isArmed(k) ? `Tap again: throw away ${packText(x)}` : 'Empty pack');
      empty.addEventListener('click', () => {
        if (!isArmed(k)) { arm(k); return; }
        armed = null;
        const contents = packText(x);
        handsEmpty(x.id); say(`${x.n}'s pack emptied. Threw away ${contents}.`); ui(true);
      });
      act.append(empty);
    }
    const kg = 'go:' + x.id;
    const go = btn('mini warn', isArmed(kg) ? (x.key ? 'Tap again: back to the Tavern' : 'Tap again: they leave for good') : 'Let go');
    go.disabled = busy;
    go.addEventListener('click', () => {
      if (!isArmed(kg)) { arm(kg); return; }
      armed = null;
      const n = x.n, named = !!x.key;
      if (handsLetGo(x.id)) say(named ? `${n} went back to the Tavern with their level.` : `${n} left camp.`);
      ui(true);
    });
    act.prepend(send); act.append(go);
    card.append(act);
    if (picking === x.id && !busy) card.append(jobPicker(x));
    return card;
  }

  function jobPicker(x) {
    const box = el('div', 'hd-jobs');
    const nodes = handsNodes(x).filter(n => n.own);
    if (!nodes.length) { box.append(el('p', 'note', 'No job is open for them yet. Open more nodes with your hero first.')); return box; }
    box.append(el('p', 'note', 'Pick a job. Every shift lasts 4 hours. Fees are paid now; the haul comes home to the Storehouse.'));
    const count = shiftChoice[x.id] || 1, choices = el('div', 'hd-shifts');
    choices.setAttribute('role', 'group'); choices.setAttribute('aria-label', `Shifts for ${x.n}`);
    for (let n = 1; n <= (typeof handsQueueMax === 'function' ? handsQueueMax(x) : 2); n++) {
      const choice = btn('mini' + (count === n ? ' on' : ''), `${n} shift${n === 1 ? '' : 's'}`);
      choice.setAttribute('aria-pressed', String(count === n));
      choice.addEventListener('click', () => { shiftChoice[x.id] = n; ui(true); });
      choices.append(choice);
    }
    box.append(choices);
    if (count > 1) box.append(el('p', 'note', 'They rest 30 minutes between shifts. The same job runs again after each rest.'));
    for (const n of nodes) {
      const pv = handsPreview(x, n.kind, n.t), can = handsCanSend(x.id, n.kind, n.t, { shifts: count });
      const fee = can.fee === undefined ? handsFee(x, n.kind, n.t) * count : can.fee;
      const row = btn('hd-job', ''); row.setAttribute('aria-disabled', String(!can.ok));
      const tx = el('span', 'hd-job-tx');
      tx.append(el('b', null, `${handsNodeName(n.kind, n.t)} (grade ${n.t})`),
        el('small', null, `About ${storeNum(pv.haul)} ${matTxt(n.kind, n.t)} per ${dur(pv.secs)} shift` + (n.full ? '. Storehouse full.' : '')),
        el('small', 'fee', `${fee ? `Total fee ${gold(fee)}` : 'Free'}${can.ok ? '' : ' · ' + can.why}`));
      row.append(img(matIcon(n.kind, n.t)), tx);
      row.addEventListener('click', () => {
        if (!can.ok) { say(can.why); ui(true); return; }
        const j = handsSend(x.id, n.kind, n.t, { shifts: count });
        picking = null;
        say(j ? `${x.n} heads out to the ${handsNodeName(n.kind, n.t)} for ${count} shift${count === 1 ? '' : 's'}.` : can.why);
        ui(true);
      });
      box.append(row);
    }
    return box;
  }
}
