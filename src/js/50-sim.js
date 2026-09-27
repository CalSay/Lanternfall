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
  const msg = { fight: `Your party returns to ${zoneName(S.zone)}.`, gather: `Your party heads to the ${NODE_NAMES[S.node.kind][S.node.t - 1]}.`, raid: 'Your party marches to the raid. Zone gold pauses while you fight the world boss.' }[a];
  toast(msg, a === 'raid' ? 'raid' : 'good');
  emit('activity', { activity: a });
}
// Move to another cleared zone (the UI's arrows). Caller refreshes the UI.
function setZone(z) {
  S.zone = z; fightBoss = false; emit('sceneReset'); spawn();
}
// Pick the gathering node. Returns false if the skill level is too low. Does not
// switch activity; call setActivity('gather') for that.
function setNode(kind, t) {
  if (S.skills[skillOf(kind)].lv < NODE_REQ[t - 1]) return false;
  S.node = { kind, t }; S.gProg = 0; emit('sceneReset');
  return true;
}

// ================= combat state =================
let mob = null, respawn = 0, heroTimer = 0, fightBoss = false, bossTime = 0, failDps = 0;
let partyAcc = 0, partyTick = 0;

function spawn() {
  const z = S.zone, cyc = zoneCycle(z);
  const boss = fightBoss;
  const ti = boss || Math.random() < 0.72 ? zoneType(z) : (zoneType(z) + 1) % 7;
  const t = TYPES[ti];
  const hp = mobHp(z) * (boss ? 8 : (0.9 + Math.random() * 0.2));
  mob = {
    key: t.key + cyc, rows: SPR[t.key], pal: shiftPal(t.pal, cyc * 70), boss, hp, max: hp,
    name: (boss ? 'Elder ' : '') + t.name, gold: mobGold(z) * (boss ? 6 : 1), xp: Math.ceil(1.5 * z) * (boss ? 5 : 1),
    hit: 0, dead: 0, born: 0
  };
  if (boss) bossTime = 30;
}

// Visual feedback. x/y are stage fractions (0..1); omitted x/y use render defaults.
const addFloat = (txt, color, big, x, y) => emit('float', { txt, color, big, x, y });
const burst = (x, y, color, n, spd) => emit('burst', { x, y, color, n, spd });

// at: optional {x, y} stage position for the damage number (taps); label overrides its text.
function strike(amount, color, big, at, label) {
  const tg = target();
  if (tg === 'world') { addRaidDmg(amount); addFloat(label || fmt(amount), color, big, at ? at.x : 0.72 + (Math.random() - 0.5) * 0.14, at ? at.y : 0.38); emit('wyrmHit'); burst(0.7, 0.5, big ? '#FFD27A' : '#FFFFFF', big ? 8 : 3, 0.5); return; }
  if (tg !== 'mob' || !mob || mob.dead) return;
  mob.hp -= amount; mob.hit = 0.08;
  addFloat(label || fmt(amount), color, big, at ? at.x : undefined, at ? at.y : undefined);
  burst(0.66, 0.6, big ? '#FFD27A' : '#FFFFFF', big ? 8 : 3, 0.5);
  if (mob.hp <= 0) kill();
}
function heroSwing(base, tap, at) {
  const crit = Math.random() < critChance();
  const dmg = base * (crit ? critMult() : 1) * (tap ? tapMult() : 1) * (target() === 'world' ? raidMult() : 1);
  strike(dmg, crit ? '#FF9E3D' : '#FFFFFF', crit, at, at && crit ? 'CRIT ' + fmt(dmg) : null);
  if (crit) { emit('shake', 0.16); if (gear().echo) strike(dmg * gear().echo, '#FFD27A', false); }
  return { crit, dmg };
}
// A player tap on the stage. at = {x, y} stage fractions for the damage number.
function playerTap(at) {
  if (target() === 'node') { tapNode(); return; }
  heroSwing(heroAtk(), true, at);
}
function tapNode() {
  S.gProg += 0.12; emit('nodeHit'); burst(0.66, 0.62, nodeColor(), 4, 0.7);
  if (S.gProg >= 1) { S.gProg -= 1; harvest(); }
}

function kill() {
  mob.hp = 0; mob.dead = 0.001;
  const g = mob.gold, z = S.zone, tier = zoneTier(z);
  S.gold += g; S.totalGold += g; S.totalKills++;
  addFloat('+' + fmt(g) + 'g', '#F2C14E', false, 0.68, 0.3);
  burst(0.68, 0.62, mob.pal[1] || mob.pal[5] || mob.pal[3], 14);
  gainXp(mob.xp);
  let ess = mob.boss ? 3 : 0;
  const ch = essChance(); ess += Math.floor(ch) + (Math.random() < ch % 1 ? 1 : 0);
  if (Math.random() < gear().essExtra) ess++;
  if (ess) { S.mats.ess[tier - 1] += ess; addFloat(`+${ess} ${MAT.ess.short[tier - 1]} Essence`, MAT.ess.col[tier - 1], false, 0.68, 0.2); }
  if (mob.boss) {
    const first = S.zone === S.maxZone;
    fightBoss = false; failDps = 0;
    emit('shake', 0.3);
    if (Math.random() < (first ? 0.35 : 0.12)) dropUnique(ZONE_UNIQ[zoneType(z)], tier);
    if (first) { S.maxZone++; S.zone++; S.kills = 0; emit('sceneReset'); toast(`${zoneName(z)} is cleared. ${zoneName(z + 1)} lies ahead.`, 'good'); emit('zoneClear', { zone: z }); }
  } else if (S.zone === S.maxZone) {
    S.kills = Math.min(10, S.kills + 1);
  }
  emit('kill', { mob, zone: z, gold: g, ess, tier });
  respawn = 0.45;
}

function gainXp(n) {
  S.xp += n * mod('xp');
  while (S.xp >= xpNeed()) {
    S.xp -= xpNeed(); S.L++; emit('levelup', { L: S.L });
    addFloat('LEVEL UP', '#6FCB6A', true, 0.27, 0.3);
    toast(`Level ${S.L}. Your hero hits 5% harder.`, 'good');
  }
}
function gainSkill(k, n, quiet) {
  const sk = S.skills[k]; sk.xp += n * mod('skillXp');
  while (sk.xp >= skillNeed(sk.lv)) {
    sk.xp -= skillNeed(sk.lv); sk.lv++;
    emit('skillUp', { k, lv: sk.lv, quiet: !!quiet });
    if (quiet) continue;
    const req = k === 'smith' ? SMITH_REQ : NODE_REQ, t = req.indexOf(sk.lv);
    let extra = '';
    if (t > 0) extra = k === 'smith' ? ` You can now forge ${MAT.ore.short[t]} gear.` : ` The ${NODE_NAMES[k === 'mine' ? 'ore' : 'wood'][t]} is open to you.`;
    if (k !== 'smith') addFloat(`${SKILL[k]} ${sk.lv}`, '#F2C14E', true, 0.27, 0.3);
    toast(`${SKILL[k]} level ${sk.lv}.${extra}`, 'good');
  }
}

// Start (or rematch) the zone boss. Returns true if a boss fight began.
function challenge() {
  if (fightBoss || target() !== 'mob') return false;
  if (!(S.zone < S.maxZone || bossReady())) return false;
  fightBoss = true; spawn(); respawn = 0;
  return true;
}

// ================= tick =================
function tick(dt) {
  const tg = target();
  if (tg === 'node') {
    const { kind, t } = S.node;
    S.gProg += dt / nodeTime(kind, t);
    if (S.gProg >= 1) { S.gProg = Math.min(S.gProg - 1, 0.9); harvest(); }
    heroTimer -= dt;
    if (heroTimer <= 0) { heroTimer = 0.6; emit('lunge'); }
  } else {
    const pd = compDps() * (tg === 'world' ? raidMult() : 1);
    if (pd > 0) {
      if (tg === 'world') addRaidDmg(pd * dt);
      else if (mob && !mob.dead) { mob.hp -= pd * dt; if (mob.hp <= 0) kill(); }
      partyAcc += pd * dt; partyTick += dt;
      if (partyTick >= 0.6) { addFloat(fmt(partyAcc), '#B58CFF', false, 0.76 + (Math.random() - 0.5) * 0.1, 0.55); partyAcc = 0; partyTick = 0; }
    }
    heroTimer -= dt;
    if (heroTimer <= 0) {
      heroTimer += 1 / aps(); if (heroTimer < 0) heroTimer = 0;
      if (tg === 'world' || (mob && !mob.dead)) { emit('lunge'); heroSwing(heroAtk(), false); }
    }
    if (tg === 'mob' && mob && mob.boss && !mob.dead) {
      bossTime -= dt;
      if (bossTime <= 0) { fightBoss = false; failDps = totalDps(); toast('The zone boss held its ground. Grow stronger and try again.', 'raid'); emit('bossFail', { zone: S.zone, dps: failDps }); spawn(); }
    }
    if (mob && mob.dead) mob.dead += dt;
    if (mob) mob.born += dt;
    if (respawn > 0) { respawn -= dt; if (respawn <= 0) { if (S.auto && bossReady() && totalDps() > failDps * 1.15) fightBoss = true; spawn(); } }
    if (!mob) spawn();
    if (mob.hit > 0) mob.hit -= dt;
  }
  for (const fn of TICK_HOOKS.slice()) { try { fn(dt); } catch (e) { console.error('[lanternfall] tick hook failed', e); } }
}

function harvest() {
  const { kind, t } = S.node, g = gear();
  const dbl = Math.min(60, kind === 'ore' ? g.oreDbl : g.woodDbl) / 100, ex = kind === 'ore' ? g.oreExtra : g.woodExtra;
  const n = 1 + (Math.random() < dbl ? 1 : 0) + (Math.random() < ex ? 1 : 0);
  S.mats[kind][t - 1] += n;
  gainSkill(skillOf(kind), nodeXp(t));
  addFloat(`+${n} ${matName(kind, t)}`, MAT[kind].col[t - 1], n > 1, 0.68, 0.34);
  burst(0.68, 0.6, MAT[kind].col[t - 1], 12, 0.9);
  emit('harvest', { kind, t, n });
}

// ================= away / offline =================
// Applies offline gains to S and returns a summary for the "While you were away" card.
// Line icons are specs (see toast()); the UI turns them into images.
function awayGains(secs) {
  const cap = (4 + 2 * S.relic.glass) * 3600;
  const t = Math.min(secs, cap);
  const boost = (1 + gear().offline / 100) * mod('offline');
  const r = { t, secs, lines: [] };
  if (S.activity === 'gather') {
    const { kind, t: tier } = S.node;
    const swings = t / nodeTime(kind, tier) * boost;
    const got = Math.floor(swings * nodeYieldAvg(kind));
    S.mats[kind][tier - 1] += got;
    gainSkill(skillOf(kind), Math.floor(swings * nodeXp(tier)), true);
    r.lines.push({ icon: { mat: [kind, tier] }, txt: `+${fmt(got)} ${matName(kind, tier)}` });
    r.note = `Your party kept working the ${NODE_NAMES[kind][tier - 1]}. ${SKILL[skillOf(kind)]} is now level ${S.skills[skillOf(kind)].lv}.`;
    return r;
  }
  const dps = (compDps() + heroDps() * 0.5) * boost;
  if (S.activity === 'raid') {
    const dmg = dps * raidMult() * t * 0.5;
    S.raid.dmg += dmg;
    r.lines.push({ icon: { ic: ['flame', '#E0524F', { 5: '#FFB347', 7: '#FFF3C4' }] }, txt: `${fmt(dmg)} raid damage` });
    r.note = 'Your party kept hammering the raid boss.';
    return r;
  }
  const kills = dps * t / mobHp(S.zone);
  const gold = kills * mobGold(S.zone), tier = zoneTier(S.zone), ess = Math.floor(kills * essChance());
  S.gold += gold; S.totalGold += gold; S.totalKills += Math.floor(kills); S.mats.ess[tier - 1] += ess;
  r.lines.push({ icon: { ic: ['coin', '#F2C14E'] }, txt: '+' + fmt(gold) });
  if (ess) r.lines.push({ icon: { mat: ['ess', tier] }, txt: `+${fmt(ess)} ${matName('ess', tier)}` });
  r.note = `Your party kept fighting in ${zoneName(S.zone)}.`;
  return r;
}
