// 57t-blackjack: Tavern Blackjack, Hesketh's card table (docs/design/tavern-blackjack.md, card tavern-blackjack-build).
// CORE FILE: no DOM or storage access. UI: 75-blackjack-ui.js. The online Tavern is separate and untouched.
//
// Rules (spec 3): four 52-card decks shuffled fresh before every hand; Hesketh gets one face-up card and draws his second
// only after you stand (no hole card sits in the save); blackjack pays 3 to 2 rounded down; his two-card 21 takes your
// first bet only; he stands on every 17; Double on the first two cards takes one card. No split, insurance or surrender.
// Limits (spec 4) are in price-hours at S.maxZone: highest bet 0.2 H, lowest 1/20 of it (at least 10), and the day's win
// and loss limits are 5 highest bets each. The day is deviceDay(). A payout is bet x odds, never x goldMult().
// Table gold moves S.gold only: never the econ ledger, never S.totalGold (spec 8). S.blackjack.net and .n are its books.
// save() runs after the deal, every card and the result, so a reload shows the same hand.
//
// API: bjOpen() -> the FEATURES gate; bjLimits() -> { lo, hi, win, loss }; bjView() -> what the table shows;
//      bjSetBet(n), bjDeal(), bjHit(), bjStand(), bjDouble(), bjNext() -> bool (true: something changed);
//      bjImport(data, today?) -> the save-code import's copy of `data` (spec 8); bjCheckSave(b, fail) (55-savecode).
// Save: S.blackjack = { v, day, net, top, bet, w, hand, n: { hands, won, lost, tied, bj } }. w: seconds of play with the Tavern built (the
//   gate's wait; it stops counting at BJ_TUNE.wait). top: today's highest net (the win limit reads it, so a save-code import of an
//   earlier code can't reopen a table a win closed).
//   hand: { p: [card ids], d: [card ids], bet, dbl: 0|1, done: 0|1, res: { k, p, d, x } | null }. A card id is 0-51:
//   suit Math.floor(id / 13) (Lanterns, Keys, Cups, Thorns), rank id % 13 + 1 (1 Ace ... 11 Knave, 12 Queen, 13 King).
// Events: blackjack { k } after a result.
const BJ_TUNE = {
  on: typeof __BJ === 'number' ? __BJ : 1,   // 1: the table exists. 0: no row, section or notice; a hand in play refunds its bet at load (spec 9). Checks set __BJ in a prelude
  decks: 4,
  hiH: 0.2,           // highest bet, in price-hours (econH at S.maxZone)
  loDiv: 20, loMin: 10,
  dayBets: 5,         // the day's win limit and loss limit, each in highest bets
  stand: 17,
  zone: 14,           // the gate: the zone 13 Captain beaten
  wait: 600,          // seconds of play after the Tavern (and Hands) rows opened (spec 7)
  coins: [1, 2, 5, 10]   // the four coins add this many lowest bets
};
const BJ_SUITS = ['Lanterns', 'Keys', 'Cups', 'Thorns'];
// Table amounts in whole gold with commas ("2,550", as the spec reads), and the game's short form from a million up.
const bjGold = n => n < 1e6 ? Math.round(n).toLocaleString('en-US') : fmt(n);
const BJ_RANKS = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Knave', 'Queen', 'King'];
let bjOpen, bjLimits, bjView, bjSetBet, bjDeal, bjHit, bjStand, bjDouble, bjNext, bjImport;
// hoisted for 55-savecode's validateSave (loaded earlier): a saved table is checked against what the table can make
function bjCheckSave(b, fail) {
  const isInt = (v, lo = 0, hi = 1e15) => typeof v === 'number' && Number.isInteger(v) && v >= lo && v <= hi;
  const card = c => isInt(c, 0, 51);
  if (b === null || typeof b !== 'object' || Array.isArray(b)) fail('blackjack', 'must be a record');
  if (b.v !== undefined && !isInt(b.v, 1, 1000)) fail('blackjack.v');
  if (b.day !== undefined && !isInt(b.day, -1e7, 1e7)) fail('blackjack.day');   // a clock before 2026 gives a negative deviceDay
  if (b.net !== undefined && !isInt(b.net, -1e15, 1e15)) fail('blackjack.net');
  if (b.top !== undefined && !isInt(b.top, -1e15, 1e15)) fail('blackjack.top');
  if (b.bet !== undefined && !isInt(b.bet)) fail('blackjack.bet');
  if (b.w !== undefined && (typeof b.w !== 'number' || !Number.isFinite(b.w) || b.w < 0 || b.w > BJ_TUNE.wait)) fail('blackjack.w');
  if (b.n !== undefined) {
    if (b.n === null || typeof b.n !== 'object' || Array.isArray(b.n)) fail('blackjack.n', 'must be a record');
    for (const [k, v] of Object.entries(b.n)) if (!['hands', 'won', 'lost', 'tied', 'bj'].includes(k) || !isInt(v)) fail('blackjack.n.' + k);
  }
  const h = b.hand;
  if (h === undefined || h === null) return;
  if (typeof h !== 'object' || Array.isArray(h)) fail('blackjack.hand', 'must be a record');
  if (!Array.isArray(h.p) || h.p.length < 2 || h.p.length > 21 || !h.p.every(card)) fail('blackjack.hand.p');
  if (!Array.isArray(h.d) || h.d.length < 1 || h.d.length > 12 || !h.d.every(card)) fail('blackjack.hand.d');
  const all = h.p.concat(h.d), copies = {};
  for (const c of all) if ((copies[c] = (copies[c] || 0) + 1) > BJ_TUNE.decks) fail('blackjack.hand', 'holds a card more often than the decks do');
  if (!isInt(h.bet, 1)) fail('blackjack.hand.bet');
  if (!isInt(h.dbl, 0, 1) || !isInt(h.done, 0, 1)) fail('blackjack.hand');
  if (h.dbl && h.p.length !== 3) fail('blackjack.hand.dbl');
  if (!h.done && h.d.length !== 1) fail('blackjack.hand.d', 'is drawn before you stood');
  if (h.res !== undefined && h.res !== null && (typeof h.res !== 'object' || Array.isArray(h.res))) fail('blackjack.hand.res');
}
{
  registerState('blackjack', { v: 1, day: 0, net: 0, top: 0, bet: 0, w: 0, hand: null, n: { hands: 0, won: 0, lost: 0, tied: 0, bj: 0 } });
  const B = () => S.blackjack;
  const today = () => deviceDay(Date.now());
  const rank = c => c % 13 + 1;
  const worth = c => Math.min(10, rank(c));
  const total = cards => {
    let t = 0, aces = 0;
    for (const c of cards) { const v = worth(c); t += v === 1 ? 11 : v; if (v === 1) aces++; }
    while (t > 21 && aces) { t -= 10; aces--; }
    return { t, soft: aces > 0 };
  };
  const natural = cards => cards.length === 2 && total(cards).t === 21;
  // A fresh shuffle of four decks for every hand: the next card is any card not already on the table, all equally likely.
  const draw = h => {
    const used = {}; for (const c of h.p.concat(h.d)) used[c] = (used[c] || 0) + 1;
    let r = Math.floor(Math.random() * (52 * BJ_TUNE.decks - h.p.length - h.d.length));
    for (let c = 0; c < 52; c++) { const left = BJ_TUNE.decks - (used[c] || 0); if (r < left) return c; r -= left; }
    return 51;
  };
  const stake = h => h.bet * (h.dbl ? 2 : 1);
  const live = () => !!(B().hand && !B().hand.done);
  // The device day turns over: the day's books start again. A hand in play finishes on the day it was dealt.
  const roll = () => { const d = today(); if (B().day !== d && !live()) { B().day = d; B().net = 0; B().top = 0; } };

  // The wait (spec 7): 600 s of play with the Tavern built, on the table's own clock (S.blackjack.w), which keeps running after
  // every tab is open; the guide's clock (S.onboard.t) stops then, so a cold player who builds the Tavern late would otherwise get
  // the build, the Tavern, Hands and the table at once. While the guide's clock still runs, the Tavern and Hands rows also wait 600 s.
  onTick(dt => { const b = B(); if (b.w < BJ_TUNE.wait && dt > 0 && campLevel('tavern') >= 1) b.w = Math.min(BJ_TUNE.wait, (b.w || 0) + dt); });
  const waitOk = () => {
    if (!(B().w >= BJ_TUNE.wait)) return false;
    const o = S.onboard; if (!o || o.all) return true;
    const at = ['tavern', 'hands'].map(id => o.got[id]).filter(v => typeof v === 'number' && Number.isFinite(v));
    return o.got.tavern != null && at.length > 0 && o.t - Math.max(...at) >= BJ_TUNE.wait;
  };
  bjOpen = () => !!BJ_TUNE.on && S.maxZone >= BJ_TUNE.zone && campLevel('tavern') >= 1 && waitOk();
  bjLimits = () => {
    const hi = econSig(BJ_TUNE.hiH * econH(Math.max(1, S.maxZone)));
    const lo = Math.max(BJ_TUNE.loMin, econSig(hi / BJ_TUNE.loDiv));
    return { lo, hi, win: BJ_TUNE.dayBets * hi, loss: BJ_TUNE.dayBets * hi };
  };
  const room = L => L.loss + B().net;   // gold the table may still take today
  const closed = L => B().net >= L.win || (B().top || 0) >= L.win || room(L) < L.lo;
  const cap = L => Math.min(L.hi, Math.floor(S.gold), room(L));
  const betNow = L => Math.max(L.lo, Math.min(cap(L), B().bet > 0 ? B().bet : L.lo));
  const can = () => !!BJ_TUNE.on && bjOpen();

  bjSetBet = n => {
    if (!can() || live()) return false;
    roll(); const L = bjLimits(), v = Math.max(L.lo, Math.min(L.hi, Math.floor(+n) || 0));
    if (v === B().bet) return false;
    B().bet = v; return true;
  };

  // The hand ends: pay out, count it, save before anything renders.
  const settle = (k, x, back) => {
    const h = B().hand, b = B();
    if (back > 0) { S.gold += back; b.net += back; }
    if (b.net > (b.top || 0)) b.top = b.net;
    h.done = 1; h.res = { k, p: total(h.p).t, d: total(h.d).t, x };
    b.n.hands++;
    if (k === 'win' || k === 'dbust' || k === 'bj') b.n.won++;
    else if (k === 'tie') b.n.tied++;
    else b.n.lost++;
    if (k === 'bj') b.n.bj++;
    save();
    emit('blackjack', { k });
    return true;
  };
  // Hesketh draws his second card, then to 17. His two-card 21 takes the first bet only (a Double's extra comes back).
  const finish = () => {
    const h = B().hand, s = stake(h), p = total(h.p).t;
    h.d.push(draw(h)); save();
    if (natural(h.d)) return settle('dbj', h.bet, s - h.bet);
    while (total(h.d).t < BJ_TUNE.stand) { h.d.push(draw(h)); save(); }
    const d = total(h.d).t;
    if (d > 21) return settle('dbust', s, 2 * s);
    if (p > d) return settle('win', s, 2 * s);
    if (p === d) return settle('tie', 0, s);
    return settle('lose', s, 0);
  };

  bjDeal = () => {
    if (!can() || live()) return false;
    roll(); const L = bjLimits();
    if (closed(L) || cap(L) < L.lo) return false;
    const bet = betNow(L);
    S.gold -= bet; B().net -= bet;
    B().bet = bet;
    const h = B().hand = { p: [], d: [], bet, dbl: 0, done: 0, res: null };
    h.p.push(draw(h)); h.p.push(draw(h)); h.d.push(draw(h));
    save();
    if (natural(h.p)) {   // blackjack: Hesketh's second card decides a tie
      h.d.push(draw(h)); save();
      return natural(h.d) ? settle('tie', 0, bet) : settle('bj', Math.floor(1.5 * bet), bet + Math.floor(1.5 * bet));
    }
    return true;
  };
  bjHit = () => {
    if (!can() || !live() || B().hand.dbl) return false;
    const h = B().hand; h.p.push(draw(h)); save();
    const t = total(h.p).t;
    if (t > 21) return settle('bust', stake(h), 0);
    if (t === 21) return finish();   // 21 stands by itself
    return true;
  };
  bjStand = () => { if (!can() || !live()) return false; return finish(); };
  const doubleOk = L => { const h = B().hand; return !!h && !h.done && !h.dbl && h.p.length === 2 && S.gold >= h.bet && room(L) >= h.bet; };
  bjDouble = () => {
    if (!can() || !live() || !doubleOk(bjLimits())) return false;
    const h = B().hand;
    S.gold -= h.bet; B().net -= h.bet; h.dbl = 1;
    h.p.push(draw(h)); save();
    if (total(h.p).t > 21) {
      // his blackjack takes the first bet only (spec 3), so a busted Double against an Ace or a ten-card shows his second card first
      if (worth(h.d[0]) === 1 || worth(h.d[0]) === 10) { h.d.push(draw(h)); save(); if (natural(h.d)) return settle('dbj', h.bet, h.bet); }
      return settle('bust', stake(h), 0);
    }
    return finish();
  };
  bjNext = () => { if (!B().hand || !B().hand.done) return false; B().hand = null; roll(); save(); return true; };

  const cardName = c => { const r = BJ_RANKS[rank(c) - 1]; return (/^(Ace|8)$/.test(r) ? 'an ' : 'a ') + r; };
  const resText = r => {
    if (!r) return '';
    if (r.k === 'win') return `${r.p} beats ${r.d}. You win ${bjGold(r.x)} gold.`;
    if (r.k === 'lose') return `${r.d} beats ${r.p}. You lose ${bjGold(r.x)} gold.`;
    if (r.k === 'tie') return `Both on ${r.p}. Your bet comes back.`;
    if (r.k === 'bj') return `Blackjack! You win ${bjGold(r.x)} gold.`;
    if (r.k === 'bust') return `Bust at ${r.p}. You lose ${bjGold(r.x)} gold.`;
    if (r.k === 'dbust') return `Hesketh busts at ${r.d}. You win ${bjGold(r.x)} gold.`;
    if (r.k === 'dbj') return `Hesketh makes blackjack. You lose ${bjGold(r.x)} gold.`;
    return '';
  };
  // What the table shows. phase: 'bet' (pick a bet and Deal), 'play' (Hit, Stand, Double), 'done' (the result, Next hand).
  bjView = () => {
    roll();
    const L = bjLimits(), h = B().hand, card = c => ({ id: c, rank: BJ_RANKS[rank(c) - 1], suit: BJ_SUITS[Math.floor(c / 13) % 4] });
    const phase = !h ? 'bet' : h.done ? 'done' : 'play', shut = closed(L), short = !shut && Math.floor(S.gold) < L.lo;
    const v = { phase, lo: L.lo, hi: L.hi, bet: betNow(L), max: Math.max(L.lo, cap(L)), closed: shut, short,
      canDeal: phase === 'bet' && !shut && cap(L) >= L.lo, canDouble: phase === 'play' && doubleOk(L),
      p: h ? h.p.map(card) : [], d: h ? h.d.map(card) : [], pt: h ? total(h.p) : null, dt: h ? total(h.d) : null,
      stake: h ? stake(h) : 0, line: '' };
    if (phase === 'play') v.line = `You have ${v.pt.t}. Hesketh shows ${cardName(h.d[0])}.`;
    else if (phase === 'done') v.line = resText(h.res);
    if (phase !== 'play' && shut) v.note = "The table's closed for today.";
    else if (phase !== 'play' && short) v.note = `You need ${bjGold(L.lo)} gold to sit down.`;
    return v;
  };

  // spec 8: a save-code import clears the hand in play (its bet stays paid) and keeps the lower of today's stored and
  // imported net, so an old code can't reopen a table a loss closed, and the higher of today's tops, so one can't reopen a table a
  // win closed. A net or top from another day counts as 0.
  bjImport = (data, day = today()) => {
    if (!data || typeof data !== 'object') return data;
    const now = S.blackjack && S.blackjack.day === day ? S.blackjack.net : 0;
    const imp = data.blackjack && typeof data.blackjack === 'object' ? data.blackjack : null;
    const was = imp && imp.day === day && Number.isFinite(imp.net) ? imp.net : 0;
    const top = Math.max(S.blackjack && S.blackjack.day === day ? S.blackjack.top || 0 : 0, imp && imp.day === day && Number.isFinite(imp.top) ? imp.top : 0);
    const out = Object.assign({}, data);
    out.blackjack = Object.assign({}, imp || {}, { day, net: Math.min(now, was), top, hand: null });
    return out;
  };

  // spec 9: with the switch off, a hand in play gives its bet back the next time the game loads.
  // No save() here: a save stamps S.last, and the boot's away gains (90-boot) read it later. The next normal save writes the refund.
  if (!BJ_TUNE.on && live()) { const s = stake(B().hand); S.gold += s; B().net += s; B().hand = null; }
}
