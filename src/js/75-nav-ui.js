// 75-nav-ui: global navigation in the browser (task UX-A, docs/design/ux-overhaul.md 4.1-4.5).
// Rules and state: 55-nav.js. Browser-only.
//   - The activity pill in the header ("Mining · Copper Vein", "Fighting · Zone 37"), visible over
//     every menu. Gold edge while gathering, red when the cell you work is full. Tap: the quick
//     switcher. NAV_TUNE.pillReplacesName picks the header variant (spec 9.3): true = the pill takes
//     the name's place (the XP bar becomes a 3 px line along the header's bottom edge); false = the
//     name stays and the pill is a smaller second line under it. The pill updates from ui()
//     (uiHooks) and writes only when its text changes: nothing runs per frame.
//   - The quick switcher (a small sheet): Fight at your zone, each open skill's last node, up to 3
//     recent places, "All nodes ›" and "Raid ›" (online only). One tap switches the activity and
//     closes the sheet and any open menu (UX-L1: in landscape too, so you see the stage).
//   - The control row (4.3): [Fight · Z37] [Mining] [Switch]. Fight names the zone while you do something
//     else, the Gather button the skill it resumes, Switch opens the switcher. Raid left the row (approved):
//     the switcher has a Raid row online.
//   - Swipe sideways on a menu's content: the next or previous view of that tab (56 px, or a flick
//     over 0.4 px/ms; never from [data-noswipe], sliders, the star map, drag slots or sideways scrollers).
//   - navGo { close: true } (55-nav) closes sheets and menus here.
// Exposed: navUI { openSwitcher(), pill }

// wire-menu-icons: labels keep their meaning; the approved pack supplies decorative art.
// A function declaration lets the earlier menu renderer use this even during registration.
function menuNavIcon(button, view) {
  const icons = {
    upgrades: 'boss', bounties: 'bounties', bestiary: 'bestiary', deep: 'deepwell',
    team: 'hero', abilities: 'hero', training: 'training', stars: 'stars',
    mine: 'mining', wood: 'woodcutting', forage: 'foraging', hunt: 'hunting', pack: 'storehouse',
    make: 'craft', gear: 'gear', uniques: 'uniques', camp: 'camp', tav: 'tavern', almanac: 'almanac', raid: 'raid',
    'ach-deeds': 'deeds', 'ach-tracks': 'tracks', 'ach-feats': 'feats', 'ach-looks': 'looks',
    notes: 'notices', journal: 'journal', act: 'adventure', next: 'next-up', switch: 'switch-view', codex: 'codex', close: 'close'
  };
  const id = icons[view]; if (!id || button.querySelector('.menu-nav-ic')) return;
  const im = el('img', 'menu-nav-ic px'); im.alt = ''; im.setAttribute('aria-hidden', 'true');
  nicSet(im, 'nav', id, 16); button.prepend(im);
}

// Separate status art from the ability tiles (75-solo-ui is a hot file).
function menuActionBadge(button) {
  if (button.matches('.sp-ab')) return button.classList.contains('on') ? 'selected' : '';
  if (button._nv === 'T3') return 'locked';
  if (button.classList.contains('cool')) return 'cooldown';
  if (button.classList.contains('off') || button.classList.contains('blocked') || button.classList.contains('empty') || button.classList.contains('passive')) return 'unavailable';
  return 'ready';
}
{
  const decorate = () => {
    for (const [selector, view] of [['#menuX', 'close'], ['#switchBtn', 'switch'], ['#nuChip .nu-eye', 'next'],
      ['.sb-tab[data-tab="act"]', 'act'], ['.cx-backbtn', 'codex']]) {
      for (const b of document.querySelectorAll(selector)) menuNavIcon(b, view);
    }
    // The Codex's Journal entry is mounted lazily along with other Journal sections.
    for (const b of document.querySelectorAll('#sec-codex-card button')) {
      if (b.textContent.includes('Open')) menuNavIcon(b, 'codex');
    }
  };
  uiHooks.push(decorate);
  const updateBadges = () => {
    for (const b of document.querySelectorAll('#soloBar .sbtn, #abPicker .sp-ab')) {
      const id = menuActionBadge(b);
      let im = b.querySelector('.menu-action-badge');
      if (!id) { if (im) im.hidden = true; continue; }
      if (!im) { im = el('img', 'menu-action-badge px'); im.alt = ''; im.setAttribute('aria-hidden', 'true'); b.append(im); }
      im.hidden = false;
      if (!im._nic || im._nic.id !== id) nicSet(im, 'act', id, 16);
    }
  };
  // Existing UI state is authoritative, including cooldowns and paused pickers; no save writes.
  let elapsed = 0;
  onTick(dt => { elapsed += dt; if (elapsed >= 0.1) { elapsed = 0; updateBadges(); } });
  setInterval(() => { decorate(); updateBadges(); }, 250);
}

let navUI = null;
{
  const ICON_OF = {
    fight: () => iconURL('sword', '#A9B1BD'),
    mine: () => iconURL('pick', '#D08A4E'),
    wood: () => iconURL('axe', '#A9B1BD'),
    forage: () => iconURL(...craftIcon('sickle', 1)),
    raid: () => iconURL('banner', '#E0524F'),
    deep: () => iconURL('flame', '#7FB2FF', { 5: '#CFE3FF', 7: '#FFFFFF' })
  };
  // C26: the approved menu icons (NAV_ICONS) where the pack has one; ICON_OF stays the fallback
  const NAV_OF = { fight: 'fight', mine: 'mining', wood: 'woodcutting', forage: 'foraging', hunt: 'hunting', raid: 'raid', deep: 'deepwell', gather: 'gather' };
  const setNav = (im, k, px) => { if (!nicSet(im, 'nav', NAV_OF[k], px)) im.src = (ICON_OF[k] || ICON_OF.fight)(); };
  const btn = (cls, txt) => { const b = el('button', cls, txt); b.type = 'button'; return b; };

  // ---------------- the pill ----------------
  const top = document.querySelector('.top'), who = top.querySelector('.who');
  const pill = btn('act-pill'); pill.id = 'actPill';
  pill.setAttribute('aria-haspopup', 'dialog');
  const pIc = img(ICON_OF.fight(), 'px ap-ic'), pTx = el('span', 'ap-tx', 'Fighting'), pCh = el('span', 'ap-chev');
  pCh.setAttribute('aria-hidden', 'true');
  pill.append(pIc, pTx, pCh);
  $('hName').after(pill);
  top.classList.add(NAV_TUNE.pillReplacesName ? 'nav-pill' : 'nav-line');
  pill.addEventListener('click', () => openSwitcher());
  let pSig = '', pIcon = '';
  function updatePill() {
    // W1-D (playtest-2 P2-2): a phone-width header has room for about 100 px of text, so the pill drops the activity word
    // (its icon says it) and shows "Zone 12" or "Pine Grove"; the aria label keeps the whole line
    const n = navNow(), narrow = innerWidth <= 420 && !!n.short, sig = (narrow ? n.short : n.text) + '|' + n.act + '|' + (n.full ? 1 : 0);
    if (sig === pSig) return;
    pSig = sig;
    putText(pTx, narrow ? n.short : n.text);
    if (n.icon !== pIcon) { pIcon = n.icon; setNav(pIc, ICON_OF[n.icon] || NAV_OF[n.icon] ? n.icon : 'fight', 18); }
    putClass(pill, 'act-pill ' + n.act + (n.full ? ' full' : ''));
    putAttr(pill, 'aria-label', `${n.text}. Switch activity`);
  }
  uiHooks.push(updatePill);
  addEventListener('resize', () => { pSig = ''; updatePill(); });

  // ---------------- the control row ----------------
  const gBtn = document.querySelector('#modeSeg button[data-act="gather"]');
  const gIc = img(ICON_OF.mine(), 'px mode-ic'), gTx = el('span', 'mode-tx', 'Gather');
  gBtn.textContent = ''; gBtn.append(gIc, gTx);
  const sw = btn('ctrl-switch'); sw.id = 'switchBtn';
  sw.append(el('span', 'nvs-tx', 'Switch'), el('span', 'nvs-chev'));
  sw.setAttribute('aria-haspopup', 'dialog'); sw.setAttribute('aria-label', 'Switch activity');
  $('modeSeg').after(sw);
  sw.addEventListener('click', () => openSwitcher());
  let gSk = '';
  uiHooks.push(() => {
    // A cold Hearth before the fire keeps "Gather" (the guide says "Tap Gather").
    const cold = typeof hearthCold === 'function' && hearthCold() && typeof hearthLit === 'function' && !hearthLit();
    const sk = cold ? 'gather' : skillOf(S.node.kind);
    if (sk !== gSk) {
      gSk = sk;
      setNav(gIc, ICON_OF[sk] || NAV_OF[sk] ? sk : ICON_OF[skillOf(S.node.kind)] ? skillOf(S.node.kind) : 'mine', 16);
      gTx.textContent = sk === 'wood' ? 'Wood' : SKILL[sk] || 'Gather';
      gBtn.setAttribute('aria-label', `Gather: ${SKILL[sk] || ''}`.trim());
    }
    // Fight names the zone it goes back to while you do something else (the stepper shows it while you fight).
    putText(fBtn, S.activity === 'fight' ? 'Fight' : `Fight · Z${S.zone}`);
    // Nothing to switch to yet (a new game's first fights): the button waits, as the mode buttons do.
    putHidden(sw, !navSkills().length && S.activity === 'fight');
  });
  const fBtn = document.querySelector('#modeSeg button[data-act="fight"]');

  // ---------------- closing on a switch ----------------
  function closeSheets() { for (const x of document.querySelectorAll('.bsheet-ov .bsheet-x')) x.click(); }
  on('navGo', ({ place, ok }) => {
    if (ok && place && place.close) { closeSheets(); closeMenu(); }
    ui(true);
  });

  // ---------------- the quick switcher ----------------
  const shortTime = s => fmtTime(s).replace(/ \d+s$/, '').replace(/ 0m$/, '');
  function row(list, { icon, title, meta, here, label, cls, go, off }) {
    const r = el('div', 'nv-row' + (here ? ' here' : '') + (off ? ' off' : ''));
    const ic = el('div', 'ic nv-ic'); ic.append(img(icon));
    const body = el('div', 'nv-body'); body.append(el('div', 'nv-t', title), el('div', 'nv-m', meta));
    const b = btn('nv-act' + (here ? ' here' : cls ? ' ' + cls : ''), here ? 'Here' : label);
    b.disabled = !!(here || off);
    r.append(ic, body, b);
    const pick = () => { if (!here && !off) go(); };
    r.addEventListener('click', e => { if (e.target !== b) pick(); });
    b.addEventListener('click', pick);
    list.append(r);
    return r;
  }
  function openSwitcher() {
    if (typeof openSheet !== 'function') return;
    openSheet(api => {
      api.sheet.classList.add('nv-sheet');
      const pickGo = place => { api.close(true); navGo(Object.assign({ close: true }, place)); };
      const head = el('div', 'nv-head');
      head.append(el('h2', 'nv-title', 'Switch activity'), el('span', 'nv-hint', 'Menus close when you pick'));
      const list = el('div', 'dz-list nv-list');
      const now = navNow(), deep = now.act === 'deep';
      if (deep) row(list, { icon: ICON_OF.deep(), title: `Deepwell · Floor ${now.floor}`, meta: 'Now · climb out to switch', here: true });
      if (S.activity === 'raid') row(list, { icon: ICON_OF.raid(), title: now.text, meta: 'Now', here: true });
      const fighting = S.activity === 'fight' && !deep;
      row(list, {
        icon: ICON_OF.fight(), title: `Fight · Zone ${S.zone}`, off: deep,
        meta: `${zoneName(S.zone)} · ` + (fighting ? 'Now' : bossReady() ? 'zone boss next' : `fight ${S.kills + 1} of ${ZONE_FIGHTS}`),
        here: fighting, label: 'Fight', cls: 'fight', go: () => pickGo({ act: 'fight' })
      });
      for (const sk of navSkills()) {
        const here = S.activity === 'gather' && skillOf(S.node.kind) === sk;
        const nd = here ? S.node : navLast(sk), { kind, t } = nd;
        const left = here ? navFullIn(kind, t) : Infinity, full = typeof stashFull === 'function' && stashFull(kind, t);
        row(list, {
          icon: matIcon(kind, t), title: `${SKILL[sk]} · ${NODE_NAMES[kind][t - 1]}`, off: deep,
          meta: (here ? 'Now' : 'Last node') + ` · ${gxHeld(kind, t)}` + (full ? ' · full' : here && Number.isFinite(left) ? ` · full in ${shortTime(left)}` : ''),
          here, label: NAV_VERB[kind], go: () => pickGo({ act: 'gather', node: { kind, t } })
        });
      }
      // The raid (online only; Raid left the control row): march from here.
      const raidOk = online.ready && online.canWrite && (typeof isUnlocked !== 'function' || isUnlocked('raid'));
      if (raidOk && S.activity !== 'raid') row(list, { icon: ICON_OF.raid(), title: `Raid · ${online.world && online.world.name ? online.world.name : 'the world boss'}`, off: deep, meta: 'Every raider fights the same boss', label: 'March', go: () => pickGo({ act: 'raid' }) });
      api.body.append(head, list);
      const rec = deep ? [] : navRecent();
      if (rec.length) {
        const rh = el('h3', 'sec-title nv-rh', 'Recent'), chips = el('div', 'nv-chips');
        for (const p of rec) {
          const label = p.k === 'node' ? NODE_NAMES[p.kind][p.t - 1] : p.k === 'boss' ? `Zone ${p.z} boss` : `Deepwell · Floor ${p.floor}`;
          const c = btn('nv-chip', label);
          c.addEventListener('click', () => pickGo(p.k === 'node' ? { act: 'gather', node: { kind: p.kind, t: p.t } } : p.k === 'boss' ? { act: 'fight', zone: p.z } : { act: 'deep' }));
          chips.append(c);
        }
        api.body.append(rh, chips);
      }
      const links = el('div', 'nv-links');
      const skNow = S.activity === 'gather' ? skillOf(S.node.kind) : navSkills()[0];
      if (skNow) {
        const all = btn('nv-link', 'All nodes ›');
        all.addEventListener('click', () => { api.close(true); setTab(GX_VIEW[skNow] || 'gat'); });
        links.append(all);
      }
      if (VIEW_OF.map) {   // the World map (task W1) once it exists
        const mp = btn('nv-link', 'Map ›');
        mp.addEventListener('click', () => { api.close(true); setTab('map'); });
        links.append(mp);
      }
      if (online.ready && typeof isUnlocked === 'function' && isUnlocked('raid')) {
        const rd = btn('nv-link', 'Raid ›');
        rd.addEventListener('click', () => { api.close(true); setTab('raid'); });
        links.append(rd);
      }
      if (links.children.length) api.body.append(links);
    }, { small: true, label: 'Switch activity' });
  }

  // ---------------- swipe between views ----------------
  {
    const panels = $('panels');
    const NO = '[data-noswipe], svg, canvas, input, textarea, select, .fslot, .fb-tile, .st-svg, .dd-chips, .ex-filters, .sh-chips';
    const noSwipe = tg => {
      if (!tg || !tg.closest) return true;
      if (tg.closest(NO)) return true;
      for (let n = tg; n && n !== panels; n = n.parentElement) {
        if (n.scrollWidth > n.clientWidth + 1) { const ox = getComputedStyle(n).overflowX; if (ox === 'auto' || ox === 'scroll') return true; }
      }
      return false;
    };
    let sx = 0, sy = 0, st = 0, armed = false;
    panels.addEventListener('touchstart', e => {
      armed = false;
      if (e.touches.length !== 1 || !S.tab || shownViews(S.tab).length < 2 || noSwipe(e.target)) return;
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = performance.now(); armed = true;
    }, { passive: true });
    panels.addEventListener('touchcancel', () => { armed = false; }, { passive: true });
    panels.addEventListener('touchend', e => {
      if (!armed) return; armed = false;
      const t = e.changedTouches[0]; if (!t) return;
      const dx = t.clientX - sx, dy = t.clientY - sy, ax = Math.abs(dx), dt = Math.max(1, performance.now() - st);
      if (ax <= 1.5 * Math.abs(dy)) return;
      if (ax < 56 && !(ax >= 24 && ax / dt > 0.4)) return;
      swipeView(dx < 0 ? 1 : -1);
    }, { passive: true });
  }
  function swipeView(dir) {
    const t = S.tab; if (!t) return false;
    const list = shownViews(t), i = list.findIndex(v => v.id === curView(t)), j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return false;
    setView(t, list[j].id);
    if (!reduced) {
      const p = $('panels');
      p.classList.remove('nv-in-l', 'nv-in-r');
      void p.offsetWidth;   // restart the 120 ms fade (a swipe is a rare, player-made event)
      p.classList.add(dir > 0 ? 'nv-in-r' : 'nv-in-l');
      clearTimeout(swipeView.tm); swipeView.tm = setTimeout(() => p.classList.remove('nv-in-l', 'nv-in-r'), 160);
    }
    return true;
  }

  navUI = { openSwitcher, pill, swipeView };
}
