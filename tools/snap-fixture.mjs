#!/usr/bin/env node
// Write a played save as a test fixture, using the game as it is in this checkout.
// Usage: node tools/snap-fixture.mjs <base-save.json> <out.json> [--minutes=N]
// It loads <base-save.json>, plays N minutes (default 5), spends attribute points, retires every tip, learns and lights
// stars, then writes the save with its empty bounty slots pinned to 2100 (see check.mjs, section 'saves').
// Two uses: the current-era fixture (base: save-mid.json) and the Monday deploy step, which runs it in a clone of the
// deployed SHA to snapshot what testers hold (docs/coord/deploy-log.md, "Release snapshot").
import fs from 'node:fs';
import path from 'node:path';
import { loadCore, memoryStorage, badNumbers } from './lib/core.mjs';

const KEY = 'lanternfall.save.v5';
const args = process.argv.slice(2), flag = n => (args.find(a => a.startsWith('--' + n + '=')) || '').split('=')[1];
const [base, out] = args.filter(a => !a.startsWith('--'));
if (!base || !out) { console.error('usage: node tools/snap-fixture.mjs <base-save.json> <out.json> [--minutes=N]'); process.exit(1); }
const minutes = +flag('minutes') || 5;

const g = loadCore({ seed: 11, storage: memoryStorage({ [KEY]: fs.readFileSync(base, 'utf8') }) });
const E = s => g.eval(s);
for (let i = 0; i < minutes * 600; i++) g.fn.tick(0.1);

// attribute points: the main hero spreads all of them, every bench hero spends half
E(`(() => { if (typeof attrSpread !== 'function') return;
  const main = (S.solo && S.solo.hero) || 'wren'; attrSpread(main);
  for (const k of Object.keys((S.solo && S.solo.lv) || {})) if (k !== main) { const half = Math.floor(attrPoints(k).free / 2); for (let i = 0; i < half; i++) attrAdd(ATTR_IDS[i % ATTR_IDS.length], 1, k); } })()`);
// every guide tip retired, the way a player who ignored them leaves them (done = 2)
E(`(() => { if (typeof GUIDE_STEPS === 'undefined') return; for (const s of GUIDE_STEPS) if (!O().done[s.id]) O().done[s.id] = 2; })()`);
// stars: own, learn and light every one that exists, then light what the points can pay for
E(`(() => { if (typeof starGrant !== 'function') return;
  for (const id of STAR_ORDER) { starGrant(id, true); S.stars.learned[id] = 1; }
  const main = (S.solo && S.solo.hero) || 'wren'; for (const id of STAR_ORDER) starLight(id, main); })()`);
for (let i = 0; i < 100; i++) g.fn.tick(0.1);
g.fn.save();
const S = JSON.parse(g.storage.get(KEY));
for (const b of (S.bounties && S.bounties.slots) || []) if (b && b.k === null) b.wait = 4102444800000;
const bad = badNumbers(S);
if (bad.length || g.errors.length) { console.error('not written: ' + (bad[0] || g.errors[0])); process.exit(1); }
fs.writeFileSync(out, JSON.stringify(S));
console.log(`wrote ${out}: v${S.v}, ${minutes} min played, attr ${JSON.stringify((S.attr || {}).pts || {}).length} bytes, ${Object.keys(S.stars ? S.stars.lit || {} : {}).length} star lists`);
