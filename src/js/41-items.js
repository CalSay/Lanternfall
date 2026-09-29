// 41-items: the items core (task K4). Item kinds, where they fit, their stat lines, the
// hero's 8 gear positions, companion gear, affix rolls, Reforge maths and the bag rule.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Spec: docs/design/gathering-and-crafting.md 4 and 7, with its "Owner decisions" (random
// affixes, Reforge, trophies gate +8..+10). Tables live in 21-data-craft.js (K1).
//
// Exposed names (everything else is private, inside the block below):
//   kinds    itemKind(itOrKind) -> CRAFT_KINDS row (legacy slots are kinds: 'weapon' = Sword)
//            kindPos(kind) -> hero position or companion position the kind goes in
//   fit      fits(item, pos, who = 'hero')   who: 'hero' (S.party.cls), a class key, a role key,
//            a roster character id or 'any'. Weapon and head uniques fit every class. A legacy
//            Sword/Helm (non-unique) fits only a hero with no class (a kind string counts as
//            non-unique). heroWho() the current class key or 'any'
//   retool   retoolItems(swap = false) -> { legacy: {weapon, helm}, swap: n, from: [class keys] }
//            swap: true or the class key just left (a class change), which names it in the notice
//            RETOOL.on (1; the K4 exact-dps check sets 0 for the pre-retool rules)
//   stats    itemLines(item) -> [[stat, value], ...] in the order gear() adds them
//            itemStats(item) -> { stat: total } (base lines + affixes + Masterwork + unique fx)
//            gearCalc() the uncached gear() over CRAFT_HERO_POS (40-rules caches it)
//            charGear(id) -> the same stat object for a companion's wpn/trk items
//            spellMult() 1 + spell power / 100 (for the ability code; not wired yet)
//   names    kindName(slot, t, u), kindColor(slot, t, u), kindCost(kind, t), kindUpgradeCost(item)
//            (40-rules' itemName/craftCost/upgradeCost and 20-data's itemColor delegate here)
//   make     newItem(kind, t, r, opts) -> item with a fresh id (not added to the bag)
//            rollAffixes(kind, rarity, t, role, rnd = Math.random) -> [[affixId, q], ...]
//   reforge  reforgeCost(item) -> {mats, gold} (craftReforgeCost of the item's tier and rf)
//            reforgeLine(item, idx, rnd = Math.random) -> { a, rf, line, cost } or null (pure;
//            the caller pays and applies). Never duplicates an affix stat, never touches mw.
//   legend   lgFits(item, powerId) -> can that legendary power be inscribed on this item (by kind; L2)
//            itemLegendLines(item, who?) -> card lines for its power and circle mark (55-legend legendCardLines)
//   bag      equippedIds() -> Set of item ids worn by the hero or any companion
//            isEquipped(id), bagCount() (unequipped items), bagFull() (>= CRAFT_BAG_MAX)
//
// Item fields (S.items entries). Old items have only the first five and keep their stats:
//   id, slot (= kind), t, r, plus, u (unique key)
//   a:  [[affixId, q], ...]  rolled affix lines, q in [0, 1] (2 decimals) is the roll
//   mw: trophy index         Masterwork line (CRAFT_TROPHIES[mw]); missing = none
//   rf: n                    reforges done on this item (Reforge cost grows with it)
//   ro: role key             Trinkets only: the role pool it rolled from (for Reforge)
//   rt: kind                 retooled (see below): the kind the item was made as. Its base lines
//                            come from that kind, so a retool never lowers its stats.
//
// Retool (owner bug: "I was able to equip a sword as a ranger"). Class gear only: once the hero
// has a class (on load: the first tick; on chooseClass), every non-unique legacy Sword ('weapon')
// and Helm ('helm') becomes that class's kind for the same position: Warblade/Staff/Bow/Censer
// and Greathelm/Circlet/Hood/Mitre. Same id, tier, rarity, +N, affixes and Masterwork; it stays
// where it was worn. On a class change (Mirror of Embers), gear of another class that the hero
// wears, and bag items of another class that are not companion kinds, become the new class's kind
// the same way (companion-worn items and bag Bows/Staffs/Shields/Tomes stay as they are).
// Power rule: `rt` keeps the original kind, and the item keeps that kind's base lines (a Hood
// that was a Helm keeps the Helm's crit, crit damage and armour lines; a Bow that was a Sword
// keeps Might p, which is also the Bow's line). So item stats, gear(), heroDps() and totalDps()
// are exactly what they were. Only the name, look, recipe for upgrades and salvage change.//
// gear() keys: the old ones, unchanged and in the same order, then every other CRAFT_STATS
// key. Stage C made the combat stats live (hp, armour, threat, block, pierce, area, control,
// heal, ward, haste: 59-combat.js reads them; they keep their caps, flagged combat: true).
// aspd stays live:false and only aggregates (forageSpd/forageDbl and the H2 *Find lines are live); their total caps are applied
// in gear(). The old live stats are never capped here (old gear already goes past crit 35;
// critChance() caps at 75%).
// 'attack' feeds heroAtk() (40-rules). 'spell' is exposed through spellMult().

let itemKind, kindPos, fits, heroWho, retoolItems, RETOOL, itemLines, itemStats, gearCalc, charGear, spellMult,
  kindName, kindColor, kindCost, kindUpgradeCost, newItem, rollAffixes, reforgeCost, reforgeLine,
  equippedIds, isEquipped, bagCount, bagFull, lgFits, itemLegendLines;

{
  const LEGACY = RECIPE; // weapon, helm, charm, pick, axe: the pre-K4 kinds (and every unique)
  // gear() keys before K4, in their original order (the exact-equality checks rely on it).
  const OLD_KEYS = ['might', 'crit', 'critMult', 'gold', 'ess', 'mineSpd', 'woodSpd', 'oreDbl', 'woodDbl', 'party', 'tap', 'echo', 'offline', 'raid', 'essExtra', 'oreExtra', 'woodExtra', 'gather', 'score'];
  const NEW_KEYS = Object.keys(CRAFT_STATS).filter(k => !OLD_KEYS.includes(k));
  const blank = () => {
    const s = {};
    for (const k of OLD_KEYS) s[k] = k === 'tap' ? 1 : 0;
    for (const k of NEW_KEYS) s[k] = 0;
    return s;
  };

  itemKind = x => CRAFT_KINDS[typeof x === 'string' ? x : x && x.slot] || null;
  kindPos = kind => { const d = CRAFT_KINDS[kind]; return d ? d.pos || d.comp || null : null; };
  heroWho = () => (S.party && S.party.cls && HERO_CLASSES[S.party.cls]) ? S.party.cls : 'any';
  const resolveWho = (pos, who) => {
    if (who == null || who === 'hero') return heroWho();
    if (CRAFT_POS[pos] && CRAFT_POS[pos].comp && ROSTER[who]) return ROSTER[who].role;
    return who;
  };
  RETOOL = { on: 1 };
  const RT_KINDS = { weapon: 1, helm: 1 }; // legacy kinds that retool into class kinds
  const pendingLegacy = it => !!it && typeof it === 'object' && !it.u && !!RT_KINDS[it.slot];
  fits = (it, pos, who = 'hero') => {
    const kind = typeof it === 'string' ? it : it && it.slot;
    if (!CRAFT_KINDS[kind] || !CRAFT_FITS[pos]) return false;
    const w = resolveWho(pos, who);
    if (RETOOL.on && RT_KINDS[kind] && w !== 'any' && !(it && typeof it === 'object' && it.u)) return false;
    return craftFits(kind, pos, w);
  };

  // ---- retool: legacy Sword/Helm (and another class's gear on a class change) -> class kinds ----
  const classKindAt = (pos, cls) => ((CRAFT_FITS[pos] || {})[cls] || [])[0] || null;
  const clsName = c => HERO_CLASSES[c] ? HERO_CLASSES[c].name : c;
  retoolItems = (swap = false) => {
    const out = { legacy: { weapon: 0, helm: 0 }, swap: 0, from: [] };
    const cls = heroWho(); if (!RETOOL.on || cls === 'any' || !Array.isArray(S.items)) return out;
    const hero = new Set(CRAFT_HERO_POS.map(p => S.equip[p]).filter(v => v != null));
    const comp = new Set(), rec = S.party && S.party.rec;
    if (rec) for (const r of Object.values(rec)) for (const p of CRAFT_COMP_POS) if (r && r[p] != null) comp.add(r[p]);
    for (const it of S.items) {
      if (!it || it.u || comp.has(it.id)) continue;
      const d = CRAFT_KINDS[it.slot]; if (!d || !d.pos) continue;
      let why = null;
      if (RT_KINDS[it.slot]) why = 'legacy';
      else if (swap && d.cls && d.cls !== cls && (hero.has(it.id) || !d.comp)) why = 'swap';
      if (!why) continue;
      const to = classKindAt(d.pos, cls); if (!to || to === it.slot) continue;
      if (it.rt == null) it.rt = it.slot;
      if (why === 'legacy') out.legacy[it.slot]++;
      else { out.swap++; if (!out.from.includes(d.cls)) out.from.push(d.cls); }
      it.slot = to;
    }
    const nl = out.legacy.weapon + out.legacy.helm;
    if (!nl && !out.swap) return out;
    if (nl) {
      const w = out.legacy.weapon, h = out.legacy.helm, word = (n, one, many) => n === 1 ? one : many;
      const what = w && h ? `${word(w, 'sword', 'swords')} and ${word(h, 'helm', 'helms')}` : w ? word(w, 'sword', 'swords') : word(h, 'helm', 'helms');
      toast(`Your old ${what} ${nl === 1 ? 'was' : 'were'} reforged into ${clsName(cls)} gear.`, 'good', null, 'high');
    }
    if (out.swap) toast(`Your ${HERO_CLASSES[swap] ? clsName(swap) : 'other'} gear was reforged into ${clsName(cls)} gear.`, 'good', null, 'high');
    gearDirty(); save();
    emit('retooled', out);
    return out;
  };
  // On load: once per loaded save, at the first tick (S is replaced by loadSave()). Until then
  // gearCalc still counts a worn legacy Sword/Helm, so no number moves before the retool.
  let rtFor = null;
  onTick(() => { if (rtFor === S || !RETOOL.on) return; rtFor = S; retoolItems(); });

  // ---- stat lines ----
  // Legacy kinds use the exact pre-K4 expressions so old items give byte-identical numbers.
  const legacyLines = (slot, p) => {
    switch (slot) {
      case 'weapon': return [['might', p]];
      case 'helm': return [['crit', Math.min(35, p * 0.12)], ['critMult', p / 200], ['armour', p * 0.1]];
      case 'charm': return [['gold', p * ECON.charmGold], ['ess', p * 0.3]];   // ECON-A: gold was p x 0.8
      // H2: old tools gain the rare find line (a new stat; the old two lines are unchanged).
      case 'pick': return [['mineSpd', p * 0.6], ['oreDbl', Math.min(60, p * 0.1)], craftBaseLines('pick', p)[2]];
      case 'axe': return [['woodSpd', p * 0.6], ['woodDbl', Math.min(60, p * 0.1)], craftBaseLines('axe', p)[2]];
    }
    return [];
  };
  itemLines = it => {
    const d = itemKind(it); if (!d) return [];
    const p = itemPower(it);
    const bk = it.rt && CRAFT_KINDS[it.rt] ? it.rt : it.slot; // retooled: the original kind's lines
    const out = LEGACY[bk] ? legacyLines(bk, p) : craftBaseLines(bk, p);
    if (Array.isArray(it.a)) for (const [id, q] of it.a) if (CRAFT_AFFIXES[id]) out.push(...craftAffixValue(id, p, q));
    if (it.mw != null) { const l = craftTrophyLine(it.mw, it.slot, p); if (l) out.push(l); }
    if (it.u && UNIQ[it.u]) for (const [k, v] of Object.entries(UNIQ[it.u].fx)) out.push([k, v]);
    return out;
  };
  const addLines = (s, lines) => { for (const [k, v] of lines) { if (k === 'tap') s.tap *= v; else s[k] = (s[k] || 0) + v; } };
  itemStats = it => { const s = {}; for (const [k, v] of itemLines(it)) s[k] = k === 'tap' ? (s[k] || 1) * v : (s[k] || 0) + v; return s; };
  // Stage C (K11): party combat (59-combat.js) reads the role stats, so they are live now. They keep
  // their caps (combat: true); the old live stats stay uncapped here.
  for (const k of ['hp', 'armour', 'threat', 'block', 'ward', 'heal', 'area', 'control', 'pierce', 'haste']) if (CRAFT_STATS[k]) { CRAFT_STATS[k].live = true; CRAFT_STATS[k].combat = true; }
  const capNonLive = s => { for (const k of NEW_KEYS) { const c = CRAFT_STATS[k]; if ((!c.live || c.combat) && c.cap != null && s[k] > c.cap) s[k] = c.cap; } return s; };
  gearCalc = () => {
    const s = blank(), who = heroWho();
    for (const pos of CRAFT_HERO_POS) {
      const it = itemById(S.equip[pos]); if (!it || !(fits(it, pos, who) || (pendingLegacy(it) && kindPos(it.slot) === pos))) continue;
      s.score += itemPower(it);
      addLines(s, itemLines(it));
    }
    return capNonLive(s);
  };
  charGear = id => {
    const s = blank(), r = S.party && S.party.rec && S.party.rec[id];
    if (r) for (const pos of CRAFT_COMP_POS) {
      const it = r[pos] != null ? itemById(r[pos]) : null; if (!it || !fits(it, pos, id)) continue;
      s.score += itemPower(it);
      addLines(s, itemLines(it));
    }
    return capNonLive(s);
  };
  spellMult = () => 1 + gear().spell / 100;

  // ---- names, colours, costs ----
  kindName = (slot, t, u) => {
    if (u) return UNIQ[u].name;
    const d = CRAFT_KINDS[slot];
    return `${MAT[d.pre].short[t - 1]} ${d.noun}`;
  };
  kindColor = (slot, t, u) => u ? UNIQ[u].col : MAT[(CRAFT_KINDS[slot] || { pre: 'ore' }).pre].col[t - 1];
  kindCost = (kind, t) => craftRecipe(kind, t);
  kindUpgradeCost = it => {
    const m = {};
    for (const [k, n] of Object.entries(CRAFT_KINDS[it.slot].rec)) m[k] = Math.ceil(n * 0.6 * (it.plus + 1));
    if (it.u) m.ess = (m.ess || 0) + 2 * (it.plus + 1);
    const c = { mats: m, gold: econUpgradeGold(it.t, it.plus) };   // ECON-A: 20 foes of the grade's first zone x (plus + 1); was 40 x 5^t x (plus + 1)
    // +8, +9 and +10 each need a Trophy of any type (owner decision); K6 enforces it.
    const tr = craftUpgradeTrophies(it.plus); if (tr) c.troph = tr;
    return c;
  };

  // ---- making items ----
  const round2 = q => Math.round(q * 100) / 100;
  rollAffixes = (kind, rarity, t, role, rnd = Math.random) => {
    const pool = craftAffixPool(kind, role).slice(), out = [];
    let n = Math.min(craftAffixLines(rarity, null), pool.length);
    while (n-- > 0) {
      const id = pool.splice(Math.floor(rnd() * pool.length), 1)[0];
      out.push([id, round2(rnd())]);
    }
    return out;
  };
  // opts: { role (Trinkets), mw (trophy index), rnd }. Legacy kinds, Charm and tools roll
  // nothing, so their items (and the rng use) are exactly what forgeItem made before K4.
  newItem = (kind, t, r, opts = {}) => {
    const it = { id: S.nextId++, slot: kind, t, r, plus: 0 };
    const d = CRAFT_KINDS[kind];
    if (d && d.role) {
      it.a = rollAffixes(kind, r, t, opts.role, opts.rnd || Math.random);
      if (d.role === 'any' && opts.role && CRAFT_ROLE_POOL[opts.role]) it.ro = opts.role;
    }
    if (opts.mw != null && CRAFT_TROPHIES[opts.mw] && craftTrophyLine(opts.mw, kind, 1)) it.mw = opts.mw;
    return it;
  };

  // ---- Reforge ----
  reforgeCost = it => craftReforgeCost(it.t, it.rf || 0);
  reforgeLine = (it, idx, rnd = Math.random) => {
    if (!it || !Array.isArray(it.a) || !it.a[idx]) return null;
    const pool = craftAffixPool(it.slot, it.ro); if (!pool.length) return null;
    const have = it.a.map(l => l[0]);
    let choice = pool.filter(id => !have.includes(id));
    if (!choice.length) choice = [it.a[idx][0]]; // every stat of the pool is on the item: reroll the value
    const line = [choice[Math.floor(rnd() * choice.length)], round2(rnd())];
    const a = it.a.map((l, i) => i === idx ? line : l.slice());
    return { a, rf: (it.rf || 0) + 1, line, cost: reforgeCost(it) };
  };

  // ---- legendary powers (legendaries.md 2.3): where a power goes; the card lines come from 55-legend ----
  lgFits = (it, id) => {
    const p = typeof LEG_POWERS === 'object' && LEG_POWERS[id], d = it && CRAFT_KINDS[it.slot];
    if (!p || !d || it.u) return false;
    if (p.fits === 'hero') return !!d.cls && LEG_FITS.hero.includes(d.pos) && (p.cls == null || p.cls === d.cls);
    if (p.fits === 'trinket') return d.comp === 'trk';
    return d.comp === 'wpn' && d.role === p.fits;
  };
  itemLegendLines = (it, who) => typeof legendCardLines === 'function' ? legendCardLines(it, who) : [];

  // ---- bag ----
  equippedIds = () => {
    const ids = new Set();
    for (const v of Object.values(S.equip)) if (v != null) ids.add(v);
    const rec = S.party && S.party.rec;
    if (rec) for (const r of Object.values(rec)) for (const pos of CRAFT_COMP_POS) if (r && r[pos] != null) ids.add(r[pos]);
    return ids;
  };
  isEquipped = id => equippedIds().has(id);
  bagCount = () => { const eq = equippedIds(); return S.items.reduce((n, i) => n + (eq.has(i.id) ? 0 : 1), 0); };
  bagFull = () => bagCount() >= CRAFT_BAG_MAX;
}
