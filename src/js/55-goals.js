// 55-goals: "Next Up", the goals closest to done across every system (camp.md N11).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// registerGoal({ id, sys, label, pct, go, icon, prio }) -> remove()
//   id     unique string
//   sys    system name ('boss', 'roster', 'bounty', ...); topGoals shows at most 1-2 per sys
//   label  string or fn() -> short player text ("Maren: 2 levels to Promote")
//   pct    fn() -> progress 0..1; >= 1 means ready (shown first, as "Ready");
//          null/undefined/NaN/<= 0 hides the goal. Keep it cheap: it runs about 2x a second.
//   go     where the Go button takes the player (read by 75-goals-ui.js):
//          { tab: 'adv'|'party'|'gat'|'forge'|'world'|'raid'|'tav', view, sel: '#css-selector', fn() }
//          fn (optional) runs first, e.g. to preselect a forge recipe. Or a plain fn().
//          The UI opens the menu and sub-view that hold sel; view (optional, a registerView id
//          such as 'bounties' or 'almanac') picks the sub-view when there is no sel.
//   icon   optional toast-style icon spec or fn() -> spec ({ ic: [name, colour] }, { mat: [k, t] },
//          { item }, a URL); the UI also takes { mob: typeKey } and { char: rosterId }
//   prio   optional number or fn() -> number (default 0); breaks ties and orders ready goals (higher first)
//   cap    optional 1: the diversity pass never takes a second goal from this sys (deeds, story)
//   reserve optional 1: when the goal has something to show it keeps one row of its own (n >= 3), taking
//          the place of the lowest other pick, so Ready goals cannot crowd it out (the deeds nudge, AP6)
// topGoals(n = 3, { now, sticky = true }) -> [{ id, sys, label, pct, ready, go, icon }]
//   Ready goals first, then the highest pct. Cached for 450 ms. Sticky: goals already shown
//   keep their place unless a newcomer is clearly closer (no flicker between close values).

const GOALS = [];
function registerGoal(g) {
  if (!g || !g.id || typeof g.pct !== 'function') throw new Error('registerGoal: needs id and pct()');
  const rec = Object.assign({ sys: g.id, prio: 0 }, g);
  const i = GOALS.findIndex(x => x.id === g.id);
  if (i >= 0) GOALS.splice(i, 1, rec); else GOALS.push(rec);
  return () => { const j = GOALS.indexOf(rec); if (j >= 0) GOALS.splice(j, 1); };
}
let topGoals;
// Counts Next Up craft picks, so the Craft tab refocuses the recipe even when it is the same one.
var forgeGoalPicks = 0;

{
  // Save field: min = the strip is collapsed to one line (75-goals-ui.js); picked = the player
  // has toggled it. Until then the strip starts collapsed (one line), whatever min says.
  registerState('nextUp', { min: false, picked: false });
  const STICK = 0.06, CACHE_MS = 450, PER_SYS = 2;
  let shown = [];        // ids shown last time, in order
  const cache = new Map();  // n -> { at, list }

  const val = v => typeof v === 'function' ? v() : v;
  function evalGoal(g) {
    if (!goalGate(g)) return null;   // 55-onboard.js: the goal's system is not unlocked yet
    let p;
    try { p = +g.pct(); } catch (e) { return null; }
    if (!(p > 0)) return null;
    let label = '', icon = null;
    try { label = String(val(g.label) || ''); icon = val(g.icon) || null; } catch (e) { return null; }
    if (!label) return null;
    const ready = p >= 1;
    return { id: g.id, sys: g.sys, label, pct: Math.min(1, p), ready, go: g.go || null, goLabel: typeof g.goLabel === 'function' ? g.goLabel() : g.goLabel || '', icon, prio: +(typeof g.prio === 'function' ? g.prio() : g.prio) || 0, cap: +g.cap || 0, reserve: +g.reserve || 0 };
  }

  topGoals = function (n = 3, opts) {
    const o = opts || {}, now = o.now !== undefined ? o.now : Date.now(), sticky = o.sticky !== false;
    const c = cache.get(n);
    if (sticky && c && now >= c.at && now - c.at < CACHE_MS) return c.list;
    const all = [];
    for (const g of GOALS) { const e = evalGoal(g); if (e) all.push(e); }
    // score: ready goals above every unfinished one; prio nudges; shown goals get a head start
    for (const e of all) {
      const was = sticky ? shown.indexOf(e.id) : -1;
      e.score = (e.ready ? 2 + 0.01 * e.prio : e.pct + 0.02 * e.prio) + (was >= 0 ? STICK : 0);
      e.was = was;
    }
    all.sort((a, b) => b.score - a.score || (a.was < 0 ? 99 : a.was) - (b.was < 0 ? 99 : b.was));
    // diversity: first one per sys, then allow a second from the same sys
    const pick = [], count = {};
    for (let cap = 1; cap <= PER_SYS && pick.length < n; cap++) {
      for (const e of all) {
        if (pick.length >= n) break;
        if (pick.includes(e) || (count[e.sys] || 0) >= (e.cap ? Math.min(cap, e.cap) : cap)) continue;   // cap: 1 = one row at most
        pick.push(e); count[e.sys] = (count[e.sys] || 0) + 1;
      }
    }
    // reserve: one row for a reserved goal left out (the lowest-scored other pick makes room)
    if (n >= 3 && !pick.some(e => e.reserve)) {
      const r = all.find(e => e.reserve && !pick.includes(e));
      if (r) {
        if (pick.length < n) pick.push(r);
        else { let lo = -1; pick.forEach((e, i) => { if (!e.ready && (lo < 0 || e.score < pick[lo].score)) lo = i; }); if (lo >= 0) pick[lo] = r; }   // a ready goal is never displaced
      }
    }
    // order: ready first, then by score; shown goals keep their old order unless clearly passed
    pick.sort((a, b) => {
      if (a.ready !== b.ready) return a.ready ? -1 : 1;
      if (a.was >= 0 && b.was >= 0 && Math.abs(a.score - b.score) < STICK) return a.was - b.was;
      return b.score - a.score;
    });
    const list = pick.map(({ score, was, cap: _c, reserve: _r, ...e }) => e);
    if (sticky) { shown = list.map(e => e.id); cache.clear(); cache.set(n, { at: now, list }); }
    return list;
  };

  // ---------------- built-in goals (systems that exist in wave 2) ----------------
  // Everything below reads other files' public names at call time (they load later).
  const need = (have, want) => want > 0 ? have / want : 1;
  const plural = s => /s$/.test(s) ? s : s + 's';
  const noun = s => s.split(' ')[0];

  // Hero upgrades: the cheapest next level (x1). W2-A (solo): the cheapest Training level the hero can take (55-training
  // trainNext; nothing while every move sits at its cap), on the Hero tab's Training view.
  const heroNext = () => {
    const t = typeof trainNext === 'function' && soloHero() ? trainNext() : null; return t ? { u: { id: t.move, name: trainName(t.move), ic: ['sword', '#A9B1BD'] }, cost: t.cost, lv: t.lv, train: 1 } : null;
  };
  // hero-progression-rework: with attributes on there is no gold Training; the goal says there are points to spend
  const attrLive = () => typeof attrOn === 'function' && attrOn();
  const attrFree = () => { const k = typeof soloHero === 'function' ? soloHero() : null; return attrLive() && k ? attrPoints(k).free : 0; };
  registerGoal({
    // menu audit: a level that costs under 1% of your gold is free power, and ranks high (else it waits its turn)
    id: 'hero-up', sys: 'hero', prio: () => { if (attrLive()) return attrFree() > 0 ? 3 : -1; const b = heroNext(); return b && b.cost <= S.gold * 0.01 ? 3 : -1; },
    pct: () => { if (attrLive()) return attrFree() > 0 ? 1 : null; const b = heroNext(); return b ? need(S.gold, b.cost) : null; },
    label: () => { if (attrLive()) { const n = attrFree(); return n > 0 ? `Spend ${n} attribute point${n === 1 ? '' : 's'}` : ''; }
      const b = heroNext(); if (!b) return ''; const lv = b.lv;
      return S.gold >= b.cost ? `Train ${b.u.name} to Lv ${lv}: ready` : `Train ${b.u.name} to Lv ${lv}: ${fmt(Math.ceil(b.cost - S.gold))} more gold`; },
    icon: () => { const b = attrLive() ? null : heroNext(); return { ic: b ? b.u.ic : ['sword', '#A9B1BD'] }; },
    go: () => { if (attrLive()) return { tab: 'party', view: 'attributes', sel: '#attrRows' };
      const b = heroNext(); return b ? { tab: 'party', view: 'training', sel: `#trainRows .tr-row[data-mv="${b.u.id}"]` } : { tab: 'party', view: 'training' }; }
  });

  // Next zone boss: foes left at the frontier, or the boss is ready. "Ready" means you would usually win (59m bossOdds: scratch
  // turn fights judged by your own Parry and Dodge record). bossRead() -> null (legacy fights: the old rule), or
  // { s: 'next' (still working it out) | 'ready' | 'close' | 'weak', win }.
  const bossHeld = () => failDps > 0 && totalDps() <= failDps * 1.15;
  const bossRead = () => {
    if (typeof bossOddsOn !== 'function' || !bossOddsOn()) return null;
    const o = typeof bossOdds === 'function' ? bossOdds() : null;
    if (!o) return { s: 'next', win: 0 };
    return { s: o.win >= BOSS_ODDS.ready ? 'ready' : o.win >= BOSS_ODDS.close ? 'close' : 'weak', win: o.win };
  };
  const bossNow = () => S.zone === S.maxZone && bossReady() && !bossHeld() ? bossRead() : null;
  registerGoal({
    id: 'zone-boss', sys: 'boss', prio: 2,
    // after a lost try, "ready" waits until you are 15% stronger than then (what auto-challenge waits for too):
    // the bar shows how close you are
    pct: () => { if (S.zone !== S.maxZone) return 0.5; if (!bossReady()) return Math.min(1, S.kills / ZONE_FIGHTS); if (bossHeld()) return Math.min(0.99, totalDps() / (failDps * 1.15));
      const b = bossRead(); return !b || b.s === 'ready' ? 1 : b.s === 'next' ? 0.99 : Math.max(0.01, Math.min(0.99, b.win / BOSS_ODDS.ready)); },
    label: () => { if (S.zone !== S.maxZone) return `Go back to Zone ${S.maxZone} and push on`;
      if (!bossReady()) return `${ZONE_FIGHTS - S.kills} more fights to the Zone ${S.maxZone} boss`;
      if (bossHeld()) return `The Zone ${S.maxZone} boss beat you. Level up or gear up, then try again`;
      const b = bossRead(), z = S.maxZone;
      if (bossTryHeld()) return `You are stronger. Try the Zone ${z} boss again when you are ready`;
      return !b || b.s === 'ready' ? `Boss ready in Zone ${z}` : b.s === 'next' ? `The Zone ${z} boss is next`
        : b.s === 'close' ? `Zone ${z} boss: a close fight. Gear up to be safe` : `Zone ${z} boss is too strong. Level up and gear up first`; },
    icon: { ic: ['banner', '#E0524F', { 7: '#FFB347' }] },
    go: () => { const b = bossNow();
      // hero-progression-rework: spare attribute points are the one thing to do first; with none, the Fight tab (Training is no longer a way forward)
      return b && (b.s === 'close' || b.s === 'weak') && attrLive() && attrFree() > 0 ? { tab: 'party', view: 'attributes', sel: '#attrRows' }
        : { tab: 'adv', sel: '#gateBtn', fn: () => { if (S.zone !== S.maxZone) setZone(S.maxZone); } }; }
  });

  // Bounties: the one closest to done (a finished one is ready to claim).
  const btyNext = () => {
    let best = null;
    const sl = (S.bounties && S.bounties.slots) || [];
    for (let i = 0; i < sl.length; i++) {
      const b = sl[i]; if (!b || !b.k) continue;
      let p = need(b.have, b.need);
      if (p >= 1 && typeof stashNeed === 'function') { const r = BOUNTY_API.reward(b); if (r.kind !== 'gold' && stashNeed([[r.kind, r.t, r.n]])) p = 0.999; }   // a reward that does not fit waits behind one that does
      if (!best || p > best.p) best = { b, p, i };
    }
    return best;
  };
  const BTY_IC = { kill: ['sword', '#C9C3D6'], mine: ['pick', '#9C8F7A'], chop: ['axe', '#8C6A43'], forge: ['anvil', '#8A8FA0'], boss: ['banner', '#E0524F'], crit: ['flame', '#FF9E3D'], tap: ['boot', '#6B4A2E'], hunt: ['sword', '#E0524F'], gems: ['orb', '#9FE8FF'], forage: ['orb', '#8FA868'], make: ['anvil', '#C9A56A'], upgrade: ['anvil', '#F2C14E'], reforge: ['anvil', '#B58CFF'], ability: ['flame', '#7FB2FF'], hands: ['mug', '#8C6A43'], deep: ['flame', '#9A8FB8'] };
  registerGoal({
    id: 'bounty', sys: 'bounty', prio: 1,
    pct: () => { const x = btyNext(); return x ? x.p : null; },
    label: () => { const x = btyNext(); if (!x) return '';
      return x.p >= 1 ? `Bounty done: ${BOUNTY_API.text(x.b)}` : `${BOUNTY_API.text(x.b)} (${fmt(x.b.have)}/${fmt(x.b.need)})`; },
    icon: () => { const x = btyNext(); return { ic: BTY_IC[x ? x.b.k : 'kill'] || BTY_IC.kill }; },
    // E1: a finished bounty is claimed in place (no menu); an unfinished one opens the board
    goLabel: () => { const x = btyNext(); return x && x.p >= 1 ? 'Claim' : ''; },
    go: () => { const x = btyNext(); return x && x.p >= 1 ? { fn: () => { BOUNTY_API.claim(x.i); } } : { tab: 'adv', sel: '#sec-bounties' }; }
  });

  // Bestiary: the page (tier) closest to done among monsters met.
  const bestNext = () => {
    let best = null;
    for (const t of TYPES) {
      const n = masteryApi.typeKills(t.key); if (!n) continue;
      const tier = masteryApi.tierFor(n); if (tier >= BESTIARY_TIERS.length) continue;
      const from = tier ? BESTIARY_TIERS[tier - 1] : 0, to = BESTIARY_TIERS[tier];
      const p = Math.min(0.99, (n - from) / (to - from));
      if (!best || p > best.p) best = { t, n, tier, to, p };
    }
    return best;
  };
  registerGoal({
    id: 'bestiary', sys: 'bestiary',
    pct: () => { const b = bestNext(); return b ? b.p : null; },
    label: () => { const b = bestNext(); return b ? `${fmt(b.to - b.n)} more ${plural(b.t.name)} for bestiary page ${b.tier + 1}` : ''; },
    icon: () => { const b = bestNext(); return b ? { mob: b.t.key } : null; },
    go: { tab: 'adv', sel: '#sec-bestiary' }
  });

  // Skills: the skill closest to its next level.
  const skillNext = () => {
    let best = null;
    for (const k of Object.keys(SKILL)) {
      if (k === 'hunt' && !huntingVisible()) continue;
      const s = S.skills[k]; if (!s) continue;
      const p = Math.min(0.99, s.xp / skillNeed(s.lv, k));
      if (!best || p > best.p) best = { k, s, p };
    }
    return best;
  };
  const SKILL_IC = { mine: ['pick', '#D08A4E'], wood: ['axe', '#5FAE4E'], smith: ['anvil', '#6E6878'] };
  registerGoal({
    id: 'skill', sys: 'skill', prio: -1,
    pct: () => { const b = skillNext(); return b ? b.p : null; },
    label: () => { const b = skillNext(); return b ? `${SKILL[b.k]}: ${fmt(Math.ceil(skillNeed(b.s.lv, b.k) - b.s.xp))} XP to level ${b.s.lv + 1}` + (skillNextReq(b.k) === b.s.lv + 1 ? `, which opens tier ${skillTopTier(b.k) + 1}` : '') : ''; },
    icon: () => { const b = skillNext(); return { ic: SKILL_IC[b ? b.k : 'mine'] || SKILL_IC.mine }; },
    go: () => { const b = skillNext(); return b && b.k === 'smith' ? { tab: 'forge', sel: '#smithBar' } : { tab: 'gat', view: b.k }; }   // UX-A: the skill's own Gather view
  });

  // Craft: the next tier of an item the hero can wear (class kinds via CRAFT_FITS/fits; a
  // classed hero never sees the legacy Sword or Helm, as in the Craft tab), closest to done.
  // Go opens the Craft tab with that recipe focused (75-craft-ui reads S.fSlot / S.fTier).
  const kindsFor = pos => {
    const row = CRAFT_FITS[pos] || {}, who = heroWho();
    const own = who !== 'any' ? row[who] || [] : [];
    const list = own.length ? own : row.any || [];
    return list.filter(k => !CRAFT_KINDS[k].legacy && fits(k, pos, "hero"));
  };
  const forgeNext = () => {
    let best = null;
    const zt = zoneTier(S.maxZone);
    for (const pos of CRAFT_HERO_POS) {
      const cur = equipped(pos);
      for (const kind of kindsFor(pos)) {
        const have = cur && (cur.slot === kind || cur.u) ? cur.t : 0;
        const t = have + 1;
        if (t > Math.min(5, zt)) continue;
        const c = canCraft(kind, t);
        if (!c.cost || c.lv < c.need || c.unbuilt) continue;   // unbuilt: a cold save's station (H1)
        const ks = Object.keys(c.cost.mats);
        const p = c.ok ? 1 : Math.min(0.99, ks.reduce((a, k) => a + Math.min(1, need(matOwn(k, t), c.cost.mats[k])), 0) / Math.max(1, ks.length));
        const score = p + (pos === 'weapon' ? 0.02 : 0);
        if (!best || score > best.score) best = { kind, t, cost: c.cost.mats, p, score };
      }
    }
    return best;
  };
  registerGoal({
    id: 'forge', sys: 'forge',
    pct: () => { const b = forgeNext(); return b ? b.p : null; },
    label: () => { const b = forgeNext(); if (!b) return ''; const nm = kindName(b.kind, b.t);
      const a = /^[AEIOU]/.test(nm) ? 'an' : 'a';
      if (b.p >= 1) return `Craft ${a} ${nm}: you have the materials`;
      const k = Object.keys(b.cost).find(k => matOwn(k, b.t) < b.cost[k]);
      return k ? `Craft ${a} ${nm}: ${fmt(b.cost[k] - matOwn(k, b.t))} more ${costName(k, b.t)}` : `Craft ${a} ${nm}`; },
    icon: () => { const b = forgeNext(); return b ? { item: { slot: b.kind, t: b.t } } : null; },
    go: { tab: 'forge', sel: '#forgeBtn', fn: () => { const b = forgeNext(); if (b) { S.fSlot = b.kind; S.fTier = b.t; forgeGoalPicks++; } } }
  });
}
