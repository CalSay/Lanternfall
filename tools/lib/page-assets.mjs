// The one route helper for a built page and its asset files (card asset-build; docs/design/hosting.md 5). The split build
// (node tools/build.mjs --split) names its art data files as <script src="assets/NAME">; this serves them from the assets/
// folder beside the page. The inline page names none, so for it the helper serves the page alone, as the tools always have.
// Walk, eyes, playtest and check route through routePage; perf and serve through assetFor on their own http servers.
import fs from 'node:fs';
import path from 'node:path';

const JS = 'text/javascript; charset=utf-8', HTML = 'text/html; charset=utf-8';

// Map of 'assets/NAME' -> Buffer for every asset the page names. A named file that is missing throws (rebuild with --split).
// `files` ({ name: text }) serves a build held in memory instead of reading the folder (check.mjs's split section).
export function pageAssets(htmlFile, html = fs.readFileSync(htmlFile, 'utf8'), files = null) {
  const out = new Map();
  for (const m of html.matchAll(/<script src="(assets\/[^"/]+)"/g)) {
    const rel = m[1], name = rel.slice('assets/'.length);
    if (files) { if (!(name in files)) throw new Error(`${rel} is not in this build`); out.set(rel, Buffer.from(files[name])); continue; }
    const file = path.join(path.dirname(htmlFile), rel);
    if (!fs.existsSync(file)) throw new Error(`${path.relative(process.cwd(), file)} is missing: run node tools/build.mjs --split`);
    out.set(rel, fs.readFileSync(file));
  }
  return out;
}

// The asset for a request path ('/assets/NAME' under the page's origin), or null.
export const assetFor = (assets, pathname) => { try { return assets.get(decodeURIComponent(pathname).replace(/^\//, '')) || null; } catch (e) { return null; } };
export const ASSET_TYPE = JS;

// Playwright: serve `html` at `origin` and its assets under it; every other request goes to `other` (default: refused, so
// nothing leaves the machine).
export function routePage(page, origin, html, assets = new Map(), other = r => r.abort()) {
  const base = new URL(origin);
  return page.route('**/*', r => {
    const url = r.request().url();
    if (url === origin) return r.fulfill({ status: 200, contentType: HTML, body: html });
    const u = new URL(url), body = u.origin === base.origin ? assetFor(assets, u.pathname) : null;
    return body ? r.fulfill({ status: 200, contentType: JS, body }) : other(r);
  });
}
