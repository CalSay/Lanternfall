// 05-platform: browser-only adapters for core. The Node tools skip this file and
// install their own (in-memory) storage instead.
useStorage({
  get: key => { try { return localStorage.getItem(key); } catch (e) { return null; } },
  set: (key, value) => { try { localStorage.setItem(key, value); } catch (e) {} }
});
// The inline page's loading screen (src/shell.html #lfLoad, card loading-screen) goes at boot (90-boot), or at the first
// uncaught error before that, so a page that failed to boot never hides behind "Loading the game".
if (typeof addEventListener === 'function') addEventListener('error', () => { const el = typeof document === 'object' && document.getElementById('lfLoad'); if (el) el.remove(); });
