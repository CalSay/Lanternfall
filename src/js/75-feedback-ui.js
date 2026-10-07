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

  const INFO_TEXT = 'The report includes your note, the build version, date, screen size, user agent, your progress (level, zone, region, heroes), and any recent errors. Copy it and send it wherever you file bug reports.';
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
      const heroCount = 1;
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

  // The web build (tools/site.mjs) sets window.LF_SITE with a send() that posts to Netlify Forms. The Artifact has none.
  function siteSend() { try { return window.LF_SITE && typeof window.LF_SITE.send === 'function' ? window.LF_SITE : null; } catch (e) { return null; } }

  // The fields for "Send to the team": the note plus where you are. No name, email or user agent.
  function teamFields(note) {
    const f = { note: (note || '').trim(), zone: '', level: '', minutes: '', build: '', screen: window.innerWidth + 'x' + window.innerHeight, errors: '' };
    try {
      if (typeof S === 'object' && S) { f.zone = String(S.maxZone || 1); f.level = String(S.L || 1); }
      // minutes stays blank: the save does not record play time
      const site = siteSend();
      f.build = (site && site.build) || (typeof gameVersion === 'string' ? gameVersion : '');
      f.errors = typeof errorReport === 'function' ? errorReport() : '';
    } catch (e) {}
    return f;
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

      // Web build only: send the note to the team.
      const sendBtn = el('button', 'feedback-send', 'Send to the team');
      sendBtn.type = 'button'; sendBtn.hidden = true;
      const sendMsg = el('p', 'note feedback-sent'); sendMsg.hidden = true; sendMsg.setAttribute('role', 'status');
      const tellHint = el('p', 'note feedback-tell', "Tell us what felt good or bad. Please don't include your name or email."); tellHint.hidden = true;
      let sending = false;
      sendBtn.addEventListener('click', () => {
        const site = siteSend();
        if (!site || sending) return;
        if (!(feedbackState.note || '').trim()) { sendMsg.hidden = false; sendMsg.textContent = 'Write a note first.'; try { sendMsg.scrollIntoView({ block: 'center' }); } catch (e) {} return; }
        sending = true; sendBtn.disabled = true; sendMsg.hidden = false; sendMsg.textContent = 'Sending...';
        let p;
        try { p = Promise.resolve(site.send(teamFields(feedbackState.note))); } catch (e) { p = Promise.resolve(false); }
        p.catch(() => false).then((ok) => {
          sending = false; sendBtn.disabled = false;
          sendMsg.textContent = ok ? 'Sent. Thank you.' : "Couldn't send. Copy it instead?";
          if (ok) { feedbackState.note = ''; noteArea.value = ''; }
          try { sendMsg.scrollIntoView({ block: 'center' }); } catch (e) {}   // short landscape sheet: keep the answer on screen
        });
      });

      buttons.append(sendBtn, copyBtn, clearBtn);

      // Info text
      const info = el('p', 'note feedback-info', INFO_TEXT);

      panel.append(noteLabel, tellHint, noteArea, buttons, sendMsg, info);
      sec.append(panel);
    },
    update() {
      // Keep the note in sync (in case S changes or something resets the field)
      const root = $('sec-feedback'), ta = root && root.querySelector('.feedback-note');   // W1-D: $('log') is null (the Journal is a sheet)
      if (ta && ta.value !== feedbackState.note) ta.value = feedbackState.note;
      if (root) {   // show the web-only parts when the page has LF_SITE
        const on = !!siteSend();
        const sb = root.querySelector('.feedback-send'), th = root.querySelector('.feedback-tell');
        if (sb) sb.hidden = !on;
        if (th) th.hidden = !on;
        const inf = root.querySelector('.feedback-info');
        if (inf) inf.textContent = on ? 'Send to the team shares your note, build, level, zone, screen size and any recent errors. Copy report also adds the date and your browser, for filing a bug yourself.' : INFO_TEXT;
      }
    }
  });
}
