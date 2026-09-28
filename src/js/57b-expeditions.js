// 57b-expeditions: Expeditions (docs/design/expeditions.md, with the coordinator's decisions:
// the grade is shown before sending, nothing fails, a team repeats up to 3 runs in a row while
// away, and companions earn a little XP, capped below the party).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Rules: benched companions who are resting (campFree) go out in teams of 1 to 3 on a route
// whose band is cleared. The grade comes from the route's two needs and the team's power, and
// it alone sets the size of the haul. At send the grade, a seed and the whole haul (with the
// bonus rolls) are fixed and stored in the slot, so reloading cannot reroll it and an open or
// closed game pays the same. Only three things happen on return: token rolls (through the
// unlock pity code, with seeded rolls), which Lore page the quarters fill, and whether a found
// Keepsake turns into a Trophy. Timers are wall-clock timestamps, so runs finish offline.
// While the game is open a finished run waits for Collect; while it is closed (the away phase)
// it is collected on its own and listed on the away card. Repeat (Map Room Lv 5) sends the
// same team again at once, up to EXPED_TUNE.repMax runs in a row, then the run waits.
//
// Exposed names:
//   data   EXPED_TUNE, EXPED_BANDS, EXPED_ROUTES (id -> route), EXPED_ROUTE_IDS, EXPED_GRADES,
//          EXPED_KEEPSAKES, EXPED_LORE
//   read   expedOpen(), expedSlots(), expedLengths(), expedFree() (free slots),
//          expedRoutes() -> open route ids, expedBandOpen(b), ePow(id), expedR(band),
//          expedGrade(r, team) -> { pts, g, name, mult, rolls, pow, R, needs: [{ label, met }], hint },
//          expedPreview(r, team, h) -> { grade, lines: [{ k, key, n, txt }], rolls },
//          expedBest(r, h?) -> team ids, expedCan(r, team, h) -> { ok, why },
//          expedOut(id) -> slot | null, expedRumour() -> route id | null, expedLoreFound()
//   act    expedSend(r, team, h) -> slot | null, expedCollect(i) -> result | null,
//          expedCollectAll() -> n, expedRecall(i) -> result | null, expedRepeat(i, on) -> bool,
//          expedCatchUp(now, auto) -> [results]
//
// Events: expedSent { r, grade, h, team }, expedBack { r, grade, haul, auto, recall, g, team, circles }
//         (g: grade index; circles: { circle: members } of the returning team, for Circle Sigils in 55-legend),
//         expedPick { id } (the Roster board's Send button; the UI opens the send sheet),
//         expedGoto (the Map Room's Expeditions button). Emits kingslayerCredit { n } (56c).
// Hooks used: registerBenchStatus / registerBenchSend / registerCampAction('maproom') /
//   campFree / campMapRoom / bonus('expSlots') (57-camp), mod('expHaul') (Wayfarer Blessing,
//   Fair Winds Omen), unlockTokenRoll / addRenown (56c), addTrophy (55-gathering),
//   addCharXp / partyLevel / cxpNeed (56-roster), registerGoal, registerAwayLine.
//
// Save: registerState('exped', { v, slots, done, lore, court, keep, log, seq }).
//   slots: [{ r, team, h, start, end, seed, grade, rep, repOn, pay }]
//     grade 0..3 (Fair, Good, Great, Perfect); rep = runs finished in this chain;
//     pay = the fixed haul: { mats: [[fam, t, n]], troph: [[i, n]], ren, tok, lq, ks, keep, xp,
//           bonus: { mats, troph, lq, keep, ren } } (bonus rolls are kept apart for Call back).
//   done: route -> runs; lore: page id -> quarters (4 = found); court: Kingslayer credit given;
//   keep: keepsake id -> 1; log: last 10 { r, grade, haul, at }; seq: seeds sent so far.

const EXPED_TUNE = {
  openZone: 8,                         // without a Map Room hook: open here with 1 slot
  gathered: 75,                        // (tuned, spec 90) units per hour of a gathered family
  fought: 30,                          // (tuned, spec 60) Hide and Essence per hour
  troph: 0.25,                         // (tuned, spec 0.35) Trophies per hour
  tokHours: 3, renHours: 2,            // one token roll per 3h, 1 Renown per 2h
  xp: 0.15,                            // (tuned, spec 0.2) share of a level per hour
  xpGap: 5,                            // expedition XP stops at party level - 5
  lengths: [1, 4, 8, 12],
  lenF: { 1: 1.2, 4: 1.0, 8: 0.9, 12: 0.85 },
  teamF: [0, 0.45, 0.75, 1.0],
  court: [3, 5, 8, 10], courtMax: 50,  // Kingslayer credit per grade (Fair given 3, spec none)
  repMax: 3,                           // runs in a row with Repeat on
  rumour: 1.5, rumourTavern: 3,
  logMax: 10
};
const EXPED_GRADES = [
  { n: 'Fair', mult: 0.6, rolls: 0, col: '#A9B1BD' },
  { n: 'Good', mult: 1.0, rolls: 0, col: '#8FD18A' },
  { n: 'Great', mult: 1.3, rolls: 1, col: '#7FB2FF' },
  { n: 'Perfect', mult: 1.6, rolls: 2, col: '#F2C14E' }
];
// Region 1: 5 bands of 7 zones. A band opens when its last boss is beaten (maxZone > z1).
const EXPED_BANDS = [null,
  { b: 1, z0: 1, z1: 7, t: 1, n: 'Band I' },
  { b: 2, z0: 8, z1: 14, t: 2, n: 'Band II' },
  { b: 3, z0: 15, z1: 21, t: 3, n: 'Band III' },
  { b: 4, z0: 22, z1: 28, t: 4, n: 'Band IV' },
  { b: 5, z0: 29, z1: 35, t: 5, n: 'Band V' }
];
// Needs: { k: 'circle'|'role'|'char'|'size'|'avg'|'rarity', v, n }. twice: the one need counts twice.
// f: family shares. T: trophy types (zone type index) or 'any2'. K: token character. L: Lore.
// R: Renown. ks: Kingslayer credit. xp2: double XP. only: fixed length. req: a need that must be met.
const EXPED_ROUTES = {
  r1a: { n: 'Mossy Hollow Rounds', b: 1, f: { wood: 0.7, herb: 0.3 }, needs: [{ k: 'circle', v: 'hedgefolk' }, { k: 'role', v: 'striker' }] },
  r1b: { n: 'Batwing Echoes', b: 1, f: { hide: 0.6, crystal: 0.4 }, needs: [{ k: 'role', v: 'tank' }, { k: 'char', v: 'wren' }] },
  r1c: { n: 'The Old Bonefield Road', b: 1, L: true, R: true, needs: [{ k: 'role', v: 'support' }, { k: 'size', n: 2 }] },
  r2a: { n: 'Barrow Silk', b: 2, f: { fibre: 0.6, hide: 0.4 }, needs: [{ k: 'role', v: 'tank' }, { k: 'circle', v: 'oath' }] },
  r2b: { n: 'Spore Gardens', b: 2, f: { herb: 0.6, ess: 0.4 }, needs: [{ k: 'role', v: 'support' }, { k: 'role', v: 'caster' }] },
  r2c: { n: 'Quarry Scouting', b: 2, T: [5, 2], needs: [{ k: 'role', v: 'tank' }, { k: 'avg', n: 30 }] },
  r2d: { n: 'Hedge Muster', b: 2, R: true, xp2: true, twice: true, needs: [{ k: 'circle', v: 'hedgefolk', n: 3 }] },
  r3a: { n: 'Wraithmarsh Reeds', b: 3, f: { fibre: 0.5, ess: 0.5 }, needs: [{ k: 'role', v: 'caster' }, { k: 'circle', v: 'wayfarers' }] },
  r3b: { n: 'Quarry Night Shift', b: 3, K: 'grenna', f: { ore: 0.6 }, needs: [{ k: 'role', v: 'tank' }, { k: 'role', v: 'caster' }] },
  r3c: { n: 'Dusk Errand', b: 3, K: 'isolde', f: { hide: 0.6 }, needs: [{ k: 'role', v: 'striker' }, { k: 'circle', v: 'dusk' }] },
  r3d: { n: "The Wayfarers' Crossing", b: 3, f: { ess: 0.5 }, R: true, xp2: true, needs: [{ k: 'circle', v: 'wayfarers', n: 2 }, { k: 'avg', n: 45 }] },
  r4a: { n: 'Deep Geodes', b: 4, f: { crystal: 0.6, ore: 0.4 }, needs: [{ k: 'rarity', v: 'rare' }, { k: 'role', v: 'tank' }] },
  r4b: { n: 'The Chapel Ruins', b: 4, L: true, R: true, needs: [{ k: 'role', v: 'support' }, { k: 'circle', v: 'oath' }] },
  r4c: { n: 'Hunting the Barrows', b: 4, T: [3, 1, 0], f: { hide: 0.5 }, needs: [{ k: 'role', v: 'striker', n: 2 }, { k: 'avg', n: 60 }] },
  r5a: { n: 'Emberwood', b: 5, f: { wood: 0.5, crystal: 0.5 }, needs: [{ k: 'rarity', v: 'epic' }, { k: 'circle', v: 'hedgefolk' }] },
  r5b: { n: 'The Drowned Road', b: 5, L: true, f: { ess: 0.6 }, needs: [{ k: 'role', v: 'caster' }, { k: 'role', v: 'support' }] },
  r5c: { n: "Wyrm's Wake", b: 5, T: 'any2', f: { herb: 0.5 }, needs: [{ k: 'role', v: 'tank' }, { k: 'rarity', v: 'legendary' }] },
  r5d: { n: 'The Hollow Court', b: 5, ks: true, L: 'court', only: 8, req: 0, needs: [{ k: 'char', v: 'aldric' }, { k: 'circle', v: 'dusk' }] }
};
const EXPED_ROUTE_IDS = Object.keys(EXPED_ROUTES).sort((a, b) => EXPED_ROUTES[a].b - EXPED_ROUTES[b].b || (a < b ? -1 : 1));
// Keepsakes: camp decorations, one per route with a material or trophy focus. Cosmetic only.
const EXPED_KEEPSAKES = {
  r1a: 'Mossy Lantern', r1b: 'Batwing Kite', r2a: 'Silk Banner', r2b: 'Glowcap Jar', r2c: "Golem's Lamp",
  r3a: 'Reed Flute', r3b: 'Night-Shift Pick', r3c: 'Dusk Candle', r4a: 'Geode Bowl', r4c: 'Beetle-Shell Drum',
  r5a: 'Ember Chimes', r5c: 'Wyrm Scale Shield'
};
// Lore pages: 5 per band (titles; the texts are a writing task) and 3 for the Hollow Court.
const EXPED_LORE = {
  1: ['The First Lamp', 'Moss and Memory', 'Wings in the Dark', 'The Bonefield Bells', 'A Road Relit'],
  2: ['Barrow Songs', 'The Spore Gardener', 'Stone That Walks', 'The Old Muster', 'Silk and Salt'],
  3: ['Reeds That Whisper', 'The Night Shift', 'A Dusk Contract', 'The Crossing', 'Wraithlight'],
  4: ['The Chapel Bell', 'Geode Hearts', 'Barrow Kings', 'The Last Prayer', 'Under the Ruins'],
  5: ['Emberwood', 'The Drowned Road', "The Wyrm's Wake", 'Letters from the Coast', 'The Great Lantern'],
  court: ["The King's Blade", 'An Empty Throne', 'Corvin Agrees to Meet You']
};

let expedOpen, expedSlots, expedLengths, expedFree, expedRoutes, expedBandOpen, ePow, expedR, expedGrade, expedPreview,
  expedBest, expedCan, expedOut, expedRumour, expedLoreFound, expedSend, expedCollect, expedCollectAll, expedRecall,
  expedRepeat, expedCatchUp, expedHaulText, expedRoom;   // expedRoom(i): "" or why the haul waits (H3)

{
  registerState('exped', { v: 1, slots: [], done: {}, lore: {}, court: 0, keep: {}, log: [], seq: 0 });
  const X = () => S.exped;
  const T = EXPED_TUNE;
  const RT = r => EXPED_ROUTES[r];
  const now = () => Date.now();
  const HOUR = 3600 * 1000;
  const fn = f => typeof f === 'function';

  // ---------------- slots, lengths, open ----------------
  const mapRoom = () => { try { return typeof campMapRoom === 'function' ? campMapRoom() : null; } catch (e) { return null; } };
  expedSlots = () => {
    const m = mapRoom();
    if (!m) return S.maxZone >= T.openZone ? 1 : 0;
    return m.slots > 0 ? Math.max(0, Math.floor(bonus('expSlots'))) : 0;
  };
  expedLengths = () => { const m = mapRoom(), max = m ? m.route : 4; return T.lengths.filter(h => h <= max); };
  const repeatOn = () => { const m = mapRoom(); return !!(m && m.repeat); };
  expedOpen = () => expedSlots() > 0 && rosterLive();
  expedFree = () => Math.max(0, expedSlots() - X().slots.length);
  expedBandOpen = b => !!EXPED_BANDS[b] && S.maxZone > EXPED_BANDS[b].z1;
  expedRoutes = () => EXPED_ROUTE_IDS.filter(r => expedBandOpen(RT(r).b));

  // ---------------- power and needs ----------------
  ePow = id => { const c = charRec(id); return c ? 10 * CHAR_RARITY[ROSTER[id].rarity].m * c.lv * Math.pow(2, c.rank) : 0; };
  expedR = b => { const par = 3 * EXPED_BANDS[b].z1; return 3 * 10 * par * Math.pow(2, Math.floor(par / 25)); };
  const RAR = ['common', 'rare', 'epic', 'legendary'];
  const CIRC = { hedgefolk: ['a Hedgefolk', 'Hedgefolk'], oath: ['an Oath member', 'Oath members'], dusk: ['a Dusk Company member', 'Dusk Company'], wayfarers: ['a Wayfarer', 'Wayfarers'] };
  const firstName = id => ROSTER[id].name.replace(/^(Ser|Old|Brother|Saint) /, '').split(' ')[0];
  const needLabel = d => {
    const n = d.n || 1;
    if (d.k === 'circle') return n > 1 ? `${n} ${CIRC[d.v][1]}` : CIRC[d.v][0];
    if (d.k === 'role') { const r = ROLE_STATS[d.v].n.toLowerCase(); return n > 1 ? `${n} ${r}s` : `a ${r}`; }
    if (d.k === 'char') return firstName(d.v);
    if (d.k === 'size') return `${n}+ companions`;
    if (d.k === 'avg') return `average Lv ${n}+`;
    if (d.k === 'rarity') return `a${d.v === 'epic' ? 'n' : ''} ${CHAR_RARITY[d.v].n}${d.v === 'legendary' ? '' : ' or better'}`;
    return '?';
  };
  const needMet = (d, team) => {
    const n = d.n || 1, ok = team.filter(isRecruited);
    if (d.k === 'circle') return ok.filter(k => ROSTER[k].circle === d.v).length >= n;
    if (d.k === 'role') return ok.filter(k => ROSTER[k].role === d.v).length >= n;
    if (d.k === 'char') return ok.includes(d.v);
    if (d.k === 'size') return ok.length >= n;
    if (d.k === 'avg') return ok.length > 0 && ok.reduce((a, k) => a + charRec(k).lv, 0) / ok.length >= n;
    if (d.k === 'rarity') return ok.some(k => RAR.indexOf(ROSTER[k].rarity) >= RAR.indexOf(d.v));
    return false;
  };
  expedGrade = (r, team) => {
    const d = RT(r); team = (team || []).filter(Boolean);
    const needs = d.needs.map(x => ({ label: needLabel(x), met: needMet(x, team) }));
    const R = expedR(d.b), pow = team.reduce((a, k) => a + ePow(k), 0);
    let pts = needs.filter(x => x.met).length * (d.twice ? 2 : 1) + (pow >= R ? 1 : 0) + (pow >= 1.5 * R ? 1 : 0);
    if (!team.length) pts = 0;
    const g = pts >= 4 ? 3 : pts === 3 ? 2 : pts === 2 ? 1 : 0, G = EXPED_GRADES[g];
    let hint = '';
    if (g < 3) {
      const miss = needs.find(x => !x.met), next = EXPED_GRADES[g + 1].n;
      if (miss) hint = `Add ${miss.label} for ${next}`;
      else hint = `Power ${fmt(pow < R ? R : 1.5 * R)} for ${next}`;
    }
    return { pts, g, name: G.n, mult: G.mult, rolls: G.rolls, pow, R, needs, hint };
  };

  // ---------------- the haul ----------------
  const FOUGHT = { hide: 1, ess: 1 };
  const rate = f => FOUGHT[f] ? T.fought : T.gathered;
  // Expected amounts before rounding (the preview). m = mod('expHaul') x rumour, at send.
  function expect(r, n, h, g, m) {
    const d = RT(r), t = EXPED_BANDS[d.b].t, k = T.lenF[h] * T.teamF[Math.min(3, n)] * EXPED_GRADES[g].mult;
    const out = { mats: [], troph: [], ren: 0, tok: 0, lq: 0, ks: 0 };
    for (const [f, s] of Object.entries(d.f || {})) out.mats.push([f, t, rate(f) * h * k * m * s]);
    if (d.T) {
      const types = d.T === 'any2' ? null : d.T, tot = T.troph * h * k * m;
      if (types) for (const i of types) out.troph.push([i, tot / types.length]);
      else out.troph.push(['any2', tot]);
    }
    if (d.R) out.ren = h / T.renHours * k;
    if (d.K && !isRecruited(d.K)) out.tok = h / T.tokHours * k;
    if (d.L) out.lq = h >= 4 ? (g >= 1 ? 4 : 2) : 1;
    if (d.ks) out.ks = T.court[g];
    return out;
  }
  const whole = (x, rnd) => { const f = x - Math.floor(x); return Math.floor(x) + (f > 1e-9 && rnd() < f ? 1 : 0); };
  const xpPer = (id, h, g, d) => { const c = charRec(id); return c ? T.xp * cxpNeed(c.lv) * h * EXPED_GRADES[g].mult * (d.xp2 ? 2 : 1) : 0; };
  // The fixed haul for one run, from its seed.
  function rollPay(r, team, h, g, m, seed) {
    const d = RT(r), rnd = rng(seed), e = expect(r, team.length, h, g, m);
    const pay = { mats: [], troph: [], ren: whole(e.ren, rnd), tok: whole(e.tok, rnd), lq: e.lq, ks: e.ks, xp: {}, bonus: { mats: [], troph: [], lq: 0, keep: 0, ren: 0 } };
    for (const [f, t, x] of e.mats) { const n = whole(x, rnd); if (n > 0) pay.mats.push([f, t, n]); }
    for (const [i, x] of e.troph) {
      if (i !== 'any2') { const n = whole(x, rnd); if (n > 0) pay.troph.push([i, n]); continue; }
      const a = Math.floor(rnd() * 7); let b = Math.floor(rnd() * 6); if (b >= a) b++;
      for (const j of [a, b]) { const n = whole(x / 2, rnd); if (n > 0) pay.troph.push([j, n]); }
    }
    for (const id of team) pay.xp[id] = xpPer(id, h, g, d);
    // Bonus rolls (Great 1, Perfect 2): all upside.
    for (let i = 0; i < EXPED_GRADES[g].rolls; i++) {
      const x = rnd();
      if (x < 0.5) {   // extra haul: 25% more of the main focus
        const main = e.mats.slice().sort((p, q) => q[2] - p[2])[0];
        if (main) pay.bonus.mats.push([main[0], main[1], Math.max(1, whole(main[2] * 0.25, rnd))]);
        else if (e.troph.length) pay.bonus.troph.push([Math.floor(rnd() * 7), 1]);
        else pay.bonus.ren += 1;
      } else if (x < 0.75) pay.bonus.troph.push([Math.floor(rnd() * 7), 1]);
      else if (x < 0.9) pay.bonus.lq += 1;
      else pay.bonus.keep += 1;
    }
    pay.tokR = [];
    for (let i = 0; i < pay.tok; i++) pay.tokR.push(rnd());
    return pay;
  }
  expedPreview = (r, team, h) => {
    team = (team || []).filter(Boolean);
    const G = expedGrade(r, team), d = RT(r), lines = [];
    if (!team.length) return { grade: G, lines, rolls: 0 };
    const e = expect(r, team.length, h, G.g, haulMult(r));
    for (const [f, t, x] of e.mats) lines.push({ k: 'mat', key: f, t, n: x, txt: `${fmt(Math.floor(x))} ${matName(f, t)}` });
    const tro = e.troph.reduce((a, x) => a + x[1], 0);
    if (tro > 0) lines.push({ k: 'troph', key: d.T === 'any2' ? 'any' : d.T[0], n: tro, txt: `${tro < 1 ? 'a chance of' : '~' + (Math.round(tro * 10) / 10)} Troph${tro === 1 ? 'y' : 'ies'} (${d.T === 'any2' ? 'any 2 kinds' : d.T.map(i => CRAFT_TROPHIES[i].n).join(', ')})` });
    if (e.tok > 0) lines.push({ k: 'tok', key: d.K, n: e.tok, txt: `${Math.round(e.tok * 10) / 10} rolls for the ${UNLOCK_TUNE.tokens[d.K].name}` });
    else if (d.K) lines.push({ k: 'tok', key: d.K, n: 0, txt: `${firstName(d.K)} is already with you` });
    if (e.ren > 0) lines.push({ k: 'ren', n: e.ren, txt: `~${Math.round(e.ren * 10) / 10} Renown` });
    if (e.lq > 0) lines.push({ k: 'lore', n: e.lq, txt: e.lq >= 4 ? 'A Lore page' : `${e.lq === 2 ? 'Half' : 'A quarter of'} a Lore page` });
    if (e.ks > 0) { const left = Math.max(0, T.courtMax - X().court); lines.push({ k: 'ks', n: Math.min(left, e.ks), txt: left ? `${Math.min(left, e.ks)} boss kills toward Kingslayer (Corvin)` : 'Kingslayer credit is full' }); }
    const xp = team.map(id => xpCapped(id, xpPer(id, h, G.g, d)));
    lines.push({ k: 'xp', n: 0, txt: xp.some(Boolean) ? `Companion XP (${d.xp2 ? 'x2, ' : ''}up to Lv ${xpCap()})` : `No XP: the team is at Lv ${xpCap()}, the expedition limit` });
    return { grade: G, lines, rolls: G.rolls };
  };

  // ---------------- XP with the cap ----------------
  const xpCap = () => Math.max(1, Math.floor(partyLevel()) - T.xpGap);
  const xpCapped = (id, xp) => { const c = charRec(id); return c && c.lv < xpCap() ? xp : 0; };
  // Give XP in small steps so no one passes party level - 5; the rest is dropped.
  function giveXp(id, xp) {
    const c = charRec(id); if (!c || !(xp > 0)) return 0;
    const cap = xpCap(), lv0 = c.lv;
    for (let i = 0; i < 400 && xp > 0 && c.lv < cap; i++) {
      const step = Math.min(xp, cxpNeed(c.lv) * 0.1);
      addCharXp(id, step, true); xp -= step;
      if (c.lv >= levelCap(c.rank) && c.xp >= cxpNeed(c.lv) - 1e-9) break;
    }
    return c.lv - lv0;
  }

  // ---------------- rumour (Tavern Lv 3) ----------------
  expedRumour = () => {
    const t = (typeof campLevel === 'function' ? campLevel('tavern') : 0);
    if (t < T.rumourTavern) return null;
    const open = expedRoutes().filter(r => !RT(r).only); if (!open.length) return null;
    const d = deviceDay(now());
    return open[((d * 7 + 3) % open.length + open.length) % open.length];
  };
  const haulMult = r => mod('expHaul') * (expedRumour() === r ? T.rumour : 1);

  // ---------------- send ----------------
  const fielded = id => !!(S.party && S.party.field && S.party.field.includes(id));
  expedOut = id => X().slots.find(s => s.team.includes(id)) || null;
  const free = id => isRecruited(id) && !fielded(id) && !expedOut(id) && (typeof campFree !== 'function' || campFree(id));
  expedCan = (r, team, h) => {
    const d = RT(r); team = (team || []).filter(Boolean);
    if (!d) return { ok: false, why: 'Unknown route.' };
    if (!expedOpen()) return { ok: false, why: 'Build the Map Room first.' };
    if (!expedBandOpen(d.b)) return { ok: false, why: `Beat the zone ${EXPED_BANDS[d.b].z1} boss first.` };
    if (!expedFree()) return { ok: false, why: 'Every slot is out.' };
    if (!expedLengths().includes(h)) return { ok: false, why: `The Map Room needs a higher level for ${h}h.` };
    if (d.only && h !== d.only) return { ok: false, why: `This route takes ${d.only}h.` };
    if (!team.length) return { ok: false, why: 'Pick 1 to 3 companions.' };
    if (team.length > 3 || new Set(team).size !== team.length) return { ok: false, why: 'A team is 1 to 3 different companions.' };
    for (const id of team) {
      if (!isRecruited(id)) return { ok: false, why: 'Not on your roster.' };
      if (fielded(id)) return { ok: false, why: `${firstName(id)} is in the party. Bench them first.` };
      if (!free(id)) return { ok: false, why: `${firstName(id)} is busy.` };
    }
    if (d.req != null && !needMet(d.needs[d.req], team)) return { ok: false, why: `This route needs ${needLabel(d.needs[d.req])}.` };
    return { ok: true, why: '' };
  };
  const newSeed = () => { X().seq = (X().seq || 0) + 1; return (Math.imul(X().seq, 2654435761) ^ (now() & 0x7fffffff)) >>> 0; };
  function launch(s, start) {
    s.seed = newSeed(); s.start = start; s.end = start + s.h * HOUR;
    s.pay = rollPay(s.r, s.team, s.h, s.grade, s.m, s.seed);
  }
  expedSend = (r, team, h) => {
    team = (team || []).filter(Boolean);
    const c = expedCan(r, team, h); if (!c.ok) return null;
    const G = expedGrade(r, team);
    const s = { r, team: team.slice(), h, start: 0, end: 0, seed: 0, grade: G.g, rep: 0, repOn: false, m: haulMult(r), pay: null };
    launch(s, now());
    X().slots.push(s);
    emit('expedSent', { r, grade: G.name, h, team: team.slice() });
    toast(`${team.map(firstName).join(', ')} set out: ${RT(r).n} (${G.name}). Back in ${h}h.`, 'good', { ic: ['boot', '#6B4A2E'] }, 'low');
    save();
    return s;
  };

  // ---------------- return ----------------
  const loreKey = (b, i) => `${b}-${i}`;
  expedLoreFound = () => Object.values(X().lore).filter(q => q >= 4).length;
  // Quarters go to the first unfinished page of the band (the Hollow Court: its own 3 pages).
  function addLore(band, q) {
    let got = 0;
    const list = EXPED_LORE[band] || [];
    for (let i = 0; i < list.length && q > 0; i++) {
      const k = loreKey(band, i), have = X().lore[k] || 0; if (have >= 4) continue;
      const add = Math.min(4 - have, q); X().lore[k] = have + add; q -= add;
      if (have + add >= 4) got++;
    }
    return got;
  }
  const loreTitles = (band, before) => (EXPED_LORE[band] || []).filter((_, i) => (X().lore[loreKey(band, i)] || 0) >= 4 && !before.includes(i));
  function payOut(s, pay, opts) {
    const d = RT(s.r), haul = { mats: [], troph: [], ren: 0, ks: 0, lore: [], keep: [], tok: null, xp: 0 };
    const addMat = (f, t, n) => { if (!(n > 0)) return; stashAdd(f, t, n, 'gift'); const h = haul.mats.find(x => x[0] === f && x[1] === t); if (h) h[2] += n; else haul.mats.push([f, t, n]); };
    const addTro = (i, n) => { if (!(n > 0)) return; addTrophy(i, n, 'exped'); const h = haul.troph.find(x => x[0] === i); if (h) h[1] += n; else haul.troph.push([i, n]); };
    const k = opts.frac == null ? 1 : opts.frac;
    for (const [f, t, n] of pay.mats) addMat(f, t, Math.floor(n * k));
    for (const [i, n] of pay.troph) addTro(i, Math.floor(n * k));
    const ren = Math.floor(pay.ren * k) + (opts.frac == null ? pay.bonus.ren : 0);
    if (ren > 0 && typeof addRenown === 'function') { addRenown(ren, 'expedition'); haul.ren = ren; }
    let lq = Math.floor(pay.lq * k);
    if (opts.frac == null) {
      for (const [f, t, n] of pay.bonus.mats) addMat(f, t, n);
      for (const [i, n] of pay.bonus.troph) addTro(i, n);
      lq += pay.bonus.lq;
      // Keepsake: the route's own, once; after that a Trophy.
      for (let i = 0; i < pay.bonus.keep; i++) {
        const id = EXPED_KEEPSAKES[s.r] ? s.r : null;
        if (id && !X().keep[id]) { X().keep[id] = 1; haul.keep.push(EXPED_KEEPSAKES[id]); }
        else addTro(zonePlace(EXPED_BANDS[d.b].z0 + (s.seed % 7)), 1);
      }
      // Kingslayer credit (the Hollow Court), capped at 50 in total.
      if (pay.ks > 0) {
        const n = Math.min(pay.ks, Math.max(0, T.courtMax - X().court));
        if (n > 0) { X().court += n; emit('kingslayerCredit', { n }); haul.ks = n; }
      }
      // Token rolls on return, through the pity code, with the run's seeded rolls.
      if (d.K && pay.tokR.length && typeof unlockTokenRoll === 'function') {
        let won = false, rolls = 0;
        for (const x of pay.tokR) { if (isRecruited(d.K)) break; const w = unlockTokenRoll(d.K, x); if (w == null) break; rolls++; if (w) { won = true; break; } }
        haul.tok = { id: d.K, rolls, won };
      }
    }
    if (lq > 0 && d.L) {
      const band = d.L === 'court' ? 'court' : d.b, before = (EXPED_LORE[band] || []).map((_, i) => i).filter(i => (X().lore[loreKey(band, i)] || 0) >= 4);
      addLore(band, lq);
      haul.lore = loreTitles(band, before);
      haul.lq = lq;
    } else if (lq > 0) {   // a Lore scrap on a route without Lore: the band's pages
      const before = EXPED_LORE[d.b].map((_, i) => i).filter(i => (X().lore[loreKey(d.b, i)] || 0) >= 4);
      addLore(d.b, lq); haul.lore = loreTitles(d.b, before); haul.lq = lq;
    }
    // XP, capped below the party.
    for (const id of s.team) { const n = (pay.xp[id] || 0) * (opts.xpFrac == null ? 1 : opts.xpFrac); if (n > 0 && isRecruited(id)) haul.xp += giveXp(id, n); }
    return haul;
  }
  // H3: a haul is a parcel. It lands only when every line fits the Storehouse; until then the run waits.
  const haulLines = (s, k) => k == null ? s.pay.mats.concat(s.pay.bonus.mats) : s.pay.mats.map(([f, t, n]) => [f, t, Math.floor(n * k)]);
  expedRoom = i => { const s = X().slots[i]; return !s || !s.pay ? '' : stashNeed(haulLines(s)); };
  function finishRun(s, opts) {
    const haul = payOut(s, s.pay, opts);
    X().done[s.r] = (X().done[s.r] || 0) + 1;
    const G = EXPED_GRADES[s.grade].n;
    const rec = { r: s.r, grade: G, haul, at: opts.at || now(), h: s.h, team: s.team.slice(), recall: !!opts.recall };
    X().log.unshift(rec); if (X().log.length > T.logMax) X().log.length = T.logMax;
    const circles = {}; for (const k of s.team) if (ROSTER[k] && isRecruited(k)) circles[ROSTER[k].circle] = (circles[ROSTER[k].circle] || 0) + 1;
    emit('expedBack', { r: s.r, grade: G, haul, auto: !!opts.auto, recall: !!opts.recall, g: s.grade, team: s.team.slice(), circles });
    return rec;
  }
  // A landed run: Repeat sends the team again at the old end time, up to repMax runs in a row.
  function land(s, auto) {
    const out = [];
    for (let guard = 0; guard < 100 && s.end <= now(); guard++) {
      const again = s.repOn && repeatOn() && s.rep + 1 < T.repMax;
      if (!again && !auto) break;   // open game: the run waits for Collect
      if (!stashFits(haulLines(s))) break;   // H3: Storehouse full; the run waits (Repeat pauses)
      out.push(finishRun(s, { auto: true, at: s.end }));
      s.rep++;
      if (!again) { X().slots.splice(X().slots.indexOf(s), 1); break; }
      launch(s, s.end);
    }
    return out;
  }
  expedCatchUp = (t, auto) => {
    const out = [];
    for (const s of X().slots.slice()) if (s.end <= (t || now())) out.push(...land(s, auto));
    return out;
  };
  expedCollect = i => {
    const s = X().slots[i]; if (!s || s.end > now()) return null;
    if (!stashFits(haulLines(s))) { toast(`Back. Storehouse full: collect when you have room. ${stashNeed(haulLines(s))}`, 'raid', null, 'normal'); return null; }
    const rec = finishRun(s, {});
    X().slots.splice(i, 1);
    toast(`${RT(s.r).n}: the team is back (${rec.grade}).`, 'good', { ic: ['boot', '#6B4A2E'] }, 'low');
    save();
    return rec;
  };
  expedCollectAll = () => { let n = 0; for (let i = X().slots.length - 1; i >= 0; i--) if (X().slots[i].end <= now() && expedCollect(i)) n++; return n; };
  // Call back: home now with half the haul for the time spent, all XP earned so far, no bonus rolls.
  expedRecall = i => {
    const s = X().slots[i]; if (!s) return null;
    if (s.end <= now()) return expedCollect(i);
    const frac = Math.max(0, Math.min(1, (now() - s.start) / (s.end - s.start)));
    if (!stashFits(haulLines(s, frac * 0.5))) { toast(stashNeed(haulLines(s, frac * 0.5)), 'raid', null, 'normal'); return null; }   // H3
    const rec = finishRun(s, { frac: frac * 0.5, xpFrac: frac, recall: true });
    X().slots.splice(i, 1);
    save();
    return rec;
  };
  expedRepeat = (i, on) => { const s = X().slots[i]; if (!s || !repeatOn()) return false; s.repOn = !!on; if (on) s.rep = 0; save(); return true; };

  // ---------------- best team ----------------
  // The best grade (and a full team for the haul), preferring the lowest levels.
  expedBest = (r, h) => {
    const d = RT(r), pool = benchPool().slice(0, 17);
    let best = null;
    const consider = team => {
      if (d.req != null && !needMet(d.needs[d.req], team)) return;
      const G = expedGrade(r, team), score = G.mult * T.teamF[team.length] * 1e6 - team.reduce((a, k) => a + charRec(k).lv, 0);
      if (!best || score > best.score) best = { team, score };
    };
    for (let a = 0; a < pool.length; a++) {
      consider([pool[a]]);
      for (let b = a + 1; b < pool.length; b++) {
        consider([pool[a], pool[b]]);
        for (let c = b + 1; c < pool.length; c++) consider([pool[a], pool[b], pool[c]]);
      }
    }
    return best ? best.team : [];
  };
  const benchPool = () => (rosterLive() ? rosterList() : []).filter(free);

  // ---------------- the Roster board ----------------
  const left = s => { const m = Math.ceil(Math.max(0, s.end - now()) / 60000); return m <= 0 ? 'back' : m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60 ? ' ' + (m % 60) + 'm' : ''}`; };
  if (typeof registerBenchStatus === 'function') registerBenchStatus(id => {
    const s = expedOut(id); if (!s) return null;
    return { status: 'exped', label: `Out: ${RT(s.r).n}`, sub: s.end <= now() ? 'back, ready to collect' : `${left(s)} left` };
  });
  if (typeof registerBenchSend === 'function') registerBenchSend({
    id: 'exped', label: 'Send',
    can: () => !expedOpen() ? { ok: false, why: 'Build the Map Room first.' } : !expedFree() ? { ok: false, why: 'Every slot is out.' } : !expedRoutes().length ? { ok: false, why: 'Beat the zone 7 boss first.' } : { ok: true },
    fn: id => emit('expedPick', { id })
  });
  if (typeof registerCampAction === 'function') registerCampAction('maproom', { label: 'Expeditions', show: () => expedOpen(), fn: () => emit('expedGoto', {}) });

  // ---------------- ticks and away ----------------
  let acc = 0;
  onTick(dt => {
    acc += dt; if (acc < 1) return; acc = 0;
    if (!X().slots.length) return;
    const got = expedCatchUp(now(), false);
    for (const x of got) toast(`${RT(x.r).n}: the team came back (${x.grade}) and set out again.`, 'good', { ic: ['boot', '#6B4A2E'] }, 'low');
    if (got.length) save();
  });
  let awayBack = [];
  // The away card only shows after 30s away; a quicker reload leaves landed runs for Collect.
  on('away', r => { awayBack = !r || !(r.secs < 30) ? expedCatchUp(now(), true) : []; });
  const haulText = h => {
    const out = [];
    for (const [f, t, n] of h.mats) out.push(`${fmt(n)} ${matName(f, t)}`);
    for (const [i, n] of h.troph) out.push(`${n} ${CRAFT_TROPHIES[i].n}`);
    if (h.ren) out.push(`${h.ren} Renown`);
    if (h.ks) out.push(`${h.ks} Kingslayer credit`);
    if (h.lore && h.lore.length) out.push(`Lore: ${h.lore.join(', ')}`);
    else if (h.lq) out.push(`${h.lq === 1 ? 'a quarter' : h.lq + ' quarters'} of a Lore page`);
    if (h.keep && h.keep.length) out.push(`Keepsake: ${h.keep.join(', ')}`);
    if (h.tok) out.push(h.tok.won ? `${UNLOCK_TUNE.tokens[h.tok.id].name}!` : `${h.tok.rolls} token roll${h.tok.rolls === 1 ? '' : 's'}, no luck yet`);
    if (h.xp) out.push(`+${h.xp} companion level${h.xp === 1 ? '' : 's'}`);
    return out.join(', ');
  };
  expedHaulText = haulText;
  registerAwayLine(() => {
    const out = awayBack.map(x => ({ icon: { ic: ['boot', EXPED_GRADES.find(g => g.n === x.grade).col] }, group: 'Expeditions',
      txt: `Expedition back: ${RT(x.r).n} (${x.grade})`, sub: haulText(x.haul) || 'Home safe.', go: () => emit('expedGoto', {}) }));
    awayBack = [];
    const outNow = X().slots.filter(s => s.end > now());
    if (out.length && outNow.length) out.push({ icon: { ic: ['boot', '#6B4A2E'] }, group: 'Expeditions', txt: `${outNow.length} still out`, sub: outNow.map(s => `${RT(s.r).n}: ${left(s)}`).join(' · ') });
    return out;
  });

  // ---------------- Next Up ----------------
  const icB = { ic: ['boot', '#6B4A2E'] }, go = { tab: 'world', sel: '#sec-exped' };
  const landed = () => X().slots.find(s => s.end <= now()) || null;
  const soonest = () => X().slots.filter(s => s.end > now()).sort((a, b) => a.end - b.end)[0] || null;
  registerGoal({ id: 'exped-ready', sys: 'exped', prio: 2, icon: icB, go,
    label: () => { const s = landed(); return s ? `${RT(s.r).n}: ready to collect` : ''; },
    pct: () => landed() ? 1 : 0 });
  registerGoal({ id: 'exped-timer', sys: 'exped', icon: icB, go,
    label: () => { const s = soonest(); return s ? `Expedition back in ${left(s)}` : ''; },
    pct: () => { const s = soonest(); return s ? Math.min(0.99, Math.max(0.01, (now() - s.start) / Math.max(1, s.end - s.start))) : 0; } });
  registerGoal({ id: 'exped-free', sys: 'exped', icon: icB, go,
    label: () => 'A Map Room slot is free: send a team',
    pct: () => expedOpen() && expedFree() > 0 && expedRoutes().length && benchPool().length ? 0.9 : 0 });
}
