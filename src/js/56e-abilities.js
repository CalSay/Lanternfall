// 56e-abilities: learning abilities with Scrolls (docs/design/combat-turn-build.md "Unlocks"; data: 24c-data-abilities.js).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Each hero starts with their signature (Echo Shot, Shield Bash, Fireball). The other 13 are learned on the Hero tab
// (75-abilities-ui.js) by spending a Scroll of their tier, once the hero reaches that tier's level (ABILITY_TIERS).
// A higher Scroll can pay for a lower tier. Scrolls belong to the lamp (shared by every hero) and drop from zone bosses:
// one for sure the first time each zone's boss falls, then a 1 in 5 chance on a replay, never more than 5 replays dry.
//   abilityOwned(hero, id) -> bool
//   abLearnInfo(hero, id) -> { id, a, owned, tier, lv, lvOk, scroll, payWith, why }   why: '' (can learn now) | a reason
//   abilityLearn(hero, id) -> bool (spends the Scroll; emits abilityLearned { hero, id })
//   scrollCount(id) -> n; scrollFor(zone) -> the Scroll id a zone's boss drops
// Events: scrollDrop { id, n, first }, abilityLearned { hero, id }.
// Save: registerState('abil', { unl: { hero: [ids] }, scrolls: { id: n }, dry: { id: n }, got: { id: n } }).
// Talents (24e): each learned ability, and Attack, Parry and Dodge, has two talents; pick one for TALENT_TUNE.cost points.
// A hero earns TALENT_TUNE.perLevel points a level after level 1. Choices change freely; a fight takes them as it starts.
//   talentsOf(hero) -> { id: 'a' | 'b' } (only abilities the hero owns), talentPoints(hero) -> { total, spent, free }
//   talentSet(hero, id, 'a' | 'b' | null) -> bool (null clears it; emits talentSet)
// Save: S.abil.tal = { hero: { id: 'a' | 'b' } }.
var abilityOwned, abLearnInfo, abilityLearn, scrollCount, scrollFor, talentsOf, talentPoints, talentSet;
{
  const SCROLL_TUNE = { replay: 0.2, pity: 5 };
  const blank = () => ({ unl: { wren: [], tobin: [], pip: [] }, scrolls: {}, dry: {}, got: {}, tal: { wren: {}, tobin: {}, pip: {} } });
  registerState('abil', blank());
  const A = () => S.abil || (S.abil = blank());
  const lvOf = k => { try { const l = soloLevels()[k]; return l ? l.L : 1; } catch (e) { return S.L || 1; } };
  abilityOwned = (k, id) => {
    const a = ABILITIES[id]; if (!a || a.hero !== k) return false;
    if (!a.tier) return true;
    const u = A().unl[k]; return Array.isArray(u) && u.includes(id);
  };
  scrollCount = id => Math.max(0, A().scrolls[id] | 0);
  // the Scroll that pays for tier t: that tier's own if you have one, else the lowest higher one you have
  const payFor = t => { for (let i = t - 1; i < SCROLL_ORDER.length; i++) if (scrollCount(SCROLL_ORDER[i]) > 0) return SCROLL_ORDER[i]; return ''; };
  abLearnInfo = (k, id) => {
    const a = ABILITIES[id], tier = a ? a.tier : 0, T = ABILITY_TIERS[tier] || null;
    const owned = abilityOwned(k, id), lv = T ? T.lv : 1, lvOk = lvOf(k) >= lv, scroll = T ? T.scroll : '', payWith = tier ? payFor(tier) : '';
    const why = owned ? 'owned' : !a || a.hero !== k ? 'other' : !lvOk ? `Level ${lv}` : !payWith ? `Needs a ${SCROLLS[scroll].name}` : '';
    return { id, a, owned, tier, lv, lvOk, scroll, payWith, why };
  };
  abilityLearn = (k, id) => {
    const i = abLearnInfo(k, id);
    if (i.why) return false;
    const s = A();
    s.scrolls[i.payWith] = scrollCount(i.payWith) - 1;
    if (!Array.isArray(s.unl[k])) s.unl[k] = [];
    s.unl[k].push(id);
    emit('abilityLearned', { hero: k, id });
    return true;
  };
  const talOk = (k, id) => typeof TALENTS === 'object' && !!TALENTS[id] && (id.includes(':') ? id.startsWith(k + ':') : abilityOwned(k, id));
  const talRec = k => { const s = A(); if (!s.tal || typeof s.tal !== 'object') s.tal = {}; if (!s.tal[k] || typeof s.tal[k] !== 'object') s.tal[k] = {}; return s.tal[k]; };
  talentsOf = k => { const out = {}, r = talRec(k); for (const id in r) if ((r[id] === 'a' || r[id] === 'b') && talOk(k, id)) out[id] = r[id]; return out; };
  talentPoints = k => {
    const total = Math.max(0, (lvOf(k) - 1) * TALENT_TUNE.perLevel), spent = Object.keys(talentsOf(k)).length * TALENT_TUNE.cost;
    return { total, spent, free: total - spent };
  };
  talentSet = (k, id, c) => {
    if (!talOk(k, id) || (c != null && c !== 'a' && c !== 'b')) return false;
    const r = talRec(k);
    if (c == null) { delete r[id]; emit('talentSet', { hero: k, id, choice: null }); return true; }
    if (!r[id] && talentPoints(k).free < TALENT_TUNE.cost) return false;   // a switch between a and b costs nothing more
    r[id] = c; emit('talentSet', { hero: k, id, choice: c });
    return true;
  };
  scrollFor = z => {
    if (typeof isRegionBoss === 'function' && isRegionBoss(z)) return 'mother';
    for (const [last, id] of SCROLL_BANDS) if (z <= last) return id;
    return 'roadlight';
  };
  // Next Up (55-goals): a Scroll in hand and an ability it can teach the hero you play
  const learnable = () => { const k = soloHero(); if (!k || typeof HERO_ABILITIES !== 'object' || !HERO_ABILITIES[k]) return null;
    let best = null; for (const id of HERO_ABILITIES[k]) { const i = abLearnInfo(k, id); if (!i.why && (!best || i.tier < best.tier)) best = i; } return best; };
  registerGoal({ id: 'learn-ability', sys: 'hero', prio: 4, pct: () => (learnable() ? 1 : null),
    label: () => { const i = learnable(); return i ? `Learn ${i.a.name}: your ${SCROLLS[i.payWith].name} is ready` : ''; },
    icon: () => ({ ic: ['sword', '#F2C14E'] }),
    go: () => { const i = learnable(); return { tab: 'party', view: 'abilities', sel: i ? `.ab-card[data-ab="${i.id}"]` : '#sec-abilities' }; } });
  // the drop: a zone boss's kill (50-sim killPack emits zoneClear on a first clear, then kill)
  let firstZ = 0;
  on('zoneClear', p => { firstZ = p ? p.zone : 0; });
  on('kill', p => {
    if (!p || !p.mob || !p.mob.boss) return;
    const z = p.zone, id = scrollFor(z), s = A(), first = firstZ === z; firstZ = 0;
    let drop = first;
    if (!drop) { s.dry[id] = (s.dry[id] | 0) + 1; drop = s.dry[id] >= SCROLL_TUNE.pity || Math.random() < SCROLL_TUNE.replay; }
    if (!drop) return;
    s.dry[id] = 0; s.scrolls[id] = scrollCount(id) + 1; s.got[id] = (s.got[id] | 0) + 1;
    emit('scrollDrop', { id, n: s.scrolls[id], first });
    // the first Scroll ever teaches what it is for; after that a quiet line (the stage float shows it)
    const ever = SCROLL_ORDER.reduce((n, k) => n + (s.got[k] | 0), 0);
    if (ever <= 1) toast(`${SCROLLS[id].name}! Spend it on the Hero tab to learn an ability.`, 'good', null, 'high');
    else toast(`${SCROLLS[id].name} found.`, 'good', null, 'low');
  });
}
