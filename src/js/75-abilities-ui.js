// 75-abilities-ui: Hero tab > Abilities (docs/design/combat-turn-build.md "Where the abilities sit"). Browser file.
// Core: 56e-abilities.js (abLearnInfo, abilityLearn, scrollCount, talents), 59j-solo.js (soloEquip, soloEquipped), data 24c, 24e.
// The view, top to bottom (owner, 2026-10-02: "much better menus for abilities"):
//   - The loadout bar (sticky): the three slots Q, W, E (tap one to open what sits there), and a button with the Scrolls and
//     talent points you have (tap it for each Scroll, where it drops, and how talents work).
//   - The hero's resource line (HERO_RESOURCE: Aim, Grit, Cinders).
//   - Filters: All / Learned / Can learn.
//   - A compact list in the three path groups, then Attack, Parry and Dodge. Each row: tile, name, kind and cooldown, and a
//     badge: In Q / Learned / Learn / the reason it is locked ("Level 16", "Needs a Barrow Scroll"), and the talent state.
//   - The detail (tap a row): the full text, its numbers, the Perfect text of a timed ability, one action (Learn, two taps;
//     or Slot Q / W / E) and the two talents as an A / B choice. Where it sits is CSS (60-abilities.css): beside the list on
//     a wide panel, a bottom sheet in portrait, and in place of the list (with Back) in the small landscape panel.
// Ability icons: whole packs per hero (art freeze, owner 2026-09-30). The three starters (Echo Shot, Shield Bash, Fireball)
// and all of Pip's 14 are drawn (wire-ability-icons); Wren and Tobin keep lettered tiles until their last four icons pass.
{
  const icon = id => (typeof soloIconURL === 'function' ? soloIconURL(id) : '');
  const KIND = { damage: 'Damage', buff: 'Buff', debuff: 'Debuff', passive: 'Passive', finisher: 'Finisher' };
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];
  const KEYS = 'QWE';
  const BASIC = [['attack', 'Attack', 'Your plain hit. No cooldown.'], ['parry', 'Parry', 'Press as a hit lands to take none of it. A full parry earns a counter.'],
    ['dodge', 'Dodge', 'Press as a hit comes to step out of it.']];
  // view state (not saved): the open detail ('' | ability id | 'mv:attack'), the filter, the info drawer, a Learn armed
  let root = null, sig = '', armed = '', selId = '', filt = 'all', infoOpen = false, listTop = -1;
  const heroNm = k => (typeof ROSTER === 'object' && ROSTER[k] ? ROSTER[k].name.split(' ')[0] : k);
  const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
  function tile(id) {
    // a drawn icon shows at a native size (nicSet picks it from the box), never a 48 px image squeezed into 28-36 px
    if (nicHas('act', id)) { const i = el('img', 'ab-ic px'); i.alt = ''; nicSet(i, 'act', id, 32); return i; }
    const u = icon(id);
    if (u) { const i = el('img', 'ab-ic px'); i.alt = ''; i.src = u; return i; }
    const a = SOLO_ABILITIES[id]; return el('span', 'ab-ic ab-mono', ((a && (a.short || a.name)) || '?').slice(0, 2));
  }
  const persist = () => { try { save(); } catch (e) {} ui(true); };
  const redraw = () => { sig = ''; refresh(); };
  const cdTxt = id => { const a = ABILITIES[id]; return a.kind === 'passive' ? 'Always on' : `${typeof turnCdFor === 'function' ? turnCdFor(id) : a.cd} turns`; };
  const talOn = () => typeof TALENTS === 'object' && typeof talentPoints === 'function';
  const panels = () => document.getElementById('panels');
  // open or close the detail; in the small landscape panel it takes the list's place, so keep the list's scroll for Back
  function openDet(id) {
    const p = panels(), was = selId;
    if (!was && p) listTop = p.scrollTop;
    selId = id; armed = ''; redraw();
    const det = root && root.querySelector('.ab-det'), list = root && root.querySelector('.ab-list');
    if (det && list && p && getComputedStyle(list).display === 'none') p.scrollTop = 0;
    if (det) { const f = det.querySelector('.ab-x'); if (f) try { f.focus({ preventScroll: true }); } catch (e) {} }
  }
  function closeDet() {
    const p = panels(), id = selId;
    selId = ''; armed = ''; redraw();
    if (p && listTop >= 0) p.scrollTop = listTop;
    listTop = -1;
    const row = root && root.querySelector(`.ab-row[data-ab="${id}"]`); if (row) try { row.focus({ preventScroll: true }); } catch (e) {}
  }
  function build() {
    const k = soloHero(); if (!root) return;
    root.textContent = '';
    if (!k || typeof HERO_PATHS !== 'object' || !HERO_PATHS[k]) { root.append(el('p', 'note', 'Choose a hero first.')); return; }
    const eq = soloEquipped(), tp = talOn() ? talentPoints(k) : null;
    root.classList.toggle('has-det', !!selId);
    // ---- the loadout bar: Q W E and the Scrolls / talent points button ----
    const bar = el('div', 'ab-bar'), qwe = el('div', 'ab-qwe');
    eq.forEach((id, i) => {
      const b = btn('ab-q' + (id ? '' : ' empty') + (id && id === selId ? ' sel' : '') + (id && ABILITIES[id] && ABILITIES[id].kind === 'passive' ? ' passive' : ''));
      b.dataset.slot = String(i);
      b.append(el('i', 'ab-key', KEYS[i]));
      if (id) {
        const a = SOLO_ABILITIES[id] || {}; b.append(tile(id), el('b', null, a.short || a.name || id));
        b.setAttribute('aria-label', `Slot ${KEYS[i]}: ${(ABILITIES[id] || a).name}. Open it.`);
        b.addEventListener('click', () => (selId === id ? closeDet() : openDet(id)));
      } else {
        b.append(el('b', null, 'Empty'));
        b.setAttribute('aria-label', `Slot ${KEYS[i]} is empty. Show learned abilities.`);
        b.addEventListener('click', () => { filt = 'learned'; selId = ''; redraw(); });
      }
      qwe.append(b);
    });
    let nScroll = 0; for (const id of SCROLL_ORDER) nScroll += scrollCount(id);
    const ib = btn('ab-infob' + (infoOpen ? ' on' : '')); ib.setAttribute('aria-expanded', String(infoOpen));
    ib.append(el('b', null, `${nScroll} Scroll${nScroll === 1 ? '' : 's'}`));
    if (tp) ib.append(el('small', null, `${tp.free} talent pt${tp.free === 1 ? '' : 's'}`));
    ib.addEventListener('click', () => { infoOpen = !infoOpen; redraw(); });
    bar.append(qwe, ib);
    root.append(bar);
    // ---- the drawer: each Scroll, where it drops, and how slots and talents work ----
    if (infoOpen) {
      const info = el('div', 'ab-info'), scrolls = el('div', 'ab-scrolls');
      for (const id of SCROLL_ORDER) {
        const n = scrollCount(id), s = SCROLLS[id];
        const c = el('div', 'ab-scroll' + (n ? ' has' : '')); c.style.setProperty('--scroll', s.col);
        c.append(el('i', 'ab-gem'), el('b', null, s.name), el('span', 'ab-sn', '× ' + n), el('small', null, `Tier ${ROMAN[s.tier]}, level ${ABILITY_TIERS[s.tier].lv}. From ${s.from}.`));
        scrolls.append(c);
      }
      info.append(scrolls, el('p', 'note ab-src', 'Zone bosses drop Scrolls. Use one to learn an ability.'));
      info.append(el('p', 'note ab-note', `${heroNm(k)} takes three abilities into a fight (Q, W, E).`));
      if (tp) info.append(el('p', 'note ab-tp', `Talents: ${tp.free} of ${tp.total} points free. Pick one of two for ${TALENT_TUNE.cost} points. Change them between fights.`));
      root.append(info);
    }
    // ---- the resource line ----
    if (typeof HERO_RESOURCE === 'object' && HERO_RESOURCE[k]) root.append(el('p', 'note ab-res', HERO_RESOURCE[k].txt));
    // ---- the list and the detail ----
    const main = el('div', 'ab-main'), list = el('div', 'ab-list');
    const infos = {}; for (const id of HERO_ABILITIES[k]) infos[id] = abLearnInfo(k, id);
    const nOwn = HERO_ABILITIES[k].filter(id => infos[id].owned).length, nCan = HERO_ABILITIES[k].filter(id => !infos[id].why).length;
    const fr = el('div', 'ab-filt'); fr.setAttribute('role', 'group'); fr.setAttribute('aria-label', 'Show');
    for (const [f, nm] of [['all', 'All'], ['learned', `Learned ${nOwn}`], ['can', `Can learn ${nCan}`]]) {
      const b = btn('ab-fb' + (filt === f ? ' on' : '') + (f === 'can' && nCan ? ' hot' : ''), nm); b.dataset.f = f;
      b.setAttribute('aria-pressed', String(filt === f));
      b.addEventListener('click', () => { filt = f; redraw(); });
      fr.append(b);
    }
    list.append(fr);
    const show = id => filt === 'all' || (filt === 'learned' ? infos[id].owned : !infos[id].why);
    let shown = 0;
    for (const path of HERO_PATHS[k]) {
      const ids = path.ids.filter(show); if (!ids.length) continue;
      const g = el('div', 'ab-path'), rows = el('div', 'ab-rows'); g.append(el('h3', 'ab-pname', path.name));
      for (const id of ids) rows.append(rowFor(k, id, infos[id], eq));
      g.append(rows); list.append(g); shown += ids.length;
    }
    if (filt === 'can' && !shown) list.append(el('p', 'note ab-empty', nScroll ? 'Nothing to learn yet. Your Scrolls need a higher level.' : 'Nothing to learn yet. Beat a zone boss for a Scroll.'));
    if (filt !== 'can' && talOn()) {   // Attack, Parry and Dodge: talents only
      const g = el('div', 'ab-path ab-basics'), rows = el('div', 'ab-rows'); g.append(el('h3', 'ab-pname', 'Attack, Parry and Dodge'));
      for (const [mv, nm] of BASIC) rows.append(basicRow(k, mv, nm));
      g.append(rows); list.append(g);
    }
    main.append(list);
    if (selId) { const d = detFor(k, selId, eq, infos); if (d) main.append(d); else { selId = ''; root.classList.remove('has-det'); } }
    root.append(main);
  }
  // the talent state of an ability or move, for its row: 'Talent A' / 'Pick a talent' / ''
  function talMark(k, id) {
    if (!talOn() || !TALENTS[id]) return null;
    const cur = (talentsOf(k) || {})[id];
    if (cur) return el('small', 'ab-tm', `Talent ${cur.toUpperCase()}`);
    return talentPoints(k).free >= TALENT_TUNE.cost ? el('small', 'ab-tm pick', 'Pick a talent') : null;
  }
  function rowFor(k, id, i, eq) {
    const a = ABILITIES[id], where = eq.indexOf(id);
    const r = btn('ab-row' + (i.owned ? ' owned' : i.why ? ' locked' : ' ready') + (a.kind === 'passive' ? ' passive' : '') + (where >= 0 ? ' slotted' : '') + (selId === id ? ' sel' : ''));
    r.dataset.ab = id; r.setAttribute('aria-expanded', String(selId === id));
    const t = el('span', 'ab-rt'); t.append(el('b', null, a.name), el('small', null, `${KIND[a.kind]} · ${cdTxt(id)}`));
    const bd = el('span', 'ab-bd');
    bd.append(el('span', 'ab-badge ' + (where >= 0 ? 'in' : i.owned ? 'own' : !i.why ? 'go' : 'lock'),
      where >= 0 ? `In ${KEYS[where]}` : i.owned ? 'Learned' : !i.why ? 'Learn' : i.why));
    if (i.owned) { const m = talMark(k, id); if (m) bd.append(m); }
    r.append(tile(id), t, bd);
    r.addEventListener('click', () => (selId === id ? closeDet() : openDet(id)));
    return r;
  }
  function basicRow(k, mv, nm) {
    const id = 'mv:' + mv, r = btn('ab-row owned ab-basic' + (selId === id ? ' sel' : ''));
    r.dataset.mv = mv; r.setAttribute('aria-expanded', String(selId === id));
    const t = el('span', 'ab-rt'); t.append(el('b', null, nm), el('small', null, 'Talents'));
    const bd = el('span', 'ab-bd'), m = talMark(k, k + ':' + mv);
    bd.append(m || el('small', 'ab-tm', 'No talent'));
    r.append(tile(mv), t, bd);
    r.addEventListener('click', () => (selId === id ? closeDet() : openDet(id)));
    return r;
  }
  // the two talents of an ability (or of '<hero>:attack' etc.) as an A / B choice: tap one to take it, tap it again to give it back
  function talentBlock(k, id, owned) {
    if (!talOn() || !TALENTS[id]) return null;
    const T = TALENTS[id], cur = (talentsOf(k) || {})[id] || '', tp = talentPoints(k);
    const wrap = el('div', 'ab-tals'), hd = el('div', 'ab-th');
    hd.append(el('h4', null, 'Talents'), el('small', null, owned ? `Pick A or B · ${TALENT_TUNE.cost} points · ${tp.free} free` : 'Learn it to pick one'));
    const row = el('div', 'ab-tal');
    for (const c of ['a', 'b']) {
      const on = cur === c, can = owned && (on || !!cur || tp.free >= TALENT_TUNE.cost);
      const b = btn('ab-talb' + (on ? ' on' : '')); b.disabled = !can; b.dataset.c = c;
      b.setAttribute('aria-pressed', String(on));
      const top = el('span', 'ab-tl'); top.append(el('i', 'ab-ab', c.toUpperCase()), el('b', null, T[c].name));
      b.append(top, el('small', null, T[c].text));
      if (on) b.append(el('em', null, 'Taken · tap to give back'));
      b.title = !owned ? 'Learn this ability first' : on ? 'Tap to give this talent back' : can ? `Take this talent (${TALENT_TUNE.cost} points)` : 'Not enough talent points';
      b.addEventListener('click', () => { if (talentSet(k, id, on ? null : c)) persist(); redraw(); });
      row.append(b);
    }
    wrap.append(hd, row);
    if (owned && !cur && tp.free < TALENT_TUNE.cost) wrap.append(el('p', 'note ab-tnote', `You need ${TALENT_TUNE.cost} free points. You earn one a level.`));
    return wrap;
  }
  function detHead(name, sub, tl, onX) {
    const h = el('div', 'ab-dh'), t = el('div', 'ab-t'), x = btn('ab-x');
    x.append(el('span', 'ab-xb', '‹ Back'), el('span', 'ab-xc', '×'));
    x.setAttribute('aria-label', 'Close');
    x.addEventListener('click', onX);
    t.append(el('b', null, name), el('small', null, sub));
    h.append(x, tl, t);
    return h;
  }
  function detFor(k, id, eq, infos) {
    const d = el('section', 'ab-det'); d.setAttribute('aria-label', 'Details');
    if (id.startsWith('mv:')) {   // Attack, Parry or Dodge
      const mv = id.slice(3), B = BASIC.find(x => x[0] === mv); if (!B) return null;
      d.dataset.mv = mv;
      d.append(detHead(B[1], 'Always ready', tile(mv), closeDet), el('p', 'ab-desc', B[2]));
      const own = mv === 'dodge' && typeof turnDodgeLine === 'function' ? turnDodgeLine(k) : '';   // Wren's Out of Reach (59k)
      if (own) d.append(el('p', 'ab-desc', own));
      const tb = talentBlock(k, k + ':' + mv, true); if (tb) d.append(tb);
      return d;
    }
    const a = ABILITIES[id]; if (!a || a.hero !== k) return null;
    const i = infos[id] || abLearnInfo(k, id), where = eq.indexOf(id);
    d.dataset.ab = id;
    const cd = a.kind === 'passive' ? 'Always on' : `${cdTxt(id)} cooldown`;
    d.append(detHead(a.name, `${KIND[a.kind]} · ${cd} · ${a.tier ? 'Tier ' + ROMAN[a.tier] : 'Starter'} · ${a.path}`, tile(id), closeDet));
    d.append(el('p', 'ab-desc', a.desc));
    // its numbers at your power now (owner, 2026-10-02: in the details, never during a fight)
    const nums = typeof turnAbilityNumbers === 'function' ? turnAbilityNumbers(id) : '';
    if (nums) d.append(el('p', 'ab-nums', nums));
    if (a.perfect) d.append(el('p', 'ab-timed', `Timed: press again as the ring closes. Perfect: ${a.perfect}. A miss hits for 70%.`));
    // the one action
    const act = el('div', 'ab-act');
    if (i.owned) {
      act.append(el('small', 'ab-al', where >= 0 ? `In slot ${KEYS[where]}. Tap it to take it out.` : 'Put it in a slot:'));
      const row = el('div', 'ab-sl');
      for (let s = 0; s < 3; s++) {
        const cur = eq[s], b = btn('ab-slotb' + (where === s ? ' on' : ''));
        b.dataset.slot = String(s); b.setAttribute('aria-pressed', String(where === s));
        b.append(el('b', null, KEYS[s]), el('small', null, where === s ? 'Take out' : cur ? (SOLO_ABILITIES[cur] || {}).short || 'Swap' : 'Empty'));
        b.setAttribute('aria-label', where === s ? `Take it out of slot ${KEYS[s]}` : `Put it in slot ${KEYS[s]}`);
        b.addEventListener('click', () => { if (where === s) soloEquip(s, null); else soloEquip(s, id); persist(); redraw(); });
        row.append(b);
      }
      act.append(row);
    } else if (!i.why) {
      const pay = SCROLLS[i.payWith], b = btn('big ab-learn');
      putText(b, armed === id ? `Tap again to spend a ${pay.name}` : `Learn · ${pay.name}`);
      if (armed === id) b.classList.add('armed');
      b.addEventListener('click', () => {
        if (armed !== id) { armed = id; redraw(); return; }
        armed = '';
        if (abilityLearn(k, id)) {
          toast(`${heroNm(k)} learned ${a.name}.`, 'good', null, 'normal');
          const e2 = soloEquipped(), free = e2.indexOf(null); if (free >= 0) soloEquip(free, id);
          persist();
        }
        redraw();
      });
      act.append(b, el('small', 'ab-al', `You have ${scrollCount(i.payWith)} ${pay.name}${scrollCount(i.payWith) === 1 ? '' : 's'}.`));
    } else {
      const s = SCROLLS[i.scroll];
      act.append(el('p', 'ab-need', !i.lvOk ? `Opens at level ${i.lv}. Then it needs a ${s.name}.` : `Needs a ${s.name}. It drops from ${s.from}.`));
    }
    d.append(act);
    const tb = talentBlock(k, id, i.owned); if (tb) d.append(tb);
    return d;
  }
  function refresh() {
    if (!root || !root.isConnected) return;
    const k = soloHero(); if (!k) { if (sig !== 'none') { sig = 'none'; build(); } return; }
    const lv = soloLevels()[k], A = S.abil || {};
    const P = typeof turnPowerNow === 'function' ? turnPowerNow() : null;
    const s = [k, lv && lv.L, JSON.stringify(A.unl && A.unl[k]), JSON.stringify(A.scrolls), soloEquipped().join(), armed, P ? fmt(Math.round(P.U)) : '',
      JSON.stringify(A.tal && A.tal[k]), selId, filt, infoOpen].join('|');
    if (s === sig) return;
    sig = s; build();
  }
  registerView('party', { id: 'abilities', label: 'Abilities', order: 15, feature: 'party' });
  registerSection('party', { id: 'abilities', title: 'Abilities', view: 'abilities', feature: 'party',
    mount(sec) { sec.classList.add('ab-sec'); root = el('div', 'ab-root'); sec.append(root); sig = ''; refresh(); },
    update: () => { try { refresh(); } catch (e) { console.error('[lanternfall] abilities', e); } } });
  on('soloHero', () => { selId = ''; armed = ''; });   // another hero: start at the list
  for (const ev of ['abilityLearned', 'scrollDrop', 'soloEquip', 'soloHero', 'levelup']) on(ev, () => { sig = ''; try { refresh(); } catch (e) {} });
}
