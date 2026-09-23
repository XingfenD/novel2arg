'use strict';
// Pure helpers shared by every viewer file. Classic scripts share one global lexical scope, so a
// name declared here is visible to the files loaded after it — load order lives in graph-viewer.html.
const NS = 'http://www.w3.org/2000/svg';
const $ = (s) => document.querySelector(s);
const el = (t, attrs) => { const e = document.createElementNS(NS, t); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
// esc also quotes single quotes: panel strings embed ids inside @click="…" attributes.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// The file name is the identity; the directory only disambiguates, so it gets the quiet line.
const splitId = (id) => { const i = id.lastIndexOf('/'); return i < 0 ? { file: id, dir: '' } : { file: id.slice(i + 1), dir: id.slice(0, i) }; };
const afterGate = (s) => s + (s.afterGate ? '（需先过本页门禁）' : '');

// The vendored CDN build auto-starts in a queueMicrotask right after its own script tag — before
// any script that follows it. So the runtime loads LAST and every registration queues on the
// alpine:init event, which Alpine dispatches inside start(), before it walks the DOM.
const onAlpineInit = (fn) => document.addEventListener('alpine:init', fn, { once: true });
// If the runtime never arrives nothing renders: a blank page explains nothing, a red banner does.
const warnIfNoAlpine = () => addEventListener('DOMContentLoaded', () => {
  if (!window.Alpine && !document.querySelector('.noalpine')) {
    const d = document.createElement('p');
    d.className = 'noalpine';
    d.textContent = 'Alpine 运行时缺失：项目应包含 assets/js/vendor/alpine.min.js（node tools/vendor-alpine.mjs 生成，sha256 校验）。';
    document.body.prepend(d);
  }
});
