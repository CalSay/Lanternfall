// tools/site.mjs: the standalone web build for testers (Netlify). Wraps dist/lanternfall.html (the
// Artifact page, which has no doctype/head) into a normal page in standards mode, and writes a tiny
// Netlify site to the given folder (default site/): index.html, _headers (always fetch the newest page)
// and netlify.toml (no build step: the page is built locally by tools/build.mjs first).
import fs from 'fs'; import path from 'path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.resolve(process.argv[2] || path.join(ROOT, 'site'));
const page = fs.readFileSync(path.join(ROOT, 'dist', 'lanternfall.html'), 'utf8');
fs.mkdirSync(out, { recursive: true });

// "Tell us" box (card tell-us-form). This is the only place in the repo that talks to a network: the Artifact page gets none.
// 1) a hidden static form so Netlify's form detection finds it at deploy; no name, email or user-agent field, plus a honeypot;
// 2) window.LF_SITE, which the game's Send feedback panel uses to show "Send to the team".
const TELL_US_FIELDS = ['note', 'zone', 'level', 'minutes', 'build', 'screen', 'errors'];
let sha = process.env.COMMIT_REF || process.env.GITHUB_SHA || '';
if (!sha) { try { sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch (e) {} }
const build = sha.slice(0, 7);
const tellForm =
  '<form name="tell-us" method="POST" data-netlify="true" netlify-honeypot="bot-field" hidden>' +
  TELL_US_FIELDS.map(f => (f === 'note' || f === 'errors' ? '<textarea name="' + f + '"></textarea>' : '<input type="text" name="' + f + '">')).join('') +
  '<input type="text" name="bot-field"></form>\n';
const tellScript =
  '<script>window.LF_SITE=' + JSON.stringify({ build }) + ';window.LF_SITE.send=function(f){try{' +
  'var b=new URLSearchParams();b.set("form-name","tell-us");' +
  TELL_US_FIELDS.map(k => 'b.set("' + k + '",String((f&&f.' + k + ')==null?"":f.' + k + ').slice(0,' + (k === 'note' || k === 'errors' ? 2000 : 60) + '));').join('') +
  'return fetch("/",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:b.toString()})' +
  '.then(function(r){return !!r.ok},function(){return false})}catch(e){return Promise.resolve(false)}}</script>\n';
fs.writeFileSync(path.join(out, 'index.html'),
  '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' + tellScript + page + '\n' + tellForm);
fs.writeFileSync(path.join(out, '_headers'), '/*\n  Cache-Control: no-cache\n');
fs.writeFileSync(path.join(out, 'netlify.toml'), '[build]\n  publish = "."\n  command = ""\n');
console.log('site written to ' + out);
