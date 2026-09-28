// 55-errors: error capture for playtester feedback. Ring buffer of recent uncaught errors
// and unhandled promise rejections, stored in localStorage under lanternfall.errors.v1.
// Must never throw. Reads cheaply available state (zone, activity) when an error occurs.
// CORE FILE: no DOM, no window, no localStorage access (use storage adapter).

registerState('errors', { list: [], next: 0 });

// Max errors to keep in the ring buffer.
const ERROR_CAP = 20;

// Capture an error: message, source file/line, time, and cheap state (zone, activity if available).
// Called from the error handler and must never throw.
function captureError(msg, source, lineno, colno) {
  try {
    const err = {
      msg: String(msg || '').slice(0, 200),
      file: source ? source.split('/').slice(-1)[0] : 'unknown',
      line: lineno || 0,
      t: Date.now(),
      zone: typeof S !== 'undefined' && S && typeof S.zone === 'number' ? S.zone : 0,
      act: typeof S !== 'undefined' && S && typeof S.activity === 'string' ? S.activity : ''
    };
    const e = S && S.errors || { list: [], next: 0 };
    const n = (e.next + 1) % ERROR_CAP;
    e.list[e.next] = err;
    e.next = n;
    if (e.list.length > ERROR_CAP) e.list = e.list.slice(-ERROR_CAP);
  } catch (e) {
    // Silently fail - we must not throw from an error handler
  }
}

// Clear all errors from the buffer.
function clearErrors() {
  try {
    if (S && S.errors) {
      S.errors.list = [];
      S.errors.next = 0;
    }
  } catch (e) {}
}

// Export for UI consumption: a plain-text report of recent errors.
// Called only from UI (75-feedback-ui), so we can read S safely.
// Returns a multi-line string suitable for clipboard.
function errorReport() {
  try {
    if (!S || !S.errors || !S.errors.list || !S.errors.list.length) return '';
    const lines = ['Recent errors:'];
    // Ring buffer: read from next (oldest) to next-1 (newest).
    for (let i = 0; i < S.errors.list.length; i++) {
      const idx = (S.errors.next + i) % S.errors.list.length;
      const e = S.errors.list[idx];
      if (!e) continue;
      const time = new Date(e.t).toLocaleTimeString();
      const place = e.zone ? ` Zone ${e.zone}` : '';
      const act = e.act ? ` ${e.act}` : '';
      lines.push(`  ${e.file}:${e.line} @ ${time}${place}${act}`);
      lines.push(`    ${e.msg}`);
    }
    return lines.join('\n');
  } catch (e) {
    return '';
  }
}
