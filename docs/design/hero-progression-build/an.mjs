// node an.mjs file.json ... : hours to zones, levels, longest level gap in zones 20-30
import fs from 'node:fs';
for (const f of process.argv.slice(2)) {
  let d; try { d = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { console.log(f, 'unreadable'); continue; }
  const ev = d.ev; const lv = ev.filter(e => e.k === 'level'); const zc = ev.filter(e => e.k === 'zoneClear');
  const levelAt = a => { let L = 1; for (const e of lv) { if (e.a <= a) L = e.L; else break; } return L; };
  const reach = z => { const e = zc.find(e => e.id === z - 1); return e ? e.a : null; };
  const h = a => a == null ? '-' : (a / 3600).toFixed(1) + 'h L' + levelAt(a);
  // longest stretch without a level-up while maxZone in [20,30)
  const a20 = reach(20), a30 = reach(30) ?? d.activeSec;
  let gap = 0, gapAt = null;
  if (a20 != null) { const pts = [a20, ...lv.filter(e => e.a > a20 && e.a < a30).map(e => e.a), a30]; for (let i = 1; i < pts.length; i++) if (pts[i] - pts[i - 1] > gap) { gap = pts[i] - pts[i - 1]; gapAt = pts[i - 1]; } }
  // zones' play: how many zones were cleared during the gap, and zone duration avg in 20-30
  const zoneAt = a => { let z = 1; for (const e of zc) { if (e.a <= a) z = e.id + 1; else break; } return z; };
  const per = a20 != null && reach(30) != null ? (reach(30) - a20) / 10 : null;
  console.log(f.split('/').pop().replace('.json',''), '| z10', h(reach(10)), '| z20', h(reach(20)), '| z30', h(reach(30)), '| z35', h(reach(35)), '| end z', d.end.maxZone, 'L', d.end.L, (d.activeSec/3600).toFixed(1)+'h',
    '| gap20-30', (gap / 3600).toFixed(2) + 'h at z' + (gapAt != null ? zoneAt(gapAt) : '-'), per ? '(' + (gap / per).toFixed(1) + ' zones)' : '', '| wipes', d.wipes.length, 'kills', d.kills);
}
