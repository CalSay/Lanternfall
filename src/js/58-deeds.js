// 58-deeds: achievements core (docs/design/achievements.md, task AC2). Data: 23-data-deeds.js.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Tracks read numbers the save already keeps wherever one exists; new counters live in S.deeds.n,
// S.deeds.g and S.deeds.rec and only rise. Tiers are checked once a second, a quarter of the tracks
// per check (each track every 4 s). Tiers never go down. Only Gold and Everflame tiers pay a bonus,
// capped per key by DEED_CAP (deedBonus). Milestone feats keep their permanent rewards and
// 10 points each. Their reward sums multiply with track bonuses; other feats give no power. Titles join codexTitles() (ids 'a_...', chosen in S.codex.title, local only).
// Nothing here reads or writes the online layer except s_crowd, which only reads online.peers.
//
// Tracks that wait on unmerged systems are defined but hidden; a runtime probe lights them up when
// their save field appears (H3 S.store, N1 S.hands, K12 S.kitchen, F2 S.bond, O1 S.oath,
// R2 REGIONS[1].plugged, F1 offSlot). A later system can also hand its exact number over with
// deeds.source(trackId, fn) and its events with deeds.count(key, n).
//
// API (for AC3 UI, AC4 looks, AC5 the Trophy Wall, AC6 chapters):
//   deedBonus(key) -> capped bonus (fraction; seconds for deepOil)      wearGet(slot) -> look id | null
//   deeds.tracks(group?) -> [row]   row: { id, g, n, what, tier, v, next, need, pct, left, label, live, lock,
//                                           stars, bonus, bonusTxt, since, kind, steps }
//   deeds.track(id), deeds.tierName(tier) ("Gold", "Everflame ★3"), deeds.tierLabel(id, tier) ("Slayer III")
//   deeds.groups() -> [{ id, n, ic, lv (0/1/2), gold, ever, look, tracks, atGold, atEver, fresh }]
//   deeds.feats() -> [{ id, n, needs, about, rar, rarTxt, title, look, legacy, bonusTxt, got, at, parts: [{ n, have, need }], pct, live, pts }]
//   deeds.milestones() -> fixed Codex rows; deeds.milestoneBonus(key) -> uncapped milestone reward sum
//   deeds.secrets() -> [{ id, got, at, n, riddle, title, look, live }]   (n and riddle only when shown)
//   deeds.points(), deeds.ladder() -> [{ at, title, look, wall, got }], deeds.next() -> next ladder row | null
//   deeds.wallStage() -> 0..3, deeds.wall() -> pinned ids, deeds.pin(ids) (at most 12)
//   deeds.looks(slot?) -> [{ id, slot, n, src, srcTxt, got }], deeds.owned(id), deeds.wear(slot, id) -> bool,
//     deeds.showHelm(on) (hats hide helms unless on), deeds.frame() -> worn portrait frame id | null
//   deeds.near(n) -> near tiers [{ id, label, pct }], deeds.follow(id | null), deeds.nudge(on)
//   deeds.recent(n) -> [{ key, kind, id, tier, at, txt }], deeds.isNew(), deeds.seen()
//   deeds.chapterStep(chId, step, { quiet }) -> bool (AC6), deeds.chapter(chId) -> { step, done }
//   deeds.count(key, n) (counters: boss, meal, ...), deeds.source(trackId, fn), deeds.check(full, quiet)
//   deeds.caps() -> [{ key, raw, cap, v }], deeds.setNum('letters' | 'sci'), deeds.stats() (stats wall numbers)
// Events: deedTier { id, tier, quiet }, deedGroup { id, lv, quiet }, deedFeat { id, quiet }, deedSecret { id },
//   deedPoints { pts, gain }, deedMilestone { at }, deedLook { slot, id }, deedChapter { id, step }, deedsInit { tiers, pts }.
//   Listened (UI): deedsOpen { view, id } is emitted by the Next Up goal's Go.
// Save: registerState('deeds', spec 8.1) plus last (time of the last tier).

let deeds, deedBonus, wearGet;
{
  registerState('deeds', {
    v: 1, init: 0, tier: {}, at: {}, feat: {}, sec: {}, ch: {}, grp: {}, mil: {},
    n: { crit: 0, parry: 0, dodge: 0, intr: 0, abil: 0, dmg: 0, taken: 0, heal: 0, boss: 0, ess: 0, troph: 0, glint: 0,
      up: 0, ref: 0, trans: 0, meal: 0, dare: 0, weekly: 0, embers: 0, forged: 0 },
    g: {},
    rec: { hit: 0, hitZ: 0, hitAt: 0, fine: 0, epic: false, ks: {} },
    since: {}, sx: {}, pts: 0, seen: 0, last: 0,
    wear: { cape: null, hat: null, lamp: null, flame: null, aura: null, critter: null, trail: null, frame: null, helm: 0 },
    wall: [], follow: null, nudge: 1
  });
  const T = DEED_TUNE;
  const DS = () => S.deeds;
  const N = () => DS().n;
  const now = () => Date.now();
  const num = v => typeof v === 'number' && isFinite(v) ? v : 0;
  const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };
  const keys = o => o && typeof o === 'object' ? Object.keys(o).length : 0;
  const TR = {}; for (const t of DEED_TRACKS) TR[t.id] = t;
  const GR = {}; for (const g of DEED_GROUPS) GR[g.id] = g;
  const MILESTONES = DEED_FEATS.filter(f => f.legacy);
  const MSUM = {};
  const MNAME = { keen: 'crit damage', dmg: 'damage', xp: 'hero XP', skillXp: 'skill XP', gatherSpeed: 'gather speed', crit: 'crit chance', essence: 'essence chance', offline: 'away gains' };
  const milestoneText = f => `+${+(f.bonus[1] * 100).toFixed(1)}% ${MNAME[f.bonus[0]]}`;
  const FE = {}; for (const f of DEED_FEATS) FE[f.id] = f;
  const SE = {}; for (const s of DEED_SECRETS) SE[s.id] = s;
  const LK = {}; for (const l of DEED_LOOKS) LK[l.id] = l;
  const CH = {}; for (const c of DEED_CHAPTERS) CH[c.id] = c;
  const GATHER = ['ore', 'crystal', 'wood', 'fibre', 'herb', 'pearl', 'fish'];

  // ---------------- waiting systems: runtime probes (a later file's `let` throws in its TDZ: safe) ----------------
  const WAIT = {
    H3: () => !!S.store && typeof S.store === 'object',
    N1: () => !!S.hands && typeof S.hands === 'object',
    K12: () => !!S.kitchen && typeof S.kitchen === 'object',
    N1K12: () => WAIT.N1() && WAIT.K12(),
    R2: () => !!(REGIONS[1] && REGIONS[1].plugged),
    R3: () => REGIONS.length >= 3,
    O1: () => !!S.oath && typeof S.oath === 'object'
  };
  const waitOk = w => !w || safe(() => !!WAIT[w](), false);
  // Tiers that open with later content (lock text in the data).
  const LOCK_OPEN = {
    'zones:4': () => REGIONS.length >= 3,
    'naturalist:4': () => WAIT.R2(),
    'crowns:3': () => WAIT.R2(),
    'crowns:4': () => REGIONS.length >= 3,
    'stock:4': () => WAIT.H3()
  };
  const lockTxt = (t, tier) => {
    if (!t.lock) return '';
    for (let k = Math.min(tier, 4); k >= 1; k--) {
      const l = t.lock[k]; if (l && !safe(() => !!LOCK_OPEN[t.id + ':' + k](), false)) return l;
    }
    return '';
  };

  // ---------------- small readers ----------------
  const sumArr = a => { let s = 0; if (Array.isArray(a)) for (let i = 0; i < a.length; i++) s += num(a[i]); return s; };
  const sumVals = o => { let s = 0; if (o && typeof o === 'object') for (const k in o) s += num(o[k]); return s; };
  const gRow = fam => { const g = DS().g; if (!Array.isArray(g[fam])) g[fam] = [0, 0, 0, 0, 0]; return g[fam]; };
  const sumG = fam => sumArr(DS().g[fam]);
  const skillLv = k => S.skills[k] ? num(S.skills[k].lv) : 0;
  const campLv = id => typeof campLevel === 'function' && S.camp ? num(campLevel(id)) : 0;
  const lightHours = () => S.stats ? (num(S.stats.played) + num(S.stats.away)) / 3600 : 0;
  const sealFloor = () => typeof DEEP_TUNE === 'object' ? DEEP_TUNE.sealFloor : 15;
  const trialSeals = () => { const h = S.deep && S.deep.trial && S.deep.trial.hist; let n = 0; if (h) for (const k in h) if (num(h[k]) >= sealFloor()) n++; return n; };
  const zoneStars = z => masteryApi.starsFor(num(S.mastery.zones[z]));
  const hollowZones = () => REGIONS[0].z1;
  function elders() {
    // Elder kinds beaten: each distinct zone kind whose boss has fallen (a zone below maxZone), plus
    // each Great Lantern boss (the Fenmother, the Fogbound). The placeholder Coast reuses the Hollow's kinds.
    let mask = 0, n = 0;
    const top = Math.min(S.maxZone - 1, REGIONS[REGIONS.length - 1].z1);
    for (let z = 1; z <= top; z++) { const ti = zoneType(z); if (ti < 31 && !(mask & (1 << ti))) { mask |= 1 << ti; n++; } }
    return n + lanternsLitAt(S.maxZone);
  }
  const pagesOf = keysList => { let n = 0; for (const k of keysList) n += masteryApi.tierFor(num(S.mastery.types[k])); return n; };
  const allTypeKeys = () => TYPES.map(t => t.key);
  const hollowTypeKeys = () => REGIONS[0].types.map(i => TYPES[i].key);
  // the Stars (57e-stars): found and learned
  const starsN = k => (S.stars && S.stars[k] && typeof S.stars[k] === 'object' ? Object.keys(S.stars[k]).filter(id => typeof STARS === 'object' && STARS[id]).length : 0);
  const tiersByLadder = r => r >= 7 ? 4 : r >= 5 ? 3 : r >= 3 ? 2 : r >= 1 ? 1 : 0;
  const skillUnits = (skill, t) => { let s = 0; for (const f of GATHER) if (DS().g[f] && safe(() => skillOf(f), '') === skill) s += num(DS().g[f][t - 1]); return s; };
  const seamLadder = skill => { let k = 0; if (skillUnits(skill, 2) >= 1e3) k = 1; else return 0; if (skillUnits(skill, 3) >= 1e3) k = 2; else return k; if (skillUnits(skill, 4) >= 1e3) k = 3; else return k; if (skillUnits(skill, 5) >= 1e4) k = 4; return k; };
  const fineOf = it => {
    if (!it || it.u) return 0;
    const r = it.r === 'epic' || it.r === 'legendary' ? 3 : it.r === 'rare' ? 2 : it.r === 'uncommon' ? 1 : 0;
    return r >= 3 && num(it.t) >= 5 && num(it.plus) >= 10 ? 4 : r;
  };
  const handsInfo = () => {
    const h = S.hands || {}, f = safe(() => typeof handsStats === 'function' ? handsStats() : null, null);
    return { hired: f ? num(f.hired) : Math.max(num(h.hired), Array.isArray(h.list) ? h.list.length : 0), hours: f ? num(f.hours) : num(h.hrs) };
  };

  // cur(track) -> the number its tiers read. A later system can replace it with deeds.source(id, fn).
  const SRC = {};
  const CUR = {
    slayer: () => S.totalKills, champs: () => num(S.craft && S.craft.champ), bosses: () => num(S.stats && S.stats.bosses) + N().boss,
    crits: () => N().crit, bighit: () => DS().rec.hit, damage: () => N().dmg, parry: () => N().parry, intr: () => N().intr,
    abil: () => N().abil, taps: () => num(S.stats && S.stats.taps),
    zones: () => S.maxZone, level: () => S.L, survey: () => masteryApi.totalStars(), naturalist: () => pagesOf(allTypeKeys()),
    crowns: elders, light: lightHours,
    gold: () => S.totalGold, essence: () => N().ess, curator: () => keys(S.found), trophies: () => N().troph,
    mine: () => skillLv('mine'), wood: () => skillLv('wood'), forage: () => skillLv('forage'),
    g_ore: () => sumG('ore'), g_crystal: () => sumG('crystal'), g_wood: () => sumG('wood'), g_fibre: () => sumG('fibre'), g_herb: () => sumG('herb'),
    s_mine: () => seamLadder('mine'), s_wood: () => seamLadder('wood'), s_forage: () => seamLadder('forage'),
    finds: () => num(S.tools && S.tools.finds), glint: () => N().glint,
    tools: () => { const m = S.tools && S.tools.m; let s = 0; if (m) for (const k in m) s += Array.isArray(m[k]) ? num(m[k][0]) : 0; return s; },
    smith: () => skillLv('smith'), bench: () => skillLv('bench'), loom: () => skillLv('loom'), ench: () => skillLv('ench'),
    made: () => N().forged, epicCraft: () => DS().rec.epic ? 1 : 0, fine: () => DS().rec.fine,
    honed: () => N().up, reforge: () => N().ref, alchemy: () => N().trans,
    hearth: () => campLv('hearth'),
    builder: () => typeof campList === 'function' && S.camp ? campList().reduce((a, id) => a + campLv(id), 0) : 0,
    store: () => num(S.camp && S.camp.b && S.camp.b.store),
    stock: () => { let s = 0; for (const k in S.mats) s += sumArr(S.mats[k]); return s; },
    hands: () => handsInfo().hired, handhrs: () => handsInfo().hours, meals: () => N().meal,
    depth: () => num(S.deep && S.deep.best), floors: () => num(S.deep && S.deep.floors), marks: () => num(S.deep && S.deep.marksTotal),
    boons: () => keys(S.deep && S.deep.seen), trial: trialSeals,
    starmap: () => starsN('own'), keystones: () => starsN('learned'),
    lanternlight: () => typeof codexLight === 'function' ? num(codexLight()) : 0, pageseals: () => keys(S.codex && S.codex.seal),
    omens: () => keys(S.almanac && S.almanac.seen), dares: () => N().dare, weekly: () => N().weekly,
    stamps: () => num(S.almanac && S.almanac.stamps), wanted: () => num(S.bounties && S.bounties.claimed),
    wyrms: () => num(S.wyrms), raiddmg: () => num(S.stats && S.stats.raidDmg), embers: () => N().embers,
    g_pearl: () => sumG('pearl'), fish: () => skillLv('fish'), g_fish: () => sumG('fish'),
    oath: () => num(S.oath && S.oath.maxL),
    oathseals: () => { const b = S.oath && S.oath.best; let n = 0; if (b) for (const k in b) if (num(b[k]) >= 10) n++; return n; },
    lanterns: () => lanternsLitAt(S.maxZone)
  };
  const cur = t => safe(() => num(SRC[t.id] ? SRC[t.id]() : CUR[t.id]()), 0);

  // ---------------- tiers ----------------
  const MAX_STARS = 60;
  const needAt = (t, k) => {
    if (k <= 4) return t.need[k - 1];
    if (!t.star) return Infinity;
    return t.star.x ? t.need[3] * Math.pow(t.star.x, k - 4) : t.need[3] + t.star.add * (k - 4);
  };
  // The tier a value reaches (0..4, then 4 + stars), stopping at the first locked tier.
  function tierOf(t, v) {
    let k = 0;
    const top = t.star ? 4 + MAX_STARS : 4;
    while (k < top && v >= needAt(t, k + 1) && !lockTxt(t, k + 1)) k++;
    return k;
  }
  const tierOfId = id => num(DS().tier[id]);
  const tierName = k => k <= 0 ? '' : k <= 4 ? DEED_TIERS[k - 1].n : `Everflame ★${k - 4}`;
  const tierLabel = (id, k) => { const t = TR[id]; return !t ? '' : k <= 4 ? `${t.n} ${roman(k)}` : `${t.n} ★${k - 4}`; };
  const trackLive = t => waitOk(t.wait);
  const bonusTxt = (t, k) => {
    if (!t.bonus || (k !== 3 && k !== 4)) return '';
    if (t.bonus === 'deepOil') return `+${DEED_BONUS.deepOil}s ${DEED_KEY_TXT.deepOil}`;
    const v = k === 3 ? DEED_BONUS.gold : DEED_BONUS.everflame;
    return `+${(v * 100).toFixed(1)}%${k === 4 ? ' more' : ''} ${DEED_KEY_TXT[t.bonus] || t.bonus}`;
  };

  // ---------------- bonuses (only Gold and Everflame; capped) ----------------
  const BSUM = {};
  for (const k in DEED_CAP) BSUM[k] = 0;
  function rebuildBonus() {
    for (const k in MSUM) MSUM[k] = 0;
    for (const f of MILESTONES) if (DS().feat[f.id]) MSUM[f.bonus[0]] = (MSUM[f.bonus[0]] || 0) + f.bonus[1];
    for (const k in BSUM) BSUM[k] = 0;
    const tier = DS().tier;
    for (const t of DEED_TRACKS) {
      if (!t.bonus) continue;
      const k = num(tier[t.id]);
      if (k >= 3) BSUM[t.bonus] += t.bonus === 'deepOil' ? DEED_BONUS.deepOil : DEED_BONUS.gold;
      if (k >= 4) BSUM[t.bonus] += t.bonus === 'deepOil' ? DEED_BONUS.deepOil : DEED_BONUS.everflame;
    }
  }
  // Keep the milestone factor separate: (1 + milestone sum) * (1 + capped track sum).
  for (const k of new Set(MILESTONES.map(f => f.bonus[0]))) {
    if (k === 'keen') keenSource('deed-milestones', 'Deeds milestones', () => MSUM.keen || 0);
    else addModifier(k, () => 1 + (MSUM[k] || 0));
  }
  deedBonus = key => T.bonusOn === 0 ? 0 : Math.min(DEED_CAP[key] != null ? DEED_CAP[key] : 0, BSUM[key] || 0);
  for (const k of Object.keys(DEED_CAP)) {
    if (k === 'deepOil') addBonus(k, () => deedBonus(k));
    else if (k === 'keen') keenSource('deeds', 'Deeds', () => deedBonus(k));   // ECON-A: the old gold key, now crit damage
    else if (k === 'buildTime') addModifier(k, () => 1 - deedBonus(k));
    else addModifier(k, () => 1 + deedBonus(k));
  }

  // ---------------- points ----------------
  const tierPts = k => { let p = 0; for (let i = 1; i <= Math.min(4, k); i++) p += DEED_PTS.tier[i - 1]; return p + Math.max(0, k - 4) * DEED_PTS.star; };
  let ptsCache = -1;
  function pointsNow() {
    if (ptsCache >= 0) return ptsCache;
    const d = DS(); let p = 0;
    for (const id in d.tier) if (TR[id]) p += tierPts(num(d.tier[id]));
    for (const id in d.grp) p += (num(d.grp[id]) >= 1 ? DEED_PTS.grpGold : 0) + (num(d.grp[id]) >= 2 ? DEED_PTS.grpEver : 0);
    for (const id in d.feat) if (FE[id]) p += FE[id].pts || DEED_PTS.feat;
    for (const id in d.sec) if (SE[id]) p += DEED_PTS.secret;
    for (const id in d.ch) if (CH[id]) { const s = Math.min(CH[id].steps, num(d.ch[id])); p += s * DEED_PTS.chStep + (s >= CH[id].steps ? DEED_PTS.chDone : 0); }
    return (ptsCache = p);
  }
  const dirtyPts = () => { ptsCache = -1; };
  // ---------------- looks, titles ----------------
  const srcTxt = src => {
    const [k, id] = src.split(':');
    if (k === 'feat') return `Feat: ${FE[id] ? FE[id].n : id}`;
    if (k === 'grp') return `${GR[id] ? GR[id].n : id} at Everflame`;
    if (k === 'sec') return 'A secret';
    if (k === 'ch') return `Chapter: ${CH[id] ? CH[id].n : id}`;
    if (k === 'pts') return `${Number(id).toLocaleString('en-US')} points`;
    return src;
  };
  const chDone = id => CH[id] && num(DS().ch[id]) >= CH[id].steps;
  const owned = id => {
    const l = LK[id]; if (!l) return false;
    const [k, x] = l.src.split(':'), d = DS();
    if (k === 'feat') return !!d.feat[x];
    if (k === 'grp') return num(d.grp[x]) >= 2;
    if (k === 'sec') return !!d.sec[x];
    if (k === 'ch') return chDone(x);
    if (k === 'pts') return !!d.mil[x];
    return false;
  };
  const groupLive = id => DEED_TRACKS.some(t => t.g === id && trackLive(t));
  const lookLive = l => {
    const [k, x] = l.src.split(':');
    if (k === 'feat') return waitOk(FE[x] && FE[x].wait);
    if (k === 'sec') return waitOk(SE[x] && SE[x].wait);
    if (k === 'ch') return waitOk(CH[x] && CH[x].wait);
    if (k === 'grp') return groupLive(x);   // W1-C: a group with no track in solo (Companions, Expeditions) gives no look
    return true;
  };
  function titleList() {
    const d = DS(), out = [];
    for (const g of DEED_GROUPS) {
      if (!groupLive(g.id)) continue;
      out.push({ id: 'a_g_' + g.id, n: g.gold, src: `${g.n} at Gold`, got: num(d.grp[g.id]) >= 1, at: d.at['g:' + g.id + ':1'] || 0 });
      out.push({ id: 'a_e_' + g.id, n: g.ever, src: `${g.n} at Everflame`, got: num(d.grp[g.id]) >= 2, at: d.at['g:' + g.id + ':2'] || 0 });
    }
    for (const f of DEED_FEATS) if (f.title && (waitOk(f.wait) || d.feat[f.id])) out.push({ id: 'a_' + f.id, n: f.title, src: `Feat: ${f.n}`, got: !!d.feat[f.id], at: d.at[f.id] || 0 });
    for (const s of DEED_SECRETS) if (d.sec[s.id]) out.push({ id: 'a_' + s.id, n: s.title, src: `Secret: ${s.n}`, got: true, at: d.at[s.id] || 0 });
    for (const c of DEED_CHAPTERS) if (waitOk(c.wait) || chDone(c.id)) out.push({ id: 'a_' + c.id, n: c.title, src: `Chapter: ${c.n}`, got: chDone(c.id), at: d.at[c.id + ':' + c.steps] || 0 });
    for (const m of DEED_LADDER) if (m.title) out.push({ id: 'a_p' + m.at, n: m.title, src: `${m.at.toLocaleString('en-US')} points`, got: !!d.mil[m.at], at: d.at['m' + m.at] || 0 });
    return out;
  }
  if (typeof codexTitles === 'function') {
    const base = codexTitles;
    codexTitles = () => base().concat(titleList().map(t => ({ id: t.id, n: t.n, src: t.src, got: t.got })));
  }

  // ---------------- grants ----------------
  let pend = null;          // toasts gathered during one pass (folded at its end)
  let lastTierAt = -1e15;   // time (ms) of the last live tier: the near-miss goal hides a while (wall time, so a closed game counts)
  let clock = 0;            // seconds of ticks since load (runtime only)
  const toastQ = (msg, prio, icon, key, extra) => { if (pend) pend.push(Object.assign({ msg, prio, icon, key }, extra)); };
  function flushToasts() {
    const p = pend; pend = null;
    if (!p || !p.length) return;
    // Tiers fold: "Slayer III and 2 more"; the rest (groups, Feats, milestones) each have their own line.
    const tiers = p.filter(x => x.tier), rest = p.filter(x => !x.tier);
    // W1-B: one voice for achievements. The channel comes from the best tier in the pass (23n-data-notices
    // 'deed-tier': Bronze and Silver go to the bell list, Gold to the bell, Everflame pops).
    if (tiers.length) {
      tiers.sort((a, b) => b.k - a.k);
      const top = tiers[0], more = tiers.length - 1;
      emit('toast', { key: 'deed-tier', msg: more ? `${top.short} and ${more} more.` : top.msg, kind: 'good', icon: top.icon, prio: top.prio, tier: top.k });
    }
    for (const x of rest) emit('toast', { key: x.key || 'deed-points', msg: x.msg, kind: 'good', icon: x.icon, prio: x.prio, lv: x.lv });
  }
  function grantTier(t, k, quiet) {
    const d = DS(), from = num(d.tier[t.id]);
    if (k <= from) return 0;
    d.tier[t.id] = k;
    const tm = now();
    for (let i = from + 1; i <= k; i++) d.at[t.id + ':' + i] = tm;
    d.last = tm; if (!quiet) lastTierAt = tm;   // (away and first-load credit do not hide the nudge)
    if ((from < 3 && k >= 3) || (from < 4 && k >= 4)) rebuildBonus();
    dirtyPts();
    if (!quiet && pend) {
      const g = GR[t.g], col = DEED_TIERS[Math.min(4, k) - 1].col;
      const bt = bonusTxt(t, Math.min(4, k)), lab = tierLabel(t.id, k);
      const msg = k <= 4 ? `${lab} (${tierName(k)}).${bt && k >= 3 && from < k ? ' ' + bt + '.' : ''}` : `${t.n}: ${tierName(k)}.`;
      pend.push({ tier: true, k, msg, short: lab, prio: k === 1 ? 'low' : k <= 3 ? 'normal' : 'high', icon: { ic: [g ? g.ic[0] : 'banner', col] } });
    }
    emit('deedTier', { id: t.id, tier: k, quiet: !!quiet });
    return k - from;
  }
  function checkGroups(quiet) {
    const d = DS(); let n = 0;
    for (const g of DEED_GROUPS) {
      const list = DEED_TRACKS.filter(t => t.g === g.id && trackLive(t));
      if (!list.length) continue;
      const at = k => list.every(t => num(d.tier[t.id]) >= k || !!lockTxt(t, k));
      const lv = at(4) ? 2 : at(3) ? 1 : 0, was = num(d.grp[g.id]);
      if (lv <= was) continue;
      d.grp[g.id] = lv; n++;
      for (let i = was + 1; i <= lv; i++) d.at['g:' + g.id + ':' + i] = now();
      dirtyPts();
      if (!quiet) {
        const look = lv >= 2 && g.look ? LK[g.look] : null;
        toastQ(`${g.n}: every track at ${lv >= 2 ? 'Everflame' : 'Gold'}. New title: ${lv >= 2 ? g.ever : g.gold}.${look ? ' New look: ' + look.n + '.' : ''}`, 'high', { ic: [g.ic[0], lv >= 2 ? DEED_TIERS[3].col : DEED_TIERS[2].col] }, 'deed-group', { lv });
      }
      emit('deedGroup', { id: g.id, lv, quiet: !!quiet });
    }
    return n;
  }

  // ---------------- Feats ----------------
  const P = (n, have, need) => ({ n, have: num(have), need });
  const FEAT_PARTS = {
    f_lamps: () => {
      let st = 0; for (let z = 1; z <= hollowZones(); z++) st += zoneStars(z);
      return [P('Zone stars', st, hollowZones() * 5), P('Bestiary pages', pagesOf(hollowTypeKeys()), hollowTypeKeys().length * BESTIARY_TIERS.length)];
    },
    f_watch: () => [P('Hours of light', Math.floor(lightHours()), 2000)],
    f_trades: () => [P('Skills at 200', ['mine', 'wood', 'forage', 'smith', 'bench', 'loom', 'ench'].filter(k => skillLv(k) >= 200).length, 7),
      P('Tools at 20', ['pick', 'axe', 'sickle'].filter(k => S.tools && S.tools.m && S.tools.m[k] && num(S.tools.m[k][0]) >= 20).length, 3)],
    f_deep: () => [P('Deepest floor', num(S.deep && S.deep.best), 75)],
    f_trials: () => [P('Trial Seals', trialSeals(), 52)],
    f_stamps: () => [P('Almanac Stamps', num(S.almanac && S.almanac.stamps), 52)],
    f_parry: () => [P('Parries', N().parry, 25000)],
    f_hit: () => [P('Biggest hit', DS().rec.hit, FE.f_hit.need)],
    f_gold: () => [P('Gold earned', S.totalGold, FE.f_gold.need)],
    f_raid: () => [P('Raid bosses', num(S.wyrms), 100)],
    f_champs: () => [P('Champions', num(S.craft && S.craft.champ), 10000)],
    f_stars: () => [P('Stars learned', starsN('learned'), typeof STAR_ORDER === 'object' ? STAR_ORDER.length : 25)],
    f_town: () => {
      const list = typeof campList === 'function' ? campList() : [], h = S.hands || {}, hl = Array.isArray(h.list) ? h.list : [];
      return [P('Buildings at the top', list.filter(id => campLv(id) >= campMaxLevel(id)).length, list.length), P('Hands housed', hl.length, 6),
        P('A Legendary Hand', hl.some(x => x && x.r === 'legendary') ? 1 : 0, 1), P('Kitchen', campLv('kitchen'), Math.max(1, safe(() => campMaxLevel('kitchen'), 1)))];
    },
    f_stock: () => {
      let full = 0, all = 0;
      if (typeof storeCap === 'function') for (const f of CRAFT_FAMILIES) for (let t = 1; t <= 5; t++) { const c = safe(() => storeCap(f, t), 0); if (!(c > 0)) continue; all++; if (num(S.mats[f] && S.mats[f][t - 1]) >= c) full++; }
      return [P('Storehouse level', num(S.camp && S.camp.b && S.camp.b.store), 8), P('Full cells', full, Math.max(1, all))];
    },
    f_oaths: () => { const b = (S.oath && S.oath.best) || {}; let n = 0; for (const k in b) if (num(b[k]) >= 20) n++; return [P('Oath Seals at 20+', n, 14)]; },
    f_all: () => { const others = DEED_FEATS.filter(f => !f.legacy && f.id !== 'f_all' && waitOk(f.wait)); return [P('Feats', others.filter(f => DS().feat[f.id]).length, others.length)]; }
  };
  const featParts = f => f.legacy ? [P(f.needs, safe(() => CUR[f.stat](), 0), f.need)] : safe(() => FEAT_PARTS[f.id](), []);
  const featDone = parts => parts.length > 0 && parts.every(p => p.have >= p.need);
  function grantFeat(f, quiet) {
    const d = DS(); if (d.feat[f.id]) return false;
    d.feat[f.id] = 1; d.at[f.id] = now(); dirtyPts();
    if (f.bonus) rebuildBonus();
    if (!quiet && f.legacy) toastQ(`Feat: ${f.n}. ${milestoneText(f)}.`, 'low', { ic: [f.ic, '#F2C14E'] }, 'deed-milestone');
    else if (!quiet && T.featToast) { const l = LK[f.look]; toastQ(`Feat: ${f.n}. New title: ${f.title}.${l ? ' New look: ' + l.n + '.' : ''}`, 'high', { ic: ['banner', '#F2C14E'] }, 'deed-feat'); }
    emit('deedFeat', { id: f.id, quiet: !!quiet });
    if (typeof codexRefresh === 'function' && d.init) safe(() => codexRefresh(true, !!quiet), 0);
    return true;
  }
  function checkMilestones(quiet) {
    let n = 0;
    for (const f of MILESTONES) if (!DS().feat[f.id] && safe(() => num(CUR[f.stat]()), 0) >= f.need && grantFeat(f, quiet)) n++;
    return n;
  }
  function checkFeats(quiet, part) {
    let n = 0;
    DEED_FEATS.filter(f => !f.legacy).forEach((f, i) => {
      if (f.id === 'f_all' || DS().feat[f.id] || (part != null && i % T.parts !== part) || !waitOk(f.wait)) return;
      if (featDone(featParts(f)) && grantFeat(f, quiet)) n++;
    });
    const cap = FE.f_all;
    if (!DS().feat.f_all && featDone(featParts(cap)) && grantFeat(cap, quiet)) n++;
    return n;
  }

  // ---------------- secrets ----------------
  function grantSecret(id) {
    const d = DS(), s = SE[id];
    if (!s || d.sec[id] || !d.init || !waitOk(s.wait)) return false;
    d.sec[id] = 1; d.at[id] = now(); dirtyPts();
    toast(`Secret found: ${s.n}. New title: ${s.title}.${s.look && LK[s.look] ? ' New look: ' + LK[s.look].n + '.' : ''}`, 'good', { ic: ['orb', '#B89CFF'] }, 'normal');
    emit('deedSecret', { id });
    const own = !pend; if (own) pend = [];
    afterPoints(false);
    if (own) flushToasts();
    save();
    return true;
  }

  // ---------------- points ladder ----------------
  function afterPoints(quiet) {
    const d = DS(), p = pointsNow(), gain = p - num(d.pts);
    for (const m of DEED_LADDER) {
      if (p < m.at || d.mil[m.at]) continue;
      d.mil[m.at] = 1; d.at['m' + m.at] = now();
      if (!quiet) {
        const bits = [];
        if (m.title) bits.push(`title ${m.title}`);
        if (m.look && LK[m.look]) bits.push(LK[m.look].n);
        if (m.wall) bits.push(m.wall === 1 ? 'the Trophy Wall opens at camp' : 'the Trophy Wall grows');
        toastQ(`${m.at.toLocaleString('en-US')} achievement points: ${bits.join(', ')}.`, 'normal', { ic: ['banner', '#F2C14E'] }, 'deed-points');
      }
      emit('deedMilestone', { at: m.at });
    }
    if (gain !== 0) { d.pts = p; emit('deedPoints', { pts: p, gain }); }
  }

  // ---------------- the check pass ----------------
  let part = 0;
  // part: a quarter of the tracks (round robin); null = every track. Returns tiers granted.
  function checkTracks(p, quiet) {
    let n = 0;
    for (let i = 0; i < DEED_TRACKS.length; i++) {
      if (p != null && i % T.parts !== p) continue;
      const t = DEED_TRACKS[i];
      if (!trackLive(t)) continue;
      const k = tierOf(t, cur(t));
      if (k > num(DS().tier[t.id])) n += grantTier(t, k, quiet);
    }
    return n;
  }
  function pass(full, quiet) {
    if (!quiet) pend = [];
    const p = full ? null : part;
    if (!full) part = (part + 1) % T.parts;
    const n = checkTracks(p, quiet);
    let g = 0; if (n || full || p === 0) g = checkGroups(quiet);
    const f = checkMilestones(quiet) + checkFeats(quiet, full ? null : p);
    if (n || g || f || full) afterPoints(quiet);
    if (!quiet) flushToasts(); else pend = null;
    return { tiers: n, groups: g, feats: f };
  }

  // ---------------- counters: combat deltas, records ----------------
  const CBK = [['parries', 'parry'], ['dodges', 'dodge'], ['interrupts', 'intr'], ['abilities', 'abil'], ['taken', 'taken'], ['crits', 'crit']];
  const cbLast = { parries: 0, dodges: 0, interrupts: 0, abilities: 0, taken: 0, crits: 0, dmg: 0, heal: 0 };
  let cbInit = false;
  const delta = (k, v) => { const l = cbLast[k]; cbLast[k] = v; return v >= l ? v - l : v; };   // a reset (checks) counts from 0
  function readCombat() {
    const st = typeof CB_STATS === 'object' && CB_STATS ? CB_STATS : null; if (!st) return;
    const dmg = num(st.heroDmg) + num(st.sideDmg), heal = num(st.healed) + num(st.shielded);
    if (!cbInit) { cbInit = true; for (const [k] of CBK) cbLast[k] = num(st[k]); cbLast.dmg = dmg; cbLast.heal = heal; }
    const n = N();
    for (const [k, key] of CBK) n[key] += delta(k, num(st[k]));
    n.dmg += delta('dmg', dmg); n.heal += delta('heal', heal);
    const hit = num(st.maxHit);
    if (hit > 0) {
      const r = DS().rec;
      if (hit > r.hit) { r.hit = hit; r.hitZ = S.zone; r.hitAt = now(); }
      st.maxHit = 0;
    }
    if (num(st.maxOver) >= T.overX) grantSecret('s_over');
    st.maxOver = 0;
  }

  // ---------------- events ----------------
  let inAway = false;
  // Preserve the lifetime non-unique item-added counter used by the original milestones.
  on('itemAdded', ({ item }) => { ensure(); if (!item || item.u) return; N().forged++; if (item.r === 'epic') DS().rec.epic = true; });
  on('harvest', ({ kind, t, n, glint }) => {
    if (!GATHER.includes(kind) || !(t >= 1 && t <= 5)) return;
    const row = gRow(kind); row[t - 1] += num(n);
    if (glint) N().glint++;
  });
  // First Try (was Just in Time, before the boss timer went, 2026-10-01): a new zone opened without losing to its boss
  const bossFailed = new Set();
  on('bossFail', ({ zone }) => bossFailed.add(zone));
  on('zoneClear', ({ zone }) => { if (!inAway && DS().init && num(zone) >= T.oddZone && !bossFailed.has(zone)) grantSecret('s_close'); });   // from zone 10, like the other boss secrets
  on('kill', ({ mob, ess, zone }) => {
    N().ess += num(ess);
    if (!mob || !mob.boss || inAway || !DS().init) return;
    // zone boss secrets (live play only)
    const U = safe(() => combatUnits(), null);
    // Untouched: a boss from zone 10 without one hit taken. Last Lamp Standing: your health fell under 10% during the fight (a boss kill heals you a little, so the lowest point counts).
    if (num(zone) >= T.oddZone && bossHurt === 0) grantSecret('s_bare');   // the kill's zone (a boss win has already moved you on)
    const h = U && U[0];
    if (num(zone) >= T.oddZone && h && h.live && !h.down && bossLow < 0.1) grantSecret('s_alone');
  });
  // Untouched (solo): hits the hero takes while a zone boss is up (the count resets when a boss spawns)
  let bossHurt = 0, bossLow = 1;
  on('spawn', ({ mob: m }) => { if (m && m.boss) { bossHurt = 0; bossLow = 1; } });
  on('unitHit', h => {
    if (!h || !(h.amount > 0)) return;
    bossHurt++;
    const u = safe(() => combatUnits()[0], null); if (u && u.maxHp > 0) bossLow = Math.min(bossLow, u.hp / u.maxHp);
  });
  on('deepFloor', ({ kind }) => { if (kind === 'boss') N().boss++; });
  on('trophy', ({ n }) => { N().troph += n == null ? 1 : num(n); });
  on('upgraded', ({ item }) => { N().up++; const f = fineOf(item); if (f > DS().rec.fine) DS().rec.fine = f; });
  on('crafted', ({ item }) => { const f = fineOf(item); if (f > DS().rec.fine) DS().rec.fine = f; });
  on('reforged', () => { N().ref++; });
  on('transmuted', () => { N().trans++; });
  on('weeklyClaim', () => { N().weekly++; });
  on('raidReward', ({ embers }) => { N().embers += num(embers); });
  on('meal', () => { N().meal++; });
  on('storeCap', () => { const sx = DS().sx; sx.rat = num(sx.rat) + 1; if (sx.rat >= T.ratHits) grantSecret('s_rat'); });
  let oilSeen = Infinity;
  on('deepEnd', ({ summary }) => { if (summary && summary.reason === 'leave' && oilSeen < 1) grantSecret('s_oil'); oilSeen = Infinity; });
  // Hot Streak: a hero crit right after the last one (59-combat counts hero strikes in CB_STATS.heroHits).
  let streak = 0, hitsAfter = -1;
  on('crit', () => {   // (the count itself is CB_STATS.crits, read as a delta)
    const st = typeof CB_STATS === 'object' && CB_STATS; if (!st || !partyCombatOn()) { streak = 0; return; }
    const h = num(st.heroHits);
    streak = hitsAfter >= 0 && h - hitsAfter === 1 ? streak + 1 : 1;
    hitsAfter = h + (safe(() => gear().echo, 0) > 0 ? 1 : 0);
    if (streak >= T.streak) grantSecret('s_streak');
  });
  // Drummer: taps in the last 60 seconds of tick time (60 one-second buckets, no allocation).
  const drum = new Uint16Array(60); let drumSum = 0, drumSec = 0;
  let campSince = -1, lastView = '';
  const drumHit = () => { const b = drumSec % 60; drum[b]++; drumSum++; if (drumSum >= T.drumTaps) grantSecret('s_drum'); };
  on('tap', () => {
    if (campSince >= 0) campSince = clock;
  });
  on('soloPress', () => drumHit());   // C29: every Attack press counts (a turn fight lands one a turn; the rain is the pressing)
  on('menuView', ({ view }) => { lastView = view || ''; campSince = lastView === 'camp' ? clock : -1; });

  // Per-second secrets and polls.
  let dareSeen = -1;
  function secondPolls() {
    const d = DS(), sx = d.sx;
    // drum window
    drumSec++; const b = drumSec % 60; drumSum -= drum[b]; drum[b] = 0;
    if (!d.init) return;
    // Dares: one per day taken (the Almanac's toggle), and a full week of them (Daredevil)
    const dr = S.almanac && S.almanac.dare;
    if (dr && dr.on && dr.day !== dareSeen && num(dr.day) !== num(sx.dareDay)) {
      dareSeen = dr.day; sx.dareDay = dr.day; N().dare++;
      const wk = Math.floor((num(dr.day) + 3) / 7), bit = 1 << (((num(dr.day) + 3) % 7 + 7) % 7);
      if (sx.dareWk !== wk) { sx.dareWk = wk; sx.dareMask = 0; }
      sx.dareMask = num(sx.dareMask) | bit;
      if (sx.dareMask === 127) grantSecret('s_dare');
    }
    const hr = new Date(now()).getHours(), live = !inAway;
    if (live && S.activity === 'fight' && typeof target === 'function' && target() === 'mob') {
      if (hr >= T.nightFrom && hr < T.nightTo) { sx.night = num(sx.night) + 1; if (sx.night >= T.nightSecs) grantSecret('s_night'); }
      const ti = safe(() => zoneType(S.zone), -1);
      if (TYPES[ti] && TYPES[ti].key === 'wraith' && (hr >= T.wispFrom || hr < T.wispTo)) { sx.wisp = num(sx.wisp) + 1; if (sx.wisp >= T.wispSecs) grantSecret('s_wisp'); }
    }
    if (S.tab && lastView === 'camp' && campSince >= 0 && clock - campSince >= T.fireSecs) grantSecret('s_fire');
    if (!S.tab) campSince = lastView === 'camp' ? -1 : campSince;
    if (S.activity === 'raid' && online && Array.isArray(online.peers)) {
      let n = 0; for (const p of online.peers) { const x = p && (p.data || p.presence || p); if (x && x.raiding) n++; }
      if (n >= T.crowd) grantSecret('s_crowd');
    }
    const run = S.deep && S.deep.run; oilSeen = run ? num(run.oil) : oilSeen;
  }

  // ---------------- first load: the deeds start counting ----------------
  function init() {
    const d = DS();
    if (d.init) return null;
    dirtyPts();
    const before = pointsNow();
    const res = pass(true, true);
    d.init = now();
    const tiers = Object.keys(d.tier).reduce((a, id) => a + num(d.tier[id]), 0), pts = pointsNow();
    emit('deedsInit', { tiers, pts, gain: pts - before, res });
    save();
    return { tiers, pts };
  }

  // ---------------- per-S runtime (loadSave() replaces S) ----------------
  let seenFor = null, lastNum, firstMilestonePass = true;
  function ensure() {
    if (seenFor === S) return;
    seenFor = S;
    const d = DS();
    // Same-v5 conversion. Mixed records keep the greater counter and existing earned dates.
    const old = S.achievements;
    if (old && typeof old === 'object' && !Array.isArray(old)) {
      for (const f of MILESTONES) if (old.got && old.got[f.legacy]) {
        d.feat[f.id] = 1;
        if (!d.at[f.id]) d.at[f.id] = num(old.got[f.legacy]);
      }
      d.n.forged = Math.max(num(d.n.forged), num(old.forged));
      d.rec.epic = !!(d.rec.epic || old.epic);
    }
    delete S.achievements;
    firstMilestonePass = true;
    if (!d.rec.ks || typeof d.rec.ks !== 'object') d.rec.ks = {};
    for (const k of Object.keys(d.g)) if (!Array.isArray(d.g[k])) delete d.g[k];
    rebuildBonus(); dirtyPts(); cbInit = false; streak = 0; hitsAfter = -1; dareSeen = -1;
    lastNum = undefined;
  }
  ensure();
  const syncNum = () => { const v = S.settings && S.settings.num; if (v !== lastNum) { lastNum = v; setNumFormat(v); } };
  syncNum();

  // ---------------- the tick ----------------
  let acc = 0;
  onTick(dt => {
    clock += dt; acc += dt;
    if (acc < T.every) return;
    acc = 0;
    ensure(); syncNum();
    readCombat();
    secondPolls();
    // Milestones retain the one-second cadence, including before track initialization.
    pend = [];
    const milestones = checkMilestones(firstMilestonePass);
    if (milestones && DS().init) afterPoints(firstMilestonePass);
    flushToasts(); firstMilestonePass = false;
    if (milestones) save();
    if (!DS().init) { if (clock >= T.initAfter) init(); return; }
    pass(false, false);
  });

  // ---------------- away ----------------
  let awaySnap = null;
  on('awayBegin', () => { inAway = true; awaySnap = DS().init ? { tier: Object.assign({}, DS().tier), pts: pointsNow(), feat: Object.assign({}, DS().feat), grp: Object.assign({}, DS().grp) } : null; });
  on('awayEnd', () => { inAway = false; });
  registerAwayLine(r => {
    // Essence that arrived while away (no kill events): the report's diff.
    for (const m of r.mats || []) if (m.k === 'ess') N().ess += num(m.n);
    const s = awaySnap; awaySnap = null;
    if (!s) return null;
    ensure();
    pass(true, true);
    const d = DS(), got = [];
    for (const t of DEED_TRACKS) { const k = num(d.tier[t.id]); if (k > num(s.tier[t.id])) got.push(tierLabel(t.id, k)); }
    const feats = DEED_FEATS.filter(f => d.feat[f.id] && !s.feat[f.id]);
    const gain = pointsNow() - s.pts;
    if (!got.length && !feats.length && gain <= 0) return null;
    const bits = got.slice(0, 3).concat(got.length > 3 ? [`${got.length - 3} more`] : []);
    const lines = [];
    for (const f of feats) lines.push({ icon: { ic: ['banner', '#F2C14E'] }, txt: `Feat: ${f.n}`, sub: f.legacy ? milestoneText(f) + '.' : `New title: ${f.title}.`, group: 'Achievements', go: () => emit('deedsOpen', { view: 'feats', id: f.id }) });
    if (bits.length || gain > 0) lines.push({ icon: { ic: ['banner', '#F2C14E'] }, txt: bits.length ? bits.join(', ') : 'Achievement points', sub: `+${gain} points.`, group: 'Achievements', go: () => emit('deedsOpen', { view: 'deeds' }) });
    return lines;
  });

  // ---------------- views for the UI ----------------
  function trackRow(t) {
    const k = tierOfId(t.id), v = cur(t), nk = k + 1;
    const lock = lockTxt(t, nk), maxed = (!t.star && k >= 4) || !!lock;
    const from = k ? needAt(t, k) : 0, to = maxed ? needAt(t, Math.max(1, k)) : needAt(t, nk);
    const pct = maxed ? 1 : Math.max(0, Math.min(1, t.kind === 'ladder' || t.kind === 'record' ? v / to : (v - from) / Math.max(1e-9, to - from)));
    return { id: t.id, g: t.g, n: t.n, what: t.what, kind: t.kind || 'count', tier: k, v, next: maxed ? 0 : nk, need: to, pct, left: maxed ? 0 : Math.max(0, to - v),
      label: maxed ? '' : nudgeLabel(t, nk, v, to), live: trackLive(t), lock, stars: Math.max(0, k - 4), steps: t.steps || null,
      bonus: t.bonus, bonusTxt: [bonusTxt(t, 3), bonusTxt(t, 4)].filter(Boolean), since: DS().since[sinceKey(t)] || 0, wait: t.wait || null,
      needs: [1, 2, 3, 4].map(i => needAt(t, i)) };
  }
  const SINCE = { crits: 'crit', parry: 'parry', intr: 'intr', abil: 'abil', damage: 'dmg', bighit: 'hit', essence: 'ess', trophies: 'troph', glint: 'glint',
    honed: 'up', reforge: 'ref', alchemy: 'trans', embers: 'embers', dares: 'dare', weekly: 'weekly', g_ore: 'g', g_crystal: 'g', g_wood: 'g', g_fibre: 'g', g_herb: 'g',
    s_mine: 'g', s_wood: 'g', s_forage: 'g' };
  const sinceKey = t => SINCE[t.id] || '';
  const fmtLeft = (t, n) => (t.kind === 'level' || t.kind === 'ladder' || n < 1e5 ? Math.ceil(n).toLocaleString('en-US') : fmt(n));
  function nudgeLabel(t, k, v, to) {
    const left = Math.max(0, to - v), tl = k <= 4 ? roman(k) : `★${k - 4}`;
    if (t.kind === 'ladder') return `${t.n} ${tl}: ${t.steps ? t.steps[Math.min(3, k - 1)] : ''}`;
    if (t.more) return `${t.n} ${tl}: ${fmt(Math.max(1, left))} more ${t.more}`;
    const c = Math.max(1, Math.ceil(left)), u = t.u || ['', ''];
    return `${fmtLeft(t, c)} ${c === 1 ? u[0] : u[1]} to ${t.n} ${tl}`;
  }

  // near-miss nudge (Next Up), cached 2 s
  let nearCache = { at: -1e9, list: [] };
  function nearList() {
    if (clock - nearCache.at < 2 && nearCache.at <= clock) return nearCache.list;
    const out = [];
    for (const t of DEED_TRACKS) {
      if (t.kind === 'ladder' || t.kind === 'record' || !trackLive(t)) continue;
      const k = tierOfId(t.id), nk = k + 1;
      if ((!t.star && k >= 4) || lockTxt(t, nk)) continue;
      const v = cur(t), from = k ? needAt(t, k) : 0, to = needAt(t, nk), pct = (v - from) / Math.max(1e-9, to - from);
      if (pct >= T.near && pct < 1) out.push({ id: t.id, label: nudgeLabel(t, nk, v, to), pct, g: t.g });
    }
    out.sort((a, b) => b.pct - a.pct);
    nearCache = { at: clock, list: out };
    return out;
  }
  const nudgePick = () => {
    const d = DS();
    if (!d.init || !d.nudge || now() - lastTierAt < T.quiet * 1000) return null;
    if ((typeof fightBoss !== 'undefined' && fightBoss) || safe(() => deepActive(), false)) return null;
    if (d.follow && TR[d.follow] && trackLive(TR[d.follow])) { const r = trackRow(TR[d.follow]); if (r.next && !r.lock) return { id: r.id, label: r.label, pct: r.pct }; }
    return nearList()[0] || null;
  };
  registerGoal({
    id: 'deeds-near', sys: 'deeds', cap: 1, reserve: 1, prio: -1,
    pct: () => { const x = nudgePick(); return x ? Math.max(0.01, Math.min(T.nearMax, x.pct)) : null; },
    label: () => { const x = nudgePick(); return x ? x.label : ''; },
    icon: () => { const x = nudgePick(), t = x && TR[x.id], g = t && GR[t.g]; return { ic: g ? g.ic : ['banner', '#F2C14E'] }; },
    go: () => { const x = nudgePick(); return { fn: () => emit('deedsOpen', { view: 'tracks', id: x ? x.id : null }) }; }
  });

  // ---------------- Codex bridge: Feats on the Achievements page, looks on the Wardrobe ----------------
  // A Feat tile is worth 5 Light once earned (its max counts only then, so the page's half and Seal
  // gates stay where CX1 put them). Each look is one Wardrobe entry (1 Light).
  if (typeof CODEX_PAGES === 'object') {
    const A = CODEX_PAGES.achievements;
    if (A && typeof A.tiles === 'function') {
      const base = A.tiles;
      A.tiles = x => base(x).concat(DEED_FEATS.filter(f => !f.legacy && DS().feat[f.id]).map(f => ({ key: f.id, n: f.n, got: 1, max: 1, pts: 10, ptsMax: 10,
        ic: ['banner', '#F2C14E'], grp: 'Feats', sub: `Title: ${f.title}.`, hint: '' })));
    }
    const W = CODEX_PAGES.wardrobe;
    if (W) {
      const base = W.tiles, baseShow = W.show;
      const any = () => DEED_LOOKS.some(l => l.slot !== 'frame' && owned(l.id));
      W.show = () => safe(() => (baseShow ? !!baseShow() : false), false) || any();
      W.tiles = x => {
        const out = safe(() => (baseShow ? !!baseShow() : false), false) && typeof base === 'function' ? base(x) : [];
        for (const l of DEED_LOOKS) if (l.slot !== 'frame' && lookLive(l)) {
          const got = owned(l.id) ? 1 : 0;
          out.push({ key: l.id, n: l.n, got, max: 1, pts: got * 2, ptsMax: 2, grp: `Achievement ${DEED_SLOT_TXT[l.slot].toLowerCase()}s`, sub: got ? 'Wear it in Achievements, Looks.' : '', hint: got ? '' : srcTxt(l.src) + '.' });
        }
        return out;
      };
    }
  }

  // ---------------- wear ----------------
  const deepCos = (kind, id) => typeof DEEP_SHOP === 'object' && DEEP_SHOP[id] && DEEP_SHOP[id].kind === kind && S.deep && S.deep.cos && S.deep.cos[id];
  wearGet = slot => {
    const w = DS().wear;
    if (slot === 'helm') return w.helm ? 1 : 0;
    if (slot === 'flame') return (w.flame && owned(w.flame) ? w.flame : null) || (S.deep && S.deep.eq && S.deep.eq.lantern) || null;
    if (slot === 'trail') return (w.trail && owned(w.trail) ? w.trail : null) || (S.deep && S.deep.eq && S.deep.eq.trail) || null;
    if (slot === 'frame') {
      if (w.frame === 'none') return null;
      if (w.frame && owned(w.frame)) return w.frame;
      const own = DEED_LOOKS.filter(l => l.slot === 'frame' && owned(l.id));
      return own.length ? own[own.length - 1].id : null;
    }
    const id = w[slot]; return id && owned(id) ? id : null;
  };
  function wear(slot, id) {
    const w = DS().wear;
    if (!DEED_SLOTS.includes(slot)) return false;
    if (id == null) {
      if (slot === 'flame' || slot === 'trail') { w[slot] = null; if (S.deep && S.deep.eq) S.deep.eq[slot === 'flame' ? 'lantern' : 'trail'] = null; }
      else w[slot] = slot === 'frame' ? 'none' : null;
    } else if (LK[id] && LK[id].slot === slot) {   // (an id in another slot may still be a Deepwell colour: 'l_moon')
      if (!owned(id)) return false;
      w[slot] = id;
    } else if ((slot === 'flame' || slot === 'trail') && deepCos(slot === 'flame' ? 'lantern' : 'trail', id)) {
      w[slot] = null; S.deep.eq[slot === 'flame' ? 'lantern' : 'trail'] = id;   // the Deepwell's own meaning, unchanged
    } else return false;
    emit('deedLook', { slot, id: id == null ? null : id });
    save();
    return true;
  }

  // ---------------- public API ----------------
  deeds = {
    tracks: g => DEED_TRACKS.filter(t => (!g || t.g === g) && trackLive(t)).map(trackRow),
    track: id => TR[id] ? trackRow(TR[id]) : null,
    tierName, tierLabel,
    groups: () => DEED_GROUPS.map(g => {
      const list = DEED_TRACKS.filter(t => t.g === g.id && trackLive(t)), lv = num(DS().grp[g.id]);
      const at = k => list.filter(t => tierOfId(t.id) >= k || !!lockTxt(t, k)).length;
      return { id: g.id, n: g.n, ic: g.ic, lv, gold: g.gold, ever: g.ever, look: g.look, tracks: list.length, atGold: at(3), atEver: at(4),
        fresh: lv >= 1 && at(lv >= 2 ? 4 : 3) < list.length ? list.length - at(lv >= 2 ? 4 : 3) : 0 };
    }).filter(g => g.tracks > 0),
    feats: () => DEED_FEATS.filter(f => waitOk(f.wait) || DS().feat[f.id]).map(f => {
      const parts = featParts(f), got = !!DS().feat[f.id];
      const pct = parts.length ? parts.reduce((a, p) => a + Math.min(1, p.need ? p.have / p.need : 1), 0) / parts.length : 0;
      return { id: f.id, n: f.n, needs: f.needs, about: f.about, rar: f.rar, rarTxt: DEED_RARITY[f.rar], title: f.title, look: f.look, legacy: f.legacy, ic: f.ic, bonusTxt: f.bonus ? milestoneText(f) : '', got, at: DS().at[f.id] || 0, parts, pct: got ? 1 : pct, live: waitOk(f.wait), pts: f.pts || DEED_PTS.feat };
    }),
    secrets: () => {
      const d = DS(), found = keys(d.sec), days = S.stats ? (num(S.stats.played) + num(S.stats.away)) / 86400 : 0;
      const hint = found >= T.secretAfterFound || (d.init && now() - d.init >= T.secretAfterDays * 864e5) || days >= T.secretAfterDays;
      return DEED_SECRETS.filter(s => waitOk(s.wait) || d.sec[s.id]).map(s => {
        const got = !!d.sec[s.id];
        return { id: s.id, got, at: d.at[s.id] || 0, n: got ? s.n : '', riddle: got || hint ? s.riddle : '', how: got ? s.how : '', title: got ? s.title : '', look: got ? s.look || null : null, live: waitOk(s.wait) };
      });
    },
    milestones: () => MILESTONES.map(f => ({ legacy: f.legacy, n: f.n, needs: f.needs, ic: f.ic, got: !!DS().feat[f.id], bonusTxt: milestoneText(f) })),
    milestoneBonus: key => MSUM[key] || 0,
    points: () => pointsNow(),
    ladder: () => DEED_LADDER.map(m => Object.assign({ got: !!DS().mil[m.at] }, m)),
    next: () => DEED_LADDER.find(m => !DS().mil[m.at]) || null,
    wallStage: () => DEED_LADDER.reduce((a, m) => m.wall && DS().mil[m.at] ? Math.max(a, m.wall) : a, 0),
    wall: () => DS().wall.slice(),
    pin: ids => { DS().wall = (Array.isArray(ids) ? ids : []).filter(id => (FE[id] && !FE[id].legacy) || CH[id] || GR[id]).slice(0, 12); save(); return DS().wall.slice(); },
    looks: slot => DEED_LOOKS.filter(l => (!slot || l.slot === slot) && (lookLive(l) || owned(l.id))).map(l => ({ id: l.id, slot: l.slot, n: l.n, src: l.src, srcTxt: srcTxt(l.src), got: owned(l.id) })),
    owned, wear, wearGet: s => wearGet(s),
    showHelm: on => { DS().wear.helm = on ? 1 : 0; emit('deedLook', { slot: 'helm', id: DS().wear.helm }); save(); return DS().wear.helm; },
    frame: () => wearGet('frame'),
    near: (n = 3) => nearList().slice(0, n),
    follow: id => { DS().follow = id && TR[id] ? id : null; nearCache.at = -1e9; save(); return DS().follow; },
    nudge: on => { DS().nudge = on ? 1 : 0; save(); return DS().nudge; },
    recent: (n = 5) => {
      const d = DS(), out = [];
      for (const k in d.at) {
        const at = d.at[k], m = /^([a-z_0-9]+):(\d+)$/.exec(k);
        if (m && TR[m[1]]) out.push({ key: k, kind: 'tier', id: m[1], tier: +m[2], at, txt: tierLabel(m[1], +m[2]) });
        else if (FE[k]) out.push({ key: k, kind: 'feat', id: k, at, txt: FE[k].n });
        else if (SE[k]) out.push({ key: k, kind: 'secret', id: k, at, txt: SE[k].n });
      }
      out.sort((a, b) => b.at - a.at || b.tier - a.tier);
      return out.slice(0, n);
    },
    isNew: () => pointsNow() > num(DS().seen),
    seen: () => { DS().seen = pointsNow(); },
    chapterStep: (id, step, opts) => {
      const c = CH[id], d = DS(); if (!c || !waitOk(c.wait)) return false;
      step = Math.max(0, Math.min(c.steps, step | 0));
      const was = num(d.ch[id]); if (step <= was) return false;
      d.ch[id] = step; for (let i = was + 1; i <= step; i++) d.at[id + ':' + i] = now();
      dirtyPts();
      emit('deedChapter', { id, step, quiet: !!(opts && opts.quiet) });
      const q = !!(opts && opts.quiet);
      if (!q) pend = [];
      afterPoints(q);
      if (!q) flushToasts();
      save();
      return true;
    },
    chapter: id => ({ step: num(DS().ch[id]), done: chDone(id) }),
    count: (key, n = 1) => { if (key in N()) N()[key] += num(n); },
    source: (id, fn) => { if (TR[id] && typeof fn === 'function') SRC[id] = fn; },
    check: (full, quiet) => { ensure(); if (!DS().init) return init(); return pass(!!full, !!quiet); },
    init: () => { ensure(); return init(); },
    caps: () => Object.keys(DEED_CAP).map(k => ({ key: k, raw: BSUM[k] || 0, cap: DEED_CAP[k], v: deedBonus(k) })),
    titles: () => titleList(),
    setNum: v => { if (!S.settings || typeof S.settings !== 'object') S.settings = {}; S.settings.num = v === 'sci' ? 'sci' : 'letters'; syncNum(); save(); return S.settings.num; },
    num: () => (S.settings && S.settings.num) === 'sci' ? 'sci' : 'letters',
    stats: () => ({ n: Object.assign({}, N()), g: JSON.parse(JSON.stringify(DS().g)), rec: Object.assign({}, DS().rec), since: Object.assign({}, DS().since), light: lightHours() }),
    _cur: id => TR[id] ? cur(TR[id]) : 0, _tierOf: (id, v) => TR[id] ? tierOf(TR[id], v) : 0, _rebuild: () => { rebuildBonus(); dirtyPts(); }, _clock: () => clock
  };
}
