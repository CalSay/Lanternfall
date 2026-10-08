// 55-almanac: the Almanac (docs/design/almanac.md). One daily Omen from the device date, an
// opt-in Dare on some Omens, and a weekly board of 5 relaxed goals.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Rules: an Omen only adds (pure upside). A Dare is a twist plus a bigger reward, switched on
// and off together, taken and dropped for free, never applied to away time. Away time uses
// the Omen of the day you left (deviceDay(S.last)). Unclaimed finished weekly goals are
// claimed for you when the week ends.
//
// Omens whose system is not in the game yet (needs: 'K5', 'K6', 'Camp', ...) stay in the table
// and are skipped: that day plays a fallback Omen. They switch on by themselves when the
// system lands (see AL_NEEDS), as long as it reads the modifier/bonus keys listed here.
//
// Exposed: almanac (API object, below), OMENS, WEEKLY_GOALS.
// Modifier keys read by other files: gold, xp, essence, crit, critDmg, dmg, gatherSpeed,
// offline, raid, yield:<family>, skillXp:<skill>, uniqueChance (50-sim kill),
// foeHp / bossHp (50-sim spawn), nonCrit (50-sim heroSwing, 40-rules heroDps),
// rareW (40-rules rarityWeights), salvage (51-actions), bountyPay (55-bounties).
// Bonus keys: bestiaryMult / masteryMult (55-mastery), bountyNoWait (55-bounties),
// (bossTime is gone with the boss timer, owner 2026-10-01.)

const almanac = {};
let OMENS, WEEKLY_GOALS;

{
  // ---------------- systems an Omen or goal can wait for ----------------
  // Each check is a runtime typeof/state probe so this file never needs editing when they merge.
  // craftItem, addRenown and deepUnlocked are `let`s in later files: until those files run,
  // even `typeof` on them throws (temporal dead zone). Code that runs at file load (a bonus() read)
  // can reach these probes, so a throw means "not loaded yet" and marks the answer as early.
  const AL_NEEDS = {
    K5: () => !!(S.skills && S.skills.forage),              // foraging arrives with K5 gathering
    K6: () => typeof craftItem === 'function',               // K6 crafting core
    B7: () => typeof addRenown === 'function',               // Renown (56c-unlocks)
    Camp: () => !!(S.camp && S.camp.open),                  // 57-camp.js: the camp is open (zone 5)
    Deepwell: () => !!S.deep && (typeof deepUnlocked !== 'function' || deepUnlocked())
  };
  let alEarly = false;       // a probe threw since the flag was last cleared
  const needsMet = x => {
    if (!x.needs) return true;
    const f = AL_NEEDS[x.needs]; if (!f) return false;
    try { return !!f(); } catch (e) { alEarly = true; return false; }
  };

  const bossNow = () => awayDay === null && target() === 'mob' && !!mob && !!mob.boss;

  // ---------------- the 35 Omens ----------------
  // mod: addModifier values while active. bonus: addBonus values. when: extra condition for mod.
  // ok: this save can use it. dare: { n, fx, mod, bonus } replaces/adds keys while taken.
  // ic: toast-style icon [name, main, extra]. go: what the "Go" button sets up.
  OMENS = [
    { id: 'quietWoods', n: 'Quiet Woods', cat: 'gather', fx: '+50% Wood', mod: { 'yield:wood': 1.5 }, ic: ['log', '#8C6A43'], go: { gather: 'wood' } },
    { id: 'deepVeins', n: 'Deep Veins', cat: 'gather', fx: '+50% Ore', mod: { 'yield:ore': 1.5 }, ic: ['ore', '#D08A4E'], go: { gather: 'ore' } },
    { id: 'crystalNight', n: 'Crystal Night', cat: 'gather', fx: '+50% Crystal', mod: { 'yield:crystal': 1.5 }, needs: 'K5', ic: ['crystal', '#9FE8FF'], go: { gather: 'crystal' } },
    { id: 'bloomDay', n: 'Bloom Day', cat: 'gather', fx: '+50% Herbs and Fibre', mod: { 'yield:herb': 1.5, 'yield:fibre': 1.5 }, needs: 'K5', ic: ['herb', '#6FCB6A'], go: { gather: 'herb' } },
    { id: 'swiftHands', n: 'Swift Hands', cat: 'gather', fx: 'Gathering is 30% faster', mod: { gatherSpeed: 1.3 }, ic: ['pick', '#F2C14E'], go: { gather: 'any' } },
    { id: 'glintHour', n: 'Glint Hour', cat: 'gather', fx: 'Glints appear twice as often', bonus: { glintRate: 1 }, needs: 'K5', ic: ['orb', '#FFF3C4'], go: { gather: 'any' } },
    { id: 'apprentice', n: 'Apprentice Day', cat: 'gather', fx: 'Gathering skills earn +50% XP', mod: { 'skillXp:mine': 1.5, 'skillXp:wood': 1.5, 'skillXp:forage': 1.5 }, ic: ['axe', '#6FCB6A'], go: { gather: 'low' } },

    { id: 'goldRain', n: 'Gold Rain', cat: 'fight', fx: '+30% gold', mod: { gold: 1.3 }, ic: ['coin', '#F2C14E'], go: { fight: 'best' },
      dare: { n: 'Gold Fever', fx: 'Foes have 30% more HP. Gold is +80% instead of +30%.', mod: { foeHp: 1.3, gold: 1.8 } } },
    { id: 'wraithTide', n: 'Wraith Tide', cat: 'fight', fx: 'Wraithmarsh zones drop triple essence', mod: { essence: 3 }, when: () => target() === 'mob' && zoneType(S.zone) === 6, ok: () => S.maxZone >= 7, ic: ['orb', '#B8C0E8'], go: { fight: 'wraith' } },
    { id: 'huntersMoon', n: "Hunter's Moon", cat: 'fight', fx: 'Signature drops come twice as often', mod: { sigDrop: 2 }, needs: 'K5', ic: ['banner', '#E0524F'], go: { fight: 'best' } },
    { id: 'championsDay', n: "Champion's Day", cat: 'fight', fx: 'Champions appear 3 times as often', mod: { champion: 3 }, needs: 'K5', ic: ['banner', '#F2C14E'], go: { fight: 'best' },
      dare: { n: 'Big Game', fx: 'Champions have double HP and drop 2 Trophies.', mod: { champHp: 2 }, bonus: { champTrophy: 1 } } },
    { id: 'bloodMoon', n: 'Blood Moon', cat: 'fight', fx: 'Zone bosses drop double Trophies', mod: { trophy: 2 }, needs: 'K5', ic: ['heart', '#E0524F'], go: { fight: 'boss' },
      dare: { n: 'Red Sky', fx: 'Bosses have 50% more HP. Trophies x3 instead of x2.', mod: { bossHp: 1.5, trophy: 3 } } },
    { id: 'luckyStar', n: 'Lucky Star', cat: 'fight', fx: 'Zone bosses drop uniques 50% more often', mod: { uniqueChance: 1.5 }, ic: ['charm', '#FF9E3D', { 6: '#9A97B3' }], go: { fight: 'boss' } },
    { id: 'keenWinds', n: 'Keen Winds', cat: 'fight', fx: 'Crits come 20% more often', mod: { crit: 1.2 }, ic: ['sword', '#9FE8FF'], go: { fight: 'best' },
      dare: { n: 'Knife Edge', fx: "Your hero's hits that do not crit deal 25% less. Crits deal 60% more.", mod: { nonCrit: 0.75, critDmg: 1.6 } } },
    { id: 'scholarSky', n: "Scholar's Sky", cat: 'fight', fx: 'Hero XP +50%', mod: { xp: 1.5 }, ic: ['glass', '#6FCB6A'], go: { fight: 'best' },
      dare: { n: 'Hard Lessons', fx: 'Foes have 25% more HP. Hero XP is x2.5 instead of +50%.', mod: { foeHp: 1.25, xp: 2.5 } } },
    { id: 'huntersFeast', n: "Hunter's Feast", cat: 'fight', fx: 'You deal +15% damage', mod: { dmg: 1.15 }, ic: ['mug', '#8C6A43', { 1: '#6B4A2E', 7: '#F2C14E', 5: '#EFE6D6' }], go: { fight: 'best' } },
    { id: 'bestiaryDay', n: 'Bestiary Day', cat: 'fight', fx: 'Kills count double toward bestiary perks', bonus: { bestiaryMult: 1 }, ic: ['banner', '#B58CFF'], go: { fight: 'best' } },
    { id: 'masteryDay', n: 'Mastery Day', cat: 'fight', fx: 'Kills count double toward zone mastery', bonus: { masteryMult: 1 }, ic: ['banner', '#F2C14E'], go: { fight: 'here' } },
    { id: 'bossHunt', n: 'Boss Hunt', cat: 'fight', fx: '+25% damage to zone bosses', mod: { dmg: 1.25 }, when: bossNow, ic: ['sword', '#E0524F'], go: { fight: 'boss' },
      dare: { n: 'Iron Hide', fx: 'Bosses have 25% more health. Bosses drop uniques twice as often.', mod: { bossHp: 1.25, uniqueChance: 2 } } },

    { id: 'hotForge', n: 'Hot Forge', cat: 'craft', fx: 'Crafting skills earn +50% XP', mod: { 'skillXp:smith': 1.5, 'skillXp:bench': 1.5, 'skillXp:loom': 1.5, 'skillXp:ench': 1.5 }, ic: ['anvil', '#FF9E3D'], go: { tab: 'forge' } },
    { id: 'steadyHands', n: 'Steady Hands', cat: 'craft', fx: 'Rare and Epic forge odds +50%', mod: { rareW: 1.5 }, ic: ['anvil', '#5FA8FF'], go: { tab: 'forge' } },
    { id: 'cheapReforge', n: 'Cheap Reforge', cat: 'craft', fx: 'Reforges cost half', mod: { reforge: 0.5 }, needs: 'K6', ic: ['anvil', '#B58CFF'], go: { tab: 'forge', gear: 'reforge' } },
    { id: 'salvagersLuck', n: "Salvager's Luck", cat: 'craft', fx: 'Salvage returns double', mod: { salvage: 2 }, ic: ['ore', '#F2C14E'], go: { tab: 'forge', gear: 'salvage' } },
    { id: 'transmuter', n: "Transmuter's Day", cat: 'craft', fx: 'Transmutes cost one less', bonus: { transmuteSave: 1 }, needs: 'K6', ic: ['orb', '#B58CFF'], go: { tab: 'forge' } },

    { id: 'buildersMoon', n: "Builder's Moon", cat: 'road', fx: 'Builds started today are 25% faster', mod: { buildTime: 0.75 }, needs: 'Camp', ic: ['anvil', '#D08A4E'], go: { tab: 'world' } },
    { id: 'bountyDay', n: 'Bounty Day', cat: 'road', fx: 'Bounties refill at once and pay +50%', bonus: { bountyNoWait: 1 }, mod: { bountyPay: 1.5 }, ic: ['banner', '#E0524F'], go: { tab: 'adv' } },
    { id: 'renownDay', n: 'Renown Day', cat: 'road', fx: 'Bounties give double Renown', mod: { renown: 2 }, needs: 'B7', ic: ['banner', '#F2C14E'], go: { tab: 'adv' } },

    { id: 'deepTide', n: 'Deep Tide', cat: 'deep', fx: 'Depth Marks x1.5', mod: { deepMarks: 1.5 }, needs: 'Deepwell', ic: ['orb', '#3F8FA8'], go: { tab: 'world' },
      dare: { n: 'Undertow', fx: 'Oil drains 20% faster. Depth Marks x2.5 instead.', mod: { oilDrain: 1.2, deepMarks: 2.5 } } },
    { id: 'lanternOil', n: 'Lantern Oil', cat: 'deep', fx: 'Deepwell runs start with +30s Oil', bonus: { deepOil: 30 }, needs: 'Deepwell', ic: ['flame', '#FF9E3D', { 5: '#FFB347', 7: '#FFF3C4' }], go: { tab: 'world' } },
    { id: 'fallingStars', n: 'Falling Stars', cat: 'deep', fx: 'Deepwell drafts show 4 boons', bonus: { deepOffers: 1 }, needs: 'Deepwell', ic: ['orb', '#FFF3C4'], go: { tab: 'world' } },

    { id: 'longNight', n: 'Long Night', cat: 'rest', fx: 'Away gains +25%', mod: { offline: 1.25 }, ic: ['glass', '#B58CFF'], go: null },
    { id: 'hearthDay', n: 'Hearth Day', cat: 'rest', fx: "The Hearth's away bonus is doubled", mod: { hearth: 2 }, needs: 'Camp', ic: ['flame', '#E0524F', { 5: '#FFB347', 7: '#FFF3C4' }], go: null },
    { id: 'wyrmStirs', n: 'The Wyrm Stirs', cat: 'rest', fx: '+25% raid damage', mod: { raid: 1.25 }, ok: () => S.wyrms > 0 || S.raid.gen > 0, ic: ['flame', '#E0524F', { 5: '#FFB347', 7: '#FFF3C4' }], go: { tab: 'world' } }
  ];
  const OMEN_BY = Object.fromEntries(OMENS.map(o => [o.id, o]));
  const AL_N = OMENS.length;
  const FALLBACK = ['goldRain', 'swiftHands', 'scholarSky', 'longNight', 'keenWinds'];
  // Keys where a value below 1 is the good direction (costs, times).
  const LOWER_BETTER = new Set(['reforge', 'buildTime']);
  const CAT_NAME = { gather: 'Gather', fight: 'Fight', craft: 'Craft', road: 'Road', deep: 'Deep', rest: 'Rest' };

  // ---------------- the schedule ----------------
  const pmod = (a, n) => ((a % n) + n) % n;
  // The within-cycle order: seeded shuffle, then a fix pass so no two neighbours share a category.
  const bagCache = new Map();
  function bagRaw(cycle) {
    if (bagCache.has(cycle)) return bagCache.get(cycle);
    const ids = OMENS.map(o => o.id), r = rng(cycle * 7919 + 17);
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = ids[i]; ids[i] = ids[j]; ids[j] = t; }
    const cat = i => OMEN_BY[ids[i]].cat;
    for (let pass = 0; pass < 8; pass++) {
      let clean = true;
      for (let i = 1; i < ids.length; i++) {
        if (cat(i) !== cat(i - 1)) continue;
        clean = false;
        let j = i + 1; while (j < ids.length && cat(j) === cat(i - 1)) j++;
        if (j < ids.length) { const t = ids[i]; ids[i] = ids[j]; ids[j] = t; continue; }
        // nothing different is left after i: move ids[i] into an earlier gap where it fits
        const c = cat(i), x = ids.splice(i, 1)[0];
        let k = 1; while (k < ids.length && (OMEN_BY[ids[k - 1]].cat === c || OMEN_BY[ids[k]].cat === c)) k++;
        ids.splice(k, 0, x);
      }
      if (clean) break;
    }
    bagCache.set(cycle, ids);
    return ids;
  }
  // Cycle boundary: day 0 of a cycle must not share a category with the last day of the one
  // before. Only positions 0..N-2 move here, so the last entry of every cycle stays fixed.
  const bagFixed = new Map();
  function bag(cycle) {
    if (bagFixed.has(cycle)) return bagFixed.get(cycle);
    const ids = bagRaw(cycle).slice(), prev = OMEN_BY[bagRaw(cycle - 1)[AL_N - 1]].cat, cat = i => OMEN_BY[ids[i]].cat;
    if (cat(0) === prev) {
      for (let k = 2; k < AL_N - 1; k++) {
        const a = cat(0), b = cat(k);
        if (b !== prev && b !== cat(1) && a !== cat(k - 1) && a !== cat(k + 1)) { const t = ids[0]; ids[0] = ids[k]; ids[k] = t; break; }
      }
    }
    bagFixed.set(cycle, ids);
    return ids;
  }
  // Crafting Omens wait until the Forge is built (a fresh Cold Hearth save gets the day's fallback; menu audit #12).
  const craftOpen = () => { try { return typeof hearthStationWhy !== 'function' || !hearthStationWhy('forge'); } catch (e) { alEarly = true; return false; } };
  const usable = o => !!o && needsMet(o) && (!o.ok || !!o.ok()) && (o.cat !== 'craft' || craftOpen());
  // The scheduled Omen for a day (ignores what this save can use).
  const scheduled = day => OMEN_BY[bag(Math.floor(day / AL_N))[pmod(day, AL_N)]];
  // The Omen this save plays on a day: the scheduled one, or the day's fallback.
  function omenFor(day) {
    const o = scheduled(day);
    if (usable(o)) return o;
    const f = OMEN_BY[FALLBACK[pmod(day, FALLBACK.length)]];
    return usable(f) ? f : OMEN_BY.goldRain;
  }

  // ---------------- which Omen is in force right now ----------------
  let awayDay = null;        // set for the length of awayGains(): the day the player left
  let forced;                // tools only: an Omen id, or 'none'
  const today = () => deviceDay(Date.now());
  let actCache = { k: '', o: null };
  function activeOmen() {
    if (forced !== undefined) return forced === 'none' ? null : OMEN_BY[forced] || null;
    const d = awayDay !== null ? awayDay : today();
    const k = d + ':' + S.maxZone + ':' + (S.raid.gen > 0 || S.wyrms > 0) + ':' + Math.floor(Date.now() / 5000);
    if (actCache.k !== k) {
      // A pick made while a later file is still loading may be the fallback; don't keep it.
      alEarly = false; const o = omenFor(d);
      if (alEarly) return o;
      actCache = { k, o };
    }
    return actCache.o;
  }
  // A Dare is live only on the day it was taken, never while away.
  function dareOn() {
    if (awayDay !== null) return false;
    const o = activeOmen(), d = S.almanac.dare;
    return !!(o && o.dare && d.on && d.day === today());
  }
  function modVal(key) {
    const o = activeOmen(); if (!o) return 1;
    if (dareOn() && o.dare.mod && key in o.dare.mod) return o.dare.mod[key];
    if (o.mod && key in o.mod && (!o.when || o.when())) return o.mod[key];
    return 1;
  }
  function bonusVal(key) {
    const o = activeOmen(); if (!o) return 0;
    let v = o.bonus && key in o.bonus ? o.bonus[key] : 0;
    if (dareOn() && o.dare.bonus && key in o.dare.bonus) v += o.dare.bonus[key];
    return v;
  }
  const MOD_KEYS = new Set(), BONUS_KEYS = new Set();
  for (const o of OMENS) {
    for (const k in o.mod || {}) MOD_KEYS.add(k);
    for (const k in o.bonus || {}) BONUS_KEYS.add(k);
    if (o.dare) { for (const k in o.dare.mod || {}) MOD_KEYS.add(k); for (const k in o.dare.bonus || {}) BONUS_KEYS.add(k); }
  }
  for (const k of MOD_KEYS) addModifier(k, () => modVal(k));
  for (const k of BONUS_KEYS) addBonus(k, () => bonusVal(k));

  // ---------------- save state ----------------
  // auto: the last week's goals claimed for you, shown once { week, n, txt }.
  registerState('almanac', {
    v: 1,
    dare: { day: -1, on: false },
    week: -1,
    goals: [],
    swaps: 2,
    stamps: 0, full: 0,
    seen: {},
    auto: null
  });
  const A = () => S.almanac;

  // ---------------- Dares ----------------
  function setDare(on) {
    const o = activeOmen();
    if (!o || !o.dare || awayDay !== null) return false;
    A().dare = { day: today(), on: !!on };
    actCache.k = '';
    toast(on ? `You took the Dare: ${o.dare.n}. Drop it any time.` : `You dropped the Dare. ${o.n} still helps you today.`, on ? 'raid' : 'good', { ic: o.ic }, 'low');
    save();
    return true;
  }

  // ---------------- "best today" hint ----------------
  const topTier = kind => { const sk = S.skills[skillOf(kind)]; const lv = sk ? sk.lv : 1; let t = 1; for (let i = 0; i < NODE_REQ.length; i++) if (lv >= NODE_REQ[i]) t = i + 1; return t; };
  const bestWraith = () => { for (let z = S.maxZone; z >= 1; z--) if (zoneType(z) === 6) return z; return 0; };
  function hintFor(o) {
    const g = o && o.go;
    if (!g) return { txt: o && o.id === 'longNight' ? 'Best today: rest easy. Get ready before you go.' : 'Best today: rest easy.', go: null };
    if (g.gather) {
      let kind = g.gather;
      if (kind === 'any') kind = S.activity === 'gather' ? S.node.kind : S.skills.mine.lv <= S.skills.wood.lv ? 'ore' : 'wood';
      if (kind === 'low') kind = S.skills.mine.lv <= S.skills.wood.lv ? 'ore' : 'wood';
      if (!NODE_NAMES[kind] || !S.skills[skillOf(kind)]) return { txt: 'Best today: gathering.', go: { tab: 'gat' } };
      const t = topTier(kind), where = NODE_NAMES[kind][t - 1];
      const what = kind === 'ore' ? 'Ore' : kind === 'wood' ? 'Wood' : kind[0].toUpperCase() + kind.slice(1);
      return { txt: `Best today: ${what}. Your best spot is the ${where}.`, go: { gather: kind, t } };
    }
    if (g.fight === 'wraith') {
      const z = bestWraith();
      return z ? { txt: `Best today: Wraithmarsh. Your best is ${zoneName(z)} (zone ${z}).`, go: { zone: z } } : { txt: 'Best today: fighting.', go: { zone: S.maxZone } };
    }
    if (g.fight === 'boss') return { txt: 'Best today: zone bosses. Beaten bosses can be fought again.', go: { zone: S.maxZone, tab: 'adv' } };
    if (g.fight === 'here') return { txt: 'Best today: fighting in any zone you like.', go: { zone: S.zone } };
    if (g.fight) return { txt: `Best today: fighting at your frontier, ${zoneName(S.maxZone)}.`, go: { zone: S.maxZone } };
    // reforge and salvage live on Hero, Gear (#195); with the Hero tab shut, fall back to the Forge
    if (g.gear && typeof isUnlocked === 'function' && isUnlocked('party')) return { txt: g.gear === 'reforge' ? "Best today: reforge your gear. It's on the Hero tab, under Gear." : "Best today: salvage old gear. It's on the Hero tab, under Gear.", go: { tab: 'party', view: 'gear' } };
    if (g.tab === 'forge') return { txt: 'Best today: the Forge.', go: { tab: 'forge' } };
    if (g.tab === 'adv') return { txt: 'Best today: bounties on the Fight tab.', go: { tab: 'adv' } };
    if (o.id === 'wyrmStirs') return { txt: 'Best today: the world raid.', go: { tab: 'world' } };
    return { txt: 'Best today: the Camp tab.', go: { tab: 'world' } };
  }
  // Sets the party up for the hint. Returns the tab the UI should open.
  function goFor(o) {
    const h = hintFor(o), g = h.go; if (!g) return null;
    if (g.gather) { setNode(g.gather, g.t); setActivity('gather'); return 'gat'; }
    if (g.zone) { if (S.activity !== 'fight') setActivity('fight'); if (S.zone !== g.zone) setZone(g.zone); return 'adv'; }
    return g.tab || null;
  }

  // ---------------- the weekly board ----------------
  // kind: counter the goal listens to. scale: kill and gather goals grow with maxZone.
  WEEKLY_GOALS = {
    wBoss: { tier: 'easy', kind: 'boss', need: 5, txt: n => `Beat ${n} zone bosses`, ic: ['banner', '#E0524F'] },
    wBty: { tier: 'easy', kind: 'bty', need: 6, txt: n => `Claim ${n} bounties`, ic: ['banner', '#F2C14E'] },
    wGath: { tier: 'easy', kind: 'gath', need: 300, scale: true, txt: n => `Gather ${num(n)} ore or logs at your top tier or one below`, ic: ['pick', '#D08A4E'] },
    wCraft: { tier: 'easy', kind: 'craft', need: 5, txt: n => `Forge ${n} items`, ic: ['anvil', '#8A8FA0'] },
    wFloor: { tier: 'easy', kind: 'floor', need: 30, needs: 'Deepwell', txt: n => `Clear ${n} Deepwell floors`, ic: ['orb', '#3F8FA8'] },
    wCrit: { tier: 'easy', kind: 'crit', need: 300, scale: true, txt: n => `Land ${num(n)} critical hits`, ic: ['flame', '#FF9E3D', { 5: '#FFB347', 7: '#FFF3C4' }] },
    wChamp: { tier: 'easy', kind: 'champ', need: 3, needs: 'K5', txt: n => `Defeat ${n} champions`, ic: ['banner', '#F2C14E'] },
    wBuild: { tier: 'easy', kind: 'build', need: 1, needs: 'Camp', txt: () => 'Finish a building level', ic: ['anvil', '#D08A4E'] },
    wTrial: { tier: 'easy', kind: 'trial', need: 1, needs: 'Deepwell', txt: () => "Reach floor 15 in this week's Trial", ic: ['orb', '#3F8FA8'] },
    wKill: { tier: 'easy', kind: 'kill', need: 1000, scale: true, txt: n => `Defeat ${num(n)} foes`, ic: ['sword', '#C9C3D6'] },
    wTrans: { tier: 'easy', kind: 'trans', need: 5, needs: 'K6', txt: n => `Transmute ${n} times`, ic: ['orb', '#B58CFF'] },
    wBoss2: { tier: 'steady', kind: 'boss', need: 25, txt: n => `Beat ${n} zone bosses`, ic: ['banner', '#E0524F'] },
    wParry: { tier: 'easy', kind: 'parry', need: 15, txt: n => `Land ${n} parries`, ic: ['sword', '#DCE4F0'] },
    wCast: { tier: 'easy', kind: 'cast', need: 25, txt: n => `Cast ${n} abilities by hand`, ic: ['flame', '#FF9E3D', { 5: '#FFB347', 7: '#FFF3C4' }] },
    wCounter: { tier: 'steady', kind: 'counter', need: 20, txt: n => `Land ${n} counters`, ic: ['sword', '#FF9E3D'] },
    wUp: { tier: 'steady', kind: 'up', need: 10, txt: n => `Upgrade gear ${n} times`, ic: ['anvil', '#FF9E3D'] },
    wDeep: { tier: 'steady', kind: 'deep', need: 1, needs: 'Deepwell', txt: () => 'Reach floor 25 in one Deepwell run', ic: ['orb', '#3F8FA8'] },
    wStar: { tier: 'steady', kind: 'star', need: 2, ok: () => masteryApi.totalStars() < S.maxZone * 5, txt: n => `Earn ${n} zone mastery stars`, ic: ['banner', '#F2C14E'] },
    wRef: { tier: 'steady', kind: 'ref', need: 3, needs: 'K6', txt: n => `Reforge ${n} item lines`, ic: ['anvil', '#B58CFF'] },
    wGath2: { tier: 'steady', kind: 'gath', need: 2000, scale: true, txt: n => `Gather ${num(n)} ore or logs at your top tier or one below`, ic: ['pick', '#D08A4E'] },
    wBty2: { tier: 'steady', kind: 'bty', need: 15, txt: n => `Claim ${n} bounties`, ic: ['banner', '#F2C14E'] },
    wRare: { tier: 'steady', kind: 'rare', need: 3, txt: n => `Forge ${n} Rare or better items`, ic: ['anvil', '#5FA8FF'] },
    wElder: { tier: 'steady', kind: 'elder', need: 1, needs: 'Deepwell', txt: () => 'Clear 2 boss floors in one Deepwell run', ic: ['orb', '#E0524F'] }
  };
  const TIER_COUNT = { easy: 3, steady: 2 };
  const goalOk = k => { const d = WEEKLY_GOALS[k]; return !!d && needsMet(d) && (!d.ok || !!d.ok()); };
  const num = n => n < 1e5 ? Math.floor(n).toLocaleString('en-US') : fmt(n);
  const rnd5 = n => Math.max(5, Math.round(n / 5) * 5);
  const needFor = k => { const d = WEEKLY_GOALS[k]; return d.scale ? rnd5(d.need * (1 + Math.floor(S.maxZone / 10) * 0.25)) : d.need; };
  const newGoal = (k, tier) => ({ k, tier, need: needFor(k), have: 0, done: false, claimed: false });

  function pickGoal(r, tier, usedKinds, exclude) {
    const pool = Object.keys(WEEKLY_GOALS).filter(k => WEEKLY_GOALS[k].tier === tier && !usedKinds.has(WEEKLY_GOALS[k].kind) && !(exclude && exclude.has(k)) && goalOk(k));
    return pool.length ? pool[Math.floor(r() * pool.length)] : null;
  }
  // 3 Easy + 2 Steady, seeded by the week, never two of the same kind.
  function drawBoard(week) {
    const r = rng(week * 104729 + 7), used = new Set(), out = [];
    for (const tier of ['easy', 'steady']) for (let i = 0; i < TIER_COUNT[tier]; i++) {
      const k = pickGoal(r, tier, used); if (!k) break;
      used.add(WEEKLY_GOALS[k].kind); out.push(newGoal(k, tier));
    }
    return out;
  }
  function swapGoal(i) {
    ensureWeek();
    const a = A(), g = a.goals[i];
    if (!g || g.done || a.swaps <= 0) return false;
    const used = new Set(a.goals.filter((x, j) => j !== i).map(x => WEEKLY_GOALS[x.k].kind));
    const r = rng(a.week * 104729 + 1000 + (2 - a.swaps) * 31 + i);
    const k = pickGoal(r, g.tier, used, new Set([g.k])); if (!k) return false;
    a.goals[i] = newGoal(k, g.tier); a.swaps--;
    save();
    return true;
  }

  // ---------------- rewards ----------------
  // Crates pay the gathered families at your top tier: 3 portions, the family you have least of
  // first. Until the Deepwell exists, a goal's Depth Marks become 50% more crate (spec 3.2).
  // Until K5/B7 exist, a Steady goal's Trophy and Renown become 10 Essence at your zone tier.
  const CRATE_BASE = { small: 40, large: 100 };
  const crateFams = () => ['ore', 'wood'].concat(AL_NEEDS.K5() ? ['crystal', 'herb', 'fibre'] : []).filter(k => S.mats[k] && NODE_NAMES[k]);
  function crate(size) {
    const per = Math.round(CRATE_BASE[size] * (AL_NEEDS.Deepwell() ? 1 : 1.5));
    const fams = crateFams().map(k => ({ k, t: topTier(k) })).sort((a, b) => (S.mats[a.k][a.t - 1] || 0) - (S.mats[b.k][b.t - 1] || 0));
    const out = [];
    for (let i = 0; i < 3 && fams.length; i++) {
      const f = fams[i % fams.length], e = out.find(x => x.k === f.k);
      if (e) e.n += per; else out.push({ k: f.k, t: f.t, n: per });
    }
    return out;
  }
  // Reward preview/payload for a goal tier: { mats: [{k, t, n}], marks }.
  function rewardFor(tier) {
    const mats = crate(tier === 'steady' ? 'large' : 'small');
    if (tier === 'steady') mats.push({ k: 'ess', t: zoneTier(S.maxZone), n: 10 });
    return { mats, marks: AL_NEEDS.Deepwell() ? (tier === 'steady' ? 40 : 20) : 0 };
  }
  const rewardText = rw => rw.mats.map(m => `${fmt(m.n)} ${matName(m.k, m.t)}`).join(', ') + (rw.marks ? `, ${rw.marks} Depth Marks` : '');
  // H3: a claim waits until the reward fits; the week-end auto-claim is a gift (it cannot wait).
  const rwLines = rw => rw.mats.map(m => [m.k, m.t, m.n]);
  function pay(rw, gift) {
    for (const m of rw.mats) stashAdd(m.k, m.t, m.n, gift ? 'gift' : 'parcel');
    if (rw.marks && S.deep) S.deep.marks = (S.deep.marks || 0) + rw.marks;
  }
  // Claims goal i. quiet: the week-end auto-claim (no toast). Returns the reward text or null.
  function claimGoal(i, quiet) {
    const a = A(), g = a.goals[i];
    if (!g || !g.done || g.claimed) return null;
    const rw = rewardFor(g.tier);
    if (!quiet && !stashFits(rwLines(rw))) { toast(stashNeed(rwLines(rw)), 'raid', null, 'normal'); return null; }
    pay(rw, quiet); g.claimed = true;
    let txt = rewardText(rw);
    const n = a.goals.filter(x => x.claimed).length;
    if (n === 3) { a.stamps++; txt += '. Almanac Stamp earned'; }
    if (n === 5 && a.goals.length === 5) { const b = crate('small'); pay({ mats: b }, true); a.full++; txt += `. Full board bonus: ${rewardText({ mats: b })}`; }
    if (!quiet) { toast(`Weekly goal claimed: ${txt}.`, 'loot', rw.mats[0] ? { mat: [rw.mats[0].k, rw.mats[0].t] } : null, 'normal'); save(); }
    emit('weeklyClaim', { k: g.k, quiet: !!quiet });
    return txt;
  }

  // New week: claim finished goals of the old week for the player, then draw a fresh board.
  function ensureWeek() {
    const a = A(), wk = deviceWeek(Date.now());
    if (a.goals.some(g => !WEEKLY_GOALS[g.k])) { a.goals = []; a.week = -1; }   // a goal from a removed system (W3-A): draw a fresh board
    if (a.week === wk) return false;
    if (a.week !== -1 && a.goals.length) {
      const got = [];
      a.goals.forEach((g, i) => { if (g.done && !g.claimed) { const t = claimGoal(i, true); if (t) got.push(t); } });
      if (got.length) a.auto = { week: a.week, n: got.length, txt: got.join('; ') };
    }
    a.week = wk; a.goals = drawBoard(wk); a.swaps = 2;
    return true;
  }

  // ---------------- counting (live play only) ----------------
  let inAway = false;
  function count(kind, n = 1) {
    if (inAway || !(n > 0)) return;
    for (const g of A().goals) {
      if (g.done || !WEEKLY_GOALS[g.k] || WEEKLY_GOALS[g.k].kind !== kind) continue;
      g.have = Math.min(g.need, g.have + n);
      if (g.have >= g.need) {
        g.done = true;
        toast(`Weekly goal done: ${WEEKLY_GOALS[g.k].txt(g.need)}. Claim it in the Almanac.`, 'good', { ic: WEEKLY_GOALS[g.k].ic });
        emit('weeklyDone', { k: g.k });
      }
    }
  }
  on('kill', ({ mob: m }) => { count('kill'); if (m && m.boss) count('boss'); });
  on('crit', () => count('crit'));
  on('harvest', ({ kind, t, n }) => { if (t >= topTier(kind) - 1) count('gath', n); });
  on('itemAdded', ({ item }) => { if (item && !item.u) { count('craft'); if (item.r === 'rare' || item.r === 'epic' || item.r === 'legendary') count('rare'); } });
  on('bountyDone', () => count('bty'));
  // W1-C: the solo hero's goals
  on('soloParry', p => { if (p && p.res === 'parry') count('parry'); });
  on('soloCounter', () => count('counter'));
  on('ability', p => { if (p && p.cls === 'solo' && !p.auto) count('cast'); });
  // Events named by the later specs; they count as soon as those systems emit them.
  on('campBuilt', () => count('build'));
  on('deepFloor', () => count('floor'));
  // Gear upgrades and mastery stars have no event: count the growth of their totals.
  const plusSum = () => S.items.reduce((a, it) => a + (it.plus || 0), 0);
  let lastPlus = null, lastStars = null;

  on('awayBegin', r => {
    inAway = true; lineOnce(); awayDay = deviceDay(S.last); actCache.k = '';
    const o = activeOmen();
    r.omen = o ? o.id : null;
    r.omenHelped = !!o && awayKeys().some(k => modVal(k) !== 1);
  });
  on('awayEnd', () => { inAway = false; awayDay = null; actCache.k = ''; lastPlus = null; lastStars = null; });
  // Modifier keys that touch away gains for the current activity.
  function awayKeys() {
    if (S.activity === 'gather') return ['offline', 'gatherSpeed', 'yield:' + S.node.kind, 'skillXp:' + skillOf(S.node.kind)];
    if (S.activity === 'raid') return ['offline', 'raid', 'crit'];
    return ['offline', 'gold', 'xp', 'essence', 'crit'];
  }

  let lastDay = null, acc = 5, registered = false;
  onTick(dt => {
    acc += dt;
    if (acc < 1) return;
    acc = 0;
    if (!registered) { registered = true; lateRegister(); }
    const d = today();
    if (d !== lastDay) {
      lastDay = d; actCache.k = '';
      const o = omenFor(d);
      if (!(o.id in A().seen)) A().seen[o.id] = d;
      emit('omen', { id: o.id, day: d });
    }
    ensureWeek();
    const p = plusSum(); if (lastPlus !== null && p > lastPlus) count('up', p - lastPlus); lastPlus = p;
    const st = masteryApi.totalStars(); if (lastStars !== null && st > lastStars) count('star', st - lastStars); lastStars = st;
  });

  // Registered after every file has loaded: the away line comes last on the card, and Next Up
  // (registerGoal, built in parallel) may be a const declared in a later file.
  // The away line registers on the first away report or the first tick, whichever comes first
  // (boot runs awayGains before any tick), so it sits after lines registered at load.
  let lineDone = false;
  function lineOnce() { if (!lineDone) { lineDone = true; registerAwayLine(awayLine); } }
  function lateRegister() {
    lineOnce();
    let rg = null;
    try { rg = typeof registerGoal === 'function' ? registerGoal : null; } catch (e) { rg = null; }
    if (!rg) return;
    for (let i = 0; i < 5; i++) {
      try {
        rg({
          id: 'almanac-week-' + i, sys: 'almanac',
          get label() { const g = A().goals[i]; return g && WEEKLY_GOALS[g.k] ? WEEKLY_GOALS[g.k].txt(g.need) + ` (${num(g.have)}/${num(g.need)})` : ''; },
          pct() { const g = A().goals[i]; return !g || !WEEKLY_GOALS[g.k] || g.claimed ? 0 : Math.min(1, g.have / g.need); },
          done() { const g = A().goals[i]; return !g || !WEEKLY_GOALS[g.k] || g.claimed; },
          go() { return { tab: 'world', view: 'almanac' }; }
        });
      } catch (e) { console.error('[lanternfall] registerGoal failed', e); }
    }
  }

  function awayLine(r) {
    const gains = r.kills || r.gold >= 1 || r.xp >= 1 || (r.mats && r.mats.length) || r.raidDmg >= 1 || (r.skills && r.skills.length) || (r.items && r.items.length);
    if (!gains) return null;
    const out = [], t = omenFor(today()), was = r.omen && OMEN_BY[r.omen];
    if (was && r.omenHelped) out.push({ icon: { ic: was.ic }, txt: `${was.n} helped while you were away. ${was.fx}.`, sub: 'The Omen of the day you left covers your whole time away.' });
    out.push({ icon: { ic: t.ic }, txt: `Today: ${t.n}. ${t.fx}.`, sub: t.dare ? `You can take the Dare in the Almanac: ${t.dare.n}.` : 'See the Almanac on the Camp tab.' });
    return out;
  }

  // ---------------- API ----------------
  const daysLeftInWeek = () => 7 - pmod(today() + 3, 7);
  Object.assign(almanac, {
    omenFor, scheduled, today: () => omenFor(today()), tomorrow: () => omenFor(today() + 1), active: activeOmen,
    usable, byId: id => OMEN_BY[id] || null, catName: c => CAT_NAME[c] || c, fallback: FALLBACK.slice(), lowerBetter: LOWER_BETTER,
    dareOn, setDare, hint: hintFor, go: goFor,
    ensureWeek, drawBoard, swap: swapGoal, claim: claimGoal, count, reward: g => rewardFor(g.tier), rewardText,
    goalText: g => WEEKLY_GOALS[g.k].txt(g.need), goalIcon: g => WEEKLY_GOALS[g.k].ic, goalOk,
    readyCount: () => A().goals.filter(g => g.done && !g.claimed).length,
    doneCount: () => A().goals.filter(g => g.done).length,
    daysLeft: daysLeftInWeek, num,
    seenCount: () => Object.keys(A().seen).length,
    clearAuto: () => { A().auto = null; save(); },
    // tools only: force an Omen id ('none' = no Omen), undefined to restore the calendar
    force: id => { forced = id; actCache.k = ''; },
    needs: AL_NEEDS
  });
}
