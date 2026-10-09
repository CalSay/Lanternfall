// b91: basE91 text for the embedded art files (docs/design/page-bytes.md lever 10; card embed-base91).
// basE91 (Joachim Henke's alphabet) carries a file in about 1.23 characters a byte, against base64's 1.33. Its alphabet
// has `"` but no `'` or `\`, so each string goes in the page in single quotes, never through JSON.stringify.
//   b91Encode(bytes) -> string       refuses (throws) a string holding `</script` in any case, which would end the page's script
//   b91Decode(string) -> Buffer      the exact bytes back (the page's own decoder is src/js/21zz-art-b91.js)
//   b91Lit(bytes) -> `'...'`         the encoded file as a JS string literal
// The embed tools write it; tools/check.mjs (section embed-base91) decodes every string with the page's decoder.
export const B91_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';
const IDX = new Int16Array(128).fill(-1);
for (let i = 0; i < B91_ALPHABET.length; i++) IDX[B91_ALPHABET.charCodeAt(i)] = i;

export function b91Encode(bytes) {
  let b = 0, n = 0, out = '';
  for (let i = 0; i < bytes.length; i++) {
    b |= bytes[i] << n; n += 8;
    if (n > 13) {
      let v = b & 8191;
      if (v > 88) { b >>>= 13; n -= 13; } else { v = b & 16383; b >>>= 14; n -= 14; }
      out += B91_ALPHABET[v % 91] + B91_ALPHABET[(v / 91) | 0];
    }
  }
  if (n) { out += B91_ALPHABET[b % 91]; if (n > 7 || b > 90) out += B91_ALPHABET[(b / 91) | 0]; }
  if (/<\/script/i.test(out)) throw new Error('b91Encode: the encoded file contains "</script", which would end the page\'s script; refusing to embed it');
  return out;
}

export function b91Decode(s) {
  const out = Buffer.alloc(Math.ceil(s.length * 14 / 16) + 1);
  let v = -1, b = 0, n = 0, o = 0;
  for (let i = 0; i < s.length; i++) {
    const d = IDX[s.charCodeAt(i)] ?? -1;
    if (d < 0) throw new Error(`b91Decode: character ${JSON.stringify(s[i])} at ${i} is not basE91`);
    if (v < 0) { v = d; continue; }
    v += d * 91; b |= v << n; n += (v & 8191) > 88 ? 13 : 14;
    do { out[o++] = b & 255; b >>>= 8; n -= 8; } while (n > 7);
    v = -1;
  }
  if (v > -1) out[o++] = (b | v << n) & 255;
  return out.subarray(0, o);
}

export const b91Lit = bytes => `'${b91Encode(bytes)}'`;

// A file to embed as basE91 inside a value b91Json writes. b91Json(value) is JSON.stringify(value) with each B91 file as a
// single-quoted basE91 literal (src/js/21zz-art-b91.js turns it back into the base64 or data URI the readers expect).
export class B91 { constructor(bytes) { this.bytes = bytes; } }
export function b91Json(value) {
  const files = [];
  const json = JSON.stringify(value, (k, v) => (v instanceof B91 ? `\u0000b91:${files.push(v) - 1}` : v));
  return json.replace(/"\\u0000b91:(\d+)"/g, (m, i) => b91Lit(files[+i].bytes));
}
