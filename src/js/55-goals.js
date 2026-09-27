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
//          { tab: 'adv'|'party'|'gat'|'forge'|'world'|'raid'|'tav', sel: '#css-selector', fn() }
//          fn (optional) runs first, e.g. to preselect a forge recipe. Or a plain fn().
//   icon   optional toast-style icon spec or fn() -> spec ({ ic: [name, colour] }, { mat: [k, t] },
//          { item }, a URL); the UI also takes { mob: typeKey } and { char: rosterId }
//   prio   optional number (default 0); breaks ties and orders ready goals (higher first)
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

{
  // Save field: min = the strip is collapsed to one line (75-goals-ui.js).
  registerState('nextUp', { min: false });
  const STICK = 0.06, CACHE_MS = 450, PER_SYS = 2;
  let shown = [];        // ids shown last time, in order
  const cache = new Map();  // n -> { at, list }

  const val = v => typeof v === 'function' ? v() : v;
  function evalGoal(g) {
    let p;
    try { p = +g.pct(); } catch (e) { return null; }
    if (!(p > 0)) return null;
    let label = '', icon = null;
    try { label = String(val(g.label) || ''); icon = val(g.icon) || null; } catch (e) { return null; }
    if (!label) return null;
    const ready = p >= 1;
    return { id: g.id, sys: g.sys, label, pct: Math.min(1, p), ready, go: g.go || null, icon, prio: +g.prio || 0 };
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
        if (pick.includes(e) || (count[e.sys] || 0) >= cap) continue;
        pick.push(e); count[e.sys] = (count[e.sys] || 0) + 1;
      }
    }
    // order: ready first, then by score; shown goals keep their old order unless clearly passed
    pick.sort((a, b) => {
      if (a.ready !== b.ready) return a.ready ? -1 : 1;
      if (a.was >= 0 && b.was >= 0 && Math.abs(a.score - b.score) < STICK) return a.was - b.was;
      return b.score - a.score;
    });
    const list = pick.map(({ score, was, ...e }) => e);
    if (sticky) { shown = list.map(e => e.id); cache.clear(); cache.set(n, { at: now, list }); }
    return list;
  };

  // ---------------- built-in goals (systems that exist in wave 2) ----------------
  // Everything below reads other files' public names at call time (they load later).
  const need = (have, want) => want > 0 ? have / want : 1;
  const plural = s => /s$/.test(s) ? s : s + 's';
  const noun = s => s.split(' ')[0];

  // Hero upgrades: the cheapest next level (x1).
  const heroNext = () => {
    let best = null;
    for (const u of HERO_UPS) {
      const p = plan(u.base, u.r, S[u.id], S.gold, u.cap, '1');
      if (p.n > 0 && (!best || p.cost < best.cost)) best = { u, cost: p.cost };
    }
    return best;
  };
  registerGoal({
    id: 'hero-up', sys: 'hero', prio: -1,
    pct: () => { const b = heroNext(); return b ? need(S.gold, b.cost) : null; },
    label: () => { const b = heroNext(); if (!b) return ''; const lv = S[b.u.id] + 1;
      return S.gold >= b.cost ? `${b.u.name} Lv ${lv}: ready to buy` : `${b.u.name} Lv ${lv}: ${fmt(Math.ceil(b.cost - S.gold))} more gold`; },
    icon: () => { const b = heroNext(); return { ic: b ? b.u.ic : ['sword', '#A9B1BD'] }; },
    go: { tab: 'adv', sel: '#heroRows' }
  });

  // Next zone boss: foes left at the frontier, or the boss is ready.
  registerGoal({
    id: 'zone-boss', sys: 'boss', prio: 2,
    pct: () => S.zone === S.maxZone ? Math.min(1, S.kills / 10) : 0.5,
    label: () => S.zone !== S.maxZone ? `Go back to Zone ${S.maxZone} and push on`
      : bossReady() ? `Boss ready in Zone ${S.maxZone}` : `${10 - S.kills} more foes to the Zone ${S.maxZone} boss`,
    icon: { ic: ['banner', '#E0524F', { 7: '#FFB347' }] },
    go: { tab: 'adv', sel: '#gateBtn', fn: () => { if (S.zone !== S.maxZone) setZone(S.maxZone); } }
  });

  // Roster: the companion closest to a promotion.
  const promoNext = () => {
    if (!rosterLive()) return null;
    let best = null;
    for (const k of rosterList()) {
      const r = charRec(k), cost = promoteCost(k); if (!cost) continue;
      const cap = levelCap(r.rank), from = r.rank ? levelCap(r.rank - 1) : 1;
      let p;
      if (r.lv >= cap) p = canPromote(k) ? 1 : 0.9 + 0.09 * Math.min(1, need(S.gold, cost.gold));
      else p = 0.9 * Math.max(0, (r.lv - from + Math.min(1, r.xp / cxpNeed(r.lv))) / (cap - from));
      if (!best || p > best.p) best = { k, r, cap, p };
    }
    return best;
  };
  registerGoal({
    id: 'promote', sys: 'roster', prio: 1,
    pct: () => { const b = promoNext(); return b ? b.p : null; },
    label: () => { const b = promoNext(); if (!b) return ''; const nm = noun(ROSTER[b.k].name);
      if (b.r.lv < b.cap) { const left = b.cap - b.r.lv; return `${nm}: ${left} level${left > 1 ? 's' : ''} to Promote`; }
      return b.p >= 1 ? `${nm}: ready to Promote` : `${nm}: Promote needs more gold or essence`; },
    icon: () => { const b = promoNext(); return b ? { char: b.k } : null; },
    go: { tab: 'adv', sel: '#compRows' }
  });

  // Roster: the next recruit whose route is open.
  const recruitNext = () => {
    if (!rosterLive()) return null;
    let best = null;
    for (const k of ROSTER_KEYS) {
      const c = recruitCost(k); if (!c) continue;
      let p = c.gold > 0 ? need(S.gold, c.gold) : 1;
      if (c.ess) { let have = 0; for (let i = c.ess[0] - 1; i < 5; i++) have += S.mats.ess[i]; p = Math.min(p, need(have, c.ess[1])); }
      if (canRecruit(k)) p = 1; else p = Math.min(p, 0.99);
      if (!best || p > best.p) best = { k, c, p };
    }
    return best;
  };
  registerGoal({
    id: 'recruit', sys: 'roster', prio: 1,
    pct: () => { const b = recruitNext(); return b ? b.p : null; },
    label: () => { const b = recruitNext(); if (!b) return ''; const nm = noun(ROSTER[b.k].name);
      if (b.p >= 1) return `${nm} can join: Recruit`;
      return S.gold < b.c.gold ? `Recruit ${nm}: ${fmt(Math.ceil(b.c.gold - S.gold))} more gold` : `Recruit ${nm}: more essence needed`; },
    icon: () => { const b = recruitNext(); return b ? { char: b.k } : null; },
    go: { tab: 'adv', sel: '#compRows' }
  });

  // Bounties: the one closest to done (a finished one is ready to claim).
  const btyNext = () => {
    let best = null;
    for (const b of (S.bounties && S.bounties.slots) || []) {
      if (!b || !b.k) continue;
      const p = need(b.have, b.need);
      if (!best || p > best.p) best = { b, p };
    }
    return best;
  };
  const BTY_IC = { kill: ['sword', '#C9C3D6'], mine: ['pick', '#9C8F7A'], chop: ['axe', '#8C6A43'], forge: ['anvil', '#8A8FA0'], boss: ['banner', '#E0524F'], crit: ['flame', '#FF9E3D'], tap: ['boot', '#6B4A2E'] };
  registerGoal({
    id: 'bounty', sys: 'bounty', prio: 1,
    pct: () => { const x = btyNext(); return x ? x.p : null; },
    label: () => { const x = btyNext(); if (!x) return '';
      return x.p >= 1 ? 'Bounty done: claim your reward' : `${BOUNTY_API.text(x.b)} (${fmt(x.b.have)}/${fmt(x.b.need)})`; },
    icon: () => { const x = btyNext(); return { ic: BTY_IC[x ? x.b.k : 'kill'] || BTY_IC.kill }; },
    go: { tab: 'adv', sel: '#sec-bounties' }
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
      const s = S.skills[k]; if (!s) continue;
      const p = Math.min(0.99, s.xp / skillNeed(s.lv));
      if (!best || p > best.p) best = { k, s, p };
    }
    return best;
  };
  const SKILL_IC = { mine: ['pick', '#D08A4E'], wood: ['axe', '#5FAE4E'], smith: ['anvil', '#6E6878'] };
  registerGoal({
    id: 'skill', sys: 'skill', prio: -1,
    pct: () => { const b = skillNext(); return b ? b.p : null; },
    label: () => { const b = skillNext(); return b ? `${SKILL[b.k]}: ${fmt(Math.ceil(skillNeed(b.s.lv) - b.s.xp))} XP to level ${b.s.lv + 1}` : ''; },
    icon: () => { const b = skillNext(); return { ic: SKILL_IC[b ? b.k : 'mine'] || SKILL_IC.mine }; },
    go: () => { const b = skillNext(); return b && b.k === 'smith' ? { tab: 'forge', sel: '#smithBar' } : { tab: 'gat', sel: '#skillCards' }; }
  });

  // Forge: the best recipe one tier above the player's best equipped gear.
  const forgeNext = () => {
    let top = 0;
    for (const sl of SLOTS) { const it = equipped(sl.id); if (it && it.t > top) top = it.t; }
    const t = Math.min(5, top + 1);
    if (top >= 5 || S.skills.smith.lv < SMITH_REQ[t - 1]) return null;
    let best = null;
    for (const sl of SLOTS) {
      const cost = craftCost(sl.id, t), ks = Object.keys(cost);
      const p = ks.reduce((a, k) => a + Math.min(1, need(S.mats[k][t - 1], cost[k])), 0) / ks.length;
      if (!best || p > best.p) best = { slot: sl.id, t, cost, p };
    }
    return best;
  };
  registerGoal({
    id: 'forge', sys: 'forge',
    pct: () => { const b = forgeNext(); return b ? b.p : null; },
    label: () => { const b = forgeNext(); if (!b) return ''; const nm = itemName({ slot: b.slot, t: b.t, plus: 0 });
      const a = /^[AEIOU]/.test(nm) ? 'an' : 'a';
      if (b.p >= 1) return `Forge ${a} ${nm}: you have the materials`;
      const k = Object.keys(b.cost).find(k => S.mats[k][b.t - 1] < b.cost[k]);
      return `Forge ${a} ${nm}: ${fmt(b.cost[k] - S.mats[k][b.t - 1])} more ${matName(k, b.t)}`; },
    icon: () => { const b = forgeNext(); return b ? { item: { slot: b.slot, t: b.t } } : null; },
    go: { tab: 'forge', sel: '#forgeBtn', fn: () => { const b = forgeNext(); if (b) { S.fSlot = b.slot; S.fTier = b.t; } } }
  });
}
