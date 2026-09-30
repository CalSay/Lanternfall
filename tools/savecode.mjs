#!/usr/bin/env node
// Print a save code for a fixture (or any) save JSON file, using the real save-code core
// (55-savecode.js). Lets the coordinator hand a late-game test save to the owner as a code
// they can paste into Import on the Journal's Save code panel.
// Usage: node tools/savecode.mjs <path-to-save.json>
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadCore, memoryStorage } from './lib/core.mjs';

// ECON-A: the save key moved to v2 (S.v 3). The fixtures in tests/fixtures are loaded under the new key so the
// load paths they exercise keep their checks; section 'econ' checks that a v1 save is never read.
const KEY = 'lanternfall.save.v5';   // W3-A

export function saveCodeFor(json) {
  const g = loadCore({ seed: 1, storage: memoryStorage({ [KEY]: json }) });
  return g.eval('encodeSave(S)');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node tools/savecode.mjs <fixture.json>'); process.exit(1); }
  const abs = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  if (!fs.existsSync(abs)) { console.error(`not found: ${abs}`); process.exit(1); }
  const raw = fs.readFileSync(abs, 'utf8');
  console.log(saveCodeFor(raw));
}
