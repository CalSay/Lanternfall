// 74-ui-hands: the hiring board and your gatherers (task W1-E; docs/design/gatherers-2.md, economy-2.md 4-5).
// Two sections in Camp > Tavern, under the heading and above the online parts. Browser-only, works offline:
// it reads and writes the Hands core (57f-hands.js) only, and never touches online, room or db.
//   #sec-hands       Hire gatherers: Tents used, route arrivals in star spots, then random applicants.
//   #sec-hands-crew  Your gatherers: shifts, queues, recall, packs and send again.
// Two-tap confirms for irreversible choices arm a button for 4 seconds; no confirm().
let handsTalkMount, handsTalkOpen, handsTalkUpdate;
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
  const shiftChoice = Object.create(null), moreOpen = Object.create(null);
  let showApps = false;   // menu audit: the hire board folds away when it is long or the tents are full
  let talkBox = null, talkId = null, talkLine = '', talkPicking = false, talkOrigin = null, talkFallback = null, talkSig = '';
  const isArmed = k => armed === k && Date.now() - armedAt < 4000;
  const arm = k => { armed = k; armedAt = Date.now(); picking = null; ui(true); };
  const say = t => { msg = t; msgAt = Date.now(); };
  const tradeReason = () => !handsOpen() ? 'Gatherers need Hearth 2 and a built Tavern.'
    : !handsTradeOpen() ? 'Build Tavern 2 so a trader starts passing through.' : '';
  function tradeButton(x, busy, onOpen = null) {
    const b = btn('mini', 'Trade run'), why = tradeReason();
    b.classList.add('hd-trade'); b.disabled = busy || !!why;
    b.setAttribute('aria-label', `Send ${x.n} on a trade run${why ? '. ' + why : ''}`);
    if (why) b.title = why;
    b.addEventListener('click', () => { if (onOpen) onOpen(); handsTradeOpenPicker(x.id); });
    return b;
  }

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

  // C2: one inline talk card is shared by the Camp scene and its gatherer buttons.
  // The job rows below are the same picker used by the Tavern crew cards.
  handsTalkMount = (host, fallback) => {
    talkFallback = fallback;
    talkBox = el('section', 'hd-card'); talkBox.id = 'hands-talk'; talkBox.hidden = true;
    talkBox.setAttribute('role', 'region'); talkBox.setAttribute('aria-label', 'Gatherer conversation');
    talkBox.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); closeTalk(); } });
    host.append(talkBox);
  };
  const closeTalk = () => {
    talkId = null; talkPicking = false; talkSig = '';
    if (talkBox) { talkBox.hidden = true; talkBox.textContent = ''; }
    const target = talkOrigin && talkOrigin.isConnected ? talkOrigin : talkFallback;
    if (target) target.focus();
  };
  handsTalkOpen = (id, origin) => {
    const x = handsGet(id);
    if (!x || !talkBox) return false;
    talkOrigin = origin || null; talkId = id; talkPicking = false; talkSig = '';
    handsTalk(id); talkLine = handsTalkInfo(id).line;
    renderTalk(true);
    return true;
  };
  handsTalkUpdate = () => { if (talkId) renderTalk(false); };
  function renderTalk(focus) {
    if (!talkBox || !talkId) return;
    const x = handsGet(talkId); if (!x) { closeTalk(); return; }
    const info = handsTalkInfo(talkId), st = handsStatus(x), busy = !!x.job || !!x.pack.length;
    if (busy) talkPicking = false;
    const sig = JSON.stringify([x.id, x.lv, x.job && [x.job.start, x.job.end, x.job.q, x.job.role], x.pack, talkLine, st.st,
      Math.ceil((st.left || 0) / 60), talkPicking, shiftChoice[x.id], Math.floor(S.gold / 10), tradeReason()]);
    if (sig === talkSig && !focus) return;
    talkSig = sig;
    const focused = talkBox.contains(document.activeElement) ? [...talkBox.querySelectorAll('button')].indexOf(document.activeElement) : -1;
    talkBox.hidden = false; talkBox.textContent = '';
    const top = el('div', 'hd-head'), who = el('div', 'hd-id');
    const title = el('h3', 'hd-name', info.name || x.n); title.id = 'hands-talk-title';
    talkBox.setAttribute('aria-labelledby', title.id);
    who.append(title, el('div', 'hd-sub2', `${handsRarName(x)} ${info.jobName || handsSkillName(x)} · Lv ${x.lv}`));
    top.append(portrait(x), who);
    const close = btn('mini', 'Close'); close.setAttribute('aria-label', `Close conversation with ${x.n}`);
    close.addEventListener('click', closeTalk);
    const line = el('p', 'note hd-line', ['out', 'back'].includes(st.st) ? talkLine : `“${talkLine}”`);
    const status = el('p', 'hd-stat', statusText(x, st));
    const act = el('div', 'hd-act'), send = btn('mini go', talkPicking ? 'Close jobs' : 'Send on a job');
    send.disabled = busy;
    send.addEventListener('click', () => { talkPicking = !talkPicking; renderTalk(true); });
    act.append(send, tradeButton(x, busy, closeTalk));
    if (busy) {
      const controls = btn('mini', 'Open gatherer controls');
      controls.addEventListener('click', () => emit('campGoto', { tab: 'world', view: 'tav', sel: '#sec-hands-crew' }));
      act.append(controls);
    }
    act.append(close);
    talkBox.append(top, traitChips(x), line, status, act);
    if (tradeReason()) talkBox.append(el('p', 'note hd-trade-lock', tradeReason()));
    if (talkPicking && !busy) talkBox.append(jobPicker(x, info.jobs, () => {
      talkPicking = false; talkLine = handsTalkInfo(x.id).line; renderTalk(true);
    }));
    if (focus || focused >= 0) {
      const buttons = [...talkBox.querySelectorAll('button')];
      const target = focus ? (talkPicking ? talkBox.querySelector('.hd-job') || close : close) : buttons[Math.min(focused, buttons.length - 1)] || close;
      target.focus();
    }
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
      // The people already at camp lead the Tavern view; applicants follow them.
      if (B && B.sec) sec.parentNode.insertBefore(sec, B.sec);
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
    const board = handsBoard().filter(b => b.app.sk !== 'hunt' || huntingVisible()), tents = handsTents(), used = handsList().length;
    const nxt = handsNextApp(), left = Math.max(1, HANDS_TUNE.pity[0] - S.hands.pity[0]);
    setTxt(B.note, (nxt === null ? 'The three random spots are full.' : `Next applicant in ${dur(nxt / 1000)}.`) +
      ` A Rare or better shows up within ${left === 1 ? 'the next applicant' : left + ' applicants'}.`);
    const spots = handsLegendSpots(), named = board.filter(b => b.app.key), random = board.filter(b => !b.app.key);
    const sig = JSON.stringify([tents, used, Math.floor(S.gold / 10), armed, isArmed(armed), showApps,
      board.map(b => [b.app.id, b.cost, b.can.why]), spots.map(l => [l.state, l.hint])]);
    if (sig === boardSig) return;
    boardSig = sig;
    B.top.textContent = '';
    const tentTxt = btn('hd-tents', `Tents ${used}/${tents}`); tentTxt.title = 'Each hired gatherer takes one Tent. Open the Tent build at camp.';
    tentTxt.addEventListener('click', () => emit('campGoto', { tab: 'world', view: 'camp', sel: '#camp-b-tent' }));
    const gl = el('span', 'hd-gold'); gl.append(img(iconURL('coin', '#F2C14E')), el('span', null, fmt(S.gold)));
    B.top.append(tentTxt, gl);
    B.stars.textContent = ''; B.list.textContent = '';
    // Menu audit 2026-10-01: nine full hire cards ran 9 screens while one tent was free. Tents full: one line and a
    // Show button. Otherwise the best 3 (named first, then the job board), and Show all for the rest.
    const full = used >= tents, all = named.concat(random), SHOW = 3;
    const toggle = (txt) => { const b = btn('mini hd-more', txt); b.addEventListener('click', () => { showApps = !showApps; ui(true); }); return b; };
    if (full && !showApps) {
      const line = el('div', 'hd-full');
      const go = btn('mini go', 'Build a Tent'); go.addEventListener('click', () => emit('campGoto', { tab: 'world', view: 'camp', sel: '#camp-b-tent' }));
      line.append(el('p', 'note', `Tents full (${used}/${tents}). Build a Tent to hire more.` + (all.length ? ` ${all.length} waiting.` : '')), go);
      if (all.length) line.append(toggle(`Show applicants (${all.length})`));
      B.stars.append(line);
    } else {
      const shown = showApps ? all : all.slice(0, SHOW);
      const sn = shown.filter(b => b.app.key), sr = shown.filter(b => !b.app.key);
      if (sn.length) B.stars.append(el('h3', 'hd-sub', 'Here at the Tavern'));
      for (const b of sn) B.stars.append(appCard(b));
      B.list.append(el('h3', 'hd-sub', 'Job board'));
      if (!random.length) B.list.append(el('p', 'note', 'No random applicants are waiting. They walk in every few hours, even while you are away.'));
      for (const b of sr) B.list.append(appCard(b));
      if (all.length > SHOW) B.list.append(toggle(showApps ? 'Show fewer' : `Show all ${all.length} applicants`));
    }
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
    if (x.job && x.job.role === 'trade') {
      if (st.st === 'out') return `${st.label} · ${dur(st.left)} left`;
      if (st.st === 'back') return 'Returning from trade';
    }
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
    const sig = JSON.stringify([list.map(x => [x.id, x.lv, x.job && [x.job.start, x.job.end, x.job.q, x.job.role], x.pack, x.last, x.sent, handsUnpaid(x), Math.floor(x.xp), shiftChoice[x.id], !!moreOpen[x.id]]), Math.floor(S.gold / 10), againPlan, armed, isArmed(armed), picking, tradeReason()]);
    if (sig === crewSig) return;
    crewSig = sig;
    C.top.textContent = '';
    if (againPlan.ready) {
      const all = btn('mini', againPlan.count === againPlan.ready ? `Send shifts again: ${gold(againPlan.fee)}` : `Send ${againPlan.count} of ${againPlan.ready} shifts again: ${gold(againPlan.fee)}`);
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
    const talk = btn('mini', 'Talk');
    talk.setAttribute('aria-label', `Talk to ${x.n} at camp`);
    talk.addEventListener('click', () => {
      emit('campGoto', { tab: 'world', view: 'camp', sel: '#camp-scene-scroll' });
      handsTalkOpen(x.id);
    });
    const send = btn('mini go', picking === x.id ? 'Close' : 'Send on a job');
    send.disabled = busy;
    send.addEventListener('click', () => { picking = picking === x.id ? null : x.id; armed = null; ui(true); });
    const trade = tradeButton(x, busy);
    if (!busy && x.last) {
      const plan = handsSendAgainPreview(x.id);
      const again = btn('mini', `Send again: ${gold(plan.fee)}`);
      again.setAttribute('aria-label', `Send ${x.n} again to their last job`);
      again.disabled = !plan.count;
      again.addEventListener('click', () => { const n = handsSendAgain(x.id); say(n ? `${x.n} heads out again.` : `${x.n} could not go. Check the job and shift fee.`); ui(true); });
      act.append(again);
    }
    if (x.job) {
      const k = 'recall:' + x.id, tradeRun = x.job.role === 'trade';
      const recall = btn('mini warn', isArmed(k) ? (tradeRun ? 'Tap again: recall trade' : 'Tap again: recall') : 'Recall');
      recall.addEventListener('click', () => {
        if (!isArmed(k)) { arm(k); return; }
        armed = null;
        const recalled = handsRecall(x.id);
        say(recalled ? tradeRun ? `${x.n} came home. Original cargo returned${x.pack.length ? '; what did not fit waits in their pack' : ''}. No gold earned.`
          : `${x.n} is coming home with the haul so far.` : `${x.n} could not be recalled.`);
        ui(true);
      });
      act.append(recall);
      card.append(el('p', 'note hd-line', tradeRun
        ? 'Recall returns the original cargo. Anything that does not fit waits in their pack. No gold is earned.' : st.st === 'rest'
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
    // Menu audit: one main button (Send again when they have a last job, else Send on a job); the rest behind More
    const more = btn('mini hd-more', moreOpen[x.id] ? 'Less' : 'More');
    more.setAttribute('aria-expanded', String(!!moreOpen[x.id]));
    more.addEventListener('click', () => { moreOpen[x.id] = !moreOpen[x.id]; ui(true); });
    const again0 = act.querySelector('button:not(.warn)');   // Send again, when shown
    const extra = el('div', 'hd-act hd-extra'); extra.hidden = !moreOpen[x.id];
    if (again0) { extra.append(send); } else act.prepend(send);
    extra.prepend(talk); extra.append(trade);
    for (const w of [...act.querySelectorAll('.warn')]) if (!/Recall|recall/.test(w.textContent)) extra.append(w);
    extra.append(go);
    act.append(more);
    card.append(act, extra);
    if (tradeReason()) card.append(el('p', 'note hd-trade-lock', tradeReason()));
    if (picking === x.id && !busy) card.append(jobPicker(x));
    return card;
  }

  function jobPicker(x, offered = handsNodes(x).filter(n => n.own), onSent = null) {
    const box = el('div', 'hd-jobs');
    const nodes = offered.filter(n => n.own && craftNodeVisible(n.kind, n.t));
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
        if (j && onSent) onSent(j);
        say(j ? `${x.n} heads out to the ${handsNodeName(n.kind, n.t)} for ${count} shift${count === 1 ? '' : 's'}.` : can.why);
        ui(true);
      });
      box.append(row);
    }
    return box;
  }
}
