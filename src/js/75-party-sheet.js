// 75-party-sheet: the character sheet (a bottom sheet) and the helpers the Party tab shares
// with it. Browser-only. Loads before 75-party.js ('-' sorts before '.').
// Spec: docs/design/party-and-classes.md 7.3 (sheet), 3.4 (milestones, promotions), 3.5 (synergies).
//
// Exposed names:
//   PTY          helpers shared with 75-party.js (portraits, rarity, gear, traits, synergies, leads, costs)
//   openSheet(build, opts) -> { close, body }   a generic bottom sheet (90% height; X, swipe down, Escape)
//   partySheet   { open(id), openHero(), refresh(), close(), isOpen() }
//
// Reads 56b-synergy.js (activeSynergies, synergyStatus, charTraits, SYNERGIES) and 56c-unlocks.js
// (leads) only when they exist, so the sheet works without them.

const PTY = {};
let openSheet, partySheet;
{
  // The synergy and unlock files may not exist yet: probe their names with typeof.
  const fnActive = () => (typeof activeSynergies === 'function' ? activeSynergies : null);
  const fnStatus = () => (typeof synergyStatus === 'function' ? synergyStatus : null);
  const fnTraits = () => (typeof charTraits === 'function' ? charTraits : null);
  const fnLeads = () => (typeof leads === 'function' ? leads : null);

  const ROLE_NAME = { tank: 'Tank', striker: 'Striker', caster: 'Caster', support: 'Support' };
  const CIRCLE_NAME = { hedgefolk: 'Hedgefolk', oath: 'the Oath', dusk: 'Dusk Company', wayfarers: 'Wayfarers' };
  const COL_NAME = ['Back', 'Mid', 'Front'];
  const WEAPON_NOUN = { tank: 'Shield', striker: 'Weapon', caster: 'Staff', support: 'Tome' };
  const WEAPON_BY_CHAR = { wren: 'Bow', kestrel: 'Spear', isolde: 'Blades', corvin: 'Blades', bram: 'Axe' };
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
  const MILESTONES = [
    { lv: 5, n: 'Story' }, { lv: 10, n: 'Passive' }, { lv: 15, n: 'Story' }, { lv: 20, n: 'Ability' }, { lv: 25, n: 'Bond' }
  ];

  const safe = (fn, dflt) => { try { const v = fn(); return v == null ? dflt : v; } catch (e) { console.error('[lanternfall] party', e); return dflt; } };
  const live = () => typeof rosterLive === 'function' && rosterLive();
  const C = k => (typeof ROSTER === 'object' && ROSTER[k]) || null;
  const heroClass = () => (S.party && S.party.cls && typeof HERO_CLASSES === 'object' && HERO_CLASSES[S.party.cls]) || null;
  const heroCol = () => { const c = heroClass(); return c ? ({ front: 2, mid: 1, back: 0 })[c.row] : 2; };

  function portrait(k) {
    if (typeof portraitURL === 'function') { const u = safe(() => portraitURL(k), ''); if (u) return u; }
    return spriteURL('hero-portrait', SPR.hero, HERO_PAL);
  }
  const rarity = k => (C(k) && C(k).rarity) || 'common';
  const frameCol = k => (RARITY_FRAME[rarity(k)] || RARITY_FRAME.common).col;
  const rarityName = k => (RARITY_FRAME[rarity(k)] || RARITY_FRAME.common).name;
  const first = k => k === 'hero' ? S.name : C(k).name.replace(/^(Ser|Old|Brother|Saint) /, '').split(' ')[0];
  const pip = role => el('span', 'pip r-' + role, ROLE_NAME[role] || role);
  const essName = t => `${MAT.ess.short[t - 1]} Essence`;
  const costText = c => {
    if (!c) return '';
    const p = [];
    if (c.gold) p.push(fmt(c.gold) + ' gold');
    if (c.ess) p.push(`${fmt(c.ess[1])} ${essName(c.ess[0])} or better`);
    return p.length ? p.join(' + ') : 'free';
  };
  const weaponNoun = k => WEAPON_BY_CHAR[k] || WEAPON_NOUN[C(k).role] || 'Weapon';
  const gearOf = (k, which) => { const r = charRec(k); const id = r && r[which]; return id != null ? itemById(id) : null; };
  function itemIc(it) {
    try { return itemIcon(it.slot, it.t, it.u); } catch (e) { return iconURL('charm', '#A9B1BD'); }
  }
  const itemFrame = it => it.u ? 'legendary' : it.r;
  function slotTile(it, emptyIcon, size) {
    const t = it ? icTile(itemIc(it), itemFrame(it)) : icTile(iconURL(emptyIcon, '#4E4060'), null, 'ghost soon');
    if (size) t.classList.add('s' + size);
    return t;
  }
  const traits = k => { const f = fnTraits(); return f ? safe(() => f(k), null) : null; };
  // Synergies that include this character: the active ones, plus near misses when the table is exposed.
  function synergiesFor(k) {
    const act = fnActive(); if (!act) return null;
    const out = [], seen = {};
    for (const s of safe(() => act(), [])) {
      if (!s || seen[s.id]) continue;
      if (k && !(s.members || []).includes(k)) continue;
      seen[s.id] = 1; out.push({ id: s.id, name: s.name, active: true, text: s.effectText || '', stageC: !!s.stageC, members: s.members || [] });
    }
    const st = fnStatus();
    if (st && typeof SYNERGIES === 'object' && SYNERGIES) {
      const defs = Array.isArray(SYNERGIES) ? SYNERGIES : Object.keys(SYNERGIES).map(id => Object.assign({ id }, SYNERGIES[id]));
      for (const def of defs) {
        const id = def.id;
        if (!id || seen[id]) continue;
        const s = safe(() => st(id), null); if (!s || s.active) continue;
        const need = s.missing || [];
        const names = s.members || def.members || [];
        if (k && Array.isArray(names) && names.length && !names.includes(k)) continue;
        if (!k && need.length !== 1) continue;           // tab row: only one member short
        if (k && Array.isArray(names) && !names.length) continue;
        seen[id] = 1;
        out.push({ id, name: def.name || id, active: false, text: s.text || def.effectText || def.text || '', missing: need });
      }
    }
    return out;
  }
  const missingText = m => {
    if (!m || !m.length) return '';
    const n = m.map(x => (C(x) ? first(x) : String(x)));
    return 'needs ' + n.join(', ');
  };
  // Leads: 56c-unlocks' list, plus built-in cards for routes this file can read (progress routes).
  function leadList() {
    const out = [], ids = {};
    const f = fnLeads();
    if (f) for (const l of safe(() => f(), [])) { if (!l) continue; ids[l.id] = 1; out.push(l); }
    if (!live()) return out;
    let far = 0;
    const order = ROSTER_KEYS.slice().sort((a, b) => (C(a).route.zone || 999) - (C(b).route.zone || 999));
    for (const k of order) {
      if (ids[k] || isRecruited(k)) continue;
      const cost = recruitCost(k), rt = C(k).route;
      if (cost) {
        const pct = cost.gold ? Math.min(1, S.gold / cost.gold) : 1;
        out.push({ id: k, name: C(k).name, how: `Ready to join for ${costText(cost)}.`, pct, action: { label: 'Recruit', fn: () => recruit(k) }, builtIn: true, ready: canRecruit(k) });
      } else if (rt.type === 'progress' && rt.zone > S.maxZone && far++ < 2) {
        out.push({ id: k, name: C(k).name, how: recruitHow(k), pct: Math.min(1, S.maxZone / rt.zone), action: null, builtIn: true, sub: `Zone ${S.maxZone} of ${rt.zone}` });
      }
    }
    return out;
  }
  const leadFor = k => leadList().find(l => l.id === k) || null;
  const pctOf = l => { if (!l || l.pct == null || !isFinite(l.pct)) return null; const p = +l.pct; return Math.max(0, Math.min(1, p > 1 ? p / 100 : p)); };
  const xpInfo = k => {
    const r = charRec(k); if (!r) return null;
    const cap = levelCap(r.rank), need = cxpNeed(r.lv), atCap = r.lv >= cap;
    return { r, cap, atCap, pct: atCap ? 1 : Math.max(0, Math.min(1, r.xp / need)), catchUp: safe(() => catchUpBonus(k), 0), maxRank: r.rank >= ROSTER_TUNE.maxRank };
  };
  const inField = k => !!(S.party && Array.isArray(S.party.field) && S.party.field.includes(k));
  // Something waiting for the player: an unread story or a promotion they can pay for now.
  const needsYou = k => isRecruited(k) && (safe(() => storyState(k).unread, 0) > 0 || safe(() => canPromote(k), false));

  Object.assign(PTY, {
    ROLE_NAME, CIRCLE_NAME, COL_NAME, HERO_GEAR_NOUN, HERO_SLOTS, safe, live, C, heroClass, heroCol, portrait, rarity, frameCol,
    rarityName, first, pip, essName, costText, weaponNoun, gearOf, itemIc, itemFrame, slotTile, traits, synergiesFor, missingText,
    leadList, leadFor, pctOf, xpInfo, inField, needsYou, fnActive
  });

  // ================= generic bottom sheet =================
  let cur = null;
  openSheet = function (build, opts) {
    if (cur) cur.close(true);
    opts = opts || {};
    const last = document.activeElement;
    const ov = el('div', 'bsheet-ov');
    const sh = el('div', 'bsheet' + (opts.small ? ' small' : ''));
    sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true');
    if (opts.label) sh.setAttribute('aria-label', opts.label);
    const grab = el('div', 'bsheet-grab'); grab.append(el('i'));
    const x = el('button', 'bsheet-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close');
    grab.append(x);
    const body = el('div', 'bsheet-body');
    const foot = el('div', 'bsheet-foot');
    sh.append(grab, body, foot); ov.append(sh);
    document.body.append(ov);
    const api = {
      body, foot, sheet: sh,
      close(instant) {
        if (api.closed) return; api.closed = true;
        document.removeEventListener('keydown', onKey, true);
        if (cur === api) cur = null;
        const done = () => { ov.remove(); if (opts.onClose) safe(opts.onClose); if (last && last.focus && document.contains(last)) try { last.focus({ preventScroll: true }); } catch (e) {} };
        if (instant || reduced) done();
        else { ov.classList.add('out'); setTimeout(done, 180); }
      }
    };
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); api.close(); return; }
      if (e.key !== 'Tab') return;
      const f = [...sh.querySelectorAll('button:not(:disabled), [href], input, summary, [tabindex]:not([tabindex="-1"])')].filter(n => n.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
    document.addEventListener('keydown', onKey, true);
    x.addEventListener('click', () => api.close());
    ov.addEventListener('click', e => { if (e.target === ov) api.close(); });
    // Swipe down on the handle, or on the body while it is scrolled to the top.
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
    grab.addEventListener('pointerdown', e => { if (e.target === x) return; down(e); grab.setPointerCapture(e.pointerId); });
    grab.addEventListener('pointermove', move); grab.addEventListener('pointerup', up); grab.addEventListener('pointercancel', up);
    body.addEventListener('touchstart', down, { passive: true });
    body.addEventListener('touchmove', move, { passive: false });
    body.addEventListener('touchend', up); body.addEventListener('touchcancel', up);
    cur = api;
    build(api);
    requestAnimationFrame(() => { try { x.focus({ preventScroll: true }); } catch (e) {} });
    return api;
  };

  // ================= character sheet =================
  let who = null, sheet = null, sig = '', openStory = -1, swapOpen = false, mirrorArm = false, refs = {};

  const section = (title, ...kids) => { const s = el('div', 'cs-sec'); if (title) s.append(el('h3', 'cs-h', title)); s.append(...kids); return s; };
  function statBox(label, value, sub) {
    const d = el('div', 'cs-stat'); d.append(el('small', null, label), el('b', null, value));
    if (sub) d.append(el('em', null, sub));
    return d;
  }
  function head(k, locked) {
    const top = el('div', 'cs-top');
    const fr = el('div', 'cs-pt' + (locked ? ' locked' : '') + (k !== 'hero' && rarity(k) === 'legendary' ? ' leg' : ''));
    if (k !== 'hero') fr.style.setProperty('--rc', frameCol(k));
    fr.append(img(portrait(k)));
    const t = el('div', 'cs-who');
    const h = el('h2', 'cs-name', k === 'hero' ? S.name : C(k).name); h.id = 'csName';
    t.append(h);
    if (k === 'hero') {
      const c = heroClass();
      t.append(el('small', 'cs-title', c ? `the ${c.name}` : 'the Wanderer'));
      const tags = el('div', 'cs-tags');
      if (c) tags.append(pip(c.role));
      t.append(tags);
    } else {
      const c = C(k);
      t.append(el('small', 'cs-title', c.title));
      const tags = el('div', 'cs-tags');
      const rt = el('span', 'cs-tag rar', rarityName(k)); rt.style.color = frameCol(k);
      tags.append(rt, pip(c.role), el('span', 'cs-tag', CIRCLE_NAME[c.circle] || c.circle));
      t.append(tags);
    }
    top.append(fr, t);
    return top;
  }
  function xpBlock(k) {
    const x = xpInfo(k);
    const box = el('div', 'cs-xp');
    const line = el('div', 'cs-xpline');
    const lv = el('b', null, `Lv ${x.r.lv}`); lv.append(el('small', null, ` / ${x.cap}`));
    const rk = el('span', 'cs-rank', 'Rank: ' + ROSTER_RANKS[x.r.rank]);
    line.append(lv, rk);
    const bar = el('div', 'xbar' + (x.atCap ? ' cap' : '')); const fill = el('i'); bar.append(fill);
    const note = el('small', 'cs-xpnote');
    box.append(line, bar, note);
    refs.xp = { fill, bar, note, k };
    updateXp();
    return box;
  }
  function updateXp() {
    const r = refs.xp; if (!r) return;
    const x = xpInfo(r.k); if (!x) return;
    r.fill.style.width = (x.pct * 100).toFixed(1) + '%';
    r.bar.classList.toggle('cap', x.atCap);
    const bits = [];
    if (x.atCap) bits.push(x.maxRank ? 'Highest rank reached.' : 'At the level cap. Promote to keep growing.');
    else bits.push(`${Math.floor(x.pct * 100)}% to Lv ${x.r.lv + 1}`);
    if (!inField(r.k)) bits.push('Earns XP only while fighting.');
    else if (x.catchUp > 0) bits.push(`+${Math.round(x.catchUp * 100)}% XP to catch up.`);
    r.note.textContent = bits.join(' ');
  }

  function kitSection(k) {
    const list = traits(k);
    if (!list || !list.length) return null;
    const ul = el('ul', 'cs-kit');
    for (const t of list) {
      const li = el('li', t.active === false ? 'off' : '');
      const nm = el('b', null, t.name);
      const kind = el('small', 'cs-kind', String(t.kind || '').replace(/^\w/, m => m.toUpperCase()));
      const top = el('div'); top.append(nm, kind);
      if (t.stageC) top.append(el('small', 'cs-soon', 'with party combat'));
      li.append(top, el('p', null, t.text || ''));
      ul.append(li);
    }
    return section('Kit', ul);
  }
  function synSection(k) {
    const list = synergiesFor(k);
    if (!list) return null;
    const box = el('div', 'cs-syns');
    if (!list.length) box.append(el('p', 'note', 'No synergies with this party yet.'));
    for (const s of list) {
      const d = el('div', 'cs-syn' + (s.active ? ' on' : ''));
      const top = el('div'); top.append(el('b', null, s.name), el('small', null, s.active ? 'Active' : missingText(s.missing) || 'Inactive'));
      d.append(top);
      if (s.text) d.append(el('p', null, s.text));
      box.append(d);
    }
    return section('Synergies', box);
  }
  function milestoneTrack(k) {
    const r = charRec(k);
    const ol = el('ol', 'cs-miles');
    const nextLv = MILESTONES.find(m => r.lv < m.lv);
    for (const m of MILESTONES) {
      const done = r.lv >= m.lv, next = nextLv === m;
      const li = el('li', done ? 'done' : next ? 'next' : '');
      li.append(el('b', null, 'L' + m.lv), el('small', null, m.n));
      li.setAttribute('aria-label', `Level ${m.lv}, ${m.n}: ${done ? 'unlocked' : next ? 'next' : 'locked'}`);
      ol.append(li);
    }
    const kids = [ol];
    if (r.lv >= 25) {
      const nx = (Math.floor(r.lv / 25) + 1) * 25;
      kids.push(el('p', 'note', `Every 25 levels the signature ability grows 25% stronger. Next at Lv ${nx}.`));
    }
    return section('Milestones', ...kids);
  }
  function storiesSection(k) {
    const list = (typeof STORIES === 'object' && STORIES[k]) || [];
    if (!list.length) return null;
    const st = storyState(k), lvs = ROSTER_TUNE.storyLv;
    const box = el('div', 'cs-stories');
    list.forEach((s, i) => {
      if (i >= st.unlocked) {
        const d = el('div', 'cs-story locked');
        d.append(el('b', null, s.title), el('small', null, `Unlocks at Lv ${lvs[i]}`));
        box.append(d); return;
      }
      const det = el('details', 'cs-story');
      if (openStory === i) det.open = true;
      const sum = el('summary');
      sum.append(el('b', null, s.title));
      if (i >= st.seen) sum.append(el('span', 'udot', 'New'));
      det.append(sum, el('p', null, s.text));
      det.addEventListener('toggle', () => {
        if (det.open) {
          openStory = i;
          if (storyState(k).unread > 0) { markStoriesRead(k); save(); emit('storiesRead', { id: k }); box.querySelectorAll('.udot').forEach(n => n.remove()); }
        } else if (openStory === i) openStory = -1;
      });
      box.append(det);
    });
    return section('Camp stories', box);
  }
  function gearSection(k) {
    const g = el('div', 'cs-gear');
    for (const [which, noun, ic] of [['wpn', weaponNoun(k), 'sword'], ['trk', 'Trinket', 'charm']]) {
      const it = gearOf(k, which);
      const s = el('div', 'cs-slot' + (it ? '' : ' empty'));
      s.append(slotTile(it, ic, 56));
      const tx = el('div');
      tx.append(el('b', null, it ? itemName(it) : noun), el('small', null, it ? noun : 'Empty. Party gear is coming soon.'));
      s.append(tx); g.append(s);
      if (typeof craftUI === 'object' && craftUI) { s.classList.add('tap'); s.setAttribute('role', 'button'); s.tabIndex = 0; s.addEventListener('click', () => craftUI.pick(k, which)); if (!it) tx.lastChild.textContent = 'Empty. Tap to choose.'; } // K7 item picker
    }
    return section('Gear', g);
  }
  function statsSection(k) {
    const c = C(k), cell = S.party.cells && S.party.cells[k];
    const g = el('div', 'cs-stats');
    const dps = safe(() => charDps(k), 0);
    const b = statBox(c.role === 'support' ? 'Adds DMG/s' : 'DMG/s', fmt(dps), c.role === 'support' ? 'as a party buff' : inField(k) ? '' : 'when fielded');
    refs.dps = b.querySelector('b');
    g.append(b,
      statBox('HP', '-', 'with party combat'),
      statBox('Armour', '-', 'with party combat'),
      statBox('Row', inField(k) && cell ? COL_NAME[cell.col] : 'Bench', inField(k) && cell ? (cell.lane ? 'lower lane' : 'upper lane') : ''));
    return section('Stats', g);
  }

  function actions(k) {
    const foot = sheet.foot; foot.textContent = '';
    const x = xpInfo(k); const row = el('div', 'cs-acts');
    if (!x.maxRank) {
      const pc = promoteCost(k);
      const b = el('button', 'buy cs-promote'); b.type = 'button';
      b.append(el('span', 'qty', x.atCap ? 'Promote' : `Promote at Lv ${x.cap}`), el('span', 'price'));
      const pr = b.querySelector('.price');
      pr.append(el('span', 'ico gold'), el('span', null, fmt(pc.gold)));
      b.disabled = !canPromote(k);
      b.addEventListener('click', () => { if (promoteChar(k)) { save(); ui(true); partySheet.refresh(true); } });
      row.append(b);
      if (x.atCap) foot.append(el('small', 'cs-cost', `Also ${fmt(pc.ess[1])} ${essName(pc.ess[0])} or better. Damage x2, level cap +25.`));
    }
    if (inField(k)) {
      const b = el('button', 'mini cs-act', 'Bench'); b.type = 'button';
      b.addEventListener('click', () => { if (benchChar(k)) { save(); ui(true); partySheet.refresh(true); } });
      row.append(b);
    } else {
      const f = (S.party.field || []).slice(0, 3);
      const b = el('button', 'mini go cs-act', f.length < 3 ? 'Field' : swapOpen ? 'Cancel' : 'Field'); b.type = 'button';
      b.addEventListener('click', () => {
        if (f.length < 3) { if (fieldChar(k)) { save(); ui(true); partySheet.refresh(true); } return; }
        swapOpen = !swapOpen; partySheet.refresh(true);
      });
      row.append(b);
    }
    foot.append(row);
    if (swapOpen && !inField(k)) {
      const sw = el('div', 'cs-swap');
      sw.append(el('small', null, 'Swap in for:'));
      for (const o of (S.party.field || []).slice(0, 3)) {
        const b = el('button', 'mini cs-swapbtn'); b.type = 'button';
        b.append(img(portrait(o)), el('span', null, first(o)));
        b.addEventListener('click', () => { swapOpen = false; if (fieldChar(k, o)) { save(); ui(true); partySheet.refresh(true); } });
        sw.append(b);
      }
      foot.prepend(sw);
    }
  }

  function buildChar(k) {
    const body = sheet.body; body.textContent = ''; refs = {};
    sheet.sheet.setAttribute('aria-labelledby', 'csName');
    const locked = !isRecruited(k);
    body.append(head(k, locked));
    if (locked) { buildLocked(k); return; }
    body.append(xpBlock(k));
    if (BIOS[k]) body.append(el('p', 'cs-bio', BIOS[k]));
    body.append(statsSection(k), gearSection(k));
    const kit = kitSection(k); if (kit) body.append(kit);
    const syn = synSection(k); if (syn) body.append(syn);
    body.append(milestoneTrack(k));
    const st = storiesSection(k); if (st) body.append(st);
    actions(k);
  }
  function buildLocked(k) {
    const body = sheet.body, c = C(k);
    const l = leadFor(k), p = pctOf(l), cost = recruitCost(k);
    const how = el('div', 'cs-how');
    how.append(el('h3', 'cs-h', 'How they join'), el('p', null, recruitHow(k)));
    if (l && l.how && l.how !== recruitHow(k)) how.append(el('p', 'note', l.how));
    if (p != null) {
      const bar = el('div', 'xbar xlead'); const i = el('i'); i.style.width = (p * 100).toFixed(1) + '%'; bar.append(i);
      how.append(bar, el('small', 'cs-xpnote', l.sub || `${Math.floor(p * 100)}% of the way`));
    }
    body.append(how);
    body.append(el('p', 'cs-bio hidden', `${ROLE_STATS[c.role].n} · ${rarityName(k)}. Their story stays hidden until they join.`));
    const foot = sheet.foot; foot.textContent = '';
    const row = el('div', 'cs-acts');
    if (cost) {
      const b = el('button', 'buy cs-promote'); b.type = 'button';
      b.append(el('span', 'qty', 'Recruit'), el('span', 'price'));
      b.querySelector('.price').append(el('span', 'ico gold'), el('span', null, cost.gold ? fmt(cost.gold) : 'Free'));
      b.disabled = !canRecruit(k);
      b.addEventListener('click', () => { if (recruit(k)) { save(); ui(true); partySheet.refresh(true); } });
      row.append(b);
      if (cost.ess) foot.append(el('small', 'cs-cost', `Also ${fmt(cost.ess[1])} ${essName(cost.ess[0])} or better.`));
    } else if (l && l.action) {
      const b = el('button', 'mini go cs-act', l.action.label); b.type = 'button';
      b.addEventListener('click', () => { safe(() => l.action.fn()); save(); ui(true); partySheet.refresh(true); });
      row.append(b);
    }
    if (row.children.length) foot.append(row);
  }

  function buildHero() {
    const body = sheet.body; body.textContent = ''; refs = {};
    sheet.sheet.setAttribute('aria-labelledby', 'csName');
    const c = heroClass();
    body.append(head('hero'));
    const hb = el('div', 'cs-xp'); const bar = el('div', 'xbar'); const fill = el('i'); bar.append(fill);
    fill.style.width = Math.min(100, S.xp / xpNeed() * 100) + '%';
    const hl = el('div', 'cs-xpline'); const lvb = el('b', null, 'Lv ' + S.L); const hn = el('small', 'cs-xpnote');
    hl.append(lvb, hn); hb.append(hl, bar); body.append(hb);
    refs.heroXp = fill; refs.heroXpTxt = hn;
    hn.textContent = `${Math.floor(Math.min(1, S.xp / xpNeed()) * 100)}% to Lv ${S.L + 1}`;
    if (c) {
      body.append(el('p', 'cs-bio pitch', '"' + c.pitch + '"'));
      const tap = el('div', 'cs-kit1'); tap.append(el('b', null, 'Tap: ' + c.tapName), el('p', null, c.how));
      const ab = el('div', 'cs-kit1'); ab.append(el('b', null, `${c.ability.name} · every ${c.ability.cd}s`), el('p', null, c.ability.desc));
      const auto = el('label', 'pc-auto');
      const box = el('input'); box.type = 'checkbox'; box.checked = !!S.party.autoCast;
      box.addEventListener('change', () => { S.party.autoCast = box.checked; save(); });
      auto.append(box, document.createTextNode(' Cast it for me when idle (from zone 10, half as often)'));
      ab.append(auto);
      const au = el('div', 'cs-kit1'); au.append(el('b', null, 'Class aura'), el('p', null, c.aura));
      body.append(section('Class', tap, ab, au));
    }
    const nouns = (S.party && HERO_GEAR_NOUN[S.party.cls]) || {};
    const g = el('div', 'cs-hgear');
    for (const s of HERO_SLOTS) {
      const it = s.old ? equipped(s.old) : null;
      const d = el('div', 'cs-hslot' + (s.old ? '' : ' soon'));
      d.append(it ? slotTile(it, null, 56) : slotTile(null, s.old ? SLOT[s.old].icon : s.id === 'off' ? 'banner' : 'helm', 56));
      d.append(el('small', null, nouns[s.id] || s.n));
      d.title = it ? itemName(it) : s.old ? 'Empty. Forge one in the Forge tab.' : 'Coming with crafting.';
      g.append(d);
    }
    body.append(section('Gear', g, el('p', 'note', 'Dashed slots arrive with crafting. Forge the rest in the Forge tab.')));
    const n = (S.party && S.party.mirrors) || 0;
    const mir = el('div', 'cs-mirror');
    const mt = el('div'); mt.append(el('b', null, `Mirror of Embers: ${n}`), el('small', null, n ? 'Use one to choose a new class. Your level and gear stay.' : 'Bosses from zone 36 sometimes drop one. It lets you change class.'));
    mir.append(mt);
    if (n > 0 && typeof useMirror === 'function') {
      const b = el('button', 'mini' + (mirrorArm ? ' warn' : ' go'), mirrorArm ? 'Tap again to use' : 'Use'); b.type = 'button';
      b.addEventListener('click', () => {
        if (!mirrorArm) { mirrorArm = true; buildHero(); return; }
        mirrorArm = false; partySheet.close(); if (useMirror()) { save(); ui(true); }
      });
      mir.append(b);
    }
    body.append(section('Class change', mir));
    sheet.foot.textContent = '';
  }

  const sigOf = k => {
    if (k === 'hero') return 'hero|' + S.party.cls + '|' + JSON.stringify(S.equip) + '|' + S.party.mirrors + '|' + S.L;
    const r = charRec(k);
    if (!r) return 'L|' + k + '|' + JSON.stringify(recruitCost(k)) + '|' + canRecruit(k) + '|' + JSON.stringify(pctOf(leadFor(k)));
    return [k, r.lv, r.rank, r.wpn, r.trk, r.seen, inField(k), JSON.stringify(S.party.cells && S.party.cells[k]), canPromote(k), xpInfo(k).atCap,
      JSON.stringify(safe(() => (synergiesFor(k) || []).map(s => s.id + s.active), [])), (S.party.field || []).join()].join('|');
  };
  function render(force) {
    if (!sheet || !who) return;
    const s = sigOf(who);
    if (!force && s === sig) {
      updateXp();
      if (refs.dps && who !== 'hero') refs.dps.textContent = fmt(safe(() => charDps(who), 0));
      if (refs.heroXp) { refs.heroXp.style.width = Math.min(100, S.xp / xpNeed() * 100) + '%'; refs.heroXpTxt.textContent = `${Math.floor(Math.min(1, S.xp / xpNeed()) * 100)}% to Lv ${S.L + 1}`; }
      return;
    }
    sig = s;
    const top = sheet.body.scrollTop;
    sheet.sheet.classList.toggle('small', who !== 'hero' && !isRecruited(who));
    if (who === 'hero') buildHero(); else buildChar(who);
    sheet.body.scrollTop = top;
  }
  function openFor(k) {
    who = k; sig = ''; openStory = -1; swapOpen = false; mirrorArm = false;
    const label = k === 'hero' ? S.name : C(k) ? C(k).name : k;
    sheet = openSheet(() => {}, { label, small: k !== 'hero' && !isRecruited(k), onClose: () => { who = null; sheet = null; refs = {}; } });
    sheet.sheet.classList.add('csheet');
    render(true);
  }
  partySheet = {
    open(k) { if (C(k) && live()) openFor(k); },
    openHero() { openFor('hero'); },
    refresh(force) { try { render(force); } catch (e) { console.error('[lanternfall] party sheet', e); } },
    close() { if (sheet) sheet.close(); },
    isOpen: () => !!sheet
  };
  for (const ev of ['promote', 'fieldChange', 'recruit', 'milestone', 'gear', 'mirrorDrop']) on(ev, () => { if (sheet) partySheet.refresh(); });
}
