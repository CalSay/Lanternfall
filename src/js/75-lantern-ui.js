// 75-lantern-ui: the Great Lantern card and the Lantern Road strip (region-2.md 8.1-8.3, task R0).
// Browser-only. Logic: 55-lantern.js (emit('greatLantern')), data: 22-data-regions.js.
//
// The card: a full-screen moment on a region boss's first kill (not for quiet catch-ups: those are
// a bell line). The lantern shows dark, then lights with a glow and rays (reduced motion: lit at
// once). Headline and story from the event (COAST_STORY), then the rewards. One tap continues.
// The strip: the Camp view's header gains a line of lanterns, one per region and one dark one
// beyond. A tap opens a sheet with each region, its zones and the day its lantern was relit.
{
  // A 12x14 Great Lantern. 6 handle, 4 frame, 3 glass, 1 flame, 5 flame core.
  const LANTERN = ['....6666....', '...66..66...', '....6666....', '.4444444444.', '..43333334..', '..43311334..', '..43155134..',
    '..41555514..', '..41555514..', '..43155134..', '..43333334..', '.4444444444.', '...444444...', '....4444....'];
  const PAL_DARK = { 6: '#4A4E5C', 4: '#2E2A36', 3: '#1C2030', 1: '#262A38', 5: '#30364A' };
  const palLit = col => ({ 6: '#8C6A43', 4: '#4A3424', 3: mixCol(col, '#FFF3C4', 0.55), 1: col, 5: '#FFF8DA' });
  function mixCol(a, b, t) {
    const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), x = p(a), y = p(b);
    return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  const lanternURL = (lit, col) => lit ? spriteURL('gl:lit' + col, LANTERN, palLit(col)) : spriteURL('gl:dark', LANTERN, PAL_DARK);

  // ---------------- the card ----------------
  const queue = [];
  let ov = null, lastFocus = null;
  const blocked = () => !!document.querySelector('.away-ov, #createScreen, .join-ov, .mm-ov');
  function closeCard() {
    if (!ov) return;
    ov.remove(); ov = null;
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
    if (queue.length) setTimeout(showNext, reduced ? 0 : 200);
    ui(true);
  }
  function showNext() {
    if (ov || !queue.length) return;
    if (blocked()) { setTimeout(showNext, 600); return; }
    const e = queue.shift(), r = regionById(e.region) || REGIONS[0];
    if (typeof noticeAsk === 'function') noticeAsk('card:lantern', e.head);   // W1-B: a card moment (23n-data-notices)
    lastFocus = document.activeElement;
    ov = el('div', 'gl-ov' + (reduced ? ' still' : ''));
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'glHead');
    ov.style.setProperty('--lc', r.col);
    const card = el('div', 'gl-card');
    card.append(el('div', 'gl-eye', `Great Lantern ${roman(e.n)} · ${r.n}`));
    const stage = el('div', 'gl-lamp'), rays = el('div', 'gl-rays'), dark = img(lanternURL(false), 'gl-img gl-dark'), lit = img(lanternURL(true, r.col), 'gl-img gl-lit');
    stage.append(rays, dark, lit);
    card.append(stage);
    const h = el('h2', 'gl-head', e.head); h.id = 'glHead';
    card.append(h);
    if (e.text) card.append(el('p', 'gl-text', e.text));
    const say = e.n === 1 && typeof voiceSay === 'function' ? voiceSay('lantern') : null;   // hero-voice: the Hollow's lantern, one line
    if (say) card.append(el('p', 'gl-say', '\u201C' + say.line + '\u201D \u2014 ' + say.who));
    if (e.rewards && e.rewards.length) {
      const list = el('ul', 'gl-rw');
      for (const x of e.rewards) {
        const li = el('li');
        if (x.ic) { try { li.append(img(iconURL(...x.ic))); } catch (err) {} }
        li.append(el('span', null, x.txt));
        list.append(li);
      }
      card.append(list);
    }
    const next = regionOf(e.zone + 1);
    if (next && next.z0 === e.zone + 1) card.append(el('p', 'gl-next', `The road goes on: ${next.n}, zones ${next.z0} to ${next.z1}.`));
    const go = el('button', 'big forge gl-go', 'Continue'); go.type = 'button';
    card.append(go);
    ov.append(card);
    ov.addEventListener('click', closeCard);
    ov.addEventListener('keydown', ev => { if (ev.key === 'Escape' || ev.key === 'Tab') { ev.preventDefault(); if (ev.key === 'Escape') closeCard(); } });
    document.body.append(ov);
    // the flourish: dark, then lit (the class starts the CSS; reduced motion shows it lit at once)
    if (reduced) stage.classList.add('on');
    else requestAnimationFrame(() => setTimeout(() => { if (stage.isConnected) stage.classList.add('on'); }, 450));
    go.focus({ preventScroll: true });
  }
  on('greatLantern', e => {
    if (!e || e.quiet) return;
    queue.push({ n: e.n, region: e.region, zone: e.zone, head: e.head, text: e.text, rewards: (e.rewards || []).slice() });
    setTimeout(showNext, 0);
    road.sig = '';
  });

  // ---------------- the Lantern Road strip ----------------
  const road = { box: null, sig: '' };
  const fmtDate = t => { try { return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } };
  function roadSheet() {
    if (typeof openSheet !== 'function') return;
    openSheet(api => {
      api.sheet.classList.add('gl-sheet');
      api.body.append(el('h2', 'gl-sh-title', 'The Lantern Road'),
        el('p', 'note', 'Each region ends in a Great Lantern. Beat the region\'s Elder. Then light it with your flame.'));
      const list = el('div', 'gl-sh-list');
      for (const x of lanternRoad()) {
        const row = el('div', 'gl-sh-row' + (x.lit ? ' lit' : '') + (x.here ? ' here' : ''));
        row.style.setProperty('--lc', x.col);
        const ic = el('div', 'gl-sh-ic'); ic.append(img(lanternURL(x.lit, x.col)));
        const tx = el('div', 'gl-sh-tx');
        const name = x.beyond ? `Beyond: ${x.n}` : x.name;
        const sub = x.beyond ? 'Dark. The road does not reach it yet.'
          : x.lit ? `Relit${x.at ? ' on ' + fmtDate(x.at) : ''}. Zones ${x.z0} to ${x.z1}.`
          : x.reached ? `Dark. Beat the zone ${x.z1} boss to light it. You are at zone ${S.maxZone}.`
          : `Dark. Zones ${x.z0} to ${x.z1}. Reach zone ${x.z0} to walk this far.`;
        tx.append(el('div', 'gl-sh-n', name), el('div', 'gl-sh-sub', sub));
        if (x.here) tx.append(el('div', 'gl-sh-here', 'You are here'));
        row.append(ic, tx);
        list.append(row);
      }
      api.body.append(list);
    }, { label: 'The Lantern Road', small: true });
  }
  function roadBuild(sec) {
    const b = el('button', 'gl-road'); b.type = 'button';
    b.setAttribute('aria-label', 'The Lantern Road: see each region and its Great Lantern');
    b.addEventListener('click', roadSheet);
    road.box = b; road.sig = '';
    sec.append(b);
    // sit under the camp's own header ("Hollow's Rest"), above the Hearth
    const head = document.querySelector('#sec-camp .world-head');
    if (head) head.after(sec);
  }
  function roadUpdate() {
    if (!road.box) return;
    const list = lanternRoad(), sig = list.map(x => (x.lit ? 1 : 0) + (x.here ? 'h' : '') + (x.reached ? 'r' : '')).join('|');
    if (sig === road.sig) return;
    road.sig = sig;
    road.box.textContent = '';
    list.forEach((x, i) => {
      if (i) road.box.append(el('i', 'gl-link' + (x.reached || x.lit ? ' on' : '')));
      const n = el('span', 'gl-node' + (x.lit ? ' lit' : '') + (x.here ? ' here' : '') + (x.beyond ? ' beyond' : ''));
      n.style.setProperty('--lc', x.col);
      n.append(img(lanternURL(x.lit, x.col)), el('b', null, x.beyond ? 'Beyond' : x.n.replace(/^the /, '')));
      road.box.append(n);
    });
  }
  // bake the strip's lanterns in idle time, so the Camp tab's first open does not pay for them
  if (typeof idleTask === 'function') idleTask(() => { lanternURL(false); for (const r of REGIONS) lanternURL(true, r.col); lanternURL(true, ROAD_BEYOND.col); });
  registerSection('camp', {
    id: 'lantern-road', title: null,
    mount: roadBuild,
    update: roadUpdate
  });
}
