// components.js — the shared kernel every page of a make-my-arg project loads.
//
// Loaded by every page BEFORE the vendored Alpine runtime (script order: base.md §2). It carries
// only what never changes between projects: the md5 primitive, the hash helper, and the session
// store. The module components themselves are registered on alpine:init from the reference
// implementations in references/structure/components.md — copy in ONLY the components
// docs/system-profile.md selected and delete the rest: shipping machinery the profile did not
// select is a module drift (references/common-mistakes.md §6).
//
// Hash contract (four sides, byte-identical — references/structure/tooling.md §3 item 4):
//   this helper  ·  tools/hash.mjs  ·  tools/build-keywords.mjs  ·  tools/check-credentials.mjs
//   String(w).trim().toLowerCase()  ->  md5  ->  base64
// Switching algorithms means editing all of them in one change, then re-generating every table
// built under the old rule (R3).

/* ── md5 (RFC 1321) ──────────────────────────────────────────────────────────────
   Synchronous and dependency-free: WebCrypto has no MD5, so the primitive lives here. The output
   is byte-identical to node:crypto's md5, which is what the tools above compute. */
const md5 = (input) => {
  const msg = new TextEncoder().encode(String(input));
  const blocks = Math.ceil((msg.length + 9) / 64);          // 0x80 pad + 8-byte length
  const buf = new Uint8Array(blocks * 64);
  buf.set(msg);
  buf[msg.length] = 0x80;
  const view = new DataView(buf.buffer);
  const bits = msg.length * 8;                              // safe below 2^53 bits
  view.setUint32(buf.length - 8, bits >>> 0, true);
  view.setUint32(buf.length - 4, Math.floor(bits / 4294967296), true);

  // Per-step rotate amounts and the sine-derived constant table (RFC 1321 T[1..64]).
  const S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
             5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
             4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
             6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
  const K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296));

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  for (let off = 0; off < buf.length; off += 64) {
    const M = Array.from({ length: 16 }, (_, i) => view.getUint32(off + i * 4, true));
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      F = (F + A + K[i] + M[g]) | 0;
      A = D; D = C; C = B;
      B = (B + ((F << S[i]) | (F >>> (32 - S[i])))) | 0;    // rotate left, then add
    }
    a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
  }
  const hex = [];
  for (const v of [a0, b0, c0, d0])
    for (let i = 0; i < 4; i++) hex.push(((v >>> (i * 8)) & 0xff).toString(16).padStart(2, '0'));
  return hex.join('');
};

/* ── hash: the one helper gate inputs and keyword tables are keyed by ─────────────
   Mirrors tools/hash.mjs exactly. md5 is hex here, base64 out — never mix the two forms. */
const hash = (w) => btoa(String.fromCharCode(...md5(String(w).trim().toLowerCase()).match(/../g).map((h) => parseInt(h, 16))));

/* ── Session store ──────────────────────────────────────────────────────────────
   Access state MUST survive a result opened in a new tab (target="_blank"): per-tab
   sessionStorage does not, so the state lives in a session cookie (no max-age/expires → cleared
   when the browser closes) with sessionStorage as the private-mode fallback. Rename ACCESS_KEY
   per project. Session state is technical, never explained to the player. */
const ACCESS_KEY = 'access', SKIN_KEY = 'skin';
const session = {
  _read(key) {
    const m = document.cookie.match(new RegExp('(?:^|; )' + key + '=([^;]*)'));
    if (m) { try { return JSON.parse(decodeURIComponent(m[1])); } catch (e) { /* fall through */ } }
    try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch (e) { return null; }
  },
  _write(key, val) {
    const v = encodeURIComponent(JSON.stringify(val));
    document.cookie = `${key}=${v}; path=/; SameSite=Lax`;            // session cookie: deliberately no expiry
    try { sessionStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private mode */ }
  },
  access() { return this._read(ACCESS_KEY) || []; },
  grant(ids) { this._write(ACCESS_KEY, [...new Set([...this.access(), ...ids])]); },
  reskin(name) { if (name) this._write(SKIN_KEY, name); },            // optional: a skin token deep pages apply
  skin() { return this._read(SKIN_KEY); },
};

/* ── Component registration ─────────────────────────────────────────────────────
   The vendored runtime auto-starts right after its own script tag, so registrations queue on the
   alpine:init event it dispatches before the DOM walk. Register ONLY what the profile selected;
   the reference bodies live in references/structure/components.md:
     §2 search (M1)      · x-data="search", data-index="data/keywords.surface.json"
     §3 gate (M2)        · x-data="gate", data-expect-hash on each input, data-next / x-show="unlocked"
     §4 staging (M12)    · blackout / typewriter / reveal — timers released in destroy()
     §5 reskin (M5)      · deep pages link secret.css directly; session.reskin() carries the token
     §6 progress (M7)    · footer span, data-page / data-total on <body>
   Container B/C/D account access (M3) lives in references/structure/form-system.md (data-grant /
   data-access). Example, once the body is copied in:
     Alpine.data('gate', () => ({ ... }));
   No component may route or switch scenes: Alpine owns in-page lifecycle only (R1). */
document.addEventListener('alpine:init', () => {
  // Alpine.data('search', () => ({ ... }));   // M1 — delete when the profile did not select it
  // Alpine.data('gate',   () => ({ ... }));   // M2 — delete when the profile did not select it
});
