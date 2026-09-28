// 55-onboard: the guided first ten minutes (docs/design/onboarding.md). Two parts:
//   1. Progressive unlocks. Tabs, sub-views and a few sections appear as the player reaches them,
//      so a new game starts with the Fight tab only. The rules are the FEATURES table below.
//   2. The guide: a short list of contextual hints (GUIDE_STEPS). Each step completes by doing
//      the thing. The UI (75-onboard-ui.js) draws the marker and the sentence.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// isUnlocked(id) -> bool       UI files ask this; views and sections declare `feature: id`.
//                              Unknown ids and falsy ids are unlocked.
// onboardReveal(id)            unlock one feature now (the player navigated there some other way).
// onboardUnlockAll()           every feature now ("Show every tab" in the Journal).
// onboardStep() -> step | null the guide step to show now: { id, ...GUIDE_STEPS entry }.
// onboardDone(id)              mark a guide step done (the UI's "x", or a UI-only action).
// onboardTips(on)              guide on/off ("Skip tips" in the Journal).
// goalGate(goal) -> bool       Next Up filter: false while the goal's system is still hidden.
//                              Only active once the UI turns it on (ONBOARD.gate), so the Node
//                              tools see every goal.
// Events: unlock { id, tab, view, quiet } (a feature appeared), onboardStep { id } (a step completed).
// State S.onboard: { v, all, got: { id: seconds played }, done: { stepId: 1 }, seen: { tabOrView: 1 },
//   tips, t (seconds played while the guide runs), taps, casts, rec }.
// Old saves (any progress, no S.onboard yet) start with everything unlocked and the guide finished.
let isUnlocked, onboardReveal, onboardUnlockAll, onboardStep, onboardDone, onboardTips, onboardCheck;
let onboardIsNew = null;   // set by 75-onboard-ui.js; 70-ui.js marks new views with it
const ONBOARD = { gate: false };
// function declaration: 55-goals.js (loaded earlier) calls it at run time.
function goalGate(g) { return !ONBOARD.gate || typeof onboardGoalOk !== 'function' || onboardGoalOk(g); }
let onboardGoalOk;

// A new game's cold Hearth (55-hearth, H1; hearth-and-hands.md 1.5): Gather from the start, Camp
// when the fire is lit, Craft when the Workbench is built, the Tavern when it is built. Warm saves
// keep the old rules.
const coldH = () => typeof hearthCold === 'function' && hearthCold();
const campLv = id => typeof campLevel === 'function' ? campLevel(id) : 0;
const plotOpen = id => typeof CAMP_B === 'object' && !!CAMP_B[id] && typeof hearthPlotOpen === 'function' && hearthPlotOpen(id) && !(typeof campPending === 'function' && campPending(id));
const oak8 = () => typeof hearthCan === 'function' && hearthCan().ok;
const unlit = () => coldH() && typeof hearthLit === 'function' && !hearthLit();

// FEATURES: one row per thing that unlocks. tab/view say where it lives (for the UI's toast and
// "new" marks); when() is checked about once a second; `why` is the rule in words (docs and checks).
// A tab shows while any of its views is unlocked (Fight's Upgrades view is always there).
const FEATURES = [
  { id: 'party', tab: 'party', view: 'team', name: 'Party', why: 'hero level 3', when: () => S.L >= 3 || S.maxZone >= 2 },
  { id: 'nextup', name: 'Next Up', why: 'first upgrade bought, or zone 2', when: () => S.blade + S.swift + S.fortune > 0 || S.maxZone >= 2 },
  { id: 'gather', tab: 'gat', view: 'mine', name: 'Gather', why: 'zone 3 (two bosses down); a cold Hearth: from the start', when: () => coldH() || S.maxZone >= 3 },
  { id: 'bounties', tab: 'adv', view: 'bounties', name: 'Bounties', why: 'zone 4', when: () => S.maxZone >= 4 },
  { id: 'camp', tab: 'world', view: 'camp', name: 'Camp', why: 'the camp opens (zone 5; a cold Hearth: the fire is lit)', when: () => (!coldH() && S.maxZone >= 5) || (typeof campOpen === 'function' && campOpen()) },
  { id: 'forage', tab: 'gat', view: 'forage', name: 'Foraging', why: 'zone 5', when: () => S.maxZone >= 5 || S.skills.forage.lv > 1 },
  { id: 'craft', tab: 'forge', view: 'make', name: 'Craft', why: 'materials for a first recipe, any gear, or zone 6; a cold Hearth: the Workbench is built', when: () => coldH() ? campLv('bench') >= 1 : S.maxZone >= 6 || S.items.length > 0 || craftReady() },
  { id: 'bestiary', tab: 'adv', view: 'bestiary', name: 'Bestiary', why: 'zone 6 or 60 kills', when: () => S.maxZone >= 6 || S.totalKills >= 60 },
  { id: 'almanac', tab: 'world', view: 'almanac', name: 'Almanac', why: '8 minutes played or zone 8', when: () => O().t >= 480 || S.maxZone >= 8 },
  { id: 'roster', tab: 'party', view: 'roster', name: 'Roster', why: '10 minutes played or zone 7', when: () => O().t >= 600 || S.maxZone >= 7 || recruitable() },
  { id: 'exped', tab: 'world', view: 'camp', name: 'Expeditions', why: 'the Map Room opens a slot', when: () => typeof expedOpen === 'function' && expedOpen() },
  { id: 'synergy', tab: 'party', view: 'team', name: 'Combos and Bonds', why: 'a full party of three', when: () => !!(S.party && S.party.field && S.party.field.length >= 2) },
  { id: 'uniques', tab: 'forge', view: 'uniques', name: 'Uniques', why: 'first unique loot, 12 minutes played, or zone 10', when: () => O().t >= 720 || S.maxZone >= 10 || Object.keys(S.found || {}).length > 0 },
  { id: 'tavern', tab: 'world', view: 'tav', name: 'Tavern', why: '14 minutes played, or zone 8; a cold Hearth: the Tavern is built', when: () => coldH() ? campLv('tavern') >= 1 : O().t >= 840 || S.maxZone >= 8 },
  { id: 'codex', name: 'Codex', why: 'zone 10', when: () => S.maxZone >= 10 },
  { id: 'raid', tab: 'world', view: 'raid', name: 'World raid', why: 'zone 12', when: () => S.maxZone >= 12 || S.raid.dmg > 0 },
  { id: 'stars', tab: 'party', view: 'stars', name: 'Stars', why: 'hero level 10', when: () => S.L >= 10 },
  { id: 'deep', tab: 'adv', view: 'deep', name: 'Deepwell', why: 'zone 18 (it opens at zone 20 and Hearth 3)', when: () => S.maxZone >= 18 || !!(S.deep && S.deep.runs) },
  // late: a system that arrives after the guide. It stays gated on old saves (S.onboard.all) and after
  // "Show every tab" until its own rule holds, so nobody sees an empty view.
  // Powers: the first legendary power, or a first Circle Sigil (Sigils are spent in the same view).
  { id: 'powers', tab: 'forge', view: 'powers', name: 'Powers', why: 'first legendary power or Circle Sigil', late: true,
    when: () => !!(S.legend && ((S.legend.n && S.legend.n.drops > 0) || Object.keys(S.legend.book || {}).length || (S.legend.sig || []).some(n => n > 0))) }
];
const FEATURE_OF = Object.fromEntries(FEATURES.map(f => [f.id, f]));

// GUIDE_STEPS: in order of priority; the first step not done whose when() holds is shown.
// done() completes a step by doing the thing. Targets and sentences live in 75-onboard-ui.js.
// Cold-Hearth steps (chop, light, bench, tool, forge, store) show only on a cold save; there tab:gat,
// tab:world and tab:forge are done from the start (chop, light and tool replace them).
const GUIDE_STEPS = [
  { id: 'chop', when: () => unlit() && S.activity === 'gather', done: () => !unlit() || oak8() },
  { id: 'light', when: () => unlit() && (oak8() || S.maxZone >= 2), done: () => !unlit() },
  { id: 'tap', when: () => !unlit() || S.activity !== 'gather', done: () => O().taps >= 3 || S.totalKills >= 25 },
  { id: 'ability', when: () => stepDone('tap') && abilityOk(), done: () => O().casts >= 1 },
  { id: 'boss', when: () => S.maxZone === 1 && S.zone === 1 && typeof fightBoss !== 'undefined' && !!fightBoss, done: () => S.maxZone >= 2 },
  { id: 'upgrade', when: () => S.gold >= cheapestUp(), done: () => S.blade + S.swift + S.fortune > 0 },
  { id: 'tab:party', when: () => isUnlocked('party'), done: () => !!O().seen.party },
  { id: 'bench', when: () => coldH() && plotOpen('bench'), done: () => !coldH() || campLv('bench') >= 1 },
  { id: 'tool', when: () => coldH() && campLv('bench') >= 1, done: () => !coldH() || S.items.some(it => CRAFT_KINDS[it.slot] && CRAFT_KINDS[it.slot].tool) },
  { id: 'nextup', when: () => isUnlocked('nextup') && stepDone('upgrade') && S.maxZone >= 2, done: () => false },
  { id: 'forge', when: () => coldH() && stepDone('tool') && plotOpen('forge'), done: () => !coldH() || campLv('forge') >= 1 },
  { id: 'store', when: () => coldH() && plotOpen('store'), done: () => !coldH() || !(typeof CAMP_B === 'object' && CAMP_B.store) || campLv('store') >= 1 },
  { id: 'tab:gat', when: () => isUnlocked('gather'), done: () => coldH() || !!O().seen.gat },
  { id: 'tab:world', when: () => isUnlocked('camp'), done: () => coldH() || !!O().seen.world },
  { id: 'tab:forge', when: () => isUnlocked('craft'), done: () => coldH() || !!O().seen.forge },
  { id: 'recruit', when: () => !!O().rec || recruitable(), done: () => !!O().rec && !!O().seen.partyAfterRec }
];

const O = () => S.onboard || (S.onboard = {});
const stepDone = id => !!O().done[id];
const cheapestUp = () => { let c = Infinity; for (const u of HERO_UPS) { const p = plan(u.base, u.r, S[u.id], 0, u.cap, '1'); if (p.cost < c) c = p.cost; } return c; };
const abilityOk = () => { try { const a = typeof abilityInfo === 'function' && abilityInfo(); return !!(a && a.ready); } catch (e) { return false; } };
function recruitable() {
  try {
    if (typeof rosterLive !== 'function' || !rosterLive()) return false;
    for (const k of ROSTER_KEYS) if (!isRecruited(k) && canRecruit(k)) return true;
  } catch (e) {}
  return false;
}
// Materials for a first tier-1 recipe the hero can wear (as the Next Up craft goal reads it).
function craftReady() {
  try {
    const who = heroWho();
    for (const pos of CRAFT_HERO_POS) {
      const row = CRAFT_FITS[pos] || {}, own = who !== 'any' ? row[who] || [] : [];
      for (const k of (own.length ? own : row.any || [])) {
        if (CRAFT_KINDS[k].legacy || !fits(k, pos, 'hero')) continue;
        if (canCraft(k, 1).ok) return true;
      }
    }
  } catch (e) {}
  return false;
}

{
  // Decide before registerState fills in the defaults: an old save has progress and no S.onboard.
  const oldSave = S.onboard === undefined && (S.totalKills > 0 || S.L > 1 || S.maxZone > 1 || (S.comp || []).some(n => n > 0));
  registerState('onboard', { v: 1, all: false, got: {}, done: {}, seen: {}, tips: true, t: 0, taps: 0, casts: 0, rec: '' });
  if (oldSave) { S.onboard.all = true; S.onboard.tips = false; for (const s of GUIDE_STEPS) S.onboard.done[s.id] = 1; }

  isUnlocked = id => !id || !FEATURE_OF[id] || O().got[id] != null || (O().all && !FEATURE_OF[id].late);
  function unlock(id, quiet) {
    const f = FEATURE_OF[id]; if (!f || isUnlocked(id)) return false;
    O().got[id] = Math.round(O().t);
    emit('unlock', { id, tab: f.tab || null, view: f.view || null, quiet: !!quiet });
    return true;
  }
  onboardReveal = id => unlock(id, true);
  onboardUnlockAll = () => {
    if (O().all) return;
    O().all = true;
    emit('unlock', { id: '*', tab: null, view: null, quiet: true });
  };
  // Check every rule now; returns the ids that unlocked. The tick hook calls it about once a second.
  onboardCheck = () => {
    const out = [];
    for (const f of FEATURES) {
      if (O().all && !f.late) continue;
      if (O().got[f.id] != null) continue;
      let ok = false; try { ok = !!f.when(); } catch (e) {}
      if (ok && unlock(f.id)) out.push(f.id);
    }
    if (!O().all && FEATURES.every(f => f.late || O().got[f.id] != null)) O().all = true;
    return out;
  };

  // ---- the guide ----
  onboardTips = on => { O().tips = on === undefined ? !O().tips : !!on; return O().tips; };
  onboardDone = id => { if (!O().done[id]) { O().done[id] = 1; emit('onboardStep', { id }); } };
  const guideOver = () => GUIDE_STEPS.every(s => O().done[s.id]);
  onboardStep = () => {
    if (!O().tips) return null;
    for (const s of GUIDE_STEPS) {
      if (O().done[s.id]) continue;
      let d = false; try { d = !!s.done(); } catch (e) {}
      if (d) { onboardDone(s.id); continue; }
      let w = false; try { w = !!s.when(); } catch (e) {}
      if (w) return s;
    }
    return null;
  };

  // ---- Next Up: hide goals whose system is still hidden (only while ONBOARD.gate is on) ----
  const GOAL_FEATURE = { roster: 'roster', bounty: 'bounties', bestiary: 'bestiary', skill: 'gather', forge: 'craft', camp: 'camp', exped: 'exped', codex: 'codex', deep: 'deep' };
  onboardGoalOk = g => isUnlocked(GOAL_FEATURE[g.sys] || null);

  // ---- counters and the clock ----
  // A cold save's chops (taps on the tree) do not count toward "tap a foe".
  on('tap', e => { if (e && e.node && coldH()) return; if (!O().all || !guideOver()) O().taps++; });
  on('ability', e => { if (!e || !e.auto) O().casts++; });
  on('recruit', e => { if (e && e.source !== 'starter' && e.source !== 'test' && !O().rec) O().rec = e.id; });
  let acc = 0;
  let lateAcc = 0;
  const lateOpen = () => FEATURES.every(f => !f.late || O().got[f.id] != null);
  onTick(dt => {
    if (O().all) {   // only late features are left to check (about once a second)
      lateAcc += dt; if (lateAcc < 1) return; lateAcc = 0;
      if (!lateOpen()) onboardCheck();
      return;
    }
    O().t += dt;
    acc += dt; if (acc < 1) return; acc = 0;
    onboardCheck();
  });
}
