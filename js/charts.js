/* ============================================================
   Quant · Charts — SVG puro, sin dependencias
   ============================================================ */

const Charts = (() => {

  function donut(segments, { size = 168, stroke = 26, centerLabel = '', centerValue = '' } = {}) {
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    const r = (size - stroke) / 2;
    const c = size / 2;
    const circ = 2 * Math.PI * r;
    let offset = 0;
    let arcs = '';
    segments.forEach(seg => {
      const frac = seg.value / total;
      const len = frac * circ;
      arcs += `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="${stroke}"
        stroke-dasharray="${len - 1.5} ${circ - len + 1.5}" stroke-dashoffset="${-offset}"
        transform="rotate(-90 ${c} ${c})"><title>${seg.label}: ${(frac * 100).toFixed(1)}%</title></circle>`;
      offset += len;
    });
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img">
      ${arcs}
      <text x="${c}" y="${c - 7}" text-anchor="middle" class="donut-center-label">${centerLabel}</text>
      <text x="${c}" y="${c + 14}" text-anchor="middle" class="donut-center-value">${centerValue}</text>
    </svg>`;
  }

  function lineChart(labels, series, { width = 640, height = 220, unit = '%' } = {}) {
    const padL = 42, padR = 14, padT = 14, padB = 26;
    const all = series.flatMap(s => s.points);
    const min = Math.min(0, ...all), max = Math.max(...all) * 1.12;
    const iw = width - padL - padR, ih = height - padT - padB;
    const x = i => padL + (i / (labels.length - 1)) * iw;
    const y = v => padT + ih - ((v - min) / (max - min)) * ih;

    // gridlines (4)
    let grid = '';
    for (let g = 0; g <= 4; g++) {
      const gv = min + (max - min) * (g / 4);
      const gy = y(gv);
      grid += `<line x1="${padL}" y1="${gy}" x2="${width - padR}" y2="${gy}" stroke="#EDF1F5" stroke-width="1"/>
        <text x="${padL - 8}" y="${gy + 3.5}" text-anchor="end" font-size="10" fill="#8494A3">${gv.toFixed(1)}${unit}</text>`;
    }
    let xlabels = '';
    labels.forEach((l, i) => {
      if (i % Math.ceil(labels.length / 8) === 0 || i === labels.length - 1)
        xlabels += `<text x="${x(i)}" y="${height - 8}" text-anchor="middle" font-size="10" fill="#8494A3">${l}</text>`;
    });
    let paths = '';
    series.forEach(s => {
      const d = s.points.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
      if (s.area) {
        paths += `<path d="${d} L${x(s.points.length - 1)},${y(min)} L${x(0)},${y(min)} Z" fill="${s.color}" opacity="0.08"/>`;
      }
      paths += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round"
        ${s.dash ? 'stroke-dasharray="5 4"' : ''}/>`;
      const li = s.points.length - 1;
      paths += `<circle cx="${x(li)}" cy="${y(s.points[li])}" r="3.5" fill="${s.color}"/>`;
    });
    return `<svg viewBox="0 0 ${width} ${height}" style="width:100%;height:auto" role="img">${grid}${xlabels}${paths}</svg>`;
  }

  function stackedBars(labels, stacks, { width = 640, height = 230, fmtVal = v => v } = {}) {
    const padL = 52, padR = 10, padT = 12, padB = 26;
    const totals = labels.map((_, i) => stacks.reduce((s, st) => s + st.values[i], 0));
    const max = Math.max(...totals) * 1.12;
    const iw = width - padL - padR, ih = height - padT - padB;
    const bw = Math.min(30, (iw / labels.length) * 0.62);
    let grid = '';
    for (let g = 0; g <= 4; g++) {
      const gv = max * (g / 4);
      const gy = padT + ih - (gv / max) * ih;
      grid += `<line x1="${padL}" y1="${gy}" x2="${width - padR}" y2="${gy}" stroke="#EDF1F5"/>
        <text x="${padL - 8}" y="${gy + 3.5}" text-anchor="end" font-size="10" fill="#8494A3">${fmtVal(gv)}</text>`;
    }
    let bars = '', xlabels = '';
    labels.forEach((l, i) => {
      const cx = padL + (i + 0.5) * (iw / labels.length);
      let acc = 0;
      stacks.forEach(st => {
        const v = st.values[i];
        const h = (v / max) * ih;
        const yTop = padT + ih - ((acc + v) / max) * ih;
        bars += `<rect x="${cx - bw / 2}" y="${yTop}" width="${bw}" height="${Math.max(h, 0)}" rx="2" fill="${st.color}">
          <title>${l} · ${st.name}: ${fmtVal(v)}</title></rect>`;
        acc += v;
      });
      xlabels += `<text x="${cx}" y="${height - 8}" text-anchor="middle" font-size="10" fill="#8494A3">${l}</text>`;
    });
    return `<svg viewBox="0 0 ${width} ${height}" style="width:100%;height:auto" role="img">${grid}${bars}${xlabels}</svg>`;
  }

  // Barras horizontales divergentes o simples
  function hBars(items, { width = 560, fmtVal = v => v, showSign = false } = {}) {
    const rowH = 30, padL = 190, padR = 66;
    const height = items.length * rowH + 8;
    const maxAbs = Math.max(...items.map(i => Math.abs(i.value))) || 1;
    const iw = width - padL - padR;
    const zero = showSign ? padL + iw / 2 : padL;
    const scale = showSign ? (iw / 2) / maxAbs : iw / maxAbs;
    let rows = '';
    items.forEach((it, i) => {
      const cy = i * rowH + rowH / 2 + 4;
      const w = Math.abs(it.value) * scale;
      const x0 = it.value >= 0 ? zero : zero - w;
      const color = it.color || (it.value >= 0 ? '#379B94' : '#B3261E');
      const tx = it.value >= 0 ? x0 + w + 6 : zero + 6;
      rows += `<text x="${padL - 10}" y="${cy + 3.5}" text-anchor="end" font-size="11" fill="#51606E">${it.label}</text>
        <rect x="${x0}" y="${cy - 7}" width="${Math.max(w, 1)}" height="14" rx="3" fill="${color}"/>
        <text x="${tx}" y="${cy + 3.5}" font-size="11" font-weight="700" text-anchor="start" fill="#1A2733">${fmtVal(it.value)}</text>`;
    });
    if (showSign) rows += `<line x1="${zero}" y1="4" x2="${zero}" y2="${height - 4}" stroke="#CBD5E1" stroke-dasharray="2 3"/>`;
    return `<svg viewBox="0 0 ${width} ${height}" style="width:100%;height:auto" role="img">${rows}</svg>`;
  }

  // Barras agrupadas (activos vs pasivos por tramo)
  function groupedBars(labels, groups, { width = 640, height = 240, fmtVal = v => v } = {}) {
    const padL = 56, padR = 10, padT = 12, padB = 26;
    const max = Math.max(...groups.flatMap(g => g.values)) * 1.12;
    const iw = width - padL - padR, ih = height - padT - padB;
    const slot = iw / labels.length;
    const bw = Math.min(20, slot / (groups.length + 1.2));
    let grid = '';
    for (let g = 0; g <= 4; g++) {
      const gv = max * (g / 4);
      const gy = padT + ih - (gv / max) * ih;
      grid += `<line x1="${padL}" y1="${gy}" x2="${width - padR}" y2="${gy}" stroke="#EDF1F5"/>
        <text x="${padL - 8}" y="${gy + 3.5}" text-anchor="end" font-size="10" fill="#8494A3">${fmtVal(gv)}</text>`;
    }
    let bars = '', xlabels = '';
    labels.forEach((l, i) => {
      const cx = padL + (i + 0.5) * slot;
      groups.forEach((gr, gi) => {
        const v = gr.values[i];
        const h = (v / max) * ih;
        const x0 = cx - (groups.length * bw) / 2 + gi * bw;
        bars += `<rect x="${x0}" y="${padT + ih - h}" width="${bw - 3}" height="${h}" rx="2" fill="${gr.color}">
          <title>${l} · ${gr.name}: ${fmtVal(v)}</title></rect>`;
      });
      xlabels += `<text x="${cx}" y="${height - 8}" text-anchor="middle" font-size="9.5" fill="#8494A3">${l}</text>`;
    });
    return `<svg viewBox="0 0 ${width} ${height}" style="width:100%;height:auto" role="img">${grid}${bars}${xlabels}</svg>`;
  }

  // Frontera eficiente: curva vol/retorno + marcadores (cartera actual, propuesta)
  function frontier(curve, markers, { width = 640, height = 260 } = {}) {
    const padL = 46, padR = 16, padT = 14, padB = 34;
    const xs = curve.map(p => p.vol).concat(markers.map(m => m.vol));
    const ys = curve.map(p => p.ret).concat(markers.map(m => m.ret));
    const xMin = Math.min(...xs) - 0.3, xMax = Math.max(...xs) + 0.3;
    const yMin = Math.min(...ys) - 0.3, yMax = Math.max(...ys) + 0.3;
    const iw = width - padL - padR, ih = height - padT - padB;
    const x = v => padL + (v - xMin) / (xMax - xMin) * iw;
    const y = v => padT + ih - (v - yMin) / (yMax - yMin) * ih;
    let grid = '';
    for (let g = 0; g <= 4; g++) {
      const gv = yMin + (yMax - yMin) * g / 4;
      grid += `<line x1="${padL}" y1="${y(gv)}" x2="${width - padR}" y2="${y(gv)}" stroke="#EDF1F5"/>
        <text x="${padL - 8}" y="${y(gv) + 3.5}" text-anchor="end" font-size="10" fill="#8494A3">${gv.toFixed(1)}%</text>`;
      const gx = xMin + (xMax - xMin) * g / 4;
      grid += `<text x="${x(gx)}" y="${height - 16}" text-anchor="middle" font-size="10" fill="#8494A3">${gx.toFixed(1)}%</text>`;
    }
    grid += `<text x="${padL + iw / 2}" y="${height - 2}" text-anchor="middle" font-size="10" font-weight="600" fill="#51606E">Volatilidad esperada (anual)</text>`;
    const d = curve.map((p, i) => `${i ? 'L' : 'M'}${x(p.vol).toFixed(1)},${y(p.ret).toFixed(1)}`).join(' ');
    let dots = '';
    markers.forEach(m => {
      dots += `<line x1="${x(m.vol)}" y1="${y(m.ret)}" x2="${x(m.vol)}" y2="${padT + ih}" stroke="${m.color}" stroke-dasharray="2 3" opacity=".45"/>
        <circle cx="${x(m.vol)}" cy="${y(m.ret)}" r="6" fill="${m.color}" stroke="#fff" stroke-width="2"><title>${m.label}: ${m.ret.toFixed(2)}% / ${m.vol.toFixed(2)}%</title></circle>
        <text x="${x(m.vol) + 10}" y="${y(m.ret) - 8}" font-size="11" font-weight="700" fill="${m.color}">${m.label}</text>`;
    });
    return `<svg viewBox="0 0 ${width} ${height}" style="width:100%;height:auto" role="img">
      ${grid}
      <path d="${d}" fill="none" stroke="#007ABC" stroke-width="2.4" stroke-linejoin="round"/>
      ${dots}
    </svg>`;
  }

  function sparkline(points, { width = 110, height = 30, color = '#007ABC' } = {}) {
    const min = Math.min(...points), max = Math.max(...points);
    const range = max - min || 1;
    const x = i => 3 + (i / (points.length - 1)) * (width - 6);
    const y = v => height - 4 - ((v - min) / range) * (height - 8);
    const d = points.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <path d="${d}" fill="none" stroke="${color}" stroke-width="1.8"/>
      <circle cx="${x(points.length - 1)}" cy="${y(points[points.length - 1])}" r="2.6" fill="${color}"/>
    </svg>`;
  }

  return { donut, lineChart, stackedBars, hBars, groupedBars, sparkline, frontier };
})();
