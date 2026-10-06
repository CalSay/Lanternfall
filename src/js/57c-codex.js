// 57c-codex: the Codex and Lantern Light (docs/design/codex.md, Region 1).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Rules: most entries are READ from state other systems already save (mastery, S.found, the
// roster, stories, camp levels, the Almanac, achievements). The
// Codex records only what nothing else keeps: champion kills by type, affix tiers and Masterwork
// lines seen, synergies switched on, materials held by tier, Dares taken.
// Lantern Light = sum over visible pages of entries found x Light each, halves rounded down at
// the end. It is never spent and never goes down (codexLight() is the highest value seen).
// Light gives no direct power: milestones give titles, cosmetics and quality-of-life perks.
// Page rewards: at 50% the page's Blessing opens at the Shrine (setBlessingGate); at 100% a Page
// Seal gives a title and a tiny bonus, capped per stat by CODEX_CAP forever (all regions).
//
// Performance: pages are recomputed only when an event marked the Codex dirty, at most every
// CODEX_TUNE.every seconds (a few hundred cheap reads), plus a slow safety sweep. Nothing here
// scans the bag or other big collections on a tick.
//
// Exposed names:
//   data   CODEX_PAGES (page defs), CODEX_PAGE_IDS, CODEX_MILESTONES, CODEX_CAP, CODEX_TUNE
//   read   codexPages() -> [page view], codexPage(id) -> page view | null
//            page view: { id, n, locked, lockTxt, got, max, pct, light, lightMax, half, seal,
//                         bless, sealTxt, title, tiles: [{ key, n, got, max, pts, ptsMax, hint, sub, ic, grp }] }
//          codexLight(), codexNext() -> next milestone | null, codexHas(rewardId) -> bool,
//          codexBonus(key) (capped Seal bonus, 0..CODEX_CAP[key]), codexTitle() -> title text | '',
//          codexTitles() -> [{ id, n, src, got }], codexExact() (exact hints unlocked),
//          codexNews() -> pages with entries the player has not looked at, codexIsNew(pageId, i)
//   act    codexRefresh(force) -> light, codexSeen(pageId) -> [tile indexes that are new] (and
//          marks them seen), codexSetTitle(id | null) -> bool, codexMilestonesSeen()
//
// Events emitted: codexLight { light, gain }, codexPage { id, kind: 'half' | 'seal' },
//   codexMilestone { at, rewards }, codexOpen { page } (UI: open the Codex sheet), codexInit { light }.
// Listens: kill (champions), itemAdded / reforged (affixes, Masterwork), synergyChange, bondLevel, harvest,
//   trophy, and marks pages dirty on recruit, promote, charLevel, campBuilt, omen,
//   weeklyClaim, deedFeat, zoneClear, loot, transmuted, crafted.
// Hooks: setBlessingGate (57-camp), registerGoal (Next Up), registerAwayLine, addModifier for the
//   Seal keys, addBonus: deepOil, and three
//   stored-for-later keys nothing reads yet: bag, buildQueue, deepRerolls.
//
// Save: registerState('codex', { v, rec, got, title, lightMax, init, half, seal, seen, mSeen }).
//   rec: champ {typeKey: 1}, aff {affixId: tier bitmask}, mw {trophyIdx: 1},
//        mat {family: tier bitmask, troph: type bitmask}, dare {omenId: 1}
//   got: milestone Light -> timestamp. half / seal: pageId -> timestamp (permanent once earned).
//   seen: pageId -> string, one base-36 char per tile = units the player has looked at (for the
//   one-time glow). mSeen: highest milestone the player has looked at (the "New" dot).

const CODEX_TUNE = { every: 5, sweep: 60, goalFrom: 0.6 };
const CODEX_CAP = { dmg: 0.05, critDmg: 0.05, uniqueChance: 0.05, skillXp: 0.05, offline: 0.05,
  gatherSpeed: 0.05, buildTime: 0.05, essence: 0.05 };

// Milestones. kind: title | qol | cosmetic. live: false = the unlock is stored and switches on
// when its system arrives (the UI says so plainly).
const CODEX_MILESTONES = [
  { at: 25, rw: [{ id: 't_lamplighter', kind: 'title', n: 'Title: Lamplighter', live: true }] },
  { at: 50, rw: [{ id: 'salvage1', kind: 'qol', n: 'Auto-salvage, basic', txt: 'Commons below the tier you wear in that spot are salvaged when they drop.', later: 'Saved for later: all gear is made by you today, so this switches on when foes drop gear.' }] },
  { at: 75, rw: [{ id: 'd_string', kind: 'cosmetic', n: 'Camp decoration: Lantern String', later: 'Saved: it hangs in camp once the camp scene shows decorations.' }] },
  { at: 100, rw: [{ id: 'hints', kind: 'qol', n: 'Exact Codex hints', txt: 'Every blank entry says exactly where to find it, at any Library level.', live: true }] },
  { at: 150, rw: [{ id: 'c_amber', kind: 'cosmetic', n: 'Lantern colour: Hearth Amber', later: 'Saved: hero lantern colours arrive with hero cosmetics.' }] },
  { at: 200, rw: [{ id: 't_wayfinder', kind: 'title', n: 'Title: the Wayfinder', live: true }] },   // W1-C: no expeditions in solo: a title
  { at: 250, rw: [{ id: 'salvage2', kind: 'qol', n: 'Auto-salvage, full', txt: 'Rules per kind by rarity and tier, with a switch to keep Masterwork gear.', later: 'Saved for later, like the basic filter.' }] },
  { at: 300, rw: [{ id: 't_relighter', kind: 'title', n: 'Title: Relighter', live: true }, { id: 'd_moth', kind: 'cosmetic', n: 'Camp decoration: Moth Lanterns', later: 'Saved: shows once the camp scene shows decorations.' }] },
  { at: 350, rw: [{ id: 'bag10', kind: 'qol', n: 'Bag +10', txt: 'Ten more spare items fit in your bag.', later: 'Saved: the bag grows when it learns to read this bonus.' }] },
  { at: 400, rw: [{ id: 'queue1', kind: 'qol', n: '+1 queued build', txt: 'Line up one more build per builder.', later: 'Saved: the camp builders take it once they read this bonus.' }] },
  { at: 450, rw: [{ id: 'c_motes', kind: 'cosmetic', n: 'Hero trail: Lantern Motes', later: 'Saved: arrives with hero cosmetics.' }] },
  { at: 500, rw: [{ id: 't_keeper', kind: 'title', n: 'Title: the Chronicler', live: true }, { id: 'd_lectern', kind: 'cosmetic', n: 'Camp decoration: Codex Lectern', later: 'Saved: shows once the camp scene shows decorations.' }] },
  { at: 600, rw: [{ id: 'forecast', kind: 'qol', n: 'Almanac forecast: 3 days ahead', later: 'Saved: the Almanac will show it in a later update.' }] },
  { at: 700, rw: [{ id: 'c_star', kind: 'cosmetic', n: 'Lantern colour: Starlight', later: 'Saved: arrives with hero cosmetics.' }] },
  { at: 800, rw: [{ id: 't_lightbringer', kind: 'title', n: 'Title: Lightbringer', live: true }, { id: 'd_flame', kind: 'cosmetic', n: "The Hearth's flame burns white-gold", later: 'Saved: shows once the camp scene shows decorations.' }] },
  { at: 900, rw: [{ id: 'deepreroll', kind: 'qol', n: 'Deepwell: +1 reroll per run', later: 'Saved: works when the Deepwell opens.' }] },
  { at: 1000, rw: [{ id: 't_lanternfall', kind: 'title', n: 'Title: the Everlit', live: true }, { id: 'c_crown', kind: 'cosmetic', n: 'Hero cosmetic: the Lantern Crown', later: 'Saved: arrives with hero cosmetics.' }] },
  { at: 1100, rw: [{ id: 'd_lantern', kind: 'cosmetic', n: 'A replica Great Lantern above camp', later: 'Saved: shows once the camp scene shows decorations.' }] }
];

// Page defs. bless: CAMP_BLESS id opened at 50%. seal: { key, v, txt } bonus at 100% (key null =
// title only). show(): the page's system is in the game (else it shows as a locked card, no Light).
// tiles(ctx) -> [{ key, n, got, max, pts, ptsMax, ... }] where pts are HALF Light units.
const CODEX_PAGES = {};
const CODEX_PAGE_IDS = [];

let codexPages, codexPage, codexLight, codexNext, codexHas, codexBonus, codexTitle, codexTitles, codexExact,
  codexNews, codexIsNew, codexRefresh, codexSeen, codexSetTitle, codexMilestonesSeen;

{
  registerState('codex', {
    v: 1,
    rec: { champ: {}, aff: {}, mw: {}, mat: {}, dare: {} },
    got: {}, title: null, lightMax: 0, init: false,
    half: {}, seal: {}, seen: {}, mSeen: 0
  });
  const CX = () => S.codex;
  const R = () => CX().rec;
  const has = v => typeof v !== 'undefined';
  const safe = (fn, d) => { try { return fn(); } catch (e) { console.error('[lanternfall] codex', e); return d; } };
  const bits = m => { let n = 0; m = m | 0; while (m) { n += m & 1; m >>>= 1; } return n; };
  const REGION_ZONES = REGIONS[0].z1;   // the Hollow; coast rows are R2-7's
  const mobKey = m => m && m.skin && m.type ? m.type : m && m.key ? String(m.key).replace(/\d+$/, '') : null;   // a zone monster (59l) counts for its type slot
  const tIdx = k => TYPES.findIndex(t => t.key === k);
  const zonesOf = i => { const z = []; for (let n = i + 1; n <= REGION_ZONES && z.length < 3; n += 7) z.push(n); return z; };
  const exact = () => (typeof campLevel === 'function' && campLevel('library') >= 3) || !!CX().got[100];
  codexExact = exact;

  const page = (id, d) => { CODEX_PAGES[id] = Object.assign({ id }, d); CODEX_PAGE_IDS.push(id); };

  // ---------------- 1. Bestiary: 7 types x (4 tiers x2, Elder x3, champion x2) ----------------
  page('bestiary', {
    n: 'Bestiary', bless: 'blade', seal: { key: 'dmg', v: 0.02, txt: '+2% damage' }, title: 'Monsterwise', pic: 'mob',
    tiles: x => TYPES.map((t, i) => {
      const kills = (S.mastery && S.mastery.types[t.key]) || 0, tier = masteryApi.tierFor(kills);
      const elder = S.maxZone > i + 1 ? 1 : 0, champ = R().champ[t.key] ? 1 : 0;
      let hint = '';
      if (tier < 4) {
        const need = Math.ceil(BESTIARY_TIERS[tier] - kills);
        hint = x.exact ? `Defeat ${fmt(need)} more ${t.name}s (zones ${zonesOf(i).join(', ')}...).` : `Defeat more ${t.name}s.`;
      } else if (!elder) hint = x.exact ? `Beat the zone ${i + 1} boss.` : 'A boss guards this page.';
      else if (!champ) hint = x.exact ? `Beat a champion ${t.name}. Champions show up from zone 20.` : 'A stronger one is out there.';
      return { key: t.key, n: t.name, got: tier + elder + champ, max: 6, pts: tier * 4 + elder * 6 + champ * 4, ptsMax: 26, hint,
        sub: `Tier ${tier} of 4${elder ? ' · Elder' : ''}${champ ? ' · Champion' : ''}`, kills, mob: t.key,
        // the story lines (55-story storyBestiary) of the zone monsters in this slot: the zone line once fought, the Captain line once beaten (the 2nd argument is ignored)
        lore: typeof storyBestiary === 'function' ? storyBestiary(t.key, { foe: tier >= 1, elder, champ, listener: i === 6 && S.maxZone > REGION_ZONES }) : [] };
    })
  });
  // ---------------- 2. Zones: 35 zones x 5 mastery stars ----------------
  page('zones', {
    n: 'Zones', bless: 'edge', seal: { key: 'critDmg', v: 0.03, txt: '+3% crit damage' }, title: 'Wayfinder', pic: 'rows',
    tiles: x => {
      const out = [];
      for (let z = 1; z <= REGION_ZONES; z++) {
        const k = (S.mastery && S.mastery.zones[z]) || 0, st = Math.min(5, masteryApi.starsFor(k));
        const need = st < 5 ? Math.ceil(MASTERY_STARS[st] - k) : 0;
        out.push({ key: 'z' + z, n: `${z}. ${zoneName(z)}`, got: st, max: 5, pts: st * 2, ptsMax: 10, zone: z, mob: TYPES[zoneType(z)].key, grp: zoneName(z),
          sub: `${fmt(k)} kills here`,
          hint: st >= 5 ? '' : z > S.maxZone ? (x.exact ? `Reach zone ${z}.` : 'Further down the road.') : x.exact ? `${fmt(need)} more kills here for star ${st + 1}. A boss counts 5.` : 'Fight here more.' });
      }
      return out;
    }
  });
  // ---------------- 3. Uniques: 13 hero uniques ----------------
  page('uniques', {
    n: 'Uniques', bless: 'hunt', seal: { key: 'uniqueChance', v: 0.03, txt: 'Uniques drop 3% more often' }, title: 'the Curator', pic: 'item',
    tiles: x => Object.keys(UNIQ).map(k => {
      const u = UNIQ[k], got = S.found[k] ? 1 : 0;
      return { key: k, n: u.name, got, max: 1, pts: got * 10, ptsMax: 10, item: { slot: u.slot, t: S.found[k] || 1, u: k },
        sub: got ? u.txt : '', hint: got ? '' : x.exact ? u.src + '.' : (RAID_UNIQ.includes(k) ? 'The world raid guards it.' : 'A boss guards it.') };
    })
  });
  // ---------------- 4. Armoury: 13 affix stats x 5 tiers seen; 7 Masterwork lines ----------------
  const roleOf = a => Object.keys(CRAFT_ROLE_POOL).find(r => CRAFT_ROLE_POOL[r].includes(a)) || 'any';
  const ROLE_TXT = { tank: 'Guardian', striker: 'Striker', caster: 'Caster', support: 'Support', any: 'any' };
  page('armoury', {
    n: 'Armoury', bless: 'anvil', seal: { key: 'skillXp', v: 0.03, txt: '+3% crafting XP' }, title: 'Armourer', pic: 'item',
    tiles: x => {
      const out = [];
      for (const a of Object.keys(CRAFT_AFFIXES)) {
        const m = R().aff[a] | 0, got = bits(m), next = [1, 2, 3, 4, 5].find(t => !(m & (1 << (t - 1))));
        const nm = (CRAFT_STATS[a] && CRAFT_STATS[a].n) || a, role = ROLE_TXT[roleOf(a)];
        out.push({ key: 'a_' + a, n: nm, got, max: 5, pts: got * 2, ptsMax: 10, grp: 'Affix lines', mask: m,
          sub: `Tiers seen: ${[1, 2, 3, 4, 5].map(t => m & (1 << (t - 1)) ? roman(t) : '·').join(' ')}`,
          hint: !next ? '' : x.exact ? `Craft tier-${next} ${role === 'any' ? '' : role + ' '}gear; ${nm} can roll on it.` : `Craft ${role === 'any' ? 'any' : role} gear.` });
      }
      CRAFT_TROPHIES.forEach((tr, i) => {
        const got = R().mw[i] ? 1 : 0, line = tr.mw.gear && CRAFT_STATS[tr.mw.gear] ? CRAFT_STATS[tr.mw.gear].n : '';
        out.push({ key: 'mw_' + i, n: `${tr.n} Masterwork`, got, max: 1, pts: got * 4, ptsMax: 4, grp: 'Masterwork lines', troph: i,
          sub: line ? `Adds ${line}.` : '', hint: got ? '' : x.exact ? `Craft a Masterwork item with a ${tr.n}.` : 'Craft with a Trophy.' });
      });
      return out;
    }
  });
  // ---------------- 7. Materials: 7 families x 5 tiers; 7 Trophy types (0.5 each) ----------------
  page('materials', {
    n: 'Materials', bless: 'wild', seal: { key: 'gatherSpeed', v: 0.02, txt: 'Gathering 2% faster' }, title: 'Forager', pic: 'mat',
    tiles: x => {
      const out = [];
      for (const f of CRAFT_FAMILIES) {
        const m = R().mat[f] | 0, got = bits(m), next = [1, 2, 3, 4, 5].find(t => !(m & (1 << (t - 1))));
        out.push({ key: f, n: MAT[f].n, got, max: 5, pts: got, ptsMax: 5, mat: [f, [5, 4, 3, 2, 1].find(t => m & (1 << (t - 1))) || 1], mask: m, grp: 'Families',
          sub: [1, 2, 3, 4, 5].filter(t => m & (1 << (t - 1))).map(t => MAT[f].short[t - 1]).join(', '),
          hint: !next ? '' : x.exact ? `Hold ${matName(f, next)}.` : `Gather or find better ${MAT[f].n.toLowerCase()}.` });
      }
      const tm = R().mat.troph | 0;
      CRAFT_TROPHIES.forEach((tr, i) => {
        const got = tm & (1 << i) ? 1 : 0;
        out.push({ key: 'tr_' + i, n: tr.n, got, max: 1, pts: got, ptsMax: 1, troph: i, grp: 'Trophies',
          hint: got ? '' : x.exact ? `Beat a champion ${TYPES[i].name} (zone 20+) or its zone boss.` : 'Beat a champion or a boss.' });
      });
      return out;
    }
  });
  // ---------------- 8. Camp: every building level (Hearth 10, 8 buildings x5, Shrine 3) ----------------
  page('camp', {
    n: 'Camp', bless: 'hearth', seal: { key: 'buildTime', v: 0.03, txt: 'Builds 3% faster' }, title: 'Masterbuilder', pic: 'rows',
    show: () => typeof CAMP_B === 'object',
    tiles: x => {
      const open = typeof campOpen === 'function' && campOpen();
      return Object.keys(CAMP_B).map(id => {
        const d = CAMP_B[id], lv = open ? Math.min(d.max, campLevel(id)) : 0;
        return { key: id, n: d.n, got: lv, max: d.max, pts: lv * 2, ptsMax: d.max * 2, bld: id,
          hint: lv >= d.max ? '' : !open ? 'The camp opens at zone 5.' : `Build the ${d.n} to Lv ${lv + 1}.` };
      });
    }
  });
  // ---------------- 10. Deepwell (locked until the Deepwell exists) ----------------
  page('deepwell', {
    n: 'Deepwell', bless: 'deep', seal: { key: null, bonus: 'deepOil', v: 5, txt: '+5s starting Oil (Deepwell only)' }, title: 'Wellsage', pic: 'rows',
    show: () => !!S.deep, lockTxt: 'Opens with the Deepwell.', tiles: () => []
  });
  // ---------------- 11. Seals: Almanac Stamps (Trial Seals join with the Deepwell) ----------------
  page('seals', {
    n: 'Seals', seal: { key: null, txt: '' }, title: 'the Faithful', pic: 'rows',
    show: () => !!S.almanac,
    tiles: x => {
      const n = Math.min(52, S.almanac.stamps | 0);
      return [{ key: 'stamps', n: 'Almanac Stamps', got: n, max: 52, pts: n * 2, ptsMax: 104,
        sub: `${n} of 52 weeks. Any week counts; a missed week costs nothing.`, hint: n >= 52 ? '' : 'Finish 3 weekly goals in a week for a Stamp.' }];
    }
  });
  // ---------------- 12. Omens: Omens seen; Dares taken ----------------
  const omenOk = o => o.needs !== 'Deepwell' || (typeof deepUnlocked === 'function' ? deepUnlocked() : !!S.deep);
  page('omens', {
    n: 'Omens', bless: 'road', seal: { key: 'offline', v: 0.03, txt: '+3% away gains' }, title: 'Omenreader', pic: 'rows',
    show: () => !!S.almanac && Array.isArray(OMENS),
    tiles: x => {
      const out = [];
      for (const o of OMENS) if (omenOk(o)) {
        const seen = S.almanac.seen && o.id in S.almanac.seen ? 1 : 0;
        out.push({ key: o.id, n: o.n, got: seen, max: 1, pts: seen * 2, ptsMax: 2, ic: o.ic, grp: 'Omens seen',
          sub: seen ? o.fx : '', hint: seen ? '' : x.exact ? 'Its day will come. The Almanac shows today and tomorrow.' : 'Comes on its own day.' });
      }
      for (const o of OMENS) if (o.dare && omenOk(o)) {
        const got = R().dare[o.id] ? 1 : 0;
        out.push({ key: 'd_' + o.id, n: o.dare.n, got, max: 1, pts: got * 2, ptsMax: 2, ic: o.ic, grp: 'Dares taken',
          sub: got ? o.dare.fx : '', hint: got ? '' : x.exact ? `Take the Dare on a ${o.n} day.` : 'Take a Dare.' });
      }
      return out;
    }
  });
  // ---------------- 13. Achievements x2 ----------------
  page('achievements', {
    n: 'Achievements', bless: 'oath', seal: { key: 'essence', v: 0.02, txt: '+2% essence' }, title: 'the Accomplished', pic: 'rows',
    show: () => typeof deeds === 'object',
    tiles: x => deeds.milestones().map(a => {
      const got = a.got ? 1 : 0;
      return { key: a.legacy, n: a.n, got, max: 1, pts: got * 4, ptsMax: 4, ic: [a.ic, '#F2C14E'], sub: got ? a.bonusTxt : '', hint: got ? '' : a.needs + '.' };
    })
  });
  // ---------------- 14. Wardrobe (locked until the Deepwell shop exists) ----------------
  page('wardrobe', {
    n: 'Wardrobe', seal: { key: null, txt: '' }, title: 'the Dapper', pic: 'rows',
    show: () => !!(S.deep && S.deep.cos), lockTxt: 'Opens with the Deepwell shop.', tiles: () => []
  });

  // ---------------- compute and cache ----------------
  let cache = null, dirty = true, acc = 0, sweep = 0;
  const visible = p => !p.show || !!safe(p.show, false);
  function build(p, x) {
    const vis = visible(p);
    const tiles = vis ? safe(() => p.tiles(x), []) : [];
    let got = 0, max = 0, pts = 0, ptsMax = 0;
    for (const t of tiles) { got += t.got; max += t.max; pts += t.pts; ptsMax += t.ptsMax; }
    const pct = ptsMax ? pts / ptsMax : 0;
    const bl = p.bless && typeof CAMP_BLESS === 'object' ? CAMP_BLESS[p.bless] : null;
    return {
      id: p.id, n: p.n, locked: !vis || !ptsMax, lockTxt: p.lockTxt || 'Not in the game yet.', got, max, pts, ptsMax, pct,
      light: pts / 2, lightMax: ptsMax / 2, half: !!CX().half[p.id], seal: !!CX().seal[p.id],
      bless: bl ? { id: p.bless, n: bl.n, fx: bl.fx(bl.v) } : null, sealTxt: p.seal && p.seal.txt || '', title: p.title, pic: p.pic, tiles
    };
  }
  function compute() {
    const x = { exact: exact() };
    const pages = CODEX_PAGE_IDS.map(id => build(CODEX_PAGES[id], x));
    let pts = 0; for (const p of pages) if (!p.locked) pts += p.pts;
    return { pages, light: Math.floor(pts / 2), at: Date.now() };
  }

  // ---------------- recorders ----------------
  const markAff = it => {
    if (!it || !Array.isArray(it.a)) return;
    const b = 1 << (Math.max(1, Math.min(5, it.t | 0)) - 1);
    for (const l of it.a) if (l && CRAFT_AFFIXES[l[0]]) R().aff[l[0]] = (R().aff[l[0]] | 0) | b;
    if (it.mw != null && CRAFT_TROPHIES[it.mw]) R().mw[it.mw] = 1;
  };
  const markMats = () => {
    for (const f of CRAFT_FAMILIES) { const a = S.mats[f] || []; let m = R().mat[f] | 0; for (let t = 0; t < 5; t++) if ((a[t] || 0) >= 1) m |= 1 << t; R().mat[f] = m; }
    const tr = (S.craft && S.craft.troph) || []; let m = R().mat.troph | 0;
    for (let i = 0; i < 7; i++) if ((tr[i] || 0) >= 1) m |= 1 << i;
    R().mat.troph = m;
  };
  const markDare = () => {
    if (typeof almanac !== 'object' || !almanac.dareOn || !safe(almanac.dareOn, false)) return;
    const o = safe(almanac.active, null); if (o && o.dare) R().dare[o.id] = 1;
  };
  const dirt = () => { dirty = true; };
  // Any kill can move a bestiary tier or a mastery star; the refresh itself waits for the timer.
  on('kill', ({ mob }) => { dirty = true; if (mob && mob.champ) { const k = mobKey(mob); if (k && tIdx(k) >= 0) R().champ[k] = 1; } });
  on('itemAdded', ({ item }) => { markAff(item); dirty = true; });
  on('reforged', ({ item }) => { markAff(item); dirty = true; });
  on('harvest', ({ kind, t }) => { if (CRAFT_FAMILIES.includes(kind) && t >= 1 && t <= 5) R().mat[kind] = (R().mat[kind] | 0) | (1 << (t - 1)); dirty = true; });
  on('trophy', ({ i }) => { if (i >= 0 && i < 7) R().mat.troph = (R().mat.troph | 0) | (1 << i); dirty = true; });
  for (const e of ['campBuilt', 'omen', 'weeklyClaim', 'deedFeat', 'zoneClear', 'loot', 'transmuted', 'crafted'])
    on(e, dirt);

  // ---------------- rewards: Seals (capped), milestones, the Blessing gate ----------------
  const sealSum = {};
  function rebuildSeals() {
    for (const k in sealSum) sealSum[k] = 0;
    for (const id of CODEX_PAGE_IDS) {
      const s = CODEX_PAGES[id].seal; if (!s || !CX().seal[id]) continue;
      const k = s.key || s.bonus; if (k) sealSum[k] = (sealSum[k] || 0) + s.v;
    }
  }
  rebuildSeals();   // Seals saved earlier count from the first frame
  codexBonus = key => Math.min(CODEX_CAP[key] != null ? CODEX_CAP[key] : Infinity, sealSum[key] || 0);
  addModifier('dmg', () => 1 + codexBonus('dmg'));
  keenSource('codex', 'Codex seal', () => codexBonus('critDmg'));   // ECON-A: was +3% gold
  addModifier('uniqueChance', () => 1 + codexBonus('uniqueChance'));
  for (const k of ['smith', 'bench', 'loom', 'ench']) addModifier('skillXp:' + k, () => 1 + codexBonus('skillXp'));
  addModifier('offline', () => 1 + codexBonus('offline'));
  addModifier('gatherSpeed', () => 1 + codexBonus('gatherSpeed'));
  addModifier('buildTime', () => 1 - codexBonus('buildTime'));
  addModifier('essence', () => 1 + codexBonus('essence'));
  addBonus('deepOil', () => codexBonus('deepOil'));

  codexHas = rid => CODEX_MILESTONES.some(m => CX().got[m.at] && m.rw.some(r => r.id === rid));
  addBonus('bag', () => codexHas('bag10') ? 10 : 0);            // stored for later: nothing reads 'bag' yet
  addBonus('buildQueue', () => codexHas('queue1') ? 1 : 0);     // stored for later: the camp queue is 1 per builder
  addBonus('deepRerolls', () => codexHas('deepreroll') ? 1 : 0); // Deepwell only

  const pageByName = {};
  for (const id of CODEX_PAGE_IDS) pageByName[CODEX_PAGES[id].n] = id;
  const pageOfBless = b => CODEX_PAGE_IDS.find(id => CODEX_PAGES[id].bless === b) || (typeof CAMP_BLESS === 'object' && CAMP_BLESS[b] ? pageByName[CAMP_BLESS[b].page] : null);
  // A Blessing is open once its page has reached 50% (recorded, so it never closes again).
  const gateFn = b => { const id = pageOfBless(b); return !!id && !!CX().half[id]; };
  if (typeof setBlessingGate === 'function') setBlessingGate(gateFn);

  function grant(c, quiet) {
    const out = { light: 0, gain: 0, pages: [], miles: [] };
    for (const p of c.pages) {
      if (p.locked) continue;
      if (!CX().half[p.id] && p.pct >= 0.5) { CX().half[p.id] = Date.now(); p.half = true; out.pages.push({ id: p.id, kind: 'half', p }); }
      if (!CX().seal[p.id] && p.pts >= p.ptsMax) { CX().seal[p.id] = Date.now(); p.seal = true; out.pages.push({ id: p.id, kind: 'seal', p }); }
    }
    const before = CX().lightMax;
    const light = Math.max(before, c.light);
    CX().lightMax = light; out.light = light; out.gain = light - before;
    for (const m of CODEX_MILESTONES) if (light >= m.at && !CX().got[m.at]) { CX().got[m.at] = Date.now(); out.miles.push(m); }
    if (out.pages.some(x => x.kind === 'seal')) rebuildSeals();
    if (quiet) return out;
    for (const x of out.pages) {
      const P = CODEX_PAGES[x.id];
      // W1-B: channels in 23n-data-notices ('codex': the bell; 'codex-small': the bell list only)
      if (x.kind === 'half' && x.p.bless) emit('toast', { key: 'codex', msg: `Codex: the ${P.n} page is half full. The ${x.p.bless.n} Blessing is open at the Shrine.`, kind: 'good', icon: { ic: ['banner', '#F2C14E'] }, prio: 'normal' });
      else if (x.kind === 'half') emit('toast', { key: 'codex-small', msg: `Codex: the ${P.n} page is half full.`, kind: 'good', icon: { ic: ['banner', '#F2C14E'] }, prio: 'low' });
      if (x.kind === 'seal') emit('toast', { key: 'codex', msg: `Page Seal: ${P.n}.${P.seal && P.seal.txt ? ' ' + P.seal.txt + '.' : ''} New title: ${P.title}.`, kind: 'good', icon: { ic: ['banner', '#F2C14E'] }, prio: 'high' });
      emit('codexPage', { id: x.id, kind: x.kind });
    }
    for (const m of out.miles) {
      emit('toast', { key: 'codex', msg: `${m.at} Lantern Light: ${m.rw.map(r => r.n).join(', ')}.`, kind: 'good', icon: { ic: ['flame', '#F2C14E', { 5: '#FFB347', 7: '#FFF3C4' }] }, prio: 'normal' });
      emit('codexMilestone', { at: m.at, rewards: m.rw.map(r => r.id) });
    }
    if (out.gain > 0) emit('codexLight', { light, gain: out.gain });
    if (out.pages.length || out.miles.length) save();
    return out;
  }

  // ---------------- seen (one-time glow) ----------------
  const b36 = n => Math.max(0, Math.min(35, n | 0)).toString(36);
  const seenStr = p => p.tiles.map(t => b36(t.got)).join('');
  const seenAt = (id, i) => { const s = CX().seen[id]; if (typeof s !== 'string' || i >= s.length) return 0; return parseInt(s[i], 36) || 0; };

  // ---------------- first load: the Codex starts recording ----------------
  function init() {
    if (CX().init) return;
    markMats(); markDare();
    const c = compute();
    grant(c, true);
    for (const p of c.pages) if (!p.locked) CX().seen[p.id] = seenStr(p);
    CX().mSeen = CODEX_MILESTONES.filter(m => CX().got[m.at]).reduce((a, m) => Math.max(a, m.at), 0);
    CX().init = true;
    cache = c; dirty = false;
    emit('codexInit', { light: CX().lightMax });
  }

  // quiet: record rewards without toasts (the away card lists them instead).
  codexRefresh = (force, quiet) => {
    if (!CX().init) init();
    if (force || dirty || !cache) {
      dirty = false;
      markMats(); markDare();
      cache = compute();
      grant(cache, !!quiet);
    }
    return CX().lightMax;
  };
  onTick(dt => {
    acc += dt; sweep += dt;
    if (sweep >= CODEX_TUNE.sweep) { sweep = 0; dirty = true; }
    // First load: wait 2s so the achievements' own first check (at 1s) has run.
    if (!CX().init) { if (acc >= 2) { acc = 0; init(); } return; }
    if (acc < CODEX_TUNE.every) return;
    acc = 0;
    if (dirty) codexRefresh(false);
  });

  // ---------------- read API ----------------
  const cur = () => { if (!cache || !CX().init) codexRefresh(!cache); return cache; };
  codexPages = () => cur().pages;
  codexPage = id => cur().pages.find(p => p.id === id) || null;
  codexLight = () => Math.max(CX().lightMax, cache ? cache.light : 0);
  codexNext = () => CODEX_MILESTONES.find(m => !CX().got[m.at]) || null;
  codexMilestonesSeen = () => { CX().mSeen = CODEX_MILESTONES.filter(m => CX().got[m.at]).reduce((a, m) => Math.max(a, m.at), 0); };
  codexIsNew = (id, i) => { const p = codexPage(id); return !!p && !!p.tiles[i] && p.tiles[i].got > seenAt(id, i); };
  codexNews = () => {
    const out = [];
    for (const p of codexPages()) if (!p.locked && p.tiles.some((t, i) => t.got > seenAt(p.id, i))) out.push(p.id);
    return out;
  };
  codexSeen = id => {
    const p = codexPage(id); if (!p || p.locked) return [];
    const fresh = []; p.tiles.forEach((t, i) => { if (t.got > seenAt(id, i)) fresh.push(i); });
    CX().seen[id] = seenStr(p);
    return fresh;
  };

  // ---------------- titles (local only; never sent online) ----------------
  codexTitles = () => {
    const out = [];
    for (const m of CODEX_MILESTONES) for (const r of m.rw) if (r.kind === 'title') out.push({ id: r.id, n: r.n.replace(/^Title: /, ''), src: `${m.at} Lantern Light`, got: !!CX().got[m.at] });
    for (const id of CODEX_PAGE_IDS) { const P = CODEX_PAGES[id]; if (visible(P)) out.push({ id: 'p_' + id, n: P.title, src: `${P.n} Page Seal`, got: !!CX().seal[id] }); }
    return out;
  };
  codexSetTitle = id => {
    if (id == null) { CX().title = null; save(); return true; }
    const t = codexTitles().find(x => x.id === id); if (!t || !t.got) return false;
    CX().title = id; save(); return true;
  };
  codexTitle = () => { const id = CX().title; if (!id) return ''; const t = codexTitles().find(x => x.id === id); return t && t.got ? t.n : ''; };

  // ---------------- Next Up: a page close to its next reward ----------------
  let goalCache = { at: -1, v: null };
  const bestGoal = () => {
    const now = Date.now();
    if (now - goalCache.at < 2000 && goalCache.at <= now) return goalCache.v;
    goalCache.at = now; goalCache.v = null;
    if (!CX().init || !cache) return null;
    let best = null;
    for (const p of cache.pages) {
      if (p.locked || p.seal) continue;
      const aim = !p.half && p.bless ? 0.5 : 1, need = p.ptsMax * aim, pr = Math.min(0.99, p.pts / need);
      if (pr >= CODEX_TUNE.goalFrom && (!best || pr > best.pr)) best = { id: p.id, n: p.n, pr, aim, bless: p.bless, left: Math.max(1, Math.ceil(need - p.pts)) };
    }
    goalCache.v = best; return best;
  };
  registerGoal({
    id: 'codex-page', sys: 'codex', prio: -1,
    label: () => { const b = bestGoal(); if (!b) return 'Codex'; return b.aim < 1 ? `Codex: ${b.n} to half (${b.bless.n} Blessing)` : `Codex: finish the ${b.n} page`; },
    pct: () => { const b = bestGoal(); return b ? b.pr : null; },
    go: () => { const b = bestGoal(); return { fn: () => emit('codexOpen', { page: b ? b.id : null }) }; },
    icon: { ic: ['banner', '#F2C14E'] }
  });

  // ---------------- away card ----------------
  let snap = null;
  // Only after the first load's retro credit (the boot's away phase comes before it, and counts as past deeds).
  on('awayBegin', () => { if (!CX().init) { snap = null; return; } snap = { light: CX().lightMax, seal: Object.assign({}, CX().seal), half: Object.assign({}, CX().half), got: Object.assign({}, CX().got) }; });
  registerAwayLine(() => {
    if (!snap) return null;
    codexRefresh(true, true);
    const s = snap; snap = null;
    const lines = [];
    for (const id of CODEX_PAGE_IDS) {
      const P = CODEX_PAGES[id];
      if (CX().seal[id] && !s.seal[id]) lines.push({ icon: { ic: ['banner', '#F2C14E'] }, txt: `Codex: the ${P.n} page is complete`, sub: `${P.seal && P.seal.txt ? P.seal.txt + '. ' : ''}New title: ${P.title}.`, group: 'Codex', go: () => emit('codexOpen', { page: id }) });
      else if (CX().half[id] && !s.half[id] && P.bless && CAMP_BLESS[P.bless]) lines.push({ icon: { ic: ['banner', '#F2C14E'] }, txt: `Codex: the ${P.n} page is half full`, sub: `The ${CAMP_BLESS[P.bless].n} Blessing is open at the Shrine.`, group: 'Codex', go: () => emit('codexOpen', { page: id }) });
    }
    const miles = CODEX_MILESTONES.filter(m => CX().got[m.at] && !s.got[m.at]);
    for (const m of miles) lines.push({ icon: { ic: ['flame', '#F2C14E', { 5: '#FFB347', 7: '#FFF3C4' }] }, txt: `Codex: ${m.at} Lantern Light`, sub: m.rw.map(r => r.n).join(', ') + '.', group: 'Codex', go: () => emit('codexOpen', { page: null }) });
    const gain = CX().lightMax - s.light;
    if (gain > 0 && !lines.length) lines.push({ icon: { ic: ['flame', '#F2C14E', { 5: '#FFB347', 7: '#FFF3C4' }] }, txt: `Codex: +${gain} Lantern Light`, sub: `${CX().lightMax} in all.`, group: 'Codex', go: () => emit('codexOpen', { page: null }) });
    return lines;
  });
}
