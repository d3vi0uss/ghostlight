/* VaultBreak — utilities */
(function (APP) {
  'use strict';

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // Compact currency formatting: small numbers exact, large numbers abbreviated.
  function formatMoney(n, opts) {
    opts = opts || {};
    const sign = n < 0 ? '-' : '';
    n = Math.abs(n);
    if (opts.full || n < 1000) {
      return sign + '$' + n.toLocaleString('en-US', { maximumFractionDigits: opts.cents ? 2 : 0 });
    }
    const units = [
      { v: 1e15, s: 'Q' }, { v: 1e12, s: 'T' }, { v: 1e9, s: 'B' }, { v: 1e6, s: 'M' }, { v: 1e3, s: 'K' },
    ];
    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      if (n >= u.v) {
        let val = n / u.v;
        let digits = val >= 100 ? 0 : val >= 10 ? 1 : 2;
        let str = val.toFixed(digits);
        // Guard against rounding overflow, e.g. 999,999,999 -> "1000M" should read "1B".
        if (parseFloat(str) >= 1000 && i > 0) {
          const bigger = units[i - 1];
          val = n / bigger.v;
          digits = val >= 100 ? 0 : val >= 10 ? 1 : 2;
          return sign + '$' + val.toFixed(digits).replace(/\.0+$/, '') + bigger.s;
        }
        return sign + '$' + str.replace(/\.0+$/, '') + u.s;
      }
    }
    return sign + '$' + Math.round(n).toLocaleString('en-US');
  }

  function formatNumber(n) {
    if (n < 1000) return Math.round(n).toLocaleString('en-US');
    return formatMoney(n).replace('$', '');
  }

  function formatPct(n, digits) {
    return (n).toFixed(digits == null ? 2 : digits) + '%';
  }

  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
  }

  // Simple splitmix32-style seeded PRNG so item art/patterns are stable
  // across renders for the same seed, without needing to persist canvases.
  function makeSeededRandom(seed) {
    let a = seed >>> 0 || 1;
    return function () {
      a |= 0; a = (a + 0x9e3779b9) | 0;
      let t = a ^ (a >>> 16);
      t = Math.imul(t, 0x21f0aaad);
      t = t ^ (t >>> 15);
      t = Math.imul(t, 0x735a2d97);
      t = t ^ (t >>> 15);
      return ((t >>> 0) / 4294967296);
    };
  }
  function seedFromString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // Weighted random pick. `entries` is [[key, weight], ...].
  function weightedPick(entries, rnd) {
    rnd = rnd || Math.random;
    const total = entries.reduce((s, e) => s + e[1], 0);
    let r = rnd() * total;
    for (const [key, w] of entries) {
      if (r < w) return key;
      r -= w;
    }
    return entries[entries.length - 1][0];
  }

  function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return s + 's ago';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
  }

  function todayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function daysBetween(aKey, bKey) {
    const a = new Date(aKey + 'T00:00:00');
    const b = new Date(bKey + 'T00:00:00');
    return Math.round((b - a) / 86400000);
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k.startsWith('on') && typeof attrs[k] === 'function') node.addEventListener(k.slice(2), attrs[k]);
        else if (attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, attrs[k]);
      }
    }
    (children || []).forEach(c => {
      if (c == null) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  APP.utils = {
    clamp, formatMoney, formatNumber, formatPct, uid,
    makeSeededRandom, seedFromString, weightedPick,
    timeAgo, todayKey, daysBetween, el, escapeHtml,
  };
})(window.APP = window.APP || {});
