// 75-party: the Party tab (hero card, fielded companions, formation). Browser-only.
// Reads the Stage A contracts: S.party and HERO_CLASSES / castAbility (55-party.js, A1),
// portraitURL (60b-baker.js, A2). Every one of them is optional: without them the tab
// falls back to today's sprites and the old companion slots, and never throws.
{
  const hasParty = () => typeof S === 'object' && S.party && typeof S.party === 'object';
  const classes = () => (typeof HERO_CLASSES === 'object' && HERO_CLASSES) ? HERO_CLASSES : null;
  const curClass = () => { const C = classes(); return C && hasParty() && S.party.cls ? C[S.party.cls] || null : null; };

  const ROLE_NAME = { tank: 'Tank', striker: 'Striker', caster: 'Caster', support: 'Support' };
  const COL_NAME = ['Back', 'Mid', 'Front'];
  // Character key -> card info. idx is the old S.comp slot that pays for them (A1's map).
  const PARTY_CHARS = {
    tobin: { name: 'Tobin Reed', title: 'the Hedge Squire', role: 'tank', idx: 0 },
    wren: { name: 'Wren Hollowmere', title: 'the Batwing Archer', role: 'striker', idx: 1 },
    pip: { name: 'Pip Cinderly', title: 'the Hedge Mage', role: 'caster', idx: 2 },
    aldric: { name: 'Ser Aldric Vane', title: 'the Oathbound', role: 'tank', idx: 3 },
    kestrel: { name: 'Kestrel Thane', title: 'the Skyfall Dragoon', role: 'striker', idx: 4 },
    oriel: { name: 'Oriel Vess', title: 'the Starcaller', role: 'caster', idx: 5 },
    elowen: { name: 'Saint Elowen', title: 'the Last Lantern', role: 'support', idx: 6 },
    bram: { name: 'Bram Hollis', title: 'the Woodcutter', role: 'striker', idx: 0 },
    hesketh: { name: 'Old Hesketh', title: 'the Lamplighter', role: 'support', idx: -1 }
  };
  const IDX_KEY = ['tobin', 'wren', 'pip', 'aldric', 'kestrel', 'oriel', 'elowen'];
  // The 5 class gear slots. Weapon, head and charm are today's weapon, helm and charm;
  // off-hand and body arrive with crafting.
  const GEAR_NOUN = {
    warden: { weapon: 'Warblade', off: 'Shield', head: 'Greathelm', body: 'Plate' },
    lanternmage: { weapon: 'Staff', off: 'Lantern', head: 'Hood', body: 'Robe' },
    ranger: { weapon: 'Bow', off: 'Quiver', head: 'Hood', body: 'Leathers' },
    lightkeeper: { weapon: 'Censer', off: 'Tome', head: 'Mitre', body: 'Vestments' }
  };
  const GEAR_SLOTS = [
    { id: 'weapon', old: 'weapon', n: 'Weapon' }, { id: 'off', n: 'Off-hand' },
    { id: 'head', old: 'helm', n: 'Head' }, { id: 'body', n: 'Body' }, { id: 'charm', old: 'charm', n: 'Charm' }
  ];

  function heroPortrait() {
    if (typeof portraitURL === 'function') { try { const u = portraitURL('hero'); if (u) return u; } catch (e) {} }
    return spriteURL('hero-portrait', SPR.hero, HERO_PAL);
  }
  function compPortrait(key) {
    if (typeof portraitURL === 'function') { try { const u = portraitURL(key); if (u) return u; } catch (e) {} }
    const i = PARTY_CHARS[key] ? PARTY_CHARS[key].idx : -1, c = COMPS[i >= 0 ? i : 0];
    return spriteURL('comp' + (i >= 0 ? i : 0), SPR.hero, { ...HERO_PAL, 1: c.col, 2: c.helm });
  }
  // Fielded companions: S.party.field, else the 3 highest owned old slots (what A1 migrates to).
  function fieldKeys() {
    if (hasParty() && Array.isArray(S.party.field) && S.party.field.length) return S.party.field.filter(k => PARTY_CHARS[k]).slice(0, 3);
    const owned = []; for (let i = S.comp.length - 1; i >= 0 && owned.length < 3; i--) if (S.comp[i] > 0) owned.push(IDX_KEY[i]);
    return owned;
  }
  const pip = role => el('span', 'pip r-' + role, ROLE_NAME[role] || role);
  const portraitBox = (url, cls) => { const d = el('div', 'pt ' + (cls || '')); d.append(img(url)); return d; };

  // ---------- hero card ----------
  let heroRefs = null, heroSig = '';
  function buildHero(sec) {
    sec.querySelectorAll('.pcard, .note').forEach(n => n.remove());
    heroRefs = null;
    const c = curClass();
    const card = el('div', 'pcard hero');
    const top = el('div', 'pc-top');
    const pt = portraitBox(heroPortrait(), 'big');
    const who = el('div', 'pc-who');
    const nm = el('b', null, S.name);
    const sub = el('small', null, (c ? c.name : 'Wanderer') + ' · Lv ' + S.L);
    who.append(nm, sub);
    if (c) { const tags = el('div', 'pc-tags'); tags.append(pip(c.role)); if (c.tapName) tags.append(el('small', null, 'Tap: ' + c.tapName)); who.append(tags); }
    top.append(pt, who);
    card.append(top);
    const refs = { card, pt: pt.querySelector('img'), nm, sub };
    if (c && c.ability) {
      const ab = el('div', 'pc-ab');
      const line = el('div', 'pc-abline');
      const abTxt = el('div');
      abTxt.append(el('em', null, c.ability.name), document.createTextNode(': ' + (c.ability.desc || '')));
      const cast = el('button', 'mini go', 'Cast'); cast.type = 'button';
      cast.addEventListener('click', () => { if (typeof castAbility === 'function' && castAbility()) ui(true); });
      line.append(abTxt, cast);
      const cd = el('div', 'pc-cd'); cd.append(el('i'));
      const cdTxt = el('small', 'pc-cdtxt');
      const auto = el('label', 'pc-auto');
      const box = el('input'); box.type = 'checkbox';
      box.addEventListener('change', () => { if (hasParty()) { S.party.autoCast = box.checked; save(); } });
      auto.append(box, document.createTextNode(' Cast it for me when idle (from zone 10, half as often)'));
      ab.append(line, cd, cdTxt, auto);
      card.append(ab);
      Object.assign(refs, { cast, cdBar: cd.firstChild, cdTxt, box });
    }
    const gearBox = el('div', 'pc-gear');
    refs.gear = GEAR_SLOTS.map(g => {
      const t = el('div', 'pc-slot');
      const ic = icTile(iconURL('charm', '#3A2F47'), null, 'ghost');
      const lbl = el('small');
      t.append(ic, lbl); gearBox.append(t);
      return { g, t, ic, lbl };
    });
    card.append(gearBox, el('small', 'pc-gearnote', 'Dashed slots arrive with crafting. Forge the rest in the Forge tab.'));
    sec.append(card);
    heroRefs = refs;
  }
  function updateHero(sec) {
    const c = curClass();
    const sig = [hasParty() && S.party.cls, !!c, typeof portraitURL, JSON.stringify(S.equip)].join('|');
    if (sig !== heroSig || !heroRefs) { heroSig = sig; buildHero(sec); }
    const r = heroRefs;
    r.nm.textContent = S.name;
    r.sub.textContent = (c ? c.name : 'Wanderer') + ' · Lv ' + S.L;
    if (r.cdBar) {
      const cdMax = (c.ability && c.ability.cd) || 30, left = Math.max(0, +S.party.abilityCd || 0);
      r.cdBar.style.width = (100 - Math.min(100, left / cdMax * 100)) + '%';
      r.cdTxt.textContent = left > 0 ? `Ready in ${Math.ceil(left)}s · cooldown ${cdMax}s` : `Ready · cooldown ${cdMax}s`;
      r.cast.disabled = left > 0 || typeof castAbility !== 'function';
      if (document.activeElement !== r.box) r.box.checked = !!S.party.autoCast;
    }
    const nouns = (hasParty() && GEAR_NOUN[S.party.cls]) || {};
    for (const s of r.gear) {
      const it = s.g.old ? S.equip[s.g.old] : null;
      const noun = nouns[s.g.id] || s.g.n;
      if (it) {
        setIc(s.ic, itemIcon(it.slot || s.g.old, it.t, it.u), it.u ? 'legendary' : it.r);
        s.lbl.textContent = noun;
        s.t.title = itemName(it);
      } else if (s.g.old) {
        setIc(s.ic, iconURL(SLOT[s.g.old].icon, '#4E4060'), null, 'ghost');
        s.lbl.textContent = noun; s.t.title = 'Empty. Forge one in the Forge tab.';
      } else {
        setIc(s.ic, iconURL(s.g.id === 'off' ? 'banner' : 'helm', '#4E4060'), null, 'ghost');
        s.lbl.textContent = noun; s.t.title = 'Coming with crafting.';
        s.t.classList.add('soon');
      }
    }
  }

  // ---------- companions ----------
  let compSig = '', compRefs = [];
  function buildComps(box, keys) {
    box.textContent = ''; compRefs = [];
    if (!keys.length) { box.append(el('p', 'note', 'Nobody fights beside you yet. Hire companions in the Fight tab.')); return; }
    for (const k of keys) {
      const d = PARTY_CHARS[k];
      const card = el('div', 'pcard');
      const top = el('div', 'pc-top');
      const who = el('div', 'pc-who');
      const tags = el('div', 'pc-tags'); tags.append(pip(d.role));
      const stat = el('small', 'pc-stat');
      who.append(el('b', null, d.name), el('small', null, d.title), tags, stat);
      top.append(portraitBox(compPortrait(k)), who);
      card.append(top); box.append(card);
      compRefs.push({ k, d, stat });
    }
  }
  function updateComps(box) {
    const keys = fieldKeys();
    const sig = keys.join(',') + '|' + typeof portraitURL;
    if (sig !== compSig) { compSig = sig; buildComps(box, keys); }
    for (const r of compRefs) {
      const i = r.d.idx, n = i >= 0 ? S.comp[i] : 0;
      let dps = 0; try { dps = i >= 0 ? compDpsOne(i) * n : 0; } catch (e) {}
      r.stat.textContent = n > 0 ? `${fmt(n)} strong · ${fmt(dps)} DPS` : 'Joins the fight soon';
    }
  }

  // ---------- formation (read-only for Stage A) ----------
  let formSig = '';
  function cellsOf(keys) {
    const cells = hasParty() && S.party.cells && typeof S.party.cells === 'object' ? S.party.cells : {};
    const out = {};
    const put = (k, def) => { const c = cells[k] || def; if (c) out[k] = { col: Math.max(0, Math.min(2, c.col | 0)), lane: c.lane ? 1 : 0 }; };
    const c = curClass();
    const heroCol = c && c.row != null ? (typeof c.row === 'number' ? c.row : ({ back: 0, mid: 1, front: 2 })[c.row]) : 2;
    put('hero', { col: heroCol == null ? 2 : heroCol, lane: 1 });
    const roleCol = { tank: 2, striker: 1, caster: 0, support: 0 };
    keys.forEach((k, n) => put(k, { col: roleCol[PARTY_CHARS[k].role], lane: n % 2 }));
    return out;
  }
  function updateForm(grid) {
    const keys = fieldKeys(), cells = cellsOf(keys);
    const sig = JSON.stringify(cells) + typeof portraitURL + S.name;
    if (sig === formSig) return; formSig = sig;
    grid.textContent = '';
    for (const n of COL_NAME) grid.append(el('div', 'pf-h', n));
    const at = {};
    for (const k in cells) { const id = cells[k].lane + ':' + cells[k].col; (at[id] = at[id] || []).push(k); }
    for (let lane = 0; lane < 2; lane++) for (let col = 0; col < 3; col++) {
      const ks = at[lane + ':' + col] || [];
      const cell = el('div', 'pf-cell' + (ks.length ? ' occ' : '') + (ks.includes('hero') ? ' hero' : ''));
      cell.setAttribute('aria-label', `${COL_NAME[col]} row, ${lane ? 'lower' : 'upper'} lane: ${ks.length ? ks.map(k => k === 'hero' ? S.name : PARTY_CHARS[k].name).join(', ') : 'empty'}`);
      for (const k of ks) {
        cell.append(img(k === 'hero' ? heroPortrait() : compPortrait(k)));
        cell.append(el('span', 'who', k === 'hero' ? S.name : PARTY_CHARS[k].name.split(' ')[0]));
      }
      grid.append(cell);
    }
  }

  registerSection('party', {
    id: 'party-form', title: 'Formation',
    mount(sec) {
      const g = el('div', 'pform'); g.setAttribute('role', 'img'); sec.append(g);
      sec.append(el('p', 'note', 'Back, Mid and Front, as they stand on the stage. Moving people between rows comes with the next update.'));
    },
    update() { try { updateForm(document.querySelector('#sec-party-form .pform')); } catch (e) { console.error('[lanternfall] party formation', e); } }
  });
  registerSection('party', {
    id: 'party-hero', title: 'Your hero',
    mount(sec) {},
    update(force) { try { updateHero(document.getElementById('sec-party-hero')); } catch (e) { console.error('[lanternfall] party hero', e); } }
  });
  registerSection('party', {
    id: 'party-field', title: 'Fighting beside you',
    mount(sec) { sec.append(el('div', 'pcards')); },
    update() { try { updateComps(document.querySelector('#sec-party-field .pcards')); } catch (e) { console.error('[lanternfall] party companions', e); } }
  });
}
