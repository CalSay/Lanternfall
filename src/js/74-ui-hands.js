// 74-ui-hands: the hiring board and your gatherers (task W1-E; docs/design/gatherers-2.md, economy-2.md 4-5).
// Two sections in Camp > Tavern, under the heading and above the online parts. Browser-only, works offline:
// it reads and writes the Hands core (57f-hands.js) only, and never touches online, room or db.
//   #sec-hands       Hire gatherers: Tents used, applicants (portrait, rarity, job, traits, price), next applicant,
//                    pity hint, the five named gatherers (star spots).
//   #sec-hands-crew  Your gatherers: status, shift fee, "Send on a job", "Let go".
// Two-tap confirms (hire, let go) arm a button for 4 seconds; no confirm().
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
      B = { sec, top: el('div', 'hd-top'), note: el('p', 'note hd-note'), list: el('div', 'hd-list'), legends: el('div', 'hd-leg'), msg: el('p', 'hd-msg') };
      B.msg.hidden = true;
      sec.append(B.top, B.msg, B.list, B.note, B.legends);
    },
    update() { if (B) drawBoard(); }
  });
  registerSection('tav', {
    id: 'hands-crew', title: 'Your gatherers',
    mount(sec) {
      const next = B && B.sec && B.sec.nextSibling;
      if (next && next !== sec) sec.parentNode.insertBefore(sec, next);
      C = { sec, list: el('div', 'hd-list'), note: el('p', 'note hd-note') };
      sec.append(C.list, C.note);
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
      B.top.textContent = ''; B.list.textContent = ''; B.legends.textContent = ''; boardSig = '';
      setTxt(B.note, 'Gatherers open when your Hearth is Lv 2 and the Tavern is built.');
      return;
    }
    const board = handsBoard(), tents = handsTents(), used = handsList().length;
    const nxt = handsNextApp(), left = Math.max(1, HANDS_TUNE.pity[0] - S.hands.pity[0]);
    setTxt(B.note, (nxt === null ? 'The board is full. Turn someone away to make room.' : `Next applicant in ${dur(nxt / 1000)}.`) +
      ` A Rare or better shows up within ${left === 1 ? 'the next applicant' : left + ' applicants'}.`);
    const sig = JSON.stringify([tents, used, Math.floor(S.gold / 10), armed, isArmed(armed),
      board.map(b => [b.app.id, b.cost, b.can.why]), handsLegendSpots().map(l => l.state)]);
    if (sig === boardSig) return;
    boardSig = sig;
    B.top.textContent = '';
    const tentTxt = el('span', 'hd-tents', `Tents ${used}/${tents}`); tentTxt.title = 'Each hired gatherer takes one tent.';
    const gl = el('span', 'hd-gold'); gl.append(img(iconURL('coin', '#F2C14E')), el('span', null, fmt(S.gold)));
    B.top.append(tentTxt, gl);
    B.list.textContent = '';
    if (!board.length) B.list.append(el('p', 'note', 'Nobody is waiting. Applicants walk in every few hours, even while you are away.'));
    for (const b of board) B.list.append(appCard(b));
    B.legends.textContent = '';
    B.legends.append(el('h3', 'hd-sub', 'Named gatherers'));
    const row = el('div', 'hd-leg-row');
    for (const l of handsLegendSpots()) {
      const c = el('div', 'hd-star ' + l.state); c.style.setProperty('--rc', RC('legendary'));
      c.append(el('b', null, l.state === 'away' ? '???' : l.n), el('small', null, l.state === 'hired' ? 'Hired' : l.state === 'board' ? 'Waits on the board' : 'Not here yet'));
      c.title = l.state === 'away' ? 'A named gatherer. They come to the Tavern in time.' : l.about;
      row.append(c);
    }
    B.legends.append(row);
  }

  function appCard(b) {
    const a = b.app, card = el('div', 'hd-card'); card.style.setProperty('--rc', RC(a.r));
    const named = !!a.key;
    const head = el('div', 'hd-head'), id = el('div', 'hd-id');
    id.append(el('div', 'hd-name', a.n), el('div', 'hd-sub2', `${handsRarName(a)} ${handsSkillName(a)}${a.ret ? ' · Lv ' + a.ret.lv : ''}${named ? ' · named' : ''}`));
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
  function drawCrew() {
    const open = handsOpen();
    C.sec.hidden = !open;
    if (!open) return;
    const list = handsList();
    for (const row of C.list.querySelectorAll('[data-left]')) {
      const x = handsGet(row.dataset.left), s = x && handsStatus(x);
      if (s && s.st === 'out') setTxt(row, `On shift: ${s.label.replace(/^Out at the /, '')}, ${dur(s.left)} left`);
    }
    const sig = JSON.stringify([list.map(x => [x.id, x.lv, x.job ? 1 : 0, x.pack.length, x.sent, handsUnpaid(x), Math.floor(x.xp)]), Math.floor(S.gold / 10), armed, isArmed(armed), picking]);
    if (sig === crewSig) return;
    crewSig = sig;
    C.list.textContent = '';
    if (!list.length) C.list.append(el('p', 'note', 'Nobody works for you yet. Hire someone above.'));
    for (const x of list) C.list.append(crewCard(x));
    setTxt(C.note, list.length ? 'Each shift costs a fee, paid when you send. A gatherer you cannot pay waits at camp and never leaves.' : '');
  }

  function crewCard(x) {
    const card = el('div', 'hd-card'); card.style.setProperty('--rc', RC(x.r));
    const head = el('div', 'hd-head'), id = el('div', 'hd-id');
    const st = handsStatus(x), unpaid = handsUnpaid(x);
    id.append(el('div', 'hd-name', x.n), el('div', 'hd-sub2', `${handsRarName(x)} ${handsSkillName(x)} · Lv ${x.lv}${x.lv >= HANDS_TUNE.lvMax ? ' (top)' : ''}`));
    head.append(portrait(x), id);
    card.append(head, traitChips(x));
    const stat = el('p', 'hd-stat');
    if (st.st === 'out') { stat.className = 'hd-stat out'; stat.textContent = `On shift: ${st.label.replace(/^Out at the /, '')}, ${dur(st.left)} left`; stat.dataset.left = x.id; }
    else if (st.st === 'back') { stat.className = 'hd-stat out'; stat.textContent = 'Walking home'; }
    else if (st.st === 'pack') { stat.className = 'hd-stat wait'; stat.textContent = 'Pack waits: the Storehouse is full'; }
    else if (unpaid) {
      const w = x.last || handsSuggest(x);
      stat.className = 'hd-stat unpaid'; stat.textContent = `Unpaid: needs ${gold(handsFee(x, w.kind, w.t))} for the next shift. Waiting at camp.`;
    } else { stat.className = 'hd-stat idle'; stat.textContent = 'Idle at camp'; }
    card.append(stat);
    if (x.lv < HANDS_TUNE.lvMax) card.append(el('p', 'note hd-line', `Level ${x.lv + 1} after ${dur(Math.max(0, handsLevelNeed(x.lv) - x.xp) * 3600)} more work.`));
    const busy = !!x.job || x.pack.length > 0;
    const act = el('div', 'hd-act');
    const send = btn('mini go', picking === x.id ? 'Close' : 'Send on a job');
    send.disabled = busy;
    send.addEventListener('click', () => { picking = picking === x.id ? null : x.id; armed = null; ui(true); });
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
    act.append(send, go);
    card.append(act);
    if (picking === x.id && !busy) card.append(jobPicker(x));
    return card;
  }

  function jobPicker(x) {
    const box = el('div', 'hd-jobs');
    const nodes = handsNodes(x).filter(n => n.own);
    if (!nodes.length) { box.append(el('p', 'note', 'No job is open for them yet. Open more nodes with your hero first.')); return box; }
    box.append(el('p', 'note', 'Pick a job. The fee is paid now. The haul comes home to the Storehouse.'));
    for (const n of nodes) {
      const pv = handsPreview(x, n.kind, n.t), fee = handsFee(x, n.kind, n.t), can = handsCanSend(x.id, n.kind, n.t);
      const row = btn('hd-job', ''); row.disabled = !can.ok;
      const tx = el('span', 'hd-job-tx');
      tx.append(el('b', null, `${handsNodeName(n.kind, n.t)} (grade ${n.t})`),
        el('small', null, `About ${storeNum(pv.haul)} ${matTxt(n.kind, n.t)} in ${dur(pv.secs)}` + (n.full ? '. Storehouse full.' : '')),
        el('small', 'fee', can.ok ? (fee ? `Fee ${gold(fee)}` : 'Free shift') : can.why));
      row.append(img(matIcon(n.kind, n.t)), tx);
      row.addEventListener('click', () => {
        const j = handsSend(x.id, n.kind, n.t);
        picking = null;
        say(j ? `${x.n} heads out to the ${handsNodeName(n.kind, n.t)}.` : can.why);
        ui(true);
      });
      box.append(row);
    }
    return box;
  }
}
