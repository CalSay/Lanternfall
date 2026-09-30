// 75-story-ui: how the story reaches the player (task LORE3; lore.md 9). Browser-only; logic in
// 55-story.js. Small and skippable; nothing here blocks play.
//
// On the stage (one caption at a time, in the stage's open sky; a tap dismisses it):
//   - an arrival banner the first time the party fights in a place: the place name, one line
//   - an elder line when a boss of a new type appears (intro). W1-B: its fall line no longer shows.
//   - a story chip when a beat plays: "New story: Wisps. Read" (tap opens the card; it waits in the
//     Codex if it goes unread). A quiet beat (a save that got past it) goes to the bell list only.
// Captions wait while a menu covers the stage or a full-screen card is up, and ask the notice policy
// (70-ui noticeAsk) before they show: arrival and elder lines that could not show in time go to the bell
// (they belong to the moment), story chips wait.
// Reduced motion: no slide or fade, the caption just appears and goes.
// The beat card: a small bottom sheet (title, 2-5 sentences, lines from recruited companions).
// The Codex home gets a "Story" row (storyUI.codexRow, read by 75-codex-ui): the story so far, and
// for old saves one "Catch up on the story" entry that reads the missed pages in order.
// API: storyUI { open(id), list(fromCodex), codexRow() }.
var storyUI;   // var: 75-codex-ui (earlier in the build) reads it at run time
{
  const btn = (cls, txt) => { const b = el('button', cls, txt); b.type = 'button'; return b; };
  const safe = (fn, d) => { try { return fn(); } catch (e) { console.error('[lanternfall] story ui', e); return d; } };
  const PAGE_IC = () => iconURL('charm', '#F2E27A');
  const BLOCK = '.away-ov, #createScreen, .join-ov, .gl-ov, .bsheet-ov, .dd-fc-ov, .dw-ov';
  const covered = () => (!!S.tab && !(typeof isWide === 'function' && isWide())) || !!document.querySelector(BLOCK);
  const REGION_N = { hollow: 'the Hollow', coast: 'the Sunken Coast' };
  const chapterOf = r => { const i = REGIONS.findIndex(x => x.id === r); return i >= 0 ? `Chapter ${i + 1}: ${REGIONS[i].n}` : ''; };

  // ---------------- the stage caption ----------------
  const queue = [];
  let cur = null, pumpT = 0;
  const stageBox = () => document.getElementById('stageBox');
  function push(item) {
    item.at = playS();
    // one arrival at a time: a newer place replaces an older one still waiting
    if (item.kind === 'arrival') for (let i = queue.length - 1; i >= 0; i--) if (queue[i].kind === 'arrival') queue.splice(i, 1);
    // an elder's line jumps ahead of story chips (it belongs to the fight on screen)
    if (item.kind !== 'beat') { const i = queue.findIndex(q => q.kind === 'beat'); if (i >= 0) { queue.splice(i, 0, item); pump(); return; } }
    queue.push(item);
    pump();
  }
  // W1-B: every caption asks the notice policy first (70-ui noticeAsk, 23n-data-notices): the place title
  // and a new elder's line pop within the pop budget and never while the guide speaks; they wait for a quiet
  // moment (the title while the hero stays in that zone, up to NOTICE_TUNE.arrivalWait s; an elder's line
  // NOTICE_TUNE.elderWait s) and then go to the bell. An elder's fall line and a walked-past page never pop.
  const capKey = q => q.kind === 'arrival' ? 'caption:arrival' : q.kind === 'beat' ? (q.quiet ? 'caption:beat-quiet' : 'caption:beat') : /fall/.test(q.kind) ? 'caption:fall' : 'caption:elder';
  const capText = q => q.kind === 'beat' ? `New story: ${q.title}.` : `${q.head ? q.head + ': ' : ''}${q.line}`;
  const playS = () => (typeof notes === 'object' ? notes.clock : Date.now() / 1000);   // seconds of play (70-ui): a paused game waits too
  const ask = (q, wait) => (typeof noticeAsk === 'function' ? noticeAsk(capKey(q), capText(q), { wait }) : 'pop');
  function pump() {
    clearTimeout(pumpT);
    if (cur || !queue.length) return;
    const now = playS();
    for (let i = queue.length - 1; i >= 0; i--) {
      const q = queue[i], wait = q.kind === 'arrival' ? NOTICE_TUNE.arrivalWait : NOTICE_TUNE.elderWait;
      if (q.kind !== 'beat' && (now - q.at > wait || (q.zone && q.zone !== S.zone))) {   // the moment has passed
        queue.splice(i, 1);
        if (typeof noticeDrop === 'function' && !/fall/.test(q.kind)) noticeDrop(capKey(q), capText(q));
      }
    }
    if (!queue.length) return;
    if (covered() || !stageBox()) { pumpT = setTimeout(pump, 500); return; }
    const r = ask(queue[0], true);
    if (r === 'wait') { pumpT = setTimeout(pump, 1000); return; }
    const q = queue.shift();
    if (r === 'pop') show(q); else pump();
  }
  function hide(node, instant) {
    if (!node || node._gone) return;
    node._gone = true; clearTimeout(node._t);
    const done = () => { node.remove(); if (cur === node) cur = null; setTimeout(pump, reduced ? 0 : 250); };
    if (instant || reduced) done();
    else { node.classList.add('out'); setTimeout(done, 260); }
  }
  function show(item) {
    const box = stageBox(); if (!box) return;
    let node;
    if (item.kind === 'beat') {
      node = btn('sty-chip' + (item.quiet ? ' quiet' : ''));
      node.append(img(PAGE_IC(), 'px sty-chip-ic'));
      const tx = el('span', 'sty-chip-tx');
      tx.append(el('span', 'sty-chip-eye', 'New story'), el('b', 'sty-chip-t', item.title));
      if (item.quiet && item.note) tx.append(el('span', 'sty-chip-note', item.note));
      node.append(tx, el('span', 'sty-chip-go', 'Read'));
      node.setAttribute('aria-label', `New story: ${item.title}. Read it`);
      node.addEventListener('click', e => { e.stopPropagation(); hide(node, true); openBeat(item.id); });
      node._t = setTimeout(() => hide(node), 14000);
    } else {
      node = el('div', 'sty-cap ' + item.kind);
      node.setAttribute('role', 'status');
      if (item.head) node.append(el('b', 'sty-cap-h', item.head));
      node.append(el('span', 'sty-cap-l', item.line));
      node.addEventListener('click', e => { e.stopPropagation(); hide(node); });
      node._t = setTimeout(() => hide(node), Math.min(7500, 2800 + item.line.length * 45));
      // an arrival banner goes when the party leaves the place; an elder's intro makes way for its fall
      node._item = item; node._shown = Date.now();
      if (item.zone) { const w = setInterval(() => { if (node._gone) clearInterval(w); else if (S.zone !== item.zone) { clearInterval(w); hide(node); } }, 500); }
    }
    if (!reduced) node.classList.add('in');
    cur = node;
    box.append(node);
  }

  on('storyArrival', e => push({ kind: 'arrival', head: e.head, line: e.line, zone: e.zone }));
  on('storyElder', e => {
    if (e.kind === 'fall') {
      // a quick kill: the intro still waiting is dropped, one on screen stays a moment and goes
      for (let i = queue.length - 1; i >= 0; i--) if (queue[i].key === e.key) queue.splice(i, 1);
      if (cur && cur._item && cur._item.key === e.key) { const n = cur; clearTimeout(n._t); n._t = setTimeout(() => hide(n), Math.max(0, 1800 - (Date.now() - n._shown))); }
    }
    push({ kind: 'elder ' + e.kind, key: e.key, head: e.name, line: e.line });
  });
  on('storyBeat', e => { const b = e.beat || {}; push({ kind: 'beat', id: e.id, title: b.title, note: b.note, quiet: !!e.quiet }); });
  on('storyRead', () => { });
  // a menu opening covers the stage: let the caption finish where it is, the queue waits
  on('menuView', () => pump());

  // ---------------- the beat card ----------------
  let fromCodex = false;
  function openBeat(id, opts) {
    if (typeof openSheet !== 'function') return;
    const list = storyList(), b = list.find(x => x.id === id); if (!b) return;
    const chain = opts && opts.chain;   // catch-up: step through these ids
    storyRead(id);
    openSheet(api => {
      api.sheet.classList.add('sty-sheet');
      if (fromCodex || chain) {
        const back = btn('sty-back', '‹ Story'); back.setAttribute('aria-label', 'Back to the story so far');
        back.addEventListener('click', () => openList(fromCodex));
        api.body.append(back);
      }
      const card = el('article', 'sty-card');
      const where = [chapterOf(b.region), b.at ? `Zone ${b.at}` : ''].filter(Boolean).join(' · ');
      if (where) card.append(el('span', 'sty-eye', where));
      const h = el('h2', 'sty-title', b.title); h.id = 'styTitle';
      card.append(h);
      if (b.head) card.append(el('p', 'sty-head', b.head));
      card.append(el('p', 'sty-text', b.text));
      api.body.append(card);
      const row = el('div', 'sty-actions');
      const next = chain && chain.filter(x => x !== id && storyUnread().includes(x))[0];
      if (next) {
        const n = list.find(x => x.id === next);
        const nb = btn('big forge sty-next', `Next: ${n ? n.title : 'more'}`);
        nb.addEventListener('click', () => openBeat(next, { chain }));
        row.append(nb);
      }
      const done = btn(next ? 'mini sty-done' : 'big forge sty-done', next ? 'Later' : 'Close');
      done.addEventListener('click', () => api.close());
      row.append(done);
      api.body.append(row);
      api.sheet.setAttribute('aria-labelledby', 'styTitle');
    }, { label: b.title, small: true, onClose() { fromCodex = false; } });
  }

  // ---------------- the story so far (from the Codex) ----------------
  function openList(codex) {
    if (typeof openSheet !== 'function') return;
    openSheet(api => {
      fromCodex = !!codex;
      api.sheet.classList.add('sty-sheet');
      if (codex) {
        const back = btn('sty-back', '‹ Codex'); back.setAttribute('aria-label', 'Back to the Codex');
        back.addEventListener('click', () => emit('codexOpen', { page: null }));
        api.body.append(back);
      }
      api.body.append(el('h2', 'sty-ltitle', 'The story so far'));
      const list = storyList(), late = storyLate();
      if (late.length) {
        const c = btn('sty-catch');
        c.append(img(PAGE_IC(), 'px sty-chip-ic'));
        const tx = el('span', 'sty-chip-tx');
        tx.append(el('b', null, 'Catch up on the story'), el('span', 'sty-chip-note', `${late.length} ${late.length > 1 ? 'pages' : 'page'} from before you got here. One tap each.`));
        c.append(tx, el('span', 'sty-chip-go', 'Read'));
        c.addEventListener('click', () => { fromCodex = !!codex; openBeat(late[0], { chain: late }); });
        api.body.append(c);
      }
      if (!list.length) api.body.append(el('p', 'note sty-empty', 'The road has only begun. Pages join here as you walk it.'));
      let region = '';
      const box = el('div', 'sty-rows');
      for (const b of list) {
        if (b.region !== region) { region = b.region; box.append(el('h3', 'sty-grp', chapterOf(region))); }
        const r = btn('sty-row' + (b.read ? '' : ' unread'));
        r.append(img(PAGE_IC(), 'px sty-row-ic'));
        const tx = el('span', 'sty-row-tx');
        tx.append(el('b', null, b.title), el('span', null, b.note));
        r.append(tx);
        if (!b.read) r.append(el('span', 'cx-dot'));
        r.addEventListener('click', () => { fromCodex = !!codex; openBeat(b.id); });
        box.append(r);
      }
      api.body.append(box);
      const ahead = STORY_NEXT();
      if (ahead) api.body.append(el('p', 'note sty-ahead', `The next page waits at zone ${ahead}.`));
    }, { label: 'The story so far', small: true });
  }
  // the next beat with a zone the save has not reached
  const STORY_NEXT = () => { const b = (typeof HOLLOW_STORY !== 'undefined' ? HOLLOW_STORY : []).find(x => x.at && !storyHas(x.id)); return b ? b.at : 0; };

  // ---------------- the Codex row ----------------
  function codexRow() {
    const list = storyList(), unread = list.filter(b => !b.read).length, late = storyLate().length;
    const r = btn('sty-cx' + (unread ? ' news' : ''));
    r.append(img(PAGE_IC(), 'px sty-cx-ic'));
    const tx = el('span', 'sty-cx-tx');
    tx.append(el('b', null, 'Story'), el('span', null, late ? 'Catch up on the story' : list.length ? `${list.length} ${list.length > 1 ? 'pages' : 'page'}${unread ? `, ${unread} new` : ''}` : 'Pages join as you walk the road'));
    r.append(tx, el('span', 'sty-cx-go', 'Read'));
    if (unread) r.append(el('span', 'cx-dot'));
    r.setAttribute('aria-label', `The story so far${unread ? `, ${unread} unread` : ''}`);
    r.addEventListener('click', () => openList(true));
    return r;
  }

  storyUI = { open: id => openBeat(id), list: codex => openList(!!codex), codexRow };
}
