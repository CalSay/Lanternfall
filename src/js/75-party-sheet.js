// 75-party-sheet: the generic bottom sheet (openSheet) and the hero sheet, and the helpers the Hero tab shares with it.
// Browser-only. Loads before 75-party.js ('-' sorts before '.').
// The companion sheets (levels, promotions, stories, Bonds, the recruit card) went with the party (W3-A).
//
// Exposed names:
//   PTY          helpers shared with 75-party.js (portrait, gear tiles, hero class, the Codex title)
//   openSheet(build, opts) -> { close, body }   a generic bottom sheet (90% height; X, swipe down, Escape)
//   partySheet   { openHero(), refresh(), close(), isOpen() }

const PTY = {};
let openSheet, partySheet;
{
  const ROLE_NAME = { tank: 'Tank', striker: 'Striker', caster: 'Caster', support: 'Support' };
  const HERO_GEAR_NOUN = {
    warden: { weapon: 'Warblade', off: 'Shield', head: 'Greathelm', body: 'Plate' },
    lanternmage: { weapon: 'Staff', off: 'Lantern', head: 'Hood', body: 'Robe' },
    ranger: { weapon: 'Bow', off: 'Quiver', head: 'Hood', body: 'Leathers' },
    lightkeeper: { weapon: 'Censer', off: 'Tome', head: 'Mitre', body: 'Vestments' }
  };
  const HERO_SLOTS = [
    { id: 'weapon', old: 'weapon', n: 'Weapon' }, { id: 'off', n: 'Off-hand' },
    { id: 'head', old: 'helm', n: 'Head' }, { id: 'body', n: 'Body' }, { id: 'charm', old: 'charm', n: 'Charm' }
  ];

  const safe = (fn, dflt) => { try { const v = fn(); return v == null ? dflt : v; } catch (e) { console.error('[lanternfall] party', e); return dflt; } };
  const heroClass = () => (S.party && S.party.cls && typeof HERO_CLASSES === 'object' && HERO_CLASSES[S.party.cls]) || null;

  function portrait(k) {
    if (typeof portraitURL === 'function') { const u = safe(() => portraitURL(k), ''); if (u) return u; }
    return spriteURL('hero-portrait', SPR.hero, HERO_PAL);
  }
  const pip = role => el('span', 'pip r-' + role, ROLE_NAME[role] || role);
  function itemIc(it) {
    try { return itemIcon(it.slot, it.t, it.u); } catch (e) { return iconURL('charm', '#A9B1BD'); }
  }
  const itemFrame = it => it.u ? 'legendary' : it.r;
  function slotTile(it, emptyIcon, size) {
    const t = it ? icTile(itemIc(it), itemFrame(it)) : icTile(iconURL(emptyIcon, '#4E4060'), null, 'ghost soon');
    if (size) t.classList.add('s' + size);
    return t;
  }
  // The player's Codex title (57c codexTitle), cached by the chosen title's id.
  let ctKey, ctVal = '';
  const heroTitle = () => {
    const key = S.codex ? S.codex.title : null;
    if (key !== ctKey) { ctKey = key; ctVal = key && typeof codexTitle === 'function' ? safe(() => codexTitle(), '') : ''; }
    return ctVal;
  };

  Object.assign(PTY, { heroTitle, HERO_GEAR_NOUN, HERO_SLOTS, safe, heroClass, portrait, pip, slotTile });


  // ================= generic bottom sheet =================
  // cur: the open modal sheet. curDock: the docked detail, kept in its own slot so a modal (a story card, Next up) opens over it
  // without closing it.
  let cur = null, curDock = null;
  openSheet = function (build, opts) {
    opts = opts || {};
    // desktop-layout-v1: a sheet opened from inside an open menu on a desktop screen docks into the menu's right half, below its head,
    // beside the list (docs/design/desktop-layout.md 3). It is not modal: no focus trap, no grab drag; × and Escape still close it.
    const dock = !!(opts.dock && typeof isDesk === 'function' && isDesk() && S.tab);
    if (cur) cur.close(true);
    if (dock && curDock) curDock.close(true);
    const last = document.activeElement;
    const ov = el('div', 'bsheet-ov' + (dock ? ' docked' : ''));
    const sh = el('div', 'bsheet' + (opts.small ? ' small' : ''));
    sh.setAttribute('role', 'dialog'); if (!dock) sh.setAttribute('aria-modal', 'true');
    if (opts.label) sh.setAttribute('aria-label', opts.label);
    const grab = el('div', 'bsheet-grab'); grab.append(el('i'));
    const x = el('button', 'bsheet-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close');
    grab.append(x);
    const body = el('div', 'bsheet-body');
    const foot = el('div', 'bsheet-foot');
    sh.append(grab, body, foot); ov.append(sh);
    if (dock) {
      const menu = document.getElementById('menu'), head = document.getElementById('menuHead');
      ov.style.top = (head ? head.offsetHeight : 0) + 'px';
      menu.append(ov); document.getElementById('app').classList.add('detail-docked');
    } else document.body.append(ov);
    const api = {
      body, foot, sheet: sh, docked: dock,
      // quiet (closeDock in 70-ui: a tab switch or the menu closing): onClose is told, so a "back" chain does not reopen a sheet
      close(instant, quiet) {
        if (api.closed) return; api.closed = true;
        document.removeEventListener('keydown', onKey, true);
        if (cur === api) cur = null;
        if (curDock === api) curDock = null;
        if (dock) document.getElementById('app').classList.remove('detail-docked');
        // A quiet close (tab switch) does not go back to the opener; if focus was in the sheet, it moves to the open tab instead of the page body.
        const held = sh.contains(document.activeElement);
        const done = () => {
          ov.remove(); if (opts.onClose) safe(() => opts.onClose(!!quiet));
          const to = !quiet ? last : held ? document.querySelector('.tabs .tab.on, .tabs .tab[aria-selected="true"]') : null;
          if (to && to.focus && document.contains(to)) try { to.focus({ preventScroll: true }); } catch (e) {}
        };
        if (instant || reduced || dock) done();
        else { ov.classList.add('out'); setTimeout(done, 180); }
      }
    };
    ov.sheetApi = api;
    function onKey(e) {
      if (e.key === 'Escape') {
        // A docked sheet sits under the game's overlays; Escape belongs to whatever is on top of it.
        if (dock && document.querySelector(MODAL_UP + ', #abPicker, #moveSheet, .gl-ov, .mm-ov, .dw-ov, .dd-fc-ov, .tabs-ov, #introScreen')) return;
        e.preventDefault(); e.stopPropagation(); api.close(); return;
      }
      if (dock || e.key !== 'Tab') return;
      const f = [...sh.querySelectorAll('button:not(:disabled), [href], input, summary, [tabindex]:not([tabindex="-1"])')].filter(n => n.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
    document.addEventListener('keydown', onKey, true);
    x.addEventListener('click', () => api.close());
    ov.addEventListener('click', e => { if (e.target === ov) api.close(); });
    // Swipe down on the handle, or on the body while it is scrolled to the top (not when docked).
    let y0 = null, dy = 0, fromBody = false;
    const down = e => {
      fromBody = body.contains(e.target);
      if (fromBody && (body.scrollTop > 0 || e.target.closest('button, summary, input'))) return;
      y0 = e.touches ? e.touches[0].clientY : e.clientY; dy = 0; sh.style.transition = 'none';
    };
    const move = e => {
      if (y0 == null) return;
      const y = e.touches ? e.touches[0].clientY : e.clientY; dy = Math.max(0, y - y0);
      if (fromBody && dy > 0 && body.scrollTop > 0) { y0 = null; sh.style.transform = ''; return; }
      if (dy > 0) { sh.style.transform = `translateY(${dy}px)`; if (e.cancelable && fromBody) e.preventDefault(); }
    };
    const up = () => {
      if (y0 == null) return; y0 = null; sh.style.transition = '';
      if (dy > 90) api.close(); else sh.style.transform = '';
    };
    if (!dock) {
      grab.addEventListener('pointerdown', e => { if (e.target === x) return; down(e); grab.setPointerCapture(e.pointerId); });
      grab.addEventListener('pointermove', move); grab.addEventListener('pointerup', up); grab.addEventListener('pointercancel', up);
      body.addEventListener('touchstart', down, { passive: true });
      body.addEventListener('touchmove', move, { passive: false });
      body.addEventListener('touchend', up); body.addEventListener('touchcancel', up);
    }
    if (dock) curDock = api; else cur = api;
    build(api);
    requestAnimationFrame(() => { try { x.focus({ preventScroll: true }); } catch (e) {} });
    return api;
  };

  // ================= hero sheet =================
  let sheet = null, sig = '', mirrorArm = false, refs = {};

  const section = (title, ...kids) => { const s = el('div', 'cs-sec'); if (title) s.append(el('h3', 'cs-h', title)); s.append(...kids); return s; };
  function head() {
    const top = el('div', 'cs-top');
    const fr = el('div', 'cs-pt');
    fr.append(img(portrait('hero')));
    const t = el('div', 'cs-who');
    const h = el('h2', 'cs-name', S.name); h.id = 'csName';
    t.append(h);
    const c = heroClass(), ct = heroTitle();
    if (ct) t.append(el('small', 'cs-ctitle', ct));
    t.append(el('small', 'cs-title', c ? `the ${c.name}` : 'the Wanderer'));
    const tags = el('div', 'cs-tags');
    if (c) tags.append(pip(c.role));
    t.append(tags);
    top.append(fr, t);
    return top;
  }


  // W1-C: what a solo hero presses. Attack is the class's own hit (CLASS_DEFS how); Parry and Dodge read the solo knobs.
  function soloKitRows(c) {
    const T = SOLO_TUNE, h = SOLO_HEROES[typeof soloHero === 'function' ? soloHero() : ''] || null, out = [];
    const kit = (title, text) => { const d = el('div', 'cs-kit1'); d.append(el('b', null, title), el('p', null, text)); return d; };
    out.push(kit('Attack (D)', c.how + ' A short cooldown, so time it. While you press buttons, your hero stops attacking alone.'));
    out.push(kit('Parry (A)', `Press it in the last ${T.parryWin} seconds of a heavy hit. The foe staggers and you counter for ${T.counterX}x damage, a sure crit. Too early, and you are open for ${T.openT} second${T.openT === 1 ? '' : 's'}.`));
    out.push(kit('Dodge (S)', `Press it in the last ${T.dodgeWin} seconds of a heavy hit or a ground attack and you take no damage. No counter. It takes ${T.dodgeCd} seconds to come back.`));
    if (h && h.ab) out.push(kit(`${h.ab.name} (Q) · every ${h.ab.cd}s`, h.ab.desc + ' Left alone, your hero casts it for you.'));
    return out;
  }
  function buildHero() {
    const body = sheet.body; body.textContent = ''; refs = {};
    sheet.sheet.setAttribute('aria-labelledby', 'csName');
    const c = heroClass();
    body.append(head());
    const hb = el('div', 'cs-xp'); const bar = el('div', 'xbar'); const fill = el('i'); bar.append(fill);
    fill.style.width = Math.min(100, S.xp / xpNeed() * 100) + '%';
    const hl = el('div', 'cs-xpline'); const lvb = el('b', null, 'Lv ' + S.L); const hn = el('small', 'cs-xpnote');
    hl.append(lvb, hn); hb.append(hl, bar); body.append(hb);
    refs.heroXp = fill; refs.heroXpTxt = hn;
    if (typeof deedsUI === 'object' && deedsUI) body.append(safe(() => deedsUI.heroRow(), ''));   // Achievements · 2,140 points › (75-deeds-ui)
    hn.textContent = `${Math.floor(Math.min(1, S.xp / xpNeed()) * 100)}% to Lv ${S.L + 1}`;
    if (typeof voiceRecord === 'function') { const ul = el('ul', 'cs-rec'); for (const r of safe(() => voiceRecord(), [])) ul.append(el('li', null, r.txt)); body.append(section('On the road', ul)); }   // hero-voice: what we have done together
    if (c) {
      body.append(el('p', 'cs-bio pitch', '"' + c.pitch + '"'));
      const cu = typeof classUI === 'object' && classUI ? safe(() => classUI.rows(), []) : [];   // S2: passives, the evolution rows (76-create)
      body.append(section('Kit', ...safe(() => soloKitRows(c), []), ...cu));   // W1-C: Attack, Parry, Dodge and the ability
    }
    const nouns = (S.party && HERO_GEAR_NOUN[S.party.cls]) || {};
    const g = el('div', 'cs-hgear');
    for (const s of HERO_SLOTS) {
      const pos = s.old || s.id, open = pos in S.equip;   // off-hand and body are hero positions since crafting (K4)
      const it = open ? equipped(pos) : null;
      const d = el('div', 'cs-hslot' + (open ? '' : ' soon'));
      d.append(it ? slotTile(it, null, 56) : slotTile(null, SLOT[pos] ? SLOT[pos].icon : pos === 'body' ? 'plate' : pos === 'off' ? 'banner' : 'helm', 56));
      d.append(el('small', null, nouns[s.id] || s.n));
      setTip(d, it ? itemName(it) : open ? 'Empty. Choose gear in the Gear view, next to Hero.' : 'Coming with crafting.');   // desktop-tooltips: was a title
      g.append(d);
    }
    body.append(section('Gear', g, '', el('p', 'note', 'Wear and swap gear in the Gear view, next to Hero. Make new gear in Craft.')));
    const n = (S.party && S.party.mirrors) || 0;
    const mir = el('div', 'cs-mirror');
    const mt = el('div'); mt.append(el('b', null, `Mirror of Embers: ${n}`), el('small', null, n ? 'Use one to choose a new class. Your level and gear stay.' : 'Bosses from zone 36 sometimes drop one. It lets you change class.'));
    mir.append(mt);
    if (n > 0 && typeof useMirror === 'function') {
      const b = el('button', 'mini' + (mirrorArm ? ' warn' : ' go'), mirrorArm ? 'Confirm: use' : 'Use'); b.type = 'button';
      b.addEventListener('click', () => {
        if (!mirrorArm) { mirrorArm = true; buildHero(); return; }
        mirrorArm = false; partySheet.close(); if (useMirror()) { save(); ui(true); }
      });
      mir.append(b);
    }
    const sw = typeof classUI === 'object' && classUI ? safe(() => classUI.switchRow(), null) : null;   // S2: the free change
    const mr = typeof classUI === 'object' && classUI && classUI.mirrorRow ? safe(() => classUI.mirrorRow(), null) : null;   // S3: the respec sheet
    body.append(sw ? section('Class change', sw, mr || mir) : section('Class change', mr || mir));
    sheet.foot.textContent = '';
  }

  const sigOf = () => 'hero|' + S.party.cls + '|' + (typeof classUI === 'object' && classUI ? classUI.sig() : '') + '|' + JSON.stringify(S.equip) + '|' + S.party.mirrors + '|' + S.L + '|' + heroTitle() + '|' + (typeof voiceRecord === 'function' ? voiceRecord().map(r => r.txt).join() : '');
  function render(force) {
    if (!sheet) return;
    const s = sigOf();
    if (!force && s === sig) {
      if (refs.heroXp) { putStyle(refs.heroXp, 'width', Math.min(100, S.xp / xpNeed() * 100) + '%'); putText(refs.heroXpTxt, `${Math.floor(Math.min(1, S.xp / xpNeed()) * 100)}% to Lv ${S.L + 1}`); }
      return;
    }
    sig = s;
    const top = sheet.body.scrollTop;
    buildHero();
    sheet.body.scrollTop = top;
  }
  function openFor() {
    if (sheet) sheet.close(true);   // S3: close the open one first (its onClose would clear the new one)
    sig = ''; mirrorArm = false;
    sheet = openSheet(() => {}, { label: S.name, dock: true, onClose: () => { sheet = null; refs = {}; } });
    sheet.sheet.classList.add('csheet');
    render(true);
  }
  partySheet = {
    openHero() { openFor(); },
    refresh(force) { try { render(force); } catch (e) { console.error('[lanternfall] party sheet', e); } },
    close() { if (sheet) sheet.close(); },
    isOpen: () => !!sheet
  };
  for (const ev of ['gear', 'mirrorDrop']) on(ev, () => { if (sheet) partySheet.refresh(); });
}
