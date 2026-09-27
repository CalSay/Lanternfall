// 55-stats: lifetime counters for the Journal and the "While you were away" report data.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Away report. awayGains(secs) (50-sim) emits, in order:
//   'awayBegin' r   this file snapshots the state
//   'away'      r   other systems apply their own offline progress here (r.t = capped seconds)
//   'awayEnd'   r   this file diffs the state into r, then asks every registerAwayLine fn for lines
// After 'awayEnd', r holds:
//   secs, t, cap, capped, activity, note, kills, gold, xp, levels {from, to}, zones {from, to},
//   bosses, raidDmg, embers, mats [{ k, t, n }], items [item], skills [{ k, from, to }],
//   extra [{ icon, txt, sub }], empty (true when nothing changed)
// Anything a system changes during 'away' (gold, mats, items, levels...) shows up in the diff
// automatically. For anything else, add a line:
//   registerAwayLine(r => S.camp.built ? { icon: { ic: ['anvil', '#F2C14E'] }, txt: 'Camp: the smithy is done', sub: 'Tap Camp to see it' } : null)
// fn(r) returns a line, an array of lines, or nothing. icon is a toast-style icon spec.

const AWAY_LINES = [];
function registerAwayLine(fn) {
  AWAY_LINES.push(fn);
  return () => { const i = AWAY_LINES.indexOf(fn); if (i >= 0) AWAY_LINES.splice(i, 1); };
}

// Read-only helpers for the Journal (75-stats-ui.js).
const statsApi = {};

{
  // played: seconds of active play (sum of ticks). taps: player taps on the stage.
  // bosses: zone bosses beaten. uniques: unique drops. raidDmg: all world-raid damage dealt.
  // gathered: ore and logs harvested. away: seconds of away time credited. since: when counting began;
  // late: counting began on a save that already had progress (the Journal says so).
  registerState('stats', { played: 0, taps: 0, bosses: 0, uniques: 0, raidDmg: 0, gathered: 0, away: 0, since: 0, late: false, init: false });
  const ST = () => S.stats;

  // Old saves: start from what the save already proves.
  if (!ST().init) {
    ST().init = true;
    ST().since = Date.now();
    ST().late = S.totalKills > 0 || S.L > 1;
    ST().bosses = Math.max(ST().bosses, S.maxZone - 1);
    ST().uniques = Math.max(ST().uniques, Object.keys(S.found || {}).length);
    ST().raidDmg = Math.max(ST().raidDmg, +S.raid.dmg || 0);
  }

  onTick(dt => { ST().played += dt; });
  on('tap', () => { ST().taps++; });
  on('kill', ({ mob }) => { if (mob && mob.boss) ST().bosses++; });
  on('loot', () => { ST().uniques++; });
  on('harvest', ({ n }) => { ST().gathered += n || 0; });

  // Raid damage has no event; count the growth of S.raid.dmg within a raid generation.
  let rGen = S.raid.gen, rDmg = +S.raid.dmg || 0;
  onTick(() => {
    const d = +S.raid.dmg || 0;
    if (S.raid.gen !== rGen) { rGen = S.raid.gen; rDmg = 0; }
    if (d > rDmg) ST().raidDmg += d - rDmg;
    rDmg = d;
  });

  const forged = () => (S.achievements && S.achievements.forged) || 0;
  Object.assign(statsApi, { forged, uniqueKinds: () => Object.keys(S.found || {}).length, uniqueTotal: () => Object.keys(UNIQ).length });

  // ---- away report ----
  const MAT_KINDS = CRAFT_FAMILIES; // every family (K5), in pouch order
  let snap = null;
  on('awayBegin', r => {
    r.cap = (4 + 2 * S.relic.glass + bonus('awayHours')) * 3600;
    r.capped = r.secs > r.cap;
    r.activity = S.activity;
    snap = {
      L: S.L, xp: S.xp, gold: S.gold, kills: S.totalKills, maxZone: S.maxZone, bosses: ST().bosses,
      raidGen: S.raid.gen, raidDmg: +S.raid.dmg || 0, embers: S.embers, nextId: S.nextId,
      mats: JSON.parse(JSON.stringify(S.mats)),
      skills: Object.fromEntries(Object.entries(S.skills).map(([k, v]) => [k, v.lv]))
    };
  });
  // xpNeed() reads S.L; borrow it to price earlier levels with the real formula.
  const needAt = l => { const L = S.L; try { S.L = l; return xpNeed(); } finally { S.L = L; } };
  on('awayEnd', r => {
    const b = snap; snap = null; if (!b) return;
    r.kills = Math.max(0, Math.floor(S.totalKills - b.kills));
    r.gold = Math.max(0, S.gold - b.gold);
    let xp = S.xp - b.xp;
    for (let l = b.L; l < S.L; l++) xp += needAt(l);
    r.xp = Math.max(0, xp);
    r.levels = { from: b.L, to: S.L };
    r.zones = { from: b.maxZone, to: S.maxZone };
    r.bosses = Math.max(0, ST().bosses - b.bosses);
    r.raidDmg = S.raid.gen === b.raidGen ? Math.max(0, (+S.raid.dmg || 0) - b.raidDmg) : 0;
    r.embers = Math.max(0, S.embers - b.embers);
    r.mats = [];
    for (const k of MAT_KINDS) for (let t = 1; t <= 5; t++) {
      const n = Math.floor(((S.mats[k] || [])[t - 1] || 0) - ((b.mats[k] || [])[t - 1] || 0));
      if (n > 0) r.mats.push({ k, t, n });
    }
    r.items = S.items.filter(i => i.id >= b.nextId);
    r.skills = Object.keys(S.skills).filter(k => S.skills[k].lv > (b.skills[k] || 1)).map(k => ({ k, from: b.skills[k] || 1, to: S.skills[k].lv }));
    ST().away += r.t;
    for (const m of r.mats) if (CRAFT_NODES[m.k]) ST().gathered += m.n; // gathered families only
    r.extra = [];
    for (const fn of AWAY_LINES.slice()) {
      try { const out = fn(r); if (out) r.extra.push(...[].concat(out).filter(Boolean)); }
      catch (e) { console.error('[lanternfall] away line failed', e); }
    }
    r.empty = !(r.kills || r.gold >= 1 || r.xp >= 1 || r.zones.to > r.zones.from || r.bosses || r.raidDmg >= 1 || r.embers || r.mats.length || r.items.length || r.skills.length || r.extra.length);
  });
}
