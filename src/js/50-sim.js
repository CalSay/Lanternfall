// 50-sim: the game loop's rules in motion: activity switching, combat, gathering,
// kills, harvests, level-ups, boss attempts, taps and away gains.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Visual feedback goes out on the event bus (float, burst, shake, lunge, ...).

// ================= activity =================
function setActivity(a) {
  if (a === 'raid' && !(online.ready && online.canWrite)) { emit('raidUnavailable'); return; }
  if (S.activity === a) return;
  S.activity = a; fightBoss = false; emit('sceneReset');
  if (a === 'fight') spawn();
  if (a === 'gather') S.gProg = 0;
  const msg = { fight: `You return to ${zoneName(S.zone)}.`, gather: `You head to the ${NODE_NAMES[S.node.kind][S.node.t - 1]}.`, raid: 'You march to the raid. Zone gold pauses while you fight the world boss.' }[a];
  emit('toast', { key: 'move', msg, kind: a === 'raid' ? 'raid' : 'good', prio: a === 'raid' ? 'normal' : 'low' });   // W1-B: the pill shows it (23n-data-notices)
  emit('activity', { activity: a });
}
// Move to another cleared zone (the UI's arrows). Caller refreshes the UI.
function setZone(z) {
  S.zone = z; S.kills = 0; fightBoss = false; emit('sceneReset'); spawn();   // a zone starts at fight 1 of ZONE_FIGHTS
}
// Pick the gathering node. Returns false if the skill level is too low. Does not
// switch activity; call setActivity('gather') for that.
function setNode(kind, t) {
  if (!craftNodeVisible(kind, t) || !skillTierOpen(skillOf(kind), t)) return false;
  S.node = { kind, t }; S.gProg = 0; emit('sceneReset');
  return true;
}

// ================= combat state =================
let mob = null, respawn = 0, heroTimer = 0, fightBoss = false, failDps = 0;
let autoChk = 0, autoWait = 0, autoZone = 0;   // auto-challenge: seconds to the next check; seconds boss-ready at autoZone
// Deepwell arena (57d-deepwell.js): while set it supplies the foes. { spawn() -> mob | null,
// onKill(mob, overkill) }. Its kills pay nothing here (no 'kill' event) and it has no boss timer.
let arena = null;

function spawn() {
  if (arena) { const m = arena.spawn(); if (m) { mob = m; if (partyCombatOn()) cbArena(m); } return; }
  if (!fightBoss && S.activity === 'fight' && bossReady()) fightBoss = true;   // the zone's fights are won: its boss comes next (again after a loss)
  // Party combat (59-combat.js): a pack of foes; mob is the one the stage shows.
  if (partyCombatOn()) { cbSpawn(fightBoss); return; }   // owner (2026-10-01): no boss timer and no Enrage: a boss fight ends when one side falls
  const z = S.zone, cyc = zoneCycle(z);
  const boss = fightBoss;
  const ti = boss || (typeof ZONE_FOES === 'object' && ZONE_FOES[z]) || Math.random() < 0.72 ? zoneType(z) : zoneNextType(z);   // a zone monster's zone sends only it
  const t = TYPES[ti];
  const hp = mobHp(z) * (boss ? bossHpMult(z) * mod('bossHp') : (0.9 + Math.random() * 0.2)) * mod('foeHp');
  mob = {
    key: t.key + cyc, type: t.key, rows: SPR[t.key], pal: shiftPal(t.pal, zoneHue(z)), boss, hp, max: hp,
    name: (boss ? 'Elder ' : '') + t.name, gold: mobGold(z) * (boss ? 6 : 1), xp: Math.ceil(1.5 * z) * (boss ? 5 : 1),
    hit: 0, dead: 0, born: 0
  };
  emit('spawn', { mob, zone: z }); // listeners may change the new foe (55-gathering: champions)
}

// Visual feedback. x/y are stage fractions (0..1); omitted x/y use render defaults.
const addFloat = (txt, color, big, x, y, crit) => emit('float', { txt, color, big, x, y, crit: !!crit });   // crit: the crit number's own look (62-stage)
const burst = (x, y, color, n, spd) => emit('burst', { x, y, color, n, spd });

// at: optional {x, y} stage position for the damage number (taps); label overrides its text.
// strikeSrc: 'hero' while heroSwing strikes, else 'party' (59-combat credits threat and damage by it).
// strikeCrit: true while heroSwing strikes a crit (the float carries it: the crit number's look, SOLO2).
let strikeSrc = 'party', strikeCrit = false;
function strike(amount, color, big, at, label) {
  const tg = target();
  if (tg === 'world') { addRaidDmg(amount); addFloat(label || fmt(amount), color, big, at ? at.x : 0.72 + (Math.random() - 0.5) * 0.14, at ? at.y : 0.38, strikeCrit); emit('wyrmHit'); burst(0.7, 0.5, big ? '#FFD27A' : '#FFFFFF', big ? 8 : 3, 0.5); return; }
  if (tg !== 'mob' || !mob || mob.dead) { if (tg === 'mob' && partyCombatOn()) cbStrike(amount, strikeSrc, at, label, color, big); return; }
  if (partyCombatOn()) { cbStrike(amount, strikeSrc, at, label, color, big); return; }
  mob.hp -= amount; mob.hit = 0.08;
  addFloat(label || fmt(amount), color, big, at ? at.x : undefined, at ? at.y : undefined, strikeCrit);
  burst(0.66, 0.6, big ? '#FFD27A' : '#FFFFFF', big ? 8 : 3, 0.5);
  if (mob.hp <= 0) kill();
}
function heroSwing(base, tap, at) {
  const hawk = typeof hawkCrit === 'function' && hawkCrit();   // Hawk Eye (Constellations): a foe's first hit crits
  const crit = Math.random() < critChance() || hawk;
  const dmg = base * (crit ? critMult() : mod('nonCrit')) * (tap ? tapMult() : 1) * (target() === 'world' ? raidMult() : 1);
  strikeSrc = 'hero'; strikeCrit = crit;
  strike(dmg, crit ? '#FF9E3D' : '#FFFFFF', crit, at, at && crit ? 'CRIT ' + fmt(dmg) : null);
  strikeCrit = false;
  if (crit) { emit('crit', { tap: !!tap }); emit('shake', 0.16); if (gear().echo) strike(dmg * gear().echo, '#FFD27A', false); }
  strikeSrc = 'party';
  return { crit, dmg };
}
// A player tap on the stage. at = {x, y} stage fractions for the damage number.
// Routed through the hero's class (55-party.js); gather taps still call tapNode().
function playerTap(at) {
  classTap({ target: target(), at });
}
function tapNode() {
  S.gProg += 0.12; emit('nodeHit'); burst(0.66, 0.62, nodeColor(), 4, 0.7);
  if (S.gProg >= 1) { S.gProg -= 1; harvest(); }
}

function kill() {
  if (arena && (mob.deep || mob.trial)) { const over = -mob.hp; mob.hp = 0; mob.dead = 0.001; respawn = 0.45; arena.onKill(mob, over); return; }
  mob.hp = 0; mob.dead = 0.001;
  const g = mob.gold;
  S.gold += g; S.totalGold += g; S.totalKills++; econEarn('fight', g);
  addFloat('+' + fmt(g) + 'g', '#F2C14E', false, 0.68, 0.3);
  burst(0.68, 0.62, mob.pal[1] || mob.pal[5] || mob.pal[3], 14);
  killPack(mob, g);
}
// The rewards of a kill after its gold: XP, essence, the boss and zone clear, 'kill'. Party combat
// (59-combat.js) calls it once per pack with the lead foe and the pack's gold (paid per foe).
function killPack(m, g) {
  const z = S.zone, tier = zoneTier(z);
  gainXp(m.xp);
  let ess = m.boss ? 3 : 0;
  const ch = essChance(); ess += Math.floor(ch) + (Math.random() < ch % 1 ? 1 : 0);
  if (Math.random() < gear().essExtra) ess++;
  if (ess) { const got = stashAdd('ess', tier, ess, 'flow', true); addFloat(got ? `+${got} ${MAT.ess.short[tier - 1]} Essence` : 'Full', MAT.ess.col[tier - 1], false, 0.68, 0.2); }   // H3: capped by the Storehouse
  if (m.boss) {
    const first = z === S.maxZone;
    fightBoss = false; failDps = 0;
    emit('shake', 0.3);
    const uq = zoneUnique(z), owned = (S.found[uq] || 0) >= tier ? UNIQ_TUNE.owned : 1;
    if (Math.random() < (first ? UNIQ_TUNE.first : UNIQ_TUNE.again) * owned * mod('uniqueChance')) dropUnique(uq, tier);
    // a won zone moves you on, the first time and on every replay (owner, 2026-10-01)
    if (first) S.maxZone++;
    S.zone = z + 1; S.kills = 0; emit('sceneReset');
    toast(first ? (zoneName(z) === zoneName(z + 1) ? `Zone ${z} is cleared. On to Zone ${z + 1}.` : `${zoneName(z)} is cleared. ${zoneName(z + 1)} lies ahead.`) : `Zone ${z} won. On to Zone ${z + 1}.`, 'good', null, first ? 'high' : 'normal');
    if (first) emit('zoneClear', { zone: z });
  } else {
    S.kills = Math.min(ZONE_FIGHTS, S.kills + 1);
  }
  emit('kill', { mob: m, zone: z, gold: g, ess, tier });
  respawn = Math.max(0.45, typeof zoneFoeDeathS === 'function' ? zoneFoeDeathS(m) : 0);   // a pack foe's death animation plays out first
}

// quiet: no float or toast (away gains; the away card reports the levels).
function gainXp(n, quiet) {
  S.xp += n * mod('xp');
  while (S.xp >= xpNeed()) {
    S.xp -= xpNeed(); S.L++; emit('levelup', { L: S.L, quiet: !!quiet });
    if (quiet) continue;
    addFloat('LEVEL UP', '#6FCB6A', true, 0.27, 0.3);
    emit('toast', { key: 'level', msg: `Level ${S.L}. Your hero hits ${Math.round(PACE.heroLv * 100)}% harder.`, kind: 'good', prio: 'high', L: S.L });   // W1-B: every 10th level pops
  }
}
function gainSkill(k, n, quiet) {
  const sk = S.skills[k]; sk.xp += n * mod('skillXp') * mod('skillXp:' + k);
  while (sk.xp >= skillNeed(sk.lv, k)) {
    const top0 = skillTopTier(k);
    sk.xp -= skillNeed(sk.lv, k); sk.lv++;
    emit('skillUp', { k, lv: sk.lv, quiet: !!quiet });
    if (quiet) continue;
    const stn = Object.values(CRAFT_STATIONS).find(x => x.skill === k);
    const t = skillTopTier(k) > top0 ? skillTopTier(k) - 1 : -1;   // GP1: a tier the save already had open is no news
    let extra = '';
    if (t > 0) {
      const open = Object.keys(NODE_NAMES).filter(kind => skillOf(kind) === k).map(kind => NODE_NAMES[kind][t]);
      extra = k === 'smith' ? ` You can now forge ${MAT.ore.short[t]} gear.` : stn ? ` You can now make tier ${t + 1} gear at the ${stn.n}.` : open.length ? ` The ${open.join(' and the ')} ${open.length > 1 ? 'are' : 'is'} open to you.` : '';
    }
    const next = skillNextReq(k), tell = !!extra;
    if (!extra && next) extra = ` Next tier at level ${next}.`;
    if (!stn) addFloat(`${SKILL[k]} ${sk.lv}`, '#F2C14E', true, 0.27, 0.3);
    emit('toast', { key: 'skill', msg: `${SKILL[k]} level ${sk.lv}.${extra}`, kind: 'good', prio: tell ? 'normal' : 'low' });   // W1-B: only a new tier is news
  }
}

// Start (or rematch) the zone boss. Returns true if a boss fight began.
function challenge() {
  if (fightBoss || target() !== 'mob') return false;
  if (!bossReady()) return false;
  fightBoss = true; spawn(); respawn = 0;
  return true;
}

// ================= tick =================
function tick(dt) {
  const tg = target();
  // Auto-challenge (the Fight tab's "Fight frontier bosses when ready"), checked once a second in every fight mode.
  // It used to ride the single-foe respawn timer, which pack fights and turn fights never run, so the switch did nothing.
  if (tg === 'mob' && S.auto && !fightBoss && !arena && (autoChk -= dt) <= 0) {
    autoChk = 1;
    if (autoZone !== S.zone) { autoZone = S.zone; autoWait = 0; }
    // ready and stronger than at the last failed try: go when the estimate says it is winnable, or after
    // COMBAT_TUNE.bossWait seconds ready (counted here, so turn fights, which skip the party clock, count too)
    if (bossReady() && totalDps() > failDps * 1.15) { autoWait++; if (autoWait >= COMBAT_TUNE.bossWait || cbBossReady()) { autoWait = 0; challenge(); } }
    else autoWait = 0;
  }
  // C20: supported prototype fights have one combat driver. Unsupported scopes keep the legacy path below.
  if (tg === 'mob' && typeof turnCombatScope === 'function' && turnCombatScope()) {
    // a legacy foe on the stage (a pack, or since packs became one foe: one not made for the prototype) is replaced
    { const live = typeof combatFoes === 'function' ? combatFoes().filter(f => f && !f.dead && f.hp > 0) : []; if (!mob || live.length > 1 || (live.length === 1 && !live[0].turn)) spawn(); }
    turnCombatTick(dt);
    if (mob && mob.dead) mob.dead += dt;
    if (respawn > 0) { respawn -= dt; if (respawn <= 0) spawn(); }
    for (const fn of TICK_HOOKS.slice()) { try { fn(dt); } catch (e) { console.error('[lanternfall] tick hook failed', e); } }
    return;
  }
  if (tg === 'node') {
    const { kind, t } = S.node;
    S.gProg += dt / nodeTime(kind, t);
    if (S.gProg >= 1) { S.gProg = Math.min(S.gProg - 1, 0.9); harvest(); }
    heroTimer -= dt;
    if (heroTimer <= 0) { heroTimer = 0.6; emit('lunge'); }
  } else {
    // Combat (59-combat.js): foes, HP and knock-outs; the hero still swings below.
    const pc = tg === 'mob' && partyCombatOn();
    if (pc) combatTick(dt);
    heroTimer -= dt;
    if (heroTimer <= 0) {
      heroTimer += 1 / aps(); if (heroTimer < 0) heroTimer = 0;
      // SOLO2: no auto swing on the fight while the solo player is active (every hit comes from the buttons)
      if (tg === 'world' || (mob && !mob.dead && (!pc || cbHeroUp()) && !(tg === 'mob' && typeof soloActive === 'function' && soloActive()))) { emit('lunge'); heroSwing(heroAtk(), false); }
    }
    if (mob && mob.dead && !pc) mob.dead += dt;
    if (mob && !pc) mob.born += dt;
    if (respawn > 0) { respawn -= dt; if (respawn <= 0) { if (!arena && S.auto && bossReady() && totalDps() > failDps * 1.15 && cbBossReady()) fightBoss = true; spawn(); } }
    if (!mob) spawn();
    if (mob && mob.hit > 0) mob.hit -= dt;
  }
  for (const fn of TICK_HOOKS.slice()) { try { fn(dt); } catch (e) { console.error('[lanternfall] tick hook failed', e); } }
}

function harvest() {
  const { kind, t } = S.node, g = gear(), [, dk, ek] = nodeTool(kind);
  const dbl = Math.min(60, g[dk]) / 100, ex = ek ? g[ek] : 0;
  let n = nodeUnits(kind) * (1 + (Math.random() < dbl ? 1 : 0) + (Math.random() < ex ? 1 : 0));
  // Yield modifiers (Omens, home ground) round by chance, so +25% means +25% on average.
  const y = n * mod('yield:' + kind), fr = y % 1;
  n = stashAdd(kind, t, Math.max(1, Math.floor(y) + (fr > 1e-9 && Math.random() < fr ? 1 : 0)), 'flow');   // H3: up to the Storehouse cap
  gainSkill(skillOf(kind), nodeXpFor(kind, t));   // skill XP counts when full
  addFloat(n ? `+${n} ${matName(kind, t)}` : 'Full', MAT[kind].col[t - 1], n > 1, 0.68, 0.34);
  burst(0.68, 0.6, MAT[kind].col[t - 1], 12, 0.9);
  emit('harvest', { kind, t, n });
}

// ================= away / offline =================
// Applies offline gains to S and returns the report for the "While you were away" card.
// Events: 'awayBegin' r (snapshot), 'away' r (other systems apply their own offline gains),
// 'awayEnd' r (55-stats.js diffs the state into r and collects registerAwayLine lines).
// r.lines/r.note are the base summary; line icons are specs (see toast()).
function awayGains(secs) {
  secs = Math.max(0, +secs || 0);   // a save stamped in the future (clock set back) gives nothing, never negative gains
  const r = { t: Math.min(secs, (4 + 2 * S.relic.glass + bonus('awayHours')) * 3600), secs, lines: [] };
  failDps = 0;   // BAL3: back from away, auto-challenge may retry a boss it failed (a reload did this; a kept tab walled idle play at the cap)
  emit('awayBegin', r);
  awayBase(r);
  emit('away', r);
  emit('awayEnd', r);
  return r;
}
function awayBase(r) {
  const t = r.t;
  const boost = (1 + gear().offline / 100) * mod('offline');
  if (S.activity === 'gather') {
    const { kind, t: tier } = S.node;
    // Batch until the next skill or tool-mastery level, rounded up to the same
    // whole-second boundary as live play. Gathering speed is constant between them.
    const skill = skillOf(kind), tool = typeof toolOf === 'function' ? toolOf(skill) : null;
    let got = 0;
    for (let elapsed = 0; elapsed < t;) {
      const left = t - elapsed, nt = nodeTime(kind, tier), sk = S.skills[skill];
      const xpRate = nodeXpFor(kind, tier) / nt * boost * mod('skillXp') * mod('skillXp:' + skill);
      const skillSteps = xpRate > 0 ? Math.max(1, Math.ceil((skillNeed(sk.lv, skill) - sk.xp) / xpRate - 1e-9)) : Infinity;
      const mastery = tool && typeof toolMastery === 'function' ? toolMastery(tool) : null;
      const masterySteps = mastery && !mastery.max ? Math.max(1, Math.ceil(mastery.left - 1e-9)) : Infinity;
      const stepSecs = Math.min(left, skillSteps, masterySteps);
      const swings = stepSecs / nt * boost;
      got += swings * nodeYieldAvg(kind) * mod('yield:' + kind);
      gainSkill(skill, swings * nodeXpFor(kind, tier), true);
      if (tool && typeof toolMasteryAdd === 'function') toolMasteryAdd(tool, stepSecs, true);
      elapsed += stepSecs;
    }
    got = Math.floor(got);
    got = storeAwayGather(kind, tier, got, r);   // H3: up to the cap; Spillover moves on (55-store)
    if (got > 0) emit('harvest', { kind, t: tier, n: got, away: true });
    if (got > 0) r.lines.push({ icon: { mat: [kind, tier] }, txt: `+${fmt(got)} ${matName(kind, tier)}` });
    r.note = `You kept working the ${NODE_NAMES[kind][tier - 1]}. ${SKILL[skillOf(kind)]} is now level ${S.skills[skillOf(kind)].lv}.`;
    return r;
  }
  const dps = heroDps() * 0.5 * boost;
  if (S.activity === 'raid') {
    const dmg = dps * raidMult() * t * 0.5;
    S.raid.dmg += dmg;
    r.lines.push({ icon: { ic: ['flame', '#E0524F', { 5: '#FFB347', 7: '#FFF3C4' }] }, txt: `${fmt(dmg)} raid damage` });
    r.note = 'You kept hammering the raid boss.';
    return r;
  }
  // Turn fights are active only (owner, 2026-10-01): nothing fights while you are away. Gathering keeps going.
  if (typeof turnCombatScope === 'function' && turnCombatScope()) {
    r.turnCombat = { kills: 0, zone: S.zone };
    r.note = 'Fights only happen while you play. Set your hero to gather before you go, and they keep working.';
    return r;
  }
  // Kills are capped by the respawn gap, same as live play; away play earns 75% of the live rate.
  // The best zone the hero can farm, at most S.zone (BAL1: a zone it cannot clear earns nothing).
  const baseDps = dps / boost, pc = partyCombatOn();
  // Party combat (C3): the closed-form hold estimate (59-combat.js partyHoldEstimate, spec 4.11) picks
  // the highest zone the hero holds (at most S.zone) and its pack rate; away play earns awayRate of it.
  const est = pc ? partyHoldEstimate(S.zone) : null, z = pc ? est.zone : farmableZone(S.zone, baseDps);
  const kills = pc ? t * est.packsPerSec * COMBAT_TUNE.awayRate * boost : baseDps > 0 ? t / (mobHp(z) / baseDps + 0.45) * 0.75 * boost : 0;
  const gold = kills * mobGold(z) * (pc ? COMBAT_TUNE.packGold : 1), tier = zoneTier(z), ess = stashAdd('ess', tier, Math.floor(kills * essChance()), 'flow', true);
  S.gold += gold; S.totalGold += gold; S.totalKills += Math.floor(kills); econEarn('away', gold);
  // Hero XP while away (constellations.md, M6): PACE.heroAwayXp of the away kills' XP.
  if (kills > 0) gainXp(kills * Math.ceil(1.5 * z) * PACE.heroAwayXp, true);
  r.lines.push({ icon: { ic: ['coin', '#F2C14E'] }, txt: '+' + fmt(gold) });
  if (ess) r.lines.push({ icon: { mat: ['ess', tier] }, txt: `+${fmt(ess)} ${matName('ess', tier)}` });
  emit('awayKills', { kills, zone: z, lines: r.lines });
  r.note = `You held ${zoneName(z)}.`;
  return r;
}
