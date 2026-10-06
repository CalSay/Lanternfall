---
name: feature-module
description: Scaffold a new Lanternfall feature as its own files (55-<name>.js logic, 75-<name>-ui.js UI, optional CSS) using the extension API. Use when adding a new mechanic or panel.
---

1. Read the Extension API and Module map in `docs/ARCHITECTURE.md`. Pick filename numbers that load after the files you depend on and before the UI that consumes you.
2. Logic goes in `src/js/55-<name>.js` (no DOM): `registerState('<key>', { v: 1, ... })`, `on('<event>', ...)`, `addModifier(...)`, `onTick(...)`. Expose a small API on a namespaced object, not loose globals (all JS shares one scope; avoid top-level name collisions; grep first).
3. UI goes in `src/js/75-<name>-ui.js` using `registerSection(tabId, { id, title, mount, update })`. Styles in `src/styles/60-<name>.css` if needed.
4. Add one check section in `tools/check.mjs` marked with the task id, before the "removed systems (W2-C)" section.
5. Add one row per new file to the module table in `docs/ARCHITECTURE.md`; do not rewrite sections.
6. Run the `verify` skill.
