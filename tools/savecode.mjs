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
const KEY = 'lanternfall.save.v6';   // W3-A

export function saveCodeFor(json) {
  // Validate in a clean core before any feature's load-time code sees this file.
  const clean = loadCore({ seed: 1 });
  const limit = clean.eval('SAVECODE_LIMITS.jsonBytes');
  if (typeof json !== 'string' || Buffer.byteLength(json, 'utf8') > limit) throw new Error('Save JSON is missing or too large.');
  try { JSON.parse(json); } catch { throw new Error('The file does not contain valid save JSON.'); }
  const result = clean.eval(`validateSave(JSON.parse(${JSON.stringify(json)}))`);
  if (!result.ok) throw new Error(result.error);
  const g = loadCore({ seed: 1, storage: memoryStorage({ [KEY]: json }) });
  return g.eval('encodeSave(S)');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node tools/savecode.mjs <fixture.json>'); process.exit(1); }
  const abs = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  if (!fs.existsSync(abs)) { console.error(`not found: ${abs}`); process.exit(1); }
  try {
    const limit = loadCore({ seed: 1 }).eval('SAVECODE_LIMITS.jsonBytes');
    if (fs.statSync(abs).size > limit) throw new Error('Save JSON is too large.');
    const raw = new TextDecoder('utf-8', { fatal: true }).decode(fs.readFileSync(abs));
    console.log(saveCodeFor(raw));
  } catch (e) { console.error('Cannot make a save code: ' + e.message); process.exitCode = 1; }
}
