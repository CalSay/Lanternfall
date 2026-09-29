// 76-create: character creation (new games), the one-time "Choose your path" screen (existing saves,
// and again after a Mirror of Embers), the free switch (S2) and the class card rows on the hero sheet.
// Browser-only. S2 (classes-2 1, 3.4, 7.2): the picker offers the three base classes (CLASS_BASES,
// 24-data-classes.js) and chooses through chooseBase (55-classes.js). drawCharPreview/heroSpec (60b-baker.js,
// A2) are optional. Without CLASS_DEFS or S.party the screen never opens.
//
// classUI (read by 75-party-sheet.js): rows() -> [el] the class card's extra rows (passives, the evolution
// row, the locked second-tier row, what changed for a migrated save); switchRow() -> el | null (the free
// switch, while it is open); sig() -> a string that changes when those rows would; open(mode).
var classUI;
{
  const ORDER = CLASS_BASES;
  const ROLE_NAME = { tank: 'Tank', striker: 'Striker', caster: 'Caster', support: 'Support' };
  const WEIGHT_NAME = { heavy: 'Heavy armour', medium: 'Medium armour', light: 'Light armour' };
  const HOME_NAME = { front: 'Front', mid: 'Middle', back: 'Back' };
  const STARTER = { warrior: 'wren', mage: 'tobin', ranger: 'tobin' };
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
  const TINT = { warrior: '#3E63C9', mage: '#8A4FC9', ranger: '#3E8A4E' };
  // A migrated save's "What changed" (classes-2 7.2): three points per old class.
  const CHANGED = {
    warden: ['Your class is called Warrior now. The Warden is its path, and it is yours.',
      'Guard stacks are Grit now. Each one also cuts the damage you take by 1%.',
      'Shield Wall: 50% less damage taken and 20% more dealt (was 60% and 30%). You block 10% of hits.'],
    ranger: ['You are still a Ranger, and sturdier: more health and 10 armour.',
      'Your base crit chance is 15% (was 8%).', 'Your Proving opens after the Fenmother.'],
    lanternmage: ['You are still a Lanternmage.', 'Lantern Flare now sets the whole pack burning. Burn spreads when a burning foe dies.',
      'Your Proving opens after the Fenmother.'],
    lightkeeper: ["You are a Lanternmage on the Lightkeeper's path.", 'You keep your Blessing, Rally Hymn and Lightkeeper stars.',
      'New Lightkeeper powers come in a later update.']
  };

  const classes = () => (typeof CLASS_DEFS === 'object' && CLASS_DEFS && typeof HERO_CLASSES === 'object') ? CLASS_DEFS : null;
  const needsChoice = () => !!(classes() && typeof S === 'object' && S.party && !S.party.chosen && typeof chooseBase === 'function');

  let root = null, pick = 'warrior', mode = 'new', lastFocus = null, armed = false;

  function previewSpec(k) {
    const kit = CLASS_DEFS[k] ? CLASS_DEFS[k].kit : k;
    if (typeof classPreviewSpec === 'function') return classPreviewSpec(kit);
    if (typeof heroSpec !== 'function') return null;
    // heroSpec() reads S.party.cls (the kit key); borrow it for this class, then put it back.
    const prev = S.party.cls;
    try { S.party.cls = kit; return heroSpec(kit); } finally { S.party.cls = prev; }
  }
  function drawPreview(cv, k) {
    cv.width = 56; cv.height = 100; // B1 sprites: about 70 CSS px tall, staffs reach higher
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
    const h = el('h1', null, mode === 'new' ? 'Who carries the lantern?' : mode === 'mirror' ? 'The mirror shows another path'
      : mode === 'switch' ? 'Change your class' : 'Choose your path'); h.id = 'createTitle';
    const lede = el('p', 'create-lede', mode === 'new'
      ? 'You carry one of the last lanterns. Pick who you are, then name yourself.'
      : mode === 'mirror'
        ? 'Pick a new class. Your level, gear and upgrades stay with you.'
        : mode === 'switch'
          ? 'Changed your mind? Pick another class. Your level, gear and upgrades stay with you.'
          : 'Heroes now have classes. The Warrior fights like you always have, so one tap keeps things as they are.');
    const mins = CLS_TUNE.secondThoughtsMin;
    const warn = el('p', 'create-warn', mode === 'switch'
      ? 'This uses your one free change. After it, only a rare Mirror of Embers lets you change class.'
      : `You can change your mind once, free, in the first ${mins} minutes. After that only a rare Mirror of Embers, dropped by bosses deep in the world, lets you change it.`);
    const cards = el('div', 'ccards'); cards.setAttribute('role', 'radiogroup'); cards.setAttribute('aria-label', 'Hero class');
    const keys = ORDER.filter(k => C[k]);
    const figs = [];
    const btns = keys.map(k => {
      const c = C[k];
      const b = el('button', 'ccard'); b.type = 'button'; b.dataset.cls = k;
      b.setAttribute('role', 'radio');
      const fig = el('div', 'fig'); const cv = el('canvas', 'px'); fig.append(cv);
      const txt = el('div', 'ctxt');
      const top = el('div', 'ctop'); top.append(el('b', null, c.name || k));
      if (c.role) top.append(el('span', 'pip r-' + c.role, ROLE_NAME[c.role] || c.role));
      txt.append(top);
      txt.append(el('div', 'cl-wt', `${WEIGHT_NAME[c.weight] || ''} · ${HOME_NAME[c.home] || ''}`));
      if (c.pitch) txt.append(el('div', 'pitch', '"' + c.pitch + '"'));
      if (c.how) txt.append(el('div', 'how', c.how));
      const ab1 = CLASS_ABILITIES[c.ab1];
      if (ab1) { const ab = el('div', 'ab'); ab.append(el('em', null, ab1.name + ': '), document.createTextNode(ab1.desc || '')); txt.append(ab); }
      if (mode === 'switch' && S.cls && S.cls.base === k) txt.append(el('div', 'how', 'Your class now.'));
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
      cv.width = 56; cv.height = 100;
      figs.push([cv, k]);
      return b;
    });
    // Each class figure bakes a character (tens of ms on a slow phone): draw them after the first
    // frame, one per task, in card order, so the screen and the stage show at once.
    const figQueue = figs.slice(), built = root;
    const nextFig = () => {
      if (root !== built || !figQueue.length) return;
      const [cv, k] = figQueue.shift();
      try { drawPreview(cv, k); } catch (e) { console.error('[lanternfall] preview', e); }
      if (figQueue.length) setTimeout(nextFig, 0);
    };
    requestAnimationFrame(() => setTimeout(nextFig, 0));
    function select(k) {
      pick = k; armed = false;
      if (begin) putText(begin, goLabel());
      for (const b of btns) {
        const on = b.dataset.cls === k;
        b.setAttribute('aria-checked', String(on)); b.setAttribute('aria-pressed', String(on)); b.tabIndex = on ? 0 : -1;
      }
    }
    let begin = null;
    inner.append(h, lede, warn, cards);
    let nameIn = null;
    if (mode === 'new') {
      const nf = el('div', 'namefield');
      const lb = el('label', null, 'Your name'); lb.htmlFor = 'createName';
      nameIn = el('input'); nameIn.id = 'createName'; nameIn.maxLength = 16; nameIn.autocomplete = 'off';
      nameIn.value = S.name && S.name !== 'Wanderer' ? S.name.slice(0, 16) : 'Wanderer';
      nf.append(lb, nameIn); inner.append(nf);
    }
    function goLabel() {
      if (mode !== 'switch') return mode === 'new' ? 'Begin' : 'Take this path';
      if (S.cls && S.cls.base === pick) return 'Keep my class';
      return armed ? `Tap again: become a ${C[pick].name}` : `Switch to ${C[pick].name}`;
    }
    begin = el('button', 'big forge create-go', goLabel()); begin.type = 'button';
    begin.addEventListener('click', () => {
      let name;
      if (nameIn) name = nameIn.value.replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁯]/g, '').trim().slice(0, 16) || 'Wanderer';
      const wasMode = mode;
      if (mode === 'switch') {
        // In-page confirm: the first tap arms, the second switches (the free change is used once).
        if (S.cls && S.cls.base === pick) { close(); return; }
        if (!armed) { armed = true; putText(begin, goLabel()); return; }
        let okd = false;
        try { okd = chooseBase(pick); } catch (e) { console.error('[lanternfall] chooseBase', e); }
        try { save(); } catch (e) {}
        close();
        if (!okd) toast('The free change has run out. A Mirror of Embers can still change your class.', 'raid');
        return;
      }
      try { if (!chooseBase(pick, { name })) return; } catch (e) { console.error('[lanternfall] chooseBase', e); return; }
      if (name && S.name !== name) S.name = name;
      try { save(); } catch (e) {}
      if (typeof updatePortrait === 'function') updatePortrait();
      const starter = wasMode === 'new' ? ((S.party.field && S.party.field[0]) || STARTER[pick]) : null;
      if (starter && JOIN[starter]) showJoin(inner, starter);
      else { close(); toast(`You walk on as a ${C[pick].name}.`, 'good'); }
    });
    inner.append(begin);
    if (mode === 'switch') {
      const back = el('button', 'textlink create-back', 'Keep my class'); back.type = 'button';
      back.addEventListener('click', close);
      inner.append(back);
      root.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    }
    root.append(inner);
    select(pick);
    root.addEventListener('keydown', trapTab);
    return root;
  }

  function showJoin(inner, key) {
    inner.textContent = '';
    const box = el('div', 'join');
    const top = el('div'); // one child, so the line-by-line animation delays stay as they were
    if (typeof drawCharPreview === 'function' && typeof companionSpec === 'function') {
      const cv = el('canvas', 'join-fig'); cv.width = 120; cv.height = 156;
      try { drawCharPreview(cv, companionSpec(key), 2); top.append(cv); } catch (e) { console.error('[lanternfall] join figure', e); }
    }
    top.append(el('div', 'zsub', 'A companion joins'));
    box.append(top);
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

  function open(want) {
    if (root) return;
    if (want === 'switch') {
      if (!classes() || typeof clsSwitchInfo !== 'function' || !clsSwitchInfo().ok) return;
      mode = 'switch';
    } else {
      if (!needsChoice()) return;
      // Mirror mode: the class was already chosen earlier in this session (useMirror reopened it).
      mode = sawChosen && S.party.cls ? 'mirror' : S.party.newGame ? 'new' : 'path';
    }
    const base = S.cls && S.cls.base;
    pick = (mode === 'mirror' || mode === 'switch') && base ? base : 'warrior';
    if (!classes()[pick]) pick = ORDER[0];
    armed = false;
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
      // The evolution: granted (a migrated Warden or Lightkeeper), or the two paths and their gate.
      if (info.evo) {
        const txt = info.evo === 'priest'
          ? 'You keep your Blessing, Rally Hymn and Lightkeeper stars. New Lightkeeper powers come in a later update.'
          : `You play the ${d.name}'s kit for now. The ${info.evoName}'s own powers come in a later update.`;
        const r = row(`Path: ${info.evoName}`, info.proven ? info.evoTitle : 'Granted', txt, 'cl-evo');
        if (!info.proven) r.append(el('p', 'cl-note', `The title ${info.evoTitle} waits for your Proving, after the Fenmother.`));
        out.push(r);
      } else {
        const names = info.paths.map(x => `${x.name} (${x.kind})`).join(' or ');
        const r = row('Evolution', 'Locked', `Two paths open after the Fenmother: ${names}. The choice is for good.`, 'cl-evo off');
        const chips = el('div', 'cl-chips');
        chips.append(chip('Beat the Fenmother', info.gate.bossOk), chip(`Level ${info.gate.lv}`, info.gate.lvOk));
        r.append(chips);
        if (info.gate.open) r.append(el('p', 'cl-note', 'The Proving comes in a later update.'));
        out.push(r);
      }
      out.push(row('Second path', 'Locked', 'A second path opens in a later season.', 'off'));
      if (info.migrated && CHANGED[info.from]) {
        const det = el('details', 'cl-changed');
        det.append(el('summary', null, 'What changed'));
        const ul = el('ul'); for (const t of CHANGED[info.from]) ul.append(el('li', null, t));
        det.append(ul);
        out.push(det);
      }
      return out;
    },
    head() {
      const info = typeof clsInfo === 'function' ? clsInfo() : null;
      if (!info) return '';
      const d = CLASS_DEFS[info.base];
      return `${WEIGHT_NAME[d.weight]} · ${HOME_NAME[d.home]}`;
    },
    switchRow() {
      const sw = typeof clsSwitchInfo === 'function' ? clsSwitchInfo() : null;
      if (!sw || !sw.ok) return null;
      const m = Math.max(1, Math.ceil(sw.left / 60e3));
      const box = el('div', 'cs-mirror cl-switch');
      const t = el('div'); t.append(el('b', null, 'Free change'), el('small', null, `Changed your mind? Switch class for free. Once only, ${m} more minute${m === 1 ? '' : 's'}.`));
      const b = el('button', 'mini go', 'Switch'); b.type = 'button';
      b.addEventListener('click', () => { if (typeof partySheet === 'object' && partySheet) partySheet.close(); open('switch'); });
      box.append(t, b);
      return box;
    },
    sig() {
      const sw = typeof clsSwitchInfo === 'function' ? clsSwitchInfo() : null, c = S.cls || {};
      return [c.base, c.evo, JSON.stringify(c.proven || {}), sw && sw.ok ? Math.ceil(sw.left / 60e3) : 0, S.L >= CLS_TUNE.evoLv, S.maxZone].join('/');
    },
    open
  };

  // Open now if needed, and whenever the choice reopens (a Mirror of Embers).
  let sawChosen = !!(typeof S === 'object' && S.party && S.party.chosen);
  setInterval(() => { try { if (S.party && S.party.chosen) sawChosen = true; open(); } catch (e) {} }, 1000);
  try { open(); } catch (e) { console.error('[lanternfall] create screen', e); }
}
