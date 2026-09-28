// 75-onboard-ui: progressive unlocks on screen and the guide's hints (docs/design/onboarding.md).
// Browser-only. Rules and state: 55-onboard.js. 70-ui.js leaves locked views out of the switcher
// (registerView/registerSection `feature`); this file hides locked tabs, the Gather/Raid buttons and
// the Next Up chip, announces what opened, marks new tabs and views until they are opened, draws the
// hint (a marker on the target and one sentence) and adds "Tips" to the Journal.
{
  const O = () => S.onboard;
  ONBOARD.gate = true;   // Next Up leaves out goals of systems still hidden

  // ---------------- progressive unlocks ----------------
  const MODE_FEATURE = { gather: 'gather', raid: 'raid' };
  const tabBtns = [...document.querySelectorAll('.tabs .tab')];
  const tabShown = t => t === 'adv' || shownViews(t).length > 0;
  // A view (or a tab) is "new" from its unlock until the player first opens it.
  onboardIsNew = v => !!(v && v.feature && O().got[v.feature] !== undefined && !O().seen[v.id]);
  const tabIsNew = t => t !== 'adv' && viewsOf(t).some(v => onboardIsNew(v)) && !O().seen[t];

  function applyFeatures() {
    let n = 0;
    for (const b of tabBtns) {
      const show = tabShown(b.dataset.tab);
      putHidden(b, !show); if (show) n++;
      putToggle(b, 'is-new', show && tabIsNew(b.dataset.tab));
    }
    const nav = document.querySelector('.tabs');
    // While some tabs are still hidden, the shown ones keep a tab's width instead of stretching.
    if (nav) { putStyle(nav, 'gridTemplateColumns', n < tabBtns.length ? `repeat(${Math.max(1, n)}, minmax(0, 112px))` : ''); putStyle(nav, 'justifyContent', n < tabBtns.length ? 'center' : ''); }
    // The Fight / Gather / Raid switch: a lone Fight button says nothing, so it waits for Gather.
    let modes = 0;
    for (const b of document.querySelectorAll('#modeSeg button')) {
      const show = featOk(MODE_FEATURE[b.dataset.act]) || S.activity === b.dataset.act;
      putHidden(b, !show); if (show) modes++;
    }
    putStyle($('modeSeg'), 'visibility', modes > 1 ? '' : 'hidden');
    putHidden($('nuSlot'), !featOk('nextup'));
    for (const sec of SECTIONS) if (sec.feature) putToggle(sec.el, 'f-off', !featOk(sec.feature));
    if (S.tab) { buildViewSeg(S.tab); applyView(S.tab); }
    viewDots();
  }

  // What opened, in one plain sentence. Tabs pop (high); views and smaller things are normal.
  const OPEN_TXT = {
    party: 'New tab: Party. See who fights beside you.',
    gather: 'New tab: Gather. Mine ore and chop wood.',
    camp: typeof hearthCold === 'function' && hearthCold() ? 'New tab: Camp. Build your first station there.' : 'You made camp. A new tab: Camp.',
    craft: 'New tab: Craft. Make gear from your materials.',
    nextup: 'Next Up shows your best next goal.',
    bounties: 'New on the Fight tab: Bounties.',
    bestiary: 'New on the Fight tab: Bestiary.',
    forage: 'New on the Gather tab: Foraging.',
    almanac: "New on the Camp tab: the Almanac. Check today's Omen.",
    roster: 'New on the Party tab: Roster. See who could join you.',
    exped: 'Expeditions are open on the Camp tab.',
    synergy: 'Synergies: some companions fight better together. See the Party tab.',
    uniques: 'New on the Craft tab: Uniques.',
    tavern: 'New on the Camp tab: the Tavern.',
    codex: 'The Codex is open. Find it in the Journal (the bell).',
    raid: 'The World raid is open on the Camp tab.',
    deep: 'New on the Fight tab: the Deepwell.',
    powers: 'New on the Craft tab: Powers. Learn and inscribe legendary powers.'
  };
  const TAB_FEATURE = { party: 'party', gather: 'gat', camp: 'world', craft: 'forge' };
  on('unlock', ({ id, quiet }) => {
    applyFeatures();
    if (quiet || id === '*' || !OPEN_TXT[id]) return;
    const tab = TAB_FEATURE[id];
    const ic = tab ? document.querySelector(`.tab[data-tab="${tab}"] img`) : null;
    toast(OPEN_TXT[id], 'good', ic ? ic.src : { ic: ['banner', '#F2C14E'] }, tab || id === 'nextup' ? 'high' : 'normal');
  });
  on('menuView', ({ tab, view }) => {
    const o = O();
    if (!o.seen[tab]) o.seen[tab] = 1;
    if (view && !o.seen[view]) {
      o.seen[view] = 1;
      const b = document.querySelector(`#viewSeg button[data-view="${view}"]`); if (b) b.classList.remove('is-new');
    }
    if (tab === 'party' && o.rec) o.seen.partyAfterRec = 1;
    applyFeatures();
  });
  // Other systems that open a hidden place on their own.
  on('codexOpen', () => onboardReveal('codex'));
  on('activity', () => { if (S.activity === 'raid') onboardReveal('raid'); if (S.activity === 'gather') onboardReveal('gather'); });

  // ---------------- the guide: one hint at a time ----------------
  const layer = el('div', 'ob-layer'); layer.setAttribute('aria-live', 'polite');
  const ring = el('div', 'ob-ring' + (reduced ? ' still' : ''));
  const bub = el('div', 'ob-bub'); bub.setAttribute('role', 'note');
  const arrow = el('i', 'ob-arrow');
  const txt = el('span', 'ob-txt');
  const x = el('button', 'ob-x'); x.type = 'button'; x.setAttribute('aria-label', 'Dismiss this tip'); x.textContent = '×';
  bub.append(arrow, txt, x);
  layer.append(ring, bub);
  layer.hidden = true;
  document.body.append(layer);
  let cur = null;   // the step on screen
  x.addEventListener('click', e => { e.stopPropagation(); if (cur) onboardDone(cur.id); tick(); });
  const chip = $('nuChip');
  if (chip) chip.addEventListener('click', () => onboardDone('nextup'));

  const q = s => document.querySelector(s);
  const onGame = () => isWide() || !S.tab;   // the stage is on screen
  const vis = n => !!(n && n.getClientRects().length && n.offsetParent !== null);
  const first = nm => String(nm || '').split(' ')[0];
  // Menu path: open the tab, then the view, then point at the thing.
  function path(tab, view, sel, words) {
    if (S.tab !== tab) return { node: q(`.tab[data-tab="${tab}"]`), text: words[0] };
    if (view && curView(tab) !== view) return { node: q(`#viewSeg button[data-view="${view}"]`), text: words[1] };
    const n = typeof sel === 'function' ? sel() : q(sel);
    return { node: n, text: words[2] };
  }
  // step id -> () => { node, text, at?: [fx, fy] (a point inside node) } | null
  // The cold Hearth (H1): the fire's button lives on the stage (63d-scenery-camp.js).
  const cold = () => typeof hearthCold === 'function' && hearthCold();
  const atGrove = () => target() === 'node' && S.node.kind === 'wood';
  const campPath = (id, words) => path('world', 'camp', `#camp-b-${id} .cb-quick`, words);
  const STEP_UI = {
    chop: () => onGame() && atGrove() ? { node: $('stage'), at: [0.74, 0.62], side: 'up', text: 'Tap the tree to chop faster.' } : null,
    light: () => {
      if (!onGame()) return null;
      const f = $('hearthFire');
      if (atGrove() && f && !f.hidden) return { node: f, round: true, side: 'up', text: 'Tap the fire to light it.' };
      if (S.activity !== 'gather') return { node: q('#modeSeg button[data-act="gather"]'), text: hearthCan().ok ? 'Tap Gather, then light the fire.' : 'Tap Gather to chop Oak for the fire.' };
      return null;
    },
    bench: () => campPath('bench', ['The fire burns. Open Camp to build.', 'Open Camp.', 'Build the Workbench. It makes tools.']),
    tool: () => {
      if (S.tab !== 'forge') return { node: q('.tab[data-tab="forge"]'), text: 'The Workbench is built. Open Craft.' };
      if (curView('forge') !== 'make') return { node: q('#viewSeg button[data-view="make"]'), text: 'Open Make.' };
      const st = q('.cf-st[data-st="bench"]');
      if (st && st.getAttribute('aria-pressed') !== 'true') return { node: st, text: 'Tap the Workbench.' };
      return { node: q('#sec-craft-recipes .cf-rec[data-kind="pick"] .cf-go'), side: 'up', text: 'Make a Copper Pickaxe.' };
    },
    forge: () => campPath('forge', ['Open Camp to build the Forge.', 'Open Camp.', 'Build the Forge for your weapon.']),
    store: () => campPath('store', ['Your packs are nearly full. Open Camp.', 'Open Camp.', 'Your packs are nearly full. Build a Storehouse.']),
    tap: () => onGame() && target() === 'mob' ? { node: $('stage'), at: [0.78, 0.7], text: cold() ? 'The road is dark. Tap a foe to strike.' : 'Tap the foe to strike.' } : null,
    ability: () => {
      const n = q('#stage .abil'), a = typeof abilityInfo === 'function' ? abilityInfo() : null;
      return onGame() && a ? { node: n, round: true, text: `${a.name} is ready. Tap it.` } : null;
    },
    boss: () => onGame() && mob && mob.boss ? { node: $('stage'), at: [0.78, 0.7], side: 'up', text: 'A boss! Beat it before the timer runs out.' } : null,
    upgrade: () => Object.assign(path('adv', 'upgrades', () => q('#heroRows .buy:not(:disabled)') || q('#heroRows .buy'),
      ['You have gold. Open Fight to spend it.', 'Open Upgrades.', 'Buy an upgrade to hit harder.']), { side: S.tab === 'adv' ? 'up' : '' }),
    'tab:party': () => S.tab === 'party' ? null : { node: q('.tab[data-tab="party"]'), text: 'New tab: Party. Tap it to meet your team.' },
    'tab:gat': () => S.tab === 'gat' ? null : { node: q('.tab[data-tab="gat"]'), text: 'New tab: Gather. Tap it to see what you can mine.' },
    'tab:world': () => S.tab === 'world' ? null : { node: q('.tab[data-tab="world"]'), text: 'You made camp. Tap Camp to build.' },
    'tab:forge': () => S.tab === 'forge' ? null : { node: q('.tab[data-tab="forge"]'), text: 'New tab: Craft. Tap it to make gear.' },
    nextup: () => onGame() ? { node: chip, text: 'Next Up shows your best next goal. Tap it.' } : null,
    recruit: () => {
      const rec = O().rec;
      if (rec) return S.tab === 'party' ? null : { node: q('.tab[data-tab="party"]'), text: `${first(ROSTER[rec] && ROSTER[rec].name)} joined you. Open Party to see your team.` };
      return path('party', 'roster', () => q('#sec-party-roster .rtile.locked.ready') || q('#sec-party-roster .rtile.ready') || q('#sec-party-roster'),
        ['Someone can join you. Open Party.', 'Open Roster.', 'Tap them, then Recruit.']);
    }
  };

  const BLOCK = '.create, .join-ov, .away-ov, .bsheet-ov, .modal, .dw-ov';
  let lastKey = '';
  function hide() { if (!layer.hidden) layer.hidden = true; cur = null; lastKey = ''; }
  function tick() {
    let step = null;
    try { step = onboardStep(); } catch (e) { console.error('[lanternfall] onboard step', e); }
    if (!step || document.hidden || q(BLOCK)) return hide();
    let spec = null;
    try { spec = STEP_UI[step.id] ? STEP_UI[step.id]() : null; } catch (e) { spec = null; }
    if (!spec || !vis(spec.node)) return hide();
    cur = step;
    place(spec);
  }
  function place(spec) {
    const r = spec.node.getBoundingClientRect(), vh = innerHeight;
    const app = $('app').getBoundingClientRect();
    // the marker: a ring around the node, or a round mark at a point inside it
    let rx, ry, rw, rh;
    if (spec.at) { const d = 58; rx = r.left + r.width * spec.at[0] - d / 2; ry = r.top + r.height * spec.at[1] - d / 2; rw = rh = d; }
    else { rx = r.left - 4; ry = r.top - 4; rw = r.width + 8; rh = r.height + 8; }
    ring.classList.toggle('dot', !!(spec.at || spec.round));
    putStyle(ring, 'transform', `translate(${Math.round(rx)}px, ${Math.round(ry)}px)`);
    putStyle(ring, 'width', Math.round(rw) + 'px'); putStyle(ring, 'height', Math.round(rh) + 'px');
    if (txt.textContent !== spec.text) txt.textContent = spec.text;
    const key = spec.text;
    if (key !== lastKey) { lastKey = key; bub.classList.remove('pop'); if (!reduced) { void bub.offsetWidth; bub.classList.add('pop'); } }
    if (layer.hidden) layer.hidden = false;
    // the sentence: below the marker if it fits, else above; kept inside the app column
    const bw = Math.min(300, app.width - 24), bh = bub.offsetHeight || 48;
    const cx = rx + rw / 2;
    const fitsBelow = ry + rh + 12 + bh < vh - 8, fitsAbove = ry - 12 - bh > 8;
    const below = spec.side === 'up' && fitsAbove ? false : spec.side === 'down' && fitsBelow ? true : fitsBelow && ry + rh / 2 < vh * 0.55;
    const left = Math.max(app.left + 12, Math.min(app.right - 12 - bw, cx - bw / 2));
    const top = below ? ry + rh + 12 : Math.max(8, ry - 12 - bh);
    putStyle(bub, 'width', bw + 'px');
    putStyle(bub, 'transform', `translate(${Math.round(left)}px, ${Math.round(top)}px)`);
    bub.classList.toggle('up', !below);
    putStyle(arrow, 'left', Math.round(Math.max(12, Math.min(bw - 12, cx - left))) + 'px');
  }
  setInterval(tick, 250);
  addEventListener('resize', () => { lastKey = ''; tick(); });
  on('onboardStep', () => setTimeout(tick, 0));

  // ---------------- Journal: Tips ----------------
  registerSection('log', {
    id: 'onboard-tips', title: 'Tips',
    mount(sec) {
      sec.classList.add('ob-tips');
      sec.parentNode.prepend(sec);   // first in the Journal while it matters
      const row = el('div', 'ob-trow'), p = el('p', 'note'), b = el('button', 'ob-tbtn'); b.type = 'button';
      row.append(p, b);
      const row2 = el('div', 'ob-trow'), p2 = el('p', 'note', 'New tabs open as you play.'), b2 = el('button', 'ob-tbtn', 'Show every tab now'); b2.type = 'button';
      row2.append(p2, b2);
      sec.append(row, row2);
      b.addEventListener('click', () => { onboardTips(); save(); tick(); sec._up(true); });
      b2.addEventListener('click', () => { onboardUnlockAll(); save(); sec._up(true); });
      sec._up = () => {
        const over = GUIDE_STEPS.every(s => O().done[s.id]);
        putHidden(sec, O().all && over);
        putHidden(row, over);
        putText(p, O().tips ? 'Short tips point at what to try next.' : 'Tips are off.');
        putText(b, O().tips ? 'Skip tips' : 'Show tips');
        putHidden(row2, O().all);
      };
    },
    update() { const s = $('sec-onboard-tips'); if (s && s._up) s._up(); }
  });

  applyFeatures();
  tick();
}
