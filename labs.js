/* Shared helpers for the Labs. Exposed as window.L. */
(function () {
  var doc = document.documentElement;
  doc.classList.add('js');

  var L = {};
  L.NS = 'http://www.w3.org/2000/svg';
  L.narrow = function () { return window.matchMedia('(max-width: 600px)').matches; };

  L.el = function (parent, tag, attrs, text) {
    var e = document.createElementNS(L.NS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    parent.appendChild(e);
    return e;
  };
  L.clear = function (node) { while (node.firstChild) node.removeChild(node.firstChild); };
  L.scale = function (d0, d1, r0, r1) {
    var f = function (v) { return r0 + (v - d0) / (d1 - d0) * (r1 - r0); };
    f.inv = function (p) { return d0 + (p - r0) / (r1 - r0) * (d1 - d0); };
    return f;
  };
  L.rng = function (seed) {
    var s = seed >>> 0;
    return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  L.normal = function (rand) {
    var u = 0, v = 0; while (u === 0) u = rand(); while (v === 0) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  // standard normal CDF (Abramowitz and Stegun 7.1.26 via erf)
  L.Phi = function (x) {
    var t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x / 2);
    return x >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
  };
  // inverse standard normal CDF (Acklam)
  L.PhiInv = function (p) {
    if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
    var a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.3577518672690, -30.66479806614716, 2.506628277459239],
        b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572],
        c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783],
        d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    var q, r, pl = 0.02425;
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > 1 - pl) { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  };
  L.fmt = function (v, d) { return v.toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };
  L.ols = function (pts) {
    var n = pts.length, sx = 0, sy = 0, sxy = 0, sxx = 0;
    pts.forEach(function (p) { sx += p.x; sy += p.y; sxy += p.x * p.y; sxx += p.x * p.x; });
    var m = (n * sxy - sx * sy) / (n * sxx - sx * sx); return { m: m, b: (sy - m * sx) / n };
  };
  L.corr = function (pts) {
    var n = pts.length, mx = 0, my = 0; pts.forEach(function (p) { mx += p.x; my += p.y; }); mx /= n; my /= n;
    var sxy = 0, sxx = 0, syy = 0; pts.forEach(function (p) { sxy += (p.x - mx) * (p.y - my); sxx += (p.x - mx) * (p.x - mx); syy += (p.y - my) * (p.y - my); });
    return sxy / Math.sqrt(sxx * syy);
  };

  // tooltip
  var tip;
  L.tip = function (html, evt) {
    if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; document.body.appendChild(tip); }
    if (!html) { tip.classList.remove('show'); return; }
    tip.innerHTML = html;
    var x = evt.clientX, y = evt.clientY;
    if (evt.touches && evt.touches[0]) { x = evt.touches[0].clientX; y = evt.touches[0].clientY; }
    var w = tip.offsetWidth, vw = window.innerWidth;
    tip.style.left = Math.max(8, Math.min(vw - w - 8, x + 14)) + 'px';
    tip.style.top = (y - tip.offsetHeight - 14 < 8 ? y + 18 : y - tip.offsetHeight - 14) + 'px';
    tip.classList.add('show');
  };

  // segmented control
  L.seg = function (group, onChange) {
    var btns = group.querySelectorAll('button');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        onChange(b.getAttribute('data-v'));
      });
    });
  };

  // re-render on width class change
  L.onResize = function (fn) {
    var last = L.narrow();
    window.addEventListener('resize', function () { var n = L.narrow(); if (n !== last) { last = n; fn(); } });
  };

  window.L = L;

  document.addEventListener('DOMContentLoaded', function () {
    // year
    document.querySelectorAll('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });

    // reveal
    var items = document.querySelectorAll('.rv');
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      items.forEach(function (n) { io.observe(n); });
    } else {
      items.forEach(function (n) { n.classList.add('in'); });
    }

    // hide tooltip on scroll
    window.addEventListener('scroll', function () { L.tip(null); }, { passive: true });
  });
})();
