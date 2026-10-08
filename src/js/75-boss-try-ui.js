// 75-boss-try-ui: the Try again card after a zone boss beats you (logic: 55-boss-try.js; card wall-try-again).
// A bottom sheet that holds the game while it is open: why you lost (the hit that won, the boss's weakness), the moves
// you have learned, the ways forward, and two buttons. Try again starts the boss; closing the sheet keeps you fighting in the
// zone, where the boss waits behind the Fight tab's gate. Browser-only.
{
  let open = null;
  const ODDS_WAIT = 1500;   // ms the footer waits for the chance before it shows today's buttons
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
      // boss-retry-reads-odds: on the frontier in a turn fight, the chance to win now (59m bossOdds, worked out in chunks, never
      // sync here), straight under the headline so a 360 px tall landscape screen shows it. The footer waits for it, at most ODDS_WAIT ms, so its buttons never move under the player's finger.
      const odds = typeof bossOddsOn === 'function' && bossOddsOn() && L.zone === S.maxZone && S.bossTry.hold === S.maxZone;
      const chance = odds ? el('p', 'bt-line bt-odds', 'Working out your chance') : null;
      if (chance) api.body.append(chance);
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
      lb.append(cb, ' Try again on my own when I have a fair chance');
      api.body.append(lb);
      const go = el('button', 'big forge bt-go', 'Try again'); go.type = 'button';
      go.addEventListener('click', () => { api.close(); if (S.activity !== 'fight') setActivity('fight'); if (challenge()) ui(true); });
      const stay = el('button', 'big bt-stay', 'Keep fighting here'); stay.type = 'button';
      stay.addEventListener('click', () => api.close());
      // weak (under BOSS_ODDS.close): Keep fighting here leads; close, ready or no chance in time: Try again leads, as before
      const pct = w => { const p = Math.round(w * 20) * 5; return p > 0 ? p + '%' : 'under 5%'; };
      const said = o => {
        const c = Math.round(BOSS_ODDS.close * 100) + '%';
        chance.textContent = `Your chance to win now: ${pct(o.win)}.` + (o.win < BOSS_ODDS.close ? ` Fight here to get stronger. Aim for ${c} before you try again.` : o.win < BOSS_ODDS.ready ? ' A close fight.' : '');
      };
      // the second button takes .bt-stay's clear look (60-bosstry.css), so only the first one is loud
      const place = o => {
        if (o && o.win < BOSS_ODDS.close) { go.className = 'big bt-go'; go.style.background = 'transparent'; stay.className = 'big forge bt-stay'; api.foot.append(stay, go); stay.focus({ preventScroll: true }); }
        else { api.foot.append(go, stay); go.focus({ preventScroll: true }); }
      };
      if (!chance) { place(null); return; }
      const t0 = Date.now();
      let placed = false;
      const poll = () => {
        if (!open || open !== api || api.closed) return;
        let o = null; try { o = bossOdds(); } catch (e) { o = null; }
        // fresh only (59m's BO.res): while it works it hands back the last estimate, made before this fight's defence record
        if (o && o.zone === L.zone && (typeof BO !== 'object' || BO.res === o)) said(o); else o = null;
        if (!placed && (o || Date.now() - t0 >= ODDS_WAIT)) { placed = true; place(o); }
        if (!o) setTimeout(poll, 100);
      };
      poll();
    }, { label: 'The boss beat you', onClose: () => { open = null; ui(true); } });
  }
  on('wipe', e => { if (e && e.boss && !e.arena) setTimeout(show, 0); });
}
