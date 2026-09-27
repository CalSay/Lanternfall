// 76-create: character creation (new games) and the one-time "Choose your path" screen
// (existing saves, and again after a Mirror of Embers). Browser-only.
// Needs HERO_CLASSES and chooseClass (55-party.js, A1); drawCharPreview/heroSpec (60b-baker.js,
// A2) are optional. Without HERO_CLASSES or S.party the screen never opens.
{
  const ORDER = ['warden', 'lanternmage', 'ranger', 'lightkeeper'];
  const ROLE_NAME = { tank: 'Tank', striker: 'Striker', caster: 'Caster', support: 'Support' };
  const STARTER = { warden: 'wren', lanternmage: 'tobin', ranger: 'tobin', lightkeeper: 'bram' };
  const STARTER_NAME = { wren: 'Wren Hollowmere', tobin: 'Tobin Reed', bram: 'Bram Hollis' };
  const JOIN = {
    wren: ['An arrow lands at your feet, then another in the slime behind you.',
      '"You stand in the right place, for once. Hold them there."',
      'Wren Hollowmere drops from the branches and does not ask to come along.'],
    tobin: ['A boy in a pot helm trips over a sword too big for him on the road out of Mossy Hollow.',
      '"I\'m Tobin. I stand in front. That\'s the whole job, isn\'t it?"',
      'He does not wait for an answer.'],
    bram: ['A woodcutter looks at your lantern for a long time.',
      '"Heard a Lightkeeper was on the road. I\'ve no light of my own, but I can swing."',
      'Bram Hollis walks ahead of you, into the dark.']
  };
  // Fallback look when the new baker is not in: today's hero sprite, tinted per class.
  const TINT = { warden: '#3E63C9', lanternmage: '#8A4FC9', ranger: '#3E8A4E', lightkeeper: '#EFE6D6' };

  const classes = () => (typeof HERO_CLASSES === 'object' && HERO_CLASSES) ? HERO_CLASSES : null;
  const needsChoice = () => !!(classes() && typeof S === 'object' && S.party && !S.party.chosen && typeof chooseClass === 'function');

  let root = null, pick = 'warden', mode = 'new', lastFocus = null;

  function previewSpec(k) {
    if (typeof classPreviewSpec === 'function') return classPreviewSpec(k);
    if (typeof heroSpec !== 'function') return null;
    // heroSpec() reads S.party.cls; borrow it for this class, then put it back.
    const prev = S.party.cls;
    try { S.party.cls = k; return heroSpec(k); } finally { S.party.cls = prev; }
  }
  function drawPreview(cv, k) {
    cv.width = 48; cv.height = 64;
    const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.clearRect(0, 0, cv.width, cv.height);
    if (typeof drawCharPreview === 'function') {
      try { const spec = previewSpec(k); if (spec) { drawCharPreview(cv, spec, 1); return; } } catch (e) { console.error('[lanternfall] class preview', e); }
    }
    const im = sprite('create:' + k, SPR.hero, { ...HERO_PAL, 1: TINT[k] || HERO_PAL[1] });
    const z = Math.max(1, Math.floor(Math.min(cv.width / im.width, cv.height / im.height)));
    x.drawImage(im, Math.floor((cv.width - im.width * z) / 2), cv.height - im.height * z, im.width * z, im.height * z);
  }

  function build() {
    const C = classes();
    root = el('div', 'create'); root.id = 'createScreen';
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'createTitle');
    const inner = el('div', 'create-in');
    const h = el('h1', null, mode === 'new' ? 'Who carries the lantern?' : mode === 'mirror' ? 'The mirror shows another path' : 'Choose your path'); h.id = 'createTitle';
    const lede = el('p', 'create-lede', mode === 'new'
      ? 'You carry the last lantern. Pick who you are, then name yourself.'
      : mode === 'mirror'
        ? 'Pick a new class. Your level, gear and upgrades stay with you.'
        : 'Heroes now have classes. Warden fights like you always have, so one tap keeps things as they are.');
    const warn = el('p', 'create-warn', 'This choice is for good. Only a rare Mirror of Embers, dropped by bosses deep in the world, lets you change it.');
    const cards = el('div', 'ccards'); cards.setAttribute('role', 'radiogroup'); cards.setAttribute('aria-label', 'Hero class');
    const keys = ORDER.filter(k => C[k]).concat(Object.keys(C).filter(k => !ORDER.includes(k)));
    const btns = keys.map(k => {
      const c = C[k];
      const b = el('button', 'ccard'); b.type = 'button'; b.dataset.cls = k;
      b.setAttribute('role', 'radio');
      const fig = el('div', 'fig'); const cv = el('canvas', 'px'); fig.append(cv);
      const txt = el('div', 'ctxt');
      const top = el('div', 'ctop'); top.append(el('b', null, c.name || k));
      if (c.role) top.append(el('span', 'pip r-' + c.role, ROLE_NAME[c.role] || c.role));
      txt.append(top);
      if (c.pitch) txt.append(el('div', 'pitch', '"' + c.pitch + '"'));
      if (c.how) txt.append(el('div', 'how', c.how));
      if (c.ability) { const ab = el('div', 'ab'); ab.append(el('em', null, c.ability.name + ': '), document.createTextNode(c.ability.desc || '')); txt.append(ab); }
      if (mode === 'new' && STARTER[k]) txt.append(el('div', 'how', 'Starts with ' + STARTER_NAME[STARTER[k]] + '.'));
      b.append(fig, txt);
      b.addEventListener('click', () => select(k));
      b.addEventListener('keydown', e => {
        const i = keys.indexOf(k);
        const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return; e.preventDefault();
        const nk = keys[(i + d + keys.length) % keys.length]; select(nk); btns.find(x => x.dataset.cls === nk).focus();
      });
      cards.append(b);
      try { drawPreview(cv, k); } catch (e) { console.error('[lanternfall] preview', e); }
      return b;
    });
    function select(k) {
      pick = k;
      for (const b of btns) {
        const on = b.dataset.cls === k;
        b.setAttribute('aria-checked', String(on)); b.setAttribute('aria-pressed', String(on)); b.tabIndex = on ? 0 : -1;
      }
    }
    inner.append(h, lede, warn, cards);
    let nameIn = null;
    if (mode === 'new') {
      const nf = el('div', 'namefield');
      const lb = el('label', null, 'Your name'); lb.htmlFor = 'createName';
      nameIn = el('input'); nameIn.id = 'createName'; nameIn.maxLength = 16; nameIn.autocomplete = 'off';
      nameIn.value = S.name && S.name !== 'Wanderer' ? S.name.slice(0, 16) : 'Wanderer';
      nf.append(lb, nameIn); inner.append(nf);
    }
    const begin = el('button', 'big forge create-go', mode === 'new' ? 'Begin' : 'Take this path'); begin.type = 'button';
    begin.addEventListener('click', () => {
      let name;
      if (nameIn) name = nameIn.value.replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁯]/g, '').trim().slice(0, 16) || 'Wanderer';
      const wasMode = mode;
      try { chooseClass(pick, name); } catch (e) { console.error('[lanternfall] chooseClass', e); return; }
      if (name && S.name !== name) S.name = name;
      try { save(); } catch (e) {}
      if (typeof updatePortrait === 'function') updatePortrait();
      const starter = wasMode === 'new' ? ((S.party.field && S.party.field[0]) || STARTER[pick]) : null;
      if (starter && JOIN[starter]) showJoin(inner, starter);
      else { close(); toast(`You walk on as a ${C[pick].name}.`, 'good'); }
    });
    inner.append(begin);
    root.append(inner);
    select(pick);
    root.addEventListener('keydown', trapTab);
    return root;
  }

  function showJoin(inner, key) {
    inner.textContent = '';
    const box = el('div', 'join');
    box.append(el('div', 'zsub', 'A companion joins'));
    const h = el('h1', null, STARTER_NAME[key]); h.id = 'createTitle';
    box.append(h);
    for (const line of JOIN[key]) box.append(el('p', line.startsWith('"') ? 'join-say' : 'join-line', line));
    const go = el('button', 'big forge create-go', 'Into the dark'); go.type = 'button';
    go.addEventListener('click', close);
    box.append(go); inner.append(box);
    if (root) root.scrollTop = 0;
    go.focus();
  }

  function trapTab(e) {
    if (e.key !== 'Tab' || !root) return;
    const f = [...root.querySelectorAll('button, input')].filter(n => !n.disabled && n.tabIndex !== -1);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open() {
    if (root || !needsChoice()) return;
    // Mirror mode: the class was already chosen earlier in this session (useMirror reopened it).
    mode = sawChosen && S.party.cls ? 'mirror' : S.party.newGame ? 'new' : 'path';
    pick = mode === 'mirror' ? S.party.cls : 'warden';
    if (!classes()[pick]) pick = Object.keys(classes())[0];
    lastFocus = document.activeElement;
    document.body.append(build());
    const sel = root.querySelector('.ccard[aria-checked="true"]');
    (sel || root.querySelector('button')).focus();
  }
  function close() {
    if (!root) return;
    root.remove(); root = null;
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
    ui(true);
  }

  // Open now if needed, and whenever the choice reopens (a Mirror of Embers).
  let sawChosen = !!(typeof S === 'object' && S.party && S.party.chosen);
  setInterval(() => { try { if (S.party && S.party.chosen) sawChosen = true; open(); } catch (e) {} }, 1000);
  try { open(); } catch (e) { console.error('[lanternfall] create screen', e); }
}
