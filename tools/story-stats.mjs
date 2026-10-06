#!/usr/bin/env node
// Reads how players meet the story, from a save file or a save code (story-bible.md 12a, story-delivery).
// Prints the Chapter 1 Champion skip rate and the Journal opens, plus every scene the save has finished.
//
//   node tools/story-stats.mjs <save.json | save code | file holding a save code> [more ...]
//
// `S.story.ends` (55-story.js) holds one entry per card sequence: its id -> 'done' (the last card was closed) or 'skipped'
// (Skip or Close ended it early). A Champion's scenes are 'p:<id>:pre' and 'p:<id>:post'. `journalOpens` counts Journal opens.
// With several saves it adds them up. The targets: Chapter 1 Champion skip rate under 40% (missed: over 60%), at least one
// Journal open by zone 35. `seen` and `read` cannot measure skips: a card is marked seen the moment it opens.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadCore, memoryStorage } from './lib/core.mjs';

const KEY = 'lanternfall.save.v5';

// A save from a JSON file, a save code ("LF1:...") or a file that holds one.
export function readSave(arg) {
  let text = arg;
  const abs = path.isAbsolute(arg) ? arg : path.join(process.cwd(), arg);
  if (!/^\s*(\{|LF1:)/.test(arg) && fs.existsSync(abs)) text = fs.readFileSync(abs, 'utf8');
  text = text.trim();
  if (text.startsWith('LF1:')) {
    const r = loadCore({ seed: 1 }).eval(`decodeSave(${JSON.stringify(text)})`);
    if (!r.ok) throw new Error(r.error);
    return r.data;
  }
  return JSON.parse(text);
}

// Totals for the saves: the Chapter 1 Champion scenes (zones 1 to 35) from the game's own story data.
export function storyStats(saves, champData) {
  const champs = champData || JSON.parse(loadCore({ seed: 1, storage: memoryStorage() }).eval('JSON.stringify(STORY_BEATS.champ)'));
  const ch1 = id => champs[id] && champs[id].zone >= 1 && champs[id].zone <= 35;
  const out = { saves: saves.length, champion: { done: 0, skipped: 0 }, sequences: { done: 0, skipped: 0 }, journalOpens: 0, perScene: {}, deepest: 0 };
  for (const s of saves) {
    const st = s.story || {}, ends = st.ends || {};
    out.journalOpens += st.journalOpens || 0;
    out.deepest = Math.max(out.deepest, s.maxZone || 1);
    for (const [k, how] of Object.entries(ends)) {
      if (how !== 'done' && how !== 'skipped') continue;
      out.sequences[how]++;
      const m = /^p:([^:]+):(pre|post)$/.exec(k);
      if (m && ch1(m[1])) { out.champion[how]++; }
      const o = out.perScene[k] || (out.perScene[k] = { done: 0, skipped: 0 }); o[how]++;
    }
  }
  const n = out.champion.done + out.champion.skipped;
  out.champion.rate = n ? out.champion.skipped / n : null;
  return out;
}

export function report(stats) {
  const pct = r => (r == null ? 'no Champion scenes finished yet' : (r * 100).toFixed(0) + '%');
  const c = stats.champion;
  const verdict = c.rate == null ? '' : c.rate > 0.6 ? ' (missed: over 60%)' : c.rate < 0.4 ? ' (target met: under 40%)' : ' (between the target and the miss line)';
  const lines = [
    `Saves read: ${stats.saves} (best zone ${stats.deepest})`,
    `Chapter 1 Champion skip rate: ${pct(c.rate)}${verdict} [${c.skipped} skipped, ${c.done} done]`,
    `Journal opens: ${stats.journalOpens}` + (stats.deepest >= 35 && !stats.journalOpens ? ' (none by zone 35: missed)' : ''),
    `All card sequences: ${stats.sequences.done} done, ${stats.sequences.skipped} skipped`
  ];
  for (const [k, v] of Object.entries(stats.perScene).sort()) lines.push(`  ${k}: ${v.done} done, ${v.skipped} skipped`);
  return lines.join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  if (!args.length) { console.error('usage: node tools/story-stats.mjs <save.json | save code | file with a code> [more ...]'); process.exit(1); }
  try { console.log(report(storyStats(args.map(readSave)))); }
  catch (e) { console.error('Cannot read the story stats: ' + e.message); process.exitCode = 1; }
}
