// 55-training: Training (task W2-A, docs/design/solo-hero.md "Training"). Gold levels up each hero's moves:
// Attack, Parry, Dodge and every ability the hero has unlocked. It replaced the gold upgrades Blade, Swiftness and
// Precision in the solo game (the dormant party game keeps them: HERO_UPS, buyHero).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// hero-progression-rework: with HERO_TUNE.training off (attrOn(), 55-attributes) gold Training is switched off: each move acts as
// if trained to the hero's level, capped by the class stage (trainLv); train() buys nothing, trainPlan has no price, trainNext
// has no step. trainInfo still reports the level-derived facts. HERO_TUNE.training = 1 restores everything below, bit for bit.
//
// Rules (knobs: SOLO_TUNE.train in 24b; Attack's curve: PACE.atkPer / atkX / atkEvery in 40-rules; prices: ECON.train):
//   - Levels belong to the hero (S.solo.tr[hero][move]); a new move starts at 0.
//   - Cap: a move never passes the hero's level, nor the class stage's cap (SOLO_TUNE.train.cap: base class, then
//     after the Proving). Gold pays, hero level gates.
//   - Attack: the hit (atkCurve: x1.7 every 5th level). Ability: its power ((4 + 3 x level) x1.55 every 5th level) and
//     a milestone every 5th level (SOLO_TUNE.train.ms: a shorter cooldown, a longer effect, one more foe). Parry: +10%
//     counter damage a level. Dodge: a shorter cooldown. Timing windows never grow from gold.
//   - Price of level n+1 = ECON.train[kind].base x r a level to bend (20), r2 to bend2 (40), r3 past it; x mod('trainCost'), rounded up to whole gold.
//
// API (function declarations: 40-rules and 59j call them at run time):
//   trainMoves(k?) -> ['atk', ...ability ids, 'parry', 'dodge']   k: a hero key (default: the one playing)
//   trainLv(move, k?) -> level; trainCap(k?) -> { cap, by: 'level' | 'stage', lv, stage, stageCap }
//   trainStage(k?) -> 0 base class | 1 after the Proving; trainKind(move) -> 'atk' | 'ab' | 'parry' | 'dodge'
//   trainCost(move, n) -> the price of level n + 1; trainPlan(move, amt?, k?) -> { n, cost } (x1 / x10 / Max within the cap; n 0 = at the cap)
//   train(move, amt?) -> levels bought (the playing hero; pays gold, ledger 'up', event train { hero, move, from, to })
//   trainName(move) -> 'Attack' | ability name | 'Parry' | 'Dodge'
//   read   trainAps(k?), trainAbPow(id, lv?) (the ability's hit before hand / gear: its curve x heroPow()),
//          trainCounterX(lv?), trainDodgeCd(lv?), trainMs(id, lv?) -> { cd, mark, target, stun, patch } (milestones reached),
//          trainAbCd(id, base, lv?) (the cooldown after milestones), trainInfo(move, k?) -> the UI's facts,
//          trainNext(k?) -> { move, cost } the cheapest level to train now (Next Up, the guide), trainEst(active) (a rough dps
//          for the sim's buyer)
// Events: train { hero, move, from, to }, trainCap { hero, move, lv } (a move reached the stage cap).
// Save: S.solo.tr / S.solo.asc (defaults in 59j's registerState: TRAIN0() in 24b). The key moved to v4 with this.

const TRAIN_BASIC = ['atk', 'parry', 'dodge'];
function trainHero(k) { return k || (typeof soloHero === 'function' ? soloHero() : null) || (S.solo && S.solo.hero) || 'wren'; }
function trainRec(k) {
  k = trainHero(k);
  const s = S.solo || (S.solo = {});
  if (!s.tr || typeof s.tr !== 'object') s.tr = TRAIN0();
  if (!s.tr[k] || typeof s.tr[k] !== 'object') s.tr[k] = { atk: 0, parry: 0, dodge: 0 };
  return s.tr[k];
}
function trainKind(mv) { return TRAIN_BASIC.includes(mv) ? mv : 'ab'; }
function trainMoves(k) {
  k = trainHero(k);
  // turn fights: the signature's Training is the hero's ability power, for every ability they learn (59k)
  const abs = SOLO_HEROES[k] ? SOLO_HEROES[k].abs : [];
  return ['atk', ...abs, 'parry', 'dodge'];
}
const trainTurns = () => typeof TURN_TUNE === 'object' && !!TURN_TUNE.on;
function trainName(mv) { return mv === 'atk' ? 'Attack' : mv === 'parry' ? 'Parry' : mv === 'dodge' ? 'Dodge' : trainTurns() ? 'Ability power' : (SOLO_ABILITIES[mv] ? SOLO_ABILITIES[mv].name : mv); }
function trainLv(mv, k) {
  if (!S || !S.solo) return 0;
  if (attrOn()) {
    // hero-progression-rework: a move's level follows the hero's: L - 1 (Lv 1 hits as today's untrained hero) up to the class
    // stage's cap, then HERO_TUNE.capHalf a level past it (judge 3b). Can be fractional; milestones floor it. No allocation: called often.
    const h = trainHero(k), H = SOLO_HEROES[h];
    if (!(mv === 'atk' || mv === 'parry' || mv === 'dodge' || (H && H.abs.includes(mv)))) return 0;
    const T = SOLO_TUNE.train, lv = heroLvOf(h) - 1, cap = T.cap[Math.min(trainStage(h), T.cap.length - 1)];
    return lv <= cap ? Math.max(0, lv) : cap + HERO_TUNE.capHalf * (lv - cap);
  }
  const v = trainRec(k)[mv]; return v > 0 ? Math.floor(v) : 0;
}
function trainStage(k) {
  k = trainHero(k);
  const s = S.solo || {};
  if (s.asc && s.asc[k]) return 1;
  return k === (typeof soloHero === 'function' && soloHero()) && typeof clsProven === 'function' && clsProven() ? 1 : 0;
}
function trainCap(k) {
  k = trainHero(k);
  const T = SOLO_TUNE.train, stage = trainStage(k), stageCap = T.cap[Math.min(stage, T.cap.length - 1)];
  const lv = attrOn() ? heroLvOf(k) : typeof soloLevels === 'function' ? soloLevels()[k].L : S.L;
  return { cap: Math.min(lv, stageCap), by: lv < stageCap ? 'level' : 'stage', lv, stage, stageCap };
}
// The price of level n + 1 (n = the level now); mod('trainCost') is a hook for discounts (none yet).
function trainCost(mv, n) {
  const E = ECON.train, b = E[trainKind(mv)].base;
  // whole gold only (menu audit #17: early prices showed as 9.6)
  return Math.ceil(b * Math.pow(E.r, Math.min(n, E.bend)) * Math.pow(E.r2, Math.max(0, Math.min(n, E.bend2) - E.bend)) * Math.pow(E.r3, Math.max(0, n - E.bend2)) * mod('trainCost'));
}
// plan() for Training: amt '1' | '10' | 'max' (default: the player's x1 / x10 / Max). 'max' is what the gold buys (at
// least 1, so the button shows the next price). Never past the cap. { n: 0, cost: Infinity } at the cap.
function trainPlan(mv, amt, k) {
  if (attrOn()) return { n: 0, cost: Infinity };   // hero-progression-rework: no gold Training
  const lv = trainLv(mv, k), c = trainCap(k).cap;
  if (lv >= c) return { n: 0, cost: Infinity };
  amt = amt === undefined ? S.amt : amt;
  let n = 0, cost = 0;
  if (amt === 'max') {
    while (lv + n < c) { const x = trainCost(mv, lv + n); if (n > 0 && cost + x > S.gold) break; cost += x; n++; }
  } else {
    n = Math.min(+amt || 1, c - lv);
    for (let i = 0; i < n; i++) cost += trainCost(mv, lv + i);
  }
  return { n, cost };
}
function train(mv, amt) {
  if (attrOn()) return 0;   // hero-progression-rework: no gold Training
  const k = typeof soloHero === 'function' ? soloHero() : null;
  if (!k || !trainMoves(k).includes(mv)) return 0;
  const p = trainPlan(mv, amt, k);
  if (!(p.n > 0) || S.gold < p.cost) return 0;
  const r = trainRec(k), from = trainLv(mv, k);
  S.gold -= p.cost; r[mv] = from + p.n;
  econSpend('up', p.cost);
  if (typeof gearDirty === 'function' && mv === 'atk') gearDirty();
  emit('train', { hero: k, move: mv, from, to: r[mv] });
  const T = SOLO_TUNE.train;
  // a milestone reached on an ability: one quiet line (the row shows it too)
  if (trainKind(mv) === 'ab' && Math.floor(r[mv] / T.every) > Math.floor(from / T.every)) {
    const line = trainMsLine(mv, Math.floor(r[mv] / T.every) * T.every);
    if (line) emit('toast', { msg: `Training: ${trainName(mv)} Lv ${Math.floor(r[mv] / T.every) * T.every}. ${line}`, kind: 'good', key: 'training', prio: 'low' });
  }
  const cap = trainCap(k);
  if (cap.by === 'stage' && r[mv] >= cap.stageCap) {
    emit('trainCap', { hero: k, move: mv, lv: r[mv] });
    emit('toast', { msg: cap.stage ? `Training: ${trainName(mv)} is at Lv ${cap.stageCap}, the most it can train.`
      : `Training: ${trainName(mv)} is at Lv ${cap.stageCap}, the most a base class can train. Pass the Proving to train on.`, kind: 'good', key: 'training-cap', prio: 'normal' });
  }
  return p.n;
}

// ---- what a level does ----
function trainAps(k) { k = trainHero(k); const a = SOLO_TUNE.train.aps; return a[k] || 1; }
function trainAbCurve(lv) { const T = SOLO_TUNE.train; return (4 + T.abPer * lv) * atkSteps(lv, T.abX, T.abX2); }
function trainAbPow(id, lv) { return trainAbCurve(lv === undefined ? trainLv(id) : lv) * heroPow(); }
function trainCounterX(lv) { return 1 + SOLO_TUNE.train.parry * (lv === undefined ? trainLv('parry') : lv); }
function trainDodgeCd(lv) { const T = SOLO_TUNE.train; return Math.max(T.dodgeMin, SOLO_TUNE.dodgeCd * Math.pow(T.dodge, lv === undefined ? trainLv('dodge') : lv)); }
// milestones reached by an ability at a level: the kinds take turns (echo: cd at 5, mark at 10, cd at 15, ...)
function trainMs(id, lv) {
  const T = SOLO_TUNE.train, list = T.ms[id] || [], out = { cd: 0, mark: 0, target: 0, stun: 0, patch: 0 };
  const n = Math.floor((lv === undefined ? trainLv(id) : lv) / T.every);
  for (let i = 0; i < n && list.length; i++) out[list[i % list.length]]++;
  return out;
}
// the milestone at level lv (a multiple of every), in words
function trainMsKind(id, lv) { const T = SOLO_TUNE.train, list = T.ms[id] || []; const i = Math.floor(lv / T.every) - 1; return i >= 0 && list.length ? list[i % list.length] : null; }
function trainMsLine(id, lv) {
  const v = SOLO_TUNE.train.msv, k = trainMsKind(id, lv);
  return k === 'cd' ? `Cooldown ${v.cd} s shorter.` : k === 'mark' ? `The Mark lasts ${v.mark} s longer.` : k === 'target' ? 'Hits one more foe.'
    : k === 'stun' ? `The Stun lasts ${v.stun} s longer.` : k === 'patch' ? `The fire on the ground lasts ${v.patch} s longer.` : '';
}
function trainAbCd(id, base, lv) { const T = SOLO_TUNE.train; return Math.max(base * T.cdMin, base - T.msv.cd * trainMs(id, lv).cd); }

// ---- the UI's facts for one move: { move, name, kind, lv, cap, by, now, next, ms, plan } ----
function trainInfo(mv, k) {
  k = trainHero(k);
  const lv = trainLv(mv, k), c = trainCap(k), kind = trainKind(mv), T = SOLO_TUNE.train, playing = k === (typeof soloHero === 'function' && soloHero());
  const pow = heroPow(), f = x => fmt(x);
  let now = '', next = '', ms = '';
  if (kind === 'atk') {
    now = `Hits for ${f(atkCurve(lv) * pow)}`; next = `${f(atkCurve(lv + 1) * pow)}`;
    const m = (Math.floor(lv / PACE.atkEvery) + 1) * PACE.atkEvery; ms = `Lv ${m}: hits x${m > PACE.atkBend ? PACE.atkX2 : PACE.atkX} harder`;
  } else if (kind === 'ab' && trainTurns()) {
    // turn fights: ability power is the hero's Attack power, and each level of this adds to it for every ability (59k)
    const pc = l => Math.round(100 * TURN_TUNE.abTrain * l);
    now = `Every ability +${pc(lv)}% power`; next = `+${pc(lv + 1)}%`;
  } else if (kind === 'ab') {
    const a = SOLO_ABILITIES[mv], x = mv === 'echo' ? SOLO_TUNE.echo.x : mv === 'bash' ? SOLO_TUNE.bash.x : mv === 'fire' ? SOLO_TUNE.fire.x : 1;
    now = `Hits for ${f(trainAbCurve(lv) * pow * x)}`; next = `${f(trainAbCurve(lv + 1) * pow * x)}`;
    const m = (Math.floor(lv / T.every) + 1) * T.every, l = trainMsLine(mv, m); ms = `Lv ${m}: ${l.charAt(0).toLowerCase() + l.slice(1, -1)}`;
    if (a) now += `, every ${+trainAbCd(mv, a.cd, lv).toFixed(1)} s`;
  } else if (kind === 'parry') {
    now = `Counter x${trainCounterX(lv).toFixed(1)}`; next = `x${trainCounterX(lv + 1).toFixed(1)}`;
  } else if (trainTurns()) {
    // turn fights: Dodge training widens the dodge window (59k turnMakeProfile)
    const w = l => Math.round(1000 * Math.min(TURN_TUNE.windowCaps.dodge, SOLO_TUNE.turnDodgeWindow + TURN_TUNE.dodgeTrain * l));
    now = `Dodge window ${w(lv)} ms`; next = w(lv + 1) > w(lv) ? `${w(lv + 1)} ms` : '';
  } else {
    const a = trainDodgeCd(lv), b = trainDodgeCd(lv + 1);
    now = `Cooldown ${a.toFixed(2)} s`; next = b < a ? `${b.toFixed(2)} s` : '';
  }
  const p = playing ? trainPlan(mv, undefined, k) : { n: 0, cost: Infinity };
  return { move: mv, name: trainName(mv), kind, lv, cap: c.cap, by: c.by, stageCap: c.stageCap, stage: c.stage, heroLv: c.lv, now, next, ms, plan: p, max: lv >= c.cap };
}
// The next level to train (Next Up, 55-goals): the cheapest of Attack and the equipped abilities (Attack on a tie); Parry
// and Dodge only once those are at their cap (they pay off only by hand). null when every move is at its cap.
function trainNext(k) {
  if (attrOn()) return null;   // hero-progression-rework: no gold Training
  k = trainHero(k);
  const eq = k === (typeof soloHero === 'function' && soloHero()) && typeof soloEquipped === 'function' ? soloEquipped() : [];
  const pick = list => { let best = null; for (const mv of list) { const p = trainPlan(mv, '1', k); if (p.n > 0 && (!best || p.cost < best.cost)) best = { move: mv, cost: p.cost, lv: trainLv(mv, k) + 1 }; } return best; };
  return pick(trainMoves(k).filter(mv => mv === 'atk' || eq.includes(mv) || (trainKind(mv) === 'ab' && trainTurns()))) || pick(['parry', 'dodge']);
}
// A rough dps for the sim's buyer (tools/sim.mjs): the auto swing, the equipped abilities at their cooldown, and for an
// active player the counters (about one parry every 20 s) and presses.
function trainEst(active) {
  const hd = heroDps();
  let ab = 0;
  const eq = typeof soloEquipped === 'function' ? soloEquipped() : [];
  for (const id of eq) {
    if (!id || !SOLO_ABILITIES[id]) continue;
    const t = SOLO_TUNE, x = id === 'echo' ? t.echo.x + 2 * t.echo.xOther : id === 'bash' ? t.bash.x * (1 + 0.5 * trainMs(id).target) : id === 'fire' ? t.fire.x + 2 * t.fire.xOther + 3 * t.fire.burnP : 1;
    ab += trainAbPow(id) * x * (active ? t.abHandX : 1) / trainAbCd(id, SOLO_ABILITIES[id].cd * mod('abilityCd'));
  }
  // counters are rare (a heavy hit every 20 s of fighting, about a third parried): one a minute at most
  const counter = active ? heroAtk() * SOLO_TUNE.counterX * aps() * critMult() * trainCounterX() / 90 : 0;
  return (active ? hd * SOLO_TUNE.atkX * 0.8 : hd) + ab + counter + (active ? 0.01 * hd * (SOLO_TUNE.dodgeCd / trainDodgeCd()) : 0);
}

{
  // the Proving passed while this hero plays: its cap rises for good (W5-A moves this onto Ascension)
  on('evoProven', () => { const k = typeof soloHero === 'function' && soloHero(); if (k && S.solo) { if (!S.solo.asc || typeof S.solo.asc !== 'object') S.solo.asc = {}; S.solo.asc[k] = 1; } });
}
