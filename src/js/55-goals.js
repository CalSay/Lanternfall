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
//   reserve optional 1 (or fn() -> 1/0): when the goal has something to show it keeps one row of its own (n >= 3), taking
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
// next-tier-gate-goal: the craft goal's pick, read-only (tools/walk.mjs reads it): forgeNext() below.
let craftGoalNext = () => null;
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
    return { id: g.id, sys: g.sys, label, pct: Math.min(1, p), ready, go: g.go || null, goLabel: typeof g.goLabel === 'function' ? g.goLabel() : g.goLabel || '', icon, prio: +(typeof g.prio === 'function' ? g.prio() : g.prio) || 0, cap: +g.cap || 0, reserve: +val(g.reserve) || 0 };
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
    // reserve: one row for a reserved goal left out (the lowest-scored other pick makes room). gear-in-first-25: a prio 13+ reserved row
    // (the first weapon) goes first, and takes the one reserved row from a lower one already picked (a near deed)
    const top = n >= 3 ? all.find(e => e.reserve && e.prio >= 13 && !pick.includes(e)) : null, held = top ? pick.findIndex(e => e.reserve && e.prio < 13) : -1;
    if (held >= 0) pick[held] = top;
    else if (n >= 3 && !pick.some(e => e.reserve)) {
      const r = top || all.find(e => e.reserve && !pick.includes(e));
      if (r) {
        if (pick.length < n) pick.push(r);
        else { let lo = -1; pick.forEach((e, i) => { if (!e.ready && (lo < 0 || e.score < pick[lo].score)) lo = i; });   // a ready goal is never displaced,
          if (lo < 0 && r.prio >= 13) pick.forEach((e, i) => { if (e.prio < 13 && (lo < 0 || e.score < pick[lo].score)) lo = i; });   // except by a prio 13+ row (gear-in-first-25: the first weapon)
          if (lo >= 0) pick[lo] = r; }
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
    // unspent-points-nudge: its own sys, so learn-ability (sys 'hero') never pushes it out; a pile of two levels' points
    // or more tops the chip (prio 20 beats a shown Ready goal at prio 11 plus STICK)
    id: 'hero-up', sys: 'points', prio: () => { if (attrLive()) { const f = attrFree(); return f >= 2 * HERO_TUNE.perLevel ? 20 : f > 0 ? 3 : -1; } const b = heroNext(); return b && b.cost <= S.gold * 0.01 ? 3 : -1; },
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
  // boss-retry-reads-odds: after a loss at the frontier in a turn fight, the chance decides (not 15% more damage).
  // bossLost() -> null (not this path) or bossRead()'s { s, win }; bossPctTxt rounds to 5% ("under 5%" for 0).
  // (fresh only: while 59m works out a new chance it hands back the one from before the loss, which may read Ready)
  const bossLost = () => { if (!(S.zone === S.maxZone && typeof bossOddsOn === 'function' && bossOddsOn() && bossTryHeld() && S.bossTry.hold === S.maxZone)) return null;
    const b = bossRead(); return b && b.s !== 'next' && typeof BO === 'object' && !BO.res ? { s: 'next', win: 0 } : b; };
  const bossPctTxt = w => { const p = Math.round(w * 20) * 5; return p > 0 ? p + '%' : 'under 5%'; };
  registerGoal({
    id: 'zone-boss', sys: 'boss', prio: 2,
    // boss-retry-reads-odds: a weak chance after a loss has a bar near 0, so Ready goals would push it out of Next Up; it keeps
    // a row of its own, unless the craft goal already holds that row for a tier gate (next-tier-gate-goal: the way to get stronger)
    reserve: () => { const l = bossLost(); if (!l || l.s === 'close' || l.s === 'ready') return 0;
      const f = GOALS.find(q => q.id === 'forge'); let fr = 0; try { fr = f && typeof f.reserve === 'function' ? +f.reserve() : 0; } catch (e) { fr = 0; } return fr ? 0 : 1; },
    // after a lost try, "ready" waits until you are 15% stronger than then (what auto-challenge waits for too):
    // the bar shows how close you are
    pct: () => { if (S.zone !== S.maxZone) return 0.5; if (!bossReady()) return Math.min(1, S.kills / ZONE_FIGHTS);
      const lost = bossLost(); if (lost) return lost.s === 'next' ? 0.5 : lost.s === 'weak' ? Math.max(0.01, Math.min(0.99, lost.win / BOSS_ODDS.close)) : 1;
      if (bossHeld()) return Math.min(0.99, totalDps() / (failDps * 1.15));
      const b = bossRead(); return !b || b.s === 'ready' ? 1 : b.s === 'next' ? 0.99 : Math.max(0.01, Math.min(0.99, b.win / BOSS_ODDS.ready)); },
    label: () => { if (S.zone !== S.maxZone) return `Go back to Zone ${S.maxZone} and push on`;
      if (!bossReady()) return `${ZONE_FIGHTS - S.kills} more fights to the Zone ${S.maxZone} boss`;
      const lost = bossLost();
      if (lost) return lost.s === 'next' ? `The Zone ${S.maxZone} boss beat you. Working out your chance`
        : lost.s === 'weak' ? `The Zone ${S.maxZone} boss beat you. Your chance: ${bossPctTxt(lost.win)}. Level up and gear up`
        : `Your chance against the Zone ${S.maxZone} boss: ${bossPctTxt(lost.win)}. Try again when you are ready`;
      if (bossHeld()) return `The Zone ${S.maxZone} boss beat you. Level up or gear up, then try again`;
      const b = bossRead(), z = S.maxZone;
      if (bossTryHeld()) return `You are stronger. Try the Zone ${z} boss again when you are ready`;
      return !b || b.s === 'ready' ? `Boss ready in Zone ${z}` : b.s === 'next' ? `The Zone ${z} boss is next`
        : b.s === 'close' ? `Zone ${z} boss: a close fight. Gear up to be safe` : `Zone ${z} boss is too strong. Level up and gear up first`; },
    icon: { ic: ['banner', '#E0524F', { 7: '#FFB347' }] },
    go: () => { const lost = bossLost();
      // a weak chance after a loss: get stronger (spare points first, else the forge), never Try again
      if (lost && lost.s !== 'close' && lost.s !== 'ready') return attrLive() && attrFree() > 0 ? { tab: 'party', view: 'attributes', sel: '#attrRows' } : { tab: 'forge' };
      const b = bossNow();
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

  // Skills: the skill closest to its next level. next-tier-gate-goal: while the craft goal shows a tier gate, the skill that
  // gate names (so the two rows agree), and its Go is the gate row's. A crafting skill's Go opens Craft at its station.
  const skillNext = () => {
    const f = forgeNext();
    if (f && f.gate) { const s = S.skills[f.gate.skill]; if (s) return { k: f.gate.skill, s, p: Math.max(0.01, Math.min(0.99, s.xp / skillNeed(s.lv, f.gate.skill))), f }; }   // 0 XP still shows (a station sits there after each level)
    let best = null;
    for (const k of Object.keys(SKILL)) {
      if (k === 'hunt' && !huntingVisible()) continue;
      const s = S.skills[k]; if (!s) continue;
      const p = Math.min(0.99, s.xp / skillNeed(s.lv, k));
      if (!best || p > best.p) best = { k, s, p };
    }
    return best;
  };
  const SKILL_IC = { mine: ['pick', '#D08A4E'], wood: ['axe', '#5FAE4E'], smith: ['anvil', '#6E6878'], bench: ['anvil', '#C9A56A'], loom: ['anvil', '#8FA868'], ench: ['anvil', '#B58CFF'] };
  // the station a crafting skill levels at, and Go to it on Craft (the Forge's level bar is #smithBar, the others their station button)
  const stationFor = k => Object.keys(CRAFT_STATIONS).find(s => CRAFT_STATIONS[s].skill === k);
  const stationSel = s => s === 'forge' ? '#smithBar' : `.cf-st[data-st="${s}"]`;
  // any: a gate's Go may pick a recipe the hero cannot wear (a tool's Smithing gate for a ranger) so the screen opens at the station
  const skillGo = (k, any) => {
    const st = stationFor(k); if (!st) return { tab: 'gat', view: k };   // UX-A: a gathering skill's own Gather view
    // pick a recipe at that station so the Craft screen opens there (75-craft-ui syncGoalPick reads S.fSlot / S.fTier)
    const kind = CRAFT_HERO_POS.map(kindsFor).flat().find(x => CRAFT_KINDS[x].st === st) || (any ? Object.keys(CRAFT_KINDS).find(x => CRAFT_KINDS[x].st === st && !CRAFT_KINDS[x].legacy && craftKindVisible(x)) : null);
    return kind ? { tab: 'forge', sel: stationSel(st), fn: () => { S.fSlot = kind; S.fTier = 1; forgeGoalPicks++; } } : { tab: 'forge', sel: stationSel(st) };
  };
  registerGoal({
    id: 'skill', sys: 'skill', prio: -1,
    pct: () => { const b = skillNext(); return b ? b.p : null; },
    label: () => { const b = skillNext(); return b ? `${SKILL[b.k]}: ${fmt(Math.ceil(skillNeed(b.s.lv, b.k) - b.s.xp))} XP to level ${b.s.lv + 1}` + (skillNextReq(b.k) === b.s.lv + 1 ? `, which opens tier ${skillTopTier(b.k) + 1}` : '') : ''; },
    icon: () => { const b = skillNext(); return { ic: SKILL_IC[b ? b.k : 'mine'] || SKILL_IC.mine }; },
    go: () => { const b = skillNext(); return !b ? { tab: 'gat' } : b.f ? gateGo(b.f) : skillGo(b.k); }
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
  // Equip: a bag piece that beats what the hero wears in that position. It comes before the next
  // craft, so a freshly made piece is worn instead of crafted again.
  const equipNext = () => {
    let best = null;
    for (const pos of CRAFT_HERO_POS) {
      const cur = equipped(pos), base = cur ? itemPower(cur) : 0;
      for (const it of S.items) {
        if (cur && cur.id === it.id) continue;
        if (!fits(it, pos, 'hero') || !kindsFor(pos).includes(it.slot)) continue;
        const gain = itemPower(it) - base;
        if (gain > 0 && (!best || gain > best.gain)) best = { it, pos, gain };
      }
    }
    return best;
  };
  registerGoal({
    id: 'equip', sys: 'forge', prio: 1,
    pct: () => equipNext() ? 1 : null,
    label: () => { const b = equipNext(); return b ? `Equip your ${itemName(b.it)}` : ''; },
    icon: () => { const b = equipNext(); return b ? { item: b.it } : null; },
    go: () => { const b = equipNext(); if (b) equipItem(b.it.id, b.pos); }
  });
  // next-tier-gate-goal: what keeps a piece's next tier shut. The station's skill below the tier's gate is a station gate; else a
  // material you are short of whose node tier is closed for its gathering skill (a refined one by the raw goods it is made from;
  // coal comes with Copper Ore and essence has no tier, so neither gates). The furthest gate of the nearest piece is named.
  // null: nothing gates it; false: only a gate the player cannot raise now (Hunting hidden, Foraging not open yet).
  const GATHER_OPEN = { hide: () => huntingVisible(), fibre: () => isUnlocked('forage'), herb: () => isUnlocked('forage') };
  // a raw cell's gate, or false when its node never opens or its skill is hidden
  const rawGate = (f, tt) => {
    const sk = skillOf(f); if (skillTierOpen(sk, tt)) return null;
    if (!craftNodeEnabled(f, tt) || (GATHER_OPEN[f] && !GATHER_OPEN[f]())) return false;   // hide grades 4-5 are never offered
    return { skill: sk, lv: S.skills[sk].lv, need: skillReq(sk, tt), mat: costName(f, tt) };
  };
  // every gate on a recipe: [] none, false when one cannot be raised now (Hunting hidden, Foraging not open yet).
  // tier-two-named-for-return: the station gate and every short material's gate (one per skill, the highest need), not only the nearer
  const recipeGates = (kind, t, c) => {
    const out = [];
    if (c.lv < c.need) {
      // tools and pre-K4 kinds use the better of their station and Smithing (stationLevel): name the skill that gives that level
      const st = stationOf(kind), sk = S.skills[st.skill].lv >= c.lv ? st.skill : 'smith';
      out.push({ skill: sk, lv: S.skills[sk].lv, need: c.need, station: stationFor(sk) });
    }
    // what the recipe takes as raw cells: a raw cost as it is, a refined one you are short of by the raw goods it is made from,
    // totalled over the recipe (Birch Planks and Duskfang Leather both take Birch Log); a cell gates only when you hold too few
    const raw = {}, add = (f, tt, n) => { if (f !== 'coal' && CRAFT_NODES[f]) raw[f + ':' + tt] = (raw[f + ':' + tt] || 0) + n; };
    for (const [k, n] of Object.entries(c.cost.mats)) {
      const prod = typeof REFINE_PRODUCTS === 'object' ? REFINE_PRODUCTS[k] : null, short = n - matOwn(k, t);
      if (!prod) add(k, t, n); else if (short > 0) for (const [f, tt, m] of prod.inputs(t)) add(f, tt, m * short);
    }
    for (const [key, n] of Object.entries(raw)) {
      const [f, tt] = [key.split(':')[0], +key.split(':')[1]];
      if (matOwn(f, tt) >= n) continue;
      const g = rawGate(f, tt);
      if (g === false) return false;
      if (!g) continue;
      const i = out.findIndex(x => x.skill === g.skill);
      if (i < 0) out.push(g); else if (g.need > out[i].need) out[i] = g;
    }
    return out;
  };
  // XP a skill still needs to reach a gate's level (its own curve: gathering, or the station's)
  const xpLeft = g => { const s = S.skills[g.skill]; let n = -(s.xp || 0); for (let lv = s.lv; lv < g.need; lv++) n += skillNeed(lv, g.skill); return Math.max(0, n); };
  // tier-two-named-for-return (why W9): a piece is as far as the XP left over all its gates (a station gate alone used to win at +2 and
  // named the Leathers' Tailoring with 43 minutes of Hunting and Foraging behind it); the least wins, and on a tie the weapon
  const gateScore = e => -e.left + (e.pos === 'weapon' ? 1e-6 : 0);
  // tier 1 done: every position the hero can craft for wears a piece (a gate row then keeps a Next Up row of its own)
  const tierOneDone = () => CRAFT_HERO_POS.every(p => equipped(p) || !kindsFor(p).some(k => craftKindVisible(k)));
  // a tier 2 gate only: a later tier's gate keeps today's rule (its row after a boss loss), so the near-deed row is not pushed out all game
  const tierTwoGate = b => !!(b && b.gate && b.t === 2 && tierOneDone());
  // forgeNext() -> { kind, t, pos, cost, p } the open recipe closest to done, or, when none with p > 0 is open,
  // { kind, t, pos, gate: { skill, lv, need, mat?, station? }, left, p } the piece with the least XP left over all its gates, naming the
  // furthest of them (left = that XP; p = lv / need, at most 0.99, never Ready)
  // gear-in-first-25: from the first tool made (the guide's `tool` step) until a weapon is worn, with none in the bag, the hero's own
  // weapon is the pick, ahead of any tool or armour ("closest to done" let a ready Woodaxe hide a weapon short of Quartz). `closed`: the
  // first short material whose place is not open yet (matPlace, 55-onboard); the row then says when it opens.
  const firstWeapon = () => {
    try {
      if (typeof stepDone !== 'function' || !stepDone('tool') || equipped('weapon') || wearPiece('weapon')) return null;
      const kind = weaponKind(); if (!kind) return null;
      const c = canCraft(kind, 1); if (!c.cost || c.unbuilt) return null;
      const m = c.cost.mats, ks = Object.keys(m), short = ks.filter(k => matOwn(k, 1) < m[k]);
      const p = c.ok ? 1 : Math.max(0.01, Math.min(0.99, ks.reduce((a, k) => a + Math.min(1, need(matOwn(k, 1), m[k])), 0) / Math.max(1, ks.length)));
      return { kind, t: 1, pos: 'weapon', cost: m, p, score: p + 0.02, first: true, short, closed: short.find(k => !matPlace(k, 1).open) || null };
    } catch (e) { return null; }
  };
  // nextup-guards-forge-mats: once a tool is worn and until the Forge is built, no craft (tool, charm) or upgrade that leaves less of a
  // Forge material (25 Copper Ore, 10 Pine Log) than its first build needs. Seed 1's Copper tools spent 22 of 25 ore and pushed
  // the Forge from 6:35 to 14:17. The first weapon (firstWeapon) and weapon crafts are never held.
  const forgeHold = (t, mats) => {
    if (typeof hearthFirst !== 'function' || typeof campLevel !== 'function' || campLevel('forge') >= 1 || (typeof campPending === 'function' && campPending('forge'))) return false;
    const fb = hearthFirst('forge');
    if (!fb || !CRAFT_HERO_POS.some(p => { const it = equipped(p); return it && CRAFT_KINDS[it.slot] && CRAFT_KINDS[it.slot].tool; })) return false;
    return fb.mats.some(([k, tt, n]) => mats[k] && t === tt && matOwn(k, tt) - mats[k] < n);
  };
  const forgeNext = () => {
    const fw = firstWeapon(); if (fw) return fw;
    let best = null, gate = null;
    const zt = zoneTier(S.maxZone);
    const eq = equipNext();
    for (const pos of CRAFT_HERO_POS) {
      if (eq && eq.pos === pos) continue;   // a better piece waits in the bag: equip it, don't craft again
      const cur = equipped(pos);
      for (const kind of kindsFor(pos)) {
        const have = cur && (cur.slot === kind || cur.u) ? cur.t : 0;
        const t = have + 1;
        if (t > Math.min(5, zt)) continue;
        const c = canCraft(kind, t);
        if (!c.cost || c.unbuilt) continue;   // unbuilt: a cold save's station (H1); no gate on a station that is not built
        const gs = recipeGates(kind, t, c);
        if (gs === false) continue;
        if (gs.length) {
          // the row names the furthest gate (the one most of the XP left is in)
          const left = gs.map(xpLeft), i = left.indexOf(Math.max(...left)), g = gs[i];
          const e = { kind, t, pos, gate: g, left: left.reduce((a, n) => a + n, 0), p: Math.min(0.99, g.lv / g.need) };
          if (!gate || gateScore(e) > gateScore(gate)) gate = e;
          continue;
        }
        if (pos !== 'weapon' && forgeHold(t, c.cost.mats)) continue;
        const ks = Object.keys(c.cost.mats);
        const p = c.ok ? 1 : Math.min(0.99, ks.reduce((a, k) => a + Math.min(1, need(matOwn(k, t), c.cost.mats[k])), 0) / Math.max(1, ks.length));
        const score = p + (pos === 'weapon' ? 0.02 : 0);
        if (!best || score > best.score) best = { kind, t, pos, cost: c.cost.mats, p, score };
      }
    }
    return best && best.p > 0 ? best : gate || best;   // an open recipe at p = 0 (Next Up drops it) does not hide a gate
  };
  // the first weapon's short material a Go can send you to gather (the first gathered one), or null (only essence is short)
  const firstWeaponGather = b => b.short.find(k => CRAFT_FAMILY[k] && CRAFT_FAMILY[k].src === 'gather') || null;
  const firstWeaponWhere = b => {
    if (b.closed) { const pl = matPlace(b.closed, 1), nm = costName(b.closed, 1);
      return pl.opens ? `${nm} comes from ${SKILL[pl.skill]}, which opens at ${pl.opens}` : `${nm} comes from ${CRAFT_FAMILY[b.closed].from.replace(/ only\.$/, '').replace(/\.$/, '')}`; }
    const k = firstWeaponGather(b) || b.short[0], n = fmt(b.cost[k] - matOwn(k, 1)), nm = costName(k, 1);
    if (k === 'ess' || k === 'gold') return `win ${n} more ${nm} in fights`;
    return `${matPlace(k, 1).verb.toLowerCase()} ${n} ${nm} at the ${NODE_NAMES[k][0]}`;
  };
  // a gate row's Go: Craft at the station's tier 1 (a craft there levels it), or the gathering skill's Gather view
  const gateGo = b => !b.gate.station ? { tab: 'gat', view: b.gate.skill }
    : CRAFT_KINDS[b.kind].st === b.gate.station ? { tab: 'forge', sel: stationSel(b.gate.station), fn: () => { S.fSlot = b.kind; S.fTier = 1; forgeGoalPicks++; } }
    : skillGo(b.gate.skill, true);   // a tool's Smithing gate: Craft at the Forge, where a craft levels Smithing
  craftGoalNext = () => forgeNext();
  registerGoal({
    id: 'forge', sys: 'forge',
    // a tier gate keeps a row of its own once the frontier boss has beaten you: it is the way forward ("gear up"), and in the seed 1
    // walk it otherwise sat 4th behind the boss, refine and contract rows
    // tier-two-named-for-return: and once tier 1 is done, without a boss loss (bosses rarely beat you after z13-unstick, so at minute 60
    // the row sat below the top 8)
    reserve: () => { const b = forgeNext(), bt = S.bossTry; if (b && b.first) return b.closed ? 0 : 1; if (!b || !b.gate) return 0; if (tierTwoGate(b)) return 1;
      return bt && bt.tries && typeof bossTryKey === 'function' && bt.tries[bossTryKey(soloHero(), S.maxZone)] > 0 ? 1 : 0; },
    // gear-in-first-25: the first weapon, its places open, ranks above every unfinished row (20); once Ready, above other Ready rows
    // (13) but under a pile of unspent points (hero-up's 20, even with this row shown first: 2.13 + STICK < 2.2)
    // tier-two-named-for-return: a tier 2 gate once tier 1 is done is prio 13, so its reserved row holds a place in the top three even
    // when three rows are Ready (it is the session's end goal, and a Ready row is one press away on the full list)
    prio: () => { const b = forgeNext(); return b && b.first && !b.closed ? (b.p >= 1 ? 13 : 20) : tierTwoGate(b) ? 13 : 0; },
    pct: () => { const b = forgeNext(); return b ? b.p : null; },
    label: () => { const b = forgeNext(); if (!b) return '';
      // tier-two-named-for-return: a gate row names the piece and its furthest gate, not a boss (it is often a later sitting's piece); a
      // gathering gate says the skill rises while you're away ("Birch Bow: Mining 7 of 14 opens Iron Ore. Gathering keeps going while you're away.")
      if (b.gate) return `${kindName(b.kind, b.t)}: ${SKILL[b.gate.skill]} ${b.gate.lv} of ${b.gate.need}` + (b.gate.station ? '' : (b.gate.mat ? ` opens ${b.gate.mat}` : '') + '. Gathering keeps going while you\'re away.');
      const nm = kindName(b.kind, b.t) + (CRAFT_KINDS[b.kind].tool ? '' : ` for the zone ${S.maxZone} boss`);   // craft-delta: a weapon or armour names the boss it helps
      const a = /^[AEIOU]/.test(nm) ? 'an' : 'a';
      if (b.p >= 1) return `Craft ${a} ${nm}: you have the materials`;
      if (b.first) return `${nm}: ${firstWeaponWhere(b)}`;   // "Pine Staff for the zone 4 boss: mine 3 Quartz at the Quartz Geode"
      const k = Object.keys(b.cost).find(k => matOwn(k, b.t) < b.cost[k]);
      return k ? `Craft ${a} ${nm}: ${fmt(b.cost[k] - matOwn(k, b.t))} more ${costName(k, b.t)}` : `Craft ${a} ${nm}`; },
    icon: () => { const b = forgeNext(); return b ? { item: { slot: b.kind, t: b.t } } : null; },
    go: () => { const b = forgeNext(), w = b && b.first && !b.closed && b.p < 1 ? firstWeaponGather(b) : null; if (w) return { tab: 'gat', view: CRAFT_FAMILY[w].skill, sel: `.gx-row[data-kind="${w}"][data-t="1"]` };
      return b && b.gate ? gateGo(b) : { tab: 'forge', sel: '#forgeBtn', fn: () => { const x = forgeNext(); if (x && !x.gate) { S.fSlot = x.kind; S.fTier = x.t; forgeGoalPicks++; } } }; }
  });
  // Upgrade (craft-delta): a worn piece whose next upgrade you can pay for now, offered only while no craft is ready
  // (the craft goal is not Ready). Weapon first, then the slot order. Go opens the piece's sheet on Hero, Gear.
  // upgrade-goal-chip-order: never the piece the shown craft goal replaces, and never an upgrade that leaves less of a
  // shared material (same tier, or essence) than the craft needs; when nothing is left, the craft goal leads.
  const upgradeNext = () => {
    const f0 = forgeNext(), f = f0 && !f0.gate ? f0 : null;   // next-tier-gate-goal: a gate row replaces no piece
    if (f && (f.p >= 1 || f.first)) return null;   // gear-in-first-25: no upgrade while the first weapon is still to make
    for (const pos of CRAFT_HERO_POS) {
      if (f && f.p > 0 && pos === f.pos) continue;
      const it = equipped(pos);
      if (!it || !CRAFT_KINDS[it.slot] || !craftKindVisible(it.slot)) continue;
      const c = canUpgrade(it.id); if (!c.ok) continue;
      const um = (c.cost && c.cost.mats) || {};
      if (f && Object.keys(um).some(k => f.cost[k] && (k === 'ess' || it.t === f.t) && matOwn(k, f.t) - um[k] < f.cost[k])) continue;
      if (forgeHold(it.t, um)) continue;
      return it;
    }
    return null;
  };
  registerGoal({
    id: 'upgrade', sys: 'forge', prio: -0.5,
    pct: () => upgradeNext() ? 1 : null,
    label: () => { const it = upgradeNext(); return it ? `Upgrade your ${kindName(it.slot, it.t, it.u)} to +${it.plus + 1}` : ''; },
    icon: () => { const it = upgradeNext(); return it ? { item: it } : null; },
    go: () => { const it = upgradeNext(), id = it ? it.id : null; return { tab: 'party', view: 'gear', fn: () => { if (id != null && typeof craftUI === 'object' && craftUI) craftUI.openItem(id); } }; }
  });

  // hearth-two-next-up (W6): after the zone 10 clear, the camp's step up: Hearth 2, then the Tavern. The row names each part of
  // the cost still short and where it comes from ("Build Hearth 2: 20 Pine Log at the Pine Grove, 5 Essence from fights").
  // Like Hesketh's fire (55-hearth) it is Ready while a gathered part is short and the hero works elsewhere: Go sends the hero to
  // that node. Once everything is in hand it reads "ready to build", unless camp-build (57-camp) already offers this build (its
  // pick: the cheapest build a free builder can start), so the two never show the same build twice. A hero still at a node
  // this row sent them to, with no more needed there, is offered "Back to the fight". Costs and gates are campCan's own.
  let stepSent = null;   // { kind, t, what }: the node this row's Go last sent the hero to (not saved)
  const atNode = (k, t) => S.activity === 'gather' && !!S.node && S.node.kind === k && S.node.t === t;
  const gathered = k => !!(CRAFT_FAMILY[k] && CRAFT_FAMILY[k].src === 'gather');
  const stepWhere = (k, t) => {
    if (k === 'ess' || k === 'gold') return 'from fights';
    if (NODE_NAMES[k]) return `at the ${NODE_NAMES[k][t - 1]}`;
    const pl = matPlace(k, t); return pl.skill ? `from ${SKILL[pl.skill]}` + (pl.opens ? `, which opens at ${pl.opens}` : '') : '';
  };
  const campStep = () => {
    if (!(S.maxZone > 10) || typeof campCan !== 'function' || !campOpen()) return null;
    const id = campLevel('hearth') < 2 ? 'hearth' : campLevel('tavern') < 1 ? 'tavern' : null;
    if (!id || campPending(id) || !campList().includes(id)) return null;
    const c = campCan(id);
    if (!c.cost || c.max || c.need) return null;
    const short = [], parts = [[S.gold, c.cost.gold]];
    if (S.gold < c.cost.gold) short.push({ k: 'gold', t: 1, n: Math.ceil(c.cost.gold - S.gold), have: S.gold });
    for (const [k, t, n] of c.cost.mats) { const h = matOwn(k, t); parts.push([h, n]); if (h < n) short.push({ k, t, n: Math.ceil(n - h), have: h }); }
    if (c.miss && c.miss.length > short.length) return null;   // short of something this row cannot name (a Trophy)
    const live = parts.filter(([, n]) => n > 0);
    return { id, ok: !!c.ok, queue: !!c.queue, what: id === 'hearth' ? 'Hearth 2' : 'the Tavern', short, p: live.reduce((a, [h, n]) => a + Math.min(1, need(h, n)), 0) / Math.max(1, live.length) };
  };
  // camp-build's own pick (bestBuild in 57-camp): the cheapest build that can start now, the first in camp order on a tie
  // (kept 900 ms, as camp-build keeps its own pick: it reads every building, and the two rows hand over on the same beat)
  let pickAt = 0, pickVal = null;
  const campPick = () => { const t = Date.now(); if (!(t - pickAt <= 900 && t >= pickAt)) { pickAt = t; let best = null;
    for (const id of campList()) { const c = campCan(id); if (c.ok && !c.queue && (!best || c.cost.gold < best.g)) best = { id, g: c.cost.gold }; } pickVal = best ? best.id : null; } return pickVal; };
  // the row's state: go (Ready: Go sends the hero to g's node), work (at a short node, or short of what fights bring), back and
  // ready (both Ready)
  const stepNow = () => {
    if (stepSent && !atNode(stepSent.kind, stepSent.t)) stepSent = null;
    const x = campStep(), sh = x ? x.short : [];
    const back = !!stepSent && !sh.some(s => s.k === stepSent.kind && s.t === stepSent.t);
    const deep = typeof deepActive === 'function' && deepActive();   // no Go to a node from the Deepwell (navGo refuses)
    if (deep && sh.length) return { m: 'work', x };
    if (sh.some(s => gathered(s.k) && atNode(s.k, s.t))) return { m: 'work', x };
    const g = sh.find(s => gathered(s.k) && matPlace(s.k, s.t).open);
    if (g) return { m: 'go', x, g };
    if (back && S.activity === 'gather') return { m: 'back', x };
    if (x && x.ok) return x.queue || campPick() !== x.id ? { m: 'ready', x } : null;
    return sh.length ? { m: 'work', x } : null;
  };
  const stepPart = s => `${fmt(s.n)}${s.have > 0 ? ' more' : ''} ${s.k === 'gold' ? 'gold' : costName(s.k, s.t)} ${stepWhere(s.k, s.t)}`.trim();
  registerGoal({
    id: 'camp-step', sys: 'camp', prio: 1, icon: { ic: ['anvil', '#D08A4E'] },
    pct: () => { const s = stepNow(); return !s ? null : s.m === 'work' ? Math.max(0.01, Math.min(0.99, s.x.p)) : 1; },
    label: () => { const s = stepNow(); if (!s) return '';
      if (s.m === 'ready') return `${s.x.what[0].toUpperCase() + s.x.what.slice(1)}: ready to build`;
      if (s.m === 'back') return `Back to the fight: you have the ${costName(stepSent.kind, stepSent.t)} for ${stepSent.what}`;
      return `Build ${s.x.what}: ${s.x.short.map(stepPart).join(', ')}`; },
    go: () => { const s = stepNow(); if (!s) return { tab: 'world', view: 'camp' };
      if (s.m === 'go') { const sent = { kind: s.g.k, t: s.g.t, what: s.x.what }; return { act: 'gather', node: { kind: sent.kind, t: sent.t }, fn: () => { stepSent = sent; } }; }
      if (s.m === 'back') return { act: 'fight', fn: () => { stepSent = null; } };
      return { tab: 'world', sel: '#camp-b-' + s.x.id }; }
  });
}
