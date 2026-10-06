// 75-attributes-ui: Hero tab > Attributes (card hero-progression-rework; docs/design/hero-progression-build.md section 2). Browser file.
// Core: 55-attributes.js (attrOn, ATTRS, attrOf, attrPoints, attrAdd, attrReset, attrParryMs), 55-training.js (trainMoves,
// trainName, trainInfo: what the hero's level gives each move). Shown only with the flag off (HERO_TUNE.training = 0).
//   - the head line: who, the level, and how many points are free (a dot on the Hero tab while some are)
//   - #attrRows: one .at-row[data-at] a attribute: the points in it, its line, what a point and the points give, +1 / +5
//   - Reset points (.at-reset): free, with a two-tap confirm in the page (alert and confirm do nothing in the viewer)
//   - .at-moves: "From your level", the numbers each move has from the hero's level alone
// Points are free to move; a fight takes them as it starts. Reduced motion: no flash (60-attributes.css).
{
  const heroName = () => { const k = typeof soloHero === 'function' ? soloHero() : null; return k && typeof ROSTER === 'object' && ROSTER[k] ? ROSTER[k].name.split(' ')[0] : 'Your hero'; };
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const pct = x => `+${Math.round(x * 100)}%`;
  const msTxt = s => `+${Math.round(s * 1000)} ms`;
  const CONFIRM_MS = 3000;

  let rows = [], head = null, resetBtn = null, movesBox = null, movesFor = '', armed = false, armTimer = 0;

  // what one point gives, and what the points in it give now (Guard also widens the parry window)
  function fxTxt(a, n) {
    const per = a.parryMs ? `${pct(a.per)}, +${a.parryMs} ms` : pct(a.per);
    const now = a.parryMs ? `${pct(a.per * n)}, ${msTxt(a.parryMs * n / 1000)}` : pct(a.per * n);
    return n ? `${per} a point. Now ${now}.` : `${per} a point.`;
  }
  function disarm() { armed = false; if (armTimer) { clearTimeout(armTimer); armTimer = 0; } }

  function flash(node) {
    node.classList.remove('at-ok'); void node.offsetWidth; node.classList.add('at-ok');
  }
  function done() { try { save(); } catch (e) {} ui(true); }

  function add(a, n, row) {
    const k = soloHero(); if (!k) return;
    if (attrAdd(a.id, n, k) > 0) { disarm(); flash(row.pts); done(); }
  }
  function reset() {
    const k = soloHero(); if (!k || !attrPoints(k).spent) return;
    if (!armed) {
      armed = true; armTimer = setTimeout(() => { armed = false; armTimer = 0; try { refresh(); } catch (e) {} }, CONFIRM_MS);
      refresh(); return;
    }
    disarm();
    if (attrReset(k)) done(); else refresh();
  }

  function build(sec) {
    sec.classList.add('at-sec');
    head = el('p', 'at-head');
    const list = el('div', 'sec dz-list at-list'); list.id = 'attrRows';
    rows = ATTRS.map(a => {
      const row = el('div', 'row has-ic at-row'); row.dataset.at = a.id;
      const pts = el('div', 'at-pts'), num = el('b', null, '0');
      pts.append(num, el('small', null, 'points'));
      const body = el('div', 'at-body');
      const nm = el('div', 'row-name'); nm.append(el('span', 'nm', a.name));
      const desc = el('div', 'row-desc', a.line), fx = el('div', 'at-fx');
      body.append(nm, desc, fx);
      const btns = el('div', 'at-btns'), r = { a, row, pts, num, fx, adds: [] };
      for (const n of [1, 5]) {
        const b = el('button', 'at-add', `+${n}`); b.type = 'button'; b.dataset.n = String(n);
        b.addEventListener('click', () => add(a, n, r));
        btns.append(b); r.adds.push(b);
      }
      row.append(pts, body, btns);
      list.append(row);
      return r;
    });
    resetBtn = el('button', 'at-reset', 'Reset points'); resetBtn.type = 'button';
    resetBtn.addEventListener('click', reset);
    const note = el('p', 'note at-note', 'Points are free to move. A fight takes them as it starts. Each hero has their own.');
    movesBox = el('div', 'at-moves');
    sec.append(head, list, resetBtn, note, movesBox);
  }

  // "From your level": each move's number, once. The abilities share one line when they share one name.
  function buildMoves(k) {
    movesBox.textContent = '';
    movesBox.append(el('h3', 'at-mh', 'From your level'));
    const seen = {};
    for (const mv of trainMoves(k)) {
      const nm = trainName(mv); if (seen[nm]) continue; seen[nm] = 1;
      const r = el('div', 'at-mv'); r.dataset.mv = mv;
      r.append(el('b', null, nm), el('span', 'at-mn'));
      movesBox.append(r);
    }
  }
  function refresh() {
    if (!head || typeof soloHero !== 'function') return;
    const k = soloHero();
    if (!k) { putText(head, 'Pick a hero to spend points.'); return; }
    const P = attrPoints(k), name = heroName(), L = heroLvOf(k);
    putText(head, !P.total ? `${name}, Lv ${L}. You earn ${plural(HERO_TUNE.perLevel, 'point')} a level.`
      : P.free ? `${name}, Lv ${L}. ${plural(P.free, 'point')} to spend.` : `${name}, Lv ${L}. All points spent.`);
    for (const r of rows) {
      const n = attrOf(k, r.a.id);
      putText(r.num, n);
      putText(r.fx, fxTxt(r.a, n));
      for (const b of r.adds) {
        putDisabled(b, !P.free);
        putAttr(b, 'aria-label', `Add ${b.dataset.n === '1' ? '1 point' : Math.min(+b.dataset.n, P.free) + ' points'} to ${r.a.name}`);
      }
    }
    putDisabled(resetBtn, !P.spent);
    if (!P.spent && armed) disarm();
    putText(resetBtn, armed ? 'Tap again to reset all points.' : 'Reset points');
    putToggle(resetBtn, 'armed', armed);
    putAttr(resetBtn, 'aria-label', armed ? 'Tap again to reset all points' : 'Reset points');
    // what the level gives each move (rows rebuilt when the hero changes)
    const key = k + '|' + trainMoves(k).join(',');
    if (key !== movesFor) { movesFor = key; buildMoves(k); }
    for (const r of movesBox.querySelectorAll('.at-mv')) {
      const mv = r.dataset.mv; let t = '';
      try { const i = trainInfo(mv, k); t = i.now || ''; } catch (e) {}
      putText(r.querySelector('.at-mn'), t);
    }
  }
  {
    registerView('party', { id: 'attributes', label: 'Attributes', order: 20, feature: 'party',
      dot: () => attrOn() && !!soloHero() && attrPoints(soloHero()).free > 0,
      show: () => attrOn() });
    registerSection('party', { id: 'attributes', title: 'Attributes', view: 'attributes', feature: 'party', mount: build,
      update: () => { try { refresh(); } catch (e) { console.error('[lanternfall] attributes', e); } } });
  }
}
