// 55-caches: Lantern Caches, the core (card cache-core; early-game plan-judge R1, R2, R12; DECISIONS "Lantern Caches").
// CORE FILE: no DOM. UI: 75-caches-ui.js (the card, through the moment layer).
//
// A zone boss's FIRST clear opens a cache. It is a container: it lists what that win already paid (gold, Essence, a Scroll, a Star, a
// trophy, a unique), and nothing else. Replays pay as today and open no cache. The only thing a cache adds is a lantern colour from
// the Deepwell shop that the save does not own yet (zones 1 to 3 and 7 to 9, Ember Red first). That is a certain look, never a roll.
// No relics, no extra Essence, no unique pity, no time skips. Nothing here is sold.
//
// Events: cacheOpen { n, zone, tier, gold, ess, scroll, star, starFirst, unique, trophy, look, chance, essFull, auto }
//   n: this save's cache number (1 for the first).  scroll { id, name, col }  star { id, name }  unique { item, name }
//   trophy { name, n }  look { id, n, col, worn }  chance: the unique's chance on this win, in percent (null when one dropped)
//   essFull: the Essence store was full when the win paid  auto: this cache opens as a banner unless it holds a look or a unique.
//
// State S.cache: { opened, lookPity, auto, first }
//   opened  caches opened.  lookPity  reserved for cache-looks (nothing reads it yet).  auto  null = the default (on from the
//   autoFrom-th cache), true or false once the player chooses.  first  the zone of the first cache (0 = none yet).
// An old save has opened = 0 and gets no retroactive cache: its first one is its next first clear.
//
// CACHE_TUNE.on = false switches caches and their lantern colours off; wins then pay as before.
//
// API: cachePending() -> bool (a clear is waiting to open), cacheAuto() -> bool, cacheSetAuto(on), cacheLookZone(z) -> bool

const CACHE_TUNE = { on: true, autoFrom: 3, lookZones: [1, 2, 3, 7, 8, 9] };
let cachePending, cacheAuto, cacheSetAuto, cacheLookZone;
{
  registerState('cache', { opened: 0, lookPity: 0, auto: null, first: 0 });
  const C = () => S.cache;
  let tickN = 0, pend = null, lootTick = -1, lootItem = null;
  cacheLookZone = z => CACHE_TUNE.lookZones.includes(z);
  cacheAuto = (n = C().opened) => (typeof C().auto === 'boolean' ? C().auto : n >= CACHE_TUNE.autoFrom);
  cacheSetAuto = on => { C().auto = !!on; save(); };
  cachePending = () => !!pend;

  // 50-sim drops a unique before it emits zoneClear (same tick); everything else comes after.
  on('loot', e => { if (e && e.item && e.item.u) { lootTick = tickN; lootItem = e.item; } });
  on('zoneClear', e => {
    if (!CACHE_TUNE.on || !e || !(e.zone >= 1)) return;
    pend = { zone: e.zone, tier: zoneTier(e.zone), gold: 0, ess: 0, scroll: null, star: null, trophy: null,
      unique: lootTick === tickN && lootItem ? lootItem : null };
  });
  on('kill', p => { if (pend && p && p.mob && p.mob.boss && p.zone === pend.zone) { pend.gold = p.gold || 0; pend.ess = p.ess || 0; pend.tier = p.tier || pend.tier; } });
  on('scrollDrop', p => { if (pend && p && SCROLLS[p.id]) pend.scroll = { id: p.id, name: SCROLLS[p.id].name, col: SCROLLS[p.id].col }; });
  on('starFound', p => { if (pend && p && !p.quiet && typeof STARS === 'object' && STARS[p.id]) pend.star = { id: p.id, name: STARS[p.id].name }; });
  on('trophy', p => { if (pend && p && (p.source === 'boss' || p.source === 'champion') && CRAFT_TROPHIES[p.i]) pend.trophy = { name: CRAFT_TROPHIES[p.i].n, n: p.n }; });

  // the chance this win gave its zone's unique (50-sim killPack): a first clear, halved when the save already has it at this tier
  const uniqueChance = (z, tier) => {
    const uq = zoneUnique(z), owned = (S.found[uq] || 0) >= tier ? UNIQ_TUNE.owned : 1;
    return Math.round(Math.min(1, UNIQ_TUNE.first * owned * mod('uniqueChance')) * 1000) / 10;
  };

  function open() {
    const p = pend; pend = null;
    const c = C();
    let look = null;
    try { if (cacheLookZone(p.zone) && typeof DW === 'object' && DW && typeof DW.grantLantern === 'function') look = DW.grantLantern(); } catch (e) { look = null; }
    if (!c.opened) c.first = p.zone;
    c.opened++;
    const un = p.unique && UNIQ[p.unique.u] ? { item: p.unique, name: UNIQ[p.unique.u].name } : null;
    const starFirst = !!p.star && Object.keys((S.stars && S.stars.own) || {}).length <= 1;
    const essFull = p.ess > 0 && typeof stashFull === 'function' && stashFull('ess', p.tier);
    const view = { n: c.opened, zone: p.zone, tier: p.tier, gold: p.gold, ess: p.ess, scroll: p.scroll, star: p.star, starFirst, unique: un, trophy: p.trophy, look,
      chance: un ? null : uniqueChance(p.zone, p.tier), essFull, auto: cacheAuto(c.opened) };
    emit('cacheOpen', view);
    // the bell list keeps a line (the card or banner is the moment itself)
    const bits = [];
    if (p.gold) bits.push(`${fmt(p.gold)} gold`);
    if (look) bits.push(/lantern$/i.test(look.n) ? look.n : `${look.n} lantern`);   // the look's name already says lantern
    if (un) bits.push(un.name);
    emit('toast', { key: 'cache', msg: `Lantern Cache opened${bits.length ? ': ' + bits.join(', ') : ''}.`, kind: 'good', prio: 'low' });
    save();
  }
  // the clear's events all fire inside one tick; the cache opens at the end of it
  onTick(() => { tickN++; if (pend) open(); });
}
