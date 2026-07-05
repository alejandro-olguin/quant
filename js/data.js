/* ============================================================
   Quant · Data sintética (MVP demo)
   Todos los montos base en MM CLP (millones de pesos chilenos)
   ============================================================ */

const FX = {
  UF: 39243.17,   // CLP por UF al 02-07-2026
  USD: 934.80,    // CLP por USD al 02-07-2026
  fecha: '2026-07-02'
};

const CARTERAS = [
  { id: 'consolidada', nombre: 'Cartera Consolidada', factor: 1 },
  { id: 'reservas',    nombre: 'Reservas Técnicas',   factor: 0.72 },
  { id: 'patrimonio',  nombre: 'Patrimonio Libre',    factor: 0.18 },
  { id: 'cui',         nombre: 'Seguros con CUI',     factor: 0.10 },
];

const BENCHMARKS = [
  { id: 'compuesto', nombre: 'Benchmark Compuesto MetLife' },
  { id: 'lva',       nombre: 'RiskAmerica RF + IPSA' },
  { id: 'none',      nombre: 'Sin benchmark' },
];

const FUENTES = [
  { id: 'custodio', nombre: 'Custodio (DCV / BNY Mellon)', estado: 'ok', corte: '02-07-2026 08:15' },
  { id: 'mkt', nombre: 'Market data (RiskAmerica / Bloomberg)', estado: 'ok', corte: '02-07-2026 08:30' },
  { id: 'conta', nombre: 'Contabilidad de inversiones (SAP)', estado: 'ok', corte: '01-07-2026 22:40' },
  { id: 'alm', nombre: 'Sistema actuarial / ALM', estado: 'ok', corte: '30-06-2026 (mensual)' },
];

/* ---------- POSICIONES ---------- */
// valor: MM CLP · nominal en unidad de origen · tir en %
const POSICIONES = [
  // Renta Fija Local — Soberana
  { id: 'BTU0300326', nombre: 'BTU-30 · Bono Tesorería en UF', clase: 'Renta Fija Local', subclase: 'Soberano', emisor: 'Tesorería General de la República', moneda: 'UF', nominal: '24.950.000 UF', valor: 981450, rating: 'AAA', duracion: 6.8, tir: 2.85, fuente: 'Custodio' },
  { id: 'BTU0350335', nombre: 'BTU-35 · Bono Tesorería en UF', clase: 'Renta Fija Local', subclase: 'Soberano', emisor: 'Tesorería General de la República', moneda: 'UF', nominal: '15.780.000 UF', valor: 621300, rating: 'AAA', duracion: 8.9, tir: 3.02, fuente: 'Custodio' },
  { id: 'BTP0450328', nombre: 'BTP-28 · Bono Tesorería en Pesos', clase: 'Renta Fija Local', subclase: 'Soberano', emisor: 'Tesorería General de la República', moneda: 'CLP', nominal: 'MM$ 402.000', valor: 411200, rating: 'AAA', duracion: 4.1, tir: 5.58, fuente: 'Custodio' },
  { id: 'BCP0500927', nombre: 'BCP-27 · Banco Central en Pesos', clase: 'Renta Fija Local', subclase: 'Soberano', emisor: 'Banco Central de Chile', moneda: 'CLP', nominal: 'MM$ 345.000', valor: 352600, rating: 'AAA', duracion: 3.2, tir: 5.31, fuente: 'Custodio' },
  // Renta Fija Local — Bancaria / Corporativa
  { id: 'BCHILE-AF', nombre: 'Bono Banco de Chile Serie AF', clase: 'Renta Fija Local', subclase: 'Bancario', emisor: 'Banco de Chile', moneda: 'UF', nominal: '5.320.000 UF', valor: 209800, rating: 'AAA', duracion: 4.7, tir: 3.15, fuente: 'Custodio' },
  { id: 'BSTDR-T2', nombre: 'Bono Santander-Chile Serie T2', clase: 'Renta Fija Local', subclase: 'Bancario', emisor: 'Banco Santander-Chile', moneda: 'UF', nominal: '4.450.000 UF', valor: 175900, rating: 'AAA', duracion: 5.1, tir: 3.22, fuente: 'Custodio' },
  { id: 'BENEL-K', nombre: 'Bono Enel Chile Serie K', clase: 'Renta Fija Local', subclase: 'Corporativo', emisor: 'Enel Chile S.A.', moneda: 'UF', nominal: '4.700.000 UF', valor: 185400, rating: 'AA-', duracion: 5.2, tir: 3.41, fuente: 'Custodio' },
  { id: 'BCENC-P', nombre: 'Bono Cencosud Serie P', clase: 'Renta Fija Local', subclase: 'Corporativo', emisor: 'Cencosud S.A.', moneda: 'UF', nominal: '3.600.000 UF', valor: 142100, rating: 'AA-', duracion: 6.0, tir: 3.55, fuente: 'Custodio' },
  { id: 'BMETRO-M', nombre: 'Bono Metro S.A. Serie M', clase: 'Renta Fija Local', subclase: 'Corporativo', emisor: 'Metro S.A.', moneda: 'UF', nominal: '3.050.000 UF', valor: 120300, rating: 'AA+', duracion: 7.4, tir: 3.18, fuente: 'Custodio' },
  { id: 'BFALA-R', nombre: 'Bono Falabella Serie R', clase: 'Renta Fija Local', subclase: 'Corporativo', emisor: 'Falabella S.A.', moneda: 'UF', nominal: '2.440.000 UF', valor: 96200, rating: 'A+', duracion: 4.9, tir: 3.78, fuente: 'Custodio' },
  { id: 'BCOLB-J', nombre: 'Bono Colbún Serie J', clase: 'Renta Fija Local', subclase: 'Corporativo', emisor: 'Colbún S.A.', moneda: 'UF', nominal: '2.230.000 UF', valor: 88000, rating: 'AA-', duracion: 5.8, tir: 3.49, fuente: 'Custodio' },
  { id: 'LH-MIX', nombre: 'Letras Hipotecarias (cartera)', clase: 'Renta Fija Local', subclase: 'Letras Hipotecarias', emisor: 'Varios emisores bancarios', moneda: 'UF', nominal: '1.900.000 UF', valor: 74800, rating: 'AA', duracion: 3.6, tir: 3.35, fuente: 'Custodio' },
  // Renta Fija Internacional
  { id: 'UST-10Y', nombre: 'US Treasury Note 4.25% 2034', clase: 'Renta Fija Internacional', subclase: 'Soberano ext.', emisor: 'US Treasury', moneda: 'USD', nominal: 'US$ 405 MM', valor: 381400, rating: 'AA+', duracion: 8.2, tir: 4.28, fuente: 'Custodio' },
  { id: 'UST-30Y', nombre: 'US Treasury Bond 4.50% 2054', clase: 'Renta Fija Internacional', subclase: 'Soberano ext.', emisor: 'US Treasury', moneda: 'USD', nominal: 'US$ 198 MM', valor: 190200, rating: 'AA+', duracion: 16.4, tir: 4.55, fuente: 'Custodio' },
  { id: 'JPM-31', nombre: 'JPMorgan Chase 5.30% 2031', clase: 'Renta Fija Internacional', subclase: 'Corporativo ext.', emisor: 'JPMorgan Chase & Co.', moneda: 'USD', nominal: 'US$ 115 MM', valor: 109700, rating: 'A-', duracion: 4.6, tir: 5.12, fuente: 'Custodio' },
  { id: 'AAPL-33', nombre: 'Apple Inc. 4.10% 2033', clase: 'Renta Fija Internacional', subclase: 'Corporativo ext.', emisor: 'Apple Inc.', moneda: 'USD', nominal: 'US$ 100 MM', valor: 94900, rating: 'AA+', duracion: 6.1, tir: 4.35, fuente: 'Custodio' },
  { id: 'MSFT-35', nombre: 'Microsoft Corp 4.20% 2035', clase: 'Renta Fija Internacional', subclase: 'Corporativo ext.', emisor: 'Microsoft Corp.', moneda: 'USD', nominal: 'US$ 92 MM', valor: 87600, rating: 'AAA', duracion: 7.3, tir: 4.41, fuente: 'Custodio' },
  { id: 'PAN-32', nombre: 'Rep. de Panamá 6.40% 2032', clase: 'Renta Fija Internacional', subclase: 'Soberano ext.', emisor: 'República de Panamá', moneda: 'USD', nominal: 'US$ 78 MM', valor: 71800, rating: 'BBB-', duracion: 5.0, tir: 6.62, fuente: 'Custodio' },
  // Renta Variable
  { id: 'ETF-SPX', nombre: 'iShares Core S&P 500 ETF', clase: 'Renta Variable', subclase: 'ETF internacional', emisor: 'BlackRock (iShares)', moneda: 'USD', nominal: '392.000 cuotas', valor: 210500, rating: '—', duracion: null, tir: null, fuente: 'Custodio' },
  { id: 'SQM-B', nombre: 'SQM-B (acciones)', clase: 'Renta Variable', subclase: 'Acción local', emisor: 'Soc. Química y Minera de Chile', moneda: 'CLP', nominal: '3.120.000 acc.', valor: 144800, rating: '—', duracion: null, tir: null, fuente: 'Custodio' },
  { id: 'FFMM-GL', nombre: 'Fondo Acciones Globales MFS', clase: 'Renta Variable', subclase: 'Fondo internacional', emisor: 'MFS Investment Management', moneda: 'USD', nominal: '1.480.000 cuotas', valor: 119600, rating: '—', duracion: null, tir: null, fuente: 'Custodio' },
  { id: 'CHILE-ACC', nombre: 'Banco de Chile (acciones)', clase: 'Renta Variable', subclase: 'Acción local', emisor: 'Banco de Chile', moneda: 'CLP', nominal: '985.000.000 acc.', valor: 109900, rating: '—', duracion: null, tir: null, fuente: 'Custodio' },
  { id: 'COPEC', nombre: 'Empresas Copec (acciones)', clase: 'Renta Variable', subclase: 'Acción local', emisor: 'Empresas Copec S.A.', moneda: 'CLP', nominal: '13.400.000 acc.', valor: 97700, rating: '—', duracion: null, tir: null, fuente: 'Custodio' },
  // Inmobiliario
  { id: 'INM-ISID', nombre: 'Edificio Isidora 3000 (directo)', clase: 'Inmobiliario', subclase: 'Inversión directa', emisor: 'MetLife Chile Inversiones', moneda: 'UF', nominal: '8.150.000 UF', valor: 319900, rating: '—', duracion: null, tir: 6.10, fuente: 'Contabilidad' },
  { id: 'INM-FRI', nombre: 'Fondo Rentas Inmobiliarias BTG', clase: 'Inmobiliario', subclase: 'Fondo', emisor: 'BTG Pactual AGF', moneda: 'UF', nominal: '7.120.000 UF', valor: 279500, rating: '—', duracion: null, tir: 5.65, fuente: 'Custodio' },
  { id: 'INM-APOQ', nombre: 'Torre Apoquindo 5400 (directo)', clase: 'Inmobiliario', subclase: 'Inversión directa', emisor: 'MetLife Chile Inversiones', moneda: 'UF', nominal: '6.110.000 UF', valor: 239800, rating: '—', duracion: null, tir: 5.92, fuente: 'Contabilidad' },
  // Mutuos hipotecarios
  { id: 'MH-CART', nombre: 'Mutuos Hipotecarios Endosables (cartera)', clase: 'Mutuos Hipotecarios', subclase: 'Cartera MHE', emisor: 'Adm. de Mutuos (varios)', moneda: 'UF', nominal: '12.870.000 UF', valor: 505200, rating: 'A', duracion: 5.5, tir: 4.20, fuente: 'Contabilidad' },
  // Alternativos
  { id: 'ALT-INFRA', nombre: 'Fondo Infraestructura LarrainVial', clase: 'Alternativos', subclase: 'Infraestructura', emisor: 'LarrainVial Activos AGF', moneda: 'UF', nominal: '4.560.000 UF', valor: 179800, rating: '—', duracion: null, tir: 7.85, fuente: 'Custodio' },
  { id: 'ALT-PD', nombre: 'Fondo Private Debt Moneda', clase: 'Alternativos', subclase: 'Deuda privada', emisor: 'Moneda Asset Management', moneda: 'USD', nominal: 'US$ 158 MM', valor: 149600, rating: '—', duracion: null, tir: 8.40, fuente: 'Custodio' },
  // Caja
  { id: 'DAP-CLP', nombre: 'Depósitos a plazo y caja', clase: 'Caja y Equivalentes', subclase: 'DAP / Caja', emisor: 'Varios bancos', moneda: 'CLP', nominal: 'MM$ 169.000', valor: 169900, rating: 'N-1+', duracion: 0.2, tir: 5.05, fuente: 'Custodio' },
];

const CLASE_COLORS = {
  'Renta Fija Local': '#007ABC',
  'Renta Fija Internacional': '#0090DA',
  'Renta Variable': '#379B94',
  'Inmobiliario': '#1E4C76',
  'Mutuos Hipotecarios': '#A4CE4E',
  'Alternativos': '#5B7F95',
  'Caja y Equivalentes': '#C7D2DD',
};

/* ---------- MOVIMIENTOS ---------- */
const MOVIMIENTOS = [
  { fecha: '02-07-2026', tipo: 'Compra', instrumento: 'BTU-35 · Bono Tesorería en UF', monto: 18400, contraparte: 'BancoEstado Corredores', estado: 'Liquidado' },
  { fecha: '01-07-2026', tipo: 'Cupón', instrumento: 'Bono Enel Chile Serie K', monto: 1620, contraparte: '—', estado: 'Abonado' },
  { fecha: '01-07-2026', tipo: 'Venta', instrumento: 'BCP-27 · Banco Central en Pesos', monto: 12750, contraparte: 'Santander Corredores', estado: 'Liquidado' },
  { fecha: '30-06-2026', tipo: 'Vencimiento', instrumento: 'DAP BCI 30 días', monto: 25000, contraparte: 'BCI', estado: 'Abonado' },
  { fecha: '30-06-2026', tipo: 'Compra', instrumento: 'US Treasury Note 4.25% 2034', monto: 23400, contraparte: 'J.P. Morgan', estado: 'Liquidado' },
  { fecha: '27-06-2026', tipo: 'Cupón', instrumento: 'BTU-30 · Bono Tesorería en UF', monto: 7350, contraparte: '—', estado: 'Abonado' },
  { fecha: '26-06-2026', tipo: 'Amortización', instrumento: 'Mutuos Hipotecarios Endosables', monto: 4180, contraparte: '—', estado: 'Abonado' },
  { fecha: '25-06-2026', tipo: 'Compra', instrumento: 'Fondo Private Debt Moneda', monto: 9350, contraparte: 'Moneda AM', estado: 'Liquidado' },
  { fecha: '24-06-2026', tipo: 'Venta', instrumento: 'SQM-B (acciones)', monto: 6820, contraparte: 'LarrainVial Corredores', estado: 'Liquidado' },
  { fecha: '23-06-2026', tipo: 'Dividendo', instrumento: 'Banco de Chile (acciones)', monto: 2940, contraparte: '—', estado: 'Abonado' },
];

/* ---------- RESULTADOS ---------- */
// Retornos en % por período; bmk = benchmark
const RETORNOS = [
  { clase: 'Renta Fija Local',          mtd: 0.42, qtd: 1.31, ytd: 2.86, y12: 5.94, bmk_ytd: 2.71 },
  { clase: 'Renta Fija Internacional',  mtd: 0.38, qtd: 1.05, ytd: 2.12, y12: 4.87, bmk_ytd: 2.30 },
  { clase: 'Renta Variable',            mtd: 1.85, qtd: 4.92, ytd: 9.44, y12: 14.28, bmk_ytd: 8.61 },
  { clase: 'Inmobiliario',              mtd: 0.47, qtd: 1.42, ytd: 2.95, y12: 6.12, bmk_ytd: 2.80 },
  { clase: 'Mutuos Hipotecarios',       mtd: 0.35, qtd: 1.08, ytd: 2.21, y12: 4.55, bmk_ytd: 2.21 },
  { clase: 'Alternativos',              mtd: 0.61, qtd: 1.98, ytd: 4.05, y12: 8.73, bmk_ytd: 3.62 },
  { clase: 'Caja y Equivalentes',       mtd: 0.41, qtd: 1.24, ytd: 2.49, y12: 5.21, bmk_ytd: 2.49 },
];
const RETORNO_TOTAL = { mtd: 0.55, qtd: 1.68, ytd: 3.41, y12: 6.65, bmk_mtd: 0.49, bmk_qtd: 1.55, bmk_ytd: 3.12, bmk_y12: 6.18, te: 0.42, ir: 0.69 };

// Serie retorno acumulado 12M (%), mensual
const SERIE_RETORNO = {
  labels: ['Jul 25','Ago','Sep','Oct','Nov','Dic','Ene 26','Feb','Mar','Abr','May','Jun'],
  cartera: [0.48, 1.02, 1.61, 2.05, 2.72, 3.24, 3.71, 4.18, 4.85, 5.42, 6.08, 6.65],
  benchmark: [0.45, 0.94, 1.48, 1.90, 2.51, 3.02, 3.44, 3.90, 4.51, 5.05, 5.66, 6.18],
};

const ATRIBUCION = [
  { clase: 'Renta Fija Local',         asignacion: 0.04, seleccion: 0.09, interaccion: 0.01, total: 0.14 },
  { clase: 'Renta Fija Internacional', asignacion: -0.03, seleccion: -0.08, interaccion: 0.00, total: -0.11 },
  { clase: 'Renta Variable',           asignacion: 0.06, seleccion: 0.11, interaccion: 0.02, total: 0.19 },
  { clase: 'Inmobiliario',             asignacion: 0.02, seleccion: 0.03, interaccion: 0.00, total: 0.05 },
  { clase: 'Mutuos Hipotecarios',      asignacion: 0.00, seleccion: 0.00, interaccion: 0.00, total: 0.00 },
  { clase: 'Alternativos',             asignacion: 0.01, seleccion: 0.04, interaccion: 0.00, total: 0.05 },
  { clase: 'Caja y Equivalentes',      asignacion: -0.03, seleccion: 0.00, interaccion: 0.00, total: -0.03 },
];

// P&L en MM CLP (YTD)
const PNL = [
  { clase: 'Renta Fija Local',         realizado: 18400, noRealizado: 42300, devengo: 61200 },
  { clase: 'Renta Fija Internacional', realizado: 5200, noRealizado: -8400, devengo: 24100 },
  { clase: 'Renta Variable',           realizado: 12800, noRealizado: 48900, devengo: 4300 },
  { clase: 'Inmobiliario',             realizado: 0, noRealizado: 11200, devengo: 23800 },
  { clase: 'Mutuos Hipotecarios',      realizado: 900, noRealizado: 2100, devengo: 15400 },
  { clase: 'Alternativos',             realizado: 3600, noRealizado: 7800, devengo: 6100 },
  { clase: 'Caja y Equivalentes',      realizado: 0, noRealizado: 0, devengo: 6300 },
];

/* ---------- PROYECCIONES ---------- */
// Flujos mensuales próximos 12 meses (MM CLP)
const FLUJOS = {
  labels: ['Jul 26','Ago','Sep','Oct','Nov','Dic','Ene 27','Feb','Mar','Abr','May','Jun'],
  cupones:        [31200, 18400, 24800, 19500, 22100, 48300, 28700, 17900, 25400, 21800, 19200, 45100],
  amortizaciones: [12400, 8200, 45600, 9800, 11200, 78400, 15600, 7400, 52300, 10900, 9600, 64200],
};

const VENCIMIENTOS = [
  { fecha: '15-07-2026', instrumento: 'DAP Banco Security 90d', tipo: 'Vencimiento DAP', monto: 22000 },
  { fecha: '01-08-2026', instrumento: 'Bono Falabella Serie R (cupón)', tipo: 'Cupón', monto: 1810 },
  { fecha: '15-09-2026', instrumento: 'BCP-27 (amortización parcial)', tipo: 'Amortización', monto: 35200 },
  { fecha: '01-12-2026', instrumento: 'Bono Cencosud Serie P (cupón)', tipo: 'Cupón', monto: 2520 },
  { fecha: '15-12-2026', instrumento: 'Letras Hipotecarias (pool)', tipo: 'Amortización', monto: 41800 },
  { fecha: '15-03-2027', instrumento: 'BTP-28 (amortización parcial)', tipo: 'Amortización', monto: 38900 },
];

const DEVENGO = {
  labels: ['Jul 26','Ago','Sep','Oct','Nov','Dic','Ene 27','Feb','Mar','Abr','May','Jun'],
  base: [24800, 25100, 25300, 25600, 25900, 26400, 26600, 26900, 27300, 27600, 27900, 28300],
};

/* ---------- MODELOS ---------- */
const CALCE = [
  { tramo: '0 – 1 año',   activos: 512000, pasivos: 488000 },
  { tramo: '1 – 3 años',  activos: 894000, pasivos: 921000 },
  { tramo: '3 – 5 años',  activos: 1105000, pasivos: 1060000 },
  { tramo: '5 – 10 años', activos: 1892000, pasivos: 1975000 },
  { tramo: '10 – 20 años',activos: 1420000, pasivos: 1510000 },
  { tramo: '> 20 años',   activos: 610000, pasivos: 742000 },
];

const TSA = {
  fecha: '30-06-2026',
  resultado: 'Suficiente',
  margen: 412000, // MM CLP
  margenPct: 4.9,
  tasaDescuento: 3.18,
  escenarios: [
    { nombre: 'Base', margen: 412000, estado: 'ok' },
    { nombre: 'Tasas −100 pb', margen: 298000, estado: 'ok' },
    { nombre: 'Tasas −200 pb', margen: 148000, estado: 'ok' },
    { nombre: 'Estrés combinado CMF', margen: 61000, estado: 'warn' },
  ],
};

const CORRIDAS = [
  { modelo: 'Calce / ALM (NCG 461)', version: 'v2026.06', fecha: '30-06-2026', responsable: 'F. Riquelme', estado: 'Validada', duracion: '42 min' },
  { modelo: 'TSA — Test de Suficiencia de Activos', version: 'v2026.06', fecha: '30-06-2026', responsable: 'C. Undurraga', estado: 'Validada', duracion: '1 h 18 min' },
  { modelo: 'Valorización cartera (mark-to-market)', version: 'diaria', fecha: '02-07-2026', responsable: 'Proceso batch', estado: 'Validada', duracion: '11 min' },
  { modelo: 'Calce / ALM (NCG 461)', version: 'v2026.05', fecha: '31-05-2026', responsable: 'F. Riquelme', estado: 'Histórica', duracion: '40 min' },
  { modelo: 'TSA — Test de Suficiencia de Activos', version: 'v2026.05', fecha: '31-05-2026', responsable: 'C. Undurraga', estado: 'Histórica', duracion: '1 h 22 min' },
];

const SUPUESTOS = [
  { grupo: 'Curvas de descuento', detalle: 'Curva cero real (UF) y nominal RiskAmerica al cierre del mes; vector CMF para TSA.', fuente: 'Market data', actualizado: '30-06-2026' },
  { grupo: 'Tablas de mortalidad', detalle: 'RV-2020 hombres/mujeres con factores de mejoramiento CMF.', fuente: 'Actuarial', actualizado: '31-12-2025' },
  { grupo: 'Inflación (UF)', detalle: 'Proyección UF 3,0% anual convergiendo a 3,0% en 24 meses (consenso EEE Banco Central).', fuente: 'Estudios', actualizado: '15-06-2026' },
  { grupo: 'Prepago mutuos', detalle: 'CPR 7,5% anual, ajustado por vintage y tasa de originación.', fuente: 'Actuarial', actualizado: '31-03-2026' },
  { grupo: 'Tipo de cambio', detalle: 'USD/CLP spot al cierre; forwards para flujos proyectados en USD.', fuente: 'Market data', actualizado: '02-07-2026' },
];

/* ---------- CUMPLIMIENTO ---------- */
// uso = % del cupo utilizado · alerta ámbar ≥ 85, rojo ≥ 100
const LIMITES = [
  { id: 'L1', nombre: 'Renta variable total', norma: 'NCG 152 · Art. 21 N°1', tipo: 'Regulatorio CMF', limite: '≤ 40% del total', uso: 42.7, base: '17,1% de la cartera vs tope 40%', formula: 'Σ VM renta variable / Σ VM cartera representativa', posiciones: ['ETF-SPX','SQM-B','FFMM-GL','CHILE-ACC','COPEC'], hist: [39, 40, 41, 40, 42, 42.7] },
  { id: 'L2', nombre: 'Inversión en el extranjero', norma: 'NCG 152 · Art. 21 N°4', tipo: 'Regulatorio CMF', limite: '≤ 20% del total', uso: 71.5, base: '14,3% de la cartera vs tope 20%', formula: 'Σ VM activos extranjeros / Σ VM cartera', posiciones: ['UST-10Y','UST-30Y','JPM-31','AAPL-33','MSFT-35','PAN-32','ETF-SPX','FFMM-GL','ALT-PD'], hist: [64, 66, 68, 69, 70, 71.5] },
  { id: 'L3', nombre: 'Concentración por emisor — Enel Chile', norma: 'NCG 152 · Art. 23', tipo: 'Regulatorio CMF', limite: '≤ 5% por emisor', uso: 87.9, base: '4,4% en Enel Chile vs tope 5%', formula: 'Σ VM instrumentos del emisor / Σ VM cartera', posiciones: ['BENEL-K'], hist: [72, 76, 80, 83, 86, 87.9] },
  { id: 'L4', nombre: 'Instrumentos BBB o inferiores', norma: 'Política interna INV-02 §4.2', tipo: 'Política interna', limite: '≤ 3% del total', uso: 56.7, base: '1,7% vs tope 3%', formula: 'Σ VM instrumentos rating ≤ BBB+ / Σ VM cartera', posiciones: ['PAN-32'], hist: [51, 53, 52, 55, 56, 56.7] },
  { id: 'L5', nombre: 'Activos inmobiliarios', norma: 'NCG 152 · Art. 21 N°3', tipo: 'Regulatorio CMF', limite: '≤ 25% del total', uso: 66.9, base: '16,7% vs tope 25%', formula: 'Σ VM bienes raíces + fondos inmob. / Σ VM cartera', posiciones: ['INM-ISID','INM-FRI','INM-APOQ'], hist: [63, 64, 65, 66, 66, 66.9] },
  { id: 'L6', nombre: 'Descalce de moneda (USD sin cobertura)', norma: 'Política interna INV-08 §4', tipo: 'Política interna', limite: '≤ 8% del total', uso: 91.2, base: '7,3% vs tope 8%', formula: '(Activos USD − pasivos USD − forwards) / Σ VM cartera', posiciones: ['UST-10Y','UST-30Y','JPM-31','ETF-SPX','ALT-PD'], hist: [78, 81, 84, 87, 89, 91.2] },
  { id: 'L7', nombre: 'Mutuos hipotecarios endosables', norma: 'NCG 152 · Art. 21 N°2', tipo: 'Regulatorio CMF', limite: '≤ 30% del total', uso: 29.5, base: '8,9% vs tope 30%', formula: 'Σ VM mutuos hipotecarios / Σ VM cartera', posiciones: ['MH-CART'], hist: [30, 30, 29, 29, 29, 29.5] },
  { id: 'L8', nombre: 'Concentración grupo empresarial — Falabella', norma: 'NCG 152 · Art. 24', tipo: 'Regulatorio CMF', limite: '≤ 10% por grupo', uso: 22.8, base: '2,3% vs tope 10%', formula: 'Σ VM instrumentos del grupo / Σ VM cartera', posiciones: ['BFALA-R'], hist: [24, 23, 23, 22, 23, 22.8] },
  { id: 'L9', nombre: 'Activos representativos de reservas técnicas', norma: 'DFL 251 · Art. 21', tipo: 'Regulatorio CMF', limite: '≥ 100% de reservas', uso: 96.4, base: 'Cobertura 103,7% (uso del margen de holgura)', formula: 'Σ VM activos representativos / reservas técnicas + patrimonio de riesgo', posiciones: [], hist: [95, 95, 96, 96, 96, 96.4], invertido: true },
  { id: 'L10', nombre: 'Instrumentos de un mismo banco (DAP)', norma: 'Política interna INV-02 §4.4', tipo: 'Política interna', limite: '≤ 4% por banco', uso: 48.0, base: '1,9% en BCI vs tope 4%', formula: 'Σ DAP + bonos del banco / Σ VM cartera', posiciones: ['DAP-CLP'], hist: [45, 50, 47, 46, 49, 48.0] },
  { id: 'L11', nombre: 'Renta variable nacional', norma: 'NCG 152 · Art. 21 N°1 letra b', tipo: 'Regulatorio CMF', limite: '≤ 15% del total', uso: 41.7, base: '6,3% vs tope 15%', formula: 'Σ VM acciones locales / Σ VM cartera', posiciones: ['SQM-B','CHILE-ACC','COPEC'], hist: [40, 41, 42, 41, 41, 41.7] },
  { id: 'L12', nombre: 'Activos alternativos', norma: 'Política interna INV-01 §3', tipo: 'Política interna', limite: '≤ 7% del total', uso: 79.4, base: '5,6% vs tope 7%', formula: 'Σ VM fondos alternativos / Σ VM cartera', posiciones: ['ALT-INFRA','ALT-PD'], hist: [70, 73, 75, 76, 78, 79.4] },
];

const HIST_CUMPLIMIENTO = [
  { fecha: '18-03-2026', limite: 'Descalce de moneda (USD sin cobertura)', evento: 'Exceso transitorio (100,8%)', resolucion: 'Regularizado el 24-03-2026 vía forwards USD/CLP', dias: 6, estado: 'Regularizado' },
  { fecha: '02-12-2025', limite: 'Concentración por emisor — Enel Chile', evento: 'Alerta ámbar (≥ 85%)', resolucion: 'Plan de no incremento aprobado por Comité de Inversiones', dias: null, estado: 'En seguimiento' },
  { fecha: '15-09-2025', limite: 'Renta variable total', evento: 'Alerta ámbar (≥ 85%)', resolucion: 'Regularizado por rebalanceo (venta parcial ETF)', dias: 12, estado: 'Regularizado' },
];

/* ---------- POLÍTICAS ----------
   La gobernanza de inversiones no es un documento único: es un cuerpo de
   políticas, cada una con su dueño, su comité aprobador y su propio
   versionado. Cada política enlaza a los límites de Cumplimiento y al
   módulo operativo que gobierna. */
const POLITICAS = [
  {
    id: 'POL-01',
    codigo: 'INV-01',
    titulo: 'Política General de Inversiones',
    area: 'Gerencia de Inversiones',
    resumen: 'Marco de asignación estratégica, elegibilidad de instrumentos y límites de diversificación de la cartera de reservas técnicas y patrimonio.',
    version: 'v4.2',
    vigencia: '01-04-2026',
    aprobadaPor: 'Directorio MetLife Chile — Sesión N° 412',
    proximaRevision: '01-04-2027',
    estado: 'Vigente',
    objetivo: 'Establecer el marco de inversión de las reservas técnicas y patrimonio de MetLife Chile, asegurando la diversificación por clase de activo, emisor y moneda, el cumplimiento del marco regulatorio CMF (DFL 251 y NCG 152) y la generación de retornos consistentes con el apetito de riesgo aprobado por el Directorio.',
    principios: [
      'Prioridad de instrumentos elegibles como representativos de reservas técnicas.',
      'Diversificación por clase de activo, emisor, grupo empresarial y moneda.',
      'Las inversiones alternativas e inmobiliarias requieren aprobación previa del Comité de Inversiones.',
      'Toda excepción a un límite requiere aprobación del Comité de Inversiones y registro en acta.',
    ],
    modulos: [{ modulo: 'cartera', tab: 'Composición', label: 'Cartera' }, { modulo: 'cumplimiento', tab: 'Semáforo de límites', label: 'Cumplimiento' }],
    limites: [{ limiteId: 'L1' }, { limiteId: 'L2' }, { limiteId: 'L5' }, { limiteId: 'L7' }, { limiteId: 'L9' }, { limiteId: 'L11' }, { limiteId: 'L12' }],
    versiones: [
      { version: 'v4.2', vigencia: '01-04-2026', estado: 'Vigente', cambios: 'Actualiza el marco de diversificación tras la revisión anual del apetito de riesgo corporativo.' },
      { version: 'v4.1', vigencia: '01-10-2025', estado: 'Histórica', cambios: 'Ajuste de referencias cruzadas a la nueva Política de Uso de Derivados (POL-03).' },
      { version: 'v4.0', vigencia: '01-04-2025', estado: 'Histórica', cambios: 'Reescritura integral alineada al nuevo apetito de riesgo corporativo regional; incorporación de benchmark compuesto.' },
      { version: 'v3.6', vigencia: '01-04-2024', estado: 'Histórica', cambios: 'Última revisión del marco anterior.' },
    ],
  },
  {
    id: 'POL-02',
    codigo: 'INV-02',
    titulo: 'Política de Riesgo de Crédito y Contraparte',
    area: 'Riesgo',
    resumen: 'Límites de clasificación de riesgo, concentración por emisor/grupo empresarial y criterios de elegibilidad de contrapartes financieras.',
    version: 'v2.3',
    vigencia: '01-04-2026',
    aprobadaPor: 'Comité de Riesgo — Sesión N° 118',
    proximaRevision: '01-04-2027',
    estado: 'Vigente',
    objetivo: 'Acotar la exposición a deterioro crediticio de emisores e instituciones financieras contraparte, estableciendo límites de concentración por emisor, grupo empresarial y clasificación de riesgo, y los criterios mínimos de elegibilidad de contrapartes para operaciones de tesorería y derivados.',
    principios: [
      'Toda contraparte de derivados requiere rating mínimo A- y acuerdo ISDA/CSA vigente.',
      'La concentración por emisor y por grupo empresarial se mide sobre el total de la cartera, incluyendo derivados.',
      'Los instrumentos bajo BBB+ requieren aprobación expresa del Comité de Riesgo.',
      'Revisión trimestral de la lista de contrapartes elegibles junto con Tesorería.',
    ],
    modulos: [{ modulo: 'cumplimiento', tab: 'Semáforo de límites', label: 'Cumplimiento' }, { modulo: 'derivados', tab: 'Contrapartes y CSA', label: 'Derivados & Colateral' }],
    limites: [{ limiteId: 'L3' }, { limiteId: 'L4' }, { limiteId: 'L8' }, { limiteId: 'L10' }],
    versiones: [
      { version: 'v2.3', vigencia: '01-04-2026', estado: 'Vigente', cambios: 'Incorpora el requisito de rating mínimo A- para nuevas contrapartes de derivados.' },
      { version: 'v2.2', vigencia: '15-07-2025', estado: 'Histórica', cambios: 'Reduce el límite interno de instrumentos BBB o inferiores de 4% a 3%.' },
      { version: 'v2.1', vigencia: '01-01-2025', estado: 'Histórica', cambios: 'Incorpora el límite de concentración por instrumentos de un mismo banco (DAP).' },
    ],
  },
  {
    id: 'POL-03',
    codigo: 'INV-08',
    titulo: 'Política de Uso de Derivados y Cobertura',
    area: 'Tesorería',
    resumen: 'Instrumentos derivados autorizados, propósitos permitidos, límites de nocional y gestión de colateral bajo acuerdos CSA.',
    version: 'v1.4',
    vigencia: '05-05-2026',
    aprobadaPor: 'Comité de Riesgo Financiero — Sesión N° 44',
    proximaRevision: '05-05-2027',
    estado: 'Vigente',
    objetivo: 'Regular el uso de instrumentos derivados (cross-currency swaps, interest rate swaps, swaps de inflación y forwards de moneda) exclusivamente con fines de cobertura de calce y de moneda, definiendo los límites de nocional por contraparte, el buffer mínimo de colateral elegible frente a escenarios de estrés y las condiciones de los acuerdos CSA.',
    principios: [
      'Los derivados solo se autorizan con fines de cobertura (calce, moneda o duración); no se autoriza trading especulativo.',
      'El colateral elegible disponible debe cubrir el llamado de margen proyectado bajo el escenario combinado severo con un buffer mínimo de 1,5x.',
      'Todo CSA nuevo requiere threshold y MTA aprobados por el Comité de Riesgo Financiero.',
      'El descalce de moneda USD sin cobertura, neto de derivados, no puede superar el 8% de la cartera.',
    ],
    modulos: [{ modulo: 'derivados', tab: 'Posiciones', label: 'Derivados & Colateral' }, { modulo: 'derivados', tab: 'Estrés y colaterales', label: 'Estrés y colaterales' }],
    limites: [{ limiteId: 'L6' }, { nombre: 'Buffer de colateral bajo escenario combinado severo', tope: '≥ 1,5x el llamado proyectado', modulo: 'derivados', tab: 'Estrés y colaterales' }],
    versiones: [
      { version: 'v1.4', vigencia: '05-05-2026', estado: 'Vigente', cambios: 'Sube el buffer mínimo de colateral de 1,2x a 1,5x tras el ejercicio de estrés combinado de marzo 2026.' },
      { version: 'v1.3', vigencia: '01-11-2025', estado: 'Histórica', cambios: 'Incorpora swaps de inflación como instrumento autorizado para calce de reajustabilidad.' },
      { version: 'v1.2', vigencia: '01-04-2025', estado: 'Histórica', cambios: 'Primera versión que define el buffer mínimo de colateral (1,2x).' },
    ],
  },
  {
    id: 'POL-04',
    codigo: 'INV-09',
    titulo: 'Política de Gestión de Liquidez',
    area: 'Tesorería',
    resumen: 'Clasificación de activos líquidos con sus haircuts, cobertura mínima frente a salidas estresadas y ejercicios de estrés obligatorios.',
    version: 'v1.1',
    vigencia: '01-01-2026',
    aprobadaPor: 'Comité de Riesgo Financiero — Sesión N° 41',
    proximaRevision: '01-01-2027',
    estado: 'Vigente',
    objetivo: 'Asegurar que la compañía mantenga activos líquidos suficientes para cubrir sus obligaciones de corto y mediano plazo, incluso bajo escenarios de estrés combinado (rescates acelerados, estrés de mercado y llamados de margen), estableciendo los haircuts por tipo de activo y la cobertura mínima exigida.',
    principios: [
      'La cobertura de liquidez a 12 meses bajo el escenario combinado severo no puede ser inferior a 1,2x.',
      'Los haircuts se revisan semestralmente en conjunto con Riesgo de Mercado.',
      'El ejercicio de estrés de liquidez se corre mensualmente y se reporta al Comité de Riesgo Financiero.',
      'Los activos alternativos e inmobiliarios no computan como líquidos para efectos de este cálculo.',
    ],
    modulos: [{ modulo: 'liquidez', tab: 'Posición de liquidez', label: 'Liquidez' }, { modulo: 'liquidez', tab: 'Estrés de liquidez', label: 'Estrés de liquidez' }],
    limites: [{ nombre: 'Cobertura de liquidez 12M bajo estrés combinado', tope: '≥ 1,2x', modulo: 'liquidez', tab: 'Estrés de liquidez' }],
    versiones: [
      { version: 'v1.1', vigencia: '01-01-2026', estado: 'Vigente', cambios: 'Incorpora el escenario de rescates acelerados x3 en pólizas con Cuenta Única de Inversión (CUI).' },
      { version: 'v1.0', vigencia: '01-04-2025', estado: 'Histórica', cambios: 'Primera versión de la política, previamente los criterios de liquidez formaban parte de la Política General.' },
    ],
  },
  {
    id: 'POL-05',
    codigo: 'INV-05',
    titulo: 'Política de Calce de Activos y Pasivos (ALM)',
    area: 'Actuarial',
    resumen: 'Metodología de calce por tramo de plazo, índice de calce mínimo exigido y periodicidad del Test de Suficiencia de Activos.',
    version: 'v3.0',
    vigencia: '01-01-2026',
    aprobadaPor: 'Comité de Inversiones — Sesión N° 87',
    proximaRevision: '01-01-2027',
    estado: 'Vigente',
    objetivo: 'Definir la metodología de calce de activos y pasivos por tramo de plazo conforme a la NCG 461 de la CMF, el índice de calce mínimo exigido por tramo, y la periodicidad y gobernanza del Test de Suficiencia de Activos (TSA).',
    principios: [
      'El índice de calce por tramo (activos / pasivos descontados) no puede ser inferior a 90%, considerando el efecto de los derivados de cobertura.',
      'La corrida de calce y TSA se ejecuta mensualmente con curvas y supuestos documentados.',
      'Todo déficit de calce por tramo se reporta al Comité de Inversiones con plan de regularización.',
      'Los supuestos actuariales (mortalidad, prepago, inflación) se revisan al menos una vez al año.',
    ],
    modulos: [{ modulo: 'modelos', tab: 'Calce / ALM', label: 'Modelos' }, { modulo: 'modelos', tab: 'TSA', label: 'TSA' }, { modulo: 'derivados', tab: 'Calce con derivados', label: 'Calce con derivados' }],
    limites: [{ nombre: 'Índice de calce mínimo por tramo (NCG 461)', tope: '≥ 90%', modulo: 'modelos', tab: 'Calce / ALM' }],
    versiones: [
      { version: 'v3.0', vigencia: '01-01-2026', estado: 'Vigente', cambios: 'Incorpora el efecto de los derivados de cobertura en el cálculo del índice de calce por tramo.' },
      { version: 'v2.1', vigencia: '01-07-2024', estado: 'Histórica', cambios: 'Actualiza la tabla de mortalidad utilizada en el TSA a RV-2020.' },
      { version: 'v2.0', vigencia: '01-01-2023', estado: 'Histórica', cambios: 'Alineación con la entrada en vigencia de la NCG 461.' },
    ],
  },
  {
    id: 'POL-06',
    codigo: 'INV-10',
    titulo: 'Política de Pricing y Tarificación de Rentas Vitalicias',
    area: 'Actuarial · Comercial',
    resumen: 'Margen técnico mínimo exigido, gobernanza de la tasa de venta diaria y uso de la información de competencia SCOMP.',
    version: 'v1.2',
    vigencia: '01-02-2026',
    aprobadaPor: 'Comité de Pricing — Sesión N° 29',
    proximaRevision: '01-02-2027',
    estado: 'Vigente',
    objetivo: 'Establecer el margen técnico mínimo exigido para la venta de rentas vitalicias, la gobernanza para la definición diaria de la tasa de venta por producto (curva de reinversión candidata, supuestos actuariales y referencia de mercado SCOMP), y las instancias de aprobación ante desviaciones del margen objetivo.',
    principios: [
      'El margen técnico mínimo exigido por producto es de 15 puntos base sobre la tasa de reinversión candidata.',
      'La tasa de venta diaria es propuesta por Actuarial y validada por el Gerente de Inversiones antes de su publicación.',
      'La posición relativa en SCOMP es informativa para la mesa comercial, pero no puede gatillar una tasa de venta bajo el margen mínimo sin aprobación del Comité de Pricing.',
      'Sensibilidades de margen (curva, mortalidad, gastos) se recalculan mensualmente.',
    ],
    modulos: [{ modulo: 'rrvv', tab: 'Pricing del día', label: 'Rentas Vitalicias' }, { modulo: 'rrvv', tab: 'Sensibilidades', label: 'Sensibilidades' }],
    limites: [{ nombre: 'Margen técnico mínimo por producto', tope: '≥ 15 pb', modulo: 'rrvv', tab: 'Pricing del día' }],
    versiones: [
      { version: 'v1.2', vigencia: '01-02-2026', estado: 'Vigente', cambios: 'Formaliza la validación diaria del Gerente de Inversiones antes de publicar la tasa de venta.' },
      { version: 'v1.1', vigencia: '01-08-2025', estado: 'Histórica', cambios: 'Incorpora el uso de SCOMP como referencia informativa de mercado.' },
      { version: 'v1.0', vigencia: '01-02-2025', estado: 'Histórica', cambios: 'Primera versión de la política, previamente el margen mínimo se definía por acta de comité sin documento formal.' },
    ],
  },
  {
    id: 'POL-07',
    codigo: 'INV-11',
    titulo: 'Política de Gestión Activa y Relative Value',
    area: 'Mesa de Inversiones',
    resumen: 'Mandato de gestión activa, tracking error máximo permitido y proceso de aprobación de ideas de relative value y propuestas de optimización.',
    version: 'v1.0',
    vigencia: '01-04-2025',
    aprobadaPor: 'Comité de Inversiones — Sesión N° 79',
    proximaRevision: '01-04-2027',
    estado: 'Vigente',
    objetivo: 'Definir el mandato de gestión activa de la cartera respecto de su benchmark, el tracking error máximo permitido, y el proceso de registro y aprobación de ideas de relative value y de las propuestas de reasignación generadas por el ejercicio de optimización de portafolio.',
    principios: [
      'El tracking error de la cartera respecto de su benchmark no debe superar 75 pb anualizado.',
      'Toda idea de relative value se registra en la watchlist con tesis, responsable y fecha antes de ejecutarse.',
      'Las propuestas de optimización se presentan al Comité de Inversiones con sus restricciones activas explicitadas.',
      'Ninguna reasignación puede vulnerar los límites de la Política General de Inversiones ni de Riesgo de Crédito.',
    ],
    modulos: [{ modulo: 'relval', tab: 'Ideas y watchlist', label: 'Relative Value' }, { modulo: 'optimizacion', tab: 'Restricciones', label: 'Optimización' }],
    limites: [{ nombre: 'Tracking error máximo vs. benchmark', tope: '≤ 75 pb anualizado', modulo: 'resultados', tab: 'vs. Benchmark' }],
    versiones: [
      { version: 'v1.0', vigencia: '01-04-2025', estado: 'Vigente', cambios: 'Primera versión de la política, creada junto con la formalización de la mesa de Relative Value.' },
    ],
  },
];

/* ---------- PROCEDIMIENTOS ---------- */
const PROCEDIMIENTOS = [
  { id: 'PR-INV-01', nombre: 'Valorización diaria de cartera', area: 'Inversiones', dueno: 'M. Contreras', vigencia: '01-02-2026', revision: '01-02-2027', estado: 'Vigente' },
  { id: 'PR-INV-02', nombre: 'Conciliación con custodio y contabilidad', area: 'Operaciones', dueno: 'P. Salazar', vigencia: '15-03-2026', revision: '15-03-2027', estado: 'Vigente' },
  { id: 'PR-INV-03', nombre: 'Monitoreo de límites regulatorios CMF', area: 'Riesgo', dueno: 'A. Fuenzalida', vigencia: '01-04-2026', revision: '01-04-2027', estado: 'Vigente' },
  { id: 'PR-INV-04', nombre: 'Aprobación de nuevas contrapartes', area: 'Inversiones', dueno: 'J. Errázuriz', vigencia: '10-11-2025', revision: '10-11-2026', estado: 'Vigente' },
  { id: 'PR-INV-05', nombre: 'Corrida mensual de calce (NCG 461) y TSA', area: 'Actuarial', dueno: 'C. Undurraga', vigencia: '01-01-2026', revision: '01-01-2027', estado: 'Vigente' },
  { id: 'PR-INV-06', nombre: 'Gestión de excesos y regularización de límites', area: 'Riesgo', dueno: 'A. Fuenzalida', vigencia: '01-04-2026', revision: '01-04-2027', estado: 'Vigente' },
  { id: 'PR-INV-07', nombre: 'Reporting regulatorio CMF (archivos periódicos)', area: 'Contabilidad', dueno: 'R. Espinoza', vigencia: '20-08-2025', revision: '20-08-2026', estado: 'Revisión próxima' },
  { id: 'PR-INV-08', nombre: 'Operación y cobertura de derivados de moneda', area: 'Inversiones', dueno: 'M. Contreras', vigencia: '05-05-2026', revision: '05-05-2027', estado: 'Vigente' },
];

/* ---------- FAQ ---------- */
const FAQ = [
  { cat: 'Datos y fuentes', qas: [
    { q: '¿Con qué frecuencia se actualizan los datos del portal?', a: 'Las posiciones y precios se cargan en batch diario desde el custodio y el proveedor de market data (corte 08:30). La valorización contable se actualiza con el cierre diario de SAP y los modelos ALM/TSA con corte mensual. La fecha y hora de corte de cada fuente es visible en el indicador de conciliación de la barra superior.' },
    { q: '¿Qué significa el indicador "Conciliado" de la barra superior?', a: 'Indica que las posiciones de la fecha de corte visible fueron validadas contra el custodio y la contabilidad de inversiones sin diferencias sobre el umbral de tolerancia (0,01%). Si existe una diferencia en investigación, el indicador cambia a "Conciliación pendiente".' },
    { q: '¿De dónde proviene cada cifra que veo?', a: 'Cada tabla y KPI indica su sistema fuente (custodio, market data, contabilidad, actuarial). El linaje completo del dato está documentado en el procedimiento PR-INV-02.' },
  ]},
  { cat: 'Metodología', qas: [
    { q: '¿Cómo se calculan los retornos de la cartera?', a: 'Retorno ponderado por tiempo (TWR) con valorización diaria, neto de comisiones de fondos y bruto de gastos internos. El benchmark compuesto se rebalancea mensualmente según la asignación estratégica de la política vigente.' },
    { q: '¿Cómo se convierten los montos entre CLP, UF y USD?', a: 'Con la UF y el tipo de cambio observado de la fecha de corte seleccionada. Al cambiar la moneda de presentación en la barra superior, todos los módulos se recalculan con esos factores; los valores de origen no se alteran.' },
    { q: '¿Qué es el tracking error que aparece en Resultados?', a: 'La desviación estándar anualizada de las diferencias de retorno diario entre la cartera y su benchmark, medida sobre una ventana móvil de 12 meses.' },
  ]},
  { cat: 'Cumplimiento y límites', qas: [
    { q: '¿Qué significa el semáforo de límites?', a: 'Verde: uso del cupo bajo 85%. Ámbar: uso entre 85% y 100% (alerta preventiva, requiere plan de acción). Rojo: exceso sobre el límite, activa el procedimiento PR-INV-06 de regularización y reporte al Comité de Inversiones.' },
    { q: '¿Los límites del portal reemplazan el reporte regulatorio a la CMF?', a: 'No. El portal es una herramienta de monitoreo interno. Los archivos regulatorios oficiales se generan según el procedimiento PR-INV-07 y son responsabilidad de Contabilidad de Inversiones.' },
  ]},
  { cat: 'Acceso y roles', qas: [
    { q: '¿Quién puede acceder al portal?', a: 'El acceso es vía SSO corporativo MetLife. Los roles disponibles en el MVP son Ejecutivo (vista sintética), Analista (profundidad completa) y Administrador. Solicitudes de acceso vía mesa de ayuda TI con aprobación del Gerente de Inversiones.' },
    { q: '¿Puedo exportar la información?', a: 'Sí. Toda exportación respeta los filtros, agrupaciones y contexto activos (cartera, fecha de corte, moneda) e incluye la fecha de corte en el archivo. Las descargas quedan registradas en la bitácora de auditoría.' },
  ]},
];

/* ============================================================
   FASE 1.5 — Analítica de mesa y ALM avanzado
   ============================================================ */

/* ---------- DERIVADOS & COLATERAL ---------- */
// nocional y mtm en MM CLP equivalente
const DERIVADOS = [
  { id: 'CCS-001', tipo: 'Cross-Currency Swap', detalle: 'USD 4,30% → UF 2,95%', contraparte: 'J.P. Morgan', nocional: 145000, mtm: 4820, vencimiento: '15-03-2031', proposito: 'Calce de moneda' },
  { id: 'CCS-002', tipo: 'Cross-Currency Swap', detalle: 'USD 4,55% → UF 3,10%', contraparte: 'Goldman Sachs', nocional: 120000, mtm: -2140, vencimiento: '20-09-2029', proposito: 'Calce de moneda' },
  { id: 'CCS-003', tipo: 'Cross-Currency Swap', detalle: 'USD 4,10% → UF 2,88%', contraparte: 'Santander-Chile', nocional: 98000, mtm: 1230, vencimiento: '10-06-2033', proposito: 'Calce de moneda' },
  { id: 'IRS-007', tipo: 'Interest Rate Swap', detalle: 'CLP fijo 5,45% → cámara', contraparte: 'Scotiabank Chile', nocional: 60000, mtm: 890, vencimiento: '05-04-2028', proposito: 'Gestión de duración' },
  { id: 'SWP-UF-02', tipo: 'Swap de inflación', detalle: 'CLP → UF + 2,98%', contraparte: 'BCI', nocional: 52000, mtm: -350, vencimiento: '18-11-2030', proposito: 'Calce de reajustabilidad' },
  { id: 'FWD-014', tipo: 'Forward USD/CLP', detalle: 'Venta USD a 948,20', contraparte: 'BancoEstado', nocional: 45000, mtm: -680, vencimiento: '12-08-2026', proposito: 'Cobertura táctica' },
  { id: 'FWD-015', tipo: 'Forward USD/CLP', detalle: 'Venta USD a 951,10', contraparte: 'Itaú Chile', nocional: 38000, mtm: 410, vencimiento: '25-09-2026', proposito: 'Cobertura táctica' },
];

// índice de calce por tramo, sin y con derivados (%)
const CALCE_DERIV = [
  { tramo: '0 – 1 año', sin: 104.9, con: 104.9 },
  { tramo: '1 – 3 años', sin: 97.1, con: 98.6 },
  { tramo: '3 – 5 años', sin: 104.2, con: 104.2 },
  { tramo: '5 – 10 años', sin: 95.8, con: 99.1 },
  { tramo: '10 – 20 años', sin: 94.0, con: 97.8 },
  { tramo: '> 20 años', sin: 82.2, con: 86.4 },
];
const DESCALCE_USD = { sin: 14.3, con: 7.3, limite: 8.0 }; // % de la cartera

// estrés MTM → colateral. montos MM CLP
const ESTRES_DERIV = [
  { escenario: 'CLP deprecia 10%', supuesto: 'TC 1.028 · resto constante', dMtm: -18400, llamado: 16200 },
  { escenario: 'CLP aprecia 10%', supuesto: 'TC 841 · resto constante', dMtm: 17900, llamado: 0 },
  { escenario: 'Tasas CLP +100 pb', supuesto: 'paralelo curva cámara', dMtm: -6800, llamado: 5400 },
  { escenario: 'Tasas USD +100 pb', supuesto: 'paralelo curva SOFR', dMtm: 5200, llamado: 0 },
  { escenario: 'Combinado severo', supuesto: 'TC +10% y tasas CLP +100 pb', dMtm: -24100, llamado: 21800 },
];
const COLATERAL = {
  disponible: 68400,          // caja + soberanos elegibles post-haircut, MM CLP
  entregado: 3850,
  recibido: 6120,
  bufferMinimo: 1.5,          // política: disponible / llamado combinado severo ≥ 1,5x
};

const CSA = [
  { contraparte: 'J.P. Morgan', rating: 'A-', mtmNeto: 4820, entregado: 0, recibido: 4600, threshold: 0, mta: 250 },
  { contraparte: 'Goldman Sachs', rating: 'BBB+', mtmNeto: -2140, entregado: 1900, recibido: 0, threshold: 0, mta: 250 },
  { contraparte: 'Santander-Chile', rating: 'AAA', mtmNeto: 1230, entregado: 0, recibido: 1050, threshold: 500, mta: 100 },
  { contraparte: 'Scotiabank Chile', rating: 'AAA', mtmNeto: 890, entregado: 0, recibido: 470, threshold: 500, mta: 100 },
  { contraparte: 'BCI', rating: 'AAA', mtmNeto: -350, entregado: 280, recibido: 0, threshold: 300, mta: 100 },
  { contraparte: 'BancoEstado', rating: 'AAA', mtmNeto: -680, entregado: 620, recibido: 0, threshold: 300, mta: 100 },
  { contraparte: 'Itaú Chile', rating: 'AA', mtmNeto: 410, entregado: 0, recibido: 0, threshold: 800, mta: 150 },
];

/* ---------- LIQUIDEZ ---------- */
const LIQUIDEZ_BUCKETS = [
  { bucket: 'Caja y DAP < 30 días', valor: 169900, haircut: 0 },
  { bucket: 'Soberanos locales (BTU/BTP/BCP)', valor: 2366550, haircut: 5 },
  { bucket: 'Soberanos internacionales (UST)', valor: 571600, haircut: 8 },
  { bucket: 'Bancarios y corporativos ≥ AA', valor: 921500, haircut: 15 },
  { bucket: 'Acciones y ETF líquidos', valor: 682500, haircut: 25 },
  { bucket: 'Resto (fondos, inmobiliario, MHE)', valor: 1208800, haircut: null }, // no computa como líquido
];
const LIQ_SALIDAS_30D = 118000; // salidas proyectadas 30 días escenario base, MM CLP

// salidas acumuladas 12 meses y activos líquidos disponibles bajo cada escenario (MM CLP)
const LIQ_ESTRES = [
  { escenario: 'Base (BAU)', supuesto: 'Pensiones y rescates según proyección actuarial · haircuts normales', salidas: 962000, liquidos: 4239000 },
  { escenario: 'Rescates acelerados', supuesto: 'Rescates de pólizas CUI x3 durante 12 meses · pensiones normales', salidas: 1418000, liquidos: 4239000 },
  { escenario: 'Estrés de mercado', supuesto: 'Llamados de margen del combinado severo + haircuts x2', salidas: 1610000, liquidos: 3561000 },
  { escenario: 'Combinado severo', supuesto: 'Rescates x3 + colateral severo + mercado corporativo cerrado (solo caja y soberanos)', salidas: 1905000, liquidos: 2418000 },
];
const LIQ_COBERTURA_MIN = 1.2; // veces, política interna (líquidos / salidas 12M estresadas)

const FUENTES_USOS = {
  labels: ['Jul 26', 'Ago 26', 'Sep 26'],
  entradas: [
    { name: 'Cupones y vencimientos', color: '#007ABC', values: [43600, 26600, 70400] },
    { name: 'Primas RRVV', color: '#0090DA', values: [37400, 35800, 36900] },
  ],
  salidas: [
    { name: 'Pensiones', color: '#1E4C76', values: [61200, 61500, 61800] },
    { name: 'Rescates y gastos', color: '#5B7F95', values: [18400, 17900, 18800] },
  ],
};

/* ---------- RENTAS VITALICIAS ---------- */
const RRVV_PRICING = {
  actualizado: '02-07-2026 09:10',
  curvaReinversion: 3.61,      // TIR de reinversión de la cartera candidata (UF)
  margenObjetivo: 15,          // pb mínimo por política
  productos: [
    { producto: 'RV Inmediata', tasaVenta: 3.42, scomp: 3.36, durPasivo: 11.2, margen: 19, ventasMes: 18400 },
    { producto: 'RV Diferida', tasaVenta: 3.55, scomp: 3.49, durPasivo: 14.8, margen: 22, ventasMes: 6200 },
    { producto: 'RV Garantizada 120 meses', tasaVenta: 3.31, scomp: 3.28, durPasivo: 10.1, margen: 15, ventasMes: 9800 },
    { producto: 'RV con Crecimiento 2%', tasaVenta: 3.18, scomp: 3.15, durPasivo: 12.6, margen: 12, ventasMes: 3100 },
  ],
};

const SCOMP_COMP = [
  { cia: 'Consorcio', tasa: 3.45, ranking: 1, winRate: 27.8 },
  { cia: 'MetLife', tasa: 3.42, ranking: 2, winRate: 24.1 },
  { cia: 'Confuturo', tasa: 3.39, ranking: 3, winRate: 18.5 },
  { cia: 'Penta Vida', tasa: 3.37, ranking: 4, winRate: 13.2 },
  { cia: 'Bice Vida', tasa: 3.33, ranking: 5, winRate: 10.6 },
  { cia: 'Principal', tasa: 3.30, ranking: 6, winRate: 5.8 },
];

const RRVV_SENSIBILIDAD = [
  { variable: 'Curva de reinversión −50 pb', impacto: -38, comentario: 'Margen cae bajo objetivo en RV Inmediata y Crecimiento 2%' },
  { variable: 'Curva de reinversión +50 pb', impacto: 36, comentario: 'Holgura para mejorar tasa de venta y ranking SCOMP' },
  { variable: 'Mejora de mortalidad +5% (longevidad)', impacto: -12, comentario: 'Sensibilidad concentrada en RV Diferida' },
  { variable: 'Gastos de administración +10%', impacto: -4, comentario: 'Impacto acotado, revisar en presupuesto anual' },
  { variable: 'Spread de reinversión corporativa −20 pb', impacto: -9, comentario: 'Depende del pipeline de colocaciones locales' },
];

const RRVV_HIST = {
  labels: ['Jul 25', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene 26', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  prima: [31200, 29800, 33400, 35100, 32600, 38900, 30400, 31800, 36200, 34700, 35900, 37500],
  tasaVenta: [3.30, 3.32, 3.35, 3.38, 3.36, 3.39, 3.40, 3.38, 3.41, 3.43, 3.42, 3.42],
  tasaScomp: [3.28, 3.29, 3.31, 3.35, 3.34, 3.36, 3.37, 3.36, 3.38, 3.39, 3.37, 3.36],
};

/* ---------- RELATIVE VALUE ---------- */
// spreads en pb
const RELVAL_SCREENER = [
  { eje: 'Soberano UF 10Y vs. UST 10Y (hedged)', actual: 82, prom12m: 64, z: 1.4, senal: 'Barato' },
  { eje: 'Corporativo AA UF 5Y vs. soberano UF', actual: 118, prom12m: 131, z: -0.8, senal: 'Caro' },
  { eje: 'Bancario AAA UF vs. corporativo AA UF', actual: -22, prom12m: -14, z: -1.1, senal: 'Caro' },
  { eje: 'MHE vs. letras hipotecarias', actual: 96, prom12m: 88, z: 0.6, senal: 'Neutral' },
  { eje: 'IG USD 10Y (hedged) vs. corporativo UF', actual: 41, prom12m: 22, z: 1.7, senal: 'Barato' },
  { eje: 'BTP nominal 10Y vs. BTU UF 10Y (breakeven)', actual: 298, prom12m: 305, z: -0.3, senal: 'Neutral' },
  { eje: 'LatAm soberano BBB vs. IG USD', actual: 148, prom12m: 172, z: -0.9, senal: 'Caro' },
];

const RELVAL_PARES = [
  { par: 'BTU-30 vs. UST 2034 (hedged)', z: 1.4, hist: [58, 62, 60, 66, 71, 68, 74, 77, 73, 79, 80, 82] },
  { par: 'Enel Chile K vs. Colbún J', z: 0.9, hist: [12, 10, 14, 13, 15, 17, 16, 18, 17, 19, 18, 20] },
  { par: 'Banco de Chile AF vs. Santander T2', z: -0.4, hist: [8, 9, 7, 8, 6, 7, 6, 5, 6, 5, 6, 5] },
  { par: 'Apple 2033 vs. Microsoft 2035', z: 0.2, hist: [-4, -3, -5, -2, -3, -1, -2, -3, -2, -1, -2, -1] },
];

const RELVAL_IDEAS = [
  { titulo: 'Rotar UST 10Y → soberano UF 10Y', tesis: 'Spread UF–UST hedged en máximos de 12M (z 1,4). La rotación además mejora el calce del tramo 5–10 años y reduce el descalce USD.', estado: 'Propuesta', owner: 'Mesa RF', fecha: '28-06-2026' },
  { titulo: 'Reducir bancario AAA caro vs. corporativo AA', tesis: 'Compresión histórica del spread bancario (z −1,1). Vender Serie AF, comprar Metro M manteniendo duración.', estado: 'En análisis', owner: 'Mesa RF', fecha: '30-06-2026' },
  { titulo: 'Aumentar MHE vintage 2026', tesis: 'Originación nueva con tasas 40 pb sobre el stock y mejores LTV. Cupo disponible en límite NCG 152 (uso 29,5%).', estado: 'Ejecutada parcial', owner: 'Alternativos', fecha: '15-06-2026' },
  { titulo: 'Tomar IG USD hedged vs. corporativo UF', tesis: 'Carry positivo post-cobertura (z 1,7). Requiere cupo de descalce USD — hoy en ámbar (91,2%): condicionada a nuevos CCS.', estado: 'En análisis', owner: 'Mesa Internacional', fecha: '01-07-2026' },
];

/* ---------- OPTIMIZACIÓN ---------- */
const OPT = {
  corrida: 'v2026.06 · 25-06-2026',
  responsable: 'Estudios / F. Riquelme',
  actual: { ret: 5.92, vol: 3.84 },
  propuesto: { ret: 6.18, vol: 3.62 },
  frontera: [
    { vol: 2.10, ret: 4.35 }, { vol: 2.45, ret: 4.85 }, { vol: 2.90, ret: 5.35 },
    { vol: 3.30, ret: 5.80 }, { vol: 3.62, ret: 6.18 }, { vol: 4.10, ret: 6.52 },
    { vol: 4.70, ret: 6.85 }, { vol: 5.40, ret: 7.10 }, { vol: 6.20, ret: 7.28 },
  ],
  asignacion: [
    { clase: 'Renta Fija Local', actual: 50.0, optimo: 47.5 },
    { clase: 'Renta Fija Internacional', actual: 13.5, optimo: 15.0 },
    { clase: 'Renta Variable', actual: 9.9, optimo: 9.0 },
    { clase: 'Inmobiliario', actual: 12.1, optimo: 13.0 },
    { clase: 'Mutuos Hipotecarios', actual: 7.3, optimo: 9.5 },
    { clase: 'Alternativos', actual: 4.8, optimo: 5.0 },
    { clase: 'Caja y Equivalentes', actual: 2.5, optimo: 1.0 },
  ],
  restricciones: [
    { nombre: 'Renta variable total ≤ 40% (NCG 152)', limiteId: 'L1', estado: 'Holgada' },
    { nombre: 'Inversión en el extranjero ≤ 20% (NCG 152)', limiteId: 'L2', estado: 'Holgada' },
    { nombre: 'Descalce USD sin cobertura ≤ 8% (INV-08)', limiteId: 'L6', estado: 'Activa' },
    { nombre: 'Activos alternativos ≤ 7% (INV-01)', limiteId: 'L12', estado: 'Activa' },
    { nombre: 'Mutuos hipotecarios ≤ 30% (NCG 152)', limiteId: 'L7', estado: 'Holgada' },
    { nombre: 'Duración total 6,3 ± 0,5 años (objetivo ALM)', limiteId: null, estado: 'Activa' },
    { nombre: 'Índice de calce por tramo ≥ 90% (NCG 461)', limiteId: null, estado: 'Activa' },
  ],
  supuestos: 'Retornos esperados: consenso Estudios jun-2026. Covarianzas: ventana 36M con shrinkage Ledoit-Wolf. Costo de transacción 12 pb round-trip.',
};

const OPT_CORRIDAS = [
  { version: 'v2026.06', fecha: '25-06-2026', responsable: 'F. Riquelme', mejora: '+26 pb / −22 pb vol', estado: 'Presentada a Comité' },
  { version: 'v2026.03', fecha: '28-03-2026', responsable: 'F. Riquelme', mejora: '+18 pb / −10 pb vol', estado: 'Aprobada e implementada' },
  { version: 'v2025.12', fecha: '19-12-2025', responsable: 'C. Undurraga', mejora: '+22 pb / −15 pb vol', estado: 'Aprobada e implementada' },
];

const GLOSARIO = [
  { t: 'UF (Unidad de Fomento)', d: 'Unidad de cuenta reajustable por inflación usada en Chile; gran parte de la renta fija local y los pasivos de seguros de vida están denominados en UF.' },
  { t: 'Calce (ALM)', d: 'Gestión conjunta de activos y pasivos para que los flujos de la cartera cubran las obligaciones por tramos de plazo, según la NCG 461 de la CMF.' },
  { t: 'TSA — Test de Suficiencia de Activos', d: 'Ejercicio regulatorio que verifica que los activos que respaldan reservas técnicas son suficientes para pagar las obligaciones proyectadas, bajo escenario base y de estrés.' },
  { t: 'Reservas técnicas', d: 'Pasivos que reflejan las obligaciones con los asegurados. Deben estar respaldadas por inversiones "representativas" que cumplen requisitos de elegibilidad de la CMF.' },
  { t: 'NCG (Norma de Carácter General)', d: 'Normativa emitida por la CMF. Las relevantes para inversiones incluyen la NCG 152 (límites e inversiones representativas) y la NCG 461 (calce).' },
  { t: 'Duración', d: 'Sensibilidad del precio de un instrumento de renta fija ante cambios de tasa, expresada en años.' },
  { t: 'TIR / Yield', d: 'Tasa interna de retorno del instrumento a precio de mercado. En instrumentos en UF corresponde a tasa real; en pesos, a tasa nominal.' },
  { t: 'Tracking error', d: 'Volatilidad de la diferencia de retornos entre la cartera y su benchmark; mide qué tan activa es la gestión.' },
  { t: 'Patrimonio de riesgo', d: 'Exigencia patrimonial regulatoria de la aseguradora, determinada por la CMF en función de sus obligaciones y riesgos.' },
  { t: 'Mutuos hipotecarios endosables (MHE)', d: 'Créditos hipotecarios originados por administradoras y endosados a inversionistas institucionales; clase de activo tradicional de aseguradoras de vida chilenas.' },
];

/* ============================================================
   PLATAFORMA EXTENSIBLE — galería, propuestas y vistas de usuario
   ============================================================ */

/* Metadata de cada módulo para la galería: dueño del contenido,
   madurez y adopción (uso semanal % de usuarios activos) */
const MODULO_META = {
  inicio:         { owner: 'Producto Quant', estado: 'Oficial', adopcion: 98 },
  cartera:        { owner: 'Producto Quant', estado: 'Oficial', adopcion: 94 },
  resultados:     { owner: 'Producto Quant', estado: 'Oficial', adopcion: 92 },
  cumplimiento:   { owner: 'Riesgo · Producto Quant', estado: 'Oficial', adopcion: 88 },
  proyecciones:   { owner: 'Producto Quant', estado: 'Oficial', adopcion: 81 },
  modelos:        { owner: 'Actuarial', estado: 'Oficial', adopcion: 76 },
  derivados:      { owner: 'Tesorería', estado: 'Beta', adopcion: 72 },
  liquidez:       { owner: 'Tesorería', estado: 'Beta', adopcion: 69 },
  rrvv:           { owner: 'Actuarial · Comercial', estado: 'Beta', adopcion: 84 },
  relval:         { owner: 'Mesa de Inversiones', estado: 'Beta', adopcion: 66 },
  optimizacion:   { owner: 'Estudios', estado: 'Beta', adopcion: 61 },
  politicas:      { owner: 'Gerencia de Inversiones', estado: 'Oficial', adopcion: 73 },
  procedimientos: { owner: 'Gerencia de Inversiones', estado: 'Oficial', adopcion: 58 },
  faq:            { owner: 'Producto Quant', estado: 'Oficial', adopcion: 49 },
};

/* Propuestas de nuevas secciones hechas por usuarios (demo).
   Ciclo de vida: Propuesta → En revisión → Aprobada → Publicada */
const PROPUESTAS_BASE = [
  { id: 'PR-01', titulo: 'Panel de inversión ESG / sostenibilidad', detalle: 'Exposición de la cartera por score ESG, huella de carbono financiada y alineamiento con la taxonomía local. Insumo para el reporte anual de sostenibilidad.', owner: 'S. Márquez', area: 'Riesgo', votos: 12, estado: 'En revisión', fecha: '18-06-2026' },
  { id: 'PR-02', titulo: 'Dashboard de crédito privado', detalle: 'Seguimiento de la cartera de deuda privada: covenants, vencimientos, ratings internos y pipeline de originación junto a los fondos existentes.', owner: 'J. Errázuriz', area: 'Alternativos', votos: 15, estado: 'Aprobada — en construcción', fecha: '02-06-2026' },
  { id: 'PR-03', titulo: 'Monitor de emisiones primarias locales', detalle: 'Calendario de colocaciones de bonos locales con demanda, spreads de emisión y participación de la compañía en cada libro.', owner: 'Mesa RF', area: 'Mesa de Inversiones', votos: 9, estado: 'En revisión', fecha: '24-06-2026' },
  { id: 'PR-04', titulo: 'Reporte automático comité ALCO', detalle: 'Vista imprimible con el paquete estándar del comité ALCO: calce, TSA, liquidez y colaterales en una sola página exportable.', owner: 'C. Undurraga', area: 'Actuarial', votos: 8, estado: 'Propuesta', fecha: '29-06-2026' },
  { id: 'PR-05', titulo: 'Tipo de cambio y coberturas intradía', detalle: 'Posición USD intradía con forwards por vencer en la semana y sensibilidad del P&L al movimiento del día.', owner: 'P. Salazar', area: 'Tesorería', votos: 5, estado: 'Propuesta', fecha: '01-07-2026' },
];
