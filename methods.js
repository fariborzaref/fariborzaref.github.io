/* The Methods Lab: four demonstrations. */
(function () {
  var L = window.L;

  /* ============================================================
     I. SIMPSON'S PARADOX (simulated data)
     Within each group of societies, more social spending goes with
     lower inequality. Groups with higher structural pressure spend
     more and remain more unequal, so the pooled slope is positive.
     ============================================================ */
  (function () {
    var svg = document.getElementById('simpson-chart'); if (!svg) return;
    var rand = L.rng(11);
    var G = [
      { n: 'Low structural pressure', c: 'var(--c-blue)', lo: 14, hi: 22, cx: 18, cy: 0.27 },
      { n: 'Moderate structural pressure', c: 'var(--c-green)', lo: 20, hi: 28, cx: 24, cy: 0.33 },
      { n: 'High structural pressure', c: 'var(--c-terra)', lo: 26, hi: 34, cx: 30, cy: 0.40 }
    ];
    G.forEach(function (g) {
      g.pts = [];
      for (var i = 0; i < 10; i++) { var x = g.lo + (g.hi - g.lo) * ((i + rand() * 0.7) / 10); g.pts.push({ x: x, y: g.cy - 0.0065 * (x - g.cx) + (rand() - 0.5) * 0.024 }); }
      g.fit = L.ols(g.pts);
    });
    var all = []; G.forEach(function (g) { all = all.concat(g.pts); });
    var pooled = L.ols(all);
    var leg = document.getElementById('simpson-legend');
    G.forEach(function (g) { var s = document.createElement('span'); s.innerHTML = '<i style="background:' + g.c + '"></i>' + g.n; leg.appendChild(s); });
    var split = false;

    function draw() {
      L.clear(svg);
      var nar = L.narrow(), W = nar ? 360 : 660, H = nar ? 340 : 380, mL = 46, mR = 14, mT = 14, mB = 44;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var x = L.scale(12, 36, mL, W - mR), y = L.scale(0.22, 0.46, H - mB, mT);
      [0.25, 0.30, 0.35, 0.40, 0.45].forEach(function (v) { L.el(svg, 'line', { x1: mL, y1: y(v), x2: W - mR, y2: y(v), class: 'grid' }); L.el(svg, 'text', { x: mL - 6, y: y(v) + 4, 'text-anchor': 'end' }, v.toFixed(2)); });
      [15, 20, 25, 30, 35].forEach(function (v) { L.el(svg, 'text', { x: x(v), y: H - mB + 18, 'text-anchor': 'middle' }, v + '%'); });
      L.el(svg, 'text', { x: (mL + W - mR) / 2, y: H - 6, 'text-anchor': 'middle', class: 't-title' }, 'Social spending, % of GDP');
      L.el(svg, 'text', { x: mL, y: mT - 2, class: 't-title' }, 'Gini');
      L.el(svg, 'line', { x1: x(14), y1: y(pooled.m * 14 + pooled.b), x2: x(34), y2: y(pooled.m * 34 + pooled.b), stroke: 'var(--ink)', 'stroke-width': 2, 'stroke-dasharray': '6 5', class: 'fade', opacity: split ? 0.15 : 1 });
      G.forEach(function (g) {
        L.el(svg, 'line', { x1: x(g.lo - 0.5), y1: y(g.fit.m * (g.lo - 0.5) + g.fit.b), x2: x(g.hi + 0.5), y2: y(g.fit.m * (g.hi + 0.5) + g.fit.b), stroke: g.c, 'stroke-width': 2.4, class: 'fade', opacity: split ? 1 : 0 });
        g.pts.forEach(function (p) { L.el(svg, 'circle', { cx: x(p.x), cy: y(p.y), r: 4.6, fill: split ? g.c : 'var(--c-stone)', class: 'move' }); });
      });
    }
    function render() {
      draw();
      document.getElementById('simpson-legend').style.opacity = split ? 1 : 0.35;
      document.getElementById('simpson-readout').innerHTML = split
        ? 'Within every group the slope is negative (about <b>' + (G[0].fit.m * 10).toFixed(3) + '</b> Gini points per 10 points of spending). Among societies facing the same pressure, those that spend more are <b>more equal</b>.'
        : 'Pooled, the slope is positive (<b>+' + (pooled.m * 10).toFixed(3) + '</b> Gini points per 10 points of spending). Read naively, spending appears to raise inequality.';
    }
    L.seg(document.getElementById('simpson-seg'), function (v) { split = v === 'split'; render(); });
    render(); L.onResize(draw);
  })();

  /* ============================================================
     II. THE ECOLOGICAL FALLACY (simulated, after Robinson 1950)
     ============================================================ */
  (function () {
    var svg = document.getElementById('eco-chart'); if (!svg) return;
    var rand = L.rng(23);
    var FP = [5, 9, 13, 17, 21, 25, 29, 33];
    var states = FP.map(function (fp) {
      var base = 82 + 0.42 * fp, people = [];
      for (var i = 0; i < 30; i++) {
        var imm = rand() < fp / 100 * 1.8;
        var lit = Math.max(46, Math.min(99.5, base - (imm ? 14 : 0) + (rand() - 0.5) * 10));
        people.push({ x: fp + (rand() - 0.5) * 2.6, y: lit, imm: imm });
      }
      var m = people.reduce(function (a, p) { return a + p.y; }, 0) / people.length;
      return { fp: fp, mean: m, people: people };
    });
    var aggPts = states.map(function (s) { return { x: s.fp, y: s.mean }; });
    var rAgg = L.corr(aggPts), fitAgg = L.ols(aggPts);
    var everyone = []; states.forEach(function (s) { everyone = everyone.concat(s.people); });
    var rInd = L.corr(everyone.map(function (p) { return { x: p.imm ? 1 : 0, y: p.y }; }));
    var mImm = 0, nImm = 0, mNat = 0, nNat = 0;
    everyone.forEach(function (p) { if (p.imm) { mImm += p.y; nImm++; } else { mNat += p.y; nNat++; } });
    mImm /= nImm; mNat /= nNat;
    var people = false;

    function draw() {
      L.clear(svg);
      var nar = L.narrow(), W = nar ? 360 : 660, H = nar ? 340 : 380, mL = 46, mR = 14, mT = 14, mB = 44;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var x = L.scale(2, 36, mL, W - mR), y = L.scale(50, 100, H - mB, mT);
      [60, 70, 80, 90, 100].forEach(function (v) { L.el(svg, 'line', { x1: mL, y1: y(v), x2: W - mR, y2: y(v), class: 'grid' }); L.el(svg, 'text', { x: mL - 6, y: y(v) + 4, 'text-anchor': 'end' }, v + '%'); });
      [5, 15, 25, 35].forEach(function (v) { L.el(svg, 'text', { x: x(v), y: H - mB + 18, 'text-anchor': 'middle' }, v + '%'); });
      L.el(svg, 'text', { x: (mL + W - mR) / 2, y: H - 6, 'text-anchor': 'middle', class: 't-title' }, 'Foreign-born share of the state population');
      L.el(svg, 'text', { x: mL, y: mT - 2, class: 't-title' }, 'Literacy');
      if (!people) {
        L.el(svg, 'line', { x1: x(4), y1: y(fitAgg.m * 4 + fitAgg.b), x2: x(34), y2: y(fitAgg.m * 34 + fitAgg.b), stroke: 'var(--ink)', 'stroke-width': 2 });
        states.forEach(function (s) { L.el(svg, 'circle', { cx: x(s.fp), cy: y(s.mean), r: 7, fill: 'var(--ink)', stroke: 'var(--card)', 'stroke-width': 2 }); });
      } else {
        L.el(svg, 'line', { x1: mL, x2: W - mR, y1: y(mNat), y2: y(mNat), stroke: 'var(--c-blue)', 'stroke-dasharray': '5 4', 'stroke-width': 1.6 });
        L.el(svg, 'line', { x1: mL, x2: W - mR, y1: y(mImm), y2: y(mImm), stroke: 'var(--c-terra)', 'stroke-dasharray': '5 4', 'stroke-width': 1.6 });
        everyone.forEach(function (p) { L.el(svg, 'circle', { cx: x(p.x), cy: y(p.y), r: 2.8, fill: p.imm ? 'var(--c-terra)' : 'var(--c-blue)', opacity: 0.8 }); });
      }
    }
    function render() {
      draw();
      document.getElementById('eco-legend').innerHTML = people
        ? '<span><i style="background:var(--c-blue)"></i>Native-born person</span><span><i style="background:var(--c-terra)"></i>Foreign-born person</span><span><i class="line" style="background:var(--ink-faint)"></i>group averages</span>'
        : '<span><i style="background:var(--ink)"></i>State average</span>';
      document.getElementById('eco-readout').innerHTML = people
        ? 'Among individuals, being foreign-born goes with <b>lower</b> literacy (r = ' + rInd.toFixed(2) + '; averages ' + mNat.toFixed(0) + '% against ' + mImm.toFixed(0) + '%). The positive state-level pattern says nothing about persons.'
        : 'Across states, a higher foreign-born share goes with <b>higher</b> literacy (r = +' + rAgg.toFixed(2) + '). The tempting inference concerns immigrants. The data describe states.';
    }
    L.seg(document.getElementById('eco-seg'), function (v) { people = v === 'people'; render(); });
    render(); L.onResize(draw);
  })();

  /* ============================================================
     III. WHAT 95% CONFIDENCE MEANS (repeated sampling)
     True population proportion is fixed; each sample yields a
     Wald interval p-hat +/- z * sqrt(p-hat(1 - p-hat)/n).
     ============================================================ */
  (function () {
    var svg = document.getElementById('ci-chart'); if (!svg) return;
    var TRUE = 0.40, MAXSHOW = 60;
    var rand = L.rng(Date.now() % 100000);
    var nSl = document.getElementById('ci-n'), nOut = document.getElementById('ci-nval');
    var z = 1.96, level = 95;
    var draws = [], total = 0, hits = 0;
    function sample() {
      var n = +nSl.value, k = 0;
      // binomial draw; normal approximation for speed when n is large
      if (n <= 200) { for (var i = 0; i < n; i++) if (rand() < TRUE) k++; }
      else { k = Math.round(n * TRUE + Math.sqrt(n * TRUE * (1 - TRUE)) * L.normal(rand)); k = Math.max(0, Math.min(n, k)); }
      var p = k / n, se = Math.sqrt(p * (1 - p) / n), lo = p - z * se, hi = p + z * se;
      var hit = lo <= TRUE && TRUE <= hi;
      draws.push({ p: p, lo: lo, hi: hi, hit: hit, n: n }); if (draws.length > MAXSHOW) draws.shift();
      total++; if (hit) hits++;
    }
    function draw() {
      L.clear(svg);
      var nar = L.narrow(), W = nar ? 360 : 660, rowH = nar ? 4.6 : 5.2, mT = 26, H = mT + MAXSHOW * rowH + 34, mL = 16, mR = 16;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var x = L.scale(0.2, 0.6, mL, W - mR);
      [0.2, 0.3, 0.4, 0.5, 0.6].forEach(function (v) { L.el(svg, 'line', { x1: x(v), y1: mT - 6, x2: x(v), y2: H - 26, class: 'grid' }); L.el(svg, 'text', { x: x(v), y: H - 10, 'text-anchor': 'middle' }, Math.round(v * 100) + '%'); });
      L.el(svg, 'line', { x1: x(TRUE), y1: mT - 10, x2: x(TRUE), y2: H - 26, stroke: 'var(--ink)', 'stroke-width': 1.6 });
      L.el(svg, 'text', { x: x(TRUE), y: 12, 'text-anchor': 'middle', class: 't-label' }, 'True value: 40%');
      draws.forEach(function (d, i) {
        var y = mT + (MAXSHOW - draws.length + i) * rowH + rowH / 2;
        var c = d.hit ? 'var(--c-blue)' : 'var(--c-terra)';
        L.el(svg, 'line', { x1: x(Math.max(0.2, d.lo)), y1: y, x2: x(Math.min(0.6, d.hi)), y2: y, stroke: c, 'stroke-width': d.hit ? 1.6 : 2.4, opacity: d.hit ? 0.75 : 1 });
        L.el(svg, 'circle', { cx: x(Math.max(0.2, Math.min(0.6, d.p))), cy: y, r: 1.8, fill: c });
      });
    }
    function stats() {
      document.getElementById('ci-total').textContent = L.fmt(total);
      document.getElementById('ci-cover').textContent = total ? (hits / total * 100).toFixed(1) + '%' : '–';
      var last = draws[draws.length - 1];
      document.getElementById('ci-width').textContent = last ? '±' + ((last.hi - last.lo) / 2 * 100).toFixed(1) : '–';
      document.getElementById('ci-readout').innerHTML = !total
        ? 'Each line will be one survey of <b>' + nSl.value + '</b> people, with its ' + level + '% confidence interval. The true share in the population is 40%.'
        : 'Of <b>' + L.fmt(total) + '</b> intervals, <b>' + L.fmt(hits) + '</b> contain the true value: ' + (hits / total * 100).toFixed(1) + '%. ' +
          (last.hit ? 'The latest interval captured it.' : 'The latest interval <b>missed</b>, and nothing in that one sample signals the miss.');
    }
    function reset() { draws = []; total = 0; hits = 0; draw(); stats(); }
    document.getElementById('ci-one').addEventListener('click', function () { sample(); draw(); stats(); });
    document.getElementById('ci-many').addEventListener('click', function () {
      var i = 0; var iv = setInterval(function () { sample(); if (++i % 4 === 0 || i === 100) { draw(); stats(); } if (i >= 100) clearInterval(iv); }, 16);
    });
    document.getElementById('ci-reset').addEventListener('click', reset);
    nSl.addEventListener('input', function () { nOut.textContent = nSl.value; reset(); });
    L.seg(document.getElementById('ci-seg'), function (v) { level = +v; z = { 80: 1.2816, 95: 1.96, 99: 2.5758 }[v]; reset(); });
    reset(); L.onResize(draw);
  })();

  /* ============================================================
     IV. THE GARDEN OF FORKING PATHS
     One simulated survey of 400 people. The outcome is unrelated
     to every candidate predictor. Each analysis tests one predictor
     within one subgroup; p-values come from the correlation t-test.
     ============================================================ */
  (function () {
    var grid = document.getElementById('fp-grid'); if (!grid) return;
    var N = 400, NP = 10, rand;
    var PRED = ['age', 'income', 'church attendance', 'commute time', 'news use', 'union membership', 'trust in neighbours', 'hours online', 'birth order', 'home ownership'];
    var SUB = ['everyone', 'women', 'men', 'under 40', 'over 40', 'urban', 'rural', 'graduates', 'non-graduates', 'parents'];
    var data, paths, done;
    function build() {
      rand = L.rng(Math.floor(Math.random() * 1e6));
      data = [];
      for (var i = 0; i < N; i++) {
        var r = { y: L.normal(rand), x: [], s: [true, rand() < 0.5, false, rand() < 0.5, false, rand() < 0.6, false, rand() < 0.35, false, rand() < 0.45] };
        r.s[2] = !r.s[1]; r.s[4] = !r.s[3]; r.s[6] = !r.s[5]; r.s[8] = !r.s[7];
        for (var j = 0; j < NP; j++) r.x.push(L.normal(rand));
        data.push(r);
      }
      paths = [];
      var order = []; for (var a = 0; a < NP; a++) for (var b = 0; b < SUB.length; b++) order.push([a, b]);
      for (var k = order.length - 1; k > 0; k--) { var m = Math.floor(rand() * (k + 1)); var t = order[k]; order[k] = order[m]; order[m] = t; }
      paths = order.slice(0, 20);
      done = [];
      grid.innerHTML = '';
      for (var c = 0; c < 20; c++) { var d = document.createElement('div'); d.className = 'fp-cell'; grid.appendChild(d); }
      document.getElementById('fp-p').textContent = 'p = –'; document.getElementById('fp-p').className = 'fp-p';
      document.getElementById('fp-what').textContent = 'No analysis run yet.';
      update();
    }
    function test(pi, si) {
      var pts = data.filter(function (r) { return r.s[si]; }).map(function (r) { return { x: r.x[pi], y: r.y }; });
      var n = pts.length, r = L.corr(pts), t = r * Math.sqrt((n - 2) / (1 - r * r));
      return { n: n, r: r, p: 2 * (1 - L.Phi(Math.abs(t))) };
    }
    function step() {
      if (done.length >= 20) return;
      var pth = paths[done.length], res = test(pth[0], pth[1]);
      res.label = PRED[pth[0]] + ', ' + SUB[pth[1]];
      done.push(res);
      var cell = grid.children[done.length - 1];
      cell.className = 'fp-cell ' + (res.p < 0.05 ? 'sig' : 'ns');
      cell.textContent = res.p < 0.001 ? '<.001' : res.p.toFixed(2);
      cell.title = res.label + ': p = ' + res.p.toFixed(3);
      var pEl = document.getElementById('fp-p');
      pEl.textContent = 'p = ' + res.p.toFixed(3); pEl.className = 'fp-p' + (res.p < 0.05 ? ' sig' : '');
      document.getElementById('fp-what').innerHTML = 'Analysis ' + done.length + ': <b>' + res.label + '</b> (n = ' + res.n + ', r = ' + res.r.toFixed(3) + ')';
      update();
    }
    function update() {
      var sig = done.filter(function (d) { return d.p < 0.05; }).length;
      var fam = (1 - Math.pow(0.95, Math.max(done.length, 1))) * 100;
      document.getElementById('fp-run').textContent = done.length;
      document.getElementById('fp-sig').textContent = sig;
      document.getElementById('fp-fam').textContent = done.length ? fam.toFixed(0) + '%' : '–';
      var first = done.findIndex ? done.findIndex(function (d) { return d.p < 0.05; }) : -1;
      document.getElementById('fp-readout').innerHTML = !done.length
        ? 'Every variable here is random noise. Nothing predicts the outcome. Run analyses and count how long it takes to find a "result."'
        : (sig
          ? 'A "significant" finding appeared on analysis <b>' + (first + 1) + '</b>: ' + done[first].label + '. It is noise. A paper that reports only that analysis would look rigorous.'
          : 'No false positive yet. Had these ' + done.length + ' tests been independent, the chance of at least one would already be about <b>' + fam.toFixed(0) + '%</b>.');
      document.getElementById('fp-step').disabled = done.length >= 20;
      document.getElementById('fp-all').disabled = done.length >= 20;
    }
    document.getElementById('fp-step').addEventListener('click', step);
    document.getElementById('fp-all').addEventListener('click', function () { var iv = setInterval(function () { if (done.length >= 20) { clearInterval(iv); return; } step(); }, 80); });
    document.getElementById('fp-new').addEventListener('click', build);
    build();
  })();
  /* ============================================================
     V. BETWEEN AND WITHIN
     Fixed effects and variance components from Aref (2024),
     Comparative Sociology 23(2), Tables 1 to 5. The panel drawn
     here is simulated from those estimates; random slopes omitted.
     ============================================================ */
  (function () {
    var svg = document.getElementById('icc-chart'); if (!svg) return;
    var O = {
      gini: { w: 'Gini index', n: 'Gini index', b: 0.355, t: [0, 0.016, -0.001, 0.016], sc: 0.051, sr: 0.024, d: 3, lo: 0.1 },
      emp: { w: 'employment rate', n: 'Employment rate (%)', b: 69.947, t: [0, -2.322, -4.036, -4.954], sc: 6.52, sr: 1.64, d: 1, lo: 40 },
      unemp: { w: 'unemployment rate', n: 'Unemployment rate (%)', b: 4.767, t: [0, 2.597, 4.783, 5.483], sc: 3.77, sr: 1.98, d: 1, lo: 0.5 },
      le: { w: 'life expectancy', n: 'Life expectancy (years)', b: 81.318, t: [0, 0.556, 0.837, -0.261], sc: 3.553, sr: 0.387, d: 1, lo: 60 },
      im: { w: 'infant mortality rate', n: 'Infant mortality (per 1,000)', b: 3.739, t: [0, -0.426, -0.451, -0.301], sc: 1.104, sr: 0.394, d: 2, lo: 0.5 }
    };
    var key = 'gini', view = 'levels';
    var Y0 = 2002, Y1 = 2021, NC = 27;
    function per(y) { return y <= 2007 ? 0 : y <= 2010 ? 1 : y <= 2019 ? 2 : 3; }
    function sim(o) {
      var rand = L.rng(2024), rho = 0.6, inn = o.sr * Math.sqrt(1 - rho * rho), out = [];
      for (var c = 0; c < NC; c++) {
        var u = o.sc * L.normal(rand), e = o.sr * L.normal(rand), row = [];
        for (var y = Y0; y <= Y1; y++) {
          if (y > Y0) e = rho * e + inn * L.normal(rand);
          row.push(Math.max(o.lo, o.b + o.t[per(y)] + u + e));
        }
        var m = row.reduce(function (a, v) { return a + v; }, 0) / row.length;
        out.push({ v: row, m: m });
      }
      return out;
    }
    function draw() {
      var o = O[key], data = sim(o);
      var grand = data.reduce(function (a, c) { return a + c.m; }, 0) / NC;
      var series = data.map(function (c) { return c.v.map(function (v) { return view === 'levels' ? v : v - c.m + grand; }); });
      var all = []; data.forEach(function (c) { all = all.concat(c.v); });
      var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), pad = (hi - lo) * 0.06;
      L.clear(svg);
      var nar = L.narrow(), W = nar ? 360 : 660, H = nar ? 320 : 360, mL = 48, mR = 12, mT = 26, mB = 30;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var x = L.scale(Y0, Y1, mL, W - mR), y = L.scale(lo - pad, hi + pad, H - mB, mT);
      [[2008, 2010, 'Great Recession'], [2020, 2021, 'Pandemic']].forEach(function (b) {
        L.el(svg, 'rect', { x: x(b[0] - 0.5), y: mT, width: x(b[1] + 0.5) - x(b[0] - 0.5), height: H - mB - mT, fill: 'var(--accent-soft)', opacity: 0.6 });
        L.el(svg, 'text', { x: (x(b[0] - 0.5) + x(b[1] + 0.5)) / 2, y: mT - 8, 'text-anchor': 'middle' }, nar && b[2] === 'Great Recession' ? 'Recession' : b[2]);
      });
      for (var i = 0; i <= 4; i++) {
        var v = lo - pad + (hi - lo + 2 * pad) * i / 4;
        L.el(svg, 'line', { x1: mL, y1: y(v), x2: W - mR, y2: y(v), class: 'grid' });
        L.el(svg, 'text', { x: mL - 6, y: y(v) + 4, 'text-anchor': 'end' }, v.toFixed(o.d === 3 ? 2 : (o.d === 2 ? 1 : 0)));
      }
      [2002, 2006, 2010, 2014, 2018, 2021].forEach(function (t) { L.el(svg, 'text', { x: x(t), y: H - 10, 'text-anchor': 'middle' }, t); });
      series.forEach(function (s) {
        L.el(svg, 'polyline', { points: s.map(function (v, k) { return x(Y0 + k) + ',' + y(v); }).join(' '), fill: 'none', stroke: 'var(--c-blue)', 'stroke-width': 1.1, opacity: 0.4 });
      });
      var step = [];
      for (var yy = Y0; yy <= Y1; yy++) { var fv = o.b + o.t[per(yy)]; step.push(x(yy - (yy === Y0 ? 0 : 0.5)) + ',' + y(fv)); step.push(x(yy + (yy === Y1 ? 0 : 0.5)) + ',' + y(fv)); }
      L.el(svg, 'polyline', { points: step.join(' '), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.6 });
      var icc = o.sc * o.sc / (o.sc * o.sc + o.sr * o.sr);
      document.getElementById('icc-share').textContent = Math.round(icc * 100) + '%';
      document.getElementById('icc-within').textContent = Math.round((1 - icc) * 100) + '%';
      document.getElementById('icc-sds').textContent = o.sc + ' / ' + o.sr;
      document.getElementById('icc-readout').innerHTML = view === 'levels'
        ? 'In the published model of the <b>' + o.w + '</b>, ' + Math.round(icc * 100) + '% of the variance lies <b>between countries</b>. The gold line shows the period effects; the blue lines show how far each country sits from it.'
        : 'Remove each country’s own average and the lines collapse toward the gold line. What remains, ' + Math.round((1 - icc) * 100) + '% of the variance, is change <b>within countries</b> over time, the part that a recession or a pandemic can move.';
    }
    L.seg(document.getElementById('icc-seg'), function (v) { key = v; draw(); });
    L.seg(document.getElementById('icc-view'), function (v) { view = v; draw(); });
    draw(); L.onResize(draw);
  })();

  /* ============================================================
     VI. TWENTY YEARS ARE NOT TWENTY OBSERVATIONS
     AR(1) working correlation of 0.957 for the Gini index:
     Aref (2024), International Review of Economics 71, 401-420.
     ============================================================ */
  (function () {
    var svg = document.getElementById('ar-chart'); if (!svg) return;
    var N = 20, slider = document.getElementById('ar-rho'), out = document.getElementById('ar-rhoval');
    var seed = 7;
    function series(rho, rand) {
      var s = [], e = L.normal(rand), inn = Math.sqrt(1 - rho * rho);
      for (var i = 0; i < N; i++) { if (i) e = rho * e + inn * L.normal(rand); s.push(e); }
      return s;
    }
    function trend(s) {
      var mx = (N - 1) / 2, my = s.reduce(function (a, v) { return a + v; }, 0) / N, sxx = 0, sxy = 0;
      s.forEach(function (v, i) { sxx += (i - mx) * (i - mx); sxy += (i - mx) * (v - my); });
      var b = sxy / sxx, a = my - b * mx, sse = 0;
      s.forEach(function (v, i) { var r = v - a - b * i; sse += r * r; });
      var se = Math.sqrt(sse / (N - 2) / sxx);
      return { a: a, b: b, t: b / se };
    }
    function neff(rho) { var s = 0; for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) s += Math.pow(rho, Math.abs(i - j)); return N * N / s; }
    function fpr(rho) { var rand = L.rng(99), hit = 0, M = 600; for (var m = 0; m < M; m++) if (Math.abs(trend(series(rho, rand)).t) > 2.101) hit++; return hit / M; }
    function draw() {
      var rho = slider.value / 1000; out.textContent = rho.toFixed(3);
      var s = series(rho, L.rng(seed)), f = trend(s);
      L.clear(svg);
      var nar = L.narrow(), W = nar ? 360 : 660, H = nar ? 260 : 280, mL = 34, mR = 12, mT = 16, mB = 28;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var x = L.scale(0, N - 1, mL, W - mR), y = L.scale(-3, 3, H - mB, mT);
      [-2, 0, 2].forEach(function (v) { L.el(svg, 'line', { x1: mL, y1: y(v), x2: W - mR, y2: y(v), class: 'grid' }); L.el(svg, 'text', { x: mL - 6, y: y(v) + 4, 'text-anchor': 'end' }, v); });
      [0, 4, 8, 12, 16, 19].forEach(function (i) { L.el(svg, 'text', { x: x(i), y: H - 10, 'text-anchor': 'middle' }, 2002 + i); });
      L.el(svg, 'line', { x1: x(0), y1: y(f.a), x2: x(N - 1), y2: y(f.a + f.b * (N - 1)), stroke: Math.abs(f.t) > 2.101 ? 'var(--c-terra)' : 'var(--ink-faint)', 'stroke-width': 2, 'stroke-dasharray': '6 4' });
      L.el(svg, 'polyline', { points: s.map(function (v, i) { return x(i) + ',' + y(Math.max(-3, Math.min(3, v))); }).join(' '), fill: 'none', stroke: 'var(--c-blue)', 'stroke-width': 1.8 });
      s.forEach(function (v, i) { L.el(svg, 'circle', { cx: x(i), cy: y(Math.max(-3, Math.min(3, v))), r: 3.2, fill: 'var(--c-blue)' }); });
      var ne = neff(rho), fp = fpr(rho);
      document.getElementById('ar-neff').textContent = ne < 10 ? ne.toFixed(1) : Math.round(ne);
      document.getElementById('ar-fpr').textContent = Math.round(fp * 100) + '%';
      document.getElementById('ar-readout').innerHTML = 'This series has <b>no trend</b>. At a year-to-year correlation of ' + rho.toFixed(3) + ', twenty annual values carry about as much information about the mean as <b>' + (ne < 10 ? ne.toFixed(1) : Math.round(ne)) + '</b> independent observations. An ordinary trend test calls pure persistence a significant trend in <b>' + Math.round(fp * 100) + '%</b> of simulated series, against the nominal 5%.' + (Math.abs(f.t) > 2.101 ? ' The dashed line above is one such false finding.' : '');
    }
    slider.addEventListener('input', function () { document.querySelectorAll('#ar-seg button').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); draw(); });
    L.seg(document.getElementById('ar-seg'), function (v) { slider.value = Math.round(parseFloat(v) * 1000); draw(); });
    document.getElementById('ar-new').addEventListener('click', function () { seed = Math.floor(Math.random() * 1e6); draw(); });
    draw(); L.onResize(draw);
  })();

  /* ============================================================
     VII. TWENTY-SEVEN COUNTRIES, MANY VARIABLES
     Pure-noise predictors added one at a time to a regression
     with 27 cases, the size of the OECD sample in Aref (2024).
     ============================================================ */
  (function () {
    var svg = document.getElementById('sn-chart'); if (!svg) return;
    var N = 27, K = 24, slider = document.getElementById('sn-k'), out = document.getElementById('sn-kval');
    var path;
    function dot(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }
    function build(seed) {
      var rand = L.rng(seed), y = [], X = [];
      for (var i = 0; i < N; i++) y.push(L.normal(rand));
      var my = y.reduce(function (a, v) { return a + v; }, 0) / N; y = y.map(function (v) { return v - my; });
      var tss = dot(y, y), basis = [], r2 = [0];
      for (var k = 0; k < K; k++) {
        var v = []; for (var j = 0; j < N; j++) v.push(L.normal(rand));
        var mv = v.reduce(function (a, q) { return a + q; }, 0) / N; v = v.map(function (q) { return q - mv; });
        basis.forEach(function (q) { var c = dot(v, q); for (var j = 0; j < N; j++) v[j] -= c * q[j]; });
        var nv = Math.sqrt(dot(v, v)); v = v.map(function (q) { return q / nv; });
        basis.push(v);
        var ess = basis.reduce(function (a, q) { var c = dot(y, q); return a + c * c; }, 0);
        r2.push(ess / tss);
      }
      path = r2.map(function (r, k) { return { k: k, r2: r, adj: k ? 1 - (1 - r) * (N - 1) / (N - k - 1) : 0 }; });
    }
    function draw() {
      var k = +slider.value; out.textContent = k;
      L.clear(svg);
      var nar = L.narrow(), W = nar ? 360 : 660, H = nar ? 280 : 300, mL = 40, mR = 14, mT = 14, mB = 40;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var x = L.scale(0, K, mL, W - mR), y = L.scale(-1, 1, H - mB, mT);
      [-1, -0.5, 0, 0.5, 1].forEach(function (v) { L.el(svg, 'line', { x1: mL, y1: y(v), x2: W - mR, y2: y(v), class: v === 0 ? 'axis' : 'grid' }); L.el(svg, 'text', { x: mL - 6, y: y(v) + 4, 'text-anchor': 'end' }, v.toFixed(1)); });
      [0, 4, 8, 12, 16, 20, 24].forEach(function (v) { L.el(svg, 'text', { x: x(v), y: H - mB + 16, 'text-anchor': 'middle' }, v); });
      L.el(svg, 'text', { x: (mL + W - mR) / 2, y: H - 6, 'text-anchor': 'middle', class: 't-title' }, 'Number of pure-noise control variables');
      L.el(svg, 'line', { x1: x(0), y1: y(0), x2: x(K), y2: y(K / (N - 1)), stroke: 'var(--ink-faint)', 'stroke-dasharray': '4 4' });
      L.el(svg, 'line', { x1: x(k), y1: mT, x2: x(k), y2: H - mB, stroke: 'var(--ink)', opacity: 0.25 });
      L.el(svg, 'polyline', { points: path.map(function (p) { return x(p.k) + ',' + y(p.r2); }).join(' '), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.4 });
      L.el(svg, 'polyline', { points: path.map(function (p) { return x(p.k) + ',' + y(Math.max(-1, p.adj)); }).join(' '), fill: 'none', stroke: 'var(--c-blue)', 'stroke-width': 1.8 });
      var p = path[k];
      L.el(svg, 'circle', { cx: x(k), cy: y(p.r2), r: 5, fill: 'var(--accent)' });
      L.el(svg, 'circle', { cx: x(k), cy: y(Math.max(-1, p.adj)), r: 4.5, fill: 'var(--c-blue)' });
      document.getElementById('sn-r2').textContent = p.r2.toFixed(2);
      document.getElementById('sn-adj').textContent = p.adj.toFixed(2);
      document.getElementById('sn-df').textContent = N - k - 1;
      document.getElementById('sn-readout').innerHTML = k === 0
        ? 'The outcome is random noise for 27 countries. Add control variables, each also pure noise, and watch the fit.'
        : 'With <b>' + k + '</b> noise variables and 27 countries, the model “explains” <b>' + Math.round(p.r2 * 100) + '%</b> of the variance. Only <b>' + (N - k - 1) + '</b> degrees of freedom remain. Adjusted R² stays near zero on average, but in a single small sample it can swing widely.';
    }
    slider.addEventListener('input', draw);
    document.getElementById('sn-new').addEventListener('click', function () { build(Math.floor(Math.random() * 1e6)); draw(); });
    build(27); draw(); L.onResize(draw);
  })();
})();
