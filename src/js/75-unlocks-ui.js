// 75-unlocks-ui: the Tavern visitor section (World tab, Tavern part) and the joining moment
// overlay shown when any character joins (B7). Browser-only. Logic lives in 56c-unlocks.js.
// Uses JOIN_LINES / QUOTES / RARITY_FRAME (21-stories.js) and portraitURL (60b-baker.js) when
// the character has art; otherwise a tinted stand-in sprite.
{
  const RARE_COL = r => (typeof RARITY_FRAME === 'object' && RARITY_FRAME[r] ? RARITY_FRAME[r].col : CHAR_RARITY[r].col);
  const hasArt = id => typeof portraitURL === 'function' && typeof RIG === 'object' && RIG.COMPANIONS && !!RIG.COMPANIONS[id];
  function charPortrait(id) {
    if (hasArt(id)) { try { const u = portraitURL(id); if (u) return u; } catch (e) {} }
    const c = ROSTER[id], i = c.idx, col = i >= 0 ? COMPS[i].col : RARE_COL(c.rarity), helm = i >= 0 ? COMPS[i].helm : '#3A2F47';
    return spriteURL('unl:' + id, SPR.hero, { ...HERO_PAL, 1: col, 2: helm });
  }
  const shortName = id => { const n = ROSTER[id].name, p = n.split(' '); return ['Ser', 'Saint', 'Old', 'Brother'].includes(p[0]) ? p.slice(0, 2).join(' ') : p[0]; };
  const roleName = id => ROLE_STATS[ROSTER[id].role].n;
  const untilMidnight = () => { const d = new Date(), m = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1); return Math.max(0, (m - d) / 1000); };

  // ---------------- Tavern visitor ----------------
  let V = null, vSig = '';
  registerSection('tav', {
    id: 'visitor', title: 'Visitor today',
    mount(sec) {
      // First in the Tavern, right under its heading.
      const panel = sec.parentNode, head = panel.querySelector('.world-head');
      panel.insertBefore(sec, head ? head.nextSibling : panel.firstChild);
      const card = el('div', 'vis-card');
      const pt = el('div', 'vis-pt'); pt.append(img(''));
      const body = el('div', 'vis-body');
      const nm = el('div', 'vis-nm'), sub = el('div', 'vis-sub'), note = el('p', 'vis-note'), say = el('p', 'vis-say');
      const cost = el('div', 'vis-cost');
      const btn = el('button', 'big vis-btn'); btn.type = 'button';
      body.append(nm, sub, say, note, cost);
      card.append(pt, body, btn);
      const foot = el('p', 'vis-foot');
      sec.append(card, foot);
      btn.addEventListener('click', () => {
        const v = visitorToday();
        let ok = false;
        if (v.kind === 'hire' && !v.done) ok = recruit(v.id);
        else if (v.kind === 'trade' && !v.done) ok = buyTrade();
        if (ok) { save(); ui(true); }
      });
      V = { sec, card, pt, ptImg: pt.firstChild, nm, sub, note, say, cost, btn, foot };
    },
    update() {
      if (!V || !rosterLive()) { if (V) V.sec.hidden = true; return; }
      V.sec.hidden = false;
      const v = visitorToday();
      const sig = [v.day, v.id, v.kind, v.done, S.maxZone >= 6].join('|');
      if (sig !== vSig) {
        vSig = sig;
        V.card.dataset.kind = v.kind;
        V.card.style.removeProperty('--rc');
        V.say.hidden = true;
        if (v.kind === 'hire') {
          const c = ROSTER[v.id];
          V.card.style.setProperty('--rc', RARE_COL(c.rarity));
          V.ptImg.src = charPortrait(v.id);
          V.nm.textContent = c.name;
          V.sub.textContent = `${c.title} · ${CHAR_RARITY[c.rarity].n} ${roleName(v.id)}`;
          const q = typeof QUOTES === 'object' && QUOTES[v.id];
          if (q && !v.done) { V.say.textContent = `"${q[v.day % q.length]}"`; V.say.hidden = false; }
        } else if (v.kind === 'trade') {
          V.ptImg.src = iconURL('mug', '#8C6A43');
          V.nm.textContent = v.name;
          V.sub.textContent = `Sells ${v.trade.n} ${MAT.ess.short[v.trade.t - 1]} Essence, once today`;
        } else {
          V.ptImg.src = iconURL('mug', '#6E6878');
          V.nm.textContent = 'The Tavern is quiet';
          V.sub.textContent = 'Travellers stop here once the road is safer';
        }
        V.note.textContent = v.note || '';
      }
      // Cost chips and the button change with gold, so they refresh every update.
      V.cost.textContent = '';
      const chip = (url, txt, short) => { const c = el('span', 'cost' + (short ? ' short' : '')); c.append(img(url), el('span', null, txt)); V.cost.append(c); };
      const c = v.cost;
      if (v.kind !== 'closed' && !v.done && c) {
        if (c.gold) chip(iconURL('coin', '#F2C14E'), fmt(c.gold), S.gold < c.gold);
        if (c.ess) { let have = 0; for (let i = c.ess[0] - 1; i < 5; i++) have += S.mats.ess[i]; chip(matIcon('ess', c.ess[0]), `${fmt(Math.min(have, c.ess[1]))}/${c.ess[1]} ${MAT.ess.short[c.ess[0] - 1]}`, have < c.ess[1]); }
      }
      V.cost.hidden = !V.cost.childNodes.length;
      if (v.kind === 'hire') {
        V.btn.hidden = false;
        V.btn.textContent = v.done ? 'Joined' : `Hire ${shortName(v.id)}`;
        V.btn.disabled = v.done || !canRecruit(v.id);
      } else if (v.kind === 'trade') {
        V.btn.hidden = false;
        V.btn.textContent = v.done ? 'Sold out' : 'Buy';
        V.btn.disabled = v.done || S.gold < c.gold;
      } else V.btn.hidden = true;
      const nx = v.next;
      const turn = `The next visitor arrives in ${fmtTime(untilMidnight())}.`;
      V.foot.textContent = nx ? `${nx.days === 1 ? 'Tomorrow' : `In ${nx.days} days`}: ${nx.name}. ${turn}` : turn;
    }
  });

  // ---------------- joining moment ----------------
  const queue = [];
  let ov = null, lastFocus = null;
  const blocked = () => !!document.querySelector('.away-ov, .create-ov, #create, .create');
  function closeJoin() {
    if (!ov) return;
    ov.remove(); ov = null;
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
    if (queue.length) setTimeout(showNext, reduced ? 0 : 180);
  }
  function showNext() {
    if (ov || !queue.length) return;
    if (blocked()) { setTimeout(showNext, 600); return; }
    const id = queue.shift(), c = ROSTER[id]; if (!c) return showNext();
    lastFocus = document.activeElement;
    ov = el('div', 'join-ov' + (reduced ? ' still' : ''));
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'joinName');
    ov.style.setProperty('--rc', RARE_COL(c.rarity));
    const card = el('div', 'join-card');
    card.append(el('div', 'join-eye', `A companion joins · ${CHAR_RARITY[c.rarity].n}`));
    const pt = el('div', 'join-pt'); pt.append(img(charPortrait(id)));
    card.append(pt);
    const h = el('h2', 'join-nm', c.name); h.id = 'joinName';
    card.append(h, el('div', 'join-title', `${c.title} · ${roleName(id)}`));
    const lines = (typeof JOIN_LINES === 'object' && JOIN_LINES[id]) || [`${c.name} walks with you now.`];
    const txt = el('div', 'join-txt');
    for (const l of lines) txt.append(el('p', l.startsWith('"') ? 'join-say' : 'join-line', l));
    card.append(txt);
    const go = el('button', 'big forge join-go', 'Continue'); go.type = 'button';
    card.append(go);
    ov.append(card);
    // One tap anywhere continues.
    ov.addEventListener('click', closeJoin);
    ov.addEventListener('keydown', e => { if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); if (e.key === 'Escape') closeJoin(); } });
    document.body.append(ov);
    go.focus();
  }
  on('recruit', ({ id, source }) => {
    if (source === 'starter' || source === 'test') return;   // the create screen shows the starter's moment
    if (!queue.includes(id)) queue.push(id);
    setTimeout(showNext, 0);
  });
}
