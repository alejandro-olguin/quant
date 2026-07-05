/* ============================================================
   Quant · App — shell, navegación, render de módulos
   ============================================================ */

/* ---------- Estado global (context bar gobierna todo) ---------- */
const state = {
  module: 'inicio',
  tabs: {},              // tab activo por módulo
  cartera: 'consolidada',
  fecha: '2026-07-02',
  moneda: 'CLP',
  benchmark: 'compuesto',
  vista: 'ejecutiva',    // ejecutiva | analista
  fichaId: null,
  limiteId: 'L6',
  politicaId: null,
  politicaQ: '',
  filtros: { q: '', clase: '', moneda: '', rating: '', groupBy: '' },
  procQ: '',
};

/* ---------- Helpers ---------- */
const $ = sel => document.querySelector(sel);
const fmt = (n, dec = 0) => n.toLocaleString('es-CL', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const pct = (n, dec = 1) => `${fmt(n, dec)}%`;
const signPct = (n, dec = 2) => `${n >= 0 ? '+' : '−'}${fmt(Math.abs(n), dec)}%`;

function factor() { return CARTERAS.find(c => c.id === state.cartera).factor; }

function convVal(mmCLP) {
  if (state.moneda === 'CLP') return { v: mmCLP, unit: 'MM$' };
  if (state.moneda === 'UF') return { v: mmCLP * 1e6 / FX.UF / 1000, unit: 'M UF' };
  return { v: mmCLP * 1e6 / FX.USD / 1e6, unit: 'MM US$' };
}
function money(mmCLP, dec = 0) { const { v, unit } = convVal(mmCLP); return `${unit} ${fmt(v, dec)}`; }
function moneyN(mmCLP, dec = 0) { return fmt(convVal(mmCLP).v, dec); }
function unitLabel() { return convVal(0).unit; }

function totalCartera() { return POSICIONES.reduce((s, p) => s + p.valor, 0) * factor(); }

function fechaCorteCL() {
  const [y, m, d] = state.fecha.split('-');
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${d} ${meses[parseInt(m) - 1]} ${y}`;
}

function semEstado(uso) { return uso >= 100 ? 'bad' : uso >= 85 ? 'warn' : 'ok'; }
function politicaDeLimite(limiteId) { return POLITICAS.find(p => p.limites.some(x => x.limiteId === limiteId)); }
function semLabel(e) { return e === 'bad' ? 'Excedido' : e === 'warn' ? 'Alerta' : 'En cumplimiento'; }
const alertas = () => LIMITES.filter(l => semEstado(l.uso) !== 'ok');

function ratingBucket(r) {
  if (!r || r === '—') return 'Sin clasificación';
  if (r === 'AAA' || r === 'N-1+') return 'AAA';
  if (r.startsWith('AA')) return 'AA';
  if (r.startsWith('A')) return 'A';
  return 'BBB e inferior';
}

function hashSeries(id, n = 24, base = 100) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997;
  const pts = [base];
  for (let i = 1; i < n; i++) {
    h = (h * 137 + 89) % 997;
    pts.push(+(pts[i - 1] * (1 + ((h / 997) - 0.47) * 0.018)).toFixed(2));
  }
  return pts;
}

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `${icon('check')}<span>${msg}</span>`;
  $('#toast-container').appendChild(t);
  setTimeout(() => t.remove(), 3400);
}

/* ---------- Iconos ---------- */
function icon(name, s = 16) {
  const paths = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
    portfolio: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>',
    results: '<path d="M3 20h18"/><path d="M6 16l4-6 4 3 5-8"/>',
    forecast: '<path d="M3 20h18"/><path d="M4 16c3 0 3-8 7-8s4 5 9 2"/><circle cx="20" cy="9" r="1.6" fill="currentColor" stroke="none"/>',
    models: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M7.8 7.8 10.5 16M16.2 7.8 13.5 16M8.5 6h7"/>',
    shield: '<path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z"/><path d="M9 12l2 2 4-4.5"/>',
    policy: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 12h6M9 16h6"/>',
    procedures: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    faq: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.6 2.6 0 0 1 5 .9c0 1.6-2.4 2-2.4 3.4"/><circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none"/>',
    arrow: '<path d="M7 17 17 7"/><path d="M9 7h8v8"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    check: '<path d="M5 12.5 10 17.5 19 7"/>',
    export: '<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 19h16"/>',
    doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    swap: '<path d="M4 8h13"/><path d="M14 4l4 4-4 4"/><path d="M20 16H7"/><path d="M10 12l-4 4 4 4"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5"/>',
    annuity: '<circle cx="12" cy="7.5" r="3.5"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/><path d="M9.5 16.5h5"/>',
    scale: '<path d="M12 4v16"/><path d="M5 7h14"/><path d="M5 7l-2.5 5.5a3 3 0 0 0 5 0z"/><path d="M19 7l-2.5 5.5a3 3 0 0 0 5 0z"/><path d="M9 20h6"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><path d="M16.5 13.5v6M13.5 16.5h6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    up: '<path d="M12 19V6"/><path d="M6 12l6-6 6 6"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2"/><path d="M6.5 7l1 13h9l1-13"/><path d="M10 11v5M14 11v5"/>',
    widget: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M4 10h16M10 10v10"/>',
  };
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ''}</svg>`;
}

/* ---------- Definición de módulos (4 zonas por ritmo de trabajo) ---------- */
const ZONAS = [
  { id: 'monitoreo', label: 'Monitoreo' },
  { id: 'alm', label: 'ALM & Derivados' },
  { id: 'estrategia', label: 'Estrategia & Pricing' },
  { id: 'gobierno', label: 'Gobierno' },
  { id: 'plataforma', label: 'Mi espacio' },
];

const MODULES = [
  { id: 'inicio', nombre: 'Inicio', icon: 'home', zona: 'monitoreo', desc: 'Estado general de la cartera a la fecha de corte', tabs: [] },
  { id: 'cartera', nombre: 'Cartera', icon: 'portfolio', zona: 'monitoreo', desc: 'Posiciones, composición y movimientos de la cartera', tabs: ['Posiciones', 'Composición', 'Movimientos', 'Ficha instrumento'] },
  { id: 'resultados', nombre: 'Resultados', icon: 'results', zona: 'monitoreo', desc: 'Retornos, atribución y P&L del período', tabs: ['Retornos', 'Atribución', 'vs. Benchmark', 'P&L'] },
  { id: 'cumplimiento', nombre: 'Cumplimiento', icon: 'shield', zona: 'monitoreo', desc: 'Monitoreo de límites regulatorios CMF y de política interna', tabs: ['Semáforo de límites', 'Detalle por norma', 'Histórico'] },
  { id: 'proyecciones', nombre: 'Proyecciones', icon: 'forecast', zona: 'alm', desc: 'Flujos futuros, vencimientos y devengo proyectado', tabs: ['Flujos y vencimientos', 'Devengo proyectado', 'Escenarios'] },
  { id: 'modelos', nombre: 'Modelos', icon: 'models', zona: 'alm', desc: 'Calce/ALM, TSA y valorización con sus supuestos', tabs: ['Calce / ALM', 'TSA', 'Valorización', 'Supuestos y corridas'] },
  { id: 'derivados', nombre: 'Derivados & Colateral', icon: 'swap', zona: 'alm', desc: 'Cartera de derivados, efecto en el calce, estrés de MTM y gestión de colaterales', tabs: ['Posiciones', 'Calce con derivados', 'Estrés y colaterales', 'Contrapartes y CSA'] },
  { id: 'liquidez', nombre: 'Liquidez', icon: 'drop', zona: 'alm', desc: 'Posición de liquidez, ejercicios de estrés y fuentes y usos proyectados', tabs: ['Posición de liquidez', 'Estrés de liquidez', 'Fuentes y usos'] },
  { id: 'rrvv', nombre: 'Rentas Vitalicias', icon: 'annuity', zona: 'estrategia', desc: 'Pricing del día, competencia SCOMP, sensibilidades e histórico de emisión', tabs: ['Pricing del día', 'Competencia SCOMP', 'Sensibilidades', 'Histórico de emisión'] },
  { id: 'relval', nombre: 'Relative Value', icon: 'scale', zona: 'estrategia', desc: 'Screener de spreads, pares con históricos e ideas de la mesa', tabs: ['Screener de spreads', 'Pares e históricos', 'Ideas y watchlist'] },
  { id: 'optimizacion', nombre: 'Optimización', icon: 'target', zona: 'estrategia', desc: 'Frontera eficiente, asignación propuesta y restricciones de la última corrida', tabs: ['Frontera y propuesta', 'Actual vs. óptimo', 'Restricciones', 'Corridas'] },
  { id: 'politicas', nombre: 'Políticas', icon: 'policy', zona: 'gobierno', desc: 'Catálogo de políticas de inversión, límites y versiones', tabs: ['Catálogo', 'Ficha de política', 'Límites parametrizados', 'Versiones'] },
  { id: 'procedimientos', nombre: 'Procedimientos', icon: 'procedures', zona: 'gobierno', desc: 'Repositorio de procedimientos del ciclo de inversiones', tabs: ['Por área', 'Vigencias'] },
  { id: 'faq', nombre: 'FAQ', icon: 'faq', zona: 'gobierno', desc: 'Preguntas frecuentes y glosario de términos', tabs: ['Categorías', 'Glosario'] },
  { id: 'explorar', nombre: 'Explorar y proponer', icon: 'grid', zona: 'plataforma', desc: 'Galería de módulos del portal, propuestas de la comunidad y tus vistas personalizadas', tabs: ['Galería de módulos', 'Propuestas', 'Mis vistas'] },
];

/* ---------- Vistas personalizadas del usuario (localStorage) ---------- */
function customViews() {
  try { return JSON.parse(localStorage.getItem('quant_views')) || []; } catch (e) { return []; }
}
function saveCustomViews(v) { localStorage.setItem('quant_views', JSON.stringify(v)); }
function customView(id) { return customViews().find(v => v.id === id); }

/* Propuestas: base sintética + las del usuario + votos (localStorage) */
function userProposals() {
  try { return JSON.parse(localStorage.getItem('quant_proposals')) || []; } catch (e) { return []; }
}
function saveUserProposals(p) { localStorage.setItem('quant_proposals', JSON.stringify(p)); }
function allProposals() { return [...userProposals(), ...PROPUESTAS_BASE]; }
function userVotes() {
  try { return JSON.parse(localStorage.getItem('quant_votes')) || {}; } catch (e) { return {}; }
}
function saveUserVotes(v) { localStorage.setItem('quant_votes', JSON.stringify(v)); }

/* Zonas colapsadas del sidebar (localStorage) */
function collapsedZones() {
  try { return JSON.parse(localStorage.getItem('quant_zones')) || {}; } catch (e) { return {}; }
}
function saveCollapsedZones(z) { localStorage.setItem('quant_zones', JSON.stringify(z)); }

function activeTab(mod) {
  const m = MODULES.find(x => x.id === mod);
  if (!m || !m.tabs.length) return null;
  return state.tabs[mod] || m.tabs[0];
}

/* ============================================================
   SIDEBAR + CONTEXT BAR
   ============================================================ */
function renderSidebar() {
  const collapsed = collapsedZones();
  const views = customViews();

  const modItem = m => `
    <button class="nav-item ${state.module === m.id ? 'active' : ''}" data-action="nav" data-module="${m.id}">
      ${icon(m.icon, 17)}<span>${m.nombre}</span>
      ${m.id === 'cumplimiento' && alertas().length ? `<span class="nav-badge">${alertas().length}</span>` : ''}
    </button>`;

  const zoneHtml = z => {
    const mods = MODULES.filter(m => m.zona === z.id);
    const extra = z.id === 'plataforma' ? views.length : 0;
    const isCollapsed = !!collapsed[z.id];
    let items = '';
    if (!isCollapsed) {
      if (z.id === 'plataforma') {
        items += views.map(v => `
          <button class="nav-item ${state.module === 'mi:' + v.id ? 'active' : ''}" data-action="nav" data-module="mi:${v.id}">
            <span class="custom-dot"></span><span>${v.nombre}</span>
          </button>`).join('');
      }
      items += mods.map(modItem).join('');
      if (z.id === 'plataforma') {
        items += `<button class="nav-item add-view" data-action="open-builder">${icon('plus', 15)}<span>Nueva vista</span></button>`;
      }
    }
    return `
      <button class="nav-zone-toggle ${isCollapsed ? 'collapsed' : ''}" data-action="toggle-zone" data-zone="${z.id}">
        <span>${z.label}</span>
        ${isCollapsed ? `<span class="zone-count">${mods.length + extra}</span>` : ''}
        <span class="zone-chev">${icon('down', 11)}</span>
      </button>
      ${items}`;
  };

  $('#sidebar').innerHTML = `
    <div class="brand">
      <div class="brand-mark">Q</div>
      <div>
        <div class="brand-name">Quant</div>
        <div class="brand-sub">MetLife Chile · Inversiones</div>
      </div>
    </div>
    <nav class="nav-section">
      ${ZONAS.map((z, i) => `${i ? '<div class="nav-divider"></div>' : ''}${zoneHtml(z)}`).join('')}
    </nav>
    <div class="sidebar-footer">
      <div class="user-chip">
        <div class="avatar">${currentUser().iniciales}</div>
        <div>
          <div class="user-name">${currentUser().nombre}</div>
          <div class="user-role">${currentUser().rol} · SSO</div>
        </div>
        <button class="logout-btn" data-action="logout" title="Cerrar sesión">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
        </button>
      </div>
      <div class="app-version">Quant MVP · Fase 1 (solo lectura) · v0.2.0</div>
    </div>`;
}

function renderContextbar() {
  $('#contextbar').innerHTML = `
    <div class="ctx-group">
      <span class="ctx-label">Cartera</span>
      <select class="ctx-select" id="sel-cartera">
        ${CARTERAS.map(c => `<option value="${c.id}" ${state.cartera === c.id ? 'selected' : ''}>${c.nombre}</option>`).join('')}
      </select>
    </div>
    <div class="ctx-group">
      <span class="ctx-label">Corte</span>
      <input type="date" class="ctx-select" id="sel-fecha" value="${state.fecha}" max="2026-07-02">
    </div>
    <div class="ctx-group">
      <span class="ctx-label">Moneda</span>
      <div class="segmented" id="seg-moneda">
        ${['CLP', 'UF', 'USD'].map(m => `<button data-m="${m}" class="${state.moneda === m ? 'active' : ''}">${m}</button>`).join('')}
      </div>
    </div>
    <div class="ctx-group">
      <span class="ctx-label">Benchmark</span>
      <select class="ctx-select" id="sel-bmk">
        ${BENCHMARKS.map(b => `<option value="${b.id}" ${state.benchmark === b.id ? 'selected' : ''}>${b.nombre}</option>`).join('')}
      </select>
    </div>
    <div class="ctx-right">
      <span class="recon-badge" title="${FUENTES.map(f => `${f.nombre}: ${f.corte}`).join('\n')}">
        <span class="dot"></span> Conciliado · ${fechaCorteCL()}
      </span>
      <button class="kbtn" data-action="open-palette">${icon('doc', 13)} Buscar <kbd>⌘K</kbd></button>
      <div class="vista-toggle">
        <button class="${state.vista === 'ejecutiva' ? 'active' : ''}" data-action="vista" data-v="ejecutiva">Ejecutiva</button>
        <button class="${state.vista === 'analista' ? 'active' : ''}" data-action="vista" data-v="analista">Analista</button>
      </div>
    </div>`;

  $('#sel-cartera').onchange = e => { state.cartera = e.target.value; renderAll(); toast(`Cartera: ${CARTERAS.find(c => c.id === state.cartera).nombre} — todas las vistas recalculadas`); };
  $('#sel-fecha').onchange = e => { state.fecha = e.target.value; renderAll(); };
  $('#sel-bmk').onchange = e => { state.benchmark = e.target.value; renderAll(); };
  $('#seg-moneda').querySelectorAll('button').forEach(b => b.onclick = () => {
    state.moneda = b.dataset.m; renderAll();
    toast(`Moneda de presentación: ${state.moneda} (UF ${fmt(FX.UF, 2)} · USD ${fmt(FX.USD, 2)} al corte)`);
  });
}

/* ============================================================
   PAGE CHROME
   ============================================================ */
function pageHeader(m, actions = '') {
  return `
    <div class="page-header">
      <div>
        <div class="page-title">${m.nombre}</div>
        <div class="page-desc">${m.desc}</div>
      </div>
      <div class="page-actions">
        <span class="meta-chip">${icon('clock', 12)} Corte: ${fechaCorteCL()}</span>
        ${actions}
      </div>
    </div>`;
}

function tabsBar(m) {
  if (!m.tabs.length) return '';
  const at = activeTab(m.id);
  return `<div class="tabs">${m.tabs.map(t => `
    <button class="tab ${t === at ? 'active' : ''}" data-action="tab" data-module="${m.id}" data-tab="${t}">
      ${t}${t === 'Escenarios' ? '<span class="tab-tag">FASE 2</span>' : ''}
    </button>`).join('')}</div>`;
}

function sourceFootnote(fuentes) {
  return `<div class="footnote">${fuentes.map(f => `<span class="meta-chip src">Fuente: ${f}</span>`).join('')}
    <span class="meta-chip">UF ${fmt(FX.UF, 2)} · US$ ${fmt(FX.USD, 2)} al ${fechaCorteCL()}</span></div>`;
}

/* ============================================================
   MÓDULO: INICIO
   ============================================================ */
function vInicio() {
  const total = totalCartera();
  const f = factor();
  const durProm = (() => {
    const ps = POSICIONES.filter(p => p.duracion != null);
    return ps.reduce((s, p) => s + p.duracion * p.valor, 0) / ps.reduce((s, p) => s + p.valor, 0);
  })();
  const worst = [...LIMITES].sort((a, b) => b.uso - a.uso)[0];
  const nAl = alertas().length;

  const byClase = {};
  POSICIONES.forEach(p => byClase[p.clase] = (byClase[p.clase] || 0) + p.valor * f);
  const segs = Object.entries(byClase).sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value, color: CLASE_COLORS[label] }));

  const hero = `
    <div class="exec-hero">
      <div>
        <div class="hero-label">Valor total de la cartera</div>
        <div class="hero-value">${money(total)}</div>
      </div>
      <div class="hero-item"><div class="hl">Retorno YTD</div><div class="hv">${signPct(RETORNO_TOTAL.ytd)}</div></div>
      <div class="hero-item"><div class="hl">vs. benchmark YTD</div><div class="hv">${signPct(RETORNO_TOTAL.ytd - RETORNO_TOTAL.bmk_ytd)}</div></div>
      <div class="hero-item"><div class="hl">Duración promedio</div><div class="hv">${fmt(durProm, 1)} años</div></div>
      <div class="hero-item"><div class="hl">Límites en alerta</div><div class="hv">${nAl} de ${LIMITES.length}</div></div>
    </div>`;

  const kpis = `
    <div class="grid kpis">
      ${kpiCard('Retorno del mes (MTD)', signPct(RETORNO_TOTAL.mtd), `vs. bmk ${signPct(RETORNO_TOTAL.mtd - RETORNO_TOTAL.bmk_mtd)}`, RETORNO_TOTAL.mtd - RETORNO_TOTAL.bmk_mtd >= 0, 'resultados', 'Retornos')}
      ${kpiCard('Retorno 12 meses', signPct(RETORNO_TOTAL.y12), `vs. bmk ${signPct(RETORNO_TOTAL.y12 - RETORNO_TOTAL.bmk_y12)}`, true, 'resultados', 'vs. Benchmark')}
      ${kpiCard('P&L YTD', money(PNL.reduce((s, x) => s + x.realizado + x.noRealizado + x.devengo, 0) * f), 'realizado + no realizado + devengo', true, 'resultados', 'P&L')}
      ${kpiCard('Mayor uso de límite', pct(worst.uso), worst.nombre, semEstado(worst.uso) === 'ok', 'cumplimiento', 'Semáforo de límites')}
      ${kpiCard('Flujos próximos 12M', money((FLUJOS.cupones.reduce((a, b) => a + b, 0) + FLUJOS.amortizaciones.reduce((a, b) => a + b, 0)) * f), 'cupones + amortizaciones', true, 'proyecciones', 'Flujos y vencimientos')}
    </div>`;

  const alertList = `
    <div class="card">
      <div class="card-header">
        <span class="card-title">Alertas de límites</span>
        <span class="card-sub">umbral ámbar ≥ 85% del cupo</span>
        <span class="spacer"></span>
        <button class="btn ghost" data-action="goto" data-module="cumplimiento" data-tab="Semáforo de límites">Ver Cumplimiento ${icon('arrow', 12)}</button>
      </div>
      ${[...LIMITES].sort((a, b) => b.uso - a.uso).slice(0, 5).map(l => {
        const e = semEstado(l.uso);
        return `<div class="alert-row" data-action="limite" data-id="${l.id}">
          <span class="sem-dot ${e}"></span>
          <div><div class="alert-name">${l.nombre}</div><div class="alert-norm">${l.norma}</div></div>
          <div class="alert-metrics">
            <div class="progress"><div class="${e}" style="width:${Math.min(l.uso, 100)}%"></div></div>
            <span class="alert-usage">${pct(l.uso)}</span>
          </div>
        </div>`;
      }).join('')}
    </div>`;

  const compChart = `
    <div class="card">
      <div class="card-header"><span class="card-title">Composición por clase de activo</span>
        <span class="spacer"></span>
        <button class="btn ghost" data-action="goto" data-module="cartera" data-tab="Composición">Detalle ${icon('arrow', 12)}</button>
      </div>
      <div class="donut-flex">
        ${Charts.donut(segs, { centerLabel: unitLabel(), centerValue: moneyN(total) })}
        <div class="chart-legend" style="flex-direction:column; gap:7px">
          ${segs.map(s => `<div class="legend-item"><span class="legend-swatch" style="background:${s.color}"></span>${s.label} <b>${pct(s.value / total * 100)}</b></div>`).join('')}
        </div>
      </div>
    </div>`;

  const retChart = `
    <div class="card">
      <div class="card-header"><span class="card-title">Retorno acumulado 12 meses</span><span class="card-sub">TWR, neto de comisiones</span>
        <span class="spacer"></span>
        <button class="btn ghost" data-action="goto" data-module="resultados" data-tab="vs. Benchmark">Detalle ${icon('arrow', 12)}</button>
      </div>
      ${Charts.lineChart(SERIE_RETORNO.labels, [
        { name: 'Cartera', color: '#007ABC', points: SERIE_RETORNO.cartera, area: true },
        { name: 'Benchmark', color: '#8494A3', points: SERIE_RETORNO.benchmark, dash: true },
      ])}
      <div class="chart-legend">
        <div class="legend-item"><span class="legend-swatch" style="background:#007ABC"></span>Cartera <b>${signPct(RETORNO_TOTAL.y12)}</b></div>
        <div class="legend-item"><span class="legend-swatch" style="background:#8494A3"></span>${BENCHMARKS.find(b => b.id === state.benchmark).nombre} <b>${signPct(RETORNO_TOTAL.bmk_y12)}</b></div>
      </div>
    </div>`;

  let analistaExtra = '';
  if (state.vista === 'analista') {
    const top = [...POSICIONES].sort((a, b) => b.valor - a.valor).slice(0, 8);
    const totalAll = POSICIONES.reduce((s, p) => s + p.valor, 0);
    analistaExtra = `
      <div class="grid two-even mt-14">
        <div class="card">
          <div class="card-header"><span class="card-title">Principales posiciones</span>
            <span class="spacer"></span>
            <button class="btn ghost" data-action="goto" data-module="cartera" data-tab="Posiciones">Ver todas ${icon('arrow', 12)}</button>
          </div>
          <div class="table-wrap"><table class="data">
            <thead><tr><th>Instrumento</th><th class="num">Valor (${unitLabel()})</th><th class="num">% cartera</th><th class="num">TIR</th></tr></thead>
            <tbody>${top.map(p => `
              <tr class="clickable" data-action="ficha" data-id="${p.id}">
                <td><div class="cell-main">${p.nombre}</div><div class="cell-sub">${p.emisor}</div></td>
                <td class="num">${moneyN(p.valor * f)}</td>
                <td class="num">${pct(p.valor / totalAll * 100)}</td>
                <td class="num">${p.tir != null ? pct(p.tir, 2) : '—'}</td>
              </tr>`).join('')}</tbody>
          </table></div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Retornos por clase de activo</span><span class="card-sub">YTD vs. benchmark</span></div>
          <div class="table-wrap"><table class="data">
            <thead><tr><th>Clase</th><th class="num">YTD</th><th class="num">Bmk</th><th class="num">Exceso</th></tr></thead>
            <tbody>${RETORNOS.map(r => `
              <tr><td class="cell-main">${r.clase}</td>
              <td class="num">${signPct(r.ytd)}</td><td class="num">${signPct(r.bmk_ytd)}</td>
              <td class="num" style="color:${r.ytd - r.bmk_ytd >= 0 ? 'var(--ok)' : 'var(--bad)'};font-weight:700">${signPct(r.ytd - r.bmk_ytd)}</td></tr>`).join('')}</tbody>
          </table></div>
        </div>
      </div>`;
  }

  const margenPond = RRVV_PRICING.productos.reduce((s, p) => s + p.margen * p.ventasMes, 0) / RRVV_PRICING.productos.reduce((s, p) => s + p.ventasMes, 0);
  const bufferCol = COLATERAL.disponible / ESTRES_DERIV[ESTRES_DERIV.length - 1].llamado;
  const cobLiq = LIQ_ESTRES[LIQ_ESTRES.length - 1].liquidos / LIQ_ESTRES[LIQ_ESTRES.length - 1].salidas;
  const ejItem = (nombre, valor, sub, estado, mod, tab) => `
    <div class="alert-row" data-action="goto" data-module="${mod}" data-tab="${tab}">
      <span class="sem-dot ${estado}"></span>
      <div><div class="alert-name">${nombre}</div><div class="alert-norm">${sub}</div></div>
      <div class="alert-metrics"><span class="alert-usage" style="width:auto">${valor}</span></div>
    </div>`;
  const ejercicios = `
    <div class="card mt-14">
      <div class="card-header"><span class="card-title">Ejercicios de mesa · última corrida</span>
        <span class="card-sub">pricing, colaterales, liquidez y optimización — drill-down a cada módulo</span></div>
      <div class="grid two-even" style="gap:0 26px">
        <div>
          ${ejItem('Pricing Rentas Vitalicias', `${fmt(margenPond, 0)} pb`, 'margen ponderado · objetivo ≥ 15 pb · corrida 02-07', rrvvSem(margenPond), 'rrvv', 'Pricing del día')}
          ${ejItem('Estrés de colaterales (derivados)', `${fmt(bufferCol, 1)}x`, 'buffer bajo combinado severo · mínimo 1,5x · corrida diaria', bufferCol >= COLATERAL.bufferMinimo ? 'ok' : 'bad', 'derivados', 'Estrés y colaterales')}
        </div>
        <div>
          ${ejItem('Estrés de liquidez', `${fmt(cobLiq, 1)}x`, 'cobertura 12M bajo combinado severo · mínimo 1,2x · corrida mensual', cobLiq >= LIQ_COBERTURA_MIN * 1.25 ? 'ok' : cobLiq >= LIQ_COBERTURA_MIN ? 'warn' : 'bad', 'liquidez', 'Estrés de liquidez')}
          ${ejItem('Optimización de portafolio', `+${fmt((OPT.propuesto.ret - OPT.actual.ret) * 100, 0)} pb`, `propuesta ${OPT.corrida} pendiente de comité`, 'ok', 'optimizacion', 'Frontera y propuesta')}
        </div>
      </div>
    </div>`;

  return hero + kpis + ejercicios + `<div class="grid two mt-14">${retChart}${alertList}</div>
    <div class="grid two mt-14">${compChart}
      <div class="card">
        <div class="card-header"><span class="card-title">Movimientos recientes</span>
          <span class="spacer"></span>
          <button class="btn ghost" data-action="goto" data-module="cartera" data-tab="Movimientos">Ver todos ${icon('arrow', 12)}</button>
        </div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Instrumento</th><th class="num">Monto (${unitLabel()})</th></tr></thead>
          <tbody>${MOVIMIENTOS.slice(0, 6).map(mv => `
            <tr><td>${mv.fecha}</td><td><span class="ccy-chip">${mv.tipo}</span></td><td>${mv.instrumento}</td>
            <td class="num">${moneyN(mv.monto * f)}</td></tr>`).join('')}</tbody>
        </table></div>
      </div>
    </div>` + analistaExtra +
    sourceFootnote(['Custodio (DCV / BNY Mellon)', 'Market data', 'Contabilidad de inversiones']);
}

function kpiCard(label, value, sub, positive, mod, tab) {
  return `<div class="card kpi" data-action="goto" data-module="${mod}" data-tab="${tab || ''}">
    <span class="drill-hint">${icon('arrow', 14)}</span>
    <div class="kpi-label">${label}</div>
    <div class="kpi-value">${value}</div>
    <div class="kpi-delta ${positive ? 'up' : 'down'}"><span class="vs">${sub}</span></div>
  </div>`;
}

/* ============================================================
   MÓDULO: CARTERA
   ============================================================ */
function filteredPosiciones() {
  const f = state.filtros;
  return POSICIONES.filter(p =>
    (!f.q || (p.nombre + p.emisor + p.id).toLowerCase().includes(f.q.toLowerCase())) &&
    (!f.clase || p.clase === f.clase) &&
    (!f.moneda || p.moneda === f.moneda) &&
    (!f.rating || ratingBucket(p.rating) === f.rating)
  );
}

function vCartera() {
  const tab = activeTab('cartera');
  if (tab === 'Posiciones') return carteraPosiciones();
  if (tab === 'Composición') return carteraComposicion();
  if (tab === 'Movimientos') return carteraMovimientos();
  return carteraFicha();
}

function carteraPosiciones() {
  const f = factor();
  const rows = filteredPosiciones();
  const totalAll = POSICIONES.reduce((s, p) => s + p.valor, 0);
  const clases = [...new Set(POSICIONES.map(p => p.clase))];
  const gb = state.filtros.groupBy;

  const rowHtml = p => `
    <tr class="clickable" data-action="ficha" data-id="${p.id}">
      <td><div class="cell-main">${p.nombre}</div><div class="cell-sub">${p.id} · ${p.emisor}</div></td>
      <td>${p.subclase}</td>
      <td><span class="ccy-chip">${p.moneda}</span></td>
      <td class="num">${p.nominal}</td>
      <td class="num" style="font-weight:600">${moneyN(p.valor * f)}</td>
      <td class="num">${pct(p.valor / totalAll * 100)}</td>
      <td>${p.rating === '—' ? '<span class="cell-sub">—</span>' : `<span class="rating-chip ${ratingBucket(p.rating) === 'BBB e inferior' ? 'mid' : ''}">${p.rating}</span>`}</td>
      <td class="num">${p.duracion != null ? fmt(p.duracion, 1) : '—'}</td>
      <td class="num">${p.tir != null ? pct(p.tir, 2) : '—'}</td>
    </tr>`;

  let body = '';
  if (gb) {
    const groups = {};
    rows.forEach(p => {
      const k = gb === 'clase' ? p.clase : gb === 'moneda' ? p.moneda : gb === 'rating' ? ratingBucket(p.rating) : p.emisor;
      (groups[k] = groups[k] || []).push(p);
    });
    Object.entries(groups).sort((a, b) => b[1].reduce((s, p) => s + p.valor, 0) - a[1].reduce((s, p) => s + p.valor, 0))
      .forEach(([k, ps]) => {
        const sub = ps.reduce((s, p) => s + p.valor, 0);
        body += `<tr class="group-row"><td colspan="4">${k} <span class="cell-sub">(${ps.length} posiciones)</span></td>
          <td class="num">${moneyN(sub * f)}</td><td class="num">${pct(sub / totalAll * 100)}</td><td colspan="3"></td></tr>`;
        body += ps.map(rowHtml).join('');
      });
  } else {
    body = [...rows].sort((a, b) => b.valor - a.valor).map(rowHtml).join('');
  }
  const totalSel = rows.reduce((s, p) => s + p.valor, 0);

  return `
    <div class="filter-bar">
      <input class="search-input" id="pos-q" placeholder="Buscar instrumento o emisor…" value="${state.filtros.q}">
      <select class="ctx-select" id="pos-clase"><option value="">Todas las clases</option>
        ${clases.map(c => `<option ${state.filtros.clase === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
      <select class="ctx-select" id="pos-moneda"><option value="">Toda moneda</option>
        ${['CLP', 'UF', 'USD'].map(c => `<option ${state.filtros.moneda === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
      <select class="ctx-select" id="pos-rating"><option value="">Todo rating</option>
        ${['AAA', 'AA', 'A', 'BBB e inferior', 'Sin clasificación'].map(c => `<option ${state.filtros.rating === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
      <select class="ctx-select" id="pos-group">
        <option value="">Sin agrupar</option>
        <option value="clase" ${gb === 'clase' ? 'selected' : ''}>Agrupar por clase</option>
        <option value="moneda" ${gb === 'moneda' ? 'selected' : ''}>Agrupar por moneda</option>
        <option value="emisor" ${gb === 'emisor' ? 'selected' : ''}>Agrupar por emisor</option>
        <option value="rating" ${gb === 'rating' ? 'selected' : ''}>Agrupar por rating</option>
      </select>
      <span class="filter-chip-count">${rows.length} de ${POSICIONES.length} posiciones · ${money(totalSel * f)}</span>
    </div>
    <div class="card" style="padding:6px 10px">
      <div class="table-wrap" style="max-height:560px; overflow-y:auto">
        <table class="data">
          <thead><tr>
            <th>Instrumento</th><th>Subclase</th><th>Mon.</th><th class="num">Nominal</th>
            <th class="num">Valor mercado (${unitLabel()})</th><th class="num">% cartera</th>
            <th>Rating</th><th class="num">Duración</th><th class="num">TIR</th>
          </tr></thead>
          <tbody>${body || '<tr><td colspan="9" style="text-align:center;color:var(--text-3);padding:30px">Sin resultados para los filtros aplicados</td></tr>'}</tbody>
        </table>
      </div>
    </div>
    ${sourceFootnote(['Custodio (DCV / BNY Mellon)', 'Market data (precios y ratings)'])}`;
}

function carteraComposicion() {
  const f = factor();
  const total = totalCartera();
  const agg = (keyFn, colorFn) => {
    const m = {};
    POSICIONES.forEach(p => { const k = keyFn(p); m[k] = (m[k] || 0) + p.valor * f; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([label, value], i) => ({ label, value, color: colorFn(label, i) }));
  };
  const palette = ['#007ABC', '#0090DA', '#379B94', '#1E4C76', '#A4CE4E', '#5B7F95', '#C7D2DD', '#83B8D8'];
  const byClase = agg(p => p.clase, l => CLASE_COLORS[l]);
  const byMoneda = agg(p => p.moneda, (l) => ({ CLP: '#007ABC', UF: '#379B94', USD: '#1E4C76' }[l]));
  const byRating = agg(p => ratingBucket(p.rating), (l, i) => palette[i % palette.length]);

  const donutCard = (title, segs, sub) => `
    <div class="card">
      <div class="card-header"><span class="card-title">${title}</span><span class="card-sub">${sub}</span></div>
      <div style="display:flex; justify-content:center">${Charts.donut(segs, { size: 150, stroke: 23, centerLabel: unitLabel(), centerValue: moneyN(total) })}</div>
      <div class="chart-legend">
        ${segs.map(s => `<div class="legend-item"><span class="legend-swatch" style="background:${s.color}"></span>${s.label} <b>${pct(s.value / total * 100)}</b></div>`).join('')}
      </div>
    </div>`;

  const topEmisores = (() => {
    const m = {};
    POSICIONES.forEach(p => m[p.emisor] = (m[p.emisor] || 0) + p.valor * f);
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8);
  })();

  return `
    <div class="grid three">
      ${donutCard('Por clase de activo', byClase, 'valor de mercado')}
      ${donutCard('Por moneda de origen', byMoneda, 'antes de cobertura')}
      ${donutCard('Por clasificación de riesgo', byRating, 'escala local / internacional')}
    </div>
    <div class="card mt-14">
      <div class="card-header"><span class="card-title">Principales emisores</span><span class="card-sub">concentración sobre el total de la cartera</span></div>
      ${Charts.hBars(topEmisores.map(([label, value]) => ({ label, value: +(value / total * 100).toFixed(1), color: '#007ABC' })), { fmtVal: v => pct(v) })}
    </div>
    ${sourceFootnote(['Custodio (DCV / BNY Mellon)', 'Market data'])}`;
}

function carteraMovimientos() {
  const f = factor();
  return `
    <div class="card" style="padding:6px 10px">
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Instrumento</th><th class="num">Monto (${unitLabel()})</th><th>Contraparte</th><th>Estado</th></tr></thead>
        <tbody>${MOVIMIENTOS.map(mv => `
          <tr>
            <td>${mv.fecha}</td>
            <td><span class="ccy-chip">${mv.tipo}</span></td>
            <td class="cell-main">${mv.instrumento}</td>
            <td class="num" style="font-weight:600">${moneyN(mv.monto * f)}</td>
            <td>${mv.contraparte}</td>
            <td><span class="status-pill ok">${mv.estado}</span></td>
          </tr>`).join('')}</tbody>
      </table></div>
    </div>
    ${sourceFootnote(['Custodio (movimientos liquidados)', 'Contabilidad de inversiones'])}`;
}

function carteraFicha() {
  const f = factor();
  if (!state.fichaId) {
    return `
      <div class="card">
        <div class="card-header"><span class="card-title">Selecciona un instrumento</span>
          <span class="card-sub">desde Posiciones, la búsqueda global (⌘K) o esta lista</span></div>
        ${[...POSICIONES].sort((a, b) => b.valor - a.valor).slice(0, 10).map(p => `
          <div class="alert-row" data-action="ficha" data-id="${p.id}">
            <div><div class="alert-name">${p.nombre}</div><div class="alert-norm">${p.id} · ${p.emisor}</div></div>
            <div class="alert-metrics"><span class="alert-usage" style="width:auto">${money(p.valor * f)}</span></div>
          </div>`).join('')}
      </div>`;
  }
  const p = POSICIONES.find(x => x.id === state.fichaId);
  const totalAll = POSICIONES.reduce((s, x) => s + x.valor, 0);
  const lims = LIMITES.filter(l => l.posiciones.includes(p.id));
  const serie = hashSeries(p.id);

  return `
    <button class="back-link" data-action="tab" data-module="cartera" data-tab="Posiciones">${icon('back', 13)} Volver a Posiciones</button>
    <div class="card">
      <div class="ficha-header">
        <div>
          <div class="ficha-title">${p.nombre}</div>
          <div class="ficha-chips">
            <span class="meta-chip">${p.id}</span>
            <span class="meta-chip">${p.clase} · ${p.subclase}</span>
            <span class="ccy-chip">${p.moneda}</span>
            ${p.rating !== '—' ? `<span class="rating-chip">${p.rating}</span>` : ''}
            <span class="meta-chip src">Fuente: ${p.fuente}</span>
          </div>
        </div>
        <div class="page-actions"><button class="btn" data-action="export" data-what="Ficha ${p.id}">${icon('export', 13)} Exportar ficha</button></div>
      </div>
      <div class="metric-grid">
        <div class="metric-cell"><div class="m-label">Emisor</div><div class="m-value" style="font-size:13px">${p.emisor}</div></div>
        <div class="metric-cell"><div class="m-label">Nominal</div><div class="m-value">${p.nominal}</div></div>
        <div class="metric-cell"><div class="m-label">Valor mercado</div><div class="m-value">${money(p.valor * f)}</div></div>
        <div class="metric-cell"><div class="m-label">% de la cartera</div><div class="m-value">${pct(p.valor / totalAll * 100)}</div></div>
        <div class="metric-cell"><div class="m-label">Duración</div><div class="m-value">${p.duracion != null ? fmt(p.duracion, 1) + ' años' : '—'}</div></div>
        <div class="metric-cell"><div class="m-label">TIR / Yield</div><div class="m-value">${p.tir != null ? pct(p.tir, 2) : '—'}</div></div>
      </div>
    </div>
    <div class="grid two mt-14">
      <div class="card">
        <div class="card-header"><span class="card-title">Precio · últimos 24 meses</span><span class="card-sub">base 100, moneda de origen</span></div>
        ${Charts.lineChart(Array.from({ length: 24 }, (_, i) => i % 6 === 0 ? ['Jul 24', 'Ene 25', 'Jul 25', 'Ene 26'][i / 6] : ''), [
          { name: 'Precio', color: '#007ABC', points: serie, area: true },
        ], { unit: '' })}
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Límites a los que contribuye</span><span class="card-sub">drill-down a Cumplimiento</span></div>
        ${lims.length ? lims.map(l => {
          const e = semEstado(l.uso);
          return `<div class="alert-row" data-action="limite" data-id="${l.id}">
            <span class="sem-dot ${e}"></span>
            <div><div class="alert-name">${l.nombre}</div><div class="alert-norm">${l.norma} · límite ${l.limite}</div></div>
            <div class="alert-metrics"><span class="alert-usage">${pct(l.uso)}</span></div>
          </div>`;
        }).join('') : '<div class="card-sub" style="padding:12px 4px">Este instrumento no contribuye a límites monitoreados.</div>'}
      </div>
    </div>
    ${sourceFootnote([p.fuente, 'Market data (precios)'])}`;
}

/* ============================================================
   MÓDULO: RESULTADOS
   ============================================================ */
function vResultados() {
  const tab = activeTab('resultados');
  const f = factor();

  if (tab === 'Retornos') {
    return `
      <div class="card" style="padding:6px 10px">
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Clase de activo</th><th class="num">MTD</th><th class="num">QTD</th><th class="num">YTD</th><th class="num">12 meses</th><th class="num">Bmk YTD</th><th class="num">Exceso YTD</th></tr></thead>
          <tbody>
            ${RETORNOS.map(r => `<tr>
              <td class="cell-main">${r.clase}</td>
              <td class="num">${signPct(r.mtd)}</td><td class="num">${signPct(r.qtd)}</td>
              <td class="num">${signPct(r.ytd)}</td><td class="num">${signPct(r.y12)}</td>
              <td class="num" style="color:var(--text-3)">${signPct(r.bmk_ytd)}</td>
              <td class="num" style="font-weight:700;color:${r.ytd - r.bmk_ytd >= 0 ? 'var(--ok)' : 'var(--bad)'}">${signPct(r.ytd - r.bmk_ytd)}</td>
            </tr>`).join('')}
            <tr class="total-row">
              <td>Total cartera</td>
              <td class="num">${signPct(RETORNO_TOTAL.mtd)}</td><td class="num">${signPct(RETORNO_TOTAL.qtd)}</td>
              <td class="num">${signPct(RETORNO_TOTAL.ytd)}</td><td class="num">${signPct(RETORNO_TOTAL.y12)}</td>
              <td class="num" style="color:var(--text-3)">${signPct(RETORNO_TOTAL.bmk_ytd)}</td>
              <td class="num" style="color:${RETORNO_TOTAL.ytd - RETORNO_TOTAL.bmk_ytd >= 0 ? 'var(--ok)' : 'var(--bad)'}">${signPct(RETORNO_TOTAL.ytd - RETORNO_TOTAL.bmk_ytd)}</td>
            </tr>
          </tbody>
        </table></div>
      </div>
      <div class="card mt-14">
        <div class="card-header"><span class="card-title">Retorno acumulado 12 meses</span><span class="card-sub">cartera vs. ${BENCHMARKS.find(b => b.id === state.benchmark).nombre}</span></div>
        ${Charts.lineChart(SERIE_RETORNO.labels, [
          { name: 'Cartera', color: '#007ABC', points: SERIE_RETORNO.cartera, area: true },
          { name: 'Benchmark', color: '#8494A3', points: SERIE_RETORNO.benchmark, dash: true },
        ])}
      </div>
      ${sourceFootnote(['Contabilidad de inversiones (valorización)', 'Market data (benchmark)'])}`;
  }

  if (tab === 'Atribución') {
    return `
      <div class="grid two">
        <div class="card">
          <div class="card-header"><span class="card-title">Atribución del exceso de retorno · YTD</span><span class="card-sub">exceso total ${signPct(RETORNO_TOTAL.ytd - RETORNO_TOTAL.bmk_ytd)} — método Brinson-Fachler</span></div>
          ${Charts.hBars(ATRIBUCION.map(a => ({ label: a.clase, value: a.total })), { showSign: true, fmtVal: v => signPct(v) })}
        </div>
        <div class="card" style="padding:6px 10px">
          <div class="table-wrap"><table class="data">
            <thead><tr><th>Clase</th><th class="num">Asignación</th><th class="num">Selección</th><th class="num">Interacción</th><th class="num">Total</th></tr></thead>
            <tbody>
              ${ATRIBUCION.map(a => `<tr>
                <td class="cell-main">${a.clase}</td>
                <td class="num">${signPct(a.asignacion)}</td><td class="num">${signPct(a.seleccion)}</td>
                <td class="num">${signPct(a.interaccion)}</td>
                <td class="num" style="font-weight:700;color:${a.total >= 0 ? 'var(--ok)' : 'var(--bad)'}">${signPct(a.total)}</td>
              </tr>`).join('')}
              <tr class="total-row"><td>Total</td>
                <td class="num">${signPct(ATRIBUCION.reduce((s, a) => s + a.asignacion, 0))}</td>
                <td class="num">${signPct(ATRIBUCION.reduce((s, a) => s + a.seleccion, 0))}</td>
                <td class="num">${signPct(ATRIBUCION.reduce((s, a) => s + a.interaccion, 0))}</td>
                <td class="num">${signPct(ATRIBUCION.reduce((s, a) => s + a.total, 0))}</td></tr>
            </tbody>
          </table></div>
        </div>
      </div>
      ${sourceFootnote(['Contabilidad de inversiones', 'Market data (benchmark)'])}`;
  }

  if (tab === 'vs. Benchmark') {
    const noBmk = state.benchmark === 'none';
    if (noBmk) return `<div class="locked-banner">${icon('doc', 20)} No hay benchmark seleccionado en la barra de contexto. Selecciona uno para habilitar la comparación y el tracking error.</div>`;
    return `
      <div class="grid kpis">
        ${kpiCard('Exceso de retorno YTD', signPct(RETORNO_TOTAL.ytd - RETORNO_TOTAL.bmk_ytd), 'cartera vs. benchmark', true, 'resultados', 'Retornos')}
        ${kpiCard('Exceso 12 meses', signPct(RETORNO_TOTAL.y12 - RETORNO_TOTAL.bmk_y12), 'ventana móvil', true, 'resultados', 'Retornos')}
        ${kpiCard('Tracking error', pct(RETORNO_TOTAL.te, 2), 'anualizado, 12M', true, 'resultados', 'Atribución')}
        ${kpiCard('Information ratio', fmt(RETORNO_TOTAL.ir, 2), 'exceso / tracking error', true, 'resultados', 'Atribución')}
      </div>
      <div class="card mt-14">
        <div class="card-header"><span class="card-title">Cartera vs. ${BENCHMARKS.find(b => b.id === state.benchmark).nombre}</span><span class="card-sub">retorno acumulado 12 meses</span></div>
        ${Charts.lineChart(SERIE_RETORNO.labels, [
          { name: 'Cartera', color: '#007ABC', points: SERIE_RETORNO.cartera, area: true },
          { name: 'Benchmark', color: '#8494A3', points: SERIE_RETORNO.benchmark, dash: true },
        ])}
        <div class="chart-legend">
          <div class="legend-item"><span class="legend-swatch" style="background:#007ABC"></span>Cartera <b>${signPct(RETORNO_TOTAL.y12)}</b></div>
          <div class="legend-item"><span class="legend-swatch" style="background:#8494A3"></span>Benchmark <b>${signPct(RETORNO_TOTAL.bmk_y12)}</b></div>
        </div>
      </div>
      <div class="card mt-14">
        <div class="card-header"><span class="card-title">Exceso de retorno por clase · YTD</span></div>
        ${Charts.hBars(RETORNOS.map(r => ({ label: r.clase, value: +(r.ytd - r.bmk_ytd).toFixed(2) })), { showSign: true, fmtVal: v => signPct(v) })}
      </div>
      ${sourceFootnote(['Contabilidad de inversiones', 'Market data (benchmark)'])}`;
  }

  // P&L
  const tot = PNL.reduce((s, x) => ({ realizado: s.realizado + x.realizado, noRealizado: s.noRealizado + x.noRealizado, devengo: s.devengo + x.devengo }), { realizado: 0, noRealizado: 0, devengo: 0 });
  return `
    <div class="grid kpis">
      ${kpiCard('P&L realizado YTD', money(tot.realizado * f), 'ventas y cupones cobrados', tot.realizado >= 0, 'cartera', 'Movimientos')}
      ${kpiCard('P&L no realizado YTD', money(tot.noRealizado * f), 'variación de mercado', tot.noRealizado >= 0, 'cartera', 'Posiciones')}
      ${kpiCard('Devengo YTD', money(tot.devengo * f), 'intereses y reajustes', true, 'proyecciones', 'Devengo proyectado')}
      ${kpiCard('P&L total YTD', money((tot.realizado + tot.noRealizado + tot.devengo) * f), 'suma de componentes', true, 'resultados', 'Retornos')}
    </div>
    <div class="card mt-14" style="padding:6px 10px">
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Clase de activo</th><th class="num">Realizado (${unitLabel()})</th><th class="num">No realizado</th><th class="num">Devengo</th><th class="num">Total</th></tr></thead>
        <tbody>
          ${PNL.map(x => {
            const t = x.realizado + x.noRealizado + x.devengo;
            return `<tr>
              <td class="cell-main">${x.clase}</td>
              <td class="num">${moneyN(x.realizado * f)}</td>
              <td class="num" style="color:${x.noRealizado >= 0 ? 'inherit' : 'var(--bad)'}">${moneyN(x.noRealizado * f)}</td>
              <td class="num">${moneyN(x.devengo * f)}</td>
              <td class="num" style="font-weight:700">${moneyN(t * f)}</td></tr>`;
          }).join('')}
          <tr class="total-row"><td>Total</td>
            <td class="num">${moneyN(tot.realizado * f)}</td><td class="num">${moneyN(tot.noRealizado * f)}</td>
            <td class="num">${moneyN(tot.devengo * f)}</td>
            <td class="num">${moneyN((tot.realizado + tot.noRealizado + tot.devengo) * f)}</td></tr>
        </tbody>
      </table></div>
    </div>
    ${sourceFootnote(['Contabilidad de inversiones (SAP)'])}`;
}

/* ============================================================
   MÓDULO: PROYECCIONES
   ============================================================ */
function vProyecciones() {
  const tab = activeTab('proyecciones');
  const f = factor();

  if (tab === 'Flujos y vencimientos') {
    const totC = FLUJOS.cupones.reduce((a, b) => a + b, 0) * f;
    const totA = FLUJOS.amortizaciones.reduce((a, b) => a + b, 0) * f;
    return `
      <div class="card">
        <div class="card-header"><span class="card-title">Flujos proyectados · próximos 12 meses</span>
          <span class="card-sub">cupones ${money(totC)} + amortizaciones ${money(totA)}</span></div>
        ${Charts.stackedBars(FLUJOS.labels, [
          { name: 'Cupones', color: '#007ABC', values: FLUJOS.cupones.map(v => v * f) },
          { name: 'Amortizaciones', color: '#379B94', values: FLUJOS.amortizaciones.map(v => v * f) },
        ], { fmtVal: v => fmt(v / 1000, 0) + ' mM' })}
        <div class="chart-legend">
          <div class="legend-item"><span class="legend-swatch" style="background:#007ABC"></span>Cupones e intereses</div>
          <div class="legend-item"><span class="legend-swatch" style="background:#379B94"></span>Amortizaciones y vencimientos</div>
        </div>
      </div>
      <div class="card mt-14" style="padding:6px 10px">
        <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Próximos vencimientos y eventos relevantes</span></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Fecha</th><th>Instrumento</th><th>Tipo</th><th class="num">Monto (${unitLabel()})</th></tr></thead>
          <tbody>${VENCIMIENTOS.map(v => `
            <tr><td>${v.fecha}</td><td class="cell-main">${v.instrumento}</td>
            <td><span class="ccy-chip">${v.tipo}</span></td><td class="num" style="font-weight:600">${moneyN(v.monto * f)}</td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      ${sourceFootnote(['Custodio (calendario de pagos)', 'Sistema actuarial / ALM'])}`;
  }

  if (tab === 'Devengo proyectado') {
    const tot = DEVENGO.base.reduce((a, b) => a + b, 0) * f;
    return `
      <div class="card">
        <div class="card-header"><span class="card-title">Devengo mensual proyectado · escenario base</span>
          <span class="card-sub">total 12 meses: ${money(tot)} — supuestos UF 3,0% anual, curvas al corte</span></div>
        ${Charts.lineChart(DEVENGO.labels, [
          { name: 'Devengo', color: '#379B94', points: DEVENGO.base.map(v => convVal(v * f).v), area: true },
        ], { unit: '' })}
        <div class="footnote"><span class="meta-chip">Escenario base · sin reinversión de flujos</span>
          <span class="meta-chip src">Supuestos documentados en Modelos → Supuestos y corridas</span></div>
      </div>
      ${sourceFootnote(['Sistema actuarial / ALM', 'Market data (curvas)'])}`;
  }

  // Escenarios (Fase 2)
  return `
    <div class="locked-banner">
      ${icon('lock', 22)}
      <div>
        <b>Escenarios interactivos — disponible en Fase 2.</b><br>
        Simulación de cambios de tasa, UF y tipo de cambio sobre la cartera (what-if). El MVP muestra únicamente el escenario base documentado en Modelos.
      </div>
    </div>`;
}

/* ============================================================
   MÓDULO: MODELOS
   ============================================================ */
function vModelos() {
  const tab = activeTab('modelos');
  const f = factor();

  if (tab === 'Calce / ALM') {
    return `
      <div class="grid kpis">
        ${kpiCard('Índice de cobertura global', pct(CALCE.reduce((s, t) => s + t.activos, 0) / CALCE.reduce((s, t) => s + t.pasivos, 0) * 100, 1), 'activos / pasivos descontados', true, 'modelos', 'Supuestos y corridas')}
        ${kpiCard('Tramos con déficit', `${CALCE.filter(t => t.activos < t.pasivos).length} de ${CALCE.length}`, 'calce por tramo NCG 461', false, 'modelos', 'Supuestos y corridas')}
        ${kpiCard('Última corrida', '30-06-2026', 'v2026.06 · validada', true, 'modelos', 'Supuestos y corridas')}
      </div>
      <div class="card mt-14">
        <div class="card-header"><span class="card-title">Calce de activos y pasivos por tramo</span><span class="card-sub">flujos descontados · NCG 461 · MM CLP equivalente</span></div>
        ${Charts.groupedBars(CALCE.map(t => t.tramo), [
          { name: 'Activos', color: '#007ABC', values: CALCE.map(t => t.activos * f) },
          { name: 'Pasivos', color: '#1E4C76', values: CALCE.map(t => t.pasivos * f) },
        ], { fmtVal: v => fmt(v / 1000, 0) + ' mM' })}
        <div class="chart-legend">
          <div class="legend-item"><span class="legend-swatch" style="background:#007ABC"></span>Activos</div>
          <div class="legend-item"><span class="legend-swatch" style="background:#1E4C76"></span>Pasivos (reservas técnicas)</div>
        </div>
      </div>
      <div class="card mt-14" style="padding:6px 10px">
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Tramo</th><th class="num">Activos (${unitLabel()})</th><th class="num">Pasivos (${unitLabel()})</th><th class="num">Brecha</th><th class="num">Índice de calce</th><th>Estado</th></tr></thead>
          <tbody>${CALCE.map(t => {
            const idx = t.activos / t.pasivos * 100;
            const brecha = (t.activos - t.pasivos) * f;
            const e = idx >= 100 ? 'ok' : idx >= 90 ? 'warn' : 'bad';
            return `<tr>
              <td class="cell-main">${t.tramo}</td>
              <td class="num">${moneyN(t.activos * f)}</td><td class="num">${moneyN(t.pasivos * f)}</td>
              <td class="num" style="color:${brecha >= 0 ? 'var(--ok)' : 'var(--bad)'};font-weight:600">${moneyN(brecha)}</td>
              <td class="num" style="font-weight:700">${pct(idx, 1)}</td>
              <td><span class="status-pill ${e}">${e === 'ok' ? 'Calzado' : 'Déficit'}</span></td></tr>`;
          }).join('')}</tbody>
        </table></div>
      </div>
      ${sourceFootnote(['Sistema actuarial / ALM (corrida 30-06-2026)'])}`;
  }

  if (tab === 'TSA') {
    return `
      <div class="grid kpis">
        ${kpiCard('Resultado TSA', TSA.resultado, `corrida ${TSA.fecha} · escenario base`, true, 'modelos', 'Supuestos y corridas')}
        ${kpiCard('Margen de suficiencia', money(TSA.margen * f), `${pct(TSA.margenPct, 1)} sobre reservas`, true, 'modelos', 'Supuestos y corridas')}
        ${kpiCard('Tasa de descuento', pct(TSA.tasaDescuento, 2), 'vector CMF al corte', true, 'modelos', 'Supuestos y corridas')}
      </div>
      <div class="card mt-14" style="padding:6px 10px">
        <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Sensibilidad del margen por escenario</span></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Escenario</th><th class="num">Margen (${unitLabel()})</th><th class="num">% sobre reservas</th><th>Resultado</th></tr></thead>
          <tbody>${TSA.escenarios.map(e => `
            <tr><td class="cell-main">${e.nombre}</td>
            <td class="num" style="font-weight:600">${moneyN(e.margen * f)}</td>
            <td class="num">${pct(e.margen / TSA.margen * TSA.margenPct, 1)}</td>
            <td><span class="status-pill ${e.estado}">${e.estado === 'ok' ? 'Suficiente' : 'Suficiente (margen acotado)'}</span></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="card mt-14">
        <div class="card-header"><span class="card-title">Nota metodológica</span></div>
        <div style="font-size:12.5px;color:var(--text-2);line-height:1.6">
          El Test de Suficiencia de Activos verifica que los flujos de los activos que respaldan reservas técnicas
          cubren los flujos proyectados de las obligaciones, descontados con el vector de tasas de la CMF.
          Los supuestos (mortalidad, prepago, inflación UF) están documentados en la pestaña <b>Supuestos y corridas</b>,
          con su fecha de última actualización y responsable.
        </div>
      </div>
      ${sourceFootnote(['Sistema actuarial / ALM', 'CMF (vector de descuento)'])}`;
  }

  if (tab === 'Valorización') {
    const metod = [
      { clase: 'Renta fija local', met: 'Mark-to-market con curvas RiskAmerica (tasa + spread por instrumento)', frec: 'Diaria' },
      { clase: 'Renta fija internacional', met: 'Precios Bloomberg BVAL, conversión al TC observado', frec: 'Diaria' },
      { clase: 'Renta variable y fondos', met: 'Precio de cierre bolsa / valor cuota oficial', frec: 'Diaria' },
      { clase: 'Inmobiliario directo', met: 'Tasación independiente (anual) + ajuste UF mensual', frec: 'Mensual' },
      { clase: 'Mutuos hipotecarios', met: 'Flujos descontados a tasa de originación ajustada por prepago', frec: 'Mensual' },
      { clase: 'Alternativos', met: 'NAV reportado por el administrador (rezago de un trimestre)', frec: 'Trimestral' },
    ];
    return `
      <div class="card" style="padding:6px 10px">
        <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Metodología de valorización por clase</span>
          <span class="card-sub">última valorización completa: ${fechaCorteCL()} · batch 08:30</span></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Clase de activo</th><th>Metodología</th><th>Frecuencia</th><th>Estado</th></tr></thead>
          <tbody>${metod.map(m => `
            <tr><td class="cell-main">${m.clase}</td><td style="white-space:normal">${m.met}</td>
            <td><span class="ccy-chip">${m.frec}</span></td>
            <td><span class="status-pill ok">Al día</span></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      ${sourceFootnote(['Market data (RiskAmerica / Bloomberg)', 'Contabilidad de inversiones'])}`;
  }

  // Supuestos y corridas
  return `
    <div class="card" style="padding:6px 10px">
      <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Supuestos e insumos de los modelos</span></div>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Grupo de supuestos</th><th>Detalle</th><th>Fuente</th><th>Actualizado</th></tr></thead>
        <tbody>${SUPUESTOS.map(s => `
          <tr><td class="cell-main">${s.grupo}</td><td style="white-space:normal;max-width:420px">${s.detalle}</td>
          <td><span class="meta-chip src">${s.fuente}</span></td><td>${s.actualizado}</td></tr>`).join('')}</tbody>
      </table></div>
    </div>
    <div class="card mt-14" style="padding:6px 10px">
      <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Historial de corridas</span><span class="card-sub">P1: comparación entre versiones</span></div>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Modelo</th><th>Versión</th><th>Fecha</th><th>Responsable</th><th class="num">Duración</th><th>Estado</th></tr></thead>
        <tbody>${CORRIDAS.map(c => `
          <tr><td class="cell-main">${c.modelo}</td><td>${c.version}</td><td>${c.fecha}</td><td>${c.responsable}</td>
          <td class="num">${c.duracion}</td>
          <td><span class="status-pill ${c.estado === 'Validada' ? 'ok' : 'neutral'}">${c.estado}</span></td></tr>`).join('')}</tbody>
      </table></div>
    </div>
    ${sourceFootnote(['Sistema actuarial / ALM', 'Área de Estudios'])}`;
}

/* ============================================================
   MÓDULO: CUMPLIMIENTO
   ============================================================ */
function vCumplimiento() {
  const tab = activeTab('cumplimiento');

  if (tab === 'Semáforo de límites') {
    const counts = { ok: 0, warn: 0, bad: 0 };
    LIMITES.forEach(l => counts[semEstado(l.uso)]++);
    return `
      <div class="grid kpis">
        <div class="card kpi"><div class="kpi-label"><span class="sem-dot ok"></span> En cumplimiento</div><div class="kpi-value">${counts.ok}</div><div class="kpi-delta up"><span class="vs">uso bajo 85% del cupo</span></div></div>
        <div class="card kpi"><div class="kpi-label"><span class="sem-dot warn"></span> En alerta (ámbar)</div><div class="kpi-value">${counts.warn}</div><div class="kpi-delta down"><span class="vs">uso entre 85% y 100%</span></div></div>
        <div class="card kpi"><div class="kpi-label"><span class="sem-dot bad"></span> Excedidos</div><div class="kpi-value">${counts.bad}</div><div class="kpi-delta ${counts.bad ? 'down' : 'up'}"><span class="vs">requieren regularización</span></div></div>
        <div class="card kpi"><div class="kpi-label">Total monitoreado</div><div class="kpi-value">${LIMITES.length}</div><div class="kpi-delta up"><span class="vs">CMF + política interna</span></div></div>
      </div>
      <div class="card mt-14" style="padding:6px 10px">
        <div class="table-wrap"><table class="data">
          <thead><tr><th></th><th>Límite</th><th>Origen</th><th>Tope</th><th class="num">Uso del cupo</th><th style="width:120px"></th><th class="num">Holgura</th><th class="num">Tendencia 6M</th></tr></thead>
          <tbody>${[...LIMITES].sort((a, b) => b.uso - a.uso).map(l => {
            const e = semEstado(l.uso);
            return `<tr class="clickable" data-action="limite" data-id="${l.id}">
              <td><span class="sem-dot ${e}"></span></td>
              <td><div class="cell-main">${l.nombre}</div><div class="cell-sub">${l.norma}</div></td>
              <td><span class="ccy-chip">${l.tipo === 'Regulatorio CMF' ? 'CMF' : 'Interna'}</span></td>
              <td>${l.limite}</td>
              <td class="num" style="font-weight:700">${pct(l.uso)}</td>
              <td><div class="progress"><div class="${e}" style="width:${Math.min(l.uso, 100)}%"></div></div></td>
              <td class="num" style="color:${e === 'ok' ? 'var(--ok)' : e === 'warn' ? 'var(--warn)' : 'var(--bad)'}">${pct(100 - l.uso, 1)}</td>
              <td class="num">${Charts.sparkline(l.hist, { width: 90, height: 24, color: e === 'ok' ? '#379B94' : e === 'warn' ? '#B47300' : '#B3261E' })}</td>
            </tr>`;
          }).join('')}</tbody>
        </table></div>
      </div>
      ${sourceFootnote(['Cálculo Quant sobre posiciones del custodio', 'Parámetros: catálogo de Políticas'])}`;
  }

  if (tab === 'Detalle por norma') {
    const l = LIMITES.find(x => x.id === state.limiteId) || LIMITES[0];
    const e = semEstado(l.uso);
    const f = factor();
    const polOrigen = politicaDeLimite(l.id);
    const posiciones = POSICIONES.filter(p => l.posiciones.includes(p.id));
    const totPos = posiciones.reduce((s, p) => s + p.valor, 0);
    return `
      <div class="filter-bar">
        <select class="ctx-select" id="sel-limite">
          ${LIMITES.map(x => `<option value="${x.id}" ${x.id === l.id ? 'selected' : ''}>${x.nombre}</option>`).join('')}
        </select>
        <span class="status-pill ${e}"><span class="sem-dot ${e}"></span>${semLabel(e)} · uso ${pct(l.uso)}</span>
      </div>
      <div class="grid two">
        <div class="card">
          <div class="card-header"><span class="card-title">${l.nombre}</span></div>
          <div class="metric-grid">
            <div class="metric-cell"><div class="m-label">Norma de origen</div><div class="m-value" style="font-size:13px">${l.norma}</div></div>
            <div class="metric-cell"><div class="m-label">Tipo</div><div class="m-value" style="font-size:13px">${l.tipo}</div></div>
            <div class="metric-cell"><div class="m-label">Tope</div><div class="m-value" style="font-size:13px">${l.limite}</div></div>
            <div class="metric-cell"><div class="m-label">Situación actual</div><div class="m-value" style="font-size:13px">${l.base}</div></div>
          </div>
          <div class="mt-14">
            <div class="card-sub" style="margin-bottom:6px">Fórmula de cálculo</div>
            <div style="font-family:ui-monospace,monospace;font-size:12px;background:#F0F4F8;border-radius:7px;padding:10px 12px">${l.formula}</div>
          </div>
          <div class="mt-14">
            <div class="card-sub" style="margin-bottom:6px">Evolución del uso · últimos 6 meses</div>
            ${Charts.lineChart(['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'], [{ name: 'Uso', color: e === 'ok' ? '#379B94' : e === 'warn' ? '#B47300' : '#B3261E', points: l.hist, area: true }], { height: 150 })}
          </div>
          <div class="footnote">${polOrigen ? `<button class="btn ghost" data-action="politica" data-id="${polOrigen.id}">Ver en ${polOrigen.titulo} (${polOrigen.codigo}) ${icon('arrow', 12)}</button>` : `<button class="btn ghost" data-action="goto" data-module="politicas" data-tab="Límites parametrizados">Ver en Políticas ${icon('arrow', 12)}</button>`}</div>
        </div>
        <div class="card" style="padding:6px 10px">
          <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Posiciones que contribuyen</span>
            <span class="card-sub">${posiciones.length ? money(totPos * f) : 'cálculo a nivel de cartera'}</span></div>
          ${posiciones.length ? `<div class="table-wrap"><table class="data">
            <thead><tr><th>Instrumento</th><th class="num">Valor (${unitLabel()})</th><th class="num">Aporte al límite</th></tr></thead>
            <tbody>${posiciones.sort((a, b) => b.valor - a.valor).map(p => `
              <tr class="clickable" data-action="ficha" data-id="${p.id}">
                <td><div class="cell-main">${p.nombre}</div><div class="cell-sub">${p.emisor}</div></td>
                <td class="num">${moneyN(p.valor * f)}</td>
                <td class="num" style="font-weight:600">${pct(p.valor / totPos * 100)}</td>
              </tr>`).join('')}</tbody>
          </table></div>` : '<div class="card-sub" style="padding:14px 8px">Este límite se calcula sobre agregados de la cartera y las reservas técnicas, no sobre posiciones individuales.</div>'}
        </div>
      </div>
      ${sourceFootnote(['Cálculo Quant', polOrigen ? `${polOrigen.codigo} · NCG 152` : 'Catálogo de Políticas · NCG 152'])}`;
  }

  // Histórico
  return `
    <div class="card" style="padding:6px 10px">
      <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Histórico de excesos y alertas</span><span class="card-sub">base de auditoría · últimos 12 meses</span></div>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Fecha</th><th>Límite</th><th>Evento</th><th>Resolución</th><th class="num">Días</th><th>Estado</th></tr></thead>
        <tbody>${HIST_CUMPLIMIENTO.map(h => `
          <tr><td>${h.fecha}</td><td class="cell-main">${h.limite}</td><td>${h.evento}</td>
          <td style="white-space:normal;max-width:320px">${h.resolucion}</td>
          <td class="num">${h.dias ?? '—'}</td>
          <td><span class="status-pill ${h.estado === 'Regularizado' ? 'ok' : 'warn'}">${h.estado}</span></td></tr>`).join('')}</tbody>
      </table></div>
    </div>
    ${sourceFootnote(['Bitácora Quant', 'Actas Comité de Inversiones'])}`;
}

/* ============================================================
   MÓDULO: POLÍTICAS
   ============================================================ */
function politicaLimiteRows(pol, f) {
  return pol.limites.map(item => {
    if (item.limiteId) {
      const l = LIMITES.find(x => x.id === item.limiteId);
      const e = semEstado(l.uso);
      return `<div class="alert-row" data-action="limite" data-id="${l.id}">
        <span class="sem-dot ${e}"></span>
        <div><div class="alert-name">${l.nombre}</div><div class="alert-norm">${l.norma} · tope ${l.limite}</div></div>
        <div class="alert-metrics">
          <div class="progress"><div class="${e}" style="width:${Math.min(l.uso, 100)}%"></div></div>
          <span class="alert-usage">${pct(l.uso)}</span>
        </div>
      </div>`;
    }
    return `<div class="alert-row" data-action="goto" data-module="${item.modulo}" data-tab="${item.tab}">
      <span class="sem-dot ok"></span>
      <div><div class="alert-name">${item.nombre}</div><div class="alert-norm">Umbral interno · tope ${item.tope}</div></div>
      <div class="alert-metrics"><span class="meta-chip">Ver módulo</span></div>
    </div>`;
  }).join('');
}

function vPoliticas() {
  const tab = activeTab('politicas');
  const f = factor();

  if (tab === 'Catálogo') {
    const q = state.politicaQ.toLowerCase();
    const list = POLITICAS.filter(p => !q || (p.titulo + p.codigo + p.area + p.resumen).toLowerCase().includes(q));
    const porArea = {};
    list.forEach(p => (porArea[p.area] = porArea[p.area] || []).push(p));
    return `
      <div class="filter-bar">
        <input class="search-input" id="pol-q" placeholder="Buscar política, código o área…" value="${state.politicaQ}" style="width:320px">
        <span class="filter-chip-count">${list.length} de ${POLITICAS.length} políticas</span>
      </div>
      ${Object.entries(porArea).map(([area, ps]) => `
        <div class="card mt-14">
          <div class="card-header"><span class="card-title">${area}</span><span class="card-sub">${ps.length} documento${ps.length > 1 ? 's' : ''}</span></div>
          ${ps.map(p => `
            <div class="doc-item clickable" data-action="politica" data-id="${p.id}">
              <div class="doc-icon">${icon('policy', 17)}</div>
              <div>
                <div class="doc-name">${p.titulo}</div>
                <div class="doc-meta">${p.codigo} · ${p.version} · vigente desde ${p.vigencia}</div>
                <div class="doc-meta" style="margin-top:2px">${p.resumen}</div>
              </div>
              <div class="doc-right">
                <span class="status-pill ok">${p.estado}</span>
                <span style="color:var(--ml-blue)">${icon('arrow', 14)}</span>
              </div>
            </div>`).join('')}
        </div>`).join('') || '<div class="card mt-14" style="text-align:center;color:var(--text-3);padding:30px">Sin resultados para la búsqueda.</div>'}
      ${sourceFootnote(['Repositorio documental Gerencia de Inversiones'])}`;
  }

  if (tab === 'Ficha de política') {
    if (!state.politicaId) {
      return `
        <div class="card">
          <div class="card-header"><span class="card-title">Selecciona una política</span>
            <span class="card-sub">desde el Catálogo, la búsqueda global (⌘K) o esta lista</span></div>
          ${POLITICAS.map(p => `
            <div class="alert-row" data-action="politica" data-id="${p.id}">
              <div><div class="alert-name">${p.titulo}</div><div class="alert-norm">${p.codigo} · ${p.area} · ${p.version}</div></div>
              <div class="alert-metrics"><span class="status-pill ok" style="width:auto">${p.estado}</span></div>
            </div>`).join('')}
        </div>`;
    }
    const p = POLITICAS.find(x => x.id === state.politicaId);
    return `
      <button class="back-link" data-action="tab" data-module="politicas" data-tab="Catálogo">${icon('back', 13)} Volver al catálogo</button>
      <div class="grid two">
        <div class="card">
          <div class="card-header">
            <span class="card-title">${p.titulo}</span>
            <span class="spacer"></span>
            <button class="btn" data-action="export" data-what="${p.codigo} — ${p.titulo} (${p.version}, PDF)">${icon('export', 13)} PDF</button>
          </div>
          <div class="ficha-chips" style="margin:2px 0 14px">
            <span class="meta-chip">${p.codigo}</span>
            <span class="meta-chip">${p.area}</span>
            <span class="status-pill ok">${p.estado} · ${p.version}</span>
          </div>
          <div class="metric-grid">
            <div class="metric-cell"><div class="m-label">Vigencia desde</div><div class="m-value" style="font-size:13px">${p.vigencia}</div></div>
            <div class="metric-cell"><div class="m-label">Aprobada por</div><div class="m-value" style="font-size:13px">${p.aprobadaPor}</div></div>
            <div class="metric-cell"><div class="m-label">Próxima revisión</div><div class="m-value" style="font-size:13px">${p.proximaRevision}</div></div>
          </div>
          <div class="mt-14">
            <div class="card-sub" style="margin-bottom:6px">Objetivo</div>
            <div style="font-size:12.5px;color:var(--text-2);line-height:1.6">${p.objetivo}</div>
          </div>
          <div class="mt-14">
            <div class="card-sub" style="margin-bottom:6px">Principios rectores</div>
            ${p.principios.map((pr, i) => `<div style="display:flex;gap:10px;padding:6px 0;font-size:12.5px;color:var(--text-2)">
              <span style="color:var(--ml-blue);font-weight:800">${i + 1}.</span><span style="line-height:1.5">${pr}</span></div>`).join('')}
          </div>
          <div class="mt-14">
            <div class="card-sub" style="margin-bottom:6px">Módulos que gobierna</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${p.modulos.map(m => `<button class="btn ghost" data-action="goto" data-module="${m.modulo}" data-tab="${m.tab}">${m.label} ${icon('arrow', 12)}</button>`).join('')}
            </div>
          </div>
        </div>
        <div>
          <div class="card">
            <div class="card-header"><span class="card-title">Límites y umbrales de esta política</span>
              <span class="spacer"></span>
              <button class="btn ghost" data-action="goto" data-module="cumplimiento" data-tab="Semáforo de límites">Ver Cumplimiento ${icon('arrow', 12)}</button>
            </div>
            ${politicaLimiteRows(p, f)}
            <div class="footnote">Vínculo bidireccional: cada límite enlaza a su estado actual en Cumplimiento, y viceversa.</div>
          </div>
          <div class="card mt-14">
            <div class="card-header"><span class="card-title">Historial de versiones</span><span class="card-sub">${p.codigo}</span></div>
            <div class="timeline mt-14">
              ${p.versiones.map(v => `
                <div class="tl-item ${v.estado === 'Vigente' ? 'current' : ''}">
                  <div class="tl-title">${v.version}
                    <span class="status-pill ${v.estado === 'Vigente' ? 'ok' : 'neutral'}">${v.estado}</span></div>
                  <div class="tl-meta">Vigencia desde ${v.vigencia}</div>
                  <div class="tl-desc">${v.cambios}</div>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
      ${sourceFootnote(['Repositorio documental Gerencia de Inversiones'])}`;
  }

  if (tab === 'Límites parametrizados') {
    const rows = POLITICAS.flatMap(p => p.limites.map(item => ({ pol: p, item })));
    return `
      <div class="card" style="padding:6px 10px">
        <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Límites y umbrales parametrizados</span>
          <span class="card-sub">${rows.length} entradas en ${POLITICAS.length} políticas · enlazan a su estado actual en Cumplimiento</span></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Límite / umbral</th><th>Política de origen</th><th>Origen normativo</th><th>Tope</th><th>Estado actual</th><th class="num">Uso</th><th></th></tr></thead>
          <tbody>${rows.map(({ pol, item }) => {
            if (item.limiteId) {
              const l = LIMITES.find(x => x.id === item.limiteId);
              const e = semEstado(l.uso);
              return `<tr class="clickable" data-action="limite" data-id="${l.id}">
                <td><div class="cell-main">${l.nombre}</div><div class="cell-sub">${l.norma}</div></td>
                <td><span class="meta-chip">${pol.codigo}</span></td>
                <td><span class="ccy-chip">${l.tipo === 'Regulatorio CMF' ? 'CMF' : 'Interna'}</span></td>
                <td>${l.limite}</td>
                <td><span class="status-pill ${e}"><span class="sem-dot ${e}"></span>${semLabel(e)}</span></td>
                <td class="num" style="font-weight:700">${pct(l.uso)}</td>
                <td style="color:var(--ml-blue)">${icon('arrow', 13)}</td></tr>`;
            }
            return `<tr class="clickable" data-action="goto" data-module="${item.modulo}" data-tab="${item.tab}">
              <td><div class="cell-main">${item.nombre}</div><div class="cell-sub">Umbral interno</div></td>
              <td><span class="meta-chip">${pol.codigo}</span></td>
              <td><span class="ccy-chip">Interna</span></td>
              <td>${item.tope}</td>
              <td><span class="status-pill ok"><span class="sem-dot ok"></span>Monitoreado</span></td>
              <td class="num">—</td>
              <td style="color:var(--ml-blue)">${icon('arrow', 13)}</td></tr>`;
          }).join('')}</tbody>
        </table></div>
      </div>`;
  }

  // Versiones — timeline combinado de todas las políticas
  const eventos = POLITICAS.flatMap(p => p.versiones.map(v => ({ ...v, pol: p })))
    .sort((a, b) => b.vigencia.split('-').reverse().join('').localeCompare(a.vigencia.split('-').reverse().join('')));
  return `
    <div class="card">
      <div class="card-header"><span class="card-title">Historial de versiones · todas las políticas</span><span class="card-sub">${eventos.length} versiones registradas, orden cronológico</span></div>
      <div class="timeline mt-14">
        ${eventos.map(v => `
          <div class="tl-item ${v.estado === 'Vigente' ? 'current' : ''} clickable" data-action="politica" data-id="${v.pol.id}">
            <div class="tl-title">${v.pol.titulo} — ${v.version}
              <span class="status-pill ${v.estado === 'Vigente' ? 'ok' : 'neutral'}">${v.estado}</span></div>
            <div class="tl-meta">${v.pol.codigo} · vigencia desde ${v.vigencia}</div>
            <div class="tl-desc">${v.cambios}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

/* ============================================================
   MÓDULO: PROCEDIMIENTOS
   ============================================================ */
function vProcedimientos() {
  const tab = activeTab('procedimientos');
  const q = state.procQ.toLowerCase();
  const list = PROCEDIMIENTOS.filter(p => !q || (p.nombre + p.area + p.dueno + p.id).toLowerCase().includes(q));

  const searchBar = `
    <div class="filter-bar">
      <input class="search-input" id="proc-q" placeholder="Buscar procedimiento, área o responsable…" value="${state.procQ}" style="width:320px">
      <span class="filter-chip-count">${list.length} de ${PROCEDIMIENTOS.length} procedimientos</span>
    </div>`;

  if (tab === 'Por área') {
    const areas = {};
    list.forEach(p => (areas[p.area] = areas[p.area] || []).push(p));
    return searchBar + Object.entries(areas).map(([area, ps]) => `
      <div class="card mt-14">
        <div class="card-header"><span class="card-title">${area}</span><span class="card-sub">${ps.length} procedimiento${ps.length > 1 ? 's' : ''}</span></div>
        ${ps.map(p => `
          <div class="doc-item">
            <div class="doc-icon">${icon('doc', 17)}</div>
            <div>
              <div class="doc-name">${p.nombre}</div>
              <div class="doc-meta">${p.id} · Dueño: ${p.dueno} · Vigente desde ${p.vigencia}</div>
            </div>
            <div class="doc-right">
              <span class="status-pill ${p.estado === 'Vigente' ? 'ok' : 'warn'}">${p.estado}</span>
              <button class="btn" data-action="export" data-what="${p.id} — ${p.nombre}">${icon('export', 12)} Abrir</button>
            </div>
          </div>`).join('')}
      </div>`).join('') + sourceFootnote(['Repositorio documental Gerencia de Inversiones']);
  }

  // Vigencias
  return searchBar + `
    <div class="card mt-14" style="padding:6px 10px">
      <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Control de vigencias</span><span class="card-sub">P1: recordatorios automáticos de revisión</span></div>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Código</th><th>Procedimiento</th><th>Área</th><th>Dueño</th><th>Vigente desde</th><th>Próxima revisión</th><th>Estado</th></tr></thead>
        <tbody>${[...list].sort((a, b) => a.revision.split('-').reverse().join('').localeCompare(b.revision.split('-').reverse().join(''))).map(p => `
          <tr><td>${p.id}</td><td class="cell-main">${p.nombre}</td><td>${p.area}</td><td>${p.dueno}</td>
          <td>${p.vigencia}</td><td>${p.revision}</td>
          <td><span class="status-pill ${p.estado === 'Vigente' ? 'ok' : 'warn'}">${p.estado}</span></td></tr>`).join('')}</tbody>
      </table></div>
    </div>`;
}

/* ============================================================
   MÓDULO: FAQ
   ============================================================ */
function vFaq() {
  const tab = activeTab('faq');

  if (tab === 'Categorías') {
    return FAQ.map(cat => `
      <div class="card mt-14" style="margin-top:0;margin-bottom:14px">
        <div class="card-header"><span class="card-title">${cat.cat}</span><span class="card-sub">${cat.qas.length} preguntas</span></div>
        ${cat.qas.map(qa => `
          <div class="faq-item">
            <button class="faq-q" data-action="faq-toggle">
              <span style="color:var(--ml-blue)">${icon('faq', 15)}</span>${qa.q}
              <span class="chev">${icon('down', 14)}</span>
            </button>
            <div class="faq-a">${qa.a}</div>
          </div>`).join('')}
      </div>`).join('');
  }

  // Glosario
  return `
    <div class="card">
      <div class="card-header"><span class="card-title">Glosario de términos</span><span class="card-sub">conceptos de inversiones y regulación de seguros en Chile</span></div>
      <div class="grid two-even mt-14" style="gap:0 30px">
        ${GLOSARIO.map(g => `<div style="padding:10px 0;border-bottom:1px solid #EEF2F6">
          <div class="gloss-term">${g.t}</div><div class="gloss-def">${g.d}</div></div>`).join('')}
      </div>
    </div>`;
}

/* ============================================================
   MÓDULO: DERIVADOS & COLATERAL
   ============================================================ */
function vDerivados() {
  const tab = activeTab('derivados');
  const f = factor();
  const mtmNeto = DERIVADOS.reduce((s, d) => s + d.mtm, 0);
  const nocional = DERIVADOS.reduce((s, d) => s + d.nocional, 0);

  if (tab === 'Posiciones') {
    return `
      <div class="grid kpis">
        ${kpiCard('MTM neto de la cartera', money(mtmNeto * f), `${DERIVADOS.length} contratos vigentes`, mtmNeto >= 0, 'derivados', 'Contrapartes y CSA')}
        ${kpiCard('Nocional total', money(nocional * f), 'equivalente CLP al corte', true, 'derivados', 'Calce con derivados')}
        ${kpiCard('Colateral neto', money((COLATERAL.recibido - COLATERAL.entregado) * f), `recibido ${money(COLATERAL.recibido * f)} · entregado ${money(COLATERAL.entregado * f)}`, true, 'derivados', 'Contrapartes y CSA')}
        ${kpiCard('Buffer de estrés', `${fmt(COLATERAL.disponible / (ESTRES_DERIV[4].llamado || 1), 1)}x`, `mínimo política ${fmt(COLATERAL.bufferMinimo, 1)}x`, COLATERAL.disponible / ESTRES_DERIV[4].llamado >= COLATERAL.bufferMinimo, 'derivados', 'Estrés y colaterales')}
      </div>
      <div class="card mt-14" style="padding:6px 10px">
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Contrato</th><th>Tipo</th><th>Contraparte</th><th class="num">Nocional (${unitLabel()})</th><th class="num">MTM (${unitLabel()})</th><th>Vencimiento</th><th>Propósito</th></tr></thead>
          <tbody>${DERIVADOS.map(d => `
            <tr>
              <td><div class="cell-main">${d.id}</div><div class="cell-sub">${d.detalle}</div></td>
              <td><span class="ccy-chip">${d.tipo}</span></td>
              <td>${d.contraparte}</td>
              <td class="num">${moneyN(d.nocional * f)}</td>
              <td class="num" style="font-weight:700;color:${d.mtm >= 0 ? 'var(--ok)' : 'var(--bad)'}">${moneyN(d.mtm * f)}</td>
              <td>${d.vencimiento}</td>
              <td><span class="meta-chip">${d.proposito}</span></td>
            </tr>`).join('')}
          <tr class="total-row"><td colspan="3">Total</td>
            <td class="num">${moneyN(nocional * f)}</td>
            <td class="num" style="color:${mtmNeto >= 0 ? 'var(--ok)' : 'var(--bad)'}">${moneyN(mtmNeto * f)}</td><td colspan="2"></td></tr>
          </tbody>
        </table></div>
      </div>
      ${sourceFootnote(['Sistema de derivados / Tesorería', 'Market data (curvas y TC)'])}`;
  }

  if (tab === 'Calce con derivados') {
    return `
      <div class="grid kpis">
        ${kpiCard('Descalce USD sin derivados', pct(DESCALCE_USD.sin, 1), 'exposición USD bruta / cartera', false, 'cartera', 'Composición')}
        ${kpiCard('Descalce USD con derivados', pct(DESCALCE_USD.con, 1), `tope política ${pct(DESCALCE_USD.limite, 1)} — CCS y forwards vigentes`, true, 'cumplimiento', 'Detalle por norma')}
        ${kpiCard('Tramos que mejoran', `${CALCE_DERIV.filter(t => t.con > t.sin).length} de ${CALCE_DERIV.length}`, 'índice de calce por tramo NCG 461', true, 'modelos', 'Calce / ALM')}
      </div>
      <div class="card mt-14">
        <div class="card-header"><span class="card-title">Índice de calce por tramo · sin y con derivados</span><span class="card-sub">efecto de CCS y swaps sobre el calce NCG 461</span></div>
        ${Charts.groupedBars(CALCE_DERIV.map(t => t.tramo), [
          { name: 'Sin derivados', color: '#8494A3', values: CALCE_DERIV.map(t => t.sin) },
          { name: 'Con derivados', color: '#007ABC', values: CALCE_DERIV.map(t => t.con) },
        ], { fmtVal: v => pct(v, 0) })}
        <div class="chart-legend">
          <div class="legend-item"><span class="legend-swatch" style="background:#8494A3"></span>Sin derivados</div>
          <div class="legend-item"><span class="legend-swatch" style="background:#007ABC"></span>Con derivados</div>
        </div>
      </div>
      <div class="card mt-14" style="padding:6px 10px">
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Tramo</th><th class="num">Índice sin derivados</th><th class="num">Índice con derivados</th><th class="num">Mejora</th><th>Estado</th></tr></thead>
          <tbody>${CALCE_DERIV.map(t => {
            const e = t.con >= 100 ? 'ok' : t.con >= 90 ? 'warn' : 'bad';
            return `<tr>
              <td class="cell-main">${t.tramo}</td>
              <td class="num" style="color:var(--text-3)">${pct(t.sin, 1)}</td>
              <td class="num" style="font-weight:700">${pct(t.con, 1)}</td>
              <td class="num" style="color:${t.con > t.sin ? 'var(--ok)' : 'var(--text-3)'}">${t.con > t.sin ? '+' + fmt(t.con - t.sin, 1) + ' pp' : '—'}</td>
              <td><span class="status-pill ${e}">${e === 'ok' ? 'Calzado' : e === 'warn' ? 'Cercano' : 'Déficit'}</span></td></tr>`;
          }).join('')}</tbody>
        </table></div>
      </div>
      ${sourceFootnote(['Sistema actuarial / ALM', 'Sistema de derivados / Tesorería'])}`;
  }

  if (tab === 'Estrés y colaterales') {
    const severo = ESTRES_DERIV[ESTRES_DERIV.length - 1];
    const buffer = COLATERAL.disponible / severo.llamado;
    return `
      <div class="grid kpis">
        ${kpiCard('Colateral elegible disponible', money(COLATERAL.disponible * f), 'caja + soberanos post-haircut', true, 'liquidez', 'Posición de liquidez')}
        ${kpiCard('Llamado bajo combinado severo', money(severo.llamado * f), severo.supuesto, false, 'derivados', 'Contrapartes y CSA')}
        ${kpiCard('Buffer resultante', `${fmt(buffer, 1)}x`, `mínimo de política ${fmt(COLATERAL.bufferMinimo, 1)}x`, buffer >= COLATERAL.bufferMinimo, 'cumplimiento', 'Semáforo de límites')}
      </div>
      <div class="grid two mt-14">
        <div class="card" style="padding:6px 10px">
          <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Escenarios de estrés</span><span class="card-sub">ΔMTM y llamado de margen proyectado</span></div>
          <div class="table-wrap"><table class="data">
            <thead><tr><th>Escenario</th><th class="num">ΔMTM (${unitLabel()})</th><th class="num">Llamado (${unitLabel()})</th><th class="num">Buffer</th><th>Estado</th></tr></thead>
            <tbody>${ESTRES_DERIV.map(s => {
              const b = s.llamado ? COLATERAL.disponible / s.llamado : null;
              const e = !s.llamado ? 'ok' : b >= COLATERAL.bufferMinimo ? 'ok' : b >= 1 ? 'warn' : 'bad';
              return `<tr>
                <td><div class="cell-main">${s.escenario}</div><div class="cell-sub">${s.supuesto}</div></td>
                <td class="num" style="font-weight:600;color:${s.dMtm >= 0 ? 'var(--ok)' : 'var(--bad)'}">${moneyN(s.dMtm * f)}</td>
                <td class="num">${s.llamado ? moneyN(s.llamado * f) : '—'}</td>
                <td class="num" style="font-weight:700">${b ? fmt(b, 1) + 'x' : '—'}</td>
                <td><span class="status-pill ${e}">${e === 'ok' ? 'Cubierto' : e === 'warn' ? 'Ajustado' : 'Insuficiente'}</span></td></tr>`;
            }).join('')}</tbody>
          </table></div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">ΔMTM por escenario</span><span class="card-sub">${unitLabel()}</span></div>
          ${Charts.hBars(ESTRES_DERIV.map(s => ({ label: s.escenario, value: Math.round(convVal(s.dMtm * f).v) })), { showSign: true, fmtVal: v => fmt(v) })}
          <div class="footnote"><span class="meta-chip">Patrón de ejercicio: resultado → detalle → supuestos → corridas</span>
            <span class="meta-chip src">Corrida diaria batch 08:45 · Tesorería</span></div>
        </div>
      </div>
      ${sourceFootnote(['Sistema de derivados / Tesorería', 'Market data (escenarios)'])}`;
  }

  // Contrapartes y CSA
  return `
    <div class="card" style="padding:6px 10px">
      <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Contrapartes y acuerdos CSA</span><span class="card-sub">threshold y MTA en ${unitLabel()} · colateral al corte</span></div>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Contraparte</th><th>Rating</th><th class="num">MTM neto</th><th class="num">Colateral entregado</th><th class="num">Colateral recibido</th><th class="num">Threshold</th><th class="num">MTA</th></tr></thead>
        <tbody>${CSA.map(c => `
          <tr>
            <td class="cell-main">${c.contraparte}</td>
            <td><span class="rating-chip ${ratingBucket(c.rating) === 'BBB e inferior' ? 'mid' : ''}">${c.rating}</span></td>
            <td class="num" style="font-weight:700;color:${c.mtmNeto >= 0 ? 'var(--ok)' : 'var(--bad)'}">${moneyN(c.mtmNeto * f)}</td>
            <td class="num">${c.entregado ? moneyN(c.entregado * f) : '—'}</td>
            <td class="num">${c.recibido ? moneyN(c.recibido * f) : '—'}</td>
            <td class="num">${moneyN(c.threshold * f)}</td>
            <td class="num">${moneyN(c.mta * f)}</td>
          </tr>`).join('')}</tbody>
      </table></div>
    </div>
    <div class="footnote"><span class="meta-chip">CSA bilateral con margen de variación diario; colateral elegible: caja y soberanos locales</span></div>
    ${sourceFootnote(['Sistema de derivados / Tesorería', 'Contratos ISDA/CSA (Legal)'])}`;
}

/* ============================================================
   MÓDULO: LIQUIDEZ
   ============================================================ */
function vLiquidez() {
  const tab = activeTab('liquidez');
  const f = factor();
  const liquidos = LIQUIDEZ_BUCKETS.filter(b => b.haircut != null).reduce((s, b) => s + b.valor * (1 - b.haircut / 100), 0);
  const total = LIQUIDEZ_BUCKETS.reduce((s, b) => s + b.valor, 0);

  if (tab === 'Posición de liquidez') {
    return `
      <div class="grid kpis">
        ${kpiCard('Activos líquidos post-haircut', money(liquidos * f), `${pct(liquidos / total * 100, 0)} de la cartera`, true, 'cartera', 'Composición')}
        ${kpiCard('Salidas próximas 30 días', money(LIQ_SALIDAS_30D * f), 'pensiones, rescates y gastos', true, 'liquidez', 'Fuentes y usos')}
        ${kpiCard('Cobertura 12M · escenario base', `${fmt(LIQ_ESTRES[0].liquidos / LIQ_ESTRES[0].salidas, 1)}x`, `mínimo política ${fmt(LIQ_COBERTURA_MIN, 1)}x`, true, 'liquidez', 'Estrés de liquidez')}
        ${kpiCard('Colateral comprometido', money(COLATERAL.entregado * f), 'entregado bajo CSA vigentes', true, 'derivados', 'Contrapartes y CSA')}
      </div>
      <div class="card mt-14" style="padding:6px 10px">
        <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Activos líquidos por bucket</span><span class="card-sub">haircuts de política interna</span></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Bucket</th><th class="num">Valor mercado (${unitLabel()})</th><th class="num">Haircut</th><th class="num">Valor líquido (${unitLabel()})</th><th class="num">% del total líquido</th></tr></thead>
          <tbody>${LIQUIDEZ_BUCKETS.map(b => {
            const liq = b.haircut != null ? b.valor * (1 - b.haircut / 100) : 0;
            return `<tr>
              <td class="cell-main">${b.bucket}</td>
              <td class="num">${moneyN(b.valor * f)}</td>
              <td class="num">${b.haircut != null ? pct(b.haircut, 0) : '<span class="cell-sub">no computa</span>'}</td>
              <td class="num" style="font-weight:600">${b.haircut != null ? moneyN(liq * f) : '—'}</td>
              <td class="num">${b.haircut != null ? pct(liq / liquidos * 100, 1) : '—'}</td></tr>`;
          }).join('')}
          <tr class="total-row"><td>Total líquido</td><td class="num">${moneyN(total * f)}</td><td></td>
            <td class="num">${moneyN(liquidos * f)}</td><td class="num">100,0%</td></tr>
          </tbody>
        </table></div>
      </div>
      ${sourceFootnote(['Custodio', 'Política de liquidez (haircuts) · Riesgo'])}`;
  }

  if (tab === 'Estrés de liquidez') {
    return `
      <div class="card" style="padding:6px 10px">
        <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Ejercicio de estrés de liquidez · horizonte 12 meses</span>
          <span class="card-sub">cobertura = activos líquidos disponibles / salidas estresadas · mínimo ${fmt(LIQ_COBERTURA_MIN, 1)}x</span></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Escenario</th><th class="num">Salidas 12M (${unitLabel()})</th><th class="num">Líquidos disponibles</th><th class="num">Cobertura</th><th style="width:120px"></th><th>Estado</th></tr></thead>
          <tbody>${LIQ_ESTRES.map(s => {
            const cob = s.liquidos / s.salidas;
            const e = cob >= LIQ_COBERTURA_MIN * 1.25 ? 'ok' : cob >= LIQ_COBERTURA_MIN ? 'warn' : 'bad';
            const w = Math.min(cob / 5 * 100, 100);
            return `<tr>
              <td><div class="cell-main">${s.escenario}</div><div class="cell-sub">${s.supuesto}</div></td>
              <td class="num">${moneyN(s.salidas * f)}</td>
              <td class="num">${moneyN(s.liquidos * f)}</td>
              <td class="num" style="font-weight:700">${fmt(cob, 1)}x</td>
              <td><div class="progress"><div class="${e}" style="width:${w}%"></div></div></td>
              <td><span class="status-pill ${e}">${e === 'ok' ? 'Holgado' : e === 'warn' ? 'Ajustado' : 'Insuficiente'}</span></td></tr>`;
          }).join('')}</tbody>
        </table></div>
      </div>
      <div class="card mt-14">
        <div class="card-header"><span class="card-title">Salidas estresadas por escenario</span><span class="card-sub">${unitLabel()} · 12 meses</span></div>
        ${Charts.hBars(LIQ_ESTRES.map(s => ({ label: s.escenario, value: Math.round(convVal(s.salidas * f).v), color: '#1E4C76' })), { fmtVal: v => fmt(v) })}
        <div class="footnote"><span class="meta-chip">Corrida mensual · Riesgo Financiero</span>
          <span class="meta-chip src">Supuestos versionados por corrida (patrón de ejercicio)</span></div>
      </div>
      ${sourceFootnote(['Sistema actuarial (salidas proyectadas)', 'Riesgo Financiero (escenarios)'])}`;
  }

  // Fuentes y usos
  const totE = FUENTES_USOS.labels.map((_, i) => FUENTES_USOS.entradas.reduce((s, e) => s + e.values[i], 0));
  const totS = FUENTES_USOS.labels.map((_, i) => FUENTES_USOS.salidas.reduce((s, e) => s + e.values[i], 0));
  return `
    <div class="card">
      <div class="card-header"><span class="card-title">Fuentes y usos proyectados · próximos 90 días</span><span class="card-sub">entradas vs. salidas de caja, ${unitLabel()}</span></div>
      ${Charts.groupedBars(FUENTES_USOS.labels, [
        { name: 'Entradas', color: '#379B94', values: totE.map(v => v * f) },
        { name: 'Salidas', color: '#1E4C76', values: totS.map(v => v * f) },
      ], { fmtVal: v => fmt(convVal(v).v / 1000, 0) + ' mM' })}
      <div class="chart-legend">
        <div class="legend-item"><span class="legend-swatch" style="background:#379B94"></span>Entradas (cupones, vencimientos, primas RRVV)</div>
        <div class="legend-item"><span class="legend-swatch" style="background:#1E4C76"></span>Salidas (pensiones, rescates, gastos)</div>
      </div>
    </div>
    <div class="card mt-14" style="padding:6px 10px">
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Concepto</th>${FUENTES_USOS.labels.map(l => `<th class="num">${l}</th>`).join('')}</tr></thead>
        <tbody>
          ${FUENTES_USOS.entradas.map(e => `<tr><td class="cell-main">${e.name}</td>${e.values.map(v => `<td class="num" style="color:var(--ok)">${moneyN(v * f)}</td>`).join('')}</tr>`).join('')}
          ${FUENTES_USOS.salidas.map(e => `<tr><td class="cell-main">${e.name}</td>${e.values.map(v => `<td class="num" style="color:var(--bad)">−${moneyN(v * f)}</td>`).join('')}</tr>`).join('')}
          <tr class="total-row"><td>Flujo neto</td>${FUENTES_USOS.labels.map((_, i) => {
            const neto = (totE[i] - totS[i]) * f;
            return `<td class="num" style="color:${neto >= 0 ? 'var(--ok)' : 'var(--bad)'}">${neto >= 0 ? '' : '−'}${moneyN(Math.abs(neto))}</td>`;
          }).join('')}</tr>
        </tbody>
      </table></div>
    </div>
    ${sourceFootnote(['Custodio (calendario de pagos)', 'Sistema actuarial', 'Comercial (primas proyectadas)'])}`;
}

/* ============================================================
   MÓDULO: RENTAS VITALICIAS
   ============================================================ */
function rrvvSem(margen) { return margen < RRVV_PRICING.margenObjetivo ? 'bad' : margen <= RRVV_PRICING.margenObjetivo + 2 ? 'warn' : 'ok'; }

function vRrvv() {
  const tab = activeTab('rrvv');
  const f = factor();

  if (tab === 'Pricing del día') {
    const totVentas = RRVV_PRICING.productos.reduce((s, p) => s + p.ventasMes, 0);
    const margenPond = RRVV_PRICING.productos.reduce((s, p) => s + p.margen * p.ventasMes, 0) / totVentas;
    return `
      <div class="grid kpis">
        ${kpiCard('Curva de reinversión (UF)', pct(RRVV_PRICING.curvaReinversion, 2), 'TIR cartera candidata al corte', true, 'relval', 'Screener de spreads')}
        ${kpiCard('Margen promedio ponderado', `${fmt(margenPond, 0)} pb`, `objetivo mínimo ${RRVV_PRICING.margenObjetivo} pb`, margenPond >= RRVV_PRICING.margenObjetivo, 'rrvv', 'Sensibilidades')}
        ${kpiCard('Prima del mes', money(totVentas * f), 'emisión junio 2026', true, 'rrvv', 'Histórico de emisión')}
        ${kpiCard('Posición SCOMP', '2° de 6', 'tasa promedio ofrecida', true, 'rrvv', 'Competencia SCOMP')}
      </div>
      <div class="card mt-14" style="padding:6px 10px">
        <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Tasas de venta vigentes por producto</span>
          <span class="card-sub">insumos actualizados ${RRVV_PRICING.actualizado} · fuente actuarial</span></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Producto</th><th class="num">Tasa de venta (UF)</th><th class="num">Prom. SCOMP</th><th class="num">Diferencia</th><th class="num">Duración pasivo</th><th class="num">Margen</th><th>Estado</th><th class="num">Prima mes (${unitLabel()})</th></tr></thead>
          <tbody>${RRVV_PRICING.productos.map(p => {
            const e = rrvvSem(p.margen);
            return `<tr>
              <td class="cell-main">${p.producto}</td>
              <td class="num" style="font-weight:700">${pct(p.tasaVenta, 2)}</td>
              <td class="num" style="color:var(--text-3)">${pct(p.scomp, 2)}</td>
              <td class="num" style="color:${p.tasaVenta >= p.scomp ? 'var(--ok)' : 'var(--bad)'}">${p.tasaVenta >= p.scomp ? '+' : ''}${fmt((p.tasaVenta - p.scomp) * 100, 0)} pb</td>
              <td class="num">${fmt(p.durPasivo, 1)} años</td>
              <td class="num" style="font-weight:700">${p.margen} pb</td>
              <td><span class="status-pill ${e}"><span class="sem-dot ${e}"></span>${e === 'ok' ? 'Sobre objetivo' : e === 'warn' ? 'En el objetivo' : 'Bajo objetivo'}</span></td>
              <td class="num">${moneyN(p.ventasMes * f)}</td></tr>`;
          }).join('')}</tbody>
        </table></div>
      </div>
      <div class="footnote"><span class="meta-chip">Margen = tasa de reinversión − tasa de venta − gastos, en pb</span>
        <span class="meta-chip src">Gobernanza del dato: pricing oficial actuarial (pregunta abierta #14 del PRD)</span>
        <button class="btn ghost" data-action="politica" data-id="POL-06">Ver Política de Pricing RRVV (INV-10) ${icon('arrow', 12)}</button></div>
      ${sourceFootnote(['Sistema actuarial (pricing)', 'SCOMP', 'Market data (curvas)'])}`;
  }

  if (tab === 'Competencia SCOMP') {
    return `
      <div class="grid two">
        <div class="card" style="padding:6px 10px">
          <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Tasas ofrecidas por compañía · RV Inmediata</span><span class="card-sub">promedio de cotizaciones SCOMP · junio 2026</span></div>
          <div class="table-wrap"><table class="data">
            <thead><tr><th class="num">#</th><th>Compañía</th><th class="num">Tasa (UF)</th><th class="num">Win rate</th></tr></thead>
            <tbody>${SCOMP_COMP.map(c => `
              <tr style="${c.cia === 'MetLife' ? 'background:#EAF4FB' : ''}">
                <td class="num">${c.ranking}</td>
                <td class="cell-main">${c.cia}${c.cia === 'MetLife' ? ' <span class="rating-chip">Nosotros</span>' : ''}</td>
                <td class="num" style="font-weight:700">${pct(c.tasa, 2)}</td>
                <td class="num">${pct(c.winRate, 1)}</td>
              </tr>`).join('')}</tbody>
          </table></div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Brecha de tasa vs. líder</span><span class="card-sub">pb bajo la mejor oferta</span></div>
          ${Charts.hBars(SCOMP_COMP.map(c => ({ label: c.cia, value: Math.round((c.tasa - SCOMP_COMP[0].tasa) * 100), color: c.cia === 'MetLife' ? '#007ABC' : '#C7D2DD' })), { showSign: true, fmtVal: v => `${v} pb` })}
          <div class="footnote"><span class="meta-chip">Fuente SCOMP: carga oficial · frecuencia a validar (pregunta #11 del PRD)</span></div>
        </div>
      </div>
      ${sourceFootnote(['SCOMP (tasas y adjudicaciones)'])}`;
  }

  if (tab === 'Sensibilidades') {
    return `
      <div class="grid two">
        <div class="card" style="padding:6px 10px">
          <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Sensibilidad del margen</span><span class="card-sub">impacto en pb sobre el margen promedio · corrida actuarial 30-06-2026</span></div>
          <div class="table-wrap"><table class="data">
            <thead><tr><th>Variable</th><th class="num">Impacto</th><th>Comentario</th></tr></thead>
            <tbody>${RRVV_SENSIBILIDAD.map(s => `
              <tr>
                <td class="cell-main">${s.variable}</td>
                <td class="num" style="font-weight:700;color:${s.impacto >= 0 ? 'var(--ok)' : 'var(--bad)'}">${s.impacto >= 0 ? '+' : ''}${s.impacto} pb</td>
                <td style="white-space:normal;max-width:300px" class="cell-sub">${s.comentario}</td>
              </tr>`).join('')}</tbody>
          </table></div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Impacto por variable</span><span class="card-sub">pb de margen</span></div>
          ${Charts.hBars(RRVV_SENSIBILIDAD.map(s => ({ label: s.variable, value: s.impacto })), { showSign: true, fmtVal: v => `${v > 0 ? '+' : ''}${v} pb` })}
          <div class="footnote"><span class="meta-chip">Supuestos: tablas RV-2020, gastos presupuesto 2026</span>
            <span class="meta-chip src">Responsable: Actuarial · C. Undurraga</span></div>
        </div>
      </div>
      ${sourceFootnote(['Sistema actuarial (corrida de sensibilidades)'])}`;
  }

  // Histórico de emisión
  return `
    <div class="grid two">
      <div class="card">
        <div class="card-header"><span class="card-title">Tasa de venta vs. mercado SCOMP</span><span class="card-sub">últimos 12 meses · RV Inmediata</span></div>
        ${Charts.lineChart(RRVV_HIST.labels, [
          { name: 'MetLife', color: '#007ABC', points: RRVV_HIST.tasaVenta, area: true },
          { name: 'Prom. SCOMP', color: '#8494A3', points: RRVV_HIST.tasaScomp, dash: true },
        ])}
        <div class="chart-legend">
          <div class="legend-item"><span class="legend-swatch" style="background:#007ABC"></span>Tasa de venta MetLife</div>
          <div class="legend-item"><span class="legend-swatch" style="background:#8494A3"></span>Promedio SCOMP</div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Prima emitida mensual</span><span class="card-sub">${unitLabel()} · todos los productos</span></div>
        ${Charts.stackedBars(RRVV_HIST.labels, [
          { name: 'Prima', color: '#379B94', values: RRVV_HIST.prima.map(v => v * f) },
        ], { fmtVal: v => fmt(convVal(v).v / 1000, 0) + ' mM' })}
        <div class="footnote"><span class="meta-chip">Prima 12M: ${money(RRVV_HIST.prima.reduce((a, b) => a + b, 0) * f)}</span></div>
      </div>
    </div>
    ${sourceFootnote(['Comercial (emisión)', 'SCOMP'])}`;
}

/* ============================================================
   MÓDULO: RELATIVE VALUE
   ============================================================ */
function vRelval() {
  const tab = activeTab('relval');

  if (tab === 'Screener de spreads') {
    return `
      <div class="card" style="padding:6px 10px">
        <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Screener de spreads</span>
          <span class="card-sub">spread actual vs. promedio 12M · z-score sobre ventana 12M · señal de la mesa</span></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Eje de comparación</th><th class="num">Spread actual</th><th class="num">Promedio 12M</th><th class="num">Z-score</th><th style="width:120px"></th><th>Señal</th></tr></thead>
          <tbody>${[...RELVAL_SCREENER].sort((a, b) => Math.abs(b.z) - Math.abs(a.z)).map(r => {
            const e = r.senal === 'Barato' ? 'ok' : r.senal === 'Caro' ? 'bad' : 'neutral';
            const w = Math.min(Math.abs(r.z) / 2 * 100, 100);
            return `<tr>
              <td class="cell-main">${r.eje}</td>
              <td class="num" style="font-weight:700">${r.actual} pb</td>
              <td class="num" style="color:var(--text-3)">${r.prom12m} pb</td>
              <td class="num" style="font-weight:700;color:${r.z >= 1 ? 'var(--ok)' : r.z <= -1 ? 'var(--bad)' : 'inherit'}">${r.z >= 0 ? '+' : '−'}${fmt(Math.abs(r.z), 1)}σ</td>
              <td><div class="progress"><div class="${e === 'neutral' ? 'ok' : e}" style="width:${w}%;${e === 'neutral' ? 'background:#C7D2DD' : ''}"></div></div></td>
              <td><span class="status-pill ${e}">${r.senal}</span></td></tr>`;
          }).join('')}</tbody>
        </table></div>
      </div>
      <div class="footnote"><span class="meta-chip">Convención: z ≥ +1σ = barato (spread amplio) · z ≤ −1σ = caro (spread comprimido)</span></div>
      ${sourceFootnote(['Market data (RiskAmerica / Bloomberg)', 'Metodología: Estudios'])}`;
  }

  if (tab === 'Pares e históricos') {
    return `
      <div class="card" style="padding:6px 10px">
        <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Pares seguidos por la mesa</span><span class="card-sub">spread en pb · últimos 12 meses</span></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Par</th><th class="num">Spread actual</th><th class="num">Z-score</th><th class="num">Evolución 12M</th></tr></thead>
          <tbody>${RELVAL_PARES.map(p => `
            <tr>
              <td class="cell-main">${p.par}</td>
              <td class="num" style="font-weight:700">${p.hist[p.hist.length - 1]} pb</td>
              <td class="num" style="font-weight:700;color:${p.z >= 1 ? 'var(--ok)' : p.z <= -1 ? 'var(--bad)' : 'inherit'}">${p.z >= 0 ? '+' : '−'}${fmt(Math.abs(p.z), 1)}σ</td>
              <td class="num">${Charts.sparkline(p.hist, { width: 130, height: 28, color: '#007ABC' })}</td>
            </tr>`).join('')}</tbody>
        </table></div>
      </div>
      ${sourceFootnote(['Market data', 'Definición de pares: Mesa RF'])}`;
  }

  // Ideas y watchlist
  const estadoPill = e => e === 'Propuesta' ? 'warn' : e === 'Ejecutada parcial' ? 'ok' : 'neutral';
  return `
    <div class="grid two-even">
      ${RELVAL_IDEAS.map(i => `
        <div class="card">
          <div class="card-header">
            <span class="card-title">${i.titulo}</span>
            <span class="spacer"></span>
            <span class="status-pill ${estadoPill(i.estado)}">${i.estado}</span>
          </div>
          <div style="font-size:12.5px;color:var(--text-2);line-height:1.6">${i.tesis}</div>
          <div class="footnote">
            <span class="meta-chip">${i.owner}</span>
            <span class="meta-chip">${i.fecha}</span>
          </div>
        </div>`).join('')}
    </div>
    <div class="footnote"><span class="meta-chip">Fase 2: las ideas en estado "Propuesta" alimentarán el flujo de órdenes y rebalanceo</span></div>
    ${sourceFootnote(['Registro de la mesa (comité semanal)'])}`;
}

/* ============================================================
   MÓDULO: OPTIMIZACIÓN
   ============================================================ */
function vOptimizacion() {
  const tab = activeTab('optimizacion');

  if (tab === 'Frontera y propuesta') {
    return `
      <div class="grid kpis">
        ${kpiCard('Retorno esperado', `${pct(OPT.actual.ret, 2)} → ${pct(OPT.propuesto.ret, 2)}`, `mejora +${fmt((OPT.propuesto.ret - OPT.actual.ret) * 100, 0)} pb`, true, 'optimizacion', 'Actual vs. óptimo')}
        ${kpiCard('Volatilidad esperada', `${pct(OPT.actual.vol, 2)} → ${pct(OPT.propuesto.vol, 2)}`, `reducción −${fmt((OPT.actual.vol - OPT.propuesto.vol) * 100, 0)} pb`, true, 'optimizacion', 'Actual vs. óptimo')}
        ${kpiCard('Restricciones activas', `${OPT.restricciones.filter(r => r.estado === 'Activa').length} de ${OPT.restricciones.length}`, 'límites que atan la solución', true, 'optimizacion', 'Restricciones')}
        ${kpiCard('Última corrida', OPT.corrida.split(' · ')[1], `${OPT.corrida.split(' · ')[0]} · ${OPT.responsable}`, true, 'optimizacion', 'Corridas')}
      </div>
      <div class="card mt-14">
        <div class="card-header"><span class="card-title">Frontera eficiente y asignación propuesta</span>
          <span class="card-sub">retorno esperado vs. volatilidad · corrida ${OPT.corrida}</span></div>
        ${Charts.frontier(OPT.frontera, [
          { label: 'Actual', vol: OPT.actual.vol, ret: OPT.actual.ret, color: '#8494A3' },
          { label: 'Propuesta', vol: OPT.propuesto.vol, ret: OPT.propuesto.ret, color: '#007ABC' },
        ])}
        <div class="footnote"><span class="meta-chip src">${OPT.supuestos}</span></div>
      </div>
      ${sourceFootnote(['Optimizador (Estudios)', 'Market data (retornos esperados)'])}`;
  }

  if (tab === 'Actual vs. óptimo') {
    return `
      <div class="grid two">
        <div class="card" style="padding:6px 10px">
          <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Asignación por clase de activo</span><span class="card-sub">% de la cartera</span></div>
          <div class="table-wrap"><table class="data">
            <thead><tr><th>Clase</th><th class="num">Actual</th><th class="num">Óptimo propuesto</th><th class="num">Delta</th></tr></thead>
            <tbody>${OPT.asignacion.map(a => {
              const d = +(a.optimo - a.actual).toFixed(1);
              return `<tr>
                <td class="cell-main">${a.clase}</td>
                <td class="num">${pct(a.actual, 1)}</td>
                <td class="num" style="font-weight:700">${pct(a.optimo, 1)}</td>
                <td class="num" style="font-weight:700;color:${d > 0 ? 'var(--ok)' : d < 0 ? 'var(--bad)' : 'var(--text-3)'}">${d > 0 ? '+' : ''}${fmt(d, 1)} pp</td></tr>`;
            }).join('')}</tbody>
          </table></div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Movimientos propuestos</span><span class="card-sub">puntos porcentuales de la cartera</span></div>
          ${Charts.hBars(OPT.asignacion.filter(a => Math.abs(a.optimo - a.actual) > 0.05).map(a => ({ label: a.clase, value: +(a.optimo - a.actual).toFixed(1) })), { showSign: true, fmtVal: v => `${v > 0 ? '+' : ''}${fmt(v, 1)} pp` })}
          <div class="footnote"><span class="meta-chip">Ejecución sujeta a aprobación del Comité de Inversiones (Fase 2: rebalanceo)</span></div>
        </div>
      </div>
      ${sourceFootnote(['Optimizador (Estudios)'])}`;
  }

  if (tab === 'Restricciones') {
    return `
      <div class="card" style="padding:6px 10px">
        <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Restricciones de la corrida ${OPT.corrida.split(' · ')[0]}</span>
          <span class="card-sub">las restricciones "activas" atan la solución óptima · enlazadas a Cumplimiento</span></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Restricción</th><th>Estado en el óptimo</th><th>Uso actual del límite</th><th></th></tr></thead>
          <tbody>${OPT.restricciones.map(r => {
            const lim = r.limiteId ? LIMITES.find(l => l.id === r.limiteId) : null;
            const e = lim ? semEstado(lim.uso) : null;
            return `<tr ${lim ? `class="clickable" data-action="limite" data-id="${lim.id}"` : ''}>
              <td class="cell-main">${r.nombre}</td>
              <td><span class="status-pill ${r.estado === 'Activa' ? 'warn' : 'ok'}">${r.estado}</span></td>
              <td>${lim ? `<span class="status-pill ${e}"><span class="sem-dot ${e}"></span>${pct(lim.uso)}</span>` : '<span class="cell-sub">objetivo interno ALM</span>'}</td>
              <td style="color:var(--ml-blue)">${lim ? icon('arrow', 13) : ''}</td></tr>`;
          }).join('')}</tbody>
        </table></div>
      </div>
      <div class="footnote"><button class="btn ghost" data-action="politica" data-id="POL-07">Ver Política de Gestión Activa y Relative Value (INV-11) ${icon('arrow', 12)}</button></div>
      ${sourceFootnote(['Optimizador (Estudios)', 'POL-01 · POL-07'])}`;
  }

  // Corridas
  return `
    <div class="card" style="padding:6px 10px">
      <div class="card-header" style="padding:10px 8px 0"><span class="card-title">Historial de corridas del optimizador</span><span class="card-sub">P1: comparación entre versiones</span></div>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Versión</th><th>Fecha</th><th>Responsable</th><th class="num">Mejora estimada</th><th>Estado</th></tr></thead>
        <tbody>${OPT_CORRIDAS.map(c => `
          <tr><td class="cell-main">${c.version}</td><td>${c.fecha}</td><td>${c.responsable}</td>
          <td class="num">${c.mejora}</td>
          <td><span class="status-pill ${c.estado.startsWith('Aprobada') ? 'ok' : 'neutral'}">${c.estado}</span></td></tr>`).join('')}</tbody>
      </table></div>
    </div>
    <div class="footnote"><span class="meta-chip src">Supuestos de la corrida vigente: ${OPT.supuestos}</span></div>
    ${sourceFootnote(['Optimizador (Estudios)', 'Actas Comité de Inversiones'])}`;
}

/* ============================================================
   PLATAFORMA — catálogo de widgets para vistas personalizadas
   Cada widget reusa data y gráficos del portal; tipo 'kpi' va en la
   fila superior, tipo 'card' en la grilla principal.
   ============================================================ */
const WIDGETS = [
  { id: 'w-kpi-total', nombre: 'Valor total de la cartera', grupo: 'Cartera', tipo: 'kpi',
    render: () => kpiCard('Valor total de la cartera', money(totalCartera()), `${POSICIONES.length} posiciones · ${CARTERAS.find(c => c.id === state.cartera).nombre}`, true, 'cartera', 'Posiciones') },
  { id: 'w-kpi-ytd', nombre: 'Retorno YTD vs. benchmark', grupo: 'Resultados', tipo: 'kpi',
    render: () => kpiCard('Retorno YTD', signPct(RETORNO_TOTAL.ytd), `vs. bmk ${signPct(RETORNO_TOTAL.ytd - RETORNO_TOTAL.bmk_ytd)}`, true, 'resultados', 'Retornos') },
  { id: 'w-kpi-limites', nombre: 'Límites en alerta', grupo: 'Cumplimiento', tipo: 'kpi',
    render: () => kpiCard('Límites en alerta', `${alertas().length} de ${LIMITES.length}`, 'umbral ámbar ≥ 85% del cupo', alertas().length === 0, 'cumplimiento', 'Semáforo de límites') },
  { id: 'w-kpi-mtm', nombre: 'MTM neto de derivados', grupo: 'Derivados', tipo: 'kpi',
    render: () => { const mtm = DERIVADOS.reduce((s, d) => s + d.mtm, 0) * factor(); return kpiCard('MTM neto derivados', money(mtm), `${DERIVADOS.length} contratos vigentes`, mtm >= 0, 'derivados', 'Posiciones'); } },
  { id: 'w-kpi-liquidez', nombre: 'Cobertura de liquidez', grupo: 'Liquidez', tipo: 'kpi',
    render: () => { const s = LIQ_ESTRES[LIQ_ESTRES.length - 1]; const c = s.liquidos / s.salidas; return kpiCard('Cobertura liquidez 12M', `${fmt(c, 1)}x`, `combinado severo · mínimo ${fmt(LIQ_COBERTURA_MIN, 1)}x`, c >= LIQ_COBERTURA_MIN * 1.25, 'liquidez', 'Estrés de liquidez'); } },
  { id: 'w-kpi-rrvv', nombre: 'Margen pricing RRVV', grupo: 'Rentas Vitalicias', tipo: 'kpi',
    render: () => { const tot = RRVV_PRICING.productos.reduce((s, p) => s + p.ventasMes, 0); const m = RRVV_PRICING.productos.reduce((s, p) => s + p.margen * p.ventasMes, 0) / tot; return kpiCard('Margen RRVV ponderado', `${fmt(m, 0)} pb`, `objetivo ≥ ${RRVV_PRICING.margenObjetivo} pb`, m >= RRVV_PRICING.margenObjetivo, 'rrvv', 'Pricing del día'); } },
  { id: 'w-retorno-12m', nombre: 'Retorno acumulado 12M vs. benchmark', grupo: 'Resultados', tipo: 'card',
    render: () => `<div class="card"><div class="card-header"><span class="card-title">Retorno acumulado 12 meses</span>
      <span class="spacer"></span><button class="btn ghost" data-action="goto" data-module="resultados" data-tab="vs. Benchmark">Detalle ${icon('arrow', 12)}</button></div>
      ${Charts.lineChart(SERIE_RETORNO.labels, [
        { name: 'Cartera', color: '#007ABC', points: SERIE_RETORNO.cartera, area: true },
        { name: 'Benchmark', color: '#8494A3', points: SERIE_RETORNO.benchmark, dash: true }])}</div>` },
  { id: 'w-composicion', nombre: 'Composición por clase de activo', grupo: 'Cartera', tipo: 'card',
    render: () => {
      const f = factor(), total = totalCartera(), by = {};
      POSICIONES.forEach(p => by[p.clase] = (by[p.clase] || 0) + p.valor * f);
      const segs = Object.entries(by).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value, color: CLASE_COLORS[label] }));
      return `<div class="card"><div class="card-header"><span class="card-title">Composición por clase</span>
        <span class="spacer"></span><button class="btn ghost" data-action="goto" data-module="cartera" data-tab="Composición">Detalle ${icon('arrow', 12)}</button></div>
        <div class="donut-flex">${Charts.donut(segs, { size: 150, stroke: 23, centerLabel: unitLabel(), centerValue: moneyN(total) })}
        <div class="chart-legend" style="flex-direction:column;gap:6px">${segs.slice(0, 5).map(s => `<div class="legend-item"><span class="legend-swatch" style="background:${s.color}"></span>${s.label} <b>${pct(s.value / total * 100)}</b></div>`).join('')}</div></div></div>`;
    } },
  { id: 'w-semaforo', nombre: 'Semáforo de límites (top 5)', grupo: 'Cumplimiento', tipo: 'card',
    render: () => `<div class="card"><div class="card-header"><span class="card-title">Límites con mayor uso</span>
      <span class="spacer"></span><button class="btn ghost" data-action="goto" data-module="cumplimiento" data-tab="Semáforo de límites">Ver todos ${icon('arrow', 12)}</button></div>
      ${[...LIMITES].sort((a, b) => b.uso - a.uso).slice(0, 5).map(l => { const e = semEstado(l.uso); return `
        <div class="alert-row" data-action="limite" data-id="${l.id}"><span class="sem-dot ${e}"></span>
        <div><div class="alert-name">${l.nombre}</div><div class="alert-norm">${l.norma}</div></div>
        <div class="alert-metrics"><div class="progress"><div class="${e}" style="width:${Math.min(l.uso, 100)}%"></div></div>
        <span class="alert-usage">${pct(l.uso)}</span></div></div>`; }).join('')}</div>` },
  { id: 'w-top-posiciones', nombre: 'Principales posiciones', grupo: 'Cartera', tipo: 'card',
    render: () => { const f = factor(), tot = POSICIONES.reduce((s, p) => s + p.valor, 0); return `<div class="card">
      <div class="card-header"><span class="card-title">Principales posiciones</span>
      <span class="spacer"></span><button class="btn ghost" data-action="goto" data-module="cartera" data-tab="Posiciones">Ver todas ${icon('arrow', 12)}</button></div>
      <div class="table-wrap"><table class="data"><thead><tr><th>Instrumento</th><th class="num">Valor (${unitLabel()})</th><th class="num">%</th></tr></thead>
      <tbody>${[...POSICIONES].sort((a, b) => b.valor - a.valor).slice(0, 6).map(p => `
        <tr class="clickable" data-action="ficha" data-id="${p.id}"><td><div class="cell-main">${p.nombre}</div><div class="cell-sub">${p.emisor}</div></td>
        <td class="num">${moneyN(p.valor * f)}</td><td class="num">${pct(p.valor / tot * 100)}</td></tr>`).join('')}</tbody></table></div></div>`; } },
  { id: 'w-flujos', nombre: 'Flujos proyectados 12M', grupo: 'Proyecciones', tipo: 'card',
    render: () => { const f = factor(); return `<div class="card"><div class="card-header"><span class="card-title">Flujos proyectados · 12 meses</span>
      <span class="spacer"></span><button class="btn ghost" data-action="goto" data-module="proyecciones" data-tab="Flujos y vencimientos">Detalle ${icon('arrow', 12)}</button></div>
      ${Charts.stackedBars(FLUJOS.labels, [
        { name: 'Cupones', color: '#007ABC', values: FLUJOS.cupones.map(v => v * f) },
        { name: 'Amortizaciones', color: '#379B94', values: FLUJOS.amortizaciones.map(v => v * f) }], { fmtVal: v => fmt(v / 1000, 0) + ' mM' })}</div>`; } },
  { id: 'w-estres-deriv', nombre: 'Estrés de derivados y colateral', grupo: 'Derivados', tipo: 'card',
    render: () => { const f = factor(); return `<div class="card"><div class="card-header"><span class="card-title">Estrés de derivados → colateral</span>
      <span class="spacer"></span><button class="btn ghost" data-action="goto" data-module="derivados" data-tab="Estrés y colaterales">Detalle ${icon('arrow', 12)}</button></div>
      <div class="table-wrap"><table class="data"><thead><tr><th>Escenario</th><th class="num">ΔMTM</th><th class="num">Llamado</th><th class="num">Buffer</th></tr></thead>
      <tbody>${ESTRES_DERIV.map(s => { const b = s.llamado ? COLATERAL.disponible / s.llamado : null; return `<tr>
        <td class="cell-main">${s.escenario}</td>
        <td class="num" style="color:${s.dMtm >= 0 ? 'var(--ok)' : 'var(--bad)'}">${moneyN(s.dMtm * f)}</td>
        <td class="num">${s.llamado ? moneyN(s.llamado * f) : '—'}</td>
        <td class="num" style="font-weight:700">${b ? fmt(b, 1) + 'x' : '—'}</td></tr>`; }).join('')}</tbody></table></div></div>`; } },
  { id: 'w-calce', nombre: 'Calce por tramo (con derivados)', grupo: 'Modelos', tipo: 'card',
    render: () => `<div class="card"><div class="card-header"><span class="card-title">Índice de calce por tramo</span>
      <span class="spacer"></span><button class="btn ghost" data-action="goto" data-module="derivados" data-tab="Calce con derivados">Detalle ${icon('arrow', 12)}</button></div>
      ${Charts.groupedBars(CALCE_DERIV.map(t => t.tramo), [
        { name: 'Sin derivados', color: '#8494A3', values: CALCE_DERIV.map(t => t.sin) },
        { name: 'Con derivados', color: '#007ABC', values: CALCE_DERIV.map(t => t.con) }], { fmtVal: v => pct(v, 0), height: 200 })}</div>` },
  { id: 'w-pricing-rrvv', nombre: 'Pricing RRVV por producto', grupo: 'Rentas Vitalicias', tipo: 'card',
    render: () => `<div class="card"><div class="card-header"><span class="card-title">Pricing RRVV del día</span>
      <span class="spacer"></span><button class="btn ghost" data-action="goto" data-module="rrvv" data-tab="Pricing del día">Detalle ${icon('arrow', 12)}</button></div>
      <div class="table-wrap"><table class="data"><thead><tr><th>Producto</th><th class="num">Tasa venta</th><th class="num">SCOMP</th><th class="num">Margen</th></tr></thead>
      <tbody>${RRVV_PRICING.productos.map(p => { const e = rrvvSem(p.margen); return `<tr>
        <td class="cell-main">${p.producto}</td><td class="num" style="font-weight:700">${pct(p.tasaVenta, 2)}</td>
        <td class="num" style="color:var(--text-3)">${pct(p.scomp, 2)}</td>
        <td class="num"><span class="status-pill ${e}">${p.margen} pb</span></td></tr>`; }).join('')}</tbody></table></div></div>` },
  { id: 'w-screener', nombre: 'Relative value — mayores señales', grupo: 'Estrategia', tipo: 'card',
    render: () => `<div class="card"><div class="card-header"><span class="card-title">Relative value · mayores desviaciones</span>
      <span class="spacer"></span><button class="btn ghost" data-action="goto" data-module="relval" data-tab="Screener de spreads">Screener ${icon('arrow', 12)}</button></div>
      <div class="table-wrap"><table class="data"><thead><tr><th>Eje</th><th class="num">Z-score</th><th>Señal</th></tr></thead>
      <tbody>${[...RELVAL_SCREENER].sort((a, b) => Math.abs(b.z) - Math.abs(a.z)).slice(0, 5).map(r => { const e = r.senal === 'Barato' ? 'ok' : r.senal === 'Caro' ? 'bad' : 'neutral'; return `<tr>
        <td class="cell-main">${r.eje}</td><td class="num" style="font-weight:700">${r.z >= 0 ? '+' : '−'}${fmt(Math.abs(r.z), 1)}σ</td>
        <td><span class="status-pill ${e}">${r.senal}</span></td></tr>`; }).join('')}</tbody></table></div></div>` },
  { id: 'w-frontera', nombre: 'Frontera eficiente y propuesta', grupo: 'Estrategia', tipo: 'card',
    render: () => `<div class="card"><div class="card-header"><span class="card-title">Frontera eficiente</span><span class="card-sub">corrida ${OPT.corrida}</span>
      <span class="spacer"></span><button class="btn ghost" data-action="goto" data-module="optimizacion" data-tab="Frontera y propuesta">Detalle ${icon('arrow', 12)}</button></div>
      ${Charts.frontier(OPT.frontera, [
        { label: 'Actual', vol: OPT.actual.vol, ret: OPT.actual.ret, color: '#8494A3' },
        { label: 'Propuesta', vol: OPT.propuesto.vol, ret: OPT.propuesto.ret, color: '#007ABC' }], { height: 220 })}</div>` },
];

function renderCustomView(view) {
  const kpis = view.widgets.map(id => WIDGETS.find(w => w.id === id)).filter(w => w && w.tipo === 'kpi');
  const cards = view.widgets.map(id => WIDGETS.find(w => w.id === id)).filter(w => w && w.tipo === 'card');
  return `
    <div class="page-header">
      <div>
        <div class="page-title">${view.nombre}</div>
        <div class="page-desc">${view.desc || 'Vista personalizada'} · creada por ${currentUser().nombre} el ${view.creada}</div>
      </div>
      <div class="page-actions">
        <span class="meta-chip"><span class="custom-dot" style="display:inline-block"></span>&nbsp;Vista personal</span>
        <span class="meta-chip">${icon('clock', 12)} Corte: ${fechaCorteCL()}</span>
        <button class="btn" data-action="propose-view" data-id="${view.id}">${icon('up', 13)} Proponer al catálogo</button>
        <button class="btn" data-action="delete-view" data-id="${view.id}">${icon('trash', 13)} Eliminar</button>
      </div>
    </div>
    ${kpis.length ? `<div class="grid kpis">${kpis.map(w => w.render()).join('')}</div>` : ''}
    ${cards.length ? `<div class="grid two-even mt-14">${cards.map(w => w.render()).join('')}</div>` : ''}
    ${!view.widgets.length ? '<div class="locked-banner">Esta vista no tiene widgets. Elimínala y crea una nueva.</div>' : ''}
    <div class="footnote"><span class="meta-chip">Los widgets respetan la barra de contexto (cartera, corte, moneda) igual que los módulos oficiales</span></div>`;
}

/* ============================================================
   MÓDULO: EXPLORAR Y PROPONER
   ============================================================ */
function estadoPropuesta(e) {
  return e === 'Propuesta' ? 'neutral' : e === 'En revisión' ? 'warn' : 'ok';
}

function vExplorar() {
  const tab = activeTab('explorar');

  if (tab === 'Galería de módulos') {
    const zonaLabel = id => (ZONAS.find(z => z.id === id) || {}).label || '';
    return `
      <div class="filter-bar">
        <span class="card-sub">Todos los módulos publicados en el portal, con su dueño de contenido y madurez. ¿Falta algo?</span>
        <span class="filter-chip-count"></span>
        <button class="btn" data-action="open-suggest">${icon('up', 13)} Sugerir nueva sección</button>
        <button class="btn primary" data-action="open-builder">${icon('plus', 13)} Crear vista propia</button>
      </div>
      <div class="gallery-grid">
        ${MODULES.filter(m => m.id !== 'explorar').map(m => {
          const meta = MODULO_META[m.id] || {};
          return `
          <div class="mod-card" data-action="nav" data-module="${m.id}">
            <div class="mc-head">
              <div class="mc-icon">${icon(m.icon, 17)}</div>
              <div>
                <div class="mc-name">${m.nombre}</div>
                <div class="mc-zone">${zonaLabel(m.zona)}${m.tabs.length ? ` · ${m.tabs.length} pestañas` : ''}</div>
              </div>
            </div>
            <div class="mc-desc">${m.desc}</div>
            <div class="mc-foot">
              <span class="badge-estado ${meta.estado === 'Beta' ? 'beta' : 'oficial'}">${meta.estado || 'Oficial'}</span>
              <span>${meta.owner || ''}</span>
              <span class="adopt"><span class="progress"><span class="ok" style="display:block;width:${meta.adopcion || 0}%;height:100%"></span></span>${meta.adopcion || 0}%</span>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="footnote"><span class="meta-chip">Adopción = % de usuarios activos que visitan el módulo cada semana</span>
        <span class="meta-chip src">Los módulos Beta se gradúan a Oficial tras un ciclo de feedback</span></div>`;
  }

  if (tab === 'Propuestas') {
    const votes = userVotes();
    const props = allProposals().sort((a, b) => (b.votos + (votes[b.id] ? 1 : 0)) - (a.votos + (votes[a.id] ? 1 : 0)));
    return `
      <div class="filter-bar">
        <span class="card-sub">Nuevas secciones sugeridas por usuarios. Las más votadas se priorizan en el roadmap del portal.</span>
        <span class="filter-chip-count"></span>
        <button class="btn primary" data-action="open-suggest">${icon('up', 13)} Sugerir nueva sección</button>
      </div>
      <div class="card" style="padding:8px 14px">
        ${props.map(p => {
          const voted = !!votes[p.id];
          const total = p.votos + (voted ? 1 : 0);
          return `
          <div class="doc-item">
            <button class="vote-btn ${voted ? 'voted' : ''}" data-action="vote" data-id="${p.id}" title="${voted ? 'Quitar voto' : 'Votar'}">
              ${icon('up', 13)}${total}
            </button>
            <div>
              <div class="doc-name">${p.titulo}</div>
              <div class="doc-meta" style="margin-top:3px">${p.detalle}</div>
              <div class="doc-meta" style="margin-top:4px">${p.owner} · ${p.area} · ${p.fecha}</div>
            </div>
            <div class="doc-right"><span class="status-pill ${estadoPropuesta(p.estado)}">${p.estado}</span></div>
          </div>`;
        }).join('')}
      </div>
      <div class="footnote"><span class="meta-chip">Ciclo de vida: Propuesta → En revisión (comité de producto mensual) → Aprobada → Publicada en la galería</span></div>`;
  }

  // Mis vistas
  const views = customViews();
  return `
    <div class="filter-bar">
      <span class="card-sub">Vistas que construiste con el catálogo de widgets. Solo tú las ves, salvo que las propongas al catálogo.</span>
      <span class="filter-chip-count">${views.length} vista${views.length === 1 ? '' : 's'}</span>
      <button class="btn primary" data-action="open-builder">${icon('plus', 13)} Crear vista propia</button>
    </div>
    ${views.length ? `<div class="gallery-grid">
      ${views.map(v => `
        <div class="mod-card" data-action="nav" data-module="mi:${v.id}">
          <div class="mc-head">
            <div class="mc-icon custom">${icon('widget', 17)}</div>
            <div><div class="mc-name">${v.nombre}</div><div class="mc-zone">Mi espacio · ${v.widgets.length} widgets</div></div>
          </div>
          <div class="mc-desc">${v.desc || 'Vista personalizada.'}</div>
          <div class="mc-foot">
            <span class="badge-estado personal">Personal</span>
            <span>creada el ${v.creada}</span>
          </div>
        </div>`).join('')}
    </div>` : `
    <div class="locked-banner">
      ${icon('widget', 22)}
      <div><b>Aún no tienes vistas personalizadas.</b><br>
      Crea la tuya combinando ${WIDGETS.length} widgets de cartera, resultados, cumplimiento, derivados, liquidez, RRVV y estrategia — sin escribir código ni pedir un desarrollo.</div>
    </div>`}`;
}

/* ============================================================
   MODALES: builder de vistas y sugerencia de sección
   ============================================================ */
function openModal(html) { $('#modal').innerHTML = html; $('#modal-overlay').classList.remove('hidden'); }
function closeModal() { $('#modal-overlay').classList.add('hidden'); }

function openBuilder() {
  const grupos = {};
  WIDGETS.forEach(w => (grupos[w.grupo] = grupos[w.grupo] || []).push(w));
  openModal(`
    <div class="modal-title">Nueva vista personalizada</div>
    <div class="modal-sub">Combina widgets del catálogo para armar tu propio dashboard. La vista respeta la barra de contexto global (cartera, fecha de corte, moneda) igual que los módulos oficiales.</div>
    <label class="form-label" for="bv-nombre">Nombre de la vista</label>
    <input id="bv-nombre" class="form-input" placeholder="ej. Mi apertura de mercado" maxlength="40">
    <label class="form-label" for="bv-desc">Descripción (opcional)</label>
    <input id="bv-desc" class="form-input" placeholder="ej. Lo primero que reviso cada mañana antes del comité" maxlength="90">
    <label class="form-label">Widgets (${WIDGETS.length} disponibles)</label>
    ${Object.entries(grupos).map(([g, ws]) => `
      <div class="widget-group-label">${g}</div>
      ${ws.map(w => `
        <label class="widget-pick" data-widget="${w.id}">
          <input type="checkbox" value="${w.id}">
          <span class="wp-name">${w.nombre}</span>
          <span class="wp-type">${w.tipo === 'kpi' ? 'KPI' : 'PANEL'}</span>
        </label>`).join('')}`).join('')}
    <div class="modal-actions">
      <button class="btn" data-action="close-modal">Cancelar</button>
      <button class="btn primary" data-action="save-view">${icon('check', 13)} Crear vista</button>
    </div>`);
  $('#modal').querySelectorAll('.widget-pick input').forEach(cb =>
    cb.addEventListener('change', () => cb.closest('.widget-pick').classList.toggle('selected', cb.checked)));
  $('#bv-nombre').focus();
}

function saveViewFromBuilder() {
  const nombre = $('#bv-nombre').value.trim();
  const widgets = [...$('#modal').querySelectorAll('.widget-pick input:checked')].map(cb => cb.value);
  if (!nombre) { toast('Ponle un nombre a la vista.'); $('#bv-nombre').focus(); return; }
  if (!widgets.length) { toast('Selecciona al menos un widget.'); return; }
  const views = customViews();
  const id = 'v' + Date.now().toString(36);
  views.push({ id, nombre, desc: $('#bv-desc').value.trim(), widgets, creada: fechaCorteCL() });
  saveCustomViews(views);
  closeModal();
  state.module = 'mi:' + id;
  syncHash(); renderSidebar(); render();
  toast(`Vista "${nombre}" creada con ${widgets.length} widgets — disponible en Mi espacio`);
}

function openSuggest() {
  openModal(`
    <div class="modal-title">Sugerir una nueva sección</div>
    <div class="modal-sub">Tu propuesta entra a la cola de la comunidad, donde otros usuarios pueden votarla. El comité de producto revisa las más votadas cada mes.</div>
    <label class="form-label" for="sg-titulo">Nombre de la sección</label>
    <input id="sg-titulo" class="form-input" placeholder="ej. Panel de emisiones primarias" maxlength="60">
    <label class="form-label" for="sg-area">Área que la usaría</label>
    <select id="sg-area" class="form-input">
      <option>Mesa de Inversiones</option><option>Riesgo</option><option>Tesorería</option>
      <option>Actuarial</option><option>Alternativos</option><option>Alta gerencia</option>
    </select>
    <label class="form-label" for="sg-detalle">¿Qué problema resuelve? ¿Qué datos necesita?</label>
    <textarea id="sg-detalle" class="form-textarea" placeholder="Describe el ejercicio o reporte que hoy haces a mano, con qué frecuencia, y de qué fuentes salen los datos."></textarea>
    <div class="modal-actions">
      <button class="btn" data-action="close-modal">Cancelar</button>
      <button class="btn primary" data-action="save-suggest">${icon('up', 13)} Enviar propuesta</button>
    </div>`);
  $('#sg-titulo').focus();
}

function saveSuggestion() {
  const titulo = $('#sg-titulo').value.trim();
  const detalle = $('#sg-detalle').value.trim();
  if (!titulo) { toast('Ponle un nombre a la sección propuesta.'); $('#sg-titulo').focus(); return; }
  const props = userProposals();
  props.unshift({
    id: 'PU-' + Date.now().toString(36), titulo,
    detalle: detalle || 'Sin descripción.',
    owner: currentUser().nombre, area: $('#sg-area').value,
    votos: 0, estado: 'Propuesta', fecha: fechaCorteCL(),
  });
  saveUserProposals(props);
  const votes = userVotes();
  votes[props[0].id] = true;  // el autor parte votando su propuesta
  saveUserVotes(votes);
  closeModal();
  state.tabs.explorar = 'Propuestas';
  goTo('explorar');
  toast(`Propuesta "${titulo}" enviada a la cola de la comunidad`);
}

/* ============================================================
   RENDER PRINCIPAL
   ============================================================ */
const VIEWS = {
  inicio: vInicio, cartera: vCartera, resultados: vResultados,
  proyecciones: vProyecciones, modelos: vModelos, cumplimiento: vCumplimiento,
  derivados: vDerivados, liquidez: vLiquidez, rrvv: vRrvv, relval: vRelval, optimizacion: vOptimizacion,
  politicas: vPoliticas, procedimientos: vProcedimientos, faq: vFaq, explorar: vExplorar,
};

function render() {
  // Vistas personalizadas del usuario (module id "mi:<id>")
  if (state.module.startsWith('mi:')) {
    const view = customView(state.module.slice(3));
    if (view) {
      $('#main').innerHTML = renderCustomView(view);
      $('#main').scrollTop = 0;
      return;
    }
    state.module = 'explorar';
    state.tabs.explorar = 'Mis vistas';
  }
  const m = MODULES.find(x => x.id === state.module);
  const exportBtn = ['cartera', 'resultados', 'cumplimiento', 'proyecciones', 'derivados', 'liquidez', 'rrvv', 'relval', 'optimizacion'].includes(m.id)
    ? `<button class="btn primary" data-action="export" data-what="${m.nombre} — vista actual">${icon('export', 13)} Exportar</button>` : '';
  $('#main').innerHTML = pageHeader(m, exportBtn) + tabsBar(m) + VIEWS[m.id]();
  $('#main').scrollTop = 0;
  bindViewInputs();
}

function bindViewInputs() {
  const bind = (id, fn, evt = 'input') => { const el = $(id); if (el) el.addEventListener(evt, fn); };
  bind('#pos-q', e => { state.filtros.q = e.target.value; rerenderKeepFocus('#pos-q'); });
  bind('#pos-clase', e => { state.filtros.clase = e.target.value; render(); }, 'change');
  bind('#pos-moneda', e => { state.filtros.moneda = e.target.value; render(); }, 'change');
  bind('#pos-rating', e => { state.filtros.rating = e.target.value; render(); }, 'change');
  bind('#pos-group', e => { state.filtros.groupBy = e.target.value; render(); }, 'change');
  bind('#sel-limite', e => { state.limiteId = e.target.value; render(); }, 'change');
  bind('#proc-q', e => { state.procQ = e.target.value; rerenderKeepFocus('#proc-q'); });
  bind('#pol-q', e => { state.politicaQ = e.target.value; rerenderKeepFocus('#pol-q'); });
}

function rerenderKeepFocus(sel) {
  render();
  const el = $(sel);
  if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
}

function renderAll() { renderSidebar(); renderContextbar(); render(); }

function goTo(mod, tab) {
  state.module = mod;
  if (tab) state.tabs[mod] = tab;
  syncHash();
  renderSidebar();
  render();
}

/* ---------- Deep-linking (#modulo/tab) ---------- */
function syncHash() {
  const tab = activeTab(state.module);
  history.replaceState(null, '', `#${state.module}${tab ? '/' + encodeURIComponent(tab) : ''}`);
}

function readHash() {
  const h = location.hash.slice(1);
  if (!h) return;
  const [mod, tab] = h.split('/');
  if (mod.startsWith('mi:') && customView(mod.slice(3))) { state.module = mod; return; }
  if (MODULES.some(m => m.id === mod)) {
    state.module = mod;
    if (tab) {
      const t = decodeURIComponent(tab);
      if (MODULES.find(m => m.id === mod).tabs.includes(t)) state.tabs[mod] = t;
    }
  }
}

/* ============================================================
   EVENTOS GLOBALES (delegación)
   ============================================================ */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const a = el.dataset.action;

  if (a === 'nav') goTo(el.dataset.module);
  if (a === 'goto') goTo(el.dataset.module, el.dataset.tab || null);
  if (a === 'tab') { state.tabs[el.dataset.module] = el.dataset.tab; goTo(el.dataset.module); }
  if (a === 'ficha') { state.fichaId = el.dataset.id; state.tabs.cartera = 'Ficha instrumento'; goTo('cartera'); }
  if (a === 'limite') { state.limiteId = el.dataset.id; state.tabs.cumplimiento = 'Detalle por norma'; goTo('cumplimiento'); }
  if (a === 'politica') { state.politicaId = el.dataset.id; state.tabs.politicas = 'Ficha de política'; goTo('politicas'); }
  if (a === 'vista') { state.vista = el.dataset.v; renderContextbar(); render(); }
  if (a === 'faq-toggle') el.closest('.faq-item').classList.toggle('open');
  if (a === 'open-palette') openPalette();
  if (a === 'export') doExport(el.dataset.what);
  if (a === 'logout') doLogout();
  // Plataforma extensible
  if (a === 'toggle-zone') {
    const z = collapsedZones();
    z[el.dataset.zone] = !z[el.dataset.zone];
    saveCollapsedZones(z);
    renderSidebar();
  }
  if (a === 'open-builder') openBuilder();
  if (a === 'save-view') saveViewFromBuilder();
  if (a === 'open-suggest') openSuggest();
  if (a === 'save-suggest') saveSuggestion();
  if (a === 'close-modal') closeModal();
  if (a === 'vote') {
    const votes = userVotes();
    votes[el.dataset.id] = !votes[el.dataset.id];
    if (!votes[el.dataset.id]) delete votes[el.dataset.id];
    saveUserVotes(votes);
    render();
  }
  if (a === 'delete-view') {
    const views = customViews().filter(v => v.id !== el.dataset.id);
    saveCustomViews(views);
    state.module = 'explorar'; state.tabs.explorar = 'Mis vistas';
    syncHash(); renderSidebar(); render();
    toast('Vista eliminada de Mi espacio');
  }
  if (a === 'propose-view') {
    const v = customView(el.dataset.id);
    if (v) {
      const props = userProposals();
      props.unshift({ id: 'PU-' + Date.now().toString(36), titulo: v.nombre, detalle: `Vista personalizada con ${v.widgets.length} widgets propuesta para el catálogo común. ${v.desc || ''}`.trim(), owner: currentUser().nombre, area: 'Mi espacio', votos: 0, estado: 'Propuesta', fecha: fechaCorteCL() });
      saveUserProposals(props);
      toast(`"${v.nombre}" propuesta al catálogo — visible en Explorar → Propuestas`);
    }
  }
});

$('#modal-overlay').addEventListener('click', e => { if (e.target.id === 'modal-overlay') closeModal(); });

/* ---------- Exportación contextual ---------- */
function doExport(what) {
  if (state.module === 'cartera' && activeTab('cartera') === 'Posiciones') {
    const f = factor();
    const rows = filteredPosiciones();
    const head = ['ID', 'Instrumento', 'Clase', 'Subclase', 'Emisor', 'Moneda', 'Nominal', `Valor (${unitLabel()})`, 'Rating', 'Duracion', 'TIR'];
    const csv = [head.join(';'), ...rows.map(p => [
      p.id, `"${p.nombre}"`, p.clase, p.subclase, `"${p.emisor}"`, p.moneda, `"${p.nominal}"`,
      convVal(p.valor * f).v.toFixed(0), p.rating, p.duracion ?? '', p.tir ?? ''
    ].join(';'))].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const aEl = document.createElement('a');
    aEl.href = URL.createObjectURL(blob);
    aEl.download = `quant_posiciones_${state.cartera}_${state.fecha}_${state.moneda}.csv`;
    aEl.click();
    toast(`CSV exportado con filtros y contexto activos (corte ${fechaCorteCL()}, ${state.moneda})`);
    return;
  }
  toast(`Exportación de "${what}" — respeta filtros, moneda ${state.moneda} y corte ${fechaCorteCL()} (demo)`);
}

/* ============================================================
   COMMAND PALETTE (⌘K)
   ============================================================ */
let paletteIdx = 0;

function paletteItems() {
  const items = [];
  MODULES.forEach(m => {
    items.push({ group: 'Módulos', label: m.nombre, sub: m.desc, tag: 'MOD', run: () => goTo(m.id) });
    m.tabs.forEach(t => items.push({ group: 'Módulos', label: `${m.nombre} → ${t}`, sub: m.nombre, tag: 'TAB', run: () => goTo(m.id, t) }));
  });
  POSICIONES.forEach(p => items.push({
    group: 'Instrumentos', label: p.nombre, sub: `${p.id} · ${p.emisor} · ${p.clase}`, tag: p.moneda,
    run: () => { state.fichaId = p.id; state.tabs.cartera = 'Ficha instrumento'; goTo('cartera'); }
  }));
  LIMITES.forEach(l => items.push({
    group: 'Límites', label: l.nombre, sub: `${l.norma} · uso ${pct(l.uso)}`, tag: 'LIM',
    run: () => { state.limiteId = l.id; state.tabs.cumplimiento = 'Detalle por norma'; goTo('cumplimiento'); }
  }));
  POLITICAS.forEach(p => items.push({
    group: 'Políticas', label: p.titulo, sub: `${p.codigo} · ${p.area} · ${p.version}`, tag: 'POL',
    run: () => { state.politicaId = p.id; state.tabs.politicas = 'Ficha de política'; goTo('politicas'); }
  }));
  PROCEDIMIENTOS.forEach(p => items.push({
    group: 'Documentos', label: p.nombre, sub: `${p.id} · ${p.area}`, tag: 'DOC',
    run: () => goTo('procedimientos', 'Por área')
  }));
  customViews().forEach(v => items.push({
    group: 'Mi espacio', label: v.nombre, sub: `Vista personal · ${v.widgets.length} widgets`, tag: 'MÍA',
    run: () => goTo('mi:' + v.id)
  }));
  items.push(
    { group: 'Mi espacio', label: 'Crear vista personalizada', sub: `Combina ${WIDGETS.length} widgets del catálogo`, tag: '+', run: () => openBuilder() },
    { group: 'Mi espacio', label: 'Sugerir nueva sección', sub: 'Entra a la cola de propuestas de la comunidad', tag: '+', run: () => openSuggest() },
  );
  allProposals().forEach(p => items.push({
    group: 'Propuestas', label: p.titulo, sub: `${p.owner} · ${p.area} · ${p.estado}`, tag: 'PRO',
    run: () => goTo('explorar', 'Propuestas')
  }));
  return items;
}

function openPalette() {
  $('#palette-overlay').classList.remove('hidden');
  $('#palette-input').value = '';
  paletteIdx = 0;
  renderPalette('');
  $('#palette-input').focus();
}
function closePalette() { $('#palette-overlay').classList.add('hidden'); }

function renderPalette(q) {
  const ql = q.toLowerCase();
  const matches = paletteItems().filter(i => (i.label + ' ' + i.sub).toLowerCase().includes(ql)).slice(0, 14);
  if (!matches.length) {
    $('#palette-results').innerHTML = '<div class="palette-empty">Sin resultados. Prueba con un instrumento, emisor, límite o módulo.</div>';
    return;
  }
  let html = '', lastGroup = '';
  matches.forEach((m, i) => {
    if (m.group !== lastGroup) { html += `<div class="palette-group-label">${m.group}</div>`; lastGroup = m.group; }
    html += `<button class="palette-item ${i === paletteIdx ? 'selected' : ''}" data-pi="${i}">
      <span class="p-icon">${m.tag}</span>
      <span><div>${m.label}</div><div class="p-sub">${m.sub}</div></span>
    </button>`;
  });
  $('#palette-results').innerHTML = html;
  $('#palette-results').querySelectorAll('.palette-item').forEach(btn => {
    btn.onclick = () => { matches[+btn.dataset.pi].run(); closePalette(); };
  });
  window.__paletteMatches = matches;
}

document.addEventListener('keydown', e => {
  if (!document.body.classList.contains('authed')) return;
  if (e.key === 'Escape' && !$('#modal-overlay').classList.contains('hidden')) { closeModal(); return; }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); return; }
  if ($('#palette-overlay').classList.contains('hidden')) return;
  const matches = window.__paletteMatches || [];
  if (e.key === 'Escape') closePalette();
  if (e.key === 'ArrowDown') { e.preventDefault(); paletteIdx = Math.min(paletteIdx + 1, matches.length - 1); renderPalette($('#palette-input').value); }
  if (e.key === 'ArrowUp') { e.preventDefault(); paletteIdx = Math.max(paletteIdx - 1, 0); renderPalette($('#palette-input').value); }
  if (e.key === 'Enter' && matches[paletteIdx]) { matches[paletteIdx].run(); closePalette(); }
});

$('#palette-input').addEventListener('input', e => { paletteIdx = 0; renderPalette(e.target.value); });
$('#palette-overlay').addEventListener('click', e => { if (e.target.id === 'palette-overlay') closePalette(); });

/* ============================================================
   AUTENTICACIÓN (SSO simulado — demo)
   ============================================================ */
const AUTH_KEY = 'quant_session';

function currentUser() {
  let s = null;
  try { s = JSON.parse(sessionStorage.getItem(AUTH_KEY)); } catch (e) { /* sesión corrupta → login */ }
  if (!s) return { nombre: 'Invitado', rol: '—', iniciales: '·' };
  const iniciales = s.nombre.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return { ...s, iniciales };
}

function doLogin(email, rol) {
  const nombre = email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Usuario Demo';
  const btn = $('#login-sso');
  btn.disabled = true;
  btn.classList.add('loading');
  $('#login-sso-label').textContent = 'Redirigiendo al IdP corporativo…';
  setTimeout(() => {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify({ nombre, email, rol }));
    state.vista = rol === 'Ejecutivo' ? 'ejecutiva' : 'analista';
    document.body.classList.add('authed');
    btn.disabled = false;
    btn.classList.remove('loading');
    $('#login-sso-label').textContent = 'Continuar con SSO MetLife';
    renderAll();
    toast(`Sesión iniciada como ${nombre} (${rol}) vía SSO corporativo — demo`);
  }, 900);
}

function doLogout() {
  sessionStorage.removeItem(AUTH_KEY);
  document.body.classList.remove('authed');
  history.replaceState(null, '', location.pathname);
  state.module = 'inicio'; state.vista = 'ejecutiva';
  $('#login-email').focus();
}

$('#login-sso').addEventListener('click', () => doLogin($('#login-email').value.trim() || 'usuario.demo@metlife.cl', 'Analista Senior'));
$('#login-email').addEventListener('keydown', e => { if (e.key === 'Enter') $('#login-sso').click(); });
document.querySelectorAll('[data-login-rol]').forEach(b =>
  b.addEventListener('click', () => doLogin($('#login-email').value.trim() || 'usuario.demo@metlife.cl', b.dataset.loginRol)));

/* ---------- Init ---------- */
readHash();
window.addEventListener('hashchange', () => { readHash(); renderSidebar(); render(); });
if (currentUser().rol !== '—') {
  state.vista = currentUser().rol === 'Ejecutivo' ? 'ejecutiva' : 'analista';
  document.body.classList.add('authed');
}
renderAll();
