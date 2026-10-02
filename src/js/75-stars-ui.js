// 75-stars-ui: Hero tab > Stars (docs/design/combat-turn-build.md "Stars"). Browser file.
// Core: 57e-stars.js (starSet, starLight, starUnlight, starWhy, starPoints, ...); data 24f-data-stars.js.
//   - Star points: free and total (they pay for lit stars).
//   - The hero's 3 star slots (a found star) and up to 3 lit stars (a learned star, for its cost in points); x clears one.
//   - Every star, in the order they are found: name, what it does, learned or how many wins to go, and Slot 1/2/3 and
//     Light / Put out buttons. A star not found yet shows only where it is found.
// Star tiles are lettered (no art: the art freeze, owner 2026-09-30), like the abilities that have no icon yet.
{
  const heroNm = k => (typeof ROSTER === 'object' && ROSTER[k] ? ROSTER[k].name.split(' ')[0] : k);
  let root = null, sig = '';
  const tile = (id, cls) => el('span', 'sr-ic ab-mono' + (cls ? ' ' + cls : ''), id && STARS[id] ? STARS[id].short : '?');
  const persist = () => { try { save(); } catch (e) {} sig = ''; refresh(); };
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

  registerView('party', { id: 'stars', label: 'Stars', order: 30, feature: 'stars',
    dot: () => !!(S.stars && typeof starsFound === 'function' && starsFound() > (S.stars.seenN | 0)) });
  on('menuView', ({ view }) => { if (view === 'stars' && S.stars && typeof starsFound === 'function') S.stars.seenN = starsFound(); });
  on('unlock', ({ id, quiet }) => {
    if (id !== 'stars' || quiet) return;
    toast('New on the Hero tab: Stars. Each star changes how your fights play.', 'good', { ic: ['constel', '#F2C14E'] }, 'high');
  });

  function slotBox(label, id, extra, onClear) {
    const b = el('div', 'ab-slot sr-slot' + (id ? '' : ' empty'));
    b.append(el('small', null, label));
    if (id) {
      b.append(tile(id), el('b', null, STARS[id].name));
      if (extra) b.append(el('small', 'sr-cost', extra));
      const x = el('button', 'ab-clear', '×'); x.type = 'button'; x.setAttribute('aria-label', `Clear ${label}`);
      x.addEventListener('click', onClear);
      b.append(x);
    } else b.append(el('b', null, 'Empty'));
    return b;
  }
  function build() {
    const k = soloHero(); if (!root) return;
    root.textContent = '';
    if (!k) { root.append(el('p', 'note', 'Choose a hero first.')); return; }
    const pts = starPoints(), free = starFree(k), set = starSlots(k), lit = starLit(k);
    root.append(el('p', 'note sr-note', `Each star changes how a fight plays. ${heroNm(k)} sets up to ${STARS_TUNE.slots}. Win ${STARS_TUNE.learnWins} fights with a star set and you learn it: then any hero can light it with star points, up to ${STARS_TUNE.litMax}. Changes count from your next fight.`));
    const head = el('div', 'sr-head');
    head.append(el('b', 'sr-pts', `Star points: ${Math.max(0, free)} free of ${pts}`),
      el('small', null, `Found ${starsFound()} of ${STAR_ORDER.length} · Learned ${starsLearnedN()}`));
    root.append(head);
    root.append(el('h3', 'ab-pname', 'Set'));
    const sl = el('div', 'ab-slots sr-slots');
    set.forEach((id, i) => sl.append(slotBox(`Slot ${i + 1}`, id, id && !starLearned(id) ? `${starWins(id)} of ${STARS_TUNE.learnWins} wins` : id ? 'Learned' : '', () => { starSet(i, null, k); persist(); })));
    root.append(sl);
    root.append(el('h3', 'ab-pname', 'Lit'));
    const ll = el('div', 'ab-slots sr-slots');
    for (let i = 0; i < STARS_TUNE.litMax; i++) {
      const id = lit[i] || null;
      ll.append(slotBox(`Lit ${i + 1}`, id, id ? plural(STARS[id].cost, 'point') : '', () => { starUnlight(id, k); persist(); }));
    }
    root.append(ll);
    if (!starsLearnedN()) root.append(el('p', 'note sr-src', 'Learn a star to light it here.'));
    root.append(el('h3', 'ab-pname', 'Your stars'));
    const list = el('div', 'sr-list');
    for (const id of STAR_ORDER) list.append(cardFor(k, id, set, lit));
    root.append(list);
    root.append(el('p', 'note sr-src', 'Stars are found on zone bosses the first time they fall, on elites now and then, and by passing a Proving. They belong to the lamp: every hero can set them.'));
  }
  function cardFor(k, id, set, lit) {
    const s = STARS[id], own = starOwned(id), learned = own && starLearned(id), where = set.indexOf(id), on = lit.includes(id);
    const c = el('div', 'ab-card sr-card' + (!own ? ' locked' : where >= 0 || on ? ' ready' : ' owned'));
    c.dataset.star = id;
    const top = el('div', 'ab-top'), t = el('div', 'ab-t');
    if (!own) {
      t.append(el('b', null, 'Not found yet'), el('small', null, starFromText(s)));
      top.append(tile(null, 'sr-unk'), t); c.append(top);
      return c;
    }
    t.append(el('b', null, s.name), el('small', null, (learned ? 'Learned' : `Learning: ${starWins(id)} of ${STARS_TUNE.learnWins} wins`) + ` · Lights for ${plural(s.cost, 'point')}`));
    top.append(tile(id), t);
    c.append(top, el('p', 'ab-desc', s.text));
    const foot = el('div', 'ab-foot');
    for (let i = 0; i < STARS_TUNE.slots; i++) {
      const b = el('button', 'ab-put' + (where === i ? ' on' : ''), `Slot ${i + 1}`); b.type = 'button';
      b.setAttribute('aria-pressed', String(where === i));
      b.addEventListener('click', () => { if (where === i) starSet(i, null, k); else starSet(i, id, k); persist(); });
      foot.append(b);
    }
    if (learned) {
      const can = on || (lit.length < STARS_TUNE.litMax && starFree(k) >= s.cost);
      const why = on || can ? '' : where >= 0 ? (lit.length >= STARS_TUNE.litMax ? `You can light ${STARS_TUNE.litMax} stars. Put one out first.` : `Needs ${plural(s.cost, 'star point')}.`) : starWhy(id, k);
      const b = el('button', 'ab-put sr-light' + (on ? ' on' : ''), on ? 'Put out' : 'Light'); b.type = 'button';
      b.setAttribute('aria-pressed', String(on));
      b.disabled = !can;
      b.title = on ? 'Put it out: its points come back' : why || `Light it for ${plural(s.cost, 'point')}`;
      b.addEventListener('click', () => { if (on) starUnlight(id, k); else { if (where >= 0) starSet(where, null, k); starLight(id, k); } persist(); });
      foot.append(b);
    }
    c.append(foot);
    return c;
  }
  function refresh() {
    if (!root || !root.isConnected) return;
    const k = soloHero(); if (!k) { if (sig !== 'none') { sig = 'none'; build(); } return; }
    const st = S.stars || {};
    const s = [k, S.L, starPoints(), JSON.stringify(st.own), JSON.stringify(st.learned), JSON.stringify(st.wins), JSON.stringify(st.set && st.set[k]), JSON.stringify(st.lit && st.lit[k])].join('|');
    if (s === sig) return;
    sig = s; build();
  }
  registerSection('party', { id: 'stars', title: 'Stars', view: 'stars', feature: 'stars',
    mount(sec) { sec.classList.add('sr-sec'); root = el('div', 'ab-root sr-root'); sec.append(root); sig = ''; refresh(); },
    update: () => { try { refresh(); } catch (e) { console.error('[lanternfall] stars', e); } } });
  for (const ev of ['starFound', 'starLearned', 'starsChange', 'soloHero', 'levelup']) on(ev, () => { sig = ''; try { refresh(); } catch (e) {} });
}
