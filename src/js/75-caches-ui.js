// 75-caches-ui: the Lantern Cache card (card cache-core). Browser-only; the rules are in 55-caches.js.
// A cache shows through the moment layer (75-moments-ui): a big card, or, once the player is on auto-open, a medium banner unless it
// holds a look or a unique (or is the first Star, or zone 1's first boss). The card lists what the win paid, in the colour of the best
// thing inside. The drops this clear already queued as moments (the unique, the first Star, zone 1's boss card) fold into the cache card.
// This file loads before 75-moments-ui, so the moment layer's names are read inside the handler, never at load.
// boss-spoils-pick (Opus judge 2026-10-08): a zone 6 to 10 first clear that drops a Scroll asks which move it teaches now, when two or more
// moves of the hero in play can be learned with that Scroll. Up to three, in the Abilities list's order, never marked best; Keep the
// Scroll (or any other close) keeps it. A pick learns the move and slots it in a free slot, else opens Abilities on it to swap.
// Nothing new is paid. Events for the walk: choice 'spoils' and spoilsPick { zone, offered, taken } (taken: a move id or 'keep').
const SPOILS_TUNE = { from: 6, to: 10, max: 3 };
function spoilsMoves(v) {
  try {
    if (!v || !v.scroll || !(v.zone >= SPOILS_TUNE.from && v.zone <= SPOILS_TUNE.to) || typeof abLearnInfo !== 'function') return null;
    const k = soloHero(); if (!k || !HERO_ABILITIES[k]) return null;
    const ids = HERO_ABILITIES[k].filter(id => { const i = abLearnInfo(k, id); return i.why === '' && i.payWith === v.scroll.id; });
    return ids.length >= 2 ? { k, ids: ids.slice(0, SPOILS_TUNE.max) } : null;
  } catch (e) { return null; }
}
function spoilsPicks(v, sp) {
  const sid = v.scroll.id, done = taken => { emit('choice', 'spoils'); emit('spoilsPick', { zone: v.zone, offered: sp.ids.length, taken }); };
  const learn = id => {
    const k = sp.k, i = abLearnInfo(k, id);
    if (soloHero() !== k || i.why || i.payWith !== sid || !abilityLearn(k, id)) { done('keep'); return; }   // the card waited and the move went: the Scroll stays
    const free = soloEquipped().indexOf(null);
    if (free >= 0) soloEquip(free, id);
    else { if (typeof abilityOpenDetail === 'function') abilityOpenDetail(id); setTab('abilities', '#sec-abilities'); }   // all slots full: Abilities, on the move, has "Swap it in for:"
    try { save(); } catch (e) {}
    try { ui(true); } catch (e) {}   // the fight bar shows the slotted move now
    done(id);
  };
  return { pickHead: 'Learn one now:', goTxt: 'Keep the Scroll', onKeep: () => done('keep'),
    picks: sp.ids.map(id => ({ txt: ABILITIES[id].name, sub: ABILITIES[id].line, fn: () => learn(id) })) };
}
on('cacheOpen', v => {
  if (typeof moment !== 'function') return;
  if (!MOMENT_KINDS.cacheAuto) MOMENT_KINDS.cacheAuto = { tier: 'medium', eye: 'Lantern Cache', col: '#F2C14E', snd: 'mid' };
  const sp = spoilsMoves(v);
  const big = !v.auto || !!v.look || !!v.unique || v.starFirst || v.zone === 1 || !!sp;   // a pick needs the card (zones 6 to 10 only)
  const lines = [];
  if (v.look) lines.push({ txt: `New lantern colour: ${v.look.n.replace(/ lantern$/, '')}`, icon: { ic: ['banner', v.look.col] } });
  if (v.unique) {
    lines.push({ txt: `${v.unique.name}. A unique.`, icon: { item: v.unique.item } });
    const wn = typeof momentWearNote === 'function' ? momentWearNote(v.unique.item) : null; if (wn) lines.push(wn);   // Cal's play note 9: say where a unique you cannot wear went
  }
  if (v.star) lines.push({ txt: `Star: ${v.star.name}` });
  if (v.trophy) lines.push({ txt: `${v.trophy.n} ${v.trophy.name}` });
  const pay = [];
  if (v.scroll) pay.push(v.scroll.name);
  if (v.gold) pay.push(`${fmt(v.gold)} gold`);
  if (v.ess && !v.essFull) pay.push(`${v.ess} Essence`);
  if (pay.length) lines.push({ txt: pay.join(', ') });
  if (v.essFull) lines.push({ txt: 'Your Essence store is full, so some or all of this win\'s Essence may be lost. Build more room at the Camp.' });
  // the colour: a unique first, then the lantern colour, then a Star, then a Scroll
  const col = v.unique ? '#FF8A3D' : v.look ? v.look.col : v.star ? '#F2C14E' : v.scroll ? v.scroll.col : '#F2C14E';
  const icon = v.unique ? { item: v.unique.item } : { ic: ['banner', col] };
  const title = v.zone === 1 ? 'First boss down' : `Zone ${v.zone} cleared`;
  // the sub is one short line: the unique's odds (honest, with modifiers), else what a look does
  const sub = v.chance !== null && v.chance !== undefined ? `Unique chance on this win: ${v.chance}%.` : v.look && v.look.worn ? 'Your lantern burns it now.' : 'Here is what the win gave you.';
  const o = { title, sub, col, icon, lines, zone: v.zone };
  if (sp) Object.assign(o, spoilsPicks(v, sp));
  o.actions = [];
  if (v.unique && typeof momentEquipAction === 'function') { const eq = momentEquipAction(v.unique.item); if (eq) o.actions.push(eq); }   // Cal's play note 9: the unique is one tap from being worn
  if (big && !sp && v.n >= CACHE_TUNE.autoFrom) o.actions.push({ txt: cacheAuto() ? 'Turn off auto-open' : 'Open the next ones automatically', fn: () => cacheSetAuto(!cacheAuto()) });
  const barks = v.zone === 1 ? ['boss1'] : [];
  const ci = MOMENT_Q.findIndex(q => q.kind === 'champion' && q.zone === v.zone);   // champion-moment: a Champion's first clear queued its own card (75-moments-ui)
  if (big || ci >= 0) {
    // fold in what this clear already queued: zone 1's boss card, the unique, the Star
    for (let i = MOMENT_Q.length - 1; i >= 0; i--) {
      const q = MOMENT_Q[i];
      if (q.kind === 'boss' || (q.kind === 'unique' && v.unique && q.title === v.unique.name)
        || ((q.kind === 'starFirst' || q.kind === 'star') && v.star && q.title === v.star.name)) { if (q.bark) barks.push(q.bark); MOMENT_Q.splice(i, 1); }
    }
    // the hero's line for what the card now carries (55-voice): the strongest of the folded moments' barks
    if (barks.length && typeof voicePick === 'function') o.bark = voicePick(barks);
  }
  // the cache folds into that card, so the win is one card
  const cj = ci >= 0 ? MOMENT_Q.findIndex(q => q.kind === 'champion' && q.zone === v.zone) : -1;   // the fold loop above spliced, so ci may be stale
  if (cj >= 0) {
    const c = MOMENT_Q.splice(cj, 1)[0];
    if (c.bark) barks.push(c.bark);
    if (barks.length && typeof voicePick === 'function') o.bark = voicePick(barks);
    moment('champion', Object.assign(o, { title: c.title, eye: c.eye, scene: c.scene, lines: (c.lines || []).concat(o.lines) }));   // the Champion card's own lines (a starter joining) stay on top
    return;
  }
  moment(big ? 'cache' : 'cacheAuto', o);
});
