// 75-savecode-ui: "Save code" panel in the Journal, next to Send feedback (SAVE1).
// Export: a compact text code of the current save, to copy or download.
// Import: paste a code, check it, see a short summary, then confirm to replace the save.
{
  const st = { note: '', armed: false, checkedCode: '', summary: null, error: '', importErr: '', pendingReload: null };
  let importArea, checkBtn, copyBtn, dlBtn, importBox, exportNote, manualCopy;

  function currentCode() {
    try { return encodeSave(S); } catch (e) { return ''; }
  }

  function copyToClipboard(text, onSuccess, onFail) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try { navigator.clipboard.writeText(text).then(() => { if (onSuccess) onSuccess(); }, () => fallbackCopy(text, onSuccess, onFail)); }
      catch (e) { fallbackCopy(text, onSuccess, onFail); }
    } else fallbackCopy(text, onSuccess, onFail);
  }
  function fallbackCopy(text, onSuccess, onFail) {
    let ta;
    try {
      ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy');
      if (ok) { if (onSuccess) onSuccess(); } else if (onFail) onFail();
    } catch (e) { if (onFail) onFail(); }
    finally { if (ta) ta.remove(); }
  }

  function showManualCopy(code, after) {
    if (!manualCopy) {
      const label = el('label', 'savecode-manual', 'Save code to copy by hand');
      const ta = el('textarea', 'savecode-fallback'); ta.readOnly = true; ta.rows = 4;
      ta.setAttribute('aria-label', 'Save code to copy by hand');
      label.append(ta); manualCopy = label;
    }
    after.after(manualCopy);
    const ta = manualCopy.querySelector('textarea'); ta.value = code; ta.focus(); ta.select();
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

  function syncControls() {
    const pending = !!st.pendingReload;
    for (const control of [importArea, checkBtn, copyBtn, dlBtn]) if (control) control.disabled = pending;
  }

  function restoreCurrentGame() {
    const p = st.pendingReload;
    if (!p) return false;
    try {
      p.adapter.set(KEY, p.backupRaw);
      if (p.adapter.get(KEY) !== p.backupRaw) throw new Error('Save readback did not match.');
      useStorage(p.adapter);
      saveAdopt();   // save-two-tabs: this tab wrote the stored copy, so its stamp is not another tab's
      st.pendingReload = null;
      st.armed = false;
      st.importErr = 'Your current game is saved again.';
      if (manualCopy) { manualCopy.remove(); manualCopy = null; }
      syncControls(); renderImport(importBox);
      return true;
    } catch (e) {
      st.importErr = 'Could not verify the restore. Keep this page open and try again. Your current game is still running here.';
      renderImport(importBox);
      return false;
    }
  }

  function retryReload() {
    const p = st.pendingReload;
    if (!p || !p.verified) return;
    try {
      if (p.adapter.get(KEY) !== p.candidateRaw) {
        p.verified = false;
        st.importErr = 'The imported save is no longer on this device. Restore your current game before leaving.';
        renderImport(importBox);
        return;
      }
      st.importErr = 'Reload requested. If this page stays open, retry or restore your current game.';
      renderImport(importBox);
      location.reload();
    } catch (e) {
      st.importErr = 'Reload was blocked. Retry it, or restore your current game.';
      renderImport(importBox);
    }
  }

  function copyPendingBackup() {
    const p = st.pendingReload;
    if (!p) return;
    let code;
    try { code = encodeSave(JSON.parse(p.backupRaw)); }
    catch (e) {
      st.importErr = 'Could not build a backup code. Keep this page open and retry restoring your game.';
      renderImport(importBox); return;
    }
    copyToClipboard(code, () => {
      if (!st.pendingReload) return;
      st.importErr = 'Backup code copied. Keep it somewhere safe.';
      if (manualCopy) { manualCopy.remove(); manualCopy = null; }
      renderImport(importBox);
    }, () => {
      if (!st.pendingReload) return;
      st.importErr = 'Automatic copy failed. Select the backup code below and copy it.';
      renderImport(importBox);
      showManualCopy(code, importBox);
    });
  }

  function doImport(data, box) {
    if (st.pendingReload) return;
    if (st.checkedCode !== st.note) {
      st.error = 'The code changed. Check it again before replacing your save.';
      st.armed = false; st.summary = null; renderImport(box); return;
    }
    let checked;
    try { checked = validateSave(data); } catch (e) { checked = { ok: false, error: 'Could not check this save again. Try pasting the code once more.' }; }
    if (!checked.ok) {
      st.error = checked.error; st.armed = false; st.summary = null; renderImport(box); return;
    }
    let backupRaw, candidateRaw, priorRaw, adapter;
    try {
      backupRaw = JSON.stringify(S);
      candidateRaw = JSON.stringify(bjImport(checked.data));   // Tavern Blackjack: the hand in play goes, today's lower net stays (57t)
      if (!backupRaw || !candidateRaw) throw new Error('Snapshot failed.');
      adapter = storage;
      priorRaw = adapter.get(KEY);
    } catch (e) {
      st.importErr = "Couldn't prepare a safe copy of your current game. No import was started.";
      renderImport(box);
      return;
    }
    let verified = false;
    try {
      adapter.set(KEY, candidateRaw);
      verified = adapter.get(KEY) === candidateRaw;
    } catch (e) { /* The adapter may also swallow a failed write. Readback decides. */ }
    saveAdopt();   // save-two-tabs: the imported copy is this tab's own until the reload
    st.pendingReload = { adapter, priorRaw, backupRaw, candidateRaw, verified };
    useStorage({ get: key => adapter.get(key), set: (key, value) => { if (key !== KEY) adapter.set(key, value); } });
    syncControls();
    if (!verified) {
      st.importErr = 'Could not verify the imported save. Restoring your current game.';
      if (restoreCurrentGame()) st.importErr = 'Import failed. Your current game was saved again.';
      renderImport(box);
      return;
    }
    st.importErr = 'Imported save written and checked. Reload to start it, or restore your current game.';
    retryReload();
  }

  function renderImport(box) {
    box.textContent = '';
    if (st.importErr) box.append(el('p', 'note warn', st.importErr));
    if (st.error) box.append(el('p', 'note warn', st.error));
    if (st.pendingReload) {
      const row = el('div', 'feedback-buttons');
      if (st.pendingReload.verified) {
        const retry = el('button', 'savecode-replace', 'Retry reload'); retry.type = 'button';
        retry.addEventListener('click', retryReload); row.append(retry);
      }
      const restore = el('button', 'feedback-clear', st.pendingReload.verified ? 'Cancel and restore my game' : 'Restore my game');
      restore.type = 'button'; restore.addEventListener('click', restoreCurrentGame); row.append(restore);
      const backup = el('button', 'feedback-copy', 'Copy backup of my game');
      backup.type = 'button'; backup.addEventListener('click', copyPendingBackup); row.append(backup);
      box.append(row);
      queueMicrotask(() => { if (st.pendingReload && !(manualCopy && manualCopy.contains(document.activeElement))) row.querySelector('button')?.focus(); });
      return;
    }
    if (!st.summary) return;
    const s = st.summary;
    const card = el('div', 'savecode-summary');
    card.append(el('p', null, `${s.name} · ${s.hero || 'Solo hero'} Lv ${s.level} · Zone ${s.maxZone}, ${s.region}`));
    if (s.savedAt) card.append(el('p', 'note', `Saved ${s.savedAt}`));
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
      copyBtn = el('button', 'feedback-copy', 'Copy save code'); copyBtn.type = 'button';
      dlBtn = el('button', 'feedback-clear', 'Download file'); dlBtn.type = 'button';
      exportNote = el('p', 'note'); exportNote.setAttribute('role', 'status');
      const frameTip = el('p', 'note', 'Tip: copy the code and paste it somewhere safe.');

      const inFrame = isInFrame();
      if (inFrame) dlBtn.style.display = 'none';

      copyBtn.addEventListener('click', () => {
        if (st.pendingReload) return;
        const code = currentCode();
        if (!code) { exportNote.textContent = "Couldn't build a save code."; return; }
        copyToClipboard(code, () => {
          if (st.pendingReload) return;
          const orig = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          exportNote.textContent = '';
          if (manualCopy) { manualCopy.remove(); manualCopy = null; }
          setTimeout(() => { copyBtn.textContent = orig; }, 2000);
        }, () => {
          if (st.pendingReload) return;
          exportNote.textContent = "Couldn't copy automatically. Here's the code to copy by hand:";
          showManualCopy(code, exportNote);
        });
      });
      dlBtn.addEventListener('click', () => {
        if (st.pendingReload) return;
        const code = currentCode();
        if (!code) { exportNote.textContent = "Couldn't build a save code."; return; }
        if (!downloadCode(code)) exportNote.textContent = "Couldn't download a file here. Use Copy save code instead.";
        else exportNote.textContent = '';
      });
      exportButtons.append(copyBtn, dlBtn);
      panel.append(exportButtons, exportNote);
      if (inFrame) panel.append(frameTip);

      panel.append(el('div', 'savecode-sep'));

      const importLabel = el('label', null, 'Have a save code? Paste it here:'); importLabel.htmlFor = 'savecode-import-area';
      panel.append(importLabel);
      importArea = el('textarea', 'feedback-note savecode-import');
      importArea.id = 'savecode-import-area';
      importArea.placeholder = 'LF1:...';
      importArea.rows = 4;
      if (typeof SAVECODE_LIMITS === 'object' && SAVECODE_LIMITS && Number.isFinite(SAVECODE_LIMITS.codeChars)) importArea.maxLength = SAVECODE_LIMITS.codeChars;
      importArea.addEventListener('input', (e) => { if (st.pendingReload) return; st.note = e.target.value; resetImport(); renderImport(importBox); });
      panel.append(importArea);

      const importButtons = el('div', 'feedback-buttons');
      checkBtn = el('button', 'feedback-clear', 'Check'); checkBtn.type = 'button';
      checkBtn.addEventListener('click', () => {
        if (st.pendingReload) return;
        const res = decodeSave(st.note);
        if (!res.ok) { st.error = res.error; st.summary = null; st.armed = false; renderImport(importBox); return; }
        st.error = ''; st.armed = false; st.importErr = '';
        st.checkedCode = st.note;
        st.summary = summarizeSave(res.data); st.summary._data = res.data;
        renderImport(importBox);
      });
      importButtons.append(checkBtn);
      panel.append(importButtons);

      importBox = el('div', 'savecode-import-result'); importBox.setAttribute('aria-live', 'polite');
      panel.append(importBox);

      sec.append(panel);
      syncControls();
    },
    update() {
      const root = $('log'); if (!root) return;
      const ta = root.querySelector('.savecode-import');
      if (ta && document.activeElement !== ta && ta.value !== st.note) ta.value = st.note;
    }
  });
}
