// 75-away: the "While you were away" report card. Browser-only.
// showAwayReport(r) takes the report built by awayGains() + 55-stats.js (see there for its
// fields and for registerAwayLine). Shown when the player was gone 30s or more and
// something happened. Numbers count up; under prefers-reduced-motion they appear at once.
// Order (away-card-next-up-first, W8 card 3): results, the work limit, Next up, then one folded
// "More (n)" row holding every other registerAwayLine group (folded, never dropped).

let showAwayReport, awayLimitStep;
{
  const COIN = () => iconURL('coin', '#F2C14E');
  const IC = {
    sword: () => iconURL('sword', '#A9B1BD'),
    banner: () => iconURL('banner', '#F2C14E'),
    helm: () => iconURL('helm', '#6FCB6A'),
    flame: () => iconURL('flame', '#E0524F', { 5: '#FFB347', 7: '#FFF3C4' }),
    ember: () => iconURL('flame', '#B58CFF', { 5: '#D9C2FF', 7: '#FFFFFF' }),
    glass: () => iconURL('glass', '#F2E27A'),
    boss: () => iconURL('banner', '#E0524F', { 7: '#FFB347' })
  };
  const SKILL_IC = { mine: () => iconURL('pick', '#D08A4E'), wood: () => iconURL('axe', '#5FAE4E'), forage: () => iconURL('sickle', '#7DCB79'), smith: () => iconURL('anvil', '#6E6878') };

  const hm = s => fmtTime(s).replace(/ 0m$/, '');
  let root = null, lastFocus = null, anim = 0;

  function close() {
    if (!root) return;
    cancelAnimationFrame(anim); anim = 0;
    root.remove(); root = null;
    document.removeEventListener('keydown', onKey, true);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
    lastFocus = null;
    ui(true);
  }
  function onKey(e) {
    if (!root) return;
    const onMore = e.target && e.target.classList && e.target.classList.contains('away-more');
    const onGo = onMore || (e.target && e.target.classList && e.target.classList.contains('away-lgo'));
    // Space on More toggles the fold: stop it here so the fight's Space key (dodge) never sees it or cancels the toggle
    if (onMore && e.key === ' ') { e.stopPropagation(); return; }
    if (e.key === 'Escape' || (e.key === 'Enter' && !onGo)) { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === 'Tab') {
      // cycle through the Go buttons, More and Collect (a closed fold's Go buttons are skipped)
      const f = [...root.querySelectorAll('.away-lgo, .away-more, .away-go')].filter(b => !b.closest('.away-fold:not([open])') || b.matches('.away-more')), i = f.indexOf(document.activeElement);
      e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  }

  // A number that counts up from 0. fmtFn turns the current value into text.
  const counters = [];
  function num(cls, value, fmtFn) {
    const s = el('span', cls, fmtFn(value));
    counters.push({ s, value, fmtFn });
    return s;
  }
  function runCounters() {
    const list = counters.splice(0);
    if (reduced || !list.length) return;
    for (const c of list) c.s.textContent = c.fmtFn(0);
    const t0 = performance.now(), dur = 1100;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      for (const c of list) c.s.textContent = c.fmtFn(k >= 1 ? c.value : c.value * e);
      anim = k < 1 ? requestAnimationFrame(step) : 0;
    };
    anim = requestAnimationFrame(step);
  }

  function tile(icon, value, label, fmtFn, cls) {
    const t = el('div', 'away-tile' + (cls ? ' ' + cls : ''));
    t.append(img(icon), typeof value === 'number' ? num('away-v', value, fmtFn || (v => fmt(Math.floor(v)))) : el('span', 'away-v', value), el('span', 'away-l', label));
    return t;
  }
  function block(title) {
    const b = el('div', 'away-block');
    b.append(el('h4', 'away-h', title));
    return b;
  }

  // A line's Go button: closes the card, then runs the line's go().
  function goBtn(l) {
    const gb = el('button', 'mini go away-lgo', l.goLabel || 'Go');
    const aria = l.aria || (l.goLabel ? l.goLabel + ': ' + (l.txt || '') : '');
    if (aria) gb.setAttribute('aria-label', aria);
    gb.addEventListener('click', () => { close(); try { l.go(); } catch (e) { console.error('[lanternfall] away line go failed', e); } });
    return gb;
  }

  // away-limit-says-next-step (ruling 2026-10-08-first-night-covered, card 2): when the hero hit the away limit,
  // the bar gives both numbers and the box names the one next step. Read-only: it never changes the limit.
  awayLimitStep = function (r) {
    const H = 3600, max = CAMP_TUNE.awayMax;
    const raid = r.activity === 'raid';
    // a raid hit away keeps its old 4 h base (awayRaidCapH): the card never promises more raid time than that
    const limH = () => raid ? awayRaidCapH() : awayCapH();
    // the limit one level up, read with the real formulas (the level is put back at once; nothing is saved)
    const limWith = (set, get) => { const was = get(); try { set(was + 1); return limH(); } finally { set(was); } };
    const capH = raid ? awayRaidCapH() : r.cap / H;
    const cap = capH * H, worked = Math.min(r.t, cap), capped = r.secs > cap;
    const out = { cap, worked, capped, bar: '', rows: [] };
    if (!capped) return out;
    out.bar = raid ? `Your hero hit the raid boss for ${hm(worked)} of your ${hm(r.secs)} away.` : `Your hero worked ${hm(worked)} of your ${hm(r.secs)} away.`;
    const camp = typeof campOpen === 'function' && campOpen();
    const closed = S.hearth && S.hearth.cold ? 'Light the camp fire first.' : `Your camp opens at zone ${CAMP_TUNE.openZone}.`;
    const hearth = campLevel('hearth'), goCamp = id => () => emit('campGoto', { tab: 'world', view: 'camp', sel: '#camp-b-' + id });
    const goClosed = S.hearth && S.hearth.cold ? goCamp('hearth') : null;
    // the Storehouse filled before the limit: more hours would not have held more, so it names the Storehouse
    const full = !raid && (r.lines || []).some(l => l && /^Storehouse full/.test(String(l.txt || '')));
    if (full) {
      const st = campLevel('store'), to = st + 1, need = STORE_HREQ[to - 1];
      if (to >= STORE_TUNE.caps.length) out.rows.push({ icon: IC.glass, txt: 'Your Storehouse filled before your hero stopped.', sub: 'It is at its biggest. Spend from a full pile to gather more.' });
      else out.rows.push({ icon: IC.glass, txt: `Your Storehouse filled before your hero stopped. Storehouse Lv ${to} holds more.`,
        sub: !camp ? closed : hearth < need ? `Opens at Hearth ${need} (zone ${CAMP_HZ[need - 1]}).` : '',
        go: !camp ? goClosed : goCamp(hearth < need ? 'hearth' : 'store'), aria: `Go to the ${!camp || hearth < need ? 'Hearth' : 'Storehouse'}` });
      return out;
    }
    const w = campLevel('watch'), to = w + 1;
    const next = to > CAMP_B.watch.max ? capH : limWith(v => { S.camp.b.watch = v; }, () => campLevel('watch'));
    const need = Math.max(CAMP_HREQ[to - 1] || 99, CAMP_B.watch.opens || 1);
    // Watchtower 5 opens at Hearth 8 (zone 38), past the Hollow: in Chapter 1, Watchtower 4 is the camp's most
    const ch1 = S.maxZone <= PACE.region && CAMP_HZ[need - 1] > PACE.region;
    const sched = 'Gatherer jobs, trade runs and camp builds keep their own clocks.';
    if (next <= capH || ch1) {
      out.rows.push({ icon: IC.glass, txt: `${capH}h is the most your camp can do${ch1 && next > capH ? ' in Chapter 1' : ''}.`, sub: sched });
    } else {
      out.rows.push({ icon: IC.glass, txt: `Watchtower Lv ${to}: +${next - capH}h (${next}h).`,
        sub: !camp ? closed : hearth < need ? `Opens at Hearth ${need} (zone ${CAMP_HZ[need - 1]}).` : sched,
        go: !camp ? goClosed : goCamp(hearth < need ? 'hearth' : 'watch'), aria: `Go to the ${!camp || hearth < need ? 'Hearth' : 'Watchtower'}` });
    }
    // the Hourglass only while the raid is open (raid Embers buy it; a read-only check, the online layer is unchanged),
    // and only while a level still adds time to this limit
    const glass = RELICS.find(u => u.id === 'glass');
    const raidOpen = online.ready && (typeof isUnlocked !== 'function' || isUnlocked('raid'));
    if (raidOpen && glass && S.relic.glass < glass.cap) {
      const g = limWith(v => { S.relic.glass = v; }, () => S.relic.glass);
      if (g > capH) out.rows.push({ icon: IC.glass, txt: `Hourglass Lv ${S.relic.glass + 1}: +${g - capH}h, for raid Embers.`, go: () => emit('campGoto', { tab: 'world', view: 'raid', sel: '#relicRows' }), aria: 'Go to the Hourglass' });
    }
    return out;
  };

  function build(r) {
    root = el('div', 'away-ov');
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'awayTitle');
    const card = el('div', 'away-card');
    const body = el('div', 'away-body');
    // results on one side, what to do next on the other (side by side on a short landscape screen, 60-away.css)
    const res = el('div', 'away-res'), next = el('div', 'away-next');

    // ---- header: time away ----
    const top = el('div', 'away-top');
    const eyebrow = el('div', 'away-eye', 'While you were away'); eyebrow.id = 'awayTitle';
    top.append(eyebrow, el('div', 'away-time', hm(r.secs)));
    body.append(top);

    // ---- what the hero did ----
    const actIc = r.activity === 'gather' ? (SKILL_IC[skillOf(S.node.kind)] || SKILL_IC.mine)() : r.activity === 'raid' ? IC.flame() : IC.sword();
    const note = String(r.note || '').replace(/ \w+ is now level \d+\.$/, '');
    if (note && !r.turnCombat) { const n = el('p', 'away-note'); n.append(img(actIc), el('span', null, note)); res.append(n); }
    if (r.activity === 'fight') {
      const rule = el('p', 'away-rule');
      rule.append(img(IC.glass()), el('span', null, AWAY_RULE_TXT));
      res.append(rule);
    }

    // ---- headline numbers ----
    const tiles = el('div', 'away-tiles');
    if (r.kills) tiles.append(tile(IC.sword(), r.kills, 'Foes slain'));
    if (r.gold >= 1) tiles.append(tile(COIN(), r.gold, 'Gold', v => '+' + fmt(Math.floor(v)), 'gold'));
    if (r.xp >= 1) tiles.append(tile(IC.helm(), r.xp, 'Hero XP', v => '+' + fmt(Math.floor(v)), 'xp'));
    if (r.levels && r.levels.to > r.levels.from) tiles.append(tile(IC.helm(), `+${r.levels.to - r.levels.from}`, `Levels, now ${r.levels.to}`, null, 'xp'));
    if (r.zones && r.zones.to > r.zones.from) tiles.append(tile(IC.banner(), `+${r.zones.to - r.zones.from}`, 'Zones cleared'));
    if (r.bosses) tiles.append(tile(IC.boss(), r.bosses, 'Bosses beaten'));
    if (r.raidDmg >= 1) tiles.append(tile(IC.flame(), r.raidDmg, 'Raid damage', null, 'raid'));
    if (r.embers) tiles.append(tile(IC.ember(), r.embers, 'Embers', v => '+' + fmt(Math.floor(v)), 'ember'));
    if (tiles.children.length) { tiles.dataset.n = Math.min(3, tiles.children.length); res.append(tiles); }

    // ---- materials by family and tier ----
    if (r.mats && r.mats.length) {
      const b = block('Materials');
      for (const k of STOCK_FAMILIES) {   // the same list as the away diff (55-stats MAT_KINDS)
        const list = r.mats.filter(m => m.k === k); if (!list.length) continue;
        const row = el('div', 'away-mrow');
        row.append(el('span', 'away-fam', MAT[k].n));
        const chips = el('div', 'away-chips');
        for (const m of list) {
          const c = el('span', 'away-mat');
          c.title = matName(m.k, m.t);
          const txt = el('span', 'away-mt');
          txt.append(num('away-mn', m.n, v => '+' + fmt(Math.floor(v))), el('span', 'away-ms', MAT[m.k].short[m.t - 1]));
          c.append(img(matIcon(m.k, m.t)), txt);
          chips.append(c);
        }
        row.append(chips); b.append(row);
      }
      res.append(b);
    }

    // ---- items ----
    if (r.items && r.items.length) {
      const b = block(r.items.some(i => i.u) ? 'Loot found' : 'Items found');
      const grid = el('div', 'away-items');
      for (const it of r.items.slice(0, 8)) {
        const row = el('div', 'away-item' + (it.u ? ' uniq' : ''));
        const tx = el('div', 'away-it');
        tx.append(el('span', 'away-in rar-' + it.r, itemName(it)), el('span', 'away-ir', `${itemQual(it)} ${String((CRAFT_KINDS[it.slot] && CRAFT_KINDS[it.slot].noun) || (SLOT[it.slot] && SLOT[it.slot].n) || "item").toLowerCase()}`));
        row.append(icTile(itemIcon(it.slot, it.t, it.u), it.r), tx);
        grid.append(row);
      }
      if (r.items.length > 8) grid.append(el('p', 'note', `And ${r.items.length - 8} more in your bag.`));
      b.append(grid); res.append(b);
    }

    // ---- skills ----
    if (r.skills && r.skills.length) {
      const b = block('Skills');
      for (const s of r.skills) {
        const row = el('div', 'away-skill');
        const lv = el('span', 'away-lv');
        lv.append(el('span', 'away-from', String(s.from)), el('span', 'away-arrow', '→'), el('b', null, String(s.to)));
        row.append(img(SKILL_IC[s.k] ? SKILL_IC[s.k]() : IC.banner()), el('span', 'away-sn', SKILL[s.k] || s.k), lv);
        b.append(row);
      }
      res.append(b);
    }

    // ---- the hero's work limit, after the results ----
    const lim0 = el('div', 'away-limwrap');
    if (!r.turnCombat) {
    const L = awayLimitStep(r);
    if (r.cap) {
      const lim = el('div', 'away-lim'), bar = el('div', 'bar'), fill = el('i');
      fill.style.width = Math.min(100, L.worked / L.cap * 100) + '%';
      bar.append(fill);
      lim.append(bar, el('span', null, L.capped ? L.bar : r.activity === 'raid' ? `Your hero hit the raid boss for ${hm(L.worked)} of ${hm(L.cap)}` : `Your hero worked ${hm(L.worked)} of ${hm(L.cap)}`));
      lim0.append(lim);
    }
    for (const l of L.capped ? L.rows : []) {
      const cap = el('div', 'away-cap');
      const tx = el('div', 'away-ltx');
      tx.append(el('div', null, l.txt));
      if (l.sub) tx.append(el('div', 'away-lsub', l.sub));
      cap.append(img(l.icon()), tx);
      if (l.go) cap.append(goBtn(l));
      lim0.append(cap);
    }
    }
    if (lim0.children.length) next.append(lim0);

    // ---- lines from other systems (registerAwayLine) ----
    // A line may name its own block (group, e.g. 'Next up') and carry a Go button (go()).
    const groups = new Map();
    for (const l of r.extra || []) { const g = l.group || 'Also'; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(l); }
    // The base report carries Storehouse and Spillover explanations in lines. Their
    // material amounts are already above; keep the useful reason without listing gains twice.
    const gathering = (r.lines || []).filter(l => l && l.sub && !String(l.txt || '').startsWith('+'));
    if (gathering.length) groups.set('Gathering', [...(groups.get('Gathering') || []), ...gathering]);
    const blockOf = (title, lines) => {
      const b = block(title);
      for (const l of lines) {
        const row = el('div', 'away-line');
        const u = iconOf(l.icon); if (u) row.append(img(u));
        const tx = el('div', 'away-ltx');
        tx.append(el('div', 'away-lt', l.txt || ''));
        if (l.sub) tx.append(el('div', 'away-lsub', l.sub));
        row.append(tx);
        if (typeof l.go === 'function') row.append(goBtn(l));
        b.append(row);
      }
      return b;
    };
    // Next up comes straight after the results; every other group folds under one "More (n)" row
    const nu = groups.get('Next up');
    if (nu) { groups.delete('Next up'); const b = blockOf('Next up', nu); b.classList.add('away-nu'); next.append(b); }
    const n = [...groups.values()].reduce((a, ls) => a + ls.length, 0);
    if (n) {
      // a <details> fold (its summary is not a <button>, so a tool pressing the card's first button still meets a Go or
      // Collect); the lines are built on first open, so no hidden Go sits in the card before Collect
      const fold = el('details', 'away-fold'), more = el('summary', 'away-more', `More (${n})`);
      fold.append(more);
      fold.addEventListener('toggle', () => {
        if (!fold.open) return;
        if (fold.children.length === 1) for (const [title, lines] of groups) fold.append(blockOf(title, lines));
        try { more.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' }); } catch (e) {}
      });
      next.append(fold);
    }
    if (res.children.length) body.append(res);
    if (next.children.length) { body.append(next); if (res.children.length) body.classList.add('two'); }

    const foot = el('div', 'away-foot');
    const go = el('button', 'big home away-go', 'Collect');
    go.addEventListener('click', close);
    foot.append(go);
    card.append(body, foot);
    root.append(card);
    root.addEventListener('click', e => { if (e.target === root) close(); });
    return go;
  }

  showAwayReport = function (r) {
    // A fighter who earned nothing still gets the card: it says fighting stops and gathering continues.
    const quiet = r && r.turnCombat;
    if (!r || r.secs < 30 || (r.empty && !quiet) || r.empty === undefined && !quiet && !(r.lines && r.lines.length)) return;
    // C14: the report is one card through the notice policy, never a second set of pops.
    notify({ key: 'away-report', msg: `While you were away: ${hm(r.secs)}.`, kind: 'good' });
    if (root) close();
    counters.length = 0;
    lastFocus = document.activeElement;
    const go = build(r);
    document.body.append(root);
    document.addEventListener('keydown', onKey, true);
    runCounters();
    try { go.focus({ preventScroll: true }); } catch (e) {}
  };
}
