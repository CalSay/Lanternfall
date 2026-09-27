// 75-goals-ui: the "Next up" strip at the top of the Fight tab and the "Next up" block of
// the "While you were away" card. Browser-only. Goals come from topGoals() (55-goals.js).
{
  // ---- icons: toast-style specs, plus { mob: typeKey } and { char: rosterId } ----
  const FALLBACK = { ic: ['banner', '#F2C14E'] };
  function goalIcon(spec) {
    try {
      if (spec && spec.mob) { const t = TYPES.find(x => x.key === spec.mob); if (t) return spriteURL('best:' + t.key, SPR[t.key], t.pal); }
      if (spec && spec.char) {
        if (typeof portraitURL === 'function') { const u = portraitURL(spec.char); if (u) return u; }
        return spriteURL('comp0', SPR.hero, HERO_PAL);
      }
      return iconOf(spec) || iconOf(FALLBACK);
    } catch (e) { return iconOf(FALLBACK); }
  }

  // ---- Go: run the goal's fn, open the tab, scroll to the element and flash it ----
  function goTo(g) {
    let spec = g.go;
    try { if (typeof spec === 'function') spec = spec(); if (spec && spec.fn) spec.fn(); }
    catch (e) { console.error('[lanternfall] goal go failed', g.id, e); return; }
    if (!spec || !spec.tab) { ui(true); return; }
    setTab(spec.tab);
    const target = spec.sel ? document.querySelector(spec.sel) : null;
    if (!target) return;
    const box = $('panels');
    const y = target.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 12;
    try { box.scrollTo({ top: Math.max(0, y), behavior: reduced ? 'auto' : 'smooth' }); } catch (e) { box.scrollTop = Math.max(0, y); }
    const hit = target.closest('.row') || target;
    hit.classList.remove('nu-flash'); void hit.offsetWidth; hit.classList.add('nu-flash');
    setTimeout(() => hit.classList.remove('nu-flash'), 1600);
  }

  const pctTxt = g => g.ready ? 'Ready' : Math.floor(g.pct * 100) + '%';

  // ---- the strip ----
  let sec, head, list, toggle, empty, rows = [], sig = '';
  // Collapsed, the strip is one line: the top goal's row carries the expand toggle.
  function placeToggle() {
    const first = rows[0] && !rows[0].r.hidden ? rows[0].r : null;
    const inRow = S.nextUp.min && first;
    head.hidden = !!inRow;
    if (inRow) { if (toggle.parentNode !== first) first.append(toggle); }
    else if (toggle.parentNode !== head) head.append(toggle);
  }
  function mkRow() {
    const r = el('div', 'nu-row');
    const ic = el('div', 'nu-ic'); const im = img(goalIcon(FALLBACK)); ic.append(im);
    const body = el('div', 'nu-body');
    const lbl = el('div', 'nu-lbl'), bar = el('div', 'bar nu-bar'), fill = el('i');
    bar.append(fill); body.append(lbl, bar);
    const go = el('button', 'nu-go');
    const gq = el('span', 'nu-st'), gl = el('span', 'nu-gol', 'Go');
    go.append(gq, gl);
    r.append(ic, body, go);
    const x = { r, im, lbl, fill, go, gq, goal: null, url: '' };
    go.addEventListener('click', () => { if (x.goal) goTo(x.goal); });
    return x;
  }
  // persist = false at mount: save() stamps S.last, which would eat the away report.
  function setMin(min, persist) {
    S.nextUp.min = !!min;
    sec.classList.toggle('min', S.nextUp.min);
    toggle.setAttribute('aria-expanded', String(!S.nextUp.min));
    toggle.setAttribute('aria-label', S.nextUp.min ? 'Show all goals' : 'Show only the top goal');
    placeToggle();
    if (persist) { try { save(); } catch (e) {} }
  }
  function render(force) {
    const goals = topGoals(3);
    const s = goals.map(g => g.id + '|' + g.label + '|' + Math.floor(g.pct * 100)).join('~');
    if (s === sig && !force) return;
    sig = s;
    empty.hidden = goals.length > 0;
    while (rows.length < goals.length) { const x = mkRow(); rows.push(x); list.append(x.r); }
    rows.forEach((x, i) => {
      const g = goals[i];
      x.r.hidden = !g; x.goal = g || null;
      if (!g) return;
      const url = goalIcon(g.icon);
      if (url !== x.url) { x.im.src = url; x.url = url; }
      x.r.classList.toggle('ready', g.ready);
      x.lbl.textContent = g.label;
      x.fill.style.width = (g.pct * 100).toFixed(1) + '%';
      x.gq.textContent = pctTxt(g);
      x.go.setAttribute('aria-label', 'Go: ' + g.label);
    });
    placeToggle();
  }
  registerSection('adv', {
    id: 'nextup', title: '',
    mount(s) {
      sec = s; sec.classList.add('nu');
      const panel = sec.parentNode; panel.insertBefore(sec, panel.firstChild);
      head = el('div', 'nu-head');
      head.append(el('h2', 'sec-title', 'Next up'));
      toggle = el('button', 'nu-tog');
      toggle.append(el('span', 'nu-chev'));
      toggle.addEventListener('click', () => setMin(!S.nextUp.min, true));
      head.append(toggle);
      list = el('div', 'nu-list');
      empty = el('p', 'note nu-empty', 'Defeat a few foes to see your next goals.');
      sec.append(head, list, empty);
      setMin(S.nextUp.min);
    },
    update(force) { render(force); }
  });

  // ---- "Next up" in the away card (only when the card has something else to say) ----
  registerAwayLine(r => {
    const busy = r.kills || r.gold >= 1 || r.xp >= 1 || (r.zones && r.zones.to > r.zones.from) || r.bosses || r.raidDmg >= 1 ||
      r.embers || (r.mats && r.mats.length) || (r.items && r.items.length) || (r.skills && r.skills.length) || (r.extra && r.extra.length);
    if (!busy) return null;
    return topGoals(3).map(g => ({ icon: goalIcon(g.icon), txt: g.label, sub: g.ready ? 'Ready now' : pctTxt(g) + ' done', group: 'Next up', go: () => goTo(g) }));
  });
}
