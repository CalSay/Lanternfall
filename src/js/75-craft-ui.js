// 75-craft-ui: the Craft tab (task K7). Browser-only. Tab id stays 'forge' (S.tab, goals).
// Spec: docs/design/gathering-and-crafting.md 6.2, with the owner decisions (random affix
// lines shown on the item, Reforge one line at the Enchanter's Table).
//
// Sections of the 'forge' tab (registerSection), top to bottom:
//   Stations   Forge, Workbench, Loom, Enchanter with skill level and XP bar (tap = filter)
//   Recipes    tier picker, For you / For your party / All, Masterwork trophy, one row per kind
//   Enchanter  (Enchanter's Table only) Transmute, and the Star Chart when K6 defines it
//   Your gear  the hero's 8 positions (tap = item sheet, or a picker when empty)
//   Bag        every item, equipped ones badged with the wearer's portrait; sort and filter
// The item sheet (bottom sheet from 75-party-sheet's openSheet) shows lines, compare, and
// Equip, Give to, Take off, Upgrade, Reforge a line and Salvage (in-page confirms only).
//
// Exposed: craftUI { openItem(id), pick(who, pos) }   who: 'hero' or a roster id; pos: a
//   hero position or 'wpn' / 'trk'. 75-party-sheet opens pick() from a companion's gear slot.
//
// K6 (55-crafting.js) actions are probed with typeof at call time, so this file works before
// K6 merges: craftItem(kind, t, {role, mw}), canCraft(kind, t) -> {ok, why}, upgradeItem(id),
// reforgeItem(id, idx), transmute(fam, fromT, fam, toT), salvageItem(id),
// equipChar(charId, itemId, pos), unequipChar(charId, pos), S.craft.troph[7].
// Without K6: crafting falls back to forgeItem, upgrades to upgradeEquipped (hero gear only),
// and Reforge, Transmute and companion gear show as not ready yet.

let craftUI = null;
{
  // ---------------- K6 probes ----------------
  const K6 = {
    craft: () => (typeof craftItem === 'function' ? craftItem : null),
    can: () => (typeof canCraft === 'function' ? canCraft : null),
    upgrade: () => (typeof upgradeItem === 'function' ? upgradeItem : null),
    reforge: () => (typeof reforgeItem === 'function' ? reforgeItem : null),
    transmute: () => (typeof transmute === 'function' ? transmute : null),
    equipChar: () => (typeof equipChar === 'function' ? equipChar : null),
    unequipChar: () => (typeof unequipChar === 'function' ? unequipChar : null),
    starChart: () => (typeof craftStarChart === 'function' ? craftStarChart : null)
  };
  const safe = (fn, dflt) => { try { const v = fn(); return v == null ? dflt : v; } catch (e) { console.error('[lanternfall] craft', e); return dflt; } };
  // Rebuilding a list between pointerdown and click would swallow the tap: while the player is
  // touching the screen, only forced refreshes (right after an action) rebuild.
  let touchAt = 0;
  document.addEventListener('pointerdown', () => { touchAt = Date.now(); }, true);
  const busy = () => Date.now() - touchAt < 1200;
  const act = (fn) => { const r = safe(fn, false); if (r) { save(); ui(true); } return r; };

  // ---------------- lookups ----------------
  const STATION_KEYS = Object.keys(CRAFT_STATIONS);
  const STATION_SHORT = { forge: 'Forge', bench: 'Workbench', loom: 'Loom', ench: 'Enchanter' };
  const STATION_TIER_FAM = { forge: 'ore', bench: 'wood', loom: 'fibre', ench: 'crystal' };
  const STATION_IC = { forge: () => iconURL('anvil', '#9A97B3'), bench: () => iconURL(...craftIcon('bow', 2)), loom: () => iconURL(...craftIcon('robe', 3)), ench: () => iconURL(...craftIcon('lantern', 3)) };
  const TRO_IC = ['tro_slime', 'tro_bat', 'tro_bones', 'tro_beetle', 'tro_spore', 'tro_golem', 'tro_wraith'];
  const ROLE_NAME = { tank: 'Tank', striker: 'Striker', caster: 'Caster', support: 'Support' };
  const troIcon = i => iconURL(...craftIcon(TRO_IC[i], 1));
  const troph = () => (S.craft && Array.isArray(S.craft.troph) ? S.craft.troph : [0, 0, 0, 0, 0, 0, 0]);
  const trophTotal = () => troph().reduce((a, b) => a + (b || 0), 0);
  const skillOfSt = st => CRAFT_STATIONS[st].skill;
  const lvOf = sk => (S.skills[sk] || { lv: 1 }).lv;
  const roster = () => (typeof rosterLive === 'function' && rosterLive() && typeof rosterList === 'function' ? safe(() => rosterList(), []) : []);
  const fielded = k => !!(S.party && Array.isArray(S.party.field) && S.party.field.includes(k));
  const firstName = k => (k === 'hero' ? 'You' : ROSTER[k] ? ROSTER[k].name.replace(/^(Ser|Old|Brother|Saint) /, '').split(' ')[0] : k);
  const portraitOf = k => {
    if (k === 'hero') { const p = $('portrait'); if (p && p.src) return p.src; }
    else if (typeof portraitURL === 'function') { const u = safe(() => portraitURL(k), ''); if (u) return u; }
    return spriteURL('hero-portrait', SPR.hero, HERO_PAL);
  };
  const frameOf = it => (it.u || it.lr ? 'legendary' : it.r);   // it.lr: a Legendary item (55-legend)
  const LG = () => (typeof legendUI === 'object' && legendUI ? legendUI : null);
  const lgPip = (tile, it) => { if (it && it.lg && !it.lr) tile.classList.add('lg-pip'); return tile; };
  const posName = pos => (CRAFT_POS[pos] ? CRAFT_POS[pos].n : pos);
  const itemIc = it => safe(() => itemIcon(it.slot, it.t, it.u), iconURL('charm', '#A9B1BD'));
  const kindLabel = k => { const d = CRAFT_KINDS[k]; return d ? d.noun : k; };
  const tierName = (k, t) => safe(() => kindName(k, t), kindLabel(k));

  // Who wears what: id -> { who: 'hero' | rosterId, pos }.
  function wearers() {
    const m = new Map();
    for (const p of CRAFT_HERO_POS) if (S.equip[p] != null) m.set(S.equip[p], { who: 'hero', pos: p });
    const rec = S.party && S.party.rec;
    if (rec) for (const [k, r] of Object.entries(rec)) for (const p of CRAFT_COMP_POS) if (r && r[p] != null) m.set(r[p], { who: k, pos: p });
    return m;
  }
  const wornBy = id => wearers().get(id) || null;
  const heroFits = k => { const d = CRAFT_KINDS[k]; return !!(d && d.pos && fits(k, d.pos, 'hero')); };
  // An item (not a kind): weapon and head uniques fit every class.
  const heroFitsIt = it => { const d = itemKind(it); return !!(d && d.pos && fits(it, d.pos, 'hero')); };
  const partyFits = k => { const d = CRAFT_KINDS[k]; return d && d.comp ? roster().filter(c => fits(k, d.comp, c)) : []; };
  const compItem = (k, pos) => { const r = typeof charRec === 'function' ? charRec(k) : null; return r && r[pos] != null ? itemById(r[pos]) : null; };

  // Stat line text, and whether it works before party combat.
  const lineTxt = l => l.map(([s, v]) => (CRAFT_STATS[s] ? craftFmtLine(s, v) : `${s} ${fmt(v)}`)).join(', ');
  const lineLive = l => l.every(([s]) => CRAFT_STATS[s] && CRAFT_STATS[s].live);
  // Split itemLines() back into base lines, affix lines (by index), Masterwork and unique text.
  function splitLines(it) {
    const d = itemKind(it), all = itemLines(it), out = [];
    let i = 0;
    const nb = d ? Math.min(d.base.length, all.length) : 0;
    for (; i < nb; i++) out.push({ g: 'base', l: [all[i]] });
    (Array.isArray(it.a) ? it.a : []).forEach(([aid], ai) => {
      const def = CRAFT_AFFIXES[aid]; if (!def) return;
      out.push({ g: 'affix', idx: ai, l: all.slice(i, i + def.give.length) }); i += def.give.length;
    });
    if (it.mw != null && craftTrophyLine(it.mw, it.slot, 1)) { out.push({ g: 'mw', l: [all[i]] }); i++; }
    if (it.u && UNIQ[it.u]) out.push({ g: 'uniq', txt: UNIQ[it.u].txt });
    return out;
  }
  function deltaTxt(k, v) {
    const s = CRAFT_STATS[k], unit = (s.f.match(/\{v\}(%|x)/) || [])[1] || '';
    const a = Math.abs(v), n = s.dp == null ? fmt(a) : a.toFixed(s.dp);
    return `${v > 0 ? '+' : '-'}${n}${unit}`;
  }

  // ---------------- UI state (memory only) ----------------
  const st8 = { st: null, tier: {}, filt: 'you', mw: null, role: {}, sort: 'power', bfilt: 'all', pick: '', focus: null, fresh: new Set(), tm: { fam: 'ore', t: 1 } };
  const openTier = st => {
    const lv = lvOf(skillOfSt(st)); let t = 1;
    for (let i = 1; i <= 5; i++) if (lv >= CRAFT_STATION_REQ[i - 1]) t = i;
    return t;
  };
  function initState() {
    if (st8.st) return;
    const cls = S.party && S.party.cls;
    st8.st = { warden: 'forge', lanternmage: 'bench', ranger: 'bench', lightkeeper: 'loom' }[cls] || 'forge';
    for (const s of STATION_KEYS) st8.tier[s] = openTier(s);
    st8.pick = S.fSlot + ':' + S.fTier + ':0';
  }
  // "Next up" goals set S.fSlot / S.fTier and open this tab: jump to that recipe.
  function syncGoalPick() {
    const key = S.fSlot + ':' + S.fTier + ':' + forgeGoalPicks; if (key === st8.pick) return;
    st8.pick = key;
    let k = S.fSlot; const d = CRAFT_KINDS[k]; if (!d) return;
    if (d.legacy) { const row = CRAFT_FITS[d.pos] || {}; const w = heroWho(); k = (row[w] && row[w][0]) || k; }
    st8.st = CRAFT_KINDS[k].st; st8.tier[st8.st] = Math.max(1, Math.min(5, S.fTier | 0 || 1)); st8.focus = k;
    if (!heroFits(k)) st8.filt = 'all';
  }

  // ---------------- craft checks ----------------
  const mwFor = k => (st8.mw != null && craftTrophyLine(st8.mw, k, 1) ? st8.mw : null);
  function localCan(k, t) {
    const d = CRAFT_KINDS[k], sk = skillOfSt(d.st), req = CRAFT_STATION_REQ[t - 1];
    if (lvOf(sk) < req) return { ok: false, why: `Needs ${SKILL[sk]} Lv ${req}` };
    if (bagFull()) return { ok: false, why: 'Your bag is full' };
    if (!hasMats(kindCost(k, t), t)) return { ok: false, why: 'Not enough materials' };
    return { ok: true, why: '' };
  }
  function canDo(k, t) {
    const f = K6.can();
    let r = f ? safe(() => f(k, t), null) : null;
    if (!r) r = localCan(k, t);
    const mw = mwFor(k);
    if (r.ok && mw != null && !(troph()[mw] > 0)) r = { ok: false, why: `No ${CRAFT_TROPHIES[mw].n} left` };
    return r;
  }
  const roleFor = k => st8.role[k] || (roster().filter(fielded).map(c => ROSTER[c].role)[0]) || 'striker';
  function doCraft(k, t) {
    if (!canDo(k, t).ok) return;
    const d = CRAFT_KINDS[k], opts = {};
    if (d.role === 'any') opts.role = roleFor(k);
    const mw = mwFor(k); if (mw != null) opts.mw = mw;
    const f = K6.craft();
    const it = safe(() => (f ? f(k, t, opts) : forgeItem(k, t)), null);
    if (it) { if (it.id != null) st8.fresh.add(it.id); save(); ui(true); }
  }

  // ================= Stations =================
  const stEls = {};
  registerSection('forge', {
    id: 'craft-stations', title: 'Stations',
    mount(sec) {
      const row = el('div', 'cf-stations'); row.setAttribute('role', 'group'); row.setAttribute('aria-label', 'Crafting stations');
      for (const s of STATION_KEYS) {
        const b = el('button', 'cf-st'); b.type = 'button'; b.dataset.st = s;
        b.setAttribute('aria-label', CRAFT_STATIONS[s].n);
        const lv = el('span', 'cf-st-lv');
        const top = el('span', 'cf-st-top'); top.append(img(STATION_IC[s]()), lv);
        const bar = el('span', 'bar cf-st-bar'); const fill = el('i'); bar.append(fill);
        if (s === 'forge') fill.id = 'smithBar'; // "Next up" skill goal scrolls here
        b.append(top, el('span', 'cf-st-n', STATION_SHORT[s]), bar);
        b.addEventListener('click', () => { st8.st = s; st8.focus = null; ui(true); });
        row.append(b); stEls[s] = { b, lv, fill };
      }
      const info = el('p', 'note cf-st-info');
      sec.append(row, info); stEls.info = info;
    },
    update() {
      initState(); syncGoalPick();
      for (const s of STATION_KEYS) {
        const e = stEls[s], sk = S.skills[skillOfSt(s)] || { lv: 1, xp: 0 };
        putAttr(e.b, 'aria-pressed', String(st8.st === s));
        putText(e.lv, `Lv ${sk.lv}`);
        putStyle(e.fill, 'width', Math.min(100, sk.xp / skillNeed(sk.lv) * 100) + '%');
      }
      const sk = skillOfSt(st8.st), s = S.skills[sk] || { lv: 1, xp: 0 };
      const next = CRAFT_STATION_REQ.find(r => r > s.lv);
      putText(stEls.info, `${CRAFT_STATIONS[st8.st].n}: ${SKILL[sk]} Lv ${s.lv}, ${fmt(s.xp)} / ${fmt(skillNeed(s.lv))} XP.` + (next ? ` Next tier at Lv ${next}.` : ' Every tier is open.'));
    }
  });

  // ================= Recipes =================
  let rec = null;
  function kindsFor(st) {
    return Object.keys(CRAFT_KINDS).filter(k => { const d = CRAFT_KINDS[k]; return d.st === st && !d.legacy; }); // Sword/Helm are no longer made
  }
  const POS_ORDER = [...CRAFT_HERO_POS, ...CRAFT_COMP_POS];
  const kindOrder = k => { const d = CRAFT_KINDS[k]; return POS_ORDER.indexOf(d.pos || d.comp || 'charm'); };
  function listFor(st, filt) {
    const all = kindsFor(st).sort((a, b) => kindOrder(a) - kindOrder(b));
    if (filt === 'all') return all;
    if (filt === 'party') return all.filter(k => partyFits(k).length);
    return all.filter(k => { const d = CRAFT_KINDS[k]; return heroFits(k) || (!d.pos && !d.comp); });
  }
  // Would a fresh Common of this tier beat what someone wears?
  function beats(k, t) {
    const d = CRAFT_KINDS[k], p = TIER_POW[t];
    const out = [];
    if (heroFits(k)) { const cur = itemById(S.equip[d.pos]); if (!cur || itemPower(cur) < p) out.push('hero'); }
    if (d.comp) for (const c of partyFits(k)) if (fielded(c)) { const cur = compItem(c, d.comp); if (!cur || itemPower(cur) < p) out.push(c); }
    return out;
  }
  function subFor(k) {
    const d = CRAFT_KINDS[k], bits = [];
    if (d.pos) bits.push(posName(d.pos) + (heroFits(k) ? '' : d.cls ? ` · ${HERO_CLASSES[d.cls] ? HERO_CLASSES[d.cls].name : d.cls}` : ''));
    if (d.comp) {
      const who = partyFits(k);
      const roleTxt = d.role === 'any' ? 'any companion' : ROLE_NAME[d.role] + 's';
      bits.push(`${d.pos ? 'also ' : ''}${d.comp === 'trk' ? 'Trinket' : 'weapon'} for ${who.length ? who.slice(0, 3).map(firstName).join(', ') + (who.length > 3 ? ` +${who.length - 3}` : '') : roleTxt}`);
    }
    if (!d.pos && !d.comp) bits.push('Special');
    return bits.join(' · ');
  }
  function recipeRow(k, t) {
    const d = CRAFT_KINDS[k], can = canDo(k, t);
    const row = el('div', 'cf-rec' + (can.ok ? ' ok' : '') + (st8.focus === k ? ' focus' : ''));
    row.dataset.kind = k;
    const tile = icTile(itemIcon(k, t));
    const body = el('div', 'cf-rec-b');
    const nm = el('div', 'cf-rec-n', tierName(k, t));
    const sub = el('div', 'cf-rec-s', subFor(k));
    const up = beats(k, t);
    if (up.length) sub.append(el('span', 'cf-up', up.includes('hero') ? 'Beats yours' : `Beats ${firstName(up[0])}'s`));
    body.append(nm, sub);
    const btn = el('button', 'cf-go', 'Craft'); btn.type = 'button'; btn.disabled = !can.ok;
    if (st8.focus === k) btn.id = 'forgeBtn';
    btn.setAttribute('aria-label', `Craft ${tierName(k, t)}`);
    btn.addEventListener('click', () => doCraft(k, t));
    const costs = el('div', 'costs cf-rec-c');
    costChips(costs, kindCost(k, t), t);
    const mw = mwFor(k);
    if (mw != null) {
      const have = troph()[mw] || 0, c = el('span', 'cost mw' + (have < 1 ? ' short' : ''));
      c.append(img(troIcon(mw)), el('span', null, `${have}/1 ${CRAFT_TROPHIES[mw].n}`)); costs.append(c);
    }
    row.append(tile, body, btn, costs);
    if (d.role === 'any') {
      const rs = el('div', 'cf-roles'); rs.append(el('span', 'cf-lbl', 'Bonus lines for'));
      const seg = el('div', 'seg cf-seg');
      for (const r of Object.keys(ROLE_NAME)) {
        const b = el('button', null, ROLE_NAME[r]); b.type = 'button'; b.setAttribute('aria-pressed', String(roleFor(k) === r));
        b.addEventListener('click', () => { st8.role[k] = r; ui(true); });
        seg.append(b);
      }
      rs.append(seg); row.append(rs);
    }
    if (!can.ok && can.why) row.append(el('div', 'cf-why', can.why));
    return row;
  }
  registerSection('forge', {
    id: 'craft-recipes', title: 'Recipes',
    mount(sec) {
      const filt = el('div', 'seg cf-seg cf-filt'); filt.setAttribute('aria-label', 'Show recipes');
      for (const [f, n] of [['you', 'For you'], ['party', 'For your party'], ['all', 'All']]) {
        const b = el('button', null, n); b.type = 'button'; b.dataset.f = f;
        b.addEventListener('click', () => { st8.filt = f; ui(true); });
        filt.append(b);
      }
      const tiers = el('div', 'seg cf-seg cf-tiers'); tiers.setAttribute('aria-label', 'Tier');
      for (let t = 1; t <= 5; t++) {
        const b = el('button'); b.type = 'button'; b.dataset.t = t;
        b.append(el('b', null, `Tier ${t}`), el('small'));
        b.addEventListener('click', () => { st8.tier[st8.st] = t; ui(true); });
        tiers.append(b);
      }
      const mwRow = el('div', 'cf-mw');
      const list = el('div', 'cf-list');
      sec.append(filt, tiers, mwRow, list);
      rec = { filt, tiers, mwRow, list, sig: '', mwSig: null, rows: {} };
    },
    update(force) {
      initState();
      const st = st8.st, t = st8.tier[st] || 1, lv = lvOf(skillOfSt(st));
      for (const b of rec.filt.children) putAttr(b, 'aria-pressed', String(b.dataset.f === st8.filt));
      for (const b of rec.tiers.children) {
        const i = +b.dataset.t, req = CRAFT_STATION_REQ[i - 1], open = lv >= req;
        putAttr(b, 'aria-pressed', String(i === t)); putToggle(b, 'locked', !open);
        putText(b.lastChild, open ? MAT[STATION_TIER_FAM[st]].short[i - 1] : `Lv ${req}`);
      }
      if (!force && busy()) return;   // never swap a row under the player's finger
      const tr = troph();
      // Masterwork picker: only when the player has a trophy. Rebuilt when the trophies or the pick change.
      if (st8.mw != null && !(tr[st8.mw] > 0)) st8.mw = null;
      const mwSig = tr.join() + '|' + st8.mw;
      if (mwSig !== rec.mwSig) {
        rec.mwSig = mwSig;
        rec.mwRow.textContent = '';
        if (tr.some(n => n > 0)) {
          rec.mwRow.append(el('span', 'cf-lbl', 'Masterwork'));
          const seg = el('div', 'cf-chips');
          const add = (i, label, icon) => {
            const b = el('button', 'cf-chip'); b.type = 'button'; b.setAttribute('aria-pressed', String(st8.mw === i));
            if (icon) b.append(img(icon)); b.append(el('span', null, label));
            b.addEventListener('click', () => { st8.mw = i; ui(true); });
            seg.append(b);
          };
          add(null, 'None');
          tr.forEach((n, i) => { if (n > 0) add(i, `${CRAFT_TROPHIES[i].n} ${n}`, troIcon(i)); });
          rec.mwRow.append(seg);
          if (st8.mw != null) {
            const m = CRAFT_TROPHIES[st8.mw].mw;
            rec.mwRow.append(el('p', 'note', `Adds 1 gold bonus line: ${CRAFT_STATS[m.gear].n}${m.tool ? ` (${CRAFT_STATS[m.tool].n} on tools)` : ' (not on tools)'}. Uses the trophy.`));
          }
        }
      }
      // The list is built once per station, tier, filter and recipe set. After that a row is rebuilt
      // only when what it shows changes (materials, can craft, who it beats, ...): see rowSig.
      let ks = listFor(st, st8.filt);
      const extra = st8.filt === 'you' && ks.length ? listFor(st, 'all').length - ks.length : 0;
      const sig = [st, t, st8.filt, ks.join(), extra, typeof craftItem, typeof canCraft].join('|');
      if (sig !== rec.sig) {
        rec.sig = sig; rec.rows = {};
        rec.list.textContent = '';
        if (!ks.length && st8.filt !== 'all') {
          rec.list.append(el('p', 'note', st8.filt === 'party' ? `Nothing at the ${CRAFT_STATIONS[st].n} fits your companions yet.` : `Nothing at the ${CRAFT_STATIONS[st].n} fits your class. See All, or try another station.`));
          ks = [];
        }
        for (const k of ks) { const row = recipeRow(k, t); rec.rows[k] = { row, sig: rowSig(k, t) }; rec.list.append(row); }
        if (extra > 0) rec.list.append(el('p', 'note', `${extra} more recipe${extra > 1 ? 's' : ''} here for other classes and companions. Tap All to see them.`));
      } else {
        for (const k of ks) {
          const r = rec.rows[k], rs = rowSig(k, t);
          if (!r || r.sig === rs) continue;
          const row = recipeRow(k, t); r.row.replaceWith(row); r.row = row; r.sig = rs;
        }
      }
      if (!ks.length) return;
      if (!rec.list.querySelector('#forgeBtn')) { const b = rec.list.querySelector('.cf-go'); if (b) b.id = 'forgeBtn'; }
    }
  });
  // Everything recipeRow(k, t) shows that can change while the list stays the same.
  function rowSig(k, t) {
    const can = canDo(k, t), mw = mwFor(k);
    const cost = Object.entries(kindCost(k, t)).map(([f, n]) => { const h = S.mats[f][t - 1]; return fmt(h) + (h < n ? '<' : '/') + fmt(n); }).join();
    return JSON.stringify([can.ok, can.why || '', st8.focus === k, subFor(k), beats(k, t), cost, mw, mw != null ? troph()[mw] || 0 : 0, CRAFT_KINDS[k].role === 'any' ? roleFor(k) : '']);
  }

  // ================= Enchanter's Table extras =================
  let ench = null;
  function doTransmute(fam, t, toT) {
    const f = K6.transmute(); if (!f) return;
    // Within one family (spec 3.5): the third argument repeats the family, the fourth is the
    // target tier (t + 1 = four up into one, t - 1 = one down into two).
    act(() => f(fam, t, fam, toT));
  }
  registerSection('forge', {
    id: 'craft-ench', title: "Enchanter's Table",
    mount(sec) {
      const card = el('div', 'card cf-tm');
      card.append(el('h3', null, 'Transmute'), el('p', 'note', 'Trade within one material. 4 of a tier make 1 of the next. 1 makes 2 of the tier below, once: what you break down cannot be broken down again.'));
      const fams = el('div', 'cf-fams'); fams.setAttribute('aria-label', 'Material');
      for (const f of CRAFT_FAMILIES) {
        const b = el('button', 'cf-fam'); b.type = 'button'; b.dataset.f = f; b.setAttribute('aria-label', MAT[f].n);
        b.append(img(matIcon(f, 1)), el('span', null, MAT[f].n));
        b.addEventListener('click', () => { st8.tm.fam = f; ui(true); });
        fams.append(b);
      }
      const tiers = el('div', 'cf-tmt');
      for (let t = 1; t <= 5; t++) {
        const b = el('button', 'cf-tmc'); b.type = 'button'; b.dataset.t = t;
        b.append(img(matIcon('ore', 1)), el('b'), el('small'));
        b.addEventListener('click', () => { st8.tm.t = t; ui(true); });
        tiers.append(b);
      }
      const acts = el('div', 'cf-tma');
      const upB = el('button', 'mini go'); upB.type = 'button';
      const dnB = el('button', 'mini'); dnB.type = 'button';
      upB.addEventListener('click', () => doTransmute(st8.tm.fam, st8.tm.t, st8.tm.t + 1));
      dnB.addEventListener('click', () => doTransmute(st8.tm.fam, st8.tm.t, st8.tm.t - 1));
      acts.append(upB, dnB);
      const why = el('p', 'note cf-why');
      card.append(fams, tiers, acts, why);
      const star = el('div', 'card cf-star'); star.hidden = true;
      sec.append(card, star);
      ench = { sec, fams, tiers, upB, dnB, why, star, sig: '' };
    },
    update(force) {
      initState();
      putHidden(ench.sec, st8.st !== 'ench');
      if (ench.sec.hidden) return;
      const { fam, t } = st8.tm, have = S.mats[fam], f = K6.transmute(), lv = lvOf('ench');
      const sig = [fam, t, have.join(), JSON.stringify((S.craft && S.craft.tmd) || {}), lv, !!f, typeof craftStarChart, S.party && S.party.unlock && S.party.unlock.starChart].join('|');
      if (!force && (sig === ench.sig || busy())) return;
      ench.sig = sig;
      ench.fams.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === fam)));
      ench.tiers.querySelectorAll('button').forEach(b => {
        const i = +b.dataset.t;
        b.setAttribute('aria-pressed', String(i === t));
        b.querySelector('img').src = matIcon(fam, i);
        b.querySelector('b').textContent = fmt(have[i - 1]);
        b.querySelector('small').textContent = MAT[fam].short[i - 1];
      });
      const nm = i => MAT[fam].short[i - 1];
      const U = CRAFT_TRANSMUTE.up, D = CRAFT_TRANSMUTE.down;
      ench.upB.textContent = t < 5 ? `${U.take} ${nm(t)} → ${U.give} ${nm(t + 1)}` : 'Top tier';
      ench.dnB.textContent = t > 1 ? `${D.take} ${nm(t)} → ${D.give} ${nm(t - 1)}` : 'Lowest tier';
      const upReq = t < 5 ? CRAFT_STATION_REQ[t] : 0;
      ench.upB.disabled = !f || t >= 5 || have[t - 1] < U.take || lv < upReq;
      const dn = f && t > 1 && have[t - 1] >= D.take ? canTransmute(fam, t, t - 1) : null;
      ench.dnB.disabled = !f || t <= 1 || have[t - 1] < D.take || !(dn && dn.ok);
      ench.why.textContent = !f ? 'Transmute opens with the next crafting update.' : t < 5 && lv < upReq ? `Trading up to ${nm(t + 1)} needs Enchanting Lv ${upReq}.` : dn && !dn.ok ? dn.why : '';
      // Star Chart (Oriel's recruit route): a recipe when K6 defines it as a kind or an action.
      const sc = K6.starChart(), made = !!(S.party && S.party.unlock && S.party.unlock.starChart);
      ench.star.hidden = !(sc && !CRAFT_KINDS.starchart);
      if (!ench.star.hidden) {
        ench.star.textContent = '';
        ench.star.append(el('h3', null, 'Star Chart'), el('p', 'note', made ? 'You made the Star Chart. Oriel Vess has seen it.' : "Chart the sky to draw Oriel Vess, the Starcaller, to your camp."));
        if (!made) {
          const b = el('button', 'big forge', 'Craft the Star Chart'); b.type = 'button';
          b.addEventListener('click', () => act(() => sc()));
          ench.star.append(b);
        }
      }
    }
  });

  // ================= Your gear =================
  let gearEls = null;
  registerSection('forge', {
    id: 'craft-gear', title: 'Your gear', view: 'gear',
    mount(sec) {
      const g = el('div', 'cf-gear');
      gearEls = {};
      for (const p of CRAFT_HERO_POS) {
        const b = el('button', 'cf-gs'); b.type = 'button';
        const tile = icTile(iconURL('charm', '#4E4060'), null, 'ghost');
        const lab = el('small', null, posName(p));
        const plus = el('span', 'cf-plus');
        tile.append(plus);
        b.append(tile, lab);
        b.addEventListener('click', () => { const id = S.equip[p]; if (id != null && itemById(id)) openItem(id); else pick('hero', p); });
        g.append(b); gearEls[p] = { b, tile, plus };
      }
      sec.append(g);
      gearEls.sig = '';
    },
    update(force) {
      const sig = JSON.stringify(S.equip) + S.items.length + heroWho() + S.items.reduce((a, i) => a + i.plus + (i.lg || ''), 0);
      if (!force && sig === gearEls.sig) return;
      gearEls.sig = sig;
      const EMPTY_IC = { weapon: 'sword', off: 'banner', helm: 'helm', body: 'plate', charm: 'charm', pick: 'pick', axe: 'axe', sickle: 'sickle' };
      const w = heroWho();
      if (w !== 'any') for (const p of ['weapon', 'helm']) { const k = ((CRAFT_FITS[p] || {})[w] || [])[0]; if (k && ICON[CRAFT_KINDS[k].ic]) EMPTY_IC[p] = CRAFT_KINDS[k].ic; }
      for (const p of CRAFT_HERO_POS) {
        const e = gearEls[p], it = itemById(S.equip[p]);
        if (it) { setIc(e.tile, itemIc(it), frameOf(it), it.lg && !it.lr ? 'lg-pip' : null); e.plus.textContent = it.plus ? '+' + it.plus : ''; e.b.setAttribute('aria-label', `${posName(p)}: ${itemName(it)}`); }
        else {
          const ic = EMPTY_IC[p]; setIc(e.tile, ICON[ic] ? iconURL(ic, '#6E6080') : iconURL('charm', '#6E6080'), null, 'ghost soon');
          e.plus.textContent = ''; e.b.setAttribute('aria-label', `${posName(p)}: empty. Choose gear.`);
        }
      }
    }
  });

  // ================= Bag =================
  let bag = null;
  const SORTS = { power: (a, b) => itemPower(b) - itemPower(a) || b.id - a.id, new: (a, b) => b.id - a.id, kind: (a, b) => (kindOrder(a.slot) - kindOrder(b.slot)) || itemPower(b) - itemPower(a) };
  registerSection('forge', {
    id: 'craft-bag', title: 'Bag', view: 'gear',
    mount(sec) {
      const head = sec.querySelector('.sec-title');
      const hw = el('div', 'sec-head'); sec.insertBefore(hw, head);
      const count = el('span', 'note cf-count'); count.id = 'bagCount';
      hw.append(head, count);
      const ctl = el('div', 'cf-bagctl');
      const filt = el('div', 'seg cf-seg'); filt.setAttribute('aria-label', 'Show');
      for (const [f, n] of [['all', 'All'], ['spare', 'Spare'], ['worn', 'Worn']]) {
        const b = el('button', null, n); b.type = 'button'; b.dataset.f = f;
        b.addEventListener('click', () => { st8.bfilt = f; ui(true); }); filt.append(b);
      }
      const sort = el('div', 'seg cf-seg'); sort.setAttribute('aria-label', 'Sort by');
      for (const [f, n] of [['power', 'Power'], ['new', 'New'], ['kind', 'Slot']]) {
        const b = el('button', null, n); b.type = 'button'; b.dataset.s = f;
        b.addEventListener('click', () => { st8.sort = f; ui(true); }); sort.append(b);
      }
      ctl.append(filt, sort);
      const grid = el('div', 'cf-bag');
      const note = el('p', 'note');
      sec.append(ctl, grid, note);
      bag = { count, filt, sort, grid, note, sig: '' };
    },
    update(force) {
      const n = bagCount();
      putText(bag.count, `${n} / ${CRAFT_BAG_MAX} spare`);
      putToggle(bag.count, 'full', n >= CRAFT_BAG_MAX);
      for (const b of bag.filt.children) putAttr(b, 'aria-pressed', String(b.dataset.f === st8.bfilt));
      for (const b of bag.sort.children) putAttr(b, 'aria-pressed', String(b.dataset.s === st8.sort));
      const w = wearers();
      const sig = [st8.bfilt, st8.sort, S.items.map(i => i.id + ':' + i.plus + ':' + i.r + ':' + (i.rf || 0) + (i.lg || '')).join(), [...w].map(([k, v]) => k + v.who).join(), [...st8.fresh].join()].join('|');
      if (!force && (sig === bag.sig || busy())) return;
      bag.sig = sig;
      let list = S.items.slice();
      if (st8.bfilt === 'spare') list = list.filter(i => !w.has(i.id));
      if (st8.bfilt === 'worn') list = list.filter(i => w.has(i.id));
      list.sort(SORTS[st8.sort]);
      bag.grid.textContent = '';
      for (const it of list) {
        const b = el('button', 'ic cf-tile f-' + frameOf(it) + (it.lg && !it.lr ? ' lg-pip' : '') + (st8.fresh.has(it.id) ? ' fresh' : '')); b.type = 'button';
        b.append(img(itemIc(it)));
        if (it.plus) b.append(el('span', 'cf-plus', '+' + it.plus));
        const wr = w.get(it.id);
        if (wr) { const bd = img(portraitOf(wr.who), 'cf-badge' + (wr.who === 'hero' ? ' hero' : '')); b.append(bd); }
        b.setAttribute('aria-label', `${itemName(it)}, ${it.lr ? 'Legendary' : RAR[it.r].n}${it.lg && LEG_POWERS[it.lg] ? ', ' + LEG_POWERS[it.lg].n : ''}${wr ? ', worn by ' + (wr.who === 'hero' ? 'you' : firstName(wr.who)) : ''}`);
        b.addEventListener('click', () => { st8.fresh.delete(it.id); openItem(it.id); });
        bag.grid.append(b);
      }
      bag.note.textContent = !S.items.length ? 'Crafted gear and boss loot land here.' : !list.length ? 'Nothing here with this filter.' : n >= CRAFT_BAG_MAX ? 'Your bag is full. New loot gets salvaged. Salvage spare items to make room.' : 'Worn items have a portrait badge and do not count toward the bag.';
    }
  });
  // Uniques wall goes last (73-ui-forge keeps it).
  { const tw = $('trophies'); const sec = tw && tw.closest('.sec'); if (sec) $('p-forge').append(sec); }

  // ================= item sheet =================
  let sheet = null, switching = false;
  function open(label, back, small) {
    switching = true;
    const api = openSheet(() => {}, { label, small, onClose: () => { if (sheet && sheet.api === api) sheet = null; if (!switching && back) setTimeout(() => safe(back), 0); } });
    switching = false;
    api.sheet.classList.add('cf-sheet');
    return api;
  }
  function openItem(id, back) {
    const it = itemById(id); if (!it) return;
    const api = open(itemName(it), back || (sheet && sheet.back));
    sheet = { api, id, back: back || null, mode: null, sel: -1, arm: null, flash: -1 };
    renderItem();
  }
  const secBox = (title, ...kids) => { const s = el('div', 'cf-ss'); if (title) s.append(el('h4', null, title)); s.append(...kids); return s; };
  function trophChip(need) {
    const have = trophTotal(), c = el('span', 'cost' + (have < need ? ' short' : ''));
    c.append(img(troIcon(0)), el('span', null, `${have}/${need} Trophy (any)`));
    return c;
  }
  function salvagePreview(it) {
    const d = itemKind(it), m = {};
    for (const [k, n] of Object.entries(d.rec)) { const v = Math.floor(n * (1 + 0.5 * (it.t - 1)) * 0.4 * (1 + it.plus * 0.3) * mod('salvage')); if (v > 0) m[k] = v; }
    if (it.u) m.ess = (m.ess || 0) + 10;
    return m;
  }
  function renderItem() {
    if (!sheet || sheet.api.closed) return;
    const it = itemById(sheet.id);
    if (!it) { const a = sheet.api; sheet = null; a.close(); return; }
    const d = itemKind(it), body = sheet.api.body, foot = sheet.api.foot, top = body.scrollTop;
    body.textContent = ''; foot.textContent = '';
    const wr = wornBy(it.id);
    // ---- head ----
    const head = el('div', 'cf-ih');
    const tile = lgPip(icTile(itemIc(it), frameOf(it)), it); tile.classList.add('s56');
    const who = el('div', 'cf-ihw');
    who.append(el('h3', 'cf-in rar-' + (it.lr ? 'legendary' : it.r), itemName(it)));
    const meta = [it.lr ? 'Legendary' : RAR[it.r].n, `Tier ${it.t}`, d ? (it.u ? posName(d.pos) : d.noun + (d.legacy ? ' (old style)' : '')) : ''].filter(Boolean).join(' · ');
    who.append(el('div', 'cf-im', meta));
    const fit = [];
    if (d && d.pos) fit.push(heroFitsIt(it) ? `${posName(d.pos)} for you` : `${posName(d.pos)} for ${d.cls && HERO_CLASSES[d.cls] ? 'a ' + HERO_CLASSES[d.cls].name : 'a hero with no class'}`);
    if (d && d.comp) fit.push(d.comp === 'trk' ? 'Trinket for any companion' : `${d.pos ? 'Also for' : 'Weapon for'} ${ROLE_NAME[d.role].toLowerCase()} companions`);
    who.append(el('div', 'cf-im', fit.join(' · ') + ` · Power ${fmt(itemPower(it))}`));
    if (wr) { const wb = el('div', 'cf-worn'); wb.append(img(portraitOf(wr.who)), el('span', null, wr.who === 'hero' ? `You wear it (${posName(wr.pos)})` : `${firstName(wr.who)} wears it`)); who.append(wb); }
    head.append(tile, who); body.append(head);

    // ---- lines ----
    const lines = el('div', 'cf-lines');
    let anyWait = false;
    for (const L of splitLines(it)) {
      const r = el('div', 'cf-line g-' + L.g + (sheet.flash === L.idx && L.g === 'affix' ? ' flash' : ''));
      if (L.g === 'uniq') { r.append(el('span', 'cf-lt', L.txt)); lines.append(r); continue; }
      const liveNow = lineLive(L.l);
      if (!liveNow) { r.classList.add('wait'); anyWait = true; }
      if (L.g === 'mw') r.append(img(troIcon(it.mw), 'cf-li'));
      const tx = el('span', 'cf-lt', lineTxt(L.l));
      r.append(tx);
      if (L.g === 'mw') r.append(el('small', 'cf-tag', 'Masterwork'));
      else if (L.g === 'affix') r.append(el('small', 'cf-tag', 'Bonus'));
      if (!liveNow) r.append(el('small', 'cf-wait', '(active with party combat)'));
      lines.append(r);
    }
    const lgl = LG() && safe(() => LG().lines(it), null);   // the power and circle mark lines (55-legend)
    if (lgl) lines.prepend(lgl);
    if (!lines.children.length) lines.append(el('p', 'note', 'No stats.'));
    const lgb = LG() ? safe(() => LG().itemBoxes(it, sheet, renderItem), []) : [];   // Learn (top), Inscribe, Mark
    body.append(...lgb.filter(b => b.dataset.top));
    body.append(secBox('What it does', lines));
    const tlb = typeof toolsUI === 'object' && toolsUI ? safe(() => toolsUI.itemBox(it), null) : null;   // tool mastery (75-tools-ui, H2)
    if (tlb) body.append(tlb);
    if (anyWait) body.append(el('p', 'note', 'Dimmed lines are stored on the item now and switch on when party combat arrives.'));
    body.append(...lgb.filter(b => !b.dataset.top));

    // ---- compare ----
    if (d && d.pos && heroFitsIt(it) && !(wr && wr.who === 'hero')) {
      const cur = itemById(S.equip[d.pos]);
      const box = el('div', 'cf-cmp');
      if (!cur) box.append(el('p', 'note', `You wear nothing as ${posName(d.pos)}. Everything above is a gain.`));
      else {
        box.append(el('p', 'note', `Against your ${itemName(cur)}:`));
        const a = itemStats(it), b = itemStats(cur), keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(k => CRAFT_STATS[k]);
        const pd = itemPower(it) - itemPower(cur);
        const rows = el('div', 'cf-dl');
        const addD = (label, v, txt) => { const r = el('div', 'cf-d ' + (v > 0 ? 'up' : 'dn')); r.append(el('span', null, label), el('b', null, txt)); rows.append(r); };
        if (Math.abs(pd) >= 0.05) addD('Power', pd, (pd > 0 ? '+' : '-') + fmt(Math.abs(pd)));
        for (const k of keys) { const v = (a[k] || 0) - (b[k] || 0); if (Math.abs(v) >= 0.05) addD(CRAFT_STATS[k].n + (CRAFT_STATS[k].live ? '' : '*'), v, deltaTxt(k, v)); }
        if (!rows.children.length) rows.append(el('p', 'note', 'Same stats.'));
        box.append(rows);
        if (it.u || cur.u) box.append(el('p', 'note', 'Unique effects are not in this list.'));
        if (keys.some(k => !CRAFT_STATS[k].live)) box.append(el('p', 'note', '* active with party combat'));
      }
      body.append(secBox('Compare', box));
    }

    // ---- wear: equip, give, take off ----
    const wear = [];
    if (d && d.pos && heroFitsIt(it)) {
      const b = el('button', 'big forge cf-act', wr && wr.who === 'hero' ? 'You wear it' : 'Equip'); b.type = 'button';
      b.disabled = !!(wr && wr.who === 'hero');
      b.addEventListener('click', () => equipHero(it.id, d.pos));
      wear.push(b);
    }
    const giveToggle = d && d.comp && heroFitsIt(it);
    if (giveToggle) {
      const b = el('button', 'big cf-act cf-give', sheet.mode === 'give' ? 'Hide companions' : 'Give to...'); b.type = 'button';
      b.addEventListener('click', () => { sheet.mode = sheet.mode === 'give' ? null : 'give'; renderItem(); });
      wear.push(b);
    }
    if (sheet.ask && sheet.ask.id === it.id) {   // a third legendary power: ask which comes off (55-legend)
      const q = el('div', 'cf-ask'); q.append(el('p', 'note warn', sheet.ask.why));
      const r = el('div', 'cf-wear');
      const no = el('button', 'big cf-act cf-keep', 'Cancel'); no.type = 'button'; no.addEventListener('click', () => { sheet.ask = null; renderItem(); });
      const yes = el('button', 'big forge cf-act', 'Take it off'); yes.type = 'button'; yes.addEventListener('click', () => { const a = sheet.ask; sheet.ask = null; equipHero(a.id, a.pos, true); });
      r.append(no, yes); q.append(r); foot.append(q);
    } else if (wear.length) { const r = el('div', 'cf-wear'); r.append(...wear); foot.append(r); }
    if (wr && wr.who !== 'hero') {
      const b = el('button', 'mini', `Take it off ${firstName(wr.who)}`); b.type = 'button';
      const f = K6.unequipChar(); b.disabled = !f;
      b.addEventListener('click', () => act(() => f(wr.who, wr.pos)) && renderItem());
      body.append(b);
    }
    if (d && d.comp && (sheet.mode === 'give' || !giveToggle)) body.append(giveList(it));

    // ---- upgrade ----
    const upBox = el('div', 'cf-up-box');
    if (it.plus >= 10) upBox.append(el('p', 'note', 'Fully upgraded (+10).'));
    else {
      const c = kindUpgradeCost(it), chips = el('div', 'costs');
      costChips(chips, c.mats, it.t, c.gold);
      if (c.troph) chips.append(trophChip(c.troph));
      const nextP = TIER_POW[it.t] * RAR[it.r].m * (1 + 0.15 * (it.plus + 1));
      upBox.append(el('p', 'note', `+${it.plus + 1}: power ${fmt(itemPower(it))} → ${fmt(nextP)}. Every line grows.`), chips);
      const f = K6.upgrade(), heroPos = wr && wr.who === 'hero' ? wr.pos : null;
      const okMats = hasMats(c.mats, it.t) && S.gold >= c.gold && (!c.troph || (f && trophTotal() >= c.troph));
      const b = el('button', 'big forge cf-act', `Upgrade to +${it.plus + 1}`); b.type = 'button';
      b.disabled = !okMats || (!f && !heroPos);
      b.addEventListener('click', () => { act(() => (f ? f(it.id) : upgradeEquipped(heroPos))); renderItem(); });
      upBox.append(b);
      if (!f && !heroPos) upBox.append(el('p', 'note', 'Equip it to upgrade it.'));
      else if (c.troph && !f) upBox.append(el('p', 'note', 'Trophy upgrades open with the next crafting update.'));
    }
    body.append(secBox('Upgrade', upBox));

    // ---- reforge ----
    if (Array.isArray(it.a) && it.a.length) body.append(secBox('Reforge a line', reforgeBox(it)));

    // ---- salvage ----
    const sv = el('div', 'cf-sv');
    if (wr) sv.append(el('p', 'note', wr.who === 'hero' ? 'You wear this. Equip something else before you salvage it.' : `${firstName(wr.who)} wears this. Take it off first.`));
    else if (sheet.arm === 'salvage') {
      const chips = el('div', 'costs'); costChips(chips, salvagePreview(it), it.t);
      chips.querySelectorAll('.cost').forEach(c => { c.classList.remove('short'); const s = c.querySelector('span'); s.textContent = s.textContent.replace(/^[^/]*\//, '+'); });
      sv.append(el('p', 'note warn', `Salvage ${itemName(it)}? It is gone for good. You get back about:`), chips);
      const r = el('div', 'cf-wear');
      const yes = el('button', 'big cf-act', 'Salvage it'); yes.type = 'button';
      const no = el('button', 'big cf-act cf-keep', 'Keep it'); no.type = 'button';
      yes.addEventListener('click', () => { const id = it.id; if (act(() => salvageItem(id))) { st8.fresh.delete(id); } renderItem(); });
      no.addEventListener('click', () => { sheet.arm = null; renderItem(); });
      r.append(no, yes); sv.append(r);
    } else {
      const b = el('button', 'mini warn cf-svb', 'Salvage'); b.type = 'button';
      b.addEventListener('click', () => { sheet.arm = 'salvage'; renderItem(); });
      sv.append(b);
    }
    body.append(secBox('Salvage', sv));
    body.scrollTop = top;
    sheet.flash = -1; // the reforged line flashes once
  }
  function reforgeBox(it) {
    const box = el('div', 'cf-rf');
    const f = K6.reforge(), cost = safe(() => reforgeCost(it), null), req = CRAFT_STATION_REQ[it.t - 1], lv = lvOf('ench');
    box.append(el('p', 'note', `At the Enchanter's Table. Pick one bonus line to reroll. Rarity and power stay.${it.rf ? ` Reforged ${it.rf} time${it.rf > 1 ? 's' : ''}: the price grows each time.` : ''}`));
    const opts = el('div', 'cf-rfo'); opts.setAttribute('role', 'radiogroup');
    const parts = splitLines(it).filter(L => L.g === 'affix');
    for (const L of parts) {
      const b = el('button', 'cf-rfl'); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(sheet.sel === L.idx));
      b.append(el('i'), el('span', null, lineTxt(L.l)));
      b.addEventListener('click', () => { sheet.sel = L.idx; sheet.arm = null; renderItem(); });
      opts.append(b);
    }
    box.append(opts);
    if (cost) { const chips = el('div', 'costs'); costChips(chips, cost.mats, it.t, cost.gold); box.append(chips); }
    const ok = f && cost && sheet.sel >= 0 && lv >= req && hasMats(cost.mats, it.t) && S.gold >= cost.gold;
    const armed = sheet.arm === 'reforge';
    const b = el('button', 'big cf-act ' + (armed ? 'cf-arm' : 'forge'), !f ? 'Reforge opens soon' : sheet.sel < 0 ? 'Pick a line to reforge' : armed ? 'Tap again to reforge' : 'Reforge this line'); b.type = 'button';
    b.disabled = !ok;
    b.addEventListener('click', () => {
      if (!armed) { sheet.arm = 'reforge'; renderItem(); return; }
      const idx = sheet.sel; sheet.arm = null;
      if (act(() => f(it.id, idx))) sheet.flash = idx;
      renderItem();
    });
    box.append(b);
    if (armed) { const c = el('button', 'mini', 'Cancel'); c.type = 'button'; c.addEventListener('click', () => { sheet.arm = null; renderItem(); }); box.append(c); }
    if (!f) box.append(el('p', 'note', 'Reforge opens with the next crafting update.'));
    else if (lv < req) box.append(el('p', 'note warn', `Needs Enchanting Lv ${req} for a tier ${it.t} item.`));
    return box;
  }
  function giveList(it) {
    const d = itemKind(it), pos = d.comp, box = el('div', 'cf-give-l');
    const f = K6.equipChar();
    const who = roster().filter(c => fits(it, pos, c)).sort((a, b) => (fielded(b) - fielded(a)) || a.localeCompare(b));
    if (!who.length) box.append(el('p', 'note', `None of your companions can use this. It fits ${d.role === 'any' ? 'any companion' : ROLE_NAME[d.role] + 's'}.`));
    const wr = wornBy(it.id);
    for (const c of who) {
      const cur = compItem(c, pos), row = el('div', 'cf-gr');
      const pt = el('div', 'cf-gp'); pt.append(img(portraitOf(c)));
      const tx = el('div', 'cf-gt');
      tx.append(el('b', null, firstName(c) + (fielded(c) ? '' : ' (bench)')));
      const dp = itemPower(it) - (cur ? itemPower(cur) : 0);
      const sm = el('small', null, cur ? `wears ${itemName(cur)} ` : `${posName(pos)} empty `);
      if (!(cur && cur.id === it.id)) sm.append(el('span', 'cf-d ' + (dp > 0 ? 'up' : 'dn'), `${dp >= 0 ? '+' : '-'}${fmt(Math.abs(dp))} power`));
      tx.append(sm);
      const on = wr && wr.who === c;
      const cw = typeof legendCanWear === 'function' && !on ? safe(() => legendCanWear(c, it, pos), null) : null;   // 1 power per companion
      if (cw && !cw.ok) tx.append(el('small', 'cf-why', cw.why));
      const b = el('button', 'mini ' + (on ? '' : 'go'), on ? 'Wearing' : 'Give'); b.type = 'button';
      b.disabled = on || !f || !!(cw && !cw.ok);
      b.addEventListener('click', () => { if (act(() => f(c, it.id, pos))) { sheet.mode = null; } renderItem(); });
      row.append(pt, tx, b); box.append(row);
    }
    if (!f) box.append(el('p', 'note', 'Companion gear opens with the next crafting update.'));
    return secBox('Give to', box);
  }
  // The hero carries 2 legendary powers: a third asks first ("Take off X?"); yes takes X off, then equips.
  function heroAsk(id, pos, yes) {
    const hc = typeof legendHeroCheck === 'function' ? safe(() => legendHeroCheck(id, pos), null) : null;
    if (!hc || hc.ok || hc.off == null) return null;
    if (yes) { safe(() => unwearItem(hc.off)); return null; }
    return { id, pos, off: hc.off, why: hc.why };
  }
  function equipHero(id, pos, yes) {
    const ask = heroAsk(id, pos, yes);
    if (ask) { sheet.ask = ask; renderItem(); return; }
    const wr = wornBy(id), un = K6.unequipChar();
    if (wr && wr.who !== 'hero') { if (!un) return; safe(() => un(wr.who, wr.pos)); }
    act(() => equipItem(id, pos));
    renderItem();
  }

  // ================= picker: choose gear for one position =================
  function pick(who, pos, back) {
    const isHero = who === 'hero';
    const label = `${isHero ? 'Your' : firstName(who) + "'s"} ${posName(pos).toLowerCase()}`;
    // From a companion's gear slot: closing goes back to their character sheet.
    const backFn = back || (!isHero ? () => { if (typeof partySheet === 'object' && partySheet) partySheet.open(who); } : null);
    const api = open(label, backFn, true);
    sheet = { api, id: null, back: backFn, picker: { who, pos } };
    let pAsk = null;   // the item whose "Take off X?" question shows
    const render = () => {
      if (!sheet || sheet.api !== api || api.closed) return;
      const body = api.body; body.textContent = '';
      const now = isHero ? itemById(S.equip[pos]) : compItem(who, pos);
      body.append(el('h3', 'cf-ph', label));
      const w = wearers();
      const list = S.items.filter(i => fits(i, pos, isHero ? 'hero' : who) && !(now && now.id === i.id)).sort(SORTS.power);
      if (now) {
        const r = el('div', 'cf-pr cur');
        const t = icTile(itemIc(now), frameOf(now)); r.append(t);
        const tx = el('div', 'cf-gt'); tx.append(el('b', 'rar-' + now.r, itemName(now)), el('small', null, 'Worn now. Tap for details.'));
        r.append(tx);
        tx.addEventListener('click', () => openItem(now.id, backFn)); t.addEventListener('click', () => openItem(now.id, backFn));
        if (!isHero) { const f = K6.unequipChar(); const b = el('button', 'mini', 'Take off'); b.type = 'button'; b.disabled = !f; b.addEventListener('click', () => { act(() => f(who, pos)); render(); }); r.append(b); }
        body.append(r);
      }
      if (!list.length) {
        const kinds = Object.keys(CRAFT_KINDS).filter(k => !CRAFT_KINDS[k].legacy && fits(k, pos, isHero ? 'hero' : who));
        const k = kinds[0];
        body.append(el('p', 'note', k ? `Nothing in your bag fits. Craft a ${CRAFT_KINDS[k].noun} at the ${CRAFT_STATIONS[CRAFT_KINDS[k].st].n}.` : 'Nothing in your bag fits here.'));
        if (k) {
          const b = el('button', 'big forge', `Go to the ${STATION_SHORT[CRAFT_KINDS[k].st]}`); b.type = 'button';
          b.addEventListener('click', () => { st8.st = CRAFT_KINDS[k].st; st8.filt = isHero ? 'you' : 'party'; st8.focus = k; sheet.back = null; switching = true; api.close(true); switching = false; setTab('make'); const t = $('forgeBtn'); if (t) t.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' }); });
          body.append(b);
        }
        return;
      }
      for (const it of list) {
        const r = el('div', 'cf-pr');
        const t = lgPip(icTile(itemIc(it), frameOf(it)), it);
        const tx = el('div', 'cf-gt');
        const dp = itemPower(it) - (now ? itemPower(now) : 0);
        const wr = w.get(it.id);
        tx.append(el('b', 'rar-' + (it.lr ? 'legendary' : it.r), itemName(it)));
        if (it.lg && LEG_POWERS[it.lg]) tx.append(el('small', 'rar-legendary', `${LEG_POWERS[it.lg].n} ${roman(safe(() => legendItemRank(it), 1) || 1)}`));
        const sm = el('small', null, (wr ? `${wr.who === 'hero' ? 'You wear it' : firstName(wr.who) + ' wears it'} · ` : ''));
        sm.append(el('span', 'cf-d ' + (dp > 0 ? 'up' : 'dn'), `${dp >= 0 ? '+' : '-'}${fmt(Math.abs(dp))} power`));
        tx.append(sm);
        t.addEventListener('click', () => openItem(it.id, backFn)); tx.addEventListener('click', () => openItem(it.id, backFn));
        const f = isHero ? null : K6.equipChar();
        const b = el('button', 'mini go', isHero ? 'Equip' : 'Give'); b.type = 'button';
        b.disabled = !isHero && !f;
        b.addEventListener('click', () => {
          if (isHero) {
            const q = heroAsk(it.id, pos, pAsk === it.id);
            if (q) { pAsk = it.id; render(); return; }
            pAsk = null;
            const wr2 = wornBy(it.id), un = K6.unequipChar(); if (wr2 && wr2.who !== 'hero') { if (!un) return; safe(() => un(wr2.who, wr2.pos)); } act(() => equipItem(it.id, pos));
          }
          else act(() => f(who, it.id, pos));
          render();
        });
        r.append(t, tx, b); body.append(r);
        if (isHero && pAsk === it.id) { const q = heroAsk(it.id, pos); if (q) { b.textContent = 'Take it off'; b.classList.remove('go'); b.classList.add('cf-armb'); r.append(el('p', 'note warn cf-askp', q.why)); } }
      }
      if (!isHero && !K6.equipChar()) body.append(el('p', 'note', 'Companion gear opens with the next crafting update.'));
    };
    sheet.render = render;
    render();
  }

  // Keep an open sheet in step with the game (materials and gold change while it is open).
  let sheetSig = '', sheetAt = 0;
  onTick(() => {
    if (!sheet || sheet.api.closed || busy() || Date.now() - sheetAt < 1000) return;
    sheetAt = Date.now();
    const s = JSON.stringify(S.mats) + S.gold.toFixed(0) + S.items.length + JSON.stringify(S.equip) + troph().join() + (S.skills.ench && S.skills.ench.lv) + (S.legend ? JSON.stringify(S.legend.book) + S.legend.sig.join() : '');
    if (s === sheetSig) return;
    sheetSig = s;
    if (sheet.picker) { if (sheet.render) safe(() => sheet.render()); } else safe(() => renderItem());
  });

  craftUI = { openItem: id => openItem(id), pick: (who, pos) => pick(who, pos) };
}
