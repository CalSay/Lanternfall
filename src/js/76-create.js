// 76-create: character creation (new games), the one-time "Choose your path" screen (existing saves,
// and again after a Mirror of Embers), the free switch (S2) and the class card rows on the hero sheet.
// Browser-only. S2 (classes-2 1, 3.4, 7.2): the picker offers the three base classes (CLASS_BASES,
// 24-data-classes.js) and chooses through chooseBase (55-classes.js). drawCharPreview/heroSpec (60b-baker.js,
// A2) are optional. Without CLASS_DEFS or S.party the screen never opens.
//
// classUI (read by 75-party-sheet.js): rows() -> [el] the class card's extra rows (passives, the evolution
// row, the locked second-tier row); switchRow() -> el | null (the free
// switch, while it is open); sig() -> a string that changes when those rows would; open(mode).
var classUI;
{
  const WEIGHT_NAME = { heavy: 'Heavy armour', medium: 'Medium armour', light: 'Light armour' };
  const HOME_NAME = { front: 'Front', mid: 'Middle', back: 'Back' };
  const classes = () => (typeof CLASS_DEFS === 'object' && CLASS_DEFS && typeof HERO_CLASSES === 'object') ? CLASS_DEFS : null;
  const needsChoice = () => !!(classes() && typeof S === 'object' && S.party && !S.party.chosen && typeof chooseBase === 'function');

  let root = null, pick = 'warrior', mode = 'new', lastFocus = null;

  // C9: the complete registry, with three playable starters and plain unlock routes.
  function buildSolo() {
    root = el('div', 'create create-solo'); root.id = 'createScreen';
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'createTitle');
    const inner = el('div', 'create-in');
    const h = el('h1', null, 'Who carries the lantern?'); h.id = 'createTitle';
    const lede = el('p', 'create-lede', 'One hero walks the Lantern Road. Pick who picks the lamp up.');
    const warn = el('p', 'create-warn', 'You can switch heroes at camp later, for free. Gold, gear and camp are shared.');
    const cards = el('div', 'ccards'); cards.setAttribute('role', 'radiogroup'); cards.setAttribute('aria-label', 'Hero');
    const keys = HERO_ORDER;
    if (!keys.includes(pick) || !heroCanPlay(pick)) pick = keys.find(heroCanPlay);
    const figs = [];
    let begin = null;
    const btns = keys.map(k => {
      const H = SOLO_HEROES[k], R = ROSTER[k], info = heroRouteInfo(k);
      const b = el('button', 'ccard'); b.type = 'button'; b.dataset.cls = k; b.dataset.hero = k;
      b.setAttribute('role', 'radio');
      const fig = el('div', 'fig'); const cv = el('canvas', 'px'); fig.append(cv);
      const txt = el('div', 'ctxt');
      const top = el('div', 'ctop'); top.append(el('b', null, R.name));
      top.append(el('span', 'pip r-' + (R.role || 'striker'), H ? H.role : ROLE_STATS[R.role].n));
      txt.append(top);
      txt.append(el('div', 'cl-wt', R.title.replace(/^the /, 'The ') + (H ? ` · ${H.range} · ${H.weapon}` : '')));
      const bio = el('div', 'how'); txt.append(bio);   // starters and unlocked heroes only: a locked hero shows who you meet them as, not their story
      const state = el('b', 'sp-lv'), route = el('div', 'how'); txt.append(state, route);
      b._state = state; b._route = route; b._bio = bio;
      if (H && H.ab) { const ab = el('div', 'ab'); ab.append(el('em', null, H.ab.name + ': '), document.createTextNode(H.ab.desc)); txt.append(ab); }
      b.append(fig, txt);
      b.addEventListener('click', () => select(k));
      b.addEventListener('keydown', e => {
        const i = keys.indexOf(k);
        const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return; e.preventDefault();
        const nk = keys[(i + d + keys.length) % keys.length]; select(nk); btns.find(x => x.dataset.cls === nk).focus();
      });
      cards.append(b);
      cv.width = 56; cv.height = 100;
      figs.push([cv, k]);
      return b;
    });
    const built = root;
    const nextFig = () => {
      if (root !== built || !figs.length) return;
      const [cv, k] = figs.shift();
      try { const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; if (heroHasKit(k) && typeof heroArtPreview === 'function') heroArtPreview(cv, k); } catch (e) { console.error('[lanternfall] hero preview', e); }
      if (figs.length) setTimeout(nextFig, 0);
    };
    requestAnimationFrame(() => setTimeout(nextFig, 0));
    const first = k => ROSTER[k].name.split(' ')[0];
    function select(k) {
      pick = k;
      const info = heroRouteInfo(k);
      if (begin) { begin.disabled = !info.playable && !(info.ready && !info.unlocked); putText(begin, info.playable ? `Begin as ${first(k)}` : info.ready && !info.unlocked ? `Unlock ${first(k)}` : info.unlocked ? 'Coming soon' : 'Locked'); }
      for (const b of btns) {
        const on_ = b.dataset.cls === k, state = heroRouteInfo(b.dataset.hero);
        b.dataset.state = state.state;
        // Cards can be inspected; the Begin/Unlock button enforces whether this hero can be chosen.
        putText(b._bio, state.bio); b._bio.hidden = !state.bio;
        putText(b._state, state.state === 'coming-soon' ? 'Coming soon' : state.unlocked ? 'Unlocked' : 'Locked');
        putText(b._route, state.unlocked ? (state.playable ? 'Ready to carry the lamp.' : 'Route complete. This hero’s art and solo kit come later.') : state.ready ? state.how : state.meet);   // a new game spoils nothing: who, not where or how much
        b.setAttribute('aria-checked', String(on_)); b.setAttribute('aria-pressed', String(on_)); b.tabIndex = on_ ? 0 : -1;
      }
    }
    begin = el('button', 'big forge create-go', ''); begin.type = 'button';
    begin.addEventListener('click', () => {
      const info = heroRouteInfo(pick);
      if (!info.playable) { if (info.ready && !info.unlocked && heroUnlock(pick)) { try { save(); } catch (e) {} select(pick); } return; }
      let okd = false;
      try { okd = heroPick(pick); } catch (e) { console.error('[lanternfall] soloPick', e); }
      if (!okd) return;
      try { save(); } catch (e) {}
      if (typeof updatePortrait === 'function') updatePortrait();
      close();
      toast(`${first(pick)} picks up the lamp. The road is dark.`, 'good');
    });
    // Keep Begin within reach while the full registry scrolls.
    begin.style.position = 'sticky'; begin.style.top = '0'; begin.style.zIndex = '1';
    inner.append(h, lede, warn, begin, cards);
    root.append(inner);
    select(pick);
    root.addEventListener('keydown', trapTab);
    return root;
  }

  function trapTab(e) {
    if (e.key !== 'Tab' || !root) return;
    const f = [...root.querySelectorAll('button, input')].filter(n => !n.disabled && n.tabIndex !== -1);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(want) {
    if (root) return;
    // one screen for a new game (and any save that has no hero yet); switching is at camp
    if (want === 'switch' || !needsChoice()) return;
      mode = 'new'; pick = (typeof soloHero === 'function' && soloHero()) || SOLO_ORDER[0];
      lastFocus = document.activeElement;
      document.body.append(buildSolo());
      const sel = root.querySelector('.ccard[aria-checked="true"]');
      (sel || root.querySelector('button')).focus();
  }
  function close() {
    if (!root) return;
    root.remove(); root = null;
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
    ui(true);
    emit('createDone', { mode });   // 75-onboard-ui.js: the guide's first hint (tap the foe) starts now
  }

  // ---- the class card rows (hero sheet, 75-party-sheet.js) ----
  const row = (title, sub, text, cls) => {
    const d = el('div', 'cs-kit1 cl-row' + (cls ? ' ' + cls : ''));
    const top = el('div', 'cl-top'); top.append(el('b', null, title)); if (sub) top.append(el('small', null, sub));
    d.append(top);
    if (text) d.append(el('p', null, text));
    return d;
  };
  const chip = (txt, on) => el('span', 'cl-chip' + (on ? ' on' : ''), (on ? '\u2713 ' : '') + txt);
  classUI = {
    rows() {
      const info = typeof clsInfo === 'function' ? clsInfo() : null;
      if (!info) return [];
      const d = CLASS_DEFS[info.base], out = [];
      for (const ps of d.passives) out.push(row(ps.name, ps.s ? 'with active combat' : 'Passive', ps.text, ps.s ? 'off' : ''));
      // S3: the evolution rows, the Proving and the choice are 75-class-ui's
      if (typeof classEvoUI === 'object' && classEvoUI) out.push(...classEvoUI.rows(info));
      // The evolution: granted or the two paths and their gate.
      else if (info.evo) {
        const txt = info.evo === 'priest'
          ? 'You keep your Blessing and Rally Hymn. New Lightkeeper powers come in a later update.'
          : `You play the ${d.name}'s kit for now. The ${info.evoName}'s own powers come in a later update.`;
        const r = row(`Path: ${info.evoName}`, info.proven ? info.evoTitle : 'Granted', txt, 'cl-evo');
        if (!info.proven) r.append(el('p', 'cl-note', `The title ${info.evoTitle} waits for your Proving, after the Hollow’s Elder.`));
        out.push(r);
      } else {
        const names = info.paths.map(x => `${x.name} (${x.kind})`).join(' or ');
        const r = row('Evolution', 'Locked', `Two paths open after the Hollow’s Elder: ${names}. The choice is for good.`, 'cl-evo off');
        const chips = el('div', 'cl-chips');
        chips.append(chip('Beat the Hollow’s Elder', info.gate.bossOk), chip(`Level ${info.gate.lv}`, info.gate.lvOk));
        r.append(chips);
        if (info.gate.open) r.append(el('p', 'cl-note', 'The Proving comes in a later update.'));
        out.push(r);
      }
      if (!(typeof classEvoUI === 'object' && classEvoUI)) out.push(row('Second path', 'Locked', 'A second path opens in a later season.', 'off'));
      return out;
    },
    head() {
      const info = typeof clsInfo === 'function' ? clsInfo() : null;
      if (!info) return '';
      const d = CLASS_DEFS[info.base];
      return `${WEIGHT_NAME[d.weight]} · ${HOME_NAME[d.home]}`;
    },
    switchRow() {
      return null;   // heroes switch at camp
      const sw = typeof clsSwitchInfo === 'function' ? clsSwitchInfo() : null;
      if (!sw || !sw.ok) return null;
      const m = Math.max(1, Math.ceil(sw.left / 60e3));
      const box = el('div', 'cs-mirror cl-switch');
      // S3: once evolved, the free change switches the path (75-class-ui's sheet), not the class
      const evo = S.cls && S.cls.evo && typeof classEvoUI === 'object' && classEvoUI;
      const t = el('div'); t.append(el('b', null, 'Free change'), el('small', null, `Changed your mind? Switch ${evo ? 'path' : 'class'} for free. Once only, ${m} more minute${m === 1 ? '' : 's'}.`));
      const b = el('button', 'mini go', 'Switch'); b.type = 'button';
      b.addEventListener('click', () => { if (typeof partySheet === 'object' && partySheet) partySheet.close(); if (evo) classEvoUI.openRespec(); else open('switch'); });
      box.append(t, b);
      return box;
    },
    sig() {
      const sw = typeof clsSwitchInfo === 'function' ? clsSwitchInfo() : null, c = S.cls || {};
      return [c.base, c.evo, JSON.stringify(c.proven || {}), sw && sw.ok ? Math.ceil(sw.left / 60e3) : 0, S.L >= CLS_TUNE.evoLv, S.maxZone,
        typeof classEvoUI === 'object' && classEvoUI ? classEvoUI.sig() : ''].join('/');
    },
    // S3: the Mirror of Embers row (75-class-ui: the respec sheet), or null (the sheet keeps its own)
    mirrorRow() { return typeof classEvoUI === 'object' && classEvoUI ? classEvoUI.mirrorRow() : null; },
    open
  };

  // Open now if needed, and whenever the choice reopens (a Mirror of Embers).
  let sawChosen = !!(typeof S === 'object' && S.party && S.party.chosen);
  setInterval(() => { try { if (S.party && S.party.chosen) sawChosen = true; open(); } catch (e) {} }, 1000);
  try { open(); } catch (e) { console.error('[lanternfall] create screen', e); }
}
