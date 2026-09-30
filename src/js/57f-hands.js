// 57f-hands: Hands, the townsfolk who gather for the camp (docs/design/hearth-and-hands.md 5, task N1).
// Data: 21f-data-hands.js. CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// C1 rules (gatherers-2 and economy-2): Tents cap the crew; two come free when Hands
// open at Hearth 2 with a Tavern. Random applicants are Common-Epic; supported named
// routes add permanent Legendary star applicants outside the three random places.
// A send prepays one or two four-hour shifts. Rate, fees and seeds are fixed at send.
// Between shifts: unload parcels, rest 30 minutes, then leave; a waiting pack cancels
// and refunds unstarted shifts. Recall pays time worked, keeps the active fee and
// refunds unstarted shifts. Old v5 jobs retain their saved duration/rate/seed.
//
// API (N2 art and camp life, N3 UI, K12 Kitchen, 58-deeds, tools/sim.mjs):
//   read  handsOpen() -> bool                     Hands are live (Hearth 2, Tavern, HANDS_TUNE.on)
//         handsBeds() -> n, handsBedsAt(bunkLv, hearthLv) -> n (with the bonuses), handsFree() -> free beds
//         handsBunkFx(lv), handsTavernFx(lv) -> effect lines (57-camp campEffects; plain functions, hoisted)
//         handsList() -> [hand]  (live save records: read only; see the Save line for fields)
//         handsGet(id) -> hand | null
//         handsBoard() -> [{ i, app, cost, free, rate, kind, t, afford, can: { ok, why } }]  applicants
//         handsNextApp() -> ms until the next applicant (null when the board is full or Hands are closed)
//         handsHireCost(app) -> gold
//         handsStatus(h | id) -> { st: 'out' | 'rest' | 'back' | 'pack' | 'camp', label, left (s), pct, kind, t, spot }
//              spot (at camp): 'store' | 'bench' | 'kitchen' | 'fire' (work spot by day, the fire from dusk)
//         handsShare(h), handsShiftSecs(h, kind, now), handsRate(h, kind, t, now) -> units an hour now
//         handsPreview(h, kind, t) -> { rate, secs, haul, own, why }   what a shift there would bring
//         handsSuggest(h) -> { kind, t, why }   the node the next camp build is short of (own skill first)
//         handsNodes(h) -> [{ kind, t, rate, own, full }]   every node the Hand can work now
//         handsCanSend(id, kind, t, {shifts}?) -> { ok, why, fee, shifts }
//         handsHeroRate(kind, t) -> the hero's reference rate (units an hour)
//         handsTraits(h) -> [{ id, n, txt, camp, calling }]
//         handsName(h), handsRarName(h), handsSkillName(h), handsNodeName(kind, t)
//         handsLevelNeed(lv) -> hours to the next level; handsStoryDue(h) -> level of an untold story | 0
//         handsCampTrait(id) -> bool  an at-camp trait is working ('chatter' | 'cook' | 'story')
//         handsMealMult() -> 1.25 with a Cook at camp (or Mother Ashby anywhere); handsMealBonus() -> 0.10 with Mother Ashby
//         campClock(now) -> { phase: 'dawn' | 'day' | 'dusk' | 'night', h }   the device clock (spec 6.3)
//         handsStats() -> { hired, hours, units, stories, legends, byRar, out, home }
//   act   handsHire(i) -> hand | null, handsTurnAway(i) -> bool, handsLetGo(id) -> bool
//         handsSend(id, kind, t, { shifts: 1|2 }) -> job | null, handsSendAgain(id?) -> number sent
//         handsRecall(id) -> bool; handsQueueMax() -> 2; handsSendAgainPreview(id?) -> { count, ready, fee }; registerHandsRoute(key, probe) -> remove()
//         handsEmpty(id) -> units thrown away (the UI asks first: "Throw away 120 Oak Log?")
//         handsStoryHeard(id) -> level of the story told | 0 (N2, when the player hears it)
//         handsTalk(id) -> saved ordinary talk counter; never consumes an earned story
//         handsTalkInfo(id) -> { id, name, rar, jobName, lv, line, status, traits, jobs, suggest } | null
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
//   tam, log, hired, hrs, got, met, heard, open, rs }). rs: the Hands' own random stream (applicants, seeds).
//   list[i] = { id, n, r, sk, tr: [trait ids], cl (calling | null), key (named Hand | null), lv, xp (hours
//     into the level), job, pack: [[fam, t, n]] ('troph', i, n for a Trophy), last: { kind, t, shifts } | null (old saves default to one shift),
//     talk, st (stories heard), hired (ms), hrs (hours worked), got (units delivered), back (ms home) }
//   job adds fee, secs, kp/lp/physic (snapshot finds), queue:[{fee,seed}], q/qFee (remaining), linked.
//   start in the future is a paid rest; linked=false starts the overlap window during catch-up.
//   routes: { nan: true } preserves route milestones; other primary probes register without new save fields.
//   job = { kind, t, start, end, rate, seed, bo: [[pct, from, to, tag]] } (bo: Friendly and Felling Song
//     windows, fixed when a partner is sent), or null.
//   board.apps[i] = { id, n, r, sk, tr, cl, key, at, free }; board.next: ms of the next arrival (0 = not open yet).
//   hired / hrs / got: lifetime (58-deeds reads handsStats). met: named Legendary key -> ms. heard: stories heard.

let handsOpen, handsBeds, handsBedsAt, handsFree, handsList, handsGet, handsBoard, handsNextApp, handsHireCost,
  handsStatus, handsShare, handsShiftSecs, handsRate, handsPreview, handsSuggest, handsNodes, handsCanSend,
  handsHeroRate, handsTraits, handsName, handsRarName, handsSkillName, handsNodeName, handsLevelNeed, handsStoryDue,
  handsCampTrait, handsMealMult, handsMealBonus, campClock, handsStats, handsHire, handsTurnAway, handsLetGo,
  handsSend, handsSendAgain, handsEmpty, handsStoryHeard, handsTalk, handsTalkInfo, handsCatchUp, handsExclude, handsRollApp,
  handsTents, handsFee, handsUnpaid, handsRandomApps, handsLegendSpots, handsRecall, handsQueueMax, registerHandsRoute, handsSendAgainPreview;

{
  const T = HANDS_TUNE;
  registerState('hands', { v: 1, seq: 0, list: [], board: { apps: [], next: 0 }, pity: [0, 0, 0], tam: 0, log: [],
    hired: 0, hrs: 0, got: 0, met: {}, heard: 0, open: 0, rs: 0, routes: {} });
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
    if (!h.routes || typeof h.routes !== 'object') h.routes = {};
    h.list = h.list.filter(x => x && typeof x === 'object' && x.id);
    for (const x of h.list) {
      if (!HANDS_RAR.includes(x.r)) x.r = 'common';
      if (!Array.isArray(x.tr)) x.tr = [];
      if (!Array.isArray(x.pack)) x.pack = [];
      if (!(x.lv >= 1)) x.lv = 1;
      if (!(x.xp >= 0)) x.xp = 0;
      if (x.job && x.job.role === 'trade') { if (typeof handsTradeRepair === 'function') handsTradeRepair(x); }
      else if (x.job && !(x.job.end > 0 && x.job.rate >= 0 && x.job.kind)) x.job = null;
      if (x.job && x.job.role !== 'trade' && !Array.isArray(x.job.bo)) x.job.bo = [];
      if (x.job && x.job.role !== 'trade' && !Array.isArray(x.job.queue)) x.job.queue = [];
      if (x.job && x.job.role !== 'trade') syncQueue(x.job);
      for (const k of ['talk', 'st', 'hrs', 'got', 'back', 'sent']) if (!(x[k] >= 0)) x[k] = 0;
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
  handsOpen = () => !!T.on && !!S.camp && safe(() => campOpen(), false) && lvOf('hearth') >= T.openHearth && lvOf('tavern') >= 1;   // W1-E: Tents (2 free), not the Bunkhouse (economy-2 5)
  handsBedsAt = (bunk, hearth) => !(bunk >= 1) ? 0 : Math.max(0, Math.min(T.bedMax + Math.floor(bonus('handBedsMax')),
    (T.beds[Math.min(T.beds.length - 1, bunk)] || 0) + (hearth >= T.hallHearth ? T.hallBeds : 0) + Math.floor(bonus('handBeds'))));
  // Preserve purchased v5 Bunkhouse capacity; new saves and new builds use Tents.
  const ensureTents = () => {
    if (!handsOpen()) return;
    const b = S.camp.b;
    if (!(b.tent >= ECON.tentFree)) b.tent = Math.min(ECON.tentMax, Math.max(ECON.tentFree,
      (T.beds[Math.min(T.beds.length - 1, lvOf('bunk'))] || 0) + (lvOf('bunk') && lvOf('hearth') >= T.hallHearth ? T.hallBeds : 0), H().list.length));
  };
  handsTents = () => {
    ensureTents();
    return handsOpen() ? Math.max(0, Math.min(ECON.tentMax + Math.floor(bonus('handBedsMax')),
      lvOf('tent') + Math.floor(bonus('handBeds')))) : 0;
  };
  handsBeds = handsTents;
  on('campBuilt', e => { if (e.id === 'bunk' && handsOpen()) { ensureTents(); S.camp.b.tent = Math.max(lvOf('tent'), Math.min(ECON.tentMax, (T.beds[Math.min(T.beds.length - 1, e.lv)] || 0) + (lvOf('hearth') >= T.hallHearth ? T.hallBeds : 0))); } });
  handsFree = () => Math.max(0, handsTents() - H().list.length);
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
      if (x.tiers && !x.tiers.includes(t)) continue;
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
  handsShiftSecs = () => ECON.shiftH * 3600;
  handsQueueMax = () => ECON.queueMax;
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
    if (j && j.role === 'trade' && typeof handsTradeStatus === 'function') return handsTradeStatus(h, t);
    if (j && j.start > t) return { st: 'rest', label: 'Resting before the next shift', left: (j.start - t) / 1000, pct: 0, kind: j.kind, t: j.t, spot: 'fire' };
    if (j && j.end > t) return { st: 'out', label: `Out at the ${nodeName(j.kind, j.t)}`, left: (j.end - t) / 1000, pct: Math.min(1, Math.max(0, (t - j.start) / Math.max(1, j.end - j.start))), kind: j.kind, t: j.t, spot: null };
    if (j) return { st: 'back', label: 'Walking home', left: 0, pct: 1, kind: j.kind, t: j.t, spot: 'road' };
    if (h.pack.length) return { st: 'pack', label: 'Pack waits by the Storehouse', left: 0, pct: 1, kind: h.last && h.last.kind, t: h.last && h.last.t, spot: 'store' };
    const ph = campClock(t).phase, want = SPOT[h.sk];
    const spot = (ph === 'dawn' || ph === 'day') && want && lvOf(want) > 0 ? want : 'fire';
    const where = { store: 'By the Storehouse door', bench: 'At the woodpile', kitchen: 'At the Kitchen table', fire: 'At the fire' }[spot];
    return { st: 'camp', label: where, left: 0, pct: 0, kind: null, t: null, spot };
  };
  const atCamp = (h, at = now()) => !h.job || h.job.start > at || h.job.end <= at;
  handsCampTrait = id => T.on && H().list.some(h => atCamp(h) && has(h, id));
  handsMealMult = () => T.on && (handsCampTrait('cook') || H().list.some(h => h.cl === 'hearthcook')) ? 1 + T.cook : 1;
  handsMealBonus = () => T.on && H().list.some(h => h.cl === 'hearthcook') ? T.ashbyMeal : 0;
  addModifier('offline', () => handsCampTrait('story') ? 1 + T.story : 1);

  // ---------------- applicants ----------------
  // ECON-A (economy-2 4.1): the hire fee by rarity at the region you have reached (econHireFee); was foesGold(S.maxZone, hireFoes[r]).
  handsHireCost = app => app && (app.free || app.ret) ? 0 : Math.max(1, econHireFee(rIdx(app && app.r)));
  // Named Hands on the board are star spots: they never leave and do not count toward the waiting limit.
  const randApps = () => H().board.apps.filter(a => !a.key);
  handsRandomApps = () => randApps();
  handsLegendSpots = () => HANDS_LEGENDS.map(x => {
    const h = H().list.find(o => o.key === x.key), a = H().board.apps.find(o => o.key === x.key), route = HANDS_ROUTES[x.key] || {};
    return { key: x.key, n: x.n, sk: x.sk, about: x.about, hint: route.hint || '', state: h ? 'hired' : a ? 'board' : route.live === false ? 'later' : 'away', app: a || null };
  });
  const usedNames = () => new Set(H().list.map(x => x.n).concat(H().board.apps.map(x => x.n)));
  const usedKeys = () => new Set(H().list.map(x => x.key).concat(H().board.apps.map(x => x.key)).filter(Boolean));
  function rollRarity() {
    const p = H().pity;
    if (p[1] >= T.pity[1] - 1) return 3;
    const low = p[0] >= T.pity[0] - 1 ? 2 : 0;
    let x = rnd() * T.odds.slice(low, 4).reduce((a, b) => a + b, 0);
    for (let i = low; i < 4; i++) { x -= T.odds[i]; if (x < 0) return i; }
    return 3;
  }
  function makeApp(at) {
    const h = H(), r = rollRarity();
    for (let i = 0; i < 2; i++) h.pity[i] = r >= i + 2 ? 0 : h.pity[i] + 1;
    h.pity[2]++;
    // Word on the Road advances a documented fallback, never a missing profession.
    if (h.pity[2] >= T.pity[2]) {
      const next = HANDS_LEGENDS.filter(x => HANDS_ROUTES[x.key]?.fallback && !usedKeys().has(x.key) && !h.met[x.key])
        .sort((a, b) => HANDS_ROUTES[a.key].fallback - HANDS_ROUTES[b.key].fallback)[0];
      if (next) { arriveNamed(next, at, true); h.pity[2] = 0; }
    }
    // Keep retired duration traits readable in old saves, but do not roll new no-op or penalty-only traits.
    // C8: new Packmule rolls wait for a usable grade. Existing applicants/workers keep their IDs.
    const muleOpen = HANDS_SKILLS.some(sk => skillTierOpen(sk, 3));
    const pool = HANDS_TRAITS.filter(x => !['strong', 'owl', 'wander'].includes(x.id) && (x.id !== 'mule' || muleOpen)).map(x => x.id), tr = [];
    while (tr.length < T.traits[r] && pool.length) tr.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
    let n = ''; const used = usedNames();
    for (let g = 0; g < 20; g++) { n = pick(HANDS_FIRST) + ' ' + pick(HANDS_TRADE); if (!used.has(n)) break; }
    h.seq = (h.seq | 0) + 1;
    return { id: 'h' + h.seq, n, r: HANDS_RAR[r], sk: pick(HANDS_SKILLS), tr, cl: null, key: null, at, free: 0 };
  }
  handsRollApp = () => makeApp(now());
  const addApp = (app, quiet) => { H().board.apps.push(app); emit('handsArrive', { app, quiet: !!quiet }); };
  // Arrivals up to t (wall clock). The board holds maxWait; while full the clock waits.
  function arrivals(t, quiet) {
    const b = H().board;
    if (!b.next) return 0;
    let n = 0;
    for (let g = 0; g < 50 && b.next <= t && randApps().length < T.maxWait; g++) { addApp(makeApp(b.next), quiet); b.next += period(); n++; }
    return n;
  }
  const freed = wasFull => { const b = H().board; if (wasFull) b.next = Math.max(b.next, now() + period()); };
  handsBoard = () => {
    const free = handsFree();
    return H().board.apps.map((app, i) => {
      const cost = handsHireCost(app), sg = handsSuggest(app) || { kind: 'wood', t: 1 };
      const why = !handsOpen() ? 'Hands are not open yet.' : !free ? `All ${handsTents()} tents are taken. Let a gatherer go to make room.` : S.gold < cost ? `Needs ${fmt(cost)} gold.` : '';
      return { i, app, cost, star: !!app.key, free: !!app.free, rate: handsRate(Object.assign({ lv: 1 }, app), sg.kind, sg.t), kind: sg.kind, t: sg.t, afford: S.gold >= cost, can: { ok: !why, why } };
    });
  };
  handsNextApp = () => handsOpen() && H().board.next && randApps().length < T.maxWait ? Math.max(0, H().board.next - now()) : null;
  const newHand = (app, t) => ({ id: app.id, n: app.n, r: app.r, sk: app.sk, tr: app.tr.slice(), cl: app.cl || null, key: app.key || null,
    lv: 1, xp: 0, job: null, pack: [], last: null, talk: 0, st: 0, hired: t, hrs: 0, got: 0, back: 0, sent: 0 });
  handsHire = i => {
    const h = H(), app = h.board.apps[i];
    if (!app || !handsOpen() || !handsFree()) return null;
    const cost = handsHireCost(app);
    if (S.gold < cost) return null;
    S.gold -= cost; econSpend('hire', cost);
    const wasFull = randApps().length >= T.maxWait;
    h.board.apps.splice(i, 1); freed(wasFull);
    const x = newHand(app, now());
    if (app.ret) { for (const k of ['lv', 'xp', 'hrs', 'got', 'st', 'talk', 'sent']) if (app.ret[k] >= 0) x[k] = app.ret[k]; x.last = app.ret.last || null; }
    h.list.push(x); h.hired = (h.hired | 0) + 1;
    if (x.key && !h.met[x.key]) h.met[x.key] = now();
    emit('handsHire', { id: x.id, r: x.r, free: !!app.free });
    save();
    return x;
  };
  handsTurnAway = i => {
    const h = H(), app = h.board.apps[i]; if (!app || app.key) return false;
    const wasFull = randApps().length >= T.maxWait;
    h.board.apps.splice(i, 1); freed(wasFull);
    emit('handsTurnAway', { app }); save();
    return true;
  };
  handsLetGo = id => {
    const h = H(), x = handsGet(id); if (!x || x.job || x.pack.length) return false;
    h.list.splice(h.list.indexOf(x), 1);
    // A named gatherer goes back to the Tavern's star spot with their level; hiring them again is free.
    if (x.key) h.board.apps.push({ id: x.id, n: x.n, r: x.r, sk: x.sk, tr: x.tr.slice(), cl: x.cl || null, key: x.key, at: now(), free: 1,
      ret: { lv: x.lv, xp: x.xp, hrs: x.hrs, got: x.got, st: x.st, talk: x.talk, last: x.last, sent: x.sent } });
    emit('handsLetGo', { id, n: x.n }); save();
    return true;
  };

  // ---------------- shifts ----------------
  // W1-E (economy-2 4.2): a shift's fee is paid at send. Grade = the node's tier. Tam's first shifts are free.
  handsFee = (x, kind, t) => !x ? 0 : x.key === 'tam' && (x.sent | 0) < ECON.tamFree ? 0 : econShiftFee(t, x.lv || 1);
  const queueFees = (x, kind, t, count) => Array.from({ length: count }, (_, i) => x.key === 'tam' && (x.sent | 0) + i < ECON.tamFree ? 0 : econShiftFee(t, x.lv || 1));
  handsCanSend = (id, kind, t, opts = {}) => {
    const x = handsGet(id), shifts = opts.shifts === undefined ? 1 : opts.shifts;
    const no = why => ({ ok: false, why, fee: 0, shifts });
    if (!T.on || !x || !handsOpen()) return no('Gatherers are not available.');
    if (!Number.isInteger(shifts) || shifts < 1 || shifts > handsQueueMax()) return no('Choose one or two shifts.');
    if (x.job) return no(x.n + ' is already on a job.');
    if (x.pack.length) return no(x.n + "'s pack waits for room in the Storehouse.");
    if (!CRAFT_NODES[kind] || !Number.isInteger(t) || !(t >= 1 && t <= 5)) return no('Pick a node.');
    if (!open(kind, t)) return no('Your hero has not opened this node yet.');
    const fee = queueFees(x, kind, t, shifts).reduce((a, b) => a + b, 0);
    return { ok: S.gold >= fee, why: S.gold >= fee ? '' : 'Needs ' + fmt(fee - Math.floor(S.gold)) + ' more gold for the shifts.', fee, shifts };
  };
  // Idle at camp and too poor for the next shift: they wait, they never leave.
  handsUnpaid = x => {
    if (!x || x.job || x.pack.length) return false;
    const w = (x.last && open(x.last.kind, x.last.t) ? x.last : handsSuggest(x));
    return !!w && S.gold < queueFees(x, w.kind, w.t, w.shifts || 1).reduce((a, b) => a + b, 0);
  };
  const out = (x, t) => !!x.job && x.job.start <= t && x.job.end > t;
  function syncQueue(j) { j.q = (j.queue || []).length; j.qFee = (j.queue || []).reduce((a, q) => a + q.fee, 0); }
  function linkJob(x, job) {
    if (job.role === 'trade') return;
    const at = job.start;
    if (has(x, 'friendly')) {
      const y = H().list.find(o => o !== x && has(o, 'friendly') && o.job && o.job.role !== 'trade' && o.job.linked !== false && out(o, at) && !o.job.bo.some(b => b[3] === 'f' && b[2] > at));
      if (y) { const e = Math.min(job.end, y.job.end); job.bo.push([T.friendly, at, e, 'f', y.id]); y.job.bo.push([T.friendly, at, e, 'f', x.id]); }
    }
    const wood = k => skillOf(k) === 'wood';
    if (x.cl === 'felling') {
      for (const o of H().list) if (o !== x && o.job && o.job.role !== 'trade' && o.job.linked !== false && out(o, at) && wood(o.job.kind)) o.job.bo.push([T.felling, at, Math.min(job.end, o.job.end), 'b', x.id]);
    } else if (wood(job.kind)) {
      const b = H().list.find(o => o !== x && o.cl === 'felling' && o.job && o.job.role !== 'trade' && o.job.linked !== false && out(o, at));
      if (b) job.bo.push([T.felling, at, Math.min(job.end, b.job.end), 'b', b.id]);
    }
    job.linked = true;
  }
  handsSend = (id, kind, t, opts = {}) => {
    const can = handsCanSend(id, kind, t, opts); if (!can.ok) return null;
    const x = handsGet(id), at = now(), secs = handsShiftSecs(x, kind, at);
    const fees = queueFees(x, kind, t, can.shifts), seeds = fees.map(() => (rnd() * 2147483647) | 0);
    const job = { kind, t, shifts: can.shifts, start: at, end: at + secs * 1000, secs, rate: handsRate(x, kind, t, at), seed: seeds[0], bo: [], fee: fees[0],
      kp: keenP(x), lp: luckyP(x), physic: x.cl === 'physic', queue: fees.slice(1).map((fee, i) => ({ fee, seed: seeds[i + 1] })) };
    syncQueue(job); linkJob(x, job);
    if (can.fee > 0) { S.gold -= can.fee; econSpend('shift', can.fee); }
    x.sent = (x.sent | 0) + can.shifts;
    x.job = job; x.last = { kind, t, shifts: can.shifts };
    emit('handsSend', { id, kind, t, end: job.end, secs, shifts: can.shifts }); save(); return job;
  };
  function againPlan(id) {
    const ready = [];
    for (const x of H().list) {
      if ((id !== undefined && x.id !== id) || x.job || x.pack.length) continue;
      const w = x.last && open(x.last.kind, x.last.t) ? x.last : handsSuggest(x);
      if (!w) continue;
      const shifts = Math.max(1, Math.min(handsQueueMax(), w.shifts | 0 || 1));
      const can = handsCanSend(x.id, w.kind, w.t, { shifts });
      // Insufficient funds is the only reason to keep an unavailable row in the quote.
      if (!can.ok && !(can.fee > S.gold)) continue;
      ready.push({ id: x.id, kind: w.kind, t: w.t, shifts, fee: can.fee });
    }
    ready.sort((a, b) => a.fee - b.fee);
    let gold = S.gold;
    const selected = ready.filter(x => { if (gold < x.fee) return false; gold -= x.fee; return true; });
    return { ready: ready.length, selected, fee: selected.reduce((sum, x) => sum + x.fee, 0) };
  }
  handsSendAgainPreview = id => { const p = againPlan(id); return { count: p.selected.length, ready: p.ready, fee: p.fee }; };
  handsSendAgain = id => {
    let n = 0;
    for (const x of againPlan(id).selected) if (handsSend(x.id, x.kind, x.t, { shifts: x.shifts })) n++;
    return n;
  };
  // The haul of a finished job, from its stored numbers only (same seed, same haul).
  const payOf = (x, j) => {
    const len = Math.max(0, j.end - j.start), hrs = len / HOUR, r = rng(j.seed | 0);
    let f = 1;
    for (const [p, a, b] of j.bo || []) f += p * Math.max(0, Math.min(b, j.end) - Math.max(a, j.start)) / Math.max(1, len);
    const u = j.rate * hrs * f;
    let n = Math.floor(u) + (r() < u % 1 ? 1 : 0);
    const lines = [];
    const kp = j.kp === undefined ? keenP(x) : j.kp;
    if (kp > 0 && n > 0) {
      const e = n * kp, up = Math.floor(e) + (r() < e % 1 ? 1 : 0);
      if (up > 0) { if (j.t < 5) { n -= up; lines.push([j.kind, j.t + 1, up]); } else lines.push([j.kind, 5, up]); }
    }
    if (n > 0) lines.unshift([j.kind, j.t, n]);
    if ((j.physic === undefined ? x.cl === 'physic' : j.physic) && u > 0) { const e = u * T.physic, m = Math.floor(e) + (r() < e % 1 ? 1 : 0); if (m > 0) lines.push(['herb', j.t, m]); }
    const lp = (j.lp === undefined ? luckyP(x) : j.lp) * Math.min(1, len / Math.max(1, (j.secs || len / 1000) * 1000));
    if (lp > 0 && r() < lp) lines.push(['troph', Math.floor(r() * CRAFT_TROPHIES.length), 1]);
    return { lines, hrs };
  };
  const gainXp = (x, hrs, quiet, at) => {
    let m = has(x, 'old') ? 1 + T.oldHand : 1;
    if (H().list.some(o => o !== x && atCamp(o, at) && has(o, 'chatter'))) m *= 1 + T.chatter;
    x.xp += hrs * m;
    while (x.lv < T.lvMax && x.xp >= handsLevelNeed(x.lv)) { x.xp -= handsLevelNeed(x.lv); x.lv++; emit('handsLevel', { id: x.id, lv: x.lv, quiet: !!quiet }); }
    if (x.lv >= T.lvMax) x.xp = 0;
  };
  function refund(x, entries, reason, away) {
    const fee = entries.reduce((a, q) => a + q.fee, 0);
    if (!entries.length) return;
    S.gold += fee; econSpend('shift', -fee); x.sent = Math.max(0, (x.sent | 0) - entries.length);
    const ev = { id: x.id, n: x.n, fee, shifts: entries.length, reason, away: !!away };
    emit('handsRefund', ev); if (away) awayRefunds.push(ev);
  }
  function finishJob(x, away) {
    const h = H(), j = x.job, { lines, hrs } = payOf(x, j);
    x.job = null; x.back = j.end; x.last = { kind: j.kind, t: j.t, shifts: j.shifts || 1 };
    x.pack.push(...lines.map(l => l.slice())); x.hrs += hrs; h.hrs = (h.hrs || 0) + hrs;
    gainXp(x, hrs, away, j.end);
    const ev = { id: x.id, n: x.n, kind: j.kind, t: j.t, lines, away: !!away, at: j.end };
    h.log.push({ id: x.id, n: x.n, kind: j.kind, t: j.t, lines, at: j.end });
    if (h.log.length > T.logMax) h.log.splice(0, h.log.length - T.logMax);
    emit('handsBack', ev); unload();
    const queue = j.queue || [];
    if (queue.length) {
      if (x.pack.length) refund(x, queue, 'the Storehouse is full', away);
      else {
        const next = queue[0], start = j.end + 30 * 60e3, secs = j.secs || (j.end - j.start) / 1000;
        x.job = { ...j, start, end: start + secs * 1000, secs, seed: next.seed, fee: next.fee, bo: [], linked: false, queue: queue.slice(1) }; syncQueue(x.job);
      }
    }
    return ev;
  }
  // Starts and returns in time order keep overlap, XP and pack order identical live and away.
  handsCatchUp = (t = now(), away = false) => {
    const back = [], blockedTrade = new Set();
    if (!Number.isFinite(t) || t < 0) return back;
    for (const x of H().list) if (x.job && x.job.role === 'trade' && typeof handsTradeRepair === 'function') handsTradeRepair(x);
    for (;;) {
      const due = H().list.filter(x => x.job && !blockedTrade.has(x) && (x.job.role !== 'trade' && x.job.linked === false ? x.job.start : x.job.end) <= t)
        .sort((a, b) => (a.job.role !== 'trade' && a.job.linked === false ? a.job.start : a.job.end) - (b.job.role !== 'trade' && b.job.linked === false ? b.job.start : b.job.end))[0];
      if (!due) break;
      if (due.job.role === 'trade') {
        if (typeof handsTradeFinish !== 'function') break;
        if (!handsTradeFinish(due, away, t)) blockedTrade.add(due);
      } else if (due.job.linked === false) linkJob(due, due.job); else back.push(finishJob(due, away));
    }
    unload(); return back;
  };
  handsRecall = id => {
    const x = handsGet(id); if (!x || !x.job) return false;
    const at = now(); handsCatchUp(at, false); const j = x.job; if (!j) return false;
    if (j.role === 'trade') return typeof handsTradeRecall === 'function' && handsTradeRecall(x, at);
    const waiting = j.start > at, queue = (j.queue || []).slice();
    if (waiting) queue.unshift({ fee: j.fee || 0 });
    refund(x, queue, 'you recalled them', false); j.queue = []; syncQueue(j);
    for (const other of H().list) if (other !== x && other.job) for (const b of other.job.bo || []) {
      if (b[4] === id || (!b[4] && ((b[3] === 'b' && x.cl === 'felling') || (b[3] === 'f' && has(x, 'friendly'))))) b[2] = Math.min(b[2], at);
    }
    if (waiting) x.job = null;
    else { j.secs = j.secs || (j.end - j.start) / 1000; j.end = at; finishJob(x, false); }
    emit('handsRecall', { id }); save(); return true;
  };
  function unload() {
    const h = H();
    const full = h.list.filter(x => x.pack.length).sort((a, b) => a.back - b.back);
    for (const x of full) {
      for (let i = 0; i < x.pack.length;) {
        const [f, t, n, source] = x.pack[i];
        let got = 0;
        if (f === 'troph') got = typeof addTrophy === 'function' ? addTrophy(t, n, 'hands') : 0;
        else if (S.mats[f]) got = stashAdd(f, t, n, 'parcel');
        else { x.pack.splice(i, 1); continue; }   // a family this build does not know: drop the line
        if (got > 0 || !(n > 0)) {
          x.pack.splice(i, 1);
          if (f !== 'troph' && source !== 'trade-refund') { x.got += got; h.got = (h.got || 0) + got; }
          emit(source === 'trade-refund' ? 'handsTradeCargoBack' : 'handsUnload', { id: x.id, fam: f, t, n: got });
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
  // C2: short camp conversations. Authored story chapters remain available for C6.
  handsTalk = id => {
    const x = handsGet(id); if (!x) return 0;
    x.talk = Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Number.isFinite(x.talk) ? Math.floor(x.talk) : 0) + 1);
    save(); return x.talk;
  };
  handsTalkInfo = id => {
    const x = handsGet(id); if (!x) return null;
    const status = handsStatus(x), named = x.key === HANDS_TAM.key ? HANDS_TAM : LEG[x.key];
    const work = {
      wood: 'My axe is ready. Point me toward a grove.',
      mine: 'My pick is ready. Tell me which vein needs working.',
      forage: 'I know what grows by the path. What does the camp need?',
      any: 'I know a little of every trade. Show me what needs doing.'
    }[x.sk] || 'Tell me what the camp needs.';
    const lines = [work];
    if (x.last) lines.push(`Last time I worked at the ${nodeName(x.last.kind, x.last.t)}.`);
    lines.push(campClock().phase === 'night' ? 'The fire is warm. There is room beside me.' : 'Good to see you back at camp.');
    const n = Math.max(0, (Number.isFinite(x.talk) ? Math.floor(x.talk) : 0) - 1);
    const line = status.role === 'trade' ? x.n + ': ' + status.label + '.'
      : status.st === 'pack' ? 'My pack is still full. Make room in the Storehouse before I head out again.'
      : status.st === 'rest' ? 'A little rest, then I will head back to the node.'
      : status.st === 'out' ? `${x.n} is working at the ${nodeName(status.kind, status.t)}.`
      : status.st === 'back' ? `${x.n} is on the way home.` : lines[n % lines.length];
    const jobs = handsNodes(x).filter(o => o.own).map(o => Object.assign({}, o, {
      name: nodeName(o.kind, o.t), preview: handsPreview(x, o.kind, o.t), can: handsCanSend(id, o.kind, o.t)
    }));
    const suggested = handsSuggest(x);
    const suggest = suggested && jobs.some(o => o.kind === suggested.kind && o.t === suggested.t) ? suggested
      : jobs.length ? { kind: jobs[0].kind, t: jobs[0].t, why: 'A node for your profession.' } : null;
    return { id: x.id, name: x.n, rar: handsRarName(x), jobName: handsSkillName(x), lv: x.lv,
      line, about: named && named.about || '', status, traits: handsTraits(x), jobs, suggest };
  };
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
    ensureTents();
    h.open = h.open || t;
    if (!h.tam && handsFree() > 0) {
      h.tam = 1;
      const tam = newHand({ id: 'tam', n: HANDS_TAM.n, r: HANDS_TAM.r, sk: HANDS_TAM.sk, tr: HANDS_TAM.tr, cl: null, key: HANDS_TAM.key }, t);
      h.list.push(tam); h.hired = (h.hired | 0) + 1;
      emit('handsHire', { id: tam.id, r: tam.r, free: true });
      toast(quiet ? 'Tam, Hesketh\'s nephew, has a tent at camp. He gathers for the heroes. Hire more gatherers at the Tavern board.'
        : 'Tam, Hesketh\'s nephew, comes to the fire. "Uncle said the Lanternbearer\'s lamp catches." He takes a tent and gathers for the heroes.', 'good', icon, quiet ? 'normal' : 'high');
    }
    if (!h.board.next) { h.board.next = t + period(); if (randApps().length < T.maxWait) addApp(makeApp(t), quiet); }
    emit('handsOpen', { quiet: !!quiet });
  }
  const routeProbes = {};
  registerHandsRoute = (key, probe) => { routeProbes[key] = probe; return () => { if (routeProbes[key] === probe) delete routeProbes[key]; }; };
  function arriveNamed(x, at, quiet) {
    if (usedKeys().has(x.key)) return false;
    H().seq = (H().seq | 0) + 1;
    addApp({ id: 'h' + H().seq, n: x.n, r: 'legendary', sk: x.sk, tr: (x.tr || ['steady', 'old']).slice(), cl: x.cl || null, key: x.key, at, free: 0 }, quiet);
    H().met[x.key] = at; return true;
  }
  function later(quiet = false) {
    for (const x of HANDS_LEGENDS) {
      const r = HANDS_ROUTES[x.key];
      if (!r || r.live === false || usedKeys().has(x.key)) continue;
      const primary = H().routes[x.key] || safe(() => routeProbes[x.key] && routeProbes[x.key](), false)
        || (x.key === 'loy' && lvOf('loom') >= 2) || (x.key === 'ashby' && lvOf('kitchen') >= 1);
      if (primary || (r.fallback && S.maxZone >= r.fallback) || H().met[x.key]) arriveNamed(x, now(), quiet);
    }
  }
  on('kill', e => {
    if (e && e.mob && e.mob.boss && String(e.mob.key || '').replace(/\d+$/, '') === 'golem') {
      if (!H().routes) H().routes = {}; H().routes.nan = true;
    }
  });

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
    if (!handsOpen()) return;
    if (!H().tam || !H().board.next) openHands(q);
    const t = now();
    const got = arrivals(t, q);
    if (got && !q) toast(got > 1 ? `${got} applicants are waiting at the Tavern.` : 'An applicant is waiting at the Tavern.', 'good', icon, 'low');
    later(q);
    const back = handsCatchUp(t, false);
    for (const e of back) toast(waits(e.id) ? `${backText(e)} The pack waits by the Storehouse.` : backText(e), 'good', e.lines[0] && e.lines[0][0] !== 'troph' ? { mat: [e.lines[0][0], e.lines[0][1]] } : icon, 'low');
    if (back.length) save();
  });
  let awayBack = [], awayApps = 0, awayRefunds = [];
  on('away', r => {
    init();
    awayBack = []; awayApps = 0; awayRefunds = [];
    if (!T.on) return;
    if (!handsOpen()) return;
    const priorApps = new Set(H().board.apps.map(a => a.id));
    if (!H().tam || !H().board.next) openHands(true);
    const t = now();
    arrivals(t, true);
    later(true);
    awayApps = H().board.apps.filter(a => !priorApps.has(a.id)).length;
    awayBack = handsCatchUp(t, true);
  });
  registerAwayLine(() => {
    const res = [];
    for (const e of awayRefunds) res.push({ icon, group: 'Gatherers', txt: e.n + ': ' + e.shifts + ' queued shift(s) refunded because ' + e.reason + ' (' + fmt(e.fee) + ' gold).' });
    awayRefunds = [];
    // C14: a queued return is one line per worker, with both shifts' actual haul.
    const workers = new Map();
    for (const e of awayBack) {
      if (!workers.has(e.id)) workers.set(e.id, { id: e.id, n: e.n, count: 0, lines: new Map() });
      const w = workers.get(e.id); w.count++;
      for (const [f, t, n] of e.lines) { const key = f + ':' + t, line = w.lines.get(key); if (line) line[2] += n; else w.lines.set(key, [f, t, n]); }
    }
    for (const w of workers.values()) res.push({ icon, group: 'Gatherers',
      txt: `${w.n} finished ${w.count} shift${w.count === 1 ? '' : 's'}` + (w.lines.size ? ': +' + [...w.lines.values()].map(lineText).join(', +') + '.' : '.'),
      sub: waits(w.id) ? `${w.n}'s pack waits: Storehouse full.` : '', go: () => emit('campGoto', { tab: 'world', view: 'tav', sel: '#sec-hands-crew' }) });
    if (awayApps) res.push({ icon, group: 'Tavern', txt: awayApps > 1 ? `${awayApps} new applicants are waiting at the Tavern.` : 'A new applicant is waiting at the Tavern.', go: () => emit('campGoto', { tab: 'world', view: 'tav', sel: '#sec-hands' }) });
    const t = now(), stillOut = H().list.filter(x => out(x, t));
    if (res.length && stillOut.length) res.push({ icon, group: 'Gatherers', txt: `${stillOut.length} still out`, sub: stillOut.map(x => `${x.n}: ${fmtTime((x.job.end - t) / 1000)}`).join(' · ') });
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
