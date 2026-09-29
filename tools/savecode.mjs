#!/usr/bin/env node
// Print a save code for a fixture (or any) save JSON file, using the real save-code core
// (55-savecode.js). Lets the coordinator hand a late-game test save to the owner as a code
// they can paste into Import on the Journal's Save code panel.
// Usage: node tools/savecode.mjs <path-to-save.json>
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadCore, memoryStorage } from './lib/core.mjs';

const KEY = 'lanternfall.save.v1';

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
