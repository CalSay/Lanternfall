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
// onboardWants(id) -> bool     step `id` is still due (tips on, not done or hidden, its when() true), in any fight phase.
// onboardPaused(step) -> bool  should the game wait while this step shows (see PAUSE RULES below).
// goalGate(goal) -> bool       Next Up filter: false while the goal's system is still hidden.
//                              Only active once the UI turns it on (ONBOARD.gate), so the Node
//                              tools see every goal.
// onboardUse({ tab, view, feature }) -> { id, text } | null   the first-use line for the system on screen (FIRST_USE below):
//                              each system that opens after the first fight explains itself once, in one line. The UI
//                              asks only while no guide step shows and no fight is in view; it pauses the game only to hold
//                              the gap between two foes with the fight in view, until Got it (staged-guide-followups).
// onboardUseDone(id)           the line was read (x, or about 7 s on screen). No event, so guide walks never see it.
// onboardJoined(id)            a starter joined on the road (56c, starters-join-when-met): the first opens the `switch` row, a later
//                              one stamps the clock (got['join:<id>']), so no unlock opens within ONBOARD_TUNE.gap of any join.
// Events: unlock { id, tab, view, quiet } (a feature appeared), onboardStep { id } (a step completed).
// State S.onboard: { v, all, got: { id: seconds played }, done: { stepId: 1 }, seen: { tabOrView: 1 },
//   tips, t (seconds played while the guide runs), taps, casts, sayQ: [{ id, arg }] (Hesketh's unread lines, 75-onboard-ui; reload-keeps-tips) }.
let isUnlocked, onboardReveal, onboardUnlockAll, onboardStep, onboardDone, guideHide, onboardUse, onboardUseDone, onboardTips, onboardCheck, onboardNeed, onboardWants, onboardPaused, guideRetire, guideLessonHold, onboardJoined;
let lessonLast = -1;   // the foe's clock at the last tick (guideLessonHold: a hold starts only on the frame that crosses a window's opening)
let onboardIsNew = null;   // set by 75-onboard-ui.js; 70-ui.js marks new views with it
let onboardSpec = null;    // set by 75-onboard-ui.js: step id -> { node, text } | null (the browser check)
let soloGuideWants = () => '';   // set by 75-onboard-ui.js: the step on screen ('dodge' / 'parry': the first press counts, 59j forgive)
// paused: the UI shows a guide step that waits for its action (SOLO1, playtest-1 note 1); 90-boot skips the tick. Key presses still pass it
// (only gameHeld() blocks them), so a held Dodge can be pressed from the keyboard.
// lessons: the browser turns on the staged guide's core hold (cal-0107-staged-guide; guideLessonHold below). Off in the Node tools, so the sim
// and the parity tools never see it.
const ONBOARD = { gate: false, paused: false, lessons: false };
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
// story-unlock-gates (judge): at most one new row per ONBOARD_TUNE.gap seconds of play, the first ready row in table order; a row's
// now() skips the wait when the player's own act or a drop opened it (raid: the online layer's timing stays as it was). 0: off.
const ONBOARD_TUNE = { gap: 90 };
const FEATURES = [
  { id: 'party', tab: 'party', view: 'team', name: 'Hero', why: 'the first level-up (hero level 2), or zone 2', when: () => S.L >= 2 || S.maxZone >= 2 },
  { id: 'gather', tab: 'gat', view: 'mine', name: 'Gather', why: 'after the first boss (zone 2), or once the hero walks to the grove', when: () => S.maxZone >= 2 || S.activity === 'gather', now: () => S.activity === 'gather' },
  { id: 'nextup', name: 'Next Up', why: 'first attribute point or Training level, or zone 2', when: () => upBought() || S.maxZone >= 2 },
  { id: 'awaynote', name: 'Away note', why: 'Gather is open (the away strip under the Fight / Gather row, 71-ui-fight)', when: () => isUnlocked('gather') },
  { id: 'bounties', tab: 'adv', view: 'bounties', name: 'Bounties', why: 'zone 4', when: () => S.maxZone >= 4 },
  { id: 'camp', tab: 'world', view: 'camp', name: 'Camp', why: 'the camp opens (zone 5; a cold Hearth: the fire is lit)', when: () => (!coldH() && S.maxZone >= 5) || (typeof campOpen === 'function' && campOpen()), now: () => typeof campOpen === 'function' && campOpen() },
  { id: 'forage', tab: 'gat', view: 'forage', name: 'Foraging', why: 'zone 5', when: () => S.maxZone >= 5 || S.skills.forage.lv > 1 },
  { id: 'craft', tab: 'forge', view: 'make', name: 'Craft', why: 'materials for a first recipe, any gear, or zone 6; a cold Hearth: the Workbench is built', when: () => coldH() ? campLv('bench') >= 1 : S.maxZone >= 6 || S.items.length > 0 || craftReady(), now: () => campLv('bench') >= 1 },
  { id: 'bestiary', tab: 'adv', view: 'bestiary', name: 'Bestiary', why: 'zone 6 or 60 kills', when: () => S.maxZone >= 6 || S.totalKills >= 60 },
  { id: 'almanac', tab: 'world', view: 'almanac', name: 'Almanac', why: '7 minutes played or zone 7', when: () => O().t >= 420 || S.maxZone >= 7 },   // BAL3: was 8 / 8 (the cheaper Blade front-loads the first 5 minutes)
  { id: 'uniques', tab: 'forge', view: 'uniques', name: 'Uniques', why: 'first unique loot, 12 minutes played, or zone 10', when: () => O().t >= 720 || S.maxZone >= 10 || Object.keys(S.found || {}).length > 0, now: () => Object.keys(S.found || {}).length > 0 },
  { id: 'tavern', tab: 'world', view: 'tav', name: 'Tavern', why: '14 minutes played, or zone 8; a cold Hearth: the Tavern is built', when: () => coldH() ? campLv('tavern') >= 1 : O().t >= 840 || S.maxZone >= 8, now: () => campLv('tavern') >= 1 },
  { id: 'codex', name: 'Codex', why: 'zone 10', when: () => S.maxZone >= 10 },
  { id: 'raid', tab: 'world', view: 'raid', name: 'World raid', why: 'zone 12', when: () => S.maxZone >= 12 || S.raid.dmg > 0, now: () => true },
  { id: 'stars', tab: 'party', view: 'stars', name: 'Stars', why: 'the first star found (the zone 6 boss), or hero level 10', when: () => S.L >= 10 || !!(S.stars && S.stars.own && Object.keys(S.stars.own).length), now: () => !!(S.stars && S.stars.own && Object.keys(S.stars.own).length) },
  { id: 'deep', tab: 'adv', view: 'deep', name: 'Deepwell', why: 'zone 18 (it opens at zone 20 and Hearth 3)', when: () => S.maxZone >= 18 || !!(S.deep && S.deep.runs) },
  // late: a system that arrives after the guide. It stays gated after
  // "Show every tab" until its own rule holds, so nobody sees an empty view.
  // Hands (N1, 57f-hands.js): Hearth 2 and the Tavern built. The probe is safe before 57f has loaded.
  { id: 'hands', tab: 'world', view: 'tav', name: 'Hands', why: 'Hearth 2 and the Tavern built', late: true,
    when: () => { try { return handsOpen(); } catch (e) { return false; } } },
  // starters-join-when-met: switching heroes opens when the first starter joins a new game (56c). Never on a save that began with all three.
  { id: 'switch', name: 'Switch hero', why: 'a starter joins you at a Champion (a new game)', late: true,
    when: () => typeof heroJoins === 'function' && heroJoins().length > 0, now: () => true },
  // Tavern Blackjack (57t-blackjack.js, tavern-blackjack.md 7): zone 14, the Tavern built, and 10 minutes of play after the Tavern
  // (and Hands) rows opened. No `now`: it waits its turn behind the spacing governor. BJ_TUNE.on 0 keeps it shut.
  { id: 'blackjack', tab: 'world', view: 'tav', name: 'Blackjack', late: true, why: 'zone 14, with the Tavern built 10 minutes before',
    when: () => { try { return bjOpen(); } catch (e) { return false; } } }
];
const FEATURE_OF = Object.fromEntries(FEATURES.map(f => [f.id, f]));

// FIRST_USE (ap-first-use-hints): every FEATURES row has exactly one line saying what that system is, plain words.
// via (default 'hint'): where the line shows. 'hint': the docked hint, once, the first time the player opens the view
// (onboardUse). 'guide': the guide's own step carries it (Next Up). 'notice': the unlock notice carries it (the Codex,
// Stars: they open as a sheet or a toast, not a view). The unlock notice of a 'hint' system only says where it is
// (75-onboard-ui OPEN_TXT), so one unlock gives one notice and one line. The guide NPC can voice these later.
const FIRST_USE_FOR = 7200;   // seconds of play after the unlock (the same window as a view's "new" mark)
const FIRST_USE = {
  party: { text: 'This is where you grow. Your level, build and abilities are all here.' },
  nextup: { text: 'That chip is Next Up. It shows the best thing to do next, so press it.', via: 'guide' },
  awaynote: { text: "While you're away, gathering goes on but fighting stops.", via: 'strip' },   // the strip is its own line (71-ui-fight)
  gather: { text: "Pick a place to work and you'll keep chopping or mining it, even while you're away." },
  bounties: { text: 'Folk post three short jobs here. They pay in gold, materials and Renown.' },
  camp: { text: 'This is your camp. Each thing you build here opens a new way to make things.' },
  forage: { text: 'Out here you can forage for fibre and herbs.' },
  craft: { text: 'This is where you make gear. Pick a station first, then a recipe.' },
  bestiary: { text: "Every foe you've met is written here. Kill enough of one and you earn a perk against it." },
  almanac: { text: "The Almanac tells you today's Omen. It has Dares and a weekly board too." },
  uniques: { text: 'Bosses sometimes drop rare gear. Each piece here has a strong trick of its own.' },
  tavern: { text: "This is the Tavern. You can see who's online, and the hall of heroes." },
  codex: { text: 'The Codex is open. It tracks what you have found. Find it in the Journal.', via: 'notice' },
  raid: { text: 'Every player fights this one boss together. Your hits add to the same total.' },
  stars: { text: 'Each star changes how your fights play.', via: 'notice' },
  deep: { text: 'The Deepwell goes down floor by floor. Pick a boon between floors and earn Marks.' },
  hands: { text: "You can hire gatherers on the Tavern board. They work shifts while you're away." },
  switch: { text: 'Switch heroes on the Hero tab, for free.', via: 'notice' },
  blackjack: { text: "Bet gold and beat Hesketh's hand without going over 21." }   // the join line on the Champion card (56c heroJoinLine)
};

// GUIDE_STEPS: in order of priority; the first step not done whose when() holds is shown.
// done() completes a step by doing the thing. Targets and sentences live in 75-onboard-ui.js.
// Cold-Hearth steps (chop, light, bench, tool, forge, store) show only on a cold save; there tab:gat,
// tab:world and tab:forge are done from the start (chop, light and tool replace them).
// SOLO1 (the solo hero's first session): choose a hero (the create screen), Attack, the ability, Dodge, Parry and
// the counter, the first boss, an upgrade, then Gather (Pine Log for the fire) and camp. cal-0107-staged-guide: in a turn fight the four
// presses are one staged lesson, taught as each first comes up: Attack, Dodge, the ability, Parry. `pause`: the game waits while
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
//   spend                                                    pause (press this now; spend-points-before-nextup)
//   boss                                                     pause (Got it)
// cal-0107-staged-guide: in a fight only the held lessons (attack, dodge, ability, parry, boss) show and pause. Every other step
// (`ph` 'between') shows only between fights, and its line is hidden while a foe is on the field.
//   chop, stock:bench, stock:tool, stock:forge, stock:weapon, stock:store  no pause (needs materials: live progress)
//   bench, tool, forge, weapon, store                        pause only once the materials are in hand (pauseUnless)
//   tab:party, nextup                                        no pause (a pointer or a Got it; nothing waits on them). staged-guide-followups:
//                                                            a Got it line that starts in the gap between foes holds that gap (75-onboard-ui)
const stockOf = (fam, t, n) => [fam, t, n];
// A Lv 1 row's gold rides along as ['gold', 0, n] (the Workbench): needShort reads it from S.gold, so a press step never pauses short of gold either.
const matsOfBuild = id => { const f = typeof hearthFirst === 'function' ? hearthFirst(id) : null; return f ? f.mats.concat(f.gold > 0 ? [['gold', 0, f.gold]] : []) : []; };
const toolMats = () => { try { const c = canCraft('pick', 1); return Object.entries((c.cost && c.cost.mats) || {}).map(([f, n]) => stockOf(f, 1, n)); } catch (e) { return []; } };
const fireMats = () => (typeof HEARTH_TUNE === 'object' ? HEARTH_TUNE.light : []);
// first-gold-and-camp-strip: the hero's class weapon at the Forge (the same pick as the Next Up craft goal), its tier 1 materials, and whether the hero has made or found one.
const weaponKind = () => {
  try {
    const who = heroWho(), row = CRAFT_FITS.weapon || {}, own = who !== 'any' ? row[who] || [] : [];
    return (own.length ? own : row.any || []).find(k => !CRAFT_KINDS[k].legacy && fits(k, 'weapon', 'hero')) || null;
  } catch (e) { return null; }
};
const weaponMats = () => { const k = weaponKind(); try { return k ? Object.entries(craftRecipe(k, 1)).filter(([f]) => f !== 'gold').map(([f, n]) => stockOf(f, 1, n)) : []; } catch (e) { return []; } };
const weaponStation = () => { const k = weaponKind(); return k ? CRAFT_KINDS[k].st : null; };
// gear-in-first-25: where a material comes from, and whether that place is open now. Fights pay essence and gold, so those are always
// open; a gathered one is open when its Gather view shows (navSkillOpen: Hunting and Foraging from zone 5) and its node's tier is open.
// -> { open, skill, kind (the node, or null), verb, opens ('zone 5' while the view waits on a zone, else null) }
const PLACE_VERB = { ore: 'Mine', crystal: 'Mine', wood: 'Chop', fibre: 'Gather', herb: 'Gather', hide: 'Hunt' };
const matPlace = (fam, t = 1) => {
  if (fam === 'ess' || fam === 'gold') return { open: true, skill: null, kind: null, verb: 'Fight for', opens: null };
  const fm = typeof CRAFT_FAMILY === 'object' ? CRAFT_FAMILY[fam] : null;
  if (!fm || fm.src !== 'gather' || !CRAFT_NODES[fam]) return { open: false, skill: null, kind: null, verb: 'Gather', opens: null };
  const sk = fm.skill, seen = typeof navSkillOpen === 'function' && navSkillOpen(sk);
  const open = seen && craftNodeVisible(fam, t) && skillTierOpen(sk, t);
  const f = !seen && (sk === 'forage' || sk === 'hunt') && (sk !== 'hunt' || huntingVisible()) && !isUnlocked('forage') ? FEATURES.find(x => x.id === 'forage') : null;
  return { open, skill: sk, kind: open ? fam : null, verb: PLACE_VERB[fam] || 'Gather', opens: f ? f.why : null };
};
// The Craft card's line under a recipe short of a gathered material: "Bristlehide: from Hunting, which opens at zone 5." / "Quartz: from Mining geodes."
const matSourceLine = (fam, t = 1) => {
  const fm = typeof CRAFT_FAMILY === 'object' ? CRAFT_FAMILY[fam] : null; if (!fm || fm.src !== 'gather') return '';
  const pl = matPlace(fam, t), nm = costName(fam, t);
  return pl.opens ? `${nm}: from ${SKILL[pl.skill]}, which opens at ${pl.opens}.` : `${nm}: from ${fm.from.replace(/ only\.$/, '.')}`;
};
const weaponShort = () => needShort(weaponMats());
// every short material of the first weapon has a place open now (essence and gold count as open)
const weaponPlacesOpen = () => weaponShort().every(m => matPlace(m.fam, m.t).open);
// the first weapon is made at the Workbench (a bow or staff): its steps come right after the tool, not after the Forge
const weaponAtBench = () => weaponStation() === 'bench';
const weaponNow = () => coldH() && !!weaponKind() && !weaponMade() && !wearPiece('weapon') && campLv(weaponStation()) >= 1
  && (weaponAtBench() ? stepDone('tool') && weaponPlacesOpen() : stepDone('forge') && !stepDone('store'));
// Worn, not owned (Cal's play note 13): a weapon in the bag does nothing, so it is not "made" until it is on.
const weaponMade = () => { try { return !!equipped('weapon'); } catch (e) { return false; } };
const TOOL_POS = ['pick', 'axe', 'sickle', 'spear'];
// A bag piece the hero could put on now in a position that is empty (kind 'tool': a pickaxe, woodaxe, sickle or spear; 'weapon': the weapon). -> { it, pos } | null
const wearPiece = kind => {
  try {
    for (const pos of kind === 'tool' ? TOOL_POS : ['weapon']) {
      if (equipped(pos)) continue;
      const it = S.items.find(i => CRAFT_KINDS[i.slot] && kindPos(i.slot) === pos && fits(i, pos, 'hero'));
      if (it) return { it, pos };
    }
  } catch (e) {}
  return null;
};
// the points are spent, or a beat after the first one with some left (staged-guide-followups: it waited 20 s, a long silence while the next fight
// started behind the menu; his line already says "when you're done here", so the rest can still be spent under it): time to point back at the fight
const BACK_WAIT = 1;   // seconds of play after the first point
const backReady = () => { try { const k = soloHero(); if (obAttrOn() && k && attrPoints(k).free > 0) return GUIDE_RT.lastEnd !== null && GUIDE_RT.t - GUIDE_RT.lastEnd >= BACK_WAIT; } catch (e) {} return true; };
const spendPile = () => obAttrOn() && attrPoints(soloHero()).free >= 2 * HERO_TUNE.perLevel;
const spendTail = () => GUIDE_RT.latch === 'spend' && S.tab === 'party' && fightingNow();
// answered: the latch is runtime only, so the save keeps a mark beside the step marks (as `use:` lines do) once the pile is spent with the line
// up, and a reload before the menu closes cannot bring the line back
const spendAnswered = () => { if (GUIDE_RT.latch === 'spend' && !spendPile()) O().done['spend:spent'] = 1; return !!O().done['spend:spent']; };
const toolWorn = () => { try { return TOOL_POS.some(pos => !!equipped(pos)); } catch (e) { return false; } };
// W1-D (playtest-2 P0): a combat step pauses the game only while what it asks for can happen right now, so the pause can
// never freeze the clock the step needs (a respawn, a heavy hit landing, a cooldown running out). `pauseWhen`: the
// extra condition for the pause. Attack and the ability need a live foe; Dodge and Parry need a wind-up still on its
// way, and the guide's press ignores a cooldown left by an earlier press (59j: `forgive`), so a paused game never waits on one.
const liveFoe = () => { try { return combatFoes().some(f => f && !f.dead && f.hp > 0 && !f.gone); } catch (e) { return false; } };
// Turn fights (59k): Attack and the ability wait for your turn; Dodge and Parry pause inside their window, so the
// paused press lands. In a legacy fight the old conditions stand.
const turnSnap = () => { try { return typeof turnCombatOn === 'function' && turnCombatOn() ? turnCombatSnapshot() : null; } catch (e) { return null; } };
const heroTurnNow = () => { const q = turnSnap(); return !q || q.phase === 'hero'; };
// (a hit you already dodged or parried is not a new lesson: the next step waits for the next hit)
const hitComing = () => { const q = turnSnap(); return q ? q.canDefend && q.closesAt > q.now : heavyShowing(); };
const inWindow = k => { const q = turnSnap(); if (!q) return heavyShowing(); const open = k === 'parry' ? q.parryOpensAt : q.dodgeOpensAt; return q.canDefend && q.now >= open && q.closesAt - q.now > 0.02; };
// guide-voice: every step names the phases it may START in (`ph`), and a step whose phase is not now waits. 'hero' your turn,
// 'windup' a hit is on its way (the Dodge and Parry window), 'foe' the foe acts with nothing to answer, 'between' no fight in view
// (not fighting, no foe alive, or a menu open). Once a 'between' step has started it stays up until done or retired.
const GUIDE_PHASES = ['hero', 'windup', 'foe', 'between'];
let guideMenuCovers = () => true;   // 75-onboard-ui.js: a wide screen keeps the fight in view beside an open menu
let guideLineOk = () => true;       // 75-onboard-ui.js: a guide line can show now (the page is visible, no card or sheet over it)
function guidePhase(seeThroughMenu) { return !fightingNow() || !liveFoe() || (!seeThroughMenu && !!S.tab && S.tab !== 'adv') ? 'between' : hitComing() ? 'windup' : heroTurnNow() ? 'hero' : 'foe'; }
// A fight is one foe on the field (59k `fightStart`; the legacy fight: a pack). Runtime only, never saved.
const GUIDE_RT = { t: 0, fight: 0, doneIn: {}, lastEnd: null, latch: '', shown: {}, hid: {} };
// reload-keeps-tips: tips whose job is still undone (a piece in the bag, the cold fire). × or the 60 s retire hides one for this session only
// (GUIDE_RT.hid, no done mark), so a reload brings it back once; its own done rule (the piece worn, the hero gathering) still ends it for good.
const GUIDE_SESSION = ['wear:weapon', 'wear:tool', 'gather'];
const GUIDE_QUIET = 60;    // seconds of play between two unprompted lines outside fights, and before a live tip retires
// cal-0107-staged-guide (Cal's play notes 3 and 12): the fight lessons. In a turn fight each press is taught the first time it comes up, with
// the fight held: Attack on your first turn, Dodge on the foe's first swing, the ability on your next turn, Parry on the next swing (or the
// next foe's first). Dodge and Parry show only once their window is open (inWindow), and guideLessonHold stops the foe's clock right there.
// The legacy real-time fight keeps its old steps with no fight-by-fight wait (Dodge may come before the ability there).
// A save at zone 8 or past never gets these lessons (a mid or late save whose marks predate them): they are marked done unseen.
// The boss tip may also start while the boss opens (its intro or its own turn), so it comes before the boss's first move.
const LESSON_IDS = ['attack', 'ability', 'dodge', 'parry'];
const turnLesson = () => { try { return typeof turnCombatOn === 'function' && !!turnCombatOn(); } catch (e) { return false; } };
const GUIDE_STEPS = [
  { id: 'attack', ph: ['hero'], pause: 1, pauseWhen: () => liveFoe() && heroTurnNow(), when: () => fightingNow() && heroTurnNow(), done: () => (O().atk || 0) >= 1 || S.totalKills >= 12 },
  { id: 'ability', ph: ['hero'], tip: 'Press your ability button when it is ready.', pause: 1, pauseWhen: () => liveFoe() && heroTurnNow(), when: () => stepDone('attack') && (stepDone('dodge') || !turnLesson()) && fightingNow() && heroTurnNow() && abilityOk(), done: () => O().casts >= 1 },
  { id: 'dodge', ph: ['windup'], pause: 1, pauseWhen: () => liveFoe() && inWindow('dodge'), when: () => stepDone('attack') && fightingNow() && hitComing() && (!turnLesson() || inWindow('dodge')), done: () => (O().dodges || 0) >= 1 },
  { id: 'parry', ph: ['windup'], pause: 1, pauseWhen: () => liveFoe() && inWindow('parry'), when: () => stepDone('dodge') && (!turnLesson() || stepDone('ability') && inWindow('parry')) && fightingNow() && hitComing(), done: () => (O().parries || 0) >= 1 },
  { id: 'boss', ph: ['hero', 'foe'], pause: 1, ok: 1, when: () => S.maxZone === 1 && S.zone === 1 && typeof fightBoss !== 'undefined' && !!fightBoss, done: () => S.maxZone >= 2 },
  // W2-A: Train Attack on the Hero tab (it opens with the step: the tab is unlocked by then, the first level-up or zone 2)
  { id: 'upgrade', ph: ['between'], tip: 'You can grow stronger now. Open Hero.', pause: 1, when: () => stepDone('ability') && isUnlocked('party') && S.gold >= cheapestUp(), done: () => upBought() },
  // spend-points-before-nextup: two levels' points or more piled up before Next Up opens (it ranks them once it does). Once a game: the
  // latch is set when the line shows, and a spend under two levels' worth with it up is kept in the save ('spend:spent'); × ends it too,
  // and Next Up opening ends it unseen. Spent with the Hero menu still over the fight, it says what `back` says (Cal's play note 7;
  // `back` was done long before) until the menu closes.
  { id: 'spend', ph: ['between'], pause: 1, tip: 'Open Hero, then Build, and spend your attribute points.', when: () => stepDone('upgrade') && !isUnlocked('nextup') && (spendPile() || spendTail()),
    done: () => isUnlocked('nextup') || (spendAnswered() && !spendTail()) },
  // Cal's play note 7: after the points are spent, say how to get back to the fight (the Hero menu otherwise just sits there)
  { id: 'back', ph: ['between'], pause: 1, tip: 'Close the menu and get back to the fight.', when: () => stepDone('upgrade') && S.tab === 'party' && fightingNow() && backReady(), done: () => stepDone('upgrade') && !S.tab },
  // Cal's play notes 9 and 13: a weapon found or made sits in the bag until it is worn. The tip names it and wears it in one tap.
  { id: 'wear:weapon', ph: ['between'], pause: 1, tip: 'Your new weapon is in your bag. Put it on.', when: () => coldH() && !!wearPiece('weapon'), done: () => weaponMade() },
  { id: 'gather', ph: ['between'], tip: 'Press Gather and chop Pine Log for a camp fire.', pause: 1, when: () => S.maxZone >= 2 && isUnlocked('gather') && unlit() && S.activity !== 'gather', done: () => !unlit() || S.activity === 'gather' || oak8() },
  { id: 'chop', ph: ['between'], needs: fireMats, when: () => unlit() && S.activity === 'gather', done: () => !unlit() || oak8() },
  { id: 'light', ph: ['between'], pause: 1, when: () => unlit() && oak8(), done: () => !unlit() },
  { id: 'stock:bench', ph: ['between'], needs: () => matsOfBuild('bench'), when: () => coldH() && plotOpen('bench') && !!needShort(matsOfBuild('bench')).length, done: () => !coldH() || campBusy('bench') },
  // forge-tip-goes-stale: a press step (bench, tool, weapon, forge, store) waits for its materials in hand, so × on its stock: line never swaps in an
  // "Open Camp." or "Open Craft." that follows you around while you are still short
  { id: 'bench', ph: ['between'], pause: 1, pauseUnless: () => matsOfBuild('bench'), when: () => coldH() && plotOpen('bench') && !needShort(matsOfBuild('bench')).length, done: () => !coldH() || campBusy('bench') },
  { id: 'stock:tool', ph: ['between'], needs: toolMats, when: () => coldH() && campLv('bench') >= 1 && !!needShort(toolMats()).length, done: () => !coldH() || toolMade() },
  // only once Craft is unlocked: this step pauses the game, and the unlock pass runs on the game clock, so a pause that
  // came first held Craft locked for good (the Craft tab opened on Uniques only, with no Make view to point at)
  { id: 'tool', ph: ['between'], pause: 1, pauseUnless: toolMats, when: () => coldH() && campLv('bench') >= 1 && isUnlocked('craft') && !needShort(toolMats()).length, done: () => !coldH() || toolMade() },
  { id: 'wear:tool', ph: ['between'], pause: 1, tip: 'Put on the tool you made. It only works when you wear it.', when: () => coldH() && stepDone('tool') && !!wearPiece('tool'), done: () => !coldH() || (stepDone('tool') && toolWorn()) },
  // first-gold-and-camp-strip, gear-in-first-25: the first weapon. A Workbench weapon (bow, staff) comes right after the tool, once every
  // short material has a place open (weaponNow); until then the Forge steps show. Tobin's Forge weapon waits for the Forge step, as before.
  { id: 'stock:weapon', ph: ['between'], needs: weaponMats, when: () => weaponNow() && !!needShort(weaponMats()).length, done: () => !coldH() || weaponMade() || (!weaponAtBench() && stepDone('store')) },
  { id: 'weapon', ph: ['between'], pause: 1, pauseUnless: weaponMats, when: () => weaponNow() && isUnlocked('craft') && !needShort(weaponMats()).length, done: () => !coldH() || weaponMade() || (!weaponAtBench() && stepDone('store')) },
  { id: 'stock:forge', ph: ['between'], needs: () => matsOfBuild('forge'), when: () => coldH() && stepDone('tool') && plotOpen('forge') && !!needShort(matsOfBuild('forge')).length, done: () => !coldH() || campBusy('forge') },
  { id: 'forge', ph: ['between'], pause: 1, pauseUnless: () => matsOfBuild('forge'), when: () => coldH() && stepDone('tool') && plotOpen('forge') && !needShort(matsOfBuild('forge')).length, done: () => !coldH() || campBusy('forge') },
  { id: 'stock:store', ph: ['between'], needs: () => matsOfBuild('store'), when: () => coldH() && plotOpen('store') && !!needShort(matsOfBuild('store')).length, done: () => !coldH() || !(typeof CAMP_B === 'object' && CAMP_B.store) || campBusy('store') },
  { id: 'store', ph: ['between'], pause: 1, pauseUnless: () => matsOfBuild('store'), when: () => coldH() && plotOpen('store') && !needShort(matsOfBuild('store')).length, done: () => !coldH() || !(typeof CAMP_B === 'object' && CAMP_B.store) || campBusy('store') },
  { id: 'tab:party', ph: ['between'], quiet: 1, tip: 'The Hero tab holds your level, build and abilities.', when: () => isUnlocked('party') && S.maxZone >= 3 && !unlit() && !fightingNow(), done: () => !!O().seen.party },
  // a Got it note: it never pauses and never blocks (audit-1 3.8); the Next Up chip or Got it ends it
  { id: 'nextup', ph: ['between'], quiet: 1, ok: 1, tip: 'Next Up shows the one thing most worth doing now.', when: () => isUnlocked('nextup') && stepDone('upgrade') && S.maxZone >= 3, done: () => false }
];
const toolMade = () => S.items.some(it => CRAFT_KINDS[it.slot] && CRAFT_KINDS[it.slot].tool);

const O = () => S.onboard || (S.onboard = {});
const stepDone = id => !!O().done[id];
// Materials still short: [[fam, tier, n]] -> [{ fam, t, kind, have, n, name }]. kind: the gather node that yields it.
const matHave = (f, t) => f === 'gold' ? Math.floor(S.gold) : matOwn(f, t);
function needShort(mats) {
  const out = [];
  for (const [fam, t, n] of mats || []) {
    const have = matHave(fam, t);
    if (have < n) out.push({ fam, t, kind: typeof NODE_NAMES === 'object' && NODE_NAMES[fam] && craftNodeVisible(fam, t) ? fam : null, have, n, name: fam === 'gold' ? 'gold' : costName(fam, t) });
  }
  return out;
}
// The guide teaches Training's Attack: the first level's price, and whether any move has been trained.
// hero-progression-rework: with attributes on (HERO_TUNE.training = 0) the step is the first attribute point: it fires when the
// playing hero has one free (cheapestUp is 0 then, so `gold >= cheapestUp()` reads "a point to spend"; Infinity: none) and it is
// done when any hero has spent one (attrSpentAny).
const obAttrOn = () => typeof attrOn === 'function' && attrOn();
const cheapestUp = () => {
  if (obAttrOn()) return typeof attrPoints === 'function' && soloHero() && attrPoints(soloHero()).free > 0 ? 0 : Infinity;
  const p = typeof trainPlan === 'function' && soloHero() ? trainPlan('atk', '1') : null; return p && p.n > 0 ? p.cost : Infinity;
};
const upBought = () => obAttrOn() ? attrSpentAny() : !!(S.solo && S.solo.tr && Object.values(S.solo.tr).some(r => r && Object.values(r).some(v => v > 0)));
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
  registerState('onboard', { v: 1, all: false, got: {}, done: {}, seen: {}, tips: true, t: 0, taps: 0, casts: 0, atk: 0, dodges: 0, parries: 0, sayQ: [] });

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
    // (got is the clock rounded, so it can lie up to 0.5 s ahead of t: allow 1 s, or a row opened while the guide holds the clock skips the gap)
    const out = [], last = Math.max(-Infinity, ...Object.values(O().got).filter(v => typeof v === 'number' && Number.isFinite(v) && v <= O().t + 1));
    const gap = ONBOARD_TUNE.gap; let wait = gap > 0 && !O().all && O().t - last < gap;   // the spacing governor (ONBOARD_TUNE); O().t stops once all is set
    for (const f of FEATURES) {
      if (O().all && !f.late) continue;
      if (O().got[f.id] != null) continue;
      let ok = false; try { ok = !!f.when() && (!wait || (!!f.now && !!f.now())); } catch (e) {}
      if (ok && unlock(f.id)) { out.push(f.id); wait = gap > 0; }
    }
    if (!O().all && FEATURES.every(f => f.late || O().got[f.id] != null)) O().all = true;
    return out;
  };

  // ---- the guide ----
  onboardTips = on => { O().tips = on === undefined ? !O().tips : !!on; return O().tips; };
  const stepById = id => GUIDE_STEPS.find(s => s.id === id) || null;
  // forge-line-while-fighting: the step is still due (tips on, not done, not hidden this session, its when() true), whatever the fight's phase
  onboardWants = id => { const s = stepById(id); if (!s || !O().tips || O().done[id] || GUIDE_RT.hid[id]) return false; try { return !s.done() && !!s.when(); } catch (e) { return false; } };
  onboardNeed = id => { const s = stepById(id), f = s && (s.needs || s.pauseUnless); try { return f ? needShort(f()) : []; } catch (e) { return []; } };
  // The pause guard: a step that waits for the player pauses the game, but never while it is also short of
  // the materials the action costs (the player could not press it and the clock they need would be stopped).
  // cal-0107-staged-guide: in a fight only the held lessons pause (a between step's line is hidden there; a camp or menu tip never freezes a fight).
  onboardPaused = step => {
    if (!(step && step.pause && !onboardNeed(step.id).length)) return false;
    let p = true; try { p = !step.pauseWhen || !!step.pauseWhen(); } catch (e) {}
    if (!p || guidePhase() === 'between') return p;
    return !(step.ph || []).includes('between');
  };
  // done 1: the player did it. done 2: the tip waited 60 s unanswered and retired to the Journal's Tips.
  onboardDone = (id, how) => { if (!O().done[id]) { O().done[id] = how || 1; emit('onboardStep', { id }); } };
  const guideOver = () => GUIDE_STEPS.every(s => O().done[s.id]);
  // reload-keeps-tips: at boot, a wear tip closed for good by an older build (× or the retire left a done mark) while the piece still sits in
  // the bag with its slot empty can show once more
  let wearBooted = false;
  const wearBoot = () => {
    if (wearBooted) return; wearBooted = true;
    try { if (coldH()) for (const k of ['weapon', 'tool']) if (O().done['wear:' + k] && wearPiece(k) && !(k === 'tool' && toolWorn())) delete O().done['wear:' + k]; } catch (e) {}
  };
  onboardStep = () => {
    wearBoot();
    if (!O().tips) return null;
    for (const s of GUIDE_STEPS) {
      if (O().done[s.id]) continue;
      if (S.maxZone >= 8 && LESSON_IDS.includes(s.id)) { onboardDone(s.id); continue; }
      let d = false; try { d = !!s.done(); } catch (e) {}
      if (d) { onboardDone(s.id); continue; }
      if (GUIDE_RT.hid[s.id]) continue;   // hidden this session: the steps after it can show
      let w = false; try { w = !!s.when(); } catch (e) {}
      if (!w) continue;
      const R = GUIDE_RT, held = R.latch === s.id;
      // not its phase: it waits. A wide screen still shows the fight beside a menu, so there a step starts only in the phase the fight is really in
      // (staged-guide-followups: a between step started mid-fight beside a landscape menu and froze it)
      if (!held && !s.ph.includes(guidePhase(!guideMenuCovers()))) continue;
      if (held && guidePhase() !== 'between') continue;   // cal-0107-staged-guide: a between line started earlier hides while a foe is on the field, and comes back after
      if (!held && s.quiet && R.lastEnd !== null && R.t - R.lastEnd < GUIDE_QUIET) continue;   // one unprompted line a minute
      if (s.ph.includes('between')) R.latch = s.id;
      return s;
    }
    return null;
  };

  // ---- first-use lines (FIRST_USE) ----
  // A hint line shows only to a player who just got the system (2 hours of play, as the "new" mark), on a view of its own (the view's `feature`, or
  // the FEATURES tab and view), and while tips are on. Once read it is kept as S.onboard.done['use:<id>'] (the same map as the guide steps, no new field).
  onboardUse = ctx => {
    if (!O().tips || !ctx || !ctx.tab) return null;
    for (const f of FEATURES) {
      const u = FIRST_USE[f.id], got = O().got[f.id];
      if (!u || u.via || !f.tab || got == null || O().done['use:' + f.id] || O().t - got >= FIRST_USE_FOR) continue;
      if (ctx.feature === f.id || (f.tab === ctx.tab && f.view === ctx.view)) return { id: 'use:' + f.id, text: u.text };
    }
    return null;
  };
  onboardUseDone = id => { O().done[id] = 1; };
  onboardJoined = id => { if (!unlock('switch', true) && !O().all) O().got['join:' + id] = Math.round(O().t); };

  // ---- Next Up: hide goals whose system is still hidden (only while ONBOARD.gate is on) ----
  const GOAL_FEATURE = { bounty: 'bounties', bestiary: 'bestiary', skill: 'gather', forge: 'craft', camp: 'camp', 'camp-look': 'camp', codex: 'codex', deep: 'deep' };
  onboardGoalOk = g => isUnlocked(GOAL_FEATURE[g.sys] || null);

  // ---- counters and the clock ----
  // A cold save's chops (taps on the tree) do not count toward "tap a foe".
  on('tap', e => { if (e && e.node && coldH()) return; if (!O().all || !guideOver()) O().taps++; });
  on('ability', e => { if (!e || !e.auto) O().casts++; });
  // SOLO1: the buttons
  on('soloAttack', () => { O().atk = (O().atk || 0) + 1; });
  on('soloDodge', e => { if (e && (e.res === 'dodge' || e.res === 'perfect')) O().dodges = (O().dodges || 0) + 1; });
  on('soloParry', e => { if (e && e.res === 'parry') O().parries = (O().parries || 0) + 1; });
  // guide-voice runtime: which fight this is, and where each step ended
  on('fightStart', () => { GUIDE_RT.fight++; lessonLast = -1; });
  on('packSpawn', () => { if (!(typeof turnCombatOn === 'function' && turnCombatOn())) GUIDE_RT.fight++; });
  // cal-0107-staged-guide: the Hero tab opens on the first level-up itself, in the gap that kill made, not up to a second later in the next fight
  on('levelup', e => { if (e && !e.quiet && !O().all) onboardCheck(); });
  on('onboardStep', e => { if (!e) return; GUIDE_RT.doneIn[e.id] = GUIDE_RT.fight; GUIDE_RT.lastEnd = GUIDE_RT.t; if (GUIDE_RT.latch === e.id) GUIDE_RT.latch = ''; });
  // A live tip nobody answers for 60 s of play retires: it stops showing and waits in the Journal's Tips.
  guideRetire = id => { const s = stepById(id); if (!s || O().done[id]) return false; if (!guideHide(id)) onboardDone(id, 2); return true; };
  // reload-keeps-tips: × or the retire on a GUIDE_SESSION tip. It ends the step as a done one would for spacing (latch, lastEnd: the
  // one-line-a-minute gap and backReady see it end), with no done mark and no onboardStep event. -> false for any other step.
  guideHide = id => {
    if (!GUIDE_SESSION.includes(id) || O().done[id]) return false;
    const R = GUIDE_RT; R.hid[id] = 1; R.doneIn[id] = R.fight; R.lastEnd = R.t; if (R.latch === id) R.latch = '';
    return true;
  };
  // ---- the staged lesson hold (cal-0107-staged-guide) ----
  // Decided every frame in core, not on the UI's 250 ms poll (the Parry window is 0.18 s): on the frame the foe's clock crosses the
  // window's opening for the Dodge or Parry lesson, the clock is set back to that opening (plus a hair, so the frozen press is inside
  // the window) and ONBOARD.paused stops the next ticks. The UI shows the line and the press clears the hold (75-onboard-ui).
  // A hold starts only on that crossing frame, so a line the UI cannot show (an overlay, a covering menu) never freezes the fight for good.
  const LESSON_OPEN = { dodge: 'dodgeOpensAt', parry: 'parryOpensAt' }, LESSON_IN = 0.001;
  guideLessonHold = () => {
    let m = null; try { m = TURN_LIVE && !TURN_LIVE.ended && turnCombatOn() ? TURN_LIVE : null; } catch (e) {}
    const last = lessonLast; lessonLast = m ? m.now : -1;
    if (!ONBOARD.lessons || !m || m.phase !== 'foeWindup' || !O().tips || (O().done.dodge && O().done.parry)) return '';
    const q = turnSnap(); if (!q || !q.canDefend || q.feint) return '';
    let ok = false; try { ok = guideLineOk() && guidePhase(!guideMenuCovers()) === 'windup'; } catch (e) {}
    if (!ok) return '';
    let s = null; try { s = onboardStep(); } catch (e) {}
    const k = s && LESSON_OPEN[s.id] ? s.id : '', open = k ? q[LESSON_OPEN[k]] : 0;
    if (!k || !(last < open && q.now >= open)) return '';
    if (q.now > open + LESSON_IN) m.now = lessonLast = open + LESSON_IN;
    ONBOARD.paused = true;
    emit('guideHold', { id: k, at: open });
    return k;
  };
  onTick(() => { guideLessonHold(); });
  let acc = 0;
  let lateAcc = 0;
  const lateOpen = () => FEATURES.every(f => !f.late || O().got[f.id] != null);
  onTick(dt => {
    GUIDE_RT.t += dt;
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
