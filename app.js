/* ============================================================
   LemonVM — a virtual machine manager that runs in the browser
   ============================================================ */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const esc = (s) => String(s).replace(/[&<>\"']/g, (c) => ({ \"&\": \"&amp;\", \"<\": \"&lt;\", \">\": \"&gt;\", '\"': \"&quot;\", \"'\": \"&#39;\" }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------------- Icons ---------------- */
const ICO = {
  windows: '<svg viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"3\" width=\"8\" height=\"8\" rx=\"1.4\" fill=\"#fff\"/><rect x=\"13\" y=\"3\" width=\"8\" height=\"8\" rx=\"1.4\" fill=\"#fff\"/><rect x=\"3\" y=\"13\" width=\"8\" height=\"8\" rx=\"1.4\" fill=\"#fff\"/><rect x=\"13\" y=\"13\" width=\"8\" height=\"8\" rx=\"1.4\" fill=\"#fff\"/></svg>',
};
