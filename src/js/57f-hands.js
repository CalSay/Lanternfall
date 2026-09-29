// 57f-hands: Hands, the townsfolk who gather for the camp (docs/design/hearth-and-hands.md 5, task N1).
// Data: 21f-data-hands.js. CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Rules (spec 5; section 9 decisions accepted, wave-log D7):
//   - Hands live AT CAMP (owner, 2026-09-28): they sleep in the Bunkhouse, a camp building (57-camp
//     CAMP_B.bunk; its plot opens after the Tavern), and apply at the Tavern. Hands open at Hearth 2
//     with the Tavern and the Bunkhouse built. Tam, Hesketh's nephew, arrives free then. Old saves at
//     Hearth 2+ get the Bunkhouse at Lv 1 at their first load with this build (and so Tam). Hands
//     replace the never-built bench jobs.
//   - Applicants: one every 8 h of wall clock (6 h from Tavern Lv 3), at most 3 waiting; the first
//     arrives with Tam. A turned-away or hired applicant frees the spot; when the board was full, the
//     next one waits a full period from then. Rarity odds with pity (HANDS_TUNE.pity, S.hands.pity).
//   - Beds (data-driven, HANDS_TUNE.beds by Bunkhouse level): 1-5, +1 at Hearth 8, 6 at most; later
//     systems add beds with addBonus('handBeds', fn) and raise the cap with addBonus('handBedsMax', fn)
//     (a late-game rise; K13's refining Hands). No upkeep. Hire price
//     econHireFee(rarity) (55-econ, ECON-A; was foesGold(S.maxZone, HANDS_TUNE.hireFoes[rarity])).
//   - A shift: a Hand and an open node. At send the length, the rate (units an hour) and a seed are
//     fixed and stored in the Hand's job, like an expedition, so reload and offline pay the same.
//     Rate = the hero's live rate at that node (skill, tool, mastery, gear; NO Tonic, Omen, meal,
//     Glint, home ground or other yield modifiers) x share x traits x (own skill ? 1 : 0.5)
//     x toolHandsMult(skill). Share = base by rarity + 0.25% a level above 1 (10% .. 24.75%).
//   - When the shift ends the Hand walks home: the haul goes into the Hand's pack, which unloads into
//     the Storehouse line by line as PARCELS (stashAdd 'parcel': each line whole, or it waits), oldest
//     pack first, checked each second and on the away phase. A Hand with a pack cannot be sent.
//     Hands never emit 'harvest': no skill XP, no tool mastery, no rare finds from the hero's tool, no
//     Journal or achievement gathered units. Level XP = shift hours, paid at the end (Lv 1-20).
//   - Timers are wall-clock timestamps: shifts end and applicants arrive while the game is closed.
//
// API (N2 art and camp life, N3 UI, K12 Kitchen, 58-deeds, tools/sim.mjs):
//   read  handsOpen() -> bool                     Hands are live (Hearth 2, Tavern, Bunkhouse, HANDS_TUNE.on)
//         handsBeds() -> n, handsBedsAt(bunkLv, hearthLv) -> n (with the bonuses), handsFree() -> free beds
//         handsBunkFx(lv), handsTavernFx(lv) -> effect lines (57-camp campEffects; plain functions, hoisted)
//         handsList() -> [hand]  (live save records: read only; see the Save line for fields)
//         handsGet(id) -> hand | null
//         handsBoard() -> [{ i, app, cost, free, rate, kind, t, afford, can: { ok, why } }]  applicants
//         handsNextApp() -> ms until the next applicant (null when the board is full or Hands are closed)
//         handsHireCost(app) -> gold
//         handsStatus(h | id) -> { st: 'out' | 'back' | 'pack' | 'camp', label, left (s), pct, kind, t, spot }
//              spot (at camp): 'store' | 'bench' | 'kitchen' | 'fire' (work spot by day, the fire from dusk)
//         handsShare(h), handsShiftSecs(h, kind, now), handsRate(h, kind, t, now) -> units an hour now
//         handsPreview(h, kind, t) -> { rate, secs, haul, own, why }   what a shift there would bring
//         handsSuggest(h) -> { kind, t, why }   the node the next camp build is short of (own skill first)
//         handsNodes(h) -> [{ kind, t, rate, own, full }]   every node the Hand can work now
//         handsCanSend(id, kind, t) -> { ok, why }
//         handsHeroRate(kind, t) -> the hero's reference rate (units an hour)
//         handsTraits(h) -> [{ id, n, txt, camp, calling }]
//         handsName(h), handsRarName(h), handsSkillName(h), handsNodeName(kind, t)
//         handsLevelNeed(lv) -> hours to the next level; handsStoryDue(h) -> level of an untold story | 0
//         handsCampTrait(id) -> bool  an at-camp trait is working ('chatter' | 'cook' | 'story')
//         handsMealMult() -> 1.25 with a Cook at camp (or Mother Ashby anywhere); handsMealBonus() -> 0.10 with Mother Ashby
//         campClock(now) -> { phase: 'dawn' | 'day' | 'dusk' | 'night', h }   the device clock (spec 6.3)
//         handsStats() -> { hired, hours, units, stories, legends, byRar, out, home }
//   act   handsHire(i) -> hand | null, handsTurnAway(i) -> bool, handsLetGo(id) -> bool
//         handsSend(id, kind, t) -> job | null, handsSendAgain() -> number sent
//         handsEmpty(id) -> units thrown away (the UI asks first: "Throw away 120 Oak Log?")
//         handsStoryHeard(id) -> level of the story told | 0 (N2, when the player hears it)
//         handsTalk(id) -> talk counter after the tap (N2 rotates lines with it)
//         handsCatchUp(now, away) -> [returns]   (tick and away phase; tools)
//         handsRollApp() -> a new applicant (not placed on the board; pity counts it). Tools only (check.mjs pity).
//         handsExclude(fn(key) -> mult) -> remove()   a transient speed bonus to leave out of the rate
//                                                     (K12 meals); keys 'gatherSpeed', 'gatherSpeed:<skill>'
// Events: handsOpen { quiet }, handsArrive { app }, handsHire { id, r, free }, handsTurnAway { app },
//   handsLetGo { id, n }, handsSend { id, kind, t, end, secs }, handsBack { id, kind, t, lines, away },
//   handsUnload { id, fam, t, n } (troph lines: fam 'troph', t = Trophy index), handsLevel { id, lv, quiet },
//   handsStory { id, lv }, handsEmpty { id, n }.
// Modifiers: 'offline' (+2% with a Storyteller at camp). Bonuses read: 'handBeds', 'handBedsMax'.
// Later (K13, production chains): Hands who refine at stations or gather secondary resources. The
//   hand record keeps its fields; a new optional `role` (missing = 'gather') and job fields can be added.
// Save: registerState('hands', { v, seq, list, board: { apps, next }, pity: [rare, epic, legendary],
//   tam, log, hired, hrs, got, met, heard, open, rs, mig }). rs: the Hands' own random stream (applicants, seeds).
//   mig: the one-time old-save step ran (Bunkhouse Lv 1 at Hearth 2+).
//   list[i] = { id, n, r, sk, tr: [trait ids], cl (calling | null), key (named Hand | null), lv, xp (hours
//     into the level), job, pack: [[fam, t, n]] ('troph', i, n for a Trophy), last: { kind, t } | null,
//     talk, st (stories heard), hired (ms), hrs (hours worked), got (units delivered), back (ms home) }
//   job = { kind, t, start, end, rate, seed, bo: [[pct, from, to, tag]] } (bo: Friendly and Felling Song
//     windows, fixed when a partner is sent), or null.
//   board.apps[i] = { id, n, r, sk, tr, cl, key, at, free }; board.next: ms of the next arrival (0 = not open yet).
//   hired / hrs / got: lifetime (58-deeds reads handsStats). met: named Legendary key -> ms. heard: stories heard.

let handsOpen, handsBeds, handsBedsAt, handsFree, handsList, handsGet, handsBoard, handsNextApp, handsHireCost,
  handsStatus, handsShare, handsShiftSecs, handsRate, handsPreview, handsSuggest, handsNodes, handsCanSend,
  handsHeroRate, handsTraits, handsName, handsRarName, handsSkillName, handsNodeName, handsLevelNeed, handsStoryDue,
  handsCampTrait, handsMealMult, handsMealBonus, campClock, handsStats, handsHire, handsTurnAway, handsLetGo,
  handsSend, handsSendAgain, handsEmpty, handsStoryHeard, handsTalk, handsCatchUp, handsExclude, handsRollApp;

{
  const T = HANDS_TUNE;
  registerState('hands', { v: 1, seq: 0, list: [], board: { apps: [], next: 0 }, pity: [0, 0, 0], tam: 0, log: [],
    hired: 0, hrs: 0, got: 0, met: {}, heard: 0, open: 0, rs: 0, mig: 0 });
  const H = () => S.hands;
  const now = () => Date.now();
  const HOUR = 3600e3;
  const TR = {}; for (const x of HANDS_TRAITS) TR[x.id] = x;
  const LEG = {}; for (const x of HANDS_LEGENDS) LEG[x.key] = x;
  const rIdx = r => Math.max(0, HANDS_RAR.indexOf(r));
  const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };
  const lvOf = id => safe(() => campLevel(id), 0) | 0;
  const icon = { ic: ['boot', '#C9A36B'] };
  // A random stream of the Hands' own, kept in the save (S.hands.rs), so hiring never shifts the rolls
  // of other systems (Math.random) and a reload cannot re-roll an applicant.
  const rnd = () => {
    const h = H();
    if (!(h.rs | 0)) h.rs = ((now() ^ Math.imul((S.totalKills | 0) + 1, 2654435761)) | 0) || 1;
    h.rs = (h.rs + 0x6D2B79F5) | 0;
    let t = h.rs; t = Math.imul(t ^ t >>> 15, 1 | t); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const nodeName = (k, t) => NODE_NAMES[k] ? NODE_NAMES[k][t - 1] : matName(k, t);
  handsNodeName = nodeName;
  const lineText = ([f, t, n]) => f === 'troph' ? `${n} ${CRAFT_TROPHIES[t] ? CRAFT_TROPHIES[t].n : 'Trophy'}` : `${storeNumber(n)} ${matName(f, t)}`;
  const storeNumber = n => typeof storeNum === 'function' ? storeNum(n) : fmt(n);

  // ---------------- save repair (old or hand-edited saves) ----------------
  const fix = () => {
    const h = H();
    if (!Array.isArray(h.list)) h.list = [];
    if (!h.board || typeof h.board !== 'object') h.board = { apps: [], next: 0 };
    if (!Array.isArray(h.board.apps)) h.board.apps = [];
    if (!Array.isArray(h.pity) || h.pity.length < 3) h.pity = [0, 0, 0];
    if (!Array.isArray(h.log)) h.log = [];
    if (!h.met || typeof h.met !== 'object') h.met = {};
    h.list = h.list.filter(x => x && typeof x === 'object' && x.id);
    for (const x of h.list) {
      if (!HANDS_RAR.includes(x.r)) x.r = 'common';
      if (!Array.isArray(x.tr)) x.tr = [];
      if (!Array.isArray(x.pack)) x.pack = [];
      if (!(x.lv >= 1)) x.lv = 1;
      if (!(x.xp >= 0)) x.xp = 0;
      if (x.job && !(x.job.end > 0 && x.job.rate >= 0 && x.job.kind)) x.job = null;
      if (x.job && !Array.isArray(x.job.bo)) x.job.bo = [];
      for (const k of ['talk', 'st', 'hrs', 'got', 'back']) if (!(x[k] >= 0)) x[k] = 0;
      if (x.last === undefined) x.last = null;
      if (x.cl === undefined) x.cl = null;
      if (x.key === undefined) x.key = null;
    }
  };

  // ---------------- clock ----------------
  campClock = (t = now()) => {
    const d = new Date(t), h = d.getHours() + d.getMinutes() / 60;
    return { phase: h >= 6 && h < 8 ? 'dawn' : h >= 8 && h < 18 ? 'day' : h >= 18 && h < 21 ? 'dusk' : 'night', h };
  };
  const inClock = (c, t) => { const h = new Date(t).getHours(); return c[0] < c[1] ? h >= c[0] && h < c[1] : h >= c[0] || h < c[1]; };

  // ---------------- open, beds ----------------
  handsOpen = () => !!T.on && !!S.camp && safe(() => campOpen(), false) && lvOf('hearth') >= T.openHearth && lvOf('tavern') >= 1 && lvOf('bunk') >= 1;
  handsBedsAt = (bunk, hearth) => !(bunk >= 1) ? 0 : Math.max(0, Math.min(T.bedMax + Math.floor(bonus('handBedsMax')),
    (T.beds[Math.min(T.beds.length - 1, bunk)] || 0) + (hearth >= T.hallHearth ? T.hallBeds : 0) + Math.floor(bonus('handBeds'))));
  handsBeds = () => handsBedsAt(lvOf('bunk'), lvOf('hearth'));
  // H1's plot rule (cold saves): the Bunkhouse plot opens once the Tavern stands.
  if (typeof HEARTH_PLOT === 'object' && HEARTH_PLOT) HEARTH_PLOT.bunk = () => lvOf('tavern') >= 1;
  // Old saves at Hearth 2+ (they predate the Bunkhouse) get it at Lv 1 once, so Tam can come.
  const migrate = () => {
    const h = H(); if (h.mig) return;
    h.mig = 1;
    if (!T.on || !S.camp || !S.camp.b || !safe(() => campOpen(), false) || lvOf('hearth') < T.openHearth || lvOf('bunk') >= 1) return;
    S.camp.b.bunk = 1;
    emit('whatsNew', { msg: 'Your camp has a Bunkhouse now. Hands, townsfolk who gather for the heroes, sleep there. Hire them at the Tavern.', icon });
  };
  handsFree = () => Math.max(0, handsBeds() - H().list.length);
  handsList = () => H().list;
  handsGet = id => H().list.find(x => x.id === id) || null;
  const period = () => (lvOf('tavern') >= T.fastTavern ? T.arriveFastH : T.arriveH) * HOUR;

  // ---------------- names and text ----------------
  handsName = h => h ? h.n : '';
  handsRarName = h => HANDS_RAR_NAME[h && h.r] || 'Common';
  const SK_NAME = { mine: 'Miner', wood: 'Woodcutter', forage: 'Forager', fish: 'Fisher', any: 'Jack of all trades' };
  handsSkillName = h => SK_NAME[h && h.sk] || '';
  handsTraits = h => {
    const out = (h.tr || []).filter(id => TR[id]).map(id => ({ id, n: TR[id].n, txt: TR[id].txt, camp: !!TR[id].camp, calling: false }));
    if (h.cl && HANDS_CALLINGS[h.cl]) out.push({ id: h.cl, n: HANDS_CALLINGS[h.cl].n, txt: HANDS_CALLINGS[h.cl].txt, camp: false, calling: true });
    return out;
  };
  const has = (h, id) => !!h && Array.isArray(h.tr) && h.tr.includes(id);
  handsLevelNeed = lv => T.lvHours * lv;

  // ---------------- rates ----------------
  const excl = [];
  handsExclude = fn => { excl.push(fn); return () => { const i = excl.indexOf(fn); if (i >= 0) excl.splice(i, 1); }; };
  // The share of a speed modifier that is only for now (a Tonic, the day's Omen, K12's meals).
  const transient = key => {
    let m = 1;
    const a = safe(() => typeof tonicActive === 'function' ? tonicActive() : null, null);
    if (a && CRAFT_TONICS[a.key] && CRAFT_TONICS[a.key].mod === key) m *= 1 + a.v;
    const o = safe(() => typeof almanac === 'object' && almanac.active ? almanac.active() : null, null);
    if (o) {
      const dare = safe(() => almanac.dareOn(), false);
      let v = 1;
      if (dare && o.dare && o.dare.mod && key in o.dare.mod) v = o.dare.mod[key];
      else if (o.mod && key in o.mod && (!o.when || safe(() => o.when(), false))) v = o.mod[key];
      if (v > 0) m *= v;
    }
    for (const fn of excl) { const v = safe(() => fn(key), 1); if (v > 0) m *= v; }
    return m;
  };
  handsHeroRate = (kind, t) => {
    const sk = skillOf(kind);
    const base = 3600 / nodeTime(kind, t) * nodeYieldAvg(kind);
    return base / transient('gatherSpeed') / transient('gatherSpeed:' + sk);
  };
  handsShare = h => T.share[rIdx(h.r)] + T.perLv * (Math.min(T.lvMax, h.lv || 1) - 1);
  const own = (h, kind) => h.sk === 'any' || h.sk === skillOf(kind);
  const yieldOf = (h, kind, t, at) => {
    let y = 1;
    for (const id of h.tr || []) {
      const x = TR[id]; if (!x || !x.y) continue;
      if (x.fam && !x.fam.includes(kind)) continue;
      if (x.clock && !inClock(x.clock, at)) continue;
      y += x.y;
    }
    const c = h.cl && HANDS_CALLINGS[h.cl];
    if (c && c.y && (!c.tiers || c.tiers.includes(t))) y += c.y;
    return Math.max(0.1, y);
  };
  handsRate = (h, kind, t, at = now()) => {
    if (!h || !CRAFT_NODES[kind]) return 0;
    const sk = skillOf(kind), tm = typeof toolHandsMult === 'function' ? toolHandsMult(sk) : 1;
    return handsHeroRate(kind, t) * handsShare(h) * yieldOf(h, kind, t, at) * (own(h, kind) ? 1 : T.offSkill) * tm;
  };
  handsShiftSecs = (h, kind, at = now()) => {
    let hrs = T.shiftH[rIdx(h.r)] + T.lvShiftMins / 60 * Math.floor(Math.min(T.lvMax, h.lv || 1) / T.lvShiftEvery), mult = 1;
    for (const id of h.tr || []) {
      const x = TR[id]; if (!x) continue;
      if (x.clock && !inClock(x.clock, at)) continue;
      if (x.sh) hrs += x.sh;
      if (x.sx) mult *= x.sx;
    }
    return Math.round(hrs * mult * 3600);
  };
  const keenP = h => h.cl === 'deep' ? T.deepFind : has(h, 'keen') ? T.keen : 0;
  const luckyP = h => h.cl === 'quick' ? T.quickLucky : has(h, 'lucky') ? T.lucky : 0;

  // ---------------- nodes ----------------
  const open = (kind, t) => !!CRAFT_NODES[kind] && t >= 1 && t <= 5 && skillTierOpen(skillOf(kind), t);
  const kinds = () => (typeof GATHER_KINDS !== 'undefined' ? GATHER_KINDS : ['ore', 'wood']);
  handsNodes = h => {
    const out = [];
    for (const kind of kinds()) for (let t = 5; t >= 1; t--) if (open(kind, t))
      out.push({ kind, t, rate: handsRate(h, kind, t), own: own(h, kind), full: typeof stashFull === 'function' && stashFull(kind, t) });
    return out;
  };
  handsPreview = (h, kind, t) => {
    const at = now(), rate = handsRate(h, kind, t, at), secs = handsShiftSecs(h, kind, at);
    return { rate, secs, haul: Math.floor(rate * secs / 3600), own: own(h, kind), why: open(kind, t) ? '' : 'Your hero has not opened this node yet.' };
  };
  const room = (k, t) => typeof stashRoom === 'function' ? stashRoom(k, t) : Infinity;
  const haveOf = (k, t) => (S.mats[k] && S.mats[k][t - 1]) || 0;
  // The node the next camp build is short of (own skill first), else the Hand's own skill: the
  // highest open tier, the family with the smallest pile.
  handsSuggest = h => {
    if (!h) return null;
    const ownOk = k => h.sk === 'any' || skillOf(k) === h.sk;
    const want = [];
    if (typeof campList === 'function' && typeof campCan === 'function' && campOpen()) {
      for (const id of safe(() => campList(), [])) {
        const c = safe(() => campCan(id), null);
        if (!c || c.ok || c.max || !c.cost || c.need) continue;
        for (const [f, t, n] of c.cost.mats || []) {
          const miss = n - haveOf(f, t);
          if (miss > 0 && CRAFT_NODES[f] && open(f, t) && room(f, t) > 0) want.push({ kind: f, t, miss, own: ownOk(f), id });
        }
      }
    }
    want.sort((a, b) => (b.own - a.own) || (b.miss - a.miss));
    if (want.length && want[0].own) {
      const w = want[0], nm = w.id === 'hearth' ? 'the Hearth' : CAMP_B[w.id] ? `the ${CAMP_B[w.id].n}` : 'a build';
      return { kind: w.kind, t: w.t, why: `${nm} needs ${storeNumber(w.miss)} more ${matName(w.kind, w.t)}.` };
    }
    let best = null;
    for (const kind of kinds()) {
      if (!ownOk(kind)) continue;
      let t = 0; for (let i = 5; i >= 1; i--) if (open(kind, i)) { t = i; break; }
      if (!t) continue;
      const cap = typeof storeCap === 'function' ? storeCap(kind, t) : Infinity, fill = cap === Infinity ? haveOf(kind, t) / 1e9 : haveOf(kind, t) / Math.max(1, cap);
      const x = { kind, t, fill };
      if (!best || x.t > best.t || (x.t === best.t && x.fill < best.fill)) best = x;
    }
    if (best && room(best.kind, best.t) > 0) return { kind: best.kind, t: best.t, why: 'Your smallest pile of the best node.' };
    if (want.length) { const w = want[0]; return { kind: w.kind, t: w.t, why: `A build needs ${matName(w.kind, w.t)} (half share off-skill).` }; }
    return best ? { kind: best.kind, t: best.t, why: 'That pile is full; the pack will wait.' } : null;
  };

  // ---------------- status ----------------
  const SPOT = { mine: 'store', wood: 'bench', forage: 'kitchen' };
  handsStatus = hh => {
    const h = typeof hh === 'string' ? handsGet(hh) : hh; if (!h) return null;
    const t = now(), j = h.job;
    if (j && j.end > t) return { st: 'out', label: `Out at the ${nodeName(j.kind, j.t)}`, left: (j.end - t) / 1000, pct: Math.min(1, Math.max(0, (t - j.start) / Math.max(1, j.end - j.start))), kind: j.kind, t: j.t, spot: null };
    if (j) return { st: 'back', label: 'Walking home', left: 0, pct: 1, kind: j.kind, t: j.t, spot: 'road' };
    if (h.pack.length) return { st: 'pack', label: 'Pack waits by the Storehouse', left: 0, pct: 1, kind: h.last && h.last.kind, t: h.last && h.last.t, spot: 'store' };
    const ph = campClock(t).phase, want = SPOT[h.sk];
    const spot = (ph === 'dawn' || ph === 'day') && want && lvOf(want) > 0 ? want : 'fire';
    const where = { store: 'By the Storehouse door', bench: 'At the woodpile', kitchen: 'At the Kitchen table', fire: 'At the fire' }[spot];
    return { st: 'camp', label: where, left: 0, pct: 0, kind: null, t: null, spot };
  };
  const atCamp = h => !h.job;
  handsCampTrait = id => T.on && H().list.some(h => atCamp(h) && has(h, id));
  handsMealMult = () => T.on && (handsCampTrait('cook') || H().list.some(h => h.cl === 'hearthcook')) ? 1 + T.cook : 1;
  handsMealBonus = () => T.on && H().list.some(h => h.cl === 'hearthcook') ? T.ashbyMeal : 0;
  addModifier('offline', () => handsCampTrait('story') ? 1 + T.story : 1);

  // ---------------- applicants ----------------
  // ECON-A (economy-2 4.1): the hire fee by rarity at the region you have reached (econHireFee); was foesGold(S.maxZone, hireFoes[r]).
  handsHireCost = app => app && app.free ? 0 : Math.max(1, econHireFee(rIdx(app && app.r)));
  const usedNames = () => new Set(H().list.map(x => x.n).concat(H().board.apps.map(x => x.n)));
  const usedKeys = () => new Set(H().list.map(x => x.key).concat(H().board.apps.map(x => x.key)).filter(Boolean));
  function rollRarity() {
    const p = H().pity;
    let r;
    if (p[2] >= T.pity[2] - 1) r = 4;
    else if (p[1] >= T.pity[1] - 1) r = rnd() < T.odds[4] / (T.odds[3] + T.odds[4]) ? 4 : 3;
    else if (p[0] >= T.pity[0] - 1) { const w = T.odds.slice(2), s = w.reduce((a, b) => a + b, 0); let x = rnd() * s; r = 2; for (let i = 0; i < w.length; i++) { if (x < w[i]) { r = 2 + i; break; } x -= w[i]; } }
    else { let x = rnd(); r = 0; for (let i = 0; i < T.odds.length; i++) { if (x < T.odds[i]) { r = i; break; } x -= T.odds[i]; r = i; } }
    return r;
  }
  const notePity = r => { const p = H().pity; for (let i = 0; i < 3; i++) p[i] = r >= i + 2 ? 0 : p[i] + 1; };
  function makeApp(at) {
    const h = H();
    let r = rollRarity(), leg = null;
    if (r === 4) {
      const used = usedKeys(), free = HANDS_LEGENDS.filter(x => !used.has(x.key));
      if (free.length) leg = pick(free); else r = 3;
    }
    notePity(r);
    const rar = HANDS_RAR[r], nTr = T.traits[r];
    const pool = HANDS_TRAITS.map(x => x.id), tr = [];
    while (tr.length < nTr && pool.length) tr.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
    let n = leg ? leg.n : '';
    if (!n) { const used = usedNames(); for (let g = 0; g < 20; g++) { n = `${pick(HANDS_FIRST)} ${pick(HANDS_TRADE)}`; if (!used.has(n)) break; } }
    h.seq = (h.seq | 0) + 1;
    return { id: 'h' + h.seq, n, r: rar, sk: leg ? leg.sk : pick(HANDS_SKILLS), tr, cl: leg ? leg.cl : null, key: leg ? leg.key : null, at, free: 0 };
  }
  handsRollApp = () => makeApp(now());
  const addApp = (app, quiet) => { H().board.apps.push(app); emit('handsArrive', { app, quiet: !!quiet }); };
  // Arrivals up to t (wall clock). The board holds maxWait; while full the clock waits.
  function arrivals(t, quiet) {
    const b = H().board;
    if (!b.next) return 0;
    let n = 0;
    for (let g = 0; g < 50 && b.next <= t && b.apps.length < T.maxWait; g++) { addApp(makeApp(b.next), quiet); b.next += period(); n++; }
    return n;
  }
  const freed = wasFull => { const b = H().board; if (wasFull) b.next = Math.max(b.next, now() + period()); };
  handsBoard = () => {
    const free = handsFree();
    return H().board.apps.map((app, i) => {
      const cost = handsHireCost(app), sg = handsSuggest(app) || { kind: 'wood', t: 1 };
      const why = !handsOpen() ? 'Hands are not open yet.' : !free ? 'No free bed. Build the Bunkhouse up, or let a Hand go.' : S.gold < cost ? `Needs ${fmt(cost)} gold.` : '';
      return { i, app, cost, free: !!app.free, rate: handsRate(Object.assign({ lv: 1 }, app), sg.kind, sg.t), kind: sg.kind, t: sg.t, afford: S.gold >= cost, can: { ok: !why, why } };
    });
  };
  handsNextApp = () => handsOpen() && H().board.next && H().board.apps.length < T.maxWait ? Math.max(0, H().board.next - now()) : null;
  const newHand = (app, t) => ({ id: app.id, n: app.n, r: app.r, sk: app.sk, tr: app.tr.slice(), cl: app.cl || null, key: app.key || null,
    lv: 1, xp: 0, job: null, pack: [], last: null, talk: 0, st: 0, hired: t, hrs: 0, got: 0, back: 0 });
  handsHire = i => {
    const h = H(), app = h.board.apps[i];
    if (!app || !handsOpen() || !handsFree()) return null;
    const cost = handsHireCost(app);
    if (S.gold < cost) return null;
    S.gold -= cost; econSpend('hire', cost);
    const wasFull = h.board.apps.length >= T.maxWait;
    h.board.apps.splice(i, 1); freed(wasFull);
    const x = newHand(app, now());
    h.list.push(x); h.hired = (h.hired | 0) + 1;
    if (x.key && !h.met[x.key]) h.met[x.key] = now();
    emit('handsHire', { id: x.id, r: x.r, free: !!app.free });
    save();
    return x;
  };
  handsTurnAway = i => {
    const h = H(), app = h.board.apps[i]; if (!app) return false;
    const wasFull = h.board.apps.length >= T.maxWait;
    h.board.apps.splice(i, 1); freed(wasFull);
    emit('handsTurnAway', { app }); save();
    return true;
  };
  handsLetGo = id => {
    const h = H(), x = handsGet(id); if (!x || x.job || x.pack.length) return false;
    h.list.splice(h.list.indexOf(x), 1);
    emit('handsLetGo', { id, n: x.n }); save();
    return true;
  };

  // ---------------- shifts ----------------
  handsCanSend = (id, kind, t) => {
    const x = handsGet(id);
    if (!T.on || !x) return { ok: false, why: 'No such Hand.' };
    if (x.job) return { ok: false, why: `${x.n} is out.` };
    if (x.pack.length) return { ok: false, why: `${x.n}'s pack waits for room in the Storehouse.` };
    if (!CRAFT_NODES[kind] || !(t >= 1 && t <= 5)) return { ok: false, why: 'Pick a node.' };
    if (!open(kind, t)) return { ok: false, why: 'Your hero has not opened this node yet.' };
    return { ok: true, why: '' };
  };
  const out = (x, t) => !!x.job && x.job.end > t;
  handsSend = (id, kind, t) => {
    if (!handsCanSend(id, kind, t).ok) return null;
    const x = handsGet(id), at = now(), secs = handsShiftSecs(x, kind, at);
    const job = { kind, t, start: at, end: at + secs * 1000, rate: handsRate(x, kind, t, at), seed: (rnd() * 2147483647) | 0, bo: [] };
    // Friendly: one partner, both get the bonus for the time they are out together.
    if (has(x, 'friendly')) {
      const y = H().list.find(o => o !== x && has(o, 'friendly') && out(o, at) && !o.job.bo.some(b => b[3] === 'f'));
      if (y) { const e = Math.min(job.end, y.job.end); job.bo.push([T.friendly, at, e, 'f']); y.job.bo.push([T.friendly, at, e, 'f']); }
    }
    // Felling Song (Old Bracken): other Hands at a Woodcutting node, while Bracken is out.
    const wood = k => skillOf(k) === 'wood';
    if (x.cl === 'felling') { for (const o of H().list) if (o !== x && out(o, at) && wood(o.job.kind)) o.job.bo.push([T.felling, at, Math.min(job.end, o.job.end), 'b']); }
    else if (wood(kind)) { const b = H().list.find(o => o !== x && o.cl === 'felling' && out(o, at)); if (b) job.bo.push([T.felling, at, Math.min(job.end, b.job.end), 'b']); }
    x.job = job; x.last = { kind, t };
    emit('handsSend', { id, kind, t, end: job.end, secs });
    save();
    return job;
  };
  handsSendAgain = () => {
    let n = 0;
    for (const x of H().list) {
      if (x.job || x.pack.length) continue;
      const w = x.last && open(x.last.kind, x.last.t) ? x.last : handsSuggest(x);
      if (w && handsSend(x.id, w.kind, w.t)) n++;
    }
    return n;
  };
  // The haul of a finished job, from its stored numbers only (same seed, same haul).
  const payOf = (x, j) => {
    const len = Math.max(1, j.end - j.start), hrs = len / HOUR, r = rng(j.seed | 0);
    let f = 1;
    for (const [p, a, b] of j.bo || []) f += p * Math.max(0, Math.min(b, j.end) - Math.max(a, j.start)) / len;
    const u = j.rate * hrs * f;
    let n = Math.floor(u) + (r() < u % 1 ? 1 : 0);
    const lines = [];
    const kp = keenP(x);
    if (kp > 0 && n > 0) {
      const e = n * kp, up = Math.floor(e) + (r() < e % 1 ? 1 : 0);
      if (up > 0) { if (j.t < 5) { n -= up; lines.push([j.kind, j.t + 1, up]); } else lines.push([j.kind, 5, up]); }
    }
    if (n > 0) lines.unshift([j.kind, j.t, n]);
    if (x.cl === 'physic' && u > 0) { const e = u * T.physic, m = Math.floor(e) + (r() < e % 1 ? 1 : 0); if (m > 0) lines.push(['herb', j.t, m]); }
    const lp = luckyP(x);
    if (lp > 0 && r() < lp) lines.push(['troph', Math.floor(r() * CRAFT_TROPHIES.length), 1]);
    return { lines, hrs };
  };
  const gainXp = (x, hrs, quiet) => {
    let m = has(x, 'old') ? 1 + T.oldHand : 1;
    if (H().list.some(o => o !== x && atCamp(o) && has(o, 'chatter'))) m *= 1 + T.chatter;
    x.xp += hrs * m;
    while (x.lv < T.lvMax && x.xp >= handsLevelNeed(x.lv)) { x.xp -= handsLevelNeed(x.lv); x.lv++; emit('handsLevel', { id: x.id, lv: x.lv, quiet: !!quiet }); }
    if (x.lv >= T.lvMax) x.xp = 0;
  };
  // Shifts that ended by t come home (oldest first); then every pack unloads what fits.
  handsCatchUp = (t = now(), away = false) => {
    const h = H(), back = [];
    const done = h.list.filter(x => x.job && x.job.end <= t).sort((a, b) => a.job.end - b.job.end);
    for (const x of done) {
      const j = x.job, { lines, hrs } = payOf(x, j);
      x.job = null; x.back = j.end; x.last = { kind: j.kind, t: j.t };
      x.pack.push(...lines.map(l => l.slice()));
      x.hrs += hrs; h.hrs = (h.hrs || 0) + hrs;
      gainXp(x, hrs, away);
      const ev = { id: x.id, n: x.n, kind: j.kind, t: j.t, lines, away: !!away, at: j.end };
      h.log.push({ id: x.id, n: x.n, kind: j.kind, t: j.t, lines, at: j.end }); if (h.log.length > T.logMax) h.log.splice(0, h.log.length - T.logMax);
      emit('handsBack', ev);
      back.push(ev);
    }
    unload();
    return back;
  };
  function unload() {
    const h = H();
    const full = h.list.filter(x => x.pack.length).sort((a, b) => a.back - b.back);
    for (const x of full) {
      for (let i = 0; i < x.pack.length;) {
        const [f, t, n] = x.pack[i];
        let got = 0;
        if (f === 'troph') got = typeof addTrophy === 'function' ? addTrophy(t, n, 'hands') : 0;
        else if (S.mats[f]) got = stashAdd(f, t, n, 'parcel');
        else { x.pack.splice(i, 1); continue; }   // a family this build does not know: drop the line
        if (got > 0 || !(n > 0)) {
          x.pack.splice(i, 1);
          if (f !== 'troph') { x.got += got; h.got = (h.got || 0) + got; }
          emit('handsUnload', { id: x.id, fam: f, t, n: got });
        } else i++;
      }
    }
  }
  handsEmpty = id => {
    const x = handsGet(id); if (!x || !x.pack.length) return 0;
    const n = x.pack.reduce((a, l) => a + (l[0] === 'troph' ? 0 : l[2]), 0);
    x.pack = []; emit('handsEmpty', { id, n }); save();
    return n;
  };
  handsStoryDue = x => { if (!x) return 0; const due = T.storyAt.filter(l => x.lv >= l); return due.length > (x.st | 0) ? due[x.st | 0] : 0; };
  handsStoryHeard = id => {
    const x = handsGet(id), lv = handsStoryDue(x); if (!lv) return 0;
    x.st = (x.st | 0) + 1; H().heard = (H().heard | 0) + 1;
    emit('handsStory', { id, lv }); save();
    return lv;
  };
  handsTalk = id => { const x = handsGet(id); if (!x) return 0; x.talk = (x.talk | 0) + 1; return x.talk; };
  handsStats = () => {
    const h = H(), byRar = {};
    for (const x of h.list) byRar[x.r] = (byRar[x.r] || 0) + 1;
    const t = now();
    return { hired: h.hired | 0, hours: h.hrs || 0, units: h.got || 0, stories: h.heard | 0, legends: Object.keys(h.met || {}).length, byRar,
      out: h.list.filter(x => out(x, t)).length, home: h.list.filter(x => !x.job).length };
  };

  // ---------------- opening: Tam and the first applicant ----------------
  function openHands(quiet) {
    const h = H(), t = now();
    h.open = h.open || t;
    if (!h.tam && handsFree() > 0) {
      h.tam = 1;
      const tam = newHand({ id: 'tam', n: HANDS_TAM.n, r: HANDS_TAM.r, sk: HANDS_TAM.sk, tr: HANDS_TAM.tr, cl: null, key: HANDS_TAM.key }, t);
      h.list.push(tam); h.hired = (h.hired | 0) + 1;
      emit('handsHire', { id: tam.id, r: tam.r, free: true });
      toast(quiet ? 'Tam, Hesketh\'s nephew, has a bed in the Bunkhouse. He gathers for the heroes. Hire more Hands at the Tavern.'
        : 'Tam, Hesketh\'s nephew, comes to the fire. "Uncle said the Lanternbearer\'s lamp catches." He takes a bed in the Bunkhouse and gathers for the heroes.', 'good', icon, quiet ? 'normal' : 'high');
    }
    if (!h.board.next) { h.board.next = t + period(); if (h.board.apps.length < T.maxWait) addApp(makeApp(t), quiet); }
    emit('handsOpen', { quiet: !!quiet });
  }
  // Later Hands (HANDS_LATER: the Hollises, off until LORE8b): a free applicant, once each.
  function later() {
    for (const x of HANDS_LATER) {
      if (!x.live || H().met[x.key] || usedKeys().has(x.key) || !safe(() => x.when(), false)) continue;
      if (H().board.apps.length >= T.maxWait) return;
      H().seq = (H().seq | 0) + 1;
      addApp({ id: 'h' + H().seq, n: x.n, r: x.r, sk: x.sk, tr: x.tr.slice(), cl: null, key: x.key, at: now(), free: 1 }, false);
      H().met[x.key] = now();
    }
  }

  // ---------------- each second, and the away phase ----------------
  const backText = e => `${e.n} is back from the ${nodeName(e.kind, e.t)}` + (e.lines.length ? `: +${e.lines.map(lineText).join(', +')}.` : '.');
  const waits = id => { const x = handsGet(id); return !!x && x.pack.length > 0; };
  let initFor = null, acc = 0, first = true;
  const init = () => { if (initFor !== S) { initFor = S; fix(); first = true; } };
  onTick(dt => {
    init();
    acc += dt; if (acc < 1) return; acc = 0;
    if (!T.on) return;
    const q = first; first = false;
    migrate();
    if (!handsOpen()) return;
    if (!H().tam || !H().board.next) openHands(q);
    const t = now();
    const got = arrivals(t, q);
    if (got && !q) toast(got > 1 ? `${got} applicants are waiting at the Tavern.` : 'An applicant is waiting at the Tavern.', 'good', icon, 'low');
    later();
    const back = handsCatchUp(t, false);
    for (const e of back) toast(waits(e.id) ? `${backText(e)} The pack waits by the Storehouse.` : backText(e), 'good', e.lines[0] && e.lines[0][0] !== 'troph' ? { mat: [e.lines[0][0], e.lines[0][1]] } : icon, 'low');
    if (back.length) save();
  });
  let awayBack = [], awayApps = 0;
  on('away', r => {
    init();
    awayBack = []; awayApps = 0;
    if (!T.on) return;
    migrate();
    if (!handsOpen()) return;
    if (!H().tam || !H().board.next) openHands(true);
    const t = now();
    awayApps = arrivals(t, true);
    later();
    awayBack = handsCatchUp(t, true);
  });
  registerAwayLine(() => {
    const res = [];
    for (const e of awayBack) res.push({ icon: e.lines[0] && e.lines[0][0] !== 'troph' ? { mat: [e.lines[0][0], e.lines[0][1]] } : icon, group: 'Hands', txt: backText(e),
      sub: waits(e.id) ? `${e.n}'s pack waits: Storehouse full.` : '', go: () => emit('campGoto', { tab: 'world', view: 'tav', sel: '#sec-hands' }) });
    if (awayApps) res.push({ icon, group: 'Hands', txt: awayApps > 1 ? `${awayApps} applicants are waiting at the Tavern.` : 'An applicant is waiting at the Tavern.', go: () => emit('campGoto', { tab: 'world', view: 'tav', sel: '#sec-hands' }) });
    const t = now(), stillOut = H().list.filter(x => out(x, t));
    if (res.length && stillOut.length) res.push({ icon, group: 'Hands', txt: `${stillOut.length} still out`, sub: stillOut.map(x => `${x.n}: ${fmtTime((x.job.end - t) / 1000)}`).join(' · ') });
    awayBack = []; awayApps = 0;
    return res;
  });

  // ---------------- Next Up ----------------
  const go = { tab: 'world', view: 'tav', sel: '#sec-hands' };
  const idle = () => T.on && handsOpen() ? H().list.filter(x => !x.job && !x.pack.length) : [];
  registerGoal({
    id: 'hands-back', sys: 'hands', prio: 2, icon, go,
    label: () => { const l = idle(); return l.length > 1 ? `${l.length} Hands are at camp: send them out` : l.length ? `${l[0].n} is at camp: send again` : ''; },
    pct: () => idle().length ? 1 : 0
  });
  registerGoal({
    id: 'hands-app', sys: 'hands', prio: 1, icon, go,
    label: () => 'An applicant is waiting at the Tavern',
    pct: () => {
      if (!T.on || !handsOpen() || !H().board.apps.length || !handsFree()) return 0;
      const c = Math.min(...H().board.apps.map(handsHireCost));
      return S.gold >= c ? 1 : Math.max(0.05, Math.min(0.95, 0.95 * S.gold / c));
    }
  });
}

// Effect lines for 57-camp's campEffects (plain functions: hoisted, safe at any load order).
function handsBunkFx(l) {
  const T = HANDS_TUNE;
  if (!(l > 0)) return ['Not built'];
  const b = T.beds[Math.min(T.beds.length - 1, l)] || 0;
  return [`${b} bed${b === 1 ? '' : 's'} for Hands`].concat(l >= T.beds.length - 1 ? [`+${T.hallBeds} at Hearth ${T.hallHearth} (the Lantern Hall)`] : []);
}
function handsTavernFx(l) {
  const T = HANDS_TUNE;
  return !T.on || !(l > 0) ? [] : [`Hands apply here: one every ${l >= T.fastTavern ? T.arriveFastH : T.arriveH} h`];
}
