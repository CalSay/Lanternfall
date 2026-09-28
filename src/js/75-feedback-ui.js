// 75-feedback-ui: "Send feedback" panel in the Journal. Records playtester reports
// with uncaught errors, progress state, screen info. Installs global error handlers.
{
  // Install error handlers early, wrapped in try/catch so they never crash the page
  try {
    window.addEventListener('error', (e) => {
      try {
        if (typeof captureError === 'function') {
          captureError(e.message || String(e), e.filename || '', e.lineno || 0, e.colno || 0);
        }
      } catch (err) {}
    });
  } catch (e) {}

  try {
    window.addEventListener('unhandledrejection', (e) => {
      try {
        if (typeof captureError === 'function') {
          const reason = e.reason || {};
          const msg = reason.message || String(reason);
          captureError(msg, '', 0, 0);
        }
      } catch (err) {}
    });
  } catch (e) {}

  let feedbackOpen = false;
  const feedbackState = { note: '' };

  // Build the feedback report: note + build version + date + screen + agent + progress + errors
  function buildReport(note) {
    const lines = [];
    if (note) lines.push('Tester note:\n' + note.trim());
    lines.push(''); // blank line

    // Build version if it exists
    const ver = typeof gameVersion === 'string' ? gameVersion : '';
    if (ver) lines.push('Build: ' + ver);

    // Date and time
    const d = new Date();
    const dateStr = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const timeStr = d.toLocaleTimeString();
    lines.push('Date: ' + dateStr + ' ' + timeStr);

    // Screen size and user agent (cheap to read, no setup)
    lines.push('Screen: ' + window.innerWidth + 'x' + window.innerHeight);
    const ua = navigator.userAgent;
    lines.push('User-Agent: ' + ua.slice(0, 150));

    lines.push(''); // blank line

    // Key progress numbers (level, max zone, region, number of heroes)
    if (typeof S === 'object' && S) {
      const region = typeof regionOf === 'function' ? regionOf(S.maxZone) : null;
      const regionName = region && region.name ? region.name : 'unknown';
      const heroCount = S.party && Array.isArray(S.party.field) ? S.party.field.length + 1 : 1; // hero + field
      lines.push('Progress: Level ' + (S.L || 1) + ', Zone ' + (S.maxZone || 1) + ', ' + regionName);
      lines.push('Heroes: ' + heroCount);
      const act = S.activity || 'idle';
      lines.push('Activity: ' + act);
    }

    lines.push(''); // blank line

    // Errors from the capture module
    const errs = typeof errorReport === 'function' ? errorReport() : '';
    if (errs) lines.push(errs);

    return lines.join('\n');
  }

  // Copy report to clipboard with fallback
  function copyToClipboard(text, onSuccess) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text)
        .then(() => { if (onSuccess) onSuccess(); })
        .catch(() => { fallbackCopy(text, onSuccess); });
    } else {
      fallbackCopy(text, onSuccess);
    }
  }

  // Fallback: create a textarea, select, copy
  function fallbackCopy(text, onSuccess) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok && onSuccess) onSuccess();
    } catch (e) {}
  }

  // Register the feedback section in the stats/journal area
  registerSection('log', {
    id: 'feedback', title: 'Send feedback',
    mount(sec) {
      const panel = el('div', 'feedback-panel');

      // Text area for the tester's note
      const noteLabel = el('label', null, 'Your note (optional):');
      const noteArea = el('textarea', 'feedback-note');
      noteArea.placeholder = 'Describe the issue or feature...';
      noteArea.rows = 4;
      noteArea.addEventListener('input', (e) => { feedbackState.note = e.target.value; });

      // Buttons row
      const buttons = el('div', 'feedback-buttons');

      const copyBtn = el('button', 'feedback-copy', 'Copy report');
      copyBtn.type = 'button';
      copyBtn.addEventListener('click', () => {
        const report = buildReport(feedbackState.note);
        copyToClipboard(report, () => {
          const orig = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = orig; }, 2000);
        });
      });

      const clearBtn = el('button', 'feedback-clear', 'Clear errors');
      clearBtn.type = 'button';
      clearBtn.addEventListener('click', () => {
        if (typeof clearErrors === 'function') clearErrors();
        ui(true);
      });

      buttons.append(copyBtn, clearBtn);

      // Info text
      const info = el('p', 'note', 'The report includes your note, the build version, date, screen size, user agent, your progress (level, zone, region, heroes), and any recent errors. Copy it and send it wherever you file bug reports.');

      panel.append(noteLabel, noteArea, buttons, info);
      sec.append(panel);
    },
    update() {
      // Keep the note in sync (in case S changes or something resets the field)
      const ta = $('log').querySelector('.feedback-note');
      if (ta && ta.value !== feedbackState.note) ta.value = feedbackState.note;
    }
  });
}
