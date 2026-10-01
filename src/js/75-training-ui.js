// 75-training-ui: Training on screen (task W2-A, docs/design/solo-hero.md "Training"). Browser file.
//   - Hero tab > Training: one row per move of the hero you play (Attack, each ability, Parry, Dodge): the icon from the
//     action bar, the name, Lv n / cap, what the next level gives, and Train with its price. x1 / x10 / Max (S.amt, the
//     same choice the old upgrades used). A note says what caps the moves (the hero's level, or the class stage).
//   - trainCard(move) -> el: the Training block the action bar's long press shows (75-solo-ui), with its own Train button.
// Core: 55-training.js (train, trainInfo, trainPlan, trainMoves). Icons: soloIconURL (75-solo-ui).
var trainCard = null;
{
  const icon = mv => (typeof soloIconURL === 'function' ? soloIconURL(mv) : iconURL('sword', '#A9B1BD'));
  const heroName = () => { const k = soloHero(); return k && typeof ROSTER === 'object' && ROSTER[k] ? ROSTER[k].name.split(' ')[0] : 'Your hero'; };
  const capWhy = i => i.by === 'stage'
    ? (i.stage ? `Lv ${i.stageCap} is the most a move can train.` : `Lv ${i.stageCap} is the most a base class can train. Pass the Proving to train on.`)
    : `Your hero is Lv ${i.heroLv}. Level up to train more.`;
  const qtyTxt = (i, amt) => i.max ? 'Maxed' : amt === '1' || i.plan.n === 1 ? 'Train' : `Train ${i.plan.n}`;
  // what the next level gives, in one line
  const nextTxt = i => i.max ? `${i.now}.` : i.next ? `${i.now}. Next level: ${i.next}.` : `${i.now}.`;
  function doTrain(mv, btn, amt) {
    const n = train(mv, amt);
    if (n > 0) {
      btn.classList.remove('tr-ok'); void btn.offsetWidth; btn.classList.add('tr-ok');
      try { save(); } catch (e) {}
      ui(true);
    }
    return n;
  }

  // ---- the Training view ----
  let rows = [], rowsFor = '', head = null, amtBtns = [];
  function build(sec) {
    sec.classList.add('tr-sec');
    head = el('p', 'note tr-note');
    const bar = el('div', 'sec-head tr-head');
    const seg = el('div', 'seg tr-amt'); seg.setAttribute('role', 'group'); seg.setAttribute('aria-label', 'How many levels a press trains');
    amtBtns = [['1', 'x1'], ['10', 'x10'], ['max', 'Max']].map(([a, t]) => {
      const b = el('button', null, t); b.type = 'button'; b.dataset.amt = a; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => { S.amt = a; ui(true); });
      seg.append(b); return b;
    });
    bar.append(head, seg);
    const list = el('div', 'sec dz-list tr-list'); list.id = 'trainRows';
    sec.append(bar, list);
  }
  function makeRows(list) {
    list.textContent = ''; rows = [];
    for (const mv of trainMoves()) {
      const r = makeRow(list, trainName(mv), false, icon(mv), 'tr-ic');
      r.row.classList.add('tr-row'); r.row.dataset.mv = mv;
      r.ms = el('div', 'tr-ms'); r.desc.after(r.ms);
      r.btn.classList.add('tr-go');
      r.btn.addEventListener('click', () => doTrain(mv, r.btn));
      r.mv = mv; rows.push(r);
    }
  }
  function refresh() {
    const list = document.getElementById('trainRows'); if (!list || !soloHero()) return;
    const key = soloHero() + '|' + trainMoves().join(',');
    if (key !== rowsFor) { rowsFor = key; makeRows(list); }
    for (const b of amtBtns) putAttr(b, 'aria-pressed', String(b.dataset.amt === S.amt));
    const c = trainCap();
    putText(head, c.by === 'stage'
      ? (c.stage ? `${heroName()}'s moves train to Lv ${c.stageCap}, the most they can.` : `${heroName()}'s moves train to Lv ${c.stageCap} on a base class. The Proving lifts it to ${SOLO_TUNE.train.cap[1]}.`)
      : `Gold trains ${heroName()}'s moves. A move can't pass your hero's level (Lv ${c.lv}).`);
    for (const r of rows) {
      const i = trainInfo(r.mv);
      putText(r.own, `Lv ${i.lv}/${i.cap}`);
      putText(r.desc, nextTxt(i));
      // every move shares one cap, said once in the head line (menu audit #17: it repeated on each maxed row)
      putText(r.ms, i.max ? '' : i.ms || '');
      putHidden(r.ms, i.max || !i.ms);
      putText(r.qty, qtyTxt(i, S.amt));
      setPrice(r.btn, i.max ? Infinity : i.plan.cost);
      putDisabled(r.btn, i.max || S.gold < i.plan.cost);
      putToggle(r.row, 'tr-max', i.max);
      putAttr(r.btn, 'aria-label', i.max ? `${i.name}: at Lv ${i.lv}, the most for now` : `Train ${i.name} ${i.plan.n > 1 ? i.plan.n + ' levels' : ''} for ${fmt(i.plan.cost)} gold`);
    }
  }
  {
    registerView('party', { id: 'training', label: 'Training', order: 20, feature: 'party' });
    registerSection('party', { id: 'training', title: 'Training', view: 'training', feature: 'party', mount: build, update: () => { try { refresh(); } catch (e) { console.error('[lanternfall] training', e); } } });
  }

  // ---- the block the action bar's long press shows (75-solo-ui) ----
  // x1 always (a quick press); the Training view has x10 and Max.
  trainCard = mv => {
    const box = el('div', 'tr-card'); box.dataset.mv = mv;
    const top = el('div', 'tr-c-top'), lv = el('b', 'tr-c-lv'), cap = el('small', 'tr-c-cap');
    top.append(lv, cap);
    const now = el('div', 'tr-c-now'), ms = el('div', 'tr-ms');
    const btn = el('button', 'buy tr-go'); btn.type = 'button'; btn.innerHTML = '<span class="qty"></span><span class="price"></span>';
    const more = el('button', 'tr-c-more', 'All training'); more.type = 'button';
    const row = el('div', 'tr-c-row'); row.append(btn, more);
    box.append(top, now, ms, row);
    btn.addEventListener('click', () => { doTrain(mv, btn, '1'); box._up(); });
    more.addEventListener('click', () => { if (typeof box.onLeave === 'function') box.onLeave(); setTab('training'); });
    box._up = () => {
      const i = trainInfo(mv), p = i.max ? { n: 0, cost: Infinity } : trainPlan(mv, '1');
      putText(lv, `${i.name} Lv ${i.lv}`);
      putText(cap, `of ${i.cap}`);
      putText(now, nextTxt(i));
      putText(ms, i.max ? capWhy(i) : i.ms || ''); putHidden(ms, !(i.max || i.ms));
      putText(btn.querySelector('.qty'), i.max ? 'Maxed' : 'Train');
      setPrice(btn, p.cost);
      putDisabled(btn, i.max || S.gold < p.cost);
    };
    box._up();
    return box;
  };
}
