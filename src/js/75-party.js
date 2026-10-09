// 75-party: the Hero tab (tab id 'party'). Browser-only. It shows the hero card (portrait, class, the ability's cast button,
// the gear row), the Stars entry and the rest of the tab's sections that other files register. Tapping the card opens the hero
// sheet (75-party-sheet.js). The team view, bench, line-up planner, combos, Bonds and roster were deleted with the party (W3-A).
{
  const { safe, heroClass, portrait, pip, slotTile, HERO_GEAR_NOUN, HERO_SLOTS, heroTitle } = PTY;
  const P = () => S.party;
  const setT = (n, t) => { if (n.textContent !== t) n.textContent = t; };
  const btn = (cls, text, fn) => { const b = el('button', cls, text); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; };
  let heroRefs = null, heroSig = '';
  function buildHero(box) {
    box.textContent = '';
    const c = heroClass();
    const card = el('div', 'pcard hero tap'); card.tabIndex = 0; card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${S.name}, open hero sheet`);
    const top = el('div', 'pc-top');
    const pt = el('div', 'pt big'); pt.append(img(portrait('hero')));
    const who = el('div', 'pc-who');
    const nm = el('b', null, S.name);
    const ctl = el('small', 'pc-ctitle'); ctl.hidden = true;   // the Codex title (57c), when the player picked one
    const sub = el('small');
    const tags = el('div', 'pc-tags'); if (c) tags.append(pip(c.role));
    who.append(nm, ctl, sub, tags);
    top.append(pt, who, el('span', 'pc-more', '›'));
    card.append(top);
    const refs = { card, nm, sub, ctl };
    if (c && c.ability) {
      const ab = el('div', 'pc-ab');
      const line = el('div', 'pc-abline');
      const sa = typeof abilityInfo === 'function' ? abilityInfo() : null;   // the hero's own ability
      const t = el('div'); t.append(el('em', null, sa ? sa.name : c.ability.name)); const cdTxt = el('small', 'pc-cdtxt'); t.append(cdTxt);
      const cast = btn('mini go pc-cast', 'Cast', e => { e.stopPropagation(); if (typeof castAbility === 'function' && castAbility()) ui(true); });
      line.append(t, cast);
      const cd = el('div', 'pc-cd'); cd.append(el('i'));
      ab.append(line, cd); card.append(ab);
      Object.assign(refs, { cast, cdBar: cd.firstChild, cdTxt });
    }
    const gearBox = el('div', 'pc-gear');
    const nouns = HERO_GEAR_NOUN[P().cls] || {};
    for (const s of HERO_SLOTS) {
      const pos = s.old || s.id, open = pos in S.equip;   // off-hand and body are hero positions since crafting (K4)
      const it = open ? equipped(pos) : null;
      const d = el('div', 'pc-slot' + (open ? '' : ' soon'));
      const tile = it ? slotTile(it) : slotTile(null, SLOT[pos] ? SLOT[pos].icon : pos === 'body' ? 'plate' : pos === 'off' ? 'banner' : 'helm');
      d.append(tile, el('small', null, nouns[s.id] || s.n));
      setTip(d, it ? itemName(it) : open ? 'Empty' : 'Coming with crafting');   // desktop-tooltips: was a title
      gearBox.append(d);
    }
    card.append(gearBox);
    const open = () => partySheet.openHero();
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); open(); } });
    box.append(card);
    heroRefs = refs;
  }
  function updateHero(box) {
    const c = heroClass();
    const sig = [P().cls, typeof portraitURL, JSON.stringify(S.equip), S.name].join('|');
    if (sig !== heroSig || !heroRefs) { heroSig = sig; buildHero(box); }
    const r = heroRefs;
    setT(r.sub, (c ? c.name : 'Wanderer') + ' · Lv ' + S.L);
    const ct = heroTitle(); setT(r.ctl, ct); putHidden(r.ctl, !ct);
    if (r.cdBar) {
      const sa = typeof abilityInfo === 'function' ? abilityInfo() : null;
      const cdMax = (sa ? sa.cd : c.ability.cd) || 30, left = Math.max(0, +P().abilityCd || 0);
      putStyle(r.cdBar, 'width', (100 - Math.min(100, left / cdMax * 100)) + '%');
      setT(r.cdTxt, left > 0 ? ` · ready in ${Math.ceil(left)}s` : ' · ready');
      putDisabled(r.cast, left > 0 || typeof castAbility !== 'function');
    }
  }

  // ================= companion cards =================
  let compSig = '', compRefs = [];

  // ================= sections =================
  const guard = (name, fn) => (...a) => { try { fn(...a); } catch (e) { console.error('[lanternfall] party ' + name, e); } };
  registerSection('party', {
    id: 'party-hero', title: 'Your hero', mount(sec) { sec.append(el('div', 'pc-herobox')); },
    update: guard('hero', () => updateHero(document.querySelector('#sec-party-hero .pc-herobox')))
  });
  // Keep an open sheet live while the tab updates.
  registerSection('party', { id: 'party-live', title: '', view: '*', mount(sec) { sec.hidden = true; }, update: guard('sheet', () => partySheet.refresh()) });
}
