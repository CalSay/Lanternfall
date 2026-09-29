import { loadCore } from './core.mjs';
const g = loadCore({ seed: +(process.argv[2] || 1) }); const E = s => g.eval(s);
console.log(E('S.activity'), E('soloOn()'), E('soloHero()'));
console.log(E(`soloPick("${process.argv[3] || 'wren'}")`), E('soloHero()'), E('S.party.cls'), E('S.name'), E('JSON.stringify(S.party.field)'));
const log = [];
g.fn.on('soloCounter', e => log.push('counter ' + e.dmg));
g.fn.on('telegraphStart', e => log.push('tele ' + e.kind + ' z' + E('S.zone')));
g.fn.on('zoneClear', e => log.push(`clear ${e.zone} @${Math.round(t)}s L${E('S.L')}`));
g.fn.on('wipe', e => log.push(`WIPE z${e.zone} boss ${e.boss} @${Math.round(t)}s`));
g.fn.on('bossFail', e => log.push(`bossFail z${e.zone} @${Math.round(t)}s`));
let t = 0;
const mins = +(process.argv[4] || 10);
for (; t < mins * 60; t += 0.1) { g.fn.tick(0.1); if (Math.round(t * 10) % 50 === 0) E('while (buyHero("blade", "1")) {}'); }
console.log(`${mins} min: zone`, E('S.maxZone'), 'L', E('S.L'), 'kills', E('S.totalKills'), 'wipes', E('CB_STATS.wipes'), E('JSON.stringify(SOLO_STATS)'));
console.log(log.filter(x => !x.startsWith('tele')).join(' | '));
console.log('teles', log.filter(x => x.startsWith('tele')).length);
console.log('errors', g.errors.slice(0, 5));
