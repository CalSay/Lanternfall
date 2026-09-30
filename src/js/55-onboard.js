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
// onboardNeed(id) -> [{ fam, t, kind, have, n, name }]   what step `id` still waits for in materials ([] = nothing).
// onboardPaused(step) -> bool  should the game wait while this step shows (see PAUSE RULES below).
// goalGate(goal) -> bool       Next Up filter: false while the goal's system is still hidden.
//                              Only active once the UI turns it on (ONBOARD.gate), so the Node
//                              tools see every goal.
// Events: unlock { id, tab, view, quiet } (a feature appeared), onboardStep { id } (a step completed).
// State S.onboard: { v, all, got: { id: seconds played }, done: { stepId: 1 }, seen: { tabOrView: 1 },
//   tips, t (seconds played while the guide runs), taps, casts }.
let isUnlocked, onboardReveal, onboardUnlockAll, onboardStep, onboardDone, onboardTips, onboardCheck, onboardNeed, onboardPaused;
let onboardIsNew = null;   // set by 75-onboard-ui.js; 70-ui.js marks new views with it
let onboardSpec = null;    // set by 75-onboard-ui.js: step id -> { node, text } | null (the browser check)
let soloGuideWants = () => '';   // set by 75-onboard-ui.js: the step on screen ('dodge' / 'parry': the first press counts, 59j forgive)
// paused: the UI shows a guide step that waits for its action (SOLO1, playtest-1 note 1); 90-boot skips the tick.
const ONBOARD = { gate: false, paused: false };
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
  { id: 'party', tab: 'party', view: 'team', name: 'Hero', why: 'hero level 3', when: () => S.L >= 3 || S.maxZone >= 2 },
  { id: 'nextup', name: 'Next Up', why: 'first Training level, or zone 2', when: () => upBought() || S.maxZone >= 2 },
  { id: 'gather', tab: 'gat', view: 'mine', name: 'Gather', why: 'after the first boss (zone 2), or once the hero walks to the grove', when: () => S.maxZone >= 2 || S.activity === 'gather' },
  { id: 'bounties', tab: 'adv', view: 'bounties', name: 'Bounties', why: 'zone 4', when: () => S.maxZone >= 4 },
  { id: 'camp', tab: 'world', view: 'camp', name: 'Camp', why: 'the camp opens (zone 5; a cold Hearth: the fire is lit)', when: () => (!coldH() && S.maxZone >= 5) || (typeof campOpen === 'function' && campOpen()) },
  { id: 'forage', tab: 'gat', view: 'forage', name: 'Foraging', why: 'zone 5', when: () => S.maxZone >= 5 || S.skills.forage.lv > 1 },
  { id: 'craft', tab: 'forge', view: 'make', name: 'Craft', why: 'materials for a first recipe, any gear, or zone 6; a cold Hearth: the Workbench is built', when: () => coldH() ? campLv('bench') >= 1 : S.maxZone >= 6 || S.items.length > 0 || craftReady() },
  { id: 'bestiary', tab: 'adv', view: 'bestiary', name: 'Bestiary', why: 'zone 6 or 60 kills', when: () => S.maxZone >= 6 || S.totalKills >= 60 },
  { id: 'almanac', tab: 'world', view: 'almanac', name: 'Almanac', why: '7 minutes played or zone 7', when: () => O().t >= 420 || S.maxZone >= 7 },   // BAL3: was 8 / 8 (the cheaper Blade front-loads the first 5 minutes)
  { id: 'uniques', tab: 'forge', view: 'uniques', name: 'Uniques', why: 'first unique loot, 12 minutes played, or zone 10', when: () => O().t >= 720 || S.maxZone >= 10 || Object.keys(S.found || {}).length > 0 },
  { id: 'tavern', tab: 'world', view: 'tav', name: 'Tavern', why: '14 minutes played, or zone 8; a cold Hearth: the Tavern is built', when: () => coldH() ? campLv('tavern') >= 1 : O().t >= 840 || S.maxZone >= 8 },
  { id: 'codex', name: 'Codex', why: 'zone 10', when: () => S.maxZone >= 10 },
  { id: 'raid', tab: 'world', view: 'raid', name: 'World raid', why: 'zone 12', when: () => S.maxZone >= 12 || S.raid.dmg > 0 },
  { id: 'stars', tab: 'party', view: 'stars', name: 'Stars', why: 'hero level 10', when: () => S.L >= 10 },
  { id: 'deep', tab: 'adv', view: 'deep', name: 'Deepwell', why: 'zone 18 (it opens at zone 20 and Hearth 3)', when: () => S.maxZone >= 18 || !!(S.deep && S.deep.runs) },
  // late: a system that arrives after the guide. It stays gated after
  // "Show every tab" until its own rule holds, so nobody sees an empty view.
  // Hands (N1, 57f-hands.js): Hearth 2 and the Tavern built. The probe is safe before 57f has loaded.
  { id: 'hands', tab: 'world', view: 'tav', name: 'Hands', why: 'Hearth 2 and the Tavern built', late: true,
    when: () => { try { return handsOpen(); } catch (e) { return false; } } }
];
const FEATURE_OF = Object.fromEntries(FEATURES.map(f => [f.id, f]));

// GUIDE_STEPS: in order of priority; the first step not done whose when() holds is shown.
// done() completes a step by doing the thing. Targets and sentences live in 75-onboard-ui.js.
// Cold-Hearth steps (chop, light, bench, tool, forge, store) show only on a cold save; there tab:gat,
// tab:world and tab:forge are done from the start (chop, light and tool replace them).
// SOLO1 (the solo hero's first session): choose a hero (the create screen), Attack, the ability, Dodge, Parry and
// the counter, the first boss, an upgrade, then Gather (Pine Log for the fire) and camp. `pause`: the game waits while
// the step shows (the UI sets ONBOARD.paused; steps never overlap); `ok`: a step whose action is a Got it button;
// `needs`: the materials a step waits for (no pause, live progress). Build steps complete when the build starts.
const campBusy = id => campLv(id) >= 1 || (typeof campPending === 'function' && !!campPending(id));
// only while its foe lives: a warning left by a foe that died (auto-play, a burn) cannot be parried, so it must not hold the game paused
const heavyShowing = () => { try { const w = typeof actWarning === 'function' && actWarning(); return !!(w && w.kind === 'heavy' && !w.res && w.left > 0.15 && (w.foe && !w.foe.dead && w.foe.hp > 0 && !w.foe.gone || !!(w.spec && w.spec.dead))); } catch (e) { return false; } };
const fightingNow = () => S.activity === 'fight' && !!(S.party && S.party.chosen);
// PAUSE RULES (W1-A; owner: "the game pauses while a tutorial step is open"). A step pauses the game only while it waits
// for the player to READ or PRESS something right now. A step whose goal needs game time (chop logs, wait for a build,
// earn gold) never pauses: it has `needs` (the materials it waits for) and shows live progress instead. A press step whose
// build or recipe is still short of materials has `pauseUnless` (the same list): it does not pause while any is missing,
// so no step can freeze the clock it needs. tools/check.mjs holds all three rules.
//   attack, ability, dodge, parry, gather, light, upgrade   pause (press this now)
//   boss                                                     pause (Got it)
//   chop, stock:bench, stock:tool, stock:forge, stock:store  no pause (needs materials: live progress)
//   bench, tool, forge, store                                pause only once the materials are in hand (pauseUnless)
//   tab:party, nextup                                        no pause (a pointer or a Got it; nothing waits on them)
const stockOf = (fam, t, n) => [fam, t, n];
const matsOfBuild = id => (typeof hearthFirst === 'function' && hearthFirst(id) ? hearthFirst(id).mats : []);
const toolMats = () => { try { const c = canCraft('pick', 1); return Object.entries((c.cost && c.cost.mats) || {}).map(([f, n]) => stockOf(f, 1, n)); } catch (e) { return []; } };
const fireMats = () => (typeof HEARTH_TUNE === 'object' ? HEARTH_TUNE.light : []);
// W1-D (playtest-2 P0): a combat step pauses the game only while what it asks for can happen right now, so the pause can
// never freeze the clock the step needs (a respawn, a heavy hit landing, a cooldown running out). `pauseWhen`: the
// extra condition for the pause. Attack and the ability need a live foe; Dodge and Parry need a wind-up still on its
// way, and the guide's press ignores a cooldown left by an earlier press (59j: `forgive`), so a paused game never waits on one.
const liveFoe = () => { try { return combatFoes().some(f => f && !f.dead && f.hp > 0 && !f.gone); } catch (e) { return false; } };
const GUIDE_STEPS = [
  { id: 'attack', pause: 1, pauseWhen: liveFoe, when: () => fightingNow(), done: () => (O().atk || 0) >= 1 || S.totalKills >= 12 },
  { id: 'ability', pause: 1, pauseWhen: liveFoe, when: () => stepDone('attack') && fightingNow() && abilityOk(), done: () => O().casts >= 1 },
  { id: 'dodge', pause: 1, pauseWhen: () => liveFoe() && heavyShowing(), when: () => stepDone('ability') && fightingNow() && heavyShowing(), done: () => (O().dodges || 0) >= 1 },
  { id: 'parry', pause: 1, pauseWhen: () => liveFoe() && heavyShowing(), when: () => stepDone('dodge') && fightingNow() && heavyShowing(), done: () => (O().parries || 0) >= 1 },
  { id: 'boss', pause: 1, ok: 1, when: () => S.maxZone === 1 && S.zone === 1 && typeof fightBoss !== 'undefined' && !!fightBoss, done: () => S.maxZone >= 2 },
  // W2-A: Train Attack on the Hero tab (it opens with the step: the tab is unlocked by then, hero level 3 or zone 2)
  { id: 'upgrade', pause: 1, when: () => stepDone('ability') && isUnlocked('party') && S.gold >= cheapestUp(), done: () => upBought() },
  { id: 'gather', pause: 1, when: () => S.maxZone >= 2 && isUnlocked('gather') && unlit() && S.activity !== 'gather', done: () => !unlit() || S.activity === 'gather' || oak8() },
  { id: 'chop', needs: fireMats, when: () => unlit() && S.activity === 'gather', done: () => !unlit() || oak8() },
  { id: 'light', pause: 1, when: () => unlit() && oak8(), done: () => !unlit() },
  { id: 'stock:bench', needs: () => matsOfBuild('bench'), when: () => coldH() && plotOpen('bench') && !!needShort(matsOfBuild('bench')).length, done: () => !coldH() || campBusy('bench') },
  { id: 'bench', pause: 1, pauseUnless: () => matsOfBuild('bench'), when: () => coldH() && plotOpen('bench'), done: () => !coldH() || campBusy('bench') },
  { id: 'stock:tool', needs: toolMats, when: () => coldH() && campLv('bench') >= 1 && !!needShort(toolMats()).length, done: () => !coldH() || toolMade() },
  // only once Craft is unlocked: this step pauses the game, and the unlock pass runs on the game clock, so a pause that
  // came first held Craft locked for good (the Craft tab opened on Uniques only, with no Make view to point at)
  { id: 'tool', pause: 1, pauseUnless: toolMats, when: () => coldH() && campLv('bench') >= 1 && isUnlocked('craft'), done: () => !coldH() || toolMade() },
  { id: 'stock:forge', needs: () => matsOfBuild('forge'), when: () => coldH() && stepDone('tool') && plotOpen('forge') && !!needShort(matsOfBuild('forge')).length, done: () => !coldH() || campBusy('forge') },
  { id: 'forge', pause: 1, pauseUnless: () => matsOfBuild('forge'), when: () => coldH() && stepDone('tool') && plotOpen('forge'), done: () => !coldH() || campBusy('forge') },
  { id: 'stock:store', needs: () => matsOfBuild('store'), when: () => coldH() && plotOpen('store') && !!needShort(matsOfBuild('store')).length, done: () => !coldH() || !(typeof CAMP_B === 'object' && CAMP_B.store) || campBusy('store') },
  { id: 'store', pause: 1, pauseUnless: () => matsOfBuild('store'), when: () => coldH() && plotOpen('store'), done: () => !coldH() || !(typeof CAMP_B === 'object' && CAMP_B.store) || campBusy('store') },
  { id: 'tab:party', when: () => isUnlocked('party') && S.maxZone >= 3 && !unlit(), done: () => !!O().seen.party },
  // a Got it note: it never pauses and never blocks (audit-1 3.8); the Next Up chip or Got it ends it
  { id: 'nextup', ok: 1, when: () => isUnlocked('nextup') && stepDone('upgrade') && S.maxZone >= 3, done: () => false }
];
const toolMade = () => S.items.some(it => CRAFT_KINDS[it.slot] && CRAFT_KINDS[it.slot].tool);

const O = () => S.onboard || (S.onboard = {});
const stepDone = id => !!O().done[id];
// Materials still short: [[fam, tier, n]] -> [{ fam, t, kind, have, n, name }]. kind: the gather node that yields it.
const matHave = (f, t) => (S.mats && S.mats[f] && S.mats[f][t - 1]) || 0;
function needShort(mats) {
  const out = [];
  for (const [fam, t, n] of mats || []) {
    const have = matHave(fam, t);
    if (have < n) out.push({ fam, t, kind: typeof NODE_NAMES === 'object' && NODE_NAMES[fam] && craftNodeVisible(fam, t) ? fam : null, have, n, name: matName(fam, t) });
  }
  return out;
}
// The guide teaches Training's Attack: the first level's price, and whether any move has been trained.
const cheapestUp = () => { const p = typeof trainPlan === 'function' && soloHero() ? trainPlan('atk', '1') : null; return p && p.n > 0 ? p.cost : Infinity; };
const upBought = () => !!(S.solo && S.solo.tr && Object.values(S.solo.tr).some(r => r && Object.values(r).some(v => v > 0)));
const abilityOk = () => { try { const a = typeof abilityInfo === 'function' && abilityInfo(); return !!(a && a.ready); } catch (e) { return false; } };
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
  registerState('onboard', { v: 1, all: false, got: {}, done: {}, seen: {}, tips: true, t: 0, taps: 0, casts: 0, atk: 0, dodges: 0, parries: 0 });

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
  const stepById = id => GUIDE_STEPS.find(s => s.id === id) || null;
  onboardNeed = id => { const s = stepById(id), f = s && (s.needs || s.pauseUnless); try { return f ? needShort(f()) : []; } catch (e) { return []; } };
  // The pause guard: a step that waits for the player pauses the game, but never while it is also short of
  // the materials the action costs (the player could not press it and the clock they need would be stopped).
  onboardPaused = step => { if (!(step && step.pause && !onboardNeed(step.id).length)) return false; try { return !step.pauseWhen || !!step.pauseWhen(); } catch (e) { return true; } };
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
  const GOAL_FEATURE = { bounty: 'bounties', bestiary: 'bestiary', skill: 'gather', forge: 'craft', camp: 'camp', codex: 'codex', deep: 'deep' };
  onboardGoalOk = g => isUnlocked(GOAL_FEATURE[g.sys] || null);

  // ---- counters and the clock ----
  // A cold save's chops (taps on the tree) do not count toward "tap a foe".
  on('tap', e => { if (e && e.node && coldH()) return; if (!O().all || !guideOver()) O().taps++; });
  on('ability', e => { if (!e || !e.auto) O().casts++; });
  // SOLO1: the buttons
  on('soloAttack', () => { O().atk = (O().atk || 0) + 1; });
  on('soloDodge', e => { if (e && (e.res === 'dodge' || e.res === 'perfect')) O().dodges = (O().dodges || 0) + 1; });
  on('soloParry', e => { if (e && e.res === 'parry') O().parries = (O().parries || 0) + 1; });
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
