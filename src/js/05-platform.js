// 05-platform: browser-only adapters for core. The Node tools skip this file and
// install their own (in-memory) storage instead.
useStorage({
  get: key => { try { return localStorage.getItem(key); } catch (e) { return null; } },
  set: (key, value) => { try { localStorage.setItem(key, value); } catch (e) {} }
});
