// 56f-bonds: Bonds grow with time fielded together (plan-3 task F2; docs/design/formation.md 2.3,
// 2.4, 3.1, 3.3; lore.md 6.3). A Bond is a named pair: two companions, or the hero of one class and a
// companion. 56b-synergy.js owns the 21 Bond entries (SYNERGIES, layer 'bond') and their effects;
// this file owns the time, the levels, growth, the seeds for old saves, stories and the Sworn hook.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Levels (FORM_TUNE.bondH hours, bondX strength): 0 Not yet, 1 Met 0.5h 50%, 2 Friends 3h 75% (story 1),
// 3 Trusted 12h 100%, 4 Close 36h 115% (story 2), 5 Sworn 150h 130% (the Sworn line; D5 reads it).
// Growth, while both are in the party (time is never lost; benching pauses a Bond):
//   fighting live (zones, bosses, the Deepwell, the raid): 1 s per s; away (fight or raid): bondAway;
//   at the Hearth while the hero gathers (companion pairs only, live or away x bondAway): bondCamp;
//   on the same expedition team (companion pairs, on return, for the time out): bondExped;
//   Old Friend (a companion member's L25 milestone, Legendaries from L1): x oldFriend, once per Bond.
//
// Save: registerState('bond', { v, t, lv, seen })
//   v     0 | 1   seed version: 0 = an old save not seeded yet (3.3); new games go to 1 with nothing
//   t     { id: seconds together }        only rises
//   lv    { id: last level announced }     for bondLevel events and What's new (levels come from t)
//   seen  { id: stories read, 0-2 }
//
// Exposed names:
//   data   BOND_IDS (21 ids, SYNERGIES order)
//   read   bondLevel(id) -> 0-5, bondTime(id) -> s, bondStrength(id) -> 0 | bondX (without Common Cause),
//          bondToNext(id) -> s to the next level (0 at Sworn), bondOldFriend(id) -> bool,
//          bondInfo(id) -> { id, name, pair, cls, lv, lvName, t, next: { lv, name, at, left } | null,
//                            strength (with Common Cause), together, rate, oldFriend, stories, sworn, unread }
//          bondsOf(key, all) -> [ids]   key: 'hero' or a character id; the hero's are this class's unless all
//          partyBonds() -> [ids]        the Bonds of the pairs in the party now (hero-A, hero-B, A-B), any level
//          bondStories(id) -> [{ title, text | null, lv, open, read }] x 2 (text null: "Story coming soon")
//          bondUnread(id) / bondUnreadAll() -> stories open, written and not read (the dot)
//          bondSworn(id) -> line | null  (at Sworn, once LORE7 writes it)
//          swornOf(charId) -> [ids]     that character's Sworn Bonds (D5: the Lanternborn path opens at one)
//          bondCounts() -> { byLv: [n0..n5], met, friends, trusted, close, sworn, total, maxLv }  (AC2 probes)
//          bondText(id, lv) -> { msg, prio }   the level-up toast copy (6.3), for F4
//   act    bondRead(id, i) -> bool      mark story i read (in order, once open and written)
//          bondAdd(id, secs, quiet) -> levels gained; bondSet(id, lv) (sim --bond, tests: quiet)
//          bondEnsure()                 the old-save seeds, once per loaded save (56b calls it first)
// Events: bondLevel { id, lv, prev, quiet, story: 0 | 1 | 2, sworn } (a level reached; quiet for
//         seeds and away), bondStory { id, i } (a story read).
// Hooks used: onTick (live growth), on('away') + registerAwayLine (away growth and its line),
//   on('fieldChange') (the party pairs), whatsNew (the Bond line
//   for old saves and "Your old friends kept their Bonds.").
// Story text: BOND_STORIES / BOND_SWORN in 21f-stories-bonds.js (LORE7); titles in SYNERGIES.

var bondLevel, bondEnsure, bondToNext, bondRev = 0;   // var: 56b (loaded earlier) asks by typeof
let BOND_IDS, bondTime, bondStrength, bondOldFriend, bondInfo, bondsOf, partyBonds, bondStories, bondUnread, bondUnreadAll,
  bondSworn, swornOf, bondCounts, bondText, bondRead, bondAdd, bondSet;

{
  const FT = FORM_TUNE;
  registerState('bond', { v: 0, t: {}, lv: {}, seen: {} });
  const DEFS = SYNERGIES.filter(d => d.layer === 'bond');
  const DEF = {};
  for (const d of DEFS) DEF[d.id] = d;
  BOND_IDS = DEFS.map(d => d.id);
  // The 9 old named pairs and Lantern's Chosen (formation.md 2.4): seeded from the old field (3.3).
  const CONVERTED = ['oldoath', 'lampward', 'kindlestar', 'markleap', 'hunting', 'bellsong', 'waxkindle', 'mirelamp', 'oldenemies', 'chosen'];
  const STORY_LV = [2, 4];
  const BOND_NEWS = 'Pairs who fight side by side now build Bonds. See Party > Team.';   // formation.md 3.2 item 6
  const B = () => S.bond;
  const H = h => h * 3600;
  const rec = k => (typeof charRec === 'function' ? charRec(k) : null);
  const comps = d => d.pair.filter(k => k !== 'hero');
  const clsOk = d => !d.cls || !!(S.party && S.party.cls === d.cls);
  const nm = k => k === 'hero' ? 'You' : ROSTER[k].name.replace(/^(Old|Ser|Brother|Saint) /, '').split(' ')[0];
  const levelAt = t => { let lv = 0; for (let i = 0; i < FT.bondH.length; i++) if (t >= H(FT.bondH[i]) - 1e-6) lv = i + 1; return lv; };
  function shape() {
    const b = B();
    for (const k of ['t', 'lv', 'seen']) if (!b[k] || typeof b[k] !== 'object' || Array.isArray(b[k])) b[k] = {};
    if (!(b.v >= 0)) b.v = 0;
  }
  const isOldFriend = k => !!ROSTER[k] && (ROSTER[k].rarity === 'legendary' || (!!rec(k) && rec(k).lv >= SYN_TUNE.bondLv));

  bondTime = id => { const b = B(), t = b && b.t && b.t[id]; return t > 0 && Number.isFinite(t) ? t : 0; };
  bondLevel = id => DEF[id] ? levelAt(bondTime(id)) : 0;
  bondStrength = id => { const lv = bondLevel(id); return lv ? FT.bondX[lv - 1] || 0 : 0; };
  bondToNext = id => { const lv = bondLevel(id); return lv >= FT.bondH.length ? 0 : Math.max(0, H(FT.bondH[lv]) - bondTime(id)); };
  bondOldFriend = id => !!DEF[id] && comps(DEF[id]).some(isOldFriend);

  // ---------------- time and levels ----------------
  // Adds secs; a level reached is announced once (S.bond.lv), with bondLevel.
  function grow(id, secs, quiet, ups) {
    if (!(secs > 0) || !DEF[id]) return 0;
    const b = B(), before = bondLevel(id);
    b.t[id] = bondTime(id) + secs;
    const lv = bondLevel(id);
    if (lv === before) return 0;
    bondRev++;
    const prev = b.lv[id] | 0;
    if (lv > prev) {
      b.lv[id] = lv;
      if (ups) ups.push({ id, lv });
      emit('bondLevel', { id, lv, prev, quiet: !!quiet, story: lv === STORY_LV[0] ? 1 : lv === STORY_LV[1] ? 2 : 0, sworn: lv >= FT.bondH.length });
    }
    return lv - before;
  }
  bondAdd = (id, secs, quiet) => { bondEnsure(); return grow(id, secs, quiet !== false); };
  bondSet = (id, lv) => {
    if (!DEF[id]) return false;
    bondEnsure();
    const n = Math.max(0, Math.min(FT.bondH.length, lv | 0));
    B().t[id] = n ? H(FT.bondH[n - 1]) : 0;
    B().lv[id] = Math.max(B().lv[id] | 0, n);
    bondRev++;
    emit('bondLevel', { id, lv: n, prev: n, quiet: true, story: 0, sworn: n >= FT.bondH.length });
    return true;
  };

  // ---------------- who is together ----------------
  // The Bonds whose members are all in the party now; cached per field and class.
  const pc = { S: null, f: null, n: -1, cls: undefined, list: [] };
  function pairsNow() {
    const p = S.party; if (!p) return [];
    const f = p.field;
    if (pc.S === S && pc.f === f && pc.n === (f ? f.length : -1) && pc.cls === p.cls) return pc.list;
    const max = (ROSTER_TUNE && ROSTER_TUNE.fieldMax) || 2;
    const ids = (f || []).filter(k => ROSTER[k] && rec(k)).slice(0, max);
    pc.S = S; pc.f = f; pc.n = f ? f.length : -1; pc.cls = p.cls;
    pc.list = DEFS.filter(d => clsOk(d) && comps(d).every(k => ids.includes(k))).map(d => ({ id: d.id, comp: !d.pair.includes('hero') }));
    return pc.list;
  }
  partyBonds = () => pairsNow().map(x => x.id);
  // Growth rate now for one Bond (0 when not growing).
  const actRate = (x, act) => act === 'fight' || act === 'raid' ? 1 : act === 'gather' && x.comp ? FT.bondCamp : 0;
  const rateOf = (x, act) => actRate(x, act) * (bondOldFriend(x.id) ? FT.oldFriend : 1);
  const ready = () => !!(S && S.bond && S.party && S.party.formV >= 1 && typeof rosterLive === 'function' && rosterLive());

  // ---------------- growth ----------------
  onTick(dt => {
    if (!(dt > 0) || !ready()) return;
    bondEnsure();
    const act = S.activity;
    for (const x of pairsNow()) { const r = rateOf(x, act); if (r > 0) grow(x.id, dt * r, false); }
  });
  let awayUps = [];
  on('away', r => {
    if (!r || !(r.t > 0) || !ready()) return;
    bondEnsure();
    const act = S.activity;
    for (const x of pairsNow()) { const k = rateOf(x, act); if (k > 0) grow(x.id, r.t * k * FT.bondAway, true, awayUps); }
  });
  registerAwayLine(() => {
    if (!awayUps.length) return null;
    const best = {};
    for (const u of awayUps) best[u.id] = Math.max(best[u.id] || 0, u.lv);
    awayUps = [];
    return Object.keys(best).map(id => ({ icon: { ic: ['heart', '#F2C14E'] }, txt: bondText(id, best[id]).msg, sub: 'See Party > Team' }));
  });

  // ---------------- seeds for old saves (3.3) ----------------
  // Runs once per loaded save, as soon as the roster records exist: before or after the F1
  // migration (56b calls it first thing, so F1's "before" measure already sees the seeds). The old
  // field is S.party.formOld.field once F1 has run, else the field as it still stands.
  let ensFor = null, news = null, newsFor = null;
  bondEnsure = () => {
    if (ensFor === S) return;
    if (!S || !S.bond || !S.party || !(S.party.rv >= 1) || !S.party.rec) return;
    ensFor = S;
    shape();
    if (B().v >= 1) return;
    B().v = 1;
    if (!(S.totalKills > 0 || S.L > 1 || S.maxZone > 1)) return;   // a new game: nothing to seed
    const p = S.party, cls = p.cls;
    const old = ((p.formV >= 1 && p.formOld && Array.isArray(p.formOld.field)) ? p.formOld.field : (p.field || [])).filter(k => ROSTER[k] && rec(k));
    let kept = 0;
    for (const d of DEFS) {
      const cs = comps(d);
      if (!cs.every(k => rec(k)) || (d.cls && d.cls !== cls)) continue;
      let h;
      if (CONVERTED.includes(d.id) && cs.every(k => old.includes(k))) h = cs.some(isOldFriend) ? FT.seedStrong : FT.seedActive;
      else h = Math.min(FT.seedActive, Math.min(...cs.map(k => rec(k).lv || 1)) * FT.seedPerLv);
      if (H(h) > bondTime(d.id)) B().t[d.id] = H(h);
      const lv = bondLevel(d.id);
      if (lv > (B().lv[d.id] | 0)) B().lv[d.id] = lv;
      if (lv >= 1) kept++;
    }
    bondRev++;
    if (typeof rosterList === 'function' && rosterList().length) {
      news = [BOND_NEWS];
      if (kept) news.push('Your old friends kept their Bonds.');
      newsFor = S;
    }
  };
  // What's new goes out on the first tick (the bell listens from 70-ui, which loads later).
  onTick(() => {
    if (!news) return;
    if (newsFor === S) for (const msg of news) emit('whatsNew', { msg, icon: { ic: ['heart', '#F2C14E'] } });
    news = null; newsFor = null;
  });
  on('fieldChange', () => { bondEnsure(); });

  // ---------------- stories and the Sworn line ----------------
  const texts = id => (typeof BOND_STORIES === 'object' && BOND_STORIES && BOND_STORIES[id]) || [];
  bondStories = id => {
    const d = DEF[id]; if (!d) return [];
    const lv = bondLevel(id), seen = (B() && B().seen && B().seen[id]) | 0, tx = texts(id);
    return d.stories.map((title, i) => ({ title, text: (tx[i] && tx[i].text) || null, lv: STORY_LV[i], open: lv >= STORY_LV[i], read: seen > i }));
  };
  bondUnread = id => bondStories(id).filter(s => s.open && s.text && !s.read).length;
  bondUnreadAll = () => { let n = 0; for (const id of BOND_IDS) if (bondLevel(id) >= STORY_LV[0]) n += bondUnread(id); return n; };
  bondRead = (id, i) => {
    const st = bondStories(id)[i];
    if (!st || !st.open || !st.text || st.read) return false;
    const seen = B().seen[id] | 0;
    if (seen < i) return false;   // in order
    B().seen[id] = i + 1;
    emit('bondStory', { id, i });
    return true;
  };
  bondSworn = id => bondLevel(id) >= FT.bondH.length ? ((typeof BOND_SWORN === 'object' && BOND_SWORN && BOND_SWORN[id]) || null) : null;
  swornOf = k => DEFS.filter(d => d.pair.includes(k) && bondLevel(d.id) >= FT.bondH.length).map(d => d.id);

  // ---------------- reads for the UI and other systems ----------------
  bondsOf = (key, all) => DEFS.filter(d => d.pair.includes(key) && (all || key !== 'hero' || clsOk(d))).map(d => d.id);
  bondInfo = id => {
    const d = DEF[id]; if (!d) return null;
    const lv = bondLevel(id), t = bondTime(id), n = FT.bondH.length;
    const x = pairsNow().find(y => y.id === id) || null;
    const cc = comps(d).some(k => ROSTER[k].rarity === 'common') ? 1 + SYN_TUNE.commonCause : 1;
    return {
      id, name: d.name, pair: d.pair.slice(), cls: d.cls || null, lv, lvName: BOND_LV_NAME[lv], t,
      next: lv < n ? { lv: lv + 1, name: BOND_LV_NAME[lv + 1], at: H(FT.bondH[lv]), left: Math.max(0, H(FT.bondH[lv]) - t) } : null,
      strength: lv ? (FT.bondX[lv - 1] || 0) * cc : 0, together: !!x, rate: x ? rateOf(x, S.activity) : 0, oldFriend: bondOldFriend(id),
      stories: bondStories(id), sworn: bondSworn(id), unread: bondUnread(id)
    };
  };
  bondCounts = () => {
    const byLv = [0, 0, 0, 0, 0, 0];
    let maxLv = 0;
    for (const id of BOND_IDS) { const lv = bondLevel(id); byLv[lv]++; if (lv > maxLv) maxLv = lv; }
    const atLeast = k => byLv.slice(k).reduce((a, b) => a + b, 0);
    return { byLv, met: atLeast(1), friends: atLeast(2), trusted: atLeast(3), close: atLeast(4), sworn: atLeast(5), total: BOND_IDS.length, maxLv };
  };
  // Toast copy (formation.md 6.3): level 1 low, 2-4 normal, Sworn high.
  bondText = (id, lv) => {
    const d = DEF[id]; if (!d) return { msg: '', prio: 'low' };
    const [a, b] = d.pair.map(nm), two = `${a} and ${b}`;
    if (lv <= 1) return { msg: `${two} met. ${d.name} is on.`, prio: 'low' };
    if (lv >= FT.bondH.length) return { msg: `${two} are Sworn.`, prio: 'high' };
    return { msg: `${two} grew closer. ${d.name} is now ${BOND_LV_NAME[lv]}.` + (STORY_LV.includes(lv) && (texts(id)[STORY_LV.indexOf(lv)] || {}).text ? ' A camp story is ready.' : ''), prio: 'normal' };
  };
}
