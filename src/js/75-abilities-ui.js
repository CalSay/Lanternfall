// 75-abilities-ui: Hero tab > Abilities (docs/design/combat-turn-build.md "Where abilities sit"). Browser file.
// Core: 56e-abilities.js (abLearnInfo, abilityLearn, scrollCount), 59j-solo.js (soloEquip, soloEquipped), data 24c.
//   - The Scrolls you hold (shared by every hero), and what drops them.
//   - Your three slots (Q, W, E on the action bar): what sits in each; clear one.
//   - Every ability of the hero you play, in its three groups: name, kind, cooldown in turns, what it does, and:
//       learned       Slot 1 / 2 / 3 buttons put it in a slot (swapping if it sits in another)
//       can learn     "Learn" spends the Scroll (tap twice: it is never one stray tap)
//       locked        the level and the Scroll it needs
// Ability icons: the approved pack has the three starters (Echo Shot, Shield Bash, Fireball); the rest show a lettered
// tile until their icons are drawn (art freeze, owner 2026-09-30).
{
  const icon = id => (typeof soloIconURL === 'function' ? soloIconURL(id) : '');
  const KIND = { damage: 'Damage', buff: 'Buff', debuff: 'Debuff', passive: 'Passive', finisher: 'Finisher' };
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];
  let root = null, sig = '', armed = '';
  const heroNm = k => (typeof ROSTER === 'object' && ROSTER[k] ? ROSTER[k].name.split(' ')[0] : k);
  function tile(id) {
    const u = icon(id);
    if (u) { const i = el('img', 'ab-ic px'); i.alt = ''; i.src = u; return i; }
    const a = SOLO_ABILITIES[id]; return el('span', 'ab-ic ab-mono', ((a && (a.short || a.name)) || '?').slice(0, 2));
  }
  const persist = () => { try { save(); } catch (e) {} ui(true); };
  function build() {
    const k = soloHero(); if (!root) return;
    root.textContent = '';
    if (!k || typeof HERO_PATHS !== 'object' || !HERO_PATHS[k]) { root.append(el('p', 'note', 'Choose a hero first.')); return; }
    root.append(el('p', 'note ab-note', `${heroNm(k)} takes three abilities into a fight, in the slots Q, W and E. Learn more with Scrolls from zone bosses.`));
    if (typeof HERO_RESOURCE === 'object' && HERO_RESOURCE[k]) root.append(el('p', 'note ab-res', HERO_RESOURCE[k].txt));
    // the Scrolls
    const scrolls = el('div', 'ab-scrolls');
    for (const id of SCROLL_ORDER) {
      const n = scrollCount(id), s = SCROLLS[id];
      const c = el('span', 'ab-scroll' + (n ? ' has' : '')); c.style.setProperty('--scroll', s.col);
      c.append(el('i', 'ab-gem'), el('b', null, s.name), el('small', null, '× ' + n));
      c.title = `Tier ${ROMAN[s.tier]}. From ${s.from}.`;
      scrolls.append(c);
    }
    root.append(scrolls);
    root.append(el('p', 'note ab-src', 'The first win over each zone boss drops a Scroll. A replay drops one now and then. A higher Scroll can stand in for a lower one.'));
    // the slots
    const eq = soloEquipped(), slots = el('div', 'ab-slots');
    eq.forEach((id, i) => {
      const b = el('div', 'ab-slot' + (id ? '' : ' empty'));
      b.append(el('small', null, `Slot ${i + 1} · ${'QWE'[i]}`));
      if (id) {
        const a = SOLO_ABILITIES[id]; b.append(tile(id), el('b', null, a.name));
        const x = el('button', 'ab-clear', '×'); x.type = 'button'; x.setAttribute('aria-label', `Clear slot ${i + 1}`);
        x.addEventListener('click', () => { soloEquip(i, null); persist(); });
        b.append(x);
      } else b.append(el('b', null, 'Empty'));
      slots.append(b);
    });
    root.append(slots);
    // talents (24e, 56e): the points this hero has
    const tp = typeof talentPoints === 'function' ? talentPoints(k) : null;
    if (tp) root.append(el('p', 'note ab-tp', `Talent points: ${tp.free} free of ${tp.total}. Each learned ability, and your Attack, Parry and Dodge, has two talents: pick one for ${TALENT_TUNE.cost} points. You earn ${TALENT_TUNE.perLevel === 1 ? 'one' : TALENT_TUNE.perLevel} a level. Change them any time between fights.`));
    // the groups
    for (const path of HERO_PATHS[k]) {
      const g = el('div', 'ab-path'); g.append(el('h3', 'ab-pname', path.name));
      for (const id of path.ids) g.append(cardFor(k, id, eq));
      root.append(g);
    }
    // Attack, Parry and Dodge: talents only
    const basic = el('div', 'ab-path'); basic.append(el('h3', 'ab-pname', 'Attack, Parry and Dodge'));
    for (const [mv, nm] of [['attack', 'Attack'], ['parry', 'Parry'], ['dodge', 'Dodge']]) {
      const c = el('div', 'ab-card owned ab-basic'); c.append(el('b', 'ab-bname', nm));
      const own = mv === 'dodge' && typeof turnDodgeLine === 'function' ? turnDodgeLine(k) : '';   // Wren's Out of Reach (59k)
      if (own) c.append(el('p', 'ab-desc', own));
      const row = talentRow(k, k + ':' + mv); if (row) c.append(row);
      basic.append(c);
    }
    root.append(basic);
  }
  // the two talents of an ability (or of '<hero>:attack' etc.): tap one to take it, tap it again to give it back
  function talentRow(k, id) {
    if (typeof TALENTS !== 'object' || !TALENTS[id]) return null;
    const T = TALENTS[id], cur = (talentsOf(k) || {})[id] || '', tp = talentPoints(k), row = el('div', 'ab-tal');
    for (const c of ['a', 'b']) {
      const on = cur === c, can = on || !!cur || tp.free >= TALENT_TUNE.cost;
      const b = el('button', 'ab-talb' + (on ? ' on' : '')); b.type = 'button'; b.disabled = !can;
      b.setAttribute('aria-pressed', String(on));
      b.append(el('b', null, T[c].name), el('small', null, T[c].text));
      b.title = on ? 'Tap to give this talent back' : can ? `Take this talent (${TALENT_TUNE.cost} points)` : 'Not enough talent points';
      b.addEventListener('click', () => { if (talentSet(k, id, on ? null : c)) persist(); sig = ''; refresh(); });
      row.append(b);
    }
    return row;
  }
  function cardFor(k, id, eq) {
    const a = ABILITIES[id], i = abLearnInfo(k, id), where = eq.indexOf(id);
    const c = el('div', 'ab-card' + (i.owned ? ' owned' : i.why ? ' locked' : ' ready') + (a.kind === 'passive' ? ' passive' : ''));
    c.dataset.ab = id;
    const top = el('div', 'ab-top'), t = el('div', 'ab-t');
    const cd = a.kind === 'passive' ? 'Always on' : `${typeof turnCdFor === 'function' ? turnCdFor(id) : a.cd} turn cooldown`;
    t.append(el('b', null, a.name), el('small', null, `${KIND[a.kind]} · ${cd}` + (a.tier ? ` · Tier ${ROMAN[a.tier]}` : ' · Starter')));
    top.append(tile(id), t);
    c.append(top, el('p', 'ab-desc', a.desc));
    // its numbers at your power now (owner, 2026-10-02: in the details, never during a fight)
    const nums = typeof turnAbilityNumbers === 'function' ? turnAbilityNumbers(id) : '';
    if (nums) c.append(el('p', 'ab-nums', nums));
    if (a.perfect) c.append(el('p', 'ab-timed', `Timed: press again as the ring closes. Perfect: ${a.perfect}. A miss hits for 70%.`));
    const foot = el('div', 'ab-foot');
    if (i.owned) {
      for (let s = 0; s < 3; s++) {
        const b = el('button', 'ab-put' + (where === s ? ' on' : ''), `Slot ${s + 1}`); b.type = 'button';
        b.setAttribute('aria-pressed', String(where === s));
        b.addEventListener('click', () => { if (where === s) soloEquip(s, null); else soloEquip(s, id); persist(); });
        foot.append(b);
      }
    } else if (!i.why) {
      const pay = SCROLLS[i.payWith], b = el('button', 'big ab-learn'); b.type = 'button';
      putText(b, armed === id ? `Tap again to spend a ${pay.name}` : `Learn · ${pay.name}`);
      b.addEventListener('click', () => {
        if (armed !== id) { armed = id; sig = ''; refresh(); return; }
        armed = '';
        if (abilityLearn(k, id)) {
          toast(`${heroNm(k)} learned ${a.name}.`, 'good', null, 'normal');
          const e2 = soloEquipped(), free = e2.indexOf(null); if (free >= 0) soloEquip(free, id);
          persist();
        }
        sig = ''; refresh();
      });
      foot.append(b);
    } else {
      const s = SCROLLS[i.scroll];
      foot.append(el('span', 'ab-need', !i.lvOk ? `Needs level ${i.lv} and a ${s.name}` : `Needs a ${s.name}`));
    }
    c.append(foot);
    if (i.owned) { const row = talentRow(k, id); if (row) c.append(row); }
    return c;
  }
  function refresh() {
    if (!root || !root.isConnected) return;
    const k = soloHero(); if (!k) { if (sig !== 'none') { sig = 'none'; build(); } return; }
    const lv = soloLevels()[k], A = S.abil || {};
    const P = typeof turnPowerNow === 'function' ? turnPowerNow() : null;
    const s = [k, lv && lv.L, JSON.stringify(A.unl && A.unl[k]), JSON.stringify(A.scrolls), soloEquipped().join(), armed, P ? fmt(Math.round(P.U)) : '', JSON.stringify(A.tal && A.tal[k])].join('|');
    if (s === sig) return;
    sig = s; build();
  }
  registerView('party', { id: 'abilities', label: 'Abilities', order: 15, feature: 'party' });
  registerSection('party', { id: 'abilities', title: 'Abilities', view: 'abilities', feature: 'party',
    mount(sec) { sec.classList.add('ab-sec'); root = el('div', 'ab-root'); sec.append(root); sig = ''; refresh(); },
    update: () => { try { refresh(); } catch (e) { console.error('[lanternfall] abilities', e); } } });
  for (const ev of ['abilityLearned', 'scrollDrop', 'soloEquip', 'soloHero', 'levelup']) on(ev, () => { sig = ''; try { refresh(); } catch (e) {} });
}
