// 75-savecode-ui: "Save code" panel in the Journal, next to Send feedback (SAVE1).
// Export: a compact text code of the current save, to copy or download.
// Import: paste a code, check it, see a short summary, then confirm to replace the save.
{
  const st = { note: '', armed: false, checkedCode: '', summary: null, error: '', importErr: '' };

  function currentCode() {
    try { return encodeSave(S); } catch (e) { return ''; }
  }

  function copyToClipboard(text, onSuccess, onFail) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).then(() => { if (onSuccess) onSuccess(); }, () => fallbackCopy(text, onSuccess, onFail));
    } else fallbackCopy(text, onSuccess, onFail);
  }
  function fallbackCopy(text, onSuccess, onFail) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) { if (onSuccess) onSuccess(); } else if (onFail) onFail();
    } catch (e) { if (onFail) onFail(); }
  }

  function downloadCode(text) {
    try {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = el('a'); a.href = url;
      const d = new Date(), pad = n => String(n).padStart(2, '0');
      a.download = `lanternfall-save-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.txt`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => { try { URL.revokeObjectURL(url); } catch (e) {} }, 4000);
      return true;
    } catch (e) { return false; }
  }

  function resetImport() { st.armed = false; st.checkedCode = ''; st.summary = null; st.error = ''; st.importErr = ''; }

  function doImport(data, box) {
    try {
      storage.set(KEY, JSON.stringify(data));
    } catch (e) {
      st.importErr = "Couldn't save that to this device. Nothing was changed.";
      resetImport(); renderImport(box);
      return;
    }
    // Go through the normal load path so fresh()/registerState defaults merge in, then get a
    // clean run of every system rather than patch each one's caches by hand.
    try { location.reload(); return; } catch (e) {}
    try {
      loadSave();
      closeMenu();
      ui(true);
      toast('Save loaded.', 'good');
    } catch (e) {
      toast('Save loaded. Reload the page if anything looks off.', 'good');
    }
    resetImport(); renderImport(box);
  }

  function renderImport(box) {
    box.textContent = '';
    if (st.importErr) box.append(el('p', 'note warn', st.importErr));
    if (!st.summary) {
      if (st.error) box.append(el('p', 'note warn', st.error));
      return;
    }
    const s = st.summary;
    const card = el('div', 'savecode-summary');
    card.append(el('p', null, `${s.name} - Level ${s.level}, Zone ${s.maxZone}, ${s.region}`));
    card.append(el('p', 'note', `${s.heroes} hero${s.heroes === 1 ? '' : 'es'}${s.savedAt ? ' - saved ' + s.savedAt : ''}`));
    box.append(card);
    if (!st.armed) {
      const go = el('button', 'savecode-replace', 'Replace my save'); go.type = 'button';
      go.addEventListener('click', () => { st.armed = true; renderImport(box); });
      box.append(go);
    } else {
      box.append(el('p', 'note warn', 'This throws away your current save and puts this one in its place. This cannot be undone.'));
      const row = el('div', 'feedback-buttons');
      const yes = el('button', 'savecode-replace', 'Yes, replace it'); yes.type = 'button';
      yes.addEventListener('click', () => doImport(st.summary._data, box));
      const no = el('button', 'feedback-clear', 'Cancel'); no.type = 'button';
      no.addEventListener('click', () => { st.armed = false; renderImport(box); });
      row.append(yes, no); box.append(row);
    }
  }

  // Detect if running inside an iframe (e.g., claude.ai artifact viewer)
  function isInFrame() {
    try { return window.self !== window.top; } catch (e) { return true; }
  }

  registerSection('log', {
    id: 'savecode', title: 'Save code',
    mount(sec) {
      const panel = el('div', 'feedback-panel savecode-panel');

      panel.append(el('p', 'note', 'Copy a code of your save to keep as a backup, move to another device, or hand to someone testing the game.'));

      const exportButtons = el('div', 'feedback-buttons');
      const copyBtn = el('button', 'feedback-copy', 'Copy save code'); copyBtn.type = 'button';
      const dlBtn = el('button', 'feedback-clear', 'Download file'); dlBtn.type = 'button';
      const exportNote = el('p', 'note');
      const frameTip = el('p', 'note', 'Tip: copy the code and paste it somewhere safe.');

      const inFrame = isInFrame();
      if (inFrame) dlBtn.style.display = 'none';

      copyBtn.addEventListener('click', () => {
        const code = currentCode();
        if (!code) { exportNote.textContent = "Couldn't build a save code."; return; }
        copyToClipboard(code, () => {
          const orig = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          exportNote.textContent = '';
          setTimeout(() => { copyBtn.textContent = orig; }, 2000);
        }, () => {
          exportNote.textContent = "Couldn't copy automatically. Here's the code to copy by hand:";
          const ta = el('textarea', 'savecode-fallback'); ta.readOnly = true; ta.rows = 4; ta.value = code;
          exportNote.after(ta);
          ta.focus(); ta.select();
        });
      });
      dlBtn.addEventListener('click', () => {
        const code = currentCode();
        if (!code) { exportNote.textContent = "Couldn't build a save code."; return; }
        if (!downloadCode(code)) exportNote.textContent = "Couldn't download a file here. Use Copy save code instead.";
        else exportNote.textContent = '';
      });
      exportButtons.append(copyBtn, dlBtn);
      panel.append(exportButtons, exportNote);
      if (inFrame) panel.append(frameTip);

      panel.append(el('div', 'savecode-sep'));

      panel.append(el('label', null, 'Have a save code? Paste it here:'));
      const importArea = el('textarea', 'feedback-note savecode-import');
      importArea.placeholder = 'LF1:...';
      importArea.rows = 4;
      importArea.addEventListener('input', (e) => { st.note = e.target.value; resetImport(); renderImport(importBox); });
      panel.append(importArea);

      const importButtons = el('div', 'feedback-buttons');
      const checkBtn = el('button', 'feedback-clear', 'Check'); checkBtn.type = 'button';
      checkBtn.addEventListener('click', () => {
        const res = decodeSave(st.note);
        if (!res.ok) { st.error = res.error; st.summary = null; st.armed = false; renderImport(importBox); return; }
        st.error = ''; st.armed = false; st.importErr = '';
        st.summary = summarizeSave(res.data); st.summary._data = res.data;
        renderImport(importBox);
      });
      importButtons.append(checkBtn);
      panel.append(importButtons);

      const importBox = el('div', 'savecode-import-result');
      panel.append(importBox);

      sec.append(panel);
    },
    update() {
      const root = $('log'); if (!root) return;
      const ta = root.querySelector('.savecode-import');
      if (ta && document.activeElement !== ta && ta.value !== st.note) ta.value = st.note;
    }
  });
}
