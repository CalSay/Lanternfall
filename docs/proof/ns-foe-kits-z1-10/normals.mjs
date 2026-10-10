// Ordinary foes at zones 3-10, kits off -> on: casual win %, hero turns a fight, damage taken a fight (share of max HP); 240 fights a cell.
//   node docs/proof/ns-foe-kits-z1-10/normals.mjs
process.argv = process.argv.slice(0, 2);
const { buildCore, PLAYERS } = await import(new URL('../../../tools/budget.mjs', import.meta.url).href);
const out = [];
for (let z = 3; z <= 10; z++) {
  const c = z >= 9 ? [`z${z}-normal`, z, 'normal', { st: 'kept', fx: 'early', gear: 'common', foot: 'arrival' }] : [`z${z}-normal`, z, 'normal', { st: 'kept', fx: 'early' }];
  const line = [z];
  for (const hero of ['wren', 'tobin', 'pip']) {
    const cell = [];
    for (const on of [0, 1]) {
      const core = buildCore(c, hero);
      if (on) core.eval(`zoneFoeArea(0,1); zoneFoeArea(1,1);`);
      const r = core.eval(`(() => { for (let i = 0; i < 400; i++) { const f = combatFoes().find(x => x && !x.dead); if (f && f.type === TYPES[zoneType(${z})].key && !f.elite) break; spawn(); }
        const p = turnCombatProfile(); let K = 0, D = 0, T = 0, F = 0, DT = 0;
        for (let i = 0; i < 48; i++) { const r = turnCombatSample({ profile: p, seconds: 36000, fights: 5, seed: 900 + i, skill: ${JSON.stringify(PLAYERS.casual)} }); K += r.kills; D += r.deaths; T += r.totalHeroTurns; F += r.completedFights; DT += r.damageTaken / p.heroMaxHp; }
        return [p.foeName, Math.round(100 * K / (K + D)), Math.round(10 * T / F) / 10, Math.round(100 * DT / F) / 100]; })()`);
      cell.push(r);
    }
    line.push(hero + ' ' + cell.map(r => r.join(' ')).join(' -> '));
  }
  console.log(line.join(' | '));
}
