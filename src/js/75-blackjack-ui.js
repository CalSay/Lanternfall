// 75-blackjack-ui: Tavern Blackjack's box on Camp > Tavern (docs/design/tavern-blackjack.md). Rules, limits and save: 57t-blackjack.js.
// Plain UI cards until the Codex pack is vetted (spec 10): a flat panel, the rank as text, the suit's name in small capitals in
// its colour, and a flat face-down card. No suit glyphs, emoji or drawn pictures here (the art freeze). The coins are ICON.coin.
// The action row keeps three fixed places: Deal and Next hand sit in the middle (Stand's place), so Hit is never where Deal
// sat, and every press is ignored for 300 ms after Deal, Next hand and a result (a double tap can't play the next step).
{
  const GUARD_MS = 300;
  const RANK_TXT = { Ace: 'A', Knave: 'Kn', Queen: 'Q', King: 'K' };
  const btn = (cls, txt) => { const b = el('button', cls, txt); b.type = 'button'; return b; };
  const setTxt = (e, t) => { if (e.textContent !== t) e.textContent = t; };
  let R = null, sig = '', guardUntil = 0, lastPhase = '';
  const now = () => (typeof performance === 'object' ? performance.now() : Date.now());
  const guard = () => { guardUntil = now() + GUARD_MS; };
  const press = (fn, after) => () => {
    if (now() < guardUntil) return;
    if (fn()) { if (after) guard(); draw(true); }
  };

  const cardEl = c => {
    const k = el('div', 'bj-card'); k.dataset.suit = c.suit.toLowerCase();
    k.setAttribute('role', 'img'); k.setAttribute('aria-label', `${c.rank} of ${c.suit}`);
    const r = RANK_TXT[c.rank] || c.rank;
    k.append(el('span', 'bj-rk', r), el('span', 'bj-big', r), el('span', 'bj-suit', c.suit));
    return k;
  };
  // only the new cards slide in: a hand that grows keeps the cards already on the table
  const fill = (box, cards, back) => {
    if (!box._ids) box._ids = [];
    const ids = cards.map(c => c.id), had = box._ids;
    if (had.length > ids.length || had.some((id, i) => id !== ids[i])) { box.textContent = ''; box._ids = []; }
    const old = box.querySelector('.bj-back'); if (old) old.remove();
    for (const c of cards.slice(box._ids.length)) box.append(cardEl(c));
    box._ids = ids;
    if (back) box.append(backEl());
  };
  const backEl = () => { const k = el('div', 'bj-card bj-back'); k.setAttribute('aria-label', 'Face-down card'); return k; };

  function mount(sec) {
    R = { sec };
    R.sub = el('p', 'note bj-sub', 'Hesketh deals. He stands on 17. Blackjack pays 3 to 2.');
    R.table = el('div', 'bj-table');
    R.dHead = el('div', 'bj-who'); R.dHand = el('div', 'bj-hand');
    R.pHead = el('div', 'bj-who'); R.pHand = el('div', 'bj-hand');
    R.line = el('p', 'bj-line'); R.line.setAttribute('role', 'status');
    R.table.append(R.dHead, R.dHand, R.pHead, R.pHand, R.line);
    R.betRow = el('div', 'bj-bet');
    R.amt = el('div', 'bj-amt');
    R.minus = btn('mini bj-step', '−'); R.minus.setAttribute('aria-label', 'Lower the bet');
    R.plus = btn('mini bj-step', '+'); R.plus.setAttribute('aria-label', 'Raise the bet');
    R.coins = BJ_TUNE.coins.map(k => { const b = btn('mini bj-coin'); b.dataset.k = k; b.append(img(iconURL('coin', '#F2C14E')), el('span')); return b; });
    R.clear = btn('mini bj-clear', 'Clear');
    const coins = el('div', 'bj-coins'); coins.append(R.minus, ...R.coins, R.plus, R.clear);
    R.betRow.append(R.amt, coins);
    R.acts = el('div', 'bj-acts');
    R.hit = btn('mini bj-act', 'Hit'); R.mid = btn('mini go bj-act bj-mid'); R.dbl = btn('mini bj-act', 'Double');
    R.acts.append(R.hit, R.mid, R.dbl);
    R.note = el('p', 'note bj-note');
    R.lim = el('p', 'note bj-lim');
    R.tip = el('p', 'note bj-tip', "Hesketh's rule of thumb: stand on 12 to 16 when I show a 2 to 6. Always hit 11 or less.");
    sec.append(R.sub, R.table, R.betRow, R.acts, R.note, R.lim, R.tip);

    const step = d => () => { const v = bjView(); return bjSetBet(v.bet + d * v.lo); };
    R.minus.addEventListener('click', press(step(-1)));
    R.plus.addEventListener('click', press(step(1)));
    R.coins.forEach(b => b.addEventListener('click', press(step(+b.dataset.k))));
    R.clear.addEventListener('click', press(() => bjSetBet(bjView().lo)));
    R.hit.addEventListener('click', press(() => bjHit()));
    R.dbl.addEventListener('click', press(() => bjDouble()));
    R.mid.addEventListener('click', press(() => { const v = bjView(); return v.phase === 'bet' ? bjDeal() : v.phase === 'play' ? bjStand() : bjNext(); }, true));
  }

  function draw(force) {
    if (!R) return;
    putHidden(R.sec, !BJ_TUNE.on);
    if (!BJ_TUNE.on) return;
    const v = bjView();
    // a result is on the table: hold presses a beat, so the tap that ended the hand can't press Next hand
    if (v.phase !== lastPhase) { if (v.phase === 'done' && lastPhase) guard(); lastPhase = v.phase; }
    const s = JSON.stringify([v.phase, v.p.map(c => c.id), v.d.map(c => c.id), v.bet, v.max, v.lo, v.hi, v.closed, v.short, v.canDeal, v.canDouble, v.line, v.note]);
    if (!force && s === sig) return;
    sig = s;
    const play = v.phase === 'play', dealt = v.phase !== 'bet';
    putHidden(R.table, !dealt);
    if (dealt) {
      setTxt(R.dHead, `Hesketh: ${v.dt.t}`); setTxt(R.pHead, `You: ${v.pt.t}`);
      fill(R.dHand, v.d, play); fill(R.pHand, v.p, false);
      setTxt(R.line, v.line);
    }
    const bet = play ? v.stake : v.bet;
    setTxt(R.amt, `${play ? 'In play' : 'Bet'}: ${bjGold(bet)} gold`);
    putHidden(R.betRow, play);
    const fixed = play || v.closed || v.short;
    R.minus.disabled = fixed || v.bet <= v.lo; R.plus.disabled = fixed || v.bet >= v.max; R.clear.disabled = fixed || v.bet <= v.lo;
    R.coins.forEach(b => { setTxt(b.lastChild, '+' + bjGold(+b.dataset.k * v.lo)); b.disabled = fixed || v.bet >= v.max; });
    // three fixed places: Hit | Deal, Stand or Next hand | Double
    R.hit.style.visibility = play ? '' : 'hidden'; R.hit.disabled = !play;
    R.dbl.style.visibility = play ? '' : 'hidden'; R.dbl.disabled = !v.canDouble;
    setTxt(R.mid, v.phase === 'bet' ? `Deal ${bjGold(v.bet)}` : play ? 'Stand' : 'Next hand');
    R.mid.disabled = v.phase === 'bet' && !v.canDeal;
    putToggle(R.mid, 'go', !play);
    setTxt(R.note, v.note || ''); putHidden(R.note, !v.note);
    setTxt(R.lim, `Table: ${bjGold(v.lo)} to ${bjGold(v.hi)} gold`);
  }

  registerSection('tav', { id: 'blackjack', title: 'Blackjack', feature: 'blackjack', mount, update: draw });
}
