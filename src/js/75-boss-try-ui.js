// 75-boss-try-ui: the Try again card after a zone boss beats you (logic: 55-boss-try.js; card wall-try-again).
// A bottom sheet that holds the game while it is open: why you lost (the hit that won, the boss's weakness), the moves
// you have learned, the ways forward, and two buttons. Try again starts the boss; closing the sheet keeps you fighting in the
// zone, where the boss waits behind the Fight tab's gate. Browser-only.
{
  let open = null;
  holdGame(() => !!open && !open.closed);   // 00-util's pause registry: the hero is not hit while the card is up
  const blocked = () => !!document.querySelector('.away-ov, #createScreen, .join-ov, .gl-ov, .mm-ov');
  function show() {
    const L = S.bossTry && S.bossTry.last;
    if (!L || !bossTryHeld() || typeof openSheet !== 'function') return;
    if (blocked()) { setTimeout(show, 600); return; }
    const why = bossTryWhy(L), weak = bossTryWeak(L), ways = bossTryWays(L);
    openSheet(api => {
      open = api;
      api.sheet.classList.add('bt-sheet');
      api.body.append(el('div', 'bt-eye', `Zone ${L.zone} boss · try ${L.n}`), el('h2', 'bt-head', `${L.boss || 'The boss'} beat you`), el('p', 'bt-why', why.head));
      for (const x of why.lines) api.body.append(el('p', 'bt-line', x));
      if (weak) api.body.append(el('p', 'bt-weak', weak));
      if (L.shown > 0 || L.hidden > 0) {
        api.body.append(el('h3', 'bt-ways-h', 'Moves you know'));
        const chips = el('div', 'bt-chips');
        for (const m of L.moves) chips.append(el('span', 'sb-chip' + (m.charged ? ' charged' : ''), `${m.name} · ${m.hits} hit${m.hits > 1 ? 's' : ''}${m.charged ? ' · charged' : ''}${m.tricks ? ' · ' + m.tricks : ''}`));
        if (L.hidden > 0) chips.append(el('span', 'bt-more', `${L.hidden} unknown. Each try shows one more.`));
        api.body.append(chips);
      }
      api.body.append(el('h3', 'bt-ways-h', 'Ways forward'));
      const ul = el('ul', 'bt-ways');
      for (const w of ways) ul.append(el('li', null, w.txt));
      api.body.append(ul);
      const lb = el('label', 'note bt-auto'), cb = el('input'); cb.type = 'checkbox'; cb.checked = !!S.auto;
      cb.addEventListener('change', () => { S.auto = cb.checked; const g = $('autoBoss'); if (g) g.checked = S.auto; });
      lb.append(cb, ' Try again on my own when I am stronger');
      api.body.append(lb);
      const go = el('button', 'big forge bt-go', 'Try again'); go.type = 'button';
      go.addEventListener('click', () => { api.close(); if (S.activity !== 'fight') setActivity('fight'); if (challenge()) ui(true); });
      const stay = el('button', 'big bt-stay', 'Keep fighting here'); stay.type = 'button';
      stay.addEventListener('click', () => api.close());
      api.foot.append(go, stay);
      go.focus({ preventScroll: true });
    }, { label: 'The boss beat you', onClose: () => { open = null; ui(true); } });
  }
  on('wipe', e => { if (e && e.boss && !e.arena) setTimeout(show, 0); });
}
