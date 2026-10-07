#!/usr/bin/env node
// Human playtester (card human-playtester): a model plays the built game with no script, as a first-time player, and writes
// numbered one-line notes the moment it notices something wrong, in the blunt style of a friend texting the developer.
// It plays through tools/playtest.mjs (one open game, driven line by line), at a human pace: before each tap the game runs
// for the time a person takes to read what just appeared, so a tip that vanishes or a foe that hits mid-read is seen.
//
//   node tools/playtest-human.mjs run   --html <build> --seed <n> --out <dir>   play with the Messages API (needs ANTHROPIC_API_KEY)
//        [--model claude-opus-5-5] [--effort high] [--dry]                      --dry: no model, taps the first button (plumbing test)
//
// No API key? A Claude Code worker can be the player instead, one command per turn, with the same brief, caps and logs:
//   node tools/playtest-human.mjs start --html <build> --seed <n> --out <dir>   open the game in a background process; prints
//                                                                                the player brief and the first screen
//   node tools/playtest-human.mjs act   --out <dir> '<action>' [--why "<reason>"] [--note "<one line>"]...
//   node tools/playtest-human.mjs note  --out <dir> "<one line>"                 add a note without acting
//   node tools/playtest-human.mjs stop  --out <dir> [--model <id>] [--tokens-in N --tokens-out N --cache-read N --cache-write N] [--usd X]
//
// Actions: tap <label> | tap <label> x<2-5> (tap it again and again, as when mashing Attack) | wait <seconds> |
//          read (take a moment; the game keeps running) | scroll down | scroll up
// Caps (all modes): --max-steps 150, --max-minutes 30 (game minutes), --max-usd 10 (run mode). Also --landscape.
// Output in <dir>: notes.md (numbered notes, written as noticed), steps.jsonl (action, reason, what changed, per step),
// shots/ (a screenshot per look), run.json (steps, game minutes, tokens, USD, stop reason, and the full player prompt, so
// anyone can check the player saw nothing but the game). The player never sees repo files, docs or anyone's notes.
// The game clock stands still while the player thinks (the driver's --frozen): only reading time, waits and taps move it.
// The same action on the same unchanged screen 3 times running adds a "Stuck" note by itself.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import readline from 'node:readline';
import { spawn } from 'node:child_process';
import { ROOT } from './lib/core.mjs';

const argv = process.argv.slice(2);
const cmd = argv[0];
const die = m => { console.error('playtest-human: ' + m); process.exit(1); };
const opt = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const opts = n => argv.flatMap((a, i) => (a === '--' + n && argv[i + 1] !== undefined ? [argv[i + 1]] : []));
const flag = n => argv.includes('--' + n);
const numOpt = (n, d) => { const v = Number(opt(n, d)); if (!Number.isFinite(v) || v < 0) die(`--${n} needs a number`); return v; };

const OUT = path.resolve(opt('out', '') || die('give --out <dir>'));
const CAPS = { steps: numOpt('max-steps', 150), minutes: numOpt('max-minutes', 30), usd: numOpt('max-usd', 10) };
const F = { notes: path.join(OUT, 'notes.md'), steps: path.join(OUT, 'steps.jsonl'), run: path.join(OUT, 'run.json'), server: path.join(OUT, 'server.json') };

// Prices in USD per million tokens: input, output, cache read, cache write (5 minute).
const PRICES = {
  'claude-opus-5-5': [4, 20, 0.2, 5], 'claude-sonnet-5-5': [2, 10, 0.2, 2.5], 'claude-haiku-4-5': [1, 5, 0.1, 1.25], 'claude-haiku-5-5': [0.1, 0.5, 0.01, 0.125]
};
const usdOf = (model, t) => { const p = PRICES[model]; if (!p) return null;
  return +((t.input * p[0] + t.output * p[1] + t.cacheRead * p[2] + t.cacheWrite * p[3]) / 1e6).toFixed(4); };

// ---------------- the player's brief: the game's screen and nothing else ----------------
export const BRIEF = `You are playing a mobile game for the first time. You have never seen it and know nothing about it except what is on the screen. You are a normal player on a phone: curious, a little impatient, happy to follow the game's suggestions when they make sense. Play for up to 30 minutes and try to get into the game: do what it asks, try what it offers, and keep moving toward whatever goal it seems to set.

While you play, keep a running list of notes, as a friend testing the game would text the developer. Write a note the moment you notice something, not at the end. One blunt line each, in your own words. Note anything that:
- is confusing, illogical or contradicts itself (a line of dialogue that does not fit what happens next, a warning that does not match what you can see);
- happens too fast to read or act on, or gives you no time to learn something before you need it;
- tells you to do something you cannot do, or something pointless right now;
- leaves out a step you needed (you made or got something and nobody told you what to do with it);
- promised you something that never arrived, or a button that did nothing or did something unexpected;
- takes you somewhere you did not expect, or does not take you back where you were;
- feels too easy, too hard, too slow or too grindy, or uses numbers you do not care about or understand;
- reads oddly (writing that sounds unnatural or strange), or puts something in a place you would not look for it;
- unlocks or appears without explanation;
- you liked, or that felt good (say so too).
When something confuses you, quote the exact words on screen that confused you. Do not repeat a note. If the same problem gets worse, write a new note saying so. Notes are about the game as you feel it, not about how you are being shown it.

Each turn you see the screen: a screenshot plus the text on it, the buttons you can tap (greyed ones marked) and other buttons on the page (further down, or behind what is showing). Pick ONE action:
- tap <button label> (copy the label; for repeated taps of the same button, e.g. attacking, add x2 to x5: tap Attack x3)
- wait <seconds> (let the game run, e.g. wait 30 while something works; up to 300)
- read (take a moment; the game keeps running while you do)
- scroll down / scroll up
The game keeps running in real time while you read. Before each tap you take as long as a person needs to read what just appeared, so if something changes or attacks while you read, you will be told.`;

// ---------------- the game: one open browser, driven through the playtest driver ----------------
class Game {
  constructor({ html, seed, landscape }) {
    this.args = [path.join(ROOT, 'tools', 'playtest.mjs'), 'batch', '--json', '--quiet', '--frozen', '--session', path.join(OUT, 'session'), '--shots', path.join(OUT, 'shots')];
    if (html) this.args.push('--html', path.resolve(html));
    if (seed !== undefined) this.args.push('--seed', String(seed));
    if (landscape) this.args.push('--landscape');
    this.secs = 0;   // game seconds played, by this tool's count
  }
  async open() {
    this.p = spawn(process.execPath, this.args, { stdio: ['pipe', 'pipe', 'inherit'] });
    this.lines = readline.createInterface({ input: this.p.stdout })[Symbol.asyncIterator]();
    await this.send('new fresh'); this.secs += 1.5;   // the driver boots the page for 1.5 s
  }
  // One command in, one JSON result out. The driver echoes "> cmd" first.
  async send(line) {
    this.p.stdin.write(line + '\n');
    for (;;) {
      const { value, done } = await this.lines.next();
      if (done) throw new Error('the game driver stopped (see its error above)');
      if (value.startsWith('> ')) continue;
      try { return JSON.parse(value); } catch (e) { /* a plain line, such as EXPECTS: carry on */ }
    }
  }
  async wait(s) { s = Math.round(s * 10) / 10; if (s <= 0) return null; this.secs += s; return this.send(`wait ${s}`); }
  async look() { return this.send('look'); }
  async tap(label) { const r = await this.send(`tap "${label.replace(/"/g, '')}"`); if (r.ok) this.secs += 0.5; return r; }
  async scroll(dir) { this.secs += 0.3; return this.send(`scroll ${dir}`); }
  async close() { try { this.p.stdin.end(); await new Promise(r => this.p.once('exit', r)); } catch (e) { /* already gone */ } }
}

// ---------------- what the player is told each turn ----------------
const words = s => (s.match(/[A-Za-z0-9']+/g) || []).length;
const sentence = l => words(l) >= 4;
// Seconds a person takes before acting: a beat to react plus reading the new text at about 4 words a second.
const readSecs = (prev, now) => { const old = new Set(prev ? prev.lines : []);
  const fresh = now.lines.filter(l => !old.has(l)).reduce((n, l) => n + words(l), 0);
  return Math.min(8, 1.2 + fresh / 4); };
function screenText(s, { withShot }) {
  const out = [];
  if (withShot) out.push(`Screenshot: ${s.screenshot}`);
  if (s.away) out.push(`Away report: ${s.away}`);
  out.push('Text on screen:', ...s.lines.map(l => '  ' + l));
  out.push('Buttons:', ...(s.buttons.length ? s.buttons.map(b => `  [${b.label}]${b.disabled ? ' (greyed out)' : ''}`) : ['  (none)']));
  if (s.offscreen.length) out.push(`Other buttons on the page (further down, or behind what is showing): ${s.offscreen.slice(0, 25).map(l => `[${l}]`).join(' ')}${s.offscreen.length > 25 ? ` and ${s.offscreen.length - 25} more` : ''}`);
  if (s.toasts.length) out.push(`Pop-up notices: ${s.toasts.join(' | ')}`);
  if (s.bell && s.bell !== '0') out.push(`Notice bell: ${s.bell}`);
  return out.join('\n');
}
const hasButton = (s, label) => { const l = label.toLowerCase(); return [...s.buttons, ...s.offAll].some(b => b.label.toLowerCase().includes(l)); };

function parseAction(a) {
  a = String(a || '').trim();
  let m;
  if ((m = a.match(/^tap\s+(.+?)(?:\s+x([1-9]))?$/i))) return { kind: 'tap', label: m[1].replace(/^\[|\]$/g, '').replace(/^"|"$/g, '').trim(), times: Math.min(5, +(m[2] || 1)) };
  if ((m = a.match(/^wait\s+(\d+(?:\.\d+)?)/i))) return { kind: 'wait', secs: Math.min(300, Math.max(1, +m[1])) };
  if (/^read\b/i.test(a)) return { kind: 'read' };
  if ((m = a.match(/^scroll\s+(up|down)/i))) return { kind: 'scroll', dir: m[1].toLowerCase() };
  return null;
}

// ---------------- one run: state, logs, caps ----------------
class Run {
  constructor(meta) {
    fs.mkdirSync(OUT, { recursive: true });
    this.meta = meta; this.step = 0; this.noteN = 0; this.same = 0; this.lastKey = ''; this.stopped = null; this.screen = null; this.errors = [];
    if (!fs.existsSync(F.notes)) fs.writeFileSync(F.notes, `# Tester notes, seed ${meta.seed}\n\nBuild: ${meta.html}. Numbered in the order noticed; (after step, game time) after each.\n\n`);
  }
  clock() { const s = Math.round(this.game.secs); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
  note(text) {
    const t = String(text || '').replace(/\s+/g, ' ').trim(); if (!t) return null;
    this.noteN++; fs.appendFileSync(F.notes, `${this.noteN}. ${t} _(after step ${this.step}, ${this.clock()})_\n`); return this.noteN;
  }
  capHit() {
    if (this.step >= CAPS.steps) return `step cap (${CAPS.steps})`;
    if (this.game.secs / 60 >= CAPS.minutes) return `game-minute cap (${CAPS.minutes})`;
    return null;
  }
  status() { return `Step ${this.step} of ${CAPS.steps}. Played ${this.clock()} of ${CAPS.minutes}:00.`; }
  async begin(game) {
    this.game = game; await game.open(); await game.wait(1);
    this.screen = await game.look();
    return this.screen;
  }
  // Play one action the way a person would. Returns the text for the player's next turn.
  async act(action, why, notes = []) {
    if (this.stopped) return { text: `The session is over (${this.stopped}).`, over: true };
    for (const n of notes) this.note(n);
    const a = parseAction(action);
    if (!a) return { text: `"${action}" is not an action. Use: tap <label>, tap <label> x3, wait <seconds>, read, scroll down, scroll up.\n${this.status()}`, over: false };
    this.step++;
    const g = this.game, before = this.screen, errorsBefore = this.errors.length, rec = { step: this.step, t: +g.secs.toFixed(1), action, why: why || '', notes, before: before.screenshot };
    const told = [];
    const gather = r => { if (r && r.pageErrors) this.errors.push(...r.pageErrors); };
    if (a.kind === 'tap') {
      // Reading time first. Then the screen as it is now: did what the player was reading go away, or the button?
      const rs = readSecs(this.prevSeen, before); rec.readSecs = +rs.toFixed(1);
      gather(await g.wait(rs));
      let now = await g.look();
      const gone = before.lines.filter(l => sentence(l) && !now.lines.includes(l)), came = now.lines.filter(l => sentence(l) && !before.lines.includes(l));
      if (gone.length || came.length) { told.push(`While you read (${rs.toFixed(1)} s), the screen changed.${gone.length ? ' Gone: ' + gone.slice(0, 6).map(l => `"${l}"`).join(' ') : ''}${came.length ? ' New: ' + came.slice(0, 6).map(l => `"${l}"`).join(' ') : ''}`); rec.changedWhileReading = { gone, came }; }
      if (!hasButton(now, a.label)) { told.push(`[${a.label}] is not there any more, so you did not tap.`); rec.tap = 'gone'; }
      else for (let i = 0; i < a.times; i++) {
        const r = await g.tap(a.label); gather(r);
        rec.tap = (rec.tap ? rec.tap + '; ' : '') + (r.msg || ''); if (!r.ok) { told.push(r.msg); break; }
        if (i < a.times - 1) { gather(await g.wait(1)); now = await g.look(); if (!hasButton(now, a.label)) { told.push(`After ${i + 1} taps [${a.label}] went away.`); break; } }
      }
      gather(await g.wait(0.5));
    } else if (a.kind === 'wait') { gather(await g.wait(a.secs)); told.push(`You waited ${a.secs} s.`); }
    else if (a.kind === 'read') { const rs = Math.max(3, readSecs(null, before)); gather(await g.wait(rs)); told.push(`You took ${rs.toFixed(1)} s to read.`); }
    else { const r = await g.scroll(a.dir); gather(r); told.push(r.text || (r.scrolled ? `Scrolled ${a.dir}.` : `Nothing to scroll ${a.dir}.`)); }
    const after = await g.look(); gather(after);
    // Stuck detector: the same action on the same screen 3 times running, with the screen not changing, is a confusion note.
    const key = action.trim().toLowerCase() + '|' + before.lines.join('\n');
    this.same = key === this.lastKey ? this.same + 1 : 1; this.lastKey = key;
    if (a.kind === 'tap' && after.lines.join('\n') === before.lines.join('\n')) told.push('Nothing on screen seemed to change.');
    if (this.same === 3) { const n = this.note(`Stuck (noted by the tester tool): "${action}" three times on the same screen and nothing changed.`); rec.stuckNote = n; }
    if (this.errors.length > errorsBefore) rec.pageErrors = this.errors.slice(errorsBefore);
    this.prevSeen = before; this.screen = after;
    rec.after = after.screenshot; rec.told = told; rec.gameSecs = +g.secs.toFixed(1);
    fs.appendFileSync(F.steps, JSON.stringify(rec) + '\n');
    const cap = this.capHit(); if (cap) this.stopped = cap;
    return { text: [...told, '', screenText(after, { withShot: this.meta.mode === 'agent' }), '', this.status() + (cap ? ` Time is up (${cap}): write any last notes now.` : '')].join('\n'), over: !!cap, screen: after };
  }
  finish(extra) {
    const run = {
      ...this.meta, endedAt: new Date().toISOString(), steps: this.step, gameMinutes: +(this.game.secs / 60).toFixed(1),
      notes: this.noteN, stopReason: this.stopped || extra.stopReason || 'stopped by the player', caps: CAPS, pageErrors: this.errors.slice(0, 20), ...extra, prompt: BRIEF
    };
    fs.writeFileSync(F.run, JSON.stringify(run, null, 1));
    return run;
  }
}

// ---------------- run mode: the Messages API plays ----------------
const TOOL = {
  name: 'act', description: 'Do one thing in the game, and add any notes you have right now.', strict: true,
  input_schema: { type: 'object', additionalProperties: false, required: ['notes', 'action', 'why'], properties: {
    notes: { type: 'array', items: { type: 'string' }, description: 'New one-line notes about what you just noticed (empty if none).' },
    action: { type: 'string', description: 'tap <label> | tap <label> x3 | wait <seconds> | read | scroll down | scroll up' },
    why: { type: 'string', description: 'A few words: why this action.' }
  } }
};
async function callModel(model, effort, messages) {
  const res = await fetch((process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com') + '/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: 16000, system: BRIEF, tools: [TOOL], tool_choice: { type: 'auto' },
      thinking: { type: 'adaptive' }, output_config: { effort }, cache_control: { type: 'ephemeral' }, messages })
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Messages API ${res.status}: ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}
function userTurn(text, shot) {
  const content = [];
  if (shot && fs.existsSync(shot)) content.push({ type: 'image', source: { type: 'base64', media_type: 'image/png', data: fs.readFileSync(shot).toString('base64') } });
  content.push({ type: 'text', text });
  return content;
}
async function runMode() {
  const dry = flag('dry'), model = opt('model', 'claude-opus-5-5'), effort = opt('effort', 'high');
  if (!dry && !process.env.ANTHROPIC_API_KEY) die('no ANTHROPIC_API_KEY: use start / act / stop with a Claude Code worker as the player (see the top of this file)');
  const meta = { mode: dry ? 'dry' : 'api', model: dry ? null : model, effort: dry ? null : effort, seed: numOpt('seed', 1), html: opt('html', 'dist/lanternfall.html'), startedAt: new Date().toISOString() };
  const run = new Run(meta), game = new Game({ html: opt('html'), seed: meta.seed, landscape: flag('landscape') });
  const tokens = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
  let screen = await run.begin(game), stopReason = null;
  const messages = [{ role: 'user', content: userTurn('The game has just opened.\n\n' + screenText(screen, { withShot: false }) + '\n\n' + run.status(), screen.screenshot) }];
  try {
    for (;;) {
      let action, why, notes;
      if (dry) { const b = screen.buttons.find(x => !x.disabled); action = b ? `tap ${b.label}` : 'wait 5'; why = 'dry run'; notes = []; }
      else {
        const r = await callModel(model, effort, messages);
        const u = r.usage || {}; tokens.input += u.input_tokens || 0; tokens.output += u.output_tokens || 0;
        tokens.cacheRead += u.cache_read_input_tokens || 0; tokens.cacheWrite += u.cache_creation_input_tokens || 0;
        messages.push({ role: 'assistant', content: r.content });
        if (r.stop_reason === 'refusal') { stopReason = 'model refused'; break; }
        const use = r.content.find(b => b.type === 'tool_use');
        if (!use) { messages.push({ role: 'user', content: [{ type: 'text', text: 'Use the act tool to do one thing.' }] }); continue; }
        ({ action, why, notes } = use.input);
        const out = await run.act(action, why, notes || []);
        messages.push({ role: 'user', content: [{ type: 'tool_result', tool_use_id: use.id, content: userTurn(out.text, out.screen && out.screen.screenshot) }] });
        const usd = usdOf(model, tokens);
        if (usd !== null && usd >= CAPS.usd) { stopReason = `cost cap ($${CAPS.usd})`; break; }
        if (out.over) { stopReason = run.stopped; break; }
        screen = out.screen || screen;
        if (run.step % 10 === 0) console.log(`step ${run.step}, ${run.clock()} played, ${run.noteN} notes, $${usd}`);
        continue;
      }
      const out = await run.act(action, why, notes); screen = out.screen || screen;
      if (out.over) { stopReason = run.stopped; break; }
    }
  } finally {
    const r = run.finish({ stopReason, tokens, usd: dry ? 0 : usdOf(model, tokens) });
    await game.close();
    console.log(`done: ${r.steps} steps, ${r.gameMinutes} game minutes, ${r.notes} notes, ${r.stopReason}. tokens in ${tokens.input} (+${tokens.cacheRead} cached, ${tokens.cacheWrite} cache writes), out ${tokens.output}; $${r.usd}. ${OUT}`);
  }
}

// ---------------- agent mode: a background game a worker drives one command at a time ----------------
async function serve() {
  const meta = { mode: 'agent', seed: numOpt('seed', 1), html: opt('html', 'dist/lanternfall.html'), startedAt: new Date().toISOString() };
  const run = new Run(meta), game = new Game({ html: opt('html'), seed: meta.seed, landscape: flag('landscape') });
  const first = await run.begin(game);
  let queue = Promise.resolve();   // one action at a time
  const srv = http.createServer((req, res) => {
    let body = ''; req.on('data', d => { body += d; });
    req.on('end', () => { queue = queue.then(async () => {
      const q = body ? JSON.parse(body) : {}; let out;
      try {
        if (req.url === '/first') out = { text: 'The game has just opened.\n\n' + screenText(first, { withShot: true }) + '\n\n' + run.status() };
        else if (req.url === '/act') out = await run.act(q.action, q.why, q.notes || []);
        else if (req.url === '/note') out = { text: `note ${run.note(q.note)} written.` };
        else if (req.url === '/stop') {
          const t = q.tokens || null, r = run.finish({ model: q.model || null, tokens: t, usd: q.usd ?? (t && q.model ? usdOf(q.model, t) : null), stopReason: run.stopped || 'stopped by the player' });
          out = { text: `done: ${r.steps} steps, ${r.gameMinutes} game minutes, ${r.notes} notes, ${r.stopReason}; $${r.usd}. ${OUT}` };
          res.end(JSON.stringify(out)); await game.close(); srv.close(); fs.rmSync(F.server, { force: true }); return;
        } else out = { text: 'unknown request' };
      } catch (e) { out = { text: 'error: ' + (e && e.message || e) }; }
      res.end(JSON.stringify(out));
    }); });
  });
  srv.listen(0, '127.0.0.1', () => fs.writeFileSync(F.server, JSON.stringify({ port: srv.address().port, pid: process.pid })));
}
async function ask(url, body) {
  if (!fs.existsSync(F.server)) die(`no game running for ${OUT}: start one first`);
  const { port } = JSON.parse(fs.readFileSync(F.server, 'utf8'));
  const r = await fetch(`http://127.0.0.1:${port}${url}`, { method: 'POST', body: JSON.stringify(body || {}) });
  return (await r.json()).text;
}
async function start() {
  if (fs.existsSync(F.server)) die(`a game is already running for ${OUT} (stop it first)`);
  fs.mkdirSync(OUT, { recursive: true });
  const log = fs.openSync(path.join(OUT, 'server.log'), 'a');
  const child = spawn(process.execPath, [new URL(import.meta.url).pathname, '__serve', ...argv.slice(1)], { detached: true, stdio: ['ignore', log, log] });
  child.unref();
  for (let i = 0; i < 240 && !fs.existsSync(F.server); i++) await new Promise(r => setTimeout(r, 250));
  if (!fs.existsSync(F.server)) die(`the game did not open; see ${path.join(OUT, 'server.log')}`);
  console.log(BRIEF + '\n\n----\n' + await ask('/first'));
}

const actionArg = () => argv.slice(1).filter((a, i, all) => !a.startsWith('--') && !(i > 0 && all[i - 1].startsWith('--'))).join(' ');
const tokensArg = () => opt('tokens-in') === undefined && opt('tokens-out') === undefined ? null
  : { input: numOpt('tokens-in', 0), output: numOpt('tokens-out', 0), cacheRead: numOpt('cache-read', 0), cacheWrite: numOpt('cache-write', 0) };

if (cmd === 'run') await runMode();
else if (cmd === '__serve') await serve();
else if (cmd === 'start') await start();
else if (cmd === 'act') console.log(await ask('/act', { action: actionArg(), why: opt('why', ''), notes: opts('note') }));
else if (cmd === 'note') console.log(await ask('/note', { note: actionArg() }));
else if (cmd === 'stop') console.log(await ask('/stop', { model: opt('model', null), tokens: tokensArg(), usd: opt('usd') !== undefined ? numOpt('usd', 0) : undefined }));
else die('commands: run, start, act, note, stop (see the top of tools/playtest-human.mjs)');
