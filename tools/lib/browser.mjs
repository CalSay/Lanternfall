// Read-only browser discovery shared by check.mjs and perf.mjs. Never installs a browser.
// LF_PLAYWRIGHT accepts a package name or module folder; LF_CHROMIUM accepts an executable path.
// An explicit override is authoritative: a bad override reports why instead of silently falling back.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const requireHere = createRequire(import.meta.url);
const isFile = p => { try { return fs.statSync(p).isFile(); } catch { return false; } };
const readDir = p => { try { return fs.readdirSync(p); } catch { return []; } };

// The optional adapters let regression checks exercise Windows and Linux discovery on either host.
export function findBrowser({ env = process.env, platform = process.platform, requireModule = requireHere,
  fileExists = isFile, listDirectory = readDir, cwd = process.cwd() } = {}) {
  const overrideModule = (env.LF_PLAYWRIGHT || '').trim(), overrideExe = (env.LF_CHROMIUM || '').trim();
  const modules = overrideModule ? [overrideModule.startsWith('.') ? path.resolve(cwd, overrideModule) : overrideModule]
    : ['playwright', 'playwright-core', '/opt/node22/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright', '/usr/lib/node_modules/playwright'];
  let pw = null, modulePath = null, moduleError = '';
  for (const name of modules) {
    try {
      const candidate = requireModule(name);
      if (typeof candidate?.chromium?.launch !== 'function') throw new Error('module has no Chromium driver');
      pw = candidate; modulePath = name; break;
    } catch (e) { moduleError = e.code || e.message; }
  }
  if (!pw) return { pw: null, exe: null, modulePath, reason: overrideModule
    ? `LF_PLAYWRIGHT could not load ${overrideModule}: ${moduleError}` : 'Playwright not found; install playwright or set LF_PLAYWRIGHT' };

  if (overrideExe) {
    const exe = path.resolve(cwd, overrideExe);
    return { pw, exe: fileExists(exe) ? exe : null, modulePath,
      reason: fileExists(exe) ? '' : `LF_CHROMIUM is not a file: ${exe}` };
  }
  const candidates = [];
  try { const managed = pw.chromium.executablePath(); if (managed) candidates.push(managed); } catch {}
  // Preserve the coordinator's existing Linux layout, including versioned and unversioned installs.
  candidates.push('/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium',
    '/opt/pw-browsers/chromium/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux64/chrome');
  for (const dir of listDirectory('/opt/pw-browsers').filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => +b.slice(9) - +a.slice(9))) {
    candidates.push(`/opt/pw-browsers/${dir}/chrome-linux/chrome`, `/opt/pw-browsers/${dir}/chrome-linux64/chrome`, `/opt/pw-browsers/${dir}/chrome`);
  }
  if (platform === 'win32') {
    for (const root of [env.ProgramFiles || 'C:\\Program Files', env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)']) {
      candidates.push(path.win32.join(root, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        path.win32.join(root, 'Microsoft', 'Edge', 'Application', 'msedge.exe'));
    }
    if (env.LOCALAPPDATA) candidates.push(path.win32.join(env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'));
  }
  const exe = [...new Set(candidates)].find(fileExists) || null;
  return { pw, exe, modulePath, reason: exe ? '' : 'Chromium not found; install a Playwright browser or set LF_CHROMIUM' };
}
