// 55-savecode: save export/import codes (SAVE1). No DOM: pure functions the UI (75-savecode-ui.js)
// calls to turn a save object into a short text code and back.
// CORE FILE: must not touch document, window, canvas or localStorage.
//
// Code shape: `LF1:<base64 of UTF-8 JSON>:<checksum>`. The checksum is a cheap hash of the
// base64 payload, so a single changed or dropped character is caught before JSON.parse ever
// sees the tampered data.
//
// encodeSave(obj) -> string                      turn a save object into a code
// decodeSave(code) -> { ok: true, data } | { ok: false, error }   parse and validate a code
// summarizeSave(data) -> { name, level, maxZone, region, heroes, savedAt }   short preview

const SAVECODE_HEADER = 'LF1';
const SAVECODE_B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// UTF-8 in and out, without relying on TextEncoder/atob/btoa/Buffer (browser and Node vm alike).
function savecodeUtf8Encode(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.codePointAt(i);
    if (code > 0xFFFF) i++; // consumed the low surrogate too
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) bytes.push(0xC0 | (code >> 6), 0x80 | (code & 0x3F));
    else if (code < 0x10000) bytes.push(0xE0 | (code >> 12), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F));
    else bytes.push(0xF0 | (code >> 18), 0x80 | ((code >> 12) & 0x3F), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F));
  }
  return bytes;
}
function savecodeUtf8Decode(bytes) {
  let str = '', i = 0;
  while (i < bytes.length) {
    const b0 = bytes[i++];
    if (b0 < 0x80) str += String.fromCharCode(b0);
    else if ((b0 & 0xE0) === 0xC0) str += String.fromCharCode(((b0 & 0x1F) << 6) | (bytes[i++] & 0x3F));
    else if ((b0 & 0xF0) === 0xE0) { const b1 = bytes[i++], b2 = bytes[i++]; str += String.fromCharCode(((b0 & 0x0F) << 12) | ((b1 & 0x3F) << 6) | (b2 & 0x3F)); }
    else { const b1 = bytes[i++], b2 = bytes[i++], b3 = bytes[i++]; str += String.fromCodePoint(((b0 & 0x07) << 18) | ((b1 & 0x3F) << 12) | ((b2 & 0x3F) << 6) | (b3 & 0x3F)); }
  }
  return str;
}
function savecodeB64Encode(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
    out += SAVECODE_B64[b0 >> 2];
    out += SAVECODE_B64[((b0 & 3) << 4) | (b1 === undefined ? 0 : b1 >> 4)];
    out += b1 === undefined ? '=' : SAVECODE_B64[((b1 & 0xF) << 2) | (b2 === undefined ? 0 : b2 >> 6)];
    out += b2 === undefined ? '=' : SAVECODE_B64[b2 & 0x3F];
  }
  return out;
}
function savecodeB64Decode(str) {
  const bytes = [];
  let buffer = 0, bits = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '=') break;
    const val = SAVECODE_B64.indexOf(ch);
    if (val === -1) continue;
    buffer = (buffer << 6) | val;
    bits += 6;
    if (bits >= 8) { bits -= 8; bytes.push((buffer >> bits) & 0xFF); }
  }
  return bytes;
}
// A short, order-sensitive hash: any single changed character in the payload changes it.
function savecodeChecksum(str) {
  let h = 5381 >>> 0;
  for (let i = 0; i < str.length; i++) h = (((h * 33) >>> 0) ^ str.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function encodeSave(obj) {
  const json = JSON.stringify(obj);
  const b64 = savecodeB64Encode(savecodeUtf8Encode(json));
  return `${SAVECODE_HEADER}:${b64}:${savecodeChecksum(b64)}`;
}

// Fields a real save always has; a code missing any of these is not treated as one.
const SAVECODE_REQUIRED = ['v', 'L', 'gold', 'zone', 'maxZone'];

function decodeSave(code) {
  try {
    if (typeof code !== 'string' || !code.trim()) return { ok: false, error: 'Paste a save code first.' };
    const trimmed = code.trim();
    const m = /^LF1:([A-Za-z0-9+/=]+):([0-9a-z]+)$/.exec(trimmed);
    if (!m) return { ok: false, error: "That doesn't look like a Lanternfall save code." };
    const [, b64, sum] = m;
    if (savecodeChecksum(b64) !== sum) return { ok: false, error: 'This code is incomplete or was changed. Copy it again.' };
    let data;
    try { data = JSON.parse(savecodeUtf8Decode(savecodeB64Decode(b64))); }
    catch (e) { return { ok: false, error: "Couldn't read this code's save data." }; }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return { ok: false, error: 'This code does not hold a save.' };
    for (const k of SAVECODE_REQUIRED) if (typeof data[k] !== 'number') return { ok: false, error: 'This does not look like a Lanternfall save.' };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: "Couldn't read that code." };
  }
}

function summarizeSave(data) {
  const region = (typeof regionOf === 'function') ? regionOf(data.maxZone || 1) : null;
  const heroes = data.party && Array.isArray(data.party.field) ? data.party.field.length + 1 : 1;
  let savedAt = '';
  try { savedAt = data.last ? new Date(data.last).toLocaleString() : ''; } catch (e) {}
  return {
    name: (data.name && String(data.name).trim()) || 'Wanderer',
    level: data.L || 1,
    maxZone: data.maxZone || 1,
    region: (region && region.name) || 'The Hollow',
    heroes,
    savedAt
  };
}
