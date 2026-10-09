// pip-staff-odds-mismatch (measurement only): W10's gear method (reports/why/W10-data/gearzone.mjs, its lib.mjs play/poolFor/
// ownAll/refresh, copied below so this runs from the repo) and the #316 sampler (src/js/55-fight-delta.js) on the same footings.
// Run from the repo root: node docs/proof/pip-staff-odds-mismatch/measure.mjs   (env N: W10 fights a row, default 240)
import fs from 'node:fs'; import path from 'node:path';
const ROOT = process.cwd(), J = JSON.stringify, pc = x => (100 * x).toFixed(0).padStart(3);
const { buildCore, seedOf, PLAYERS } = await import(path.join(ROOT, 'tools/budget.mjs'));
const { loadCore, memoryStorage } = await import(path.join(ROOT, 'tools/lib/core.mjs'));
const N = +(process.env.N || 240), SET = ['fire', 'spark', 'kindle'];   // W10's Pip loadout: Fireball first
// ---- W10 lib.mjs (unchanged in substance) ----
const poolFor = (core, k, z) => core.eval(`(() => { const L = S.L, beat = ${z} - 1, n = { 1: Math.min(beat, 4), 2: Math.max(0, Math.min(beat, 12) - 4), 3: Math.max(0, Math.min(beat, 20) - 12) };
  const out = []; for (const id of HERO_ABILITIES[${J(k)}]) { const a = ABILITIES[id]; if (!a.tier) { out.push(id); continue; } if (a.tier <= 3 && L >= ABILITY_TIERS[a.tier].lv && n[a.tier] > 0) out.push(id); }
  return { L, pool: out }; })()`);
const ownAll = (core, k, pool) => core.eval(`(() => { S.abil.unl[${J(k)}] = ${J(pool)}.filter(id => ABILITIES[id].tier); for (const id of HERO_TALENTS[${J(k)}]) talentSet(${J(k)}, id, 'a'); gearDirty(); })()`);
const refresh = core => core.eval(`(() => { arena = null; gearDirty(); fightBoss = true; spawn(); })()`);
const play = (core, eq) => {   // W10: the live turnCombatProfile, its loadout replaced by eq, the casual player, W10's seeds
  const seeds = Array.from({ length: N }, (_, i) => seedOf('w10', 'w10-z10-boss', 'pip', 'casual', 'g', i));
  const r = core.eval(`(() => { const p = turnCombatProfile(); p.eq = ${J(eq)}; p.cds = { attack: 1 }; for (const id of p.eq) p.cds[id] = turnCdFor(id); let K = 0, D = 0;
    for (const sd of ${J(seeds)}) { const r = turnCombatSample({ profile: p, seconds: 36000, fights: 1, seed: sd, skill: ${J(PLAYERS.casual)} }); K += r.kills; D += r.deaths; } return K / (K + D); })()`);
  return r;
};
// ---- the #316 sampler, raw: 55-fight-delta's profile (turnMakeProfile(bossOddsFoe(maxZone), cbEstHero()), the game's own loadout
// unless eq is given), bossOddsSkill(), its seeds; fights in tens ----
const sampler = (core, eq, fights = 80) => core.eval(`(() => { const z = S.maxZone, p = turnMakeProfile(bossOddsFoe(z), cbEstHero());
  if (${J(eq)}) { p.eq = ${J(eq)}; p.cds = { attack: 1 }; for (const id of p.eq) p.cds[id] = turnCdFor(id); } let k = 0, d = 0;
  for (let c = 0; c < ${fights / 10}; c++) { const r = turnCombatSample({ profile: p, seconds: 6000, seed: 1 + c * 7919 + z * 104729, skill: bossOddsSkill(), fights: 10 }); k += r.kills; d += r.deaths; }
  return k / (k + d); })()`);
const staff = (core, o) => core.eval(`(() => { Object.assign(itemById(S.equip.weapon), ${J(o)}); gearDirty(); })()`);
// the line itself: fightDelta on a scratch staff (the worn one with o applied), as the Upgrade button and recipe row ask it
const line = (core, o) => core.eval(`JSON.stringify(fightDelta(Object.assign(JSON.parse(JSON.stringify(itemById(S.equip.weapon))), { id: -1 }, ${J(o)}), { scratch: true }))`);
const table = (name, core) => {
  const own = core.eval('soloEquipped().filter(Boolean)');
  console.log(`\n== ${name}: L${core.eval('S.L')}, zone ${core.eval('S.maxZone')} boss, the game's own loadout ${own.join('/')}, bossOddsSkill ${J(core.eval('bossOddsSkill()'))}`);
  console.log('staff             W10 play (casual, 240 fights)    | sampler raw, 80 fights (240)          | fightDelta line from worn +0');
  for (const o of [{ plus: 0 }, { plus: 1 }, { plus: 2 }, { plus: 3 }, { plus: 4 }, { plus: 5 }, { plus: 10 }, { t: 2, plus: 0 }]) {
    staff(core, o); refresh(core);
    const a = play(core, SET), b = play(core, own), c = sampler(core, null), c3 = sampler(core, null, 240), d = sampler(core, SET);
    staff(core, { t: 1, plus: 0 }); refresh(core);
    console.log(`${J(o).padEnd(18)}Fireball-first ${pc(a)}%, own ${pc(b)}%  | own ${pc(c)}% (${pc(c3)}%), Fireball-first ${pc(d)}% | ${o.plus === 0 && !o.t ? '-' : line(core, o)}`);
  }
};
const gatesOff = (name, core) => {   // the same save with rally gates off (TURN_TUNE.boss.gate.on = 0), scratch only
  core.eval('TURN_TUNE.boss.gate.on = 0'); refresh(core);
  console.log(`\n== ${name}: rally gates off, sampler raw (80 fights) by staff level`);
  console.log([0, 1, 2, 3, 4, 5, 10].map(n => { staff(core, { plus: n }); const w = sampler(core, null); return `+${n} ${pc(w)}%`; }).join(', '));
  staff(core, { plus: 0 }); core.eval('TURN_TUNE.boss.gate.on = 1'); refresh(core);
};
const steps = (name, core) => {   // the Upgrade button: worn +n against one step on (+n+1)
  console.log(`\n== ${name}: the Upgrade button one press at a time (worn +n against +n+1)`);
  for (let n = 0; n < 10; n++) {
    staff(core, { plus: n }); const a = sampler(core, null); staff(core, { plus: n + 1 }); const b = sampler(core, null); staff(core, { plus: n });
    console.log(`+${n} -> +${n + 1}: raw ${pc(a)}% -> ${pc(b)}%  line ${line(core, { plus: n + 1 })}`);
  }
  staff(core, { plus: 0 });
};
// the day is pinned to 9 Oct 2026 08:00 UTC (Hunter's Feast, +15% damage) so footing C reads the same Omen on any run date
const fixture = omen => { const KEY = 'lanternfall.save.v5', core = loadCore({ seed: 7, prelude: 'Date.now = () => 1791532800000;', storage: memoryStorage({ [KEY]: fs.readFileSync(path.join(ROOT, 'tests/proof-fixtures/save-pip-z10-ward.json'), 'utf8') }) });
  core.eval('loadSave(); TURN_TUNE.on = 1;'); if (!omen) core.eval("almanac.force('none')");
  core.eval('S.activity = "fight"; S.zone = S.maxZone; arena = null; gearDirty(); fightBoss = true; spawn();'); return core; };
// A: W10's footing: tools/budget.mjs's z10 arrival boss row (as W10's CPS['z10-boss']), every ability in the pool owned
{ const core = buildCore(['w10-z10-boss', 10, 'boss', { st: 'kept', fx: 'early', gear: 'common', foot: 'arrival' }], 'pip'); ownAll(core, 'pip', poolFor(core, 'pip', 10).pool);
  console.log('W10 footing day (budget pins Date.now):', core.eval('JSON.stringify(almanac.today() && almanac.today().n)')); table('A. W10 footing (budget z10 arrival)', core); }
// B: the #316 check's footing (tests/proof-fixtures/save-pip-z10-ward.json, no Omen, as tools/check.mjs loads every game)
{ const core = fixture(false); table('B. #316 check footing (save-pip-z10-ward), no Omen', core); steps('B', core); gatesOff('B', core); }
// C: the same save with the pinned day's Omen left on (Hunter's Feast, +15% damage)
{ const core = fixture(true); console.log('\nC. Omen on the pinned day:', core.eval('JSON.stringify(almanac.today() && [almanac.today().n, almanac.today().fx])')); steps('C. save-pip-z10-ward, Omen on', core); }
