/* ============================================================
   Quant · Módulo Pactos (Repos) — plug-in en archivo propio
   ------------------------------------------------------------
   Primer módulo que ejecuta el contrato completo de la arquitectura
   de plug-in (PRD §16.3-A1): vive fuera del shell, se registra con
   registerModule() y trae su propio proveedor de datos (`data`), que
   consulta la API POR CONTEXTO en cada navegación — no lee el cache
   hidratado al login. Es el molde del primer módulo con data real:
   cuando exista el backend, config.js apunta la API y este archivo
   no cambia.

   Convenciones que estrena (y que los demás módulos adoptan al migrar):
   - fetch por contexto con estados de carga/error a cargo del shell;
   - esc() en toda interpolación de texto que viene de la API;
   - guarda de data vacía (la API real puede devolver 0 filas).
   ============================================================ */
(() => {

  /* Proveedor de datos del módulo. El contexto viaja como querystring
     (contrato de producción: el backend filtra por cartera y corte);
     el prototipo sirve JSON estático que ignora los params, y el factor
     de cartera se aplica en el cliente como en el resto del portal. */
  async function dataPactos(ctx) {
    const { PACTOS } = await QuantAPI.get('pactos', { cartera: ctx.cartera, corte: ctx.fecha });
    return { pactos: PACTOS, factor: CARTERAS.find(c => c.id === ctx.cartera).factor };
  }

  const PALETA_CP = ['#007ABC', '#0090DA', '#379B94', '#1E4C76', '#A4CE4E', '#5B7F95'];

  async function vPactos() {
    const data = await dataSource('pactos');
    const f = data.factor;
    const ps = data.pactos || [];
    if (!ps.length) {
      return `<div class="locked-banner">${icon('repo', 22)}
        <div><b>Sin pactos vigentes a la fecha de corte.</b><br>La API no devolvió operaciones para el contexto seleccionado.</div></div>`;
    }
    const inv = ps.filter(p => p.tipo === 'Compra con retroventa');
    const fund = ps.filter(p => p.tipo === 'Venta con retrocompra');
    const sum = arr => arr.reduce((s, p) => s + p.monto, 0);
    const invTot = sum(inv), fundTot = sum(fund), montoTot = sum(ps);
    const tasaProm = ps.reduce((s, p) => s + p.tasa * p.monto, 0) / montoTot;
    const plazoProm = ps.reduce((s, p) => s + p.dias * p.monto, 0) / montoTot;

    // Escalera de vencimientos por bucket de plazo
    const buckets = [
      { label: '1 día', test: d => d <= 1 },
      { label: '2–7 días', test: d => d > 1 && d <= 7 },
      { label: '8–21 días', test: d => d > 7 && d <= 21 },
      { label: '> 21 días', test: d => d > 21 },
    ].map(b => ({ label: b.label, value: +(ps.filter(p => b.test(p.dias)).reduce((s, p) => s + p.monto, 0) * f).toFixed(0), color: '#007ABC' }));

    // Composición por contraparte (labels escapados: texto servido por la API)
    const byCp = {};
    ps.forEach(p => byCp[p.contraparte] = (byCp[p.contraparte] || 0) + p.monto * f);
    const segsCp = Object.entries(byCp).sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ label: esc(label), value, color: PALETA_CP[i % PALETA_CP.length] }));

    return `
      <div class="grid kpis">
        ${kpiCard('Inversión en pactos', money(invTot * f), `compra con retroventa · ${inv.length} operaciones`, true, 'pactos', '')}
        ${kpiCard('Financiamiento con pactos', money(fundTot * f), `venta con retrocompra · ${fund.length} operaciones`, fundTot === 0, 'pactos', '')}
        ${kpiCard('Tasa promedio', pct(tasaProm, 2), 'ponderada por monto', true, 'pactos', '')}
        ${kpiCard('Plazo promedio', `${fmt(plazoProm, 0)} días`, 'ponderado por monto', true, 'liquidez', 'Posición de liquidez')}
      </div>
      <div class="grid two mt-14">
        <div class="card">
          <div class="card-header"><span class="card-title">Vencimientos por plazo</span><span class="card-sub">monto que vence en cada tramo</span></div>
          ${Charts.hBars(buckets, { fmtVal: v => moneyN(v) })}
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Exposición por contraparte</span><span class="card-sub">monto vigente</span></div>
          <div class="donut-flex">
            ${Charts.donut(segsCp, { size: 150, stroke: 23, centerLabel: unitLabel(), centerValue: moneyN(montoTot * f) })}
            <div class="chart-legend" style="flex-direction:column; gap:6px">
              ${segsCp.map(s => `<div class="legend-item"><span class="legend-swatch" style="background:${s.color}"></span>${s.label} <b>${pct(s.value / (montoTot * f) * 100)}</b></div>`).join('')}
            </div>
          </div>
        </div>
      </div>
      <div class="card mt-14" style="padding:6px 10px">
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Operación</th><th>Tipo</th><th>Contraparte</th><th>Colateral (subyacente)</th><th class="num">Monto (${unitLabel()})</th><th class="num">Tasa</th><th class="num">Plazo</th><th>Vencimiento</th><th class="num">Cobertura</th></tr></thead>
          <tbody>${[...ps].sort((a, b) => a.dias - b.dias).map(p => {
            const cob = p.colateral / p.monto * 100;
            return `<tr>
              <td><div class="cell-main">${esc(p.id)}</div><div class="cell-sub"><span class="ccy-chip">${esc(p.moneda)}</span></div></td>
              <td>${p.tipo === 'Compra con retroventa' ? '<span class="status-pill ok">Inversión</span>' : '<span class="status-pill warn">Financiamiento</span>'}</td>
              <td>${esc(p.contraparte)}</td>
              <td class="cell-sub" style="white-space:normal">${esc(p.subyacente)}</td>
              <td class="num" style="font-weight:600">${moneyN(p.monto * f)}</td>
              <td class="num">${pct(p.tasa, 2)}</td>
              <td class="num">${p.dias} d</td>
              <td>${esc(p.vencimiento)}</td>
              <td class="num" style="color:${cob >= 102 ? 'var(--ok)' : 'var(--text-2)'};font-weight:600">${pct(cob, 1)}</td>
            </tr>`;
          }).join('')}</tbody>
        </table></div>
      </div>
      <div class="footnote"><span class="meta-chip">Cobertura = valor del colateral / monto del pacto (margen sobre el efectivo)</span>
        <span class="meta-chip src">El efecto de los pactos en la liquidez a corto plazo se consolida en Liquidez</span></div>
      ${sourceFootnote(['Sistema de tesorería / pactos', 'Custodio (colateral)'])}`;
  }

  /* Registro: agregar el módulo al portal cuesta exactamente esta llamada.
     El shell (sidebar, ⌘K, galería, deep-link, export) lo descubre solo. */
  registerModule({
    id: 'pactos', nombre: 'Pactos (Repos)', icon: 'repo', zona: 'portafolio',
    desc: 'Pactos de retrocompra y retroventa: inversión de caja, financiamiento, plazos y contrapartes', tabs: [],
    kind: 'nativo', render: vPactos, data: dataPactos, export: true,
    fuente: 'api', owner: 'Tesorería', estado: 'Oficial', adopcion: 79,
  });

})();
