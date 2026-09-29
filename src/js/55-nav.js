// 55-nav: global navigation (task UX-A, docs/design/ux-overhaul.md 4 and 6.1): what the player is
// doing now, the last node per gathering skill, recent places, "Best for you" and the one switch
// call every place uses. UI: 75-nav-ui.js (the activity pill, the quick switcher, swipes between
// views) and 72-ui-gather.js (the Gather views).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Exposed names:
//   NAV_TUNE             knobs; NAV_TUNE.pillReplacesName is the header flag (spec 9.3): true = the
//                        pill takes the name's place, false = the name stays and the pill is a
//                        smaller second line under it
//   NAV_SKILLS, NAV_FAMS { skill: [families] }, NAV_VERB { family: 'Mine' | 'Chop' | 'Cut' | 'Pick' }
//   navSkillOpen(sk)     the skill's Gather view shows and the switcher lists it (a cold Hearth
//                        shows Mining only once the fire is lit; Foraging with its feature)
//   navSkills()          the open skills, in tab order
//   navLast(sk)          { kind, t }: the node this skill resumes (its last node, else its best open one)
//   navNow()             { act, skill, kind, t, zone, floor, text, icon, full }: the pill's facts
//   navRate(kind, t)     units a minute on that node now (before taps and the Glint)
//   navFullIn(kind, t)   seconds until the cell is full (0 full, Infinity: no cap or no income)
//   navRecent()          up to NAV_TUNE.recentShow places not already listed by the switcher:
//                        { k: 'node', kind, t } | { k: 'boss', z } | { k: 'deep', floor }
//   bestNodes(sk)        up to 2 { kind, t, why }: the highest open tier, then home ground, then
//                        what the next camp build waits on; never the node you work, never a full cell
//   navGo(place) -> bool switch: { act: 'fight', zone? } | { act: 'gather', skill?, node? { kind, t } }
//                        | { act: 'raid' } | { act: 'deep' } (resume a paused run)
// Events: navGo { place, ok } after every navGo (75-nav-ui closes menus and sheets in portrait).
// Save: registerState('nav', { v: 1, last: { mine, wood, forage }, recent: [] }).
//   last[skill]: { kind, t } or null (filled from S.node on load). recent: newest first, at most
//   NAV_TUNE.recentKeep of { kind, t } (a node left) and { z } (a zone boss that beat you).
//   S.node keeps its meaning: the node worked now.

const NAV_TUNE = {
  pillReplacesName: true,   // header variant (spec 9.3; owner: the pill replaces the name). false = name kept, pill as a second line
  recentKeep: 6,            // places kept in the save
  recentShow: 3,            // chips in the switcher
  needEvery: 2000           // ms between "what the next build waits on" scans
};
const NAV_SKILLS = ['mine', 'wood', 'forage'];
const NAV_FAMS = { mine: ['ore', 'crystal'], wood: ['wood'], forage: ['fibre', 'herb'] };
const NAV_VERB = { ore: 'Mine', crystal: 'Mine', wood: 'Chop', fibre: 'Cut', herb: 'Pick' };
const NAV_NOUN = { ore: 'ore', crystal: 'crystal', wood: 'wood', fibre: 'fibre', herb: 'herbs' };
let navSkillOpen, navSkills, navLast, navNow, navRate, navFullIn, navRecent, bestNodes, navGo;
{
  registerState('nav', { v: 1, last: { mine: null, wood: null, forage: null }, recent: [] });
  const N = () => {
    const n = S.nav || (S.nav = { v: 1, last: {}, recent: [] });
    if (!n.last || typeof n.last !== 'object') n.last = {};
    if (!Array.isArray(n.recent)) n.recent = [];
    return n;
  };
  const famsOf = sk => NAV_FAMS[sk] || [];
  const validNode = nd => !!nd && typeof nd === 'object' && !!CRAFT_NODES[nd.kind] && nd.t >= 1 && nd.t <= 5 && (nd.t | 0) === nd.t;
  const nodeOpen = nd => validNode(nd) && skillTierOpen(skillOf(nd.kind), nd.t);
  const same = (a, b) => !!a && !!b && a.kind === b.kind && a.t === b.t;
  const gathering = () => S.activity === 'gather';
  const coldUnlit = () => typeof hearthCold === 'function' && hearthCold() && typeof hearthLit === 'function' && !hearthLit();
  const feat = id => typeof isUnlocked !== 'function' || isUnlocked(id);

  navSkillOpen = sk => {
    if (!NAV_FAMS[sk]) return false;
    if (gathering() && skillOf(S.node.kind) === sk) return true;   // the skill you work always shows
    if (sk === 'forage') return feat('forage');
    if (!feat('gather')) return false;
    return sk !== 'mine' || !coldUnlit();
  };
  navSkills = () => NAV_SKILLS.filter(navSkillOpen);

  navLast = sk => {
    const fams = famsOf(sk); if (!fams.length) return null;
    if (gathering() && skillOf(S.node.kind) === sk && validNode(S.node)) return { kind: S.node.kind, t: S.node.t };
    const l = N().last[sk];
    if (nodeOpen(l) && fams.includes(l.kind)) return { kind: l.kind, t: l.t };
    if (skillOf(S.node.kind) === sk && nodeOpen(S.node)) return { kind: S.node.kind, t: S.node.t };
    return { kind: fams[0], t: skillTopTier(sk) };
  };

  navRate = (kind, t) => 60 / nodeTime(kind, t) * nodeYieldAvg(kind) * mod('yield:' + kind);
  navFullIn = (kind, t) => {
    const cap = typeof storeCap === 'function' ? storeCap(kind, t) : Infinity;
    if (!Number.isFinite(cap)) return Infinity;
    const h = S.mats[kind][t - 1] || 0; if (h >= cap) return 0;
    const r = navRate(kind, t); return r > 0 ? (cap - h) / r * 60 : Infinity;
  };

  const deepLive = () => typeof deepActive === 'function' && deepActive();
  const deepRun = () => typeof DW === 'object' && DW && typeof DW.run === 'function' ? DW.run() : null;
  navNow = () => {
    if (deepLive()) { const r = deepRun(); const f = r ? r.floor : 1; return { act: 'deep', floor: f, text: `Deepwell · Floor ${f}`, short: `Floor ${f}`, icon: 'deep', full: false }; }
    if (S.activity === 'raid') return { act: 'raid', text: `Raiding · ${online.world && online.world.name ? online.world.name : 'the world boss'}`, short: 'Raiding', icon: 'raid', full: false };
    if (gathering() && validNode(S.node)) {
      const { kind, t } = S.node, sk = skillOf(kind);
      const full = typeof stashFull === 'function' && stashFull(kind, t);
      return { act: 'gather', skill: sk, kind, t, text: `${SKILL[sk]} · ${NODE_NAMES[kind][t - 1]}` + (full ? ' · full' : ''), short: NODE_NAMES[kind][t - 1] + (full ? ' · full' : ''), icon: sk, full };
    }
    return { act: 'fight', zone: S.zone, text: `Fighting · Zone ${S.zone}`, short: `Zone ${S.zone}`, icon: 'fight', full: false };
  };

  // ---- recent places ----
  const pushRecent = p => {
    const r = N().recent, key = x => x.z ? 'z' + x.z : x.kind + x.t;
    const k = key(p);
    for (let i = r.length - 1; i >= 0; i--) if (!r[i] || key(r[i]) === k) r.splice(i, 1);
    r.unshift(p);
    if (r.length > NAV_TUNE.recentKeep) r.length = NAV_TUNE.recentKeep;
  };
  navRecent = () => {
    const out = [], listed = [];
    for (const sk of navSkills()) listed.push(navLast(sk));
    if (gathering()) listed.push(S.node);
    const r = deepRun();
    if (r && r.paused) out.push({ k: 'deep', floor: r.floor });
    for (const p of N().recent) {
      if (out.length >= NAV_TUNE.recentShow) break;
      if (!p || typeof p !== 'object') continue;
      if (p.z) { if (p.z === S.maxZone && p.z >= 1) out.push({ k: 'boss', z: p.z }); continue; }   // a boss you have since beaten drops off
      if (!nodeOpen(p) || !navSkillOpen(skillOf(p.kind)) || listed.some(l => same(l, p))) continue;
      out.push({ k: 'node', kind: p.kind, t: p.t });
    }
    return out.slice(0, NAV_TUNE.recentShow);
  };

  // Watch S.node (setNode, the Storehouse's Switch and Spillover, the cold Hearth all replace the
  // object): remember it as its skill's last node and file the node left as a recent place.
  // A loaded save (a new S) starts clean: its node fills its skill's slot if empty, nothing is filed.
  let seenS = null, seenNode = null;
  const fillLast = () => {
    if (!validNode(S.node)) return;
    const sk = skillOf(S.node.kind), n = N();
    if (NAV_FAMS[sk] && !validNode(n.last[sk])) n.last[sk] = { kind: S.node.kind, t: S.node.t };
  };
  const watch = () => {
    if (seenS !== S) { seenS = S; seenNode = S.node; fillLast(); return; }
    if (S.node === seenNode) return;
    const prev = seenNode; seenNode = S.node;
    if (!validNode(S.node)) return;
    const sk = skillOf(S.node.kind), n = N();
    if (NAV_FAMS[sk]) n.last[sk] = { kind: S.node.kind, t: S.node.t };
    if (prev && validNode(prev) && !same(prev, S.node)) pushRecent({ kind: prev.kind, t: prev.t });
  };
  onTick(watch);
  fillLast();
  on('bossFail', ({ zone }) => { if (zone >= 1) pushRecent({ z: zone }); });

  // ---- Best for you ----
  // What the next camp build waits on (its first short material this skill gathers at an open tier).
  let needAt = -1e9, needFor = null, needS = null;
  const campNeeds = () => {
    const now = Date.now();
    if (needS === S && now - needAt < NAV_TUNE.needEvery) return needFor;
    needAt = now; needS = S; needFor = [];
    try {
      if (typeof campOpen !== 'function' || !campOpen() || typeof campList !== 'function') return needFor;
      for (const id of campList()) {
        if (typeof campPending === 'function' && campPending(id)) continue;
        const to = campLevel(id) + 1, c = campCost(id, to); if (!c || !c.mats) continue;
        const b = CAMP_B[id];
        for (const [f, t, n] of c.mats) if (CRAFT_NODES[f] && (S.mats[f][t - 1] || 0) < n) needFor.push({ kind: f, t, why: `for the ${b ? b.n : 'camp'} Lv ${to}` });
      }
    } catch (e) { needFor = []; }
    return needFor;
  };
  bestNodes = sk => {
    const fams = famsOf(sk); if (!fams.length) return [];
    const top = skillTopTier(sk), out = [];
    const add = (kind, t, why) => {
      if (out.length >= 2 || !fams.includes(kind) || t > top || t < 1) return;
      if (gathering() && same(S.node, { kind, t })) return;
      if (typeof stashFull === 'function' && stashFull(kind, t)) return;
      if (out.some(o => same(o, { kind, t }))) return;
      out.push({ kind, t, why });
    };
    const rarest = f => `rarest ${NAV_NOUN[f]} you can ${NAV_VERB[f].toLowerCase()}`;
    add(fams[0], top, rarest(fams[0]));
    const home = typeof homeFamily === 'function' ? homeFamily() : null, hb = home && typeof homeBonus === 'function' ? homeBonus(home) : 0;
    if (home && hb > 0) add(home, top, `Home +${Math.round(hb * 100)}%`);
    for (const nd of campNeeds()) add(nd.kind, nd.t, nd.why);
    for (const f of fams.slice(1)) add(f, top, rarest(f));
    return out;
  };

  // ---- the switch ----
  navGo = place => {
    let ok = false;
    try { ok = go(place || {}); } catch (e) { console.error('[lanternfall] navGo failed', e); ok = false; }
    emit('navGo', { place: place || {}, ok });
    return ok;
  };
  function go(p) {
    if (p.act === 'deep') {
      if (deepLive()) return true;
      const r = deepRun(); return !!(r && r.paused && DW.resume());
    }
    if (deepLive()) { toast('Climb out of the Deepwell first.', 'raid', null, 'normal'); return false; }
    if (p.act === 'raid') { setActivity('raid'); return S.activity === 'raid'; }
    if (p.act === 'fight') {
      const z = p.zone | 0;
      setActivity('fight');
      if (S.activity === 'fight' && z >= 1 && z <= S.maxZone && z !== S.zone) setZone(z);
      return S.activity === 'fight';
    }
    if (p.act === 'gather') {
      const nd = p.node && validNode(p.node) ? p.node : navLast(p.skill || skillOf(S.node.kind));
      if (!nodeOpen(nd)) return false;
      const moved = !same(S.node, nd);
      if (moved && !setNode(nd.kind, nd.t)) return false;
      if (S.activity !== 'gather') setActivity('gather');
      else if (moved) toast(`You move to the ${NODE_NAMES[nd.kind][nd.t - 1]}.`, 'good', null, 'low');
      watch();
      return S.activity === 'gather';
    }
    return false;
  }
}
