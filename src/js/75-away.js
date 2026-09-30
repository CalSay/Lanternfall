// 75-away: the "While you were away" report card. Browser-only.
// showAwayReport(r) takes the report built by awayGains() + 55-stats.js (see there for its
// fields and for registerAwayLine). Shown when the player was gone 30s or more and
// something happened. Numbers count up; under prefers-reduced-motion they appear at once.

let showAwayReport;
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
  const SKILL_IC = { mine: () => iconURL('pick', '#D08A4E'), wood: () => iconURL('axe', '#5FAE4E'), smith: () => iconURL('anvil', '#6E6878') };
  const FAMILY = { ore: 'Ore', wood: 'Logs', ess: 'Essence' };

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
    const onGo = e.target && e.target.classList && e.target.classList.contains('away-lgo');
    if (e.key === 'Escape' || (e.key === 'Enter' && !onGo)) { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === 'Tab') {
      // cycle through the Go buttons and Collect
      const f = [...root.querySelectorAll('.away-lgo, .away-go')], i = f.indexOf(document.activeElement);
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

  function build(r) {
    root = el('div', 'away-ov');
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'awayTitle');
    const card = el('div', 'away-card');
    const body = el('div', 'away-body');

    // ---- header: time away ----
    const top = el('div', 'away-top');
    const eyebrow = el('div', 'away-eye', 'While you were away'); eyebrow.id = 'awayTitle';
    top.append(eyebrow, el('div', 'away-time', hm(r.secs)));
    if (r.cap) {
      const lim = el('div', 'away-lim'), bar = el('div', 'bar'), fill = el('i');
      fill.style.width = Math.min(100, r.t / r.cap * 100) + '%';
      bar.append(fill);
      lim.append(bar, el('span', null, r.capped ? "Away limit reached" : `You worked ${hm(r.t)} of ${hm(r.cap)}`));
      top.append(lim);
    }
    if (r.capped) {
      const cap = el('div', 'away-cap');
      cap.append(img(IC.glass()), el('span', null, `You stop after ${hm(r.cap)} away. Hourglass relics and the Watchtower add more, up to 24 hours.`));
      top.append(cap);
    }
    body.append(top);

    // ---- what the party did ----
    const actIc = r.activity === 'gather' ? SKILL_IC[S.node.kind === 'wood' ? 'wood' : 'mine']() : r.activity === 'raid' ? IC.flame() : IC.sword();
    const note = String(r.note || '').replace(/ \w+ is now level \d+\.$/, '');
    if (note) { const n = el('p', 'away-note'); n.append(img(actIc), el('span', null, note)); body.append(n); }

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
    if (tiles.children.length) { tiles.dataset.n = Math.min(3, tiles.children.length); body.append(tiles); }

    // ---- materials by family and tier ----
    if (r.mats && r.mats.length) {
      const b = block('Materials');
      for (const k of ['ore', 'wood', 'ess']) {
        const list = r.mats.filter(m => m.k === k); if (!list.length) continue;
        const row = el('div', 'away-mrow');
        row.append(el('span', 'away-fam', FAMILY[k]));
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
      body.append(b);
    }

    // ---- items ----
    if (r.items && r.items.length) {
      const b = block(r.items.some(i => i.u) ? 'Loot found' : 'Items found');
      const grid = el('div', 'away-items');
      for (const it of r.items.slice(0, 8)) {
        const row = el('div', 'away-item' + (it.u ? ' uniq' : ''));
        const tx = el('div', 'away-it');
        tx.append(el('span', 'away-in rar-' + it.r, itemName(it)), el('span', 'away-ir', `${RAR[it.r].n} ${String((CRAFT_KINDS[it.slot] && CRAFT_KINDS[it.slot].noun) || (SLOT[it.slot] && SLOT[it.slot].n) || "item").toLowerCase()}`));
        row.append(icTile(itemIcon(it.slot, it.t, it.u), it.r), tx);
        grid.append(row);
      }
      if (r.items.length > 8) grid.append(el('p', 'note', `And ${r.items.length - 8} more in your bag.`));
      b.append(grid); body.append(b);
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
      body.append(b);
    }

    // ---- lines from other systems (registerAwayLine) ----
    // A line may name its own block (group, e.g. 'Next up') and carry a Go button (go()).
    const groups = new Map();
    for (const l of r.extra || []) { const g = l.group || 'Also'; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(l); }
    for (const [title, lines] of groups) {
      const b = block(title);
      for (const l of lines) {
        const row = el('div', 'away-line');
        const u = iconOf(l.icon); if (u) row.append(img(u));
        const tx = el('div', 'away-ltx');
        tx.append(el('div', 'away-lt', l.txt || ''));
        if (l.sub) tx.append(el('div', 'away-lsub', l.sub));
        row.append(tx);
        if (typeof l.go === 'function') {
          const gb = el('button', 'mini go away-lgo', 'Go');
          gb.addEventListener('click', () => { close(); try { l.go(); } catch (e) { console.error('[lanternfall] away line go failed', e); } });
          row.append(gb);
        }
        b.append(row);
      }
      body.append(b);
    }

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
    if (!r || r.secs < 30 || r.empty || r.empty === undefined && !(r.lines && r.lines.length)) return;
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
