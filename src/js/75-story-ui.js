// 75-story-ui: how the story reaches the player (story-delivery; docs/design/story-bible.md section 10). Browser-only; the logic
// is in 55-story.js. Small and skippable; nothing here blocks play for more than a card.
//
// Two shapes, one at a time (55-story queues them and holds the game while one is up):
//   - a caption (area title, zone line, Captain line): a line or two in the open sky of the stage, held at most 3 s; any tap ends it.
//     If a menu covers the stage it is dropped (the Road log in the Journal keeps it).
//   - a card sequence (region card, Champion and Elder scenes, NPC, Voice, a choice): a small bottom sheet, one card a tap,
//     with Skip always shown. A card waits while another sheet or full-screen card is up, and is filed as 'auto' after 28 s.
//     Skipped or closed early, it is filed in the Journal and its page is kept. A card nobody touches (no pointerdown or key in the
//     page) for 45 s ends as 'auto' too: the game runs again and the scene waits in the Journal under "Catch up on the story". It
//     counts no skip (storyClose 'auto' sets no ends entry); every tap or key, and every new card, restarts the 45 s.
// The Journal (Codex > Journal, storyUI.codexRow): everything read, for re-reading, a "Catch up on the story" entry for
// scenes the save passed before it could play, and a small Road log of the area titles and zone lines seen.
// Settings > Story: "Story cards: on / off" (S.story.off). Reduced motion: no slide or fade.
// API: storyUI { open(id), list(fromCodex), codexRow() }.
var storyUI;   // var: 75-codex-ui (earlier in the build) reads it at run time
{
  const btn = (cls, txt) => { const b = el('button', cls, txt); b.type = 'button'; return b; };
  const safe = (fn, d) => { try { return fn(); } catch (e) { console.error('[lanternfall] story ui', e); return d; } };
  const PAGE_IC = () => iconURL('charm', '#F2E27A');
  const BLOCK = '.away-ov, #createScreen, .join-ov, .gl-ov, .mm-ov, .bsheet-ov:not(.docked), .dd-fc-ov, .dw-ov';
  const blocked = () => !!document.querySelector(BLOCK);
  const menuOpen = () => !!S.tab;   // a landscape menu covers most of the stage
  const stageBox = () => document.getElementById('stageBox');
  const chapterOf = r => { const i = REGIONS.findIndex(x => x.id === r); return i >= 0 ? `Chapter ${i + 1}: ${REGIONS[i].n.replace(/^./, c => c.toUpperCase())}` : ''; };
  const KIND = { region: 'Chapter', champion: 'Champion', elder: 'Elder', page: 'Page', voice: 'A voice', npc: 'Meeting', letter: 'Letter', note: 'Note', ranks: 'Page' };

  // check.mjs sets this in its browser contexts so a new game's opening card never sits over a test's first click; scenes are skipped (and filed)
  const TEST_SKIP = (() => { try { return localStorage.getItem('lanternfall.test.nostory') === '1'; } catch (e) { return false; } })();
  // check.mjs shortens the 45 s an untouched card waits (ms) with this key
  const IDLE_MS = (() => { try { const v = +localStorage.getItem('lanternfall.test.storyIdle'); return v > 0 ? v : 45000; } catch (e) { return 45000; } })();
  let capNode = null, capT = 0, capOff = null, waitT = 0, now = null, cardApi = null;

  // ---------------- a scene arrives ----------------
  on('storyScene', sc => { if (TEST_SKIP) { storyClose(sc.id, 'skipped'); return; } now = sc; run(); });
  on('storyEnd', ({ id }) => { if (now && now.id === id) { now = null; clearTimeout(waitT); } });   // closed from the engine (Story cards turned off) while it waited
  function run() {
    clearTimeout(waitT);
    const sc = now; if (!sc) return;
    if (sc.kind === 'caption') {
      if (menuOpen() || blocked() || !stageBox()) {
        // a sheet still fading out covers the stage for a moment: wait a little, then drop it (the Road log keeps it)
        sc.waited = sc.waited || Date.now();
        if (Date.now() - sc.waited > 1500) { now = null; storyClose(sc.id, 'done'); return; }
        waitT = setTimeout(run, 150); return;
      }
      now = null; showCaption(sc); return;
    }
    if (blocked() || !stageBox() || (sc.waited && !sc.chain && !storyInGap())) {   // once it has waited behind another overlay, it also waits for the next gap (never mid-fight);
      // the next scene of a stop (chain) only waits for the last sheet to close
      sc.waited = sc.waited || Date.now();
      if (Date.now() - sc.waited > 28000) { now = null; storyClose(sc.id, 'auto'); return; }   // a long wait: file it for the Journal, never play it mid-fight
      waitT = setTimeout(run, 400); return;
    }
    now = null; showCard(sc);
  }

  // ---------------- the caption ----------------
  function endCaption(sc, how) {
    if (!capNode) return;
    const n = capNode; capNode = null; clearTimeout(capT);
    if (capOff) { document.removeEventListener('pointerdown', capOff, true); capOff = null; }
    storyClose(sc.id, how);   // the game resumes as the caption fades
    if (reduced) n.remove(); else { n.classList.add('out'); setTimeout(() => n.remove(), 220); }
  }
  function showCaption(sc) {
    const box = stageBox();
    // the guide's bubble sits in the same sky for the first zones: a caption there moves down to the open ground
    const node = el('div', 'sty-cap' + (sc.ch === 'C' ? ' elder' : '') + (S.maxZone < 3 || (typeof ONBOARD === 'object' && ONBOARD.paused) ? ' low' : ''));
    node.setAttribute('role', 'status');
    if (sc.head) node.append(el('b', 'sty-cap-h', sc.head));
    for (const l of sc.lines) node.append(el('span', 'sty-cap-l', l));
    if (!reduced) node.classList.add('in');
    box.append(node); capNode = node;
    storyClaim(sc.id);
    capT = setTimeout(() => endCaption(sc, 'done'), sc.hold || 3000);
    capOff = () => endCaption(sc, 'done');
    setTimeout(() => { if (capNode === node) document.addEventListener('pointerdown', capOff, true); }, 80);
    node.addEventListener('click', e => e.stopPropagation());
  }

  // ---------------- the card sequence ----------------
  function showCard(sc) {
    if (typeof openSheet !== 'function') { storyClose(sc.id, 'skipped'); return; }
    storyClaim(sc.id);
    let i = Math.max(0, Math.min(sc.cards.length - 1, sc.at || 0)), finished = false, idleT = 0;   // reload-keeps-tips: a scene rebuilt after a reload opens at its saved page
    // no pointerdown or key anywhere for IDLE_MS: the card files itself (how 'auto'); any input restarts the wait
    const wake = () => { clearTimeout(idleT); idleT = setTimeout(() => end('auto'), IDLE_MS); };
    const stopIdle = () => { clearTimeout(idleT); document.removeEventListener('pointerdown', wake, true); document.removeEventListener('keydown', wake, true); };
    const end = how => { stopIdle(); if (finished) return; finished = true; storyClose(sc.id, how); if (cardApi) cardApi.close(); };
    document.addEventListener('pointerdown', wake, true); document.addEventListener('keydown', wake, true); wake();
    openSheet(api => {
      cardApi = api;
      api.sheet.classList.add('sty-sheet', 'sty-scene');
      const draw = () => {
        wake();
        api.body.textContent = ''; api.foot.textContent = '';
        const c = sc.cards[i], last = i === sc.cards.length - 1;
        storyPage(sc.id, i);   // the save keeps the page on screen (S.story.open)
        const card = el('article', 'sty-card');
        if (i === 0) {
          const where = sc.ch === 'R' ? '' : [chapterOf(sc.region), sc.zone ? `Zone ${sc.zone}` : ''].filter(Boolean).join(' · ');
          if (where) card.append(el('span', 'sty-eye', where));
        }
        if (c.choice) {
          const d = storyChoiceDef(c.choice) || { prompt: '', options: [] };
          card.append(el('h2', 'sty-title', d.prompt));
          api.body.append(card);
          const opts = el('div', 'sty-opts');
          for (const o of d.options) {
            const b = btn('big forge sty-opt');
            b.append(el('b', null, o.label)); if (o.line) b.append(el('span', null, o.line));
            b.addEventListener('click', () => { storyChoose(c.choice, o.id); if (last) end('done'); else { i++; draw(); } });
            opts.append(b);
          }
          api.body.append(opts);
        } else {
          if (i === 0 && sc.title && sc.ch !== 'K') { const h = el('h2', 'sty-title', sc.title); h.id = 'styTitle'; card.append(h); api.sheet.setAttribute('aria-labelledby', 'styTitle'); }
          if (c.who && !(i === 0 && c.who === sc.title)) card.append(el('p', 'sty-head', c.who));
          for (const l of c.lines) card.append(el('p', 'sty-text', l));
          if (sc.cards.length > 1) card.append(el('span', 'sty-count', `${i + 1} of ${sc.cards.length}`));
          api.body.append(card);
        }
        const row = el('div', 'sty-actions');
        if (!c.choice) {
          const go = btn('big forge sty-done', sc.ch === 'R' ? 'Begin' : last ? 'Continue' : 'Next');
          go.addEventListener('click', () => { if (last) end('done'); else { i++; draw(); } });
          row.append(go);
        }
        const skip = btn('mini sty-skip', 'Skip'); skip.setAttribute('aria-label', 'Skip this story. It stays in the Journal.');
        skip.addEventListener('click', () => end('skipped'));
        row.append(skip);
        api.body.append(row);
        const go = api.body.querySelector('.sty-done'); if (go) requestAnimationFrame(() => safe(() => go.focus({ preventScroll: true })));
      };
      draw();
    }, { label: sc.title || 'The story', small: true, onClose() { cardApi = null; stopIdle(); if (!finished) { finished = true; storyClose(sc.id, 'skipped'); } } });
  }

  // ---------------- one Journal entry, read again ----------------
  let fromCodex = false;
  function openEntry(id, opts) {
    if (typeof openSheet !== 'function') return;
    const e = storyEntry(id); if (!e) return;
    const chain = opts && opts.chain;   // catch-up: step through these ids
    storyRead(id);
    openSheet(api => {
      api.sheet.classList.add('sty-sheet');
      if (fromCodex || chain) {
        const back = btn('sty-back', '‹ Journal'); back.setAttribute('aria-label', 'Back to the Journal');
        back.addEventListener('click', () => openList(fromCodex));
        api.body.append(back);
      }
      const card = el('article', 'sty-card');
      const where = [chapterOf(e.region), e.zone ? `Zone ${e.zone}` : ''].filter(Boolean).join(' · ');
      if (where) card.append(el('span', 'sty-eye', where));
      const h = el('h2', 'sty-title', e.title); h.id = 'styTitle';
      card.append(h);
      // a choice left open by an unattended scene is offered where it stood; what follows it shows once the choice is made
      let into = card, rest = null;
      for (const c of e.cards) {
        const d = c.choice && !rest && storyChoiceDef(c.choice);
        if (d) {
          const cid = c.choice, opts = el('div', 'sty-opts');
          rest = el('div', 'sty-rest'); rest.hidden = true;
          for (const o of d.options) {
            const b = btn('big forge sty-opt');
            b.append(el('b', null, o.label)); if (o.line) b.append(el('span', null, o.line));
            b.addEventListener('click', () => { storyChoose(cid, o.id); opts.replaceWith(el('p', 'sty-text sty-chosen', `You chose ${o.label}.`)); rest.hidden = false; });
            opts.append(b);
          }
          card.append(el('p', 'sty-head', d.prompt), opts, rest);
          into = rest; continue;
        }
        if (c.choice) continue;
        if (c.who) into.append(el('p', 'sty-head', c.who));
        for (const l of c.lines) into.append(el('p', 'sty-text', l));
      }
      api.body.append(card);
      const row = el('div', 'sty-actions');
      const next = chain && chain.filter(x => x !== id && storyUnread().includes(x))[0];
      if (next) {
        const n = storyEntry(next);
        const nb = btn('big forge sty-next', `Next: ${n ? n.title : 'more'}`);
        nb.addEventListener('click', () => openEntry(next, { chain }));
        row.append(nb);
      }
      const done = btn(next ? 'mini sty-done' : 'big forge sty-done', next ? 'Later' : 'Close');
      done.addEventListener('click', () => api.close());
      row.append(done);
      api.body.append(row);
      api.sheet.setAttribute('aria-labelledby', 'styTitle');
    }, { label: e.title, small: true, onClose() { fromCodex = false; } });
  }

  // ---------------- the Journal (from the Codex) ----------------
  function openList(codex) {
    if (typeof openSheet !== 'function') return;
    if (codex) storyJournalOpened();
    openSheet(api => {
      fromCodex = !!codex;
      api.sheet.classList.add('sty-sheet');
      if (codex) {
        const back = btn('sty-back', '‹ Codex'); back.setAttribute('aria-label', 'Back to the Codex');
        back.addEventListener('click', () => emit('codexOpen', { page: null }));
        api.body.append(back);
      }
      api.body.append(el('h2', 'sty-ltitle', 'Journal'));
      const list = storyList(), late = storyLate();
      if (late.length) {
        const c = btn('sty-catch');
        c.append(img(PAGE_IC(), 'px sty-chip-ic'));
        const tx = el('span', 'sty-chip-tx');
        tx.append(el('b', null, 'Catch up on the story'), el('span', 'sty-chip-note', `${late.length} ${late.length > 1 ? 'pages' : 'page'} from before you got here. One tap each.`));
        c.append(tx, el('span', 'sty-chip-go', 'Read'));
        c.addEventListener('click', () => { fromCodex = !!codex; openEntry(late[0], { chain: late }); });
        api.body.append(c);
      }
      if (!list.length) api.body.append(el('p', 'note sty-empty', 'The road has only begun. What you read joins here.'));
      let region = '';
      const box = el('div', 'sty-rows');
      for (const b of list) {
        if (b.region !== region) { region = b.region; box.append(el('h3', 'sty-grp', chapterOf(region))); }
        const r = btn('sty-row' + (b.read ? '' : ' unread'));
        r.append(img(PAGE_IC(), 'px sty-row-ic'));
        const tx = el('span', 'sty-row-tx');
        tx.append(el('b', null, b.title), el('span', null, KIND[b.kind] || ''));
        r.append(tx);
        if (!b.read) r.append(el('span', 'cx-dot'));
        r.addEventListener('click', () => { fromCodex = !!codex; openEntry(b.id); });
        box.append(r);
      }
      api.body.append(box);
      const road = storyRoadLog();
      if (road.length) {
        api.body.append(el('h3', 'sty-grp', 'Road log'));
        const lg = el('div', 'sty-road');
        for (const x of road) { const p = el('p', 'sty-road-l'); p.append(el('b', null, x.head + ' '), document.createTextNode(x.line)); lg.append(p); }
        api.body.append(lg);
      }
    }, { label: 'Journal', small: true });
  }

  // ---------------- the Codex row ----------------
  function codexRow() {
    const list = storyList(), unread = list.filter(b => !b.read).length, late = storyLate().length;
    const r = btn('sty-cx' + (unread ? ' news' : ''));
    r.append(img(PAGE_IC(), 'px sty-cx-ic'));
    const tx = el('span', 'sty-cx-tx');
    tx.append(el('b', null, 'Journal'), el('span', null, late ? 'Catch up on the story' : list.length ? `${list.length} ${list.length > 1 ? 'pages' : 'page'}${unread ? `, ${unread} new` : ''}` : 'What you read joins here'));
    r.append(tx, el('span', 'sty-cx-go', 'Read'));
    if (unread) r.append(el('span', 'cx-dot'));
    r.setAttribute('aria-label', `The Journal${unread ? `, ${unread} unread` : ''}`);
    r.addEventListener('click', () => openList(true));
    return r;
  }

  // ---------------- Settings > Story ----------------
  if (typeof registerSection === 'function') registerSection('log', {
    id: 'story-set', title: 'Story',
    mount(sec) {
      const b = btn('cb-toggle');
      const put = () => { const on_ = storyOn(); b.textContent = `Story cards: ${on_ ? 'On' : 'Off'}`; b.setAttribute('aria-pressed', on_ ? 'true' : 'false'); };
      b.addEventListener('click', () => { S.story.off = S.story.off ? 0 : 1; put(); save(); });
      put();
      const w = el('div', 'cb-set'); w.append(b, el('p', 'note', 'Short story cards between fights. Off, nothing plays and the Journal keeps what you read.'));
      sec.append(w);
    },
    update() {}
  });

  // Vesper's verse (bible 7): once an Elder is down, the newest verse she has written, as its own Tavern section (story-systems-hollow)
  if (typeof registerSection === 'function') {
    let sec = null, vp = null;
    registerSection('tav', {
      id: 'story-verse', title: '',
      mount(node) { sec = node; vp = el('p', 'note tav-verse'); sec.append(vp); },
      update() {
        const vs = typeof storyVerseLatest === 'function' ? storyVerseLatest() : null;
        if (!sec) return;
        sec.hidden = !vs;
        { const t = vs ? 'Vesper sings: ' + vs.lines.join(' ') : ''; if (vp.textContent !== t) vp.textContent = t; }
      }
    });
  }

  storyUI = { open: id => openEntry(id), list: codex => openList(!!codex), codexRow };
}
