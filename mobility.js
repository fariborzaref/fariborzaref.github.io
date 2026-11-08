/* The Mobility Lab: five demonstrations. Data sources are listed in the page. */
(function () {
  var L = window.L;

  /* ============================================================
     I. THE MOBILITY LADDER
     Quintile transition probabilities implied by a rank-rank slope,
     using a Gaussian copula (Pearson r = 2 sin(pi * rho_s / 6)).
     Presets: Chetty, Hendren, Kline and Saez (2014), QJE 129(4):
     United States 0.341, Denmark 0.180.
     ============================================================ */
  (function () {
    var svg = document.getElementById('ladder-chart'); if (!svg) return;
    var slider = document.getElementById('lad-r'), out = document.getElementById('lad-rval');
    var Q = [-8, L.PhiInv(0.2), L.PhiInv(0.4), L.PhiInv(0.6), L.PhiInv(0.8), 8];
    var phi = function (x) { return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI); };
    function matrix(rs) {
      var r = 2 * Math.sin(Math.PI * rs / 6), s = Math.sqrt(Math.max(1e-9, 1 - r * r)), M = [];
      for (var i = 0; i < 5; i++) {
        M.push([]);
        var a = Math.max(-6, Q[i]), b = Math.min(6, Q[i + 1]), n = 240, h = (b - a) / n;
        for (var j = 0; j < 5; j++) {
          var sum = 0;
          for (var k = 0; k <= n; k++) {
            var x = a + k * h, w = (k === 0 || k === n) ? 1 : (k % 2 ? 4 : 2);
            sum += w * phi(x) * (L.Phi((Q[j + 1] - r * x) / s) - L.Phi((Q[j] - r * x) / s));
          }
          M[i].push(sum * h / 3 * 5);
        }
      }
      return M;
    }
    var NAMES = ['Bottom', 'Second', 'Middle', 'Fourth', 'Top'];
    function draw(fromPreset) {
      var rs = slider.value / 1000; out.textContent = rs.toFixed(3);
      if (!fromPreset) document.querySelectorAll('#lad-presets button').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      var M = matrix(rs);
      L.clear(svg);
      var nar = L.narrow(), W = nar ? 360 : 520, mL = nar ? 66 : 92, mT = 46, cell = (W - mL - 8) / 5, H = mT + cell * 5 + 44;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      L.el(svg, 'text', { x: mL, y: 14, class: 't-title' }, 'Children’s income fifth →');
      for (var j = 0; j < 5; j++) L.el(svg, 'text', { x: mL + cell * j + cell / 2, y: mT - 8, 'text-anchor': 'middle' }, NAMES[j]);
      for (var i = 0; i < 5; i++) {
        var row = 4 - i, y = mT + row * cell;
        L.el(svg, 'text', { x: mL - 8, y: y + cell / 2 + 4, 'text-anchor': 'end' }, NAMES[i]);
        for (var jj = 0; jj < 5; jj++) {
          var p = M[i][jj], x = mL + jj * cell;
          var rect = L.el(svg, 'rect', { x: x + 1, y: y + 1, width: cell - 2, height: cell - 2, fill: 'var(--accent)', 'fill-opacity': Math.min(1, 0.06 + p * 1.6) });
          L.el(svg, 'text', { x: x + cell / 2, y: y + cell / 2 + 5, 'text-anchor': 'middle', class: 't-label', style: 'fill:' + (p > 0.3 ? 'var(--card)' : 'var(--ink)') }, (p * 100).toFixed(nar ? 0 : 1) + '%');
          (function (i, jj, p, rect) {
            var h = function (e) { L.tip('Parents in the <b>' + NAMES[i].toLowerCase() + '</b> fifth<br>Children in the <b>' + NAMES[jj].toLowerCase() + '</b> fifth: <b>' + (p * 100).toFixed(1) + '%</b>', e); };
            rect.addEventListener('mousemove', h); rect.addEventListener('touchstart', h, { passive: true }); rect.addEventListener('mouseleave', function () { L.tip(null); });
          })(i, jj, p, rect);
        }
      }
      L.el(svg, 'rect', { x: mL, y: mT + 4 * cell, width: cell * 5, height: cell, fill: 'none', stroke: 'var(--c-blue)', 'stroke-width': 2 });
      L.el(svg, 'text', { x: mL - 8, y: mT + 5 * cell + 22, 'text-anchor': 'end', class: 't-title' }, 'Parents ↑');
      L.el(svg, 'text', { x: mL + cell * 2.5, y: mT + 5 * cell + 22, 'text-anchor': 'middle' }, nar ? 'Chance alone: 20% per cell' : 'Each row sums to 100%. Chance alone gives 20% in every cell.');
      document.getElementById('lad-up').textContent = (M[0][4] * 100).toFixed(1) + '%';
      document.getElementById('lad-stay').textContent = (M[0][0] * 100).toFixed(1) + '%';
      document.getElementById('lad-top').textContent = (M[4][4] * 100).toFixed(1) + '%';
      document.getElementById('lad-readout').innerHTML = rs < 0.005
        ? 'With no link between generations, a child’s fifth is independent of the parents’: <b>20%</b> land in every fifth, whatever their origin.'
        : 'At a rank-rank slope of <b>' + rs.toFixed(2) + '</b>, a child born in the bottom fifth has a <b>' + (M[0][4] * 100).toFixed(1) + '%</b> chance of reaching the top fifth, against <b>' + (M[4][4] * 100).toFixed(1) + '%</b> for a child born at the top.';
    }
    slider.addEventListener('input', function () { draw(false); });
    L.seg(document.getElementById('lad-presets'), function (v) { slider.value = Math.round(parseFloat(v) * 1000); draw(true); });
    draw(true); L.onResize(function () { draw(true); });
  })();

  /* ============================================================
     II. THE GREAT GATSBY CURVE
     Intergenerational earnings elasticities: Corak (2013), JEP 27(3).
     Gini of disposable income: OECD Income Distribution Database via
     Our World in Data, latest year 2020-2023 (as in the Inequality Lab).
     ============================================================ */
  (function () {
    var svg = document.getElementById('gatsby-chart'); if (!svg) return;
    var REG = {
      sd: { n: 'Social democratic', c: 'var(--c-blue)' }, co: { n: 'Conservative', c: 'var(--c-green)' },
      so: { n: 'Southern European', c: 'var(--c-gold)' }, li: { n: 'Liberal', c: 'var(--c-terra)' },
      ea: { n: 'East Asian', c: 'var(--c-plum)' }, la: { n: 'Latin American', c: 'var(--c-stone)' }
    };
    var D = [
      ['Denmark', 'DNK', 0.276, 0.15, 'sd', 2022], ['Norway', 'NOR', 0.262, 0.17, 'sd', 2022], ['Finland', 'FIN', 0.269, 0.18, 'sd', 2023],
      ['Sweden', 'SWE', 0.289, 0.27, 'sd', 2023], ['Canada', 'CAN', 0.306, 0.19, 'li', 2023], ['Australia', 'AUS', 0.319, 0.26, 'li', 2020],
      ['Germany', 'DEU', 0.309, 0.32, 'co', 2022], ['Japan', 'JPN', 0.338, 0.34, 'ea', 2021], ['Spain', 'ESP', 0.312, 0.40, 'so', 2023],
      ['France', 'FRA', 0.299, 0.41, 'co', 2023], ['United States', 'USA', 0.394, 0.47, 'li', 2023], ['Italy', 'ITA', 0.325, 0.50, 'so', 2023],
      ['United Kingdom', 'GBR', 0.367, 0.50, 'li', 2023], ['Chile', 'CHL', 0.448, 0.52, 'la', 2022]
    ].map(function (r) { return { n: r[0], k: r[1], g: r[2], e: r[3], reg: r[4], yr: r[5] }; });
    var leg = document.getElementById('gatsby-legend');
    ['sd', 'co', 'so', 'li', 'ea', 'la'].forEach(function (k) { var s = document.createElement('span'); s.innerHTML = '<i style="background:' + REG[k].c + '"></i>' + REG[k].n; leg.appendChild(s); });
    var dropChile = false;
    function draw() {
      var rows = dropChile ? D.filter(function (r) { return r.k !== 'CHL'; }) : D;
      var pts = rows.map(function (r) { return { x: r.g, y: r.e }; }), fit = L.ols(pts), rr = L.corr(pts);
      L.clear(svg);
      var nar = L.narrow(), W = nar ? 360 : 660, H = nar ? 340 : 380, mL = 46, mR = 16, mT = 16, mB = 44;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var x = L.scale(0.24, 0.47, mL, W - mR), y = L.scale(0.1, 0.6, H - mB, mT);
      [0.2, 0.3, 0.4, 0.5, 0.6].forEach(function (v) { L.el(svg, 'line', { x1: mL, y1: y(v), x2: W - mR, y2: y(v), class: 'grid' }); L.el(svg, 'text', { x: mL - 6, y: y(v) + 4, 'text-anchor': 'end' }, v.toFixed(1)); });
      [0.25, 0.30, 0.35, 0.40, 0.45].forEach(function (v) { L.el(svg, 'text', { x: x(v), y: H - mB + 18, 'text-anchor': 'middle' }, v.toFixed(2)); });
      L.el(svg, 'text', { x: (mL + W - mR) / 2, y: H - 6, 'text-anchor': 'middle', class: 't-title' }, 'Inequality: Gini of disposable income');
      L.el(svg, 'text', { x: mL, y: mT - 4, class: 't-title' }, 'Persistence: intergenerational earnings elasticity');
      L.el(svg, 'line', { x1: x(0.25), y1: y(fit.m * 0.25 + fit.b), x2: x(0.46), y2: y(fit.m * 0.46 + fit.b), stroke: 'var(--ink-faint)', 'stroke-width': 1.6, 'stroke-dasharray': '6 5' });
      D.forEach(function (r) {
        var off = dropChile && r.k === 'CHL';
        var c = L.el(svg, 'circle', { cx: x(r.g), cy: y(r.e), r: 6, fill: off ? 'none' : REG[r.reg].c, stroke: REG[r.reg].c, 'stroke-width': 1.6, opacity: off ? 0.5 : 1 });
        var lab = nar ? r.k : r.n, right = x(r.g) > W - 140 || r.k === 'NOR' || r.k === 'FRA';
        var dy = { FIN: -6, DNK: 10, NOR: 4, SWE: 0 }[r.k] || 4;
        L.el(svg, 'text', { x: x(r.g) + (right ? -10 : 10), y: y(r.e) + dy, 'text-anchor': right ? 'end' : 'start', class: 't-label', opacity: off ? 0.5 : 1 }, lab);
        var h = function (e) { L.tip('<b>' + r.n + '</b><br>' + REG[r.reg].n + ' regime<br>Earnings elasticity ' + r.e.toFixed(2) + '<br>Gini ' + r.g.toFixed(3) + ' (' + r.yr + ')', e); };
        c.addEventListener('mousemove', h); c.addEventListener('touchstart', h, { passive: true }); c.addEventListener('mouseleave', function () { L.tip(null); });
      });
      document.getElementById('gat-r').textContent = rr.toFixed(2);
      document.getElementById('gat-n').textContent = rows.length;
      document.getElementById('gat-readout').innerHTML = dropChile
        ? 'Without Chile, the most unequal case, the correlation is <b>' + rr.toFixed(2) + '</b> across ' + rows.length + ' countries. The pattern does not rest on one extreme point, a check worth running whenever the sample is small.'
        : 'Across these ' + rows.length + ' countries, the correlation between inequality and earnings persistence is <b>' + rr.toFixed(2) + '</b>. Where incomes are more unequal, more of a father’s earnings advantage reappears in his son’s.';
    }
    L.seg(document.getElementById('gatsby-seg'), function (v) { dropChile = v === 'nochile'; draw(); });
    draw(); L.onResize(draw);
  })();

  /* ============================================================
     III. GENERATIONS TO THE MIDDLE
     OECD (2018), A Broken Social Elevator? How to Promote Social
     Mobility, Figure 1.5: generations needed for the offspring of a
     family in the bottom 10% to reach mean income. Selected countries.
     ============================================================ */
  (function () {
    var svg = document.getElementById('gen-chart'); if (!svg) return;
    var D = [['Denmark', 2], ['Belgium', 4], ['Spain', 4], ['Italy', 5], ['Switzerland', 5], ['United Kingdom', 5], ['United States', 5], ['France', 6], ['China', 7], ['India', 7], ['Brazil', 9], ['Colombia', 11]];
    var AVG = 4.5, years = false;
    function draw() {
      L.clear(svg);
      var nar = L.narrow(), W = nar ? 360 : 880, rowH = 26, mT = 48, H = mT + D.length * rowH + 34, labW = nar ? 100 : 130, mR = 46;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var k = years ? 30 : 1, max = years ? 360 : 12;
      var x = L.scale(0, max, labW, W - mR);
      var ticks = years ? [0, 100, 200, 300] : [0, 2, 4, 6, 8, 10, 12];
      ticks.forEach(function (t) { L.el(svg, 'line', { x1: x(t), y1: mT - 8, x2: x(t), y2: H - 28, class: 'grid' }); L.el(svg, 'text', { x: x(t), y: H - 12, 'text-anchor': 'middle' }, t); });
      L.el(svg, 'text', { x: labW, y: 14, class: 't-title' }, years ? 'Years, at 30 years per generation' : 'Generations from the bottom tenth to the mean');
      D.forEach(function (d, i) {
        var y = mT + i * rowH, v = d[1] * k;
        L.el(svg, 'text', { x: labW - 10, y: y + rowH / 2 + 4, 'text-anchor': 'end', class: 't-label' }, nar ? d[0].replace('United Kingdom', 'UK').replace('United States', 'US') : d[0]);
        var bar = L.el(svg, 'rect', { x: labW, y: y + 5, width: x(v) - labW, height: rowH - 10, fill: d[1] > AVG ? 'var(--c-terra)' : 'var(--c-blue)', opacity: 0.85, class: 'move' });
        L.el(svg, 'text', { x: x(v) + 6, y: y + rowH / 2 + 4, class: 't-label' }, years ? v : d[1]);
        var h = function (e) { L.tip('<b>' + d[0] + '</b><br>' + d[1] + ' generations, about ' + d[1] * 30 + ' years', e); };
        bar.addEventListener('mousemove', h); bar.addEventListener('touchstart', h, { passive: true }); bar.addEventListener('mouseleave', function () { L.tip(null); });
      });
      L.el(svg, 'line', { x1: x(AVG * k), y1: mT - 26, x2: x(AVG * k), y2: H - 28, stroke: 'var(--ink)', 'stroke-width': 1.4, 'stroke-dasharray': '5 4' });
      L.el(svg, 'text', { x: x(AVG * k) + 5, y: mT - 12, class: 't-label' }, 'OECD average ' + (years ? AVG * 30 : AVG));
      document.getElementById('gen-readout').innerHTML = years
        ? 'At thirty years a generation, the OECD average is about <b>135 years</b>. In Colombia it is more than <b>three centuries</b>; in Denmark, about <b>sixty years</b>.'
        : 'A family starting in the bottom tenth needs <b>2</b> generations to reach the average in Denmark, <b>5</b> in the United States and the United Kingdom, and <b>11</b> in Colombia.';
    }
    L.seg(document.getElementById('gen-seg'), function (v) { years = v === 'years'; draw(); });
    draw(); L.onResize(draw);
  })();

  /* ============================================================
     IV. REGRESSION TO THE MEAN (simulated, after Galton 1886)
     Parent and child heights share a mean and spread; the child's
     expected deviation is the slope times the parent's deviation.
     ============================================================ */
  (function () {
    var svg = document.getElementById('galton-chart'); if (!svg) return;
    var slider = document.getElementById('gal-b'), out = document.getElementById('gal-bval');
    var MEAN = 68, SD = 1.8, N = 400, base = [];
    var rand = L.rng(1886);
    for (var i = 0; i < N; i++) base.push({ z: L.normal(rand), e: L.normal(rand) });
    var group = 'tall';
    function draw(fromPreset) {
      var b = slider.value / 100; out.textContent = b.toFixed(2);
      if (!fromPreset) document.querySelectorAll('#gal-preset button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      var pts = base.map(function (p) { return { x: MEAN + SD * p.z, y: MEAN + SD * (b * p.z + Math.sqrt(1 - b * b) * p.e) }; });
      var sorted = pts.slice().sort(function (a, c) { return a.x - c.x; });
      var cut = Math.round(N / 10), sel = group === 'tall' ? sorted.slice(N - cut) : sorted.slice(0, cut);
      var inSel = new Set(sel);
      var mx = sel.reduce(function (a, p) { return a + p.x; }, 0) / cut, my = sel.reduce(function (a, p) { return a + p.y; }, 0) / cut;
      L.clear(svg);
      var nar = L.narrow(), W = nar ? 360 : 660, H = nar ? 340 : 380, mL = 40, mR = 14, mT = 16, mB = 44;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var x = L.scale(62, 74, mL, W - mR), y = L.scale(62, 74, H - mB, mT);
      [64, 66, 68, 70, 72].forEach(function (v) {
        L.el(svg, 'line', { x1: mL, y1: y(v), x2: W - mR, y2: y(v), class: 'grid' }); L.el(svg, 'text', { x: mL - 6, y: y(v) + 4, 'text-anchor': 'end' }, v);
        L.el(svg, 'text', { x: x(v), y: H - mB + 18, 'text-anchor': 'middle' }, v);
      });
      L.el(svg, 'text', { x: (mL + W - mR) / 2, y: H - 6, 'text-anchor': 'middle', class: 't-title' }, 'Parent height, inches');
      L.el(svg, 'text', { x: mL, y: mT - 4, class: 't-title' }, 'Child height, inches');
      L.el(svg, 'line', { x1: x(62), y1: y(62), x2: x(74), y2: y(74), stroke: 'var(--ink-faint)', 'stroke-dasharray': '4 4' });
      L.el(svg, 'line', { x1: x(62), y1: y(MEAN + b * (62 - MEAN)), x2: x(74), y2: y(MEAN + b * (74 - MEAN)), stroke: 'var(--accent)', 'stroke-width': 2 });
      pts.forEach(function (p) {
        if (p.x < 62 || p.x > 74 || p.y < 62 || p.y > 74) return;
        var on = inSel.has(p);
        L.el(svg, 'circle', { cx: x(p.x), cy: y(p.y), r: on ? 3.4 : 2.6, fill: on ? 'var(--c-terra)' : 'var(--c-stone)', opacity: on ? 0.95 : 0.45 });
      });
      L.el(svg, 'line', { x1: x(mx), y1: y(62), x2: x(mx), y2: y(74), stroke: 'var(--c-terra)', 'stroke-width': 1.2, opacity: 0.6 });
      L.el(svg, 'line', { x1: x(62), y1: y(my), x2: x(74), y2: y(my), stroke: 'var(--c-blue)', 'stroke-width': 1.6 });
      L.el(svg, 'circle', { cx: x(mx), cy: y(my), r: 6, fill: 'var(--c-blue)', stroke: 'var(--card)', 'stroke-width': 2 });
      var dp = mx - MEAN, dc = my - MEAN;
      document.getElementById('gal-par').textContent = (dp > 0 ? '+' : '') + dp.toFixed(1);
      document.getElementById('gal-chi').textContent = (dc > 0 ? '+' : '') + dc.toFixed(1);
      document.getElementById('gal-closed').textContent = Math.round((1 - dc / dp) * 100) + '%';
      document.getElementById('gal-readout').innerHTML = 'Parents in the ' + (group === 'tall' ? 'tallest' : 'shortest') + ' tenth stand <b>' + Math.abs(dp).toFixed(1) + ' inches</b> ' + (dp > 0 ? 'above' : 'below') + ' the average. Their children stand <b>' + Math.abs(dc).toFixed(1) + ' inches</b> ' + (dc > 0 ? 'above' : 'below') + ' it. ' + (b > 0.97 ? 'With a slope of 1, height passes in full and nothing regresses.' : 'No cause pulled them toward the middle; an imperfect link between generations is enough.');
    }
    slider.addEventListener('input', function () { draw(false); });
    L.seg(document.getElementById('gal-seg'), function (v) { group = v; draw(true); });
    L.seg(document.getElementById('gal-preset'), function (v) { slider.value = Math.round(parseFloat(v) * 100); draw(true); });
    draw(true); L.onResize(function () { draw(true); });
  })();

  /* ============================================================
     V. ABSOLUTE AND RELATIVE MOBILITY (simulated)
     Parent and child log incomes are bivariate normal: sd 0.6 for
     parents, 0.6 x (1 + spread change) for children, correlation 0.35.
     Share earning more = Phi(ln(1 + g) / sd(child - parent)).
     ============================================================ */
  (function () {
    var svg = document.getElementById('abs-chart'); if (!svg) return;
    var gS = document.getElementById('abs-g'), dS = document.getElementById('abs-d'), gOut = document.getElementById('abs-gval'), dOut = document.getElementById('abs-dval');
    var SIG = 0.6, RHO = 0.35;
    function share(g, d) { var sc = SIG * (1 + d), sd = Math.sqrt(SIG * SIG + sc * sc - 2 * RHO * SIG * sc); return L.Phi(Math.log(1 + g) / sd); }
    function draw(fromPreset) {
      var g = gS.value / 100, d = dS.value / 100;
      gOut.textContent = (g >= 0 ? '+' : '') + Math.round(g * 100) + '%'; dOut.textContent = (d >= 0 ? '+' : '') + Math.round(d * 100) + '%';
      if (!fromPreset) document.querySelectorAll('#abs-seg button').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      L.clear(svg);
      var nar = L.narrow(), W = nar ? 360 : 660, H = nar ? 300 : 320, mL = 42, mR = 14, mT = 16, mB = 44;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var x = L.scale(0, 1.5, mL, W - mR), y = L.scale(0.4, 1, H - mB, mT);
      [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].forEach(function (v) { L.el(svg, 'line', { x1: mL, y1: y(v), x2: W - mR, y2: y(v), class: v === 0.5 ? 'axis' : 'grid' }); L.el(svg, 'text', { x: mL - 6, y: y(v) + 4, 'text-anchor': 'end' }, Math.round(v * 100) + '%'); });
      [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5].forEach(function (v) { L.el(svg, 'text', { x: x(v), y: H - mB + 18, 'text-anchor': 'middle' }, '+' + Math.round(v * 100) + '%'); });
      L.el(svg, 'text', { x: (mL + W - mR) / 2, y: H - 6, 'text-anchor': 'middle', class: 't-title' }, 'Growth in typical income between the generations');
      L.el(svg, 'text', { x: mL, y: mT - 4, class: 't-title' }, 'Children earning more than their parents');
      var base = [], cur = [];
      for (var t = 0; t <= 150; t += 2) { base.push(x(t / 100) + ',' + y(share(t / 100, 0))); cur.push(x(t / 100) + ',' + y(share(t / 100, d))); }
      L.el(svg, 'polyline', { points: base.join(' '), fill: 'none', stroke: 'var(--c-blue)', 'stroke-width': 1.6, 'stroke-dasharray': d === 0 ? '0' : '5 4', opacity: d === 0 ? 0 : 0.8 });
      L.el(svg, 'polyline', { points: cur.join(' '), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.4 });
      var s = share(g, d);
      L.el(svg, 'circle', { cx: x(g), cy: y(s), r: 6, fill: 'var(--accent)', stroke: 'var(--card)', 'stroke-width': 2 });
      document.getElementById('abs-share').textContent = Math.round(s * 100) + '%';
      document.getElementById('abs-legend').innerHTML = d === 0
        ? '<span><i class="line" style="background:var(--accent)"></i>children’s spread unchanged</span>'
        : '<span><i class="line" style="background:var(--accent)"></i>children’s spread ' + (d > 0 ? 'wider' : 'narrower') + ' by ' + Math.abs(Math.round(d * 100)) + '%</span><span><i class="line" style="background:var(--c-blue)"></i>spread unchanged</span>';
      document.getElementById('abs-readout').innerHTML = 'With typical income ' + (g > 0 ? 'up <b>' + Math.round(g * 100) + '%</b>' : '<b>flat</b>') + ' and the children’s distribution ' + (d === 0 ? 'as wide as their parents’' : (d > 0 ? '<b>' + Math.round(d * 100) + '% wider</b>' : '<b>' + Math.abs(Math.round(d * 100)) + '% narrower</b>')) + ', <b>' + Math.round(s * 100) + '%</b> of children out-earn their parents. The link between parents’ and children’s ranks is the same in every setting.';
    }
    gS.addEventListener('input', function () { draw(false); }); dS.addEventListener('input', function () { draw(false); });
    L.seg(document.getElementById('abs-seg'), function (v) { var p = v.split(','); gS.value = p[0]; dS.value = p[1]; draw(true); });
    draw(true); L.onResize(function () { draw(true); });
  })();
})();
