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
// validateSave(data) -> { ok: true, data } | { ok: false, error }   pure v6 shape check (S.attr: attribute points per hero)
// summarizeSave(data) -> { name, level, maxZone, region, heroes, savedAt }   short preview

const SAVECODE_HEADER = 'LF1';
const SAVECODE_B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
// Generous import limits, not progression targets; avoid huge parses and exponential formula overflow.
const SAVECODE_LIMITS = Object.freeze({ jsonBytes: 2 * 1024 * 1024, codeChars: 2796240, depth: 64, nodes: 100000, progression: 1000, number: 1e100 });

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
    const b = bytes[i++];
    if (b < 0x80) { str += String.fromCharCode(b); continue; }
    const count = b >= 0xC2 && b <= 0xDF ? 1 : b >= 0xE0 && b <= 0xEF ? 2 : b >= 0xF0 && b <= 0xF4 ? 3 : -1;
    if (count < 0 || i + count > bytes.length) throw new Error('Invalid UTF-8');
    let cp = b & (count === 1 ? 0x1F : count === 2 ? 0x0F : 0x07);
    for (let j = 0; j < count; j++) {
      const next = bytes[i++]; if ((next & 0xC0) !== 0x80) throw new Error('Invalid UTF-8');
      cp = (cp << 6) | (next & 0x3F);
    }
    if (cp < (count === 1 ? 0x80 : count === 2 ? 0x800 : 0x10000) || cp > 0x10FFFF || (cp >= 0xD800 && cp <= 0xDFFF)) throw new Error('Invalid UTF-8');
    str += String.fromCodePoint(cp);
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
  if (!str.length || str.length % 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(str)) throw new Error('Invalid Base64');
  const bytes = [];
  for (let i = 0; i < str.length; i += 4) {
    const a = SAVECODE_B64.indexOf(str[i]), b = SAVECODE_B64.indexOf(str[i + 1]);
    const c = str[i + 2] === '=' ? 0 : SAVECODE_B64.indexOf(str[i + 2]), d = str[i + 3] === '=' ? 0 : SAVECODE_B64.indexOf(str[i + 3]);
    bytes.push((a << 2) | (b >> 4));
    if (str[i + 2] !== '=') bytes.push(((b & 15) << 4) | (c >> 2));
    if (str[i + 3] !== '=') bytes.push(((c & 3) << 6) | d);
  }
  if (savecodeB64Encode(bytes) !== str) throw new Error('Non-canonical Base64');
  return bytes;
}
// A short, order-sensitive hash: any single changed character in the payload changes it.
function savecodeChecksum(str) {
  let h = 5381 >>> 0;
  for (let i = 0; i < str.length; i++) h = (((h * 33) >>> 0) ^ str.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

// C5: validate without loading, repairing, normalising or changing the supplied save.
// Reads game tables (SOLO_HEROES, CAMP_B, BOUNTY_API.kinds, ...), so it runs only after the core files have loaded.
// Missing feature keys use normal load defaults. Present unsafe shapes are rejected.
function validateSave(data) {
  const lim = SAVECODE_LIMITS, has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const obj = x => x !== null && typeof x === 'object' && !Array.isArray(x);
  const fail = (path, why = 'has an invalid value') => { throw new Error('Save field ' + path + ' ' + why + '.'); };
  const num = (v, p, min = 0, max = lim.number) => { if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) fail(p); };
  const int = (v, p, min = 0, max = Number.MAX_SAFE_INTEGER) => { num(v, p, min, max); if (!Number.isInteger(v)) fail(p); };
  const record = (v, p) => { if (!obj(v)) fail(p, 'must be a record'); };
  const array = (v, p) => { if (!Array.isArray(v)) fail(p, 'must be a list'); };
  const text = (v, p, max = 1024) => { if (typeof v !== 'string' || v.length > max) fail(p); };
  const known = (table, key, p) => { if (typeof key !== 'string' || !has(table, key)) fail(p, 'is not supported by this version'); };
  const tier = (v, p) => int(v, p, 1, TIER_POW.length - 1);
  try {
    record(data, 'save');
    let nodes = 0, chars = 0; const seen = new Set();
    const walk = (v, p, depth) => {
      if (++nodes > lim.nodes || depth > lim.depth) fail(p, 'is too large or deeply nested');
      if (typeof v === 'number') { num(v, p, -lim.number); return; }
      if (typeof v === 'string') { chars += v.length; if (chars > lim.jsonBytes) fail(p, 'is too large'); return; }
      if (v === null || typeof v === 'boolean') return;
      if (typeof v !== 'object' || seen.has(v)) fail(p, 'is not JSON data');
      const proto = Object.getPrototypeOf(v);
      if (!Array.isArray(v) && proto !== Object.prototype && proto !== null) fail(p, 'is not a plain record');
      if (Array.isArray(v) && Object.keys(v).length !== v.length) fail(p, 'is not a dense JSON list');
      seen.add(v);
      for (const k of Object.keys(v)) {
        if (['__proto__', 'prototype', 'constructor'].includes(k)) fail(p, 'contains a reserved key');
        chars += k.length; if (chars > lim.jsonBytes) fail(p, 'is too large');
        walk(v[k], p + '.' + k, depth + 1);
      }
      seen.delete(v);
    };
    walk(data, 'save', 0);
    if (data.v !== 6) return { ok: false, error: 'This code is from a different save version. This game accepts v6 saves.' };
    for (const k of ['L', 'zone', 'maxZone']) int(data[k], k, 1, lim.progression);
    if (data.zone > data.maxZone) fail('zone', 'is beyond the saved frontier');
    num(data.gold, 'gold');
    if (data.relic) for (const n of Object.values(data.relic)) int(n, 'relic.level', 0, lim.progression);
    // Check containers against defaults without filling them. Null defaults are variant
    // fields (active tonic, current hero, etc.) and get specific checks where needed.
    const shape = (v, d, p) => {
      if (v === undefined || d === null) return;
      if (Array.isArray(d)) { array(v, p); if (d.length) { if (v.length < d.length) fail(p, 'is incomplete'); if (!d.includes(null)) for (let i = 0; i < v.length; i++) shape(v[i], d[Math.min(i, d.length - 1)], p + '.' + i); } }
      else if (obj(d)) { record(v, p); for (const k of Object.keys(d)) if (has(v, k)) shape(v[k], d[k], p + '.' + k); }
      else if (typeof v !== typeof d) fail(p, 'has the wrong type');
    };
    const defaults = fresh(); shape(data, defaults, 'save');
    // C11: accept and validate the retired optional v5 record before Deeds absorbs it.
    if (data.achievements !== undefined) {
      const a = data.achievements; record(a, 'achievements');
      if (a.got !== undefined) {
        record(a.got, 'achievements.got');
        for (const [id, v] of Object.entries(a.got)) if (typeof v !== 'boolean') num(v, 'achievements.got.' + id);
      }
      if (a.forged !== undefined) int(a.forged, 'achievements.forged');
      for (const k of ['init', 'epic']) if (a[k] !== undefined && typeof a[k] !== 'boolean') fail('achievements.' + k, 'has the wrong type');
    }
    if (data.deeds && data.deeds.n && data.deeds.n.forged !== undefined) int(data.deeds.n.forged, 'deeds.n.forged');
    // C9: optional route maps are validated before storage or feature load; missing v5 maps use defaults.
    if (data.party && data.party.unlock !== undefined && !heroUnlockStateValid(data.party.unlock)) fail('party.unlock');

    for (const k of ['xp', 'embers', 'kills', 'totalKills', 'totalGold', 'gProg']) if (has(data, k)) num(data[k], k);
    if (has(data, 'name')) text(data.name, 'name');
    if (has(data, 'last')) num(data.last, 'last', 0, 864e13);
    if (has(data, 'activity') && !['fight', 'gather', 'raid'].includes(data.activity)) fail('activity');
    record(data.skills, 'skills'); record(data.mats, 'mats'); record(data.node, 'node'); record(data.equip, 'equip'); array(data.items, 'items');
    for (const [k, s] of Object.entries(data.skills)) { known(SKILL, k, 'skills.' + k); record(s, 'skills.' + k); int(s.lv, 'skills.' + k + '.lv', 1, lim.progression); num(s.xp, 'skills.' + k + '.xp', 0, skillNeed(lim.progression, k)); }
    for (const [k, rows] of Object.entries(data.mats)) { known(MAT, k, 'mats.' + k); array(rows, 'mats.' + k); if (rows.length !== TIER_POW.length - 1) fail('mats.' + k); rows.forEach((n, i) => num(n, 'mats.' + k + '.' + i)); }
    known(CRAFT_NODES, data.node.kind, 'node.kind'); tier(data.node.t, 'node.t');
    const ids = new Set();
    for (const it of data.items) {
      record(it, 'items[]'); int(it.id, 'item.id', 1); if (ids.has(it.id)) fail('item.id', 'is duplicated'); ids.add(it.id);
      known(CRAFT_KINDS, it.slot, 'item.slot'); known(RAR, it.r, 'item.r'); tier(it.t, 'item.t'); int(it.plus, 'item.plus', 0, 1000);
      if (it.u != null) known(UNIQ, it.u, 'item.u');
      if (it.a !== undefined) { array(it.a, 'item.a'); for (const a of it.a) { array(a, 'item.a[]'); if (a.length !== 2) fail('item.a[]'); known(CRAFT_AFFIXES, a[0], 'item.a[].stat'); num(a[1], 'item.a[].value', 0, 1); } }
      if (it.mw != null) int(it.mw, 'item.mw', 0, CRAFT_TROPHIES.length - 1);
      if (it.rf !== undefined) int(it.rf, 'item.rf', 0, 1000);
    }
    int(data.nextId, 'nextId', 1); for (const id of ids) if (id >= data.nextId) fail('nextId', 'would reuse an item ID');
    for (const [slot, id] of Object.entries(data.equip)) { known(CRAFT_FITS, slot, 'equip.' + slot); if (id !== null && (!Number.isInteger(id) || !ids.has(id))) fail('equip.' + slot, 'refers to a missing item'); }
    const rows = (o, k, fn) => { if (o && o[k] !== undefined) { array(o[k], k); for (const r of o[k]) { record(r, k + '[]'); if (fn) fn(r); } } };
    const pack = (lines, p) => { array(lines, p); for (const l of lines) { array(l, p + '[]'); if (l.length < 3 || l.length > 4) fail(p); if (l[0] === 'troph') int(l[1], p + '.tier', 0, CRAFT_TROPHIES.length - 1); else { known(MAT, l[0], p + '.family'); tier(l[1], p + '.tier'); } num(l[2], p + '.units'); if (l[3] !== undefined && l[3] !== 'trade-refund') fail(p + '.source'); } };
    if (data.hands) {
      const hand = h => {
        text(h.id, 'hand.id', 128); if (!h.id) fail('hand.id'); text(h.n, 'hand.name');
        if (!HANDS_RAR.includes(h.r) || !['mine', 'wood', 'forage', 'hunt', 'fish', 'any'].includes(h.sk)) fail('hand.profession or rarity');
        if (h.tr !== undefined) { array(h.tr, 'hand.traits'); if (h.tr.some(k => !HANDS_TRAITS.some(t => t.id === k))) fail('hand.traits'); }
        if (h.lv !== undefined) int(h.lv, 'hand.level', 1, HANDS_TUNE.lvMax);
        if (h.xp !== undefined) num(h.xp, 'hand.xp');
        if (h.pack !== undefined) pack(h.pack, 'hand.pack');
        if (h.job != null) {
          const j = h.job; record(j, 'hand.job');
          if (j.role === 'trade') { if (typeof handsTradeValid !== 'function' || !handsTradeValid(j)) fail('hand.trade', 'is not supported by this version'); }
          else {
            if (j.role && j.role !== 'gather') fail('hand.job.role');
            known(CRAFT_NODES, j.kind, 'hand.job.kind'); tier(j.t, 'hand.job.t'); num(j.rate, 'hand.job.rate');
            num(j.start, 'hand.job.start', 0, 864e13); num(j.end, 'hand.job.end', 0, 864e13); if (j.end < j.start) fail('hand.job.end');
            if (j.bo !== undefined) { array(j.bo, 'hand.job.bo'); for (const b of j.bo) { array(b, 'hand.job.bo[]'); if (b.length < 4) fail('hand.job.bo[]'); for (let i = 0; i < 3; i++) num(b[i], 'hand.job.bo[]'); } }
            if (j.queue !== undefined) { rows(j, 'queue', q => { num(q.fee, 'hand.job.queue.fee'); int(q.seed, 'hand.job.queue.seed', -2147483648, 2147483647); }); if (j.queue.length > 10) fail('hand.job.queue', 'is too long'); }
          }
        }
        if (h.last != null) { record(h.last, 'hand.last'); known(CRAFT_NODES, h.last.kind, 'hand.last.kind'); tier(h.last.t, 'hand.last.t'); }
      };
      rows(data.hands, 'list', hand); if (data.hands.board) rows(data.hands.board, 'apps', hand); rows(data.hands, 'log');
    }
    if (data.solo) {
      const s = data.solo; if (s.hero != null) known(SOLO_HEROES, s.hero, 'solo.hero');
      for (const [k, eq] of Object.entries(s.eq || {})) { known(SOLO_HEROES, k, 'solo.eq.hero'); array(eq, 'solo.eq.' + k); if (eq.length !== 3) fail('solo.eq.' + k); for (const id of eq) if (id !== null && (typeof id !== 'string' || !SOLO_HEROES[k].abs.includes(id))) fail('solo.eq.' + k); }
      for (const [k, lv] of Object.entries(s.lv || {})) { known(SOLO_HEROES, k, 'solo.lv.hero'); record(lv, 'solo.lv.' + k); int(lv.L, 'solo.lv.level', 1, lim.progression); num(lv.xp, 'solo.lv.xp'); }
      for (const z of Object.values(s.zn || {})) int(z, 'solo.zone', 1, lim.progression);
      for (const tr of Object.values(s.tr || {})) { record(tr, 'solo.training'); for (const n of Object.values(tr)) int(n, 'solo.training.level', 0, lim.progression); }
    }
    // hero-progression-rework: attribute points spent, per hero, per attribute (55-attributes)
    if (data.attr !== undefined) {
      const at = data.attr; record(at, 'attr');
      if (at.v !== undefined) int(at.v, 'attr.v', 0, 1000);
      if (at.pts !== undefined) {
        record(at.pts, 'attr.pts');
        for (const [k, r] of Object.entries(at.pts)) {
          known(SOLO_HEROES, k, 'attr.pts.hero'); record(r, 'attr.pts.' + k);
          let sum = 0;
          for (const [id, n] of Object.entries(r)) { known(ATTR0(), id, 'attr.pts.attribute'); int(n, 'attr.pts.' + k + '.' + id, 0, lim.progression); sum += n; }
          // never more points spent than the hero's level gives
          const s = data.solo || {}, lv = s.hero === k ? data.L : s.lv && s.lv[k] && s.lv[k].L;
          if (sum > Math.max(0, ((+lv || 1) - 1) * HERO_TUNE.perLevel)) fail('attr.pts.' + k);
        }
      }
      if (at.resets !== undefined) { record(at.resets, 'attr.resets'); for (const [k, n] of Object.entries(at.resets)) { known(SOLO_HEROES, k, 'attr.resets.hero'); int(n, 'attr.resets.' + k, 0, lim.progression); } }
      if (at.met !== undefined) { record(at.met, 'attr.met'); for (const [k, n] of Object.entries(at.met)) { known(SOLO_HEROES, k, 'attr.met.hero'); int(n, 'attr.met.' + k, 0, 1); } }
      if (at.live !== undefined) int(at.live, 'attr.live', 0, 1);
    }
    rows(data.camp, 'builds', b => { known(CAMP_B, b.id, 'camp.build.id'); int(b.to, 'camp.build.to', 1, CAMP_B[b.id].max); num(b.dur, 'camp.build.dur', 1, 864e13); num(b.start, 'camp.build.start', 0, 864e13); num(b.end, 'camp.build.end', 0, 864e13); record(b.cost, 'camp.build.cost'); num(b.cost.gold, 'camp.build.gold'); pack(b.cost.mats, 'camp.build.mats'); array(b.cost.troph, 'camp.build.troph'); for (const l of b.cost.troph) { array(l, 'camp.build.troph[]'); if (l.length !== 2) fail('camp.build.troph[]'); if (l[0] !== 'any') int(l[0], 'camp.build.troph.kind', 0, CRAFT_TROPHIES.length - 1); num(l[1], 'camp.build.troph.units'); } });
    if (data.camp && data.camp.b) for (const [k, n] of Object.entries(data.camp.b)) { known(CAMP_B, k, 'camp.building'); int(n, 'camp.' + k, 0, CAMP_B[k].max); }
    rows(data.camp, 'news'); rows(data.craft, 'jobs'); rows(data.almanac, 'goals'); rows(data.errors, 'list');
    rows(data.bounties, 'slots', b => { if (b.k == null) return; if (!BOUNTY_API.kinds.includes(b.k)) fail('bounty.kind'); const bad = BOUNTY_API.shape(b); if (bad) fail('bounty.' + bad); });
    if (data.craft && data.craft.tonic != null) { record(data.craft.tonic, 'craft.tonic'); known(CRAFT_TONICS, data.craft.tonic.k, 'craft.tonic.kind'); tier(data.craft.tonic.t, 'craft.tonic.tier'); num(data.craft.tonic.left, 'craft.tonic.left'); }
    return { ok: true, data };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'This save has invalid data.' }; }
}

function encodeSave(obj) {
  const valid = validateSave(obj); if (!valid.ok) throw new Error(valid.error);
  const json = JSON.stringify(obj); if (json.length > SAVECODE_LIMITS.jsonBytes) throw new Error('This save is too large.');
  const bytes = savecodeUtf8Encode(json); if (bytes.length > SAVECODE_LIMITS.jsonBytes) throw new Error('This save is too large.');
  const b64 = savecodeB64Encode(bytes);
  return `${SAVECODE_HEADER}:${b64}:${savecodeChecksum(b64)}`;
}

function decodeSave(code) {
  try {
    if (typeof code !== 'string') return { ok: false, error: 'Paste a save code first.' };
    if (code.length > SAVECODE_LIMITS.codeChars) return { ok: false, error: 'This save code is too large.' };
    if (!code.trim()) return { ok: false, error: 'Paste a save code first.' };
    const m = /^LF1:([A-Za-z0-9+/=]+):([0-9a-z]+)$/.exec(code.trim());
    if (!m) return { ok: false, error: "That doesn't look like a Lanternfall save code." };
    const [, b64, sum] = m;
    if (savecodeChecksum(b64) !== sum) return { ok: false, error: 'This code is incomplete or was changed. Copy it again.' };
    const bytes = savecodeB64Decode(b64); if (bytes.length > SAVECODE_LIMITS.jsonBytes) return { ok: false, error: 'This save code is too large.' };
    return validateSave(JSON.parse(savecodeUtf8Decode(bytes)));
  } catch (e) { return { ok: false, error: "Couldn't read this code's save data." }; }
}
function summarizeSave(data) {
  const region = (typeof regionOf === 'function') ? regionOf(data.maxZone || 1) : null;
  const heroes = 1, key = data.solo && data.solo.hero;
  const hero = key && typeof ROSTER === 'object' && ROSTER[key] ? ROSTER[key].name.split(' ')[0] : 'Wanderer';
  let savedAt = '';
  try { savedAt = data.last ? new Date(data.last).toLocaleString() : ''; } catch (e) {}
  return {
    name: (data.name && String(data.name).trim()) || 'Wanderer',
    level: data.L || 1,
    maxZone: data.maxZone || 1,
    region: (region && (region.n || region.name)) || 'the Hollow',
    hero, heroes,
    savedAt
  };
}
