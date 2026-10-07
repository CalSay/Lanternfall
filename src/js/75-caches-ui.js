// 75-caches-ui: the Lantern Cache card (card cache-core). Browser-only; the rules are in 55-caches.js.
// A cache shows through the moment layer (75-moments-ui): a big card, or, once the player is on auto-open, a medium banner unless it
// holds a look or a unique (or is the first Star, or zone 1's first boss). The card lists what the win paid, in the colour of the best
// thing inside. The drops this clear already queued as moments (the unique, the first Star, zone 1's boss card) fold into the cache card.
// This file loads before 75-moments-ui, so the moment layer's names are read inside the handler, never at load.
on('cacheOpen', v => {
  if (typeof moment !== 'function') return;
  if (!MOMENT_KINDS.cacheAuto) MOMENT_KINDS.cacheAuto = { tier: 'medium', eye: 'Lantern Cache', col: '#F2C14E', snd: 'mid' };
  const big = !v.auto || !!v.look || !!v.unique || v.starFirst || v.zone === 1;
  const lines = [];
  if (v.look) lines.push({ txt: `New lantern colour: ${v.look.n.replace(/ lantern$/, '')}`, icon: { ic: ['banner', v.look.col] } });
  if (v.unique) lines.push({ txt: `${v.unique.name}. A unique.`, icon: { item: v.unique.item } });
  if (v.star) lines.push({ txt: `Star: ${v.star.name}` });
  if (v.scroll) lines.push({ txt: v.scroll.name });
  if (v.trophy) lines.push({ txt: `${v.trophy.n} ${v.trophy.name}` });
  const pay = [];
  if (v.gold) pay.push(`${fmt(v.gold)} gold`);
  if (v.ess && !v.essFull) pay.push(`${v.ess} ${MAT.ess.short[v.tier - 1]} Essence`);
  if (pay.length) lines.push({ txt: pay.join(', ') });
  if (v.essFull) lines.push({ txt: 'Your Essence store is full, so some or all of this win\'s Essence may be lost. Build more room at the Camp.' });
  // the colour: a unique first, then the lantern colour, then a Star, then a Scroll
  const col = v.unique ? '#FF8A3D' : v.look ? v.look.col : v.star ? '#F2C14E' : v.scroll ? v.scroll.col : '#F2C14E';
  const icon = v.unique ? { item: v.unique.item } : { ic: ['banner', col] };
  const title = v.zone === 1 ? 'First boss down' : `Zone ${v.zone} cleared`;
  // the sub is one short line: the unique's odds (honest, with modifiers), else what a look does
  const sub = v.chance !== null && v.chance !== undefined ? `Unique chance on this win: ${v.chance}%.` : v.look && v.look.worn ? 'Your lantern burns it now.' : 'Here is what the win gave you.';
  const o = { title, sub, col, icon, lines };
  if (big && v.n >= CACHE_TUNE.autoFrom) o.actions = [{ txt: cacheAuto() ? 'Turn off auto-open' : 'Open the next ones automatically', fn: () => cacheSetAuto(!cacheAuto()) }];
  if (big) {
    // fold in what this clear already queued: zone 1's boss card, the unique, the Star
    for (let i = MOMENT_Q.length - 1; i >= 0; i--) {
      const q = MOMENT_Q[i];
      if (q.kind === 'boss' || (q.kind === 'unique' && v.unique && q.title === v.unique.name)
        || ((q.kind === 'starFirst' || q.kind === 'star') && v.star && q.title === v.star.name)) MOMENT_Q.splice(i, 1);
    }
  }
  moment(big ? 'cache' : 'cacheAuto', o);
});
