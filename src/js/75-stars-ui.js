// 75-stars-ui: Hero tab > Stars, the star map (docs/design/combat-turn-build.md "Stars"; owner, 2026-10-02: "We also need
// much better menus for abilities and stars. I kinda miss the star map too"). Browser file.
// Core: 57e-stars.js (starSet, starLight, starUnlight, starWhy, starPoints, starSkyCount, ...); data 24f-data-stars.js
// (STARS, STAR_SKY: the constellations and each star's fixed spot).
//   - The loadout strip (.sr-top, sticky at the top of the menu): star points, the hero's 3 set and 2 lit stars. Tap a
//     star in it to open its card; x clears it; an empty slot takes the open star.
//   - The map (.sr-map, an SVG): six constellations, one per place stars are found. A star not found is a faint dot,
//     found is bright, set glows, lit shines (it twinkles unless the player asks for reduced motion); lines join learned
//     stars to their constellation, and a complete constellation turns gold. Tap a star (or Enter on it) to open its card.
//   - The card (.sr-card[data-star]): name, what it does, where it is found, learning progress, Slot 1/2/3 (each says
//     what it holds now, to compare) and Light / Put out.
//   - Filters (by hero kit; found or learned) and a list of the stars (.sr-row) to scan and compare; the map dims the
//     stars the filters leave out.
// Landscape: the menu takes the whole stage while Stars is open (60-stars.css), the map on the left and the card on the
// right, under the loadout strip. Tiles are lettered (no art: the art freeze, owner 2026-09-30); the map is interface:
// dots, lines and glows.
var starsUiPick;   // starsUiPick(id): open the star map on that star's card (57e's Next Up goal)
{
  const SVGNS = 'http://www.w3.org/2000/svg';
  const heroNm = k => (typeof ROSTER === 'object' && ROSTER[k] ? ROSTER[k].name.split(' ')[0] : k);
  const KITS = [['all', 'All'], ['wren', 'Wren'], ['tobin', 'Tobin'], ['pip', 'Pip'], ['shared', 'Any hero']];
  const SHOWS = [['all', 'All'], ['found', 'Found'], ['learned', 'Learned']];
  let root = null, sig = '', pick = null, fKit = 'all', fShow = 'all', scrollCard = false;
  const tile = (id, cls) => el('span', 'sr-ic' + (cls ? ' ' + cls : ''), id && STARS[id] ? STARS[id].short : '?');
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const persist = () => { try { save(); } catch (e) {} sig = ''; refresh(); };
  const btn = (cls, txt) => { const b = el('button', cls, txt); b.type = 'button'; return b; };
  const svg = (tag, attrs, cls) => { const n = document.createElementNS(SVGNS, tag); if (cls) n.setAttribute('class', cls); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
  const kitOk = s => fKit === 'all' || (fKit === 'shared' ? s.kit === 'all' : s.kit === fKit);
  const showOk = id => fShow === 'all' || (fShow === 'found' ? starOwned(id) : starLearned(id));
  const passes = id => kitOk(STARS[id]) && showOk(id);
  starsUiPick = id => { if (STARS[id]) { pick = id; scrollCard = true; sig = ''; } };

  registerView('party', { id: 'stars', label: 'Stars', order: 30, feature: 'stars',
    dot: () => !!(S.stars && typeof starsFound === 'function' && starsFound() > (S.stars.seenN | 0)) });
  on('menuView', ({ view }) => { if (view === 'stars' && S.stars && typeof starsFound === 'function') S.stars.seenN = starsFound(); });
  on('unlock', ({ id, quiet }) => {
    if (id !== 'stars' || quiet) return;
    toast('New on the Hero tab: Stars. Each star changes how your fights play.', 'good', { ic: ['constel', '#F2C14E'] }, 'high');
  });

  // ---- the loadout strip: points, 3 set, lit stars (as many as the points pay for) ----
  function chip(k, label, id, kind, i, isDim) {
    const c = el('div', 'sr-chip' + (id ? '' : ' empty') + (id && id === pick ? ' sel' : '') + (isDim ? ' dim' : '') + ' ' + kind);
    c.dataset.slot = String(i);
    const b = btn('sr-chip-b');
    if (id) {
      // a tap opens its card (Slot N there clears it; Put out puts a lit star out)
      const s = STARS[id], sub = isDim ? `Dim: needs ${plural(Math.max(1, -starFree(k)), 'more point')}` : kind === 'lit' ? plural(s.cost, 'point') : starLearned(id) ? 'Learned' : `${starWins(id)}/${starNeed()} wins`;
      // a long one-word name takes a smaller face so it is not cut in a narrow chip
      b.append(el('span', 'sr-chip-t' + (s.name.split(' ').some(w => w.length > 8) ? ' long' : ''), s.name), el('small', null, sub));
      b.setAttribute('aria-label', `${label}: ${s.name}, ${sub}. Open its card.`);
      b.addEventListener('click', () => { pick = id; scrollCard = true; sig = ''; refresh(); });
      c.append(b);
    } else {
      // an empty slot takes the open star, when it can
      const can = kind === 'set' ? !!pick && starOwned(pick) && !starSlots(k).includes(pick)
        : !!pick && starLearned(pick) && !starLit(k).includes(pick) && !starWhy(pick, k);
      b.append(el('span', 'sr-chip-t', '+ ' + label), el('small', null, can ? 'Tap to set' : 'Empty'));
      b.setAttribute('aria-label', `${label}: empty` + (can ? `. Tap to put ${STARS[pick].name} here.` : ''));
      b.disabled = !can;
      b.addEventListener('click', () => { if (kind === 'set') starSet(i, pick, k); else starLight(pick, k); persist(); });
      c.append(b);
    }
    return c;
  }
  function strip(k) {
    const top = el('div', 'sr-top'), pts = starPoints(k), free = Math.max(0, starFree(k)), used = starUsed(k), set = starSlots(k), lit = starLit(k), dim = starDim(k);
    const p = el('div', 'sr-pts');
    p.setAttribute('aria-label', `Star points: ${used} used of ${pts}`); p.title = 'Star points pay for lit stars, and they are the only limit: 2 to start, 1 every 10 hero levels, 1 for each Great Lantern, 1 for each complete constellation. A star the points cannot pay for shows dim.';
    p.append(el('b', null, `${used}/${pts}`), el('small', null, 'points used'));
    const sl = el('div', 'sr-row3'), ll = el('div', 'sr-row2');
    set.forEach((id, i) => sl.append(chip(k, `Set ${i + 1}`, id, 'set', i)));
    for (let i = 0; i <= lit.length; i++) ll.append(chip(k, `Lit ${i + 1}`, lit[i] || null, 'lit', i, dim.includes(lit[i])));
    top.append(p, sl, ll);
    return top;
  }

  // ---- the map ----
  function sky(k) {
    const C = STAR_SKY_CELL, W = 3 * C.w, H = 2 * C.h, set = starSlots(k), lit = starLit(k);
    const box = el('div', 'sr-map');
    const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'group', 'aria-label': 'Star map: six constellations. Tap a star to see it.' });
    // the night: faint specks at fixed places (no art: dots)
    let seed = 7;
    const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
    const dust = svg('g', {}, 'sr-dust');
    for (let i = 0; i < 70; i++) dust.append(svg('circle', { cx: (rnd() * W).toFixed(1), cy: (rnd() * H).toFixed(1), r: (0.6 + rnd() * 0.9).toFixed(2), opacity: (0.15 + rnd() * 0.35).toFixed(2) }));
    s.append(dust);
    for (const c of STAR_SKY) {
      const g = svg('g', { transform: `translate(${c.col * C.w} ${c.row * C.h})` }, 'sr-sky' + (starSkyDone(c.id) ? ' done' : ''));
      g.dataset.sky = c.id;
      const n = starSkyCount(c.id);
      const t = svg('text', { x: C.w / 2, y: 26, 'text-anchor': 'middle' }, 'sr-sky-t'), cn = svg('tspan', {}, 'sr-sky-n');
      t.textContent = c.name.replace(/^The /, '') + ' ';
      cn.textContent = `${n.learned}/${n.n}`; t.append(cn);
      g.append(t);
      const at = {}; for (const [id, x, y] of c.stars) at[id] = [x, y];
      for (const [a, b] of c.lines) {
        if (!at[a] || !at[b]) continue;
        const on = starLearned(a) && starLearned(b);
        g.append(svg('line', { x1: at[a][0], y1: at[a][1], x2: at[b][0], y2: at[b][1] }, 'sr-ln' + (on ? ' on' : '')));
      }
      for (const [id, x, y] of c.stars) {
        const own = starOwned(id), learned = own && starLearned(id), isSet = set.includes(id), isLit = lit.includes(id);
        const st = svg('g', { transform: `translate(${x} ${y})`, role: 'button', tabindex: '0' },
          'sr-st ' + (!own ? 'unk' : learned ? 'learned' : 'found') + (isSet ? ' set' : '') + (isLit ? ' lit' : '') + (id === pick ? ' sel' : '') + (passes(id) ? '' : ' dim'));
        st.dataset.star = id;
        st.setAttribute('aria-label', own ? `${STARS[id].name}${learned ? ', learned' : ''}${isSet ? ', set' : ''}${isLit ? ', lit' : ''}` : `A star not found yet (${starFromText(STARS[id])})`);
        st.setAttribute('aria-pressed', String(id === pick));
        st.append(svg('circle', { r: 21 }, 'sr-hit'));
        if (isSet || isLit) st.append(svg('circle', { r: isLit ? 15 : 12 }, 'sr-glow'));
        if (isLit) st.append(svg('path', { d: 'M0,-17 L3,-3 L17,0 L3,3 L0,17 L-3,3 L-17,0 L-3,-3 Z' }, 'sr-ray'));
        st.append(svg('circle', { r: !own ? 3 : learned ? 6 : 5 }, 'sr-dot'));
        if (id === pick) st.append(svg('circle', { r: 11 }, 'sr-ring'));
        const go = () => { pick = id; scrollCard = !isWide(); sig = ''; refresh(); };
        st.addEventListener('click', go);
        st.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); } });
        g.append(st);
      }
      s.append(g);
    }
    box.append(s);
    return box;
  }

  // ---- the open star's card ----
  function card(k, id) {
    const s = STARS[id], own = starOwned(id), learned = own && starLearned(id), set = starSlots(k), lit = starLit(k);
    const where = set.indexOf(id), on = lit.includes(id), c = starSkyOf(id);
    const box = el('div', 'sr-card' + (!own ? ' locked' : where >= 0 || on ? ' ready' : learned ? ' learned' : ''));
    box.dataset.star = id;
    const head = el('div', 'sr-head'), t = el('div', 'sr-t');
    if (!own) {
      t.append(el('b', null, 'Not found yet'), el('small', 'sr-from', starFromText(s)));
      head.append(tile(null, 'sr-unk'), t); box.append(head);
      box.append(el('p', 'sr-desc', `A star of ${c ? c.name : 'the sky'}. Find it to see what it does.`));
      return box;
    }
    const kit = s.kit === 'all' ? 'Any hero' : heroNm(s.kit);
    t.append(el('b', null, s.name), el('small', null, `${kit} · ` + (learned ? `Learned · lights for ${plural(s.cost, 'point')}` : `Learning: ${starWins(id)} of ${starNeed()} wins`)));
    head.append(tile(id), t);
    box.append(head, el('p', 'sr-desc', s.text), el('small', 'sr-from', `Found: ${starFromText(s)}` + (c ? ` · ${c.name}` : '')));
    const foot = el('div', 'sr-foot');
    for (let i = 0; i < STARS_TUNE.slots; i++) {
      const cur = set[i], b = btn('sr-put' + (where === i ? ' on' : ''));
      b.dataset.slot = String(i);
      const lb = el('span'); lb.append(el('span', 'sr-put-w', 'Slot '), String(i + 1));
      // what the slot holds now, to compare: the name, or its 2-letter tile where the card is narrow (60-stars.css)
      const sub = el('small');
      if (where === i) sub.append(el('span', 'sr-put-n', 'Set here'), el('span', 'sr-put-c', 'Set'));
      else if (cur) sub.append(el('span', 'sr-put-n', STARS[cur].name), el('span', 'sr-put-c', 'for ' + STARS[cur].short));
      else sub.textContent = 'Empty';
      b.append(lb, sub);
      b.setAttribute('aria-pressed', String(where === i));
      b.setAttribute('aria-label', where === i ? `Slot ${i + 1}: set here. Tap to clear.` : `Set in slot ${i + 1}` + (cur ? `, in place of ${STARS[cur].name}` : ''));
      b.addEventListener('click', () => { if (where === i) starSet(i, null, k); else starSet(i, id, k); persist(); });
      foot.append(b);
    }
    box.append(foot);
    if (learned) {
      const can = on || starFree(k) >= s.cost;
      const why = on || can ? '' : where >= 0 ? `Needs ${plural(s.cost, 'star point')}.` : starWhy(id, k);
      const b = btn('sr-light' + (on ? ' on' : ''), on ? 'Put out' : where >= 0 ? `Light instead (${plural(s.cost, 'point')})` : `Light (${plural(s.cost, 'point')})`);
      b.setAttribute('aria-pressed', String(on));
      b.disabled = !can;
      b.title = on ? 'Put it out: its points come back' : why || `Light it for ${plural(s.cost, 'point')}`;
      b.addEventListener('click', () => { if (on) starUnlight(id, k); else { if (where >= 0) starSet(where, null, k); starLight(id, k); } persist(); });
      box.append(b);
      if (why) box.append(el('small', 'sr-why', why));
    } else box.append(el('small', 'sr-why', `Win ${plural(starNeed() - starWins(id), 'more fight')} with it set to learn it. Then any hero can light it.`));
    return box;
  }

  // ---- filters and the list ----
  function filters() {
    const f = el('div', 'sr-filt');
    const seg = (opts, cur, set, name) => {
      const g = el('div', 'sr-seg'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', name);
      for (const [v, txt] of opts) {
        const b = btn(v === cur ? 'on' : '', txt); b.setAttribute('aria-pressed', String(v === cur)); b.dataset.v = v;
        b.addEventListener('click', () => { set(v); sig = ''; refresh(); });
        g.append(b);
      }
      return g;
    };
    f.append(seg(KITS, fKit, v => { fKit = v; }, 'Whose kit'), seg(SHOWS, fShow, v => { fShow = v; }, 'Show'));
    return f;
  }
  function list(k) {
    const box = el('div', 'sr-list'), set = starSlots(k), lit = starLit(k);
    let n = 0;
    for (const id of STAR_ORDER) {
      if (!passes(id)) continue;
      n++;
      const s = STARS[id], own = starOwned(id), learned = own && starLearned(id);
      const r = btn('sr-row' + (!own ? ' locked' : '') + (id === pick ? ' sel' : '') + (set.includes(id) || lit.includes(id) ? ' ready' : ''));
      r.dataset.star = id;
      const tx = el('span', 'sr-row-t');
      if (!own) tx.append(el('b', null, 'Not found yet'), el('small', null, starFromText(s)));
      else tx.append(el('b', null, s.name), el('small', null, (set.includes(id) ? 'Set · ' : lit.includes(id) ? 'Lit · ' : '') + (learned ? `Learned · ${plural(s.cost, 'point')}` : `${starWins(id)}/${starNeed()} wins`)), el('span', 'sr-row-d', s.text));
      r.append(tile(own ? id : null, own ? '' : 'sr-unk'), tx);
      r.addEventListener('click', () => { pick = id; scrollCard = true; sig = ''; refresh(); });
      box.append(r);
    }
    if (!n) box.append(el('p', 'note', 'No stars match. Try another filter.'));
    return box;
  }

  function build() {
    const k = soloHero(); if (!root) return;
    root.textContent = '';
    if (!k) { root.append(el('p', 'note', 'Choose a hero first.')); return; }
    if (!pick || !STARS[pick]) pick = starSlots(k).find(Boolean) || STAR_ORDER.find(id => starOwned(id)) || STAR_ORDER[0];
    root.append(strip(k));
    const main = el('div', 'sr-main');
    main.append(sky(k), card(k, pick));
    root.append(main);
    const head = el('div', 'sr-lhead');
    head.append(el('h3', 'sr-h', 'All stars'), el('small', null, `Found ${starsFound()} of ${STAR_ORDER.length} · Learned ${starsLearnedN()} · ${starSkiesDone()} of ${STAR_SKY.length} constellations`));
    root.append(head, filters(), list(k));
    const how = el('details', 'sr-how');
    how.append(el('summary', null, 'How stars work'),
      el('p', 'note', `Each star changes how a fight plays. ${heroNm(k)} can set ${STARS_TUNE.slots}. Win ${starNeed()} fights with a star set to learn it.`),
      el('p', 'note', `Any hero can light a learned star with star points. Your points are the only limit: a star they cannot pay for shows dim until you put one out or earn more. Changes count from your next fight.`),
      el('p', 'note', 'Learn every star in a constellation to complete it: +1 star point, and the first two make every star quicker to learn.'),
      el('p', 'note', 'Stars come from zone bosses the first time they fall, elites now and then, Deepwell floors and the Provings. They belong to the lamp: every hero can use them.'));
    root.append(how);
    if (scrollCard) { scrollCard = false; showCard(); }
  }
  // bring the open card into view below the sticky loadout strip (a tap in the list, or Next Up)
  function showCard() {
    const c = root.querySelector('.sr-card'), box = $('panels'), top = root.querySelector('.sr-top');
    if (!c || !box || c.offsetParent === null) return;
    const r = c.getBoundingClientRect(), b = box.getBoundingClientRect(), y0 = top ? top.getBoundingClientRect().bottom + 6 : b.top;
    let d = 0;
    if (r.top < y0) d = r.top - y0;
    else if (r.bottom > b.bottom) d = Math.min(r.bottom - b.bottom + 6, r.top - y0);
    if (d) box.scrollTop += d;
  }
  function refresh() {
    if (!root || !root.isConnected) return;
    const k = soloHero(); if (!k) { if (sig !== 'none') { sig = 'none'; build(); } return; }
    const st = S.stars || {};
    const s = [k, S.L, S.maxZone, starPoints(), pick, fKit, fShow, JSON.stringify(st.own), JSON.stringify(st.learned), JSON.stringify(st.wins), JSON.stringify(st.set && st.set[k]), JSON.stringify(st.lit && st.lit[k])].join('|');
    if (s === sig) return;
    sig = s; build();
  }
  registerSection('party', { id: 'stars', view: 'stars', feature: 'stars',
    mount(sec) { sec.classList.add('sr-sec'); root = el('div', 'sr-root'); sec.append(root); sig = ''; refresh(); },
    update: () => { try { refresh(); } catch (e) { console.error('[lanternfall] stars', e); } } });
  for (const ev of ['starFound', 'starLearned', 'starsChange', 'soloHero', 'levelup']) on(ev, () => { sig = ''; try { refresh(); } catch (e) {} });
}
