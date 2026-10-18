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
})();
