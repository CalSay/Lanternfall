// 55-gathering: gathering for every family, fight drops, home ground, champions, trophies,
// the Glint and offline credits (task K5).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Spec: docs/design/gathering-and-crafting.md 2 and 5, with its "Owner decisions" (hide and
// essence are fight-only). Tables: 21-data-craft.js (K1). Shared-core pieces this builds on:
// nodeTime / nodeYieldAvg / nodeXpFor (40-rules, generic per node kind), harvest and the away
// gather branch (50-sim, generic), the 'spawn' event (50-sim) and S.craft (55-crafting).
//
// Families: Ore and Crystal (Mining: veins, geodes), Wood (Woodcutting), Fibre and Herbs
// (Foraging: patches, beds). C24 adds opt-in Hide Hunting; Essence stays fight-only. Node tiers unlock at
// NODE_REQ for every row. Foraging earns x2 XP while it is below max(Mining, Woodcutting).
//
// Exposed names:
//   GATHER_KINDS                 node kinds in display order: ore, crystal, wood, fibre, herb
//   homeFamily(z = S.zone)       the family whose yield the camp's zone type boosts
//   homeBonus(fam, z = S.zone)   0, 0.25 or 0.5 (3+ mastery stars in that zone); feeds 'yield:<fam>'
//   sigDropChance(type, z)       chance per kill of a monster type's signature drop, with stars
//                                and the 'sigDrop' modifier (Hunter's Moon)
//   awaySigDrops(kills, z)       { fam: expected units } for offline kills (pure; tools use it)
//   champChance(z = S.zone)      chance that a new (non-boss) foe is a champion (0 below fromZone)
//   champsAway(kills, z)         expected champions for offline kills (half the live rate)
//   addTrophy(i, n, source)      credit n Trophies of type i to S.craft.troph; emits 'trophy'
//   glint()                      { on, left } the Glint on the current node (runtime only)
//   tapGlint() -> units | 0      claim the Glint (the 'tap' event on a node calls it)
//   whereToGet(fam, t)           player text: where a material comes from, with home ground
//
// Events: 'spawn' (listened: champions, first-kill flag on bosses), 'kill' (signature drops,
// champion and boss trophies), 'awayKills' (offline drops and champions), 'raidReward'
// (1 random Trophy), 'tap' (Glint). Emits 'trophy' { i, n, source }, 'champion' { mob },
// 'glint' { on }.
// Almanac keys read here: mod sigDrop, champion, champHp, trophy; bonus champTrophy, glintRate.
// Save: none of its own. Trophies go to S.craft.troph and champions to S.craft.champ (K6's state).

const GATHER_KINDS = ['ore', 'crystal', 'wood', 'fibre', 'herb'];
// Public consumers retain the shipped set until the art pack is approved.
const gatherKinds = () => huntingOn() ? GATHER_KINDS.concat('hide') : GATHER_KINDS;
// Save-code imports reload the game. Normalize an unreleased test selection before nav,
// the first frame or boot-away rewards can observe it; preserve earned skill and gear records.
if (S.node && S.node.kind === 'hide' && !craftNodeVisible('hide', S.node.t)) {
  S.activity = 'fight'; S.node = { kind: 'ore', t: 1 }; S.gProg = 0;
}
let homeFamily, homeBonus, sigDropChance, awaySigDrops, champChance, champsAway, addTrophy, glint, tapGlint, whereToGet;

{
  const SRC = CRAFT_TROPHY_SRC, CH = SRC.champ;
  const typeIndex = key => TYPES.findIndex(x => x.key === key);
  const typeOfMob = m => m && (m.type || String(m.key || '').replace(/\d+$/, ''));
  const stars = z => masteryApi.starsFor(masteryApi.zoneKills(z));
  // Whole units from an expected amount: the fraction rounds up by chance.
  const roll = x => { const f = x % 1; return Math.floor(x) + (f > 1e-9 && Math.random() < f ? 1 : 0); };
  const give = (fam, t, n) => n > 0 ? stashAdd(fam, t, n, 'flow', true) : 0;   // H3: fight drops stop at the Storehouse cap

  // ---------------- home ground ----------------
  homeFamily = (z = S.zone) => zoneHome(z);
  homeBonus = (fam, z = S.zone) => !(fam === 'hide' ? huntingOn() && ['bat', 'bones', 'beetle'].includes(TYPES[zoneType(z)].key) : zoneHome(z) === fam) ? 0 : stars(z) >= CRAFT_HOME_BONUS.stars ? CRAFT_HOME_BONUS.starred : CRAFT_HOME_BONUS.base;
  for (const fam of GATHER_KINDS.concat('hide')) addModifier('yield:' + fam, () => 1 + homeBonus(fam));

  // Foraging catch-up: x2 XP while below the best of Mining and Woodcutting.
  addModifier('skillXp:forage', () => S.skills.forage.lv < Math.max(...CRAFT_CATCHUP.forage.map(k => S.skills[k].lv)) ? CRAFT_CATCHUP.mult : 1);

  // ---------------- signature drops ----------------
  sigDropChance = (type, z = S.zone) => {
    const d = CRAFT_SIG_DROPS[type]; if (!d) return 0;
    return d.p * (1 + CRAFT_SIG_RULE.star * stars(z)) * mod('sigDrop');
  };
  // Offline: kills already carry the 75% away factor (CRAFT_SIG_RULE.offline, the same factor as
  // offline kills in awayBase), so each kill credits its expected drop. Packs: 72% zone type, 28% next.
  awaySigDrops = (kills, z = S.zone) => {
    const out = {}, zt = zoneType(z);
    for (const [ti, share] of [[zt, 0.72], [zoneNextType(z), 0.28]]) {
      const type = TYPES[ti].key, d = CRAFT_SIG_DROPS[type]; if (!d) continue;
      out[d.fam] = (out[d.fam] || 0) + kills * share * sigDropChance(type, z);
    }
    return out;
  };

  // ---------------- trophies ----------------
  addTrophy = (i, n, source) => {
    n = Math.floor(n); if (!(n > 0) || !CRAFT_TROPHIES[i]) return 0;
    S.craft.troph[i] = (S.craft.troph[i] || 0) + n;
    emit('trophy', { i, n, source });
    return n;
  };
  const trophyIcon = i => ({ ic: craftIcon('tro_' + TYPES[i].key) });

  // ---------------- champions ----------------
  champChance = (z = S.zone) => z >= CH.fromZone ? mod('champion') / CH.packs : 0;
  champsAway = (kills, z = S.zone) => kills * champChance(z) * CH.offline;

  on('spawn', ({ mob: m, zone }) => {
    if (!m) return;
    if (m.boss) { m.firstKill = zone === S.maxZone; return; }
    if (zone < CH.fromZone || Math.random() >= champChance(zone)) return;
    const k = CH.hp * mod('champHp');
    m.champ = true; m.hp *= k; m.max = m.hp; m.gold *= CH.hp; m.xp = Math.ceil(m.xp * CH.hp);
    m.name = 'Champion ' + m.name;
    const i = typeIndex(typeOfMob(m));
    toast(`A champion ${TYPES[i].name} appears. Beat it for a ${CRAFT_TROPHIES[i].n}.`, 'loot', trophyIcon(i));
    emit('champion', { mob: m });
  });

  on('kill', ({ mob: m, zone, tier }) => {
    if (!m) return;
    const type = typeOfMob(m), i = typeIndex(type), d = CRAFT_SIG_DROPS[type];
    // Signature drop: one unit of the zone tier.
    if (d) {
      const n = give(d.fam, tier, roll(sigDropChance(type, zone)));
      if (n) addFloat(`+${n} ${matName(d.fam, tier)}`, MAT[d.fam].col[tier - 1], false, 0.72, 0.26);
    }
    if (m.champ && i >= 0) {
      S.craft.champ = (S.craft.champ || 0) + 1;
      const got = addTrophy(i, CH.troph + bonus('champTrophy'), 'champion');
      if (d) give(d.fam, tier, CH.sig);
      if (typeof almanac.count === 'function') almanac.count('champ');
      toast(`Champion defeated: +${got} ${CRAFT_TROPHIES[i].n}${d ? ` and ${CH.sig} ${matName(d.fam, tier)}` : ''}.`, 'loot', trophyIcon(i));
    }
    if (m.boss && m.firstKill && zone >= SRC.firstBossFrom) {
      const bi = zonePlace(zone), got = addTrophy(bi, roll(SRC.firstBoss * mod('trophy')), 'boss');
      if (got) toast(`The boss leaves a trophy: +${got} ${CRAFT_TROPHIES[bi].n}.`, 'loot', trophyIcon(bi));
    }
  });

  on('raidReward', () => {
    const i = Math.floor(Math.random() * CRAFT_TROPHIES.length);
    if (addTrophy(i, SRC.raid, 'raid')) toast(`The raid spoils include a ${CRAFT_TROPHIES[i].n}.`, 'loot', trophyIcon(i));
  });

  // ---------------- offline fighting ----------------
  let awayTroph = null, awayChamps = 0, lineOn = false;
  on('awayBegin', () => {
    awayTroph = S.craft.troph.slice(); awayChamps = S.craft.champ || 0;
    if (!lineOn) { lineOn = true; registerAwayLine(trophyLines); } // 55-stats loads after this file
  });
  on('awayKills', ({ kills, zone }) => {
    if (!(kills > 0)) return;
    const tier = zoneTier(zone), zt = zoneType(zone);
    for (const [fam, n] of Object.entries(awaySigDrops(kills, zone))) give(fam, tier, roll(n));
    const champs = roll(champsAway(kills, zone));
    if (champs > 0) {
      S.craft.champ = (S.craft.champ || 0) + champs;
      addTrophy(zonePlace(zone), champs * (CH.troph + bonus('champTrophy')), 'champion');
      const d = CRAFT_SIG_DROPS[TYPES[zt].key];
      if (d) give(d.fam, tier, champs * CH.sig);
    }
  });
  function trophyLines() {
    if (!awayTroph) return null;
    const out = [], champs = (S.craft.champ || 0) - awayChamps;
    S.craft.troph.forEach((n, i) => {
      const got = n - (awayTroph[i] || 0);
      if (got > 0) out.push({ icon: trophyIcon(i), txt: `+${got} ${CRAFT_TROPHIES[i].n}`, sub: champs > 0 ? `${champs} champion${champs > 1 ? 's' : ''} beaten` : 'Trophy' });
    });
    awayTroph = null;
    return out;
  }

  // ---------------- the Glint ----------------
  // Every 15-25s on a node a Glint shows for 3s; a tap on the node while it shows gives +2 units.
  // Runtime only (not saved). Visuals go out on the bus: a float, sparkle bursts, 'glint'.
  const G = { next: 0, left: 0, spark: 0 };
  const nextGlint = () => CRAFT_GLINT.min + Math.random() * (CRAFT_GLINT.max - CRAFT_GLINT.min);
  glint = () => ({ on: G.left > 0, left: Math.max(0, G.left) });
  const endGlint = () => { if (G.left > 0) emit('glint', { on: false }); G.left = 0; G.next = nextGlint(); };
  onTick(dt => {
    if (target() !== 'node') { if (G.left > 0 || !G.next) endGlint(); return; }
    if (G.left > 0) {
      G.left -= dt; G.spark -= dt;
      if (G.spark <= 0) { G.spark = 0.3; burst(0.66, 0.5, '#FFF3C4', 3, 0.35); }
      if (G.left <= 0) endGlint();
      return;
    }
    if (!G.next) G.next = nextGlint();
    G.next -= dt * (1 + bonus('glintRate'));
    if (G.next <= 0 && stashFull(S.node.kind, S.node.t)) G.next = nextGlint();   // H3: no Glint on a full pile
    else if (G.next <= 0) {
      G.left = CRAFT_GLINT.window + bonus('glint:' + skillOf(S.node.kind)); G.spark = 0;   // H2: tool mastery 10
      addFloat('Glint! Tap it', '#FFF3C4', true, 0.66, 0.3);
      emit('glint', { on: true });
    }
  });
  tapGlint = () => {
    if (!(G.left > 0) || target() !== 'node') return 0;
    const { kind, t } = S.node;
    const n = stashAdd(kind, t, Math.max(1, roll(CRAFT_GLINT.units * mod('yield:' + kind))), 'flow');   // H3
    endGlint();
    addFloat(`Glint +${n} ${matName(kind, t)}`, '#FFF3C4', true, 0.68, 0.26);
    burst(0.66, 0.5, '#FFF3C4', 14, 0.9);
    emit('harvest', { kind, t, n, glint: true });
    return n;
  };
  on('tap', ({ node }) => { if (node) tapGlint(); });

  // ---------------- where materials come from ----------------
  const zoneTypesFor = fam => CRAFT_HOME.map((f, i) => f === fam ? ZONES[i] : null).filter(Boolean);
  whereToGet = (fam, t = 1) => {
    const nk = CRAFT_NODES[fam], name = matName(fam, t);
    if (nk && craftNodeVisible(fam, t)) {
      const home = zoneTypesFor(fam), node = NODE_NAMES[fam][t - 1];
      const drop = Object.entries(CRAFT_SIG_DROPS).filter(([, d]) => d.fam === fam).map(([k]) => TYPES[typeIndex(k)].name);
      return `${name}: ${SKILL[nk.skill]} level ${skillReq(nk.skill, t)}, ${node}.` + (home.length ? ` +25% while camped in ${home.join(' or ')}.` : '') + (drop.length ? ` ${drop.join(' and ')} drop a few.` : '');
    }
    const drop = Object.entries(CRAFT_SIG_DROPS).filter(([, d]) => d.fam === fam).sort((a, b) => b[1].p - a[1].p).map(([k]) => TYPES[typeIndex(k)].name + 's');
    const zt = Math.ceil(t) > 1 ? ` Fight in zone ${PACE.essTier[t - 1]} or higher for this tier.` : '';
    return fam === 'ess' ? `${name}: every foe can drop it. Marsh Wraiths drop extra.${zt}` : `${name}: fighting only. ${drop.join(', ')} drop it.${zt}`;
  };
}
