// 57d-deepwell: the Deepwell (docs/design/deepwell.md). Runs down an old well, floor by floor,
// on today's single-foe combat. Oil is the run's health; a boon draft after every fight floor;
// Depth Marks buy Deepwell-only upgrades, cosmetics, titles and Lore pages; a weekly Trial.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Rules this file keeps:
//  - Main progress is never touched by a run. Arena kills emit 'deepKill', never 'kill' (no gold,
//    XP, drops or counters). Boons, sets and Deep Lore work only while a run is live (deepActive()).
//  - While a run is live S.activity is set to 'fight' (target() must be 'mob' for the arena) and the
//    player's own activity is kept in run.act. It is put back when the run ends or pauses, and for
//    the length of any away phase. The seconds spent below are credited with awayGains(secs) when
//    the player climbs out (or on the next load), so the farm keeps its away rate while below.
//  - A run survives reloads: on load it is paused (the normal game plays on) and the Resume button
//    restarts the floor with the Oil it had when the floor began.
//  - Depth Marks buy only things in DEEP_SHOP: Deep Lore (works below only, off in the Trial),
//    cosmetics (stored; shown by the Codex Wardrobe), titles (through the Codex) and Lore pages.
//
// Combat hook (50-sim.js): the global `arena` is set to DEEP_ARENA while a run is live and not
//   paused: { spawn() -> mob | null, onKill(mob, overkill) }. Stage C (party combat) can replace
//   DEEP_ARENA.spawn with packs and read run HP from the same run object; [C] boons are in the data
//   and join the pool when deepStageC() is true.
// Party hooks (55-party.js reads them): bonus('tune:<knob>') for embersMax, guardMax, markT,
//   blessMax, mark, emberPerTap, guard, blessT, volleyHits, charges, keepEmbers, hymnFloor;
//   mod('abilityCd'). All are 0 / 1 outside a live run.
//
// Exposed names:
//   data  DEEP_TUNE, DEEP_BOONS, DEEP_BOON_IDS, DEEP_SETS, DEEP_RULES, DEEP_SHOP, DEEP_PAGES
//   read  deepUnlocked(), deepActive(), deepStageC(), DW (API below)
//   DW    run() -> run | null, live(), unlockInfo() -> { open, zone, hearth, need }
//         floorKind(f, run?), oilMax(run?), oil(), drainRate(), refundFor(kind), marksNow(),
//         offerView() -> { title, kind, cards: [card], rr, ban, skipOil, landing }, card(id),
//         owned() -> [card], setProgress() -> [{ id, n, have, on }], trialRule(week?), trialInfo(),
//         shop(cat) -> [row], nextLore() -> row | null
//   act   start(trial) -> bool, resume() -> bool, pick(id), reroll(), banish(id), skip(),
//         landing(choice), climbOut(), abandon(), buy(id) -> bool, setFav(id), equip(slot, id),
//         fall() (a party wipe ends the run; 59c-deepwell-combat.js calls it)
// Party combat rules below (packs, HP carried, wipes, Elder telegraphs, the [C] boons, the Guard and
//   Mend sets, the Deep Edge Lore) live in 59c-deepwell-combat.js.
// Events: deepStart { trial }, deepFloorStart { floor, kind }, deepKill { mob, floor },
//   deepFloor { floor, kind, trial, refund } (the Almanac counts it), deepOffer { kind },
//   deepPick { id, rank }, deepOil { oil } (Oil ran low: under 15s, once a floor),
//   deepEnd { summary, away }, deepBuy { id }, deepTip { i, txt }.
// Save: registerState('deep', ...) below (spec 10) plus: floors (lifetime floors cleared),
//   tips (first-run tips shown), fav (Favourite boon), eq { lantern, trail } (cosmetics in use),
//   last (the last run's summary, for the run-end card).

const DEEP_TUNE = {
  unlockZone: 20, hearth: 3,
  // Foe HP on floor f = par x growth^(start + step x (f - 1)). par: a foe your party kills in parKill
  // seconds at the run's start (the boss-ready pace), so every account meets the same curve.
  parKill: 3.75, step: 0.7, stepSteep: 0.85, start: -6, growth: 1.45,   // step: zones per floor (spec 0.45; tuned, see report)
  hpMul: { normal: 1, elite: 3, boss: 8 },
  oilStart: 60, oilMax: 120, oilPockets: 150, oilLow: 15,
  refund: { normal: 15, elite: 22, boss: 35 }, skipOil: 8, landingOil: 25,
  rarityW: { c: 65, r: 28, e: 7 }, rarityStep: { c: -5, r: 3, e: 2 }, classW: 1.5,
  offers: 3, rerolls: 1,
  marks: f => f <= 10 ? 1 : f <= 25 ? 2 : 3, bossMarks: 5, pbMarks: 3,
  trialMiles: { 10: 20, 20: 30, 30: 40, 40: 50 }, sealFloor: 15
};

// ---------------- boons (spec 3.3) ----------------
// r: c | r | e. sets: set ids. max: ranks. cls: a class key, 'any' (needs a class) or null.
// c: Stage C only. v: per-rank value used by the wiring below. txt(rank) -> effect text.
const DEEP_SETS = {
  flame: { n: 'Flame', fx: 'Bonfire: +20% damage' },
  oil: { n: 'Oil', fx: 'Deep Breath: no Oil drain for the first 4s of each floor' },
  crit: { n: 'Crit', fx: 'Starburst: crits strike again for 30%' },
  tap: { n: 'Attack', fx: 'Drumbeat: every 25th Attack press hits for 15x your attack' },
  company: { n: 'Vigour', fx: 'Second Wind: you deal +2% damage per floor cleared (max +60%)' },
  path: { n: 'Path', fx: 'True Path: your class ability cooldown halves' },
  guard: { n: 'Guard', fx: 'Iron Line: you take 25% less damage', c: true },
  dance: { n: 'The Dance', fx: 'Each perfect dodge also gives 2s of Oil', c: true },   // S6-F (combat-2 6.1)
  mend: { n: 'Mend', fx: 'Deep Mercy: all healing +30%', c: true }
};
const DEEP_BOONS = {};
const DEEP_BOON_IDS = [];
{
  const pc = v => Math.round(v * 100) + '%';
  const B = (id, n, r, sets, max, cls, v, txt, c) => { DEEP_BOONS[id] = { id, n, r, sets, max, cls, v, txt, c: !!c }; DEEP_BOON_IDS.push(id); };
  // Common
  B('whet', 'Whetstone', 'c', ['flame'], 3, null, 0.12, k => `+${pc(0.12 * k)} damage`);
  B('luck', 'Lucky Break', 'c', ['crit'], 3, null, 0.2, k => `Crits come ${pc(0.2 * k)} more often`);
  B('heavy', 'Heavy Hand', 'c', ['tap'], 3, null, 0.4, k => `Attack deals +${pc(0.4 * k)}`);
  B('warm', 'Warm Oil', 'c', ['oil'], 3, null, 15, k => `+15s Oil now. Clears refund +${2 * k}s`);
  B('steady', 'Steady Flame', 'c', ['oil'], 2, null, 0.1, k => `Oil drains ${pc(0.1 * k)} slower`);
  B('drill', 'Battle Drill', 'c', ['company'], 3, null, 0.15, k => `You deal +${pc(0.15 * k)}`);
  B('sharp', 'Sharp Eye', 'c', ['crit'], 3, null, 0.2, k => `Crit damage +${pc(0.2 * k)}`);
  B('first', 'First Strike', 'c', ['flame'], 1, null, 0.5, () => 'The first foe on each floor starts at half health');
  B('map', 'Bounty Map', 'c', [], 1, null, 1, () => '+1 Depth Mark for each floor from now on');
  B('study', 'Quick Study', 'c', [], 1, null, 1, () => '+1 reroll now');
  B('kindle', 'Kindling', 'c', ['path'], 2, 'lanternmage', 2, k => `You can stack ${2 * k} more Embers`);
  B('shield', 'Shield Drill', 'c', ['path'], 2, 'warden', 2, k => `You can hold ${2 * k} more Grit`);
  B('fletch', 'Fletching', 'c', ['path'], 2, 'ranger', 4, k => `Focus lasts ${4 * k}s longer`);
  B('psalm', 'Psalm', 'c', ['path'], 2, 'lightkeeper', 1, k => `You can stack ${k} more Blessing${k > 1 ? 's' : ''}`);
  // Rare
  B('heart', 'Ember Heart', 'r', ['flame'], 1, null, 0.08, () => 'Every 3 floors you clear from now: +8% damage for the rest of the run');
  B('flow', 'Overflow', 'r', ['flame'], 1, null, 1, () => 'Extra damage from a kill carries to the next foe on the floor');
  B('exec', 'Executioner', 'r', ['crit'], 1, null, 0.15, () => 'Foes below 15% health die at once');
  B('sconce', 'Oil Sconce', 'r', ['oil'], 2, null, 15, k => `Boss floors refund ${15 * k}s more Oil`);
  B('twin', 'Twin Flame', 'r', ['path'], 2, 'any', 0.15, k => `Your ability cooldown is ${pc(0.15 * k)} shorter`);
  B('rhythm', 'Attack Rhythm', 'r', ['tap'], 1, null, 0.05, () => 'Quick Attack presses build a combo: +5% Attack damage per step, up to +60%');
  B('cascade', 'Crit Cascade', 'r', ['crit', 'oil'], 1, null, 0.2, () => 'Each crit gives back 0.2s of Oil (up to 3s a floor)');
  B('glass', 'Cracked Lantern', 'r', ['flame'], 1, null, 0.45, () => '+45% damage, but clears refund 4s less Oil');
  B('ration', 'Field Rations', 'r', ['company'], 2, null, 0.25, k => `You deal +${pc(0.25 * k)} on elite and boss floors`);
  B('focus', "Hunter's Focus", 'r', ['path'], 1, 'ranger', 0.25, () => 'Focused foes take +50% from everyone (was +25%)');
  B('double', 'Double Ember', 'r', ['path'], 1, 'lanternmage', 1, () => 'Each Attack press plants 2 Embers');
  B('bulwark', 'Bulwark', 'r', ['path'], 1, 'warden', 0.02, () => 'Each Grit gives +5% damage (was +3%)');
  B('choir', 'Choir', 'r', ['path'], 1, 'lightkeeper', 4, () => 'Blessings last 10s (was 6s)');
  // Epic
  B('twice', 'Kindle Twice', 'e', ['path'], 1, 'lanternmage', 1, () => 'Once a floor, Lantern Flare leaves its Embers in place');
  B('wallnight', 'Wall of Night', 'e', ['path', 'oil'], 1, 'warden', 6, () => 'Shield Wall also stops the Oil drain for 6s');
  B('storm', 'Arrow Storm', 'e', ['path'], 1, 'ranger', 10, () => 'Volley fires 20 arrows (was 10)');
  B('hymn', 'Endless Hymn', 'e', ['path'], 1, 'lightkeeper', 1, () => 'Rally Hymn lasts until the floor is cleared');
  B('lheart', 'Lantern Heart', 'e', [], 1, 'any', 1, () => 'Your ability holds 2 charges');
  B('pact', 'Deep Pact', 'e', ['flame'], 1, null, 0.5, () => 'Damage x1.5, but your most Oil is halved');
  B('relight', 'Quick Relight', 'e', ['oil'], 1, null, 6, () => 'Floors cleared in under 6s refund double Oil');
  B('crown', 'Crown of the Deep', 'e', [], 1, null, 1, () => 'Each boss floor you clear gives a free Rare boon (pick 1 of 3)');
  B('mass', 'Critical Mass', 'e', ['crit'], 1, null, 0.5, () => 'Crits come 50% more often and deal +50%');
  B('warband', 'War Cry', 'e', ['company'], 1, null, 0.6, () => 'You deal +60%');
  // Stage C (party combat): in the data now, in the pool once deepStageC() is true
  B('thorn', 'Thorn Plate', 'r', ['guard'], 1, null, 0.3, () => 'You reflect 30% of the damage you take', 1);
  B('iron', 'Iron Wall', 'c', ['guard'], 3, null, 0.2, k => `You have +${pc(0.2 * k)} max health`, 1);
  B('taunt', 'Parry Drill', 'c', ['guard'], 1, null, 0.5, () => 'Your counters after a parry deal 50% more', 1);
  B('dward', 'Deep Ward', 'r', ['mend'], 1, null, 0.2, () => 'Overhealing becomes a shield, up to 20% max health', 1);
  B('mend', 'Mending Light', 'c', ['mend'], 2, null, 0.1, k => `You heal ${pc(0.1 * k)} max health per floor cleared`, 1);
  B('life', 'Lifeline', 'e', ['mend'], 1, null, 1, () => 'Once a floor, if you would go down you stay at 1 health', 1);
  B('wild', 'Wildfire', 'e', ['flame'], 1, null, 1, () => 'Burns and Embers jump to a new foe when their foe dies', 1);
  B('duel', 'Duelist', 'r', ['crit'], 1, null, 1, () => 'Your first hit on each foe always crits', 1);
  B('parry', 'Quick Parry', 'r', [], 1, null, 0.4, () => soloOn() ? 'The parry window is 0.15s longer' : 'The parry window is 0.4s longer', 1);
  // S6-F (combat-2 6.1): boons for active play (59g reads them), and one for idle drafts
  B('feet', 'Steady Feet', 'r', ['dance'], 1, null, 0.3, () => soloOn() ? 'The dodge window is 0.2s longer' : 'The dodge window is 0.3s longer; a perfect dodge 0.2s longer', 1);
  B('breaker', 'Breaker', 'r', ['dance'], 1, null, 0.3, () => 'You fill the stagger bar 30% faster', 1);
  B('coup', 'Coup de Grace', 'e', ['dance'], 1, null, 0.5, () => 'Finishers deal 50% more; the one that fires by itself hits at 80%', 1);
  B('silence', 'Silence', 'r', [], 1, null, 0.3, () => 'An ability that stops a cast gives back 30% of its cooldown', 1);
  B('lward', 'Lamplight Ward', 'c', [], 1, null, 0.3, () => 'A wind-up you do not answer deals 30% less', 1);
}

// ---------------- the weekly Trial's rules (spec 5) ----------------
const DEEP_RULES = [
  { id: 'glass', n: 'Glass Week', fx: 'Damage x2. Your most Oil is 60s' },
  { id: 'echo', n: 'Echo Week', fx: 'Abilities come back twice as fast. Attack hits for half' },
  { id: 'drum', n: 'Drum Week', fx: 'Attack hits x3. Everything else hits for half' },
  { id: 'rush', n: 'Boss Rush', fx: 'Every 3rd floor is a boss floor' },
  { id: 'rare', n: 'Rare Air', fx: 'Drafts show 2 boons, both Rare or better' },
  { id: 'drought', n: 'Drought', fx: 'Oil refunds halved. Start with 150s Oil' },
  { id: 'crit', n: 'Crit Week', fx: 'Crits come twice as often. Other hits deal half' },
  { id: 'wick', n: 'Short Wick', fx: 'No rerolls. Drafts show 4 boons' },
  { id: 'elder', n: 'Elder Hall', fx: 'An elite floor every other floor. Elite drafts hold an Epic' },
  { id: 'path', n: 'Pathfinder', fx: 'Class boons show up twice as often' },
  { id: 'steep', n: 'Steep Week', fx: 'Foes grow faster each floor. Marks x1.5' },
  { id: 'one', n: 'One of Each', fx: 'At most one boon from each set' }
];

// ---------------- the Depth Marks shop (spec 4.2) ----------------
// cat: lore (Deep Lore: works below only, off in the Trial) | look (cosmetics) | title | page.
// cost: one price or an array of prices by rank. kind (look): lantern | decor | trail.
const DEEP_SHOP = {};
{
  const S_ = (id, cat, n, cost, fx, o) => { DEEP_SHOP[id] = Object.assign({ id, cat, n, cost, fx }, o || {}); };
  S_('breath', 'lore', 'Deep Breath', [50, 100, 200, 350, 500], k => `+${10 * k}s starting Oil`);
  S_('wick', 'lore', 'Spare Wick', [80, 240, 600], k => `+${k} reroll${k > 1 ? 's' : ''} each run`);
  S_('banish', 'lore', 'Banish', [150, 450], k => `Banish ${k} offered boon${k > 1 ? 's' : ''} each run`);
  S_('wider', 'lore', 'Wider Choice', [800], () => 'Boss-floor drafts show 4 boons');
  S_('fav', 'lore', 'Favourite', [500, 1500], k => k > 1 ? 'Start each run with a Common or Rare boon you choose' : 'Start each run with a Common boon you choose');
  S_('stair', 'lore', 'Lantern Stair', [300, 900], k => `Start on floor ${1 + 5 * k}. Skipped floors pay their Marks, and you pick ${k} Common boon${k > 1 ? 's' : ''} first`);
  S_('pockets', 'lore', 'Deep Pockets', [600], () => 'Your most Oil is 150s');
  const lan = [['l_blue', 'Deep Blue', '#5FA8FF'], ['l_ghost', 'Ghost Green', '#8FF0B0'], ['l_ember', 'Ember Red', '#FF6A3D'], ['l_moon', 'Moon White', '#EFF3FF'], ['l_violet', 'Violet', '#B58CFF'], ['l_gold', 'Gold', '#F2C14E']];
  for (const [id, n, col] of lan) S_(id, 'look', n + ' lantern', 150, () => "Your hero's light on the stage", { kind: 'lantern', col });
  const dec = [['d_crystal', 'Deep Crystals', 200], ['d_moss', 'Glow Moss', 200], ['d_wlamp', 'Well Lanterns', 250], ['d_skull', "The Elder's Skull", 400], ['d_arch', 'Chain Arch', 300], ['d_brazier', 'Blue Brazier', 250], ['d_bridge', 'Rope Bridge', 300], ['d_bell', 'Drowned Bell', 350]];
  for (const [id, n, c] of dec) S_(id, 'look', n, c, () => 'Camp decoration', { kind: 'decor' });
  const tr = [['t_motes', 'Mote trail', '#9BE3F0'], ['t_embers', 'Ember trail', '#FF9E3D'], ['t_frost', 'Frost trail', '#DFF6FF']];
  for (const [id, n, col] of tr) S_(id, 'look', n, 600, () => 'A trail behind your hero on the stage', { kind: 'trail', col });
  const ti = [['dt_walker', 'Wellwalker', 100], ['dt_sipper', 'Oilsipper', 150], ['dt_diver', 'Deepdiver', 250], ['dt_lightless', 'the Lightless', 400], ['dt_keeper', 'Wellwarden', 500], ['dt_bottom', 'the Bottomless', 800, 50]];
  for (const [id, n, c, floor] of ti) S_(id, 'title', n, c, () => 'A title for your hero (pick it in the Codex)', { floor: floor || 0 });
  S_('pages', 'page', 'Deep Lore page', 100, k => `Page ${k} of 10`, { max: 10 });
}
// The Deepwell's own story, bought a page at a time (100 Marks each, in order).
const DEEP_PAGES = [
  ['The Rope', 'The first rope went down forty fathoms and came back dry. The second went down a hundred and came back warm.'],
  ['The Diggers', "Hollow's Rest was a mining camp before it was a village. The miners dug for silver and found a stair instead."],
  ['The Stair', 'The stair was cut by hands smaller than ours. Every step is worn in the middle, as if something climbed it for a thousand years.'],
  ['The First Lantern', 'The miners carried oil lamps. Below the ninth landing the flames turned blue, and the dark stopped moving away from them.'],
  ['The Quiet Landings', 'Every sixth landing is still. No foe comes there. Someone left benches, and a jar of oil, and a name scratched in the stone: Maud.'],
  ['Maud', 'Maud Tallow kept the camp lamps. When the miners stopped coming back up, she went down after them with the brightest lantern she had.'],
  ['The Elders', 'The Deep Elders are not beasts that wandered in. They are what the dark makes of things that stay below too long.'],
  ['What Glows', 'The light at the bottom is not fire. It is older than fire. It is what the dark is afraid of, and it is waiting.'],
  ["Maud's Lantern", "Deep down, a lantern hangs from a hook where no hook should be. It still burns. Its oil never runs out. The name on the handle is Maud's."],
  ['Why It Glows', 'Maud never came back up. She did not want to. She stayed to keep the light lit, so that the dark stays down there, and we stay up here.']
];

let deepUnlocked, deepActive, deepStageC, DW;
let DEEP_ARENA = null;

{
  registerState('deep', {
    v: 1,
    best: 0,
    marks: 0, marksTotal: 0,
    lore: {},
    cos: {},
    pages: 0,
    trial: { week: -1, best: 0, paid: {}, hist: {} },
    seen: {},
    runs: 0,
    run: null,
    floors: 0, tips: 0, fav: null, eq: { lantern: null, trail: null }, last: null
  });
  const D = () => S.deep;
  const R = () => D().run;
  const T = DEEP_TUNE;
  let inAway = false, initFor = null;

  // ---------------- small helpers ----------------
  const hash = (...xs) => { let h = 0x811C9DC5; for (const x of xs) { h ^= (x | 0); h = Math.imul(h, 0x01000193); h ^= h >>> 13; } return h >>> 0; };
  const rank = id => { const r = R(); return r && r.boons[id] ? r.boons[id] : 0; };
  const cls = () => S.party && S.party.cls ? S.party.cls : null;
  const hasCompanions = () => { const f = S.party && S.party.field; return Array.isArray(f) ? f.length > 0 : S.comp.some(n => n > 0); };
  const hearthLv = () => typeof campLevel === 'function' && S.camp ? campLevel('hearth') : null;
  deepStageC = () => typeof partyCombatOn === 'function' && !!partyCombatOn();

  deepUnlocked = () => {
    if (S.maxZone < T.unlockZone) return false;
    const h = hearthLv();
    return h === null || h >= T.hearth;
  };
  // Live: a run exists, is not paused, and we are not inside an away phase.
  deepActive = () => { const r = R(); return !!r && !r.paused && !inAway; };
  const fighting = () => { const r = R(); return deepActive() && r.phase === 'fight'; };
  const syncArena = () => { arena = deepActive() ? DEEP_ARENA : null; };

  // ---------------- rules of the current run ----------------
  const ruleOf = r => r && r.trial ? r.rule : null;
  const loreOf = (r, id) => r && r.trial ? 0 : (D().lore[id] || 0);
  function trialRule(week) {
    const w = week === undefined ? deviceWeek() : week;
    const cyc = Math.floor(w / 12), rr = rng(hash(cyc, 0x7E1A1));
    const order = DEEP_RULES.map((x, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rr() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    return DEEP_RULES[order[((w % 12) + 12) % 12]];
  }
  function floorKind(f, r) {
    r = r || R();
    const rule = ruleOf(r);
    if (rule === 'rush' ? f % 3 === 0 : f % 5 === 0) return 'boss';
    if (f % 6 === 0) return 'landing';
    if (rule === 'elder' ? f % 2 === 0 : f % 5 === 3) return 'elite';
    return 'normal';
  }
  function oilMax(r) {
    r = r || R();
    let m = loreOf(r, 'pockets') ? T.oilPockets : T.oilMax;
    const rule = ruleOf(r);
    if (rule === 'glass') m = 60;
    if (rule === 'drought') m = Math.max(m, 150);
    if (r && r.boons.pact) m *= 0.5;
    return m;
  }
  const setCount = (s, r) => { r = r || R(); if (!r) return 0; let n = 0; for (const id in r.boons) if (DEEP_BOONS[id] && DEEP_BOONS[id].sets.includes(s)) n++; return n; };
  const setOn = s => setCount(s) >= 3;
  function drainRate() {
    const r = R(); if (!r) return 0;
    let d = 1 - DEEP_BOONS.steady.v * rank('steady');
    if (!r.trial) d *= mod('oilDrain');
    return d;
  }
  function refundFor(kind, r) {
    r = r || R();
    let x = T.refund[kind] || 0;
    x += 2 * rank('warm');
    if (r.boons.glass) x -= 4;
    if (kind === 'boss') x += DEEP_BOONS.sconce.v * rank('sconce');
    if (r.boons.relight && r.ft < DEEP_BOONS.relight.v) x *= 2;
    x += bonus('deepRefund');   // 59c-deepwell-combat: +5s with party combat
    if (ruleOf(r) === 'drought') x *= 0.5;
    return Math.max(0, x);
  }
  // HP of a foe on floor f: a smooth curve anchored on your party's power when the run began.
  function foeHp(r, f, mul) {
    const step = ruleOf(r) === 'steep' ? T.stepSteep : T.step;
    return (r.par || mobHp(r.anchor)) * Math.pow(T.growth, T.start + step * (f - 1)) * mul;
  }
  const parHp = () => Math.max(mobHp(1), (heroDps() + compDps()) * T.parKill);
  function floorFoes(r, f) {
    const kind = floorKind(f, r), rr = rng(hash(r.seed, f, 0xF0E));
    const mk = (m, extra) => Object.assign({ ti: Math.floor(rr() * TYPES.length), mul: T.hpMul[m] * (0.9 + rr() * 0.2) }, extra);
    if (kind === 'boss') return [mk('boss', { boss: true })];
    if (kind === 'elite') return [mk('elite', { elite: true }), mk('normal')];
    if (kind === 'landing') return [];
    return [mk('normal'), mk('normal'), mk('normal')];
  }

  // ---------------- the draft ----------------
  function eligible(id, r, opts) {
    const b = DEEP_BOONS[id];
    if (b.c && !deepStageC()) return false;
    if ((r.boons[id] || 0) >= b.max) return false;
    if (r.banned.includes(id)) return false;
    if (b.cls === 'any' ? !cls() : b.cls && b.cls !== cls()) return false;
    if (b.sets.includes('company') && !soloOn() && !hasCompanions()) return false;
    if (opts && opts.rar && !opts.rar.includes(b.r)) return false;
    if (ruleOf(r) === 'one' && !r.boons[id] && b.sets.some(s => setCount(s, r) >= 1)) return false;
    return true;
  }
  function rarityW(f) {
    const k = Math.floor(f / 5), w = {};
    for (const x of ['c', 'r', 'e']) w[x] = Math.max(x === 'c' ? 15 : 1, T.rarityW[x] + T.rarityStep[x] * k);
    return w;
  }
  // kind: normal | elite | boss | crown | study | start | fav. Seeded: same state, same offer.
  function makeOffer(r, kind) {
    const rule = ruleOf(r);
    let n = T.offers, rar = null, need = null;
    if (kind === 'boss' && loreOf(r, 'wider')) n = 4;
    if (kind === 'boss' && r.actKill) { n = Math.max(n, 4); rar = ['r', 'e']; r.actKill = 0; }   // S6-F: a Deep Elder beaten with your own answers
    if (!r.trial) n += Math.max(0, Math.round(bonus('deepOffers')));
    if (rule === 'wick') n = 4;
    if (rule === 'rare') { n = 2; rar = ['r', 'e']; }
    if (kind === 'elite') need = rule === 'elder' ? 'e' : 'r';
    if (kind === 'boss') need = 'e';
    if (kind === 'crown' || kind === 'study') rar = kind === 'crown' ? ['r'] : ['r', 'e'];
    if (kind === 'start') { rar = ['c']; n = 3; }
    const rr = rng(hash(r.seed, r.floor, r.rrUsed + 1, ['normal', 'elite', 'boss', 'crown', 'study', 'start'].indexOf(kind) + 1, r.picks));
    const w = rarityW(r.floor), cw = rule === 'path' ? T.classW * 2 : T.classW;
    const weight = id => { const b = DEEP_BOONS[id]; return w[b.r] * (b.cls ? cw : 1); };
    let pool = DEEP_BOON_IDS.filter(id => eligible(id, r, { rar }));
    const out = [];
    const draw = list => {
      let tot = 0; for (const id of list) tot += weight(id);
      let x = rr() * tot;
      for (const id of list) { x -= weight(id); if (x <= 0) return id; }
      return list[list.length - 1];
    };
    while (out.length < n && pool.length) { const id = draw(pool); out.push(id); pool = pool.filter(x => x !== id); }
    // Guarantees: elite drafts hold a Rare or better, boss drafts an Epic (when any is left).
    if (need && out.length) {
      const ok = need === 'e' ? ['e'] : ['r', 'e'];
      if (!out.some(id => ok.includes(DEEP_BOONS[id].r))) {
        const alt = DEEP_BOON_IDS.filter(id => ok.includes(DEEP_BOONS[id].r) && !out.includes(id) && eligible(id, r));
        if (alt.length) out[out.length - 1] = draw(alt);
      }
    }
    return { kind, ids: out };
  }
  function openDraft(kind) {
    const r = R();
    r.phase = 'draft'; r.offer = makeOffer(r, kind);
    if (!r.offer.ids.length) { r.offer = null; return next(); }
    emit('deepOffer', { kind });
    save();
  }
  function grant(id, quiet) {
    const r = R(), b = DEEP_BOONS[id]; if (!b) return;
    const was = setsOnList();
    r.boons[id] = (r.boons[id] || 0) + 1;
    r.picks++;
    D().seen[id] = (D().seen[id] || 0) + 1;
    if (id === 'warm') r.oil = Math.min(oilMax(), r.oil + b.v);
    if (id === 'study') r.rr++;
    if (id === 'heart' && r.boons.heart === 1) r.heartAt = r.cleared;
    if (id === 'pact') r.oil = Math.min(r.oil, oilMax());
    const now = setsOnList();
    for (const s of now) if (!was.includes(s) && !quiet) toast(`Set bonus: ${DEEP_SETS[s].fx}.`, 'good', { ic: ['orb', '#7FB2FF'] }, 'normal');
    emit('deepPick', { id, rank: r.boons[id] });
  }
  const setsOnList = () => Object.keys(DEEP_SETS).filter(s => (!DEEP_SETS[s].c || deepStageC()) && setOn(s));

  // After a draft or a Landing: the queued extra draft, or the next floor.
  function next() {
    const r = R();
    r.offer = null; r.landing = null;
    if (r.queue.length) return openDraft(r.queue.shift());
    if (floorKind(r.floor) === 'landing') { r.phase = 'landing'; r.landing = ['refill', 'sharpen', 'study']; save(); emit('deepOffer', { kind: 'landing' }); return; }
    startFloor();
  }
  function startFloor() {
    const r = R();
    r.phase = 'fight'; r.foeI = 0; r.oilAtStart = r.oil; r.ft = 0; r.carry = 0;
    r.twiceUsed = false; r.cascade = 0; r.wallT = -1; r.lowWarned = false;
    save();
    emit('deepFloorStart', { floor: r.floor, kind: floorKind(r.floor) });
    if (deepActive()) { syncArena(); spawn(); }
  }

  // ---------------- the arena (50-sim.js calls it) ----------------
  DEEP_ARENA = {
    spawn() {
      const r = R();
      if (!r || r.phase !== 'fight') return null;
      if (mob && mob.deep && !mob.dead && mob.run === r.id) return mob;   // never reset a live foe
      const foes = floorFoes(r, r.floor), f = foes[r.foeI];
      if (!f) return null;
      const t = TYPES[f.ti], kind = floorKind(r.floor);
      let hp = foeHp(r, r.floor, f.mul);
      if (r.foeI === 0 && r.boons.first) hp *= 0.5;
      const max = hp;
      if (r.carry > 0) { hp = Math.max(max * 0.01, hp - r.carry); r.carry = 0; }
      const cyc = Math.floor((r.floor - 1) / 7);
      return {
        key: t.key + cyc, type: t.key, rows: SPR[t.key], pal: shiftPal(t.pal, 200 + cyc * 40), boss: !!f.boss, champ: !!f.elite,
        hp, max, name: f.boss ? `Deep Elder ${t.name}` : f.elite ? `Deep ${t.name} (elite)` : `Deep ${t.name}`,
        gold: 0, xp: 0, hit: 0, dead: 0, born: 0, deep: true, run: r.id, floor: r.floor, fk: kind
      };
    },
    onKill(m, over) {
      const r = R(); if (!r || !m.deep) return;
      emit('deepKill', { mob: m, floor: r.floor });
      r.foeI++;
      if (r.boons.flow && over > 0) r.carry = over;
      if (r.foeI >= floorFoes(r, r.floor).length) clearFloor();
    }
  };

  function payTrialMile(r, f) {
    const tr = D().trial;
    if (!r.trial || r.week !== tr.week) return;
    const m = T.trialMiles[f];
    if (m && !tr.paid[f]) { tr.paid[f] = 1; r.bonus += m; toast(`Trial: floor ${f} reached. +${m} Depth Marks.`, 'good', { ic: ['orb', '#7FB2FF'] }, 'normal'); }
  }
  function clearFloor() {
    const r = R(), f = r.floor, kind = floorKind(f);
    const refund = refundFor(kind);
    r.oil = Math.min(oilMax(), r.oil + refund);
    r.lastRefund = refund; r.lastKind = kind;
    passFloor(r, f, kind);
    emit('deepFloor', { floor: f, kind, trial: r.trial, refund });
    r.floor = f + 1;
    if (kind === 'boss' && r.boons.crown) r.queue.push('crown');
    openDraft(kind === 'boss' ? 'boss' : kind === 'elite' ? 'elite' : 'normal');
  }
  // Marks and records for a floor passed (fought, a Landing, or skipped by the Lantern Stair).
  function passFloor(r, f, kind, quiet) {
    r.top = Math.max(r.top, f); r.cleared++; D().floors++;
    r.marks += T.marks(f) + (r.boons.map ? 1 : 0) + (kind === 'boss' ? T.bossMarks : 0);
    if (kind === 'boss') r.bosses++;
    if (r.trial) {
      payTrialMile(r, f);
      const tr = D().trial;
      if (r.week === tr.week) {
        tr.best = Math.max(tr.best, f); tr.hist[r.week] = Math.max(tr.hist[r.week] || 0, f);
        if (f === T.sealFloor && !quiet) { almanac.count && almanac.count('trial'); toast('Trial Seal earned for this week. The Codex keeps it.', 'good', { ic: ['coin', '#F2C14E'] }, 'normal'); }
      }
    }
    if (!quiet) {
      if (f === 25) almanac.count && almanac.count('deep');
      if (kind === 'boss' && r.bosses === 2) almanac.count && almanac.count('elder');
    }
  }

  // ---------------- run life ----------------
  function newRun(trial) {
    const week = deviceWeek();
    return {
      id: Math.floor(Math.random() * 1e9), trial: !!trial, week, rule: trial ? trialRule(week).id : null,
      seed: trial ? hash(week, 0xDEE9) : Math.floor(Math.random() * 2147483647),
      anchor: Math.max(1, S.maxZone), par: parHp(), floor: 1, phase: 'fight', oil: 0, oilAtStart: 0,
      boons: {}, offer: null, landing: null, queue: [], banned: [],
      rr: 0, rrUsed: 0, ban: 0, marks: 0, bonus: 0, secs: 0, picks: 0,
      top: 0, cleared: 0, bosses: 0, foeI: 0, ft: 0, carry: 0, heartAt: 0, act: S.activity || 'fight',
      paused: false, twiceUsed: false, cascade: 0, wallT: -1, taps: 0, combo: 0, lastTap: -9, lowWarned: false,
      started: Date.now(), lastRefund: 0, lastKind: null
    };
  }
  function enter(r) {
    r.act = S.activity || 'fight';
    S.activity = 'fight'; fightBoss = false;
    r.paused = false;
    syncArena();
    retire();
    emit('sceneReset'); emit('activity', { activity: 'fight' });
  }
  // The foe on the stage when a run starts, resumes or ends is set aside (dead, no reward), so no
  // zone foe is fought under the arena and no well foe is left for the normal game.
  function retire() { if (mob && !mob.dead) { mob.hp = 0; mob.dead = 0.001; mob.deep = true; } }
  // Put the player's own activity back and hand the stage to the normal game.
  function leave(r) {
    const act = r.act || 'fight';
    S.activity = act === 'raid' && !(online.ready && online.canWrite) ? 'fight' : act;
    retire();
    arena = null; fightBoss = false;
    emit('sceneReset');
    if (S.activity === 'fight') spawn();
    emit('activity', { activity: S.activity });
  }
  function start(trial) {
    ensureInit();
    if (R() || !deepUnlocked()) return false;
    const r = newRun(trial); D().run = r;
    ensureTrialWeek();
    r.oil = Math.min(oilMax(r), T.oilStart + (trial ? 0 : 10 * loreOf(r, 'breath') + bonus('deepOil')));
    if (ruleOf(r) === 'drought') r.oil = 150;
    r.rr = ruleOf(r) === 'wick' ? 0 : T.rerolls + loreOf(r, 'wick') + (trial ? 0 : bonus('deepRerolls'));
    r.ban = loreOf(r, 'banish');
    enter(r);
    emit('deepStart', { trial: r.trial });
    // Deep Lore: Lantern Stair skips floors (their Marks are paid) and gives Common picks first.
    const stair = loreOf(r, 'stair');
    if (stair) { for (let f = 1; f <= 5 * stair; f++) passFloor(r, f, floorKind(f, r), true); r.floor = 1 + 5 * stair; }
    const fav = loreOf(r, 'fav') && D().fav && DEEP_BOONS[D().fav];
    if (fav && eligible(D().fav, r) && (DEEP_BOONS[D().fav].r === 'c' || (loreOf(r, 'fav') >= 2 && DEEP_BOONS[D().fav].r === 'r'))) grant(D().fav, true);
    for (let i = 0; i < stair; i++) r.queue.push('start');
    if (!D().tips) tip(0);
    next();
    return true;
  }
  function resume() {
    ensureInit();
    const r = R(); if (!r || !r.paused) return false;
    if (closedTrial(r)) return false;
    enter(r);
    if (r.phase === 'fight') { r.oil = r.oilAtStart; startFloor(); }
    else save();
    return true;
  }
  const closedTrial = r => {
    if (!r.trial || r.week === deviceWeek()) return false;
    end('closed');
    toast('That Trial has closed. Your run was scored.', 'good', { ic: ['orb', '#7FB2FF'] }, 'high');
    return true;
  };
  function marksNow(r) {
    r = r || R(); if (!r) return 0;
    const pb = r.trial ? 0 : Math.max(0, r.top - D().best) * T.pbMarks;
    const mul = (ruleOf(r) === 'steep' ? 1.5 : 1) * mod('deepMarks');
    return Math.round((r.marks + pb) * mul) + r.bonus;
  }
  // reason: oil | wipe (59c-deepwell-combat: the party fell) | leave | abandon | closed
  function end(reason) {
    const r = R(); if (!r) return null;
    const d = D(), oldBest = r.trial ? d.trial.best : d.best;
    const marks = marksNow(r), pb = !r.trial && r.top > d.best;
    if (!r.trial) d.best = Math.max(d.best, r.top);
    d.marks += marks; d.marksTotal += marks; d.runs++;
    const summary = {
      reason, trial: r.trial, rule: r.rule, week: r.week, floor: r.top, best: r.trial ? d.trial.best : d.best, oldBest,
      pb, marks, bosses: r.bosses, cleared: r.cleared, boons: Object.assign({}, r.boons), secs: Math.round(r.secs),
      lines: [
        { txt: 'Floors cleared', v: r.marks - r.bosses * T.bossMarks },
        { txt: 'Boss floors', v: r.bosses * T.bossMarks },
        { txt: 'New best', v: pb ? (r.top - oldBest) * T.pbMarks : 0 },
        { txt: 'Trial milestones', v: r.bonus }
      ].filter(x => x.v > 0)
    };
    const secs = r.paused ? 0 : r.secs;
    const wasLive = !r.paused;
    d.run = null;
    if (wasLive) leave(r); else arena = null;
    let away = null;
    if (secs >= 1) away = awayGains(secs);
    summary.away = away ? { gold: away.gold || 0, xp: away.xp || 0, mats: away.mats || [], raidDmg: away.raidDmg || 0, kills: away.kills || 0, secs } : null;
    d.last = { floor: summary.floor, best: summary.best, pb, marks, trial: r.trial, reason, at: Date.now() };
    if (typeof codexRefresh === 'function') codexRefresh(true);
    save();
    emit('deepEnd', { summary, away });
    return summary;
  }

  // ---------------- player actions ----------------
  function pick(id) {
    const r = R(); if (!r || r.phase !== 'draft' || !r.offer || !r.offer.ids.includes(id)) return false;
    grant(id); next(); return true;
  }
  function reroll() {
    const r = R(); if (!r || r.phase !== 'draft' || !r.offer || r.rr <= 0) return false;
    r.rr--; r.rrUsed++;
    r.offer = makeOffer(r, r.offer.kind); save(); return true;
  }
  function banish(id) {
    const r = R(); if (!r || r.phase !== 'draft' || !r.offer || r.ban <= 0 || !r.offer.ids.includes(id)) return false;
    r.ban--; r.banned.push(id);
    const i = r.offer.ids.indexOf(id), fill = makeOffer(r, r.offer.kind).ids.filter(x => !r.offer.ids.includes(x));
    if (fill.length) r.offer.ids[i] = fill[0]; else r.offer.ids.splice(i, 1);
    if (!r.offer.ids.length) next(); else save();
    return true;
  }
  function skip() {
    const r = R(); if (!r || r.phase !== 'draft') return false;
    r.oil = Math.min(oilMax(), r.oil + T.skipOil); next(); return true;
  }
  function landing(choice) {
    const r = R(); if (!r || r.phase !== 'landing') return false;
    const sharpen = sharpenable(r);
    if (choice === 'sharpen' && !sharpen.length) return false;
    passFloor(r, r.floor, 'landing');
    emit('deepFloor', { floor: r.floor, kind: 'landing', trial: r.trial, refund: 0 });
    r.floor++;
    if (choice === 'refill') { r.oil = Math.min(oilMax(), r.oil + T.landingOil); next(); }
    else if (choice === 'sharpen') { const id = sharpen[Math.floor(rng(hash(r.seed, r.floor, 0x5A))() * sharpen.length)]; grant(id); toast(`${DEEP_BOONS[id].n} rises to rank ${roman(r.boons[id])}.`, 'good', null, 'low'); next(); }
    else if (choice === 'study') { r.landing = null; openDraft('study'); }
    else return false;
    return true;
  }
  const sharpenable = r => Object.keys(r.boons).filter(id => DEEP_BOONS[id] && r.boons[id] < DEEP_BOONS[id].max);
  const between = () => { const r = R(); return !!r && (r.phase === 'draft' || r.phase === 'landing'); };
  const climbOut = () => between() ? end('leave') : null;
  const abandon = () => { const r = R(); return r && (r.paused || between()) ? end('abandon') : null; };

  // ---------------- tick: Oil, the floor clock, Executioner ----------------
  onTick(dt => {
    const r = R();
    if (!r) return;
    ensureInit();
    if (r.paused) return;
    if (inAway) return;
    syncArena();
    r.secs += dt;
    if (r.phase !== 'fight') return;
    // The player switched activity from outside the Deepwell: remember it for the climb out.
    if (S.activity !== 'fight') { r.act = S.activity; S.activity = 'fight'; emit('activity', { activity: 'fight' }); }
    const alive = mob && mob.deep && !mob.dead;
    if (!alive) { if (!mob || !mob.deep) spawn(); return; }
    r.ft += dt;
    const free = (setOn('oil') && r.ft < 4) || (r.wallT >= 0 && r.ft < r.wallT);
    if (!free) r.oil -= dt * drainRate();
    if (r.oil < T.oilLow && !r.lowWarned) { r.lowWarned = true; emit('deepOil', { oil: r.oil }); }
    if (r.boons.exec && mob.hp > 0 && mob.hp < mob.max * DEEP_BOONS.exec.v) strike(mob.hp * 1.0001 + 1e-9, '#9FE8FF', true, null, 'EXECUTE');
    if (r.oil <= 0) {
      r.oil = 0;
      if (D().run === r) end('oil');
    }
  });

  // ---------------- boon wiring ----------------
  const on_ = () => deepActive();
  const glassW = () => ruleOf(R()) === 'glass';
  addModifier('dmg', () => {
    if (!on_()) return 1;
    const r = R();
    let m = (1 + DEEP_BOONS.whet.v * rank('whet')) * (r.boons.glass ? 1.45 : 1) * (r.boons.pact ? 1.5 : 1);
    if (r.boons.heart) m *= 1 + DEEP_BOONS.heart.v * Math.floor((r.cleared - r.heartAt) / 3);
    if (setOn('flame')) m *= 1.2;
    const rule = ruleOf(r);
    if (rule === 'glass') m *= 2;
    if (rule === 'drum') m *= 0.5;
    if (soloOn()) m *= vigour(r);   // W1-C: the Company boons and the Vigour set are the hero's damage in solo
    return m;
  });
  // The Company boons (Battle Drill, Field Rations, Warband) and the Vigour set: companions' damage in the party game,
  // the hero's own in solo (W1-C).
  function vigour(r) {
    let m = (1 + DEEP_BOONS.drill.v * rank('drill')) * (r.boons.warband ? 1.6 : 1);
    const fk = r.phase === 'fight' ? floorKind(r.floor) : null;
    if ((fk === 'elite' || fk === 'boss') && r.boons.ration) m *= 1 + DEEP_BOONS.ration.v * rank('ration');
    if (setOn('company')) m *= 1 + Math.min(0.6, 0.02 * r.cleared);
    return m;
  }
  addModifier('party', () => {
    if (!on_()) return 1;
    const r = R();
    let m = vigour(r);
    if (ruleOf(r) === 'drum') m *= 2;       // dmg x0.5 on everyone; companions net x1
    return m;
  });
  addModifier('crit', () => {
    if (!on_()) return 1;
    return (1 + DEEP_BOONS.luck.v * rank('luck')) * (R().boons.mass ? 1.5 : 1) * (ruleOf(R()) === 'crit' ? 2 : 1);
  });
  addModifier('critDmg', () => on_() ? (1 + DEEP_BOONS.sharp.v * rank('sharp')) * (R().boons.mass ? 1.5 : 1) : 1);
  addModifier('nonCrit', () => on_() && ruleOf(R()) === 'crit' ? 0.5 : 1);
  addModifier('tap', () => {
    if (!on_()) return 1;
    const r = R();
    let m = 1 + DEEP_BOONS.heavy.v * rank('heavy');
    if (r.boons.rhythm) m *= 1 + Math.min(0.6, DEEP_BOONS.rhythm.v * r.combo);
    if (ruleOf(r) === 'drum') m *= 6;       // dmg x0.5 -> taps net x3
    if (ruleOf(r) === 'echo') m *= 0.5;     // Echo Week: Attack hits for half
    return m;
  });
  addModifier('abilityCd', () => on_() ? (1 - DEEP_BOONS.twin.v * rank('twin')) * (setOn('path') ? 0.5 : 1) * (ruleOf(R()) === 'echo' ? 0.5 : 1) : 1);
  const TUNES = { embersMax: 'kindle', guardMax: 'shield', markT: 'fletch', blessMax: 'psalm', mark: 'focus', emberPerTap: 'double', guard: 'bulwark', blessT: 'choir', volleyHits: 'storm', charges: 'lheart' };
  for (const k in TUNES) addBonus('tune:' + k, () => on_() ? DEEP_BOONS[TUNES[k]].v * rank(TUNES[k]) : 0);
  addBonus('tune:keepEmbers', () => on_() && R().boons.twice && !R().twiceUsed ? 1 : 0);
  addBonus('tune:hymnFloor', () => on_() && R().boons.hymn ? 1 : 0);

  on('ability', p => {
    if (!fighting()) return;
    const r = R();
    if (p.cls === 'lanternmage' && r.boons.twice) r.twiceUsed = true;
    if (p.cls === 'warden' && r.boons.wallnight) r.wallT = r.ft + DEEP_BOONS.wallnight.v;
  });
  on('crit', () => {
    if (!fighting()) return;
    const r = R();
    if (r.boons.cascade && r.cascade < 3) { const g = Math.min(0.2, 3 - r.cascade); r.cascade += g; r.oil = Math.min(oilMax(), r.oil + g); }
    if (setOn('crit') && mob && mob.deep && !mob.dead) strike(heroAtk() * critMult() * 0.3, '#FFD27A', false);
  });
  on('classTap', p => {
    if (!fighting() || p.auto || p.target !== 'mob') return;
    const r = R();
    r.taps++;
    if (r.boons.rhythm) { r.combo = r.ft - r.lastTap < 0.4 ? Math.min(12, r.combo + 1) : 0; r.lastTap = r.ft; }
    if (setOn('tap') && r.taps % 25 === 0 && mob && mob.deep && !mob.dead) strike(heroAtk() * 15, '#FFD27A', true, null, 'DRUMBEAT');
  });

  // ---------------- away phases, load and resume ----------------
  // Inside an away phase the player's own activity is in S.activity and no boon applies.
  on('awayBegin', () => { const r = R(); inAway = true; if (r && !r.paused) { S.activity = r.act || 'fight'; arena = null; } });
  on('awayEnd', () => { const r = R(); inAway = false; if (r && !r.paused) S.activity = 'fight'; syncArena(); });

  // A loaded save with a live run (the app closed mid-run): credit the seconds already spent below
  // with the load's away gains, and pause the run until the player taps Resume.
  function ensureInit() {
    if (initFor === S) return;
    initFor = S;
    const r = R();
    if (!r) { syncArena(); return; }
    if (!r.paused) {
      if (r.secs > 0) S.last -= r.secs * 1000;
      r.secs = 0; r.paused = true;
      S.activity = r.act || 'fight';
      if (r.phase === 'fight') { r.oil = r.oilAtStart; r.foeI = 0; }
    }
    arena = null;
  }
  function ensureTrialWeek() {
    const tr = D().trial, w = deviceWeek();
    if (tr.week !== w) { tr.week = w; tr.best = 0; tr.paid = {}; }
  }
  let slow = 0;
  onTick(dt => {
    slow += dt; if (slow < 1) return; slow = 0;
    ensureInit();
    if (!deepUnlocked()) return;
    ensureTrialWeek();
    const r = R();
    if (r && r.paused && r.trial && r.week !== deviceWeek()) closedTrial(r);
  });

  function tip(i) {
    const txt = ['Oil is your run. It drains while a foe stands, and each floor you clear refunds some.',
      'After each floor, pick 1 of 3 boons. Three boons of one set switch on its bonus.',
      'You can climb out between floors. You keep every Mark you found.'][i];
    if (!txt) return;
    D().tips = Math.max(D().tips, i + 1);
    toast(txt, 'good', { ic: ['flame', '#7FB2FF', { 5: '#BFE0FF', 7: '#FFFFFF' }] }, 'normal');
    emit('deepTip', { i, txt });
  }
  on('deepOffer', () => { if (D().tips === 1) tip(1); else if (D().tips === 2 && R() && R().cleared >= 2) tip(2); });

  // ---------------- views for the UI ----------------
  function card(id) {
    const b = DEEP_BOONS[id], r = R(), have = r ? r.boons[id] || 0 : 0;
    return {
      id, n: b.n, r: b.r, max: b.max, from: have, to: Math.min(b.max, have + 1), cls: b.cls,
      txt: b.txt(Math.min(b.max, have + 1)), now: have ? b.txt(have) : '',
      sets: b.sets.map(s => ({ id: s, n: DEEP_SETS[s].n, have: setCount(s), need: 3, on: setOn(s) }))
    };
  }
  function offerView() {
    const r = R(); if (!r) return null;
    if (r.phase === 'landing') {
      const sh = sharpenable(r);
      return { kind: 'landing', floor: r.floor, landing: [
        { id: 'refill', n: 'Refill', txt: `+${T.landingOil}s Oil` },
        { id: 'sharpen', n: 'Sharpen', txt: sh.length ? 'A random boon you hold gains a rank' : 'No boon can rank up yet', off: !sh.length },
        { id: 'study', n: 'Study', txt: 'Pick from 3 Rare or Epic boons' }] };
    }
    if (r.phase !== 'draft' || !r.offer) return null;
    return { kind: r.offer.kind, floor: r.floor - 1, cards: r.offer.ids.map(card), rr: r.rr, ban: r.ban, skipOil: T.skipOil, refund: r.lastRefund, lastKind: r.lastKind };
  }
  const owned = () => { const r = R(); return r ? Object.keys(r.boons).map(card) : []; };
  const setProgress = () => Object.keys(DEEP_SETS).filter(s => !DEEP_SETS[s].c || deepStageC()).map(s => ({ id: s, n: DEEP_SETS[s].n, fx: DEEP_SETS[s].fx, have: setCount(s), on: setOn(s) }));
  function trialInfo() {
    const w = deviceWeek(), rule = trialRule(w), tr = D().trial;
    const best = tr.week === w ? tr.best : 0;
    const seals = Object.keys(tr.hist).filter(k => tr.hist[k] >= T.sealFloor).length;
    const miles = Object.keys(T.trialMiles).map(f => ({ f: +f, m: T.trialMiles[f], got: tr.week === w && !!tr.paid[f] }));
    return { week: w, rule, best, seals, miles, sealed: best >= T.sealFloor, next: trialRule(w + 1) };
  }

  // ---------------- the shop ----------------
  const levelOf = id => { const it = DEEP_SHOP[id]; return it.cat === 'lore' ? D().lore[id] || 0 : it.cat === 'page' ? D().pages : D().cos[id] ? 1 : 0; };
  const maxOf = id => { const it = DEEP_SHOP[id]; return Array.isArray(it.cost) ? it.cost.length : it.max || 1; };
  const priceOf = id => { const it = DEEP_SHOP[id], lv = levelOf(id); return lv >= maxOf(id) ? null : Array.isArray(it.cost) ? it.cost[lv] : it.cost; };
  function shopRow(id) {
    const it = DEEP_SHOP[id], lv = levelOf(id), max = maxOf(id), price = priceOf(id);
    const lock = it.floor && D().best < it.floor ? `Reach floor ${it.floor}` : '';
    return { id, cat: it.cat, kind: it.kind, col: it.col, n: it.n, lv, max, price, done: lv >= max, lock,
      fx: it.fx(Math.max(1, Math.min(max, lv + (lv < max ? 1 : 0)))), fxNow: lv ? it.fx(lv) : '',
      can: price !== null && !lock && D().marks >= price, eq: it.kind ? D().eq[it.kind] === id : false };
  }
  const shop = cat => Object.keys(DEEP_SHOP).filter(id => !cat || DEEP_SHOP[id].cat === cat).map(shopRow);
  function nextLore() {
    let best = null;
    for (const id in DEEP_SHOP) { if (DEEP_SHOP[id].cat !== 'lore') continue; const p = priceOf(id); if (p !== null && (!best || p < best.price)) best = { id, price: p }; }
    return best ? shopRow(best.id) : null;
  }
  function buy(id) {
    ensureInit();
    const it = DEEP_SHOP[id]; if (!it) return false;
    const row = shopRow(id);
    if (!row.can) return false;
    D().marks -= row.price;
    if (it.cat === 'lore') D().lore[id] = row.lv + 1;
    else if (it.cat === 'page') D().pages = row.lv + 1;
    else D().cos[id] = 1;
    if (it.kind && !D().eq[it.kind]) D().eq[it.kind] = id;
    if (typeof codexRefresh === 'function') codexRefresh(true);
    save();
    emit('deepBuy', { id });
    return true;
  }
  const favChoices = () => { const lv = D().lore.fav || 0; if (!lv) return []; return DEEP_BOON_IDS.filter(id => { const b = DEEP_BOONS[id]; return !b.c && (b.r === 'c' || (lv >= 2 && b.r === 'r')) && (!b.cls || b.cls === 'any' || b.cls === cls()); }); };
  const setFav = id => { if (id !== null && !favChoices().includes(id)) return false; D().fav = id; save(); return true; };
  const equip = (slot, id) => { if (id !== null && (!D().cos[id] || DEEP_SHOP[id].kind !== slot)) return false; D().eq[slot] = id; save(); return true; };

  // ---------------- the Codex: Deepwell, Seals and Wardrobe pages, bought titles ----------------
  if (typeof CODEX_PAGES === 'object') {
    const P = CODEX_PAGES;
    if (P.deepwell) Object.assign(P.deepwell, {
      show: () => deepUnlocked(),
      tiles: x => {
        const d = D(), out = [];
        for (const f of [10, 20, 30, 40, 50, 60]) out.push({ key: 'depth' + f, n: `Depth ${f}`, got: d.best >= f ? 1 : 0, max: 1, pts: d.best >= f ? 10 : 0, ptsMax: 10, grp: 'Depth',
          hint: d.best >= f ? '' : x.exact ? `Clear floor ${f} in a normal run.` : 'Deeper down.' });
        for (const id of DEEP_BOON_IDS) { const b = DEEP_BOONS[id]; if (b.c && !deepStageC()) continue; const got = d.seen[id] ? 1 : 0;
          out.push({ key: 'b_' + id, n: b.n, got, max: 1, pts: got, ptsMax: 1, grp: 'Boons picked', sub: got ? b.txt(1) : '', hint: got ? '' : x.exact ? `A ${{ c: 'Common', r: 'Rare', e: 'Epic' }[b.r]} boon${b.cls && b.cls !== 'any' ? ' for the ' + HERO_CLASSES[b.cls].name : ''}.` : 'Pick it in a draft.' }); }
        DEEP_PAGES.forEach(([n, txt], i) => { const got = d.pages > i ? 1 : 0; out.push({ key: 'p' + i, n: got ? n : `Deep Lore page ${i + 1}`, got, max: 1, pts: got * 4, ptsMax: 4, grp: 'Deep Lore', sub: got ? txt : '', hint: got ? '' : 'Buy it with Depth Marks.' }); });
        return out;
      }
    });
    if (P.seals && typeof P.seals.tiles === 'function') {
      const base = P.seals.tiles, baseShow = P.seals.show;
      P.seals.show = () => (baseShow ? baseShow() : true) || deepUnlocked();
      P.seals.tiles = x => {
        const out = S.almanac ? base(x) : [];
        if (!deepUnlocked()) return out;
        const n = Math.min(52, Object.keys(D().trial.hist).filter(k => D().trial.hist[k] >= T.sealFloor).length);
        out.push({ key: 'trial', n: 'Trial Seals', got: n, max: 52, pts: n * 2, ptsMax: 104, sub: `${n} of 52 weeks. Any week counts; a missed week costs nothing.`, hint: n >= 52 ? '' : `Reach floor ${T.sealFloor} in a week's Trial.` });
        return out;
      };
    }
    if (P.wardrobe) Object.assign(P.wardrobe, {
      show: () => deepUnlocked(),
      tiles: () => Object.keys(DEEP_SHOP).filter(id => DEEP_SHOP[id].cat === 'look').map(id => {
        const it = DEEP_SHOP[id], got = D().cos[id] ? 1 : 0;
        return { key: id, n: it.n, got, max: 1, pts: got * 2, ptsMax: 2, grp: { lantern: 'Lanterns', decor: 'Camp decorations', trail: 'Trails' }[it.kind],
          sub: got ? 'Saved: shows once the stage and camp draw Deepwell looks.' : '', hint: got ? '' : `${it.cost} Depth Marks in the Deepwell shop.` };
      })
    });
  }
  if (typeof codexTitles === 'function') {
    const base = codexTitles;
    codexTitles = () => base().concat(Object.keys(DEEP_SHOP).filter(id => DEEP_SHOP[id].cat === 'title')
      .map(id => ({ id, n: DEEP_SHOP[id].n, src: 'Deepwell shop', got: !!D().cos[id] })));
  }

  // ---------------- Next Up, the away card ----------------
  const go = { tab: 'adv', view: 'deep' };
  const DEEP_IC = { ic: ['orb', '#7FB2FF'] };
  registerGoal({ id: 'deep-open', sys: 'deep', icon: DEEP_IC, go,
    label: () => deepUnlocked() ? 'The Deepwell is open: take your first run' : S.maxZone >= T.unlockZone ? `Build the Hearth to level ${T.hearth} to open the Deepwell` : `The Deepwell opens at zone ${T.unlockZone}`,
    pct: () => {
      if (D().runs || R()) return null; if (deepUnlocked()) return 1;
      if (S.maxZone >= T.unlockZone) return Math.min(0.99, (hearthLv() || 0) / T.hearth);
      return S.maxZone >= T.unlockZone - 5 ? Math.min(0.99, S.maxZone / T.unlockZone) : null;
    } });
  registerGoal({ id: 'deep-resume', sys: 'deep', icon: DEEP_IC, go, prio: 1,
    label: () => { const r = R(); return r ? `Deepwell: your run waits on floor ${r.floor}` : 'Deepwell'; },
    pct: () => { const r = R(); return r && r.paused ? 1 : null; } });
  registerGoal({ id: 'deep-trial', sys: 'deep', icon: { ic: ['coin', '#F2C14E'] }, go,
    label: () => `Trial (${trialRule().n}): reach floor ${T.sealFloor} for a Seal`,
    pct: () => { if (!deepUnlocked() || !D().runs || R()) return null; const t = trialInfo(); return t.sealed ? null : Math.max(0.05, Math.min(0.99, t.best / T.sealFloor)); } });
  registerGoal({ id: 'deep-shop', sys: 'deep', icon: DEEP_IC, go: { tab: 'adv', view: 'deep', sel: '#sec-deep-shop' },
    label: () => { const n = nextLore(); return n ? `Deep Lore: ${n.n} ${roman(n.lv + 1)}` : 'Deep Lore'; },
    pct: () => { if (!deepUnlocked() || R()) return null; const n = nextLore(); return n ? Math.min(1, D().marks / n.price) : null; } });
  registerAwayLine(() => {
    const r = R(); if (!r || !r.paused) return null;
    return { icon: DEEP_IC, txt: `Your Deepwell run waits on floor ${r.floor}`, sub: `${Math.ceil(r.phase === 'fight' ? r.oilAtStart : r.oil)}s of Oil. Resume it on the Fight tab.`, group: 'Deepwell', go: () => { if (typeof setTab === 'function') setTab('deep'); } };
  });

  DW = {
    run: R, live: deepActive, unlockInfo: () => ({ open: deepUnlocked(), zone: T.unlockZone, hearth: hearthLv() === null ? 0 : T.hearth, hearthNow: hearthLv(), maxZone: S.maxZone }),
    floorKind: (f, r) => floorKind(f, r), oilMax: r => oilMax(r), oil: () => { const r = R(); return r ? r.oil : 0; }, drainRate, refundFor: k => refundFor(k), marksNow,
    offerView, card, owned, setProgress, trialRule, trialInfo, shop, shopRow, nextLore, favChoices,
    start, resume, pick, reroll, banish, skip, landing, climbOut, abandon, buy, setFav, equip,
    fall: () => deepActive() && R().phase === 'fight' ? end('wipe') : null,   // the party wiped (59c-deepwell-combat)
    foeHp: (f, mul) => R() ? foeHp(R(), f, mul || 1) : 0, floorFoes: f => R() ? floorFoes(R(), f) : [],
    _init: () => { initFor = null; ensureInit(); }
  };
  ensureInit();
}
