// 55-boss-try: after a zone boss beats you, you choose when to try again (card wall-try-again; why-review point 2).
// Core, no DOM. The Try again card is 75-boss-try-ui.js.
//   Hold         a loss sets `S.bossTry.hold` to the zone. While it is set, 50-sim spawn() does not start that zone's boss
//                by itself: the zone keeps paying (normal fights), and the boss comes back when you press Try again
//                (`challenge()` clears the hold) or, with Auto on, when you are stronger (the tick's auto-challenge).
//   Tries        `tries[hero:zone]` counts lost tries; `rev[hero:zone]` lists the move ids the Foe tab now shows (a loss shows
//                the move that beat you, else the next one in the boss's order); a beaten boss shows all its moves.
//   Why          `bossTryWhy(last)` names the hit that won and the reason; `bossTryWays(ctx)` lists the ways forward that
//                exist now. Add a way (a new lever such as the bag slot or Resolve) with `bossWay(id, fn)`; no edits here.
// Save: registerState('bossTry', { hold: 0, tries: {}, rev: {}, last: null }). All defaults, so old saves merge in.
registerState('bossTry', { hold: 0, tries: {}, rev: {}, last: null });

const BOSS_TRY = { leftClose: 0.25 };   // the boss had this share of its health left or less: "so close"

const bossTryKey = (hero, zone) => (hero || 'hero') + ':' + zone;
// the hold: this zone's boss waits for you (hoisted function: 50-sim reads it before this file runs)
function bossTryHeld() { const b = S.bossTry; return !!(b && b.hold > 0 && b.hold === S.zone); }
function bossTryRelease() { if (S.bossTry && S.bossTry.hold) S.bossTry.hold = 0; }

// the foe's moves in the order they are told, one row per move id: { id, name, hits, charged }
function bossTryMoves(script) {
  const seen = new Set(), out = [];
  for (const m of script || []) { if (!m || seen.has(m.id)) continue; seen.add(m.id); out.push({ id: m.id, name: m.name, hits: m.hits.length, charged: !!m.charge }); }
  return out;
}
// what the Foe tab shows of a boss: { moves: [shown], hidden: how many are still unknown }
function bossTryShown(script, zone) {
  const all = bossTryMoves(script);
  if (zone < S.maxZone) return { moves: all, hidden: 0 };   // a boss you have beaten holds no secrets
  const have = (S.bossTry.rev[bossTryKey(typeof soloHero === 'function' ? soloHero() : '', zone)]) || [];
  const moves = all.filter(m => have.includes(m.id));
  return { moves, hidden: all.length - moves.length };
}

// A loss in a zone boss fight (59-combat wipe emits bossFail). The details of the last hit come from 59k endFight
// right after (bossTryLost), so this only holds the boss, counts the try and opens `last`.
on('bossFail', ({ zone }) => {
  const b = S.bossTry, hero = typeof soloHero === 'function' ? soloHero() : '', key = bossTryKey(hero, zone);
  b.tries[key] = (b.tries[key] || 0) + 1;
  b.hold = zone;
  if (typeof ZONE_FIGHTS === 'number') S.kills = ZONE_FIGHTS;   // the boss is ready to try again at once; the zone pays meanwhile
  b.last = { zone, hero, n: b.tries[key], boss: (typeof mob === 'object' && mob && mob.boss && mob.name) || '', move: '', hit: 0, hits: 0,
    charged: false, defended: false, dot: false, left: -1, weak: '', res: [], moves: [], hidden: 0, shown: 0 };
});

// The turn fight ended in a defeat (59k endFight). m.fin is what finished the hero (turnContact sets it).
function bossTryLost(m) {
  const b = S.bossTry, L = b && b.last, f = m && m.foe;
  if (!L || !f || !f.boss || f.deep || f.trial || L.zone !== (f.tz || S.zone) || L.move || L.dot) return;
  const fin = m.fin || {}, key = bossTryKey(L.hero, L.zone);
  L.boss = f.name || L.boss;
  L.left = f.max > 0 ? Math.max(0, f.hp) / f.max : -1;
  if (fin.dot) L.dot = true;
  else if (fin.id) { L.move = fin.name; L.hit = fin.hit + 1; L.hits = fin.hits; L.charged = !!fin.charged; L.defended = !!fin.defended; }
  const ft = typeof FOE_TYPE === 'object' ? FOE_TYPE[f.txRow || f.type] : null;
  if (ft) { L.weak = ft.weak || ''; L.res = (ft.res || []).slice(); }
  // reveal one more move: the one that beat you, else the next unknown one in its order
  const all = bossTryMoves(f.tk && f.tk.script), have = b.rev[key] || (b.rev[key] = []);
  const pick = (fin.id && all.find(x => x.id === fin.id && !have.includes(x.id))) || all.find(x => !have.includes(x.id));
  if (pick) have.push(pick.id);
  L.moves = all.filter(x => have.includes(x.id)); L.shown = have.length; L.hidden = Math.max(0, all.length - have.length);   // the card reads these, not the live foe
}

// Why you lost, in the player's words: { head, lines[] }. Pure on `last`.
function bossTryWhy(L) {
  if (!L) return { head: 'The boss beat you.', lines: [] };
  const lines = [];
  const pct = L.left >= 0 ? Math.max(1, Math.round(L.left * 100)) : 0;
  const head = L.left < 0 ? 'The boss beat you.' : L.left <= BOSS_TRY.leftClose ? `So close. It had ${pct}% of its health left.`
    : pct >= 99 ? 'It was still at full health.' : `You took ${100 - pct}% of its health.`;
  if (L.dot) lines.push('Damage over time finished you. Heal or clear it before the next hit.');
  else if (L.move) {
    const part = L.hits > 1 ? `, hit ${L.hit} of ${L.hits}` : '';
    lines.push(`${L.move} finished you${part}.`);
    if (L.charged) lines.push('It was a charged move. Stun it, or hit it hard while it gathers, to break it.');
    else if (!L.defended) lines.push('You did not parry or dodge it. Press as the ring closes.');
    else lines.push('You tried to defend it, but the timing was off. Press later, as the ring closes.');
  }
  return { head, lines };
}
const bossTryDt = id => (typeof DT_INFO === 'object' && DT_INFO[id] && DT_INFO[id].name) || id;
// what the boss is weak and strong against: a fact, not a build
function bossTryWeak(L) {
  if (!L || (!L.weak && !(L.res && L.res.length))) return '';
  const parts = [];
  if (L.weak) parts.push(`Weak to ${bossTryDt(L.weak).toLowerCase()}.`);
  if (L.res && L.res.length) parts.push(`Resists ${L.res.map(x => bossTryDt(x).toLowerCase()).join(' and ')}.`);
  return parts.join(' ');
}

// Ways forward. Each is fn(ctx) -> a line, or '' when it does not apply now. ctx: { last, zone, heroL }.
// Keep each line a fact about something the player can do today (no Training: the hero rework removes it).
const BOSS_WAYS = [];
function bossWay(id, fn) { BOSS_WAYS.push({ id, fn }); }
bossWay('skill', c => c.last && c.last.hidden > 0
  ? `Learn its moves: ${c.last.hidden} still unknown. Each try shows one more in the Foe tab.`
  : 'You know all its moves. Parry or dodge each hit as its ring closes.');
bossWay('build', c => c.last && c.last.weak ? `Use its weakness: ${bossTryDt(c.last.weak).toLowerCase()} damage does ${Math.round((TYPE_X.weak - 1) * 100)}% more. Check your abilities and gear.` : '');
bossWay('power', c => `Get stronger: level up and forge better gear. Every fight here pays XP and gold.`);
bossWay('time', c => 'Take your time. Fights in this zone keep paying while the boss waits.');
function bossTryWays(L) {
  const ctx = { last: L, zone: L ? L.zone : S.zone, heroL: S.L }, out = [];
  for (const w of BOSS_WAYS) { let t = ''; try { t = w.fn(ctx); } catch (e) { t = ''; } if (t) out.push({ id: w.id, txt: t }); }
  return out;
}
