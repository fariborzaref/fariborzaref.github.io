/* The Inequality Lab: five demonstrations. Data sources are listed in the page. */
(function () {
  var L = window.L;

  /* ============================================================
     I. THE BIRTH LOTTERY
     Population: UN World Population Prospects, 2023 (millions).
     GNI per capita, PPP (current international $): World Bank, 2023.
     Life expectancy at birth: UN DESA, 2023.
     Mean years of schooling: UNDP Human Development Report 2025 (2023 data).
     ============================================================ */
  (function () {
    var C = [
      { n: 'India', pop: 1428, gni: 11000, life: 72.0, sch: 6.9 },
      { n: 'China', pop: 1425, gni: 26920, life: 78.0, sch: 8.0 },
      { n: 'the United States', pop: 340, gni: 85980, life: 79.3, sch: 13.9 },
      { n: 'Indonesia', pop: 277, gni: 16010, life: 71.2, sch: 8.7 },
      { n: 'Pakistan', pop: 240, gni: 6100, life: 67.7, sch: 4.3 },
      { n: 'Nigeria', pop: 224, gni: 8850, life: 54.5, sch: 7.6 },
      { n: 'Brazil', pop: 216, gni: 21590, life: 75.9, sch: 8.4 },
      { n: 'Bangladesh', pop: 173, gni: 10060, life: 74.7, sch: 6.8 },
      { n: 'Russia', pop: 144, gni: 46780, life: 73.2, sch: 12.4 },
      { n: 'Mexico', pop: 128, gni: 25030, life: 75.1, sch: 9.3 },
      { n: 'Ethiopia', pop: 127, gni: 3280, life: 67.3, sch: 2.4 },
      { n: 'Japan', pop: 123, gni: 55120, life: 84.7, sch: 12.7 },
      { n: 'the Philippines', pop: 117, gni: 13300, life: 69.8, sch: 10.0 },
      { n: 'Egypt', pop: 113, gni: 18320, life: 71.6, sch: 10.1 },
      { n: 'the DR Congo', pop: 102, gni: 1760, life: 61.9, sch: 7.4 },
      { n: 'Vietnam', pop: 99, gni: 15850, life: 74.6, sch: 9.0 },
      { n: 'Iran', pop: 89, gni: 19820, life: 77.7, sch: 10.8 },
      { n: 'Turkey', pop: 85, gni: 44600, life: 77.2, sch: 9.0 },
      { n: 'Germany', pop: 84, gni: 74880, life: 81.4, sch: 14.3 },
      { n: 'Colombia', pop: 52, gni: 21420, life: 77.7, sch: 9.0 },
      { n: 'Chad', pop: 18, gni: 2710, life: 55.1, sch: 2.3 },
      { n: 'Burundi', pop: 13, gni: 1200, life: 63.7, sch: 3.5 },
      { n: 'Switzerland', pop: 8.8, gni: 91100, life: 84.0, sch: 13.9 },
      { n: 'Norway', pop: 5.5, gni: 105770, life: 83.3, sch: 13.1 },
      { n: 'Qatar', pop: 2.7, gni: 121930, life: 82.4, sch: 10.8 }
    ];
    var root = document.getElementById('lottery-panel'); if (!root) return;
    var TOTAL = C.reduce(function (a, c) { return a + c.pop; }, 0);
    function wavg(k) { return C.reduce(function (a, c) { return a + c[k] * c.pop; }, 0) / TOTAL; }
    var AVG = { life: wavg('life'), gni: wavg('gni'), sch: wavg('sch') };
    // share of sample population living in a country with lower GNI per capita
    function pctBelow(c) { return C.filter(function (o) { return o.gni < c.gni; }).reduce(function (a, o) { return a + o.pop; }, 0) / TOTAL * 100; }
    var richPct = C.filter(function (c) { return c.gni >= 50000; }).reduce(function (a, c) { return a + c.pop; }, 0) / TOTAL * 100;

    var R = { life: [50, 86], gni: [1000, 125000], sch: [0, 15] };
    function pos(k, v) {
      if (k === 'gni') { var lo = Math.log(R.gni[0]), hi = Math.log(R.gni[1]); return Math.max(1, Math.min(100, (Math.log(v) - lo) / (hi - lo) * 100)); }
      return Math.max(1, Math.min(100, (v - R[k][0]) / (R[k][1] - R[k][0]) * 100));
    }
    ['life', 'gni', 'sch'].forEach(function (k) { document.getElementById('t-' + k).style.left = pos(k, AVG[k]) + '%'; });

    var nameEl = document.getElementById('lot-name'), bandEl = document.getElementById('lot-band'),
        bars = document.getElementById('lot-bars'), take = document.getElementById('lot-take'),
        tally = document.getElementById('lot-tally'), btn = document.getElementById('lot-go');
    var births = 0, rich = 0, spinning = false;
    function pick() { var r = Math.random() * TOTAL, acc = 0; for (var i = 0; i < C.length; i++) { acc += C[i].pop; if (r <= acc) return C[i]; } return C[C.length - 1]; }

    function reveal(c) {
      nameEl.textContent = c.n.charAt(0).toUpperCase() + c.n.slice(1);
      nameEl.classList.remove('spin');
      var below = pctBelow(c);
      bandEl.textContent = 'Chance of this draw: ' + (c.pop / TOTAL * 100).toFixed(1) + '%. ' + (below < 0.5 ? 'This is the poorest country in the sample.' : 'Share of the sample living in poorer countries: ' + Math.round(below) + '%.');
      document.getElementById('v-life').textContent = c.life.toFixed(1) + ' years';
      document.getElementById('v-gni').textContent = '$' + L.fmt(c.gni);
      document.getElementById('v-sch').textContent = c.sch.toFixed(1) + ' years';
      bars.classList.add('show');
      requestAnimationFrame(function () {
        document.getElementById('f-life').style.width = pos('life', c.life) + '%';
        document.getElementById('f-gni').style.width = pos('gni', c.gni) + '%';
        document.getElementById('f-sch').style.width = pos('sch', c.sch) + '%';
      });
      var isRich = c.gni >= 50000;
      take.textContent = isRich
        ? 'A rare draw. Only about ' + Math.round(richPct) + '% of this population is born where income per person exceeds $50,000.'
        : (c.gni < 5000
          ? 'Average income here is about ' + Math.round(AVG.gni / c.gni) + ' times lower than the sample average. Nothing about the person drawn explains that gap.'
          : 'The most common kind of draw: a middle-income country, far from the poorest and far from the richest.');
      births++; if (isRich) rich++;
      tally.innerHTML = 'Births so far: <b>' + births + '</b> &middot; born where income exceeds $50,000: <b>' + rich + '</b> &middot; expected share: ' + Math.round(richPct) + '%';
      btn.innerHTML = 'Be born again';
    }
    btn.addEventListener('click', function () {
      if (spinning) return; spinning = true;
      bars.classList.remove('show'); take.textContent = ''; bandEl.textContent = '';
      nameEl.classList.add('spin');
      var ticks = 0, target = 14 + Math.floor(Math.random() * 6);
      var iv = setInterval(function () {
        var c = C[Math.floor(Math.random() * C.length)].n.replace(/^the /, '');
        nameEl.textContent = c;
        if (++ticks >= target) { clearInterval(iv); spinning = false; reveal(pick()); }
      }, 55);
    });
  })();

  /* ============================================================
     II. THE CHAMPAGNE GLASS
     World Inequality Report 2022, global shares for 2021:
     income bottom 50% 8.5, middle 40% 39.5, top 10% 52;
     wealth bottom 50% 2, middle 40% 22, top 10% 76.
     Decile splits inside each group are interpolated.
     ============================================================ */
  (function () {
    var svg = document.getElementById('glass-chart'); if (!svg) return;
    var DATA = {
      income: [0.3, 0.8, 1.5, 2.4, 3.5, 5.2, 7.4, 10.7, 16.2, 52],
      wealth: [0.0, 0.1, 0.3, 0.6, 1.0, 1.6, 3.0, 5.8, 11.6, 76]
    };
    var GROUP = { income: [8.5, 39.5, 52], wealth: [2, 22, 76] };
    var mode = 'income';
    var readout = document.getElementById('glass-readout');
    var COL = function (i) { return i === 9 ? 'var(--accent)' : (i >= 5 ? 'var(--c-blue)' : 'var(--c-stone)'); };

    function draw() {
      L.clear(svg);
      var W = L.narrow() ? 360 : 640, H = 420;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var labW = L.narrow() ? 74 : 110, valW = 48, cx = labW + (W - labW - valW) / 2, maxHalf = (W - labW - valW) / 2;
      var rowH = (H - 40) / 10, d = DATA[mode];
      var x = function (v) { return v / 80 * maxHalf; };
      L.el(svg, 'line', { x1: cx, y1: 10, x2: cx, y2: H - 30, class: 'grid' });
      for (var k = 9; k >= 0; k--) {
        var y = 10 + (9 - k) * rowH, w = Math.max(1.5, x(d[k]));
        var r = L.el(svg, 'rect', { x: cx - w, y: y + 3, width: 2 * w, height: rowH - 6, fill: COL(k), class: 'move' });
        var lbl = k === 9 ? 'Richest 10%' : k === 0 ? 'Poorest 10%' : 'Decile ' + (k + 1);
        L.el(svg, 'text', { x: 0, y: y + rowH / 2 + 4, class: k === 9 || k === 0 ? 't-label' : '' }, lbl);
        L.el(svg, 'text', { x: W, y: y + rowH / 2 + 4, 'text-anchor': 'end', class: 't-label' }, (d[k] < 10 ? d[k].toFixed(1) : Math.round(d[k])) + '%');
        (function (k, r) {
          var h = function (e) { L.tip('<b>' + (k === 9 ? 'Richest tenth' : k === 0 ? 'Poorest tenth' : 'Decile ' + (k + 1)) + '</b><br>' + d[k].toFixed(1) + '% of world ' + mode, e); };
          r.addEventListener('mousemove', h); r.addEventListener('touchstart', h, { passive: true }); r.addEventListener('mouseleave', function () { L.tip(null); });
        })(k, r);
      }
      L.el(svg, 'text', { x: cx, y: H - 8, 'text-anchor': 'middle', class: 't-title' }, 'Width of each bar = share of world ' + mode + ' held by that tenth of adults');
      var g = GROUP[mode];
      document.getElementById('gl-top').textContent = g[2] + '%';
      document.getElementById('gl-mid').textContent = g[1] + '%';
      document.getElementById('gl-bot').textContent = g[0] + '%';
      readout.innerHTML = mode === 'income'
        ? 'The richest tenth of adults receives <b>52%</b> of world income. The poorest half receives <b>8.5%</b>. The top tenth therefore earns about six times what the bottom half earns in total.'
        : 'Wealth is far more concentrated than income. The richest tenth owns <b>76%</b> of world wealth. The poorest half owns <b>2%</b>.';
    }
    L.seg(document.getElementById('glass-seg'), function (v) { mode = v; draw(); });
    draw(); L.onResize(draw);
  })();

  /* ============================================================
     III. THE LORENZ CURVE AND THE GINI COEFFICIENT
     Lognormal approximation: sigma = sqrt(2) * PhiInv((G + 1) / 2),
     L(p) = Phi(PhiInv(p) - sigma).
     Presets: OECD Income Distribution Database via Our World in Data.
     ============================================================ */
  (function () {
    var svg = document.getElementById('lorenz-chart'); if (!svg) return;
    var slider = document.getElementById('lz-g'), gOut = document.getElementById('lz-gval');
    var PRESETS = [
      { k: 'BEL', n: 'Belgium, after taxes and transfers (2023)', g: 0.254 },
      { k: 'GBR', n: 'United Kingdom, after taxes and transfers (2023)', g: 0.367 },
      { k: 'USA', n: 'United States, after taxes and transfers (2023)', g: 0.394 },
      { k: 'CHL', n: 'Chile, after taxes and transfers (2022)', g: 0.448 },
      { k: 'USM', n: 'United States, market income (2023)', g: 0.506 }
    ];
    var presetBox = document.getElementById('lz-presets');
    PRESETS.forEach(function (p) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('data-v', p.g); b.setAttribute('aria-pressed', 'false');
      b.textContent = p.k === 'USM' ? 'US market' : p.k; b.title = p.n;
      presetBox.appendChild(b);
    });
    L.seg(presetBox, function (v) { slider.value = Math.round(parseFloat(v) * 1000); update(true); });

    function lor(p, s) { if (p <= 0) return 0; if (p >= 1) return 1; return L.Phi(L.PhiInv(p) - s); }

    function update(fromPreset) {
      var G = slider.value / 1000;
      if (!fromPreset) presetBox.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      var s = Math.SQRT2 * L.PhiInv((G + 1) / 2);
      gOut.textContent = G.toFixed(3);
      L.clear(svg);
      var S = L.narrow() ? 330 : 420, m = 40;
      svg.setAttribute('viewBox', '0 0 ' + (S + m + 14) + ' ' + (S + m + 10));
      var x = L.scale(0, 1, m, m + S), y = L.scale(0, 1, S + 6, 6);
      [0.25, 0.5, 0.75].forEach(function (v) {
        L.el(svg, 'line', { x1: x(v), y1: y(0), x2: x(v), y2: y(1), class: 'grid' });
        L.el(svg, 'line', { x1: x(0), y1: y(v), x2: x(1), y2: y(v), class: 'grid' });
      });
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
        L.el(svg, 'text', { x: x(v), y: y(0) + 18, 'text-anchor': 'middle' }, Math.round(v * 100) + '%');
        L.el(svg, 'text', { x: x(0) - 8, y: y(v) + 4, 'text-anchor': 'end' }, Math.round(v * 100) + '%');
      });
      L.el(svg, 'rect', { x: x(0), y: y(1), width: S, height: S, fill: 'none', class: 'axis' });
      var pts = [], area = ['M', x(0), y(0)];
      for (var i = 0; i <= 200; i++) { var p = i / 200, l = lor(p, s); pts.push(x(p) + ',' + y(l)); }
      L.el(svg, 'path', { d: 'M' + x(0) + ',' + y(0) + ' L' + x(1) + ',' + y(1) + ' L' + pts.slice().reverse().join(' L') + ' Z', fill: 'var(--accent-soft)' });
      L.el(svg, 'line', { x1: x(0), y1: y(0), x2: x(1), y2: y(1), stroke: 'var(--ink-faint)', 'stroke-dasharray': '4 4' });
      L.el(svg, 'polyline', { points: pts.join(' '), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.2 });
      var b50 = lor(0.5, s), t10 = 1 - lor(0.9, s);
      L.el(svg, 'circle', { cx: x(0.5), cy: y(b50), r: 4.5, fill: 'var(--c-blue)' });
      L.el(svg, 'circle', { cx: x(0.9), cy: y(1 - t10), r: 4.5, fill: 'var(--c-terra)' });
      L.el(svg, 'text', { x: x(0.42), y: y(0.6), class: 't-serif', 'font-style': 'italic', 'text-anchor': 'end' }, 'line of equality');
      L.el(svg, 'text', { x: x(0.5), y: y(0) + 34, 'text-anchor': 'middle', class: 't-title' }, 'Cumulative share of people, poorest first');
      document.getElementById('lz-b50').textContent = (b50 * 100).toFixed(1) + '%';
      document.getElementById('lz-t10').textContent = (t10 * 100).toFixed(1) + '%';
      document.getElementById('lz-ratio').textContent = (t10 / 0.1 / (b50 / 0.5)).toFixed(1) + '×';
      // hover read-off
      var hit = L.el(svg, 'rect', { x: x(0), y: y(1), width: S, height: S, fill: 'transparent' });
      var cur = L.el(svg, 'line', { y1: y(0), y2: y(1), stroke: 'var(--ink)', 'stroke-width': 1, opacity: 0 });
      function mv(e) {
        var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, cx = (e.touches ? e.touches[0].clientX : e.clientX);
        var px = (cx - r.left) / r.width * vb.width, p = Math.max(0.01, Math.min(0.99, x.inv(px)));
        cur.setAttribute('x1', x(p)); cur.setAttribute('x2', x(p)); cur.setAttribute('opacity', 0.35);
        L.tip('The poorest <b>' + Math.round(p * 100) + '%</b> of people<br>hold <b>' + (lor(p, s) * 100).toFixed(1) + '%</b> of income', e);
      }
      hit.addEventListener('mousemove', mv); hit.addEventListener('touchmove', mv, { passive: true });
      hit.addEventListener('mouseleave', function () { cur.setAttribute('opacity', 0); L.tip(null); });
      document.getElementById('lz-readout').innerHTML =
        'At a Gini of <b>' + G.toFixed(2) + '</b>, the poorest half of the population receives <b>' + (b50 * 100).toFixed(1) + '%</b> of income. The Gini is twice the shaded area: the gap between this curve and perfect equality.';
    }
    slider.addEventListener('input', function () { update(false); });
    update(false); L.onResize(function () { update(true); });
  })();

  /* ============================================================
     IV. REDISTRIBUTION BY WELFARE REGIME
     Gini of equivalised household income, total population,
     before taxes and transfers (market) and after (disposable).
     OECD Income Distribution Database, via Our World in Data.
     ============================================================ */
  (function () {
    var svg = document.getElementById('redist-chart'); if (!svg) return;
    var REG = {
      sd: { n: 'Social democratic', c: 'var(--c-blue)' },
      co: { n: 'Conservative', c: 'var(--c-green)' },
      so: { n: 'Southern European', c: 'var(--c-gold)' },
      li: { n: 'Liberal', c: 'var(--c-terra)' },
      ea: { n: 'East Asian', c: 'var(--c-plum)' },
      la: { n: 'Latin American', c: 'var(--c-stone)' }
    };
    var D = [
      ['Finland', 2023, 0.509, 0.269, 'sd'], ['Denmark', 2022, 0.442, 0.276, 'sd'], ['Norway', 2022, 0.434, 0.262, 'sd'], ['Sweden', 2023, 0.432, 0.289, 'sd'],
      ['Belgium', 2023, 0.486, 0.254, 'co'], ['Austria', 2023, 0.492, 0.288, 'co'], ['France', 2023, 0.517, 0.299, 'co'], ['Germany', 2022, 0.505, 0.309, 'co'], ['Netherlands', 2023, 0.442, 0.291, 'co'],
      ['Italy', 2023, 0.509, 0.325, 'so'], ['Spain', 2023, 0.477, 0.312, 'so'],
      ['Ireland', 2023, 0.477, 0.281, 'li'], ['Canada', 2023, 0.433, 0.306, 'li'], ['United Kingdom', 2023, 0.522, 0.367, 'li'], ['Australia', 2020, 0.441, 0.319, 'li'], ['United States', 2023, 0.506, 0.394, 'li'],
      ['Japan', 2021, 0.513, 0.338, 'ea'], ['South Korea', 2022, 0.396, 0.324, 'ea'],
      ['Chile', 2022, 0.491, 0.448, 'la'], ['Mexico', 2022, 0.416, 0.400, 'la']
    ].map(function (r) { return { n: r[0], yr: r[1], m: r[2], d: r[3], reg: r[4], red: (r[2] - r[3]) / r[2] * 100 }; });
    var ORDER = ['sd', 'co', 'so', 'li', 'ea', 'la'];
    var sortBy = 'reduction';
    var leg = document.getElementById('redist-legend');
    ORDER.forEach(function (k) { var s = document.createElement('span'); s.innerHTML = '<i style="background:' + REG[k].c + '"></i>' + REG[k].n; leg.appendChild(s); });

    function draw() {
      var rows = D.slice();
      if (sortBy === 'reduction') rows.sort(function (a, b) { return b.red - a.red; });
      else rows.sort(function (a, b) { return ORDER.indexOf(a.reg) - ORDER.indexOf(b.reg) || b.red - a.red; });
      L.clear(svg);
      var nar = L.narrow(), W = nar ? 360 : 680, rowH = nar ? 22 : 21, top = nar ? 50 : 34, H = top + rows.length * rowH + 30;
      var labW = nar ? 92 : 118, right = nar ? 44 : 64;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var x = L.scale(0.2, 0.55, labW, W - right);
      [0.2, 0.3, 0.4, 0.5].forEach(function (v) {
        L.el(svg, 'line', { x1: x(v), y1: top - 8, x2: x(v), y2: H - 26, class: 'grid' });
        L.el(svg, 'text', { x: x(v), y: H - 10, 'text-anchor': 'middle' }, v.toFixed(2));
      });
      L.el(svg, 'text', { x: labW, y: 14, class: 't-title' }, 'Gini coefficient');
      L.el(svg, 'text', { x: W, y: 14, 'text-anchor': 'end', class: 't-title' }, 'Reduction');
      // marker legend
      var lx = nar ? labW : x(0.42), ly = nar ? 30 : 10;
      L.el(svg, 'circle', { cx: lx + 4, cy: ly, r: 4, fill: 'none', stroke: 'var(--ink-soft)', 'stroke-width': 1.5 });
      L.el(svg, 'text', { x: lx + 12, y: ly + 4 }, 'market');
      L.el(svg, 'circle', { cx: lx + 70, cy: ly, r: 4.5, fill: 'var(--ink-soft)' });
      L.el(svg, 'text', { x: lx + 78, y: ly + 4 }, 'disposable');
      rows.forEach(function (r, i) {
        var y = top + i * rowH + rowH / 2, c = REG[r.reg].c;
        var g = L.el(svg, 'g', {});
        L.el(g, 'rect', { x: 0, y: y - rowH / 2, width: W, height: rowH, fill: 'transparent' });
        L.el(g, 'text', { x: labW - 10, y: y + 4, 'text-anchor': 'end', class: 't-label' }, nar ? r.n.replace('United Kingdom', 'UK').replace('United States', 'US').replace('South Korea', 'Korea').replace('Netherlands', 'Neth.') : r.n);
        L.el(g, 'line', { x1: x(r.m), y1: y, x2: x(r.d), y2: y, stroke: c, 'stroke-width': 3, opacity: 0.55 });
        L.el(g, 'circle', { cx: x(r.m), cy: y, r: 4.5, fill: 'var(--card)', stroke: c, 'stroke-width': 1.6 });
        L.el(g, 'circle', { cx: x(r.d), cy: y, r: 5, fill: c });
        L.el(g, 'text', { x: W, y: y + 4, 'text-anchor': 'end', class: 't-label' }, Math.round(r.red) + '%');
        var h = function (e) {
          L.tip('<b>' + r.n + '</b> (' + r.yr + ')<br>' + REG[r.reg].n + ' regime<br>Market income Gini ' + r.m.toFixed(3) + '<br>Disposable income Gini ' + r.d.toFixed(3) + '<br>Reduction <b>' + r.red.toFixed(1) + '%</b>', e);
          document.getElementById('redist-readout').innerHTML = 'In <b>' + r.n + '</b>, taxes and transfers lower the Gini from ' + r.m.toFixed(2) + ' to ' + r.d.toFixed(2) + ', a reduction of <b>' + r.red.toFixed(0) + '%</b>.';
        };
        g.addEventListener('mousemove', h); g.addEventListener('touchstart', h, { passive: true });
        g.addEventListener('mouseleave', function () { L.tip(null); });
      });
    }
    // summary statistics
    var mk = D.map(function (r) { return r.m; }), dp = D.map(function (r) { return r.d; });
    document.getElementById('rd-mrange').textContent = Math.min.apply(null, mk).toFixed(2) + '–' + Math.max.apply(null, mk).toFixed(2);
    document.getElementById('rd-drange').textContent = Math.min.apply(null, dp).toFixed(2) + '–' + Math.max.apply(null, dp).toFixed(2);
    L.seg(document.getElementById('redist-seg'), function (v) { sortBy = v; draw(); });
    draw(); L.onResize(draw);
  })();

  /* ============================================================
     V. THE GREAT DIVERGENCE
     GDP per capita, 1990 international Geary-Khamis dollars.
     A. Maddison, Contours of the World Economy, 1-2030 AD (2007), table A.7.
     Values between benchmark years are interpolated on a log scale.
     ============================================================ */
  (function () {
    var svg = document.getElementById('div-chart'); if (!svg) return;
    var YRS = [1820, 1870, 1913, 1950, 1973, 2008];
    var REG = [
      { n: 'Western offshoots', v: [1202, 2419, 5233, 9268, 16179, 30152], c: 'var(--c-terra)' },
      { n: 'Japan', v: [669, 737, 1387, 1921, 11434, 22816], c: 'var(--c-plum)' },
      { n: 'Western Europe', v: [1202, 1960, 3457, 4578, 11417, 21672], c: 'var(--c-blue)' },
      { n: 'Eastern Europe', v: [683, 937, 1695, 2111, 4988, 8569], c: 'var(--c-green)' },
      { n: 'Latin America', v: [691, 676, 1493, 2503, 4513, 6973], c: 'var(--c-gold)' },
      { n: 'Asia, excluding Japan', v: [577, 548, 658, 639, 1225, 5611], c: 'var(--accent)' },
      { n: 'Africa', v: [420, 500, 637, 890, 1410, 1780], c: 'var(--c-stone)' }
    ];
    function at(r, yr) {
      for (var i = 0; i < YRS.length - 1; i++) {
        if (yr <= YRS[i + 1]) { var t = (yr - YRS[i]) / (YRS[i + 1] - YRS[i]); return Math.exp(Math.log(r.v[i]) * (1 - t) + Math.log(r.v[i + 1]) * t); }
      }
      return r.v[r.v.length - 1];
    }
    var slider = document.getElementById('div-year'), yrOut = document.getElementById('div-yval');
    var logScale = true;
    function draw() {
      var yr = +slider.value; yrOut.textContent = yr;
      L.clear(svg);
      var nar = L.narrow(), W = nar ? 360 : 680, H = nar ? 360 : 380, mL = 48, mR = nar ? 10 : 150, mT = 14, mB = 34;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var x = L.scale(1820, 2008, mL, W - mR);
      var lo = logScale ? Math.log(300) : 0, hi = logScale ? Math.log(40000) : 32000;
      var yv = function (v) { return logScale ? Math.log(v) : v; };
      var y = L.scale(lo, hi, H - mB, mT);
      var ticks = logScale ? [500, 1000, 2000, 5000, 10000, 20000] : [0, 5000, 10000, 15000, 20000, 25000, 30000];
      ticks.forEach(function (t) {
        L.el(svg, 'line', { x1: mL, y1: y(yv(t)), x2: W - mR, y2: y(yv(t)), class: 'grid' });
        L.el(svg, 'text', { x: mL - 6, y: y(yv(t)) + 4, 'text-anchor': 'end' }, t >= 1000 ? (t / 1000) + 'k' : t);
      });
      YRS.forEach(function (t) { L.el(svg, 'text', { x: x(t), y: H - 12, 'text-anchor': 'middle' }, t); });
      REG.forEach(function (r) {
        var pts = []; for (var t = 1820; t <= 2008; t += 2) pts.push(x(t) + ',' + y(yv(at(r, t))));
        L.el(svg, 'polyline', { points: pts.join(' '), fill: 'none', stroke: r.c, 'stroke-width': 1.6, opacity: 0.3 });
        var pts2 = []; for (var t2 = 1820; t2 <= yr; t2 += 1) pts2.push(x(t2) + ',' + y(yv(at(r, t2))));
        if (pts2.length > 1) L.el(svg, 'polyline', { points: pts2.join(' '), fill: 'none', stroke: r.c, 'stroke-width': 2.4 });
        L.el(svg, 'circle', { cx: x(yr), cy: y(yv(at(r, yr))), r: 4, fill: r.c });
      });
      L.el(svg, 'line', { x1: x(yr), y1: mT, x2: x(yr), y2: H - mB, stroke: 'var(--ink)', 'stroke-width': 1, opacity: 0.25 });
      // labels at right, spaced
      if (!nar) {
        var lab = REG.map(function (r) { return { r: r, y: y(yv(at(r, yr))) }; }).sort(function (a, b) { return a.y - b.y; });
        for (var i = 1; i < lab.length; i++) if (lab[i].y - lab[i - 1].y < 15) lab[i].y = lab[i - 1].y + 15;
        var floor = H - mB; if (lab[lab.length - 1].y > floor) { lab[lab.length - 1].y = floor; for (var j = lab.length - 2; j >= 0; j--) if (lab[j + 1].y - lab[j].y < 15) lab[j].y = lab[j + 1].y - 15; }
        lab.forEach(function (o) { L.el(svg, 'text', { x: x(yr) + 10, y: o.y + 4, fill: o.r.c, class: 't-label', style: 'fill:' + o.r.c }, o.r.n + '  $' + L.fmt(Math.round(at(o.r, yr) / 10) * 10)); });
      }
      var vals = REG.map(function (r) { return at(r, yr); });
      var mx = Math.max.apply(null, vals), mn = Math.min.apply(null, vals);
      var top = REG[vals.indexOf(mx)].n, bot = REG[vals.indexOf(mn)].n;
      document.getElementById('div-ratio').textContent = (mx / mn).toFixed(1) + '×';
      document.getElementById('div-readout').innerHTML = 'In <b>' + yr + '</b>, average income per person in ' + top.replace(/^(\w)/, function (c) { return c; }) + ' was <b>' + (mx / mn).toFixed(1) + ' times</b> that of ' + bot + '.';
      if (nar) {
        var list = document.getElementById('div-list'); list.innerHTML = '';
        REG.slice().sort(function (a, b) { return at(b, yr) - at(a, yr); }).forEach(function (r) {
          var s = document.createElement('span'); s.innerHTML = '<i style="background:' + r.c + '"></i>' + r.n + ' $' + L.fmt(Math.round(at(r, yr) / 10) * 10); list.appendChild(s);
        });
      } else { document.getElementById('div-list').innerHTML = ''; }
    }
    slider.addEventListener('input', draw);
    L.seg(document.getElementById('div-seg'), function (v) { logScale = v === 'log'; draw(); });
    draw(); L.onResize(draw);
  })();
})();
