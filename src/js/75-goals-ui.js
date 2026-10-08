// 75-goals-ui: the "Next up" chip on the game view (tap: the full list in a sheet) and the "Next up"
// block of the "While you were away" card. Browser-only. Goals come from topGoals() (55-goals.js).
// S.nextUp (min, picked) belonged to the old Fight-tab strip; it stays in the save, unused.
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

  // ---- Go: run the goal's fn, open the menu and view that hold the target, scroll there and flash it ----
  function goTo(g) {
    let spec = g.go;
    try { if (typeof spec === 'function') spec = spec(); if (spec && spec.fn) spec.fn(); }
    catch (e) { console.error('[lanternfall] goal go failed', g.id, e); return; }
    if (spec && spec.act) { followGo(spec); return; }   // UX-A: an activity target switches (70-ui followGo)
    if (!spec || !spec.tab) { ui(true); return; }
    setTab(spec.view || spec.tab, spec.sel);   // setTab picks the view that holds sel
    const target = spec.sel ? document.querySelector(spec.sel) : null;
    if (!target || target.offsetParent === null) return;
    scrollMenuTo(target, true);
    const hit = target.closest('.row') || target;
    hit.classList.remove('nu-flash'); void hit.offsetWidth; hit.classList.add('nu-flash');
    setTimeout(() => hit.classList.remove('nu-flash'), 1600);
  }

  const pctTxt = g => g.ready ? 'Ready' : Math.floor(g.pct * 100) + '%';

  // ---- the chip on the game view: the top goal; tap it for the full list (a sheet) ----
  const chip = el('button', 'nu-chip'); chip.type = 'button'; chip.id = 'nuChip';
  const cIc = el('span', 'nu-ic'), cIm = img(goalIcon(FALLBACK)); cIc.append(cIm);
  const cBody = el('span', 'nu-cbody'), cEye = el('span', 'nu-eye', 'Next up'), cLbl = el('span', 'nu-lbl');
  cBody.append(cEye, cLbl);
  const cSt = el('span', 'nu-cst'), cMore = el('span', 'nu-more'), cChev = el('span', 'nu-chev');
  const cBar = el('i', 'nu-cbar');
  chip.append(cIc, cBody, cSt, cMore, cChev, cBar);
  $('nuSlot').append(chip);
  let cUrl = '', cSig = '';
  function renderChip() {
    const goals = topGoals(3), g = goals[0];
    const s = goals.map(x => x.id + '|' + x.label + '|' + Math.floor(x.pct * 100)).join('~');
    if (s === cSig) return; cSig = s;
    chip.classList.toggle('ready', !!(g && g.ready));
    chip.classList.toggle('empty', !g);
    if (!g) {
      cLbl.textContent = 'Defeat a few foes to see your next goals.'; cSt.textContent = ''; cMore.textContent = '';
      cBar.style.width = '0%'; chip.setAttribute('aria-label', 'Next up: nothing yet'); return;
    }
    const url = goalIcon(g.icon); if (url !== cUrl) { nicPut(cIm, url); cUrl = url; }
    const readyN = goals.filter(x => x.ready).length;
    cLbl.textContent = g.label;
    cSt.textContent = pctTxt(g);
    cMore.textContent = goals.length > 1 ? '+' + (goals.length - 1) : '';
    cMore.classList.toggle('hot', readyN > 1);
    cBar.style.width = (g.pct * 100).toFixed(1) + '%';
    chip.setAttribute('aria-label', `Next up: ${g.label}, ${pctTxt(g)}. Show all goals`);
  }
  setInterval(() => { try { renderChip(); } catch (e) {} }, 500);

  // The list sheet: up to 3 goals, each with a Go button (Go closes the sheet first).
  function mkRow(api) {
    const r = el('div', 'nu-row');
    const ic = el('div', 'nu-ic'); const im = img(goalIcon(FALLBACK)); ic.append(im);
    const body = el('div', 'nu-body');
    const lbl = el('div', 'nu-lbl'), bar = el('div', 'bar nu-bar'), fill = el('i');
    bar.append(fill); body.append(lbl, bar);
    const go = el('button', 'nu-go'); go.type = 'button';
    const gq = el('span', 'nu-st'), gl = el('span', 'nu-gol', 'Go');
    go.append(gq, gl);
    r.append(ic, body, go);
    const x = { r, im, lbl, fill, go, gq, gol: gl, goal: null, url: '' };
    go.addEventListener('click', () => { const g = x.goal; if (!g) return; if (api.body.querySelectorAll('.nu-row:not([hidden])').length >= 2) emit('choice', 'nextup'); api.close(true); goTo(g); });   // craft-delta: a pick from two or more goals is a choice
    return x;
  }
  function openList() {
    if (typeof openSheet !== 'function') return;
    let timer = 0;
    openSheet(api => {
      api.body.append(el('h2', 'nlog-h', 'Next up'));
      const list = el('div', 'nu-list'), empty = el('p', 'note nu-empty', 'Defeat a few foes to see your next goals.');
      api.body.append(list, empty, el('p', 'note', 'The goals closest to done, across everything you do. Go takes you there.'));
      const rows = [];
      let sig = '';
      const render = () => {
        const goals = topGoals(3);
        const s = goals.map(g => g.id + '|' + g.label + '|' + Math.floor(g.pct * 100) + '|' + g.goLabel).join('~');
        if (s === sig) return; sig = s;
        empty.hidden = goals.length > 0;
        while (rows.length < goals.length) { const x = mkRow(api); rows.push(x); list.append(x.r); }
        rows.forEach((x, i) => {
          const g = goals[i];
          x.r.hidden = !g; x.goal = g || null;
          if (!g) return;
          const url = goalIcon(g.icon);
          if (url !== x.url) { nicPut(x.im, url); x.url = url; }
          x.r.classList.toggle('ready', g.ready);
          x.lbl.textContent = g.label;
          x.fill.style.width = (g.pct * 100).toFixed(1) + '%';
          x.gq.textContent = pctTxt(g);
          x.gol.textContent = g.goLabel || 'Go';
          x.go.setAttribute('aria-label', (g.goLabel || 'Go') + ': ' + g.label);
        });
      };
      render();
      timer = setInterval(render, 500);
    }, { small: true, label: 'Next up', onClose() { clearInterval(timer); } });
  }
  chip.addEventListener('click', openList);

  // ---- "Next up" in the away card (only when the card has something else to say) ----
  registerAwayLine(r => {
    const busy = r.kills || r.gold >= 1 || r.xp >= 1 || (r.zones && r.zones.to > r.zones.from) || r.bosses || r.raidDmg >= 1 ||
      r.embers || (r.mats && r.mats.length) || (r.items && r.items.length) || (r.skills && r.skills.length) || (r.extra && r.extra.length);
    if (!busy) return null;
    return topGoals(3).map(g => ({ icon: goalIcon(g.icon), txt: g.label, sub: g.ready ? 'Ready now' : pctTxt(g) + ' done', group: 'Next up', goLabel: g.goLabel, go: () => goTo(g) }));
  });
}
